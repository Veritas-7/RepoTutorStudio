import fs from "node:fs/promises";
import path from "node:path";
import { renderStudyHtml } from "@repotutor/html";
import type { LearnerLevel, QuizAttempt, StudyMode, StudySession, WrongNote } from "@repotutor/shared";
import { StructuredRunner } from "@repotutor/codex";
import { analyzeRepository, type AnalysisBundle } from "./scanner.js";
import { parseSource } from "./intake.js";
import { ensureDir, pathExists } from "./fs-utils.js";
import { materializeSession, prepareSession, readJson, updateSessionIndex, writeJson } from "./storage.js";
import { generateQuiz, writeRenderedHtml } from "./quiz.js";
import { markdownFiles, readmeStudy, renderSessionVerificationMarkdown } from "./markdown.js";
import { buildIncrementalReport, findPreviousSnapshot } from "./incremental.js";
import { verifyStudySessionArtifacts } from "./session-verifier.js";
export { listSessions } from "./sessions.js";

export interface StudyOptions {
  source: string;
  mode?: StudyMode;
  level?: LearnerLevel;
  studiesRoot?: string;
  sourceBaseDir?: string;
  enableCodex?: boolean;
}

export interface StudyResult {
  session: StudySession;
  analysis: AnalysisBundle;
}

export async function runStudy(options: StudyOptions): Promise<StudyResult> {
  const studiesRoot = path.resolve(options.studiesRoot ?? path.join(process.cwd(), "studies"));
  const source = await parseSource(options.source, { baseDir: options.sourceBaseDir });
  const prepared = await prepareSession({ source, studiesRoot, mode: options.mode, level: options.level });
  await materializeSession(prepared);
  let session: StudySession = { ...prepared.session, status: "running" };
  await writeJson(path.join(session.outputPaths.root, "session.json"), session);
  await ensureSessionDirs(session);

  const codexRunner = new StructuredRunner({ codexDir: session.outputPaths.codex, enableSdk: options.enableCodex });
  await codexRunner.run({
    taskName: "PurposeTask",
    prompt: `Analyze ${session.owner}/${session.repo} for beginner learning. Source files are already filtered for secrets.`,
    schema: {
      parse(value: unknown) {
        return value as { ok: boolean };
      },
      safeParse(value: unknown) {
        return { success: true, data: value as { ok: boolean } };
      }
    } as never
  });

  const analysis = await analyzeRepository(session.outputPaths.source, {
    sourceType: session.sourceType,
    sourceUrl: session.sourceUrl,
    localSourcePath: session.localSourcePath,
    branch: session.branch,
    commitHash: session.commitHash
  });
  const previousSnapshot = await findPreviousSnapshot(studiesRoot, session);
  analysis.incrementalReport = buildIncrementalReport(analysis.sourceSnapshotReport, analysis.coverageReport, previousSnapshot);
  const quiz = generateQuiz(session, analysis.folderLessons, analysis.fileLessons, analysis.glossary);
  const wrongNotes: WrongNote[] = [];
  const attempts: QuizAttempt[] = [];
  session = {
    ...session,
    status: "complete",
    updatedAt: new Date().toISOString(),
    quizSummary: {
      totalQuestions: quiz.totalQuestions,
      attempts: 0,
      latestScore: null,
      wrongCount: 0
    }
  };

  await writeAllArtifacts(session, analysis, quiz, wrongNotes, attempts);
  await updateSessionIndex(studiesRoot, session);
  return { session, analysis };
}

export async function loadStudyHtmlInput(sessionRoot: string): Promise<Parameters<typeof renderStudyHtml>[0]> {
  const session = await readJson<StudySession>(path.join(sessionRoot, "session.json"));
  return {
    session,
    repoMap: await readJson(path.join(sessionRoot, "analysis", "repo-map.json")),
    languageReport: await readJson(path.join(sessionRoot, "analysis", "language-report.json")),
    dependencyReport: await readJson(path.join(sessionRoot, "analysis", "dependency-report.json")),
    purposeReport: await readJson(path.join(sessionRoot, "analysis", "purpose-report.json")),
    architectureReport: await readJson(path.join(sessionRoot, "analysis", "architecture-report.json")),
    folderLessons: await readJson(path.join(sessionRoot, "analysis", "folder-lessons.json")),
    fileLessons: await readJson(path.join(sessionRoot, "analysis", "file-lessons.json")),
    coverageReport: await readJson(path.join(sessionRoot, "analysis", "coverage-report.json")),
    suggestedReadsReport: await readJson(path.join(sessionRoot, "analysis", "suggested-reads-report.json")),
    runtimeEnvironmentReport: await readJson(path.join(sessionRoot, "analysis", "runtime-environment-report.json")),
    interfaceMapReport: await readJson(path.join(sessionRoot, "analysis", "interface-map-report.json")),
    symbolMapReport: await readJson(path.join(sessionRoot, "analysis", "symbol-map-report.json")),
    apiReferenceReport: await readJson(path.join(sessionRoot, "analysis", "api-reference-report.json")),
    searchIndexReport: await readJson(path.join(sessionRoot, "analysis", "search-index-report.json")),
    learningJournalReport: await readJson(path.join(sessionRoot, "analysis", "learning-journal-report.json")),
    projectActivityReport: await readJson(path.join(sessionRoot, "analysis", "project-activity-report.json")),
    codeMetricsReadinessReport: await readJson(path.join(sessionRoot, "analysis", "code-metrics-readiness-report.json")),
    codeOwnershipReadinessReport: await readJson(path.join(sessionRoot, "analysis", "code-ownership-readiness-report.json")),
    largeAssetReadinessReport: await readJson(path.join(sessionRoot, "analysis", "large-asset-readiness-report.json")),
    licenseRightsReport: await readJson(path.join(sessionRoot, "analysis", "license-rights-report.json")),
    sbomReport: await readJson(path.join(sessionRoot, "analysis", "sbom-report.json")),
    securityReadinessReport: await readJson(path.join(sessionRoot, "analysis", "security-readiness-report.json")),
    scorecardReport: await readJson(path.join(sessionRoot, "analysis", "scorecard-report.json")),
    provenanceReport: await readJson(path.join(sessionRoot, "analysis", "provenance-report.json")),
    advisoryReport: await readJson(path.join(sessionRoot, "analysis", "advisory-report.json")),
    vexReport: await readJson(path.join(sessionRoot, "analysis", "vex-report.json")),
    policyGateReport: await readJson(path.join(sessionRoot, "analysis", "policy-gate-report.json")),
    apiContractReport: await readJson(path.join(sessionRoot, "analysis", "api-contract-report.json")),
    consumerContractReadinessReport: await readJson(path.join(sessionRoot, "analysis", "consumer-contract-readiness-report.json")),
    observabilityReport: await readJson(path.join(sessionRoot, "analysis", "observability-report.json")),
    performanceReport: await readJson(path.join(sessionRoot, "analysis", "performance-report.json")),
    e2eReport: await readJson(path.join(sessionRoot, "analysis", "e2e-report.json")),
    integrationTestEnvironmentReadinessReport: await readJson(path.join(sessionRoot, "analysis", "integration-test-environment-readiness-report.json")),
    chaosEngineeringReadinessReport: await readJson(path.join(sessionRoot, "analysis", "chaos-engineering-readiness-report.json")),
    accessibilityReport: await readJson(path.join(sessionRoot, "analysis", "accessibility-report.json")),
    storybookReport: await readJson(path.join(sessionRoot, "analysis", "storybook-report.json")),
    designTokensReport: await readJson(path.join(sessionRoot, "analysis", "design-tokens-report.json")),
    i18nReport: await readJson(path.join(sessionRoot, "analysis", "i18n-report.json")),
    releaseReadinessReport: await readJson(path.join(sessionRoot, "analysis", "release-readiness-report.json")),
    secretReadinessReport: await readJson(path.join(sessionRoot, "analysis", "secret-readiness-report.json")),
    secretManagementReadinessReport: await readJson(path.join(sessionRoot, "analysis", "secret-management-readiness-report.json")),
    containerReadinessReport: await readJson(path.join(sessionRoot, "analysis", "container-readiness-report.json")),
    codeQualityReport: await readJson(path.join(sessionRoot, "analysis", "code-quality-report.json")),
    documentationReport: await readJson(path.join(sessionRoot, "analysis", "documentation-report.json")),
    databaseReadinessReport: await readJson(path.join(sessionRoot, "analysis", "database-readiness-report.json")),
    ciCdReport: await readJson(path.join(sessionRoot, "analysis", "ci-cd-report.json")),
    unitTestReport: await readJson(path.join(sessionRoot, "analysis", "unit-test-report.json")),
    mutationTestingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "mutation-testing-readiness-report.json")),
    typecheckReadinessReport: await readJson(path.join(sessionRoot, "analysis", "typecheck-readiness-report.json")),
    packageManagerReport: await readJson(path.join(sessionRoot, "analysis", "package-manager-report.json")),
    gitHooksReport: await readJson(path.join(sessionRoot, "analysis", "git-hooks-report.json")),
    taskRunnerReport: await readJson(path.join(sessionRoot, "analysis", "task-runner-report.json")),
    dependencyUpdateReport: await readJson(path.join(sessionRoot, "analysis", "dependency-update-report.json")),
    lintReadinessReport: await readJson(path.join(sessionRoot, "analysis", "lint-readiness-report.json")),
    formatReadinessReport: await readJson(path.join(sessionRoot, "analysis", "format-readiness-report.json")),
    commitConventionReport: await readJson(path.join(sessionRoot, "analysis", "commit-conventions-report.json")),
    changelogReadinessReport: await readJson(path.join(sessionRoot, "analysis", "changelog-readiness-report.json")),
    bundleAnalysisReport: await readJson(path.join(sessionRoot, "analysis", "bundle-analysis-report.json")),
    mockingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "mocking-readiness-report.json")),
    dataFetchingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "data-fetching-readiness-report.json")),
    routingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "routing-readiness-report.json")),
    stateManagementReadinessReport: await readJson(path.join(sessionRoot, "analysis", "state-management-readiness-report.json")),
    formReadinessReport: await readJson(path.join(sessionRoot, "analysis", "form-readiness-report.json")),
    authReadinessReport: await readJson(path.join(sessionRoot, "analysis", "auth-readiness-report.json")),
    authorizationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "authorization-readiness-report.json")),
    paymentReadinessReport: await readJson(path.join(sessionRoot, "analysis", "payment-readiness-report.json")),
    emailReadinessReport: await readJson(path.join(sessionRoot, "analysis", "email-readiness-report.json")),
    queueReadinessReport: await readJson(path.join(sessionRoot, "analysis", "queue-readiness-report.json")),
    cacheReadinessReport: await readJson(path.join(sessionRoot, "analysis", "cache-readiness-report.json")),
    loggingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "logging-readiness-report.json")),
    featureFlagReadinessReport: await readJson(path.join(sessionRoot, "analysis", "feature-flag-readiness-report.json")),
    rateLimitReadinessReport: await readJson(path.join(sessionRoot, "analysis", "rate-limit-readiness-report.json")),
    errorTrackingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "error-tracking-readiness-report.json")),
    analyticsReadinessReport: await readJson(path.join(sessionRoot, "analysis", "analytics-readiness-report.json")),
    httpClientReadinessReport: await readJson(path.join(sessionRoot, "analysis", "http-client-readiness-report.json")),
    schemaValidationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "schema-validation-readiness-report.json")),
    dateTimeReadinessReport: await readJson(path.join(sessionRoot, "analysis", "datetime-readiness-report.json")),
    idGenerationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "id-generation-readiness-report.json")),
    imageProcessingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "image-processing-readiness-report.json")),
    fileUploadReadinessReport: await readJson(path.join(sessionRoot, "analysis", "file-upload-readiness-report.json")),
    webSocketReadinessReport: await readJson(path.join(sessionRoot, "analysis", "websocket-readiness-report.json")),
    pdfGenerationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "pdf-generation-readiness-report.json")),
    spreadsheetReadinessReport: await readJson(path.join(sessionRoot, "analysis", "spreadsheet-readiness-report.json")),
    chartVisualizationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "chart-visualization-readiness-report.json")),
    diagramRenderingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "diagram-rendering-readiness-report.json")),
    linkIntegrityReadinessReport: await readJson(path.join(sessionRoot, "analysis", "link-integrity-readiness-report.json")),
    seoMetadataReadinessReport: await readJson(path.join(sessionRoot, "analysis", "seo-metadata-readiness-report.json")),
    pwaReadinessReport: await readJson(path.join(sessionRoot, "analysis", "pwa-readiness-report.json")),
    browserCompatibilityReadinessReport: await readJson(path.join(sessionRoot, "analysis", "browser-compat-readiness-report.json")),
    browserExtensionReadinessReport: await readJson(path.join(sessionRoot, "analysis", "browser-extension-readiness-report.json")),
    envValidationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "env-validation-readiness-report.json")),
    securityHeadersReadinessReport: await readJson(path.join(sessionRoot, "analysis", "security-headers-readiness-report.json")),
    graphqlReadinessReport: await readJson(path.join(sessionRoot, "analysis", "graphql-readiness-report.json")),
    cliReadinessReport: await readJson(path.join(sessionRoot, "analysis", "cli-readiness-report.json")),
    llmReadinessReport: await readJson(path.join(sessionRoot, "analysis", "llm-readiness-report.json")),
    llmEvalReadinessReport: await readJson(path.join(sessionRoot, "analysis", "llm-eval-readiness-report.json")),
    llmObservabilityReadinessReport: await readJson(path.join(sessionRoot, "analysis", "llm-observability-readiness-report.json")),
    vectorDbReadinessReport: await readJson(path.join(sessionRoot, "analysis", "vector-db-readiness-report.json")),
    searchServiceReadinessReport: await readJson(path.join(sessionRoot, "analysis", "search-service-readiness-report.json")),
    objectStorageReadinessReport: await readJson(path.join(sessionRoot, "analysis", "object-storage-readiness-report.json")),
    realtimeCollaborationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "realtime-collaboration-readiness-report.json")),
    workflowOrchestrationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "workflow-orchestration-readiness-report.json")),
    openApiClientReadinessReport: await readJson(path.join(sessionRoot, "analysis", "openapi-client-readiness-report.json")),
    webhookReadinessReport: await readJson(path.join(sessionRoot, "analysis", "webhook-readiness-report.json")),
    notificationReadinessReport: await readJson(path.join(sessionRoot, "analysis", "notification-readiness-report.json")),
    consentReadinessReport: await readJson(path.join(sessionRoot, "analysis", "consent-readiness-report.json")),
    serverFrameworkReadinessReport: await readJson(path.join(sessionRoot, "analysis", "server-framework-readiness-report.json")),
    rpcReadinessReport: await readJson(path.join(sessionRoot, "analysis", "rpc-readiness-report.json")),
    workspaceGraphReadinessReport: await readJson(path.join(sessionRoot, "analysis", "workspace-graph-readiness-report.json")),
    scaffoldingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "scaffolding-readiness-report.json")),
    schedulerReadinessReport: await readJson(path.join(sessionRoot, "analysis", "scheduler-readiness-report.json")),
    buildToolReadinessReport: await readJson(path.join(sessionRoot, "analysis", "build-tool-readiness-report.json")),
    stylingReadinessReport: await readJson(path.join(sessionRoot, "analysis", "styling-readiness-report.json")),
    visualRegressionReadinessReport: await readJson(path.join(sessionRoot, "analysis", "visual-regression-readiness-report.json")),
    infrastructureReadinessReport: await readJson(path.join(sessionRoot, "analysis", "infrastructure-readiness-report.json")),
    deploymentReadinessReport: await readJson(path.join(sessionRoot, "analysis", "deployment-readiness-report.json")),
    serverlessReadinessReport: await readJson(path.join(sessionRoot, "analysis", "serverless-readiness-report.json")),
    mobileReadinessReport: await readJson(path.join(sessionRoot, "analysis", "mobile-readiness-report.json")),
    desktopReadinessReport: await readJson(path.join(sessionRoot, "analysis", "desktop-readiness-report.json")),
    edgeReadinessReport: await readJson(path.join(sessionRoot, "analysis", "edge-readiness-report.json")),
    composeReadinessReport: await readJson(path.join(sessionRoot, "analysis", "compose-readiness-report.json")),
    devContainerReadinessReport: await readJson(path.join(sessionRoot, "analysis", "devcontainer-readiness-report.json")),
    kubernetesReadinessReport: await readJson(path.join(sessionRoot, "analysis", "kubernetes-readiness-report.json")),
    gitopsReadinessReport: await readJson(path.join(sessionRoot, "analysis", "gitops-readiness-report.json")),
    backupReadinessReport: await readJson(path.join(sessionRoot, "analysis", "backup-readiness-report.json")),
    contextPackReport: await readJson(path.join(sessionRoot, "analysis", "context-pack-report.json")),
    mcpHandoffReport: await readJson(path.join(sessionRoot, "analysis", "mcp-handoff-report.json")),
    agentMemoryReport: await readJson(path.join(sessionRoot, "analysis", "agent-memory-report.json")),
    graphQueryReport: await readJson(path.join(sessionRoot, "analysis", "graph-query-report.json")),
    tutorialAbstractionReport: await readJson(path.join(sessionRoot, "analysis", "tutorial-abstraction-report.json")),
    decisionRecordReport: await readJson(path.join(sessionRoot, "analysis", "decision-record-report.json")),
    dependencyHealthReport: await readJson(path.join(sessionRoot, "analysis", "dependency-health-report.json")),
    componentGraphReport: await readJson(path.join(sessionRoot, "analysis", "component-graph-report.json")),
    sourceSnapshotReport: await readJson(path.join(sessionRoot, "analysis", "source-snapshot-report.json")),
    incrementalReport: await readJson(path.join(sessionRoot, "analysis", "incremental-report.json")),
    flowReport: await readJson(path.join(sessionRoot, "analysis", "flow-report.json")),
    glossary: await readJson(path.join(sessionRoot, "analysis", "glossary.json")),
    rebuildRoadmap: await readJson(path.join(sessionRoot, "analysis", "rebuild-roadmap.json")),
    quiz: await readJson(path.join(sessionRoot, "analysis", "quiz.json")),
    wrongNotes: await pathExists(path.join(sessionRoot, "analysis", "wrong-notes.json")) ? await readJson(path.join(sessionRoot, "analysis", "wrong-notes.json")) : [],
    attempts: await readAttempts(path.join(sessionRoot, "analysis", "quiz-attempts.jsonl"))
  };
}

async function writeAllArtifacts(session: StudySession, analysis: AnalysisBundle, quiz: ReturnType<typeof generateQuiz>, wrongNotes: WrongNote[], attempts: QuizAttempt[]): Promise<void> {
  await Promise.all([
    writeJson(path.join(session.outputPaths.root, "session.json"), session),
    writeJson(path.join(session.outputPaths.analysis, "repo-map.json"), analysis.repoMap),
    writeJson(path.join(session.outputPaths.analysis, "language-report.json"), analysis.languageReport),
    writeJson(path.join(session.outputPaths.analysis, "dependency-report.json"), analysis.dependencyReport),
    writeJson(path.join(session.outputPaths.analysis, "purpose-report.json"), analysis.purposeReport),
    writeJson(path.join(session.outputPaths.analysis, "architecture-report.json"), analysis.architectureReport),
    writeJson(path.join(session.outputPaths.analysis, "folder-lessons.json"), analysis.folderLessons),
    writeJson(path.join(session.outputPaths.analysis, "file-lessons.json"), analysis.fileLessons),
    writeJson(path.join(session.outputPaths.analysis, "coverage-report.json"), analysis.coverageReport),
    writeJson(path.join(session.outputPaths.analysis, "evidence-index-report.json"), analysis.evidenceIndexReport),
    writeJson(path.join(session.outputPaths.analysis, "suggested-reads-report.json"), analysis.suggestedReadsReport),
    writeJson(path.join(session.outputPaths.analysis, "runtime-environment-report.json"), analysis.runtimeEnvironmentReport),
    writeJson(path.join(session.outputPaths.analysis, "interface-map-report.json"), analysis.interfaceMapReport),
    writeJson(path.join(session.outputPaths.analysis, "symbol-map-report.json"), analysis.symbolMapReport),
    writeJson(path.join(session.outputPaths.analysis, "api-reference-report.json"), analysis.apiReferenceReport),
    writeJson(path.join(session.outputPaths.analysis, "search-index-report.json"), analysis.searchIndexReport),
    writeJson(path.join(session.outputPaths.analysis, "learning-journal-report.json"), analysis.learningJournalReport),
    writeJson(path.join(session.outputPaths.analysis, "project-activity-report.json"), analysis.projectActivityReport),
    writeJson(path.join(session.outputPaths.analysis, "code-metrics-readiness-report.json"), analysis.codeMetricsReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "code-ownership-readiness-report.json"), analysis.codeOwnershipReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "large-asset-readiness-report.json"), analysis.largeAssetReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "license-rights-report.json"), analysis.licenseRightsReport),
    writeJson(path.join(session.outputPaths.analysis, "sbom-report.json"), analysis.sbomReport),
    writeJson(path.join(session.outputPaths.analysis, "security-readiness-report.json"), analysis.securityReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "scorecard-report.json"), analysis.scorecardReport),
    writeJson(path.join(session.outputPaths.analysis, "provenance-report.json"), analysis.provenanceReport),
    writeJson(path.join(session.outputPaths.analysis, "advisory-report.json"), analysis.advisoryReport),
    writeJson(path.join(session.outputPaths.analysis, "vex-report.json"), analysis.vexReport),
    writeJson(path.join(session.outputPaths.analysis, "policy-gate-report.json"), analysis.policyGateReport),
    writeJson(path.join(session.outputPaths.analysis, "api-contract-report.json"), analysis.apiContractReport),
    writeJson(path.join(session.outputPaths.analysis, "consumer-contract-readiness-report.json"), analysis.consumerContractReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "observability-report.json"), analysis.observabilityReport),
    writeJson(path.join(session.outputPaths.analysis, "performance-report.json"), analysis.performanceReport),
    writeJson(path.join(session.outputPaths.analysis, "e2e-report.json"), analysis.e2eReport),
    writeJson(path.join(session.outputPaths.analysis, "integration-test-environment-readiness-report.json"), analysis.integrationTestEnvironmentReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "chaos-engineering-readiness-report.json"), analysis.chaosEngineeringReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "accessibility-report.json"), analysis.accessibilityReport),
    writeJson(path.join(session.outputPaths.analysis, "storybook-report.json"), analysis.storybookReport),
    writeJson(path.join(session.outputPaths.analysis, "design-tokens-report.json"), analysis.designTokensReport),
    writeJson(path.join(session.outputPaths.analysis, "i18n-report.json"), analysis.i18nReport),
    writeJson(path.join(session.outputPaths.analysis, "release-readiness-report.json"), analysis.releaseReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "secret-readiness-report.json"), analysis.secretReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "secret-management-readiness-report.json"), analysis.secretManagementReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "container-readiness-report.json"), analysis.containerReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "code-quality-report.json"), analysis.codeQualityReport),
    writeJson(path.join(session.outputPaths.analysis, "documentation-report.json"), analysis.documentationReport),
    writeJson(path.join(session.outputPaths.analysis, "database-readiness-report.json"), analysis.databaseReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "ci-cd-report.json"), analysis.ciCdReport),
    writeJson(path.join(session.outputPaths.analysis, "unit-test-report.json"), analysis.unitTestReport),
    writeJson(path.join(session.outputPaths.analysis, "mutation-testing-readiness-report.json"), analysis.mutationTestingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "typecheck-readiness-report.json"), analysis.typecheckReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "package-manager-report.json"), analysis.packageManagerReport),
    writeJson(path.join(session.outputPaths.analysis, "git-hooks-report.json"), analysis.gitHooksReport),
    writeJson(path.join(session.outputPaths.analysis, "task-runner-report.json"), analysis.taskRunnerReport),
    writeJson(path.join(session.outputPaths.analysis, "dependency-update-report.json"), analysis.dependencyUpdateReport),
    writeJson(path.join(session.outputPaths.analysis, "lint-readiness-report.json"), analysis.lintReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "format-readiness-report.json"), analysis.formatReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "commit-conventions-report.json"), analysis.commitConventionReport),
    writeJson(path.join(session.outputPaths.analysis, "changelog-readiness-report.json"), analysis.changelogReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "bundle-analysis-report.json"), analysis.bundleAnalysisReport),
    writeJson(path.join(session.outputPaths.analysis, "mocking-readiness-report.json"), analysis.mockingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "data-fetching-readiness-report.json"), analysis.dataFetchingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "routing-readiness-report.json"), analysis.routingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "state-management-readiness-report.json"), analysis.stateManagementReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "form-readiness-report.json"), analysis.formReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "auth-readiness-report.json"), analysis.authReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "authorization-readiness-report.json"), analysis.authorizationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "payment-readiness-report.json"), analysis.paymentReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "email-readiness-report.json"), analysis.emailReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "queue-readiness-report.json"), analysis.queueReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "cache-readiness-report.json"), analysis.cacheReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "logging-readiness-report.json"), analysis.loggingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "feature-flag-readiness-report.json"), analysis.featureFlagReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "rate-limit-readiness-report.json"), analysis.rateLimitReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "error-tracking-readiness-report.json"), analysis.errorTrackingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "analytics-readiness-report.json"), analysis.analyticsReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "http-client-readiness-report.json"), analysis.httpClientReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "schema-validation-readiness-report.json"), analysis.schemaValidationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "datetime-readiness-report.json"), analysis.dateTimeReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "id-generation-readiness-report.json"), analysis.idGenerationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "image-processing-readiness-report.json"), analysis.imageProcessingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "file-upload-readiness-report.json"), analysis.fileUploadReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "websocket-readiness-report.json"), analysis.webSocketReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "pdf-generation-readiness-report.json"), analysis.pdfGenerationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "spreadsheet-readiness-report.json"), analysis.spreadsheetReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "chart-visualization-readiness-report.json"), analysis.chartVisualizationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "diagram-rendering-readiness-report.json"), analysis.diagramRenderingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "link-integrity-readiness-report.json"), analysis.linkIntegrityReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "seo-metadata-readiness-report.json"), analysis.seoMetadataReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "pwa-readiness-report.json"), analysis.pwaReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "browser-compat-readiness-report.json"), analysis.browserCompatibilityReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "browser-extension-readiness-report.json"), analysis.browserExtensionReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "env-validation-readiness-report.json"), analysis.envValidationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "security-headers-readiness-report.json"), analysis.securityHeadersReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "graphql-readiness-report.json"), analysis.graphqlReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "cli-readiness-report.json"), analysis.cliReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "llm-readiness-report.json"), analysis.llmReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "llm-eval-readiness-report.json"), analysis.llmEvalReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "llm-observability-readiness-report.json"), analysis.llmObservabilityReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "vector-db-readiness-report.json"), analysis.vectorDbReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "search-service-readiness-report.json"), analysis.searchServiceReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "object-storage-readiness-report.json"), analysis.objectStorageReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "realtime-collaboration-readiness-report.json"), analysis.realtimeCollaborationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "workflow-orchestration-readiness-report.json"), analysis.workflowOrchestrationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "openapi-client-readiness-report.json"), analysis.openApiClientReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "webhook-readiness-report.json"), analysis.webhookReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "notification-readiness-report.json"), analysis.notificationReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "consent-readiness-report.json"), analysis.consentReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "server-framework-readiness-report.json"), analysis.serverFrameworkReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "rpc-readiness-report.json"), analysis.rpcReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "workspace-graph-readiness-report.json"), analysis.workspaceGraphReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "scaffolding-readiness-report.json"), analysis.scaffoldingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "scheduler-readiness-report.json"), analysis.schedulerReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "build-tool-readiness-report.json"), analysis.buildToolReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "styling-readiness-report.json"), analysis.stylingReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "visual-regression-readiness-report.json"), analysis.visualRegressionReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "infrastructure-readiness-report.json"), analysis.infrastructureReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "deployment-readiness-report.json"), analysis.deploymentReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "serverless-readiness-report.json"), analysis.serverlessReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "mobile-readiness-report.json"), analysis.mobileReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "desktop-readiness-report.json"), analysis.desktopReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "edge-readiness-report.json"), analysis.edgeReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "compose-readiness-report.json"), analysis.composeReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "devcontainer-readiness-report.json"), analysis.devContainerReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "kubernetes-readiness-report.json"), analysis.kubernetesReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "gitops-readiness-report.json"), analysis.gitopsReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "backup-readiness-report.json"), analysis.backupReadinessReport),
    writeJson(path.join(session.outputPaths.analysis, "context-pack-report.json"), analysis.contextPackReport),
    writeJson(path.join(session.outputPaths.analysis, "mcp-handoff-report.json"), analysis.mcpHandoffReport),
    writeJson(path.join(session.outputPaths.analysis, "agent-memory-report.json"), analysis.agentMemoryReport),
    writeJson(path.join(session.outputPaths.analysis, "graph-query-report.json"), analysis.graphQueryReport),
    writeJson(path.join(session.outputPaths.analysis, "tutorial-abstraction-report.json"), analysis.tutorialAbstractionReport),
    writeJson(path.join(session.outputPaths.analysis, "decision-record-report.json"), analysis.decisionRecordReport),
    writeJson(path.join(session.outputPaths.analysis, "dependency-health-report.json"), analysis.dependencyHealthReport),
    writeJson(path.join(session.outputPaths.analysis, "component-graph-report.json"), analysis.componentGraphReport),
    writeJson(path.join(session.outputPaths.analysis, "source-snapshot-report.json"), analysis.sourceSnapshotReport),
    writeJson(path.join(session.outputPaths.analysis, "incremental-report.json"), analysis.incrementalReport),
    writeJson(path.join(session.outputPaths.analysis, "flow-report.json"), analysis.flowReport),
    writeJson(path.join(session.outputPaths.analysis, "glossary.json"), analysis.glossary),
    writeJson(path.join(session.outputPaths.analysis, "rebuild-roadmap.json"), analysis.rebuildRoadmap),
    writeJson(path.join(session.outputPaths.analysis, "quiz.json"), quiz),
    writeJson(path.join(session.outputPaths.analysis, "wrong-notes.json"), wrongNotes),
    fs.writeFile(path.join(session.outputPaths.codex, "thread.json"), JSON.stringify({ sessionId: session.sessionId, codexThreadId: session.codexThreadId }, null, 2))
  ]);

  const markdown = markdownFiles(session, analysis, quiz, wrongNotes);
  for (const [fileName, content] of Object.entries(markdown)) {
    await fs.writeFile(path.join(session.outputPaths.markdown, fileName), content);
  }
  await fs.writeFile(path.join(session.outputPaths.root, "README.study.md"), readmeStudy(session));
  const htmlInput = { session, ...analysis, quiz, wrongNotes, attempts };
  const rendered = renderStudyHtml(htmlInput);
  await writeRenderedHtml(session.outputPaths.root, rendered);
  const sessionVerification = await verifyStudySessionArtifacts(session.outputPaths.root);
  await writeJson(path.join(session.outputPaths.analysis, "session-verification-report.json"), sessionVerification);
  await fs.writeFile(path.join(session.outputPaths.markdown, "session-verification.md"), renderSessionVerificationMarkdown(sessionVerification));
  if (!sessionVerification.ok) throw new Error("Session artifact verification failed.");
}

async function ensureSessionDirs(session: StudySession): Promise<void> {
  await Promise.all([
    ensureDir(session.outputPaths.analysis),
    ensureDir(session.outputPaths.markdown),
    ensureDir(session.outputPaths.codex),
    ensureDir(path.join(session.outputPaths.html, "assets"))
  ]);
}

async function readAttempts(filePath: string): Promise<QuizAttempt[]> {
  if (!await pathExists(filePath)) return [];
  const text = await fs.readFile(filePath, "utf8");
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as QuizAttempt);
}
