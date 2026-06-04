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
  "analysis/interface-map-report.json",
  "analysis/symbol-map-report.json",
  "analysis/api-reference-report.json",
  "analysis/search-index-report.json",
  "analysis/learning-journal-report.json",
  "analysis/project-activity-report.json",
  "analysis/license-rights-report.json",
  "analysis/sbom-report.json",
  "analysis/security-readiness-report.json",
  "analysis/scorecard-report.json",
  "analysis/provenance-report.json",
  "analysis/advisory-report.json",
  "analysis/vex-report.json",
  "analysis/policy-gate-report.json",
  "analysis/api-contract-report.json",
  "analysis/observability-report.json",
  "analysis/performance-report.json",
  "analysis/e2e-report.json",
  "analysis/accessibility-report.json",
  "analysis/storybook-report.json",
  "analysis/design-tokens-report.json",
  "analysis/i18n-report.json",
  "analysis/release-readiness-report.json",
  "analysis/secret-readiness-report.json",
  "analysis/container-readiness-report.json",
  "analysis/code-quality-report.json",
  "analysis/documentation-report.json",
  "analysis/database-readiness-report.json",
  "analysis/ci-cd-report.json",
  "analysis/unit-test-report.json",
  "analysis/typecheck-readiness-report.json",
  "analysis/package-manager-report.json",
  "analysis/git-hooks-report.json",
  "analysis/task-runner-report.json",
  "analysis/dependency-update-report.json",
  "analysis/lint-readiness-report.json",
  "analysis/format-readiness-report.json",
  "analysis/commit-conventions-report.json",
  "analysis/changelog-readiness-report.json",
  "analysis/bundle-analysis-report.json",
  "analysis/mocking-readiness-report.json",
  "analysis/data-fetching-readiness-report.json",
  "analysis/routing-readiness-report.json",
  "analysis/state-management-readiness-report.json",
  "analysis/form-readiness-report.json",
  "analysis/auth-readiness-report.json",
  "analysis/payment-readiness-report.json",
  "analysis/email-readiness-report.json",
  "analysis/queue-readiness-report.json",
  "analysis/cache-readiness-report.json",
  "analysis/logging-readiness-report.json",
  "analysis/feature-flag-readiness-report.json",
  "analysis/rate-limit-readiness-report.json",
  "analysis/error-tracking-readiness-report.json",
  "analysis/analytics-readiness-report.json",
  "analysis/http-client-readiness-report.json",
  "analysis/schema-validation-readiness-report.json",
  "analysis/datetime-readiness-report.json",
  "analysis/id-generation-readiness-report.json",
  "analysis/image-processing-readiness-report.json",
  "analysis/file-upload-readiness-report.json",
  "analysis/websocket-readiness-report.json",
  "analysis/pdf-generation-readiness-report.json",
  "analysis/spreadsheet-readiness-report.json",
  "analysis/chart-visualization-readiness-report.json",
  "analysis/context-pack-report.json",
  "analysis/mcp-handoff-report.json",
  "analysis/agent-memory-report.json",
  "analysis/graph-query-report.json",
  "analysis/tutorial-abstraction-report.json",
  "analysis/decision-record-report.json",
  "analysis/dependency-health-report.json",
  "markdown/overview.md",
  "markdown/evidence.md",
  "markdown/suggested-reads.md",
  "markdown/runtime-environment.md",
  "markdown/interface-map.md",
  "markdown/symbol-map.md",
  "markdown/api-reference.md",
  "markdown/search-index.md",
  "markdown/learning-journal.md",
  "markdown/project-activity.md",
  "markdown/license-rights.md",
  "markdown/sbom.md",
  "markdown/security-readiness.md",
  "markdown/scorecard.md",
  "markdown/provenance.md",
  "markdown/advisories.md",
  "markdown/vex.md",
  "markdown/policy-gates.md",
  "markdown/api-contracts.md",
  "markdown/observability.md",
  "markdown/performance.md",
  "markdown/e2e.md",
  "markdown/accessibility.md",
  "markdown/storybook.md",
  "markdown/design-tokens.md",
  "markdown/i18n.md",
  "markdown/release-readiness.md",
  "markdown/secret-readiness.md",
  "markdown/container-readiness.md",
  "markdown/code-quality.md",
  "markdown/documentation.md",
  "markdown/database-readiness.md",
  "markdown/ci-cd.md",
  "markdown/unit-tests.md",
  "markdown/typecheck-readiness.md",
  "markdown/package-manager.md",
  "markdown/git-hooks.md",
  "markdown/task-runner.md",
  "markdown/dependency-updates.md",
  "markdown/lint-readiness.md",
  "markdown/format-readiness.md",
  "markdown/commit-conventions.md",
  "markdown/changelog-readiness.md",
  "markdown/bundle-analysis.md",
  "markdown/mocking-readiness.md",
  "markdown/data-fetching-readiness.md",
  "markdown/routing-readiness.md",
  "markdown/state-management-readiness.md",
  "markdown/form-readiness.md",
  "markdown/auth-readiness.md",
  "markdown/payment-readiness.md",
  "markdown/email-readiness.md",
  "markdown/queue-readiness.md",
  "markdown/cache-readiness.md",
  "markdown/logging-readiness.md",
  "markdown/feature-flag-readiness.md",
  "markdown/rate-limit-readiness.md",
  "markdown/error-tracking-readiness.md",
  "markdown/analytics-readiness.md",
  "markdown/http-client-readiness.md",
  "markdown/schema-validation-readiness.md",
  "markdown/datetime-readiness.md",
  "markdown/id-generation-readiness.md",
  "markdown/image-processing-readiness.md",
  "markdown/file-upload-readiness.md",
  "markdown/websocket-readiness.md",
  "markdown/pdf-generation-readiness.md",
  "markdown/spreadsheet-readiness.md",
  "markdown/chart-visualization-readiness.md",
  "markdown/context-pack.md",
  "markdown/mcp-handoff.md",
  "markdown/agent-memory.md",
  "markdown/graph-query.md",
  "markdown/tutorial-abstractions.md",
  "markdown/decision-records.md",
  "markdown/dependency-health.md",
  "html/index.html",
  "html/learning-path.html",
  "html/files.html",
  "html/evidence.html",
  "html/suggested-reads.html",
  "html/runtime-environment.html",
  "html/interface-map.html",
  "html/symbol-map.html",
  "html/api-reference.html",
  "html/search-index.html",
  "html/learning-journal.html",
  "html/project-activity.html",
  "html/license-rights.html",
  "html/sbom.html",
  "html/security-readiness.html",
  "html/scorecard.html",
  "html/provenance.html",
  "html/advisories.html",
  "html/vex.html",
  "html/policy-gates.html",
  "html/api-contracts.html",
  "html/observability.html",
  "html/performance.html",
  "html/e2e.html",
  "html/accessibility.html",
  "html/storybook.html",
  "html/design-tokens.html",
  "html/i18n.html",
  "html/release-readiness.html",
  "html/secret-readiness.html",
  "html/container-readiness.html",
  "html/code-quality.html",
  "html/documentation.html",
  "html/database-readiness.html",
  "html/ci-cd.html",
  "html/unit-tests.html",
  "html/typecheck-readiness.html",
  "html/package-manager.html",
  "html/git-hooks.html",
  "html/task-runner.html",
  "html/dependency-updates.html",
  "html/lint-readiness.html",
  "html/format-readiness.html",
  "html/commit-conventions.html",
  "html/changelog-readiness.html",
  "html/bundle-analysis.html",
  "html/mocking-readiness.html",
  "html/data-fetching-readiness.html",
  "html/routing-readiness.html",
  "html/state-management-readiness.html",
  "html/form-readiness.html",
  "html/auth-readiness.html",
  "html/payment-readiness.html",
  "html/email-readiness.html",
  "html/queue-readiness.html",
  "html/cache-readiness.html",
  "html/logging-readiness.html",
  "html/feature-flag-readiness.html",
  "html/rate-limit-readiness.html",
  "html/error-tracking-readiness.html",
  "html/analytics-readiness.html",
  "html/http-client-readiness.html",
  "html/schema-validation-readiness.html",
  "html/datetime-readiness.html",
  "html/id-generation-readiness.html",
  "html/image-processing-readiness.html",
  "html/file-upload-readiness.html",
  "html/websocket-readiness.html",
  "html/pdf-generation-readiness.html",
  "html/spreadsheet-readiness.html",
  "html/chart-visualization-readiness.html",
  "html/context-pack.html",
  "html/mcp-handoff.html",
  "html/agent-memory.html",
  "html/graph-query.html",
  "html/tutorial-abstractions.html",
  "html/decision-records.html",
  "html/dependency-health.html",
  "html/quiz-print.html",
  "html/assets/search-index.json",
  "html/assets/learning-journal-template.md",
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
