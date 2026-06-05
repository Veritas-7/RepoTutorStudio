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
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-metrics-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-ownership-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "large-asset-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "license-rights-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "sbom-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "security-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "scorecard-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "provenance-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "advisory-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "vex-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "policy-gate-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "api-contract-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "consumer-contract-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "observability-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "performance-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "load-testing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "e2e-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "integration-test-environment-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "chaos-engineering-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "accessibility-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "storybook-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "design-tokens-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "i18n-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "release-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "secret-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "secret-management-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "container-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-quality-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "documentation-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "database-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "ci-cd-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "unit-test-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "coverage-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "mutation-testing-readiness-report.json"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "authorization-readiness-report.json"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "browser-extension-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "env-validation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "security-headers-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "graphql-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "cli-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "llm-eval-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "llm-observability-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "search-service-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "object-storage-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "realtime-collaboration-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "workflow-orchestration-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "openapi-client-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "webhook-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "notification-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "consent-readiness-report.json"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "desktop-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "edge-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "compose-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "devcontainer-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "kubernetes-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "gitops-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "backup-readiness-report.json"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-metrics-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-ownership-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "large-asset-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "license-rights.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "sbom.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "security-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "scorecard.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "provenance.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "advisories.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "vex.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "policy-gates.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "api-contracts.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "consumer-contract-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "observability.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "performance.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "load-testing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "e2e.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "integration-test-environment-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "chaos-engineering-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "accessibility.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "storybook.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "design-tokens.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "i18n.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "release-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "secret-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "secret-management-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "container-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-quality.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "documentation.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "database-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "ci-cd.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "unit-tests.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "coverage-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mutation-testing-readiness.md"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "authorization-readiness.md"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "browser-extension-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "env-validation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "security-headers-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "graphql-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "cli-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-eval-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-observability-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "vector-db-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "search-service-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "object-storage-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "realtime-collaboration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "workflow-orchestration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "openapi-client-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "webhook-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "notification-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "consent-readiness.md"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "desktop-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "edge-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "compose-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "devcontainer-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "kubernetes-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "gitops-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "backup-readiness.md"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-metrics-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-ownership-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "large-asset-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "license-rights.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "sbom.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "security-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "scorecard.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "provenance.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "advisories.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "vex.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "policy-gates.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "api-contracts.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "consumer-contract-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "observability.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "performance.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "load-testing-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "e2e.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "integration-test-environment-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "chaos-engineering-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "accessibility.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "storybook.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "design-tokens.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "i18n.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "release-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "secret-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "secret-management-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "container-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-quality.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "documentation.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "database-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "ci-cd.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "unit-tests.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "coverage-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mutation-testing-readiness.html"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.html, "authorization-readiness.html"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.html, "browser-extension-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "env-validation-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "security-headers-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "graphql-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "cli-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-eval-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-observability-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "vector-db-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "search-service-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "object-storage-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "realtime-collaboration-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "workflow-orchestration-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "openapi-client-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "webhook-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "notification-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "consent-readiness.html"))).resolves.toBeUndefined();
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
    await expect(fs.access(path.join(result.session.outputPaths.html, "desktop-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "edge-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "compose-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "devcontainer-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "kubernetes-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "gitops-readiness.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "backup-readiness.html"))).resolves.toBeUndefined();
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
    expect(learningPathTourText).toContain("\"file\": \"html/code-metrics-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/code-ownership-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/large-asset-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/license-rights.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/sbom.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/security-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/scorecard.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/provenance.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/advisories.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/vex.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/policy-gates.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/api-contracts.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/consumer-contract-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/observability.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/performance.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/load-testing-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/e2e.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/integration-test-environment-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/chaos-engineering-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/accessibility.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/storybook.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/design-tokens.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/i18n.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/release-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/secret-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/secret-management-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/container-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/code-quality.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/documentation.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/database-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/ci-cd.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/unit-tests.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/coverage-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/mutation-testing-readiness.html\"");
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
    expect(learningPathTourText).toContain("\"file\": \"html/authorization-readiness.html\"");
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
    expect(learningPathTourText).toContain("\"file\": \"html/browser-extension-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/env-validation-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/security-headers-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/graphql-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/cli-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/llm-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/llm-eval-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/llm-observability-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/vector-db-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/search-service-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/object-storage-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/realtime-collaboration-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/workflow-orchestration-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/openapi-client-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/webhook-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/notification-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/consent-readiness.html\"");
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
    expect(learningPathTourText).toContain("\"file\": \"html/desktop-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/edge-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/compose-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/devcontainer-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/kubernetes-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/gitops-readiness.html\"");
    expect(learningPathTourText).toContain("\"file\": \"html/backup-readiness.html\"");
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
    const codeMetricsText = await fs.readFile(path.join(result.session.outputPaths.analysis, "code-metrics-readiness-report.json"), "utf8");
    expect(codeMetricsText).toContain("scc lizard tokei cloc radon cyclomatic complexity code lines comments blanks hotspots COCOMO LOCOMO JSON CSV HTML OpenMetrics thresholds");
    expect(codeMetricsText).toContain("\"languageMetrics\"");
    expect(codeMetricsText).toContain("\"hotspots\"");
    expect(codeMetricsText).toContain("\"toolSignals\"");
    expect(codeMetricsText).toContain("\"metricSignals\"");
    expect(codeMetricsText).toContain("\"workflowSignals\"");
    expect(codeMetricsText).toContain("\"complexityDensity\"");
    expect(codeMetricsText).toContain("scc --by-file --wide --format json .");
    const codeMetricsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "code-metrics-readiness.html"), "utf8");
    expect(codeMetricsHtml).toContain("Code Metrics Readiness");
    expect(codeMetricsHtml).toContain("code-metrics-readiness-card");
    expect(codeMetricsHtml).toContain("data-source-pattern=\"scc\"");
    expect(codeMetricsHtml).toContain("Code Metrics Snapshot");
    expect(codeMetricsHtml).toContain("branch tokens");
    const codeMetricsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "code-metrics-readiness.md"), "utf8");
    expect(codeMetricsMarkdown).toContain("# Code Metrics Readiness");
    expect(codeMetricsMarkdown).toContain("Source pattern: scc");
    expect(codeMetricsMarkdown).toContain("## Language Metrics");
    expect(codeMetricsMarkdown).toContain("## Workflow Signals");
    const codeOwnershipText = await fs.readFile(path.join(result.session.outputPaths.analysis, "code-ownership-readiness-report.json"), "utf8");
    expect(codeOwnershipText).toContain("CODEOWNERS standard locations root .github docs gitignore-style patterns owners teams users email last matching rule branch protection required code owner reviews rulesets syntax owner file duplicate not-owned validation");
    expect(codeOwnershipText).toContain("\"codeownerFiles\"");
    expect(codeOwnershipText).toContain("\"ownershipSignals\"");
    expect(codeOwnershipText).toContain("\"validationSignals\"");
    expect(codeOwnershipText).toContain("\"reviewSignals\"");
    expect(codeOwnershipText).toContain("\"coverageSignals\"");
    expect(codeOwnershipText).toContain("\"packageSignals\"");
    expect(codeOwnershipText).toContain("codeowners-validator --checks files,owners,duppatterns,syntax");
    const codeOwnershipHtml = await fs.readFile(path.join(result.session.outputPaths.html, "code-ownership-readiness.html"), "utf8");
    expect(codeOwnershipHtml).toContain("Code Ownership Readiness");
    expect(codeOwnershipHtml).toContain("code-ownership-readiness-card");
    expect(codeOwnershipHtml).toContain("data-source-pattern=\"CODEOWNERS\"");
    expect(codeOwnershipHtml).toContain("CODEOWNERS Files");
    expect(codeOwnershipHtml).toContain("Review Signals");
    const codeOwnershipMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "code-ownership-readiness.md"), "utf8");
    expect(codeOwnershipMarkdown).toContain("# Code Ownership Readiness");
    expect(codeOwnershipMarkdown).toContain("Source pattern: CODEOWNERS");
    expect(codeOwnershipMarkdown).toContain("## CODEOWNERS Files");
    expect(codeOwnershipMarkdown).toContain("## Review Signals");
    const largeAssetText = await fs.readFile(path.join(result.session.outputPaths.analysis, "large-asset-readiness-report.json"), "utf8");
    expect(largeAssetText).toContain("Git LFS DVC large file data versioning .gitattributes filter=lfs pointer oid sha256 lockable migrate track status fsck prune dvc.yaml dvc.lock outs deps metrics params remote cache push pull status repro");
    expect(largeAssetText).toContain("\"assetSetups\"");
    expect(largeAssetText).toContain("\"lfsSignals\"");
    expect(largeAssetText).toContain("\"dvcSignals\"");
    expect(largeAssetText).toContain("\"submoduleSignals\"");
    expect(largeAssetText).toContain("\"workflowSignals\"");
    expect(largeAssetText).toContain("\"packageSignals\"");
    expect(largeAssetText).toContain("git lfs fsck --pointers BASE..HEAD");
    const largeAssetHtml = await fs.readFile(path.join(result.session.outputPaths.html, "large-asset-readiness.html"), "utf8");
    expect(largeAssetHtml).toContain("Large Asset Readiness");
    expect(largeAssetHtml).toContain("large-asset-readiness-card");
    expect(largeAssetHtml).toContain("data-source-pattern=\"Git LFS DVC\"");
    expect(largeAssetHtml).toContain("Asset Setups");
    expect(largeAssetHtml).toContain("DVC Signals");
    const largeAssetMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "large-asset-readiness.md"), "utf8");
    expect(largeAssetMarkdown).toContain("# Large Asset Readiness");
    expect(largeAssetMarkdown).toContain("Source pattern: Git LFS DVC");
    expect(largeAssetMarkdown).toContain("## Asset Setups");
    expect(largeAssetMarkdown).toContain("## DVC Signals");
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
    const consumerContractText = await fs.readFile(path.join(result.session.outputPaths.analysis, "consumer-contract-readiness-report.json"), "utf8");
    expect(consumerContractText).toContain("Pact consumer driven contracts interactions provider states verifier broker can-i-deploy matchers publish verification");
    expect(consumerContractText).toContain("\"contractSetups\"");
    expect(consumerContractText).toContain("\"interactionSignals\"");
    expect(consumerContractText).toContain("\"providerSignals\"");
    expect(consumerContractText).toContain("\"brokerSignals\"");
    expect(consumerContractText).toContain("\"matcherSignals\"");
    expect(consumerContractText).toContain("\"ciSignals\"");
    expect(consumerContractText).toContain("\"packageSignals\"");
    expect(consumerContractText).toContain("can-i-deploy");
    const consumerContractHtml = await fs.readFile(path.join(result.session.outputPaths.html, "consumer-contract-readiness.html"), "utf8");
    expect(consumerContractHtml).toContain("Consumer Contract Readiness");
    expect(consumerContractHtml).toContain("consumer-contract-readiness-card");
    expect(consumerContractHtml).toContain("data-source-pattern=\"Pact\"");
    expect(consumerContractHtml).toContain("Consumer Contract Snapshot");
    expect(consumerContractHtml).toContain("Broker Signals");
    const consumerContractMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "consumer-contract-readiness.md"), "utf8");
    expect(consumerContractMarkdown).toContain("# Consumer Contract Readiness");
    expect(consumerContractMarkdown).toContain("Source pattern: Pact");
    expect(consumerContractMarkdown).toContain("## Contract Setups");
    expect(consumerContractMarkdown).toContain("## Broker Signals");
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
    const loadTestingText = await fs.readFile(path.join(result.session.outputPaths.analysis, "load-testing-readiness-report.json"), "utf8");
    expect(loadTestingText).toContain("k6 Artillery Locust load testing scenarios phases thresholds checks ensure HttpUser headless distributed reports");
    expect(loadTestingText).toContain("\"loadTestSetups\"");
    expect(loadTestingText).toContain("\"toolSignals\"");
    expect(loadTestingText).toContain("\"profileSignals\"");
    expect(loadTestingText).toContain("\"protocolSignals\"");
    expect(loadTestingText).toContain("\"assertionSignals\"");
    expect(loadTestingText).toContain("\"dataSignals\"");
    expect(loadTestingText).toContain("\"executionSignals\"");
    expect(loadTestingText).toContain("\"reportSignals\"");
    expect(loadTestingText).toContain("\"packageSignals\"");
    expect(loadTestingText).toContain("k6 run --summary-export");
    const loadTestingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "load-testing-readiness.html"), "utf8");
    expect(loadTestingHtml).toContain("Load Testing Readiness");
    expect(loadTestingHtml).toContain("load-testing-readiness-card");
    expect(loadTestingHtml).toContain("data-source-pattern=\"k6\"");
    expect(loadTestingHtml).toContain("Load Test Setups");
    expect(loadTestingHtml).toContain("Assertion Signals");
    const loadTestingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "load-testing-readiness.md"), "utf8");
    expect(loadTestingMarkdown).toContain("# Load Testing Readiness");
    expect(loadTestingMarkdown).toContain("Source pattern: k6 Artillery Locust");
    expect(loadTestingMarkdown).toContain("## Profile Signals");
    expect(loadTestingMarkdown).toContain("## Report Signals");
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
    const integrationTestEnvironmentText = await fs.readFile(path.join(result.session.outputPaths.analysis, "integration-test-environment-readiness-report.json"), "utf8");
    expect(integrationTestEnvironmentText).toContain("Testcontainers GenericContainer DockerContainer DockerComposeEnvironment DockerCompose wait strategies exposed ports env lifecycle stop Ryuk resource reaper pytest beforeAll afterAll");
    expect(integrationTestEnvironmentText).toContain("\"integrationSetups\"");
    expect(integrationTestEnvironmentText).toContain("\"containerSignals\"");
    expect(integrationTestEnvironmentText).toContain("\"waitSignals\"");
    expect(integrationTestEnvironmentText).toContain("\"lifecycleSignals\"");
    expect(integrationTestEnvironmentText).toContain("\"runtimeSignals\"");
    expect(integrationTestEnvironmentText).toContain("\"packageSignals\"");
    expect(integrationTestEnvironmentText).toContain("wait_for_logs");
    const integrationTestEnvironmentHtml = await fs.readFile(path.join(result.session.outputPaths.html, "integration-test-environment-readiness.html"), "utf8");
    expect(integrationTestEnvironmentHtml).toContain("Integration Test Environment Readiness");
    expect(integrationTestEnvironmentHtml).toContain("integration-test-environment-readiness-card");
    expect(integrationTestEnvironmentHtml).toContain("data-source-pattern=\"Testcontainers\"");
    expect(integrationTestEnvironmentHtml).toContain("Wait Signals");
    expect(integrationTestEnvironmentHtml).toContain("Lifecycle Signals");
    const integrationTestEnvironmentMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "integration-test-environment-readiness.md"), "utf8");
    expect(integrationTestEnvironmentMarkdown).toContain("# Integration Test Environment Readiness");
    expect(integrationTestEnvironmentMarkdown).toContain("Source pattern: Testcontainers");
    expect(integrationTestEnvironmentMarkdown).toContain("## Wait Signals");
    expect(integrationTestEnvironmentMarkdown).toContain("## Runtime Signals");
    const chaosEngineeringText = await fs.readFile(path.join(result.session.outputPaths.analysis, "chaos-engineering-readiness-report.json"), "utf8");
    expect(chaosEngineeringText).toContain("Chaos Mesh LitmusChaos Toxiproxy chaos experiments probes steady state blast radius schedules toxics cleanup");
    expect(chaosEngineeringText).toContain("\"chaosSetups\"");
    expect(chaosEngineeringText).toContain("\"experimentSignals\"");
    expect(chaosEngineeringText).toContain("\"faultSignals\"");
    expect(chaosEngineeringText).toContain("\"scopeSignals\"");
    expect(chaosEngineeringText).toContain("\"safetySignals\"");
    expect(chaosEngineeringText).toContain("\"observabilitySignals\"");
    expect(chaosEngineeringText).toContain("kubectl apply --dry-run=server");
    const chaosEngineeringHtml = await fs.readFile(path.join(result.session.outputPaths.html, "chaos-engineering-readiness.html"), "utf8");
    expect(chaosEngineeringHtml).toContain("Chaos Engineering Readiness");
    expect(chaosEngineeringHtml).toContain("chaos-engineering-readiness-card");
    expect(chaosEngineeringHtml).toContain("data-source-pattern=\"Chaos Engineering\"");
    expect(chaosEngineeringHtml).toContain("Safety Signals");
    expect(chaosEngineeringHtml).toContain("Observability Signals");
    const chaosEngineeringMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "chaos-engineering-readiness.md"), "utf8");
    expect(chaosEngineeringMarkdown).toContain("# Chaos Engineering Readiness");
    expect(chaosEngineeringMarkdown).toContain("Source pattern: Chaos Mesh LitmusChaos Toxiproxy");
    expect(chaosEngineeringMarkdown).toContain("## Fault Signals");
    expect(chaosEngineeringMarkdown).toContain("## Safety Signals");
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
    const secretManagementText = await fs.readFile(path.join(result.session.outputPaths.analysis, "secret-management-readiness-report.json"), "utf8");
    expect(secretManagementText).toContain("Secrets management readiness Vault Infisical Doppler SOPS Sealed Secrets External Secrets secret engines auth methods policies tokens leases rotation transit kv env injection sync Kubernetes operator agent CLI SDK API audit logs dynamic secrets");
    expect(secretManagementText).toContain("\"secretManagementSetups\"");
    expect(secretManagementText).toContain("\"platformSignals\"");
    expect(secretManagementText).toContain("\"authSignals\"");
    expect(secretManagementText).toContain("\"storageSignals\"");
    expect(secretManagementText).toContain("\"deliverySignals\"");
    expect(secretManagementText).toContain("\"governanceSignals\"");
    expect(secretManagementText).toContain("\"packageSignals\"");
    const secretManagementHtml = await fs.readFile(path.join(result.session.outputPaths.html, "secret-management-readiness.html"), "utf8");
    expect(secretManagementHtml).toContain("Secret Management Readiness");
    expect(secretManagementHtml).toContain("secret-management-readiness-card");
    expect(secretManagementHtml).toContain("data-source-pattern=\"Secret Management\"");
    expect(secretManagementHtml).toContain("Governance Signals");
    const secretManagementMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "secret-management-readiness.md"), "utf8");
    expect(secretManagementMarkdown).toContain("# Secret Management Readiness");
    expect(secretManagementMarkdown).toContain("Source pattern: Secrets management readiness");
    expect(secretManagementMarkdown).toContain("## Delivery Signals");
    expect(secretManagementMarkdown).toContain("## Governance Signals");
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
    const coverageReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "coverage-readiness-report.json"), "utf8");
    expect(coverageReadinessText).toContain("nyc c8 Istanbul V8 coverage lcov cobertura coverage-final check-coverage thresholds Codecov OIDC flags");
    expect(coverageReadinessText).toContain("\"coverageSetups\"");
    expect(coverageReadinessText).toContain("\"instrumentationSignals\"");
    expect(coverageReadinessText).toContain("\"scopeSignals\"");
    expect(coverageReadinessText).toContain("\"thresholdSignals\"");
    expect(coverageReadinessText).toContain("\"reportSignals\"");
    expect(coverageReadinessText).toContain("\"ciUploadSignals\"");
    expect(coverageReadinessText).toContain("\"packageSignals\"");
    expect(coverageReadinessText).toContain("npx nyc --all");
    const coverageReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "coverage-readiness.html"), "utf8");
    expect(coverageReadinessHtml).toContain("Coverage Readiness");
    expect(coverageReadinessHtml).toContain("coverage-readiness-card");
    expect(coverageReadinessHtml).toContain("data-source-pattern=\"nyc\"");
    expect(coverageReadinessHtml).toContain("Coverage Setups");
    expect(coverageReadinessHtml).toContain("Threshold Signals");
    const coverageReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "coverage-readiness.md"), "utf8");
    expect(coverageReadinessMarkdown).toContain("# Coverage Readiness");
    expect(coverageReadinessMarkdown).toContain("Source pattern: nyc");
    expect(coverageReadinessMarkdown).toContain("## Instrumentation Signals");
    expect(coverageReadinessMarkdown).toContain("## CI Upload Signals");
    const mutationTestingText = await fs.readFile(path.join(result.session.outputPaths.analysis, "mutation-testing-readiness-report.json"), "utf8");
    expect(mutationTestingText).toContain("Stryker mutation testing mutate patterns mutators testRunner coverageAnalysis reporters thresholds mutationScore killed survived timeout ignored incremental dashboard HTML JSON mutation-testing-report-schema Infection MSI covered MSI with-uncovered");
    expect(mutationTestingText).toContain("\"mutationSetups\"");
    expect(mutationTestingText).toContain("\"toolSignals\"");
    expect(mutationTestingText).toContain("\"configSignals\"");
    expect(mutationTestingText).toContain("\"qualitySignals\"");
    expect(mutationTestingText).toContain("\"reporterSignals\"");
    expect(mutationTestingText).toContain("\"scopeSignals\"");
    expect(mutationTestingText).toContain("\"packageSignals\"");
    expect(mutationTestingText).toContain("npx stryker run");
    const mutationTestingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "mutation-testing-readiness.html"), "utf8");
    expect(mutationTestingHtml).toContain("Mutation Testing Readiness");
    expect(mutationTestingHtml).toContain("mutation-testing-readiness-card");
    expect(mutationTestingHtml).toContain("data-source-pattern=\"Stryker\"");
    expect(mutationTestingHtml).toContain("Mutation Setups");
    expect(mutationTestingHtml).toContain("Quality Signals");
    const mutationTestingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "mutation-testing-readiness.md"), "utf8");
    expect(mutationTestingMarkdown).toContain("# Mutation Testing Readiness");
    expect(mutationTestingMarkdown).toContain("Source pattern: Stryker");
    expect(mutationTestingMarkdown).toContain("## Mutation Setups");
    expect(mutationTestingMarkdown).toContain("## Reporter Signals");
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
    const authorizationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "authorization-readiness-report.json"), "utf8");
    expect(authorizationReadinessText).toContain("Authorization readiness OpenFGA Casbin CASL Oso RBAC ABAC ReBAC ACL relationship tuples policy model roles permissions resources actions guards middleware can checks deny by default ownership tenants organizations audit decision logs tests");
    expect(authorizationReadinessText).toContain("\"authorizationSetups\"");
    expect(authorizationReadinessText).toContain("\"modelSignals\"");
    expect(authorizationReadinessText).toContain("\"enforcementSignals\"");
    expect(authorizationReadinessText).toContain("\"identitySignals\"");
    expect(authorizationReadinessText).toContain("\"resourceSignals\"");
    expect(authorizationReadinessText).toContain("\"governanceSignals\"");
    expect(authorizationReadinessText).toContain("\"testSignals\"");
    expect(authorizationReadinessText).toContain("\"packageSignals\"");
    expect(authorizationReadinessText).toContain("npx vitest run");
    const authorizationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "authorization-readiness.html"), "utf8");
    expect(authorizationReadinessHtml).toContain("Authorization Readiness");
    expect(authorizationReadinessHtml).toContain("authorization-readiness-card");
    expect(authorizationReadinessHtml).toContain("data-source-pattern=\"OpenFGA\"");
    expect(authorizationReadinessHtml).toContain("Authorization Setups");
    expect(authorizationReadinessHtml).toContain("Enforcement Signals");
    const authorizationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "authorization-readiness.md"), "utf8");
    expect(authorizationReadinessMarkdown).toContain("# Authorization Readiness");
    expect(authorizationReadinessMarkdown).toContain("Source pattern: Authorization readiness");
    expect(authorizationReadinessMarkdown).toContain("## Model Signals");
    expect(authorizationReadinessMarkdown).toContain("## Governance Signals");
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
    const browserExtensionReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "browser-extension-readiness-report.json"), "utf8");
    expect(browserExtensionReadinessText).toContain("WXT Plasmo CRXJS Manifest V3 manifest.json background service_worker content_scripts permissions host_permissions web_accessible_resources chrome.runtime browser.runtime web-ext zip publish");
    expect(browserExtensionReadinessText).toContain("\"extensionSetups\"");
    expect(browserExtensionReadinessText).toContain("\"manifestSignals\"");
    expect(browserExtensionReadinessText).toContain("\"permissionSignals\"");
    expect(browserExtensionReadinessText).toContain("\"publishSignals\"");
    const browserExtensionReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "browser-extension-readiness.html"), "utf8");
    expect(browserExtensionReadinessHtml).toContain("Browser Extension Readiness");
    expect(browserExtensionReadinessHtml).toContain("browser-extension-readiness-card");
    expect(browserExtensionReadinessHtml).toContain("data-source-pattern=\"WXT\"");
    expect(browserExtensionReadinessHtml).toContain("Extension Setups");
    expect(browserExtensionReadinessHtml).toContain("Permission Signals");
    const browserExtensionReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "browser-extension-readiness.md"), "utf8");
    expect(browserExtensionReadinessMarkdown).toContain("# Browser Extension Readiness");
    expect(browserExtensionReadinessMarkdown).toContain("Source pattern: WXT");
    expect(browserExtensionReadinessMarkdown).toContain("## Entrypoint Signals");
    expect(browserExtensionReadinessMarkdown).toContain("## Publish Signals");
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
    const llmEvalReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-eval-readiness-report.json"), "utf8");
    expect(llmEvalReadinessText).toContain("LLM eval readiness promptfoo promptfooconfig providers prompts tests assert llm-rubric redteam plugins strategies OpenAI evals evals registry samples_jsonl modelgraded_spec completion_fns oaieval OpenEvals create_llm_as_judge createLLMAsJudge correctness hallucination feedbackKey score reference_outputs datasets reports");
    expect(llmEvalReadinessText).toContain("\"evalSetups\"");
    expect(llmEvalReadinessText).toContain("\"configSignals\"");
    expect(llmEvalReadinessText).toContain("\"promptSignals\"");
    expect(llmEvalReadinessText).toContain("\"providerSignals\"");
    expect(llmEvalReadinessText).toContain("\"testCaseSignals\"");
    expect(llmEvalReadinessText).toContain("\"judgeSignals\"");
    expect(llmEvalReadinessText).toContain("\"datasetSignals\"");
    expect(llmEvalReadinessText).toContain("\"redteamSignals\"");
    expect(llmEvalReadinessText).toContain("\"workflowSignals\"");
    expect(llmEvalReadinessText).toContain("\"packageSignals\"");
    const llmEvalReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "llm-eval-readiness.html"), "utf8");
    expect(llmEvalReadinessHtml).toContain("LLM Eval Readiness");
    expect(llmEvalReadinessHtml).toContain("llm-eval-readiness-card");
    expect(llmEvalReadinessHtml).toContain("data-source-pattern=\"LLM Eval\"");
    expect(llmEvalReadinessHtml).toContain("Eval Setups");
    expect(llmEvalReadinessHtml).toContain("Judge Signals");
    const llmEvalReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "llm-eval-readiness.md"), "utf8");
    expect(llmEvalReadinessMarkdown).toContain("# LLM Eval Readiness");
    expect(llmEvalReadinessMarkdown).toContain("Source pattern: LLM eval readiness");
    expect(llmEvalReadinessMarkdown).toContain("## Config Signals");
    expect(llmEvalReadinessMarkdown).toContain("## Red-Team Signals");
    const llmObservabilityReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-observability-readiness-report.json"), "utf8");
    expect(llmObservabilityReadinessText).toContain("LLM observability readiness Langfuse Phoenix Helicone traces spans observations generations sessions userId sessionId metadata release tags scores feedback annotations datasets experiments prompt versions playground OpenInference OpenTelemetry OTLP exporter token usage promptTokens completionTokens totalTokens cost latency model provider gateway baseURL Helicone headers rate limit retry fallback redaction telemetry opt-out");
    expect(llmObservabilityReadinessText).toContain("\"observabilitySetups\"");
    expect(llmObservabilityReadinessText).toContain("\"traceSignals\"");
    expect(llmObservabilityReadinessText).toContain("\"instrumentationSignals\"");
    expect(llmObservabilityReadinessText).toContain("\"identitySignals\"");
    expect(llmObservabilityReadinessText).toContain("\"llmMetricSignals\"");
    expect(llmObservabilityReadinessText).toContain("\"feedbackSignals\"");
    expect(llmObservabilityReadinessText).toContain("\"datasetExperimentSignals\"");
    expect(llmObservabilityReadinessText).toContain("\"gatewaySignals\"");
    expect(llmObservabilityReadinessText).toContain("\"privacySignals\"");
    expect(llmObservabilityReadinessText).toContain("\"workflowSignals\"");
    expect(llmObservabilityReadinessText).toContain("\"packageSignals\"");
    const llmObservabilityReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "llm-observability-readiness.html"), "utf8");
    expect(llmObservabilityReadinessHtml).toContain("LLM Observability Readiness");
    expect(llmObservabilityReadinessHtml).toContain("llm-observability-readiness-card");
    expect(llmObservabilityReadinessHtml).toContain("data-source-pattern=\"LLM Observability\"");
    expect(llmObservabilityReadinessHtml).toContain("Observability Setups");
    expect(llmObservabilityReadinessHtml).toContain("Gateway Signals");
    const llmObservabilityReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "llm-observability-readiness.md"), "utf8");
    expect(llmObservabilityReadinessMarkdown).toContain("# LLM Observability Readiness");
    expect(llmObservabilityReadinessMarkdown).toContain("Source pattern: LLM observability readiness");
    expect(llmObservabilityReadinessMarkdown).toContain("## Trace Signals");
    expect(llmObservabilityReadinessMarkdown).toContain("## Gateway Signals");
    const vectorDbReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8");
    expect(vectorDbReadinessText).toContain("Vector DB readiness Qdrant Weaviate Chroma collections classes schema vector config embeddings vectorizer distance dimensions HNSW payload metadata filters hybrid search BM25 sparse vectors upsert add query search nearest neighbors score limit snapshots backup restore sharding replication tenancy ttl clients endpoints API keys persistence");
    expect(vectorDbReadinessText).toContain("\"vectorSetups\"");
    expect(vectorDbReadinessText).toContain("\"collectionSignals\"");
    expect(vectorDbReadinessText).toContain("\"clientSignals\"");
    expect(vectorDbReadinessText).toContain("\"ingestionSignals\"");
    expect(vectorDbReadinessText).toContain("\"querySignals\"");
    expect(vectorDbReadinessText).toContain("\"embeddingSignals\"");
    expect(vectorDbReadinessText).toContain("\"indexSignals\"");
    expect(vectorDbReadinessText).toContain("\"opsSignals\"");
    expect(vectorDbReadinessText).toContain("\"packageSignals\"");
    const vectorDbReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "vector-db-readiness.html"), "utf8");
    expect(vectorDbReadinessHtml).toContain("Vector DB Readiness");
    expect(vectorDbReadinessHtml).toContain("vector-db-readiness-card");
    expect(vectorDbReadinessHtml).toContain("data-source-pattern=\"Vector DB\"");
    expect(vectorDbReadinessHtml).toContain("Vector Setups");
    expect(vectorDbReadinessHtml).toContain("Query Signals");
    const vectorDbReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "vector-db-readiness.md"), "utf8");
    expect(vectorDbReadinessMarkdown).toContain("# Vector DB Readiness");
    expect(vectorDbReadinessMarkdown).toContain("Source pattern: Vector DB readiness");
    expect(vectorDbReadinessMarkdown).toContain("## Collection Signals");
    expect(vectorDbReadinessMarkdown).toContain("## Ops Signals");
    const searchServiceReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "search-service-readiness-report.json"), "utf8");
    expect(searchServiceReadinessText).toContain("Search service readiness Meilisearch Typesense OpenSearch indexes collections schema mappings fields primary key settings documents add import bulk upsert batch search q query_by filter_by sort_by facet_by ranking rules typo tolerance synonyms stop words distinct geosearch hybrid semantic highlight crop pagination tasks health dumps snapshots aliases replicas cluster analytics API keys hosts nodes");
    expect(searchServiceReadinessText).toContain("\"searchSetups\"");
    expect(searchServiceReadinessText).toContain("\"indexSignals\"");
    expect(searchServiceReadinessText).toContain("\"ingestionSignals\"");
    expect(searchServiceReadinessText).toContain("\"querySignals\"");
    expect(searchServiceReadinessText).toContain("\"relevanceSignals\"");
    expect(searchServiceReadinessText).toContain("\"clientSignals\"");
    expect(searchServiceReadinessText).toContain("\"opsSignals\"");
    expect(searchServiceReadinessText).toContain("\"packageSignals\"");
    const searchServiceReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "search-service-readiness.html"), "utf8");
    expect(searchServiceReadinessHtml).toContain("Search Service Readiness");
    expect(searchServiceReadinessHtml).toContain("search-service-readiness-card");
    expect(searchServiceReadinessHtml).toContain("data-source-pattern=\"Search Service\"");
    expect(searchServiceReadinessHtml).toContain("Search Setups");
    expect(searchServiceReadinessHtml).toContain("Query Signals");
    const searchServiceReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "search-service-readiness.md"), "utf8");
    expect(searchServiceReadinessMarkdown).toContain("# Search Service Readiness");
    expect(searchServiceReadinessMarkdown).toContain("Source pattern: Search service readiness");
    expect(searchServiceReadinessMarkdown).toContain("## Index Signals");
    expect(searchServiceReadinessMarkdown).toContain("## Ops Signals");
    const objectStorageReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "object-storage-readiness-report.json"), "utf8");
    expect(objectStorageReadinessText).toContain("Object storage readiness S3 MinIO R2 Supabase Storage buckets regions endpoints path-style credentials PutObject GetObject ListObjects DeleteObject CopyObject multipart upload download metadata tags presigned URL signed URL policy ACL CORS RLS RBAC versioning lifecycle retention object lock replication checksum ETag SSE KMS encryption event notifications queues CDN cache health metrics backup restore migration");
    expect(objectStorageReadinessText).toContain("\"storageSetups\"");
    expect(objectStorageReadinessText).toContain("\"bucketSignals\"");
    expect(objectStorageReadinessText).toContain("\"clientSignals\"");
    expect(objectStorageReadinessText).toContain("\"objectSignals\"");
    expect(objectStorageReadinessText).toContain("\"accessSignals\"");
    expect(objectStorageReadinessText).toContain("\"reliabilitySignals\"");
    expect(objectStorageReadinessText).toContain("\"securitySignals\"");
    expect(objectStorageReadinessText).toContain("\"opsSignals\"");
    expect(objectStorageReadinessText).toContain("\"packageSignals\"");
    const objectStorageReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "object-storage-readiness.html"), "utf8");
    expect(objectStorageReadinessHtml).toContain("Object Storage Readiness");
    expect(objectStorageReadinessHtml).toContain("object-storage-readiness-card");
    expect(objectStorageReadinessHtml).toContain("data-source-pattern=\"Object Storage\"");
    expect(objectStorageReadinessHtml).toContain("Storage Setups");
    expect(objectStorageReadinessHtml).toContain("Object Signals");
    const objectStorageReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "object-storage-readiness.md"), "utf8");
    expect(objectStorageReadinessMarkdown).toContain("# Object Storage Readiness");
    expect(objectStorageReadinessMarkdown).toContain("Source pattern: Object storage readiness");
    expect(objectStorageReadinessMarkdown).toContain("## Bucket Signals");
    expect(objectStorageReadinessMarkdown).toContain("## Ops Signals");
    const realtimeCollaborationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "realtime-collaboration-readiness-report.json"), "utf8");
    expect(realtimeCollaborationReadinessText).toContain("Realtime collaboration readiness Yjs Y.Doc shared types WebsocketProvider awareness UndoManager encodeStateAsUpdate applyUpdate Automerge change merge sync save load conflicts heads patches Liveblocks LiveblocksProvider RoomProvider useOthers useMyPresence useMutation storage presence comments threads authEndpoint room permissions");
    expect(realtimeCollaborationReadinessText).toContain("\"collaborationSetups\"");
    expect(realtimeCollaborationReadinessText).toContain("\"crdtSignals\"");
    expect(realtimeCollaborationReadinessText).toContain("\"providerSignals\"");
    expect(realtimeCollaborationReadinessText).toContain("\"presenceSignals\"");
    expect(realtimeCollaborationReadinessText).toContain("\"syncSignals\"");
    expect(realtimeCollaborationReadinessText).toContain("\"persistenceSignals\"");
    expect(realtimeCollaborationReadinessText).toContain("\"historySignals\"");
    expect(realtimeCollaborationReadinessText).toContain("\"accessSignals\"");
    expect(realtimeCollaborationReadinessText).toContain("\"packageSignals\"");
    const realtimeCollaborationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "realtime-collaboration-readiness.html"), "utf8");
    expect(realtimeCollaborationReadinessHtml).toContain("Realtime Collaboration Readiness");
    expect(realtimeCollaborationReadinessHtml).toContain("realtime-collaboration-readiness-card");
    expect(realtimeCollaborationReadinessHtml).toContain("data-source-pattern=\"Realtime Collaboration\"");
    expect(realtimeCollaborationReadinessHtml).toContain("Collaboration Setups");
    expect(realtimeCollaborationReadinessHtml).toContain("Provider Signals");
    const realtimeCollaborationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "realtime-collaboration-readiness.md"), "utf8");
    expect(realtimeCollaborationReadinessMarkdown).toContain("# Realtime Collaboration Readiness");
    expect(realtimeCollaborationReadinessMarkdown).toContain("Source pattern: Realtime collaboration readiness");
    expect(realtimeCollaborationReadinessMarkdown).toContain("## CRDT Signals");
    expect(realtimeCollaborationReadinessMarkdown).toContain("## Sync Signals");
    const workflowOrchestrationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "workflow-orchestration-readiness-report.json"), "utf8");
    expect(workflowOrchestrationReadinessText).toContain("Workflow orchestration readiness Temporal workflows activities Worker taskQueue schedules signals queries retry timeout heartbeat continueAsNew Inngest createFunction events cron step.run step.sleep waitForEvent invoke cancelOn concurrency throttle debounce rate limit Trigger.dev task schemaTask schedules cron wait queue retry maxDuration idempotency metadata logger deploy runs");
    expect(workflowOrchestrationReadinessText).toContain("\"workflowSetups\"");
    expect(workflowOrchestrationReadinessText).toContain("\"triggerSignals\"");
    expect(workflowOrchestrationReadinessText).toContain("\"executionSignals\"");
    expect(workflowOrchestrationReadinessText).toContain("\"durabilitySignals\"");
    expect(workflowOrchestrationReadinessText).toContain("\"flowSignals\"");
    expect(workflowOrchestrationReadinessText).toContain("\"runtimeSignals\"");
    expect(workflowOrchestrationReadinessText).toContain("\"observabilitySignals\"");
    expect(workflowOrchestrationReadinessText).toContain("\"packageSignals\"");
    const workflowOrchestrationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "workflow-orchestration-readiness.html"), "utf8");
    expect(workflowOrchestrationReadinessHtml).toContain("Workflow Orchestration Readiness");
    expect(workflowOrchestrationReadinessHtml).toContain("workflow-orchestration-readiness-card");
    expect(workflowOrchestrationReadinessHtml).toContain("data-source-pattern=\"Workflow Orchestration\"");
    expect(workflowOrchestrationReadinessHtml).toContain("Workflow Setups");
    expect(workflowOrchestrationReadinessHtml).toContain("Durability Signals");
    const workflowOrchestrationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "workflow-orchestration-readiness.md"), "utf8");
    expect(workflowOrchestrationReadinessMarkdown).toContain("# Workflow Orchestration Readiness");
    expect(workflowOrchestrationReadinessMarkdown).toContain("Source pattern: Workflow orchestration readiness");
    expect(workflowOrchestrationReadinessMarkdown).toContain("## Execution Signals");
    expect(workflowOrchestrationReadinessMarkdown).toContain("## Flow Signals");
    const openApiClientReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "openapi-client-readiness-report.json"), "utf8");
    expect(openApiClientReadinessText).toContain("OpenAPI client readiness openapi-typescript openapi-fetch Orval OpenAPI Generator input spec output schemas client hooks mocks MSW zod mutator axios fetch react-query SWR Angular Vue Svelte Hono MCP generatorName config validate lint snapshots generated diff typecheck templates");
    expect(openApiClientReadinessText).toContain("\"clientSetups\"");
    expect(openApiClientReadinessText).toContain("\"specSignals\"");
    expect(openApiClientReadinessText).toContain("\"generatorSignals\"");
    expect(openApiClientReadinessText).toContain("\"outputSignals\"");
    expect(openApiClientReadinessText).toContain("\"runtimeSignals\"");
    expect(openApiClientReadinessText).toContain("\"qualitySignals\"");
    expect(openApiClientReadinessText).toContain("\"packageSignals\"");
    const openApiClientReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "openapi-client-readiness.html"), "utf8");
    expect(openApiClientReadinessHtml).toContain("OpenAPI Client Readiness");
    expect(openApiClientReadinessHtml).toContain("openapi-client-readiness-card");
    expect(openApiClientReadinessHtml).toContain("data-source-pattern=\"OpenAPI Client\"");
    expect(openApiClientReadinessHtml).toContain("Quality Signals");
    const openApiClientReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "openapi-client-readiness.md"), "utf8");
    expect(openApiClientReadinessMarkdown).toContain("# OpenAPI Client Readiness");
    expect(openApiClientReadinessMarkdown).toContain("Source pattern: OpenAPI client readiness");
    expect(openApiClientReadinessMarkdown).toContain("## Generator Signals");
    expect(openApiClientReadinessMarkdown).toContain("## Quality Signals");
    const webhookReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "webhook-readiness-report.json"), "utf8");
    expect(webhookReadinessText).toContain("Webhook readiness Svix Standard Webhooks Hookdeck signature webhook-id webhook-timestamp webhook-signature HMAC ed25519 replay idempotency event types endpoints retry attempts delivery logs replay fan-out filtering source destination localhost CLI MCP failures metrics SSRF");
    expect(webhookReadinessText).toContain("\"webhookSetups\"");
    expect(webhookReadinessText).toContain("\"endpointSignals\"");
    expect(webhookReadinessText).toContain("\"signatureSignals\"");
    expect(webhookReadinessText).toContain("\"reliabilitySignals\"");
    expect(webhookReadinessText).toContain("\"operationsSignals\"");
    expect(webhookReadinessText).toContain("\"packageSignals\"");
    const webhookReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "webhook-readiness.html"), "utf8");
    expect(webhookReadinessHtml).toContain("Webhook Readiness");
    expect(webhookReadinessHtml).toContain("webhook-readiness-card");
    expect(webhookReadinessHtml).toContain("data-source-pattern=\"Webhook\"");
    expect(webhookReadinessHtml).toContain("Signature Signals");
    const webhookReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "webhook-readiness.md"), "utf8");
    expect(webhookReadinessMarkdown).toContain("# Webhook Readiness");
    expect(webhookReadinessMarkdown).toContain("Source pattern: Webhook readiness");
    expect(webhookReadinessMarkdown).toContain("## Signature Signals");
    expect(webhookReadinessMarkdown).toContain("## Reliability Signals");
    const notificationReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "notification-readiness-report.json"), "utf8");
    expect(notificationReadinessText).toContain("Notification readiness Novu workflows trigger subscriberId subscribers topics subscriptions preferences Inbox email SMS push chat Slack Teams Telegram WhatsApp digest delay conditions payload tenant templates variables API key delivery logs retries dashboard analytics");
    expect(notificationReadinessText).toContain("\"notificationSetups\"");
    expect(notificationReadinessText).toContain("\"workflowSignals\"");
    expect(notificationReadinessText).toContain("\"audienceSignals\"");
    expect(notificationReadinessText).toContain("\"channelSignals\"");
    expect(notificationReadinessText).toContain("\"templateSignals\"");
    expect(notificationReadinessText).toContain("\"operationsSignals\"");
    expect(notificationReadinessText).toContain("\"packageSignals\"");
    const notificationReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "notification-readiness.html"), "utf8");
    expect(notificationReadinessHtml).toContain("Notification Readiness");
    expect(notificationReadinessHtml).toContain("notification-readiness-card");
    expect(notificationReadinessHtml).toContain("data-source-pattern=\"Notifications\"");
    expect(notificationReadinessHtml).toContain("Audience Signals");
    const notificationReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "notification-readiness.md"), "utf8");
    expect(notificationReadinessMarkdown).toContain("# Notification Readiness");
    expect(notificationReadinessMarkdown).toContain("Source pattern: Notification readiness");
    expect(notificationReadinessMarkdown).toContain("## Audience Signals");
    expect(notificationReadinessMarkdown).toContain("## Channel Signals");
    const consentReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "consent-readiness-report.json"), "utf8");
    expect(consentReadinessText).toContain("Consent readiness CookieConsent Klaro IAB TCF CMP banner modal categories services purposes vendors accept all accept selected reject all withdraw privacy policy data-src text/plain data-type data-name autoclear cookies localStorage revision translations __tcfapi TCString cmpId GVL purposeConsents vendorConsents legitimateInterests");
    expect(consentReadinessText).toContain("\"consentSetups\"");
    expect(consentReadinessText).toContain("\"bannerSignals\"");
    expect(consentReadinessText).toContain("\"categorySignals\"");
    expect(consentReadinessText).toContain("\"scriptSignals\"");
    expect(consentReadinessText).toContain("\"privacySignals\"");
    expect(consentReadinessText).toContain("\"tcfSignals\"");
    expect(consentReadinessText).toContain("\"packageSignals\"");
    const consentReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "consent-readiness.html"), "utf8");
    expect(consentReadinessHtml).toContain("Consent Readiness");
    expect(consentReadinessHtml).toContain("consent-readiness-card");
    expect(consentReadinessHtml).toContain("data-source-pattern=\"Consent\"");
    expect(consentReadinessHtml).toContain("TCF Signals");
    const consentReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "consent-readiness.md"), "utf8");
    expect(consentReadinessMarkdown).toContain("# Consent Readiness");
    expect(consentReadinessMarkdown).toContain("Source pattern: Consent readiness");
    expect(consentReadinessMarkdown).toContain("## Script Signals");
    expect(consentReadinessMarkdown).toContain("## TCF Signals");
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
    const desktopReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "desktop-readiness-report.json"), "utf8");
    expect(desktopReadinessText).toContain("Tauri tauri.conf.json capabilities permissions bundle updater createUpdaterArtifacts signing notarization Electron electron-builder electron-forge autoUpdater Wails wails.json wails build desktop app packaging");
    expect(desktopReadinessText).toContain("\"desktopSetups\"");
    expect(desktopReadinessText).toContain("\"permissionSignals\"");
    expect(desktopReadinessText).toContain("\"releaseSignals\"");
    const desktopReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "desktop-readiness.html"), "utf8");
    expect(desktopReadinessHtml).toContain("Desktop Readiness");
    expect(desktopReadinessHtml).toContain("desktop-readiness-card");
    expect(desktopReadinessHtml).toContain("data-source-pattern=\"Tauri\"");
    const desktopReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "desktop-readiness.md"), "utf8");
    expect(desktopReadinessMarkdown).toContain("# Desktop Readiness");
    expect(desktopReadinessMarkdown).toContain("Source pattern: Tauri");
    expect(desktopReadinessMarkdown).toContain("## Permission Signals");
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
    const backupReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "backup-readiness-report.json"), "utf8");
    expect(backupReadinessText).toContain("Backup readiness Velero Backup Schedule Restore");
    expect(backupReadinessText).toContain("\"backupSetups\"");
    expect(backupReadinessText).toContain("\"restoreDrillSignals\"");
    expect(backupReadinessText).toContain("\"resticSignals\"");
    const backupReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "backup-readiness.html"), "utf8");
    expect(backupReadinessHtml).toContain("Backup Readiness");
    expect(backupReadinessHtml).toContain("backup-readiness-card");
    expect(backupReadinessHtml).toContain("data-source-pattern=\"Backup\"");
    const backupReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "backup-readiness.md"), "utf8");
    expect(backupReadinessMarkdown).toContain("# Backup Readiness");
    expect(backupReadinessMarkdown).toContain("Source pattern: Backup readiness");
    expect(backupReadinessMarkdown).toContain("## Restore Drill Signals");
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
    expect(exportManifestText).toContain("html/code-metrics-readiness.html");
    expect(exportManifestText).toContain("html/code-ownership-readiness.html");
    expect(exportManifestText).toContain("html/large-asset-readiness.html");
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
    expect(exportManifestText).toContain("html/load-testing-readiness.html");
    expect(exportManifestText).toContain("html/e2e.html");
    expect(exportManifestText).toContain("html/integration-test-environment-readiness.html");
    expect(exportManifestText).toContain("html/chaos-engineering-readiness.html");
    expect(exportManifestText).toContain("html/accessibility.html");
    expect(exportManifestText).toContain("html/storybook.html");
    expect(exportManifestText).toContain("html/design-tokens.html");
    expect(exportManifestText).toContain("html/i18n.html");
    expect(exportManifestText).toContain("html/release-readiness.html");
    expect(exportManifestText).toContain("html/secret-readiness.html");
    expect(exportManifestText).toContain("html/secret-management-readiness.html");
    expect(exportManifestText).toContain("html/container-readiness.html");
    expect(exportManifestText).toContain("html/code-quality.html");
    expect(exportManifestText).toContain("html/documentation.html");
    expect(exportManifestText).toContain("html/database-readiness.html");
    expect(exportManifestText).toContain("html/ci-cd.html");
    expect(exportManifestText).toContain("html/unit-tests.html");
    expect(exportManifestText).toContain("html/coverage-readiness.html");
    expect(exportManifestText).toContain("html/mutation-testing-readiness.html");
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
    expect(exportManifestText).toContain("html/authorization-readiness.html");
    expect(exportManifestText).toContain("html/payment-readiness.html");
    expect(exportManifestText).toContain("html/email-readiness.html");
    expect(exportManifestText).toContain("html/queue-readiness.html");
    expect(exportManifestText).toContain("html/cache-readiness.html");
    expect(exportManifestText).toContain("html/logging-readiness.html");
    expect(exportManifestText).toContain("html/feature-flag-readiness.html");
    expect(exportManifestText).toContain("html/rate-limit-readiness.html");
    expect(exportManifestText).toContain("html/error-tracking-readiness.html");
    expect(exportManifestText).toContain("html/desktop-readiness.html");
    expect(exportManifestText).toContain("html/edge-readiness.html");
    expect(exportManifestText).toContain("html/compose-readiness.html");
    expect(exportManifestText).toContain("html/devcontainer-readiness.html");
    expect(exportManifestText).toContain("html/kubernetes-readiness.html");
    expect(exportManifestText).toContain("html/gitops-readiness.html");
    expect(exportManifestText).toContain("html/backup-readiness.html");
    expect(exportManifestText).toContain("html/llm-eval-readiness.html");
    expect(exportManifestText).toContain("html/llm-observability-readiness.html");
    expect(exportManifestText).toContain("html/vector-db-readiness.html");
    expect(exportManifestText).toContain("html/search-service-readiness.html");
    expect(exportManifestText).toContain("html/object-storage-readiness.html");
    expect(exportManifestText).toContain("html/realtime-collaboration-readiness.html");
    expect(exportManifestText).toContain("html/workflow-orchestration-readiness.html");
    expect(exportManifestText).toContain("html/openapi-client-readiness.html");
    expect(exportManifestText).toContain("html/webhook-readiness.html");
    expect(exportManifestText).toContain("html/notification-readiness.html");
    expect(exportManifestText).toContain("html/consent-readiness.html");
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
    expect(learningPathHtml).toContain("code-metrics-readiness.html");
    expect(learningPathHtml).toContain("code-ownership-readiness.html");
    expect(learningPathHtml).toContain("large-asset-readiness.html");
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
    expect(learningPathHtml).toContain("load-testing-readiness.html");
    expect(learningPathHtml).toContain("e2e.html");
    expect(learningPathHtml).toContain("integration-test-environment-readiness.html");
    expect(learningPathHtml).toContain("chaos-engineering-readiness.html");
    expect(learningPathHtml).toContain("accessibility.html");
    expect(learningPathHtml).toContain("storybook.html");
    expect(learningPathHtml).toContain("design-tokens.html");
    expect(learningPathHtml).toContain("i18n.html");
    expect(learningPathHtml).toContain("release-readiness.html");
    expect(learningPathHtml).toContain("secret-readiness.html");
    expect(learningPathHtml).toContain("secret-management-readiness.html");
    expect(learningPathHtml).toContain("container-readiness.html");
    expect(learningPathHtml).toContain("code-quality.html");
    expect(learningPathHtml).toContain("documentation.html");
    expect(learningPathHtml).toContain("database-readiness.html");
    expect(learningPathHtml).toContain("ci-cd.html");
    expect(learningPathHtml).toContain("unit-tests.html");
    expect(learningPathHtml).toContain("coverage-readiness.html");
    expect(learningPathHtml).toContain("mutation-testing-readiness.html");
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
    expect(learningPathHtml).toContain("authorization-readiness.html");
    expect(learningPathHtml).toContain("payment-readiness.html");
    expect(learningPathHtml).toContain("email-readiness.html");
    expect(learningPathHtml).toContain("queue-readiness.html");
    expect(learningPathHtml).toContain("cache-readiness.html");
    expect(learningPathHtml).toContain("logging-readiness.html");
    expect(learningPathHtml).toContain("feature-flag-readiness.html");
    expect(learningPathHtml).toContain("rate-limit-readiness.html");
    expect(learningPathHtml).toContain("error-tracking-readiness.html");
    expect(learningPathHtml).toContain("desktop-readiness.html");
    expect(learningPathHtml).toContain("llm-eval-readiness.html");
    expect(learningPathHtml).toContain("llm-observability-readiness.html");
    expect(learningPathHtml).toContain("vector-db-readiness.html");
    expect(learningPathHtml).toContain("search-service-readiness.html");
    expect(learningPathHtml).toContain("object-storage-readiness.html");
    expect(learningPathHtml).toContain("realtime-collaboration-readiness.html");
    expect(learningPathHtml).toContain("workflow-orchestration-readiness.html");
    expect(learningPathHtml).toContain("openapi-client-readiness.html");
    expect(learningPathHtml).toContain("webhook-readiness.html");
    expect(learningPathHtml).toContain("notification-readiness.html");
    expect(learningPathHtml).toContain("consent-readiness.html");
    expect(learningPathHtml).toContain("backup-readiness.html");
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

  it("detects CODEOWNERS readiness patterns without contacting GitHub", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-codeowners-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-codeowners-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "rulesets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "packages", "api"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, ".github", "CODEOWNERS"), [
      "* @acme/platform",
      "/src/ @acme/app-team @octocat app@example.com",
      "/tests/ @acme/qa",
      "/packages/api/ @acme/api",
      "/.github/ @acme/security",
      "/.github/CODEOWNERS @acme/security",
      "/docs/ @acme/docs",
      "/src/ @acme/override"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "codeowners.yml"), [
      "name: codeowners",
      "on: [pull_request]",
      "jobs:",
      "  validate:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: mszostok/codeowners-validator@v0.7.4",
      "        with:",
      "          checks: files,owners,duppatterns,syntax",
      "          experimental_checks: notowned",
      "          owner_checker_owners_must_be_teams: true",
      "          owner_checker_allow_unowned_patterns: false",
      "          not_owned_checker_skip_patterns: docs/generated/**",
      "          github_access_token: ${{ secrets.GITHUB_TOKEN }}",
      "          repository_path: ${{ github.workspace }}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "rulesets", "main.json"), JSON.stringify({
      name: "main",
      target: "branch",
      enforcement: "active",
      rulesets: true,
      branchProtection: {
        required_approving_review_count: 2,
        requireCodeOwnerReview: "Require review from Code Owners",
        dismissStaleReviews: "dismiss stale reviews"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# CODEOWNERS fixture",
      "",
      "GitHub automatically requested code owners for review on pull request review flows.",
      "The last matching rule wins, so rule order matters for CODEOWNERS.",
      "Fork base branch behavior and draft pull request ready for review behavior are documented before enabling required code owner review.",
      "Use the codeowners/errors API to inspect CODEOWNERS API parsing errors.",
      "Paths are case-sensitive and must be cased correctly.",
      "The hmarr/codeowners parser can help inspect local ownership matches."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        owners: "codeowners --help",
        "owners:validate": "codeowners-validator --checks files,owners,duppatterns,syntax"
      },
      devDependencies: {
        "hmarr/codeowners": "^1.2.0",
        "codeowners-validator": "^0.7.4"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "app.ts"), "export const app = true;\n");
    await fs.writeFile(path.join(sourceRoot, "tests", "app.test.ts"), "export const covered = true;\n");
    await fs.writeFile(path.join(sourceRoot, "packages", "api", "index.ts"), "export const api = true;\n");
    await fs.writeFile(path.join(sourceRoot, "docs", "guide.md"), "# Guide\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.codeOwnershipReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const codeownersFile = report.codeownerFiles[0];

    expect(codeownersFile?.location).toBe("github");
    expect(codeownersFile?.ruleCount).toBeGreaterThanOrEqual(7);
    expect(codeownersFile?.teamOwnerCount).toBeGreaterThan(0);
    expect(codeownersFile?.userOwnerCount).toBeGreaterThan(0);
    expect(codeownersFile?.emailOwnerCount).toBeGreaterThan(0);
    expect(codeownersFile?.duplicatePatternCount).toBeGreaterThan(0);
    expect(codeownersFile?.selfOwnershipCount).toBeGreaterThan(0);
    expect(readySignals(report.ownershipSignals)).toEqual(expect.arrayContaining(["codeowners-file", "standard-location", "pattern-rules", "last-match-wins", "team-owner", "user-owner", "email-owner", "self-owned-codeowners"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["syntax-check", "owner-check", "file-exists-check", "duplicate-pattern-check", "not-owned-check", "github-action", "api-errors"]));
    expect(readySignals(report.reviewSignals)).toEqual(expect.arrayContaining(["auto-review-request", "required-code-owner-review", "branch-protection", "rulesets", "dismiss-stale-review", "required-approving-review", "fork-base-branch", "draft-pr"]));
    expect(readySignals(report.coverageSignals)).toEqual(expect.arrayContaining(["root-default", "docs", "src", "tests", "github-directory", "packages", "unowned-allowed", "case-sensitive-paths"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["hmarr/codeowners", "codeowners-validator", "github-codeowners-api", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-ownership-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-ownership-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-ownership-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects code metrics readiness patterns without running metric tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-code-metrics-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-code-metrics-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Code metrics fixture",
      "",
      "Use scc --by-file --wide --format json . and scc --hotspots --format json .",
      "Use lizard -l javascript -l typescript -l python . and tokei --output json .",
      "Use cloc --json . for a second LOC comparison and scc --by-file --wide --format html --report . for an HTML report.",
      "The team reviews function length and parameter count thresholds alongside cognitive complexity.",
      "COCOMO and LOCOMO reports are reviewed as estimates."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "metrics:scc": "scc --by-file --wide --format json .",
        "metrics:hotspots": "scc --hotspots --format json .",
        "metrics:lizard": "lizard -l typescript --CCN 8 .",
        "metrics:tokei": "tokei --output json .",
        "metrics:cloc": "cloc --json .",
        "metrics:html": "scc --by-file --wide --format html --report ."
      },
      devDependencies: {
        "complexity-report": "^1.0.0",
        eslint: "^9.0.0"
      },
      eslintConfig: {
        rules: {
          complexity: ["error", 8],
          "sonarjs/cognitive-complexity": ["warn", 10],
          "max-params": ["warn", 4],
          "max-lines-per-function": ["warn", 80]
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".sccignore"), "dist\ncoverage\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "metrics.yml"), [
      "name: metrics",
      "on: [pull_request]",
      "jobs:",
      "  metrics:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: scc --by-file --wide --format json .",
      "      - run: scc --hotspots --format csv .",
      "      - run: scc --by-file --wide --format html --report .",
      "      - run: lizard --CCN 8 src",
      "      - run: tokei --output json .",
      "      - run: cloc --json .",
      "      - run: echo openmetrics threshold baseline diff-check hotspot report"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "complex.ts"), [
      "// Keep comment lines visible for scc-style reports.",
      "",
      "export function complex(value: number) {",
      "  if (value > 10) {",
      "    for (let index = 0; index < value; index += 1) {",
      "      if (index % 2 === 0 && value !== 13) {",
      "        while (value > index) { break; }",
      "      } else if (index === 3 || value === 4) {",
      "        switch (index) { case 1: return value; default: break; }",
      "      }",
      "    }",
      "  }",
      "  return value > 0 ? value : 0;",
      "}",
      "export const arrow = (flag: boolean) => flag ? complex(12) : 0;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "small.py"), [
      "def helper(value):",
      "    if value:",
      "        return value",
      "    return 0"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const reportText = await fs.readFile(path.join(result.session.outputPaths.analysis, "code-metrics-readiness-report.json"), "utf8");
    const report = JSON.parse(reportText) as {
      totals: { codeLines: number; commentLines: number; blankLines: number; branchCount: number };
      languageMetrics: Array<{ language: string; codeLines: number }>;
      hotspots: Array<{ filePath: string; branchCount: number; functionCount: number; readingPriority: string }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      metricSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
    };
    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };

    expect(report.totals.codeLines).toBeGreaterThan(0);
    expect(report.totals.commentLines).toBeGreaterThan(0);
    expect(report.totals.blankLines).toBeGreaterThan(0);
    expect(report.totals.branchCount).toBeGreaterThan(0);
    expect(report.languageMetrics.some((item) => item.language === "TypeScript" && item.codeLines > 0)).toBe(true);
    const complex = report.hotspots.find((item) => item.filePath === "src/complex.ts");
    expect(complex?.branchCount).toBeGreaterThan(0);
    expect(complex?.functionCount).toBeGreaterThan(0);
    expect(complex?.readingPriority).toBe("high");
    expectReady(report.toolSignals, ["scc", "lizard", "tokei", "cloc", "eslint-complexity", "complexity-report", "cocomo", "locomo"]);
    expectReady(report.metricSignals, ["loc", "blank-lines", "comment-lines", "code-lines", "cognitive", "function-length", "parameter-count"]);
    expect(report.metricSignals.some((item) => item.signal === "cyclomatic" && item.readiness === "partial")).toBe(true);
    expect(report.metricSignals.some((item) => item.signal === "function-count" && item.readiness === "partial")).toBe(true);
    expect(report.metricSignals.some((item) => item.signal === "hotspots" && item.readiness === "partial")).toBe(true);
    expectReady(report.workflowSignals, ["json-output", "csv-output", "html-report", "openmetrics", "threshold", "ci-complexity", "baseline", "diff-check", "ignore-file", "hotspot-report"]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-metrics-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-metrics-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-metrics-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects large asset readiness patterns without running Git LFS or DVC", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-large-asset-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-large-asset-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".dvc"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "data"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "scripts"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, ".gitattributes"), [
      "*.psd filter=lfs diff=lfs merge=lfs -text lockable",
      "*.zip filter=lfs diff=lfs merge=lfs -text",
      "models/*.onnx filter=lfs diff=lfs merge=lfs -text"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "models", "model-lfs-pointer.txt"), [
      "version https://git-lfs.github.com/spec/v1",
      "oid sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "size 123456"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".dvc", "config"), [
      "[core]",
      "    remote = storage",
      "['remote \"storage\"']",
      "    url = s3://repotutor-fixture-bucket/path",
      "[cache]",
      "    dir = .dvc/cache"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".dvcignore"), "tmp/**\n");
    await fs.writeFile(path.join(sourceRoot, "dvc.yaml"), [
      "stages:",
      "  featurize:",
      "    cmd: python scripts/featurize.py",
      "    deps:",
      "      - data/raw",
      "      - scripts/featurize.py",
      "    outs:",
      "      - data/features",
      "    metrics:",
      "      - metrics.json",
      "    params:",
      "      - train.epochs"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "dvc.lock"), [
      "schema: '2.0'",
      "stages:",
      "  featurize:",
      "    cmd: python scripts/featurize.py",
      "    deps:",
      "      - path: data/raw",
      "        md5: abc123",
      "    outs:",
      "      - path: data/features",
      "        md5: def456"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "data", "raw.dvc"), [
      "outs:",
      "- path: data/raw",
      "  md5: abc123",
      "  size: 123"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".gitmodules"), [
      "[submodule \"assets/vendor\"]",
      "  path = assets/vendor",
      "  url = https://example.com/vendor-assets.git"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "assets.yml"), [
      "name: assets",
      "on: [push]",
      "jobs:",
      "  assets:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "        with:",
      "          lfs: true",
      "          submodules: recursive",
      "      - uses: actions/cache@v4",
      "        with:",
      "          path: .dvc/cache",
      "          key: dvc-cache",
      "      - run: git lfs pull && git lfs status --json && git lfs fsck --pointers HEAD",
      "      - run: dvc doctor && dvc status && dvc pull && dvc repro && dvc push"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "scripts", "assets.sh"), [
      "git lfs install --local --skip-smudge",
      "git lfs track \"*.psd\"",
      "git lfs fetch",
      "git lfs push origin main",
      "git lfs migrate info --everything --pointers=ignore --top=100",
      "git lfs prune",
      "git lfs locks",
      "git submodule update --init --recursive",
      "dvc status",
      "dvc pull",
      "dvc push",
      "dvc repro"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Large asset fixture",
      "",
      "Git LFS patterns are case-sensitive; use bracketed case patterns when needed.",
      "Contributors run git lfs pull, git lfs locks, and dvc pull before model work.",
      "DVC remote storage uses dvc-s3 and the default remote configured in .dvc/config."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "assets:lfs": "git lfs status --json && git lfs fsck --pointers HEAD",
        "assets:dvc": "dvc status && dvc repro && dvc push"
      },
      devDependencies: {
        "git-lfs": "^3.0.0",
        dvc: "^3.0.0",
        "dvc-s3": "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "scripts", "featurize.py"), "print('feature fixture')\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.largeAssetReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const attributesSetup = report.assetSetups.find((item) => item.filePath === ".gitattributes");
    const dvcConfigSetup = report.assetSetups.find((item) => item.filePath === ".dvc/config");
    const dvcYamlSetup = report.assetSetups.find((item) => item.filePath === "dvc.yaml");
    const submoduleSetup = report.assetSetups.find((item) => item.filePath === ".gitmodules");

    expect(report.assetSetups.length).toBeGreaterThan(0);
    expect(attributesSetup?.tool).toBe("git-lfs");
    expect(attributesSetup?.patternCount).toBeGreaterThan(0);
    expect(attributesSetup?.lockableCount).toBeGreaterThan(0);
    expect(dvcConfigSetup?.tool).toBe("dvc");
    expect(dvcConfigSetup?.remoteCount).toBeGreaterThan(0);
    expect(dvcConfigSetup?.cacheCount).toBeGreaterThan(0);
    expect(dvcYamlSetup?.outCount).toBeGreaterThan(0);
    expect(dvcYamlSetup?.depCount).toBeGreaterThan(0);
    expect(dvcYamlSetup?.metricCount).toBeGreaterThan(0);
    expect(submoduleSetup?.tool).toBe("git-submodule");
    expect(readySignals(report.lfsSignals)).toEqual(expect.arrayContaining(["gitattributes", "filter-lfs", "diff-merge-lfs", "pointer-file", "oid-sha256", "track-command", "install-command", "status-command", "pull-push-fetch", "fsck", "migrate", "prune", "lockable", "locks", "skip-smudge", "case-sensitive-patterns"]));
    expect(readySignals(report.dvcSignals)).toEqual(expect.arrayContaining(["dvc-yaml", "dvc-lock", "dvc-file", "outs", "deps", "metrics", "params", "remote-config", "default-remote", "cache", "push", "pull", "status", "repro", "dvcignore", "optional-remote-deps"]));
    expect(readySignals(report.submoduleSignals)).toEqual(expect.arrayContaining(["gitmodules", "submodule-url", "submodule-path", "recursive-clone"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["ci-fetch", "ci-pull", "ci-push", "artifact-cache", "checkout-lfs", "dvc-repro", "dvc-doctor"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["git-lfs", "dvc", "dvc-s3", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "large-asset-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "large-asset-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "large-asset-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects integration test environment readiness without starting containers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-integration-env-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-integration-env-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests", "integration"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest run",
        "test:integration": "vitest run tests/integration --runInBand"
      },
      devDependencies: {
        testcontainers: "^12.0.0",
        "@testcontainers/postgresql": "^12.0.0",
        vitest: "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "tests", "integration", "postgres.test.ts"), [
      "import { afterAll, beforeAll, describe, expect, it } from \"vitest\";",
      "import { GenericContainer, Wait, type StartedTestContainer } from \"testcontainers\";",
      "import { PostgreSqlContainer } from \"@testcontainers/postgresql\";",
      "",
      "let redis: StartedTestContainer;",
      "let postgres: StartedTestContainer;",
      "",
      "beforeAll(async () => {",
      "  redis = await new GenericContainer(\"redis:8\")",
      "    .withExposedPorts(6379)",
      "    .withEnvironment({ ALLOW_EMPTY_PASSWORD: \"yes\" })",
      "    .withWaitStrategy(Wait.forAll([Wait.forListeningPorts(), Wait.forLogMessage(\"Ready to accept connections\")]))",
      "    .withStartupTimeout(120_000)",
      "    .start();",
      "  postgres = await new PostgreSqlContainer(\"postgres:16\")",
      "    .withDatabase(\"app_test\")",
      "    .withUsername(\"app\")",
      "    .withPassword(\"secret\")",
      "    .start();",
      "});",
      "",
      "afterAll(async () => {",
      "  await postgres.stop();",
      "  await redis.stop();",
      "});",
      "",
      "describe(\"integration env\", () => {",
      "  it(\"uses started services\", () => expect(redis.getMappedPort(6379)).toBeGreaterThan(0));",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"integration-env-fixture\"",
      "dependencies = [\"testcontainers[postgres]\", \"pytest\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "conftest.py"), [
      "import pytest",
      "from testcontainers.postgres import PostgresContainer",
      "from testcontainers.core.waiting_utils import wait_for_logs, wait_for_http",
      "",
      "@pytest.fixture(scope=\"session\")",
      "def postgres_container():",
      "    container = PostgresContainer(\"postgres:16\")",
      "    container.with_exposed_ports(5432)",
      "    container.with_env(\"POSTGRES_DB\", \"app_test\")",
      "    container.start()",
      "    wait_for_logs(container, \"database system is ready to accept connections\")",
      "    wait_for_http(\"/health\", port=8080)",
      "    try:",
      "        yield container",
      "    finally:",
      "        container.stop()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "integration.yml"), [
      "name: integration",
      "on: [push]",
      "jobs:",
      "  integration:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      DOCKER_HOST: unix:///var/run/docker.sock",
      "      TESTCONTAINERS_RYUK_DISABLED: \"false\"",
      "      TESTCONTAINERS_TIMEOUT: \"120\"",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: docker compose version",
      "      - run: npm run test:integration"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "testcontainers.properties"), "testcontainers.reuse.enable=false\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.integrationTestEnvironmentReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const nodeSetup = report.integrationSetups.find((item) => item.filePath.endsWith("postgres.test.ts"));
    const pythonSetup = report.integrationSetups.find((item) => item.filePath.endsWith("conftest.py"));

    expect(report.integrationSetups.length).toBeGreaterThan(0);
    expect(nodeSetup?.ecosystem).toBe("testcontainers-node");
    expect(nodeSetup?.containerCount).toBeGreaterThan(0);
    expect(nodeSetup?.hasWaitStrategy).toBe(true);
    expect(nodeSetup?.hasLifecycleCleanup).toBe(true);
    expect(pythonSetup?.ecosystem).toBe("testcontainers-python");
    expect(pythonSetup?.hasLifecycleCleanup).toBe(true);
    expect(readySignals(report.containerSignals)).toEqual(expect.arrayContaining(["generic-container", "specialized-module", "exposed-ports", "env-vars"]));
    expect(readySignals(report.waitSignals)).toEqual(expect.arrayContaining(["listening-ports", "log-message", "startup-timeout", "wait-for-logs", "wait-for-http"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["start", "stop", "before-all", "after-all", "ryuk", "reuse"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["docker-host", "compose-binary", "socket", "env-config", "timeout"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["testcontainers", "@testcontainers/*", "testcontainers-python", "pytest", "vitest"]));
    expect(report.riskQueue.at(-1)?.action).toContain("Run integration tests only in a trusted workspace");
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "integration-test-environment-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "integration-test-environment-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "integration-test-environment-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects chaos engineering readiness patterns without running chaos tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-chaos-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-chaos-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "chaos"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/chaosfixture",
      "",
      "require github.com/Shopify/toxiproxy v2.12.0+incompatible"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "network-delay.yaml"), [
      "apiVersion: chaos-mesh.org/v1alpha1",
      "kind: NetworkChaos",
      "metadata:",
      "  name: checkout-network-delay",
      "  namespace: chaos-testing",
      "spec:",
      "  action: delay",
      "  mode: one",
      "  selector:",
      "    namespaces:",
      "      - default",
      "    labelSelectors:",
      "      app: checkout",
      "  duration: \"30s\"",
      "  containerNames:",
      "    - app",
      "  delay:",
      "    latency: \"200ms\"",
      "    correlation: \"25\"",
      "---",
      "apiVersion: chaos-mesh.org/v1alpha1",
      "kind: Schedule",
      "metadata:",
      "  name: checkout-chaos-schedule",
      "spec:",
      "  schedule: \"@every 10m\"",
      "  type: NetworkChaos",
      "  historyLimit: 1"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "litmus-engine.yaml"), [
      "apiVersion: litmuschaos.io/v1alpha1",
      "kind: ChaosEngine",
      "metadata:",
      "  name: checkout-litmus",
      "  namespace: chaos-testing",
      "spec:",
      "  annotationCheck: \"true\"",
      "  chaosServiceAccount: litmus-admin",
      "  jobCleanUpPolicy: delete",
      "  appinfo:",
      "    appns: default",
      "    applabel: app=checkout",
      "    appkind: deployment",
      "  experiments:",
      "    - name: pod-network-latency",
      "      spec:",
      "        components:",
      "          env:",
      "            - name: TOTAL_CHAOS_DURATION",
      "              value: \"30\"",
      "            - name: CHAOS_INTERVAL",
      "              value: \"10\"",
      "        probe:",
      "          - name: checkout-http-steady-state",
      "            type: httpProbe",
      "            mode: SOT",
      "            httpProbe/inputs:",
      "              url: http://checkout.default/health",
      "          - name: checkout-prometheus-steady-state",
      "            type: promProbe",
      "            mode: EOT",
      "            promProbe/inputs:",
      "              endpoint: http://prometheus.monitoring:9090",
      "              query: rate(http_requests_total[1m])",
      "---",
      "apiVersion: litmuschaos.io/v1alpha1",
      "kind: ChaosExperiment",
      "metadata:",
      "  name: pod-delete"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "litmus-result.yaml"), [
      "apiVersion: litmuschaos.io/v1alpha1",
      "kind: ChaosResult",
      "metadata:",
      "  name: checkout-pod-network-latency",
      "spec:",
      "  engine: checkout-litmus"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "prometheus-rules.yaml"), [
      "apiVersion: monitoring.coreos.com/v1",
      "kind: PrometheusRule",
      "metadata:",
      "  name: litmuschaos-alerts",
      "spec:",
      "  groups:",
      "    - name: litmuschaos",
      "      rules:",
      "        - alert: ChaosExperimentFailed",
      "          expr: litmuschaos_awaited_probe_success_total < 1",
      "          labels:",
      "            dashboard: grafana",
      "            metrics: litmuschaos_awaited_probe_success_total"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "toxiproxy_test.go"), [
      "package tests",
      "",
      "import toxiproxy \"github.com/Shopify/toxiproxy/client\"",
      "",
      "func configureProxy() error {",
      "  client := toxiproxy.NewClient(\"localhost:8474\")",
      "  proxy, err := client.CreateProxy(\"postgres\", \"localhost:15432\", \"localhost:5432\")",
      "  if err != nil { return err }",
      "  toxic, err := proxy.AddToxic(\"db_latency\", \"latency\", \"downstream\", 1.0, toxiproxy.Attributes{\"latency\": 200})",
      "  if err != nil { return err }",
      "  _ = toxic.Update()",
      "  return proxy.RemoveToxic(\"db_latency\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "chaos.yml"), [
      "name: chaos",
      "on: [workflow_dispatch]",
      "jobs:",
      "  validate-chaos:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: helm template chaos-mesh chaos-mesh/chaos-mesh --dry-run",
      "      - run: kubectl apply --dry-run=server -f chaos/",
      "      - run: kubectl get chaosresults --all-namespaces"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.chaosEngineeringReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const meshSetup = report.chaosSetups.find((item) => item.filePath.endsWith("network-delay.yaml"));
    const litmusSetup = report.chaosSetups.find((item) => item.filePath.endsWith("litmus-engine.yaml"));
    const toxiproxySetup = report.chaosSetups.find((item) => item.filePath.endsWith("toxiproxy_test.go"));

    expect(report.chaosSetups.length).toBeGreaterThan(0);
    expect(meshSetup?.platform).toBe("chaos-mesh");
    expect(meshSetup?.hasSelector).toBe(true);
    expect(meshSetup?.hasDuration).toBe(true);
    expect(litmusSetup?.platform).toBe("litmus");
    expect(litmusSetup?.hasProbeOrSteadyState).toBe(true);
    expect(toxiproxySetup?.platform).toBe("toxiproxy");
    expect(readySignals(report.experimentSignals)).toEqual(expect.arrayContaining(["network-chaos", "schedule", "chaos-engine", "chaos-experiment", "chaos-result", "toxiproxy"]));
    expect(readySignals(report.faultSignals)).toEqual(expect.arrayContaining(["network-delay", "pod-delete", "latency-toxic"]));
    expect(readySignals(report.scopeSignals)).toEqual(expect.arrayContaining(["selector", "namespace", "label-selector", "mode", "duration", "container-names", "target", "service-account", "annotation-check"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["probe", "steady-state", "sot", "eot", "prometheus-probe", "http-probe", "cleanup", "job-cleanup-policy"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["prometheus", "grafana", "alert-rule", "metrics", "chaos-result"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["chaos-mesh", "litmuschaos", "toxiproxy", "helm", "kubectl"]));
    expect(report.riskQueue.at(-1)?.action).toContain("approved non-production environment");
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "chaos-engineering-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "chaos-engineering-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "chaos-engineering-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects consumer contract readiness patterns without running Pact tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consumer-contract-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consumer-contract-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "test:pact": "vitest run tests/consumer.pact.test.ts",
        "pact:verify": "node tests/provider.pact.test.ts",
        "pact:publish": "pact-broker publish pacts --consumer-app-version $GITHUB_SHA",
        "pact:can-i-deploy": "pact-broker can-i-deploy --pacticipant checkout-web --version $GITHUB_SHA --to-environment production"
      },
      devDependencies: {
        "@pact-foundation/pact": "^13.0.0",
        "pact-broker-client": "^1.0.0",
        "pactflow-cli": "^1.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "tests", "consumer.pact.test.ts"), [
      "import { PactV3, MatchersV3 } from '@pact-foundation/pact';",
      "",
      "const provider = new PactV3({ consumer: 'checkout-web', provider: 'inventory-api' });",
      "",
      "it('gets available inventory through a consumer contract', async () => {",
      "  await provider",
      "    .given('inventory item exists', { sku: 'sku-1' })",
      "    .uponReceiving('a request for available inventory')",
      "    .withRequest({",
      "      method: 'GET',",
      "      path: MatchersV3.fromProviderState('/inventory/${sku}', '/inventory/sku-1'),",
      "      headers: { Authorization: MatchersV3.regex('Bearer token', 'Bearer .+') },",
      "      body: { traceId: MatchersV3.like('primary') }",
      "    })",
      "    .willRespondWith({",
      "      status: 200,",
      "      headers: { 'Content-Type': 'application/json' },",
      "      body: { items: MatchersV3.eachLike({ sku: MatchersV3.regex('sku-1', 'sku-[0-9]+'), quantity: MatchersV3.like(2) }) }",
      "    })",
      "    .executeTest(async (mockServer) => fetch(`${mockServer.url}/inventory/sku-1`));",
      "});",
      "",
      "const messageContract = 'asynchronous message pact for Kafka order events';",
      "const graphqlInteraction = 'GraphQLInteraction plugin contract';",
      "void messageContract;",
      "void graphqlInteraction;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "provider.pact.test.ts"), [
      "import { Verifier } from '@pact-foundation/pact';",
      "",
      "export async function verifyInventoryProvider() {",
      "  const verifier = new Verifier({",
      "    provider: 'inventory-api',",
      "    providerBaseUrl: 'http://localhost:8080',",
      "    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,",
      "    pactBrokerToken: process.env.PACT_BROKER_TOKEN,",
      "    publishVerificationResult: true,",
      "    providerVersion: process.env.PACT_PROVIDER_VERSION,",
      "    providerVersionBranch: process.env.PACT_PROVIDER_BRANCH,",
      "    enablePending: true,",
      "    includeWipPactsSince: '2024-01-01',",
      "    consumerVersionSelectors: [{ matchingBranch: true }, { deployedOrReleased: true }],",
      "    stateHandlers: {",
      "      'inventory item exists': async () => ({ sku: 'sku-1' })",
      "    }",
      "  });",
      "  return verifier.verifyProvider();",
      "}",
      "",
      "void 'PactVerificationContext @Provider @State provider state provider states';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "pact.yml"), [
      "name: pact",
      "on: [pull_request]",
      "jobs:",
      "  contract:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run test:pact",
      "      - run: npm run pact:verify",
      "      - run: pact-broker publish pacts --consumer-app-version $GITHUB_SHA --broker-base-url $PACT_BROKER_BASE_URL",
      "      - run: pact-broker can-i-deploy --pacticipant checkout-web --version $GITHUB_SHA --to-environment production",
      "      - run: echo junit pact verification report"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.consumerContractReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const consumerSetup = report.contractSetups.find((item) => item.filePath.endsWith("consumer.pact.test.ts"));
    const providerSetup = report.contractSetups.find((item) => item.filePath.endsWith("provider.pact.test.ts"));

    expect(report.contractSetups.length).toBeGreaterThan(0);
    expect(consumerSetup?.framework).toBe("pact-js");
    expect(consumerSetup?.interactionCount).toBeGreaterThan(0);
    expect(consumerSetup?.providerStateCount).toBeGreaterThan(0);
    expect(consumerSetup?.matcherCount).toBeGreaterThan(0);
    expect(consumerSetup?.readiness).toBe("ready");
    expect(providerSetup?.framework).toBe("pact-js");
    expect(providerSetup?.verifierCount).toBeGreaterThan(0);
    expect(providerSetup?.brokerCount).toBeGreaterThan(0);
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pact-v3", "given", "upon-receiving", "with-request", "will-respond-with", "execute-test", "message", "graphql", "plugin"]));
    expect(readySignals(report.providerSignals)).toEqual(expect.arrayContaining(["verifier", "provider-state", "state-handlers", "provider-base-url", "verification-context", "publish-results", "provider-version", "provider-branch"]));
    expect(readySignals(report.brokerSignals)).toEqual(expect.arrayContaining(["pact-broker", "pactflow", "can-i-deploy", "consumer-version-selector", "pending-pacts", "wip-pacts", "token-auth"]));
    expect(readySignals(report.matcherSignals)).toEqual(expect.arrayContaining(["like", "each-like", "regex", "from-provider-state", "headers", "body"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["publish-pact", "verify-provider", "junit", "github-actions", "npm-script"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@pact-foundation/pact", "pact-broker-client", "pactflow"]));
    expect(report.riskQueue.at(-1)?.action).toContain("Run Pact consumer tests");
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "consumer-contract-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "consumer-contract-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "consumer-contract-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects mutation testing readiness patterns without executing mutation engines", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mutation-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mutation-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "reports", "mutation"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "lib"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Mutation testing fixture",
      "",
      "This project documents mutation testing, mutator review, mutation score, and survived mutant handling."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "calc.ts"), "export const add = (a: number, b: number) => a + b;\n");
    await fs.writeFile(path.join(sourceRoot, "lib", "legacy.ts"), "export const negate = (value: boolean) => !value;\n");
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest run",
        "test:mutation": "stryker run --reporters html,json,clear-text,progress,dashboard,badge,junit",
        "test:mutation:incremental": "stryker run --incremental --dry-run"
      },
      devDependencies: {
        "@stryker-mutator/core": "^8.0.0",
        "@stryker-mutator/vitest-runner": "^8.0.0",
        "@stryker-mutator/jest-runner": "^8.0.0",
        "mutation-testing-report-schema": "^3.0.0",
        "infection/infection": "^0.29.0",
        mutmut: "^3.0.0",
        pitest: "^1.15.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "stryker.conf.json"), JSON.stringify({
      "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
      mutate: ["src/**/*.ts", "lib/**/*.ts", "!src/**/*.test.ts"],
      mutator: { excludedMutations: ["StringLiteral"] },
      testRunner: "vitest",
      coverageAnalysis: "perTest",
      reporters: ["html", "json", "clear-text", "progress", "dashboard", "badge", "junit"],
      thresholds: { high: 80, low: 60, break: 50 },
      timeoutMS: 10000,
      timeoutFactor: 1.5,
      incremental: true,
      disableTypeChecks: "{src,lib,test}/**/*.{ts,tsx}",
      ignoreStatic: true,
      dashboard: { project: "repotutor-fixture" }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "infection.json"), JSON.stringify({
      "$schema": "vendor/infection/infection/resources/schema.json",
      source: { directories: ["src", "lib"] },
      sourceDirs: ["src", "lib"],
      testFramework: "phpunit",
      timeout: 15,
      logs: {
        html: "reports/infection.html",
        json: "reports/infection.json",
        text: "reports/infection.txt",
        junit: "reports/infection-junit.xml"
      },
      mutators: { "@default": true, BooleanLiteral: true, ReturnRemoval: true },
      minMsi: 80,
      minCoveredMsi: 90,
      withUncovered: true,
      notes: "Killed Survived Timeout Ignored NoCoverage with-uncovered covered MSI MSI"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "mutation.yml"), [
      "name: mutation",
      "on: [pull_request]",
      "jobs:",
      "  mutation:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: npx stryker run --incremental --dry-run --reporters html,json,clear-text,progress,dashboard,badge,junit"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "reports", "mutation", "mutation-report.json"), JSON.stringify({
      schemaVersion: "3.0",
      thresholds: { high: 80, low: 60 },
      mutationScore: 85,
      coveredScore: 90,
      files: {
        "src/calc.ts": {
          mutants: [
            { id: "1", mutatorName: "BooleanLiteral", status: "Killed" },
            { id: "2", mutatorName: "StringLiteral", status: "Survived" },
            { id: "3", mutatorName: "ArrayDeclaration", status: "Timeout" },
            { id: "4", mutatorName: "ReturnRemoval", status: "Ignored" },
            { id: "5", mutatorName: "StringLiteral", status: "NoCoverage" }
          ]
        }
      },
      package: "mutation-testing-report-schema"
    }, null, 2));
    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.mutationTestingReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.mutationSetups.some((item) => item.tool === "stryker" && item.readiness === "ready")).toBe(true);
    expect(report.mutationSetups.some((item) => item.tool === "infection" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["stryker", "infection", "mutation-testing-elements", "mutmut", "pitest", "custom"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["config-file", "package-script", "schema", "mutate-pattern", "test-runner", "coverage-analysis", "disable-type-checks"]));
    expect(readySignals(report.qualitySignals)).toEqual(expect.arrayContaining(["thresholds", "mutation-score", "covered-score", "survived", "killed", "timeout", "ignored", "no-coverage"]));
    expect(readySignals(report.reporterSignals)).toEqual(expect.arrayContaining(["html", "json", "clear-text", "progress", "dashboard", "badge", "junit", "mutation-testing-report-schema"]));
    expect(readySignals(report.scopeSignals)).toEqual(expect.arrayContaining(["src", "lib", "test-files", "ignore-patterns", "with-uncovered", "incremental", "dry-run"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@stryker-mutator/core", "@stryker-mutator/vitest-runner", "@stryker-mutator/jest-runner", "mutation-testing-report-schema", "infection/infection", "mutmut", "pitest", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "mutation-testing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mutation-testing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mutation-testing-readiness.html"))).resolves.toBeUndefined();
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

  it("detects coverage readiness without running coverage toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-coverage-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-coverage-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "coverage"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "coverage-study",
      version: "1.0.0",
      workspaces: ["packages/*"],
      scripts: {
        test: "vitest run --reporter=junit",
        coverage: "nyc --all --check-coverage --reporter=lcov --reporter=text-summary --reporter=json-summary npm test",
        "coverage:c8": "c8 --all --src src --include \"src/**/*.ts\" --exclude \"**/*.test.ts\" --exclude-after-remap --check-coverage --lines 90 --functions 85 --branches 80 --statements 90 --reporter=lcov --reporter=cobertura --reporter=json npm test",
        "coverage:vitest": "vitest run --coverage",
        "coverage:py": "python -m pytest --cov=src --cov-report=term --cov-report=xml",
        "coverage:go": "go test ./... -coverprofile=coverage.out",
        "coverage:coveralls": "coveralls < coverage/lcov.info",
        "coverage:merge": "nyc merge coverage .nyc_output/coverage-final.json && c8 report --reporter=lcov"
      },
      dependencies: {
        coveralls: "^3.1.1"
      },
      devDependencies: {
        nyc: "latest",
        c8: "latest",
        vitest: "latest",
        "@vitest/coverage-v8": "latest",
        "@vitest/coverage-istanbul": "latest",
        jest: "latest",
        "babel-plugin-istanbul": "latest",
        "nyc-config-typescript": "latest"
      },
      nyc: {
        all: true,
        include: ["src/**/*.ts"],
        exclude: ["**/*.test.ts"],
        "exclude-after-remap": true,
        "check-coverage": true,
        branches: 80,
        functions: 85,
        lines: 90,
        statements: 90,
        "per-file": true,
        watermarks: { lines: [80, 95] },
        reporter: ["lcov", "text-summary", "json", "json-summary", "html", "cobertura", "clover"]
      },
      jest: {
        collectCoverage: true,
        collectCoverageFrom: ["src/**/*.ts"],
        coverageThreshold: {
          global: { branches: 80, functions: 85, lines: 90, statements: 90 }
        },
        coverageReporters: ["json", "lcov", "text", "clover"]
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".nycrc.json"), JSON.stringify({
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      "exclude-after-remap": true,
      "check-coverage": true,
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
      "per-file": true,
      watermarks: { statements: [80, 95] },
      reporter: ["lcov", "text-summary", "json", "html", "cobertura", "clover"]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".c8rc.json"), JSON.stringify({
      all: true,
      src: ["src"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      "exclude-after-remap": true,
      "check-coverage": true,
      lines: 90,
      functions: 85,
      branches: 80,
      statements: 90,
      "per-file": true,
      reporter: ["lcov", "text-summary", "cobertura", "json", "json-summary"]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "vitest.config.ts"), [
      "import { defineConfig } from 'vitest/config';",
      "export default defineConfig({",
      "  test: {",
      "    coverage: {",
      "      provider: 'v8',",
      "      enabled: true,",
      "      include: ['src/**/*.ts'],",
      "      exclude: ['**/*.test.ts'],",
      "      reporter: ['text', 'html', 'lcov', 'json-summary', 'cobertura'],",
      "      thresholds: { lines: 90, functions: 85, branches: 80, statements: 90 }",
      "    }",
      "  }",
      "});",
      "export const istanbulProvider = { provider: 'istanbul', sourceMap: true };"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"coverage-study\"",
      "dependencies = [\"coverage>=7\", \"pytest-cov\"]",
      "",
      "[tool.coverage.run]",
      "source = [\"src\"]",
      "omit = [\"tests/*\"]",
      "branch = true",
      "",
      "[tool.coverage.report]",
      "fail_under = 90",
      "",
      "[tool.pytest.ini_options]",
      "addopts = \"--cov=src --cov-report=term --cov-report=xml --cov-report=html\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".coveragerc"), [
      "[run]",
      "source = src",
      "branch = True",
      "",
      "[report]",
      "fail_under = 90",
      "pragma: no cover"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "codecov.yml"), [
      "coverage:",
      "  status:",
      "    project:",
      "      default:",
      "        target: auto",
      "        threshold: 1%",
      "    patch:",
      "      default:",
      "        target: 80%",
      "        threshold: 2%",
      "flags:",
      "  unittests:",
      "    paths:",
      "      - src"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "coverage.yml"), [
      "name: coverage",
      "on: [push, pull_request]",
      "permissions:",
      "  contents: read",
      "  id-token: write",
      "jobs:",
      "  coverage:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}",
      "      COVERALLS_REPO_TOKEN: ${{ secrets.COVERALLS_REPO_TOKEN }}",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run coverage && npm run coverage:c8 && npm run coverage:py && npm run coverage:go",
      "      - run: echo coverage summary >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: coverage",
      "          path: coverage/lcov.info",
      "      - uses: codecov/codecov-action@v5",
      "        with:",
      "          use_oidc: true",
      "          token: ${{ secrets.CODECOV_TOKEN }}",
      "          files: ./coverage/lcov.info,./coverage.xml,./coverage-final.json,./coverage.out",
      "          flags: unittests,node",
      "          fail_ci_if_error: true",
      "          disable_search: true",
      "          directory: ./coverage",
      "          report_type: test_results",
      "      - run: coveralls < coverage/lcov.info"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Coverage Study",
      "[![coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://codecov.io/gh/example/coverage-study)",
      "Codecov badge and codecov/c/github style coverage link."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "math.ts"), [
      "export function add(a: number, b: number) {",
      "  /* c8 ignore next */",
      "  /* istanbul ignore next */",
      "  return a + b;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "math.test.ts"), [
      "import { expect, it } from 'vitest';",
      "import { add } from './math';",
      "it('adds', () => expect(add(1, 2)).toBe(3));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "coverage", "lcov.info"), "TN:\nSF:src/math.ts\nLF:1\nLH:1\nend_of_record\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "coverage-final.json"), "{\"src/math.ts\":{\"path\":\"src/math.ts\"}}\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "coverage-summary.json"), "{\"total\":{\"lines\":{\"pct\":100}}}\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "cobertura-coverage.xml"), "<coverage line-rate=\"1\" branch-rate=\"1\"></coverage>\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "clover.xml"), "<coverage generated=\"1\"></coverage>\n");
    await fs.writeFile(path.join(sourceRoot, "coverage.out"), "mode: set\nsrc/math.ts:1.1,3.2 1 1\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "coverage-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      coverageSetups: Array<{ filePath: string; tool: string; configCount: number; reporterCount: number; thresholdCount: number; includeCount: number; excludeCount: number; uploadCount: number; artifactCount: number; mergeCount: number }>;
      instrumentationSignals: Array<{ signal: string; readiness: string }>;
      scopeSignals: Array<{ signal: string; readiness: string }>;
      thresholdSignals: Array<{ signal: string; readiness: string }>;
      reportSignals: Array<{ signal: string; readiness: string }>;
      ciUploadSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("nyc c8 Istanbul V8 coverage lcov cobertura coverage-final check-coverage thresholds Codecov OIDC flags");
    expect(report.coverageSetups.length).toBeGreaterThan(0);
    expect(report.coverageSetups.some((item) => item.tool === "nyc" && item.configCount > 0 && item.reporterCount > 0 && item.thresholdCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.tool === "c8" && item.includeCount > 0 && item.excludeCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.tool === "vitest" && item.reporterCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.tool === "codecov" && item.configCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.uploadCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.artifactCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.mergeCount > 0)).toBe(true);
    expect(readySignals(report.instrumentationSignals)).toEqual(expect.arrayContaining(["nyc", "c8", "v8-provider", "istanbul-provider", "babel-istanbul", "coverage-py", "pytest-cov", "go-cover", "lcov-genhtml"]));
    expect(readySignals(report.scopeSignals)).toEqual(expect.arrayContaining(["all-files", "include", "exclude", "exclude-after-remap", "source-map", "per-file", "workspace-src", "ignore-hints"]));
    expect(readySignals(report.thresholdSignals)).toEqual(expect.arrayContaining(["check-coverage", "lines", "functions", "branches", "statements", "watermarks", "global-threshold", "per-file-threshold", "patch-threshold", "project-threshold"]));
    expect(readySignals(report.reportSignals)).toEqual(expect.arrayContaining(["text", "text-summary", "html", "lcov", "json", "json-summary", "cobertura", "clover", "junit", "coverage-final", "coverage-out"]));
    expect(readySignals(report.ciUploadSignals)).toEqual(expect.arrayContaining(["codecov-action", "codecov-token", "codecov-oidc", "codecov-flags", "codecov-files", "fail-ci-if-error", "coveralls", "github-step-summary", "upload-artifact", "badge"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["nyc", "c8", "@vitest/coverage-v8", "@vitest/coverage-istanbul", "jest", "babel-plugin-istanbul", "coverage", "pytest-cov", "codecov-action", "coveralls"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx nyc --all --check-coverage --reporter=lcov --reporter=text-summary npm test",
      "npx c8 --all --check-coverage --reporter=lcov --reporter=text-summary npm test",
      "npx vitest run --coverage"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "coverage-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "coverage-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "coverage-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects load testing readiness without running load toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-load-testing-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-load-testing-source-"));
    await fs.mkdir(path.join(sourceRoot, "performance"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "reports"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "load-testing-study",
      version: "1.0.0",
      scripts: {
        "load:k6": "k6 run --summary-export reports/k6-summary.json performance/k6-load.js",
        "load:artillery": "artillery run load-test.yml --output reports/artillery.json && artillery report reports/artillery.json",
        "load:locust": "locust -f locustfile.py --headless -u 50 -r 5 --run-time 5m --html reports/locust.html --csv reports/locust",
        "load:autocannon": "autocannon -c 20 -d 30 http://localhost:3000"
      },
      dependencies: {
        artillery: "latest",
        "@artilleryio/processor": "latest",
        "artillery-engine-playwright": "latest",
        "artillery-plugin-ensure": "latest",
        "artillery-plugin-expect": "latest",
        "artillery-plugin-publish-metrics": "latest",
        autocannon: "latest"
      },
      devDependencies: {
        k6: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "performance", "k6-load.js"), [
      "import http from 'k6/http';",
      "import ws from 'k6/ws';",
      "import grpc from 'k6/net/grpc';",
      "import { browser } from 'k6/browser';",
      "import { check, group, sleep } from 'k6';",
      "import { Counter, Rate, Trend } from 'k6/metrics';",
      "import { SharedArray } from 'k6/data';",
      "const data = new SharedArray('users', () => JSON.parse(open('./users.json')));",
      "export const options = {",
      "  vus: 10,",
      "  duration: '30s',",
      "  stages: [{ duration: '30s', target: 20 }, { duration: '1m', target: 20 }, { duration: '10s', target: 0 }],",
      "  scenarios: {",
      "    smoke: { executor: 'constant-vus', vus: 1, duration: '30s' },",
      "    stress: { executor: 'ramping-vus', stages: [{ duration: '1m', target: 50 }] },",
      "    spike: { executor: 'ramping-arrival-rate', startRate: 1, timeUnit: '1s', preAllocatedVUs: 10, stages: [{ duration: '30s', target: 100 }] },",
      "    soak: { executor: 'constant-arrival-rate', rate: 5, timeUnit: '1s', duration: '10m', preAllocatedVUs: 20 }",
      "  },",
      "  thresholds: {",
      "    http_req_duration: ['p(95)<500', { threshold: 'p(99)<1000', abortOnFail: true }],",
      "    http_req_failed: ['rate<0.01'],",
      "    checks: ['rate>0.99']",
      "  },",
      "  summaryTrendStats: ['avg', 'p(95)', 'p(99)'],",
      "  ext: { loadimpact: { projectID: 123 } }",
      "};",
      "const errors = new Counter('custom_errors');",
      "const successRate = new Rate('custom_success');",
      "const apiTrend = new Trend('api_duration');",
      "export function setup() { return { token: __ENV.API_TOKEN, data }; }",
      "export default function () {",
      "  group('graphql api', () => {",
      "    const res = http.post(`${__ENV.BASE_URL}/graphql`, JSON.stringify({ query: '{ viewer { id } }' }), { tags: { name: 'GraphQL query' } });",
      "    check(res, { 'status is 200': (r) => r.status === 200, 'response body valid': (r) => r.body.includes('viewer') });",
      "    successRate.add(res.status === 200);",
      "    apiTrend.add(res.timings.duration);",
      "    errors.add(res.status !== 200);",
      "  });",
      "  ws.connect('wss://example.test/socket', {}, () => {});",
      "  grpc.Client;",
      "  browser.newPage;",
      "  sleep(1);",
      "}",
      "export function teardown() {}",
      "export function handleSummary(data) {",
      "  return { 'reports/k6-summary.json': JSON.stringify(data), stdout: 'summary' };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "performance", "users.json"), "[{\"id\":1}]\n");
    await fs.writeFile(path.join(sourceRoot, "load-test.yml"), [
      "config:",
      "  target: \"https://example.test\"",
      "  phases:",
      "    - duration: 60",
      "      arrivalRate: 5",
      "      rampTo: 50",
      "      name: stress",
      "  plugins:",
      "    ensure: {}",
      "    expect: {}",
      "    publish-metrics:",
      "      - type: prometheus",
      "      - type: datadog",
      "  processor: \"./processor.js\"",
      "  engines:",
      "    playwright: {}",
      "  ensure:",
      "    thresholds:",
      "      - http.response_time.p95: 500",
      "  apdex:",
      "    threshold: 200",
      "  variables:",
      "    tenant:",
      "      - alpha",
      "  payload:",
      "    path: ./performance/users.csv",
      "    fields:",
      "      - id",
      "scenarios:",
      "  - name: graphql websocket browser",
      "    beforeScenario: \"beforeScenario\"",
      "    afterScenario: \"afterScenario\"",
      "    engine: \"playwright\"",
      "    flow:",
      "      - get:",
      "          url: \"/health\"",
      "          expect:",
      "            - statusCode: 200",
      "      - post:",
      "          url: \"/graphql\"",
      "          json:",
      "            query: \"{ viewer { id } }\"",
      "      - websocket:",
      "          url: \"wss://example.test/socket\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "processor.js"), [
      "module.exports.beforeScenario = function beforeScenario(context, events, done) {",
      "  context.vars.token = process.env.API_TOKEN;",
      "  events.request.fire('counter', 'custom_metric', 1);",
      "  done();",
      "};",
      "module.exports.afterScenario = function afterScenario(context, events, done) {",
      "  events.request.fire('histogram', 'scenario_duration', 10);",
      "  done();",
      "};",
      "module.exports.beforeRequest = function beforeRequest(requestParams, context, events, done) {",
      "  requestParams.headers = { 'x-tenant': context.vars.tenant };",
      "  const tcpSocket = 'net.connect tcp socket';",
      "  done();",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "locustfile.py"), [
      "from locust import HttpUser, FastHttpUser, LoadTestShape, between, constant_pacing, task, events",
      "import os, csv",
      "class WebsiteUser(HttpUser):",
      "    host = os.environ.get('TARGET_HOST', 'https://example.test')",
      "    wait_time = between(1, 2)",
      "    @task(3)",
      "    def index(self):",
      "        with self.client.get('/health', name='status-check', catch_response=True) as response:",
      "            if response.status_code != 200:",
      "                response.failure('status_check failed')",
      "    @task",
      "    def graphql(self):",
      "        self.client.post('/graphql', json={'query': '{ viewer { id } }'}, name='GraphQL')",
      "class ApiUser(FastHttpUser):",
      "    wait_time = constant_pacing(1)",
      "    @task",
      "    def api(self):",
      "        self.client.get('/api')",
      "class StepLoadShape(LoadTestShape):",
      "    def tick(self):",
      "        run_time = self.get_run_time()",
      "        if run_time < 60:",
      "            return (10, 2)",
      "        return None",
      "@events.request.add_listener",
      "def on_request(**kwargs):",
      "    pass"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "requirements-load.txt"), [
      "locust>=2",
      "locust-plugins>=4"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "performance", "users.csv"), "id\n1\n");
    await fs.writeFile(path.join(sourceRoot, "docker-compose.yml"), [
      "services:",
      "  k6:",
      "    image: grafana/k6",
      "    command: run /scripts/k6-load.js",
      "  locust-master:",
      "    image: locustio/locust",
      "    command: --master --expect-workers 2",
      "  locust-worker:",
      "    image: locustio/locust",
      "    command: --worker --master-host locust-master",
      "  artillery:",
      "    image: artilleryio/artillery",
      "    command: run /scripts/load-test.yml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "load.yml"), [
      "name: load",
      "on: [push, pull_request]",
      "jobs:",
      "  load:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: k6 run --summary-export reports/k6-summary.json performance/k6-load.js",
      "      - run: k6 cloud performance/k6-load.js",
      "      - run: artillery run load-test.yml --output reports/artillery.json && artillery report reports/artillery.json",
      "      - run: artillery cloud run load-test.yml",
      "      - run: locust -f locustfile.py --headless -u 50 -r 5 --run-time 5m --html reports/locust.html --csv reports/locust --processes 2 --expect-workers 2",
      "      - run: echo 'SLO service level objective p(95) p(99) JUnit xunit InfluxDB cloud dashboard Grafana Cloud k6-operator Kubernetes TestRun distributed parallel workers'",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: load-performance-reports",
      "          path: |",
      "            reports/k6-summary.json",
      "            reports/artillery.json",
      "            reports/locust.html",
      "            reports/locust_stats.csv",
      "            reports/load-junit.xml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Load Testing Study",
      "Authorized load testing only.",
      "Smoke, stress, spike, and soak profiles publish Prometheus, InfluxDB, Grafana, Datadog, JUnit, and cloud dashboard reports.",
      "The k6-operator Kubernetes TestRun path is documented for distributed workers.",
      "locust-plugins, tcp socket, and custom client coverage are documented for non-HTTP load testing."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "reports", "locust_stats.csv"), "Name,Requests\nGET /health,1\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "artillery.json"), "{\"aggregate\":{\"counters\":{}}}\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "k6-summary.json"), "{\"metrics\":{}}\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "load-junit.xml"), "<testsuite></testsuite>\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "load-testing-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      loadTestSetups: Array<{ filePath: string; tool: string; configCount: number; scriptCount: number; scenarioCount: number; loadProfileCount: number; thresholdCount: number; protocolCount: number; dataCount: number; reportCount: number; distributedCount: number; ciCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      profileSignals: Array<{ signal: string; readiness: string }>;
      protocolSignals: Array<{ signal: string; readiness: string }>;
      assertionSignals: Array<{ signal: string; readiness: string }>;
      dataSignals: Array<{ signal: string; readiness: string }>;
      executionSignals: Array<{ signal: string; readiness: string }>;
      reportSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("k6 Artillery Locust load testing scenarios phases thresholds checks ensure HttpUser headless distributed reports");
    expect(report.loadTestSetups.length).toBeGreaterThan(0);
    expect(report.loadTestSetups.some((item) => item.tool === "k6" && item.configCount > 0 && item.loadProfileCount > 0 && item.thresholdCount > 0 && item.reportCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.tool === "artillery" && item.scenarioCount > 0 && item.protocolCount > 0 && item.dataCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.tool === "locust" && item.scriptCount > 0 && item.loadProfileCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.distributedCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["k6", "artillery", "locust", "autocannon"]));
    expect(readySignals(report.profileSignals)).toEqual(expect.arrayContaining(["vus", "duration", "stages", "scenarios", "arrival-rate", "ramping", "spawn-rate", "users", "wait-time", "load-shape", "soak", "stress", "spike", "smoke"]));
    expect(readySignals(report.protocolSignals)).toEqual(expect.arrayContaining(["http", "websocket", "grpc", "graphql", "browser", "playwright", "tcp", "custom-client"]));
    expect(readySignals(report.assertionSignals)).toEqual(expect.arrayContaining(["thresholds", "checks", "ensure", "expect-plugin", "apdex", "slo", "abort-on-fail", "percentiles", "status-check"]));
    expect(readySignals(report.dataSignals)).toEqual(expect.arrayContaining(["setup-teardown", "shared-array", "csv-data", "env-vars", "processor", "custom-metrics", "tags", "parameterization"]));
    expect(readySignals(report.executionSignals)).toEqual(expect.arrayContaining(["headless", "cloud", "distributed-master-worker", "k6-operator", "docker", "ci-workflow", "artifact-upload", "parallel-workers"]));
    expect(readySignals(report.reportSignals)).toEqual(expect.arrayContaining(["summary", "handleSummary", "json", "html", "csv", "prometheus", "influxdb", "grafana", "datadog", "cloud-dashboard", "junit"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["k6", "artillery", "@artilleryio/*", "artillery-engine-playwright", "locust", "locust-plugins", "autocannon"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "k6 run --summary-export reports/k6-summary.json performance/load-test.js",
      "artillery run load-test.yml --output reports/artillery.json && artillery report reports/artillery.json",
      "locust -f locustfile.py --headless -u 50 -r 5 --run-time 5m --html reports/locust.html --csv reports/locust"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "load-testing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "load-testing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "load-testing-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects browser extension readiness without running extension toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-browser-extension-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-browser-extension-source-"));
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "popup"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "options"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "sidepanel"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "devtools"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "newtab"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "contents"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "extension-demo",
      version: "1.0.0",
      scripts: {
        dev: "wxt dev --browser chrome",
        build: "wxt build --browser chrome",
        zip: "wxt zip --browser chrome",
        submit: "wxt submit --chrome-zip .output/extension.zip",
        "plasmo:dev": "plasmo dev",
        "plasmo:build": "plasmo build",
        "plasmo:package": "plasmo package",
        "plasmo:publish": "plasmo publish",
        "web-ext:build": "web-ext build",
        "web-ext:sign": "web-ext sign"
      },
      dependencies: {
        wxt: "^0.20.0",
        plasmo: "^0.90.0",
        "@crxjs/vite-plugin": "^2.0.0",
        "webextension-polyfill": "^0.12.0",
        "@plasmohq/messaging": "^0.7.0",
        "@plasmohq/storage": "^1.15.0"
      },
      devDependencies: {
        "@types/chrome": "^0.0.300",
        "chrome-types": "^0.1.300",
        "web-ext": "^8.0.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "manifest.json"), JSON.stringify({
      manifest_version: 3,
      name: "Extension Demo",
      version: "1.0.0",
      background: { service_worker: "entrypoints/background.ts", type: "module" },
      action: { default_popup: "entrypoints/popup/index.html" },
      options_page: "entrypoints/options/index.html",
      side_panel: { default_path: "entrypoints/sidepanel/index.html" },
      devtools_page: "entrypoints/devtools/index.html",
      chrome_url_overrides: { newtab: "entrypoints/newtab/index.html" },
      permissions: ["activeTab", "scripting", "storage", "declarativeNetRequest", "tabs"],
      host_permissions: ["https://*/*"],
      optional_permissions: ["cookies"],
      optional_host_permissions: ["https://example.com/*"],
      content_scripts: [{ matches: ["https://github.com/*"], js: ["contents/github.ts"] }],
      web_accessible_resources: [{ resources: ["assets/*"], matches: ["https://github.com/*"] }],
      content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
      declarative_net_request: { rule_resources: [{ id: "rules", enabled: true, path: "rules.json" }] }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "wxt.config.ts"), [
      "import { defineConfig } from 'wxt';",
      "export default defineConfig({",
      "  srcDir: '.',",
      "  outDir: '.output',",
      "  targetBrowsers: ['chrome', 'firefox', 'edge'],",
      "  manifest: { manifest_version: 3, name: 'Extension Demo', permissions: ['storage', 'scripting'], host_permissions: ['https://*/*'] },",
      "  zip: { artifactTemplate: '{{name}}-{{version}}-{{browser}}.zip' },",
      "  runner: { startUrls: ['https://github.com'] }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "plasmo.config.ts"), "export default { manifest: { host_permissions: ['https://*/*'], permissions: ['storage'] }, browser: 'chrome' };\n");
    await fs.writeFile(path.join(sourceRoot, "vite.config.ts"), [
      "import { defineConfig } from 'vite';",
      "import { crx, defineManifest } from '@crxjs/vite-plugin';",
      "const manifest = defineManifest({ manifest_version: 3, name: 'CRX Demo', version: '1.0.0', content_scripts: [{ matches: ['https://github.com/*'], js: ['contents/github.ts'] }] });",
      "export default defineConfig({ plugins: [crx({ manifest })] });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "background.ts"), [
      "import browser from 'webextension-polyfill';",
      "import { defineExtensionMessaging } from 'wxt/utils/messaging';",
      "import { Storage } from '@plasmohq/storage';",
      "const storage = new Storage();",
      "export const messaging = defineExtensionMessaging();",
      "chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set({ ready: true }));",
      "chrome.runtime.onMessage.addListener((message, sender, sendResponse) => sendResponse({ ok: true }));",
      "chrome.runtime.onConnect.addListener((port) => port.postMessage({ connected: true }));",
      "chrome.tabs.sendMessage(1, { kind: 'ping' });",
      "browser.runtime.sendMessage({ kind: 'browser-runtime' });",
      "chrome.scripting.executeScript({ target: { tabId: 1 }, files: ['contents/github.js'] });",
      "chrome.declarativeNetRequest.updateDynamicRules({ addRules: [], removeRuleIds: [] });",
      "chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['DOM_PARSER'], justification: 'parse' });",
      "storage.set('mode', 'demo');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "contents", "github.ts"), [
      "import { sendToBackground } from '@plasmohq/messaging';",
      "chrome.runtime.sendMessage({ kind: 'content-ready' });",
      "sendToBackground({ name: 'content-ready', body: { url: location.href } });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "popup", "index.html"), "<main>Popup</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "options", "index.html"), "<main>Options</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "sidepanel", "index.html"), "<main>Side panel</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "devtools", "index.html"), "<main>Devtools</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "newtab", "index.html"), "<main>New tab</main>\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "extension.yml"), [
      "name: browser-extension",
      "on: [push]",
      "jobs:",
      "  package:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: wxt build && wxt zip && wxt submit",
      "      - run: plasmo build && plasmo package && plasmo publish",
      "      - run: web-ext build && web-ext sign",
      "      - run: echo Chrome Web Store addons.mozilla.org Edge Add-ons Browser Platform Publisher AMO_JWT HMR hot reload extension zip",
      "      - uses: actions/upload-artifact@v4",
      "      - uses: softprops/action-gh-release@v2"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "browser-extension-readiness-report.json"), "utf8")) as {
      extensionSetups: Array<{ filePath: string; framework: string; manifestCount: number; entrypointCount: number; permissionCount: number; hostPermissionCount: number; messagingCount: number; storageCount: number; uiSurfaceCount: number; buildCount: number; publishCount: number }>;
      manifestSignals: Array<{ signal: string; readiness: string }>;
      entrypointSignals: Array<{ signal: string; readiness: string }>;
      permissionSignals: Array<{ signal: string; readiness: string }>;
      messagingSignals: Array<{ signal: string; readiness: string }>;
      buildSignals: Array<{ signal: string; readiness: string }>;
      publishSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const manifestSetup = report.extensionSetups.find((item) => item.filePath === "manifest.json");
    expect(report.extensionSetups.length).toBeGreaterThan(0);
    expect(manifestSetup?.framework).toBe("manifest");
    expect(manifestSetup?.manifestCount).toBeGreaterThan(0);
    expect(manifestSetup?.entrypointCount).toBeGreaterThan(0);
    expect(manifestSetup?.permissionCount).toBeGreaterThan(0);
    expect(manifestSetup?.hostPermissionCount).toBeGreaterThan(0);
    expect(report.extensionSetups.some((item) => item.framework === "wxt" && item.manifestCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.framework === "plasmo" && item.permissionCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.framework === "crxjs" && item.buildCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.messagingCount > 0 && item.storageCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.publishCount > 0)).toBe(true);
    expect(readySignals(report.manifestSignals)).toEqual(expect.arrayContaining(["manifest-v3", "manifest-json", "generated-manifest", "wxt-config", "plasmo-config", "crxjs-plugin", "browser-targets"]));
    expect(readySignals(report.entrypointSignals)).toEqual(expect.arrayContaining(["background", "service-worker", "content-script", "popup", "options", "side-panel", "devtools", "offscreen", "newtab"]));
    expect(readySignals(report.permissionSignals)).toEqual(expect.arrayContaining(["permissions", "host-permissions", "optional-permissions", "optional-host-permissions", "active-tab", "scripting", "storage", "declarative-net-request", "web-accessible-resources", "content-security-policy"]));
    expect(readySignals(report.messagingSignals)).toEqual(expect.arrayContaining(["chrome-runtime", "browser-runtime", "send-message", "runtime-connect", "tabs-message", "plasmo-messaging", "wxt-messaging", "webextension-polyfill"]));
    expect(readySignals(report.buildSignals)).toEqual(expect.arrayContaining(["wxt-build", "plasmo-build", "vite-crx", "web-ext", "zip-artifact", "watch-dev", "hmr", "typescript"]));
    expect(readySignals(report.publishSignals)).toEqual(expect.arrayContaining(["chrome-web-store", "firefox-addons", "edge-addons", "plasmo-bpp", "wxt-submit", "web-ext-sign", "release-action"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["wxt", "plasmo", "@crxjs/vite-plugin", "webextension-polyfill", "@types/chrome", "chrome-types", "web-ext", "extension-api"]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "browser-extension-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "browser-extension-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "browser-extension-readiness.html"))).resolves.toBeUndefined();
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

  it("detects Tauri desktop readiness without running native build tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-desktop-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-desktop-source-"));
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "capabilities"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "permissions"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "icons"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "electron"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "desktop"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "desktop-demo",
      version: "1.0.0",
      main: "electron/main.js",
      scripts: {
        "tauri:dev": "tauri dev",
        "tauri:info": "tauri info",
        "tauri:build": "tauri build --bundles app,dmg,nsis,msi,appimage",
        "electron:build": "electron-builder --mac --win --linux",
        "wails:build": "wails build -platform darwin/universal,windows/amd64,linux/amd64"
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-opener": "^2.0.0",
        "@tauri-apps/plugin-updater": "^2.0.0",
        electron: "^35.0.0",
        wails: "^3.0.0"
      },
      devDependencies: {
        "@tauri-apps/cli": "^2.0.0",
        "electron-builder": "^26.0.0",
        "electron-forge": "^7.0.0",
        "@electron/notarize": "^3.0.0"
      },
      build: {
        appId: "com.example.desktopdemo",
        mac: { target: ["dmg"], hardenedRuntime: true, entitlements: "build/entitlements.plist" },
        win: { target: ["nsis", "msi"] },
        linux: { target: ["AppImage", "deb"] },
        publish: ["github"]
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "tauri.conf.json"), JSON.stringify({
      productName: "Desktop Demo",
      version: "1.0.0",
      identifier: "com.example.desktopdemo",
      build: {
        beforeDevCommand: "pnpm dev",
        beforeBuildCommand: "pnpm build",
        devUrl: "http://localhost:5173",
        frontendDist: "../dist"
      },
      app: {
        withGlobalTauri: true,
        security: { csp: "default-src 'self'" },
        windows: [{ label: "main", title: "Desktop Demo", width: 1200, height: 800, resizable: true }]
      },
      bundle: {
        active: true,
        targets: ["app", "dmg", "nsis", "msi", "appimage"],
        icon: ["icons/icon.icns", "icons/icon.ico", "icons/icon.png"],
        resources: ["resources/**"],
        fileAssociations: [{ ext: ["demo"], name: "Desktop Demo Document" }],
        macOS: { hardenedRuntime: true, entitlements: "Entitlements.plist" },
        windows: { nsis: { installerIcon: "icons/icon.ico" } },
        linux: { appimage: { bundleMediaFramework: true } }
      },
      plugins: {
        updater: {
          active: true,
          endpoints: ["https://example.com/latest.json"],
          pubkey: "TAURI_PUBKEY",
          createUpdaterArtifacts: true
        },
        opener: {}
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "Cargo.toml"), [
      "[package]",
      "name = \"desktop-demo\"",
      "version = \"1.0.0\"",
      "[build-dependencies]",
      "tauri-build = \"2\"",
      "[dependencies]",
      "tauri = { version = \"2\", features = [\"tray-icon\", \"devtools\"] }",
      "tauri-plugin-opener = \"2\"",
      "tauri-plugin-updater = \"2\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "src", "main.rs"), [
      "#[tauri::command]",
      "fn greet(name: String) -> String { format!(\"Hello {name}\") }",
      "fn main() {",
      "  tauri::Builder::default()",
      "    .plugin(tauri_plugin_opener::init())",
      "    .invoke_handler(tauri::generate_handler![greet])",
      "    .setup(|app| { let _ = app.handle(); Ok(()) })",
      "    .run(tauri::generate_context!())",
      "    .expect(\"error while running tauri application\");",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "capabilities", "default.json"), JSON.stringify({
      identifier: "default",
      windows: ["main"],
      permissions: [
        "core:default",
        "opener:allow-open-url",
        "updater:allow-check",
        "updater:allow-download-and-install",
        "fs:allow-read-text-file"
      ]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "permissions", "fs.toml"), "identifier = \"fs-scope\"\ndescription = \"allow scoped read\"\ncommands.allow = [\"read_text_file\"]\n");
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "Entitlements.plist"), "<plist><dict><key>com.apple.security.app-sandbox</key><true/><key>com.apple.security.cs.allow-jit</key><true/></dict></plist>\n");
    await fs.writeFile(path.join(sourceRoot, "electron", "main.js"), [
      "const { app, BrowserWindow, ipcMain, Menu, Tray, dialog, protocol, shell } = require('electron');",
      "const { autoUpdater } = require('electron-updater');",
      "let tray;",
      "function createWindow() {",
      "  tray = new Tray('icon.png');",
      "  const win = new BrowserWindow({ webPreferences: { preload: __dirname + '/preload.js', contextIsolation: true, sandbox: true }});",
      "  win.loadURL('app://index.html');",
      "  autoUpdater.checkForUpdatesAndNotify();",
      "  shell.openExternal('https://example.com');",
      "}",
      "app.whenReady().then(() => { protocol.registerFileProtocol('app', () => {}); Menu.setApplicationMenu(Menu.buildFromTemplate([])); createWindow(); });",
      "ipcMain.handle('dialog:open', () => dialog.showOpenDialog({}));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "electron", "preload.js"), [
      "const { contextBridge, ipcRenderer } = require('electron');",
      "contextBridge.exposeInMainWorld('desktopApi', { open: () => ipcRenderer.invoke('dialog:open') });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "wails.json"), JSON.stringify({
      name: "Desktop Demo",
      outputfilename: "desktop-demo",
      "frontend:install": "pnpm install",
      "frontend:build": "pnpm build",
      "frontend:dev:watcher": "pnpm dev",
      author: { name: "RepoTutor" }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "desktop", "README.md"), "Desktop deep-link protocol and file-associations notes for Tauri, Electron, and Wails packaging.\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "desktop.yml"), [
      "name: desktop",
      "on: [push]",
      "jobs:",
      "  build:",
      "    runs-on: macos-latest",
      "    steps:",
      "      - run: pnpm tauri info",
      "      - run: pnpm tauri build --bundles app,dmg,nsis,msi,appimage",
      "      - run: pnpm electron-builder --mac --win --linux",
      "      - run: wails build -platform darwin/universal,windows/amd64,linux/amd64",
      "      - run: echo TAURI_SIGNING_PRIVATE_KEY APPLE_ID APPLE_TEAM_ID codesign notarize createUpdaterArtifacts",
      "      - uses: actions/upload-artifact@v4",
      "      - uses: softprops/action-gh-release@v2"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "desktop-readiness-report.json"), "utf8")) as {
      desktopSetups: Array<{ filePath: string; framework: string; configCount: number; windowCount: number; commandCount: number; permissionCount: number; bundleCount: number; updaterCount: number; signingCount: number; platformCount: number; packageCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      permissionSignals: Array<{ signal: string; readiness: string }>;
      bundleSignals: Array<{ signal: string; readiness: string }>;
      releaseSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const tauriConfig = report.desktopSetups.find((item) => item.filePath === "src-tauri/tauri.conf.json");
    expect(report.desktopSetups.length).toBeGreaterThan(0);
    expect(tauriConfig?.framework).toBe("tauri");
    expect(tauriConfig?.configCount).toBeGreaterThan(0);
    expect(tauriConfig?.permissionCount).toBeGreaterThan(0);
    expect(tauriConfig?.bundleCount).toBeGreaterThan(0);
    expect(tauriConfig?.updaterCount).toBeGreaterThan(0);
    expect(tauriConfig?.signingCount).toBeGreaterThan(0);
    expect(report.desktopSetups.some((item) => item.framework === "electron" && item.commandCount > 0)).toBe(true);
    expect(report.desktopSetups.some((item) => item.framework === "wails" && item.configCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["tauri", "electron", "wails"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["tauri-conf", "wails-json", "electron-builder", "forge-config", "package-main", "cargo-manifest", "frontend-dist", "dev-url", "identifier"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["window", "tray", "menu", "dialog", "deep-link", "file-association", "custom-protocol", "ipc"]));
    expect(readySignals(report.permissionSignals)).toEqual(expect.arrayContaining(["tauri-capabilities", "permissions", "csp", "entitlements", "sandbox", "shell-open", "fs-scope", "global-tauri"]));
    expect(readySignals(report.bundleSignals)).toEqual(expect.arrayContaining(["bundle-targets", "icons", "resources", "macos", "windows", "linux", "dmg", "nsis", "appimage", "msi"]));
    expect(readySignals(report.releaseSignals)).toEqual(expect.arrayContaining(["updater", "updater-artifacts", "signing", "notarization", "hardened-runtime", "ci-build", "artifact-upload", "release-draft", "version-sync"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["tauri-cli", "tauri-api", "tauri-plugin", "electron", "electron-builder", "electron-forge", "electron-notarize", "wails", "wails-cli"]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "desktop-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "desktop-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "desktop-readiness.html"))).resolves.toBeUndefined();
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

  it("detects LLM eval readiness patterns without running eval tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-eval-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-eval-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "datasets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "evals", "registry", "data", "qa"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "evals", "registry", "evals"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prompts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "evals"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        eval: "promptfoo eval -c promptfooconfig.yaml --no-cache -o results/promptfoo.json",
        redteam: "promptfoo redteam eval -c promptfooconfig.redteam.yaml -o results/redteam.json",
        "eval:openai": "oaieval gpt-4.1-mini support_eval"
      },
      devDependencies: {
        "@langchain/openai": "latest",
        deepeval: "latest",
        langsmith: "latest",
        openevals: "latest",
        promptfoo: "latest",
        ragas: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"repotutor-llm-eval-fixture\"",
      "dependencies = [\"promptfoo\", \"openai-evals\", \"openevals\", \"langsmith\", \"deepeval\", \"ragas\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prompts", "support.txt"), [
      "Use the support policy and answer {{question}} with {{context}}.",
      "Include only facts from the provided policy."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "promptfooconfig.yaml"), [
      "prompts:",
      "  - file://prompts/support.txt",
      "  - |",
      "    messages:",
      "      - role: system",
      "        content: \"Answer with the supplied context only.\"",
      "      - role: user",
      "        content: \"{{question}}\"",
      "providers:",
      "  - openai:gpt-4.1-mini",
      "tests:",
      "  - vars:",
      "      question: \"Can I return a damaged product?\"",
      "      context: \"Customers can request a refund within 30 days.\"",
      "    expected: \"refund within 30 days\"",
      "    assert:",
      "      - type: contains",
      "        value: refund",
      "      - type: llm-rubric",
      "        value: \"Answer is faithful to the supplied context.\"",
      "        threshold: 0.8",
      "dataset:",
      "  path: file://datasets/eval.csv",
      "output: results/promptfoo.json",
      "few_shot_examples:",
      "  - input: \"What is the policy?\"",
      "    output: \"Use only supplied policy text.\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "promptfooconfig.redteam.yaml"), [
      "redteam:",
      "  purpose: \"Support bot safety coverage mapped to OWASP LLM risks\"",
      "  plugins:",
      "    - pii:api-db",
      "    - prompt-extraction",
      "    - excessive-agency",
      "  strategies:",
      "    - jailbreak",
      "    - prompt-injection",
      "  output: results/redteam.json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "evals", "registry", "evals", "support.yaml"), [
      "support_eval:",
      "  id: support.eval",
      "  metrics: [accuracy]",
      "  class: evals.elsuite.modelgraded.classify:ModelBasedClassify",
      "  args:",
      "    samples_jsonl: evals/registry/data/qa/samples.jsonl",
      "    eval_type: cot_classify",
      "    modelgraded_spec: evals/registry/evals/support-modelgraded.yaml",
      "    completion_fns:",
      "      - gpt-4.1-mini"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "evals", "registry", "evals", "support-modelgraded.yaml"), [
      "prompt: |",
      "  Grade correctness and hallucination risk for the answer.",
      "choice_scores:",
      "  pass: 1.0",
      "  fail: 0.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "evals", "registry", "data", "qa", "samples.jsonl"), [
      JSON.stringify({ input: [{ role: "user", content: "Can I get a refund?" }], ideal: "Customers can request a refund within 30 days." })
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "datasets", "eval.csv"), [
      "question,reference_output",
      "\"Can I return a damaged product?\",\"refund within 30 days\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "evals", "judge.ts"), [
      "import { createLLMAsJudge, CORRECTNESS_PROMPT, HALLUCINATION_PROMPT } from \"openevals\";",
      "const correctness = createLLMAsJudge({",
      "  prompt: CORRECTNESS_PROMPT,",
      "  model: \"openai:gpt-4.1-mini\",",
      "  feedbackKey: \"score\",",
      "  continuous: true,",
      "  choices: [0, 1],",
      "  few_shot_examples: [{ input: \"refund\", output: \"score: 1\" }]",
      "});",
      "const hallucination = createLLMAsJudge({ prompt: HALLUCINATION_PROMPT, feedbackKey: \"hallucination_score\" });",
      "export async function evaluate(outputs: string, referenceOutputs: string) {",
      "  const reference_outputs = [referenceOutputs];",
      "  return [await correctness({ outputs, reference_outputs, referenceOutputs }), await hallucination({ outputs, reference_outputs })];",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "evals.yml"), [
      "name: evals",
      "on:",
      "  pull_request:",
      "  workflow_dispatch:",
      "jobs:",
      "  eval:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}",
      "      LANGSMITH_API_KEY: ${{ secrets.LANGSMITH_API_KEY }}",
      "    steps:",
      "      - run: promptfoo eval -c promptfooconfig.yaml --no-cache -o results/promptfoo.json",
      "      - run: promptfoo redteam eval -c promptfooconfig.redteam.yaml -o results/redteam.json",
      "      - run: oaieval gpt-4.1-mini support_eval --record_path results/openai-evals.jsonl",
      "      - run: node -e \"client.evaluate(() => true, { projectName: 'support-eval' })\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-eval-readiness-report.json"), "utf8")) as {
      evalSetups: Array<{ filePath: string; framework: string; promptCount: number; providerCount: number; testCaseCount: number; assertionCount: number; datasetCount: number; judgeCount: number; redteamCount: number; outputCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      providerSignals: Array<{ signal: string; readiness: string }>;
      testCaseSignals: Array<{ signal: string; readiness: string }>;
      judgeSignals: Array<{ signal: string; readiness: string }>;
      datasetSignals: Array<{ signal: string; readiness: string }>;
      redteamSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const promptfooSetup = report.evalSetups.find((item) => item.filePath === "promptfooconfig.yaml");
    expect(report.evalSetups.length).toBeGreaterThan(0);
    expect(promptfooSetup?.framework).toBe("promptfoo");
    expect(promptfooSetup?.promptCount).toBeGreaterThan(0);
    expect(promptfooSetup?.providerCount).toBeGreaterThan(0);
    expect(promptfooSetup?.testCaseCount).toBeGreaterThan(0);
    expect(promptfooSetup?.assertionCount).toBeGreaterThan(0);
    expect(promptfooSetup?.datasetCount).toBeGreaterThan(0);
    expect(report.evalSetups.some((item) => item.framework === "openai-evals")).toBe(true);
    expect(report.evalSetups.some((item) => item.framework === "openevals")).toBe(true);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.configSignals, ["promptfoo-config", "eval-registry", "eval-class", "samples-jsonl", "pyproject", "package-script"]);
    expectReady(report.promptSignals, ["prompt", "prompt-file", "prompt-template", "vars", "messages", "few-shot"]);
    expectReady(report.providerSignals, ["provider", "model-name", "grader-model", "completion-fn", "api-key-env"]);
    expectReady(report.testCaseSignals, ["tests", "vars", "assert", "expected", "rubric", "threshold"]);
    expectReady(report.judgeSignals, ["llm-rubric", "modelgraded-spec", "llm-as-judge", "correctness", "hallucination", "feedback-key", "score"]);
    expectReady(report.datasetSignals, ["samples-jsonl", "dataset", "csv", "jsonl", "reference-output", "ideal"]);
    expectReady(report.redteamSignals, ["redteam", "plugins", "strategies", "jailbreak", "prompt-injection", "pii", "owasp"]);
    expectReady(report.workflowSignals, ["promptfoo-eval", "promptfoo-redteam", "oaieval", "evaluate", "ci", "report-output"]);
    expectReady(report.packageSignals, ["promptfoo", "openevals", "openai-evals", "langsmith", "deepeval", "ragas"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-eval-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-eval-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects LLM observability readiness patterns without contacting observability services", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-observability-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-observability-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "datasets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prompts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "observability"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "observe:llm": "tsx src/observability/phoenix.ts",
        "prompt:sync": "langfuse prompts pull"
      },
      dependencies: {
        "@arizeai/phoenix-client": "latest",
        "@arizeai/phoenix-evals": "latest",
        "@arizeai/phoenix-otel": "latest",
        "@helicone/helpers": "latest",
        "@langfuse/tracing": "latest",
        "@opentelemetry/auto-instrumentations-node": "latest",
        "@opentelemetry/exporter-trace-otlp-http": "latest",
        "@opentelemetry/sdk-trace-node": "latest",
        langfuse: "latest",
        openai: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "langfuse",
      "arize-phoenix-otel",
      "openinference-instrumentation-openai",
      "openinference-instrumentation-langchain",
      "opentelemetry-exporter-otlp"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "langfuse.py"), [
      "from langfuse import observe, get_client",
      "from langfuse.openai import openai",
      "from langfuse.decorators import langfuse_context",
      "from langfuse.callback import LangfuseCallbackHandler",
      "",
      "langfuse = get_client()",
      "callback_handler = LangfuseCallbackHandler()",
      "",
      "@observe(name=\"support-answer\")",
      "def answer(user_id: str, session_id: str, conversation_id: str, prompt: str):",
      "    langfuse_context.update_current_trace(",
      "        user_id=user_id,",
      "        session_id=session_id,",
      "        metadata={\"tenant\": \"acme\", \"conversation_id\": conversation_id, \"environment\": \"staging\"},",
      "        tags=[\"support\", \"rag\"],",
      "        release=\"2026.06\"",
      "    )",
      "    generation = openai.chat.completions.create(",
      "        model=\"gpt-4.1-mini\",",
      "        messages=[{\"role\": \"user\", \"content\": prompt}],",
      "        metadata={\"promptVersion\": \"support-v3\", \"promptTokens\": 42, \"completionTokens\": 12, \"totalTokens\": 54, \"cost\": 0.01, \"latency\": 120}",
      "    )",
      "    trace_id = langfuse_context.get_current_trace_id()",
      "    langfuse.score(name=\"helpfulness\", value=1, trace_id=trace_id)",
      "    langfuse.flush()",
      "    return generation, callback_handler"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "phoenix.ts"), [
      "import { register } from \"@arizeai/phoenix-otel\";",
      "import { OTLPTraceExporter } from \"@opentelemetry/exporter-trace-otlp-http\";",
      "import { NodeTracerProvider } from \"@opentelemetry/sdk-trace-node\";",
      "import { getNodeAutoInstrumentations } from \"@opentelemetry/auto-instrumentations-node\";",
      "import { registerInstrumentations } from \"@opentelemetry/instrumentation\";",
      "",
      "const provider = new NodeTracerProvider();",
      "const exporter = new OTLPTraceExporter({ url: process.env.PHOENIX_COLLECTOR_ENDPOINT });",
      "register({ projectName: \"support-agent\", endpoint: process.env.PHOENIX_COLLECTOR_ENDPOINT });",
      "registerInstrumentations({ instrumentations: [getNodeAutoInstrumentations()] });",
      "",
      "export const phoenixReadiness = {",
      "  provider,",
      "  exporter,",
      "  openInference: \"OpenInference instrumentation for OpenAI and LangChain\",",
      "  dataset: \"support-regression\",",
      "  experiment: \"prompt-v3-vs-v4\",",
      "  run_id: \"run-001\",",
      "  playground: \"prompt playground\",",
      "  benchmark: \"golden set\",",
      "  eval: \"quality score feedback link\",",
      "  span: \"retrieval-span\",",
      "  trace: \"support-trace\",",
      "  rootSpan: \"root span\",",
      "  childSpan: \"nested span\",",
      "  spanId: \"span_id\",",
      "  traceId: \"trace_id\"",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "helicone.ts"), [
      "import OpenAI from \"openai\";",
      "",
      "export const client = new OpenAI({",
      "  apiKey: process.env.OPENAI_API_KEY,",
      "  baseURL: \"https://ai-gateway.helicone.ai/v1\",",
      "  defaultHeaders: {",
      "    \"Helicone-Auth\": `Bearer ${process.env.HELICONE_API_KEY}`,",
      "    \"Helicone-User-Id\": \"user-123\",",
      "    \"Helicone-Session-Id\": \"session-456\",",
      "    \"Helicone-Property-Environment\": \"staging\",",
      "    \"Helicone-Cache-Enabled\": \"true\",",
      "    \"Helicone-Retry-Enabled\": \"true\",",
      "    \"Helicone-RateLimit-Policy\": \"support-tier\",",
      "    \"Helicone-Prompt-Id\": \"support-answer-v3\"",
      "  }",
      "});",
      "",
      "export const gatewayPolicy = \"provider routing with fallback retry and secondary provider\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prompts", "support-answer.prompt.md"), [
      "---",
      "langfuse_prompt: support-answer",
      "promptVersion: v3",
      "metadata:",
      "  redaction: pii-mask",
      "  prompt_tokens: tracked",
      "  completion_tokens: tracked",
      "  total_tokens: tracked",
      "  total_cost: tracked",
      "  quality: feedback",
      "  prompt_filter: enabled",
      "  telemetry_opt_out: TELEMETRY_ENABLED=false",
      "  data_retention: 30 days",
      "---",
      "Answer with citations and collect thumbs up/down user feedback after the response."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "datasets", "support-observability.csv"), [
      "input,expected,feedback,annotation,label",
      "\"How do I reset?\",\"Use settings\",positive,\"manual review\",quality"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".env.example"), [
      "TELEMETRY_ENABLED=false",
      "PII_MASKING=true",
      "TRACE_REDACTION=enabled",
      "PROMPT_FILTER=enabled",
      "TRACE_RETENTION_DAYS=30"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "llm-observability.yml"), [
      "name: llm-observability",
      "on:",
      "  pull_request:",
      "  workflow_dispatch:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"dashboard export self-host docker-compose helm Langfuse Phoenix Helicone OpenInference OpenTelemetry only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-observability-readiness-report.json"), "utf8")) as {
      observabilitySetups: Array<{ filePath: string; platform: string; traceCount: number; spanCount: number; generationCount: number; sessionCount: number; userCount: number; metadataCount: number; scoreCount: number; tokenCount: number; costCount: number; promptCount: number; feedbackCount: number }>;
      traceSignals: Array<{ signal: string; readiness: string }>;
      instrumentationSignals: Array<{ signal: string; readiness: string }>;
      identitySignals: Array<{ signal: string; readiness: string }>;
      llmMetricSignals: Array<{ signal: string; readiness: string }>;
      feedbackSignals: Array<{ signal: string; readiness: string }>;
      datasetExperimentSignals: Array<{ signal: string; readiness: string }>;
      gatewaySignals: Array<{ signal: string; readiness: string }>;
      privacySignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const langfuseSetup = report.observabilitySetups.find((item) => item.filePath === "src/observability/langfuse.py");
    expect(report.observabilitySetups.length).toBeGreaterThan(0);
    expect(langfuseSetup?.platform).toBe("langfuse");
    expect(langfuseSetup?.traceCount).toBeGreaterThan(0);
    expect(langfuseSetup?.generationCount).toBeGreaterThan(0);
    expect(langfuseSetup?.sessionCount).toBeGreaterThan(0);
    expect(langfuseSetup?.userCount).toBeGreaterThan(0);
    expect(langfuseSetup?.metadataCount).toBeGreaterThan(0);
    expect(langfuseSetup?.scoreCount).toBeGreaterThan(0);
    expect(langfuseSetup?.tokenCount).toBeGreaterThan(0);
    expect(langfuseSetup?.costCount).toBeGreaterThan(0);
    expect(report.observabilitySetups.some((item) => item.platform === "phoenix")).toBe(true);
    expect(report.observabilitySetups.some((item) => item.platform === "helicone")).toBe(true);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.traceSignals, ["trace", "span", "observation", "generation", "root-span", "nested-span", "trace-id", "span-id"]);
    expectReady(report.instrumentationSignals, ["observe-decorator", "openai-wrapper", "callback-handler", "openinference", "opentelemetry", "otel-exporter", "tracer-provider", "auto-instrumentation"]);
    expectReady(report.identitySignals, ["user-id", "session-id", "conversation-id", "release", "environment", "tags", "metadata"]);
    expectReady(report.llmMetricSignals, ["prompt-tokens", "completion-tokens", "total-tokens", "cost", "latency", "model-name", "provider", "cache"]);
    expectReady(report.feedbackSignals, ["score", "feedback", "annotation", "label", "manual-review", "thumbs-up-down", "quality"]);
    expectReady(report.datasetExperimentSignals, ["dataset", "experiment", "run", "prompt-version", "playground", "benchmark", "eval-link"]);
    expectReady(report.gatewaySignals, ["base-url", "helicone-auth", "request-header", "property-header", "rate-limit", "retry", "provider-routing", "fallback"]);
    expectReady(report.privacySignals, ["masking", "redaction", "pii", "prompt-filter", "telemetry-opt-out", "data-retention"]);
    expectReady(report.workflowSignals, ["export", "api-client", "dashboard", "self-host", "docker-compose", "helm", "ci"]);
    expectReady(report.packageSignals, ["langfuse", "phoenix", "arize-phoenix-otel", "openinference", "opentelemetry", "helicone"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-observability-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-observability-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects vector DB readiness patterns without running vector databases", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-vector-db-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-vector-db-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "vector:index": "tsx src/vector/qdrant.ts",
        "vector:query": "python src/vector/chroma.py",
        "vector:ops": "echo vector backup restore migration metrics"
      },
      dependencies: {
        "@pinecone-database/pinecone": "latest",
        "@qdrant/js-client-rest": "latest",
        chromadb: "latest",
        "weaviate-client": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "qdrant-client",
      "weaviate-client",
      "chromadb",
      "sentence-transformers",
      "faiss-cpu",
      "pgvector",
      "pymilvus"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "qdrant.ts"), [
      "import { QdrantClient } from \"@qdrant/js-client-rest\";",
      "",
      "const client = new QdrantClient({ url: process.env.QDRANT_URL, apiKey: process.env.QDRANT_API_KEY });",
      "await client.createCollection(\"docs\", {",
      "  vectors: { size: 1536, distance: \"Cosine\" },",
      "  hnsw_config: { m: 16, ef_construct: 100 },",
      "  quantization_config: { scalar: { type: \"int8\" } },",
      "  shard_number: 3,",
      "  replication_factor: 3,",
      "  write_consistency_factor: 2",
      "});",
      "await client.createPayloadIndex(\"docs\", { field_name: \"tenant\", field_schema: \"keyword\" });",
      "await client.upsert(\"docs\", {",
      "  wait: true,",
      "  points: [{ id: \"doc-1\", vector: [0.1, 0.2, 0.3], payload: { tenant: \"acme\", source: \"manual\", metadata: { filename: \"manual.md\" }, sparse_vectors: { bm25: [1, 3] } } }]",
      "});",
      "await client.search(\"docs\", {",
      "  vector: [0.1, 0.2, 0.3],",
      "  filter: { must: [{ key: \"tenant\", match: { value: \"acme\" } }] },",
      "  limit: 5,",
      "  with_payload: true,",
      "  score_threshold: 0.8,",
      "  consistency: \"quorum\"",
      "});",
      "await client.delete(\"docs\", { points: [\"doc-old\"] });",
      "await client.createSnapshot(\"docs\");",
      "export const searchNotes = \"vector similarity nearest neighbor ann score sparse vector BM25 multimodal CLIP image chunks RecursiveCharacterTextSplitter\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "weaviate.py"), [
      "import weaviate",
      "from weaviate.classes.config import Configure, DataType, Property",
      "",
      "client = weaviate.connect_to_local(headers={\"X-OpenAI-Api-Key\": \"env\"})",
      "articles = client.collections.create(",
      "    name=\"Article\",",
      "    vector_config=Configure.Vectors.text2vec_openai(model=\"text-embedding-3-small\"),",
      "    properties=[Property(name=\"title\", data_type=DataType.TEXT), Property(name=\"tenant\", data_type=DataType.TEXT)],",
      "    multi_tenancy_config=Configure.multi_tenancy(enabled=True),",
      "    replication_config=Configure.replication(factor=3)",
      ")",
      "batch_size = 100",
      "articles.data.insert(properties={\"title\": \"Vector DB\", \"tenant\": \"acme\", \"documents\": \"chunks\"}, vector=[0.1, 0.2, 0.3])",
      "results = articles.query.hybrid(query=\"policy\", where={\"path\": [\"tenant\"], \"operator\": \"Equal\", \"valueText\": \"acme\"}, limit=5)",
      "generated = articles.generate.near_text(query=\"database\", grouped_task=\"summarize with RAG\")",
      "rerank = \"rerank by cross-encoder after hybrid BM25 sparse vector search\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "chroma.py"), [
      "import chromadb",
      "from chromadb.utils import embedding_functions",
      "",
      "client = chromadb.PersistentClient(path=\"./chroma\")",
      "http_client = chromadb.HttpClient(host=\"localhost\", port=8000)",
      "embedding_function = embedding_functions.OpenAIEmbeddingFunction(model_name=\"text-embedding-3-small\", api_key=\"env\")",
      "collection = client.get_or_create_collection(name=\"docs\", metadata={\"hnsw:space\": \"cosine\"}, embedding_function=embedding_function)",
      "collection.add(ids=[\"1\"], documents=[\"policy chunk\"], metadatas=[{\"tenant\": \"acme\", \"source\": \"guide\"}])",
      "collection.upsert(ids=[\"2\"], documents=[\"second chunk\"], metadatas=[{\"tenant\": \"acme\"}], embeddings=[[0.1, 0.2, 0.3]])",
      "results = collection.query(query_texts=[\"policy\"], n_results=5, where={\"tenant\": \"acme\"}, where_document={\"$contains\": \"keyword\"}, include=[\"documents\", \"metadatas\", \"distances\"])",
      "collection.delete(ids=[\"stale\"])",
      "notes = \"full-text keyword sparse vector multimodal audio visual search text splitter chunks\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "ops.sql"), [
      "CREATE EXTENSION vector;",
      "CREATE TABLE documents (id text primary key, embedding vector(1536), metadata jsonb);",
      "CREATE INDEX documents_embedding_hnsw ON documents USING hnsw (embedding vector_cosine_ops);",
      "-- vector index migration backup restore health metrics ttl multi-tenancy replication sharding consistency pgvector"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "vector-db.yaml"), [
      "qdrant:",
      "  endpoint: ${QDRANT_URL}",
      "  health: /healthz",
      "  metrics: prometheus",
      "  backup: s3://vector-backups",
      "  restore: true",
      "  migration: reindex",
      "  ttl: 30d",
      "  tenant_key: tenant",
      "  replication_factor: 3",
      "  read_consistency: quorum",
      "  api_key_env: QDRANT_API_KEY"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "vector-db.yml"), [
      "name: vector-db",
      "on:",
      "  pull_request:",
      "  workflow_dispatch:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"Qdrant Weaviate Chroma Pinecone Milvus pgvector FAISS vector index backup restore metrics health migration ttl static only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      vectorSetups: Array<{ filePath: string; platform: string; collectionCount: number; embeddingCount: number; upsertCount: number; queryCount: number }>;
      collectionSignals: Array<{ signal: string; readiness: string }>;
      clientSignals: Array<{ signal: string; readiness: string }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      embeddingSignals: Array<{ signal: string; readiness: string }>;
      indexSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.vectorSetups.length).toBeGreaterThan(0);
    expect(report.vectorSetups.some((item) => item.platform === "qdrant")).toBe(true);
    expect(report.vectorSetups.some((item) => item.platform === "weaviate")).toBe(true);
    expect(report.vectorSetups.some((item) => item.platform === "chroma")).toBe(true);
    const qdrantSetup = report.vectorSetups.find((item) => item.filePath === "src/vector/qdrant.ts");
    expect(qdrantSetup?.collectionCount).toBeGreaterThan(0);
    expect(qdrantSetup?.embeddingCount).toBeGreaterThan(0);
    expect(qdrantSetup?.upsertCount).toBeGreaterThan(0);
    expect(qdrantSetup?.queryCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.collectionSignals, ["collection", "class", "schema", "vector-config", "distance", "dimensions", "hnsw"]);
    expectReady(report.clientSignals, ["qdrant-client", "weaviate-client", "chromadb-client", "http-client", "persistent-client", "api-key", "endpoint"]);
    expectReady(report.ingestionSignals, ["add", "upsert", "batch", "ids", "documents", "metadata", "payload", "delete"]);
    expectReady(report.querySignals, ["search", "query", "nearest-neighbor", "similarity", "hybrid", "full-text", "filter", "limit", "score"]);
    expectReady(report.embeddingSignals, ["embedding-function", "vectorizer", "model-provider", "precomputed-vector", "sparse-vector", "multimodal", "text-splitter"]);
    expectReady(report.indexSignals, ["hnsw", "quantization", "payload-index", "vector-index", "distance-metric", "shard", "replication", "consistency"]);
    expectReady(report.opsSignals, ["snapshot", "backup", "restore", "health", "metrics", "migration", "multi-tenancy", "ttl"]);
    expectReady(report.packageSignals, ["qdrant-client", "weaviate-client", "chromadb", "pinecone", "pymilvus", "pgvector", "faiss"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "vector-db-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "vector-db-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects search service readiness patterns without running search services", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-search-service-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-search-service-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "search"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "search:meili": "node src/search/meili.js",
        "search:typesense": "node src/search/typesense.js",
        "search:opensearch": "tsx src/search/opensearch.ts"
      },
      dependencies: {
        "@elastic/elasticsearch": "latest",
        "@elastic/react-search-ui": "latest",
        "@opensearch-project/opensearch": "latest",
        algoliasearch: "latest",
        "instantsearch.js": "latest",
        meilisearch: "latest",
        typesense: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "meilisearch",
      "typesense",
      "opensearch-py",
      "elasticsearch",
      "algoliasearch"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "search", "meili.js"), [
      "import { MeiliSearch } from \"meilisearch\";",
      "",
      "const client = new MeiliSearch({ host: process.env.MEILI_HOST, apiKey: process.env.MEILI_MASTER_KEY });",
      "const index = client.index(\"products\");",
      "await index.addDocuments([{ id: \"sku-1\", title: \"Desk\", category: \"office\", _geo: { lat: 37.5, lng: 127.0 } }], { primaryKey: \"id\" });",
      "await index.updateSearchableAttributes([\"title\", \"description\"]);",
      "await index.updateFilterableAttributes([\"category\", \"brand\", \"_geo\"]);",
      "await index.updateSortableAttributes([\"price\", \"updated_at\"]);",
      "await index.updateRankingRules([\"words\", \"typo\", \"proximity\", \"attribute\", \"sort\", \"exactness\"]);",
      "await index.updateSettings({ typoTolerance: { enabled: true }, pagination: { maxTotalHits: 1000 } });",
      "await index.updateSynonyms({ desk: [\"table\"] });",
      "await index.updateStopWords([\"the\", \"a\"]);",
      "await index.updateDistinctAttribute(\"sku\");",
      "const result = await index.search(\"desk\", { filter: \"category = office\", facets: [\"brand\"], sort: [\"price:asc\"], limit: 20, offset: 0, attributesToHighlight: [\"title\"], attributesToCrop: [\"description\"], showRankingScore: true });",
      "await index.deleteDocuments([\"sku-old\"]);",
      "await client.waitForTask(result.taskUid);",
      "await client.createDump();",
      "export const meiliNotes = \"tasks health dumps typo tolerance ranking rules synonyms stop words distinct geosearch semantic hybrid score\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "search", "typesense.js"), [
      "import Typesense from \"typesense\";",
      "",
      "const client = new Typesense.Client({",
      "  nodes: [{ host: process.env.TYPESENSE_HOST, port: 8108, protocol: \"https\" }],",
      "  apiKey: process.env.TYPESENSE_API_KEY,",
      "  connectionTimeoutSeconds: 2",
      "});",
      "await client.collections().create({",
      "  name: \"products\",",
      "  fields: [{ name: \"title\", type: \"string\" }, { name: \"category\", type: \"string\", facet: true }, { name: \"location\", type: \"geopoint\" }, { name: \"price\", type: \"float\" }],",
      "  default_sorting_field: \"price\"",
      "});",
      "await client.collections(\"products\").documents().import([{ id: \"sku-1\", title: \"Desk\", category: \"office\", price: 120 }], { action: \"upsert\", batch_size: 100 });",
      "const hits = await client.collections(\"products\").documents().search({ q: \"desk\", query_by: \"title,description\", filter_by: \"category:=office\", sort_by: \"price:asc\", facet_by: \"brand\", per_page: 20, page: 1, highlight_fields: \"title\", group_by: \"sku\" });",
      "await client.collections(\"products\").documents(\"sku-old\").delete();",
      "await client.aliases().upsert(\"products_read\", { collection_name: \"products\" });",
      "await client.keys().create({ description: \"scoped API keys\", actions: [\"documents:search\"], collections: [\"products\"] });",
      "const status = await client.health.retrieve();",
      "export const typesenseOps = \"synonyms aliases health metrics cluster replica analytics federated search curation scoped API keys semantic hybrid natural language search\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "search", "opensearch.ts"), [
      "import { Client } from \"@opensearch-project/opensearch\";",
      "",
      "const client = new Client({ node: process.env.OPENSEARCH_URL, auth: { username: \"admin\", password: process.env.OPENSEARCH_PASSWORD }, requestTimeout: 2000 });",
      "await client.indices.create({ index: \"products\", body: { settings: { number_of_shards: 3, number_of_replicas: 2 }, mappings: { properties: { title: { type: \"text\" }, category: { type: \"keyword\" }, location: { type: \"geo_point\" }, embedding: { type: \"knn_vector\", dimension: 384 } } } } });",
      "await client.bulk({ refresh: true, body: [{ index: { _index: \"products\", _id: \"sku-1\" } }, { title: \"Desk\", category: \"office\", location: { lat: 37.5, lon: 127.0 } }] });",
      "await client.search({ index: \"products\", body: { query: { bool: { must: [{ match: { title: \"desk\" } }], filter: [{ term: { category: \"office\" } }] } }, aggs: { brands: { terms: { field: \"brand\" } } }, highlight: { fields: { title: {} } }, size: 20, from: 0, sort: [{ _score: \"desc\" }, { price: \"asc\" }] } });",
      "await client.indices.delete({ index: \"old_products\" });",
      "await client.snapshot.create({ repository: \"s3_backup\", snapshot: \"products_001\" });",
      "await client.indices.putAlias({ index: \"products\", name: \"products_read\" });",
      "await client.cluster.health();",
      "await client.cat.indices({ format: \"json\" });",
      "export const opensearchNotes = \"semantic hybrid vector knn query_string multi_match bool score snapshot aliases replicas cluster analytics monitoring\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "search-service.yaml"), [
      "meilisearch:",
      "  api_key_env: MEILI_MASTER_KEY",
      "  hosts: [https://search.local]",
      "  tasks: true",
      "  health: /health",
      "  dumps: s3://search-dumps",
      "typesense:",
      "  nodes: [search-a, search-b]",
      "  aliases: products_read",
      "  analytics: true",
      "  cluster: raft",
      "opensearch:",
      "  snapshots: s3_backup",
      "  replicas: 2",
      "  index_aliases: products_read",
      "  timeout: 2000"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "search-service.yml"), [
      "name: search-service",
      "on:",
      "  pull_request:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"Meilisearch Typesense OpenSearch indexes collections schema mappings documents search filter_by facet_by ranking rules typo tolerance snapshots aliases replicas cluster analytics static only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "search-service-readiness-report.json"), "utf8")) as {
      searchSetups: Array<{ filePath: string; platform: string; indexCount: number; schemaCount: number; documentCount: number; queryCount: number; opsCount: number }>;
      indexSignals: Array<{ signal: string; readiness: string }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      relevanceSignals: Array<{ signal: string; readiness: string }>;
      clientSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.searchSetups.length).toBeGreaterThan(0);
    expect(report.searchSetups.some((item) => item.platform === "meilisearch")).toBe(true);
    expect(report.searchSetups.some((item) => item.platform === "typesense")).toBe(true);
    expect(report.searchSetups.some((item) => item.platform === "opensearch")).toBe(true);
    const meiliSetup = report.searchSetups.find((item) => item.filePath === "src/search/meili.js");
    expect(meiliSetup?.indexCount).toBeGreaterThan(0);
    expect(meiliSetup?.schemaCount).toBeGreaterThan(0);
    expect(meiliSetup?.documentCount).toBeGreaterThan(0);
    expect(meiliSetup?.queryCount).toBeGreaterThan(0);
    expect(meiliSetup?.opsCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.indexSignals, ["index", "collection", "schema", "mapping", "fields", "primary-key", "settings"]);
    expectReady(report.ingestionSignals, ["document", "add", "import", "bulk", "upsert", "batch", "delete", "refresh"]);
    expectReady(report.querySignals, ["search", "q", "query-by", "match", "bool", "filter", "sort", "facet", "pagination", "highlight", "score"]);
    expectReady(report.relevanceSignals, ["typo-tolerance", "ranking-rules", "searchable-attributes", "filterable-attributes", "sortable-attributes", "synonyms", "stop-words", "distinct", "geo", "semantic-hybrid"]);
    expectReady(report.clientSignals, ["meilisearch-client", "typesense-client", "opensearch-client", "host", "api-key", "nodes", "timeout"]);
    expectReady(report.opsSignals, ["tasks", "health", "dump", "snapshot", "alias", "replica", "cluster", "analytics"]);
    expectReady(report.packageSignals, ["meilisearch", "typesense", "opensearch", "elasticsearch", "algolia", "instantsearch", "search-ui"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "search-service-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "search-service-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects realtime collaboration readiness patterns without connecting providers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-realtime-collab-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-realtime-collab-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "collab"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "rooms"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        yjs: "latest",
        "y-websocket": "latest",
        "y-indexeddb": "latest",
        "@automerge/automerge": "latest",
        "@automerge/automerge-repo": "latest",
        "@liveblocks/client": "latest",
        "@liveblocks/react": "latest",
        "@liveblocks/yjs": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "docs", "collaboration.md"), [
      "# Collaboration",
      "The realtime collaboration layer is network agnostic, local-first, p2p capable, and supports offline editing.",
      "Rooms use permissions, tokens, userId, publicApiKey, initialPresence, and initialStorage boundaries."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "collab", "yjs.ts"), [
      "import * as Y from \"yjs\";",
      "import { WebsocketProvider } from \"y-websocket\";",
      "import { IndexeddbPersistence } from \"y-indexeddb\";",
      "",
      "const doc = new Y.Doc();",
      "const sharedText = doc.getText(\"body\");",
      "const sharedMap = doc.getMap(\"meta\");",
      "const sharedArray = doc.getArray(\"cards\");",
      "const provider = new WebsocketProvider(\"wss://collab.example\", \"room-1\", doc);",
      "new IndexeddbPersistence(\"room-1\", doc);",
      "provider.awareness.setLocalStateField(\"user\", { name: \"Ada\", avatar: \"ada.png\", cursor: { x: 1, y: 2 } });",
      "const undoManager = new Y.UndoManager([sharedText, sharedMap, sharedArray]);",
      "undoManager.undo();",
      "undoManager.redo();",
      "doc.transact(() => sharedText.insert(0, \"hello\"));",
      "sharedText.observe(() => undoManager.undoStack.length);",
      "const update = Y.encodeStateAsUpdate(doc);",
      "Y.applyUpdate(doc, update);",
      "Y.mergeUpdates([update]);",
      "localStorage.setItem(\"snapshot\", JSON.stringify(Array.from(update)));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "collab", "automerge.ts"), [
      "import * as Automerge from \"@automerge/automerge\";",
      "import { Repo, DocHandle } from \"@automerge/automerge-repo\";",
      "",
      "type Doc = { title?: string; cards: Array<Automerge.Text> };",
      "let local = Automerge.init<Doc>();",
      "local = Automerge.change(local, doc => { doc.title = \"Plan\"; doc.cards = [new Automerge.Text(\"one\")]; });",
      "const saved = Automerge.save(local);",
      "let remote = Automerge.load<Doc>(saved);",
      "remote = Automerge.change(remote, doc => { doc.cards.push(new Automerge.Text(\"two\")); });",
      "const merged = Automerge.merge(local, remote);",
      "Automerge.getConflicts(merged, \"title\");",
      "const heads = Automerge.getHeads(merged);",
      "const before = Automerge.view(merged, heads);",
      "const changes = Automerge.getChanges(before, merged);",
      "Automerge.applyChanges(remote, changes);",
      "Automerge.saveIncremental(merged);",
      "Automerge.loadIncremental(merged, new Uint8Array());",
      "const sync = Automerge.initSyncState();",
      "const [, message] = Automerge.generateSyncMessage(merged, sync);",
      "if (message) Automerge.receiveSyncMessage(merged, sync, message);",
      "const repo = new Repo({ storage: { storageRoot: \"./.automerge\" } as never });",
      "const handle: DocHandle<Doc> = repo.create<Doc>({ cards: [] });",
      "handle.on(\"change\", ({ patches }) => patches);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "rooms", "Room.tsx"), [
      "import { LiveblocksProvider, RoomProvider, useBroadcastEvent, useHistory, useMutation, useMyPresence, useOthers, useSelf, useThreads } from \"@liveblocks/react/suspense\";",
      "import { createClient } from \"@liveblocks/client\";",
      "import { getYjsProviderForRoom, LiveblocksYjsProvider } from \"@liveblocks/yjs\";",
      "",
      "const client = createClient({ publicApiKey: \"pk_test\", authEndpoint: \"/api/liveblocks-auth\" });",
      "const roomId = \"room-1\";",
      "const permissions = [\"room:read\", \"room:write\"];",
      "const token = \"test-token\";",
      "export function Providers({ children }: { children: React.ReactNode }) {",
      "  return <LiveblocksProvider client={client} authEndpoint=\"/api/liveblocks-auth\">{children}</LiveblocksProvider>;",
      "}",
      "export function Room() {",
      "  const others = useOthers();",
      "  const self = useSelf();",
      "  const [{ cursor }, updateMyPresence] = useMyPresence();",
      "  const broadcast = useBroadcastEvent();",
      "  const history = useHistory();",
      "  const { threads } = useThreads();",
      "  const mutation = useMutation(({ storage }) => {",
      "    storage.get(\"shapes\");",
      "    updateMyPresence({ cursor, userInfo: { name: self?.info?.name, avatar: \"ada.png\" } });",
      "    broadcast({ type: \"cursor\", cursor });",
      "    history.undo();",
      "    history.redo();",
      "  }, [cursor]);",
      "  const yjsProvider: LiveblocksYjsProvider = getYjsProviderForRoom({ id: roomId } as never);",
      "  return <RoomProvider id={roomId} initialPresence={{ cursor }} initialStorage={{ shapes: [] }}>{others.length + threads.length + permissions.length + token.length}</RoomProvider>;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "realtime-collaboration-readiness-report.json"), "utf8")) as {
      collaborationSetups: Array<{ filePath: string; platform: string; docCount: number; sharedTypeCount: number; providerCount: number; presenceCount: number; syncCount: number; persistenceCount: number; conflictCount: number; historyCount: number; authCount: number; commentsCount: number }>;
      crdtSignals: Array<{ signal: string; readiness: string }>;
      providerSignals: Array<{ signal: string; readiness: string }>;
      presenceSignals: Array<{ signal: string; readiness: string }>;
      syncSignals: Array<{ signal: string; readiness: string }>;
      persistenceSignals: Array<{ signal: string; readiness: string }>;
      historySignals: Array<{ signal: string; readiness: string }>;
      accessSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.collaborationSetups.length).toBeGreaterThan(0);
    expect(report.collaborationSetups.some((item) => item.platform === "yjs")).toBe(true);
    expect(report.collaborationSetups.some((item) => item.platform === "automerge")).toBe(true);
    expect(report.collaborationSetups.some((item) => item.platform === "liveblocks")).toBe(true);
    const yjsSetup = report.collaborationSetups.find((item) => item.filePath === "src/collab/yjs.ts");
    expect(yjsSetup?.docCount).toBeGreaterThan(0);
    expect(yjsSetup?.sharedTypeCount).toBeGreaterThan(0);
    expect(yjsSetup?.providerCount).toBeGreaterThan(0);
    expect(yjsSetup?.presenceCount).toBeGreaterThan(0);
    expect(yjsSetup?.syncCount).toBeGreaterThan(0);
    expect(yjsSetup?.persistenceCount).toBeGreaterThan(0);
    expect(yjsSetup?.historyCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.crdtSignals, ["y-doc", "shared-map", "shared-array", "shared-text", "automerge-doc", "change", "merge", "conflict", "transaction"]);
    expectReady(report.providerSignals, ["websocket-provider", "indexeddb-provider", "liveblocks-provider", "room-provider", "yjs-provider", "broadcast-channel", "network-agnostic", "custom-provider"]);
    expectReady(report.presenceSignals, ["awareness", "presence", "cursor", "avatars", "others", "self", "broadcast-event", "user-info"]);
    expectReady(report.syncSignals, ["encode-state", "apply-update", "sync-state", "sync-message", "save-load", "incremental-save", "heads", "patches"]);
    expectReady(report.persistenceSignals, ["indexeddb", "local-storage", "doc-handle", "repo", "save", "load", "storage-root", "snapshot"]);
    expectReady(report.historySignals, ["undo-manager", "undo", "redo", "history", "version", "heads", "patch-listener"]);
    expectReady(report.accessSignals, ["auth-endpoint", "public-api-key", "room-id", "permission", "initial-presence", "initial-storage", "user-id", "token"]);
    expectReady(report.packageSignals, ["yjs", "y-websocket", "y-indexeddb", "@automerge/automerge", "@automerge/automerge-repo", "@liveblocks/client", "@liveblocks/react", "@liveblocks/yjs"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "realtime-collaboration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "realtime-collaboration-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects workflow orchestration readiness patterns without executing jobs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-workflow-orchestration-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-workflow-orchestration-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "trigger:dev": "trigger.dev dev",
        "trigger:deploy": "trigger.dev deploy",
        "inngest:dev": "inngest-cli dev"
      },
      dependencies: {
        "@temporalio/workflow": "latest",
        "@temporalio/worker": "latest",
        "@temporalio/client": "latest",
        inngest: "latest",
        "@trigger.dev/sdk": "latest",
        "@trigger.dev/react": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "docs", "workflow.md"), [
      "Temporal workflows run activities through a task queue with retry, timeout, heartbeat, history, and continue as new recovery.",
      "Inngest durable functions use events, cron schedules, webhook endpoint handlers, step.run, step.sleep, waitForEvent, cancelOn, concurrency, throttling, debounce, rate limiting, prioritization, batching, state store, executor, runner, serve endpoint registration, and dashboard status.",
      "Trigger.dev tasks use schemaTask, schedules.task, wait.for, waitpoints, queues, retry, maxDuration, idempotencyKey, metadata, tags, logger, tracing, alerts, metrics, machine resources, environments, dev server, deploy, and isolated runtime checkpoint resume."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "workflows", "temporal.ts"), [
      "import { proxyActivities, defineSignal, defineQuery, sleep, continueAsNew } from \"@temporalio/workflow\";",
      "import { Worker } from \"@temporalio/worker\";",
      "import { Client } from \"@temporalio/client\";",
      "const activities = proxyActivities({ startToCloseTimeout: \"1 minute\", scheduleToCloseTimeout: \"5 minutes\", heartbeatTimeout: \"10 seconds\", retry: { maximumAttempts: 3 } });",
      "export const approveSignal = defineSignal<[string]>(\"approve\");",
      "export const statusQuery = defineQuery<string>(\"status\");",
      "export async function onboardingWorkflow(userId: string) {",
      "  await activities.sendWelcomeEmail(userId);",
      "  await sleep(\"1 day\");",
      "  return continueAsNew(userId);",
      "}",
      "export const worker = Worker.create({ workflowsPath: require.resolve(\"./temporal\"), activities, taskQueue: \"onboarding\", maxConcurrentActivityTaskExecutions: 10 });",
      "export const client = new Client({ namespace: \"default\" });",
      "client.workflow.start(onboardingWorkflow, { taskQueue: \"onboarding\", workflowId: \"user-onboarding\", args: [\"u1\"] });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "workflows", "inngest.ts"), [
      "import { Inngest } from \"inngest\";",
      "export const inngest = new Inngest({ id: \"app\" });",
      "export const importProduct = inngest.createFunction(",
      "  { id: \"import-product\", retries: 3, concurrency: { limit: 2, key: \"event.data.userId\" }, throttle: { limit: 1, period: \"1m\" }, debounce: { period: \"5s\" }, rateLimit: { limit: 10, period: \"1m\" }, priority: { run: \"event.data.priority\" }, cancelOn: [{ event: \"product/cancel\" }] },",
      "  { event: \"shop/product.imported\" },",
      "  async ({ event, step }) => {",
      "    await step.run(\"copy-images\", async () => event.data.imageURLs);",
      "    await step.sleep(\"wait-for-review\", \"1h\");",
      "    await step.waitForEvent(\"approval\", { event: \"product/approved\", if: \"async.data.id == event.data.id\" });",
      "    await step.invoke(\"resize-images\", { function: importProduct, data: event.data });",
      "  }",
      ");",
      "inngest.send({ name: \"shop/product.imported\", data: { userId: \"u1\" } });",
      "serve({ client: inngest, functions: [importProduct] });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "workflows", "trigger.ts"), [
      "import { AbortTaskRunError, logger, metadata, schedules, schemaTask, task, tasks, wait } from \"@trigger.dev/sdk\";",
      "export const videoTask = task({",
      "  id: \"convert-video\",",
      "  retry: { maxAttempts: 3 },",
      "  queue: { concurrencyLimit: 1 },",
      "  maxDuration: 3600,",
      "  machine: \"large-1x\",",
      "  run: async (payload: { videoId: string }) => {",
      "    metadata.set(\"videoId\", payload.videoId);",
      "    logger.info(\"Video task started\", { tags: [\"video\"] });",
      "    await wait.for({ seconds: 30 });",
      "    await tasks.trigger(\"child-task\", payload, { idempotencyKey: payload.videoId });",
      "    await tasks.batchTrigger([{ payload }]);",
      "    throw new AbortTaskRunError(\"manual cancel\");",
      "  }",
      "});",
      "export const nightlySchedule = schedules.task({ id: \"nightly\", cron: \"0 0 * * *\", run: async () => videoTask.trigger({ videoId: \"v1\" }) });",
      "export const typedTask = schemaTask({ id: \"typed\", schema: {}, run: async () => ({ ok: true }) });"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "workflow-orchestration-readiness-report.json"), "utf8")) as {
      workflowSetups: Array<{ filePath: string; platform: string; workflowCount: number; eventCount: number; scheduleCount: number; stepCount: number; activityCount: number; queueCount: number; retryCount: number; timeoutCount: number; waitCount: number; cancelCount: number; concurrencyCount: number; stateCount: number; observabilityCount: number }>;
      triggerSignals: Array<{ signal: string; readiness: string }>;
      executionSignals: Array<{ signal: string; readiness: string }>;
      durabilitySignals: Array<{ signal: string; readiness: string }>;
      flowSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.workflowSetups.length).toBeGreaterThan(0);
    expect(report.workflowSetups.some((item) => item.platform === "temporal")).toBe(true);
    expect(report.workflowSetups.some((item) => item.platform === "inngest")).toBe(true);
    expect(report.workflowSetups.some((item) => item.platform === "triggerdotdev")).toBe(true);
    const temporalSetup = report.workflowSetups.find((item) => item.filePath === "src/workflows/temporal.ts");
    const inngestSetup = report.workflowSetups.find((item) => item.filePath === "src/workflows/inngest.ts");
    const triggerSetup = report.workflowSetups.find((item) => item.filePath === "src/workflows/trigger.ts");
    expect(temporalSetup?.workflowCount).toBeGreaterThan(0);
    expect(temporalSetup?.activityCount).toBeGreaterThan(0);
    expect(temporalSetup?.queueCount).toBeGreaterThan(0);
    expect(temporalSetup?.retryCount).toBeGreaterThan(0);
    expect(temporalSetup?.timeoutCount).toBeGreaterThan(0);
    expect(inngestSetup?.eventCount).toBeGreaterThan(0);
    expect(inngestSetup?.stepCount).toBeGreaterThan(0);
    expect(inngestSetup?.waitCount).toBeGreaterThan(0);
    expect(inngestSetup?.cancelCount).toBeGreaterThan(0);
    expect(inngestSetup?.concurrencyCount).toBeGreaterThan(0);
    expect(triggerSetup?.scheduleCount).toBeGreaterThan(0);
    expect(triggerSetup?.waitCount).toBeGreaterThan(0);
    expect(triggerSetup?.stateCount).toBeGreaterThan(0);
    expect(triggerSetup?.observabilityCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.triggerSignals, ["event", "cron", "schedule", "webhook", "manual", "api-trigger", "child-trigger"]);
    expectReady(report.executionSignals, ["task", "workflow", "activity", "step", "worker", "task-queue", "function-run", "handler"]);
    expectReady(report.durabilitySignals, ["retry", "timeout", "heartbeat", "checkpoint", "state-store", "resume", "history", "continue-as-new", "idempotency"]);
    expectReady(report.flowSignals, ["wait", "sleep", "wait-for-event", "cancel", "batch", "concurrency", "rate-limit", "throttle", "priority", "child-workflow"]);
    expectReady(report.runtimeSignals, ["dev-server", "deploy", "worker-pool", "isolated-runtime", "machine", "environment", "serve", "dashboard"]);
    expectReady(report.observabilitySignals, ["logger", "tracing", "metadata", "tags", "run-status", "dashboard", "alerts", "metrics"]);
    expectReady(report.packageSignals, ["@temporalio/workflow", "@temporalio/worker", "@temporalio/client", "inngest", "@trigger.dev/sdk", "@trigger.dev/react"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "workflow-orchestration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "workflow-orchestration-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects OpenAPI client generation readiness patterns without running generators", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-openapi-client-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-openapi-client-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "openapi"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "generated"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "client"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "gen:types": "openapi-typescript ./openapi/petstore.yaml --output src/generated/petstore.d.ts",
        "gen:orval": "orval --config orval.config.ts --output src/generated",
        "gen:server": "openapi-generator-cli generate -i ./openapi/admin.yaml -g typescript-fetch -o src/generated/admin",
        "gen:swagger": "swagger-codegen generate -i ./openapi/admin.yaml -l typescript-angular -o src/generated/angular",
        "lint:openapi": "redocly lint openapi/petstore.yaml",
        "validate:openapi": "openapi-generator validate -i openapi/admin.yaml",
        "test:snapshots": "vitest run src/generated --update-snapshots",
        typecheck: "tsc --noEmit"
      },
      dependencies: {
        "openapi-fetch": "latest",
        axios: "latest",
        "@tanstack/react-query": "latest",
        swr: "latest",
        zod: "latest",
        msw: "latest",
        hono: "latest"
      },
      devDependencies: {
        "openapi-typescript": "latest",
        orval: "latest",
        "@openapitools/openapi-generator-cli": "latest",
        "openapi-generator-cli": "latest",
        "swagger-codegen": "latest",
        "@hey-api/openapi-ts": "latest",
        "@redocly/cli": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "openapi", "petstore.yaml"), [
      "openapi: 3.1.0",
      "info:",
      "  title: Petstore",
      "  version: 1.0.0",
      "paths:",
      "  /pets:",
      "    get:",
      "      operationId: listPets",
      "      responses:",
      "        '200':",
      "          description: ok",
      "          content:",
      "            application/json:",
      "              schema:",
      "                type: array",
      "                items:",
      "                  $ref: '#/components/schemas/Pet'",
      "    post:",
      "      operationId: createPet",
      "      requestBody:",
      "        content:",
      "          application/json:",
      "            schema:",
      "              $ref: '#/components/schemas/Pet'",
      "      responses:",
      "        '201':",
      "          description: created",
      "components:",
      "  schemas:",
      "    Pet:",
      "      type: object",
      "      required: [id, name]",
      "      properties:",
      "        id:",
      "          type: string",
      "        name:",
      "          type: string"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "openapi", "admin.yaml"), [
      "swagger: '2.0'",
      "info:",
      "  title: Admin",
      "  version: 1.0.0",
      "paths:",
      "  /admin/users:",
      "    get:",
      "      operationId: listAdminUsers",
      "      responses:",
      "        '200':",
      "          description: ok"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "redocly.yaml"), [
      "apis:",
      "  petstore:",
      "    root: ./openapi/petstore.yaml",
      "  admin:",
      "    root: ./openapi/admin.yaml",
      "extends:",
      "  - recommended"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "orval.config.ts"), [
      "import { defineConfig } from 'orval';",
      "export default defineConfig({",
      "  petstore: {",
      "    input: { target: './openapi/petstore.yaml', validation: true },",
      "    output: {",
      "      target: 'src/generated/petstore.ts',",
      "      schemas: 'src/generated/schemas',",
      "      client: 'react-query',",
      "      mock: true,",
      "      mode: 'tags-split',",
      "      override: {",
      "        mutator: { path: 'src/client/mutator.ts', name: 'customClient' },",
      "        zod: { generate: true }",
      "      }",
      "    }",
      "  },",
      "  admin: {",
      "    input: { target: 'https://example.com/api-docs/openapi.json' },",
      "    output: { target: 'src/generated/admin.ts', client: 'swr', mock: true }",
      "  }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "openapi-generator-config.json"), JSON.stringify({
      inputSpec: "./openapi/admin.yaml",
      generatorName: "typescript-nestjs",
      outputDir: "src/generated/admin-server",
      additionalProperties: {
        apiPackage: "admin.api",
        modelPackage: "admin.models",
        npmName: "@example/admin-sdk"
      },
      globalProperties: {
        apis: "",
        models: "",
        supportingFiles: ""
      },
      templateDir: "./templates/openapi"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".openapi-generator-ignore"), [
      "# generated output ignore file",
      "src/generated/admin-server/README.md",
      "src/generated/admin-server/.openapi-generator/**"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "openapi-client.yml"), [
      "name: openapi-client",
      "on: [pull_request, workflow_dispatch]",
      "jobs:",
      "  generated-client:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm lint:openapi",
      "      - run: pnpm gen:types && pnpm gen:orval && pnpm gen:server",
      "      - run: git diff --exit-code src/generated",
      "      - run: pnpm test:snapshots",
      "      - run: pnpm typecheck"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "client", "mutator.ts"), [
      "export async function customClient(url: string, init: RequestInit = {}) {",
      "  return fetch(url, { ...init, headers: { ...init.headers, Authorization: 'Bearer test-token' } });",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "generated", "client.ts"), [
      "// do not edit - generated diff snapshots validate generated output",
      "import createClient from 'openapi-fetch';",
      "import axios from 'axios';",
      "import useSWR from 'swr';",
      "import { useQuery, useMutation } from '@tanstack/react-query';",
      "import { http } from 'msw';",
      "import { z } from 'zod';",
      "export interface Pet { id: string; name: string }",
      "export type paths = { '/pets': { get: { responses: { 200: { content: { 'application/json': Pet[] } } } } } };",
      "export const client = createClient<paths>({ baseUrl: '/api' });",
      "export const petSchema = z.object({ id: z.string(), name: z.string() });",
      "export const handlers = [http.get('/pets', () => Response.json([]))];",
      "export function usePets() { return useQuery({ queryKey: ['pets'], queryFn: () => fetch('/pets').then((r) => r.json()) }); }",
      "export function useCreatePet() { return useMutation({ mutationFn: (pet: Pet) => axios.post('/pets', pet) }); }",
      "export function usePetsSWR() { return useSWR('/pets', (url) => fetch(url).then((r) => r.json())); }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "openapi-client.md"), [
      "OpenAPI client projects generate TypeScript SDKs, docs, html2 markdown documentation, server stub output, and schema output from multiple specs.",
      "projects: petstore admin public internal specs: ./openapi/petstore.yaml ./openapi/admin.yaml",
      "Runtime coverage includes Angular HttpClient, Vue Query, Svelte Query, Hono, MCP Model Context Protocol, native fetch, Axios, React Query, and SWR.",
      "Security review: review untrusted source specs, code injection risks, custom template review, and templateDir changes before running generators."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "openapi-client-readiness-report.json"), "utf8")) as {
      clientSetups: Array<{ filePath: string; generator: string; specCount: number; outputCount: number; clientCount: number; typeCount: number; hookCount: number; mockCount: number; validationCount: number; configCount: number; scriptCount: number; packageCount: number }>;
      specSignals: Array<{ signal: string; readiness: string }>;
      generatorSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      qualitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.clientSetups.length).toBeGreaterThan(0);
    expect(report.clientSetups.some((item) => item.generator === "openapi-typescript")).toBe(true);
    expect(report.clientSetups.some((item) => item.generator === "orval")).toBe(true);
    expect(report.clientSetups.some((item) => item.generator === "openapi-generator")).toBe(true);
    const packageSetup = report.clientSetups.find((item) => item.filePath === "package.json");
    const orvalSetup = report.clientSetups.find((item) => item.filePath === "orval.config.ts");
    const generatedSetup = report.clientSetups.find((item) => item.filePath === "src/generated/client.ts");
    expect(packageSetup?.scriptCount).toBeGreaterThan(0);
    expect(packageSetup?.packageCount).toBeGreaterThan(0);
    expect(orvalSetup?.specCount).toBeGreaterThan(0);
    expect(orvalSetup?.outputCount).toBeGreaterThan(0);
    expect(orvalSetup?.configCount).toBeGreaterThan(0);
    expect(generatedSetup?.clientCount).toBeGreaterThan(0);
    expect(generatedSetup?.typeCount).toBeGreaterThan(0);
    expect(generatedSetup?.hookCount).toBeGreaterThan(0);
    expect(generatedSetup?.mockCount).toBeGreaterThan(0);
    expect(generatedSetup?.validationCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.specSignals, ["openapi", "swagger", "input-spec", "remote-schema", "multi-spec", "redocly-config", "schema-validation"]);
    expectReady(report.generatorSignals, ["openapi-typescript", "openapi-fetch", "orval", "openapi-generator", "swagger-codegen", "generator-name", "config-file", "cli-command"]);
    expectReady(report.outputSignals, ["types", "client-sdk", "hooks", "schemas", "mocks", "zod", "msw", "server-stub", "docs", "split-output"]);
    expectReady(report.runtimeSignals, ["fetch", "axios", "react-query", "swr", "angular", "vue", "svelte", "hono", "mcp", "custom-mutator"]);
    expectReady(report.qualitySignals, ["validate-spec", "lint", "snapshots", "generated-diff", "typecheck", "ci", "ignore-file", "templates", "security-review"]);
    expectReady(report.packageSignals, ["openapi-typescript", "openapi-fetch", "orval", "@openapitools/openapi-generator-cli", "openapi-generator-cli", "swagger-codegen", "@hey-api/openapi-ts"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "openapi-client-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "openapi-client-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects webhook readiness patterns without receiving webhooks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-webhook-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-webhook-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "webhooks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "app", "api", "webhooks", "github"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "webhook:listen": "hookdeck listen 3000 stripe --path /webhooks/stripe --filter-headers '{\"x-stripe-signature\":{\"$exist\":true}}'",
        "webhook:events": "hookdeck gateway event list --status FAILED",
        "webhook:attempts": "hookdeck gateway attempt list --event-id evt_abc123"
      },
      dependencies: {
        svix: "latest",
        standardwebhooks: "latest",
        stripe: "latest",
        "@octokit/webhooks": "latest",
        express: "latest",
        next: "latest"
      },
      devDependencies: {
        "hookdeck-cli": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "webhooks", "svix.ts"), [
      "import { Webhook } from 'svix';",
      "const endpoint = new Webhook('whsec_test_secret');",
      "const signingKey = 'whsk_test_private';",
      "const publicKey = 'whpk_test_public';",
      "export function verifySvix(rawBody: string, headers: Record<string, string>) {",
      "  return endpoint.verify(rawBody, headers);",
      "}",
      "export const svixNotes = `${signingKey} ${publicKey} secret rotation asymmetric public key private key`;".replaceAll("`", "'")
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "webhooks", "standard.ts"), [
      "import { Webhook } from 'standardwebhooks';",
      "const webhook = new Webhook('standard_signing_secret');",
      "export function verifyStandard(rawBody: string, headers: Record<string, string>) {",
      "  const id = headers['webhook-id'];",
      "  const timestamp = headers['webhook-timestamp'];",
      "  const signature = headers['webhook-signature'];",
      "  return webhook.verify(rawBody, { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': signature });",
      "}",
      "export const standardNotes = 'ed25519 v1a asymmetric signature timestamp tolerance replay raw request body';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "webhooks", "stripe.ts"), [
      "import crypto from 'node:crypto';",
      "import express from 'express';",
      "import Stripe from 'stripe';",
      "import Redis from 'ioredis';",
      "const app = express();",
      "const stripe = new Stripe('sk_test');",
      "const redis = new Redis();",
      "app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (request, response) => {",
      "  const rawBody = request.body;",
      "  const signature = request.headers['x-stripe-signature'];",
      "  const hmac = crypto.createHmac('sha256', 'signing secret').update(rawBody).digest();",
      "  crypto.timingSafeEqual(hmac, Buffer.from(String(signature ?? ''), 'utf8'));",
      "  const event = stripe.webhooks.constructEvent(rawBody, signature as string, 'endpoint_secret');",
      "  await redis.setnx(`processed_events:${event.id}`, '1');",
      "  const idempotencyKey = request.headers['idempotency-key'];",
      "  const retry = 'retry schedule uses exponential backoff and jitter for delivery attempt recovery';",
      "  const replay = 'manual replay supported; dead-letter DLQ stores failed queue events; disable endpoint with 410 Gone';",
      "  const responseCodes = '2xx success 4xx bad request 5xx retry status code timeout after 15s';",
      "  const eventTypes = 'event types invoice.paid user.created eventTypes filter subscription source destination connection fan-out';",
      "  const security = 'HTTPS https://example.com/webhooks/stripe SSRF allowlist static IP constant time raw body secret rotation untrusted';",
      "  response.status(200).json({ ok: true, retry, replay, responseCodes, eventTypes, security, idempotencyKey });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "app", "api", "webhooks", "github", "route.ts"), [
      "import { Webhooks } from '@octokit/webhooks';",
      "import { NextRequest } from 'next/server';",
      "const webhooks = new Webhooks({ secret: 'github_secret' });",
      "export async function POST(request: NextRequest) {",
      "  const rawBody = await request.text();",
      "  const signature = request.headers.get('x-hub-signature-256');",
      "  const delivery = request.headers.get('X-GitHub-Delivery');",
      "  await webhooks.verify(rawBody, signature ?? '');",
      "  return Response.json({ delivery, signature });",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "webhooks.md"), [
      "# Webhooks",
      "Hookdeck listen forwards events to localhost: hookdeck listen 3000 stripe --path /webhooks/stripe.",
      "Hookdeck gateway source and destination create a connection; fan-out sends one source to multiple destinations.",
      "Filters use filter-body and filter-headers for event filter rules before delivery.",
      "The dashboard shows event history, request log, attempt log, attempt details, failure rate, metrics, issues, alerts, and aggregate metrics.",
      "Operators run hookdeck gateway event list --status FAILED and hookdeck gateway attempt list for delivery attempts.",
      "Failed events can be manual replay requests, replayed from event history, and inspected through MCP Model Context Protocol.",
      "The local CLI listener can forward events to localhost during local development."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "webhook-readiness-report.json"), "utf8")) as {
      webhookSetups: Array<{ filePath: string; provider: string; endpointCount: number; signatureCount: number; replayCount: number; idempotencyCount: number; retryCount: number; deliveryCount: number; eventTypeCount: number; localDebugCount: number; observabilityCount: number; securityCount: number }>;
      endpointSignals: Array<{ signal: string; readiness: string }>;
      signatureSignals: Array<{ signal: string; readiness: string }>;
      reliabilitySignals: Array<{ signal: string; readiness: string }>;
      operationsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.webhookSetups.length).toBeGreaterThan(0);
    expect(report.webhookSetups.some((item) => item.provider === "svix")).toBe(true);
    expect(report.webhookSetups.some((item) => item.provider === "standard-webhooks")).toBe(true);
    expect(report.webhookSetups.some((item) => item.provider === "hookdeck")).toBe(true);
    expect(report.webhookSetups.some((item) => item.provider === "stripe")).toBe(true);
    expect(report.webhookSetups.some((item) => item.provider === "github")).toBe(true);
    const stripeSetup = report.webhookSetups.find((item) => item.filePath === "src/webhooks/stripe.ts");
    const hookdeckSetup = report.webhookSetups.find((item) => item.filePath === "docs/webhooks.md");
    expect(stripeSetup?.endpointCount).toBeGreaterThan(0);
    expect(stripeSetup?.signatureCount).toBeGreaterThan(0);
    expect(stripeSetup?.idempotencyCount).toBeGreaterThan(0);
    expect(stripeSetup?.retryCount).toBeGreaterThan(0);
    expect(stripeSetup?.deliveryCount).toBeGreaterThan(0);
    expect(stripeSetup?.securityCount).toBeGreaterThan(0);
    expect(hookdeckSetup?.localDebugCount).toBeGreaterThan(0);
    expect(hookdeckSetup?.observabilityCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.endpointSignals, ["endpoint", "route", "source", "destination", "connection", "fan-out", "event-filter", "https", "status-code", "timeout"]);
    expectReady(report.signatureSignals, ["webhook-id", "webhook-timestamp", "webhook-signature", "hmac", "ed25519", "secret-prefix", "constant-time", "raw-body", "rotation", "asymmetric"]);
    expectReady(report.reliabilitySignals, ["retry", "retry-schedule", "backoff", "jitter", "delivery-attempt", "manual-replay", "idempotency", "dedupe-store", "disable-endpoint", "dead-letter"]);
    expectReady(report.operationsSignals, ["dashboard", "event-history", "request-log", "attempt-log", "failure-rate", "metrics", "issues", "alerts", "mcp", "cli-listen"]);
    expectReady(report.packageSignals, ["svix", "standardwebhooks", "hookdeck-cli", "stripe", "@octokit/webhooks", "express", "next-server"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "webhook-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "webhook-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects notification readiness patterns without sending notifications", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-notification-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-notification-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "notifications"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "components"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "notifications:check": "rg \"@novu|subscriberId|preferences|delivery log\" src docs"
      },
      dependencies: {
        "@novu/node": "latest",
        "@novu/js": "latest",
        "@novu/react": "latest",
        "@knocklabs/node": "latest",
        "@magicbell/react": "latest",
        "firebase-admin": "latest",
        "onesignal-node": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "notifications", "novu.ts"), [
      "import { Novu } from '@novu/node';",
      "import { novu } from '@novu/js';",
      "const client = new Novu(process.env.NOVU_API_KEY ?? 'test_key');",
      "export async function triggerInvoiceWorkflow(user: { id: string; email: string; firstName: string }, organizationId: string) {",
      "  const payload = { invoiceId: 'inv_123', variables: { total: '$10' }, firstName: user.firstName, email: user.email };",
      "  await client.subscribers.identify(user.id, { email: user.email, firstName: user.firstName, profile: { plan: 'pro' } });",
      "  await client.topics.create({ key: 'billing-topic', name: 'Billing topic' });",
      "  await client.topics.addSubscribers('billing-topic', { subscribers: [user.id] });",
      "  await client.trigger('invoice-paid-workflow', { to: { subscriberId: user.id }, payload, tenant: organizationId, tenantId: organizationId });",
      "  return novu.notifications.list({ subscriberId: user.id });",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "components", "notification-inbox.tsx"), [
      "import { Inbox, NovuProvider, PreferenceLevel, WorkflowCriticalityEnum, useNovu } from '@novu/react';",
      "export function NotificationInbox() {",
      "  const { preferences, createSubscription, removeSubscription } = useNovu();",
      "  const channels = 'Inbox in-app notification center email SMS push chat Slack Microsoft Teams Telegram WhatsApp';",
      "  const settings = `${PreferenceLevel.TEMPLATE} ${WorkflowCriticalityEnum.CRITICAL} opt-in opt-out unsubscribe subscription controls`;",
      "  void preferences;",
      "  void createSubscription;",
      "  void removeSubscription;",
      "  return <NovuProvider applicationIdentifier=\"app_id\" subscriberId=\"user_123\" subscriberHash=\"hash\"><Inbox />{channels}{settings}</NovuProvider>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "notifications.md"), [
      "# Notification workflow",
      "Novu workflows trigger subscriberId subscribers topics subscriptions preferences through one notification workflow.",
      "The workflow uses step.email, step.inbox, digest batching, delay scheduling, wait rules, branch conditions, payload variables, tenant routing, and a conversation thread for inbound message replies.",
      "Audience coverage includes subscriber profile, user profile, topic subscription, segments, groups, tenantId, organizationId, subscribe, unsubscribe, opt-in, and opt-out controls.",
      "Channel coverage includes Inbox, in-app, email, SMS, push notification, chat, Slack, Teams, Telegram, WhatsApp, and Discord providers.",
      "Template coverage includes template subject title body content editor no-code email editor variables payload localization i18n branding theme logo preview test send sandbox dry-run.",
      "Operations coverage includes NOVU_API_KEY environment staging production baseURL webhook callback delivery log activity feed delivery status logs rate limit 429 retry retries backoff analytics metrics dashboard admin panel portal failure.",
      "Package comparison notes mention @knocklabs/node, @magicbell/react, firebase-admin admin.messaging, OneSignal onesignal-node, and a custom notification sender."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "notification-readiness-report.json"), "utf8")) as {
      notificationSetups: Array<{ filePath: string; provider: string; workflowCount: number; triggerCount: number; subscriberCount: number; topicCount: number; preferenceCount: number; channelCount: number; inboxCount: number; templateCount: number; credentialCount: number; observabilityCount: number }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      audienceSignals: Array<{ signal: string; readiness: string }>;
      channelSignals: Array<{ signal: string; readiness: string }>;
      templateSignals: Array<{ signal: string; readiness: string }>;
      operationsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.notificationSetups.length).toBeGreaterThan(0);
    expect(report.notificationSetups.some((item) => item.provider === "novu")).toBe(true);
    const novuSetup = report.notificationSetups.find((item) => item.filePath === "src/notifications/novu.ts");
    const docsSetup = report.notificationSetups.find((item) => item.filePath === "docs/notifications.md");
    expect(novuSetup?.workflowCount).toBeGreaterThan(0);
    expect(novuSetup?.triggerCount).toBeGreaterThan(0);
    expect(novuSetup?.subscriberCount).toBeGreaterThan(0);
    expect(novuSetup?.topicCount).toBeGreaterThan(0);
    expect(docsSetup?.preferenceCount).toBeGreaterThan(0);
    expect(docsSetup?.channelCount).toBeGreaterThan(0);
    expect(docsSetup?.templateCount).toBeGreaterThan(0);
    expect(docsSetup?.credentialCount).toBeGreaterThan(0);
    expect(docsSetup?.observabilityCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.workflowSignals, ["workflow", "trigger", "step", "digest", "delay", "condition", "payload", "tenant", "conversation"]);
    expectReady(report.audienceSignals, ["subscriber", "subscriber-id", "topic", "subscription", "preferences", "segments", "user-profile", "tenant"]);
    expectReady(report.channelSignals, ["inbox", "email", "sms", "push", "chat", "slack", "teams", "telegram", "whatsapp"]);
    expectReady(report.templateSignals, ["template", "subject", "body", "editor", "variables", "localization", "branding", "preview"]);
    expectReady(report.operationsSignals, ["api-key", "environment", "webhook", "delivery-log", "activity-feed", "rate-limit", "retry", "analytics", "dashboard"]);
    expectReady(report.packageSignals, ["@novu/node", "@novu/js", "@novu/react", "@knocklabs/node", "@magicbell/react", "firebase-admin", "onesignal-node", "custom"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "notification-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "notification-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects consent readiness patterns without executing CMP scripts", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consent-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consent-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "consent"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "consent:check": "rg \"CookieConsent|klaro|__tcfapi|TCString|ConsentManager\" src docs"
      },
      dependencies: {
        "vanilla-cookieconsent": "latest",
        "klaro": "latest",
        "@iabtcf/core": "latest",
        "@iabtcf/cmpapi": "latest",
        "@iabtcf/stub": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "consent", "cookieconsent.ts"), [
      "import * as CookieConsent from 'vanilla-cookieconsent';",
      "CookieConsent.run({",
      "  revision: 4,",
      "  hideFromBots: true,",
      "  disablePageInteraction: true,",
      "  guiOptions: { consentModal: { layout: 'box' }, preferencesModal: { layout: 'bar' } },",
      "  cookie: { name: 'cc_cookie', expiresAfterDays: 180 },",
      "  language: { default: 'en', translations: { en: { consentModal: { title: 'Cookie banner privacy policy' }, preferencesModal: { title: 'Manage preferences' } } } },",
      "  categories: {",
      "    necessary: { enabled: true, readOnly: true },",
      "    analytics: { autoclear: { cookies: [{ name: /^_ga/ }] }, services: { ga4: { label: 'Analytics service' } } },",
      "    marketing: { services: { ads: { label: 'Marketing pixel' } } },",
      "    preferences: { services: { theme: { label: 'Preferences service' } } },",
      "    functional: { services: { chat: { label: 'Functional service' } } },",
      "    performance: { services: { perf: { label: 'Performance service' } } }",
      "  },",
      "  onConsent: () => localStorage.setItem('consent proof timestamp', Date.now().toString()),",
      "  onChange: () => sessionStorage.setItem('lastConsent', 'changed')",
      "});",
      "export const controls = 'acceptAll acceptSelected rejectAll settings button privacy policy withdraw consent opt-out consentMode gpc do not track legitimate interest consent log proof';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "consent", "klaro.js"), [
      "import * as klaro from 'klaro';",
      "const manager = new klaro.ConsentManager({",
      "  services: [{ name: 'analytics-service', purposes: ['analytics', 'performance'] }, { name: 'ads-service', purposes: ['marketing'] }],",
      "  apps: [{ name: 'preferences-app', purposes: ['preferences', 'functional'] }]",
      "});",
      "klaro.show();",
      "manager.getConsent('analytics-service');",
      "export const blockedScript = '<script type=\"text/plain\" data-type=\"text/javascript\" data-name=\"analytics-service\" data-src=\"https://example.test/analytics.js\"></script>';",
      "export const pageScripts = 'pageScripts script blocking data-src text/plain data-type data-name autoclear disable page interaction withdraw opt-out';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "consent", "tcf.ts"), [
      "import { TCString, GVL } from '@iabtcf/core';",
      "import { CmpApi } from '@iabtcf/cmpapi';",
      "import '@iabtcf/stub';",
      "const cmp = new CmpApi(123, 2, true);",
      "window.__tcfapi?.('addEventListener', 2, () => {}, []);",
      "export const tcModel = {",
      "  TCString,",
      "  GVL,",
      "  cmpId: 123,",
      "  cmpVersion: 2,",
      "  vendorListVersion: 88,",
      "  purposeConsents: { 1: true, 2: true },",
      "  vendorConsents: { 42: true },",
      "  purposeLegitimateInterests: { 7: true },",
      "  vendorLegitimateInterests: { 42: true },",
      "  legitimateInterests: true",
      "};",
      "void cmp;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "consent.md"), [
      "# Consent readiness",
      "The CMP shows a cookie banner and modal with accept all, accept selected, reject all, and a settings button.",
      "Categories include necessary, analytics, marketing, preferences, functional, performance, services, and purposes.",
      "Scripts use data-src, text/plain, data-type, data-name, autoclear, page-script, and disable-page-interaction.",
      "Privacy controls include privacy policy, withdraw, opt-out, consent mode, GPC, do not track, legitimate interest, and proof records.",
      "IAB TCF uses __tcfapi, TCString, cmpId, vendor list, purposeConsents, vendorConsents, legitimateInterests, and GVL."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "consent-readiness-report.json"), "utf8")) as {
      consentSetups: Array<{ filePath: string; provider: string; bannerCount: number; modalCount: number; categoryCount: number; serviceCount: number; purposeCount: number; vendorCount: number; scriptBlockingCount: number; storageCount: number; localizationCount: number; apiCount: number }>;
      bannerSignals: Array<{ signal: string; readiness: string }>;
      categorySignals: Array<{ signal: string; readiness: string }>;
      scriptSignals: Array<{ signal: string; readiness: string }>;
      privacySignals: Array<{ signal: string; readiness: string }>;
      tcfSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.consentSetups.length).toBeGreaterThan(0);
    expect(report.consentSetups.some((item) => item.provider === "cookieconsent")).toBe(true);
    expect(report.consentSetups.some((item) => item.provider === "klaro")).toBe(true);
    expect(report.consentSetups.some((item) => item.provider === "iab-tcf")).toBe(true);
    const cookieSetup = report.consentSetups.find((item) => item.filePath === "src/consent/cookieconsent.ts");
    const klaroSetup = report.consentSetups.find((item) => item.filePath === "src/consent/klaro.js");
    const tcfSetup = report.consentSetups.find((item) => item.filePath === "src/consent/tcf.ts");
    expect(cookieSetup?.bannerCount).toBeGreaterThan(0);
    expect(cookieSetup?.modalCount).toBeGreaterThan(0);
    expect(cookieSetup?.categoryCount).toBeGreaterThan(0);
    expect(cookieSetup?.storageCount).toBeGreaterThan(0);
    expect(cookieSetup?.localizationCount).toBeGreaterThan(0);
    expect(cookieSetup?.apiCount).toBeGreaterThan(0);
    expect(klaroSetup?.serviceCount).toBeGreaterThan(0);
    expect(klaroSetup?.scriptBlockingCount).toBeGreaterThan(0);
    expect(tcfSetup?.purposeCount).toBeGreaterThan(0);
    expect(tcfSetup?.vendorCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.bannerSignals, ["banner", "modal", "accept-all", "accept-selected", "reject-all", "settings-button", "revision", "hide-from-bots"]);
    expectReady(report.categorySignals, ["necessary", "analytics", "marketing", "preferences", "functional", "performance", "services", "purposes"]);
    expectReady(report.scriptSignals, ["data-src", "text-plain", "data-type", "data-name", "autoclear", "page-script", "disable-page-interaction"]);
    expectReady(report.privacySignals, ["privacy-policy", "withdraw", "opt-out", "consent-mode", "gpc", "do-not-track", "legitimate-interest", "proof"]);
    expectReady(report.tcfSignals, ["__tcfapi", "tc-string", "cmp-id", "vendor-list", "purpose-consents", "vendor-consents", "legitimate-interests", "gvl"]);
    expectReady(report.packageSignals, ["vanilla-cookieconsent", "klaro", "@iabtcf/core", "@iabtcf/cmpapi", "@iabtcf/stub", "custom"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "consent-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "consent-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects secret management readiness patterns without executing secret tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-smgmt-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-smgmt-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "smgmt"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "k8s"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "smgmt:scan": "rg \"Vault|Infisical|Doppler|SOPS|ExternalSecret|SealedSecret\" src docs config k8s",
        "smgmt:run": "doppler run -- infisical run -- node src/index.js"
      },
      dependencies: {
        "@infisical/sdk": "latest",
        "infisical": "latest",
        "vault": "latest",
        "node-vault": "latest",
        "doppler": "latest",
        "sops": "latest",
        "sealed-secrets": "latest",
        "external-secrets": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "smgmt", "vault.ts"), [
      "import vault from 'node-vault';",
      "const client = vault({ endpoint: process.env.VAULT_ADDR, token: process.env.VAULT_TOKEN });",
      "export const vaultOps = [",
      "  'vault login token service token',",
      "  'vault auth enable approle role_id secret_id AppRole',",
      "  'vault auth enable kubernetes Kubernetes Auth service account',",
      "  'vault auth enable oidc OIDC JWT auth',",
      "  'vault auth enable aws AWS Auth IAM role',",
      "  'vault auth enable gcp GCP Auth Google Cloud auth',",
      "  'vault auth enable azure Azure Auth managed identity',",
      "  'vault secrets enable kv kv-v2 versioning versioned secrets',",
      "  'vault secrets enable transit encryption as a service encrypt decrypt',",
      "  'vault secrets enable pki PKI certificate authority certificates TLS cert',",
      "  'vault secrets enable database dynamic secrets database credentials leased credentials',",
      "  'vault policy write app least privilege policy policies rbac role permission',",
      "  'vault audit enable file audit log access log telemetry metrics',",
      "  'lease renew revoke ttl token TTL max_ttl rotation rotate expiry expiration dynamic secret',",
      "  'access request approval privileged access break-glass break glass emergency access',",
      "  'vault agent sidecar template env injection secretRef envFrom secrets.inject SDK API vault client secret sync certificate sync'",
      "];",
      "void client;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "smgmt", "infisical.ts"), [
      "import { InfisicalSDK } from '@infisical/sdk';",
      "const infisical = new InfisicalSDK({ clientId: 'client id', clientSecret: 'client secret' });",
      "export const infisicalOps = [",
      "  'Infisical infisical run infisical login infisical secrets infisical export',",
      "  'machine identity Universal Auth Kubernetes Auth GCP Auth Azure Auth AWS Auth OIDC Auth',",
      "  'secret rotation rotate Kubernetes Operator Infisical Agent SDK API certificate sync KMS',",
      "  'environment config app config env injection sync audit logs access request policy rbac'",
      "];",
      "void infisical;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "doppler.md"), [
      "# Doppler secret management",
      "Use Doppler with doppler login, doppler setup, doppler run, and doppler secrets for environment config.",
      "Project/config selection uses a scoped token, CI/CD pipeline, GitHub Action workflow, SDK/API sync, and env injection.",
      "Operations record audit log, activity logs, access request approvals, break glass emergency access, versioning, rotation, TTL, and revoke guidance."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "sops-policy.yaml"), [
      "creation_rules:",
      "  - path_regex: secrets/.*\\.yaml$",
      "    age: age1example",
      "    pgp: fingerprint",
      "    encrypted_regex: '^(data|stringData)$'",
      "    kms: arn:aws:kms:us-east-1:111122223333:key/example",
      "# SOPS sops encrypt decrypt encryption workflow"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "sealed-sync.yaml"), [
      "apiVersion: bitnami.com/v1alpha1",
      "kind: SealedSecret",
      "metadata:",
      "  name: app-sealed-secret",
      "spec:",
      "  encryptedData:",
      "    token: sealed secret value",
      "# sealed-secrets kubeseal sync rotation audit"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "external-sync.yaml"), [
      "apiVersion: external-secrets.io/v1",
      "kind: ExternalSecret",
      "metadata:",
      "  name: app-external-secret",
      "spec:",
      "  secretStoreRef:",
      "    name: app-secret-store",
      "    kind: SecretStore",
      "  target:",
      "    name: synced-secret",
      "  dataFrom:",
      "    - extract:",
      "        key: app/config",
      "---",
      "apiVersion: external-secrets.io/v1",
      "kind: ClusterSecretStore",
      "metadata:",
      "  name: cluster-secret-store",
      "# External Secrets Kubernetes Operator secret sync"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "secret-management.yml"), [
      "name: secret-management",
      "on: [push]",
      "jobs:",
      "  secret-management:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - name: Doppler GitHub Action CI/CD",
      "        uses: dopplerhq/secrets-fetch-action@v1",
      "      - name: Vault policy and audit check",
      "        run: rg \"vault policy|audit log|lease|rotation|ExternalSecret|SOPS\" ."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "secret-management-readiness-report.json"), "utf8")) as {
      secretManagementSetups: Array<{ filePath: string; provider: string; readiness: string; authCount: number; engineCount: number; policyCount: number; injectionCount: number; rotationCount: number; syncCount: number; auditCount: number; leaseCount: number; encryptionCount: number; cliCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      authSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      deliverySignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.secretManagementSetups.length).toBeGreaterThan(0);
    expect(report.secretManagementSetups.some((item) => item.provider === "vault")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "infisical")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "doppler")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "sops")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "sealed-secrets")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "external-secrets")).toBe(true);
    const vaultSetup = report.secretManagementSetups.find((item) => item.filePath === "src/smgmt/vault.ts");
    expect(vaultSetup?.authCount).toBeGreaterThan(0);
    expect(vaultSetup?.engineCount).toBeGreaterThan(0);
    expect(vaultSetup?.policyCount).toBeGreaterThan(0);
    expect(vaultSetup?.injectionCount).toBeGreaterThan(0);
    expect(vaultSetup?.rotationCount).toBeGreaterThan(0);
    expect(vaultSetup?.syncCount).toBeGreaterThan(0);
    expect(vaultSetup?.auditCount).toBeGreaterThan(0);
    expect(vaultSetup?.leaseCount).toBeGreaterThan(0);
    expect(vaultSetup?.encryptionCount).toBeGreaterThan(0);
    expect(vaultSetup?.cliCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.platformSignals, ["vault", "infisical", "doppler", "sops", "sealed-secrets", "external-secrets"]);
    expectReady(report.authSignals, ["token", "approle", "kubernetes-auth", "oidc", "aws-auth", "gcp-auth", "azure-auth", "universal-auth"]);
    expectReady(report.storageSignals, ["kv", "secret-engine", "dynamic-secrets", "pki", "transit", "certificate", "database-credentials", "environment-config"]);
    expectReady(report.deliverySignals, ["env-injection", "cli-run", "agent", "kubernetes-operator", "sync", "github-action", "ci-cd", "sdk-api"]);
    expectReady(report.governanceSignals, ["policy", "rbac", "audit-log", "lease", "rotation", "versioning", "access-request", "break-glass"]);
    expectReady(report.packageSignals, ["@infisical/sdk", "infisical", "vault", "node-vault", "doppler", "sops", "sealed-secrets", "external-secrets"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "secret-management-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "secret-management-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects authorization readiness patterns without executing policy engines", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-authorization-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-authorization-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "authz"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "policies"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "authz:scan": "rg \"OpenFGA|newEnforcer|AbilityBuilder|Polar|allow|OPA|Rego\" src policies",
        "authz:test": "vitest run authorization.policy.test.ts"
      },
      dependencies: {
        "@openfga/sdk": "latest",
        "openfga": "latest",
        "casbin": "latest",
        "casl": "latest",
        "@casl/ability": "latest",
        "oso": "latest",
        "opa": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "authz", "openfga.ts"), [
      "import { OpenFgaClient, type AuthorizationModel, type TupleKey } from '@openfga/sdk';",
      "const openfga = new OpenFgaClient({ apiUrl: 'https://authz.example.test' });",
      "export const authorizationModel: AuthorizationModel = {",
      "  schema_version: '1.1',",
      "  type_definitions: [{ type: 'user' }, { type: 'group', relations: { member: { this: {} } } }, { type: 'organization', relations: { admin: { this: {} }, member: { this: {} } } }, { type: 'tenant', relations: { owner: { this: {} } } }, { type: 'document', relations: { owner: { this: {} }, viewer: { union: { child: [] } }, editor: { this: {} } } } }]",
      "};",
      "export const relationshipTuples: TupleKey[] = [",
      "  { user: 'user:*', relation: 'viewer', object: 'document:public' },",
      "  { user: 'group:eng#member', relation: 'editor', object: 'document:roadmap' },",
      "  { user: 'organization:veritas#member', relation: 'viewer', object: 'repository:repotutor' }",
      "];",
      "export async function canCheck(actor: string, action: 'read' | 'write' | 'delete' | 'manage', resource: string, tenantId: string, ownerId: string) {",
      "  const resourceAction = `${resource}:${action}`;",
      "  const allowed = await openfga.check({ user: actor, relation: action === 'read' ? 'viewer' : 'editor', object: resource });",
      "  const decisionLog = { actor, action, resource, tenantId, ownerId, resourceAction, serviceAccount: 'service-account:indexer', anonymous: 'anonymous', auditLog: true };",
      "  if (!allowed.allowed) throw new Error(`deny-by-default AccessDenied authorization decision ${JSON.stringify(decisionLog)}`);",
      "  return allowed;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "authz", "casbin.ts"), [
      "import { newEnforcer } from 'casbin';",
      "export async function authorizeWithCasbin(user: string, obj: string, act: string, domain: string) {",
      "  const enforcer = await newEnforcer('model.conf', 'policy.csv');",
      "  const model = '[request_definition] r = sub, obj, act [policy_definition] p = sub, obj, act [role_definition] g = _, _ [matchers] m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act';",
      "  const policy = 'p, role:admin, repository:repotutor, read\\ng, alice, role:admin';",
      "  const rbac = 'RBAC ABAC ACL permissions roles group tenant domain subject object action';",
      "  const allowed = await enforcer.enforce(user, obj, act);",
      "  if (!allowed) return false;",
      "  return { allowed, model, policy, rbac, domain };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "authz", "casl.ts"), [
      "import { AbilityBuilder, ForbiddenError, createMongoAbility, defineAbility } from '@casl/ability';",
      "export const ability = defineAbility((can, cannot) => {",
      "  can('read', 'Document');",
      "  can('manage', 'Document', { owner: 'user-1', tenant: 'tenant-1', organization: 'org-1' });",
      "  can(['update', 'delete'], ['Project', 'Record'], { owner: 'user-1' });",
      "  cannot('delete', 'Document', { locked: true });",
      "});",
      "export function assertUiAbility(subject: unknown) {",
      "  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);",
      "  can('read', 'field');",
      "  cannot('delete', 'collection');",
      "  const built = build();",
      "  ForbiddenError.from(built).throwUnlessCan('read', subject as never);",
      "  return built.can('read', subject as never);",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "authorization.polar"), [
      "resource Repository {",
      "  roles = ['reader', 'writer', 'admin'];",
      "  permissions = ['pull', 'push', 'delete'];",
      "  'pull' if 'reader';",
      "  'push' if 'writer';",
      "  'writer' if 'admin';",
      "}",
      "allow(actor, action, resource) if has_permission(actor, action, resource);",
      "has_permission(actor, 'push', repo: Repository) if has_role(actor, 'writer', repo);",
      "allow_field(actor, 'read', resource, field) if field = 'title';",
      "allow_request(actor, request) if actor.is_admin = true;",
      "# Oso Polar actor action resource authorize is_allowed authorized_actions authorized_resources RBAC ReBAC"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "authz.rego"), [
      "package authz",
      "default allow := false",
      "allow if { input.actor.role == \"admin\" }",
      "deny contains msg if { not allow; msg := \"deny by default\" }",
      "# OPA Rego opa test policy decision output"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "authorization.md"), [
      "# Authorization governance",
      "Use least privilege, separation of duties, audit log, permission review, policy versioning, migration, decision log, and break-glass emergency access.",
      "Route protection uses middleware and guard checks; resolver protection checks field and collection resources.",
      "Authorization unit test fixture table test negative test policy test e2e test type test coverage includes expect allowed false and 403 forbidden deny cases."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "authorization-readiness-report.json"), "utf8")) as {
      authorizationSetups: Array<{ filePath: string; framework: string; modelCount: number; relationCount: number; roleCount: number; permissionCount: number; resourceCount: number; actionCount: number; guardCount: number; middlewareCount: number; ownershipCount: number; testCount: number; readiness: string }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      enforcementSignals: Array<{ signal: string; readiness: string }>;
      identitySignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.authorizationSetups.length).toBeGreaterThan(0);
    expect(report.authorizationSetups.some((item) => item.framework === "openfga")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "casbin")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "casl")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "oso")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "opa")).toBe(true);
    const openfgaSetup = report.authorizationSetups.find((item) => item.filePath === "src/authz/openfga.ts");
    expect(openfgaSetup?.modelCount).toBeGreaterThan(0);
    expect(openfgaSetup?.relationCount).toBeGreaterThan(0);
    expect(openfgaSetup?.permissionCount).toBeGreaterThan(0);
    expect(openfgaSetup?.resourceCount).toBeGreaterThan(0);
    expect(openfgaSetup?.actionCount).toBeGreaterThan(0);
    expect(openfgaSetup?.guardCount).toBeGreaterThan(0);
    expect(openfgaSetup?.ownershipCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.modelSignals, ["rbac", "abac", "rebac", "acl", "relationship-tuples", "policy-file", "subject-object-action", "resource-action"]);
    expectReady(report.enforcementSignals, ["guard", "middleware", "can-check", "authorize-call", "deny-by-default", "route-protection", "resolver-protection", "ui-ability"]);
    expectReady(report.identitySignals, ["user", "role", "group", "tenant", "organization", "service-account", "owner", "anonymous"]);
    expectReady(report.resourceSignals, ["document", "project", "repository", "organization", "tenant", "record", "field", "collection"]);
    expectReady(report.governanceSignals, ["least-privilege", "separation-of-duties", "audit-log", "permission-review", "policy-versioning", "migration", "decision-log", "break-glass"]);
    expectReady(report.testSignals, ["unit-test", "fixture", "table-test", "negative-test", "policy-test", "e2e-test", "type-test"]);
    expectReady(report.packageSignals, ["@openfga/sdk", "openfga", "casbin", "casl", "@casl/ability", "oso", "opa", "custom"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "authorization-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "authorization-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects object storage readiness patterns without contacting object storage", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-object-storage-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-object-storage-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "storage"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "storage:scan": "tsx src/storage/s3.ts"
      },
      dependencies: {
        "@aws-sdk/client-s3": "latest",
        "@aws-sdk/lib-storage": "latest",
        "@aws-sdk/s3-presigned-post": "latest",
        "@aws-sdk/s3-request-presigner": "latest",
        "@azure/storage-blob": "latest",
        "@google-cloud/storage": "latest",
        "@supabase/supabase-js": "latest",
        minio: "latest",
        wrangler: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "boto3",
      "minio",
      "google-cloud-storage",
      "azure-storage-blob",
      "supabase"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "storage", "s3.ts"), [
      "import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, CopyObjectCommand, PutBucketPolicyCommand, PutBucketCorsCommand } from \"@aws-sdk/client-s3\";",
      "import { Upload } from \"@aws-sdk/lib-storage\";",
      "import { getSignedUrl } from \"@aws-sdk/s3-request-presigner\";",
      "import { createPresignedPost } from \"@aws-sdk/s3-presigned-post\";",
      "",
      "const client = new S3Client({",
      "  region: process.env.AWS_REGION,",
      "  endpoint: process.env.S3_ENDPOINT,",
      "  forcePathStyle: true,",
      "  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },",
      "  requestHandler: { requestTimeout: 2000 },",
      "  maxAttempts: 3",
      "});",
      "const Bucket = process.env.UPLOAD_BUCKET || \"app-private-bucket\";",
      "await client.send(new PutObjectCommand({ Bucket, Key: \"avatars/u1.png\", Body: \"demo\", Metadata: { owner: \"u1\" }, Tagging: \"purpose=avatar\", ContentType: \"image/png\", CacheControl: \"public, max-age=60\", ACL: \"private\", ServerSideEncryption: \"aws:kms\", SSEKMSKeyId: process.env.KMS_KEY_ID, ChecksumSHA256: \"abc\", ContentMD5: \"abc\" }));",
      "await new Upload({ client, params: { Bucket, Key: \"multipart/video.mp4\", Body: \"demo\", Metadata: { kind: \"multipart\" } } }).done();",
      "await client.send(new GetObjectCommand({ Bucket, Key: \"avatars/u1.png\" }));",
      "await client.send(new ListObjectsV2Command({ Bucket, Prefix: \"avatars/\" }));",
      "await client.send(new CopyObjectCommand({ Bucket, CopySource: `${Bucket}/avatars/u1.png`, Key: \"archive/u1.png\" }));",
      "await client.send(new DeleteObjectCommand({ Bucket, Key: \"old/u1.png\" }));",
      "const signedUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket, Key: \"avatars/u1.png\" }));",
      "await createPresignedPost(client, { Bucket, Key: \"browser/${filename}\", Conditions: [{ acl: \"private\" }], Fields: { ContentType: \"image/png\" } });",
      "await client.send(new PutBucketPolicyCommand({ Bucket, Policy: JSON.stringify({ Statement: [{ Effect: \"Allow\", Principal: \"*\", Action: [\"s3:GetObject\", \"s3:PutObject\", \"s3:ListBucket\"], Resource: [\"arn:aws:s3:::app-private-bucket/*\"] }] }) }));",
      "await client.send(new PutBucketCorsCommand({ Bucket, CORSConfiguration: { CORSRules: [{ AllowedMethods: [\"GET\", \"PUT\"], AllowedOrigins: [\"https://app.example.com\"] }] } }));",
      "export const s3Readiness = \"S3-compatible versioning lifecycle retention object lock replication checksum ETag retry least-privilege encryption SSE KMS virus scan malware scan health metrics backup restore migration event notification queue CDN cache public private RBAC IAM\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "storage", "minio.js"), [
      "import Minio from \"minio\";",
      "",
      "const minio = new Minio.Client({ endPoint: process.env.MINIO_ENDPOINT, port: 9000, useSSL: true, accessKey: process.env.MINIO_ACCESS_KEY, secretKey: process.env.MINIO_SECRET_KEY });",
      "await minio.makeBucket(\"media\", \"us-east-1\");",
      "await minio.putObject(\"media\", \"uploads/u1.txt\", \"demo\", { contentType: \"text/plain\", metadata: \"owner=u1\" });",
      "await minio.getObject(\"media\", \"uploads/u1.txt\");",
      "minio.listObjectsV2(\"media\", \"uploads/\", true);",
      "await minio.removeObject(\"media\", \"old/u1.txt\");",
      "await minio.presignedGetObject(\"media\", \"uploads/u1.txt\", 60);",
      "await minio.setBucketPolicy(\"media\", JSON.stringify({ Statement: [{ Effect: \"Allow\", Action: [\"s3:GetObject\"] }] }));",
      "await minio.setBucketNotification(\"media\", { QueueConfigurations: [{ Events: [\"s3:ObjectCreated:*\"], QueueArn: \"arn:sqs:storage-events\" }] });",
      "await minio.bucketExists(\"media\");",
      "await minio.statObject(\"media\", \"uploads/u1.txt\");",
      "export const minioOps = \"health metrics backup restore migration event notification queue mirror cache retention replication\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "storage", "supabase.ts"), [
      "import { createClient } from \"@supabase/supabase-js\";",
      "",
      "const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);",
      "await supabase.storage.createBucket(\"avatars\", { public: false, fileSizeLimit: 1024 * 1024 });",
      "await supabase.storage.from(\"avatars\").upload(\"users/u1.png\", new Blob(), { cacheControl: \"3600\", contentType: \"image/png\", upsert: true });",
      "await supabase.storage.from(\"avatars\").download(\"users/u1.png\");",
      "await supabase.storage.from(\"avatars\").list(\"users\", { limit: 100, offset: 0 });",
      "await supabase.storage.from(\"avatars\").remove([\"users/old.png\"]);",
      "await supabase.storage.from(\"avatars\").createSignedUrl(\"users/u1.png\", 60);",
      "supabase.storage.from(\"avatars\").getPublicUrl(\"users/u1.png\");",
      "export const supabasePolicies = \"RLS row level security create policy storage.objects auth.uid RBAC public URL private bucket policy CORS CDN cache\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "object-storage.yaml"), [
      "storage:",
      "  storageS3Bucket: app-private-bucket",
      "  storageS3Endpoint: https://minio.local",
      "  storageS3ForcePathStyle: true",
      "  storageS3Region: us-east-1",
      "  storageS3ClientTimeout: 2000",
      "  versioning: enabled",
      "  lifecycle: expire-temp-after-7-days",
      "  retention: governance",
      "  object_lock: enabled",
      "  replication: cross-region",
      "  checksum: sha256",
      "  encryption: SSE KMS",
      "  event_notifications:",
      "    queue: storage-events",
      "  backup: daily mirror",
      "  restore: tested",
      "  migration: s3-to-r2",
      "  metrics: prometheus",
      "  health: headBucket",
      "  cdn_cache: cache-control"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "wrangler.toml"), [
      "name = \"storage-fixture\"",
      "r2_buckets = [{ binding = \"ASSETS\", bucket_name = \"assets-private\" }]",
      "queues.producers = [{ binding = \"STORAGE_EVENTS\", queue = \"storage-events\" }]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "object-storage.yml"), [
      "name: object-storage",
      "on:",
      "  pull_request:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"Object storage readiness S3 MinIO R2 Supabase Storage buckets regions endpoints path-style credentials PutObject GetObject ListObjects DeleteObject CopyObject multipart upload download metadata tags presigned URL signed URL policy ACL CORS RLS RBAC versioning lifecycle retention object lock replication checksum ETag SSE KMS encryption event notifications queues CDN cache health metrics backup restore migration static only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "object-storage-readiness-report.json"), "utf8")) as {
      storageSetups: Array<{ filePath: string; platform: string; bucketCount: number; clientCount: number; uploadCount: number; downloadCount: number; listCount: number; deleteCount: number; presignCount: number; opsCount: number }>;
      bucketSignals: Array<{ signal: string; readiness: string }>;
      clientSignals: Array<{ signal: string; readiness: string }>;
      objectSignals: Array<{ signal: string; readiness: string }>;
      accessSignals: Array<{ signal: string; readiness: string }>;
      reliabilitySignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.storageSetups.length).toBeGreaterThan(0);
    expect(report.storageSetups.some((item) => item.platform === "s3")).toBe(true);
    expect(report.storageSetups.some((item) => item.platform === "minio")).toBe(true);
    expect(report.storageSetups.some((item) => item.platform === "supabase-storage")).toBe(true);
    expect(report.storageSetups.some((item) => item.platform === "r2")).toBe(true);
    const s3Setup = report.storageSetups.find((item) => item.filePath === "src/storage/s3.ts");
    expect(s3Setup?.bucketCount).toBeGreaterThan(0);
    expect(s3Setup?.clientCount).toBeGreaterThan(0);
    expect(s3Setup?.uploadCount).toBeGreaterThan(0);
    expect(s3Setup?.downloadCount).toBeGreaterThan(0);
    expect(s3Setup?.listCount).toBeGreaterThan(0);
    expect(s3Setup?.deleteCount).toBeGreaterThan(0);
    expect(s3Setup?.presignCount).toBeGreaterThan(0);
    expect(s3Setup?.opsCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.bucketSignals, ["bucket", "region", "endpoint", "path-style", "public-private", "namespace"]);
    expectReady(report.clientSignals, ["s3-client", "minio-client", "r2-client", "gcs-client", "azure-blob-client", "supabase-storage-client", "credentials", "timeout"]);
    expectReady(report.objectSignals, ["put-object", "upload", "multipart", "get-object", "download", "list-objects", "delete-object", "copy-object", "metadata"]);
    expectReady(report.accessSignals, ["signed-url", "presigned-post", "public-url", "policy", "acl", "cors", "rbac", "rls"]);
    expectReady(report.reliabilitySignals, ["versioning", "lifecycle", "retention", "object-lock", "replication", "checksum", "etag", "retry"]);
    expectReady(report.securitySignals, ["sse", "kms", "encryption", "secret-key", "least-privilege", "scan"]);
    expectReady(report.opsSignals, ["health", "metrics", "backup", "restore", "migration", "event-notification", "queue", "cdn-cache"]);
    expectReady(report.packageSignals, ["aws-sdk-s3", "lib-storage", "minio", "supabase-storage", "gcs", "azure-blob", "r2", "s3-compatible"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "object-storage-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "object-storage-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects backup readiness patterns without running backup tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-backup-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-backup-source-"));
    await fs.mkdir(path.join(sourceRoot, "k8s"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "scripts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Backup readiness fixture",
      "This repo keeps a restore runbook for disaster recovery and point-in-time WAL recovery.",
      "Use velero backup create app-manual --include-namespaces app --wait.",
      "Use velero backup describe app-manual and velero backup logs app-manual.",
      "Use velero restore create --from-backup app-nightly --wait and velero restore describe app-restore.",
      "Use litestream replicate, litestream restore, and litestream databases.",
      "Use restic backup, restic snapshots, restic restore, restic forget --prune, and restic check --read-data.",
      "Restore drill validates target directory and checksum integrity."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "velero.yaml"), [
      "apiVersion: velero.io/v1",
      "kind: Backup",
      "metadata:",
      "  name: app-nightly",
      "spec:",
      "  includedNamespaces:",
      "    - app",
      "  excludedNamespaces:",
      "    - kube-system",
      "  ttl: 720h0m0s",
      "  storageLocation: default",
      "  volumeSnapshotLocations:",
      "    - aws",
      "  snapshotVolumes: true",
      "  defaultVolumesToFsBackup: true",
      "---",
      "apiVersion: velero.io/v1",
      "kind: Schedule",
      "metadata:",
      "  name: app-daily",
      "spec:",
      "  schedule: \"0 2 * * *\"",
      "  template:",
      "    includedNamespaces:",
      "      - app",
      "    ttl: 168h0m0s",
      "---",
      "apiVersion: velero.io/v1",
      "kind: Restore",
      "metadata:",
      "  name: app-restore",
      "spec:",
      "  backupName: app-nightly",
      "  includedNamespaces:",
      "    - app",
      "---",
      "apiVersion: velero.io/v1",
      "kind: BackupStorageLocation",
      "metadata:",
      "  name: default",
      "spec:",
      "  provider: aws",
      "  objectStorage:",
      "    bucket: app-backups",
      "    prefix: velero",
      "  config:",
      "    region: us-east-1",
      "---",
      "apiVersion: velero.io/v1",
      "kind: VolumeSnapshotLocation",
      "metadata:",
      "  name: aws",
      "spec:",
      "  provider: aws"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "litestream.yml"), [
      "dbs:",
      "  - path: /var/lib/app/app.db",
      "    replicas:",
      "      - url: s3://app-backups/sqlite/app",
      "        retention: 720h",
      "      - url: gcs://app-backups/sqlite/app",
      "      - url: abs://app-backups/sqlite/app",
      "    snapshot:",
      "      interval: 1h",
      "      retention: 168h"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "scripts", "backup.sh"), [
      "#!/usr/bin/env sh",
      "set -eu",
      "export RESTIC_REPOSITORY=s3:s3.amazonaws.com/app-backups/restic",
      "export RESTIC_PASSWORD_FILE=/run/secrets/restic-password",
      "restic init || true",
      "restic backup /var/lib/app --tag app --exclude /var/lib/app/tmp",
      "restic snapshots --group-by host,paths,tags",
      "restic forget --keep-daily 7 --keep-weekly 4 --prune",
      "restic check --read-data-subset=5%",
      "velero backup create app-manual --include-namespaces app --wait",
      "velero backup describe app-manual",
      "velero backup logs app-manual",
      "litestream databases -config litestream.yml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "restore.md"), [
      "# Restore drill",
      "point-in-time WAL recovery and integrity validation",
      "- velero restore create --from-backup app-nightly --wait",
      "- velero restore describe app-restore",
      "- litestream restore -o /var/lib/app/app.db s3://app-backups/sqlite/app",
      "- restic restore latest --target /restore/app",
      "- restic check --read-data"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "backup.yml"), [
      "name: backup",
      "on:",
      "  workflow_dispatch:",
      "  schedule:",
      "    - cron: \"0 2 * * *\"",
      "jobs:",
      "  backup:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: ./scripts/backup.sh"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({ scripts: { "backup:check": "restic check && velero backup get && litestream databases" } }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "backup-readiness-report.json"), "utf8")) as {
      backupSetups: Array<{ filePath: string; tool: string; backupCount: number; restoreCount: number; scheduleCount: number; storageCount: number; retentionCount: number; verificationCount: number }>;
      veleroSignals: Array<{ signal: string; readiness: string }>;
      litestreamSignals: Array<{ signal: string; readiness: string }>;
      resticSignals: Array<{ signal: string; readiness: string }>;
      restoreDrillSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const veleroSetup = report.backupSetups.find((item) => item.filePath === "k8s/velero.yaml");
    const resticSetup = report.backupSetups.find((item) => item.filePath === "scripts/backup.sh");
    expect(report.backupSetups.length).toBeGreaterThan(0);
    expect(veleroSetup?.tool).toBe("velero");
    expect(veleroSetup?.backupCount).toBeGreaterThan(0);
    expect(veleroSetup?.restoreCount).toBeGreaterThan(0);
    expect(veleroSetup?.scheduleCount).toBeGreaterThan(0);
    expect(veleroSetup?.storageCount).toBeGreaterThan(0);
    expect(resticSetup?.tool).toBe("hybrid");
    expect(resticSetup?.verificationCount).toBeGreaterThan(0);
    for (const signal of ["backup", "schedule", "restore", "backup-storage-location", "volume-snapshot-location", "included-namespaces", "excluded-namespaces", "ttl", "storage-location", "volume-snapshot", "fs-backup", "backup-describe", "backup-logs", "restore-describe"]) {
      expect(report.veleroSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["config", "db-path", "replica-url", "s3", "gcs", "azure", "snapshot-interval", "snapshot-retention", "replicate-command", "restore-command", "database-command"]) {
      expect(report.litestreamSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["repository", "password-file", "init", "backup-command", "snapshots-command", "restore-command", "forget-prune", "check", "tags", "exclude", "read-data"]) {
      expect(report.resticSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["restore-runbook", "restore-command", "point-in-time", "wait", "describe", "logs", "integrity-check", "read-data", "target-path"]) {
      expect(report.restoreDrillSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["retention-policy", "encrypted-secret", "namespace-scope", "storage-location", "snapshot-location", "verification-check", "prune-policy", "restore-drill", "external-repository"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["velero", "litestream", "restic", "backup-script", "cron", "workflow"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "backup-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "backup-readiness.html"))).resolves.toBeUndefined();
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
