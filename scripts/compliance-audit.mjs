#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const iterations = Number(readFlag("--iterations") ?? "13");
const auditDir = path.join(root, "docs", "audits");
fs.mkdirSync(auditDir, { recursive: true });

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
], ["study", "studyMarkdown", "RepoTutor Study", "study supports --format", "CLI_COMMANDS", "injectDefaultStudyCommand", "isStudyTargetCandidate", "defaultStudyCommand", "Default study command", "<github-url-or-path>", "runtimeOptions", "studiesRootFlag", "Runtime Options", "--studies-root <dir>", "runtimeHealth", "doctorRuntimeHealth", "pathAccess", "studiesRootParentWritable", "Runtime Health", "quiz", "quizAttemptMarkdown", "RepoTutor Quiz Attempt", "quiz supports --format", "resume", "resumeMarkdown", "RepoTutor Resume", "Study mode", "Learner level", "htmlTargetStatus", "HTML Target Status", "readableFileExists", "present", "missing", "evidence", "export", "exportSummaryMarkdown", "RepoTutor Export", "--summary-format json|markdown", "export supports --summary-format", "verify-export", "exportVerificationMarkdown", "RepoTutor Export Verification", "verify-export supports --format", "verify-evidence", "evidenceVerificationMarkdown", "RepoTutor Evidence Verification", "verify-evidence supports --format", "verify-session", "verifyEvidenceIndexReport", "verifyStudySessionArtifacts", "verificationOk", "verificationStatus", "verificationReport", "verificationMarkdown", "verificationHtml", "verificationCheckedRequiredArtifacts", "checkedRequiredArtifacts", "htmlTargets", "htmlTargetsComplete", "missingHtmlTargets", "htmlTargetsFlag", "--html-targets complete|missing|all", "list supports --html-targets", "openTargetPaths", "openTargetPathsMarkdown", "RepoTutor Open Target Paths", "open --target all supports --format", "html-export-failed", "evidence-index-failed", "sessionVerificationSummary", "sessionVerificationMarkdown", "RepoTutor Session Verification", "process.exitCode", "verify-list-output", "verifyListOutput", "verifyListOutputManifest", "ListOutputVerification", "listOutputVerificationMarkdown", "RepoTutor List Output Verification", "verify-list-output supports --format json or markdown", "--manifest", "--report", "emitVerifyListOutputReport", "verifyListOutputReportPath", ".verification.json", ".verification.md", "report must be a non-empty string", "manifest-read-failed", "bytes-mismatch", "sha256-mismatch", "rows-mismatch", "fields-mismatch", "actualRows", "actualFields", "Actual rows", "Actual fields", "listOutputRowCount", "listOutputFields", "fieldListKey", "output-format-parse-failed", "unsupported-schema-version", "supportedSchemaVersion", "Supported schema version", "LIST_OUTPUT_MANIFEST_SCHEMA_VERSION", "list", "ListSummary", "ListFilterManifest", "listFilterManifest", "ListOutputContext", "ListOutputManifest", "schemaVersion", "Schema version", "listSummary", "listSummaryMarkdown", "countBy", "countMarkdown", "RepoTutor Session Summary", "list --summary supports --format", "list cannot combine --summary with --fields or --field-preset", "emitListOutput", "createListOutputManifest", "outputManifestPath", "jsonText", "--output", "--output-manifest", "output", "outputManifest", "manifestPath", "createHash", "sha256", "bytes", "fs.writeFile", "list requires --output when --output-manifest is used", "output-manifest must be a non-empty manifest path", "LIST_FIELDS", "LIST_FIELD_PRESETS", "LIST_FIELD_PRESET_NAMES", "listFieldsFlag", "listFieldPresetFlag", "listFieldSelection", "projectListRows", "listMarkdown", "listFieldsMarkdown", "listJsonl", "listCsv", "listFieldDisplayValue", "listFieldCsvValue", "csvCell", "--summary", "--fields", "--field-preset", "field-preset must be one of", "list supports --field-preset", "list cannot combine --fields and --field-preset", "comma-separated list", "list supports --fields", "RepoTutor Sessions", "Session Path", "list supports --format json, markdown, jsonl, or csv", "learnerLevel", "Level", "--verified-only", "--wrong-only", "wrongOnly", "--unattempted-only", "unattemptedOnly", "scored-only", "--scored-only", "scoredOnly", "--min-score", "--max-score", "optionalScoreFlag", "number from 0 to 100", "validateListFilterCombinations", "filterConflictValidation", "list cannot combine --unattempted-only", "min-score must be less than or equal to max-score", "--created-from", "--created-to", "optionalCreatedAtBoundFlag", "validateCreatedAtRange", "created-from must be less than or equal to created-to", "createdRangeValidation", "--limit", "optionalPositiveIntegerFlag", "positive integer", "--mode quick|standard|deep|all", "studyModeFlag", "list supports --mode", "--level beginner|junior|senior|all", "learnerLevelFlag", "list supports --level", "--status passed|failed|missing|all", "verificationStatusFlag", "list supports --status", "--repo", "optionalStringFlag", "repoMatches", "non-empty string", "--sort newest|oldest|score-desc|score-asc", "score-desc", "score-asc", "listSortFlag", "sortSessionRows", "list supports --sort", "open", "--target verification|evidence|suggested-reads|runtime-environment|interface-map|symbol-map|api-reference|search-index|learning-journal|project-activity|license-rights|sbom|security-readiness|scorecard|provenance|advisories|vex|policy-gates|api-contracts|observability|performance|e2e|accessibility|storybook|design-tokens|i18n|release-readiness|secret-readiness|container-readiness|code-quality|documentation|database-readiness|ci-cd|unit-tests|typecheck-readiness|package-manager|git-hooks|task-runner|dependency-updates|lint-readiness|format-readiness|commit-conventions|changelog-readiness|bundle-analysis|mocking-readiness|data-fetching-readiness|routing-readiness|state-management-readiness|form-readiness|auth-readiness|payment-readiness|email-readiness|queue-readiness|cache-readiness|logging-readiness|feature-flag-readiness|rate-limit-readiness|error-tracking-readiness|analytics-readiness|http-client-readiness|schema-validation-readiness|datetime-readiness|id-generation-readiness|image-processing-readiness|file-upload-readiness|websocket-readiness|pdf-generation-readiness|spreadsheet-readiness|chart-visualization-readiness|diagram-rendering-readiness|link-integrity-readiness|seo-metadata-readiness|pwa-readiness|browser-compat-readiness|env-validation-readiness|security-headers-readiness|graphql-readiness|cli-readiness|llm-readiness|llm-eval-readiness|llm-observability-readiness|vector-db-readiness|search-service-readiness|object-storage-readiness|realtime-collaboration-readiness|workflow-orchestration-readiness|openapi-client-readiness|server-framework-readiness|rpc-readiness|workspace-graph-readiness|scaffolding-readiness|scheduler-readiness|build-tool-readiness|styling-readiness|visual-regression-readiness|infrastructure-readiness|deployment-readiness|serverless-readiness|mobile-readiness|edge-readiness|compose-readiness|devcontainer-readiness|kubernetes-readiness|gitops-readiness|backup-readiness|context-pack|mcp-handoff|agent-memory|graph-query|tutorial-abstractions|decision-records|dependency-health|learning-path|quiz|quiz-print|all", "suggested-reads", "runtime-environment", "interface-map", "symbol-map", "api-reference", "search-index", "learning-journal", "project-activity", "license-rights", "sbom", "security-readiness", "scorecard", "provenance", "advisories", "vex", "policy-gates", "observability", "performance", "e2e", "accessibility", "storybook", "design-tokens", "i18n", "release-readiness", "secret-readiness", "container-readiness", "code-quality", "documentation", "database-readiness", "ci-cd", "unit-tests", "typecheck-readiness", "package-manager", "git-hooks", "task-runner", "dependency-updates", "lint-readiness", "format-readiness", "commit-conventions", "changelog-readiness", "bundle-analysis", "mocking-readiness", "data-fetching-readiness", "routing-readiness", "state-management-readiness", "form-readiness", "auth-readiness", "payment-readiness", "email-readiness", "queue-readiness", "cache-readiness", "logging-readiness", "feature-flag-readiness", "rate-limit-readiness", "error-tracking-readiness", "analytics-readiness", "http-client-readiness", "schema-validation-readiness", "datetime-readiness", "id-generation-readiness", "image-processing-readiness", "file-upload-readiness", "websocket-readiness", "pdf-generation-readiness", "spreadsheet-readiness", "chart-visualization-readiness", "diagram-rendering-readiness", "link-integrity-readiness", "seo-metadata-readiness", "pwa-readiness", "browser-compat-readiness", "env-validation-readiness", "security-headers-readiness", "graphql-readiness", "cli-readiness", "llm-readiness", "llm-eval-readiness", "llm-observability-readiness", "vector-db-readiness", "search-service-readiness", "object-storage-readiness", "realtime-collaboration-readiness", "workflow-orchestration-readiness", "openapi-client-readiness", "server-framework-readiness", "rpc-readiness", "workspace-graph-readiness", "scaffolding-readiness", "scheduler-readiness", "build-tool-readiness", "styling-readiness", "visual-regression-readiness", "infrastructure-readiness", "deployment-readiness", "serverless-readiness", "mobile-readiness", "edge-readiness", "compose-readiness", "devcontainer-readiness", "kubernetes-readiness", "gitops-readiness", "context-pack", "mcp-handoff", "agent-memory", "graph-query", "tutorial-abstractions", "decision-records", "dependency-health", "learning-path", "quiz-print", "target === \"all\"", "--list-targets", "openTargetsMarkdown", "RepoTutor Open Targets", "open --list-targets supports --format", "openTargetEntries", "openTargetFile", "assertReadableFile", "Open target file not found", "Unsupported open target", "doctor", "doctorMarkdown", "RepoTutor Doctor", "doctor supports --format", "commands", "formats", "runtime", "studiesRoot", "envStudiesRoot", "verifyExport", "verifyEvidence", "exportSummary", "listFilters", "openTargets", "openAll", "filteredKind", "filteredFile", "--file", "--format json|markdown", "evidenceMarkdown", "returnedItems"]),
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
  check("e2e readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["E2eReportSchema", "E2eReport", "e2eReport", "e2e-report.json", "e2e.md", "e2e.html", "Playwright browser E2E tests config projects locators assertions traces screenshots video reporters CI webServer", "testSuites", "browserProjects", "locatorSignals", "assertions", "artifacts", "runtimeTargets", "npx playwright test", "e2e-card", "data-source-pattern=\"Playwright\"", "openTargetEntries", "e2e"]),
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
  check("container readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/core/src/session-verifier.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts"
  ], ["ContainerReadinessReportSchema", "ContainerReadinessReport", "containerReadinessReport", "container-readiness-report.json", "container-readiness.md", "container-readiness.html", "Hadolint Dockerfile AST ShellCheck rules config ignored rules severity overrides trusted registries labels SARIF JUnit CI pre-commit", "dockerfiles", "composeFiles", "configSignals", "instructionRisks", "labelPolicy", "integrationSignals", "hadolint Dockerfile", "container-card", "data-source-pattern=\"Hadolint\"", "openTargetEntries", "container-readiness"]),
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
  check("LLM readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["LlmReadinessReportSchema", "LlmReadinessReport", "llmReadinessReport", "llm-readiness-report.json", "llm-readiness.md", "llm-readiness.html", "LangChain.js ChatOpenAI ChatPromptTemplate RunnableSequence tool createAgent VectorStore Retriever StructuredOutputParser stream callbacks LangSmith", "llmSetups", "modelSignals", "promptSignals", "toolSignals", "retrievalSignals", "structuredOutputSignals", "streamingSignals", "safetySignals", "packageSignals", "LangChain.js", "llm-readiness-card", "data-source-pattern=\"LangChain.js\"", "openTargetEntries", "llm-readiness"]),
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
  ], ["LlmObservabilityReadinessReportSchema", "LlmObservabilityReadinessReport", "llmObservabilityReadinessReport", "llm-observability-readiness-report.json", "llm-observability-readiness.md", "llm-observability-readiness.html", "LLM observability readiness Langfuse Phoenix Helicone traces spans observations generations sessions userId sessionId metadata release tags scores feedback annotations datasets experiments prompt versions playground OpenInference OpenTelemetry OTLP exporter token usage promptTokens completionTokens totalTokens cost latency model provider gateway baseURL Helicone headers rate limit retry fallback redaction telemetry opt-out", "observabilitySetups", "traceSignals", "instrumentationSignals", "identitySignals", "llmMetricSignals", "feedbackSignals", "datasetExperimentSignals", "gatewaySignals", "privacySignals", "workflowSignals", "packageSignals", "LLM Observability", "llm-observability-readiness-card", "data-source-pattern=\"LLM Observability\"", "openTargetEntries", "llm-observability-readiness"]),
  check("Vector DB readiness report", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/pipeline.test.ts"
  ], ["VectorDbReadinessReportSchema", "VectorDbReadinessReport", "vectorDbReadinessReport", "vector-db-readiness-report.json", "vector-db-readiness.md", "vector-db-readiness.html", "Vector DB readiness Qdrant Weaviate Chroma collections classes schema vector config embeddings vectorizer distance dimensions HNSW payload metadata filters hybrid search BM25 sparse vectors upsert add query search nearest neighbors score limit snapshots backup restore sharding replication tenancy ttl clients endpoints API keys persistence", "vectorSetups", "collectionSignals", "clientSignals", "ingestionSignals", "querySignals", "embeddingSignals", "indexSignals", "opsSignals", "packageSignals", "Vector DB", "vector-db-readiness-card", "data-source-pattern=\"Vector DB\"", "openTargetEntries", "vector-db-readiness"]),
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
  ], ["WorkflowOrchestrationReadinessReportSchema", "WorkflowOrchestrationReadinessReport", "workflowOrchestrationReadinessReport", "workflow-orchestration-readiness-report.json", "workflow-orchestration-readiness.md", "workflow-orchestration-readiness.html", "Workflow orchestration readiness Temporal workflows activities Worker taskQueue schedules signals queries retry timeout heartbeat continueAsNew Inngest createFunction events cron step.run step.sleep waitForEvent invoke cancelOn concurrency throttle debounce rate limit Trigger.dev task schemaTask schedules cron wait queue retry maxDuration idempotency metadata logger deploy runs", "workflowSetups", "triggerSignals", "executionSignals", "durabilitySignals", "flowSignals", "runtimeSignals", "observabilitySignals", "packageSignals", "Workflow Orchestration", "workflow-orchestration-readiness-card", "data-source-pattern=\"Workflow Orchestration\"", "openTargetEntries", "workflow-orchestration-readiness"]),
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
      const [maybeFile, maybeNeedle] = token.includes(":") ? token.split(/:(.*)/s).filter(Boolean) : [null, token];
      const targets = maybeFile ? [maybeFile] : files;
      const found = targets.some((file) => {
        const filePath = path.join(root, file);
        return fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").includes(maybeNeedle);
      });
      if (!found) missingStrings.push(token);
    }
    const forbiddenHits = [];
    for (const token of options.forbidden ?? []) {
      const [file, needle] = token.split(/:(.*)/s).filter(Boolean);
      const filePath = path.join(root, file);
      if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").includes(needle)) forbiddenHits.push(token);
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

function renderMarkdown(run) {
  return `# Compliance Audit ${run.iteration}\n\nCreated: ${run.createdAt}\n\nStatus: ${run.ok ? "PASS" : "FAIL"}\n\n${run.checks.map((item) => `## ${item.ok ? "PASS" : "FAIL"} - ${item.name}\n\n- missing files: ${item.missingFiles.join(", ") || "none"}\n- missing strings: ${item.missingStrings.join(", ") || "none"}\n- forbidden hits: ${item.forbiddenHits.join(", ") || "none"}\n`).join("\n")}`;
}

function readFlag(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}
