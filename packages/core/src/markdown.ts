import type {
  AnalysisBundle,
} from "./scanner.js";
import type { StudySessionVerificationResult } from "./session-verifier.js";
import type { AdmissionPolicyReadinessReport, AnalyticsReadinessReport, ApiGatewayReadinessReport, AuthorizationReadinessReport, BackupReadinessReport, BenchmarkReadinessReport, BiDashboardReadinessReport, BrowserCompatibilityReadinessReport, BrowserExtensionReadinessReport, BuildToolReadinessReport, CacheReadinessReport, CertificateReadinessReport, ChaosEngineeringReadinessReport, ChartVisualizationReadinessReport, CliReadinessReport, CodeMetricsReadinessReport, ComposeReadinessReport, ConsentReadinessReport, ConsumerContractReadinessReport, CoverageReadinessReport, CostReadinessReport, CrashReportingReadinessReport, DatabaseMigrationReadinessReport, DatabaseOrmReadinessReport, DataTransformationReadinessReport, DataConnectorReadinessReport, SemanticLayerReadinessReport, DataQualityReadinessReport, DataLineageReadinessReport, DataCatalogReadinessReport, DataAnnotationReadinessReport, LakehouseTableReadinessReport, FeatureStoreReadinessReport, ModelRegistryReadinessReport, ExperimentTrackingReadinessReport, ModelMonitoringReadinessReport, ModelServingReadinessReport, ModelTrainingReadinessReport, DateTimeReadinessReport, DebugReadinessReport, DeploymentReadinessReport, DesktopReadinessReport, DevContainerReadinessReport, DiagramRenderingReadinessReport, DnsReadinessReport, EdgeReadinessReport, EmailReadinessReport, EnvValidationReadinessReport, ErrorTrackingReadinessReport, EventStreamReadinessReport, SchemaRegistryReadinessReport, StreamProcessingReadinessReport, PipelineOrchestrationReadinessReport, ServiceMeshReadinessReport, IngressControllerReadinessReport, FeatureFlagReadinessReport, FileUploadReadinessReport, FlakyTestReadinessReport, GitOpsReadinessReport, GraphqlReadinessReport, HelmReadinessReport, HttpClientReadinessReport, IdGenerationReadinessReport, ImageProcessingReadinessReport, IncidentResponseReadinessReport, SloReadinessReport, InfrastructureReadinessReport, IntegrationTestEnvironmentReadinessReport, KubernetesReadinessReport, LargeAssetReadinessReport, LinkIntegrityReadinessReport, LoadTestingReadinessReport, LlmEvalReadinessReport, LlmObservabilityReadinessReport, LlmReadinessReport, LoggingReadinessReport, MobileReadinessReport, NotebookReadinessReport, NotificationReadinessReport, ObjectStorageReadinessReport, PaymentReadinessReport, PdfGenerationReadinessReport, PrivacyReadinessReport, ProfilingReadinessReport, ProgressiveDeliveryReadinessReport, PropertyBasedTestingReadinessReport, PwaReadinessReport, QueueReadinessReport, Quiz, RateLimitReadinessReport, RealtimeCollaborationReadinessReport, RpcReadinessReport, ScaffoldingReadinessReport, SchedulerReadinessReport, SchemaValidationReadinessReport, SearchServiceReadinessReport, SecretManagementReadinessReport, SecurityHeadersReadinessReport, SeoMetadataReadinessReport, ServerFrameworkReadinessReport, ServerlessReadinessReport, SnapshotReadinessReport, SpreadsheetReadinessReport, StylingReadinessReport, StudySession, TestDataReadinessReport, TestImpactReadinessReport, TestReportingReadinessReport, TracingReadinessReport, VectorDbReadinessReport, VisualRegressionReadinessReport, WebSocketReadinessReport, WorkflowOrchestrationReadinessReport, OpenApiClientReadinessReport, WebhookReadinessReport, WorkspaceGraphReadinessReport, WrongNote } from "@repotutor/shared";
import type { IacDriftReadinessReport } from "@repotutor/shared";
import type { SastReadinessReport } from "@repotutor/shared";
import type { DastReadinessReport } from "@repotutor/shared";
import type { ThreatModelReadinessReport } from "@repotutor/shared";
import type { ContainerScanReadinessReport } from "@repotutor/shared";
import type { FuzzReadinessReport } from "@repotutor/shared";
import type { MapVisualizationReadinessReport } from "@repotutor/shared";
import type { RealtimeMediaReadinessReport } from "@repotutor/shared";

export function markdownFiles(session: StudySession, analysis: AnalysisBundle, quiz: Quiz, wrongNotes: WrongNote[]): Record<string, string> {
  const files: Record<string, string> = {
    "overview.md": `# ${session.repo} 학습 개요\n\n${analysis.purposeReport.longExplanation}\n\n## 대상 사용자\n\n${bullets(analysis.purposeReport.targetUsers)}\n`,
    "language.md": `# 언어와 기술 스택\n\n주요 언어: **${analysis.languageReport.primaryLanguage}**\n\n${analysis.languageReport.languageRoles.map((role) => `## ${role.language}\n\n${role.beginnerExplanation}\n\n${role.tradeoffs}`).join("\n\n")}\n`,
    "architecture.md": `# 아키텍처\n\n${analysis.architectureReport.explanation}\n\n\`\`\`mermaid\n${analysis.architectureReport.mermaid}\n\`\`\`\n`,
    "folders.md": `# 폴더 수업\n\n${analysis.folderLessons.map((lesson) => `## ${lesson.folderPath}\n\n${lesson.beginnerExplanation}\n\n- 왜 필요한가: ${lesson.whyItExists}\n- 다시 만들기: ${lesson.rebuildAdvice}`).join("\n\n")}\n`,
    "files.md": `# 핵심 파일 수업\n\n${analysis.fileLessons.map((lesson) => `## ${lesson.filePath}\n\n${lesson.beginnerExplanation}\n\n- 역할: ${lesson.role}\n- 다시 만들기: ${lesson.rebuildAdvice}\n\n### 소스 근거\n\n${sourceEvidenceBullets(lesson.sourceEvidence ?? [], lesson.filePath)}`).join("\n\n")}\n`,
    "evidence.md": `# 소스 근거 인덱스\n\n${sourceEvidenceIndexMarkdown(analysis.fileLessons)}\n`,
    "suggested-reads.md": `# 추천 읽기\n\n${analysis.suggestedReadsReport.summary}\n\nSource pattern: ${analysis.suggestedReadsReport.sourcePattern}\n\n${suggestedReadsMarkdown(analysis.suggestedReadsReport.items)}\n`,
    "runtime-environment.md": `# 실행 환경\n\n${analysis.runtimeEnvironmentReport.summary}\n\nSource pattern: ${analysis.runtimeEnvironmentReport.sourcePattern}\n\n## 감지된 매니페스트\n\n${runtimeEnvRows(analysis.runtimeEnvironmentReport.detectedManifests)}\n\n## 설치/실행 신호\n\n${runtimeEnvRows(analysis.runtimeEnvironmentReport.setupSignals)}\n\n## 컨테이너 신호\n\n${runtimeEnvRows(analysis.runtimeEnvironmentReport.containerSignals)}\n\n## 서비스 힌트\n\n${analysis.runtimeEnvironmentReport.serviceHints.map((hint) => `- ${hint.name}: ${hint.reason} (${hint.sourcePath})`).join("\n") || "- 없음"}\n\n## 부족한 신호\n\n${bulletsOrNone(analysis.runtimeEnvironmentReport.missingSignals)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.runtimeEnvironmentReport.learnerNextSteps)}\n`,
    "interface-map.md": `# 인터페이스 맵\n\n${analysis.interfaceMapReport.summary}\n\nSource pattern: ${analysis.interfaceMapReport.sourcePattern}\n\n## Route/Page 신호\n\n${interfaceMapRows(analysis.interfaceMapReport.routeSignals)}\n\n## API 신호\n\n${analysis.interfaceMapReport.apiSignals.map((item) => `- ${item.filePath}: ${item.method} ${item.pattern} ([원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## Component 신호\n\n${analysis.interfaceMapReport.componentSignals.map((item) => `- ${item.componentName}: ${item.filePath} ([원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## Data-flow 힌트\n\n${bulletsOrNone(analysis.interfaceMapReport.dataFlowHints)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.interfaceMapReport.learnerNextSteps)}\n`,
    "symbol-map.md": `# 심볼 맵\n\n${analysis.symbolMapReport.summary}\n\nSource pattern: ${analysis.symbolMapReport.sourcePattern}\n\n## 종류별 개수\n\n${recordBullets(analysis.symbolMapReport.symbolsByKind)}\n\n## 심볼\n\n${symbolRows(analysis.symbolMapReport.symbols)}\n\n## 심볼이 많은 파일\n\n${analysis.symbolMapReport.filesWithSymbols.map((item) => `- ${item.filePath}: ${item.count}개 ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.symbolMapReport.learnerNextSteps)}\n`,
    "api-reference.md": `# API Reference\n\n${analysis.apiReferenceReport.summary}\n\nSource pattern: ${analysis.apiReferenceReport.sourcePattern}\n\n## Entry Points\n\n${analysis.apiReferenceReport.entryPoints.map((item) => `- ${item.filePath}: ${item.reason} ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## Kind Counts\n\n${recordBullets(analysis.apiReferenceReport.kindCounts)}\n\n## Category Counts\n\n${recordBullets(analysis.apiReferenceReport.categoryCounts)}\n\n## Public Symbols\n\n${apiReferenceSymbolRows(analysis.apiReferenceReport.publicSymbols)}\n\n## Export Warnings\n\n${analysis.apiReferenceReport.exportWarnings.map((item) => `- ${item.symbolName} in ${item.filePath}: ${item.message} ${item.suggestion} ([원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.apiReferenceReport.learnerNextSteps)}\n`,
    "search-index.md": `# Search Index\n\n${analysis.searchIndexReport.summary}\n\nSource pattern: ${analysis.searchIndexReport.sourcePattern}\n\n## Totals\n\n- PageFragmentData documents: ${analysis.searchIndexReport.totalDocuments}\n- MetaIndex terms: ${analysis.searchIndexReport.totalTerms}\n- Filters: ${analysis.searchIndexReport.filterIndex.length}\n- Meta fields: ${analysis.searchIndexReport.metadataFields.join(", ") || "none"}\n\n## Filter Index\n\n${searchFilterRows(analysis.searchIndexReport.filterIndex)}\n\n## Top Terms\n\n${searchTermRows(analysis.searchIndexReport.termIndex.slice(0, 30))}\n\n## Documents\n\n${searchDocumentRows(analysis.searchIndexReport.documents)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.searchIndexReport.learnerNextSteps)}\n`,
    "learning-journal.md": `# Learning Journal\n\n${analysis.learningJournalReport.summary}\n\nSource pattern: ${analysis.learningJournalReport.sourcePattern}\n\n## Focus & Goals\n\n${learningFocusRows(analysis.learningJournalReport.focusGoals)}\n\n## Concept Mastery Map\n\n${learningMasteryRows(analysis.learningJournalReport.masteryLevels)}\n\n## Open Questions\n\n${learningQuestionRows(analysis.learningJournalReport.openQuestions)}\n\n## Spaced Review Queue\n\n${learningReviewRows(analysis.learningJournalReport.spacedReviewQueue)}\n\n## Socratic Prompts\n\n${learningPromptRows(analysis.learningJournalReport.socraticPrompts)}\n\n## Aha Moments\n\n${analysis.learningJournalReport.ahaMoments.map((item) => `### ${item.title}\n\n${item.insight}\n\n- Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n\n") || "- 없음"}\n\n## Journal Template\n\n\`\`\`markdown\n${analysis.learningJournalReport.journalTemplateMarkdown.replaceAll("```", "'''")}\n\`\`\`\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.learningJournalReport.learnerNextSteps)}\n`,
    "project-activity.md": `# Project Activity\n\n${analysis.projectActivityReport.summary}\n\nSource pattern: ${analysis.projectActivityReport.sourcePattern}\n\n## History Availability\n\n- Mode: ${analysis.projectActivityReport.historyAvailability.mode}\n- Source type: ${analysis.projectActivityReport.historyAvailability.sourceType ?? "unknown"}\n- Source URL: ${analysis.projectActivityReport.historyAvailability.sourceUrl ?? "none"}\n- Local source: ${analysis.projectActivityReport.historyAvailability.localSourcePath ?? "none"}\n- Branch: ${analysis.projectActivityReport.historyAvailability.branch ?? "unknown"}\n- Commit: ${analysis.projectActivityReport.historyAvailability.commitHash ?? "unknown"}\n\n${analysis.projectActivityReport.historyAvailability.reason}\n\n## Activity Signals\n\n${projectActivitySignalsMarkdown(analysis.projectActivityReport.activitySignals)}\n\n## Hotspot Candidates\n\n${projectActivityHotspotsMarkdown(analysis.projectActivityReport.hotspotCandidates)}\n\n## Dead Code Candidates\n\n${projectActivityDeadCodeMarkdown(analysis.projectActivityReport.deadCodeCandidates)}\n\n## Review Queues\n\n${projectActivityQueuesMarkdown(analysis.projectActivityReport.reviewQueues)}\n\n## Architecture Decision Prompts\n\n${analysis.projectActivityReport.architectureDecisionPrompts.map((item) => `- ${item.trigger}: ${item.question} ([related](../${item.relatedHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.projectActivityReport.learnerNextSteps)}\n`,
    "code-metrics-readiness.md": `# Code Metrics Readiness\n\n${analysis.codeMetricsReadinessReport.summary}\n\nSource pattern: ${analysis.codeMetricsReadinessReport.sourcePattern}\n\n## Totals\n\n- Files: ${analysis.codeMetricsReadinessReport.totals.files}\n- Lines/code/comments/blanks: ${analysis.codeMetricsReadinessReport.totals.lines}/${analysis.codeMetricsReadinessReport.totals.codeLines}/${analysis.codeMetricsReadinessReport.totals.commentLines}/${analysis.codeMetricsReadinessReport.totals.blankLines}\n- Branch/function/density: ${analysis.codeMetricsReadinessReport.totals.branchCount}/${analysis.codeMetricsReadinessReport.totals.functionCount}/${analysis.codeMetricsReadinessReport.totals.complexityDensity}\n\n## Language Metrics\n\n${codeMetricsLanguageMarkdown(analysis.codeMetricsReadinessReport.languageMetrics)}\n\n## Hotspots\n\n${codeMetricsHotspotMarkdown(analysis.codeMetricsReadinessReport.hotspots)}\n\n## Tool Signals\n\n${codeMetricsSignalMarkdown(analysis.codeMetricsReadinessReport.toolSignals, "signal")}\n\n## Metric Signals\n\n${codeMetricsSignalMarkdown(analysis.codeMetricsReadinessReport.metricSignals, "signal")}\n\n## Workflow Signals\n\n${codeMetricsSignalMarkdown(analysis.codeMetricsReadinessReport.workflowSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.codeMetricsReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.codeMetricsReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.codeMetricsReadinessReport.learnerNextSteps)}\n`,
    "code-ownership-readiness.md": `# Code Ownership Readiness\n\n${analysis.codeOwnershipReadinessReport.summary}\n\nSource pattern: ${analysis.codeOwnershipReadinessReport.sourcePattern}\n\n## CODEOWNERS Files\n\n${codeOwnershipFileMarkdown(analysis.codeOwnershipReadinessReport.codeownerFiles)}\n\n## Ownership Signals\n\n${codeOwnershipSignalMarkdown(analysis.codeOwnershipReadinessReport.ownershipSignals, "signal")}\n\n## Validation Signals\n\n${codeOwnershipSignalMarkdown(analysis.codeOwnershipReadinessReport.validationSignals, "signal")}\n\n## Review Signals\n\n${codeOwnershipSignalMarkdown(analysis.codeOwnershipReadinessReport.reviewSignals, "signal")}\n\n## Coverage Signals\n\n${codeOwnershipSignalMarkdown(analysis.codeOwnershipReadinessReport.coverageSignals, "signal")}\n\n## Package Signals\n\n${codeOwnershipSignalMarkdown(analysis.codeOwnershipReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.codeOwnershipReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.codeOwnershipReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.codeOwnershipReadinessReport.learnerNextSteps)}\n`,
    "large-asset-readiness.md": `# Large Asset Readiness\n\n${analysis.largeAssetReadinessReport.summary}\n\nSource pattern: ${analysis.largeAssetReadinessReport.sourcePattern}\n\n## Asset Setups\n\n${largeAssetSetupMarkdown(analysis.largeAssetReadinessReport.assetSetups)}\n\n## Git LFS Signals\n\n${largeAssetSignalMarkdown(analysis.largeAssetReadinessReport.lfsSignals, "signal")}\n\n## DVC Signals\n\n${largeAssetSignalMarkdown(analysis.largeAssetReadinessReport.dvcSignals, "signal")}\n\n## Submodule Signals\n\n${largeAssetSignalMarkdown(analysis.largeAssetReadinessReport.submoduleSignals, "signal")}\n\n## Workflow Signals\n\n${largeAssetSignalMarkdown(analysis.largeAssetReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${largeAssetSignalMarkdown(analysis.largeAssetReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.largeAssetReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.largeAssetReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.largeAssetReadinessReport.learnerNextSteps)}\n`,
    "license-rights.md": `# License Rights\n\n${analysis.licenseRightsReport.summary}\n\nSource pattern: ${analysis.licenseRightsReport.sourcePattern}\n\n## Detected Project License\n\n- SPDX ID: ${analysis.licenseRightsReport.detectedProjectLicense.spdxId ?? "unknown"}\n- Confidence: ${analysis.licenseRightsReport.detectedProjectLicense.confidence}\n- Evidence: ${analysis.licenseRightsReport.detectedProjectLicense.evidence}\n- Source: ${analysis.licenseRightsReport.detectedProjectLicense.sourceHref ? `[${analysis.licenseRightsReport.detectedProjectLicense.sourceHref}](../${analysis.licenseRightsReport.detectedProjectLicense.sourceHref})` : "none"}\n\n## Rights Checklist\n\n${licenseChecklistMarkdown(analysis.licenseRightsReport.rightsChecklist)}\n\n## License Files\n\n${licenseFileMarkdown(analysis.licenseRightsReport.licenseFiles)}\n\n## Package License Signals\n\n${packageLicenseMarkdown(analysis.licenseRightsReport.packageLicenseSignals)}\n\n## README License References\n\n${readmeLicenseMarkdown(analysis.licenseRightsReport.readmeLicenseReferences)}\n\n## Review Warnings\n\n${analysis.licenseRightsReport.reviewWarnings.map((item) => `- ${item.severity}: ${item.message} ([related](../${item.relatedHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.licenseRightsReport.learnerNextSteps)}\n`,
    "sbom.md": `# SBOM\n\n${analysis.sbomReport.summary}\n\nSource pattern: ${analysis.sbomReport.sourcePattern}\n\n## Source Descriptor\n\n- Type: ${analysis.sbomReport.sourceDescriptor.sourceType ?? "unknown"}\n- URL: ${analysis.sbomReport.sourceDescriptor.sourceUrl ?? "none"}\n- Local source: ${analysis.sbomReport.sourceDescriptor.localSourcePath ?? "none"}\n- Branch: ${analysis.sbomReport.sourceDescriptor.branch ?? "unknown"}\n- Commit: ${analysis.sbomReport.sourceDescriptor.commitHash ?? "unknown"}\n- Descriptor: ${analysis.sbomReport.sourceDescriptor.descriptorName} v${analysis.sbomReport.sourceDescriptor.descriptorVersion}\n\n## Package Manifests\n\n${sbomManifestMarkdown(analysis.sbomReport.packageManifests)}\n\n## Package Artifacts\n\n${sbomPackageMarkdown(analysis.sbomReport.packageArtifacts)}\n\n## File Artifacts\n\n${sbomFileMarkdown(analysis.sbomReport.fileArtifacts)}\n\n## Relationships\n\n${sbomRelationshipMarkdown(analysis.sbomReport.relationships)}\n\n## Output Formats\n\n${analysis.sbomReport.outputFormats.map((item) => `- ${item.format} [${item.readiness}]: ${item.reason}`).join("\n")}\n\n## Review Warnings\n\n${analysis.sbomReport.reviewWarnings.map((item) => `- ${item.severity}: ${item.message} ([related](../${item.relatedHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.sbomReport.learnerNextSteps)}\n`,
    "security-readiness.md": `# Security Readiness\n\n${analysis.securityReadinessReport.summary}\n\nSource pattern: ${analysis.securityReadinessReport.sourcePattern}\n\n## Scanner Targets\n\n${securityTargetMarkdown(analysis.securityReadinessReport.scannerTargets)}\n\n## Scanner Coverage\n\n${securityCoverageMarkdown(analysis.securityReadinessReport.scannerCoverage)}\n\n## Security Signals\n\n${securitySignalMarkdown(analysis.securityReadinessReport.securitySignals)}\n\n## Action Queue\n\n${analysis.securityReadinessReport.actionQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## Recommended Commands\n\n${analysis.securityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.securityReadinessReport.learnerNextSteps)}\n`,
    "sast-readiness.md": `# SAST Readiness\n\n${analysis.sastReadinessReport.summary}\n\nSource pattern: ${analysis.sastReadinessReport.sourcePattern}\n\n## SAST Setups\n\n${sastReadinessSetupMarkdown(analysis.sastReadinessReport.sastSetups)}\n\n## Tool Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.toolSignals, "signal")}\n\n## Rule Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.ruleSignals, "signal")}\n\n## Query Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.querySignals, "signal")}\n\n## Language Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.languageSignals, "signal")}\n\n## Scope Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.scopeSignals, "signal")}\n\n## Baseline Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.baselineSignals, "signal")}\n\n## Output Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.outputSignals, "signal")}\n\n## CI Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${sastReadinessSignalMarkdown(analysis.sastReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.sastReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.sastReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.sastReadinessReport.learnerNextSteps)}\n`,
    "dast-readiness.md": `# DAST Readiness\n\n${analysis.dastReadinessReport.summary}\n\nSource pattern: ${analysis.dastReadinessReport.sourcePattern}\n\n## DAST Setups\n\n${dastReadinessSetupMarkdown(analysis.dastReadinessReport.dastSetups)}\n\n## Target Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.targetSignals, "signal")}\n\n## Scanner Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.scannerSignals, "signal")}\n\n## Crawl Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.crawlSignals, "signal")}\n\n## Active Scan Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.activeScanSignals, "signal")}\n\n## Auth Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.authSignals, "signal")}\n\n## Template Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.templateSignals, "signal")}\n\n## Safety Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.safetySignals, "signal")}\n\n## Output Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.outputSignals, "signal")}\n\n## CI Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${dastReadinessSignalMarkdown(analysis.dastReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dastReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dastReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dastReadinessReport.learnerNextSteps)}\n`,
    "threat-model-readiness.md": `# Threat Model Readiness\n\n${analysis.threatModelReadinessReport.summary}\n\nSource pattern: ${analysis.threatModelReadinessReport.sourcePattern}\n\n## Threat Model Setups\n\n${threatModelReadinessSetupMarkdown(analysis.threatModelReadinessReport.threatModelSetups)}\n\n## Model Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.modelSignals, "signal")}\n\n## Diagram Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.diagramSignals, "signal")}\n\n## Asset Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.assetSignals, "signal")}\n\n## Boundary Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.boundarySignals, "signal")}\n\n## Threat Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.threatSignals, "signal")}\n\n## Risk Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.riskSignals, "signal")}\n\n## Output Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.outputSignals, "signal")}\n\n## CI Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${threatModelReadinessSignalMarkdown(analysis.threatModelReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.threatModelReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.threatModelReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.threatModelReadinessReport.learnerNextSteps)}\n`,
    "scorecard.md": `# Project Scorecard\n\n${analysis.scorecardReport.summary}\n\nSource pattern: ${analysis.scorecardReport.sourcePattern}\n\n## Aggregate\n\n- Score: ${analysis.scorecardReport.aggregateScore}/10\n- Checks: ${analysis.scorecardReport.checks.length}\n- Risk queue: ${analysis.scorecardReport.riskQueue.length}\n\n## Checks\n\n${scorecardCheckMarkdown(analysis.scorecardReport.checks)}\n\n## Category Scores\n\n${scorecardCategoryMarkdown(analysis.scorecardReport.categoryScores)}\n\n## Policy Findings\n\n${scorecardPolicyMarkdown(analysis.scorecardReport.policyFindings)}\n\n## Risk Queue\n\n${analysis.scorecardReport.riskQueue.map((item) => `- ${item.priority}: ${item.checkName} - ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## Structured Results\n\n${analysis.scorecardReport.structuredResults.map((item) => `- ${item.checkName} [${item.outcome}]: ${item.probe} - ${item.evidence}`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.scorecardReport.learnerNextSteps)}\n`,
    "provenance.md": `# Provenance Readiness\n\n${analysis.provenanceReport.summary}\n\nSource pattern: ${analysis.provenanceReport.sourcePattern}\n\n## Artifact Signals\n\n${provenanceArtifactMarkdown(analysis.provenanceReport.artifactSignals)}\n\n## Signature Material\n\n${provenanceSignatureMarkdown(analysis.provenanceReport.signatureSignals)}\n\n## Attestation Signals\n\n${provenanceAttestationMarkdown(analysis.provenanceReport.attestationSignals)}\n\n## Identity Requirements\n\n${provenanceIdentityMarkdown(analysis.provenanceReport.identityRequirements)}\n\n## Verification Commands\n\n${analysis.provenanceReport.verificationCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.provenanceReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.provenanceReport.learnerNextSteps)}\n`,
    "advisories.md": `# Advisory Query Readiness\n\n${analysis.advisoryReport.summary}\n\nSource pattern: ${analysis.advisoryReport.sourcePattern}\n\n## Package Query Targets\n\n${advisoryTargetMarkdown(analysis.advisoryReport.packageQueryTargets)}\n\n## Lockfile Signals\n\n${advisoryLockfileMarkdown(analysis.advisoryReport.lockfileSignals)}\n\n## Advisory Sources\n\n${advisorySourceMarkdown(analysis.advisoryReport.advisorySources)}\n\n## Policy Controls\n\n${advisoryPolicyMarkdown(analysis.advisoryReport.policyControls)}\n\n## Result Model\n\n${advisoryResultMarkdown(analysis.advisoryReport.resultModel)}\n\n## Recommended Commands\n\n${analysis.advisoryReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Remediation Queue\n\n${analysis.advisoryReport.remediationQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.advisoryReport.learnerNextSteps)}\n`,
    "vex.md": `# OpenVEX Impact Readiness\n\n${analysis.vexReport.summary}\n\nSource pattern: ${analysis.vexReport.sourcePattern}\n\n## Product Targets\n\n${vexProductMarkdown(analysis.vexReport.productTargets)}\n\n## Vulnerability Inputs\n\n${vexInputMarkdown(analysis.vexReport.vulnerabilityInputs)}\n\n## Status Matrix\n\n${vexStatusMarkdown(analysis.vexReport.statusMatrix)}\n\n## Justification Catalog\n\n${vexJustificationMarkdown(analysis.vexReport.justificationCatalog)}\n\n## Statement Drafts\n\n${vexStatementMarkdown(analysis.vexReport.statementDrafts)}\n\n## Document Workflow\n\n${vexWorkflowMarkdown(analysis.vexReport.documentWorkflow)}\n\n## Attestation Readiness\n\n${vexAttestationMarkdown(analysis.vexReport.attestationReadiness)}\n\n## Risk Queue\n\n${analysis.vexReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.vexReport.learnerNextSteps)}\n`,
    "policy-gates.md": `# Policy Gate Readiness\n\n${analysis.policyGateReport.summary}\n\nSource pattern: ${analysis.policyGateReport.sourcePattern}\n\n## Policy Documents\n\n${policyDocumentMarkdown(analysis.policyGateReport.policyDocuments)}\n\n## Input Documents\n\n${policyInputMarkdown(analysis.policyGateReport.inputDocuments)}\n\n## Gate Queries\n\n${policyGateQueryMarkdown(analysis.policyGateReport.gateQueries)}\n\n## Test Coverage\n\n${policyCoverageMarkdown(analysis.policyGateReport.testCoverage)}\n\n## Bundle Readiness\n\n${policyBundleMarkdown(analysis.policyGateReport.bundleReadiness)}\n\n## Decision Outputs\n\n${policyDecisionMarkdown(analysis.policyGateReport.decisionOutputs)}\n\n## Recommended Commands\n\n${analysis.policyGateReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.policyGateReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.policyGateReport.learnerNextSteps)}\n`,
    "api-contracts.md": `# API Contract Readiness\n\n${analysis.apiContractReport.summary}\n\nSource pattern: ${analysis.apiContractReport.sourcePattern}\n\n## Schema Documents\n\n${apiContractSchemaMarkdown(analysis.apiContractReport.schemaDocuments)}\n\n## Operation Targets\n\n${apiContractOperationMarkdown(analysis.apiContractReport.operationTargets)}\n\n## Test Phases\n\n${apiContractPhaseMarkdown(analysis.apiContractReport.testPhases)}\n\n## Check Matrix\n\n${apiContractCheckMarkdown(analysis.apiContractReport.checkMatrix)}\n\n## Runtime Targets\n\n${apiContractRuntimeMarkdown(analysis.apiContractReport.runtimeTargets)}\n\n## Reporting Outputs\n\n${apiContractReportingMarkdown(analysis.apiContractReport.reportingOutputs)}\n\n## Recommended Commands\n\n${analysis.apiContractReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.apiContractReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.apiContractReport.learnerNextSteps)}\n`,
    "consumer-contract-readiness.md": `# Consumer Contract Readiness\n\n${analysis.consumerContractReadinessReport.summary}\n\nSource pattern: ${analysis.consumerContractReadinessReport.sourcePattern}\n\n## Contract Setups\n\n${consumerContractReadinessSetupMarkdown(analysis.consumerContractReadinessReport.contractSetups)}\n\n## Interaction Signals\n\n${consumerContractReadinessSignalMarkdown(analysis.consumerContractReadinessReport.interactionSignals, "signal")}\n\n## Provider Signals\n\n${consumerContractReadinessSignalMarkdown(analysis.consumerContractReadinessReport.providerSignals, "signal")}\n\n## Broker Signals\n\n${consumerContractReadinessSignalMarkdown(analysis.consumerContractReadinessReport.brokerSignals, "signal")}\n\n## Matcher Signals\n\n${consumerContractReadinessSignalMarkdown(analysis.consumerContractReadinessReport.matcherSignals, "signal")}\n\n## CI Signals\n\n${consumerContractReadinessSignalMarkdown(analysis.consumerContractReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${consumerContractReadinessSignalMarkdown(analysis.consumerContractReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.consumerContractReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.consumerContractReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.consumerContractReadinessReport.learnerNextSteps)}\n`,
    "observability.md": `# Observability Readiness\n\n${analysis.observabilityReport.summary}\n\nSource pattern: ${analysis.observabilityReport.sourcePattern}\n\n## Signal Pipelines\n\n${observabilityPipelineMarkdown(analysis.observabilityReport.signalPipelines)}\n\n## Instrumentation Signals\n\n${observabilityInstrumentationMarkdown(analysis.observabilityReport.instrumentationSignals)}\n\n## Exporter Targets\n\n${observabilityExporterMarkdown(analysis.observabilityReport.exporterTargets)}\n\n## Resource Attributes\n\n${observabilityResourceMarkdown(analysis.observabilityReport.resourceAttributes)}\n\n## Propagation Context\n\n${observabilityPropagationMarkdown(analysis.observabilityReport.propagationContext)}\n\n## Diagnostics\n\n${observabilityDiagnosticMarkdown(analysis.observabilityReport.diagnostics)}\n\n## Recommended Commands\n\n${analysis.observabilityReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.observabilityReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.observabilityReport.learnerNextSteps)}\n`,
    "performance.md": `# Performance Readiness\n\n${analysis.performanceReport.summary}\n\nSource pattern: ${analysis.performanceReport.sourcePattern}\n\n## Script Targets\n\n${performanceScriptMarkdown(analysis.performanceReport.scriptTargets)}\n\n## Workload Models\n\n${performanceWorkloadMarkdown(analysis.performanceReport.workloadModels)}\n\n## Thresholds\n\n${performanceThresholdMarkdown(analysis.performanceReport.thresholds)}\n\n## Checks\n\n${performanceCheckMarkdown(analysis.performanceReport.checks)}\n\n## Metrics\n\n${performanceMetricMarkdown(analysis.performanceReport.metrics)}\n\n## Outputs\n\n${performanceOutputMarkdown(analysis.performanceReport.outputs)}\n\n## Runtime Controls\n\n${performanceRuntimeMarkdown(analysis.performanceReport.runtimeControls)}\n\n## Recommended Commands\n\n${analysis.performanceReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.performanceReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.performanceReport.learnerNextSteps)}\n`,
    "profiling-readiness.md": `# Profiling Readiness\n\n${analysis.profilingReadinessReport.summary}\n\nSource pattern: ${analysis.profilingReadinessReport.sourcePattern}\n\n## Profiling Setups\n\n${profilingSetupMarkdown(analysis.profilingReadinessReport.profilingSetups)}\n\n## Target Signals\n\n${profilingSignalMarkdown(analysis.profilingReadinessReport.targetSignals, "signal")}\n\n## Mode Signals\n\n${profilingSignalMarkdown(analysis.profilingReadinessReport.modeSignals, "signal")}\n\n## Output Signals\n\n${profilingSignalMarkdown(analysis.profilingReadinessReport.outputSignals, "signal")}\n\n## Runtime Signals\n\n${profilingSignalMarkdown(analysis.profilingReadinessReport.runtimeSignals, "signal")}\n\n## Safety Signals\n\n${profilingSignalMarkdown(analysis.profilingReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${profilingSignalMarkdown(analysis.profilingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.profilingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.profilingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.profilingReadinessReport.learnerNextSteps)}\n`,
    "tracing-readiness.md": `# Tracing Readiness\n\n${analysis.tracingReadinessReport.summary}\n\nSource pattern: ${analysis.tracingReadinessReport.sourcePattern}\n\n## Tracing Setups\n\n${tracingSetupMarkdown(analysis.tracingReadinessReport.tracingSetups)}\n\n## Instrumentation Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.instrumentationSignals, "signal")}\n\n## Propagation Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.propagationSignals, "signal")}\n\n## Exporter Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.exporterSignals, "signal")}\n\n## Sampling Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.samplingSignals, "signal")}\n\n## Resource Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.resourceSignals, "signal")}\n\n## Backend Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.backendSignals, "signal")}\n\n## Quality Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.qualitySignals, "signal")}\n\n## Package Signals\n\n${tracingSignalMarkdown(analysis.tracingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.tracingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.tracingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.tracingReadinessReport.learnerNextSteps)}\n`,
    "debug-readiness.md": `# Debug Readiness\n\n${analysis.debugReadinessReport.summary}\n\nSource pattern: ${analysis.debugReadinessReport.sourcePattern}\n\n## Debug Setups\n\n${debugSetupMarkdown(analysis.debugReadinessReport.debugSetups)}\n\n## Adapter Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.adapterSignals, "signal")}\n\n## Mode Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.modeSignals, "signal")}\n\n## Breakpoint Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.breakpointSignals, "signal")}\n\n## Mapping Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.mappingSignals, "signal")}\n\n## Runtime Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.runtimeSignals, "signal")}\n\n## Remote Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.remoteSignals, "signal")}\n\n## Diagnostic Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.diagnosticSignals, "signal")}\n\n## Package Signals\n\n${debugSignalMarkdown(analysis.debugReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.debugReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.debugReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.debugReadinessReport.learnerNextSteps)}\n`,
    "e2e.md": `# E2E Readiness\n\n${analysis.e2eReport.summary}\n\nSource pattern: ${analysis.e2eReport.sourcePattern}\n\n## Test Suites\n\n${e2eSuiteMarkdown(analysis.e2eReport.testSuites)}\n\n## Browser Projects\n\n${e2eBrowserMarkdown(analysis.e2eReport.browserProjects)}\n\n## Locator Signals\n\n${e2eLocatorMarkdown(analysis.e2eReport.locatorSignals)}\n\n## Assertions\n\n${e2eAssertionMarkdown(analysis.e2eReport.assertions)}\n\n## Artifacts\n\n${e2eArtifactMarkdown(analysis.e2eReport.artifacts)}\n\n## Runtime Targets\n\n${e2eRuntimeMarkdown(analysis.e2eReport.runtimeTargets)}\n\n## Recommended Commands\n\n${analysis.e2eReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.e2eReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.e2eReport.learnerNextSteps)}\n`,
    "integration-test-environment-readiness.md": `# Integration Test Environment Readiness\n\n${analysis.integrationTestEnvironmentReadinessReport.summary}\n\nSource pattern: ${analysis.integrationTestEnvironmentReadinessReport.sourcePattern}\n\n## Integration Setups\n\n${integrationTestEnvironmentReadinessSetupMarkdown(analysis.integrationTestEnvironmentReadinessReport.integrationSetups)}\n\n## Container Signals\n\n${integrationTestEnvironmentReadinessSignalMarkdown(analysis.integrationTestEnvironmentReadinessReport.containerSignals, "signal")}\n\n## Wait Signals\n\n${integrationTestEnvironmentReadinessSignalMarkdown(analysis.integrationTestEnvironmentReadinessReport.waitSignals, "signal")}\n\n## Lifecycle Signals\n\n${integrationTestEnvironmentReadinessSignalMarkdown(analysis.integrationTestEnvironmentReadinessReport.lifecycleSignals, "signal")}\n\n## Runtime Signals\n\n${integrationTestEnvironmentReadinessSignalMarkdown(analysis.integrationTestEnvironmentReadinessReport.runtimeSignals, "signal")}\n\n## Package Signals\n\n${integrationTestEnvironmentReadinessSignalMarkdown(analysis.integrationTestEnvironmentReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.integrationTestEnvironmentReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.integrationTestEnvironmentReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.integrationTestEnvironmentReadinessReport.learnerNextSteps)}\n`,
    "chaos-engineering-readiness.md": `# Chaos Engineering Readiness\n\n${analysis.chaosEngineeringReadinessReport.summary}\n\nSource pattern: ${analysis.chaosEngineeringReadinessReport.sourcePattern}\n\n## Chaos Setups\n\n${chaosEngineeringReadinessSetupMarkdown(analysis.chaosEngineeringReadinessReport.chaosSetups)}\n\n## Experiment Signals\n\n${chaosEngineeringReadinessSignalMarkdown(analysis.chaosEngineeringReadinessReport.experimentSignals, "signal")}\n\n## Fault Signals\n\n${chaosEngineeringReadinessSignalMarkdown(analysis.chaosEngineeringReadinessReport.faultSignals, "signal")}\n\n## Scope Signals\n\n${chaosEngineeringReadinessSignalMarkdown(analysis.chaosEngineeringReadinessReport.scopeSignals, "signal")}\n\n## Safety Signals\n\n${chaosEngineeringReadinessSignalMarkdown(analysis.chaosEngineeringReadinessReport.safetySignals, "signal")}\n\n## Observability Signals\n\n${chaosEngineeringReadinessSignalMarkdown(analysis.chaosEngineeringReadinessReport.observabilitySignals, "signal")}\n\n## Package Signals\n\n${chaosEngineeringReadinessSignalMarkdown(analysis.chaosEngineeringReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.chaosEngineeringReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.chaosEngineeringReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.chaosEngineeringReadinessReport.learnerNextSteps)}\n`,
    "accessibility.md": `# Accessibility Readiness\n\n${analysis.accessibilityReport.summary}\n\nSource pattern: ${analysis.accessibilityReport.sourcePattern}\n\n## Scan Targets\n\n${accessibilityScanTargetMarkdown(analysis.accessibilityReport.scanTargets)}\n\n## Rule Tags\n\n${accessibilityRuleTagMarkdown(analysis.accessibilityReport.ruleTags)}\n\n## Result Buckets\n\n${accessibilityResultBucketMarkdown(analysis.accessibilityReport.resultBuckets)}\n\n## Impact Levels\n\n${accessibilityImpactMarkdown(analysis.accessibilityReport.impactLevels)}\n\n## Integration Signals\n\n${accessibilityIntegrationMarkdown(analysis.accessibilityReport.integrationSignals)}\n\n## Context Controls\n\n${accessibilityContextMarkdown(analysis.accessibilityReport.contextControls)}\n\n## Recommended Commands\n\n${analysis.accessibilityReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.accessibilityReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.accessibilityReport.learnerNextSteps)}\n`,
    "storybook.md": `# Storybook Readiness\n\n${analysis.storybookReport.summary}\n\nSource pattern: ${analysis.storybookReport.sourcePattern}\n\n## Story Files\n\n${storybookStoryFileMarkdown(analysis.storybookReport.storyFiles)}\n\n## Config Files\n\n${storybookConfigMarkdown(analysis.storybookReport.configFiles)}\n\n## Story Annotations\n\n${storybookAnnotationMarkdown(analysis.storybookReport.storyAnnotations)}\n\n## Addon Signals\n\n${storybookAddonMarkdown(analysis.storybookReport.addonSignals)}\n\n## Test Signals\n\n${storybookTestMarkdown(analysis.storybookReport.testSignals)}\n\n## Publish Signals\n\n${storybookPublishMarkdown(analysis.storybookReport.publishSignals)}\n\n## Recommended Commands\n\n${analysis.storybookReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.storybookReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.storybookReport.learnerNextSteps)}\n`,
    "design-tokens.md": `# Design Tokens Readiness\n\n${analysis.designTokensReport.summary}\n\nSource pattern: ${analysis.designTokensReport.sourcePattern}\n\n## Token Sources\n\n${designTokenSourceMarkdown(analysis.designTokensReport.tokenSources)}\n\n## Token Categories\n\n${designTokenCategoryMarkdown(analysis.designTokensReport.tokenCategories)}\n\n## Platform Targets\n\n${designTokenPlatformMarkdown(analysis.designTokensReport.platformTargets)}\n\n## Transform Signals\n\n${designTokenTransformMarkdown(analysis.designTokensReport.transformSignals)}\n\n## Usage Signals\n\n${designTokenUsageMarkdown(analysis.designTokensReport.usageSignals)}\n\n## Governance Signals\n\n${designTokenGovernanceMarkdown(analysis.designTokensReport.governanceSignals)}\n\n## Recommended Commands\n\n${analysis.designTokensReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.designTokensReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.designTokensReport.learnerNextSteps)}\n`,
    "i18n.md": `# I18n Readiness\n\n${analysis.i18nReport.summary}\n\nSource pattern: ${analysis.i18nReport.sourcePattern}\n\n## Message Sources\n\n${i18nMessageSourceMarkdown(analysis.i18nReport.messageSources)}\n\n## Locale Assets\n\n${i18nLocaleAssetMarkdown(analysis.i18nReport.localeAssets)}\n\n## Runtime Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.runtimeSignals)}\n\n## Extraction Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.extractionSignals)}\n\n## ICU Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.icuSignals)}\n\n## QA Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.qaSignals)}\n\n## Recommended Commands\n\n${analysis.i18nReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.i18nReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.i18nReport.learnerNextSteps)}\n`,
    "release-readiness.md": `# Release Readiness\n\n${analysis.releaseReadinessReport.summary}\n\nSource pattern: ${analysis.releaseReadinessReport.sourcePattern}\n\n## Release Configs\n\n${releaseConfigMarkdown(analysis.releaseReadinessReport.releaseConfigs)}\n\n## Branch Channels\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.branchChannels, "channel")}\n\n## Version Signals\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.versionSignals, "signal")}\n\n## CI Signals\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.ciSignals, "signal")}\n\n## Publish Targets\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.publishTargets, "target")}\n\n## Auth Signals\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.authSignals, "signal")}\n\n## Plugin Steps\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.pluginSteps, "step")}\n\n## Recommended Commands\n\n${analysis.releaseReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.releaseReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.releaseReadinessReport.learnerNextSteps)}\n`,
    "secret-readiness.md": `# Secret Readiness\n\n${analysis.secretReadinessReport.summary}\n\nSource pattern: ${analysis.secretReadinessReport.sourcePattern}\n\n## Scan Targets\n\n${secretSignalMarkdown(analysis.secretReadinessReport.scanTargets, "target")}\n\n## Secret Surfaces\n\n${secretSurfaceMarkdown(analysis.secretReadinessReport.secretSurfaces)}\n\n## Config Signals\n\n${secretConfigMarkdown(analysis.secretReadinessReport.configSignals)}\n\n## Reporting Signals\n\n${secretSignalMarkdown(analysis.secretReadinessReport.reportingSignals, "signal")}\n\n## Prevention Signals\n\n${secretSignalMarkdown(analysis.secretReadinessReport.preventionSignals, "signal")}\n\n## Advanced Signals\n\n${secretSignalMarkdown(analysis.secretReadinessReport.advancedSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.secretReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.secretReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.secretReadinessReport.learnerNextSteps)}\n`,
    "secret-management-readiness.md": `# Secret Management Readiness\n\n${analysis.secretManagementReadinessReport.summary}\n\nSource pattern: ${analysis.secretManagementReadinessReport.sourcePattern}\n\n## Secret Management Setups\n\n${secretManagementReadinessSetupMarkdown(analysis.secretManagementReadinessReport.secretManagementSetups)}\n\n## Platform Signals\n\n${secretManagementReadinessSignalMarkdown(analysis.secretManagementReadinessReport.platformSignals, "signal")}\n\n## Auth Signals\n\n${secretManagementReadinessSignalMarkdown(analysis.secretManagementReadinessReport.authSignals, "signal")}\n\n## Storage Signals\n\n${secretManagementReadinessSignalMarkdown(analysis.secretManagementReadinessReport.storageSignals, "signal")}\n\n## Delivery Signals\n\n${secretManagementReadinessSignalMarkdown(analysis.secretManagementReadinessReport.deliverySignals, "signal")}\n\n## Governance Signals\n\n${secretManagementReadinessSignalMarkdown(analysis.secretManagementReadinessReport.governanceSignals, "signal")}\n\n## Package Signals\n\n${secretManagementReadinessSignalMarkdown(analysis.secretManagementReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.secretManagementReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.secretManagementReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.secretManagementReadinessReport.learnerNextSteps)}\n`,
    "container-readiness.md": `# Container Readiness\n\n${analysis.containerReadinessReport.summary}\n\nSource pattern: ${analysis.containerReadinessReport.sourcePattern}\n\n## Dockerfiles\n\n${containerDockerfileMarkdown(analysis.containerReadinessReport.dockerfiles)}\n\n## Compose Files\n\n${containerComposeMarkdown(analysis.containerReadinessReport.composeFiles)}\n\n## Config Signals\n\n${containerConfigMarkdown(analysis.containerReadinessReport.configSignals)}\n\n## Instruction Risks\n\n${containerSignalMarkdown(analysis.containerReadinessReport.instructionRisks, "rule")}\n\n## Label Policy\n\n${containerSignalMarkdown(analysis.containerReadinessReport.labelPolicy, "label")}\n\n## Integration Signals\n\n${containerSignalMarkdown(analysis.containerReadinessReport.integrationSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.containerReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.containerReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.containerReadinessReport.learnerNextSteps)}\n`,
    "container-scan-readiness.md": `# Container Scan Readiness\n\n${analysis.containerScanReadinessReport.summary}\n\nSource pattern: ${analysis.containerScanReadinessReport.sourcePattern}\n\nRepoTutor records static container-scan readiness only. It does not build images, pull registries, download scanner databases, start Docker, or upload SARIF.\n\n## Container Scan Setups\n\n${containerScanSetupMarkdown(analysis.containerScanReadinessReport.containerScanSetups)}\n\n## Target Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.targetSignals, "signal")}\n\n## Scanner Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.scannerSignals, "signal")}\n\n## Gate Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.gateSignals, "signal")}\n\n## Output Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.outputSignals, "signal")}\n\n## Policy Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.policySignals, "signal")}\n\n## Registry Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.registrySignals, "signal")}\n\n## CI Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${containerScanSignalMarkdown(analysis.containerScanReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.containerScanReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.containerScanReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.containerScanReadinessReport.learnerNextSteps)}\n`,
    "code-quality.md": `# Code Quality\n\n${analysis.codeQualityReport.summary}\n\nSource pattern: ${analysis.codeQualityReport.sourcePattern}\n\n## Tool Configs\n\n${codeQualityConfigMarkdown(analysis.codeQualityReport.toolConfigs)}\n\n## Formatter Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.formatterSignals, "signal")}\n\n## Linter Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.linterSignals, "signal")}\n\n## Assist Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.assistSignals, "signal")}\n\n## CI Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.ciSignals, "signal")}\n\n## Language Coverage\n\n${codeQualityLanguageMarkdown(analysis.codeQualityReport.languageCoverage)}\n\n## Recommended Commands\n\n${analysis.codeQualityReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.codeQualityReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.codeQualityReport.learnerNextSteps)}\n`,
    "documentation.md": `# Documentation Readiness\n\n${analysis.documentationReport.summary}\n\nSource pattern: ${analysis.documentationReport.sourcePattern}\n\n## Site Configs\n\n${documentationConfigMarkdown(analysis.documentationReport.siteConfigs)}\n\n## Content Surfaces\n\n${documentationContentMarkdown(analysis.documentationReport.contentSurfaces)}\n\n## Navigation Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.navigationSignals, "signal")}\n\n## Quality Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.qualitySignals, "signal")}\n\n## Localization Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.localizationSignals, "signal")}\n\n## Release Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.releaseSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.documentationReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.documentationReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.documentationReport.learnerNextSteps)}\n`,
    "database-readiness.md": `# Database Readiness\n\n${analysis.databaseReadinessReport.summary}\n\nSource pattern: ${analysis.databaseReadinessReport.sourcePattern}\n\n## Schema Files\n\n${databaseSchemaMarkdown(analysis.databaseReadinessReport.schemaFiles)}\n\n## Datasource Signals\n\n${databaseDatasourceMarkdown(analysis.databaseReadinessReport.datasourceSignals)}\n\n## Migration Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.migrationSignals, "signal")}\n\n## Client Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.clientSignals, "signal")}\n\n## Config Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.configSignals, "signal")}\n\n## Model Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.modelSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.databaseReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.databaseReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.databaseReadinessReport.learnerNextSteps)}\n`,
    "ci-cd.md": `# CI/CD Readiness\n\n${analysis.ciCdReport.summary}\n\nSource pattern: ${analysis.ciCdReport.sourcePattern}\n\n## Workflow Files\n\n${ciCdWorkflowMarkdown(analysis.ciCdReport.workflowFiles)}\n\n## Trigger Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.triggerSignals, "trigger")}\n\n## Job Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.jobSignals, "signal")}\n\n## Security Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.securitySignals, "signal")}\n\n## Delivery Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.deliverySignals, "signal")}\n\n## Platform Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.platformSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.ciCdReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.ciCdReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.ciCdReport.learnerNextSteps)}\n`,
    "unit-tests.md": `# Unit Test Readiness\n\n${analysis.unitTestReport.summary}\n\nSource pattern: ${analysis.unitTestReport.sourcePattern}\n\n## Test Files\n\n${unitTestFileMarkdown(analysis.unitTestReport.testFiles)}\n\n## Config Files\n\n${unitTestConfigMarkdown(analysis.unitTestReport.configFiles)}\n\n## Assertion Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.assertionSignals, "assertion")}\n\n## Mock Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.mockSignals, "signal")}\n\n## Coverage Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.coverageSignals, "signal")}\n\n## Environment Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.environmentSignals, "signal")}\n\n## Reporting Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.reportingSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.unitTestReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.unitTestReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.unitTestReport.learnerNextSteps)}\n`,
    "coverage-readiness.md": `# Coverage Readiness\n\n${analysis.coverageReadinessReport.summary}\n\nSource pattern: ${analysis.coverageReadinessReport.sourcePattern}\n\n## Coverage Setups\n\n${coverageReadinessSetupMarkdown(analysis.coverageReadinessReport.coverageSetups)}\n\n## Instrumentation Signals\n\n${coverageReadinessSignalMarkdown(analysis.coverageReadinessReport.instrumentationSignals, "signal")}\n\n## Scope Signals\n\n${coverageReadinessSignalMarkdown(analysis.coverageReadinessReport.scopeSignals, "signal")}\n\n## Threshold Signals\n\n${coverageReadinessSignalMarkdown(analysis.coverageReadinessReport.thresholdSignals, "signal")}\n\n## Report Signals\n\n${coverageReadinessSignalMarkdown(analysis.coverageReadinessReport.reportSignals, "signal")}\n\n## CI Upload Signals\n\n${coverageReadinessSignalMarkdown(analysis.coverageReadinessReport.ciUploadSignals, "signal")}\n\n## Package Signals\n\n${coverageReadinessSignalMarkdown(analysis.coverageReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.coverageReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.coverageReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.coverageReadinessReport.learnerNextSteps)}\n`,
    "mutation-testing-readiness.md": `# Mutation Testing Readiness\n\n${analysis.mutationTestingReadinessReport.summary}\n\nSource pattern: ${analysis.mutationTestingReadinessReport.sourcePattern}\n\n## Mutation Setups\n\n${mutationTestingSetupMarkdown(analysis.mutationTestingReadinessReport.mutationSetups)}\n\n## Tool Signals\n\n${mutationTestingSignalMarkdown(analysis.mutationTestingReadinessReport.toolSignals, "signal")}\n\n## Config Signals\n\n${mutationTestingSignalMarkdown(analysis.mutationTestingReadinessReport.configSignals, "signal")}\n\n## Quality Signals\n\n${mutationTestingSignalMarkdown(analysis.mutationTestingReadinessReport.qualitySignals, "signal")}\n\n## Reporter Signals\n\n${mutationTestingSignalMarkdown(analysis.mutationTestingReadinessReport.reporterSignals, "signal")}\n\n## Scope Signals\n\n${mutationTestingSignalMarkdown(analysis.mutationTestingReadinessReport.scopeSignals, "signal")}\n\n## Package Signals\n\n${mutationTestingSignalMarkdown(analysis.mutationTestingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.mutationTestingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.mutationTestingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.mutationTestingReadinessReport.learnerNextSteps)}\n`,
    "typecheck-readiness.md": `# Typecheck Readiness\n\n${analysis.typecheckReadinessReport.summary}\n\nSource pattern: ${analysis.typecheckReadinessReport.sourcePattern}\n\n## TSConfig Files\n\n${typecheckTsconfigMarkdown(analysis.typecheckReadinessReport.tsconfigFiles)}\n\n## Compiler Option Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.compilerOptionSignals, "signal")}\n\n## Project Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.projectSignals, "signal")}\n\n## Module Resolution Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.moduleResolutionSignals, "signal")}\n\n## Declaration Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.declarationSignals, "signal")}\n\n## Script Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.scriptSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.typecheckReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.typecheckReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.typecheckReadinessReport.learnerNextSteps)}\n`,
    "package-manager.md": `# Package Manager Readiness\n\n${analysis.packageManagerReport.summary}\n\nSource pattern: ${analysis.packageManagerReport.sourcePattern}\n\n## Manifest Files\n\n${packageManagerManifestMarkdown(analysis.packageManagerReport.manifestFiles)}\n\n## Workspace Signals\n\n${packageManagerSignalMarkdown(analysis.packageManagerReport.workspaceSignals, "signal")}\n\n## Lockfile Signals\n\n${packageManagerLockfileMarkdown(analysis.packageManagerReport.lockfileSignals)}\n\n## Script Signals\n\n${packageManagerSignalMarkdown(analysis.packageManagerReport.scriptSignals, "signal")}\n\n## Policy Signals\n\n${packageManagerSignalMarkdown(analysis.packageManagerReport.policySignals, "signal")}\n\n## Recommended Commands\n\n${analysis.packageManagerReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.packageManagerReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.packageManagerReport.learnerNextSteps)}\n`,
    "git-hooks.md": `# Git Hooks Readiness\n\n${analysis.gitHooksReport.summary}\n\nSource pattern: ${analysis.gitHooksReport.sourcePattern}\n\n## Hook Files\n\n${gitHooksHookMarkdown(analysis.gitHooksReport.hookFiles)}\n\n## Install Signals\n\n${gitHooksSignalMarkdown(analysis.gitHooksReport.installSignals, "signal")}\n\n## Command Signals\n\n${gitHooksSignalMarkdown(analysis.gitHooksReport.commandSignals, "signal")}\n\n## Policy Signals\n\n${gitHooksSignalMarkdown(analysis.gitHooksReport.policySignals, "signal")}\n\n## Tool Config Files\n\n${gitHooksToolConfigMarkdown(analysis.gitHooksReport.toolConfigFiles)}\n\n## Recommended Commands\n\n${analysis.gitHooksReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.gitHooksReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.gitHooksReport.learnerNextSteps)}\n`,
    "task-runner.md": `# Task Runner Readiness\n\n${analysis.taskRunnerReport.summary}\n\nSource pattern: ${analysis.taskRunnerReport.sourcePattern}\n\n## Config Files\n\n${taskRunnerConfigMarkdown(analysis.taskRunnerReport.configFiles)}\n\n## Task Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.taskSignals, "signal")}\n\n## Cache Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.cacheSignals, "signal")}\n\n## Dependency Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.dependencySignals, "signal")}\n\n## Environment Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.environmentSignals, "signal")}\n\n## Package Script Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.packageScriptSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.taskRunnerReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.taskRunnerReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.taskRunnerReport.learnerNextSteps)}\n`,
    "dependency-updates.md": `# Dependency Updates Readiness\n\n${analysis.dependencyUpdateReport.summary}\n\nSource pattern: ${analysis.dependencyUpdateReport.sourcePattern}\n\n## Config Files\n\n${dependencyUpdateConfigMarkdown(analysis.dependencyUpdateReport.configFiles)}\n\n## Manager Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.managerSignals, "signal")}\n\n## Policy Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.policySignals, "signal")}\n\n## Workflow Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.workflowSignals, "signal")}\n\n## Registry Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.registrySignals, "signal")}\n\n## Package File Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.packageFileSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dependencyUpdateReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dependencyUpdateReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dependencyUpdateReport.learnerNextSteps)}\n`,
    "dependency-review-readiness.md": `# Dependency Review Readiness\n\n${analysis.dependencyReviewReadinessReport.summary}\n\nSource pattern: ${analysis.dependencyReviewReadinessReport.sourcePattern}\n\n## Dependency Review Setups\n\n${dependencyReviewSetupMarkdown(analysis.dependencyReviewReadinessReport.dependencyReviewSetups)}\n\n## Review Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.reviewSignals, "signal")}\n\n## Vulnerability Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.vulnerabilitySignals, "signal")}\n\n## License Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.licenseSignals, "signal")}\n\n## Package Policy Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.packagePolicySignals, "signal")}\n\n## CI Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.ciSignals, "signal")}\n\n## Scorecard Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.scorecardSignals, "signal")}\n\n## Output Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.outputSignals, "signal")}\n\n## Package Signals\n\n${dependencyReviewSignalMarkdown(analysis.dependencyReviewReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dependencyReviewReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dependencyReviewReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dependencyReviewReadinessReport.learnerNextSteps)}\n`,
    "lint-readiness.md": `# Lint Readiness\n\n${analysis.lintReadinessReport.summary}\n\nSource pattern: ${analysis.lintReadinessReport.sourcePattern}\n\n## Config Files\n\n${lintReadinessConfigMarkdown(analysis.lintReadinessReport.configFiles)}\n\n## Rule Signals\n\n${lintReadinessSignalMarkdown(analysis.lintReadinessReport.ruleSignals, "signal")}\n\n## Script Signals\n\n${lintReadinessSignalMarkdown(analysis.lintReadinessReport.scriptSignals, "signal")}\n\n## Scope Signals\n\n${lintReadinessSignalMarkdown(analysis.lintReadinessReport.scopeSignals, "signal")}\n\n## Output Signals\n\n${lintReadinessSignalMarkdown(analysis.lintReadinessReport.outputSignals, "signal")}\n\n## Package Signals\n\n${lintReadinessSignalMarkdown(analysis.lintReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.lintReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.lintReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.lintReadinessReport.learnerNextSteps)}\n`,
    "format-readiness.md": `# Format Readiness\n\n${analysis.formatReadinessReport.summary}\n\nSource pattern: ${analysis.formatReadinessReport.sourcePattern}\n\n## Config Files\n\n${formatReadinessConfigMarkdown(analysis.formatReadinessReport.configFiles)}\n\n## Ignore Files\n\n${formatReadinessIgnoreMarkdown(analysis.formatReadinessReport.ignoreFiles)}\n\n## Option Signals\n\n${formatReadinessSignalMarkdown(analysis.formatReadinessReport.optionSignals, "signal")}\n\n## Script Signals\n\n${formatReadinessSignalMarkdown(analysis.formatReadinessReport.scriptSignals, "signal")}\n\n## Scope Signals\n\n${formatReadinessSignalMarkdown(analysis.formatReadinessReport.scopeSignals, "signal")}\n\n## Package Signals\n\n${formatReadinessSignalMarkdown(analysis.formatReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.formatReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.formatReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.formatReadinessReport.learnerNextSteps)}\n`,
    "commit-conventions.md": `# Commit Conventions\n\n${analysis.commitConventionReport.summary}\n\nSource pattern: ${analysis.commitConventionReport.sourcePattern}\n\n## Config Files\n\n${commitConventionConfigMarkdown(analysis.commitConventionReport.configFiles)}\n\n## Rule Signals\n\n${commitConventionSignalMarkdown(analysis.commitConventionReport.ruleSignals, "signal")}\n\n## Hook Signals\n\n${commitConventionSignalMarkdown(analysis.commitConventionReport.hookSignals, "signal")}\n\n## Command Signals\n\n${commitConventionSignalMarkdown(analysis.commitConventionReport.commandSignals, "signal")}\n\n## Package Signals\n\n${commitConventionSignalMarkdown(analysis.commitConventionReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.commitConventionReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.commitConventionReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.commitConventionReport.learnerNextSteps)}\n`,
    "changelog-readiness.md": `# Changelog Readiness\n\n${analysis.changelogReadinessReport.summary}\n\nSource pattern: ${analysis.changelogReadinessReport.sourcePattern}\n\n## Config Files\n\n${changelogReadinessConfigMarkdown(analysis.changelogReadinessReport.configFiles)}\n\n## Changeset Files\n\n${changelogReadinessFileMarkdown(analysis.changelogReadinessReport.changesetFiles)}\n\n## Workflow Signals\n\n${changelogReadinessSignalMarkdown(analysis.changelogReadinessReport.workflowSignals, "signal")}\n\n## Command Signals\n\n${changelogReadinessSignalMarkdown(analysis.changelogReadinessReport.commandSignals, "signal")}\n\n## Package Signals\n\n${changelogReadinessSignalMarkdown(analysis.changelogReadinessReport.packageSignals, "signal")}\n\n## Policy Signals\n\n${changelogReadinessSignalMarkdown(analysis.changelogReadinessReport.policySignals, "signal")}\n\n## Recommended Commands\n\n${analysis.changelogReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.changelogReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.changelogReadinessReport.learnerNextSteps)}\n`,
    "bundle-analysis.md": `# Bundle Analysis\n\n${analysis.bundleAnalysisReport.summary}\n\nSource pattern: ${analysis.bundleAnalysisReport.sourcePattern}\n\n## Config Files\n\n${bundleAnalysisConfigMarkdown(analysis.bundleAnalysisReport.configFiles)}\n\n## Bundle Artifacts\n\n${bundleAnalysisArtifactMarkdown(analysis.bundleAnalysisReport.bundleArtifacts)}\n\n## Size Signals\n\n${bundleAnalysisSignalMarkdown(analysis.bundleAnalysisReport.sizeSignals, "signal")}\n\n## Script Signals\n\n${bundleAnalysisSignalMarkdown(analysis.bundleAnalysisReport.scriptSignals, "signal")}\n\n## Package Signals\n\n${bundleAnalysisSignalMarkdown(analysis.bundleAnalysisReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.bundleAnalysisReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.bundleAnalysisReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.bundleAnalysisReport.learnerNextSteps)}\n`,
    "mocking-readiness.md": `# Mocking Readiness\n\n${analysis.mockingReadinessReport.summary}\n\nSource pattern: ${analysis.mockingReadinessReport.sourcePattern}\n\n## Handler Files\n\n${mockingReadinessHandlerMarkdown(analysis.mockingReadinessReport.handlerFiles)}\n\n## Server Setups\n\n${mockingReadinessSetupMarkdown(analysis.mockingReadinessReport.serverSetups)}\n\n## Protocol Signals\n\n${mockingReadinessSignalMarkdown(analysis.mockingReadinessReport.protocolSignals, "signal")}\n\n## Lifecycle Signals\n\n${mockingReadinessSignalMarkdown(analysis.mockingReadinessReport.lifecycleSignals, "signal")}\n\n## Package Signals\n\n${mockingReadinessSignalMarkdown(analysis.mockingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.mockingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.mockingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.mockingReadinessReport.learnerNextSteps)}\n`,
    "data-fetching-readiness.md": `# Data Fetching Readiness\n\n${analysis.dataFetchingReadinessReport.summary}\n\nSource pattern: ${analysis.dataFetchingReadinessReport.sourcePattern}\n\n## Client Setups\n\n${dataFetchingClientMarkdown(analysis.dataFetchingReadinessReport.clientSetups)}\n\n## Query Usages\n\n${dataFetchingUsageMarkdown(analysis.dataFetchingReadinessReport.queryUsages)}\n\n## Cache Signals\n\n${dataFetchingSignalMarkdown(analysis.dataFetchingReadinessReport.cacheSignals, "signal")}\n\n## Data Flow Signals\n\n${dataFetchingSignalMarkdown(analysis.dataFetchingReadinessReport.dataFlowSignals, "signal")}\n\n## Package Signals\n\n${dataFetchingSignalMarkdown(analysis.dataFetchingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dataFetchingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dataFetchingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dataFetchingReadinessReport.learnerNextSteps)}\n`,
    "routing-readiness.md": `# Routing Readiness\n\n${analysis.routingReadinessReport.summary}\n\nSource pattern: ${analysis.routingReadinessReport.sourcePattern}\n\n## Routing Setups\n\n${routingSetupMarkdown(analysis.routingReadinessReport.routingSetups)}\n\n## Route Definitions\n\n${routingDefinitionMarkdown(analysis.routingReadinessReport.routeDefinitions)}\n\n## Navigation Signals\n\n${routingSignalMarkdown(analysis.routingReadinessReport.navigationSignals, "signal")}\n\n## Data Route Signals\n\n${routingSignalMarkdown(analysis.routingReadinessReport.dataRouteSignals, "signal")}\n\n## File Route Signals\n\n${routingSignalMarkdown(analysis.routingReadinessReport.fileRouteSignals, "signal")}\n\n## Package Signals\n\n${routingSignalMarkdown(analysis.routingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.routingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.routingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.routingReadinessReport.learnerNextSteps)}\n`,
    "state-management-readiness.md": `# State Management Readiness\n\n${analysis.stateManagementReadinessReport.summary}\n\nSource pattern: ${analysis.stateManagementReadinessReport.sourcePattern}\n\n## Store Setups\n\n${stateManagementStoreMarkdown(analysis.stateManagementReadinessReport.storeSetups)}\n\n## Slice Definitions\n\n${stateManagementSliceMarkdown(analysis.stateManagementReadinessReport.sliceDefinitions)}\n\n## Selector Signals\n\n${stateManagementSignalMarkdown(analysis.stateManagementReadinessReport.selectorSignals, "signal")}\n\n## Side Effect Signals\n\n${stateManagementSignalMarkdown(analysis.stateManagementReadinessReport.sideEffectSignals, "signal")}\n\n## Entity Signals\n\n${stateManagementSignalMarkdown(analysis.stateManagementReadinessReport.entitySignals, "signal")}\n\n## Middleware Signals\n\n${stateManagementSignalMarkdown(analysis.stateManagementReadinessReport.middlewareSignals, "signal")}\n\n## RTK Query Signals\n\n${stateManagementSignalMarkdown(analysis.stateManagementReadinessReport.rtkQuerySignals, "signal")}\n\n## Package Signals\n\n${stateManagementSignalMarkdown(analysis.stateManagementReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.stateManagementReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.stateManagementReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.stateManagementReadinessReport.learnerNextSteps)}\n`,
    "form-readiness.md": `# Form Readiness\n\n${analysis.formReadinessReport.summary}\n\nSource pattern: ${analysis.formReadinessReport.sourcePattern}\n\n## Form Setups\n\n${formReadinessSetupMarkdown(analysis.formReadinessReport.formSetups)}\n\n## Field Registrations\n\n${formReadinessFieldMarkdown(analysis.formReadinessReport.fieldRegistrations)}\n\n## Validation Signals\n\n${formReadinessSignalMarkdown(analysis.formReadinessReport.validationSignals, "signal")}\n\n## Error Signals\n\n${formReadinessSignalMarkdown(analysis.formReadinessReport.errorSignals, "signal")}\n\n## Value Flow Signals\n\n${formReadinessSignalMarkdown(analysis.formReadinessReport.valueFlowSignals, "signal")}\n\n## Package Signals\n\n${formReadinessSignalMarkdown(analysis.formReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.formReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.formReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.formReadinessReport.learnerNextSteps)}\n`,
    "auth-readiness.md": `# Auth Readiness\n\n${analysis.authReadinessReport.summary}\n\nSource pattern: ${analysis.authReadinessReport.sourcePattern}\n\n## Auth Setups\n\n${authReadinessSetupMarkdown(analysis.authReadinessReport.authSetups)}\n\n## Session Surfaces\n\n${authReadinessSessionMarkdown(analysis.authReadinessReport.sessionSurfaces)}\n\n## Protection Signals\n\n${authReadinessSignalMarkdown(analysis.authReadinessReport.protectionSignals, "signal")}\n\n## Provider Signals\n\n${authReadinessSignalMarkdown(analysis.authReadinessReport.providerSignals, "signal")}\n\n## Callback Signals\n\n${authReadinessSignalMarkdown(analysis.authReadinessReport.callbackSignals, "signal")}\n\n## Credential Signals\n\n${authReadinessSignalMarkdown(analysis.authReadinessReport.credentialSignals, "signal")}\n\n## Package Signals\n\n${authReadinessSignalMarkdown(analysis.authReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.authReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.authReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.authReadinessReport.learnerNextSteps)}\n`,
    "authorization-readiness.md": `# Authorization Readiness\n\n${analysis.authorizationReadinessReport.summary}\n\nSource pattern: ${analysis.authorizationReadinessReport.sourcePattern}\n\n## Authorization Setups\n\n${authorizationReadinessSetupMarkdown(analysis.authorizationReadinessReport.authorizationSetups)}\n\n## Model Signals\n\n${authorizationReadinessSignalMarkdown(analysis.authorizationReadinessReport.modelSignals, "signal")}\n\n## Enforcement Signals\n\n${authorizationReadinessSignalMarkdown(analysis.authorizationReadinessReport.enforcementSignals, "signal")}\n\n## Identity Signals\n\n${authorizationReadinessSignalMarkdown(analysis.authorizationReadinessReport.identitySignals, "signal")}\n\n## Resource Signals\n\n${authorizationReadinessSignalMarkdown(analysis.authorizationReadinessReport.resourceSignals, "signal")}\n\n## Governance Signals\n\n${authorizationReadinessSignalMarkdown(analysis.authorizationReadinessReport.governanceSignals, "signal")}\n\n## Test Signals\n\n${authorizationReadinessSignalMarkdown(analysis.authorizationReadinessReport.testSignals, "signal")}\n\n## Package Signals\n\n${authorizationReadinessSignalMarkdown(analysis.authorizationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.authorizationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.authorizationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.authorizationReadinessReport.learnerNextSteps)}\n`,
    "payment-readiness.md": `# Payment Readiness\n\n${analysis.paymentReadinessReport.summary}\n\nSource pattern: ${analysis.paymentReadinessReport.sourcePattern}\n\n## Payment Setups\n\n${paymentReadinessSetupMarkdown(analysis.paymentReadinessReport.paymentSetups)}\n\n## Checkout Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.checkoutSignals, "signal")}\n\n## Webhook Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.webhookSignals, "signal")}\n\n## Customer Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.customerSignals, "signal")}\n\n## Credential Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.credentialSignals, "signal")}\n\n## Package Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.paymentReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.paymentReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.paymentReadinessReport.learnerNextSteps)}\n`,
    "email-readiness.md": `# Email Readiness\n\n${analysis.emailReadinessReport.summary}\n\nSource pattern: ${analysis.emailReadinessReport.sourcePattern}\n\n## Email Setups\n\n${emailReadinessSetupMarkdown(analysis.emailReadinessReport.emailSetups)}\n\n## Recipient Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.recipientSignals, "signal")}\n\n## Delivery Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.deliverySignals, "signal")}\n\n## Template Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.templateSignals, "signal")}\n\n## Credential Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.credentialSignals, "signal")}\n\n## Package Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.emailReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.emailReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.emailReadinessReport.learnerNextSteps)}\n`,
    "queue-readiness.md": `# Queue Readiness\n\n${analysis.queueReadinessReport.summary}\n\nSource pattern: ${analysis.queueReadinessReport.sourcePattern}\n\n## Queue Setups\n\n${queueReadinessSetupMarkdown(analysis.queueReadinessReport.queueSetups)}\n\n## Producer Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.producerSignals, "signal")}\n\n## Worker Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.workerSignals, "signal")}\n\n## Reliability Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.reliabilitySignals, "signal")}\n\n## Connection Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.connectionSignals, "signal")}\n\n## Package Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.queueReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.queueReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.queueReadinessReport.learnerNextSteps)}\n`,
    "event-stream-readiness.md": `# Event Stream Readiness\n\n${analysis.eventStreamReadinessReport.summary}\n\nSource pattern: ${analysis.eventStreamReadinessReport.sourcePattern}\n\n## Event Stream Setups\n\n${eventStreamReadinessSetupMarkdown(analysis.eventStreamReadinessReport.eventStreamSetups)}\n\n## Platform Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.platformSignals, "signal")}\n\n## Broker Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.brokerSignals, "signal")}\n\n## Topic Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.topicSignals, "signal")}\n\n## Producer Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.producerSignals, "signal")}\n\n## Consumer Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.consumerSignals, "signal")}\n\n## Schema Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.schemaSignals, "signal")}\n\n## Reliability Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.reliabilitySignals, "signal")}\n\n## Security Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.securitySignals, "signal")}\n\n## Ops Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.opsSignals, "signal")}\n\n## CI Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${eventStreamReadinessSignalMarkdown(analysis.eventStreamReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.eventStreamReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.eventStreamReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.eventStreamReadinessReport.learnerNextSteps)}\n`,
    "data-connector-readiness.md": `# Data Connector Readiness\n\n${analysis.dataConnectorReadinessReport.summary}\n\nSource pattern: ${analysis.dataConnectorReadinessReport.sourcePattern}\n\n## Connector Setups\n\n${dataConnectorReadinessSetupMarkdown(analysis.dataConnectorReadinessReport.connectorSetups)}\n\n## Platform Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.platformSignals, "signal")}\n\n## Connector Kind Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.connectorKindSignals, "signal")}\n\n## Config Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.configSignals, "signal")}\n\n## State Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.stateSignals, "signal")}\n\n## Transform Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.transformSignals, "signal")}\n\n## Ops Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.opsSignals, "signal")}\n\n## Workflow Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${dataConnectorReadinessSignalMarkdown(analysis.dataConnectorReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dataConnectorReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dataConnectorReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dataConnectorReadinessReport.learnerNextSteps)}\n`,
    "semantic-layer-readiness.md": `# Semantic Layer Readiness\n\n${analysis.semanticLayerReadinessReport.summary}\n\nSource pattern: ${analysis.semanticLayerReadinessReport.sourcePattern}\n\n## Semantic Layer Setups\n\n${semanticLayerReadinessSetupMarkdown(analysis.semanticLayerReadinessReport.semanticLayerSetups)}\n\n## Platform Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.platformSignals, "signal")}\n\n## Model Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.modelSignals, "signal")}\n\n## Metric Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.metricSignals, "signal")}\n\n## Dimension Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.dimensionSignals, "signal")}\n\n## Entity Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.entitySignals, "signal")}\n\n## Query Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.querySignals, "signal")}\n\n## Cache Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.cacheSignals, "signal")}\n\n## Access Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.accessSignals, "signal")}\n\n## Workflow Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${semanticLayerReadinessSignalMarkdown(analysis.semanticLayerReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.semanticLayerReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.semanticLayerReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.semanticLayerReadinessReport.learnerNextSteps)}\n`,
    "bi-dashboard-readiness.md": `# BI Dashboard Readiness\n\n${analysis.biDashboardReadinessReport.summary}\n\nSource pattern: ${analysis.biDashboardReadinessReport.sourcePattern}\n\n## Dashboard Setups\n\n${biDashboardReadinessSetupMarkdown(analysis.biDashboardReadinessReport.dashboardSetups)}\n\n## Platform Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.platformSignals, "signal")}\n\n## Dashboard Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.dashboardSignals, "signal")}\n\n## Query Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.querySignals, "signal")}\n\n## Filter Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.filterSignals, "signal")}\n\n## Access Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.accessSignals, "signal")}\n\n## Embedding Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.embeddingSignals, "signal")}\n\n## Alert Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.alertSignals, "signal")}\n\n## Cache Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.cacheSignals, "signal")}\n\n## Workflow Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${biDashboardReadinessSignalMarkdown(analysis.biDashboardReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.biDashboardReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.biDashboardReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.biDashboardReadinessReport.learnerNextSteps)}\n`,
    "stream-processing-readiness.md": `# Stream Processing Readiness\n\n${analysis.streamProcessingReadinessReport.summary}\n\nSource pattern: ${analysis.streamProcessingReadinessReport.sourcePattern}\n\n## Stream Processing Setups\n\n${streamProcessingReadinessSetupMarkdown(analysis.streamProcessingReadinessReport.streamProcessingSetups)}\n\n## Engine Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.engineSignals, "signal")}\n\n## Job Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.jobSignals, "signal")}\n\n## Source Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.sourceSignals, "signal")}\n\n## Transform Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.transformSignals, "signal")}\n\n## Window Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.windowSignals, "signal")}\n\n## Watermark Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.watermarkSignals, "signal")}\n\n## State Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.stateSignals, "signal")}\n\n## Checkpoint Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.checkpointSignals, "signal")}\n\n## Sink Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.sinkSignals, "signal")}\n\n## Deployment Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.deploymentSignals, "signal")}\n\n## Monitoring Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.monitoringSignals, "signal")}\n\n## CI Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${streamProcessingReadinessSignalMarkdown(analysis.streamProcessingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.streamProcessingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.streamProcessingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.streamProcessingReadinessReport.learnerNextSteps)}\n`,
    "pipeline-orchestration-readiness.md": `# Pipeline Orchestration Readiness\n\n${analysis.pipelineOrchestrationReadinessReport.summary}\n\nSource pattern: ${analysis.pipelineOrchestrationReadinessReport.sourcePattern}\n\n## Pipeline Orchestration Setups\n\n${pipelineOrchestrationReadinessSetupMarkdown(analysis.pipelineOrchestrationReadinessReport.pipelineOrchestrationSetups)}\n\n## Orchestrator Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.orchestratorSignals, "signal")}\n\n## DAG Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.dagSignals, "signal")}\n\n## Task Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.taskSignals, "signal")}\n\n## Dependency Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.dependencySignals, "signal")}\n\n## Schedule Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.scheduleSignals, "signal")}\n\n## Sensor Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.sensorSignals, "signal")}\n\n## Asset Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.assetSignals, "signal")}\n\n## Partition Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.partitionSignals, "signal")}\n\n## Reliability Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.reliabilitySignals, "signal")}\n\n## Executor Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.executorSignals, "signal")}\n\n## Deployment Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.deploymentSignals, "signal")}\n\n## Observability Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.observabilitySignals, "signal")}\n\n## CI Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${pipelineOrchestrationReadinessSignalMarkdown(analysis.pipelineOrchestrationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.pipelineOrchestrationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.pipelineOrchestrationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.pipelineOrchestrationReadinessReport.learnerNextSteps)}\n`,
    "service-mesh-readiness.md": `# Service Mesh Readiness\n\n${analysis.serviceMeshReadinessReport.summary}\n\nSource pattern: ${analysis.serviceMeshReadinessReport.sourcePattern}\n\n## Service Mesh Setups\n\n${serviceMeshReadinessSetupMarkdown(analysis.serviceMeshReadinessReport.serviceMeshSetups)}\n\n## Mesh Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.meshSignals, "signal")}\n\n## Control Plane Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.controlPlaneSignals, "signal")}\n\n## Injection Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.injectionSignals, "signal")}\n\n## Traffic Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.trafficSignals, "signal")}\n\n## Security Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.securitySignals, "signal")}\n\n## mTLS Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.mtlsSignals, "signal")}\n\n## Resilience Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.resilienceSignals, "signal")}\n\n## Gateway Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.gatewaySignals, "signal")}\n\n## Telemetry Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.telemetrySignals, "signal")}\n\n## Multicluster Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.multiclusterSignals, "signal")}\n\n## CI Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${serviceMeshReadinessSignalMarkdown(analysis.serviceMeshReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.serviceMeshReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.serviceMeshReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.serviceMeshReadinessReport.learnerNextSteps)}\n`,
    "ingress-controller-readiness.md": `# Ingress Controller Readiness\n\n${analysis.ingressControllerReadinessReport.summary}\n\nSource pattern: ${analysis.ingressControllerReadinessReport.sourcePattern}\n\n## Ingress Controller Setups\n\n${ingressControllerReadinessSetupMarkdown(analysis.ingressControllerReadinessReport.ingressControllerSetups)}\n\n## Controller Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.controllerSignals, "signal")}\n\n## Ingress Class Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.ingressClassSignals, "signal")}\n\n## Route Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.routeSignals, "signal")}\n\n## Service Exposure Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.serviceExposureSignals, "signal")}\n\n## TLS Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.tlsSignals, "signal")}\n\n## Middleware Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.middlewareSignals, "signal")}\n\n## Policy Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.policySignals, "signal")}\n\n## Load Balancing Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.loadBalancingSignals, "signal")}\n\n## Observability Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.observabilitySignals, "signal")}\n\n## Admission Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.admissionSignals, "signal")}\n\n## CI Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${ingressControllerReadinessSignalMarkdown(analysis.ingressControllerReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.ingressControllerReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.ingressControllerReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.ingressControllerReadinessReport.learnerNextSteps)}\n`,
    "dns-readiness.md": `# DNS Readiness\n\n${analysis.dnsReadinessReport.summary}\n\nSource pattern: ${analysis.dnsReadinessReport.sourcePattern}\n\n## DNS Setups\n\n${dnsReadinessSetupMarkdown(analysis.dnsReadinessReport.dnsSetups)}\n\n## Provider Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.providerSignals, "signal")}\n\n## Source Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.sourceSignals, "signal")}\n\n## Zone Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.zoneSignals, "signal")}\n\n## Record Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.recordSignals, "signal")}\n\n## Ownership Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.ownershipSignals, "signal")}\n\n## CoreDNS Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.coreDnsSignals, "signal")}\n\n## Automation Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.automationSignals, "signal")}\n\n## Observability Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.observabilitySignals, "signal")}\n\n## CI Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${dnsReadinessSignalMarkdown(analysis.dnsReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dnsReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dnsReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dnsReadinessReport.learnerNextSteps)}\n`,
    "certificate-readiness.md": `# Certificate Readiness\n\n${analysis.certificateReadinessReport.summary}\n\nSource pattern: ${analysis.certificateReadinessReport.sourcePattern}\n\n## Certificate Setups\n\n${certificateReadinessSetupMarkdown(analysis.certificateReadinessReport.certificateSetups)}\n\n## Platform Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.platformSignals, "signal")}\n\n## Resource Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.resourceSignals, "signal")}\n\n## Issuer Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.issuerSignals, "signal")}\n\n## Challenge Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.challengeSignals, "signal")}\n\n## Lifecycle Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.lifecycleSignals, "signal")}\n\n## Trust Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.trustSignals, "signal")}\n\n## Revocation Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.revocationSignals, "signal")}\n\n## Automation Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.automationSignals, "signal")}\n\n## Observability Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.observabilitySignals, "signal")}\n\n## CI Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${certificateReadinessSignalMarkdown(analysis.certificateReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.certificateReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.certificateReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.certificateReadinessReport.learnerNextSteps)}\n`,
    "helm-readiness.md": `# Helm Readiness\n\n${analysis.helmReadinessReport.summary}\n\nSource pattern: ${analysis.helmReadinessReport.sourcePattern}\n\n## Helm Setups\n\n${helmReadinessSetupMarkdown(analysis.helmReadinessReport.helmSetups)}\n\n## Chart Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.chartSignals, "signal")}\n\n## Template Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.templateSignals, "signal")}\n\n## Values Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.valuesSignals, "signal")}\n\n## Dependency Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.dependencySignals, "signal")}\n\n## Validation Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.validationSignals, "signal")}\n\n## Release Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.releaseSignals, "signal")}\n\n## Security Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.securitySignals, "signal")}\n\n## CI Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${helmReadinessSignalMarkdown(analysis.helmReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.helmReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.helmReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.helmReadinessReport.learnerNextSteps)}\n`,
    "admission-policy-readiness.md": `# Admission Policy Readiness\n\n${analysis.admissionPolicyReadinessReport.summary}\n\nSource pattern: ${analysis.admissionPolicyReadinessReport.sourcePattern}\n\n## Admission Setups\n\n${admissionPolicyReadinessSetupMarkdown(analysis.admissionPolicyReadinessReport.admissionSetups)}\n\n## Controller Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.controllerSignals, "signal")}\n\n## Policy Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.policySignals, "signal")}\n\n## Rule Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.ruleSignals, "signal")}\n\n## Enforcement Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.enforcementSignals, "signal")}\n\n## Exception Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.exceptionSignals, "signal")}\n\n## Validation Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.validationSignals, "signal")}\n\n## Observability Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.observabilitySignals, "signal")}\n\n## CI Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${admissionPolicyReadinessSignalMarkdown(analysis.admissionPolicyReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.admissionPolicyReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.admissionPolicyReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.admissionPolicyReadinessReport.learnerNextSteps)}\n`,
    "api-gateway-readiness.md": `# API Gateway Readiness\n\n${analysis.apiGatewayReadinessReport.summary}\n\nSource pattern: ${analysis.apiGatewayReadinessReport.sourcePattern}\n\n## API Gateway Setups\n\n${apiGatewayReadinessSetupMarkdown(analysis.apiGatewayReadinessReport.apiGatewaySetups)}\n\n## Gateway Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.gatewaySignals, "signal")}\n\n## Route Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.routeSignals, "signal")}\n\n## Upstream Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.upstreamSignals, "signal")}\n\n## Auth Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.authSignals, "signal")}\n\n## Plugin Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.pluginSignals, "signal")}\n\n## Traffic Policy Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.trafficPolicySignals, "signal")}\n\n## Observability Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.observabilitySignals, "signal")}\n\n## Validation Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.validationSignals, "signal")}\n\n## CI Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${apiGatewayReadinessSignalMarkdown(analysis.apiGatewayReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.apiGatewayReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.apiGatewayReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.apiGatewayReadinessReport.learnerNextSteps)}\n`,
    "cache-readiness.md": `# Cache Readiness\n\n${analysis.cacheReadinessReport.summary}\n\nSource pattern: ${analysis.cacheReadinessReport.sourcePattern}\n\n## Cache Setups\n\n${cacheReadinessSetupMarkdown(analysis.cacheReadinessReport.cacheSetups)}\n\n## Operation Signals\n\n${cacheReadinessSignalMarkdown(analysis.cacheReadinessReport.operationSignals, "signal")}\n\n## Policy Signals\n\n${cacheReadinessSignalMarkdown(analysis.cacheReadinessReport.policySignals, "signal")}\n\n## Connection Signals\n\n${cacheReadinessSignalMarkdown(analysis.cacheReadinessReport.connectionSignals, "signal")}\n\n## Advanced Signals\n\n${cacheReadinessSignalMarkdown(analysis.cacheReadinessReport.advancedSignals, "signal")}\n\n## Package Signals\n\n${cacheReadinessSignalMarkdown(analysis.cacheReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.cacheReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.cacheReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.cacheReadinessReport.learnerNextSteps)}\n`,
    "logging-readiness.md": `# Logging Readiness\n\n${analysis.loggingReadinessReport.summary}\n\nSource pattern: ${analysis.loggingReadinessReport.sourcePattern}\n\n## Logging Setups\n\n${loggingReadinessSetupMarkdown(analysis.loggingReadinessReport.loggingSetups)}\n\n## Level Signals\n\n${loggingReadinessSignalMarkdown(analysis.loggingReadinessReport.levelSignals, "signal")}\n\n## Context Signals\n\n${loggingReadinessSignalMarkdown(analysis.loggingReadinessReport.contextSignals, "signal")}\n\n## Safety Signals\n\n${loggingReadinessSignalMarkdown(analysis.loggingReadinessReport.safetySignals, "signal")}\n\n## Transport Signals\n\n${loggingReadinessSignalMarkdown(analysis.loggingReadinessReport.transportSignals, "signal")}\n\n## Package Signals\n\n${loggingReadinessSignalMarkdown(analysis.loggingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.loggingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.loggingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.loggingReadinessReport.learnerNextSteps)}\n`,
    "feature-flag-readiness.md": `# Feature Flag Readiness\n\n${analysis.featureFlagReadinessReport.summary}\n\nSource pattern: ${analysis.featureFlagReadinessReport.sourcePattern}\n\n## Feature Flag Setups\n\n${featureFlagReadinessSetupMarkdown(analysis.featureFlagReadinessReport.featureFlagSetups)}\n\n## Evaluation Signals\n\n${featureFlagReadinessSignalMarkdown(analysis.featureFlagReadinessReport.evaluationSignals, "signal")}\n\n## Context Signals\n\n${featureFlagReadinessSignalMarkdown(analysis.featureFlagReadinessReport.contextSignals, "signal")}\n\n## Lifecycle Signals\n\n${featureFlagReadinessSignalMarkdown(analysis.featureFlagReadinessReport.lifecycleSignals, "signal")}\n\n## Package Signals\n\n${featureFlagReadinessSignalMarkdown(analysis.featureFlagReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.featureFlagReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.featureFlagReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.featureFlagReadinessReport.learnerNextSteps)}\n`,
    "rate-limit-readiness.md": `# Rate Limit Readiness\n\n${analysis.rateLimitReadinessReport.summary}\n\nSource pattern: ${analysis.rateLimitReadinessReport.sourcePattern}\n\n## Rate Limit Setups\n\n${rateLimitReadinessSetupMarkdown(analysis.rateLimitReadinessReport.rateLimitSetups)}\n\n## Quota Signals\n\n${rateLimitReadinessSignalMarkdown(analysis.rateLimitReadinessReport.quotaSignals, "signal")}\n\n## Identity Signals\n\n${rateLimitReadinessSignalMarkdown(analysis.rateLimitReadinessReport.identitySignals, "signal")}\n\n## Store Signals\n\n${rateLimitReadinessSignalMarkdown(analysis.rateLimitReadinessReport.storeSignals, "signal")}\n\n## Response Signals\n\n${rateLimitReadinessSignalMarkdown(analysis.rateLimitReadinessReport.responseSignals, "signal")}\n\n## Resilience Signals\n\n${rateLimitReadinessSignalMarkdown(analysis.rateLimitReadinessReport.resilienceSignals, "signal")}\n\n## Package Signals\n\n${rateLimitReadinessSignalMarkdown(analysis.rateLimitReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.rateLimitReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.rateLimitReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.rateLimitReadinessReport.learnerNextSteps)}\n`,
    "error-tracking-readiness.md": `# Error Tracking Readiness\n\n${analysis.errorTrackingReadinessReport.summary}\n\nSource pattern: ${analysis.errorTrackingReadinessReport.sourcePattern}\n\n## Error Tracking Setups\n\n${errorTrackingReadinessSetupMarkdown(analysis.errorTrackingReadinessReport.errorTrackingSetups)}\n\n## Capture Signals\n\n${errorTrackingReadinessSignalMarkdown(analysis.errorTrackingReadinessReport.captureSignals, "signal")}\n\n## Context Signals\n\n${errorTrackingReadinessSignalMarkdown(analysis.errorTrackingReadinessReport.contextSignals, "signal")}\n\n## Filtering Signals\n\n${errorTrackingReadinessSignalMarkdown(analysis.errorTrackingReadinessReport.filteringSignals, "signal")}\n\n## Observability Signals\n\n${errorTrackingReadinessSignalMarkdown(analysis.errorTrackingReadinessReport.observabilitySignals, "signal")}\n\n## Package Signals\n\n${errorTrackingReadinessSignalMarkdown(analysis.errorTrackingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.errorTrackingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.errorTrackingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.errorTrackingReadinessReport.learnerNextSteps)}\n`,
    "analytics-readiness.md": `# Analytics Readiness\n\n${analysis.analyticsReadinessReport.summary}\n\nSource pattern: ${analysis.analyticsReadinessReport.sourcePattern}\n\n## Analytics Setups\n\n${analyticsReadinessSetupMarkdown(analysis.analyticsReadinessReport.analyticsSetups)}\n\n## Event Signals\n\n${analyticsReadinessSignalMarkdown(analysis.analyticsReadinessReport.eventSignals, "signal")}\n\n## Identity Signals\n\n${analyticsReadinessSignalMarkdown(analysis.analyticsReadinessReport.identitySignals, "signal")}\n\n## Privacy Signals\n\n${analyticsReadinessSignalMarkdown(analysis.analyticsReadinessReport.privacySignals, "signal")}\n\n## Product Signals\n\n${analyticsReadinessSignalMarkdown(analysis.analyticsReadinessReport.productSignals, "signal")}\n\n## Package Signals\n\n${analyticsReadinessSignalMarkdown(analysis.analyticsReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.analyticsReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.analyticsReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.analyticsReadinessReport.learnerNextSteps)}\n`,
    "http-client-readiness.md": `# HTTP Client Readiness\n\n${analysis.httpClientReadinessReport.summary}\n\nSource pattern: ${analysis.httpClientReadinessReport.sourcePattern}\n\n## HTTP Client Setups\n\n${httpClientReadinessSetupMarkdown(analysis.httpClientReadinessReport.httpClientSetups)}\n\n## Request Signals\n\n${httpClientReadinessSignalMarkdown(analysis.httpClientReadinessReport.requestSignals, "signal")}\n\n## Resilience Signals\n\n${httpClientReadinessSignalMarkdown(analysis.httpClientReadinessReport.resilienceSignals, "signal")}\n\n## Configuration Signals\n\n${httpClientReadinessSignalMarkdown(analysis.httpClientReadinessReport.configurationSignals, "signal")}\n\n## Transport Signals\n\n${httpClientReadinessSignalMarkdown(analysis.httpClientReadinessReport.transportSignals, "signal")}\n\n## Error Signals\n\n${httpClientReadinessSignalMarkdown(analysis.httpClientReadinessReport.errorSignals, "signal")}\n\n## Package Signals\n\n${httpClientReadinessSignalMarkdown(analysis.httpClientReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.httpClientReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.httpClientReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.httpClientReadinessReport.learnerNextSteps)}\n`,
    "schema-validation-readiness.md": `# Schema Validation Readiness\n\n${analysis.schemaValidationReadinessReport.summary}\n\nSource pattern: ${analysis.schemaValidationReadinessReport.sourcePattern}\n\n## Schema Setups\n\n${schemaValidationReadinessSetupMarkdown(analysis.schemaValidationReadinessReport.schemaSetups)}\n\n## Shape Signals\n\n${schemaValidationReadinessSignalMarkdown(analysis.schemaValidationReadinessReport.shapeSignals, "signal")}\n\n## Parser Signals\n\n${schemaValidationReadinessSignalMarkdown(analysis.schemaValidationReadinessReport.parserSignals, "signal")}\n\n## Type Signals\n\n${schemaValidationReadinessSignalMarkdown(analysis.schemaValidationReadinessReport.typeSignals, "signal")}\n\n## Refinement Signals\n\n${schemaValidationReadinessSignalMarkdown(analysis.schemaValidationReadinessReport.refinementSignals, "signal")}\n\n## Error Signals\n\n${schemaValidationReadinessSignalMarkdown(analysis.schemaValidationReadinessReport.errorSignals, "signal")}\n\n## Integration Signals\n\n${schemaValidationReadinessSignalMarkdown(analysis.schemaValidationReadinessReport.integrationSignals, "signal")}\n\n## Package Signals\n\n${schemaValidationReadinessSignalMarkdown(analysis.schemaValidationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.schemaValidationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.schemaValidationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.schemaValidationReadinessReport.learnerNextSteps)}\n`,
    "datetime-readiness.md": `# Datetime Readiness\n\n${analysis.dateTimeReadinessReport.summary}\n\nSource pattern: ${analysis.dateTimeReadinessReport.sourcePattern}\n\n## DateTime Setups\n\n${dateTimeReadinessSetupMarkdown(analysis.dateTimeReadinessReport.dateTimeSetups)}\n\n## Construction Signals\n\n${dateTimeReadinessSignalMarkdown(analysis.dateTimeReadinessReport.constructionSignals, "signal")}\n\n## Parsing Signals\n\n${dateTimeReadinessSignalMarkdown(analysis.dateTimeReadinessReport.parsingSignals, "signal")}\n\n## Formatting Signals\n\n${dateTimeReadinessSignalMarkdown(analysis.dateTimeReadinessReport.formattingSignals, "signal")}\n\n## Zone Signals\n\n${dateTimeReadinessSignalMarkdown(analysis.dateTimeReadinessReport.zoneSignals, "signal")}\n\n## Duration Signals\n\n${dateTimeReadinessSignalMarkdown(analysis.dateTimeReadinessReport.durationSignals, "signal")}\n\n## Validity Signals\n\n${dateTimeReadinessSignalMarkdown(analysis.dateTimeReadinessReport.validitySignals, "signal")}\n\n## Package Signals\n\n${dateTimeReadinessSignalMarkdown(analysis.dateTimeReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dateTimeReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dateTimeReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dateTimeReadinessReport.learnerNextSteps)}\n`,
    "id-generation-readiness.md": `# ID Generation Readiness\n\n${analysis.idGenerationReadinessReport.summary}\n\nSource pattern: ${analysis.idGenerationReadinessReport.sourcePattern}\n\n## ID Generator Setups\n\n${idGenerationReadinessSetupMarkdown(analysis.idGenerationReadinessReport.idGeneratorSetups)}\n\n## Generation Signals\n\n${idGenerationReadinessSignalMarkdown(analysis.idGenerationReadinessReport.generationSignals, "signal")}\n\n## Entropy Signals\n\n${idGenerationReadinessSignalMarkdown(analysis.idGenerationReadinessReport.entropySignals, "signal")}\n\n## Alphabet Signals\n\n${idGenerationReadinessSignalMarkdown(analysis.idGenerationReadinessReport.alphabetSignals, "signal")}\n\n## Runtime Signals\n\n${idGenerationReadinessSignalMarkdown(analysis.idGenerationReadinessReport.runtimeSignals, "signal")}\n\n## Usage Signals\n\n${idGenerationReadinessSignalMarkdown(analysis.idGenerationReadinessReport.usageSignals, "signal")}\n\n## Validation Signals\n\n${idGenerationReadinessSignalMarkdown(analysis.idGenerationReadinessReport.validationSignals, "signal")}\n\n## Package Signals\n\n${idGenerationReadinessSignalMarkdown(analysis.idGenerationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.idGenerationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.idGenerationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.idGenerationReadinessReport.learnerNextSteps)}\n`,
    "image-processing-readiness.md": `# Image Processing Readiness\n\n${analysis.imageProcessingReadinessReport.summary}\n\nSource pattern: ${analysis.imageProcessingReadinessReport.sourcePattern}\n\n## Image Processing Setups\n\n${imageProcessingReadinessSetupMarkdown(analysis.imageProcessingReadinessReport.imageProcessingSetups)}\n\n## Input Signals\n\n${imageProcessingReadinessSignalMarkdown(analysis.imageProcessingReadinessReport.inputSignals, "signal")}\n\n## Transform Signals\n\n${imageProcessingReadinessSignalMarkdown(analysis.imageProcessingReadinessReport.transformSignals, "signal")}\n\n## Output Signals\n\n${imageProcessingReadinessSignalMarkdown(analysis.imageProcessingReadinessReport.outputSignals, "signal")}\n\n## Safety Signals\n\n${imageProcessingReadinessSignalMarkdown(analysis.imageProcessingReadinessReport.safetySignals, "signal")}\n\n## Performance Signals\n\n${imageProcessingReadinessSignalMarkdown(analysis.imageProcessingReadinessReport.performanceSignals, "signal")}\n\n## Package Signals\n\n${imageProcessingReadinessSignalMarkdown(analysis.imageProcessingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.imageProcessingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.imageProcessingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.imageProcessingReadinessReport.learnerNextSteps)}\n`,
    "file-upload-readiness.md": `# File Upload Readiness\n\n${analysis.fileUploadReadinessReport.summary}\n\nSource pattern: ${analysis.fileUploadReadinessReport.sourcePattern}\n\n## File Upload Setups\n\n${fileUploadReadinessSetupMarkdown(analysis.fileUploadReadinessReport.fileUploadSetups)}\n\n## Input Signals\n\n${fileUploadReadinessSignalMarkdown(analysis.fileUploadReadinessReport.inputSignals, "signal")}\n\n## Restriction Signals\n\n${fileUploadReadinessSignalMarkdown(analysis.fileUploadReadinessReport.restrictionSignals, "signal")}\n\n## Transport Signals\n\n${fileUploadReadinessSignalMarkdown(analysis.fileUploadReadinessReport.transportSignals, "signal")}\n\n## Lifecycle Signals\n\n${fileUploadReadinessSignalMarkdown(analysis.fileUploadReadinessReport.lifecycleSignals, "signal")}\n\n## Safety Signals\n\n${fileUploadReadinessSignalMarkdown(analysis.fileUploadReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${fileUploadReadinessSignalMarkdown(analysis.fileUploadReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.fileUploadReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.fileUploadReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.fileUploadReadinessReport.learnerNextSteps)}\n`,
    "websocket-readiness.md": `# WebSocket Readiness\n\n${analysis.webSocketReadinessReport.summary}\n\nSource pattern: ${analysis.webSocketReadinessReport.sourcePattern}\n\n## WebSocket Setups\n\n${webSocketReadinessSetupMarkdown(analysis.webSocketReadinessReport.webSocketSetups)}\n\n## Connection Signals\n\n${webSocketReadinessSignalMarkdown(analysis.webSocketReadinessReport.connectionSignals, "signal")}\n\n## Message Signals\n\n${webSocketReadinessSignalMarkdown(analysis.webSocketReadinessReport.messageSignals, "signal")}\n\n## Lifecycle Signals\n\n${webSocketReadinessSignalMarkdown(analysis.webSocketReadinessReport.lifecycleSignals, "signal")}\n\n## Safety Signals\n\n${webSocketReadinessSignalMarkdown(analysis.webSocketReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${webSocketReadinessSignalMarkdown(analysis.webSocketReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.webSocketReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.webSocketReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.webSocketReadinessReport.learnerNextSteps)}\n`,
    "realtime-media-readiness.md": `# Realtime Media Readiness\n\n${analysis.realtimeMediaReadinessReport.summary}\n\nSource pattern: ${analysis.realtimeMediaReadinessReport.sourcePattern}\n\n## Media Setups\n\n${realtimeMediaReadinessSetupMarkdown(analysis.realtimeMediaReadinessReport.mediaSetups)}\n\n## Platform Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.platformSignals, "signal")}\n\n## Room Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.roomSignals, "signal")}\n\n## Device Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.deviceSignals, "signal")}\n\n## Track Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.trackSignals, "signal")}\n\n## Transport Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.transportSignals, "signal")}\n\n## Data Channel Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.dataChannelSignals, "signal")}\n\n## Quality Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.qualitySignals, "signal")}\n\n## Security Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.securitySignals, "signal")}\n\n## Workflow Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${realtimeMediaReadinessSignalMarkdown(analysis.realtimeMediaReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.realtimeMediaReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.realtimeMediaReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.realtimeMediaReadinessReport.learnerNextSteps)}\n`,
    "pdf-generation-readiness.md": `# PDF Generation Readiness\n\n${analysis.pdfGenerationReadinessReport.summary}\n\nSource pattern: ${analysis.pdfGenerationReadinessReport.sourcePattern}\n\n## PDF Generation Setups\n\n${pdfGenerationReadinessSetupMarkdown(analysis.pdfGenerationReadinessReport.pdfGenerationSetups)}\n\n## Document Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.documentSignals, "signal")}\n\n## Page Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.pageSignals, "signal")}\n\n## Asset Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.assetSignals, "signal")}\n\n## Form Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.formSignals, "signal")}\n\n## Output Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.outputSignals, "signal")}\n\n## Safety Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.pdfGenerationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.pdfGenerationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.pdfGenerationReadinessReport.learnerNextSteps)}\n`,
    "spreadsheet-readiness.md": `# Spreadsheet Readiness\n\n${analysis.spreadsheetReadinessReport.summary}\n\nSource pattern: ${analysis.spreadsheetReadinessReport.sourcePattern}\n\n## Spreadsheet Setups\n\n${spreadsheetReadinessSetupMarkdown(analysis.spreadsheetReadinessReport.spreadsheetSetups)}\n\n## Workbook Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.workbookSignals, "signal")}\n\n## Sheet Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.sheetSignals, "signal")}\n\n## Format Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.formatSignals, "signal")}\n\n## Input Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.inputSignals, "signal")}\n\n## Output Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.outputSignals, "signal")}\n\n## Safety Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.spreadsheetReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.spreadsheetReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.spreadsheetReadinessReport.learnerNextSteps)}\n`,
    "chart-visualization-readiness.md": `# Chart Visualization Readiness\n\n${analysis.chartVisualizationReadinessReport.summary}\n\nSource pattern: ${analysis.chartVisualizationReadinessReport.sourcePattern}\n\n## Chart Setups\n\n${chartVisualizationReadinessSetupMarkdown(analysis.chartVisualizationReadinessReport.chartSetups)}\n\n## Chart Type Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.chartTypeSignals, "signal")}\n\n## Data Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.dataSignals, "signal")}\n\n## Scale Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.scaleSignals, "signal")}\n\n## Interaction Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.interactionSignals, "signal")}\n\n## Render Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.renderSignals, "signal")}\n\n## Lifecycle Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.lifecycleSignals, "signal")}\n\n## Safety Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.chartVisualizationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.chartVisualizationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.chartVisualizationReadinessReport.learnerNextSteps)}\n`,
    "notebook-readiness.md": `# Notebook Readiness\n\n${analysis.notebookReadinessReport.summary}\n\nSource pattern: ${analysis.notebookReadinessReport.sourcePattern}\n\n## Notebook Setups\n\n${notebookReadinessSetupMarkdown(analysis.notebookReadinessReport.notebookSetups)}\n\n## Platform Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.platformSignals, "signal")}\n\n## File Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.fileSignals, "signal")}\n\n## Kernel Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.kernelSignals, "signal")}\n\n## Execution Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.executionSignals, "signal")}\n\n## Dependency Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.dependencySignals, "signal")}\n\n## Interactivity Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.interactivitySignals, "signal")}\n\n## Export Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.exportSignals, "signal")}\n\n## Reproducibility Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.reproducibilitySignals, "signal")}\n\n## Workflow Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${notebookReadinessSignalMarkdown(analysis.notebookReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.notebookReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.notebookReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.notebookReadinessReport.learnerNextSteps)}\n`,
    "map-visualization-readiness.md": `# Map Visualization Readiness\n\n${analysis.mapVisualizationReadinessReport.summary}\n\nSource pattern: ${analysis.mapVisualizationReadinessReport.sourcePattern}\n\n## Map Setups\n\n${mapVisualizationReadinessSetupMarkdown(analysis.mapVisualizationReadinessReport.mapSetups)}\n\n## Platform Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.platformSignals, "signal")}\n\n## Container Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.containerSignals, "signal")}\n\n## Tile Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.tileSignals, "signal")}\n\n## Layer Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.layerSignals, "signal")}\n\n## Data Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.dataSignals, "signal")}\n\n## Viewport Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.viewportSignals, "signal")}\n\n## Interaction Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.interactionSignals, "signal")}\n\n## Control Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.controlSignals, "signal")}\n\n## Style Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.styleSignals, "signal")}\n\n## Workflow Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${mapVisualizationReadinessSignalMarkdown(analysis.mapVisualizationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.mapVisualizationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.mapVisualizationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.mapVisualizationReadinessReport.learnerNextSteps)}\n`,
    "diagram-rendering-readiness.md": `# Diagram Rendering Readiness\n\n${analysis.diagramRenderingReadinessReport.summary}\n\nSource pattern: ${analysis.diagramRenderingReadinessReport.sourcePattern}\n\n## Diagram Setups\n\n${diagramRenderingReadinessSetupMarkdown(analysis.diagramRenderingReadinessReport.diagramSetups)}\n\n## Diagram Type Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.diagramTypeSignals, "signal")}\n\n## Render Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.renderSignals, "signal")}\n\n## Theme Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.themeSignals, "signal")}\n\n## Security Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.securitySignals, "signal")}\n\n## Layout Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.layoutSignals, "signal")}\n\n## Output Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.outputSignals, "signal")}\n\n## Package Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.diagramRenderingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.diagramRenderingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.diagramRenderingReadinessReport.learnerNextSteps)}\n`,
    "link-integrity-readiness.md": `# Link Integrity Readiness\n\n${analysis.linkIntegrityReadinessReport.summary}\n\nSource pattern: ${analysis.linkIntegrityReadinessReport.sourcePattern}\n\n## Link Setups\n\n${linkIntegrityReadinessSetupMarkdown(analysis.linkIntegrityReadinessReport.linkSetups)}\n\n## Target Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.targetSignals, "signal")}\n\n## Policy Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.policySignals, "signal")}\n\n## Network Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.networkSignals, "signal")}\n\n## Output Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.outputSignals, "signal")}\n\n## CI Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.linkIntegrityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.linkIntegrityReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.linkIntegrityReadinessReport.learnerNextSteps)}\n`,
    "seo-metadata-readiness.md": `# SEO Metadata Readiness\n\n${analysis.seoMetadataReadinessReport.summary}\n\nSource pattern: ${analysis.seoMetadataReadinessReport.sourcePattern}\n\n## SEO Setups\n\n${seoMetadataReadinessSetupMarkdown(analysis.seoMetadataReadinessReport.seoSetups)}\n\n## Crawl Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.crawlSignals, "signal")}\n\n## Sitemap Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.sitemapSignals, "signal")}\n\n## Metadata Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.metadataSignals, "signal")}\n\n## Structured Data Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.structuredDataSignals, "signal")}\n\n## AI Readiness Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.aiReadinessSignals, "signal")}\n\n## Package Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.seoMetadataReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.seoMetadataReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.seoMetadataReadinessReport.learnerNextSteps)}\n`,
    "pwa-readiness.md": `# PWA Readiness\n\n${analysis.pwaReadinessReport.summary}\n\nSource pattern: ${analysis.pwaReadinessReport.sourcePattern}\n\n## PWA Setups\n\n${pwaReadinessSetupMarkdown(analysis.pwaReadinessReport.pwaSetups)}\n\n## Manifest Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.manifestSignals, "signal")}\n\n## Service Worker Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.serviceWorkerSignals, "signal")}\n\n## Caching Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.cachingSignals, "signal")}\n\n## Update Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.updateSignals, "signal")}\n\n## Install Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.installSignals, "signal")}\n\n## Package Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.pwaReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.pwaReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.pwaReadinessReport.learnerNextSteps)}\n`,
    "browser-compat-readiness.md": `# Browser Compatibility Readiness\n\n${analysis.browserCompatibilityReadinessReport.summary}\n\nSource pattern: ${analysis.browserCompatibilityReadinessReport.sourcePattern}\n\n## Compatibility Setups\n\n${browserCompatibilityReadinessSetupMarkdown(analysis.browserCompatibilityReadinessReport.compatibilitySetups)}\n\n## Config Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.configSignals, "signal")}\n\n## Query Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.querySignals, "signal")}\n\n## Coverage Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.coverageSignals, "signal")}\n\n## Feature Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.featureSignals, "signal")}\n\n## Update Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.updateSignals, "signal")}\n\n## Package Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.browserCompatibilityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.browserCompatibilityReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.browserCompatibilityReadinessReport.learnerNextSteps)}\n`,
    "browser-extension-readiness.md": `# Browser Extension Readiness\n\n${analysis.browserExtensionReadinessReport.summary}\n\nSource pattern: ${analysis.browserExtensionReadinessReport.sourcePattern}\n\n## Extension Setups\n\n${browserExtensionReadinessSetupMarkdown(analysis.browserExtensionReadinessReport.extensionSetups)}\n\n## Manifest Signals\n\n${browserExtensionReadinessSignalMarkdown(analysis.browserExtensionReadinessReport.manifestSignals, "signal")}\n\n## Entrypoint Signals\n\n${browserExtensionReadinessSignalMarkdown(analysis.browserExtensionReadinessReport.entrypointSignals, "signal")}\n\n## Permission Signals\n\n${browserExtensionReadinessSignalMarkdown(analysis.browserExtensionReadinessReport.permissionSignals, "signal")}\n\n## Messaging Signals\n\n${browserExtensionReadinessSignalMarkdown(analysis.browserExtensionReadinessReport.messagingSignals, "signal")}\n\n## Build Signals\n\n${browserExtensionReadinessSignalMarkdown(analysis.browserExtensionReadinessReport.buildSignals, "signal")}\n\n## Publish Signals\n\n${browserExtensionReadinessSignalMarkdown(analysis.browserExtensionReadinessReport.publishSignals, "signal")}\n\n## Package Signals\n\n${browserExtensionReadinessSignalMarkdown(analysis.browserExtensionReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.browserExtensionReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.browserExtensionReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.browserExtensionReadinessReport.learnerNextSteps)}\n`,
    "env-validation-readiness.md": `# Env Validation Readiness\n\n${analysis.envValidationReadinessReport.summary}\n\nSource pattern: ${analysis.envValidationReadinessReport.sourcePattern}\n\n## Env Setups\n\n${envValidationReadinessSetupMarkdown(analysis.envValidationReadinessReport.envSetups)}\n\n## Schema Signals\n\n${envValidationReadinessSignalMarkdown(analysis.envValidationReadinessReport.schemaSignals, "signal")}\n\n## Runtime Signals\n\n${envValidationReadinessSignalMarkdown(analysis.envValidationReadinessReport.runtimeSignals, "signal")}\n\n## Boundary Signals\n\n${envValidationReadinessSignalMarkdown(analysis.envValidationReadinessReport.boundarySignals, "signal")}\n\n## Validation Signals\n\n${envValidationReadinessSignalMarkdown(analysis.envValidationReadinessReport.validationSignals, "signal")}\n\n## Documentation Signals\n\n${envValidationReadinessSignalMarkdown(analysis.envValidationReadinessReport.documentationSignals, "signal")}\n\n## Package Signals\n\n${envValidationReadinessSignalMarkdown(analysis.envValidationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.envValidationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.envValidationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.envValidationReadinessReport.learnerNextSteps)}\n`,
    "security-headers-readiness.md": `# Security Headers Readiness\n\n${analysis.securityHeadersReadinessReport.summary}\n\nSource pattern: ${analysis.securityHeadersReadinessReport.sourcePattern}\n\n## Header Setups\n\n${securityHeadersReadinessSetupMarkdown(analysis.securityHeadersReadinessReport.headerSetups)}\n\n## CSP Signals\n\n${securityHeadersReadinessSignalMarkdown(analysis.securityHeadersReadinessReport.cspSignals, "signal")}\n\n## Transport Signals\n\n${securityHeadersReadinessSignalMarkdown(analysis.securityHeadersReadinessReport.transportSignals, "signal")}\n\n## Cross-Origin Signals\n\n${securityHeadersReadinessSignalMarkdown(analysis.securityHeadersReadinessReport.crossOriginSignals, "signal")}\n\n## Legacy Header Signals\n\n${securityHeadersReadinessSignalMarkdown(analysis.securityHeadersReadinessReport.legacyHeaderSignals, "signal")}\n\n## Middleware Signals\n\n${securityHeadersReadinessSignalMarkdown(analysis.securityHeadersReadinessReport.middlewareSignals, "signal")}\n\n## Package Signals\n\n${securityHeadersReadinessSignalMarkdown(analysis.securityHeadersReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.securityHeadersReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.securityHeadersReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.securityHeadersReadinessReport.learnerNextSteps)}\n`,
    "graphql-readiness.md": `# GraphQL Readiness\n\n${analysis.graphqlReadinessReport.summary}\n\nSource pattern: ${analysis.graphqlReadinessReport.sourcePattern}\n\n## GraphQL Setups\n\n${graphqlReadinessSetupMarkdown(analysis.graphqlReadinessReport.graphqlSetups)}\n\n## Schema Signals\n\n${graphqlReadinessSignalMarkdown(analysis.graphqlReadinessReport.schemaSignals, "signal")}\n\n## Operation Signals\n\n${graphqlReadinessSignalMarkdown(analysis.graphqlReadinessReport.operationSignals, "signal")}\n\n## Resolver Signals\n\n${graphqlReadinessSignalMarkdown(analysis.graphqlReadinessReport.resolverSignals, "signal")}\n\n## Validation Signals\n\n${graphqlReadinessSignalMarkdown(analysis.graphqlReadinessReport.validationSignals, "signal")}\n\n## Execution Signals\n\n${graphqlReadinessSignalMarkdown(analysis.graphqlReadinessReport.executionSignals, "signal")}\n\n## Client Signals\n\n${graphqlReadinessSignalMarkdown(analysis.graphqlReadinessReport.clientSignals, "signal")}\n\n## Codegen Signals\n\n${graphqlReadinessSignalMarkdown(analysis.graphqlReadinessReport.codegenSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.graphqlReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.graphqlReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.graphqlReadinessReport.learnerNextSteps)}\n`,
    "cli-readiness.md": `# CLI Readiness\n\n${analysis.cliReadinessReport.summary}\n\nSource pattern: ${analysis.cliReadinessReport.sourcePattern}\n\n## CLI Setups\n\n${cliReadinessSetupMarkdown(analysis.cliReadinessReport.cliSetups)}\n\n## Command Signals\n\n${cliReadinessSignalMarkdown(analysis.cliReadinessReport.commandSignals, "signal")}\n\n## Option Signals\n\n${cliReadinessSignalMarkdown(analysis.cliReadinessReport.optionSignals, "signal")}\n\n## Parse Signals\n\n${cliReadinessSignalMarkdown(analysis.cliReadinessReport.parseSignals, "signal")}\n\n## Action Signals\n\n${cliReadinessSignalMarkdown(analysis.cliReadinessReport.actionSignals, "signal")}\n\n## Help Signals\n\n${cliReadinessSignalMarkdown(analysis.cliReadinessReport.helpSignals, "signal")}\n\n## Error Signals\n\n${cliReadinessSignalMarkdown(analysis.cliReadinessReport.errorSignals, "signal")}\n\n## Package Signals\n\n${cliReadinessSignalMarkdown(analysis.cliReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.cliReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.cliReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.cliReadinessReport.learnerNextSteps)}\n`,
    "llm-readiness.md": `# LLM Readiness\n\n${analysis.llmReadinessReport.summary}\n\nSource pattern: ${analysis.llmReadinessReport.sourcePattern}\n\n## LLM Setups\n\n${llmReadinessSetupMarkdown(analysis.llmReadinessReport.llmSetups)}\n\n## Model Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.modelSignals, "signal")}\n\n## Prompt Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.promptSignals, "signal")}\n\n## Tool Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.toolSignals, "signal")}\n\n## Retrieval Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.retrievalSignals, "signal")}\n\n## Structured Output Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.structuredOutputSignals, "signal")}\n\n## Streaming Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.streamingSignals, "signal")}\n\n## Safety Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${llmReadinessSignalMarkdown(analysis.llmReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.llmReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.llmReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.llmReadinessReport.learnerNextSteps)}\n`,
    "llm-eval-readiness.md": `# LLM Eval Readiness\n\n${analysis.llmEvalReadinessReport.summary}\n\nSource pattern: ${analysis.llmEvalReadinessReport.sourcePattern}\n\n## Eval Setups\n\n${llmEvalReadinessSetupMarkdown(analysis.llmEvalReadinessReport.evalSetups)}\n\n## Config Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.configSignals, "signal")}\n\n## Prompt Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.promptSignals, "signal")}\n\n## Provider Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.providerSignals, "signal")}\n\n## Test Case Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.testCaseSignals, "signal")}\n\n## Judge Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.judgeSignals, "signal")}\n\n## Dataset Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.datasetSignals, "signal")}\n\n## Red-Team Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.redteamSignals, "signal")}\n\n## Workflow Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${llmEvalReadinessSignalMarkdown(analysis.llmEvalReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.llmEvalReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.llmEvalReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.llmEvalReadinessReport.learnerNextSteps)}\n`,
    "llm-observability-readiness.md": `# LLM Observability Readiness\n\n${analysis.llmObservabilityReadinessReport.summary}\n\nSource pattern: ${analysis.llmObservabilityReadinessReport.sourcePattern}\n\n## Observability Setups\n\n${llmObservabilityReadinessSetupMarkdown(analysis.llmObservabilityReadinessReport.observabilitySetups)}\n\n## Trace Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.traceSignals, "signal")}\n\n## Instrumentation Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.instrumentationSignals, "signal")}\n\n## Identity Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.identitySignals, "signal")}\n\n## LLM Metric Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.llmMetricSignals, "signal")}\n\n## Feedback Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.feedbackSignals, "signal")}\n\n## Dataset and Experiment Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.datasetExperimentSignals, "signal")}\n\n## Gateway Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.gatewaySignals, "signal")}\n\n## Privacy Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.privacySignals, "signal")}\n\n## Workflow Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${llmObservabilityReadinessSignalMarkdown(analysis.llmObservabilityReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.llmObservabilityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.llmObservabilityReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.llmObservabilityReadinessReport.learnerNextSteps)}\n`,
    "vector-db-readiness.md": `# Vector DB Readiness\n\n${analysis.vectorDbReadinessReport.summary}\n\nSource pattern: ${analysis.vectorDbReadinessReport.sourcePattern}\n\n## Vector Setups\n\n${vectorDbReadinessSetupMarkdown(analysis.vectorDbReadinessReport.vectorSetups)}\n\n## Collection Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.collectionSignals, "signal")}\n\n## Client Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.clientSignals, "signal")}\n\n## Ingestion Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.ingestionSignals, "signal")}\n\n## Query Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.querySignals, "signal")}\n\n## Embedding Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.embeddingSignals, "signal")}\n\n## Index Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.indexSignals, "signal")}\n\n## Ops Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.opsSignals, "signal")}\n\n## Package Signals\n\n${vectorDbReadinessSignalMarkdown(analysis.vectorDbReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.vectorDbReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.vectorDbReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.vectorDbReadinessReport.learnerNextSteps)}\n`,
    "search-service-readiness.md": `# Search Service Readiness

${analysis.searchServiceReadinessReport.summary}

Source pattern: ${analysis.searchServiceReadinessReport.sourcePattern}

## Search Setups

${searchServiceReadinessSetupMarkdown(analysis.searchServiceReadinessReport.searchSetups)}

## Index Signals

${searchServiceReadinessSignalMarkdown(analysis.searchServiceReadinessReport.indexSignals, "signal")}

## Ingestion Signals

${searchServiceReadinessSignalMarkdown(analysis.searchServiceReadinessReport.ingestionSignals, "signal")}

## Query Signals

${searchServiceReadinessSignalMarkdown(analysis.searchServiceReadinessReport.querySignals, "signal")}

## Relevance Signals

${searchServiceReadinessSignalMarkdown(analysis.searchServiceReadinessReport.relevanceSignals, "signal")}

## Client Signals

${searchServiceReadinessSignalMarkdown(analysis.searchServiceReadinessReport.clientSignals, "signal")}

## Ops Signals

${searchServiceReadinessSignalMarkdown(analysis.searchServiceReadinessReport.opsSignals, "signal")}

## Package Signals

${searchServiceReadinessSignalMarkdown(analysis.searchServiceReadinessReport.packageSignals, "signal")}

## Recommended Commands

${analysis.searchServiceReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}

## Risk Queue

${analysis.searchServiceReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}

## 다음 확인 단계

${bulletsOrNone(analysis.searchServiceReadinessReport.learnerNextSteps)}
`,
    "object-storage-readiness.md": `# Object Storage Readiness

${analysis.objectStorageReadinessReport.summary}

Source pattern: ${analysis.objectStorageReadinessReport.sourcePattern}

## Storage Setups

${objectStorageReadinessSetupMarkdown(analysis.objectStorageReadinessReport.storageSetups)}

## Bucket Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.bucketSignals, "signal")}

## Client Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.clientSignals, "signal")}

## Object Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.objectSignals, "signal")}

## Access Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.accessSignals, "signal")}

## Reliability Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.reliabilitySignals, "signal")}

## Security Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.securitySignals, "signal")}

## Ops Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.opsSignals, "signal")}

## Package Signals

${objectStorageReadinessSignalMarkdown(analysis.objectStorageReadinessReport.packageSignals, "signal")}

## Recommended Commands

${analysis.objectStorageReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}

## Risk Queue

${analysis.objectStorageReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}

## 다음 확인 단계

${bulletsOrNone(analysis.objectStorageReadinessReport.learnerNextSteps)}
`,
    "realtime-collaboration-readiness.md": `# Realtime Collaboration Readiness\n\n${analysis.realtimeCollaborationReadinessReport.summary}\n\nSource pattern: ${analysis.realtimeCollaborationReadinessReport.sourcePattern}\n\n## Collaboration Setups\n\n${realtimeCollaborationReadinessSetupMarkdown(analysis.realtimeCollaborationReadinessReport.collaborationSetups)}\n\n## CRDT Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.crdtSignals, "signal")}\n\n## Provider Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.providerSignals, "signal")}\n\n## Presence Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.presenceSignals, "signal")}\n\n## Sync Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.syncSignals, "signal")}\n\n## Persistence Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.persistenceSignals, "signal")}\n\n## History Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.historySignals, "signal")}\n\n## Access Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.accessSignals, "signal")}\n\n## Package Signals\n\n${realtimeCollaborationReadinessSignalMarkdown(analysis.realtimeCollaborationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.realtimeCollaborationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.realtimeCollaborationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.realtimeCollaborationReadinessReport.learnerNextSteps)}\n`,
    "workflow-orchestration-readiness.md": `# Workflow Orchestration Readiness\n\n${analysis.workflowOrchestrationReadinessReport.summary}\n\nSource pattern: ${analysis.workflowOrchestrationReadinessReport.sourcePattern}\n\n## Workflow Setups\n\n${workflowOrchestrationReadinessSetupMarkdown(analysis.workflowOrchestrationReadinessReport.workflowSetups)}\n\n## Trigger Signals\n\n${workflowOrchestrationReadinessSignalMarkdown(analysis.workflowOrchestrationReadinessReport.triggerSignals, "signal")}\n\n## Execution Signals\n\n${workflowOrchestrationReadinessSignalMarkdown(analysis.workflowOrchestrationReadinessReport.executionSignals, "signal")}\n\n## Durability Signals\n\n${workflowOrchestrationReadinessSignalMarkdown(analysis.workflowOrchestrationReadinessReport.durabilitySignals, "signal")}\n\n## Flow Signals\n\n${workflowOrchestrationReadinessSignalMarkdown(analysis.workflowOrchestrationReadinessReport.flowSignals, "signal")}\n\n## Runtime Signals\n\n${workflowOrchestrationReadinessSignalMarkdown(analysis.workflowOrchestrationReadinessReport.runtimeSignals, "signal")}\n\n## Observability Signals\n\n${workflowOrchestrationReadinessSignalMarkdown(analysis.workflowOrchestrationReadinessReport.observabilitySignals, "signal")}\n\n## Package Signals\n\n${workflowOrchestrationReadinessSignalMarkdown(analysis.workflowOrchestrationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.workflowOrchestrationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.workflowOrchestrationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.workflowOrchestrationReadinessReport.learnerNextSteps)}\n`,
    "openapi-client-readiness.md": `# OpenAPI Client Readiness\n\n${analysis.openApiClientReadinessReport.summary}\n\nSource pattern: ${analysis.openApiClientReadinessReport.sourcePattern}\n\n## Client Setups\n\n${openApiClientReadinessSetupMarkdown(analysis.openApiClientReadinessReport.clientSetups)}\n\n## Spec Signals\n\n${openApiClientReadinessSignalMarkdown(analysis.openApiClientReadinessReport.specSignals, "signal")}\n\n## Generator Signals\n\n${openApiClientReadinessSignalMarkdown(analysis.openApiClientReadinessReport.generatorSignals, "signal")}\n\n## Output Signals\n\n${openApiClientReadinessSignalMarkdown(analysis.openApiClientReadinessReport.outputSignals, "signal")}\n\n## Runtime Signals\n\n${openApiClientReadinessSignalMarkdown(analysis.openApiClientReadinessReport.runtimeSignals, "signal")}\n\n## Quality Signals\n\n${openApiClientReadinessSignalMarkdown(analysis.openApiClientReadinessReport.qualitySignals, "signal")}\n\n## Package Signals\n\n${openApiClientReadinessSignalMarkdown(analysis.openApiClientReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.openApiClientReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.openApiClientReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.openApiClientReadinessReport.learnerNextSteps)}\n`,
    "webhook-readiness.md": `# Webhook Readiness\n\n${analysis.webhookReadinessReport.summary}\n\nSource pattern: ${analysis.webhookReadinessReport.sourcePattern}\n\n## Webhook Setups\n\n${webhookReadinessSetupMarkdown(analysis.webhookReadinessReport.webhookSetups)}\n\n## Endpoint Signals\n\n${webhookReadinessSignalMarkdown(analysis.webhookReadinessReport.endpointSignals, "signal")}\n\n## Signature Signals\n\n${webhookReadinessSignalMarkdown(analysis.webhookReadinessReport.signatureSignals, "signal")}\n\n## Reliability Signals\n\n${webhookReadinessSignalMarkdown(analysis.webhookReadinessReport.reliabilitySignals, "signal")}\n\n## Operations Signals\n\n${webhookReadinessSignalMarkdown(analysis.webhookReadinessReport.operationsSignals, "signal")}\n\n## Package Signals\n\n${webhookReadinessSignalMarkdown(analysis.webhookReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.webhookReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.webhookReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.webhookReadinessReport.learnerNextSteps)}\n`,
    "notification-readiness.md": `# Notification Readiness\n\n${analysis.notificationReadinessReport.summary}\n\nSource pattern: ${analysis.notificationReadinessReport.sourcePattern}\n\n## Notification Setups\n\n${notificationReadinessSetupMarkdown(analysis.notificationReadinessReport.notificationSetups)}\n\n## Workflow Signals\n\n${notificationReadinessSignalMarkdown(analysis.notificationReadinessReport.workflowSignals, "signal")}\n\n## Audience Signals\n\n${notificationReadinessSignalMarkdown(analysis.notificationReadinessReport.audienceSignals, "signal")}\n\n## Channel Signals\n\n${notificationReadinessSignalMarkdown(analysis.notificationReadinessReport.channelSignals, "signal")}\n\n## Template Signals\n\n${notificationReadinessSignalMarkdown(analysis.notificationReadinessReport.templateSignals, "signal")}\n\n## Operations Signals\n\n${notificationReadinessSignalMarkdown(analysis.notificationReadinessReport.operationsSignals, "signal")}\n\n## Package Signals\n\n${notificationReadinessSignalMarkdown(analysis.notificationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.notificationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.notificationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.notificationReadinessReport.learnerNextSteps)}\n`,
    "consent-readiness.md": `# Consent Readiness\n\n${analysis.consentReadinessReport.summary}\n\nSource pattern: ${analysis.consentReadinessReport.sourcePattern}\n\n## Consent Setups\n\n${consentReadinessSetupMarkdown(analysis.consentReadinessReport.consentSetups)}\n\n## Banner Signals\n\n${consentReadinessSignalMarkdown(analysis.consentReadinessReport.bannerSignals, "signal")}\n\n## Category Signals\n\n${consentReadinessSignalMarkdown(analysis.consentReadinessReport.categorySignals, "signal")}\n\n## Script Signals\n\n${consentReadinessSignalMarkdown(analysis.consentReadinessReport.scriptSignals, "signal")}\n\n## Privacy Signals\n\n${consentReadinessSignalMarkdown(analysis.consentReadinessReport.privacySignals, "signal")}\n\n## TCF Signals\n\n${consentReadinessSignalMarkdown(analysis.consentReadinessReport.tcfSignals, "signal")}\n\n## Package Signals\n\n${consentReadinessSignalMarkdown(analysis.consentReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.consentReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.consentReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.consentReadinessReport.learnerNextSteps)}\n`,
    "privacy-readiness.md": `# Privacy Readiness\n\n${analysis.privacyReadinessReport.summary}\n\nSource pattern: ${analysis.privacyReadinessReport.sourcePattern}\n\n## Privacy Setups\n\n${privacyReadinessSetupMarkdown(analysis.privacyReadinessReport.privacySetups)}\n\n## PII Detection Signals\n\n${privacyReadinessSignalMarkdown(analysis.privacyReadinessReport.piiDetectionSignals, "signal")}\n\n## Redaction Signals\n\n${privacyReadinessSignalMarkdown(analysis.privacyReadinessReport.redactionSignals, "signal")}\n\n## Policy Signals\n\n${privacyReadinessSignalMarkdown(analysis.privacyReadinessReport.policySignals, "signal")}\n\n## Differential Privacy Signals\n\n${privacyReadinessSignalMarkdown(analysis.privacyReadinessReport.differentialPrivacySignals, "signal")}\n\n## Config Signals\n\n${privacyReadinessSignalMarkdown(analysis.privacyReadinessReport.configSignals, "signal")}\n\n## CI Signals\n\n${privacyReadinessSignalMarkdown(analysis.privacyReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${privacyReadinessSignalMarkdown(analysis.privacyReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.privacyReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.privacyReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.privacyReadinessReport.learnerNextSteps)}\n`,
    "server-framework-readiness.md": `# Server Framework Readiness\n\n${analysis.serverFrameworkReadinessReport.summary}\n\nSource pattern: ${analysis.serverFrameworkReadinessReport.sourcePattern}\n\n## Server Setups\n\n${serverFrameworkReadinessSetupMarkdown(analysis.serverFrameworkReadinessReport.serverSetups)}\n\n## Route Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.routeSignals, "signal")}\n\n## Schema Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.schemaSignals, "signal")}\n\n## Plugin Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.pluginSignals, "signal")}\n\n## Lifecycle Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.lifecycleSignals, "signal")}\n\n## Runtime Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.runtimeSignals, "signal")}\n\n## Error Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.errorSignals, "signal")}\n\n## Test Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.testSignals, "signal")}\n\n## Package Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.serverFrameworkReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.serverFrameworkReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.serverFrameworkReadinessReport.learnerNextSteps)}\n`,
    "rpc-readiness.md": `# RPC Readiness\n\n${analysis.rpcReadinessReport.summary}\n\nSource pattern: ${analysis.rpcReadinessReport.sourcePattern}\n\n## RPC Setups\n\n${rpcReadinessSetupMarkdown(analysis.rpcReadinessReport.rpcSetups)}\n\n## Router Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.routerSignals, "signal")}\n\n## Procedure Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.procedureSignals, "signal")}\n\n## Validation Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.validationSignals, "signal")}\n\n## Context Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.contextSignals, "signal")}\n\n## Client Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.clientSignals, "signal")}\n\n## Adapter Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.adapterSignals, "signal")}\n\n## Error Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.errorSignals, "signal")}\n\n## Caller Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.callerSignals, "signal")}\n\n## Package Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.rpcReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.rpcReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.rpcReadinessReport.learnerNextSteps)}\n`,
    "workspace-graph-readiness.md": `# Workspace Graph Readiness\n\n${analysis.workspaceGraphReadinessReport.summary}\n\nSource pattern: ${analysis.workspaceGraphReadinessReport.sourcePattern}\n\n## Workspace Files\n\n${workspaceGraphReadinessFileMarkdown(analysis.workspaceGraphReadinessReport.workspaceFiles)}\n\n## Project Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.projectSignals, "signal")}\n\n## Graph Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.graphSignals, "signal")}\n\n## Boundary Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.boundarySignals, "signal")}\n\n## Affected Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.affectedSignals, "signal")}\n\n## Target Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.targetSignals, "signal")}\n\n## Plugin Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.pluginSignals, "signal")}\n\n## Package Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.workspaceGraphReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.workspaceGraphReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.workspaceGraphReadinessReport.learnerNextSteps)}\n`,
    "scaffolding-readiness.md": `# Scaffolding Readiness\n\n${analysis.scaffoldingReadinessReport.summary}\n\nSource pattern: ${analysis.scaffoldingReadinessReport.sourcePattern}\n\n## Generator Files\n\n${scaffoldingReadinessFileMarkdown(analysis.scaffoldingReadinessReport.generatorFiles)}\n\n## Prompt Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.promptSignals, "signal")}\n\n## Action Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.actionSignals, "signal")}\n\n## Template Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.templateSignals, "signal")}\n\n## Safety Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.scaffoldingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.scaffoldingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.scaffoldingReadinessReport.learnerNextSteps)}\n`,
    "scheduler-readiness.md": `# Scheduler Readiness\n\n${analysis.schedulerReadinessReport.summary}\n\nSource pattern: ${analysis.schedulerReadinessReport.sourcePattern}\n\n## Scheduler Setups\n\n${schedulerReadinessSetupMarkdown(analysis.schedulerReadinessReport.schedulerSetups)}\n\n## Schedule Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.scheduleSignals, "signal")}\n\n## Task Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.taskSignals, "signal")}\n\n## Lifecycle Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.lifecycleSignals, "signal")}\n\n## Reliability Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.reliabilitySignals, "signal")}\n\n## Package Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.schedulerReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.schedulerReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.schedulerReadinessReport.learnerNextSteps)}\n`,
    "build-tool-readiness.md": `# Build Tool Readiness\n\n${analysis.buildToolReadinessReport.summary}\n\nSource pattern: ${analysis.buildToolReadinessReport.sourcePattern}\n\n## Build Tool Setups\n\n${buildToolReadinessSetupMarkdown(analysis.buildToolReadinessReport.buildToolSetups)}\n\n## Config Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.configSignals, "signal")}\n\n## Plugin Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.pluginSignals, "signal")}\n\n## Dev Server Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.devServerSignals, "signal")}\n\n## Build Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.buildSignals, "signal")}\n\n## Environment Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.environmentSignals, "signal")}\n\n## SSR Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.ssrSignals, "signal")}\n\n## Dependency Optimization Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.dependencyOptimizationSignals, "signal")}\n\n## Package Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.buildToolReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.buildToolReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.buildToolReadinessReport.learnerNextSteps)}\n`,
    "styling-readiness.md": `# Styling Readiness\n\n${analysis.stylingReadinessReport.summary}\n\nSource pattern: ${analysis.stylingReadinessReport.sourcePattern}\n\n## Styling Setups\n\n${stylingReadinessSetupMarkdown(analysis.stylingReadinessReport.stylingSetups)}\n\n## Config Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.configSignals, "signal")}\n\n## Directive Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.directiveSignals, "signal")}\n\n## Class Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.classSignals, "signal")}\n\n## Theme Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.themeSignals, "signal")}\n\n## Integration Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.integrationSignals, "signal")}\n\n## Package Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.stylingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.stylingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.stylingReadinessReport.learnerNextSteps)}\n`,
    "visual-regression-readiness.md": `# Visual Regression Readiness\n\n${analysis.visualRegressionReadinessReport.summary}\n\nSource pattern: ${analysis.visualRegressionReadinessReport.sourcePattern}\n\n## Visual Regression Setups\n\n${visualRegressionReadinessSetupMarkdown(analysis.visualRegressionReadinessReport.visualRegressionSetups)}\n\n## Config Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.configSignals, "signal")}\n\n## Snapshot Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.snapshotSignals, "signal")}\n\n## Threshold Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.thresholdSignals, "signal")}\n\n## Report Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.reportSignals, "signal")}\n\n## Plugin Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.pluginSignals, "signal")}\n\n## CI Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.visualRegressionReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.visualRegressionReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.visualRegressionReadinessReport.learnerNextSteps)}\n`,
    "infrastructure-readiness.md": `# Infrastructure Readiness\n\n${analysis.infrastructureReadinessReport.summary}\n\nSource pattern: ${analysis.infrastructureReadinessReport.sourcePattern}\n\n## Infrastructure Setups\n\n${infrastructureReadinessSetupMarkdown(analysis.infrastructureReadinessReport.infrastructureSetups)}\n\n## Config Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.configSignals, "signal")}\n\n## State Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.stateSignals, "signal")}\n\n## Workflow Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.workflowSignals, "signal")}\n\n## Module Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.moduleSignals, "signal")}\n\n## Variable Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.variableSignals, "signal")}\n\n## Policy Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.policySignals, "signal")}\n\n## Package Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.infrastructureReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.infrastructureReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.infrastructureReadinessReport.learnerNextSteps)}\n`,
    "iac-drift-readiness.md": `# IaC Drift Readiness\n\n${analysis.iacDriftReadinessReport.summary}\n\nSource pattern: ${analysis.iacDriftReadinessReport.sourcePattern}\n\n## Drift Setups\n\n${iacDriftReadinessSetupMarkdown(analysis.iacDriftReadinessReport.driftSetups)}\n\n## Tool Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.toolSignals, "signal")}\n\n## State Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.stateSignals, "signal")}\n\n## Inventory Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.inventorySignals, "signal")}\n\n## Refresh Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.refreshSignals, "signal")}\n\n## Plan Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.planSignals, "signal")}\n\n## Drift Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.driftSignals, "signal")}\n\n## Remediation Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.remediationSignals, "signal")}\n\n## Output Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.outputSignals, "signal")}\n\n## CI Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${iacDriftReadinessSignalMarkdown(analysis.iacDriftReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.iacDriftReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.iacDriftReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.iacDriftReadinessReport.learnerNextSteps)}\n`,
    "deployment-readiness.md": `# Deployment Readiness\n\n${analysis.deploymentReadinessReport.summary}\n\nSource pattern: ${analysis.deploymentReadinessReport.sourcePattern}\n\n## Deployment Setups\n\n${deploymentReadinessSetupMarkdown(analysis.deploymentReadinessReport.deploymentSetups)}\n\n## Chart Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.chartSignals, "signal")}\n\n## Template Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.templateSignals, "signal")}\n\n## Value Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.valueSignals, "signal")}\n\n## Release Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.releaseSignals, "signal")}\n\n## Safety Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.deploymentReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.deploymentReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.deploymentReadinessReport.learnerNextSteps)}\n`,
    "serverless-readiness.md": `# Serverless Readiness\n\n${analysis.serverlessReadinessReport.summary}\n\nSource pattern: ${analysis.serverlessReadinessReport.sourcePattern}\n\n## Serverless Setups\n\n${serverlessReadinessSetupMarkdown(analysis.serverlessReadinessReport.serverlessSetups)}\n\n## Config Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.configSignals, "signal")}\n\n## Function Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.functionSignals, "signal")}\n\n## Event Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.eventSignals, "signal")}\n\n## Runtime Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.runtimeSignals, "signal")}\n\n## Deployment Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.deploymentSignals, "signal")}\n\n## Safety Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.serverlessReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.serverlessReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.serverlessReadinessReport.learnerNextSteps)}\n`,
    "mobile-readiness.md": `# Mobile Readiness\n\n${analysis.mobileReadinessReport.summary}\n\nSource pattern: ${analysis.mobileReadinessReport.sourcePattern}\n\n## Mobile Setups\n\n${mobileReadinessSetupMarkdown(analysis.mobileReadinessReport.mobileSetups)}\n\n## Config Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.configSignals, "signal")}\n\n## Platform Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.platformSignals, "signal")}\n\n## Navigation Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.navigationSignals, "signal")}\n\n## Build Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.buildSignals, "signal")}\n\n## Update Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.updateSignals, "signal")}\n\n## Asset Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.assetSignals, "signal")}\n\n## Package Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.mobileReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.mobileReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.mobileReadinessReport.learnerNextSteps)}\n`,
    "desktop-readiness.md": `# Desktop Readiness\n\n${analysis.desktopReadinessReport.summary}\n\nSource pattern: ${analysis.desktopReadinessReport.sourcePattern}\n\n## Desktop Setups\n\n${desktopReadinessSetupMarkdown(analysis.desktopReadinessReport.desktopSetups)}\n\n## Framework Signals\n\n${desktopReadinessSignalMarkdown(analysis.desktopReadinessReport.frameworkSignals, "signal")}\n\n## Config Signals\n\n${desktopReadinessSignalMarkdown(analysis.desktopReadinessReport.configSignals, "signal")}\n\n## Runtime Signals\n\n${desktopReadinessSignalMarkdown(analysis.desktopReadinessReport.runtimeSignals, "signal")}\n\n## Permission Signals\n\n${desktopReadinessSignalMarkdown(analysis.desktopReadinessReport.permissionSignals, "signal")}\n\n## Bundle Signals\n\n${desktopReadinessSignalMarkdown(analysis.desktopReadinessReport.bundleSignals, "signal")}\n\n## Release Signals\n\n${desktopReadinessSignalMarkdown(analysis.desktopReadinessReport.releaseSignals, "signal")}\n\n## Package Signals\n\n${desktopReadinessSignalMarkdown(analysis.desktopReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.desktopReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.desktopReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.desktopReadinessReport.learnerNextSteps)}\n`,
    "edge-readiness.md": `# Edge Readiness\n\n${analysis.edgeReadinessReport.summary}\n\nSource pattern: ${analysis.edgeReadinessReport.sourcePattern}\n\n## Edge Setups\n\n${edgeReadinessSetupMarkdown(analysis.edgeReadinessReport.edgeSetups)}\n\n## Config Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.configSignals, "signal")}\n\n## Handler Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.handlerSignals, "signal")}\n\n## Binding Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.bindingSignals, "signal")}\n\n## Routing Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.routingSignals, "signal")}\n\n## Dev Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.devSignals, "signal")}\n\n## Deployment Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.deploymentSignals, "signal")}\n\n## Observability Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.observabilitySignals, "signal")}\n\n## Package Signals\n\n${edgeReadinessSignalMarkdown(analysis.edgeReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.edgeReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.edgeReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.edgeReadinessReport.learnerNextSteps)}\n`,
    "compose-readiness.md": `# Compose Readiness\n\n${analysis.composeReadinessReport.summary}\n\nSource pattern: ${analysis.composeReadinessReport.sourcePattern}\n\n## Compose Setups\n\n${composeReadinessSetupMarkdown(analysis.composeReadinessReport.composeSetups)}\n\n## Config Signals\n\n${composeReadinessSignalMarkdown(analysis.composeReadinessReport.configSignals, "signal")}\n\n## Service Signals\n\n${composeReadinessSignalMarkdown(analysis.composeReadinessReport.serviceSignals, "signal")}\n\n## Dependency Signals\n\n${composeReadinessSignalMarkdown(analysis.composeReadinessReport.dependencySignals, "signal")}\n\n## Resource Signals\n\n${composeReadinessSignalMarkdown(analysis.composeReadinessReport.resourceSignals, "signal")}\n\n## Workflow Signals\n\n${composeReadinessSignalMarkdown(analysis.composeReadinessReport.workflowSignals, "signal")}\n\n## Safety Signals\n\n${composeReadinessSignalMarkdown(analysis.composeReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${composeReadinessSignalMarkdown(analysis.composeReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.composeReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.composeReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.composeReadinessReport.learnerNextSteps)}\n`,
    "devcontainer-readiness.md": `# Dev Container Readiness\n\n${analysis.devContainerReadinessReport.summary}\n\nSource pattern: ${analysis.devContainerReadinessReport.sourcePattern}\n\n## Dev Container Setups\n\n${devContainerReadinessSetupMarkdown(analysis.devContainerReadinessReport.devContainerSetups)}\n\n## Config Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.configSignals, "signal")}\n\n## Feature Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.featureSignals, "signal")}\n\n## Lifecycle Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.lifecycleSignals, "signal")}\n\n## Environment Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.environmentSignals, "signal")}\n\n## Workspace Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.workspaceSignals, "signal")}\n\n## Customization Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.customizationSignals, "signal")}\n\n## Workflow Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.workflowSignals, "signal")}\n\n## Safety Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${devContainerReadinessSignalMarkdown(analysis.devContainerReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.devContainerReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.devContainerReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.devContainerReadinessReport.learnerNextSteps)}\n`,
    "kubernetes-readiness.md": `# Kubernetes Readiness\n\n${analysis.kubernetesReadinessReport.summary}\n\nSource pattern: ${analysis.kubernetesReadinessReport.sourcePattern}\n\n## Kubernetes Setups\n\n${kubernetesReadinessSetupMarkdown(analysis.kubernetesReadinessReport.kubernetesSetups)}\n\n## Manifest Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.manifestSignals, "signal")}\n\n## Workload Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.workloadSignals, "signal")}\n\n## Network Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.networkSignals, "signal")}\n\n## Config Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.configSignals, "signal")}\n\n## Storage Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.storageSignals, "signal")}\n\n## Security Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.securitySignals, "signal")}\n\n## Health Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.healthSignals, "signal")}\n\n## Kustomize Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.kustomizeSignals, "signal")}\n\n## Workflow Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${kubernetesReadinessSignalMarkdown(analysis.kubernetesReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.kubernetesReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.kubernetesReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.kubernetesReadinessReport.learnerNextSteps)}\n`,
    "gitops-readiness.md": `# GitOps Readiness\n\n${analysis.gitopsReadinessReport.summary}\n\nSource pattern: ${analysis.gitopsReadinessReport.sourcePattern}\n\n## GitOps Setups\n\n${gitopsReadinessSetupMarkdown(analysis.gitopsReadinessReport.gitopsSetups)}\n\n## Argo Signals\n\n${gitopsReadinessSignalMarkdown(analysis.gitopsReadinessReport.argoSignals, "signal")}\n\n## Flux Source Signals\n\n${gitopsReadinessSignalMarkdown(analysis.gitopsReadinessReport.fluxSourceSignals, "signal")}\n\n## Flux Reconcile Signals\n\n${gitopsReadinessSignalMarkdown(analysis.gitopsReadinessReport.fluxReconcileSignals, "signal")}\n\n## Image and Notification Signals\n\n${gitopsReadinessSignalMarkdown(analysis.gitopsReadinessReport.imageNotificationSignals, "signal")}\n\n## Workflow Signals\n\n${gitopsReadinessSignalMarkdown(analysis.gitopsReadinessReport.workflowSignals, "signal")}\n\n## Safety Signals\n\n${gitopsReadinessSignalMarkdown(analysis.gitopsReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${gitopsReadinessSignalMarkdown(analysis.gitopsReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.gitopsReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.gitopsReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.gitopsReadinessReport.learnerNextSteps)}\n`,
    "backup-readiness.md": `# Backup Readiness\n\n${analysis.backupReadinessReport.summary}\n\nSource pattern: ${analysis.backupReadinessReport.sourcePattern}\n\n## Backup Setups\n\n${backupReadinessSetupMarkdown(analysis.backupReadinessReport.backupSetups)}\n\n## Velero Signals\n\n${backupReadinessSignalMarkdown(analysis.backupReadinessReport.veleroSignals, "signal")}\n\n## Litestream Signals\n\n${backupReadinessSignalMarkdown(analysis.backupReadinessReport.litestreamSignals, "signal")}\n\n## Restic Signals\n\n${backupReadinessSignalMarkdown(analysis.backupReadinessReport.resticSignals, "signal")}\n\n## Restore Drill Signals\n\n${backupReadinessSignalMarkdown(analysis.backupReadinessReport.restoreDrillSignals, "signal")}\n\n## Safety Signals\n\n${backupReadinessSignalMarkdown(analysis.backupReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${backupReadinessSignalMarkdown(analysis.backupReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.backupReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.backupReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.backupReadinessReport.learnerNextSteps)}\n`,
    "context-pack.md": `# Context Pack\n\n${analysis.contextPackReport.summary}\n\nSource pattern: ${analysis.contextPackReport.sourcePattern}\n\n## Token Budget\n\n${analysis.contextPackReport.budgetProfiles.map((profile) => `- ${profile.name}: ${profile.fits ? "fits" : `overflow ${profile.overflowTokens} tokens`} / limit ${profile.tokenLimit}`).join("\n")}\n\n## Split Output Plan\n\n${contextSplitPlanRows(analysis.contextPackReport.splitPlans)}\n\n## Token-heavy Files\n\n${contextPackRows(analysis.contextPackReport.topFiles)}\n\n## Directory Token Tree\n\n${analysis.contextPackReport.directoryTokenTree.map((item) => `- ${item.directory}: ${item.estimatedTokens} tokens / ${item.fileCount} files`).join("\n") || "- 없음"}\n\n## Pack 제외 항목\n\n${bulletsOrNone(analysis.contextPackReport.excludedFromPack)}\n\n## Security Notes\n\n${bulletsOrNone(analysis.contextPackReport.securityNotes)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.contextPackReport.learnerNextSteps)}\n`,
    "mcp-handoff.md": `# MCP Handoff\n\n${analysis.mcpHandoffReport.summary}\n\nSource pattern: ${analysis.mcpHandoffReport.sourcePattern}\n\n## Tools\n\n${mcpToolRows(analysis.mcpHandoffReport.tools)}\n\n## Prompts\n\n${analysis.mcpHandoffReport.prompts.map((item) => `### ${item.title}\n\n${item.prompt}\n\n- Related report: [${item.relatedReportHref}](../${item.relatedReportHref})`).join("\n\n")}\n\n## Safety Notes\n\n${bulletsOrNone(analysis.mcpHandoffReport.safetyNotes)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.mcpHandoffReport.learnerNextSteps)}\n`,
    "agent-memory.md": `# Agent Memory\n\n${analysis.agentMemoryReport.summary}\n\nSource pattern: ${analysis.agentMemoryReport.sourcePattern}\n\n## Token Savings\n\n- Raw code read tokens: ${analysis.agentMemoryReport.tokenSavings.rawCodeReadTokens}\n- Graph query token target: ${analysis.agentMemoryReport.tokenSavings.graphQueryTokenTarget}\n- Estimated reduction: ${analysis.agentMemoryReport.tokenSavings.estimatedReductionX}x\n\n## Memory Layers\n\n${agentMemoryLayerRows(analysis.agentMemoryReport.layers)}\n\n## Memory Notes\n\n${agentMemoryNoteRows(analysis.agentMemoryReport.memoryNotes)}\n\n## Context Navigation Rules\n\n${bulletsOrNone(analysis.agentMemoryReport.contextNavigationRules)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.agentMemoryReport.learnerNextSteps)}\n`,
    "graph-query.md": `# Graph Query\n\n${analysis.graphQueryReport.summary}\n\nSource pattern: ${analysis.graphQueryReport.sourcePattern}\n\n## Query Modes\n\n${graphQueryModeRows(analysis.graphQueryReport.queryModes)}\n\n## Explain Nodes\n\n${analysis.graphQueryReport.nodeExplanations.map((item) => `- ${item.label} [${item.type}]: \`${item.question}\`${item.href ? ` ([관련 페이지](../${item.href}))` : ""}`).join("\n") || "- 없음"}\n\n## Path Prompts\n\n${analysis.graphQueryReport.pathPrompts.map((item) => `- ${item.from} -> ${item.to}: \`${item.question}\` - ${item.reason}`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.graphQueryReport.learnerNextSteps)}\n`,
    "tutorial-abstractions.md": `# Tutorial Abstractions\n\n${analysis.tutorialAbstractionReport.summary}\n\nSource pattern: ${analysis.tutorialAbstractionReport.sourcePattern}\n\n## Abstractions\n\n${tutorialAbstractionRows(analysis.tutorialAbstractionReport.abstractions)}\n\n## Relationships\n\n${analysis.tutorialAbstractionReport.relationships.map((item) => `- ${item.fromId} -> ${item.toId} [${item.label}]: ${item.reason}`).join("\n") || "- 없음"}\n\n## Chapter Order\n\n${analysis.tutorialAbstractionReport.chapterOrder.map((item) => `- ${item.chapterNumber}. ${item.title}: ${item.whyNow}`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.tutorialAbstractionReport.learnerNextSteps)}\n`,
    "decision-records.md": `# Decision Records\n\n${analysis.decisionRecordReport.summary}\n\nSource pattern: ${analysis.decisionRecordReport.sourcePattern}\n\n## Status Counts\n\n${recordBullets(analysis.decisionRecordReport.statusCounts)}\n\n## Records\n\n${decisionRecordRows(analysis.decisionRecordReport.records)}\n\n## Timeline\n\n${analysis.decisionRecordReport.timeline.map((item) => `- ${item.sequence}. ${item.title} [${item.status}] (${item.scope})`).join("\n") || "- 없음"}\n\n## Package Scopes\n\n${analysis.decisionRecordReport.packageScopes.map((item) => `- ${item.name}: ${item.adrFolder} (${item.recordCount} records)`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.decisionRecordReport.learnerNextSteps)}\n`,
    "dependency-health.md": `# Dependency Health\n\n${analysis.dependencyHealthReport.summary}\n\nSource pattern: ${analysis.dependencyHealthReport.sourcePattern}\n\n## Graph Metrics\n\n- Nodes: ${analysis.dependencyHealthReport.graphMetrics.nodeCount}\n- Local edges: ${analysis.dependencyHealthReport.graphMetrics.edgeCount}\n- Max fan-in: ${analysis.dependencyHealthReport.graphMetrics.maxFanIn}\n- Max fan-out: ${analysis.dependencyHealthReport.graphMetrics.maxFanOut}\n\n## Cycles\n\n${dependencyCycleRows(analysis.dependencyHealthReport.cycles)}\n\n## Orphan Modules\n\n${analysis.dependencyHealthReport.orphanModules.map((item) => `- ${item.filePath}: ${item.reason} ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## Rule Violations\n\n${analysis.dependencyHealthReport.ruleViolations.map((item) => `- ${item.ruleName} [${item.severity}]: ${item.fromFile}${item.toFile ? ` -> ${item.toFile}` : ""} - ${item.message}`).join("\n") || "- 없음"}\n\n## Fan-in / Fan-out\n\n### Top Fan-in\n\n${fanRows(analysis.dependencyHealthReport.graphMetrics.topFanIn)}\n\n### Top Fan-out\n\n${fanRows(analysis.dependencyHealthReport.graphMetrics.topFanOut)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dependencyHealthReport.learnerNextSteps)}\n`,
    "coverage.md": `# 학습 커버리지\n\n${analysis.coverageReport.beginnerExplanation}\n\n- 전체 스캔 파일: ${analysis.coverageReport.totalScannedFiles}\n- 자세히 설명한 핵심 파일: ${analysis.coverageReport.coveredImportantFiles}\n- 커버리지 비율: ${(analysis.coverageReport.coverageRatio * 100).toFixed(1)}%\n- 소스 근거가 있는 핵심 파일: ${analysis.coverageReport.evidenceBackedFiles}\n- 소스 근거 비율: ${(analysis.coverageReport.evidenceCoverageRatio * 100).toFixed(1)}%\n- 소스 근거 종류: ${recordSummary(analysis.coverageReport.evidenceKindCounts)}\n\n## 소스 근거 종류\n\n${recordBullets(analysis.coverageReport.evidenceKindCounts)}\n\n## 우선 확인 폴더\n\n${analysis.coverageReport.highPriorityFolders.map((folder) => `- ${folder.folderPath}: ${folder.reason}`).join("\n")}\n\n## 아직 자세히 다루지 않은 후보\n\n${analysis.coverageReport.uncoveredImportantFiles.map((file) => `- ${file}`).join("\n") || "- 없음"}\n\n## 소스 근거가 부족한 파일\n\n${analysis.coverageReport.filesWithoutEvidence.map((file) => `- ${file}`).join("\n") || "- 없음"}\n`,
    "component-graph.md": `# 컴포넌트 그래프\n\n${analysis.componentGraphReport.beginnerExplanation}\n\n## 큰 그래프 요약\n\n- 전체 노드: ${analysis.componentGraphReport.summary.totalNodes}\n- 전체 관계: ${analysis.componentGraphReport.summary.totalEdges}\n- 노드 타입: ${Object.entries(analysis.componentGraphReport.summary.nodeTypeCounts).map(([type, count]) => `${type} ${count}`).join(", ")}\n- 핵심 허브: ${analysis.componentGraphReport.summary.topConnectedNodes.map((node) => `${node.label} (${node.degree})`).join(", ") || "없음"}\n\n${analysis.componentGraphReport.summary.largeRepoAdvice}\n\n## Mermaid\n\n\`\`\`mermaid\n${analysis.componentGraphReport.mermaid}\n\`\`\`\n\n## 노드\n\n${analysis.componentGraphReport.nodes.map((node) => `- ${node.label} [${node.type}]: ${node.summary}`).join("\n")}\n\n## 관계\n\n${analysis.componentGraphReport.edges.map((edge) => `- ${edge.from} -> ${edge.to}: ${edge.label}`).join("\n")}\n`,
    "incremental.md": `# 증분 분석\n\n${analysis.incrementalReport.beginnerExplanation}\n\n${analysis.incrementalReport.summary}\n\n## 커버리지 변화\n\n${analysis.incrementalReport.coverageDelta.summary}\n\n- 이전 비율: ${formatPercentOrNone(analysis.incrementalReport.coverageDelta.baselineCoverageRatio)}\n- 현재 비율: ${formatPercentOrNone(analysis.incrementalReport.coverageDelta.currentCoverageRatio)}\n- 변화: ${formatPointDelta(analysis.incrementalReport.coverageDelta.coverageRatioDelta)}\n\n## 추가된 파일\n\n${bulletsOrNone(analysis.incrementalReport.addedFiles)}\n\n## 변경된 파일\n\n${bulletsOrNone(analysis.incrementalReport.changedFiles)}\n\n## 삭제된 파일\n\n${bulletsOrNone(analysis.incrementalReport.removedFiles)}\n`,
    "flow.md": `# 실행 흐름\n\n## CLI\n\n${bullets(analysis.flowReport.cliFlow)}\n\n## App\n\n${bullets(analysis.flowReport.appFlow)}\n\n\`\`\`mermaid\n${analysis.flowReport.mermaid}\n\`\`\`\n`,
    "glossary.md": `# 용어 사전\n\n${analysis.glossary.map((term) => `## ${term.termKo} (${term.termEn})\n\n${term.simpleDefinition}\n\n${term.projectSpecificMeaning}`).join("\n\n")}\n`,
    "rebuild.md": `# 맨땅에서 따라 만들기\n\n${analysis.rebuildRoadmap.steps.map((step) => `## ${step.order}. ${step.title}\n\n${step.goal}\n\n${bullets(step.tasks)}\n\n완료 기준:\n\n${bullets(step.completionCriteria)}`).join("\n\n")}\n`,
    "quiz.md": `# 퀴즈\n\n${quiz.questions.map((question, index) => `## ${index + 1}. ${question.question}\n\nA. ${question.choices.A}\nB. ${question.choices.B}\nC. ${question.choices.C}\nD. ${question.choices.D}\n\n정답: ${question.correctChoice}\n\n${question.explanation}`).join("\n\n")}\n`,
    "wrong-notes.md": renderWrongNotesMarkdown(wrongNotes)
  };
  files["crash-reporting-readiness.md"] = `# Crash Reporting Readiness\n\n${analysis.crashReportingReadinessReport.summary}\n\nSource pattern: ${analysis.crashReportingReadinessReport.sourcePattern}\n\n## Crash Setups\n\n${crashReportingSetupMarkdown(analysis.crashReportingReadinessReport.crashSetups)}\n\n## Capture Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.captureSignals, "signal")}\n\n## Release Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.releaseSignals, "signal")}\n\n## Symbolication Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.symbolicationSignals, "signal")}\n\n## Context Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.contextSignals, "signal")}\n\n## Privacy Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.privacySignals, "signal")}\n\n## Delivery Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.deliverySignals, "signal")}\n\n## Workflow Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${crashReportingSignalMarkdown(analysis.crashReportingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.crashReportingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.crashReportingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.crashReportingReadinessReport.learnerNextSteps)}\n`;
  files["incident-response-readiness.md"] = `# Incident Response Readiness\n\n${analysis.incidentResponseReadinessReport.summary}\n\nSource pattern: ${analysis.incidentResponseReadinessReport.sourcePattern}\n\n## Incident Setups\n\n${incidentResponseSetupMarkdown(analysis.incidentResponseReadinessReport.incidentSetups)}\n\n## Intake Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.intakeSignals, "signal")}\n\n## Triage Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.triageSignals, "signal")}\n\n## On-Call Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.onCallSignals, "signal")}\n\n## Communication Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.communicationSignals, "signal")}\n\n## Runbook Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.runbookSignals, "signal")}\n\n## Lifecycle Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.lifecycleSignals, "signal")}\n\n## Governance Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.governanceSignals, "signal")}\n\n## Workflow Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${incidentResponseSignalMarkdown(analysis.incidentResponseReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.incidentResponseReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.incidentResponseReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.incidentResponseReadinessReport.learnerNextSteps)}\n`;
  files["slo-readiness.md"] = `# SLO Readiness\n\n${analysis.sloReadinessReport.summary}\n\nSource pattern: ${analysis.sloReadinessReport.sourcePattern}\n\n## SLO Setups\n\n${sloSetupMarkdown(analysis.sloReadinessReport.sloSetups)}\n\n## Spec Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.specSignals, "signal")}\n\n## Indicator Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.indicatorSignals, "signal")}\n\n## Objective Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.objectiveSignals, "signal")}\n\n## Alert Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.alertSignals, "signal")}\n\n## Rule Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.ruleSignals, "signal")}\n\n## Governance Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.governanceSignals, "signal")}\n\n## Workflow Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${sloSignalMarkdown(analysis.sloReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.sloReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.sloReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.sloReadinessReport.learnerNextSteps)}\n`;
  files["cost-readiness.md"] = `# Cost Readiness\n\n${analysis.costReadinessReport.summary}\n\nSource pattern: ${analysis.costReadinessReport.sourcePattern}\n\n## Cost Setups\n\n${costSetupMarkdown(analysis.costReadinessReport.costSetups)}\n\n## Estimate Signals\n\n${costSignalMarkdown(analysis.costReadinessReport.estimateSignals, "signal")}\n\n## Allocation Signals\n\n${costSignalMarkdown(analysis.costReadinessReport.allocationSignals, "signal")}\n\n## Pricing Signals\n\n${costSignalMarkdown(analysis.costReadinessReport.pricingSignals, "signal")}\n\n## Budget Signals\n\n${costSignalMarkdown(analysis.costReadinessReport.budgetSignals, "signal")}\n\n## Observability Signals\n\n${costSignalMarkdown(analysis.costReadinessReport.observabilitySignals, "signal")}\n\n## Workflow Signals\n\n${costSignalMarkdown(analysis.costReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${costSignalMarkdown(analysis.costReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.costReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.costReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.costReadinessReport.learnerNextSteps)}\n`;
  files["progressive-delivery-readiness.md"] = `# Progressive Delivery Readiness\n\n${analysis.progressiveDeliveryReadinessReport.summary}\n\nSource pattern: ${analysis.progressiveDeliveryReadinessReport.sourcePattern}\n\n## Rollout Setups\n\n${progressiveDeliverySetupMarkdown(analysis.progressiveDeliveryReadinessReport.rolloutSetups)}\n\n## Strategy Signals\n\n${progressiveDeliverySignalMarkdown(analysis.progressiveDeliveryReadinessReport.strategySignals, "signal")}\n\n## Traffic Signals\n\n${progressiveDeliverySignalMarkdown(analysis.progressiveDeliveryReadinessReport.trafficSignals, "signal")}\n\n## Analysis Signals\n\n${progressiveDeliverySignalMarkdown(analysis.progressiveDeliveryReadinessReport.analysisSignals, "signal")}\n\n## Safety Signals\n\n${progressiveDeliverySignalMarkdown(analysis.progressiveDeliveryReadinessReport.safetySignals, "signal")}\n\n## Notification Signals\n\n${progressiveDeliverySignalMarkdown(analysis.progressiveDeliveryReadinessReport.notificationSignals, "signal")}\n\n## Workflow Signals\n\n${progressiveDeliverySignalMarkdown(analysis.progressiveDeliveryReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${progressiveDeliverySignalMarkdown(analysis.progressiveDeliveryReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.progressiveDeliveryReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.progressiveDeliveryReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.progressiveDeliveryReadinessReport.learnerNextSteps)}\n`;
  files["load-testing-readiness.md"] = `# Load Testing Readiness\n\n${analysis.loadTestingReadinessReport.summary}\n\nSource pattern: ${analysis.loadTestingReadinessReport.sourcePattern}\n\n## Load Test Setups\n\n${loadTestingSetupMarkdown(analysis.loadTestingReadinessReport.loadTestSetups)}\n\n## Tool Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.toolSignals, "signal")}\n\n## Profile Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.profileSignals, "signal")}\n\n## Protocol Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.protocolSignals, "signal")}\n\n## Assertion Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.assertionSignals, "signal")}\n\n## Data Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.dataSignals, "signal")}\n\n## Execution Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.executionSignals, "signal")}\n\n## Report Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.reportSignals, "signal")}\n\n## Package Signals\n\n${loadTestingSignalMarkdown(analysis.loadTestingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.loadTestingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.loadTestingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.loadTestingReadinessReport.learnerNextSteps)}\n`;
  files["benchmark-readiness.md"] = `# Benchmark Readiness\n\n${analysis.benchmarkReadinessReport.summary}\n\nSource pattern: ${analysis.benchmarkReadinessReport.sourcePattern}\n\n## Benchmark Suites\n\n${benchmarkSuiteMarkdown(analysis.benchmarkReadinessReport.benchmarkSuites)}\n\n## Tool Signals\n\n${benchmarkSignalMarkdown(analysis.benchmarkReadinessReport.toolSignals, "signal")}\n\n## Timing Signals\n\n${benchmarkSignalMarkdown(analysis.benchmarkReadinessReport.timingSignals, "signal")}\n\n## Comparison Signals\n\n${benchmarkSignalMarkdown(analysis.benchmarkReadinessReport.comparisonSignals, "signal")}\n\n## Report Signals\n\n${benchmarkSignalMarkdown(analysis.benchmarkReadinessReport.reportSignals, "signal")}\n\n## CI Signals\n\n${benchmarkSignalMarkdown(analysis.benchmarkReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${benchmarkSignalMarkdown(analysis.benchmarkReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.benchmarkReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.benchmarkReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.benchmarkReadinessReport.learnerNextSteps)}\n`;
  files["flaky-test-readiness.md"] = `# Flaky Test Readiness\n\n${analysis.flakyTestReadinessReport.summary}\n\nSource pattern: ${analysis.flakyTestReadinessReport.sourcePattern}\n\n## Flaky Test Setups\n\n${flakyTestSetupMarkdown(analysis.flakyTestReadinessReport.flakyTestSetups)}\n\n## Framework Signals\n\n${flakyTestSignalMarkdown(analysis.flakyTestReadinessReport.frameworkSignals, "signal")}\n\n## Retry Signals\n\n${flakyTestSignalMarkdown(analysis.flakyTestReadinessReport.retrySignals, "signal")}\n\n## Quarantine Signals\n\n${flakyTestSignalMarkdown(analysis.flakyTestReadinessReport.quarantineSignals, "signal")}\n\n## Isolation Signals\n\n${flakyTestSignalMarkdown(analysis.flakyTestReadinessReport.isolationSignals, "signal")}\n\n## Artifact Signals\n\n${flakyTestSignalMarkdown(analysis.flakyTestReadinessReport.artifactSignals, "signal")}\n\n## CI Signals\n\n${flakyTestSignalMarkdown(analysis.flakyTestReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${flakyTestSignalMarkdown(analysis.flakyTestReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.flakyTestReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.flakyTestReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.flakyTestReadinessReport.learnerNextSteps)}\n`;
  files["test-impact-readiness.md"] = `# Test Impact Readiness\n\n${analysis.testImpactReadinessReport.summary}\n\nSource pattern: ${analysis.testImpactReadinessReport.sourcePattern}\n\n## Impact Setups\n\n${testImpactSetupMarkdown(analysis.testImpactReadinessReport.impactSetups)}\n\n## Tool Signals\n\n${testImpactSignalMarkdown(analysis.testImpactReadinessReport.toolSignals, "signal")}\n\n## Change Detection Signals\n\n${testImpactSignalMarkdown(analysis.testImpactReadinessReport.changeDetectionSignals, "signal")}\n\n## Selection Signals\n\n${testImpactSignalMarkdown(analysis.testImpactReadinessReport.selectionSignals, "signal")}\n\n## Cache Signals\n\n${testImpactSignalMarkdown(analysis.testImpactReadinessReport.cacheSignals, "signal")}\n\n## CI Signals\n\n${testImpactSignalMarkdown(analysis.testImpactReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${testImpactSignalMarkdown(analysis.testImpactReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.testImpactReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.testImpactReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.testImpactReadinessReport.learnerNextSteps)}\n`;
  files["test-reporting-readiness.md"] = `# Test Reporting Readiness\n\n${analysis.testReportingReadinessReport.summary}\n\nSource pattern: ${analysis.testReportingReadinessReport.sourcePattern}\n\n## Report Setups\n\n${testReportingSetupMarkdown(analysis.testReportingReadinessReport.reportSetups)}\n\n## Format Signals\n\n${testReportingSignalMarkdown(analysis.testReportingReadinessReport.formatSignals, "signal")}\n\n## Adapter Signals\n\n${testReportingSignalMarkdown(analysis.testReportingReadinessReport.adapterSignals, "signal")}\n\n## CI Signals\n\n${testReportingSignalMarkdown(analysis.testReportingReadinessReport.ciSignals, "signal")}\n\n## Output Signals\n\n${testReportingSignalMarkdown(analysis.testReportingReadinessReport.outputSignals, "signal")}\n\n## Quality Signals\n\n${testReportingSignalMarkdown(analysis.testReportingReadinessReport.qualitySignals, "signal")}\n\n## Package Signals\n\n${testReportingSignalMarkdown(analysis.testReportingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.testReportingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.testReportingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.testReportingReadinessReport.learnerNextSteps)}\n`;
  files["snapshot-readiness.md"] = `# Snapshot Readiness\n\n${analysis.snapshotReadinessReport.summary}\n\nSource pattern: ${analysis.snapshotReadinessReport.sourcePattern}\n\n## Snapshot Setups\n\n${snapshotSetupMarkdown(analysis.snapshotReadinessReport.snapshotSetups)}\n\n## Assertion Signals\n\n${snapshotSignalMarkdown(analysis.snapshotReadinessReport.assertionSignals, "signal")}\n\n## Storage Signals\n\n${snapshotSignalMarkdown(analysis.snapshotReadinessReport.storageSignals, "signal")}\n\n## Update Signals\n\n${snapshotSignalMarkdown(analysis.snapshotReadinessReport.updateSignals, "signal")}\n\n## Serializer Signals\n\n${snapshotSignalMarkdown(analysis.snapshotReadinessReport.serializerSignals, "signal")}\n\n## Visual Signals\n\n${snapshotSignalMarkdown(analysis.snapshotReadinessReport.visualSignals, "signal")}\n\n## CI Signals\n\n${snapshotSignalMarkdown(analysis.snapshotReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${snapshotSignalMarkdown(analysis.snapshotReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.snapshotReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.snapshotReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.snapshotReadinessReport.learnerNextSteps)}\n`;
  files["property-based-testing-readiness.md"] = `# Property-Based Testing Readiness\n\n${analysis.propertyBasedTestingReadinessReport.summary}\n\nSource pattern: ${analysis.propertyBasedTestingReadinessReport.sourcePattern}\n\n## Property Setups\n\n${propertyBasedTestingSetupMarkdown(analysis.propertyBasedTestingReadinessReport.propertySetups)}\n\n## Generator Signals\n\n${propertyBasedTestingSignalMarkdown(analysis.propertyBasedTestingReadinessReport.generatorSignals, "signal")}\n\n## Runner Signals\n\n${propertyBasedTestingSignalMarkdown(analysis.propertyBasedTestingReadinessReport.runnerSignals, "signal")}\n\n## Reproduction Signals\n\n${propertyBasedTestingSignalMarkdown(analysis.propertyBasedTestingReadinessReport.reproductionSignals, "signal")}\n\n## Stateful Signals\n\n${propertyBasedTestingSignalMarkdown(analysis.propertyBasedTestingReadinessReport.statefulSignals, "signal")}\n\n## CI Signals\n\n${propertyBasedTestingSignalMarkdown(analysis.propertyBasedTestingReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${propertyBasedTestingSignalMarkdown(analysis.propertyBasedTestingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.propertyBasedTestingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.propertyBasedTestingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.propertyBasedTestingReadinessReport.learnerNextSteps)}\n`;
  files["fuzz-readiness.md"] = `# Fuzz Readiness\n\n${analysis.fuzzReadinessReport.summary}\n\nSource pattern: ${analysis.fuzzReadinessReport.sourcePattern}\n\nRepoTutor records static fuzz readiness only. It does not compile harnesses, launch fuzzers, mutate corpora, or execute generated crash inputs.\n\n## Fuzz Setups\n\n${fuzzSetupMarkdown(analysis.fuzzReadinessReport.fuzzSetups)}\n\n## Harness Signals\n\n${fuzzSignalMarkdown(analysis.fuzzReadinessReport.harnessSignals, "signal")}\n\n## Engine Signals\n\n${fuzzSignalMarkdown(analysis.fuzzReadinessReport.engineSignals, "signal")}\n\n## Build Signals\n\n${fuzzSignalMarkdown(analysis.fuzzReadinessReport.buildSignals, "signal")}\n\n## Runtime Signals\n\n${fuzzSignalMarkdown(analysis.fuzzReadinessReport.runtimeSignals, "signal")}\n\n## Sanitizer Signals\n\n${fuzzSignalMarkdown(analysis.fuzzReadinessReport.sanitizerSignals, "signal")}\n\n## CI Signals\n\n${fuzzSignalMarkdown(analysis.fuzzReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${fuzzSignalMarkdown(analysis.fuzzReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.fuzzReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.fuzzReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.fuzzReadinessReport.learnerNextSteps)}\n`;
  files["test-data-readiness.md"] = `# Test Data Readiness\n\n${analysis.testDataReadinessReport.summary}\n\nSource pattern: ${analysis.testDataReadinessReport.sourcePattern}\n\n## Data Setups\n\n${testDataReadinessSetupMarkdown(analysis.testDataReadinessReport.dataSetups)}\n\n## Factory Signals\n\n${testDataReadinessSignalMarkdown(analysis.testDataReadinessReport.factorySignals, "signal")}\n\n## Relationship Signals\n\n${testDataReadinessSignalMarkdown(analysis.testDataReadinessReport.relationshipSignals, "signal")}\n\n## Generation Signals\n\n${testDataReadinessSignalMarkdown(analysis.testDataReadinessReport.generationSignals, "signal")}\n\n## Reproducibility Signals\n\n${testDataReadinessSignalMarkdown(analysis.testDataReadinessReport.reproducibilitySignals, "signal")}\n\n## Lifecycle Signals\n\n${testDataReadinessSignalMarkdown(analysis.testDataReadinessReport.lifecycleSignals, "signal")}\n\n## CI Signals\n\n${testDataReadinessSignalMarkdown(analysis.testDataReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${testDataReadinessSignalMarkdown(analysis.testDataReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.testDataReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.testDataReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.testDataReadinessReport.learnerNextSteps)}\n`;
  files["database-migration-readiness.md"] = `# Database Migration Readiness\n\n${analysis.databaseMigrationReadinessReport.summary}\n\nSource pattern: ${analysis.databaseMigrationReadinessReport.sourcePattern}\n\n## Migration Setups\n\n${databaseMigrationReadinessSetupMarkdown(analysis.databaseMigrationReadinessReport.migrationSetups)}\n\n## File Signals\n\n${databaseMigrationReadinessSignalMarkdown(analysis.databaseMigrationReadinessReport.fileSignals, "signal")}\n\n## Lineage Signals\n\n${databaseMigrationReadinessSignalMarkdown(analysis.databaseMigrationReadinessReport.lineageSignals, "signal")}\n\n## Rollback Signals\n\n${databaseMigrationReadinessSignalMarkdown(analysis.databaseMigrationReadinessReport.rollbackSignals, "signal")}\n\n## Validation Signals\n\n${databaseMigrationReadinessSignalMarkdown(analysis.databaseMigrationReadinessReport.validationSignals, "signal")}\n\n## Config Signals\n\n${databaseMigrationReadinessSignalMarkdown(analysis.databaseMigrationReadinessReport.configSignals, "signal")}\n\n## CI Signals\n\n${databaseMigrationReadinessSignalMarkdown(analysis.databaseMigrationReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${databaseMigrationReadinessSignalMarkdown(analysis.databaseMigrationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.databaseMigrationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.databaseMigrationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.databaseMigrationReadinessReport.learnerNextSteps)}\n`;
  files["database-orm-readiness.md"] = `# Database ORM Readiness\n\n${analysis.databaseOrmReadinessReport.summary}\n\nSource pattern: ${analysis.databaseOrmReadinessReport.sourcePattern}\n\n## ORM Setups\n\n${databaseOrmReadinessSetupMarkdown(analysis.databaseOrmReadinessReport.ormSetups)}\n\n## Entity Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.entitySignals, "signal")}\n\n## Relation Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.relationSignals, "signal")}\n\n## Repository Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.repositorySignals, "signal")}\n\n## Transaction Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.transactionSignals, "signal")}\n\n## Loading Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.loadingSignals, "signal")}\n\n## Config Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.configSignals, "signal")}\n\n## CI Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${databaseOrmReadinessSignalMarkdown(analysis.databaseOrmReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.databaseOrmReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.databaseOrmReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.databaseOrmReadinessReport.learnerNextSteps)}\n`;
  files["data-transformation-readiness.md"] = `# Data Transformation Readiness\n\n${analysis.dataTransformationReadinessReport.summary}\n\nSource pattern: ${analysis.dataTransformationReadinessReport.sourcePattern}\n\n## Transformation Setups\n\n${dataTransformationReadinessSetupMarkdown(analysis.dataTransformationReadinessReport.transformationSetups)}\n\n## Tool Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.toolSignals, "signal")}\n\n## Model Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.modelSignals, "signal")}\n\n## Dependency Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.dependencySignals, "signal")}\n\n## Incrementality Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.incrementalitySignals, "signal")}\n\n## Environment Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.environmentSignals, "signal")}\n\n## Artifact Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.artifactSignals, "signal")}\n\n## Workflow Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${dataTransformationReadinessSignalMarkdown(analysis.dataTransformationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dataTransformationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dataTransformationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dataTransformationReadinessReport.learnerNextSteps)}\n`;
  files["data-quality-readiness.md"] = `# Data Quality Readiness\n\n${analysis.dataQualityReadinessReport.summary}\n\nSource pattern: ${analysis.dataQualityReadinessReport.sourcePattern}\n\n## Data Quality Setups\n\n${dataQualityReadinessSetupMarkdown(analysis.dataQualityReadinessReport.dataQualitySetups)}\n\n## Great Expectations Signals\n\n${dataQualityReadinessSignalMarkdown(analysis.dataQualityReadinessReport.expectationSignals, "signal")}\n\n## Soda Signals\n\n${dataQualityReadinessSignalMarkdown(analysis.dataQualityReadinessReport.sodaSignals, "signal")}\n\n## dbt Signals\n\n${dataQualityReadinessSignalMarkdown(analysis.dataQualityReadinessReport.dbtSignals, "signal")}\n\n## Quality Dimension Signals\n\n${dataQualityReadinessSignalMarkdown(analysis.dataQualityReadinessReport.qualityDimensionSignals, "signal")}\n\n## Result Signals\n\n${dataQualityReadinessSignalMarkdown(analysis.dataQualityReadinessReport.resultSignals, "signal")}\n\n## CI Signals\n\n${dataQualityReadinessSignalMarkdown(analysis.dataQualityReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${dataQualityReadinessSignalMarkdown(analysis.dataQualityReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dataQualityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dataQualityReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dataQualityReadinessReport.learnerNextSteps)}\n`;
  files["data-lineage-readiness.md"] = `# Data Lineage Readiness\n\n${analysis.dataLineageReadinessReport.summary}\n\nSource pattern: ${analysis.dataLineageReadinessReport.sourcePattern}\n\n## Lineage Setups\n\n${dataLineageReadinessSetupMarkdown(analysis.dataLineageReadinessReport.lineageSetups)}\n\n## Event Signals\n\n${dataLineageReadinessSignalMarkdown(analysis.dataLineageReadinessReport.eventSignals, "signal")}\n\n## Identity Signals\n\n${dataLineageReadinessSignalMarkdown(analysis.dataLineageReadinessReport.identitySignals, "signal")}\n\n## Dataset Signals\n\n${dataLineageReadinessSignalMarkdown(analysis.dataLineageReadinessReport.datasetSignals, "signal")}\n\n## dbt Artifact Signals\n\n${dataLineageReadinessSignalMarkdown(analysis.dataLineageReadinessReport.dbtArtifactSignals, "signal")}\n\n## Storage Signals\n\n${dataLineageReadinessSignalMarkdown(analysis.dataLineageReadinessReport.storageSignals, "signal")}\n\n## CI Signals\n\n${dataLineageReadinessSignalMarkdown(analysis.dataLineageReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${dataLineageReadinessSignalMarkdown(analysis.dataLineageReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dataLineageReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dataLineageReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dataLineageReadinessReport.learnerNextSteps)}\n`;
  files["data-catalog-readiness.md"] = `# Data Catalog Readiness\n\n${analysis.dataCatalogReadinessReport.summary}\n\nSource pattern: ${analysis.dataCatalogReadinessReport.sourcePattern}\n\n## Catalog Setups\n\n${dataCatalogReadinessSetupMarkdown(analysis.dataCatalogReadinessReport.catalogSetups)}\n\n## Ingestion Signals\n\n${dataCatalogReadinessSignalMarkdown(analysis.dataCatalogReadinessReport.ingestionSignals, "signal")}\n\n## Entity Signals\n\n${dataCatalogReadinessSignalMarkdown(analysis.dataCatalogReadinessReport.entitySignals, "signal")}\n\n## Governance Signals\n\n${dataCatalogReadinessSignalMarkdown(analysis.dataCatalogReadinessReport.governanceSignals, "signal")}\n\n## Search Signals\n\n${dataCatalogReadinessSignalMarkdown(analysis.dataCatalogReadinessReport.searchSignals, "signal")}\n\n## Lineage Signals\n\n${dataCatalogReadinessSignalMarkdown(analysis.dataCatalogReadinessReport.lineageSignals, "signal")}\n\n## CI Signals\n\n${dataCatalogReadinessSignalMarkdown(analysis.dataCatalogReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${dataCatalogReadinessSignalMarkdown(analysis.dataCatalogReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dataCatalogReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dataCatalogReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dataCatalogReadinessReport.learnerNextSteps)}\n`;
  files["data-annotation-readiness.md"] = `# Data Annotation Readiness\n\n${analysis.dataAnnotationReadinessReport.summary}\n\nSource pattern: ${analysis.dataAnnotationReadinessReport.sourcePattern}\n\n## Annotation Setups\n\n${dataAnnotationReadinessSetupMarkdown(analysis.dataAnnotationReadinessReport.annotationSetups)}\n\n## Platform Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.platformSignals, "signal")}\n\n## Project Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.projectSignals, "signal")}\n\n## Task Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.taskSignals, "signal")}\n\n## Schema Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.schemaSignals, "signal")}\n\n## Workflow Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.workflowSignals, "signal")}\n\n## Quality Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.qualitySignals, "signal")}\n\n## Prelabel Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.prelabelSignals, "signal")}\n\n## Export Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.exportSignals, "signal")}\n\n## CI Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${dataAnnotationReadinessSignalMarkdown(analysis.dataAnnotationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dataAnnotationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dataAnnotationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dataAnnotationReadinessReport.learnerNextSteps)}\n`;
  files["lakehouse-table-readiness.md"] = `# Lakehouse Table Readiness\n\n${analysis.lakehouseTableReadinessReport.summary}\n\nSource pattern: ${analysis.lakehouseTableReadinessReport.sourcePattern}\n\n## Lakehouse Setups\n\n${lakehouseTableReadinessSetupMarkdown(analysis.lakehouseTableReadinessReport.lakehouseSetups)}\n\n## Format Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.formatSignals, "signal")}\n\n## Table Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.tableSignals, "signal")}\n\n## Metadata Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.metadataSignals, "signal")}\n\n## Schema Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.schemaSignals, "signal")}\n\n## Write Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.writeSignals, "signal")}\n\n## Time Travel Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.timeTravelSignals, "signal")}\n\n## Maintenance Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.maintenanceSignals, "signal")}\n\n## Streaming Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.streamingSignals, "signal")}\n\n## CI Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${lakehouseTableReadinessSignalMarkdown(analysis.lakehouseTableReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.lakehouseTableReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.lakehouseTableReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.lakehouseTableReadinessReport.learnerNextSteps)}\n`;
  files["feature-store-readiness.md"] = `# Feature Store Readiness\n\n${analysis.featureStoreReadinessReport.summary}\n\nSource pattern: ${analysis.featureStoreReadinessReport.sourcePattern}\n\n## Feature Store Setups\n\n${featureStoreReadinessSetupMarkdown(analysis.featureStoreReadinessReport.featureStoreSetups)}\n\n## Definition Signals\n\n${featureStoreReadinessSignalMarkdown(analysis.featureStoreReadinessReport.definitionSignals, "signal")}\n\n## Source Signals\n\n${featureStoreReadinessSignalMarkdown(analysis.featureStoreReadinessReport.sourceSignals, "signal")}\n\n## Storage Signals\n\n${featureStoreReadinessSignalMarkdown(analysis.featureStoreReadinessReport.storageSignals, "signal")}\n\n## Retrieval Signals\n\n${featureStoreReadinessSignalMarkdown(analysis.featureStoreReadinessReport.retrievalSignals, "signal")}\n\n## Materialization Signals\n\n${featureStoreReadinessSignalMarkdown(analysis.featureStoreReadinessReport.materializationSignals, "signal")}\n\n## CI Signals\n\n${featureStoreReadinessSignalMarkdown(analysis.featureStoreReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${featureStoreReadinessSignalMarkdown(analysis.featureStoreReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.featureStoreReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.featureStoreReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.featureStoreReadinessReport.learnerNextSteps)}\n`;
  files["model-registry-readiness.md"] = `# Model Registry Readiness\n\n${analysis.modelRegistryReadinessReport.summary}\n\nSource pattern: ${analysis.modelRegistryReadinessReport.sourcePattern}\n\n## Model Registry Setups\n\n${modelRegistryReadinessSetupMarkdown(analysis.modelRegistryReadinessReport.modelRegistrySetups)}\n\n## Registration Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.registrationSignals, "signal")}\n\n## Metadata Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.metadataSignals, "signal")}\n\n## Artifact Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.artifactSignals, "signal")}\n\n## Lifecycle Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.lifecycleSignals, "signal")}\n\n## Serving Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.servingSignals, "signal")}\n\n## Lineage Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.lineageSignals, "signal")}\n\n## CI Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${modelRegistryReadinessSignalMarkdown(analysis.modelRegistryReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.modelRegistryReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.modelRegistryReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.modelRegistryReadinessReport.learnerNextSteps)}\n`;
  files["experiment-tracking-readiness.md"] = `# Experiment Tracking Readiness\n\n${analysis.experimentTrackingReadinessReport.summary}\n\nSource pattern: ${analysis.experimentTrackingReadinessReport.sourcePattern}\n\n## Experiment Tracking Setups\n\n${experimentTrackingReadinessSetupMarkdown(analysis.experimentTrackingReadinessReport.experimentTrackingSetups)}\n\n## Run Signals\n\n${experimentTrackingReadinessSignalMarkdown(analysis.experimentTrackingReadinessReport.runSignals, "signal")}\n\n## Logging Signals\n\n${experimentTrackingReadinessSignalMarkdown(analysis.experimentTrackingReadinessReport.loggingSignals, "signal")}\n\n## Metadata Signals\n\n${experimentTrackingReadinessSignalMarkdown(analysis.experimentTrackingReadinessReport.metadataSignals, "signal")}\n\n## Automation Signals\n\n${experimentTrackingReadinessSignalMarkdown(analysis.experimentTrackingReadinessReport.automationSignals, "signal")}\n\n## Storage Signals\n\n${experimentTrackingReadinessSignalMarkdown(analysis.experimentTrackingReadinessReport.storageSignals, "signal")}\n\n## CI Signals\n\n${experimentTrackingReadinessSignalMarkdown(analysis.experimentTrackingReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${experimentTrackingReadinessSignalMarkdown(analysis.experimentTrackingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.experimentTrackingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.experimentTrackingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.experimentTrackingReadinessReport.learnerNextSteps)}\n`;
  files["model-monitoring-readiness.md"] = `# Model Monitoring Readiness\n\n${analysis.modelMonitoringReadinessReport.summary}\n\nSource pattern: ${analysis.modelMonitoringReadinessReport.sourcePattern}\n\n## Model Monitoring Setups\n\n${modelMonitoringReadinessSetupMarkdown(analysis.modelMonitoringReadinessReport.modelMonitoringSetups)}\n\n## Dataset Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.datasetSignals, "signal")}\n\n## Drift Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.driftSignals, "signal")}\n\n## Quality Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.qualitySignals, "signal")}\n\n## Performance Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.performanceSignals, "signal")}\n\n## Reporting Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.reportingSignals, "signal")}\n\n## Alert Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.alertSignals, "signal")}\n\n## CI Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${modelMonitoringReadinessSignalMarkdown(analysis.modelMonitoringReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.modelMonitoringReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.modelMonitoringReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.modelMonitoringReadinessReport.learnerNextSteps)}\n`;
  files["model-serving-readiness.md"] = `# Model Serving Readiness\n\n${analysis.modelServingReadinessReport.summary}\n\nSource pattern: ${analysis.modelServingReadinessReport.sourcePattern}\n\n## Model Serving Setups\n\n${modelServingReadinessSetupMarkdown(analysis.modelServingReadinessReport.modelServingSetups)}\n\n## Platform Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.platformSignals, "signal")}\n\n## Runtime Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.runtimeSignals, "signal")}\n\n## Protocol Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.protocolSignals, "signal")}\n\n## Routing Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.routingSignals, "signal")}\n\n## Scaling Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.scalingSignals, "signal")}\n\n## Health Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.healthSignals, "signal")}\n\n## Resource Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.resourceSignals, "signal")}\n\n## Observability Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.observabilitySignals, "signal")}\n\n## CI Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${modelServingReadinessSignalMarkdown(analysis.modelServingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.modelServingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.modelServingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.modelServingReadinessReport.learnerNextSteps)}\n`;
  files["model-training-readiness.md"] = `# Model Training Readiness\n\n${analysis.modelTrainingReadinessReport.summary}\n\nSource pattern: ${analysis.modelTrainingReadinessReport.sourcePattern}\n\n## Model Training Setups\n\n${modelTrainingReadinessSetupMarkdown(analysis.modelTrainingReadinessReport.modelTrainingSetups)}\n\n## Loop Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.loopSignals, "signal")}\n\n## Data Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.dataSignals, "signal")}\n\n## Distributed Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.distributedSignals, "signal")}\n\n## Accelerator Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.acceleratorSignals, "signal")}\n\n## Checkpoint Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.checkpointSignals, "signal")}\n\n## Callback Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.callbackSignals, "signal")}\n\n## Observability Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.observabilitySignals, "signal")}\n\n## Config Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.configSignals, "signal")}\n\n## CI Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${modelTrainingReadinessSignalMarkdown(analysis.modelTrainingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.modelTrainingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.modelTrainingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.modelTrainingReadinessReport.learnerNextSteps)}\n`;
  files["schema-registry-readiness.md"] = `# Schema Registry Readiness\n\n${analysis.schemaRegistryReadinessReport.summary}\n\nSource pattern: ${analysis.schemaRegistryReadinessReport.sourcePattern}\n\n## Registry Setups\n\n${schemaRegistryReadinessSetupMarkdown(analysis.schemaRegistryReadinessReport.registrySetups)}\n\n## Registry Signals\n\n${schemaRegistryReadinessSignalMarkdown(analysis.schemaRegistryReadinessReport.registrySignals, "signal")}\n\n## Schema Format Signals\n\n${schemaRegistryReadinessSignalMarkdown(analysis.schemaRegistryReadinessReport.schemaFormatSignals, "signal")}\n\n## Identity Signals\n\n${schemaRegistryReadinessSignalMarkdown(analysis.schemaRegistryReadinessReport.identitySignals, "signal")}\n\n## Compatibility Signals\n\n${schemaRegistryReadinessSignalMarkdown(analysis.schemaRegistryReadinessReport.compatibilitySignals, "signal")}\n\n## Governance Signals\n\n${schemaRegistryReadinessSignalMarkdown(analysis.schemaRegistryReadinessReport.governanceSignals, "signal")}\n\n## Workflow Signals\n\n${schemaRegistryReadinessSignalMarkdown(analysis.schemaRegistryReadinessReport.workflowSignals, "signal")}\n\n## Package Signals\n\n${schemaRegistryReadinessSignalMarkdown(analysis.schemaRegistryReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.schemaRegistryReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.schemaRegistryReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.schemaRegistryReadinessReport.learnerNextSteps)}\n`;
  return files;
}

export function renderWrongNotesMarkdown(wrongNotes: WrongNote[]): string {
  if (wrongNotes.length === 0) return "# 오답노트\n\n아직 오답이 없습니다.\n";
  return `# 오답노트\n\n${wrongNotes.map((note) => `## ${note.question}\n\n- 내가 고른 답: ${note.selectedChoice}\n- 정답: ${note.correctChoice}\n- 이유: ${note.explanation}\n- 놓친 개념: ${note.relatedConcepts.join(", ")}\n\n${note.miniLesson}\n`).join("\n")}`;
}

export function renderSessionVerificationMarkdown(result: StudySessionVerificationResult): string {
  const status = result.ok ? "PASS" : "FAIL";
  const checks = Object.entries(result.checks)
    .map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`)
    .join("\n");
  const failures = result.failures.length === 0
    ? "- 없음"
    : result.failures.map((failure) => `- ${failure.check}: ${failure.reason} at \`${failure.path}\`${failure.detail ? ` - ${failure.detail.replaceAll("`", "'")}` : ""}`).join("\n");
  return `# 세션 검증\n\n- 상태: ${status}\n- 세션 ID: ${result.sessionId ?? "unknown"}\n- 필수 산출물 검사: ${result.checkedRequiredArtifacts}\n- HTML 파일 검사: ${result.htmlExport?.checkedFiles ?? 0}\n- 소스 근거 검사: ${result.evidenceIndex?.checkedItems ?? 0}\n- 소스 파일 검사: ${result.evidenceIndex?.checkedSourceFiles ?? 0}\n- 소스 링크 검사: ${result.evidenceIndex?.checkedSourceLinks ?? 0}\n- 수업 링크 검사: ${result.evidenceIndex?.checkedLessonLinks ?? 0}\n\n## 검사 항목\n\n${checks}\n\n## 실패 항목\n\n${failures}\n`;
}

export function readmeStudy(session: StudySession): string {
  return `# ${session.repo} Study Session\n\n- Session: ${session.sessionId}\n- Source: ${session.sourceUrl ?? session.localSourcePath ?? session.repo}\n- Created: ${session.createdAt}\n- Mode: ${session.studyMode}\n- Learner level: ${session.learnerLevel}\n\nOpen \`html/index.html\` to continue learning.\nReview \`analysis/session-verification-report.json\` and \`markdown/session-verification.md\` to verify generated artifacts.\n`;
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function bulletsOrNone(items: string[]): string {
  return items.length === 0 ? "- 없음" : bullets(items);
}

function recordSummary(record: Record<string, number> | undefined): string {
  const entries = Object.entries(record ?? {});
  return entries.length === 0 ? "없음" : entries.map(([key, value]) => `${key} ${value}`).join(", ");
}

function recordBullets(record: Record<string, number> | undefined): string {
  const entries = Object.entries(record ?? {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return entries.length === 0 ? "- 없음" : entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function sourceEvidenceBullets(items: Array<{ line: number; kind: string; snippet: string }>, filePath: string): string {
  if (items.length === 0) return "- 기록된 소스 근거가 없습니다.";
  return items.map((item) => `- L${item.line} [${item.kind}] \`${item.snippet.replaceAll("`", "'")}\` ([원본](../source/${encodedPath(filePath)}))`).join("\n");
}

function sourceEvidenceIndexMarkdown(fileLessons: Array<{ filePath: string; sourceEvidence: Array<{ line: number; kind: string; snippet: string }> }>): string {
  const rows = fileLessons.flatMap((lesson) => lesson.sourceEvidence.map((item) => ({ ...item, filePath: lesson.filePath })));
  if (rows.length === 0) return "기록된 소스 근거가 없습니다.\n";
  return rows.map((item) => `## ${item.filePath}:L${item.line}\n\n- 종류: ${item.kind}\n- 파일 수업: [${item.filePath}](files.md#${markdownAnchor(item.filePath)})\n- 원본: [source/${item.filePath}](../source/${encodedPath(item.filePath)})\n\n\`${item.snippet.replaceAll("`", "'")}\``).join("\n\n");
}

function suggestedReadsMarkdown(items: Array<{ rank: number; filePath: string; reason: string; evidenceCount: number; relatedFileCount: number; lessonHref: string; sourceHref: string }>): string {
  if (items.length === 0) return "추천 읽기 후보가 없습니다.\n";
  return items.map((item) => `## ${item.rank}. ${item.filePath}\n\n- 이유: ${item.reason}\n- 소스 근거: ${item.evidenceCount}\n- 관련 파일: ${item.relatedFileCount}\n- 파일 수업: [${item.filePath}](../${item.lessonHref})\n- 원본: [${item.sourceHref}](../${item.sourceHref})`).join("\n\n");
}

function runtimeEnvRows(items: Array<{ filePath: string; signal: string; beginnerExplanation?: string; ecosystem?: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.signal}${item.ecosystem ? ` (${item.ecosystem})` : ""}${item.beginnerExplanation ? ` - ${item.beginnerExplanation}` : ""}`).join("\n");
}

function interfaceMapRows(items: Array<{ filePath: string; kind: string; signal: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.kind} - ${item.signal} ([원본](../${item.sourceHref}))`).join("\n");
}

function symbolRows(items: Array<{ filePath: string; name: string; kind: string; exported: boolean; sourceHref: string; lessonHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.name} [${item.kind}${item.exported ? ", exported" : ""}]: ${item.filePath} ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n");
}

function apiReferenceSymbolRows(items: Array<{ filePath: string; name: string; kind: string; category: string; signature: string; sourceHref: string; lessonHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- \`${item.signature}\` [${item.kind}/${item.category}]: ${item.filePath} ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n");
}

function searchFilterRows(items: Array<{ filter: string; values: Array<{ value: string; documentCount: number }> }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filter}: ${item.values.map((value) => `${value.value} ${value.documentCount}`).join(", ")}`).join("\n");
}

function searchTermRows(items: Array<{ term: string; documentCount: number; documents: string[] }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.term}: ${item.documentCount} docs (${item.documents.slice(0, 5).join(", ")})`).join("\n");
}

function searchDocumentRows(items: Array<{ id: string; title: string; href: string; section: string; sourcePath: string | null; wordCount: number; topTerms: string[] }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.title} [${item.section}]: ${item.wordCount} words, top terms ${item.topTerms.join(", ") || "none"} ([문서](../${item.href}), source ${item.sourcePath ?? "generated"}, id ${item.id})`).join("\n");
}

function learningFocusRows(items: Array<{ label: string; value: string; evidenceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.label}: ${item.value} ([evidence](../${item.evidenceHref}))`).join("\n");
}

function learningMasteryRows(items: Array<{ level: string; label: string; concepts: Array<{ concept: string; status: string; reason: string; reviewPrompt: string; relatedHref: string }> }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((level) => `### ${level.label}\n\n${level.concepts.map((concept) => `- ${concept.concept}: ${concept.status}\n  - Reason: ${concept.reason}\n  - Review: ${concept.reviewPrompt}\n  - Related: [${concept.relatedHref}](../${concept.relatedHref})`).join("\n") || "- 없음"}`).join("\n\n");
}

function learningQuestionRows(items: Array<{ id: string; question: string; promptType: string; relatedHref: string; sourcePattern: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- [ ] ${item.id} [${item.promptType}]: ${item.question} ([related](../${item.relatedHref}))`).join("\n");
}

function learningReviewRows(items: Array<{ concept: string; reviewBy: string; reviewNumber: number; prompt: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- [ ] ${item.concept} (review by: ${item.reviewBy}, #${item.reviewNumber}): ${item.prompt} ([related](../${item.relatedHref}))`).join("\n");
}

function learningPromptRows(items: Array<{ category: string; question: string; useWhen: string; relatedHref: string; hintLevels: string[] }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `### ${item.category}\n\n- Question: ${item.question}\n- Use when: ${item.useWhen}\n- Related: [${item.relatedHref}](../${item.relatedHref})\n- Hints: ${item.hintLevels.join(" / ")}`).join("\n\n");
}

function projectActivitySignalsMarkdown(items: Array<{ label: string; value: string; explanation: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.label}: ${item.value}\n  - ${item.explanation}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function projectActivityHotspotsMarkdown(items: Array<{ filePath: string; score: number; reason: string; signals: string[]; lessonHref: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `### ${item.filePath}\n\n- Score: ${item.score}\n- Reason: ${item.reason}\n- Signals: ${item.signals.join("; ")}\n- Lesson: [${item.lessonHref}](../${item.lessonHref})\n- Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n\n");
}

function projectActivityDeadCodeMarkdown(items: Array<{ filePath: string; confidence: number; reason: string; relatedHref: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: confidence ${item.confidence} - ${item.reason} ([lesson](../${item.relatedHref}), [source](../${item.sourceHref}))`).join("\n");
}

function projectActivityQueuesMarkdown(items: Array<{ queue: string; purpose: string; items: Array<{ target: string; action: string; why: string; relatedHref: string }> }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((queue) => `### ${queue.queue}\n\n${queue.purpose}\n\n${queue.items.map((item) => `- ${item.target}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}`).join("\n\n");
}

function codeMetricsLanguageMarkdown(items: CodeMetricsReadinessReport["languageMetrics"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.language}: files/code/comments/blanks/branches/functions/density ${item.fileCount}/${item.codeLines}/${item.commentLines}/${item.blankLines}/${item.branchCount}/${item.functionCount}/${item.complexityDensity}\n  - Evidence: ${item.evidence}`).join("\n");
}

function codeMetricsHotspotMarkdown(items: CodeMetricsReadinessReport["hotspots"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.language}/${item.readingPriority}]\n  - lines/code/branches/functions/density/score: ${item.lines}/${item.codeLines}/${item.branchCount}/${item.functionCount}/${item.complexityDensity}/${item.hotspotScore}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function codeMetricsSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function codeOwnershipFileMarkdown(items: Array<{ filePath: string; location: string; ruleCount: number; ownerCount: number; teamOwnerCount: number; userOwnerCount: number; emailOwnerCount: number; wildcardCount: number; protectedPathCount: number; duplicatePatternCount: number; selfOwnershipCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.location}/${item.readiness}]\n  - Rules/owners/team/user/email: ${item.ruleCount}/${item.ownerCount}/${item.teamOwnerCount}/${item.userOwnerCount}/${item.emailOwnerCount}\n  - Wildcards/protected/duplicates/self-owned: ${item.wildcardCount}/${item.protectedPathCount}/${item.duplicatePatternCount}/${item.selfOwnershipCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function codeOwnershipSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function largeAssetSetupMarkdown(items: LargeAssetReadinessReport["assetSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.setupType}/${item.readiness}]\n  - LFS patterns/pointers/lockable/commands: ${item.patternCount}/${item.pointerCount}/${item.lockableCount}/${item.commandCount}\n  - DVC outs/deps/metrics/remotes/cache: ${item.outCount}/${item.depCount}/${item.metricCount}/${item.remoteCount}/${item.cacheCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function largeAssetSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function licenseChecklistMarkdown(items: Array<{ label: string; status: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.label} [${item.status}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function licenseFileMarkdown(items: Array<{ filePath: string; filenameScore: number; detectedSpdxId: string | null; confidence: number; matcher: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.detectedSpdxId ?? "unknown"} / confidence ${item.confidence} / filename score ${item.filenameScore} / ${item.matcher}\n  - ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function packageLicenseMarkdown(items: Array<{ filePath: string; packageName: string | null; licenseText: string; detectedSpdxId: string | null; confidence: number; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.packageName ?? "unnamed"} declares ${item.licenseText} -> ${item.detectedSpdxId ?? "unknown"} / confidence ${item.confidence} ([source](../${item.sourceHref}))`).join("\n");
}

function readmeLicenseMarkdown(items: Array<{ filePath: string; detectedSpdxId: string | null; snippet: string; confidence: number; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.detectedSpdxId ?? "unknown"} / confidence ${item.confidence}\n  - \`${item.snippet.replaceAll("`", "'")}\`\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function sbomManifestMarkdown(items: Array<{ filePath: string; ecosystem: string; packageCount: number; directDependencies: number; devDependencies: number; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.ecosystem}, packages ${item.packageCount}, direct ${item.directDependencies}, dev ${item.devDependencies} ([source](../${item.sourceHref}))`).join("\n");
}

function sbomPackageMarkdown(items: Array<{ name: string; version: string | null; ecosystem: string; packageType: string; purl: string | null; licenses: string[]; foundBy: string; locations: string[]; evidenceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.name}${item.version ? `@${item.version}` : ""} [${item.packageType}/${item.ecosystem}]\n  - PURL: ${item.purl ?? "unknown"}\n  - Licenses: ${item.licenses.join(", ") || "unknown"}\n  - Found by: ${item.foundBy}\n  - Locations: ${item.locations.join(", ")}\n  - Evidence: [${item.evidenceHref}](../${item.evidenceHref})`).join("\n");
}

function sbomFileMarkdown(items: Array<{ filePath: string; artifactKind: string; size: number; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.artifactKind}]: ${item.size} bytes ([source](../${item.sourceHref}))`).join("\n");
}

function sbomRelationshipMarkdown(items: Array<{ from: string; to: string; relationshipType: string; evidenceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.slice(0, 80).map((item) => `- ${item.from} --${item.relationshipType}--> ${item.to} ([evidence](../${item.evidenceHref}))`).join("\n");
}

function securityTargetMarkdown(items: Array<{ target: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.target} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function securityCoverageMarkdown(items: Array<{ scanner: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.scanner} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function securitySignalMarkdown(items: Array<{ kind: string; filePath: string; severity: string; message: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.severity} ${item.kind}: ${item.filePath}\n  - ${item.message}\n  - Evidence: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function sastReadinessSetupMarkdown(items: SastReadinessReport["sastSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]
  - Languages/rules/queries/config: ${item.languageCount}/${item.ruleCount}/${item.queryCount}/${item.configCount}
  - Scope/baseline/suppressions/output/CI: ${item.scopeCount}/${item.baselineCount}/${item.suppressionCount}/${item.outputCount}/${item.ciCount}
  - Evidence: ${item.evidence}
  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function sastReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dastReadinessSetupMarkdown(items: DastReadinessReport["dastSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Target/crawl/active/auth/template/safety/output/CI/findings: ${item.targetCount}/${item.crawlerCount}/${item.activeScanCount}/${item.authCount}/${item.templateCount}/${item.safetyCount}/${item.outputCount}/${item.ciCount}/${item.findingCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dastReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function threatModelReadinessSetupMarkdown(items: ThreatModelReadinessReport["threatModelSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Model/assets/flows/boundaries/threats/STRIDE/mitigation/risk/output/CI: ${item.modelCount}/${item.assetCount}/${item.dataFlowCount}/${item.boundaryCount}/${item.threatCount}/${item.strideCount}/${item.mitigationCount}/${item.riskTrackingCount}/${item.outputCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function threatModelReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function scorecardCheckMarkdown(items: Array<{ name: string; score: number | null; status: string; risk: string; evidence: string; remediation: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.name} [${item.status}/${item.risk}]: ${item.score === null ? "unknown" : `${item.score}/10`}\n  - Evidence: ${item.evidence}\n  - Remediation: ${item.remediation}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function scorecardCategoryMarkdown(items: Array<{ category: string; score: number | null; explanation: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.category}: ${item.score === null ? "unknown" : `${item.score}/10`} - ${item.explanation} ([related](../${item.relatedHref}))`).join("\n");
}

function scorecardPolicyMarkdown(items: Array<{ policy: string; result: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.policy} [${item.result}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function provenanceArtifactMarkdown(items: Array<{ artifact: string; artifactType: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.artifact} [${item.artifactType}/${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function provenanceSignatureMarkdown(items: Array<{ material: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.material} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function provenanceAttestationMarkdown(items: Array<{ predicateType: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.predicateType} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function provenanceIdentityMarkdown(items: Array<{ requirement: string; status: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.requirement} [${item.status}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function advisoryTargetMarkdown(items: Array<{ name: string; ecosystem: string; version: string | null; purl: string | null; sourceType: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.name}${item.version ? `@${item.version}` : ""} [${item.ecosystem}/${item.sourceType}/${item.readiness}]\n  - PURL: ${item.purl ?? "unknown"}\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function advisoryLockfileMarkdown(items: Array<{ filePath: string; ecosystem: string; packageCount: number; readiness: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.ecosystem}/${item.readiness}]: ${item.packageCount} package candidate(s) ([source](../${item.sourceHref}))`).join("\n");
}

function advisorySourceMarkdown(items: Array<{ source: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.source} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function advisoryPolicyMarkdown(items: Array<{ control: string; status: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.control} [${item.status}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function advisoryResultMarkdown(items: Array<{ field: string; purpose: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.field} [${item.readiness}]\n  - Purpose: ${item.purpose}\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function vexProductMarkdown(items: Array<{ productId: string; productType: string; version: string | null; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- \`${item.productId}\` [${item.productType}${item.version ? `/${item.version}` : ""}]\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function vexInputMarkdown(items: Array<{ source: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.source} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function vexStatusMarkdown(items: Array<{ status: string; requiredEvidence: string; allowedFields: string[]; filtersScannerResult: boolean; readiness: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.status} [${item.readiness}]\n  - Required evidence: ${item.requiredEvidence}\n  - Allowed fields: ${item.allowedFields.join(", ") || "none"}\n  - Filters scanner result: ${item.filtersScannerResult ? "yes" : "no"}`).join("\n");
}

function vexJustificationMarkdown(items: Array<{ justification: string; useWhen: string; requiresImpactStatement: boolean; readiness: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.justification} [${item.readiness}]\n  - Use when: ${item.useWhen}\n  - Requires impact statement: ${item.requiresImpactStatement ? "yes" : "no"}`).join("\n");
}

function vexStatementMarkdown(items: Array<{ vulnerabilityId: string; productIds: string[]; status: string; justification: string | null; needsHumanReview: boolean; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.vulnerabilityId} [${item.status}]\n  - Products: ${item.productIds.map((product) => `\`${product}\``).join(", ") || "none"}\n  - Justification: ${item.justification ?? "none"}\n  - Human review: ${item.needsHumanReview ? "required" : "not required"}\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function vexWorkflowMarkdown(items: Array<{ step: string; command: string; purpose: string; readiness: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.step} [${item.readiness}]\n  - \`${item.command}\`\n  - ${item.purpose}`).join("\n");
}

function vexAttestationMarkdown(items: Array<{ requirement: string; status: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.requirement} [${item.status}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function policyDocumentMarkdown(items: Array<{ filePath: string; packageName: string | null; ruleCount: number; testRuleCount: number; decisionRules: string[]; readiness: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Package: ${item.packageName ?? "unknown"}\n  - Rules: ${item.ruleCount}, tests: ${item.testRuleCount}\n  - Decision rules: ${item.decisionRules.join(", ") || "none"}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function policyInputMarkdown(items: Array<{ filePath: string; documentType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.documentType}/${item.readiness}]: ${item.evidence} ([source](../${item.sourceHref}))`).join("\n");
}

function policyGateQueryMarkdown(items: Array<{ query: string; purpose: string; readiness: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- \`${item.query}\` [${item.readiness}]\n  - ${item.purpose}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function policyCoverageMarkdown(items: Array<{ target: string; status: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.target} [${item.status}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function policyBundleMarkdown(items: Array<{ requirement: string; status: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.requirement} [${item.status}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function policyDecisionMarkdown(items: Array<{ field: string; purpose: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.field} [${item.readiness}]\n  - Purpose: ${item.purpose}\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function apiContractSchemaMarkdown(items: Array<{ filePath: string; schemaType: string; version: string | null; operationCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.schemaType}/${item.readiness}]\n  - Version: ${item.version ?? "unknown"}\n  - Operations: ${item.operationCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function apiContractOperationMarkdown(items: Array<{ operationId: string | null; method: string | null; path: string | null; source: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.method ?? "operation"} ${item.path ?? item.operationId ?? "unknown"} [${item.readiness}]\n  - ID: ${item.operationId ?? "none"}\n  - Source: ${item.source}\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function apiContractPhaseMarkdown(items: Array<{ phase: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.phase} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function apiContractCheckMarkdown(items: Array<{ check: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.check} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function apiContractRuntimeMarkdown(items: Array<{ target: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.target} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function apiContractReportingMarkdown(items: Array<{ output: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.output} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function consumerContractReadinessSetupMarkdown(items: ConsumerContractReadinessReport["contractSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.role}/${item.readiness}]\n  - Interactions/provider-states/verifiers/brokers/matchers/messages: ${item.interactionCount}/${item.providerStateCount}/${item.verifierCount}/${item.brokerCount}/${item.matcherCount}/${item.messageCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function consumerContractReadinessSignalMarkdown<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function observabilityPipelineMarkdown(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.signal} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function observabilityInstrumentationMarkdown(items: Array<{ filePath: string; kind: string; signal: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.kind}/${item.signal}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function observabilityExporterMarkdown(items: Array<{ target: string; signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.target} [${item.signal}/${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function observabilityResourceMarkdown(items: Array<{ attribute: string; source: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.attribute} [${item.readiness}]\n  - Source: ${item.source}\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function observabilityPropagationMarkdown(items: Array<{ mechanism: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.mechanism} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function observabilityDiagnosticMarkdown(items: Array<{ check: string; status: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.check} [${item.status}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function performanceScriptMarkdown(items: Array<{ filePath: string; kind: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.kind}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function performanceWorkloadMarkdown(items: Array<{ model: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.model} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function performanceThresholdMarkdown(items: Array<{ metric: string; expression: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.metric} [${item.readiness}]\n  - Expression: \`${item.expression.replaceAll("`", "'")}\`\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function performanceCheckMarkdown(items: Array<{ filePath: string; name: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.name} [${item.readiness}]: ${item.evidence} ([source](../${item.sourceHref}))`).join("\n");
}

function performanceMetricMarkdown(items: Array<{ metric: string; metricType: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.metric} [${item.metricType}/${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function performanceOutputMarkdown(items: Array<{ target: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.target} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function performanceRuntimeMarkdown(items: Array<{ control: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.control} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function profilingSetupMarkdown(items: ProfilingReadinessReport["profilingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - CPU/wall/heap/async: ${item.cpuCount}/${item.wallCount}/${item.heapCount}/${item.asyncCount}\n  - Attach/continuous/output: ${item.attachCount}/${item.continuousCount}/${item.outputCount}\n  - Permission/CI: ${item.permissionCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function profilingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function tracingSetupMarkdown(items: TracingReadinessReport["tracingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Tracer/span/propagation/exporter: ${item.tracerCount}/${item.spanCount}/${item.propagationCount}/${item.exporterCount}\n  - Sampling/resource/processor/backend: ${item.samplingCount}/${item.resourceCount}/${item.processorCount}/${item.backendCount}\n  - Storage/query/CI: ${item.storageCount}/${item.queryCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function tracingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function debugSetupMarkdown(items: DebugReadinessReport["debugSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Launch/attach/breakpoint/source-map: ${item.launchCount}/${item.attachCount}/${item.breakpointCount}/${item.sourceMapCount}\n  - Path/runtime/adapter/logs: ${item.pathMappingCount}/${item.runtimeCount}/${item.adapterCount}/${item.logCount}\n  - Test/remote/safety/CI: ${item.testCount}/${item.remoteCount}/${item.safetyCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function debugSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function crashReportingSetupMarkdown(items: CrashReportingReadinessReport["crashSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Event/release/source-map/debug-ID: ${item.eventCount}/${item.releaseCount}/${item.sourceMapCount}/${item.debugIdCount}\n  - Symbols/stacktrace/breadcrumbs/sessions: ${item.symbolCount}/${item.stacktraceCount}/${item.breadcrumbCount}/${item.sessionCount}\n  - Privacy/alerts/artifacts/CI: ${item.privacyCount}/${item.alertCount}/${item.artifactCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function crashReportingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function incidentResponseSetupMarkdown(items: IncidentResponseReadinessReport["incidentSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Incident/routes/escalation/schedule: ${item.incidentCount}/${item.alertRouteCount}/${item.escalationCount}/${item.scheduleCount}\n  - Notify/runbook/status/roles: ${item.notificationCount}/${item.runbookCount}/${item.statusPageCount}/${item.roleCount}\n  - Severity/timeline/postmortem/automation/CI: ${item.severityCount}/${item.timelineCount}/${item.postmortemCount}/${item.automationCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function incidentResponseSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function sloSetupMarkdown(items: SloReadinessReport["sloSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - SLO/SLI/objectives/targets/windows: ${item.sloCount}/${item.sliCount}/${item.objectiveCount}/${item.targetCount}/${item.windowCount}\n  - Budgets/alerts/rules/burn-rate: ${item.budgetCount}/${item.alertCount}/${item.recordingRuleCount}/${item.burnRateCount}\n  - Labels/data/validation/dashboards/CI: ${item.labelCount}/${item.dataSourceCount}/${item.validationCount}/${item.dashboardCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function sloSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function costSetupMarkdown(items: CostReadinessReport["costSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Estimates/diffs/allocations: ${item.estimateCount}/${item.diffCount}/${item.allocationCount}\n  - Pricing/cloud-cost/budgets/alerts: ${item.pricingCount}/${item.cloudCostCount}/${item.budgetCount}/${item.alertCount}\n  - Labels/Prometheus/dashboards/workflows: ${item.labelCount}/${item.prometheusCount}/${item.dashboardCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function costSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function progressiveDeliverySetupMarkdown(items: ProgressiveDeliveryReadinessReport["rolloutSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Strategy/canary/blue-green: ${item.strategyCount}/${item.canaryCount}/${item.blueGreenCount}\n  - Traffic/analysis/metrics/thresholds: ${item.trafficRoutingCount}/${item.analysisCount}/${item.metricCount}/${item.thresholdCount}\n  - Promotion/abort/notifications/workflows: ${item.promotionCount}/${item.abortCount}/${item.notificationCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function progressiveDeliverySignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function loadTestingSetupMarkdown(items: LoadTestingReadinessReport["loadTestSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Config/script/scenario/profile: ${item.configCount}/${item.scriptCount}/${item.scenarioCount}/${item.loadProfileCount}\n  - Threshold/protocol/data/report: ${item.thresholdCount}/${item.protocolCount}/${item.dataCount}/${item.reportCount}\n  - Distributed/CI: ${item.distributedCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function loadTestingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function benchmarkSuiteMarkdown(items: BenchmarkReadinessReport["benchmarkSuites"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Config/tasks/timing: ${item.configCount}/${item.taskCount}/${item.warmupCount + item.iterationCount}\n  - Parameters/hooks/async: ${item.parameterCount}/${item.hookCount}/${item.asyncCount}\n  - Baseline/report/CI: ${item.baselineCount}/${item.reportCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function benchmarkSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function e2eSuiteMarkdown(items: Array<{ filePath: string; framework: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function e2eBrowserMarkdown(items: Array<{ browser: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.browser} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function e2eLocatorMarkdown(items: Array<{ filePath: string; locatorType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.locatorType} [${item.readiness}]: ${item.evidence} ([source](../${item.sourceHref}))`).join("\n");
}

function e2eAssertionMarkdown(items: Array<{ assertion: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.assertion} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function e2eArtifactMarkdown(items: Array<{ artifact: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.artifact} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function e2eRuntimeMarkdown(items: Array<{ target: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.target} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function flakyTestSetupMarkdown(items: FlakyTestReadinessReport["flakyTestSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Retry/rerun/quarantine/fail-on-flaky: ${item.retryCount}/${item.rerunCount}/${item.quarantineCount}/${item.failOnFlakyCount}\n  - Filter/delay/artifact/isolation/timeout/CI: ${item.filterCount}/${item.delayCount}/${item.artifactCount}/${item.isolationCount}/${item.timeoutCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function flakyTestSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function testImpactSetupMarkdown(items: TestImpactReadinessReport["impactSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Affected commands/changed files/base-head/graph/cache: ${item.affectedCommandCount}/${item.changedFileInputCount}/${item.baseHeadCount}/${item.graphCount}/${item.cacheCount}\n  - Watch/selection/report/CI/fallback: ${item.watchCount}/${item.selectionCount}/${item.reportCount}/${item.ciCount}/${item.fallbackCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function testImpactSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function testReportingSetupMarkdown(items: TestReportingReadinessReport["reportSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.format}/${item.readiness}]\n  - JUnit/CTRF/Allure/reporters/outputs: ${item.junitCount}/${item.ctrfCount}/${item.allureCount}/${item.reporterCount}/${item.outputCount}\n  - Summary/annotations/artifacts/history/metadata/CI/fail policy: ${item.summaryCount}/${item.annotationCount}/${item.artifactCount}/${item.historyCount}/${item.metadataCount}/${item.ciCount}/${item.failPolicyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function testReportingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function snapshotSetupMarkdown(items: SnapshotReadinessReport["snapshotSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Text/inline/file/visual/ARIA: ${item.textSnapshotCount}/${item.inlineSnapshotCount}/${item.fileSnapshotCount}/${item.visualSnapshotCount}/${item.ariaSnapshotCount}\n  - Update/serializer/path/threshold/mask/CI/baseline/review: ${item.updatePolicyCount}/${item.serializerCount}/${item.pathTemplateCount}/${item.thresholdCount}/${item.maskingCount}/${item.ciCount}/${item.baselineCount}/${item.reviewCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function snapshotSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function propertyBasedTestingSetupMarkdown(items: PropertyBasedTestingReadinessReport["propertySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.ecosystem}/${item.readiness}]\n  - Properties/generators/assertions: ${item.propertyCount}/${item.generatorCount}/${item.assertionCount}\n  - Shrink/seed/runs/stateful/examples/CI: ${item.shrinkCount}/${item.seedCount}/${item.runCount}/${item.statefulCount}/${item.exampleCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function propertyBasedTestingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function fuzzSetupMarkdown(items: FuzzReadinessReport["fuzzSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.ecosystem}/${item.readiness}]\n  - Target/harness/engine/sanitizer: ${item.targetCount}/${item.harnessCount}/${item.engineCount}/${item.sanitizerCount}\n  - Corpus/dictionary/coverage/CI: ${item.corpusCount}/${item.dictionaryCount}/${item.coverageCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function fuzzSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function testDataReadinessSetupMarkdown(items: TestDataReadinessReport["dataSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.ecosystem}/${item.readiness}]\n  - Factories/traits/associations/sequences/Faker: ${item.factoryCount}/${item.traitCount}/${item.associationCount}/${item.sequenceCount}/${item.fakerCount}\n  - Overrides/persistence/seeds/lint/CI: ${item.overrideCount}/${item.persistenceCount}/${item.seedCount}/${item.lintCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function testDataReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function databaseMigrationReadinessSetupMarkdown(items: DatabaseMigrationReadinessReport["migrationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Versioned/repeatable/changelog/changeset/revision: ${item.versionedCount}/${item.repeatableCount}/${item.changelogCount}/${item.changesetCount}/${item.revisionCount}\n  - Rollback/validation/CI: ${item.rollbackCount}/${item.validationCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function databaseMigrationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function databaseOrmReadinessSetupMarkdown(items: DatabaseOrmReadinessReport["ormSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Entity/relation/repository/session/query: ${item.entityCount}/${item.relationCount}/${item.repositoryCount}/${item.sessionCount}/${item.queryCount}\n  - Transaction/migration/CI: ${item.transactionCount}/${item.migrationCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function databaseOrmReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dataTransformationReadinessSetupMarkdown(items: DataTransformationReadinessReport["transformationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Project/model/source/macro/test: ${item.projectCount}/${item.modelCount}/${item.sourceCount}/${item.macroCount}/${item.testCount}\n  - Incremental/environment/artifact/workflow: ${item.incrementalCount}/${item.environmentCount}/${item.artifactCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataTransformationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dataQualityReadinessSetupMarkdown(items: DataQualityReadinessReport["dataQualitySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Suite/expectation/checkpoint/scan/schema/freshness/result/CI: ${item.suiteCount}/${item.expectationCount}/${item.checkpointCount}/${item.scanCount}/${item.schemaTestCount}/${item.freshnessCount}/${item.resultCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataQualityReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dataLineageReadinessSetupMarkdown(items: DataLineageReadinessReport["lineageSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Event/dataset/job/run/facet/column/artifact/CI: ${item.eventCount}/${item.datasetCount}/${item.jobCount}/${item.runCount}/${item.facetCount}/${item.columnLineageCount}/${item.artifactCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataLineageReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dataCatalogReadinessSetupMarkdown(items: DataCatalogReadinessReport["catalogSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Ingestion/entity/schema/ownership/glossary/tag/lineage/search/policy/CI: ${item.ingestionCount}/${item.entityCount}/${item.schemaCount}/${item.ownershipCount}/${item.glossaryCount}/${item.tagCount}/${item.lineageCount}/${item.searchCount}/${item.policyCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataCatalogReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dataAnnotationReadinessSetupMarkdown(items: DataAnnotationReadinessReport["annotationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Project/task/schema/label/workflow/quality/prelabel/review/export/CI: ${item.projectCount}/${item.taskCount}/${item.schemaCount}/${item.labelCount}/${item.workflowCount}/${item.qualityCount}/${item.prelabelCount}/${item.reviewCount}/${item.exportCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataAnnotationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function lakehouseTableReadinessSetupMarkdown(items: LakehouseTableReadinessReport["lakehouseSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.format}/${item.readiness}]\n  - Table/metadata/transaction/schema/partition/merge/time-travel/maintenance/streaming/CI: ${item.tableCount}/${item.metadataCount}/${item.transactionCount}/${item.schemaCount}/${item.partitionCount}/${item.mergeCount}/${item.timeTravelCount}/${item.maintenanceCount}/${item.streamingCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function lakehouseTableReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function featureStoreReadinessSetupMarkdown(items: FeatureStoreReadinessReport["featureStoreSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Definition/entity/source/offline/online/materialization/retrieval/registry/training/CI: ${item.definitionCount}/${item.entityCount}/${item.sourceCount}/${item.offlineStoreCount}/${item.onlineStoreCount}/${item.materializationCount}/${item.retrievalCount}/${item.registryCount}/${item.trainingDatasetCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function featureStoreReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function modelRegistryReadinessSetupMarkdown(items: ModelRegistryReadinessReport["modelRegistrySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Registered/version/artifact/metadata/alias/stage/lineage/signature/serving/CI: ${item.registeredModelCount}/${item.versionCount}/${item.artifactCount}/${item.metadataCount}/${item.aliasCount}/${item.stageCount}/${item.lineageCount}/${item.signatureCount}/${item.servingCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function modelRegistryReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function experimentTrackingReadinessSetupMarkdown(items: ExperimentTrackingReadinessReport["experimentTrackingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Experiment/run/metric/param/artifact/dataset/tag/config/sweep/offline-sync/CI: ${item.experimentCount}/${item.runCount}/${item.metricCount}/${item.paramCount}/${item.artifactCount}/${item.datasetCount}/${item.tagCount}/${item.configCount}/${item.sweepCount}/${item.offlineSyncCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function experimentTrackingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function modelMonitoringReadinessSetupMarkdown(items: ModelMonitoringReadinessReport["modelMonitoringSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Reference/current/drift/quality/performance: ${item.referenceCount}/${item.currentCount}/${item.driftCount}/${item.qualityCount}/${item.performanceCount}\n  - Report/alert/schedule/CI: ${item.reportCount}/${item.alertCount}/${item.scheduleCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function modelMonitoringReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function modelServingReadinessSetupMarkdown(items: ModelServingReadinessReport["modelServingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Service/runtime/repository/protocol/routing: ${item.inferenceServiceCount}/${item.runtimeCount}/${item.modelRepositoryCount}/${item.protocolCount}/${item.routingCount}\n  - Scaling/health/resource/observability/CI: ${item.autoscalingCount}/${item.healthCount}/${item.resourceCount}/${item.observabilityCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function modelServingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function modelTrainingReadinessSetupMarkdown(items: ModelTrainingReadinessReport["modelTrainingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Trainer/loop/data/optimizer: ${item.trainerCount}/${item.trainingLoopCount}/${item.dataCount}/${item.optimizerCount}\n  - Distributed/accelerator/checkpoint/callback/metric/config/CI: ${item.distributedCount}/${item.acceleratorCount}/${item.checkpointCount}/${item.callbackCount}/${item.metricCount}/${item.configCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function modelTrainingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function integrationTestEnvironmentReadinessSetupMarkdown(items: IntegrationTestEnvironmentReadinessReport["integrationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.ecosystem}/${item.readiness}]\n  - Containers: ${item.containerCount}, modules: ${item.moduleCount}, wait: ${item.hasWaitStrategy ? "yes" : "no"}, cleanup: ${item.hasLifecycleCleanup ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function integrationTestEnvironmentReadinessSignalMarkdown<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function chaosEngineeringReadinessSetupMarkdown(items: ChaosEngineeringReadinessReport["chaosSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Experiments/faults/scope/safety/observability: ${item.experimentCount}/${item.faultCount}/${item.scopeCount}/${item.safetyCount}/${item.observabilityCount}\n  - Selector/duration/probe-or-steady-state: ${item.hasSelector ? "yes" : "no"}/${item.hasDuration ? "yes" : "no"}/${item.hasProbeOrSteadyState ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function chaosEngineeringReadinessSignalMarkdown<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function accessibilityScanTargetMarkdown(items: Array<{ filePath: string; kind: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.kind}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function accessibilityRuleTagMarkdown(items: Array<{ tag: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.tag} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function accessibilityResultBucketMarkdown(items: Array<{ bucket: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.bucket} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function accessibilityImpactMarkdown(items: Array<{ impact: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.impact} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function accessibilityIntegrationMarkdown(items: Array<{ filePath: string; integration: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.integration}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function accessibilityContextMarkdown(items: Array<{ control: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.control} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function storybookStoryFileMarkdown(items: Array<{ filePath: string; format: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.format}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function storybookConfigMarkdown(items: Array<{ filePath: string; configType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function storybookAnnotationMarkdown(items: Array<{ annotation: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.annotation} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function storybookAddonMarkdown(items: Array<{ addon: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.addon} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function storybookTestMarkdown(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.signal} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function storybookPublishMarkdown(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.signal} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function designTokenSourceMarkdown(items: Array<{ filePath: string; format: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.format}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function designTokenCategoryMarkdown(items: Array<{ category: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.category} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function designTokenPlatformMarkdown(items: Array<{ target: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.target} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function designTokenTransformMarkdown(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.signal} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function designTokenUsageMarkdown(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.signal} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function designTokenGovernanceMarkdown(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.signal} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function i18nMessageSourceMarkdown(items: Array<{ filePath: string; mechanism: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.mechanism}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function i18nLocaleAssetMarkdown(items: Array<{ filePath: string; locale: string | null; assetType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.assetType}/${item.readiness}]\n  - Locale: ${item.locale ?? "unknown"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function i18nSignalMarkdown(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.signal} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function releaseConfigMarkdown(items: Array<{ filePath: string; configType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function releaseSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function secretSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function secretSurfaceMarkdown(items: Array<{ filePath: string; surfaceType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.surfaceType}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function secretConfigMarkdown(items: Array<{ filePath: string; signal: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.signal}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function secretManagementReadinessSetupMarkdown(items: SecretManagementReadinessReport["secretManagementSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Auth/engine/policy/injection/rotation/sync/audit/lease/encryption/CLI: ${item.authCount}/${item.engineCount}/${item.policyCount}/${item.injectionCount}/${item.rotationCount}/${item.syncCount}/${item.auditCount}/${item.leaseCount}/${item.encryptionCount}/${item.cliCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function secretManagementReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function containerDockerfileMarkdown(items: Array<{ filePath: string; stageCount: number; baseImages: string[]; instructionKinds: string[]; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Stages: ${item.stageCount}\n  - Base images: ${item.baseImages.join(", ") || "none"}\n  - Instructions: ${item.instructionKinds.join(", ") || "none"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function containerComposeMarkdown(items: Array<{ filePath: string; serviceCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]: ${item.serviceCount} service(s)\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function containerConfigMarkdown(items: Array<{ filePath: string; signal: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.signal}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function containerSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function containerScanSetupMarkdown(items: ContainerScanReadinessReport["containerScanSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - image/vulnerability/misconfig/secret/license/SBOM/policy/output/CI: ${item.imageCount}/${item.vulnerabilityCount}/${item.misconfigCount}/${item.secretCount}/${item.licenseCount}/${item.sbomCount}/${item.policyCount}/${item.outputCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function containerScanSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function codeQualityConfigMarkdown(items: Array<{ filePath: string; tool: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function codeQualitySignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function codeQualityLanguageMarkdown(items: Array<{ language: string; fileCount: number; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.language} [${item.readiness}]: ${item.fileCount} file(s)\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function documentationConfigMarkdown(items: Array<{ filePath: string; configType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function documentationContentMarkdown(items: Array<{ surface: string; count: number; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.surface} [${item.readiness}]: ${item.count} file(s)\n  - Evidence: ${item.evidence}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n");
}

function documentationSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function databaseSchemaMarkdown(items: Array<{ filePath: string; provider: string; datasourceCount: number; generatorCount: number; modelCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Datasources: ${item.datasourceCount}\n  - Generators: ${item.generatorCount}\n  - Models: ${item.modelCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function databaseDatasourceMarkdown(items: Array<{ provider: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.provider} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function databaseSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function ciCdWorkflowMarkdown(items: Array<{ filePath: string; workflowName: string | null; triggerCount: number; jobCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]: ${item.workflowName ?? "unnamed"}\n  - Triggers: ${item.triggerCount}\n  - Jobs: ${item.jobCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function ciCdSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function unitTestFileMarkdown(items: Array<{ filePath: string; framework: string; testCount: number; assertionCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Tests: ${item.testCount}\n  - Assertions: ${item.assertionCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function unitTestConfigMarkdown(items: Array<{ filePath: string; configType: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]: ${item.evidence} ([source](../${item.sourceHref}))`).join("\n");
}

function unitTestSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function coverageReadinessSetupMarkdown(items: CoverageReadinessReport["coverageSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Config/script/reporter/threshold: ${item.configCount}/${item.scriptCount}/${item.reporterCount}/${item.thresholdCount}\n  - Include/exclude/upload/artifact/merge: ${item.includeCount}/${item.excludeCount}/${item.uploadCount}/${item.artifactCount}/${item.mergeCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function coverageReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function mutationTestingSetupMarkdown(items: Array<{ filePath: string; tool: string; configCount: number; mutatePatternCount: number; mutatorCount: number; runnerCount: number; thresholdCount: number; reporterCount: number; timeoutCount: number; incrementalCount: number; ciCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Config: ${item.configCount}, mutate scope: ${item.mutatePatternCount}, mutators: ${item.mutatorCount}, runners: ${item.runnerCount}\n  - Thresholds: ${item.thresholdCount}, reporters: ${item.reporterCount}, timeouts: ${item.timeoutCount}, incremental: ${item.incrementalCount}, CI: ${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function mutationTestingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function typecheckTsconfigMarkdown(items: Array<{ filePath: string; compilerOptionsCount: number; referencesCount: number; includeCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Compiler options: ${item.compilerOptionsCount}\n  - References: ${item.referencesCount}\n  - Include/files lists: ${item.includeCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function typecheckSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function packageManagerManifestMarkdown(items: Array<{ filePath: string; packageManager: string | null; scriptCount: number; dependencyCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Package manager: ${item.packageManager ?? "not declared"}\n  - Scripts: ${item.scriptCount}, dependencies: ${item.dependencyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function packageManagerLockfileMarkdown(items: Array<{ filePath: string; ecosystem: string; version: string | null; importerCount: number; packageCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.ecosystem}/${item.readiness}]\n  - Version: ${item.version ?? "unknown"}\n  - Importers: ${item.importerCount}, packages: ${item.packageCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function packageManagerSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function gitHooksHookMarkdown(items: Array<{ filePath: string; hookName: string; commandCount: number; hasBypassHint: boolean; hasNodePathHint: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.hookName}/${item.readiness}]\n  - Commands: ${item.commandCount}\n  - Bypass hint: ${item.hasBypassHint ? "yes" : "no"}, Node PATH hint: ${item.hasNodePathHint ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function gitHooksToolConfigMarkdown(items: Array<{ filePath: string; tool: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function gitHooksSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function taskRunnerConfigMarkdown(items: Array<{ filePath: string; tool: string; taskCount: number; dependsOnCount: number; outputsCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Tasks: ${item.taskCount}\n  - DependsOn signals: ${item.dependsOnCount}\n  - Outputs signals: ${item.outputsCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function taskRunnerSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dependencyUpdateConfigMarkdown(items: Array<{ filePath: string; configType: string; extendsCount: number; packageRuleCount: number; scheduleCount: number; automergeSignal: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Extends: ${item.extendsCount}\n  - Package rules: ${item.packageRuleCount}\n  - Schedules: ${item.scheduleCount}\n  - Automerge: ${item.automergeSignal}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dependencyUpdateSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dependencyReviewSetupMarkdown(items: Array<{ filePath: string; tool: string; reviewCount: number; vulnerabilityCount: number; licenseCount: number; packagePolicyCount: number; diffCount: number; snapshotCount: number; scorecardCount: number; outputCount: number; ciCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Review signals: ${item.reviewCount}\n  - Vulnerability signals: ${item.vulnerabilityCount}\n  - License signals: ${item.licenseCount}\n  - Package policy signals: ${item.packagePolicyCount}\n  - Diff/snapshot/scorecard/output/CI: ${item.diffCount}/${item.snapshotCount}/${item.scorecardCount}/${item.outputCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dependencyReviewSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function lintReadinessConfigMarkdown(items: Array<{ filePath: string; configType: string; flatConfig: boolean; ruleCount: number; pluginCount: number; ignoreCount: number; parserSignal: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Flat config: ${item.flatConfig ? "yes" : "no"}\n  - Rules: ${item.ruleCount}\n  - Plugins: ${item.pluginCount}\n  - Ignores: ${item.ignoreCount}\n  - Parser: ${item.parserSignal}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function lintReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function formatReadinessConfigMarkdown(items: Array<{ filePath: string; configType: string; optionCount: number; overrideCount: number; pluginCount: number; parserSignal: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Options: ${item.optionCount}\n  - Overrides: ${item.overrideCount}\n  - Plugins: ${item.pluginCount}\n  - Parser: ${item.parserSignal}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function formatReadinessIgnoreMarkdown(items: Array<{ filePath: string; patternCount: number; generatedSignal: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Patterns: ${item.patternCount}\n  - Generated/build signal: ${item.generatedSignal ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function formatReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function commitConventionConfigMarkdown(items: Array<{ filePath: string; configType: string; extendsCount: number; ruleCount: number; parserPreset: string; promptSignal: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Extends: ${item.extendsCount}\n  - Rules: ${item.ruleCount}\n  - Parser preset: ${item.parserPreset}\n  - Prompt: ${item.promptSignal ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function commitConventionSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function changelogReadinessConfigMarkdown(items: Array<{ filePath: string; configType: string; changelogMode: string; baseBranch: string | null; fixedCount: number; linkedCount: number; ignoredCount: number; privatePackagePolicy: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Changelog: ${item.changelogMode}\n  - Base branch: ${item.baseBranch ?? "missing"}\n  - Fixed/linked/ignored: ${item.fixedCount}/${item.linkedCount}/${item.ignoredCount}\n  - Private package policy: ${item.privatePackagePolicy}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function changelogReadinessFileMarkdown(items: Array<{ filePath: string; packageCount: number; bumpTypes: string[]; summaryLines: number; empty: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Packages: ${item.packageCount}\n  - Bump types: ${item.bumpTypes.join(", ") || "none"}\n  - Summary lines: ${item.summaryLines}\n  - Empty changeset: ${item.empty ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function changelogReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function bundleAnalysisConfigMarkdown(items: Array<{ filePath: string; configType: string; analyzerMode: string; defaultSizeMode: string; statsFileSignal: boolean; sourceMapSignal: boolean; budgetSignal: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Analyzer mode: ${item.analyzerMode}\n  - Default size: ${item.defaultSizeMode}\n  - Stats/source map/budget: ${item.statsFileSignal ? "yes" : "no"}/${item.sourceMapSignal ? "yes" : "no"}/${item.budgetSignal ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function bundleAnalysisArtifactMarkdown(items: Array<{ filePath: string; artifactType: string; sizeBytes: number; referencedChunks: number; readiness: string; evidence: string; sourceHref: string | null }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.artifactType}/${item.readiness}]\n  - Size: ${item.sizeBytes} bytes\n  - Chunk/module references: ${item.referencedChunks}\n  - Evidence: ${item.evidence}\n  - Source: ${item.sourceHref ? `[${item.sourceHref}](../${item.sourceHref})` : "not copied as text source"}`).join("\n");
}

function bundleAnalysisSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function mockingReadinessHandlerMarkdown(items: Array<{ filePath: string; environment: string; handlerCount: number; usesHttp: boolean; usesGraphql: boolean; usesWebSocket: boolean; responseSignals: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.environment}/${item.readiness}]\n  - Handlers: ${item.handlerCount}\n  - HTTP/GraphQL/WebSocket: ${item.usesHttp ? "yes" : "no"}/${item.usesGraphql ? "yes" : "no"}/${item.usesWebSocket ? "yes" : "no"}\n  - Response signals: ${item.responseSignals}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function mockingReadinessSetupMarkdown(items: Array<{ filePath: string; setupType: string; startSignal: boolean; lifecycleSignal: boolean; unhandledPolicy: string; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.setupType}/${item.readiness}]\n  - Start/lifecycle: ${item.startSignal ? "yes" : "no"}/${item.lifecycleSignal ? "yes" : "no"}\n  - Unhandled request policy: ${item.unhandledPolicy}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function mockingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dataFetchingClientMarkdown(items: Array<{ filePath: string; framework: string; hasClient: boolean; hasProvider: boolean; devtoolsSignal: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Client/provider/devtools: ${item.hasClient ? "yes" : "no"}/${item.hasProvider ? "yes" : "no"}/${item.devtoolsSignal ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataFetchingUsageMarkdown(items: Array<{ filePath: string; queryCount: number; mutationCount: number; infiniteQueryCount: number; queryKeySignals: number; queryFnSignals: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Queries/mutations/infinite: ${item.queryCount}/${item.mutationCount}/${item.infiniteQueryCount}\n  - Query keys/functions: ${item.queryKeySignals}/${item.queryFnSignals}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataFetchingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function routingSetupMarkdown(items: Array<{ filePath: string; mode: string; hasRouter: boolean; hasProvider: boolean; hasConfig: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.mode}/${item.readiness}]\n  - Router/provider/config: ${item.hasRouter ? "yes" : "no"}/${item.hasProvider ? "yes" : "no"}/${item.hasConfig ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function routingDefinitionMarkdown(items: Array<{ filePath: string; routeCount: number; dynamicSegmentCount: number; nestedSignal: boolean; indexSignal: boolean; layoutSignal: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Routes/dynamic: ${item.routeCount}/${item.dynamicSegmentCount}\n  - Nested/index/layout: ${item.nestedSignal ? "yes" : "no"}/${item.indexSignal ? "yes" : "no"}/${item.layoutSignal ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function routingSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function stateManagementStoreMarkdown(items: Array<{ filePath: string; storeType: string; hasConfigureStore: boolean; hasProvider: boolean; hasTypedHooks: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.storeType}/${item.readiness}]\n  - configureStore/provider/typed hooks: ${item.hasConfigureStore ? "yes" : "no"}/${item.hasProvider ? "yes" : "no"}/${item.hasTypedHooks ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function stateManagementSliceMarkdown(items: Array<{ filePath: string; sliceCount: number; reducerCount: number; actionCount: number; selectorCount: number; usesImmerStyle: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Slices/reducers/actions/selectors: ${item.sliceCount}/${item.reducerCount}/${item.actionCount}/${item.selectorCount}\n  - Immer-style updates: ${item.usesImmerStyle ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function stateManagementSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function formReadinessSetupMarkdown(items: Array<{ filePath: string; library: string; useFormCount: number; hasSubmitHandler: boolean; hasDefaultValues: boolean; hasFormProvider: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.library}/${item.readiness}]\n  - useForm count: ${item.useFormCount}\n  - Submit/defaultValues/provider: ${item.hasSubmitHandler ? "yes" : "no"}/${item.hasDefaultValues ? "yes" : "no"}/${item.hasFormProvider ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function formReadinessFieldMarkdown(items: Array<{ filePath: string; registeredFieldCount: number; controlledFieldCount: number; fieldArrayCount: number; nestedFieldSignals: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Registered/controlled/field arrays/nested: ${item.registeredFieldCount}/${item.controlledFieldCount}/${item.fieldArrayCount}/${item.nestedFieldSignals}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function formReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function authReadinessSetupMarkdown(items: Array<{ filePath: string; framework: string; handlerCount: number; hasAuthFunction: boolean; hasRouteHandler: boolean; hasMiddleware: boolean; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Handlers: ${item.handlerCount}\n  - Auth/route/middleware: ${item.hasAuthFunction ? "yes" : "no"}/${item.hasRouteHandler ? "yes" : "no"}/${item.hasMiddleware ? "yes" : "no"}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function authReadinessSessionMarkdown(items: Array<{ filePath: string; clientSessionCount: number; serverSessionCount: number; providerBoundaryCount: number; signInOutCount: number; readiness: string; evidence: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.readiness}]\n  - Client/server/provider/sign-in-out: ${item.clientSessionCount}/${item.serverSessionCount}/${item.providerBoundaryCount}/${item.signInOutCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function authReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function authorizationReadinessSetupMarkdown(items: AuthorizationReadinessReport["authorizationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Model/relations/roles/permissions: ${item.modelCount}/${item.relationCount}/${item.roleCount}/${item.permissionCount}\n  - Resources/actions/guards/middleware: ${item.resourceCount}/${item.actionCount}/${item.guardCount}/${item.middlewareCount}\n  - Ownership/tests: ${item.ownershipCount}/${item.testCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function authorizationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function paymentReadinessSetupMarkdown(items: PaymentReadinessReport["paymentSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Server client / checkout / payment intents / webhooks: ${item.serverClientCount}/${item.checkoutSessionCount}/${item.paymentIntentCount}/${item.webhookHandlerCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function paymentReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function emailReadinessSetupMarkdown(items: EmailReadinessReport["emailSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Client/send/template/domain/webhook: ${item.clientSetupCount}/${item.sendCallCount}/${item.templateSignalCount}/${item.domainSignalCount}/${item.webhookSignalCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function emailReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function queueReadinessSetupMarkdown(items: QueueReadinessReport["queueSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Queue/worker/scheduler/events/flows: ${item.queueCount}/${item.workerCount}/${item.schedulerCount}/${item.eventCount}/${item.flowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function queueReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function eventStreamReadinessSetupMarkdown(items: EventStreamReadinessReport["eventStreamSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Broker/topic/producer/consumer/group/offset/schema/reliability/security/ops/CI: ${item.brokerCount}/${item.topicCount}/${item.producerCount}/${item.consumerCount}/${item.groupCount}/${item.offsetCount}/${item.schemaCount}/${item.reliabilityCount}/${item.securityCount}/${item.opsCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function eventStreamReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dataConnectorReadinessSetupMarkdown(items: DataConnectorReadinessReport["connectorSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Source/sink/worker/config/offset/state/transform/error/API/workflow: ${item.sourceCount}/${item.sinkCount}/${item.workerCount}/${item.configCount}/${item.offsetCount}/${item.stateCount}/${item.transformCount}/${item.errorCount}/${item.apiCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dataConnectorReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function semanticLayerReadinessSetupMarkdown(items: SemanticLayerReadinessReport["semanticLayerSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Semantic models/metrics/measures/dimensions/entities/joins/saved queries/APIs/cache/access/workflow: ${item.semanticModelCount}/${item.metricCount}/${item.measureCount}/${item.dimensionCount}/${item.entityCount}/${item.joinCount}/${item.savedQueryCount}/${item.apiCount}/${item.cacheCount}/${item.accessCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function semanticLayerReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function biDashboardReadinessSetupMarkdown(items: BiDashboardReadinessReport["dashboardSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Dashboards/charts/queries/datasets/filters/permissions/embeds/alerts/cache/workflow: ${item.dashboardCount}/${item.chartCount}/${item.queryCount}/${item.datasetCount}/${item.filterCount}/${item.permissionCount}/${item.embeddingCount}/${item.alertCount}/${item.cacheCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function biDashboardReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function schemaRegistryReadinessSetupMarkdown(items: SchemaRegistryReadinessReport["registrySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Subject/artifact/version/compatibility/format/reference/config/governance/workflow: ${item.subjectCount}/${item.artifactCount}/${item.versionCount}/${item.compatibilityCount}/${item.formatCount}/${item.referenceCount}/${item.configCount}/${item.governanceCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function schemaRegistryReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function streamProcessingReadinessSetupMarkdown(items: StreamProcessingReadinessReport["streamProcessingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.engine}/${item.readiness}]\n  - Jobs/source/transform/window/watermark/state/checkpoint/sink/deploy/monitor/CI: ${item.jobCount}/${item.sourceCount}/${item.transformCount}/${item.windowCount}/${item.watermarkCount}/${item.stateCount}/${item.checkpointCount}/${item.sinkCount}/${item.deploymentCount}/${item.monitoringCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function streamProcessingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function pipelineOrchestrationReadinessSetupMarkdown(items: PipelineOrchestrationReadinessReport["pipelineOrchestrationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.orchestrator}/${item.readiness}]\n  - DAG/task/dependency/schedule/sensor/asset/partition/retry/backfill/executor/deploy/observability/CI: ${item.dagCount}/${item.taskCount}/${item.dependencyCount}/${item.scheduleCount}/${item.sensorCount}/${item.assetCount}/${item.partitionCount}/${item.retryCount}/${item.backfillCount}/${item.executorCount}/${item.deploymentCount}/${item.observabilityCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function pipelineOrchestrationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function serviceMeshReadinessSetupMarkdown(items: ServiceMeshReadinessReport["serviceMeshSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.mesh}/${item.readiness}]\n  - Control-plane/sidecar/gateway/route/traffic/security/mTLS/identity/telemetry/resilience/multicluster/CI: ${item.controlPlaneCount}/${item.sidecarCount}/${item.gatewayCount}/${item.routeCount}/${item.trafficPolicyCount}/${item.securityPolicyCount}/${item.mtlsCount}/${item.identityCount}/${item.telemetryCount}/${item.resilienceCount}/${item.multiClusterCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function serviceMeshReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function ingressControllerReadinessSetupMarkdown(items: IngressControllerReadinessReport["ingressControllerSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.controller}/${item.readiness}]\n  - Controller/class/route/exposure/TLS: ${item.controllerCount}/${item.ingressClassCount}/${item.routeCount}/${item.serviceExposureCount}/${item.tlsCount}\n  - Middleware/policy/load-balancing/observability/admission/CI: ${item.middlewareCount}/${item.policyCount}/${item.loadBalancingCount}/${item.observabilityCount}/${item.admissionCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function ingressControllerReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dnsReadinessSetupMarkdown(items: DnsReadinessReport["dnsSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Source/provider/zone/record/ownership/policy: ${item.sourceCount}/${item.providerCount}/${item.zoneCount}/${item.recordCount}/${item.ownershipCount}/${item.policyCount}\n  - CoreDNS/automation/observability/CI: ${item.coreDnsCount}/${item.automationCount}/${item.observabilityCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dnsReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function certificateReadinessSetupMarkdown(items: CertificateReadinessReport["certificateSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Resource/issuer/challenge/renewal/secret/key: ${item.resourceCount}/${item.issuerCount}/${item.challengeCount}/${item.renewalCount}/${item.secretCount}/${item.keyCount}\n  - Trust/revocation/observability/CI: ${item.trustCount}/${item.revocationCount}/${item.observabilityCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function certificateReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function helmReadinessSetupMarkdown(items: HelmReadinessReport["helmSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.chartType}/${item.readiness}]\n  - Chart/values/templates/dependencies/schema: ${item.chartCount}/${item.valuesCount}/${item.templateCount}/${item.dependencyCount}/${item.schemaCount}\n  - Test/packaging/release/provenance/CI: ${item.testCount}/${item.packagingCount}/${item.releaseCount}/${item.provenanceCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function helmReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function admissionPolicyReadinessSetupMarkdown(items: AdmissionPolicyReadinessReport["admissionSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Policy/constraint/webhook: ${item.policyCount}/${item.constraintCount}/${item.webhookCount}\n  - Validation/mutation/exception/enforcement: ${item.validationCount}/${item.mutationCount}/${item.exceptionCount}/${item.enforcementCount}\n  - Test/observability/CI: ${item.testCount}/${item.observabilityCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function admissionPolicyReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function apiGatewayReadinessSetupMarkdown(items: ApiGatewayReadinessReport["apiGatewaySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.gateway}/${item.readiness}]
  - Routes/upstreams/auth/plugins: ${item.routeCount}/${item.upstreamCount}/${item.authCount}/${item.pluginCount}
  - Traffic/transform/observability/validation/deployment/CI: ${item.trafficPolicyCount}/${item.transformCount}/${item.observabilityCount}/${item.validationCount}/${item.deploymentCount}/${item.ciCount}
  - Evidence: ${item.evidence}
  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function apiGatewayReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function cacheReadinessSetupMarkdown(items: CacheReadinessReport["cacheSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Client/connect/read/write/TTL: ${item.clientSetupCount}/${item.connectCount}/${item.readCount}/${item.writeCount}/${item.ttlCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function cacheReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function loggingReadinessSetupMarkdown(items: LoggingReadinessReport["loggingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Logger setup / level / calls / child / transport: ${item.loggerSetupCount}/${item.levelCount}/${item.callCount}/${item.childLoggerCount}/${item.transportCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function loggingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function featureFlagReadinessSetupMarkdown(items: FeatureFlagReadinessReport["featureFlagSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Provider/client/evaluation/context/hooks: ${item.providerSetupCount}/${item.clientCount}/${item.evaluationCount}/${item.contextCount}/${item.hookCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function featureFlagReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function rateLimitReadinessSetupMarkdown(items: RateLimitReadinessReport["rateLimitSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Limiter/window/store/consume/headers: ${item.limiterSetupCount}/${item.windowCount}/${item.storeCount}/${item.consumeCount}/${item.headerCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function rateLimitReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function errorTrackingReadinessSetupMarkdown(items: ErrorTrackingReadinessReport["errorTrackingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Init/DSN/capture/scope/integrations: ${item.initCount}/${item.dsnCount}/${item.captureCount}/${item.scopeCount}/${item.integrationCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function errorTrackingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function analyticsReadinessSetupMarkdown(items: AnalyticsReadinessReport["analyticsSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Init/capture/identity/pageview/privacy: ${item.initCount}/${item.captureCount}/${item.identityCount}/${item.pageviewCount}/${item.privacyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function analyticsReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function httpClientReadinessSetupMarkdown(items: HttpClientReadinessReport["httpClientSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Requests/timeouts/retries/hooks/errors: ${item.requestCount}/${item.timeoutCount}/${item.retryCount}/${item.hookCount}/${item.errorCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function httpClientReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function schemaValidationReadinessSetupMarkdown(items: SchemaValidationReadinessReport["schemaSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Schemas/parse/safeParse/refinements/transforms/errors: ${item.schemaCount}/${item.parseCount}/${item.safeParseCount}/${item.refinementCount}/${item.transformCount}/${item.errorCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function schemaValidationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function dateTimeReadinessSetupMarkdown(items: DateTimeReadinessReport["dateTimeSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - DateTime/parse/format/zone/math/validity: ${item.dateTimeCount}/${item.parseCount}/${item.formatCount}/${item.zoneCount}/${item.mathCount}/${item.validityCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function dateTimeReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function idGenerationReadinessSetupMarkdown(items: IdGenerationReadinessReport["idGeneratorSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Generator/secure-random/custom-alphabet/custom-random/validation/usage-risk: ${item.generatorCount}/${item.secureRandomCount}/${item.customAlphabetCount}/${item.customRandomCount}/${item.validationCount}/${item.usageRiskCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function idGenerationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function imageProcessingReadinessSetupMarkdown(items: ImageProcessingReadinessReport["imageProcessingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Pipeline/resize/format/metadata/output/safety: ${item.pipelineCount}/${item.resizeCount}/${item.formatCount}/${item.metadataCount}/${item.outputCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function imageProcessingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function fileUploadReadinessSetupMarkdown(items: FileUploadReadinessReport["fileUploadSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Uploader/restriction/transport/metadata/lifecycle/safety: ${item.uploaderCount}/${item.restrictionCount}/${item.transportCount}/${item.metadataCount}/${item.lifecycleCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function fileUploadReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function webSocketReadinessSetupMarkdown(items: WebSocketReadinessReport["webSocketSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Server/client/upgrade/message/heartbeat/safety: ${item.serverCount}/${item.clientCount}/${item.upgradeCount}/${item.messageCount}/${item.heartbeatCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function webSocketReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function realtimeMediaReadinessSetupMarkdown(items: RealtimeMediaReadinessReport["mediaSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Room/signaling/track/device/publish/subscribe/data/transport/ice/quality/recording/workflow: ${item.roomCount}/${item.signalingCount}/${item.mediaTrackCount}/${item.deviceCount}/${item.publishCount}/${item.subscribeCount}/${item.dataChannelCount}/${item.transportCount}/${item.iceCount}/${item.qualityCount}/${item.recordingCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function realtimeMediaReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function pdfGenerationReadinessSetupMarkdown(items: PdfGenerationReadinessReport["pdfGenerationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Document/page/asset/form/output/safety: ${item.documentCount}/${item.pageCount}/${item.assetCount}/${item.formCount}/${item.outputCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function pdfGenerationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function spreadsheetReadinessSetupMarkdown(items: SpreadsheetReadinessReport["spreadsheetSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Workbook/sheet/input/transform/output/safety: ${item.workbookCount}/${item.sheetCount}/${item.inputCount}/${item.transformCount}/${item.outputCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function spreadsheetReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function chartVisualizationReadinessSetupMarkdown(items: ChartVisualizationReadinessReport["chartSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Config/data/scale/interaction/render/lifecycle/safety: ${item.configCount}/${item.dataCount}/${item.scaleCount}/${item.interactionCount}/${item.renderCount}/${item.lifecycleCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function chartVisualizationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function notebookReadinessSetupMarkdown(items: NotebookReadinessReport["notebookSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Cells/code/markdown/outputs/kernels/execution/dependencies/interactivity/exports/reproducibility/workflow: ${item.cellCount}/${item.codeCellCount}/${item.markdownCellCount}/${item.outputCount}/${item.kernelCount}/${item.executionCount}/${item.dependencyCount}/${item.interactivityCount}/${item.exportCount}/${item.reproducibilityCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function notebookReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function mapVisualizationReadinessSetupMarkdown(items: MapVisualizationReadinessReport["mapSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Maps/tiles/layers/sources/viewport/markers/geometry/interactions/controls/style/tokens/workflow: ${item.mapCount}/${item.tileCount}/${item.layerCount}/${item.sourceCount}/${item.viewportCount}/${item.markerCount}/${item.geometryCount}/${item.interactionCount}/${item.controlCount}/${item.styleCount}/${item.tokenCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function mapVisualizationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function diagramRenderingReadinessSetupMarkdown(items: DiagramRenderingReadinessReport["diagramSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Syntax/render/theme/output/interaction/safety: ${item.syntaxCount}/${item.renderCount}/${item.themeCount}/${item.outputCount}/${item.interactionCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function diagramRenderingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function linkIntegrityReadinessSetupMarkdown(items: LinkIntegrityReadinessReport["linkSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Target/extraction/policy/network/output/CI: ${item.targetCount}/${item.extractionCount}/${item.policyCount}/${item.networkCount}/${item.outputCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function linkIntegrityReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function seoMetadataReadinessSetupMarkdown(items: SeoMetadataReadinessReport["seoSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Crawl/sitemap/metadata/structured/social/AI: ${item.crawlCount}/${item.sitemapCount}/${item.metadataCount}/${item.structuredDataCount}/${item.socialCount}/${item.aiCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function seoMetadataReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function pwaReadinessSetupMarkdown(items: PwaReadinessReport["pwaSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Manifest/service worker/caching/update/install/runtime: ${item.manifestCount}/${item.serviceWorkerCount}/${item.cachingCount}/${item.updateCount}/${item.installCount}/${item.runtimeCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function pwaReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function browserCompatibilityReadinessSetupMarkdown(items: BrowserCompatibilityReadinessReport["compatibilitySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Config/query/coverage/env/update/feature: ${item.configCount}/${item.queryCount}/${item.coverageCount}/${item.envCount}/${item.updateCount}/${item.featureCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function browserCompatibilityReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function browserExtensionReadinessSetupMarkdown(items: BrowserExtensionReadinessReport["extensionSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Manifest/entrypoint/permission/host/messaging/storage/UI/build/publish: ${item.manifestCount}/${item.entrypointCount}/${item.permissionCount}/${item.hostPermissionCount}/${item.messagingCount}/${item.storageCount}/${item.uiSurfaceCount}/${item.buildCount}/${item.publishCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function browserExtensionReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function envValidationReadinessSetupMarkdown(items: EnvValidationReadinessReport["envSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Schema/server/client/runtime/prefix/hook/transform: ${item.schemaCount}/${item.serverCount}/${item.clientCount}/${item.runtimeEnvCount}/${item.prefixCount}/${item.validationHookCount}/${item.transformCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function envValidationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function securityHeadersReadinessSetupMarkdown(items: SecurityHeadersReadinessReport["headerSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - CSP/HSTS/cross-origin/frame/referrer/hardening/disable: ${item.cspCount}/${item.hstsCount}/${item.crossOriginCount}/${item.frameCount}/${item.referrerCount}/${item.hardeningCount}/${item.disableCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function securityHeadersReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function graphqlReadinessSetupMarkdown(items: GraphqlReadinessReport["graphqlSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Schema/operation/resolver/validation/execution/client/codegen: ${item.schemaCount}/${item.operationCount}/${item.resolverCount}/${item.validationCount}/${item.executionCount}/${item.clientCount}/${item.codegenCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function graphqlReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function cliReadinessSetupMarkdown(items: CliReadinessReport["cliSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Command/option/argument/action/parse/help/error/output: ${item.commandCount}/${item.optionCount}/${item.argumentCount}/${item.actionCount}/${item.parseCount}/${item.helpCount}/${item.errorCount}/${item.outputCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function cliReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function llmReadinessSetupMarkdown(items: LlmReadinessReport["llmSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Model/prompt/tool/agent/retrieval/embedding/output/streaming/observability: ${item.modelCount}/${item.promptCount}/${item.toolCount}/${item.agentCount}/${item.retrievalCount}/${item.embeddingCount}/${item.outputCount}/${item.streamingCount}/${item.observabilityCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function llmReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function llmEvalReadinessSetupMarkdown(items: LlmEvalReadinessReport["evalSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Prompt/provider/test/assertion/dataset/judge/redteam/output: ${item.promptCount}/${item.providerCount}/${item.testCaseCount}/${item.assertionCount}/${item.datasetCount}/${item.judgeCount}/${item.redteamCount}/${item.outputCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function llmEvalReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function llmObservabilityReadinessSetupMarkdown(items: LlmObservabilityReadinessReport["observabilitySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Trace/span/generation/session/user/metadata/score/token/cost/prompt/feedback: ${item.traceCount}/${item.spanCount}/${item.generationCount}/${item.sessionCount}/${item.userCount}/${item.metadataCount}/${item.scoreCount}/${item.tokenCount}/${item.costCount}/${item.promptCount}/${item.feedbackCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function llmObservabilityReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function vectorDbReadinessSetupMarkdown(items: VectorDbReadinessReport["vectorSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Collection/vector-config/embedding/upsert/query/filter/hybrid/rerank/tenant/replication/snapshot: ${item.collectionCount}/${item.vectorConfigCount}/${item.embeddingCount}/${item.upsertCount}/${item.queryCount}/${item.filterCount}/${item.hybridCount}/${item.rerankCount}/${item.tenantCount}/${item.replicationCount}/${item.snapshotCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function vectorDbReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function searchServiceReadinessSetupMarkdown(items: SearchServiceReadinessReport["searchSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Index/schema/document/query/filter/facet/ranking/typo/synonym/geo/ops: ${item.indexCount}/${item.schemaCount}/${item.documentCount}/${item.queryCount}/${item.filterCount}/${item.facetCount}/${item.rankingCount}/${item.typoCount}/${item.synonymCount}/${item.geoCount}/${item.opsCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function searchServiceReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function objectStorageReadinessSetupMarkdown(items: ObjectStorageReadinessReport["storageSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Bucket/client/upload/download/list/delete/presign/metadata/policy/lifecycle/replication/encryption/ops: ${item.bucketCount}/${item.clientCount}/${item.uploadCount}/${item.downloadCount}/${item.listCount}/${item.deleteCount}/${item.presignCount}/${item.metadataCount}/${item.policyCount}/${item.lifecycleCount}/${item.replicationCount}/${item.encryptionCount}/${item.opsCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function objectStorageReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function realtimeCollaborationReadinessSetupMarkdown(items: RealtimeCollaborationReadinessReport["collaborationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Doc/shared/provider/presence/sync/persistence/conflict/history/auth/comments: ${item.docCount}/${item.sharedTypeCount}/${item.providerCount}/${item.presenceCount}/${item.syncCount}/${item.persistenceCount}/${item.conflictCount}/${item.historyCount}/${item.authCount}/${item.commentsCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function realtimeCollaborationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function workflowOrchestrationReadinessSetupMarkdown(items: WorkflowOrchestrationReadinessReport["workflowSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Workflow/event/schedule/step/activity/queue/retry/timeout/wait/cancel/concurrency/state/observability: ${item.workflowCount}/${item.eventCount}/${item.scheduleCount}/${item.stepCount}/${item.activityCount}/${item.queueCount}/${item.retryCount}/${item.timeoutCount}/${item.waitCount}/${item.cancelCount}/${item.concurrencyCount}/${item.stateCount}/${item.observabilityCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function workflowOrchestrationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function openApiClientReadinessSetupMarkdown(items: OpenApiClientReadinessReport["clientSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.generator}/${item.readiness}]\n  - Spec/output/client/type/hook/mock/validation/config/script/package: ${item.specCount}/${item.outputCount}/${item.clientCount}/${item.typeCount}/${item.hookCount}/${item.mockCount}/${item.validationCount}/${item.configCount}/${item.scriptCount}/${item.packageCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function openApiClientReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function webhookReadinessSetupMarkdown(items: WebhookReadinessReport["webhookSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Endpoint/signature/replay/idempotency/retry/delivery/event/local-debug/observability/security: ${item.endpointCount}/${item.signatureCount}/${item.replayCount}/${item.idempotencyCount}/${item.retryCount}/${item.deliveryCount}/${item.eventTypeCount}/${item.localDebugCount}/${item.observabilityCount}/${item.securityCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function webhookReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function notificationReadinessSetupMarkdown(items: NotificationReadinessReport["notificationSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Workflow/trigger/subscriber/topic/preference/channel/inbox/template/credential/observability: ${item.workflowCount}/${item.triggerCount}/${item.subscriberCount}/${item.topicCount}/${item.preferenceCount}/${item.channelCount}/${item.inboxCount}/${item.templateCount}/${item.credentialCount}/${item.observabilityCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function notificationReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function consentReadinessSetupMarkdown(items: ConsentReadinessReport["consentSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.provider}/${item.readiness}]\n  - Banner/modal/category/service/purpose/vendor/script/storage/localization/API: ${item.bannerCount}/${item.modalCount}/${item.categoryCount}/${item.serviceCount}/${item.purposeCount}/${item.vendorCount}/${item.scriptBlockingCount}/${item.storageCount}/${item.localizationCount}/${item.apiCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function consentReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function privacyReadinessSetupMarkdown(items: PrivacyReadinessReport["privacySetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Detector/anonymizer/policy/retention/consent/DSAR/DP/CI: ${item.detectorCount}/${item.anonymizerCount}/${item.policyCount}/${item.retentionCount}/${item.consentCount}/${item.dsarCount}/${item.differentialPrivacyCount}/${item.ciCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function privacyReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function serverFrameworkReadinessSetupMarkdown(items: ServerFrameworkReadinessReport["serverSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Route/schema/plugin/hook/decorator/error/runtime/test: ${item.routeCount}/${item.schemaCount}/${item.pluginCount}/${item.hookCount}/${item.decoratorCount}/${item.errorCount}/${item.listenCount}/${item.testCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function serverFrameworkReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function rpcReadinessSetupMarkdown(items: RpcReadinessReport["rpcSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Router/procedure/query/mutation/subscription/validation/middleware/client/adapter/error: ${item.routerCount}/${item.procedureCount}/${item.queryCount}/${item.mutationCount}/${item.subscriptionCount}/${item.validationCount}/${item.middlewareCount}/${item.clientCount}/${item.adapterCount}/${item.errorCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function rpcReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function workspaceGraphReadinessFileMarkdown(items: WorkspaceGraphReadinessReport["workspaceFiles"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.configType}/${item.readiness}]\n  - Projects/targets/tags/implicit deps/named inputs/plugins: ${item.projectCount}/${item.targetCount}/${item.tagCount}/${item.implicitDependencyCount}/${item.namedInputCount}/${item.pluginCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function workspaceGraphReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function scaffoldingReadinessFileMarkdown(items: ScaffoldingReadinessReport["generatorFiles"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.generatorType}/${item.readiness}]\n  - Generators/prompts/actions/templates/helpers/partials/safety: ${item.generatorCount}/${item.promptCount}/${item.actionCount}/${item.templateCount}/${item.helperCount}/${item.partialCount}/${item.safetyCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function scaffoldingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function schedulerReadinessSetupMarkdown(items: SchedulerReadinessReport["schedulerSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Schedules/cron/tasks/timezones/lifecycle/overlap/retry/error: ${item.scheduleCount}/${item.cronExpressionCount}/${item.taskCount}/${item.timezoneCount}/${item.lifecycleCount}/${item.overlapControlCount}/${item.retryCount}/${item.errorCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function schedulerReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function buildToolReadinessSetupMarkdown(items: BuildToolReadinessReport["buildToolSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Config/plugins/dev/build/preview/env/SSR/deps: ${item.configCount}/${item.pluginCount}/${item.devServerCount}/${item.buildCount}/${item.previewCount}/${item.envCount}/${item.ssrCount}/${item.depOptimizationCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function buildToolReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function stylingReadinessSetupMarkdown(items: StylingReadinessReport["stylingSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Config/directives/utilities/theme/variants/content/plugins/build: ${item.configCount}/${item.directiveCount}/${item.utilityCount}/${item.themeCount}/${item.variantCount}/${item.contentScanCount}/${item.pluginCount}/${item.buildIntegrationCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function stylingReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function visualRegressionReadinessSetupMarkdown(items: VisualRegressionReadinessReport["visualRegressionSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Config/actual/expected/diff/threshold/report/plugin/storage/notification: ${item.configCount}/${item.actualCount}/${item.expectedCount}/${item.diffCount}/${item.thresholdCount}/${item.reportCount}/${item.pluginCount}/${item.storageCount}/${item.notificationCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function visualRegressionReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function infrastructureReadinessSetupMarkdown(items: InfrastructureReadinessReport["infrastructureSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Terraform/provider/resource/data/module/variable/output/backend/workflow: ${item.terraformBlockCount}/${item.providerCount}/${item.resourceCount}/${item.dataSourceCount}/${item.moduleCount}/${item.variableCount}/${item.outputCount}/${item.backendCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function infrastructureReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function iacDriftReadinessSetupMarkdown(items: IacDriftReadinessReport["driftSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Inventory/state/refresh/plan/drift/ignore/output/CI/remediation: ${item.inventoryCount}/${item.stateCount}/${item.refreshCount}/${item.planCount}/${item.driftCount}/${item.ignoreCount}/${item.outputCount}/${item.ciCount}/${item.remediationCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function iacDriftReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function deploymentReadinessSetupMarkdown(items: DeploymentReadinessReport["deploymentSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Chart/values/template/manifest/dependency/hook/release: ${item.chartMetadataCount}/${item.valuesCount}/${item.templateCount}/${item.manifestCount}/${item.dependencyCount}/${item.hookCount}/${item.releaseWorkflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function deploymentReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function serverlessReadinessSetupMarkdown(items: ServerlessReadinessReport["serverlessSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Service/provider/function/event/env/IAM/resource/package/plugin/command: ${item.serviceCount}/${item.providerCount}/${item.functionCount}/${item.eventCount}/${item.environmentCount}/${item.iamCount}/${item.resourceCount}/${item.packageCount}/${item.pluginCount}/${item.commandCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function serverlessReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function mobileReadinessSetupMarkdown(items: MobileReadinessReport["mobileSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Config/platform/navigation/build/update/assets/permissions/commands/packages: ${item.appConfigCount}/${item.platformCount}/${item.navigationCount}/${item.buildProfileCount}/${item.updateCount}/${item.assetCount}/${item.permissionCount}/${item.commandCount}/${item.packageCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function mobileReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function desktopReadinessSetupMarkdown(items: DesktopReadinessReport["desktopSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.framework}/${item.readiness}]\n  - Config/window/commands/permissions/bundle/updater/signing/platform/packages: ${item.configCount}/${item.windowCount}/${item.commandCount}/${item.permissionCount}/${item.bundleCount}/${item.updaterCount}/${item.signingCount}/${item.platformCount}/${item.packageCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function desktopReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function edgeReadinessSetupMarkdown(items: EdgeReadinessReport["edgeSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.platform}/${item.readiness}]\n  - Config/handler/binding/routing/dev/deploy/observability/packages: ${item.configCount}/${item.handlerCount}/${item.bindingCount}/${item.routingCount}/${item.devWorkflowCount}/${item.deploymentWorkflowCount}/${item.observabilityCount}/${item.packageCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function edgeReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function composeReadinessSetupMarkdown(items: ComposeReadinessReport["composeSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.format}/${item.readiness}]\n  - Services/build/image/ports/volumes/networks/dependencies/health/env/secrets/profiles/commands: ${item.serviceCount}/${item.buildCount}/${item.imageCount}/${item.portCount}/${item.volumeCount}/${item.networkCount}/${item.dependencyCount}/${item.healthcheckCount}/${item.envCount}/${item.secretConfigCount}/${item.profileCount}/${item.commandCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function composeReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function devContainerReadinessSetupMarkdown(items: DevContainerReadinessReport["devContainerSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.format}/${item.readiness}]\n  - Config/image-build/features/lifecycle/env/mounts/ports/users/customizations/workflows/lockfiles: ${item.configCount}/${item.imageBuildCount}/${item.featureCount}/${item.lifecycleCount}/${item.environmentCount}/${item.mountCount}/${item.portCount}/${item.userCount}/${item.customizationCount}/${item.workflowCount}/${item.lockfileCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function devContainerReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function kubernetesReadinessSetupMarkdown(items: KubernetesReadinessReport["kubernetesSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.format}/${item.readiness}]\n  - Manifest/workload/service/config/storage/security/policy/probes/resources/autoscaling/observability/workflows: ${item.manifestCount}/${item.workloadCount}/${item.serviceCount}/${item.configCount}/${item.storageCount}/${item.securityCount}/${item.policyCount}/${item.probeCount}/${item.resourceCount}/${item.autoscalingCount}/${item.observabilityCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function kubernetesReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function gitopsReadinessSetupMarkdown(items: GitOpsReadinessReport["gitopsSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.controller}/${item.readiness}]\n  - Application/source/destination/sync/generator/Flux source/Flux reconcile/image automation/notification/workflow: ${item.applicationCount}/${item.sourceCount}/${item.destinationCount}/${item.syncPolicyCount}/${item.generatorCount}/${item.fluxSourceCount}/${item.fluxReconcileCount}/${item.imageAutomationCount}/${item.notificationCount}/${item.workflowCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function gitopsReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function backupReadinessSetupMarkdown(items: BackupReadinessReport["backupSetups"]): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath} [${item.tool}/${item.readiness}]\n  - Backup/restore/schedule/storage/retention/verification: ${item.backupCount}/${item.restoreCount}/${item.scheduleCount}/${item.storageCount}/${item.retentionCount}/${item.verificationCount}\n  - Evidence: ${item.evidence}\n  - Source: [${item.sourceHref}](../${item.sourceHref})`).join("\n");
}

function backupReadinessSignalMarkdown<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item[labelKey]} [${item.readiness}]: ${item.evidence} ([related](../${item.relatedHref}))`).join("\n");
}

function contextPackRows(items: Array<{ filePath: string; size: number; estimatedTokens: number; packReason: string; sourceHref: string; lessonHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.estimatedTokens} tokens / ${item.size} bytes - ${item.packReason} ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n");
}

function contextSplitPlanRows(plans: Array<{ name: string; maxBytes: number; partCount: number; parts: Array<{ partName: string; directories: string[]; fileCount: number; estimatedBytes: number; estimatedTokens: number; overLimit: boolean }>; oversizedDirectories: string[] }>): string {
  if (plans.length === 0) return "- 없음";
  return plans.map((plan) => `### ${plan.name}\n\n- max bytes: ${plan.maxBytes}\n- parts: ${plan.partCount}\n- oversized directories: ${plan.oversizedDirectories.join(", ") || "none"}\n\n${plan.parts.map((part) => `- ${part.partName}: ${part.estimatedBytes} bytes / ${part.estimatedTokens} tokens / ${part.fileCount} files / ${part.directories.join(", ")}${part.overLimit ? " / over limit" : ""}`).join("\n") || "- 없음"}`).join("\n\n");
}

function mcpToolRows(items: Array<{ name: string; purpose: string; useWhen: string; recommendedPrompt: string; inputHints: string[] }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `### ${item.name}\n\n- Purpose: ${item.purpose}\n- Use when: ${item.useWhen}\n- Prompt: ${item.recommendedPrompt}\n- Input hints: ${item.inputHints.join("; ")}`).join("\n\n");
}

function agentMemoryLayerRows(items: Array<{ name: string; role: string; generatedArtifact: string; useBefore: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.name}: ${item.role} ([${item.generatedArtifact}](../${item.generatedArtifact})) / before ${item.useBefore}`).join("\n");
}

function agentMemoryNoteRows(items: Array<{ title: string; noteType: string; frontmatter: Array<{ key: string; value: string }>; body: string; relatedReportHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `### ${item.title}\n\nType: ${item.noteType}\n\n\`\`\`yaml\n${item.frontmatter.map((entry) => `${entry.key}: ${entry.value}`).join("\n")}\n\`\`\`\n\n${item.body}\n\n- Related report: [${item.relatedReportHref}](../${item.relatedReportHref})`).join("\n\n");
}

function graphQueryModeRows(items: Array<{ name: string; commandShape: string; purpose: string; useWhen: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `### ${item.name}\n\n- Command: \`${item.commandShape}\`\n- Purpose: ${item.purpose}\n- Use when: ${item.useWhen}`).join("\n\n");
}

function tutorialAbstractionRows(items: Array<{ chapterNumber: number; name: string; description: string; chapterGoal: string; relationshipCount: number; relevantFiles: Array<{ filePath: string; lessonHref: string; sourceHref: string }> }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `### Chapter ${item.chapterNumber}: ${item.name}\n\n${item.description}\n\n- Goal: ${item.chapterGoal}\n- Relationships: ${item.relationshipCount}\n- Files: ${item.relevantFiles.map((file) => `[${file.filePath}](../${file.lessonHref}) / [source](../${file.sourceHref})`).join("; ") || "none"}`).join("\n\n");
}

function decisionRecordRows(items: Array<{ id: string; title: string; status: string; scope: string; context: string; decision: string; consequences: { positive: string[]; negative: string[] }; relatedReports: Array<{ label: string; href: string }>; tags: string[] }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `### ${item.title}\n\n- ID: ${item.id}\n- Status: ${item.status}\n- Scope: ${item.scope}\n- Tags: ${item.tags.join(", ") || "none"}\n\n#### Context\n\n${item.context}\n\n#### Decision\n\n${item.decision}\n\n#### Consequences\n\nPositive:\n${bulletsOrNone(item.consequences.positive)}\n\nNegative:\n${bulletsOrNone(item.consequences.negative)}\n\n#### Related Reports\n\n${item.relatedReports.map((report) => `- [${report.label}](../${report.href})`).join("\n") || "- 없음"}`).join("\n\n");
}

function dependencyCycleRows(items: Array<{ id: string; files: string[]; severity: string; suggestion: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.id} [${item.severity}]: ${item.files.join(" -> ")} - ${item.suggestion}`).join("\n");
}

function fanRows(items: Array<{ filePath: string; count: number }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.count}`).join("\n");
}

function encodedPath(filePath: string): string {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

function markdownAnchor(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");
}

function formatPercentOrNone(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%`;
}

function formatPointDelta(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%p`;
}
