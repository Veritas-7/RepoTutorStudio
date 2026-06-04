import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculateQuizCount, runStudy, verifyEvidenceIndexReport, verifyHtmlExportManifest, verifyStudySessionArtifacts, writeHtmlZipBundle } from "./index.js";

const fixtureRoot = path.resolve("packages/core/tests/fixtures/simple-ts-app");

describe("RepoTutor core pipeline", () => {
  it("generates a complete study session for a TypeScript fixture", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-study-"));
    const result = await runStudy({ source: fixtureRoot, mode: "quick", level: "beginner", studiesRoot });
    expect(result.session.status).toBe("complete");
    expect(result.session.quizSummary.totalQuestions).toBeGreaterThanOrEqual(5);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "repo-map.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "evidence-index-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "suggested-reads-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "runtime-environment-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "interface-map-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "symbol-map-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "api-reference-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "search-index-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "learning-journal-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "project-activity-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "license-rights-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "sbom-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "security-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "scorecard-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "provenance-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "advisory-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "vex-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "policy-gate-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "api-contract-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "observability-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "performance-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "e2e-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "accessibility-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "storybook-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "design-tokens-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "i18n-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "release-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "secret-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "container-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-quality-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "documentation-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "database-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "ci-cd-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "unit-test-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "typecheck-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "package-manager-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "git-hooks-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "task-runner-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "dependency-update-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "lint-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "format-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "commit-conventions-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "changelog-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "bundle-analysis-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "mocking-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-fetching-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "routing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "state-management-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "form-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "auth-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "payment-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "email-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "queue-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "cache-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "logging-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "feature-flag-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "rate-limit-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "error-tracking-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "analytics-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "http-client-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "schema-validation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "datetime-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "id-generation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "image-processing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "file-upload-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "websocket-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "pdf-generation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "spreadsheet-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "chart-visualization-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "diagram-rendering-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "link-integrity-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "seo-metadata-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "pwa-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "browser-compat-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "env-validation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "security-headers-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "graphql-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "cli-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "rpc-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "workspace-graph-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "scaffolding-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "scheduler-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "build-tool-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "styling-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "visual-regression-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "infrastructure-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "deployment-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "serverless-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "mobile-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "edge-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "compose-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "devcontainer-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "kubernetes-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "gitops-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "context-pack-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "mcp-handoff-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "agent-memory-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "graph-query-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "tutorial-abstraction-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "decision-record-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "dependency-health-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "session-verification-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "overview.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "component-graph.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "incremental.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "evidence.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "suggested-reads.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "runtime-environment.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "interface-map.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "symbol-map.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "api-reference.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "search-index.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "learning-journal.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "project-activity.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "license-rights.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "sbom.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "security-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "scorecard.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "provenance.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "advisories.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "vex.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "policy-gates.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "api-contracts.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "observability.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "performance.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "e2e.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "accessibility.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "storybook.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "design-tokens.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "i18n.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "release-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "secret-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "container-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-quality.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "documentation.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "database-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "ci-cd.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "unit-tests.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "typecheck-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "package-manager.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "git-hooks.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "task-runner.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "dependency-updates.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "lint-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "format-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "commit-conventions.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "changelog-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "bundle-analysis.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mocking-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-fetching-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "routing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "state-management-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "form-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "auth-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "payment-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "email-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "queue-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "cache-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "logging-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "feature-flag-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "rate-limit-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "error-tracking-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "analytics-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "http-client-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "schema-validation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "datetime-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "id-generation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "image-processing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "file-upload-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "websocket-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "pdf-generation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "spreadsheet-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "chart-visualization-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "diagram-rendering-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "link-integrity-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "seo-metadata-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "pwa-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "browser-compat-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "env-validation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "security-headers-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "graphql-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "cli-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "rpc-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "workspace-graph-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "scaffolding-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "scheduler-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "build-tool-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "styling-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "visual-regression-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "infrastructure-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "deployment-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "serverless-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mobile-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "edge-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "compose-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "devcontainer-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "kubernetes-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "gitops-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "context-pack.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mcp-handoff.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "agent-memory.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "graph-query.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "tutorial-abstractions.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "decision-records.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "dependency-health.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "session-verification.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "learning-path.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "manifest.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "EXPORT-README.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "component-graph.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "incremental.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "evidence.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "suggested-reads.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "runtime-environment.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "interface-map.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "symbol-map.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "api-reference.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "search-index.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "learning-journal.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "project-activity.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "license-rights.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "sbom.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "security-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "scorecard.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "provenance.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "advisories.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "vex.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "policy-gates.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "api-contracts.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "observability.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "performance.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "e2e.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "accessibility.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "storybook.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "design-tokens.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "i18n.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "release-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "secret-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "container-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-quality.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "documentation.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "database-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "ci-cd.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "unit-tests.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "typecheck-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "package-manager.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "git-hooks.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "task-runner.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "dependency-updates.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "lint-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "format-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "commit-conventions.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "changelog-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "bundle-analysis.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mocking-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-fetching-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "routing-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "state-management-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "form-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "auth-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "payment-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "email-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "queue-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "cache-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "logging-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "feature-flag-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "rate-limit-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "error-tracking-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "datetime-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "id-generation-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "image-processing-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "file-upload-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "websocket-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "pdf-generation-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "spreadsheet-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "chart-visualization-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "diagram-rendering-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "link-integrity-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "seo-metadata-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "pwa-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "browser-compat-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "env-validation-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "security-headers-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "graphql-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "cli-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "server-framework-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "rpc-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "workspace-graph-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "scaffolding-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "scheduler-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "build-tool-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "styling-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "visual-regression-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "infrastructure-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "deployment-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "serverless-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mobile-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "edge-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "compose-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "devcontainer-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "kubernetes-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "gitops-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "context-pack.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mcp-handoff.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "agent-memory.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "graph-query.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "tutorial-abstractions.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "decision-records.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "dependency-health.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "session-verification.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "quiz-print.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "assets", "learning-journal-template.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.codex, "events.jsonl"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.source, ".env"))).rejects.toThrow();
    const snapshotText = await fs.readFile(path.join(result.session.outputPaths.analysis, "source-snapshot-report.json"), "utf8");
    expect(snapshotText).toContain("\"sha256\"");
    const coverageText = await fs.readFile(path.join(result.session.outputPaths.analysis, "coverage-report.json"), "utf8");
    expect(coverageText).toContain("\"evidenceBackedFiles\"");
    expect(coverageText).toContain("\"evidenceCoverageRatio\"");
    expect(coverageText).toContain("\"evidenceKindCounts\"");
    const incrementalText = await fs.readFile(path.join(result.session.outputPaths.analysis, "incremental-report.json"), "utf8");
    expect(incrementalText).toContain("\"baselineSessionId\"");
    expect(incrementalText).toContain("\"coverageDelta\"");
    const graphText = await fs.readFile(path.join(result.session.outputPaths.analysis, "component-graph-report.json"), "utf8");
    expect(graphText).toContain("\"nodes\"");
    expect(graphText).toContain("\"edges\"");
    expect(graphText).toContain("\"nodeTypeCounts\"");
    expect(graphText).toContain("\"topConnectedNodes\"");
    const componentGraphMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "component-graph.md"), "utf8");
    expect(componentGraphMarkdown).toContain("## 큰 그래프 요약");
    const componentGraphHtml = await fs.readFile(path.join(result.session.outputPaths.html, "component-graph.html"), "utf8");
    expect(componentGraphHtml).toContain("큰 그래프 요약");
    expect(componentGraphHtml).toContain("data-graph-filter");
    expect(componentGraphHtml).toContain("data-node-type");
    expect(componentGraphHtml).toContain("component-graph-download-toolbar");
    expect(componentGraphHtml).toContain("data-download-mermaid");
    expect(componentGraphHtml).toContain("component-graph-mermaid");
    expect(componentGraphHtml).toContain("component-node-relations");
    expect(componentGraphHtml).toContain("data-node-relation");
    expect(componentGraphHtml).toContain("연결 관계");
    expect(componentGraphHtml).toContain("component-node-anchor");
    expect(componentGraphHtml).toContain("data-node-id");
    expect(componentGraphHtml).toContain("data-node-link");
    expect(componentGraphHtml).toContain("href=\"#component-node-");
    const componentGraphMermaid = await fs.readFile(path.join(result.session.outputPaths.html, "assets", "component-graph.mmd"), "utf8");
    expect(componentGraphMermaid).toContain("flowchart");
    const learningPathTourText = await fs.readFile(path.join(result.session.outputPaths.html, "assets", "learning-path.tour.json"), "utf8");
    expect(learningPathTourText).toContain("RepoTutor Learning Path");
    expect(learningPathTourText).toContain("\"isPrimary\": true");
    expect(learningPathTourText).toContain("\"file\": \"html/component-graph.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/dependency-health.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/api-reference.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/search-index.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/learning-journal.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/project-activity.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/license-rights.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/sbom.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/security-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/scorecard.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/provenance.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/advisories.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/vex.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/policy-gates.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/api-contracts.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/observability.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/performance.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/e2e.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/accessibility.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/storybook.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/design-tokens.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/i18n.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/release-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/secret-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/container-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/code-quality.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/documentation.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/database-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/ci-cd.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/unit-tests.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/typecheck-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/package-manager.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/git-hooks.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/task-runner.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/dependency-updates.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/lint-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/format-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/commit-conventions.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/changelog-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/bundle-analysis.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/mocking-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/data-fetching-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/routing-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/state-management-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/form-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/auth-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/payment-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/email-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/queue-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/cache-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/logging-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/feature-flag-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/rate-limit-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/error-tracking-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/schema-validation-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/datetime-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/id-generation-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/image-processing-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/file-upload-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/websocket-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/pdf-generation-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/spreadsheet-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/chart-visualization-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/diagram-rendering-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/link-integrity-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/seo-metadata-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/pwa-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/browser-compat-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/env-validation-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/security-headers-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/graphql-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/cli-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/llm-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/server-framework-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/rpc-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/workspace-graph-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/scaffolding-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/scheduler-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/build-tool-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/styling-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/visual-regression-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/infrastructure-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/deployment-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/serverless-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/mobile-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/edge-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/compose-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/devcontainer-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/kubernetes-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/gitops-readiness.html\"");
    const coverageHtml = await fs.readFile(path.join(result.session.outputPaths.html, "coverage.html"), "utf8");
    expect(coverageHtml).toContain("소스 근거 파일");
    expect(coverageHtml).toContain("근거 비율");
    expect(coverageHtml).toContain("소스 근거 종류");
    expect(coverageHtml).toContain("entry:");
    expect(coverageHtml).toContain("소스 근거 부족");
    const coverageMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "coverage.md"), "utf8");
    expect(coverageMarkdown).toContain("## 소스 근거 종류");
    expect(coverageMarkdown).toContain("- entry:");
    const suggestedReadsText = await fs.readFile(path.join(result.session.outputPaths.analysis, "suggested-reads-report.json"), "utf8");
    expect(suggestedReadsText).toContain("Repo Baby suggested_reads");
    expect(suggestedReadsText).toContain("\"items\"");
    const suggestedReadsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "suggested-reads.html"), "utf8");
    expect(suggestedReadsHtml).toContain("추천 읽기");
    expect(suggestedReadsHtml).toContain("suggested-read-card");
    expect(suggestedReadsHtml).toContain("data-source-pattern=\"Repo Baby\"");
    const suggestedReadsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "suggested-reads.md"), "utf8");
    expect(suggestedReadsMarkdown).toContain("# 추천 읽기");
    expect(suggestedReadsMarkdown).toContain("Source pattern: Repo Baby");
    const runtimeEnvironmentText = await fs.readFile(path.join(result.session.outputPaths.analysis, "runtime-environment-report.json"), "utf8");
    expect(runtimeEnvironmentText).toContain("docSmith Dockerfile and Docker Compose generation prompts");
    expect(runtimeEnvironmentText).toContain("\"setupSignals\"");
    const runtimeEnvironmentHtml = await fs.readFile(path.join(result.session.outputPaths.html, "runtime-environment.html"), "utf8");
    expect(runtimeEnvironmentHtml).toContain("실행 환경");
    expect(runtimeEnvironmentHtml).toContain("runtime-env-card");
    expect(runtimeEnvironmentHtml).toContain("data-source-pattern=\"docSmith\"");
    const runtimeEnvironmentMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "runtime-environment.md"), "utf8");
    expect(runtimeEnvironmentMarkdown).toContain("# 실행 환경");
    expect(runtimeEnvironmentMarkdown).toContain("Source pattern: docSmith");
    const interfaceMapText = await fs.readFile(path.join(result.session.outputPaths.analysis, "interface-map-report.json"), "utf8");
    expect(interfaceMapText).toContain("repomap page routes GraphQL REST data flow analysis");
    expect(interfaceMapText).toContain("\"routeSignals\"");
    const interfaceMapHtml = await fs.readFile(path.join(result.session.outputPaths.html, "interface-map.html"), "utf8");
    expect(interfaceMapHtml).toContain("인터페이스 맵");
    expect(interfaceMapHtml).toContain("interface-map-card");
    expect(interfaceMapHtml).toContain("data-source-pattern=\"repomap\"");
    const interfaceMapMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "interface-map.md"), "utf8");
    expect(interfaceMapMarkdown).toContain("# 인터페이스 맵");
    expect(interfaceMapMarkdown).toContain("Source pattern: repomap");
    const symbolMapText = await fs.readFile(path.join(result.session.outputPaths.analysis, "symbol-map-report.json"), "utf8");
    expect(symbolMapText).toContain("codebase-map AST-based functions classes constants index");
    expect(symbolMapText).toContain("\"symbolsByKind\"");
    const symbolMapHtml = await fs.readFile(path.join(result.session.outputPaths.html, "symbol-map.html"), "utf8");
    expect(symbolMapHtml).toContain("심볼 맵");
    expect(symbolMapHtml).toContain("symbol-map-card");
    expect(symbolMapHtml).toContain("symbol-source-link");
    expect(symbolMapHtml).toContain("data-source-pattern=\"codebase-map\"");
    const symbolMapMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "symbol-map.md"), "utf8");
    expect(symbolMapMarkdown).toContain("# 심볼 맵");
    expect(symbolMapMarkdown).toContain("Source pattern: codebase-map");
    const apiReferenceText = await fs.readFile(path.join(result.session.outputPaths.analysis, "api-reference-report.json"), "utf8");
    expect(apiReferenceText).toContain("TypeDoc entry points reflections ReflectionKind public API documentation export validation");
    expect(apiReferenceText).toContain("\"entryPoints\"");
    expect(apiReferenceText).toContain("\"publicSymbols\"");
    expect(apiReferenceText).toContain("\"exportWarnings\"");
    const apiReferenceHtml = await fs.readFile(path.join(result.session.outputPaths.html, "api-reference.html"), "utf8");
    expect(apiReferenceHtml).toContain("API Reference");
    expect(apiReferenceHtml).toContain("api-reference-card");
    expect(apiReferenceHtml).toContain("data-source-pattern=\"TypeDoc\"");
    expect(apiReferenceHtml).toContain("ReflectionKind");
    const apiReferenceMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "api-reference.md"), "utf8");
    expect(apiReferenceMarkdown).toContain("# API Reference");
    expect(apiReferenceMarkdown).toContain("Source pattern: TypeDoc");
    expect(apiReferenceMarkdown).toContain("## Public Symbols");
    const searchIndexText = await fs.readFile(path.join(result.session.outputPaths.analysis, "search-index-report.json"), "utf8");
    expect(searchIndexText).toContain("Pagefind PageFragmentData MetaIndex filters meta_fields static low-bandwidth search index");
    expect(searchIndexText).toContain("\"documents\"");
    expect(searchIndexText).toContain("\"termIndex\"");
    expect(searchIndexText).toContain("\"filterIndex\"");
    expect(searchIndexText).toContain("\"metadataFields\"");
    const searchIndexHtml = await fs.readFile(path.join(result.session.outputPaths.html, "search-index.html"), "utf8");
    expect(searchIndexHtml).toContain("Search Index");
    expect(searchIndexHtml).toContain("search-index-card");
    expect(searchIndexHtml).toContain("data-source-pattern=\"Pagefind\"");
    expect(searchIndexHtml).toContain("PageFragmentData");
    expect(searchIndexHtml).toContain("MetaIndex");
    const searchIndexMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "search-index.md"), "utf8");
    expect(searchIndexMarkdown).toContain("# Search Index");
    expect(searchIndexMarkdown).toContain("Source pattern: Pagefind");
    expect(searchIndexMarkdown).toContain("## Filter Index");
    const searchIndexAsset = await fs.readFile(path.join(result.session.outputPaths.html, "assets", "search-index.json"), "utf8");
    expect(searchIndexAsset).toContain("\"documents\"");
    expect(searchIndexAsset).toContain("\"termIndex\"");
    const learningJournalText = await fs.readFile(path.join(result.session.outputPaths.analysis, "learning-journal-report.json"), "utf8");
    expect(learningJournalText).toContain("learn-codebase Socratic tutor active recall prediction before revelation persistent learning journal");
    expect(learningJournalText).toContain("\"focusGoals\"");
    expect(learningJournalText).toContain("\"masteryLevels\"");
    expect(learningJournalText).toContain("\"openQuestions\"");
    expect(learningJournalText).toContain("\"spacedReviewQueue\"");
    expect(learningJournalText).toContain("\"socraticPrompts\"");
    expect(learningJournalText).toContain("\"journalTemplateMarkdown\"");
    const learningJournalHtml = await fs.readFile(path.join(result.session.outputPaths.html, "learning-journal.html"), "utf8");
    expect(learningJournalHtml).toContain("Learning Journal");
    expect(learningJournalHtml).toContain("learning-journal-card");
    expect(learningJournalHtml).toContain("data-source-pattern=\"learn-codebase\"");
    expect(learningJournalHtml).toContain("Active Recall Journal");
    expect(learningJournalHtml).toContain("Spaced Review Queue");
    const learningJournalMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "learning-journal.md"), "utf8");
    expect(learningJournalMarkdown).toContain("# Learning Journal");
    expect(learningJournalMarkdown).toContain("Source pattern: learn-codebase");
    expect(learningJournalMarkdown).toContain("## Open Questions");
    expect(learningJournalMarkdown).toContain("## Spaced Review Queue");
    const learningJournalTemplateAsset = await fs.readFile(path.join(result.session.outputPaths.html, "assets", "learning-journal-template.md"), "utf8");
    expect(learningJournalTemplateAsset).toContain("# Codebase Learning Journal");
    expect(learningJournalTemplateAsset).toContain("## Concept Mastery Map");
    const projectActivityText = await fs.readFile(path.join(result.session.outputPaths.analysis, "project-activity-report.json"), "utf8");
    expect(projectActivityText).toContain("Repowise git analytics code health hotspots ownership co-change dead code architectural decisions MCP risk");
    expect(projectActivityText).toContain("\"historyAvailability\"");
    expect(projectActivityText).toContain("\"activitySignals\"");
    expect(projectActivityText).toContain("\"hotspotCandidates\"");
    expect(projectActivityText).toContain("\"deadCodeCandidates\"");
    expect(projectActivityText).toContain("\"reviewQueues\"");
    expect(projectActivityText).toContain("\"architectureDecisionPrompts\"");
    const projectActivityHtml = await fs.readFile(path.join(result.session.outputPaths.html, "project-activity.html"), "utf8");
    expect(projectActivityHtml).toContain("Project Activity");
    expect(projectActivityHtml).toContain("project-activity-card");
    expect(projectActivityHtml).toContain("data-source-pattern=\"Repowise\"");
    expect(projectActivityHtml).toContain("Project Activity Snapshot");
    expect(projectActivityHtml).toContain("history mode");
    const projectActivityMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "project-activity.md"), "utf8");
    expect(projectActivityMarkdown).toContain("# Project Activity");
    expect(projectActivityMarkdown).toContain("Source pattern: Repowise");
    expect(projectActivityMarkdown).toContain("## History Availability");
    expect(projectActivityMarkdown).toContain("## Review Queues");
    const licenseRightsText = await fs.readFile(path.join(result.session.outputPaths.analysis, "license-rights-report.json"), "utf8");
    expect(licenseRightsText).toContain("Licensee license file detection filename score SPDX confidence matched_files package metadata README references human compliance review");
    expect(licenseRightsText).toContain("\"detectedProjectLicense\"");
    expect(licenseRightsText).toContain("\"licenseFiles\"");
    expect(licenseRightsText).toContain("\"packageLicenseSignals\"");
    expect(licenseRightsText).toContain("\"readmeLicenseReferences\"");
    expect(licenseRightsText).toContain("\"reviewWarnings\"");
    expect(licenseRightsText).toContain("\"rightsChecklist\"");
    expect(licenseRightsText).toContain("No project license could be detected");
    const licenseRightsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "license-rights.html"), "utf8");
    expect(licenseRightsHtml).toContain("License Rights");
    expect(licenseRightsHtml).toContain("license-rights-card");
    expect(licenseRightsHtml).toContain("data-source-pattern=\"Licensee\"");
    expect(licenseRightsHtml).toContain("License Rights Snapshot");
    const licenseRightsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "license-rights.md"), "utf8");
    expect(licenseRightsMarkdown).toContain("# License Rights");
    expect(licenseRightsMarkdown).toContain("Source pattern: Licensee");
    expect(licenseRightsMarkdown).toContain("## Rights Checklist");
    expect(licenseRightsMarkdown).toContain("## Review Warnings");
    const sbomText = await fs.readFile(path.join(result.session.outputPaths.analysis, "sbom-report.json"), "utf8");
    expect(sbomText).toContain("Syft SBOM source descriptor artifacts packages file metadata relationships CycloneDX SPDX output formats");
    expect(sbomText).toContain("\"sourceDescriptor\"");
    expect(sbomText).toContain("\"packageManifests\"");
    expect(sbomText).toContain("\"packageArtifacts\"");
    expect(sbomText).toContain("\"fileArtifacts\"");
    expect(sbomText).toContain("\"relationships\"");
    expect(sbomText).toContain("\"outputFormats\"");
    expect(sbomText).toContain("\"purl\"");
    expect(sbomText).toContain("zod");
    const sbomHtml = await fs.readFile(path.join(result.session.outputPaths.html, "sbom.html"), "utf8");
    expect(sbomHtml).toContain("SBOM");
    expect(sbomHtml).toContain("sbom-card");
    expect(sbomHtml).toContain("data-source-pattern=\"Syft\"");
    expect(sbomHtml).toContain("SBOM Snapshot");
    const sbomMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "sbom.md"), "utf8");
    expect(sbomMarkdown).toContain("# SBOM");
    expect(sbomMarkdown).toContain("Source pattern: Syft");
    expect(sbomMarkdown).toContain("## Package Artifacts");
    expect(sbomMarkdown).toContain("## Output Formats");
    const securityReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "security-readiness-report.json"), "utf8");
    expect(securityReadinessText).toContain("Trivy targets scanners vulnerability secret misconfiguration license SBOM severity security readiness");
    expect(securityReadinessText).toContain("\"scannerTargets\"");
    expect(securityReadinessText).toContain("\"scannerCoverage\"");
    expect(securityReadinessText).toContain("\"securitySignals\"");
    expect(securityReadinessText).toContain("\"actionQueue\"");
    expect(securityReadinessText).toContain("\"recommendedCommands\"");
    expect(securityReadinessText).toContain("trivy fs --scanners vuln,secret,misconfig,license");
    const securityReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "security-readiness.html"), "utf8");
    expect(securityReadinessHtml).toContain("Security Readiness");
    expect(securityReadinessHtml).toContain("security-readiness-card");
    expect(securityReadinessHtml).toContain("data-source-pattern=\"Trivy\"");
    expect(securityReadinessHtml).toContain("Security Readiness Snapshot");
    const securityReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "security-readiness.md"), "utf8");
    expect(securityReadinessMarkdown).toContain("# Security Readiness");
    expect(securityReadinessMarkdown).toContain("Source pattern: Trivy");
    expect(securityReadinessMarkdown).toContain("## Scanner Targets");
    expect(securityReadinessMarkdown).toContain("## Action Queue");
    const scorecardText = await fs.readFile(path.join(result.session.outputPaths.analysis, "scorecard-report.json"), "utf8");
    expect(scorecardText).toContain("OpenSSF Scorecard checks score 0-10 risk remediation structured results policy measurement");
    expect(scorecardText).toContain("\"aggregateScore\"");
    expect(scorecardText).toContain("\"checks\"");
    expect(scorecardText).toContain("\"categoryScores\"");
    expect(scorecardText).toContain("\"policyFindings\"");
    expect(scorecardText).toContain("\"riskQueue\"");
    expect(scorecardText).toContain("\"structuredResults\"");
    expect(scorecardText).toContain("Pinned-Dependencies");
    expect(scorecardText).toContain("Branch-Protection");
    const scorecardHtml = await fs.readFile(path.join(result.session.outputPaths.html, "scorecard.html"), "utf8");
    expect(scorecardHtml).toContain("Project Scorecard");
    expect(scorecardHtml).toContain("scorecard-card");
    expect(scorecardHtml).toContain("data-source-pattern=\"OpenSSF Scorecard\"");
    expect(scorecardHtml).toContain("Scorecard Snapshot");
    expect(scorecardHtml).toContain("Risk Queue");
    const scorecardMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "scorecard.md"), "utf8");
    expect(scorecardMarkdown).toContain("# Project Scorecard");
    expect(scorecardMarkdown).toContain("Source pattern: OpenSSF Scorecard");
    expect(scorecardMarkdown).toContain("## Category Scores");
    expect(scorecardMarkdown).toContain("## Structured Results");
    const provenanceText = await fs.readFile(path.join(result.session.outputPaths.analysis, "provenance-report.json"), "utf8");
    expect(provenanceText).toContain("Cosign signature bundle attestation transparency log trusted root certificate identity verification");
    expect(provenanceText).toContain("\"artifactSignals\"");
    expect(provenanceText).toContain("\"signatureSignals\"");
    expect(provenanceText).toContain("\"attestationSignals\"");
    expect(provenanceText).toContain("\"identityRequirements\"");
    expect(provenanceText).toContain("\"verificationCommands\"");
    expect(provenanceText).toContain("\"riskQueue\"");
    expect(provenanceText).toContain("cosign verify-blob");
    expect(provenanceText).toContain("expected certificate identity");
    const provenanceHtml = await fs.readFile(path.join(result.session.outputPaths.html, "provenance.html"), "utf8");
    expect(provenanceHtml).toContain("Provenance Readiness");
    expect(provenanceHtml).toContain("provenance-card");
    expect(provenanceHtml).toContain("data-source-pattern=\"Cosign\"");
    expect(provenanceHtml).toContain("Provenance Snapshot");
    expect(provenanceHtml).toContain("Verification Commands");
    const provenanceMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "provenance.md"), "utf8");
    expect(provenanceMarkdown).toContain("# Provenance Readiness");
    expect(provenanceMarkdown).toContain("Source pattern: Cosign");
    expect(provenanceMarkdown).toContain("## Signature Material");
    expect(provenanceMarkdown).toContain("## Identity Requirements");
    const advisoryText = await fs.readFile(path.join(result.session.outputPaths.analysis, "advisory-report.json"), "utf8");
    expect(advisoryText).toContain("OSV-Scanner package extraction vulnerability matching OSV.dev lockfile SBOM offline remediation ignore policy");
    expect(advisoryText).toContain("\"packageQueryTargets\"");
    expect(advisoryText).toContain("\"lockfileSignals\"");
    expect(advisoryText).toContain("\"advisorySources\"");
    expect(advisoryText).toContain("\"policyControls\"");
    expect(advisoryText).toContain("\"resultModel\"");
    expect(advisoryText).toContain("\"remediationQueue\"");
    expect(advisoryText).toContain("osv-scanner scan source");
    expect(advisoryText).toContain("IgnoredVulns");
    const advisoryHtml = await fs.readFile(path.join(result.session.outputPaths.html, "advisories.html"), "utf8");
    expect(advisoryHtml).toContain("Advisory Query Readiness");
    expect(advisoryHtml).toContain("advisory-card");
    expect(advisoryHtml).toContain("data-source-pattern=\"OSV-Scanner\"");
    expect(advisoryHtml).toContain("Advisory Query Snapshot");
    expect(advisoryHtml).toContain("Recommended Commands");
    const advisoryMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "advisories.md"), "utf8");
    expect(advisoryMarkdown).toContain("# Advisory Query Readiness");
    expect(advisoryMarkdown).toContain("Source pattern: OSV-Scanner");
    expect(advisoryMarkdown).toContain("## Package Query Targets");
    expect(advisoryMarkdown).toContain("## Policy Controls");
    const vexText = await fs.readFile(path.join(result.session.outputPaths.analysis, "vex-report.json"), "utf8");
    expect(vexText).toContain("OpenVEX affected not_affected fixed under_investigation justification product subcomponent vulnerability statement attestation SARIF filter");
    expect(vexText).toContain("\"productTargets\"");
    expect(vexText).toContain("\"vulnerabilityInputs\"");
    expect(vexText).toContain("\"statusMatrix\"");
    expect(vexText).toContain("\"justificationCatalog\"");
    expect(vexText).toContain("\"statementDrafts\"");
    expect(vexText).toContain("\"documentWorkflow\"");
    expect(vexText).toContain("\"attestationReadiness\"");
    expect(vexText).toContain("pending-advisory-id");
    expect(vexText).toContain("vexctl filter");
    const vexHtml = await fs.readFile(path.join(result.session.outputPaths.html, "vex.html"), "utf8");
    expect(vexHtml).toContain("OpenVEX Impact Readiness");
    expect(vexHtml).toContain("vex-card");
    expect(vexHtml).toContain("data-source-pattern=\"OpenVEX\"");
    expect(vexHtml).toContain("OpenVEX Snapshot");
    expect(vexHtml).toContain("Document Workflow");
    const vexMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "vex.md"), "utf8");
    expect(vexMarkdown).toContain("# OpenVEX Impact Readiness");
    expect(vexMarkdown).toContain("Source pattern: OpenVEX");
    expect(vexMarkdown).toContain("## Product Targets");
    expect(vexMarkdown).toContain("## Attestation Readiness");
    const policyGateText = await fs.readFile(path.join(result.session.outputPaths.analysis, "policy-gate-report.json"), "utf8");
    expect(policyGateText).toContain("OPA Rego policy input data decision eval test bundle schema strict fail gate");
    expect(policyGateText).toContain("\"policyDocuments\"");
    expect(policyGateText).toContain("\"inputDocuments\"");
    expect(policyGateText).toContain("\"gateQueries\"");
    expect(policyGateText).toContain("\"testCoverage\"");
    expect(policyGateText).toContain("\"bundleReadiness\"");
    expect(policyGateText).toContain("\"decisionOutputs\"");
    expect(policyGateText).toContain("opa check --strict");
    expect(policyGateText).toContain("opa test <policy-dir> --fail-on-empty");
    const policyGateHtml = await fs.readFile(path.join(result.session.outputPaths.html, "policy-gates.html"), "utf8");
    expect(policyGateHtml).toContain("Policy Gate Readiness");
    expect(policyGateHtml).toContain("policy-gate-card");
    expect(policyGateHtml).toContain("data-source-pattern=\"OPA\"");
    expect(policyGateHtml).toContain("Policy Gate Snapshot");
    expect(policyGateHtml).toContain("Recommended Commands");
    const policyGateMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "policy-gates.md"), "utf8");
    expect(policyGateMarkdown).toContain("# Policy Gate Readiness");
    expect(policyGateMarkdown).toContain("Source pattern: OPA");
    expect(policyGateMarkdown).toContain("## Policy Documents");
    expect(policyGateMarkdown).toContain("## Bundle Readiness");
    const apiContractText = await fs.readFile(path.join(result.session.outputPaths.analysis, "api-contract-report.json"), "utf8");
    expect(apiContractText).toContain("Schemathesis OpenAPI GraphQL schema generated cases Hypothesis checks stateful workflows JUnit Allure contract testing");
    expect(apiContractText).toContain("\"schemaDocuments\"");
    expect(apiContractText).toContain("\"operationTargets\"");
    expect(apiContractText).toContain("\"testPhases\"");
    expect(apiContractText).toContain("\"checkMatrix\"");
    expect(apiContractText).toContain("\"runtimeTargets\"");
    expect(apiContractText).toContain("\"reportingOutputs\"");
    expect(apiContractText).toContain("schemathesis run");
    const apiContractHtml = await fs.readFile(path.join(result.session.outputPaths.html, "api-contracts.html"), "utf8");
    expect(apiContractHtml).toContain("API Contract Readiness");
    expect(apiContractHtml).toContain("api-contract-card");
    expect(apiContractHtml).toContain("data-source-pattern=\"Schemathesis\"");
    expect(apiContractHtml).toContain("API Contract Snapshot");
    expect(apiContractHtml).toContain("Runtime Targets");
    const apiContractMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "api-contracts.md"), "utf8");
    expect(apiContractMarkdown).toContain("# API Contract Readiness");
    expect(apiContractMarkdown).toContain("Source pattern: Schemathesis");
    expect(apiContractMarkdown).toContain("## Schema Documents");
    expect(apiContractMarkdown).toContain("## Reporting Outputs");
    const observabilityText = await fs.readFile(path.join(result.session.outputPaths.analysis, "observability-report.json"), "utf8");
    expect(observabilityText).toContain("OpenTelemetry traces metrics logs resource context propagation exporter instrumentation semantic conventions diagnostics");
    expect(observabilityText).toContain("\"signalPipelines\"");
    expect(observabilityText).toContain("\"instrumentationSignals\"");
    expect(observabilityText).toContain("\"exporterTargets\"");
    expect(observabilityText).toContain("\"resourceAttributes\"");
    expect(observabilityText).toContain("\"propagationContext\"");
    expect(observabilityText).toContain("\"diagnostics\"");
    expect(observabilityText).toContain("OTEL_EXPORTER_OTLP_ENDPOINT");
    const observabilityHtml = await fs.readFile(path.join(result.session.outputPaths.html, "observability.html"), "utf8");
    expect(observabilityHtml).toContain("Observability Readiness");
    expect(observabilityHtml).toContain("observability-card");
    expect(observabilityHtml).toContain("data-source-pattern=\"OpenTelemetry\"");
    expect(observabilityHtml).toContain("Signal Pipelines");
    expect(observabilityHtml).toContain("Diagnostics");
    const observabilityMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "observability.md"), "utf8");
    expect(observabilityMarkdown).toContain("# Observability Readiness");
    expect(observabilityMarkdown).toContain("Source pattern: OpenTelemetry");
    expect(observabilityMarkdown).toContain("## Signal Pipelines");
    expect(observabilityMarkdown).toContain("## Diagnostics");
    const performanceText = await fs.readFile(path.join(result.session.outputPaths.analysis, "performance-report.json"), "utf8");
    expect(performanceText).toContain("k6 load testing scripts scenarios executors thresholds checks metrics outputs summaries cloud performance SLO");
    expect(performanceText).toContain("\"scriptTargets\"");
    expect(performanceText).toContain("\"workloadModels\"");
    expect(performanceText).toContain("\"thresholds\"");
    expect(performanceText).toContain("\"checks\"");
    expect(performanceText).toContain("\"metrics\"");
    expect(performanceText).toContain("\"outputs\"");
    expect(performanceText).toContain("\"runtimeControls\"");
    expect(performanceText).toContain("k6 run --summary-export");
    const performanceHtml = await fs.readFile(path.join(result.session.outputPaths.html, "performance.html"), "utf8");
    expect(performanceHtml).toContain("Performance Readiness");
    expect(performanceHtml).toContain("performance-card");
    expect(performanceHtml).toContain("data-source-pattern=\"k6\"");
    expect(performanceHtml).toContain("Workload Models");
    expect(performanceHtml).toContain("Runtime Controls");
    const performanceMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "performance.md"), "utf8");
    expect(performanceMarkdown).toContain("# Performance Readiness");
    expect(performanceMarkdown).toContain("Source pattern: k6");
    expect(performanceMarkdown).toContain("## Workload Models");
    expect(performanceMarkdown).toContain("## Runtime Controls");
    const e2eText = await fs.readFile(path.join(result.session.outputPaths.analysis, "e2e-report.json"), "utf8");
    expect(e2eText).toContain("Playwright browser E2E tests config projects locators assertions traces screenshots video reporters CI webServer");
    expect(e2eText).toContain("\"testSuites\"");
    expect(e2eText).toContain("\"browserProjects\"");
    expect(e2eText).toContain("\"locatorSignals\"");
    expect(e2eText).toContain("\"assertions\"");
    expect(e2eText).toContain("\"artifacts\"");
    expect(e2eText).toContain("\"runtimeTargets\"");
    expect(e2eText).toContain("npx playwright test");
    const e2eHtml = await fs.readFile(path.join(result.session.outputPaths.html, "e2e.html"), "utf8");
    expect(e2eHtml).toContain("E2E Readiness");
    expect(e2eHtml).toContain("e2e-card");
    expect(e2eHtml).toContain("data-source-pattern=\"Playwright\"");
    expect(e2eHtml).toContain("Browser Projects");
    expect(e2eHtml).toContain("Runtime Targets");
    const e2eMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "e2e.md"), "utf8");
    expect(e2eMarkdown).toContain("# E2E Readiness");
    expect(e2eMarkdown).toContain("Source pattern: Playwright");
    expect(e2eMarkdown).toContain("## Browser Projects");
    expect(e2eMarkdown).toContain("## Runtime Targets");
    const accessibilityText = await fs.readFile(path.join(result.session.outputPaths.analysis, "accessibility-report.json"), "utf8");
    expect(accessibilityText).toContain("axe-core accessibility engine WCAG tags violations passes incomplete inapplicable impact selectors context configure reporter iframes");
    expect(accessibilityText).toContain("\"scanTargets\"");
    expect(accessibilityText).toContain("\"ruleTags\"");
    expect(accessibilityText).toContain("\"resultBuckets\"");
    expect(accessibilityText).toContain("\"impactLevels\"");
    expect(accessibilityText).toContain("\"integrationSignals\"");
    expect(accessibilityText).toContain("\"contextControls\"");
    expect(accessibilityText).toContain("npm install axe-core --save-dev");
    const accessibilityHtml = await fs.readFile(path.join(result.session.outputPaths.html, "accessibility.html"), "utf8");
    expect(accessibilityHtml).toContain("Accessibility Readiness");
    expect(accessibilityHtml).toContain("accessibility-card");
    expect(accessibilityHtml).toContain("data-source-pattern=\"axe-core\"");
    expect(accessibilityHtml).toContain("Result Buckets");
    expect(accessibilityHtml).toContain("Context Controls");
    const accessibilityMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "accessibility.md"), "utf8");
    expect(accessibilityMarkdown).toContain("# Accessibility Readiness");
    expect(accessibilityMarkdown).toContain("Source pattern: axe-core");
    expect(accessibilityMarkdown).toContain("## Result Buckets");
    expect(accessibilityMarkdown).toContain("## Context Controls");
    const storybookText = await fs.readFile(path.join(result.session.outputPaths.analysis, "storybook-report.json"), "utf8");
    expect(storybookText).toContain("Storybook Component Story Format stories args argTypes decorators play functions autodocs addons test-runner Chromatic component workshop");
    expect(storybookText).toContain("\"storyFiles\"");
    expect(storybookText).toContain("\"configFiles\"");
    expect(storybookText).toContain("\"storyAnnotations\"");
    expect(storybookText).toContain("\"addonSignals\"");
    expect(storybookText).toContain("\"testSignals\"");
    expect(storybookText).toContain("\"publishSignals\"");
    expect(storybookText).toContain("npx storybook@latest init");
    const storybookHtml = await fs.readFile(path.join(result.session.outputPaths.html, "storybook.html"), "utf8");
    expect(storybookHtml).toContain("Storybook Readiness");
    expect(storybookHtml).toContain("storybook-card");
    expect(storybookHtml).toContain("data-source-pattern=\"Storybook\"");
    expect(storybookHtml).toContain("Story Annotations");
    expect(storybookHtml).toContain("Publish Signals");
    const storybookMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "storybook.md"), "utf8");
    expect(storybookMarkdown).toContain("# Storybook Readiness");
    expect(storybookMarkdown).toContain("Source pattern: Storybook");
    expect(storybookMarkdown).toContain("## Story Annotations");
    expect(storybookMarkdown).toContain("## Publish Signals");
    const designTokensText = await fs.readFile(path.join(result.session.outputPaths.analysis, "design-tokens-report.json"), "utf8");
    expect(designTokensText).toContain("Style Dictionary design tokens source include platforms transformGroup transforms buildPath files formats CTI aliases multi-platform CSS Android iOS");
    expect(designTokensText).toContain("\"tokenSources\"");
    expect(designTokensText).toContain("\"tokenCategories\"");
    expect(designTokensText).toContain("\"platformTargets\"");
    expect(designTokensText).toContain("\"transformSignals\"");
    expect(designTokensText).toContain("\"usageSignals\"");
    expect(designTokensText).toContain("\"governanceSignals\"");
    expect(designTokensText).toContain("npm install -D style-dictionary");
    const designTokensHtml = await fs.readFile(path.join(result.session.outputPaths.html, "design-tokens.html"), "utf8");
    expect(designTokensHtml).toContain("Design Tokens Readiness");
    expect(designTokensHtml).toContain("design-token-card");
    expect(designTokensHtml).toContain("data-source-pattern=\"Style Dictionary\"");
    expect(designTokensHtml).toContain("Platform Targets");
    expect(designTokensHtml).toContain("Governance Signals");
    const designTokensMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "design-tokens.md"), "utf8");
    expect(designTokensMarkdown).toContain("# Design Tokens Readiness");
    expect(designTokensMarkdown).toContain("Source pattern: Style Dictionary");
    expect(designTokensMarkdown).toContain("## Platform Targets");
    expect(designTokensMarkdown).toContain("## Governance Signals");
    const i18nText = await fs.readFile(path.join(result.session.outputPaths.analysis, "i18n-report.json"), "utf8");
    expect(i18nText).toContain("FormatJS React Intl ICU messages extract compile verify IntlProvider polyfills locale data ESLint TMS");
    expect(i18nText).toContain("\"messageSources\"");
    expect(i18nText).toContain("\"localeAssets\"");
    expect(i18nText).toContain("\"runtimeSignals\"");
    expect(i18nText).toContain("\"extractionSignals\"");
    expect(i18nText).toContain("\"icuSignals\"");
    expect(i18nText).toContain("\"qaSignals\"");
    expect(i18nText).toContain("formatjs extract");
    const i18nHtml = await fs.readFile(path.join(result.session.outputPaths.html, "i18n.html"), "utf8");
    expect(i18nHtml).toContain("I18n Readiness");
    expect(i18nHtml).toContain("i18n-card");
    expect(i18nHtml).toContain("data-source-pattern=\"FormatJS\"");
    expect(i18nHtml).toContain("Extraction Signals");
    expect(i18nHtml).toContain("QA Signals");
    const i18nMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "i18n.md"), "utf8");
    expect(i18nMarkdown).toContain("# I18n Readiness");
    expect(i18nMarkdown).toContain("Source pattern: FormatJS");
    expect(i18nMarkdown).toContain("## Extraction Signals");
    expect(i18nMarkdown).toContain("## QA Signals");
    const releaseText = await fs.readFile(path.join(result.session.outputPaths.analysis, "release-readiness-report.json"), "utf8");
    expect(releaseText).toContain("semantic-release branches tagFormat plugins verifyConditions analyzeCommits generateNotes prepare publish CI OIDC provenance");
    expect(releaseText).toContain("\"releaseConfigs\"");
    expect(releaseText).toContain("\"branchChannels\"");
    expect(releaseText).toContain("\"versionSignals\"");
    expect(releaseText).toContain("\"ciSignals\"");
    expect(releaseText).toContain("\"publishTargets\"");
    expect(releaseText).toContain("\"authSignals\"");
    expect(releaseText).toContain("\"pluginSteps\"");
    expect(releaseText).toContain("npx semantic-release --dry-run");
    const releaseHtml = await fs.readFile(path.join(result.session.outputPaths.html, "release-readiness.html"), "utf8");
    expect(releaseHtml).toContain("Release Readiness");
    expect(releaseHtml).toContain("release-card");
    expect(releaseHtml).toContain("data-source-pattern=\"semantic-release\"");
    expect(releaseHtml).toContain("Plugin Steps");
    expect(releaseHtml).toContain("Publish Targets");
    const releaseMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "release-readiness.md"), "utf8");
    expect(releaseMarkdown).toContain("# Release Readiness");
    expect(releaseMarkdown).toContain("Source pattern: semantic-release");
    expect(releaseMarkdown).toContain("## Plugin Steps");
    expect(releaseMarkdown).toContain("## Publish Targets");
    const secretText = await fs.readFile(path.join(result.session.outputPaths.analysis, "secret-readiness-report.json"), "utf8");
    expect(secretText).toContain("Gitleaks git dir stdin baseline config rules allowlists redaction report formats pre-commit staged secret scanning");
    expect(secretText).toContain("\"scanTargets\"");
    expect(secretText).toContain("\"secretSurfaces\"");
    expect(secretText).toContain("\"configSignals\"");
    expect(secretText).toContain("\"reportingSignals\"");
    expect(secretText).toContain("\"preventionSignals\"");
    expect(secretText).toContain("\"advancedSignals\"");
    expect(secretText).toContain("gitleaks git --redact");
    const secretHtml = await fs.readFile(path.join(result.session.outputPaths.html, "secret-readiness.html"), "utf8");
    expect(secretHtml).toContain("Secret Readiness");
    expect(secretHtml).toContain("secret-card");
    expect(secretHtml).toContain("data-source-pattern=\"Gitleaks\"");
    expect(secretHtml).toContain("Prevention Signals");
    expect(secretHtml).toContain("Reporting Signals");
    const secretMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "secret-readiness.md"), "utf8");
    expect(secretMarkdown).toContain("# Secret Readiness");
    expect(secretMarkdown).toContain("Source pattern: Gitleaks");
    expect(secretMarkdown).toContain("## Prevention Signals");
    expect(secretMarkdown).toContain("## Reporting Signals");
    const containerText = await fs.readFile(path.join(result.session.outputPaths.analysis, "container-readiness-report.json"), "utf8");
    expect(containerText).toContain("Hadolint Dockerfile AST ShellCheck rules config ignored rules severity overrides trusted registries labels SARIF JUnit CI pre-commit");
    expect(containerText).toContain("\"dockerfiles\"");
    expect(containerText).toContain("\"composeFiles\"");
    expect(containerText).toContain("\"configSignals\"");
    expect(containerText).toContain("\"instructionRisks\"");
    expect(containerText).toContain("\"labelPolicy\"");
    expect(containerText).toContain("\"integrationSignals\"");
    expect(containerText).toContain("hadolint Dockerfile");
    const containerHtml = await fs.readFile(path.join(result.session.outputPaths.html, "container-readiness.html"), "utf8");
    expect(containerHtml).toContain("Container Readiness");
    expect(containerHtml).toContain("container-card");
    expect(containerHtml).toContain("data-source-pattern=\"Hadolint\"");
    expect(containerHtml).toContain("Instruction Risks");
    expect(containerHtml).toContain("Label Policy");
    const containerMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "container-readiness.md"), "utf8");
    expect(containerMarkdown).toContain("# Container Readiness");
    expect(containerMarkdown).toContain("Source pattern: Hadolint");
    expect(containerMarkdown).toContain("## Instruction Risks");
    expect(containerMarkdown).toContain("## Integration Signals");
    const codeQualityText = await fs.readFile(path.join(result.session.outputPaths.analysis, "code-quality-report.json"), "utf8");
    expect(codeQualityText).toContain("Biome formatter linter check ci biome.json assist organize imports diagnostics reporter editor LSP VCS ignore safe fixes");
    expect(codeQualityText).toContain("\"toolConfigs\"");
    expect(codeQualityText).toContain("\"formatterSignals\"");
    expect(codeQualityText).toContain("\"linterSignals\"");
    expect(codeQualityText).toContain("\"assistSignals\"");
    expect(codeQualityText).toContain("\"ciSignals\"");
    expect(codeQualityText).toContain("\"languageCoverage\"");
    expect(codeQualityText).toContain("npx @biomejs/biome check .");
    const codeQualityHtml = await fs.readFile(path.join(result.session.outputPaths.html, "code-quality.html"), "utf8");
    expect(codeQualityHtml).toContain("Code Quality");
    expect(codeQualityHtml).toContain("code-quality-card");
    expect(codeQualityHtml).toContain("data-source-pattern=\"Biome\"");
    expect(codeQualityHtml).toContain("Formatter Signals");
    expect(codeQualityHtml).toContain("Linter Signals");
    const codeQualityMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "code-quality.md"), "utf8");
    expect(codeQualityMarkdown).toContain("# Code Quality");
    expect(codeQualityMarkdown).toContain("Source pattern: Biome");
    expect(codeQualityMarkdown).toContain("## Formatter Signals");
    expect(codeQualityMarkdown).toContain("## Language Coverage");
    const documentationText = await fs.readFile(path.join(result.session.outputPaths.analysis, "documentation-report.json"), "utf8");
    expect(documentationText).toContain("Docusaurus docs blog pages sidebars docusaurus.config themeConfig navbar footer i18n versioning search build deploy");
    expect(documentationText).toContain("\"siteConfigs\"");
    expect(documentationText).toContain("\"contentSurfaces\"");
    expect(documentationText).toContain("\"navigationSignals\"");
    expect(documentationText).toContain("\"qualitySignals\"");
    expect(documentationText).toContain("\"localizationSignals\"");
    expect(documentationText).toContain("\"releaseSignals\"");
    expect(documentationText).toContain("npm run build");
    const documentationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "documentation.html"), "utf8");
    expect(documentationHtml).toContain("Documentation Readiness");
    expect(documentationHtml).toContain("documentation-card");
    expect(documentationHtml).toContain("data-source-pattern=\"Docusaurus\"");
    expect(documentationHtml).toContain("Content Surfaces");
    expect(documentationHtml).toContain("Release Signals");
    const documentationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "documentation.md"), "utf8");
    expect(documentationMarkdown).toContain("# Documentation Readiness");
    expect(documentationMarkdown).toContain("Source pattern: Docusaurus");
    expect(documentationMarkdown).toContain("## Content Surfaces");
    expect(documentationMarkdown).toContain("## Release Signals");
    const databaseText = await fs.readFile(path.join(result.session.outputPaths.analysis, "database-readiness-report.json"), "utf8");
    expect(databaseText).toContain("Prisma schema datasource generator model migrate generate db push seed PrismaClient DATABASE_URL driver adapter migrations");
    expect(databaseText).toContain("\"schemaFiles\"");
    expect(databaseText).toContain("\"datasourceSignals\"");
    expect(databaseText).toContain("\"migrationSignals\"");
    expect(databaseText).toContain("\"clientSignals\"");
    expect(databaseText).toContain("\"configSignals\"");
    expect(databaseText).toContain("\"modelSignals\"");
    expect(databaseText).toContain("npx prisma validate");
    const databaseHtml = await fs.readFile(path.join(result.session.outputPaths.html, "database-readiness.html"), "utf8");
    expect(databaseHtml).toContain("Database Readiness");
    expect(databaseHtml).toContain("database-card");
    expect(databaseHtml).toContain("data-source-pattern=\"Prisma\"");
    expect(databaseHtml).toContain("Schema Files");
    expect(databaseHtml).toContain("Migration Signals");
    const databaseMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "database-readiness.md"), "utf8");
    expect(databaseMarkdown).toContain("# Database Readiness");
    expect(databaseMarkdown).toContain("Source pattern: Prisma");
    expect(databaseMarkdown).toContain("## Schema Files");
    expect(databaseMarkdown).toContain("## Client Signals");
    const ciCdText = await fs.readFile(path.join(result.session.outputPaths.analysis, "ci-cd-report.json"), "utf8");
    expect(ciCdText).toContain("GitHub Actions workflow syntax events jobs permissions GITHUB_TOKEN OIDC cache artifacts concurrency environments deployments");
    expect(ciCdText).toContain("\"workflowFiles\"");
    expect(ciCdText).toContain("\"triggerSignals\"");
    expect(ciCdText).toContain("\"jobSignals\"");
    expect(ciCdText).toContain("\"securitySignals\"");
    expect(ciCdText).toContain("\"deliverySignals\"");
    expect(ciCdText).toContain("\"platformSignals\"");
    expect(ciCdText).toContain("npx actionlint");
    const ciCdHtml = await fs.readFile(path.join(result.session.outputPaths.html, "ci-cd.html"), "utf8");
    expect(ciCdHtml).toContain("CI/CD Readiness");
    expect(ciCdHtml).toContain("ci-cd-card");
    expect(ciCdHtml).toContain("data-source-pattern=\"GitHub Actions\"");
    expect(ciCdHtml).toContain("Workflow Files");
    expect(ciCdHtml).toContain("Delivery Signals");
    const ciCdMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "ci-cd.md"), "utf8");
    expect(ciCdMarkdown).toContain("# CI/CD Readiness");
    expect(ciCdMarkdown).toContain("Source pattern: GitHub Actions");
    expect(ciCdMarkdown).toContain("## Workflow Files");
    expect(ciCdMarkdown).toContain("## Security Signals");
    const unitTestText = await fs.readFile(path.join(result.session.outputPaths.analysis, "unit-test-report.json"), "utf8");
    expect(unitTestText).toContain("Vitest test files config coverage v8 istanbul snapshots mocks jsdom happy-dom browser mode projects reporters");
    expect(unitTestText).toContain("\"testFiles\"");
    expect(unitTestText).toContain("\"configFiles\"");
    expect(unitTestText).toContain("\"assertionSignals\"");
    expect(unitTestText).toContain("\"mockSignals\"");
    expect(unitTestText).toContain("\"coverageSignals\"");
    expect(unitTestText).toContain("\"environmentSignals\"");
    expect(unitTestText).toContain("\"reportingSignals\"");
    expect(unitTestText).toContain("npx vitest run --coverage");
    const unitTestHtml = await fs.readFile(path.join(result.session.outputPaths.html, "unit-tests.html"), "utf8");
    expect(unitTestHtml).toContain("Unit Test Readiness");
    expect(unitTestHtml).toContain("unit-test-card");
    expect(unitTestHtml).toContain("data-source-pattern=\"Vitest\"");
    expect(unitTestHtml).toContain("Test Files");
    expect(unitTestHtml).toContain("Coverage Signals");
    const unitTestMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "unit-tests.md"), "utf8");
    expect(unitTestMarkdown).toContain("# Unit Test Readiness");
    expect(unitTestMarkdown).toContain("Source pattern: Vitest");
    expect(unitTestMarkdown).toContain("## Test Files");
    expect(unitTestMarkdown).toContain("## Coverage Signals");
    const typecheckText = await fs.readFile(path.join(result.session.outputPaths.analysis, "typecheck-readiness-report.json"), "utf8");
    expect(typecheckText).toContain("TypeScript compilerOptions strict noImplicitAny strictNullChecks composite references declaration noEmit moduleResolution paths types skipLibCheck tsc build");
    expect(typecheckText).toContain("\"tsconfigFiles\"");
    expect(typecheckText).toContain("\"compilerOptionSignals\"");
    expect(typecheckText).toContain("\"projectSignals\"");
    expect(typecheckText).toContain("\"moduleResolutionSignals\"");
    expect(typecheckText).toContain("\"declarationSignals\"");
    expect(typecheckText).toContain("\"scriptSignals\"");
    expect(typecheckText).toContain("npx tsc --noEmit");
    const typecheckHtml = await fs.readFile(path.join(result.session.outputPaths.html, "typecheck-readiness.html"), "utf8");
    expect(typecheckHtml).toContain("Typecheck Readiness");
    expect(typecheckHtml).toContain("typecheck-card");
    expect(typecheckHtml).toContain("data-source-pattern=\"TypeScript\"");
    expect(typecheckHtml).toContain("TSConfig Files");
    expect(typecheckHtml).toContain("Module Resolution Signals");
    const typecheckMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "typecheck-readiness.md"), "utf8");
    expect(typecheckMarkdown).toContain("# Typecheck Readiness");
    expect(typecheckMarkdown).toContain("Source pattern: TypeScript");
    expect(typecheckMarkdown).toContain("## TSConfig Files");
    expect(typecheckMarkdown).toContain("## Script Signals");
    const packageManagerText = await fs.readFile(path.join(result.session.outputPaths.analysis, "package-manager-report.json"), "utf8");
    expect(packageManagerText).toContain("pnpm packageManager devEngines workspace packages catalog lockfile importers allowBuilds auditConfig pnpmfile hooks recursive filter frozen-lockfile");
    expect(packageManagerText).toContain("\"manifestFiles\"");
    expect(packageManagerText).toContain("\"workspaceSignals\"");
    expect(packageManagerText).toContain("\"lockfileSignals\"");
    expect(packageManagerText).toContain("\"scriptSignals\"");
    expect(packageManagerText).toContain("\"policySignals\"");
    expect(packageManagerText).toContain("pnpm install --frozen-lockfile");
    const packageManagerHtml = await fs.readFile(path.join(result.session.outputPaths.html, "package-manager.html"), "utf8");
    expect(packageManagerHtml).toContain("Package Manager Readiness");
    expect(packageManagerHtml).toContain("package-manager-card");
    expect(packageManagerHtml).toContain("data-source-pattern=\"pnpm\"");
    expect(packageManagerHtml).toContain("Manifest Files");
    expect(packageManagerHtml).toContain("Lockfile Signals");
    const packageManagerMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "package-manager.md"), "utf8");
    expect(packageManagerMarkdown).toContain("# Package Manager Readiness");
    expect(packageManagerMarkdown).toContain("Source pattern: pnpm");
    expect(packageManagerMarkdown).toContain("## Manifest Files");
    expect(packageManagerMarkdown).toContain("## Policy Signals");
    const gitHooksText = await fs.readFile(path.join(result.session.outputPaths.analysis, "git-hooks-report.json"), "utf8");
    expect(gitHooksText).toContain("Husky .husky hook files prepare core.hooksPath pre-commit pre-push commit-msg HUSKY=0 no-verify lint-staged POSIX shell");
    expect(gitHooksText).toContain("\"hookFiles\"");
    expect(gitHooksText).toContain("\"installSignals\"");
    expect(gitHooksText).toContain("\"commandSignals\"");
    expect(gitHooksText).toContain("\"policySignals\"");
    expect(gitHooksText).toContain("\"toolConfigFiles\"");
    expect(gitHooksText).toContain("git config --get core.hooksPath");
    const gitHooksHtml = await fs.readFile(path.join(result.session.outputPaths.html, "git-hooks.html"), "utf8");
    expect(gitHooksHtml).toContain("Git Hooks Readiness");
    expect(gitHooksHtml).toContain("git-hooks-card");
    expect(gitHooksHtml).toContain("data-source-pattern=\"Husky\"");
    expect(gitHooksHtml).toContain("Hook Files");
    expect(gitHooksHtml).toContain("Policy Signals");
    const gitHooksMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "git-hooks.md"), "utf8");
    expect(gitHooksMarkdown).toContain("# Git Hooks Readiness");
    expect(gitHooksMarkdown).toContain("Source pattern: Husky");
    expect(gitHooksMarkdown).toContain("## Hook Files");
    expect(gitHooksMarkdown).toContain("## Tool Config Files");
    const taskRunnerText = await fs.readFile(path.join(result.session.outputPaths.analysis, "task-runner-report.json"), "utf8");
    expect(taskRunnerText).toContain("Turborepo turbo.json tasks dependsOn outputs inputs cache env globalEnv passThroughEnv persistent turbo run filter remote cache");
    expect(taskRunnerText).toContain("\"configFiles\"");
    expect(taskRunnerText).toContain("\"taskSignals\"");
    expect(taskRunnerText).toContain("\"cacheSignals\"");
    expect(taskRunnerText).toContain("\"dependencySignals\"");
    expect(taskRunnerText).toContain("\"environmentSignals\"");
    expect(taskRunnerText).toContain("\"packageScriptSignals\"");
    expect(taskRunnerText).toContain("pnpm turbo run build --dry=json");
    const taskRunnerHtml = await fs.readFile(path.join(result.session.outputPaths.html, "task-runner.html"), "utf8");
    expect(taskRunnerHtml).toContain("Task Runner Readiness");
    expect(taskRunnerHtml).toContain("task-runner-card");
    expect(taskRunnerHtml).toContain("data-source-pattern=\"Turborepo\"");
    expect(taskRunnerHtml).toContain("Config Files");
    expect(taskRunnerHtml).toContain("Cache Signals");
    const taskRunnerMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "task-runner.md"), "utf8");
    expect(taskRunnerMarkdown).toContain("# Task Runner Readiness");
    expect(taskRunnerMarkdown).toContain("Source pattern: Turborepo");
    expect(taskRunnerMarkdown).toContain("## Config Files");
    expect(taskRunnerMarkdown).toContain("## Package Script Signals");
    const dependencyUpdateText = await fs.readFile(path.join(result.session.outputPaths.analysis, "dependency-update-report.json"), "utf8");
    expect(dependencyUpdateText).toContain("Renovate config presets packageRules automerge schedule dependencyDashboard enabledManagers hostRules rangeStrategy prConcurrentLimit configMigration");
    expect(dependencyUpdateText).toContain("\"configFiles\"");
    expect(dependencyUpdateText).toContain("\"managerSignals\"");
    expect(dependencyUpdateText).toContain("\"policySignals\"");
    expect(dependencyUpdateText).toContain("\"workflowSignals\"");
    expect(dependencyUpdateText).toContain("\"registrySignals\"");
    expect(dependencyUpdateText).toContain("\"packageFileSignals\"");
    expect(dependencyUpdateText).toContain("npx renovate-config-validator");
    const dependencyUpdateHtml = await fs.readFile(path.join(result.session.outputPaths.html, "dependency-updates.html"), "utf8");
    expect(dependencyUpdateHtml).toContain("Dependency Updates Readiness");
    expect(dependencyUpdateHtml).toContain("dependency-update-card");
    expect(dependencyUpdateHtml).toContain("data-source-pattern=\"Renovate\"");
    expect(dependencyUpdateHtml).toContain("Config Files");
    expect(dependencyUpdateHtml).toContain("Policy Signals");
    const dependencyUpdateMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dependency-updates.md"), "utf8");
    expect(dependencyUpdateMarkdown).toContain("# Dependency Updates Readiness");
    expect(dependencyUpdateMarkdown).toContain("Source pattern: Renovate");
    expect(dependencyUpdateMarkdown).toContain("## Config Files");
    expect(dependencyUpdateMarkdown).toContain("## Package File Signals");
    const lintReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "lint-readiness-report.json"), "utf8");
    expect(lintReadinessText).toContain("ESLint flat config rules plugins parser ignores fix cache max-warnings report-unused-disable-directives print-config inspect-config");
    expect(lintReadinessText).toContain("\"configFiles\"");
    expect(lintReadinessText).toContain("\"ruleSignals\"");
    expect(lintReadinessText).toContain("\"scriptSignals\"");
    expect(lintReadinessText).toContain("\"scopeSignals\"");
    expect(lintReadinessText).toContain("\"outputSignals\"");
    expect(lintReadinessText).toContain("\"packageSignals\"");
    expect(lintReadinessText).toContain("npx eslint --print-config <file>");
    const lintReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "lint-readiness.html"), "utf8");
    expect(lintReadinessHtml).toContain("Lint Readiness");
    expect(lintReadinessHtml).toContain("lint-readiness-card");
    expect(lintReadinessHtml).toContain("data-source-pattern=\"ESLint\"");
    expect(lintReadinessHtml).toContain("Config Files");
    expect(lintReadinessHtml).toContain("Rule Signals");
    const lintReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "lint-readiness.md"), "utf8");
    expect(lintReadinessMarkdown).toContain("# Lint Readiness");
    expect(lintReadinessMarkdown).toContain("Source pattern: ESLint");
    expect(lintReadinessMarkdown).toContain("## Config Files");
    expect(lintReadinessMarkdown).toContain("## Package Signals");
    const formatReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "format-readiness-report.json"), "utf8");
    expect(formatReadinessText).toContain("Prettier config ignore options plugins parser check write list-different cache editorconfig file-info find-config-path");
    expect(formatReadinessText).toContain("\"configFiles\"");
    expect(formatReadinessText).toContain("\"ignoreFiles\"");
    expect(formatReadinessText).toContain("\"optionSignals\"");
    expect(formatReadinessText).toContain("\"scriptSignals\"");
    expect(formatReadinessText).toContain("\"scopeSignals\"");
    expect(formatReadinessText).toContain("\"packageSignals\"");
    expect(formatReadinessText).toContain("npx prettier --find-config-path <file>");
    const formatReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "format-readiness.html"), "utf8");
    expect(formatReadinessHtml).toContain("Format Readiness");
    expect(formatReadinessHtml).toContain("format-readiness-card");
    expect(formatReadinessHtml).toContain("data-source-pattern=\"Prettier\"");
    expect(formatReadinessHtml).toContain("Config Files");
    expect(formatReadinessHtml).toContain("Ignore Files");
    const formatReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "format-readiness.md"), "utf8");
    expect(formatReadinessMarkdown).toContain("# Format Readiness");
    expect(formatReadinessMarkdown).toContain("Source pattern: Prettier");
    expect(formatReadinessMarkdown).toContain("## Config Files");
    expect(formatReadinessMarkdown).toContain("## Package Signals");
    const commitConventionText = await fs.readFile(path.join(result.session.outputPaths.analysis, "commit-conventions-report.json"), "utf8");
    expect(commitConventionText).toContain("commitlint config conventional commits rules parserPreset commit-msg husky from to last edit strict verbose prompt");
    expect(commitConventionText).toContain("\"configFiles\"");
    expect(commitConventionText).toContain("\"ruleSignals\"");
    expect(commitConventionText).toContain("\"hookSignals\"");
    expect(commitConventionText).toContain("\"commandSignals\"");
    expect(commitConventionText).toContain("\"packageSignals\"");
    expect(commitConventionText).toContain("npx commitlint --from <base-sha> --to <head-sha> --verbose");
    const commitConventionHtml = await fs.readFile(path.join(result.session.outputPaths.html, "commit-conventions.html"), "utf8");
    expect(commitConventionHtml).toContain("Commit Conventions");
    expect(commitConventionHtml).toContain("commit-convention-card");
    expect(commitConventionHtml).toContain("data-source-pattern=\"commitlint\"");
    expect(commitConventionHtml).toContain("Config Files");
    expect(commitConventionHtml).toContain("Hook Signals");
    const commitConventionMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "commit-conventions.md"), "utf8");
    expect(commitConventionMarkdown).toContain("# Commit Conventions");
    expect(commitConventionMarkdown).toContain("Source pattern: commitlint");
    expect(commitConventionMarkdown).toContain("## Config Files");
    expect(commitConventionMarkdown).toContain("## Package Signals");
    const changelogReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "changelog-readiness-report.json"), "utf8");
    expect(changelogReadinessText).toContain("Changesets config changeset files changelog version publish status pre snapshot fixed linked private packages");
    expect(changelogReadinessText).toContain("\"configFiles\"");
    expect(changelogReadinessText).toContain("\"changesetFiles\"");
    expect(changelogReadinessText).toContain("\"workflowSignals\"");
    expect(changelogReadinessText).toContain("\"commandSignals\"");
    expect(changelogReadinessText).toContain("\"policySignals\"");
    expect(changelogReadinessText).toContain("npx changeset status --since=main --output=changeset-status.json");
    const changelogReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "changelog-readiness.html"), "utf8");
    expect(changelogReadinessHtml).toContain("Changelog Readiness");
    expect(changelogReadinessHtml).toContain("changelog-readiness-card");
    expect(changelogReadinessHtml).toContain("data-source-pattern=\"Changesets\"");
    expect(changelogReadinessHtml).toContain("Changeset Files");
    expect(changelogReadinessHtml).toContain("Policy Signals");
    const changelogReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "changelog-readiness.md"), "utf8");
    expect(changelogReadinessMarkdown).toContain("# Changelog Readiness");
    expect(changelogReadinessMarkdown).toContain("Source pattern: Changesets");
    expect(changelogReadinessMarkdown).toContain("## Changeset Files");
    expect(changelogReadinessMarkdown).toContain("## Policy Signals");
    const bundleAnalysisText = await fs.readFile(path.join(result.session.outputPaths.analysis, "bundle-analysis-report.json"), "utf8");
    expect(bundleAnalysisText).toContain("Webpack Bundle Analyzer stats json analyzerMode reportFilename defaultSizes gzip parsed stat source maps chunks assets");
    expect(bundleAnalysisText).toContain("\"configFiles\"");
    expect(bundleAnalysisText).toContain("\"bundleArtifacts\"");
    expect(bundleAnalysisText).toContain("\"sizeSignals\"");
    expect(bundleAnalysisText).toContain("\"scriptSignals\"");
    expect(bundleAnalysisText).toContain("\"packageSignals\"");
    expect(bundleAnalysisText).toContain("npx webpack-bundle-analyzer stats.json dist --mode static --report bundle-report.html --no-open");
    const bundleAnalysisHtml = await fs.readFile(path.join(result.session.outputPaths.html, "bundle-analysis.html"), "utf8");
    expect(bundleAnalysisHtml).toContain("Bundle Analysis");
    expect(bundleAnalysisHtml).toContain("bundle-analysis-card");
    expect(bundleAnalysisHtml).toContain("data-source-pattern=\"Webpack Bundle Analyzer\"");
    expect(bundleAnalysisHtml).toContain("Bundle Artifacts");
    expect(bundleAnalysisHtml).toContain("Size Signals");
    const bundleAnalysisMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "bundle-analysis.md"), "utf8");
    expect(bundleAnalysisMarkdown).toContain("# Bundle Analysis");
    expect(bundleAnalysisMarkdown).toContain("Source pattern: Webpack Bundle Analyzer");
    expect(bundleAnalysisMarkdown).toContain("## Bundle Artifacts");
    expect(bundleAnalysisMarkdown).toContain("## Package Signals");
    const mockingReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "mocking-readiness-report.json"), "utf8");
    expect(mockingReadinessText).toContain("Mock Service Worker setupWorker setupServer http graphql ws HttpResponse handlers onUnhandledRequest resetHandlers passthrough bypass");
    expect(mockingReadinessText).toContain("\"handlerFiles\"");
    expect(mockingReadinessText).toContain("\"serverSetups\"");
    expect(mockingReadinessText).toContain("\"protocolSignals\"");
    expect(mockingReadinessText).toContain("\"lifecycleSignals\"");
    expect(mockingReadinessText).toContain("\"packageSignals\"");
    expect(mockingReadinessText).toContain("npx msw init public/ --save");
    const mockingReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "mocking-readiness.html"), "utf8");
    expect(mockingReadinessHtml).toContain("Mocking Readiness");
    expect(mockingReadinessHtml).toContain("mocking-readiness-card");
    expect(mockingReadinessHtml).toContain("data-source-pattern=\"Mock Service Worker\"");
    expect(mockingReadinessHtml).toContain("Handler Files");
    expect(mockingReadinessHtml).toContain("Lifecycle Signals");
    const mockingReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "mocking-readiness.md"), "utf8");
    expect(mockingReadinessMarkdown).toContain("# Mocking Readiness");
    expect(mockingReadinessMarkdown).toContain("Source pattern: Mock Service Worker");
    expect(mockingReadinessMarkdown).toContain("## Handler Files");
    expect(mockingReadinessMarkdown).toContain("## Package Signals");
    const dataFetchingText = await fs.readFile(path.join(result.session.outputPaths.analysis, "data-fetching-readiness-report.json"), "utf8");
    expect(dataFetchingText).toContain("TanStack Query QueryClient QueryClientProvider useQuery useMutation queryKey queryFn invalidateQueries staleTime gcTime hydrate persist devtools");
    expect(dataFetchingText).toContain("\"clientSetups\"");
    expect(dataFetchingText).toContain("\"queryUsages\"");
    expect(dataFetchingText).toContain("\"cacheSignals\"");
    expect(dataFetchingText).toContain("\"dataFlowSignals\"");
    expect(dataFetchingText).toContain("\"packageSignals\"");
    expect(dataFetchingText).toContain("npx eslint . --rule '@tanstack/query/stable-query-client:error'");
    const dataFetchingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-fetching-readiness.html"), "utf8");
    expect(dataFetchingHtml).toContain("Data Fetching Readiness");
    expect(dataFetchingHtml).toContain("data-fetching-card");
    expect(dataFetchingHtml).toContain("data-source-pattern=\"TanStack Query\"");
    expect(dataFetchingHtml).toContain("Client Setups");
    expect(dataFetchingHtml).toContain("Data Flow Signals");
    const dataFetchingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-fetching-readiness.md"), "utf8");
    expect(dataFetchingMarkdown).toContain("# Data Fetching Readiness");
    expect(dataFetchingMarkdown).toContain("Source pattern: TanStack Query");
    expect(dataFetchingMarkdown).toContain("## Query Usages");
    expect(dataFetchingMarkdown).toContain("## Cache Signals");
    const routingText = await fs.readFile(path.join(result.session.outputPaths.analysis, "routing-readiness-report.json"), "utf8");
    expect(routingText).toContain("React Router BrowserRouter createBrowserRouter RouterProvider routes.ts route index Link NavLink Outlet loader action ErrorBoundary useNavigate useParams useSearchParams");
    expect(routingText).toContain("\"routingSetups\"");
    expect(routingText).toContain("\"routeDefinitions\"");
    expect(routingText).toContain("\"navigationSignals\"");
    expect(routingText).toContain("\"dataRouteSignals\"");
    expect(routingText).toContain("\"fileRouteSignals\"");
    expect(routingText).toContain("\"packageSignals\"");
    expect(routingText).toContain("npx react-router typegen");
    const routingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "routing-readiness.html"), "utf8");
    expect(routingHtml).toContain("Routing Readiness");
    expect(routingHtml).toContain("routing-readiness-card");
    expect(routingHtml).toContain("data-source-pattern=\"React Router\"");
    expect(routingHtml).toContain("Route Definitions");
    expect(routingHtml).toContain("Data Route Signals");
    const routingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "routing-readiness.md"), "utf8");
    expect(routingMarkdown).toContain("# Routing Readiness");
    expect(routingMarkdown).toContain("Source pattern: React Router");
    expect(routingMarkdown).toContain("## Route Definitions");
    expect(routingMarkdown).toContain("## Navigation Signals");
    const stateManagementText = await fs.readFile(path.join(result.session.outputPaths.analysis, "state-management-readiness-report.json"), "utf8");
    expect(stateManagementText).toContain("Redux Toolkit configureStore createSlice reducers actions selectors Provider useSelector useDispatch createAsyncThunk createListenerMiddleware createEntityAdapter middleware devTools RTK Query");
    expect(stateManagementText).toContain("\"storeSetups\"");
    expect(stateManagementText).toContain("\"sliceDefinitions\"");
    expect(stateManagementText).toContain("\"selectorSignals\"");
    expect(stateManagementText).toContain("\"sideEffectSignals\"");
    expect(stateManagementText).toContain("\"entitySignals\"");
    expect(stateManagementText).toContain("\"middlewareSignals\"");
    expect(stateManagementText).toContain("\"rtkQuerySignals\"");
    expect(stateManagementText).toContain("\"packageSignals\"");
    expect(stateManagementText).toContain("npx vitest run");
    const stateManagementHtml = await fs.readFile(path.join(result.session.outputPaths.html, "state-management-readiness.html"), "utf8");
    expect(stateManagementHtml).toContain("State Management Readiness");
    expect(stateManagementHtml).toContain("state-management-card");
    expect(stateManagementHtml).toContain("data-source-pattern=\"Redux Toolkit\"");
    expect(stateManagementHtml).toContain("Store Setups");
    expect(stateManagementHtml).toContain("RTK Query Signals");
    const stateManagementMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "state-management-readiness.md"), "utf8");
    expect(stateManagementMarkdown).toContain("# State Management Readiness");
    expect(stateManagementMarkdown).toContain("Source pattern: Redux Toolkit");
    expect(stateManagementMarkdown).toContain("## Slice Definitions");
    expect(stateManagementMarkdown).toContain("## Middleware Signals");
    const formReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "form-readiness-report.json"), "utf8");
    expect(formReadinessText).toContain("React Hook Form useForm register handleSubmit Controller FormProvider useFormContext useFieldArray resolver errors defaultValues watch reset validation");
    expect(formReadinessText).toContain("\"formSetups\"");
    expect(formReadinessText).toContain("\"fieldRegistrations\"");
    expect(formReadinessText).toContain("\"validationSignals\"");
    expect(formReadinessText).toContain("\"errorSignals\"");
    expect(formReadinessText).toContain("\"valueFlowSignals\"");
    expect(formReadinessText).toContain("\"packageSignals\"");
    expect(formReadinessText).toContain("npx vitest run");
    const formReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "form-readiness.html"), "utf8");
    expect(formReadinessHtml).toContain("Form Readiness");
    expect(formReadinessHtml).toContain("form-readiness-card");
    expect(formReadinessHtml).toContain("data-source-pattern=\"React Hook Form\"");
    expect(formReadinessHtml).toContain("Form Setups");
    expect(formReadinessHtml).toContain("Validation Signals");
    const formReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "form-readiness.md"), "utf8");
    expect(formReadinessMarkdown).toContain("# Form Readiness");
    expect(formReadinessMarkdown).toContain("Source pattern: React Hook Form");
    expect(formReadinessMarkdown).toContain("## Field Registrations");
    expect(formReadinessMarkdown).toContain("## Error Signals");
    const authReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "auth-readiness-report.json"), "utf8");
    expect(authReadinessText).toContain("Auth.js NextAuth auth handlers providers callbacks session jwt middleware protected routes env secrets adapter signIn signOut useSession SessionProvider");
    expect(authReadinessText).toContain("\"authSetups\"");
    expect(authReadinessText).toContain("\"sessionSurfaces\"");
    expect(authReadinessText).toContain("\"protectionSignals\"");
    expect(authReadinessText).toContain("\"providerSignals\"");
    expect(authReadinessText).toContain("\"callbackSignals\"");
    expect(authReadinessText).toContain("\"credentialSignals\"");
    expect(authReadinessText).toContain("\"packageSignals\"");
    expect(authReadinessText).toContain("npx vitest run");
    const authReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "auth-readiness.html"), "utf8");
    expect(authReadinessHtml).toContain("Auth Readiness");
    expect(authReadinessHtml).toContain("auth-readiness-card");
    expect(authReadinessHtml).toContain("data-source-pattern=\"Auth.js\"");
    expect(authReadinessHtml).toContain("Auth Setups");
    expect(authReadinessHtml).toContain("Provider Signals");
    const authReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "auth-readiness.md"), "utf8");
    expect(authReadinessMarkdown).toContain("# Auth Readiness");
    expect(authReadinessMarkdown).toContain("Source pattern: Auth.js");
    expect(authReadinessMarkdown).toContain("## Session Surfaces");
    expect(authReadinessMarkdown).toContain("## Credential Signals");
    const paymentReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "payment-readiness-report.json"), "utf8");
    expect(paymentReadinessText).toContain("Stripe new Stripe checkout sessions payment intents subscriptions customers invoices billing portal webhooks constructEvent raw body signature idempotency apiVersion env price");
    expect(paymentReadinessText).toContain("\"paymentSetups\"");
    expect(paymentReadinessText).toContain("\"checkoutSignals\"");
    expect(paymentReadinessText).toContain("\"webhookSignals\"");
    expect(paymentReadinessText).toContain("\"customerSignals\"");
    expect(paymentReadinessText).toContain("\"credentialSignals\"");
    expect(paymentReadinessText).toContain("\"packageSignals\"");
    expect(paymentReadinessText).toContain("npx vitest run");
    const paymentReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "payment-readiness.html"), "utf8");
    expect(paymentReadinessHtml).toContain("Payment Readiness");
    expect(paymentReadinessHtml).toContain("payment-readiness-card");
    expect(paymentReadinessHtml).toContain("data-source-pattern=\"Stripe\"");
    expect(paymentReadinessHtml).toContain("Payment Setups");
    expect(paymentReadinessHtml).toContain("Webhook Signals");
    const paymentReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "payment-readiness.md"), "utf8");
    expect(paymentReadinessMarkdown).toContain("# Payment Readiness");
    expect(paymentReadinessMarkdown).toContain("Source pattern: Stripe");
    expect(paymentReadinessMarkdown).toContain("## Checkout Signals");
    expect(paymentReadinessMarkdown).toContain("## Credential Signals");
    const emailReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "email-readiness-report.json"), "utf8");
    expect(emailReadinessText).toContain("Resend new Resend emails.send batch.send domains verify webhooks verify standardwebhooks from to subject html react attachments replyTo RESEND_API_KEY idempotency");
    expect(emailReadinessText).toContain("\"emailSetups\"");
    expect(emailReadinessText).toContain("\"recipientSignals\"");
    expect(emailReadinessText).toContain("\"deliverySignals\"");
    expect(emailReadinessText).toContain("\"templateSignals\"");
    expect(emailReadinessText).toContain("\"credentialSignals\"");
    expect(emailReadinessText).toContain("\"packageSignals\"");
    expect(emailReadinessText).toContain("npx vitest run");
    const emailReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "email-readiness.html"), "utf8");
    expect(emailReadinessHtml).toContain("Email Readiness");
    expect(emailReadinessHtml).toContain("email-readiness-card");
    expect(emailReadinessHtml).toContain("data-source-pattern=\"Resend\"");
    expect(emailReadinessHtml).toContain("Email Setups");
    expect(emailReadinessHtml).toContain("Delivery Signals");
    const emailReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "email-readiness.md"), "utf8");
    expect(emailReadinessMarkdown).toContain("# Email Readiness");
    expect(emailReadinessMarkdown).toContain("Source pattern: Resend");
    expect(emailReadinessMarkdown).toContain("## Recipient Signals");
    expect(emailReadinessMarkdown).toContain("## Template Signals");
    const queueReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "queue-readiness-report.json"), "utf8");
    expect(queueReadinessText).toContain("BullMQ Queue Worker QueueEvents FlowProducer JobScheduler queue.add addBulk repeat attempts backoff removeOnComplete removeOnFail Redis connection concurrency limiter stalled failed completed metrics telemetry");
    expect(queueReadinessText).toContain("\"queueSetups\"");
    expect(queueReadinessText).toContain("\"producerSignals\"");
    expect(queueReadinessText).toContain("\"workerSignals\"");
    expect(queueReadinessText).toContain("\"reliabilitySignals\"");
    expect(queueReadinessText).toContain("\"connectionSignals\"");
    expect(queueReadinessText).toContain("\"packageSignals\"");
    expect(queueReadinessText).toContain("npx vitest run");
    const queueReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "queue-readiness.html"), "utf8");
    expect(queueReadinessHtml).toContain("Queue Readiness");
    expect(queueReadinessHtml).toContain("queue-readiness-card");
    expect(queueReadinessHtml).toContain("data-source-pattern=\"BullMQ\"");
    expect(queueReadinessHtml).toContain("Queue Setups");
    expect(queueReadinessHtml).toContain("Reliability Signals");
    const queueReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "queue-readiness.md"), "utf8");
    expect(queueReadinessMarkdown).toContain("# Queue Readiness");
    expect(queueReadinessMarkdown).toContain("Source pattern: BullMQ");
    expect(queueReadinessMarkdown).toContain("## Producer Signals");
    expect(queueReadinessMarkdown).toContain("## Connection Signals");
    const cacheReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "cache-readiness-report.json"), "utf8");
    expect(cacheReadinessText).toContain("Node Redis createClient connect get set EX NX expire ttl del mGet mSet scanIterator multi watch clientSideCache RESP socket reconnect isReady");
    expect(cacheReadinessText).toContain("\"cacheSetups\"");
    expect(cacheReadinessText).toContain("\"operationSignals\"");
    expect(cacheReadinessText).toContain("\"policySignals\"");
    expect(cacheReadinessText).toContain("\"connectionSignals\"");
    expect(cacheReadinessText).toContain("\"advancedSignals\"");
    expect(cacheReadinessText).toContain("\"packageSignals\"");
    expect(cacheReadinessText).toContain("npx vitest run");
    const cacheReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "cache-readiness.html"), "utf8");
    expect(cacheReadinessHtml).toContain("Cache Readiness");
    expect(cacheReadinessHtml).toContain("cache-readiness-card");
    expect(cacheReadinessHtml).toContain("data-source-pattern=\"Node Redis\"");
    expect(cacheReadinessHtml).toContain("Cache Setups");
    expect(cacheReadinessHtml).toContain("Policy Signals");
    const cacheReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "cache-readiness.md"), "utf8");
    expect(cacheReadinessMarkdown).toContain("# Cache Readiness");
    expect(cacheReadinessMarkdown).toContain("Source pattern: Node Redis");
    expect(cacheReadinessMarkdown).toContain("## Operation Signals");
    expect(cacheReadinessMarkdown).toContain("## Advanced Signals");
    const loggingReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "logging-readiness-report.json"), "utf8");
    expect(loggingReadinessText).toContain("Pino pino logger.info logger.error child logger level transport destination redact serializers pino-pretty multistream timestamp formatters mixin bindings");
    expect(loggingReadinessText).toContain("\"loggingSetups\"");
    expect(loggingReadinessText).toContain("\"levelSignals\"");
    expect(loggingReadinessText).toContain("\"contextSignals\"");
    expect(loggingReadinessText).toContain("\"safetySignals\"");
    expect(loggingReadinessText).toContain("\"transportSignals\"");
    expect(loggingReadinessText).toContain("\"packageSignals\"");
    expect(loggingReadinessText).toContain("npx vitest run");
    const loggingReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "logging-readiness.html"), "utf8");
    expect(loggingReadinessHtml).toContain("Logging Readiness");
    expect(loggingReadinessHtml).toContain("logging-readiness-card");
    expect(loggingReadinessHtml).toContain("data-source-pattern=\"Pino\"");
    expect(loggingReadinessHtml).toContain("Logging Setups");
    expect(loggingReadinessHtml).toContain("Safety Signals");
    const loggingReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "logging-readiness.md"), "utf8");
    expect(loggingReadinessMarkdown).toContain("# Logging Readiness");
    expect(loggingReadinessMarkdown).toContain("Source pattern: Pino");
    expect(loggingReadinessMarkdown).toContain("## Context Signals");
    expect(loggingReadinessMarkdown).toContain("## Transport Signals");
    const featureFlagReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "feature-flag-readiness-report.json"), "utf8");
    expect(featureFlagReadinessText).toContain("OpenFeature setProviderAndWait setProvider getClient getBooleanValue getStringValue getNumberValue getObjectValue getBooleanDetails EvaluationContext targetingKey hooks events tracking shutdown MultiProvider");
    expect(featureFlagReadinessText).toContain("\"featureFlagSetups\"");
    expect(featureFlagReadinessText).toContain("\"evaluationSignals\"");
    expect(featureFlagReadinessText).toContain("\"contextSignals\"");
    expect(featureFlagReadinessText).toContain("\"lifecycleSignals\"");
    expect(featureFlagReadinessText).toContain("\"packageSignals\"");
    expect(featureFlagReadinessText).toContain("npx vitest run");
    const featureFlagReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "feature-flag-readiness.html"), "utf8");
    expect(featureFlagReadinessHtml).toContain("Feature Flag Readiness");
    expect(featureFlagReadinessHtml).toContain("feature-flag-readiness-card");
    expect(featureFlagReadinessHtml).toContain("data-source-pattern=\"OpenFeature\"");
    expect(featureFlagReadinessHtml).toContain("Feature Flag Setups");
    expect(featureFlagReadinessHtml).toContain("Lifecycle Signals");
    const featureFlagReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "feature-flag-readiness.md"), "utf8");
    expect(featureFlagReadinessMarkdown).toContain("# Feature Flag Readiness");
    expect(featureFlagReadinessMarkdown).toContain("Source pattern: OpenFeature");
    expect(featureFlagReadinessMarkdown).toContain("## Evaluation Signals");
    expect(featureFlagReadinessMarkdown).toContain("## Lifecycle Signals");
    const rateLimitReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "rate-limit-readiness-report.json"), "utf8");
    expect(rateLimitReadinessText).toContain("rate-limiter-flexible RateLimiterMemory RateLimiterRedis points duration blockDuration keyPrefix storeClient consume penalty reward insuranceLimiter msBeforeNext remainingPoints Retry-After X-RateLimit");
    expect(rateLimitReadinessText).toContain("\"rateLimitSetups\"");
    expect(rateLimitReadinessText).toContain("\"quotaSignals\"");
    expect(rateLimitReadinessText).toContain("\"identitySignals\"");
    expect(rateLimitReadinessText).toContain("\"storeSignals\"");
    expect(rateLimitReadinessText).toContain("\"responseSignals\"");
    expect(rateLimitReadinessText).toContain("\"resilienceSignals\"");
    expect(rateLimitReadinessText).toContain("\"packageSignals\"");
    expect(rateLimitReadinessText).toContain("npx vitest run");
    const rateLimitReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "rate-limit-readiness.html"), "utf8");
    expect(rateLimitReadinessHtml).toContain("Rate Limit Readiness");
    expect(rateLimitReadinessHtml).toContain("rate-limit-readiness-card");
    expect(rateLimitReadinessHtml).toContain("data-source-pattern=\"rate-limiter-flexible\"");
    expect(rateLimitReadinessHtml).toContain("Rate Limit Setups");
    expect(rateLimitReadinessHtml).toContain("Resilience Signals");
    const rateLimitReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "rate-limit-readiness.md"), "utf8");
    expect(rateLimitReadinessMarkdown).toContain("# Rate Limit Readiness");
    expect(rateLimitReadinessMarkdown).toContain("Source pattern: rate-limiter-flexible");
    expect(rateLimitReadinessMarkdown).toContain("## Quota Signals");
    expect(rateLimitReadinessMarkdown).toContain("## Store Signals");
    const errorTrackingReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "error-tracking-readiness-report.json"), "utf8");
    expect(errorTrackingReadinessText).toContain("Sentry.init dsn captureException captureMessage captureEvent withScope setUser setContext setTag beforeSend ignoreErrors tracesSampleRate tracePropagationTargets replayIntegration ErrorBoundary");
    expect(errorTrackingReadinessText).toContain("\"errorTrackingSetups\"");
    expect(errorTrackingReadinessText).toContain("\"captureSignals\"");
    expect(errorTrackingReadinessText).toContain("\"contextSignals\"");
    expect(errorTrackingReadinessText).toContain("\"filteringSignals\"");
    expect(errorTrackingReadinessText).toContain("\"observabilitySignals\"");
    expect(errorTrackingReadinessText).toContain("\"packageSignals\"");
    expect(errorTrackingReadinessText).toContain("npx vitest run");
    const errorTrackingReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "error-tracking-readiness.html"), "utf8");
    expect(errorTrackingReadinessHtml).toContain("Error Tracking Readiness");
    expect(errorTrackingReadinessHtml).toContain("error-tracking-readiness-card");
    expect(errorTrackingReadinessHtml).toContain("data-source-pattern=\"Sentry\"");
    expect(errorTrackingReadinessHtml).toContain("Error Tracking Setups");
    expect(errorTrackingReadinessHtml).toContain("Filtering Signals");
    const errorTrackingReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "error-tracking-readiness.md"), "utf8");
    expect(errorTrackingReadinessMarkdown).toContain("# Error Tracking Readiness");
    expect(errorTrackingReadinessMarkdown).toContain("Source pattern: Sentry");
    expect(errorTrackingReadinessMarkdown).toContain("## Capture Signals");
    expect(errorTrackingReadinessMarkdown).toContain("## Observability Signals");
    const analyticsReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "analytics-readiness-report.json"), "utf8");
    expect(analyticsReadinessText).toContain("posthog.init posthog.capture posthog.identify posthog.alias posthog.group posthog.reset autocapture capture_pageview opt_in_capturing opt_out_capturing before_send getFeatureFlag onFeatureFlags session_recording");
    expect(analyticsReadinessText).toContain("\"analyticsSetups\"");
    expect(analyticsReadinessText).toContain("\"eventSignals\"");
    expect(analyticsReadinessText).toContain("\"identitySignals\"");
    expect(analyticsReadinessText).toContain("\"privacySignals\"");
    expect(analyticsReadinessText).toContain("\"productSignals\"");
    expect(analyticsReadinessText).toContain("\"packageSignals\"");
    expect(analyticsReadinessText).toContain("npx vitest run");
    const analyticsReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "analytics-readiness.html"), "utf8");
    expect(analyticsReadinessHtml).toContain("Analytics Readiness");
    expect(analyticsReadinessHtml).toContain("analytics-readiness-card");
    expect(analyticsReadinessHtml).toContain("data-source-pattern=\"PostHog\"");
    expect(analyticsReadinessHtml).toContain("Analytics Setups");
    expect(analyticsReadinessHtml).toContain("Privacy Signals");
    const analyticsReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "analytics-readiness.md"), "utf8");
    expect(analyticsReadinessMarkdown).toContain("# Analytics Readiness");
    expect(analyticsReadinessMarkdown).toContain("Source pattern: posthog.init");
    expect(analyticsReadinessMarkdown).toContain("## Event Signals");
    expect(analyticsReadinessMarkdown).toContain("## Product Signals");
    const httpClientReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "http-client-readiness-report.json"), "utf8");
    expect(httpClientReadinessText).toContain("got timeout retry limit methods statusCodes hooks beforeRequest afterResponse beforeRetry beforeError prefixUrl searchParams responseType throwHttpErrors HTTPError RequestError agent cache http2 pagination");
    expect(httpClientReadinessText).toContain("\"httpClientSetups\"");
    expect(httpClientReadinessText).toContain("\"requestSignals\"");
    expect(httpClientReadinessText).toContain("\"resilienceSignals\"");
    expect(httpClientReadinessText).toContain("\"configurationSignals\"");
    expect(httpClientReadinessText).toContain("\"transportSignals\"");
    expect(httpClientReadinessText).toContain("\"errorSignals\"");
    expect(httpClientReadinessText).toContain("\"packageSignals\"");
    expect(httpClientReadinessText).toContain("npx vitest run");
    const httpClientReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "http-client-readiness.html"), "utf8");
    expect(httpClientReadinessHtml).toContain("HTTP Client Readiness");
    expect(httpClientReadinessHtml).toContain("http-client-readiness-card");
    expect(httpClientReadinessHtml).toContain("data-source-pattern=\"Got\"");
    expect(httpClientReadinessHtml).toContain("HTTP Client Setups");
    expect(httpClientReadinessHtml).toContain("Transport Signals");
    const httpClientReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "http-client-readiness.md"), "utf8");
    expect(httpClientReadinessMarkdown).toContain("# HTTP Client Readiness");
    expect(httpClientReadinessMarkdown).toContain("Source pattern: got timeout");
    expect(httpClientReadinessMarkdown).toContain("## Resilience Signals");
    expect(httpClientReadinessMarkdown).toContain("## Error Signals");
    const schemaValidationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "schema-validation-readiness-report.json"), "utf8");
    expect(schemaValidationReadinessText).toContain("z.object z.array z.union z.discriminatedUnion parse safeParse parseAsync safeParseAsync z.infer z.input z.output refine superRefine transform preprocess coerce ZodError flatten treeifyError toJSONSchema");
    expect(schemaValidationReadinessText).toContain("\"schemaSetups\"");
    expect(schemaValidationReadinessText).toContain("\"shapeSignals\"");
    expect(schemaValidationReadinessText).toContain("\"parserSignals\"");
    expect(schemaValidationReadinessText).toContain("\"typeSignals\"");
    expect(schemaValidationReadinessText).toContain("\"refinementSignals\"");
    expect(schemaValidationReadinessText).toContain("\"errorSignals\"");
    expect(schemaValidationReadinessText).toContain("\"integrationSignals\"");
    expect(schemaValidationReadinessText).toContain("\"packageSignals\"");
    expect(schemaValidationReadinessText).toContain("npx vitest run");
    const schemaValidationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "schema-validation-readiness.html"), "utf8");
    expect(schemaValidationReadinessHtml).toContain("Schema Validation Readiness");
    expect(schemaValidationReadinessHtml).toContain("schema-validation-readiness-card");
    expect(schemaValidationReadinessHtml).toContain("data-source-pattern=\"Zod\"");
    expect(schemaValidationReadinessHtml).toContain("Schema Setups");
    expect(schemaValidationReadinessHtml).toContain("Refinement Signals");
    const schemaValidationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "schema-validation-readiness.md"), "utf8");
    expect(schemaValidationReadinessMarkdown).toContain("# Schema Validation Readiness");
    expect(schemaValidationReadinessMarkdown).toContain("Source pattern: z.object");
    expect(schemaValidationReadinessMarkdown).toContain("## Parser Signals");
    expect(schemaValidationReadinessMarkdown).toContain("## Error Signals");
    const dateTimeReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "datetime-readiness-report.json"), "utf8");
    expect(dateTimeReadinessText).toContain("DateTime Duration Interval Zone setZone fromISO fromFormat fromJSDate toISO toFormat toLocaleString diff plus minus startOf endOf isValid invalidReason Settings defaultZone");
    expect(dateTimeReadinessText).toContain("\"dateTimeSetups\"");
    expect(dateTimeReadinessText).toContain("\"constructionSignals\"");
    expect(dateTimeReadinessText).toContain("\"parsingSignals\"");
    expect(dateTimeReadinessText).toContain("\"formattingSignals\"");
    expect(dateTimeReadinessText).toContain("\"zoneSignals\"");
    expect(dateTimeReadinessText).toContain("\"durationSignals\"");
    expect(dateTimeReadinessText).toContain("\"validitySignals\"");
    expect(dateTimeReadinessText).toContain("\"packageSignals\"");
    expect(dateTimeReadinessText).toContain("npx vitest run");
    const dateTimeReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "datetime-readiness.html"), "utf8");
    expect(dateTimeReadinessHtml).toContain("Datetime Readiness");
    expect(dateTimeReadinessHtml).toContain("datetime-readiness-card");
    expect(dateTimeReadinessHtml).toContain("data-source-pattern=\"Luxon\"");
    expect(dateTimeReadinessHtml).toContain("DateTime Setups");
    expect(dateTimeReadinessHtml).toContain("Zone Signals");
    const dateTimeReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "datetime-readiness.md"), "utf8");
    expect(dateTimeReadinessMarkdown).toContain("# Datetime Readiness");
    expect(dateTimeReadinessMarkdown).toContain("Source pattern: DateTime");
    expect(dateTimeReadinessMarkdown).toContain("## Parsing Signals");
    expect(dateTimeReadinessMarkdown).toContain("## Validity Signals");
    const idGenerationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "id-generation-readiness-report.json"), "utf8");
    expect(idGenerationReadinessText).toContain("nanoid customAlphabet customRandom urlAlphabet random nanoid/non-secure crypto.getRandomValues Math.random --size --alphabet react-native-get-random-values");
    expect(idGenerationReadinessText).toContain("\"idGeneratorSetups\"");
    expect(idGenerationReadinessText).toContain("\"generationSignals\"");
    expect(idGenerationReadinessText).toContain("\"entropySignals\"");
    expect(idGenerationReadinessText).toContain("\"alphabetSignals\"");
    expect(idGenerationReadinessText).toContain("\"runtimeSignals\"");
    expect(idGenerationReadinessText).toContain("\"usageSignals\"");
    expect(idGenerationReadinessText).toContain("\"validationSignals\"");
    expect(idGenerationReadinessText).toContain("\"packageSignals\"");
    expect(idGenerationReadinessText).toContain("npx vitest run");
    const idGenerationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "id-generation-readiness.html"), "utf8");
    expect(idGenerationReadinessHtml).toContain("ID Generation Readiness");
    expect(idGenerationReadinessHtml).toContain("id-generation-readiness-card");
    expect(idGenerationReadinessHtml).toContain("data-source-pattern=\"Nano ID\"");
    expect(idGenerationReadinessHtml).toContain("ID Generator Setups");
    expect(idGenerationReadinessHtml).toContain("Entropy Signals");
    const idGenerationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "id-generation-readiness.md"), "utf8");
    expect(idGenerationReadinessMarkdown).toContain("# ID Generation Readiness");
    expect(idGenerationReadinessMarkdown).toContain("Source pattern: nanoid");
    expect(idGenerationReadinessMarkdown).toContain("## Entropy Signals");
    expect(idGenerationReadinessMarkdown).toContain("## Validation Signals");
    const imageProcessingReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "image-processing-readiness-report.json"), "utf8");
    expect(imageProcessingReadinessText).toContain("sharp resize toFormat jpeg png webp avif metadata rotate composite pipeline stream toBuffer toFile cache concurrency limitInputPixels");
    expect(imageProcessingReadinessText).toContain("\"imageProcessingSetups\"");
    expect(imageProcessingReadinessText).toContain("\"inputSignals\"");
    expect(imageProcessingReadinessText).toContain("\"transformSignals\"");
    expect(imageProcessingReadinessText).toContain("\"outputSignals\"");
    expect(imageProcessingReadinessText).toContain("\"safetySignals\"");
    expect(imageProcessingReadinessText).toContain("\"performanceSignals\"");
    expect(imageProcessingReadinessText).toContain("\"packageSignals\"");
    expect(imageProcessingReadinessText).toContain("npx vitest run");
    const imageProcessingReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "image-processing-readiness.html"), "utf8");
    expect(imageProcessingReadinessHtml).toContain("Image Processing Readiness");
    expect(imageProcessingReadinessHtml).toContain("image-processing-readiness-card");
    expect(imageProcessingReadinessHtml).toContain("data-source-pattern=\"Sharp\"");
    expect(imageProcessingReadinessHtml).toContain("Image Processing Setups");
    expect(imageProcessingReadinessHtml).toContain("Safety Signals");
    const imageProcessingReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "image-processing-readiness.md"), "utf8");
    expect(imageProcessingReadinessMarkdown).toContain("# Image Processing Readiness");
    expect(imageProcessingReadinessMarkdown).toContain("Source pattern: sharp");
    expect(imageProcessingReadinessMarkdown).toContain("## Transform Signals");
    expect(imageProcessingReadinessMarkdown).toContain("## Safety Signals");
    const fileUploadReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "file-upload-readiness-report.json"), "utf8");
    expect(fileUploadReadinessText).toContain("Uppy Dashboard DragDrop FileInput restrictions allowedFileTypes maxFileSize maxNumberOfFiles metaFields XHRUpload Tus AwsS3 Companion upload-progress complete error cancel retry");
    expect(fileUploadReadinessText).toContain("\"fileUploadSetups\"");
    expect(fileUploadReadinessText).toContain("\"inputSignals\"");
    expect(fileUploadReadinessText).toContain("\"restrictionSignals\"");
    expect(fileUploadReadinessText).toContain("\"transportSignals\"");
    expect(fileUploadReadinessText).toContain("\"lifecycleSignals\"");
    expect(fileUploadReadinessText).toContain("\"safetySignals\"");
    expect(fileUploadReadinessText).toContain("\"packageSignals\"");
    expect(fileUploadReadinessText).toContain("npx vitest run");
    const fileUploadReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "file-upload-readiness.html"), "utf8");
    expect(fileUploadReadinessHtml).toContain("File Upload Readiness");
    expect(fileUploadReadinessHtml).toContain("file-upload-readiness-card");
    expect(fileUploadReadinessHtml).toContain("data-source-pattern=\"Uppy\"");
    expect(fileUploadReadinessHtml).toContain("File Upload Setups");
    expect(fileUploadReadinessHtml).toContain("Transport Signals");
    const fileUploadReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "file-upload-readiness.md"), "utf8");
    expect(fileUploadReadinessMarkdown).toContain("# File Upload Readiness");
    expect(fileUploadReadinessMarkdown).toContain("Source pattern: Uppy");
    expect(fileUploadReadinessMarkdown).toContain("## Restriction Signals");
    expect(fileUploadReadinessMarkdown).toContain("## Lifecycle Signals");
    const webSocketReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "websocket-readiness-report.json"), "utf8");
    expect(webSocketReadinessText).toContain("ws WebSocket WebSocketServer upgrade connection message send close error ping pong perMessageDeflate backpressure maxPayload");
    expect(webSocketReadinessText).toContain("\"webSocketSetups\"");
    expect(webSocketReadinessText).toContain("\"connectionSignals\"");
    expect(webSocketReadinessText).toContain("\"messageSignals\"");
    expect(webSocketReadinessText).toContain("\"lifecycleSignals\"");
    expect(webSocketReadinessText).toContain("\"safetySignals\"");
    expect(webSocketReadinessText).toContain("\"packageSignals\"");
    expect(webSocketReadinessText).toContain("npx vitest run");
    const webSocketReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "websocket-readiness.html"), "utf8");
    expect(webSocketReadinessHtml).toContain("WebSocket Readiness");
    expect(webSocketReadinessHtml).toContain("websocket-readiness-card");
    expect(webSocketReadinessHtml).toContain("data-source-pattern=\"ws\"");
    expect(webSocketReadinessHtml).toContain("WebSocket Setups");
    expect(webSocketReadinessHtml).toContain("Message Signals");
    const webSocketReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "websocket-readiness.md"), "utf8");
    expect(webSocketReadinessMarkdown).toContain("# WebSocket Readiness");
    expect(webSocketReadinessMarkdown).toContain("Source pattern: ws");
    expect(webSocketReadinessMarkdown).toContain("## Connection Signals");
    expect(webSocketReadinessMarkdown).toContain("## Safety Signals");
    const pdfGenerationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "pdf-generation-readiness-report.json"), "utf8");
    expect(pdfGenerationReadinessText).toContain("pdf-lib PDFDocument create load addPage drawText drawImage embedFont embedPng embedJpg getForm createTextField setText copyPages save saveAsBase64");
    expect(pdfGenerationReadinessText).toContain("\"pdfGenerationSetups\"");
    expect(pdfGenerationReadinessText).toContain("\"documentSignals\"");
    expect(pdfGenerationReadinessText).toContain("\"pageSignals\"");
    expect(pdfGenerationReadinessText).toContain("\"assetSignals\"");
    expect(pdfGenerationReadinessText).toContain("\"formSignals\"");
    expect(pdfGenerationReadinessText).toContain("\"outputSignals\"");
    expect(pdfGenerationReadinessText).toContain("\"safetySignals\"");
    expect(pdfGenerationReadinessText).toContain("\"packageSignals\"");
    expect(pdfGenerationReadinessText).toContain("npx vitest run");
    const pdfGenerationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "pdf-generation-readiness.html"), "utf8");
    expect(pdfGenerationReadinessHtml).toContain("PDF Generation Readiness");
    expect(pdfGenerationReadinessHtml).toContain("pdf-generation-readiness-card");
    expect(pdfGenerationReadinessHtml).toContain("data-source-pattern=\"pdf-lib\"");
    expect(pdfGenerationReadinessHtml).toContain("PDF Generation Setups");
    expect(pdfGenerationReadinessHtml).toContain("Output Signals");
    const pdfGenerationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "pdf-generation-readiness.md"), "utf8");
    expect(pdfGenerationReadinessMarkdown).toContain("# PDF Generation Readiness");
    expect(pdfGenerationReadinessMarkdown).toContain("Source pattern: pdf-lib");
    expect(pdfGenerationReadinessMarkdown).toContain("## Document Signals");
    expect(pdfGenerationReadinessMarkdown).toContain("## Output Signals");
    const spreadsheetReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "spreadsheet-readiness-report.json"), "utf8");
    expect(spreadsheetReadinessText).toContain("SheetJS XLSX readFile writeFile read write book_new book_append_sheet json_to_sheet sheet_to_json aoa_to_sheet table_to_sheet CSV workbook worksheet");
    expect(spreadsheetReadinessText).toContain("\"spreadsheetSetups\"");
    expect(spreadsheetReadinessText).toContain("\"workbookSignals\"");
    expect(spreadsheetReadinessText).toContain("\"sheetSignals\"");
    expect(spreadsheetReadinessText).toContain("\"formatSignals\"");
    expect(spreadsheetReadinessText).toContain("\"inputSignals\"");
    expect(spreadsheetReadinessText).toContain("\"outputSignals\"");
    expect(spreadsheetReadinessText).toContain("\"safetySignals\"");
    expect(spreadsheetReadinessText).toContain("\"packageSignals\"");
    expect(spreadsheetReadinessText).toContain("npx vitest run");
    const spreadsheetReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "spreadsheet-readiness.html"), "utf8");
    expect(spreadsheetReadinessHtml).toContain("Spreadsheet Readiness");
    expect(spreadsheetReadinessHtml).toContain("spreadsheet-readiness-card");
    expect(spreadsheetReadinessHtml).toContain("data-source-pattern=\"SheetJS\"");
    expect(spreadsheetReadinessHtml).toContain("Spreadsheet Setups");
    expect(spreadsheetReadinessHtml).toContain("Output Signals");
    const spreadsheetReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "spreadsheet-readiness.md"), "utf8");
    expect(spreadsheetReadinessMarkdown).toContain("# Spreadsheet Readiness");
    expect(spreadsheetReadinessMarkdown).toContain("Source pattern: SheetJS");
    expect(spreadsheetReadinessMarkdown).toContain("## Workbook Signals");
    expect(spreadsheetReadinessMarkdown).toContain("## Output Signals");
    const chartVisualizationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "chart-visualization-readiness-report.json"), "utf8");
    expect(chartVisualizationReadinessText).toContain("Chart.js new Chart Chart.register registerables datasets scales tooltip legend responsive canvas update resize destroy toBase64Image decimation");
    expect(chartVisualizationReadinessText).toContain("\"chartSetups\"");
    expect(chartVisualizationReadinessText).toContain("\"chartTypeSignals\"");
    expect(chartVisualizationReadinessText).toContain("\"dataSignals\"");
    expect(chartVisualizationReadinessText).toContain("\"scaleSignals\"");
    expect(chartVisualizationReadinessText).toContain("\"interactionSignals\"");
    expect(chartVisualizationReadinessText).toContain("\"renderSignals\"");
    expect(chartVisualizationReadinessText).toContain("\"lifecycleSignals\"");
    expect(chartVisualizationReadinessText).toContain("\"safetySignals\"");
    expect(chartVisualizationReadinessText).toContain("\"packageSignals\"");
    expect(chartVisualizationReadinessText).toContain("npx vitest run");
    const chartVisualizationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "chart-visualization-readiness.html"), "utf8");
    expect(chartVisualizationReadinessHtml).toContain("Chart Visualization Readiness");
    expect(chartVisualizationReadinessHtml).toContain("chart-visualization-readiness-card");
    expect(chartVisualizationReadinessHtml).toContain("data-source-pattern=\"Chart.js\"");
    expect(chartVisualizationReadinessHtml).toContain("Chart Setups");
    expect(chartVisualizationReadinessHtml).toContain("Render Signals");
    const chartVisualizationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "chart-visualization-readiness.md"), "utf8");
    expect(chartVisualizationReadinessMarkdown).toContain("# Chart Visualization Readiness");
    expect(chartVisualizationReadinessMarkdown).toContain("Source pattern: Chart.js");
    expect(chartVisualizationReadinessMarkdown).toContain("## Chart Type Signals");
    expect(chartVisualizationReadinessMarkdown).toContain("## Render Signals");
    const diagramRenderingReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "diagram-rendering-readiness-report.json"), "utf8");
    expect(diagramRenderingReadinessText).toContain("Mermaid mermaid.initialize mermaid.run mermaid.render mermaid.parse flowchart sequenceDiagram classDiagram stateDiagram erDiagram gantt journey mindmap securityLevel theme svg sandbox");
    expect(diagramRenderingReadinessText).toContain("\"diagramSetups\"");
    expect(diagramRenderingReadinessText).toContain("\"diagramTypeSignals\"");
    expect(diagramRenderingReadinessText).toContain("\"renderSignals\"");
    expect(diagramRenderingReadinessText).toContain("\"themeSignals\"");
    expect(diagramRenderingReadinessText).toContain("\"securitySignals\"");
    expect(diagramRenderingReadinessText).toContain("\"layoutSignals\"");
    expect(diagramRenderingReadinessText).toContain("\"outputSignals\"");
    expect(diagramRenderingReadinessText).toContain("\"packageSignals\"");
    expect(diagramRenderingReadinessText).toContain("npx vitest run");
    const diagramRenderingReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "diagram-rendering-readiness.html"), "utf8");
    expect(diagramRenderingReadinessHtml).toContain("Diagram Rendering Readiness");
    expect(diagramRenderingReadinessHtml).toContain("diagram-rendering-readiness-card");
    expect(diagramRenderingReadinessHtml).toContain("data-source-pattern=\"Mermaid\"");
    expect(diagramRenderingReadinessHtml).toContain("Diagram Setups");
    expect(diagramRenderingReadinessHtml).toContain("Security Signals");
    const diagramRenderingReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "diagram-rendering-readiness.md"), "utf8");
    expect(diagramRenderingReadinessMarkdown).toContain("# Diagram Rendering Readiness");
    expect(diagramRenderingReadinessMarkdown).toContain("Source pattern: Mermaid");
    expect(diagramRenderingReadinessMarkdown).toContain("## Diagram Type Signals");
    expect(diagramRenderingReadinessMarkdown).toContain("## Security Signals");
    const linkIntegrityReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "link-integrity-readiness-report.json"), "utf8");
    expect(linkIntegrityReadinessText).toContain("Lychee link checker markdown html reStructuredText website mail sitemap accept status exclude include scheme timeout retry headers github-token offline output cache");
    expect(linkIntegrityReadinessText).toContain("\"linkSetups\"");
    expect(linkIntegrityReadinessText).toContain("\"targetSignals\"");
    expect(linkIntegrityReadinessText).toContain("\"policySignals\"");
    expect(linkIntegrityReadinessText).toContain("\"networkSignals\"");
    expect(linkIntegrityReadinessText).toContain("\"outputSignals\"");
    expect(linkIntegrityReadinessText).toContain("\"ciSignals\"");
    expect(linkIntegrityReadinessText).toContain("\"packageSignals\"");
    expect(linkIntegrityReadinessText).toContain("npx vitest run");
    const linkIntegrityReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "link-integrity-readiness.html"), "utf8");
    expect(linkIntegrityReadinessHtml).toContain("Link Integrity Readiness");
    expect(linkIntegrityReadinessHtml).toContain("link-integrity-readiness-card");
    expect(linkIntegrityReadinessHtml).toContain("data-source-pattern=\"Lychee\"");
    expect(linkIntegrityReadinessHtml).toContain("Link Setups");
    expect(linkIntegrityReadinessHtml).toContain("Network Signals");
    const linkIntegrityReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "link-integrity-readiness.md"), "utf8");
    expect(linkIntegrityReadinessMarkdown).toContain("# Link Integrity Readiness");
    expect(linkIntegrityReadinessMarkdown).toContain("Source pattern: Lychee");
    expect(linkIntegrityReadinessMarkdown).toContain("## Target Signals");
    expect(linkIntegrityReadinessMarkdown).toContain("## Network Signals");
    const seoMetadataReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "seo-metadata-readiness-report.json"), "utf8");
    expect(seoMetadataReadinessText).toContain("Nuxt SEO robots sitemap Schema.org OpenGraph meta tags canonical siteUrl indexable i18n hreflang JSON-LD AEO llms");
    expect(seoMetadataReadinessText).toContain("\"seoSetups\"");
    expect(seoMetadataReadinessText).toContain("\"crawlSignals\"");
    expect(seoMetadataReadinessText).toContain("\"sitemapSignals\"");
    expect(seoMetadataReadinessText).toContain("\"metadataSignals\"");
    expect(seoMetadataReadinessText).toContain("\"structuredDataSignals\"");
    expect(seoMetadataReadinessText).toContain("\"aiReadinessSignals\"");
    expect(seoMetadataReadinessText).toContain("\"packageSignals\"");
    expect(seoMetadataReadinessText).toContain("npx vitest run");
    const seoMetadataReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "seo-metadata-readiness.html"), "utf8");
    expect(seoMetadataReadinessHtml).toContain("SEO Metadata Readiness");
    expect(seoMetadataReadinessHtml).toContain("seo-metadata-readiness-card");
    expect(seoMetadataReadinessHtml).toContain("data-source-pattern=\"Nuxt SEO\"");
    expect(seoMetadataReadinessHtml).toContain("SEO Setups");
    expect(seoMetadataReadinessHtml).toContain("Structured Data Signals");
    const seoMetadataReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "seo-metadata-readiness.md"), "utf8");
    expect(seoMetadataReadinessMarkdown).toContain("# SEO Metadata Readiness");
    expect(seoMetadataReadinessMarkdown).toContain("Source pattern: Nuxt SEO");
    expect(seoMetadataReadinessMarkdown).toContain("## Crawl Signals");
    expect(seoMetadataReadinessMarkdown).toContain("## Structured Data Signals");
    const pwaReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "pwa-readiness-report.json"), "utf8");
    expect(pwaReadinessText).toContain("Vite PWA manifest webmanifest service worker registerSW Workbox generateSW injectManifest precache runtimeCaching offline icons theme_color start_url display");
    expect(pwaReadinessText).toContain("\"pwaSetups\"");
    expect(pwaReadinessText).toContain("\"manifestSignals\"");
    expect(pwaReadinessText).toContain("\"serviceWorkerSignals\"");
    expect(pwaReadinessText).toContain("\"cachingSignals\"");
    expect(pwaReadinessText).toContain("\"updateSignals\"");
    expect(pwaReadinessText).toContain("\"installSignals\"");
    expect(pwaReadinessText).toContain("\"packageSignals\"");
    expect(pwaReadinessText).toContain("npx vitest run");
    const pwaReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "pwa-readiness.html"), "utf8");
    expect(pwaReadinessHtml).toContain("PWA Readiness");
    expect(pwaReadinessHtml).toContain("pwa-readiness-card");
    expect(pwaReadinessHtml).toContain("data-source-pattern=\"Vite PWA\"");
    expect(pwaReadinessHtml).toContain("PWA Setups");
    expect(pwaReadinessHtml).toContain("Service Worker Signals");
    const pwaReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "pwa-readiness.md"), "utf8");
    expect(pwaReadinessMarkdown).toContain("# PWA Readiness");
    expect(pwaReadinessMarkdown).toContain("Source pattern: Vite PWA");
    expect(pwaReadinessMarkdown).toContain("## Manifest Signals");
    expect(pwaReadinessMarkdown).toContain("## Service Worker Signals");
    const browserCompatibilityReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "browser-compat-readiness-report.json"), "utf8");
    expect(browserCompatibilityReadinessText).toContain("Browserslist target browsers config queries coverage caniuse-lite update-browserslist-db mobile-to-desktop env stats");
    expect(browserCompatibilityReadinessText).toContain("\"compatibilitySetups\"");
    expect(browserCompatibilityReadinessText).toContain("\"configSignals\"");
    expect(browserCompatibilityReadinessText).toContain("\"querySignals\"");
    expect(browserCompatibilityReadinessText).toContain("\"coverageSignals\"");
    expect(browserCompatibilityReadinessText).toContain("\"featureSignals\"");
    expect(browserCompatibilityReadinessText).toContain("\"updateSignals\"");
    expect(browserCompatibilityReadinessText).toContain("\"packageSignals\"");
    expect(browserCompatibilityReadinessText).toContain("npx browserslist");
    const browserCompatibilityReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "browser-compat-readiness.html"), "utf8");
    expect(browserCompatibilityReadinessHtml).toContain("Browser Compatibility Readiness");
    expect(browserCompatibilityReadinessHtml).toContain("browser-compat-readiness-card");
    expect(browserCompatibilityReadinessHtml).toContain("data-source-pattern=\"Browserslist\"");
    expect(browserCompatibilityReadinessHtml).toContain("Compatibility Setups");
    expect(browserCompatibilityReadinessHtml).toContain("Query Signals");
    const browserCompatibilityReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "browser-compat-readiness.md"), "utf8");
    expect(browserCompatibilityReadinessMarkdown).toContain("# Browser Compatibility Readiness");
    expect(browserCompatibilityReadinessMarkdown).toContain("Source pattern: Browserslist");
    expect(browserCompatibilityReadinessMarkdown).toContain("## Config Signals");
    expect(browserCompatibilityReadinessMarkdown).toContain("## Query Signals");
    const envValidationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "env-validation-readiness-report.json"), "utf8");
    expect(envValidationReadinessText).toContain("t3-env createEnv server client shared runtimeEnv runtimeEnvStrict clientPrefix Standard Schema process.env import.meta.env emptyStringAsUndefined skipValidation");
    expect(envValidationReadinessText).toContain("\"envSetups\"");
    expect(envValidationReadinessText).toContain("\"schemaSignals\"");
    expect(envValidationReadinessText).toContain("\"runtimeSignals\"");
    expect(envValidationReadinessText).toContain("\"boundarySignals\"");
    expect(envValidationReadinessText).toContain("\"validationSignals\"");
    expect(envValidationReadinessText).toContain("\"documentationSignals\"");
    expect(envValidationReadinessText).toContain("\"packageSignals\"");
    expect(envValidationReadinessText).toContain("pnpm build");
    const envValidationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "env-validation-readiness.html"), "utf8");
    expect(envValidationReadinessHtml).toContain("Env Validation Readiness");
    expect(envValidationReadinessHtml).toContain("env-validation-readiness-card");
    expect(envValidationReadinessHtml).toContain("data-source-pattern=\"t3-env\"");
    expect(envValidationReadinessHtml).toContain("Env Setups");
    expect(envValidationReadinessHtml).toContain("Runtime Signals");
    const envValidationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "env-validation-readiness.md"), "utf8");
    expect(envValidationReadinessMarkdown).toContain("# Env Validation Readiness");
    expect(envValidationReadinessMarkdown).toContain("Source pattern: t3-env");
    expect(envValidationReadinessMarkdown).toContain("## Schema Signals");
    expect(envValidationReadinessMarkdown).toContain("## Runtime Signals");
    const securityHeadersReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "security-headers-readiness-report.json"), "utf8");
    expect(securityHeadersReadinessText).toContain("Helmet Content-Security-Policy Strict-Transport-Security Cross-Origin-Opener-Policy Cross-Origin-Resource-Policy X-Frame-Options Referrer-Policy X-Content-Type-Options X-Powered-By");
    expect(securityHeadersReadinessText).toContain("\"headerSetups\"");
    expect(securityHeadersReadinessText).toContain("\"cspSignals\"");
    expect(securityHeadersReadinessText).toContain("\"transportSignals\"");
    expect(securityHeadersReadinessText).toContain("\"crossOriginSignals\"");
    expect(securityHeadersReadinessText).toContain("\"legacyHeaderSignals\"");
    expect(securityHeadersReadinessText).toContain("\"middlewareSignals\"");
    expect(securityHeadersReadinessText).toContain("\"packageSignals\"");
    expect(securityHeadersReadinessText).toContain("curl -I <preview-url>");
    const securityHeadersReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "security-headers-readiness.html"), "utf8");
    expect(securityHeadersReadinessHtml).toContain("Security Headers Readiness");
    expect(securityHeadersReadinessHtml).toContain("security-headers-readiness-card");
    expect(securityHeadersReadinessHtml).toContain("data-source-pattern=\"Helmet\"");
    expect(securityHeadersReadinessHtml).toContain("Header Setups");
    expect(securityHeadersReadinessHtml).toContain("CSP Signals");
    const securityHeadersReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "security-headers-readiness.md"), "utf8");
    expect(securityHeadersReadinessMarkdown).toContain("# Security Headers Readiness");
    expect(securityHeadersReadinessMarkdown).toContain("Source pattern: Helmet");
    expect(securityHeadersReadinessMarkdown).toContain("## CSP Signals");
    expect(securityHeadersReadinessMarkdown).toContain("## Transport Signals");
    const graphqlReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "graphql-readiness-report.json"), "utf8");
    expect(graphqlReadinessText).toContain("GraphQL.js GraphQLSchema GraphQLObjectType buildSchema parse validate execute subscribe introspection typed documents resolvers");
    expect(graphqlReadinessText).toContain("\"graphqlSetups\"");
    expect(graphqlReadinessText).toContain("\"schemaSignals\"");
    expect(graphqlReadinessText).toContain("\"operationSignals\"");
    expect(graphqlReadinessText).toContain("\"resolverSignals\"");
    expect(graphqlReadinessText).toContain("\"validationSignals\"");
    expect(graphqlReadinessText).toContain("\"executionSignals\"");
    expect(graphqlReadinessText).toContain("\"clientSignals\"");
    expect(graphqlReadinessText).toContain("\"codegenSignals\"");
    expect(graphqlReadinessText).toContain("TypedDocumentNode");
    const graphqlReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "graphql-readiness.html"), "utf8");
    expect(graphqlReadinessHtml).toContain("GraphQL Readiness");
    expect(graphqlReadinessHtml).toContain("graphql-readiness-card");
    expect(graphqlReadinessHtml).toContain("data-source-pattern=\"GraphQL.js\"");
    expect(graphqlReadinessHtml).toContain("GraphQL Setups");
    expect(graphqlReadinessHtml).toContain("Validation Signals");
    const graphqlReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "graphql-readiness.md"), "utf8");
    expect(graphqlReadinessMarkdown).toContain("# GraphQL Readiness");
    expect(graphqlReadinessMarkdown).toContain("Source pattern: GraphQL.js");
    expect(graphqlReadinessMarkdown).toContain("## Schema Signals");
    expect(graphqlReadinessMarkdown).toContain("## Execution Signals");
    const cliReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "cli-readiness-report.json"), "utf8");
    expect(cliReadinessText).toContain("Commander.js Command option requiredOption argument action parseAsync help usage exitOverride showHelpAfterError");
    expect(cliReadinessText).toContain("\"cliSetups\"");
    expect(cliReadinessText).toContain("\"commandSignals\"");
    expect(cliReadinessText).toContain("\"optionSignals\"");
    expect(cliReadinessText).toContain("\"parseSignals\"");
    expect(cliReadinessText).toContain("\"actionSignals\"");
    expect(cliReadinessText).toContain("\"helpSignals\"");
    expect(cliReadinessText).toContain("\"errorSignals\"");
    expect(cliReadinessText).toContain("\"packageSignals\"");
    expect(cliReadinessText).toContain("Commander.js");
    const cliReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "cli-readiness.html"), "utf8");
    expect(cliReadinessHtml).toContain("CLI Readiness");
    expect(cliReadinessHtml).toContain("cli-readiness-card");
    expect(cliReadinessHtml).toContain("data-source-pattern=\"Commander.js\"");
    expect(cliReadinessHtml).toContain("CLI Setups");
    expect(cliReadinessHtml).toContain("Help Signals");
    const cliReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "cli-readiness.md"), "utf8");
    expect(cliReadinessMarkdown).toContain("# CLI Readiness");
    expect(cliReadinessMarkdown).toContain("Source pattern: Commander.js");
    expect(cliReadinessMarkdown).toContain("## Command Signals");
    expect(cliReadinessMarkdown).toContain("## Error Signals");
    const llmReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8");
    expect(llmReadinessText).toContain("LangChain.js ChatOpenAI ChatPromptTemplate RunnableSequence tool createAgent VectorStore Retriever StructuredOutputParser stream callbacks LangSmith");
    expect(llmReadinessText).toContain("\"llmSetups\"");
    expect(llmReadinessText).toContain("\"modelSignals\"");
    expect(llmReadinessText).toContain("\"promptSignals\"");
    expect(llmReadinessText).toContain("\"toolSignals\"");
    expect(llmReadinessText).toContain("\"retrievalSignals\"");
    expect(llmReadinessText).toContain("\"structuredOutputSignals\"");
    expect(llmReadinessText).toContain("\"streamingSignals\"");
    expect(llmReadinessText).toContain("\"safetySignals\"");
    expect(llmReadinessText).toContain("\"packageSignals\"");
    expect(llmReadinessText).toContain("LangChain.js");
    const llmReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "llm-readiness.html"), "utf8");
    expect(llmReadinessHtml).toContain("LLM Readiness");
    expect(llmReadinessHtml).toContain("llm-readiness-card");
    expect(llmReadinessHtml).toContain("data-source-pattern=\"LangChain.js\"");
    expect(llmReadinessHtml).toContain("LLM Setups");
    expect(llmReadinessHtml).toContain("Structured Output Signals");
    const llmReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "llm-readiness.md"), "utf8");
    expect(llmReadinessMarkdown).toContain("# LLM Readiness");
    expect(llmReadinessMarkdown).toContain("Source pattern: LangChain.js");
    expect(llmReadinessMarkdown).toContain("## Model Signals");
    expect(llmReadinessMarkdown).toContain("## Streaming Signals");
    const serverFrameworkReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8");
    expect(serverFrameworkReadinessText).toContain("Fastify fastify route get post schema register plugin addHook decorate setErrorHandler listen inject logger");
    expect(serverFrameworkReadinessText).toContain("\"serverSetups\"");
    expect(serverFrameworkReadinessText).toContain("\"routeSignals\"");
    expect(serverFrameworkReadinessText).toContain("\"schemaSignals\"");
    expect(serverFrameworkReadinessText).toContain("\"pluginSignals\"");
    expect(serverFrameworkReadinessText).toContain("\"lifecycleSignals\"");
    expect(serverFrameworkReadinessText).toContain("\"runtimeSignals\"");
    expect(serverFrameworkReadinessText).toContain("\"errorSignals\"");
    expect(serverFrameworkReadinessText).toContain("\"testSignals\"");
    expect(serverFrameworkReadinessText).toContain("Fastify");
    const serverFrameworkReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(serverFrameworkReadinessHtml).toContain("Server Framework Readiness");
    expect(serverFrameworkReadinessHtml).toContain("server-framework-readiness-card");
    expect(serverFrameworkReadinessHtml).toContain("data-source-pattern=\"Fastify\"");
    expect(serverFrameworkReadinessHtml).toContain("Server Setups");
    expect(serverFrameworkReadinessHtml).toContain("Lifecycle Signals");
    const serverFrameworkReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(serverFrameworkReadinessMarkdown).toContain("# Server Framework Readiness");
    expect(serverFrameworkReadinessMarkdown).toContain("Source pattern: Fastify");
    expect(serverFrameworkReadinessMarkdown).toContain("## Route Signals");
    expect(serverFrameworkReadinessMarkdown).toContain("## Runtime Signals");
    const rpcReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "rpc-readiness-report.json"), "utf8");
    expect(rpcReadinessText).toContain("tRPC initTRPC router procedure query mutation subscription input output middleware context createTRPCClient links adapters TRPCError createCaller");
    expect(rpcReadinessText).toContain("\"rpcSetups\"");
    expect(rpcReadinessText).toContain("\"routerSignals\"");
    expect(rpcReadinessText).toContain("\"procedureSignals\"");
    expect(rpcReadinessText).toContain("\"validationSignals\"");
    expect(rpcReadinessText).toContain("\"contextSignals\"");
    expect(rpcReadinessText).toContain("\"clientSignals\"");
    expect(rpcReadinessText).toContain("\"adapterSignals\"");
    expect(rpcReadinessText).toContain("tRPC");
    const rpcReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "rpc-readiness.html"), "utf8");
    expect(rpcReadinessHtml).toContain("RPC Readiness");
    expect(rpcReadinessHtml).toContain("rpc-readiness-card");
    expect(rpcReadinessHtml).toContain("data-source-pattern=\"tRPC\"");
    expect(rpcReadinessHtml).toContain("RPC Setups");
    expect(rpcReadinessHtml).toContain("Client Signals");
    const rpcReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "rpc-readiness.md"), "utf8");
    expect(rpcReadinessMarkdown).toContain("# RPC Readiness");
    expect(rpcReadinessMarkdown).toContain("Source pattern: tRPC");
    expect(rpcReadinessMarkdown).toContain("## Procedure Signals");
    expect(rpcReadinessMarkdown).toContain("## Adapter Signals");
    const workspaceGraphReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "workspace-graph-readiness-report.json"), "utf8");
    expect(workspaceGraphReadinessText).toContain("Nx project graph nx.json project.json targets targetDefaults namedInputs plugins createNodes affected tags implicitDependencies enforce-module-boundaries depConstraints");
    expect(workspaceGraphReadinessText).toContain("\"workspaceFiles\"");
    expect(workspaceGraphReadinessText).toContain("\"projectSignals\"");
    expect(workspaceGraphReadinessText).toContain("\"graphSignals\"");
    expect(workspaceGraphReadinessText).toContain("\"boundarySignals\"");
    expect(workspaceGraphReadinessText).toContain("\"affectedSignals\"");
    expect(workspaceGraphReadinessText).toContain("\"targetSignals\"");
    expect(workspaceGraphReadinessText).toContain("\"pluginSignals\"");
    expect(workspaceGraphReadinessText).toContain("Nx");
    const workspaceGraphReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "workspace-graph-readiness.html"), "utf8");
    expect(workspaceGraphReadinessHtml).toContain("Workspace Graph Readiness");
    expect(workspaceGraphReadinessHtml).toContain("workspace-graph-readiness-card");
    expect(workspaceGraphReadinessHtml).toContain("data-source-pattern=\"Nx\"");
    expect(workspaceGraphReadinessHtml).toContain("Workspace Files");
    expect(workspaceGraphReadinessHtml).toContain("Boundary Signals");
    const workspaceGraphReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "workspace-graph-readiness.md"), "utf8");
    expect(workspaceGraphReadinessMarkdown).toContain("# Workspace Graph Readiness");
    expect(workspaceGraphReadinessMarkdown).toContain("Source pattern: Nx");
    expect(workspaceGraphReadinessMarkdown).toContain("## Graph Signals");
    expect(workspaceGraphReadinessMarkdown).toContain("## Affected Signals");
    const scaffoldingReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "scaffolding-readiness-report.json"), "utf8");
    expect(scaffoldingReadinessText).toContain("Plop setGenerator prompts actions add addMany modify append templateFile helpers partials load skipIfExists force abortOnFail");
    expect(scaffoldingReadinessText).toContain("\"generatorFiles\"");
    expect(scaffoldingReadinessText).toContain("\"promptSignals\"");
    expect(scaffoldingReadinessText).toContain("\"actionSignals\"");
    expect(scaffoldingReadinessText).toContain("\"templateSignals\"");
    expect(scaffoldingReadinessText).toContain("\"safetySignals\"");
    expect(scaffoldingReadinessText).toContain("Plop");
    const scaffoldingReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "scaffolding-readiness.html"), "utf8");
    expect(scaffoldingReadinessHtml).toContain("Scaffolding Readiness");
    expect(scaffoldingReadinessHtml).toContain("scaffolding-readiness-card");
    expect(scaffoldingReadinessHtml).toContain("data-source-pattern=\"Plop\"");
    expect(scaffoldingReadinessHtml).toContain("Generator Files");
    expect(scaffoldingReadinessHtml).toContain("Template Signals");
    const scaffoldingReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "scaffolding-readiness.md"), "utf8");
    expect(scaffoldingReadinessMarkdown).toContain("# Scaffolding Readiness");
    expect(scaffoldingReadinessMarkdown).toContain("Source pattern: Plop");
    expect(scaffoldingReadinessMarkdown).toContain("## Action Signals");
    expect(scaffoldingReadinessMarkdown).toContain("## Safety Signals");
    const schedulerReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "scheduler-readiness-report.json"), "utf8");
    expect(schedulerReadinessText).toContain("node-cron schedule createTask cron expression timezone noOverlap maxExecutions start stop destroy execute validate ScheduledTask");
    expect(schedulerReadinessText).toContain("\"schedulerSetups\"");
    expect(schedulerReadinessText).toContain("\"scheduleSignals\"");
    expect(schedulerReadinessText).toContain("\"taskSignals\"");
    expect(schedulerReadinessText).toContain("\"lifecycleSignals\"");
    expect(schedulerReadinessText).toContain("\"reliabilitySignals\"");
    expect(schedulerReadinessText).toContain("node-cron");
    const schedulerReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "scheduler-readiness.html"), "utf8");
    expect(schedulerReadinessHtml).toContain("Scheduler Readiness");
    expect(schedulerReadinessHtml).toContain("scheduler-readiness-card");
    expect(schedulerReadinessHtml).toContain("data-source-pattern=\"node-cron\"");
    expect(schedulerReadinessHtml).toContain("Scheduler Setups");
    expect(schedulerReadinessHtml).toContain("Reliability Signals");
    const schedulerReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "scheduler-readiness.md"), "utf8");
    expect(schedulerReadinessMarkdown).toContain("# Scheduler Readiness");
    expect(schedulerReadinessMarkdown).toContain("Source pattern: node-cron");
    expect(schedulerReadinessMarkdown).toContain("## Schedule Signals");
    expect(schedulerReadinessMarkdown).toContain("## Reliability Signals");
    const buildToolReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "build-tool-readiness-report.json"), "utf8");
    expect(buildToolReadinessText).toContain("Vite defineConfig plugins createServer preview build optimizeDeps ssr loadEnv import.meta.env transformIndexHtml configureServer");
    expect(buildToolReadinessText).toContain("\"buildToolSetups\"");
    expect(buildToolReadinessText).toContain("\"configSignals\"");
    expect(buildToolReadinessText).toContain("\"pluginSignals\"");
    expect(buildToolReadinessText).toContain("\"devServerSignals\"");
    expect(buildToolReadinessText).toContain("\"dependencyOptimizationSignals\"");
    expect(buildToolReadinessText).toContain("Vite");
    const buildToolReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "build-tool-readiness.html"), "utf8");
    expect(buildToolReadinessHtml).toContain("Build Tool Readiness");
    expect(buildToolReadinessHtml).toContain("build-tool-readiness-card");
    expect(buildToolReadinessHtml).toContain("data-source-pattern=\"Vite\"");
    expect(buildToolReadinessHtml).toContain("Build Tool Setups");
    expect(buildToolReadinessHtml).toContain("Dependency Optimization Signals");
    const buildToolReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "build-tool-readiness.md"), "utf8");
    expect(buildToolReadinessMarkdown).toContain("# Build Tool Readiness");
    expect(buildToolReadinessMarkdown).toContain("Source pattern: Vite");
    expect(buildToolReadinessMarkdown).toContain("## Plugin Signals");
    expect(buildToolReadinessMarkdown).toContain("## Dependency Optimization Signals");
    const stylingReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "styling-readiness-report.json"), "utf8");
    expect(stylingReadinessText).toContain("Tailwind CSS @import tailwindcss @theme @utility @variant @source @config @plugin @apply content safelist darkMode prefix important");
    expect(stylingReadinessText).toContain("\"stylingSetups\"");
    expect(stylingReadinessText).toContain("\"directiveSignals\"");
    expect(stylingReadinessText).toContain("\"classSignals\"");
    expect(stylingReadinessText).toContain("\"integrationSignals\"");
    expect(stylingReadinessText).toContain("Tailwind CSS");
    const stylingReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "styling-readiness.html"), "utf8");
    expect(stylingReadinessHtml).toContain("Styling Readiness");
    expect(stylingReadinessHtml).toContain("styling-readiness-card");
    expect(stylingReadinessHtml).toContain("data-source-pattern=\"Tailwind CSS\"");
    expect(stylingReadinessHtml).toContain("Directive Signals");
    expect(stylingReadinessHtml).toContain("Integration Signals");
    const stylingReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "styling-readiness.md"), "utf8");
    expect(stylingReadinessMarkdown).toContain("# Styling Readiness");
    expect(stylingReadinessMarkdown).toContain("Source pattern: Tailwind CSS");
    expect(stylingReadinessMarkdown).toContain("## Directive Signals");
    expect(stylingReadinessMarkdown).toContain("## Integration Signals");
    const visualRegressionReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "visual-regression-readiness-report.json"), "utf8");
    expect(visualRegressionReadinessText).toContain("reg-suit regconfig actualDir expectedDir diffDir thresholdRate thresholdPixel matchingThreshold ximgdiff sync-expected compare publish report plugin storage notification");
    expect(visualRegressionReadinessText).toContain("\"visualRegressionSetups\"");
    expect(visualRegressionReadinessText).toContain("\"snapshotSignals\"");
    expect(visualRegressionReadinessText).toContain("\"thresholdSignals\"");
    expect(visualRegressionReadinessText).toContain("\"pluginSignals\"");
    expect(visualRegressionReadinessText).toContain("reg-suit");
    const visualRegressionReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "visual-regression-readiness.html"), "utf8");
    expect(visualRegressionReadinessHtml).toContain("Visual Regression Readiness");
    expect(visualRegressionReadinessHtml).toContain("visual-regression-readiness-card");
    expect(visualRegressionReadinessHtml).toContain("data-source-pattern=\"reg-suit\"");
    expect(visualRegressionReadinessHtml).toContain("Threshold Signals");
    expect(visualRegressionReadinessHtml).toContain("Plugin Signals");
    const visualRegressionReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "visual-regression-readiness.md"), "utf8");
    expect(visualRegressionReadinessMarkdown).toContain("# Visual Regression Readiness");
    expect(visualRegressionReadinessMarkdown).toContain("Source pattern: reg-suit");
    expect(visualRegressionReadinessMarkdown).toContain("## Threshold Signals");
    expect(visualRegressionReadinessMarkdown).toContain("## Plugin Signals");
    const infrastructureReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "infrastructure-readiness-report.json"), "utf8");
    expect(infrastructureReadinessText).toContain("OpenTofu terraform block provider resource data module variable output backend state lockfile init plan apply import workspace validate fmt test");
    expect(infrastructureReadinessText).toContain("\"infrastructureSetups\"");
    expect(infrastructureReadinessText).toContain("\"stateSignals\"");
    expect(infrastructureReadinessText).toContain("\"workflowSignals\"");
    expect(infrastructureReadinessText).toContain("\"policySignals\"");
    expect(infrastructureReadinessText).toContain("OpenTofu");
    const infrastructureReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "infrastructure-readiness.html"), "utf8");
    expect(infrastructureReadinessHtml).toContain("Infrastructure Readiness");
    expect(infrastructureReadinessHtml).toContain("infrastructure-readiness-card");
    expect(infrastructureReadinessHtml).toContain("data-source-pattern=\"OpenTofu\"");
    expect(infrastructureReadinessHtml).toContain("State Signals");
    expect(infrastructureReadinessHtml).toContain("Workflow Signals");
    const infrastructureReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "infrastructure-readiness.md"), "utf8");
    expect(infrastructureReadinessMarkdown).toContain("# Infrastructure Readiness");
    expect(infrastructureReadinessMarkdown).toContain("Source pattern: OpenTofu");
    expect(infrastructureReadinessMarkdown).toContain("## State Signals");
    expect(infrastructureReadinessMarkdown).toContain("## Workflow Signals");
    const deploymentReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "deployment-readiness-report.json"), "utf8");
    expect(deploymentReadinessText).toContain("Helm Chart.yaml values.yaml templates helm lint template install upgrade rollback dependency package repo test");
    expect(deploymentReadinessText).toContain("\"deploymentSetups\"");
    expect(deploymentReadinessText).toContain("\"chartSignals\"");
    expect(deploymentReadinessText).toContain("\"templateSignals\"");
    expect(deploymentReadinessText).toContain("\"releaseSignals\"");
    expect(deploymentReadinessText).toContain("\"safetySignals\"");
    expect(deploymentReadinessText).toContain("Helm");
    const deploymentReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "deployment-readiness.html"), "utf8");
    expect(deploymentReadinessHtml).toContain("Deployment Readiness");
    expect(deploymentReadinessHtml).toContain("deployment-readiness-card");
    expect(deploymentReadinessHtml).toContain("data-source-pattern=\"Helm\"");
    expect(deploymentReadinessHtml).toContain("Release Signals");
    expect(deploymentReadinessHtml).toContain("Safety Signals");
    const deploymentReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "deployment-readiness.md"), "utf8");
    expect(deploymentReadinessMarkdown).toContain("# Deployment Readiness");
    expect(deploymentReadinessMarkdown).toContain("Source pattern: Helm");
    expect(deploymentReadinessMarkdown).toContain("## Release Signals");
    expect(deploymentReadinessMarkdown).toContain("## Safety Signals");
    const serverlessReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "serverless-readiness-report.json"), "utf8");
    expect(serverlessReadinessText).toContain("Serverless Framework serverless.yml service provider runtime stage region functions handler events httpApi schedule sqs sns resources package plugins deploy invoke offline logs");
    expect(serverlessReadinessText).toContain("\"serverlessSetups\"");
    expect(serverlessReadinessText).toContain("\"eventSignals\"");
    expect(serverlessReadinessText).toContain("\"deploymentSignals\"");
    const serverlessReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "serverless-readiness.html"), "utf8");
    expect(serverlessReadinessHtml).toContain("Serverless Readiness");
    expect(serverlessReadinessHtml).toContain("serverless-readiness-card");
    expect(serverlessReadinessHtml).toContain("data-source-pattern=\"Serverless Framework\"");
    const serverlessReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "serverless-readiness.md"), "utf8");
    expect(serverlessReadinessMarkdown).toContain("# Serverless Readiness");
    expect(serverlessReadinessMarkdown).toContain("Source pattern: Serverless Framework");
    expect(serverlessReadinessMarkdown).toContain("## Event Signals");
    const mobileReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "mobile-readiness-report.json"), "utf8");
    expect(mobileReadinessText).toContain("Expo app.json app.config eas.json expo start expo run:ios expo run:android eas build eas update expo-updates runtimeVersion scheme plugins assets permissions");
    expect(mobileReadinessText).toContain("\"mobileSetups\"");
    expect(mobileReadinessText).toContain("\"platformSignals\"");
    expect(mobileReadinessText).toContain("\"updateSignals\"");
    const mobileReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "mobile-readiness.html"), "utf8");
    expect(mobileReadinessHtml).toContain("Mobile Readiness");
    expect(mobileReadinessHtml).toContain("mobile-readiness-card");
    expect(mobileReadinessHtml).toContain("data-source-pattern=\"Expo\"");
    const mobileReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "mobile-readiness.md"), "utf8");
    expect(mobileReadinessMarkdown).toContain("# Mobile Readiness");
    expect(mobileReadinessMarkdown).toContain("Source pattern: Expo");
    expect(mobileReadinessMarkdown).toContain("## Build Signals");
    const edgeReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "edge-readiness-report.json"), "utf8");
    expect(edgeReadinessText).toContain("Cloudflare Workers wrangler.toml compatibility_date main fetch handler bindings kv_namespaces r2_buckets d1_databases durable_objects queues services vars routes workers_dev wrangler dev deploy tail secret Miniflare vitest-pool-workers");
    expect(edgeReadinessText).toContain("\"edgeSetups\"");
    expect(edgeReadinessText).toContain("\"bindingSignals\"");
    expect(edgeReadinessText).toContain("\"deploymentSignals\"");
    const edgeReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "edge-readiness.html"), "utf8");
    expect(edgeReadinessHtml).toContain("Edge Readiness");
    expect(edgeReadinessHtml).toContain("edge-readiness-card");
    expect(edgeReadinessHtml).toContain("data-source-pattern=\"Cloudflare Workers\"");
    const edgeReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "edge-readiness.md"), "utf8");
    expect(edgeReadinessMarkdown).toContain("# Edge Readiness");
    expect(edgeReadinessMarkdown).toContain("Source pattern: Cloudflare Workers");
    expect(edgeReadinessMarkdown).toContain("## Binding Signals");
    const composeReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "compose-readiness-report.json"), "utf8");
    expect(composeReadinessText).toContain("Docker Compose compose.yaml docker-compose.yml services build image ports volumes networks depends_on healthcheck profiles env_file secrets configs docker compose config up build run logs ps watch wait");
    expect(composeReadinessText).toContain("\"composeSetups\"");
    expect(composeReadinessText).toContain("\"workflowSignals\"");
    expect(composeReadinessText).toContain("\"resourceSignals\"");
    const composeReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "compose-readiness.html"), "utf8");
    expect(composeReadinessHtml).toContain("Compose Readiness");
    expect(composeReadinessHtml).toContain("compose-readiness-card");
    expect(composeReadinessHtml).toContain("data-source-pattern=\"Docker Compose\"");
    const composeReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "compose-readiness.md"), "utf8");
    expect(composeReadinessMarkdown).toContain("# Compose Readiness");
    expect(composeReadinessMarkdown).toContain("Source pattern: Docker Compose");
    expect(composeReadinessMarkdown).toContain("## Workflow Signals");
    const devContainerReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "devcontainer-readiness-report.json"), "utf8");
    expect(devContainerReadinessText).toContain("Dev Containers devcontainer.json .devcontainer devcontainer build up exec read-configuration run-user-commands features templates postCreateCommand forwardPorts customizations remoteUser containerEnv mounts workspaceFolder");
    expect(devContainerReadinessText).toContain("\"devContainerSetups\"");
    expect(devContainerReadinessText).toContain("\"workflowSignals\"");
    expect(devContainerReadinessText).toContain("\"lifecycleSignals\"");
    const devContainerReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "devcontainer-readiness.html"), "utf8");
    expect(devContainerReadinessHtml).toContain("Dev Container Readiness");
    expect(devContainerReadinessHtml).toContain("devcontainer-readiness-card");
    expect(devContainerReadinessHtml).toContain("data-source-pattern=\"Dev Containers\"");
    const devContainerReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "devcontainer-readiness.md"), "utf8");
    expect(devContainerReadinessMarkdown).toContain("# Dev Container Readiness");
    expect(devContainerReadinessMarkdown).toContain("Source pattern: Dev Containers");
    expect(devContainerReadinessMarkdown).toContain("## Lifecycle Signals");
    const kubernetesReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "kubernetes-readiness-report.json"), "utf8");
    expect(kubernetesReadinessText).toContain("Kubernetes apiVersion kind metadata labels annotations namespace Deployment StatefulSet DaemonSet Service Ingress ConfigMap Secret ServiceAccount Role RoleBinding ClusterRole ClusterRoleBinding NetworkPolicy PersistentVolume PersistentVolumeClaim readinessProbe livenessProbe resources requests limits HorizontalPodAutoscaler PodDisruptionBudget kustomization resources patches kubectl apply diff wait rollout logs describe port-forward delete");
    expect(kubernetesReadinessText).toContain("\"kubernetesSetups\"");
    expect(kubernetesReadinessText).toContain("\"kustomizeSignals\"");
    expect(kubernetesReadinessText).toContain("\"workflowSignals\"");
    const kubernetesReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "kubernetes-readiness.html"), "utf8");
    expect(kubernetesReadinessHtml).toContain("Kubernetes Readiness");
    expect(kubernetesReadinessHtml).toContain("kubernetes-readiness-card");
    expect(kubernetesReadinessHtml).toContain("data-source-pattern=\"Kubernetes\"");
    const kubernetesReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "kubernetes-readiness.md"), "utf8");
    expect(kubernetesReadinessMarkdown).toContain("# Kubernetes Readiness");
    expect(kubernetesReadinessMarkdown).toContain("Source pattern: Kubernetes");
    expect(kubernetesReadinessMarkdown).toContain("## Kustomize Signals");
    const gitopsReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "gitops-readiness-report.json"), "utf8");
    expect(gitopsReadinessText).toContain("GitOps Argo CD Application ApplicationSet AppProject");
    expect(gitopsReadinessText).toContain("\"gitopsSetups\"");
    expect(gitopsReadinessText).toContain("\"fluxSourceSignals\"");
    expect(gitopsReadinessText).toContain("\"workflowSignals\"");
    const gitopsReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "gitops-readiness.html"), "utf8");
    expect(gitopsReadinessHtml).toContain("GitOps Readiness");
    expect(gitopsReadinessHtml).toContain("gitops-readiness-card");
    expect(gitopsReadinessHtml).toContain("data-source-pattern=\"GitOps\"");
    const gitopsReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "gitops-readiness.md"), "utf8");
    expect(gitopsReadinessMarkdown).toContain("# GitOps Readiness");
    expect(gitopsReadinessMarkdown).toContain("Source pattern: GitOps");
    expect(gitopsReadinessMarkdown).toContain("## Flux Source Signals");
    const contextPackText = await fs.readFile(path.join(result.session.outputPaths.analysis, "context-pack-report.json"), "utf8");
    expect(contextPackText).toContain("Repomix token counting git-aware ignore AI-friendly context pack");
    expect(contextPackText).toContain("\"budgetProfiles\"");
    expect(contextPackText).toContain("\"directoryTokenTree\"");
    expect(contextPackText).toContain("\"splitPlans\"");
    expect(contextPackText).toContain("google-ai-studio-1mb");
    const contextPackHtml = await fs.readFile(path.join(result.session.outputPaths.html, "context-pack.html"), "utf8");
    expect(contextPackHtml).toContain("Context Pack");
    expect(contextPackHtml).toContain("context-pack-card");
    expect(contextPackHtml).toContain("context-pack-source-link");
    expect(contextPackHtml).toContain("data-source-pattern=\"Repomix\"");
    expect(contextPackHtml).toContain("Split Output Plan");
    const contextPackMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "context-pack.md"), "utf8");
    expect(contextPackMarkdown).toContain("# Context Pack");
    expect(contextPackMarkdown).toContain("Source pattern: Repomix");
    expect(contextPackMarkdown).toContain("## Split Output Plan");
    const mcpHandoffText = await fs.readFile(path.join(result.session.outputPaths.analysis, "mcp-handoff-report.json"), "utf8");
    expect(mcpHandoffText).toContain("Codebase MCP getCodebase getRemoteCodebase saveCodebase tool handoff");
    expect(mcpHandoffText).toContain("\"getCodebase\"");
    expect(mcpHandoffText).toContain("\"getRemoteCodebase\"");
    expect(mcpHandoffText).toContain("\"saveCodebase\"");
    const mcpHandoffHtml = await fs.readFile(path.join(result.session.outputPaths.html, "mcp-handoff.html"), "utf8");
    expect(mcpHandoffHtml).toContain("MCP Handoff");
    expect(mcpHandoffHtml).toContain("mcp-handoff-card");
    expect(mcpHandoffHtml).toContain("data-source-pattern=\"codebase-mcp\"");
    const mcpHandoffMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "mcp-handoff.md"), "utf8");
    expect(mcpHandoffMarkdown).toContain("# MCP Handoff");
    expect(mcpHandoffMarkdown).toContain("Source pattern: Codebase MCP");
    const agentMemoryText = await fs.readFile(path.join(result.session.outputPaths.analysis, "agent-memory-report.json"), "utf8");
    expect(agentMemoryText).toContain("Claude Code Obsidian Graphify persistent memory token-saving context navigation");
    expect(agentMemoryText).toContain("\"tokenSavings\"");
    expect(agentMemoryText).toContain("\"memoryNotes\"");
    expect(agentMemoryText).toContain("project-context");
    const agentMemoryHtml = await fs.readFile(path.join(result.session.outputPaths.html, "agent-memory.html"), "utf8");
    expect(agentMemoryHtml).toContain("Agent Memory");
    expect(agentMemoryHtml).toContain("agent-memory-card");
    expect(agentMemoryHtml).toContain("data-source-pattern=\"Obsidian Graphify\"");
    expect(agentMemoryHtml).toContain("estimated reduction");
    const agentMemoryMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "agent-memory.md"), "utf8");
    expect(agentMemoryMarkdown).toContain("# Agent Memory");
    expect(agentMemoryMarkdown).toContain("Source pattern: Claude Code Obsidian Graphify");
    expect(agentMemoryMarkdown).toContain("## Context Navigation Rules");
    const graphQueryText = await fs.readFile(path.join(result.session.outputPaths.analysis, "graph-query-report.json"), "utf8");
    expect(graphQueryText).toContain("Graphify query path explain graph traversal command guide");
    expect(graphQueryText).toContain("\"queryModes\"");
    expect(graphQueryText).toContain("\"nodeExplanations\"");
    expect(graphQueryText).toContain("\"pathPrompts\"");
    const graphQueryHtml = await fs.readFile(path.join(result.session.outputPaths.html, "graph-query.html"), "utf8");
    expect(graphQueryHtml).toContain("Graph Query");
    expect(graphQueryHtml).toContain("graph-query-card");
    expect(graphQueryHtml).toContain("data-source-pattern=\"Graphify\"");
    expect(graphQueryHtml).toContain("graphify explain");
    const graphQueryMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "graph-query.md"), "utf8");
    expect(graphQueryMarkdown).toContain("# Graph Query");
    expect(graphQueryMarkdown).toContain("Source pattern: Graphify");
    expect(graphQueryMarkdown).toContain("## Path Prompts");
    const tutorialAbstractionText = await fs.readFile(path.join(result.session.outputPaths.analysis, "tutorial-abstraction-report.json"), "utf8");
    expect(tutorialAbstractionText).toContain("PocketFlow codebase tutorial identify abstractions analyze relationships order chapters");
    expect(tutorialAbstractionText).toContain("\"abstractions\"");
    expect(tutorialAbstractionText).toContain("\"relationships\"");
    expect(tutorialAbstractionText).toContain("\"chapterOrder\"");
    const tutorialAbstractionHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tutorial-abstractions.html"), "utf8");
    expect(tutorialAbstractionHtml).toContain("Tutorial Abstractions");
    expect(tutorialAbstractionHtml).toContain("tutorial-abstraction-card");
    expect(tutorialAbstractionHtml).toContain("data-source-pattern=\"PocketFlow\"");
    expect(tutorialAbstractionHtml).toContain("Chapter Order");
    const tutorialAbstractionMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tutorial-abstractions.md"), "utf8");
    expect(tutorialAbstractionMarkdown).toContain("# Tutorial Abstractions");
    expect(tutorialAbstractionMarkdown).toContain("Source pattern: PocketFlow");
    expect(tutorialAbstractionMarkdown).toContain("## Chapter Order");
    const decisionRecordText = await fs.readFile(path.join(result.session.outputPaths.analysis, "decision-record-report.json"), "utf8");
    expect(decisionRecordText).toContain("Log4brains ADR docs-as-code status context decision consequences timeline package-specific records");
    expect(decisionRecordText).toContain("\"records\"");
    expect(decisionRecordText).toContain("\"statusCounts\"");
    expect(decisionRecordText).toContain("\"timeline\"");
    expect(decisionRecordText).toContain("\"packageScopes\"");
    const decisionRecordsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "decision-records.html"), "utf8");
    expect(decisionRecordsHtml).toContain("Decision Records");
    expect(decisionRecordsHtml).toContain("decision-record-card");
    expect(decisionRecordsHtml).toContain("data-source-pattern=\"Log4brains\"");
    expect(decisionRecordsHtml).toContain("Positive Consequences");
    const decisionRecordsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "decision-records.md"), "utf8");
    expect(decisionRecordsMarkdown).toContain("# Decision Records");
    expect(decisionRecordsMarkdown).toContain("Source pattern: Log4brains");
    expect(decisionRecordsMarkdown).toContain("## Timeline");
    const dependencyHealthText = await fs.readFile(path.join(result.session.outputPaths.analysis, "dependency-health-report.json"), "utf8");
    expect(dependencyHealthText).toContain("dependency-cruiser no-circular no-orphans forbidden rules dependency graph validation");
    expect(dependencyHealthText).toContain("\"localDependencyEdges\"");
    expect(dependencyHealthText).toContain("\"cycles\"");
    expect(dependencyHealthText).toContain("\"orphanModules\"");
    expect(dependencyHealthText).toContain("\"ruleViolations\"");
    const dependencyHealthHtml = await fs.readFile(path.join(result.session.outputPaths.html, "dependency-health.html"), "utf8");
    expect(dependencyHealthHtml).toContain("Dependency Health");
    expect(dependencyHealthHtml).toContain("dependency-health-card");
    expect(dependencyHealthHtml).toContain("data-source-pattern=\"dependency-cruiser\"");
    expect(dependencyHealthHtml).toContain("no-circular");
    expect(dependencyHealthHtml).toContain("no-orphans");
    const dependencyHealthMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dependency-health.md"), "utf8");
    expect(dependencyHealthMarkdown).toContain("# Dependency Health");
    expect(dependencyHealthMarkdown).toContain("Source pattern: dependency-cruiser");
    expect(dependencyHealthMarkdown).toContain("## Rule Violations");
    const exportManifestText = await fs.readFile(path.join(result.session.outputPaths.html, "manifest.json"), "utf8");
    expect(exportManifestText).toContain("\"entrypoints\"");
    expect(exportManifestText).toContain("html/learning-path.html");
    expect(exportManifestText).toContain("html/quiz-print.html");
    expect(exportManifestText).toContain("html/suggested-reads.html");
    expect(exportManifestText).toContain("html/runtime-environment.html");
    expect(exportManifestText).toContain("html/interface-map.html");
    expect(exportManifestText).toContain("html/symbol-map.html");
    expect(exportManifestText).toContain("html/api-reference.html");
    expect(exportManifestText).toContain("html/search-index.html");
    expect(exportManifestText).toContain("html/learning-journal.html");
    expect(exportManifestText).toContain("html/project-activity.html");
    expect(exportManifestText).toContain("html/license-rights.html");
    expect(exportManifestText).toContain("html/sbom.html");
    expect(exportManifestText).toContain("html/security-readiness.html");
    expect(exportManifestText).toContain("html/scorecard.html");
    expect(exportManifestText).toContain("html/provenance.html");
    expect(exportManifestText).toContain("html/advisories.html");
    expect(exportManifestText).toContain("html/vex.html");
    expect(exportManifestText).toContain("html/policy-gates.html");
    expect(exportManifestText).toContain("html/api-contracts.html");
    expect(exportManifestText).toContain("html/observability.html");
    expect(exportManifestText).toContain("html/performance.html");
    expect(exportManifestText).toContain("html/e2e.html");
    expect(exportManifestText).toContain("html/accessibility.html");
    expect(exportManifestText).toContain("html/storybook.html");
    expect(exportManifestText).toContain("html/design-tokens.html");
    expect(exportManifestText).toContain("html/i18n.html");
    expect(exportManifestText).toContain("html/release-readiness.html");
    expect(exportManifestText).toContain("html/secret-readiness.html");
    expect(exportManifestText).toContain("html/container-readiness.html");
    expect(exportManifestText).toContain("html/code-quality.html");
    expect(exportManifestText).toContain("html/documentation.html");
    expect(exportManifestText).toContain("html/database-readiness.html");
    expect(exportManifestText).toContain("html/ci-cd.html");
    expect(exportManifestText).toContain("html/unit-tests.html");
    expect(exportManifestText).toContain("html/typecheck-readiness.html");
    expect(exportManifestText).toContain("html/package-manager.html");
    expect(exportManifestText).toContain("html/git-hooks.html");
    expect(exportManifestText).toContain("html/task-runner.html");
    expect(exportManifestText).toContain("html/dependency-updates.html");
    expect(exportManifestText).toContain("html/lint-readiness.html");
    expect(exportManifestText).toContain("html/format-readiness.html");
    expect(exportManifestText).toContain("html/commit-conventions.html");
    expect(exportManifestText).toContain("html/changelog-readiness.html");
    expect(exportManifestText).toContain("html/bundle-analysis.html");
    expect(exportManifestText).toContain("html/mocking-readiness.html");
    expect(exportManifestText).toContain("html/data-fetching-readiness.html");
    expect(exportManifestText).toContain("html/routing-readiness.html");
    expect(exportManifestText).toContain("html/state-management-readiness.html");
    expect(exportManifestText).toContain("html/form-readiness.html");
    expect(exportManifestText).toContain("html/auth-readiness.html");
    expect(exportManifestText).toContain("html/payment-readiness.html");
    expect(exportManifestText).toContain("html/email-readiness.html");
    expect(exportManifestText).toContain("html/queue-readiness.html");
    expect(exportManifestText).toContain("html/cache-readiness.html");
    expect(exportManifestText).toContain("html/logging-readiness.html");
    expect(exportManifestText).toContain("html/feature-flag-readiness.html");
    expect(exportManifestText).toContain("html/rate-limit-readiness.html");
    expect(exportManifestText).toContain("html/error-tracking-readiness.html");
    expect(exportManifestText).toContain("html/edge-readiness.html");
    expect(exportManifestText).toContain("html/compose-readiness.html");
    expect(exportManifestText).toContain("html/devcontainer-readiness.html");
    expect(exportManifestText).toContain("html/kubernetes-readiness.html");
    expect(exportManifestText).toContain("html/gitops-readiness.html");
    expect(exportManifestText).toContain("html/context-pack.html");
    expect(exportManifestText).toContain("html/mcp-handoff.html");
    expect(exportManifestText).toContain("html/agent-memory.html");
    expect(exportManifestText).toContain("html/graph-query.html");
    expect(exportManifestText).toContain("html/tutorial-abstractions.html");
    expect(exportManifestText).toContain("html/decision-records.html");
    expect(exportManifestText).toContain("html/dependency-health.html");
    expect(exportManifestText).toContain("\"integrity\"");
    expect(exportManifestText).toContain("\"bytes\"");
    expect(exportManifestText).toContain("\"sha256\"");
    expect(exportManifestText).toContain("\"readmePath\"");
    expect(exportManifestText).toContain("assets/component-graph.mmd");
    expect(exportManifestText).toContain("assets/learning-path.tour.json");
    expect(exportManifestText).toContain("assets/search-index.json");
    expect(exportManifestText).toContain("assets/learning-journal-template.md");
    const exportReadmeText = await fs.readFile(path.join(result.session.outputPaths.html, "EXPORT-README.md"), "utf8");
    expect(exportReadmeText).toContain("RepoTutor HTML Export");
    expect(exportReadmeText).toContain("Entry Points");
    expect(exportReadmeText).toContain("Integrity metadata uses sha256");
    expect(exportReadmeText).toContain("assets/component-graph.mmd");
    expect(exportReadmeText).toContain("assets/learning-path.tour.json");
    expect(exportReadmeText).toContain("assets/search-index.json");
    expect(exportReadmeText).toContain("assets/learning-journal-template.md");
    const filesHtml = await fs.readFile(path.join(result.session.outputPaths.html, "files.html"), "utf8");
    expect(filesHtml).toContain("file-nav-toolbar");
    expect(filesHtml).toContain("data-file-ext-filter");
    expect(filesHtml).toContain("data-file-dir-filter");
    expect(filesHtml).toContain("data-file-dir");
    expect(filesHtml).toContain("data-source-evidence-filter");
    expect(filesHtml).toContain("data-source-evidence");
    expect(filesHtml).toContain("근거 있음");
    expect(filesHtml).toContain("소스 근거");
    expect(filesHtml).toContain("source-evidence");
    expect(filesHtml).toContain("source-link");
    expect(filesHtml).toContain("원본 열기");
    expect(filesHtml).toContain("../source/src/main.ts");
    expect(filesHtml).toContain("import { createGreeting }");
    const filesMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "files.md"), "utf8");
    expect(filesMarkdown).toContain("### 소스 근거");
    expect(filesMarkdown).toContain("[원본](../source/src/main.ts)");
    const evidenceMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "evidence.md"), "utf8");
    expect(evidenceMarkdown).toContain("# 소스 근거 인덱스");
    expect(evidenceMarkdown).toContain("[src/main.ts](files.md#src-main-ts)");
    const evidenceHtml = await fs.readFile(path.join(result.session.outputPaths.html, "evidence.html"), "utf8");
    expect(evidenceHtml).toContain("소스 근거 인덱스");
    expect(evidenceHtml).toContain("evidence-index-cards");
    expect(evidenceHtml).toContain("evidence-kind-toolbar");
    expect(evidenceHtml).toContain("data-evidence-kind-filter");
    expect(evidenceHtml).toContain("data-evidence-kind=\"import\"");
    expect(evidenceHtml).toContain("files.html#src-main.ts");
    expect(evidenceHtml).toContain("../source/src/main.ts");
    const learningPathHtml = await fs.readFile(path.join(result.session.outputPaths.html, "learning-path.html"), "utf8");
    expect(learningPathHtml).toContain("학습 경로");
    expect(learningPathHtml).toContain("learning-path-step");
    expect(learningPathHtml).toContain("data-learning-primary");
    expect(learningPathHtml).toContain("기본 투어");
    expect(learningPathHtml).toContain("id=\"learning-step-1\"");
    expect(learningPathHtml).toContain("learning-step-nav");
    expect(learningPathHtml).toContain("href=\"#learning-step-2\"");
    expect(learningPathHtml).toContain("다음 단계");
    expect(learningPathHtml).toContain("이전 단계");
    expect(learningPathHtml).toContain("data-learning-step");
    expect(learningPathHtml).toContain("data-learning-step-complete");
    expect(learningPathHtml).toContain("data-reset-learning-progress");
    expect(learningPathHtml).toContain("data-learning-progress-summary");
    expect(learningPathHtml).toContain("완료 0 /");
    expect(learningPathHtml).toContain("진도 초기화");
    expect(learningPathHtml).toContain("학습 완료");
    expect(learningPathHtml).toContain("data-source-pattern=\"CodeTour\"");
    expect(learningPathHtml).toContain("component-graph.html");
    expect(learningPathHtml).toContain("runtime-environment.html");
    expect(learningPathHtml).toContain("interface-map.html");
    expect(learningPathHtml).toContain("symbol-map.html");
    expect(learningPathHtml).toContain("api-reference.html");
    expect(learningPathHtml).toContain("search-index.html");
    expect(learningPathHtml).toContain("learning-journal.html");
    expect(learningPathHtml).toContain("project-activity.html");
    expect(learningPathHtml).toContain("license-rights.html");
    expect(learningPathHtml).toContain("sbom.html");
    expect(learningPathHtml).toContain("security-readiness.html");
    expect(learningPathHtml).toContain("scorecard.html");
    expect(learningPathHtml).toContain("provenance.html");
    expect(learningPathHtml).toContain("advisories.html");
    expect(learningPathHtml).toContain("vex.html");
    expect(learningPathHtml).toContain("policy-gates.html");
    expect(learningPathHtml).toContain("api-contracts.html");
    expect(learningPathHtml).toContain("observability.html");
    expect(learningPathHtml).toContain("performance.html");
    expect(learningPathHtml).toContain("e2e.html");
    expect(learningPathHtml).toContain("accessibility.html");
    expect(learningPathHtml).toContain("storybook.html");
    expect(learningPathHtml).toContain("design-tokens.html");
    expect(learningPathHtml).toContain("i18n.html");
    expect(learningPathHtml).toContain("release-readiness.html");
    expect(learningPathHtml).toContain("secret-readiness.html");
    expect(learningPathHtml).toContain("container-readiness.html");
    expect(learningPathHtml).toContain("code-quality.html");
    expect(learningPathHtml).toContain("documentation.html");
    expect(learningPathHtml).toContain("database-readiness.html");
    expect(learningPathHtml).toContain("ci-cd.html");
    expect(learningPathHtml).toContain("unit-tests.html");
    expect(learningPathHtml).toContain("typecheck-readiness.html");
    expect(learningPathHtml).toContain("package-manager.html");
    expect(learningPathHtml).toContain("git-hooks.html");
    expect(learningPathHtml).toContain("task-runner.html");
    expect(learningPathHtml).toContain("dependency-updates.html");
    expect(learningPathHtml).toContain("lint-readiness.html");
    expect(learningPathHtml).toContain("format-readiness.html");
    expect(learningPathHtml).toContain("commit-conventions.html");
    expect(learningPathHtml).toContain("changelog-readiness.html");
    expect(learningPathHtml).toContain("bundle-analysis.html");
    expect(learningPathHtml).toContain("mocking-readiness.html");
    expect(learningPathHtml).toContain("data-fetching-readiness.html");
    expect(learningPathHtml).toContain("routing-readiness.html");
    expect(learningPathHtml).toContain("state-management-readiness.html");
    expect(learningPathHtml).toContain("form-readiness.html");
    expect(learningPathHtml).toContain("auth-readiness.html");
    expect(learningPathHtml).toContain("payment-readiness.html");
    expect(learningPathHtml).toContain("email-readiness.html");
    expect(learningPathHtml).toContain("queue-readiness.html");
    expect(learningPathHtml).toContain("cache-readiness.html");
    expect(learningPathHtml).toContain("logging-readiness.html");
    expect(learningPathHtml).toContain("feature-flag-readiness.html");
    expect(learningPathHtml).toContain("rate-limit-readiness.html");
    expect(learningPathHtml).toContain("error-tracking-readiness.html");
    expect(learningPathHtml).toContain("context-pack.html");
    expect(learningPathHtml).toContain("mcp-handoff.html");
    expect(learningPathHtml).toContain("agent-memory.html");
    expect(learningPathHtml).toContain("graph-query.html");
    expect(learningPathHtml).toContain("tutorial-abstractions.html");
    expect(learningPathHtml).toContain("decision-records.html");
    expect(learningPathHtml).toContain("dependency-health.html");
    const sessionVerificationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "session-verification.html"), "utf8");
    expect(sessionVerificationHtml).toContain("세션 검증");
    expect(sessionVerificationHtml).toContain("../analysis/session-verification-report.json");
    expect(sessionVerificationHtml).toContain("../markdown/session-verification.md");
    expect(sessionVerificationHtml).toContain("repo-tutor verify-session");
    const quizPrintHtml = await fs.readFile(path.join(result.session.outputPaths.html, "quiz-print.html"), "utf8");
    expect(quizPrintHtml).toContain("퀴즈 정답지");
    expect(quizPrintHtml).toContain("print-answer-key");
    expect(quizPrintHtml).toContain("<strong>정답:</strong>");
    expect(quizPrintHtml).toContain("<strong>해설:</strong>");
    const quizHtml = await fs.readFile(path.join(result.session.outputPaths.html, "quiz.html"), "utf8");
    expect(quizHtml).toContain("quiz-reset-toolbar");
    expect(quizHtml).toContain("data-reset-quiz");
    expect(quizHtml).toContain("복습 초기화");
    expect(quizHtml).toContain("quiz-section-toolbar");
    expect(quizHtml).toContain("data-quiz-section-filter");
    expect(quizHtml).toContain("data-quiz-difficulty-filter");
    expect(quizHtml).toContain("data-quiz-section");
    expect(quizHtml).toContain("data-quiz-difficulty");
    const appJs = await fs.readFile(path.join(result.session.outputPaths.html, "assets", "app.js"), "utf8");
    expect(appJs).toContain("[data-evidence-kind-filter]");
    expect(appJs).toContain("[data-quiz-section-filter]");
    expect(appJs).toContain("repotutor:learning-path");
    expect(appJs).toContain("learningProgress");
    expect(appJs).toContain("[data-reset-learning-progress]");
    expect(appJs).toContain("learningProgress.clear()");
    expect(appJs).toContain("[data-learning-progress-summary]");
    expect(appJs).toContain("updateLearningProgressSummary");
    expect(appJs).toContain("localStorage");
    expect(appJs).toContain("[data-reset-quiz]");
    expect(appJs).toContain("picked.clear()");
    expect(appJs).toContain("[data-download-mermaid]");
    const fileLessonsText = await fs.readFile(path.join(result.session.outputPaths.analysis, "file-lessons.json"), "utf8");
    expect(fileLessonsText).toContain("\"sourceEvidence\"");
    expect(fileLessonsText).toContain("\"snippet\"");
    const evidenceIndexText = await fs.readFile(path.join(result.session.outputPaths.analysis, "evidence-index-report.json"), "utf8");
    expect(evidenceIndexText).toContain("\"totalEvidenceItems\"");
    expect(evidenceIndexText).toContain("\"evidenceByKind\"");
    expect(evidenceIndexText).toContain("\"lessonHref\"");
    expect(evidenceIndexText).toContain("\"sourceHref\"");
    expect(evidenceIndexText).toContain("html/files.html#src-main.ts");
    expect(evidenceIndexText).toContain("source/src/main.ts");
    const sessionVerificationText = await fs.readFile(path.join(result.session.outputPaths.analysis, "session-verification-report.json"), "utf8");
    expect(sessionVerificationText).toContain("\"ok\": true");
    expect(sessionVerificationText).toContain("\"checkedRequiredArtifacts\"");
    expect(sessionVerificationText).toContain("\"evidenceIndex\"");
    const sessionVerificationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "session-verification.md"), "utf8");
    expect(sessionVerificationMarkdown).toContain("# 세션 검증");
    expect(sessionVerificationMarkdown).toContain("상태: PASS");
    expect(sessionVerificationMarkdown).toContain("evidenceIndex: PASS");
    const evidenceVerification = await verifyEvidenceIndexReport(result.session.outputPaths.root);
    expect(evidenceVerification.ok).toBe(true);
    expect(evidenceVerification.checkedItems).toBeGreaterThan(0);
    expect(evidenceVerification.checkedSourceFiles).toBeGreaterThan(0);
    expect(evidenceVerification.checkedSourceLinks).toBeGreaterThan(0);
    expect(evidenceVerification.checkedLessonLinks).toBeGreaterThan(0);
    expect(evidenceVerification.failures).toHaveLength(0);
    const zip = await writeHtmlZipBundle(result.session.outputPaths.root);
    expect(zip.fileCount).toBeGreaterThan(5);
    expect(zip.bytes).toBeGreaterThan(100);
    const zipSignature = await fs.readFile(zip.zipPath).then((buffer) => buffer.subarray(0, 4).toString("hex"));
    expect(zipSignature).toBe("504b0304");
    const zipText = await fs.readFile(zip.zipPath, "latin1");
    expect(zipText).toContain("assets/component-graph.mmd");
    expect(zipText).toContain("assets/learning-path.tour.json");
    expect(zipText).toContain("assets/search-index.json");
    expect(zipText).toContain("assets/learning-journal-template.md");
    const exportVerification = await verifyHtmlExportManifest(result.session.outputPaths.root);
    expect(exportVerification.ok).toBe(true);
    expect(exportVerification.checkedFiles).toBeGreaterThan(5);
    expect(exportVerification.failures).toHaveLength(0);
    const sessionVerification = await verifyStudySessionArtifacts(result.session.outputPaths.root);
    expect(sessionVerification.ok).toBe(true);
    expect(sessionVerification.checks.session).toBe(true);
    expect(sessionVerification.checks.requiredArtifacts).toBe(true);
    expect(sessionVerification.checks.htmlExport).toBe(true);
    expect(sessionVerification.checks.evidenceIndex).toBe(true);
    expect(sessionVerification.checkedRequiredArtifacts).toBeGreaterThan(5);
    expect(sessionVerification.failures).toHaveLength(0);
    await fs.appendFile(path.join(result.session.outputPaths.html, "index.html"), "\n<!-- tampered -->\n");
    const tamperedVerification = await verifyHtmlExportManifest(result.session.outputPaths.root);
    expect(tamperedVerification.ok).toBe(false);
    expect(tamperedVerification.failures[0]?.path).toBe("html/index.html");
    await fs.rm(path.join(result.session.outputPaths.source, "src", "main.ts"));
    const missingSourceVerification = await verifyEvidenceIndexReport(result.session.outputPaths.root);
    expect(missingSourceVerification.ok).toBe(false);
    expect(missingSourceVerification.failures.some((failure) => failure.reason === "missing-source-path" && failure.path === "source/src/main.ts")).toBe(true);
    const failedSessionVerification = await verifyStudySessionArtifacts(result.session.outputPaths.root);
    expect(failedSessionVerification.ok).toBe(false);
    expect(failedSessionVerification.checks.htmlExport).toBe(false);
    expect(failedSessionVerification.checks.evidenceIndex).toBe(false);
    expect(failedSessionVerification.failures.some((failure) => failure.check === "html-export" && failure.path === "html/index.html")).toBe(true);
    expect(failedSessionVerification.failures.some((failure) => failure.check === "evidence-index" && failure.path === "source/src/main.ts")).toBe(true);
    const quizText = await fs.readFile(path.join(result.session.outputPaths.analysis, "quiz.json"), "utf8");
    expect(quizText).toContain("\"choices\"");
  });

  it("detects OpenTofu infrastructure readiness in Terraform files", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-infra-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-infra-source-"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Infrastructure fixture",
      "",
      "Use tofu init, tofu validate, tofu plan, and tofu apply during operator review."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "main.tf"), [
      "terraform {",
      "  required_version = \">= 1.8.0\"",
      "  required_providers {",
      "    aws = {",
      "      source = \"hashicorp/aws\"",
      "      version = \">= 5.0.0\"",
      "    }",
      "  }",
      "  backend \"local\" {",
      "    path = \"state/terraform.tfstate\"",
      "  }",
      "}",
      "",
      "provider \"aws\" {",
      "  region = var.region",
      "}",
      "",
      "variable \"region\" {",
      "  type = string",
      "  default = \"us-east-1\"",
      "  validation {",
      "    condition = length(var.region) > 0",
      "    error_message = \"Region is required.\"",
      "  }",
      "}",
      "",
      "resource \"aws_s3_bucket\" \"logs\" {",
      "  bucket = \"repotutor-infra-fixture\"",
      "}",
      "",
      "data \"aws_caller_identity\" \"current\" {}",
      "",
      "module \"network\" {",
      "  source = \"./modules/network\"",
      "  providers = { aws = aws }",
      "}",
      "",
      "output \"account_id\" {",
      "  value = data.aws_caller_identity.current.account_id",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".terraform.lock.hcl"), "# provider dependency lockfile fixture\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "infrastructure-readiness-report.json"), "utf8")) as {
      infrastructureSetups: Array<{ filePath: string; providerCount: number; resourceCount: number; dataSourceCount: number; moduleCount: number; variableCount: number; outputCount: number; backendCount: number; workflowCount: number }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      moduleSignals: Array<{ signal: string; readiness: string }>;
      variableSignals: Array<{ signal: string; readiness: string }>;
    };
    const mainSetup = report.infrastructureSetups.find((item) => item.filePath === "main.tf");
    expect(report.infrastructureSetups.length).toBeGreaterThan(0);
    expect(mainSetup?.providerCount).toBeGreaterThan(0);
    expect(mainSetup?.resourceCount).toBeGreaterThan(0);
    expect(mainSetup?.dataSourceCount).toBeGreaterThan(0);
    expect(mainSetup?.moduleCount).toBeGreaterThan(0);
    expect(mainSetup?.variableCount).toBeGreaterThan(0);
    expect(mainSetup?.outputCount).toBeGreaterThan(0);
    expect(mainSetup?.backendCount).toBeGreaterThan(0);
    expect(report.infrastructureSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(report.stateSignals.some((item) => item.signal === "backend" && item.readiness === "ready")).toBe(true);
    expect(report.stateSignals.some((item) => item.signal === "terraform-lock-hcl" && item.readiness === "ready")).toBe(true);
    expect(report.workflowSignals.some((item) => item.signal === "plan-command" && item.readiness === "ready")).toBe(true);
    expect(report.moduleSignals.some((item) => item.signal === "local-module" && item.readiness === "ready")).toBe(true);
    expect(report.variableSignals.some((item) => item.signal === "validation" && item.readiness === "ready")).toBe(true);
  });

  it("detects Helm deployment readiness in chart files", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-deployment-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-deployment-source-"));
    const templatesDir = path.join(sourceRoot, "charts", "app", "templates");
    await fs.mkdir(templatesDir, { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Deployment fixture",
      "",
      "Review with helm lint, helm template, helm install --dry-run --debug, helm upgrade --install --wait --rollback-on-failure, helm test, and helm rollback."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "Chart.yaml"), [
      "apiVersion: v2",
      "name: repotutor-app",
      "version: 0.1.0",
      "appVersion: \"1.0.0\"",
      "type: application",
      "dependencies:",
      "  - name: redis",
      "    version: 1.0.0",
      "    repository: https://example.com/charts"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "values.yaml"), [
      "global:",
      "  imageRegistry: example.test",
      "image:",
      "  repository: repotutor/app",
      "service:",
      "  port: 8080"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "values.schema.json"), "{\"type\":\"object\"}\n");
    await fs.writeFile(path.join(templatesDir, "_helpers.tpl"), "{{- define \"repotutor.name\" -}}repotutor{{- end -}}\n");
    await fs.writeFile(path.join(templatesDir, "deployment.yaml"), [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: {{ include \"repotutor.name\" . }}",
      "  namespace: {{ .Release.Namespace }}",
      "spec:",
      "  template:",
      "    spec:",
      "      containers:",
      "        - name: app",
      "          image: {{ .Values.image.repository }}"
    ].join("\n"));
    await fs.writeFile(path.join(templatesDir, "service.yaml"), [
      "apiVersion: v1",
      "kind: Service",
      "metadata:",
      "  name: repotutor",
      "spec:",
      "  ports:",
      "    - port: {{ .Values.service.port }}"
    ].join("\n"));
    await fs.writeFile(path.join(templatesDir, "test-connection.yaml"), [
      "apiVersion: v1",
      "kind: Pod",
      "metadata:",
      "  annotations:",
      "    helm.sh/hook: test",
      "spec:",
      "  containers:",
      "    - name: smoke",
      "      image: busybox"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "deployment-readiness-report.json"), "utf8")) as {
      deploymentSetups: Array<{ filePath: string; chartMetadataCount: number; valuesCount: number; templateCount: number; manifestCount: number; dependencyCount: number; hookCount: number; releaseWorkflowCount: number }>;
      chartSignals: Array<{ signal: string; readiness: string }>;
      templateSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      releaseSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
    };
    const chartSetup = report.deploymentSetups.find((item) => item.filePath === "charts/app/Chart.yaml");
    const deploymentTemplate = report.deploymentSetups.find((item) => item.filePath === "charts/app/templates/deployment.yaml");
    expect(report.deploymentSetups.length).toBeGreaterThan(0);
    expect(chartSetup?.chartMetadataCount).toBeGreaterThan(0);
    expect(chartSetup?.dependencyCount).toBeGreaterThan(0);
    expect(deploymentTemplate?.templateCount).toBeGreaterThan(0);
    expect(deploymentTemplate?.manifestCount).toBeGreaterThan(0);
    expect(report.deploymentSetups.some((item) => item.releaseWorkflowCount > 0)).toBe(true);
    expect(report.chartSignals.some((item) => item.signal === "chart-yaml" && item.readiness === "ready")).toBe(true);
    expect(report.chartSignals.some((item) => item.signal === "values-schema" && item.readiness === "ready")).toBe(true);
    expect(report.templateSignals.some((item) => item.signal === "deployment" && item.readiness === "ready")).toBe(true);
    expect(report.templateSignals.some((item) => item.signal === "tests" && item.readiness === "ready")).toBe(true);
    expect(report.valueSignals.some((item) => item.signal === "global-values" && item.readiness === "ready")).toBe(true);
    expect(report.releaseSignals.some((item) => item.signal === "upgrade-command" && item.readiness === "ready")).toBe(true);
    expect(report.safetySignals.some((item) => item.signal === "rollback-on-failure" && item.readiness === "ready")).toBe(true);
  });

  it("detects Serverless Framework readiness in service files", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-serverless-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-serverless-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        deploy: "serverless deploy --stage prod --region us-east-1",
        package: "serverless package --stage prod",
        local: "serverless invoke local -f api"
      },
      dependencies: {
        serverless: "^4.0.0",
        "serverless-offline": "^14.0.0",
        "serverless-prune-plugin": "^2.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "serverless.yml"), [
      "service: demo-api",
      "frameworkVersion: '4'",
      "provider:",
      "  name: aws",
      "  runtime: nodejs22.x",
      "  region: us-east-1",
      "  stage: ${opt:stage, 'dev'}",
      "  logRetentionInDays: 14",
      "  tracing:",
      "    lambda: true",
      "  environment:",
      "    TABLE_NAME: ${self:service}-${sls:stage}-items",
      "    TOKEN: ${ssm:/demo/token}",
      "  iam:",
      "    role:",
      "      statements:",
      "        - Effect: Allow",
      "          Action:",
      "            - dynamodb:PutItem",
      "          Resource: !GetAtt ItemsTable.Arn",
      "functions:",
      "  api:",
      "    handler: src/handler.main",
      "    timeout: 10",
      "    memorySize: 256",
      "    events:",
      "      - httpApi:",
      "          path: /items",
      "          method: post",
      "      - schedule: rate(5 minutes)",
      "package:",
      "  patterns:",
      "    - '!tests/**'",
      "plugins:",
      "  - serverless-offline",
      "  - serverless-prune-plugin",
      "resources:",
      "  Resources:",
      "    ItemsTable:",
      "      Type: AWS::DynamoDB::Table",
      "      Properties:",
      "        BillingMode: PAY_PER_REQUEST"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "handler.js"), "export async function main() { return { statusCode: 200, body: 'ok' }; }\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "serverless-readiness-report.json"), "utf8")) as {
      serverlessSetups: Array<{ filePath: string; framework: string; serviceCount: number; providerCount: number; functionCount: number; eventCount: number; iamCount: number; resourceCount: number; commandCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      functionSignals: Array<{ signal: string; readiness: string }>;
      eventSignals: Array<{ signal: string; readiness: string }>;
      deploymentSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const setup = report.serverlessSetups.find((item) => item.filePath === "serverless.yml");
    expect(report.serverlessSetups.length).toBeGreaterThan(0);
    expect(setup?.framework).toBe("serverless-framework");
    expect(setup?.serviceCount).toBeGreaterThan(0);
    expect(setup?.providerCount).toBeGreaterThan(0);
    expect(setup?.functionCount).toBeGreaterThan(0);
    expect(setup?.eventCount).toBeGreaterThan(0);
    expect(setup?.iamCount).toBeGreaterThan(0);
    expect(setup?.resourceCount).toBeGreaterThan(0);
    expect(report.serverlessSetups.some((item) => item.commandCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "serverless-yml" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "variables" && item.readiness === "ready")).toBe(true);
    expect(report.functionSignals.some((item) => item.signal === "handler" && item.readiness === "ready")).toBe(true);
    expect(report.eventSignals.some((item) => item.signal === "http-api" && item.readiness === "ready")).toBe(true);
    expect(report.eventSignals.some((item) => item.signal === "schedule" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "deploy" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "invoke-local" && item.readiness === "ready")).toBe(true);
    expect(report.safetySignals.some((item) => item.signal === "iam-role-statements" && item.readiness === "ready")).toBe(true);
    expect(report.safetySignals.some((item) => item.signal === "secrets" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "serverless-offline" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "serverless-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "serverless-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Expo mobile readiness in app config and EAS profiles", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mobile-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mobile-source-"));
    await fs.mkdir(path.join(sourceRoot, "app"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "assets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "ios"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "android", "app", "src", "main"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "mobile-demo",
      version: "1.0.0",
      main: "expo-router/entry",
      scripts: {
        start: "expo start --dev-client",
        android: "expo run:android",
        ios: "expo run:ios",
        web: "expo start --web",
        "build:android": "eas build --platform android",
        "build:ios": "eas build --platform ios",
        update: "eas update --branch production"
      },
      dependencies: {
        expo: "~56.0.0",
        "expo-dev-client": "~6.0.0",
        "expo-router": "~6.0.0",
        "expo-updates": "~30.0.0",
        react: "19.0.0",
        "react-native": "0.86.0",
        "react-native-web": "^0.21.0"
      },
      devDependencies: {
        "eas-cli": "latest",
        "@expo/metro-config": "^0.22.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "app.json"), JSON.stringify({
      expo: {
        name: "Mobile Demo",
        slug: "mobile-demo",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        scheme: "mobile-demo",
        ios: { bundleIdentifier: "com.example.mobiledemo", supportsTablet: true },
        android: {
          package: "com.example.mobiledemo",
          permissions: ["CAMERA"],
          adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
          }
        },
        web: { bundler: "metro", favicon: "./assets/favicon.png" },
        plugins: ["expo-router", "expo-dev-client", "expo-updates", ["expo-splash-screen", { image: "./assets/splash.png" }]],
        updates: { url: "https://u.expo.dev/demo" },
        runtimeVersion: { policy: "appVersion" },
        experiments: { typedRoutes: true },
        extra: { eas: { projectId: "00000000-0000-0000-0000-000000000000" } }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "eas.json"), JSON.stringify({
      cli: { version: ">= 13.0.0", appVersionSource: "remote" },
      build: {
        development: { developmentClient: true, distribution: "internal" },
        production: { autoIncrement: true, channel: "production" }
      },
      submit: { production: {} }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "app", "_layout.tsx"), "import { Stack } from 'expo-router';\nexport default function RootLayout() { return <Stack />; }\n");
    await fs.writeFile(path.join(sourceRoot, "ios", "Info.plist"), "<plist><dict><key>NSCameraUsageDescription</key><string>Scan examples</string></dict></plist>\n");
    await fs.writeFile(path.join(sourceRoot, "android", "app", "src", "main", "AndroidManifest.xml"), "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"><uses-permission android:name=\"android.permission.CAMERA\" /></manifest>\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "eas.yml"), "name: eas\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: eas build --platform all --non-interactive\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "mobile-readiness-report.json"), "utf8")) as {
      mobileSetups: Array<{ filePath: string; framework: string; appConfigCount: number; platformCount: number; buildProfileCount: number; updateCount: number; assetCount: number; permissionCount: number; commandCount: number; packageCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      buildSignals: Array<{ signal: string; readiness: string }>;
      updateSignals: Array<{ signal: string; readiness: string }>;
      assetSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const appSetup = report.mobileSetups.find((item) => item.filePath === "app.json");
    const easSetup = report.mobileSetups.find((item) => item.filePath === "eas.json");
    expect(report.mobileSetups.length).toBeGreaterThan(0);
    expect(appSetup?.framework).toBe("expo");
    expect(appSetup?.appConfigCount).toBeGreaterThan(0);
    expect(appSetup?.platformCount).toBeGreaterThan(0);
    expect(appSetup?.updateCount).toBeGreaterThan(0);
    expect(appSetup?.assetCount).toBeGreaterThan(0);
    expect(appSetup?.permissionCount).toBeGreaterThan(0);
    expect(easSetup?.framework).toBe("eas");
    expect(easSetup?.buildProfileCount).toBeGreaterThan(0);
    expect(report.mobileSetups.some((item) => item.commandCount > 0)).toBe(true);
    expect(report.mobileSetups.some((item) => item.packageCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "app-json" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "plugins" && item.readiness === "ready")).toBe(true);
    expect(report.platformSignals.some((item) => item.signal === "bundle-identifier" && item.readiness === "ready")).toBe(true);
    expect(report.platformSignals.some((item) => item.signal === "permissions" && item.readiness === "ready")).toBe(true);
    expect(report.navigationSignals.some((item) => item.signal === "expo-router" && item.readiness === "ready")).toBe(true);
    expect(report.navigationSignals.some((item) => item.signal === "typed-routes" && item.readiness === "ready")).toBe(true);
    expect(report.buildSignals.some((item) => item.signal === "eas-json" && item.readiness === "ready")).toBe(true);
    expect(report.buildSignals.some((item) => item.signal === "run-ios" && item.readiness === "ready")).toBe(true);
    expect(report.updateSignals.some((item) => item.signal === "runtime-version" && item.readiness === "ready")).toBe(true);
    expect(report.updateSignals.some((item) => item.signal === "eas-update" && item.readiness === "ready")).toBe(true);
    expect(report.assetSignals.some((item) => item.signal === "adaptive-icon" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "expo-dev-client" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mobile-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mobile-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Cloudflare Workers edge readiness in Wrangler config and handlers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-edge-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-edge-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "edge-demo",
      scripts: {
        dev: "wrangler dev --local",
        types: "wrangler types",
        deploy: "wrangler deploy",
        tail: "wrangler tail",
        "secret:list": "wrangler secret list",
        "kv:list": "wrangler kv namespace list",
        "r2:list": "wrangler r2 bucket list",
        "d1:list": "wrangler d1 list"
      },
      devDependencies: {
        wrangler: "^5.0.0",
        "@cloudflare/workers-types": "^5.0.0",
        "@cloudflare/vitest-pool-workers": "^1.0.0",
        miniflare: "^4.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "wrangler.toml"), [
      "name = \"edge-demo\"",
      "main = \"src/index.ts\"",
      "compatibility_date = \"2026-06-01\"",
      "compatibility_flags = [\"nodejs_compat\"]",
      "workers_dev = true",
      "routes = [{ pattern = \"edge.example.com/*\", zone_name = \"example.com\" }]",
      "vars = { FEATURE_MODE = \"local\" }",
      "limits = { cpu_ms = 50 }",
      "placement = { mode = \"smart\" }",
      "kv_namespaces = [{ binding = \"CACHE\", id = \"local-cache\" }]",
      "r2_buckets = [{ binding = \"ASSETS\", bucket_name = \"assets\" }]",
      "d1_databases = [{ binding = \"DB\", database_name = \"demo\", database_id = \"demo\" }]",
      "queues.producers = [{ binding = \"JOB_QUEUE\", queue = \"jobs\" }]",
      "services = [{ binding = \"API\", service = \"api-worker\" }]",
      "analytics_engine_datasets = [{ binding = \"ANALYTICS\" }]",
      "workflows = [{ binding = \"PIPELINE\", name = \"pipeline\", class_name = \"PipelineWorkflow\" }]",
      "[[durable_objects.bindings]]",
      "name = \"COUNTER\"",
      "class_name = \"Counter\"",
      "[[migrations]]",
      "tag = \"v1\"",
      "new_sqlite_classes = [\"Counter\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".dev.vars"), "FEATURE_MODE=local\n");
    await fs.writeFile(path.join(sourceRoot, "vitest.config.ts"), [
      "import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';",
      "export default defineWorkersConfig({ test: { poolOptions: { workers: { wrangler: { configPath: './wrangler.toml' } } } } });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "index.ts"), [
      "export interface Env { CACHE: KVNamespace; ASSETS: R2Bucket; DB: D1Database; COUNTER: DurableObjectNamespace; JOB_QUEUE: Queue; API: Fetcher; ANALYTICS: AnalyticsEngineDataset; }",
      "export class Counter { fetch(request: Request) { return new Response('counter'); } }",
      "export default {",
      "  async fetch(request: Request, env: Env) {",
      "    console.log('edge request');",
      "    env.ANALYTICS.writeDataPoint({ blobs: ['demo'], doubles: [1], indexes: ['edge'] });",
      "    return new Response('edge');",
      "  },",
      "  async scheduled(controller: ScheduledController, env: Env) { console.info(controller.cron); },",
      "  async queue(batch: MessageBatch, env: Env) { console.warn(batch.messages.length); }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "deploy.yml"), "name: deploy\non: [push]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: cloudflare/wrangler-action@v3\n        env:\n          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "edge-readiness-report.json"), "utf8")) as {
      edgeSetups: Array<{ filePath: string; platform: string; configCount: number; handlerCount: number; bindingCount: number; routingCount: number; devWorkflowCount: number; deploymentWorkflowCount: number; observabilityCount: number; packageCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      handlerSignals: Array<{ signal: string; readiness: string }>;
      bindingSignals: Array<{ signal: string; readiness: string }>;
      routingSignals: Array<{ signal: string; readiness: string }>;
      devSignals: Array<{ signal: string; readiness: string }>;
      deploymentSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const setup = report.edgeSetups.find((item) => item.filePath === "wrangler.toml");
    expect(report.edgeSetups.length).toBeGreaterThan(0);
    expect(setup?.platform).toBe("cloudflare-workers");
    expect(setup?.configCount).toBeGreaterThan(0);
    expect(setup?.bindingCount).toBeGreaterThan(0);
    expect(setup?.routingCount).toBeGreaterThan(0);
    expect(report.edgeSetups.some((item) => item.handlerCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.devWorkflowCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.deploymentWorkflowCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.observabilityCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.packageCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "wrangler-toml" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "compatibility-date" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "vars" && item.readiness === "ready")).toBe(true);
    expect(report.handlerSignals.some((item) => item.signal === "module-worker" && item.readiness === "ready")).toBe(true);
    expect(report.handlerSignals.some((item) => item.signal === "fetch-handler" && item.readiness === "ready")).toBe(true);
    expect(report.handlerSignals.some((item) => item.signal === "durable-object-class" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "kv" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "r2" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "d1" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "durable-objects" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "queues" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "services" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "workflows" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "analytics-engine" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "secrets" && item.readiness === "ready")).toBe(true);
    expect(report.routingSignals.some((item) => item.signal === "workers-dev" && item.readiness === "ready")).toBe(true);
    expect(report.routingSignals.some((item) => item.signal === "routes" && item.readiness === "ready")).toBe(true);
    expect(report.routingSignals.some((item) => item.signal === "durable-object-migrations" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "wrangler-dev" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "dev-vars" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "miniflare" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "vitest-pool-workers" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "wrangler-deploy" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "wrangler-tail" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "wrangler-secret" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "ci-deploy" && item.readiness === "ready")).toBe(true);
    expect(report.observabilitySignals.some((item) => item.signal === "tail" && item.readiness === "ready")).toBe(true);
    expect(report.observabilitySignals.some((item) => item.signal === "console" && item.readiness === "ready")).toBe(true);
    expect(report.observabilitySignals.some((item) => item.signal === "analytics-engine" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "wrangler" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "cloudflare-workers-types" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "vitest-pool-workers" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "edge-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "edge-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Docker Compose readiness patterns without running Docker", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-compose-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-compose-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "compose.yaml"), [
      "name: repotutor-compose-fixture",
      "x-common-env: &common-env",
      "  APP_MODE: compose",
      "include:",
      "  - compose.override.yml",
      "services:",
      "  web:",
      "    build:",
      "      context: .",
      "      dockerfile: Dockerfile",
      "    image: local/repotutor-web:dev",
      "    command: pnpm dev",
      "    entrypoint: [\"sh\", \"-c\"]",
      "    ports:",
      "      - \"3000:3000\"",
      "    expose:",
      "      - \"3000\"",
      "    restart: unless-stopped",
      "    profiles: [\"app\"]",
      "    environment:",
      "      <<: *common-env",
      "      DATABASE_URL: postgresql://db:5432/app",
      "    env_file:",
      "      - .env.compose",
      "    depends_on:",
      "      db:",
      "        condition: service_healthy",
      "    healthcheck:",
      "      test: [\"CMD\", \"node\", \"health.js\"]",
      "      interval: 10s",
      "      timeout: 3s",
      "      retries: 3",
      "    volumes:",
      "      - .:/workspace",
      "      - web-cache:/cache",
      "    networks:",
      "      app-net:",
      "        aliases: [\"web.local\"]",
      "    secrets:",
      "      - app_token",
      "    configs:",
      "      - app_config",
      "    deploy:",
      "      replicas: 1",
      "      resources:",
      "        limits:",
      "          cpus: \"0.50\"",
      "    read_only: true",
      "    cap_drop:",
      "      - ALL",
      "    security_opt:",
      "      - no-new-privileges:true",
      "  db:",
      "    image: postgres:16",
      "    environment:",
      "      POSTGRES_DB: app",
      "    healthcheck:",
      "      test: [\"CMD-SHELL\", \"pg_isready -U app\"]",
      "      interval: 5s",
      "      timeout: 3s",
      "      retries: 5",
      "    volumes:",
      "      - db-data:/var/lib/postgresql/data",
      "    networks:",
      "      - app-net",
      "  worker:",
      "    build: .",
      "    depends_on:",
      "      - web",
      "    command: pnpm worker",
      "    links:",
      "      - db",
      "volumes:",
      "  web-cache:",
      "  db-data:",
      "networks:",
      "  app-net:",
      "    external: true",
      "secrets:",
      "  app_token:",
      "    file: ./secrets/app_token.txt",
      "configs:",
      "  app_config:",
      "    file: ./config/app.yml",
      "extends:",
      "  file: compose.base.yml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "compose.override.yml"), "services:\n  web:\n    profiles: [\"debug\"]\n");
    await fs.writeFile(path.join(sourceRoot, ".env.compose"), "APP_MODE=compose\nDB_NAME=app\nCOMPOSE_PROFILES=app\n");
    await fs.writeFile(path.join(sourceRoot, "Dockerfile"), "FROM node:22-alpine\nWORKDIR /workspace\nCMD [\"node\", \"health.js\"]\n");
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "compose:config": "docker compose config",
        "compose:up": "docker compose up -d",
        "compose:build": "docker compose build",
        "compose:run": "docker compose run --rm web pnpm test",
        "compose:exec": "docker compose exec web sh",
        "compose:logs": "docker compose logs web",
        "compose:ps": "docker compose ps",
        "compose:pull": "docker compose pull",
        "compose:watch": "docker compose watch",
        "compose:wait": "docker compose wait",
        "compose:down": "docker compose down --remove-orphans",
        "compose:v1": "docker-compose config"
      },
      devDependencies: {}
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "compose-readiness-report.json"), "utf8")) as {
      composeSetups: Array<{ filePath: string; format: string; serviceCount: number; buildCount: number; imageCount: number; portCount: number; volumeCount: number; networkCount: number; dependencyCount: number; healthcheckCount: number; envCount: number; secretConfigCount: number; profileCount: number; commandCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      serviceSignals: Array<{ signal: string; readiness: string }>;
      dependencySignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const setup = report.composeSetups.find((item) => item.filePath === "compose.yaml");
    expect(report.composeSetups.length).toBeGreaterThan(0);
    expect(setup?.format).toBe("compose-yaml");
    expect(setup?.serviceCount).toBeGreaterThan(0);
    expect(setup?.buildCount).toBeGreaterThan(0);
    expect(setup?.imageCount).toBeGreaterThan(0);
    expect(setup?.portCount).toBeGreaterThan(0);
    expect(setup?.volumeCount).toBeGreaterThan(0);
    expect(setup?.networkCount).toBeGreaterThan(0);
    expect(setup?.dependencyCount).toBeGreaterThan(0);
    expect(setup?.healthcheckCount).toBeGreaterThan(0);
    expect(setup?.envCount).toBeGreaterThan(0);
    expect(setup?.secretConfigCount).toBeGreaterThan(0);
    expect(setup?.profileCount).toBeGreaterThan(0);
    expect(report.composeSetups.some((item) => item.commandCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "compose-yaml" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "override-file" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "services" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "name" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "include" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "extends" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "x-extension" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "build" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "image" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "command" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "entrypoint" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "ports" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "expose" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "restart" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "profiles" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "scale-deploy" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "depends-on" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "service-healthy" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "healthcheck" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "links" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "external-network" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "aliases" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "volumes" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "bind-mounts" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "named-volumes" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "networks" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "secrets" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "configs" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "env-file" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "environment" && item.readiness === "ready")).toBe(true);
    for (const signal of ["config", "up", "down", "build", "run", "exec", "logs", "ps", "pull", "watch", "wait"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["healthcheck", "restart-policy", "profiles", "resource-limits", "read-only", "cap-drop", "security-opt", "secrets"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.packageSignals.some((item) => item.signal === "docker-compose-plugin" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "docker-compose-v1" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "compose-spec" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "compose-watch" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "dockerfile" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "compose-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "compose-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Dev Container readiness patterns without running containers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-devcontainer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-devcontainer-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".devcontainer"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.appendFile(path.join(sourceRoot, "README.md"), "\nDev Containers local development is supported through VS Code Dev Containers.\n");
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "devcontainer.json"), JSON.stringify({
      name: "RepoTutor Dev Container Fixture",
      image: "mcr.microsoft.com/devcontainers/typescript-node:22",
      build: {
        dockerfile: "Dockerfile",
        context: ".."
      },
      dockerComposeFile: "docker-compose.yml",
      service: "app",
      workspaceFolder: "/workspaces/repotutor",
      workspaceMount: "source=${localWorkspaceFolder},target=/workspaces/repotutor,type=bind,consistency=cached",
      features: {
        "ghcr.io/devcontainers/features/github-cli:1": {}
      },
      overrideFeatureInstallOrder: ["ghcr.io/devcontainers/features/github-cli"],
      initializeCommand: "node --version",
      onCreateCommand: "pnpm install",
      updateContentCommand: "pnpm build",
      postCreateCommand: "pnpm test",
      postStartCommand: "pnpm devcontainer:ready",
      postAttachCommand: "pnpm devcontainer:attach",
      waitFor: "postCreateCommand",
      containerEnv: {
        APP_MODE: "devcontainer"
      },
      remoteEnv: {
        NODE_OPTIONS: "--max-old-space-size=4096"
      },
      userEnvProbe: "loginInteractiveShell",
      secrets: {
        APP_TOKEN_NAME: {
          description: "Name of the token env var supplied by the operator"
        }
      },
      remoteUser: "node",
      containerUser: "node",
      updateRemoteUserUID: true,
      mounts: ["source=repotutor-cache,target=/cache,type=volume"],
      forwardPorts: [3000, 5173],
      portsAttributes: {
        "3000": { label: "app" }
      },
      otherPortsAttributes: {
        onAutoForward: "notify"
      },
      customizations: {
        vscode: {
          extensions: ["dbaeumer.vscode-eslint"],
          settings: { "editor.formatOnSave": true }
        },
        codespaces: { openFiles: ["README.md"] }
      },
      dotfiles: {
        repository: "local/dotfiles"
      },
      capAdd: ["SYS_PTRACE"],
      securityOpt: ["seccomp=unconfined"],
      privileged: true,
      hostRequirements: {
        cpus: 2
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "Dockerfile"), "FROM mcr.microsoft.com/devcontainers/typescript-node:22\nWORKDIR /workspaces/repotutor\n");
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "docker-compose.yml"), [
      "services:",
      "  app:",
      "    build:",
      "      context: ..",
      "      dockerfile: .devcontainer/Dockerfile",
      "    volumes:",
      "      - ..:/workspaces/repotutor",
      "    command: sleep infinity"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "devcontainer-feature.json"), JSON.stringify({
      id: "repotutor-tooling",
      version: "1.0.0",
      name: "RepoTutor tooling",
      installsAfter: ["ghcr.io/devcontainers/features/common-utils"],
      options: {
        installTools: {
          type: "boolean",
          default: true
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "devcontainer-template.json"), JSON.stringify({
      id: "repotutor-template",
      version: "1.0.0",
      name: "RepoTutor Template"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer-lock.json"), JSON.stringify({
      features: {
        "ghcr.io/devcontainers/features/github-cli:1": {
          version: "1"
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "devcontainer:read": "devcontainer read-configuration --workspace-folder .",
        "devcontainer:up": "devcontainer up --workspace-folder .",
        "devcontainer:build": "devcontainer build --workspace-folder . --frozen-lockfile",
        "devcontainer:exec": "devcontainer exec --workspace-folder . pnpm test",
        "devcontainer:run-user": "devcontainer run-user-commands --workspace-folder .",
        "devcontainer:features-test": "devcontainer features test .devcontainer",
        "devcontainer:features-package": "devcontainer features package .devcontainer",
        "devcontainer:outdated": "devcontainer outdated --workspace-folder .",
        "devcontainer:upgrade": "devcontainer upgrade --workspace-folder .",
        "devcontainer:templates": "devcontainer templates apply --template-id repotutor-template"
      },
      devDependencies: {
        "@devcontainers/cli": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "devcontainer.yml"), [
      "name: devcontainer",
      "on: [push]",
      "jobs:",
      "  devcontainer:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: devcontainer build --workspace-folder . --frozen-lockfile",
      "      - run: devcontainer read-configuration --workspace-folder ."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "devcontainer-readiness-report.json"), "utf8")) as {
      devContainerSetups: Array<{ filePath: string; format: string; configCount: number; imageBuildCount: number; featureCount: number; lifecycleCount: number; environmentCount: number; mountCount: number; portCount: number; userCount: number; customizationCount: number; workflowCount: number; lockfileCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      featureSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      environmentSignals: Array<{ signal: string; readiness: string }>;
      workspaceSignals: Array<{ signal: string; readiness: string }>;
      customizationSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const setup = report.devContainerSetups.find((item) => item.filePath === ".devcontainer/devcontainer.json");
    expect(report.devContainerSetups.length).toBeGreaterThan(0);
    expect(setup?.format).toBe("devcontainer-json");
    expect(setup?.configCount).toBeGreaterThan(0);
    expect(setup?.imageBuildCount).toBeGreaterThan(0);
    expect(setup?.featureCount).toBeGreaterThan(0);
    expect(setup?.lifecycleCount).toBeGreaterThan(0);
    expect(setup?.environmentCount).toBeGreaterThan(0);
    expect(setup?.mountCount).toBeGreaterThan(0);
    expect(setup?.portCount).toBeGreaterThan(0);
    expect(setup?.userCount).toBeGreaterThan(0);
    expect(setup?.customizationCount).toBeGreaterThan(0);
    expect(report.devContainerSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(report.devContainerSetups.some((item) => item.lockfileCount > 0)).toBe(true);
    for (const signal of ["devcontainer-json", "devcontainer-lock", "name", "image", "build", "dockerfile", "docker-compose-file", "service", "workspace-folder"]) {
      expect(report.configSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["features", "feature-json", "template-json", "installs-after", "options", "override-feature-install-order", "lockfile"]) {
      expect(report.featureSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["initialize-command", "on-create-command", "update-content-command", "post-create-command", "post-start-command", "post-attach-command", "wait-for"]) {
      expect(report.lifecycleSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["container-env", "remote-env", "user-env-probe", "secrets", "remote-user", "container-user"]) {
      expect(report.environmentSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["workspace-folder", "workspace-mount", "mounts", "forward-ports", "ports-attributes", "other-ports-attributes"]) {
      expect(report.workspaceSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["customizations", "vscode-extensions", "vscode-settings", "codespaces", "dotfiles"]) {
      expect(report.customizationSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["devcontainer-up", "devcontainer-build", "devcontainer-exec", "read-configuration", "run-user-commands", "features-test", "features-package", "outdated", "upgrade"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["lockfile", "frozen-lockfile", "non-root-user", "cap-add", "security-opt", "privileged", "host-requirements"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["devcontainers-cli", "devcontainer-cli", "devcontainer-feature", "devcontainer-template", "vscode-dev-containers"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "devcontainer-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "devcontainer-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Kubernetes readiness patterns without contacting a cluster", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-kubernetes-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-kubernetes-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "k8s", "base"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "k8s", "overlays", "dev"), { recursive: true });
    await fs.appendFile(path.join(sourceRoot, "README.md"), [
      "",
      "Kubernetes local workflow:",
      "kustomize build k8s/overlays/dev",
      "kubectl diff -k k8s/overlays/dev",
      "kubectl apply --dry-run=server -k k8s/overlays/dev",
      "kubectl apply -k k8s/overlays/dev",
      "kubectl wait --for=condition=Available deployment/repotutor-api -n repotutor-dev --timeout=180s",
      "kubectl rollout status deployment/repotutor-api -n repotutor-dev",
      "kubectl get pods -l app=repotutor-api -n repotutor-dev",
      "kubectl logs -l app=repotutor-api -n repotutor-dev",
      "kubectl describe hpa/repotutor-api -n repotutor-dev",
      "kubectl port-forward service/repotutor-api 8080:80 -n repotutor-dev",
      "kubectl delete -k k8s/overlays/dev",
      "kind create cluster --name repotutor-dev",
      "minikube start"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "k8s:build": "kustomize build k8s/overlays/dev",
        "k8s:diff": "kubectl diff -k k8s/overlays/dev",
        "k8s:apply": "kubectl apply -k k8s/overlays/dev",
        "k8s:wait": "kubectl wait --for=condition=Available deployment/repotutor-api -n repotutor-dev",
        "k8s:rollout": "kubectl rollout status deployment/repotutor-api -n repotutor-dev",
        "k8s:logs": "kubectl logs -l app=repotutor-api -n repotutor-dev",
        "k8s:describe": "kubectl describe deployment/repotutor-api -n repotutor-dev",
        "k8s:port": "kubectl port-forward service/repotutor-api 8080:80 -n repotutor-dev",
        "k8s:delete": "kubectl delete -k k8s/overlays/dev"
      },
      devDependencies: {
        kubectl: "latest",
        kustomize: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "kustomization.yaml"), [
      "resources:",
      "  - namespace.yaml",
      "  - serviceaccount.yaml",
      "  - rbac.yaml",
      "  - app-config.yaml",
      "  - storage.yaml",
      "  - workloads.yaml",
      "  - deployment.yaml",
      "  - service.yaml",
      "  - ingress.yaml",
      "  - hpa.yaml",
      "  - pdb.yaml",
      "  - networkpolicy.yaml",
      "configMapGenerator:",
      "  - name: repotutor-generated-config",
      "    literals:",
      "      - FEATURE_FLAG=enabled",
      "images:",
      "  - name: ghcr.io/veritas/repotutor-api",
      "    newTag: dev"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "namespace.yaml"), [
      "apiVersion: v1",
      "kind: Namespace",
      "metadata:",
      "  name: repotutor-dev",
      "  labels:",
      "    app.kubernetes.io/name: repotutor"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "serviceaccount.yaml"), [
      "apiVersion: v1",
      "kind: ServiceAccount",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "imagePullSecrets:",
      "  - name: repotutor-registry-reference"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "rbac.yaml"), [
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: Role",
      "metadata:",
      "  name: repotutor-reader",
      "  namespace: repotutor-dev",
      "rules:",
      "  - apiGroups: [\"\"]",
      "    resources: [\"configmaps\", \"pods\"]",
      "    verbs: [\"get\", \"list\", \"watch\"]",
      "---",
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: RoleBinding",
      "metadata:",
      "  name: repotutor-reader-binding",
      "  namespace: repotutor-dev",
      "subjects:",
      "  - kind: ServiceAccount",
      "    name: repotutor-api",
      "    namespace: repotutor-dev",
      "roleRef:",
      "  kind: Role",
      "  name: repotutor-reader",
      "  apiGroup: rbac.authorization.k8s.io",
      "---",
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: ClusterRole",
      "metadata:",
      "  name: repotutor-cluster-reader",
      "rules:",
      "  - apiGroups: [\"\"]",
      "    resources: [\"nodes\"]",
      "    verbs: [\"get\", \"list\"]",
      "---",
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: ClusterRoleBinding",
      "metadata:",
      "  name: repotutor-cluster-reader-binding",
      "subjects:",
      "  - kind: ServiceAccount",
      "    name: repotutor-api",
      "    namespace: repotutor-dev",
      "roleRef:",
      "  kind: ClusterRole",
      "  name: repotutor-cluster-reader",
      "  apiGroup: rbac.authorization.k8s.io"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "app-config.yaml"), [
      "apiVersion: v1",
      "kind: ConfigMap",
      "metadata:",
      "  name: repotutor-api-config",
      "  namespace: repotutor-dev",
      "data:",
      "  APP_MODE: dev",
      "---",
      "apiVersion: v1",
      "kind: Secret",
      "metadata:",
      "  name: repotutor-api-reference",
      "  namespace: repotutor-dev",
      "type: Opaque",
      "stringData:",
      "  TOKEN_NAME: APP_TOKEN_NAME"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "storage.yaml"), [
      "apiVersion: v1",
      "kind: PersistentVolume",
      "metadata:",
      "  name: repotutor-pv",
      "spec:",
      "  capacity:",
      "    storage: 1Gi",
      "  accessModes: [\"ReadWriteOnce\"]",
      "  storageClassName: manual",
      "  hostPath:",
      "    path: /tmp/repotutor",
      "---",
      "apiVersion: v1",
      "kind: PersistentVolumeClaim",
      "metadata:",
      "  name: repotutor-pvc",
      "  namespace: repotutor-dev",
      "spec:",
      "  storageClassName: manual",
      "  accessModes: [\"ReadWriteOnce\"]",
      "  resources:",
      "    requests:",
      "      storage: 1Gi"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "workloads.yaml"), [
      "apiVersion: apps/v1",
      "kind: StatefulSet",
      "metadata:",
      "  name: repotutor-stateful",
      "  namespace: repotutor-dev",
      "spec:",
      "  serviceName: repotutor-stateful",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-stateful",
      "  template:",
      "    metadata:",
      "      labels:",
      "        app: repotutor-stateful",
      "    spec:",
      "      containers:",
      "        - name: sidecar",
      "          image: ghcr.io/veritas/repotutor-sidecar:dev",
      "---",
      "apiVersion: apps/v1",
      "kind: DaemonSet",
      "metadata:",
      "  name: repotutor-agent",
      "  namespace: repotutor-dev",
      "spec:",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-agent",
      "  template:",
      "    metadata:",
      "      labels:",
      "        app: repotutor-agent",
      "    spec:",
      "      containers:",
      "        - name: agent",
      "          image: ghcr.io/veritas/repotutor-agent:dev",
      "---",
      "apiVersion: batch/v1",
      "kind: Job",
      "metadata:",
      "  name: repotutor-migrate",
      "  namespace: repotutor-dev",
      "spec:",
      "  template:",
      "    spec:",
      "      restartPolicy: Never",
      "      containers:",
      "        - name: migrate",
      "          image: ghcr.io/veritas/repotutor-api:dev",
      "---",
      "apiVersion: batch/v1",
      "kind: CronJob",
      "metadata:",
      "  name: repotutor-refresh",
      "  namespace: repotutor-dev",
      "spec:",
      "  schedule: \"*/30 * * * *\"",
      "  jobTemplate:",
      "    spec:",
      "      template:",
      "        spec:",
      "          restartPolicy: OnFailure",
      "          containers:",
      "            - name: refresh",
      "              image: ghcr.io/veritas/repotutor-api:dev",
      "---",
      "apiVersion: v1",
      "kind: Pod",
      "metadata:",
      "  name: repotutor-debug",
      "  namespace: repotutor-dev",
      "  labels:",
      "    app: repotutor-debug",
      "spec:",
      "  containers:",
      "    - name: debug",
      "      image: ghcr.io/veritas/repotutor-api:dev"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "deployment.yaml"), [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "  labels:",
      "    app: repotutor-api",
      "spec:",
      "  replicas: 2",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-api",
      "  template:",
      "    metadata:",
      "      labels:",
      "        app: repotutor-api",
      "      annotations:",
      "        prometheus.io/scrape: \"true\"",
      "        repotutor.dev/config: placeholder",
      "    spec:",
      "      serviceAccountName: repotutor-api",
      "      securityContext:",
      "        runAsNonRoot: true",
      "      containers:",
      "        - name: api",
      "          image: ghcr.io/veritas/repotutor-api:dev",
      "          ports:",
      "            - containerPort: 8080",
      "          env:",
      "            - name: APP_MODE",
      "              value: dev",
      "          envFrom:",
      "            - configMapRef:",
      "                name: repotutor-api-config",
      "          volumeMounts:",
      "            - name: data",
      "              mountPath: /data",
      "          readinessProbe:",
      "            httpGet:",
      "              path: /ready",
      "              port: 8080",
      "          livenessProbe:",
      "            httpGet:",
      "              path: /health",
      "              port: 8080",
      "          startupProbe:",
      "            httpGet:",
      "              path: /startup",
      "              port: 8080",
      "          resources:",
      "            requests:",
      "              cpu: 100m",
      "              memory: 128Mi",
      "            limits:",
      "              cpu: 500m",
      "              memory: 512Mi",
      "          securityContext:",
      "            allowPrivilegeEscalation: false",
      "      volumes:",
      "        - name: data",
      "          persistentVolumeClaim:",
      "            claimName: repotutor-pvc"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "service.yaml"), [
      "apiVersion: v1",
      "kind: Service",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  selector:",
      "    app: repotutor-api",
      "  ports:",
      "    - port: 80",
      "      targetPort: 8080"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "ingress.yaml"), [
      "apiVersion: networking.k8s.io/v1",
      "kind: Ingress",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  rules:",
      "    - host: repotutor.local",
      "      http:",
      "        paths:",
      "          - path: /",
      "            pathType: Prefix",
      "            backend:",
      "              service:",
      "                name: repotutor-api",
      "                port:",
      "                  number: 80"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "hpa.yaml"), [
      "apiVersion: autoscaling/v2",
      "kind: HorizontalPodAutoscaler",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  scaleTargetRef:",
      "    apiVersion: apps/v1",
      "    kind: Deployment",
      "    name: repotutor-api",
      "  minReplicas: 2",
      "  maxReplicas: 5",
      "  metrics:",
      "    - type: Resource",
      "      resource:",
      "        name: cpu",
      "        target:",
      "          type: Utilization",
      "          averageUtilization: 70"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "pdb.yaml"), [
      "apiVersion: policy/v1",
      "kind: PodDisruptionBudget",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  minAvailable: 1",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-api"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "networkpolicy.yaml"), [
      "apiVersion: networking.k8s.io/v1",
      "kind: NetworkPolicy",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  podSelector:",
      "    matchLabels:",
      "      app: repotutor-api",
      "  policyTypes:",
      "    - Ingress"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "overlays", "dev", "kustomization.yaml"), [
      "bases:",
      "  - ../../base",
      "resources:",
      "  - ../../base",
      "namespace: repotutor-dev",
      "components:",
      "  - ../components/observability",
      "patches:",
      "  - target:",
      "      kind: Deployment",
      "      name: repotutor-api",
      "    patch: |-",
      "      - op: replace",
      "        path: /spec/replicas",
      "        value: 2",
      "configMapGenerator:",
      "  - name: repotutor-dev-settings",
      "    literals:",
      "      - LOG_LEVEL=debug",
      "secretGenerator:",
      "  - name: repotutor-generated-reference",
      "    literals:",
      "      - TOKEN_NAME=APP_TOKEN_NAME",
      "images:",
      "  - name: ghcr.io/veritas/repotutor-api",
      "    newTag: dev-2026",
      "replacements:",
      "  - source:",
      "      kind: ConfigMap",
      "      name: repotutor-dev-settings",
      "      fieldPath: metadata.name",
      "    targets:",
      "      - select:",
      "          kind: Deployment",
      "          name: repotutor-api",
      "        fieldPaths:",
      "          - spec.template.metadata.annotations.[repotutor.dev/config]"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "kubernetes-readiness-report.json"), "utf8")) as {
      kubernetesSetups: Array<{ filePath: string; format: string; manifestCount: number; workloadCount: number; serviceCount: number; configCount: number; storageCount: number; securityCount: number; policyCount: number; probeCount: number; resourceCount: number; autoscalingCount: number; observabilityCount: number; workflowCount: number }>;
      manifestSignals: Array<{ signal: string; readiness: string }>;
      workloadSignals: Array<{ signal: string; readiness: string }>;
      networkSignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      healthSignals: Array<{ signal: string; readiness: string }>;
      kustomizeSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const deploymentSetup = report.kubernetesSetups.find((item) => item.filePath === "k8s/base/deployment.yaml");
    const overlaySetup = report.kubernetesSetups.find((item) => item.filePath === "k8s/overlays/dev/kustomization.yaml");
    expect(report.kubernetesSetups.length).toBeGreaterThan(0);
    expect(deploymentSetup?.format).toBe("manifest-yaml");
    expect(deploymentSetup?.manifestCount).toBeGreaterThan(0);
    expect(deploymentSetup?.workloadCount).toBeGreaterThan(0);
    expect(deploymentSetup?.serviceCount).toBeGreaterThan(0);
    expect(deploymentSetup?.configCount).toBeGreaterThan(0);
    expect(deploymentSetup?.storageCount).toBeGreaterThan(0);
    expect(deploymentSetup?.securityCount).toBeGreaterThan(0);
    expect(deploymentSetup?.probeCount).toBeGreaterThan(0);
    expect(deploymentSetup?.resourceCount).toBeGreaterThan(0);
    expect(overlaySetup?.format).toBe("kustomization");
    expect(report.kubernetesSetups.some((item) => item.workflowCount > 0)).toBe(true);
    for (const signal of ["api-version", "kind", "metadata", "labels", "annotations", "namespace"]) {
      expect(report.manifestSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["deployment", "statefulset", "daemonset", "job", "cronjob", "pod", "replicas"]) {
      expect(report.workloadSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["service", "ingress", "network-policy", "ports", "selectors"]) {
      expect(report.networkSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["configmap", "secret", "env", "env-from", "image-pull-secret"]) {
      expect(report.configSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["persistent-volume", "persistent-volume-claim", "volume-mount", "volume", "storage-class"]) {
      expect(report.storageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["service-account", "role", "role-binding", "cluster-role", "cluster-role-binding", "security-context", "pod-security-context"]) {
      expect(report.securitySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["readiness-probe", "liveness-probe", "startup-probe", "resources", "limits", "requests", "hpa", "pdb"]) {
      expect(report.healthSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kustomization", "resources", "bases", "patches", "configmap-generator", "secret-generator", "images", "replacements", "components"]) {
      expect(report.kustomizeSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kubectl-apply", "kubectl-diff", "kubectl-wait", "kubectl-rollout", "kubectl-logs", "kubectl-describe", "kubectl-port-forward", "kubectl-delete", "kustomize-build"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kubectl", "kustomize", "kubernetes-yaml", "kind", "minikube"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "kubernetes-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "kubernetes-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects GitOps readiness patterns without contacting controllers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-gitops-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-gitops-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "gitops", "apps"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "clusters", "dev"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "GitOps workflow with Argo CD and Flux:",
      "Argo CD reviews Application drift before sync.",
      "argocd app diff repotutor-api",
      "argocd app sync repotutor-api --prune",
      "argocd app wait repotutor-api --health",
      "argocd app get repotutor-api",
      "argocd repo add https://github.com/example/platform.git",
      "argocd cluster add dev",
      "flux bootstrap github --owner=example --repository=platform --path=clusters/dev",
      "flux reconcile kustomization repotutor-api --with-source",
      "flux get all",
      "flux suspend kustomization repotutor-api",
      "flux resume kustomization repotutor-api",
      "flux trace deployment/repotutor-api",
      "flux tree kustomization repotutor-api",
      "flux logs --kind=Kustomization",
      "flux events",
      "Flux controllers include source-controller, kustomize-controller, helm-controller, notification-controller, and image-automation-controller.",
      "The rollout requires signed commit verification and manual approval before production promotion."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "gitops", "apps", "argocd-app.yaml"), [
      "apiVersion: argoproj.io/v1alpha1",
      "kind: Application",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: argocd",
      "spec:",
      "  project: platform",
      "  source:",
      "    repoURL: https://github.com/example/platform.git",
      "    targetRevision: main",
      "    path: services/repotutor",
      "    helm:",
      "      valueFiles:",
      "        - values-dev.yaml",
      "    kustomize:",
      "      namePrefix: dev-",
      "  destination:",
      "    server: https://kubernetes.default.svc",
      "    namespace: repotutor-dev",
      "  syncPolicy:",
      "    automated:",
      "      prune: true",
      "      selfHeal: true",
      "    syncOptions:",
      "      - CreateNamespace=true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "gitops", "apps", "applicationset.yaml"), [
      "apiVersion: argoproj.io/v1alpha1",
      "kind: ApplicationSet",
      "metadata:",
      "  name: repotutor-fleet",
      "spec:",
      "  generators:",
      "    - git:",
      "        repoURL: https://github.com/example/platform.git",
      "        revision: main",
      "        directories:",
      "          - path: clusters/*",
      "    - matrix:",
      "        generators:",
      "          - clusters: {}",
      "          - list:",
      "              elements:",
      "                - name: dev",
      "  template:",
      "    spec:",
      "      project: platform",
      "      source:",
      "        repoURL: https://github.com/example/platform.git",
      "        targetRevision: main",
      "        path: \"{{path}}\"",
      "      destination:",
      "        server: https://kubernetes.default.svc",
      "        namespace: repotutor-dev"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "gitops", "apps", "project.yaml"), [
      "apiVersion: argoproj.io/v1alpha1",
      "kind: AppProject",
      "metadata:",
      "  name: platform",
      "spec:",
      "  sourceRepos:",
      "    - https://github.com/example/platform.git",
      "  destinations:",
      "    - namespace: repotutor-*",
      "      server: https://kubernetes.default.svc",
      "  clusterResourceWhitelist:",
      "    - group: \"\"",
      "      kind: Namespace",
      "  namespaceResourceBlacklist:",
      "    - group: \"\"",
      "      kind: Secret",
      "  syncWindows:",
      "    - kind: allow",
      "      schedule: \"0 2 * * *\"",
      "      duration: 1h"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "clusters", "dev", "flux.yaml"), [
      "apiVersion: source.toolkit.fluxcd.io/v1",
      "kind: GitRepository",
      "metadata:",
      "  name: platform",
      "  namespace: flux-system",
      "spec:",
      "  interval: 1m",
      "  url: https://github.com/example/platform.git",
      "  ref:",
      "    branch: main",
      "  secretRef:",
      "    name: platform-git-reference",
      "---",
      "apiVersion: source.toolkit.fluxcd.io/v1",
      "kind: HelmRepository",
      "metadata:",
      "  name: platform-charts",
      "spec:",
      "  interval: 10m",
      "  url: https://charts.example.invalid",
      "---",
      "apiVersion: source.toolkit.fluxcd.io/v1beta2",
      "kind: OCIRepository",
      "metadata:",
      "  name: platform-oci",
      "spec:",
      "  interval: 10m",
      "  url: oci://ghcr.io/example/platform",
      "---",
      "apiVersion: source.toolkit.fluxcd.io/v1",
      "kind: Bucket",
      "metadata:",
      "  name: platform-bucket",
      "spec:",
      "  interval: 10m",
      "  bucketName: platform",
      "  endpoint: storage.example.invalid",
      "---",
      "apiVersion: kustomize.toolkit.fluxcd.io/v1",
      "kind: Kustomization",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: flux-system",
      "spec:",
      "  interval: 5m",
      "  retryInterval: 1m",
      "  timeout: 2m",
      "  path: ./services/repotutor",
      "  prune: true",
      "  suspend: false",
      "  targetNamespace: repotutor-dev",
      "  serviceAccountName: flux-reconciler",
      "  sourceRef:",
      "    kind: GitRepository",
      "    name: platform",
      "  dependsOn:",
      "    - name: platform-base",
      "  healthChecks:",
      "    - apiVersion: apps/v1",
      "      kind: Deployment",
      "      name: repotutor-api",
      "      namespace: repotutor-dev",
      "---",
      "apiVersion: helm.toolkit.fluxcd.io/v2",
      "kind: HelmRelease",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: flux-system",
      "spec:",
      "  interval: 5m",
      "  chart:",
      "    spec:",
      "      chart: ./chart",
      "      sourceRef:",
      "        kind: GitRepository",
      "        name: platform",
      "---",
      "apiVersion: image.toolkit.fluxcd.io/v1",
      "kind: ImageRepository",
      "metadata:",
      "  name: repotutor-api",
      "spec:",
      "  image: ghcr.io/example/repotutor-api",
      "  interval: 10m",
      "---",
      "apiVersion: image.toolkit.fluxcd.io/v1",
      "kind: ImagePolicy",
      "metadata:",
      "  name: repotutor-api",
      "spec:",
      "  imageRepositoryRef:",
      "    name: repotutor-api",
      "  policy:",
      "    semver:",
      "      range: \">=1.0.0\"",
      "---",
      "apiVersion: image.toolkit.fluxcd.io/v1",
      "kind: ImageUpdateAutomation",
      "metadata:",
      "  name: repotutor-api",
      "spec:",
      "  interval: 5m",
      "  sourceRef:",
      "    kind: GitRepository",
      "    name: platform",
      "---",
      "apiVersion: notification.toolkit.fluxcd.io/v1beta3",
      "kind: Provider",
      "metadata:",
      "  name: slack",
      "spec:",
      "  type: slack",
      "  secretRef:",
      "    name: slack-webhook-reference",
      "---",
      "apiVersion: notification.toolkit.fluxcd.io/v1beta3",
      "kind: Alert",
      "metadata:",
      "  name: repotutor-alerts",
      "spec:",
      "  providerRef:",
      "    name: slack",
      "---",
      "apiVersion: notification.toolkit.fluxcd.io/v1",
      "kind: Receiver",
      "metadata:",
      "  name: github-webhook",
      "spec:",
      "  type: github",
      "  events:",
      "    - ping"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "gitops-readiness-report.json"), "utf8")) as {
      gitopsSetups: Array<{ filePath: string; controller: string; applicationCount: number; sourceCount: number; destinationCount: number; syncPolicyCount: number; generatorCount: number; fluxSourceCount: number; fluxReconcileCount: number; imageAutomationCount: number; notificationCount: number; workflowCount: number }>;
      argoSignals: Array<{ signal: string; readiness: string }>;
      fluxSourceSignals: Array<{ signal: string; readiness: string }>;
      fluxReconcileSignals: Array<{ signal: string; readiness: string }>;
      imageNotificationSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const argoSetup = report.gitopsSetups.find((item) => item.filePath === "gitops/apps/argocd-app.yaml");
    const fluxSetup = report.gitopsSetups.find((item) => item.filePath === "clusters/dev/flux.yaml");
    expect(report.gitopsSetups.length).toBeGreaterThan(0);
    expect(argoSetup?.controller).toBe("argo-cd");
    expect(argoSetup?.applicationCount).toBeGreaterThan(0);
    expect(argoSetup?.sourceCount).toBeGreaterThan(0);
    expect(argoSetup?.destinationCount).toBeGreaterThan(0);
    expect(argoSetup?.syncPolicyCount).toBeGreaterThan(0);
    expect(fluxSetup?.controller).toBe("flux");
    expect(fluxSetup?.fluxSourceCount).toBeGreaterThan(0);
    expect(fluxSetup?.fluxReconcileCount).toBeGreaterThan(0);
    expect(fluxSetup?.imageAutomationCount).toBeGreaterThan(0);
    expect(fluxSetup?.notificationCount).toBeGreaterThan(0);
    for (const signal of ["application", "applicationset", "app-project", "repo-url", "target-revision", "path", "destination-server", "destination-namespace", "sync-policy", "automated-sync", "prune", "self-heal", "sync-options", "helm-source", "kustomize-source"]) {
      expect(report.argoSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["git-repository", "helm-repository", "oci-repository", "bucket", "source-ref", "interval", "secret-ref"]) {
      expect(report.fluxSourceSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kustomization", "helm-release", "depends-on", "prune", "suspend", "health-checks", "timeout", "retry-interval", "target-namespace", "service-account"]) {
      expect(report.fluxReconcileSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["image-repository", "image-policy", "image-update-automation", "receiver", "alert", "provider", "webhook"]) {
      expect(report.imageNotificationSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["argocd-app-sync", "argocd-app-diff", "argocd-app-wait", "argocd-app-get", "argocd-repo-add", "argocd-cluster-add", "flux-bootstrap", "flux-reconcile", "flux-get", "flux-suspend", "flux-resume", "flux-trace", "flux-tree", "flux-logs", "flux-events"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["dry-run", "namespace", "project-boundary", "sync-window", "allow-list", "deny-list", "signed-commit", "health-check", "drift-detection", "manual-approval"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["argocd", "argo-cd", "flux", "fluxcd", "source-controller", "kustomize-controller", "helm-controller", "notification-controller", "image-automation-controller"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "gitops-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "gitops-readiness.html"))).resolves.toBeUndefined();
  });

  it("compares a new study session against the previous source snapshot", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incremental-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incremental-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "scratch.txt"), "temporary notes not important to the lesson map\n");

    const first = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    await fs.writeFile(path.join(sourceRoot, "src", "added.ts"), "export const added = 'next lesson';\n");
    await fs.appendFile(path.join(sourceRoot, "src", "message.ts"), "\nexport const changed = true;\n");
    await fs.rm(path.join(sourceRoot, "README.md"));
    await fs.rm(path.join(sourceRoot, "scratch.txt"));

    const second = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });

    expect(second.analysis.incrementalReport.baselineSessionId).toBe(first.session.sessionId);
    expect(second.analysis.incrementalReport.addedFiles).toContain("src/added.ts");
    expect(second.analysis.incrementalReport.changedFiles).toContain("src/message.ts");
    expect(second.analysis.incrementalReport.removedFiles).toContain("README.md");
    expect(second.analysis.incrementalReport.unchangedFiles).toContain("src/main.ts");
    expect(second.analysis.incrementalReport.coverageDelta.baselineCoverageRatio).toBeLessThan(second.analysis.incrementalReport.coverageDelta.currentCoverageRatio);
    expect(second.analysis.incrementalReport.coverageDelta.coverageRatioDelta).toBeGreaterThan(0);
  });

  it("resolves relative local sources against an explicit source base directory", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-relative-studies-"));
    const sourceBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-relative-source-base-"));
    await fs.cp(fixtureRoot, path.join(sourceBaseDir, "relative-app"), { recursive: true });

    const result = await runStudy({
      source: "relative-app",
      sourceBaseDir,
      mode: "quick",
      level: "beginner",
      studiesRoot
    });

    expect(result.session.status).toBe("complete");
    expect(result.session.localSourcePath).toBe(path.join(sourceBaseDir, "relative-app"));
    await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
  });

  it("uses the required quiz count formula bounds", () => {
    expect(calculateQuizCount({ mode: "quick", folderCount: 1, fileCount: 1, glossaryCount: 1, sectionCount: 1 })).toBeGreaterThanOrEqual(5);
    expect(calculateQuizCount({ mode: "standard", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(35);
    expect(calculateQuizCount({ mode: "deep", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(60);
  });
});
