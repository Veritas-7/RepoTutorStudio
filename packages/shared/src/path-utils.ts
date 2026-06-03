import path from "node:path";
import { BINARY_OR_MEDIA_EXTENSIONS, EXCLUDED_DIR_NAMES, SECRET_FILE_PATTERNS } from "./constants.js";

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function slugPart(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "unknown";
}

export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function isSecretLikePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return SECRET_FILE_PATTERNS.some((pattern) => pattern.test(base) || pattern.test(filePath));
}

export function isExcludedDirName(name: string): boolean {
  return EXCLUDED_DIR_NAMES.has(name);
}

export function isBinaryOrMediaPath(filePath: string): boolean {
  return BINARY_OR_MEDIA_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function htmlAnchor(value: string): string {
  return slugPart(value).toLowerCase();
}

export function todayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sessionFolderName(owner: string, repo: string, branch: string, commitHash: string): string {
  return `${slugPart(owner)}__${slugPart(repo)}__${slugPart(branch)}__${slugPart(commitHash.slice(0, 8))}`;
}
