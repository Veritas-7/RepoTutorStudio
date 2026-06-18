import fs from "node:fs/promises";
import path from "node:path";
import { EvidenceIndexReportSchema, type EvidenceIndexReport } from "@repotutor/shared";

export type EvidenceVerificationReason =
  | "missing-report"
  | "invalid-report"
  | "count-mismatch"
  | "unsafe-path"
  | "missing-source-path"
  | "missing-source-href"
  | "invalid-lesson-href"
  | "missing-lesson-file"
  | "missing-lesson-anchor";

export interface EvidenceVerificationFailure {
  reason: EvidenceVerificationReason;
  path: string;
  filePath?: string;
  line?: number;
  detail?: string;
}

export interface EvidenceVerificationResult {
  ok: boolean;
  reportPath: string;
  sourcePruned: boolean;
  checkedItems: number;
  checkedSourceFiles: number;
  checkedSourceLinks: number;
  checkedLessonLinks: number;
  skippedPrunedSourceLinks: number;
  failures: EvidenceVerificationFailure[];
}

export async function verifyEvidenceIndexReport(sessionRoot: string): Promise<EvidenceVerificationResult> {
  const resolvedRoot = path.resolve(sessionRoot);
  const reportPath = path.join(resolvedRoot, "analysis", "evidence-index-report.json");
  const sourcePruned = await isSourcePruned(resolvedRoot);
  const failures: EvidenceVerificationFailure[] = [];
  const report = await readEvidenceReport(reportPath, failures);
  if (!report) return result(reportPath, sourcePruned, 0, 0, 0, 0, 0, failures);

  if (report.totalEvidenceItems !== report.items.length) {
    failures.push({
      reason: "count-mismatch",
      path: "analysis/evidence-index-report.json",
      detail: `totalEvidenceItems is ${report.totalEvidenceItems}, but items length is ${report.items.length}.`
    });
  }

  const sourcePaths = new Set<string>();
  const sourceLinks = new Set<string>();
  const lessonLinks = new Set<string>();
  let skippedPrunedSourceLinks = 0;

  for (const item of report.items) {
    sourcePaths.add(item.sourcePath);
    sourceLinks.add(item.sourceHref);
    lessonLinks.add(item.lessonHref);
    skippedPrunedSourceLinks += await checkExistingPath(resolvedRoot, item.sourcePath, "missing-source-path", failures, item, sourcePruned);
    skippedPrunedSourceLinks += await checkExistingPath(resolvedRoot, item.sourceHref, "missing-source-href", failures, item, sourcePruned);
    await checkLessonHref(resolvedRoot, item, failures);
  }

  return result(reportPath, sourcePruned, report.items.length, sourcePaths.size, sourceLinks.size, lessonLinks.size, skippedPrunedSourceLinks, failures);
}

async function readEvidenceReport(reportPath: string, failures: EvidenceVerificationFailure[]): Promise<EvidenceIndexReport | null> {
  let raw: string;
  try {
    raw = await fs.readFile(reportPath, "utf8");
  } catch {
    failures.push({ reason: "missing-report", path: "analysis/evidence-index-report.json" });
    return null;
  }

  try {
    return EvidenceIndexReportSchema.parse(JSON.parse(raw));
  } catch (error) {
    failures.push({
      reason: "invalid-report",
      path: "analysis/evidence-index-report.json",
      detail: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

async function checkExistingPath(
  sessionRoot: string,
  relativePath: string,
  reason: "missing-source-path" | "missing-source-href",
  failures: EvidenceVerificationFailure[],
  item: EvidenceIndexReport["items"][number],
  sourcePruned: boolean
): Promise<number> {
  const resolved = resolveSessionRelative(sessionRoot, stripAnchor(relativePath));
  if (!resolved.safe) {
    failures.push(itemFailure("unsafe-path", relativePath, item, resolved.detail));
    return 0;
  }
  if (sourcePruned && stripAnchor(relativePath).startsWith("source/")) {
    return 1;
  }
  try {
    await fs.access(resolved.absPath);
  } catch {
    failures.push(itemFailure(reason, relativePath, item));
  }
  return 0;
}

async function checkLessonHref(
  sessionRoot: string,
  item: EvidenceIndexReport["items"][number],
  failures: EvidenceVerificationFailure[]
): Promise<void> {
  const href = splitHref(item.lessonHref);
  if (!href.path || !href.anchor) {
    failures.push(itemFailure("invalid-lesson-href", item.lessonHref, item, "Lesson href must include a file path and #anchor."));
    return;
  }

  const resolved = resolveSessionRelative(sessionRoot, href.path);
  if (!resolved.safe) {
    failures.push(itemFailure("unsafe-path", item.lessonHref, item, resolved.detail));
    return;
  }

  let html: string;
  try {
    html = await fs.readFile(resolved.absPath, "utf8");
  } catch {
    failures.push(itemFailure("missing-lesson-file", href.path, item));
    return;
  }

  if (!hasHtmlId(html, href.anchor)) {
    failures.push(itemFailure("missing-lesson-anchor", item.lessonHref, item));
  }
}

export async function isSourcePruned(sessionRoot: string): Promise<boolean> {
  try {
    await fs.access(path.join(sessionRoot, "analysis", "source-prune-applied.json"));
    await fs.access(path.join(sessionRoot, "SOURCE-PRUNED.md"));
    return true;
  } catch {
    return false;
  }
}

function result(
  reportPath: string,
  sourcePruned: boolean,
  checkedItems: number,
  checkedSourceFiles: number,
  checkedSourceLinks: number,
  checkedLessonLinks: number,
  skippedPrunedSourceLinks: number,
  failures: EvidenceVerificationFailure[]
): EvidenceVerificationResult {
  return {
    ok: failures.length === 0,
    reportPath,
    sourcePruned,
    checkedItems,
    checkedSourceFiles,
    checkedSourceLinks,
    checkedLessonLinks,
    skippedPrunedSourceLinks,
    failures
  };
}

function resolveSessionRelative(sessionRoot: string, relativePath: string): { safe: true; absPath: string } | { safe: false; detail: string } {
  let decoded: string;
  try {
    decoded = relativePath.split("/").map((part) => decodeURIComponent(part)).join("/");
  } catch {
    return { safe: false, detail: "Path is not valid percent-encoded UTF-8." };
  }
  const absPath = path.resolve(sessionRoot, decoded);
  const relative = path.relative(sessionRoot, absPath);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return { safe: true, absPath };
  }
  return { safe: false, detail: "Path escapes the session root." };
}

function splitHref(href: string): { path: string; anchor: string | null } {
  const hashIndex = href.indexOf("#");
  if (hashIndex < 0) return { path: href, anchor: null };
  return {
    path: href.slice(0, hashIndex),
    anchor: href.slice(hashIndex + 1) || null
  };
}

function stripAnchor(value: string): string {
  return splitHref(value).path;
}

function hasHtmlId(html: string, anchor: string): boolean {
  const escaped = escapeRegExp(anchor);
  return new RegExp(`\\bid=(["'])${escaped}\\1`).test(html);
}

function itemFailure(
  reason: EvidenceVerificationReason,
  failurePath: string,
  item: EvidenceIndexReport["items"][number],
  detail?: string
): EvidenceVerificationFailure {
  return {
    reason,
    path: failurePath,
    filePath: item.filePath,
    line: item.line,
    detail
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
