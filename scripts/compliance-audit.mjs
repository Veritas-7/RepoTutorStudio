#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const iterations = Number(readFlag("--iterations") ?? "124");
const defaultAuditDir = path.join(root, "docs", "audits", "generated");
const auditDir = path.resolve(readFlag("--output-dir") ?? defaultAuditDir);
if (!auditDir.startsWith(path.resolve(root) + path.sep)) {
  throw new Error(`Refusing to write audit output outside the repo: ${auditDir}`);
}
const auditDirRelative = path.relative(root, auditDir).split(path.sep).join("/");
fs.mkdirSync(auditDir, { recursive: true });
const fileTextCache = new Map();

const checks = [
  check("project setup", [
    "DEVELOPMENT_BRIEF.txt",
    "working.md",
    "package.json",
    "pnpm-workspace.yaml",
    "AGENTS.md"
  ]),
  check("vibe-coding product mission", [
    "README.md",
    "docs/product/learning-mission.md",
    "working.md"
  ], ["vibe-coding education app", "GitHub URL, local source folder", "AI-native build briefing", "not a traditional programming course", "not a language syntax tutor", "project's mission", "architecture, folder and file responsibilities", "important terms", "prompt strategy", "verification boundaries", "PRD", "SDD", "TDD", "acceptance criteria", "recreate or extend similar software with better judgment", "not embed external repositories as permanent knowledge", "generated-session source evidence", "verify AI output"]),
  check("source as learner briefing evidence", [
    "README.md",
    "docs/product/learning-mission.md",
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Source intake is therefore not AI training data", "learner briefing process", "AI already knows common coding patterns", "ambiguity for this specific project", "not vocabulary for a traditional coding exam", "why that context helps the learner brief or review AI", "소스는 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다", "제품 의도, 책임 지도, 아키텍처 이유, AI 지시 맥락, 검증 기준", "소스는 AI를 훈련시키는 데이터가 아니라", "프로젝트 맥락을 뽑는 증거", "source as learner briefing evidence"]),
  check("shared core engine", [
    "packages/core/src/pipeline.ts",
    "packages/codex/src/index.ts",
    "packages/core/src/evidence.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/storage.ts",
    "packages/shared/src/schemas.ts"
  ], ["packages/core/src/pipeline.ts:runStudy", "packages/shared/src/schemas.ts:StudySessionSchema", "vibe-coding learner", "architecture roles, essential terms, AI prompt strategy, and verification boundaries", "does not need language syntax memorization", "rather than language syntax memorization"]),
  check("headless cli commands", [
    "apps/cli/src/index.ts",
    "apps/cli/src/args.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/source-prune.ts"
  ], ["study", "studyMarkdown", "RepoTutor Study", "study supports --format", "--no-codex", "--learner-brief", "learnerBriefPath", "Learner Goal Alignment HTML", "enableCodex", "CLI_COMMANDS", "injectDefaultStudyCommand", "isStudyTargetCandidate", "defaultStudyCommand", "Default study command", "<github-url-or-path>", "runtimeOptions", "studiesRootFlag", "Runtime Options", "--studies-root <dir>", "runtimeHealth", "doctorRuntimeHealth", "pathAccess", "studiesRootParentWritable", "Runtime Health", "quiz", "quizAttemptMarkdown", "RepoTutor Quiz Attempt", "quiz supports --format", "resume", "resumeMarkdown", "RepoTutor Resume", "Study mode", "Learner level", "dailySummaryHtml", "Daily Summary HTML", "htmlTargetStatus", "HTML Target Status", "readableFileExists", "present", "missing", "evidence", "export", "exportSummaryMarkdown", "RepoTutor Export", "--summary-format json|markdown", "export supports --summary-format", "verify-export", "exportVerificationMarkdown", "RepoTutor Export Verification", "verify-export supports --format", "verify-evidence", "evidenceVerificationMarkdown", "RepoTutor Evidence Verification", "verify-evidence supports --format", "verify-session", "verifyEvidenceIndexReport", "verifyStudySessionArtifacts", "verificationOk", "verificationStatus", "verificationReport", "verificationMarkdown", "verificationHtml", "verificationCheckedRequiredArtifacts", "checkedRequiredArtifacts", "htmlTargets", "htmlTargetsComplete", "missingHtmlTargets", "htmlTargetsFlag", "--html-targets complete|missing|all", "list supports --html-targets", "openTargetPaths", "openTargetPathsMarkdown", "RepoTutor Open Target Paths", "open --target all supports --format", "html-export-failed", "evidence-index-failed", "sessionVerificationSummary", "sessionVerificationMarkdown", "RepoTutor Session Verification", "process.exitCode", "verify-list-output", "verifyListOutput", "verifyListOutputManifest", "ListOutputVerification", "listOutputVerificationMarkdown", "RepoTutor List Output Verification", "verify-list-output supports --format json or markdown", "--manifest", "--report", "emitVerifyListOutputReport", "verifyListOutputReportPath", ".verification.json", ".verification.md", "report must be a non-empty string", "manifest-read-failed", "bytes-mismatch", "sha256-mismatch", "rows-mismatch", "fields-mismatch", "actualRows", "actualFields", "Actual rows", "Actual fields", "listOutputRowCount", "listOutputFields", "fieldListKey", "output-format-parse-failed", "unsupported-schema-version", "supportedSchemaVersion", "Supported schema version", "LIST_OUTPUT_MANIFEST_SCHEMA_VERSION", "list", "ListSummary", "ListFilterManifest", "listFilterManifest", "ListOutputContext", "ListOutputManifest", "schemaVersion", "Schema version", "listSummary", "listSummaryMarkdown", "countBy", "countMarkdown", "RepoTutor Session Summary", "list --summary supports --format", "list cannot combine --summary with --fields or --field-preset", "emitListOutput", "createListOutputManifest", "outputManifestPath", "jsonText", "--output", "--output-manifest", "output", "outputManifest", "manifestPath", "createHash", "sha256", "bytes", "fs.writeFile", "list requires --output when --output-manifest is used", "output-manifest must be a non-empty manifest path", "LIST_FIELDS", "LIST_FIELD_PRESETS", "LIST_FIELD_PRESET_NAMES", "listFieldsFlag", "listFieldPresetFlag", "listFieldSelection", "projectListRows", "listMarkdown", "listFieldsMarkdown", "listJsonl", "listCsv", "listFieldDisplayValue", "listFieldCsvValue", "csvCell", "--summary", "--fields", "--field-preset", "field-preset must be one of", "list supports --field-preset", "list cannot combine --fields and --field-preset", "comma-separated list", "list supports --fields", "RepoTutor Sessions", "Session Path", "list supports --format json, markdown, jsonl, or csv", "learnerLevel", "Level", "--verified-only", "--wrong-only", "wrongOnly", "--unattempted-only", "unattemptedOnly", "scored-only", "--scored-only", "scoredOnly", "--min-score", "--max-score", "optionalScoreFlag", "number from 0 to 100", "validateListFilterCombinations", "filterConflictValidation", "list cannot combine --unattempted-only", "min-score must be less than or equal to max-score", "--created-from", "--created-to", "optionalCreatedAtBoundFlag", "validateCreatedAtRange", "created-from must be less than or equal to created-to", "createdRangeValidation", "--limit", "optionalPositiveIntegerFlag", "positive integer", "--mode quick|standard|deep|all", "studyModeFlag", "list supports --mode", "--level beginner|junior|senior|all", "learnerLevelFlag", "list supports --level", "--status passed|failed|missing|all", "verificationStatusFlag", "list supports --status", "--repo", "optionalStringFlag", "repoMatches", "non-empty string", "--sort newest|oldest|score-desc|score-asc", "score-desc", "score-asc", "listSortFlag", "sortSessionRows", "list supports --sort", "open", "--target verification|evidence|suggested-reads|runtime-environment|interface-map|symbol-map|api-reference|search-index|learning-journal|daily-summary|architecture-principle-playbook|source-to-build-interview|similar-app-transfer-map|learner-goal-alignment|ai-implementation-loop|learner-role-contract|ai-output-review-rubric|vibe-coding-mastery-checklist|vibe-coding-implementation-brief|ai-prompt-readiness-checklist|ai-prompt-ab-lab|source-retention-guide|source-absorption-ledger|teaching-workspace|vibe-coding-prompt-pack|improvement-backlog|project-activity|code-metrics-readiness|code-ownership-readiness|large-asset-readiness|license-rights|sbom|security-readiness|sast-readiness|dast-readiness|threat-model-readiness|scorecard|provenance|advisories|vex|policy-gates|api-contracts|consumer-contract-readiness|observability|performance|profiling-readiness|tracing-readiness|debug-readiness|crash-reporting-readiness|incident-response-readiness|slo-readiness|cost-readiness|progressive-delivery-readiness|load-testing-readiness|benchmark-readiness|e2e|flaky-test-readiness|test-impact-readiness|test-reporting-readiness|snapshot-readiness|property-based-testing-readiness|fuzz-readiness|test-data-readiness|integration-test-environment-readiness|chaos-engineering-readiness|accessibility|storybook|design-tokens|i18n|release-readiness|secret-readiness|secret-management-readiness|container-readiness|container-scan-readiness|code-quality|documentation|database-readiness|database-migration-readiness|database-orm-readiness|data-transformation-readiness|data-quality-readiness|data-lineage-readiness|data-catalog-readiness|data-annotation-readiness|lakehouse-table-readiness|feature-store-readiness|model-registry-readiness|experiment-tracking-readiness|model-monitoring-readiness|model-serving-readiness|model-training-readiness|ci-cd|unit-tests|coverage-readiness|mutation-testing-readiness|typecheck-readiness|package-manager|git-hooks|task-runner|dependency-updates|dependency-review-readiness|lint-readiness|format-readiness|commit-conventions|changelog-readiness|bundle-analysis|mocking-readiness|data-fetching-readiness|routing-readiness|state-management-readiness|form-readiness|auth-readiness|authorization-readiness|payment-readiness|email-readiness|queue-readiness|event-stream-readiness|data-connector-readiness|semantic-layer-readiness|bi-dashboard-readiness|schema-registry-readiness|stream-processing-readiness|pipeline-orchestration-readiness|service-mesh-readiness|ingress-controller-readiness|dns-readiness|certificate-readiness|helm-readiness|admission-policy-readiness|api-gateway-readiness|cache-readiness|logging-readiness|feature-flag-readiness|rate-limit-readiness|error-tracking-readiness|analytics-readiness|http-client-readiness|schema-validation-readiness|datetime-readiness|id-generation-readiness|image-processing-readiness|file-upload-readiness|websocket-readiness|realtime-media-readiness|pdf-generation-readiness|spreadsheet-readiness|chart-visualization-readiness|markdown-code-rendering-readiness|notebook-readiness|map-visualization-readiness|diagram-rendering-readiness|link-integrity-readiness|seo-metadata-readiness|pwa-readiness|browser-compat-readiness|browser-extension-readiness|env-validation-readiness|security-headers-readiness|graphql-readiness|cli-readiness|terminal-ui-readiness|state-machine-readiness|animation-readiness|drag-and-drop-readiness|rich-text-editor-readiness|command-palette-readiness|guided-tour-readiness|data-table-readiness|calendar-readiness|dialog-readiness|popover-tooltip-readiness|menu-dropdown-readiness|toast-snackbar-readiness|tabs-accordion-readiness|checkbox-radio-switch-readiness|slider-progress-readiness|select-combobox-readiness|toolbar-toggle-readiness|scroll-area-readiness|avatar-readiness|pin-input-readiness|pagination-readiness|number-input-readiness|rating-group-readiness|color-picker-readiness|splitter-readiness|tags-input-readiness|clipboard-readiness|qr-code-readiness|timer-readiness|steps-readiness|carousel-readiness|tree-view-readiness|collapsible-readiness|editable-readiness|password-input-readiness|signature-pad-readiness|angle-slider-readiness|cascade-select-readiness|async-list-readiness|image-cropper-readiness|listbox-readiness|date-picker-readiness|marquee-readiness|toc-readiness|floating-panel-readiness|drawer-readiness|hover-card-readiness|navigation-menu-readiness|presence-readiness|menu-readiness|tooltip-readiness|llm-readiness|llm-eval-readiness|llm-observability-readiness|vector-db-readiness|search-service-readiness|object-storage-readiness|realtime-collaboration-readiness|workflow-orchestration-readiness|openapi-client-readiness|webhook-readiness|notification-readiness|consent-readiness|privacy-readiness|server-framework-readiness|rpc-readiness|workspace-graph-readiness|scaffolding-readiness|scheduler-readiness|build-tool-readiness|styling-readiness|visual-regression-readiness|infrastructure-readiness|iac-drift-readiness|deployment-readiness|serverless-readiness|mobile-readiness|desktop-readiness|edge-readiness|compose-readiness|devcontainer-readiness|kubernetes-readiness|gitops-readiness|backup-readiness|context-pack|mcp-handoff|agent-memory|graph-query|tutorial-abstractions|decision-records|dependency-health|vibe-coding-start|learning-path|quiz|quiz-print|all", "suggested-reads", "runtime-environment", "interface-map", "symbol-map", "api-reference", "search-index", "learning-journal", "daily-summary", "teaching-workspace", "improvement-backlog", "project-activity", "code-metrics-readiness", "code-ownership-readiness", "large-asset-readiness", "license-rights", "sbom", "security-readiness", "scorecard", "provenance", "advisories", "vex", "policy-gates", "consumer-contract-readiness", "observability", "performance", "profiling-readiness", "tracing-readiness", "debug-readiness", "crash-reporting-readiness", "incident-response-readiness", "slo-readiness", "cost-readiness", "progressive-delivery-readiness", "load-testing-readiness", "benchmark-readiness", "e2e", "flaky-test-readiness", "test-impact-readiness", "test-reporting-readiness", "snapshot-readiness", "property-based-testing-readiness", "fuzz-readiness", "test-data-readiness", "integration-test-environment-readiness", "chaos-engineering-readiness", "accessibility", "storybook", "design-tokens", "i18n", "release-readiness", "secret-readiness", "secret-management-readiness", "container-readiness", "container-scan-readiness", "code-quality", "documentation", "database-readiness", "database-migration-readiness", "data-quality-readiness", "data-lineage-readiness", "data-catalog-readiness", "data-annotation-readiness", "lakehouse-table-readiness", "feature-store-readiness", "model-registry-readiness", "experiment-tracking-readiness", "model-monitoring-readiness", "model-serving-readiness", "model-training-readiness", "ci-cd", "unit-tests", "coverage-readiness", "mutation-testing-readiness", "typecheck-readiness", "package-manager", "git-hooks", "task-runner", "dependency-updates", "lint-readiness", "format-readiness", "commit-conventions", "changelog-readiness", "bundle-analysis", "mocking-readiness", "data-fetching-readiness", "routing-readiness", "state-management-readiness", "form-readiness", "auth-readiness", "authorization-readiness", "payment-readiness", "email-readiness", "queue-readiness", "event-stream-readiness", "data-connector-readiness", "schema-registry-readiness", "stream-processing-readiness", "pipeline-orchestration-readiness", "service-mesh-readiness", "ingress-controller-readiness", "dns-readiness", "certificate-readiness", "cache-readiness", "logging-readiness", "feature-flag-readiness", "rate-limit-readiness", "error-tracking-readiness", "analytics-readiness", "http-client-readiness", "schema-validation-readiness", "datetime-readiness", "id-generation-readiness", "image-processing-readiness", "file-upload-readiness", "websocket-readiness", "realtime-media-readiness", "pdf-generation-readiness", "spreadsheet-readiness", "chart-visualization-readiness", "notebook-readiness", "map-visualization-readiness", "diagram-rendering-readiness", "link-integrity-readiness", "seo-metadata-readiness", "pwa-readiness", "browser-compat-readiness", "browser-extension-readiness", "env-validation-readiness", "security-headers-readiness", "graphql-readiness", "cli-readiness", "animation-readiness", "drag-and-drop-readiness", "rich-text-editor-readiness", "llm-readiness", "llm-eval-readiness", "llm-observability-readiness", "vector-db-readiness", "search-service-readiness", "object-storage-readiness", "realtime-collaboration-readiness", "workflow-orchestration-readiness", "openapi-client-readiness", "webhook-readiness", "notification-readiness", "consent-readiness", "privacy-readiness", "server-framework-readiness", "rpc-readiness", "workspace-graph-readiness", "scaffolding-readiness", "scheduler-readiness", "build-tool-readiness", "styling-readiness", "visual-regression-readiness", "infrastructure-readiness", "deployment-readiness", "serverless-readiness", "mobile-readiness", "desktop-readiness", "edge-readiness", "compose-readiness", "devcontainer-readiness", "kubernetes-readiness", "gitops-readiness", "context-pack", "mcp-handoff", "agent-memory", "graph-query", "tutorial-abstractions", "decision-records", "dependency-health", "vibe-coding-start", "learning-path", "quiz-print", "target === \"all\"", "--list-targets", "openTargetsMarkdown", "RepoTutor Open Targets", "open --list-targets supports --format", "openTargetEntries", "openTargetFile", "assertReadableFile", "Open target file not found", "Unsupported open target", "doctor", "doctorMarkdown", "RepoTutor Doctor", "doctor supports --format", "commands", "formats", "runtime", "studiesRoot", "envStudiesRoot", "verifyExport", "verifyEvidence", "exportSummary", "listFilters", "openTargets", "openAll", "filteredKind", "filteredFile", "--file", "--format json|markdown", "evidenceMarkdown", "returnedItems", "prune-source", "pruneSource", "writeSourcePrunePlan", "sourcePrunePlanMarkdown", "RepoTutor Source Prune Plan", "sourcePruneDryRun", "Dry-run only", "source-prune-plan.json", "source-prune-plan.md", "applied"]),
  check("source prune apply gate", [
    "packages/core/src/source-prune.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts",
    "README.md",
    "docs/product/storage-model.md"
  ], ["SourcePruneApplyResult", "applySourcePrunePlan", "sourcePruneApplyMarkdown", "source-prune-applied.json", "SOURCE-PRUNED.md", "--apply", "--confirm DELETE-SOURCE-SNAPSHOT", "DELETE-SOURCE-SNAPSHOT", "prune-source --apply requires --confirm DELETE-SOURCE-SNAPSHOT.", "Refusing to prune a path that is not inside the generated session `source/` snapshot.", "Generated Session \\`source/\\` Snapshot Pruned", "removedFiles", "removedBytes", "applied: true", "deletes only the generated session `source/` snapshot", "applies source prune only after the preserved artifact gate passes"]),
  check("source prune path guard generated session source snapshot wording", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Refusing to prune a path that is not inside the generated session `source/` snapshot.", "not.toContain(\"Refusing to prune a path that is not the session source snapshot.\")", "source prune path guard generated session source snapshot wording", "--iterations 297"], {
    forbidden: [
      "packages/core/src/source-prune.ts:Refusing to prune a path that is not the session source snapshot."
    ]
  }),
  check("source pruned tombstone generated session heading", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Generated Session \\`source/\\` Snapshot Pruned", "not.toContain(\"# Source Snapshot Pruned\")", "source pruned tombstone generated session heading", "--iterations 298"], {
    forbidden: [
      "packages/core/src/source-prune.ts:# Source Snapshot Pruned",
      "packages/core/src/pipeline.test.ts:expect(tombstone).toContain(\"# Source Snapshot Pruned\")"
    ]
  }),
  check("source pruned tombstone learner assets", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## 남긴 학습 자산", "생성된 세션 `source/` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아니라", "source-absorption-ledger: 어떤 기능과 판단을 앱에 흡수했는지 확인", "vibe-coding-prompt-pack: 비슷한 앱을 AI에게 지시할 프롬프트 확인", "## 다시 소스가 필요한 경우", "사용자 원본 소스 전체를 장기 앱 지식으로 보관하지 않습니다", "source pruned tombstone learner assets"]),
  check("source pruned tombstone learner assets markdown code path formatting", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/source-prune.ts:생성된 세션 \\`source/\\` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아니라", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아니라", "source pruned tombstone learner assets markdown code path formatting", "--iterations 309"], {
    forbidden: [
      "packages/core/src/source-prune.ts:생성된 세션 source/ 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아니라",
      "packages/core/src/pipeline.test.ts:생성된 세션 source/ 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아니라"
    ]
  }),
  check("source prune generated session source cleanup wording", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["생성된 세션 `source/` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다", "생성된 세션 `source/` 스냅샷은 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고", "source-retention-guide: 생성된 세션 `source/` 스냅샷 재확인 필요 여부 판단", "같은 원본 저장소나 폴더에서 새 세션", "사용자 원본 소스 전체를 장기 앱 지식으로 보관하지 않습니다", "source prune generated session source cleanup wording", "--iterations 280"], {
    forbidden: [
      "packages/core/src/source-prune.ts:원본 source/는 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다",
      "packages/core/src/source-prune.ts:원본 source/는 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고",
      "packages/core/src/source-prune.ts:원본 source/는 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아니라",
      "packages/core/src/source-prune.ts:source-retention-guide: 원본 소스 재조사 필요 여부 판단"
    ]
  }),
  check("sample source prune plan accept deploy cleanup boundary", [
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md:not final ACCEPT, deployment, or deletion permission",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md:READY_REVIEW 상태여도 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "sample source prune plan accept deploy cleanup boundary",
    "--iterations 359"
  ], {
    forbidden: [
      "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md:not deletion permission",
      "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md:READY_REVIEW 상태여도 삭제 허가가 아닙니다"
    ]
  }),
  check("source pruned tombstone cleanup condition markdown code path formatting", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/source-prune.ts:생성된 세션 \\`source/\\` 스냅샷은 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷은 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고", "source pruned tombstone cleanup condition markdown code path formatting", "--iterations 310"], {
    forbidden: [
      "packages/core/src/source-prune.ts:생성된 세션 source/ 스냅샷은 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고",
      "packages/core/src/pipeline.test.ts:생성된 세션 source/ 스냅샷은 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고"
    ]
  }),
  check("source pruned tombstone retention guide markdown code path formatting", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/source-prune.ts:source-retention-guide: 생성된 세션 \\`source/\\` 스냅샷 재확인 필요 여부 판단", "packages/core/src/pipeline.test.ts:source-retention-guide: 생성된 세션 `source/` 스냅샷 재확인 필요 여부 판단", "source pruned tombstone retention guide markdown code path formatting", "--iterations 311"], {
    forbidden: [
      "packages/core/src/source-prune.ts:source-retention-guide: 생성된 세션 source/ 스냅샷 재확인 필요 여부 판단",
      "packages/core/src/pipeline.test.ts:source-retention-guide: 생성된 세션 source/ 스냅샷 재확인 필요 여부 판단"
    ]
  }),
  check("source pruned tombstone regenerate source markdown code path formatting", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/source-prune.ts:\\`source/\\` 스냅샷을 다시 생성해 분석합니다", "packages/core/src/pipeline.test.ts:`source/` 스냅샷을 다시 생성해 분석합니다", "source pruned tombstone regenerate source markdown code path formatting", "--iterations 312"], {
    forbidden: [
      "packages/core/src/source-prune.ts:source/ 스냅샷을 다시 생성해 분석합니다",
      "packages/core/src/pipeline.test.ts:source/ 스냅샷을 다시 생성해 분석합니다"
    ]
  }),
  check("source cleanup review wording", [
    "apps/desktop-tauri/src/App.tsx",
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["정리 검토 조건과 보류 사유 확인", "생성된 세션 source/ 스냅샷은 소스 보존 게이트로 정리 검토 여부", "정리 검토 후보여도 원본이 아니라 생성된 세션 source/ 스냅샷만 대상으로 하세요", "생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰", "정리 후 학습은 보존된 리포트와 프롬프트를", "not.toContain(\"원본 source snapshot을 삭제해도 되는지\")", "not.toContain(\"삭제 후 학습\")", "source cleanup review wording", "--iterations 404"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:삭제 가능 조건과 보류 사유 확인",
      "apps/desktop-tauri/src/App.tsx:삭제 가능 여부를 판단합니다",
      "apps/desktop-tauri/src/App.tsx:삭제 가능하더라도 원본이 아니라 생성된 세션 source/ 스냅샷만 대상으로 하세요",
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 남은 산출물과 끊기는 evidence link",
      "packages/core/src/teaching-workspace.ts:원본 source snapshot을 삭제해도 되는지",
      "packages/core/src/source-prune.ts:삭제 후 학습"
    ]
  }),
  check("source prune status cleanup review wording", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/source-prune.ts:Already cleaned up: the generated session `source/` snapshot has been cleaned up", "packages/core/src/source-prune.ts:Dry-run only: the generated session `source/` snapshot is a cleanup review candidate", "packages/core/src/source-prune.ts:learner explicit confirmation that source links no longer need to open for this learning goal", "packages/core/src/source-prune.ts:explicit `DELETE-SOURCE-SNAPSHOT` confirmation token", "packages/core/src/source-prune.ts:READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission", "packages/core/src/source-prune.ts:Keep the generated session `source/` snapshot for now.", "packages/core/src/source-prune.ts:The generated session \\`source/\\` snapshot for this study session was cleaned up", "packages/core/src/pipeline.test.ts:not.toContain(\"and learner confirmation that source links no longer need to open for this learning goal.\")", "packages/core/src/pipeline.test.ts:not.toContain(\"source snapshot is ready for explicit user-approved cleanup\")", "packages/core/src/pipeline.test.ts:not.toContain(\"The original source snapshot for this study session was removed\")", "source prune status cleanup review wording", "--iterations 406"], {
    forbidden: [
      "packages/core/src/source-prune.ts:and learner confirmation that source links no longer need to open for this learning goal.",
      "packages/core/src/source-prune.ts:the source snapshot has been explicitly removed",
      "packages/core/src/source-prune.ts:the source snapshot is ready for explicit user-approved cleanup",
      "packages/core/src/source-prune.ts:Do not remove the source snapshot yet",
      "packages/core/src/source-prune.ts:The original source snapshot for this study session was removed"
    ]
  }),
  check("source prune applied retained learning artifacts", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourceKnowledgePolicy", "retainedLearningArtifacts", "source/ was temporary project evidence, not embedded AI development knowledge", "\"retainedLearningArtifacts\"", "reference/source-absorption-ledger.html", "html/vibe-coding-prompt-pack.html", "source prune applied retained learning artifacts"]),
  check("source prune applied learner cleanup decision", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/desktop-tauri/src/App.tsx",
    "docs/product/storage-model.md",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerCleanupDecision", "\"learnerCleanupDecision\"", "\"holdWhen\"", "정리 판단 조건", "정리 검토 조건", "정리 보류 조건", "생성된 세션 `source/` 스냅샷은 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고", "applied records keep the same `sourceKnowledgePolicy` and `learnerCleanupDecision`", "source prune applied learner cleanup decision"], {
    forbidden: ["packages/core/src/source-prune.ts:### 정리 가능 조건"]
  }),
  check("cli source prune generated session cleanup decision", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourcePruneCliCleanupDecision", "## CLI 정리 판단(토큰 전 보존)", "This command is dry-run only and does not delete the generated session `source/` snapshot.", "생성된 세션 \\`source/\\` 스냅샷은 AI 개발지식 내장 데이터가 아니라 이 세션의 프로젝트별 임시 근거입니다", "사용자 원본 소스는 CLI 정리 대상이 아니며", "정리된 것은 생성된 세션 `source/` 스냅샷입니다", "흡수 확인", "현재 목표 조사 확인", "source-retention-guide.html", "markdown/source-prune-plan.md", "현재 학습 목표에서 남은 조사 필요 여부", "아키텍처 이유, 역할 경계, AI 프롬프트, acceptance criteria, verification 기준", "생성된 세션 `source/` 스냅샷은 토큰 전 보존 상태입니다", "적용 검토 후보로 보세요", "READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "검토 후보 명령(토큰 전 보존)", "analysis/source-prune-applied.json", "cli source prune generated session cleanup decision", "--iterations 283"], {
    forbidden: [
      "apps/cli/src/index.ts:원본 source/는 AI 개발지식 내장 데이터가 아니라 이 세션의 프로젝트별 임시 근거입니다",
      "apps/cli/src/index.ts:This command is dry-run only and does not delete the source snapshot.",
      "apps/cli/src/index.ts:조사 종료 확인",
      "apps/cli/src/index.ts:source 링크가 더 이상 필요 없다고 명시 확인했을 때만",
      "apps/cli/src/index.ts:현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인했을 때만 적용 후보로 보세요",
      "apps/cli/src/index.ts:검토 후 직접 실행할 명령 후보"
    ]
  }),
  check("cli source prune dry run generated session source snapshot wording", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["This command is dry-run only and does not delete the generated session `source/` snapshot.", "cli source prune dry run generated session source snapshot wording", "--iterations 299"], {
    forbidden: [
      "apps/cli/src/index.ts:This command is dry-run only and does not delete the generated session source/ snapshot."
    ]
  }),
  check("product docs generated session source evidence wording", [
    "docs/product/learning-mission.md",
    "docs/research/vibe-coding-best-practices.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["generated-session source evidence", "product docs generated session source evidence wording", "--iterations 300"], {
    forbidden: [
      "docs/product/learning-mission.md:static source evidence",
      "docs/research/vibe-coding-best-practices.md:static source evidence"
    ]
  }),
  check("source absorption markdown generated session source snapshot heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Generated Session Source Snapshot", "not.toContain(\"## Source Snapshot\")", "source absorption markdown generated session source snapshot heading", "--iterations 301"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:## Source Snapshot"
    ]
  }),
  check("vibe start source retention code path formatting", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 준비된 뒤에만 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다", "packages/core/src/pipeline.test.ts:생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다", "packages/core/src/pipeline.test.ts:not.toContain(\"보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표가 남았는지 확인한 뒤 생성된 세션 <code>source/</code>\")", "packages/core/src/pipeline.test.ts:not.toContain(\"evidence, daily summary, prompt pack, verification이 남았는지 확인한 뒤 생성된 세션 source/ 스냅샷\")", "vibe start source retention code path formatting", "--iterations 400"], {
    forbidden: [
      "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표가 남았는지 확인한 뒤 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다",
      "packages/html/src/templates.ts:evidence, daily summary, prompt pack, verification이 남았는지 확인한 뒤 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다"
    ]
  }),
  check("desktop source retention purpose code path formatting", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:생성된 세션 <code>source/</code> 스냅샷은 영구 내장 지식이 아니라", "desktop source retention purpose code path formatting", "--iterations 303"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:생성된 세션 source/ 스냅샷은 영구 내장 지식이 아니라"
    ]
  }),
  check("desktop source retention checkpoint code path formatting", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:정리 전 확인: 생성된 세션 <code>source/</code> 스냅샷을 보관하는 목적이 아니라", "desktop source retention checkpoint code path formatting", "--iterations 304"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:정리 전 확인: 생성된 세션 source/ 스냅샷을 보관하는 목적이 아니라"
    ]
  }),
  check("desktop retained learning empty code path formatting", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:상태 확인을 실행하면 생성된 세션 <code>source/</code> 스냅샷 대신 남겨야 할 핵심 학습 자산", "desktop retained learning empty code path formatting", "--iterations 305"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:상태 확인을 실행하면 생성된 세션 source/ 스냅샷 대신 남겨야 할 핵심 학습 자산"
    ]
  }),
  check("cli source prune markdown code path formatting", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/cli/src/index.ts:생성된 세션 \\`source/\\` 스냅샷은 AI 개발지식 내장 데이터가 아니라", "apps/cli/src/index.ts:정리된 것은 생성된 세션 `source/` 스냅샷입니다", "apps/cli/src/index.ts:아직 dry-run입니다. 생성된 세션 `source/` 스냅샷은", "cli source prune markdown code path formatting", "--iterations 306"], {
    forbidden: [
      "apps/cli/src/index.ts:생성된 세션 source/ 스냅샷은 AI 개발지식 내장 데이터가 아니라",
      "apps/cli/src/index.ts:정리된 것은 생성된 세션 source/ 스냅샷입니다",
      "apps/cli/src/index.ts:아직 dry-run입니다. 생성된 세션 source/ 스냅샷은"
    ]
  }),
  check("source prune preserved bundle markdown code path formatting", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/source-prune.ts:이 묶음은 생성된 세션 \\`source/\\` 스냅샷 정리 전 반드시 남아야 합니다", "packages/core/src/pipeline.test.ts:이 묶음은 생성된 세션 `source/` 스냅샷 정리 전 반드시 남아야 합니다", "source prune preserved bundle markdown code path formatting", "--iterations 307"], {
    forbidden: [
      "packages/core/src/source-prune.ts:이 묶음은 생성된 세션 source/ 스냅샷 정리 전 반드시 남아야 합니다",
      "packages/core/src/pipeline.test.ts:이 묶음은 생성된 세션 source/ 스냅샷 정리 전 반드시 남아야 합니다"
    ]
  }),
  check("source prune learner cleanup markdown code path formatting", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/source-prune.ts:생성된 세션 \\`source/\\` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다", "source prune learner cleanup markdown code path formatting", "--iterations 308"], {
    forbidden: [
      "packages/core/src/source-prune.ts:생성된 세션 source/ 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다",
      "packages/core/src/pipeline.test.ts:생성된 세션 source/ 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다"
    ]
  }),
  check("cli source prune help review wording", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["prune-source option: dry-run writes source-prune-plan reports first", "--apply is a reviewed command candidate only after the prune gate passes", "preserved evidence bundle remains available", "learner explicitly confirms source links no longer need to open for the current learning goal", "--confirm DELETE-SOURCE-SNAPSHOT is supplied", "READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission", "cli source prune help review wording"], {
    forbidden: ["apps/cli/src/index.ts:prune-source option: --apply deletes only the generated session source snapshot"]
  }),
  check("cli source prune verification record cleanup boundary", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/cli/src/index.ts:preserved evidence bundle remains available, session verification and verification records pass",
    "apps/cli/src/index.ts:markdown/session-verification.md\\`, 검증 기록",
    "apps/cli/src/index.ts:실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인",
    "apps/cli/src/index.ts:verification 기준, 검증 기록을 설명하고 현재 학습 목표",
    "cli source prune verification record cleanup boundary",
    "cli source prune apply boundary current goal confirmation",
    "--iterations 395"
  ], {
    forbidden: [
      "apps/cli/src/index.ts:preserved evidence bundle remains available, the learner explicitly confirms source links",
      "apps/cli/src/index.ts:html/session-verification.html\\`, \\`reference/source-retention-guide.html\\`이 남아 있어야 합니다.",
      "apps/cli/src/index.ts:실제 적용은 학습자 명시 확인과 \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰이 모두 있을 때만 검토하세요.",
      "apps/cli/src/index.ts:실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표 확인, 학습자 명시 확인",
      "apps/cli/src/index.ts:실제 적용은 세션 검증과 검증 기록 확인, 학습자 명시 확인",
      "apps/cli/src/index.ts:verification 기준을 설명하고 현재 학습 목표"
    ]
  }),
  check("cli source prune ready-review source-link confirmation boundary", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/cli/src/index.ts:READY_REVIEW 경계: dry-run plan의 READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "apps/cli/src/index.ts:실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인",
    "apps/cli/src/index.ts:DELETE-SOURCE-SNAPSHOT\\` 확인 토큰이 모두 있을 때만 검토하세요",
    "cli source prune ready-review source-link confirmation boundary",
    "--iterations 414"
  ], {
    forbidden: [
      "apps/cli/src/index.ts:실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표 확인, 학습자 명시 확인",
      "apps/cli/src/index.ts:현재 학습 목표 확인, 학습자 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰이 모두 있을 때만 검토하세요"
    ]
  }),
  check("cli source prune compact token boundary", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/cli/src/index.ts:## CLI 정리 판단(토큰 전 보존)",
    "apps/cli/src/index.ts:생성된 세션 `source/` 스냅샷은 토큰 전 보존 상태입니다",
    "apps/cli/src/index.ts:적용 검토 후보로 보세요",
    "apps/cli/src/index.ts:READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission",
    "apps/cli/src/index.ts:검토 후보 명령(토큰 전 보존)",
    "cli source prune compact token boundary",
    "--iterations 344"
  ], {
    forbidden: [
      "apps/cli/src/index.ts:검토 후 직접 실행할 명령 후보",
      "apps/cli/src/index.ts:적용 후보로 보세요"
    ]
  }),
  check("source prune plan machine readable learner cleanup decision", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/desktop-tauri/src/App.tsx",
    "docs/product/storage-model.md",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["SourcePruneLearnerCleanupDecision", "learnerCleanupDecision", "sourceKnowledgePolicy", "project-specific evidence for purpose, architecture reasons, role terms, AI prompts, acceptance criteria, and verification boundaries", "Session verification, verification records, and the preserved evidence bundle all pass.", "Verification commands, verification records, or human review criteria are missing.", "retainedEvidence", "정리 검토 조건", "정리 보류 조건", "source prune plan machine readable learner cleanup decision", "--iterations 377"], {
    forbidden: ["packages/core/src/source-prune.ts:### 정리 가능 조건"]
  }),
  check("source prune learner cleanup decision verification record boundary", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-prune-plan.json",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/source-prune.ts:Session verification, verification records, and the preserved evidence bundle all pass.",
    "packages/core/src/source-prune.ts:Verification commands, verification records, or human review criteria are missing.",
    "packages/core/src/pipeline.test.ts:Session verification, verification records, and the preserved evidence bundle all pass.",
    "packages/core/src/pipeline.test.ts:Verification commands, verification records, or human review criteria are missing.",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-prune-plan.json:Session verification, verification records, and the preserved evidence bundle all pass.",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-prune-plan.json:Verification commands, verification records, or human review criteria are missing.",
    "source prune learner cleanup decision verification record boundary",
    "--iterations 377"
  ], {
    forbidden: [
      "packages/core/src/source-prune.ts:Session verification and the preserved evidence bundle both pass.",
      "packages/core/src/source-prune.ts:Verification commands or human review criteria are missing.",
      "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-prune-plan.json:Session verification and the preserved evidence bundle both pass.",
      "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-prune-plan.json:Verification commands or human review criteria are missing."
    ]
  }),
  check("desktop source retention decision prompt verification record boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS입니다",
    "apps/desktop-tauri/src/App.tsx:검증 명령, 검증 기록, 사람의 리뷰 기준 중 하나가 빠져 있습니다",
    "apps/desktop-tauri/src/App.tsx:세션 검증, 검증 기록, 보존 증거 묶음을 먼저 확인합니다",
    "apps/desktop-tauri/src/App.tsx:검증/기록 기준",
    "apps/desktop-tauri/src/App.tsx:정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 모두 필요합니다",
    "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 클립보드에 초안 저장됨: 전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다",
    "apps/desktop-tauri/src/App.tsx:dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인 후 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 생성된 세션 source/ 스냅샷만 정리합니다",
    "desktop source retention decision prompt verification record boundary",
    "--iterations 402"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:세션 검증과 보존 증거 묶음이 모두 PASS입니다",
      "apps/desktop-tauri/src/App.tsx:검증 명령이나 사람의 리뷰 기준이 빠져 있습니다",
      "apps/desktop-tauri/src/App.tsx:세션 검증과 보존 증거 묶음을 먼저 확인합니다",
      "apps/desktop-tauri/src/App.tsx:정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 학습자 명시 확인이 모두 필요합니다",
      "apps/desktop-tauri/src/App.tsx:정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인이 모두 필요합니다",
      "apps/desktop-tauri/src/App.tsx:정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 모두 필요합니다",
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 클립보드에 초안 저장됨: 전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 클립보드에 초안 저장됨: 전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표의 학습자 명시 확인 후 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 생성된 세션 source/ 스냅샷만 정리합니다",
      "apps/desktop-tauri/src/App.tsx:전송 전 보존 증거 묶음, 현재 학습 목표, 학습자 명시 확인 조건을 검토"
    ]
  }),
  check("desktop source retention apply prompt verification record boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:정리 전 markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록을 확인했고",
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 명시 확인했다는 뜻입니다",
    "desktop source retention apply prompt verification record boundary",
    "--iterations 383"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:정리 전 markdown/source-prune-plan.md dry-run plan과 보존 증거 묶음을 확인했고"
    ]
  }),
  check("desktop source absorption summary verification record display boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:hint: \"세션 검증 PASS · 검증 기록 확인\"",
    "apps/desktop-tauri/src/App.tsx:세션 검증 PASS · 검증 기록 확인",
    "apps/desktop-tauri/src/App.tsx:세션 검증/검증 기록 확인 필요",
    "desktop source absorption summary verification record display boundary",
    "--iterations 384"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:hint: \"세션 검증 PASS\"",
      "apps/desktop-tauri/src/App.tsx:sourcePrune?.checks?.sessionVerificationOk ? \"세션 검증 PASS\" : \"검증 확인 필요\""
    ]
  }),
  check("source prune markdown learner question verification record boundary", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/source-prune.ts:정리 전 확인: 세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS인가요?",
    "packages/core/src/pipeline.test.ts:세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS인가요?",
    "packages/core/src/pipeline.test.ts:not.toContain(\"세션 검증과 보존 증거 묶음이 PASS인가요?\")",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md:정리 전 확인: 세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS인가요?",
    "source prune markdown learner question verification record boundary",
    "--iterations 379"
  ], {
    forbidden: [
      "packages/core/src/source-prune.ts:정리 전 확인: 세션 검증과 보존 증거 묶음이 PASS인가요?",
      "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md:정리 전 확인: 세션 검증과 보존 증거 묶음이 PASS인가요?"
    ]
  }),
  check("cli sidecar dev runtime deps freshness guard", [
    "package.json",
    "apps/cli/package.json",
    "apps/desktop-tauri/package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["build:runtime-deps", "pnpm -r --sort --filter @repotutor/shared --filter @repotutor/codex --filter @repotutor/html --filter @repotutor/core build", "pnpm -w build:runtime-deps && tsx src/index.ts", "pnpm -w build:runtime-deps && tsx sidecar/bridge.ts", "stale `dist`", "cli sidecar dev runtime deps freshness guard"]),
  check("source pruned verification", [
    "packages/core/src/evidence.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts",
    "README.md",
    "docs/product/storage-model.md",
    "docs/research/vibe-coding-best-practices.md"
  ], ["sourcePruned", "skippedPrunedSourceLinks", "isSourcePruned", "source-prune-applied.json", "SOURCE-PRUNED.md", "verifyEvidenceIndexReport", "verifyStudySessionArtifacts", "prunedSessionVerification", "prunedEvidenceVerification", "tombstone-aware", "pruned sessions stay verifiable", "intentionally pruned generated session `source/`"]),
  check("desktop source retention controls", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "README.md",
    "docs/product/storage-model.md",
    "docs/research/vibe-coding-best-practices.md"
  ], ["SourcePruneResponse", "sourcePrune", "refreshSourceRetention", "applySourceRetentionCleanup", "source_prune_plan", "apply_source_prune", "sourcePrunePlan", "applySourcePrune", "retention-panel", "retention-actions", "소스 보존 상태", "상태 확인", "토큰 확인 후 세션 스냅샷만 정리", "dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인 후 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 생성된 세션 source/ 스냅샷만 정리합니다", "READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "DELETE-SOURCE-SNAPSHOT", "desktop retention controls", "Desktop UI"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:소스 스냅샷 삭제",
      "apps/desktop-tauri/src/App.tsx:dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표의 학습자 명시 확인 후 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 생성된 세션 source/ 스냅샷만 정리합니다"
    ]
  }),
  check("desktop destructive cleanup confirmation token boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:window.prompt(\"정리 전 markdown/source-prune-plan.md",
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 명시 확인했다는 뜻입니다",
    "apps/desktop-tauri/src/App.tsx:소스 정리 취소: DELETE-SOURCE-SNAPSHOT 확인 토큰이 일치하지 않아 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 학습자 명시 확인이 완료되지 않았습니다",
    "desktop destructive cleanup confirmation token boundary",
    "--iterations 412"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 마지막 현재 목표 및 학습자 명시 확인입니다",
      "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 마지막 현재 목표 확인입니다",
      "apps/desktop-tauri/src/App.tsx:소스 정리 취소: DELETE-SOURCE-SNAPSHOT 확인 토큰이 일치하지 않아 현재 학습 목표 확인이 완료되지 않았습니다",
      "apps/desktop-tauri/src/App.tsx:소스 정리 취소: DELETE-SOURCE-SNAPSHOT 확인 토큰이 일치하지 않아 현재 학습 목표와 학습자 명시 확인이 완료되지 않았습니다"
    ]
  }),
  check("desktop source retention peripheral explicit confirmation boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/report-targets.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/report-targets.ts:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 남아야",
    "apps/desktop-tauri/src/App.tsx:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인과 DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤의 정리 검토 후보입니다",
    "apps/desktop-tauri/src/App.tsx:현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 토큰 전 정리 검토 후보를 판단할 수 있습니다",
    "apps/desktop-tauri/src/report-targets.ts:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 남아야",
    "apps/desktop-tauri/src/App.tsx:source 링크 정리 명시 확인 및 DELETE-SOURCE-SNAPSHOT 토큰 후",
    "desktop source retention peripheral explicit confirmation boundary",
    "--iterations 413"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 남아야",
      "apps/desktop-tauri/src/App.tsx:학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤의 정리 검토 후보입니다",
      "apps/desktop-tauri/src/App.tsx:현재 학습 목표 기준으로 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 토큰 전 정리 검토 후보를 판단할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 모두 필요합니다",
      "apps/desktop-tauri/src/App.tsx:학습자 명시 확인 및 DELETE-SOURCE-SNAPSHOT 토큰 후",
      "apps/desktop-tauri/src/App.tsx:현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건"
    ]
  }),
  check("desktop learner brief goal alignment", [
    "packages/core/src/pipeline.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src-tauri/src/commands.rs",
    "apps/desktop-tauri/src/styles.css",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "README.md",
    "docs/product/storage-model.md",
    "docs/research/vibe-coding-best-practices.md"
  ], ["learnerBriefText", "inline:learner-brief", "provide learner brief path or learner brief text, not both.", "learner brief text must be 200 KB or smaller.", "accepts inline learner brief text for desktop goal alignment", "내 목표 / PRD / 이슈 / AI 프롬프트", "learner-brief-input", "repotutor-tauri-learner-brief", "Desktop learner brief", "source-grounded goal alignment", "not a traditional development lesson", "vibe-coding learner"]),
  check("desktop learner brief readiness cues", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerBriefReadinessChecks", "normalizedLearnerBrief", "aria-label=\"바이브코딩 브리프 준비도\"", "문법 암기보다 AI에게 줄 맥락", "목적/문제", "구조/역할", "검증/AI 지시", "준비됨", "보강 필요", "brief-readiness", "desktop learner brief readiness cues"]),
  check("desktop learner brief scaffold", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerBriefScaffold", "function addLearnerBriefScaffold()", "setLearnerBriefText", "브리프 예시 추가", "내 목표:", "배울 구조:", "AI 지시:", "검증 기준:", "brief-scaffold-button", "목적, 구조, AI 지시, 검증 기준을 보강합니다", "desktop learner brief scaffold"]),
  check("desktop learner brief readiness summary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerBriefReadyCount", "learnerBriefReadinessSummary", "브리프 준비도", "AI 지시 초안 검토 후보", "맥락 보강 필요", "brief-readiness-summary", "aria-live=\"polite\"", "desktop learner brief readiness summary", "--iterations 215"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:브리프 준비도 ${learnerBriefReadyCount}/${learnerBriefReadinessChecks.length} · AI 지시 가능",
      "apps/desktop-tauri/src/App.tsx:AI 지시 초안 검토 가능"
    ]
  }),
  check("desktop learner brief next step", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerBriefMissingLabels", "learnerBriefNextStep", "다음 보강:", "맥락을 한 문장씩 추가하세요", "검토 준비 후보입니다. 학습 시작 전 AI 구현 브리프와 검증 기준을 다시 확인하세요", "brief-readiness-next", "desktop learner brief next step", "--iterations 214"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:준비 완료. 학습 시작 후 AI 구현 브리프와 검증 기준을 확인하세요",
      "apps/desktop-tauri/src/App.tsx:검토 준비 완료. 학습 시작 전 AI 구현 브리프와 검증 기준을 최종 확인하세요"
    ]
  }),
  check("desktop initial log idle wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["RepoTutor Studio 대기 중: 소스를 입력하면 학습 설계를 시작합니다", "desktop initial log idle wording", "--iterations 232"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:RepoTutor Studio 준비 완료"
    ]
  }),
  check("desktop study output generated log wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["학습 설계 산출물 생성됨: ${result.html}", "첫 화면: 바이브코딩 시작 가이드", "desktop study output generated log wording", "--iterations 234"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:완료: ${result.html}"
    ]
  }),
  check("desktop session complete status output label", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["const statusLabels: Record<string, string>", "complete: \"산출물 생성됨\"", "statusLabels[current.status] ?? current.status", "desktop session complete status output label", "--iterations 237"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:complete: \"완료\""
    ]
  }),
  check("desktop learner brief prompt draft", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerPromptDraftLines", "learnerPromptDraft", "AI 구현 지시문 초안", "첫 vertical slice", "문법 설명보다 제품 목적", "정적 분석 근거와 실제 실행/테스트 필요 항목", "brief-prompt-draft", "desktop learner brief prompt draft"]),
  check("desktop vibe coding intent guard", [
    "apps/desktop-tauri/src/App.tsx",
    "docs/product/learning-mission.md",
    "docs/product/storage-model.md",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI는 일반 개발지식을 이미 알고 있으므로", "소스를 지식으로 내장하지 말고", "바이브코딩 학습자가 AI를 지휘하고 검토", "전통적인 문법 강의나 라인별 코딩 수업이 아니라", "소스는 AI에게 개발지식을 새로 가르치는 내장 데이터가 아니라", "vibe-coding learner", "not a traditional programming course", "not a language syntax tutor", "desktop vibe coding intent guard"]),
  check("desktop learner brief prompt copy", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Copy", "copyLearnerPromptDraft", "navigator.clipboard?.writeText", "document.execCommand(\"copy\")", "AI 지시문 클립보드 저장", "AI 구현 지시문 클립보드에 초안 저장됨", "prompt-copy-button", "prompt-draft-header", "desktop learner brief prompt copy", "--iterations 242"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 지시문 클립보드 저장 완료"
    ]
  }),
  check("desktop ai response review checklist", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerAiResponseReviewChecks", "AI 응답 검토 기준", "목적 보존", "역할 경계", "검증 근거", "원래 문제와 학습자 목표", "아키텍처, 폴더, 파일 책임", "정적 분석 근거와 실제 실행/테스트 필요 항목", "ai-response-review", "desktop ai response review checklist"]),
  check("desktop ai response review state", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["aiResponseReviewState", "aiResponseReviewDoneCount", "aiResponseReviewSummary", "toggleAiResponseReview", "resetAiResponseReview", "prependLogOnce", "visibleLog", "AI 응답 검토 0/3 확인됨", "구현 지시 검토 후보", "AI 응답 검토 초기화", "checked={Boolean(aiResponseReviewState[item.label])}", "ai-response-review-reset", "desktop ai response review state", "--iterations 213"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 응답 검토 ${aiResponseReviewDoneCount}/${learnerAiResponseReviewChecks.length} 완료",
      "apps/desktop-tauri/src/App.tsx:구현 지시 검토됨"
    ]
  }),
  check("desktop review checklist toggle log wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 응답 검토 ${status}: ${label}", "AI 구현 결과 검토 ${status}: ${label}", "nextChecked ? \"체크됨\" : \"해제\"", "desktop review checklist toggle log wording", "--iterations 233"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:nextChecked ? \"완료\" : \"해제\""
    ]
  }),
  check("desktop ai response revision prompt", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["aiResponseRevisionMissingLabels", "aiResponseRevisionPromptLines", "aiResponseRevisionPrompt", "AI 응답 보강 프롬프트 초안", "방금 받은 AI 응답을 아래 기준으로 다시 보강하세요", "부족한 검토 기준:", "수정된 첫 vertical slice", "AI 응답 검토 기준이 모두 확인됐습니다.", "제안된 첫 vertical slice를 바로 보내지 말고", "실행 전 수락 기준과 테스트 비교 방법을 다시 확인하세요", "ai-response-revision", "desktop ai response revision prompt"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:제안된 첫 vertical slice를 작은 구현 단위로 실행하고",
      "apps/desktop-tauri/src/App.tsx:AI 응답 검토가 완료되었습니다.",
      "apps/desktop-tauri/src/App.tsx:AI 응답 검토 기준이 모두 체크됐습니다.",
      "apps/desktop-tauri/src/App.tsx:실행 전 수락 기준과 테스트 비교 방법을 최종 확인하세요"
    ]
  }),
  check("desktop ai response revision prompt copy", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["copyTextToClipboard", "copyAiResponseRevisionPrompt", "AI 보강문 클립보드 저장", "AI 응답 보강 프롬프트 클립보드에 초안 저장됨", "AI 응답 보강 프롬프트 클립보드 저장 오류", "revision-prompt-header", "revision-copy-button", "navigator.clipboard?.writeText", "document.execCommand(\"copy\")", "desktop ai response revision prompt copy", "--iterations 243"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 응답 보강 프롬프트 클립보드 저장 완료"
    ]
  }),
  check("desktop command input accessible labels", [
    "apps/desktop-tauri/src/App.tsx",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["htmlFor=\"source-target-input\"", "id=\"source-target-input\"", "htmlFor=\"learner-brief-textarea\"", "id=\"learner-brief-textarea\"", "getByLabel", "desktop command input accessible labels"]),
  check("desktop session search filter", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sessionSearch", "filteredSessions", "aria-label=\"세션 검색\"", "검색 결과가 없습니다", "session-empty", "desktop session search filter"]),
  check("offline html search accessible label", [
    "packages/html/src/templates.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["id=\"search\" type=\"search\" aria-label=\"리포트 검색\"", "getByLabel", "offline html search accessible label"]),
  check("compliance audit snapshot reuse", [
    "scripts/compliance-audit.mjs"
  ], ["const baseChecks = checks.map((fn) => fn());", "cloneAuditChecks", "compliance audit snapshot reuse"]),
  check("desktop build app typecheck gate", [
    "apps/desktop-tauri/package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["pnpm -w build:runtime-deps && node ../../scripts/build-desktop-sidecar-bundle.mjs && tsc -p tsconfig.app.json --noEmit && vite build", "desktop build app typecheck gate"]),
  check("desktop historical quiz summary", [
    "apps/desktop-tauri/src/App.tsx",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["function quizSummaryText", "function scoreSummaryText", "최근 ${scoreSummaryText(selectedSession)}", "session.score === null ? \"미응시\" : `${session.score}점`", "desktop historical quiz summary"]),
  check("desktop vibe-first session landing", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/report-targets.ts",
    "packages/shared/src/report-targets.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["export const vibeCodingStartTab = \"시작\"", "export const vibeCodingStartTarget = \"vibe-coding-start\"", "setActiveTab(vibeCodingStartTab)", "setSelectedTarget(vibeCodingStartTarget)", "첫 화면: 바이브코딩 시작 가이드", "소스 흡수 기록", "소스 보존 판단", "title: \"소스 흡수 기록\"", "desktop vibe-first session landing"]),
  check("desktop session auto refresh", [
    "apps/desktop-tauri/src/App.tsx",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["useEffect", "void refreshSessions({ autoResumeLatest: true });", "세션 목록 자동 로드", "desktop session auto refresh"]),
  check("desktop latest session auto resume", [
    "apps/desktop-tauri/src/App.tsx",
    "packages/core/src/sessions.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["useRef", "didAutoResumeSession", "autoResumeLatest", "selectSession(result[0])", "b.createdAt.localeCompare(a.createdAt)", "최신 세션 자동 이어보기", "desktop latest session auto resume"]),
  check("desktop selected session row state", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["current?.path === session.path ? \"session-row active\" : \"session-row\"", ".session-row.active", "box-shadow: inset 3px 0 0 var(--signal);", "선택된 세션 행 표시", "desktop selected session row state"]),
  check("desktop source evidence mission copy", [
    "apps/desktop-tauri/src/App.tsx",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["소스는 영구 내장 지식이 아니라 프로젝트별 임시 근거입니다.", "임시 소스 근거", "소스는 임시 근거", "학습 자산으로 남깁니다", "desktop source evidence mission copy"]),
  check("desktop cleanup decision implementation request review wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["cleanupDecisionText", "구현 브리프와 프롬프트 팩으로 첫 vertical slice 요청 후보를 검토 후 다듬을 수 있습니다", "desktop cleanup decision implementation request review wording"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:구현 브리프와 프롬프트 팩으로 첫 vertical slice를 AI에게 요청할 수 있습니다"
    ]
  }),
  check("study readme vibe-first start", [
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Start Here", "html/vibe-coding-start.html", "brief, steer, and review AI", "temporary project evidence", "reference/source-absorption-ledger.html", "reference/source-retention-guide.html", "study readme vibe-first start"]),
  check("vibe start source purpose primer", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## 왜 소스를 보는가", "AI는 일반 개발지식을 이미 가지고 있습니다", "지식을 내장하기 위해서가 아니라", "학습자는 문법을 암기하지 않고", "vibe start source purpose primer"]),
  check("vibe start source cleanup checkpoint", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["소스 정리 전 체크포인트", "source-absorption-ledger.html", "session-verification.html", "source-retention-guide.html", "보존/정리 판단 가이드의 READY_REVIEW", "READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "vibe start source cleanup checkpoint", "--iterations 400"], {
    forbidden: [
      "packages/core/src/pipeline.test.ts:expect(vibeStartMarkdown).toContain(\"보존/정리 판단 가이드가 READY_REVIEW\")"
    ]
  }),
  check("vibe start html cleanup ready review wording", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/html/src/templates.ts:보존/정리 판단 가이드의 READY_REVIEW", "READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "vibe start html cleanup ready review wording"], {
    forbidden: ["packages/html/src/templates.ts:보존/삭제 판단 가이드가 READY인지 확인합니다"]
  }),
  check("study readme source cleanup gate", [
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Source Cleanup Gate", "prune-source", "--format markdown", "--apply --confirm DELETE-SOURCE-SNAPSHOT", "DELETE-SOURCE-SNAPSHOT", "dry-run Markdown reports READY_REVIEW", "READY_REVIEW is a cleanup review", "not final ACCEPT", "deployment, or deletion permission", "preserved learning artifacts and evidence bundle are present", "source links no longer need to open for the current learning goal", "Cleanup deletes only the generated session", "snapshot, not user-provided source", "study readme source cleanup gate"], {
    forbidden: ["packages/core/src/markdown.ts:source links will no longer be needed"]
  }),
  check("docs source cleanup command token boundary", [
    "README.md",
    "docs/product/storage-model.md",
    "docs/research/vibe-coding-best-practices.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "README.md:READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission",
    "README.md:explicit learner confirmation that source links no longer need to open",
    "README.md:for the current learning goal, and the explicit confirmation token",
    "README.md:treat `READY_REVIEW` as a review candidate",
    "docs/product/storage-model.md:`READY_REVIEW` alone is a cleanup review candidate, not final ACCEPT,",
    "docs/research/vibe-coding-best-practices.md:`READY_REVIEW` alone is a cleanup review candidate, not final ACCEPT,",
    "docs source cleanup command token boundary",
    "--iterations 345"
  ]),
  check("vibe coding best practices cleanup verification record boundary", [
    "docs/research/vibe-coding-best-practices.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "docs/research/vibe-coding-best-practices.md:preserved evidence bundle remains available, session verification and",
    "docs/research/vibe-coding-best-practices.md:verification records pass, the learner explicitly confirms source links no",
    "docs/research/vibe-coding-best-practices.md:longer need to open for the current learning goal, and the",
    "docs/research/vibe-coding-best-practices.md:preserved-evidence, session-verification, verification-record,",
    "docs/research/vibe-coding-best-practices.md:source-link explicit-confirmation, and confirmation-token flow",
    "vibe coding best practices cleanup verification record boundary",
    "--iterations 398"
  ], {
    forbidden: [
      "docs/research/vibe-coding-best-practices.md:preserved learning artifacts and verification reports pass the prune gate",
      "docs/research/vibe-coding-best-practices.md:preserved learning artifacts, session verification, verification records, and",
      "docs/research/vibe-coding-best-practices.md:verification records pass, the learner explicitly confirms current-goal",
      "docs/research/vibe-coding-best-practices.md:current-goal confirmation pass the prune gate",
      "docs/research/vibe-coding-best-practices.md:verification-record, current-goal confirmation, and confirmation-token flow",
      "docs/research/vibe-coding-best-practices.md:current-goal learner-confirmation, and confirmation-token flow"
    ]
  }),
  check("external source lifecycle disposable work copy cleanup", [
    "docs/research/external-source-lifecycle.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Disposable external-source work copies under `research/external-src/`", "Prune the disposable work copy only after", "linked to a retained", "verification record", "After absorption, retained-evidence verification, and a recorded", "no-further-analysis decision", "not the learner's source repository", "not the generated", "not product source", "external source lifecycle disposable work copy cleanup", "--iterations 373"], {
    forbidden: [
      "docs/research/external-source-lifecycle.md:Delete the clone after",
      "docs/research/external-source-lifecycle.md:delete local clones from `research/external-src/`"
    ]
  }),
  check("mission external lifecycle cleanup review boundary", [
    "docs/product/learning-mission.md",
    "docs/research/external-source-lifecycle.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "docs/product/learning-mission.md:`READY_REVIEW` is only a cleanup review state,",
    "docs/product/learning-mission.md:not final ACCEPT, deployment, or cleanup permission",
    "docs/product/learning-mission.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final\nexplicit confirmation that source links no longer need to open",
    "docs/product/learning-mission.md:preserved evidence bundle",
    "docs/product/learning-mission.md:session verification and verification records pass",
    "docs/product/learning-mission.md:That external-cache cleanup is not",
    "docs/product/learning-mission.md:final ACCEPT, deployment, or study-session cleanup permission.",
    "docs/research/external-source-lifecycle.md:Record what was absorbed and why no further analysis is needed for this",
    "docs/research/external-source-lifecycle.md:This external-cache policy does not grant study-session `READY_REVIEW` final",
    "docs/research/external-source-lifecycle.md:requires the preserved evidence bundle, session verification, verification",
    "docs/research/external-source-lifecycle.md:records, learner explicit confirmation that source links no longer need to",
    "mission external lifecycle cleanup review boundary",
    "--iterations 397"
  ], {
    forbidden: [
      "docs/product/learning-mission.md:Cleanup may target only the generated session `source/` snapshot after retained learning artifacts,",
      "docs/product/learning-mission.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's current-goal",
      "docs/product/learning-mission.md:verification records, and explicit learner confirmation exist for the current",
      "docs/research/external-source-lifecycle.md:requires session verification, verification records, current-goal learner"
    ]
  }),
  check("docs source cleanup verification record boundary", [
    "README.md",
    "docs/research/external-source-lifecycle.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "README.md:explicit learner confirmation that source links no longer need to open",
    "README.md:for the current learning goal, and the explicit confirmation token",
    "README.md:bundle, session verification, and verification records",
    "docs/research/external-source-lifecycle.md:linked to a retained",
    "docs/research/external-source-lifecycle.md:verification record",
    "docs/research/external-source-lifecycle.md:no-further-analysis decision",
    "docs/research/external-source-lifecycle.md:requires the preserved evidence bundle, session verification, verification",
    "docs/research/external-source-lifecycle.md:records, learner explicit confirmation that source links no longer need to",
    "docs source cleanup verification record boundary",
    "--iterations 397"
  ], {
    forbidden: [
      "README.md:session verification, verification records, learner confirmation for the current learning goal",
      "README.md:# learner confirmation for the current learning goal, and the explicit confirmation token",
      "docs/research/external-source-lifecycle.md:requires current-goal learner confirmation and the explicit",
      "docs/research/external-source-lifecycle.md:requires session verification, verification records, current-goal learner"
    ]
  }),
  check("research docs source cleanup token source-link confirmation boundary", [
    "docs/research/external-source-lifecycle.md",
    "docs/research/vibe-coding-best-practices.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "docs/research/external-source-lifecycle.md:records, learner explicit confirmation that source links no longer need to",
    "docs/research/vibe-coding-best-practices.md:verification records pass, the learner explicitly confirms source links no",
    "docs/research/vibe-coding-best-practices.md:source-link explicit-confirmation, and confirmation-token flow",
    "research docs source cleanup token source-link confirmation boundary",
    "--iterations 428"
  ], {
    forbidden: [
      "docs/research/external-source-lifecycle.md:records, current-goal learner confirmation, and the explicit",
      "docs/research/vibe-coding-best-practices.md:verification records pass, the learner explicitly confirms current-goal",
      "docs/research/vibe-coding-best-practices.md:current-goal learner-confirmation, and confirmation-token flow"
    ]
  }),
  check("readme cleanup explicit learner confirmation boundary", [
    "README.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "README.md:explicit learner confirmation that source links no longer need to open",
    "README.md:for the current learning goal, and the explicit confirmation token",
    "README.md:require explicit\nlearner confirmation that source links no longer need to open",
    "README.md:learning goal, treat `READY_REVIEW` as a review candidate rather than final",
    "readme cleanup explicit learner confirmation boundary",
    "--iterations 410"
  ], {
    forbidden: [
      "README.md:learner confirmation for the current learning goal",
      "README.md:require learner\nconfirmation that source links no longer need to open"
    ]
  }),
  check("storage model generated session source cleanup wording", [
    "docs/product/storage-model.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["generated `source/` snapshot, analysis", "the generated per-session `source/` snapshot used as evidence", "generated session `source/` snapshot cleanup-review decisions", "Generated session `source/` snapshots copied from user-provided source", "The user's original repository or", "local source folder is not the cleanup target", "reports the generated session `source/` snapshot size", "after the generated session `source/` folder is gone", "intentionally pruned generated session `source/` snapshots", "pretending the generated source copy is still available", "Disposable external-source work copies under `research/external-src/` are", "the work copy can be pruned and re-cloned later", "retention controls for old generated session `source/` snapshots", "storage model generated session source cleanup wording", "--iterations 278"], {
    forbidden: [
      "docs/product/storage-model.md:source snapshot cleanup decisions",
      "docs/product/storage-model.md:User-provided source snapshots inside a study session",
      "docs/product/storage-model.md:source cleanup was allowed after the original `source/` folder is gone",
      "docs/product/storage-model.md:intentionally pruned source snapshots",
      "docs/product/storage-model.md:pretending the original copied source is still available",
      "docs/product/storage-model.md:Temporary research clones under `research/external-src/` are different",
      "docs/product/storage-model.md:the clone can be deleted and re-cloned later",
      "docs/product/storage-model.md:retention controls for old session source snapshots"
    ]
  }),
  check("storage model cleanup verification record boundary", [
    "docs/product/storage-model.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "docs/product/storage-model.md:verification reports,",
    "docs/product/storage-model.md:and verification records are still present",
    "docs/product/storage-model.md:session verification and",
    "docs/product/storage-model.md:verification records pass",
    "docs/product/storage-model.md:still requires preserved evidence, session",
    "docs/product/storage-model.md:verification, verification records, learner explicit confirmation that source\nlinks no longer need to open",
    "storage model cleanup verification record boundary",
    "--iterations 374"
  ], {
    forbidden: [
      "docs/product/storage-model.md:after the preserved evidence bundle remains available and the learner confirms"
    ]
  }),
  check("product docs cleanup token explicit confirmation boundary", [
    "docs/product/learning-mission.md",
    "docs/product/storage-model.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "docs/product/learning-mission.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final\nexplicit confirmation that source links no longer need to open",
    "docs/product/storage-model.md:the learner explicitly confirms source links no\nlonger need to open for the current learning goal.",
    "docs/product/storage-model.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final\nexplicit confirmation that source links no longer need to open",
    "docs/product/storage-model.md:learner explicit confirmation that source\nlinks no longer need to open",
    "product docs cleanup token explicit confirmation boundary",
    "--iterations 409"
  ], {
    forbidden: [
      "docs/product/learning-mission.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's current-goal\nconfirmation",
      "docs/product/learning-mission.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's current-goal\nand explicit learner confirmation",
      "docs/product/storage-model.md:the learner confirms source links no longer need\nto open for the current learning goal.",
      "docs/product/storage-model.md:verification, verification records, current-goal confirmation",
      "docs/product/storage-model.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final\ncurrent-goal and explicit learner confirmation",
      "docs/product/storage-model.md:current-goal learner explicit confirmation"
    ]
  }),
  check("product docs cleanup token source-link confirmation boundary", [
    "docs/product/learning-mission.md",
    "docs/product/storage-model.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "docs/product/learning-mission.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final\nexplicit confirmation that source links no longer need to open",
    "docs/product/storage-model.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final\nexplicit confirmation that source links no longer need to open",
    "docs/product/storage-model.md:learner explicit confirmation that source\nlinks no longer need to open",
    "product docs cleanup token source-link confirmation boundary",
    "--iterations 427"
  ], {
    forbidden: [
      "docs/product/learning-mission.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's current-goal\nand explicit learner confirmation",
      "docs/product/storage-model.md:`DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final\ncurrent-goal and explicit learner confirmation",
      "docs/product/storage-model.md:current-goal learner explicit confirmation"
    ]
  }),
  check("learning mission generated session source cleanup wording", [
    "docs/product/learning-mission.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Generated study-session `source/` snapshots are evidence copies", "not the learner's original repository or local folder", "Cleanup may target only the generated session `source/` snapshot", "preserved evidence bundle", "session verification and verification records pass", "explicit learner confirmation", "disposable external-source work copies can be pruned and re-cloned", "learning mission generated session source cleanup wording", "--iterations 397"], {
    forbidden: [
      "docs/product/learning-mission.md:the cloned source should be deleted",
      "docs/product/learning-mission.md:cloned source should be deleted",
      "docs/product/learning-mission.md:Cleanup may target only the generated session `source/` snapshot after retained learning artifacts,",
      "docs/product/learning-mission.md:verification records, and explicit learner confirmation exist for the current"
    ]
  }),
  check("source retention guide current goal cleanup gate", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["소스 보존/정리 판단 가이드", "현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 되는지", "보존 증거 묶음이 남았는지를 학습자가 명시 확인", "source absorption ledger, session verification, verification records", "source 링크가 더 이상 열리지 않아도 목적, 아키텍처 이유, AI 프롬프트, 검증 기준을 설명할 수 있다고 명시 확인", "남아 있는 source absorption ledger, evidence, daily summary, prompt pack, session verification, verification records, source retention guide", "source retention guide current goal cleanup gate"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:소스 보존/삭제 판단 가이드",
      "packages/core/src/pipeline.test.ts:expect(retentionGuideText).toContain(\"소스 보존/삭제 판단 가이드\")",
      "packages/core/src/teaching-workspace.ts:학습자가 아래 산출물을 확인한 뒤 명시적으로 정리",
      "packages/core/src/teaching-workspace.ts:이 세션의 원본 source snapshot을 삭제해도 되는지",
      "packages/core/src/teaching-workspace.ts:원본 source snapshot을 삭제해도 되는지",
      "packages/core/src/teaching-workspace.ts:source absorption ledger, session verification이 보존 증거 묶음으로 남아 있는가?",
      "packages/core/src/teaching-workspace.ts:남아 있는 source absorption ledger, evidence, daily summary, prompt pack, session verification, source retention guide"
    ]
  }),
  check("source absorption ledger verification record retention boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:session verification, verification records, source retention guide",
    "packages/core/src/teaching-workspace.ts:source-absorption-ledger, session-verification, verification records, source-retention-guide",
    "packages/core/src/teaching-workspace.ts:session verification이 통과했고 verification records가 남았는가?",
    "packages/core/src/pipeline.test.ts:session verification, verification records, source retention guide",
    "packages/core/src/pipeline.test.ts:session-verification, verification records, source-retention-guide",
    "source absorption ledger verification record retention boundary",
    "--iterations 381"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:session verification, source retention guide",
      "packages/core/src/teaching-workspace.ts:session-verification, source-retention-guide",
      "packages/core/src/teaching-workspace.ts:session verification이 통과했는가?"
    ]
  }),
  check("teaching workspace source retention cleanup wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["생성된 세션 `source/` 스냅샷 정리 검토 판단 기준", "생성된 세션 `source/` 스냅샷 정리 검토 전 보존/정리 판단 가이드를 보존합니다", "보존/정리 판단 가이드가 READY_REVIEW", "소스 보존/정리 판단 가이드", "생성된 세션 `source/` 스냅샷 정리를 검토합니다", "생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰", "정리 전 보존 증거 묶음", "정리 전 기준", "not.toContain(\"보존/삭제 판단 가이드가 READY_REVIEW\")", "not.toContain(\"소스 보존/삭제 판단 가이드\")", "not.toContain(\"삭제를 검토합니다\")", "not.toContain(\"원본 source snapshot을 삭제해도 되는지\")", "teaching workspace source retention cleanup wording", "--iterations 404"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:원본 소스 보존/정리 판단 기준",
      "packages/core/src/teaching-workspace.ts:원본 소스 보존/삭제 판단 기준",
      "packages/core/src/teaching-workspace.ts:원본 source/ 정리 전 보존/삭제 판단 가이드를 보존합니다",
      "packages/core/src/teaching-workspace.ts:소스 보존/삭제 판단 가이드",
      "packages/core/src/teaching-workspace.ts:삭제를 검토합니다",
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 남은 산출물과 끊기는 evidence link",
      "packages/core/src/teaching-workspace.ts:원본 source snapshot을 삭제해도 되는지",
      "packages/core/src/markdown.ts:보존/삭제 판단 가이드가 READY_REVIEW",
      "packages/html/src/templates.ts:보존/삭제 판단 가이드가 READY_REVIEW"
    ]
  }),
  check("teaching workspace generated session source snapshot headings", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["현재 생성 세션 <code>source/</code> 스냅샷", "생성된 세션 <code>source/</code> 스냅샷은 근거입니다", "사용자 원본 소스는 자동 정리 대상이 아니며", "표시할 생성 세션 <code>source/</code> 스냅샷 파일이 없습니다", "not.toContain(\"현재 source snapshot\")", "not.toContain(\"사용자 제공 세션 source는 근거입니다\")", "teaching workspace generated session source snapshot headings", "--iterations 282"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:현재 source snapshot",
      "packages/core/src/teaching-workspace.ts:사용자 제공 세션 source는 근거입니다",
      "packages/core/src/teaching-workspace.ts:표시할 source snapshot 파일이 없습니다"
    ]
  }),
  check("source absorption cleanup verdict", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["현재 목표 조사 요약", "not.toContain(\"조사 종료 요약\")", "흡수한 학습 산출물", "추가 조사 필요 항목", "정리 판단", "정리 검토 후보", "정리 보류", "README.study.md", "정리 검토 후보일 뿐", "정리 판단: 정리 검토 후보", "생성된 세션 `source/` 스냅샷 정리를 검토합니다", "source absorption cleanup verdict", "--iterations 253"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:조사 종료 요약",
      "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toContain(\"조사 종료 요약\")",
      "packages/core/src/pipeline.test.ts:expect(absorptionMarkdown).toContain(\"## 조사 종료 요약\")",
      "packages/core/src/teaching-workspace.ts:정리 검토 가능"
    ]
  }),
  check("source absorption prompt pack review wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["학습자가 검토 후 다듬어 보낼 orient/architect/plan/review 프롬프트", "not.toContain(\"AI에게 바로 줄 orient/architect/plan/review 프롬프트\")", "source absorption prompt pack review wording"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:AI에게 바로 줄 orient/architect/plan/review 프롬프트"
    ]
  }),
  check("desktop source cleanup checkpoints", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourceCleanupCheckpoints", "retention-purpose", "AI는 일반 개발지식을 이미 가지고 있습니다", "생성된 세션 <code>source/</code> 스냅샷은 영구 내장 지식이 아니라", "retention-checkpoints", "aria-label=\"소스 정리 전 확인\"", "source-absorption-ledger", "verification", "source-retention-guide", "정리 전 확인: 생성된 세션 <code>source/</code> 스냅샷을 보관하는 목적이 아니라", "desktop source cleanup checkpoints"]),
  check("desktop source absorption summary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["preservedArtifactCount", "preservedArtifactTotal", "sourceAbsorptionVerdict", "sourceAbsorptionEvidence", "aria-label=\"소스 흡수 요약\"", "소스 흡수 요약", "흡수 산출물", "현재 목표 조사", "흡수 확인됨 · 세션 스냅샷 정리됨", "현재 목표 기준 흡수/검증 확인됨", "현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 토큰 전 정리 검토 후보를 판단할 수 있습니다", "현재 목표 기준 흡수 확인과 조사 보류 판단", "흡수 확인 필요 · 추가 조사/검증 필요", "absorption-summary", "desktop source absorption summary", "--iterations 399"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:흡수/검증 완료 · 추가 조사 불필요",
      "apps/desktop-tauri/src/App.tsx:추가 조사 불필요 판단",
      "apps/desktop-tauri/src/App.tsx:흡수 완료 · 소스 정리됨",
      "apps/desktop-tauri/src/App.tsx:현재 목표 기준 흡수/검증 완료",
      "apps/desktop-tauri/src/App.tsx:현재 목표 기준 흡수 완료와 조사 보류 판단",
      "apps/desktop-tauri/src/App.tsx:현재 학습 목표 기준으로 새 반복 조사 없이 정리 검토 후보를 판단할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:현재 학습 목표 기준으로 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 토큰 전 정리 검토 후보를 판단할 수 있습니다"
    ]
  }),
  check("desktop retained learning assets", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["retainedLearningArtifacts", "sourceKnowledgePolicy", "retainedLearningArtifactSummary", "sourceKnowledgePolicyLabel", "aria-label=\"보존 학습 자산\"", "보존 학습 자산", "정리 기록에 생성된 세션 source/ 스냅샷은 임시 프로젝트 근거이며 내장 AI 지식이 아니라고 남았습니다", "보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표 확인이 준비되어 생성된 세션 source/ 스냅샷은 장기 앱 지식이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인과 DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤의 정리 검토 후보입니다", "정리 전 증거 확인됨", "retained-learning-assets", "desktop retained learning assets", "desktop retained learning assets source retention verification boundary", "--iterations 402"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:보존 증거 묶음이 준비되어 생성된 세션 source/ 스냅샷을 장기 앱 지식으로 보관하지 않아도 됩니다",
      "apps/desktop-tauri/src/App.tsx:보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표 확인이 준비되어 생성된 세션 source/ 스냅샷을 장기 앱 지식으로 보관하지 않아도 됩니다",
      "apps/desktop-tauri/src/App.tsx:보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표 확인이 준비되어 생성된 세션 source/ 스냅샷은 장기 앱 지식이 아니라 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤의 정리 검토 후보입니다",
      "apps/desktop-tauri/src/App.tsx:정리 전 확인 완료"
    ]
  }),
  check("desktop source retention generated session ui wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["생성된 세션 source/ 스냅샷은 임시 근거라는 보존 상태", "정리 계획에 생성된 세션 source/ 스냅샷은 임시 프로젝트 근거이며 내장 AI 지식이 아니라고 남았습니다", "보존 증거 묶음이 준비되기 전까지 생성된 세션 source/ 스냅샷 정리를 보류합니다", "흡수 확인됨 · 세션 스냅샷 정리됨", "생성된 세션 source/ 스냅샷이 정리된 뒤에는 보존된 학습 산출물과 SOURCE-PRUNED 기록으로 복습하세요", "생성된 세션 source/ 스냅샷 보존 상태를 확인합니다", "다음 RepoTutor 세션의 생성된 세션 source/ 스냅샷 보존/정리 판단을 검토하세요", "세션 스냅샷 상태:", "사용자 원본 소스는 영구 내장 지식이나 정리 대상이 아니고", "생성된 세션 source/ 스냅샷 보존 상태를 다시 확인합니다", "상태 확인을 실행하면 생성된 세션 <code>source/</code> 스냅샷 대신 남겨야 할 핵심 학습 자산", "desktop source retention generated session ui wording", "--iterations 281"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:source/는 임시 근거라는 보존 상태",
      "apps/desktop-tauri/src/App.tsx:정리 기록에 source/는 임시 프로젝트 근거이며 내장 AI 지식이 아니라고 남았습니다",
      "apps/desktop-tauri/src/App.tsx:보존 증거 묶음이 준비되기 전까지 source/ 정리를 보류합니다",
      "apps/desktop-tauri/src/App.tsx:흡수 확인됨 · 소스 정리됨",
      "apps/desktop-tauri/src/App.tsx:원본 소스 대신 보존된 학습 산출물과 SOURCE-PRUNED 기록으로 복습하세요",
      "apps/desktop-tauri/src/App.tsx:? \"세션 source/ 스냅샷 보존 상태를 확인합니다.\"",
      "apps/desktop-tauri/src/App.tsx:다음 RepoTutor 세션의 source/ 스냅샷 보존/정리 판단을 검토하세요",
      "apps/desktop-tauri/src/App.tsx:`소스 상태:",
      "apps/desktop-tauri/src/App.tsx:source/는 영구 내장 지식이 아니라",
      "apps/desktop-tauri/src/App.tsx:source/ 대신 남겨야 할 핵심 학습 자산",
      "apps/desktop-tauri/src/App.tsx:소스를 보관하는 목적이 아니라"
    ]
  }),
  check("desktop cleanup decision conditions", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["cleanupDecisionText", "learnerCleanupApplyWhenDisplay", "learnerCleanupHoldWhenDisplay", "aria-label=\"정리 판단 조건\"", "정리 검토 조건", "정리 보류 조건", "세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS입니다", "검증 명령, 검증 기록, 사람의 리뷰 기준 중 하나가 빠져 있습니다", "cleanup-decision-conditions", "desktop cleanup decision conditions"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:세션 검증과 보존 증거 묶음이 모두 PASS입니다",
      "apps/desktop-tauri/src/App.tsx:검증 명령이나 사람의 리뷰 기준이 빠져 있습니다",
      "apps/desktop-tauri/src/App.tsx:세션 검증과 보존 증거 묶음을 먼저 확인합니다"
    ]
  }),
  check("desktop cleanup decision prompt korean conditions", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learnerCleanupApplyWhenSummary = learnerCleanupApplyWhenDisplay.join", "learnerCleanupHoldWhenSummary = learnerCleanupHoldWhenDisplay.join", "`정리 검토 조건: ${learnerCleanupApplyWhenSummary}`", "`정리 보류 조건: ${learnerCleanupHoldWhenSummary}`", "소스 흡수 기록이 프로젝트에서 어떤 판단을 가져왔는지 설명합니다", "아키텍처 이유, 역할 경계, 검증 기준이 불명확하면 생성된 세션 source/ 스냅샷 정리를 보류합니다", "desktop cleanup decision prompt korean conditions"]),
  check("desktop source absorption next action", [
    "apps/desktop-tauri/src/App.tsx",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourceAbsorptionNextAction", "다음 행동", "상태 확인으로 흡수 산출물과 보존 게이트를 먼저 불러오세요", "생성된 세션 source/ 스냅샷이 정리된 뒤에는 보존된 학습 산출물과 SOURCE-PRUNED 기록으로 복습하세요", "정리 검토 후보를 판단할 수 있습니다", "소스 보존 판단과 dry-run plan을 검토하고", "보존 증거 묶음, 세션 검증, 검증 기록이 남았으며 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 경우에만", "토큰 입력을 검토하세요", "세션 검증 리포트를 먼저 열어", "소스 흡수 기록과 보존 산출물을 다시 생성", "desktop source absorption next action"], {
    forbidden: ["apps/desktop-tauri/src/App.tsx:명시 확인 토큰으로 스냅샷만 정리하세요", "apps/desktop-tauri/src/App.tsx:명시 확인 토큰으로 스냅샷 정리를 검토하세요"]
  }),
  check("desktop source absorption token boundary next action", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT 확인 토큰 입력을 검토하세요",
    "apps/desktop-tauri/src/App.tsx:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT 확인 토큰을 입력한 뒤에만 스냅샷 정리를 검토하세요",
    "apps/desktop-tauri/src/App.tsx:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "desktop source absorption token boundary next action",
    "--iterations 338"
  ]),
  check("desktop source absorption action routing", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourceAbsorptionActionTarget", "소스 보존 판단 열기", "세션 검증 열기", "소스 흡수 기록 열기", "openReportTab(sourceAbsorptionActionTarget.tab, sourceAbsorptionActionTarget.target)", "Route size={15}", ".absorption-summary button", "desktop source absorption action routing"]),
  check("desktop source retention korean recommendation", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourceRetentionRecommendation", "이미 정리됨: 생성된 세션 source/ 스냅샷은 정리됐고", "정리 검토 후보: 보존 증거 묶음, 흡수 산출물, 세션 검증, 검증 기록이 준비됐습니다", "학습자가 현재 학습 목표에서 소스 링크가 더 이상 열리지 않아도 된다고 명시 확인하고 DELETE-SOURCE-SNAPSHOT 확인 토큰을 입력한 뒤에만", "스냅샷 정리를 검토하세요", "정리 보류:", "생성된 세션 source/ 스냅샷은 차단 항목이 해소될 때까지 보존하세요", "desktop source retention korean recommendation", "--iterations 399"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:정리 검토 후보: 흡수 산출물, 세션 검증, 검증 기록이 준비됐습니다",
      "apps/desktop-tauri/src/App.tsx:정리 검토 후보: 흡수 산출물과 세션 검증이 준비됐습니다",
      "apps/desktop-tauri/src/App.tsx:정리 검토 가능: 흡수 산출물과 세션 검증이 준비됐습니다",
      "apps/desktop-tauri/src/App.tsx:학습자가 현재 학습 목표에서 소스 링크가 더 이상 열리지 않아도 된다고 명시 확인한 뒤에만",
      "apps/desktop-tauri/src/App.tsx:원본 source/ 스냅샷은 아직 보존하세요"
    ]
  }),
  check("desktop source absorption next action verification record boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:소스 흡수 기록, 보존 증거 묶음, 세션 검증, 검증 기록, 보존 판단 산출물이 남아 있어 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 토큰 전 정리 검토 후보를 판단할 수 있습니다",
    "apps/desktop-tauri/src/App.tsx:보존 증거 묶음, 세션 검증, 검증 기록이 남았으며 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 경우에만",
    "apps/desktop-tauri/src/App.tsx:정리 검토 후보: 보존 증거 묶음, 흡수 산출물, 세션 검증, 검증 기록이 준비됐습니다",
    "desktop source absorption next action verification record boundary",
    "--iterations 399"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:소스 흡수 기록, 세션 검증, 검증 기록, 보존 판단 산출물이 남아 있어 현재 학습 목표 기준으로 새 반복 조사 없이 정리 검토 후보를 판단할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:소스 흡수 기록, 세션 검증, 보존 판단 산출물이 남아 있어 현재 학습 목표 기준으로 새 반복 조사 없이 정리 검토 후보를 판단할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:소스 흡수 기록, 보존 증거 묶음, 세션 검증, 검증 기록, 보존 판단 산출물이 남아 있어 현재 학습 목표 기준으로 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 토큰 전 정리 검토 후보를 판단할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:보존 증거 묶음이 남았으며 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 경우에만",
      "apps/desktop-tauri/src/App.tsx:정리 검토 후보: 흡수 산출물, 세션 검증, 검증 기록이 준비됐습니다",
      "apps/desktop-tauri/src/App.tsx:정리 검토 후보: 흡수 산출물과 세션 검증이 준비됐습니다"
    ]
  }),
  check("desktop source retention decision prompt verification record display", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:검증/기록 기준:",
    "apps/desktop-tauri/src/App.tsx:세션 검증 PASS · 검증 기록 확인",
    "apps/desktop-tauri/src/App.tsx:세션 검증과 검증 기록 확인 필요",
    "desktop source retention decision prompt verification record display",
    "--iterations 388"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:세션 검증 PASS · 검증 기록 확인 필요"
    ]
  }),
  check("source retention report target verification record boundary", [
    "packages/shared/src/report-targets.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/shared/src/report-targets.ts:보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
    "packages/core/src/pipeline.test.ts:보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
    "packages/core/src/pipeline.test.ts:not.toContain(\"무엇을 남긴 뒤 생성된 세션 source/ 스냅샷\")",
    "source retention report target verification record boundary",
    "--iterations 400"
  ], {
    forbidden: [
      "packages/shared/src/report-targets.ts:보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/core/src/pipeline.test.ts:보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/shared/src/report-targets.ts:보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/core/src/pipeline.test.ts:보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/shared/src/report-targets.ts:무엇을 남긴 뒤 생성된 세션 source/ 스냅샷"
    ]
  }),
  check("shared source retention report target source-link confirmation boundary", [
    "packages/shared/src/report-targets.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/shared/src/report-targets.ts:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
    "packages/core/src/pipeline.test.ts:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
    "shared source retention report target source-link confirmation boundary",
    "--iterations 415"
  ], {
    forbidden: [
      "packages/shared/src/report-targets.ts:현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/core/src/pipeline.test.ts:현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷"
    ]
  }),
  check("desktop source retention pruned wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["이미 정리됨: 생성된 세션 source/ 스냅샷은 정리됐고", "생성된 세션 source/ 스냅샷 정리 적용됨", "sourcePrune?.sourcePruned ? \"정리됨\" : \"없음\"", "보존/정리 판단 프롬프트", "보존/정리 판단 맥락", "not.toContain(\"삭제 완료\")", "not.toContain(\"소스 스냅샷 정리 완료\")", "desktop source retention pruned wording", "--iterations 268"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:삭제 완료",
      "apps/desktop-tauri/src/App.tsx:소스 스냅샷 정리 완료",
      "apps/desktop-tauri/src/App.tsx:원본 source/ 스냅샷은 삭제됐고",
      "apps/desktop-tauri/src/App.tsx:보존/삭제 판단 프롬프트",
      "apps/desktop-tauri/src/App.tsx:보존/삭제 판단 맥락"
    ]
  }),
  check("desktop source retention review status label", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["const status = result.sourcePruned ? \"정리됨\" : result.applyReady ? \"정리 검토 후보\" : \"보류\"", "소스 보존 상태: ${status}", "sourceRetentionStatusLabel", "정리 검토 후보 · 토큰 전 보존", "보류 · 보존", "desktop source retention review status label"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:result.applyReady ? \"정리 가능\"",
      "apps/desktop-tauri/src/App.tsx:sourcePrune?.applyReady ? \"정리 가능\"",
      "apps/desktop-tauri/src/App.tsx:정리 가능 조건:",
      "apps/desktop-tauri/src/App.tsx:result.applyReady ? \"정리 검토 가능\"",
      "apps/desktop-tauri/src/App.tsx:sourcePrune?.applyReady ? \"정리 검토 가능\""
    ]
  }),
  check("desktop source retention compact controls token boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:sourceRetentionStatusLabel",
    "apps/desktop-tauri/src/App.tsx:정리 검토 후보 · 토큰 전 보존",
    "apps/desktop-tauri/src/App.tsx:토큰 확인 후 세션 스냅샷만 정리",
    "desktop source retention compact controls token boundary",
    "--iterations 342"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:검토 후 스냅샷 정리"
    ]
  }),
  check("desktop source retention progress log generated goal boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:소스 보존 상태: ${status} · 생성된 세션 source/ 스냅샷은 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤에만 정리 검토",
    "apps/desktop-tauri/src/App.tsx:생성된 세션 source/ 스냅샷 정리 적용됨(source 링크 정리 명시 확인 및 DELETE-SOURCE-SNAPSHOT 토큰 후)",
    "desktop source retention progress log generated goal boundary",
    "--iterations 402"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:소스 보존 상태: ${status} · 생성된 세션 source/ 스냅샷만 현재 학습 목표 확인 뒤 검토",
      "apps/desktop-tauri/src/App.tsx:생성된 세션 source/ 스냅샷 정리 적용됨(현재 학습 목표 확인 토큰 후)",
      "apps/desktop-tauri/src/App.tsx:소스 보존 상태: ${status} · 생성된 세션 source/ 스냅샷은 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤에만 정리 검토",
      "apps/desktop-tauri/src/App.tsx:생성된 세션 source/ 스냅샷 정리 적용됨(학습자 명시 확인 및 DELETE-SOURCE-SNAPSHOT 토큰 후)"
    ]
  }),
  check("generated source retention compact artifact status boundary", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/source-prune.ts:READY_REVIEW (review candidate, token-required before cleanup)",
    "packages/core/src/teaching-workspace.ts:정리 검토 후보 · 토큰 전 보존",
    "packages/core/src/pipeline.test.ts:Status: READY_REVIEW (review candidate, token-required before cleanup)",
    "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toMatch(/정리 판단: 정리 (검토 후보|보류)/)",
    "packages/core/src/pipeline.test.ts:expect(absorptionMarkdown).toMatch(/정리 판단: 정리 (검토 후보|보류)/)",
    "generated source retention compact artifact status boundary",
    "--iterations 343"
  ], {
    forbidden: [
      "packages/core/src/source-prune.ts:- Status: ${status}\\n- Status meaning"
    ]
  }),
  check("desktop source retention decision prompt copy", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourceRetentionDecisionPrompt", "copySourceRetentionDecisionPrompt", "정리 판단 클립보드 저장", "소스 정리 판단 프롬프트 클립보드에 초안 저장됨", "검토 상태: READY_REVIEW / HOLD / PRUNED", "READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "현재 목표 조사 판단", "검증/기록 기준", "정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 모두 필요합니다", "생성된 세션 source/ 스냅샷만 대상으로", "전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토", "desktop source retention decision prompt copy", "--iterations 408"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 클립보드 저장 완료",
      "apps/desktop-tauri/src/App.tsx:READY / HOLD / PRUNED",
      "apps/desktop-tauri/src/App.tsx:판정: READY_REVIEW / HOLD / PRUNED",
      "apps/desktop-tauri/src/App.tsx:정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 학습자 명시 확인이 모두 필요합니다",
      "apps/desktop-tauri/src/App.tsx:정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인이 모두 필요합니다",
      "apps/desktop-tauri/src/App.tsx:전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인 조건을 검토",
      "apps/desktop-tauri/src/App.tsx:전송 전 보존 증거 묶음, 현재 학습 목표, 학습자 명시 확인 조건을 검토"
    ]
  }),
  check("desktop retention decision prompt token boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:확인 토큰 경계:",
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라",
    "apps/desktop-tauri/src/App.tsx:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 명시 확인했다는 뜻입니다",
    "desktop retention decision prompt token boundary",
    "--iterations 408"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 확인했다는 뜻입니다"
    ]
  }),
  check("desktop source retention decision prompt preview", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["소스 정리 판단 프롬프트 미리보기", "클립보드 저장 전에 AI에게 전달될 보존/정리 판단 맥락을 확인합니다", "retention-prompt-preview", "aria-label=\"소스 정리 판단 프롬프트 미리보기\"", "<pre>{sourceRetentionDecisionPrompt}</pre>", "desktop source retention decision prompt preview"]),
  check("desktop implementation handoff prompt", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationHandoffPrompt", "copyImplementationHandoffPrompt", "AI 구현 인계 프롬프트", "구현 인계 클립보드 저장", "AI 구현 인계 프롬프트 클립보드에 초안 저장됨", "전송 전 세션 근거, 내 목표, 수락 기준, 검증 기준", "문법 강의보다 목적, 아키텍처 이유, 용어, 책임 경계, 수락 기준, 검증 질문", "implementation-handoff", "desktop implementation handoff prompt", "--iterations 244"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 인계 프롬프트 클립보드 저장 완료"
    ]
  }),
  check("desktop implementation handoff readiness", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationHandoffReadinessChecks", "implementationHandoffReadinessSummary", "AI 구현 인계 준비도", "인계 준비도", "AI 구현 요청 검토 후보", "부족한 맥락 보강 필요", "세션 산출물", "학습자 목표", "검증 기준", "소스 경계", "implementation-handoff-readiness", "desktop implementation handoff readiness", "--iterations 217"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 요청 후보 검토 가능"
    ]
  }),
  check("desktop implementation handoff repair prompt", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationHandoffRepairPrompt", "copyImplementationHandoffRepairPrompt", "AI 구현 인계 맥락 보강 프롬프트", "맥락 보강 프롬프트", "AI 구현 인계 맥락 보강 프롬프트 클립보드에 초안 저장됨", "아직 구현을 시작하지 말고", "보강 질문", "브리프 보강문", "구현 보류 조건", "준비 조건 확인 후 검토할 첫 vertical slice 요청 후보", "implementation-handoff-repair", "desktop implementation handoff repair prompt", "--iterations 245"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 인계 맥락 보강 프롬프트 클립보드 저장 완료",
      "apps/desktop-tauri/src/App.tsx:준비 완료 후 검토할 첫 vertical slice 요청 후보"
    ]
  }),
  check("desktop implementation result review prompt", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultReviewPrompt", "copyImplementationResultReviewPrompt", "AI 구현 결과 검토 프롬프트", "구현 결과 검토 프롬프트", "AI 구현 결과 검토 프롬프트 클립보드에 초안 저장됨", "AI가 만든 첫 구현 결과를 목적, 범위, 역할, 검증 기준으로 검토 상태 후보로 확인합니다", "전송 전 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 확인한 뒤 ACCEPT_REVIEW / REVISE / BLOCK 검토 상태 후보", "ACCEPT_REVIEW / REVISE / BLOCK 검토 상태", "ACCEPT_REVIEW도 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "ACCEPT_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기록을 확인할 후보", "목적 보존", "범위 제한", "역할 경계", "검증 근거", "implementation-result-review", "desktop implementation result review prompt", "--iterations 246"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 검토 프롬프트 클립보드 저장 완료",
      "apps/desktop-tauri/src/App.tsx:첫 vertical slice 결과를 ACCEPT / REVISE / BLOCK으로 판정할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:ACCEPT / REVISE / BLOCK 판정",
      "apps/desktop-tauri/src/App.tsx:ACCEPT / REVISE / BLOCK 2) 근거",
      "apps/desktop-tauri/src/App.tsx:ACCEPT / REVISE / BLOCK 판정 후보",
      "apps/desktop-tauri/src/App.tsx:AI가 만든 첫 구현 결과를 목적, 범위, 역할, 검증 기준으로 판정합니다"
    ]
  }),
  check("desktop implementation result accept review accept delete boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW도 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기록을 확인할 후보",
    "desktop implementation result accept review accept delete boundary",
    "--iterations 352"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW도 최종 승인이나 배포 허가가 아닙니다",
      "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW도 최종 승인이나 배포 허가가 아니라 학습자가 근거와 검증 기록을 확인할 후보"
    ]
  }),
  check("desktop implementation result repair accept review evidence boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW도 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "desktop implementation result repair accept review evidence boundary",
    "--iterations 361"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아닙니다"
    ]
  }),
  check("desktop implementation result review checklist", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultReviewState", "implementationResultReviewChecks", "implementationResultReviewSummary", "implementationResultRevisionPrompt", "copyImplementationResultRevisionPrompt", "AI 구현 결과 검토 상태", "결과 재작업 프롬프트", "AI 구현 결과 재작업 프롬프트 클립보드에 초안 저장됨", "결과 검토 초기화", "ACCEPT_REVIEW 검토 후보", "REVISE/BLOCK 검토 필요", "implementation-result-checklist", "implementation-result-revision", "desktop implementation result review checklist", "--iterations 248"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 재작업 프롬프트 클립보드 저장 완료",
      'apps/desktop-tauri/src/App.tsx:? "ACCEPT 검토 후보"',
      'apps/desktop-tauri/src/App.tsx:=== "ACCEPT 검토 후보"',
      "apps/desktop-tauri/src/App.tsx:현재 결과는 ACCEPT 검토 후보입니다"
    ]
  }),
  check("desktop implementation result review record prompt", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultReviewRecordPrompt", "copyImplementationResultReviewRecordPrompt", "implementationResultReviewDecision", "결과 검토 기록 프롬프트", "AI 구현 결과 검토 기록 프롬프트 클립보드에 초안 저장됨", "검토 상태:", "검토 상태 요약:", "확인한 검토 기준:", "남은 검토 기준:", "오늘 검토 상태", "바이브코딩 학습자가 AI 결과를 어떤 목적, 역할, 검증 기준으로 받아들였는지", "implementation-result-record", "desktop implementation result review record prompt", "--iterations 249"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 검토 기록 프롬프트 클립보드 저장 완료",
      'apps/desktop-tauri/src/App.tsx:`판정: ${implementationResultReviewDecision}`',
      'apps/desktop-tauri/src/App.tsx:`판정 요약: ${implementationResultReviewDecisionSummary}`',
      'apps/desktop-tauri/src/App.tsx:`완료 기준: ${implementationResultReviewCompletedLabels.length > 0 ? implementationResultReviewCompletedLabels.join(", ") : "없음"}`',
      'apps/desktop-tauri/src/App.tsx:"미완료 기준:"',
      "apps/desktop-tauri/src/App.tsx:오늘 판정"
    ]
  }),
  check("desktop implementation result decision summary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultReviewNextAction", "implementationResultReviewDecisionSummary", "AI 구현 결과 검토 상태 요약", "검토 상태 요약:", "다음 행동:", "구현을 멈추고 누락 기준을 먼저 보강", "재작업 프롬프트로 첫 vertical slice 안에서 수정", "학습 기록과 검증 근거를 직접 확인한 뒤 다음 작은 개선 후보 1개만 검토", "검토 상태 ${implementationResultReviewDecision}", "확인 기준 ${implementationResultReviewDoneCount}", "남은 기준 ${implementationResultReviewChecks.length", "implementation-result-decision", "desktop implementation result decision summary"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:학습 기록에 근거를 남긴 뒤 다음 작은 개선으로 이동",
      "apps/desktop-tauri/src/App.tsx:학습 기록과 검증 근거를 최종 확인한 뒤",
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 판정 요약",
      "apps/desktop-tauri/src/App.tsx:판정 요약:"
    ]
  }),
  check("desktop implementation result next action prompt", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultNextActionPrompt", "copyImplementationResultNextActionPrompt", "AI 구현 결과 다음 행동 프롬프트", "결과 다음 행동 프롬프트", "AI 구현 결과 다음 행동 프롬프트 클립보드에 초안 저장됨", "현재 검토 상태에 맞춰 멈춤, 재작업, 다음 작은 개선", "다음 AI 구현 결과 검토 상태에 맞춰 학습자가 검토 후 다듬어 실행할 다음 행동", "학습자가 검토 후 다듬어 보낼 AI 프롬프트", "전송 전 현재 검토 상태 근거를 확인하고 멈춤, 수정, 다음 개선 중 하나의 지시 후보로 검토하세요", "다음 기능으로 넘어가지 말고", "현재 구현을 ACCEPT_REVIEW로도 확정하지 말고", "학습자가 근거와 검증 기록을 직접 확인한 뒤 검토할 다음 작은 vertical slice 후보 1개만 제안하세요", "남은 검토 기준", "아직 구현을 진행하지 말고", "implementation-result-next-action", "desktop implementation result next action prompt", "--iterations 250"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 다음 행동 프롬프트 클립보드 저장 완료",
      "apps/desktop-tauri/src/App.tsx:바로 실행할 다음 행동",
      "apps/desktop-tauri/src/App.tsx:바로 보낼 AI 프롬프트",
      "apps/desktop-tauri/src/App.tsx:검토 후 다듬어 지시할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:현재 판정에 맞춰 멈춤, 재작업, 다음 작은 개선",
      "apps/desktop-tauri/src/App.tsx:다음 AI 구현 결과 판정에 맞춰 학습자가 검토 후 다듬어 실행할 다음 행동",
      "apps/desktop-tauri/src/App.tsx:전송 전 현재 판정 근거",
      "apps/desktop-tauri/src/App.tsx:현재 구현을 ACCEPT로 확정하지 말고"
    ]
  }),
  check("desktop implementation result evidence note", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultEvidenceText", "normalizedImplementationResultEvidence", "AI 구현 결과 근거 입력 영역", "구현 결과 근거 메모", "AI가 바꾼 파일, 실행 명령, 실패 로그, 직접 본 화면", "implementation-result-evidence-textarea", "구현 결과 근거:", "비어 있음. AI가 바꾼 파일/명령/실패 로그/사람이 본 화면을 먼저 적으세요", "implementation-result-evidence", "desktop implementation result evidence note"]),
  check("desktop implementation result evidence readiness", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultEvidenceChecks", "implementationResultEvidenceReadyCount", "implementationResultEvidenceSummary", "implementationResultEvidenceMissingLabels", "AI 구현 결과 근거 준비도", "근거 준비도", "검토 근거 충분", "근거 보강 필요", "변경 파일", "실행 명령", "실패/위험", "직접 확인", "implementation-result-evidence-readiness", "desktop implementation result evidence readiness"], {
    forbidden: ["apps/desktop-tauri/src/App.tsx:판정 근거 충분"]
  }),
  check("desktop implementation result evidence repair prompt", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultEvidenceRepairPrompt", "copyImplementationResultEvidenceRepairPrompt", "AI 구현 결과 근거 보강 프롬프트", "근거 보강 프롬프트", "AI 구현 결과 근거 보강 프롬프트 클립보드에 초안 저장됨", "부족한 증거", "증거와 검증 기준 수집만 요청", "changed files, command results, failures/risks, direct screen checks", "implementation-result-evidence-repair", "desktop implementation result evidence repair prompt", "--iterations 247"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 근거 보강 프롬프트 클립보드 저장 완료"
    ]
  }),
  check("desktop implementation result evidence acceptance gate", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultEvidenceReady", "근거 게이트", "근거 보강 후 ACCEPT_REVIEW 검토", "근거 보강 프롬프트로 증거와 검증 기준 먼저 수집", "구현 검토 상태 후보를 만들거나 다음 기능으로 넘어가지 말고", "근거 ${implementationResultEvidenceReadyCount}/${implementationResultEvidenceChecks.length}", "repeat(auto-fit, minmax(110px, 1fr))", "desktop implementation result evidence acceptance gate"]),
  check("desktop implementation result evidence blocker summary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultEvidenceMissingNames", "implementationResultEvidenceBlockerSummary", "implementationResultEvidenceNextStep", "근거 차단 사유", "근거 차단:", "근거 게이트 통과 · ACCEPT_REVIEW 검토 후보 (검증 기록 확인 후)", "결과 검토 기준, 실행/화면 증거, 학습 기록을 확인하세요", "근거 보강 프롬프트를 검토한 뒤 AI에게 증거와 검증 기준만 먼저 수집시키세요", "implementation-result-evidence-blocker", "desktop implementation result evidence blocker summary"], {
    forbidden: ["apps/desktop-tauri/src/App.tsx:근거 게이트 통과 · ACCEPT 검토 가능"]
  }),
  check("desktop implementation result accept guard", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultAcceptGuardSummary", "ACCEPT_REVIEW 가드", "ACCEPT_REVIEW 근거 확인(허가 아님): 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 학습자가 확인할 검토 후보로만 남깁니다.", "ACCEPT_REVIEW 보류: 근거 게이트가 차단됐습니다.", "ACCEPT_REVIEW 보류: 검토 기준이 남았습니다.", "accept-guard", "desktop implementation result accept guard"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:ACCEPT 후보",
      "apps/desktop-tauri/src/App.tsx:근거 게이트 통과 · ACCEPT 판단 가능",
      "apps/desktop-tauri/src/App.tsx:ACCEPT 전 최종 확인",
      "apps/desktop-tauri/src/App.tsx:ACCEPT 금지",
      "apps/desktop-tauri/src/App.tsx:ACCEPT 보류",
      "apps/desktop-tauri/src/App.tsx:학습 기록으로 남기고 다음 작은 개선으로 이동",
      "apps/desktop-tauri/src/App.tsx:현재 구현을 학습 기록으로 확정한 뒤",
      "apps/desktop-tauri/src/App.tsx:ACCEPT 전제: 변경 파일"
    ]
  }),
  check("desktop implementation result accept guard review-state boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW 근거 확인(허가 아님):",
    "apps/desktop-tauri/src/App.tsx:직접 확인 근거를 학습자가 확인할 검토 후보로만 남깁니다",
    "desktop implementation result accept guard review-state boundary",
    "--iterations 347"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:ACCEPT_REVIEW 근거 확인: 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 학습 기록에 남깁니다."
    ]
  }),
  check("desktop implementation result evidence detail gate", [
    "apps/desktop-tauri/src/App.tsx",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["evidenceLineHasDetail", "implementationResultEvidenceDetailLines", "(?:apps|packages|src)\\/\\S+", "(?:pnpm|npm|yarn|node|npx|bun|cargo|pytest|test|typecheck|build).*(?:PASS|FAIL|통과|실패|완료|OK|0)", "실패/위험 없음", "직접 확인 Playwright", "라벨만 있는 근거", "desktop implementation result evidence detail gate"]),
  check("desktop implementation result evidence writing guidance", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["implementationResultEvidenceWritingRules", "AI 구현 결과 근거 작성 규칙", "라벨만 적으면 통과하지 않습니다", "변경 파일은 실제 경로나 파일명을 적습니다", "실행 명령은 명령과 PASS/FAIL 같은 결과를 함께 적습니다", "직접 확인은 Playwright, 스크린샷, 클릭, 클립보드 저장 같은 관찰 행동을 적습니다", "implementation-result-evidence-rules", "desktop implementation result evidence writing guidance"]),
  check("desktop source purpose contract", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourcePurposeContractItems", "소스 입력 목적 계약", "소스는 지식 내장이 아님", "AI에게 개발을 새로 가르치는 데이터가 아니라", "학습자는 AI 지휘자", "문법 암기보다 아키텍처 이유", "흡수 후 정리 판단", "정리 검토 조건과 보류 사유 확인", "학습 산출물, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 남아야", "생성된 세션 source/ 스냅샷은 소스 보존 게이트로 정리 검토 여부", "정리 검토 후보여도 원본이 아니라 생성된 세션 source/ 스냅샷만 대상으로 하세요", "source-purpose-contract", "desktop source purpose contract", "source cleanup review wording", "desktop source purpose cleanup verification record boundary", "--iterations 402"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표 확인이 남으면",
      "apps/desktop-tauri/src/App.tsx:학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 남아야",
      "apps/desktop-tauri/src/App.tsx:학습 산출물과 검증 기록이 남으면",
      "apps/desktop-tauri/src/App.tsx:삭제 가능 조건과 보류 사유 확인",
      "apps/desktop-tauri/src/App.tsx:삭제 가능 여부를 판단합니다",
      "apps/desktop-tauri/src/App.tsx:삭제 가능하더라도 원본이 아니라 생성된 세션 source/ 스냅샷만 대상으로 하세요"
    ]
  }),
  check("desktop vibe coding learning boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["learningBoundaryItems", "바이브코딩 학습 경계", "배우지 않는 것", "언어 문법 암기", "라인별 코딩", "반드시 배우는 것", "목적, 아키텍처 이유, 역할 경계, 핵심 용어, AI 프롬프트, 수락 기준, 검증 습관", "AI에게 맡기는 것", "실제 코딩은 AI가 담당", "learning-boundary-strip", "desktop vibe coding learning boundary"]),
  check("vibe start learning boundary report", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## 바이브코딩 학습 경계", "vibeCodingLearningBoundaryHtml", "vibe-coding-learning-boundary", "data-source-pattern=\"vibe-coding-learning-boundary\"", "배우지 않는 것", "언어 문법 암기", "라인별 코딩", "반드시 배우는 것", "목적, 아키텍처 이유", "AI에게 맡기는 것", "실제 코딩은 AI가 담당", "vibe start learning boundary report"]),
  check("study readme learning boundary", [
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Vibe-Coding Learning Boundary", "Not the goal: language syntax memorization", "line-by-line coding practice", "Must learn: product purpose, architecture reasons, role boundaries, key terms, AI prompts, acceptance criteria, and verification habits", "Delegate to AI: actual code generation", "study readme learning boundary"]),
  check("teaching mission learning boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## 학습 경계", "배우지 않는 것: 언어 문법 암기", "라인별 코딩", "반드시 배우는 것: 제품 목적, 아키텍처 이유", "AI에게 맡기는 것: 실제 코딩은 AI가 담당", "teaching mission learning boundary"]),
  check("teaching mission source cleanup decision", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Source cleanup decision", "packages/core/src/teaching-workspace.ts:생성된 세션 \\`source/\\` 스냅샷은 영구 학습 콘텐츠가 아니라 이 학습 세션의 프로젝트별 임시 근거입니다", "reference/source-absorption-ledger.html", "html/session-verification.html", "reference/source-retention-guide.html", "READY_REVIEW여도 이는 정리 검토 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 뒤에만", "prune-source --apply --confirm DELETE-SOURCE-SNAPSHOT", "packages/core/src/teaching-workspace.ts:조사 필요 항목이 남아 있거나 검증 리포트와 검증 기록이 부족하면 생성된 세션 \\`source/\\` 스냅샷은 보존합니다", "packages/core/src/pipeline.test.ts:not.toContain(\"원본 source/ 스냅샷은 영구 학습 콘텐츠가 아니라 임시 프로젝트 근거입니다\")", "packages/core/src/pipeline.test.ts:not.toContain(\"원본 source/ 스냅샷은 보존합니다\")", "teaching mission generated source cleanup decision", "--iterations 376"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:흡수 기록과 세션 검증이 READY이고",
      "packages/core/src/teaching-workspace.ts:원본 source/ 스냅샷은 영구 학습 콘텐츠가 아니라 임시 프로젝트 근거입니다",
      "packages/core/src/teaching-workspace.ts:원본 source/ 스냅샷은 보존합니다",
      "packages/core/src/pipeline.test.ts:expect(missionText).toContain(\"원본 source/ 스냅샷은 영구 학습 콘텐츠가 아니라 임시 프로젝트 근거입니다\")"
    ]
  }),
  check("teaching mission cleanup review verification record boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:정리 전에는 reference/source-absorption-ledger.html, html/session-verification.html, 검증 기록, reference/source-retention-guide.html, README.study.md가 남아 있어야 합니다",
    "packages/core/src/teaching-workspace.ts:흡수 기록, 세션 검증, 검증 기록, source-retention-guide가 READY_REVIEW여도 이는 정리 검토 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"정리 전에는 reference/source-absorption-ledger.html, html/session-verification.html, reference/source-retention-guide.html, README.study.md가 남아 있어야 합니다\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"흡수 기록, 세션 검증, source-retention-guide가 READY_REVIEW여도 이는 정리 검토 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
    "teaching mission cleanup review verification record boundary",
    "--iterations 382"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:정리 전에는 reference/source-absorption-ledger.html, html/session-verification.html, reference/source-retention-guide.html, README.study.md가 남아 있어야 합니다",
      "packages/core/src/teaching-workspace.ts:흡수 기록, 세션 검증, source-retention-guide가 READY_REVIEW여도 이는 정리 검토 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다"
    ]
  }),
  check("source prune recommended action verification record boundary", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-prune-plan.json",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/source-prune.ts:session verification, verification records, the preserved evidence bundle",
    "packages/core/src/source-prune.ts:verification report, verification records, prompt pack",
    "packages/core/src/pipeline.test.ts:session verification, verification records, the preserved evidence bundle",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/markdown/source-prune-plan.md:verification report, verification records, prompt pack",
    "apps/cli/studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-prune-plan.json:verification report, verification records, prompt pack",
    "source prune recommended action verification record boundary",
    "--iterations 376"
  ], {
    forbidden: [
      "packages/core/src/source-prune.ts:preserved evidence bundle and confirms source links",
      "packages/core/src/source-prune.ts:absorbed guide, verification report, prompt pack",
      "packages/core/src/teaching-workspace.ts:검증 리포트가 부족하면 생성된 세션 \\`source/\\` 스냅샷은 보존합니다"
    ]
  }),
  check("teaching mission source cleanup decision markdown code path formatting", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/teaching-workspace.ts:생성된 세션 \\`source/\\` 스냅샷은 영구 학습 콘텐츠가 아니라", "packages/core/src/teaching-workspace.ts:생성된 세션 \\`source/\\` 스냅샷만 정리합니다", "packages/core/src/teaching-workspace.ts:생성된 세션 \\`source/\\` 스냅샷은 보존합니다", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷은 영구 학습 콘텐츠가 아니라", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷만 정리합니다", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷은 보존합니다", "teaching mission source cleanup decision markdown code path formatting", "--iterations 313"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷은 영구 학습 콘텐츠가 아니라",
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷만 정리합니다",
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷은 보존합니다",
      "packages/core/src/pipeline.test.ts:expect(missionText).toContain(\"생성된 세션 source/ 스냅샷은 영구 학습 콘텐츠가 아니라",
      "packages/core/src/pipeline.test.ts:expect(missionText).toContain(\"생성된 세션 source/ 스냅샷만 정리합니다",
      "packages/core/src/pipeline.test.ts:expect(missionText).toContain(\"조사 필요 항목이 남아 있거나 검증 리포트가 부족하면 생성된 세션 source/ 스냅샷은 보존합니다"
    ]
  }),
  check("teaching resources source retention guide markdown code path formatting", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/teaching-workspace.ts:생성된 세션 `source/` 스냅샷 정리 검토 판단 기준", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷 정리 검토 판단 기준", "teaching resources source retention guide markdown code path formatting", "--iterations 314"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷 정리 검토 판단 기준",
      "packages/core/src/pipeline.test.ts:expect(resourcesText).toContain(\"생성된 세션 source/ 스냅샷 정리 검토 판단 기준\")"
    ]
  }),
  check("teaching notes learner role guardrail", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Learner Role", "학습자는 전문 개발자가 아니라 바이브코딩 개발자입니다", "제품 목적, 아키텍처 이유, 책임 경계, 핵심 용어, AI 프롬프트, 수락 기준, 검증 질문", "AI는 실제 코드 작성과 반복 구현을 담당", "전통적인 문법 강의나 라인별 코딩 수업", "source evidence를 AI 구현 지시와 리뷰 기준", "teaching notes learner role guardrail"]),
  check("learning records evidence purpose", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Evidence purpose", "단순 점수 저장이나 문법 암기표가 아닙니다", "제품 목적, 아키텍처 이유, 파일 책임, 핵심 용어, AI 구현 프롬프트, 수락 기준, 검증 질문", "AI에게 맡길 보강 프롬프트", "source-absorption-ledger, session-verification, source-retention-guide", "learning records evidence purpose"]),
  check("quiz attempt vibe coding evidence", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["## Vibe-coding evidence", "문법 암기표가 아니라 AI에게 줄 구현 맥락 준비도", "제품 목적, 책임 경계, 핵심 용어, AI 구현 프롬프트, 수락 기준, 검증 질문", "AI repair prompt", "source-absorption-ledger, session-verification, source-retention-guide", "quiz attempt vibe coding evidence"]),
  check("quiz learning record non-completion wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["이 기록은 이해 확정 선언이 아니라 다음 수업 난이도를 낮추는 근거입니다", "문법 암기표가 아니라 AI에게 줄 구현 맥락 준비도", "not.toContain(\"이 기록은 이해 완료가 아니라 다음 수업 난이도를 낮추는 근거입니다\")", "not.toContain(\"문법 암기 완료표가 아니라 AI에게 줄 구현 맥락 준비도\")", "quiz learning record non-completion wording", "--iterations 266"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:이 기록은 이해 완료가 아니라 다음 수업 난이도를 낮추는 근거입니다",
      "packages/core/src/teaching-workspace.ts:문법 암기 완료표가 아니라 AI에게 줄 구현 맥락 준비도",
      "packages/core/src/pipeline.test.ts:expect(recordText).toContain(\"문법 암기 완료표가 아니라 AI에게 줄 구현 맥락 준비도\")",
      "packages/core/src/pipeline.test.ts:expect(reviewRecordText).toContain(\"이 기록은 이해 완료가 아니라 다음 수업 난이도를 낮추는 근거입니다\")",
      "packages/core/src/pipeline.test.ts:expect(reviewRecordText).toContain(\"문법 암기 완료표가 아니라 AI에게 줄 구현 맥락 준비도\")"
    ]
  }),
  check("first lesson vibe coding boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["바이브코딩 수업 경계", "배우지 않는 것: 언어 문법 암기, 라인별 코딩, 원본 소스 전체 내장", "반드시 배우는 것: 제품 목적, 아키텍처 이유, 폴더/파일 책임, 핵심 용어, AI 구현 프롬프트, 수락 기준, 검증 질문", "AI에게 맡기는 것: 실제 코드 작성, 반복 구현, 문법 세부사항 적용", "source-absorption-ledger, session-verification, source-retention-guide", "first lesson vibe coding boundary"]),
  check("rebuild cheatsheet vibe coding rules", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["바이브코딩 재구현 규칙", "학습자는 제품 목적, 사용자 문제, 아키텍처 책임, 수락 기준, 검증 질문을 먼저 고정합니다", "AI는 실제 코드 작성, 반복 구현, 문법 세부사항 적용을 맡습니다", "원본 소스 전체를 복사하거나 앱 지식으로 내장하지 않고", "source evidence를 구현 지시와 리뷰 기준으로 바꿉니다", "실행 명령, 테스트, 화면 확인, 사람 판단 항목", "rebuild cheatsheet vibe coding rules"]),
  check("rebuild cheatsheet acceptance verification wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["각 slice는 AI 요청을 보내거나 결과를 수락하기 전에", "<h3>수락/검증 기준</h3>", "not.toContain(\"각 slice는 완료 전에\")", "not.toContain(\"<h3>Completion Criteria</h3>\")", "rebuild cheatsheet acceptance verification wording", "--iterations 264"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:각 slice는 완료 전에",
      "packages/core/src/teaching-workspace.ts:<h3>Completion Criteria</h3>",
      "packages/core/src/pipeline.test.ts:expect(rebuildCheatsheetHtml).toContain(\"각 slice는 완료 전에\")",
      "packages/core/src/pipeline.test.ts:expect(rebuildCheatsheetHtml).toContain(\"<h3>Completion Criteria</h3>\")"
    ]
  }),
  check("glossary vibe coding term rules", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["용어 사용 규칙", "용어는 개발자 시험 단어가 아니라 AI와 소통하는 책임 라벨입니다", "어떤 책임, 데이터 흐름, 검증 기준에 연결되는지 함께 말합니다", "문법 세부사항으로 외우지 말고", "source evidence에서 발견한 용어는 구현 프롬프트 문장이나 AI 출력 리뷰 체크리스트로 바꿉니다", "glossary vibe coding term rules"]),
  check("main glossary prompt review cards", [
    "packages/html/src/templates.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["glossary-prompt-use-cards", "glossaryCards", "promptUse", "reviewQuestion", "memorizationWarning", "data-glossary-use=\"ai-prompt-review\"", "용어는 문법 암기장이 아니라 AI에게 목적, 책임, 검증 기준을 말하기 위한 프롬프트 부품입니다", "AI에게 지시할 문장", "AI 출력 리뷰 질문", "외우지 말 것", "main glossary prompt review cards"]),
  check("glossary json prompt review fields", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["promptUse: z.string()", "reviewQuestion: z.string()", "memorizationWarning: z.string()", "\"promptUse\"", "\"reviewQuestion\"", "\"memorizationWarning\"", "문법 세부사항으로 외우지 말고", "glossary json prompt review fields"]),
  check("teaching glossary prompt review reference", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["ai-prompt-review-reference", "Source evidence:", "AI에게 지시할 문장", "AI 출력 리뷰 질문", "외우지 말 것", "term.promptUse", "term.reviewQuestion", "term.memorizationWarning", "teaching glossary prompt review reference"]),
  check("source absorption ai confirmation prompts", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["sourceAbsorptionAiConfirmationPrompt", "AI에게 줄 확인 프롬프트", "PASS_REVIEW / REVISE / BLOCK 검토 상태", "PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, 최종 ACCEPT, 배포, source 삭제 허가가 아니라", "not.toContain(\"PASS_REVIEW도 조사 종료, source 삭제, 최종 승인 허가가 아니라\")", "부족하면 추가 조사 질문 3개", "현재 목표 조사 판단", "현재 학습 목표와 정적 근거 기준에서 맞는지", "source absorption ai confirmation prompts", "--iterations 253"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<strong>추가 조사 판단:</strong>",
      "packages/core/src/teaching-workspace.ts:- 추가 조사 판단:",
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, source 삭제, 최종 승인 허가가 아니라",
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 조사 종료, source 삭제, 최종 승인 허가가 아니라",
      "packages/core/src/teaching-workspace.ts:PASS / REVISE / BLOCK으로 알려줘",
      "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toContain(\"PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, source 삭제, 최종 승인 허가가 아니라\")",
      "packages/core/src/pipeline.test.ts:expect(absorptionMarkdown).toContain(\"PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, source 삭제, 최종 승인 허가가 아니라\")",
      "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toContain(\"PASS / REVISE / BLOCK\")",
      "packages/core/src/pipeline.test.ts:expect(absorptionMarkdown).toContain(\"PASS / REVISE / BLOCK\")"
    ]
  }),
  check("source absorption current goal research scope", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["currentGoalNoFurtherResearch", "현재 학습 목표 기준:", "현재 학습 목표에서 무엇은 반복 조사하지 않아도 되는지", "현재 학습 목표와 정적 분석 기준으로 반복 조사할 항목은 없습니다", "현재 학습 목표와 정적 분석 기준으로 추가 조사 필요 항목이 없습니다", "현재 목표 추가 조사 필요 여부", "source absorption current goal research scope"], {
    forbidden: ["packages/core/src/teaching-workspace.ts:무엇은 더 조사하지 않아도 되는지"]
  }),
  check("source absorption no further research verification record boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:session verification, verification records, daily summary",
    "packages/core/src/teaching-workspace.ts:retention guide, verification records, 이 ledger",
    "packages/core/src/pipeline.test.ts:not.toContain(\"정적 분석으로 확인한 것과 실행해야 할 것은 session verification과 daily summary에 남았습니다.\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"용량 정리 판단은 retention guide와 이 ledger를 기준으로 하고\")",
    "source absorption no further research verification record boundary",
    "--iterations 386"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:정적 분석으로 확인한 것과 실행해야 할 것은 session verification과 daily summary에 남았습니다.",
      "packages/core/src/teaching-workspace.ts:용량 정리 판단은 retention guide와 이 ledger를 기준으로 하고"
    ]
  }),
  check("vibe start retention decision session verification boundary", [
    "packages/html/src/templates.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/html/src/templates.ts:보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 기준으로 생성된 세션 source/ 스냅샷",
    "packages/core/src/markdown.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰",
    "packages/core/src/pipeline.test.ts:not.toContain(\"보존 증거, daily summary, prompt pack, 검증 기록, 현재 학습 목표",
    "packages/core/src/pipeline.test.ts:not.toContain(\"source-retention-guide.html에서 보존 증거와 현재 학습 목표",
    "vibe start retention decision session verification boundary",
    "--iterations 400"
  ], {
    forbidden: [
      "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표가 남았는지 확인한 뒤",
      "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 확인한 뒤",
      "packages/html/src/templates.ts:보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 기준으로 생성된 세션 source/ 스냅샷",
      "packages/core/src/markdown.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표가 남았는지 확인한 뒤",
      "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 검증 기록, 현재 학습 목표",
      "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거와 현재 학습 목표를 확인한 뒤 생성된 세션 source/ 스냅샷",
      "packages/core/src/markdown.ts:보존 증거, daily summary, prompt pack, 검증 기록, 현재 학습 목표"
    ]
  }),
  check("teaching workspace dynamic reference cards", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["teachingWorkspaceHtml(input)", "teachingWorkspaceReferenceCards", "referenceCards.length", "용어를 정의 암기표가 아니라 AI 지시 문장과 AI 출력 리뷰 질문", "AI 확인 프롬프트와 함께 분리합니다", "not.toContain(\"자주 다시 보는 용어 cheat sheet\")", "teaching workspace dynamic reference cards"]),
  check("reference artifacts prompt review guidance", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "docs/product/storage-model.md",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 지시 문장, 리뷰 질문, 전이 판단, 소스 정리 근거", "not.toContain(\"reference 문서는 자주 다시 보는 cheat sheet 역할만 합니다\")", "reusable glossary, rebuild prompt guides", "reference artifacts prompt review guidance"]),
  check("teaching workspace rebuild prompt guide card", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["첫 vertical slice, 수락 기준, 검증 계획을 AI 구현 지시로 바꾸는 prompt guide", "not.toContain(\"재구현 순서와 copy/paste prompt를 빠르게 확인합니다\")", "GitHub Copilot official prompt guidance", "teaching workspace rebuild prompt guide card"]),
  check("prompt pack source grounded handoff label", [
    "packages/html/src/templates.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Source-Grounded Implementation Prompt", "source-grounded implementation prompt", "not.toContain(\"Copy/Paste Prompt\")", "not.toContain(\"## Copy/Paste Prompt\")", "prompt pack source grounded handoff label"]),
  check("research prompt pack source grounded coverage label", [
    "docs/research/vibe-coding-best-practices.md",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["source-grounded implementation prompts for AI-directed development", "research prompt pack source grounded coverage label"]),
  check("learning path prompt pack source grounded goal", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI에게 줄 근거 기반 구현 지시서", "not.toContain(\"AI에게 줄 copy/paste 프롬프트\")", "learning path prompt pack source grounded goal"]),
  check("daily summary prompt reuse source grounded rewrite", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["source evidence와 내 목표에 맞게 다듬은 AI 구현 지시서", "AI에게 계획과 검증 기준만 요청하세요", "not.toContain(\"AI에게 그대로 붙여넣을 수 있는 프롬프트\")", "not.toContain(\"첫 프롬프트를 복사해 AI에게 계획만 요청하세요\")", "daily summary prompt reuse source grounded rewrite"]),
  check("vibe start implementation brief learner adaptation", [
    "packages/html/src/templates.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검증 계획을 내 목표에 맞춘 구현 지시 후보로 압축합니다", "AI에게 넘길 첫 구현 브리프를 내 목표에 맞게 다듬습니다", "7. 검토 후 다듬을 첫 구현 프롬프트", "vibe-coding-prompt-pack.html의 orient/architect/plan 단계를 검토 후 AI 요청 후보로 다듬습니다", "not.toContain(\"검증 계획을 내 목표에 맞춘 구현 지시서로 압축합니다\")", "not.toContain(\"복사용 구현 프롬프트를 한 장짜리 지시서로 압축합니다\")", "not.toContain(\"AI에게 넘길 첫 구현 브리프를 복사합니다\")", "not.toContain(\"7. 첫 구현 프롬프트\")", "not.toContain(\"vibe-coding-prompt-pack.html의 orient/architect/plan 단계를 검토 후 AI에게 요청합니다\")", "not.toContain(\"vibe-coding-prompt-pack.html의 orient/architect/plan 단계만 AI에게 먼저 요청합니다\")", "vibe start implementation brief learner adaptation"], {
    forbidden: [
      "packages/html/src/templates.ts:7. 첫 구현 프롬프트",
      "packages/core/src/markdown.ts:7. 첫 구현 프롬프트",
      "packages/html/src/templates.ts:검증 계획을 내 목표에 맞춘 구현 지시서로 압축합니다",
      "packages/core/src/markdown.ts:검증 계획을 내 목표에 맞춘 구현 지시서로 압축합니다",
      "packages/html/src/templates.ts:vibe-coding-prompt-pack.html의 orient/architect/plan 단계를 검토 후 AI에게 요청합니다",
      "packages/core/src/markdown.ts:vibe-coding-prompt-pack.html의 orient/architect/plan 단계를 검토 후 AI에게 요청합니다",
      "packages/html/src/templates.ts:vibe-coding-prompt-pack.html의 orient/architect/plan 단계만 AI에게 먼저 요청합니다",
      "packages/core/src/markdown.ts:vibe-coding-prompt-pack.html의 orient/architect/plan 단계만 AI에게 먼저 요청합니다"
    ]
  }),
  check("vibe start source retention cleanup review wording", [
    "packages/html/src/templates.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/markdown.ts:생성된 세션 \\`source/\\` 스냅샷 정리 검토 여부를 판단합니다", "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤에만 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다", "packages/core/src/pipeline.test.ts:not.toContain(\"source-retention-guide.html을 보고 원본 source snapshot을 계속 둘지 판단합니다\")", "packages/core/src/pipeline.test.ts:not.toContain(\"분석이 끝난 원본 source snapshot을 계속 둘지 정리할지 판단합니다\")", "vibe start source retention cleanup review wording", "--iterations 400"], {
    forbidden: [
      "packages/core/src/markdown.ts:원본 source snapshot을 계속 둘지",
      "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 확인한 뒤 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다",
      "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거와 현재 학습 목표를 확인한 뒤 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다",
      "packages/html/src/templates.ts:보존 증거와 현재 학습 목표를 기준으로 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다",
      "packages/html/src/templates.ts:source-retention-guide.html을 보고 원본 source snapshot을 계속 둘지 판단합니다",
      "packages/html/src/templates.ts:분석이 끝난 원본 source snapshot을 계속 둘지 정리할지 판단합니다",
      "packages/core/src/markdown.ts:evidence, daily summary, prompt pack, verification이 남았는지 확인한 뒤 정리합니다",
      "packages/html/src/templates.ts:evidence, daily summary, prompt pack, verification이 남았는지 확인한 뒤 정리합니다"
    ]
  }),
  check("vibe start markdown source retention code path formatting", [
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/core/src/markdown.ts:생성된 세션 \\`source/\\` 스냅샷 정리 검토 여부를 판단합니다", "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷 정리 검토 여부를 판단합니다", "vibe start markdown source retention code path formatting", "--iterations 315"], {
    forbidden: [
      "packages/core/src/markdown.ts:생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다",
      "packages/core/src/pipeline.test.ts:expect(vibeStartMarkdown).toContain(\"생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다\")"
    ]
  }),
  check("vibe start markdown source retention source-link confirmation boundary", [
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰이 준비된 뒤에만 생성된 세션 \\`source/\\` 스냅샷 정리 검토 여부를 판단합니다",
    "packages/core/src/markdown.ts:정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰을 함께 봅니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, `DELETE-SOURCE-SNAPSHOT` 확인 토큰이 준비된 뒤에만 생성된 세션 `source/` 스냅샷 정리 검토 여부를 판단합니다\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 현재 학습 목표 확인, 학습자 명시 확인, `DELETE-SOURCE-SNAPSHOT` 확인 토큰을 함께 봅니다\")",
    "vibe start markdown source retention source-link confirmation boundary",
    "--iterations 419"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰",
      "packages/core/src/markdown.ts:정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 현재 학습 목표 확인, 학습자 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰",
      "packages/core/src/pipeline.test.ts:expect(vibeStartMarkdown).toContain(\"보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, `DELETE-SOURCE-SNAPSHOT` 확인 토큰이 준비된 뒤에만 생성된 세션 `source/`",
      "packages/core/src/pipeline.test.ts:expect(vibeStartMarkdown).toContain(\"정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 현재 학습 목표 확인, 학습자 명시 확인, `DELETE-SOURCE-SNAPSHOT` 확인 토큰을 함께 봅니다\")"
    ]
  }),
  check("vibe start html next action source retention code path formatting", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/html/src/templates.ts:listItemHtml", "packages/html/src/templates.ts:inlineCodePathHtml(normalizedItem, [\"source/\"])", "packages/core/src/pipeline.test.ts:source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤에만 생성된 세션 <code>source/</code> 스냅샷", "packages/core/src/pipeline.test.ts:not.toContain(\"source-retention-guide.html에서 보존 증거와 현재 학습 목표를 확인한 뒤 생성된 세션 <code>source/</code> 스냅샷\")", "vibe start html next action source retention code path formatting", "--iterations 400"], {
    forbidden: [
      "packages/core/src/pipeline.test.ts:expect(vibeStartHtml).toContain(\"source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 확인한 뒤 생성된 세션 <code>source/</code> 스냅샷\")",
      "packages/core/src/pipeline.test.ts:expect(vibeStartHtml).toContain(\"source-retention-guide.html에서 보존 증거와 현재 학습 목표를 확인한 뒤 생성된 세션 source/ 스냅샷\")"
    ]
  }),
  check("vibe start html source retention source-link confirmation boundary", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 준비된 뒤에만 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다",
    "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤에만 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다",
    "packages/html/src/templates.ts:정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 봅니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 준비된 뒤에만 생성된 세션 <code>source/</code>\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤에만 생성된 세션 <code>source/</code> 스냅샷\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 봅니다\")",
    "vibe start html source retention source-link confirmation boundary",
    "--iterations 418"
  ], {
    forbidden: [
      "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
      "packages/html/src/templates.ts:source-retention-guide.html에서 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
      "packages/html/src/templates.ts:정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰"
    ]
  }),
  check("teaching workspace html source retention card code path formatting", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["packages/html/src/templates.ts:teachingWorkspaceCardDescriptionHtml", "packages/core/src/pipeline.test.ts:보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 기준으로 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다", "packages/core/src/pipeline.test.ts:not.toContain(\"보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 기준으로 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다\")", "packages/core/src/pipeline.test.ts:not.toContain(\"보존 증거와 현재 학습 목표를 기준으로 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다\")", "teaching workspace html source retention card code path formatting", "--iterations 400"], {
    forbidden: [
      "packages/core/src/pipeline.test.ts:expect(teachingWorkspaceHtml).toContain(\"보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 기준으로 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다\")",
      "packages/core/src/pipeline.test.ts:expect(teachingWorkspaceHtml).toContain(\"보존 증거와 현재 학습 목표를 기준으로 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다\")",
      "packages/html/src/templates.ts:보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 기준으로 생성된 세션 source/ 스냅샷"
    ]
  }),
  check("desktop report target source retention code path formatting", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:reportTargetDescriptionNode", "apps/desktop-tauri/src/App.tsx:<code>source/</code>", "apps/desktop-tauri/src/App.tsx:reportTargetDescriptionNode(target.description)", "apps/desktop-tauri/src/App.tsx:reportTargetDescriptionNode(activeReportTarget.description)", "desktop report target source retention code path formatting", "--iterations 318"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:<p>{target.description}</p>",
      "apps/desktop-tauri/src/App.tsx:<p>{activeReportTarget.description}</p>"
    ]
  }),
  check("desktop source purpose contract source retention code path formatting", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode", "apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode(item.body)", "apps/desktop-tauri/src/App.tsx:<code>source/</code>", "desktop source purpose contract source retention code path formatting", "--iterations 319"]),
  check("desktop source retention recommendation code path formatting", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode(sourceRetentionRecommendation)", "apps/desktop-tauri/src/App.tsx:<code>source/</code>", "desktop source retention recommendation code path formatting", "--iterations 320"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:<p>{sourceRetentionRecommendation}</p>"
    ]
  }),
  check("desktop source retention visible body code path formatting", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:normalizedText.includes(\"source/\")", "apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode(sourceAbsorptionEvidence)", "apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode(sourceAbsorptionNextAction)", "apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode(sourceKnowledgePolicyLabel)", "apps/desktop-tauri/src/App.tsx:<li key={condition}>{sourceSnapshotCodePathNode(condition)}</li>", "desktop source retention visible body code path formatting", "--iterations 321"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:<p>{sourceAbsorptionEvidence}</p>",
      "apps/desktop-tauri/src/App.tsx:<dd>{sourceAbsorptionNextAction}</dd>",
      "apps/desktop-tauri/src/App.tsx:<p>{sourceKnowledgePolicyLabel}</p>",
      "apps/desktop-tauri/src/App.tsx:<li key={condition}>{condition}</li>"
    ]
  }),
  check("desktop handoff and plain log source path channel", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode(item.hint)", "apps/desktop-tauri/src/App.tsx:<p key={`${line}-${index}`}>{line}</p>", "apps/desktop-tauri/src/App.tsx:<pre>{sourceRetentionDecisionPrompt}</pre>", "apps/desktop-tauri/src/App.tsx:title=\"생성된 세션 source/ 스냅샷 보존 상태를 다시 확인합니다.\"", "apps/desktop-tauri/src/App.tsx:window.prompt(\"정리 전 markdown/source-prune-plan.md", "desktop handoff and plain log source path channel", "--iterations 329"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:{item.label}: {item.ready ? \"준비됨\" : \"보강 필요\"} · {item.hint}",
      "apps/desktop-tauri/src/App.tsx:sourceSnapshotCodePathNode(line)"
    ]
  }),
  check("teaching workspace lesson and learning record source path formatting", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:이 lesson 통과만으로 생성된 세션 <code>source/</code> 스냅샷 정리를 결정하지 않고, source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/teaching-workspace.ts:통과해도 생성된 세션 \\`source/\\` 스냅샷 정리 검토는 source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/teaching-workspace.ts:이 기록만으로 생성된 세션 \\`source/\\` 스냅샷 정리를 결정하지 않고, source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/pipeline.test.ts:이 lesson 통과만으로 생성된 세션 <code>source/</code> 스냅샷 정리를 결정하지 않고",
    "packages/core/src/pipeline.test.ts:통과해도 생성된 세션 `source/` 스냅샷 정리 검토는 source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/pipeline.test.ts:이 기록만으로 생성된 세션 `source/` 스냅샷 정리를 결정하지 않고",
    "packages/core/src/pipeline.test.ts:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "teaching workspace lesson and learning record source path formatting",
    "--iterations 401"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:source-retention-guide, 현재 학습 목표를 함께 확인합니다",
      "packages/core/src/teaching-workspace.ts:현재 학습 목표 확인 뒤 별도로 판단합니다",
      "packages/core/src/teaching-workspace.ts:<li>정리 판단: 이 lesson 통과만으로 생성된 세션 source/ 스냅샷 정리를 결정하지 않고",
      "packages/core/src/teaching-workspace.ts:- 통과해도 생성된 세션 source/ 스냅샷 정리 검토는 source-absorption-ledger",
      "packages/core/src/teaching-workspace.ts:- 이 기록만으로 생성된 세션 source/ 스냅샷 정리를 결정하지 않고"
    ]
  }),
  check("teaching workspace records source-link confirmation boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:retained artifact, verification checkpoint, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/teaching-workspace.ts:source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 확인 뒤 별도로 판단합니다",
    "packages/core/src/teaching-workspace.ts:source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 확인합니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"생성된 세션 `source/` 스냅샷 정리 검토 여부는 reference/source-retention-guide.html의 retained artifact, verification checkpoint, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤에만 판단합니다\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"통과해도 생성된 세션 `source/` 스냅샷 정리 검토는 source-absorption-ledger, session-verification, verification records, source-retention-guide, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 확인 뒤 별도로 판단합니다\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 확인합니다\")",
    "teaching workspace records source-link confirmation boundary",
    "--iterations 420"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:retained artifact, verification checkpoint, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
      "packages/core/src/teaching-workspace.ts:source-retention-guide, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 확인 뒤 별도로 판단합니다",
      "packages/core/src/teaching-workspace.ts:source-retention-guide, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 확인합니다",
      "packages/core/src/pipeline.test.ts:expect(notesMarkdown).toContain(\"생성된 세션 `source/` 스냅샷 정리 검토 여부는 reference/source-retention-guide.html의 retained artifact, verification checkpoint, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
      "packages/core/src/pipeline.test.ts:expect(learningRecordsReadme).toContain(\"통과해도 생성된 세션 `source/` 스냅샷 정리 검토는 source-absorption-ledger, session-verification, verification records, source-retention-guide, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
      "packages/core/src/pipeline.test.ts:expect(recordText).toContain(\"현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 확인합니다\")"
    ]
  }),
  check("mastery checklist prompt source-link confirmation boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/pipeline.test.ts:<pre>생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/pipeline.test.ts:- Prompt: 생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/pipeline.test.ts:not.toContain(\"<pre>생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"- Prompt: 생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰\")",
    "mastery checklist prompt source-link confirmation boundary",
    "--iterations 421"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"<pre>생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistMarkdown).toContain(\"- Prompt: 생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰"
    ]
  }),
  check("implementation brief cleanup decision source-link confirmation boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다",
    "packages/core/src/pipeline.test.ts:source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션",
    "packages/core/src/pipeline.test.ts:not.toContain(\"source-absorption-ledger, session-verification, verification records, source-retention-guide, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"- source-absorption-ledger, session-verification, verification records, source-retention-guide, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션 `source/` 스냅샷 정리 검토 여부를 판단합니다.\")",
    "implementation brief cleanup decision source-link confirmation boundary",
    "--iterations 422"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:source-absorption-ledger, session-verification, verification records, source-retention-guide, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다",
      "packages/core/src/pipeline.test.ts:expect(implementationBriefHtml).toContain(\"source-absorption-ledger, session-verification, verification records, source-retention-guide, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션",
      "packages/core/src/pipeline.test.ts:expect(implementationBriefMarkdown).toContain(\"- source-absorption-ledger, session-verification, verification records, source-retention-guide, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션"
    ]
  }),
  check("source retention and absorption artifact source path formatting", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:generatedSourceSnapshotHtml",
    "packages/core/src/teaching-workspace.ts:generatedSourceSnapshotMarkdown",
    "packages/core/src/teaching-workspace.ts:현재 생성 세션 <code>source/</code> 스냅샷",
    "packages/core/src/teaching-workspace.ts:생성된 세션 <code>source/</code> 스냅샷은 근거입니다",
    "packages/core/src/teaching-workspace.ts:생성된 세션 `source/` 스냅샷은 정리 검토 후보일 뿐",
    "packages/core/src/pipeline.test.ts:현재 생성 세션 <code>source/</code> 스냅샷",
    "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷",
    "source retention and absorption artifact source path formatting",
    "--iterations 324"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<h2>현재 생성 세션 source/ 스냅샷</h2>",
      "packages/core/src/teaching-workspace.ts:<p>생성된 세션 source/ 스냅샷은 근거입니다",
      "packages/core/src/teaching-workspace.ts:<p>아래 산출물이 남아 있어야 생성된 세션 source/ 스냅샷",
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷은 evidence 링크 검증에 쓰입니다"
    ]
  }),
  check("implementation and backlog source path channel formatting", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:brief.learnerDecisions.map((item) => `<li>${generatedSourceSnapshotHtml(item)}</li>`)",
    "packages/core/src/teaching-workspace.ts:brief.learnerDecisions.map((item) => `- ${generatedSourceSnapshotMarkdown(item)}`)",
    "packages/core/src/markdown.ts:오래된 생성 세션 `source/` 스냅샷을 정리하거나 축약할지",
    "packages/html/src/templates.ts:improvementBacklogItemTextHtml(item.action)",
    "packages/core/src/pipeline.test.ts:오래된 생성 세션 <code>source/</code> 스냅샷을 정리하거나 축약할지",
    "packages/core/src/pipeline.test.ts:생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단",
    "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷 정리 검토 여부를 판단",
    "packages/core/src/pipeline.test.ts:<pre>생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/pipeline.test.ts:source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션",
    "packages/core/src/pipeline.test.ts:not.toContain(\"<pre>생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 남은 산출물과 끊기는 evidence link\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"source-absorption-ledger, session-verification, verification records, source-retention-guide를 본 뒤 생성된 세션\")",
    "implementation and backlog source path channel formatting",
    "--iterations 404"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:오래된 생성 세션 source/ 스냅샷을 정리하거나 축약할지 검토하기 전에",
      "packages/html/src/templates.ts:<p>${escapeHtml(item.action)}</p>",
      "packages/core/src/pipeline.test.ts:expect(improvementBacklogMarkdown).toContain(\"오래된 생성 세션 source/ 스냅샷",
      "packages/core/src/pipeline.test.ts:<li>source-absorption-ledger, session-verification, source-retention-guide를 본 뒤 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다.</li>\")"
    ]
  }),
  check("html export readme source target markdown formatting", [
    "packages/core/src/quiz.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "packages/shared/src/report-targets.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/quiz.ts:exportReadmeDescriptionMarkdown(entry.description)",
    "packages/core/src/quiz.ts:생성된 세션 `source/` 스냅샷",
    "packages/html/src/templates.ts:소스 보존 판단",
    "packages/html/src/templates.ts:생성된 세션 source/ 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 정리 검토 후보로 둘지 판단합니다.",
    "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 정리 검토 후보로 둘지 판단합니다.",
    "packages/core/src/pipeline.test.ts:not.toContain(\"생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 무엇을 남긴 뒤",
    "packages/core/src/pipeline.test.ts:not.toContain(\"생성된 세션 source/ 스냅샷을 장기 앱 지식으로 내장하지 않고",
    "packages/shared/src/report-targets.ts:description: \"원본 소스를 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
    "html export readme source target markdown formatting",
    "html export readme source target verification record boundary",
    "--iterations 400"
  ], {
    forbidden: [
      "packages/core/src/quiz.ts:entry.description}`)",
      "packages/html/src/templates.ts:생성된 세션 source/ 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 남긴 뒤 정리 검토 후보로 둘지 판단합니다.",
      "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 남긴 뒤 정리 검토 후보로 둘지 판단합니다.",
      "packages/html/src/templates.ts:생성된 세션 source/ 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤",
      "packages/core/src/pipeline.test.ts:expect(exportReadmeText).toContain(\"생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤",
      "packages/shared/src/report-targets.ts:현재 학습 목표를 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/html/src/templates.ts:무엇을 남긴 뒤 정리 검토 후보로 둘지 판단합니다.",
      "packages/core/src/pipeline.test.ts:expect(exportReadmeText).toContain(\"생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 무엇을 남긴 뒤",
      "packages/shared/src/report-targets.ts:생성된 세션 `source/` 스냅샷"
    ]
  }),
  check("html export readme source target source-link confirmation boundary", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/html/src/templates.ts:생성된 세션 source/ 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 정리 검토 후보로 둘지 판단합니다.",
    "packages/core/src/pipeline.test.ts:생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 정리 검토 후보로 둘지 판단합니다.",
    "packages/core/src/pipeline.test.ts:not.toContain(\"생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 정리 검토 후보로 둘지 판단합니다.\")",
    "html export readme source target source-link confirmation boundary",
    "--iterations 417"
  ], {
    forbidden: [
      "packages/html/src/templates.ts:생성된 세션 source/ 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤",
      "packages/core/src/pipeline.test.ts:expect(exportReadmeText).toContain(\"생성된 세션 `source/` 스냅샷을 장기 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤"
    ]
  }),
  check("desktop source path renderer markdown-origin normalization", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:const normalizedText = text.replaceAll(\"`source/`\", \"source/\");",
    "apps/desktop-tauri/src/App.tsx:if (!normalizedText.includes(\"source/\")) return text;",
    "apps/desktop-tauri/src/App.tsx:const segments = normalizedText.split(\"source/\");",
    "desktop source path renderer markdown-origin normalization",
    "--iterations 327"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:const segments = text.split(\"source/\");"
    ]
  }),
  check("html inline code path markdown-origin normalization", [
    "packages/html/src/templates.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/html/src/templates.ts:function normalizeInlineCodePathText(value: string, inlineCodePaths: string[]): string",
    "packages/html/src/templates.ts:normalizedValue = normalizedValue.replaceAll(`\\`${codePath}\\``, codePath);",
    "packages/html/src/templates.ts:let html = escapeHtml(normalizeInlineCodePathText(value, inlineCodePaths));",
    "packages/html/src/templates.ts:const normalizedItem = normalizeInlineCodePathText(item, [\"source/\"]);",
    "packages/html/src/templates.ts:const normalizedDescription = normalizeInlineCodePathText(description, [\"source/\"]);",
    "packages/html/src/templates.ts:const normalizedValue = normalizeInlineCodePathText(value, [\"source/\"]);",
    "html inline code path markdown-origin normalization",
    "--iterations 328"
  ], {
    forbidden: [
      "packages/html/src/templates.ts:const normalizedValue = value.replaceAll(\"`source/`\", \"source/\");",
      "packages/html/src/templates.ts:let html = escapeHtml(value);"
    ]
  }),
  check("quiz html source path body formatting", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/html/src/templates.ts:function quizBodyTextHtml(value: string): string",
    "packages/html/src/templates.ts:function quizWrongChoiceRationalesHtml(question: QuizQuestion): string",
    "packages/html/src/templates.ts:return inlineCodePathHtml(normalizedValue, [\"source/\"]);",
    "packages/html/src/templates.ts:quizBodyTextHtml(value)",
    "packages/html/src/templates.ts:quizBodyTextHtml(question.explanation)",
    "packages/html/src/templates.ts:wrong-choice-rationales",
    "packages/html/src/templates.ts:quizWrongChoiceRationalesHtml(question)",
    "packages/core/src/pipeline.test.ts:생성된 세션 <code>source/</code> 스냅샷은 임시 프로젝트 근거",
    "packages/core/src/pipeline.test.ts:expect(quizText).toContain(\"생성된 세션 source/ 스냅샷은 임시 프로젝트 근거\");",
    "packages/core/src/pipeline.test.ts:expect(quizText).not.toContain(\"생성된 세션 <code>source/</code> 스냅샷은 임시 프로젝트 근거\");",
    "apps/cli/src/index.ts:console.log(`${key}. ${value}`);",
    "quiz html source path body formatting",
    "--iterations 330"
  ], {
    forbidden: [
      "packages/html/src/templates.ts:<strong>${key}</strong>. ${escapeHtml(value)}</button>",
      "packages/html/src/templates.ts:<strong>해설:</strong> ${escapeHtml(question.explanation)}",
      "packages/core/src/pipeline.test.ts:expect(quizText).toContain(\"생성된 세션 <code>source/</code>"
    ]
  }),
  check("wrong notes selected rationale source path channel formatting", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/quiz.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/teaching-workspace.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/shared/src/schemas.ts:selectedChoiceRationale: z.string().optional()",
    "packages/core/src/quiz.ts:selectedChoiceRationale: question.whyOtherChoicesAreWrong[selectedChoice]",
    "packages/core/src/markdown.ts:function wrongNoteMarkdownText(value: string): string",
    "packages/core/src/markdown.ts:- 선택지 복습: ${wrongNoteMarkdownText(note.selectedChoiceRationale)}",
    "packages/core/src/teaching-workspace.ts:function learningRecordMarkdownText(value: string): string",
    "packages/core/src/teaching-workspace.ts:선택지 복습: ${learningRecordMarkdownText(note.selectedChoiceRationale)}",
    "packages/html/src/templates.ts:function wrongNoteSelectedRationaleHtml(value: string | undefined): string",
    "packages/html/src/templates.ts:wrongNoteSelectedRationaleHtml(note.selectedChoiceRationale)",
    "packages/core/src/pipeline.test.ts:const sourceRetentionWrongAnswers = Object.fromEntries(quiz.questions.map((question) => [question.id, \"C\" as const]));",
    "packages/core/src/pipeline.test.ts:expect(wrongNotesMarkdownAfterReview).toContain(\"생성된 세션 `source/` 스냅샷은 임시 프로젝트 근거\");",
    "packages/core/src/pipeline.test.ts:expect(wrongNotesHtmlAfterReview).toContain(\"생성된 세션 <code>source/</code> 스냅샷은 임시 프로젝트 근거\");",
    "wrong notes selected rationale source path channel formatting",
    "--iterations 331"
  ], {
    forbidden: [
      "packages/core/src/pipeline.test.ts:expect(wrongNotesMarkdownAfterReview).toContain(\"생성된 세션 source/ 스냅샷은 임시 프로젝트 근거\")",
      "packages/core/src/pipeline.test.ts:expect(wrongNotesHtmlAfterReview).toContain(\"생성된 세션 source/ 스냅샷은 임시 프로젝트 근거\")",
      "packages/html/src/templates.ts:<p>${escapeHtml(note.selectedChoiceRationale)}</p>"
    ]
  }),
  check("cli quiz attempt review artifact guidance", [
    "apps/cli/src/index.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/cli/src/index.ts:wrongNotesHtml: path.join(sessionRoot, \"html\", \"wrong-notes.html\")",
    "apps/cli/src/index.ts:wrongNotesMarkdown: path.join(sessionRoot, \"markdown\", \"wrong-notes.md\")",
    "apps/cli/src/index.ts:오답노트의 선택지 복습과 learning-record를 열어 부족한 개념을 AI repair prompt로 다시 설명하세요.",
    "apps/cli/src/index.ts:learning-record를 열어 이번 퀴즈가 어떤 AI 구현 맥락 준비도를 증명했는지 확인하세요.",
    "apps/cli/src/index.ts:`- Wrong notes HTML: \\`${payload.wrongNotesHtml}\\``",
    "apps/cli/src/index.ts:`- Wrong notes Markdown: \\`${payload.wrongNotesMarkdown}\\``",
    "apps/cli/src/index.ts:const learningRecord = payload.learningRecord ?",
    "apps/cli/src/index.ts:`- Learning record: ${learningRecord}`",
    "apps/cli/src/index.ts:`- Review guidance: ${payload.reviewGuidance}`",
    "cli quiz attempt review artifact guidance",
    "--iterations 332"
  ], {
    forbidden: [
      "apps/cli/src/index.ts:`- Wrong notes: ${payload.wrongNotes}`",
      "apps/cli/src/index.ts:`- Learning record: ${payload.learningRecord ?? \"none\"}`"
    ]
  }),
  check("desktop quiz review artifact guidance", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:wrongNotesHtml?: string;",
    "apps/desktop-tauri/src/App.tsx:wrongNotesMarkdown?: string;",
    "apps/desktop-tauri/src/App.tsx:reviewGuidance?: string;",
    "apps/desktop-tauri/src/App.tsx:const attemptWrongNotesHtml = attempt?.wrongNotesHtml ?? attempt?.wrongNotes ?? null;",
    "apps/desktop-tauri/src/App.tsx:const attemptWrongNotesMarkdown = attempt?.wrongNotesMarkdown",
    "apps/desktop-tauri/src/App.tsx:const attemptReviewGuidance = attempt?.reviewGuidance",
    "apps/desktop-tauri/src/App.tsx:복습 산출물 준비: HTML",
    "apps/desktop-tauri/src/App.tsx:오답노트 HTML:",
    "apps/desktop-tauri/src/App.tsx:오답노트 Markdown:",
    "apps/desktop-tauri/src/App.tsx:Learning record:",
    "apps/desktop-tauri/src/App.tsx:AI 지시 복습 오답 {attempt.wrong}개",
    "apps/desktop-tauri/src/styles.css:.attempt-artifact-paths",
    "apps/desktop-tauri/src/styles.css:.attempt-review-guidance",
    "apps/desktop-tauri/src-tauri/src/lib.rs:wrong_notes_html: Option<String>",
    "apps/desktop-tauri/src-tauri/src/lib.rs:wrong_notes_markdown: Option<String>",
    "apps/desktop-tauri/src-tauri/src/lib.rs:review_guidance: Option<String>",
    "desktop quiz review artifact guidance",
    "--iterations 333"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 지시 복습 {attempt.wrongNotes}개",
      "apps/desktop-tauri/src/App.tsx:기록 파일:"
    ]
  }),
  check("cli source prune preserved evidence bundle complete handoff", [
    "apps/cli/src/index.ts",
    "packages/core/src/source-prune.ts",
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/source-prune.ts:PRESERVED_EVIDENCE_BUNDLE_ARTIFACTS",
    "apps/desktop-tauri/src/App.tsx:preservedEvidenceBundle",
    "apps/cli/src/index.ts:보존 확인:",
    "apps/cli/src/index.ts:reference/source-absorption-ledger.html",
    "apps/cli/src/index.ts:analysis/daily-summary-report.json",
    "apps/cli/src/index.ts:html/vibe-coding-prompt-pack.html",
    "apps/cli/src/index.ts:reference/vibe-coding-implementation-brief.html",
    "apps/cli/src/index.ts:html/session-verification.html",
    "apps/cli/src/index.ts:reference/source-retention-guide.html",
    "cli source prune preserved evidence bundle complete handoff",
    "--iterations 334"
  ]),
  check("source prune explicit confirmation guard boundary", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/cli/src/index.ts",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/source-prune.ts:SOURCE_PRUNE_CONFIRMATION_TOKEN",
    "packages/core/src/source-prune.ts:source prune apply requires confirm",
    "packages/core/src/source-prune.ts:The core apply guard requires the explicit \\`DELETE-SOURCE-SNAPSHOT\\` token.",
    "packages/core/src/source-prune.ts:confirmed the preserved evidence bundle",
    "packages/core/src/source-prune.ts:explicitly confirmed that source links no longer need to open for the current",
    "packages/core/src/pipeline.test.ts:await expect(applySourcePrunePlan(result.session.outputPaths.root)).rejects.toThrow",
    "packages/core/src/pipeline.test.ts:applySourcePrunePlan(result.session.outputPaths.root, { confirm: \"DELETE-SOURCE-SNAPSHOT\" })",
    "apps/cli/src/index.ts:applySourcePrunePlan(sessionRoot, { confirm })",
    "apps/cli/src/index.ts:READY_REVIEW 경계:",
    "apps/cli/src/index.ts:정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "apps/desktop-tauri/sidecar/bridge.ts:applySourcePrunePlan(request.params.sessionPath, { confirm })",
    "source prune explicit confirmation guard boundary",
    "--iterations 335"
  ]),
  check("source prune tombstone explicit learner confirmation boundary", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/source-prune.ts:explicitly confirmed that source links no longer need to open for the current",
    "packages/core/src/pipeline.test.ts:explicitly confirmed that source links no longer need to open for the current",
    "packages/core/src/pipeline.test.ts:not.toContain(\"and\\nconfirmed that source links no longer need to open for the current learning goal.\")",
    "source prune tombstone explicit learner confirmation boundary",
    "--iterations 411"
  ], {
    forbidden: [
      "packages/core/src/source-prune.ts:and\nconfirmed that source links no longer need to open for the current learning goal.",
      "packages/core/src/pipeline.test.ts:expect(tombstone).toContain(\"source links no longer need to open for the current learning goal\")"
    ]
  }),
  check("generated source cleanup confirmation token boundary", [
    "packages/core/src/markdown.ts",
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:The core apply guard rejects cleanup without the explicit",
    "packages/core/src/markdown.ts:final explicit confirmation that source links no longer need to open",
    "packages/core/src/markdown.ts:not permission created by READY_REVIEW",
    "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인입니다",
    "packages/core/src/pipeline.test.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인입니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자의 마지막 현재 목표 확인입니다\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자의 마지막 현재 학습 목표 확인과 명시 확인입니다\")",
    "packages/core/src/pipeline.test.ts:The core apply guard rejects cleanup without the explicit `DELETE-SOURCE-SNAPSHOT` confirmation token",
    "packages/core/src/pipeline.test.ts:Treat the token as the learner's final explicit confirmation that source links no longer need to open",
    "packages/core/src/pipeline.test.ts:not.toContain(\"Treat the token as the learner's final current-goal confirmation, not permission created by READY_REVIEW\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"Treat the token as the learner's final current-goal and explicit learner confirmation\")",
    "packages/core/src/pipeline.test.ts:not permission created by READY_REVIEW",
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT 확인 토큰으로 생성된 세션 source/ 스냅샷만 정리합니다",
    "apps/desktop-tauri/src/App.tsx:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "generated source cleanup confirmation token boundary",
    "--iterations 407"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:final current-goal confirmation, not permission created by READY_REVIEW",
      "packages/core/src/markdown.ts:final current-goal and explicit learner confirmation",
      "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자의 마지막 현재 목표 확인입니다",
      "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자의 마지막 현재 학습 목표 확인과 명시 확인입니다"
    ]
  }),
  check("study readme source cleanup token source-link confirmation boundary", [
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:final explicit confirmation that source links no longer need to open",
    "packages/core/src/pipeline.test.ts:Treat the token as the learner's final explicit confirmation that source links no longer need to open",
    "packages/core/src/pipeline.test.ts:not.toContain(\"Treat the token as the learner's final current-goal and explicit learner confirmation\")",
    "study readme source cleanup token source-link confirmation boundary",
    "--iterations 426"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:final current-goal and explicit learner confirmation",
      "packages/core/src/pipeline.test.ts:expect(normalizedStudyReadme).toContain(\"Treat the token as the learner's final current-goal and explicit learner confirmation\")"
    ]
  }),
  check("mission source cleanup token source-link confirmation boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인입니다",
    "packages/core/src/pipeline.test.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인입니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자의 마지막 현재 학습 목표 확인과 명시 확인입니다\")",
    "mission source cleanup token source-link confirmation boundary",
    "--iterations 425"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자의 마지막 현재 학습 목표 확인과 명시 확인입니다",
      "packages/core/src/pipeline.test.ts:expect(missionText).toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자의 마지막 현재 학습 목표 확인과 명시 확인입니다\")"
    ]
  }),
  check("source retention ledger confirmation token parity", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:<code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다. 실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록 확인 뒤",
    "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아니며 DELETE-SOURCE-SNAPSHOT 확인 토큰은 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인이라는 경계도 확인해줘",
    "packages/core/src/pipeline.test.ts:<code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라",
    "packages/core/src/pipeline.test.ts:실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록 확인 뒤",
    "packages/core/src/pipeline.test.ts:not.toContain(\"실제 적용은 보존 증거 묶음 확인 뒤\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰으로 마지막 현재 목표 확인\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰은 학습자의 마지막 현재 목표 확인이라는 경계도 확인해줘\")",
    "packages/core/src/pipeline.test.ts:`DELETE-SOURCE-SNAPSHOT` 확인 토큰을 입력한 경우에만 검토합니다",
    "source retention ledger confirmation token parity",
    "source absorption ledger cleanup apply verification record boundary",
    "--iterations 405"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:실제 적용은 보존 증거 묶음 확인 뒤",
      "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰으로 마지막 현재 목표 확인",
      "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 학습자의 마지막 현재 목표 확인이라는 경계도 확인해줘",
      "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toContain(\"실제 적용은 보존 증거 묶음 확인 뒤\")"
    ]
  }),
  check("source retention guide prompt source-link confirmation boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인이라는 경계도 확인해줘",
    "packages/core/src/pipeline.test.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인이라는 경계도 확인해줘",
    "packages/core/src/pipeline.test.ts:not.toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰은 학습자의 마지막 현재 학습 목표 확인과 명시 확인이라는 경계도 확인해줘\")",
    "source retention guide prompt source-link confirmation boundary",
    "--iterations 424"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰은 학습자의 마지막 현재 학습 목표 확인과 명시 확인이라는 경계도 확인해줘",
      "packages/core/src/pipeline.test.ts:expect(retentionGuideText).toContain(\"READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아니며 DELETE-SOURCE-SNAPSHOT 확인 토큰은 학습자의 마지막 현재 학습 목표 확인과 명시 확인이라는 경계도 확인해줘\")"
    ]
  }),
  check("source absorption ledger token source-link confirmation boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인",
    "packages/core/src/teaching-workspace.ts:<code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인",
    "packages/core/src/teaching-workspace.ts:\\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인",
    "packages/core/src/pipeline.test.ts:DELETE-SOURCE-SNAPSHOT</code> 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인",
    "packages/core/src/pipeline.test.ts:`DELETE-SOURCE-SNAPSHOT` 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인",
    "packages/core/src/pipeline.test.ts:not.toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰으로 마지막 현재 학습 목표 확인과 학습자 명시 확인을 남긴 경우에만\")",
    "source absorption ledger token source-link confirmation boundary",
    "--iterations 423"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰으로 마지막 현재 학습 목표 확인과 학습자 명시 확인",
      "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰으로 마지막 현재 학습 목표 확인과 학습자 명시 확인",
      "packages/core/src/pipeline.test.ts:expect(absorptionMarkdown).toContain(\"DELETE-SOURCE-SNAPSHOT 확인 토큰으로 마지막 현재 학습 목표 확인과 학습자 명시 확인"
    ]
  }),
  check("teaching workspace source retention guardrail cleanup review wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:생성된 세션 \\`source/\\` 스냅샷 정리 검토 여부는 reference/source-retention-guide.html의 retained artifact, verification checkpoint, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/teaching-workspace.ts:이 lesson 통과만으로 생성된 세션 <code>source/</code> 스냅샷 정리를 결정하지 않고, source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/teaching-workspace.ts:통과해도 생성된 세션 \\`source/\\` 스냅샷 정리 검토는 source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/teaching-workspace.ts:이 기록만으로 생성된 세션 \\`source/\\` 스냅샷 정리를 결정하지 않고, source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "packages/core/src/teaching-workspace.ts:source-retention-guide.html: 생성된 세션 `source/` 스냅샷 정리 검토 전",
    "packages/core/src/teaching-workspace.ts:생성된 세션 `source/` 스냅샷은 정리 검토 후보일 뿐",
    "packages/core/src/teaching-workspace.ts:아직 확인할 항목이 있으므로 생성된 세션 `source/` 스냅샷을 보존",
    "packages/core/src/teaching-workspace.ts:생성된 세션 <code>source/</code> 스냅샷은 evidence 링크 검증에 쓰입니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"source snapshot 삭제 여부는 reference/source-retention-guide.html\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"이 lesson 통과만으로 source/를 삭제하지 않고\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"통과해도 원본 source/ 정리 판단은\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"이 기록만으로 source/ 정리를 결정하지 않고\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"source snapshot은\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"source snapshot을\")",
    "teaching workspace source retention guardrail cleanup review wording",
    "--iterations 401"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:생성된 세션 \\`source/\\` 스냅샷 정리 검토 여부는 reference/source-retention-guide.html의 retained artifact, verification checkpoint, 현재 학습 목표를 먼저 확인한 뒤 판단합니다",
      "packages/core/src/teaching-workspace.ts:source-retention-guide, 현재 학습 목표를 함께 확인합니다",
      "packages/core/src/teaching-workspace.ts:source-retention-guide, 현재 학습 목표 확인 뒤 별도로 판단합니다",
      "packages/core/src/teaching-workspace.ts:source snapshot 삭제 여부는",
      "packages/core/src/teaching-workspace.ts:이 lesson 통과만으로 source/를 삭제하지 않고",
      "packages/core/src/teaching-workspace.ts:통과해도 원본 source/ 정리 판단",
      "packages/core/src/teaching-workspace.ts:통과해도 생성된 세션 \\`source/\\` 스냅샷 정리 검토는 source-absorption-ledger, session-verification, source-retention-guide, 현재 학습 목표",
      "packages/core/src/teaching-workspace.ts:이 기록만으로 source/ 정리를 결정하지 않고",
      "packages/core/src/teaching-workspace.ts:원본 source/ 보존 여부",
      "packages/core/src/teaching-workspace.ts:원본 source/ 정리 전",
      "packages/core/src/teaching-workspace.ts:source snapshot은",
      "packages/core/src/teaching-workspace.ts:source snapshot을 보존",
      "packages/core/src/teaching-workspace.ts:원본 source/를 장기 지식으로 보관",
      "packages/core/src/teaching-workspace.ts:원본 링크 검증이 더 필요 없는"
    ]
  }),
  check("improvement backlog markdown request candidate wording", [
    "packages/html/src/templates.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["high 항목부터 작은 vertical slice 요청 후보로 다듬", "요청 후보에는 목적, 사용자 흐름, 아키텍처 역할, 산출물, 검증 기준", "오래된 생성 세션 source/ 스냅샷을 정리하거나 축약할지 검토하기 전에", "생성된 세션 `source/` 스냅샷은 장기 앱 지식이 아니지만, 보존 증거와 검증 기록 없이 요약만 남기면 재검증이 어려워집니다", "not.toContain(\"원본 전체를 오래 내장할 필요는 없지만\")", "not.toContain(\"오래된 source snapshot을 삭제하거나 축약하기 전에\")", "not.toContain(\"high 항목부터 AI에게 작은 vertical slice로 요청하세요\")", "not.toContain(\"요청에는 목적, 사용자 흐름, 아키텍처 역할, 산출물, 검증 기준을 같이 넣으세요\")", "improvement backlog markdown request candidate wording", "improvement backlog source cleanup review wording", "improvement backlog source retention why generated session boundary", "--iterations 391"], {
    forbidden: [
      "packages/core/src/markdown.ts:high 항목부터 AI에게 작은 vertical slice로 요청하세요",
      "packages/core/src/markdown.ts:요청에는 목적, 사용자 흐름, 아키텍처 역할, 산출물, 검증 기준을 같이 넣으세요",
      "packages/core/src/markdown.ts:원본 전체를 오래 내장할 필요는 없지만",
      "packages/html/src/templates.ts:원본 전체를 오래 내장할 필요는 없지만",
      "packages/core/src/markdown.ts:오래된 source snapshot을 삭제하거나 축약하기 전에",
      "packages/html/src/templates.ts:오래된 source snapshot을 삭제하거나 축약하기 전에"
    ]
  }),
  check("architecture ai prompt brief request candidate wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 요청 후보", "보내기 전 소스 근거, 제외 범위, 수락 기준, 검증 질문을 내 목표에 맞게 다듬습니다", "not.toContain(\"가장 작은 vertical slice부터 구현해줘\\\\\\\"라고 지시하세요\")", "architecture ai prompt brief request candidate wording"], {
    forbidden: [
      "packages/core/src/scanner.ts:가장 작은 vertical slice부터 구현해줘\"라고 지시하세요"
    ]
  }),
  check("daily summary term prompt explanation candidate wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 설명 요청 후보", "보내기 전 소스 근거와 내 목표에 맞게 다듬으세요", "not.toContain(\"맥락으로 설명하라고 지시하세요\")", "daily summary term prompt explanation candidate wording"], {
    forbidden: [
      "packages/core/src/scanner.ts:맥락으로 설명하라고 지시하세요"
    ]
  }),
  check("file ai prompt brief request candidate wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["파일 구현 요청 후보", "AI에게 보낼 문장으로 다듬으세요", "not.toContain(\"비슷한 파일을 만들게 할 때는\")", "file ai prompt brief request candidate wording"], {
    forbidden: [
      "packages/core/src/scanner.ts:비슷한 파일을 만들게 할 때는"
    ]
  }),
  check("folder ai implementation brief request candidate wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["폴더 재구현 요청 후보", "AI에게 보낼 문장으로 다듬으세요", "not.toContain(\"폴더를 다시 만들라고 요청할 때는\")", "folder ai implementation brief request candidate wording"], {
    forbidden: [
      "packages/core/src/scanner.ts:폴더를 다시 만들라고 요청할 때는"
    ]
  }),
  check("folder vibe prompts request candidate wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["폴더 이해 요청 후보", "폴더 경계 요청 후보", "폴더 vertical slice 요청 후보", "not.toContain(\"구현 지시 프롬프트를 만들어줘\")", "folder vibe prompts request candidate wording"], {
    forbidden: [
      "packages/core/src/scanner.ts:구현 지시 프롬프트를 만들어줘"
    ]
  }),
  check("file vibe prompts request candidate wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["파일 이해 요청 후보", "파일 구현 요청 후보", "파일 검증 요청 후보", "not.toContain(\"구현시키는 프롬프트를\")", "file vibe prompts request candidate wording"], {
    forbidden: [
      "packages/core/src/scanner.ts:구현시키는 프롬프트를"
    ]
  }),
  check("architecture principle request candidate wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 요청 후보", "아키텍처 요청 후보", "not.toContain(\"AI에게 이렇게 지시\")", "architecture principle request candidate wording"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:AI에게 이렇게 지시"
    ]
  }),
  check("similar app transfer request candidate wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 전이 요청 후보", "전이 요청 후보", "한 문장 목적은 검토 기준으로 먼저 고정합니다", "not.toContain(\"AI에게 물을 질문\")", "not.toContain(\"AI 구현 프롬프트 문장으로 바꿔줘\")", "similar app transfer request candidate wording", "--iterations 252"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:한 문장 목적은 먼저 확정합니다",
      "packages/core/src/teaching-workspace.ts:AI에게 물을 질문",
      "packages/core/src/teaching-workspace.ts:AI 구현 프롬프트 문장으로 바꿔줘"
    ]
  }),
  check("teaching workspace role prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 역할 프롬프트", "not.toContain(\"복사용 역할 프롬프트\")", "teaching workspace role prompt review heading"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:복사용 역할 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(learnerRoleHtml).toContain(\"복사용 역할 프롬프트\")"
    ]
  }),
  check("teaching workspace review prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 리뷰 프롬프트", "not.toContain(\"복사용 리뷰 프롬프트\")", "teaching workspace review prompt review heading"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:복사용 리뷰 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(aiOutputReviewHtml).toContain(\"복사용 리뷰 프롬프트\")"
    ]
  }),
  check("ai output review pass review-state gate", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["PASS_REVIEW / REVISE / BLOCK", "PASS_REVIEW, REVISE, BLOCK 검토 상태", "리뷰 검토 상태", "not.toContain(\"리뷰 판정\")", "최종 ACCEPT 여부 검토는 학습자에게 남깁니다", "최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라", "통과 후보·수정·차단 상태", "ai output review pass review-state gate", "--iterations 219"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:리뷰 판정",
      "packages/core/src/teaching-workspace.ts:<strong>PASS:</strong>",
      "packages/core/src/teaching-workspace.ts:- PASS: ${row.pass}",
      "packages/core/src/teaching-workspace.ts:PASS / REVISE / BLOCK으로 나눠줘",
      "packages/core/src/teaching-workspace.ts:- PASS: 목적과 구조가 맞고 검증 기준이 분리되었습니다.",
      "packages/core/src/markdown.ts:PASS, REVISE, BLOCK 판정 후보를 만듭니다",
      "packages/core/src/markdown.ts:PASS / REVISE / BLOCK 기준으로 AI 산출물을 검토한다",
      "packages/html/src/templates.ts:PASS/REVISE/BLOCK 판정 후보로 확인합니다",
      "packages/html/src/templates.ts:PASS, REVISE, BLOCK 판정 후보를 만듭니다",
      "packages/html/src/templates.ts:PASS / REVISE / BLOCK 기준으로 AI 산출물을 검토한다"
    ]
  }),
  check("ai output review human final accept boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:최종 ACCEPT 여부 검토는 학습자에게 남깁니다",
    "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:최종 ACCEPT 여부 검토는 학습자에게 남깁니다",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"최종 통과 여부 검토\")",
    "ai output review human final accept boundary",
    "--iterations 358"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:최종 통과 여부 검토",
      "packages/core/src/pipeline.test.ts:expect(aiOutputReviewHtml).toContain(\"최종 통과 여부 검토\")",
      "packages/core/src/pipeline.test.ts:expect(aiOutputReviewMarkdown).toContain(\"최종 통과 여부 검토\")"
    ]
  }),
  check("ai output review status evidence candidate boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
    "ai output review status evidence candidate boundary",
    "--iterations 360"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/pipeline.test.ts:expect(aiOutputReviewHtml).toContain(\"목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
      "packages/core/src/pipeline.test.ts:expect(aiOutputReviewMarkdown).toContain(\"목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")"
    ]
  }),
  check("ai output review block acceptance verification wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검증 기록 없이 수락을 요구하거나 실패 시 보고 형식이 없습니다", "not.toContain(\"테스트나 실행 없이 완료를 단정하거나 실패 시 보고 형식이 없습니다\")", "ai output review block acceptance verification wording", "--iterations 265"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:테스트나 실행 없이 완료를 단정하거나 실패 시 보고 형식이 없습니다",
      "packages/core/src/pipeline.test.ts:expect(aiOutputReviewHtml).toContain(\"테스트나 실행 없이 완료를 단정하거나 실패 시 보고 형식이 없습니다\")",
      "packages/core/src/pipeline.test.ts:expect(aiOutputReviewMarkdown).toContain(\"테스트나 실행 없이 완료를 단정하거나 실패 시 보고 형식이 없습니다\")"
    ]
  }),
  check("teaching workspace self evaluation prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["준비도 검토표", "검토 후 다듬을 자기평가 프롬프트", "요청 후보를 검토 후 다듬을 수 있습니다", "수락 기준을 포함한 요청 후보", "PASS_REVIEW / REVISE / BLOCK 검토 상태 후보를 만들 수 있습니다", "PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보로만 표시해줘", "READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘", "검토 질문에 답하고 근거를 보강해야 진행 후보가 됩니다", "학습자가 검토 후 답해야 할 다음 질문 3개", "not.toContain(\"복사용 자기평가 프롬프트\")", "not.toContain(\"목적, 입력 근거, 산출물, 완료 기준을 포함한 요청 후보\")", "not.toContain(\"PASS/REVISE/BLOCK 판정 후보를 만들 수 있습니다\")", "not.toContain(\"AI 결과를 PASS/REVISE/BLOCK으로 판정할 수 있습니다\")", "not.toContain(\"한 번 더 요약하거나 질문하면 진행할 수 있습니다\")", "not.toContain(\"부족한 항목은 바로 다음 질문 3개\")", "not.toContain(\"<h2>판정표</h2>\")", "teaching workspace self evaluation prompt review heading", "--iterations 228"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<h2>판정표</h2>",
      "packages/core/src/teaching-workspace.ts:목적, 입력 근거, 산출물, 완료 기준을 포함한 요청 후보",
      "packages/core/src/teaching-workspace.ts:PASS/REVISE/BLOCK 판정 후보를 만들 수 있습니다",
      "packages/core/src/teaching-workspace.ts:PASS/REVISE/BLOCK 판정해줘",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"<h2>판정표</h2>\")",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"PASS/REVISE/BLOCK 판정 후보를 만들 수 있습니다\")",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistMarkdown).toContain(\"PASS/REVISE/BLOCK 판정 후보를 만들 수 있습니다\")",
      "packages/core/src/teaching-workspace.ts:목적, 입력 근거, 산출물, 완료 기준을 함께 요청할 수 있습니다",
      "packages/core/src/teaching-workspace.ts:AI 결과를 PASS/REVISE/BLOCK으로 판정할 수 있습니다",
      "packages/core/src/teaching-workspace.ts:복사용 자기평가 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"복사용 자기평가 프롬프트\")",
      "packages/core/src/teaching-workspace.ts:한 번 더 요약하거나 질문하면 진행할 수 있습니다",
      "packages/core/src/teaching-workspace.ts:부족한 항목은 바로 다음 질문 3개"
    ]
  }),
  check("mastery checklist ready review evidence boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태입니다",
    "packages/core/src/pipeline.test.ts:학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘",
    "packages/core/src/pipeline.test.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태입니다",
    "mastery checklist ready review evidence boundary",
    "--iterations 362"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:근거가 충분해 다음 AI 요청 후보를 검토할 수 있는 상태이며, 전송/최종 ACCEPT/배포/삭제 허가가 아닙니다",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자 검토 상태로만 표시해줘",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거를 검토할 상태입니다",
      "packages/core/src/teaching-workspace.ts:학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태로만 표시해줘",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태입니다",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"전송/최종 ACCEPT/배포/삭제 허가가 아닙니다\")",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자 검토 상태로만 표시해줘\")",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistMarkdown).toContain(\"READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거를 검토할 상태입니다\")"
    ]
  }),
  check("start page mastery ready review evidence boundary", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/html/src/templates.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "start page mastery ready review evidence boundary",
    "--iterations 363"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자 검토 상태입니다",
      "packages/html/src/templates.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자 검토 상태입니다",
      "packages/core/src/pipeline.test.ts:expect(vibeStartHtml).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자 검토 상태입니다\")",
      "packages/core/src/pipeline.test.ts:expect(vibeStartMarkdown).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자 검토 상태입니다\")"
    ]
  }),
  check("start page prompt readiness ready review evidence boundary", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/html/src/templates.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "start page prompt readiness ready review evidence boundary",
    "--iterations 364"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/html/src/templates.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/core/src/pipeline.test.ts:expect(vibeStartHtml).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 보내기 전 학습자 검토 상태입니다\")",
      "packages/core/src/pipeline.test.ts:expect(vibeStartMarkdown).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 보내기 전 학습자 검토 상태입니다\")",
      "packages/core/src/markdown.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/html/src/templates.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/pipeline.test.ts:expect(vibeStartHtml).toContain(\"READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")"
    ]
  }),
  check("prompt readiness reference ready review evidence boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "prompt readiness reference ready review evidence boundary",
    "--iterations 365"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 보내기 전 학습자 검토 상태입니다\")",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessMarkdown).toContain(\"READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 보내기 전 학습자 검토 상태입니다\")",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")"
    ]
  }),
  check("prompt ab lab ready review evidence record boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:READY_REVIEW도 내 제품 목적, source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트, 검증 기록 보고 형식을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 내 제품 목적, source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트, 검증 기록 보고 형식을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "prompt ab lab ready review evidence record boundary",
    "--iterations 366"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니며",
      "packages/core/src/teaching-workspace.ts:source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트가 맞는지 확인한 뒤 전송 후보로 둡니다",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니며\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니며\")"
    ]
  }),
  check("learner goal accept review evidence record boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:ACCEPT_REVIEW는 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence, 검증 기준, 검증 기록을 학습자가 다시 확인할 목표 정렬 후보입니다",
    "packages/core/src/teaching-workspace.ts:ACCEPT_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 source evidence, 검증 기준, 검증 기록을 확인할 목표 정렬 후보로만 표시해줘",
    "packages/core/src/pipeline.test.ts:source evidence, 검증 기준, 검증 기록을 학습자가 다시 확인할 목표 정렬 후보입니다",
    "packages/core/src/pipeline.test.ts:학습자가 source evidence, 검증 기준, 검증 기록을 확인할 목표 정렬 후보로만 표시해줘",
    "learner goal accept review evidence record boundary",
    "--iterations 367"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:source evidence와 검증 기준을 학습자가 다시 확인할 목표 정렬 후보",
      "packages/core/src/teaching-workspace.ts:학습자가 source evidence와 검증 기준을 확인할 목표 정렬 후보로만 표시해줘",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentHtml).toContain(\"source evidence와 검증 기준을 학습자가 다시 확인할 목표 정렬 후보",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentMarkdown).toContain(\"source evidence와 검증 기준을 학습자가 다시 확인할 목표 정렬 후보",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentHtml).toContain(\"학습자가 source evidence와 검증 기준을 확인할 목표 정렬 후보로만 표시해줘\")",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentMarkdown).toContain(\"학습자가 source evidence와 검증 기준을 확인할 목표 정렬 후보로만 표시해줘\")"
    ]
  }),
  check("implementation loop request candidate evidence record boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:이 후보는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록을 학습자가 확인할 구현 루프 요청 후보입니다",
    "packages/core/src/pipeline.test.ts:이 후보는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록을 학습자가 확인할 구현 루프 요청 후보입니다",
    "implementation loop request candidate evidence record boundary",
    "--iterations 368"
  ]),
  check("start page mastery ready review evidence record boundary", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/html/src/templates.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "start page mastery ready review evidence record boundary",
    "--iterations 369"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:READY_REVIEW도 학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/html/src/templates.ts:READY_REVIEW도 학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/pipeline.test.ts:expect(vibeStartHtml).toContain(\"READY_REVIEW도 학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
      "packages/core/src/pipeline.test.ts:expect(vibeStartMarkdown).toContain(\"READY_REVIEW도 학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")"
    ]
  }),
  check("start page source retention cleanup evidence record boundary", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰이 준비된 뒤에만 생성된 세션 \\`source/\\` 스냅샷 정리 검토 여부를 판단합니다",
    "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 준비된 뒤에만 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다",
    "packages/core/src/markdown.ts:정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, \\`DELETE-SOURCE-SNAPSHOT\\` 확인 토큰을 함께 봅니다",
    "packages/html/src/templates.ts:정리 전에는 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 봅니다",
    "packages/core/src/pipeline.test.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인",
    "packages/core/src/pipeline.test.ts:세션 검증과 검증 기록",
    "packages/core/src/pipeline.test.ts:DELETE-SOURCE-SNAPSHOT 확인 토큰",
    "start page source retention cleanup evidence record boundary",
    "--iterations 400"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표가 남았는지 확인한 뒤",
      "packages/html/src/templates.ts:보존 증거, daily summary, prompt pack, 세션 검증, 검증 기록, 현재 학습 목표가 남았는지 확인한 뒤",
      "packages/core/src/markdown.ts:정리 전에 네 가지를 확인합니다:",
      "packages/html/src/templates.ts:정리 전에 흡수한 기능 기록, 세션 검증과 검증 기록, 보존/정리 판단 가이드의 READY_REVIEW, 현재 학습 목표 확인을 함께 봅니다",
      "packages/core/src/markdown.ts:evidence, daily summary, prompt pack, verification이 남았는지 확인한 뒤 생성된 세션 \\`source/\\` 스냅샷 정리 검토 여부를 판단합니다",
      "packages/html/src/templates.ts:evidence, daily summary, prompt pack, verification이 남았는지 확인한 뒤 생성된 세션 <code>source/</code> 스냅샷 정리 검토 여부를 판단합니다",
      "packages/html/src/templates.ts:정리 전에 흡수한 기능 기록, 세션 검증, 보존/정리 판단 가이드가 READY_REVIEW인지 확인합니다"
    ]
  }),
  check("mastery checklist ready review evidence record boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태입니다",
    "packages/core/src/pipeline.test.ts:학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘",
    "packages/core/src/pipeline.test.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태입니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태로만 표시해줘\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태입니다\")",
    "mastery checklist ready review evidence record boundary",
    "--iterations 371"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태로만 표시해줘",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태입니다",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"학습자가 근거와 검증 기준을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistHtml).toContain(\"READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태로만 표시해줘\")",
      "packages/core/src/pipeline.test.ts:expect(masteryChecklistMarkdown).toContain(\"READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기준을 확인할 후보 상태입니다\")"
    ]
  }),
  check("prompt readiness ready review evidence record reporting boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/teaching-workspace.ts:acceptance criteria, verification assertion, 검증 기록 보고 형식이 없으면 READY_REVIEW 검토 상태를 유보합니다",
    "packages/core/src/teaching-workspace.ts:verification assertion, 검증 기록 보고 형식을 전송 전 직접 확인해야 합니다",
    "packages/core/src/markdown.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/html/src/templates.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:not.toContain(\"READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
    "packages/core/src/pipeline.test.ts:not.toContain(\"verification assertion을 전송 전 직접 확인해야 합니다\")",
    "prompt readiness ready review evidence record reporting boundary",
    "--iterations 372"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/teaching-workspace.ts:acceptance criteria와 verification assertion이 없으면 READY_REVIEW 검토 상태를 유보합니다",
      "packages/core/src/teaching-workspace.ts:verification assertion을 전송 전 직접 확인해야 합니다",
      "packages/core/src/markdown.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/html/src/templates.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다\")",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"verification assertion을 전송 전 직접 확인해야 합니다\")"
    ]
  }),
  check("learner acceptance verification wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["수락/검증 기준을 먼저 분리해줘", "맥락이나 수락/검증 기준을 보강해야 합니다", "수락/검증 질문", "무엇을, 누구를 위해, 왜 만들고, 수락/검증 기준이 무엇인지", "기능을 수락할 수 있는 관찰 가능한 조건입니다", "VERIFY는 수락/검증 기준으로 씁니다", "학습자가 수락/검증할 관찰 기준", "수락/검증 기준이 관찰 가능하지 않습니다", "not.toContain(\"완료 기준을 먼저 분리해줘\")", "not.toContain(\"완료 검증 질문\")", "not.toContain(\"기능이 끝났다고 판단할 수 있는 관찰 가능한 조건입니다\")", "learner acceptance verification wording", "--iterations 261"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:완료 기준을 먼저 분리해줘",
      "packages/core/src/teaching-workspace.ts:맥락이나 완료 기준을 보강해야 합니다",
      "packages/core/src/teaching-workspace.ts:AI가 끝났다고 주장할 기준이 있는지 확인합니다",
      "packages/core/src/teaching-workspace.ts:VERIFY는 완료 기준으로 씁니다",
      "packages/core/src/teaching-workspace.ts:완료 기준이 관찰 가능하지 않습니다",
      "packages/core/src/scanner.ts:완료 검증 질문",
      "packages/core/src/scanner.ts:완료 기준이 무엇인지",
      "packages/core/src/scanner.ts:기능이 끝났다고 판단할 수 있는 관찰 가능한 조건입니다",
      "packages/core/src/scanner.ts:TDD나 acceptance criteria 없이 완료됐다고 믿기",
      "packages/core/src/pipeline.test.ts:expect(learnerRoleHtml).toContain(\"완료 기준을 먼저 분리해줘\")",
      "packages/core/src/pipeline.test.ts:expect(folderLessonsText).toContain(\"완료 검증 질문\")",
      "packages/core/src/pipeline.test.ts:expect(glossaryText).toContain(\"기능이 끝났다고 판단할 수 있는 관찰 가능한 조건입니다\")"
    ]
  }),
  check("teaching workspace architecture prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 아키텍처 설명 프롬프트", "PASS_REVIEW / REVISE / BLOCK 검토 상태 후보를 만들 수 없는 항목", "PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다", "not.toContain(\"PASS/REVISE/BLOCK 판정 후보를 만들 수 없는 항목\")", "not.toContain(\"PASS/REVISE/BLOCK으로 판정할 수 없는 항목\")", "not.toContain(\"복사용 아키텍처 설명 프롬프트\")", "teaching workspace architecture prompt review heading", "--iterations 206"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:PASS/REVISE/BLOCK 판정 후보를 만들 수 없는 항목",
      "packages/core/src/pipeline.test.ts:expect(architecturePrincipleHtml).toContain(\"PASS/REVISE/BLOCK 판정 후보를 만들 수 없는 항목\")",
      "packages/core/src/pipeline.test.ts:expect(architecturePrincipleMarkdown).toContain(\"PASS/REVISE/BLOCK 판정 후보를 만들 수 없는 항목\")",
      "packages/core/src/teaching-workspace.ts:PASS/REVISE/BLOCK으로 판정할 수 없는 항목",
      "packages/core/src/teaching-workspace.ts:복사용 아키텍처 설명 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(architecturePrincipleHtml).toContain(\"복사용 아키텍처 설명 프롬프트\")"
    ]
  }),
  check("teaching workspace interview prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 기준", "검토 후 다듬을 인터뷰 프롬프트", "not.toContain(\"<h2>판정 기준</h2>\")", "not.toContain(\"복사용 인터뷰 프롬프트\")", "teaching workspace interview prompt review heading", "--iterations 224"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:복사용 인터뷰 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(sourceToBuildInterviewHtml).toContain(\"<h2>판정 기준</h2>\")",
      "packages/core/src/pipeline.test.ts:expect(sourceToBuildInterviewHtml).toContain(\"복사용 인터뷰 프롬프트\")"
    ]
  }),
  check("teaching workspace transfer prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["전이 검토", "검토 후 다듬을 전이 프롬프트", "PASS_REVIEW / REVISE / BLOCK 검토 상태 표", "PASS_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록 확인 후보로 표시해줘", "not.toContain(\"<h2>전이 판정</h2>\")", "not.toContain(\"PASS/REVISE/BLOCK 표\")", "not.toContain(\"복사용 전이 프롬프트\")", "teaching workspace transfer prompt review heading", "--iterations 225"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<h2>전이 판정</h2>",
      "packages/core/src/pipeline.test.ts:expect(similarAppTransferHtml).toContain(\"<h2>전이 판정</h2>\")",
      "packages/core/src/teaching-workspace.ts:PASS/REVISE/BLOCK 표",
      "packages/core/src/pipeline.test.ts:expect(similarAppTransferHtml).toContain(\"PASS/REVISE/BLOCK 표\")",
      "packages/core/src/pipeline.test.ts:expect(similarAppTransferMarkdown).toContain(\"PASS/REVISE/BLOCK 표\")",
      "packages/core/src/teaching-workspace.ts:복사용 전이 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(similarAppTransferHtml).toContain(\"복사용 전이 프롬프트\")"
    ]
  }),
  check("rebuild roadmap acceptance verification heading", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["### 수락/검증 기준", "<h4>수락/검증 기준</h4>", "not.toContain(\"### 완료 기준\")", "not.toContain(\"<h4>완료 기준</h4>\")", "rebuild roadmap acceptance verification heading", "--iterations 208"], {
    forbidden: [
      "packages/core/src/markdown.ts:### 완료 기준",
      "packages/html/src/templates.ts:<h4>완료 기준</h4>",
      "packages/core/src/pipeline.test.ts:expect(rebuildMarkdown).toContain(\"### 완료 기준\")",
      "packages/core/src/pipeline.test.ts:expect(rebuildHtml).toContain(\"<h4>완료 기준</h4>\")"
    ]
  }),
  check("teaching workspace goal alignment prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 기준", "검토 후 다듬을 목표 정렬 프롬프트", "not.toContain(\"<h2>판정 기준</h2>\")", "not.toContain(\"## 판정 기준\")", "not.toContain(\"복사용 목표 정렬 프롬프트\")", "teaching workspace goal alignment prompt review heading", "--iterations 226"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<h2>판정 기준</h2>",
      "packages/core/src/teaching-workspace.ts:## 판정 기준",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentHtml).toContain(\"<h2>판정 기준</h2>\")",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentMarkdown).toContain(\"## 판정 기준\")",
      "packages/core/src/teaching-workspace.ts:복사용 목표 정렬 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentHtml).toContain(\"복사용 목표 정렬 프롬프트\")"
    ]
  }),
  check("learner goal alignment accept review-state gate", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["ACCEPT_REVIEW / CLARIFY / REWRITE / BLOCK", "ACCEPT_REVIEW는 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라", "ACCEPT_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라", "source evidence, 검증 기준, 검증 기록을 학습자가 다시 확인할 목표 정렬 후보", "learner goal alignment accept review-state gate", "--iterations 199"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:ACCEPT / CLARIFY / REWRITE / BLOCK",
      "packages/core/src/teaching-workspace.ts:return patterns.some((pattern) => pattern.test(text)) ? \"ACCEPT\" : missingStatus",
      "packages/core/src/teaching-workspace.ts:status: \"ACCEPT\" | \"CLARIFY\" | \"REWRITE\" | \"BLOCK\"",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentHtml).toContain(\"ACCEPT / CLARIFY / REWRITE / BLOCK\")",
      "packages/core/src/pipeline.test.ts:expect(learnerGoalAlignmentMarkdown).toContain(\"ACCEPT / CLARIFY / REWRITE / BLOCK\")"
    ]
  }),
  check("teaching workspace implementation loop prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 구현 루프 프롬프트", "not.toContain(\"복사용 구현 루프 프롬프트\")", "teaching workspace implementation loop prompt review heading"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:복사용 구현 루프 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(aiImplementationLoopHtml).toContain(\"복사용 구현 루프 프롬프트\")"
    ]
  }),
  check("teaching workspace implementation loop next question request candidate wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 다음 질문 후보", "구현 루프 요청 후보", "not.toContain(\"<strong>다음 질문:</strong>\")", "not.toContain(\"- 다음 질문:\")", "teaching workspace implementation loop next question request candidate wording"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<strong>다음 질문:</strong>",
      "packages/core/src/teaching-workspace.ts:- 다음 질문:",
      "packages/core/src/pipeline.test.ts:expect(aiImplementationLoopHtml).toContain(\"<strong>다음 질문:</strong>\")",
      "packages/core/src/pipeline.test.ts:expect(aiImplementationLoopMarkdown).toContain(\"- 다음 질문:\")"
    ]
  }),
  check("implementation loop pass review-state gate", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["PASS_REVIEW / REVISE / BLOCK", "검토 상태를 정한 뒤 다음 AI 질문 후보", "PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라", "실행하지 않은 검증을 PASS_REVIEW로 두지 말고", "implementation loop pass review-state gate", "--iterations 200"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:PASS / REVISE / BLOCK 표로 정리해줘",
      "packages/core/src/teaching-workspace.ts:PASS / REVISE / BLOCK 중 하나로 판정",
      "packages/core/src/teaching-workspace.ts:완료 판정 뒤 다음 AI 질문 후보",
      "packages/core/src/pipeline.test.ts:expect(aiImplementationLoopHtml).toContain(\"PASS / REVISE / BLOCK\")",
      "packages/core/src/pipeline.test.ts:expect(aiImplementationLoopMarkdown).toContain(\"PASS / REVISE / BLOCK\")"
    ]
  }),
  check("teaching workspace prompt readiness request review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 프롬프트 평가 요청", "학습자가 검토 후 다듬어 보낼 개선 프롬프트", "not.toContain(\"복사용 프롬프트 평가 요청\")", "not.toContain(\"바로 보낼 수 있는 개선 프롬프트\")", "teaching workspace prompt readiness request review heading"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:복사용 프롬프트 평가 요청",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"복사용 프롬프트 평가 요청\")",
      "packages/core/src/teaching-workspace.ts:바로 보낼 수 있는 개선 프롬프트"
    ]
  }),
  check("teaching workspace prompt readiness check request candidate wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 점검 요청 후보", "프롬프트 점검 요청 후보", "not.toContain(\"- Prompt check:\")", "teaching workspace prompt readiness check request candidate wording"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:- Prompt check:",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessMarkdown).toContain(\"- Prompt check:\")"
    ]
  }),
  check("teaching workspace prompt ab lab review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 A/B 평가 프롬프트", "학습자가 검토 후 다듬어 보낼 개선 프롬프트", "not.toContain(\"복사용 A/B 평가 프롬프트\")", "not.toContain(\"바로 보낼 수 있는 개선 프롬프트\")", "teaching workspace prompt ab lab review heading"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:복사용 A/B 평가 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"복사용 A/B 평가 프롬프트\")",
      "packages/core/src/teaching-workspace.ts:바로 보낼 수 있는 개선 프롬프트"
    ]
  }),
  check("teaching workspace prompt ab lab prompt b candidate wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 프롬프트 B 후보", "프롬프트 B 후보는 READY_REVIEW 검토 후보입니다", "READY_REVIEW도 내 제품 목적, source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트, 검증 기록 보고 형식을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "관찰 가능한 assertion", "source-grounded 구현 요청 후보", "시작 작업 후보", "not.toContain(\"<strong>프롬프트 B:</strong>\")", "not.toContain(\"- 프롬프트 B:\")", "teaching workspace prompt ab lab prompt b candidate wording", "--iterations 204"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<strong>프롬프트 B:</strong>",
      "packages/core/src/teaching-workspace.ts:- 프롬프트 B:",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"<strong>프롬프트 B:</strong>\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"- 프롬프트 B:\")",
      "packages/core/src/teaching-workspace.ts:프롬프트 B 후보는 READY 검토 후보입니다",
      "packages/core/src/teaching-workspace.ts:PASS/FAIL assertion",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"프롬프트 B 후보는 READY 검토 후보입니다\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"프롬프트 B 후보는 READY 검토 후보입니다\")"
    ]
  }),
  check("teaching workspace prompt review action verbs", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["첫 구현 프롬프트를 검토하고 본인 말로 줄입니다", "AI에게 확인시킬 질문을 검토해 본인 말로 바꿉니다", "not.toContain(\"Prompt Pack</a>에서 첫 구현 프롬프트를 복사해 본인 말로 줄입니다.\")", "not.toContain(\"AI에게 확인시킬 질문을 복사합니다\")", "teaching workspace prompt review action verbs"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:Prompt Pack</a>에서 첫 구현 프롬프트를 복사해 본인 말로 줄입니다.",
      "packages/core/src/teaching-workspace.ts:AI에게 확인시킬 질문을 복사합니다"
    ]
  }),
  check("teaching workspace implementation prompt review heading", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 다듬을 구현 프롬프트", "not.toContain(\"복사용 구현 프롬프트\")", "teaching workspace implementation prompt review heading"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:복사용 구현 프롬프트",
      "packages/core/src/pipeline.test.ts:expect(implementationBriefHtml).toContain(\"복사용 구현 프롬프트\")"
    ]
  }),
  check("desktop implementation prompt adaptation guidance", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["검토 후 내 목표에 맞게 다듬을 브리프 문장", "근거 보강 프롬프트를 검토한 뒤 AI에게 증거와 검증 기준만 먼저 수집시키세요", "desktop implementation prompt adaptation guidance"]),
  check("desktop learner prompt clipboard adaptation log", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 구현 지시문 클립보드에 초안 저장됨: 전송 전 내 목표, 소스 근거, 수락 기준, 검증 기준에 맞게 검토 후 다듬을 AI 채팅 초안입니다", "전송 전 목표, 소스 근거, 수락 기준, 검증 기준을 검토할 AI 구현 지시문 초안을 저장합니다", "desktop learner prompt clipboard adaptation log", "--iterations 242"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 지시문 클립보드 저장 완료: 전송 전 내 목표, 소스 근거, 수락 기준, 검증 기준에 맞게 검토 후 다듬을 AI 채팅 초안입니다",
      "apps/desktop-tauri/src/App.tsx:AI 구현 지시문 클립보드 저장 완료: 검토 후 내 목표와 검증 기준에 맞게 다듬어 AI 채팅에 보낼 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:AI 구현 지시문 복사 완료",
      "apps/desktop-tauri/src/App.tsx:AI 채팅에 붙여넣을 수 있습니다"
    ]
  }),
  check("desktop implementation handoff clipboard verification log", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 구현 인계 프롬프트 클립보드에 초안 저장됨: 전송 전 세션 근거, 내 목표, 수락 기준, 검증 기준에 맞게 첫 vertical slice 요청 후보를 다듬으세요", "AI 구현 결과 근거 보강 프롬프트 클립보드에 초안 저장됨: 전송 전 부족한 증거와 검증 기준만 먼저 수집할 AI 질문 후보로 다듬으세요", "전송 전 세션 근거, 목표, 수락 기준, 검증 기준을 검토할 구현 인계 프롬프트를 저장합니다", "전송 전 부족한 증거와 검증 기준만 수집할 근거 보강 프롬프트를 저장합니다", "desktop implementation handoff clipboard verification log", "--iterations 247"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 구현 인계 프롬프트 클립보드 저장 완료: 전송 전 세션 근거, 내 목표, 수락 기준, 검증 기준에 맞게 첫 vertical slice 요청 후보를 다듬으세요",
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 근거 보강 프롬프트 클립보드 저장 완료: 전송 전 부족한 증거와 검증 기준만 먼저 수집할 AI 질문 후보로 다듬으세요",
      "apps/desktop-tauri/src/App.tsx:AI 구현 인계 프롬프트 복사 완료",
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 근거 보강 프롬프트 복사 완료",
      "apps/desktop-tauri/src/App.tsx:세션 산출물 기반 첫 vertical slice를 AI에게 요청할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:부족한 증거를 AI에게 먼저 수집시킬 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:세션 근거를 검토하고 내 목표와 검증 기준에 맞게 다듬어 첫 vertical slice를 요청하세요",
      "apps/desktop-tauri/src/App.tsx:부족한 증거와 검증 기준을 먼저 수집하도록 AI에게 요청하세요"
    ]
  }),
  check("desktop prompt clipboard review wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["전송 전 미체크 기준과 검증 기준을 검토할 AI 응답 보강 프롬프트를 저장합니다", "AI 응답 보강 프롬프트 클립보드에 초안 저장됨: 전송 전 미체크 기준과 검증 기준을 검토한 뒤 다듬을 보강 요청 초안입니다", "AI 구현 결과 검토 프롬프트 클립보드에 초안 저장됨: 전송 전 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 확인한 뒤 ACCEPT_REVIEW / REVISE / BLOCK 검토 상태 후보를 만드세요", "AI 구현 결과 다음 행동 프롬프트 클립보드에 초안 저장됨: 전송 전 현재 검토 상태 근거를 확인하고 멈춤, 수정, 다음 개선 중 하나의 지시 후보로 검토하세요", "소스 정리 판단 프롬프트 클립보드에 초안 저장됨: 전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다", "전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토할 보존/정리 판단 프롬프트를 저장합니다", "desktop prompt clipboard review wording", "--iterations 402"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 응답 보강 프롬프트 클립보드 저장 완료: 전송 전 미체크 기준과 검증 기준을 검토한 뒤 다듬을 보강 요청 초안입니다",
      "apps/desktop-tauri/src/App.tsx:AI 응답 보강 프롬프트 클립보드 저장 완료: 미체크 기준을 검토한 뒤 AI에게 다시 요청할 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 검토 프롬프트 클립보드 저장 완료: 전송 전 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 확인한 뒤 ACCEPT_REVIEW / REVISE / BLOCK 검토 상태 후보를 만드세요",
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 다음 행동 프롬프트 클립보드 저장 완료: 전송 전 현재 검토 상태 근거를 확인하고 멈춤, 수정, 다음 개선 중 하나의 지시 후보로 검토하세요",
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 검토 프롬프트 클립보드 저장 완료: 전송 전 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 확인한 뒤 ACCEPT / REVISE / BLOCK 판정 후보를 만드세요",
      "apps/desktop-tauri/src/App.tsx:AI 구현 결과 다음 행동 프롬프트 클립보드 저장 완료: 전송 전 현재 판정 근거를 확인하고 멈춤, 수정, 다음 개선 중 하나의 지시 후보로 검토하세요",
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 클립보드에 초안 저장됨: 전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인 조건을 검토할 보존/정리 판단 프롬프트를 저장합니다",
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 클립보드 저장 완료: 전송 전 보존 증거 묶음, 현재 학습 목표, 학습자 명시 확인 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 클립보드에 초안 저장됨: 전송 전 보존 증거 묶음, 현재 학습 목표, 학습자 명시 확인 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다",
      "apps/desktop-tauri/src/App.tsx:전송 전 보존 증거 묶음, 현재 학습 목표, 학습자 명시 확인 조건을 검토할 보존/정리 판단 프롬프트를 저장합니다",
      "apps/desktop-tauri/src/App.tsx:프롬프트 복사 완료",
      "apps/desktop-tauri/src/App.tsx:프롬프트를 복사합니다.",
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 복사 완료"
    ]
  }),
  check("desktop prompt button clipboard labels", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 지시문 클립보드 저장", "AI 보강문 클립보드 저장", "구현 인계 클립보드 저장", "맥락 보강 클립보드 저장", "결과 검토 클립보드 저장", "근거 보강 클립보드 저장", "다음 행동 클립보드 저장", "재작업 요청 클립보드 저장", "결과 기록 클립보드 저장", "정리 판단 클립보드 저장", "desktop prompt button clipboard labels"]),
  check("desktop prompt clipboard error logs", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 구현 지시문 클립보드 저장 오류", "AI 응답 보강 프롬프트 클립보드 저장 오류", "AI 구현 인계 프롬프트 클립보드 저장 오류", "AI 구현 인계 맥락 보강 프롬프트 클립보드 저장 오류", "AI 구현 결과 검토 프롬프트 클립보드 저장 오류", "AI 구현 결과 근거 보강 프롬프트 클립보드 저장 오류", "AI 구현 결과 재작업 프롬프트 클립보드 저장 오류", "AI 구현 결과 검토 기록 프롬프트 클립보드 저장 오류", "AI 구현 결과 다음 행동 프롬프트 클립보드 저장 오류", "소스 정리 판단 프롬프트 클립보드 저장 오류", "desktop prompt clipboard error logs"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:프롬프트 복사 오류",
      "apps/desktop-tauri/src/App.tsx:지시문 복사 오류",
      "apps/desktop-tauri/src/App.tsx:소스 정리 판단 프롬프트 복사 오류"
    ]
  }),
  check("ai output review vibe reviewer wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 산출물을 목적, 근거, 검증 기준으로 검토하는 기준표", "바이브코딩 리뷰어처럼 목적, 근거, 검증 기준으로 검토해줘", "바이브코딩 리뷰 요청", "not.toContain(\"전문 개발자 리뷰어처럼 검토해줘\")", "ai output review vibe reviewer wording"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:AI 산출물을 전문 개발자처럼 검토하는 기준표",
      "packages/core/src/teaching-workspace.ts:전문 개발자 리뷰어처럼 검토해줘",
      "packages/core/src/scanner.ts:전문 개발자처럼 검토 요청"
    ]
  }),
  check("teaching workspace ai output review card review-state wording", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 산출물을 목적, 아키텍처, 근거, 검증 기준으로 PASS_REVIEW/REVISE/BLOCK 검토 상태로 확인합니다. PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다.", "not.toContain(\"AI 산출물을 목적, 아키텍처, 근거, 검증 기준으로 판정합니다.\")", "teaching workspace ai output review card review-state wording", "--iterations 227"], {
    forbidden: [
      "packages/html/src/templates.ts:AI 산출물을 목적, 아키텍처, 근거, 검증 기준으로 판정합니다.",
      "packages/core/src/pipeline.test.ts:expect(teachingWorkspaceHtml).toContain(\"AI 산출물을 목적, 아키텍처, 근거, 검증 기준으로 판정합니다.\")"
    ]
  }),
  check("learner role hand coding wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["손코딩 문법 암기 수업이 아닙니다", "손코딩 문법을 외웠는지 보지 않습니다", "not.toContain(\"전문 개발자가 되기 위한 문법 수업이 아닙니다\")", "not.toContain(\"전문 개발자처럼 문법을 손으로 외웠는지\")", "learner role hand coding wording"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:전문 개발자가 되기 위한 문법 수업이 아닙니다",
      "packages/core/src/teaching-workspace.ts:전문 개발자처럼 문법을 손으로 외웠는지"
    ]
  }),
  check("quiz prompt review structured fields", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/quiz.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["aiPromptUse: z.string()", "aiReviewQuestion: z.string()", "memorizationWarning: z.string()", "AI 지시 문장:", "AI 출력 리뷰 질문:", "외우지 말 것:", "AI 결과를 검토할 질문", "AI에게 올바른 맥락과 검토 기준", "not.toContain(\"AI 결과를 판정할 질문\")", "원본 소스를 앱에 영구 내장 지식", "quiz prompt review structured fields", "--iterations 229"], {
    forbidden: [
      "packages/core/src/quiz.ts:AI 결과를 판정할 질문",
      "packages/core/src/quiz.ts:AI에게 올바른 맥락과 판정 기준",
      "packages/core/src/pipeline.test.ts:expect(quizText).toContain(\"AI 결과를 판정할 질문\")"
    ]
  }),
  check("implementation brief learner decision checkpoints", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["학습자 판단 체크포인트", "이 앱이 누구의 어떤 문제를 해결해야 하는지 제품 방향을 학습자가 검토합니다", "원본 구조에서 새 앱에 남길 책임과 버릴 책임을 결정합니다", "PASS_REVIEW / REVISE / BLOCK 검토 상태", "PASS_REVIEW도 최종 ACCEPT, 구현 완료, 배포, 삭제 허가가 아니라", "실행 명령, 테스트 결과, 화면 확인, 사람 판단 중 무엇을 검토 근거로 볼지 정합니다", "source-absorption-ledger, session-verification, source-retention-guide", "생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다", "not.toContain(\"원본 source/ 보존 여부를 결정\")", "implementation brief learner decision checkpoints", "--iterations 274"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:이 앱이 누구의 어떤 문제를 해결해야 하는지 최종 판단합니다",
      "packages/core/src/teaching-workspace.ts:AI가 제안한 수락 기준이 사용자 관점에서 충분한지 PASS / REVISE / BLOCK으로 판정합니다",
      "packages/core/src/teaching-workspace.ts:실행 명령, 테스트 결과, 화면 확인, 사람 판단 중 무엇을 완료 증거로 볼지 정합니다",
      "packages/core/src/teaching-workspace.ts:원본 source/ 보존 여부를 결정합니다",
      "packages/core/src/pipeline.test.ts:expect(implementationBriefHtml).toContain(\"PASS / REVISE / BLOCK\")",
      "packages/core/src/pipeline.test.ts:expect(implementationBriefMarkdown).toContain(\"PASS / REVISE / BLOCK\")"
    ]
  }),
  check("prompt readiness send stop conditions", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["프롬프트 전송 중단 조건", "검토 상태표", "READY_REVIEW / REVISE / BLOCK 검토 상태로 나눠줘", "READY_REVIEW 검토 상태를 유보합니다", "not.toContain(\"READY_REVIEW 판정을 유보합니다\")", "not.toContain(\"READY_REVIEW / REVISE / BLOCK으로 판정해줘\")", "not.toContain(\"<h2>판정표</h2>\")", "사용자 문제와 제외 범위가 없으면 보내지 않습니다", "관련 source evidence가 한 줄도 없으면 일반 개발 지식 답변으로 흐르므로 보강합니다", "첫 vertical slice와 하지 않을 일을 분리하지 못하면 전체 앱 생성 요청으로 번질 수 있습니다", "acceptance criteria, verification assertion, 검증 기록 보고 형식이 없으면 READY_REVIEW 검토 상태를 유보합니다", "수락 기준이 관찰 가능한 bullet", "verification assertion, 검증 기록 보고 형식을 전송 전 직접 확인해야 합니다", "AI가 보고할 변경 파일, 실행 명령, 실패, 가정, 다음 질문 형식이 없으면 먼저 추가합니다", "prompt readiness send stop conditions", "--iterations 223"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:READY_REVIEW 판정을 유보합니다",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"acceptance criteria와 verification assertion이 없으면 READY_REVIEW 판정을 유보합니다\")",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessMarkdown).toContain(\"READY_REVIEW 판정을 유보합니다\")",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW / REVISE / BLOCK으로 판정해줘",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"READY_REVIEW / REVISE / BLOCK으로 판정해줘\")",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessMarkdown).toContain(\"READY_REVIEW / REVISE / BLOCK으로 판정해줘\")",
      "packages/core/src/teaching-workspace.ts:acceptance criteria와 verification assertion이 없으면 완료 판정을 유보합니다",
      "packages/core/src/teaching-workspace.ts:verification assertion을 최종 확인해야 합니다",
      "packages/core/src/teaching-workspace.ts:acceptance criteria와 verification assertion이 없으면 READY_REVIEW 검토 상태를 유보합니다",
      "packages/core/src/teaching-workspace.ts:verification assertion을 전송 전 직접 확인해야 합니다",
      "packages/core/src/teaching-workspace.ts:완료 조건이 관찰 가능한 bullet",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"<h2>판정표</h2>\")",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessHtml).toContain(\"acceptance criteria와 verification assertion이 없으면 완료 판정을 유보합니다\")",
      "packages/core/src/pipeline.test.ts:expect(promptReadinessMarkdown).toContain(\"완료 판정을 유보합니다\")"
    ]
  }),
  check("prompt ab lab send decision", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["A/B 검토 상태표", "보낼 프롬프트 검토 상태", "어느 쪽이 안전한 검토 후보인지 나눠줘", "not.toContain(\"어느 쪽이 안전한지 판정해줘\")", "not.toContain(\"A/B 판정표\")", "not.toContain(\"보낼 프롬프트 판정\")", "프롬프트 A는 BLOCK입니다", "source evidence, acceptance criteria, verification assertion이 없어 보내지 않습니다", "프롬프트 B 후보는 READY_REVIEW 검토 후보입니다", "READY_REVIEW도 내 제품 목적, source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트, 검증 기록 보고 형식을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "확인하지 않은 성공 주장이 있으면 BLOCK 검토 상태로 둡니다.", "not.toContain(\"프롬프트 B는 READY 후보입니다\")", "REVISE로 바꾸고 다시 검토합니다", "not.toContain(\"확인한 뒤 보냅니다\")", "not.toContain(\"REVISE로 바꾼 뒤 보냅니다\")", "not.toContain(\"확인하지 않은 성공 주장이 있으면 BLOCK으로 판정합니다.\")", "전송 중단 조건부터 보강합니다", "prompt ab lab send decision", "--iterations 230"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:확인하지 않은 성공 주장이 있으면 BLOCK으로 판정합니다.",
      "packages/core/src/teaching-workspace.ts:어느 쪽이 안전한지 판정해줘",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"어느 쪽이 안전한지 판정해줘\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"어느 쪽이 안전한지 판정해줘\")",
      "packages/core/src/teaching-workspace.ts:<h2>A/B 판정표</h2>",
      "packages/core/src/teaching-workspace.ts:<h2>보낼 프롬프트 판정</h2>",
      "packages/core/src/teaching-workspace.ts:## 보낼 프롬프트 판정",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"A/B 판정표\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"보낼 프롬프트 판정\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"## 보낼 프롬프트 판정\")",
      "packages/core/src/teaching-workspace.ts:프롬프트 B는 READY 후보입니다",
      "packages/core/src/teaching-workspace.ts:프롬프트 B 후보는 READY 검토 후보입니다",
      "packages/core/src/teaching-workspace.ts:확인한 뒤 보냅니다",
      "packages/core/src/teaching-workspace.ts:REVISE로 바꾼 뒤 보냅니다",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"확인하지 않은 성공 주장이 있으면 BLOCK으로 판정합니다.\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"확인하지 않은 성공 주장이 있으면 BLOCK으로 판정합니다.\")"
    ]
  }),
  check("prompt ab lab acceptance verification wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["잘 동작하게 해달라는 말만 있어 수락/검증 기준이 흐립니다", "not.toContain(\"완료 여부가 흐립니다\")", "prompt ab lab acceptance verification wording", "--iterations 262"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:완료 여부가 흐립니다",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"완료 여부가 흐립니다\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"완료 여부가 흐립니다\")"
    ]
  }),
  check("prompt ab lab success claim verification wording", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI가 성공이라고 말하면 검증 기록 없이 수락하는 구조입니다", "not.toContain(\"AI가 성공이라고 말하면 끝나는 구조입니다\")", "prompt ab lab success claim verification wording", "--iterations 263"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:AI가 성공이라고 말하면 끝나는 구조입니다",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabHtml).toContain(\"AI가 성공이라고 말하면 끝나는 구조입니다\")",
      "packages/core/src/pipeline.test.ts:expect(promptAbLabMarkdown).toContain(\"AI가 성공이라고 말하면 끝나는 구조입니다\")"
    ]
  }),
  check("scanner static caveat verification wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["statementDrafts는 실제 취약점 확인 결과가 아니라 pending triage 템플릿입니다", "실제 버그 여부는 원본 API에서 별도 실행해 확인하세요", "실제 contract pass/fail은 원본 프로젝트에서 Pact 도구를 실행해 확인하세요", "실제 drift 여부는 원본 저장소에서 validate/generate/typecheck를 별도 실행해 확인하세요", "not.toContain(\"statementDrafts는 실제 취약점 판정이 아니라 pending triage 템플릿입니다.\")", "not.toContain(\"실제 버그 판정은 원본 API에서 별도 실행하세요.\")", "not.toContain(\"실제 contract pass/fail은 원본 프로젝트에서 Pact 도구를 실행해 판정하세요.\")", "not.toContain(\"실제 drift 판정은 원본 저장소에서 validate/generate/typecheck를 별도 실행하세요.\")", "scanner static caveat verification wording", "--iterations 231"], {
    forbidden: [
      "packages/core/src/scanner.ts:statementDrafts는 실제 취약점 판정이 아니라 pending triage 템플릿입니다.",
      "packages/core/src/scanner.ts:실제 버그 판정은 원본 API에서 별도 실행하세요.",
      "packages/core/src/scanner.ts:실제 contract pass/fail은 원본 프로젝트에서 Pact 도구를 실행해 판정하세요.",
      "packages/core/src/scanner.ts:실제 drift 판정은 원본 저장소에서 validate/generate/typecheck를 별도 실행하세요.",
      "packages/core/src/pipeline.test.ts:expect(vexText).toContain(\"statementDrafts는 실제 취약점 판정이 아니라 pending triage 템플릿입니다.\")",
      "packages/core/src/pipeline.test.ts:expect(apiContractText).toContain(\"실제 버그 판정은 원본 API에서 별도 실행하세요.\")",
      "packages/core/src/pipeline.test.ts:expect(consumerContractText).toContain(\"실제 contract pass/fail은 원본 프로젝트에서 Pact 도구를 실행해 판정하세요.\")",
      "packages/core/src/pipeline.test.ts:expect(openApiClientReadinessText).toContain(\"실제 drift 판정은 원본 저장소에서 validate/generate/typecheck를 별도 실행하세요.\")"
    ]
  }),
  check("source absorption preserved evidence bundle", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["정리 전 보존 증거 묶음", "생성된 세션 <code>source/</code> 스냅샷을 장기 지식으로 보관하지 않고도", "not.toContain(\"원본 source/를 장기 지식으로 보관하지 않고도\")", "학습 목적, 아키텍처 이유, AI 프롬프트, 검증 경계, 정리 판단", "analysis/daily-summary-report.json", "html/vibe-coding-prompt-pack.html", "reference/vibe-coding-implementation-brief.html", "html/session-verification.html", "reference/source-retention-guide.html", "source absorption preserved evidence bundle"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:삭제 전 보존 증거 묶음",
      "packages/core/src/teaching-workspace.ts:원본 source/를 장기 지식으로 보관하지 않고도"
    ]
  }),
  check("source prune preserved evidence bundle gate", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["PRESERVED_EVIDENCE_BUNDLE_ARTIFACTS", "preservedEvidenceBundleOk", "preservedEvidenceBundle", "missing-preserved-evidence-bundle", "## Preserved Evidence Bundle", "이 묶음은 생성된 세션 \\`source/\\` 스냅샷 정리 전 반드시 남아야 합니다", "사용자 원본 소스를 장기 앱 지식으로 보관하지 않아도", "AI에게 다시 지시할 수 있게 만드는 최소 증거입니다", "source prune preserved evidence bundle gate"]),
  check("source prune preserved evidence bundle korean guidance", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["이 묶음은 생성된 세션 \\`source/\\` 스냅샷 정리 전 반드시 남아야 합니다", "학습 목적, 아키텍처 이유, AI 프롬프트", "검증 경계, 정리 판단을 복습하고 AI에게 다시 지시할 수 있게 만드는 최소 증거", "source prune preserved evidence bundle korean guidance"]),
  check("source prune learner cleanup decision", [
    "packages/core/src/source-prune.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Status: READY_REVIEW", "READY_REVIEW is a learner cleanup review candidate", "not final ACCEPT, deployment, or deletion permission", "## 학습자 정리 판단", "생성된 세션 `source/` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다", "특정 프로젝트의 목적, 아키텍처 이유, 역할 용어, AI 프롬프트, 검증 기준", "AI에게 보낼 프롬프트가 source evidence와 acceptance criteria를 포함하나요?", "source 링크가 더 이상 열리지 않아도 학습자가 비슷한 앱을 지시하고 리뷰할 수 있나요?", "정리 전 명시 확인", "source 링크가 더 이상 열리지 않아도 된다고 직접 확인했나요?", "학습자의 명시 확인이 없으면 READY_REVIEW 상태여도 최종 ACCEPT, 배포, 삭제 허가가 아닙니다", "The learner explicitly confirms that source links no longer need to open for this learning goal.", "The learner has not explicitly confirmed that source links are no longer needed for the current learning goal.", "source prune learner cleanup decision"], {
    forbidden: ["packages/core/src/source-prune.ts:Status: ${status}\n- Session root"]
  }),
  check("vibe tech context language report", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["언어는 목표가 아니라 AI 지시 맥락입니다", "이 페이지의 목표는 언어 문법을 배우는 것이 아닙니다", "문법을 외우는 대신", "런타임, 프레임워크, 빌드 도구, 파일 역할, 검증 기준", "data-source-pattern=\"vibe-tech-context\"", "AI에게 알려줄 기술 맥락", "AI 지시 힌트", "vibe tech context language report"]),
  check("tech context navigation labels", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["[\"language.html\", \"기술 맥락\"]", "AI 지시용 기술 맥락 파악", "문법을 외우기보다 런타임, 의존성, 빌드/검증 맥락", "기술 맥락\", \"Folders\"", "tech context navigation labels"]),
  check("agent instruction skeleton prompt pack", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 도구 지시서 골격", "Copilot/OpenAI agent instruction context", "긴 소스 전체가 아니라", "역할과 목표:", "프로젝트 맥락:", "작업 규칙:", "검증 루브릭:", "PASS_REVIEW / REVISE / BLOCK 기준으로 AI 산출물을 검토", "PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보일 뿐이다", "agent instruction skeleton prompt pack", "--iterations 202"], {
    forbidden: [
      "packages/core/src/markdown.ts:PASS / REVISE / BLOCK 기준으로 AI 산출물을 검토",
      "packages/html/src/templates.ts:PASS / REVISE / BLOCK 기준으로 AI 산출물을 검토",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackHtml).toContain(\"PASS / REVISE / BLOCK 기준으로 AI 산출물을 검토\")",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackMarkdown).toContain(\"PASS / REVISE / BLOCK 기준으로 AI 산출물을 검토\")"
    ]
  }),
  check("prompt pack pass review accept delete boundary", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보일 뿐이다",
    "packages/html/src/templates.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보일 뿐이다",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보일 뿐이다",
    "prompt pack pass review accept delete boundary",
    "--iterations 348"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니다",
      "packages/html/src/templates.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니다",
      "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니다"
    ]
  }),
  check("start navigation pass review accept delete boundary", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/shared/src/report-targets.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/markdown.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다",
    "packages/html/src/templates.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다",
    "packages/shared/src/report-targets.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다",
    "packages/html/src/templates.ts:AI 산출물을 목적, 아키텍처, 근거, 검증 기준으로 PASS_REVIEW/REVISE/BLOCK 검토 상태로 확인합니다. PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다",
    "start navigation pass review accept delete boundary",
    "--iterations 349"
  ], {
    forbidden: [
      "packages/core/src/markdown.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아닙니다",
      "packages/html/src/templates.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아닙니다",
      "packages/shared/src/report-targets.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아닙니다",
      "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아닙니다"
    ]
  }),
  check("generated pass review accept delete boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보로만 표시해줘",
    "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 최종 ACCEPT, 구현 완료, 배포, 삭제 허가가 아니라 source evidence와 검증 기록 확인 후보로 둡니다",
    "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다",
    "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록 확인 후보로 표시해줘",
    "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록을 다시 확인할 후보로만 둬",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보로만 표시해줘",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 ACCEPT, 구현 완료, 배포, 삭제 허가가 아니라",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록 확인 후보로 표시해줘",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라",
    "generated pass review accept delete boundary",
    "--iterations 351"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니라 근거와 검증 기록 확인 후보로만 표시해줘",
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 구현 완료나 배포 허가가 아니라 source evidence와 검증 기록 확인 후보로 둡니다",
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니라 근거와 검증 기록 확인 후보입니다",
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 구현 시작, 최종 승인, 배포 허가가 아니라 source evidence와 검증 기록 확인 후보로 표시해줘",
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니라 source evidence와 검증 기록을 다시 확인할 후보로만 둬",
      "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니라 근거와 검증 기록 확인 후보로만 표시해줘",
      "packages/core/src/pipeline.test.ts:PASS_REVIEW도 구현 완료나 배포 허가가 아니라",
      "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니라 근거와 검증 기록 확인 후보입니다",
      "packages/core/src/pipeline.test.ts:PASS_REVIEW도 구현 시작, 최종 승인, 배포 허가가 아니라 source evidence와 검증 기록 확인 후보로 표시해줘",
      "packages/core/src/pipeline.test.ts:PASS_REVIEW도 최종 승인이나 배포 허가가 아니라"
    ]
  }),
  check("compact ready accept review accept deploy delete boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW도 내 제품 목적, source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트, 검증 기록 보고 형식을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘",
    "packages/core/src/teaching-workspace.ts:ACCEPT_REVIEW는 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라",
    "packages/core/src/teaching-workspace.ts:ACCEPT_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라",
    "packages/core/src/markdown.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/markdown.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/html/src/templates.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/html/src/templates.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 내 제품 목적, source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트, 검증 기록 보고 형식을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:ACCEPT_REVIEW는 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라",
    "compact ready accept review accept deploy delete boundary",
    "--iterations 352"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 전송 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송 허가가 아니며",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW도 전송, 삭제, ACCEPT 허가가 아니라 학습자 검토 상태",
      "packages/core/src/teaching-workspace.ts:전송/삭제/ACCEPT 허가가 아닙니다",
      "packages/core/src/teaching-workspace.ts:ACCEPT_REVIEW는 구현 시작 허가가 아니라",
      "packages/core/src/teaching-workspace.ts:ACCEPT_REVIEW도 구현 시작, 최종 승인, 배포, 삭제 허가가 아니라",
      "packages/core/src/markdown.ts:READY_REVIEW도 전송, 삭제, ACCEPT 허가가 아니라 학습자 검토 상태입니다",
      "packages/core/src/markdown.ts:READY_REVIEW도 전송 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/html/src/templates.ts:READY_REVIEW도 전송, 삭제, ACCEPT 허가가 아니라 학습자 검토 상태입니다",
      "packages/html/src/templates.ts:READY_REVIEW도 전송 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/core/src/pipeline.test.ts:READY_REVIEW도 전송, 삭제, ACCEPT 허가가 아니라 학습자 검토 상태입니다",
      "packages/core/src/pipeline.test.ts:READY_REVIEW는 전송 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/core/src/pipeline.test.ts:READY_REVIEW도 전송 허가가 아니며",
      "packages/core/src/pipeline.test.ts:ACCEPT_REVIEW는 구현 시작 허가가 아니라",
      "packages/core/src/pipeline.test.ts:ACCEPT_REVIEW도 구현 시작, 최종 승인, 배포, 삭제 허가가 아니라"
    ]
  }),
  check("test expectations ready review full boundary", [
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/pipeline.test.ts:READY_REVIEW도 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "test expectations ready review full boundary",
    "--iterations 353"
  ], {
    forbidden: [
      "packages/core/src/pipeline.test.ts:READY_REVIEW도 전송 허가가 아니라 보내기 전 학습자 검토 상태입니다",
      "packages/core/src/pipeline.test.ts:READY_REVIEW는 전송 허가가 아니라 보내기 전 학습자 검토 상태입니다"
    ]
  }),
  check("source absorption pass review accept deploy delete boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, 최종 ACCEPT, 배포, source 삭제 허가가 아니라",
    "packages/core/src/pipeline.test.ts:PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, 최종 ACCEPT, 배포, source 삭제 허가가 아니라",
    "source absorption pass review accept deploy delete boundary",
    "--iterations 354"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, source 삭제, 최종 승인 허가가 아니라",
      "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toContain(\"PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, source 삭제, 최종 승인 허가가 아니라\")",
      "packages/core/src/pipeline.test.ts:expect(absorptionMarkdown).toContain(\"PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, source 삭제, 최종 승인 허가가 아니라\")"
    ]
  }),
  check("desktop source cleanup token accept deploy delete boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라",
    "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 명시 확인했다는 뜻입니다",
    "desktop source cleanup token accept deploy delete boundary",
    "--iterations 402"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 삭제 권한이 아니라",
      "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 삭제 권한이 아니라 마지막 현재 목표 확인입니다",
      "apps/desktop-tauri/src/App.tsx:DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 마지막 현재 목표 확인입니다"
    ]
  }),
  check("generated source retention ready review accept deploy delete boundary", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/teaching-workspace.ts:READY_REVIEW여도 이는 정리 검토 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/teaching-workspace.ts:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/teaching-workspace.ts:<code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라",
    "packages/core/src/markdown.ts:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/html/src/templates.ts:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/pipeline.test.ts:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "generated source retention ready review accept deploy delete boundary",
    "--iterations 356"
  ], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:READY_REVIEW여도 이는 정리 검토 후보일 뿐 삭제 허가가 아닙니다",
      "packages/core/src/teaching-workspace.ts:READY_REVIEW는 정리 검토 후보이지 삭제 허가가 아닙니다",
      "packages/core/src/teaching-workspace.ts:<code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰은 READY_REVIEW가 만든 권한이 아니라",
      "packages/core/src/markdown.ts:READY_REVIEW는 정리 검토 후보이지 삭제 허가가 아닙니다",
      "packages/html/src/templates.ts:READY_REVIEW는 정리 검토 후보이지 삭제 허가가 아닙니다",
      "packages/core/src/pipeline.test.ts:expect(retentionGuideText).toContain(\"READY_REVIEW는 정리 검토 후보이지 삭제 허가가 아닙니다\")",
      "packages/core/src/pipeline.test.ts:expect(absorptionHtml).toContain(\"READY_REVIEW는 정리 검토 후보이지 삭제 허가가 아닙니다\")",
      "packages/core/src/pipeline.test.ts:expect(absorptionMarkdown).toContain(\"READY_REVIEW는 정리 검토 후보이지 삭제 허가가 아닙니다\")"
    ]
  }),
  check("cli desktop docs source retention ready review accept deploy cleanup boundary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/cli/src/index.ts",
    "packages/core/src/source-prune.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "README.md",
    "docs/product/storage-model.md",
    "docs/product/learning-mission.md",
    "docs/research/vibe-coding-best-practices.md",
    "docs/research/external-source-lifecycle.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "apps/cli/src/index.ts:dry-run plan의 READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "apps/cli/src/index.ts:READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission",
    "packages/core/src/source-prune.ts:READY_REVIEW is a learner cleanup review candidate, not final ACCEPT, deployment, or deletion permission",
    "packages/core/src/source-prune.ts:학습자의 명시 확인이 없으면 READY_REVIEW 상태여도 최종 ACCEPT, 배포, 삭제 허가가 아닙니다",
    "packages/core/src/markdown.ts:READY_REVIEW is a cleanup review candidate, not final ACCEPT,",
    "packages/core/src/pipeline.test.ts:not final ACCEPT, deployment, or deletion permission",
    "README.md:READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission",
    "docs/product/storage-model.md:`READY_REVIEW` alone is a cleanup review candidate, not final ACCEPT,",
    "docs/product/learning-mission.md:`READY_REVIEW` is only a cleanup review state,",
    "docs/product/learning-mission.md:not final ACCEPT, deployment, or cleanup permission",
    "docs/research/vibe-coding-best-practices.md:`READY_REVIEW` alone is a cleanup review candidate, not final ACCEPT,",
    "docs/research/external-source-lifecycle.md:does not grant study-session `READY_REVIEW` final",
    "cli desktop docs source retention ready review accept deploy cleanup boundary",
    "--iterations 357"
  ], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:READY_REVIEW는 삭제 허가가 아닙니다",
      "apps/desktop-tauri/src/App.tsx:READY_REVIEW 자체는 삭제 허가가 아닙니다",
      "apps/desktop-tauri/src/App.tsx:READY_REVIEW는 정리 검토 후보이지 삭제 허가가 아닙니다",
      "apps/cli/src/index.ts:READY_REVIEW 자체는 삭제 허가가 아닙니다",
      "apps/cli/src/index.ts:정리 검토 후보이지 삭제 허가가 아닙니다",
      "apps/cli/src/index.ts:READY_REVIEW alone is not cleanup permission",
      "packages/core/src/source-prune.ts:not deletion permission",
      "packages/core/src/source-prune.ts:READY_REVIEW 상태여도 삭제 허가가 아닙니다",
      "packages/core/src/markdown.ts:not deletion permission",
      "README.md:READY_REVIEW alone is not cleanup permission",
      "docs/product/storage-model.md:not cleanup permission",
      "docs/research/vibe-coding-best-practices.md:not cleanup permission"
    ]
  }),
  check("quiz ai instruction context", [
    "packages/core/src/quiz.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI에게 설명할 때 가장 알맞은 지시 맥락", "목적, 책임, 연결된 검증 기준을 AI 지시 맥락", "언어 문법을 먼저 외우라고", "원본 소스를 앱에 영구 내장 지식", "검증 기준 없이 AI에게 전체 구현", "AI 지시용 폴더 맥락 부족", "AI 프롬프트 용어 맥락 부족", "quiz ai instruction context"]),
  check("quiz print wrong note ai review", [
    "packages/html/src/templates.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["quiz-ai-instruction-review", "코딩 문법 암기표가 아니라", "AI 구현 지시 문장", "AI 지시 맥락 복습", "틀린 코드를 외우는 곳이 아니라", "틀린 코드를 외우는 기록이 아니라", "소스 역할을 AI 지시 문장으로 바꾸는 능력", "quiz print wrong note ai review"]),
  check("quiz entrypoint ai review descriptions", [
    "packages/html/src/templates.ts",
    "packages/shared/src/report-targets.ts",
    "packages/core/src/pipeline.test.ts",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["소스 역할을 AI에게 줄 목적, 책임, 검증 기준", "AI 구현 지시 기준표", "틀린 문제를 AI에게 다시 설명할 목적", "틀린 개념을 AI에게 다시 설명할 목적", "quiz entrypoint ai review descriptions"]),
  check("desktop quiz ai instruction review", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["AI 지시 맥락 퀴즈", "문법 암기가 아니라 소스 역할을 목적, 책임, 검증 기준이 있는 AI 구현 지시", "AI 지시 복습", "quiz-header-copy", "desktop quiz ai instruction review"]),
  check("desktop quiz followup actions", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["aria-label=\"퀴즈 제출 후 다음 학습\"", "AI 지시 복습 열기", "학습기록 확인", "openReportTab(\"오답노트\", \"wrong-notes\")", "openReportTab(\"학습 워크스페이스\", \"teaching-workspace\")", "attempt-actions", "desktop quiz followup actions"]),
  check("desktop quiz learning record guidance", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["className=\"attempt-guidance\"", "className=\"attempt-record-path\"", "학습기록은 단순 점수 저장이 아니라", "AI 지시 맥락으로 다시 쓰는 증거", "Teaching Workspace의 learning-records 섹션", "Learning record:", ".attempt-guidance", ".attempt-record-path", "desktop quiz learning record guidance"]),
  check("desktop quiz learning record log", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["const learningRecordLog", "const reviewLog", "학습기록 저장:", "learning-records에 남길 증거", "AI 지시 복습 필요", "목적, 책임, 검증 기준으로 다시 설명", "AI 지시 복습 근거 확인", "학습기록에서 통과 근거", "퀴즈 제출 결과 기록됨", "desktop quiz learning record log", "--iterations 241"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 지시 복습 완료",
      "apps/desktop-tauri/src/App.tsx:퀴즈 제출 완료"
    ]
  }),
  check("desktop quiz answer progress gate", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["quizAnsweredCount", "quizTotalCount", "quizReadyToSubmit", "className=\"quiz-progress\"", "aria-live=\"polite\"", "AI 지시 맥락 판단", "응답됨", "남은 문항을 선택하면 제출할 수 있습니다.", "disabled={!quizReadyToSubmit}", ".quiz-progress", "desktop quiz answer progress gate", "--iterations 239"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:AI 지시 맥락 판단 {quizAnsweredCount}/{quizTotalCount} 완료"
    ]
  }),
  check("desktop quiz per question answer state", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["data-answer-state={answered ? \"answered\" : \"missing\"}", "className=\"quiz-item-heading\"", "className={answered ? \"quiz-state answered\" : \"quiz-state missing\"}", "답변 선택됨", "선택 필요", ".quiz-item[data-answer-state=\"answered\"]", ".quiz-state.answered", ".quiz-state.missing", "desktop quiz per question answer state", "--iterations 240"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:답변 완료"
    ]
  }),
  check("desktop quiz answer accessibility state", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["const selectedAnswer = answers[question.id];", "aria-label={`${questionNumber}번 문항 ${answered ? \"답변 선택됨\" : \"선택 필요\"}`}", "aria-live=\"polite\"", "aria-pressed={selectedAnswer === key}", "aria-label={`${questionNumber}번 ${key} 선택지${selectedAnswer === key ? \" 선택됨\" : \"\"}: ${value}`}", "desktop quiz answer accessibility state", "--iterations 240"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:aria-label={`${questionNumber}번 문항 ${answered ? \"답변 완료\" : \"선택 필요\"}`}"
    ]
  }),
  check("desktop quiz first missing navigation", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["const quizMissingCount = Math.max(quizTotalCount - quizAnsweredCount, 0);", "function focusFirstMissingQuizQuestion()", "document.querySelector<HTMLElement>('.quiz-item[data-answer-state=\"missing\"]')", "scrollIntoView({ behavior: \"smooth\", block: \"center\" })", "첫 미응답 AI 지시 판단으로 이동", "className=\"quiz-actions\"", "미응답 문항 찾기", ".quiz-actions", "desktop quiz first missing navigation"]),
  check("desktop quiz missing number summary", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["const quizMissingQuestionNumbers", "const quizMissingQuestionSummary", "미응답 문항 없음", "미응답 문항:", "quizMissingQuestionNumbers.slice(0, 8)", "외 ${quizMissingQuestionNumbers.length - 8}개", "className=\"quiz-missing-summary\"", ".quiz-missing-summary", "desktop quiz missing number summary"]),
  check("desktop quiz missing number shortcuts", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["function focusQuizQuestionByNumber(questionNumber: number)", "data-question-number={questionNumber}", "className=\"quiz-missing-shortcuts\"", "aria-label=\"미응답 문항 바로가기\"", "aria-label={`미응답 ${questionNumber}번 문항으로 이동`}", "onClick={() => focusQuizQuestionByNumber(questionNumber)}", "{questionNumber}번", "미응답 문항 ${questionNumber}번으로 이동", ".quiz-missing-shortcuts", "desktop quiz missing number shortcuts"]),
  check("desktop quiz missing only filter", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["showOnlyMissingQuizQuestions", "setShowOnlyMissingQuizQuestions(false)", "const visibleQuizQuestions", "const quizQuestionVisibilitySummary", "미응답 문항만 표시:", "전체 문항 표시:", "className=\"quiz-filter-summary\"", "aria-pressed={showOnlyMissingQuizQuestions}", "미응답만 보기", "전체 보기", "className=\"quiz-filter-empty\"", "미응답 문항이 없습니다. 제출할 수 있습니다.", ".quiz-filter-summary", ".quiz-filter-empty", "desktop quiz missing only filter"]),
  check("desktop quiz unanswered wording", [
    "apps/desktop-tauri/src/App.tsx",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["미응답 문항 없음", "미응답 문항:", "미응답 문항만 표시:", "미응답만 보기", "미응답 문항 찾기", "미응답 문항 바로가기", "미응답 문항이 없습니다. 제출할 수 있습니다.", "첫 미응답 AI 지시 판단으로 이동", "not.toContain(\"미완료 문항\")", "desktop quiz unanswered wording", "--iterations 267"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:미완료 문항",
      "apps/desktop-tauri/src/App.tsx:미완료만 보기",
      "apps/desktop-tauri/src/App.tsx:첫 미완료 AI 지시 판단으로 이동"
    ]
  }),
  check("desktop quiz answer reset", [
    "apps/desktop-tauri/src/App.tsx",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["function resetQuizAnswers()", "setAnswers({});", "setAttempt(null);", "setShowOnlyMissingQuizQuestions(false);", "퀴즈 답변 초기화: AI 지시 맥락 판단을 다시 시작합니다.", "onClick={resetQuizAnswers}", "disabled={quizAnsweredCount === 0 && !attempt}", "답변 초기화", "desktop quiz answer reset"]),
  check("codex skill mode", [
    "skills/repo-tutor/SKILL.md",
    ".agents/skills/repo-tutor/SKILL.md",
    "skills/repo-tutor/scripts/repo-tutor-study.sh",
    ".agents/skills/repo-tutor/scripts/repo-tutor-study.sh"
  ], ["repo-tutor study", "repo-tutor quiz", "--no-codex", "Do not execute arbitrary project commands", "pnpm --silent --dir \"$repo_root\" -w build:runtime-deps", "pnpm --silent --dir \"$repo_root\" --filter @repotutor/cli exec tsx src/index.ts study", "repo-tutor command not found and RepoTutor Studio root could not be located", "permanent app knowledge"]),
  check("codex skill output format teaching workspace parity", [
    "skills/repo-tutor/SKILL.md",
    ".agents/skills/repo-tutor/SKILL.md",
    "skills/repo-tutor/references/output-format.md",
    ".agents/skills/repo-tutor/references/output-format.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "skills/repo-tutor/SKILL.md:html/daily-summary.html",
    "skills/repo-tutor/SKILL.md:html/teaching-workspace.html",
    ".agents/skills/repo-tutor/SKILL.md:html/daily-summary.html",
    ".agents/skills/repo-tutor/SKILL.md:html/teaching-workspace.html",
    "skills/repo-tutor/references/output-format.md:dailySummaryHtml",
    "skills/repo-tutor/references/output-format.md:teachingWorkspaceHtml",
    "skills/repo-tutor/references/output-format.md:learnerGoalAlignmentHtml",
    "skills/repo-tutor/references/output-format.md:verificationOk",
    "skills/repo-tutor/references/output-format.md:verificationReport",
    "skills/repo-tutor/references/output-format.md:verificationMarkdown",
    "skills/repo-tutor/references/output-format.md:verificationHtml",
    "skills/repo-tutor/references/output-format.md:verificationCheckedRequiredArtifacts",
    "skills/repo-tutor/references/output-format.md:verificationChecks",
    "skills/repo-tutor/references/output-format.md:wrongNotesHtml",
    "skills/repo-tutor/references/output-format.md:wrongNotesMarkdown",
    "skills/repo-tutor/references/output-format.md:learningRecord",
    "skills/repo-tutor/references/output-format.md:reviewGuidance",
    ".agents/skills/repo-tutor/references/output-format.md:dailySummaryHtml",
    ".agents/skills/repo-tutor/references/output-format.md:teachingWorkspaceHtml",
    ".agents/skills/repo-tutor/references/output-format.md:learnerGoalAlignmentHtml",
    ".agents/skills/repo-tutor/references/output-format.md:verificationOk",
    ".agents/skills/repo-tutor/references/output-format.md:verificationReport",
    ".agents/skills/repo-tutor/references/output-format.md:verificationMarkdown",
    ".agents/skills/repo-tutor/references/output-format.md:verificationHtml",
    ".agents/skills/repo-tutor/references/output-format.md:verificationCheckedRequiredArtifacts",
    ".agents/skills/repo-tutor/references/output-format.md:verificationChecks",
    ".agents/skills/repo-tutor/references/output-format.md:wrongNotesHtml",
    ".agents/skills/repo-tutor/references/output-format.md:wrongNotesMarkdown",
    ".agents/skills/repo-tutor/references/output-format.md:learningRecord",
    ".agents/skills/repo-tutor/references/output-format.md:reviewGuidance",
    "codex skill output format teaching workspace parity",
    "--iterations 429"
  ], {
    forbidden: [
      "skills/repo-tutor/references/output-format.md:User-facing answers should include the HTML path and whether quiz/wrong-note",
      ".agents/skills/repo-tutor/references/output-format.md:The CLI prints JSON containing the session id, generated folder, HTML entrypoint"
    ]
  }),
  check("cli skill output smoke script", [
    "scripts/verify-skill-output-smoke.mjs",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-skill-output-smoke.mjs:repotutor-skill-output-smoke-",
    "scripts/verify-skill-output-smoke.mjs:packages/core/tests/fixtures/simple-ts-app",
    "scripts/verify-skill-output-smoke.mjs:--no-codex",
    "scripts/verify-skill-output-smoke.mjs:\"study\",",
    "scripts/verify-skill-output-smoke.mjs:\"resume\",",
    "scripts/verify-skill-output-smoke.mjs:\"open\",",
    "scripts/verify-skill-output-smoke.mjs:\"quiz\",",
    "scripts/verify-skill-output-smoke.mjs:dailySummaryHtml",
    "scripts/verify-skill-output-smoke.mjs:teachingWorkspaceHtml",
    "scripts/verify-skill-output-smoke.mjs:verificationOk",
    "scripts/verify-skill-output-smoke.mjs:verificationCheckedRequiredArtifacts",
    "scripts/verify-skill-output-smoke.mjs:wrongNotesHtml",
    "scripts/verify-skill-output-smoke.mjs:wrongNotesMarkdown",
    "scripts/verify-skill-output-smoke.mjs:learningRecord",
    "scripts/verify-skill-output-smoke.mjs:reviewGuidance",
    "package.json:verify:skill-output",
    "README.md:pnpm verify:skill-output",
    "cli skill output smoke script",
    "--iterations 430"
  ]),
  check("codex skill wrapper fallback smoke", [
    "scripts/verify-skill-wrapper-smoke.mjs",
    "skills/repo-tutor/scripts/repo-tutor-study.sh",
    ".agents/skills/repo-tutor/scripts/repo-tutor-study.sh",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-skill-wrapper-smoke.mjs:repotutor-skill-wrapper-smoke-",
    "scripts/verify-skill-wrapper-smoke.mjs:PATH without repo-tutor",
    "scripts/verify-skill-wrapper-smoke.mjs:REPOTUTOR_REPO_ROOT",
    "scripts/verify-skill-wrapper-smoke.mjs:fallback-with-REPOTUTOR_REPO_ROOT",
    "scripts/verify-skill-wrapper-smoke.mjs:source-skill",
    "scripts/verify-skill-wrapper-smoke.mjs:agent-skill-mirror",
    "scripts/verify-skill-wrapper-smoke.mjs:pnpm --silent --dir \\\"$repo_root\\\" -w build:runtime-deps",
    "scripts/verify-skill-wrapper-smoke.mjs:pnpm --silent --dir \\\"$repo_root\\\" --filter @repotutor/cli exec tsx src/index.ts study",
    "scripts/verify-skill-wrapper-smoke.mjs:teachingWorkspaceHtml",
    "scripts/verify-skill-wrapper-smoke.mjs:learnerGoalAlignmentHtml",
    "scripts/verify-skill-wrapper-smoke.mjs:verificationOk",
    "scripts/verify-skill-wrapper-smoke.mjs:verificationCheckedRequiredArtifacts",
    "scripts/verify-skill-wrapper-smoke.mjs:source snapshot still present",
    "skills/repo-tutor/scripts/repo-tutor-study.sh:pnpm --silent --dir \"$repo_root\" -w build:runtime-deps",
    "skills/repo-tutor/scripts/repo-tutor-study.sh:pnpm --silent --dir \"$repo_root\" --filter @repotutor/cli exec tsx src/index.ts study",
    ".agents/skills/repo-tutor/scripts/repo-tutor-study.sh:pnpm --silent --dir \"$repo_root\" -w build:runtime-deps",
    ".agents/skills/repo-tutor/scripts/repo-tutor-study.sh:pnpm --silent --dir \"$repo_root\" --filter @repotutor/cli exec tsx src/index.ts study",
    "package.json:verify:skill-wrapper",
    "README.md:pnpm verify:skill-wrapper",
    "codex skill wrapper fallback smoke",
    "--iterations 437"
  ]),
  check("desktop sidecar quiz smoke script", [
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "scripts/verify-desktop-sidecar-smoke.mjs",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/sidecar/bridge.ts:method: z.literal(\"quiz\")",
    "apps/desktop-tauri/sidecar/bridge.ts:if (request.method === \"quiz\")",
    "apps/desktop-tauri/sidecar/bridge.ts:loadStudyHtmlInput(sessionPath)",
    "apps/desktop-tauri/sidecar/bridge.ts:scoreQuizAttempt(sessionPath, answers, htmlInput)",
    "apps/desktop-tauri/sidecar/bridge.ts:findQuizLearningRecord(sessionPath, attempt.attemptId)",
    "apps/desktop-tauri/sidecar/bridge.ts:wrongNotesHtml",
    "apps/desktop-tauri/sidecar/bridge.ts:wrongNotesMarkdown",
    "apps/desktop-tauri/sidecar/bridge.ts:reviewGuidance",
    "apps/desktop-tauri/src-tauri/src/lib.rs:json!({ \"sessionPath\": session_path.clone(), \"answers\": answers.clone() })",
    "scripts/verify-desktop-sidecar-smoke.mjs:repotutor-desktop-sidecar-smoke-",
    "scripts/verify-desktop-sidecar-smoke.mjs:scripts/build-desktop-sidecar-bundle.mjs",
    "scripts/verify-desktop-sidecar-smoke.mjs:sidecar(\"study\"",
    "scripts/verify-desktop-sidecar-smoke.mjs:sidecar(\"list\"",
    "scripts/verify-desktop-sidecar-smoke.mjs:sidecar(\"quiz\"",
    "scripts/verify-desktop-sidecar-smoke.mjs:sidecar(\"sourcePrunePlan\"",
    "scripts/verify-desktop-sidecar-smoke.mjs:sourceStillPresent",
    "package.json:verify:desktop-sidecar",
    "README.md:pnpm verify:desktop-sidecar",
    "desktop sidecar quiz smoke script",
    "--iterations 431"
  ]),
  check("desktop sidecar study verification parity", [
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "apps/desktop-tauri/src/App.tsx",
    "scripts/verify-desktop-sidecar-smoke.mjs",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/sidecar/bridge.ts:session-verification-report.json",
    "apps/desktop-tauri/sidecar/bridge.ts:learnerGoalAlignmentHtml",
    "apps/desktop-tauri/sidecar/bridge.ts:verificationOk",
    "apps/desktop-tauri/sidecar/bridge.ts:verificationReport",
    "apps/desktop-tauri/sidecar/bridge.ts:verificationMarkdown",
    "apps/desktop-tauri/sidecar/bridge.ts:verificationHtml",
    "apps/desktop-tauri/sidecar/bridge.ts:verificationCheckedRequiredArtifacts",
    "apps/desktop-tauri/sidecar/bridge.ts:verificationChecks",
    "apps/desktop-tauri/src-tauri/src/lib.rs:learner_goal_alignment_html: Option<String>",
    "apps/desktop-tauri/src-tauri/src/lib.rs:verification_ok: Option<bool>",
    "apps/desktop-tauri/src-tauri/src/lib.rs:verification_report: Option<String>",
    "apps/desktop-tauri/src-tauri/src/lib.rs:verification_checked_required_artifacts: Option<u32>",
    "apps/desktop-tauri/src/App.tsx:verificationOk?: boolean",
    "apps/desktop-tauri/src/App.tsx:세션 검증",
    "apps/desktop-tauri/src/App.tsx:검증 리포트",
    "scripts/verify-desktop-sidecar-smoke.mjs:study.verificationOk === true",
    "scripts/verify-desktop-sidecar-smoke.mjs:study.verificationCheckedRequiredArtifacts",
    "desktop sidecar study verification parity",
    "--iterations 432"
  ]),
  check("desktop session resume parity", [
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "apps/desktop-tauri/src/App.tsx",
    "scripts/verify-desktop-sidecar-smoke.mjs",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/sidecar/bridge.ts:method: z.literal(\"resume\")",
    "apps/desktop-tauri/sidecar/bridge.ts:if (request.method === \"resume\")",
    "apps/desktop-tauri/sidecar/bridge.ts:studyResponseFromSessionRoot",
    "apps/desktop-tauri/sidecar/bridge.ts:session.json",
    "apps/desktop-tauri/src-tauri/src/lib.rs:fn resume_session",
    "apps/desktop-tauri/src-tauri/src/lib.rs:call_sidecar(\"resume\"",
    "apps/desktop-tauri/src-tauri/src/lib.rs:.args([\"resume\", &session_path, \"--format\", \"json\"])",
    "apps/desktop-tauri/src-tauri/src/lib.rs:resume_session,",
    "apps/desktop-tauri/src-tauri/src/lib.rs:list_sessions,",
    "apps/desktop-tauri/src/App.tsx:async function selectSession",
    "apps/desktop-tauri/src/App.tsx:invoke<StudyResponse>(\"resume_session\"",
    "apps/desktop-tauri/src/App.tsx:세션 재개됨",
    "scripts/verify-desktop-sidecar-smoke.mjs:sidecar(\"resume\"",
    "scripts/verify-desktop-sidecar-smoke.mjs:resumed.verificationOk === true",
    "scripts/verify-desktop-sidecar-smoke.mjs:resumed.quizQuestions === study.quizQuestions",
    "desktop session resume parity",
    "--iterations 433"
  ]),
  check("desktop compiled sidecar node smoke", [
    "scripts/verify-desktop-sidecar-smoke.mjs",
    "apps/desktop-tauri/tsconfig.node.json",
    "apps/desktop-tauri/package.json",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-desktop-sidecar-smoke.mjs:compiledSidecar",
    "scripts/verify-desktop-sidecar-smoke.mjs:apps/desktop-tauri/sidecar-dist/sidecar/bridge.js",
    "scripts/verify-desktop-sidecar-smoke.mjs:scripts/build-desktop-sidecar-bundle.mjs",
    "scripts/verify-desktop-sidecar-smoke.mjs:run(\"node\", [compiledSidecar]",
    "scripts/verify-desktop-sidecar-smoke.mjs:compiled desktop sidecar bridge",
    "apps/desktop-tauri/tsconfig.node.json:sidecar-dist",
    "apps/desktop-tauri/package.json:node ../../scripts/build-desktop-sidecar-bundle.mjs",
    "apps/desktop-tauri/src-tauri/src/lib.rs:resolve_node_runtime()",
    "apps/desktop-tauri/src-tauri/src/lib.rs:REPOTUTOR_SIDECAR",
    "desktop compiled sidecar node smoke",
    "--iterations 434"
  ]),
  check("desktop rust call_sidecar compiled bridge smoke", [
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "scripts/verify-desktop-rust-sidecar-smoke.mjs",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src-tauri/src/lib.rs:#[ignore = \"requires compiled desktop sidecar path via REPOTUTOR_SIDECAR\"]",
    "apps/desktop-tauri/src-tauri/src/lib.rs:call_sidecar_drives_compiled_bridge",
    "apps/desktop-tauri/src-tauri/src/lib.rs:std::env::var(\"REPOTUTOR_SIDECAR\")",
    "apps/desktop-tauri/src-tauri/src/lib.rs:let study = call_sidecar(",
    "apps/desktop-tauri/src-tauri/src/lib.rs:call_sidecar(\"list\"",
    "apps/desktop-tauri/src-tauri/src/lib.rs:call_sidecar(\"resume\"",
    "apps/desktop-tauri/src-tauri/src/lib.rs:let attempt = call_sidecar(",
    "apps/desktop-tauri/src-tauri/src/lib.rs:call_sidecar(\"sourcePrunePlan\"",
    "scripts/verify-desktop-rust-sidecar-smoke.mjs:REPOTUTOR_SIDECAR",
    "scripts/verify-desktop-rust-sidecar-smoke.mjs:compiledSidecar",
    "scripts/verify-desktop-rust-sidecar-smoke.mjs:cargo",
    "scripts/verify-desktop-rust-sidecar-smoke.mjs:call_sidecar_drives_compiled_bridge",
    "scripts/verify-desktop-rust-sidecar-smoke.mjs:apps/desktop-tauri/sidecar-dist/sidecar/bridge.js",
    "package.json:verify:desktop-rust-sidecar",
    "README.md:pnpm verify:desktop-rust-sidecar",
    "desktop rust call_sidecar compiled bridge smoke",
    "--iterations 435"
  ]),
  check("desktop tauri command compiled bridge smoke", [
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "scripts/verify-desktop-sidecar-smoke.mjs",
    "scripts/verify-desktop-tauri-commands-smoke.mjs",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src-tauri/src/lib.rs:REPOTUTOR_STUDIES_ROOT",
    "apps/desktop-tauri/src-tauri/src/lib.rs:fn add_studies_root_param",
    "apps/desktop-tauri/src-tauri/src/lib.rs:tauri_commands_drive_compiled_bridge",
    "apps/desktop-tauri/src-tauri/src/lib.rs:study_source(",
    "apps/desktop-tauri/src-tauri/src/lib.rs:list_sessions()",
    "apps/desktop-tauri/src-tauri/src/lib.rs:resume_session(",
    "apps/desktop-tauri/src-tauri/src/lib.rs:load_quiz(",
    "apps/desktop-tauri/src-tauri/src/lib.rs:submit_quiz(",
    "apps/desktop-tauri/src-tauri/src/lib.rs:source_prune_plan(",
    "apps/desktop-tauri/src-tauri/src/lib.rs:apply_source_prune(study.path.clone(), \"WRONG\".to_string()).is_err()",
    "apps/desktop-tauri/sidecar/bridge.ts:listRowsFromSessions",
    "apps/desktop-tauri/sidecar/bridge.ts:mode: session.studyMode",
    "apps/desktop-tauri/sidecar/bridge.ts:path: session.outputPaths.root",
    "scripts/verify-desktop-sidecar-smoke.mjs:listedRow.mode === \"quick\"",
    "scripts/verify-desktop-sidecar-smoke.mjs:listedRow.path === study.path",
    "scripts/verify-desktop-tauri-commands-smoke.mjs:tauri_commands_drive_compiled_bridge",
    "scripts/verify-desktop-tauri-commands-smoke.mjs:REPOTUTOR_STUDIES_ROOT",
    "scripts/verify-desktop-tauri-commands-smoke.mjs:apply_source_prune token guard",
    "scripts/verify-desktop-tauri-commands-smoke.mjs:source snapshot still present",
    "package.json:verify:desktop-tauri-commands",
    "README.md:pnpm verify:desktop-tauri-commands",
    "desktop tauri command compiled bridge smoke",
    "--iterations 438"
  ]),
  check("desktop ui mock invoke smoke", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/App.ui-smoke.tsx",
    "apps/desktop-tauri/src/tauri-api.ts",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "apps/desktop-tauri/src/App.tsx:import { convertFileSrc, invoke } from \"./tauri-api.js\"",
    "apps/desktop-tauri/src/tauri-api.ts:__REPOTUTOR_STUDIO_TEST_API__",
    "apps/desktop-tauri/src/tauri-api.ts:tauriInvoke<T>(command, args)",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:happy-dom",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:domWindow.__REPOTUTOR_STUDIO_TEST_API__",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:study_source",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:resume_session",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:source_prune_plan",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:load_quiz",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:submit_quiz",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:최근 제출: 100점",
    "apps/desktop-tauri/src/App.ui-smoke.tsx:소스 보존 상태: 정리 검토 후보",
    "package.json:verify:desktop-ui",
    "README.md:pnpm verify:desktop-ui",
    "desktop ui mock invoke smoke",
    "--iterations 436"
  ]),
  check("user entrypoint parity gate", [
    "scripts/verify-source-intake-smoke.mjs",
    "scripts/verify-github-study-smoke.mjs",
    "scripts/verify-zip-study-smoke.mjs",
    "scripts/verify-source-mode-study-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs",
    "scripts/verify-skill-output-smoke.mjs",
    "scripts/verify-skill-wrapper-smoke.mjs",
    "scripts/verify-desktop-app-build-smoke.mjs",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs",
    "scripts/verify-goal-completion-smoke.mjs",
    "scripts/verify-desktop-sidecar-smoke.mjs",
    "scripts/verify-desktop-tauri-commands-smoke.mjs",
    "scripts/verify-desktop-sidecar-discovery-smoke.mjs",
    "apps/desktop-tauri/src/App.ui-smoke.tsx",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-entrypoints-smoke.mjs:source-intake-modes",
    "scripts/verify-entrypoints-smoke.mjs:github-study",
    "scripts/verify-entrypoints-smoke.mjs:zip-study",
    "scripts/verify-entrypoints-smoke.mjs:source-mode-study",
    "scripts/verify-entrypoints-smoke.mjs:headless-cli",
    "scripts/verify-entrypoints-smoke.mjs:codex-skill-wrapper",
    "scripts/verify-entrypoints-smoke.mjs:desktop-sidecar",
    "scripts/verify-entrypoints-smoke.mjs:desktop-tauri-commands",
    "scripts/verify-entrypoints-smoke.mjs:desktop-sidecar-discovery",
    "scripts/verify-entrypoints-smoke.mjs:desktop-bundled-sidecar",
    "scripts/verify-entrypoints-smoke.mjs:desktop-bundled-rust-sidecar",
    "scripts/verify-entrypoints-smoke.mjs:desktop-react-ui",
    "scripts/verify-entrypoints-smoke.mjs:goal-completion-map",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-source-intake-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-github-study-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-zip-study-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-source-mode-study-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-skill-output-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-skill-wrapper-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-desktop-sidecar-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-desktop-tauri-commands-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-desktop-sidecar-discovery-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-desktop-app-build-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-desktop-bundled-sidecar-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:node scripts/verify-goal-completion-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs:GitHub URL",
    "scripts/verify-entrypoints-smoke.mjs:GitHub branch URL input can clone with safe shallow branch arguments and produce a complete study session",
    "scripts/verify-entrypoints-smoke.mjs:ZIP source input can produce a complete study session after extraction",
    "scripts/verify-entrypoints-smoke.mjs:SKILL.md and CLI-Anything source inputs can produce complete study sessions without executing target commands",
    "scripts/verify-entrypoints-smoke.mjs:SKILL.md folder",
    "scripts/verify-entrypoints-smoke.mjs:CLI-Anything target",
    "scripts/verify-entrypoints-smoke.mjs:REPOTUTOR_SIDECAR unset",
    "scripts/verify-entrypoints-smoke.mjs:self-contained Node sidecar",
    "scripts/verify-entrypoints-smoke.mjs:Codex-enabled fail-closed path",
    "scripts/verify-entrypoints-smoke.mjs:default Codex-enabled SDK attempt",
    "scripts/verify-entrypoints-smoke.mjs:bundled resource sidecar through Rust commands",
    "scripts/verify-entrypoints-smoke.mjs:desktop-app-build",
    "scripts/verify-entrypoints-smoke.mjs:src/App.ui-smoke.tsx",
    "scripts/verify-entrypoints-smoke.mjs:source snapshot still present",
    "scripts/verify-entrypoints-smoke.mjs:DELETE-SOURCE-SNAPSHOT",
    "scripts/verify-entrypoints-smoke.mjs:prompt requirements map to concrete CLI skill and direct app verification artifacts",
    "package.json:verify:entrypoints",
    "package.json:verify:goal-completion",
    "README.md:pnpm verify:entrypoints",
    "README.md:pnpm verify:goal-completion",
    "user entrypoint parity gate",
    "--iterations 449"
  ]),
  check("prompt to artifact completion smoke", [
    "scripts/verify-goal-completion-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs",
    "README.md",
    "docs/product/learning-mission.md",
    "docs/product/storage-model.md",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-goal-completion-smoke.mjs:vibe-coding-learning-app",
    "scripts/verify-goal-completion-smoke.mjs:source-input-modes",
    "scripts/verify-goal-completion-smoke.mjs:cli-and-skill-entrypoint",
    "scripts/verify-goal-completion-smoke.mjs:direct-app-entrypoint",
    "scripts/verify-goal-completion-smoke.mjs:learning-artifacts",
    "scripts/verify-goal-completion-smoke.mjs:codex-default-fail-closed",
    "scripts/verify-goal-completion-smoke.mjs:source-safety-and-retention",
    "scripts/verify-goal-completion-smoke.mjs:single-entrypoint-parity-gate",
    "scripts/verify-goal-completion-smoke.mjs:promptRequirements",
    "scripts/verify-goal-completion-smoke.mjs:pnpm verify:entrypoints",
    "scripts/verify-entrypoints-smoke.mjs:goal-completion-map",
    "README.md:pnpm verify:goal-completion",
    "package.json:verify:goal-completion",
    "prompt to artifact completion smoke",
    "--iterations 449"
  ]),
  check("github study end-to-end smoke", [
    "packages/core/src/intake.ts",
    "packages/core/src/storage.ts",
    "packages/core/src/github-study.test.ts",
    "scripts/verify-github-study-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs",
    "README.md",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/intake.ts:parseGitHubUrl",
    "packages/core/src/storage.ts:git\", args",
    "packages/core/src/storage.ts:args.push(\"--branch\", source.branch)",
    "packages/core/src/github-study.test.ts:runs a GitHub branch URL through clone and the full study pipeline without network",
    "packages/core/src/github-study.test.ts:git clone --depth 1 --branch",
    "packages/core/src/github-study.test.ts:sourceType).toBe(\"github\")",
    "packages/core/src/github-study.test.ts:feature-smoke",
    "packages/core/src/github-study.test.ts:verifyStudySessionArtifacts",
    "packages/core/src/github-study.test.ts:.env",
    "scripts/verify-github-study-smoke.mjs:vitest",
    "scripts/verify-github-study-smoke.mjs:packages/core/src/github-study.test.ts",
    "scripts/verify-github-study-smoke.mjs:GitHub branch URL",
    "scripts/verify-github-study-smoke.mjs:git clone --depth 1 --branch",
    "scripts/verify-github-study-smoke.mjs:no network dependency in smoke",
    "scripts/verify-entrypoints-smoke.mjs:github-study",
    "README.md:pnpm verify:github-study",
    "package.json:verify:github-study",
    "github study end-to-end smoke",
    "--iterations 448"
  ]),
  check("skill and cli-anything study smoke", [
    "packages/core/src/intake.ts",
    "packages/core/src/source-mode-study.test.ts",
    "scripts/verify-source-mode-study-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs",
    "README.md",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/intake.ts:SKILL.md",
    "packages/core/src/intake.ts:agent-harness",
    "packages/core/src/source-mode-study.test.ts:runs SKILL.md and CLI-Anything targets through complete study sessions without executing target code",
    "packages/core/src/source-mode-study.test.ts:sourceType).toBe(\"skill\")",
    "packages/core/src/source-mode-study.test.ts:sourceType).toBe(\"cli-anything\")",
    "packages/core/src/source-mode-study.test.ts:cli-anything-executed.txt",
    "packages/core/src/source-mode-study.test.ts:agent-harness/manifest.json",
    "packages/core/src/source-mode-study.test.ts:verifyStudySessionArtifacts",
    "scripts/verify-source-mode-study-smoke.mjs:vitest",
    "scripts/verify-source-mode-study-smoke.mjs:packages/core/src/source-mode-study.test.ts",
    "scripts/verify-source-mode-study-smoke.mjs:SKILL.md folder",
    "scripts/verify-source-mode-study-smoke.mjs:CLI-Anything target",
    "scripts/verify-source-mode-study-smoke.mjs:no analyzed project command execution",
    "scripts/verify-entrypoints-smoke.mjs:source-mode-study",
    "README.md:pnpm verify:source-mode-study",
    "package.json:verify:source-mode-study",
    "skill and cli-anything study smoke",
    "--iterations 447"
  ]),
  check("zip study end-to-end smoke", [
    "packages/core/src/storage.ts",
    "packages/core/src/zip-study.test.ts",
    "scripts/verify-zip-study-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs",
    "README.md",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/storage.ts:extractZip",
    "packages/core/src/zip-study.test.ts:runs an advertised ZIP input through the full study pipeline after extraction",
    "packages/core/src/zip-study.test.ts:source: \"archive-app.zip\"",
    "packages/core/src/zip-study.test.ts:sourceType).toBe(\"zip\")",
    "packages/core/src/zip-study.test.ts:verifyStudySessionArtifacts",
    "packages/core/src/zip-study.test.ts:analysis/quiz.json",
    "packages/core/src/zip-study.test.ts:html/index.html",
    "packages/core/src/zip-study.test.ts:.env",
    "scripts/verify-zip-study-smoke.mjs:vitest",
    "scripts/verify-zip-study-smoke.mjs:packages/core/src/zip-study.test.ts",
    "scripts/verify-zip-study-smoke.mjs:ZIP path",
    "scripts/verify-zip-study-smoke.mjs:extract-zip",
    "scripts/verify-zip-study-smoke.mjs:runStudy",
    "scripts/verify-zip-study-smoke.mjs:verifyStudySessionArtifacts",
    "scripts/verify-entrypoints-smoke.mjs:zip-study",
    "README.md:pnpm verify:zip-study",
    "package.json:verify:zip-study",
    "zip study end-to-end smoke",
    "--iterations 446"
  ]),
  check("source intake advertised modes smoke", [
    "packages/core/src/intake.ts",
    "packages/core/src/intake.test.ts",
    "scripts/verify-source-intake-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs",
    "README.md",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/intake.ts:parseGitHubUrl",
    "packages/core/src/intake.ts:sourceType === \"zip\"",
    "packages/core/src/intake.ts:SKILL.md",
    "packages/core/src/intake.ts:agent-harness",
    "packages/core/src/intake.test.ts:classifies the advertised source input modes",
    "packages/core/src/intake.test.ts:sourceType: \"github\"",
    "packages/core/src/intake.test.ts:sourceType: \"local\"",
    "packages/core/src/intake.test.ts:sourceType: \"zip\"",
    "packages/core/src/intake.test.ts:sourceType: \"skill\"",
    "packages/core/src/intake.test.ts:sourceType: \"cli-anything\"",
    "scripts/verify-source-intake-smoke.mjs:vitest",
    "scripts/verify-source-intake-smoke.mjs:src/intake.test.ts",
    "scripts/verify-source-intake-smoke.mjs:GitHub URL",
    "scripts/verify-source-intake-smoke.mjs:CLI-Anything target",
    "scripts/verify-entrypoints-smoke.mjs:source-intake-modes",
    "README.md:pnpm verify:source-intake",
    "package.json:verify:source-intake",
    "source intake advertised modes smoke",
    "--iterations 445"
  ]),
  check("desktop tauri no-bundle app build smoke", [
    "scripts/verify-desktop-app-build-smoke.mjs",
    "apps/desktop-tauri/package.json",
    "apps/desktop-tauri/src-tauri/tauri.conf.json",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-desktop-app-build-smoke.mjs:tauri",
    "scripts/verify-desktop-app-build-smoke.mjs:build",
    "scripts/verify-desktop-app-build-smoke.mjs:--no-bundle",
    "scripts/verify-desktop-app-build-smoke.mjs:--ci",
    "scripts/verify-desktop-app-build-smoke.mjs:beforeBuildCommand",
    "scripts/verify-desktop-app-build-smoke.mjs:frontendDist",
    "scripts/verify-desktop-app-build-smoke.mjs:target/release/repotutor-studio",
    "apps/desktop-tauri/src-tauri/tauri.conf.json:beforeBuildCommand",
    "apps/desktop-tauri/src-tauri/tauri.conf.json:frontendDist",
    "package.json:verify:desktop-app-build",
    "README.md:pnpm verify:desktop-app-build",
    "desktop tauri no-bundle app build smoke",
    "--iterations 440"
  ]),
  check("desktop sidecar default discovery smoke", [
    "scripts/verify-desktop-sidecar-discovery-smoke.mjs",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "scripts/verify-entrypoints-smoke.mjs",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-desktop-sidecar-discovery-smoke.mjs:tauri_commands_discover_compiled_bridge_without_env",
    "scripts/verify-desktop-sidecar-discovery-smoke.mjs:REPOTUTOR_SIDECAR",
    "scripts/verify-desktop-sidecar-discovery-smoke.mjs:apps/desktop-tauri/sidecar-dist/sidecar/bridge.js",
    "apps/desktop-tauri/src-tauri/src/lib.rs:sidecar_path_override",
    "apps/desktop-tauri/src-tauri/src/lib.rs:resolve_sidecar_path",
    "apps/desktop-tauri/src-tauri/src/lib.rs:default_sidecar_candidates",
    "apps/desktop-tauri/src-tauri/src/lib.rs:sidecar-dist/sidecar/bridge.js",
    "apps/desktop-tauri/src-tauri/src/lib.rs:tauri_commands_discover_compiled_bridge_without_env",
    "scripts/verify-entrypoints-smoke.mjs:desktop-sidecar-discovery",
    "package.json:verify:desktop-sidecar-discovery",
    "README.md:pnpm verify:desktop-sidecar-discovery",
    "desktop sidecar default discovery smoke",
    "--iterations 441"
  ]),
  check("desktop bundled sidecar resource smoke", [
    "scripts/build-desktop-sidecar-bundle.mjs",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs",
    "scripts/verify-desktop-sidecar-smoke.mjs",
    "apps/desktop-tauri/package.json",
    "apps/desktop-tauri/src-tauri/tauri.conf.json",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "scripts/verify-entrypoints-smoke.mjs",
    "package.json",
    "README.md",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/build-desktop-sidecar-bundle.mjs:esbuild",
    "scripts/build-desktop-sidecar-bundle.mjs:createRequire",
    "scripts/build-desktop-sidecar-bundle.mjs:packages: \"bundle\"",
    "scripts/build-desktop-sidecar-bundle.mjs:@openai/codex-sdk",
    "scripts/build-desktop-sidecar-bundle.mjs:unresolvedWorkspaceImports",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:--bundles",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:RepoTutor Studio.app",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:Contents/Resources/sidecar-dist/sidecar/bridge.js",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:self-contained @repotutor workspace code",
    "scripts/verify-desktop-sidecar-smoke.mjs:scripts/build-desktop-sidecar-bundle.mjs",
    "apps/desktop-tauri/package.json:node ../../scripts/build-desktop-sidecar-bundle.mjs",
    "apps/desktop-tauri/src-tauri/tauri.conf.json:resources",
    "apps/desktop-tauri/src-tauri/tauri.conf.json:../sidecar-dist/sidecar/bridge.js",
    "apps/desktop-tauri/src-tauri/tauri.conf.json:sidecar-dist/sidecar/bridge.js",
    "apps/desktop-tauri/src-tauri/src/lib.rs:../Resources/sidecar-dist/sidecar/bridge.js",
    "scripts/verify-entrypoints-smoke.mjs:desktop-bundled-sidecar",
    "package.json:verify:desktop-bundled-sidecar",
    "README.md:pnpm verify:desktop-bundled-sidecar",
    "desktop bundled sidecar resource smoke",
    "--iterations 442"
  ]),
  check("desktop bundled codex enabled fail closed smoke", [
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs",
    "scripts/verify-entrypoints-smoke.mjs",
    "README.md",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:enableCodex: true",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:codex/prompts.jsonl",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:codex/events.jsonl",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:vibe-coding learner",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:should attempt the SDK path instead of skipping it",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:success\" || status === \"failed",
    "scripts/verify-desktop-bundled-sidecar-smoke.mjs:Codex-enabled bundled sidecar study should complete",
    "scripts/verify-entrypoints-smoke.mjs:Codex-enabled fail-closed path",
    "README.md:pnpm verify:desktop-bundled-sidecar",
    "README.md:codex/prompts.jsonl",
    "README.md:codex/events.jsonl",
    "package.json:verify:desktop-bundled-sidecar",
    "desktop bundled codex enabled fail closed smoke",
    "--iterations 443"
  ]),
  check("desktop bundled rust sidecar resource discovery smoke", [
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "scripts/verify-entrypoints-smoke.mjs",
    "README.md",
    "package.json",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:--bundles",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:RepoTutor Studio.app",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:Contents/Resources/sidecar-dist/sidecar/bridge.js",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:tauri_commands_discover_app_resource_sidecar_without_env",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:REPOTUTOR_SIDECAR unset",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:study_source",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:list_sessions",
    "scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs:resume_session",
    "apps/desktop-tauri/src-tauri/src/lib.rs:current_exe_path",
    "apps/desktop-tauri/src-tauri/src/lib.rs:REPOTUTOR_TEST_CURRENT_EXE",
    "apps/desktop-tauri/src-tauri/src/lib.rs:../Resources/sidecar-dist/sidecar/bridge.js",
    "apps/desktop-tauri/src-tauri/src/lib.rs:tauri_commands_discover_app_resource_sidecar_without_env",
    "scripts/verify-entrypoints-smoke.mjs:desktop-bundled-rust-sidecar",
    "scripts/verify-entrypoints-smoke.mjs:bundled resource sidecar through Rust commands",
    "README.md:pnpm verify:desktop-bundled-rust-sidecar",
    "package.json:verify:desktop-bundled-rust-sidecar",
    "desktop bundled rust sidecar resource discovery smoke",
    "--iterations 444"
  ]),
  check("tauri standalone mode", [
    "apps/desktop-tauri/src/App.tsx",
    "packages/shared/src/report-targets.ts",
    "scripts/verify-learning-targets.mjs",
    "package.json",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/tauri.conf.json"
  ], ["study_source", "enableCodex", "enable_codex", "Codex SDK", "--no-codex", "REPOTUTOR_SIDECAR", "Node sidecar", "CORE_LEARNING_REPORT_TARGETS", "target-grid", "report-preview", "repo-tutor open <session> --target", "overview", "language", "daily-summary", "architecture-principle-playbook", "source-to-build-interview", "similar-app-transfer-map", "learner-goal-alignment", "ai-implementation-loop", "learner-role-contract", "ai-output-review-rubric", "vibe-coding-mastery-checklist", "vibe-coding-implementation-brief", "vibe-coding-start", "learner-role-contract", "ai-output-review-rubric", "vibe-coding-mastery-checklist", "vibe-coding-implementation-brief", "vibe-coding-prompt-pack", "learning-path", "glossary", "rebuild", "verify:learning-targets", "verify-learning-targets.mjs", "openTargetEntries", "cli-open-target-missing", "desktop-learning-target-surface-missing"]),
  check("date session storage", [
    "packages/core/src/storage.ts",
    "packages/core/src/pipeline.ts",
    "packages/shared/src/path-utils.ts"
  ], ["studiesRoot", "sessionFolderName", "todayIsoDate", "session.json"]),
  check("static analyzer and safe intake", [
    "packages/core/src/intake.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/fs-utils.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/storage.ts"
  ], ["git", "clone", "--depth", "isSecretLikePath", "readTextIfSafe", "sourceBaseDir"]),
  check("lesson generation outputs", [
    "packages/core/src/pipeline.ts",
    "packages/core/src/evidence.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/shared/src/schemas.ts"
  ], ["PurposeReport", "ArchitectureReport", "vibeCodingLens", "sourceBoundaries", "Vibe-Coding Architecture Compass", "Vibe-Coding Architecture Lens", "FolderLesson", "forestViewSummary", "aiImplementationBrief", "vibeCodingPrompts", "verificationQuestions", "Vibe-Coding Folder Map", "AI Implementation Brief", "Verification Questions", "data-folder-role", "나는 전통 개발자가 아니라 바이브코딩 개발자야", "FileLesson", "sourceRoleSummary", "architectureResponsibility", "aiPromptBrief", "Vibe-Coding Source Role Map", "Source Role Summary", "AI Prompt Brief", "data-file-role", "FlowReport", "GlossaryTerm", "AI build prompt", "PRD", "SDD", "TDD", "acceptance criteria", "context pack", "architecture responsibility", "vertical slice", "verification boundary", "source evidence", "Vibe-Coding Terms", "data-glossary-difficulty", "RebuildRoadmap", "vibeCodingMethod", "sdd-first", "test-driven", "aiPrompt", "architectureRationale", "sourceRoleFocus", "verificationPrompts", "Vibe-Coding Rebuild Roadmap", "AI 작업 지시 프롬프트", "Source Role Focus", "data-vibe-method", "EvidenceIndexReport", "evidence-index-report.json", "session-verification-report.json", "session-verification.md", "session-verification.html", "vibe-coding-start.md", "바이브코딩 우선 시작", "AI에게 줄 설명과 검증 기준", "renderSessionVerificationMarkdown", "verifyEvidenceIndexReport", "checkedLessonLinks", "missing-lesson-anchor", "sourceEvidence", "source-evidence", "source-link", "../source/", "원본 열기", "evidence.md", "evidence.html", "evidence-index-cards", "evidence-kind-toolbar", "data-evidence-kind-filter", "소스 근거", "evidenceBackedFiles", "evidenceCoverageRatio", "evidenceKindCounts", "filesWithoutEvidence", "소스 근거 종류", "context-pack-report.json", "context-pack.md", "context-pack.html", "ContextPackReportSchema", "contextPackReport", "contextPackSignals", "Repomix token counting git-aware ignore AI-friendly context pack output styles compression token budget split output MCP skill generation", "splitPlans", "Split Output Plan", "Context Pack Signals", "google-ai-studio-1mb", "mcp-handoff-report.json", "mcp-handoff.md", "mcp-handoff.html", "McpHandoffReportSchema", "mcpHandoffReport", "Codebase MCP getCodebase getRemoteCodebase saveCodebase tool handoff", "agent-memory-report.json", "agent-memory.md", "agent-memory.html", "AgentMemoryReportSchema", "agentMemoryReport", "Claude Code Obsidian Graphify persistent memory token-saving context navigation", "graph-query-report.json", "graph-query.md", "graph-query.html", "GraphQueryReportSchema", "graphQueryReport", "Graphify query path explain graph traversal command guide", "tutorial-abstraction-report.json", "tutorial-abstractions.md", "tutorial-abstractions.html", "TutorialAbstractionReportSchema", "tutorialAbstractionReport", "PocketFlow codebase tutorial identify abstractions analyze relationships order chapters", "decision-record-report.json", "decision-records.md", "decision-records.html", "DecisionRecordReportSchema", "decisionRecordReport", "Log4brains ADR docs-as-code status context decision consequences timeline package-specific records", "dependency-health-report.json", "dependency-health.md", "dependency-health.html", "DependencyHealthReportSchema", "dependencyHealthReport", "dependency-cruiser no-circular no-orphans forbidden rules dependency graph validation", "localDependencyEdges", "cycles", "orphanModules", "ruleViolations"]),
  check("quiz engine", [
    "packages/core/src/quiz.ts",
    "packages/shared/src/constants.ts"
  ], ["calculateQuizCount", "quick", "standard", "deep", "choices"]),
  check("wrong notes persistence", [
    "packages/core/src/quiz.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["wrong-notes.json", "wrong-notes.md", "wrong-notes.html", "mistakeReason", "복습 근거 확인", "wrong notes persistence", "--iterations 236"], {
    forbidden: [
      "packages/html/src/templates.ts:복습 완료"
    ]
  }),
  check("offline html export", [
    "packages/html/src/templates.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/quiz.ts",
    "packages/core/src/exporter.ts",
    "packages/core/src/session-verifier.ts",
    "apps/cli/src/index.ts",
    "packages/shared/src/schemas.ts"
  ], ["index.html", "vibe-coding-start.html", "data-source-pattern=\"vibe-coding-start\"", "vibe-coding-start-cards", "처음 15분", "원본 소스 내장", "architecture-principle-playbook.html", "아키텍처 원리", "문법 암기 대신 구조 판단", "source-to-build-interview.html", "소스-빌드 인터뷰", "소스에서 비슷한 앱 만들기 인터뷰", "내가 먼저 답할 질문", "AI에게 확인시킬 질문", "similar-app-transfer-map.html", "비슷한 앱 전이 지도", "그대로 가져갈 원리", "새 앱에 맞게 바꿀 결정", "검토 후 다듬을 전이 프롬프트", "learner-goal-alignment.html", "학습자 목표 정렬", "내 목표/PRD/이슈/프롬프트", "source-grounded gap", "ACCEPT_REVIEW / CLARIFY / REWRITE / BLOCK", "검토 후 다듬을 목표 정렬 프롬프트", "learner-role-contract.html", "학습자 역할 계약", "ai-output-review-rubric.html", "AI 산출물 검토", "vibe-coding-mastery-checklist.html", "바이브코딩 숙련도", "비슷한 앱 제작 준비도", "READY", "REVIEW", "BLOCKED", "vibe-coding-implementation-brief.html", "구현 브리프", "첫 vertical slice", "수락 기준", "검증 계획", "검토 후 다듬을 구현 프롬프트", "ai-prompt-readiness-checklist.html", "프롬프트 준비도", "검증 assertion", "source evidence", "ai-prompt-ab-lab.html", "프롬프트 A/B 랩", "source-retention-guide.html", "learning-path.html", "learning-path-step", "data-learning-primary", "기본 투어", "id=\"learning-step-${index + 1}\"", "learning-step-nav", "href=\"#learning-step-${index + 2}\"", "다음 단계", "이전 단계", "data-learning-step", "data-learning-step-complete", "data-reset-learning-progress", "data-learning-progress-summary", "learningProgress.clear()", "updateLearningProgressSummary", "진도 초기화", "근거 검토 표시 0 /", "근거 확인 후 검토 표시", "suggested-reads-report.json", "suggested-reads.md", "suggested-reads.html", "SuggestedReadsReportSchema", "suggestedReadsReport", "Repo Baby suggested_reads", "suggested-read-card", "추천 읽기", "data-source-pattern=\"Repo Baby\"", "runtime-environment-report.json", "runtime-environment.md", "runtime-environment.html", "RuntimeEnvironmentReportSchema", "runtimeEnvironmentReport", "docSmith Dockerfile and Docker Compose generation prompts", "mise dev tools env vars tasks mise.toml .mise.toml .tool-versions idiomatic version files mise install exec run doctor trust config hierarchy environments task_config includes mise-action", "toolVersionSignals", "environmentConfigSignals", "taskRunnerSignals", "Tool Version Signals", "Environment Config Signals", "Task Runner Signals", "runtime-env-card", "실행 환경", "data-source-pattern=\"docSmith mise\"", "interface-map-report.json", "interface-map.md", "interface-map.html", "InterfaceMapReportSchema", "interfaceMapReport", "repomap page routes GraphQL REST data flow analysis", "interface-map-card", "interface-source-link", "인터페이스 맵", "data-source-pattern=\"repomap\"", "symbol-map-report.json", "symbol-map.md", "symbol-map.html", "SymbolMapReportSchema", "symbolMapReport", "codebase-map AST-based functions classes constants index", "SCIP Code Intelligence Protocol definitions references implementations occurrences SymbolInformation relationships hover signatures diagnostics snapshot stats language indexers", "Tree-sitter incremental parser concrete syntax tree grammar.js tree-sitter.json node-types.json queries captures predicates highlights locals injections tags parse query test", "codeIntelligenceSignals", "syntaxParserSignals", "symbolNavigationPrompts", "syntaxQueryPrompts", "Code Intelligence Signals", "Syntax Parser Signals", "Symbol Navigation Prompts", "Syntax Query Prompts", "symbol-map-card", "symbol-source-link", "심볼 맵", "data-source-pattern=\"codebase-map\"", "api-reference-report.json", "api-reference.md", "api-reference.html", "ApiReferenceReportSchema", "apiReferenceReport", "API Reference", "api-reference-card", "api-reference-source-link", "data-source-pattern=\"TypeDoc\"", "TypeDoc entry points reflections ReflectionKind public API documentation export validation typedoc.json typedocOptions outputs html json emit plugin", "entryPoints", "publicSymbols", "exportWarnings", "typedocConfigSignals", "outputSignals", "validationSignals", "ReflectionKind", "context-pack-report.json", "context-pack.md", "context-pack.html", "ContextPackReportSchema", "contextPackReport", "contextPackSignals", "Repomix token counting git-aware ignore AI-friendly context pack output styles compression token budget split output MCP skill generation", "context-pack-card", "context-pack-source-link", "Context Pack", "Context Pack Signals", "Split Output Plan", "google-ai-studio-1mb", "data-source-pattern=\"Repomix\"", "mcp-handoff-report.json", "mcp-handoff.md", "mcp-handoff.html", "McpHandoffReportSchema", "mcpHandoffReport", "MCP Handoff", "mcp-handoff-card", "data-source-pattern=\"codebase-mcp\"", "getCodebase", "getRemoteCodebase", "saveCodebase", "agent-memory-report.json", "agent-memory.md", "agent-memory.html", "AgentMemoryReportSchema", "agentMemoryReport", "Agent Memory", "agent-memory-card", "data-source-pattern=\"Obsidian Graphify\"", "project-context", "tokenSavings", "memoryNotes", "graph-query-report.json", "graph-query.md", "graph-query.html", "GraphQueryReportSchema", "graphQueryReport", "Graph Query", "graph-query-card", "data-source-pattern=\"Graphify\"", "graphify query", "graphify path", "graphify explain", "pathPrompts", "nodeExplanations", "tutorial-abstraction-report.json", "tutorial-abstractions.md", "tutorial-abstractions.html", "TutorialAbstractionReportSchema", "tutorialAbstractionReport", "Tutorial Abstractions", "tutorial-abstraction-card", "data-source-pattern=\"PocketFlow\"", "PocketFlow codebase tutorial identify abstractions analyze relationships order chapters", "chapterOrder", "relationships", "decision-record-report.json", "decision-records.md", "decision-records.html", "DecisionRecordReportSchema", "decisionRecordReport", "Decision Records", "decision-record-card", "data-source-pattern=\"Log4brains\"", "Log4brains ADR docs-as-code status context decision consequences timeline package-specific records", "dependency-health-report.json", "dependency-health.md", "dependency-health.html", "DependencyHealthReportSchema", "dependencyHealthReport", "dependency-cruiser no-circular no-orphans forbidden rules dependency graph validation", "localDependencyEdges", "cycles", "orphanModules", "ruleViolations", "Dependency Health", "dependency-health-card", "data-source-pattern=\"dependency-cruiser\"", "no-circular", "no-orphans", "statusCounts", "packageScopes", "Positive Consequences", "packages/html/src/templates.ts:repotutor:learning-path", "learningProgress", "localStorage", "data-source-pattern=\"CodeTour\"", "assets/learning-path.tour.json", "learningPathTourJson", "RepoTutor Learning Path", "https://aka.ms/codetour-schema", "isPrimary", "stepMarker", "when", "directory", "view", "line", "pattern", "commands", "codeTourStepPattern", "quiz.html", "quiz-print.html", "print-answer-key", "정답지", "quiz-reset-toolbar", "data-reset-quiz", "복습 초기화", "picked.clear()", "quiz-section-toolbar", "data-quiz-section-filter", "data-quiz-difficulty-filter", "data-quiz-section", "data-quiz-difficulty", "wrong-notes.html", "evidence.html", "session-verification.html", "assets/style.css", "assets/app.js", "assets/component-graph.mmd", "manifest.json", "EXPORT-README.md", "entrypoints", "writeHtmlZipBundle", "verifyHtmlExportManifest", "verifyStudySessionArtifacts", "integrityOk", "integrityCheckedFiles", "--format html|zip", "--summary-format json|markdown", "html-report.zip", "file-nav-toolbar", "data-file-ext-filter", "data-file-dir-filter", "data-source-evidence-filter", "data-source-evidence", "data-evidence-kind-filter", "@media print", "print-color-adjust", "Use browser print preview", "integrity", "sha256", "bytes"]),
  check("learning path evidence completion wording", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["근거 검토 표시 0 /", "근거 확인 후 검토 표시", "learningProgressSummary.textContent='근거 검토 표시 '", "learning path evidence review marker wording"], {
    forbidden: [
      "packages/html/src/templates.ts:근거 확인 완료 0 /",
      "packages/html/src/templates.ts:근거 확인 후 완료",
      "packages/html/src/templates.ts:learningProgressSummary.textContent='근거 확인 완료 '",
      "packages/html/src/templates.ts:> 학습 완료</label>",
      "packages/html/src/templates.ts:textContent='완료 '+completed"
    ]
  }),
  check("teaching workspace learning evidence record wording", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["학습 증거 기록은 퀴즈 시도처럼 근거가 생긴 뒤에만 생성됩니다", "not.toContain(\"학습 완료 기록은 퀴즈 시도처럼 증거가 생긴 뒤에만 생성됩니다.\")", "Teaching Workspace", "learning-records", "teaching workspace learning evidence record wording", "--iterations 255"], {
    forbidden: [
      "packages/html/src/templates.ts:학습 완료 기록은 퀴즈 시도처럼 증거가 생긴 뒤에만 생성됩니다",
      "packages/core/src/pipeline.test.ts:expect(reportIndexHtml).toContain(\"학습 완료 기록은 퀴즈 시도처럼 증거가 생긴 뒤에만 생성됩니다.\")"
    ]
  }),
  check("shared ai output review target candidate wording", [
    "packages/shared/src/report-targets.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["PASS_REVIEW/REVISE/BLOCK 검토 후보로 확인합니다", "not.toContain(\"PASS/REVISE/BLOCK 판정합니다\")", "shared ai output review target candidate wording", "--iterations 256"], {
    forbidden: [
      "packages/shared/src/report-targets.ts:PASS/REVISE/BLOCK 판정합니다",
      "packages/core/src/pipeline.test.ts:description: \"AI가 만든 결과를 목적, 아키텍처, 근거, 검증 기준으로 PASS/REVISE/BLOCK 판정합니다.\""
    ]
  }),
  check("shared source retention target generated session wording", [
    "packages/shared/src/report-targets.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["원본 소스를 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷 정리 검토 후보로 둘지 판단합니다", "not.toContain(\"무엇을 남긴 뒤 생성된 세션 source/ 스냅샷\")", "not.toContain(\"source snapshot을 정리할지\")", "shared source retention target generated session wording", "--iterations 400"], {
    forbidden: [
      "packages/shared/src/report-targets.ts:원본 소스를 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/core/src/pipeline.test.ts:원본 소스를 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표를 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/shared/src/report-targets.ts:원본 소스를 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/core/src/pipeline.test.ts:원본 소스를 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/shared/src/report-targets.ts:무엇을 남긴 뒤 생성된 세션 source/ 스냅샷",
      "packages/shared/src/report-targets.ts:무엇을 남긴 뒤 source snapshot을 정리할지 판단합니다",
      "packages/core/src/pipeline.test.ts:description: \"원본 소스를 앱 지식으로 내장하지 않고 무엇을 남긴 뒤 source snapshot을 정리할지 판단합니다.\""
    ]
  }),
  check("generated session source snapshot residual wording", [
    "apps/desktop-tauri/src/App.tsx",
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다", "생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰", "생성된 세션 source/ 스냅샷 정리 적용됨", "generated session source snapshot residual wording", "--iterations 404"], {
    forbidden: [
      "apps/desktop-tauri/src/App.tsx:생성된 source/ 스냅샷",
      "packages/core/src/teaching-workspace.ts:생성된 source/ 스냅샷",
      "packages/core/src/teaching-workspace.ts:생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 남은 산출물과 끊기는 evidence link",
      "packages/core/src/markdown.ts:생성된 source/ 스냅샷",
      "packages/html/src/templates.ts:생성된 source/ 스냅샷"
    ]
  }),
  check("quiz generated session source snapshot wrong answer wording", [
    "packages/core/src/quiz.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["사용자 원본 소스는 앱 지식이나 정리 대상이 아닙니다", "생성된 세션 source/ 스냅샷은 임시 프로젝트 근거", "흡수한 학습 산출물, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤", "정리 검토 여부를 판단해야 합니다", "not.toContain(\"흡수한 학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤\")", "not.toContain(\"흡수한 학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표 확인을 남긴 뒤\")", "not.toContain(\"흡수한 학습 산출물과 검증 기록을 남긴 뒤\")", "not.toContain(\"원본 source snapshot은 임시 프로젝트 근거\")", "quiz generated session source snapshot wrong answer wording", "quiz source retention wrong answer verification record boundary", "--iterations 403"], {
    forbidden: [
      "packages/core/src/quiz.ts:흡수한 학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤",
      "packages/core/src/quiz.ts:흡수한 학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표 확인을 남긴 뒤",
      "packages/core/src/quiz.ts:흡수한 학습 산출물과 검증 기록을 남긴 뒤",
      "packages/core/src/quiz.ts:원본 source snapshot은 임시 프로젝트 근거"
    ]
  }),
  check("quiz source retention wrong answer source-link confirmation boundary", [
    "packages/core/src/quiz.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], [
    "packages/core/src/quiz.ts:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤",
    "packages/core/src/pipeline.test.ts:학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤",
    "packages/core/src/pipeline.test.ts:not.toContain(\"흡수한 학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤\")",
    "quiz source retention wrong answer source-link confirmation boundary",
    "--iterations 416"
  ], {
    forbidden: [
      "packages/core/src/quiz.ts:현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤",
      "packages/core/src/pipeline.test.ts:expect(quizText).toContain(\"흡수한 학습 산출물, 세션 검증, 검증 기록, 현재 학습 목표 확인, 학습자 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤\")"
    ]
  }),
  check("product docs generated session source snapshot wording", [
    "README.md",
    "docs/product/storage-model.md",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["generated session `source/` snapshots as session evidence", "intentionally pruned generated session `source/`", "generated per-session `source/` snapshot used as evidence", "Generated session `source/` snapshots copied", "product docs generated session source snapshot wording", "--iterations 287"], {
    forbidden: [
      "README.md:keeps source snapshots as session evidence",
      "README.md:pruned source snapshots are gone",
      "docs/product/storage-model.md:the generated per-session source snapshot used as evidence",
      "docs/product/storage-model.md:Generated session source snapshots copied"
    ]
  }),
  check("scanner generated session source snapshot report wording", [
    "packages/core/src/scanner.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["generated session `source/` snapshots", "generated session `source/` snapshot size", "생성된 세션 `source/` 스냅샷과 정적 dependency/evidence 신호", "scanner generated session source snapshot report wording", "--iterations 288"], {
    forbidden: [
      "packages/core/src/scanner.ts:copied source snapshots",
      "packages/core/src/scanner.ts:KiB source snapshot size",
      "packages/core/src/scanner.ts:source snapshot과 정적 dependency/evidence 신호"
    ]
  }),
  check("study readme generated session source evidence wording", [
    "packages/core/src/markdown.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["The generated session `source/` snapshot is temporary project evidence, not permanent app knowledge", "before pruning that generated session snapshot", "not.toContain(\"The copied source is temporary project evidence\")", "study readme generated session source evidence wording", "--iterations 289"], {
    forbidden: [
      "packages/core/src/markdown.ts:The copied source is temporary project evidence"
    ]
  }),
  check("scanner secret generated session source content wording", [
    "packages/core/src/scanner.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["excluded from generated session `source/` snapshot content", "scanner secret generated session source content wording", "--iterations 290"], {
    forbidden: [
      "packages/core/src/scanner.ts:excluded from copied source content"
    ]
  }),
  check("learning journal generated session source file question", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Which generated report would fail first if a generated session `source/` file disappeared?", "not.toContain(\"Which generated report would fail first if a copied source file disappeared?\")", "learning journal generated session source file question", "--iterations 291"], {
    forbidden: [
      "packages/core/src/scanner.ts:Which generated report would fail first if a copied source file disappeared?"
    ]
  }),
  check("provenance generated session source snapshot digest wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["artifact: \"generated session `source/` snapshot\"", "generated session \\`source/\\` snapshot text file digest", "No generated session `source/` snapshot digest evidence is available.", "not.toContain(\"\\\"artifact\\\": \\\"source snapshot\\\"\")", "not.toContain(\"No source snapshot digest evidence is available.\")", "provenance generated session source snapshot digest wording", "--iterations 292"], {
    forbidden: [
      "packages/core/src/scanner.ts:artifact: \"source snapshot\"",
      "packages/core/src/scanner.ts:No source snapshot digest evidence is available."
    ]
  }),
  check("advisory offline db generated session source snapshot wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["none was found in the generated session `source/` snapshot", "not.toContain(\"Offline mode needs a downloaded OSV database; none was found in the source snapshot.\")", "advisory offline db generated session source snapshot wording", "--iterations 293"], {
    forbidden: [
      "packages/core/src/scanner.ts:Offline mode needs a downloaded OSV database; none was found in the source snapshot."
    ]
  }),
  check("scorecard branch protection generated session source snapshot wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Branch protection requires live source-host provider settings and cannot be proven from the generated session `source/` snapshot.", "not.toContain(\"Branch protection requires live source-host provider settings and cannot be proven from the safe local source snapshot.\")", "scorecard branch protection generated session source snapshot wording", "--iterations 294"], {
    forbidden: [
      "packages/core/src/scanner.ts:Branch protection requires live source-host provider settings and cannot be proven from the safe local source snapshot."
    ]
  }),
  check("api reference generated session source snapshot wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["No matching TypeDoc evidence was found in the generated session `source/` snapshot.", "not.toContain(\"No matching TypeDoc evidence was found in the static source snapshot.\")", "api reference generated session source snapshot wording", "--iterations 295"], {
    forbidden: [
      "packages/core/src/scanner.ts:No matching TypeDoc evidence was found in the static source snapshot."
    ]
  }),
  check("provenance trusted root generated session source snapshot wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["Trusted root and Rekor proof must be fetched or provided outside the generated session `source/` snapshot.", "not.toContain(\"Trusted root and Rekor proof must be fetched or provided outside the static source snapshot.\")", "provenance trusted root generated session source snapshot wording", "--iterations 296"], {
    forbidden: [
      "packages/core/src/scanner.ts:Trusted root and Rekor proof must be fetched or provided outside the static source snapshot."
    ]
  }),
  check("session verification generated artifact wording", [
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["이 페이지는 생성된 세션의 필수 산출물, HTML export 무결성, 소스 근거 링크를 검증합니다", "not.toContain(\"이 세션은 생성 완료 후 필수 산출물, HTML export 무결성, 소스 근거 링크를 검증합니다.\")", "session verification generated artifact wording", "--iterations 257"], {
    forbidden: [
      "packages/html/src/templates.ts:이 세션은 생성 완료 후 필수 산출물, HTML export 무결성, 소스 근거 링크를 검증합니다",
      "packages/core/src/pipeline.test.ts:expect(sessionVerificationHtml).toContain(\"이 세션은 생성 완료 후 필수 산출물, HTML export 무결성, 소스 근거 링크를 검증합니다.\")"
    ]
  }),
  check("prompt pack implementation verification command wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["변경 뒤 확인할 명령", "not.toContain(\"완료 후 확인할 명령\")", "prompt pack implementation verification command wording", "--iterations 258"], {
    forbidden: [
      "packages/core/src/scanner.ts:완료 후 확인할 명령",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackText).toContain(\"완료 후 확인할 명령\")",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackHtml).toContain(\"완료 후 확인할 명령\")",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackMarkdown).toContain(\"완료 후 확인할 명령\")"
    ]
  }),
  check("prompt pack rubric verification result wording", [
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["어떤 명령, 테스트, 화면, 리포트로 변경 결과를 검증할지 먼저 적는다", "not.toContain(\"어떤 명령, 테스트, 화면, 리포트로 완료를 확인할지 먼저 적는다\")", "prompt pack rubric verification result wording", "--iterations 259"], {
    forbidden: [
      "packages/core/src/markdown.ts:어떤 명령, 테스트, 화면, 리포트로 완료를 확인할지 먼저 적는다",
      "packages/html/src/templates.ts:어떤 명령, 테스트, 화면, 리포트로 완료를 확인할지 먼저 적는다",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackHtml).toContain(\"어떤 명령, 테스트, 화면, 리포트로 완료를 확인할지 먼저 적는다\")",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackMarkdown).toContain(\"어떤 명령, 테스트, 화면, 리포트로 완료를 확인할지 먼저 적는다\")"
    ]
  }),
  check("prompt sequence current artifact review wording", [
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["현재 산출물을 학습자 문서 초안으로 바꿔줘", "구현됐다고 가정하고 리뷰해줘", "not.toContain(\"최종 결과를 학습자 문서로 바꿔줘\")", "not.toContain(\"끝났다고 가정하고 리뷰해줘\")", "not.toContain(\"최종 결과를 리뷰해줘\")", "prompt sequence current artifact review wording", "--iterations 260"], {
    forbidden: [
      "packages/core/src/scanner.ts:최종 결과를 학습자 문서로 바꿔줘",
      "packages/core/src/scanner.ts:끝났다고 가정하고 리뷰해줘",
      "packages/core/src/scanner.ts:최종 결과를 리뷰해줘",
      "packages/core/src/pipeline.test.ts:expect(learningJournalText).toContain(\"최종 결과를 학습자 문서로 바꿔줘\")",
      "packages/core/src/pipeline.test.ts:expect(vibePromptPackText).toContain(\"최종 결과를 리뷰해줘\")"
    ]
  }),
  check("generated readiness labels review-state gate", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/core/src/pipeline.test.ts",
    "scripts/compliance-audit.mjs",
    "package.json",
    "research/analysis/autoresearch-2026-06-09-source-retention-guide.md",
    "working.md"
  ], ["READY_REVIEW / REVIEW / BLOCKED", "READY_REVIEW / REVISE / BLOCK", "READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라", "전송/최종 ACCEPT/배포/삭제 허가가 아닙니다", "READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자 검토 상태", "READY_REVIEW여도 바로 보내지 말고", "generated readiness labels review-state gate", "--iterations 197"], {
    forbidden: [
      "packages/core/src/teaching-workspace.ts:<strong>READY:</strong>",
      "packages/core/src/teaching-workspace.ts:- READY: ${row.ready}",
      "packages/core/src/teaching-workspace.ts:READY / REVIEW / BLOCKED로 평가해줘",
      "packages/core/src/teaching-workspace.ts:READY / REVISE / BLOCK으로 판정",
      "packages/core/src/markdown.ts:READY / REVIEW / BLOCKED로 확인합니다",
      "packages/core/src/markdown.ts:READY / REVISE / BLOCK으로 점검합니다",
      "packages/html/src/templates.ts:READY / REVIEW / BLOCKED로 확인합니다",
      "packages/html/src/templates.ts:READY / REVISE / BLOCK으로 점검합니다",
      "packages/html/src/templates.ts:AI에게 보내기 전 문제 설명, source evidence, acceptance criteria, 검증 assertion이 충분한지 확인합니다"
    ]
  }),
  check("static search index report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SearchIndexReportSchema", "SearchIndexReport", "searchIndexReport", "search-index-report.json", "search-index.md", "search-index.html", "assets/search-index.json", "Pagefind PageFragmentData MetaIndex filters meta_fields static low-bandwidth search index", "Repochat GitHub Repository Interactive Chatbot local-first RAG ChromaDB RecursiveCharacterTextSplitter chunk_size chunk_overlap k=3 ConversationBufferMemory standalone question", "Zoekt fast code search substring regexp boolean operators repo file lang branch case type sym trigram index ctags ranking shards JSON API", "PageFragmentData", "MetaIndex", "filterIndex", "metadataFields", "ragChunkingSignals", "codeSearchQuerySignals", "conversationStarterPrompts", "codeSearchDrillPrompts", "RAG Chunking Signals", "Code Search Query Signals", "Conversation Starter Prompts", "Code Search Drill Prompts", "data-code-search-drill", "search-index-card", "data-source-pattern=\"Pagefind\"", "openTargetEntries", "search-index"]),
  check("active recall learning journal", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["LearningJournalReportSchema", "LearningJournalReport", "learningJournalReport", "learning-journal-report.json", "learning-journal.md", "learning-journal.html", "assets/learning-journal-template.md", "learn-codebase Socratic tutor active recall prediction before revelation persistent learning journal", "Hephaestus process-aware mentoring self-regulated learning repo-grounded guidance issues commits reviews pull requests standup leaderboard recognition", "AI-native vibe-coding build brief repo map context curation planning agent spec writer task breakdown reviewer debugger verification prompt pack", "focusGoals", "masteryLevels", "openQuestions", "spacedReviewQueue", "socraticPrompts", "mentorReflectionLoops", "repoGroundedFeedbackPrompts", "vibeCodingBuildBriefs", "aiBuildPromptPacks", "verificationBoundaries", "journalTemplateMarkdown", "Mentor Reflection Loops", "Repo-Grounded Feedback Prompts", "Vibe-Coding Build Brief", "AI Build Prompt Packs", "Verification Boundaries", "learning-journal-card", "data-source-pattern=\"learn-codebase\"", "data-vibe-role", "data-prompt-phase", "data-verification-boundary", "openTargetEntries", "learning-journal"]),
  check("daily learning summary", [
    "packages/shared/src/schemas.ts",
    "packages/shared/src/report-targets.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DailySummaryReportSchema", "DailySummaryReport", "dailySummaryReport", "daily-summary-report.json", "daily-summary.md", "daily-summary.html", "오늘의 학습 요약", "daily-summary-card", "dailySummaryHtml", "source-as-evidence not source-as-product-knowledge", "원본 소스 전체를 앱 지식으로 내장하지 않고", "소스는 근거이고, 남길 것은 해석과 프롬프트", "promptsToReuse", "termsToKnow", "architectureLens", "sourceHandling", "openTargetEntries", "daily-summary"]),
  check("stateful teaching workspace", [
    "packages/core/src/teaching-workspace.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/quiz.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts",
    "packages/shared/src/report-targets.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "skills/repo-tutor/SKILL.md",
    ".agents/skills/repo-tutor/SKILL.md",
    "README.md",
    "docs/product/storage-model.md",
    "docs/product/learning-mission.md"
  ], ["TEACHING_WORKSPACE_REQUIRED_ARTIFACTS", "writeTeachingWorkspaceArtifacts", "appendQuizLearningRecord", "findQuizLearningRecord", "MISSION.md", "RESOURCES.md", "NOTES.md", "lessons/0001-source-to-architecture.html", "reference/glossary.html", "reference/rebuild-cheatsheet.html", "reference/architecture-principle-playbook.html", "reference/architecture-principle-playbook.md", "reference/source-retention-guide.html", "architecture-principle-playbook.html", "architecture-principle-playbook.md", "architecture-principle-playbook", "아키텍처 원리 플레이북", "source-to-build-interview.html", "source-to-build-interview.md", "source-to-build-interview", "소스에서 비슷한 앱 만들기 인터뷰", "내가 먼저 답할 질문", "AI에게 확인시킬 질문", "검토 후 다듬을 인터뷰 프롬프트", "repo-tutor open <session> --target source-to-build-interview", "similar-app-transfer-map.html", "similar-app-transfer-map.md", "similar-app-transfer-map", "비슷한 앱 전이 지도", "그대로 가져갈 원리", "새 앱에 맞게 바꿀 결정", "검토 후 다듬을 전이 요청 후보", "검토 후 다듬을 전이 프롬프트", "KEEP / ADAPT / ASK AI / VERIFY", "repo-tutor open <session> --target similar-app-transfer-map", "learner-goal-alignment.html", "learner-goal-alignment.md", "learner-goal-alignment", "학습자 목표 정렬", "내 목표/PRD/이슈/프롬프트", "source-grounded gap", "ACCEPT_REVIEW / CLARIFY / REWRITE / BLOCK", "검토 후 다듬을 목표 정렬 프롬프트", "repo-tutor open <session> --target learner-goal-alignment", "--learner-brief", "ai-implementation-loop.html", "ai-implementation-loop.md", "ai-implementation-loop", "AI 구현 대화 루프", "PLAN / OBSERVE / CHECK / REVISE / VERIFY / NEXT", "검토 후 다듬을 다음 질문 후보", "구현 루프 요청 후보", "AI 답변에서 확인할 것", "멈춤 조건", "검토 후 다듬을 구현 루프 프롬프트", "repo-tutor open <session> --target ai-implementation-loop", "문법 암기 대신 구조 판단", "왜 필요한가", "검토 후 다듬을 요청 후보", "잘못 만들면 생기는 문제", "검토 후 다듬을 아키텍처 설명 프롬프트", "repo-tutor open <session> --target architecture-principle-playbook", "learner-role-contract.html", "learner-role-contract.md", "learner-role-contract", "학습자 역할 계약", "AI에게 맡겨도 되는 것", "이 세션에서 목표가 아닌 것", "구체적인 코드 문법과 반복 구현은 AI가 맡아도 돼", "ai-output-review-rubric.html", "ai-output-review-rubric.md", "AI 산출물 검토 루브릭", "PASS", "REVISE", "BLOCK", "바이브코딩 리뷰어처럼 목적, 근거, 검증 기준으로 검토해줘", "repo-tutor open <session> --target learner-role-contract", "repo-tutor open <session> --target ai-output-review-rubric", "vibe-coding-mastery-checklist.html", "vibe-coding-mastery-checklist.md", "바이브코딩 숙련도 체크리스트", "AI는 이미 일반 개발 지식이 있습니다", "repo-tutor open <session> --target vibe-coding-mastery-checklist", "vibe-coding-implementation-brief.html", "vibe-coding-implementation-brief.md", "바이브코딩 구현 브리프", "검토 후 다듬을 구현 프롬프트", "repo-tutor open <session> --target vibe-coding-implementation-brief", "ai-prompt-readiness-checklist.html", "ai-prompt-readiness-checklist.md", "AI 프롬프트 준비도 체크리스트", "GitHub Copilot식 well-scoped task", "promptfoo식 assertion", "검토 후 다듬을 점검 요청 후보", "프롬프트 점검 요청 후보", "검토 후 다듬을 프롬프트 평가 요청", "repo-tutor open <session> --target ai-prompt-readiness-checklist", "ai-prompt-ab-lab.html", "ai-prompt-ab-lab.md", "AI 프롬프트 A/B 랩", "검토 후 다듬을 프롬프트 B 후보", "프롬프트 B 후보", "A/B 검토 상태표", "검토 후 다듬을 A/B 평가 프롬프트", "source-grounded 구현 요청 후보", "repo-tutor open <session> --target ai-prompt-ab-lab", "source-retention-guide.html", "source-retention-guide", "source-absorption-ledger.html", "source-absorption-ledger.md", "source-absorption-ledger", "소스 보존 판단", "repo-tutor open <session> --target source-retention-guide", "repo-tutor open <session> --target source-absorption-ledger", "repo-tutor open <session> --target vibe-coding-start", "vibe-coding-start", "소스 보존/정리 판단 가이드", "Source Absorption Ledger", "앱이 흡수한 기능", "추가 조사 필요 여부", "원본 소스 전체를 앱 지식으로 내장하지 않습니다", "원본 소스를 앱 지식으로 내장", "AI에게 줄 확인 프롬프트", "learning-records/README.md", "0001-quiz-attempt-passed.md", "0002-quiz-attempt-passed.md", "teaching-workspace.html", "teachingWorkspaceHtml", "Teaching Workspace HTML", "learningRecord", "Learning record", "학습 워크스페이스", "source evidence는 특정 프로젝트의 목적", "source is evidence", "not embed external repositories as permanent knowledge", "바이브코딩"]),
  check("vibe-coding prompt pack", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["VibeCodingPromptPackReportSchema", "VibeCodingPromptPackReport", "vibeCodingPromptPackReport", "vibe-coding-prompt-pack-report.json", "vibe-coding-prompt-pack.md", "vibe-coding-prompt-pack.html", "AI-native vibe-coding prompt pack", "나는 전문 개발자가 아니라 바이브코딩 개발자야", "promptSequence", "copyPastePrompt", "aiGuardrails", "contextBundle", "learnerChecklist", "PRD", "SDD", "TDD", "acceptance criteria", "Vibe-Coding Prompt Pack", "AI Implementation Prompt Pack", "Source-Grounded Implementation Prompt", "vibe-prompt-pack-card", "vibe-prompt-sequence", "vibe-prompt-guardrails", "openTargetEntries", "vibe-coding-prompt-pack"]),
  check("project activity risk report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ProjectActivityReportSchema", "ProjectActivityReport", "projectActivityReport", "project-activity-report.json", "project-activity.md", "project-activity.html", "Repowise git analytics code health hotspots ownership co-change dead code architectural decisions MCP risk", "historyAvailability", "activitySignals", "hotspotCandidates", "deadCodeCandidates", "reviewQueues", "architectureDecisionPrompts", "project-activity-card", "data-source-pattern=\"Repowise\"", "openTargetEntries", "project-activity"]),
  check("code metrics readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["CodeMetricsReadinessReportSchema", "CodeMetricsReadinessReport", "codeMetricsReadinessReport", "code-metrics-readiness-report.json", "code-metrics-readiness.md", "code-metrics-readiness.html", "scc lizard tokei cloc radon cyclomatic complexity code lines comments blanks hotspots COCOMO LOCOMO JSON CSV HTML OpenMetrics thresholds", "CodeCharta local code maps cc.json Web Studio area height color delta parser importer filter ValidationTool InspectionTool", "languageMetrics", "hotspots", "toolSignals", "metricSignals", "workflowSignals", "codeMapMetricBindings", "codeMapSignals", "Code Map Metric Bindings", "Code Map Signals", "complexityDensity", "scc --by-file --wide --format json .", "ccsh rawtextparser .", "code-metrics-readiness-card", "data-source-pattern=\"scc\"", "openTargetEntries", "code-metrics-readiness"]),
  check("code ownership readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["CodeOwnershipReadinessReportSchema", "CodeOwnershipReadinessReport", "codeOwnershipReadinessReport", "code-ownership-readiness-report.json", "code-ownership-readiness.md", "code-ownership-readiness.html", "CODEOWNERS standard locations root .github docs gitignore-style patterns owners teams users email last matching rule branch protection required code owner reviews rulesets syntax owner file duplicate not-owned validation", "codeownerFiles", "ownershipSignals", "validationSignals", "reviewSignals", "coverageSignals", "packageSignals", "codeowners-validator --checks files,owners,duppatterns,syntax", "code-ownership-readiness-card", "data-source-pattern=\"CODEOWNERS\"", "openTargetEntries", "code-ownership-readiness"]),
  check("large asset readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["LargeAssetReadinessReportSchema", "LargeAssetReadinessReport", "largeAssetReadinessReport", "large-asset-readiness-report.json", "large-asset-readiness.md", "large-asset-readiness.html", "Git LFS DVC large file data versioning .gitattributes filter=lfs pointer oid sha256 lockable migrate track status fsck prune dvc.yaml dvc.lock outs deps metrics params remote cache push pull status repro", "assetSetups", "lfsSignals", "dvcSignals", "submoduleSignals", "workflowSignals", "packageSignals", "git lfs fsck --pointers BASE..HEAD", "dvc repro", "large-asset-readiness-card", "data-source-pattern=\"Git LFS DVC\"", "openTargetEntries", "large-asset-readiness"]),
  check("license rights report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["LicenseRightsReportSchema", "LicenseRightsReport", "licenseRightsReport", "license-rights-report.json", "license-rights.md", "license-rights.html", "Licensee license file detection filename score SPDX confidence matched_files package metadata README references human compliance review", "detectedProjectLicense", "licenseFiles", "packageLicenseSignals", "readmeLicenseReferences", "reviewWarnings", "rightsChecklist", "license-rights-card", "data-source-pattern=\"Licensee\"", "openTargetEntries", "license-rights"]),
  check("software bill of materials report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SbomReportSchema", "SbomReport", "sbomReport", "sbom-report.json", "sbom.md", "sbom.html", "Syft SBOM source descriptor artifacts packages file metadata relationships CycloneDX SPDX output formats", "sourceDescriptor", "packageManifests", "packageArtifacts", "fileArtifacts", "relationships", "outputFormats", "purl", "sbom-card", "data-source-pattern=\"Syft\"", "openTargetEntries", "sbom"]),
  check("security readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SecurityReadinessReportSchema", "SecurityReadinessReport", "securityReadinessReport", "security-readiness-report.json", "security-readiness.md", "security-readiness.html", "Trivy targets scanners vulnerability secret misconfiguration license SBOM severity security readiness", "scannerTargets", "scannerCoverage", "securitySignals", "actionQueue", "recommendedCommands", "security-readiness-card", "data-source-pattern=\"Trivy\"", "openTargetEntries", "security-readiness"]),
  check("sast readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SastReadinessReportSchema", "SastReadinessReport", "sastReadinessReport", "sast-readiness-report.json", "sast-readiness.md", "sast-readiness.html", "SAST readiness Semgrep rules pattern pattern-either metavariable CodeQL init analyze queries security-extended security-and-quality qlpack SonarQube sonar-project.properties sonar.sources sonar.exclusions quality gate Snyk Code SARIF upload-sarif code scanning", "sastSetups", "toolSignals", "ruleSignals", "querySignals", "languageSignals", "scopeSignals", "baselineSignals", "outputSignals", "ciSignals", "packageSignals", "Run Semgrep, CodeQL, Sonar scanner, Snyk Code, and upload-SARIF commands only in a trusted sandbox", "sast-readiness-card", "data-source-pattern=\"SAST\"", "openTargetEntries", "sast-readiness"]),
  check("dast readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DastReadinessReportSchema", "DastReadinessReport", "dastReadinessReport", "dast-readiness-report.json", "dast-readiness.md", "dast-readiness.html", "DAST readiness OWASP ZAP zap-baseline-scan zap-full-scan zap-api-scan spider ajaxSpider active scan context auth policy report nuclei -dast templates workflows severity rate-limit headless interactsh secureCodeBox ScanType parser hooks findings SARIF JUnit HTML", "dastSetups", "targetSignals", "scannerSignals", "crawlSignals", "activeScanSignals", "authSignals", "templateSignals", "safetySignals", "outputSignals", "ciSignals", "packageSignals", "Run OWASP ZAP, nuclei, secureCodeBox, browser, HTTP, spider, active scan, fuzzing, auth, and webhook commands only against authorized test targets", "dast-readiness-card", "data-source-pattern=\"DAST\"", "openTargetEntries", "dast-readiness"]),
  check("threat model readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ThreatModelReadinessReportSchema", "ThreatModelReadinessReport", "threatModelReadinessReport", "threat-model-readiness-report.json", "threat-model-readiness.md", "threat-model-readiness.html", "Threat model readiness pytm Threat Dragon Threagile open threat model STRIDE DFD data flow diagram trust boundary technical_assets data_assets communication_links risk_tracking abuse_cases mitigation report JSON Markdown PDF Graphviz", "threatModelSetups", "modelSignals", "diagramSignals", "assetSignals", "boundarySignals", "threatSignals", "riskSignals", "outputSignals", "ciSignals", "packageSignals", "Run pytm, Threat Dragon, Threagile, Graphviz, Docker, and report generation only in an authorized local or CI environment", "threat-model-readiness-card", "data-source-pattern=\"Threat Model\"", "openTargetEntries", "threat-model-readiness"]),
  check("project scorecard report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ScorecardReportSchema", "ScorecardReport", "scorecardReport", "scorecard-report.json", "scorecard.md", "scorecard.html", "OpenSSF Scorecard checks score 0-10 risk remediation structured results policy measurement", "aggregateScore", "checks", "categoryScores", "policyFindings", "riskQueue", "structuredResults", "scorecard-card", "data-source-pattern=\"OpenSSF Scorecard\"", "openTargetEntries", "scorecard"]),
  check("provenance readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ProvenanceReportSchema", "ProvenanceReport", "provenanceReport", "provenance-report.json", "provenance.md", "provenance.html", "Cosign signature bundle attestation transparency log trusted root certificate identity verification", "artifactSignals", "signatureSignals", "attestationSignals", "identityRequirements", "verificationCommands", "cosign verify-blob", "provenance-card", "data-source-pattern=\"Cosign\"", "openTargetEntries", "provenance"]),
  check("advisory query readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["AdvisoryReportSchema", "AdvisoryReport", "advisoryReport", "advisory-report.json", "advisories.md", "advisories.html", "OSV-Scanner package extraction vulnerability matching OSV.dev lockfile SBOM offline remediation ignore policy", "packageQueryTargets", "lockfileSignals", "advisorySources", "policyControls", "resultModel", "remediationQueue", "osv-scanner scan source", "advisory-card", "data-source-pattern=\"OSV-Scanner\"", "openTargetEntries", "advisories"]),
  check("openvex impact readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["VexReportSchema", "VexReport", "vexReport", "vex-report.json", "vex.md", "vex.html", "OpenVEX affected not_affected fixed under_investigation justification product subcomponent vulnerability statement attestation SARIF filter", "productTargets", "vulnerabilityInputs", "statusMatrix", "justificationCatalog", "statementDrafts", "documentWorkflow", "attestationReadiness", "vexctl filter", "vex-card", "data-source-pattern=\"OpenVEX\"", "openTargetEntries", "vex"]),
  check("policy gate readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["PolicyGateReportSchema", "PolicyGateReport", "policyGateReport", "policy-gate-report.json", "policy-gates.md", "policy-gates.html", "OPA Rego policy input data decision eval test bundle schema strict fail gate", "policyDocuments", "inputDocuments", "gateQueries", "testCoverage", "bundleReadiness", "decisionOutputs", "opa check --strict", "opa test <policy-dir> --fail-on-empty", "policy-gate-card", "data-source-pattern=\"OPA\"", "openTargetEntries", "policy-gates"]),
  check("api contract readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ApiContractReportSchema", "ApiContractReport", "apiContractReport", "api-contract-report.json", "api-contracts.md", "api-contracts.html", "Schemathesis OpenAPI GraphQL schema generated cases Hypothesis checks stateful workflows JUnit Allure contract testing", "schemaDocuments", "operationTargets", "testPhases", "checkMatrix", "runtimeTargets", "reportingOutputs", "schemathesis run", "api-contract-card", "data-source-pattern=\"Schemathesis\"", "openTargetEntries", "api-contracts"]),
  check("consumer contract readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ConsumerContractReadinessReportSchema", "ConsumerContractReadinessReport", "consumerContractReadinessReport", "consumer-contract-readiness-report.json", "consumer-contract-readiness.md", "consumer-contract-readiness.html", "Pact consumer driven contracts interactions provider states verifier broker can-i-deploy matchers publish verification", "contractSetups", "interactionSignals", "providerSignals", "brokerSignals", "matcherSignals", "ciSignals", "packageSignals", "can-i-deploy", "consumer-contract-readiness-card", "data-source-pattern=\"Pact\"", "openTargetEntries", "consumer-contract-readiness"]),
  check("observability readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ObservabilityReportSchema", "ObservabilityReport", "observabilityReport", "observability-report.json", "observability.md", "observability.html", "OpenTelemetry traces metrics logs resource context propagation exporter instrumentation semantic conventions diagnostics", "signalPipelines", "instrumentationSignals", "exporterTargets", "resourceAttributes", "propagationContext", "diagnostics", "OTEL_EXPORTER_OTLP_ENDPOINT", "observability-card", "data-source-pattern=\"OpenTelemetry\"", "openTargetEntries", "observability"]),
  check("performance readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["PerformanceReportSchema", "PerformanceReport", "performanceReport", "performance-report.json", "performance.md", "performance.html", "k6 load testing scripts scenarios executors thresholds checks metrics outputs summaries cloud performance SLO", "scriptTargets", "workloadModels", "thresholds", "checks", "metrics", "outputs", "runtimeControls", "k6 run --summary-export", "performance-card", "data-source-pattern=\"k6\"", "openTargetEntries", "performance"]),
  check("profiling readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ProfilingReadinessReportSchema", "ProfilingReadinessReport", "profilingReadinessReport", "profiling-readiness-report.json", "profiling-readiness.md", "profiling-readiness.html", "Profiling readiness Clinic.js py-spy Pyroscope pprof flamegraph speedscope heap CPU wall sampling tags permissions CI", "profilingSetups", "targetSignals", "modeSignals", "outputSignals", "runtimeSignals", "safetySignals", "packageSignals", "Run Clinic.js, py-spy, Pyroscope, pprof, eBPF, or profiling commands only in an authorized environment", "profiling-readiness-card", "data-source-pattern=\"Profiling\"", "openTargetEntries", "profiling-readiness"]),
  check("tracing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TracingReadinessReportSchema", "TracingReadinessReport", "tracingReadinessReport", "tracing-readiness-report.json", "tracing-readiness.md", "tracing-readiness.html", "Tracing readiness OpenTelemetry Jaeger Zipkin Tempo traceparent baggage spans exporters sampling resources backends quality", "tracingSetups", "instrumentationSignals", "propagationSignals", "exporterSignals", "samplingSignals", "resourceSignals", "backendSignals", "qualitySignals", "packageSignals", "RepoTutor records static tracing readiness only", "tracing-readiness-card", "data-source-pattern=\"Tracing\"", "openTargetEntries", "tracing-readiness"]),
  check("debug readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DebugReadinessReportSchema", "DebugReadinessReport", "debugReadinessReport", "debug-readiness-report.json", "debug-readiness.md", "debug-readiness.html", "Debug readiness VS Code js-debug debugpy Delve DAP launch attach breakpoints source maps path mappings remote logs", "debugSetups", "adapterSignals", "modeSignals", "breakpointSignals", "mappingSignals", "runtimeSignals", "remoteSignals", "diagnosticSignals", "packageSignals", "RepoTutor records static debugging readiness only", "debug-readiness-card", "data-source-pattern=\"Debug\"", "openTargetEntries", "debug-readiness"]),
  check("crash reporting readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CrashReportingReadinessReportSchema", "CrashReportingReadinessReport", "crashReportingReadinessReport", "crash-reporting-readiness-report.json", "crash-reporting-readiness.md", "crash-reporting-readiness.html", "Crash reporting readiness Sentry Bugsnag Rollbar release source maps debug IDs dSYM ProGuard stacktrace breadcrumbs sessions privacy alerts", "crashSetups", "captureSignals", "releaseSignals", "symbolicationSignals", "contextSignals", "privacySignals", "deliverySignals", "workflowSignals", "packageSignals", "RepoTutor records static crash reporting readiness only", "crash-reporting-readiness-card", "data-source-pattern=\"Crash\"", "openTargetEntries", "crash-reporting-readiness"]),
  check("incident response readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["IncidentResponseReadinessReportSchema", "IncidentResponseReadinessReport", "incidentResponseReadinessReport", "incident-response-readiness-report.json", "incident-response-readiness.md", "incident-response-readiness.html", "Incident response readiness PagerDuty Grafana OnCall FireHydrant alert routing escalation schedules runbooks status pages postmortems", "incidentSetups", "intakeSignals", "triageSignals", "onCallSignals", "communicationSignals", "runbookSignals", "lifecycleSignals", "governanceSignals", "workflowSignals", "packageSignals", "RepoTutor records static incident-response readiness only", "incident-response-readiness-card", "data-source-pattern=\"Incident\"", "openTargetEntries", "incident-response-readiness"]),
  check("SLO readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SloReadinessReportSchema", "SloReadinessReport", "sloReadinessReport", "slo-readiness-report.json", "slo-readiness.md", "slo-readiness.html", "SLO readiness OpenSLO object model DataSource SLO SLI AlertPolicy AlertCondition AlertNotificationTarget Service duration shorthand service level objective SLI error budget burn rate Prometheus recording rules", "sloSetups", "specSignals", "openSloObjectSignals", "timeWindowSignals", "metricSourceSignals", "data-source-kind", "alert-policy-kind", "alert-condition-kind", "alert-notification-target-kind", "duration-shorthand", "budgeting-ratio-timeslices", "metric-source-ref", "raw-ratio-type", "indicatorSignals", "objectiveSignals", "alertSignals", "ruleSignals", "governanceSignals", "workflowSignals", "packageSignals", "RepoTutor records static SLO readiness only", "OpenSLO Object Signals", "Time Window Signals", "Metric Source Signals", "slo-readiness-card", "data-source-pattern=\"SLO\"", "openTargetEntries", "slo-readiness"]),
  check("cost readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CostReadinessReportSchema", "CostReadinessReport", "costReadinessReport", "cost-readiness-report.json", "cost-readiness.md", "cost-readiness.html", "Cost readiness Infracost OpenCost Kubecost FinOps cost allocation cloud cost budget pricing Prometheus", "costSetups", "estimateSignals", "allocationSignals", "pricingSignals", "budgetSignals", "observabilitySignals", "workflowSignals", "packageSignals", "RepoTutor records static cost readiness only", "cost-readiness-card", "data-source-pattern=\"Cost\"", "openTargetEntries", "cost-readiness"]),
  check("progressive delivery readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ProgressiveDeliveryReadinessReportSchema", "ProgressiveDeliveryReadinessReport", "progressiveDeliveryReadinessReport", "progressive-delivery-readiness-report.json", "progressive-delivery-readiness.md", "progressive-delivery-readiness.html", "Progressive delivery readiness Argo Rollouts Flagger Kayenta canary blue-green traffic routing analysis promotion abort", "rolloutSetups", "strategySignals", "trafficSignals", "analysisSignals", "safetySignals", "notificationSignals", "workflowSignals", "packageSignals", "RepoTutor records static progressive delivery readiness only", "progressive-delivery-readiness-card", "data-source-pattern=\"Progressive Delivery\"", "openTargetEntries", "progressive-delivery-readiness"]),
  check("load testing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["LoadTestingReadinessReportSchema", "LoadTestingReadinessReport", "loadTestingReadinessReport", "load-testing-readiness-report.json", "load-testing-readiness.md", "load-testing-readiness.html", "k6 Artillery Locust load testing scenarios phases thresholds checks ensure HttpUser headless distributed reports", "loadTestSetups", "toolSignals", "profileSignals", "protocolSignals", "assertionSignals", "dataSignals", "executionSignals", "reportSignals", "packageSignals", "k6 run --summary-export", "load-testing-readiness-card", "data-source-pattern=\"k6\"", "openTargetEntries", "load-testing-readiness"]),
  check("benchmark readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["BenchmarkReadinessReportSchema", "BenchmarkReadinessReport", "benchmarkReadinessReport", "benchmark-readiness-report.json", "benchmark-readiness.md", "benchmark-readiness.html", "Vitest bench Tinybench Benchmark.js Hyperfine Criterion pytest-benchmark Go benchmark warmup iterations samples ops/sec export-json regression threshold", "benchmarkSuites", "toolSignals", "timingSignals", "comparisonSignals", "reportSignals", "ciSignals", "packageSignals", "npx vitest bench --run", "benchmark-readiness-card", "data-source-pattern=\"Tinybench\"", "openTargetEntries", "benchmark-readiness"]),
  check("e2e readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["E2eReportSchema", "E2eReport", "e2eReport", "e2e-report.json", "e2e.md", "e2e.html", "Playwright browser E2E tests defineConfig fixtures projects devices locators assertions poll toPass traces screenshots video reporters CI webServer storageState APIRequestContext", "testSuites", "browserProjects", "locatorSignals", "assertions", "artifacts", "runtimeTargets", "playwrightSignals", "npx playwright test", "e2e-card", "data-source-pattern=\"Playwright\"", "openTargetEntries", "e2e"]),
  check("flaky test readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["FlakyTestReadinessReportSchema", "FlakyTestReadinessReport", "flakyTestReadinessReport", "flaky-test-readiness-report.json", "flaky-test-readiness.md", "flaky-test-readiness.html", "Flaky test readiness Playwright retries failOnFlakyTests trace on-first-retry pytest-rerunfailures --reruns --fail-on-flaky jest.retryTimes quarantine skip fixme xfail artifacts", "flakyTestSetups", "frameworkSignals", "retrySignals", "quarantineSignals", "isolationSignals", "artifactSignals", "ciSignals", "packageSignals", "npx playwright test --retries=2", "flaky-test-readiness-card", "data-source-pattern=\"Flaky\"", "openTargetEntries", "flaky-test-readiness"]),
  check("test impact readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TestImpactReadinessReportSchema", "TestImpactReadinessReport", "testImpactReadinessReport", "test-impact-readiness-report.json", "test-impact-readiness.md", "test-impact-readiness.html", "Test impact readiness Nx affected Jest findRelatedTests onlyChanged changedSince pytest-testmon --testmon dependency graph base head changed files CI cache", "impactSetups", "toolSignals", "changeDetectionSignals", "selectionSignals", "cacheSignals", "ciSignals", "packageSignals", "npx nx affected -t test --base=origin/main --head=HEAD", "test-impact-readiness-card", "data-source-pattern=\"Test Impact\"", "openTargetEntries", "test-impact-readiness"]),
  check("test reporting readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TestReportingReadinessReportSchema", "TestReportingReadinessReport", "testReportingReadinessReport", "test-reporting-readiness-report.json", "test-reporting-readiness.md", "test-reporting-readiness.html", "Test reporting readiness CTRF JSON Allure results JUnit XML GitHub annotations checks summaries artifacts history", "reportSetups", "formatSignals", "adapterSignals", "ciSignals", "outputSignals", "qualitySignals", "packageSignals", "npx jest --ci --reporters=default --reporters=jest-junit", "test-reporting-readiness-card", "data-source-pattern=\"Test Reporting\"", "openTargetEntries", "test-reporting-readiness"]),
  check("snapshot readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SnapshotReadinessReportSchema", "SnapshotReadinessReport", "snapshotReadinessReport", "snapshot-readiness-report.json", "snapshot-readiness.md", "snapshot-readiness.html", "Snapshot testing readiness Jest Vitest Playwright toMatchSnapshot inline file visual ARIA snapshots update policy serializers baselines CI", "snapshotSetups", "assertionSignals", "storageSignals", "updateSignals", "serializerSignals", "visualSignals", "ciSignals", "packageSignals", "npx jest --ci", "npx playwright test --update-snapshots=changed", "snapshot-readiness-card", "data-source-pattern=\"Snapshot\"", "openTargetEntries", "snapshot-readiness"]),
  check("property based testing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PropertyBasedTestingReadinessReportSchema", "PropertyBasedTestingReadinessReport", "propertyBasedTestingReadinessReport", "property-based-testing-readiness-report.json", "property-based-testing-readiness.md", "property-based-testing-readiness.html", "Property-based testing fast-check Hypothesis jqwik generators arbitraries strategies shrinking seeds counterexamples stateful CI", "propertySetups", "generatorSignals", "runnerSignals", "reproductionSignals", "statefulSignals", "ciSignals", "packageSignals", "pytest -q --hypothesis-show-statistics", "mvn test -Djqwik.failures.runfirst=true", "property-based-testing-readiness-card", "data-source-pattern=\"Property-Based Testing\"", "openTargetEntries", "property-based-testing-readiness"]),
  check("fuzz readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["FuzzReadinessReportSchema", "FuzzReadinessReport", "fuzzReadinessReport", "fuzz-readiness-report.json", "fuzz-readiness.md", "fuzz-readiness.html", "Fuzz readiness OSS-Fuzz libFuzzer AFL++ Jazzer ClusterFuzzLite fuzz targets corpus dictionary sanitizer coverage reproducer CI", "fuzzSetups", "harnessSignals", "engineSignals", "buildSignals", "runtimeSignals", "sanitizerSignals", "ciSignals", "packageSignals", "rg -- \\\"-fsanitize=fuzzer", "Run OSS-Fuzz, libFuzzer, AFL++, Jazzer, ClusterFuzzLite, or language fuzz commands only in an authorized environment", "fuzz-readiness-card", "data-source-pattern=\"Fuzz\"", "openTargetEntries", "fuzz-readiness"]),
  check("test data readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TestDataReadinessReportSchema", "TestDataReadinessReport", "testDataReadinessReport", "test-data-readiness-report.json", "test-data-readiness.md", "test-data-readiness.html", "Test data Factory Bot factory_boy Faker factories traits associations sequences seeds fixtures deterministic lint CI", "dataSetups", "factorySignals", "relationshipSignals", "generationSignals", "reproducibilitySignals", "lifecycleSignals", "ciSignals", "packageSignals", "bundle exec rails runner 'FactoryBot.lint'", "pytest -q tests/factories.py tests --maxfail=1", "test-data-readiness-card", "data-source-pattern=\"Test Data\"", "openTargetEntries", "test-data-readiness"]),
  check("integration test environment readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["IntegrationTestEnvironmentReadinessReportSchema", "IntegrationTestEnvironmentReadinessReport", "integrationTestEnvironmentReadinessReport", "integration-test-environment-readiness-report.json", "integration-test-environment-readiness.md", "integration-test-environment-readiness.html", "Testcontainers GenericContainer DockerContainer DockerComposeEnvironment DockerCompose wait strategies exposed ports env lifecycle stop Ryuk resource reaper pytest beforeAll afterAll", "integrationSetups", "containerSignals", "waitSignals", "lifecycleSignals", "runtimeSignals", "packageSignals", "wait_for_logs", "integration-test-environment-readiness-card", "data-source-pattern=\"Testcontainers\"", "openTargetEntries", "integration-test-environment-readiness"]),
  check("chaos engineering readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ChaosEngineeringReadinessReportSchema", "ChaosEngineeringReadinessReport", "chaosEngineeringReadinessReport", "chaos-engineering-readiness-report.json", "chaos-engineering-readiness.md", "chaos-engineering-readiness.html", "Chaos Mesh LitmusChaos Toxiproxy chaos experiments probes steady state blast radius schedules toxics cleanup", "chaosSetups", "experimentSignals", "faultSignals", "scopeSignals", "safetySignals", "observabilitySignals", "packageSignals", "kubectl apply --dry-run=server", "chaos-engineering-readiness-card", "data-source-pattern=\"Chaos Engineering\"", "openTargetEntries", "chaos-engineering-readiness"]),
  check("accessibility readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["AccessibilityReportSchema", "AccessibilityReport", "accessibilityReport", "accessibility-report.json", "accessibility.md", "accessibility.html", "axe-core accessibility engine WCAG tags violations passes incomplete inapplicable impact selectors context configure reporter iframes", "scanTargets", "ruleTags", "resultBuckets", "impactLevels", "integrationSignals", "contextControls", "npm install axe-core --save-dev", "accessibility-card", "data-source-pattern=\"axe-core\"", "openTargetEntries", "accessibility"]),
  check("storybook readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["StorybookReportSchema", "StorybookReport", "storybookReport", "storybook-report.json", "storybook.md", "storybook.html", "Storybook Component Story Format stories Meta StoryObj satisfies Meta args argTypes decorators loaders play functions beforeEach autodocs MDX addons test-runner Vitest Chromatic portable stories composition MSW component workshop", "storyFiles", "configFiles", "storyAnnotations", "addonSignals", "testSignals", "publishSignals", "storybookSignals", "Storybook Signals", "npx storybook@latest init", "storybook-card", "data-source-pattern=\"Storybook\"", "openTargetEntries", "storybook"]),
  check("design tokens readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DesignTokensReportSchema", "DesignTokensReport", "designTokensReport", "design-tokens-report.json", "design-tokens.md", "design-tokens.html", "Style Dictionary design tokens source include platforms transformGroup transforms buildPath files formats CTI aliases multi-platform CSS Android iOS", "tokenSources", "tokenCategories", "platformTargets", "transformSignals", "usageSignals", "governanceSignals", "npm install -D style-dictionary", "design-token-card", "data-source-pattern=\"Style Dictionary\"", "openTargetEntries", "design-tokens"]),
  check("i18n readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["I18nReportSchema", "I18nReport", "i18nReport", "i18n-report.json", "i18n.md", "i18n.html", "I18n readiness FormatJS React Intl next-intl useTranslations getTranslations NextIntlClientProvider createMiddleware defineRouting localePrefix pathnames requestLocale i18next init useTranslation I18nextProvider resources fallbackLng backend loadPath language detector saveMissing keyPrefix Lingui Trans useLingui I18nProvider lingui extract compile config vite plugin ESLint ICU messages extract compile verify IntlProvider polyfills locale data PO catalogs TMS", "messageSources", "localeAssets", "runtimeSignals", "extractionSignals", "icuSignals", "qaSignals", "lingui extract", "i18n-card", "data-source-pattern=\"I18n\"", "openTargetEntries", "i18n"]),
  check("release readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ReleaseReadinessReportSchema", "ReleaseReadinessReport", "releaseReadinessReport", "release-readiness-report.json", "release-readiness.md", "release-readiness.html", "semantic-release branches tagFormat plugins verifyConditions analyzeCommits generateNotes prepare publish CI OIDC provenance", "releaseConfigs", "branchChannels", "versionSignals", "ciSignals", "publishTargets", "authSignals", "pluginSteps", "npx semantic-release --dry-run", "release-card", "data-source-pattern=\"semantic-release\"", "openTargetEntries", "release-readiness"]),
  check("secret readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SecretReadinessReportSchema", "SecretReadinessReport", "secretReadinessReport", "secret-readiness-report.json", "secret-readiness.md", "secret-readiness.html", "Gitleaks git dir stdin baseline config rules allowlists redaction report formats pre-commit staged secret scanning", "scanTargets", "secretSurfaces", "configSignals", "reportingSignals", "preventionSignals", "advancedSignals", "gitleaks git --redact", "secret-card", "data-source-pattern=\"Gitleaks\"", "openTargetEntries", "secret-readiness"]),
  check("secret management readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SecretManagementReadinessReportSchema", "SecretManagementReadinessReport", "secretManagementReadinessReport", "secret-management-readiness-report.json", "secret-management-readiness.md", "secret-management-readiness.html", "Secrets management readiness Vault Infisical Doppler SOPS Sealed Secrets External Secrets secret engines auth methods policies tokens leases rotation transit kv env injection sync Kubernetes operator agent CLI SDK API audit logs dynamic secrets", "secretManagementSetups", "platformSignals", "authSignals", "storageSignals", "deliverySignals", "governanceSignals", "packageSignals", "Secret Management", "secret-management-readiness-card", "data-source-pattern=\"Secret Management\"", "openTargetEntries", "secret-management-readiness"]),
  check("container readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ContainerReadinessReportSchema", "ContainerReadinessReport", "containerReadinessReport", "container-readiness-report.json", "container-readiness.md", "container-readiness.html", "Hadolint Dockerfile AST ShellCheck rules config ignored rules severity overrides trusted registries labels SARIF JUnit CI pre-commit", "dockerfiles", "composeFiles", "configSignals", "instructionRisks", "labelPolicy", "integrationSignals", "hadolint Dockerfile", "container-card", "data-source-pattern=\"Hadolint\"", "openTargetEntries", "container-readiness"]),
  check("container scan readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ContainerScanReadinessReportSchema", "ContainerScanReadinessReport", "containerScanReadinessReport", "container-scan-readiness-report.json", "container-scan-readiness.md", "container-scan-readiness.html", "Container scan readiness Trivy Grype Dockle image filesystem SBOM vulnerability misconfig secret license CIS exit-code severity ignore-unfixed only-fixed fail-on exit-level SARIF CycloneDX SPDX JSON VEX trivyignore grype ignore dockleignore registry token docker-host", "containerScanSetups", "targetSignals", "scannerSignals", "gateSignals", "outputSignals", "policySignals", "registrySignals", "ciSignals", "packageSignals", "Run Trivy, Grype, Dockle, Docker, registry, vulnerability DB, and SARIF upload commands only in an authorized local or CI environment", "container-scan-readiness-card", "data-source-pattern=\"Container Scan\"", "openTargetEntries", "container-scan-readiness"]),
  check("code quality report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["CodeQualityReportSchema", "CodeQualityReport", "codeQualityReport", "code-quality-report.json", "code-quality.md", "code-quality.html", "Biome formatter linter check ci biome.json assist organize imports diagnostics reporter editor LSP VCS ignore safe fixes", "toolConfigs", "formatterSignals", "linterSignals", "assistSignals", "ciSignals", "languageCoverage", "npx @biomejs/biome check .", "code-quality-card", "data-source-pattern=\"Biome\"", "openTargetEntries", "code-quality"]),
  check("documentation report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DocumentationReportSchema", "DocumentationReport", "documentationReport", "documentation-report.json", "documentation.md", "documentation.html", "Docusaurus docs blog pages sidebars docusaurus.config themeConfig navbar footer i18n versioning search build deploy preset-classic plugin-content-docs plugin-content-blog theme-classic MDX admonitions swizzle plugin lifecycle", "RepoAgent repository-level code documentation generation AST object docs bidirectional invocation relationships change detection Markdown replacement project hierarchy pre-commit GitBook chat-with-repo local model", "siteConfigs", "contentSurfaces", "navigationSignals", "qualitySignals", "localizationSignals", "releaseSignals", "docusaurusSignals", "Docusaurus Signals", "objectDocumentationTargets", "repoAgentAutomationSignals", "Object Documentation Targets", "RepoAgent Automation Signals", "repoagent run --print-hierarchy", "repoagent diff", "npm run build", "documentation-card", "data-source-pattern=\"Docusaurus\"", "openTargetEntries", "documentation"]),
  check("database readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DatabaseReadinessReportSchema", "DatabaseReadinessReport", "databaseReadinessReport", "database-readiness-report.json", "database-readiness.md", "database-readiness.html", "Prisma schema datasource generator model migrate generate db push seed PrismaClient DATABASE_URL driver adapter migrations", "schemaFiles", "datasourceSignals", "migrationSignals", "clientSignals", "configSignals", "modelSignals", "npx prisma validate", "database-card", "data-source-pattern=\"Prisma\"", "openTargetEntries", "database-readiness"]),
  check("database migration readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DatabaseMigrationReadinessReportSchema", "DatabaseMigrationReadinessReport", "databaseMigrationReadinessReport", "database-migration-readiness-report.json", "database-migration-readiness.md", "database-migration-readiness.html", "Database migration readiness Flyway Liquibase Alembic versioned migrations changelog changeset revision down_revision upgrade downgrade rollback validate repair info status updateSQL current heads dry-run drift CI", "migrationSetups", "fileSignals", "lineageSignals", "rollbackSignals", "validationSignals", "configSignals", "ciSignals", "packageSignals", "flyway validate", "liquibase updateSQL", "database-migration-readiness-card", "data-source-pattern=\"Database Migration\"", "openTargetEntries", "database-migration-readiness"]),
  check("database ORM readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DatabaseOrmReadinessReportSchema", "DatabaseOrmReadinessReport", "databaseOrmReadinessReport", "database-orm-readiness-report.json", "database-orm-readiness.md", "database-orm-readiness.html", "Database ORM readiness TypeORM Sequelize SQLAlchemy entity model decorator relationship repository session query builder transaction eager loading migration synchronization CI", "ormSetups", "entitySignals", "relationSignals", "repositorySignals", "transactionSignals", "loadingSignals", "configSignals", "ciSignals", "packageSignals", "typeorm migration", "sequelize-cli db", "database-orm-readiness-card", "data-source-pattern=\"Database ORM\"", "openTargetEntries", "database-orm-readiness"]),
  check("data transformation readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataTransformationReadinessReportSchema", "DataTransformationReadinessReport", "dataTransformationReadinessReport", "data-transformation-readiness-report.json", "data-transformation-readiness.md", "data-transformation-readiness.html", "Data transformation readiness dbt SQLMesh Dataform dbt_project.yml models seeds snapshots macros ref source materialized incremental state defer sqlmesh MODEL AUDIT plan environment snapshot dataform workflow_settings definitions publish declare assert compile run", "transformationSetups", "toolSignals", "modelSignals", "dependencySignals", "incrementalitySignals", "environmentSignals", "artifactSignals", "workflowSignals", "packageSignals", "RepoTutor records data transformation readiness only", "data-transformation-readiness-card", "data-source-pattern=\"DataTransformation\"", "openTargetEntries", "data-transformation-readiness"]),
  check("data quality readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataQualityReadinessReportSchema", "DataQualityReadinessReport", "dataQualityReadinessReport", "data-quality-readiness-report.json", "data-quality-readiness.md", "data-quality-readiness.html", "Data quality readiness Great Expectations SodaCL Soda Core dbt", "dataQualitySetups", "expectationSignals", "sodaSignals", "dbtSignals", "qualityDimensionSignals", "resultSignals", "ciSignals", "packageSignals", "ExpectationSuite", "checks for", "data_tests", "data-quality-readiness-card", "data-source-pattern=\"DataQuality\"", "openTargetEntries", "data-quality-readiness"]),
  check("data lineage readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataLineageReadinessReportSchema", "DataLineageReadinessReport", "dataLineageReadinessReport", "data-lineage-readiness-report.json", "data-lineage-readiness.md", "data-lineage-readiness.html", "Data lineage readiness OpenLineage Marquez dbt", "lineageSetups", "eventSignals", "identitySignals", "datasetSignals", "facetSignals", "dbtArtifactSignals", "storageSignals", "ciSignals", "packageSignals", "RunEvent", "RunFacet", "JobFacet", "DatasetFacet", "InputDatasetFacet", "OutputDatasetFacet", "nominalTime", "sourceCodeLocation", "sourceCode", "lifecycleStateChange", "dataQualityMetrics", "dataQualityAssertions", "inputStatistics", "outputStatistics", "custom-facet", "lineage_events", "manifest.json", "data-lineage-readiness-card", "data-source-pattern=\"DataLineage\"", "openTargetEntries", "data-lineage-readiness"]),
  check("data catalog readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataCatalogReadinessReportSchema", "DataCatalogReadinessReport", "dataCatalogReadinessReport", "data-catalog-readiness-report.json", "data-catalog-readiness.md", "data-catalog-readiness.html", "Data catalog readiness OpenMetadata DataHub Amundsen", "catalogSetups", "ingestionSignals", "entitySignals", "entityMetadataSignals", "governanceSignals", "searchSignals", "lineageSignals", "ciSignals", "packageSignals", "IngestionPipeline", "MetadataChangeProposal", "EntityReference", "EntityRelationship", "fullyQualifiedName", "relationshipType", "changeDescription", "entityStatus", "customProperties", "extension", "GlossaryTerm", "data-catalog-readiness-card", "data-source-pattern=\"DataCatalog\"", "openTargetEntries", "data-catalog-readiness"]),
  check("data annotation readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataAnnotationReadinessReportSchema", "DataAnnotationReadinessReport", "dataAnnotationReadinessReport", "data-annotation-readiness-report.json", "data-annotation-readiness.md", "data-annotation-readiness.html", "Data annotation readiness Label Studio FiftyOne Argilla", "annotationSetups", "platformSignals", "projectSignals", "taskSignals", "schemaSignals", "workflowSignals", "qualitySignals", "prelabelSignals", "exportSignals", "ciSignals", "packageSignals", "label_config", "annotate(", "FeedbackDataset", "data-annotation-readiness-card", "data-source-pattern=\"DataAnnotation\"", "openTargetEntries", "data-annotation-readiness"]),
  check("lakehouse table readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["LakehouseTableReadinessReportSchema", "LakehouseTableReadinessReport", "lakehouseTableReadinessReport", "lakehouse-table-readiness-report.json", "lakehouse-table-readiness.md", "lakehouse-table-readiness.html", "Lakehouse table readiness Delta Lake Apache Iceberg Apache Hudi", "lakehouseSetups", "formatSignals", "tableSignals", "metadataSignals", "schemaSignals", "writeSignals", "timeTravelSignals", "maintenanceSignals", "streamingSignals", "ciSignals", "packageSignals", "DeltaTable", "ManifestFile", "HoodieTimeline", "lakehouse-table-readiness-card", "data-source-pattern=\"LakehouseTable\"", "openTargetEntries", "lakehouse-table-readiness"]),
  check("feature store readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["FeatureStoreReadinessReportSchema", "FeatureStoreReadinessReport", "featureStoreReadinessReport", "feature-store-readiness-report.json", "feature-store-readiness.md", "feature-store-readiness.html", "Feature store readiness Feast Feathr Hopsworks", "featureStoreSetups", "definitionSignals", "sourceSignals", "storageSignals", "retrievalSignals", "materializationSignals", "ciSignals", "packageSignals", "FeatureStore", "FeatureAnchor", "FeatureGroup", "feature-store-readiness-card", "data-source-pattern=\"FeatureStore\"", "openTargetEntries", "feature-store-readiness"]),
  check("model registry readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ModelRegistryReadinessReportSchema", "ModelRegistryReadinessReport", "modelRegistryReadinessReport", "model-registry-readiness-report.json", "model-registry-readiness.md", "model-registry-readiness.html", "Model registry readiness MLflow Kubeflow Model Registry BentoML", "modelRegistrySetups", "registrationSignals", "metadataSignals", "artifactSignals", "lifecycleSignals", "servingSignals", "lineageSignals", "ciSignals", "packageSignals", "RegisteredModel", "ModelVersion", "ModelArtifact", "model-registry-readiness-card", "data-source-pattern=\"ModelRegistry\"", "openTargetEntries", "model-registry-readiness"]),
  check("experiment tracking readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ExperimentTrackingReadinessReportSchema", "ExperimentTrackingReadinessReport", "experimentTrackingReadinessReport", "experiment-tracking-readiness-report.json", "experiment-tracking-readiness.md", "experiment-tracking-readiness.html", "Experiment tracking readiness MLflow W&B Neptune", "experimentTrackingSetups", "runSignals", "loggingSignals", "metadataSignals", "automationSignals", "storageSignals", "ciSignals", "packageSignals", "mlflow.start_run", "wandb.init", "neptune.init_run", "experiment-tracking-readiness-card", "data-source-pattern=\"ExperimentTracking\"", "openTargetEntries", "experiment-tracking-readiness"]),
  check("model monitoring readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ModelMonitoringReadinessReportSchema", "ModelMonitoringReadinessReport", "modelMonitoringReadinessReport", "model-monitoring-readiness-report.json", "model-monitoring-readiness.md", "model-monitoring-readiness.html", "Model monitoring readiness Evidently whylogs WhyLabs NannyML", "modelMonitoringSetups", "datasetSignals", "driftSignals", "qualitySignals", "performanceSignals", "reportingSignals", "alertSignals", "ciSignals", "packageSignals", "DataDriftPreset", "why.log", "CBPE", "model-monitoring-readiness-card", "data-source-pattern=\"ModelMonitoring\"", "openTargetEntries", "model-monitoring-readiness"]),
  check("model serving readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ModelServingReadinessReportSchema", "ModelServingReadinessReport", "modelServingReadinessReport", "model-serving-readiness-report.json", "model-serving-readiness.md", "model-serving-readiness.html", "Model serving readiness KServe Seldon Triton", "modelServingSetups", "platformSignals", "runtimeSignals", "protocolSignals", "routingSignals", "scalingSignals", "healthSignals", "resourceSignals", "observabilitySignals", "ciSignals", "packageSignals", "InferenceService", "SeldonDeployment", "tritonserver", "model-serving-readiness-card", "data-source-pattern=\"ModelServing\"", "openTargetEntries", "model-serving-readiness"]),
  check("model training readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ModelTrainingReadinessReportSchema", "ModelTrainingReadinessReport", "modelTrainingReadinessReport", "model-training-readiness-report.json", "model-training-readiness.md", "model-training-readiness.html", "Model training readiness Lightning Accelerate Ray Train", "modelTrainingSetups", "loopSignals", "dataSignals", "distributedSignals", "acceleratorSignals", "checkpointSignals", "callbackSignals", "observabilitySignals", "configSignals", "ciSignals", "packageSignals", "LightningModule", "Accelerator", "TorchTrainer", "model-training-readiness-card", "data-source-pattern=\"ModelTraining\"", "openTargetEntries", "model-training-readiness"]),
  check("ci cd readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["CiCdReportSchema", "CiCdReport", "ciCdReport", "ci-cd-report.json", "ci-cd.md", "ci-cd.html", "GitHub Actions workflow syntax events jobs permissions GITHUB_TOKEN OIDC cache artifacts concurrency environments deployments", "workflowFiles", "triggerSignals", "jobSignals", "securitySignals", "deliverySignals", "platformSignals", "npx actionlint", "ci-cd-card", "data-source-pattern=\"GitHub Actions\"", "openTargetEntries", "ci-cd"]),
  check("unit test readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["UnitTestReportSchema", "UnitTestReport", "unitTestReport", "unit-test-report.json", "unit-tests.md", "unit-tests.html", "Vitest test files config coverage v8 istanbul snapshots mocks jsdom happy-dom browser mode projects reporters", "testFiles", "configFiles", "assertionSignals", "mockSignals", "coverageSignals", "environmentSignals", "reportingSignals", "npx vitest run --coverage", "unit-test-card", "data-source-pattern=\"Vitest\"", "openTargetEntries", "unit-tests"]),
  check("coverage readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CoverageReadinessReportSchema", "CoverageReadinessReport", "coverageReadinessReport", "coverage-readiness-report.json", "coverage-readiness.md", "coverage-readiness.html", "nyc c8 Istanbul V8 coverage lcov cobertura coverage-final check-coverage thresholds Codecov OIDC flags", "coverageSetups", "instrumentationSignals", "scopeSignals", "thresholdSignals", "reportSignals", "ciUploadSignals", "packageSignals", "npx nyc --all", "coverage-readiness-card", "data-source-pattern=\"nyc\"", "openTargetEntries", "coverage-readiness"]),
  check("mutation testing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["MutationTestingReadinessReportSchema", "MutationTestingReadinessReport", "mutationTestingReadinessReport", "mutation-testing-readiness-report.json", "mutation-testing-readiness.md", "mutation-testing-readiness.html", "Stryker mutation testing mutate patterns mutators testRunner coverageAnalysis reporters thresholds mutationScore killed survived timeout ignored incremental dashboard HTML JSON mutation-testing-report-schema Infection MSI covered MSI with-uncovered", "mutationSetups", "toolSignals", "configSignals", "qualitySignals", "reporterSignals", "scopeSignals", "packageSignals", "npx stryker run", "mutation-testing-readiness-card", "data-source-pattern=\"Stryker\"", "openTargetEntries", "mutation-testing-readiness"]),
  check("typecheck readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["TypecheckReadinessReportSchema", "TypecheckReadinessReport", "typecheckReadinessReport", "typecheck-readiness-report.json", "typecheck-readiness.md", "typecheck-readiness.html", "TypeScript compilerOptions strict noImplicitAny strictNullChecks composite references declaration noEmit moduleResolution paths types skipLibCheck tsc build", "tsconfigFiles", "compilerOptionSignals", "projectSignals", "moduleResolutionSignals", "declarationSignals", "scriptSignals", "npx tsc --noEmit", "typecheck-card", "data-source-pattern=\"TypeScript\"", "openTargetEntries", "typecheck-readiness"]),
  check("package manager readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["PackageManagerReportSchema", "PackageManagerReport", "packageManagerReport", "package-manager-report.json", "package-manager.md", "package-manager.html", "pnpm packageManager devEngines workspace packages catalog lockfile importers allowBuilds auditConfig pnpmfile hooks recursive filter frozen-lockfile", "manifestFiles", "workspaceSignals", "lockfileSignals", "scriptSignals", "policySignals", "pnpm install --frozen-lockfile", "package-manager-card", "data-source-pattern=\"pnpm\"", "openTargetEntries", "package-manager"]),
  check("git hooks readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["GitHooksReportSchema", "GitHooksReport", "gitHooksReport", "git-hooks-report.json", "git-hooks.md", "git-hooks.html", "Husky .husky hook files prepare core.hooksPath pre-commit pre-push commit-msg HUSKY=0 no-verify lint-staged POSIX shell", "Lefthook lefthook.yml jobs commands scripts parallel group piped glob files root tags skip only stage_fixed runner output extends remotes local config run validate dump", "hookFiles", "installSignals", "commandSignals", "policySignals", "toolConfigFiles", "lefthookSignals", "git config --get core.hooksPath", "lefthook validate", "Lefthook Signals", "git-hooks-card", "data-source-pattern=\"Husky Lefthook\"", "openTargetEntries", "git-hooks"]),
  check("task runner readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["TaskRunnerReportSchema", "TaskRunnerReport", "taskRunnerReport", "task-runner-report.json", "task-runner.md", "task-runner.html", "Turborepo turbo.json tasks dependsOn outputs inputs cache env globalEnv passThroughEnv persistent turbo run filter remote cache", "configFiles", "taskSignals", "cacheSignals", "dependencySignals", "environmentSignals", "packageScriptSignals", "pnpm turbo run build --dry=json", "task-runner-card", "data-source-pattern=\"Turborepo\"", "openTargetEntries", "task-runner"]),
  check("dependency updates readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DependencyUpdateReportSchema", "DependencyUpdateReport", "dependencyUpdateReport", "dependency-update-report.json", "dependency-updates.md", "dependency-updates.html", "Renovate config presets packageRules automerge schedule dependencyDashboard enabledManagers hostRules rangeStrategy prConcurrentLimit configMigration", "configFiles", "managerSignals", "policySignals", "workflowSignals", "registrySignals", "packageFileSignals", "npx renovate-config-validator", "dependency-update-card", "data-source-pattern=\"Renovate\"", "openTargetEntries", "dependency-updates"]),
  check("dependency review readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DependencyReviewReadinessReportSchema", "DependencyReviewReadinessReport", "dependencyReviewReadinessReport", "dependency-review-readiness-report.json", "dependency-review-readiness.md", "dependency-review-readiness.html", "Dependency Review readiness actions/dependency-review-action fail-on-severity vulnerability-check license-check allow-licenses deny-licenses allow-dependencies-licenses deny-packages base-ref head-ref snapshot warnings OpenSSF scorecard Dependabot OSV Scanner lockfile license offline remediation PR summary artifact SARIF JSON HTML", "dependencyReviewSetups", "reviewSignals", "vulnerabilitySignals", "licenseSignals", "packagePolicySignals", "ciSignals", "scorecardSignals", "outputSignals", "packageSignals", "Run Dependency Review, Dependabot, OSV Scanner, GitHub API, registry, deps.dev, and remediation commands only in an authorized local or CI environment", "dependency-review-readiness-card", "data-source-pattern=\"Dependency Review\"", "openTargetEntries", "dependency-review-readiness"]),
  check("lint readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["LintReadinessReportSchema", "LintReadinessReport", "lintReadinessReport", "lint-readiness-report.json", "lint-readiness.md", "lint-readiness.html", "ESLint flat config rules plugins parser ignores fix cache max-warnings report-unused-disable-directives print-config inspect-config", "configFiles", "ruleSignals", "scriptSignals", "scopeSignals", "outputSignals", "packageSignals", "npx eslint --print-config <file>", "lint-readiness-card", "data-source-pattern=\"ESLint\"", "openTargetEntries", "lint-readiness"]),
  check("format readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["FormatReadinessReportSchema", "FormatReadinessReport", "formatReadinessReport", "format-readiness-report.json", "format-readiness.md", "format-readiness.html", "Prettier config ignore options plugins parser check write list-different cache editorconfig file-info find-config-path", "configFiles", "ignoreFiles", "optionSignals", "scriptSignals", "scopeSignals", "packageSignals", "npx prettier --find-config-path <file>", "format-readiness-card", "data-source-pattern=\"Prettier\"", "openTargetEntries", "format-readiness"]),
  check("commit conventions report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["CommitConventionReportSchema", "CommitConventionReport", "commitConventionReport", "commit-conventions-report.json", "commit-conventions.md", "commit-conventions.html", "commitlint config conventional commits rules parserPreset commit-msg husky from to last edit strict verbose prompt", "configFiles", "ruleSignals", "hookSignals", "commandSignals", "packageSignals", "npx commitlint --from <base-sha> --to <head-sha> --verbose", "commit-convention-card", "data-source-pattern=\"commitlint\"", "openTargetEntries", "commit-conventions"]),
  check("changelog readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ChangelogReadinessReportSchema", "ChangelogReadinessReport", "changelogReadinessReport", "changelog-readiness-report.json", "changelog-readiness.md", "changelog-readiness.html", "Changesets config changeset files changelog version publish status pre snapshot fixed linked private packages", "configFiles", "changesetFiles", "workflowSignals", "commandSignals", "packageSignals", "policySignals", "npx changeset status --since=main --output=changeset-status.json", "changelog-readiness-card", "data-source-pattern=\"Changesets\"", "openTargetEntries", "changelog-readiness"]),
  check("bundle analysis report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["BundleAnalysisReportSchema", "BundleAnalysisReport", "bundleAnalysisReport", "bundle-analysis-report.json", "bundle-analysis.md", "bundle-analysis.html", "Webpack Bundle Analyzer stats json analyzerMode reportFilename defaultSizes gzip parsed stat source maps chunks assets", "configFiles", "bundleArtifacts", "sizeSignals", "scriptSignals", "packageSignals", "npx webpack-bundle-analyzer stats.json dist --mode static --report bundle-report.html --no-open", "bundle-analysis-card", "data-source-pattern=\"Webpack Bundle Analyzer\"", "openTargetEntries", "bundle-analysis"]),
  check("mocking readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["MockingReadinessReportSchema", "MockingReadinessReport", "mockingReadinessReport", "mocking-readiness-report.json", "mocking-readiness.md", "mocking-readiness.html", "Mock Service Worker setupWorker setupServer http graphql ws sse HttpResponse handlers onUnhandledRequest resetHandlers restoreHandlers passthrough bypass boundary events listHandlers serviceWorker findWorker quiet waitUntilReady cookieStore delay", "handlerFiles", "serverSetups", "protocolSignals", "lifecycleSignals", "mswSignals", "MSW Signals", "packageSignals", "npx msw init public/ --save", "mocking-readiness-card", "data-source-pattern=\"Mock Service Worker\"", "openTargetEntries", "mocking-readiness"]),
  check("data fetching readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DataFetchingReadinessReportSchema", "DataFetchingReadinessReport", "dataFetchingReadinessReport", "data-fetching-readiness-report.json", "data-fetching-readiness.md", "data-fetching-readiness.html", "TanStack Query QueryClient QueryClientProvider useQuery useMutation queryOptions infiniteQueryOptions mutationOptions useQueries useSuspenseQuery useSuspenseInfiniteQuery usePrefetchQuery queryKey queryFn invalidateQueries refetchQueries cancelQueries removeQueries setQueryData setQueriesData getQueryData getQueryState ensureQueryData staleTime gcTime retry retryDelay networkMode structuralSharing hydrate dehydrate HydrationBoundary persistQueryClient PersistQueryClientProvider createPersister broadcastQueryClient focusManager onlineManager notifyManager streamedQuery devtools", "clientSetups", "queryUsages", "cacheSignals", "dataFlowSignals", "tanstackQuerySignals", "TanStack Query Signals", "packageSignals", "packages/core/src/scanner.ts:npx eslint . --rule '@tanstack/query/stable-query-client:error'", "data-fetching-card", "data-source-pattern=\"TanStack Query\"", "openTargetEntries", "data-fetching-readiness"]),
  check("routing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["RoutingReadinessReportSchema", "RoutingReadinessReport", "routingReadinessReport", "routing-readiness-report.json", "routing-readiness.md", "routing-readiness.html", "React Router TanStack Router BrowserRouter createBrowserRouter RouterProvider routes.ts route index Link NavLink Outlet loader action ErrorBoundary useNavigate useParams useSearchParams createRouter routeTree routeTree.gen createFileRoute createRootRoute createRoute Route.useParams validateSearch beforeLoad SearchSchemaInput linkOptions createRouteMask preload notFound TanStackRouterVite TanStackRouterDevtools", "routingSetups", "routeDefinitions", "navigationSignals", "dataRouteSignals", "fileRouteSignals", "tanstackSignals", "packageSignals", "npx react-router typegen", "routing-readiness-card", "data-source-pattern=\"React Router TanStack Router\"", "openTargetEntries", "routing-readiness"]),
  check("state management readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["StateManagementReadinessReportSchema", "StateManagementReadinessReport", "stateManagementReadinessReport", "state-management-readiness-report.json", "state-management-readiness.md", "state-management-readiness.html", "Redux Toolkit configureStore createSlice reducers actions selectors Provider useSelector useDispatch createAsyncThunk createListenerMiddleware createEntityAdapter middleware devTools RTK Query Zustand create createStore useStore useShallow shallow subscribeWithSelector persist createJSONStorage devtools immer redux combine setState getState getInitialState subscribe StateCreator StoreApi Mutate StoreMutatorIdentifier Jotai atom primitive atom derived atom useAtom useAtomValue useSetAtom Provider createStore getDefaultStore store.get store.set store.sub onMount debugLabel atomWithStorage atomFamily selectAtom splitAtom focusAtom loadable unwrap useHydrateAtoms useAtomCallback devtools atomEffect atomWithImmer Valtio proxy useSnapshot snapshot subscribe subscribeKey watch ref devtools proxyMap proxySet useProxy derive deepClone unstable_deepProxy sync Snapshot MobX makeAutoObservable makeObservable observable computed action runInAction flow autorun reaction when configure observer useLocalObservable Provider inject spy trace toJS", "storeSetups", "sliceDefinitions", "selectorSignals", "sideEffectSignals", "entitySignals", "middlewareSignals", "rtkQuerySignals", "zustandSignals", "Zustand Signals", "jotaiSignals", "Jotai Signals", "valtioSignals", "Valtio Signals", "mobxSignals", "MobX Signals", "packageSignals", "npx vitest run", "state-management-card", "data-source-pattern=\"Redux Toolkit\"", "openTargetEntries", "state-management-readiness"]),
  check("form readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["FormReadinessReportSchema", "FormReadinessReport", "formReadinessReport", "form-readiness-report.json", "form-readiness.md", "form-readiness.html", "React Hook Form useForm register handleSubmit Controller useController FormProvider useFormContext useFieldArray append remove move insert update replace swap resolver mode reValidateMode criteriaMode errors defaultValues values watch useWatch useFormState formState reset resetField setValue getValues getFieldState setError clearErrors trigger shouldUnregister disabled delayError shouldFocusError context control RegisterOptions FieldValues FieldPath SubmitHandler UseFormReturn ControllerRenderProps Form component FormStateSubscribe createFormControl validation", "formSetups", "fieldRegistrations", "validationSignals", "errorSignals", "valueFlowSignals", "reactHookFormSignals", "React Hook Form Signals", "packageSignals", "npx vitest run", "form-readiness-card", "data-source-pattern=\"React Hook Form\"", "openTargetEntries", "form-readiness"]),
  check("auth readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["AuthReadinessReportSchema", "AuthReadinessReport", "authReadinessReport", "auth-readiness-report.json", "auth-readiness.md", "auth-readiness.html", "Auth.js NextAuth auth handlers auth signIn signOut exports providers callbacks session strategy maxAge updateAge jwt middleware protected routes trustHost basePath raw env secrets adapter WebAuthn experimental useSession SessionProvider", "authSetups", "sessionSurfaces", "runtimeSignals", "protectionSignals", "providerSignals", "callbackSignals", "credentialSignals", "packageSignals", "npx vitest run", "auth-readiness-card", "data-source-pattern=\"Auth.js\"", "openTargetEntries", "auth-readiness"]),
  check("authorization readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["AuthorizationReadinessReportSchema", "AuthorizationReadinessReport", "authorizationReadinessReport", "authorization-readiness-report.json", "authorization-readiness.md", "authorization-readiness.html", "Authorization readiness OpenFGA Casbin CASL Oso RBAC ABAC ReBAC ACL relationship tuples policy model roles permissions resources actions guards middleware can checks deny by default ownership tenants organizations audit decision logs tests", "authorizationSetups", "modelSignals", "enforcementSignals", "identitySignals", "resourceSignals", "governanceSignals", "testSignals", "packageSignals", "npx vitest run", "authorization-readiness-card", "data-source-pattern=\"OpenFGA\"", "openTargetEntries", "authorization-readiness"]),
  check("payment readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["PaymentReadinessReportSchema", "PaymentReadinessReport", "paymentReadinessReport", "payment-readiness-report.json", "payment-readiness.md", "payment-readiness.html", "Stripe new Stripe checkout sessions payment intents subscriptions customers invoices billing portal webhooks constructEvent raw body signature idempotency apiVersion env price", "paymentSetups", "checkoutSignals", "webhookSignals", "customerSignals", "credentialSignals", "packageSignals", "npx vitest run", "payment-readiness-card", "data-source-pattern=\"Stripe\"", "openTargetEntries", "payment-readiness"]),
  check("email readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["EmailReadinessReportSchema", "EmailReadinessReport", "emailReadinessReport", "email-readiness-report.json", "email-readiness.md", "email-readiness.html", "Resend new Resend emails.send batch.send domains verify webhooks verify standardwebhooks apiKeys contacts audiences segments broadcasts automations templates events logs receiving from to subject html react attachments replyTo RESEND_API_KEY idempotency", "emailSetups", "recipientSignals", "deliverySignals", "templateSignals", "providerSignals", "credentialSignals", "packageSignals", "npx vitest run", "email-readiness-card", "data-source-pattern=\"Resend\"", "openTargetEntries", "email-readiness"]),
  check("queue readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["QueueReadinessReportSchema", "QueueReadinessReport", "queueReadinessReport", "queue-readiness-report.json", "queue-readiness.md", "queue-readiness.html", "BullMQ Queue Worker QueueEvents FlowProducer JobScheduler queue.add addBulk repeat attempts backoff removeOnComplete removeOnFail Redis connection concurrency limiter stalled failed completed metrics telemetry", "queueSetups", "producerSignals", "workerSignals", "reliabilitySignals", "connectionSignals", "packageSignals", "npx vitest run", "queue-readiness-card", "data-source-pattern=\"BullMQ\"", "openTargetEntries", "queue-readiness"]),
  check("event stream readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["EventStreamReadinessReportSchema", "EventStreamReadinessReport", "eventStreamReadinessReport", "event-stream-readiness-report.json", "event-stream-readiness.md", "event-stream-readiness.html", "Event stream readiness Apache Kafka Redpanda Apache Pulsar KafkaProducer KafkaConsumer AdminClient NewTopic consumer group group.protocol consumer streams classic group coordinator __consumer_offsets auto.offset.reset enable.auto.commit isolation.level partition assignment rebalance metrics offset commit rebalance schema registry DLQ retention compaction idempotence transactions ACL SASL PulsarClient SubscriptionType BookKeeper tenant namespace CI", "eventStreamSetups", "platformSignals", "brokerSignals", "topicSignals", "producerSignals", "consumerSignals", "groupProtocolSignals", "Group Protocol Signals", "schemaSignals", "reliabilitySignals", "securitySignals", "opsSignals", "ciSignals", "packageSignals", "event-stream-readiness-card", "data-source-pattern=\"EventStream\"", "openTargetEntries", "event-stream-readiness"]),
  check("data connector readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataConnectorReadinessReportSchema", "DataConnectorReadinessReport", "dataConnectorReadinessReport", "data-connector-readiness-report.json", "data-connector-readiness.md", "data-connector-readiness.html", "Data connector readiness Debezium Kafka Connect Airbyte", "connectorSetups", "platformSignals", "connectorKindSignals", "configSignals", "protocolSignals", "stateSignals", "transformSignals", "opsSignals", "workflowSignals", "packageSignals", "Spec", "Check", "Discover", "Read", "AirbyteCatalog", "ConfiguredAirbyteCatalog", "AirbyteRecordMessage", "AirbyteStateMessage", "AirbyteTraceMessage", "primary_key", "cursor_field", "RepoTutor records data connector readiness only", "data-connector-readiness-card", "data-source-pattern=\"DataConnector\"", "openTargetEntries", "data-connector-readiness"]),
  check("semantic layer readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SemanticLayerReadinessReportSchema", "SemanticLayerReadinessReport", "semanticLayerReadinessReport", "semantic-layer-readiness-report.json", "semantic-layer-readiness.md", "semantic-layer-readiness.html", "Semantic layer readiness MetricFlow dbt Semantic Layer Cube semantic_models metrics measures dimensions entities saved_queries TimeDimension Dimension agg_time_dimension type_params ratio derived cumulative cubes joins pre_aggregations access_policy query_rewrite SQL REST GraphQL", "semanticLayerSetups", "platformSignals", "modelSignals", "metricSignals", "dimensionSignals", "entitySignals", "querySignals", "cacheSignals", "accessSignals", "workflowSignals", "packageSignals", "RepoTutor records semantic layer readiness only", "semantic-layer-readiness-card", "data-source-pattern=\"SemanticLayer\"", "openTargetEntries", "semantic-layer-readiness"]),
  check("BI dashboard readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["BiDashboardReadinessReportSchema", "BiDashboardReadinessReport", "biDashboardReadinessReport", "bi-dashboard-readiness-report.json", "bi-dashboard-readiness.md", "bi-dashboard-readiness.html", "BI dashboard readiness Metabase Superset Lightdash dashboards cards charts queries datasets saved questions explores metrics semantic layer filters parameters drilldowns alerts subscriptions embedded analytics permissions roles row level security cache refresh SQL lab database connections", "dashboardSetups", "platformSignals", "dashboardSignals", "querySignals", "filterSignals", "accessSignals", "embeddingSignals", "alertSignals", "cacheSignals", "workflowSignals", "packageSignals", "RepoTutor records BI dashboard readiness only", "bi-dashboard-readiness-card", "data-source-pattern=\"BIDashboard\"", "openTargetEntries", "bi-dashboard-readiness"]),
  check("schema registry readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SchemaRegistryReadinessReportSchema", "SchemaRegistryReadinessReport", "schemaRegistryReadinessReport", "schema-registry-readiness-report.json", "schema-registry-readiness.md", "schema-registry-readiness.html", "Schema registry readiness Confluent Apicurio Buf subject artifact version compatibility Avro Protobuf JSON Schema lint breaking generate push", "registrySetups", "registrySignals", "schemaFormatSignals", "identitySignals", "compatibilitySignals", "governanceSignals", "workflowSignals", "packageSignals", "RepoTutor records schema registry readiness only", "schema-registry-readiness-card", "data-source-pattern=\"Schema Registry\"", "openTargetEntries", "schema-registry-readiness"]),
  check("stream processing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["StreamProcessingReadinessReportSchema", "StreamProcessingReadinessReport", "streamProcessingReadinessReport", "stream-processing-readiness-report.json", "stream-processing-readiness.md", "stream-processing-readiness.html", "Stream processing readiness Apache Flink Apache Beam Spark Structured Streaming StreamExecutionEnvironment DataStream Pipeline PCollection readStream writeStream checkpointing savepoint state backend WatermarkStrategy window trigger exactly-once sink runner deployment metrics CI", "streamProcessingSetups", "engineSignals", "jobSignals", "sourceSignals", "transformSignals", "windowSignals", "watermarkSignals", "stateSignals", "checkpointSignals", "sinkSignals", "deploymentSignals", "monitoringSignals", "ciSignals", "packageSignals", "Inventory Flink job entrypoints", "stream-processing-readiness-card", "data-source-pattern=\"StreamProcessing\"", "openTargetEntries", "stream-processing-readiness"]),
  check("pipeline orchestration readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["PipelineOrchestrationReadinessReportSchema", "PipelineOrchestrationReadinessReport", "pipelineOrchestrationReadinessReport", "pipeline-orchestration-readiness-report.json", "pipeline-orchestration-readiness.md", "pipeline-orchestration-readiness.html", "Pipeline orchestration readiness Apache Airflow Dagster Prefect airflow.sdk stable authoring interface DAG dag task task_group setup teardown Param Context TriggerRule Asset flow asset sensor schedule backfill catchup partition retry SLA XCom executor worker deployment run history CI", "pipelineOrchestrationSetups", "orchestratorSignals", "authoringSignals", "dagSignals", "taskSignals", "dependencySignals", "scheduleSignals", "sensorSignals", "assetSignals", "partitionSignals", "reliabilitySignals", "executorSignals", "deploymentSignals", "observabilitySignals", "ciSignals", "packageSignals", "Inventory Airflow DAG entrypoints", "Authoring Signals", "pipeline-orchestration-readiness-card", "data-source-pattern=\"PipelineOrchestration\"", "openTargetEntries", "pipeline-orchestration-readiness"]),
  check("service mesh readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ServiceMeshReadinessReportSchema", "ServiceMeshReadinessReport", "serviceMeshReadinessReport", "service-mesh-readiness-report.json", "service-mesh-readiness.md", "service-mesh-readiness.html", "Service mesh readiness Istio Linkerd Consul Envoy Gateway API VirtualService DestinationRule Gateway Sidecar EnvoyFilter PeerAuthentication AuthorizationPolicy RequestAuthentication ServiceEntry HTTPRoute GRPCRoute TrafficSplit ServerAuthorization MeshTLSAuthentication service-defaults service-router service-splitter service-resolver proxy-defaults intentions mTLS SPIFFE telemetry proxy-config CI", "serviceMeshSetups", "meshSignals", "controlPlaneSignals", "injectionSignals", "trafficSignals", "securitySignals", "mtlsSignals", "resilienceSignals", "gatewaySignals", "telemetrySignals", "multiclusterSignals", "ciSignals", "packageSignals", "Run service mesh commands only in a trusted cluster", "service-mesh-readiness-card", "data-source-pattern=\"ServiceMesh\"", "openTargetEntries", "service-mesh-readiness"]),
  check("ingress controller readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["IngressControllerReadinessReportSchema", "IngressControllerReadinessReport", "ingressControllerReadinessReport", "ingress-controller-readiness-report.json", "ingress-controller-readiness.md", "ingress-controller-readiness.html", "Ingress controller readiness ingress-nginx Traefik Envoy Gateway IngressClass IngressRoute Middleware GatewayClass Gateway HTTPRoute GRPCRoute BackendTrafficPolicy SecurityPolicy ClientTrafficPolicy TLSOption TLSStore LoadBalancer NodePort admission webhook cert-manager Prometheus access logs rate limit CI", "ingressControllerSetups", "controllerSignals", "ingressClassSignals", "routeSignals", "serviceExposureSignals", "tlsSignals", "middlewareSignals", "policySignals", "loadBalancingSignals", "observabilitySignals", "admissionSignals", "ciSignals", "packageSignals", "Run ingress controller commands only in a trusted cluster", "ingress-controller-readiness-card", "data-source-pattern=\"IngressController\"", "openTargetEntries", "ingress-controller-readiness"]),
  check("dns readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DnsReadinessReportSchema", "DnsReadinessReport", "dnsReadinessReport", "dns-readiness-report.json", "dns-readiness.md", "dns-readiness.html", "DNS readiness ExternalDNS CoreDNS octoDNS Route53 Cloudflare Google Cloud DNS Azure DNS source provider zone record TXT registry Corefile forward cache kubernetes plugin octodns-sync dry-run dig", "dnsSetups", "providerSignals", "sourceSignals", "zoneSignals", "recordSignals", "ownershipSignals", "coreDnsSignals", "automationSignals", "observabilitySignals", "ciSignals", "packageSignals", "Run DNS provider, CoreDNS, octoDNS, and dig commands only in a trusted sandbox", "dns-readiness-card", "data-source-pattern=\"DNS\"", "openTargetEntries", "dns-readiness"]),
  check("certificate readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["CertificateReadinessReportSchema", "CertificateReadinessReport", "certificateReadinessReport", "certificate-readiness-report.json", "certificate-readiness.md", "certificate-readiness.html", "Certificate readiness cert-manager step-ca CertMagic ACME Certificate Issuer ClusterIssuer CertificateRequest Order Challenge DNS01 HTTP01 TLS-ALPN renewBefore duration privateKey rotation Secret cainjector trust-manager root intermediate CRL OCSP cmctl step ca renew", "certificateSetups", "platformSignals", "resourceSignals", "issuerSignals", "challengeSignals", "lifecycleSignals", "trustSignals", "revocationSignals", "automationSignals", "observabilitySignals", "ciSignals", "packageSignals", "Run certificate manager, CA, ACME, DNS, TLS, and revocation commands only in a trusted sandbox", "certificate-readiness-card", "data-source-pattern=\"Certificate\"", "openTargetEntries", "certificate-readiness"]),
  check("helm readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["HelmReadinessReportSchema", "HelmReadinessReport", "helmReadinessReport", "helm-readiness-report.json", "helm-readiness.md", "helm-readiness.html", "Helm readiness Chart.yaml values.yaml templates _helpers.tpl values.schema.json Chart.lock helm lint template install upgrade rollback test package push provenance chart-testing ct lint ct install chart-releaser cr upload cr index OCI kubeconform", "helmSetups", "chartSignals", "templateSignals", "valuesSignals", "dependencySignals", "validationSignals", "releaseSignals", "securitySignals", "ciSignals", "packageSignals", "Run Helm, Kubernetes, chart-testing, chart-releaser, OCI registry, and signing commands only in a trusted sandbox", "helm-readiness-card", "data-source-pattern=\"Helm\"", "openTargetEntries", "helm-readiness"]),
  check("admission policy readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["AdmissionPolicyReadinessReportSchema", "AdmissionPolicyReadinessReport", "admissionPolicyReadinessReport", "admission-policy-readiness-report.json", "admission-policy-readiness.md", "admission-policy-readiness.html", "Admission policy readiness Kyverno ClusterPolicy PolicyException validate mutate generate verifyImages validationFailureAction Gatekeeper ConstraintTemplate constraint enforcementAction audit warn dryrun gator ValidatingAdmissionPolicy MutatingAdmissionPolicy admissionReviewVersions failurePolicy matchConditions validationActions PolicyReport", "admissionSetups", "controllerSignals", "policySignals", "ruleSignals", "enforcementSignals", "exceptionSignals", "validationSignals", "observabilitySignals", "ciSignals", "packageSignals", "Run Kyverno, Gatekeeper, kubectl, and admission webhook checks only in a trusted sandbox", "admission-policy-readiness-card", "data-source-pattern=\"AdmissionPolicy\"", "openTargetEntries", "admission-policy-readiness"]),
  check("api gateway readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ApiGatewayReadinessReportSchema", "ApiGatewayReadinessReport", "apiGatewayReadinessReport", "api-gateway-readiness-report.json", "api-gateway-readiness.md", "api-gateway-readiness.html", "API gateway readiness Kong Service Route Plugin Consumer Upstream Target key-auth jwt acl rate-limiting decK Tyk api_definition listen_path target_url auth_configs quota analytics KrakenD endpoint backend extra_config qos/ratelimit telemetry krakend check plugin", "apiGatewaySetups", "gatewaySignals", "routeSignals", "upstreamSignals", "authSignals", "pluginSignals", "trafficPolicySignals", "observabilitySignals", "validationSignals", "ciSignals", "packageSignals", "Run Kong, decK, Tyk, KrakenD, cloud gateway, Docker, Kubernetes, and sync commands only in a trusted sandbox", "api-gateway-readiness-card", "data-source-pattern=\"ApiGateway\"", "openTargetEntries", "api-gateway-readiness"]),
  check("cache readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["CacheReadinessReportSchema", "CacheReadinessReport", "cacheReadinessReport", "cache-readiness-report.json", "cache-readiness.md", "cache-readiness.html", "Node Redis createClient connect get set EX NX expire ttl del mGet mSet scanIterator multi watch clientSideCache RESP socket reconnect isReady", "cacheSetups", "operationSignals", "policySignals", "connectionSignals", "advancedSignals", "packageSignals", "npx vitest run", "cache-readiness-card", "data-source-pattern=\"Node Redis\"", "openTargetEntries", "cache-readiness"]),
  check("logging readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["LoggingReadinessReportSchema", "LoggingReadinessReport", "loggingReadinessReport", "logging-readiness-report.json", "logging-readiness.md", "logging-readiness.html", "Pino Zap Zerolog pino logger.info logger.error child logger level transport destination redact serializers pino-pretty multistream timestamp formatters mixin bindings go.uber.org/zap zap.NewProduction zap.NewDevelopment zap.Config zap.AtomicLevel zap.Logger zap.SugaredLogger zap.String zap.Error zap.Any zapcore.NewCore EncoderConfig WriteSyncer Sync AddCaller AddStacktrace Sampling github.com/rs/zerolog zerolog.New log.Info Msg Msgf With Timestamp SetGlobalLevel ConsoleWriter MultiLevelWriter hlog diode journald syslog", "loggingSetups", "levelSignals", "contextSignals", "safetySignals", "transportSignals", "packageSignals", "npx vitest run", "logging-readiness-card", "data-source-pattern=\"Pino Zap Zerolog\"", "openTargetEntries", "logging-readiness"]),
  check("feature flag readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["FeatureFlagReadinessReportSchema", "FeatureFlagReadinessReport", "featureFlagReadinessReport", "feature-flag-readiness-report.json", "feature-flag-readiness.md", "feature-flag-readiness.html", "OpenFeature setProviderAndWait setProvider getClient getBooleanValue getStringValue getNumberValue getObjectValue getBooleanDetails EvaluationContext targetingKey hooks events tracking shutdown MultiProvider Unleash flexibleRollout constraints segments variants impressionData stickiness stale archived GrowthBook isOn isOff getFeatureValue trackingCallback stickyBucket remoteEval subscribeToChanges EventSource encryptedFeatures safe rollout", "featureFlagSetups", "evaluationSignals", "contextSignals", "lifecycleSignals", "packageSignals", "npx vitest run", "feature-flag-readiness-card", "data-source-pattern=\"OpenFeature Unleash GrowthBook\"", "openTargetEntries", "feature-flag-readiness"]),
  check("rate limit readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["RateLimitReadinessReportSchema", "RateLimitReadinessReport", "rateLimitReadinessReport", "rate-limit-readiness-report.json", "rate-limit-readiness.md", "rate-limit-readiness.html", "rate-limiter-flexible RateLimiterMemory RateLimiterRedis points duration blockDuration keyPrefix storeClient consume penalty reward insuranceLimiter msBeforeNext remainingPoints Retry-After X-RateLimit", "rateLimitSetups", "quotaSignals", "identitySignals", "storeSignals", "responseSignals", "resilienceSignals", "packageSignals", "npx vitest run", "rate-limit-readiness-card", "data-source-pattern=\"rate-limiter-flexible\"", "openTargetEntries", "rate-limit-readiness"]),
  check("error tracking readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ErrorTrackingReadinessReportSchema", "ErrorTrackingReadinessReport", "errorTrackingReadinessReport", "error-tracking-readiness-report.json", "error-tracking-readiness.md", "error-tracking-readiness.html", "Sentry.init dsn captureException captureMessage captureEvent withScope setUser setContext setTag beforeSend ignoreErrors tracesSampleRate tracePropagationTargets replayIntegration ErrorBoundary", "errorTrackingSetups", "captureSignals", "contextSignals", "filteringSignals", "observabilitySignals", "packageSignals", "npx vitest run", "error-tracking-readiness-card", "data-source-pattern=\"Sentry\"", "openTargetEntries", "error-tracking-readiness"]),
  check("analytics readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["AnalyticsReadinessReportSchema", "AnalyticsReadinessReport", "analyticsReadinessReport", "analytics-readiness-report.json", "analytics-readiness.md", "analytics-readiness.html", "posthog.init posthog.capture posthog.identify posthog.alias posthog.group posthog.reset autocapture capture_pageview opt_in_capturing opt_out_capturing before_send getFeatureFlag onFeatureFlags session_recording", "analyticsSetups", "eventSignals", "identitySignals", "privacySignals", "productSignals", "packageSignals", "npx vitest run", "analytics-readiness-card", "data-source-pattern=\"PostHog\"", "openTargetEntries", "analytics-readiness"]),
  check("http client readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["HttpClientReadinessReportSchema", "HttpClientReadinessReport", "httpClientReadinessReport", "http-client-readiness-report.json", "http-client-readiness.md", "http-client-readiness.html", "got timeout retry limit methods statusCodes hooks beforeRequest afterResponse beforeRetry beforeError prefixUrl searchParams responseType throwHttpErrors HTTPError RequestError agent cache http2 pagination", "httpClientSetups", "requestSignals", "resilienceSignals", "configurationSignals", "transportSignals", "errorSignals", "packageSignals", "npx vitest run", "http-client-readiness-card", "data-source-pattern=\"Got\"", "openTargetEntries", "http-client-readiness"]),
  check("schema validation readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SchemaValidationReadinessReportSchema", "SchemaValidationReadinessReport", "schemaValidationReadinessReport", "schema-validation-readiness-report.json", "schema-validation-readiness.md", "schema-validation-readiness.html", "z.object z.array z.union z.discriminatedUnion parse safeParse parseAsync safeParseAsync z.infer z.input z.output refine superRefine transform preprocess coerce ZodError flatten treeifyError toJSONSchema zod/v4 zod/mini globalRegistry register meta describe codec decode encode prefault readonly templateLiteral stringbool", "Valibot v.object v.pipe v.variant v.picklist parse safeParse parser safeParser InferInput InferOutput InferIssue ValiError issues flatten forward partialCheck rawCheck metadata @valibot/to-json-schema zod-to-valibot Standard Schema", "schemaSetups", "shapeSignals", "parserSignals", "typeSignals", "refinementSignals", "errorSignals", "integrationSignals", "zodSignals", "Zod Signals", "valibotSignals", "Valibot Signals", "packageSignals", "npx vitest run", "schema-validation-readiness-card", "data-source-pattern=\"Zod Valibot\"", "openTargetEntries", "schema-validation-readiness"]),
  check("datetime readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DateTimeReadinessReportSchema", "DateTimeReadinessReport", "dateTimeReadinessReport", "datetime-readiness-report.json", "datetime-readiness.md", "datetime-readiness.html", "DateTime Duration Interval Zone setZone fromISO fromFormat fromJSDate toISO toFormat toLocaleString diff plus minus startOf endOf isValid invalidReason Settings defaultZone Info Settings IANAZone FixedOffsetZone InvalidZone SystemZone fromRFC2822 fromHTTP fromSQL fromFormatExplain keepLocalTime keepCalendarTime resolvedLocaleOptions outputCalendar numberingSystem toRelativeCalendar toHuman shiftTo normalize rescale splitBy mapEndpoints contains overlaps engulfs abuts Settings.now throwOnInvalid", "dateTimeSetups", "constructionSignals", "parsingSignals", "formattingSignals", "zoneSignals", "durationSignals", "validitySignals", "luxonSignals", "Luxon Signals", "packageSignals", "npx vitest run", "datetime-readiness-card", "data-source-pattern=\"Luxon\"", "openTargetEntries", "datetime-readiness"]),
  check("id generation readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["IdGenerationReadinessReportSchema", "IdGenerationReadinessReport", "idGenerationReadinessReport", "id-generation-readiness-report.json", "id-generation-readiness.md", "id-generation-readiness.html", "nanoid customAlphabet customRandom urlAlphabet random nanoid/non-secure crypto.getRandomValues Math.random --size --alphabet react-native-get-random-values", "idGeneratorSetups", "generationSignals", "entropySignals", "alphabetSignals", "runtimeSignals", "usageSignals", "validationSignals", "packageSignals", "npx vitest run", "id-generation-readiness-card", "data-source-pattern=\"Nano ID\"", "openTargetEntries", "id-generation-readiness"]),
  check("image processing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ImageProcessingReadinessReportSchema", "ImageProcessingReadinessReport", "imageProcessingReadinessReport", "image-processing-readiness-report.json", "image-processing-readiness.md", "image-processing-readiness.html", "sharp resize toFormat jpeg png webp avif metadata rotate composite pipeline stream toBuffer toFile cache concurrency limitInputPixels", "imageProcessingSetups", "inputSignals", "transformSignals", "outputSignals", "safetySignals", "performanceSignals", "packageSignals", "npx vitest run", "image-processing-readiness-card", "data-source-pattern=\"Sharp\"", "openTargetEntries", "image-processing-readiness"]),
  check("file upload readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["FileUploadReadinessReportSchema", "FileUploadReadinessReport", "fileUploadReadinessReport", "file-upload-readiness-report.json", "file-upload-readiness.md", "file-upload-readiness.html", "Uppy Dashboard DragDrop FileInput restrictions allowedFileTypes maxFileSize maxNumberOfFiles metaFields XHRUpload Tus AwsS3 Companion upload-progress complete error cancel retry", "fileUploadSetups", "inputSignals", "restrictionSignals", "transportSignals", "lifecycleSignals", "safetySignals", "packageSignals", "npx vitest run", "file-upload-readiness-card", "data-source-pattern=\"Uppy\"", "openTargetEntries", "file-upload-readiness"]),
  check("websocket readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["WebSocketReadinessReportSchema", "WebSocketReadinessReport", "webSocketReadinessReport", "websocket-readiness-report.json", "websocket-readiness.md", "websocket-readiness.html", "ws WebSocket WebSocketServer upgrade connection message send close error ping pong perMessageDeflate backpressure maxPayload", "webSocketSetups", "connectionSignals", "messageSignals", "lifecycleSignals", "safetySignals", "packageSignals", "npx vitest run", "websocket-readiness-card", "data-source-pattern=\"ws\"", "openTargetEntries", "websocket-readiness"]),
  check("realtime media readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["RealtimeMediaReadinessReportSchema", "RealtimeMediaReadinessReport", "realtimeMediaReadinessReport", "realtime-media-readiness-report.json", "realtime-media-readiness.md", "realtime-media-readiness.html", "Realtime media readiness WebRTC LiveKit Room mediasoup WebRtcTransport PeerJS getUserMedia MediaStream Track publish subscribe ICE DTLS RTP capabilities mediaCodecs Producer Consumer PlainTransport PipeTransport DirectTransport SCTP observer score trace data channel E2EE", "mediaSetups", "platformSignals", "roomSignals", "deviceSignals", "trackSignals", "transportSignals", "sfuSignals", "SFU Signals", "dataChannelSignals", "qualitySignals", "securitySignals", "workflowSignals", "packageSignals", "RepoTutor records realtime media readiness only", "realtime-media-readiness-card", "data-source-pattern=\"Realtime Media\"", "openTargetEntries", "realtime-media-readiness"]),
  check("pdf generation readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PdfGenerationReadinessReportSchema", "PdfGenerationReadinessReport", "pdfGenerationReadinessReport", "pdf-generation-readiness-report.json", "pdf-generation-readiness.md", "pdf-generation-readiness.html", "pdf-lib PDFDocument create load addPage drawText drawImage embedFont embedPng embedJpg getForm createTextField setText copyPages save saveAsBase64", "pdfGenerationSetups", "documentSignals", "pageSignals", "assetSignals", "formSignals", "outputSignals", "safetySignals", "packageSignals", "npx vitest run", "pdf-generation-readiness-card", "data-source-pattern=\"pdf-lib\"", "openTargetEntries", "pdf-generation-readiness"]),
  check("spreadsheet readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SpreadsheetReadinessReportSchema", "SpreadsheetReadinessReport", "spreadsheetReadinessReport", "spreadsheet-readiness-report.json", "spreadsheet-readiness.md", "spreadsheet-readiness.html", "SheetJS XLSX readFile writeFile read write book_new book_append_sheet json_to_sheet sheet_to_json aoa_to_sheet table_to_sheet CSV workbook worksheet", "spreadsheetSetups", "workbookSignals", "sheetSignals", "formatSignals", "inputSignals", "outputSignals", "safetySignals", "packageSignals", "npx vitest run", "spreadsheet-readiness-card", "data-source-pattern=\"SheetJS\"", "openTargetEntries", "spreadsheet-readiness"]),
  check("chart visualization readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ChartVisualizationReadinessReportSchema", "ChartVisualizationReadinessReport", "chartVisualizationReadinessReport", "chart-visualization-readiness-report.json", "chart-visualization-readiness.md", "chart-visualization-readiness.html", "Chart.js new Chart Chart.register registerables datasets scales tooltip legend responsive canvas update resize destroy toBase64Image decimation", "chartSetups", "chartTypeSignals", "dataSignals", "scaleSignals", "interactionSignals", "renderSignals", "lifecycleSignals", "safetySignals", "packageSignals", "npx vitest run", "chart-visualization-readiness-card", "data-source-pattern=\"Chart.js\"", "openTargetEntries", "chart-visualization-readiness"]),
  check("Markdown code rendering readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["MarkdownCodeRenderingReadinessReportSchema", "MarkdownCodeRenderingReadinessReport", "markdownCodeRenderingReadinessReport", "markdown-code-rendering-readiness-report.json", "markdown-code-rendering-readiness.md", "markdown-code-rendering-readiness.html", "Markdown code rendering readiness react-markdown components remarkPlugins rehypePlugins Shiki codeToHtml createHighlighter Prism highlight language classes tests", "markdownCodeRenderingSetups", "rendererSignals", "parserSignals", "highlightSignals", "pluginSignals", "securitySignals", "themeSignals", "accessibilitySignals", "testSignals", "packageSignals", "RepoTutor records markdown/code rendering readiness only", "markdown-code-rendering-readiness-card", "data-source-pattern=\"Markdown Code Rendering\"", "openTargetEntries", "markdown-code-rendering-readiness"]),
  check("notebook readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["NotebookReadinessReportSchema", "NotebookReadinessReport", "notebookReadinessReport", "notebook-readiness-report.json", "notebook-readiness.md", "notebook-readiness.html", "Notebook readiness Jupyter ipynb nbformat kernelspec nbconvert papermill jupytext Binder marimo @app.cell mo.ui mo.md Quarto qmd render execute freeze cache outputs widgets exports", "notebookSetups", "platformSignals", "fileSignals", "kernelSignals", "executionSignals", "dependencySignals", "interactivitySignals", "exportSignals", "reproducibilitySignals", "workflowSignals", "packageSignals", "RepoTutor records notebook readiness only", "notebook-readiness-card", "data-source-pattern=\"Notebook\"", "openTargetEntries", "notebook-readiness"]),
  check("map visualization readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["MapVisualizationReadinessReportSchema", "MapVisualizationReadinessReport", "mapVisualizationReadinessReport", "map-visualization-readiness-report.json", "map-visualization-readiness.md", "map-visualization-readiness.html", "Map visualization readiness MapLibre maplibregl Leaflet L.map deck.gl Deck DeckGL MapView layer catalog picking tooltip layerFilter overlays widgets test-utils tileLayer addLayer addSource GeoJSON marker popup viewport bounds controls tokens", "mapSetups", "platformSignals", "containerSignals", "tileSignals", "layerSignals", "deckGlSignals", "deck.gl Signals", "dataSignals", "viewportSignals", "interactionSignals", "controlSignals", "styleSignals", "workflowSignals", "packageSignals", "RepoTutor records map visualization readiness only", "map-visualization-readiness-card", "data-source-pattern=\"Map Visualization\"", "openTargetEntries", "map-visualization-readiness"]),
  check("diagram rendering readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DiagramRenderingReadinessReportSchema", "DiagramRenderingReadinessReport", "diagramRenderingReadinessReport", "diagram-rendering-readiness-report.json", "diagram-rendering-readiness.md", "diagram-rendering-readiness.html", "Mermaid mermaid.initialize mermaid.run mermaid.render mermaid.parse flowchart sequenceDiagram classDiagram stateDiagram erDiagram gantt journey mindmap securityLevel theme svg sandbox", "diagramSetups", "diagramTypeSignals", "renderSignals", "themeSignals", "securitySignals", "layoutSignals", "outputSignals", "packageSignals", "npx vitest run", "diagram-rendering-readiness-card", "data-source-pattern=\"Mermaid\"", "openTargetEntries", "diagram-rendering-readiness"]),
  check("link integrity readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["LinkIntegrityReadinessReportSchema", "LinkIntegrityReadinessReport", "linkIntegrityReadinessReport", "link-integrity-readiness-report.json", "link-integrity-readiness.md", "link-integrity-readiness.html", "Lychee link checker markdown html reStructuredText website mail sitemap accept status exclude include scheme timeout retry headers github-token offline output cache", "linkSetups", "targetSignals", "policySignals", "networkSignals", "outputSignals", "ciSignals", "packageSignals", "npx vitest run", "link-integrity-readiness-card", "data-source-pattern=\"Lychee\"", "openTargetEntries", "link-integrity-readiness"]),
  check("SEO metadata readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SeoMetadataReadinessReportSchema", "SeoMetadataReadinessReport", "seoMetadataReadinessReport", "seo-metadata-readiness-report.json", "seo-metadata-readiness.md", "seo-metadata-readiness.html", "Nuxt SEO robots sitemap Schema.org OpenGraph meta tags canonical siteUrl indexable i18n hreflang JSON-LD AEO llms", "seoSetups", "crawlSignals", "sitemapSignals", "metadataSignals", "structuredDataSignals", "aiReadinessSignals", "packageSignals", "npx vitest run", "seo-metadata-readiness-card", "data-source-pattern=\"Nuxt SEO\"", "openTargetEntries", "seo-metadata-readiness"]),
  check("PWA readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PwaReadinessReportSchema", "PwaReadinessReport", "pwaReadinessReport", "pwa-readiness-report.json", "pwa-readiness.md", "pwa-readiness.html", "Vite PWA manifest webmanifest service worker registerSW Workbox generateSW injectManifest precache runtimeCaching offline icons theme_color start_url display", "pwaSetups", "manifestSignals", "serviceWorkerSignals", "cachingSignals", "updateSignals", "installSignals", "packageSignals", "npx vitest run", "pwa-readiness-card", "data-source-pattern=\"Vite PWA\"", "openTargetEntries", "pwa-readiness"]),
  check("browser compatibility readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["BrowserCompatibilityReadinessReportSchema", "BrowserCompatibilityReadinessReport", "browserCompatibilityReadinessReport", "browser-compat-readiness-report.json", "browser-compat-readiness.md", "browser-compat-readiness.html", "Browserslist target browsers config queries coverage caniuse-lite update-browserslist-db mobile-to-desktop env stats", "compatibilitySetups", "configSignals", "querySignals", "coverageSignals", "featureSignals", "updateSignals", "packageSignals", "npx browserslist", "browser-compat-readiness-card", "data-source-pattern=\"Browserslist\"", "openTargetEntries", "browser-compat-readiness"]),
  check("browser extension readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["BrowserExtensionReadinessReportSchema", "BrowserExtensionReadinessReport", "browserExtensionReadinessReport", "browser-extension-readiness-report.json", "browser-extension-readiness.md", "browser-extension-readiness.html", "WXT Plasmo CRXJS Manifest V3 manifest.json background service_worker content_scripts permissions host_permissions web_accessible_resources chrome.runtime browser.runtime web-ext zip publish", "extensionSetups", "manifestSignals", "entrypointSignals", "permissionSignals", "messagingSignals", "buildSignals", "publishSignals", "packageSignals", "browser-extension-readiness-card", "data-source-pattern=\"WXT\"", "openTargetEntries", "browser-extension-readiness"]),
  check("env validation readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["EnvValidationReadinessReportSchema", "EnvValidationReadinessReport", "envValidationReadinessReport", "env-validation-readiness-report.json", "env-validation-readiness.md", "env-validation-readiness.html", "t3-env createEnv server client shared runtimeEnv runtimeEnvStrict clientPrefix Standard Schema process.env import.meta.env emptyStringAsUndefined skipValidation @t3-oss/env-core @t3-oss/env-nextjs @t3-oss/env-nuxt Astro Vite extends isServer", "envSetups", "schemaSignals", "runtimeSignals", "boundarySignals", "frameworkSignals", "validationSignals", "documentationSignals", "packageSignals", "pnpm build", "env-validation-readiness-card", "data-source-pattern=\"t3-env\"", "openTargetEntries", "env-validation-readiness"]),
  check("security headers readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SecurityHeadersReadinessReportSchema", "SecurityHeadersReadinessReport", "securityHeadersReadinessReport", "security-headers-readiness-report.json", "security-headers-readiness.md", "security-headers-readiness.html", "Helmet Content-Security-Policy Strict-Transport-Security Cross-Origin-Opener-Policy Cross-Origin-Resource-Policy X-Frame-Options Referrer-Policy X-Content-Type-Options X-Powered-By", "headerSetups", "cspSignals", "transportSignals", "crossOriginSignals", "legacyHeaderSignals", "middlewareSignals", "packageSignals", "curl -I <preview-url>", "security-headers-readiness-card", "data-source-pattern=\"Helmet\"", "openTargetEntries", "security-headers-readiness"]),
  check("GraphQL readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["GraphqlReadinessReportSchema", "GraphqlReadinessReport", "graphqlReadinessReport", "graphql-readiness-report.json", "graphql-readiness.md", "graphql-readiness.html", "GraphQL.js GraphQLSchema GraphQLObjectType buildSchema parse validate visit TypeInfo visitWithTypeInfo separateOperations concatAST stripIgnoredCharacters extendSchema lexicographicSortSchema typeFromAST valueFromAST coerceInputValue execute subscribe introspection typed documents resolvers", "graphqlSetups", "schemaSignals", "operationSignals", "resolverSignals", "validationSignals", "documentSignals", "executionSignals", "clientSignals", "codegenSignals", "TypedDocumentNode", "graphql-readiness-card", "data-source-pattern=\"GraphQL.js\"", "openTargetEntries", "graphql-readiness"]),
  check("CLI readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CliReadinessReportSchema", "CliReadinessReport", "cliReadinessReport", "cli-readiness-report.json", "cli-readiness.md", "cli-readiness.html", "Commander.js Command option requiredOption argument action parseAsync help usage exitOverride showHelpAfterError", "cliSetups", "commandSignals", "optionSignals", "parseSignals", "actionSignals", "helpSignals", "errorSignals", "packageSignals", "Commander.js", "cli-readiness-card", "data-source-pattern=\"Commander.js\"", "openTargetEntries", "cli-readiness"]),
  check("Terminal UI readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TerminalUiReadinessReportSchema", "TerminalUiReadinessReport", "terminalUiReadinessReport", "terminal-ui-readiness-report.json", "terminal-ui-readiness.md", "terminal-ui-readiness.html", "Terminal UI readiness Ink Box Text useInput Bubble Tea Model Init Update View tea.NewProgram Blessed screen box key mouse render", "terminalSetups", "frameworkSignals", "screenSignals", "layoutSignals", "inputSignals", "focusSignals", "mouseSignals", "renderSignals", "lifecycleSignals", "testSignals", "packageSignals", "RepoTutor records terminal UI readiness only", "terminal-ui-readiness-card", "data-source-pattern=\"Terminal UI\"", "openTargetEntries", "terminal-ui-readiness"]),
  check("State machine readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["StateMachineReadinessReportSchema", "StateMachineReadinessReport", "stateMachineReadinessReport", "state-machine-readiness-report.json", "state-machine-readiness.md", "state-machine-readiness.html", "State machine readiness XState createMachine setup createActor Robot state transition interpret Zag createMachine connect states on actions guards", "stateMachineSetups", "frameworkSignals", "stateSignals", "transitionSignals", "actionSignals", "guardSignals", "actorSignals", "contextSignals", "eventSignals", "testSignals", "packageSignals", "RepoTutor records state machine readiness only", "state-machine-readiness-card", "data-source-pattern=\"State Machine\"", "openTargetEntries", "state-machine-readiness"]),
  check("Animation readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["AnimationReadinessReportSchema", "AnimationReadinessReport", "animationReadinessReport", "animation-readiness-report.json", "animation-readiness.md", "animation-readiness.html", "Animation readiness Motion animate AnimatePresence variants React Spring useSpring animated GSAP timeline ScrollTrigger reduced motion frame tests", "animationSetups", "librarySignals", "declarationSignals", "timingSignals", "interactionSignals", "layoutSignals", "accessibilitySignals", "runtimeSignals", "testSignals", "packageSignals", "RepoTutor records animation readiness only", "animation-readiness-card", "data-source-pattern=\"Animation\"", "openTargetEntries", "animation-readiness"]),
  check("Drag and drop readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DragAndDropReadinessReportSchema", "DragAndDropReadinessReport", "dragAndDropReadinessReport", "drag-and-drop-readiness-report.json", "drag-and-drop-readiness.md", "drag-and-drop-readiness.html", "Drag and drop readiness DnD Kit DndContext useDraggable useDroppable React DnD DndProvider useDrag useDrop SortableJS onEnd keyboard tests", "dragAndDropSetups", "librarySignals", "providerSignals", "sensorSignals", "draggableSignals", "droppableSignals", "sortableSignals", "feedbackSignals", "accessibilitySignals", "testSignals", "packageSignals", "RepoTutor records drag-and-drop readiness only", "drag-and-drop-readiness-card", "data-source-pattern=\"Drag and Drop\"", "openTargetEntries", "drag-and-drop-readiness"]),
  check("Rich text editor readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["RichTextEditorReadinessReportSchema", "RichTextEditorReadinessReport", "richTextEditorReadinessReport", "rich-text-editor-readiness-report.json", "rich-text-editor-readiness.md", "rich-text-editor-readiness.html", "Rich text editor readiness Tiptap useEditor EditorContent ProseMirror EditorState EditorView LexicalComposer RichTextPlugin ContentEditable initialConfig namespace theme nodes onError PlainTextPlugin HistoryPlugin OnChangePlugin AutoFocusPlugin LexicalErrorBoundary editor.update editor.read registerCommand createCommand COMMAND_PRIORITY $getRoot $getSelection $isRangeSelection $createTextNode $generateHtmlFromNodes MarkdownShortcutPlugin ListPlugin LinkPlugin TablePlugin CollaborationPlugin Yjs mergeRegister createEditor commands keyboard tests", "richTextEditorSetups", "frameworkSignals", "schemaSignals", "renderSignals", "commandSignals", "stateSignals", "extensionSignals", "collaborationSignals", "accessibilitySignals", "testSignals", "lexicalSignals", "Lexical Signals", "packageSignals", "RepoTutor records rich text editor readiness only", "rich-text-editor-readiness-card", "data-source-pattern=\"Rich Text Editor\"", "openTargetEntries", "rich-text-editor-readiness"]),
  check("Command palette readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CommandPaletteReadinessReportSchema", "CommandPaletteReadinessReport", "commandPaletteReadinessReport", "command-palette-readiness-report.json", "command-palette-readiness.md", "command-palette-readiness.html", "Command palette readiness cmdk Command.Input Command.Item Algolia autocomplete getSources Downshift useCombobox keyboard aria tests", "commandPaletteSetups", "frameworkSignals", "inputSignals", "resultSignals", "selectionSignals", "filterSignals", "stateSignals", "pluginSignals", "accessibilitySignals", "keyboardSignals", "testSignals", "packageSignals", "RepoTutor records command palette readiness only", "command-palette-readiness-card", "data-source-pattern=\"Command Palette\"", "openTargetEntries", "command-palette-readiness"]),
  check("Guided tour readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["GuidedTourReadinessReportSchema", "GuidedTourReadinessReport", "guidedTourReadinessReport", "guided-tour-readiness-report.json", "guided-tour-readiness.md", "guided-tour-readiness.html", "Guided tour readiness React Joyride Shepherd.js driver.js steps target attachTo popover overlay progress callbacks accessibility tests", "guidedTourSetups", "frameworkSignals", "stepSignals", "targetSignals", "navigationSignals", "overlaySignals", "callbackSignals", "accessibilitySignals", "stateSignals", "machineSignals", "targetResolutionSignals", "positioningSignals", "spotlightSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/tour", "Machine Signals", "DOM Signals", "API Signals", "RepoTutor records guided tour readiness only", "guided-tour-readiness-card", "data-source-pattern=\"Guided Tour\"", "openTargetEntries", "guided-tour-readiness"]),
  check("Data table readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataTableReadinessReportSchema", "DataTableReadinessReport", "dataTableReadinessReport", "data-table-readiness-report.json", "data-table-readiness.md", "data-table-readiness.html", "Data table readiness TanStack Table AG Grid React Data Grid columns rows sorting filtering pagination virtualization selection editing accessibility tests", "dataTableSetups", "frameworkSignals", "columnSignals", "rowModelSignals", "interactionSignals", "stateSignals", "virtualizationSignals", "editingSignals", "accessibilitySignals", "testSignals", "packageSignals", "RepoTutor records data table readiness only", "data-table-readiness-card", "data-source-pattern=\"Data Table\"", "openTargetEntries", "data-table-readiness"]),
  check("Calendar readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CalendarReadinessReportSchema", "CalendarReadinessReport", "calendarReadinessReport", "calendar-readiness-report.json", "calendar-readiness.md", "calendar-readiness.html", "Calendar readiness FullCalendar react-big-calendar React DayPicker events views selection navigation localization resources drag drop date ranges accessibility tests localizer accessors components getters popup drilldown DnD addon", "calendarSetups", "frameworkSignals", "viewSignals", "eventSignals", "selectionSignals", "navigationSignals", "localizationSignals", "resourceSignals", "dragDropSignals", "rangeConstraintSignals", "accessibilitySignals", "testSignals", "packageSignals", "reactBigCalendarSignals", "react-big-calendar Signals", "RepoTutor records calendar readiness only", "calendar-readiness-card", "data-source-pattern=\"Calendar\"", "openTargetEntries", "calendar-readiness"]),
  check("Dialog readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DialogReadinessReportSchema", "DialogReadinessReport", "dialogReadinessReport", "dialog-readiness-report.json", "dialog-readiness.md", "dialog-readiness.html", "Dialog readiness Radix Dialog Headless UI Dialog FocusTrap internals Ariakit Dialog portal overlay focus trap focus lock hidden guards tab direction dismiss accessibility server handoff root containers inert stack top layer scroll lock disappear tests", "dialogSetups", "frameworkSignals", "structureSignals", "stateSignals", "focusSignals", "dismissalSignals", "portalOverlaySignals", "accessibilitySignals", "animationSignals", "implementationSignals", "Implementation Signals", "server-handoff", "nested-portals", "root-containers", "main-tree-provider", "inert-others", "stack-machine", "top-layer", "outside-click", "escape-close", "escape-blur-active-element", "scroll-lock", "disappear-close", "focus-trap-features", "focus-trap-none", "focus-lock", "focus-trap-props", "resolve-containers", "sync-refs", "owner-document", "restore-element-history", "restore-focus-hook", "initial-focus-hook", "initial-focus-fallback", "focus-lock-hook", "tab-direction", "hidden-focus-guards", "focus-guard-dataset", "focusable-hidden", "microtask-focus", "focus-in-first-last", "focus-next-previous-wrap", "recent-tab-key", "disposables-raf", "blur-focus-lock", "event-listener", "contains-containers", "focus-trap-object-assign", "restore-focus", "tab-lock", "auto-focus", "initial-focus", "force-portal-root", "portal-group", "close-provider", "open-closed-context", "closing-state", "role-validation", "aria-modal-open", "panel-stop-propagation", "backdrop-aria-hidden", "title-registration", "transition-wrapper", "testSignals", "packageSignals", "RepoTutor records dialog readiness only", "dialog-readiness-card", "data-source-pattern=\"Dialog\"", "openTargetEntries", "dialog-readiness"]),
  check("Popover tooltip readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PopoverTooltipReadinessReportSchema", "PopoverTooltipReadinessReport", "popoverTooltipReadinessReport", "popover-tooltip-readiness-report.json", "popover-tooltip-readiness.md", "popover-tooltip-readiness.html", "Popover/tooltip readiness Radix Popover Radix Tooltip Headless UI Popover machine sentinels portalled focus Floating UI Ariakit Popover Tooltip portal positioning hover focus dismissal accessibility tests", "popoverTooltipSetups", "frameworkSignals", "headless-popover", "structureSignals", "positioningSignals", "interactionSignals", "dismissalSignals", "focusSignals", "accessibilitySignals", "portalSignals", "implementationSignals", "Implementation Signals", "@headlessui/react", "popover-machine", "refocusable-close", "portalled-selector", "focus-guard-sentinels", "hidden-focus-sentinel", "scroll-lock-modal", "panel-unlink-on-unmount", "testSignals", "packageSignals", "RepoTutor records popover/tooltip readiness only", "popover-tooltip-readiness-card", "data-source-pattern=\"PopoverTooltip\"", "openTargetEntries", "popover-tooltip-readiness"]),
  check("Menu dropdown readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["MenuDropdownReadinessReportSchema", "MenuDropdownReadinessReport", "menuDropdownReadinessReport", "menu-dropdown-readiness-report.json", "menu-dropdown-readiness.md", "menu-dropdown-readiness.html", "Menu/dropdown readiness Radix DropdownMenu ContextMenu Menubar NavigationMenu Headless UI Menu machine stack top layer floating typeahead Listbox Combobox Ariakit Menu Select Combobox keyboard selection accessibility tests", "menuDropdownSetups", "frameworkSignals", "structureSignals", "selectionSignals", "positioningSignals", "interactionSignals", "accessibilitySignals", "stateSignals", "implementationSignals", "Implementation Signals", "menu-machine", "stack-machine", "top-layer", "outside-click-close", "scroll-lock", "inert-others", "typeahead-search", "register-items", "testSignals", "packageSignals", "RepoTutor records menu/dropdown readiness only", "menu-dropdown-readiness-card", "data-source-pattern=\"MenuDropdown\"", "openTargetEntries", "menu-dropdown-readiness"]),
  check("Toast snackbar readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ToastSnackbarReadinessReportSchema", "ToastSnackbarReadinessReport", "toastSnackbarReadinessReport", "toast-snackbar-readiness-report.json", "toast-snackbar-readiness.md", "toast-snackbar-readiness.html", "Toast/snackbar readiness Radix Toast Sonner React Hot Toast Notistack Zag toast provider viewport lifecycle action close accessibility timer swipe queue live region machine store group API tests", "toastSnackbarSetups", "frameworkSignals", "structureSignals", "variantSignals", "lifecycleSignals", "interactionSignals", "accessibilitySignals", "stylingSignals", "machineSignals", "storeSignals", "groupSignals", "apiSignals", "Machine Signals", "Store Signals", "Group Signals", "API Signals", "zag-toast", "@zag-js/toast", "@zag-js/core", "@zag-js/dom-query", "@zag-js/dismissable", "@zag-js/types", "@zag-js/utils", "toast-machine", "group-machine", "visible-persist-state", "wait-for-duration", "track-height", "mutation-observer", "create-toast-store", "priority-sorting", "queue-max", "promise-unwrap", "subscribe-to-store", "document-visibility", "hotkey-focus-region", "dismissable-branch", "root-props", "ghost-before-after", "group-props", "testSignals", "packageSignals", "RepoTutor records toast/snackbar readiness only", "toast-snackbar-readiness-card", "data-source-pattern=\"ToastSnackbar\"", "openTargetEntries", "toast-snackbar-readiness"]),
  check("Tabs accordion readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TabsAccordionReadinessReportSchema", "TabsAccordionReadinessReport", "tabsAccordionReadinessReport", "tabs-accordion-readiness-report.json", "tabs-accordion-readiness.md", "tabs-accordion-readiness.html", "Tabs/accordion readiness Radix Tabs Accordion Collapsible Headless UI Tab Disclosure internals Ariakit Tab Disclosure Zag Accordion machine DOM API keyboard orientation controlled state accessibility tests", "tabsAccordionSetups", "frameworkSignals", "structureSignals", "stateSignals", "interactionSignals", "accessibilitySignals", "orientationSignals", "machineSignals", "domSignals", "apiSignals", "implementationSignals", "Implementation Signals", "tabs-data-context", "tabs-register-tab", "tabs-focus-sentinel", "disclosure-context", "disclosure-close-refocus", "disclosure-transition", "@zag-js/accordion", "Machine Signals", "DOM Signals", "API Signals", "testSignals", "packageSignals", "RepoTutor records tabs/accordion/disclosure readiness only", "tabs-accordion-readiness-card", "data-source-pattern=\"TabsAccordion\"", "openTargetEntries", "tabs-accordion-readiness"]),
  check("Checkbox radio switch readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CheckboxRadioSwitchReadinessReportSchema", "CheckboxRadioSwitchReadinessReport", "checkboxRadioSwitchReadinessReport", "checkbox-radio-switch-readiness-report.json", "checkbox-radio-switch-readiness.md", "checkbox-radio-switch-readiness.html", "Checkbox/radio/switch readiness Radix Checkbox RadioGroup Switch Headless UI Checkbox RadioGroup Switch controllable comparator option registration form fields labels keyboard focus Ariakit Checkbox Radio checked defaultChecked indeterminate aria-checked form tests", "checkboxRadioSwitchSetups", "frameworkSignals", "controlSignals", "structureSignals", "stateSignals", "formSignals", "interactionSignals", "accessibilitySignals", "implementationSignals", "Implementation Signals", "controllable-value", "default-value-hook", "form-fields", "space-toggle", "enter-attempt-submit", "role-switch", "aria-checked", "checkbox-indeterminate", "checkbox-mixed-aria", "radio-data-context", "radio-register-option", "radio-comparator", "radio-keydown-arrow-focus", "radio-hidden-field-override", "testSignals", "packageSignals", "RepoTutor records checkbox/radio/switch readiness only", "checkbox-radio-switch-readiness-card", "data-source-pattern=\"CheckboxRadioSwitch\"", "openTargetEntries", "checkbox-radio-switch-readiness"]),
  check("Slider progress readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SliderProgressReadinessReportSchema", "SliderProgressReadinessReport", "sliderProgressReadinessReport", "slider-progress-readiness-report.json", "slider-progress-readiness.md", "slider-progress-readiness.html", "Slider/progress readiness Radix Slider Progress Zag progress native input range progressbar value min max step orientation aria-valuenow form tests", "sliderProgressSetups", "frameworkSignals", "structureSignals", "valueSignals", "interactionSignals", "orientationSignals", "formSignals", "accessibilitySignals", "machineSignals", "computedSignals", "circleSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/progress", "Machine Signals", "API Signals", "RepoTutor records slider/progress readiness only", "slider-progress-readiness-card", "data-source-pattern=\"SliderProgress\"", "openTargetEntries", "slider-progress-readiness"]),
  check("Select combobox readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SelectComboboxReadinessReportSchema", "SelectComboboxReadinessReport", "selectComboboxReadinessReport", "select-combobox-readiness-report.json", "select-combobox-readiness.md", "select-combobox-readiness.html", "Select/combobox/listbox readiness Radix Select Headless UI Combobox Listbox Ariakit Select Combobox Listbox Combobox machine Listbox machine virtualizer input display value IME immediate stack top layer typeahead form fields floating portal option registration value option aria-activedescendant form tests", "selectComboboxSetups", "frameworkSignals", "structureSignals", "stateSignals", "interactionSignals", "accessibilitySignals", "formSignals", "implementationSignals", "Implementation Signals", "controllable-value", "default-value-hook", "comparator", "combobox-machine", "virtualizer", "virtual-configuration", "display-value", "input-value-sync", "composition-guard", "immediate-focus-open", "input-ref-sync", "input-role-combobox", "input-aria-expanded", "input-aria-controls", "input-aria-activedescendant", "input-aria-autocomplete", "clear-on-empty", "open-on-input-change", "escape-clear", "tab-select-close", "button-refocus-input", "options-tree-walker-role-none", "options-modal-scroll-lock", "portal-owner-document", "input-movement-cancel-transition", "virtual-option-positioning", "option-refocus-input", "mobile-keyboard-guard", "option-register-order", "pointer-activation-trigger", "default-first-option", "active-descendant-virtual", "voiceover-input-reset", "listbox-machine", "data-ref-sync", "slice-state", "stack-machine", "top-layer", "outside-click-close", "refocus-button", "label-provider", "form-fields", "open-closed-provider", "floating-provider", "quick-release", "active-press", "floating-reference", "handle-toggle", "keyboard-open", "attempt-submit", "aria-haspopup-listbox", "button-aria-expanded", "button-aria-controls", "options-anchor", "portal-enabled", "transition-data", "disappear-close", "scroll-lock", "inert-others", "frozen-value", "active-descendant", "multiselectable", "orientation", "open-tab-index", "typeahead-search", "search-timeout", "select-active-option", "focus-next-prev", "focus-first-last", "tab-close-focus-next", "register-option", "unregister-option", "scroll-into-view", "pointer-tracking", "option-role", "aria-selected", "data-focus", "testSignals", "packageSignals", "RepoTutor records select/combobox/listbox readiness only", "select-combobox-readiness-card", "data-source-pattern=\"SelectCombobox\"", "openTargetEntries", "select-combobox-readiness"]),
  check("Toolbar toggle readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ToolbarToggleReadinessReportSchema", "ToolbarToggleReadinessReport", "toolbarToggleReadinessReport", "toolbar-toggle-readiness-report.json", "toolbar-toggle-readiness.md", "toolbar-toggle-readiness.html", "Toolbar/toggle readiness Radix Toolbar Toggle ToggleGroup Ariakit Toolbar pressed aria-pressed roving focus orientation keyboard tests", "toolbarToggleSetups", "frameworkSignals", "structureSignals", "stateSignals", "focusSignals", "orientationSignals", "accessibilitySignals", "machineSignals", "valueSignals", "rovingFocusSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/toggle-group", "Machine Signals", "API Signals", "RepoTutor records toolbar/toggle readiness only", "toolbar-toggle-readiness-card", "data-source-pattern=\"ToolbarToggle\"", "openTargetEntries", "toolbar-toggle-readiness"]),
  check("Scroll area readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ScrollAreaReadinessReportSchema", "ScrollAreaReadinessReport", "scrollAreaReadinessReport", "scroll-area-readiness-report.json", "scroll-area-readiness.md", "scroll-area-readiness.html", "Scroll area readiness Radix ScrollArea Zag scroll-area viewport scrollbar thumb corner overflow scrollTop scrollLeft ResizeObserver pointer wheel tests", "scrollAreaSetups", "frameworkSignals", "structureSignals", "stateSignals", "measurementSignals", "orientationSignals", "interactionSignals", "accessibilitySignals", "machineSignals", "contextSignals", "refSignals", "effectSignals", "actionSignals", "domSignals", "utilitySignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/scroll-area", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "Machine Signals", "API Signals", "RepoTutor records scroll area readiness only", "scroll-area-readiness-card", "data-source-pattern=\"ScrollArea\"", "openTargetEntries", "scroll-area-readiness"]),
  check("Avatar readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["AvatarReadinessReportSchema", "AvatarReadinessReport", "avatarReadinessReport", "avatar-readiness-report.json", "avatar-readiness.md", "avatar-readiness.html", "Avatar readiness Radix Avatar Zag avatar image fallback loading loaded error delayMs alt src srcset SSR axe tests", "avatarSetups", "frameworkSignals", "structureSignals", "stateSignals", "imageSignals", "eventSignals", "ssrSignals", "accessibilitySignals", "machineSignals", "effectSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/avatar", "Machine Signals", "RepoTutor records avatar readiness only", "avatar-readiness-card", "data-source-pattern=\"Avatar\"", "openTargetEntries", "avatar-readiness"]),
  check("Pin input readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PinInputReadinessReportSchema", "PinInputReadinessReport", "pinInputReadinessReport", "pin-input-readiness-report.json", "pin-input-readiness.md", "pin-input-readiness.html", "Pin input readiness Radix OneTimePasswordField Zag pin-input OTP hidden input paste keyboard validation form submit accessibility tests", "pinInputSetups", "frameworkSignals", "structureSignals", "valueSignals", "validationSignals", "interactionSignals", "formSignals", "accessibilitySignals", "machineSignals", "computedSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/pin-input", "Machine Signals", "RepoTutor records pin input readiness only", "pin-input-readiness-card", "data-source-pattern=\"PinInput\"", "openTargetEntries", "pin-input-readiness"]),
  check("Pagination readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PaginationReadinessReportSchema", "PaginationReadinessReport", "paginationReadinessReport", "pagination-readiness-report.json", "pagination-readiness.md", "pagination-readiness.html", "Pagination readiness Zag pagination TanStack table page pageSize totalPages pageRange next previous first last aria-current disabled tests", "paginationSetups", "frameworkSignals", "structureSignals", "stateSignals", "navigationSignals", "renderSignals", "accessibilitySignals", "machineSignals", "computedSignals", "guardSignals", "actionSignals", "rangeSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/pagination", "Machine Signals", "RepoTutor records pagination readiness only", "pagination-readiness-card", "data-source-pattern=\"Pagination\"", "openTargetEntries", "pagination-readiness"]),
  check("Number input readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["NumberInputReadinessReportSchema", "NumberInputReadinessReport", "numberInputReadinessReport", "number-input-readiness-report.json", "number-input-readiness.md", "number-input-readiness.html", "Number input readiness Zag number-input native spinbutton value min max step clamp format locale keyboard scrubber wheel tests", "numberInputSetups", "frameworkSignals", "structureSignals", "valueSignals", "boundsSignals", "formatSignals", "keyboardSignals", "interactionSignals", "accessibilitySignals", "formSignals", "machineSignals", "computedSignals", "effectSignals", "actionSignals", "domSignals", "cursorSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/number-input", "Machine Signals", "RepoTutor records number input readiness only", "number-input-readiness-card", "data-source-pattern=\"NumberInput\"", "openTargetEntries", "number-input-readiness"]),
  check("Rating group readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["RatingGroupReadinessReportSchema", "RatingGroupReadinessReport", "ratingGroupReadinessReport", "rating-group-readiness-report.json", "rating-group-readiness.md", "rating-group-readiness.html", "Rating group readiness Zag rating-group native radiogroup radio value hover half keyboard pointer form accessibility tests", "ratingGroupSetups", "frameworkSignals", "structureSignals", "valueSignals", "selectionSignals", "interactionSignals", "accessibilitySignals", "formSignals", "machineSignals", "computedSignals", "effectSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/rating-group", "Machine Signals", "RepoTutor records rating group readiness only", "rating-group-readiness-card", "data-source-pattern=\"RatingGroup\"", "openTargetEntries", "rating-group-readiness"]),
  check("Color picker readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ColorPickerReadinessReportSchema", "ColorPickerReadinessReport", "colorPickerReadinessReport", "color-picker-readiness-report.json", "color-picker-readiness.md", "color-picker-readiness.html", "Color picker readiness Zag color-picker native color input area channel slider swatch eyedropper format form accessibility tests", "colorPickerSetups", "frameworkSignals", "structureSignals", "valueSignals", "channelSignals", "interactionSignals", "accessibilitySignals", "formSignals", "machineSignals", "computedSignals", "effectSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/color-picker", "Machine Signals", "RepoTutor records color picker readiness only", "color-picker-readiness-card", "data-source-pattern=\"ColorPicker\"", "openTargetEntries", "color-picker-readiness"]),
  check("Splitter readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SplitterReadinessReportSchema", "SplitterReadinessReport", "splitterReadinessReport", "splitter-readiness-report.json", "splitter-readiness.md", "splitter-readiness.html", "Splitter readiness Zag splitter panel resize trigger separator size collapse keyboard pointer orientation bounds accessibility tests", "splitterSetups", "frameworkSignals", "structureSignals", "sizeSignals", "collapseSignals", "interactionSignals", "accessibilitySignals", "registrySignals", "machineSignals", "computedSignals", "effectSignals", "guardSignals", "actionSignals", "domSignals", "utilitySignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/splitter", "Machine Signals", "RepoTutor records splitter readiness only", "splitter-readiness-card", "data-source-pattern=\"Splitter\"", "openTargetEntries", "splitter-readiness"]),
  check("Tags input readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TagsInputReadinessReportSchema", "TagsInputReadinessReport", "tagsInputReadinessReport", "tags-input-readiness-report.json", "tags-input-readiness.md", "tags-input-readiness.html", "Tags input readiness Zag tags input value array editable tags paste delimiter validation live region form hidden input keyboard delete accessibility tests", "tagsInputSetups", "frameworkSignals", "structureSignals", "valueSignals", "validationSignals", "interactionSignals", "accessibilitySignals", "formSignals", "liveRegionSignals", "machineSignals", "computedSignals", "effectSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/tags-input", "Machine Signals", "RepoTutor records tags input readiness only", "tags-input-readiness-card", "data-source-pattern=\"TagsInput\"", "openTargetEntries", "tags-input-readiness"]),
  check("Clipboard readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ClipboardReadinessReportSchema", "ClipboardReadinessReport", "clipboardReadinessReport", "clipboard-readiness-report.json", "clipboard-readiness.md", "clipboard-readiness.html", "Clipboard readiness Zag clipboard copy value trigger indicator timeout native clipboard fallback accessibility tests", "clipboardSetups", "frameworkSignals", "structureSignals", "valueSignals", "copySignals", "statusSignals", "accessibilitySignals", "machineSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/clipboard", "Machine Signals", "RepoTutor records clipboard readiness only", "clipboard-readiness-card", "data-source-pattern=\"Clipboard\"", "openTargetEntries", "clipboard-readiness"]),
  check("QR code readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["QrCodeReadinessReportSchema", "QrCodeReadinessReport", "qrCodeReadinessReport", "qr-code-readiness-report.json", "qr-code-readiness.md", "qr-code-readiness.html", "QR code readiness Zag qr-code uqr SVG pattern overlay download data URL encoding pixel size accessibility tests", "qrCodeSetups", "frameworkSignals", "structureSignals", "valueSignals", "encodingSignals", "downloadSignals", "accessibilitySignals", "machineSignals", "computedSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/qr-code", "Machine Signals", "RepoTutor records QR code readiness only", "qr-code-readiness-card", "data-source-pattern=\"QRCode\"", "openTargetEntries", "qr-code-readiness"]),
  check("Timer readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TimerReadinessReportSchema", "TimerReadinessReport", "timerReadinessReport", "timer-readiness-report.json", "timer-readiness.md", "timer-readiness.html", "Timer readiness Zag timer countdown stopwatch interval tick progress controls aria timer completion tests", "timerSetups", "frameworkSignals", "structureSignals", "stateSignals", "timeSignals", "controlSignals", "accessibilitySignals", "validationSignals", "machineSignals", "computedSignals", "effectSignals", "actionSignals", "guardSignals", "domSignals", "apiSignals", "parseSignals", "testSignals", "packageSignals", "@zag-js/timer", "Machine Signals", "RepoTutor records timer readiness only", "timer-readiness-card", "data-source-pattern=\"Timer\"", "openTargetEntries", "timer-readiness"]),
  check("Steps readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["StepsReadinessReportSchema", "StepsReadinessReport", "stepsReadinessReport", "steps-readiness-report.json", "steps-readiness.md", "steps-readiness.html", "Steps readiness Zag steps wizard stepper linear progress tablist validation navigation tests", "stepsSetups", "frameworkSignals", "structureSignals", "stateSignals", "navigationSignals", "validationSignals", "accessibilitySignals", "machineSignals", "computedSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/steps", "Machine Signals", "RepoTutor records steps readiness only", "steps-readiness-card", "data-source-pattern=\"Steps\"", "openTargetEntries", "steps-readiness"]),
  check("Carousel readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CarouselReadinessReportSchema", "CarouselReadinessReport", "carouselReadinessReport", "carousel-readiness-report.json", "carousel-readiness.md", "carousel-readiness.html", "Carousel readiness Zag carousel slides snap autoplay drag scroll indicators accessibility tests", "carouselSetups", "frameworkSignals", "structureSignals", "stateSignals", "snapSignals", "interactionSignals", "autoplaySignals", "accessibilitySignals", "machineSignals", "computedSignals", "effectSignals", "actionSignals", "guardSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/carousel", "Machine Signals", "RepoTutor records carousel readiness only", "carousel-readiness-card", "data-source-pattern=\"Carousel\"", "openTargetEntries", "carousel-readiness"]),
  check("Tree view readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TreeViewReadinessReportSchema", "TreeViewReadinessReport", "treeViewReadinessReport", "tree-view-readiness-report.json", "tree-view-readiness.md", "tree-view-readiness.html", "Tree view readiness Zag tree-view collection expansion selection checking rename lazy loading keyboard accessibility tests", "treeViewSetups", "frameworkSignals", "structureSignals", "stateSignals", "navigationSignals", "selectionSignals", "loadingSignals", "renameSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "actionSignals", "guardSignals", "asyncSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/tree-view", "@zag-js/collection", "Machine Signals", "RepoTutor records tree view readiness only", "tree-view-readiness-card", "data-source-pattern=\"TreeView\"", "openTargetEntries", "tree-view-readiness"]),
  check("Collapsible readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CollapsibleReadinessReportSchema", "CollapsibleReadinessReport", "collapsibleReadinessReport", "collapsible-readiness-report.json", "collapsible-readiness.md", "collapsible-readiness.html", "Collapsible readiness Zag collapsible open closed closing collapsed size animation inert aria tests", "collapsibleSetups", "frameworkSignals", "structureSignals", "stateSignals", "sizeSignals", "animationSignals", "focusSignals", "accessibilitySignals", "machineSignals", "contextSignals", "effectSignals", "actionSignals", "guardSignals", "domSignals", "apiSignals", "data-has-collapsed-size", "trigger-click-handler", "button-type", "dir-prop", "testSignals", "packageSignals", "@zag-js/collapsible", "Machine Signals", "RepoTutor records collapsible readiness only", "collapsible-readiness-card", "data-source-pattern=\"Collapsible\"", "openTargetEntries", "collapsible-readiness"]),
  check("Editable readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["EditableReadinessReportSchema", "EditableReadinessReport", "editableReadinessReport", "editable-readiness-report.json", "editable-readiness.md", "editable-readiness.html", "Editable readiness Zag editable preview edit value commit cancel focus outside keyboard accessibility tests", "editableSetups", "frameworkSignals", "structureSignals", "stateSignals", "valueSignals", "interactionSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "guardSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/editable", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/interact-outside", "@zag-js/types", "@zag-js/utils", "Machine Signals", "RepoTutor records editable readiness only", "editable-readiness-card", "data-source-pattern=\"Editable\"", "openTargetEntries", "editable-readiness"]),
  check("Password input readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PasswordInputReadinessReportSchema", "PasswordInputReadinessReport", "passwordInputReadinessReport", "password-input-readiness-report.json", "password-input-readiness.md", "password-input-readiness.html", "Password input readiness Zag password-input visibility trigger form reset submit password manager accessibility tests", "passwordInputSetups", "frameworkSignals", "structureSignals", "stateSignals", "visibilitySignals", "formSignals", "passwordManagerSignals", "accessibilitySignals", "machineSignals", "contextSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "read-only-api", "required-prop", "data-required", "auto-capitalize-off", "spell-check-false", "prevent-default", "interactive-guard", "testSignals", "packageSignals", "@zag-js/password-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "Machine Signals", "RepoTutor records password input readiness only", "password-input-readiness-card", "data-source-pattern=\"PasswordInput\"", "openTargetEntries", "password-input-readiness"]),
  check("Signature pad readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SignaturePadReadinessReportSchema", "SignaturePadReadinessReport", "signaturePadReadinessReport", "signature-pad-readiness-report.json", "signature-pad-readiness.md", "signature-pad-readiness.html", "Signature pad readiness Zag signature-pad drawing paths pointer data URL hidden input accessibility tests", "signaturePadSetups", "frameworkSignals", "structureSignals", "stateSignals", "drawingSignals", "outputSignals", "formSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "data-disabled", "data-required", "dir-prop", "default-prevented", "clear-trigger-target-guard", "pointer-events-none", "input-type-text", "required-prop", "testSignals", "packageSignals", "@zag-js/signature-pad", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "perfect-freehand", "Machine Signals", "RepoTutor records signature pad readiness only", "signature-pad-readiness-card", "data-source-pattern=\"SignaturePad\"", "openTargetEntries", "signature-pad-readiness"]),
  check("Angle slider readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["AngleSliderReadinessReportSchema", "AngleSliderReadinessReport", "angleSliderReadinessReport", "angle-slider-readiness-report.json", "angle-slider-readiness.md", "angle-slider-readiness.html", "Angle slider readiness Zag angle-slider radial dial pointer keyboard degree form accessibility tests", "angleSliderSetups", "frameworkSignals", "structureSignals", "stateSignals", "valueSignals", "interactionSignals", "angleMathSignals", "formSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "data-disabled", "data-invalid", "data-readonly", "dir-prop", "hidden-input-type", "stop-propagation", "thumb-focus-handler", "thumb-blur-handler", "prevent-default", "testSignals", "packageSignals", "@zag-js/angle-slider", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "Machine Signals", "RepoTutor records angle slider readiness only", "angle-slider-readiness-card", "data-source-pattern=\"AngleSlider\"", "openTargetEntries", "angle-slider-readiness"]),
  check("Cascade select readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["CascadeSelectReadinessReportSchema", "CascadeSelectReadinessReport", "cascadeSelectReadinessReport", "cascade-select-readiness-report.json", "cascade-select-readiness.md", "cascade-select-readiness.html", "Cascade select readiness Zag cascade-select tree collection value path popper combobox listbox accessibility tests", "cascadeSelectSetups", "frameworkSignals", "structureSignals", "stateSignals", "collectionSignals", "selectionSignals", "navigationSignals", "positioningSignals", "formSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "guardSignals", "domSignals", "apiSignals", "aria-hidden", "data-disabled", "data-invalid", "data-readonly", "data-focus", "data-placement", "data-placeholder-shown", "data-depth", "data-selected", "data-type", "testSignals", "packageSignals", "@zag-js/cascade-select", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "Machine Signals", "RepoTutor records cascade select readiness only", "cascade-select-readiness-card", "data-source-pattern=\"CascadeSelect\"", "openTargetEntries", "cascade-select-readiness"]),
  check("Async list readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["AsyncListReadinessReportSchema", "AsyncListReadinessReport", "asyncListReadinessReport", "async-list-readiness-report.json", "async-list-readiness.md", "async-list-readiness.html", "Async list readiness Zag async-list load cursor filter sort abort stale sequence callbacks tests", "asyncListSetups", "frameworkSignals", "stateSignals", "loadSignals", "paginationSignals", "filterSignals", "sortSignals", "cancellationSignals", "callbackSignals", "machineSignals", "contextSignals", "actionSignals", "guardSignals", "asyncSignals", "apiSignals", "sort-descriptor", "filter-text", "abort-event-api", "reload-event-api", "load-more-event-api", "sort-event-api", "filter-event-api", "testSignals", "packageSignals", "@zag-js/async-list", "@zag-js/react", "@zag-js/core", "@zag-js/utils", "Machine Signals", "Async Signals", "RepoTutor records async list readiness only", "async-list-readiness-card", "data-source-pattern=\"AsyncList\"", "openTargetEntries", "async-list-readiness"]),
  check("Image cropper readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ImageCropperReadinessReportSchema", "ImageCropperReadinessReport", "imageCropperReadinessReport", "image-cropper-readiness-report.json", "image-cropper-readiness.md", "image-cropper-readiness.html", "Image cropper readiness Zag image-cropper crop resize pan zoom rotate flip canvas accessibility tests", "imageCropperSetups", "frameworkSignals", "structureSignals", "stateSignals", "cropSignals", "transformSignals", "interactionSignals", "keyboardSignals", "outputSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "guardSignals", "domSignals", "apiSignals", "aria-live", "aria-busy", "aria-hidden", "data-pinch", "data-ownedby", "data-flip-horizontal", "data-flip-vertical", "testSignals", "packageSignals", "@zag-js/image-cropper", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "Machine Signals", "RepoTutor records image cropper readiness only", "image-cropper-readiness-card", "data-source-pattern=\"ImageCropper\"", "openTargetEntries", "image-cropper-readiness"]),
  check("Listbox readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ListboxReadinessReportSchema", "ListboxReadinessReport", "listboxReadinessReport", "listbox-readiness-report.json", "listbox-readiness.md", "listbox-readiness.html", "Listbox readiness Zag listbox collection selection highlight typeahead keyboard accessibility tests", "listboxSetups", "frameworkSignals", "structureSignals", "stateSignals", "collectionSignals", "selectionSignals", "highlightSignals", "interactionSignals", "keyboardSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "guardSignals", "domSignals", "apiSignals", "dir-prop", "data-disabled", "data-orientation", "data-state", "data-layout", "data-empty", "data-activedescendant", "aria-hidden", "autocomplete-off", "spellcheck-false", "enter-key-hint", "testSignals", "packageSignals", "@zag-js/listbox", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/types", "@zag-js/utils", "Machine Signals", "RepoTutor records listbox readiness only", "listbox-readiness-card", "data-source-pattern=\"Listbox\"", "openTargetEntries", "listbox-readiness"]),
  check("Date picker readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DatePickerReadinessReportSchema", "DatePickerReadinessReport", "datePickerReadinessReport", "date-picker-readiness-report.json", "date-picker-readiness.md", "date-picker-readiness.html", "Date picker readiness Zag date-picker date-input range calendar segment keyboard accessibility tests", "datePickerSetups", "frameworkSignals", "structureSignals", "stateSignals", "valueSignals", "selectionSignals", "viewSignals", "navigationSignals", "segmentSignals", "keyboardSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "dir-prop", "data-disabled", "data-readonly", "data-empty", "data-placeholder-shown", "data-placement", "data-side", "data-inline", "data-view", "data-selectable", "autocomplete-off", "autocorrect-off", "spellcheck-false", "testSignals", "packageSignals", "@zag-js/date-picker", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/live-region", "@zag-js/dismissable", "@zag-js/date-utils", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "@internationalized/date", "Machine Signals", "API Signals", "RepoTutor records date picker readiness only", "date-picker-readiness-card", "data-source-pattern=\"DatePicker\"", "openTargetEntries", "date-picker-readiness"]),
  check("Marquee readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["MarqueeReadinessReportSchema", "MarqueeReadinessReport", "marqueeReadinessReport", "marquee-readiness-report.json", "marquee-readiness.md", "marquee-readiness.html", "Marquee readiness Zag marquee motion autofill pause interaction accessibility tests", "marqueeSetups", "frameworkSignals", "structureSignals", "stateSignals", "motionSignals", "measurementSignals", "interactionSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "dir-prop", "data-part", "data-index", "data-side", "data-reverse", "data-clone", "display-flex", "overflow-hidden", "contain-layout-style-paint", "pointer-events-none", "spacing-margin", "will-change-transform", "translate-z", "testSignals", "packageSignals", "@zag-js/marquee", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "Machine Signals", "RepoTutor records marquee readiness only", "marquee-readiness-card", "data-source-pattern=\"Marquee\"", "openTargetEntries", "marquee-readiness"]),
  check("TOC readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TocReadinessReportSchema", "TocReadinessReport", "tocReadinessReport", "toc-readiness-report.json", "toc-readiness.md", "toc-readiness.html", "TOC readiness Zag toc active headings observer indicator scroll accessibility tests", "tocSetups", "frameworkSignals", "structureSignals", "stateSignals", "observerSignals", "scrollSignals", "indicatorSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/toc", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "dir-prop", "data-value", "data-depth", "data-first", "data-last", "depth-css-var", "scroll-behavior", "scroll-into-view", "prevent-default", "download-guard", "new-tab-guard", "hashchange-event", "indicator-position-absolute", "Machine Signals", "RepoTutor records TOC readiness only", "toc-readiness-card", "data-source-pattern=\"TOC\"", "openTargetEntries", "toc-readiness"]),
  check("Floating panel readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["FloatingPanelReadinessReportSchema", "FloatingPanelReadinessReport", "floatingPanelReadinessReport", "floating-panel-readiness-report.json", "floating-panel-readiness.md", "floating-panel-readiness.html", "Floating panel readiness Zag floating-panel drag resize stage stack boundary focus accessibility tests", "floatingPanelSetups", "frameworkSignals", "structureSignals", "stateSignals", "layoutSignals", "dragResizeSignals", "stackSignals", "focusAccessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/floating-panel", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/store", "@zag-js/types", "@zag-js/utils", "dir-prop", "disabled-prop", "type-button", "data-state", "data-dragging", "aria-controls", "role-dialog", "tab-index", "hidden-content", "data-topmost", "data-behind", "data-minimized", "data-maximized", "data-staged", "data-axis", "css-position-vars", "escape-key", "arrow-key-move", "pointer-capture", "pointer-release", "stop-propagation", "left-click-guard", "no-drag-guard", "double-click-stage", "touch-action-none", "cursor-move", "Machine Signals", "API Signals", "RepoTutor records floating panel readiness only", "floating-panel-readiness-card", "data-source-pattern=\"FloatingPanel\"", "openTargetEntries", "floating-panel-readiness"]),
  check("Drawer readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DrawerReadinessReportSchema", "DrawerReadinessReport", "drawerReadinessReport", "drawer-readiness-report.json", "drawer-readiness.md", "drawer-readiness.html", "Drawer readiness Zag drawer swipe snap stack modal focus accessibility tests", "drawerSetups", "frameworkSignals", "structureSignals", "stateSignals", "snapSignals", "swipeSignals", "stackSignals", "focusAccessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "@zag-js/drawer", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/aria-hidden", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-trap", "@zag-js/remove-scroll", "@zag-js/types", "@zag-js/utils", "dir-prop", "hidden-prop", "data-state", "data-swipe-direction", "pointer-events-none", "tab-index", "role-prop", "aria-modal", "aria-labelledby", "aria-describedby", "data-expanded", "data-swiping", "data-dragging", "nested-open", "nested-swiping", "transform-translate3d", "drawer-css-vars", "will-change-transform", "data-ownedby", "data-value", "aria-haspopup-dialog", "aria-expanded", "aria-controls", "data-current", "aria-hidden", "data-disabled", "touch-action-pan", "touch-start", "prevent-default", "left-click-guard", "Machine Signals", "API Signals", "RepoTutor records drawer readiness only", "drawer-readiness-card", "data-source-pattern=\"Drawer\"", "openTargetEntries", "drawer-readiness"]),
  check("Hover-card readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["HoverCardReadinessReportSchema", "HoverCardReadinessReport", "hoverCardReadinessReport", "hover-card-readiness-report.json", "hover-card-readiness.md", "hover-card-readiness.html", "Hover card readiness Zag hover-card delayed hover focus positioning dismissable accessibility tests", "hoverCardSetups", "frameworkSignals", "structureSignals", "stateSignals", "delaySignals", "positioningSignals", "interactionSignals", "accessibilitySignals", "machineSignals", "contextSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "dir-prop", "disabled-guard", "arrow-style", "arrow-tip-style", "positioner-floating-style", "pointer-enter-handler", "pointer-leave-handler", "touch-ignore", "focus-handler", "blur-handler", "trigger-value-switch", "RepoTutor records hover-card readiness only", "hover-card-readiness-card", "data-source-pattern=\"HoverCard\"", "openTargetEntries", "hover-card-readiness"]),
  check("Navigation-menu readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["NavigationMenuReadinessReportSchema", "NavigationMenuReadinessReport", "navigationMenuReadinessReport", "navigation-menu-readiness-report.json", "navigation-menu-readiness.md", "navigation-menu-readiness.html", "Navigation menu readiness Zag navigation-menu value viewport proxy motion dismissable keyboard accessibility tests", "navigationMenuSetups", "frameworkSignals", "structureSignals", "stateSignals", "delaySignals", "viewportSignals", "interactionSignals", "keyboardSignals", "accessibilitySignals", "machineSignals", "contextSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "testSignals", "packageSignals", "dir-prop", "root-aria-label", "data-orientation", "layout-css-vars", "data-value", "data-state", "data-disabled", "aria-hidden", "hidden-prop", "indicator-position-absolute", "transition-none", "data-uid", "data-trigger-proxy-id", "aria-controls", "aria-expanded", "pointer-enter-handler", "pointer-leave-handler", "mouse-pointer-guard", "disable-hover-guard", "disable-click-guard", "key-navigation", "prevent-default", "stop-propagation", "trigger-proxy-focus", "visually-hidden-style", "aria-owns", "aria-current-page", "custom-link-select", "close-on-click", "meta-key-guard", "aria-labelledby", "viewport-pointer-events-none", "data-align", "RepoTutor records navigation-menu readiness only", "navigation-menu-readiness-card", "data-source-pattern=\"NavigationMenu\"", "openTargetEntries", "navigation-menu-readiness"]),
  check("Presence readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PresenceReadinessReportSchema", "PresenceReadinessReport", "presenceReadinessReport", "presence-readiness-report.json", "presence-readiness.md", "presence-readiness.html", "Presence readiness Zag presence Headless UI Transition mounted unmountSuspended unmounted nesting transition data open closed visibility immediate tests", "presenceSetups", "frameworkSignals", "stateSignals", "lifecycleSignals", "animationSignals", "visibilitySignals", "machineSignals", "contextSignals", "effectSignals", "actionSignals", "apiSignals", "implementationSignals", "Implementation Signals", "transition-context", "nesting-context", "tree-states", "should-forward-ref", "register-unregister", "has-children", "render-strategy-unmount-hidden", "transition-chains", "wait-promises", "server-handoff", "skip-initial-transition", "immediate-appear", "use-transition-hook", "transition-data-attributes", "class-map-enter-leave", "open-closed-provider", "state-opening-closing", "show-from-open-closed", "missing-show-error", "initial-change-tracking", "before-enter-leave", "after-enter-leave", "internal-transition-child", "transition-object-assign", "node-null-guard", "node-set-event", "unmount-event", "state-matches-present", "initial-skip", "props-create-props", "present-prop", "on-exit-complete-prop", "immediate-prop", "presence-api-interface", "skip-boolean", "present-boolean", "set-node-nullable", "unmount-void-api", "presence-service-type", "presence-machine-type", "present-coerce-boolean", "initial-state-present-prop", "exitcomplete-bubbles-false", "node-dispatch-event", "same-node-guard", "computed-style-cache", "visibility-hidden-unmount", "raf-presence-check", "animation-name-none", "display-none-unmount", "zero-duration-unmount", "unmount-suspend-event", "testSignals", "packageSignals", "@zag-js/presence", "@zag-js/react", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@headlessui/react", "Machine Signals", "RepoTutor records presence readiness only", "presence-readiness-card", "data-source-pattern=\"Presence\"", "openTargetEntries", "presence-readiness"]),
  check("Menu readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["MenuReadinessReportSchema", "MenuReadinessReport", "menuReadinessReport", "menu-readiness-report.json", "menu-readiness.md", "menu-readiness.html", "Menu readiness Zag menu trigger context typeahead submenu positioning dismissable keyboard option tests", "menuSetups", "frameworkSignals", "anatomySignals", "stateSignals", "highlightSignals", "typeaheadSignals", "positioningSignals", "interactionSignals", "keyboardSignals", "accessibilitySignals", "machineSignals", "contextSignals", "computedSignals", "effectSignals", "guardSignals", "actionSignals", "domSignals", "apiSignals", "dir-prop", "data-placement", "data-side", "type-button", "data-ownedby", "data-value", "data-current", "data-uid", "aria-haspopup-menu-dialog", "aria-controls", "data-controls", "aria-expanded", "pointer-move-handler", "pointer-leave-handler", "disabled-target-guard", "context-menu-guard", "prevent-default", "default-prevented-guard", "trigger-blur-handler", "trigger-focus-handler", "key-map-arrow", "positioner-floating-style", "arrow-style", "arrow-tip-style", "content-role", "content-tabindex", "aria-activedescendant", "aria-labelledby", "valid-tab-guard", "typeahead-printable-guard", "separator-role", "option-data-type", "aria-checked", "item-indicator-hidden", "item-group-role", "download-guard", "new-tab-guard", "drag-link-prevent-default", "testSignals", "packageSignals", "@zag-js/menu", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "Machine Signals", "API Signals", "RepoTutor records menu readiness only", "menu-readiness-card", "data-source-pattern=\"Menu\"", "openTargetEntries", "menu-readiness"]),
  check("Tooltip readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["TooltipReadinessReportSchema", "TooltipReadinessReport", "tooltipReadinessReport", "tooltip-readiness-report.json", "tooltip-readiness.md", "tooltip-readiness.html", "Tooltip readiness Zag tooltip trigger content arrow delay positioning store pointer scroll escape accessibility tests", "tooltipSetups", "frameworkSignals", "anatomySignals", "stateSignals", "delaySignals", "positioningSignals", "storeSignals", "interactionSignals", "accessibilitySignals", "machineSignals", "contextSignals", "effectSignals", "actionSignals", "domSignals", "apiSignals", "data-ownedby", "data-value", "data-current", "dir-prop", "data-expanded", "close-on-click-guard", "focus-visible-guard", "related-trigger-guard", "left-click-guard", "close-on-pointerdown-guard", "touch-pointer-ignore", "pointer-over-handler", "pointer-cancel-handler", "arrow-style", "arrow-tip-style", "positioner-floating-style", "hidden-prop", "data-instant", "aria-label-role-guard", "content-id-aria-label-guard", "content-pointer-enter", "content-pointer-leave", "interactive-pointer-events", "default-prevented-guard", "disabled-guard", "store-current-id", "store-prev-id", "current-placement-side", "testSignals", "packageSignals", "RepoTutor records tooltip readiness only", "tooltip-readiness-card", "data-source-pattern=\"Tooltip\"", "openTargetEntries", "tooltip-readiness"]),
  check("LLM readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["LlmReadinessReportSchema", "LlmReadinessReport", "llmReadinessReport", "llm-readiness-report.json", "llm-readiness.md", "llm-readiness.html", "LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys", "llmSetups", "modelSignals", "init-chat-model", "model-provider-config", "model-provider-inference", "provider-prefix", "configurable-model", "configurable-fields", "config-prefix", "base-chat-model", "chat-model-call-options", "chat-model-stream-v2", "chat-model-generation", "chat-model-cache", "base-cache-interface", "in-memory-cache", "cache-key-encoder", "cache-generation-serialization", "cache-chat-generation-message", "global-cache-map", "chat-model-callbacks", "model-output-version", "model-token-usage-output", "llm-result-generations", "generation-info", "generation-chunk-concat", "chat-generation-chunk", "chat-result-output", "run-key-metadata", "model-profile", "model-context-window", "model-multimodal-inputs", "model-tool-message-inputs", "model-output-modalities", "model-reasoning-output", "model-tool-capabilities", "model-structured-output-profile", "fake-built-model", "fake-model-builder", "fake-model-response-queue", "fake-model-call-capture", "promptSignals", "few-shot", "few-shot-template", "example-selector", "length-based-example-selector", "semantic-similarity-example-selector", "base-prompt-selector", "conditional-prompt-selector", "prompt-selector-partials", "prompt-selector-llm-type-guard", "example-prompt", "example-separator", "partial-variables", "template-format", "mustache-template", "f-string-template", "template-parser", "template-renderer", "template-validation", "invalid-prompt-input", "message-content-template", "message-content-block", "data-content-block", "provider-content-converter", "openai-data-block", "openai-response-block", "anthropic-content-block", "content-block-merge", "openrouter-reasoning-block", "groq-reasoning-block", "ollama-reasoning-block", "deepseek-reasoning-block", "xai-reasoning-block", "google-thinking-block", "bedrock-converse-block", "bedrock-citation-block", "message-prompt-template", "chat-message-prompt-template", "role-message-prompt-template", "image-prompt-template", "image-prompt-input", "image-prompt-value", "image-content-fields", "image-url-template", "image-prompt-partial", "placeholder-coercion", "message-constructor-coercion", "message-like-coercion", "message-buffer-string", "stored-message-v1-map", "stored-message-chat-map", "chat-message-storage-map", "chat-prompt-validation", "image-prompt-parsing", "chat-prompt-flattening", "pipeline-prompt-template", "pipeline-prompts", "pipeline-final-prompt", "pipeline-input-computation", "pipeline-format-prompts", "pipeline-partial", "structured-prompt", "structured-prompt-schema", "structured-prompt-method", "structured-prompt-pipe", "structured-prompt-factory", "dict-prompt-template", "dict-prompt-template-format", "dict-input-variables", "dict-template-render", "dict-nested-template", "base-prompt-template", "base-prompt-input", "base-string-prompt-template", "prompt-value-formatting", "prompt-serialization", "prompt-partial-merge", "dynamic-system-prompt", "summary-prompt", "runnableSignals", "Runnable Signals", "RunnableLambda", "RunnablePassthrough", "RunnableMap", "RunnableWithMessageHistory", "message-history-store", "message-history-config", "message-history-keys", "message-history-insert", "message-history-persist", "message-history-input-coercion", "message-history-output-coercion", "message-history-enter-exit", "message-history-session-attach", "message-history-dedupe", "message-filter", "message-run-merge", "message-trim", "message-chunk-conversion", "response-metadata-merge", "usage-metadata-merge", "runnable-config", "config-ensure", "config-merge", "config-patch", "config-pick-keys", "base-store", "in-memory-store", "store-mget", "store-mset", "store-mdelete", "store-yield-keys", "runnable-callback-manager-config", "async-local-config", "async-local-child-config", "async-local-run-tree", "async-local-root-run-control", "async-local-context-carryover", "async-local-global-instance", "recursion-limit", "config-timeout-signal", "configurable-runtime", "runnable-branch", "branch-condition", "branch-default", "runnable-router", "router-input", "router-key-dispatch", "router-missing-key", "router-batch-concurrency", "router-stream", "runnable-binding", "config-factory", "runnable-each", "runnable-retry", "retry-attempt-handler", "runnable-with-fallbacks", "runnable-assign", "runnable-pick", "map-key-callback", "runnable-stream-log", "runnable-stream-events", "runnable-coercion", "pipe-chain", "with-retry", "with-fallbacks", "toolSignals", "agent-middleware", "middleware-state-schema", "middleware-context-schema", "wrap-model-call", "wrap-tool-call", "hitl-interrupt", "hitl-review-config", "headless-tool", "headless-tool-overload", "headless-tool-implementation", "headless-tool-interrupt", "headless-tool-metadata", "summarization-middleware", "context-editing", "context-clear-tool-uses", "llm-tool-selector", "ai-message-tool-calls", "fake-model-tool-calls", "tool-call-parser", "tool-call-chunk", "tool-message-artifact", "tool-message-status", "tool-response-format", "tool-return-type", "tool-content-artifact-format", "direct-tool-output", "tool-output-formatting", "tool-runnable-config", "dynamic-tool-wrapper", "dynamic-structured-tool", "tool-input-parsing-exception", "tool-callback-lifecycle", "tool-wrapper-runtime-config", "tool-wrapper-abort-signal", "openai-function-conversion", "openai-tool-conversion", "tool-strict-schema", "tool-json-schema-conversion", "tool-json-schema-cache", "tool-schema-type-guards", "server-tool-call-block", "mcp-load-tools", "mcp-tool-hooks", "mcp-structured-content", "mcp-output-handling", "@langchain/mcp-adapters", "@modelcontextprotocol/sdk", "retrievalSignals", "retriever-tool", "retriever-tool-schema", "retriever-callback-child", "retriever-document-format", "base-retriever", "retriever-run-config", "retriever-start-event", "retriever-end-event", "retriever-error-event", "fake-retriever", "document-transformer", "mapping-document-transformer", "transform-documents", "document-compressor", "compress-documents", "base-document-loader", "structuredOutputSignals", "response-format", "structured-response", "fake-model-structured-response", "tool-strategy", "provider-strategy", "typed-tool-strategy", "transform-response-format", "response-format-undefined", "json-schema-support", "structured-output-errors", "tool-strategy-options", "base-output-parser", "transform-output-parser", "cumulative-output-parser", "json-output-parser", "string-output-parser", "bytes-output-parser", "list-output-parser", "xml-output-parser", "standard-schema-output-parser", "openai-functions-parser", "openai-tools-parser", "content-parser-factory", "function-calling-parser-factory", "structured-output-pipeline", "include-raw-output", "raw-parsed-output", "parser-fallback", "parser-assign", "streamingSignals", "agent-run-stream", "chat-model-stream", "text-content-stream", "tool-calls-substream", "reasoning-content-stream", "usage-metadata-stream", "replay-buffer", "content-delta-assembly", "stream-output-message", "tool-block-standardization", "stream-transformer", "stream-channel", "stream-mode", "http-event-stream-wrapper", "event-stream-data-frame", "event-stream-end-frame", "readable-stream-bridge", "iterable-readable-stream-adapter", "event-source-content-type", "event-source-byte-reader", "event-source-line-parser", "event-source-message-parser", "event-source-retry-id", "event-source-data-stream", "tool-call-stream", "tool-call-stream-projection", "tool-call-output-normalization", "headless-tool-stream-interrupt", "tool-call-pending-map", "tool-call-stream-finalize", "content-block-stream", "legacy-chat-generation-bridge", "stream-event-conversion", "stream-active-blocks", "stream-image-tool-output", "stream-audio-payload", "stream-abort-signal", "stream-usage-start", "base-callback-handler", "callback-manager-config", "callback-run-manager", "custom-event-dispatch", "custom-event-node-dispatch", "custom-event-web-dispatch", "custom-event-config-required", "custom-event-parent-run", "custom-event-async-local", "event-stream-callback", "log-stream-json-patch", "log-stream-run-state", "log-stream-filtering", "log-stream-writer", "log-stream-output-tap", "log-stream-standardized-io", "log-stream-callback", "run-collector-tracer", "root-listener-tracer", "safetySignals", "model-retry", "tool-retry", "human-in-the-loop", "pii-detection", "pii-redaction", "pii-mask", "pii-hash", "pii-block", "openai-moderation", "moderation-jump", "prompt-caching", "model-call-limit", "tool-call-limit", "serialized-load-trust-boundary", "serialized-constructor-load", "serialized-secret-map", "serialized-import-map", "serialized-escape-marker", "serialized-depth-limit", "packageSignals", "LangChain.js", "llm-readiness-card", "data-source-pattern=\"LangChain.js\"", "openTargetEntries", "llm-readiness"]),
  check("Server framework readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ServerFrameworkReadinessReportSchema", "ServerFrameworkReadinessReport", "serverFrameworkReadinessReport", "server-framework-readiness-report.json", "server-framework-readiness.md", "server-framework-readiness.html", "Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux fastify route get post schema register plugin addHook decorate setErrorHandler listen inject logger withTypeProvider FastifyInstance FastifyPluginCallback FastifyPluginAsync addContentTypeParser childLoggerFactory express express.Router app.use error middleware app.param express.static express.json express.urlencoded res.send res.json res.render res.redirect req.params req.query req.body supertest mocha new Koa app.use async ctx await next koa-compose app.callback app.on error ctx.body ctx.status ctx.throw ctx.assert ctx.state ctx.cookies ctx.redirect app.context app.keys app.proxy asyncLocalStorage node:test NestFactory @Module @Controller @Get @Post @Injectable @Inject @Body @Param @Query @Headers @UseGuards @UsePipes @UseInterceptors @UseFilters ValidationPipe ExceptionFilter CanActivate PipeTransform NestInterceptor TestingModule createTestingModule enableCors setGlobalPrefix NestExpressApplication NestFastifyApplication WebSocketGateway @Resolver @MessagePattern ClientProxy ConfigModule TypeOrmModule MongooseModule GraphQLModule new Hono app.route basePath app.use c.req c.json validator zValidator hc testClient app.fetch serve Hapi.server server.route server.register server.ext server.auth server.method server.decorate server.state server.cache server.validator Joi h.response h.redirect request.params request.query request.payload request.headers Boom server.start server.inject Lab Code new Elysia group guard derive resolve model macro t.Object onBeforeHandle onAfterHandle onAfterResponse status redirect set.headers ws app.handle app.fetch treaty eden Bun.test @adonisjs/core router.get router.group router.resource middleware HttpContext request.validateUsing response.redirect ApplicationService BaseCommand testUtils Japa sails config/routes sails.config.routes sails.router.bind sails.lift sails.load actions2 inputs exits fn policies blueprints hooks helpers Waterline res.view res.json sails.request Meteor.startup Meteor.methods Meteor.publish Meteor.subscribe DDP.connect Mongo.Collection WebApp.connectHandlers check Match Tracker.autorun Template.events Template.helpers Blaze.render Tinytest meteor test Rails.application.routes.draw resources namespace scope root ActionController::Base ApplicationController before_action params.require permit render json redirect_to ActiveRecord::Base ApplicationRecord has_many belongs_to validates ActiveJob::Base ActionMailer::Base ActionCable ActiveSupport::TestCase ActionDispatch::IntegrationTest Django urlpatterns path re_path include reverse resolve INSTALLED_APPS MIDDLEWARE ROOT_URLCONF settings.configure DJANGO_SETTINGS_MODULE models.Model ForeignKey ManyToManyField QuerySet Manager forms.Form forms.ModelForm MiddlewareMixin process_request process_response admin.site.register ModelAdmin migrations.Migration BaseCommand django-admin manage.py TestCase Client RequestFactory Laravel Route:: routes/web.php routes/api.php Controller Middleware FormRequest Validator::make Eloquent Model fillable guarded casts hasMany belongsTo Schema::create migration factory seeder Blade view artisan command schedule queue job Mailable Notification Broadcast Event Listener PHPUnit Pest SpringBootApplication SpringApplication.run RestController RequestMapping GetMapping PostMapping PathVariable RequestParam RequestBody ResponseEntity Configuration AutoConfiguration ConfigurationProperties Bean ConditionalOn Service Repository Component Entity JpaRepository Transactional Actuator HealthIndicator MeterRegistry WebMvc WebFlux RouterFunction MockMvc WebTestClient TestRestTemplate Testcontainers WebApplication.CreateBuilder WebApplication.CreateSlimBuilder builder.Services MapGet MapPost MapPut MapDelete MapPatch MapGroup MapControllers AddControllers ControllerBase ApiController Route HttpGet HttpPost FromBody FromRoute FromQuery IActionResult ActionResult IResult Results TypedResults ProblemDetails AddProblemDetails AddRouting UseRouting UseAuthentication UseAuthorization AddAuthentication AddAuthorization AddOpenApi MapOpenApi Swagger UI SignalR MapHub AddHealthChecks MapHealthChecks TestServer WebApplicationFactory UseTestServer CreateClient xUnit Flask Blueprint route add_url_rule MethodView request jsonify render_template redirect abort url_for session g current_app app_context request_context before_request after_request teardown_request errorhandler config from_prefixed_env test_client test_request_context test_cli_runner pytest Symfony FrameworkBundle Route RouteCollection AbstractController RequestStack JsonResponse RedirectResponse HttpKernel KernelInterface MicroKernelTrait ContainerBuilder services.yaml autowire autoconfigure CompilerPassInterface EventSubscriberInterface AsCommand CommandTester KernelBrowser WebTestCase KernelTestCase gin.Default gin.New gin.Engine gin.RouterGroup GET POST PUT PATCH DELETE Any Group Use gin.Context Param Query DefaultQuery PostForm DefaultPostForm GetHeader GetRawData ShouldBind BindJSON ShouldBindJSON ShouldBindQuery ShouldBindUri binding.Validator JSON String HTML Redirect File Abort AbortWithStatus NoRoute NoMethod Logger Recovery SetTrustedProxies Run RunTLS RunUnix httptest CreateTestContext SetMode TestMode echo.New echo.Echo echo.Group GET POST PUT PATCH DELETE Any Match Group Use echo.Context Param QueryParam FormValue Request Bind Validate JSON String HTML Redirect File Attachment Inline NoContent Stream HTTPError NewHTTPError NotFoundHandler MethodNotAllowedHandler Recover Logger Renderer Static Start StartTLS StartAutoTLS StartServer NewContext httptest fiber.New fiber.App fiber.Ctx fiber.Router Get Post Put Patch Delete All Group Route Mount Use Static Params Query Get Bind Body JSON SendString Render Redirect SendFile Download SendStream SendStatus Status NewError ErrorHandler recover.New logger.New Listen ListenTLS ListenMutualTLS app.Test httptest chi.NewRouter chi.NewMux chi.Mux chi.Router chi.Routes chi.Middlewares Get Post Put Patch Delete Head Options Connect Trace Method MethodFunc Handle HandleFunc Group Route Mount Use With Chain URLParam URLParamFromCtx RouteContext NewRouteContext RoutePattern Routes Middlewares Match Find NotFound MethodNotAllowed middleware.Logger middleware.Recoverer middleware.RequestID middleware.RealIP middleware.ClientIP middleware.Timeout middleware.Compress middleware.Throttle middleware.StripSlashes middleware.RedirectSlashes middleware.URLFormat httptest mux.NewRouter mux.Router mux.Route mux.RouteMatch Handle HandleFunc Handler HandlerFunc Methods Path PathPrefix Host Headers HeadersRegexp Queries Schemes MatcherFunc Subrouter Name URL URLHost URLPath GetVarNames BuildVarsFunc StrictSlash SkipClean UseEncodedPath Vars SetURLVars CurrentRoute CurrentRouter MiddlewareFunc Use CORSMethodMiddleware Walk WalkFunc GetPathTemplate GetMethods httptest", "serverSetups", "routeSignals", "schemaSignals", "pluginSignals", "lifecycleSignals", "runtimeSignals", "errorSignals", "testSignals", "fastifySignals", "expressSignals", "koaSignals", "nestjsSignals", "honoSignals", "hapiSignals", "elysiaSignals", "adonisSignals", "sailsSignals", "meteorSignals", "railsSignals", "djangoSignals", "laravelSignals", "springSignals", "aspnetCoreSignals", "flaskSignals", "symfonySignals", "ginSignals", "echoSignals", "fiberSignals", "chiSignals", "muxSignals", "packageSignals", "Fastify Signals", "Express Signals", "Koa Signals", "NestJS Signals", "Hono Signals", "Hapi Signals", "Elysia Signals", "AdonisJS Signals", "Sails Signals", "Meteor Signals", "Rails Signals", "Django Signals", "Laravel Signals", "Spring Signals", "ASP.NET Core Signals", "Flask Signals", "Symfony Signals", "Gin Signals", "Echo Signals", "Fiber Signals", "Chi Signals", "Mux Signals", "Fastify", "Express", "Koa", "NestJS", "Hono", "Hapi", "Elysia", "AdonisJS", "Sails", "Meteor", "Rails", "Django", "Laravel", "Spring", "ASP.NET Core", "Flask", "Symfony", "Gin", "Echo", "Fiber", "Chi", "Gorilla Mux", "server-framework-readiness-card", "data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"", "openTargetEntries", "server-framework-readiness"]),
  check("RPC readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["RpcReadinessReportSchema", "RpcReadinessReport", "rpcReadinessReport", "rpc-readiness-report.json", "rpc-readiness.md", "rpc-readiness.html", "tRPC initTRPC router procedure query mutation subscription input output middleware context createTRPCClient links adapters TRPCError createCaller", "rpcSetups", "routerSignals", "procedureSignals", "validationSignals", "contextSignals", "clientSignals", "adapterSignals", "errorSignals", "callerSignals", "packageSignals", "tRPC", "rpc-readiness-card", "data-source-pattern=\"tRPC\"", "openTargetEntries", "rpc-readiness"]),
  check("Workspace graph readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["WorkspaceGraphReadinessReportSchema", "WorkspaceGraphReadinessReport", "workspaceGraphReadinessReport", "workspace-graph-readiness-report.json", "workspace-graph-readiness.md", "workspace-graph-readiness.html", "Nx project graph nx.json project.json targets targetDefaults namedInputs plugins createNodes affected tags implicitDependencies enforce-module-boundaries depConstraints", "workspaceFiles", "projectSignals", "graphSignals", "boundarySignals", "affectedSignals", "targetSignals", "pluginSignals", "packageSignals", "Nx", "workspace-graph-readiness-card", "data-source-pattern=\"Nx\"", "openTargetEntries", "workspace-graph-readiness"]),
  check("Scaffolding readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ScaffoldingReadinessReportSchema", "ScaffoldingReadinessReport", "scaffoldingReadinessReport", "scaffolding-readiness-report.json", "scaffolding-readiness.md", "scaffolding-readiness.html", "Plop setGenerator prompts actions add addMany modify append templateFile helpers partials load skipIfExists force abortOnFail", "generatorFiles", "promptSignals", "actionSignals", "templateSignals", "safetySignals", "packageSignals", "Plop", "scaffolding-readiness-card", "data-source-pattern=\"Plop\"", "openTargetEntries", "scaffolding-readiness"]),
  check("Scheduler readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SchedulerReadinessReportSchema", "SchedulerReadinessReport", "schedulerReadinessReport", "scheduler-readiness-report.json", "scheduler-readiness.md", "scheduler-readiness.html", "node-cron schedule createTask cron expression timezone noOverlap maxExecutions start stop destroy execute validate ScheduledTask", "schedulerSetups", "scheduleSignals", "taskSignals", "lifecycleSignals", "reliabilitySignals", "packageSignals", "node-cron", "scheduler-readiness-card", "data-source-pattern=\"node-cron\"", "openTargetEntries", "scheduler-readiness"]),
  check("Build tool readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["BuildToolReadinessReportSchema", "BuildToolReadinessReport", "buildToolReadinessReport", "build-tool-readiness-report.json", "build-tool-readiness.md", "build-tool-readiness.html", "Vite defineConfig plugins createServer preview build optimizeDeps ssr loadEnv import.meta.env transformIndexHtml configureServer", "buildToolSetups", "configSignals", "pluginSignals", "devServerSignals", "buildSignals", "environmentSignals", "ssrSignals", "dependencyOptimizationSignals", "packageSignals", "Vite", "build-tool-readiness-card", "data-source-pattern=\"Vite\"", "openTargetEntries", "build-tool-readiness"]),
  check("Styling readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["StylingReadinessReportSchema", "StylingReadinessReport", "stylingReadinessReport", "styling-readiness-report.json", "styling-readiness.md", "styling-readiness.html", "Tailwind CSS @import tailwindcss @theme @utility @variant @source @config @plugin @apply content safelist darkMode prefix important", "stylingSetups", "configSignals", "directiveSignals", "classSignals", "themeSignals", "integrationSignals", "packageSignals", "Tailwind CSS", "styling-readiness-card", "data-source-pattern=\"Tailwind CSS\"", "openTargetEntries", "styling-readiness"]),
  check("Visual regression readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["VisualRegressionReadinessReportSchema", "VisualRegressionReadinessReport", "visualRegressionReadinessReport", "visual-regression-readiness-report.json", "visual-regression-readiness.md", "visual-regression-readiness.html", "reg-suit regconfig actualDir expectedDir diffDir thresholdRate thresholdPixel matchingThreshold ximgdiff sync-expected compare publish report plugin storage notification", "visualRegressionSetups", "snapshotSignals", "thresholdSignals", "reportSignals", "pluginSignals", "ciSignals", "packageSignals", "reg-suit", "visual-regression-readiness-card", "data-source-pattern=\"reg-suit\"", "openTargetEntries", "visual-regression-readiness"]),
  check("Infrastructure readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["InfrastructureReadinessReportSchema", "InfrastructureReadinessReport", "infrastructureReadinessReport", "infrastructure-readiness-report.json", "infrastructure-readiness.md", "infrastructure-readiness.html", "OpenTofu terraform block provider resource data module variable output backend state lockfile init plan apply import workspace validate fmt test", "infrastructureSetups", "configSignals", "stateSignals", "workflowSignals", "moduleSignals", "variableSignals", "policySignals", "packageSignals", "OpenTofu", "infrastructure-readiness-card", "data-source-pattern=\"OpenTofu\"", "openTargetEntries", "infrastructure-readiness"]),
  check("IaC drift readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["IacDriftReadinessReportSchema", "IacDriftReadinessReport", "iacDriftReadinessReport", "iac-drift-readiness-report.json", "iac-drift-readiness.md", "iac-drift-readiness.html", "IaC drift readiness driftctl scan from tfstate terraform plan -detailed-exitcode refresh-only state pull show json OpenTofu tofu Pulumi refresh preview stack export import Terragrunt run-all plan ignore unmanaged missing changed drift summary", "driftSetups", "toolSignals", "stateSignals", "inventorySignals", "refreshSignals", "planSignals", "driftSignals", "remediationSignals", "outputSignals", "ciSignals", "packageSignals", "Run driftctl, Terraform/OpenTofu, Pulumi, Terragrunt, cloud provider, state, plan, refresh, import, apply, and destroy commands only in a trusted sandbox", "iac-drift-readiness-card", "data-source-pattern=\"IaCDrift\"", "openTargetEntries", "iac-drift-readiness"]),
  check("Deployment readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DeploymentReadinessReportSchema", "DeploymentReadinessReport", "deploymentReadinessReport", "deployment-readiness-report.json", "deployment-readiness.md", "deployment-readiness.html", "Helm Chart.yaml values.yaml templates helm lint template install upgrade rollback dependency package repo test", "deploymentSetups", "chartSignals", "templateSignals", "valueSignals", "releaseSignals", "safetySignals", "packageSignals", "Helm", "deployment-readiness-card", "data-source-pattern=\"Helm\"", "openTargetEntries", "deployment-readiness"]),
  check("Serverless readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ServerlessReadinessReportSchema", "ServerlessReadinessReport", "serverlessReadinessReport", "serverless-readiness-report.json", "serverless-readiness.md", "serverless-readiness.html", "Serverless Framework serverless.yml service provider runtime stage region functions handler events httpApi schedule sqs sns resources package plugins deploy invoke offline logs", "serverlessSetups", "configSignals", "functionSignals", "eventSignals", "runtimeSignals", "deploymentSignals", "safetySignals", "packageSignals", "serverless", "serverless-readiness-card", "data-source-pattern=\"Serverless Framework\"", "openTargetEntries", "serverless-readiness"]),
  check("Mobile readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["MobileReadinessReportSchema", "MobileReadinessReport", "mobileReadinessReport", "mobile-readiness-report.json", "mobile-readiness.md", "mobile-readiness.html", "packages/core/src/scanner.ts:Expo app.json app.config eas.json expo start expo run:ios expo run:android eas build eas update expo-updates runtimeVersion scheme plugins assets permissions", "mobileSetups", "configSignals", "platformSignals", "navigationSignals", "buildSignals", "updateSignals", "assetSignals", "packageSignals", "mobile", "mobile-readiness-card", "data-source-pattern=\"Expo\"", "openTargetEntries", "mobile-readiness"]),
  check("Desktop readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DesktopReadinessReportSchema", "DesktopReadinessReport", "desktopReadinessReport", "desktop-readiness-report.json", "desktop-readiness.md", "desktop-readiness.html", "Tauri tauri.conf.json capabilities permissions bundle updater createUpdaterArtifacts signing notarization Electron electron-builder electron-forge autoUpdater Wails wails.json wails build desktop app packaging", "desktopSetups", "frameworkSignals", "configSignals", "runtimeSignals", "permissionSignals", "bundleSignals", "releaseSignals", "packageSignals", "desktop", "desktop-readiness-card", "data-source-pattern=\"Tauri\"", "openTargetEntries", "desktop-readiness"]),
  check("Edge readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["EdgeReadinessReportSchema", "EdgeReadinessReport", "edgeReadinessReport", "edge-readiness-report.json", "edge-readiness.md", "edge-readiness.html", "Cloudflare Workers wrangler.toml compatibility_date main fetch handler bindings kv_namespaces r2_buckets d1_databases durable_objects queues services vars routes workers_dev wrangler dev deploy tail secret Miniflare vitest-pool-workers", "edgeSetups", "configSignals", "handlerSignals", "bindingSignals", "routingSignals", "devSignals", "deploymentSignals", "observabilitySignals", "packageSignals", "edge", "edge-readiness-card", "data-source-pattern=\"Cloudflare Workers\"", "openTargetEntries", "edge-readiness"]),
  check("Compose readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ComposeReadinessReportSchema", "ComposeReadinessReport", "composeReadinessReport", "compose-readiness-report.json", "compose-readiness.md", "compose-readiness.html", "Docker Compose compose.yaml docker-compose.yml services build image ports volumes networks depends_on healthcheck profiles env_file secrets configs docker compose config up build run logs ps watch wait", "composeSetups", "configSignals", "serviceSignals", "dependencySignals", "resourceSignals", "workflowSignals", "safetySignals", "packageSignals", "compose", "compose-readiness-card", "data-source-pattern=\"Docker Compose\"", "openTargetEntries", "compose-readiness"]),
  check("Dev Container readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DevContainerReadinessReportSchema", "DevContainerReadinessReport", "devContainerReadinessReport", "devcontainer-readiness-report.json", "devcontainer-readiness.md", "devcontainer-readiness.html", "Dev Containers devcontainer.json .devcontainer devcontainer build up exec read-configuration run-user-commands features templates postCreateCommand forwardPorts customizations remoteUser containerEnv mounts workspaceFolder", "devContainerSetups", "configSignals", "featureSignals", "lifecycleSignals", "environmentSignals", "workspaceSignals", "customizationSignals", "workflowSignals", "safetySignals", "packageSignals", "devcontainer", "devcontainer-readiness-card", "data-source-pattern=\"Dev Containers\"", "openTargetEntries", "devcontainer-readiness"]),
  check("Kubernetes readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["KubernetesReadinessReportSchema", "KubernetesReadinessReport", "kubernetesReadinessReport", "kubernetes-readiness-report.json", "kubernetes-readiness.md", "kubernetes-readiness.html", "Kubernetes apiVersion kind metadata labels annotations namespace Deployment StatefulSet DaemonSet Service Ingress ConfigMap Secret ServiceAccount Role RoleBinding ClusterRole ClusterRoleBinding NetworkPolicy PersistentVolume PersistentVolumeClaim readinessProbe livenessProbe resources requests limits HorizontalPodAutoscaler PodDisruptionBudget kustomization resources patches kubectl apply diff wait rollout logs describe port-forward delete", "kubernetesSetups", "manifestSignals", "workloadSignals", "networkSignals", "configSignals", "storageSignals", "securitySignals", "healthSignals", "kustomizeSignals", "workflowSignals", "packageSignals", "Kubernetes", "kubernetes-readiness-card", "data-source-pattern=\"Kubernetes\"", "openTargetEntries", "kubernetes-readiness"]),
  check("GitOps readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["GitOpsReadinessReportSchema", "GitOpsReadinessReport", "gitopsReadinessReport", "gitops-readiness-report.json", "gitops-readiness.md", "gitops-readiness.html", "GitOps Argo CD Application ApplicationSet AppProject repoURL targetRevision path destination syncPolicy automated prune selfHeal syncOptions Flux GitRepository HelmRepository OCIRepository Bucket Kustomization HelmRelease dependsOn interval prune suspend healthChecks timeout retryInterval ImageRepository ImagePolicy ImageUpdateAutomation Receiver Alert Provider argocd app sync diff wait get repo add cluster add flux bootstrap reconcile get suspend resume trace tree logs events", "gitopsSetups", "argoSignals", "fluxSourceSignals", "fluxReconcileSignals", "imageNotificationSignals", "workflowSignals", "safetySignals", "packageSignals", "GitOps", "gitops-readiness-card", "data-source-pattern=\"GitOps\"", "openTargetEntries", "gitops-readiness"]),
  check("Backup readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["BackupReadinessReportSchema", "BackupReadinessReport", "backupReadinessReport", "backup-readiness-report.json", "backup-readiness.md", "backup-readiness.html", "Backup readiness Velero Backup Schedule Restore BackupStorageLocation VolumeSnapshotLocation includedNamespaces excludedNamespaces ttl storageLocation snapshotVolumes defaultVolumesToFsBackup backup describe logs restore describe Litestream litestream.yml dbs path replicas s3 gcs azure snapshot interval retention replicate restore databases Restic RESTIC_REPOSITORY RESTIC_PASSWORD_FILE init backup snapshots restore forget prune check read-data tags exclude", "backupSetups", "veleroSignals", "litestreamSignals", "resticSignals", "restoreDrillSignals", "safetySignals", "packageSignals", "Backup", "backup-readiness-card", "data-source-pattern=\"Backup\"", "openTargetEntries", "backup-readiness"]),
  check("LLM eval readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["LlmEvalReadinessReportSchema", "LlmEvalReadinessReport", "llmEvalReadinessReport", "llm-eval-readiness-report.json", "llm-eval-readiness.md", "llm-eval-readiness.html", "LLM eval readiness promptfoo promptfooconfig providers prompts tests assert llm-rubric redteam plugins strategies OpenAI evals evals registry samples_jsonl modelgraded_spec completion_fns oaieval OpenEvals create_llm_as_judge createLLMAsJudge correctness hallucination feedbackKey score reference_outputs datasets reports", "evalSetups", "configSignals", "promptSignals", "providerSignals", "testCaseSignals", "judgeSignals", "datasetSignals", "redteamSignals", "workflowSignals", "packageSignals", "LLM Eval", "llm-eval-readiness-card", "data-source-pattern=\"LLM Eval\"", "openTargetEntries", "llm-eval-readiness"]),
  check("LLM observability readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["LlmObservabilityReadinessReportSchema", "LlmObservabilityReadinessReport", "llmObservabilityReadinessReport", "llm-observability-readiness-report.json", "llm-observability-readiness.md", "llm-observability-readiness.html", "LLM observability readiness Langfuse Phoenix Helicone LangChainTracer RunCollectorCallbackHandler LogStreamCallbackHandler EventStreamCallbackHandler RootListenersTracer BaseTracer isBaseTracer convertRunTreeToRun convertRunToRunTree _addRunToRunMap runMap runTreeMap usesRunTreeMap getRunById persistRun _endTrace _getExecutionOrder _createRunForLLMStart parent_run_id child_runs child_execution_order trace_id dotted_order _serialized_start_time convertToDottedOrderFormat consumeCallback awaitAllCallbacks getQueue createQueue PQueue autoStart concurrency awaitHandlers getGlobalAsyncLocalStorageInstance asyncLocalStorageInstance.run awaitPendingTraceBatches Promise.allSettled queue.onIdle RunTree traces spans observations generations sessions userId sessionId metadata release tags scores feedback annotations datasets experiments prompt versions playground OpenInference OpenTelemetry OTLP exporter token usage promptTokens completionTokens totalTokens cost latency model provider gateway baseURL Helicone headers rate limit retry fallback redaction telemetry opt-out ingestion queues ClickHouse S3 blob storage data retention OpenAPI SDK integrations annotation queues LLM-as-a-judge usage metering event replay safe URL SSRF IO size limit", "observabilitySetups", "traceSignals", "run-tree", "base-tracer-run", "run-map-lifecycle", "parent-child-run-order", "dotted-order", "stream-event", "run-log-patch", "instrumentationSignals", "callback-promise-queue", "langchain-tracer", "run-collector", "log-stream-handler", "event-stream-handler", "root-listener", "identitySignals", "llmMetricSignals", "feedbackSignals", "datasetExperimentSignals", "gatewaySignals", "privacySignals", "telemetry-boundary", "data-retention-enforcement", "ssrf-protection", "io-size-limit", "workflowSignals", "run-tree-map", "stream-filter", "callback-queue-drain", "callback-context-clear", "trace-batch-flush", "ingestion-queue", "event-replay", "clickhouse-storage", "blob-storage", "usage-metering", "openapi-spec", "sdk-integration", "annotation-queue", "llm-as-judge", "prompt-playground", "packageSignals", "@langchain/core", "langsmith", "openai-sdk", "litellm", "llamaindex", "LLM Observability", "llm-observability-readiness-card", "data-source-pattern=\"LLM Observability\"", "openTargetEntries", "llm-observability-readiness"]),
  check("Vector DB readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["VectorDbReadinessReportSchema", "VectorDbReadinessReport", "vectorDbReadinessReport", "vector-db-readiness-report.json", "vector-db-readiness.md", "vector-db-readiness.html", "Vector DB readiness Qdrant Weaviate Chroma LangChain VectorStore VectorStoreRetriever MemoryVectorStore FakeVectorStore FakeVectorStoreArgs EmbeddingsInterface Embeddings EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries MemoryVector memoryVectors _queryVectors filterFunction filteredMemoryVectors maximalMarginalRelevance queryEmbedding embeddingList mmrIndexes selectedEmbeddingsIndexes fromExistingIndex id DocumentInterface SyntheticEmbeddings similarityCalledCount custom similarity MMR similaritySearchWithScore addVectors addDocuments asRetriever RecordManagerInterface IndexingResult _HashedDocument HashedDocumentInterface CleanupMode IndexOptions sourceIdKey cleanupBatchSize forceUpdate _batch _deduplicateInOrder _getSourceIdAssigner _isBaseDocumentLoader indexStartDt timeAtLeast groupIds docsToIndex docsToUpdate seenDocs listKeys deleteKeys numAdded numDeleted numUpdated numSkipped UUIDV5_NAMESPACE hash_ contentHash metadataHash calculateHashes toDocument collections classes schema vector config embeddings vectorizer distance dimensions HNSW payload metadata filters StructuredQuery FilterDirective Comparison Operation Operators Comparators Visitor VisitorResult VisitorOperationResult VisitorComparisonResult VisitorStructuredQueryResult BaseTranslator BasicTranslator FunctionalTranslator FunctionFilter ValueType getAllowedComparatorsForType getComparatorFunction getOperatorFunction undefinedTrue TranslatorOpts allowedOperators allowedComparators visitOperation visitComparison visitStructuredQuery formatFunction mergeFilters isFilterEmpty castValue forceDefaultFilter mergeType hybrid search BM25 sparse vectors upsert add query search nearest neighbors score limit snapshots backup restore sharding replication tenancy ttl clients endpoints API keys persistence", "vectorSetups", "collectionSignals", "clientSignals", "ingestionSignals", "indexing-record-manager", "hashed-document", "indexing-batch", "indexing-deduplicate", "fake-vector-store", "querySignals", "structured-query", "comparison-filter", "operation-filter", "structured-query-visitor", "basic-translator", "functional-translator", "function-filter", "type-aware-comparators", "comparator-function", "operator-function", "functional-filter-merge", "filter-merge", "filter-value-cast", "fake-vector-search", "similarity-with-score", "mmr", "as-retriever", "memory-query-vectors", "mmr-index-selection", "similarity-sort", "embeddingSignals", "base-embeddings", "embeddings-params", "embedding-async-caller", "embed-documents", "embed-query", "custom-similarity-function", "fake-vector-embedding", "indexSignals", "indexing-hash", "source-id-key", "opsSignals", "saveable-vectorstore", "from-existing-index", "incremental-cleanup", "full-cleanup", "force-update", "record-manager-keys", "packageSignals", "@langchain/core", "langchain", "Vector DB", "vector-db-readiness-card", "data-source-pattern=\"Vector DB\"", "openTargetEntries", "vector-db-readiness"]),
  check("Search service readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["SearchServiceReadinessReportSchema", "SearchServiceReadinessReport", "searchServiceReadinessReport", "search-service-readiness-report.json", "search-service-readiness.md", "search-service-readiness.html", "Search service readiness Meilisearch Typesense OpenSearch indexes collections schema mappings fields primary key settings documents add import bulk upsert batch search q query_by filter_by sort_by facet_by ranking rules typo tolerance synonyms stop words distinct geosearch hybrid semantic highlight crop pagination tasks health dumps snapshots aliases replicas cluster analytics API keys hosts nodes", "searchSetups", "indexSignals", "ingestionSignals", "querySignals", "relevanceSignals", "clientSignals", "opsSignals", "packageSignals", "Search Service", "search-service-readiness-card", "data-source-pattern=\"Search Service\"", "openTargetEntries", "search-service-readiness"]),
  check("Object storage readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ObjectStorageReadinessReportSchema", "ObjectStorageReadinessReport", "objectStorageReadinessReport", "object-storage-readiness-report.json", "object-storage-readiness.md", "object-storage-readiness.html", "Object storage readiness S3 MinIO R2 Supabase Storage buckets regions endpoints path-style credentials PutObject GetObject ListObjects DeleteObject CopyObject multipart upload download metadata tags presigned URL signed URL policy ACL CORS RLS RBAC versioning lifecycle retention object lock replication checksum ETag SSE KMS encryption event notifications queues CDN cache health metrics backup restore migration", "storageSetups", "bucketSignals", "clientSignals", "objectSignals", "accessSignals", "reliabilitySignals", "securitySignals", "opsSignals", "packageSignals", "Object Storage", "object-storage-readiness-card", "data-source-pattern=\"Object Storage\"", "openTargetEntries", "object-storage-readiness"]),
  check("Realtime collaboration readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["RealtimeCollaborationReadinessReportSchema", "RealtimeCollaborationReadinessReport", "realtimeCollaborationReadinessReport", "realtime-collaboration-readiness-report.json", "realtime-collaboration-readiness.md", "realtime-collaboration-readiness.html", "Realtime collaboration readiness Yjs Y.Doc shared types WebsocketProvider awareness UndoManager encodeStateAsUpdate applyUpdate Automerge change merge sync save load conflicts heads patches Liveblocks LiveblocksProvider RoomProvider useOthers useMyPresence useMutation storage presence comments threads authEndpoint room permissions", "collaborationSetups", "crdtSignals", "providerSignals", "presenceSignals", "syncSignals", "persistenceSignals", "historySignals", "accessSignals", "packageSignals", "Realtime Collaboration", "realtime-collaboration-readiness-card", "data-source-pattern=\"Realtime Collaboration\"", "openTargetEntries", "realtime-collaboration-readiness"]),
  check("Workflow orchestration readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["WorkflowOrchestrationReadinessReportSchema", "WorkflowOrchestrationReadinessReport", "workflowOrchestrationReadinessReport", "workflow-orchestration-readiness-report.json", "workflow-orchestration-readiness.md", "workflow-orchestration-readiness.html", "Workflow orchestration readiness Temporal workflows activities Worker taskQueue schedules signals queries updates setHandler condition CancellationScope workflowInfo patched deprecatePatch ApplicationFailure ActivityFailure NativeConnection TestWorkflowEnvironment proxySinks interceptors @temporalio/activity @temporalio/common @temporalio/testing @temporalio/openai-agents continueAsNew Inngest createFunction events cron step.run step.sleep waitForEvent invoke cancelOn concurrency throttle debounce rate limit Trigger.dev task schemaTask schedules cron wait queue retry maxDuration idempotency metadata logger deploy runs LangGraph StateGraph START END addNode addEdge addConditionalEdges compile checkpointer MemorySaver Command resume graph.getState streamEvents", "workflowSetups", "triggerSignals", "signal", "query", "update", "graph-start", "thread-config", "executionSignals", "workflow-client", "workflow-handle", "update-handler", "state-graph", "graph-node", "tool-node", "compiled-graph", "durabilitySignals", "application-failure", "activity-failure", "cancellation-scope", "patching", "workflow-info", "heartbeat-details", "checkpointer", "memory-saver", "resume-command", "flowSignals", "condition", "signal-handler", "query-handler", "external-workflow", "graph-edge", "conditional-edge", "start-end", "tool-loop", "runtimeSignals", "native-connection", "test-environment", "workflow-bundle", "replay-worker", "graph-invoke", "stream-events", "observabilitySignals", "sinks", "interceptors", "activity-info", "graph-state", "packageSignals", "@temporalio/activity", "@temporalio/common", "@temporalio/testing", "@temporalio/openai-agents", "@langchain/langgraph", "@langchain/langgraph-checkpoint", "langchain", "Workflow Orchestration", "workflow-orchestration-readiness-card", "data-source-pattern=\"Workflow Orchestration\"", "openTargetEntries", "workflow-orchestration-readiness"]),
  check("OpenAPI client readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["OpenApiClientReadinessReportSchema", "OpenApiClientReadinessReport", "openApiClientReadinessReport", "openapi-client-readiness-report.json", "openapi-client-readiness.md", "openapi-client-readiness.html", "OpenAPI client readiness openapi-typescript openapi-fetch Hey API @hey-api/openapi-ts createClient plugins @hey-api/client-fetch @hey-api/client-axios @hey-api/client-ky @hey-api/client-next @hey-api/client-nuxt @hey-api/client-ofetch @hey-api/sdk @hey-api/schemas @hey-api/transformers Orval OpenAPI Generator input spec output schemas client hooks mocks MSW zod valibot arktype mutator interceptors auth axios fetch ky ofetch next nuxt react-query preact-query SWR Vue Query Svelte Query Solid Query Angular Query Pinia Colada Hono Fastify NestJS oRPC Effect native fetch MCP Vite plugin Nuxt module watch update-samples test:samples test:snapshots test:cli generatorName config validate lint generated diff typecheck templates", "clientSetups", "specSignals", "generatorSignals", "outputSignals", "runtimeSignals", "clientTargetSignals", "generationWorkflowSignals", "qualitySignals", "packageSignals", "OpenAPI Client", "openapi-client-readiness-card", "data-source-pattern=\"OpenAPI Client\"", "openTargetEntries", "openapi-client-readiness"]),
  check("Webhook readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["WebhookReadinessReportSchema", "WebhookReadinessReport", "webhookReadinessReport", "webhook-readiness-report.json", "webhook-readiness.md", "webhook-readiness.html", "Webhook readiness Svix Standard Webhooks Hookdeck signature webhook-id webhook-timestamp webhook-signature HMAC ed25519 verification msg_id.timestamp.payload signed content versioned signature multiple signatures base64 secret required headers payload schema thin full payload payload size replay idempotency event types endpoints retry attempts delivery logs replay fan-out filtering source destination source auth destination auth transformations rate limit healthcheck localhost CLI Event Gateway MCP tools failures metrics SSRF proxy retry-after legacy migration telemetry opt-out bookmarks profiles", "webhookSetups", "endpointSignals", "source-auth", "destination-auth", "transformation", "rate-limit", "healthcheck", "signatureSignals", "public-key", "private-key", "trust-list", "verificationSignals", "payload-size", "retry-after", "ssrf-protection", "legacy-migration", "api-gateway-verification", "reliabilitySignals", "retry-count", "pause-connection", "exhausted-event", "queue-depth", "operationsSignals", "event-gateway", "mcp-tools", "local-forward", "config-profile", "bookmark", "telemetry-opt-out", "packageSignals", "standard-webhooks-spec", "hookdeck-gateway", "Webhook", "webhook-readiness-card", "data-source-pattern=\"Webhook\"", "openTargetEntries", "webhook-readiness"]),
  check("notification readiness", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["NotificationReadinessReportSchema", "NotificationReadinessReport", "notificationReadinessReport", "notification-readiness-report.json", "notification-readiness.md", "notification-readiness.html", "Notification readiness Novu workflows trigger subscriberId subscribers topics subscriptions preferences Inbox email SMS push chat Slack Teams Telegram WhatsApp digest delay conditions payload tenant templates variables API key delivery logs retries dashboard analytics", "notificationSetups", "workflowSignals", "audienceSignals", "channelSignals", "templateSignals", "operationsSignals", "packageSignals", "Notification", "notification-readiness-card", "data-source-pattern=\"Notifications\"", "openTargetEntries", "notification-readiness"]),
  check("consent readiness", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ConsentReadinessReportSchema", "ConsentReadinessReport", "consentReadinessReport", "consent-readiness-report.json", "consent-readiness.md", "consent-readiness.html", "Consent readiness CookieConsent Klaro IAB TCF CMP banner modal categories services purposes vendors accept all accept selected reject all withdraw privacy policy data-src text/plain data-type data-name autoclear cookies localStorage revision translations __tcfapi TCString cmpId GVL purposeConsents vendorConsents legitimateInterests", "consentSetups", "bannerSignals", "categorySignals", "scriptSignals", "privacySignals", "tcfSignals", "packageSignals", "Consent", "consent-readiness-card", "data-source-pattern=\"Consent\"", "openTargetEntries", "consent-readiness"]),
  check("privacy readiness", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["PrivacyReadinessReportSchema", "PrivacyReadinessReport", "privacyReadinessReport", "privacy-readiness-report.json", "privacy-readiness.md", "privacy-readiness.html", "Privacy readiness Presidio OpenDP scrubadub PII analyzer anonymizer recognizer detector redaction masking encryption allow-list deny-list privacy budget epsilon delta retention deletion consent DSAR CI", "privacySetups", "piiDetectionSignals", "redactionSignals", "policySignals", "differentialPrivacySignals", "configSignals", "ciSignals", "packageSignals", "AnalyzerEngine", "OperatorConfig", "privacy-readiness-card", "data-source-pattern=\"Privacy\"", "openTargetEntries", "privacy-readiness"]),
  check("source-backed component graph", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts"
  ], ["ComponentGraphReportSchema", "component-graph-report.json", "component-graph.md", "component-graph.html", "component-graph.mmd", "mermaid", "component-graph-download-toolbar", "data-download-mermaid", "component-graph-mermaid", "component-node-relations", "data-node-relation", "연결 관계", "component-node-anchor", "data-node-id", "data-node-link", "componentNodeAnchor", "data-graph-filter", "data-node-type", "nodeTypeCounts", "topConnectedNodes"]),
  check("incremental re-analysis", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/incremental.ts",
    "packages/core/src/sessions.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts"
  ], ["SourceSnapshotReportSchema", "IncrementalReportSchema", "source-snapshot-report.json", "incremental-report.json", "incremental.md", "incremental.html", "baselineSessionId", "coverageDelta"]),
  check("codex sdk boundary", [
    "packages/codex/src/index.ts",
    "apps/desktop-tauri/src/App.tsx"
  ], ["@openai/codex-sdk", "StructuredRunner", "run("], { forbidden: ["apps/desktop-tauri/src/App.tsx:@openai/codex-sdk"] }),
  check("codex auth delegation", [
    "README.md",
    "docs/security/SECURITY_POLICY.md",
    "packages/codex/src/index.ts"
  ], ["Sign in with ChatGPT", "does not collect or store ChatGPT credentials", "Codex authentication belongs to the local Codex CLI", "@openai/codex-sdk", "usage limits"]),
  check("codex sdk default study path", [
    "README.md",
    "apps/cli/src/index.ts",
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "docs/security/SECURITY_POLICY.md",
    "skills/repo-tutor/SKILL.md",
    ".agents/skills/repo-tutor/SKILL.md"
  ], ["Codex SDK is the default AI study engine", "codexSdkDefault", "--no-codex", "enableCodex: parsed.flags[\"no-codex\"] !== true", "enableCodex: request.params.enableCodex !== false", "Codex SDK 필수 AI 엔진", "Codex SDK assistance is the default AI study path"]),
  check("desktop design contract", [
    "DESIGN.md",
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src/styles.css"
  ], ["RepoTutor Studio Korean Source-Learning Workbench", "Pretendard", "source-learning cockpit", "mission-brief", "mission-metrics", "ai-contract-strip", "학습 타깃", "Codex SDK", "CLI/스킬 동일 엔진", "디자인 계약"]),
  check("security sqlite and cli-anything", [
    "AGENTS.md",
    "docs/security/SECURITY_POLICY.md",
    "adapters/cli-anything/src/index.ts",
    "packages/core/src/storage.ts",
    ".gitignore"
  ], ["arbitrary", "secret", "DatabaseSync", "CLI-Anything is optional", ".env"])
];

const baseChecks = checks.map((fn) => fn());
const results = [];
for (let i = 1; i <= iterations; i += 1) {
  const run = {
    iteration: i,
    createdAt: new Date().toISOString(),
    checks: cloneAuditChecks(baseChecks),
  };
  run.ok = run.checks.every((item) => item.ok);
  results.push(run);
  const base = `compliance-audit-${String(i).padStart(2, "0")}`;
  fs.writeFileSync(path.join(auditDir, `${base}.json`), `${JSON.stringify(run, null, 2)}\n`);
  fs.writeFileSync(path.join(auditDir, `${base}.md`), renderMarkdown(run));
}

const summary = {
  createdAt: new Date().toISOString(),
  iterations,
  allPassed: results.every((run) => run.ok),
  reports: results.map((run) => `${auditDirRelative}/compliance-audit-${String(run.iteration).padStart(2, "0")}.md`)
};
fs.writeFileSync(path.join(auditDir, "compliance-audit-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.allPassed ? 0 : 1);

function check(name, files, requiredStrings = [], options = {}) {
  return () => {
    const missingFiles = files.filter((file) => !fs.existsSync(path.join(root, file)));
    const missingStrings = [];
    for (const token of requiredStrings) {
      const scopedMatch = token.match(/^([^:\n]+):(.*)$/s);
      const maybeFile = scopedMatch?.[1] ?? null;
      const isScopedFile = maybeFile !== null && fs.existsSync(path.join(root, maybeFile));
      const maybeNeedle = isScopedFile ? scopedMatch?.[2] ?? "" : token;
      const targets = isScopedFile ? [maybeFile] : files;
      const found = targets.some((file) => {
        const text = readFileTextIfExists(file);
        return text !== null && text.includes(maybeNeedle);
      });
      if (!found) missingStrings.push(token);
    }
    const forbiddenHits = [];
    for (const token of options.forbidden ?? []) {
      const [file, needle] = token.split(/:(.*)/s).filter(Boolean);
      const text = readFileTextIfExists(file);
      if (text !== null && text.includes(needle)) forbiddenHits.push(token);
    }
    return {
      name,
      ok: missingFiles.length === 0 && missingStrings.length === 0 && forbiddenHits.length === 0,
      missingFiles,
      missingStrings,
      forbiddenHits
    };
  };
}

function cloneAuditChecks(items) {
  return items.map((item) => ({
    ...item,
    missingFiles: [...item.missingFiles],
    missingStrings: [...item.missingStrings],
    forbiddenHits: [...item.forbiddenHits]
  }));
}

function readFileTextIfExists(file) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) return null;
  if (!fileTextCache.has(filePath)) {
    const text = fs.readFileSync(filePath, "utf8");
    if (file === "packages/core/src/scanner.ts") {
      const implementationPath = path.join(root, "packages/core/src/scanner/index.ts");
      const implementationText = fs.existsSync(implementationPath)
        ? fs.readFileSync(implementationPath, "utf8")
        : "";
      fileTextCache.set(filePath, `${text}\n${implementationText}`);
    } else if (file === "apps/desktop-tauri/src-tauri/src/lib.rs") {
      const moduleText = [
        "apps/desktop-tauri/src-tauri/src/commands.rs",
        "apps/desktop-tauri/src-tauri/src/models.rs",
        "apps/desktop-tauri/src-tauri/src/runtime.rs",
        "apps/desktop-tauri/src-tauri/src/sidecar.rs"
      ]
        .map((moduleFile) => path.join(root, moduleFile))
        .filter((modulePath) => fs.existsSync(modulePath))
        .map((modulePath) => fs.readFileSync(modulePath, "utf8"))
        .join("\n");
      fileTextCache.set(filePath, `${text}\n${moduleText}`);
    } else if (file === "apps/desktop-tauri/src/App.tsx") {
      const moduleText = [
        "apps/desktop-tauri/src/types.ts",
        "apps/desktop-tauri/src/report-targets.ts"
      ]
        .map((moduleFile) => path.join(root, moduleFile))
        .filter((modulePath) => fs.existsSync(modulePath))
        .map((modulePath) => fs.readFileSync(modulePath, "utf8"))
        .join("\n");
      fileTextCache.set(filePath, `${text}\n${moduleText}`);
    } else {
      fileTextCache.set(filePath, text);
    }
  }
  return fileTextCache.get(filePath);
}

function renderMarkdown(run) {
  return `# Compliance Audit ${run.iteration}\n\nCreated: ${run.createdAt}\n\nStatus: ${run.ok ? "PASS" : "FAIL"}\n\n${run.checks.map((item) => `## ${item.ok ? "PASS" : "FAIL"} - ${item.name}\n\n- missing files: ${item.missingFiles.join(", ") || "none"}\n- missing strings: ${item.missingStrings.join(", ") || "none"}\n- forbidden hits: ${item.forbiddenHits.join(", ") || "none"}\n`).join("\n")}`;
}

function readFlag(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}
