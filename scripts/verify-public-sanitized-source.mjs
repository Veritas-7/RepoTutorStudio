#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.env.REPOTUTOR_PUBLIC_SNAPSHOT_DIR
  ? path.resolve(process.env.REPOTUTOR_PUBLIC_SNAPSHOT_DIR)
  : fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-public-source-"));

const deniedPathPatterns = [
  /^working\.md$/,
  /^studies(?:\/|$)/,
  /^apps\/cli\/studies(?:\/|$)/,
  /^docs\/audits\/generated(?:\/|$)/,
  /^docs\/audits\/compliance-audit-\d+.*\.(?:json|md)$/,
  /^research\/external-src(?:\/|$)/,
  /^\.env(?:\.|$)/,
  /(?:^|\/)(?:credentials|tokens|secrets)\.(?:json|env)$/,
  /(?:^|\/).*\.pem$/,
  /(?:^|\/).*\.key$/,
  /(?:^|\/)id_rsa$/,
];

const allowedFiles = listPublicSourceFiles();

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

for (const relativeFile of allowedFiles) {
  const sourceFile = path.join(root, relativeFile);
  if (!fs.existsSync(sourceFile) || !fs.statSync(sourceFile).isFile()) {
    continue;
  }
  const targetFile = path.join(outDir, relativeFile);
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
}

const forbiddenFiles = collectFiles(outDir).filter((file) => isDeniedPublicPath(path.relative(outDir, file)));
if (forbiddenFiles.length > 0) {
  throw new Error(`sanitized source snapshot included forbidden paths: ${forbiddenFiles.join(", ")}`);
}

const scan = spawnSync("gitleaks", ["dir", outDir, "--redact", "--no-banner"], {
  encoding: "utf8",
});
if (scan.status !== 0) {
  throw new Error(`gitleaks dir ${outDir} failed:\n${scan.stdout}${scan.stderr}`);
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    outDir,
    files: allowedFiles.length,
    excluded: deniedPathPatterns.map((pattern) => pattern.source),
    command: "gitleaks dir <sanitized-source> --redact --no-banner",
  },
}, null, 2));

function listPublicSourceFiles() {
  const result = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) => file.replace(/\\/g, "/"))
    .filter((file) => !isDeniedPublicPath(file))
    .sort();
}

function isDeniedPublicPath(relativeFile) {
  const normalized = relativeFile.replace(/\\/g, "/");
  return deniedPathPatterns.some((pattern) => pattern.test(normalized));
}

function collectFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(absolute));
    } else if (entry.isFile()) {
      files.push(absolute);
    }
  }
  return files;
}
