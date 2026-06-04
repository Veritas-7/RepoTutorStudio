import type {
  AnalysisBundle,
} from "./scanner.js";
import type { StudySessionVerificationResult } from "./session-verifier.js";
import type { Quiz, StudySession, WrongNote } from "@repotutor/shared";

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
