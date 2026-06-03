import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { HtmlExportManifest } from "@repotutor/shared";
import { ensureDir } from "./fs-utils.js";

interface ZipEntry {
  absPath: string;
  relPath: string;
  data: Buffer;
  crc32: number;
  dosTime: number;
  dosDate: number;
  offset: number;
}

export interface ZipBundleResult {
  zipPath: string;
  fileCount: number;
  bytes: number;
}

export interface HtmlExportVerificationFailure {
  path: string;
  expectedBytes: number;
  actualBytes: number | null;
  expectedSha256: string;
  actualSha256: string | null;
}

export interface HtmlExportVerificationResult {
  ok: boolean;
  manifestPath: string;
  checkedFiles: number;
  failures: HtmlExportVerificationFailure[];
}

export async function writeHtmlZipBundle(sessionRoot: string): Promise<ZipBundleResult> {
  const htmlRoot = path.join(sessionRoot, "html");
  const exportRoot = path.join(sessionRoot, "exports");
  const zipPath = path.join(exportRoot, "html-report.zip");
  await ensureDir(exportRoot);
  const bytes = await writeZipFromDirectory(htmlRoot, zipPath);
  return {
    zipPath,
    fileCount: (await listFiles(htmlRoot)).length,
    bytes
  };
}

export async function verifyHtmlExportManifest(sessionRoot: string): Promise<HtmlExportVerificationResult> {
  const manifestPath = path.join(sessionRoot, "html", "manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as HtmlExportManifest;
  const entries = [
    ...manifest.pages.map((page) => ({ path: page.path, bytes: page.bytes, sha256: page.sha256 })),
    ...manifest.assets.map((asset) => ({ path: asset.path, bytes: asset.bytes, sha256: asset.sha256 }))
  ];
  const failures: HtmlExportVerificationFailure[] = [];

  for (const entry of entries) {
    const absPath = htmlEntryPath(sessionRoot, entry.path);
    try {
      const data = await fs.readFile(absPath);
      const actualSha256 = crypto.createHash("sha256").update(data).digest("hex");
      if (data.length !== entry.bytes || actualSha256 !== entry.sha256) {
        failures.push({
          path: entry.path,
          expectedBytes: entry.bytes,
          actualBytes: data.length,
          expectedSha256: entry.sha256,
          actualSha256
        });
      }
    } catch {
      failures.push({
        path: entry.path,
        expectedBytes: entry.bytes,
        actualBytes: null,
        expectedSha256: entry.sha256,
        actualSha256: null
      });
    }
  }

  return {
    ok: failures.length === 0 && entries.length === manifest.integrity.coveredFiles,
    manifestPath,
    checkedFiles: entries.length,
    failures
  };
}

function htmlEntryPath(sessionRoot: string, entryPath: string): string {
  const htmlRelative = entryPath.startsWith("html/") ? entryPath.slice("html/".length) : entryPath;
  return path.join(sessionRoot, "html", htmlRelative);
}

async function writeZipFromDirectory(sourceRoot: string, zipPath: string): Promise<number> {
  const files = await listFiles(sourceRoot);
  const chunks: Buffer[] = [];
  const entries: ZipEntry[] = [];
  let offset = 0;

  for (const file of files) {
    const stat = await fs.stat(file.absPath);
    const data = await fs.readFile(file.absPath);
    const { dosTime, dosDate } = toDosDateTime(stat.mtime);
    const entry: ZipEntry = {
      ...file,
      data,
      crc32: crc32(data),
      dosTime,
      dosDate,
      offset
    };
    const localHeader = localFileHeader(entry);
    chunks.push(localHeader, data);
    offset += localHeader.length + data.length;
    entries.push(entry);
  }

  const centralStart = offset;
  for (const entry of entries) {
    const centralHeader = centralDirectoryHeader(entry);
    chunks.push(centralHeader);
    offset += centralHeader.length;
  }
  const centralSize = offset - centralStart;
  const endRecord = endOfCentralDirectory(entries.length, centralSize, centralStart);
  chunks.push(endRecord);
  offset += endRecord.length;

  await fs.writeFile(zipPath, Buffer.concat(chunks, offset));
  return offset;
}

async function listFiles(root: string): Promise<Array<{ absPath: string; relPath: string }>> {
  const result: Array<{ absPath: string; relPath: string }> = [];
  async function visit(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(absPath);
      } else if (entry.isFile()) {
        result.push({
          absPath,
          relPath: path.relative(root, absPath).split(path.sep).join("/")
        });
      }
    }
  }
  await visit(root);
  return result.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

function localFileHeader(entry: ZipEntry): Buffer {
  const name = Buffer.from(entry.relPath, "utf8");
  const header = Buffer.alloc(30 + name.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(entry.dosTime, 10);
  header.writeUInt16LE(entry.dosDate, 12);
  header.writeUInt32LE(entry.crc32, 14);
  header.writeUInt32LE(entry.data.length, 18);
  header.writeUInt32LE(entry.data.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  name.copy(header, 30);
  return header;
}

function centralDirectoryHeader(entry: ZipEntry): Buffer {
  const name = Buffer.from(entry.relPath, "utf8");
  const header = Buffer.alloc(46 + name.length);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(entry.dosTime, 12);
  header.writeUInt16LE(entry.dosDate, 14);
  header.writeUInt32LE(entry.crc32, 16);
  header.writeUInt32LE(entry.data.length, 20);
  header.writeUInt32LE(entry.data.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.offset, 42);
  name.copy(header, 46);
  return header;
}

function endOfCentralDirectory(entryCount: number, centralSize: number, centralStart: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(entryCount, 8);
  header.writeUInt16LE(entryCount, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralStart, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

function toDosDateTime(date: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, date.getFullYear());
  return {
    dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    dosDate: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  return crc >>> 0;
});
