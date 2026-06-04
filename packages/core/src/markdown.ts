import type {
  AnalysisBundle,
} from "./scanner.js";
import type { StudySessionVerificationResult } from "./session-verifier.js";
import type { AnalyticsReadinessReport, BackupReadinessReport, BrowserCompatibilityReadinessReport, BuildToolReadinessReport, CacheReadinessReport, ChartVisualizationReadinessReport, CliReadinessReport, ComposeReadinessReport, DateTimeReadinessReport, DeploymentReadinessReport, DevContainerReadinessReport, DiagramRenderingReadinessReport, EdgeReadinessReport, EmailReadinessReport, EnvValidationReadinessReport, ErrorTrackingReadinessReport, FeatureFlagReadinessReport, FileUploadReadinessReport, GitOpsReadinessReport, GraphqlReadinessReport, HttpClientReadinessReport, IdGenerationReadinessReport, ImageProcessingReadinessReport, InfrastructureReadinessReport, KubernetesReadinessReport, LinkIntegrityReadinessReport, LlmEvalReadinessReport, LlmObservabilityReadinessReport, LlmReadinessReport, LoggingReadinessReport, MobileReadinessReport, ObjectStorageReadinessReport, PaymentReadinessReport, PdfGenerationReadinessReport, PwaReadinessReport, QueueReadinessReport, Quiz, RateLimitReadinessReport, RealtimeCollaborationReadinessReport, RpcReadinessReport, ScaffoldingReadinessReport, SchedulerReadinessReport, SchemaValidationReadinessReport, SearchServiceReadinessReport, SecurityHeadersReadinessReport, SeoMetadataReadinessReport, ServerFrameworkReadinessReport, ServerlessReadinessReport, SpreadsheetReadinessReport, StylingReadinessReport, StudySession, VectorDbReadinessReport, VisualRegressionReadinessReport, WebSocketReadinessReport, WorkspaceGraphReadinessReport, WrongNote } from "@repotutor/shared";

export function markdownFiles(session: StudySession, analysis: AnalysisBundle, quiz: Quiz, wrongNotes: WrongNote[]): Record<string, string> {
  return {
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
    "license-rights.md": `# License Rights\n\n${analysis.licenseRightsReport.summary}\n\nSource pattern: ${analysis.licenseRightsReport.sourcePattern}\n\n## Detected Project License\n\n- SPDX ID: ${analysis.licenseRightsReport.detectedProjectLicense.spdxId ?? "unknown"}\n- Confidence: ${analysis.licenseRightsReport.detectedProjectLicense.confidence}\n- Evidence: ${analysis.licenseRightsReport.detectedProjectLicense.evidence}\n- Source: ${analysis.licenseRightsReport.detectedProjectLicense.sourceHref ? `[${analysis.licenseRightsReport.detectedProjectLicense.sourceHref}](../${analysis.licenseRightsReport.detectedProjectLicense.sourceHref})` : "none"}\n\n## Rights Checklist\n\n${licenseChecklistMarkdown(analysis.licenseRightsReport.rightsChecklist)}\n\n## License Files\n\n${licenseFileMarkdown(analysis.licenseRightsReport.licenseFiles)}\n\n## Package License Signals\n\n${packageLicenseMarkdown(analysis.licenseRightsReport.packageLicenseSignals)}\n\n## README License References\n\n${readmeLicenseMarkdown(analysis.licenseRightsReport.readmeLicenseReferences)}\n\n## Review Warnings\n\n${analysis.licenseRightsReport.reviewWarnings.map((item) => `- ${item.severity}: ${item.message} ([related](../${item.relatedHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.licenseRightsReport.learnerNextSteps)}\n`,
    "sbom.md": `# SBOM\n\n${analysis.sbomReport.summary}\n\nSource pattern: ${analysis.sbomReport.sourcePattern}\n\n## Source Descriptor\n\n- Type: ${analysis.sbomReport.sourceDescriptor.sourceType ?? "unknown"}\n- URL: ${analysis.sbomReport.sourceDescriptor.sourceUrl ?? "none"}\n- Local source: ${analysis.sbomReport.sourceDescriptor.localSourcePath ?? "none"}\n- Branch: ${analysis.sbomReport.sourceDescriptor.branch ?? "unknown"}\n- Commit: ${analysis.sbomReport.sourceDescriptor.commitHash ?? "unknown"}\n- Descriptor: ${analysis.sbomReport.sourceDescriptor.descriptorName} v${analysis.sbomReport.sourceDescriptor.descriptorVersion}\n\n## Package Manifests\n\n${sbomManifestMarkdown(analysis.sbomReport.packageManifests)}\n\n## Package Artifacts\n\n${sbomPackageMarkdown(analysis.sbomReport.packageArtifacts)}\n\n## File Artifacts\n\n${sbomFileMarkdown(analysis.sbomReport.fileArtifacts)}\n\n## Relationships\n\n${sbomRelationshipMarkdown(analysis.sbomReport.relationships)}\n\n## Output Formats\n\n${analysis.sbomReport.outputFormats.map((item) => `- ${item.format} [${item.readiness}]: ${item.reason}`).join("\n")}\n\n## Review Warnings\n\n${analysis.sbomReport.reviewWarnings.map((item) => `- ${item.severity}: ${item.message} ([related](../${item.relatedHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.sbomReport.learnerNextSteps)}\n`,
    "security-readiness.md": `# Security Readiness\n\n${analysis.securityReadinessReport.summary}\n\nSource pattern: ${analysis.securityReadinessReport.sourcePattern}\n\n## Scanner Targets\n\n${securityTargetMarkdown(analysis.securityReadinessReport.scannerTargets)}\n\n## Scanner Coverage\n\n${securityCoverageMarkdown(analysis.securityReadinessReport.scannerCoverage)}\n\n## Security Signals\n\n${securitySignalMarkdown(analysis.securityReadinessReport.securitySignals)}\n\n## Action Queue\n\n${analysis.securityReadinessReport.actionQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## Recommended Commands\n\n${analysis.securityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.securityReadinessReport.learnerNextSteps)}\n`,
    "scorecard.md": `# Project Scorecard\n\n${analysis.scorecardReport.summary}\n\nSource pattern: ${analysis.scorecardReport.sourcePattern}\n\n## Aggregate\n\n- Score: ${analysis.scorecardReport.aggregateScore}/10\n- Checks: ${analysis.scorecardReport.checks.length}\n- Risk queue: ${analysis.scorecardReport.riskQueue.length}\n\n## Checks\n\n${scorecardCheckMarkdown(analysis.scorecardReport.checks)}\n\n## Category Scores\n\n${scorecardCategoryMarkdown(analysis.scorecardReport.categoryScores)}\n\n## Policy Findings\n\n${scorecardPolicyMarkdown(analysis.scorecardReport.policyFindings)}\n\n## Risk Queue\n\n${analysis.scorecardReport.riskQueue.map((item) => `- ${item.priority}: ${item.checkName} - ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## Structured Results\n\n${analysis.scorecardReport.structuredResults.map((item) => `- ${item.checkName} [${item.outcome}]: ${item.probe} - ${item.evidence}`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.scorecardReport.learnerNextSteps)}\n`,
    "provenance.md": `# Provenance Readiness\n\n${analysis.provenanceReport.summary}\n\nSource pattern: ${analysis.provenanceReport.sourcePattern}\n\n## Artifact Signals\n\n${provenanceArtifactMarkdown(analysis.provenanceReport.artifactSignals)}\n\n## Signature Material\n\n${provenanceSignatureMarkdown(analysis.provenanceReport.signatureSignals)}\n\n## Attestation Signals\n\n${provenanceAttestationMarkdown(analysis.provenanceReport.attestationSignals)}\n\n## Identity Requirements\n\n${provenanceIdentityMarkdown(analysis.provenanceReport.identityRequirements)}\n\n## Verification Commands\n\n${analysis.provenanceReport.verificationCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.provenanceReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.provenanceReport.learnerNextSteps)}\n`,
    "advisories.md": `# Advisory Query Readiness\n\n${analysis.advisoryReport.summary}\n\nSource pattern: ${analysis.advisoryReport.sourcePattern}\n\n## Package Query Targets\n\n${advisoryTargetMarkdown(analysis.advisoryReport.packageQueryTargets)}\n\n## Lockfile Signals\n\n${advisoryLockfileMarkdown(analysis.advisoryReport.lockfileSignals)}\n\n## Advisory Sources\n\n${advisorySourceMarkdown(analysis.advisoryReport.advisorySources)}\n\n## Policy Controls\n\n${advisoryPolicyMarkdown(analysis.advisoryReport.policyControls)}\n\n## Result Model\n\n${advisoryResultMarkdown(analysis.advisoryReport.resultModel)}\n\n## Recommended Commands\n\n${analysis.advisoryReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Remediation Queue\n\n${analysis.advisoryReport.remediationQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.advisoryReport.learnerNextSteps)}\n`,
    "vex.md": `# OpenVEX Impact Readiness\n\n${analysis.vexReport.summary}\n\nSource pattern: ${analysis.vexReport.sourcePattern}\n\n## Product Targets\n\n${vexProductMarkdown(analysis.vexReport.productTargets)}\n\n## Vulnerability Inputs\n\n${vexInputMarkdown(analysis.vexReport.vulnerabilityInputs)}\n\n## Status Matrix\n\n${vexStatusMarkdown(analysis.vexReport.statusMatrix)}\n\n## Justification Catalog\n\n${vexJustificationMarkdown(analysis.vexReport.justificationCatalog)}\n\n## Statement Drafts\n\n${vexStatementMarkdown(analysis.vexReport.statementDrafts)}\n\n## Document Workflow\n\n${vexWorkflowMarkdown(analysis.vexReport.documentWorkflow)}\n\n## Attestation Readiness\n\n${vexAttestationMarkdown(analysis.vexReport.attestationReadiness)}\n\n## Risk Queue\n\n${analysis.vexReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.vexReport.learnerNextSteps)}\n`,
    "policy-gates.md": `# Policy Gate Readiness\n\n${analysis.policyGateReport.summary}\n\nSource pattern: ${analysis.policyGateReport.sourcePattern}\n\n## Policy Documents\n\n${policyDocumentMarkdown(analysis.policyGateReport.policyDocuments)}\n\n## Input Documents\n\n${policyInputMarkdown(analysis.policyGateReport.inputDocuments)}\n\n## Gate Queries\n\n${policyGateQueryMarkdown(analysis.policyGateReport.gateQueries)}\n\n## Test Coverage\n\n${policyCoverageMarkdown(analysis.policyGateReport.testCoverage)}\n\n## Bundle Readiness\n\n${policyBundleMarkdown(analysis.policyGateReport.bundleReadiness)}\n\n## Decision Outputs\n\n${policyDecisionMarkdown(analysis.policyGateReport.decisionOutputs)}\n\n## Recommended Commands\n\n${analysis.policyGateReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.policyGateReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.policyGateReport.learnerNextSteps)}\n`,
    "api-contracts.md": `# API Contract Readiness\n\n${analysis.apiContractReport.summary}\n\nSource pattern: ${analysis.apiContractReport.sourcePattern}\n\n## Schema Documents\n\n${apiContractSchemaMarkdown(analysis.apiContractReport.schemaDocuments)}\n\n## Operation Targets\n\n${apiContractOperationMarkdown(analysis.apiContractReport.operationTargets)}\n\n## Test Phases\n\n${apiContractPhaseMarkdown(analysis.apiContractReport.testPhases)}\n\n## Check Matrix\n\n${apiContractCheckMarkdown(analysis.apiContractReport.checkMatrix)}\n\n## Runtime Targets\n\n${apiContractRuntimeMarkdown(analysis.apiContractReport.runtimeTargets)}\n\n## Reporting Outputs\n\n${apiContractReportingMarkdown(analysis.apiContractReport.reportingOutputs)}\n\n## Recommended Commands\n\n${analysis.apiContractReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.apiContractReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.apiContractReport.learnerNextSteps)}\n`,
    "observability.md": `# Observability Readiness\n\n${analysis.observabilityReport.summary}\n\nSource pattern: ${analysis.observabilityReport.sourcePattern}\n\n## Signal Pipelines\n\n${observabilityPipelineMarkdown(analysis.observabilityReport.signalPipelines)}\n\n## Instrumentation Signals\n\n${observabilityInstrumentationMarkdown(analysis.observabilityReport.instrumentationSignals)}\n\n## Exporter Targets\n\n${observabilityExporterMarkdown(analysis.observabilityReport.exporterTargets)}\n\n## Resource Attributes\n\n${observabilityResourceMarkdown(analysis.observabilityReport.resourceAttributes)}\n\n## Propagation Context\n\n${observabilityPropagationMarkdown(analysis.observabilityReport.propagationContext)}\n\n## Diagnostics\n\n${observabilityDiagnosticMarkdown(analysis.observabilityReport.diagnostics)}\n\n## Recommended Commands\n\n${analysis.observabilityReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.observabilityReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.observabilityReport.learnerNextSteps)}\n`,
    "performance.md": `# Performance Readiness\n\n${analysis.performanceReport.summary}\n\nSource pattern: ${analysis.performanceReport.sourcePattern}\n\n## Script Targets\n\n${performanceScriptMarkdown(analysis.performanceReport.scriptTargets)}\n\n## Workload Models\n\n${performanceWorkloadMarkdown(analysis.performanceReport.workloadModels)}\n\n## Thresholds\n\n${performanceThresholdMarkdown(analysis.performanceReport.thresholds)}\n\n## Checks\n\n${performanceCheckMarkdown(analysis.performanceReport.checks)}\n\n## Metrics\n\n${performanceMetricMarkdown(analysis.performanceReport.metrics)}\n\n## Outputs\n\n${performanceOutputMarkdown(analysis.performanceReport.outputs)}\n\n## Runtime Controls\n\n${performanceRuntimeMarkdown(analysis.performanceReport.runtimeControls)}\n\n## Recommended Commands\n\n${analysis.performanceReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.performanceReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.performanceReport.learnerNextSteps)}\n`,
    "e2e.md": `# E2E Readiness\n\n${analysis.e2eReport.summary}\n\nSource pattern: ${analysis.e2eReport.sourcePattern}\n\n## Test Suites\n\n${e2eSuiteMarkdown(analysis.e2eReport.testSuites)}\n\n## Browser Projects\n\n${e2eBrowserMarkdown(analysis.e2eReport.browserProjects)}\n\n## Locator Signals\n\n${e2eLocatorMarkdown(analysis.e2eReport.locatorSignals)}\n\n## Assertions\n\n${e2eAssertionMarkdown(analysis.e2eReport.assertions)}\n\n## Artifacts\n\n${e2eArtifactMarkdown(analysis.e2eReport.artifacts)}\n\n## Runtime Targets\n\n${e2eRuntimeMarkdown(analysis.e2eReport.runtimeTargets)}\n\n## Recommended Commands\n\n${analysis.e2eReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.e2eReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.e2eReport.learnerNextSteps)}\n`,
    "accessibility.md": `# Accessibility Readiness\n\n${analysis.accessibilityReport.summary}\n\nSource pattern: ${analysis.accessibilityReport.sourcePattern}\n\n## Scan Targets\n\n${accessibilityScanTargetMarkdown(analysis.accessibilityReport.scanTargets)}\n\n## Rule Tags\n\n${accessibilityRuleTagMarkdown(analysis.accessibilityReport.ruleTags)}\n\n## Result Buckets\n\n${accessibilityResultBucketMarkdown(analysis.accessibilityReport.resultBuckets)}\n\n## Impact Levels\n\n${accessibilityImpactMarkdown(analysis.accessibilityReport.impactLevels)}\n\n## Integration Signals\n\n${accessibilityIntegrationMarkdown(analysis.accessibilityReport.integrationSignals)}\n\n## Context Controls\n\n${accessibilityContextMarkdown(analysis.accessibilityReport.contextControls)}\n\n## Recommended Commands\n\n${analysis.accessibilityReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.accessibilityReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.accessibilityReport.learnerNextSteps)}\n`,
    "storybook.md": `# Storybook Readiness\n\n${analysis.storybookReport.summary}\n\nSource pattern: ${analysis.storybookReport.sourcePattern}\n\n## Story Files\n\n${storybookStoryFileMarkdown(analysis.storybookReport.storyFiles)}\n\n## Config Files\n\n${storybookConfigMarkdown(analysis.storybookReport.configFiles)}\n\n## Story Annotations\n\n${storybookAnnotationMarkdown(analysis.storybookReport.storyAnnotations)}\n\n## Addon Signals\n\n${storybookAddonMarkdown(analysis.storybookReport.addonSignals)}\n\n## Test Signals\n\n${storybookTestMarkdown(analysis.storybookReport.testSignals)}\n\n## Publish Signals\n\n${storybookPublishMarkdown(analysis.storybookReport.publishSignals)}\n\n## Recommended Commands\n\n${analysis.storybookReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.storybookReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.storybookReport.learnerNextSteps)}\n`,
    "design-tokens.md": `# Design Tokens Readiness\n\n${analysis.designTokensReport.summary}\n\nSource pattern: ${analysis.designTokensReport.sourcePattern}\n\n## Token Sources\n\n${designTokenSourceMarkdown(analysis.designTokensReport.tokenSources)}\n\n## Token Categories\n\n${designTokenCategoryMarkdown(analysis.designTokensReport.tokenCategories)}\n\n## Platform Targets\n\n${designTokenPlatformMarkdown(analysis.designTokensReport.platformTargets)}\n\n## Transform Signals\n\n${designTokenTransformMarkdown(analysis.designTokensReport.transformSignals)}\n\n## Usage Signals\n\n${designTokenUsageMarkdown(analysis.designTokensReport.usageSignals)}\n\n## Governance Signals\n\n${designTokenGovernanceMarkdown(analysis.designTokensReport.governanceSignals)}\n\n## Recommended Commands\n\n${analysis.designTokensReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.designTokensReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.designTokensReport.learnerNextSteps)}\n`,
    "i18n.md": `# I18n Readiness\n\n${analysis.i18nReport.summary}\n\nSource pattern: ${analysis.i18nReport.sourcePattern}\n\n## Message Sources\n\n${i18nMessageSourceMarkdown(analysis.i18nReport.messageSources)}\n\n## Locale Assets\n\n${i18nLocaleAssetMarkdown(analysis.i18nReport.localeAssets)}\n\n## Runtime Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.runtimeSignals)}\n\n## Extraction Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.extractionSignals)}\n\n## ICU Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.icuSignals)}\n\n## QA Signals\n\n${i18nSignalMarkdown(analysis.i18nReport.qaSignals)}\n\n## Recommended Commands\n\n${analysis.i18nReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.i18nReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.i18nReport.learnerNextSteps)}\n`,
    "release-readiness.md": `# Release Readiness\n\n${analysis.releaseReadinessReport.summary}\n\nSource pattern: ${analysis.releaseReadinessReport.sourcePattern}\n\n## Release Configs\n\n${releaseConfigMarkdown(analysis.releaseReadinessReport.releaseConfigs)}\n\n## Branch Channels\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.branchChannels, "channel")}\n\n## Version Signals\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.versionSignals, "signal")}\n\n## CI Signals\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.ciSignals, "signal")}\n\n## Publish Targets\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.publishTargets, "target")}\n\n## Auth Signals\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.authSignals, "signal")}\n\n## Plugin Steps\n\n${releaseSignalMarkdown(analysis.releaseReadinessReport.pluginSteps, "step")}\n\n## Recommended Commands\n\n${analysis.releaseReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.releaseReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.releaseReadinessReport.learnerNextSteps)}\n`,
    "secret-readiness.md": `# Secret Readiness\n\n${analysis.secretReadinessReport.summary}\n\nSource pattern: ${analysis.secretReadinessReport.sourcePattern}\n\n## Scan Targets\n\n${secretSignalMarkdown(analysis.secretReadinessReport.scanTargets, "target")}\n\n## Secret Surfaces\n\n${secretSurfaceMarkdown(analysis.secretReadinessReport.secretSurfaces)}\n\n## Config Signals\n\n${secretConfigMarkdown(analysis.secretReadinessReport.configSignals)}\n\n## Reporting Signals\n\n${secretSignalMarkdown(analysis.secretReadinessReport.reportingSignals, "signal")}\n\n## Prevention Signals\n\n${secretSignalMarkdown(analysis.secretReadinessReport.preventionSignals, "signal")}\n\n## Advanced Signals\n\n${secretSignalMarkdown(analysis.secretReadinessReport.advancedSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.secretReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.secretReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.secretReadinessReport.learnerNextSteps)}\n`,
    "container-readiness.md": `# Container Readiness\n\n${analysis.containerReadinessReport.summary}\n\nSource pattern: ${analysis.containerReadinessReport.sourcePattern}\n\n## Dockerfiles\n\n${containerDockerfileMarkdown(analysis.containerReadinessReport.dockerfiles)}\n\n## Compose Files\n\n${containerComposeMarkdown(analysis.containerReadinessReport.composeFiles)}\n\n## Config Signals\n\n${containerConfigMarkdown(analysis.containerReadinessReport.configSignals)}\n\n## Instruction Risks\n\n${containerSignalMarkdown(analysis.containerReadinessReport.instructionRisks, "rule")}\n\n## Label Policy\n\n${containerSignalMarkdown(analysis.containerReadinessReport.labelPolicy, "label")}\n\n## Integration Signals\n\n${containerSignalMarkdown(analysis.containerReadinessReport.integrationSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.containerReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.containerReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.containerReadinessReport.learnerNextSteps)}\n`,
    "code-quality.md": `# Code Quality\n\n${analysis.codeQualityReport.summary}\n\nSource pattern: ${analysis.codeQualityReport.sourcePattern}\n\n## Tool Configs\n\n${codeQualityConfigMarkdown(analysis.codeQualityReport.toolConfigs)}\n\n## Formatter Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.formatterSignals, "signal")}\n\n## Linter Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.linterSignals, "signal")}\n\n## Assist Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.assistSignals, "signal")}\n\n## CI Signals\n\n${codeQualitySignalMarkdown(analysis.codeQualityReport.ciSignals, "signal")}\n\n## Language Coverage\n\n${codeQualityLanguageMarkdown(analysis.codeQualityReport.languageCoverage)}\n\n## Recommended Commands\n\n${analysis.codeQualityReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.codeQualityReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.codeQualityReport.learnerNextSteps)}\n`,
    "documentation.md": `# Documentation Readiness\n\n${analysis.documentationReport.summary}\n\nSource pattern: ${analysis.documentationReport.sourcePattern}\n\n## Site Configs\n\n${documentationConfigMarkdown(analysis.documentationReport.siteConfigs)}\n\n## Content Surfaces\n\n${documentationContentMarkdown(analysis.documentationReport.contentSurfaces)}\n\n## Navigation Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.navigationSignals, "signal")}\n\n## Quality Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.qualitySignals, "signal")}\n\n## Localization Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.localizationSignals, "signal")}\n\n## Release Signals\n\n${documentationSignalMarkdown(analysis.documentationReport.releaseSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.documentationReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.documentationReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.documentationReport.learnerNextSteps)}\n`,
    "database-readiness.md": `# Database Readiness\n\n${analysis.databaseReadinessReport.summary}\n\nSource pattern: ${analysis.databaseReadinessReport.sourcePattern}\n\n## Schema Files\n\n${databaseSchemaMarkdown(analysis.databaseReadinessReport.schemaFiles)}\n\n## Datasource Signals\n\n${databaseDatasourceMarkdown(analysis.databaseReadinessReport.datasourceSignals)}\n\n## Migration Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.migrationSignals, "signal")}\n\n## Client Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.clientSignals, "signal")}\n\n## Config Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.configSignals, "signal")}\n\n## Model Signals\n\n${databaseSignalMarkdown(analysis.databaseReadinessReport.modelSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.databaseReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.databaseReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.databaseReadinessReport.learnerNextSteps)}\n`,
    "ci-cd.md": `# CI/CD Readiness\n\n${analysis.ciCdReport.summary}\n\nSource pattern: ${analysis.ciCdReport.sourcePattern}\n\n## Workflow Files\n\n${ciCdWorkflowMarkdown(analysis.ciCdReport.workflowFiles)}\n\n## Trigger Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.triggerSignals, "trigger")}\n\n## Job Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.jobSignals, "signal")}\n\n## Security Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.securitySignals, "signal")}\n\n## Delivery Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.deliverySignals, "signal")}\n\n## Platform Signals\n\n${ciCdSignalMarkdown(analysis.ciCdReport.platformSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.ciCdReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.ciCdReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.ciCdReport.learnerNextSteps)}\n`,
    "unit-tests.md": `# Unit Test Readiness\n\n${analysis.unitTestReport.summary}\n\nSource pattern: ${analysis.unitTestReport.sourcePattern}\n\n## Test Files\n\n${unitTestFileMarkdown(analysis.unitTestReport.testFiles)}\n\n## Config Files\n\n${unitTestConfigMarkdown(analysis.unitTestReport.configFiles)}\n\n## Assertion Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.assertionSignals, "assertion")}\n\n## Mock Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.mockSignals, "signal")}\n\n## Coverage Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.coverageSignals, "signal")}\n\n## Environment Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.environmentSignals, "signal")}\n\n## Reporting Signals\n\n${unitTestSignalMarkdown(analysis.unitTestReport.reportingSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.unitTestReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.unitTestReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.unitTestReport.learnerNextSteps)}\n`,
    "typecheck-readiness.md": `# Typecheck Readiness\n\n${analysis.typecheckReadinessReport.summary}\n\nSource pattern: ${analysis.typecheckReadinessReport.sourcePattern}\n\n## TSConfig Files\n\n${typecheckTsconfigMarkdown(analysis.typecheckReadinessReport.tsconfigFiles)}\n\n## Compiler Option Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.compilerOptionSignals, "signal")}\n\n## Project Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.projectSignals, "signal")}\n\n## Module Resolution Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.moduleResolutionSignals, "signal")}\n\n## Declaration Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.declarationSignals, "signal")}\n\n## Script Signals\n\n${typecheckSignalMarkdown(analysis.typecheckReadinessReport.scriptSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.typecheckReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.typecheckReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.typecheckReadinessReport.learnerNextSteps)}\n`,
    "package-manager.md": `# Package Manager Readiness\n\n${analysis.packageManagerReport.summary}\n\nSource pattern: ${analysis.packageManagerReport.sourcePattern}\n\n## Manifest Files\n\n${packageManagerManifestMarkdown(analysis.packageManagerReport.manifestFiles)}\n\n## Workspace Signals\n\n${packageManagerSignalMarkdown(analysis.packageManagerReport.workspaceSignals, "signal")}\n\n## Lockfile Signals\n\n${packageManagerLockfileMarkdown(analysis.packageManagerReport.lockfileSignals)}\n\n## Script Signals\n\n${packageManagerSignalMarkdown(analysis.packageManagerReport.scriptSignals, "signal")}\n\n## Policy Signals\n\n${packageManagerSignalMarkdown(analysis.packageManagerReport.policySignals, "signal")}\n\n## Recommended Commands\n\n${analysis.packageManagerReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.packageManagerReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.packageManagerReport.learnerNextSteps)}\n`,
    "git-hooks.md": `# Git Hooks Readiness\n\n${analysis.gitHooksReport.summary}\n\nSource pattern: ${analysis.gitHooksReport.sourcePattern}\n\n## Hook Files\n\n${gitHooksHookMarkdown(analysis.gitHooksReport.hookFiles)}\n\n## Install Signals\n\n${gitHooksSignalMarkdown(analysis.gitHooksReport.installSignals, "signal")}\n\n## Command Signals\n\n${gitHooksSignalMarkdown(analysis.gitHooksReport.commandSignals, "signal")}\n\n## Policy Signals\n\n${gitHooksSignalMarkdown(analysis.gitHooksReport.policySignals, "signal")}\n\n## Tool Config Files\n\n${gitHooksToolConfigMarkdown(analysis.gitHooksReport.toolConfigFiles)}\n\n## Recommended Commands\n\n${analysis.gitHooksReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.gitHooksReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.gitHooksReport.learnerNextSteps)}\n`,
    "task-runner.md": `# Task Runner Readiness\n\n${analysis.taskRunnerReport.summary}\n\nSource pattern: ${analysis.taskRunnerReport.sourcePattern}\n\n## Config Files\n\n${taskRunnerConfigMarkdown(analysis.taskRunnerReport.configFiles)}\n\n## Task Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.taskSignals, "signal")}\n\n## Cache Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.cacheSignals, "signal")}\n\n## Dependency Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.dependencySignals, "signal")}\n\n## Environment Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.environmentSignals, "signal")}\n\n## Package Script Signals\n\n${taskRunnerSignalMarkdown(analysis.taskRunnerReport.packageScriptSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.taskRunnerReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.taskRunnerReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.taskRunnerReport.learnerNextSteps)}\n`,
    "dependency-updates.md": `# Dependency Updates Readiness\n\n${analysis.dependencyUpdateReport.summary}\n\nSource pattern: ${analysis.dependencyUpdateReport.sourcePattern}\n\n## Config Files\n\n${dependencyUpdateConfigMarkdown(analysis.dependencyUpdateReport.configFiles)}\n\n## Manager Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.managerSignals, "signal")}\n\n## Policy Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.policySignals, "signal")}\n\n## Workflow Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.workflowSignals, "signal")}\n\n## Registry Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.registrySignals, "signal")}\n\n## Package File Signals\n\n${dependencyUpdateSignalMarkdown(analysis.dependencyUpdateReport.packageFileSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.dependencyUpdateReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.dependencyUpdateReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.dependencyUpdateReport.learnerNextSteps)}\n`,
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
    "payment-readiness.md": `# Payment Readiness\n\n${analysis.paymentReadinessReport.summary}\n\nSource pattern: ${analysis.paymentReadinessReport.sourcePattern}\n\n## Payment Setups\n\n${paymentReadinessSetupMarkdown(analysis.paymentReadinessReport.paymentSetups)}\n\n## Checkout Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.checkoutSignals, "signal")}\n\n## Webhook Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.webhookSignals, "signal")}\n\n## Customer Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.customerSignals, "signal")}\n\n## Credential Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.credentialSignals, "signal")}\n\n## Package Signals\n\n${paymentReadinessSignalMarkdown(analysis.paymentReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.paymentReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.paymentReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.paymentReadinessReport.learnerNextSteps)}\n`,
    "email-readiness.md": `# Email Readiness\n\n${analysis.emailReadinessReport.summary}\n\nSource pattern: ${analysis.emailReadinessReport.sourcePattern}\n\n## Email Setups\n\n${emailReadinessSetupMarkdown(analysis.emailReadinessReport.emailSetups)}\n\n## Recipient Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.recipientSignals, "signal")}\n\n## Delivery Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.deliverySignals, "signal")}\n\n## Template Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.templateSignals, "signal")}\n\n## Credential Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.credentialSignals, "signal")}\n\n## Package Signals\n\n${emailReadinessSignalMarkdown(analysis.emailReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.emailReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.emailReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.emailReadinessReport.learnerNextSteps)}\n`,
    "queue-readiness.md": `# Queue Readiness\n\n${analysis.queueReadinessReport.summary}\n\nSource pattern: ${analysis.queueReadinessReport.sourcePattern}\n\n## Queue Setups\n\n${queueReadinessSetupMarkdown(analysis.queueReadinessReport.queueSetups)}\n\n## Producer Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.producerSignals, "signal")}\n\n## Worker Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.workerSignals, "signal")}\n\n## Reliability Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.reliabilitySignals, "signal")}\n\n## Connection Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.connectionSignals, "signal")}\n\n## Package Signals\n\n${queueReadinessSignalMarkdown(analysis.queueReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.queueReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.queueReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.queueReadinessReport.learnerNextSteps)}\n`,
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
    "pdf-generation-readiness.md": `# PDF Generation Readiness\n\n${analysis.pdfGenerationReadinessReport.summary}\n\nSource pattern: ${analysis.pdfGenerationReadinessReport.sourcePattern}\n\n## PDF Generation Setups\n\n${pdfGenerationReadinessSetupMarkdown(analysis.pdfGenerationReadinessReport.pdfGenerationSetups)}\n\n## Document Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.documentSignals, "signal")}\n\n## Page Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.pageSignals, "signal")}\n\n## Asset Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.assetSignals, "signal")}\n\n## Form Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.formSignals, "signal")}\n\n## Output Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.outputSignals, "signal")}\n\n## Safety Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${pdfGenerationReadinessSignalMarkdown(analysis.pdfGenerationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.pdfGenerationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.pdfGenerationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.pdfGenerationReadinessReport.learnerNextSteps)}\n`,
    "spreadsheet-readiness.md": `# Spreadsheet Readiness\n\n${analysis.spreadsheetReadinessReport.summary}\n\nSource pattern: ${analysis.spreadsheetReadinessReport.sourcePattern}\n\n## Spreadsheet Setups\n\n${spreadsheetReadinessSetupMarkdown(analysis.spreadsheetReadinessReport.spreadsheetSetups)}\n\n## Workbook Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.workbookSignals, "signal")}\n\n## Sheet Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.sheetSignals, "signal")}\n\n## Format Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.formatSignals, "signal")}\n\n## Input Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.inputSignals, "signal")}\n\n## Output Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.outputSignals, "signal")}\n\n## Safety Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${spreadsheetReadinessSignalMarkdown(analysis.spreadsheetReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.spreadsheetReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.spreadsheetReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.spreadsheetReadinessReport.learnerNextSteps)}\n`,
    "chart-visualization-readiness.md": `# Chart Visualization Readiness\n\n${analysis.chartVisualizationReadinessReport.summary}\n\nSource pattern: ${analysis.chartVisualizationReadinessReport.sourcePattern}\n\n## Chart Setups\n\n${chartVisualizationReadinessSetupMarkdown(analysis.chartVisualizationReadinessReport.chartSetups)}\n\n## Chart Type Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.chartTypeSignals, "signal")}\n\n## Data Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.dataSignals, "signal")}\n\n## Scale Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.scaleSignals, "signal")}\n\n## Interaction Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.interactionSignals, "signal")}\n\n## Render Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.renderSignals, "signal")}\n\n## Lifecycle Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.lifecycleSignals, "signal")}\n\n## Safety Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${chartVisualizationReadinessSignalMarkdown(analysis.chartVisualizationReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.chartVisualizationReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.chartVisualizationReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.chartVisualizationReadinessReport.learnerNextSteps)}\n`,
    "diagram-rendering-readiness.md": `# Diagram Rendering Readiness\n\n${analysis.diagramRenderingReadinessReport.summary}\n\nSource pattern: ${analysis.diagramRenderingReadinessReport.sourcePattern}\n\n## Diagram Setups\n\n${diagramRenderingReadinessSetupMarkdown(analysis.diagramRenderingReadinessReport.diagramSetups)}\n\n## Diagram Type Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.diagramTypeSignals, "signal")}\n\n## Render Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.renderSignals, "signal")}\n\n## Theme Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.themeSignals, "signal")}\n\n## Security Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.securitySignals, "signal")}\n\n## Layout Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.layoutSignals, "signal")}\n\n## Output Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.outputSignals, "signal")}\n\n## Package Signals\n\n${diagramRenderingReadinessSignalMarkdown(analysis.diagramRenderingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.diagramRenderingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.diagramRenderingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.diagramRenderingReadinessReport.learnerNextSteps)}\n`,
    "link-integrity-readiness.md": `# Link Integrity Readiness\n\n${analysis.linkIntegrityReadinessReport.summary}\n\nSource pattern: ${analysis.linkIntegrityReadinessReport.sourcePattern}\n\n## Link Setups\n\n${linkIntegrityReadinessSetupMarkdown(analysis.linkIntegrityReadinessReport.linkSetups)}\n\n## Target Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.targetSignals, "signal")}\n\n## Policy Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.policySignals, "signal")}\n\n## Network Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.networkSignals, "signal")}\n\n## Output Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.outputSignals, "signal")}\n\n## CI Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${linkIntegrityReadinessSignalMarkdown(analysis.linkIntegrityReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.linkIntegrityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.linkIntegrityReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.linkIntegrityReadinessReport.learnerNextSteps)}\n`,
    "seo-metadata-readiness.md": `# SEO Metadata Readiness\n\n${analysis.seoMetadataReadinessReport.summary}\n\nSource pattern: ${analysis.seoMetadataReadinessReport.sourcePattern}\n\n## SEO Setups\n\n${seoMetadataReadinessSetupMarkdown(analysis.seoMetadataReadinessReport.seoSetups)}\n\n## Crawl Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.crawlSignals, "signal")}\n\n## Sitemap Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.sitemapSignals, "signal")}\n\n## Metadata Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.metadataSignals, "signal")}\n\n## Structured Data Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.structuredDataSignals, "signal")}\n\n## AI Readiness Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.aiReadinessSignals, "signal")}\n\n## Package Signals\n\n${seoMetadataReadinessSignalMarkdown(analysis.seoMetadataReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.seoMetadataReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.seoMetadataReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.seoMetadataReadinessReport.learnerNextSteps)}\n`,
    "pwa-readiness.md": `# PWA Readiness\n\n${analysis.pwaReadinessReport.summary}\n\nSource pattern: ${analysis.pwaReadinessReport.sourcePattern}\n\n## PWA Setups\n\n${pwaReadinessSetupMarkdown(analysis.pwaReadinessReport.pwaSetups)}\n\n## Manifest Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.manifestSignals, "signal")}\n\n## Service Worker Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.serviceWorkerSignals, "signal")}\n\n## Caching Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.cachingSignals, "signal")}\n\n## Update Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.updateSignals, "signal")}\n\n## Install Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.installSignals, "signal")}\n\n## Package Signals\n\n${pwaReadinessSignalMarkdown(analysis.pwaReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.pwaReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.pwaReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.pwaReadinessReport.learnerNextSteps)}\n`,
    "browser-compat-readiness.md": `# Browser Compatibility Readiness\n\n${analysis.browserCompatibilityReadinessReport.summary}\n\nSource pattern: ${analysis.browserCompatibilityReadinessReport.sourcePattern}\n\n## Compatibility Setups\n\n${browserCompatibilityReadinessSetupMarkdown(analysis.browserCompatibilityReadinessReport.compatibilitySetups)}\n\n## Config Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.configSignals, "signal")}\n\n## Query Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.querySignals, "signal")}\n\n## Coverage Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.coverageSignals, "signal")}\n\n## Feature Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.featureSignals, "signal")}\n\n## Update Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.updateSignals, "signal")}\n\n## Package Signals\n\n${browserCompatibilityReadinessSignalMarkdown(analysis.browserCompatibilityReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.browserCompatibilityReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.browserCompatibilityReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.browserCompatibilityReadinessReport.learnerNextSteps)}\n`,
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
    "server-framework-readiness.md": `# Server Framework Readiness\n\n${analysis.serverFrameworkReadinessReport.summary}\n\nSource pattern: ${analysis.serverFrameworkReadinessReport.sourcePattern}\n\n## Server Setups\n\n${serverFrameworkReadinessSetupMarkdown(analysis.serverFrameworkReadinessReport.serverSetups)}\n\n## Route Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.routeSignals, "signal")}\n\n## Schema Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.schemaSignals, "signal")}\n\n## Plugin Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.pluginSignals, "signal")}\n\n## Lifecycle Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.lifecycleSignals, "signal")}\n\n## Runtime Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.runtimeSignals, "signal")}\n\n## Error Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.errorSignals, "signal")}\n\n## Test Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.testSignals, "signal")}\n\n## Package Signals\n\n${serverFrameworkReadinessSignalMarkdown(analysis.serverFrameworkReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.serverFrameworkReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.serverFrameworkReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.serverFrameworkReadinessReport.learnerNextSteps)}\n`,
    "rpc-readiness.md": `# RPC Readiness\n\n${analysis.rpcReadinessReport.summary}\n\nSource pattern: ${analysis.rpcReadinessReport.sourcePattern}\n\n## RPC Setups\n\n${rpcReadinessSetupMarkdown(analysis.rpcReadinessReport.rpcSetups)}\n\n## Router Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.routerSignals, "signal")}\n\n## Procedure Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.procedureSignals, "signal")}\n\n## Validation Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.validationSignals, "signal")}\n\n## Context Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.contextSignals, "signal")}\n\n## Client Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.clientSignals, "signal")}\n\n## Adapter Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.adapterSignals, "signal")}\n\n## Error Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.errorSignals, "signal")}\n\n## Caller Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.callerSignals, "signal")}\n\n## Package Signals\n\n${rpcReadinessSignalMarkdown(analysis.rpcReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.rpcReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.rpcReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.rpcReadinessReport.learnerNextSteps)}\n`,
    "workspace-graph-readiness.md": `# Workspace Graph Readiness\n\n${analysis.workspaceGraphReadinessReport.summary}\n\nSource pattern: ${analysis.workspaceGraphReadinessReport.sourcePattern}\n\n## Workspace Files\n\n${workspaceGraphReadinessFileMarkdown(analysis.workspaceGraphReadinessReport.workspaceFiles)}\n\n## Project Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.projectSignals, "signal")}\n\n## Graph Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.graphSignals, "signal")}\n\n## Boundary Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.boundarySignals, "signal")}\n\n## Affected Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.affectedSignals, "signal")}\n\n## Target Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.targetSignals, "signal")}\n\n## Plugin Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.pluginSignals, "signal")}\n\n## Package Signals\n\n${workspaceGraphReadinessSignalMarkdown(analysis.workspaceGraphReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.workspaceGraphReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.workspaceGraphReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.workspaceGraphReadinessReport.learnerNextSteps)}\n`,
    "scaffolding-readiness.md": `# Scaffolding Readiness\n\n${analysis.scaffoldingReadinessReport.summary}\n\nSource pattern: ${analysis.scaffoldingReadinessReport.sourcePattern}\n\n## Generator Files\n\n${scaffoldingReadinessFileMarkdown(analysis.scaffoldingReadinessReport.generatorFiles)}\n\n## Prompt Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.promptSignals, "signal")}\n\n## Action Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.actionSignals, "signal")}\n\n## Template Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.templateSignals, "signal")}\n\n## Safety Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${scaffoldingReadinessSignalMarkdown(analysis.scaffoldingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.scaffoldingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.scaffoldingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.scaffoldingReadinessReport.learnerNextSteps)}\n`,
    "scheduler-readiness.md": `# Scheduler Readiness\n\n${analysis.schedulerReadinessReport.summary}\n\nSource pattern: ${analysis.schedulerReadinessReport.sourcePattern}\n\n## Scheduler Setups\n\n${schedulerReadinessSetupMarkdown(analysis.schedulerReadinessReport.schedulerSetups)}\n\n## Schedule Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.scheduleSignals, "signal")}\n\n## Task Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.taskSignals, "signal")}\n\n## Lifecycle Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.lifecycleSignals, "signal")}\n\n## Reliability Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.reliabilitySignals, "signal")}\n\n## Package Signals\n\n${schedulerReadinessSignalMarkdown(analysis.schedulerReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.schedulerReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.schedulerReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.schedulerReadinessReport.learnerNextSteps)}\n`,
    "build-tool-readiness.md": `# Build Tool Readiness\n\n${analysis.buildToolReadinessReport.summary}\n\nSource pattern: ${analysis.buildToolReadinessReport.sourcePattern}\n\n## Build Tool Setups\n\n${buildToolReadinessSetupMarkdown(analysis.buildToolReadinessReport.buildToolSetups)}\n\n## Config Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.configSignals, "signal")}\n\n## Plugin Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.pluginSignals, "signal")}\n\n## Dev Server Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.devServerSignals, "signal")}\n\n## Build Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.buildSignals, "signal")}\n\n## Environment Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.environmentSignals, "signal")}\n\n## SSR Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.ssrSignals, "signal")}\n\n## Dependency Optimization Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.dependencyOptimizationSignals, "signal")}\n\n## Package Signals\n\n${buildToolReadinessSignalMarkdown(analysis.buildToolReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.buildToolReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.buildToolReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.buildToolReadinessReport.learnerNextSteps)}\n`,
    "styling-readiness.md": `# Styling Readiness\n\n${analysis.stylingReadinessReport.summary}\n\nSource pattern: ${analysis.stylingReadinessReport.sourcePattern}\n\n## Styling Setups\n\n${stylingReadinessSetupMarkdown(analysis.stylingReadinessReport.stylingSetups)}\n\n## Config Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.configSignals, "signal")}\n\n## Directive Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.directiveSignals, "signal")}\n\n## Class Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.classSignals, "signal")}\n\n## Theme Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.themeSignals, "signal")}\n\n## Integration Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.integrationSignals, "signal")}\n\n## Package Signals\n\n${stylingReadinessSignalMarkdown(analysis.stylingReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.stylingReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.stylingReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.stylingReadinessReport.learnerNextSteps)}\n`,
    "visual-regression-readiness.md": `# Visual Regression Readiness\n\n${analysis.visualRegressionReadinessReport.summary}\n\nSource pattern: ${analysis.visualRegressionReadinessReport.sourcePattern}\n\n## Visual Regression Setups\n\n${visualRegressionReadinessSetupMarkdown(analysis.visualRegressionReadinessReport.visualRegressionSetups)}\n\n## Config Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.configSignals, "signal")}\n\n## Snapshot Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.snapshotSignals, "signal")}\n\n## Threshold Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.thresholdSignals, "signal")}\n\n## Report Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.reportSignals, "signal")}\n\n## Plugin Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.pluginSignals, "signal")}\n\n## CI Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.ciSignals, "signal")}\n\n## Package Signals\n\n${visualRegressionReadinessSignalMarkdown(analysis.visualRegressionReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.visualRegressionReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.visualRegressionReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.visualRegressionReadinessReport.learnerNextSteps)}\n`,
    "infrastructure-readiness.md": `# Infrastructure Readiness\n\n${analysis.infrastructureReadinessReport.summary}\n\nSource pattern: ${analysis.infrastructureReadinessReport.sourcePattern}\n\n## Infrastructure Setups\n\n${infrastructureReadinessSetupMarkdown(analysis.infrastructureReadinessReport.infrastructureSetups)}\n\n## Config Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.configSignals, "signal")}\n\n## State Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.stateSignals, "signal")}\n\n## Workflow Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.workflowSignals, "signal")}\n\n## Module Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.moduleSignals, "signal")}\n\n## Variable Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.variableSignals, "signal")}\n\n## Policy Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.policySignals, "signal")}\n\n## Package Signals\n\n${infrastructureReadinessSignalMarkdown(analysis.infrastructureReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.infrastructureReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.infrastructureReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.infrastructureReadinessReport.learnerNextSteps)}\n`,
    "deployment-readiness.md": `# Deployment Readiness\n\n${analysis.deploymentReadinessReport.summary}\n\nSource pattern: ${analysis.deploymentReadinessReport.sourcePattern}\n\n## Deployment Setups\n\n${deploymentReadinessSetupMarkdown(analysis.deploymentReadinessReport.deploymentSetups)}\n\n## Chart Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.chartSignals, "signal")}\n\n## Template Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.templateSignals, "signal")}\n\n## Value Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.valueSignals, "signal")}\n\n## Release Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.releaseSignals, "signal")}\n\n## Safety Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${deploymentReadinessSignalMarkdown(analysis.deploymentReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.deploymentReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.deploymentReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.deploymentReadinessReport.learnerNextSteps)}\n`,
    "serverless-readiness.md": `# Serverless Readiness\n\n${analysis.serverlessReadinessReport.summary}\n\nSource pattern: ${analysis.serverlessReadinessReport.sourcePattern}\n\n## Serverless Setups\n\n${serverlessReadinessSetupMarkdown(analysis.serverlessReadinessReport.serverlessSetups)}\n\n## Config Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.configSignals, "signal")}\n\n## Function Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.functionSignals, "signal")}\n\n## Event Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.eventSignals, "signal")}\n\n## Runtime Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.runtimeSignals, "signal")}\n\n## Deployment Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.deploymentSignals, "signal")}\n\n## Safety Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.safetySignals, "signal")}\n\n## Package Signals\n\n${serverlessReadinessSignalMarkdown(analysis.serverlessReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.serverlessReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.serverlessReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.serverlessReadinessReport.learnerNextSteps)}\n`,
    "mobile-readiness.md": `# Mobile Readiness\n\n${analysis.mobileReadinessReport.summary}\n\nSource pattern: ${analysis.mobileReadinessReport.sourcePattern}\n\n## Mobile Setups\n\n${mobileReadinessSetupMarkdown(analysis.mobileReadinessReport.mobileSetups)}\n\n## Config Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.configSignals, "signal")}\n\n## Platform Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.platformSignals, "signal")}\n\n## Navigation Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.navigationSignals, "signal")}\n\n## Build Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.buildSignals, "signal")}\n\n## Update Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.updateSignals, "signal")}\n\n## Asset Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.assetSignals, "signal")}\n\n## Package Signals\n\n${mobileReadinessSignalMarkdown(analysis.mobileReadinessReport.packageSignals, "signal")}\n\n## Recommended Commands\n\n${analysis.mobileReadinessReport.recommendedCommands.map((item) => `- \`${item.command}\`: ${item.purpose}`).join("\n")}\n\n## Risk Queue\n\n${analysis.mobileReadinessReport.riskQueue.map((item) => `- ${item.priority}: ${item.action}\n  - Why: ${item.why}\n  - Related: [${item.relatedHref}](../${item.relatedHref})`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.mobileReadinessReport.learnerNextSteps)}\n`,
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
