import fs from "node:fs/promises";
import path from "node:path";
import { StudySessionSchema, type StudySession } from "@repotutor/shared";
import { verifyEvidenceIndexReport, type EvidenceVerificationResult } from "./evidence.js";
import { verifyHtmlExportManifest, type HtmlExportVerificationResult } from "./exporter.js";

export type StudySessionVerificationReason =
  | "missing-session"
  | "invalid-session"
  | "incomplete-session"
  | "missing-artifact"
  | "html-export-error"
  | "html-export-failed"
  | "evidence-index-failed";

export interface StudySessionVerificationFailure {
  check: "session" | "required-artifacts" | "html-export" | "evidence-index";
  reason: StudySessionVerificationReason;
  path: string;
  detail?: string;
}

export interface StudySessionVerificationResult {
  ok: boolean;
  sessionRoot: string;
  sessionId: string | null;
  checkedRequiredArtifacts: number;
  checks: {
    session: boolean;
    requiredArtifacts: boolean;
    htmlExport: boolean;
    evidenceIndex: boolean;
  };
  htmlExport: HtmlExportVerificationResult | null;
  evidenceIndex: EvidenceVerificationResult | null;
  failures: StudySessionVerificationFailure[];
}

const REQUIRED_ARTIFACTS = [
  "session.json",
  "analysis/repo-map.json",
  "analysis/file-lessons.json",
  "analysis/evidence-index-report.json",
  "analysis/suggested-reads-report.json",
  "analysis/runtime-environment-report.json",
  "markdown/overview.md",
  "markdown/evidence.md",
  "markdown/suggested-reads.md",
  "markdown/runtime-environment.md",
  "html/index.html",
  "html/learning-path.html",
  "html/files.html",
  "html/evidence.html",
  "html/suggested-reads.html",
  "html/runtime-environment.html",
  "html/quiz-print.html",
  "html/manifest.json",
  "html/EXPORT-README.md"
];

export async function verifyStudySessionArtifacts(sessionRoot: string): Promise<StudySessionVerificationResult> {
  const resolvedRoot = path.resolve(sessionRoot);
  const failures: StudySessionVerificationFailure[] = [];
  const session = await readSession(resolvedRoot, failures);
  const requiredArtifactsOk = await checkRequiredArtifacts(resolvedRoot, failures);
  const htmlExport = await verifyHtml(resolvedRoot, failures);
  const evidenceIndex = await verifyEvidenceIndexReport(resolvedRoot);

  for (const failure of evidenceIndex.failures) {
    failures.push({
      check: "evidence-index",
      reason: "evidence-index-failed",
      path: failure.path,
      detail: failure.detail ?? failure.reason
    });
  }

  const sessionOk = Boolean(session && session.status === "complete");
  if (session && session.status !== "complete") {
    failures.push({
      check: "session",
      reason: "incomplete-session",
      path: "session.json",
      detail: `Session status is ${session.status}.`
    });
  }

  const checks = {
    session: sessionOk,
    requiredArtifacts: requiredArtifactsOk,
    htmlExport: htmlExport?.ok ?? false,
    evidenceIndex: evidenceIndex.ok
  };

  return {
    ok: checks.session && checks.requiredArtifacts && checks.htmlExport && checks.evidenceIndex,
    sessionRoot: resolvedRoot,
    sessionId: session?.sessionId ?? null,
    checkedRequiredArtifacts: REQUIRED_ARTIFACTS.length,
    checks,
    htmlExport,
    evidenceIndex,
    failures
  };
}

async function readSession(sessionRoot: string, failures: StudySessionVerificationFailure[]): Promise<StudySession | null> {
  const sessionPath = path.join(sessionRoot, "session.json");
  let raw: string;
  try {
    raw = await fs.readFile(sessionPath, "utf8");
  } catch {
    failures.push({ check: "session", reason: "missing-session", path: "session.json" });
    return null;
  }

  try {
    return StudySessionSchema.parse(JSON.parse(raw));
  } catch (error) {
    failures.push({
      check: "session",
      reason: "invalid-session",
      path: "session.json",
      detail: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

async function checkRequiredArtifacts(sessionRoot: string, failures: StudySessionVerificationFailure[]): Promise<boolean> {
  let ok = true;
  for (const artifactPath of REQUIRED_ARTIFACTS) {
    try {
      await fs.access(path.join(sessionRoot, artifactPath));
    } catch {
      ok = false;
      failures.push({
        check: "required-artifacts",
        reason: "missing-artifact",
        path: artifactPath
      });
    }
  }
  return ok;
}

async function verifyHtml(sessionRoot: string, failures: StudySessionVerificationFailure[]): Promise<HtmlExportVerificationResult | null> {
  try {
    const result = await verifyHtmlExportManifest(sessionRoot);
    for (const failure of result.failures) {
      failures.push({
        check: "html-export",
        reason: "html-export-failed",
        path: failure.path,
        detail: `expected ${failure.expectedBytes} bytes/${failure.expectedSha256}; actual ${failure.actualBytes ?? "missing"} bytes/${failure.actualSha256 ?? "missing"}`
      });
    }
    return result;
  } catch (error) {
    failures.push({
      check: "html-export",
      reason: "html-export-error",
      path: "html/manifest.json",
      detail: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}
