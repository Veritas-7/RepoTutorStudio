#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const iterations = Number(readFlag("--iterations") ?? "13");
const auditDir = path.join(root, "docs", "audits");
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
  check("shared core engine", [
    "packages/core/src/pipeline.ts",
    "packages/core/src/evidence.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/storage.ts",
    "packages/shared/src/schemas.ts"
  ], ["packages/core/src/pipeline.ts:runStudy", "packages/shared/src/schemas.ts:StudySessionSchema"]),
  check("headless cli commands", [
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts"
], ["study", "studyMarkdown", "RepoTutor Study", "study supports --format", "CLI_COMMANDS", "injectDefaultStudyCommand", "isStudyTargetCandidate", "defaultStudyCommand", "Default study command", "<github-url-or-path>", "runtimeOptions", "studiesRootFlag", "Runtime Options", "--studies-root <dir>", "runtimeHealth", "doctorRuntimeHealth", "pathAccess", "studiesRootParentWritable", "Runtime Health", "quiz", "quizAttemptMarkdown", "RepoTutor Quiz Attempt", "quiz supports --format", "resume", "resumeMarkdown", "RepoTutor Resume", "Study mode", "Learner level", "htmlTargetStatus", "HTML Target Status", "readableFileExists", "present", "missing", "evidence", "export", "exportSummaryMarkdown", "RepoTutor Export", "--summary-format json|markdown", "export supports --summary-format", "verify-export", "exportVerificationMarkdown", "RepoTutor Export Verification", "verify-export supports --format", "verify-evidence", "evidenceVerificationMarkdown", "RepoTutor Evidence Verification", "verify-evidence supports --format", "verify-session", "verifyEvidenceIndexReport", "verifyStudySessionArtifacts", "verificationOk", "verificationStatus", "verificationReport", "verificationMarkdown", "verificationHtml", "verificationCheckedRequiredArtifacts", "checkedRequiredArtifacts", "htmlTargets", "htmlTargetsComplete", "missingHtmlTargets", "htmlTargetsFlag", "--html-targets complete|missing|all", "list supports --html-targets", "openTargetPaths", "openTargetPathsMarkdown", "RepoTutor Open Target Paths", "open --target all supports --format", "html-export-failed", "evidence-index-failed", "sessionVerificationSummary", "sessionVerificationMarkdown", "RepoTutor Session Verification", "process.exitCode", "verify-list-output", "verifyListOutput", "verifyListOutputManifest", "ListOutputVerification", "listOutputVerificationMarkdown", "RepoTutor List Output Verification", "verify-list-output supports --format json or markdown", "--manifest", "--report", "emitVerifyListOutputReport", "verifyListOutputReportPath", ".verification.json", ".verification.md", "report must be a non-empty string", "manifest-read-failed", "bytes-mismatch", "sha256-mismatch", "rows-mismatch", "fields-mismatch", "actualRows", "actualFields", "Actual rows", "Actual fields", "listOutputRowCount", "listOutputFields", "fieldListKey", "output-format-parse-failed", "unsupported-schema-version", "supportedSchemaVersion", "Supported schema version", "LIST_OUTPUT_MANIFEST_SCHEMA_VERSION", "list", "ListSummary", "ListFilterManifest", "listFilterManifest", "ListOutputContext", "ListOutputManifest", "schemaVersion", "Schema version", "listSummary", "listSummaryMarkdown", "countBy", "countMarkdown", "RepoTutor Session Summary", "list --summary supports --format", "list cannot combine --summary with --fields or --field-preset", "emitListOutput", "createListOutputManifest", "outputManifestPath", "jsonText", "--output", "--output-manifest", "output", "outputManifest", "manifestPath", "createHash", "sha256", "bytes", "fs.writeFile", "list requires --output when --output-manifest is used", "output-manifest must be a non-empty manifest path", "LIST_FIELDS", "LIST_FIELD_PRESETS", "LIST_FIELD_PRESET_NAMES", "listFieldsFlag", "listFieldPresetFlag", "listFieldSelection", "projectListRows", "listMarkdown", "listFieldsMarkdown", "listJsonl", "listCsv", "listFieldDisplayValue", "listFieldCsvValue", "csvCell", "--summary", "--fields", "--field-preset", "field-preset must be one of", "list supports --field-preset", "list cannot combine --fields and --field-preset", "comma-separated list", "list supports --fields", "RepoTutor Sessions", "Session Path", "list supports --format json, markdown, jsonl, or csv", "learnerLevel", "Level", "--verified-only", "--wrong-only", "wrongOnly", "--unattempted-only", "unattemptedOnly", "scored-only", "--scored-only", "scoredOnly", "--min-score", "--max-score", "optionalScoreFlag", "number from 0 to 100", "validateListFilterCombinations", "filterConflictValidation", "list cannot combine --unattempted-only", "min-score must be less than or equal to max-score", "--created-from", "--created-to", "optionalCreatedAtBoundFlag", "validateCreatedAtRange", "created-from must be less than or equal to created-to", "createdRangeValidation", "--limit", "optionalPositiveIntegerFlag", "positive integer", "--mode quick|standard|deep|all", "studyModeFlag", "list supports --mode", "--level beginner|junior|senior|all", "learnerLevelFlag", "list supports --level", "--status passed|failed|missing|all", "verificationStatusFlag", "list supports --status", "--repo", "optionalStringFlag", "repoMatches", "non-empty string", "--sort newest|oldest|score-desc|score-asc", "score-desc", "score-asc", "listSortFlag", "sortSessionRows", "list supports --sort", "open", "--target verification|evidence|suggested-reads|runtime-environment|interface-map|symbol-map|api-reference|search-index|learning-journal|project-activity|code-metrics-readiness|code-ownership-readiness|large-asset-readiness|license-rights|sbom|security-readiness|sast-readiness|dast-readiness|threat-model-readiness|scorecard|provenance|advisories|vex|policy-gates|api-contracts|consumer-contract-readiness|observability|performance|profiling-readiness|tracing-readiness|debug-readiness|crash-reporting-readiness|incident-response-readiness|slo-readiness|cost-readiness|progressive-delivery-readiness|load-testing-readiness|benchmark-readiness|e2e|flaky-test-readiness|test-impact-readiness|test-reporting-readiness|snapshot-readiness|property-based-testing-readiness|fuzz-readiness|test-data-readiness|integration-test-environment-readiness|chaos-engineering-readiness|accessibility|storybook|design-tokens|i18n|release-readiness|secret-readiness|secret-management-readiness|container-readiness|container-scan-readiness|code-quality|documentation|database-readiness|database-migration-readiness|database-orm-readiness|data-transformation-readiness|data-quality-readiness|data-lineage-readiness|data-catalog-readiness|data-annotation-readiness|lakehouse-table-readiness|feature-store-readiness|model-registry-readiness|experiment-tracking-readiness|model-monitoring-readiness|model-serving-readiness|model-training-readiness|ci-cd|unit-tests|coverage-readiness|mutation-testing-readiness|typecheck-readiness|package-manager|git-hooks|task-runner|dependency-updates|dependency-review-readiness|lint-readiness|format-readiness|commit-conventions|changelog-readiness|bundle-analysis|mocking-readiness|data-fetching-readiness|routing-readiness|state-management-readiness|form-readiness|auth-readiness|authorization-readiness|payment-readiness|email-readiness|queue-readiness|event-stream-readiness|data-connector-readiness|semantic-layer-readiness|bi-dashboard-readiness|schema-registry-readiness|stream-processing-readiness|pipeline-orchestration-readiness|service-mesh-readiness|ingress-controller-readiness|dns-readiness|certificate-readiness|helm-readiness|admission-policy-readiness|api-gateway-readiness|cache-readiness|logging-readiness|feature-flag-readiness|rate-limit-readiness|error-tracking-readiness|analytics-readiness|http-client-readiness|schema-validation-readiness|datetime-readiness|id-generation-readiness|image-processing-readiness|file-upload-readiness|websocket-readiness|realtime-media-readiness|pdf-generation-readiness|spreadsheet-readiness|chart-visualization-readiness|markdown-code-rendering-readiness|notebook-readiness|map-visualization-readiness|diagram-rendering-readiness|link-integrity-readiness|seo-metadata-readiness|pwa-readiness|browser-compat-readiness|browser-extension-readiness|env-validation-readiness|security-headers-readiness|graphql-readiness|cli-readiness|terminal-ui-readiness|state-machine-readiness|animation-readiness|drag-and-drop-readiness|rich-text-editor-readiness|command-palette-readiness|guided-tour-readiness|data-table-readiness|calendar-readiness|dialog-readiness|popover-tooltip-readiness|menu-dropdown-readiness|toast-snackbar-readiness|tabs-accordion-readiness|checkbox-radio-switch-readiness|slider-progress-readiness|select-combobox-readiness|toolbar-toggle-readiness|scroll-area-readiness|avatar-readiness|pin-input-readiness|pagination-readiness|number-input-readiness|rating-group-readiness|color-picker-readiness|splitter-readiness|tags-input-readiness|clipboard-readiness|qr-code-readiness|timer-readiness|steps-readiness|carousel-readiness|tree-view-readiness|collapsible-readiness|editable-readiness|password-input-readiness|signature-pad-readiness|angle-slider-readiness|cascade-select-readiness|async-list-readiness|image-cropper-readiness|listbox-readiness|date-picker-readiness|marquee-readiness|toc-readiness|floating-panel-readiness|drawer-readiness|hover-card-readiness|navigation-menu-readiness|presence-readiness|menu-readiness|tooltip-readiness|llm-readiness|llm-eval-readiness|llm-observability-readiness|vector-db-readiness|search-service-readiness|object-storage-readiness|realtime-collaboration-readiness|workflow-orchestration-readiness|openapi-client-readiness|webhook-readiness|notification-readiness|consent-readiness|privacy-readiness|server-framework-readiness|rpc-readiness|workspace-graph-readiness|scaffolding-readiness|scheduler-readiness|build-tool-readiness|styling-readiness|visual-regression-readiness|infrastructure-readiness|iac-drift-readiness|deployment-readiness|serverless-readiness|mobile-readiness|desktop-readiness|edge-readiness|compose-readiness|devcontainer-readiness|kubernetes-readiness|gitops-readiness|backup-readiness|context-pack|mcp-handoff|agent-memory|graph-query|tutorial-abstractions|decision-records|dependency-health|learning-path|quiz|quiz-print|all", "suggested-reads", "runtime-environment", "interface-map", "symbol-map", "api-reference", "search-index", "learning-journal", "project-activity", "code-metrics-readiness", "code-ownership-readiness", "large-asset-readiness", "license-rights", "sbom", "security-readiness", "scorecard", "provenance", "advisories", "vex", "policy-gates", "consumer-contract-readiness", "observability", "performance", "profiling-readiness", "tracing-readiness", "debug-readiness", "crash-reporting-readiness", "incident-response-readiness", "slo-readiness", "cost-readiness", "progressive-delivery-readiness", "load-testing-readiness", "benchmark-readiness", "e2e", "flaky-test-readiness", "test-impact-readiness", "test-reporting-readiness", "snapshot-readiness", "property-based-testing-readiness", "fuzz-readiness", "test-data-readiness", "integration-test-environment-readiness", "chaos-engineering-readiness", "accessibility", "storybook", "design-tokens", "i18n", "release-readiness", "secret-readiness", "secret-management-readiness", "container-readiness", "container-scan-readiness", "code-quality", "documentation", "database-readiness", "database-migration-readiness", "data-quality-readiness", "data-lineage-readiness", "data-catalog-readiness", "data-annotation-readiness", "lakehouse-table-readiness", "feature-store-readiness", "model-registry-readiness", "experiment-tracking-readiness", "model-monitoring-readiness", "model-serving-readiness", "model-training-readiness", "ci-cd", "unit-tests", "coverage-readiness", "mutation-testing-readiness", "typecheck-readiness", "package-manager", "git-hooks", "task-runner", "dependency-updates", "lint-readiness", "format-readiness", "commit-conventions", "changelog-readiness", "bundle-analysis", "mocking-readiness", "data-fetching-readiness", "routing-readiness", "state-management-readiness", "form-readiness", "auth-readiness", "authorization-readiness", "payment-readiness", "email-readiness", "queue-readiness", "event-stream-readiness", "data-connector-readiness", "schema-registry-readiness", "stream-processing-readiness", "pipeline-orchestration-readiness", "service-mesh-readiness", "ingress-controller-readiness", "dns-readiness", "certificate-readiness", "cache-readiness", "logging-readiness", "feature-flag-readiness", "rate-limit-readiness", "error-tracking-readiness", "analytics-readiness", "http-client-readiness", "schema-validation-readiness", "datetime-readiness", "id-generation-readiness", "image-processing-readiness", "file-upload-readiness", "websocket-readiness", "realtime-media-readiness", "pdf-generation-readiness", "spreadsheet-readiness", "chart-visualization-readiness", "notebook-readiness", "map-visualization-readiness", "diagram-rendering-readiness", "link-integrity-readiness", "seo-metadata-readiness", "pwa-readiness", "browser-compat-readiness", "browser-extension-readiness", "env-validation-readiness", "security-headers-readiness", "graphql-readiness", "cli-readiness", "animation-readiness", "drag-and-drop-readiness", "rich-text-editor-readiness", "llm-readiness", "llm-eval-readiness", "llm-observability-readiness", "vector-db-readiness", "search-service-readiness", "object-storage-readiness", "realtime-collaboration-readiness", "workflow-orchestration-readiness", "openapi-client-readiness", "webhook-readiness", "notification-readiness", "consent-readiness", "privacy-readiness", "server-framework-readiness", "rpc-readiness", "workspace-graph-readiness", "scaffolding-readiness", "scheduler-readiness", "build-tool-readiness", "styling-readiness", "visual-regression-readiness", "infrastructure-readiness", "deployment-readiness", "serverless-readiness", "mobile-readiness", "desktop-readiness", "edge-readiness", "compose-readiness", "devcontainer-readiness", "kubernetes-readiness", "gitops-readiness", "context-pack", "mcp-handoff", "agent-memory", "graph-query", "tutorial-abstractions", "decision-records", "dependency-health", "learning-path", "quiz-print", "target === \"all\"", "--list-targets", "openTargetsMarkdown", "RepoTutor Open Targets", "open --list-targets supports --format", "openTargetEntries", "openTargetFile", "assertReadableFile", "Open target file not found", "Unsupported open target", "doctor", "doctorMarkdown", "RepoTutor Doctor", "doctor supports --format", "commands", "formats", "runtime", "studiesRoot", "envStudiesRoot", "verifyExport", "verifyEvidence", "exportSummary", "listFilters", "openTargets", "openAll", "filteredKind", "filteredFile", "--file", "--format json|markdown", "evidenceMarkdown", "returnedItems"]),
  check("codex skill mode", [
    "skills/repo-tutor/SKILL.md",
    ".agents/skills/repo-tutor/SKILL.md",
    "skills/repo-tutor/scripts/repo-tutor-study.sh"
  ], ["repo-tutor study", "repo-tutor quiz", "Do not execute arbitrary project commands"]),
  check("tauri standalone mode", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/tauri.conf.json"
  ], ["study_source", "REPOTUTOR_SIDECAR", "Node sidecar"]),
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
  ], ["PurposeReport", "FolderLesson", "FileLesson", "FlowReport", "RebuildRoadmap", "EvidenceIndexReport", "evidence-index-report.json", "session-verification-report.json", "session-verification.md", "session-verification.html", "renderSessionVerificationMarkdown", "verifyEvidenceIndexReport", "checkedLessonLinks", "missing-lesson-anchor", "sourceEvidence", "source-evidence", "source-link", "../source/", "원본 열기", "evidence.md", "evidence.html", "evidence-index-cards", "evidence-kind-toolbar", "data-evidence-kind-filter", "소스 근거", "evidenceBackedFiles", "evidenceCoverageRatio", "evidenceKindCounts", "filesWithoutEvidence", "소스 근거 종류", "context-pack-report.json", "context-pack.md", "context-pack.html", "ContextPackReportSchema", "contextPackReport", "Repomix token counting git-aware ignore AI-friendly context pack", "splitPlans", "Split Output Plan", "google-ai-studio-1mb", "mcp-handoff-report.json", "mcp-handoff.md", "mcp-handoff.html", "McpHandoffReportSchema", "mcpHandoffReport", "Codebase MCP getCodebase getRemoteCodebase saveCodebase tool handoff", "agent-memory-report.json", "agent-memory.md", "agent-memory.html", "AgentMemoryReportSchema", "agentMemoryReport", "Claude Code Obsidian Graphify persistent memory token-saving context navigation", "graph-query-report.json", "graph-query.md", "graph-query.html", "GraphQueryReportSchema", "graphQueryReport", "Graphify query path explain graph traversal command guide", "tutorial-abstraction-report.json", "tutorial-abstractions.md", "tutorial-abstractions.html", "TutorialAbstractionReportSchema", "tutorialAbstractionReport", "PocketFlow codebase tutorial identify abstractions analyze relationships order chapters", "decision-record-report.json", "decision-records.md", "decision-records.html", "DecisionRecordReportSchema", "decisionRecordReport", "Log4brains ADR docs-as-code status context decision consequences timeline package-specific records", "dependency-health-report.json", "dependency-health.md", "dependency-health.html", "DependencyHealthReportSchema", "dependencyHealthReport", "dependency-cruiser no-circular no-orphans forbidden rules dependency graph validation", "localDependencyEdges", "cycles", "orphanModules", "ruleViolations"]),
  check("quiz engine", [
    "packages/core/src/quiz.ts",
    "packages/shared/src/constants.ts"
  ], ["calculateQuizCount", "quick", "standard", "deep", "choices"]),
  check("wrong notes persistence", [
    "packages/core/src/quiz.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts"
  ], ["wrong-notes.json", "wrong-notes.md", "wrong-notes.html", "mistakeReason"]),
  check("offline html export", [
    "packages/html/src/templates.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/quiz.ts",
    "packages/core/src/exporter.ts",
    "packages/core/src/session-verifier.ts",
    "apps/cli/src/index.ts",
    "packages/shared/src/schemas.ts"
  ], ["index.html", "learning-path.html", "learning-path-step", "data-learning-primary", "기본 투어", "id=\"learning-step-${index + 1}\"", "learning-step-nav", "href=\"#learning-step-${index + 2}\"", "다음 단계", "이전 단계", "data-learning-step", "data-learning-step-complete", "data-reset-learning-progress", "data-learning-progress-summary", "learningProgress.clear()", "updateLearningProgressSummary", "진도 초기화", "완료 0 /", "학습 완료", "suggested-reads-report.json", "suggested-reads.md", "suggested-reads.html", "SuggestedReadsReportSchema", "suggestedReadsReport", "Repo Baby suggested_reads", "suggested-read-card", "추천 읽기", "data-source-pattern=\"Repo Baby\"", "runtime-environment-report.json", "runtime-environment.md", "runtime-environment.html", "RuntimeEnvironmentReportSchema", "runtimeEnvironmentReport", "docSmith Dockerfile and Docker Compose generation prompts", "runtime-env-card", "실행 환경", "data-source-pattern=\"docSmith\"", "interface-map-report.json", "interface-map.md", "interface-map.html", "InterfaceMapReportSchema", "interfaceMapReport", "repomap page routes GraphQL REST data flow analysis", "interface-map-card", "interface-source-link", "인터페이스 맵", "data-source-pattern=\"repomap\"", "symbol-map-report.json", "symbol-map.md", "symbol-map.html", "SymbolMapReportSchema", "symbolMapReport", "codebase-map AST-based functions classes constants index", "symbol-map-card", "symbol-source-link", "심볼 맵", "data-source-pattern=\"codebase-map\"", "api-reference-report.json", "api-reference.md", "api-reference.html", "ApiReferenceReportSchema", "apiReferenceReport", "API Reference", "api-reference-card", "api-reference-source-link", "data-source-pattern=\"TypeDoc\"", "TypeDoc entry points reflections ReflectionKind public API documentation export validation", "entryPoints", "publicSymbols", "exportWarnings", "ReflectionKind", "context-pack-report.json", "context-pack.md", "context-pack.html", "ContextPackReportSchema", "contextPackReport", "Repomix token counting git-aware ignore AI-friendly context pack", "context-pack-card", "context-pack-source-link", "Context Pack", "Split Output Plan", "google-ai-studio-1mb", "data-source-pattern=\"Repomix\"", "mcp-handoff-report.json", "mcp-handoff.md", "mcp-handoff.html", "McpHandoffReportSchema", "mcpHandoffReport", "MCP Handoff", "mcp-handoff-card", "data-source-pattern=\"codebase-mcp\"", "getCodebase", "getRemoteCodebase", "saveCodebase", "agent-memory-report.json", "agent-memory.md", "agent-memory.html", "AgentMemoryReportSchema", "agentMemoryReport", "Agent Memory", "agent-memory-card", "data-source-pattern=\"Obsidian Graphify\"", "project-context", "tokenSavings", "memoryNotes", "graph-query-report.json", "graph-query.md", "graph-query.html", "GraphQueryReportSchema", "graphQueryReport", "Graph Query", "graph-query-card", "data-source-pattern=\"Graphify\"", "graphify query", "graphify path", "graphify explain", "pathPrompts", "nodeExplanations", "tutorial-abstraction-report.json", "tutorial-abstractions.md", "tutorial-abstractions.html", "TutorialAbstractionReportSchema", "tutorialAbstractionReport", "Tutorial Abstractions", "tutorial-abstraction-card", "data-source-pattern=\"PocketFlow\"", "PocketFlow codebase tutorial identify abstractions analyze relationships order chapters", "chapterOrder", "relationships", "decision-record-report.json", "decision-records.md", "decision-records.html", "DecisionRecordReportSchema", "decisionRecordReport", "Decision Records", "decision-record-card", "data-source-pattern=\"Log4brains\"", "Log4brains ADR docs-as-code status context decision consequences timeline package-specific records", "dependency-health-report.json", "dependency-health.md", "dependency-health.html", "DependencyHealthReportSchema", "dependencyHealthReport", "dependency-cruiser no-circular no-orphans forbidden rules dependency graph validation", "localDependencyEdges", "cycles", "orphanModules", "ruleViolations", "Dependency Health", "dependency-health-card", "data-source-pattern=\"dependency-cruiser\"", "no-circular", "no-orphans", "statusCounts", "packageScopes", "Positive Consequences", "packages/html/src/templates.ts:repotutor:learning-path", "learningProgress", "localStorage", "data-source-pattern=\"CodeTour\"", "assets/learning-path.tour.json", "learningPathTourJson", "RepoTutor Learning Path", "isPrimary", "quiz.html", "quiz-print.html", "print-answer-key", "정답지", "quiz-reset-toolbar", "data-reset-quiz", "복습 초기화", "picked.clear()", "quiz-section-toolbar", "data-quiz-section-filter", "data-quiz-difficulty-filter", "data-quiz-section", "data-quiz-difficulty", "wrong-notes.html", "evidence.html", "session-verification.html", "assets/style.css", "assets/app.js", "assets/component-graph.mmd", "manifest.json", "EXPORT-README.md", "entrypoints", "writeHtmlZipBundle", "verifyHtmlExportManifest", "verifyStudySessionArtifacts", "integrityOk", "integrityCheckedFiles", "--format html|zip", "--summary-format json|markdown", "html-report.zip", "file-nav-toolbar", "data-file-ext-filter", "data-file-dir-filter", "data-source-evidence-filter", "data-source-evidence", "data-evidence-kind-filter", "@media print", "print-color-adjust", "Use browser print preview", "integrity", "sha256", "bytes"]),
  check("static search index report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["SearchIndexReportSchema", "SearchIndexReport", "searchIndexReport", "search-index-report.json", "search-index.md", "search-index.html", "assets/search-index.json", "Pagefind PageFragmentData MetaIndex filters meta_fields static low-bandwidth search index", "PageFragmentData", "MetaIndex", "filterIndex", "metadataFields", "search-index-card", "data-source-pattern=\"Pagefind\"", "openTargetEntries", "search-index"]),
  check("active recall learning journal", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["LearningJournalReportSchema", "LearningJournalReport", "learningJournalReport", "learning-journal-report.json", "learning-journal.md", "learning-journal.html", "assets/learning-journal-template.md", "learn-codebase Socratic tutor active recall prediction before revelation persistent learning journal", "focusGoals", "masteryLevels", "openQuestions", "spacedReviewQueue", "socraticPrompts", "journalTemplateMarkdown", "learning-journal-card", "data-source-pattern=\"learn-codebase\"", "openTargetEntries", "learning-journal"]),
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
  ], ["CodeMetricsReadinessReportSchema", "CodeMetricsReadinessReport", "codeMetricsReadinessReport", "code-metrics-readiness-report.json", "code-metrics-readiness.md", "code-metrics-readiness.html", "scc lizard tokei cloc radon cyclomatic complexity code lines comments blanks hotspots COCOMO LOCOMO JSON CSV HTML OpenMetrics thresholds", "languageMetrics", "hotspots", "toolSignals", "metricSignals", "workflowSignals", "complexityDensity", "scc --by-file --wide --format json .", "code-metrics-readiness-card", "data-source-pattern=\"scc\"", "openTargetEntries", "code-metrics-readiness"]),
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
  ], ["SloReadinessReportSchema", "SloReadinessReport", "sloReadinessReport", "slo-readiness-report.json", "slo-readiness.md", "slo-readiness.html", "SLO readiness OpenSLO Sloth Pyrra service level objective SLI error budget burn rate Prometheus recording rules", "sloSetups", "specSignals", "indicatorSignals", "objectiveSignals", "alertSignals", "ruleSignals", "governanceSignals", "workflowSignals", "packageSignals", "RepoTutor records static SLO readiness only", "slo-readiness-card", "data-source-pattern=\"SLO\"", "openTargetEntries", "slo-readiness"]),
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
  ], ["E2eReportSchema", "E2eReport", "e2eReport", "e2e-report.json", "e2e.md", "e2e.html", "Playwright browser E2E tests config projects locators assertions traces screenshots video reporters CI webServer", "testSuites", "browserProjects", "locatorSignals", "assertions", "artifacts", "runtimeTargets", "npx playwright test", "e2e-card", "data-source-pattern=\"Playwright\"", "openTargetEntries", "e2e"]),
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
  ], ["StorybookReportSchema", "StorybookReport", "storybookReport", "storybook-report.json", "storybook.md", "storybook.html", "Storybook Component Story Format stories args argTypes decorators play functions autodocs addons test-runner Chromatic component workshop", "storyFiles", "configFiles", "storyAnnotations", "addonSignals", "testSignals", "publishSignals", "npx storybook@latest init", "storybook-card", "data-source-pattern=\"Storybook\"", "openTargetEntries", "storybook"]),
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
  ], ["I18nReportSchema", "I18nReport", "i18nReport", "i18n-report.json", "i18n.md", "i18n.html", "FormatJS React Intl ICU messages extract compile verify IntlProvider polyfills locale data ESLint TMS", "messageSources", "localeAssets", "runtimeSignals", "extractionSignals", "icuSignals", "qaSignals", "formatjs extract", "i18n-card", "data-source-pattern=\"FormatJS\"", "openTargetEntries", "i18n"]),
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
  ], ["DocumentationReportSchema", "DocumentationReport", "documentationReport", "documentation-report.json", "documentation.md", "documentation.html", "Docusaurus docs blog pages sidebars docusaurus.config themeConfig navbar footer i18n versioning search build deploy", "siteConfigs", "contentSurfaces", "navigationSignals", "qualitySignals", "localizationSignals", "releaseSignals", "npm run build", "documentation-card", "data-source-pattern=\"Docusaurus\"", "openTargetEntries", "documentation"]),
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
  ], ["DataLineageReadinessReportSchema", "DataLineageReadinessReport", "dataLineageReadinessReport", "data-lineage-readiness-report.json", "data-lineage-readiness.md", "data-lineage-readiness.html", "Data lineage readiness OpenLineage Marquez dbt", "lineageSetups", "eventSignals", "identitySignals", "datasetSignals", "dbtArtifactSignals", "storageSignals", "ciSignals", "packageSignals", "RunEvent", "lineage_events", "manifest.json", "data-lineage-readiness-card", "data-source-pattern=\"DataLineage\"", "openTargetEntries", "data-lineage-readiness"]),
  check("data catalog readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataCatalogReadinessReportSchema", "DataCatalogReadinessReport", "dataCatalogReadinessReport", "data-catalog-readiness-report.json", "data-catalog-readiness.md", "data-catalog-readiness.html", "Data catalog readiness OpenMetadata DataHub Amundsen", "catalogSetups", "ingestionSignals", "entitySignals", "governanceSignals", "searchSignals", "lineageSignals", "ciSignals", "packageSignals", "IngestionPipeline", "MetadataChangeProposal", "GlossaryTerm", "data-catalog-readiness-card", "data-source-pattern=\"DataCatalog\"", "openTargetEntries", "data-catalog-readiness"]),
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
  ], ["GitHooksReportSchema", "GitHooksReport", "gitHooksReport", "git-hooks-report.json", "git-hooks.md", "git-hooks.html", "Husky .husky hook files prepare core.hooksPath pre-commit pre-push commit-msg HUSKY=0 no-verify lint-staged POSIX shell", "hookFiles", "installSignals", "commandSignals", "policySignals", "toolConfigFiles", "git config --get core.hooksPath", "git-hooks-card", "data-source-pattern=\"Husky\"", "openTargetEntries", "git-hooks"]),
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
  ], ["MockingReadinessReportSchema", "MockingReadinessReport", "mockingReadinessReport", "mocking-readiness-report.json", "mocking-readiness.md", "mocking-readiness.html", "Mock Service Worker setupWorker setupServer http graphql ws HttpResponse handlers onUnhandledRequest resetHandlers passthrough bypass", "handlerFiles", "serverSetups", "protocolSignals", "lifecycleSignals", "packageSignals", "npx msw init public/ --save", "mocking-readiness-card", "data-source-pattern=\"Mock Service Worker\"", "openTargetEntries", "mocking-readiness"]),
  check("data fetching readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DataFetchingReadinessReportSchema", "DataFetchingReadinessReport", "dataFetchingReadinessReport", "data-fetching-readiness-report.json", "data-fetching-readiness.md", "data-fetching-readiness.html", "TanStack Query QueryClient QueryClientProvider useQuery useMutation queryKey queryFn invalidateQueries staleTime gcTime hydrate persist devtools", "clientSetups", "queryUsages", "cacheSignals", "dataFlowSignals", "packageSignals", "packages/core/src/scanner.ts:npx eslint . --rule '@tanstack/query/stable-query-client:error'", "data-fetching-card", "data-source-pattern=\"TanStack Query\"", "openTargetEntries", "data-fetching-readiness"]),
  check("routing readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["RoutingReadinessReportSchema", "RoutingReadinessReport", "routingReadinessReport", "routing-readiness-report.json", "routing-readiness.md", "routing-readiness.html", "React Router BrowserRouter createBrowserRouter RouterProvider routes.ts route index Link NavLink Outlet loader action ErrorBoundary useNavigate useParams useSearchParams", "routingSetups", "routeDefinitions", "navigationSignals", "dataRouteSignals", "fileRouteSignals", "packageSignals", "npx react-router typegen", "routing-readiness-card", "data-source-pattern=\"React Router\"", "openTargetEntries", "routing-readiness"]),
  check("state management readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["StateManagementReadinessReportSchema", "StateManagementReadinessReport", "stateManagementReadinessReport", "state-management-readiness-report.json", "state-management-readiness.md", "state-management-readiness.html", "Redux Toolkit configureStore createSlice reducers actions selectors Provider useSelector useDispatch createAsyncThunk createListenerMiddleware createEntityAdapter middleware devTools RTK Query", "storeSetups", "sliceDefinitions", "selectorSignals", "sideEffectSignals", "entitySignals", "middlewareSignals", "rtkQuerySignals", "packageSignals", "npx vitest run", "state-management-card", "data-source-pattern=\"Redux Toolkit\"", "openTargetEntries", "state-management-readiness"]),
  check("form readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["FormReadinessReportSchema", "FormReadinessReport", "formReadinessReport", "form-readiness-report.json", "form-readiness.md", "form-readiness.html", "React Hook Form useForm register handleSubmit Controller FormProvider useFormContext useFieldArray resolver errors defaultValues watch reset validation", "formSetups", "fieldRegistrations", "validationSignals", "errorSignals", "valueFlowSignals", "packageSignals", "npx vitest run", "form-readiness-card", "data-source-pattern=\"React Hook Form\"", "openTargetEntries", "form-readiness"]),
  check("auth readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["AuthReadinessReportSchema", "AuthReadinessReport", "authReadinessReport", "auth-readiness-report.json", "auth-readiness.md", "auth-readiness.html", "Auth.js NextAuth auth handlers providers callbacks session jwt middleware protected routes env secrets adapter signIn signOut useSession SessionProvider", "authSetups", "sessionSurfaces", "protectionSignals", "providerSignals", "callbackSignals", "credentialSignals", "packageSignals", "npx vitest run", "auth-readiness-card", "data-source-pattern=\"Auth.js\"", "openTargetEntries", "auth-readiness"]),
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
  ], ["EmailReadinessReportSchema", "EmailReadinessReport", "emailReadinessReport", "email-readiness-report.json", "email-readiness.md", "email-readiness.html", "Resend new Resend emails.send batch.send domains verify webhooks verify standardwebhooks from to subject html react attachments replyTo RESEND_API_KEY idempotency", "emailSetups", "recipientSignals", "deliverySignals", "templateSignals", "credentialSignals", "packageSignals", "npx vitest run", "email-readiness-card", "data-source-pattern=\"Resend\"", "openTargetEntries", "email-readiness"]),
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
  ], ["EventStreamReadinessReportSchema", "EventStreamReadinessReport", "eventStreamReadinessReport", "event-stream-readiness-report.json", "event-stream-readiness.md", "event-stream-readiness.html", "Event stream readiness Apache Kafka Redpanda Apache Pulsar KafkaProducer KafkaConsumer AdminClient NewTopic consumer group offset commit rebalance schema registry DLQ retention compaction idempotence transactions ACL SASL PulsarClient SubscriptionType BookKeeper tenant namespace CI", "eventStreamSetups", "platformSignals", "brokerSignals", "topicSignals", "producerSignals", "consumerSignals", "schemaSignals", "reliabilitySignals", "securitySignals", "opsSignals", "ciSignals", "packageSignals", "event-stream-readiness-card", "data-source-pattern=\"EventStream\"", "openTargetEntries", "event-stream-readiness"]),
  check("data connector readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["DataConnectorReadinessReportSchema", "DataConnectorReadinessReport", "dataConnectorReadinessReport", "data-connector-readiness-report.json", "data-connector-readiness.md", "data-connector-readiness.html", "Data connector readiness Debezium Kafka Connect Airbyte SourceConnector SinkConnector connector.class tasks.max plugin.path transforms predicates offset.storage.topic status.storage.topic CDC snapshot schema history sync catalog state", "connectorSetups", "platformSignals", "connectorKindSignals", "configSignals", "stateSignals", "transformSignals", "opsSignals", "workflowSignals", "packageSignals", "RepoTutor records data connector readiness only", "data-connector-readiness-card", "data-source-pattern=\"DataConnector\"", "openTargetEntries", "data-connector-readiness"]),
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
  ], ["PipelineOrchestrationReadinessReportSchema", "PipelineOrchestrationReadinessReport", "pipelineOrchestrationReadinessReport", "pipeline-orchestration-readiness-report.json", "pipeline-orchestration-readiness.md", "pipeline-orchestration-readiness.html", "Pipeline orchestration readiness Apache Airflow Dagster Prefect DAG dag task flow asset sensor schedule backfill catchup partition retry SLA XCom executor worker deployment run history CI", "pipelineOrchestrationSetups", "orchestratorSignals", "dagSignals", "taskSignals", "dependencySignals", "scheduleSignals", "sensorSignals", "assetSignals", "partitionSignals", "reliabilitySignals", "executorSignals", "deploymentSignals", "observabilitySignals", "ciSignals", "packageSignals", "Inventory Airflow DAG entrypoints", "pipeline-orchestration-readiness-card", "data-source-pattern=\"PipelineOrchestration\"", "openTargetEntries", "pipeline-orchestration-readiness"]),
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
  ], ["LoggingReadinessReportSchema", "LoggingReadinessReport", "loggingReadinessReport", "logging-readiness-report.json", "logging-readiness.md", "logging-readiness.html", "Pino pino logger.info logger.error child logger level transport destination redact serializers pino-pretty multistream timestamp formatters mixin bindings", "loggingSetups", "levelSignals", "contextSignals", "safetySignals", "transportSignals", "packageSignals", "npx vitest run", "logging-readiness-card", "data-source-pattern=\"Pino\"", "openTargetEntries", "logging-readiness"]),
  check("feature flag readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["FeatureFlagReadinessReportSchema", "FeatureFlagReadinessReport", "featureFlagReadinessReport", "feature-flag-readiness-report.json", "feature-flag-readiness.md", "feature-flag-readiness.html", "OpenFeature setProviderAndWait setProvider getClient getBooleanValue getStringValue getNumberValue getObjectValue getBooleanDetails EvaluationContext targetingKey hooks events tracking shutdown MultiProvider", "featureFlagSetups", "evaluationSignals", "contextSignals", "lifecycleSignals", "packageSignals", "npx vitest run", "feature-flag-readiness-card", "data-source-pattern=\"OpenFeature\"", "openTargetEntries", "feature-flag-readiness"]),
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
  ], ["SchemaValidationReadinessReportSchema", "SchemaValidationReadinessReport", "schemaValidationReadinessReport", "schema-validation-readiness-report.json", "schema-validation-readiness.md", "schema-validation-readiness.html", "z.object z.array z.union z.discriminatedUnion parse safeParse parseAsync safeParseAsync z.infer z.input z.output refine superRefine transform preprocess coerce ZodError flatten treeifyError toJSONSchema", "schemaSetups", "shapeSignals", "parserSignals", "typeSignals", "refinementSignals", "errorSignals", "integrationSignals", "packageSignals", "npx vitest run", "schema-validation-readiness-card", "data-source-pattern=\"Zod\"", "openTargetEntries", "schema-validation-readiness"]),
  check("datetime readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["DateTimeReadinessReportSchema", "DateTimeReadinessReport", "dateTimeReadinessReport", "datetime-readiness-report.json", "datetime-readiness.md", "datetime-readiness.html", "DateTime Duration Interval Zone setZone fromISO fromFormat fromJSDate toISO toFormat toLocaleString diff plus minus startOf endOf isValid invalidReason Settings defaultZone", "dateTimeSetups", "constructionSignals", "parsingSignals", "formattingSignals", "zoneSignals", "durationSignals", "validitySignals", "packageSignals", "npx vitest run", "datetime-readiness-card", "data-source-pattern=\"Luxon\"", "openTargetEntries", "datetime-readiness"]),
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
  ], ["RealtimeMediaReadinessReportSchema", "RealtimeMediaReadinessReport", "realtimeMediaReadinessReport", "realtime-media-readiness-report.json", "realtime-media-readiness.md", "realtime-media-readiness.html", "Realtime media readiness WebRTC LiveKit Room mediasoup WebRtcTransport PeerJS getUserMedia MediaStream Track publish subscribe ICE DTLS data channel E2EE", "mediaSetups", "platformSignals", "roomSignals", "deviceSignals", "trackSignals", "transportSignals", "dataChannelSignals", "qualitySignals", "securitySignals", "workflowSignals", "packageSignals", "RepoTutor records realtime media readiness only", "realtime-media-readiness-card", "data-source-pattern=\"Realtime Media\"", "openTargetEntries", "realtime-media-readiness"]),
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
  ], ["MapVisualizationReadinessReportSchema", "MapVisualizationReadinessReport", "mapVisualizationReadinessReport", "map-visualization-readiness-report.json", "map-visualization-readiness.md", "map-visualization-readiness.html", "Map visualization readiness MapLibre maplibregl Leaflet L.map deck.gl Deck MapView tileLayer addLayer addSource GeoJSON marker popup viewport bounds controls tokens", "mapSetups", "platformSignals", "containerSignals", "tileSignals", "layerSignals", "dataSignals", "viewportSignals", "interactionSignals", "controlSignals", "styleSignals", "workflowSignals", "packageSignals", "RepoTutor records map visualization readiness only", "map-visualization-readiness-card", "data-source-pattern=\"Map Visualization\"", "openTargetEntries", "map-visualization-readiness"]),
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
  ], ["EnvValidationReadinessReportSchema", "EnvValidationReadinessReport", "envValidationReadinessReport", "env-validation-readiness-report.json", "env-validation-readiness.md", "env-validation-readiness.html", "t3-env createEnv server client shared runtimeEnv runtimeEnvStrict clientPrefix Standard Schema process.env import.meta.env emptyStringAsUndefined skipValidation", "envSetups", "schemaSignals", "runtimeSignals", "boundarySignals", "validationSignals", "documentationSignals", "packageSignals", "pnpm build", "env-validation-readiness-card", "data-source-pattern=\"t3-env\"", "openTargetEntries", "env-validation-readiness"]),
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
  ], ["GraphqlReadinessReportSchema", "GraphqlReadinessReport", "graphqlReadinessReport", "graphql-readiness-report.json", "graphql-readiness.md", "graphql-readiness.html", "GraphQL.js GraphQLSchema GraphQLObjectType buildSchema parse validate execute subscribe introspection typed documents resolvers", "graphqlSetups", "schemaSignals", "operationSignals", "resolverSignals", "validationSignals", "executionSignals", "clientSignals", "codegenSignals", "TypedDocumentNode", "graphql-readiness-card", "data-source-pattern=\"GraphQL.js\"", "openTargetEntries", "graphql-readiness"]),
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
  ], ["RichTextEditorReadinessReportSchema", "RichTextEditorReadinessReport", "richTextEditorReadinessReport", "rich-text-editor-readiness-report.json", "rich-text-editor-readiness.md", "rich-text-editor-readiness.html", "Rich text editor readiness Tiptap useEditor EditorContent ProseMirror EditorState EditorView LexicalComposer RichTextPlugin ContentEditable commands keyboard tests", "richTextEditorSetups", "frameworkSignals", "schemaSignals", "renderSignals", "commandSignals", "stateSignals", "extensionSignals", "collaborationSignals", "accessibilitySignals", "testSignals", "packageSignals", "RepoTutor records rich text editor readiness only", "rich-text-editor-readiness-card", "data-source-pattern=\"Rich Text Editor\"", "openTargetEntries", "rich-text-editor-readiness"]),
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
  ], ["CalendarReadinessReportSchema", "CalendarReadinessReport", "calendarReadinessReport", "calendar-readiness-report.json", "calendar-readiness.md", "calendar-readiness.html", "Calendar readiness FullCalendar react-big-calendar React DayPicker events views selection navigation localization resources drag drop date ranges accessibility tests", "calendarSetups", "frameworkSignals", "viewSignals", "eventSignals", "selectionSignals", "navigationSignals", "localizationSignals", "resourceSignals", "dragDropSignals", "rangeConstraintSignals", "accessibilitySignals", "testSignals", "packageSignals", "RepoTutor records calendar readiness only", "calendar-readiness-card", "data-source-pattern=\"Calendar\"", "openTargetEntries", "calendar-readiness"]),
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
  ], ["LlmReadinessReportSchema", "LlmReadinessReport", "llmReadinessReport", "llm-readiness-report.json", "llm-readiness.md", "llm-readiness.html", "LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig AgentRunStream GraphRunStream streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys", "llmSetups", "modelSignals", "init-chat-model", "model-provider-config", "model-provider-inference", "provider-prefix", "configurable-model", "configurable-fields", "config-prefix", "base-chat-model", "chat-model-call-options", "chat-model-stream-v2", "chat-model-generation", "chat-model-cache", "base-cache-interface", "in-memory-cache", "cache-key-encoder", "cache-generation-serialization", "cache-chat-generation-message", "global-cache-map", "chat-model-callbacks", "model-output-version", "model-token-usage-output", "llm-result-generations", "generation-info", "generation-chunk-concat", "chat-generation-chunk", "chat-result-output", "run-key-metadata", "model-profile", "model-context-window", "model-multimodal-inputs", "model-tool-message-inputs", "model-output-modalities", "model-reasoning-output", "model-tool-capabilities", "model-structured-output-profile", "fake-built-model", "fake-model-builder", "fake-model-response-queue", "fake-model-call-capture", "promptSignals", "few-shot", "few-shot-template", "example-selector", "length-based-example-selector", "semantic-similarity-example-selector", "example-prompt", "example-separator", "partial-variables", "template-format", "mustache-template", "f-string-template", "template-parser", "template-renderer", "template-validation", "invalid-prompt-input", "message-content-template", "message-content-block", "data-content-block", "provider-content-converter", "openai-data-block", "openai-response-block", "anthropic-content-block", "content-block-merge", "openrouter-reasoning-block", "groq-reasoning-block", "ollama-reasoning-block", "deepseek-reasoning-block", "xai-reasoning-block", "google-thinking-block", "bedrock-converse-block", "bedrock-citation-block", "message-prompt-template", "chat-message-prompt-template", "role-message-prompt-template", "image-prompt-template", "image-prompt-input", "image-prompt-value", "image-content-fields", "image-url-template", "image-prompt-partial", "placeholder-coercion", "message-constructor-coercion", "message-like-coercion", "message-buffer-string", "stored-message-v1-map", "stored-message-chat-map", "chat-message-storage-map", "chat-prompt-validation", "image-prompt-parsing", "chat-prompt-flattening", "pipeline-prompt-template", "pipeline-prompts", "pipeline-final-prompt", "pipeline-input-computation", "pipeline-format-prompts", "pipeline-partial", "structured-prompt", "structured-prompt-schema", "structured-prompt-method", "structured-prompt-pipe", "structured-prompt-factory", "dict-prompt-template", "dict-prompt-template-format", "dict-input-variables", "dict-template-render", "dict-nested-template", "base-prompt-template", "base-prompt-input", "base-string-prompt-template", "prompt-value-formatting", "prompt-serialization", "prompt-partial-merge", "dynamic-system-prompt", "summary-prompt", "runnableSignals", "Runnable Signals", "RunnableLambda", "RunnablePassthrough", "RunnableMap", "RunnableWithMessageHistory", "message-history-store", "message-history-config", "message-history-keys", "message-history-insert", "message-history-persist", "message-history-input-coercion", "message-history-output-coercion", "message-history-enter-exit", "message-history-session-attach", "message-history-dedupe", "message-filter", "message-run-merge", "message-trim", "message-chunk-conversion", "response-metadata-merge", "usage-metadata-merge", "runnable-config", "config-ensure", "config-merge", "config-patch", "config-pick-keys", "base-store", "in-memory-store", "store-mget", "store-mset", "store-mdelete", "store-yield-keys", "runnable-callback-manager-config", "async-local-config", "recursion-limit", "config-timeout-signal", "configurable-runtime", "runnable-branch", "branch-condition", "branch-default", "runnable-binding", "config-factory", "runnable-each", "runnable-retry", "retry-attempt-handler", "runnable-with-fallbacks", "runnable-assign", "runnable-pick", "map-key-callback", "runnable-stream-log", "runnable-stream-events", "runnable-coercion", "pipe-chain", "with-retry", "with-fallbacks", "toolSignals", "agent-middleware", "middleware-state-schema", "middleware-context-schema", "wrap-model-call", "wrap-tool-call", "hitl-interrupt", "hitl-review-config", "headless-tool", "headless-tool-overload", "headless-tool-implementation", "headless-tool-interrupt", "headless-tool-metadata", "summarization-middleware", "context-editing", "context-clear-tool-uses", "llm-tool-selector", "ai-message-tool-calls", "fake-model-tool-calls", "tool-call-parser", "tool-call-chunk", "tool-message-artifact", "tool-message-status", "tool-response-format", "tool-return-type", "tool-content-artifact-format", "direct-tool-output", "tool-output-formatting", "tool-runnable-config", "dynamic-tool-wrapper", "dynamic-structured-tool", "tool-input-parsing-exception", "tool-callback-lifecycle", "tool-wrapper-runtime-config", "tool-wrapper-abort-signal", "openai-function-conversion", "openai-tool-conversion", "tool-strict-schema", "tool-json-schema-conversion", "tool-json-schema-cache", "tool-schema-type-guards", "server-tool-call-block", "mcp-load-tools", "mcp-tool-hooks", "mcp-structured-content", "mcp-output-handling", "@langchain/mcp-adapters", "@modelcontextprotocol/sdk", "retrievalSignals", "retriever-tool", "retriever-tool-schema", "retriever-callback-child", "retriever-document-format", "base-retriever", "retriever-run-config", "retriever-start-event", "retriever-end-event", "retriever-error-event", "fake-retriever", "document-transformer", "mapping-document-transformer", "transform-documents", "document-compressor", "compress-documents", "base-document-loader", "structuredOutputSignals", "response-format", "structured-response", "fake-model-structured-response", "tool-strategy", "provider-strategy", "typed-tool-strategy", "transform-response-format", "response-format-undefined", "json-schema-support", "structured-output-errors", "tool-strategy-options", "base-output-parser", "transform-output-parser", "cumulative-output-parser", "json-output-parser", "string-output-parser", "bytes-output-parser", "list-output-parser", "xml-output-parser", "standard-schema-output-parser", "openai-functions-parser", "openai-tools-parser", "content-parser-factory", "function-calling-parser-factory", "structured-output-pipeline", "include-raw-output", "raw-parsed-output", "parser-fallback", "parser-assign", "streamingSignals", "agent-run-stream", "chat-model-stream", "text-content-stream", "tool-calls-substream", "reasoning-content-stream", "usage-metadata-stream", "replay-buffer", "content-delta-assembly", "stream-output-message", "tool-block-standardization", "stream-transformer", "stream-channel", "stream-mode", "tool-call-stream", "tool-call-stream-projection", "tool-call-output-normalization", "headless-tool-stream-interrupt", "tool-call-pending-map", "tool-call-stream-finalize", "content-block-stream", "legacy-chat-generation-bridge", "stream-event-conversion", "stream-active-blocks", "stream-image-tool-output", "stream-audio-payload", "stream-abort-signal", "stream-usage-start", "base-callback-handler", "callback-manager-config", "callback-run-manager", "custom-event-dispatch", "event-stream-callback", "log-stream-callback", "run-collector-tracer", "root-listener-tracer", "safetySignals", "model-retry", "tool-retry", "human-in-the-loop", "pii-detection", "pii-redaction", "pii-mask", "pii-hash", "pii-block", "openai-moderation", "moderation-jump", "prompt-caching", "model-call-limit", "tool-call-limit", "serialized-load-trust-boundary", "serialized-constructor-load", "serialized-secret-map", "serialized-import-map", "serialized-escape-marker", "serialized-depth-limit", "packageSignals", "LangChain.js", "llm-readiness-card", "data-source-pattern=\"LangChain.js\"", "openTargetEntries", "llm-readiness"]),
  check("Server framework readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["ServerFrameworkReadinessReportSchema", "ServerFrameworkReadinessReport", "serverFrameworkReadinessReport", "server-framework-readiness-report.json", "server-framework-readiness.md", "server-framework-readiness.html", "Fastify fastify route get post schema register plugin addHook decorate setErrorHandler listen inject logger", "serverSetups", "routeSignals", "schemaSignals", "pluginSignals", "lifecycleSignals", "runtimeSignals", "errorSignals", "testSignals", "packageSignals", "Fastify", "server-framework-readiness-card", "data-source-pattern=\"Fastify\"", "openTargetEntries", "server-framework-readiness"]),
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
  ], ["LlmObservabilityReadinessReportSchema", "LlmObservabilityReadinessReport", "llmObservabilityReadinessReport", "llm-observability-readiness-report.json", "llm-observability-readiness.md", "llm-observability-readiness.html", "LLM observability readiness Langfuse Phoenix Helicone LangChainTracer RunCollectorCallbackHandler LogStreamCallbackHandler EventStreamCallbackHandler RootListenersTracer RunTree traces spans observations generations sessions userId sessionId metadata release tags scores feedback annotations datasets experiments prompt versions playground OpenInference OpenTelemetry OTLP exporter token usage promptTokens completionTokens totalTokens cost latency model provider gateway baseURL Helicone headers rate limit retry fallback redaction telemetry opt-out", "observabilitySetups", "traceSignals", "run-tree", "dotted-order", "stream-event", "run-log-patch", "instrumentationSignals", "langchain-tracer", "run-collector", "log-stream-handler", "event-stream-handler", "root-listener", "identitySignals", "llmMetricSignals", "feedbackSignals", "datasetExperimentSignals", "gatewaySignals", "privacySignals", "workflowSignals", "run-tree-map", "stream-filter", "packageSignals", "@langchain/core", "langsmith", "LLM Observability", "llm-observability-readiness-card", "data-source-pattern=\"LLM Observability\"", "openTargetEntries", "llm-observability-readiness"]),
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
  ], ["WorkflowOrchestrationReadinessReportSchema", "WorkflowOrchestrationReadinessReport", "workflowOrchestrationReadinessReport", "workflow-orchestration-readiness-report.json", "workflow-orchestration-readiness.md", "workflow-orchestration-readiness.html", "Workflow orchestration readiness Temporal workflows activities Worker taskQueue schedules signals queries retry timeout heartbeat continueAsNew Inngest createFunction events cron step.run step.sleep waitForEvent invoke cancelOn concurrency throttle debounce rate limit Trigger.dev task schemaTask schedules cron wait queue retry maxDuration idempotency metadata logger deploy runs LangGraph StateGraph START END addNode addEdge addConditionalEdges compile checkpointer MemorySaver Command resume graph.getState streamEvents", "workflowSetups", "triggerSignals", "graph-start", "thread-config", "executionSignals", "state-graph", "graph-node", "tool-node", "compiled-graph", "durabilitySignals", "checkpointer", "memory-saver", "resume-command", "flowSignals", "graph-edge", "conditional-edge", "start-end", "tool-loop", "runtimeSignals", "graph-invoke", "stream-events", "observabilitySignals", "graph-state", "packageSignals", "@langchain/langgraph", "@langchain/langgraph-checkpoint", "langchain", "Workflow Orchestration", "workflow-orchestration-readiness-card", "data-source-pattern=\"Workflow Orchestration\"", "openTargetEntries", "workflow-orchestration-readiness"]),
  check("OpenAPI client readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["OpenApiClientReadinessReportSchema", "OpenApiClientReadinessReport", "openApiClientReadinessReport", "openapi-client-readiness-report.json", "openapi-client-readiness.md", "openapi-client-readiness.html", "OpenAPI client readiness openapi-typescript openapi-fetch Orval OpenAPI Generator input spec output schemas client hooks mocks MSW zod mutator axios fetch react-query SWR Angular Vue Svelte Hono MCP generatorName config validate lint snapshots generated diff typecheck templates", "clientSetups", "specSignals", "generatorSignals", "outputSignals", "runtimeSignals", "qualitySignals", "packageSignals", "OpenAPI Client", "openapi-client-readiness-card", "data-source-pattern=\"OpenAPI Client\"", "openTargetEntries", "openapi-client-readiness"]),
  check("Webhook readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["WebhookReadinessReportSchema", "WebhookReadinessReport", "webhookReadinessReport", "webhook-readiness-report.json", "webhook-readiness.md", "webhook-readiness.html", "Webhook readiness Svix Standard Webhooks Hookdeck signature webhook-id webhook-timestamp webhook-signature HMAC ed25519 replay idempotency event types endpoints retry attempts delivery logs replay fan-out filtering source destination localhost CLI MCP failures metrics SSRF", "webhookSetups", "endpointSignals", "signatureSignals", "reliabilitySignals", "operationsSignals", "packageSignals", "Webhook", "webhook-readiness-card", "data-source-pattern=\"Webhook\"", "openTargetEntries", "webhook-readiness"]),
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
  check("security sqlite and cli-anything", [
    "AGENTS.md",
    "docs/security/SECURITY_POLICY.md",
    "adapters/cli-anything/src/index.ts",
    "packages/core/src/storage.ts",
    ".gitignore"
  ], ["arbitrary", "secret", "DatabaseSync", "CLI-Anything is optional", ".env"])
];

const results = [];
for (let i = 1; i <= iterations; i += 1) {
  const run = {
    iteration: i,
    createdAt: new Date().toISOString(),
    checks: checks.map((fn) => fn()),
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
  reports: results.map((run) => `docs/audits/compliance-audit-${String(run.iteration).padStart(2, "0")}.md`)
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

function readFileTextIfExists(file) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) return null;
  if (!fileTextCache.has(filePath)) {
    fileTextCache.set(filePath, fs.readFileSync(filePath, "utf8"));
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
