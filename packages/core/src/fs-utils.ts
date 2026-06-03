import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  isBinaryOrMediaPath,
  isExcludedDirName,
  isInside,
  isSecretLikePath,
  LARGE_LOCKFILE_BYTES,
  MAX_TEXT_FILE_BYTES,
  toPosixPath
} from "@repotutor/shared";

export interface WalkFile {
  absPath: string;
  relPath: string;
  size: number;
  ext: string;
  isTextCandidate: boolean;
}

export interface WalkResult {
  files: WalkFile[];
  folders: string[];
  totalBytes: number;
  excludedPaths: string[];
  secretCandidatePaths: string[];
}

export async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(target: string): Promise<void> {
  await fs.mkdir(target, { recursive: true });
}

export async function readTextIfSafe(absPath: string, maxBytes = MAX_TEXT_FILE_BYTES): Promise<string | null> {
  const stat = await fs.stat(absPath);
  if (stat.size > maxBytes) return null;
  if (isBinaryOrMediaPath(absPath) || isSecretLikePath(absPath)) return null;
  const buffer = await fs.readFile(absPath);
  if (buffer.includes(0)) return null;
  return buffer.toString("utf8");
}

export async function walkSafe(root: string, maxDepth = 8): Promise<WalkResult> {
  const files: WalkFile[] = [];
  const folders: string[] = [];
  const excludedPaths: string[] = [];
  const secretCandidatePaths: string[] = [];
  let totalBytes = 0;

  async function visit(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = toPosixPath(path.relative(root, abs));
      if (!rel || rel.startsWith("..")) continue;
      if (isSecretLikePath(rel)) {
        secretCandidatePaths.push(rel);
        excludedPaths.push(rel);
        continue;
      }
      if (entry.isDirectory()) {
        if (isExcludedDirName(entry.name)) {
          excludedPaths.push(rel);
          continue;
        }
        folders.push(rel);
        await visit(abs, depth + 1);
        continue;
      }
      if (!entry.isFile()) {
        excludedPaths.push(rel);
        continue;
      }
      const stat = await fs.stat(abs);
      totalBytes += stat.size;
      const ext = path.extname(entry.name).toLowerCase();
      const lockfileTooLarge = /lock\.(json|ya?ml)$|pnpm-lock\.yaml|yarn\.lock|package-lock\.json/.test(entry.name) && stat.size > LARGE_LOCKFILE_BYTES;
      const binary = isBinaryOrMediaPath(rel);
      if (binary || lockfileTooLarge) {
        excludedPaths.push(rel);
      }
      files.push({
        absPath: abs,
        relPath: rel,
        size: stat.size,
        ext,
        isTextCandidate: !binary && !lockfileTooLarge && stat.size <= MAX_TEXT_FILE_BYTES
      });
    }
  }

  await visit(root, 0);
  return { files, folders, totalBytes, excludedPaths, secretCandidatePaths };
}

export async function copySafeTree(sourceRoot: string, destRoot: string): Promise<WalkResult> {
  if (!isInside(sourceRoot, sourceRoot)) throw new Error("Invalid source root.");
  const walk = await walkSafe(sourceRoot);
  await ensureDir(destRoot);
  for (const folder of walk.folders) {
    await ensureDir(path.join(destRoot, folder));
  }
  for (const file of walk.files) {
    if (!file.isTextCandidate && isBinaryOrMediaPath(file.relPath)) continue;
    if (walk.secretCandidatePaths.includes(file.relPath)) continue;
    const dest = path.join(destRoot, file.relPath);
    await ensureDir(path.dirname(dest));
    await fs.copyFile(file.absPath, dest);
  }
  return walk;
}

export async function removeUnsafeSnapshotFiles(root: string): Promise<void> {
  const gitDir = path.join(root, ".git");
  if (await pathExists(gitDir)) {
    await fs.rm(gitDir, { recursive: true, force: true });
  }
  const walk = await walkSafe(root);
  for (const rel of walk.secretCandidatePaths) {
    await fs.rm(path.join(root, rel), { recursive: true, force: true });
  }
}

export async function runCommand(command: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const out = Buffer.concat(stdout).toString("utf8").trim();
      const err = Buffer.concat(stderr).toString("utf8").trim();
      if (code === 0) resolve({ stdout: out, stderr: err });
      else reject(new Error(`${command} ${args.join(" ")} failed with ${code}: ${err || out}`));
    });
  });
}

export function stableHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
