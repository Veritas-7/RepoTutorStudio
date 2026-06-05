import crypto from "node:crypto";
import type {
  ArchitectureReport,
  DependencyReport,
  FileLesson,
  FlowReport,
  FolderLesson,
  GlossaryTerm,
  HtmlExportManifest,
  LanguageReport,
  PurposeReport,
  Quiz,
  QuizAttempt,
  RebuildRoadmap,
  RepoMap,
  SuggestedReadsReport,
  RuntimeEnvironmentReport,
  InterfaceMapReport,
  SymbolMapReport,
  ApiReferenceReport,
  SearchIndexReport,
  ContextPackReport,
  McpHandoffReport,
  AgentMemoryReport,
  GraphQueryReport,
  TutorialAbstractionReport,
  DecisionRecordReport,
  DependencyHealthReport,
  LearningJournalReport,
  ProjectActivityReport,
  CodeMetricsReadinessReport,
  CodeOwnershipReadinessReport,
  LargeAssetReadinessReport,
  LicenseRightsReport,
  SbomReport,
  SecurityReadinessReport,
  ScorecardReport,
  ProvenanceReport,
  AdvisoryReport,
  VexReport,
  PolicyGateReport,
  ApiContractReport,
  ConsumerContractReadinessReport,
  ObservabilityReport,
  PerformanceReport,
  LoadTestingReadinessReport,
  BenchmarkReadinessReport,
  E2eReport,
  FlakyTestReadinessReport,
  TestImpactReadinessReport,
  TestReportingReadinessReport,
  SnapshotReadinessReport,
  PropertyBasedTestingReadinessReport,
  TestDataReadinessReport,
  IntegrationTestEnvironmentReadinessReport,
  ChaosEngineeringReadinessReport,
  AccessibilityReport,
  StorybookReport,
  DesignTokensReport,
  I18nReport,
  ReleaseReadinessReport,
  SecretReadinessReport,
  SecretManagementReadinessReport,
  ContainerReadinessReport,
  CodeQualityReport,
  DocumentationReport,
  DatabaseReadinessReport,
  DatabaseMigrationReadinessReport,
  DatabaseOrmReadinessReport,
  DataQualityReadinessReport,
  DataLineageReadinessReport,
  DataCatalogReadinessReport,
  DataAnnotationReadinessReport,
  FeatureStoreReadinessReport,
  ModelRegistryReadinessReport,
  ExperimentTrackingReadinessReport,
  ModelMonitoringReadinessReport,
  ModelServingReadinessReport,
  ModelTrainingReadinessReport,
  CiCdReport,
  UnitTestReport,
  CoverageReadinessReport,
  MutationTestingReadinessReport,
  TypecheckReadinessReport,
  PackageManagerReport,
  GitHooksReport,
  TaskRunnerReport,
  DependencyUpdateReport,
  LintReadinessReport,
  FormatReadinessReport,
  CommitConventionReport,
  ChangelogReadinessReport,
  BundleAnalysisReport,
  MockingReadinessReport,
  DataFetchingReadinessReport,
  RoutingReadinessReport,
  StateManagementReadinessReport,
  FormReadinessReport,
  AuthReadinessReport,
  AuthorizationReadinessReport,
  PaymentReadinessReport,
  EmailReadinessReport,
  QueueReadinessReport,
  CacheReadinessReport,
  LoggingReadinessReport,
  FeatureFlagReadinessReport,
  RateLimitReadinessReport,
  ErrorTrackingReadinessReport,
  AnalyticsReadinessReport,
  HttpClientReadinessReport,
  SchemaValidationReadinessReport,
  DateTimeReadinessReport,
  IdGenerationReadinessReport,
  ImageProcessingReadinessReport,
  FileUploadReadinessReport,
  WebSocketReadinessReport,
  PdfGenerationReadinessReport,
  SpreadsheetReadinessReport,
  ChartVisualizationReadinessReport,
  DiagramRenderingReadinessReport,
  LinkIntegrityReadinessReport,
  SeoMetadataReadinessReport,
  PwaReadinessReport,
  BrowserCompatibilityReadinessReport,
  BrowserExtensionReadinessReport,
  EnvValidationReadinessReport,
  SecurityHeadersReadinessReport,
  GraphqlReadinessReport,
  CliReadinessReport,
  LlmReadinessReport,
  LlmEvalReadinessReport,
  LlmObservabilityReadinessReport,
  VectorDbReadinessReport,
  SearchServiceReadinessReport,
  ObjectStorageReadinessReport,
  RealtimeCollaborationReadinessReport,
  WorkflowOrchestrationReadinessReport,
  OpenApiClientReadinessReport,
  WebhookReadinessReport,
  NotificationReadinessReport,
  ConsentReadinessReport,
  PrivacyReadinessReport,
  ServerFrameworkReadinessReport,
  RpcReadinessReport,
  WorkspaceGraphReadinessReport,
  ScaffoldingReadinessReport,
  SchedulerReadinessReport,
  BuildToolReadinessReport,
  StylingReadinessReport,
  VisualRegressionReadinessReport,
  InfrastructureReadinessReport,
  DeploymentReadinessReport,
  ServerlessReadinessReport,
  MobileReadinessReport,
  DesktopReadinessReport,
  EdgeReadinessReport,
  ComposeReadinessReport,
  DevContainerReadinessReport,
  KubernetesReadinessReport,
  GitOpsReadinessReport,
  BackupReadinessReport,
  StudySession,
  CoverageReport,
  ComponentGraphReport,
  SourceSnapshotReport,
  IncrementalReport,
  WrongNote
} from "@repotutor/shared";
import { htmlAnchor } from "@repotutor/shared";

export interface StudyHtmlInput {
  session: StudySession;
  repoMap: RepoMap;
  languageReport: LanguageReport;
  dependencyReport: DependencyReport;
  purposeReport: PurposeReport;
  architectureReport: ArchitectureReport;
  folderLessons: FolderLesson[];
  fileLessons: FileLesson[];
  coverageReport: CoverageReport;
  suggestedReadsReport: SuggestedReadsReport;
  runtimeEnvironmentReport: RuntimeEnvironmentReport;
  interfaceMapReport: InterfaceMapReport;
  symbolMapReport: SymbolMapReport;
  apiReferenceReport: ApiReferenceReport;
  searchIndexReport: SearchIndexReport;
  contextPackReport: ContextPackReport;
  mcpHandoffReport: McpHandoffReport;
  agentMemoryReport: AgentMemoryReport;
  graphQueryReport: GraphQueryReport;
  tutorialAbstractionReport: TutorialAbstractionReport;
  decisionRecordReport: DecisionRecordReport;
  dependencyHealthReport: DependencyHealthReport;
  learningJournalReport: LearningJournalReport;
  projectActivityReport: ProjectActivityReport;
  codeMetricsReadinessReport: CodeMetricsReadinessReport;
  codeOwnershipReadinessReport: CodeOwnershipReadinessReport;
  largeAssetReadinessReport: LargeAssetReadinessReport;
  licenseRightsReport: LicenseRightsReport;
  sbomReport: SbomReport;
  securityReadinessReport: SecurityReadinessReport;
  scorecardReport: ScorecardReport;
  provenanceReport: ProvenanceReport;
  advisoryReport: AdvisoryReport;
  vexReport: VexReport;
  policyGateReport: PolicyGateReport;
  apiContractReport: ApiContractReport;
  consumerContractReadinessReport: ConsumerContractReadinessReport;
  observabilityReport: ObservabilityReport;
  performanceReport: PerformanceReport;
  loadTestingReadinessReport: LoadTestingReadinessReport;
  benchmarkReadinessReport: BenchmarkReadinessReport;
  e2eReport: E2eReport;
  flakyTestReadinessReport: FlakyTestReadinessReport;
  testImpactReadinessReport: TestImpactReadinessReport;
  testReportingReadinessReport: TestReportingReadinessReport;
  snapshotReadinessReport: SnapshotReadinessReport;
  propertyBasedTestingReadinessReport: PropertyBasedTestingReadinessReport;
  testDataReadinessReport: TestDataReadinessReport;
  integrationTestEnvironmentReadinessReport: IntegrationTestEnvironmentReadinessReport;
  chaosEngineeringReadinessReport: ChaosEngineeringReadinessReport;
  accessibilityReport: AccessibilityReport;
  storybookReport: StorybookReport;
  designTokensReport: DesignTokensReport;
  i18nReport: I18nReport;
  releaseReadinessReport: ReleaseReadinessReport;
  secretReadinessReport: SecretReadinessReport;
  secretManagementReadinessReport: SecretManagementReadinessReport;
  containerReadinessReport: ContainerReadinessReport;
  codeQualityReport: CodeQualityReport;
  documentationReport: DocumentationReport;
  databaseReadinessReport: DatabaseReadinessReport;
  databaseMigrationReadinessReport: DatabaseMigrationReadinessReport;
  databaseOrmReadinessReport: DatabaseOrmReadinessReport;
  dataQualityReadinessReport: DataQualityReadinessReport;
  dataLineageReadinessReport: DataLineageReadinessReport;
  dataCatalogReadinessReport: DataCatalogReadinessReport;
  dataAnnotationReadinessReport: DataAnnotationReadinessReport;
  featureStoreReadinessReport: FeatureStoreReadinessReport;
  modelRegistryReadinessReport: ModelRegistryReadinessReport;
  experimentTrackingReadinessReport: ExperimentTrackingReadinessReport;
  modelMonitoringReadinessReport: ModelMonitoringReadinessReport;
  modelServingReadinessReport: ModelServingReadinessReport;
  modelTrainingReadinessReport: ModelTrainingReadinessReport;
  ciCdReport: CiCdReport;
  unitTestReport: UnitTestReport;
  coverageReadinessReport: CoverageReadinessReport;
  mutationTestingReadinessReport: MutationTestingReadinessReport;
  typecheckReadinessReport: TypecheckReadinessReport;
  packageManagerReport: PackageManagerReport;
  gitHooksReport: GitHooksReport;
  taskRunnerReport: TaskRunnerReport;
  dependencyUpdateReport: DependencyUpdateReport;
  lintReadinessReport: LintReadinessReport;
  formatReadinessReport: FormatReadinessReport;
  commitConventionReport: CommitConventionReport;
  changelogReadinessReport: ChangelogReadinessReport;
  bundleAnalysisReport: BundleAnalysisReport;
  mockingReadinessReport: MockingReadinessReport;
  dataFetchingReadinessReport: DataFetchingReadinessReport;
  routingReadinessReport: RoutingReadinessReport;
  stateManagementReadinessReport: StateManagementReadinessReport;
  formReadinessReport: FormReadinessReport;
  authReadinessReport: AuthReadinessReport;
  authorizationReadinessReport: AuthorizationReadinessReport;
  paymentReadinessReport: PaymentReadinessReport;
  emailReadinessReport: EmailReadinessReport;
  queueReadinessReport: QueueReadinessReport;
  cacheReadinessReport: CacheReadinessReport;
  loggingReadinessReport: LoggingReadinessReport;
  featureFlagReadinessReport: FeatureFlagReadinessReport;
  rateLimitReadinessReport: RateLimitReadinessReport;
  errorTrackingReadinessReport: ErrorTrackingReadinessReport;
  analyticsReadinessReport: AnalyticsReadinessReport;
  httpClientReadinessReport: HttpClientReadinessReport;
  schemaValidationReadinessReport: SchemaValidationReadinessReport;
  dateTimeReadinessReport: DateTimeReadinessReport;
  idGenerationReadinessReport: IdGenerationReadinessReport;
  imageProcessingReadinessReport: ImageProcessingReadinessReport;
  fileUploadReadinessReport: FileUploadReadinessReport;
  webSocketReadinessReport: WebSocketReadinessReport;
  pdfGenerationReadinessReport: PdfGenerationReadinessReport;
  spreadsheetReadinessReport: SpreadsheetReadinessReport;
  chartVisualizationReadinessReport: ChartVisualizationReadinessReport;
  diagramRenderingReadinessReport: DiagramRenderingReadinessReport;
  linkIntegrityReadinessReport: LinkIntegrityReadinessReport;
  seoMetadataReadinessReport: SeoMetadataReadinessReport;
  pwaReadinessReport: PwaReadinessReport;
  browserCompatibilityReadinessReport: BrowserCompatibilityReadinessReport;
  browserExtensionReadinessReport: BrowserExtensionReadinessReport;
  envValidationReadinessReport: EnvValidationReadinessReport;
  securityHeadersReadinessReport: SecurityHeadersReadinessReport;
  graphqlReadinessReport: GraphqlReadinessReport;
  cliReadinessReport: CliReadinessReport;
  llmReadinessReport: LlmReadinessReport;
  llmEvalReadinessReport: LlmEvalReadinessReport;
  llmObservabilityReadinessReport: LlmObservabilityReadinessReport;
  vectorDbReadinessReport: VectorDbReadinessReport;
  searchServiceReadinessReport: SearchServiceReadinessReport;
  objectStorageReadinessReport: ObjectStorageReadinessReport;
  realtimeCollaborationReadinessReport: RealtimeCollaborationReadinessReport;
  workflowOrchestrationReadinessReport: WorkflowOrchestrationReadinessReport;
  openApiClientReadinessReport: OpenApiClientReadinessReport;
  webhookReadinessReport: WebhookReadinessReport;
  notificationReadinessReport: NotificationReadinessReport;
  consentReadinessReport: ConsentReadinessReport;
  privacyReadinessReport: PrivacyReadinessReport;
  serverFrameworkReadinessReport: ServerFrameworkReadinessReport;
  rpcReadinessReport: RpcReadinessReport;
  workspaceGraphReadinessReport: WorkspaceGraphReadinessReport;
  scaffoldingReadinessReport: ScaffoldingReadinessReport;
  schedulerReadinessReport: SchedulerReadinessReport;
  buildToolReadinessReport: BuildToolReadinessReport;
  stylingReadinessReport: StylingReadinessReport;
  visualRegressionReadinessReport: VisualRegressionReadinessReport;
  infrastructureReadinessReport: InfrastructureReadinessReport;
  deploymentReadinessReport: DeploymentReadinessReport;
  serverlessReadinessReport: ServerlessReadinessReport;
  mobileReadinessReport: MobileReadinessReport;
  desktopReadinessReport: DesktopReadinessReport;
  edgeReadinessReport: EdgeReadinessReport;
  composeReadinessReport: ComposeReadinessReport;
  devContainerReadinessReport: DevContainerReadinessReport;
  kubernetesReadinessReport: KubernetesReadinessReport;
  gitopsReadinessReport: GitOpsReadinessReport;
  backupReadinessReport: BackupReadinessReport;
  componentGraphReport: ComponentGraphReport;
  sourceSnapshotReport: SourceSnapshotReport;
  incrementalReport: IncrementalReport;
  flowReport: FlowReport;
  glossary: GlossaryTerm[];
  rebuildRoadmap: RebuildRoadmap;
  quiz: Quiz;
  wrongNotes: WrongNote[];
  attempts: QuizAttempt[];
}

export interface RenderedPage {
  name: string;
  title: string;
  html: string;
}

export interface RenderedStudy {
  pages: RenderedPage[];
  assets: Record<string, string>;
  manifest: HtmlExportManifest;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items: string[]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function pageShell(title: string, active: string, body: string, input: StudyHtmlInput): string {
  const nav = [
    ["index.html", "Overview"],
    ["learning-path.html", "Learning Path"],
    ["language.html", "Language"],
    ["architecture.html", "Architecture"],
    ["folders.html", "Folders"],
    ["files.html", "Files"],
    ["evidence.html", "Evidence"],
    ["suggested-reads.html", "Suggested Reads"],
    ["runtime-environment.html", "Runtime Environment"],
    ["interface-map.html", "Interface Map"],
    ["symbol-map.html", "Symbol Map"],
    ["api-reference.html", "API Reference"],
    ["search-index.html", "Search Index"],
    ["learning-journal.html", "Learning Journal"],
    ["project-activity.html", "Project Activity"],
    ["code-metrics-readiness.html", "Code Metrics"],
    ["code-ownership-readiness.html", "Code Ownership"],
    ["large-asset-readiness.html", "Large Assets"],
    ["license-rights.html", "License Rights"],
    ["sbom.html", "SBOM"],
    ["security-readiness.html", "Security Readiness"],
    ["scorecard.html", "Project Scorecard"],
    ["provenance.html", "Provenance Readiness"],
    ["advisories.html", "Advisory Readiness"],
    ["vex.html", "OpenVEX Readiness"],
    ["policy-gates.html", "Policy Gates"],
    ["api-contracts.html", "API Contracts"],
    ["consumer-contract-readiness.html", "Consumer Contracts"],
    ["observability.html", "Observability"],
    ["performance.html", "Performance"],
    ["load-testing-readiness.html", "Load Testing"],
    ["benchmark-readiness.html", "Benchmarks"],
    ["e2e.html", "E2E"],
    ["flaky-test-readiness.html", "Flaky Tests"],
    ["test-impact-readiness.html", "Test Impact"],
    ["test-reporting-readiness.html", "Test Reporting"],
    ["snapshot-readiness.html", "Snapshots"],
    ["property-based-testing-readiness.html", "Property Tests"],
    ["test-data-readiness.html", "Test Data"],
    ["chaos-engineering-readiness.html", "Chaos Engineering"],
    ["accessibility.html", "Accessibility"],
    ["storybook.html", "Storybook"],
    ["design-tokens.html", "Design Tokens"],
    ["i18n.html", "I18n"],
    ["release-readiness.html", "Release"],
    ["secret-readiness.html", "Secrets"],
    ["secret-management-readiness.html", "Secret Management"],
    ["container-readiness.html", "Containers"],
    ["code-quality.html", "Code Quality"],
    ["documentation.html", "Documentation"],
    ["database-readiness.html", "Database"],
    ["database-migration-readiness.html", "DB Migrations"],
    ["database-orm-readiness.html", "DB ORM"],
    ["data-quality-readiness.html", "Data Quality"],
    ["data-lineage-readiness.html", "Data Lineage"],
    ["data-catalog-readiness.html", "Data Catalog"],
    ["data-annotation-readiness.html", "Data Annotation"],
    ["feature-store-readiness.html", "Feature Store"],
    ["model-registry-readiness.html", "Model Registry"],
    ["experiment-tracking-readiness.html", "Experiment Tracking"],
    ["model-monitoring-readiness.html", "Model Monitoring"],
    ["model-serving-readiness.html", "Model Serving"],
    ["model-training-readiness.html", "Model Training"],
    ["ci-cd.html", "CI/CD"],
    ["unit-tests.html", "Unit Tests"],
    ["coverage-readiness.html", "Coverage"],
    ["mutation-testing-readiness.html", "Mutation Testing"],
    ["typecheck-readiness.html", "Typecheck"],
    ["package-manager.html", "Package Manager"],
    ["git-hooks.html", "Git Hooks"],
    ["task-runner.html", "Task Runner"],
    ["dependency-updates.html", "Dependency Updates"],
    ["lint-readiness.html", "Lint"],
    ["format-readiness.html", "Format"],
    ["commit-conventions.html", "Commits"],
    ["changelog-readiness.html", "Changelog"],
    ["bundle-analysis.html", "Bundles"],
    ["mocking-readiness.html", "Mocks"],
    ["data-fetching-readiness.html", "Data Fetching"],
    ["routing-readiness.html", "Routing"],
    ["state-management-readiness.html", "State Management"],
    ["form-readiness.html", "Forms"],
    ["auth-readiness.html", "Auth"],
    ["authorization-readiness.html", "Authorization"],
    ["payment-readiness.html", "Payments"],
    ["email-readiness.html", "Email"],
    ["analytics-readiness.html", "Analytics"],
    ["http-client-readiness.html", "HTTP Client"],
    ["schema-validation-readiness.html", "Validation"],
    ["datetime-readiness.html", "Datetime"],
    ["id-generation-readiness.html", "ID Generation"],
    ["image-processing-readiness.html", "Images"],
    ["file-upload-readiness.html", "Uploads"],
    ["websocket-readiness.html", "WebSockets"],
    ["pdf-generation-readiness.html", "PDF Generation"],
    ["spreadsheet-readiness.html", "Spreadsheets"],
    ["chart-visualization-readiness.html", "Charts"],
    ["diagram-rendering-readiness.html", "Diagrams"],
    ["link-integrity-readiness.html", "Link Integrity"],
    ["seo-metadata-readiness.html", "SEO Metadata"],
    ["pwa-readiness.html", "PWA"],
    ["browser-compat-readiness.html", "Browser Compat"],
    ["browser-extension-readiness.html", "Browser Extension"],
    ["env-validation-readiness.html", "Env Validation"],
    ["security-headers-readiness.html", "Security Headers"],
    ["graphql-readiness.html", "GraphQL"],
    ["cli-readiness.html", "CLI"],
    ["llm-readiness.html", "LLM"],
    ["llm-eval-readiness.html", "LLM Eval"],
    ["llm-observability-readiness.html", "LLM Observability"],
    ["vector-db-readiness.html", "Vector DB"],
    ["search-service-readiness.html", "Search Service"],
    ["object-storage-readiness.html", "Object Storage"],
    ["realtime-collaboration-readiness.html", "Realtime Collab"],
    ["workflow-orchestration-readiness.html", "Workflow Orchestration"],
    ["openapi-client-readiness.html", "OpenAPI Client"],
    ["webhook-readiness.html", "Webhook"],
    ["notification-readiness.html", "Notifications"],
    ["server-framework-readiness.html", "Server Framework"],
    ["rpc-readiness.html", "RPC"],
    ["workspace-graph-readiness.html", "Workspace Graph"],
    ["scaffolding-readiness.html", "Scaffolding"],
    ["scheduler-readiness.html", "Scheduler"],
    ["build-tool-readiness.html", "Build Tool"],
    ["styling-readiness.html", "Styling"],
    ["visual-regression-readiness.html", "Visual Regression"],
    ["infrastructure-readiness.html", "Infrastructure"],
    ["deployment-readiness.html", "Deployment"],
    ["context-pack.html", "Context Pack"],
    ["mcp-handoff.html", "MCP Handoff"],
    ["agent-memory.html", "Agent Memory"],
    ["graph-query.html", "Graph Query"],
    ["tutorial-abstractions.html", "Tutorial Abstractions"],
    ["decision-records.html", "Decision Records"],
    ["dependency-health.html", "Dependency Health"],
    ["session-verification.html", "Verification"],
    ["coverage.html", "Coverage"],
    ["component-graph.html", "Component Graph"],
    ["incremental.html", "Incremental"],
    ["flow.html", "Flow"],
    ["glossary.html", "Glossary"],
    ["rebuild.html", "Rebuild"],
    ["quiz.html", "Quiz"],
    ["quiz-print.html", "Quiz Print"],
    ["wrong-notes.html", "Wrong Notes"]
  ];

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - ${escapeHtml(input.session.repo)}</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <aside class="sidebar">
    <strong>RepoTutor Studio</strong>
    <input id="search" type="search" placeholder="검색">
    <nav>${nav.map(([href, label]) => `<a class="${href === active ? "active" : ""}" href="${href}">${label}</a>`).join("")}</nav>
  </aside>
  <main>
    <header class="page-header">
      <div>
        <p class="eyebrow">${escapeHtml(input.session.owner)} / ${escapeHtml(input.session.repo)}</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <dl class="meta">
        <div><dt>날짜</dt><dd>${escapeHtml(input.session.createdAt.slice(0, 10))}</dd></div>
        <div><dt>branch</dt><dd>${escapeHtml(input.session.branch)}</dd></div>
        <div><dt>commit</dt><dd>${escapeHtml(input.session.commitHash.slice(0, 8))}</dd></div>
        <div><dt>mode</dt><dd>${escapeHtml(input.session.studyMode)}</dd></div>
      </dl>
    </header>
    ${body}
  </main>
  <script src="assets/app.js"></script>
</body>
</html>`;
}

export function renderStudyHtml(input: StudyHtmlInput): RenderedStudy {
  const latestAttempt = input.attempts.at(-1);
  const weakConcepts = input.wrongNotes.flatMap((note) => note.relatedConcepts).slice(0, 5);
  const coverageEvidence = coverageEvidenceFor(input.coverageReport);
  const coverageEvidenceKinds = evidenceKindList(coverageEvidence.evidenceKindCounts);
  const coverageDelta = coverageDeltaFor(input.incrementalReport);
  const graphSummary = graphSummaryFor(input.componentGraphReport);
  const graphFilters = graphFilterButtons(input.componentGraphReport.nodes);
  const fileNavigation = fileNavigationFor(input.fileLessons);
  const evidenceFilters = evidenceKindFilterButtons(input.fileLessons);
  const quizFilters = quizFilterButtons(input.quiz.questions);
  const learningPath = learningPathFor(input);
  const pages: RenderedPage[] = [
    {
      name: "index.html",
      title: "학습 리포트",
      html: pageShell("학습 리포트", "index.html", `
        <section class="panel">
          <h2>프로젝트 요약</h2>
          <p class="lead">${escapeHtml(input.purposeReport.oneLineSummary)}</p>
          <p>${escapeHtml(input.purposeReport.longExplanation)}</p>
          <h3>대상 사용자</h3>${list(input.purposeReport.targetUsers)}
          <h3>해결하는 문제</h3>${list(input.purposeReport.solvedProblems)}
        </section>
        <section class="grid">
          <article><h3>학습 지도</h3>${list(["Overview", "Language", "Folders", "Files", "Evidence", "Verification", "Flow", "Glossary", "Rebuild", "Quiz"])}</article>
          <article><h3>커버리지</h3><p>${(input.coverageReport.coverageRatio * 100).toFixed(1)}% · 핵심 파일 ${input.coverageReport.coveredImportantFiles}개 설명</p><p>소스 근거 ${coverageEvidence.evidenceBackedFiles}개 · ${(coverageEvidence.evidenceCoverageRatio * 100).toFixed(1)}%</p><p>근거 종류 ${coverageEvidenceKinds.length}개</p><a href="coverage.html">커버리지 열기</a></article>
          <article><h3>근거 인덱스</h3><p>소스 근거 ${input.fileLessons.reduce((sum, lesson) => sum + (lesson.sourceEvidence ?? []).length, 0)}개</p><p>파일 수업과 복사된 원본 소스를 함께 엽니다.</p><a href="evidence.html">근거 인덱스 열기</a></article>
          <article><h3>추천 읽기</h3><p>${escapeHtml(input.suggestedReadsReport.summary)}</p><p>Repo Baby 패턴으로 먼저 읽을 파일을 정렬합니다.</p><a href="suggested-reads.html">추천 읽기 열기</a></article>
          <article><h3>실행 환경</h3><p>${escapeHtml(input.runtimeEnvironmentReport.summary)}</p><p>docSmith 패턴으로 Docker와 setup 신호를 정리합니다.</p><a href="runtime-environment.html">실행 환경 열기</a></article>
          <article><h3>인터페이스 맵</h3><p>${escapeHtml(input.interfaceMapReport.summary)}</p><p>repomap 패턴으로 route/page/API 신호를 모읍니다.</p><a href="interface-map.html">인터페이스 맵 열기</a></article>
          <article><h3>심볼 맵</h3><p>${escapeHtml(input.symbolMapReport.summary)}</p><p>codebase-map 패턴으로 함수/클래스/상수 신호를 모읍니다.</p><a href="symbol-map.html">심볼 맵 열기</a></article>
          <article><h3>API Reference</h3><p>${escapeHtml(input.apiReferenceReport.summary)}</p><p>TypeDoc 패턴으로 entry point, ReflectionKind, public export surface를 정리합니다.</p><a href="api-reference.html">API Reference 열기</a></article>
          <article><h3>Search Index</h3><p>${escapeHtml(input.searchIndexReport.summary)}</p><p>Pagefind 패턴으로 generated page, file lesson, folder lesson을 검색 가능한 문서 단위로 나눕니다.</p><a href="search-index.html">Search Index 열기</a></article>
          <article><h3>Learning Journal</h3><p>${escapeHtml(input.learningJournalReport.summary)}</p><p>learn-codebase 패턴으로 예측 질문, mastery map, spaced review queue를 남깁니다.</p><a href="learning-journal.html">Learning Journal 열기</a></article>
          <article><h3>Project Activity</h3><p>${escapeHtml(input.projectActivityReport.summary)}</p><p>Repowise 패턴으로 snapshot-only activity, hotspot, dead-code, decision queue를 묶습니다.</p><a href="project-activity.html">Project Activity 열기</a></article>
          <article><h3>Code Metrics Readiness</h3><p>${escapeHtml(input.codeMetricsReadinessReport.summary)}</p><p>scc/lizard/tokei 패턴으로 LOC, branch token, function-like token, hotspot 읽기 순서를 정리합니다.</p><a href="code-metrics-readiness.html">Code Metrics 열기</a></article>
          <article><h3>Code Ownership Readiness</h3><p>${escapeHtml(input.codeOwnershipReadinessReport.summary)}</p><p>CODEOWNERS, validator, required review, branch protection 신호를 분리해 소유권 리뷰 준비도를 확인합니다.</p><a href="code-ownership-readiness.html">Code Ownership 열기</a></article>
          <article><h3>Large Asset Readiness</h3><p>${escapeHtml(input.largeAssetReadinessReport.summary)}</p><p>Git LFS/DVC 패턴으로 large file, dataset, model, media asset versioning 준비도를 분리합니다.</p><a href="large-asset-readiness.html">Large Assets 열기</a></article>
          <article><h3>License Rights</h3><p>${escapeHtml(input.licenseRightsReport.summary)}</p><p>Licensee 패턴으로 license file, package metadata, README 참조를 분리합니다.</p><a href="license-rights.html">License Rights 열기</a></article>
          <article><h3>SBOM</h3><p>${escapeHtml(input.sbomReport.summary)}</p><p>Syft 패턴으로 source descriptor, package artifacts, file artifacts, relationships를 inventory로 묶습니다.</p><a href="sbom.html">SBOM 열기</a></article>
          <article><h3>Security Readiness</h3><p>${escapeHtml(input.securityReadinessReport.summary)}</p><p>Trivy 패턴으로 targets, scanners, security signals, action queue를 분리합니다.</p><a href="security-readiness.html">Security Readiness 열기</a></article>
          <article><h3>Project Scorecard</h3><p>${escapeHtml(input.scorecardReport.summary)}</p><p>OpenSSF Scorecard 패턴으로 checks, risk, policy findings, remediation queue를 정리합니다.</p><a href="scorecard.html">Project Scorecard 열기</a></article>
          <article><h3>Provenance Readiness</h3><p>${escapeHtml(input.provenanceReport.summary)}</p><p>Cosign 패턴으로 signature material, bundle, attestation, identity requirement를 정리합니다.</p><a href="provenance.html">Provenance Readiness 열기</a></article>
          <article><h3>Advisory Query Readiness</h3><p>${escapeHtml(input.advisoryReport.summary)}</p><p>OSV-Scanner 패턴으로 package advisory query target, lockfile, ignore policy를 정리합니다.</p><a href="advisories.html">Advisory Readiness 열기</a></article>
          <article><h3>OpenVEX Impact Readiness</h3><p>${escapeHtml(input.vexReport.summary)}</p><p>OpenVEX 패턴으로 product, vulnerability input, status justification, SARIF filter 준비도를 정리합니다.</p><a href="vex.html">OpenVEX Readiness 열기</a></article>
          <article><h3>Policy Gate Readiness</h3><p>${escapeHtml(input.policyGateReport.summary)}</p><p>OPA 패턴으로 Rego policy, input/data fixture, test, bundle, decision output 준비도를 정리합니다.</p><a href="policy-gates.html">Policy Gates 열기</a></article>
          <article><h3>API Contract Readiness</h3><p>${escapeHtml(input.apiContractReport.summary)}</p><p>Schemathesis 패턴으로 schema, generated case phase, response check, runtime/reporting 준비도를 정리합니다.</p><a href="api-contracts.html">API Contracts 열기</a></article>
          <article><h3>Consumer Contract Readiness</h3><p>${escapeHtml(input.consumerContractReadinessReport.summary)}</p><p>Pact 패턴으로 consumer interaction, provider state, verifier, broker/can-i-deploy, matcher 준비도를 정리합니다.</p><a href="consumer-contract-readiness.html">Consumer Contracts 열기</a></article>
          <article><h3>Observability Readiness</h3><p>${escapeHtml(input.observabilityReport.summary)}</p><p>OpenTelemetry 패턴으로 traces, metrics, logs, exporter, resource/context readiness를 정리합니다.</p><a href="observability.html">Observability 열기</a></article>
          <article><h3>Performance Readiness</h3><p>${escapeHtml(input.performanceReport.summary)}</p><p>k6 패턴으로 load script, workload, thresholds, checks, metrics/output 준비도를 정리합니다.</p><a href="performance.html">Performance 열기</a></article>
          <article><h3>Load Testing Readiness</h3><p>${escapeHtml(input.loadTestingReadinessReport.summary)}</p><p>k6/Artillery/Locust 패턴으로 profile, protocol, SLO gates, data, execution, reports 준비도를 정리합니다.</p><a href="load-testing-readiness.html">Load Testing 열기</a></article>
          <article><h3>Benchmark Readiness</h3><p>${escapeHtml(input.benchmarkReadinessReport.summary)}</p><p>Tinybench/Benchmark.js/Hyperfine 패턴으로 suite, timing, comparison, reports, CI 준비도를 정리합니다.</p><a href="benchmark-readiness.html">Benchmarks 열기</a></article>
          <article><h3>E2E Readiness</h3><p>${escapeHtml(input.e2eReport.summary)}</p><p>Playwright 패턴으로 browser projects, locators, assertions, traces/reporters, webServer/baseURL 준비도를 정리합니다.</p><a href="e2e.html">E2E 열기</a></article>
          <article><h3>Flaky Test Readiness</h3><p>${escapeHtml(input.flakyTestReadinessReport.summary)}</p><p>Playwright/Pytest/Jest 패턴으로 retry, quarantine, fail-on-flaky, artifact, CI 준비도를 정리합니다.</p><a href="flaky-test-readiness.html">Flaky Tests 열기</a></article>
          <article><h3>Test Impact Readiness</h3><p>${escapeHtml(input.testImpactReadinessReport.summary)}</p><p>Nx/Jest/pytest-testmon 패턴으로 affected, related, changed-only test selection 준비도를 정리합니다.</p><a href="test-impact-readiness.html">Test Impact 열기</a></article>
          <article><h3>Test Reporting Readiness</h3><p>${escapeHtml(input.testReportingReadinessReport.summary)}</p><p>CTRF/Allure/JUnit/GitHub Actions 패턴으로 report format, annotations, summaries, artifacts 준비도를 정리합니다.</p><a href="test-reporting-readiness.html">Test Reporting 열기</a></article>
          <article><h3>Snapshot Readiness</h3><p>${escapeHtml(input.snapshotReadinessReport.summary)}</p><p>Jest/Vitest/Playwright 패턴으로 text, inline, file, visual, ARIA snapshots, update policy, serializers, baselines 준비도를 정리합니다.</p><a href="snapshot-readiness.html">Snapshots 열기</a></article>
          <article><h3>Property-Based Testing Readiness</h3><p>${escapeHtml(input.propertyBasedTestingReadinessReport.summary)}</p><p>fast-check/Hypothesis/jqwik 패턴으로 generator, shrink, seed, counterexample, stateful, CI 준비도를 정리합니다.</p><a href="property-based-testing-readiness.html">Property Tests 열기</a></article>
          <article><h3>Test Data Readiness</h3><p>${escapeHtml(input.testDataReadinessReport.summary)}</p><p>Factory Bot/factory_boy/Faker 패턴으로 factories, traits, associations, sequences, seeds, lint, CI 준비도를 정리합니다.</p><a href="test-data-readiness.html">Test Data 열기</a></article>
          <article><h3>Chaos Engineering Readiness</h3><p>${escapeHtml(input.chaosEngineeringReadinessReport.summary)}</p><p>Chaos Mesh, LitmusChaos, Toxiproxy 패턴으로 experiment, fault, scope, probe/steady-state, observability 준비도를 정리합니다.</p><a href="chaos-engineering-readiness.html">Chaos Engineering 열기</a></article>
          <article><h3>Accessibility Readiness</h3><p>${escapeHtml(input.accessibilityReport.summary)}</p><p>axe-core 패턴으로 scan targets, WCAG/category tags, result buckets, impact, context controls를 정리합니다.</p><a href="accessibility.html">Accessibility 열기</a></article>
          <article><h3>Storybook Readiness</h3><p>${escapeHtml(input.storybookReport.summary)}</p><p>Storybook 패턴으로 CSF stories, args, decorators, play functions, addons, publish/test signals를 정리합니다.</p><a href="storybook.html">Storybook 열기</a></article>
          <article><h3>Design Tokens Readiness</h3><p>${escapeHtml(input.designTokensReport.summary)}</p><p>Style Dictionary 패턴으로 token source, platform target, transform, usage, governance signals를 정리합니다.</p><a href="design-tokens.html">Design Tokens 열기</a></article>
          <article><h3>I18n Readiness</h3><p>${escapeHtml(input.i18nReport.summary)}</p><p>FormatJS 패턴으로 message source, locale asset, runtime, extraction, ICU, QA signals를 정리합니다.</p><a href="i18n.html">I18n 열기</a></article>
          <article><h3>Release Readiness</h3><p>${escapeHtml(input.releaseReadinessReport.summary)}</p><p>semantic-release 패턴으로 config, branches, plugin steps, CI, auth, publish targets를 정리합니다.</p><a href="release-readiness.html">Release 열기</a></article>
          <article><h3>Secret Readiness</h3><p>${escapeHtml(input.secretReadinessReport.summary)}</p><p>Gitleaks 패턴으로 scan targets, secret surfaces, config, reports, prevention signals를 정리합니다.</p><a href="secret-readiness.html">Secrets 열기</a></article>
          <article><h3>Secret Management Readiness</h3><p>${escapeHtml(input.secretManagementReadinessReport.summary)}</p><p>Vault/Infisical/Doppler/SOPS 패턴으로 runtime secret platform, auth, storage, delivery, governance 준비도를 정리합니다.</p><a href="secret-management-readiness.html">Secret Management 열기</a></article>
          <article><h3>Container Readiness</h3><p>${escapeHtml(input.containerReadinessReport.summary)}</p><p>Hadolint 패턴으로 Dockerfile, Compose, config, instruction risk, labels, CI signals를 정리합니다.</p><a href="container-readiness.html">Containers 열기</a></article>
          <article><h3>Code Quality</h3><p>${escapeHtml(input.codeQualityReport.summary)}</p><p>Biome 패턴으로 formatter, linter, assist, config, CI/editor signals를 정리합니다.</p><a href="code-quality.html">Code Quality 열기</a></article>
          <article><h3>Documentation</h3><p>${escapeHtml(input.documentationReport.summary)}</p><p>Docusaurus 패턴으로 docs, blog, pages, navigation, i18n, search, build/deploy 준비도를 정리합니다.</p><a href="documentation.html">Documentation 열기</a></article>
          <article><h3>Database Readiness</h3><p>${escapeHtml(input.databaseReadinessReport.summary)}</p><p>Prisma 패턴으로 schema, datasource, migrations, generated client, seed, env 준비도를 정리합니다.</p><a href="database-readiness.html">Database 열기</a></article>
          <article><h3>Database Migration Readiness</h3><p>${escapeHtml(input.databaseMigrationReadinessReport.summary)}</p><p>Flyway/Liquibase/Alembic 패턴으로 versioned migrations, changelog, revision, rollback, validation, CI 준비도를 정리합니다.</p><a href="database-migration-readiness.html">DB Migrations 열기</a></article>
          <article><h3>Database ORM Readiness</h3><p>${escapeHtml(input.databaseOrmReadinessReport.summary)}</p><p>TypeORM/Sequelize/SQLAlchemy 패턴으로 entity/model, relation, repository/session, transaction, loading, config 준비도를 정리합니다.</p><a href="database-orm-readiness.html">DB ORM 열기</a></article>
          <article><h3>Data Quality Readiness</h3><p>${escapeHtml(input.dataQualityReadinessReport.summary)}</p><p>Great Expectations, SodaCL, dbt data_tests 패턴으로 expectation, freshness, failed rows, artifact 준비도를 정리합니다.</p><a href="data-quality-readiness.html">Data Quality 열기</a></article>
          <article><h3>Data Lineage Readiness</h3><p>${escapeHtml(input.dataLineageReadinessReport.summary)}</p><p>OpenLineage, Marquez, dbt artifact 패턴으로 event, dataset edge, facet, column lineage, storage 준비도를 정리합니다.</p><a href="data-lineage-readiness.html">Data Lineage 열기</a></article>
          <article><h3>Data Catalog Readiness</h3><p>${escapeHtml(input.dataCatalogReadinessReport.summary)}</p><p>OpenMetadata, DataHub, Amundsen 패턴으로 ingestion, entity, governance, search, lineage 준비도를 정리합니다.</p><a href="data-catalog-readiness.html">Data Catalog 열기</a></article>
          <article><h3>Data Annotation Readiness</h3><p>${escapeHtml(input.dataAnnotationReadinessReport.summary)}</p><p>Label Studio, FiftyOne, Argilla 패턴으로 project, task, schema, workflow, quality, prelabel, export 준비도를 정리합니다.</p><a href="data-annotation-readiness.html">Data Annotation 열기</a></article>
          <article><h3>Feature Store Readiness</h3><p>${escapeHtml(input.featureStoreReadinessReport.summary)}</p><p>Feast, Feathr, Hopsworks 패턴으로 feature definition, source, offline/online store, registry, retrieval, materialization 준비도를 정리합니다.</p><a href="feature-store-readiness.html">Feature Store 열기</a></article>
          <article><h3>Model Registry Readiness</h3><p>${escapeHtml(input.modelRegistryReadinessReport.summary)}</p><p>MLflow, Kubeflow Model Registry, BentoML 패턴으로 registered model, model version, artifact, metadata, serving 준비도를 정리합니다.</p><a href="model-registry-readiness.html">Model Registry 열기</a></article>
          <article><h3>Experiment Tracking Readiness</h3><p>${escapeHtml(input.experimentTrackingReadinessReport.summary)}</p><p>MLflow Tracking, W&B, Neptune 패턴으로 experiment, run, metric, param, config, artifact, offline sync, CI 준비도를 정리합니다.</p><a href="experiment-tracking-readiness.html">Experiment Tracking 열기</a></article>
          <article><h3>Model Monitoring Readiness</h3><p>${escapeHtml(input.modelMonitoringReadinessReport.summary)}</p><p>Evidently, whylogs/WhyLabs, NannyML 패턴으로 reference/current data, drift, quality, performance, alert, CI 준비도를 정리합니다.</p><a href="model-monitoring-readiness.html">Model Monitoring 열기</a></article>
          <article><h3>Model Serving Readiness</h3><p>${escapeHtml(input.modelServingReadinessReport.summary)}</p><p>KServe, Seldon, Triton 패턴으로 inference service, runtime, protocol, routing, autoscaling, health, CI 준비도를 정리합니다.</p><a href="model-serving-readiness.html">Model Serving 열기</a></article>
          <article><h3>Model Training Readiness</h3><p>${escapeHtml(input.modelTrainingReadinessReport.summary)}</p><p>Lightning, Accelerate, Ray Train 패턴으로 trainer, train loop, distributed launch, checkpoint, callback, metrics, CI 준비도를 정리합니다.</p><a href="model-training-readiness.html">Model Training 열기</a></article>
          <article><h3>CI/CD Readiness</h3><p>${escapeHtml(input.ciCdReport.summary)}</p><p>GitHub Actions 패턴으로 workflow, trigger, job, permission, artifact/cache, deployment 준비도를 정리합니다.</p><a href="ci-cd.html">CI/CD 열기</a></article>
          <article><h3>Unit Test Readiness</h3><p>${escapeHtml(input.unitTestReport.summary)}</p><p>Vitest 패턴으로 test files, assertions, mocks, coverage, environment, reporters 준비도를 정리합니다.</p><a href="unit-tests.html">Unit Tests 열기</a></article>
          <article><h3>Coverage Readiness</h3><p>${escapeHtml(input.coverageReadinessReport.summary)}</p><p>nyc/c8/Codecov 패턴으로 instrumentation, scope, thresholds, reports, CI uploads 준비도를 정리합니다.</p><a href="coverage-readiness.html">Coverage 열기</a></article>
          <article><h3>Mutation Testing Readiness</h3><p>${escapeHtml(input.mutationTestingReadinessReport.summary)}</p><p>Stryker/Infection 패턴으로 mutate scope, runner, mutators, thresholds, reporters, survived mutant 준비도를 정리합니다.</p><a href="mutation-testing-readiness.html">Mutation Testing 열기</a></article>
          <article><h3>Typecheck Readiness</h3><p>${escapeHtml(input.typecheckReadinessReport.summary)}</p><p>TypeScript 패턴으로 tsconfig, strict flags, project references, module resolution, declaration emit, tsc scripts를 정리합니다.</p><a href="typecheck-readiness.html">Typecheck 열기</a></article>
          <article><h3>Package Manager Readiness</h3><p>${escapeHtml(input.packageManagerReport.summary)}</p><p>pnpm 패턴으로 packageManager, workspace, lockfile, scripts, install policy를 정리합니다.</p><a href="package-manager.html">Package Manager 열기</a></article>
          <article><h3>Git Hooks Readiness</h3><p>${escapeHtml(input.gitHooksReport.summary)}</p><p>Husky 패턴으로 .husky hook files, install scripts, pre-commit/pre-push policy, lint-staged, bypass signals를 정리합니다.</p><a href="git-hooks.html">Git Hooks 열기</a></article>
          <article><h3>Task Runner Readiness</h3><p>${escapeHtml(input.taskRunnerReport.summary)}</p><p>Turborepo 패턴으로 turbo.json, task graph, cache, dependsOn, env, package scripts를 정리합니다.</p><a href="task-runner.html">Task Runner 열기</a></article>
          <article><h3>Dependency Updates Readiness</h3><p>${escapeHtml(input.dependencyUpdateReport.summary)}</p><p>Renovate 패턴으로 update config, packageRules, automerge, dashboard, registry, package files를 정리합니다.</p><a href="dependency-updates.html">Dependency Updates 열기</a></article>
          <article><h3>Lint Readiness</h3><p>${escapeHtml(input.lintReadinessReport.summary)}</p><p>ESLint 패턴으로 flat config, rules, plugins, parser, ignores, fix/cache/report options를 정리합니다.</p><a href="lint-readiness.html">Lint 열기</a></article>
          <article><h3>Format Readiness</h3><p>${escapeHtml(input.formatReadinessReport.summary)}</p><p>Prettier 패턴으로 config, ignore, options, plugins, check/write/cache workflows를 정리합니다.</p><a href="format-readiness.html">Format 열기</a></article>
          <article><h3>Commit Conventions</h3><p>${escapeHtml(input.commitConventionReport.summary)}</p><p>commitlint 패턴으로 config, rules, commit-msg hooks, CI ranges, prompt/CLI commands를 정리합니다.</p><a href="commit-conventions.html">Commits 열기</a></article>
          <article><h3>Changelog Readiness</h3><p>${escapeHtml(input.changelogReadinessReport.summary)}</p><p>Changesets 패턴으로 changeset files, changelog config, status/version/publish workflows, package policy를 정리합니다.</p><a href="changelog-readiness.html">Changelog 열기</a></article>
          <article><h3>Bundle Analysis</h3><p>${escapeHtml(input.bundleAnalysisReport.summary)}</p><p>Webpack Bundle Analyzer 패턴으로 analyzer config, stats JSON, chunks, source maps, gzip/Brotli/Zstd size signals를 정리합니다.</p><a href="bundle-analysis.html">Bundles 열기</a></article>
          <article><h3>Mocking Readiness</h3><p>${escapeHtml(input.mockingReadinessReport.summary)}</p><p>MSW 패턴으로 handlers, setupWorker/setupServer, lifecycle, unhandled request policy, package signals를 정리합니다.</p><a href="mocking-readiness.html">Mocks 열기</a></article>
          <article><h3>Data Fetching Readiness</h3><p>${escapeHtml(input.dataFetchingReadinessReport.summary)}</p><p>TanStack Query 패턴으로 QueryClient, providers, query hooks, cache policy, invalidation, hydration, devtools를 정리합니다.</p><a href="data-fetching-readiness.html">Data Fetching 열기</a></article>
          <article><h3>Routing Readiness</h3><p>${escapeHtml(input.routingReadinessReport.summary)}</p><p>React Router 패턴으로 router mode, route definitions, navigation APIs, data routes, file routes를 정리합니다.</p><a href="routing-readiness.html">Routing 열기</a></article>
          <article><h3>State Management Readiness</h3><p>${escapeHtml(input.stateManagementReadinessReport.summary)}</p><p>Redux Toolkit 패턴으로 configureStore, slices, selectors, middleware, entity adapters, RTK Query 연결을 정리합니다.</p><a href="state-management-readiness.html">State Management 열기</a></article>
          <article><h3>Form Readiness</h3><p>${escapeHtml(input.formReadinessReport.summary)}</p><p>React Hook Form 패턴으로 useForm, register, submit, validation, errors, field array 준비도를 정리합니다.</p><a href="form-readiness.html">Forms 열기</a></article>
          <article><h3>Auth Readiness</h3><p>${escapeHtml(input.authReadinessReport.summary)}</p><p>Auth.js 패턴으로 handlers, providers, callbacks, sessions, middleware, env secret 준비도를 정리합니다.</p><a href="auth-readiness.html">Auth 열기</a></article>
          <article><h3>Authorization Readiness</h3><p>${escapeHtml(input.authorizationReadinessReport.summary)}</p><p>OpenFGA, Casbin, CASL, Oso 패턴으로 permission model, enforcement, identity boundary, governance, test 준비도를 정리합니다.</p><a href="authorization-readiness.html">Authorization 열기</a></article>
          <article><h3>Payment Readiness</h3><p>${escapeHtml(input.paymentReadinessReport.summary)}</p><p>Stripe 패턴으로 server client, checkout, PaymentIntent, webhooks, billing lifecycle, env secret 준비도를 정리합니다.</p><a href="payment-readiness.html">Payments 열기</a></article>
          <article><h3>Email Readiness</h3><p>${escapeHtml(input.emailReadinessReport.summary)}</p><p>Resend 패턴으로 provider client, send payload, templates, domains, webhooks, env secret 준비도를 정리합니다.</p><a href="email-readiness.html">Email 열기</a></article>
          <article><h3>Context Pack</h3><p>${escapeHtml(input.contextPackReport.summary)}</p><p>Repomix 패턴으로 LLM에 넣을 파일과 token budget을 확인합니다.</p><a href="context-pack.html">Context Pack 열기</a></article>
          <article><h3>MCP Handoff</h3><p>${escapeHtml(input.mcpHandoffReport.summary)}</p><p>codebase-mcp 패턴으로 AI 도구에 넘길 tool/prompt를 정리합니다.</p><a href="mcp-handoff.html">MCP Handoff 열기</a></article>
          <article><h3>Agent Memory</h3><p>${escapeHtml(input.agentMemoryReport.summary)}</p><p>Obsidian/Graphify 패턴으로 다음 AI 세션이 먼저 읽을 기억 노트를 만듭니다.</p><a href="agent-memory.html">Agent Memory 열기</a></article>
          <article><h3>Graph Query</h3><p>${escapeHtml(input.graphQueryReport.summary)}</p><p>Graphify 패턴으로 query/path/explain 질문을 준비합니다.</p><a href="graph-query.html">Graph Query 열기</a></article>
          <article><h3>Tutorial Abstractions</h3><p>${escapeHtml(input.tutorialAbstractionReport.summary)}</p><p>PocketFlow 패턴으로 핵심 추상화, 관계, 장 순서를 정리합니다.</p><a href="tutorial-abstractions.html">Tutorial Abstractions 열기</a></article>
          <article><h3>Decision Records</h3><p>${escapeHtml(input.decisionRecordReport.summary)}</p><p>Log4brains 패턴으로 Context, Decision, Status, Consequences를 정리합니다.</p><a href="decision-records.html">Decision Records 열기</a></article>
          <article><h3>Dependency Health</h3><p>${escapeHtml(input.dependencyHealthReport.summary)}</p><p>dependency-cruiser 패턴으로 no-circular, no-orphans, fan-in/fan-out을 확인합니다.</p><a href="dependency-health.html">Dependency Health 열기</a></article>
          <article><h3>LLM Eval Readiness</h3><p>${escapeHtml(input.llmEvalReadinessReport.summary)}</p><p>promptfoo/OpenAI eval/OpenEvals 패턴으로 prompt, provider, dataset, judge, red-team 준비도를 정리합니다.</p><a href="llm-eval-readiness.html">LLM Eval 열기</a></article>
          <article><h3>LLM Observability Readiness</h3><p>${escapeHtml(input.llmObservabilityReadinessReport.summary)}</p><p>Langfuse/Phoenix/Helicone 패턴으로 trace, session, token/cost, feedback, gateway 준비도를 정리합니다.</p><a href="llm-observability-readiness.html">LLM Observability 열기</a></article>
          <article><h3>Vector DB Readiness</h3><p>${escapeHtml(input.vectorDbReadinessReport.summary)}</p><p>Qdrant/Weaviate/Chroma 패턴으로 collection, embedding, ingestion, query, index, ops 준비도를 정리합니다.</p><a href="vector-db-readiness.html">Vector DB 열기</a></article>
          <article><h3>Search Service Readiness</h3><p>${escapeHtml(input.searchServiceReadinessReport.summary)}</p><p>Meilisearch/Typesense/OpenSearch 패턴으로 index, document, query, relevance, ops 준비도를 정리합니다.</p><a href="search-service-readiness.html">Search Service 열기</a></article>
          <article><h3>Object Storage Readiness</h3><p>${escapeHtml(input.objectStorageReadinessReport.summary)}</p><p>S3/MinIO/R2/Supabase Storage 패턴으로 bucket, object lifecycle, access, reliability, security, ops 준비도를 정리합니다.</p><a href="object-storage-readiness.html">Object Storage 열기</a></article>
          <article><h3>Realtime Collaboration Readiness</h3><p>${escapeHtml(input.realtimeCollaborationReadinessReport.summary)}</p><p>Yjs/Automerge/Liveblocks 패턴으로 shared document, provider, presence, sync, persistence, history 준비도를 정리합니다.</p><a href="realtime-collaboration-readiness.html">Realtime Collab 열기</a></article>
          <article><h3>Workflow Orchestration Readiness</h3><p>${escapeHtml(input.workflowOrchestrationReadinessReport.summary)}</p><p>Temporal/Inngest/Trigger.dev 패턴으로 trigger, execution, durability, flow control, runtime, observability 준비도를 정리합니다.</p><a href="workflow-orchestration-readiness.html">Workflow Orchestration 열기</a></article>
          <article><h3>OpenAPI Client Readiness</h3><p>${escapeHtml(input.openApiClientReadinessReport.summary)}</p><p>openapi-typescript/Orval/OpenAPI Generator 패턴으로 spec, generator, output, runtime, quality 준비도를 정리합니다.</p><a href="openapi-client-readiness.html">OpenAPI Client 열기</a></article>
          <article><h3>Webhook Readiness</h3><p>${escapeHtml(input.webhookReadinessReport.summary)}</p><p>Svix/Standard Webhooks/Hookdeck 패턴으로 endpoint, signature, replay, idempotency, delivery, local debug 준비도를 정리합니다.</p><a href="webhook-readiness.html">Webhook 열기</a></article>
          <article><h3>Notification Readiness</h3><p>${escapeHtml(input.notificationReadinessReport.summary)}</p><p>Novu 패턴으로 workflows, subscribers, topics, preferences, channels, templates, delivery operations 준비도를 정리합니다.</p><a href="notification-readiness.html">Notifications 열기</a></article>
          <article><h3>Consent Readiness</h3><p>${escapeHtml(input.consentReadinessReport.summary)}</p><p>CookieConsent/Klaro/IAB TCF 패턴으로 banner, categories, scripts, privacy controls, vendor/purpose consent 준비도를 정리합니다.</p><a href="consent-readiness.html">Consent 열기</a></article>
          <article><h3>Privacy Readiness</h3><p>${escapeHtml(input.privacyReadinessReport.summary)}</p><p>Presidio/OpenDP/scrubadub 패턴으로 PII detection, redaction, policy, retention, DSAR, privacy budget 준비도를 정리합니다.</p><a href="privacy-readiness.html">Privacy 열기</a></article>
          <article><h3>Server Framework Readiness</h3><p>${escapeHtml(input.serverFrameworkReadinessReport.summary)}</p><p>Fastify 패턴으로 routes, schemas, plugins, hooks, decorators, errors, runtime, tests 준비도를 정리합니다.</p><a href="server-framework-readiness.html">Server Framework 열기</a></article>
          <article><h3>RPC Readiness</h3><p>${escapeHtml(input.rpcReadinessReport.summary)}</p><p>tRPC 패턴으로 routers, procedures, validation, context, clients, adapters, errors 준비도를 정리합니다.</p><a href="rpc-readiness.html">RPC 열기</a></article>
          <article><h3>Workspace Graph Readiness</h3><p>${escapeHtml(input.workspaceGraphReadinessReport.summary)}</p><p>Nx 패턴으로 project graph, targets, affected, boundaries, plugins 준비도를 정리합니다.</p><a href="workspace-graph-readiness.html">Workspace Graph 열기</a></article>
          <article><h3>Scaffolding Readiness</h3><p>${escapeHtml(input.scaffoldingReadinessReport.summary)}</p><p>Plop 패턴으로 generators, prompts, actions, templates, helpers, safety 준비도를 정리합니다.</p><a href="scaffolding-readiness.html">Scaffolding 열기</a></article>
          <article><h3>Scheduler Readiness</h3><p>${escapeHtml(input.schedulerReadinessReport.summary)}</p><p>node-cron 패턴으로 schedules, tasks, lifecycle, reliability, packages 준비도를 정리합니다.</p><a href="scheduler-readiness.html">Scheduler 열기</a></article>
          <article><h3>Build Tool Readiness</h3><p>${escapeHtml(input.buildToolReadinessReport.summary)}</p><p>Vite 패턴으로 config, plugins, dev server, build, env, SSR, dependency optimization 준비도를 정리합니다.</p><a href="build-tool-readiness.html">Build Tool 열기</a></article>
          <article><h3>Styling Readiness</h3><p>${escapeHtml(input.stylingReadinessReport.summary)}</p><p>Tailwind CSS 패턴으로 config, directives, utility classes, theme, plugins, build integration 준비도를 정리합니다.</p><a href="styling-readiness.html">Styling 열기</a></article>
          <article><h3>Visual Regression Readiness</h3><p>${escapeHtml(input.visualRegressionReadinessReport.summary)}</p><p>reg-suit 패턴으로 screenshot baselines, diff thresholds, reports, plugins, storage, notification 준비도를 정리합니다.</p><a href="visual-regression-readiness.html">Visual Regression 열기</a></article>
          <article><h3>Infrastructure Readiness</h3><p>${escapeHtml(input.infrastructureReadinessReport.summary)}</p><p>OpenTofu 패턴으로 .tf config, providers, resources, modules, variables, backend/state, plan/apply workflow 준비도를 정리합니다.</p><a href="infrastructure-readiness.html">Infrastructure 열기</a></article>
          <article><h3>Deployment Readiness</h3><p>${escapeHtml(input.deploymentReadinessReport.summary)}</p><p>Helm 패턴으로 Chart.yaml, values.yaml, templates, release commands, safety flags 준비도를 정리합니다.</p><a href="deployment-readiness.html">Deployment 열기</a></article>
          <article><h3>Serverless Readiness</h3><p>${escapeHtml(input.serverlessReadinessReport.summary)}</p><p>Serverless Framework 패턴으로 service, provider, functions, events, resources, packaging, plugins, deploy commands 준비도를 정리합니다.</p><a href="serverless-readiness.html">Serverless 열기</a></article>
          <article><h3>Mobile Readiness</h3><p>${escapeHtml(input.mobileReadinessReport.summary)}</p><p>Expo 패턴으로 app config, platform identifiers, navigation, EAS build, OTA updates, assets, packages 준비도를 정리합니다.</p><a href="mobile-readiness.html">Mobile 열기</a></article>
          <article><h3>Desktop Readiness</h3><p>${escapeHtml(input.desktopReadinessReport.summary)}</p><p>Tauri/Electron/Wails 패턴으로 config, windows, IPC, permissions, bundle, updater, signing 준비도를 정리합니다.</p><a href="desktop-readiness.html">Desktop 열기</a></article>
          <article><h3>Edge Readiness</h3><p>${escapeHtml(input.edgeReadinessReport.summary)}</p><p>Cloudflare Workers 패턴으로 Wrangler config, module handlers, bindings, routes, dev/deploy/tail workflow 준비도를 정리합니다.</p><a href="edge-readiness.html">Edge 열기</a></article>
          <article><h3>Compose Readiness</h3><p>${escapeHtml(input.composeReadinessReport.summary)}</p><p>Docker Compose 패턴으로 compose files, services, dependencies, resources, safety, local workflow 준비도를 정리합니다.</p><a href="compose-readiness.html">Compose 열기</a></article>
          <article><h3>Dev Container Readiness</h3><p>${escapeHtml(input.devContainerReadinessReport.summary)}</p><p>Dev Containers 패턴으로 devcontainer.json, features, lifecycle hooks, mounts, ports, customizations, CLI workflow 준비도를 정리합니다.</p><a href="devcontainer-readiness.html">Dev Container 열기</a></article>
          <article><h3>Kubernetes Readiness</h3><p>${escapeHtml(input.kubernetesReadinessReport.summary)}</p><p>Kubernetes/Kustomize 패턴으로 manifests, workloads, services, RBAC, probes, kubectl workflow 준비도를 정리합니다.</p><a href="kubernetes-readiness.html">Kubernetes 열기</a></article>
          <article><h3>GitOps Readiness</h3><p>${escapeHtml(input.gitopsReadinessReport.summary)}</p><p>Argo CD/Flux 패턴으로 applications, sources, sync policy, reconciliation, image automation, notification workflow 준비도를 정리합니다.</p><a href="gitops-readiness.html">GitOps 열기</a></article>
          <article><h3>Backup Readiness</h3><p>${escapeHtml(input.backupReadinessReport.summary)}</p><p>Velero/Litestream/restic 패턴으로 backup, restore, storage, retention, verification workflow 준비도를 정리합니다.</p><a href="backup-readiness.html">Backup 열기</a></article>
          <article><h3>세션 검증</h3><p>생성 산출물, HTML 무결성, 소스 근거 링크 검증 결과를 확인합니다.</p><p><a href="session-verification.html">검증 리포트 열기</a></p></article>
          <article><h3>컴포넌트 그래프</h3><p>노드 ${graphSummary.totalNodes}개 · 관계 ${graphSummary.totalEdges}개</p><p>핵심 허브: ${graphSummary.topConnectedNodes.slice(0, 3).map((node) => escapeHtml(node.label)).join(", ") || "없음"}</p><a href="component-graph.html">그래프 열기</a></article>
          <article><h3>증분 분석</h3><p>${escapeHtml(input.incrementalReport.summary)}</p><p>${escapeHtml(coverageDelta.summary)}</p><a href="incremental.html">증분 리포트 열기</a></article>
          <article><h3>퀴즈 요약</h3><p>총 ${input.quiz.totalQuestions}문제</p><p>최근 점수: ${latestAttempt ? latestAttempt.score.toFixed(1) : "미응시"}</p></article>
          <article><h3>오답노트</h3><p>오답 ${input.wrongNotes.length}개</p><p>취약 개념: ${weakConcepts.map(escapeHtml).join(", ") || "아직 없음"}</p><a href="wrong-notes.html">오답노트 열기</a></article>
        </section>
        <section class="panel">
          <h2>폴더 트리</h2>
          <pre>${escapeHtml(input.repoMap.treeMarkdown)}</pre>
        </section>
      `, input)
    },
    {
      name: "learning-path.html",
      title: "학습 경로",
      html: pageShell("학습 경로", "learning-path.html", `<section class="panel" data-source-pattern="CodeTour"><h2>투어형 학습 순서</h2><span class="muted" data-learning-primary>기본 투어</span><p>생성된 리포트를 순서대로 따라가며 저장소의 목적, 구조, 근거, 그래프, 재구현, 복습 문제로 이동합니다.</p><p class="muted learning-progress-summary" data-learning-progress-summary>완료 0 / ${learningPath.length}</p><div class="toolbar learning-progress-toolbar" role="toolbar" aria-label="learning progress controls"><button type="button" data-reset-learning-progress>진도 초기화</button></div></section><section class="cards learning-path-cards">${learningPath.map((step, index) => `<article id="learning-step-${index + 1}" class="learning-path-step" data-learning-step="${index + 1}"><h3>${index + 1}. ${escapeHtml(step.title)}</h3><p>${escapeHtml(step.goal)}</p><p class="muted">${escapeHtml(step.evidence)}</p><a href="${escapeHtml(step.href)}">이 단계 열기</a><label><input type="checkbox" data-learning-step-complete="${index + 1}"> 학습 완료</label><p class="learning-step-nav">${index > 0 ? `<a href="#learning-step-${index}">이전 단계</a>` : ""}${index > 0 && index < learningPath.length - 1 ? " " : ""}${index < learningPath.length - 1 ? `<a href="#learning-step-${index + 2}">다음 단계</a>` : ""}</p></article>`).join("")}</section>`, input)
    },
    {
      name: "overview.html",
      title: "프로젝트 목적",
      html: pageShell("프로젝트 목적", "index.html", `
        <section class="panel"><h2>무엇을 하는 프로젝트인가?</h2><p>${escapeHtml(input.purposeReport.longExplanation)}</p><h3>초보자용 비유</h3><p>${escapeHtml(input.purposeReport.beginnerAnalogy)}</p><h3>근거</h3>${list(input.purposeReport.evidence)}</section>
      `, input)
    },
    {
      name: "language.html",
      title: "언어와 기술 스택",
      html: pageShell("언어와 기술 스택", "language.html", `
        <section class="panel"><h2>주요 언어</h2><p>${escapeHtml(input.languageReport.primaryLanguage)}</p></section>
        <section class="cards">${input.languageReport.languageRoles.map((role) => `<article id="${htmlAnchor(role.language)}"><h3>${escapeHtml(role.language)}</h3><p>${escapeHtml(role.role)}</p><p>${escapeHtml(role.beginnerExplanation)}</p><p>${escapeHtml(role.tradeoffs)}</p></article>`).join("")}</section>
        <section class="panel"><h2>의존성</h2>${input.dependencyReport.manifests.map((manifest) => `<h3>${escapeHtml(manifest.filePath)}</h3>${list(manifest.dependencies.map((dep) => `${dep.name}: ${dep.beginnerExplanation}`))}`).join("")}</section>
      `, input)
    },
    {
      name: "architecture.html",
      title: "아키텍처",
      html: pageShell("아키텍처", "architecture.html", `<section class="panel"><h2>${escapeHtml(input.architectureReport.architectureStyle)}</h2><p>${escapeHtml(input.architectureReport.explanation)}</p><h3>근거</h3>${list(input.architectureReport.evidence)}<h3>Mermaid</h3><pre>${escapeHtml(input.architectureReport.mermaid)}</pre></section>`, input)
    },
    {
      name: "folders.html",
      title: "폴더 수업",
      html: pageShell("폴더 수업", "folders.html", `<section class="cards">${input.folderLessons.map((lesson) => `<article id="${htmlAnchor(lesson.folderPath)}"><h3>${escapeHtml(lesson.folderPath)}</h3><p>${escapeHtml(lesson.beginnerExplanation)}</p><h4>왜 필요한가?</h4><p>${escapeHtml(lesson.whyItExists)}</p><h4>다시 만들 때</h4><p>${escapeHtml(lesson.rebuildAdvice)}</p></article>`).join("")}</section>`, input)
    },
    {
      name: "files.html",
      title: "핵심 파일 수업",
      html: pageShell("핵심 파일 수업", "files.html", `<section class="panel"><h2>파일 탐색 필터</h2><p>${escapeHtml(fileNavigation.summary)}</p><h3>확장자</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="file extension filters">${fileNavigation.extensionButtons}</div><h3>상위 폴더</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="file directory filters">${fileNavigation.directoryButtons}</div><h3>소스 근거</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="source evidence filters">${fileNavigation.evidenceButtons}</div></section><section class="cards file-lesson-cards">${input.fileLessons.map((lesson) => `<article id="${htmlAnchor(lesson.filePath)}" data-file-ext="${escapeHtml(fileExtension(lesson.filePath))}" data-file-dir="${escapeHtml(topDirectory(lesson.filePath))}" data-source-evidence="${sourceEvidenceState(lesson)}"><h3>${escapeHtml(lesson.filePath)}</h3><p class="muted">${escapeHtml(topDirectory(lesson.filePath))} · ${escapeHtml(fileExtension(lesson.filePath))} · ${escapeHtml(sourceEvidenceLabel(lesson))}</p><p>${escapeHtml(lesson.beginnerExplanation)}</p><p>${escapeHtml(lesson.whyItExists)}</p><h4>소스 근거</h4>${sourceEvidenceList(lesson.sourceEvidence ?? [], lesson.filePath)}<h4>관련 용어</h4>${list(lesson.glossaryTerms)}</article>`).join("")}</section>`, input)
    },
    {
      name: "evidence.html",
      title: "소스 근거 인덱스",
      html: pageShell("소스 근거 인덱스", "evidence.html", `<section class="panel"><h2>근거 전체 목록</h2><p>각 소스 근거를 파일 수업과 복사된 원본 소스에 연결합니다.</p><div class="toolbar evidence-kind-toolbar" role="toolbar" aria-label="source evidence kind filters">${evidenceFilters}</div></section><section class="cards evidence-index-cards">${evidenceIndexCards(input.fileLessons)}</section>`, input)
    },
    {
      name: "suggested-reads.html",
      title: "추천 읽기",
      html: pageShell("추천 읽기", "suggested-reads.html", `<section class="panel" data-source-pattern="Repo Baby"><h2>먼저 읽을 파일</h2><p>${escapeHtml(input.suggestedReadsReport.summary)}</p><p class="muted">${escapeHtml(input.suggestedReadsReport.sourcePattern)}</p></section><section class="cards suggested-read-cards">${input.suggestedReadsReport.items.map((item) => `<article class="suggested-read-card"><h3>${item.rank}. ${escapeHtml(item.filePath)}</h3><p>${escapeHtml(item.reason)}</p><p class="muted">소스 근거 ${item.evidenceCount}개 · 관련 파일 ${item.relatedFileCount}개</p><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">파일 수업 열기</a> <a href="../${escapeHtml(item.sourceHref)}">원본 열기</a></article>`).join("")}</section>`, input)
    },
    {
      name: "runtime-environment.html",
      title: "실행 환경",
      html: pageShell("실행 환경", "runtime-environment.html", `<section class="panel" data-source-pattern="docSmith"><h2>런타임 준비 신호</h2><p>${escapeHtml(input.runtimeEnvironmentReport.summary)}</p><p class="muted">${escapeHtml(input.runtimeEnvironmentReport.sourcePattern)}</p></section><section class="grid"><article class="runtime-env-card"><h3>매니페스트</h3>${list(input.runtimeEnvironmentReport.detectedManifests.map((item) => `${item.filePath}: ${item.ecosystem} · ${item.signal}`))}</article><article class="runtime-env-card"><h3>설치/실행</h3>${list(input.runtimeEnvironmentReport.setupSignals.map((item) => `${item.filePath}: ${item.signal}`))}</article><article class="runtime-env-card"><h3>컨테이너</h3>${list(input.runtimeEnvironmentReport.containerSignals.map((item) => `${item.filePath}: ${item.signal}`))}</article><article class="runtime-env-card"><h3>서비스 힌트</h3>${list(input.runtimeEnvironmentReport.serviceHints.map((item) => `${item.name}: ${item.reason}`))}</article></section><section class="grid"><article><h3>부족한 신호</h3>${list(input.runtimeEnvironmentReport.missingSignals)}</article><article><h3>다음 확인 단계</h3>${list(input.runtimeEnvironmentReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "interface-map.html",
      title: "인터페이스 맵",
      html: pageShell("인터페이스 맵", "interface-map.html", `<section class="panel" data-source-pattern="repomap"><h2>Route/Page/API 신호</h2><p>${escapeHtml(input.interfaceMapReport.summary)}</p><p class="muted">${escapeHtml(input.interfaceMapReport.sourcePattern)}</p></section><section class="grid"><article class="interface-map-card"><h3>Route/Page</h3>${interfaceSourceList(input.interfaceMapReport.routeSignals.map((item) => ({ text: `${item.filePath}: ${item.kind} · ${item.signal}`, sourceHref: item.sourceHref })))}</article><article class="interface-map-card"><h3>API</h3>${interfaceSourceList(input.interfaceMapReport.apiSignals.map((item) => ({ text: `${item.filePath}: ${item.method} ${item.pattern}`, sourceHref: item.sourceHref })))}</article><article class="interface-map-card"><h3>Components</h3>${interfaceSourceList(input.interfaceMapReport.componentSignals.map((item) => ({ text: `${item.componentName}: ${item.filePath}`, sourceHref: item.sourceHref })))}</article><article class="interface-map-card"><h3>Data Flow</h3>${list(input.interfaceMapReport.dataFlowHints)}</article></section><section class="panel"><h2>다음 확인 단계</h2>${list(input.interfaceMapReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "symbol-map.html",
      title: "심볼 맵",
      html: pageShell("심볼 맵", "symbol-map.html", `<section class="panel" data-source-pattern="codebase-map"><h2>함수/클래스/상수 인덱스</h2><p>${escapeHtml(input.symbolMapReport.summary)}</p><p class="muted">${escapeHtml(input.symbolMapReport.sourcePattern)}</p></section><section class="grid"><article class="symbol-map-card"><h3>종류별 개수</h3>${list(Object.entries(input.symbolMapReport.symbolsByKind).map(([kind, count]) => `${kind}: ${count}`))}</article><article class="symbol-map-card"><h3>심볼이 많은 파일</h3>${list(input.symbolMapReport.filesWithSymbols.map((item) => `${item.filePath}: ${item.count}개`))}</article><article class="symbol-map-card"><h3>다음 확인 단계</h3>${list(input.symbolMapReport.learnerNextSteps)}</article></section><section class="cards symbol-map-cards">${symbolCards(input.symbolMapReport.symbols)}</section>`, input)
    },
    {
      name: "api-reference.html",
      title: "API Reference",
      html: pageShell("API Reference", "api-reference.html", `<section class="panel" data-source-pattern="TypeDoc"><h2>Public API Reference</h2><p>${escapeHtml(input.apiReferenceReport.summary)}</p><p class="muted">${escapeHtml(input.apiReferenceReport.sourcePattern)}</p><dl class="meta"><div><dt>entry points</dt><dd>${input.apiReferenceReport.entryPoints.length}</dd></div><div><dt>public symbols</dt><dd>${input.apiReferenceReport.publicSymbols.length}</dd></div><div><dt>ReflectionKind</dt><dd>${Object.keys(input.apiReferenceReport.kindCounts).length}</dd></div><div><dt>export warnings</dt><dd>${input.apiReferenceReport.exportWarnings.length}</dd></div></dl></section><section class="grid"><article class="api-reference-card"><h3>Entry Points</h3>${apiEntryPointList(input.apiReferenceReport.entryPoints)}</article><article class="api-reference-card"><h3>Kind Counts</h3>${list(Object.entries(input.apiReferenceReport.kindCounts).map(([kind, count]) => `${kind}: ${count}`))}</article><article class="api-reference-card"><h3>Category Counts</h3>${list(Object.entries(input.apiReferenceReport.categoryCounts).map(([category, count]) => `${category}: ${count}`))}</article><article class="api-reference-card"><h3>Export Warnings</h3>${apiWarningList(input.apiReferenceReport.exportWarnings)}</article></section><section class="cards api-reference-cards">${apiReferenceCards(input.apiReferenceReport.publicSymbols)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.apiReferenceReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "search-index.html",
      title: "Search Index",
      html: pageShell("Search Index", "search-index.html", `<section class="panel" data-source-pattern="Pagefind"><h2>Static Search Index</h2><p>${escapeHtml(input.searchIndexReport.summary)}</p><p class="muted">${escapeHtml(input.searchIndexReport.sourcePattern)}</p><dl class="meta"><div><dt>PageFragmentData</dt><dd>${input.searchIndexReport.totalDocuments}</dd></div><div><dt>MetaIndex terms</dt><dd>${input.searchIndexReport.totalTerms}</dd></div><div><dt>filters</dt><dd>${input.searchIndexReport.filterIndex.length}</dd></div><div><dt>metaFields</dt><dd>${input.searchIndexReport.metadataFields.length}</dd></div></dl><p><a href="assets/search-index.json">assets/search-index.json 열기</a></p></section><section class="grid"><article class="search-index-card"><h3>Filters</h3>${searchFilterList(input.searchIndexReport.filterIndex)}</article><article class="search-index-card"><h3>Metadata Fields</h3>${list(input.searchIndexReport.metadataFields)}</article><article class="search-index-card"><h3>Top Terms</h3>${searchTermList(input.searchIndexReport.termIndex.slice(0, 25))}</article><article class="search-index-card"><h3>다음 확인 단계</h3>${list(input.searchIndexReport.learnerNextSteps)}</article></section><section class="cards search-index-cards">${searchDocumentCards(input.searchIndexReport.documents)}</section>`, input)
    },
    {
      name: "learning-journal.html",
      title: "Learning Journal",
      html: pageShell("Learning Journal", "learning-journal.html", `<section class="panel" data-source-pattern="learn-codebase"><h2>Active Recall Journal</h2><p>${escapeHtml(input.learningJournalReport.summary)}</p><p class="muted">${escapeHtml(input.learningJournalReport.sourcePattern)}</p><dl class="meta"><div><dt>openQuestions</dt><dd>${input.learningJournalReport.openQuestions.length}</dd></div><div><dt>spacedReview</dt><dd>${input.learningJournalReport.spacedReviewQueue.length}</dd></div><div><dt>masteryLevels</dt><dd>${input.learningJournalReport.masteryLevels.length}</dd></div><div><dt>socraticPrompts</dt><dd>${input.learningJournalReport.socraticPrompts.length}</dd></div></dl><p><a href="assets/learning-journal-template.md">learning-journal-template.md 열기</a></p></section><section class="grid"><article class="learning-journal-card"><h3>Focus & Goals</h3>${learningFocusList(input.learningJournalReport.focusGoals)}</article><article class="learning-journal-card"><h3>Spaced Review Queue</h3>${learningReviewList(input.learningJournalReport.spacedReviewQueue)}</article><article class="learning-journal-card"><h3>Aha Moments</h3>${learningAhaList(input.learningJournalReport.ahaMoments)}</article><article class="learning-journal-card"><h3>다음 확인 단계</h3>${list(input.learningJournalReport.learnerNextSteps)}</article></section><section class="cards learning-journal-cards">${learningMasteryCards(input.learningJournalReport.masteryLevels)}${learningQuestionCards(input.learningJournalReport.openQuestions)}${learningPromptCards(input.learningJournalReport.socraticPrompts)}</section>`, input)
    },
    {
      name: "project-activity.html",
      title: "Project Activity",
      html: pageShell("Project Activity", "project-activity.html", `<section class="panel" data-source-pattern="Repowise"><h2>Project Activity Snapshot</h2><p>${escapeHtml(input.projectActivityReport.summary)}</p><p class="muted">${escapeHtml(input.projectActivityReport.sourcePattern)}</p><dl class="meta"><div><dt>history mode</dt><dd>${escapeHtml(input.projectActivityReport.historyAvailability.mode)}</dd></div><div><dt>branch</dt><dd>${escapeHtml(input.projectActivityReport.historyAvailability.branch ?? "unknown")}</dd></div><div><dt>commit</dt><dd>${escapeHtml(input.projectActivityReport.historyAvailability.commitHash?.slice(0, 12) ?? "unknown")}</dd></div><div><dt>hotspots</dt><dd>${input.projectActivityReport.hotspotCandidates.length}</dd></div></dl><p>${escapeHtml(input.projectActivityReport.historyAvailability.reason)}</p></section><section class="grid"><article class="project-activity-card"><h3>Activity Signals</h3>${projectActivitySignalList(input.projectActivityReport.activitySignals)}</article><article class="project-activity-card"><h3>Review Queues</h3>${projectActivityQueueList(input.projectActivityReport.reviewQueues)}</article><article class="project-activity-card"><h3>Decision Prompts</h3>${projectActivityDecisionPromptList(input.projectActivityReport.architectureDecisionPrompts)}</article><article class="project-activity-card"><h3>다음 확인 단계</h3>${list(input.projectActivityReport.learnerNextSteps)}</article></section><section class="cards project-activity-hotspots">${projectActivityHotspotCards(input.projectActivityReport.hotspotCandidates)}</section><section class="cards project-activity-dead-code">${projectActivityDeadCodeCards(input.projectActivityReport.deadCodeCandidates)}</section>`, input)
    },
    {
      name: "code-metrics-readiness.html",
      title: "Code Metrics Readiness",
      html: pageShell("Code Metrics Readiness", "code-metrics-readiness.html", `<section class="panel" data-source-pattern="scc"><h2>Code Metrics Snapshot</h2><p>${escapeHtml(input.codeMetricsReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.codeMetricsReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>files</dt><dd>${input.codeMetricsReadinessReport.totals.files}</dd></div><div><dt>code lines</dt><dd>${input.codeMetricsReadinessReport.totals.codeLines}</dd></div><div><dt>branch tokens</dt><dd>${input.codeMetricsReadinessReport.totals.branchCount}</dd></div><div><dt>density</dt><dd>${input.codeMetricsReadinessReport.totals.complexityDensity}</dd></div></dl><p class="muted">RepoTutor records code metrics readiness only; it does not run scc, lizard, tokei, cloc, radon, git history hotspot reports, or CI threshold gates.</p></section><section class="grid"><article class="code-metrics-readiness-card"><h3>Language Metrics</h3>${codeMetricsLanguageList(input.codeMetricsReadinessReport.languageMetrics)}</article><article class="code-metrics-readiness-card"><h3>Tool Signals</h3>${codeMetricsSignalList(input.codeMetricsReadinessReport.toolSignals, "signal")}</article><article class="code-metrics-readiness-card"><h3>Metric Signals</h3>${codeMetricsSignalList(input.codeMetricsReadinessReport.metricSignals, "signal")}</article><article class="code-metrics-readiness-card"><h3>Workflow Signals</h3>${codeMetricsSignalList(input.codeMetricsReadinessReport.workflowSignals, "signal")}</article></section><section class="cards code-metrics-hotspots">${codeMetricsHotspotCards(input.codeMetricsReadinessReport.hotspots)}</section><section class="grid"><article class="code-metrics-readiness-card"><h3>Recommended Commands</h3>${codeMetricsCommandList(input.codeMetricsReadinessReport.recommendedCommands)}</article><article class="code-metrics-readiness-card"><h3>Risk Queue</h3>${codeMetricsRiskList(input.codeMetricsReadinessReport.riskQueue)}</article><article class="code-metrics-readiness-card"><h3>다음 확인 단계</h3>${list(input.codeMetricsReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "code-ownership-readiness.html",
      title: "Code Ownership Readiness",
      html: pageShell("Code Ownership Readiness", "code-ownership-readiness.html", `<section class="panel" data-source-pattern="CODEOWNERS"><h2>Code Ownership Readiness</h2><p>${escapeHtml(input.codeOwnershipReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.codeOwnershipReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>CODEOWNERS files</dt><dd>${input.codeOwnershipReadinessReport.codeownerFiles.length}</dd></div><div><dt>ownership signals</dt><dd>${input.codeOwnershipReadinessReport.ownershipSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>validation signals</dt><dd>${input.codeOwnershipReadinessReport.validationSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>review signals</dt><dd>${input.codeOwnershipReadinessReport.reviewSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records CODEOWNERS readiness only; it does not contact GitHub, verify team visibility, inspect private branch protection remotely, or run third-party validators.</p></section><section class="grid"><article class="code-ownership-readiness-card"><h3>CODEOWNERS Files</h3>${codeOwnershipFileList(input.codeOwnershipReadinessReport.codeownerFiles)}</article><article class="code-ownership-readiness-card"><h3>Ownership Signals</h3>${codeOwnershipSignalList(input.codeOwnershipReadinessReport.ownershipSignals, "signal")}</article><article class="code-ownership-readiness-card"><h3>Validation Signals</h3>${codeOwnershipSignalList(input.codeOwnershipReadinessReport.validationSignals, "signal")}</article><article class="code-ownership-readiness-card"><h3>Review Signals</h3>${codeOwnershipSignalList(input.codeOwnershipReadinessReport.reviewSignals, "signal")}</article></section><section class="grid"><article class="code-ownership-readiness-card"><h3>Coverage Signals</h3>${codeOwnershipSignalList(input.codeOwnershipReadinessReport.coverageSignals, "signal")}</article><article class="code-ownership-readiness-card"><h3>Package Signals</h3>${codeOwnershipSignalList(input.codeOwnershipReadinessReport.packageSignals, "signal")}</article><article class="code-ownership-readiness-card"><h3>Recommended Commands</h3>${codeOwnershipCommandList(input.codeOwnershipReadinessReport.recommendedCommands)}</article><article class="code-ownership-readiness-card"><h3>Risk Queue</h3>${codeOwnershipRiskList(input.codeOwnershipReadinessReport.riskQueue)}</article><article class="code-ownership-readiness-card"><h3>다음 확인 단계</h3>${list(input.codeOwnershipReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "large-asset-readiness.html",
      title: "Large Asset Readiness",
      html: pageShell("Large Asset Readiness", "large-asset-readiness.html", `<section class="panel" data-source-pattern="Git LFS DVC"><h2>Large Asset Snapshot</h2><p>${escapeHtml(input.largeAssetReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.largeAssetReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.largeAssetReadinessReport.assetSetups.length}</dd></div><div><dt>Git LFS</dt><dd>${input.largeAssetReadinessReport.lfsSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>DVC</dt><dd>${input.largeAssetReadinessReport.dvcSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>workflow</dt><dd>${input.largeAssetReadinessReport.workflowSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records large-asset readiness only; it does not run Git LFS, DVC, submodule update, package managers, network remotes, object storage calls, or asset downloads.</p></section><section class="grid"><article class="large-asset-readiness-card"><h3>Asset Setups</h3>${largeAssetSetupList(input.largeAssetReadinessReport.assetSetups)}</article><article class="large-asset-readiness-card"><h3>Git LFS Signals</h3>${largeAssetSignalList(input.largeAssetReadinessReport.lfsSignals, "signal")}</article><article class="large-asset-readiness-card"><h3>DVC Signals</h3>${largeAssetSignalList(input.largeAssetReadinessReport.dvcSignals, "signal")}</article><article class="large-asset-readiness-card"><h3>Submodule Signals</h3>${largeAssetSignalList(input.largeAssetReadinessReport.submoduleSignals, "signal")}</article></section><section class="grid"><article class="large-asset-readiness-card"><h3>Workflow Signals</h3>${largeAssetSignalList(input.largeAssetReadinessReport.workflowSignals, "signal")}</article><article class="large-asset-readiness-card"><h3>Package Signals</h3>${largeAssetSignalList(input.largeAssetReadinessReport.packageSignals, "signal")}</article><article class="large-asset-readiness-card"><h3>Recommended Commands</h3>${largeAssetCommandList(input.largeAssetReadinessReport.recommendedCommands)}</article><article class="large-asset-readiness-card"><h3>Risk Queue</h3>${largeAssetRiskList(input.largeAssetReadinessReport.riskQueue)}</article><article class="large-asset-readiness-card"><h3>다음 확인 단계</h3>${list(input.largeAssetReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "license-rights.html",
      title: "License Rights",
      html: pageShell("License Rights", "license-rights.html", `<section class="panel" data-source-pattern="Licensee"><h2>License Rights Snapshot</h2><p>${escapeHtml(input.licenseRightsReport.summary)}</p><p class="muted">${escapeHtml(input.licenseRightsReport.sourcePattern)}</p><dl class="meta"><div><dt>detected</dt><dd>${escapeHtml(input.licenseRightsReport.detectedProjectLicense.spdxId ?? "unknown")}</dd></div><div><dt>confidence</dt><dd>${input.licenseRightsReport.detectedProjectLicense.confidence}</dd></div><div><dt>license files</dt><dd>${input.licenseRightsReport.licenseFiles.length}</dd></div><div><dt>warnings</dt><dd>${input.licenseRightsReport.reviewWarnings.length}</dd></div></dl><p>${escapeHtml(input.licenseRightsReport.detectedProjectLicense.evidence)}</p></section><section class="grid"><article class="license-rights-card"><h3>Rights Checklist</h3>${licenseChecklistList(input.licenseRightsReport.rightsChecklist)}</article><article class="license-rights-card"><h3>Review Warnings</h3>${licenseWarningList(input.licenseRightsReport.reviewWarnings)}</article><article class="license-rights-card"><h3>Package Metadata</h3>${packageLicenseList(input.licenseRightsReport.packageLicenseSignals)}</article><article class="license-rights-card"><h3>README References</h3>${readmeLicenseList(input.licenseRightsReport.readmeLicenseReferences)}</article></section><section class="cards license-file-cards">${licenseFileCards(input.licenseRightsReport.licenseFiles)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.licenseRightsReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "sbom.html",
      title: "SBOM",
      html: pageShell("SBOM", "sbom.html", `<section class="panel" data-source-pattern="Syft"><h2>SBOM Snapshot</h2><p>${escapeHtml(input.sbomReport.summary)}</p><p class="muted">${escapeHtml(input.sbomReport.sourcePattern)}</p><dl class="meta"><div><dt>manifests</dt><dd>${input.sbomReport.packageManifests.length}</dd></div><div><dt>packages</dt><dd>${input.sbomReport.packageArtifacts.length}</dd></div><div><dt>files</dt><dd>${input.sbomReport.fileArtifacts.length}</dd></div><div><dt>relationships</dt><dd>${input.sbomReport.relationships.length}</dd></div></dl><p>Descriptor: ${escapeHtml(input.sbomReport.sourceDescriptor.descriptorName)} v${escapeHtml(input.sbomReport.sourceDescriptor.descriptorVersion)} · commit ${escapeHtml(input.sbomReport.sourceDescriptor.commitHash?.slice(0, 12) ?? "unknown")}</p></section><section class="grid"><article class="sbom-card"><h3>Package Manifests</h3>${sbomManifestList(input.sbomReport.packageManifests)}</article><article class="sbom-card"><h3>Output Formats</h3>${sbomOutputFormatList(input.sbomReport.outputFormats)}</article><article class="sbom-card"><h3>Review Warnings</h3>${sbomWarningList(input.sbomReport.reviewWarnings)}</article><article class="sbom-card"><h3>다음 확인 단계</h3>${list(input.sbomReport.learnerNextSteps)}</article></section><section class="cards sbom-package-cards">${sbomPackageCards(input.sbomReport.packageArtifacts)}</section><section class="cards sbom-file-cards">${sbomFileCards(input.sbomReport.fileArtifacts)}</section><section class="panel"><h2>Relationships</h2>${sbomRelationshipList(input.sbomReport.relationships)}</section>`, input)
    },
    {
      name: "security-readiness.html",
      title: "Security Readiness",
      html: pageShell("Security Readiness", "security-readiness.html", `<section class="panel" data-source-pattern="Trivy"><h2>Security Readiness Snapshot</h2><p>${escapeHtml(input.securityReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.securityReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>targets</dt><dd>${input.securityReadinessReport.scannerTargets.length}</dd></div><div><dt>scanners</dt><dd>${input.securityReadinessReport.scannerCoverage.length}</dd></div><div><dt>signals</dt><dd>${input.securityReadinessReport.securitySignals.length}</dd></div><div><dt>actions</dt><dd>${input.securityReadinessReport.actionQueue.length}</dd></div></dl></section><section class="grid"><article class="security-readiness-card"><h3>Scanner Targets</h3>${securityTargetList(input.securityReadinessReport.scannerTargets)}</article><article class="security-readiness-card"><h3>Scanner Coverage</h3>${securityCoverageList(input.securityReadinessReport.scannerCoverage)}</article><article class="security-readiness-card"><h3>Action Queue</h3>${securityActionList(input.securityReadinessReport.actionQueue)}</article><article class="security-readiness-card"><h3>Recommended Commands</h3>${securityCommandList(input.securityReadinessReport.recommendedCommands)}</article></section><section class="cards security-signal-cards">${securitySignalCards(input.securityReadinessReport.securitySignals)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.securityReadinessReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "scorecard.html",
      title: "Project Scorecard",
      html: pageShell("Project Scorecard", "scorecard.html", `<section class="panel" data-source-pattern="OpenSSF Scorecard"><h2>Scorecard Snapshot</h2><p>${escapeHtml(input.scorecardReport.summary)}</p><p class="muted">${escapeHtml(input.scorecardReport.sourcePattern)}</p><dl class="meta"><div><dt>aggregate</dt><dd>${input.scorecardReport.aggregateScore}/10</dd></div><div><dt>checks</dt><dd>${input.scorecardReport.checks.length}</dd></div><div><dt>policies</dt><dd>${input.scorecardReport.policyFindings.length}</dd></div><div><dt>risk queue</dt><dd>${input.scorecardReport.riskQueue.length}</dd></div></dl></section><section class="grid"><article class="scorecard-card"><h3>Category Scores</h3>${scorecardCategoryList(input.scorecardReport.categoryScores)}</article><article class="scorecard-card"><h3>Policy Findings</h3>${scorecardPolicyList(input.scorecardReport.policyFindings)}</article><article class="scorecard-card"><h3>Risk Queue</h3>${scorecardRiskList(input.scorecardReport.riskQueue)}</article><article class="scorecard-card"><h3>Structured Results</h3>${scorecardStructuredList(input.scorecardReport.structuredResults)}</article></section><section class="cards scorecard-check-cards">${scorecardCheckCards(input.scorecardReport.checks)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.scorecardReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "provenance.html",
      title: "Provenance Readiness",
      html: pageShell("Provenance Readiness", "provenance.html", `<section class="panel" data-source-pattern="Cosign"><h2>Provenance Snapshot</h2><p>${escapeHtml(input.provenanceReport.summary)}</p><p class="muted">${escapeHtml(input.provenanceReport.sourcePattern)}</p><dl class="meta"><div><dt>artifacts</dt><dd>${input.provenanceReport.artifactSignals.length}</dd></div><div><dt>signatures</dt><dd>${input.provenanceReport.signatureSignals.length}</dd></div><div><dt>attestations</dt><dd>${input.provenanceReport.attestationSignals.length}</dd></div><div><dt>identity</dt><dd>${input.provenanceReport.identityRequirements.length}</dd></div></dl></section><section class="grid"><article class="provenance-card"><h3>Artifact Signals</h3>${provenanceArtifactList(input.provenanceReport.artifactSignals)}</article><article class="provenance-card"><h3>Signature Material</h3>${provenanceSignatureList(input.provenanceReport.signatureSignals)}</article><article class="provenance-card"><h3>Identity Requirements</h3>${provenanceIdentityList(input.provenanceReport.identityRequirements)}</article><article class="provenance-card"><h3>Risk Queue</h3>${provenanceRiskList(input.provenanceReport.riskQueue)}</article></section><section class="cards provenance-attestation-cards">${provenanceAttestationCards(input.provenanceReport.attestationSignals)}</section><section class="panel"><h2>Verification Commands</h2>${provenanceCommandList(input.provenanceReport.verificationCommands)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.provenanceReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "advisories.html",
      title: "Advisory Query Readiness",
      html: pageShell("Advisory Query Readiness", "advisories.html", `<section class="panel" data-source-pattern="OSV-Scanner"><h2>Advisory Query Snapshot</h2><p>${escapeHtml(input.advisoryReport.summary)}</p><p class="muted">${escapeHtml(input.advisoryReport.sourcePattern)}</p><dl class="meta"><div><dt>targets</dt><dd>${input.advisoryReport.packageQueryTargets.length}</dd></div><div><dt>lockfiles</dt><dd>${input.advisoryReport.lockfileSignals.length}</dd></div><div><dt>sources</dt><dd>${input.advisoryReport.advisorySources.length}</dd></div><div><dt>policies</dt><dd>${input.advisoryReport.policyControls.length}</dd></div></dl></section><section class="grid"><article class="advisory-card"><h3>Advisory Sources</h3>${advisorySourceList(input.advisoryReport.advisorySources)}</article><article class="advisory-card"><h3>Policy Controls</h3>${advisoryPolicyList(input.advisoryReport.policyControls)}</article><article class="advisory-card"><h3>Result Model</h3>${advisoryResultList(input.advisoryReport.resultModel)}</article><article class="advisory-card"><h3>Remediation Queue</h3>${advisoryRiskList(input.advisoryReport.remediationQueue)}</article></section><section class="cards advisory-target-cards">${advisoryTargetCards(input.advisoryReport.packageQueryTargets)}</section><section class="grid"><article class="advisory-card"><h3>Lockfile Signals</h3>${advisoryLockfileList(input.advisoryReport.lockfileSignals)}</article><article class="advisory-card"><h3>Recommended Commands</h3>${advisoryCommandList(input.advisoryReport.recommendedCommands)}</article><article class="advisory-card"><h3>다음 확인 단계</h3>${list(input.advisoryReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "vex.html",
      title: "OpenVEX Impact Readiness",
      html: pageShell("OpenVEX Impact Readiness", "vex.html", `<section class="panel" data-source-pattern="OpenVEX"><h2>OpenVEX Snapshot</h2><p>${escapeHtml(input.vexReport.summary)}</p><p class="muted">${escapeHtml(input.vexReport.sourcePattern)}</p><dl class="meta"><div><dt>products</dt><dd>${input.vexReport.productTargets.length}</dd></div><div><dt>inputs</dt><dd>${input.vexReport.vulnerabilityInputs.length}</dd></div><div><dt>statuses</dt><dd>${input.vexReport.statusMatrix.length}</dd></div><div><dt>workflow</dt><dd>${input.vexReport.documentWorkflow.length}</dd></div></dl><p class="muted">RepoTutor records readiness metadata only. It does not claim any actual vulnerability status.</p></section><section class="grid"><article class="vex-card"><h3>Vulnerability Inputs</h3>${vexInputList(input.vexReport.vulnerabilityInputs)}</article><article class="vex-card"><h3>Status Matrix</h3>${vexStatusList(input.vexReport.statusMatrix)}</article><article class="vex-card"><h3>Justification Catalog</h3>${vexJustificationList(input.vexReport.justificationCatalog)}</article><article class="vex-card"><h3>Risk Queue</h3>${vexRiskList(input.vexReport.riskQueue)}</article></section><section class="cards vex-product-cards">${vexProductCards(input.vexReport.productTargets)}</section><section class="grid"><article class="vex-card"><h3>Statement Drafts</h3>${vexStatementList(input.vexReport.statementDrafts)}</article><article class="vex-card"><h3>Document Workflow</h3>${vexWorkflowList(input.vexReport.documentWorkflow)}</article><article class="vex-card"><h3>Attestation Readiness</h3>${vexAttestationList(input.vexReport.attestationReadiness)}</article><article class="vex-card"><h3>다음 확인 단계</h3>${list(input.vexReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "policy-gates.html",
      title: "Policy Gate Readiness",
      html: pageShell("Policy Gate Readiness", "policy-gates.html", `<section class="panel" data-source-pattern="OPA"><h2>Policy Gate Snapshot</h2><p>${escapeHtml(input.policyGateReport.summary)}</p><p class="muted">${escapeHtml(input.policyGateReport.sourcePattern)}</p><dl class="meta"><div><dt>policies</dt><dd>${input.policyGateReport.policyDocuments.length}</dd></div><div><dt>inputs</dt><dd>${input.policyGateReport.inputDocuments.length}</dd></div><div><dt>queries</dt><dd>${input.policyGateReport.gateQueries.length}</dd></div><div><dt>bundle reqs</dt><dd>${input.policyGateReport.bundleReadiness.length}</dd></div></dl><p class="muted">RepoTutor records OPA readiness only. It does not evaluate allow, deny, or violation decisions.</p></section><section class="grid"><article class="policy-gate-card"><h3>Gate Queries</h3>${policyGateQueryList(input.policyGateReport.gateQueries)}</article><article class="policy-gate-card"><h3>Test Coverage</h3>${policyCoverageList(input.policyGateReport.testCoverage)}</article><article class="policy-gate-card"><h3>Bundle Readiness</h3>${policyBundleList(input.policyGateReport.bundleReadiness)}</article><article class="policy-gate-card"><h3>Decision Outputs</h3>${policyDecisionList(input.policyGateReport.decisionOutputs)}</article></section><section class="cards policy-document-cards">${policyDocumentCards(input.policyGateReport.policyDocuments)}</section><section class="grid"><article class="policy-gate-card"><h3>Input Documents</h3>${policyInputList(input.policyGateReport.inputDocuments)}</article><article class="policy-gate-card"><h3>Recommended Commands</h3>${policyCommandList(input.policyGateReport.recommendedCommands)}</article><article class="policy-gate-card"><h3>Risk Queue</h3>${policyRiskList(input.policyGateReport.riskQueue)}</article><article class="policy-gate-card"><h3>다음 확인 단계</h3>${list(input.policyGateReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "api-contracts.html",
      title: "API Contract Readiness",
      html: pageShell("API Contract Readiness", "api-contracts.html", `<section class="panel" data-source-pattern="Schemathesis"><h2>API Contract Snapshot</h2><p>${escapeHtml(input.apiContractReport.summary)}</p><p class="muted">${escapeHtml(input.apiContractReport.sourcePattern)}</p><dl class="meta"><div><dt>schemas</dt><dd>${input.apiContractReport.schemaDocuments.length}</dd></div><div><dt>operations</dt><dd>${input.apiContractReport.operationTargets.length}</dd></div><div><dt>phases</dt><dd>${input.apiContractReport.testPhases.length}</dd></div><div><dt>checks</dt><dd>${input.apiContractReport.checkMatrix.length}</dd></div></dl><p class="muted">RepoTutor records API contract readiness only. It does not send generated requests or claim test pass/fail results.</p></section><section class="grid"><article class="api-contract-card"><h3>Test Phases</h3>${apiContractPhaseList(input.apiContractReport.testPhases)}</article><article class="api-contract-card"><h3>Check Matrix</h3>${apiContractCheckList(input.apiContractReport.checkMatrix)}</article><article class="api-contract-card"><h3>Runtime Targets</h3>${apiContractRuntimeList(input.apiContractReport.runtimeTargets)}</article><article class="api-contract-card"><h3>Reporting Outputs</h3>${apiContractReportingList(input.apiContractReport.reportingOutputs)}</article></section><section class="cards api-contract-schema-cards">${apiContractSchemaCards(input.apiContractReport.schemaDocuments)}</section><section class="grid"><article class="api-contract-card"><h3>Operation Targets</h3>${apiContractOperationList(input.apiContractReport.operationTargets)}</article><article class="api-contract-card"><h3>Recommended Commands</h3>${apiContractCommandList(input.apiContractReport.recommendedCommands)}</article><article class="api-contract-card"><h3>Risk Queue</h3>${apiContractRiskList(input.apiContractReport.riskQueue)}</article><article class="api-contract-card"><h3>다음 확인 단계</h3>${list(input.apiContractReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "consumer-contract-readiness.html",
      title: "Consumer Contract Readiness",
      html: pageShell("Consumer Contract Readiness", "consumer-contract-readiness.html", `<section class="panel" data-source-pattern="Pact"><h2>Consumer Contract Snapshot</h2><p>${escapeHtml(input.consumerContractReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.consumerContractReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.consumerContractReadinessReport.contractSetups.length}</dd></div><div><dt>interactions</dt><dd>${input.consumerContractReadinessReport.interactionSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>providers</dt><dd>${input.consumerContractReadinessReport.providerSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>brokers</dt><dd>${input.consumerContractReadinessReport.brokerSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records Pact consumer contract readiness only. It does not start mock servers, write pact files, verify providers, publish verification results, contact Pact Broker/PactFlow, or run can-i-deploy.</p></section><section class="grid"><article class="consumer-contract-readiness-card"><h3>Contract Setups</h3>${consumerContractReadinessSetupList(input.consumerContractReadinessReport.contractSetups)}</article><article class="consumer-contract-readiness-card"><h3>Interaction Signals</h3>${consumerContractReadinessSignalList(input.consumerContractReadinessReport.interactionSignals, "signal")}</article><article class="consumer-contract-readiness-card"><h3>Provider Signals</h3>${consumerContractReadinessSignalList(input.consumerContractReadinessReport.providerSignals, "signal")}</article><article class="consumer-contract-readiness-card"><h3>Broker Signals</h3>${consumerContractReadinessSignalList(input.consumerContractReadinessReport.brokerSignals, "signal")}</article></section><section class="grid"><article class="consumer-contract-readiness-card"><h3>Matcher Signals</h3>${consumerContractReadinessSignalList(input.consumerContractReadinessReport.matcherSignals, "signal")}</article><article class="consumer-contract-readiness-card"><h3>CI Signals</h3>${consumerContractReadinessSignalList(input.consumerContractReadinessReport.ciSignals, "signal")}</article><article class="consumer-contract-readiness-card"><h3>Package Signals</h3>${consumerContractReadinessSignalList(input.consumerContractReadinessReport.packageSignals, "signal")}</article><article class="consumer-contract-readiness-card"><h3>Recommended Commands</h3>${consumerContractReadinessCommandList(input.consumerContractReadinessReport.recommendedCommands)}</article><article class="consumer-contract-readiness-card"><h3>Risk Queue</h3>${consumerContractReadinessRiskList(input.consumerContractReadinessReport.riskQueue)}</article><article class="consumer-contract-readiness-card"><h3>다음 확인 단계</h3>${list(input.consumerContractReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "observability.html",
      title: "Observability Readiness",
      html: pageShell("Observability Readiness", "observability.html", `<section class="panel" data-source-pattern="OpenTelemetry"><h2>Observability Snapshot</h2><p>${escapeHtml(input.observabilityReport.summary)}</p><p class="muted">${escapeHtml(input.observabilityReport.sourcePattern)}</p><dl class="meta"><div><dt>pipelines</dt><dd>${input.observabilityReport.signalPipelines.length}</dd></div><div><dt>instrumentation</dt><dd>${input.observabilityReport.instrumentationSignals.length}</dd></div><div><dt>exporters</dt><dd>${input.observabilityReport.exporterTargets.length}</dd></div><div><dt>diagnostics</dt><dd>${input.observabilityReport.diagnostics.length}</dd></div></dl><p class="muted">RepoTutor records OpenTelemetry readiness only. It does not collect spans, metrics, or logs from the target app.</p></section><section class="grid"><article class="observability-card"><h3>Signal Pipelines</h3>${observabilityPipelineList(input.observabilityReport.signalPipelines)}</article><article class="observability-card"><h3>Exporter Targets</h3>${observabilityExporterList(input.observabilityReport.exporterTargets)}</article><article class="observability-card"><h3>Resource Attributes</h3>${observabilityResourceList(input.observabilityReport.resourceAttributes)}</article><article class="observability-card"><h3>Propagation Context</h3>${observabilityPropagationList(input.observabilityReport.propagationContext)}</article></section><section class="grid"><article class="observability-card"><h3>Instrumentation Signals</h3>${observabilityInstrumentationList(input.observabilityReport.instrumentationSignals)}</article><article class="observability-card"><h3>Diagnostics</h3>${observabilityDiagnosticList(input.observabilityReport.diagnostics)}</article><article class="observability-card"><h3>Recommended Commands</h3>${observabilityCommandList(input.observabilityReport.recommendedCommands)}</article><article class="observability-card"><h3>Risk Queue</h3>${observabilityRiskList(input.observabilityReport.riskQueue)}</article><article class="observability-card"><h3>다음 확인 단계</h3>${list(input.observabilityReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "performance.html",
      title: "Performance Readiness",
      html: pageShell("Performance Readiness", "performance.html", `<section class="panel" data-source-pattern="k6"><h2>Performance Snapshot</h2><p>${escapeHtml(input.performanceReport.summary)}</p><p class="muted">${escapeHtml(input.performanceReport.sourcePattern)}</p><dl class="meta"><div><dt>scripts</dt><dd>${input.performanceReport.scriptTargets.length}</dd></div><div><dt>workloads</dt><dd>${input.performanceReport.workloadModels.length}</dd></div><div><dt>thresholds</dt><dd>${input.performanceReport.thresholds.length}</dd></div><div><dt>outputs</dt><dd>${input.performanceReport.outputs.length}</dd></div></dl><p class="muted">RepoTutor records k6 readiness only. It does not generate traffic or claim performance pass/fail results.</p></section><section class="grid"><article class="performance-card"><h3>Script Targets</h3>${performanceScriptList(input.performanceReport.scriptTargets)}</article><article class="performance-card"><h3>Workload Models</h3>${performanceWorkloadList(input.performanceReport.workloadModels)}</article><article class="performance-card"><h3>Thresholds</h3>${performanceThresholdList(input.performanceReport.thresholds)}</article><article class="performance-card"><h3>Checks</h3>${performanceCheckList(input.performanceReport.checks)}</article></section><section class="grid"><article class="performance-card"><h3>Metrics</h3>${performanceMetricList(input.performanceReport.metrics)}</article><article class="performance-card"><h3>Outputs</h3>${performanceOutputList(input.performanceReport.outputs)}</article><article class="performance-card"><h3>Runtime Controls</h3>${performanceRuntimeList(input.performanceReport.runtimeControls)}</article><article class="performance-card"><h3>Recommended Commands</h3>${performanceCommandList(input.performanceReport.recommendedCommands)}</article><article class="performance-card"><h3>Risk Queue</h3>${performanceRiskList(input.performanceReport.riskQueue)}</article><article class="performance-card"><h3>다음 확인 단계</h3>${list(input.performanceReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "load-testing-readiness.html",
      title: "Load Testing Readiness",
      html: pageShell("Load Testing Readiness", "load-testing-readiness.html", `<section class="panel" data-source-pattern="k6"><h2>Load Testing Snapshot</h2><p>${escapeHtml(input.loadTestingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.loadTestingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.loadTestingReadinessReport.loadTestSetups.length}</dd></div><div><dt>tools</dt><dd>${input.loadTestingReadinessReport.toolSignals.length}</dd></div><div><dt>profiles</dt><dd>${input.loadTestingReadinessReport.profileSignals.length}</dd></div><div><dt>assertions</dt><dd>${input.loadTestingReadinessReport.assertionSignals.length}</dd></div><div><dt>reports</dt><dd>${input.loadTestingReadinessReport.reportSignals.length}</dd></div></dl><p class="muted">RepoTutor records load-testing readiness only; it does not generate traffic, validate targets, or contact external services.</p></section><section class="grid"><article class="load-testing-readiness-card"><h3>Load Test Setups</h3>${loadTestingSetupList(input.loadTestingReadinessReport.loadTestSetups)}</article><article class="load-testing-readiness-card"><h3>Tool Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.toolSignals, "signal")}</article><article class="load-testing-readiness-card"><h3>Profile Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.profileSignals, "signal")}</article><article class="load-testing-readiness-card"><h3>Protocol Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.protocolSignals, "signal")}</article></section><section class="grid"><article class="load-testing-readiness-card"><h3>Assertion Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.assertionSignals, "signal")}</article><article class="load-testing-readiness-card"><h3>Data Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.dataSignals, "signal")}</article><article class="load-testing-readiness-card"><h3>Execution Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.executionSignals, "signal")}</article><article class="load-testing-readiness-card"><h3>Report Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.reportSignals, "signal")}</article><article class="load-testing-readiness-card"><h3>Package Signals</h3>${loadTestingSignalList(input.loadTestingReadinessReport.packageSignals, "signal")}</article><article class="load-testing-readiness-card"><h3>Recommended Commands</h3>${loadTestingCommandList(input.loadTestingReadinessReport.recommendedCommands)}</article><article class="load-testing-readiness-card"><h3>Risk Queue</h3>${loadTestingRiskList(input.loadTestingReadinessReport.riskQueue)}</article><article class="load-testing-readiness-card"><h3>다음 확인 단계</h3>${list(input.loadTestingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "benchmark-readiness.html",
      title: "Benchmark Readiness",
      html: pageShell("Benchmark Readiness", "benchmark-readiness.html", `<section class="panel" data-source-pattern="Tinybench"><h2>Benchmark Snapshot</h2><p>${escapeHtml(input.benchmarkReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.benchmarkReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>suites</dt><dd>${input.benchmarkReadinessReport.benchmarkSuites.length}</dd></div><div><dt>tools</dt><dd>${input.benchmarkReadinessReport.toolSignals.length}</dd></div><div><dt>timing</dt><dd>${input.benchmarkReadinessReport.timingSignals.length}</dd></div><div><dt>comparison</dt><dd>${input.benchmarkReadinessReport.comparisonSignals.length}</dd></div><div><dt>reports</dt><dd>${input.benchmarkReadinessReport.reportSignals.length}</dd></div></dl><p class="muted">RepoTutor records benchmark readiness only; it does not execute benchmarks, pin runtime settings, or claim performance regressions.</p></section><section class="grid"><article class="benchmark-readiness-card"><h3>Benchmark Suites</h3>${benchmarkSuiteList(input.benchmarkReadinessReport.benchmarkSuites)}</article><article class="benchmark-readiness-card"><h3>Tool Signals</h3>${benchmarkSignalList(input.benchmarkReadinessReport.toolSignals, "signal")}</article><article class="benchmark-readiness-card"><h3>Timing Signals</h3>${benchmarkSignalList(input.benchmarkReadinessReport.timingSignals, "signal")}</article><article class="benchmark-readiness-card"><h3>Comparison Signals</h3>${benchmarkSignalList(input.benchmarkReadinessReport.comparisonSignals, "signal")}</article></section><section class="grid"><article class="benchmark-readiness-card"><h3>Report Signals</h3>${benchmarkSignalList(input.benchmarkReadinessReport.reportSignals, "signal")}</article><article class="benchmark-readiness-card"><h3>CI Signals</h3>${benchmarkSignalList(input.benchmarkReadinessReport.ciSignals, "signal")}</article><article class="benchmark-readiness-card"><h3>Package Signals</h3>${benchmarkSignalList(input.benchmarkReadinessReport.packageSignals, "signal")}</article><article class="benchmark-readiness-card"><h3>Recommended Commands</h3>${benchmarkCommandList(input.benchmarkReadinessReport.recommendedCommands)}</article><article class="benchmark-readiness-card"><h3>Risk Queue</h3>${benchmarkRiskList(input.benchmarkReadinessReport.riskQueue)}</article><article class="benchmark-readiness-card"><h3>다음 확인 단계</h3>${list(input.benchmarkReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "e2e.html",
      title: "E2E Readiness",
      html: pageShell("E2E Readiness", "e2e.html", `<section class="panel" data-source-pattern="Playwright"><h2>E2E Snapshot</h2><p>${escapeHtml(input.e2eReport.summary)}</p><p class="muted">${escapeHtml(input.e2eReport.sourcePattern)}</p><dl class="meta"><div><dt>suites</dt><dd>${input.e2eReport.testSuites.length}</dd></div><div><dt>browser projects</dt><dd>${input.e2eReport.browserProjects.length}</dd></div><div><dt>locators</dt><dd>${input.e2eReport.locatorSignals.length}</dd></div><div><dt>artifacts</dt><dd>${input.e2eReport.artifacts.length}</dd></div></dl><p class="muted">RepoTutor records Playwright-style E2E readiness only. It does not launch browsers or claim user-flow pass/fail results.</p></section><section class="grid"><article class="e2e-card"><h3>Test Suites</h3>${e2eSuiteList(input.e2eReport.testSuites)}</article><article class="e2e-card"><h3>Browser Projects</h3>${e2eBrowserList(input.e2eReport.browserProjects)}</article><article class="e2e-card"><h3>Locator Signals</h3>${e2eLocatorList(input.e2eReport.locatorSignals)}</article><article class="e2e-card"><h3>Assertions</h3>${e2eAssertionList(input.e2eReport.assertions)}</article></section><section class="grid"><article class="e2e-card"><h3>Artifacts</h3>${e2eArtifactList(input.e2eReport.artifacts)}</article><article class="e2e-card"><h3>Runtime Targets</h3>${e2eRuntimeList(input.e2eReport.runtimeTargets)}</article><article class="e2e-card"><h3>Recommended Commands</h3>${e2eCommandList(input.e2eReport.recommendedCommands)}</article><article class="e2e-card"><h3>Risk Queue</h3>${e2eRiskList(input.e2eReport.riskQueue)}</article><article class="e2e-card"><h3>다음 확인 단계</h3>${list(input.e2eReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "flaky-test-readiness.html",
      title: "Flaky Test Readiness",
      html: pageShell("Flaky Test Readiness", "flaky-test-readiness.html", `<section class="panel" data-source-pattern="Flaky"><h2>Flaky Test Snapshot</h2><p>${escapeHtml(input.flakyTestReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.flakyTestReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.flakyTestReadinessReport.flakyTestSetups.length}</dd></div><div><dt>retry signals</dt><dd>${input.flakyTestReadinessReport.retrySignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>quarantine</dt><dd>${input.flakyTestReadinessReport.quarantineSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>artifacts</dt><dd>${input.flakyTestReadinessReport.artifactSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records flaky-test readiness only; it does not rerun tests, execute Playwright/Jest/Pytest, or claim a flake has been reproduced.</p></section><section class="grid"><article class="flaky-test-readiness-card"><h3>Flaky Test Setups</h3>${flakyTestSetupList(input.flakyTestReadinessReport.flakyTestSetups)}</article><article class="flaky-test-readiness-card"><h3>Framework Signals</h3>${flakyTestSignalList(input.flakyTestReadinessReport.frameworkSignals, "signal")}</article><article class="flaky-test-readiness-card"><h3>Retry Signals</h3>${flakyTestSignalList(input.flakyTestReadinessReport.retrySignals, "signal")}</article><article class="flaky-test-readiness-card"><h3>Quarantine Signals</h3>${flakyTestSignalList(input.flakyTestReadinessReport.quarantineSignals, "signal")}</article></section><section class="grid"><article class="flaky-test-readiness-card"><h3>Isolation Signals</h3>${flakyTestSignalList(input.flakyTestReadinessReport.isolationSignals, "signal")}</article><article class="flaky-test-readiness-card"><h3>Artifact Signals</h3>${flakyTestSignalList(input.flakyTestReadinessReport.artifactSignals, "signal")}</article><article class="flaky-test-readiness-card"><h3>CI Signals</h3>${flakyTestSignalList(input.flakyTestReadinessReport.ciSignals, "signal")}</article><article class="flaky-test-readiness-card"><h3>Package Signals</h3>${flakyTestSignalList(input.flakyTestReadinessReport.packageSignals, "signal")}</article><article class="flaky-test-readiness-card"><h3>Recommended Commands</h3>${flakyTestCommandList(input.flakyTestReadinessReport.recommendedCommands)}</article><article class="flaky-test-readiness-card"><h3>Risk Queue</h3>${flakyTestRiskList(input.flakyTestReadinessReport.riskQueue)}</article><article class="flaky-test-readiness-card"><h3>다음 확인 단계</h3>${list(input.flakyTestReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "test-impact-readiness.html",
      title: "Test Impact Readiness",
      html: pageShell("Test Impact Readiness", "test-impact-readiness.html", `<section class="panel" data-source-pattern="Test Impact"><h2>Test Impact Snapshot</h2><p>${escapeHtml(input.testImpactReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.testImpactReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.testImpactReadinessReport.impactSetups.length}</dd></div><div><dt>tools</dt><dd>${input.testImpactReadinessReport.toolSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>changes</dt><dd>${input.testImpactReadinessReport.changeDetectionSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>selection</dt><dd>${input.testImpactReadinessReport.selectionSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records test-impact readiness only; it does not compute an affected graph, execute Nx/Jest/pytest-testmon, or claim selected tests passed.</p></section><section class="grid"><article class="test-impact-readiness-card"><h3>Impact Setups</h3>${testImpactSetupList(input.testImpactReadinessReport.impactSetups)}</article><article class="test-impact-readiness-card"><h3>Tool Signals</h3>${testImpactSignalList(input.testImpactReadinessReport.toolSignals, "signal")}</article><article class="test-impact-readiness-card"><h3>Change Detection Signals</h3>${testImpactSignalList(input.testImpactReadinessReport.changeDetectionSignals, "signal")}</article><article class="test-impact-readiness-card"><h3>Selection Signals</h3>${testImpactSignalList(input.testImpactReadinessReport.selectionSignals, "signal")}</article></section><section class="grid"><article class="test-impact-readiness-card"><h3>Cache Signals</h3>${testImpactSignalList(input.testImpactReadinessReport.cacheSignals, "signal")}</article><article class="test-impact-readiness-card"><h3>CI Signals</h3>${testImpactSignalList(input.testImpactReadinessReport.ciSignals, "signal")}</article><article class="test-impact-readiness-card"><h3>Package Signals</h3>${testImpactSignalList(input.testImpactReadinessReport.packageSignals, "signal")}</article><article class="test-impact-readiness-card"><h3>Recommended Commands</h3>${testImpactCommandList(input.testImpactReadinessReport.recommendedCommands)}</article><article class="test-impact-readiness-card"><h3>Risk Queue</h3>${testImpactRiskList(input.testImpactReadinessReport.riskQueue)}</article><article class="test-impact-readiness-card"><h3>다음 확인 단계</h3>${list(input.testImpactReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "test-reporting-readiness.html",
      title: "Test Reporting Readiness",
      html: pageShell("Test Reporting Readiness", "test-reporting-readiness.html", `<section class="panel" data-source-pattern="Test Reporting"><h2>Test Reporting Snapshot</h2><p>${escapeHtml(input.testReportingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.testReportingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.testReportingReadinessReport.reportSetups.length}</dd></div><div><dt>formats</dt><dd>${input.testReportingReadinessReport.formatSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>adapters</dt><dd>${input.testReportingReadinessReport.adapterSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>CI</dt><dd>${input.testReportingReadinessReport.ciSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records test-reporting readiness only; it does not execute tests, parse generated reports, create GitHub annotations, or publish artifacts.</p></section><section class="grid"><article class="test-reporting-readiness-card"><h3>Report Setups</h3>${testReportingSetupList(input.testReportingReadinessReport.reportSetups)}</article><article class="test-reporting-readiness-card"><h3>Format Signals</h3>${testReportingSignalList(input.testReportingReadinessReport.formatSignals, "signal")}</article><article class="test-reporting-readiness-card"><h3>Adapter Signals</h3>${testReportingSignalList(input.testReportingReadinessReport.adapterSignals, "signal")}</article><article class="test-reporting-readiness-card"><h3>CI Signals</h3>${testReportingSignalList(input.testReportingReadinessReport.ciSignals, "signal")}</article></section><section class="grid"><article class="test-reporting-readiness-card"><h3>Output Signals</h3>${testReportingSignalList(input.testReportingReadinessReport.outputSignals, "signal")}</article><article class="test-reporting-readiness-card"><h3>Quality Signals</h3>${testReportingSignalList(input.testReportingReadinessReport.qualitySignals, "signal")}</article><article class="test-reporting-readiness-card"><h3>Package Signals</h3>${testReportingSignalList(input.testReportingReadinessReport.packageSignals, "signal")}</article><article class="test-reporting-readiness-card"><h3>Recommended Commands</h3>${testReportingCommandList(input.testReportingReadinessReport.recommendedCommands)}</article><article class="test-reporting-readiness-card"><h3>Risk Queue</h3>${testReportingRiskList(input.testReportingReadinessReport.riskQueue)}</article><article class="test-reporting-readiness-card"><h3>다음 확인 단계</h3>${list(input.testReportingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "snapshot-readiness.html",
      title: "Snapshot Readiness",
      html: pageShell("Snapshot Readiness", "snapshot-readiness.html", `<section class="panel" data-source-pattern="Snapshot"><h2>Snapshot Snapshot</h2><p>${escapeHtml(input.snapshotReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.snapshotReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.snapshotReadinessReport.snapshotSetups.length}</dd></div><div><dt>assertions</dt><dd>${input.snapshotReadinessReport.assertionSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>updates</dt><dd>${input.snapshotReadinessReport.updateSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>visual</dt><dd>${input.snapshotReadinessReport.visualSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records snapshot readiness only; it does not update snapshots, run visual comparisons, or approve changed baselines.</p></section><section class="grid"><article class="snapshot-readiness-card"><h3>Snapshot Setups</h3>${snapshotSetupList(input.snapshotReadinessReport.snapshotSetups)}</article><article class="snapshot-readiness-card"><h3>Assertion Signals</h3>${snapshotSignalList(input.snapshotReadinessReport.assertionSignals, "signal")}</article><article class="snapshot-readiness-card"><h3>Storage Signals</h3>${snapshotSignalList(input.snapshotReadinessReport.storageSignals, "signal")}</article><article class="snapshot-readiness-card"><h3>Update Signals</h3>${snapshotSignalList(input.snapshotReadinessReport.updateSignals, "signal")}</article></section><section class="grid"><article class="snapshot-readiness-card"><h3>Serializer Signals</h3>${snapshotSignalList(input.snapshotReadinessReport.serializerSignals, "signal")}</article><article class="snapshot-readiness-card"><h3>Visual Signals</h3>${snapshotSignalList(input.snapshotReadinessReport.visualSignals, "signal")}</article><article class="snapshot-readiness-card"><h3>CI Signals</h3>${snapshotSignalList(input.snapshotReadinessReport.ciSignals, "signal")}</article><article class="snapshot-readiness-card"><h3>Package Signals</h3>${snapshotSignalList(input.snapshotReadinessReport.packageSignals, "signal")}</article><article class="snapshot-readiness-card"><h3>Recommended Commands</h3>${snapshotCommandList(input.snapshotReadinessReport.recommendedCommands)}</article><article class="snapshot-readiness-card"><h3>Risk Queue</h3>${snapshotRiskList(input.snapshotReadinessReport.riskQueue)}</article><article class="snapshot-readiness-card"><h3>다음 확인 단계</h3>${list(input.snapshotReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "property-based-testing-readiness.html",
      title: "Property-Based Testing Readiness",
      html: pageShell("Property-Based Testing Readiness", "property-based-testing-readiness.html", `<section class="panel" data-source-pattern="Property-Based Testing"><h2>Property-Based Testing Snapshot</h2><p>${escapeHtml(input.propertyBasedTestingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.propertyBasedTestingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.propertyBasedTestingReadinessReport.propertySetups.length}</dd></div><div><dt>generators</dt><dd>${input.propertyBasedTestingReadinessReport.generatorSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>replay</dt><dd>${input.propertyBasedTestingReadinessReport.reproductionSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>stateful</dt><dd>${input.propertyBasedTestingReadinessReport.statefulSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records property-based testing readiness only; it does not generate inputs, shrink failures, replay seeds, or execute fast-check, Hypothesis, jqwik, QuickCheck, or proptest.</p></section><section class="grid"><article class="property-based-testing-readiness-card"><h3>Property Setups</h3>${propertyBasedTestingSetupList(input.propertyBasedTestingReadinessReport.propertySetups)}</article><article class="property-based-testing-readiness-card"><h3>Generator Signals</h3>${propertyBasedTestingSignalList(input.propertyBasedTestingReadinessReport.generatorSignals, "signal")}</article><article class="property-based-testing-readiness-card"><h3>Runner Signals</h3>${propertyBasedTestingSignalList(input.propertyBasedTestingReadinessReport.runnerSignals, "signal")}</article><article class="property-based-testing-readiness-card"><h3>Reproduction Signals</h3>${propertyBasedTestingSignalList(input.propertyBasedTestingReadinessReport.reproductionSignals, "signal")}</article></section><section class="grid"><article class="property-based-testing-readiness-card"><h3>Stateful Signals</h3>${propertyBasedTestingSignalList(input.propertyBasedTestingReadinessReport.statefulSignals, "signal")}</article><article class="property-based-testing-readiness-card"><h3>CI Signals</h3>${propertyBasedTestingSignalList(input.propertyBasedTestingReadinessReport.ciSignals, "signal")}</article><article class="property-based-testing-readiness-card"><h3>Package Signals</h3>${propertyBasedTestingSignalList(input.propertyBasedTestingReadinessReport.packageSignals, "signal")}</article><article class="property-based-testing-readiness-card"><h3>Recommended Commands</h3>${propertyBasedTestingCommandList(input.propertyBasedTestingReadinessReport.recommendedCommands)}</article><article class="property-based-testing-readiness-card"><h3>Risk Queue</h3>${propertyBasedTestingRiskList(input.propertyBasedTestingReadinessReport.riskQueue)}</article><article class="property-based-testing-readiness-card"><h3>다음 확인 단계</h3>${list(input.propertyBasedTestingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "test-data-readiness.html",
      title: "Test Data Readiness",
      html: pageShell("Test Data Readiness", "test-data-readiness.html", `<section class="panel" data-source-pattern="Test Data"><h2>Test Data Snapshot</h2><p>${escapeHtml(input.testDataReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.testDataReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.testDataReadinessReport.dataSetups.length}</dd></div><div><dt>factories</dt><dd>${input.testDataReadinessReport.factorySignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>generation</dt><dd>${input.testDataReadinessReport.generationSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>replay</dt><dd>${input.testDataReadinessReport.reproducibilitySignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records test data readiness only; it does not create records, reset databases, seed Faker, lint factories, run Rails, run pytest, or execute project test suites.</p></section><section class="grid"><article class="test-data-readiness-card"><h3>Data Setups</h3>${testDataReadinessSetupList(input.testDataReadinessReport.dataSetups)}</article><article class="test-data-readiness-card"><h3>Factory Signals</h3>${testDataReadinessSignalList(input.testDataReadinessReport.factorySignals, "signal")}</article><article class="test-data-readiness-card"><h3>Relationship Signals</h3>${testDataReadinessSignalList(input.testDataReadinessReport.relationshipSignals, "signal")}</article><article class="test-data-readiness-card"><h3>Generation Signals</h3>${testDataReadinessSignalList(input.testDataReadinessReport.generationSignals, "signal")}</article></section><section class="grid"><article class="test-data-readiness-card"><h3>Reproducibility Signals</h3>${testDataReadinessSignalList(input.testDataReadinessReport.reproducibilitySignals, "signal")}</article><article class="test-data-readiness-card"><h3>Lifecycle Signals</h3>${testDataReadinessSignalList(input.testDataReadinessReport.lifecycleSignals, "signal")}</article><article class="test-data-readiness-card"><h3>CI Signals</h3>${testDataReadinessSignalList(input.testDataReadinessReport.ciSignals, "signal")}</article><article class="test-data-readiness-card"><h3>Package Signals</h3>${testDataReadinessSignalList(input.testDataReadinessReport.packageSignals, "signal")}</article><article class="test-data-readiness-card"><h3>Recommended Commands</h3>${testDataReadinessCommandList(input.testDataReadinessReport.recommendedCommands)}</article><article class="test-data-readiness-card"><h3>Risk Queue</h3>${testDataReadinessRiskList(input.testDataReadinessReport.riskQueue)}</article><article class="test-data-readiness-card"><h3>다음 확인 단계</h3>${list(input.testDataReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "integration-test-environment-readiness.html",
      title: "Integration Test Environment Readiness",
      html: pageShell("Integration Test Environment Readiness", "integration-test-environment-readiness.html", `<section class="panel" data-source-pattern="Testcontainers"><h2>Integration Test Environment Snapshot</h2><p>${escapeHtml(input.integrationTestEnvironmentReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.integrationTestEnvironmentReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.integrationTestEnvironmentReadinessReport.integrationSetups.length}</dd></div><div><dt>containers</dt><dd>${input.integrationTestEnvironmentReadinessReport.containerSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>waits</dt><dd>${input.integrationTestEnvironmentReadinessReport.waitSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>lifecycle</dt><dd>${input.integrationTestEnvironmentReadinessReport.lifecycleSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records Testcontainers-style integration environment readiness only; it does not start Docker, Podman, Docker Compose, Testcontainers modules, resource reapers, service containers, or the analyzed project's tests.</p></section><section class="grid"><article class="integration-test-environment-readiness-card"><h3>Integration Setups</h3>${integrationTestEnvironmentReadinessSetupList(input.integrationTestEnvironmentReadinessReport.integrationSetups)}</article><article class="integration-test-environment-readiness-card"><h3>Container Signals</h3>${integrationTestEnvironmentReadinessSignalList(input.integrationTestEnvironmentReadinessReport.containerSignals, "signal")}</article><article class="integration-test-environment-readiness-card"><h3>Wait Signals</h3>${integrationTestEnvironmentReadinessSignalList(input.integrationTestEnvironmentReadinessReport.waitSignals, "signal")}</article><article class="integration-test-environment-readiness-card"><h3>Lifecycle Signals</h3>${integrationTestEnvironmentReadinessSignalList(input.integrationTestEnvironmentReadinessReport.lifecycleSignals, "signal")}</article></section><section class="grid"><article class="integration-test-environment-readiness-card"><h3>Runtime Signals</h3>${integrationTestEnvironmentReadinessSignalList(input.integrationTestEnvironmentReadinessReport.runtimeSignals, "signal")}</article><article class="integration-test-environment-readiness-card"><h3>Package Signals</h3>${integrationTestEnvironmentReadinessSignalList(input.integrationTestEnvironmentReadinessReport.packageSignals, "signal")}</article><article class="integration-test-environment-readiness-card"><h3>Recommended Commands</h3>${integrationTestEnvironmentReadinessCommandList(input.integrationTestEnvironmentReadinessReport.recommendedCommands)}</article><article class="integration-test-environment-readiness-card"><h3>Risk Queue</h3>${integrationTestEnvironmentReadinessRiskList(input.integrationTestEnvironmentReadinessReport.riskQueue)}</article><article class="integration-test-environment-readiness-card"><h3>다음 확인 단계</h3>${list(input.integrationTestEnvironmentReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "chaos-engineering-readiness.html",
      title: "Chaos Engineering Readiness",
      html: pageShell("Chaos Engineering Readiness", "chaos-engineering-readiness.html", `<section class="panel" data-source-pattern="Chaos Engineering"><h2>Chaos Engineering Snapshot</h2><p>${escapeHtml(input.chaosEngineeringReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.chaosEngineeringReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.chaosEngineeringReadinessReport.chaosSetups.length}</dd></div><div><dt>experiments</dt><dd>${input.chaosEngineeringReadinessReport.experimentSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>faults</dt><dd>${input.chaosEngineeringReadinessReport.faultSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>safety</dt><dd>${input.chaosEngineeringReadinessReport.safetySignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records Chaos Mesh, LitmusChaos, Toxiproxy, probe, scope, and cleanup readiness only. It does not run kubectl, helm, cluster chaos experiments, Toxiproxy faults, stress tests, or production workloads.</p></section><section class="grid"><article class="chaos-engineering-readiness-card"><h3>Chaos Setups</h3>${chaosEngineeringReadinessSetupList(input.chaosEngineeringReadinessReport.chaosSetups)}</article><article class="chaos-engineering-readiness-card"><h3>Experiment Signals</h3>${chaosEngineeringReadinessSignalList(input.chaosEngineeringReadinessReport.experimentSignals, "signal")}</article><article class="chaos-engineering-readiness-card"><h3>Fault Signals</h3>${chaosEngineeringReadinessSignalList(input.chaosEngineeringReadinessReport.faultSignals, "signal")}</article><article class="chaos-engineering-readiness-card"><h3>Scope Signals</h3>${chaosEngineeringReadinessSignalList(input.chaosEngineeringReadinessReport.scopeSignals, "signal")}</article></section><section class="grid"><article class="chaos-engineering-readiness-card"><h3>Safety Signals</h3>${chaosEngineeringReadinessSignalList(input.chaosEngineeringReadinessReport.safetySignals, "signal")}</article><article class="chaos-engineering-readiness-card"><h3>Observability Signals</h3>${chaosEngineeringReadinessSignalList(input.chaosEngineeringReadinessReport.observabilitySignals, "signal")}</article><article class="chaos-engineering-readiness-card"><h3>Package Signals</h3>${chaosEngineeringReadinessSignalList(input.chaosEngineeringReadinessReport.packageSignals, "signal")}</article><article class="chaos-engineering-readiness-card"><h3>Recommended Commands</h3>${chaosEngineeringReadinessCommandList(input.chaosEngineeringReadinessReport.recommendedCommands)}</article><article class="chaos-engineering-readiness-card"><h3>Risk Queue</h3>${chaosEngineeringReadinessRiskList(input.chaosEngineeringReadinessReport.riskQueue)}</article><article class="chaos-engineering-readiness-card"><h3>다음 확인 단계</h3>${list(input.chaosEngineeringReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "accessibility.html",
      title: "Accessibility Readiness",
      html: pageShell("Accessibility Readiness", "accessibility.html", `<section class="panel" data-source-pattern="axe-core"><h2>Accessibility Snapshot</h2><p>${escapeHtml(input.accessibilityReport.summary)}</p><p class="muted">${escapeHtml(input.accessibilityReport.sourcePattern)}</p><dl class="meta"><div><dt>scan targets</dt><dd>${input.accessibilityReport.scanTargets.length}</dd></div><div><dt>rule tags</dt><dd>${input.accessibilityReport.ruleTags.length}</dd></div><div><dt>integrations</dt><dd>${input.accessibilityReport.integrationSignals.length}</dd></div><div><dt>context controls</dt><dd>${input.accessibilityReport.contextControls.length}</dd></div></dl><p class="muted">RepoTutor records axe-core readiness only. It does not run accessibility scans or claim WCAG pass/fail results.</p></section><section class="grid"><article class="accessibility-card"><h3>Scan Targets</h3>${accessibilityScanTargetList(input.accessibilityReport.scanTargets)}</article><article class="accessibility-card"><h3>Rule Tags</h3>${accessibilityRuleTagList(input.accessibilityReport.ruleTags)}</article><article class="accessibility-card"><h3>Result Buckets</h3>${accessibilityResultBucketList(input.accessibilityReport.resultBuckets)}</article><article class="accessibility-card"><h3>Impact Levels</h3>${accessibilityImpactList(input.accessibilityReport.impactLevels)}</article></section><section class="grid"><article class="accessibility-card"><h3>Integration Signals</h3>${accessibilityIntegrationList(input.accessibilityReport.integrationSignals)}</article><article class="accessibility-card"><h3>Context Controls</h3>${accessibilityContextList(input.accessibilityReport.contextControls)}</article><article class="accessibility-card"><h3>Recommended Commands</h3>${accessibilityCommandList(input.accessibilityReport.recommendedCommands)}</article><article class="accessibility-card"><h3>Risk Queue</h3>${accessibilityRiskList(input.accessibilityReport.riskQueue)}</article><article class="accessibility-card"><h3>다음 확인 단계</h3>${list(input.accessibilityReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "storybook.html",
      title: "Storybook Readiness",
      html: pageShell("Storybook Readiness", "storybook.html", `<section class="panel" data-source-pattern="Storybook"><h2>Storybook Snapshot</h2><p>${escapeHtml(input.storybookReport.summary)}</p><p class="muted">${escapeHtml(input.storybookReport.sourcePattern)}</p><dl class="meta"><div><dt>stories</dt><dd>${input.storybookReport.storyFiles.length}</dd></div><div><dt>configs</dt><dd>${input.storybookReport.configFiles.length}</dd></div><div><dt>annotations</dt><dd>${input.storybookReport.storyAnnotations.length}</dd></div><div><dt>addons</dt><dd>${input.storybookReport.addonSignals.length}</dd></div></dl><p class="muted">RepoTutor records Storybook readiness only. It does not start Storybook or claim component-test pass/fail results.</p></section><section class="grid"><article class="storybook-card"><h3>Story Files</h3>${storybookStoryFileList(input.storybookReport.storyFiles)}</article><article class="storybook-card"><h3>Config Files</h3>${storybookConfigList(input.storybookReport.configFiles)}</article><article class="storybook-card"><h3>Story Annotations</h3>${storybookAnnotationList(input.storybookReport.storyAnnotations)}</article><article class="storybook-card"><h3>Addon Signals</h3>${storybookAddonList(input.storybookReport.addonSignals)}</article></section><section class="grid"><article class="storybook-card"><h3>Test Signals</h3>${storybookTestList(input.storybookReport.testSignals)}</article><article class="storybook-card"><h3>Publish Signals</h3>${storybookPublishList(input.storybookReport.publishSignals)}</article><article class="storybook-card"><h3>Recommended Commands</h3>${storybookCommandList(input.storybookReport.recommendedCommands)}</article><article class="storybook-card"><h3>Risk Queue</h3>${storybookRiskList(input.storybookReport.riskQueue)}</article><article class="storybook-card"><h3>다음 확인 단계</h3>${list(input.storybookReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "design-tokens.html",
      title: "Design Tokens Readiness",
      html: pageShell("Design Tokens Readiness", "design-tokens.html", `<section class="panel" data-source-pattern="Style Dictionary"><h2>Design Tokens Snapshot</h2><p>${escapeHtml(input.designTokensReport.summary)}</p><p class="muted">${escapeHtml(input.designTokensReport.sourcePattern)}</p><dl class="meta"><div><dt>sources</dt><dd>${input.designTokensReport.tokenSources.length}</dd></div><div><dt>platforms</dt><dd>${input.designTokensReport.platformTargets.length}</dd></div><div><dt>transforms</dt><dd>${input.designTokensReport.transformSignals.length}</dd></div><div><dt>usage</dt><dd>${input.designTokensReport.usageSignals.length}</dd></div></dl><p class="muted">RepoTutor records Style Dictionary readiness only. It does not build token outputs or claim design-system parity.</p></section><section class="grid"><article class="design-token-card"><h3>Token Sources</h3>${designTokenSourceList(input.designTokensReport.tokenSources)}</article><article class="design-token-card"><h3>Token Categories</h3>${designTokenCategoryList(input.designTokensReport.tokenCategories)}</article><article class="design-token-card"><h3>Platform Targets</h3>${designTokenPlatformList(input.designTokensReport.platformTargets)}</article><article class="design-token-card"><h3>Transform Signals</h3>${designTokenTransformList(input.designTokensReport.transformSignals)}</article></section><section class="grid"><article class="design-token-card"><h3>Usage Signals</h3>${designTokenUsageList(input.designTokensReport.usageSignals)}</article><article class="design-token-card"><h3>Governance Signals</h3>${designTokenGovernanceList(input.designTokensReport.governanceSignals)}</article><article class="design-token-card"><h3>Recommended Commands</h3>${designTokenCommandList(input.designTokensReport.recommendedCommands)}</article><article class="design-token-card"><h3>Risk Queue</h3>${designTokenRiskList(input.designTokensReport.riskQueue)}</article><article class="design-token-card"><h3>다음 확인 단계</h3>${list(input.designTokensReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "i18n.html",
      title: "I18n Readiness",
      html: pageShell("I18n Readiness", "i18n.html", `<section class="panel" data-source-pattern="FormatJS"><h2>I18n Snapshot</h2><p>${escapeHtml(input.i18nReport.summary)}</p><p class="muted">${escapeHtml(input.i18nReport.sourcePattern)}</p><dl class="meta"><div><dt>messages</dt><dd>${input.i18nReport.messageSources.length}</dd></div><div><dt>locales</dt><dd>${input.i18nReport.localeAssets.length}</dd></div><div><dt>runtime</dt><dd>${input.i18nReport.runtimeSignals.length}</dd></div><div><dt>QA</dt><dd>${input.i18nReport.qaSignals.length}</dd></div></dl><p class="muted">RepoTutor records FormatJS readiness only. It does not extract, compile, or verify ICU catalogs.</p></section><section class="grid"><article class="i18n-card"><h3>Message Sources</h3>${i18nMessageSourceList(input.i18nReport.messageSources)}</article><article class="i18n-card"><h3>Locale Assets</h3>${i18nLocaleAssetList(input.i18nReport.localeAssets)}</article><article class="i18n-card"><h3>Runtime Signals</h3>${i18nSignalList(input.i18nReport.runtimeSignals)}</article><article class="i18n-card"><h3>Extraction Signals</h3>${i18nSignalList(input.i18nReport.extractionSignals)}</article></section><section class="grid"><article class="i18n-card"><h3>ICU Signals</h3>${i18nSignalList(input.i18nReport.icuSignals)}</article><article class="i18n-card"><h3>QA Signals</h3>${i18nSignalList(input.i18nReport.qaSignals)}</article><article class="i18n-card"><h3>Recommended Commands</h3>${i18nCommandList(input.i18nReport.recommendedCommands)}</article><article class="i18n-card"><h3>Risk Queue</h3>${i18nRiskList(input.i18nReport.riskQueue)}</article><article class="i18n-card"><h3>다음 확인 단계</h3>${list(input.i18nReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "release-readiness.html",
      title: "Release Readiness",
      html: pageShell("Release Readiness", "release-readiness.html", `<section class="panel" data-source-pattern="semantic-release"><h2>Release Snapshot</h2><p>${escapeHtml(input.releaseReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.releaseReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.releaseReadinessReport.releaseConfigs.length}</dd></div><div><dt>channels</dt><dd>${input.releaseReadinessReport.branchChannels.length}</dd></div><div><dt>CI</dt><dd>${input.releaseReadinessReport.ciSignals.length}</dd></div><div><dt>publish</dt><dd>${input.releaseReadinessReport.publishTargets.length}</dd></div></dl><p class="muted">RepoTutor records semantic-release readiness only. It does not create tags, publish packages, or verify live credentials.</p></section><section class="grid"><article class="release-card"><h3>Release Configs</h3>${releaseConfigList(input.releaseReadinessReport.releaseConfigs)}</article><article class="release-card"><h3>Branch Channels</h3>${releaseSignalList(input.releaseReadinessReport.branchChannels, "channel")}</article><article class="release-card"><h3>Version Signals</h3>${releaseSignalList(input.releaseReadinessReport.versionSignals, "signal")}</article><article class="release-card"><h3>CI Signals</h3>${releaseSignalList(input.releaseReadinessReport.ciSignals, "signal")}</article></section><section class="grid"><article class="release-card"><h3>Publish Targets</h3>${releaseSignalList(input.releaseReadinessReport.publishTargets, "target")}</article><article class="release-card"><h3>Auth Signals</h3>${releaseSignalList(input.releaseReadinessReport.authSignals, "signal")}</article><article class="release-card"><h3>Plugin Steps</h3>${releaseSignalList(input.releaseReadinessReport.pluginSteps, "step")}</article><article class="release-card"><h3>Recommended Commands</h3>${releaseCommandList(input.releaseReadinessReport.recommendedCommands)}</article><article class="release-card"><h3>Risk Queue</h3>${releaseRiskList(input.releaseReadinessReport.riskQueue)}</article><article class="release-card"><h3>다음 확인 단계</h3>${list(input.releaseReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "secret-readiness.html",
      title: "Secret Readiness",
      html: pageShell("Secret Readiness", "secret-readiness.html", `<section class="panel" data-source-pattern="Gitleaks"><h2>Secret Snapshot</h2><p>${escapeHtml(input.secretReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.secretReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>targets</dt><dd>${input.secretReadinessReport.scanTargets.length}</dd></div><div><dt>surfaces</dt><dd>${input.secretReadinessReport.secretSurfaces.length}</dd></div><div><dt>configs</dt><dd>${input.secretReadinessReport.configSignals.length}</dd></div><div><dt>prevention</dt><dd>${input.secretReadinessReport.preventionSignals.length}</dd></div></dl><p class="muted">RepoTutor records Gitleaks readiness only. It does not scan excluded secret-like content or traverse full git history.</p></section><section class="grid"><article class="secret-card"><h3>Scan Targets</h3>${secretSignalList(input.secretReadinessReport.scanTargets, "target")}</article><article class="secret-card"><h3>Secret Surfaces</h3>${secretSurfaceList(input.secretReadinessReport.secretSurfaces)}</article><article class="secret-card"><h3>Config Signals</h3>${secretConfigList(input.secretReadinessReport.configSignals)}</article><article class="secret-card"><h3>Reporting Signals</h3>${secretSignalList(input.secretReadinessReport.reportingSignals, "signal")}</article></section><section class="grid"><article class="secret-card"><h3>Prevention Signals</h3>${secretSignalList(input.secretReadinessReport.preventionSignals, "signal")}</article><article class="secret-card"><h3>Advanced Signals</h3>${secretSignalList(input.secretReadinessReport.advancedSignals, "signal")}</article><article class="secret-card"><h3>Recommended Commands</h3>${secretCommandList(input.secretReadinessReport.recommendedCommands)}</article><article class="secret-card"><h3>Risk Queue</h3>${secretRiskList(input.secretReadinessReport.riskQueue)}</article><article class="secret-card"><h3>다음 확인 단계</h3>${list(input.secretReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "secret-management-readiness.html",
      title: "Secret Management Readiness",
      html: pageShell("Secret Management Readiness", "secret-management-readiness.html", `<section class="panel" data-source-pattern="Secret Management"><h2>Secret Management Snapshot</h2><p>${escapeHtml(input.secretManagementReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.secretManagementReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.secretManagementReadinessReport.secretManagementSetups.length}</dd></div><div><dt>platforms</dt><dd>${input.secretManagementReadinessReport.platformSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>auth</dt><dd>${input.secretManagementReadinessReport.authSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>delivery</dt><dd>${input.secretManagementReadinessReport.deliverySignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>governance</dt><dd>${input.secretManagementReadinessReport.governanceSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records secret-management readiness only. It does not execute Vault, Infisical, Doppler, SOPS, Kubernetes operators, CLIs, API calls, or live credential checks.</p></section><section class="grid"><article class="secret-management-readiness-card"><h3>Secret Management Setups</h3>${secretManagementReadinessSetupList(input.secretManagementReadinessReport.secretManagementSetups)}</article><article class="secret-management-readiness-card"><h3>Platform Signals</h3>${secretManagementReadinessSignalList(input.secretManagementReadinessReport.platformSignals, "signal")}</article><article class="secret-management-readiness-card"><h3>Auth Signals</h3>${secretManagementReadinessSignalList(input.secretManagementReadinessReport.authSignals, "signal")}</article><article class="secret-management-readiness-card"><h3>Storage Signals</h3>${secretManagementReadinessSignalList(input.secretManagementReadinessReport.storageSignals, "signal")}</article></section><section class="grid"><article class="secret-management-readiness-card"><h3>Delivery Signals</h3>${secretManagementReadinessSignalList(input.secretManagementReadinessReport.deliverySignals, "signal")}</article><article class="secret-management-readiness-card"><h3>Governance Signals</h3>${secretManagementReadinessSignalList(input.secretManagementReadinessReport.governanceSignals, "signal")}</article><article class="secret-management-readiness-card"><h3>Package Signals</h3>${secretManagementReadinessSignalList(input.secretManagementReadinessReport.packageSignals, "signal")}</article><article class="secret-management-readiness-card"><h3>Recommended Commands</h3>${secretManagementReadinessCommandList(input.secretManagementReadinessReport.recommendedCommands)}</article><article class="secret-management-readiness-card"><h3>Risk Queue</h3>${secretManagementReadinessRiskList(input.secretManagementReadinessReport.riskQueue)}</article><article class="secret-management-readiness-card"><h3>다음 확인 단계</h3>${list(input.secretManagementReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "container-readiness.html",
      title: "Container Readiness",
      html: pageShell("Container Readiness", "container-readiness.html", `<section class="panel" data-source-pattern="Hadolint"><h2>Container Snapshot</h2><p>${escapeHtml(input.containerReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.containerReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>dockerfiles</dt><dd>${input.containerReadinessReport.dockerfiles.length}</dd></div><div><dt>compose</dt><dd>${input.containerReadinessReport.composeFiles.length}</dd></div><div><dt>configs</dt><dd>${input.containerReadinessReport.configSignals.length}</dd></div><div><dt>integrations</dt><dd>${input.containerReadinessReport.integrationSignals.length}</dd></div></dl><p class="muted">RepoTutor records Hadolint readiness only. It does not build images, parse the Dockerfile AST, execute ShellCheck, or verify registries.</p></section><section class="grid"><article class="container-card"><h3>Dockerfiles</h3>${containerDockerfileList(input.containerReadinessReport.dockerfiles)}</article><article class="container-card"><h3>Compose Files</h3>${containerComposeList(input.containerReadinessReport.composeFiles)}</article><article class="container-card"><h3>Config Signals</h3>${containerConfigList(input.containerReadinessReport.configSignals)}</article><article class="container-card"><h3>Instruction Risks</h3>${containerSignalList(input.containerReadinessReport.instructionRisks, "rule")}</article></section><section class="grid"><article class="container-card"><h3>Label Policy</h3>${containerSignalList(input.containerReadinessReport.labelPolicy, "label")}</article><article class="container-card"><h3>Integration Signals</h3>${containerSignalList(input.containerReadinessReport.integrationSignals, "signal")}</article><article class="container-card"><h3>Recommended Commands</h3>${containerCommandList(input.containerReadinessReport.recommendedCommands)}</article><article class="container-card"><h3>Risk Queue</h3>${containerRiskList(input.containerReadinessReport.riskQueue)}</article><article class="container-card"><h3>다음 확인 단계</h3>${list(input.containerReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "code-quality.html",
      title: "Code Quality",
      html: pageShell("Code Quality", "code-quality.html", `<section class="panel" data-source-pattern="Biome"><h2>Code Quality Snapshot</h2><p>${escapeHtml(input.codeQualityReport.summary)}</p><p class="muted">${escapeHtml(input.codeQualityReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.codeQualityReport.toolConfigs.length}</dd></div><div><dt>formatter</dt><dd>${input.codeQualityReport.formatterSignals.length}</dd></div><div><dt>linter</dt><dd>${input.codeQualityReport.linterSignals.length}</dd></div><div><dt>CI/editor</dt><dd>${input.codeQualityReport.ciSignals.length}</dd></div></dl><p class="muted">RepoTutor records Biome-style readiness only. It does not execute Biome, ESLint, Prettier, editor LSPs, or unsafe fixes.</p></section><section class="grid"><article class="code-quality-card"><h3>Tool Configs</h3>${codeQualityConfigList(input.codeQualityReport.toolConfigs)}</article><article class="code-quality-card"><h3>Formatter Signals</h3>${codeQualitySignalList(input.codeQualityReport.formatterSignals, "signal")}</article><article class="code-quality-card"><h3>Linter Signals</h3>${codeQualitySignalList(input.codeQualityReport.linterSignals, "signal")}</article><article class="code-quality-card"><h3>Assist Signals</h3>${codeQualitySignalList(input.codeQualityReport.assistSignals, "signal")}</article></section><section class="grid"><article class="code-quality-card"><h3>CI Signals</h3>${codeQualitySignalList(input.codeQualityReport.ciSignals, "signal")}</article><article class="code-quality-card"><h3>Language Coverage</h3>${codeQualityLanguageList(input.codeQualityReport.languageCoverage)}</article><article class="code-quality-card"><h3>Recommended Commands</h3>${codeQualityCommandList(input.codeQualityReport.recommendedCommands)}</article><article class="code-quality-card"><h3>Risk Queue</h3>${codeQualityRiskList(input.codeQualityReport.riskQueue)}</article><article class="code-quality-card"><h3>다음 확인 단계</h3>${list(input.codeQualityReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "documentation.html",
      title: "Documentation Readiness",
      html: pageShell("Documentation Readiness", "documentation.html", `<section class="panel" data-source-pattern="Docusaurus"><h2>Documentation Snapshot</h2><p>${escapeHtml(input.documentationReport.summary)}</p><p class="muted">${escapeHtml(input.documentationReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.documentationReport.siteConfigs.length}</dd></div><div><dt>surfaces</dt><dd>${input.documentationReport.contentSurfaces.length}</dd></div><div><dt>navigation</dt><dd>${input.documentationReport.navigationSignals.length}</dd></div><div><dt>release</dt><dd>${input.documentationReport.releaseSignals.length}</dd></div></dl><p class="muted">RepoTutor records Docusaurus-style readiness only. It does not compile MDX, generate routes, check links, index search, or deploy documentation.</p></section><section class="grid"><article class="documentation-card"><h3>Site Configs</h3>${documentationConfigList(input.documentationReport.siteConfigs)}</article><article class="documentation-card"><h3>Content Surfaces</h3>${documentationContentList(input.documentationReport.contentSurfaces)}</article><article class="documentation-card"><h3>Navigation Signals</h3>${documentationSignalList(input.documentationReport.navigationSignals, "signal")}</article><article class="documentation-card"><h3>Quality Signals</h3>${documentationSignalList(input.documentationReport.qualitySignals, "signal")}</article></section><section class="grid"><article class="documentation-card"><h3>Localization Signals</h3>${documentationSignalList(input.documentationReport.localizationSignals, "signal")}</article><article class="documentation-card"><h3>Release Signals</h3>${documentationSignalList(input.documentationReport.releaseSignals, "signal")}</article><article class="documentation-card"><h3>Recommended Commands</h3>${documentationCommandList(input.documentationReport.recommendedCommands)}</article><article class="documentation-card"><h3>Risk Queue</h3>${documentationRiskList(input.documentationReport.riskQueue)}</article><article class="documentation-card"><h3>다음 확인 단계</h3>${list(input.documentationReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "database-readiness.html",
      title: "Database Readiness",
      html: pageShell("Database Readiness", "database-readiness.html", `<section class="panel" data-source-pattern="Prisma"><h2>Database Snapshot</h2><p>${escapeHtml(input.databaseReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.databaseReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>schemas</dt><dd>${input.databaseReadinessReport.schemaFiles.length}</dd></div><div><dt>datasources</dt><dd>${input.databaseReadinessReport.datasourceSignals.length}</dd></div><div><dt>migrations</dt><dd>${input.databaseReadinessReport.migrationSignals.length}</dd></div><div><dt>client</dt><dd>${input.databaseReadinessReport.clientSignals.length}</dd></div></dl><p class="muted">RepoTutor records Prisma-style readiness only. It does not connect to databases, run migrations, introspect schemas, generate clients, or seed data.</p></section><section class="grid"><article class="database-card"><h3>Schema Files</h3>${databaseSchemaList(input.databaseReadinessReport.schemaFiles)}</article><article class="database-card"><h3>Datasource Signals</h3>${databaseDatasourceList(input.databaseReadinessReport.datasourceSignals)}</article><article class="database-card"><h3>Migration Signals</h3>${databaseSignalList(input.databaseReadinessReport.migrationSignals, "signal")}</article><article class="database-card"><h3>Client Signals</h3>${databaseSignalList(input.databaseReadinessReport.clientSignals, "signal")}</article></section><section class="grid"><article class="database-card"><h3>Config Signals</h3>${databaseSignalList(input.databaseReadinessReport.configSignals, "signal")}</article><article class="database-card"><h3>Model Signals</h3>${databaseSignalList(input.databaseReadinessReport.modelSignals, "signal")}</article><article class="database-card"><h3>Recommended Commands</h3>${databaseCommandList(input.databaseReadinessReport.recommendedCommands)}</article><article class="database-card"><h3>Risk Queue</h3>${databaseRiskList(input.databaseReadinessReport.riskQueue)}</article><article class="database-card"><h3>다음 확인 단계</h3>${list(input.databaseReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "database-migration-readiness.html",
      title: "Database Migration Readiness",
      html: pageShell("Database Migration Readiness", "database-migration-readiness.html", `<section class="panel" data-source-pattern="Database Migration"><h2>Database Migration Snapshot</h2><p>${escapeHtml(input.databaseMigrationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.databaseMigrationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.databaseMigrationReadinessReport.migrationSetups.length}</dd></div><div><dt>files</dt><dd>${input.databaseMigrationReadinessReport.fileSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>lineage</dt><dd>${input.databaseMigrationReadinessReport.lineageSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>validation</dt><dd>${input.databaseMigrationReadinessReport.validationSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records database migration readiness only; it does not connect to databases, run migrate, update, rollback, repair, stamp, or schema drift commands.</p></section><section class="grid"><article class="database-migration-readiness-card"><h3>Migration Setups</h3>${databaseMigrationReadinessSetupList(input.databaseMigrationReadinessReport.migrationSetups)}</article><article class="database-migration-readiness-card"><h3>File Signals</h3>${databaseMigrationReadinessSignalList(input.databaseMigrationReadinessReport.fileSignals, "signal")}</article><article class="database-migration-readiness-card"><h3>Lineage Signals</h3>${databaseMigrationReadinessSignalList(input.databaseMigrationReadinessReport.lineageSignals, "signal")}</article><article class="database-migration-readiness-card"><h3>Rollback Signals</h3>${databaseMigrationReadinessSignalList(input.databaseMigrationReadinessReport.rollbackSignals, "signal")}</article></section><section class="grid"><article class="database-migration-readiness-card"><h3>Validation Signals</h3>${databaseMigrationReadinessSignalList(input.databaseMigrationReadinessReport.validationSignals, "signal")}</article><article class="database-migration-readiness-card"><h3>Config Signals</h3>${databaseMigrationReadinessSignalList(input.databaseMigrationReadinessReport.configSignals, "signal")}</article><article class="database-migration-readiness-card"><h3>CI Signals</h3>${databaseMigrationReadinessSignalList(input.databaseMigrationReadinessReport.ciSignals, "signal")}</article><article class="database-migration-readiness-card"><h3>Package Signals</h3>${databaseMigrationReadinessSignalList(input.databaseMigrationReadinessReport.packageSignals, "signal")}</article><article class="database-migration-readiness-card"><h3>Recommended Commands</h3>${databaseMigrationReadinessCommandList(input.databaseMigrationReadinessReport.recommendedCommands)}</article><article class="database-migration-readiness-card"><h3>Risk Queue</h3>${databaseMigrationReadinessRiskList(input.databaseMigrationReadinessReport.riskQueue)}</article><article class="database-migration-readiness-card"><h3>다음 확인 단계</h3>${list(input.databaseMigrationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "database-orm-readiness.html",
      title: "Database ORM Readiness",
      html: pageShell("Database ORM Readiness", "database-orm-readiness.html", `<section class="panel" data-source-pattern="Database ORM"><h2>Database ORM Snapshot</h2><p>${escapeHtml(input.databaseOrmReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.databaseOrmReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.databaseOrmReadinessReport.ormSetups.length}</dd></div><div><dt>entities</dt><dd>${input.databaseOrmReadinessReport.entitySignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>relations</dt><dd>${input.databaseOrmReadinessReport.relationSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>transactions</dt><dd>${input.databaseOrmReadinessReport.transactionSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records database ORM readiness only; it does not connect to databases, instantiate engines, synchronize schemas, run migrations, or execute ORM queries.</p></section><section class="grid"><article class="database-orm-readiness-card"><h3>ORM Setups</h3>${databaseOrmReadinessSetupList(input.databaseOrmReadinessReport.ormSetups)}</article><article class="database-orm-readiness-card"><h3>Entity Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.entitySignals, "signal")}</article><article class="database-orm-readiness-card"><h3>Relation Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.relationSignals, "signal")}</article><article class="database-orm-readiness-card"><h3>Repository Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.repositorySignals, "signal")}</article></section><section class="grid"><article class="database-orm-readiness-card"><h3>Transaction Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.transactionSignals, "signal")}</article><article class="database-orm-readiness-card"><h3>Loading Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.loadingSignals, "signal")}</article><article class="database-orm-readiness-card"><h3>Config Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.configSignals, "signal")}</article><article class="database-orm-readiness-card"><h3>CI Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.ciSignals, "signal")}</article><article class="database-orm-readiness-card"><h3>Package Signals</h3>${databaseOrmReadinessSignalList(input.databaseOrmReadinessReport.packageSignals, "signal")}</article><article class="database-orm-readiness-card"><h3>Recommended Commands</h3>${databaseOrmReadinessCommandList(input.databaseOrmReadinessReport.recommendedCommands)}</article><article class="database-orm-readiness-card"><h3>Risk Queue</h3>${databaseOrmReadinessRiskList(input.databaseOrmReadinessReport.riskQueue)}</article><article class="database-orm-readiness-card"><h3>다음 확인 단계</h3>${list(input.databaseOrmReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "data-quality-readiness.html",
      title: "Data Quality Readiness",
      html: pageShell("Data Quality Readiness", "data-quality-readiness.html", `<section class="panel" data-source-pattern="DataQuality"><h2>Data Quality Snapshot</h2><p>${escapeHtml(input.dataQualityReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.dataQualityReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.dataQualityReadinessReport.dataQualitySetups.length}</dd></div><div><dt>expectations</dt><dd>${input.dataQualityReadinessReport.expectationSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>Soda</dt><dd>${input.dataQualityReadinessReport.sodaSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>dbt</dt><dd>${input.dataQualityReadinessReport.dbtSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>results</dt><dd>${input.dataQualityReadinessReport.resultSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records data quality readiness only; it does not connect to warehouses, run dbt, execute Soda scans, run Great Expectations checkpoints, or inspect live data rows.</p></section><section class="grid"><article class="data-quality-readiness-card"><h3>Data Quality Setups</h3>${dataQualityReadinessSetupList(input.dataQualityReadinessReport.dataQualitySetups)}</article><article class="data-quality-readiness-card"><h3>Great Expectations Signals</h3>${dataQualityReadinessSignalList(input.dataQualityReadinessReport.expectationSignals, "signal")}</article><article class="data-quality-readiness-card"><h3>Soda Signals</h3>${dataQualityReadinessSignalList(input.dataQualityReadinessReport.sodaSignals, "signal")}</article><article class="data-quality-readiness-card"><h3>dbt Signals</h3>${dataQualityReadinessSignalList(input.dataQualityReadinessReport.dbtSignals, "signal")}</article></section><section class="grid"><article class="data-quality-readiness-card"><h3>Quality Dimension Signals</h3>${dataQualityReadinessSignalList(input.dataQualityReadinessReport.qualityDimensionSignals, "signal")}</article><article class="data-quality-readiness-card"><h3>Result Signals</h3>${dataQualityReadinessSignalList(input.dataQualityReadinessReport.resultSignals, "signal")}</article><article class="data-quality-readiness-card"><h3>CI Signals</h3>${dataQualityReadinessSignalList(input.dataQualityReadinessReport.ciSignals, "signal")}</article><article class="data-quality-readiness-card"><h3>Package Signals</h3>${dataQualityReadinessSignalList(input.dataQualityReadinessReport.packageSignals, "signal")}</article><article class="data-quality-readiness-card"><h3>Recommended Commands</h3>${dataQualityReadinessCommandList(input.dataQualityReadinessReport.recommendedCommands)}</article><article class="data-quality-readiness-card"><h3>Risk Queue</h3>${dataQualityReadinessRiskList(input.dataQualityReadinessReport.riskQueue)}</article><article class="data-quality-readiness-card"><h3>다음 확인 단계</h3>${list(input.dataQualityReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "data-lineage-readiness.html",
      title: "Data Lineage Readiness",
      html: pageShell("Data Lineage Readiness", "data-lineage-readiness.html", `<section class="panel" data-source-pattern="DataLineage"><h2>Data Lineage Snapshot</h2><p>${escapeHtml(input.dataLineageReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.dataLineageReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.dataLineageReadinessReport.lineageSetups.length}</dd></div><div><dt>events</dt><dd>${input.dataLineageReadinessReport.eventSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>datasets</dt><dd>${input.dataLineageReadinessReport.datasetSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>dbt artifacts</dt><dd>${input.dataLineageReadinessReport.dbtArtifactSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>storage</dt><dd>${input.dataLineageReadinessReport.storageSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records data lineage readiness only; it does not run OpenLineage producers, call Marquez, execute dbt, parse SQL plans, or contact lineage backends.</p></section><section class="grid"><article class="data-lineage-readiness-card"><h3>Lineage Setups</h3>${dataLineageReadinessSetupList(input.dataLineageReadinessReport.lineageSetups)}</article><article class="data-lineage-readiness-card"><h3>Event Signals</h3>${dataLineageReadinessSignalList(input.dataLineageReadinessReport.eventSignals, "signal")}</article><article class="data-lineage-readiness-card"><h3>Identity Signals</h3>${dataLineageReadinessSignalList(input.dataLineageReadinessReport.identitySignals, "signal")}</article><article class="data-lineage-readiness-card"><h3>Dataset Signals</h3>${dataLineageReadinessSignalList(input.dataLineageReadinessReport.datasetSignals, "signal")}</article></section><section class="grid"><article class="data-lineage-readiness-card"><h3>dbt Artifact Signals</h3>${dataLineageReadinessSignalList(input.dataLineageReadinessReport.dbtArtifactSignals, "signal")}</article><article class="data-lineage-readiness-card"><h3>Storage Signals</h3>${dataLineageReadinessSignalList(input.dataLineageReadinessReport.storageSignals, "signal")}</article><article class="data-lineage-readiness-card"><h3>CI Signals</h3>${dataLineageReadinessSignalList(input.dataLineageReadinessReport.ciSignals, "signal")}</article><article class="data-lineage-readiness-card"><h3>Package Signals</h3>${dataLineageReadinessSignalList(input.dataLineageReadinessReport.packageSignals, "signal")}</article><article class="data-lineage-readiness-card"><h3>Recommended Commands</h3>${dataLineageReadinessCommandList(input.dataLineageReadinessReport.recommendedCommands)}</article><article class="data-lineage-readiness-card"><h3>Risk Queue</h3>${dataLineageReadinessRiskList(input.dataLineageReadinessReport.riskQueue)}</article><article class="data-lineage-readiness-card"><h3>다음 확인 단계</h3>${list(input.dataLineageReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "data-catalog-readiness.html",
      title: "Data Catalog Readiness",
      html: pageShell("Data Catalog Readiness", "data-catalog-readiness.html", `<section class="panel" data-source-pattern="DataCatalog"><h2>Data Catalog Snapshot</h2><p>${escapeHtml(input.dataCatalogReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.dataCatalogReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.dataCatalogReadinessReport.catalogSetups.length}</dd></div><div><dt>ingestion</dt><dd>${input.dataCatalogReadinessReport.ingestionSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>entities</dt><dd>${input.dataCatalogReadinessReport.entitySignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>governance</dt><dd>${input.dataCatalogReadinessReport.governanceSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>search</dt><dd>${input.dataCatalogReadinessReport.searchSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records data catalog readiness only; it does not run catalog ingestion, connect to metadata services, start search indexes, call governance APIs, or contact catalog backends.</p></section><section class="grid"><article class="data-catalog-readiness-card"><h3>Catalog Setups</h3>${dataCatalogReadinessSetupList(input.dataCatalogReadinessReport.catalogSetups)}</article><article class="data-catalog-readiness-card"><h3>Ingestion Signals</h3>${dataCatalogReadinessSignalList(input.dataCatalogReadinessReport.ingestionSignals, "signal")}</article><article class="data-catalog-readiness-card"><h3>Entity Signals</h3>${dataCatalogReadinessSignalList(input.dataCatalogReadinessReport.entitySignals, "signal")}</article><article class="data-catalog-readiness-card"><h3>Governance Signals</h3>${dataCatalogReadinessSignalList(input.dataCatalogReadinessReport.governanceSignals, "signal")}</article></section><section class="grid"><article class="data-catalog-readiness-card"><h3>Search Signals</h3>${dataCatalogReadinessSignalList(input.dataCatalogReadinessReport.searchSignals, "signal")}</article><article class="data-catalog-readiness-card"><h3>Lineage Signals</h3>${dataCatalogReadinessSignalList(input.dataCatalogReadinessReport.lineageSignals, "signal")}</article><article class="data-catalog-readiness-card"><h3>CI Signals</h3>${dataCatalogReadinessSignalList(input.dataCatalogReadinessReport.ciSignals, "signal")}</article><article class="data-catalog-readiness-card"><h3>Package Signals</h3>${dataCatalogReadinessSignalList(input.dataCatalogReadinessReport.packageSignals, "signal")}</article><article class="data-catalog-readiness-card"><h3>Recommended Commands</h3>${dataCatalogReadinessCommandList(input.dataCatalogReadinessReport.recommendedCommands)}</article><article class="data-catalog-readiness-card"><h3>Risk Queue</h3>${dataCatalogReadinessRiskList(input.dataCatalogReadinessReport.riskQueue)}</article><article class="data-catalog-readiness-card"><h3>다음 확인 단계</h3>${list(input.dataCatalogReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "data-annotation-readiness.html",
      title: "Data Annotation Readiness",
      html: pageShell("Data Annotation Readiness", "data-annotation-readiness.html", `<section class="panel" data-source-pattern="DataAnnotation"><h2>Data Annotation Snapshot</h2><p>${escapeHtml(input.dataAnnotationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.dataAnnotationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.dataAnnotationReadinessReport.annotationSetups.length}</dd></div><div><dt>projects</dt><dd>${input.dataAnnotationReadinessReport.projectSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>schemas</dt><dd>${input.dataAnnotationReadinessReport.schemaSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>workflows</dt><dd>${input.dataAnnotationReadinessReport.workflowSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>quality</dt><dd>${input.dataAnnotationReadinessReport.qualitySignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records data annotation readiness only; it does not run Label Studio, FiftyOne, Argilla, CVAT, Labelbox, annotation jobs, API calls, imports, exports, quality metrics, or CI commands.</p></section><section class="grid"><article class="data-annotation-readiness-card"><h3>Annotation Setups</h3>${dataAnnotationReadinessSetupList(input.dataAnnotationReadinessReport.annotationSetups)}</article><article class="data-annotation-readiness-card"><h3>Platform Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.platformSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Project Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.projectSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Task Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.taskSignals, "signal")}</article></section><section class="grid"><article class="data-annotation-readiness-card"><h3>Schema Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.schemaSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Workflow Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.workflowSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Quality Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.qualitySignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Prelabel Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.prelabelSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Export Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.exportSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>CI Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.ciSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Package Signals</h3>${dataAnnotationReadinessSignalList(input.dataAnnotationReadinessReport.packageSignals, "signal")}</article><article class="data-annotation-readiness-card"><h3>Recommended Commands</h3>${dataAnnotationReadinessCommandList(input.dataAnnotationReadinessReport.recommendedCommands)}</article><article class="data-annotation-readiness-card"><h3>Risk Queue</h3>${dataAnnotationReadinessRiskList(input.dataAnnotationReadinessReport.riskQueue)}</article><article class="data-annotation-readiness-card"><h3>다음 확인 단계</h3>${list(input.dataAnnotationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "feature-store-readiness.html",
      title: "Feature Store Readiness",
      html: pageShell("Feature Store Readiness", "feature-store-readiness.html", `<section class="panel" data-source-pattern="FeatureStore"><h2>Feature Store Snapshot</h2><p>${escapeHtml(input.featureStoreReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.featureStoreReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.featureStoreReadinessReport.featureStoreSetups.length}</dd></div><div><dt>definitions</dt><dd>${input.featureStoreReadinessReport.definitionSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>sources</dt><dd>${input.featureStoreReadinessReport.sourceSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>storage</dt><dd>${input.featureStoreReadinessReport.storageSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>retrieval</dt><dd>${input.featureStoreReadinessReport.retrievalSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records feature store readiness only; it does not run Feast, Feathr, Hopsworks, Spark, Redis, materialization jobs, or online serving APIs.</p></section><section class="grid"><article class="feature-store-readiness-card"><h3>Feature Store Setups</h3>${featureStoreReadinessSetupList(input.featureStoreReadinessReport.featureStoreSetups)}</article><article class="feature-store-readiness-card"><h3>Definition Signals</h3>${featureStoreReadinessSignalList(input.featureStoreReadinessReport.definitionSignals, "signal")}</article><article class="feature-store-readiness-card"><h3>Source Signals</h3>${featureStoreReadinessSignalList(input.featureStoreReadinessReport.sourceSignals, "signal")}</article><article class="feature-store-readiness-card"><h3>Storage Signals</h3>${featureStoreReadinessSignalList(input.featureStoreReadinessReport.storageSignals, "signal")}</article></section><section class="grid"><article class="feature-store-readiness-card"><h3>Retrieval Signals</h3>${featureStoreReadinessSignalList(input.featureStoreReadinessReport.retrievalSignals, "signal")}</article><article class="feature-store-readiness-card"><h3>Materialization Signals</h3>${featureStoreReadinessSignalList(input.featureStoreReadinessReport.materializationSignals, "signal")}</article><article class="feature-store-readiness-card"><h3>CI Signals</h3>${featureStoreReadinessSignalList(input.featureStoreReadinessReport.ciSignals, "signal")}</article><article class="feature-store-readiness-card"><h3>Package Signals</h3>${featureStoreReadinessSignalList(input.featureStoreReadinessReport.packageSignals, "signal")}</article><article class="feature-store-readiness-card"><h3>Recommended Commands</h3>${featureStoreReadinessCommandList(input.featureStoreReadinessReport.recommendedCommands)}</article><article class="feature-store-readiness-card"><h3>Risk Queue</h3>${featureStoreReadinessRiskList(input.featureStoreReadinessReport.riskQueue)}</article><article class="feature-store-readiness-card"><h3>다음 확인 단계</h3>${list(input.featureStoreReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "model-registry-readiness.html",
      title: "Model Registry Readiness",
      html: pageShell("Model Registry Readiness", "model-registry-readiness.html", `<section class="panel" data-source-pattern="ModelRegistry"><h2>Model Registry Snapshot</h2><p>${escapeHtml(input.modelRegistryReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.modelRegistryReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.modelRegistryReadinessReport.modelRegistrySetups.length}</dd></div><div><dt>registration</dt><dd>${input.modelRegistryReadinessReport.registrationSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>metadata</dt><dd>${input.modelRegistryReadinessReport.metadataSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>artifacts</dt><dd>${input.modelRegistryReadinessReport.artifactSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>serving</dt><dd>${input.modelRegistryReadinessReport.servingSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records model registry readiness only; it does not run MLflow, Kubeflow Model Registry, BentoML, KServe, Docker, model serving, registration APIs, or deployment commands.</p></section><section class="grid"><article class="model-registry-readiness-card"><h3>Model Registry Setups</h3>${modelRegistryReadinessSetupList(input.modelRegistryReadinessReport.modelRegistrySetups)}</article><article class="model-registry-readiness-card"><h3>Registration Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.registrationSignals, "signal")}</article><article class="model-registry-readiness-card"><h3>Metadata Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.metadataSignals, "signal")}</article><article class="model-registry-readiness-card"><h3>Artifact Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.artifactSignals, "signal")}</article></section><section class="grid"><article class="model-registry-readiness-card"><h3>Lifecycle Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.lifecycleSignals, "signal")}</article><article class="model-registry-readiness-card"><h3>Serving Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.servingSignals, "signal")}</article><article class="model-registry-readiness-card"><h3>Lineage Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.lineageSignals, "signal")}</article><article class="model-registry-readiness-card"><h3>CI Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.ciSignals, "signal")}</article><article class="model-registry-readiness-card"><h3>Package Signals</h3>${modelRegistryReadinessSignalList(input.modelRegistryReadinessReport.packageSignals, "signal")}</article><article class="model-registry-readiness-card"><h3>Recommended Commands</h3>${modelRegistryReadinessCommandList(input.modelRegistryReadinessReport.recommendedCommands)}</article><article class="model-registry-readiness-card"><h3>Risk Queue</h3>${modelRegistryReadinessRiskList(input.modelRegistryReadinessReport.riskQueue)}</article><article class="model-registry-readiness-card"><h3>다음 확인 단계</h3>${list(input.modelRegistryReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "experiment-tracking-readiness.html",
      title: "Experiment Tracking Readiness",
      html: pageShell("Experiment Tracking Readiness", "experiment-tracking-readiness.html", `<section class="panel" data-source-pattern="ExperimentTracking"><h2>Experiment Tracking Snapshot</h2><p>${escapeHtml(input.experimentTrackingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.experimentTrackingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.experimentTrackingReadinessReport.experimentTrackingSetups.length}</dd></div><div><dt>runs</dt><dd>${input.experimentTrackingReadinessReport.runSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>logging</dt><dd>${input.experimentTrackingReadinessReport.loggingSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>automation</dt><dd>${input.experimentTrackingReadinessReport.automationSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>CI</dt><dd>${input.experimentTrackingReadinessReport.ciSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records experiment tracking readiness only; it does not run MLflow, W&B, Neptune, tracking servers, sweeps, offline sync, training jobs, or CI commands.</p></section><section class="grid"><article class="experiment-tracking-readiness-card"><h3>Experiment Tracking Setups</h3>${experimentTrackingReadinessSetupList(input.experimentTrackingReadinessReport.experimentTrackingSetups)}</article><article class="experiment-tracking-readiness-card"><h3>Run Signals</h3>${experimentTrackingReadinessSignalList(input.experimentTrackingReadinessReport.runSignals, "signal")}</article><article class="experiment-tracking-readiness-card"><h3>Logging Signals</h3>${experimentTrackingReadinessSignalList(input.experimentTrackingReadinessReport.loggingSignals, "signal")}</article><article class="experiment-tracking-readiness-card"><h3>Metadata Signals</h3>${experimentTrackingReadinessSignalList(input.experimentTrackingReadinessReport.metadataSignals, "signal")}</article></section><section class="grid"><article class="experiment-tracking-readiness-card"><h3>Automation Signals</h3>${experimentTrackingReadinessSignalList(input.experimentTrackingReadinessReport.automationSignals, "signal")}</article><article class="experiment-tracking-readiness-card"><h3>Storage Signals</h3>${experimentTrackingReadinessSignalList(input.experimentTrackingReadinessReport.storageSignals, "signal")}</article><article class="experiment-tracking-readiness-card"><h3>CI Signals</h3>${experimentTrackingReadinessSignalList(input.experimentTrackingReadinessReport.ciSignals, "signal")}</article><article class="experiment-tracking-readiness-card"><h3>Package Signals</h3>${experimentTrackingReadinessSignalList(input.experimentTrackingReadinessReport.packageSignals, "signal")}</article><article class="experiment-tracking-readiness-card"><h3>Recommended Commands</h3>${experimentTrackingReadinessCommandList(input.experimentTrackingReadinessReport.recommendedCommands)}</article><article class="experiment-tracking-readiness-card"><h3>Risk Queue</h3>${experimentTrackingReadinessRiskList(input.experimentTrackingReadinessReport.riskQueue)}</article><article class="experiment-tracking-readiness-card"><h3>다음 확인 단계</h3>${list(input.experimentTrackingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "model-monitoring-readiness.html",
      title: "Model Monitoring Readiness",
      html: pageShell("Model Monitoring Readiness", "model-monitoring-readiness.html", `<section class="panel" data-source-pattern="ModelMonitoring"><h2>Model Monitoring Snapshot</h2><p>${escapeHtml(input.modelMonitoringReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.modelMonitoringReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.modelMonitoringReadinessReport.modelMonitoringSetups.length}</dd></div><div><dt>dataset</dt><dd>${input.modelMonitoringReadinessReport.datasetSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>drift</dt><dd>${input.modelMonitoringReadinessReport.driftSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>quality</dt><dd>${input.modelMonitoringReadinessReport.qualitySignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>performance</dt><dd>${input.modelMonitoringReadinessReport.performanceSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>CI</dt><dd>${input.modelMonitoringReadinessReport.ciSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records model monitoring readiness only; it does not run Evidently, whylogs, WhyLabs, NannyML, drift jobs, dashboards, alerts, or CI commands.</p></section><section class="grid"><article class="model-monitoring-readiness-card"><h3>Model Monitoring Setups</h3>${modelMonitoringReadinessSetupList(input.modelMonitoringReadinessReport.modelMonitoringSetups)}</article><article class="model-monitoring-readiness-card"><h3>Dataset Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.datasetSignals, "signal")}</article><article class="model-monitoring-readiness-card"><h3>Drift Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.driftSignals, "signal")}</article><article class="model-monitoring-readiness-card"><h3>Quality Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.qualitySignals, "signal")}</article></section><section class="grid"><article class="model-monitoring-readiness-card"><h3>Performance Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.performanceSignals, "signal")}</article><article class="model-monitoring-readiness-card"><h3>Reporting Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.reportingSignals, "signal")}</article><article class="model-monitoring-readiness-card"><h3>Alert Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.alertSignals, "signal")}</article><article class="model-monitoring-readiness-card"><h3>CI Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.ciSignals, "signal")}</article><article class="model-monitoring-readiness-card"><h3>Package Signals</h3>${modelMonitoringReadinessSignalList(input.modelMonitoringReadinessReport.packageSignals, "signal")}</article><article class="model-monitoring-readiness-card"><h3>Recommended Commands</h3>${modelMonitoringReadinessCommandList(input.modelMonitoringReadinessReport.recommendedCommands)}</article><article class="model-monitoring-readiness-card"><h3>Risk Queue</h3>${modelMonitoringReadinessRiskList(input.modelMonitoringReadinessReport.riskQueue)}</article><article class="model-monitoring-readiness-card"><h3>다음 확인 단계</h3>${list(input.modelMonitoringReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "model-serving-readiness.html",
      title: "Model Serving Readiness",
      html: pageShell("Model Serving Readiness", "model-serving-readiness.html", `<section class="panel" data-source-pattern="ModelServing"><h2>Model Serving Snapshot</h2><p>${escapeHtml(input.modelServingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.modelServingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.modelServingReadinessReport.modelServingSetups.length}</dd></div><div><dt>platform</dt><dd>${input.modelServingReadinessReport.platformSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>runtime</dt><dd>${input.modelServingReadinessReport.runtimeSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>protocol</dt><dd>${input.modelServingReadinessReport.protocolSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>health</dt><dd>${input.modelServingReadinessReport.healthSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>CI</dt><dd>${input.modelServingReadinessReport.ciSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records model serving readiness only; it does not run KServe, Seldon, Triton, BentoML, Kubernetes, model servers, curl/grpc probes, or CI commands.</p></section><section class="grid"><article class="model-serving-readiness-card"><h3>Model Serving Setups</h3>${modelServingReadinessSetupList(input.modelServingReadinessReport.modelServingSetups)}</article><article class="model-serving-readiness-card"><h3>Platform Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.platformSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Runtime Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.runtimeSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Protocol Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.protocolSignals, "signal")}</article></section><section class="grid"><article class="model-serving-readiness-card"><h3>Routing Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.routingSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Scaling Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.scalingSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Health Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.healthSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Resource Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.resourceSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Observability Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.observabilitySignals, "signal")}</article><article class="model-serving-readiness-card"><h3>CI Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.ciSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Package Signals</h3>${modelServingReadinessSignalList(input.modelServingReadinessReport.packageSignals, "signal")}</article><article class="model-serving-readiness-card"><h3>Recommended Commands</h3>${modelServingReadinessCommandList(input.modelServingReadinessReport.recommendedCommands)}</article><article class="model-serving-readiness-card"><h3>Risk Queue</h3>${modelServingReadinessRiskList(input.modelServingReadinessReport.riskQueue)}</article><article class="model-serving-readiness-card"><h3>다음 확인 단계</h3>${list(input.modelServingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "model-training-readiness.html",
      title: "Model Training Readiness",
      html: pageShell("Model Training Readiness", "model-training-readiness.html", `<section class="panel" data-source-pattern="ModelTraining"><h2>Model Training Snapshot</h2><p>${escapeHtml(input.modelTrainingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.modelTrainingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.modelTrainingReadinessReport.modelTrainingSetups.length}</dd></div><div><dt>loops</dt><dd>${input.modelTrainingReadinessReport.loopSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>distributed</dt><dd>${input.modelTrainingReadinessReport.distributedSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>checkpoint</dt><dd>${input.modelTrainingReadinessReport.checkpointSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>callbacks</dt><dd>${input.modelTrainingReadinessReport.callbackSignals.filter((item) => item.readiness === "ready").length}</dd></div><div><dt>CI</dt><dd>${input.modelTrainingReadinessReport.ciSignals.filter((item) => item.readiness === "ready").length}</dd></div></dl><p class="muted">RepoTutor records model training readiness only; it does not run Lightning, Accelerate, Ray, Torch, training jobs, distributed launchers, checkpoint commands, or CI commands.</p></section><section class="grid"><article class="model-training-readiness-card"><h3>Model Training Setups</h3>${modelTrainingReadinessSetupList(input.modelTrainingReadinessReport.modelTrainingSetups)}</article><article class="model-training-readiness-card"><h3>Loop Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.loopSignals, "signal")}</article><article class="model-training-readiness-card"><h3>Data Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.dataSignals, "signal")}</article><article class="model-training-readiness-card"><h3>Distributed Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.distributedSignals, "signal")}</article></section><section class="grid"><article class="model-training-readiness-card"><h3>Accelerator Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.acceleratorSignals, "signal")}</article><article class="model-training-readiness-card"><h3>Checkpoint Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.checkpointSignals, "signal")}</article><article class="model-training-readiness-card"><h3>Callback Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.callbackSignals, "signal")}</article><article class="model-training-readiness-card"><h3>Observability Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.observabilitySignals, "signal")}</article><article class="model-training-readiness-card"><h3>Config Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.configSignals, "signal")}</article><article class="model-training-readiness-card"><h3>CI Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.ciSignals, "signal")}</article><article class="model-training-readiness-card"><h3>Package Signals</h3>${modelTrainingReadinessSignalList(input.modelTrainingReadinessReport.packageSignals, "signal")}</article><article class="model-training-readiness-card"><h3>Recommended Commands</h3>${modelTrainingReadinessCommandList(input.modelTrainingReadinessReport.recommendedCommands)}</article><article class="model-training-readiness-card"><h3>Risk Queue</h3>${modelTrainingReadinessRiskList(input.modelTrainingReadinessReport.riskQueue)}</article><article class="model-training-readiness-card"><h3>다음 확인 단계</h3>${list(input.modelTrainingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "ci-cd.html",
      title: "CI/CD Readiness",
      html: pageShell("CI/CD Readiness", "ci-cd.html", `<section class="panel" data-source-pattern="GitHub Actions"><h2>CI/CD Snapshot</h2><p>${escapeHtml(input.ciCdReport.summary)}</p><p class="muted">${escapeHtml(input.ciCdReport.sourcePattern)}</p><dl class="meta"><div><dt>workflows</dt><dd>${input.ciCdReport.workflowFiles.length}</dd></div><div><dt>triggers</dt><dd>${input.ciCdReport.triggerSignals.length}</dd></div><div><dt>jobs</dt><dd>${input.ciCdReport.jobSignals.length}</dd></div><div><dt>delivery</dt><dd>${input.ciCdReport.deliverySignals.length}</dd></div></dl><p class="muted">RepoTutor records GitHub Actions readiness only. It does not execute workflows, validate YAML semantics, or call GitHub APIs.</p></section><section class="grid"><article class="ci-cd-card"><h3>Workflow Files</h3>${ciCdWorkflowList(input.ciCdReport.workflowFiles)}</article><article class="ci-cd-card"><h3>Trigger Signals</h3>${ciCdSignalList(input.ciCdReport.triggerSignals, "trigger")}</article><article class="ci-cd-card"><h3>Job Signals</h3>${ciCdSignalList(input.ciCdReport.jobSignals, "signal")}</article><article class="ci-cd-card"><h3>Security Signals</h3>${ciCdSignalList(input.ciCdReport.securitySignals, "signal")}</article></section><section class="grid"><article class="ci-cd-card"><h3>Delivery Signals</h3>${ciCdSignalList(input.ciCdReport.deliverySignals, "signal")}</article><article class="ci-cd-card"><h3>Platform Signals</h3>${ciCdSignalList(input.ciCdReport.platformSignals, "signal")}</article><article class="ci-cd-card"><h3>Recommended Commands</h3>${ciCdCommandList(input.ciCdReport.recommendedCommands)}</article><article class="ci-cd-card"><h3>Risk Queue</h3>${ciCdRiskList(input.ciCdReport.riskQueue)}</article><article class="ci-cd-card"><h3>다음 확인 단계</h3>${list(input.ciCdReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "unit-tests.html",
      title: "Unit Test Readiness",
      html: pageShell("Unit Test Readiness", "unit-tests.html", `<section class="panel" data-source-pattern="Vitest"><h2>Unit Test Snapshot</h2><p>${escapeHtml(input.unitTestReport.summary)}</p><p class="muted">${escapeHtml(input.unitTestReport.sourcePattern)}</p><dl class="meta"><div><dt>tests</dt><dd>${input.unitTestReport.testFiles.length}</dd></div><div><dt>configs</dt><dd>${input.unitTestReport.configFiles.length}</dd></div><div><dt>assertions</dt><dd>${input.unitTestReport.assertionSignals.length}</dd></div><div><dt>coverage</dt><dd>${input.unitTestReport.coverageSignals.length}</dd></div></dl><p class="muted">RepoTutor records Vitest-style readiness only. It does not execute tests, measure coverage, update snapshots, or validate jsdom/browser behavior.</p></section><section class="grid"><article class="unit-test-card"><h3>Test Files</h3>${unitTestFileList(input.unitTestReport.testFiles)}</article><article class="unit-test-card"><h3>Config Files</h3>${unitTestConfigList(input.unitTestReport.configFiles)}</article><article class="unit-test-card"><h3>Assertion Signals</h3>${unitTestSignalList(input.unitTestReport.assertionSignals, "assertion")}</article><article class="unit-test-card"><h3>Mock Signals</h3>${unitTestSignalList(input.unitTestReport.mockSignals, "signal")}</article></section><section class="grid"><article class="unit-test-card"><h3>Coverage Signals</h3>${unitTestSignalList(input.unitTestReport.coverageSignals, "signal")}</article><article class="unit-test-card"><h3>Environment Signals</h3>${unitTestSignalList(input.unitTestReport.environmentSignals, "signal")}</article><article class="unit-test-card"><h3>Reporting Signals</h3>${unitTestSignalList(input.unitTestReport.reportingSignals, "signal")}</article><article class="unit-test-card"><h3>Recommended Commands</h3>${unitTestCommandList(input.unitTestReport.recommendedCommands)}</article><article class="unit-test-card"><h3>Risk Queue</h3>${unitTestRiskList(input.unitTestReport.riskQueue)}</article><article class="unit-test-card"><h3>다음 확인 단계</h3>${list(input.unitTestReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "coverage-readiness.html",
      title: "Coverage Readiness",
      html: pageShell("Coverage Readiness", "coverage-readiness.html", `<section class="panel" data-source-pattern="nyc"><h2>Coverage Snapshot</h2><p>${escapeHtml(input.coverageReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.coverageReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.coverageReadinessReport.coverageSetups.length}</dd></div><div><dt>instrumentation</dt><dd>${input.coverageReadinessReport.instrumentationSignals.length}</dd></div><div><dt>scope</dt><dd>${input.coverageReadinessReport.scopeSignals.length}</dd></div><div><dt>thresholds</dt><dd>${input.coverageReadinessReport.thresholdSignals.length}</dd></div><div><dt>reports</dt><dd>${input.coverageReadinessReport.reportSignals.length}</dd></div><div><dt>uploads</dt><dd>${input.coverageReadinessReport.ciUploadSignals.length}</dd></div></dl><p class="muted">RepoTutor records coverage readiness only; it does not execute tests, merge raw coverage, generate reports, upload artifacts, or contact coverage services.</p></section><section class="grid"><article class="coverage-readiness-card"><h3>Coverage Setups</h3>${coverageReadinessSetupList(input.coverageReadinessReport.coverageSetups)}</article><article class="coverage-readiness-card"><h3>Instrumentation Signals</h3>${coverageReadinessSignalList(input.coverageReadinessReport.instrumentationSignals, "signal")}</article><article class="coverage-readiness-card"><h3>Scope Signals</h3>${coverageReadinessSignalList(input.coverageReadinessReport.scopeSignals, "signal")}</article><article class="coverage-readiness-card"><h3>Threshold Signals</h3>${coverageReadinessSignalList(input.coverageReadinessReport.thresholdSignals, "signal")}</article></section><section class="grid"><article class="coverage-readiness-card"><h3>Report Signals</h3>${coverageReadinessSignalList(input.coverageReadinessReport.reportSignals, "signal")}</article><article class="coverage-readiness-card"><h3>CI Upload Signals</h3>${coverageReadinessSignalList(input.coverageReadinessReport.ciUploadSignals, "signal")}</article><article class="coverage-readiness-card"><h3>Package Signals</h3>${coverageReadinessSignalList(input.coverageReadinessReport.packageSignals, "signal")}</article><article class="coverage-readiness-card"><h3>Recommended Commands</h3>${coverageReadinessCommandList(input.coverageReadinessReport.recommendedCommands)}</article><article class="coverage-readiness-card"><h3>Risk Queue</h3>${coverageReadinessRiskList(input.coverageReadinessReport.riskQueue)}</article><article class="coverage-readiness-card"><h3>다음 확인 단계</h3>${list(input.coverageReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "mutation-testing-readiness.html",
      title: "Mutation Testing Readiness",
      html: pageShell("Mutation Testing Readiness", "mutation-testing-readiness.html", `<section class="panel" data-source-pattern="Stryker"><h2>Mutation Testing Snapshot</h2><p>${escapeHtml(input.mutationTestingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.mutationTestingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.mutationTestingReadinessReport.mutationSetups.length}</dd></div><div><dt>tools</dt><dd>${input.mutationTestingReadinessReport.toolSignals.length}</dd></div><div><dt>quality</dt><dd>${input.mutationTestingReadinessReport.qualitySignals.length}</dd></div><div><dt>reporters</dt><dd>${input.mutationTestingReadinessReport.reporterSignals.length}</dd></div></dl><p class="muted">RepoTutor records mutation-testing readiness only. It does not execute Stryker, Infection, mutmut, PIT, or project test suites.</p></section><section class="grid"><article class="mutation-testing-readiness-card"><h3>Mutation Setups</h3>${mutationTestingSetupList(input.mutationTestingReadinessReport.mutationSetups)}</article><article class="mutation-testing-readiness-card"><h3>Tool Signals</h3>${mutationTestingSignalList(input.mutationTestingReadinessReport.toolSignals, "signal")}</article><article class="mutation-testing-readiness-card"><h3>Config Signals</h3>${mutationTestingSignalList(input.mutationTestingReadinessReport.configSignals, "signal")}</article><article class="mutation-testing-readiness-card"><h3>Quality Signals</h3>${mutationTestingSignalList(input.mutationTestingReadinessReport.qualitySignals, "signal")}</article></section><section class="grid"><article class="mutation-testing-readiness-card"><h3>Reporter Signals</h3>${mutationTestingSignalList(input.mutationTestingReadinessReport.reporterSignals, "signal")}</article><article class="mutation-testing-readiness-card"><h3>Scope Signals</h3>${mutationTestingSignalList(input.mutationTestingReadinessReport.scopeSignals, "signal")}</article><article class="mutation-testing-readiness-card"><h3>Package Signals</h3>${mutationTestingSignalList(input.mutationTestingReadinessReport.packageSignals, "signal")}</article><article class="mutation-testing-readiness-card"><h3>Recommended Commands</h3>${mutationTestingCommandList(input.mutationTestingReadinessReport.recommendedCommands)}</article><article class="mutation-testing-readiness-card"><h3>Risk Queue</h3>${mutationTestingRiskList(input.mutationTestingReadinessReport.riskQueue)}</article><article class="mutation-testing-readiness-card"><h3>다음 확인 단계</h3>${list(input.mutationTestingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "typecheck-readiness.html",
      title: "Typecheck Readiness",
      html: pageShell("Typecheck Readiness", "typecheck-readiness.html", `<section class="panel" data-source-pattern="TypeScript"><h2>Typecheck Snapshot</h2><p>${escapeHtml(input.typecheckReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.typecheckReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.typecheckReadinessReport.tsconfigFiles.length}</dd></div><div><dt>compiler</dt><dd>${input.typecheckReadinessReport.compilerOptionSignals.length}</dd></div><div><dt>project</dt><dd>${input.typecheckReadinessReport.projectSignals.length}</dd></div><div><dt>scripts</dt><dd>${input.typecheckReadinessReport.scriptSignals.length}</dd></div></dl><p class="muted">RepoTutor records TypeScript readiness only. It does not execute tsc, resolve modules, emit declarations, or inspect real diagnostics.</p></section><section class="grid"><article class="typecheck-card"><h3>TSConfig Files</h3>${typecheckTsconfigList(input.typecheckReadinessReport.tsconfigFiles)}</article><article class="typecheck-card"><h3>Compiler Option Signals</h3>${typecheckSignalList(input.typecheckReadinessReport.compilerOptionSignals, "signal")}</article><article class="typecheck-card"><h3>Project Signals</h3>${typecheckSignalList(input.typecheckReadinessReport.projectSignals, "signal")}</article><article class="typecheck-card"><h3>Module Resolution Signals</h3>${typecheckSignalList(input.typecheckReadinessReport.moduleResolutionSignals, "signal")}</article></section><section class="grid"><article class="typecheck-card"><h3>Declaration Signals</h3>${typecheckSignalList(input.typecheckReadinessReport.declarationSignals, "signal")}</article><article class="typecheck-card"><h3>Script Signals</h3>${typecheckSignalList(input.typecheckReadinessReport.scriptSignals, "signal")}</article><article class="typecheck-card"><h3>Recommended Commands</h3>${typecheckCommandList(input.typecheckReadinessReport.recommendedCommands)}</article><article class="typecheck-card"><h3>Risk Queue</h3>${typecheckRiskList(input.typecheckReadinessReport.riskQueue)}</article><article class="typecheck-card"><h3>다음 확인 단계</h3>${list(input.typecheckReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "package-manager.html",
      title: "Package Manager Readiness",
      html: pageShell("Package Manager Readiness", "package-manager.html", `<section class="panel" data-source-pattern="pnpm"><h2>Package Manager Snapshot</h2><p>${escapeHtml(input.packageManagerReport.summary)}</p><p class="muted">${escapeHtml(input.packageManagerReport.sourcePattern)}</p><dl class="meta"><div><dt>manifests</dt><dd>${input.packageManagerReport.manifestFiles.length}</dd></div><div><dt>workspaces</dt><dd>${input.packageManagerReport.workspaceSignals.length}</dd></div><div><dt>lockfiles</dt><dd>${input.packageManagerReport.lockfileSignals.length}</dd></div><div><dt>policies</dt><dd>${input.packageManagerReport.policySignals.length}</dd></div></dl><p class="muted">RepoTutor records package-manager readiness only. It does not run install, resolve registries, or execute lifecycle scripts.</p></section><section class="grid"><article class="package-manager-card"><h3>Manifest Files</h3>${packageManagerManifestList(input.packageManagerReport.manifestFiles)}</article><article class="package-manager-card"><h3>Workspace Signals</h3>${packageManagerSignalList(input.packageManagerReport.workspaceSignals, "signal")}</article><article class="package-manager-card"><h3>Lockfile Signals</h3>${packageManagerLockfileList(input.packageManagerReport.lockfileSignals)}</article><article class="package-manager-card"><h3>Script Signals</h3>${packageManagerSignalList(input.packageManagerReport.scriptSignals, "signal")}</article></section><section class="grid"><article class="package-manager-card"><h3>Policy Signals</h3>${packageManagerSignalList(input.packageManagerReport.policySignals, "signal")}</article><article class="package-manager-card"><h3>Recommended Commands</h3>${packageManagerCommandList(input.packageManagerReport.recommendedCommands)}</article><article class="package-manager-card"><h3>Risk Queue</h3>${packageManagerRiskList(input.packageManagerReport.riskQueue)}</article><article class="package-manager-card"><h3>다음 확인 단계</h3>${list(input.packageManagerReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "git-hooks.html",
      title: "Git Hooks Readiness",
      html: pageShell("Git Hooks Readiness", "git-hooks.html", `<section class="panel" data-source-pattern="Husky"><h2>Git Hooks Snapshot</h2><p>${escapeHtml(input.gitHooksReport.summary)}</p><p class="muted">${escapeHtml(input.gitHooksReport.sourcePattern)}</p><dl class="meta"><div><dt>hooks</dt><dd>${input.gitHooksReport.hookFiles.length}</dd></div><div><dt>install</dt><dd>${input.gitHooksReport.installSignals.length}</dd></div><div><dt>commands</dt><dd>${input.gitHooksReport.commandSignals.length}</dd></div><div><dt>tools</dt><dd>${input.gitHooksReport.toolConfigFiles.length}</dd></div></dl><p class="muted">RepoTutor records Git hook readiness only. It does not run hooks, change Git config, or create commits.</p></section><section class="grid"><article class="git-hooks-card"><h3>Hook Files</h3>${gitHooksHookList(input.gitHooksReport.hookFiles)}</article><article class="git-hooks-card"><h3>Install Signals</h3>${gitHooksSignalList(input.gitHooksReport.installSignals, "signal")}</article><article class="git-hooks-card"><h3>Command Signals</h3>${gitHooksSignalList(input.gitHooksReport.commandSignals, "signal")}</article><article class="git-hooks-card"><h3>Policy Signals</h3>${gitHooksSignalList(input.gitHooksReport.policySignals, "signal")}</article></section><section class="grid"><article class="git-hooks-card"><h3>Tool Config Files</h3>${gitHooksToolConfigList(input.gitHooksReport.toolConfigFiles)}</article><article class="git-hooks-card"><h3>Recommended Commands</h3>${gitHooksCommandList(input.gitHooksReport.recommendedCommands)}</article><article class="git-hooks-card"><h3>Risk Queue</h3>${gitHooksRiskList(input.gitHooksReport.riskQueue)}</article><article class="git-hooks-card"><h3>다음 확인 단계</h3>${list(input.gitHooksReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "task-runner.html",
      title: "Task Runner Readiness",
      html: pageShell("Task Runner Readiness", "task-runner.html", `<section class="panel" data-source-pattern="Turborepo"><h2>Task Runner Snapshot</h2><p>${escapeHtml(input.taskRunnerReport.summary)}</p><p class="muted">${escapeHtml(input.taskRunnerReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.taskRunnerReport.configFiles.length}</dd></div><div><dt>tasks</dt><dd>${input.taskRunnerReport.taskSignals.length}</dd></div><div><dt>cache</dt><dd>${input.taskRunnerReport.cacheSignals.length}</dd></div><div><dt>dependencies</dt><dd>${input.taskRunnerReport.dependencySignals.length}</dd></div></dl><p class="muted">RepoTutor records task-runner readiness only. It does not run turbo, restore cache, contact remote cache, or execute package scripts.</p></section><section class="grid"><article class="task-runner-card"><h3>Config Files</h3>${taskRunnerConfigList(input.taskRunnerReport.configFiles)}</article><article class="task-runner-card"><h3>Task Signals</h3>${taskRunnerSignalList(input.taskRunnerReport.taskSignals, "signal")}</article><article class="task-runner-card"><h3>Cache Signals</h3>${taskRunnerSignalList(input.taskRunnerReport.cacheSignals, "signal")}</article><article class="task-runner-card"><h3>Dependency Signals</h3>${taskRunnerSignalList(input.taskRunnerReport.dependencySignals, "signal")}</article></section><section class="grid"><article class="task-runner-card"><h3>Environment Signals</h3>${taskRunnerSignalList(input.taskRunnerReport.environmentSignals, "signal")}</article><article class="task-runner-card"><h3>Package Script Signals</h3>${taskRunnerSignalList(input.taskRunnerReport.packageScriptSignals, "signal")}</article><article class="task-runner-card"><h3>Recommended Commands</h3>${taskRunnerCommandList(input.taskRunnerReport.recommendedCommands)}</article><article class="task-runner-card"><h3>Risk Queue</h3>${taskRunnerRiskList(input.taskRunnerReport.riskQueue)}</article><article class="task-runner-card"><h3>다음 확인 단계</h3>${list(input.taskRunnerReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "dependency-updates.html",
      title: "Dependency Updates Readiness",
      html: pageShell("Dependency Updates Readiness", "dependency-updates.html", `<section class="panel" data-source-pattern="Renovate"><h2>Dependency Updates Snapshot</h2><p>${escapeHtml(input.dependencyUpdateReport.summary)}</p><p class="muted">${escapeHtml(input.dependencyUpdateReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.dependencyUpdateReport.configFiles.length}</dd></div><div><dt>managers</dt><dd>${input.dependencyUpdateReport.managerSignals.length}</dd></div><div><dt>policies</dt><dd>${input.dependencyUpdateReport.policySignals.length}</dd></div><div><dt>package files</dt><dd>${input.dependencyUpdateReport.packageFileSignals.length}</dd></div></dl><p class="muted">RepoTutor records dependency-update readiness only. It does not query registries, create branches, open pull requests, or validate private credentials.</p></section><section class="grid"><article class="dependency-update-card"><h3>Config Files</h3>${dependencyUpdateConfigList(input.dependencyUpdateReport.configFiles)}</article><article class="dependency-update-card"><h3>Manager Signals</h3>${dependencyUpdateSignalList(input.dependencyUpdateReport.managerSignals, "signal")}</article><article class="dependency-update-card"><h3>Policy Signals</h3>${dependencyUpdateSignalList(input.dependencyUpdateReport.policySignals, "signal")}</article><article class="dependency-update-card"><h3>Workflow Signals</h3>${dependencyUpdateSignalList(input.dependencyUpdateReport.workflowSignals, "signal")}</article></section><section class="grid"><article class="dependency-update-card"><h3>Registry Signals</h3>${dependencyUpdateSignalList(input.dependencyUpdateReport.registrySignals, "signal")}</article><article class="dependency-update-card"><h3>Package File Signals</h3>${dependencyUpdateSignalList(input.dependencyUpdateReport.packageFileSignals, "signal")}</article><article class="dependency-update-card"><h3>Recommended Commands</h3>${dependencyUpdateCommandList(input.dependencyUpdateReport.recommendedCommands)}</article><article class="dependency-update-card"><h3>Risk Queue</h3>${dependencyUpdateRiskList(input.dependencyUpdateReport.riskQueue)}</article><article class="dependency-update-card"><h3>다음 확인 단계</h3>${list(input.dependencyUpdateReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "lint-readiness.html",
      title: "Lint Readiness",
      html: pageShell("Lint Readiness", "lint-readiness.html", `<section class="panel" data-source-pattern="ESLint"><h2>Lint Snapshot</h2><p>${escapeHtml(input.lintReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.lintReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.lintReadinessReport.configFiles.length}</dd></div><div><dt>rules</dt><dd>${input.lintReadinessReport.ruleSignals.length}</dd></div><div><dt>scripts</dt><dd>${input.lintReadinessReport.scriptSignals.length}</dd></div><div><dt>packages</dt><dd>${input.lintReadinessReport.packageSignals.length}</dd></div></dl><p class="muted">RepoTutor records lint readiness only. It does not execute ESLint, apply fixes, resolve parser/plugin packages, or write cache files.</p></section><section class="grid"><article class="lint-readiness-card"><h3>Config Files</h3>${lintReadinessConfigList(input.lintReadinessReport.configFiles)}</article><article class="lint-readiness-card"><h3>Rule Signals</h3>${lintReadinessSignalList(input.lintReadinessReport.ruleSignals, "signal")}</article><article class="lint-readiness-card"><h3>Script Signals</h3>${lintReadinessSignalList(input.lintReadinessReport.scriptSignals, "signal")}</article><article class="lint-readiness-card"><h3>Scope Signals</h3>${lintReadinessSignalList(input.lintReadinessReport.scopeSignals, "signal")}</article></section><section class="grid"><article class="lint-readiness-card"><h3>Output Signals</h3>${lintReadinessSignalList(input.lintReadinessReport.outputSignals, "signal")}</article><article class="lint-readiness-card"><h3>Package Signals</h3>${lintReadinessSignalList(input.lintReadinessReport.packageSignals, "signal")}</article><article class="lint-readiness-card"><h3>Recommended Commands</h3>${lintReadinessCommandList(input.lintReadinessReport.recommendedCommands)}</article><article class="lint-readiness-card"><h3>Risk Queue</h3>${lintReadinessRiskList(input.lintReadinessReport.riskQueue)}</article><article class="lint-readiness-card"><h3>다음 확인 단계</h3>${list(input.lintReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "format-readiness.html",
      title: "Format Readiness",
      html: pageShell("Format Readiness", "format-readiness.html", `<section class="panel" data-source-pattern="Prettier"><h2>Format Snapshot</h2><p>${escapeHtml(input.formatReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.formatReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.formatReadinessReport.configFiles.length}</dd></div><div><dt>ignores</dt><dd>${input.formatReadinessReport.ignoreFiles.length}</dd></div><div><dt>scripts</dt><dd>${input.formatReadinessReport.scriptSignals.length}</dd></div><div><dt>packages</dt><dd>${input.formatReadinessReport.packageSignals.length}</dd></div></dl><p class="muted">RepoTutor records format readiness only. It does not execute Prettier, rewrite files, load plugins, or create cache files.</p></section><section class="grid"><article class="format-readiness-card"><h3>Config Files</h3>${formatReadinessConfigList(input.formatReadinessReport.configFiles)}</article><article class="format-readiness-card"><h3>Ignore Files</h3>${formatReadinessIgnoreList(input.formatReadinessReport.ignoreFiles)}</article><article class="format-readiness-card"><h3>Option Signals</h3>${formatReadinessSignalList(input.formatReadinessReport.optionSignals, "signal")}</article><article class="format-readiness-card"><h3>Script Signals</h3>${formatReadinessSignalList(input.formatReadinessReport.scriptSignals, "signal")}</article></section><section class="grid"><article class="format-readiness-card"><h3>Scope Signals</h3>${formatReadinessSignalList(input.formatReadinessReport.scopeSignals, "signal")}</article><article class="format-readiness-card"><h3>Package Signals</h3>${formatReadinessSignalList(input.formatReadinessReport.packageSignals, "signal")}</article><article class="format-readiness-card"><h3>Recommended Commands</h3>${formatReadinessCommandList(input.formatReadinessReport.recommendedCommands)}</article><article class="format-readiness-card"><h3>Risk Queue</h3>${formatReadinessRiskList(input.formatReadinessReport.riskQueue)}</article><article class="format-readiness-card"><h3>다음 확인 단계</h3>${list(input.formatReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "commit-conventions.html",
      title: "Commit Conventions",
      html: pageShell("Commit Conventions", "commit-conventions.html", `<section class="panel" data-source-pattern="commitlint"><h2>Commit Convention Snapshot</h2><p>${escapeHtml(input.commitConventionReport.summary)}</p><p class="muted">${escapeHtml(input.commitConventionReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.commitConventionReport.configFiles.length}</dd></div><div><dt>rules</dt><dd>${input.commitConventionReport.ruleSignals.length}</dd></div><div><dt>hooks</dt><dd>${input.commitConventionReport.hookSignals.length}</dd></div><div><dt>packages</dt><dd>${input.commitConventionReport.packageSignals.length}</dd></div></dl><p class="muted">RepoTutor records commit convention readiness only. It does not inspect private commit history, execute hooks, or rewrite commit messages.</p></section><section class="grid"><article class="commit-convention-card"><h3>Config Files</h3>${commitConventionConfigList(input.commitConventionReport.configFiles)}</article><article class="commit-convention-card"><h3>Rule Signals</h3>${commitConventionSignalList(input.commitConventionReport.ruleSignals, "signal")}</article><article class="commit-convention-card"><h3>Hook Signals</h3>${commitConventionSignalList(input.commitConventionReport.hookSignals, "signal")}</article><article class="commit-convention-card"><h3>Command Signals</h3>${commitConventionSignalList(input.commitConventionReport.commandSignals, "signal")}</article></section><section class="grid"><article class="commit-convention-card"><h3>Package Signals</h3>${commitConventionSignalList(input.commitConventionReport.packageSignals, "signal")}</article><article class="commit-convention-card"><h3>Recommended Commands</h3>${commitConventionCommandList(input.commitConventionReport.recommendedCommands)}</article><article class="commit-convention-card"><h3>Risk Queue</h3>${commitConventionRiskList(input.commitConventionReport.riskQueue)}</article><article class="commit-convention-card"><h3>다음 확인 단계</h3>${list(input.commitConventionReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "changelog-readiness.html",
      title: "Changelog Readiness",
      html: pageShell("Changelog Readiness", "changelog-readiness.html", `<section class="panel" data-source-pattern="Changesets"><h2>Changelog Snapshot</h2><p>${escapeHtml(input.changelogReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.changelogReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.changelogReadinessReport.configFiles.length}</dd></div><div><dt>changesets</dt><dd>${input.changelogReadinessReport.changesetFiles.length}</dd></div><div><dt>workflows</dt><dd>${input.changelogReadinessReport.workflowSignals.length}</dd></div><div><dt>commands</dt><dd>${input.changelogReadinessReport.commandSignals.length}</dd></div></dl><p class="muted">RepoTutor records changelog readiness only. It does not create changesets, version packages, publish to npm, create tags, or push release commits.</p></section><section class="grid"><article class="changelog-readiness-card"><h3>Config Files</h3>${changelogReadinessConfigList(input.changelogReadinessReport.configFiles)}</article><article class="changelog-readiness-card"><h3>Changeset Files</h3>${changelogReadinessFileList(input.changelogReadinessReport.changesetFiles)}</article><article class="changelog-readiness-card"><h3>Workflow Signals</h3>${changelogReadinessSignalList(input.changelogReadinessReport.workflowSignals, "signal")}</article><article class="changelog-readiness-card"><h3>Command Signals</h3>${changelogReadinessSignalList(input.changelogReadinessReport.commandSignals, "signal")}</article></section><section class="grid"><article class="changelog-readiness-card"><h3>Package Signals</h3>${changelogReadinessSignalList(input.changelogReadinessReport.packageSignals, "signal")}</article><article class="changelog-readiness-card"><h3>Policy Signals</h3>${changelogReadinessSignalList(input.changelogReadinessReport.policySignals, "signal")}</article><article class="changelog-readiness-card"><h3>Recommended Commands</h3>${changelogReadinessCommandList(input.changelogReadinessReport.recommendedCommands)}</article><article class="changelog-readiness-card"><h3>Risk Queue</h3>${changelogReadinessRiskList(input.changelogReadinessReport.riskQueue)}</article><article class="changelog-readiness-card"><h3>다음 확인 단계</h3>${list(input.changelogReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "bundle-analysis.html",
      title: "Bundle Analysis",
      html: pageShell("Bundle Analysis", "bundle-analysis.html", `<section class="panel" data-source-pattern="Webpack Bundle Analyzer"><h2>Bundle Snapshot</h2><p>${escapeHtml(input.bundleAnalysisReport.summary)}</p><p class="muted">${escapeHtml(input.bundleAnalysisReport.sourcePattern)}</p><dl class="meta"><div><dt>configs</dt><dd>${input.bundleAnalysisReport.configFiles.length}</dd></div><div><dt>artifacts</dt><dd>${input.bundleAnalysisReport.bundleArtifacts.length}</dd></div><div><dt>sizes</dt><dd>${input.bundleAnalysisReport.sizeSignals.length}</dd></div><div><dt>packages</dt><dd>${input.bundleAnalysisReport.packageSignals.length}</dd></div></dl><p class="muted">RepoTutor records bundle-analysis readiness only. It does not build the project, start analyzer servers, parse arbitrary bundles, or open generated reports.</p></section><section class="grid"><article class="bundle-analysis-card"><h3>Config Files</h3>${bundleAnalysisConfigList(input.bundleAnalysisReport.configFiles)}</article><article class="bundle-analysis-card"><h3>Bundle Artifacts</h3>${bundleAnalysisArtifactList(input.bundleAnalysisReport.bundleArtifacts)}</article><article class="bundle-analysis-card"><h3>Size Signals</h3>${bundleAnalysisSignalList(input.bundleAnalysisReport.sizeSignals, "signal")}</article><article class="bundle-analysis-card"><h3>Script Signals</h3>${bundleAnalysisSignalList(input.bundleAnalysisReport.scriptSignals, "signal")}</article></section><section class="grid"><article class="bundle-analysis-card"><h3>Package Signals</h3>${bundleAnalysisSignalList(input.bundleAnalysisReport.packageSignals, "signal")}</article><article class="bundle-analysis-card"><h3>Recommended Commands</h3>${bundleAnalysisCommandList(input.bundleAnalysisReport.recommendedCommands)}</article><article class="bundle-analysis-card"><h3>Risk Queue</h3>${bundleAnalysisRiskList(input.bundleAnalysisReport.riskQueue)}</article><article class="bundle-analysis-card"><h3>다음 확인 단계</h3>${list(input.bundleAnalysisReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "mocking-readiness.html",
      title: "Mocking Readiness",
      html: pageShell("Mocking Readiness", "mocking-readiness.html", `<section class="panel" data-source-pattern="Mock Service Worker"><h2>Mocking Snapshot</h2><p>${escapeHtml(input.mockingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.mockingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>handlers</dt><dd>${input.mockingReadinessReport.handlerFiles.length}</dd></div><div><dt>setups</dt><dd>${input.mockingReadinessReport.serverSetups.length}</dd></div><div><dt>protocols</dt><dd>${input.mockingReadinessReport.protocolSignals.length}</dd></div><div><dt>packages</dt><dd>${input.mockingReadinessReport.packageSignals.length}</dd></div></dl><p class="muted">RepoTutor records mocking readiness only. It does not start service workers, open network servers, execute handlers, or run the analyzed project's tests.</p></section><section class="grid"><article class="mocking-readiness-card"><h3>Handler Files</h3>${mockingReadinessHandlerList(input.mockingReadinessReport.handlerFiles)}</article><article class="mocking-readiness-card"><h3>Server Setups</h3>${mockingReadinessSetupList(input.mockingReadinessReport.serverSetups)}</article><article class="mocking-readiness-card"><h3>Protocol Signals</h3>${mockingReadinessSignalList(input.mockingReadinessReport.protocolSignals, "signal")}</article><article class="mocking-readiness-card"><h3>Lifecycle Signals</h3>${mockingReadinessSignalList(input.mockingReadinessReport.lifecycleSignals, "signal")}</article></section><section class="grid"><article class="mocking-readiness-card"><h3>Package Signals</h3>${mockingReadinessSignalList(input.mockingReadinessReport.packageSignals, "signal")}</article><article class="mocking-readiness-card"><h3>Recommended Commands</h3>${mockingReadinessCommandList(input.mockingReadinessReport.recommendedCommands)}</article><article class="mocking-readiness-card"><h3>Risk Queue</h3>${mockingReadinessRiskList(input.mockingReadinessReport.riskQueue)}</article><article class="mocking-readiness-card"><h3>다음 확인 단계</h3>${list(input.mockingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "data-fetching-readiness.html",
      title: "Data Fetching Readiness",
      html: pageShell("Data Fetching Readiness", "data-fetching-readiness.html", `<section class="panel" data-source-pattern="TanStack Query"><h2>Data Fetching Snapshot</h2><p>${escapeHtml(input.dataFetchingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.dataFetchingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>clients</dt><dd>${input.dataFetchingReadinessReport.clientSetups.length}</dd></div><div><dt>usages</dt><dd>${input.dataFetchingReadinessReport.queryUsages.length}</dd></div><div><dt>cache</dt><dd>${input.dataFetchingReadinessReport.cacheSignals.length}</dd></div><div><dt>packages</dt><dd>${input.dataFetchingReadinessReport.packageSignals.length}</dd></div></dl><p class="muted">RepoTutor records data-fetching readiness only. It does not fetch remote APIs, instantiate providers, hydrate caches, or run the analyzed project's tests.</p></section><section class="grid"><article class="data-fetching-card"><h3>Client Setups</h3>${dataFetchingClientList(input.dataFetchingReadinessReport.clientSetups)}</article><article class="data-fetching-card"><h3>Query Usages</h3>${dataFetchingUsageList(input.dataFetchingReadinessReport.queryUsages)}</article><article class="data-fetching-card"><h3>Cache Signals</h3>${dataFetchingSignalList(input.dataFetchingReadinessReport.cacheSignals, "signal")}</article><article class="data-fetching-card"><h3>Data Flow Signals</h3>${dataFetchingSignalList(input.dataFetchingReadinessReport.dataFlowSignals, "signal")}</article></section><section class="grid"><article class="data-fetching-card"><h3>Package Signals</h3>${dataFetchingSignalList(input.dataFetchingReadinessReport.packageSignals, "signal")}</article><article class="data-fetching-card"><h3>Recommended Commands</h3>${dataFetchingCommandList(input.dataFetchingReadinessReport.recommendedCommands)}</article><article class="data-fetching-card"><h3>Risk Queue</h3>${dataFetchingRiskList(input.dataFetchingReadinessReport.riskQueue)}</article><article class="data-fetching-card"><h3>다음 확인 단계</h3>${list(input.dataFetchingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "routing-readiness.html",
      title: "Routing Readiness",
      html: pageShell("Routing Readiness", "routing-readiness.html", `<section class="panel" data-source-pattern="React Router"><h2>Routing Snapshot</h2><p>${escapeHtml(input.routingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.routingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.routingReadinessReport.routingSetups.length}</dd></div><div><dt>routes</dt><dd>${input.routingReadinessReport.routeDefinitions.length}</dd></div><div><dt>navigation</dt><dd>${input.routingReadinessReport.navigationSignals.length}</dd></div><div><dt>data routes</dt><dd>${input.routingReadinessReport.dataRouteSignals.length}</dd></div></dl><p class="muted">RepoTutor records routing readiness only. It does not execute loaders, actions, navigation transitions, dev servers, or browser route flows.</p></section><section class="grid"><article class="routing-readiness-card"><h3>Routing Setups</h3>${routingSetupList(input.routingReadinessReport.routingSetups)}</article><article class="routing-readiness-card"><h3>Route Definitions</h3>${routingDefinitionList(input.routingReadinessReport.routeDefinitions)}</article><article class="routing-readiness-card"><h3>Navigation Signals</h3>${routingSignalList(input.routingReadinessReport.navigationSignals, "signal")}</article><article class="routing-readiness-card"><h3>Data Route Signals</h3>${routingSignalList(input.routingReadinessReport.dataRouteSignals, "signal")}</article></section><section class="grid"><article class="routing-readiness-card"><h3>File Route Signals</h3>${routingSignalList(input.routingReadinessReport.fileRouteSignals, "signal")}</article><article class="routing-readiness-card"><h3>Package Signals</h3>${routingSignalList(input.routingReadinessReport.packageSignals, "signal")}</article><article class="routing-readiness-card"><h3>Recommended Commands</h3>${routingCommandList(input.routingReadinessReport.recommendedCommands)}</article><article class="routing-readiness-card"><h3>Risk Queue</h3>${routingRiskList(input.routingReadinessReport.riskQueue)}</article><article class="routing-readiness-card"><h3>다음 확인 단계</h3>${list(input.routingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "state-management-readiness.html",
      title: "State Management Readiness",
      html: pageShell("State Management Readiness", "state-management-readiness.html", `<section class="panel" data-source-pattern="Redux Toolkit"><h2>State Management Snapshot</h2><p>${escapeHtml(input.stateManagementReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.stateManagementReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>stores</dt><dd>${input.stateManagementReadinessReport.storeSetups.length}</dd></div><div><dt>slices</dt><dd>${input.stateManagementReadinessReport.sliceDefinitions.length}</dd></div><div><dt>selectors</dt><dd>${input.stateManagementReadinessReport.selectorSignals.length}</dd></div><div><dt>side effects</dt><dd>${input.stateManagementReadinessReport.sideEffectSignals.length}</dd></div></dl><p class="muted">RepoTutor records state-management readiness only. It does not instantiate stores, dispatch actions, mount providers, or run the analyzed project's tests.</p></section><section class="grid"><article class="state-management-card"><h3>Store Setups</h3>${stateManagementStoreList(input.stateManagementReadinessReport.storeSetups)}</article><article class="state-management-card"><h3>Slice Definitions</h3>${stateManagementSliceList(input.stateManagementReadinessReport.sliceDefinitions)}</article><article class="state-management-card"><h3>Selector Signals</h3>${stateManagementSignalList(input.stateManagementReadinessReport.selectorSignals, "signal")}</article><article class="state-management-card"><h3>Side Effect Signals</h3>${stateManagementSignalList(input.stateManagementReadinessReport.sideEffectSignals, "signal")}</article></section><section class="grid"><article class="state-management-card"><h3>Entity Signals</h3>${stateManagementSignalList(input.stateManagementReadinessReport.entitySignals, "signal")}</article><article class="state-management-card"><h3>Middleware Signals</h3>${stateManagementSignalList(input.stateManagementReadinessReport.middlewareSignals, "signal")}</article><article class="state-management-card"><h3>RTK Query Signals</h3>${stateManagementSignalList(input.stateManagementReadinessReport.rtkQuerySignals, "signal")}</article><article class="state-management-card"><h3>Package Signals</h3>${stateManagementSignalList(input.stateManagementReadinessReport.packageSignals, "signal")}</article><article class="state-management-card"><h3>Recommended Commands</h3>${stateManagementCommandList(input.stateManagementReadinessReport.recommendedCommands)}</article><article class="state-management-card"><h3>Risk Queue</h3>${stateManagementRiskList(input.stateManagementReadinessReport.riskQueue)}</article><article class="state-management-card"><h3>다음 확인 단계</h3>${list(input.stateManagementReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "form-readiness.html",
      title: "Form Readiness",
      html: pageShell("Form Readiness", "form-readiness.html", `<section class="panel" data-source-pattern="React Hook Form"><h2>Form Snapshot</h2><p>${escapeHtml(input.formReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.formReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.formReadinessReport.formSetups.length}</dd></div><div><dt>fields</dt><dd>${input.formReadinessReport.fieldRegistrations.length}</dd></div><div><dt>validation</dt><dd>${input.formReadinessReport.validationSignals.length}</dd></div><div><dt>errors</dt><dd>${input.formReadinessReport.errorSignals.length}</dd></div></dl><p class="muted">RepoTutor records form readiness only. It does not mount forms, submit values, execute schema validators, or run the analyzed project's tests.</p></section><section class="grid"><article class="form-readiness-card"><h3>Form Setups</h3>${formReadinessSetupList(input.formReadinessReport.formSetups)}</article><article class="form-readiness-card"><h3>Field Registrations</h3>${formReadinessFieldList(input.formReadinessReport.fieldRegistrations)}</article><article class="form-readiness-card"><h3>Validation Signals</h3>${formReadinessSignalList(input.formReadinessReport.validationSignals, "signal")}</article><article class="form-readiness-card"><h3>Error Signals</h3>${formReadinessSignalList(input.formReadinessReport.errorSignals, "signal")}</article></section><section class="grid"><article class="form-readiness-card"><h3>Value Flow Signals</h3>${formReadinessSignalList(input.formReadinessReport.valueFlowSignals, "signal")}</article><article class="form-readiness-card"><h3>Package Signals</h3>${formReadinessSignalList(input.formReadinessReport.packageSignals, "signal")}</article><article class="form-readiness-card"><h3>Recommended Commands</h3>${formReadinessCommandList(input.formReadinessReport.recommendedCommands)}</article><article class="form-readiness-card"><h3>Risk Queue</h3>${formReadinessRiskList(input.formReadinessReport.riskQueue)}</article><article class="form-readiness-card"><h3>다음 확인 단계</h3>${list(input.formReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "auth-readiness.html",
      title: "Auth Readiness",
      html: pageShell("Auth Readiness", "auth-readiness.html", `<section class="panel" data-source-pattern="Auth.js"><h2>Auth Snapshot</h2><p>${escapeHtml(input.authReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.authReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.authReadinessReport.authSetups.length}</dd></div><div><dt>sessions</dt><dd>${input.authReadinessReport.sessionSurfaces.length}</dd></div><div><dt>protection</dt><dd>${input.authReadinessReport.protectionSignals.length}</dd></div><div><dt>providers</dt><dd>${input.authReadinessReport.providerSignals.length}</dd></div></dl><p class="muted">RepoTutor records auth readiness only. It does not start auth servers, call providers, mint tokens, submit credentials, or run the analyzed project's tests.</p></section><section class="grid"><article class="auth-readiness-card"><h3>Auth Setups</h3>${authReadinessSetupList(input.authReadinessReport.authSetups)}</article><article class="auth-readiness-card"><h3>Session Surfaces</h3>${authReadinessSessionList(input.authReadinessReport.sessionSurfaces)}</article><article class="auth-readiness-card"><h3>Protection Signals</h3>${authReadinessSignalList(input.authReadinessReport.protectionSignals, "signal")}</article><article class="auth-readiness-card"><h3>Provider Signals</h3>${authReadinessSignalList(input.authReadinessReport.providerSignals, "signal")}</article></section><section class="grid"><article class="auth-readiness-card"><h3>Callback Signals</h3>${authReadinessSignalList(input.authReadinessReport.callbackSignals, "signal")}</article><article class="auth-readiness-card"><h3>Credential Signals</h3>${authReadinessSignalList(input.authReadinessReport.credentialSignals, "signal")}</article><article class="auth-readiness-card"><h3>Package Signals</h3>${authReadinessSignalList(input.authReadinessReport.packageSignals, "signal")}</article><article class="auth-readiness-card"><h3>Recommended Commands</h3>${authReadinessCommandList(input.authReadinessReport.recommendedCommands)}</article><article class="auth-readiness-card"><h3>Risk Queue</h3>${authReadinessRiskList(input.authReadinessReport.riskQueue)}</article><article class="auth-readiness-card"><h3>다음 확인 단계</h3>${list(input.authReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "authorization-readiness.html",
      title: "Authorization Readiness",
      html: pageShell("Authorization Readiness", "authorization-readiness.html", `<section class="panel" data-source-pattern="OpenFGA"><h2>Authorization Snapshot</h2><p>${escapeHtml(input.authorizationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.authorizationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.authorizationReadinessReport.authorizationSetups.length}</dd></div><div><dt>models</dt><dd>${input.authorizationReadinessReport.modelSignals.length}</dd></div><div><dt>enforcement</dt><dd>${input.authorizationReadinessReport.enforcementSignals.length}</dd></div><div><dt>tests</dt><dd>${input.authorizationReadinessReport.testSignals.length}</dd></div></dl><p class="muted">RepoTutor records authorization readiness only. It does not start OpenFGA, Casbin, CASL, Oso, OPA, custom policy engines, or run the analyzed project's tests.</p></section><section class="grid"><article class="authorization-readiness-card"><h3>Authorization Setups</h3>${authorizationReadinessSetupList(input.authorizationReadinessReport.authorizationSetups)}</article><article class="authorization-readiness-card"><h3>Model Signals</h3>${authorizationReadinessSignalList(input.authorizationReadinessReport.modelSignals, "signal")}</article><article class="authorization-readiness-card"><h3>Enforcement Signals</h3>${authorizationReadinessSignalList(input.authorizationReadinessReport.enforcementSignals, "signal")}</article><article class="authorization-readiness-card"><h3>Identity Signals</h3>${authorizationReadinessSignalList(input.authorizationReadinessReport.identitySignals, "signal")}</article></section><section class="grid"><article class="authorization-readiness-card"><h3>Resource Signals</h3>${authorizationReadinessSignalList(input.authorizationReadinessReport.resourceSignals, "signal")}</article><article class="authorization-readiness-card"><h3>Governance Signals</h3>${authorizationReadinessSignalList(input.authorizationReadinessReport.governanceSignals, "signal")}</article><article class="authorization-readiness-card"><h3>Test Signals</h3>${authorizationReadinessSignalList(input.authorizationReadinessReport.testSignals, "signal")}</article><article class="authorization-readiness-card"><h3>Package Signals</h3>${authorizationReadinessSignalList(input.authorizationReadinessReport.packageSignals, "signal")}</article><article class="authorization-readiness-card"><h3>Recommended Commands</h3>${authorizationReadinessCommandList(input.authorizationReadinessReport.recommendedCommands)}</article><article class="authorization-readiness-card"><h3>Risk Queue</h3>${authorizationReadinessRiskList(input.authorizationReadinessReport.riskQueue)}</article><article class="authorization-readiness-card"><h3>다음 확인 단계</h3>${list(input.authorizationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "payment-readiness.html",
      title: "Payment Readiness",
      html: pageShell("Payment Readiness", "payment-readiness.html", `<section class="panel" data-source-pattern="Stripe"><h2>Payment Snapshot</h2><p>${escapeHtml(input.paymentReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.paymentReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.paymentReadinessReport.paymentSetups.length}</dd></div><div><dt>checkout</dt><dd>${input.paymentReadinessReport.checkoutSignals.length}</dd></div><div><dt>webhooks</dt><dd>${input.paymentReadinessReport.webhookSignals.length}</dd></div><div><dt>credentials</dt><dd>${input.paymentReadinessReport.credentialSignals.length}</dd></div></dl><p class="muted">RepoTutor records payment readiness only. It does not call payment APIs, create checkout sessions, charge cards, verify live webhooks, or run the analyzed project's tests.</p></section><section class="grid"><article class="payment-readiness-card"><h3>Payment Setups</h3>${paymentReadinessSetupList(input.paymentReadinessReport.paymentSetups)}</article><article class="payment-readiness-card"><h3>Checkout Signals</h3>${paymentReadinessSignalList(input.paymentReadinessReport.checkoutSignals, "signal")}</article><article class="payment-readiness-card"><h3>Webhook Signals</h3>${paymentReadinessSignalList(input.paymentReadinessReport.webhookSignals, "signal")}</article><article class="payment-readiness-card"><h3>Customer Signals</h3>${paymentReadinessSignalList(input.paymentReadinessReport.customerSignals, "signal")}</article></section><section class="grid"><article class="payment-readiness-card"><h3>Credential Signals</h3>${paymentReadinessSignalList(input.paymentReadinessReport.credentialSignals, "signal")}</article><article class="payment-readiness-card"><h3>Package Signals</h3>${paymentReadinessSignalList(input.paymentReadinessReport.packageSignals, "signal")}</article><article class="payment-readiness-card"><h3>Recommended Commands</h3>${paymentReadinessCommandList(input.paymentReadinessReport.recommendedCommands)}</article><article class="payment-readiness-card"><h3>Risk Queue</h3>${paymentReadinessRiskList(input.paymentReadinessReport.riskQueue)}</article><article class="payment-readiness-card"><h3>다음 확인 단계</h3>${list(input.paymentReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "email-readiness.html",
      title: "Email Readiness",
      html: pageShell("Email Readiness", "email-readiness.html", `<section class="panel" data-source-pattern="Resend"><h2>Email Snapshot</h2><p>${escapeHtml(input.emailReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.emailReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.emailReadinessReport.emailSetups.length}</dd></div><div><dt>recipients</dt><dd>${input.emailReadinessReport.recipientSignals.length}</dd></div><div><dt>delivery</dt><dd>${input.emailReadinessReport.deliverySignals.length}</dd></div><div><dt>templates</dt><dd>${input.emailReadinessReport.templateSignals.length}</dd></div></dl><p class="muted">RepoTutor records email readiness only. It does not send email, call provider APIs, verify live DNS, process live callbacks, or run the analyzed project's tests.</p></section><section class="grid"><article class="email-readiness-card"><h3>Email Setups</h3>${emailReadinessSetupList(input.emailReadinessReport.emailSetups)}</article><article class="email-readiness-card"><h3>Recipient Signals</h3>${emailReadinessSignalList(input.emailReadinessReport.recipientSignals, "signal")}</article><article class="email-readiness-card"><h3>Delivery Signals</h3>${emailReadinessSignalList(input.emailReadinessReport.deliverySignals, "signal")}</article><article class="email-readiness-card"><h3>Template Signals</h3>${emailReadinessSignalList(input.emailReadinessReport.templateSignals, "signal")}</article></section><section class="grid"><article class="email-readiness-card"><h3>Credential Signals</h3>${emailReadinessSignalList(input.emailReadinessReport.credentialSignals, "signal")}</article><article class="email-readiness-card"><h3>Package Signals</h3>${emailReadinessSignalList(input.emailReadinessReport.packageSignals, "signal")}</article><article class="email-readiness-card"><h3>Recommended Commands</h3>${emailReadinessCommandList(input.emailReadinessReport.recommendedCommands)}</article><article class="email-readiness-card"><h3>Risk Queue</h3>${emailReadinessRiskList(input.emailReadinessReport.riskQueue)}</article><article class="email-readiness-card"><h3>다음 확인 단계</h3>${list(input.emailReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "queue-readiness.html",
      title: "Queue Readiness",
      html: pageShell("Queue Readiness", "queue-readiness.html", `<section class="panel" data-source-pattern="BullMQ"><h2>Queue Snapshot</h2><p>${escapeHtml(input.queueReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.queueReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.queueReadinessReport.queueSetups.length}</dd></div><div><dt>producers</dt><dd>${input.queueReadinessReport.producerSignals.length}</dd></div><div><dt>workers</dt><dd>${input.queueReadinessReport.workerSignals.length}</dd></div><div><dt>reliability</dt><dd>${input.queueReadinessReport.reliabilitySignals.length}</dd></div></dl><p class="muted">RepoTutor records queue readiness only. It does not start Redis, enqueue jobs, run workers, process queues, retry failed jobs, or run the analyzed project's tests.</p></section><section class="grid"><article class="queue-readiness-card"><h3>Queue Setups</h3>${queueReadinessSetupList(input.queueReadinessReport.queueSetups)}</article><article class="queue-readiness-card"><h3>Producer Signals</h3>${queueReadinessSignalList(input.queueReadinessReport.producerSignals, "signal")}</article><article class="queue-readiness-card"><h3>Worker Signals</h3>${queueReadinessSignalList(input.queueReadinessReport.workerSignals, "signal")}</article><article class="queue-readiness-card"><h3>Reliability Signals</h3>${queueReadinessSignalList(input.queueReadinessReport.reliabilitySignals, "signal")}</article></section><section class="grid"><article class="queue-readiness-card"><h3>Connection Signals</h3>${queueReadinessSignalList(input.queueReadinessReport.connectionSignals, "signal")}</article><article class="queue-readiness-card"><h3>Package Signals</h3>${queueReadinessSignalList(input.queueReadinessReport.packageSignals, "signal")}</article><article class="queue-readiness-card"><h3>Recommended Commands</h3>${queueReadinessCommandList(input.queueReadinessReport.recommendedCommands)}</article><article class="queue-readiness-card"><h3>Risk Queue</h3>${queueReadinessRiskList(input.queueReadinessReport.riskQueue)}</article><article class="queue-readiness-card"><h3>다음 확인 단계</h3>${list(input.queueReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "cache-readiness.html",
      title: "Cache Readiness",
      html: pageShell("Cache Readiness", "cache-readiness.html", `<section class="panel" data-source-pattern="Node Redis"><h2>Cache Snapshot</h2><p>${escapeHtml(input.cacheReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.cacheReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.cacheReadinessReport.cacheSetups.length}</dd></div><div><dt>operations</dt><dd>${input.cacheReadinessReport.operationSignals.length}</dd></div><div><dt>policy</dt><dd>${input.cacheReadinessReport.policySignals.length}</dd></div><div><dt>connection</dt><dd>${input.cacheReadinessReport.connectionSignals.length}</dd></div></dl><p class="muted">RepoTutor records cache readiness only. It does not start Redis, open cache sockets, read or write cache keys, subscribe to channels, flush data, or run the analyzed project's tests.</p></section><section class="grid"><article class="cache-readiness-card"><h3>Cache Setups</h3>${cacheReadinessSetupList(input.cacheReadinessReport.cacheSetups)}</article><article class="cache-readiness-card"><h3>Operation Signals</h3>${cacheReadinessSignalList(input.cacheReadinessReport.operationSignals, "signal")}</article><article class="cache-readiness-card"><h3>Policy Signals</h3>${cacheReadinessSignalList(input.cacheReadinessReport.policySignals, "signal")}</article><article class="cache-readiness-card"><h3>Connection Signals</h3>${cacheReadinessSignalList(input.cacheReadinessReport.connectionSignals, "signal")}</article></section><section class="grid"><article class="cache-readiness-card"><h3>Advanced Signals</h3>${cacheReadinessSignalList(input.cacheReadinessReport.advancedSignals, "signal")}</article><article class="cache-readiness-card"><h3>Package Signals</h3>${cacheReadinessSignalList(input.cacheReadinessReport.packageSignals, "signal")}</article><article class="cache-readiness-card"><h3>Recommended Commands</h3>${cacheReadinessCommandList(input.cacheReadinessReport.recommendedCommands)}</article><article class="cache-readiness-card"><h3>Risk Queue</h3>${cacheReadinessRiskList(input.cacheReadinessReport.riskQueue)}</article><article class="cache-readiness-card"><h3>다음 확인 단계</h3>${list(input.cacheReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "logging-readiness.html",
      title: "Logging Readiness",
      html: pageShell("Logging Readiness", "logging-readiness.html", `<section class="panel" data-source-pattern="Pino"><h2>Logging Snapshot</h2><p>${escapeHtml(input.loggingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.loggingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.loggingReadinessReport.loggingSetups.length}</dd></div><div><dt>levels</dt><dd>${input.loggingReadinessReport.levelSignals.length}</dd></div><div><dt>context</dt><dd>${input.loggingReadinessReport.contextSignals.length}</dd></div><div><dt>safety</dt><dd>${input.loggingReadinessReport.safetySignals.length}</dd></div></dl><p class="muted">RepoTutor records logging readiness only. It does not execute logger calls, emit logs, start transports, flush worker threads, call log processors, or run the analyzed project's tests.</p></section><section class="grid"><article class="logging-readiness-card"><h3>Logging Setups</h3>${loggingReadinessSetupList(input.loggingReadinessReport.loggingSetups)}</article><article class="logging-readiness-card"><h3>Level Signals</h3>${loggingReadinessSignalList(input.loggingReadinessReport.levelSignals, "signal")}</article><article class="logging-readiness-card"><h3>Context Signals</h3>${loggingReadinessSignalList(input.loggingReadinessReport.contextSignals, "signal")}</article><article class="logging-readiness-card"><h3>Safety Signals</h3>${loggingReadinessSignalList(input.loggingReadinessReport.safetySignals, "signal")}</article></section><section class="grid"><article class="logging-readiness-card"><h3>Transport Signals</h3>${loggingReadinessSignalList(input.loggingReadinessReport.transportSignals, "signal")}</article><article class="logging-readiness-card"><h3>Package Signals</h3>${loggingReadinessSignalList(input.loggingReadinessReport.packageSignals, "signal")}</article><article class="logging-readiness-card"><h3>Recommended Commands</h3>${loggingReadinessCommandList(input.loggingReadinessReport.recommendedCommands)}</article><article class="logging-readiness-card"><h3>Risk Queue</h3>${loggingReadinessRiskList(input.loggingReadinessReport.riskQueue)}</article><article class="logging-readiness-card"><h3>다음 확인 단계</h3>${list(input.loggingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "feature-flag-readiness.html",
      title: "Feature Flag Readiness",
      html: pageShell("Feature Flag Readiness", "feature-flag-readiness.html", `<section class="panel" data-source-pattern="OpenFeature"><h2>Feature Flag Snapshot</h2><p>${escapeHtml(input.featureFlagReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.featureFlagReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.featureFlagReadinessReport.featureFlagSetups.length}</dd></div><div><dt>evaluations</dt><dd>${input.featureFlagReadinessReport.evaluationSignals.length}</dd></div><div><dt>context</dt><dd>${input.featureFlagReadinessReport.contextSignals.length}</dd></div><div><dt>lifecycle</dt><dd>${input.featureFlagReadinessReport.lifecycleSignals.length}</dd></div></dl><p class="muted">RepoTutor records feature-flag readiness only. It does not initialize providers, fetch remote flags, evaluate live targeting rules, emit tracking events, close providers, or run the analyzed project's tests.</p></section><section class="grid"><article class="feature-flag-readiness-card"><h3>Feature Flag Setups</h3>${featureFlagReadinessSetupList(input.featureFlagReadinessReport.featureFlagSetups)}</article><article class="feature-flag-readiness-card"><h3>Evaluation Signals</h3>${featureFlagReadinessSignalList(input.featureFlagReadinessReport.evaluationSignals, "signal")}</article><article class="feature-flag-readiness-card"><h3>Context Signals</h3>${featureFlagReadinessSignalList(input.featureFlagReadinessReport.contextSignals, "signal")}</article><article class="feature-flag-readiness-card"><h3>Lifecycle Signals</h3>${featureFlagReadinessSignalList(input.featureFlagReadinessReport.lifecycleSignals, "signal")}</article></section><section class="grid"><article class="feature-flag-readiness-card"><h3>Package Signals</h3>${featureFlagReadinessSignalList(input.featureFlagReadinessReport.packageSignals, "signal")}</article><article class="feature-flag-readiness-card"><h3>Recommended Commands</h3>${featureFlagReadinessCommandList(input.featureFlagReadinessReport.recommendedCommands)}</article><article class="feature-flag-readiness-card"><h3>Risk Queue</h3>${featureFlagReadinessRiskList(input.featureFlagReadinessReport.riskQueue)}</article><article class="feature-flag-readiness-card"><h3>다음 확인 단계</h3>${list(input.featureFlagReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "rate-limit-readiness.html",
      title: "Rate Limit Readiness",
      html: pageShell("Rate Limit Readiness", "rate-limit-readiness.html", `<section class="panel" data-source-pattern="rate-limiter-flexible"><h2>Rate Limit Snapshot</h2><p>${escapeHtml(input.rateLimitReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.rateLimitReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.rateLimitReadinessReport.rateLimitSetups.length}</dd></div><div><dt>quota</dt><dd>${input.rateLimitReadinessReport.quotaSignals.length}</dd></div><div><dt>identity</dt><dd>${input.rateLimitReadinessReport.identitySignals.length}</dd></div><div><dt>stores</dt><dd>${input.rateLimitReadinessReport.storeSignals.length}</dd></div></dl><p class="muted">RepoTutor records rate-limit readiness only. It does not initialize limiters, consume points, mutate Redis or other stores, sleep for windows, emit responses, or run the analyzed project's tests.</p></section><section class="grid"><article class="rate-limit-readiness-card"><h3>Rate Limit Setups</h3>${rateLimitReadinessSetupList(input.rateLimitReadinessReport.rateLimitSetups)}</article><article class="rate-limit-readiness-card"><h3>Quota Signals</h3>${rateLimitReadinessSignalList(input.rateLimitReadinessReport.quotaSignals, "signal")}</article><article class="rate-limit-readiness-card"><h3>Identity Signals</h3>${rateLimitReadinessSignalList(input.rateLimitReadinessReport.identitySignals, "signal")}</article><article class="rate-limit-readiness-card"><h3>Store Signals</h3>${rateLimitReadinessSignalList(input.rateLimitReadinessReport.storeSignals, "signal")}</article></section><section class="grid"><article class="rate-limit-readiness-card"><h3>Response Signals</h3>${rateLimitReadinessSignalList(input.rateLimitReadinessReport.responseSignals, "signal")}</article><article class="rate-limit-readiness-card"><h3>Resilience Signals</h3>${rateLimitReadinessSignalList(input.rateLimitReadinessReport.resilienceSignals, "signal")}</article><article class="rate-limit-readiness-card"><h3>Package Signals</h3>${rateLimitReadinessSignalList(input.rateLimitReadinessReport.packageSignals, "signal")}</article><article class="rate-limit-readiness-card"><h3>Recommended Commands</h3>${rateLimitReadinessCommandList(input.rateLimitReadinessReport.recommendedCommands)}</article><article class="rate-limit-readiness-card"><h3>Risk Queue</h3>${rateLimitReadinessRiskList(input.rateLimitReadinessReport.riskQueue)}</article><article class="rate-limit-readiness-card"><h3>다음 확인 단계</h3>${list(input.rateLimitReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "error-tracking-readiness.html",
      title: "Error Tracking Readiness",
      html: pageShell("Error Tracking Readiness", "error-tracking-readiness.html", `<section class="panel" data-source-pattern="Sentry"><h2>Error Tracking Snapshot</h2><p>${escapeHtml(input.errorTrackingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.errorTrackingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.errorTrackingReadinessReport.errorTrackingSetups.length}</dd></div><div><dt>capture</dt><dd>${input.errorTrackingReadinessReport.captureSignals.length}</dd></div><div><dt>context</dt><dd>${input.errorTrackingReadinessReport.contextSignals.length}</dd></div><div><dt>filtering</dt><dd>${input.errorTrackingReadinessReport.filteringSignals.length}</dd></div></dl><p class="muted">RepoTutor records error-tracking readiness only. It does not initialize SDKs, send events to vendors, upload source maps, start tracing/replay, collect PII, or run the analyzed project's tests.</p></section><section class="grid"><article class="error-tracking-readiness-card"><h3>Error Tracking Setups</h3>${errorTrackingReadinessSetupList(input.errorTrackingReadinessReport.errorTrackingSetups)}</article><article class="error-tracking-readiness-card"><h3>Capture Signals</h3>${errorTrackingReadinessSignalList(input.errorTrackingReadinessReport.captureSignals, "signal")}</article><article class="error-tracking-readiness-card"><h3>Context Signals</h3>${errorTrackingReadinessSignalList(input.errorTrackingReadinessReport.contextSignals, "signal")}</article><article class="error-tracking-readiness-card"><h3>Filtering Signals</h3>${errorTrackingReadinessSignalList(input.errorTrackingReadinessReport.filteringSignals, "signal")}</article></section><section class="grid"><article class="error-tracking-readiness-card"><h3>Observability Signals</h3>${errorTrackingReadinessSignalList(input.errorTrackingReadinessReport.observabilitySignals, "signal")}</article><article class="error-tracking-readiness-card"><h3>Package Signals</h3>${errorTrackingReadinessSignalList(input.errorTrackingReadinessReport.packageSignals, "signal")}</article><article class="error-tracking-readiness-card"><h3>Recommended Commands</h3>${errorTrackingReadinessCommandList(input.errorTrackingReadinessReport.recommendedCommands)}</article><article class="error-tracking-readiness-card"><h3>Risk Queue</h3>${errorTrackingReadinessRiskList(input.errorTrackingReadinessReport.riskQueue)}</article><article class="error-tracking-readiness-card"><h3>다음 확인 단계</h3>${list(input.errorTrackingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "analytics-readiness.html",
      title: "Analytics Readiness",
      html: pageShell("Analytics Readiness", "analytics-readiness.html", `<section class="panel" data-source-pattern="PostHog"><h2>Analytics Snapshot</h2><p>${escapeHtml(input.analyticsReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.analyticsReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.analyticsReadinessReport.analyticsSetups.length}</dd></div><div><dt>events</dt><dd>${input.analyticsReadinessReport.eventSignals.length}</dd></div><div><dt>identity</dt><dd>${input.analyticsReadinessReport.identitySignals.length}</dd></div><div><dt>privacy</dt><dd>${input.analyticsReadinessReport.privacySignals.length}</dd></div></dl><p class="muted">RepoTutor records analytics readiness only. It does not initialize analytics SDKs, send events to vendors, collect identities, start replay or heatmaps, mutate cookies or local storage, or run the analyzed project's tests.</p></section><section class="grid"><article class="analytics-readiness-card"><h3>Analytics Setups</h3>${analyticsReadinessSetupList(input.analyticsReadinessReport.analyticsSetups)}</article><article class="analytics-readiness-card"><h3>Event Signals</h3>${analyticsReadinessSignalList(input.analyticsReadinessReport.eventSignals, "signal")}</article><article class="analytics-readiness-card"><h3>Identity Signals</h3>${analyticsReadinessSignalList(input.analyticsReadinessReport.identitySignals, "signal")}</article><article class="analytics-readiness-card"><h3>Privacy Signals</h3>${analyticsReadinessSignalList(input.analyticsReadinessReport.privacySignals, "signal")}</article></section><section class="grid"><article class="analytics-readiness-card"><h3>Product Signals</h3>${analyticsReadinessSignalList(input.analyticsReadinessReport.productSignals, "signal")}</article><article class="analytics-readiness-card"><h3>Package Signals</h3>${analyticsReadinessSignalList(input.analyticsReadinessReport.packageSignals, "signal")}</article><article class="analytics-readiness-card"><h3>Recommended Commands</h3>${analyticsReadinessCommandList(input.analyticsReadinessReport.recommendedCommands)}</article><article class="analytics-readiness-card"><h3>Risk Queue</h3>${analyticsReadinessRiskList(input.analyticsReadinessReport.riskQueue)}</article><article class="analytics-readiness-card"><h3>다음 확인 단계</h3>${list(input.analyticsReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "http-client-readiness.html",
      title: "HTTP Client Readiness",
      html: pageShell("HTTP Client Readiness", "http-client-readiness.html", `<section class="panel" data-source-pattern="Got"><h2>HTTP Client Snapshot</h2><p>${escapeHtml(input.httpClientReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.httpClientReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.httpClientReadinessReport.httpClientSetups.length}</dd></div><div><dt>requests</dt><dd>${input.httpClientReadinessReport.requestSignals.length}</dd></div><div><dt>resilience</dt><dd>${input.httpClientReadinessReport.resilienceSignals.length}</dd></div><div><dt>errors</dt><dd>${input.httpClientReadinessReport.errorSignals.length}</dd></div></dl><p class="muted">RepoTutor records HTTP client readiness only. It does not make outbound requests, open sockets, mutate caches or cookies, follow redirects, call hooks, or run the analyzed project's tests.</p></section><section class="grid"><article class="http-client-readiness-card"><h3>HTTP Client Setups</h3>${httpClientReadinessSetupList(input.httpClientReadinessReport.httpClientSetups)}</article><article class="http-client-readiness-card"><h3>Request Signals</h3>${httpClientReadinessSignalList(input.httpClientReadinessReport.requestSignals, "signal")}</article><article class="http-client-readiness-card"><h3>Resilience Signals</h3>${httpClientReadinessSignalList(input.httpClientReadinessReport.resilienceSignals, "signal")}</article><article class="http-client-readiness-card"><h3>Configuration Signals</h3>${httpClientReadinessSignalList(input.httpClientReadinessReport.configurationSignals, "signal")}</article></section><section class="grid"><article class="http-client-readiness-card"><h3>Transport Signals</h3>${httpClientReadinessSignalList(input.httpClientReadinessReport.transportSignals, "signal")}</article><article class="http-client-readiness-card"><h3>Error Signals</h3>${httpClientReadinessSignalList(input.httpClientReadinessReport.errorSignals, "signal")}</article><article class="http-client-readiness-card"><h3>Package Signals</h3>${httpClientReadinessSignalList(input.httpClientReadinessReport.packageSignals, "signal")}</article><article class="http-client-readiness-card"><h3>Recommended Commands</h3>${httpClientReadinessCommandList(input.httpClientReadinessReport.recommendedCommands)}</article><article class="http-client-readiness-card"><h3>Risk Queue</h3>${httpClientReadinessRiskList(input.httpClientReadinessReport.riskQueue)}</article><article class="http-client-readiness-card"><h3>다음 확인 단계</h3>${list(input.httpClientReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "schema-validation-readiness.html",
      title: "Schema Validation Readiness",
      html: pageShell("Schema Validation Readiness", "schema-validation-readiness.html", `<section class="panel" data-source-pattern="Zod"><h2>Schema Validation Snapshot</h2><p>${escapeHtml(input.schemaValidationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.schemaValidationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.schemaValidationReadinessReport.schemaSetups.length}</dd></div><div><dt>shapes</dt><dd>${input.schemaValidationReadinessReport.shapeSignals.length}</dd></div><div><dt>parsers</dt><dd>${input.schemaValidationReadinessReport.parserSignals.length}</dd></div><div><dt>errors</dt><dd>${input.schemaValidationReadinessReport.errorSignals.length}</dd></div></dl><p class="muted">RepoTutor records schema validation readiness only. It does not execute schemas, parsers, async refinements, transforms, coercions, user-supplied validation logic, or the analyzed project's tests.</p></section><section class="grid"><article class="schema-validation-readiness-card"><h3>Schema Setups</h3>${schemaValidationReadinessSetupList(input.schemaValidationReadinessReport.schemaSetups)}</article><article class="schema-validation-readiness-card"><h3>Shape Signals</h3>${schemaValidationReadinessSignalList(input.schemaValidationReadinessReport.shapeSignals, "signal")}</article><article class="schema-validation-readiness-card"><h3>Parser Signals</h3>${schemaValidationReadinessSignalList(input.schemaValidationReadinessReport.parserSignals, "signal")}</article><article class="schema-validation-readiness-card"><h3>Type Signals</h3>${schemaValidationReadinessSignalList(input.schemaValidationReadinessReport.typeSignals, "signal")}</article></section><section class="grid"><article class="schema-validation-readiness-card"><h3>Refinement Signals</h3>${schemaValidationReadinessSignalList(input.schemaValidationReadinessReport.refinementSignals, "signal")}</article><article class="schema-validation-readiness-card"><h3>Error Signals</h3>${schemaValidationReadinessSignalList(input.schemaValidationReadinessReport.errorSignals, "signal")}</article><article class="schema-validation-readiness-card"><h3>Integration Signals</h3>${schemaValidationReadinessSignalList(input.schemaValidationReadinessReport.integrationSignals, "signal")}</article><article class="schema-validation-readiness-card"><h3>Package Signals</h3>${schemaValidationReadinessSignalList(input.schemaValidationReadinessReport.packageSignals, "signal")}</article><article class="schema-validation-readiness-card"><h3>Recommended Commands</h3>${schemaValidationReadinessCommandList(input.schemaValidationReadinessReport.recommendedCommands)}</article><article class="schema-validation-readiness-card"><h3>Risk Queue</h3>${schemaValidationReadinessRiskList(input.schemaValidationReadinessReport.riskQueue)}</article><article class="schema-validation-readiness-card"><h3>다음 확인 단계</h3>${list(input.schemaValidationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "datetime-readiness.html",
      title: "Datetime Readiness",
      html: pageShell("Datetime Readiness", "datetime-readiness.html", `<section class="panel" data-source-pattern="Luxon"><h2>Datetime Snapshot</h2><p>${escapeHtml(input.dateTimeReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.dateTimeReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.dateTimeReadinessReport.dateTimeSetups.length}</dd></div><div><dt>parsing</dt><dd>${input.dateTimeReadinessReport.parsingSignals.length}</dd></div><div><dt>zones</dt><dd>${input.dateTimeReadinessReport.zoneSignals.length}</dd></div><div><dt>validity</dt><dd>${input.dateTimeReadinessReport.validitySignals.length}</dd></div></dl><p class="muted">RepoTutor records datetime readiness only. It does not evaluate current time, parse dates, change process timezone, modify Luxon Settings, run timers, or run the analyzed project's tests.</p></section><section class="grid"><article class="datetime-readiness-card"><h3>DateTime Setups</h3>${dateTimeReadinessSetupList(input.dateTimeReadinessReport.dateTimeSetups)}</article><article class="datetime-readiness-card"><h3>Construction Signals</h3>${dateTimeReadinessSignalList(input.dateTimeReadinessReport.constructionSignals, "signal")}</article><article class="datetime-readiness-card"><h3>Parsing Signals</h3>${dateTimeReadinessSignalList(input.dateTimeReadinessReport.parsingSignals, "signal")}</article><article class="datetime-readiness-card"><h3>Formatting Signals</h3>${dateTimeReadinessSignalList(input.dateTimeReadinessReport.formattingSignals, "signal")}</article></section><section class="grid"><article class="datetime-readiness-card"><h3>Zone Signals</h3>${dateTimeReadinessSignalList(input.dateTimeReadinessReport.zoneSignals, "signal")}</article><article class="datetime-readiness-card"><h3>Duration Signals</h3>${dateTimeReadinessSignalList(input.dateTimeReadinessReport.durationSignals, "signal")}</article><article class="datetime-readiness-card"><h3>Validity Signals</h3>${dateTimeReadinessSignalList(input.dateTimeReadinessReport.validitySignals, "signal")}</article><article class="datetime-readiness-card"><h3>Package Signals</h3>${dateTimeReadinessSignalList(input.dateTimeReadinessReport.packageSignals, "signal")}</article><article class="datetime-readiness-card"><h3>Recommended Commands</h3>${dateTimeReadinessCommandList(input.dateTimeReadinessReport.recommendedCommands)}</article><article class="datetime-readiness-card"><h3>Risk Queue</h3>${dateTimeReadinessRiskList(input.dateTimeReadinessReport.riskQueue)}</article><article class="datetime-readiness-card"><h3>다음 확인 단계</h3>${list(input.dateTimeReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "id-generation-readiness.html",
      title: "ID Generation Readiness",
      html: pageShell("ID Generation Readiness", "id-generation-readiness.html", `<section class="panel" data-source-pattern="Nano ID"><h2>ID Generation Snapshot</h2><p>${escapeHtml(input.idGenerationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.idGenerationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.idGenerationReadinessReport.idGeneratorSetups.length}</dd></div><div><dt>generation</dt><dd>${input.idGenerationReadinessReport.generationSignals.length}</dd></div><div><dt>entropy</dt><dd>${input.idGenerationReadinessReport.entropySignals.length}</dd></div><div><dt>usage</dt><dd>${input.idGenerationReadinessReport.usageSignals.length}</dd></div></dl><p class="muted">RepoTutor records ID generation readiness only. It does not generate IDs, call crypto or Math.random, run CLI generators, mutate stores, or run the analyzed project's tests.</p></section><section class="grid"><article class="id-generation-readiness-card"><h3>ID Generator Setups</h3>${idGenerationReadinessSetupList(input.idGenerationReadinessReport.idGeneratorSetups)}</article><article class="id-generation-readiness-card"><h3>Generation Signals</h3>${idGenerationReadinessSignalList(input.idGenerationReadinessReport.generationSignals, "signal")}</article><article class="id-generation-readiness-card"><h3>Entropy Signals</h3>${idGenerationReadinessSignalList(input.idGenerationReadinessReport.entropySignals, "signal")}</article><article class="id-generation-readiness-card"><h3>Alphabet Signals</h3>${idGenerationReadinessSignalList(input.idGenerationReadinessReport.alphabetSignals, "signal")}</article></section><section class="grid"><article class="id-generation-readiness-card"><h3>Runtime Signals</h3>${idGenerationReadinessSignalList(input.idGenerationReadinessReport.runtimeSignals, "signal")}</article><article class="id-generation-readiness-card"><h3>Usage Signals</h3>${idGenerationReadinessSignalList(input.idGenerationReadinessReport.usageSignals, "signal")}</article><article class="id-generation-readiness-card"><h3>Validation Signals</h3>${idGenerationReadinessSignalList(input.idGenerationReadinessReport.validationSignals, "signal")}</article><article class="id-generation-readiness-card"><h3>Package Signals</h3>${idGenerationReadinessSignalList(input.idGenerationReadinessReport.packageSignals, "signal")}</article><article class="id-generation-readiness-card"><h3>Recommended Commands</h3>${idGenerationReadinessCommandList(input.idGenerationReadinessReport.recommendedCommands)}</article><article class="id-generation-readiness-card"><h3>Risk Queue</h3>${idGenerationReadinessRiskList(input.idGenerationReadinessReport.riskQueue)}</article><article class="id-generation-readiness-card"><h3>다음 확인 단계</h3>${list(input.idGenerationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "image-processing-readiness.html",
      title: "Image Processing Readiness",
      html: pageShell("Image Processing Readiness", "image-processing-readiness.html", `<section class="panel" data-source-pattern="Sharp"><h2>Image Processing Snapshot</h2><p>${escapeHtml(input.imageProcessingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.imageProcessingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.imageProcessingReadinessReport.imageProcessingSetups.length}</dd></div><div><dt>inputs</dt><dd>${input.imageProcessingReadinessReport.inputSignals.length}</dd></div><div><dt>transforms</dt><dd>${input.imageProcessingReadinessReport.transformSignals.length}</dd></div><div><dt>safety</dt><dd>${input.imageProcessingReadinessReport.safetySignals.length}</dd></div></dl><p class="muted">RepoTutor records image processing readiness only. It does not decode images, load native binaries, transform pixels, read image metadata, write output files, or run the analyzed project's tests.</p></section><section class="grid"><article class="image-processing-readiness-card"><h3>Image Processing Setups</h3>${imageProcessingReadinessSetupList(input.imageProcessingReadinessReport.imageProcessingSetups)}</article><article class="image-processing-readiness-card"><h3>Input Signals</h3>${imageProcessingReadinessSignalList(input.imageProcessingReadinessReport.inputSignals, "signal")}</article><article class="image-processing-readiness-card"><h3>Transform Signals</h3>${imageProcessingReadinessSignalList(input.imageProcessingReadinessReport.transformSignals, "signal")}</article><article class="image-processing-readiness-card"><h3>Output Signals</h3>${imageProcessingReadinessSignalList(input.imageProcessingReadinessReport.outputSignals, "signal")}</article></section><section class="grid"><article class="image-processing-readiness-card"><h3>Safety Signals</h3>${imageProcessingReadinessSignalList(input.imageProcessingReadinessReport.safetySignals, "signal")}</article><article class="image-processing-readiness-card"><h3>Performance Signals</h3>${imageProcessingReadinessSignalList(input.imageProcessingReadinessReport.performanceSignals, "signal")}</article><article class="image-processing-readiness-card"><h3>Package Signals</h3>${imageProcessingReadinessSignalList(input.imageProcessingReadinessReport.packageSignals, "signal")}</article><article class="image-processing-readiness-card"><h3>Recommended Commands</h3>${imageProcessingReadinessCommandList(input.imageProcessingReadinessReport.recommendedCommands)}</article><article class="image-processing-readiness-card"><h3>Risk Queue</h3>${imageProcessingReadinessRiskList(input.imageProcessingReadinessReport.riskQueue)}</article><article class="image-processing-readiness-card"><h3>다음 확인 단계</h3>${list(input.imageProcessingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "file-upload-readiness.html",
      title: "File Upload Readiness",
      html: pageShell("File Upload Readiness", "file-upload-readiness.html", `<section class="panel" data-source-pattern="Uppy"><h2>File Upload Snapshot</h2><p>${escapeHtml(input.fileUploadReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.fileUploadReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.fileUploadReadinessReport.fileUploadSetups.length}</dd></div><div><dt>inputs</dt><dd>${input.fileUploadReadinessReport.inputSignals.length}</dd></div><div><dt>restrictions</dt><dd>${input.fileUploadReadinessReport.restrictionSignals.length}</dd></div><div><dt>transport</dt><dd>${input.fileUploadReadinessReport.transportSignals.length}</dd></div></dl><p class="muted">RepoTutor records file upload readiness only. It does not select files, open browsers, send uploads, contact Companion, write storage objects, scan content, or run the analyzed project's tests.</p></section><section class="grid"><article class="file-upload-readiness-card"><h3>File Upload Setups</h3>${fileUploadReadinessSetupList(input.fileUploadReadinessReport.fileUploadSetups)}</article><article class="file-upload-readiness-card"><h3>Input Signals</h3>${fileUploadReadinessSignalList(input.fileUploadReadinessReport.inputSignals, "signal")}</article><article class="file-upload-readiness-card"><h3>Restriction Signals</h3>${fileUploadReadinessSignalList(input.fileUploadReadinessReport.restrictionSignals, "signal")}</article><article class="file-upload-readiness-card"><h3>Transport Signals</h3>${fileUploadReadinessSignalList(input.fileUploadReadinessReport.transportSignals, "signal")}</article></section><section class="grid"><article class="file-upload-readiness-card"><h3>Lifecycle Signals</h3>${fileUploadReadinessSignalList(input.fileUploadReadinessReport.lifecycleSignals, "signal")}</article><article class="file-upload-readiness-card"><h3>Safety Signals</h3>${fileUploadReadinessSignalList(input.fileUploadReadinessReport.safetySignals, "signal")}</article><article class="file-upload-readiness-card"><h3>Package Signals</h3>${fileUploadReadinessSignalList(input.fileUploadReadinessReport.packageSignals, "signal")}</article><article class="file-upload-readiness-card"><h3>Recommended Commands</h3>${fileUploadReadinessCommandList(input.fileUploadReadinessReport.recommendedCommands)}</article><article class="file-upload-readiness-card"><h3>Risk Queue</h3>${fileUploadReadinessRiskList(input.fileUploadReadinessReport.riskQueue)}</article><article class="file-upload-readiness-card"><h3>다음 확인 단계</h3>${list(input.fileUploadReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "websocket-readiness.html",
      title: "WebSocket Readiness",
      html: pageShell("WebSocket Readiness", "websocket-readiness.html", `<section class="panel" data-source-pattern="ws"><h2>WebSocket Snapshot</h2><p>${escapeHtml(input.webSocketReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.webSocketReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.webSocketReadinessReport.webSocketSetups.length}</dd></div><div><dt>connections</dt><dd>${input.webSocketReadinessReport.connectionSignals.length}</dd></div><div><dt>messages</dt><dd>${input.webSocketReadinessReport.messageSignals.length}</dd></div><div><dt>lifecycle</dt><dd>${input.webSocketReadinessReport.lifecycleSignals.length}</dd></div></dl><p class="muted">RepoTutor records WebSocket readiness only. It does not open sockets, perform HTTP upgrades, send frames, keep timers, mutate rooms, or run the analyzed project's tests.</p></section><section class="grid"><article class="websocket-readiness-card"><h3>WebSocket Setups</h3>${webSocketReadinessSetupList(input.webSocketReadinessReport.webSocketSetups)}</article><article class="websocket-readiness-card"><h3>Connection Signals</h3>${webSocketReadinessSignalList(input.webSocketReadinessReport.connectionSignals, "signal")}</article><article class="websocket-readiness-card"><h3>Message Signals</h3>${webSocketReadinessSignalList(input.webSocketReadinessReport.messageSignals, "signal")}</article><article class="websocket-readiness-card"><h3>Lifecycle Signals</h3>${webSocketReadinessSignalList(input.webSocketReadinessReport.lifecycleSignals, "signal")}</article></section><section class="grid"><article class="websocket-readiness-card"><h3>Safety Signals</h3>${webSocketReadinessSignalList(input.webSocketReadinessReport.safetySignals, "signal")}</article><article class="websocket-readiness-card"><h3>Package Signals</h3>${webSocketReadinessSignalList(input.webSocketReadinessReport.packageSignals, "signal")}</article><article class="websocket-readiness-card"><h3>Recommended Commands</h3>${webSocketReadinessCommandList(input.webSocketReadinessReport.recommendedCommands)}</article><article class="websocket-readiness-card"><h3>Risk Queue</h3>${webSocketReadinessRiskList(input.webSocketReadinessReport.riskQueue)}</article><article class="websocket-readiness-card"><h3>다음 확인 단계</h3>${list(input.webSocketReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "pdf-generation-readiness.html",
      title: "PDF Generation Readiness",
      html: pageShell("PDF Generation Readiness", "pdf-generation-readiness.html", `<section class="panel" data-source-pattern="pdf-lib"><h2>PDF Generation Snapshot</h2><p>${escapeHtml(input.pdfGenerationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.pdfGenerationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.pdfGenerationReadinessReport.pdfGenerationSetups.length}</dd></div><div><dt>documents</dt><dd>${input.pdfGenerationReadinessReport.documentSignals.length}</dd></div><div><dt>pages</dt><dd>${input.pdfGenerationReadinessReport.pageSignals.length}</dd></div><div><dt>outputs</dt><dd>${input.pdfGenerationReadinessReport.outputSignals.length}</dd></div></dl><p class="muted">RepoTutor records PDF generation readiness only; it does not parse PDFs, render pages, embed fonts/images, modify form fields, write files, trigger downloads, or run the analyzed project's tests.</p></section><section class="grid"><article class="pdf-generation-readiness-card"><h3>PDF Generation Setups</h3>${pdfGenerationReadinessSetupList(input.pdfGenerationReadinessReport.pdfGenerationSetups)}</article><article class="pdf-generation-readiness-card"><h3>Document Signals</h3>${pdfGenerationReadinessSignalList(input.pdfGenerationReadinessReport.documentSignals, "signal")}</article><article class="pdf-generation-readiness-card"><h3>Page Signals</h3>${pdfGenerationReadinessSignalList(input.pdfGenerationReadinessReport.pageSignals, "signal")}</article><article class="pdf-generation-readiness-card"><h3>Asset Signals</h3>${pdfGenerationReadinessSignalList(input.pdfGenerationReadinessReport.assetSignals, "signal")}</article></section><section class="grid"><article class="pdf-generation-readiness-card"><h3>Form Signals</h3>${pdfGenerationReadinessSignalList(input.pdfGenerationReadinessReport.formSignals, "signal")}</article><article class="pdf-generation-readiness-card"><h3>Output Signals</h3>${pdfGenerationReadinessSignalList(input.pdfGenerationReadinessReport.outputSignals, "signal")}</article><article class="pdf-generation-readiness-card"><h3>Safety Signals</h3>${pdfGenerationReadinessSignalList(input.pdfGenerationReadinessReport.safetySignals, "signal")}</article><article class="pdf-generation-readiness-card"><h3>Package Signals</h3>${pdfGenerationReadinessSignalList(input.pdfGenerationReadinessReport.packageSignals, "signal")}</article><article class="pdf-generation-readiness-card"><h3>Recommended Commands</h3>${pdfGenerationReadinessCommandList(input.pdfGenerationReadinessReport.recommendedCommands)}</article><article class="pdf-generation-readiness-card"><h3>Risk Queue</h3>${pdfGenerationReadinessRiskList(input.pdfGenerationReadinessReport.riskQueue)}</article><article class="pdf-generation-readiness-card"><h3>다음 확인 단계</h3>${list(input.pdfGenerationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "spreadsheet-readiness.html",
      title: "Spreadsheet Readiness",
      html: pageShell("Spreadsheet Readiness", "spreadsheet-readiness.html", `<section class="panel" data-source-pattern="SheetJS"><h2>Spreadsheet Snapshot</h2><p>${escapeHtml(input.spreadsheetReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.spreadsheetReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.spreadsheetReadinessReport.spreadsheetSetups.length}</dd></div><div><dt>workbooks</dt><dd>${input.spreadsheetReadinessReport.workbookSignals.length}</dd></div><div><dt>sheets</dt><dd>${input.spreadsheetReadinessReport.sheetSignals.length}</dd></div><div><dt>outputs</dt><dd>${input.spreadsheetReadinessReport.outputSignals.length}</dd></div></dl><p class="muted">RepoTutor records spreadsheet readiness only; it does not open spreadsheet files, parse workbooks, evaluate formulas, convert tables, stream rows, write files, trigger downloads, or run the analyzed project's tests.</p></section><section class="grid"><article class="spreadsheet-readiness-card"><h3>Spreadsheet Setups</h3>${spreadsheetReadinessSetupList(input.spreadsheetReadinessReport.spreadsheetSetups)}</article><article class="spreadsheet-readiness-card"><h3>Workbook Signals</h3>${spreadsheetReadinessSignalList(input.spreadsheetReadinessReport.workbookSignals, "signal")}</article><article class="spreadsheet-readiness-card"><h3>Sheet Signals</h3>${spreadsheetReadinessSignalList(input.spreadsheetReadinessReport.sheetSignals, "signal")}</article><article class="spreadsheet-readiness-card"><h3>Format Signals</h3>${spreadsheetReadinessSignalList(input.spreadsheetReadinessReport.formatSignals, "signal")}</article></section><section class="grid"><article class="spreadsheet-readiness-card"><h3>Input Signals</h3>${spreadsheetReadinessSignalList(input.spreadsheetReadinessReport.inputSignals, "signal")}</article><article class="spreadsheet-readiness-card"><h3>Output Signals</h3>${spreadsheetReadinessSignalList(input.spreadsheetReadinessReport.outputSignals, "signal")}</article><article class="spreadsheet-readiness-card"><h3>Safety Signals</h3>${spreadsheetReadinessSignalList(input.spreadsheetReadinessReport.safetySignals, "signal")}</article><article class="spreadsheet-readiness-card"><h3>Package Signals</h3>${spreadsheetReadinessSignalList(input.spreadsheetReadinessReport.packageSignals, "signal")}</article><article class="spreadsheet-readiness-card"><h3>Recommended Commands</h3>${spreadsheetReadinessCommandList(input.spreadsheetReadinessReport.recommendedCommands)}</article><article class="spreadsheet-readiness-card"><h3>Risk Queue</h3>${spreadsheetReadinessRiskList(input.spreadsheetReadinessReport.riskQueue)}</article><article class="spreadsheet-readiness-card"><h3>다음 확인 단계</h3>${list(input.spreadsheetReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "chart-visualization-readiness.html",
      title: "Chart Visualization Readiness",
      html: pageShell("Chart Visualization Readiness", "chart-visualization-readiness.html", `<section class="panel" data-source-pattern="Chart.js"><h2>Chart Visualization Snapshot</h2><p>${escapeHtml(input.chartVisualizationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.chartVisualizationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.chartVisualizationReadinessReport.chartSetups.length}</dd></div><div><dt>types</dt><dd>${input.chartVisualizationReadinessReport.chartTypeSignals.length}</dd></div><div><dt>data</dt><dd>${input.chartVisualizationReadinessReport.dataSignals.length}</dd></div><div><dt>render</dt><dd>${input.chartVisualizationReadinessReport.renderSignals.length}</dd></div></dl><p class="muted">RepoTutor records chart visualization readiness only; it does not render charts, open canvases, measure pixels, execute plugins, export images, mutate DOM, or run the analyzed project's tests.</p></section><section class="grid"><article class="chart-visualization-readiness-card"><h3>Chart Setups</h3>${chartVisualizationReadinessSetupList(input.chartVisualizationReadinessReport.chartSetups)}</article><article class="chart-visualization-readiness-card"><h3>Chart Type Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.chartTypeSignals, "signal")}</article><article class="chart-visualization-readiness-card"><h3>Data Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.dataSignals, "signal")}</article><article class="chart-visualization-readiness-card"><h3>Scale Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.scaleSignals, "signal")}</article></section><section class="grid"><article class="chart-visualization-readiness-card"><h3>Interaction Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.interactionSignals, "signal")}</article><article class="chart-visualization-readiness-card"><h3>Render Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.renderSignals, "signal")}</article><article class="chart-visualization-readiness-card"><h3>Lifecycle Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.lifecycleSignals, "signal")}</article><article class="chart-visualization-readiness-card"><h3>Safety Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.safetySignals, "signal")}</article><article class="chart-visualization-readiness-card"><h3>Package Signals</h3>${chartVisualizationReadinessSignalList(input.chartVisualizationReadinessReport.packageSignals, "signal")}</article><article class="chart-visualization-readiness-card"><h3>Recommended Commands</h3>${chartVisualizationReadinessCommandList(input.chartVisualizationReadinessReport.recommendedCommands)}</article><article class="chart-visualization-readiness-card"><h3>Risk Queue</h3>${chartVisualizationReadinessRiskList(input.chartVisualizationReadinessReport.riskQueue)}</article><article class="chart-visualization-readiness-card"><h3>다음 확인 단계</h3>${list(input.chartVisualizationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "diagram-rendering-readiness.html",
      title: "Diagram Rendering Readiness",
      html: pageShell("Diagram Rendering Readiness", "diagram-rendering-readiness.html", `<section class="panel" data-source-pattern="Mermaid"><h2>Diagram Rendering Snapshot</h2><p>${escapeHtml(input.diagramRenderingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.diagramRenderingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.diagramRenderingReadinessReport.diagramSetups.length}</dd></div><div><dt>types</dt><dd>${input.diagramRenderingReadinessReport.diagramTypeSignals.length}</dd></div><div><dt>render</dt><dd>${input.diagramRenderingReadinessReport.renderSignals.length}</dd></div><div><dt>security</dt><dd>${input.diagramRenderingReadinessReport.securitySignals.length}</dd></div></dl><p class="muted">RepoTutor records diagram rendering readiness only; it does not render Mermaid diagrams, execute diagram callbacks, open sandboxed iframes, sanitize user text, mutate SVG, export images, or run the analyzed project's tests.</p></section><section class="grid"><article class="diagram-rendering-readiness-card"><h3>Diagram Setups</h3>${diagramRenderingReadinessSetupList(input.diagramRenderingReadinessReport.diagramSetups)}</article><article class="diagram-rendering-readiness-card"><h3>Diagram Type Signals</h3>${diagramRenderingReadinessSignalList(input.diagramRenderingReadinessReport.diagramTypeSignals, "signal")}</article><article class="diagram-rendering-readiness-card"><h3>Render Signals</h3>${diagramRenderingReadinessSignalList(input.diagramRenderingReadinessReport.renderSignals, "signal")}</article><article class="diagram-rendering-readiness-card"><h3>Theme Signals</h3>${diagramRenderingReadinessSignalList(input.diagramRenderingReadinessReport.themeSignals, "signal")}</article></section><section class="grid"><article class="diagram-rendering-readiness-card"><h3>Security Signals</h3>${diagramRenderingReadinessSignalList(input.diagramRenderingReadinessReport.securitySignals, "signal")}</article><article class="diagram-rendering-readiness-card"><h3>Layout Signals</h3>${diagramRenderingReadinessSignalList(input.diagramRenderingReadinessReport.layoutSignals, "signal")}</article><article class="diagram-rendering-readiness-card"><h3>Output Signals</h3>${diagramRenderingReadinessSignalList(input.diagramRenderingReadinessReport.outputSignals, "signal")}</article><article class="diagram-rendering-readiness-card"><h3>Package Signals</h3>${diagramRenderingReadinessSignalList(input.diagramRenderingReadinessReport.packageSignals, "signal")}</article><article class="diagram-rendering-readiness-card"><h3>Recommended Commands</h3>${diagramRenderingReadinessCommandList(input.diagramRenderingReadinessReport.recommendedCommands)}</article><article class="diagram-rendering-readiness-card"><h3>Risk Queue</h3>${diagramRenderingReadinessRiskList(input.diagramRenderingReadinessReport.riskQueue)}</article><article class="diagram-rendering-readiness-card"><h3>다음 확인 단계</h3>${list(input.diagramRenderingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "link-integrity-readiness.html",
      title: "Link Integrity Readiness",
      html: pageShell("Link Integrity Readiness", "link-integrity-readiness.html", `<section class="panel" data-source-pattern="Lychee"><h2>Link Integrity Snapshot</h2><p>${escapeHtml(input.linkIntegrityReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.linkIntegrityReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.linkIntegrityReadinessReport.linkSetups.length}</dd></div><div><dt>targets</dt><dd>${input.linkIntegrityReadinessReport.targetSignals.length}</dd></div><div><dt>policy</dt><dd>${input.linkIntegrityReadinessReport.policySignals.length}</dd></div><div><dt>network</dt><dd>${input.linkIntegrityReadinessReport.networkSignals.length}</dd></div></dl><p class="muted">RepoTutor records link integrity readiness only; it does not crawl websites, open URLs, send mail checks, use credentials, contact external hosts, mutate reports, or run the analyzed project's tests.</p></section><section class="grid"><article class="link-integrity-readiness-card"><h3>Link Setups</h3>${linkIntegrityReadinessSetupList(input.linkIntegrityReadinessReport.linkSetups)}</article><article class="link-integrity-readiness-card"><h3>Target Signals</h3>${linkIntegrityReadinessSignalList(input.linkIntegrityReadinessReport.targetSignals, "signal")}</article><article class="link-integrity-readiness-card"><h3>Policy Signals</h3>${linkIntegrityReadinessSignalList(input.linkIntegrityReadinessReport.policySignals, "signal")}</article><article class="link-integrity-readiness-card"><h3>Network Signals</h3>${linkIntegrityReadinessSignalList(input.linkIntegrityReadinessReport.networkSignals, "signal")}</article></section><section class="grid"><article class="link-integrity-readiness-card"><h3>Output Signals</h3>${linkIntegrityReadinessSignalList(input.linkIntegrityReadinessReport.outputSignals, "signal")}</article><article class="link-integrity-readiness-card"><h3>CI Signals</h3>${linkIntegrityReadinessSignalList(input.linkIntegrityReadinessReport.ciSignals, "signal")}</article><article class="link-integrity-readiness-card"><h3>Package Signals</h3>${linkIntegrityReadinessSignalList(input.linkIntegrityReadinessReport.packageSignals, "signal")}</article><article class="link-integrity-readiness-card"><h3>Recommended Commands</h3>${linkIntegrityReadinessCommandList(input.linkIntegrityReadinessReport.recommendedCommands)}</article><article class="link-integrity-readiness-card"><h3>Risk Queue</h3>${linkIntegrityReadinessRiskList(input.linkIntegrityReadinessReport.riskQueue)}</article><article class="link-integrity-readiness-card"><h3>다음 확인 단계</h3>${list(input.linkIntegrityReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "seo-metadata-readiness.html",
      title: "SEO Metadata Readiness",
      html: pageShell("SEO Metadata Readiness", "seo-metadata-readiness.html", `<section class="panel" data-source-pattern="Nuxt SEO"><h2>SEO Metadata Snapshot</h2><p>${escapeHtml(input.seoMetadataReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.seoMetadataReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.seoMetadataReadinessReport.seoSetups.length}</dd></div><div><dt>crawl</dt><dd>${input.seoMetadataReadinessReport.crawlSignals.length}</dd></div><div><dt>sitemap</dt><dd>${input.seoMetadataReadinessReport.sitemapSignals.length}</dd></div><div><dt>metadata</dt><dd>${input.seoMetadataReadinessReport.metadataSignals.length}</dd></div></dl><p class="muted">RepoTutor records SEO metadata readiness only; it does not crawl websites, render pages, fetch robots.txt, validate sitemap XML, query search engines, execute Nuxt modules, or run the analyzed project's tests.</p></section><section class="grid"><article class="seo-metadata-readiness-card"><h3>SEO Setups</h3>${seoMetadataReadinessSetupList(input.seoMetadataReadinessReport.seoSetups)}</article><article class="seo-metadata-readiness-card"><h3>Crawl Signals</h3>${seoMetadataReadinessSignalList(input.seoMetadataReadinessReport.crawlSignals, "signal")}</article><article class="seo-metadata-readiness-card"><h3>Sitemap Signals</h3>${seoMetadataReadinessSignalList(input.seoMetadataReadinessReport.sitemapSignals, "signal")}</article><article class="seo-metadata-readiness-card"><h3>Metadata Signals</h3>${seoMetadataReadinessSignalList(input.seoMetadataReadinessReport.metadataSignals, "signal")}</article></section><section class="grid"><article class="seo-metadata-readiness-card"><h3>Structured Data Signals</h3>${seoMetadataReadinessSignalList(input.seoMetadataReadinessReport.structuredDataSignals, "signal")}</article><article class="seo-metadata-readiness-card"><h3>AI Readiness Signals</h3>${seoMetadataReadinessSignalList(input.seoMetadataReadinessReport.aiReadinessSignals, "signal")}</article><article class="seo-metadata-readiness-card"><h3>Package Signals</h3>${seoMetadataReadinessSignalList(input.seoMetadataReadinessReport.packageSignals, "signal")}</article><article class="seo-metadata-readiness-card"><h3>Recommended Commands</h3>${seoMetadataReadinessCommandList(input.seoMetadataReadinessReport.recommendedCommands)}</article><article class="seo-metadata-readiness-card"><h3>Risk Queue</h3>${seoMetadataReadinessRiskList(input.seoMetadataReadinessReport.riskQueue)}</article><article class="seo-metadata-readiness-card"><h3>다음 확인 단계</h3>${list(input.seoMetadataReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "pwa-readiness.html",
      title: "PWA Readiness",
      html: pageShell("PWA Readiness", "pwa-readiness.html", `<section class="panel" data-source-pattern="Vite PWA"><h2>PWA Snapshot</h2><p>${escapeHtml(input.pwaReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.pwaReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.pwaReadinessReport.pwaSetups.length}</dd></div><div><dt>manifest</dt><dd>${input.pwaReadinessReport.manifestSignals.length}</dd></div><div><dt>service worker</dt><dd>${input.pwaReadinessReport.serviceWorkerSignals.length}</dd></div><div><dt>caching</dt><dd>${input.pwaReadinessReport.cachingSignals.length}</dd></div></dl><p class="muted">RepoTutor records PWA readiness only; it does not register service workers, open browsers, populate Cache Storage, fetch manifests, test offline mode, trigger install prompts, or run the analyzed project's tests.</p></section><section class="grid"><article class="pwa-readiness-card"><h3>PWA Setups</h3>${pwaReadinessSetupList(input.pwaReadinessReport.pwaSetups)}</article><article class="pwa-readiness-card"><h3>Manifest Signals</h3>${pwaReadinessSignalList(input.pwaReadinessReport.manifestSignals, "signal")}</article><article class="pwa-readiness-card"><h3>Service Worker Signals</h3>${pwaReadinessSignalList(input.pwaReadinessReport.serviceWorkerSignals, "signal")}</article><article class="pwa-readiness-card"><h3>Caching Signals</h3>${pwaReadinessSignalList(input.pwaReadinessReport.cachingSignals, "signal")}</article></section><section class="grid"><article class="pwa-readiness-card"><h3>Update Signals</h3>${pwaReadinessSignalList(input.pwaReadinessReport.updateSignals, "signal")}</article><article class="pwa-readiness-card"><h3>Install Signals</h3>${pwaReadinessSignalList(input.pwaReadinessReport.installSignals, "signal")}</article><article class="pwa-readiness-card"><h3>Package Signals</h3>${pwaReadinessSignalList(input.pwaReadinessReport.packageSignals, "signal")}</article><article class="pwa-readiness-card"><h3>Recommended Commands</h3>${pwaReadinessCommandList(input.pwaReadinessReport.recommendedCommands)}</article><article class="pwa-readiness-card"><h3>Risk Queue</h3>${pwaReadinessRiskList(input.pwaReadinessReport.riskQueue)}</article><article class="pwa-readiness-card"><h3>다음 확인 단계</h3>${list(input.pwaReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "browser-compat-readiness.html",
      title: "Browser Compatibility Readiness",
      html: pageShell("Browser Compatibility Readiness", "browser-compat-readiness.html", `<section class="panel" data-source-pattern="Browserslist"><h2>Browser Compatibility Snapshot</h2><p>${escapeHtml(input.browserCompatibilityReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.browserCompatibilityReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.browserCompatibilityReadinessReport.compatibilitySetups.length}</dd></div><div><dt>config</dt><dd>${input.browserCompatibilityReadinessReport.configSignals.length}</dd></div><div><dt>queries</dt><dd>${input.browserCompatibilityReadinessReport.querySignals.length}</dd></div><div><dt>coverage</dt><dd>${input.browserCompatibilityReadinessReport.coverageSignals.length}</dd></div></dl><p class="muted">RepoTutor records browser compatibility readiness only; it does not resolve Browserslist queries, update caniuse-lite, run Babel, run Autoprefixer, execute browser tests, or contact external services.</p></section><section class="grid"><article class="browser-compat-readiness-card"><h3>Compatibility Setups</h3>${browserCompatibilityReadinessSetupList(input.browserCompatibilityReadinessReport.compatibilitySetups)}</article><article class="browser-compat-readiness-card"><h3>Config Signals</h3>${browserCompatibilityReadinessSignalList(input.browserCompatibilityReadinessReport.configSignals, "signal")}</article><article class="browser-compat-readiness-card"><h3>Query Signals</h3>${browserCompatibilityReadinessSignalList(input.browserCompatibilityReadinessReport.querySignals, "signal")}</article><article class="browser-compat-readiness-card"><h3>Coverage Signals</h3>${browserCompatibilityReadinessSignalList(input.browserCompatibilityReadinessReport.coverageSignals, "signal")}</article></section><section class="grid"><article class="browser-compat-readiness-card"><h3>Feature Signals</h3>${browserCompatibilityReadinessSignalList(input.browserCompatibilityReadinessReport.featureSignals, "signal")}</article><article class="browser-compat-readiness-card"><h3>Update Signals</h3>${browserCompatibilityReadinessSignalList(input.browserCompatibilityReadinessReport.updateSignals, "signal")}</article><article class="browser-compat-readiness-card"><h3>Package Signals</h3>${browserCompatibilityReadinessSignalList(input.browserCompatibilityReadinessReport.packageSignals, "signal")}</article><article class="browser-compat-readiness-card"><h3>Recommended Commands</h3>${browserCompatibilityReadinessCommandList(input.browserCompatibilityReadinessReport.recommendedCommands)}</article><article class="browser-compat-readiness-card"><h3>Risk Queue</h3>${browserCompatibilityReadinessRiskList(input.browserCompatibilityReadinessReport.riskQueue)}</article><article class="browser-compat-readiness-card"><h3>다음 확인 단계</h3>${list(input.browserCompatibilityReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "browser-extension-readiness.html",
      title: "Browser Extension Readiness",
      html: pageShell("Browser Extension Readiness", "browser-extension-readiness.html", `<section class="panel" data-source-pattern="WXT"><h2>Browser Extension Snapshot</h2><p>${escapeHtml(input.browserExtensionReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.browserExtensionReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.browserExtensionReadinessReport.extensionSetups.length}</dd></div><div><dt>manifest</dt><dd>${input.browserExtensionReadinessReport.manifestSignals.length}</dd></div><div><dt>entrypoints</dt><dd>${input.browserExtensionReadinessReport.entrypointSignals.length}</dd></div><div><dt>permissions</dt><dd>${input.browserExtensionReadinessReport.permissionSignals.length}</dd></div><div><dt>messaging</dt><dd>${input.browserExtensionReadinessReport.messagingSignals.length}</dd></div><div><dt>publish</dt><dd>${input.browserExtensionReadinessReport.publishSignals.length}</dd></div></dl><p class="muted">RepoTutor records browser extension readiness only; it does not run WXT, Plasmo, CRXJS, Vite, web-ext, browser launchers, store upload, signing, or extension tests.</p></section><section class="grid"><article class="browser-extension-readiness-card"><h3>Extension Setups</h3>${browserExtensionReadinessSetupList(input.browserExtensionReadinessReport.extensionSetups)}</article><article class="browser-extension-readiness-card"><h3>Manifest Signals</h3>${browserExtensionReadinessSignalList(input.browserExtensionReadinessReport.manifestSignals, "signal")}</article><article class="browser-extension-readiness-card"><h3>Entrypoint Signals</h3>${browserExtensionReadinessSignalList(input.browserExtensionReadinessReport.entrypointSignals, "signal")}</article><article class="browser-extension-readiness-card"><h3>Permission Signals</h3>${browserExtensionReadinessSignalList(input.browserExtensionReadinessReport.permissionSignals, "signal")}</article></section><section class="grid"><article class="browser-extension-readiness-card"><h3>Messaging Signals</h3>${browserExtensionReadinessSignalList(input.browserExtensionReadinessReport.messagingSignals, "signal")}</article><article class="browser-extension-readiness-card"><h3>Build Signals</h3>${browserExtensionReadinessSignalList(input.browserExtensionReadinessReport.buildSignals, "signal")}</article><article class="browser-extension-readiness-card"><h3>Publish Signals</h3>${browserExtensionReadinessSignalList(input.browserExtensionReadinessReport.publishSignals, "signal")}</article><article class="browser-extension-readiness-card"><h3>Package Signals</h3>${browserExtensionReadinessSignalList(input.browserExtensionReadinessReport.packageSignals, "signal")}</article><article class="browser-extension-readiness-card"><h3>Recommended Commands</h3>${browserExtensionReadinessCommandList(input.browserExtensionReadinessReport.recommendedCommands)}</article><article class="browser-extension-readiness-card"><h3>Risk Queue</h3>${browserExtensionReadinessRiskList(input.browserExtensionReadinessReport.riskQueue)}</article><article class="browser-extension-readiness-card"><h3>다음 확인 단계</h3>${list(input.browserExtensionReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "env-validation-readiness.html",
      title: "Env Validation Readiness",
      html: pageShell("Env Validation Readiness", "env-validation-readiness.html", `<section class="panel" data-source-pattern="t3-env"><h2>Env Validation Snapshot</h2><p>${escapeHtml(input.envValidationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.envValidationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.envValidationReadinessReport.envSetups.length}</dd></div><div><dt>schema</dt><dd>${input.envValidationReadinessReport.schemaSignals.length}</dd></div><div><dt>runtime</dt><dd>${input.envValidationReadinessReport.runtimeSignals.length}</dd></div><div><dt>boundary</dt><dd>${input.envValidationReadinessReport.boundarySignals.length}</dd></div></dl><p class="muted">RepoTutor records env validation readiness only; it does not load .env files, execute validators, evaluate transforms, contact secret stores, or run the analyzed project's tests.</p></section><section class="grid"><article class="env-validation-readiness-card"><h3>Env Setups</h3>${envValidationReadinessSetupList(input.envValidationReadinessReport.envSetups)}</article><article class="env-validation-readiness-card"><h3>Schema Signals</h3>${envValidationReadinessSignalList(input.envValidationReadinessReport.schemaSignals, "signal")}</article><article class="env-validation-readiness-card"><h3>Runtime Signals</h3>${envValidationReadinessSignalList(input.envValidationReadinessReport.runtimeSignals, "signal")}</article><article class="env-validation-readiness-card"><h3>Boundary Signals</h3>${envValidationReadinessSignalList(input.envValidationReadinessReport.boundarySignals, "signal")}</article></section><section class="grid"><article class="env-validation-readiness-card"><h3>Validation Signals</h3>${envValidationReadinessSignalList(input.envValidationReadinessReport.validationSignals, "signal")}</article><article class="env-validation-readiness-card"><h3>Documentation Signals</h3>${envValidationReadinessSignalList(input.envValidationReadinessReport.documentationSignals, "signal")}</article><article class="env-validation-readiness-card"><h3>Package Signals</h3>${envValidationReadinessSignalList(input.envValidationReadinessReport.packageSignals, "signal")}</article><article class="env-validation-readiness-card"><h3>Recommended Commands</h3>${envValidationReadinessCommandList(input.envValidationReadinessReport.recommendedCommands)}</article><article class="env-validation-readiness-card"><h3>Risk Queue</h3>${envValidationReadinessRiskList(input.envValidationReadinessReport.riskQueue)}</article><article class="env-validation-readiness-card"><h3>다음 확인 단계</h3>${list(input.envValidationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "security-headers-readiness.html",
      title: "Security Headers Readiness",
      html: pageShell("Security Headers Readiness", "security-headers-readiness.html", `<section class="panel" data-source-pattern="Helmet"><h2>Security Headers Snapshot</h2><p>${escapeHtml(input.securityHeadersReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.securityHeadersReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.securityHeadersReadinessReport.headerSetups.length}</dd></div><div><dt>CSP</dt><dd>${input.securityHeadersReadinessReport.cspSignals.length}</dd></div><div><dt>transport</dt><dd>${input.securityHeadersReadinessReport.transportSignals.length}</dd></div><div><dt>cross-origin</dt><dd>${input.securityHeadersReadinessReport.crossOriginSignals.length}</dd></div></dl><p class="muted">RepoTutor records security header readiness only; it does not start servers, send HTTP requests, evaluate CSP, follow redirects, or inspect CDN/proxy behavior.</p></section><section class="grid"><article class="security-headers-readiness-card"><h3>Header Setups</h3>${securityHeadersReadinessSetupList(input.securityHeadersReadinessReport.headerSetups)}</article><article class="security-headers-readiness-card"><h3>CSP Signals</h3>${securityHeadersReadinessSignalList(input.securityHeadersReadinessReport.cspSignals, "signal")}</article><article class="security-headers-readiness-card"><h3>Transport Signals</h3>${securityHeadersReadinessSignalList(input.securityHeadersReadinessReport.transportSignals, "signal")}</article><article class="security-headers-readiness-card"><h3>Cross-Origin Signals</h3>${securityHeadersReadinessSignalList(input.securityHeadersReadinessReport.crossOriginSignals, "signal")}</article></section><section class="grid"><article class="security-headers-readiness-card"><h3>Legacy Header Signals</h3>${securityHeadersReadinessSignalList(input.securityHeadersReadinessReport.legacyHeaderSignals, "signal")}</article><article class="security-headers-readiness-card"><h3>Middleware Signals</h3>${securityHeadersReadinessSignalList(input.securityHeadersReadinessReport.middlewareSignals, "signal")}</article><article class="security-headers-readiness-card"><h3>Package Signals</h3>${securityHeadersReadinessSignalList(input.securityHeadersReadinessReport.packageSignals, "signal")}</article><article class="security-headers-readiness-card"><h3>Recommended Commands</h3>${securityHeadersReadinessCommandList(input.securityHeadersReadinessReport.recommendedCommands)}</article><article class="security-headers-readiness-card"><h3>Risk Queue</h3>${securityHeadersReadinessRiskList(input.securityHeadersReadinessReport.riskQueue)}</article><article class="security-headers-readiness-card"><h3>다음 확인 단계</h3>${list(input.securityHeadersReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "graphql-readiness.html",
      title: "GraphQL Readiness",
      html: pageShell("GraphQL Readiness", "graphql-readiness.html", `<section class="panel" data-source-pattern="GraphQL.js"><h2>GraphQL Snapshot</h2><p>${escapeHtml(input.graphqlReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.graphqlReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.graphqlReadinessReport.graphqlSetups.length}</dd></div><div><dt>schema</dt><dd>${input.graphqlReadinessReport.schemaSignals.length}</dd></div><div><dt>operations</dt><dd>${input.graphqlReadinessReport.operationSignals.length}</dd></div><div><dt>validation</dt><dd>${input.graphqlReadinessReport.validationSignals.length}</dd></div></dl><p class="muted">RepoTutor records GraphQL readiness only; it does not execute operations, start servers, introspect remote schemas, validate authorization, or benchmark resolver performance.</p></section><section class="grid"><article class="graphql-readiness-card"><h3>GraphQL Setups</h3>${graphqlReadinessSetupList(input.graphqlReadinessReport.graphqlSetups)}</article><article class="graphql-readiness-card"><h3>Schema Signals</h3>${graphqlReadinessSignalList(input.graphqlReadinessReport.schemaSignals, "signal")}</article><article class="graphql-readiness-card"><h3>Operation Signals</h3>${graphqlReadinessSignalList(input.graphqlReadinessReport.operationSignals, "signal")}</article><article class="graphql-readiness-card"><h3>Resolver Signals</h3>${graphqlReadinessSignalList(input.graphqlReadinessReport.resolverSignals, "signal")}</article></section><section class="grid"><article class="graphql-readiness-card"><h3>Validation Signals</h3>${graphqlReadinessSignalList(input.graphqlReadinessReport.validationSignals, "signal")}</article><article class="graphql-readiness-card"><h3>Execution Signals</h3>${graphqlReadinessSignalList(input.graphqlReadinessReport.executionSignals, "signal")}</article><article class="graphql-readiness-card"><h3>Client Signals</h3>${graphqlReadinessSignalList(input.graphqlReadinessReport.clientSignals, "signal")}</article><article class="graphql-readiness-card"><h3>Codegen Signals</h3>${graphqlReadinessSignalList(input.graphqlReadinessReport.codegenSignals, "signal")}</article><article class="graphql-readiness-card"><h3>Recommended Commands</h3>${graphqlReadinessCommandList(input.graphqlReadinessReport.recommendedCommands)}</article><article class="graphql-readiness-card"><h3>Risk Queue</h3>${graphqlReadinessRiskList(input.graphqlReadinessReport.riskQueue)}</article><article class="graphql-readiness-card"><h3>다음 확인 단계</h3>${list(input.graphqlReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "cli-readiness.html",
      title: "CLI Readiness",
      html: pageShell("CLI Readiness", "cli-readiness.html", `<section class="panel" data-source-pattern="Commander.js"><h2>CLI Snapshot</h2><p>${escapeHtml(input.cliReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.cliReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.cliReadinessReport.cliSetups.length}</dd></div><div><dt>commands</dt><dd>${input.cliReadinessReport.commandSignals.length}</dd></div><div><dt>options</dt><dd>${input.cliReadinessReport.optionSignals.length}</dd></div><div><dt>help</dt><dd>${input.cliReadinessReport.helpSignals.length}</dd></div></dl><p class="muted">RepoTutor records CLI readiness only; it does not invoke CLI binaries, parse real argv, spawn subcommands, inspect completions, or verify terminal TTY behavior.</p></section><section class="grid"><article class="cli-readiness-card"><h3>CLI Setups</h3>${cliReadinessSetupList(input.cliReadinessReport.cliSetups)}</article><article class="cli-readiness-card"><h3>Command Signals</h3>${cliReadinessSignalList(input.cliReadinessReport.commandSignals, "signal")}</article><article class="cli-readiness-card"><h3>Option Signals</h3>${cliReadinessSignalList(input.cliReadinessReport.optionSignals, "signal")}</article><article class="cli-readiness-card"><h3>Parse Signals</h3>${cliReadinessSignalList(input.cliReadinessReport.parseSignals, "signal")}</article></section><section class="grid"><article class="cli-readiness-card"><h3>Action Signals</h3>${cliReadinessSignalList(input.cliReadinessReport.actionSignals, "signal")}</article><article class="cli-readiness-card"><h3>Help Signals</h3>${cliReadinessSignalList(input.cliReadinessReport.helpSignals, "signal")}</article><article class="cli-readiness-card"><h3>Error Signals</h3>${cliReadinessSignalList(input.cliReadinessReport.errorSignals, "signal")}</article><article class="cli-readiness-card"><h3>Package Signals</h3>${cliReadinessSignalList(input.cliReadinessReport.packageSignals, "signal")}</article><article class="cli-readiness-card"><h3>Recommended Commands</h3>${cliReadinessCommandList(input.cliReadinessReport.recommendedCommands)}</article><article class="cli-readiness-card"><h3>Risk Queue</h3>${cliReadinessRiskList(input.cliReadinessReport.riskQueue)}</article><article class="cli-readiness-card"><h3>다음 확인 단계</h3>${list(input.cliReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "llm-readiness.html",
      title: "LLM Readiness",
      html: pageShell("LLM Readiness", "llm-readiness.html", `<section class="panel" data-source-pattern="LangChain.js"><h2>LLM Snapshot</h2><p>${escapeHtml(input.llmReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.llmReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.llmReadinessReport.llmSetups.length}</dd></div><div><dt>models</dt><dd>${input.llmReadinessReport.modelSignals.length}</dd></div><div><dt>prompts</dt><dd>${input.llmReadinessReport.promptSignals.length}</dd></div><div><dt>tools</dt><dd>${input.llmReadinessReport.toolSignals.length}</dd></div></dl><p class="muted">RepoTutor records LLM readiness only; it does not call providers, stream tokens, run agents, fetch vector stores, evaluate prompts, or inspect live traces.</p></section><section class="grid"><article class="llm-readiness-card"><h3>LLM Setups</h3>${llmReadinessSetupList(input.llmReadinessReport.llmSetups)}</article><article class="llm-readiness-card"><h3>Model Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.modelSignals, "signal")}</article><article class="llm-readiness-card"><h3>Prompt Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.promptSignals, "signal")}</article><article class="llm-readiness-card"><h3>Tool Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.toolSignals, "signal")}</article></section><section class="grid"><article class="llm-readiness-card"><h3>Retrieval Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.retrievalSignals, "signal")}</article><article class="llm-readiness-card"><h3>Structured Output Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.structuredOutputSignals, "signal")}</article><article class="llm-readiness-card"><h3>Streaming Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.streamingSignals, "signal")}</article><article class="llm-readiness-card"><h3>Safety Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.safetySignals, "signal")}</article><article class="llm-readiness-card"><h3>Package Signals</h3>${llmReadinessSignalList(input.llmReadinessReport.packageSignals, "signal")}</article><article class="llm-readiness-card"><h3>Recommended Commands</h3>${llmReadinessCommandList(input.llmReadinessReport.recommendedCommands)}</article><article class="llm-readiness-card"><h3>Risk Queue</h3>${llmReadinessRiskList(input.llmReadinessReport.riskQueue)}</article><article class="llm-readiness-card"><h3>다음 확인 단계</h3>${list(input.llmReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "llm-eval-readiness.html",
      title: "LLM Eval Readiness",
      html: pageShell("LLM Eval Readiness", "llm-eval-readiness.html", `<section class="panel" data-source-pattern="LLM Eval"><h2>LLM Eval Snapshot</h2><p>${escapeHtml(input.llmEvalReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.llmEvalReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.llmEvalReadinessReport.evalSetups.length}</dd></div><div><dt>tests</dt><dd>${input.llmEvalReadinessReport.testCaseSignals.length}</dd></div><div><dt>judges</dt><dd>${input.llmEvalReadinessReport.judgeSignals.length}</dd></div><div><dt>red-team</dt><dd>${input.llmEvalReadinessReport.redteamSignals.length}</dd></div><div><dt>datasets</dt><dd>${input.llmEvalReadinessReport.datasetSignals.length}</dd></div></dl><p class="muted">RepoTutor records LLM eval readiness only; it does not call providers, run judge models, generate red-team probes, execute datasets, calculate scores, upload reports, or run the analyzed project's tests.</p></section><section class="grid"><article class="llm-eval-readiness-card"><h3>Eval Setups</h3>${llmEvalReadinessSetupList(input.llmEvalReadinessReport.evalSetups)}</article><article class="llm-eval-readiness-card"><h3>Config Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.configSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Prompt Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.promptSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Provider Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.providerSignals, "signal")}</article></section><section class="grid"><article class="llm-eval-readiness-card"><h3>Test Case Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.testCaseSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Judge Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.judgeSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Dataset Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.datasetSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Red-Team Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.redteamSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Workflow Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.workflowSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Package Signals</h3>${llmEvalReadinessSignalList(input.llmEvalReadinessReport.packageSignals, "signal")}</article><article class="llm-eval-readiness-card"><h3>Recommended Commands</h3>${llmEvalReadinessCommandList(input.llmEvalReadinessReport.recommendedCommands)}</article><article class="llm-eval-readiness-card"><h3>Risk Queue</h3>${llmEvalReadinessRiskList(input.llmEvalReadinessReport.riskQueue)}</article><article class="llm-eval-readiness-card"><h3>다음 확인 단계</h3>${list(input.llmEvalReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "llm-observability-readiness.html",
      title: "LLM Observability Readiness",
      html: pageShell("LLM Observability Readiness", "llm-observability-readiness.html", `<section class="panel" data-source-pattern="LLM Observability"><h2>LLM Observability Snapshot</h2><p>${escapeHtml(input.llmObservabilityReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.llmObservabilityReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.llmObservabilityReadinessReport.observabilitySetups.length}</dd></div><div><dt>traces</dt><dd>${input.llmObservabilityReadinessReport.traceSignals.length}</dd></div><div><dt>identity</dt><dd>${input.llmObservabilityReadinessReport.identitySignals.length}</dd></div><div><dt>metrics</dt><dd>${input.llmObservabilityReadinessReport.llmMetricSignals.length}</dd></div><div><dt>feedback</dt><dd>${input.llmObservabilityReadinessReport.feedbackSignals.length}</dd></div></dl><p class="muted">RepoTutor records LLM observability readiness only; it does not call providers, send traces, export spans, contact Langfuse/Phoenix/Helicone/OpenTelemetry collectors, upload prompts/datasets/scores, replay sessions, route gateway requests, or inspect live dashboards.</p></section><section class="grid"><article class="llm-observability-readiness-card"><h3>Observability Setups</h3>${llmObservabilityReadinessSetupList(input.llmObservabilityReadinessReport.observabilitySetups)}</article><article class="llm-observability-readiness-card"><h3>Trace Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.traceSignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Instrumentation Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.instrumentationSignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Identity Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.identitySignals, "signal")}</article></section><section class="grid"><article class="llm-observability-readiness-card"><h3>LLM Metric Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.llmMetricSignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Feedback Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.feedbackSignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Dataset and Experiment Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.datasetExperimentSignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Gateway Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.gatewaySignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Privacy Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.privacySignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Workflow Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.workflowSignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Package Signals</h3>${llmObservabilityReadinessSignalList(input.llmObservabilityReadinessReport.packageSignals, "signal")}</article><article class="llm-observability-readiness-card"><h3>Recommended Commands</h3>${llmObservabilityReadinessCommandList(input.llmObservabilityReadinessReport.recommendedCommands)}</article><article class="llm-observability-readiness-card"><h3>Risk Queue</h3>${llmObservabilityReadinessRiskList(input.llmObservabilityReadinessReport.riskQueue)}</article><article class="llm-observability-readiness-card"><h3>다음 확인 단계</h3>${list(input.llmObservabilityReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "vector-db-readiness.html",
      title: "Vector DB Readiness",
      html: pageShell("Vector DB Readiness", "vector-db-readiness.html", `<section class="panel" data-source-pattern="Vector DB"><h2>Vector DB Snapshot</h2><p>${escapeHtml(input.vectorDbReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.vectorDbReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.vectorDbReadinessReport.vectorSetups.length}</dd></div><div><dt>collections</dt><dd>${input.vectorDbReadinessReport.collectionSignals.length}</dd></div><div><dt>queries</dt><dd>${input.vectorDbReadinessReport.querySignals.length}</dd></div><div><dt>indexes</dt><dd>${input.vectorDbReadinessReport.indexSignals.length}</dd></div><div><dt>ops</dt><dd>${input.vectorDbReadinessReport.opsSignals.length}</dd></div></dl><p class="muted">RepoTutor records vector DB readiness only; it does not start vector DB servers, run clients, generate embeddings, upsert/query/delete/backup/restore data, or inspect live dashboards.</p></section><section class="grid"><article class="vector-db-readiness-card"><h3>Vector Setups</h3>${vectorDbReadinessSetupList(input.vectorDbReadinessReport.vectorSetups)}</article><article class="vector-db-readiness-card"><h3>Collection Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.collectionSignals, "signal")}</article><article class="vector-db-readiness-card"><h3>Client Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.clientSignals, "signal")}</article><article class="vector-db-readiness-card"><h3>Ingestion Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.ingestionSignals, "signal")}</article></section><section class="grid"><article class="vector-db-readiness-card"><h3>Query Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.querySignals, "signal")}</article><article class="vector-db-readiness-card"><h3>Embedding Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.embeddingSignals, "signal")}</article><article class="vector-db-readiness-card"><h3>Index Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.indexSignals, "signal")}</article><article class="vector-db-readiness-card"><h3>Ops Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.opsSignals, "signal")}</article><article class="vector-db-readiness-card"><h3>Package Signals</h3>${vectorDbReadinessSignalList(input.vectorDbReadinessReport.packageSignals, "signal")}</article><article class="vector-db-readiness-card"><h3>Recommended Commands</h3>${vectorDbReadinessCommandList(input.vectorDbReadinessReport.recommendedCommands)}</article><article class="vector-db-readiness-card"><h3>Risk Queue</h3>${vectorDbReadinessRiskList(input.vectorDbReadinessReport.riskQueue)}</article><article class="vector-db-readiness-card"><h3>다음 확인 단계</h3>${list(input.vectorDbReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "search-service-readiness.html",
      title: "Search Service Readiness",
      html: pageShell("Search Service Readiness", "search-service-readiness.html", `<section class="panel" data-source-pattern="Search Service"><h2>Search Service Snapshot</h2><p>${escapeHtml(input.searchServiceReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.searchServiceReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.searchServiceReadinessReport.searchSetups.length}</dd></div><div><dt>indexes</dt><dd>${input.searchServiceReadinessReport.indexSignals.length}</dd></div><div><dt>queries</dt><dd>${input.searchServiceReadinessReport.querySignals.length}</dd></div><div><dt>relevance</dt><dd>${input.searchServiceReadinessReport.relevanceSignals.length}</dd></div><div><dt>ops</dt><dd>${input.searchServiceReadinessReport.opsSignals.length}</dd></div></dl><p class="muted">RepoTutor records search service readiness only; it does not start search servers, run clients, index/search/delete documents, create snapshots/dumps, or inspect live dashboards.</p></section><section class="grid"><article class="search-service-readiness-card"><h3>Search Setups</h3>${searchServiceReadinessSetupList(input.searchServiceReadinessReport.searchSetups)}</article><article class="search-service-readiness-card"><h3>Index Signals</h3>${searchServiceReadinessSignalList(input.searchServiceReadinessReport.indexSignals, "signal")}</article><article class="search-service-readiness-card"><h3>Client Signals</h3>${searchServiceReadinessSignalList(input.searchServiceReadinessReport.clientSignals, "signal")}</article><article class="search-service-readiness-card"><h3>Ingestion Signals</h3>${searchServiceReadinessSignalList(input.searchServiceReadinessReport.ingestionSignals, "signal")}</article></section><section class="grid"><article class="search-service-readiness-card"><h3>Query Signals</h3>${searchServiceReadinessSignalList(input.searchServiceReadinessReport.querySignals, "signal")}</article><article class="search-service-readiness-card"><h3>Relevance Signals</h3>${searchServiceReadinessSignalList(input.searchServiceReadinessReport.relevanceSignals, "signal")}</article><article class="search-service-readiness-card"><h3>Ops Signals</h3>${searchServiceReadinessSignalList(input.searchServiceReadinessReport.opsSignals, "signal")}</article><article class="search-service-readiness-card"><h3>Package Signals</h3>${searchServiceReadinessSignalList(input.searchServiceReadinessReport.packageSignals, "signal")}</article><article class="search-service-readiness-card"><h3>Recommended Commands</h3>${searchServiceReadinessCommandList(input.searchServiceReadinessReport.recommendedCommands)}</article><article class="search-service-readiness-card"><h3>Risk Queue</h3>${searchServiceReadinessRiskList(input.searchServiceReadinessReport.riskQueue)}</article><article class="search-service-readiness-card"><h3>다음 확인 단계</h3>${list(input.searchServiceReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "object-storage-readiness.html",
      title: "Object Storage Readiness",
      html: pageShell("Object Storage Readiness", "object-storage-readiness.html", `<section class="panel" data-source-pattern="Object Storage"><h2>Object Storage Snapshot</h2><p>${escapeHtml(input.objectStorageReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.objectStorageReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.objectStorageReadinessReport.storageSetups.length}</dd></div><div><dt>buckets</dt><dd>${input.objectStorageReadinessReport.bucketSignals.length}</dd></div><div><dt>objects</dt><dd>${input.objectStorageReadinessReport.objectSignals.length}</dd></div><div><dt>access</dt><dd>${input.objectStorageReadinessReport.accessSignals.length}</dd></div><div><dt>ops</dt><dd>${input.objectStorageReadinessReport.opsSignals.length}</dd></div></dl><p class="muted">RepoTutor records object storage readiness only; it does not create buckets, upload/download/list/delete/copy objects, sign URLs, read credentials, contact storage endpoints, mutate policies, or inspect live dashboards.</p></section><section class="grid"><article class="object-storage-readiness-card"><h3>Storage Setups</h3>${objectStorageReadinessSetupList(input.objectStorageReadinessReport.storageSetups)}</article><article class="object-storage-readiness-card"><h3>Bucket Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.bucketSignals, "signal")}</article><article class="object-storage-readiness-card"><h3>Client Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.clientSignals, "signal")}</article><article class="object-storage-readiness-card"><h3>Object Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.objectSignals, "signal")}</article></section><section class="grid"><article class="object-storage-readiness-card"><h3>Access Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.accessSignals, "signal")}</article><article class="object-storage-readiness-card"><h3>Reliability Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.reliabilitySignals, "signal")}</article><article class="object-storage-readiness-card"><h3>Security Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.securitySignals, "signal")}</article><article class="object-storage-readiness-card"><h3>Ops Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.opsSignals, "signal")}</article><article class="object-storage-readiness-card"><h3>Package Signals</h3>${objectStorageReadinessSignalList(input.objectStorageReadinessReport.packageSignals, "signal")}</article><article class="object-storage-readiness-card"><h3>Recommended Commands</h3>${objectStorageReadinessCommandList(input.objectStorageReadinessReport.recommendedCommands)}</article><article class="object-storage-readiness-card"><h3>Risk Queue</h3>${objectStorageReadinessRiskList(input.objectStorageReadinessReport.riskQueue)}</article><article class="object-storage-readiness-card"><h3>다음 확인 단계</h3>${list(input.objectStorageReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "realtime-collaboration-readiness.html",
      title: "Realtime Collaboration Readiness",
      html: pageShell("Realtime Collaboration Readiness", "realtime-collaboration-readiness.html", `<section class="panel" data-source-pattern="Realtime Collaboration"><h2>Realtime Collaboration Snapshot</h2><p>${escapeHtml(input.realtimeCollaborationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.realtimeCollaborationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.realtimeCollaborationReadinessReport.collaborationSetups.length}</dd></div><div><dt>crdt</dt><dd>${input.realtimeCollaborationReadinessReport.crdtSignals.length}</dd></div><div><dt>providers</dt><dd>${input.realtimeCollaborationReadinessReport.providerSignals.length}</dd></div><div><dt>presence</dt><dd>${input.realtimeCollaborationReadinessReport.presenceSignals.length}</dd></div><div><dt>sync</dt><dd>${input.realtimeCollaborationReadinessReport.syncSignals.length}</dd></div></dl><p class="muted">RepoTutor records realtime collaboration readiness only; it does not connect providers, join rooms, sync CRDT documents, mutate shared state, broadcast presence, call collaboration services, or run analyzed project tests.</p></section><section class="grid"><article class="realtime-collaboration-readiness-card"><h3>Collaboration Setups</h3>${realtimeCollaborationReadinessSetupList(input.realtimeCollaborationReadinessReport.collaborationSetups)}</article><article class="realtime-collaboration-readiness-card"><h3>CRDT Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.crdtSignals, "signal")}</article><article class="realtime-collaboration-readiness-card"><h3>Provider Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.providerSignals, "signal")}</article><article class="realtime-collaboration-readiness-card"><h3>Presence Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.presenceSignals, "signal")}</article></section><section class="grid"><article class="realtime-collaboration-readiness-card"><h3>Sync Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.syncSignals, "signal")}</article><article class="realtime-collaboration-readiness-card"><h3>Persistence Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.persistenceSignals, "signal")}</article><article class="realtime-collaboration-readiness-card"><h3>History Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.historySignals, "signal")}</article><article class="realtime-collaboration-readiness-card"><h3>Access Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.accessSignals, "signal")}</article><article class="realtime-collaboration-readiness-card"><h3>Package Signals</h3>${realtimeCollaborationReadinessSignalList(input.realtimeCollaborationReadinessReport.packageSignals, "signal")}</article><article class="realtime-collaboration-readiness-card"><h3>Recommended Commands</h3>${realtimeCollaborationReadinessCommandList(input.realtimeCollaborationReadinessReport.recommendedCommands)}</article><article class="realtime-collaboration-readiness-card"><h3>Risk Queue</h3>${realtimeCollaborationReadinessRiskList(input.realtimeCollaborationReadinessReport.riskQueue)}</article><article class="realtime-collaboration-readiness-card"><h3>다음 확인 단계</h3>${list(input.realtimeCollaborationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "workflow-orchestration-readiness.html",
      title: "Workflow Orchestration Readiness",
      html: pageShell("Workflow Orchestration Readiness", "workflow-orchestration-readiness.html", `<section class="panel" data-source-pattern="Workflow Orchestration"><h2>Workflow Orchestration Snapshot</h2><p>${escapeHtml(input.workflowOrchestrationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.workflowOrchestrationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.workflowOrchestrationReadinessReport.workflowSetups.length}</dd></div><div><dt>triggers</dt><dd>${input.workflowOrchestrationReadinessReport.triggerSignals.length}</dd></div><div><dt>execution</dt><dd>${input.workflowOrchestrationReadinessReport.executionSignals.length}</dd></div><div><dt>durability</dt><dd>${input.workflowOrchestrationReadinessReport.durabilitySignals.length}</dd></div><div><dt>flow</dt><dd>${input.workflowOrchestrationReadinessReport.flowSignals.length}</dd></div></dl><p class="muted">RepoTutor records workflow orchestration readiness only; it does not start workers, send events, register schedules, execute tasks or runs, call dashboards, or contact orchestration services.</p></section><section class="grid"><article class="workflow-orchestration-readiness-card"><h3>Workflow Setups</h3>${workflowOrchestrationReadinessSetupList(input.workflowOrchestrationReadinessReport.workflowSetups)}</article><article class="workflow-orchestration-readiness-card"><h3>Trigger Signals</h3>${workflowOrchestrationReadinessSignalList(input.workflowOrchestrationReadinessReport.triggerSignals, "signal")}</article><article class="workflow-orchestration-readiness-card"><h3>Execution Signals</h3>${workflowOrchestrationReadinessSignalList(input.workflowOrchestrationReadinessReport.executionSignals, "signal")}</article><article class="workflow-orchestration-readiness-card"><h3>Durability Signals</h3>${workflowOrchestrationReadinessSignalList(input.workflowOrchestrationReadinessReport.durabilitySignals, "signal")}</article></section><section class="grid"><article class="workflow-orchestration-readiness-card"><h3>Flow Signals</h3>${workflowOrchestrationReadinessSignalList(input.workflowOrchestrationReadinessReport.flowSignals, "signal")}</article><article class="workflow-orchestration-readiness-card"><h3>Runtime Signals</h3>${workflowOrchestrationReadinessSignalList(input.workflowOrchestrationReadinessReport.runtimeSignals, "signal")}</article><article class="workflow-orchestration-readiness-card"><h3>Observability Signals</h3>${workflowOrchestrationReadinessSignalList(input.workflowOrchestrationReadinessReport.observabilitySignals, "signal")}</article><article class="workflow-orchestration-readiness-card"><h3>Package Signals</h3>${workflowOrchestrationReadinessSignalList(input.workflowOrchestrationReadinessReport.packageSignals, "signal")}</article><article class="workflow-orchestration-readiness-card"><h3>Recommended Commands</h3>${workflowOrchestrationReadinessCommandList(input.workflowOrchestrationReadinessReport.recommendedCommands)}</article><article class="workflow-orchestration-readiness-card"><h3>Risk Queue</h3>${workflowOrchestrationReadinessRiskList(input.workflowOrchestrationReadinessReport.riskQueue)}</article><article class="workflow-orchestration-readiness-card"><h3>다음 확인 단계</h3>${list(input.workflowOrchestrationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "openapi-client-readiness.html",
      title: "OpenAPI Client Readiness",
      html: pageShell("OpenAPI Client Readiness", "openapi-client-readiness.html", `<section class="panel" data-source-pattern="OpenAPI Client"><h2>OpenAPI Client Snapshot</h2><p>${escapeHtml(input.openApiClientReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.openApiClientReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.openApiClientReadinessReport.clientSetups.length}</dd></div><div><dt>specs</dt><dd>${input.openApiClientReadinessReport.specSignals.length}</dd></div><div><dt>generators</dt><dd>${input.openApiClientReadinessReport.generatorSignals.length}</dd></div><div><dt>outputs</dt><dd>${input.openApiClientReadinessReport.outputSignals.length}</dd></div><div><dt>quality</dt><dd>${input.openApiClientReadinessReport.qualitySignals.length}</dd></div></dl><p class="muted">RepoTutor records OpenAPI client readiness only; it does not run generators, download remote schemas, execute generated clients, render templates, mutate generated files, or run analyzed project tests.</p></section><section class="grid"><article class="openapi-client-readiness-card"><h3>Client Setups</h3>${openApiClientReadinessSetupList(input.openApiClientReadinessReport.clientSetups)}</article><article class="openapi-client-readiness-card"><h3>Spec Signals</h3>${openApiClientReadinessSignalList(input.openApiClientReadinessReport.specSignals, "signal")}</article><article class="openapi-client-readiness-card"><h3>Generator Signals</h3>${openApiClientReadinessSignalList(input.openApiClientReadinessReport.generatorSignals, "signal")}</article><article class="openapi-client-readiness-card"><h3>Output Signals</h3>${openApiClientReadinessSignalList(input.openApiClientReadinessReport.outputSignals, "signal")}</article></section><section class="grid"><article class="openapi-client-readiness-card"><h3>Runtime Signals</h3>${openApiClientReadinessSignalList(input.openApiClientReadinessReport.runtimeSignals, "signal")}</article><article class="openapi-client-readiness-card"><h3>Quality Signals</h3>${openApiClientReadinessSignalList(input.openApiClientReadinessReport.qualitySignals, "signal")}</article><article class="openapi-client-readiness-card"><h3>Package Signals</h3>${openApiClientReadinessSignalList(input.openApiClientReadinessReport.packageSignals, "signal")}</article><article class="openapi-client-readiness-card"><h3>Recommended Commands</h3>${openApiClientReadinessCommandList(input.openApiClientReadinessReport.recommendedCommands)}</article><article class="openapi-client-readiness-card"><h3>Risk Queue</h3>${openApiClientReadinessRiskList(input.openApiClientReadinessReport.riskQueue)}</article><article class="openapi-client-readiness-card"><h3>다음 확인 단계</h3>${list(input.openApiClientReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "webhook-readiness.html",
      title: "Webhook Readiness",
      html: pageShell("Webhook Readiness", "webhook-readiness.html", `<section class="panel" data-source-pattern="Webhook"><h2>Webhook Snapshot</h2><p>${escapeHtml(input.webhookReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.webhookReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.webhookReadinessReport.webhookSetups.length}</dd></div><div><dt>endpoints</dt><dd>${input.webhookReadinessReport.endpointSignals.length}</dd></div><div><dt>signatures</dt><dd>${input.webhookReadinessReport.signatureSignals.length}</dd></div><div><dt>reliability</dt><dd>${input.webhookReadinessReport.reliabilitySignals.length}</dd></div><div><dt>operations</dt><dd>${input.webhookReadinessReport.operationsSignals.length}</dd></div></dl><p class="muted">RepoTutor records webhook readiness only; it does not receive provider callbacks, verify live signatures, replay deliveries, call dashboards, forward traffic, or mutate webhook provider state.</p></section><section class="grid"><article class="webhook-readiness-card"><h3>Webhook Setups</h3>${webhookReadinessSetupList(input.webhookReadinessReport.webhookSetups)}</article><article class="webhook-readiness-card"><h3>Endpoint Signals</h3>${webhookReadinessSignalList(input.webhookReadinessReport.endpointSignals, "signal")}</article><article class="webhook-readiness-card"><h3>Signature Signals</h3>${webhookReadinessSignalList(input.webhookReadinessReport.signatureSignals, "signal")}</article><article class="webhook-readiness-card"><h3>Reliability Signals</h3>${webhookReadinessSignalList(input.webhookReadinessReport.reliabilitySignals, "signal")}</article></section><section class="grid"><article class="webhook-readiness-card"><h3>Operations Signals</h3>${webhookReadinessSignalList(input.webhookReadinessReport.operationsSignals, "signal")}</article><article class="webhook-readiness-card"><h3>Package Signals</h3>${webhookReadinessSignalList(input.webhookReadinessReport.packageSignals, "signal")}</article><article class="webhook-readiness-card"><h3>Recommended Commands</h3>${webhookReadinessCommandList(input.webhookReadinessReport.recommendedCommands)}</article><article class="webhook-readiness-card"><h3>Risk Queue</h3>${webhookReadinessRiskList(input.webhookReadinessReport.riskQueue)}</article><article class="webhook-readiness-card"><h3>다음 확인 단계</h3>${list(input.webhookReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "notification-readiness.html",
      title: "Notification Readiness",
      html: pageShell("Notification Readiness", "notification-readiness.html", `<section class="panel" data-source-pattern="Notifications"><h2>Notification Snapshot</h2><p>${escapeHtml(input.notificationReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.notificationReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.notificationReadinessReport.notificationSetups.length}</dd></div><div><dt>workflows</dt><dd>${input.notificationReadinessReport.workflowSignals.length}</dd></div><div><dt>audience</dt><dd>${input.notificationReadinessReport.audienceSignals.length}</dd></div><div><dt>channels</dt><dd>${input.notificationReadinessReport.channelSignals.length}</dd></div><div><dt>operations</dt><dd>${input.notificationReadinessReport.operationsSignals.length}</dd></div></dl><p class="muted">RepoTutor records notification readiness only; it does not send notifications, call provider APIs, mutate subscribers/topics/preferences, inspect live dashboards, or verify real delivery.</p></section><section class="grid"><article class="notification-readiness-card"><h3>Notification Setups</h3>${notificationReadinessSetupList(input.notificationReadinessReport.notificationSetups)}</article><article class="notification-readiness-card"><h3>Workflow Signals</h3>${notificationReadinessSignalList(input.notificationReadinessReport.workflowSignals, "signal")}</article><article class="notification-readiness-card"><h3>Audience Signals</h3>${notificationReadinessSignalList(input.notificationReadinessReport.audienceSignals, "signal")}</article><article class="notification-readiness-card"><h3>Channel Signals</h3>${notificationReadinessSignalList(input.notificationReadinessReport.channelSignals, "signal")}</article></section><section class="grid"><article class="notification-readiness-card"><h3>Template Signals</h3>${notificationReadinessSignalList(input.notificationReadinessReport.templateSignals, "signal")}</article><article class="notification-readiness-card"><h3>Operations Signals</h3>${notificationReadinessSignalList(input.notificationReadinessReport.operationsSignals, "signal")}</article><article class="notification-readiness-card"><h3>Package Signals</h3>${notificationReadinessSignalList(input.notificationReadinessReport.packageSignals, "signal")}</article><article class="notification-readiness-card"><h3>Recommended Commands</h3>${notificationReadinessCommandList(input.notificationReadinessReport.recommendedCommands)}</article><article class="notification-readiness-card"><h3>Risk Queue</h3>${notificationReadinessRiskList(input.notificationReadinessReport.riskQueue)}</article><article class="notification-readiness-card"><h3>다음 확인 단계</h3>${list(input.notificationReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "consent-readiness.html",
      title: "Consent Readiness",
      html: pageShell("Consent Readiness", "consent-readiness.html", `<section class="panel" data-source-pattern="Consent"><h2>Consent Snapshot</h2><p>${escapeHtml(input.consentReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.consentReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.consentReadinessReport.consentSetups.length}</dd></div><div><dt>banners</dt><dd>${input.consentReadinessReport.bannerSignals.length}</dd></div><div><dt>categories</dt><dd>${input.consentReadinessReport.categorySignals.length}</dd></div><div><dt>scripts</dt><dd>${input.consentReadinessReport.scriptSignals.length}</dd></div><div><dt>TCF</dt><dd>${input.consentReadinessReport.tcfSignals.length}</dd></div></dl><p class="muted">RepoTutor records consent readiness only; it does not execute CMP scripts, set cookies, mutate local storage, call TCF APIs, load vendors, or verify legal compliance.</p></section><section class="grid"><article class="consent-readiness-card"><h3>Consent Setups</h3>${consentReadinessSetupList(input.consentReadinessReport.consentSetups)}</article><article class="consent-readiness-card"><h3>Banner Signals</h3>${consentReadinessSignalList(input.consentReadinessReport.bannerSignals, "signal")}</article><article class="consent-readiness-card"><h3>Category Signals</h3>${consentReadinessSignalList(input.consentReadinessReport.categorySignals, "signal")}</article><article class="consent-readiness-card"><h3>Script Signals</h3>${consentReadinessSignalList(input.consentReadinessReport.scriptSignals, "signal")}</article></section><section class="grid"><article class="consent-readiness-card"><h3>Privacy Signals</h3>${consentReadinessSignalList(input.consentReadinessReport.privacySignals, "signal")}</article><article class="consent-readiness-card"><h3>TCF Signals</h3>${consentReadinessSignalList(input.consentReadinessReport.tcfSignals, "signal")}</article><article class="consent-readiness-card"><h3>Package Signals</h3>${consentReadinessSignalList(input.consentReadinessReport.packageSignals, "signal")}</article><article class="consent-readiness-card"><h3>Recommended Commands</h3>${consentReadinessCommandList(input.consentReadinessReport.recommendedCommands)}</article><article class="consent-readiness-card"><h3>Risk Queue</h3>${consentReadinessRiskList(input.consentReadinessReport.riskQueue)}</article><article class="consent-readiness-card"><h3>다음 확인 단계</h3>${list(input.consentReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "privacy-readiness.html",
      title: "Privacy Readiness",
      html: pageShell("Privacy Readiness", "privacy-readiness.html", `<section class="panel" data-source-pattern="Privacy"><h2>Privacy Snapshot</h2><p>${escapeHtml(input.privacyReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.privacyReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.privacyReadinessReport.privacySetups.length}</dd></div><div><dt>PII</dt><dd>${input.privacyReadinessReport.piiDetectionSignals.length}</dd></div><div><dt>redaction</dt><dd>${input.privacyReadinessReport.redactionSignals.length}</dd></div><div><dt>policy</dt><dd>${input.privacyReadinessReport.policySignals.length}</dd></div><div><dt>DP</dt><dd>${input.privacyReadinessReport.differentialPrivacySignals.length}</dd></div></dl><p class="muted">RepoTutor records privacy readiness only; it does not inspect live databases, process real PII, execute anonymizers, spend privacy budget, call external privacy services, or verify legal compliance.</p></section><section class="grid"><article class="privacy-readiness-card"><h3>Privacy Setups</h3>${privacyReadinessSetupList(input.privacyReadinessReport.privacySetups)}</article><article class="privacy-readiness-card"><h3>PII Detection Signals</h3>${privacyReadinessSignalList(input.privacyReadinessReport.piiDetectionSignals, "signal")}</article><article class="privacy-readiness-card"><h3>Redaction Signals</h3>${privacyReadinessSignalList(input.privacyReadinessReport.redactionSignals, "signal")}</article><article class="privacy-readiness-card"><h3>Policy Signals</h3>${privacyReadinessSignalList(input.privacyReadinessReport.policySignals, "signal")}</article></section><section class="grid"><article class="privacy-readiness-card"><h3>Differential Privacy Signals</h3>${privacyReadinessSignalList(input.privacyReadinessReport.differentialPrivacySignals, "signal")}</article><article class="privacy-readiness-card"><h3>Config Signals</h3>${privacyReadinessSignalList(input.privacyReadinessReport.configSignals, "signal")}</article><article class="privacy-readiness-card"><h3>CI Signals</h3>${privacyReadinessSignalList(input.privacyReadinessReport.ciSignals, "signal")}</article><article class="privacy-readiness-card"><h3>Package Signals</h3>${privacyReadinessSignalList(input.privacyReadinessReport.packageSignals, "signal")}</article><article class="privacy-readiness-card"><h3>Recommended Commands</h3>${privacyReadinessCommandList(input.privacyReadinessReport.recommendedCommands)}</article><article class="privacy-readiness-card"><h3>Risk Queue</h3>${privacyReadinessRiskList(input.privacyReadinessReport.riskQueue)}</article><article class="privacy-readiness-card"><h3>다음 확인 단계</h3>${list(input.privacyReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "server-framework-readiness.html",
      title: "Server Framework Readiness",
      html: pageShell("Server Framework Readiness", "server-framework-readiness.html", `<section class="panel" data-source-pattern="Fastify"><h2>Server Framework Snapshot</h2><p>${escapeHtml(input.serverFrameworkReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.serverFrameworkReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.serverFrameworkReadinessReport.serverSetups.length}</dd></div><div><dt>routes</dt><dd>${input.serverFrameworkReadinessReport.routeSignals.length}</dd></div><div><dt>schemas</dt><dd>${input.serverFrameworkReadinessReport.schemaSignals.length}</dd></div><div><dt>plugins</dt><dd>${input.serverFrameworkReadinessReport.pluginSignals.length}</dd></div></dl><p class="muted">RepoTutor records server framework readiness only; it does not start listeners, execute handlers, send HTTP requests, run plugins, compile schemas, or mutate runtime state.</p></section><section class="grid"><article class="server-framework-readiness-card"><h3>Server Setups</h3>${serverFrameworkReadinessSetupList(input.serverFrameworkReadinessReport.serverSetups)}</article><article class="server-framework-readiness-card"><h3>Route Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.routeSignals, "signal")}</article><article class="server-framework-readiness-card"><h3>Schema Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.schemaSignals, "signal")}</article><article class="server-framework-readiness-card"><h3>Plugin Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.pluginSignals, "signal")}</article></section><section class="grid"><article class="server-framework-readiness-card"><h3>Lifecycle Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.lifecycleSignals, "signal")}</article><article class="server-framework-readiness-card"><h3>Runtime Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.runtimeSignals, "signal")}</article><article class="server-framework-readiness-card"><h3>Error Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.errorSignals, "signal")}</article><article class="server-framework-readiness-card"><h3>Test Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.testSignals, "signal")}</article><article class="server-framework-readiness-card"><h3>Package Signals</h3>${serverFrameworkReadinessSignalList(input.serverFrameworkReadinessReport.packageSignals, "signal")}</article><article class="server-framework-readiness-card"><h3>Recommended Commands</h3>${serverFrameworkReadinessCommandList(input.serverFrameworkReadinessReport.recommendedCommands)}</article><article class="server-framework-readiness-card"><h3>Risk Queue</h3>${serverFrameworkReadinessRiskList(input.serverFrameworkReadinessReport.riskQueue)}</article><article class="server-framework-readiness-card"><h3>다음 확인 단계</h3>${list(input.serverFrameworkReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "rpc-readiness.html",
      title: "RPC Readiness",
      html: pageShell("RPC Readiness", "rpc-readiness.html", `<section class="panel" data-source-pattern="tRPC"><h2>RPC Snapshot</h2><p>${escapeHtml(input.rpcReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.rpcReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.rpcReadinessReport.rpcSetups.length}</dd></div><div><dt>routers</dt><dd>${input.rpcReadinessReport.routerSignals.length}</dd></div><div><dt>procedures</dt><dd>${input.rpcReadinessReport.procedureSignals.length}</dd></div><div><dt>clients</dt><dd>${input.rpcReadinessReport.clientSignals.length}</dd></div></dl><p class="muted">RepoTutor records RPC readiness only; it does not start adapters, invoke procedures, open websocket/subscription links, serialize transformers, call clients, or run analyzed project tests.</p></section><section class="grid"><article class="rpc-readiness-card"><h3>RPC Setups</h3>${rpcReadinessSetupList(input.rpcReadinessReport.rpcSetups)}</article><article class="rpc-readiness-card"><h3>Router Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.routerSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Procedure Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.procedureSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Validation Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.validationSignals, "signal")}</article></section><section class="grid"><article class="rpc-readiness-card"><h3>Context Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.contextSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Client Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.clientSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Adapter Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.adapterSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Error Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.errorSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Caller Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.callerSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Package Signals</h3>${rpcReadinessSignalList(input.rpcReadinessReport.packageSignals, "signal")}</article><article class="rpc-readiness-card"><h3>Recommended Commands</h3>${rpcReadinessCommandList(input.rpcReadinessReport.recommendedCommands)}</article><article class="rpc-readiness-card"><h3>Risk Queue</h3>${rpcReadinessRiskList(input.rpcReadinessReport.riskQueue)}</article><article class="rpc-readiness-card"><h3>다음 확인 단계</h3>${list(input.rpcReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "workspace-graph-readiness.html",
      title: "Workspace Graph Readiness",
      html: pageShell("Workspace Graph Readiness", "workspace-graph-readiness.html", `<section class="panel" data-source-pattern="Nx"><h2>Workspace Graph Snapshot</h2><p>${escapeHtml(input.workspaceGraphReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.workspaceGraphReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>workspace files</dt><dd>${input.workspaceGraphReadinessReport.workspaceFiles.length}</dd></div><div><dt>projects</dt><dd>${input.workspaceGraphReadinessReport.projectSignals.length}</dd></div><div><dt>graph</dt><dd>${input.workspaceGraphReadinessReport.graphSignals.length}</dd></div><div><dt>targets</dt><dd>${input.workspaceGraphReadinessReport.targetSignals.length}</dd></div></dl><p class="muted">RepoTutor records workspace graph readiness only; it does not execute Nx, compute affected projects, run generators, enforce lint boundaries, or contact remote cache services.</p></section><section class="grid"><article class="workspace-graph-readiness-card"><h3>Workspace Files</h3>${workspaceGraphReadinessFileList(input.workspaceGraphReadinessReport.workspaceFiles)}</article><article class="workspace-graph-readiness-card"><h3>Project Signals</h3>${workspaceGraphReadinessSignalList(input.workspaceGraphReadinessReport.projectSignals, "signal")}</article><article class="workspace-graph-readiness-card"><h3>Graph Signals</h3>${workspaceGraphReadinessSignalList(input.workspaceGraphReadinessReport.graphSignals, "signal")}</article><article class="workspace-graph-readiness-card"><h3>Boundary Signals</h3>${workspaceGraphReadinessSignalList(input.workspaceGraphReadinessReport.boundarySignals, "signal")}</article></section><section class="grid"><article class="workspace-graph-readiness-card"><h3>Affected Signals</h3>${workspaceGraphReadinessSignalList(input.workspaceGraphReadinessReport.affectedSignals, "signal")}</article><article class="workspace-graph-readiness-card"><h3>Target Signals</h3>${workspaceGraphReadinessSignalList(input.workspaceGraphReadinessReport.targetSignals, "signal")}</article><article class="workspace-graph-readiness-card"><h3>Plugin Signals</h3>${workspaceGraphReadinessSignalList(input.workspaceGraphReadinessReport.pluginSignals, "signal")}</article><article class="workspace-graph-readiness-card"><h3>Package Signals</h3>${workspaceGraphReadinessSignalList(input.workspaceGraphReadinessReport.packageSignals, "signal")}</article><article class="workspace-graph-readiness-card"><h3>Recommended Commands</h3>${workspaceGraphReadinessCommandList(input.workspaceGraphReadinessReport.recommendedCommands)}</article><article class="workspace-graph-readiness-card"><h3>Risk Queue</h3>${workspaceGraphReadinessRiskList(input.workspaceGraphReadinessReport.riskQueue)}</article><article class="workspace-graph-readiness-card"><h3>다음 확인 단계</h3>${list(input.workspaceGraphReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "scaffolding-readiness.html",
      title: "Scaffolding Readiness",
      html: pageShell("Scaffolding Readiness", "scaffolding-readiness.html", `<section class="panel" data-source-pattern="Plop"><h2>Scaffolding Snapshot</h2><p>${escapeHtml(input.scaffoldingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.scaffoldingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>generators</dt><dd>${input.scaffoldingReadinessReport.generatorFiles.length}</dd></div><div><dt>prompts</dt><dd>${input.scaffoldingReadinessReport.promptSignals.length}</dd></div><div><dt>actions</dt><dd>${input.scaffoldingReadinessReport.actionSignals.length}</dd></div><div><dt>templates</dt><dd>${input.scaffoldingReadinessReport.templateSignals.length}</dd></div></dl><p class="muted">RepoTutor records scaffolding readiness only; it does not invoke prompts, write generated files, run codemods, execute shell actions, or validate generated output.</p></section><section class="grid"><article class="scaffolding-readiness-card"><h3>Generator Files</h3>${scaffoldingReadinessFileList(input.scaffoldingReadinessReport.generatorFiles)}</article><article class="scaffolding-readiness-card"><h3>Prompt Signals</h3>${scaffoldingReadinessSignalList(input.scaffoldingReadinessReport.promptSignals, "signal")}</article><article class="scaffolding-readiness-card"><h3>Action Signals</h3>${scaffoldingReadinessSignalList(input.scaffoldingReadinessReport.actionSignals, "signal")}</article><article class="scaffolding-readiness-card"><h3>Template Signals</h3>${scaffoldingReadinessSignalList(input.scaffoldingReadinessReport.templateSignals, "signal")}</article></section><section class="grid"><article class="scaffolding-readiness-card"><h3>Safety Signals</h3>${scaffoldingReadinessSignalList(input.scaffoldingReadinessReport.safetySignals, "signal")}</article><article class="scaffolding-readiness-card"><h3>Package Signals</h3>${scaffoldingReadinessSignalList(input.scaffoldingReadinessReport.packageSignals, "signal")}</article><article class="scaffolding-readiness-card"><h3>Recommended Commands</h3>${scaffoldingReadinessCommandList(input.scaffoldingReadinessReport.recommendedCommands)}</article><article class="scaffolding-readiness-card"><h3>Risk Queue</h3>${scaffoldingReadinessRiskList(input.scaffoldingReadinessReport.riskQueue)}</article><article class="scaffolding-readiness-card"><h3>다음 확인 단계</h3>${list(input.scaffoldingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "scheduler-readiness.html",
      title: "Scheduler Readiness",
      html: pageShell("Scheduler Readiness", "scheduler-readiness.html", `<section class="panel" data-source-pattern="node-cron"><h2>Scheduler Snapshot</h2><p>${escapeHtml(input.schedulerReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.schedulerReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.schedulerReadinessReport.schedulerSetups.length}</dd></div><div><dt>schedules</dt><dd>${input.schedulerReadinessReport.scheduleSignals.length}</dd></div><div><dt>tasks</dt><dd>${input.schedulerReadinessReport.taskSignals.length}</dd></div><div><dt>reliability</dt><dd>${input.schedulerReadinessReport.reliabilitySignals.length}</dd></div></dl><p class="muted">RepoTutor records scheduler readiness only; it does not start timers, wait for cron ticks, execute jobs, acquire locks, retry failures, or validate platform cron delivery.</p></section><section class="grid"><article class="scheduler-readiness-card"><h3>Scheduler Setups</h3>${schedulerReadinessSetupList(input.schedulerReadinessReport.schedulerSetups)}</article><article class="scheduler-readiness-card"><h3>Schedule Signals</h3>${schedulerReadinessSignalList(input.schedulerReadinessReport.scheduleSignals, "signal")}</article><article class="scheduler-readiness-card"><h3>Task Signals</h3>${schedulerReadinessSignalList(input.schedulerReadinessReport.taskSignals, "signal")}</article><article class="scheduler-readiness-card"><h3>Lifecycle Signals</h3>${schedulerReadinessSignalList(input.schedulerReadinessReport.lifecycleSignals, "signal")}</article></section><section class="grid"><article class="scheduler-readiness-card"><h3>Reliability Signals</h3>${schedulerReadinessSignalList(input.schedulerReadinessReport.reliabilitySignals, "signal")}</article><article class="scheduler-readiness-card"><h3>Package Signals</h3>${schedulerReadinessSignalList(input.schedulerReadinessReport.packageSignals, "signal")}</article><article class="scheduler-readiness-card"><h3>Recommended Commands</h3>${schedulerReadinessCommandList(input.schedulerReadinessReport.recommendedCommands)}</article><article class="scheduler-readiness-card"><h3>Risk Queue</h3>${schedulerReadinessRiskList(input.schedulerReadinessReport.riskQueue)}</article><article class="scheduler-readiness-card"><h3>다음 확인 단계</h3>${list(input.schedulerReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "build-tool-readiness.html",
      title: "Build Tool Readiness",
      html: pageShell("Build Tool Readiness", "build-tool-readiness.html", `<section class="panel" data-source-pattern="Vite"><h2>Build Tool Snapshot</h2><p>${escapeHtml(input.buildToolReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.buildToolReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.buildToolReadinessReport.buildToolSetups.length}</dd></div><div><dt>configs</dt><dd>${input.buildToolReadinessReport.configSignals.length}</dd></div><div><dt>plugins</dt><dd>${input.buildToolReadinessReport.pluginSignals.length}</dd></div><div><dt>build</dt><dd>${input.buildToolReadinessReport.buildSignals.length}</dd></div><div><dt>env</dt><dd>${input.buildToolReadinessReport.environmentSignals.length}</dd></div><div><dt>SSR</dt><dd>${input.buildToolReadinessReport.ssrSignals.length}</dd></div></dl><p class="muted">RepoTutor records build-tool readiness only; it does not start dev servers, run production builds, transform modules, execute plugins, pre-bundle dependencies, load env files, or validate SSR output.</p></section><section class="grid"><article class="build-tool-readiness-card"><h3>Build Tool Setups</h3>${buildToolReadinessSetupList(input.buildToolReadinessReport.buildToolSetups)}</article><article class="build-tool-readiness-card"><h3>Config Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.configSignals, "signal")}</article><article class="build-tool-readiness-card"><h3>Plugin Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.pluginSignals, "signal")}</article><article class="build-tool-readiness-card"><h3>Dev Server Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.devServerSignals, "signal")}</article></section><section class="grid"><article class="build-tool-readiness-card"><h3>Build Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.buildSignals, "signal")}</article><article class="build-tool-readiness-card"><h3>Environment Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.environmentSignals, "signal")}</article><article class="build-tool-readiness-card"><h3>SSR Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.ssrSignals, "signal")}</article><article class="build-tool-readiness-card"><h3>Dependency Optimization Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.dependencyOptimizationSignals, "signal")}</article><article class="build-tool-readiness-card"><h3>Package Signals</h3>${buildToolReadinessSignalList(input.buildToolReadinessReport.packageSignals, "signal")}</article><article class="build-tool-readiness-card"><h3>Recommended Commands</h3>${buildToolReadinessCommandList(input.buildToolReadinessReport.recommendedCommands)}</article><article class="build-tool-readiness-card"><h3>Risk Queue</h3>${buildToolReadinessRiskList(input.buildToolReadinessReport.riskQueue)}</article><article class="build-tool-readiness-card"><h3>다음 확인 단계</h3>${list(input.buildToolReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "styling-readiness.html",
      title: "Styling Readiness",
      html: pageShell("Styling Readiness", "styling-readiness.html", `<section class="panel" data-source-pattern="Tailwind CSS"><h2>Styling Snapshot</h2><p>${escapeHtml(input.stylingReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.stylingReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.stylingReadinessReport.stylingSetups.length}</dd></div><div><dt>config</dt><dd>${input.stylingReadinessReport.configSignals.length}</dd></div><div><dt>directives</dt><dd>${input.stylingReadinessReport.directiveSignals.length}</dd></div><div><dt>classes</dt><dd>${input.stylingReadinessReport.classSignals.length}</dd></div><div><dt>theme</dt><dd>${input.stylingReadinessReport.themeSignals.length}</dd></div><div><dt>integration</dt><dd>${input.stylingReadinessReport.integrationSignals.length}</dd></div></dl><p class="muted">RepoTutor records styling readiness only; it does not compile Tailwind, scan class candidates, run PostCSS/Vite plugins, update caches, or validate final CSS size.</p></section><section class="grid"><article class="styling-readiness-card"><h3>Styling Setups</h3>${stylingReadinessSetupList(input.stylingReadinessReport.stylingSetups)}</article><article class="styling-readiness-card"><h3>Config Signals</h3>${stylingReadinessSignalList(input.stylingReadinessReport.configSignals, "signal")}</article><article class="styling-readiness-card"><h3>Directive Signals</h3>${stylingReadinessSignalList(input.stylingReadinessReport.directiveSignals, "signal")}</article><article class="styling-readiness-card"><h3>Class Signals</h3>${stylingReadinessSignalList(input.stylingReadinessReport.classSignals, "signal")}</article></section><section class="grid"><article class="styling-readiness-card"><h3>Theme Signals</h3>${stylingReadinessSignalList(input.stylingReadinessReport.themeSignals, "signal")}</article><article class="styling-readiness-card"><h3>Integration Signals</h3>${stylingReadinessSignalList(input.stylingReadinessReport.integrationSignals, "signal")}</article><article class="styling-readiness-card"><h3>Package Signals</h3>${stylingReadinessSignalList(input.stylingReadinessReport.packageSignals, "signal")}</article><article class="styling-readiness-card"><h3>Recommended Commands</h3>${stylingReadinessCommandList(input.stylingReadinessReport.recommendedCommands)}</article><article class="styling-readiness-card"><h3>Risk Queue</h3>${stylingReadinessRiskList(input.stylingReadinessReport.riskQueue)}</article><article class="styling-readiness-card"><h3>다음 확인 단계</h3>${list(input.stylingReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "visual-regression-readiness.html",
      title: "Visual Regression Readiness",
      html: pageShell("Visual Regression Readiness", "visual-regression-readiness.html", `<section class="panel" data-source-pattern="reg-suit"><h2>Visual Regression Snapshot</h2><p>${escapeHtml(input.visualRegressionReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.visualRegressionReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.visualRegressionReadinessReport.visualRegressionSetups.length}</dd></div><div><dt>snapshots</dt><dd>${input.visualRegressionReadinessReport.snapshotSignals.length}</dd></div><div><dt>thresholds</dt><dd>${input.visualRegressionReadinessReport.thresholdSignals.length}</dd></div><div><dt>reports</dt><dd>${input.visualRegressionReadinessReport.reportSignals.length}</dd></div><div><dt>plugins</dt><dd>${input.visualRegressionReadinessReport.pluginSignals.length}</dd></div><div><dt>CI</dt><dd>${input.visualRegressionReadinessReport.ciSignals.length}</dd></div></dl><p class="muted">RepoTutor records visual regression readiness only; it does not capture screenshots, compare pixels, fetch baselines, upload reports, notify services, or execute browser tests.</p></section><section class="grid"><article class="visual-regression-readiness-card"><h3>Visual Regression Setups</h3>${visualRegressionReadinessSetupList(input.visualRegressionReadinessReport.visualRegressionSetups)}</article><article class="visual-regression-readiness-card"><h3>Config Signals</h3>${visualRegressionReadinessSignalList(input.visualRegressionReadinessReport.configSignals, "signal")}</article><article class="visual-regression-readiness-card"><h3>Snapshot Signals</h3>${visualRegressionReadinessSignalList(input.visualRegressionReadinessReport.snapshotSignals, "signal")}</article><article class="visual-regression-readiness-card"><h3>Threshold Signals</h3>${visualRegressionReadinessSignalList(input.visualRegressionReadinessReport.thresholdSignals, "signal")}</article></section><section class="grid"><article class="visual-regression-readiness-card"><h3>Report Signals</h3>${visualRegressionReadinessSignalList(input.visualRegressionReadinessReport.reportSignals, "signal")}</article><article class="visual-regression-readiness-card"><h3>Plugin Signals</h3>${visualRegressionReadinessSignalList(input.visualRegressionReadinessReport.pluginSignals, "signal")}</article><article class="visual-regression-readiness-card"><h3>CI Signals</h3>${visualRegressionReadinessSignalList(input.visualRegressionReadinessReport.ciSignals, "signal")}</article><article class="visual-regression-readiness-card"><h3>Package Signals</h3>${visualRegressionReadinessSignalList(input.visualRegressionReadinessReport.packageSignals, "signal")}</article><article class="visual-regression-readiness-card"><h3>Recommended Commands</h3>${visualRegressionReadinessCommandList(input.visualRegressionReadinessReport.recommendedCommands)}</article><article class="visual-regression-readiness-card"><h3>Risk Queue</h3>${visualRegressionReadinessRiskList(input.visualRegressionReadinessReport.riskQueue)}</article><article class="visual-regression-readiness-card"><h3>다음 확인 단계</h3>${list(input.visualRegressionReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "infrastructure-readiness.html",
      title: "Infrastructure Readiness",
      html: pageShell("Infrastructure Readiness", "infrastructure-readiness.html", `<section class="panel" data-source-pattern="OpenTofu"><h2>Infrastructure Snapshot</h2><p>${escapeHtml(input.infrastructureReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.infrastructureReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.infrastructureReadinessReport.infrastructureSetups.length}</dd></div><div><dt>config</dt><dd>${input.infrastructureReadinessReport.configSignals.length}</dd></div><div><dt>state</dt><dd>${input.infrastructureReadinessReport.stateSignals.length}</dd></div><div><dt>workflow</dt><dd>${input.infrastructureReadinessReport.workflowSignals.length}</dd></div><div><dt>modules</dt><dd>${input.infrastructureReadinessReport.moduleSignals.length}</dd></div><div><dt>policy</dt><dd>${input.infrastructureReadinessReport.policySignals.length}</dd></div></dl><p class="muted">RepoTutor records infrastructure readiness only; it does not run tofu, terraform, terragrunt, cloud provider, backend, state migration, import, plan, apply, destroy, policy, or cost commands.</p></section><section class="grid"><article class="infrastructure-readiness-card"><h3>Infrastructure Setups</h3>${infrastructureReadinessSetupList(input.infrastructureReadinessReport.infrastructureSetups)}</article><article class="infrastructure-readiness-card"><h3>Config Signals</h3>${infrastructureReadinessSignalList(input.infrastructureReadinessReport.configSignals, "signal")}</article><article class="infrastructure-readiness-card"><h3>State Signals</h3>${infrastructureReadinessSignalList(input.infrastructureReadinessReport.stateSignals, "signal")}</article><article class="infrastructure-readiness-card"><h3>Workflow Signals</h3>${infrastructureReadinessSignalList(input.infrastructureReadinessReport.workflowSignals, "signal")}</article></section><section class="grid"><article class="infrastructure-readiness-card"><h3>Module Signals</h3>${infrastructureReadinessSignalList(input.infrastructureReadinessReport.moduleSignals, "signal")}</article><article class="infrastructure-readiness-card"><h3>Variable Signals</h3>${infrastructureReadinessSignalList(input.infrastructureReadinessReport.variableSignals, "signal")}</article><article class="infrastructure-readiness-card"><h3>Policy Signals</h3>${infrastructureReadinessSignalList(input.infrastructureReadinessReport.policySignals, "signal")}</article><article class="infrastructure-readiness-card"><h3>Package Signals</h3>${infrastructureReadinessSignalList(input.infrastructureReadinessReport.packageSignals, "signal")}</article><article class="infrastructure-readiness-card"><h3>Recommended Commands</h3>${infrastructureReadinessCommandList(input.infrastructureReadinessReport.recommendedCommands)}</article><article class="infrastructure-readiness-card"><h3>Risk Queue</h3>${infrastructureReadinessRiskList(input.infrastructureReadinessReport.riskQueue)}</article><article class="infrastructure-readiness-card"><h3>다음 확인 단계</h3>${list(input.infrastructureReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "deployment-readiness.html",
      title: "Deployment Readiness",
      html: pageShell("Deployment Readiness", "deployment-readiness.html", `<section class="panel" data-source-pattern="Helm"><h2>Deployment Snapshot</h2><p>${escapeHtml(input.deploymentReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.deploymentReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.deploymentReadinessReport.deploymentSetups.length}</dd></div><div><dt>charts</dt><dd>${input.deploymentReadinessReport.chartSignals.length}</dd></div><div><dt>templates</dt><dd>${input.deploymentReadinessReport.templateSignals.length}</dd></div><div><dt>values</dt><dd>${input.deploymentReadinessReport.valueSignals.length}</dd></div><div><dt>release</dt><dd>${input.deploymentReadinessReport.releaseSignals.length}</dd></div><div><dt>safety</dt><dd>${input.deploymentReadinessReport.safetySignals.length}</dd></div></dl><p class="muted">RepoTutor records deployment readiness only; it does not run Helm, render templates, contact Kubernetes APIs, mutate releases, update repo caches, package charts, push OCI artifacts, or execute hooks.</p></section><section class="grid"><article class="deployment-readiness-card"><h3>Deployment Setups</h3>${deploymentReadinessSetupList(input.deploymentReadinessReport.deploymentSetups)}</article><article class="deployment-readiness-card"><h3>Chart Signals</h3>${deploymentReadinessSignalList(input.deploymentReadinessReport.chartSignals, "signal")}</article><article class="deployment-readiness-card"><h3>Template Signals</h3>${deploymentReadinessSignalList(input.deploymentReadinessReport.templateSignals, "signal")}</article><article class="deployment-readiness-card"><h3>Value Signals</h3>${deploymentReadinessSignalList(input.deploymentReadinessReport.valueSignals, "signal")}</article></section><section class="grid"><article class="deployment-readiness-card"><h3>Release Signals</h3>${deploymentReadinessSignalList(input.deploymentReadinessReport.releaseSignals, "signal")}</article><article class="deployment-readiness-card"><h3>Safety Signals</h3>${deploymentReadinessSignalList(input.deploymentReadinessReport.safetySignals, "signal")}</article><article class="deployment-readiness-card"><h3>Package Signals</h3>${deploymentReadinessSignalList(input.deploymentReadinessReport.packageSignals, "signal")}</article><article class="deployment-readiness-card"><h3>Recommended Commands</h3>${deploymentReadinessCommandList(input.deploymentReadinessReport.recommendedCommands)}</article><article class="deployment-readiness-card"><h3>Risk Queue</h3>${deploymentReadinessRiskList(input.deploymentReadinessReport.riskQueue)}</article><article class="deployment-readiness-card"><h3>다음 확인 단계</h3>${list(input.deploymentReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "serverless-readiness.html",
      title: "Serverless Readiness",
      html: pageShell("Serverless Readiness", "serverless-readiness.html", `<section class="panel" data-source-pattern="Serverless Framework"><h2>Serverless Snapshot</h2><p>${escapeHtml(input.serverlessReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.serverlessReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.serverlessReadinessReport.serverlessSetups.length}</dd></div><div><dt>config</dt><dd>${input.serverlessReadinessReport.configSignals.length}</dd></div><div><dt>functions</dt><dd>${input.serverlessReadinessReport.functionSignals.length}</dd></div><div><dt>events</dt><dd>${input.serverlessReadinessReport.eventSignals.length}</dd></div><div><dt>deployment</dt><dd>${input.serverlessReadinessReport.deploymentSignals.length}</dd></div><div><dt>safety</dt><dd>${input.serverlessReadinessReport.safetySignals.length}</dd></div></dl><p class="muted">RepoTutor records serverless readiness only; it does not run Serverless Framework, SAM, SST, Vercel, Netlify, Wrangler, package artifacts, deploy functions, invoke cloud resources, tail logs, mutate IAM, or remove stacks.</p></section><section class="grid"><article class="serverless-readiness-card"><h3>Serverless Setups</h3>${serverlessReadinessSetupList(input.serverlessReadinessReport.serverlessSetups)}</article><article class="serverless-readiness-card"><h3>Config Signals</h3>${serverlessReadinessSignalList(input.serverlessReadinessReport.configSignals, "signal")}</article><article class="serverless-readiness-card"><h3>Function Signals</h3>${serverlessReadinessSignalList(input.serverlessReadinessReport.functionSignals, "signal")}</article><article class="serverless-readiness-card"><h3>Event Signals</h3>${serverlessReadinessSignalList(input.serverlessReadinessReport.eventSignals, "signal")}</article></section><section class="grid"><article class="serverless-readiness-card"><h3>Runtime Signals</h3>${serverlessReadinessSignalList(input.serverlessReadinessReport.runtimeSignals, "signal")}</article><article class="serverless-readiness-card"><h3>Deployment Signals</h3>${serverlessReadinessSignalList(input.serverlessReadinessReport.deploymentSignals, "signal")}</article><article class="serverless-readiness-card"><h3>Safety Signals</h3>${serverlessReadinessSignalList(input.serverlessReadinessReport.safetySignals, "signal")}</article><article class="serverless-readiness-card"><h3>Package Signals</h3>${serverlessReadinessSignalList(input.serverlessReadinessReport.packageSignals, "signal")}</article><article class="serverless-readiness-card"><h3>Recommended Commands</h3>${serverlessReadinessCommandList(input.serverlessReadinessReport.recommendedCommands)}</article><article class="serverless-readiness-card"><h3>Risk Queue</h3>${serverlessReadinessRiskList(input.serverlessReadinessReport.riskQueue)}</article><article class="serverless-readiness-card"><h3>다음 확인 단계</h3>${list(input.serverlessReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "mobile-readiness.html",
      title: "Mobile Readiness",
      html: pageShell("Mobile Readiness", "mobile-readiness.html", `<section class="panel" data-source-pattern="Expo"><h2>Mobile Snapshot</h2><p>${escapeHtml(input.mobileReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.mobileReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.mobileReadinessReport.mobileSetups.length}</dd></div><div><dt>config</dt><dd>${input.mobileReadinessReport.configSignals.length}</dd></div><div><dt>platform</dt><dd>${input.mobileReadinessReport.platformSignals.length}</dd></div><div><dt>navigation</dt><dd>${input.mobileReadinessReport.navigationSignals.length}</dd></div><div><dt>build</dt><dd>${input.mobileReadinessReport.buildSignals.length}</dd></div><div><dt>updates</dt><dd>${input.mobileReadinessReport.updateSignals.length}</dd></div></dl><p class="muted">RepoTutor records mobile readiness only; it does not run Expo, EAS, Metro, emulators, native builds, prebuild, OTA update publishing, credentials, signing, store submission, or device installation.</p></section><section class="grid"><article class="mobile-readiness-card"><h3>Mobile Setups</h3>${mobileReadinessSetupList(input.mobileReadinessReport.mobileSetups)}</article><article class="mobile-readiness-card"><h3>Config Signals</h3>${mobileReadinessSignalList(input.mobileReadinessReport.configSignals, "signal")}</article><article class="mobile-readiness-card"><h3>Platform Signals</h3>${mobileReadinessSignalList(input.mobileReadinessReport.platformSignals, "signal")}</article><article class="mobile-readiness-card"><h3>Navigation Signals</h3>${mobileReadinessSignalList(input.mobileReadinessReport.navigationSignals, "signal")}</article></section><section class="grid"><article class="mobile-readiness-card"><h3>Build Signals</h3>${mobileReadinessSignalList(input.mobileReadinessReport.buildSignals, "signal")}</article><article class="mobile-readiness-card"><h3>Update Signals</h3>${mobileReadinessSignalList(input.mobileReadinessReport.updateSignals, "signal")}</article><article class="mobile-readiness-card"><h3>Asset Signals</h3>${mobileReadinessSignalList(input.mobileReadinessReport.assetSignals, "signal")}</article><article class="mobile-readiness-card"><h3>Package Signals</h3>${mobileReadinessSignalList(input.mobileReadinessReport.packageSignals, "signal")}</article><article class="mobile-readiness-card"><h3>Recommended Commands</h3>${mobileReadinessCommandList(input.mobileReadinessReport.recommendedCommands)}</article><article class="mobile-readiness-card"><h3>Risk Queue</h3>${mobileReadinessRiskList(input.mobileReadinessReport.riskQueue)}</article><article class="mobile-readiness-card"><h3>다음 확인 단계</h3>${list(input.mobileReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "desktop-readiness.html",
      title: "Desktop Readiness",
      html: pageShell("Desktop Readiness", "desktop-readiness.html", `<section class="panel" data-source-pattern="Tauri"><h2>Desktop Snapshot</h2><p>${escapeHtml(input.desktopReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.desktopReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.desktopReadinessReport.desktopSetups.length}</dd></div><div><dt>frameworks</dt><dd>${input.desktopReadinessReport.frameworkSignals.length}</dd></div><div><dt>config</dt><dd>${input.desktopReadinessReport.configSignals.length}</dd></div><div><dt>runtime</dt><dd>${input.desktopReadinessReport.runtimeSignals.length}</dd></div><div><dt>permissions</dt><dd>${input.desktopReadinessReport.permissionSignals.length}</dd></div><div><dt>release</dt><dd>${input.desktopReadinessReport.releaseSignals.length}</dd></div></dl><p class="muted">RepoTutor records desktop readiness only; it does not run Tauri, Electron, Wails, native builds, packaging, code signing, notarization, updater publishing, installer creation, or artifact upload.</p></section><section class="grid"><article class="desktop-readiness-card"><h3>Desktop Setups</h3>${desktopReadinessSetupList(input.desktopReadinessReport.desktopSetups)}</article><article class="desktop-readiness-card"><h3>Framework Signals</h3>${desktopReadinessSignalList(input.desktopReadinessReport.frameworkSignals, "signal")}</article><article class="desktop-readiness-card"><h3>Config Signals</h3>${desktopReadinessSignalList(input.desktopReadinessReport.configSignals, "signal")}</article><article class="desktop-readiness-card"><h3>Runtime Signals</h3>${desktopReadinessSignalList(input.desktopReadinessReport.runtimeSignals, "signal")}</article></section><section class="grid"><article class="desktop-readiness-card"><h3>Permission Signals</h3>${desktopReadinessSignalList(input.desktopReadinessReport.permissionSignals, "signal")}</article><article class="desktop-readiness-card"><h3>Bundle Signals</h3>${desktopReadinessSignalList(input.desktopReadinessReport.bundleSignals, "signal")}</article><article class="desktop-readiness-card"><h3>Release Signals</h3>${desktopReadinessSignalList(input.desktopReadinessReport.releaseSignals, "signal")}</article><article class="desktop-readiness-card"><h3>Package Signals</h3>${desktopReadinessSignalList(input.desktopReadinessReport.packageSignals, "signal")}</article><article class="desktop-readiness-card"><h3>Recommended Commands</h3>${desktopReadinessCommandList(input.desktopReadinessReport.recommendedCommands)}</article><article class="desktop-readiness-card"><h3>Risk Queue</h3>${desktopReadinessRiskList(input.desktopReadinessReport.riskQueue)}</article><article class="desktop-readiness-card"><h3>다음 확인 단계</h3>${list(input.desktopReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "edge-readiness.html",
      title: "Edge Readiness",
      html: pageShell("Edge Readiness", "edge-readiness.html", `<section class="panel" data-source-pattern="Cloudflare Workers"><h2>Edge Snapshot</h2><p>${escapeHtml(input.edgeReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.edgeReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.edgeReadinessReport.edgeSetups.length}</dd></div><div><dt>config</dt><dd>${input.edgeReadinessReport.configSignals.length}</dd></div><div><dt>handlers</dt><dd>${input.edgeReadinessReport.handlerSignals.length}</dd></div><div><dt>bindings</dt><dd>${input.edgeReadinessReport.bindingSignals.length}</dd></div><div><dt>routes</dt><dd>${input.edgeReadinessReport.routingSignals.length}</dd></div><div><dt>deploy</dt><dd>${input.edgeReadinessReport.deploymentSignals.length}</dd></div></dl><p class="muted">RepoTutor records edge readiness only; it does not run Wrangler, Miniflare, dev servers, deploy Workers, tail logs, publish versions, mutate routes, touch KV/R2/D1/Queues/Durable Objects, or read/write Cloudflare secrets.</p></section><section class="grid"><article class="edge-readiness-card"><h3>Edge Setups</h3>${edgeReadinessSetupList(input.edgeReadinessReport.edgeSetups)}</article><article class="edge-readiness-card"><h3>Config Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.configSignals, "signal")}</article><article class="edge-readiness-card"><h3>Handler Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.handlerSignals, "signal")}</article><article class="edge-readiness-card"><h3>Binding Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.bindingSignals, "signal")}</article></section><section class="grid"><article class="edge-readiness-card"><h3>Routing Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.routingSignals, "signal")}</article><article class="edge-readiness-card"><h3>Dev Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.devSignals, "signal")}</article><article class="edge-readiness-card"><h3>Deployment Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.deploymentSignals, "signal")}</article><article class="edge-readiness-card"><h3>Observability Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.observabilitySignals, "signal")}</article><article class="edge-readiness-card"><h3>Package Signals</h3>${edgeReadinessSignalList(input.edgeReadinessReport.packageSignals, "signal")}</article><article class="edge-readiness-card"><h3>Recommended Commands</h3>${edgeReadinessCommandList(input.edgeReadinessReport.recommendedCommands)}</article><article class="edge-readiness-card"><h3>Risk Queue</h3>${edgeReadinessRiskList(input.edgeReadinessReport.riskQueue)}</article><article class="edge-readiness-card"><h3>다음 확인 단계</h3>${list(input.edgeReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "compose-readiness.html",
      title: "Compose Readiness",
      html: pageShell("Compose Readiness", "compose-readiness.html", `<section class="panel" data-source-pattern="Docker Compose"><h2>Compose Snapshot</h2><p>${escapeHtml(input.composeReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.composeReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.composeReadinessReport.composeSetups.length}</dd></div><div><dt>config</dt><dd>${input.composeReadinessReport.configSignals.length}</dd></div><div><dt>services</dt><dd>${input.composeReadinessReport.serviceSignals.length}</dd></div><div><dt>dependencies</dt><dd>${input.composeReadinessReport.dependencySignals.length}</dd></div><div><dt>resources</dt><dd>${input.composeReadinessReport.resourceSignals.length}</dd></div><div><dt>workflow</dt><dd>${input.composeReadinessReport.workflowSignals.length}</dd></div></dl><p class="muted">RepoTutor records Compose readiness only; it does not run Docker, Docker Compose, Docker daemon, build/pull/push images, start/stop containers, mutate networks/volumes/secrets/configs, or inspect local runtime state.</p></section><section class="grid"><article class="compose-readiness-card"><h3>Compose Setups</h3>${composeReadinessSetupList(input.composeReadinessReport.composeSetups)}</article><article class="compose-readiness-card"><h3>Config Signals</h3>${composeReadinessSignalList(input.composeReadinessReport.configSignals, "signal")}</article><article class="compose-readiness-card"><h3>Service Signals</h3>${composeReadinessSignalList(input.composeReadinessReport.serviceSignals, "signal")}</article><article class="compose-readiness-card"><h3>Dependency Signals</h3>${composeReadinessSignalList(input.composeReadinessReport.dependencySignals, "signal")}</article></section><section class="grid"><article class="compose-readiness-card"><h3>Resource Signals</h3>${composeReadinessSignalList(input.composeReadinessReport.resourceSignals, "signal")}</article><article class="compose-readiness-card"><h3>Workflow Signals</h3>${composeReadinessSignalList(input.composeReadinessReport.workflowSignals, "signal")}</article><article class="compose-readiness-card"><h3>Safety Signals</h3>${composeReadinessSignalList(input.composeReadinessReport.safetySignals, "signal")}</article><article class="compose-readiness-card"><h3>Package Signals</h3>${composeReadinessSignalList(input.composeReadinessReport.packageSignals, "signal")}</article><article class="compose-readiness-card"><h3>Recommended Commands</h3>${composeReadinessCommandList(input.composeReadinessReport.recommendedCommands)}</article><article class="compose-readiness-card"><h3>Risk Queue</h3>${composeReadinessRiskList(input.composeReadinessReport.riskQueue)}</article><article class="compose-readiness-card"><h3>다음 확인 단계</h3>${list(input.composeReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "devcontainer-readiness.html",
      title: "Dev Container Readiness",
      html: pageShell("Dev Container Readiness", "devcontainer-readiness.html", `<section class="panel" data-source-pattern="Dev Containers"><h2>Dev Container Snapshot</h2><p>${escapeHtml(input.devContainerReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.devContainerReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.devContainerReadinessReport.devContainerSetups.length}</dd></div><div><dt>config</dt><dd>${input.devContainerReadinessReport.configSignals.length}</dd></div><div><dt>features</dt><dd>${input.devContainerReadinessReport.featureSignals.length}</dd></div><div><dt>lifecycle</dt><dd>${input.devContainerReadinessReport.lifecycleSignals.length}</dd></div><div><dt>workspace</dt><dd>${input.devContainerReadinessReport.workspaceSignals.length}</dd></div><div><dt>workflow</dt><dd>${input.devContainerReadinessReport.workflowSignals.length}</dd></div></dl><p class="muted">RepoTutor records Dev Container readiness only; it does not run devcontainer, Docker, Docker Compose, container builds, feature/template installs, lifecycle commands, mounts, ports, users, dotfiles, or secrets.</p></section><section class="grid"><article class="devcontainer-readiness-card"><h3>Dev Container Setups</h3>${devContainerReadinessSetupList(input.devContainerReadinessReport.devContainerSetups)}</article><article class="devcontainer-readiness-card"><h3>Config Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.configSignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Feature Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.featureSignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Lifecycle Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.lifecycleSignals, "signal")}</article></section><section class="grid"><article class="devcontainer-readiness-card"><h3>Environment Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.environmentSignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Workspace Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.workspaceSignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Customization Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.customizationSignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Workflow Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.workflowSignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Safety Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.safetySignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Package Signals</h3>${devContainerReadinessSignalList(input.devContainerReadinessReport.packageSignals, "signal")}</article><article class="devcontainer-readiness-card"><h3>Recommended Commands</h3>${devContainerReadinessCommandList(input.devContainerReadinessReport.recommendedCommands)}</article><article class="devcontainer-readiness-card"><h3>Risk Queue</h3>${devContainerReadinessRiskList(input.devContainerReadinessReport.riskQueue)}</article><article class="devcontainer-readiness-card"><h3>다음 확인 단계</h3>${list(input.devContainerReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "kubernetes-readiness.html",
      title: "Kubernetes Readiness",
      html: pageShell("Kubernetes Readiness", "kubernetes-readiness.html", `<section class="panel" data-source-pattern="Kubernetes"><h2>Kubernetes Snapshot</h2><p>${escapeHtml(input.kubernetesReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.kubernetesReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.kubernetesReadinessReport.kubernetesSetups.length}</dd></div><div><dt>manifests</dt><dd>${input.kubernetesReadinessReport.manifestSignals.length}</dd></div><div><dt>workloads</dt><dd>${input.kubernetesReadinessReport.workloadSignals.length}</dd></div><div><dt>network</dt><dd>${input.kubernetesReadinessReport.networkSignals.length}</dd></div><div><dt>kustomize</dt><dd>${input.kubernetesReadinessReport.kustomizeSignals.length}</dd></div><div><dt>workflow</dt><dd>${input.kubernetesReadinessReport.workflowSignals.length}</dd></div></dl><p class="muted">RepoTutor records Kubernetes readiness only; it does not run kubectl, kustomize, contact Kubernetes APIs, mutate clusters, namespaces, resources, secrets, port-forwards, or stream logs.</p></section><section class="grid"><article class="kubernetes-readiness-card"><h3>Kubernetes Setups</h3>${kubernetesReadinessSetupList(input.kubernetesReadinessReport.kubernetesSetups)}</article><article class="kubernetes-readiness-card"><h3>Manifest Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.manifestSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Workload Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.workloadSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Network Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.networkSignals, "signal")}</article></section><section class="grid"><article class="kubernetes-readiness-card"><h3>Config Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.configSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Storage Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.storageSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Security Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.securitySignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Health Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.healthSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Kustomize Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.kustomizeSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Workflow Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.workflowSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Package Signals</h3>${kubernetesReadinessSignalList(input.kubernetesReadinessReport.packageSignals, "signal")}</article><article class="kubernetes-readiness-card"><h3>Recommended Commands</h3>${kubernetesReadinessCommandList(input.kubernetesReadinessReport.recommendedCommands)}</article><article class="kubernetes-readiness-card"><h3>Risk Queue</h3>${kubernetesReadinessRiskList(input.kubernetesReadinessReport.riskQueue)}</article><article class="kubernetes-readiness-card"><h3>다음 확인 단계</h3>${list(input.kubernetesReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "gitops-readiness.html",
      title: "GitOps Readiness",
      html: pageShell("GitOps Readiness", "gitops-readiness.html", `<section class="panel" data-source-pattern="GitOps"><h2>GitOps Snapshot</h2><p>${escapeHtml(input.gitopsReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.gitopsReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.gitopsReadinessReport.gitopsSetups.length}</dd></div><div><dt>argo</dt><dd>${input.gitopsReadinessReport.argoSignals.length}</dd></div><div><dt>flux sources</dt><dd>${input.gitopsReadinessReport.fluxSourceSignals.length}</dd></div><div><dt>flux reconcile</dt><dd>${input.gitopsReadinessReport.fluxReconcileSignals.length}</dd></div><div><dt>workflow</dt><dd>${input.gitopsReadinessReport.workflowSignals.length}</dd></div><div><dt>safety</dt><dd>${input.gitopsReadinessReport.safetySignals.length}</dd></div></dl><p class="muted">RepoTutor records GitOps readiness only; it does not run argocd, flux, kubectl, contact Kubernetes APIs, contact GitOps controllers, sync or reconcile applications, mutate clusters, repositories, namespaces, resources, secrets, webhooks, or stream logs.</p></section><section class="grid"><article class="gitops-readiness-card"><h3>GitOps Setups</h3>${gitopsReadinessSetupList(input.gitopsReadinessReport.gitopsSetups)}</article><article class="gitops-readiness-card"><h3>Argo Signals</h3>${gitopsReadinessSignalList(input.gitopsReadinessReport.argoSignals, "signal")}</article><article class="gitops-readiness-card"><h3>Flux Source Signals</h3>${gitopsReadinessSignalList(input.gitopsReadinessReport.fluxSourceSignals, "signal")}</article><article class="gitops-readiness-card"><h3>Flux Reconcile Signals</h3>${gitopsReadinessSignalList(input.gitopsReadinessReport.fluxReconcileSignals, "signal")}</article></section><section class="grid"><article class="gitops-readiness-card"><h3>Image and Notification Signals</h3>${gitopsReadinessSignalList(input.gitopsReadinessReport.imageNotificationSignals, "signal")}</article><article class="gitops-readiness-card"><h3>Workflow Signals</h3>${gitopsReadinessSignalList(input.gitopsReadinessReport.workflowSignals, "signal")}</article><article class="gitops-readiness-card"><h3>Safety Signals</h3>${gitopsReadinessSignalList(input.gitopsReadinessReport.safetySignals, "signal")}</article><article class="gitops-readiness-card"><h3>Package Signals</h3>${gitopsReadinessSignalList(input.gitopsReadinessReport.packageSignals, "signal")}</article><article class="gitops-readiness-card"><h3>Recommended Commands</h3>${gitopsReadinessCommandList(input.gitopsReadinessReport.recommendedCommands)}</article><article class="gitops-readiness-card"><h3>Risk Queue</h3>${gitopsReadinessRiskList(input.gitopsReadinessReport.riskQueue)}</article><article class="gitops-readiness-card"><h3>다음 확인 단계</h3>${list(input.gitopsReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "backup-readiness.html",
      title: "Backup Readiness",
      html: pageShell("Backup Readiness", "backup-readiness.html", `<section class="panel" data-source-pattern="Backup"><h2>Backup Snapshot</h2><p>${escapeHtml(input.backupReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.backupReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>setups</dt><dd>${input.backupReadinessReport.backupSetups.length}</dd></div><div><dt>velero</dt><dd>${input.backupReadinessReport.veleroSignals.length}</dd></div><div><dt>litestream</dt><dd>${input.backupReadinessReport.litestreamSignals.length}</dd></div><div><dt>restic</dt><dd>${input.backupReadinessReport.resticSignals.length}</dd></div><div><dt>restore drills</dt><dd>${input.backupReadinessReport.restoreDrillSignals.length}</dd></div><div><dt>safety</dt><dd>${input.backupReadinessReport.safetySignals.length}</dd></div></dl><p class="muted">RepoTutor records backup readiness only; it does not run Velero, Litestream, restic, cron, Kubernetes APIs, object storage calls, repository unlocks, integrity checks, restores, pruning, or backup jobs.</p></section><section class="grid"><article class="backup-readiness-card"><h3>Backup Setups</h3>${backupReadinessSetupList(input.backupReadinessReport.backupSetups)}</article><article class="backup-readiness-card"><h3>Velero Signals</h3>${backupReadinessSignalList(input.backupReadinessReport.veleroSignals, "signal")}</article><article class="backup-readiness-card"><h3>Litestream Signals</h3>${backupReadinessSignalList(input.backupReadinessReport.litestreamSignals, "signal")}</article><article class="backup-readiness-card"><h3>Restic Signals</h3>${backupReadinessSignalList(input.backupReadinessReport.resticSignals, "signal")}</article></section><section class="grid"><article class="backup-readiness-card"><h3>Restore Drill Signals</h3>${backupReadinessSignalList(input.backupReadinessReport.restoreDrillSignals, "signal")}</article><article class="backup-readiness-card"><h3>Safety Signals</h3>${backupReadinessSignalList(input.backupReadinessReport.safetySignals, "signal")}</article><article class="backup-readiness-card"><h3>Package Signals</h3>${backupReadinessSignalList(input.backupReadinessReport.packageSignals, "signal")}</article><article class="backup-readiness-card"><h3>Recommended Commands</h3>${backupReadinessCommandList(input.backupReadinessReport.recommendedCommands)}</article><article class="backup-readiness-card"><h3>Risk Queue</h3>${backupReadinessRiskList(input.backupReadinessReport.riskQueue)}</article><article class="backup-readiness-card"><h3>다음 확인 단계</h3>${list(input.backupReadinessReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "context-pack.html",
      title: "Context Pack",
      html: pageShell("Context Pack", "context-pack.html", `<section class="panel" data-source-pattern="Repomix"><h2>LLM Context Pack 예산</h2><p>${escapeHtml(input.contextPackReport.summary)}</p><p class="muted">${escapeHtml(input.contextPackReport.sourcePattern)}</p><dl class="meta"><div><dt>파일</dt><dd>${input.contextPackReport.totalIncludedFiles}</dd></div><div><dt>bytes</dt><dd>${input.contextPackReport.totalIncludedBytes}</dd></div><div><dt>tokens</dt><dd>${input.contextPackReport.totalEstimatedTokens}</dd></div><div><dt>excluded</dt><dd>${input.contextPackReport.excludedFromPack.length}</dd></div></dl></section><section class="grid"><article class="context-pack-card"><h3>Token Budget</h3>${list(input.contextPackReport.budgetProfiles.map((profile) => `${profile.name}: ${profile.fits ? "fits" : `overflow ${profile.overflowTokens}`} / ${profile.tokenLimit}`))}</article><article class="context-pack-card"><h3>Split Output Plan</h3>${contextSplitPlanList(input.contextPackReport.splitPlans)}</article><article class="context-pack-card"><h3>Directory Token Tree</h3>${list(input.contextPackReport.directoryTokenTree.map((item) => `${item.directory}: ${item.estimatedTokens} tokens · ${item.fileCount} files`))}</article><article class="context-pack-card"><h3>Security Notes</h3>${list(input.contextPackReport.securityNotes)}</article><article class="context-pack-card"><h3>다음 확인 단계</h3>${list(input.contextPackReport.learnerNextSteps)}</article></section><section class="panel"><h2>Pack 제외 항목</h2>${list(input.contextPackReport.excludedFromPack)}</section><section class="cards context-pack-cards">${contextPackCards(input.contextPackReport.topFiles)}</section>`, input)
    },
    {
      name: "mcp-handoff.html",
      title: "MCP Handoff",
      html: pageShell("MCP Handoff", "mcp-handoff.html", `<section class="panel" data-source-pattern="codebase-mcp"><h2>AI/MCP 인계 계획</h2><p>${escapeHtml(input.mcpHandoffReport.summary)}</p><p class="muted">${escapeHtml(input.mcpHandoffReport.sourcePattern)}</p></section><section class="cards mcp-handoff-cards">${mcpToolCards(input.mcpHandoffReport.tools)}</section><section class="cards mcp-prompt-cards">${input.mcpHandoffReport.prompts.map((item) => `<article class="mcp-prompt-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.prompt)}</p><a href="${escapeHtml(htmlPageHref(item.relatedReportHref))}">관련 리포트 열기</a></article>`).join("")}</section><section class="grid"><article class="mcp-handoff-card"><h3>Safety Notes</h3>${list(input.mcpHandoffReport.safetyNotes)}</article><article class="mcp-handoff-card"><h3>다음 확인 단계</h3>${list(input.mcpHandoffReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "agent-memory.html",
      title: "Agent Memory",
      html: pageShell("Agent Memory", "agent-memory.html", `<section class="panel" data-source-pattern="Obsidian Graphify"><h2>Persistent Agent Memory</h2><p>${escapeHtml(input.agentMemoryReport.summary)}</p><p class="muted">${escapeHtml(input.agentMemoryReport.sourcePattern)}</p><dl class="meta"><div><dt>raw tokens</dt><dd>${input.agentMemoryReport.tokenSavings.rawCodeReadTokens}</dd></div><div><dt>graph query target</dt><dd>${input.agentMemoryReport.tokenSavings.graphQueryTokenTarget}</dd></div><div><dt>estimated reduction</dt><dd>${input.agentMemoryReport.tokenSavings.estimatedReductionX}x</dd></div><div><dt>memory notes</dt><dd>${input.agentMemoryReport.memoryNotes.length}</dd></div></dl></section><section class="cards agent-memory-layer-cards">${agentMemoryLayerCards(input.agentMemoryReport.layers)}</section><section class="cards agent-memory-note-cards">${agentMemoryNoteCards(input.agentMemoryReport.memoryNotes)}</section><section class="grid"><article class="agent-memory-card"><h3>Context Navigation Rules</h3>${list(input.agentMemoryReport.contextNavigationRules)}</article><article class="agent-memory-card"><h3>다음 확인 단계</h3>${list(input.agentMemoryReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "graph-query.html",
      title: "Graph Query",
      html: pageShell("Graph Query", "graph-query.html", `<section class="panel" data-source-pattern="Graphify"><h2>Graph Query Guide</h2><p>${escapeHtml(input.graphQueryReport.summary)}</p><p class="muted">${escapeHtml(input.graphQueryReport.sourcePattern)}</p></section><section class="cards graph-query-mode-cards">${graphQueryModeCards(input.graphQueryReport.queryModes)}</section><section class="cards graph-explain-cards">${input.graphQueryReport.nodeExplanations.map((item) => `<article class="graph-query-card"><h3>${escapeHtml(item.label)}</h3><p class="muted">${escapeHtml(item.type)}</p><code>${escapeHtml(item.question)}</code>${item.href ? `<p><a href="${escapeHtml(item.href)}">관련 페이지 열기</a></p>` : ""}</article>`).join("")}</section><section class="cards graph-path-cards">${input.graphQueryReport.pathPrompts.map((item) => `<article class="graph-query-card"><h3>${escapeHtml(item.from)} -> ${escapeHtml(item.to)}</h3><code>${escapeHtml(item.question)}</code><p>${escapeHtml(item.reason)}</p></article>`).join("")}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.graphQueryReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "tutorial-abstractions.html",
      title: "Tutorial Abstractions",
      html: pageShell("Tutorial Abstractions", "tutorial-abstractions.html", `<section class="panel" data-source-pattern="PocketFlow"><h2>Codebase Tutorial Plan</h2><p>${escapeHtml(input.tutorialAbstractionReport.summary)}</p><p class="muted">${escapeHtml(input.tutorialAbstractionReport.sourcePattern)}</p></section><section class="cards tutorial-abstraction-cards">${tutorialAbstractionCards(input.tutorialAbstractionReport.abstractions)}</section><section class="grid"><article class="tutorial-abstraction-card"><h3>Relationships</h3>${list(input.tutorialAbstractionReport.relationships.map((item) => `${item.fromId} -> ${item.toId} [${item.label}]: ${item.reason}`))}</article><article class="tutorial-abstraction-card"><h3>Chapter Order</h3>${list(input.tutorialAbstractionReport.chapterOrder.map((item) => `${item.chapterNumber}. ${item.title}: ${item.whyNow}`))}</article><article class="tutorial-abstraction-card"><h3>다음 확인 단계</h3>${list(input.tutorialAbstractionReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "decision-records.html",
      title: "Decision Records",
      html: pageShell("Decision Records", "decision-records.html", `<section class="panel" data-source-pattern="Log4brains"><h2>Architecture Decision Records</h2><p>${escapeHtml(input.decisionRecordReport.summary)}</p><p class="muted">${escapeHtml(input.decisionRecordReport.sourcePattern)}</p></section><section class="grid"><article class="decision-record-card"><h3>Status Counts</h3>${list(Object.entries(input.decisionRecordReport.statusCounts).map(([status, count]) => `${status}: ${count}`))}</article><article class="decision-record-card"><h3>Timeline</h3>${list(input.decisionRecordReport.timeline.map((item) => `${item.sequence}. ${item.title} [${item.status}]`))}</article><article class="decision-record-card"><h3>Package Scopes</h3>${list(input.decisionRecordReport.packageScopes.map((item) => `${item.name}: ${item.adrFolder} (${item.recordCount})`))}</article></section><section class="cards decision-record-cards">${decisionRecordCards(input.decisionRecordReport.records)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.decisionRecordReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "dependency-health.html",
      title: "Dependency Health",
      html: pageShell("Dependency Health", "dependency-health.html", `<section class="panel" data-source-pattern="dependency-cruiser"><h2>Dependency Graph Health</h2><p>${escapeHtml(input.dependencyHealthReport.summary)}</p><p class="muted">${escapeHtml(input.dependencyHealthReport.sourcePattern)}</p><dl class="meta"><div><dt>nodes</dt><dd>${input.dependencyHealthReport.graphMetrics.nodeCount}</dd></div><div><dt>localDependencyEdges</dt><dd>${input.dependencyHealthReport.totalLocalDependencies}</dd></div><div><dt>cycles</dt><dd>${input.dependencyHealthReport.cycles.length}</dd></div><div><dt>orphanModules</dt><dd>${input.dependencyHealthReport.orphanModules.length}</dd></div></dl></section><section class="grid"><article class="dependency-health-card"><h3>Graph Metrics</h3>${list([`max fan-in: ${input.dependencyHealthReport.graphMetrics.maxFanIn}`, `max fan-out: ${input.dependencyHealthReport.graphMetrics.maxFanOut}`, `edge count: ${input.dependencyHealthReport.graphMetrics.edgeCount}`])}</article><article class="dependency-health-card"><h3>no-circular</h3>${dependencyCycleCards(input.dependencyHealthReport.cycles)}</article><article class="dependency-health-card"><h3>no-orphans</h3>${dependencyOrphanList(input.dependencyHealthReport.orphanModules)}</article><article class="dependency-health-card"><h3>Rule Violations</h3>${dependencyViolationList(input.dependencyHealthReport.ruleViolations)}</article></section><section class="grid"><article class="dependency-health-card"><h3>Top Fan-in</h3>${dependencyFanList(input.dependencyHealthReport.graphMetrics.topFanIn)}</article><article class="dependency-health-card"><h3>Top Fan-out</h3>${dependencyFanList(input.dependencyHealthReport.graphMetrics.topFanOut)}</article><article class="dependency-health-card"><h3>Local Dependency Edges</h3>${dependencyEdgeList(input.dependencyHealthReport.localDependencyEdges)}</article><article class="dependency-health-card"><h3>다음 확인 단계</h3>${list(input.dependencyHealthReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "session-verification.html",
      title: "세션 검증",
      html: pageShell("세션 검증", "session-verification.html", `<section class="panel"><h2>검증 리포트</h2><p>이 세션은 생성 완료 후 필수 산출물, HTML export 무결성, 소스 근거 링크를 검증합니다.</p><dl class="meta"><div><dt>필수 산출물</dt><dd>session, analysis, markdown, HTML</dd></div><div><dt>HTML 무결성</dt><dd>manifest bytes + sha256</dd></div><div><dt>소스 근거</dt><dd>source path, source href, lesson anchor</dd></div></dl></section><section class="grid"><article><h3>JSON 리포트</h3><p>자동화와 CLI 검증에 적합한 구조화 리포트입니다.</p><a href="../analysis/session-verification-report.json">session-verification-report.json</a></article><article><h3>Markdown 리포트</h3><p>사람이 읽기 쉬운 PASS/FAIL 요약입니다.</p><a href="../markdown/session-verification.md">session-verification.md</a></article><article><h3>CLI 재검증</h3><p>같은 세션 폴더에서 <code>repo-tutor verify-session</code>을 실행하면 현재 파일 상태를 다시 확인합니다.</p></article></section>`, input)
    },
    {
      name: "coverage.html",
      title: "학습 커버리지",
      html: pageShell("학습 커버리지", "coverage.html", `<section class="panel"><h2>커버리지 요약</h2><p>${escapeHtml(input.coverageReport.beginnerExplanation)}</p><dl class="meta"><div><dt>전체 파일</dt><dd>${input.coverageReport.totalScannedFiles}</dd></div><div><dt>핵심 파일 설명</dt><dd>${input.coverageReport.coveredImportantFiles}</dd></div><div><dt>비율</dt><dd>${(input.coverageReport.coverageRatio * 100).toFixed(1)}%</dd></div><div><dt>소스 근거 파일</dt><dd>${coverageEvidence.evidenceBackedFiles}</dd></div><div><dt>근거 비율</dt><dd>${(coverageEvidence.evidenceCoverageRatio * 100).toFixed(1)}%</dd></div><div><dt>근거 종류</dt><dd>${coverageEvidenceKinds.length}</dd></div></dl></section><section class="grid"><article><h3>소스 근거 종류</h3>${list(coverageEvidenceKinds)}</article><article><h3>우선 확인 폴더</h3>${list(input.coverageReport.highPriorityFolders.map((folder) => `${folder.folderPath}: ${folder.reason}`))}</article><article><h3>미커버 후보</h3>${list(input.coverageReport.uncoveredImportantFiles)}</article><article><h3>소스 근거 부족</h3>${linkedFileList(coverageEvidence.filesWithoutEvidence)}</article></section>`, input)
    },
    {
      name: "component-graph.html",
      title: "컴포넌트 그래프",
      html: pageShell("컴포넌트 그래프", "component-graph.html", `<section class="panel"><h2>관계도</h2><p>${escapeHtml(input.componentGraphReport.beginnerExplanation)}</p><div class="toolbar component-graph-download-toolbar" role="toolbar" aria-label="component graph downloads"><button type="button" data-download-mermaid="component-graph-mermaid">Mermaid 다운로드</button></div><pre id="component-graph-mermaid">${escapeHtml(input.componentGraphReport.mermaid)}</pre></section><section class="panel"><h2>큰 그래프 요약</h2><p>${escapeHtml(graphSummary.largeRepoAdvice)}</p><dl class="meta"><div><dt>노드</dt><dd>${graphSummary.totalNodes}</dd></div><div><dt>관계</dt><dd>${graphSummary.totalEdges}</dd></div></dl><h3>노드 타입</h3>${list(Object.entries(graphSummary.nodeTypeCounts).map(([type, count]) => `${type}: ${count}`))}<h3>핵심 허브</h3>${list(graphSummary.topConnectedNodes.map((node) => `${node.label} [${node.type}] · degree ${node.degree}`))}</section><section class="panel"><h2>노드 필터</h2><div class="toolbar graph-filter-toolbar" role="toolbar" aria-label="component graph filters">${graphFilters}</div></section><section class="grid"><article><h3>진입 노드</h3>${list(input.componentGraphReport.entryNodeIds)}</article><article><h3>관계</h3>${list(input.componentGraphReport.edges.slice(0, 40).map((edge) => `${edge.from} -> ${edge.to}: ${edge.label}`))}</article></section><section class="cards component-node-cards">${input.componentGraphReport.nodes.map((node) => `<article id="${componentNodeAnchor(node.id)}" class="component-node-anchor" data-node-id="${escapeHtml(node.id)}" data-node-type="${escapeHtml(node.type)}"><h3>${escapeHtml(node.label)}</h3><p class="muted">${escapeHtml(node.type)}</p><p>${escapeHtml(node.summary)}</p>${node.href ? `<a href="${escapeHtml(node.href)}">관련 학습 섹션</a>` : ""}${componentNodeRelations(node.id, input.componentGraphReport)}</article>`).join("")}</section>`, input)
    },
    {
      name: "incremental.html",
      title: "증분 분석",
      html: pageShell("증분 분석", "incremental.html", `<section class="panel"><h2>변화 요약</h2><p>${escapeHtml(input.incrementalReport.beginnerExplanation)}</p><p class="lead">${escapeHtml(input.incrementalReport.summary)}</p><dl class="meta"><div><dt>baseline</dt><dd>${escapeHtml(input.incrementalReport.baselineSessionId ?? "none")}</dd></div><div><dt>tracked files</dt><dd>${input.sourceSnapshotReport.totalFiles}</dd></div></dl></section><section class="panel"><h2>커버리지 변화</h2><p>${escapeHtml(coverageDelta.summary)}</p><dl class="meta"><div><dt>이전 비율</dt><dd>${escapeHtml(formatPercentOrNone(coverageDelta.baselineCoverageRatio))}</dd></div><div><dt>현재 비율</dt><dd>${escapeHtml(formatPercentOrNone(coverageDelta.currentCoverageRatio))}</dd></div><div><dt>변화</dt><dd>${escapeHtml(formatPointDelta(coverageDelta.coverageRatioDelta))}</dd></div><div><dt>핵심 파일</dt><dd>${coverageDelta.currentCoveredImportantFiles}</dd></div></dl></section><section class="grid"><article><h3>추가</h3>${list(input.incrementalReport.addedFiles)}</article><article><h3>변경</h3>${list(input.incrementalReport.changedFiles)}</article><article><h3>삭제</h3>${list(input.incrementalReport.removedFiles)}</article><article><h3>유지</h3><p>${input.incrementalReport.unchangedFiles.length}개 파일</p></article></section>`, input)
    },
    {
      name: "flow.html",
      title: "실행 흐름",
      html: pageShell("실행 흐름", "flow.html", `<section class="grid"><article><h3>시작점</h3>${list(input.flowReport.startPoints)}</article><article><h3>CLI 흐름</h3>${list(input.flowReport.cliFlow)}</article><article><h3>앱 흐름</h3>${list(input.flowReport.appFlow)}</article><article><h3>데이터 흐름</h3>${list(input.flowReport.dataFlow)}</article></section><section class="panel"><h2>Mermaid</h2><pre>${escapeHtml(input.flowReport.mermaid)}</pre></section>`, input)
    },
    {
      name: "glossary.html",
      title: "용어 사전",
      html: pageShell("용어 사전", "glossary.html", `<section class="cards">${input.glossary.map((term) => `<article id="${htmlAnchor(term.termEn)}"><h3>${escapeHtml(term.termKo)} (${escapeHtml(term.termEn)})</h3><p>${escapeHtml(term.simpleDefinition)}</p><p>${escapeHtml(term.projectSpecificMeaning)}</p><p class="muted">${escapeHtml(term.exampleFromRepo)}</p></article>`).join("")}</section>`, input)
    },
    {
      name: "rebuild.html",
      title: "맨땅에서 따라 만들기",
      html: pageShell("맨땅에서 따라 만들기", "rebuild.html", `<section class="cards">${input.rebuildRoadmap.steps.map((step) => `<article><h3>${step.order}. ${escapeHtml(step.title)}</h3><p>${escapeHtml(step.goal)}</p><h4>해야 할 일</h4>${list(step.tasks)}<h4>완료 기준</h4>${list(step.completionCriteria)}</article>`).join("")}</section>`, input)
    },
    {
      name: "quiz.html",
      title: "퀴즈",
      html: pageShell("퀴즈", "quiz.html", `<section class="panel"><h2>오프라인 복습 모드</h2><p>브라우저에서 선택지를 눌러 즉시 정답을 확인할 수 있습니다. 응시 기록 저장과 오답노트 반영은 CLI 또는 Tauri 앱에서 수행합니다.</p><p id="quiz-live-score" class="muted">아직 선택한 문제가 없습니다.</p><div class="toolbar quiz-reset-toolbar" role="toolbar" aria-label="quiz reset controls"><button type="button" data-reset-quiz>복습 초기화</button></div></section><section class="panel"><h2>퀴즈 필터</h2><p>섹션과 난이도 기준으로 복습할 문제를 좁힙니다.</p><h3>섹션</h3><div class="toolbar quiz-section-toolbar" role="toolbar" aria-label="quiz section filters">${quizFilters.sectionButtons}</div><h3>난이도</h3><div class="toolbar quiz-difficulty-toolbar" role="toolbar" aria-label="quiz difficulty filters">${quizFilters.difficultyButtons}</div></section><section class="cards quiz-board">${input.quiz.questions.map((question, index) => `<article id="${question.id}" class="quiz-card" data-quiz-section="${escapeHtml(question.section)}" data-quiz-difficulty="${escapeHtml(question.difficulty)}"><h3>${index + 1}. ${escapeHtml(question.question)}</h3><p class="muted">${escapeHtml(question.section)} · ${escapeHtml(question.difficulty)}</p><div class="choice-grid">${Object.entries(question.choices).map(([key, value]) => `<button class="choice" data-correct="${key === question.correctChoice}" data-question="${question.id}"><strong>${key}</strong>. ${escapeHtml(value)}</button>`).join("")}</div><details><summary>정답과 해설</summary><p>${escapeHtml(question.correctChoice)}: ${escapeHtml(question.explanation)}</p></details></article>`).join("")}</section>`, input)
    },
    {
      name: "quiz-print.html",
      title: "퀴즈 정답지",
      html: pageShell("퀴즈 정답지", "quiz-print.html", `<section class="panel"><h2>인쇄용 정답지</h2><p>브라우저 print preview에서 질문, 선택지, 정답, 해설, 연결 수업을 한 번에 확인합니다.</p></section><section class="cards print-answer-key">${input.quiz.questions.map((question, index) => `<article id="${question.id}-print" class="print-answer-card"><h3>${index + 1}. ${escapeHtml(question.question)}</h3><ol>${Object.entries(question.choices).map(([key, value]) => `<li><strong>${key}</strong>. ${escapeHtml(value)}</li>`).join("")}</ol><p><strong>정답:</strong> ${escapeHtml(question.correctChoice)}</p><p><strong>해설:</strong> ${escapeHtml(question.explanation)}</p><p><strong>연결 수업:</strong> <a href="${escapeHtml(question.relatedLessonPath)}">${escapeHtml(question.relatedLessonPath)}</a></p></article>`).join("")}</section>`, input)
    },
    {
      name: "wrong-notes.html",
      title: "오답노트",
      html: pageShell("오답노트", "wrong-notes.html", `<section class="cards">${input.wrongNotes.length === 0 ? "<article><h3>아직 오답이 없습니다.</h3><p>퀴즈를 풀면 이곳에 복습 자료가 쌓입니다.</p></article>" : input.wrongNotes.map((note) => `<article id="${note.questionId}"><h3>${escapeHtml(note.question)}</h3><p>내 답: ${note.selectedChoice} / 정답: ${note.correctChoice}</p><p>${escapeHtml(note.reviewText)}</p><h4>미니 강의</h4><p>${escapeHtml(note.miniLesson)}</p><label><input type="checkbox"> 복습 완료</label></article>`).join("")}</section>`, input)
    }
  ];

  const assets = {
    "assets/style.css": styleCss(),
    "assets/app.js": appJs(),
    "assets/component-graph.mmd": input.componentGraphReport.mermaid,
    "assets/learning-path.tour.json": learningPathTourJson(input, learningPath),
    "assets/search-index.json": `${JSON.stringify(input.searchIndexReport, null, 2)}\n`,
    "assets/learning-journal-template.md": input.learningJournalReport.journalTemplateMarkdown.endsWith("\n")
      ? input.learningJournalReport.journalTemplateMarkdown
      : `${input.learningJournalReport.journalTemplateMarkdown}\n`
  };
  const pageEntries = pages.map((page) => ({
    name: page.name,
    path: `html/${page.name}`,
    title: page.title,
    bytes: byteLength(page.html),
    sha256: sha256(page.html)
  }));
  const assetEntries = Object.entries(assets).map(([assetPath, content]) => ({
    path: assetPath,
    bytes: byteLength(content),
    sha256: sha256(content)
  }));

  const manifest: HtmlExportManifest = {
    sessionId: input.session.sessionId,
    generatedAt: new Date().toISOString(),
    manifestPath: "html/manifest.json",
    readmePath: "html/EXPORT-README.md",
    entrypoints: [
      { label: "학습 시작", path: "html/index.html", description: "전체 학습 리포트의 시작 페이지입니다." },
      { label: "퀴즈", path: "html/quiz.html", description: "오프라인 브라우저 복습 문제를 풉니다." },
      { label: "퀴즈 정답지", path: "html/quiz-print.html", description: "인쇄용 질문, 선택지, 정답, 해설을 확인합니다." },
      { label: "오답노트", path: "html/wrong-notes.html", description: "틀린 문제를 다시 보는 페이지입니다." },
      { label: "소스 근거 인덱스", path: "html/evidence.html", description: "파일 수업 근거와 복사된 원본 소스 파일을 함께 탐색합니다." },
      { label: "추천 읽기", path: "html/suggested-reads.html", description: "먼저 읽을 핵심 파일을 source-backed 순서로 확인합니다." },
      { label: "실행 환경", path: "html/runtime-environment.html", description: "설치, 런타임, Docker/Compose 신호를 확인합니다." },
      { label: "인터페이스 맵", path: "html/interface-map.html", description: "Route/page/API/component 신호와 data-flow 힌트를 확인합니다." },
      { label: "심볼 맵", path: "html/symbol-map.html", description: "함수, 클래스, 상수, 타입 신호를 원본 소스와 함께 확인합니다." },
      { label: "API Reference", path: "html/api-reference.html", description: "TypeDoc식 entry point, public symbol, export warning을 확인합니다." },
      { label: "Search Index", path: "html/search-index.html", description: "Pagefind식 document, filter, metadata, term index를 확인합니다." },
      { label: "Learning Journal", path: "html/learning-journal.html", description: "learn-codebase식 active recall 질문, mastery map, spaced review queue를 확인합니다." },
      { label: "Project Activity", path: "html/project-activity.html", description: "Repowise식 activity snapshot, hotspot, dead-code, decision review queue를 확인합니다." },
      { label: "Code Metrics Readiness", path: "html/code-metrics-readiness.html", description: "scc/lizard/tokei식 LOC, branch token, hotspot, metric workflow 준비도를 확인합니다." },
      { label: "Code Ownership Readiness", path: "html/code-ownership-readiness.html", description: "CODEOWNERS식 위치, 규칙, owner, validator, required review 준비도를 확인합니다." },
      { label: "Large Asset Readiness", path: "html/large-asset-readiness.html", description: "Git LFS/DVC식 large file, dataset, model, media asset versioning 준비도를 확인합니다." },
      { label: "License Rights", path: "html/license-rights.html", description: "Licensee식 license file, package metadata, README license reference 검토 상태를 확인합니다." },
      { label: "SBOM", path: "html/sbom.html", description: "Syft식 package artifact, file artifact, relationship inventory를 확인합니다." },
      { label: "Security Readiness", path: "html/security-readiness.html", description: "Trivy식 scan target, scanner coverage, security signal, action queue를 확인합니다." },
      { label: "Project Scorecard", path: "html/scorecard.html", description: "OpenSSF Scorecard식 check, risk, policy finding, remediation queue를 확인합니다." },
      { label: "Provenance Readiness", path: "html/provenance.html", description: "Cosign식 signature material, bundle, attestation, identity requirement를 확인합니다." },
      { label: "Advisory Query Readiness", path: "html/advisories.html", description: "OSV-Scanner식 package advisory query target, lockfile, policy control 준비도를 확인합니다." },
      { label: "OpenVEX Impact Readiness", path: "html/vex.html", description: "OpenVEX식 product, status, justification, SARIF filter, attestation 준비도를 확인합니다." },
      { label: "Policy Gate Readiness", path: "html/policy-gates.html", description: "OPA식 Rego policy, input/data, test, bundle, decision gate 준비도를 확인합니다." },
      { label: "API Contract Readiness", path: "html/api-contracts.html", description: "Schemathesis식 schema, generated phase, response check, runtime/reporting 준비도를 확인합니다." },
      { label: "Consumer Contract Readiness", path: "html/consumer-contract-readiness.html", description: "Pact식 interaction, provider state, verifier, broker/can-i-deploy, matcher 준비도를 확인합니다." },
      { label: "Observability Readiness", path: "html/observability.html", description: "OpenTelemetry식 signal pipeline, instrumentation, exporter, resource/context 준비도를 확인합니다." },
      { label: "Performance Readiness", path: "html/performance.html", description: "k6식 load script, workload model, threshold, output 준비도를 확인합니다." },
      { label: "Load Testing Readiness", path: "html/load-testing-readiness.html", description: "k6/Artillery/Locust식 load profile, protocol, SLO gate, report 준비도를 확인합니다." },
      { label: "Benchmark Readiness", path: "html/benchmark-readiness.html", description: "Tinybench/Benchmark.js/Hyperfine식 suite, timing, comparison, report, CI 준비도를 확인합니다." },
      { label: "E2E Readiness", path: "html/e2e.html", description: "Playwright식 browser project, locator, assertion, trace/report 준비도를 확인합니다." },
      { label: "Flaky Test Readiness", path: "html/flaky-test-readiness.html", description: "Playwright/Pytest/Jest식 retry, quarantine, fail-on-flaky, artifact 준비도를 확인합니다." },
      { label: "Test Impact Readiness", path: "html/test-impact-readiness.html", description: "Nx/Jest/pytest-testmon식 affected, related, changed-only test selection 준비도를 확인합니다." },
      { label: "Test Reporting Readiness", path: "html/test-reporting-readiness.html", description: "CTRF/Allure/JUnit/GitHub Actions식 report format, annotations, summaries, artifacts 준비도를 확인합니다." },
      { label: "Snapshot Readiness", path: "html/snapshot-readiness.html", description: "Jest/Vitest/Playwright식 snapshot assertion, update policy, serializer, baseline 준비도를 확인합니다." },
      { label: "Property-Based Testing Readiness", path: "html/property-based-testing-readiness.html", description: "fast-check/Hypothesis/jqwik식 generator, shrink, seed, counterexample, stateful, CI 준비도를 확인합니다." },
      { label: "Test Data Readiness", path: "html/test-data-readiness.html", description: "Factory Bot/factory_boy/Faker식 factory, trait, association, sequence, seed, lint 준비도를 확인합니다." },
      { label: "Integration Test Environment Readiness", path: "html/integration-test-environment-readiness.html", description: "Testcontainers식 container fixture, wait strategy, lifecycle cleanup, runtime 준비도를 확인합니다." },
      { label: "Chaos Engineering Readiness", path: "html/chaos-engineering-readiness.html", description: "Chaos Mesh, LitmusChaos, Toxiproxy식 fault, scope, probe, cleanup 준비도를 확인합니다." },
      { label: "Accessibility Readiness", path: "html/accessibility.html", description: "axe-core식 scan target, WCAG/category tag, result bucket, impact 준비도를 확인합니다." },
      { label: "Storybook Readiness", path: "html/storybook.html", description: "Storybook식 CSF story, args, addon, test/publish signal 준비도를 확인합니다." },
      { label: "Design Tokens Readiness", path: "html/design-tokens.html", description: "Style Dictionary식 token source, platform, transform, usage 준비도를 확인합니다." },
      { label: "I18n Readiness", path: "html/i18n.html", description: "FormatJS식 message source, locale asset, extraction, ICU, QA 준비도를 확인합니다." },
      { label: "Release Readiness", path: "html/release-readiness.html", description: "semantic-release식 config, branch, plugin, CI, auth, publish target 준비도를 확인합니다." },
      { label: "Secret Readiness", path: "html/secret-readiness.html", description: "Gitleaks식 scan target, secret surface, config, report, prevention 준비도를 확인합니다." },
      { label: "Secret Management Readiness", path: "html/secret-management-readiness.html", description: "Vault/Infisical/Doppler/SOPS식 platform, auth, storage, delivery, governance 준비도를 확인합니다." },
      { label: "Container Readiness", path: "html/container-readiness.html", description: "Hadolint식 Dockerfile, Compose, config, instruction, label, CI 준비도를 확인합니다." },
      { label: "Code Quality", path: "html/code-quality.html", description: "Biome식 formatter, linter, assist, config, CI/editor 준비도를 확인합니다." },
      { label: "Documentation Readiness", path: "html/documentation.html", description: "Docusaurus식 docs, blog, pages, navigation, i18n, search, build/deploy 준비도를 확인합니다." },
      { label: "Database Readiness", path: "html/database-readiness.html", description: "Prisma식 schema, datasource, migration, generated client, seed/env 준비도를 확인합니다." },
      { label: "Database Migration Readiness", path: "html/database-migration-readiness.html", description: "Flyway/Liquibase/Alembic식 versioned migration, changelog, revision, rollback, validation 준비도를 확인합니다." },
      { label: "Database ORM Readiness", path: "html/database-orm-readiness.html", description: "TypeORM/Sequelize/SQLAlchemy식 entity/model, relation, repository/session, transaction 준비도를 확인합니다." },
      { label: "Data Quality Readiness", path: "html/data-quality-readiness.html", description: "Great Expectations/SodaCL/dbt식 expectation, freshness, failed-row, artifact 준비도를 확인합니다." },
      { label: "Data Lineage Readiness", path: "html/data-lineage-readiness.html", description: "OpenLineage/Marquez/dbt식 event, dataset edge, facet, column lineage, artifact 준비도를 확인합니다." },
      { label: "Data Catalog Readiness", path: "html/data-catalog-readiness.html", description: "OpenMetadata/DataHub/Amundsen식 ingestion, entity, governance, search, lineage 준비도를 확인합니다." },
      { label: "Data Annotation Readiness", path: "html/data-annotation-readiness.html", description: "Label Studio/FiftyOne/Argilla식 project, task, schema, workflow, quality, prelabel, export 준비도를 확인합니다." },
      { label: "Feature Store Readiness", path: "html/feature-store-readiness.html", description: "Feast/Feathr/Hopsworks식 definition, source, storage, retrieval, materialization 준비도를 확인합니다." },
      { label: "Model Registry Readiness", path: "html/model-registry-readiness.html", description: "MLflow/Kubeflow/BentoML식 registered model, version, artifact, metadata, serving 준비도를 확인합니다." },
      { label: "Experiment Tracking Readiness", path: "html/experiment-tracking-readiness.html", description: "MLflow/W&B/Neptune식 experiment, run, metric, artifact, offline sync 준비도를 확인합니다." },
      { label: "Model Monitoring Readiness", path: "html/model-monitoring-readiness.html", description: "Evidently/whylogs/NannyML식 reference/current, drift, quality, performance, alert 준비도를 확인합니다." },
      { label: "Model Serving Readiness", path: "html/model-serving-readiness.html", description: "KServe/Seldon/Triton식 inference service, runtime, protocol, routing, health 준비도를 확인합니다." },
      { label: "Model Training Readiness", path: "html/model-training-readiness.html", description: "Lightning/Accelerate/Ray Train식 trainer, train loop, distributed launch, checkpoint, callback 준비도를 확인합니다." },
      { label: "CI/CD Readiness", path: "html/ci-cd.html", description: "GitHub Actions식 workflow, trigger, job, permission, cache/artifact, deployment 준비도를 확인합니다." },
      { label: "Unit Test Readiness", path: "html/unit-tests.html", description: "Vitest식 test file, assertion, mock, coverage, environment, reporter 준비도를 확인합니다." },
      { label: "Coverage Readiness", path: "html/coverage-readiness.html", description: "nyc/c8/Codecov식 instrumentation, scope, threshold, report, upload 준비도를 확인합니다." },
      { label: "Mutation Testing Readiness", path: "html/mutation-testing-readiness.html", description: "Stryker/Infection식 mutate scope, runner, mutator, threshold, reporter 준비도를 확인합니다." },
      { label: "Typecheck Readiness", path: "html/typecheck-readiness.html", description: "TypeScript식 tsconfig, strict flag, project reference, module resolution, declaration, tsc script 준비도를 확인합니다." },
      { label: "Package Manager Readiness", path: "html/package-manager.html", description: "pnpm식 manifest, workspace, lockfile, script, install policy 준비도를 확인합니다." },
      { label: "Git Hooks Readiness", path: "html/git-hooks.html", description: "Husky식 hook file, install script, pre-commit/pre-push, bypass policy 준비도를 확인합니다." },
      { label: "Task Runner Readiness", path: "html/task-runner.html", description: "Turborepo식 config, task graph, cache, dependsOn/env, package script 준비도를 확인합니다." },
      { label: "Dependency Updates Readiness", path: "html/dependency-updates.html", description: "Renovate식 config, packageRules, automerge, dashboard, registry, package file 준비도를 확인합니다." },
      { label: "Lint Readiness", path: "html/lint-readiness.html", description: "ESLint식 flat config, rules, plugins, parser, ignores, fix/cache/report 준비도를 확인합니다." },
      { label: "Format Readiness", path: "html/format-readiness.html", description: "Prettier식 config, ignore, options, plugins, check/write/cache 준비도를 확인합니다." },
      { label: "Commit Conventions", path: "html/commit-conventions.html", description: "commitlint식 config, rules, commit-msg hook, CI range, prompt/CLI 준비도를 확인합니다." },
      { label: "Changelog Readiness", path: "html/changelog-readiness.html", description: "Changesets식 changeset files, changelog config, status/version/publish 준비도를 확인합니다." },
      { label: "Bundle Analysis", path: "html/bundle-analysis.html", description: "Webpack Bundle Analyzer식 stats JSON, chunks, source maps, compression size 준비도를 확인합니다." },
      { label: "Mocking Readiness", path: "html/mocking-readiness.html", description: "MSW식 handlers, setupWorker/setupServer, lifecycle, unhandled request policy 준비도를 확인합니다." },
      { label: "Data Fetching Readiness", path: "html/data-fetching-readiness.html", description: "TanStack Query식 QueryClient, hooks, cache, invalidation, hydration 준비도를 확인합니다." },
      { label: "Routing Readiness", path: "html/routing-readiness.html", description: "React Router식 router mode, route definitions, navigation API, data route, file route 준비도를 확인합니다." },
      { label: "State Management Readiness", path: "html/state-management-readiness.html", description: "Redux Toolkit식 store setup, slices, selectors, side effects, middleware, RTK Query 준비도를 확인합니다." },
      { label: "Form Readiness", path: "html/form-readiness.html", description: "React Hook Form식 useForm, register, submit, validation, errors, field array 준비도를 확인합니다." },
      { label: "Auth Readiness", path: "html/auth-readiness.html", description: "Auth.js식 handlers, providers, callbacks, sessions, middleware, env secret 준비도를 확인합니다." },
      { label: "Authorization Readiness", path: "html/authorization-readiness.html", description: "OpenFGA/Casbin/CASL/Oso식 permission model, enforcement, identity boundary, governance, test 준비도를 확인합니다." },
      { label: "Payment Readiness", path: "html/payment-readiness.html", description: "Stripe식 server client, checkout, PaymentIntent, webhooks, billing lifecycle, env secret 준비도를 확인합니다." },
      { label: "Email Readiness", path: "html/email-readiness.html", description: "Resend식 provider client, send payload, templates, domains, webhooks, env secret 준비도를 확인합니다." },
      { label: "Queue Readiness", path: "html/queue-readiness.html", description: "BullMQ식 Queue, Worker, QueueEvents, FlowProducer, Redis connection, retry 준비도를 확인합니다." },
      { label: "Cache Readiness", path: "html/cache-readiness.html", description: "Node Redis식 client setup, get/set, TTL, invalidation, connection, advanced Redis 준비도를 확인합니다." },
      { label: "Logging Readiness", path: "html/logging-readiness.html", description: "Pino식 logger setup, level, context binding, redaction, transport 준비도를 확인합니다." },
      { label: "Feature Flag Readiness", path: "html/feature-flag-readiness.html", description: "OpenFeature식 provider, evaluation, targeting context, hooks, tracking 준비도를 확인합니다." },
      { label: "Rate Limit Readiness", path: "html/rate-limit-readiness.html", description: "rate-limiter-flexible식 limiter setup, quota, identity key, store, response header 준비도를 확인합니다." },
      { label: "Error Tracking Readiness", path: "html/error-tracking-readiness.html", description: "Sentry식 init, capture, context, filtering, tracing, replay 준비도를 확인합니다." },
      { label: "Analytics Readiness", path: "html/analytics-readiness.html", description: "PostHog식 init, capture, identity, pageview, consent, feature flag, replay 준비도를 확인합니다." },
      { label: "HTTP Client Readiness", path: "html/http-client-readiness.html", description: "Got식 request, timeout, retry, hooks, transport, error metadata 준비도를 확인합니다." },
      { label: "Schema Validation Readiness", path: "html/schema-validation-readiness.html", description: "Zod식 schema shape, parse/safeParse, refinement, error output, integration 준비도를 확인합니다." },
      { label: "Datetime Readiness", path: "html/datetime-readiness.html", description: "Luxon식 parsing, formatting, timezone, duration, interval, validity 준비도를 확인합니다." },
      { label: "ID Generation Readiness", path: "html/id-generation-readiness.html", description: "Nano ID식 generator, entropy, alphabet, runtime, usage, validation 준비도를 확인합니다." },
      { label: "Image Processing Readiness", path: "html/image-processing-readiness.html", description: "Sharp식 input, resize/format, metadata, output, safety, performance 준비도를 확인합니다." },
      { label: "File Upload Readiness", path: "html/file-upload-readiness.html", description: "Uppy식 input, restrictions, transport, lifecycle, safety 준비도를 확인합니다." },
      { label: "WebSocket Readiness", path: "html/websocket-readiness.html", description: "ws식 server/client, upgrade, message, lifecycle, safety 준비도를 확인합니다." },
      { label: "PDF Generation Readiness", path: "html/pdf-generation-readiness.html", description: "pdf-lib식 document, page, asset, form, output, safety 준비도를 확인합니다." },
      { label: "Spreadsheet Readiness", path: "html/spreadsheet-readiness.html", description: "SheetJS식 workbook, sheet, format, input, output, safety 준비도를 확인합니다." },
      { label: "Chart Visualization Readiness", path: "html/chart-visualization-readiness.html", description: "Chart.js식 chart type, data, scale, interaction, render, lifecycle 준비도를 확인합니다." },
      { label: "Diagram Rendering Readiness", path: "html/diagram-rendering-readiness.html", description: "Mermaid식 syntax, render, theme, security, layout, output 준비도를 확인합니다." },
      { label: "Link Integrity Readiness", path: "html/link-integrity-readiness.html", description: "Lychee식 link target, policy, network, output, CI 준비도를 확인합니다." },
      { label: "SEO Metadata Readiness", path: "html/seo-metadata-readiness.html", description: "Nuxt SEO식 robots, sitemap, metadata, structured data, AEO 준비도를 확인합니다." },
      { label: "PWA Readiness", path: "html/pwa-readiness.html", description: "Vite PWA식 manifest, service worker, Workbox cache, update/install 준비도를 확인합니다." },
      { label: "Browser Compatibility Readiness", path: "html/browser-compat-readiness.html", description: "Browserslist식 target browser config, query, coverage, update 준비도를 확인합니다." },
      { label: "Browser Extension Readiness", path: "html/browser-extension-readiness.html", description: "WXT/Plasmo/CRXJS식 manifest, entrypoint, permission, messaging, build/publish 준비도를 확인합니다." },
      { label: "Env Validation Readiness", path: "html/env-validation-readiness.html", description: "t3-env식 server/client schema, runtimeEnv, client prefix, validation hook 준비도를 확인합니다." },
      { label: "Security Headers Readiness", path: "html/security-headers-readiness.html", description: "Helmet식 CSP, HSTS, cross-origin, legacy hardening header 준비도를 확인합니다." },
      { label: "GraphQL Readiness", path: "html/graphql-readiness.html", description: "GraphQL.js식 schema, operation, resolver, validation, execution 준비도를 확인합니다." },
      { label: "CLI Readiness", path: "html/cli-readiness.html", description: "Commander.js식 command, option, argument, action, help, error 준비도를 확인합니다." },
      { label: "LLM Readiness", path: "html/llm-readiness.html", description: "LangChain.js식 model, prompt, tool, RAG, structured output, streaming 준비도를 확인합니다." },
      { label: "LLM Eval Readiness", path: "html/llm-eval-readiness.html", description: "promptfoo/OpenAI eval/OpenEvals식 prompt, provider, dataset, judge, red-team 준비도를 확인합니다." },
      { label: "LLM Observability Readiness", path: "html/llm-observability-readiness.html", description: "Langfuse/Phoenix/Helicone식 trace, session, token/cost, feedback, gateway 준비도를 확인합니다." },
      { label: "Vector DB Readiness", path: "html/vector-db-readiness.html", description: "Qdrant/Weaviate/Chroma식 collection, embedding, ingestion, query, index, ops 준비도를 확인합니다." },
      { label: "Search Service Readiness", path: "html/search-service-readiness.html", description: "Meilisearch/Typesense/OpenSearch식 index, document, query, relevance, ops 준비도를 확인합니다." },
      { label: "Object Storage Readiness", path: "html/object-storage-readiness.html", description: "S3/MinIO/R2/Supabase Storage식 bucket, object lifecycle, access, reliability, security, ops 준비도를 확인합니다." },
      { label: "Realtime Collaboration Readiness", path: "html/realtime-collaboration-readiness.html", description: "Yjs/Automerge/Liveblocks식 shared document, provider, presence, sync, persistence 준비도를 확인합니다." },
      { label: "Workflow Orchestration Readiness", path: "html/workflow-orchestration-readiness.html", description: "Temporal/Inngest/Trigger.dev식 trigger, execution, durability, flow control, runtime 준비도를 확인합니다." },
      { label: "OpenAPI Client Readiness", path: "html/openapi-client-readiness.html", description: "openapi-typescript/Orval/OpenAPI Generator식 spec, generator, output, runtime, quality 준비도를 확인합니다." },
      { label: "Webhook Readiness", path: "html/webhook-readiness.html", description: "Svix/Standard Webhooks/Hookdeck식 endpoint, signature, replay, idempotency, delivery, local debug 준비도를 확인합니다." },
      { label: "Notification Readiness", path: "html/notification-readiness.html", description: "Novu식 workflow, subscriber, topic, preference, channel, template, delivery operation 준비도를 확인합니다." },
      { label: "Consent Readiness", path: "html/consent-readiness.html", description: "CookieConsent/Klaro/IAB TCF식 banner, category, script blocking, privacy control, vendor/purpose consent 준비도를 확인합니다." },
      { label: "Privacy Readiness", path: "html/privacy-readiness.html", description: "Presidio/OpenDP/scrubadub식 PII detection, redaction, policy, retention, DSAR, privacy budget 준비도를 확인합니다." },
      { label: "Server Framework Readiness", path: "html/server-framework-readiness.html", description: "Fastify식 route, schema, plugin, hook, runtime, test 준비도를 확인합니다." },
      { label: "RPC Readiness", path: "html/rpc-readiness.html", description: "tRPC식 router, procedure, validation, context, client, adapter 준비도를 확인합니다." },
      { label: "Workspace Graph Readiness", path: "html/workspace-graph-readiness.html", description: "Nx식 project graph, target, affected, boundary, plugin 준비도를 확인합니다." },
      { label: "Scaffolding Readiness", path: "html/scaffolding-readiness.html", description: "Plop식 generator, prompt, action, template, safety 준비도를 확인합니다." },
      { label: "Scheduler Readiness", path: "html/scheduler-readiness.html", description: "node-cron식 schedule, task, lifecycle, reliability 준비도를 확인합니다." },
      { label: "Build Tool Readiness", path: "html/build-tool-readiness.html", description: "Vite식 config, plugin, dev server, build, env, SSR 준비도를 확인합니다." },
      { label: "Styling Readiness", path: "html/styling-readiness.html", description: "Tailwind CSS식 config, directive, utility, theme, plugin, build integration 준비도를 확인합니다." },
      { label: "Visual Regression Readiness", path: "html/visual-regression-readiness.html", description: "reg-suit식 actual/expected/diff screenshots, thresholds, reports, plugins, storage, notification 준비도를 확인합니다." },
      { label: "Infrastructure Readiness", path: "html/infrastructure-readiness.html", description: "OpenTofu식 .tf config, provider/resource/module, backend/state, plan/apply workflow 준비도를 확인합니다." },
      { label: "Deployment Readiness", path: "html/deployment-readiness.html", description: "Helm식 Chart.yaml, values.yaml, templates, release workflow, safety flag 준비도를 확인합니다." },
      { label: "Context Pack", path: "html/context-pack.html", description: "LLM context pack token budget과 제외 항목을 확인합니다." },
      { label: "MCP Handoff", path: "html/mcp-handoff.html", description: "AI/MCP 도구에 넘길 tool, prompt, safety note를 확인합니다." },
      { label: "Agent Memory", path: "html/agent-memory.html", description: "새 AI 세션이 먼저 읽을 persistent memory note와 context navigation rule을 확인합니다." },
      { label: "Graph Query", path: "html/graph-query.html", description: "Graphify식 query, path, explain 질문으로 그래프 탐색 순서를 정합니다." },
      { label: "Tutorial Abstractions", path: "html/tutorial-abstractions.html", description: "PocketFlow식 핵심 추상화, 관계, 장 순서를 확인합니다." },
      { label: "Decision Records", path: "html/decision-records.html", description: "Log4brains식 ADR 후보, status, context, consequences를 확인합니다." },
      { label: "Dependency Health", path: "html/dependency-health.html", description: "dependency-cruiser식 순환, 고아 모듈, fan-in/fan-out을 확인합니다." },
      { label: "세션 검증", path: "html/session-verification.html", description: "생성 산출물과 무결성 검증 리포트를 확인합니다." },
      { label: "컴포넌트 그래프", path: "html/component-graph.html", description: "큰 저장소의 폴더, 파일, 용어, 재구현 단계를 탐색합니다." }
    ],
    pages: pageEntries,
    assets: assetEntries,
    integrity: {
      algorithm: "sha256",
      coveredFiles: pageEntries.length + assetEntries.length
    }
  };

  return { pages, assets, manifest };
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function coverageEvidenceFor(report: CoverageReport): Pick<CoverageReport, "evidenceBackedFiles" | "evidenceCoverageRatio" | "evidenceKindCounts" | "filesWithoutEvidence"> {
  const maybeReport = report as CoverageReport & Partial<Pick<CoverageReport, "evidenceBackedFiles" | "evidenceCoverageRatio" | "evidenceKindCounts" | "filesWithoutEvidence">>;
  return {
    evidenceBackedFiles: maybeReport.evidenceBackedFiles ?? 0,
    evidenceCoverageRatio: maybeReport.evidenceCoverageRatio ?? 0,
    evidenceKindCounts: maybeReport.evidenceKindCounts ?? {},
    filesWithoutEvidence: maybeReport.filesWithoutEvidence ?? []
  };
}

function evidenceKindList(counts: Record<string, number>): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([kind, count]) => `${kind}: ${count}`);
}

function coverageDeltaFor(report: IncrementalReport): IncrementalReport["coverageDelta"] {
  return report.coverageDelta ?? {
    baselineCoverageRatio: null,
    currentCoverageRatio: 0,
    coverageRatioDelta: null,
    baselineCoveredImportantFiles: null,
    currentCoveredImportantFiles: 0,
    coveredImportantFilesDelta: null,
    baselineTotalScannedFiles: null,
    currentTotalScannedFiles: 0,
    totalScannedFilesDelta: null,
    summary: "이 세션은 coverage delta 필드가 추가되기 전에 생성되어 커버리지 변화량을 표시하지 않습니다."
  };
}

function formatPercentOrNone(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%`;
}

function formatPointDelta(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%p`;
}

function graphSummaryFor(report: ComponentGraphReport): ComponentGraphReport["summary"] {
  const maybeReport = report as ComponentGraphReport & { summary?: ComponentGraphReport["summary"] };
  if (maybeReport.summary) return maybeReport.summary;
  const nodeTypeCounts = countBy(report.nodes.map((node) => node.type));
  const edgeLabelCounts = countBy(report.edges.map((edge) => edge.label));
  const degree = new Map<string, number>();
  for (const edge of report.edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }
  return {
    totalNodes: report.nodes.length,
    totalEdges: report.edges.length,
    nodeTypeCounts,
    edgeLabelCounts,
    topConnectedNodes: report.nodes
      .map((node) => ({ id: node.id, label: node.label, type: node.type, degree: degree.get(node.id) ?? 0 }))
      .sort((a, b) => b.degree - a.degree || a.label.localeCompare(b.label))
      .slice(0, 8),
    largeRepoAdvice: "이 세션은 graph summary 필드가 추가되기 전에 생성되어 HTML에서 요약을 재계산했습니다."
  };
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function graphFilterButtons(nodes: ComponentGraphReport["nodes"]): string {
  const labels: Record<ComponentGraphReport["nodes"][number]["type"] | "all", string> = {
    all: "전체",
    root: "루트",
    folder: "폴더",
    file: "파일",
    term: "용어",
    "rebuild-step": "재구현"
  };
  const counts = new Map<string, number>();
  for (const node of nodes) counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
  const types = ["all", "root", "folder", "file", "term", "rebuild-step"] as const;
  return types.map((type) => {
    const count = type === "all" ? nodes.length : counts.get(type) ?? 0;
    return `<button type="button" class="${type === "all" ? "active" : ""}" data-graph-filter="${type}">${labels[type]} ${count}</button>`;
  }).join("");
}

function componentNodeRelations(nodeId: string, report: ComponentGraphReport): string {
  const labels = new Map(report.nodes.map((node) => [node.id, node.label]));
  const rows = report.edges
    .flatMap((edge) => {
      if (edge.from === nodeId) {
        return [{ direction: "outgoing", targetId: edge.to, text: `outgoing -> ${labels.get(edge.to) ?? edge.to}: ${edge.label}` }];
      }
      if (edge.to === nodeId) {
        return [{ direction: "incoming", targetId: edge.from, text: `incoming <- ${labels.get(edge.from) ?? edge.from}: ${edge.label}` }];
      }
      return [];
    })
    .slice(0, 8);
  if (rows.length === 0) return "<h4>연결 관계</h4><p class=\"muted\">직접 연결된 관계가 없습니다.</p>";
  return `<h4>연결 관계</h4><ul class="component-node-relations">${rows.map((row) => `<li data-node-relation="${row.direction}"><a data-node-link="${escapeHtml(row.targetId)}" href="#${componentNodeAnchor(row.targetId)}">${escapeHtml(row.text)}</a></li>`).join("")}</ul>`;
}

function componentNodeAnchor(nodeId: string): string {
  return `component-node-${htmlAnchor(nodeId)}`;
}

function learningPathFor(input: StudyHtmlInput): Array<{ title: string; href: string; goal: string; evidence: string }> {
  return [
    {
      title: "프로젝트 목적 확인",
      href: "index.html",
      goal: input.purposeReport.oneLineSummary,
      evidence: `대상 사용자 ${input.purposeReport.targetUsers.length}개, 문제 정의 ${input.purposeReport.solvedProblems.length}개`
    },
    {
      title: "언어와 의존성 파악",
      href: "language.html",
      goal: `${input.languageReport.primaryLanguage} 중심의 기술 스택을 먼저 확인합니다.`,
      evidence: `manifest ${input.dependencyReport.manifests.length}개`
    },
    {
      title: "실행 환경 신호 확인",
      href: "runtime-environment.html",
      goal: "설치, 런타임, Docker/Compose 단서를 보고 프로젝트를 어떻게 실행할지 추정합니다.",
      evidence: `setup ${input.runtimeEnvironmentReport.setupSignals.length}개, container ${input.runtimeEnvironmentReport.containerSignals.length}개`
    },
    {
      title: "인터페이스와 데이터 흐름 확인",
      href: "interface-map.html",
      goal: "Route/page/API/component 신호를 연결해 사용자가 들어오는 경로와 데이터 이동을 추적합니다.",
      evidence: `route ${input.interfaceMapReport.routeSignals.length}개, API ${input.interfaceMapReport.apiSignals.length}개`
    },
    {
      title: "함수와 클래스 심볼 확인",
      href: "symbol-map.html",
      goal: "함수, 클래스, 상수, 타입 이름을 공개 API와 내부 구현 단위로 나누어 추적합니다.",
      evidence: `symbol ${input.symbolMapReport.totalSymbols}개`
    },
    {
      title: "공개 API reference 확인",
      href: "api-reference.html",
      goal: "entry point와 exported symbol을 TypeDoc식 API 문서 순서로 확인합니다.",
      evidence: `entry points ${input.apiReferenceReport.entryPoints.length}개, public symbols ${input.apiReferenceReport.publicSymbols.length}개`
    },
    {
      title: "정적 검색 인덱스 확인",
      href: "search-index.html",
      goal: "generated HTML, file lesson, folder lesson이 어떤 document/filter/meta/term 색인으로 묶였는지 확인합니다.",
      evidence: `PageFragmentData ${input.searchIndexReport.totalDocuments}개, MetaIndex terms ${input.searchIndexReport.totalTerms}개`
    },
    {
      title: "학습 저널 질문에 먼저 답하기",
      href: "learning-journal.html",
      goal: "파일 수업을 읽기 전 예측 질문에 답하고, mastery map과 spaced review queue를 다음 세션의 시작점으로 남깁니다.",
      evidence: `open questions ${input.learningJournalReport.openQuestions.length}개, spaced review ${input.learningJournalReport.spacedReviewQueue.length}개`
    },
    {
      title: "Project activity risk queue 확인",
      href: "project-activity.html",
      goal: "snapshot-only activity, hotspot 후보, dead-code 후보, decision prompt를 변경 전 검토 queue로 정리합니다.",
      evidence: `hotspots ${input.projectActivityReport.hotspotCandidates.length}개, dead-code candidates ${input.projectActivityReport.deadCodeCandidates.length}개`
    },
    {
      title: "Code metrics hotspot 확인",
      href: "code-metrics-readiness.html",
      goal: "scc/lizard/tokei식 LOC, branch token, function-like token을 보고 읽기 어려운 파일과 metric workflow를 분리합니다.",
      evidence: `code lines ${input.codeMetricsReadinessReport.totals.codeLines}개, hotspots ${input.codeMetricsReadinessReport.hotspots.length}개`
    },
    {
      title: "Code ownership 준비도 확인",
      href: "code-ownership-readiness.html",
      goal: "CODEOWNERS 위치, rule, owner, validator, required review 신호를 보고 리뷰 소유권 contract를 확인합니다.",
      evidence: `CODEOWNERS files ${input.codeOwnershipReadinessReport.codeownerFiles.length}개, review signals ${input.codeOwnershipReadinessReport.reviewSignals.length}개`
    },
    {
      title: "Large asset versioning 준비도 확인",
      href: "large-asset-readiness.html",
      goal: "Git LFS/DVC/submodule 신호를 보고 large file, dataset, model, media asset을 어떻게 재현할지 확인합니다.",
      evidence: `asset setups ${input.largeAssetReadinessReport.assetSetups.length}개, DVC signals ${input.largeAssetReadinessReport.dvcSignals.length}개`
    },
    {
      title: "라이선스와 소스 권리 확인",
      href: "license-rights.html",
      goal: "Licensee식 license file, package metadata, README license reference를 분리해 공개/재사용 전 검토 상태를 확인합니다.",
      evidence: `license files ${input.licenseRightsReport.licenseFiles.length}개, warnings ${input.licenseRightsReport.reviewWarnings.length}개`
    },
    {
      title: "SBOM 패키지 인벤토리 확인",
      href: "sbom.html",
      goal: "Syft식 source descriptor, package artifact, file artifact, relationship inventory로 배포 전 구성요소를 확인합니다.",
      evidence: `package artifacts ${input.sbomReport.packageArtifacts.length}개, relationships ${input.sbomReport.relationships.length}개`
    },
    {
      title: "보안 스캔 준비 상태 확인",
      href: "security-readiness.html",
      goal: "Trivy식 target/scanner readiness를 보고 실제 스캐너 실행 전에 lockfile, license, IaC, secret-scan 범위 누락을 확인합니다.",
      evidence: `scanner coverage ${input.securityReadinessReport.scannerCoverage.length}개, action queue ${input.securityReadinessReport.actionQueue.length}개`
    },
    {
      title: "Project scorecard risk queue 확인",
      href: "scorecard.html",
      goal: "OpenSSF Scorecard식 checks, policy findings, remediation queue를 보고 provider-only unknown과 정적 실패를 분리합니다.",
      evidence: `aggregate ${input.scorecardReport.aggregateScore}/10, checks ${input.scorecardReport.checks.length}개`
    },
    {
      title: "Provenance 서명 준비도 확인",
      href: "provenance.html",
      goal: "Cosign식 signature bundle, attestation, certificate identity, OIDC issuer 요구사항을 release 전에 분리해 확인합니다.",
      evidence: `signature material ${input.provenanceReport.signatureSignals.length}개, risk queue ${input.provenanceReport.riskQueue.length}개`
    },
    {
      title: "Advisory 질의 준비도 확인",
      href: "advisories.html",
      goal: "OSV-Scanner식 package extraction, vulnerability matching, offline DB, ignore policy 준비도를 확인합니다.",
      evidence: `query targets ${input.advisoryReport.packageQueryTargets.length}개, policies ${input.advisoryReport.policyControls.length}개`
    },
    {
      title: "OpenVEX impact 준비도 확인",
      href: "vex.html",
      goal: "OpenVEX식 product identity, status justification, SARIF filter, attestation 준비도를 분리해 확인합니다.",
      evidence: `product targets ${input.vexReport.productTargets.length}개, workflow ${input.vexReport.documentWorkflow.length}개`
    },
    {
      title: "Policy gate 준비도 확인",
      href: "policy-gates.html",
      goal: "OPA식 Rego policy, input/data fixture, test, bundle, decision output 준비도를 확인합니다.",
      evidence: `policy documents ${input.policyGateReport.policyDocuments.length}개, gate queries ${input.policyGateReport.gateQueries.length}개`
    },
    {
      title: "API contract 준비도 확인",
      href: "api-contracts.html",
      goal: "Schemathesis식 schema, generated phase, response check, runtime target, reporting output 준비도를 확인합니다.",
      evidence: `schema documents ${input.apiContractReport.schemaDocuments.length}개, operation targets ${input.apiContractReport.operationTargets.length}개`
    },
    {
      title: "Consumer contract 준비도 확인",
      href: "consumer-contract-readiness.html",
      goal: "Pact식 consumer interaction, provider state, verifier, broker/can-i-deploy, matcher 흐름을 확인합니다.",
      evidence: `contract setups ${input.consumerContractReadinessReport.contractSetups.length}개, broker signals ${input.consumerContractReadinessReport.brokerSignals.length}개`
    },
    {
      title: "Observability 준비도 확인",
      href: "observability.html",
      goal: "OpenTelemetry식 traces, metrics, logs pipeline과 exporter/resource/context 설정을 확인합니다.",
      evidence: `signal pipelines ${input.observabilityReport.signalPipelines.length}개, instrumentation ${input.observabilityReport.instrumentationSignals.length}개`
    },
    {
      title: "Performance 준비도 확인",
      href: "performance.html",
      goal: "k6식 load script, workload model, threshold, check, output 준비도를 확인합니다.",
      evidence: `script targets ${input.performanceReport.scriptTargets.length}개, thresholds ${input.performanceReport.thresholds.length}개`
    },
    {
      title: "Load testing readiness 확인",
      href: "load-testing-readiness.html",
      goal: "k6, Artillery, Locust식 profile, protocol, SLO gate, data, execution, report 준비도를 확인합니다.",
      evidence: `load setups ${input.loadTestingReadinessReport.loadTestSetups.length}개, assertion signals ${input.loadTestingReadinessReport.assertionSignals.length}개`
    },
    {
      title: "Benchmark readiness 확인",
      href: "benchmark-readiness.html",
      goal: "Tinybench, Benchmark.js, Hyperfine식 suite, timing control, comparison, report, CI 준비도를 확인합니다.",
      evidence: `benchmark suites ${input.benchmarkReadinessReport.benchmarkSuites.length}개, comparison signals ${input.benchmarkReadinessReport.comparisonSignals.length}개`
    },
    {
      title: "E2E 준비도 확인",
      href: "e2e.html",
      goal: "Playwright식 browser project, locator, assertion, trace/report 준비도를 확인합니다.",
      evidence: `test suites ${input.e2eReport.testSuites.length}개, locator signals ${input.e2eReport.locatorSignals.length}개`
    },
    {
      title: "Flaky test 준비도 확인",
      href: "flaky-test-readiness.html",
      goal: "Playwright, pytest-rerunfailures, Jest식 retry, quarantine, fail-on-flaky, artifact 준비도를 확인합니다.",
      evidence: `setups ${input.flakyTestReadinessReport.flakyTestSetups.length}개, retry signals ${input.flakyTestReadinessReport.retrySignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Test impact 준비도 확인",
      href: "test-impact-readiness.html",
      goal: "Nx affected, Jest findRelatedTests/onlyChanged, pytest-testmon식 영향도 기반 test selection 준비도를 확인합니다.",
      evidence: `setups ${input.testImpactReadinessReport.impactSetups.length}개, selection signals ${input.testImpactReadinessReport.selectionSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Test reporting 준비도 확인",
      href: "test-reporting-readiness.html",
      goal: "CTRF, Allure, JUnit XML, GitHub annotations/checks/summaries/artifacts 준비도를 확인합니다.",
      evidence: `setups ${input.testReportingReadinessReport.reportSetups.length}개, adapter signals ${input.testReportingReadinessReport.adapterSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Snapshot 준비도 확인",
      href: "snapshot-readiness.html",
      goal: "Jest, Vitest, Playwright식 text/inline/file/visual/ARIA snapshots, update policy, serializer, baseline 준비도를 확인합니다.",
      evidence: `setups ${input.snapshotReadinessReport.snapshotSetups.length}개, assertion signals ${input.snapshotReadinessReport.assertionSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Property-based testing 준비도 확인",
      href: "property-based-testing-readiness.html",
      goal: "fast-check, Hypothesis, jqwik식 generator, shrink, seed, counterexample, stateful/model-based test 준비도를 확인합니다.",
      evidence: `setups ${input.propertyBasedTestingReadinessReport.propertySetups.length}개, generator signals ${input.propertyBasedTestingReadinessReport.generatorSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Test data 준비도 확인",
      href: "test-data-readiness.html",
      goal: "Factory Bot, factory_boy, Faker식 factory, trait, association, sequence, seed, lint 준비도를 확인합니다.",
      evidence: `setups ${input.testDataReadinessReport.dataSetups.length}개, factory signals ${input.testDataReadinessReport.factorySignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Database migration 준비도 확인",
      href: "database-migration-readiness.html",
      goal: "Flyway, Liquibase, Alembic식 versioned migration, changelog, revision, rollback, validation, CI 준비도를 확인합니다.",
      evidence: `setups ${input.databaseMigrationReadinessReport.migrationSetups.length}개, validation signals ${input.databaseMigrationReadinessReport.validationSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Database ORM 준비도 확인",
      href: "database-orm-readiness.html",
      goal: "TypeORM, Sequelize, SQLAlchemy식 entity/model, relation, repository/session, transaction, loading 준비도를 확인합니다.",
      evidence: `setups ${input.databaseOrmReadinessReport.ormSetups.length}개, transaction signals ${input.databaseOrmReadinessReport.transactionSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Data quality readiness 확인",
      href: "data-quality-readiness.html",
      goal: "Great Expectations, SodaCL, dbt data_tests식 expectation, freshness, failed-row, artifact 준비도를 확인합니다.",
      evidence: `setups ${input.dataQualityReadinessReport.dataQualitySetups.length}개, dbt signals ${input.dataQualityReadinessReport.dbtSignals.filter((item) => item.readiness === "ready").length}개, Soda signals ${input.dataQualityReadinessReport.sodaSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Data lineage readiness 확인",
      href: "data-lineage-readiness.html",
      goal: "OpenLineage, Marquez, dbt artifact식 event, dataset edge, facet, column lineage, storage 준비도를 확인합니다.",
      evidence: `setups ${input.dataLineageReadinessReport.lineageSetups.length}개, event signals ${input.dataLineageReadinessReport.eventSignals.filter((item) => item.readiness === "ready").length}개, dataset signals ${input.dataLineageReadinessReport.datasetSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Data catalog readiness 확인",
      href: "data-catalog-readiness.html",
      goal: "OpenMetadata, DataHub, Amundsen식 ingestion, entity, governance, search, lineage 준비도를 확인합니다.",
      evidence: `setups ${input.dataCatalogReadinessReport.catalogSetups.length}개, entity signals ${input.dataCatalogReadinessReport.entitySignals.filter((item) => item.readiness === "ready").length}개, search signals ${input.dataCatalogReadinessReport.searchSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Data annotation readiness 확인",
      href: "data-annotation-readiness.html",
      goal: "Label Studio, FiftyOne, Argilla식 project, task, schema, workflow, quality, prelabel, export 준비도를 확인합니다.",
      evidence: `setups ${input.dataAnnotationReadinessReport.annotationSetups.length}개, workflow signals ${input.dataAnnotationReadinessReport.workflowSignals.filter((item) => item.readiness === "ready").length}개, quality signals ${input.dataAnnotationReadinessReport.qualitySignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Feature store readiness 확인",
      href: "feature-store-readiness.html",
      goal: "Feast, Feathr, Hopsworks식 feature definition, source, offline/online store, registry, retrieval, materialization 준비도를 확인합니다.",
      evidence: `setups ${input.featureStoreReadinessReport.featureStoreSetups.length}개, definition signals ${input.featureStoreReadinessReport.definitionSignals.filter((item) => item.readiness === "ready").length}개, retrieval signals ${input.featureStoreReadinessReport.retrievalSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Model registry readiness 확인",
      href: "model-registry-readiness.html",
      goal: "MLflow, Kubeflow Model Registry, BentoML식 registered model, version, artifact, metadata, serving 준비도를 확인합니다.",
      evidence: `setups ${input.modelRegistryReadinessReport.modelRegistrySetups.length}개, registration signals ${input.modelRegistryReadinessReport.registrationSignals.filter((item) => item.readiness === "ready").length}개, serving signals ${input.modelRegistryReadinessReport.servingSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Experiment tracking readiness 확인",
      href: "experiment-tracking-readiness.html",
      goal: "MLflow Tracking, W&B, Neptune식 experiment, run, metric, artifact, offline sync, CI 준비도를 확인합니다.",
      evidence: `setups ${input.experimentTrackingReadinessReport.experimentTrackingSetups.length}개, run signals ${input.experimentTrackingReadinessReport.runSignals.filter((item) => item.readiness === "ready").length}개, logging signals ${input.experimentTrackingReadinessReport.loggingSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Model monitoring readiness 확인",
      href: "model-monitoring-readiness.html",
      goal: "Evidently, whylogs/WhyLabs, NannyML식 reference/current data, drift, quality, performance, alert, CI 준비도를 확인합니다.",
      evidence: `setups ${input.modelMonitoringReadinessReport.modelMonitoringSetups.length}개, drift signals ${input.modelMonitoringReadinessReport.driftSignals.filter((item) => item.readiness === "ready").length}개, performance signals ${input.modelMonitoringReadinessReport.performanceSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Model serving readiness 확인",
      href: "model-serving-readiness.html",
      goal: "KServe, Seldon, Triton식 inference service, serving runtime, protocol, routing, autoscaling, health 준비도를 확인합니다.",
      evidence: `setups ${input.modelServingReadinessReport.modelServingSetups.length}개, platform signals ${input.modelServingReadinessReport.platformSignals.filter((item) => item.readiness === "ready").length}개, protocol signals ${input.modelServingReadinessReport.protocolSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Model training readiness 확인",
      href: "model-training-readiness.html",
      goal: "Lightning, Accelerate, Ray Train식 trainer, train loop, distributed launch, accelerator, checkpoint, callback, metrics 준비도를 확인합니다.",
      evidence: `setups ${input.modelTrainingReadinessReport.modelTrainingSetups.length}개, loop signals ${input.modelTrainingReadinessReport.loopSignals.filter((item) => item.readiness === "ready").length}개, checkpoint signals ${input.modelTrainingReadinessReport.checkpointSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Integration test environment 준비도 확인",
      href: "integration-test-environment-readiness.html",
      goal: "Testcontainers식 container fixture, wait strategy, lifecycle cleanup, runtime 준비도를 확인합니다.",
      evidence: `setups ${input.integrationTestEnvironmentReadinessReport.integrationSetups.length}개, wait signals ${input.integrationTestEnvironmentReadinessReport.waitSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Chaos engineering 준비도 확인",
      href: "chaos-engineering-readiness.html",
      goal: "Chaos Mesh, LitmusChaos, Toxiproxy식 experiment, fault, scope, probe/steady-state, cleanup 준비도를 확인합니다.",
      evidence: `setups ${input.chaosEngineeringReadinessReport.chaosSetups.length}개, fault signals ${input.chaosEngineeringReadinessReport.faultSignals.filter((item) => item.readiness === "ready").length}개`
    },
    {
      title: "Accessibility 준비도 확인",
      href: "accessibility.html",
      goal: "axe-core식 scan target, WCAG/category tag, result bucket, impact, manual review 준비도를 확인합니다.",
      evidence: `scan targets ${input.accessibilityReport.scanTargets.length}개, integrations ${input.accessibilityReport.integrationSignals.length}개`
    },
    {
      title: "Storybook 준비도 확인",
      href: "storybook.html",
      goal: "Storybook식 CSF story, args, decorators, play function, addon/test/publish 준비도를 확인합니다.",
      evidence: `story files ${input.storybookReport.storyFiles.length}개, addons ${input.storybookReport.addonSignals.length}개`
    },
    {
      title: "Design Tokens 준비도 확인",
      href: "design-tokens.html",
      goal: "Style Dictionary식 token source, platform target, transform, usage, governance 준비도를 확인합니다.",
      evidence: `token sources ${input.designTokensReport.tokenSources.length}개, platforms ${input.designTokensReport.platformTargets.length}개`
    },
    {
      title: "I18n 준비도 확인",
      href: "i18n.html",
      goal: "FormatJS식 message source, locale catalog, runtime provider, extraction/verification 준비도를 확인합니다.",
      evidence: `message sources ${input.i18nReport.messageSources.length}개, locale assets ${input.i18nReport.localeAssets.length}개`
    },
    {
      title: "Release 준비도 확인",
      href: "release-readiness.html",
      goal: "semantic-release식 config, branch/channel, plugin step, CI, auth, publish target 준비도를 확인합니다.",
      evidence: `configs ${input.releaseReadinessReport.releaseConfigs.length}개, CI signals ${input.releaseReadinessReport.ciSignals.length}개`
    },
    {
      title: "Secret 준비도 확인",
      href: "secret-readiness.html",
      goal: "Gitleaks식 git/dir scan, config, allowlist, report, prevention 준비도를 확인합니다.",
      evidence: `secret surfaces ${input.secretReadinessReport.secretSurfaces.length}개, prevention signals ${input.secretReadinessReport.preventionSignals.length}개`
    },
    {
      title: "Secret management 준비도 확인",
      href: "secret-management-readiness.html",
      goal: "Vault/Infisical/Doppler/SOPS식 platform, auth, storage, delivery, governance 흐름을 보고 runtime secret contract를 확인합니다.",
      evidence: `secret-management setups ${input.secretManagementReadinessReport.secretManagementSetups.length}개, platform signals ${input.secretManagementReadinessReport.platformSignals.length}개`
    },
    {
      title: "Container 준비도 확인",
      href: "container-readiness.html",
      goal: "Hadolint식 Dockerfile, Compose, config, instruction risk, label, CI/report 준비도를 확인합니다.",
      evidence: `Dockerfile ${input.containerReadinessReport.dockerfiles.length}개, config signals ${input.containerReadinessReport.configSignals.length}개`
    },
    {
      title: "Code quality 준비도 확인",
      href: "code-quality.html",
      goal: "Biome식 formatter, linter, assist, config, CI/editor 준비도를 확인합니다.",
      evidence: `configs ${input.codeQualityReport.toolConfigs.length}개, linter signals ${input.codeQualityReport.linterSignals.length}개`
    },
    {
      title: "Documentation 준비도 확인",
      href: "documentation.html",
      goal: "Docusaurus식 docs, blog, pages, navigation, i18n, search, build/deploy 준비도를 확인합니다.",
      evidence: `site configs ${input.documentationReport.siteConfigs.length}개, release signals ${input.documentationReport.releaseSignals.length}개`
    },
    {
      title: "Database 준비도 확인",
      href: "database-readiness.html",
      goal: "Prisma식 schema, datasource, migration, generated client, seed/env 준비도를 확인합니다.",
      evidence: `schemas ${input.databaseReadinessReport.schemaFiles.length}개, migration signals ${input.databaseReadinessReport.migrationSignals.length}개`
    },
    {
      title: "CI/CD 준비도 확인",
      href: "ci-cd.html",
      goal: "GitHub Actions식 workflow, trigger, job, permission, cache/artifact, deployment 준비도를 확인합니다.",
      evidence: `workflows ${input.ciCdReport.workflowFiles.length}개, trigger signals ${input.ciCdReport.triggerSignals.length}개`
    },
    {
      title: "Unit test 준비도 확인",
      href: "unit-tests.html",
      goal: "Vitest식 test file, assertion, mock, coverage, environment, reporter 준비도를 확인합니다.",
      evidence: `test files ${input.unitTestReport.testFiles.length}개, coverage signals ${input.unitTestReport.coverageSignals.length}개`
    },
    {
      title: "Coverage readiness 확인",
      href: "coverage-readiness.html",
      goal: "nyc/c8/Codecov식 instrumentation, scope, threshold, report, CI upload 흐름을 확인합니다.",
      evidence: `coverage setups ${input.coverageReadinessReport.coverageSetups.length}개, threshold signals ${input.coverageReadinessReport.thresholdSignals.length}개`
    },
    {
      title: "Mutation testing 준비도 확인",
      href: "mutation-testing-readiness.html",
      goal: "Stryker/Infection식 mutate scope, runner, mutator, threshold, reporter 준비도를 확인합니다.",
      evidence: `mutation setups ${input.mutationTestingReadinessReport.mutationSetups.length}개, quality signals ${input.mutationTestingReadinessReport.qualitySignals.length}개`
    },
    {
      title: "Typecheck 준비도 확인",
      href: "typecheck-readiness.html",
      goal: "TypeScript식 tsconfig, strict flag, project reference, module resolution, declaration, tsc script 준비도를 확인합니다.",
      evidence: `tsconfig files ${input.typecheckReadinessReport.tsconfigFiles.length}개, script signals ${input.typecheckReadinessReport.scriptSignals.length}개`
    },
    {
      title: "Package manager 준비도 확인",
      href: "package-manager.html",
      goal: "pnpm식 manifest, workspace, lockfile, script, install policy를 보고 재현 가능한 설치 경로를 확인합니다.",
      evidence: `manifest files ${input.packageManagerReport.manifestFiles.length}개, lockfiles ${input.packageManagerReport.lockfileSignals.length}개`
    },
    {
      title: "Git hooks 준비도 확인",
      href: "git-hooks.html",
      goal: "Husky식 hook file, install script, pre-commit/pre-push, bypass policy를 보고 커밋 전 로컬 품질 관문을 확인합니다.",
      evidence: `hook files ${input.gitHooksReport.hookFiles.length}개, command signals ${input.gitHooksReport.commandSignals.length}개`
    },
    {
      title: "Task runner 준비도 확인",
      href: "task-runner.html",
      goal: "Turborepo식 task graph, cache, dependsOn, env, package script를 보고 반복 실행과 캐시 경계를 확인합니다.",
      evidence: `config files ${input.taskRunnerReport.configFiles.length}개, cache signals ${input.taskRunnerReport.cacheSignals.length}개`
    },
    {
      title: "Dependency updates 준비도 확인",
      href: "dependency-updates.html",
      goal: "Renovate식 config, packageRules, automerge, dashboard, registry, package file을 보고 자동 업데이트 정책을 확인합니다.",
      evidence: `config files ${input.dependencyUpdateReport.configFiles.length}개, package file signals ${input.dependencyUpdateReport.packageFileSignals.length}개`
    },
    {
      title: "Lint 준비도 확인",
      href: "lint-readiness.html",
      goal: "ESLint식 flat config, rules, plugins, parser, ignores, fix/cache/report 옵션을 보고 코드 품질 관문을 확인합니다.",
      evidence: `config files ${input.lintReadinessReport.configFiles.length}개, script signals ${input.lintReadinessReport.scriptSignals.length}개`
    },
    {
      title: "Format 준비도 확인",
      href: "format-readiness.html",
      goal: "Prettier식 config, ignore, options, plugins, check/write/cache 흐름을 보고 포맷팅 관문을 확인합니다.",
      evidence: `config files ${input.formatReadinessReport.configFiles.length}개, ignore files ${input.formatReadinessReport.ignoreFiles.length}개`
    },
    {
      title: "Commit convention 확인",
      href: "commit-conventions.html",
      goal: "commitlint식 config, rules, commit-msg hook, CI range, prompt/CLI 명령을 보고 커밋 메시지 관문을 확인합니다.",
      evidence: `config files ${input.commitConventionReport.configFiles.length}개, hook signals ${input.commitConventionReport.hookSignals.length}개`
    },
    {
      title: "Changelog readiness 확인",
      href: "changelog-readiness.html",
      goal: "Changesets식 changeset files, changelog config, status/version/publish 흐름을 보고 release note 관문을 확인합니다.",
      evidence: `config files ${input.changelogReadinessReport.configFiles.length}개, changeset files ${input.changelogReadinessReport.changesetFiles.length}개`
    },
    {
      title: "Bundle analysis 확인",
      href: "bundle-analysis.html",
      goal: "Webpack Bundle Analyzer식 stats JSON, chunks, source maps, gzip/Brotli/Zstd size 신호를 보고 번들 점검 관문을 확인합니다.",
      evidence: `config files ${input.bundleAnalysisReport.configFiles.length}개, artifacts ${input.bundleAnalysisReport.bundleArtifacts.length}개`
    },
    {
      title: "Mocking readiness 확인",
      href: "mocking-readiness.html",
      goal: "MSW식 handlers, setupWorker/setupServer, lifecycle cleanup, unhandled request policy를 보고 mock API 관문을 확인합니다.",
      evidence: `handler files ${input.mockingReadinessReport.handlerFiles.length}개, setup surfaces ${input.mockingReadinessReport.serverSetups.length}개`
    },
    {
      title: "Data fetching readiness 확인",
      href: "data-fetching-readiness.html",
      goal: "TanStack Query식 QueryClient, query hooks, cache timing, invalidation, hydration을 보고 서버 상태 관리 관문을 확인합니다.",
      evidence: `client setups ${input.dataFetchingReadinessReport.clientSetups.length}개, query usages ${input.dataFetchingReadinessReport.queryUsages.length}개`
    },
    {
      title: "Routing readiness 확인",
      href: "routing-readiness.html",
      goal: "React Router식 router mode, route definitions, navigation API, data route, file-route convention을 보고 화면 이동 관문을 확인합니다.",
      evidence: `setups ${input.routingReadinessReport.routingSetups.length}개, route definitions ${input.routingReadinessReport.routeDefinitions.length}개`
    },
    {
      title: "State management readiness 확인",
      href: "state-management-readiness.html",
      goal: "Redux Toolkit식 configureStore, slices, selectors, side effects, middleware, RTK Query 연결을 보고 클라이언트 상태 관리 관문을 확인합니다.",
      evidence: `store setups ${input.stateManagementReadinessReport.storeSetups.length}개, slice definitions ${input.stateManagementReadinessReport.sliceDefinitions.length}개`
    },
    {
      title: "Form readiness 확인",
      href: "form-readiness.html",
      goal: "React Hook Form식 useForm, register, submit, validation, errors, field array를 보고 입력 흐름 관문을 확인합니다.",
      evidence: `form setups ${input.formReadinessReport.formSetups.length}개, field registrations ${input.formReadinessReport.fieldRegistrations.length}개`
    },
    {
      title: "Auth readiness 확인",
      href: "auth-readiness.html",
      goal: "Auth.js식 handlers, providers, callbacks, sessions, middleware, env secret을 보고 인증 관문을 확인합니다.",
      evidence: `auth setups ${input.authReadinessReport.authSetups.length}개, session surfaces ${input.authReadinessReport.sessionSurfaces.length}개`
    },
    {
      title: "Authorization readiness 확인",
      href: "authorization-readiness.html",
      goal: "OpenFGA, Casbin, CASL, Oso식 permission model, enforcement, identity boundary, governance, test 신호를 보고 권한 관문을 확인합니다.",
      evidence: `authorization setups ${input.authorizationReadinessReport.authorizationSetups.length}개, enforcement signals ${input.authorizationReadinessReport.enforcementSignals.length}개`
    },
    {
      title: "Payment readiness 확인",
      href: "payment-readiness.html",
      goal: "Stripe식 server client, checkout, PaymentIntent, webhooks, billing lifecycle, env secret을 보고 결제 관문을 확인합니다.",
      evidence: `payment setups ${input.paymentReadinessReport.paymentSetups.length}개, checkout signals ${input.paymentReadinessReport.checkoutSignals.length}개`
    },
    {
      title: "Email readiness 확인",
      href: "email-readiness.html",
      goal: "Resend식 provider client, send payload, templates, domains, webhooks, env secret을 보고 transactional email 관문을 확인합니다.",
      evidence: `email setups ${input.emailReadinessReport.emailSetups.length}개, recipient signals ${input.emailReadinessReport.recipientSignals.length}개`
    },
    {
      title: "Queue readiness 확인",
      href: "queue-readiness.html",
      goal: "BullMQ식 Queue, Worker, QueueEvents, FlowProducer, Redis connection, retry/backoff 흐름을 보고 background job 관문을 확인합니다.",
      evidence: `queue setups ${input.queueReadinessReport.queueSetups.length}개, producer signals ${input.queueReadinessReport.producerSignals.length}개`
    },
    {
      title: "Cache readiness 확인",
      href: "cache-readiness.html",
      goal: "Node Redis식 createClient, get/set, TTL, invalidation, connection, Pub/Sub, client-side cache 흐름을 보고 cache 관문을 확인합니다.",
      evidence: `cache setups ${input.cacheReadinessReport.cacheSetups.length}개, operation signals ${input.cacheReadinessReport.operationSignals.length}개`
    },
    {
      title: "Logging readiness 확인",
      href: "logging-readiness.html",
      goal: "Pino식 logger setup, level policy, child logger, request context, redaction, transport 흐름을 보고 logging 관문을 확인합니다.",
      evidence: `logging setups ${input.loggingReadinessReport.loggingSetups.length}개, level signals ${input.loggingReadinessReport.levelSignals.length}개`
    },
    {
      title: "Feature flag readiness 확인",
      href: "feature-flag-readiness.html",
      goal: "OpenFeature식 provider setup, flag evaluation, targeting context, hooks, tracking, shutdown 흐름을 보고 rollout 관문을 확인합니다.",
      evidence: `feature flag setups ${input.featureFlagReadinessReport.featureFlagSetups.length}개, evaluation signals ${input.featureFlagReadinessReport.evaluationSignals.length}개`
    },
    {
      title: "Rate limit readiness 확인",
      href: "rate-limit-readiness.html",
      goal: "rate-limiter-flexible식 limiter setup, quota/window, identity key, backing store, 429/Retry-After 응답 흐름을 보고 abuse 방어 관문을 확인합니다.",
      evidence: `rate limit setups ${input.rateLimitReadinessReport.rateLimitSetups.length}개, quota signals ${input.rateLimitReadinessReport.quotaSignals.length}개`
    },
    {
      title: "Error tracking readiness 확인",
      href: "error-tracking-readiness.html",
      goal: "Sentry식 SDK init, capture, scope/context, privacy filtering, tracing/replay 흐름을 보고 운영 에러 triage 관문을 확인합니다.",
      evidence: `error tracking setups ${input.errorTrackingReadinessReport.errorTrackingSetups.length}개, capture signals ${input.errorTrackingReadinessReport.captureSignals.length}개`
    },
    {
      title: "Analytics readiness 확인",
      href: "analytics-readiness.html",
      goal: "PostHog식 analytics init, event capture, identity reset, pageview/autocapture, consent/privacy, feature flag/replay 흐름을 보고 product analytics 관문을 확인합니다.",
      evidence: `analytics setups ${input.analyticsReadinessReport.analyticsSetups.length}개, event signals ${input.analyticsReadinessReport.eventSignals.length}개`
    },
    {
      title: "HTTP client readiness 확인",
      href: "http-client-readiness.html",
      goal: "Got식 outbound request, timeout, retry, hooks, transport, cache/proxy/agent, structured error metadata 흐름을 보고 외부 API 호출 관문을 확인합니다.",
      evidence: `http client setups ${input.httpClientReadinessReport.httpClientSetups.length}개, resilience signals ${input.httpClientReadinessReport.resilienceSignals.length}개`
    },
    {
      title: "Schema validation readiness 확인",
      href: "schema-validation-readiness.html",
      goal: "Zod식 schema shape, parser 호출, type inference, refinement/transform, error formatting, integration 흐름을 보고 runtime input validation 관문을 확인합니다.",
      evidence: `schema setups ${input.schemaValidationReadinessReport.schemaSetups.length}개, parser signals ${input.schemaValidationReadinessReport.parserSignals.length}개`
    },
    {
      title: "Datetime readiness 확인",
      href: "datetime-readiness.html",
      goal: "Luxon식 DateTime, parsing, formatting, timezone, duration/interval, validity 흐름을 보고 시간 처리 관문을 확인합니다.",
      evidence: `datetime setups ${input.dateTimeReadinessReport.dateTimeSetups.length}개, zone signals ${input.dateTimeReadinessReport.zoneSignals.length}개`
    },
    {
      title: "ID generation readiness 확인",
      href: "id-generation-readiness.html",
      goal: "Nano ID식 generator, entropy source, alphabet/size, runtime, usage, validation 흐름을 보고 ID 생성 관문을 확인합니다.",
      evidence: `id generator setups ${input.idGenerationReadinessReport.idGeneratorSetups.length}개, entropy signals ${input.idGenerationReadinessReport.entropySignals.length}개`
    },
    {
      title: "Image processing readiness 확인",
      href: "image-processing-readiness.html",
      goal: "Sharp식 input, transform, output, safety, performance 흐름을 보고 이미지 처리 관문을 확인합니다.",
      evidence: `image setups ${input.imageProcessingReadinessReport.imageProcessingSetups.length}개, safety signals ${input.imageProcessingReadinessReport.safetySignals.length}개`
    },
    {
      title: "File upload readiness 확인",
      href: "file-upload-readiness.html",
      goal: "Uppy식 input, restrictions, transport, lifecycle, safety 흐름을 보고 파일 업로드 관문을 확인합니다.",
      evidence: `upload setups ${input.fileUploadReadinessReport.fileUploadSetups.length}개, transport signals ${input.fileUploadReadinessReport.transportSignals.length}개`
    },
    {
      title: "WebSocket readiness 확인",
      href: "websocket-readiness.html",
      goal: "ws식 server/client, upgrade, message, lifecycle, safety 흐름을 보고 실시간 연결 관문을 확인합니다.",
      evidence: `websocket setups ${input.webSocketReadinessReport.webSocketSetups.length}개, message signals ${input.webSocketReadinessReport.messageSignals.length}개`
    },
    {
      title: "PDF generation readiness 확인",
      href: "pdf-generation-readiness.html",
      goal: "pdf-lib식 document, page, asset, form, output, safety 흐름을 보고 PDF 생성 관문을 확인합니다.",
      evidence: `pdf setups ${input.pdfGenerationReadinessReport.pdfGenerationSetups.length}개, output signals ${input.pdfGenerationReadinessReport.outputSignals.length}개`
    },
    {
      title: "Spreadsheet readiness 확인",
      href: "spreadsheet-readiness.html",
      goal: "SheetJS식 workbook, sheet, format, input, output, safety 흐름을 보고 spreadsheet/CSV 관문을 확인합니다.",
      evidence: `spreadsheet setups ${input.spreadsheetReadinessReport.spreadsheetSetups.length}개, output signals ${input.spreadsheetReadinessReport.outputSignals.length}개`
    },
    {
      title: "Chart visualization readiness 확인",
      href: "chart-visualization-readiness.html",
      goal: "Chart.js식 chart type, data, scale, interaction, render, lifecycle 흐름을 보고 시각화 관문을 확인합니다.",
      evidence: `chart setups ${input.chartVisualizationReadinessReport.chartSetups.length}개, render signals ${input.chartVisualizationReadinessReport.renderSignals.length}개`
    },
    {
      title: "Diagram rendering readiness 확인",
      href: "diagram-rendering-readiness.html",
      goal: "Mermaid식 diagram syntax, render, theme, security, layout, output 흐름을 보고 문서/시각화 관문을 확인합니다.",
      evidence: `diagram setups ${input.diagramRenderingReadinessReport.diagramSetups.length}개, render signals ${input.diagramRenderingReadinessReport.renderSignals.length}개`
    },
    {
      title: "Link integrity readiness 확인",
      href: "link-integrity-readiness.html",
      goal: "Lychee식 link target, policy, network, output, CI 흐름을 보고 문서/사이트 링크 검증 관문을 확인합니다.",
      evidence: `link setups ${input.linkIntegrityReadinessReport.linkSetups.length}개, target signals ${input.linkIntegrityReadinessReport.targetSignals.length}개`
    },
    {
      title: "SEO metadata readiness 확인",
      href: "seo-metadata-readiness.html",
      goal: "Nuxt SEO식 robots, sitemap, metadata, structured data, AEO 흐름을 보고 검색/답변엔진 노출 준비도를 확인합니다.",
      evidence: `SEO setups ${input.seoMetadataReadinessReport.seoSetups.length}개, metadata signals ${input.seoMetadataReadinessReport.metadataSignals.length}개`
    },
    {
      title: "PWA readiness 확인",
      href: "pwa-readiness.html",
      goal: "Vite PWA식 manifest, service worker, Workbox cache, update/install 흐름을 보고 오프라인 앱 준비도를 확인합니다.",
      evidence: `PWA setups ${input.pwaReadinessReport.pwaSetups.length}개, service worker signals ${input.pwaReadinessReport.serviceWorkerSignals.length}개`
    },
    {
      title: "Browser compatibility readiness 확인",
      href: "browser-compat-readiness.html",
      goal: "Browserslist식 target browser config, query, coverage, update 흐름을 보고 프런트엔드 호환성 정책을 확인합니다.",
      evidence: `compatibility setups ${input.browserCompatibilityReadinessReport.compatibilitySetups.length}개, query signals ${input.browserCompatibilityReadinessReport.querySignals.length}개`
    },
    {
      title: "Browser extension readiness 확인",
      href: "browser-extension-readiness.html",
      goal: "WXT/Plasmo/CRXJS식 manifest, entrypoint, permission, messaging, build/publish 흐름을 보고 browser extension contract를 확인합니다.",
      evidence: `extension setups ${input.browserExtensionReadinessReport.extensionSetups.length}개, permission signals ${input.browserExtensionReadinessReport.permissionSignals.length}개`
    },
    {
      title: "Env validation readiness 확인",
      href: "env-validation-readiness.html",
      goal: "t3-env식 server/client schema, runtimeEnv, client prefix, validation 실패 흐름을 보고 환경 변수 contract를 확인합니다.",
      evidence: `env setups ${input.envValidationReadinessReport.envSetups.length}개, runtime signals ${input.envValidationReadinessReport.runtimeSignals.length}개`
    },
    {
      title: "Security headers readiness 확인",
      href: "security-headers-readiness.html",
      goal: "Helmet식 CSP, HSTS, cross-origin, legacy hardening header 흐름을 보고 HTTP 보안 header contract를 확인합니다.",
      evidence: `header setups ${input.securityHeadersReadinessReport.headerSetups.length}개, CSP signals ${input.securityHeadersReadinessReport.cspSignals.length}개`
    },
    {
      title: "GraphQL readiness 확인",
      href: "graphql-readiness.html",
      goal: "GraphQL.js식 schema, operation, resolver, validation, execution 흐름을 보고 GraphQL contract를 확인합니다.",
      evidence: `GraphQL setups ${input.graphqlReadinessReport.graphqlSetups.length}개, schema signals ${input.graphqlReadinessReport.schemaSignals.length}개`
    },
    {
      title: "CLI readiness 확인",
      href: "cli-readiness.html",
      goal: "Commander.js식 command, option, argument, action, help, error 흐름을 보고 CLI contract를 확인합니다.",
      evidence: `CLI setups ${input.cliReadinessReport.cliSetups.length}개, command signals ${input.cliReadinessReport.commandSignals.length}개`
    },
    {
      title: "LLM readiness 확인",
      href: "llm-readiness.html",
      goal: "LangChain.js식 model, prompt, tool, RAG, structured output, streaming 흐름을 보고 LLM integration contract를 확인합니다.",
      evidence: `LLM setups ${input.llmReadinessReport.llmSetups.length}개, model signals ${input.llmReadinessReport.modelSignals.length}개`
    },
    {
      title: "LLM eval readiness 확인",
      href: "llm-eval-readiness.html",
      goal: "promptfoo/OpenAI eval/OpenEvals식 prompt, provider, dataset, judge, red-team 흐름을 보고 LLM eval contract를 확인합니다.",
      evidence: `LLM eval setups ${input.llmEvalReadinessReport.evalSetups.length}개, judge signals ${input.llmEvalReadinessReport.judgeSignals.length}개`
    },
    {
      title: "LLM observability readiness 확인",
      href: "llm-observability-readiness.html",
      goal: "Langfuse/Phoenix/Helicone식 trace, session, token/cost, feedback, gateway 흐름을 보고 LLM observability contract를 확인합니다.",
      evidence: `LLM observability setups ${input.llmObservabilityReadinessReport.observabilitySetups.length}개, trace signals ${input.llmObservabilityReadinessReport.traceSignals.length}개`
    },
    {
      title: "Vector DB readiness 확인",
      href: "vector-db-readiness.html",
      goal: "Qdrant/Weaviate/Chroma식 collection, embedding, ingestion, query, index, ops 흐름을 보고 vector database contract를 확인합니다.",
      evidence: `vector DB setups ${input.vectorDbReadinessReport.vectorSetups.length}개, query signals ${input.vectorDbReadinessReport.querySignals.length}개`
    },
    {
      title: "Search service readiness 확인",
      href: "search-service-readiness.html",
      goal: "Meilisearch/Typesense/OpenSearch식 index, document ingestion, query, relevance tuning, ops 흐름을 보고 search service contract를 확인합니다.",
      evidence: `search service setups ${input.searchServiceReadinessReport.searchSetups.length}개, query signals ${input.searchServiceReadinessReport.querySignals.length}개`
    },
    {
      title: "Object storage readiness 확인",
      href: "object-storage-readiness.html",
      goal: "S3/MinIO/R2/Supabase Storage식 bucket, object lifecycle, access, reliability, security, ops 흐름을 보고 object storage contract를 확인합니다.",
      evidence: `object storage setups ${input.objectStorageReadinessReport.storageSetups.length}개, object signals ${input.objectStorageReadinessReport.objectSignals.length}개`
    },
    {
      title: "Realtime collaboration readiness 확인",
      href: "realtime-collaboration-readiness.html",
      goal: "Yjs/Automerge/Liveblocks식 shared document, provider, presence, sync, persistence, history 흐름을 보고 multiplayer collaboration contract를 확인합니다.",
      evidence: `collaboration setups ${input.realtimeCollaborationReadinessReport.collaborationSetups.length}개, provider signals ${input.realtimeCollaborationReadinessReport.providerSignals.length}개`
    },
    {
      title: "Workflow orchestration readiness 확인",
      href: "workflow-orchestration-readiness.html",
      goal: "Temporal/Inngest/Trigger.dev식 trigger, execution, durability, flow control, runtime 흐름을 보고 durable background-work contract를 확인합니다.",
      evidence: `workflow setups ${input.workflowOrchestrationReadinessReport.workflowSetups.length}개, trigger signals ${input.workflowOrchestrationReadinessReport.triggerSignals.length}개`
    },
    {
      title: "OpenAPI client readiness 확인",
      href: "openapi-client-readiness.html",
      goal: "openapi-typescript/Orval/OpenAPI Generator식 spec, generator, output, runtime, quality 흐름을 보고 generated API client contract를 확인합니다.",
      evidence: `client setups ${input.openApiClientReadinessReport.clientSetups.length}개, generator signals ${input.openApiClientReadinessReport.generatorSignals.length}개`
    },
    {
      title: "Webhook readiness 확인",
      href: "webhook-readiness.html",
      goal: "Svix/Standard Webhooks/Hookdeck식 endpoint, signature, replay, idempotency, delivery, local debug 흐름을 보고 webhook contract를 확인합니다.",
      evidence: `webhook setups ${input.webhookReadinessReport.webhookSetups.length}개, signature signals ${input.webhookReadinessReport.signatureSignals.length}개`
    },
    {
      title: "Notification readiness 확인",
      href: "notification-readiness.html",
      goal: "Novu식 workflow, subscriber, topic, preference, channel, template, delivery operation 흐름을 보고 notification contract를 확인합니다.",
      evidence: `notification setups ${input.notificationReadinessReport.notificationSetups.length}개, channel signals ${input.notificationReadinessReport.channelSignals.length}개`
    },
    {
      title: "Consent readiness 확인",
      href: "consent-readiness.html",
      goal: "CookieConsent/Klaro/IAB TCF식 banner, category, script blocking, privacy control, vendor/purpose consent 흐름을 보고 consent contract를 확인합니다.",
      evidence: `consent setups ${input.consentReadinessReport.consentSetups.length}개, TCF signals ${input.consentReadinessReport.tcfSignals.length}개`
    },
    {
      title: "Privacy readiness 확인",
      href: "privacy-readiness.html",
      goal: "Presidio/OpenDP/scrubadub식 PII detection, redaction, policy, retention, DSAR, privacy budget 흐름을 보고 privacy contract를 확인합니다.",
      evidence: `privacy setups ${input.privacyReadinessReport.privacySetups.length}개, redaction signals ${input.privacyReadinessReport.redactionSignals.length}개`
    },
    {
      title: "Secret management readiness 확인",
      href: "secret-management-readiness.html",
      goal: "Vault/Infisical/Doppler/SOPS식 platform, auth, storage, delivery, governance 흐름을 보고 runtime secret contract를 확인합니다.",
      evidence: `secret-management setups ${input.secretManagementReadinessReport.secretManagementSetups.length}개, governance signals ${input.secretManagementReadinessReport.governanceSignals.length}개`
    },
    {
      title: "Server framework readiness 확인",
      href: "server-framework-readiness.html",
      goal: "Fastify식 route, schema, plugin, hook, runtime 흐름을 보고 server contract를 확인합니다.",
      evidence: `server setups ${input.serverFrameworkReadinessReport.serverSetups.length}개, route signals ${input.serverFrameworkReadinessReport.routeSignals.length}개`
    },
    {
      title: "RPC readiness 확인",
      href: "rpc-readiness.html",
      goal: "tRPC식 router, procedure, validation, context, client, adapter 흐름을 보고 type-safe RPC contract를 확인합니다.",
      evidence: `RPC setups ${input.rpcReadinessReport.rpcSetups.length}개, procedure signals ${input.rpcReadinessReport.procedureSignals.length}개`
    },
    {
      title: "Workspace graph readiness 확인",
      href: "workspace-graph-readiness.html",
      goal: "Nx식 project graph, target, affected, boundary, plugin 흐름을 보고 workspace dependency contract를 확인합니다.",
      evidence: `workspace files ${input.workspaceGraphReadinessReport.workspaceFiles.length}개, graph signals ${input.workspaceGraphReadinessReport.graphSignals.length}개`
    },
    {
      title: "Scaffolding readiness 확인",
      href: "scaffolding-readiness.html",
      goal: "Plop식 generator, prompt, action, template, helper, safety 흐름을 보고 반복 가능한 코드 생성 contract를 확인합니다.",
      evidence: `generator files ${input.scaffoldingReadinessReport.generatorFiles.length}개, action signals ${input.scaffoldingReadinessReport.actionSignals.length}개`
    },
    {
      title: "Scheduler readiness 확인",
      href: "scheduler-readiness.html",
      goal: "node-cron식 schedule, task, lifecycle, reliability 흐름을 보고 반복 실행 contract를 확인합니다.",
      evidence: `scheduler setups ${input.schedulerReadinessReport.schedulerSetups.length}개, reliability signals ${input.schedulerReadinessReport.reliabilitySignals.length}개`
    },
    {
      title: "Build tool readiness 확인",
      href: "build-tool-readiness.html",
      goal: "Vite식 config, plugin, dev server, build, env, SSR 흐름을 보고 빌드 도구 contract를 확인합니다.",
      evidence: `build tool setups ${input.buildToolReadinessReport.buildToolSetups.length}개, plugin signals ${input.buildToolReadinessReport.pluginSignals.length}개`
    },
    {
      title: "Styling readiness 확인",
      href: "styling-readiness.html",
      goal: "Tailwind CSS식 config, directive, utility class, theme, plugin, build integration 흐름을 확인합니다.",
      evidence: `styling setups ${input.stylingReadinessReport.stylingSetups.length}개, directive signals ${input.stylingReadinessReport.directiveSignals.length}개`
    },
    {
      title: "Visual regression readiness 확인",
      href: "visual-regression-readiness.html",
      goal: "reg-suit식 actual screenshots, expected baselines, diff thresholds, reports, plugins, storage, notification 흐름을 확인합니다.",
      evidence: `visual setups ${input.visualRegressionReadinessReport.visualRegressionSetups.length}개, threshold signals ${input.visualRegressionReadinessReport.thresholdSignals.length}개`
    },
    {
      title: "Infrastructure readiness 확인",
      href: "infrastructure-readiness.html",
      goal: "OpenTofu식 .tf config, provider/resource/module, backend/state, plan/apply/import workflow 흐름을 확인합니다.",
      evidence: `infrastructure setups ${input.infrastructureReadinessReport.infrastructureSetups.length}개, workflow signals ${input.infrastructureReadinessReport.workflowSignals.length}개`
    },
    {
      title: "Deployment readiness 확인",
      href: "deployment-readiness.html",
      goal: "Helm식 Chart.yaml, values.yaml, templates, lint/template/install/upgrade workflow와 safety flag 흐름을 확인합니다.",
      evidence: `deployment setups ${input.deploymentReadinessReport.deploymentSetups.length}개, release signals ${input.deploymentReadinessReport.releaseSignals.length}개`
    },
    {
      title: "Serverless readiness 확인",
      href: "serverless-readiness.html",
      goal: "Serverless Framework식 service, provider, functions, events, package/deploy workflow와 IAM/secrets guardrail 흐름을 확인합니다.",
      evidence: `serverless setups ${input.serverlessReadinessReport.serverlessSetups.length}개, event signals ${input.serverlessReadinessReport.eventSignals.length}개`
    },
    {
      title: "Mobile readiness 확인",
      href: "mobile-readiness.html",
      goal: "Expo식 app config, platform identifier, navigation, EAS build, OTA update, asset 흐름을 확인합니다.",
      evidence: `mobile setups ${input.mobileReadinessReport.mobileSetups.length}개, build signals ${input.mobileReadinessReport.buildSignals.length}개`
    },
    {
      title: "Desktop readiness 확인",
      href: "desktop-readiness.html",
      goal: "Tauri/Electron/Wails식 config, window, IPC, permission, bundle, updater, signing release 흐름을 확인합니다.",
      evidence: `desktop setups ${input.desktopReadinessReport.desktopSetups.length}개, release signals ${input.desktopReadinessReport.releaseSignals.length}개`
    },
    {
      title: "Edge readiness 확인",
      href: "edge-readiness.html",
      goal: "Cloudflare Workers식 Wrangler config, module handler, binding, route, dev/deploy/tail 흐름을 확인합니다.",
      evidence: `edge setups ${input.edgeReadinessReport.edgeSetups.length}개, binding signals ${input.edgeReadinessReport.bindingSignals.length}개`
    },
    {
      title: "Compose readiness 확인",
      href: "compose-readiness.html",
      goal: "Docker Compose식 compose file, service topology, dependencies, resources, health, local workflow 흐름을 확인합니다.",
      evidence: `compose setups ${input.composeReadinessReport.composeSetups.length}개, workflow signals ${input.composeReadinessReport.workflowSignals.length}개`
    },
    {
      title: "Dev Container readiness 확인",
      href: "devcontainer-readiness.html",
      goal: "Dev Containers식 devcontainer.json, features, lifecycle hooks, mounts, ports, customizations, CLI workflow 흐름을 확인합니다.",
      evidence: `devcontainer setups ${input.devContainerReadinessReport.devContainerSetups.length}개, lifecycle signals ${input.devContainerReadinessReport.lifecycleSignals.length}개`
    },
    {
      title: "Kubernetes readiness 확인",
      href: "kubernetes-readiness.html",
      goal: "Kubernetes/Kustomize식 manifests, workloads, services, RBAC, probes, kubectl workflow 흐름을 확인합니다.",
      evidence: `kubernetes setups ${input.kubernetesReadinessReport.kubernetesSetups.length}개, workflow signals ${input.kubernetesReadinessReport.workflowSignals.length}개`
    },
    {
      title: "GitOps readiness 확인",
      href: "gitops-readiness.html",
      goal: "Argo CD/Flux식 applications, sources, sync policy, reconciliation, image automation, notification workflow 흐름을 확인합니다.",
      evidence: `gitops setups ${input.gitopsReadinessReport.gitopsSetups.length}개, workflow signals ${input.gitopsReadinessReport.workflowSignals.length}개`
    },
    {
      title: "Backup readiness 확인",
      href: "backup-readiness.html",
      goal: "Velero/Litestream/restic식 backup, restore, storage, retention, verification workflow 흐름을 확인합니다.",
      evidence: `backup setups ${input.backupReadinessReport.backupSetups.length}개, restore drill signals ${input.backupReadinessReport.restoreDrillSignals.length}개`
    },
    {
      title: "LLM Context Pack 예산 확인",
      href: "context-pack.html",
      goal: "AI 도구에 공유할 파일 묶음의 token-heavy file과 context limit 적합성을 확인합니다.",
      evidence: `estimated tokens ${input.contextPackReport.totalEstimatedTokens}개`
    },
    {
      title: "AI/MCP 인계 계획 확인",
      href: "mcp-handoff.html",
      goal: "다른 AI 또는 MCP 도구가 사용할 tool, prompt, safety note를 확인합니다.",
      evidence: `handoff tools ${input.mcpHandoffReport.tools.length}개`
    },
    {
      title: "Agent memory 재진입 규칙 확인",
      href: "agent-memory.html",
      goal: "다음 AI 세션이 원본 코드를 다시 읽기 전 사용할 기억 노트와 navigation rule을 확인합니다.",
      evidence: `memory notes ${input.agentMemoryReport.memoryNotes.length}개, reduction ${input.agentMemoryReport.tokenSavings.estimatedReductionX}x`
    },
    {
      title: "그래프 질의 방식 확인",
      href: "graph-query.html",
      goal: "query, path, explain 질문으로 컴포넌트 그래프를 먼저 탐색합니다.",
      evidence: `query modes ${input.graphQueryReport.queryModes.length}개, explain nodes ${input.graphQueryReport.nodeExplanations.length}개`
    },
    {
      title: "튜토리얼 추상화 순서 확인",
      href: "tutorial-abstractions.html",
      goal: "핵심 파일을 추상화 장으로 묶고 관계와 읽기 순서를 따라갑니다.",
      evidence: `abstractions ${input.tutorialAbstractionReport.abstractions.length}개, relationships ${input.tutorialAbstractionReport.relationships.length}개`
    },
    {
      title: "아키텍처 결정 기록 확인",
      href: "decision-records.html",
      goal: "Context, Decision, Status, Consequences 형식으로 왜 이런 구조인지 확인합니다.",
      evidence: `records ${input.decisionRecordReport.records.length}개, statuses ${Object.keys(input.decisionRecordReport.statusCounts).length}개`
    },
    {
      title: "의존성 건강도 확인",
      href: "dependency-health.html",
      goal: "로컬 import 그래프에서 순환, 고아 모듈, fan-in/fan-out이 큰 파일을 확인합니다.",
      evidence: `localDependencyEdges ${input.dependencyHealthReport.totalLocalDependencies}개, cycles ${input.dependencyHealthReport.cycles.length}개`
    },
    {
      title: "폴더와 핵심 파일 훑기",
      href: "files.html",
      goal: "핵심 파일 수업으로 진입점과 주변 파일을 연결합니다.",
      evidence: `폴더 수업 ${input.folderLessons.length}개, 파일 수업 ${input.fileLessons.length}개`
    },
    {
      title: "소스 근거 대조",
      href: "evidence.html",
      goal: "설명과 복사된 원본 소스가 어떻게 연결되는지 확인합니다.",
      evidence: `소스 근거 ${input.fileLessons.reduce((sum, lesson) => sum + (lesson.sourceEvidence ?? []).length, 0)}개`
    },
    {
      title: "컴포넌트 그래프 따라가기",
      href: "component-graph.html",
      goal: "폴더, 파일, 용어, 재구현 단계의 관계를 그래프로 추적합니다.",
      evidence: `노드 ${input.componentGraphReport.nodes.length}개, 관계 ${input.componentGraphReport.edges.length}개`
    },
    {
      title: "맨땅 재구현 순서 보기",
      href: "rebuild.html",
      goal: "학습 내용을 구현 순서로 재배열합니다.",
      evidence: `재구현 단계 ${input.rebuildRoadmap.steps.length}개`
    },
    {
      title: "퀴즈로 복습",
      href: "quiz.html",
      goal: "정답 확인과 오답노트 흐름으로 이해도를 점검합니다.",
      evidence: `퀴즈 ${input.quiz.totalQuestions}문제`
    }
  ];
}

function learningPathTourJson(input: StudyHtmlInput, steps: Array<{ title: string; href: string; goal: string; evidence: string }>): string {
  return `${JSON.stringify({
    title: `${input.session.repo} RepoTutor Learning Path`,
    description: "Portable ordered tour generated from RepoTutor analysis pages.",
    isPrimary: true,
    ref: input.session.commitHash,
    steps: steps.map((step) => ({
      title: step.title,
      description: `${step.goal}\n\nEvidence: ${step.evidence}`,
      file: `html/${step.href}`
    }))
  }, null, 2)}\n`;
}

function quizFilterButtons(questions: Quiz["questions"]): { sectionButtons: string; difficultyButtons: string } {
  return {
    sectionButtons: fileFilterButtons("quiz-section-filter", "전체 섹션", countBy(questions.map((question) => question.section))),
    difficultyButtons: fileFilterButtons("quiz-difficulty-filter", "전체 난이도", countBy(questions.map((question) => question.difficulty)))
  };
}

function fileNavigationFor(files: FileLesson[]): { summary: string; extensionButtons: string; directoryButtons: string; evidenceButtons: string } {
  const extensionCounts = countBy(files.map((file) => fileExtension(file.filePath)));
  const directoryCounts = countBy(files.map((file) => topDirectory(file.filePath)));
  const evidenceCounts = countBy(files.map(sourceEvidenceState));
  return {
    summary: `핵심 파일 ${files.length}개를 확장자, 상위 폴더, 소스 근거 상태 기준으로 좁혀 볼 수 있습니다.`,
    extensionButtons: fileFilterButtons("file-ext-filter", "전체 확장자", extensionCounts),
    directoryButtons: fileFilterButtons("file-dir-filter", "전체 폴더", directoryCounts, 12),
    evidenceButtons: sourceEvidenceFilterButtons(evidenceCounts)
  };
}

function fileFilterButtons(attribute: string, allLabel: string, counts: Record<string, number>, limit = Infinity): string {
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
  const allCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return [
    `<button type="button" class="active" data-${attribute}="all">${escapeHtml(allLabel)} ${allCount}</button>`,
    ...entries.map(([value, count]) => `<button type="button" data-${attribute}="${escapeHtml(value)}">${escapeHtml(value)} ${count}</button>`)
  ].join("");
}

function sourceEvidenceList(items: FileLesson["sourceEvidence"], filePath: string): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 소스 근거가 없습니다.</p>";
  const sourceHref = sourceFileHref(filePath);
  return `<ul class="source-evidence">${items.map((item) => `<li><span class="muted">L${item.line} · ${escapeHtml(item.kind)}</span><code>${escapeHtml(item.snippet)}</code><a class="source-link" href="${sourceHref}">원본 열기</a></li>`).join("")}</ul>`;
}

function evidenceIndexCards(fileLessons: FileLesson[]): string {
  const rows = fileLessons.flatMap((lesson) => (lesson.sourceEvidence ?? []).map((item) => ({ ...item, filePath: lesson.filePath })));
  if (rows.length === 0) return "<article><h3>기록된 소스 근거가 없습니다.</h3><p>핵심 파일 분석을 다시 실행하면 이곳에 근거가 쌓입니다.</p></article>";
  return rows.map((item) => `<article id="${htmlAnchor(`${item.filePath}-${item.line}-${item.kind}`)}" data-evidence-kind="${escapeHtml(item.kind)}"><h3>${escapeHtml(item.filePath)}:L${item.line}</h3><p class="muted">${escapeHtml(item.kind)}</p><code>${escapeHtml(item.snippet)}</code><p><a href="files.html#${htmlAnchor(item.filePath)}">파일 수업</a> · <a class="source-link" href="${sourceFileHref(item.filePath)}">원본 열기</a></p></article>`).join("");
}

function evidenceKindFilterButtons(fileLessons: FileLesson[]): string {
  const counts = countBy(fileLessons.flatMap((lesson) => (lesson.sourceEvidence ?? []).map((item) => item.kind)));
  return fileFilterButtons("evidence-kind-filter", "전체 근거 종류", counts);
}

function linkedFileList(items: string[]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="files.html#${htmlAnchor(item)}">${escapeHtml(item)}</a></li>`).join("")}</ul>`;
}

function interfaceSourceList(items: Array<{ text: string; sourceHref: string }>): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.text)} <a class="interface-source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function symbolCards(symbols: SymbolMapReport["symbols"]): string {
  if (symbols.length === 0) return "<article><h3>기록된 심볼이 없습니다.</h3><p>지원되는 코드 파일이 적거나 선언 패턴을 찾지 못했습니다.</p></article>";
  return symbols.map((symbol) => `<article class="symbol-map-card" data-symbol-kind="${escapeHtml(symbol.kind)}" data-symbol-exported="${symbol.exported}"><h3>${escapeHtml(symbol.name)}</h3><p class="muted">${escapeHtml(symbol.kind)}${symbol.exported ? " · exported" : ""}</p><p>${escapeHtml(symbol.filePath)}</p><a href="${escapeHtml(symbol.lessonHref.replace(/^html\//, ""))}">파일 수업</a> <a class="symbol-source-link" href="../${escapeHtml(symbol.sourceHref)}">원본 열기</a></article>`).join("");
}

function apiEntryPointList(items: ApiReferenceReport["entryPoints"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 entry point가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.filePath)}</a>: ${escapeHtml(item.reason)} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function apiReferenceCards(symbols: ApiReferenceReport["publicSymbols"]): string {
  if (symbols.length === 0) return "<article><h3>기록된 public symbol이 없습니다.</h3><p>export 신호가 있는 파일을 다시 확인하세요.</p></article>";
  return symbols.map((symbol) => `<article class="api-reference-card" data-api-kind="${escapeHtml(symbol.kind)}" data-api-category="${escapeHtml(symbol.category)}"><h3>${escapeHtml(symbol.name)}</h3><p class="muted">ReflectionKind ${escapeHtml(symbol.kind)} · ${escapeHtml(symbol.category)}</p><code>${escapeHtml(symbol.signature)}</code><p>${escapeHtml(symbol.filePath)}</p><a href="${escapeHtml(symbol.lessonHref.replace(/^html\//, ""))}">파일 수업</a> <a class="api-reference-source-link" href="../${escapeHtml(symbol.sourceHref)}">원본 열기</a></article>`).join("");
}

function apiWarningList(items: ApiReferenceReport["exportWarnings"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 export warning이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.symbolName)}</strong> in ${escapeHtml(item.filePath)}: ${escapeHtml(item.message)} ${escapeHtml(item.suggestion)} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function searchFilterList(items: SearchIndexReport["filterIndex"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 filter index가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filter)}</strong>: ${item.values.map((value) => `${escapeHtml(value.value)} ${value.documentCount}`).join(", ")}</li>`).join("")}</ul>`;
}

function searchTermList(items: SearchIndexReport["termIndex"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 term index가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.term)}</strong>: ${item.documentCount} docs · ${escapeHtml(item.documents.slice(0, 4).join(", "))}</li>`).join("")}</ul>`;
}

function searchDocumentCards(documents: SearchIndexReport["documents"]): string {
  if (documents.length === 0) return "<article><h3>기록된 search document가 없습니다.</h3><p>분석을 다시 실행하면 이곳에 문서 프래그먼트가 쌓입니다.</p></article>";
  return documents.map((document) => `<article class="search-index-card" data-search-section="${escapeHtml(document.section)}"><h3>${escapeHtml(document.title)}</h3><p class="muted">${escapeHtml(document.section)} · ${document.wordCount} words · ${escapeHtml(document.sourcePath ?? "generated")}</p><p>filters: ${escapeHtml(Object.entries(document.filters).map(([key, values]) => `${key}=${values.join("|")}`).join(", "))}</p><p>meta: ${escapeHtml(Object.keys(document.meta).join(", "))}</p><p>top terms: ${escapeHtml(document.topTerms.join(", ") || "none")}</p><a href="${escapeHtml(document.href.replace(/^html\//, ""))}">문서 열기</a></article>`).join("");
}

function learningFocusList(items: LearningJournalReport["focusGoals"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 focus goal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong>: ${escapeHtml(item.value)} <a href="${escapeHtml(htmlPageHref(item.evidenceHref))}">evidence</a></li>`).join("")}</ul>`;
}

function learningReviewList(items: LearningJournalReport["spacedReviewQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 spaced review 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.concept)}</strong> · ${escapeHtml(item.reviewBy)} · review ${item.reviewNumber}<br>${escapeHtml(item.prompt)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function learningAhaList(items: LearningJournalReport["ahaMoments"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 aha moment가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.insight)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function learningMasteryCards(levels: LearningJournalReport["masteryLevels"]): string {
  if (levels.length === 0) return "<article><h3>기록된 mastery map이 없습니다.</h3><p>분석을 다시 실행하면 이곳에 concept 상태가 쌓입니다.</p></article>";
  return levels.map((level) => `<article class="learning-journal-card" data-mastery-level="${escapeHtml(level.level)}"><h3>${escapeHtml(level.label)}</h3>${level.concepts.length === 0 ? "<p class=\"muted\">항목 없음</p>" : `<ul>${level.concepts.map((concept) => `<li><strong>${escapeHtml(concept.concept)}</strong><br>${escapeHtml(concept.status)}<br><span class="muted">${escapeHtml(concept.reason)}</span><br><em>${escapeHtml(concept.reviewPrompt)}</em><br><a href="${escapeHtml(htmlPageHref(concept.relatedHref))}">관련 리포트</a></li>`).join("")}</ul>`}</article>`).join("");
}

function learningQuestionCards(items: LearningJournalReport["openQuestions"]): string {
  if (items.length === 0) return "<article><h3>기록된 open question이 없습니다.</h3><p>분석을 다시 실행하면 이곳에 질문이 쌓입니다.</p></article>";
  return items.map((item) => `<article class="learning-journal-card" data-question-type="${escapeHtml(item.promptType)}"><h3>${escapeHtml(item.promptType)}</h3><p>${escapeHtml(item.question)}</p><p class="muted">${escapeHtml(item.sourcePattern)}</p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 리포트 열기</a></article>`).join("");
}

function learningPromptCards(items: LearningJournalReport["socraticPrompts"]): string {
  if (items.length === 0) return "<article><h3>기록된 Socratic prompt가 없습니다.</h3><p>분석을 다시 실행하면 이곳에 질문 패턴이 쌓입니다.</p></article>";
  return items.map((item) => `<article class="learning-journal-card"><h3>${escapeHtml(item.category)}</h3><p>${escapeHtml(item.question)}</p><p class="muted">${escapeHtml(item.useWhen)}</p><h4>Graduated Hints</h4>${list(item.hintLevels)}<a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 리포트 열기</a></article>`).join("");
}

function projectActivitySignalList(items: ProjectActivityReport["activitySignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 activity signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong>: ${escapeHtml(item.value)}<br>${escapeHtml(item.explanation)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 리포트 열기</a></li>`).join("")}</ul>`;
}

function projectActivityQueueList(items: ProjectActivityReport["reviewQueues"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 review queue가 없습니다.</p>";
  return `<ul>${items.map((queue) => `<li><strong>${escapeHtml(queue.queue)}</strong>: ${escapeHtml(queue.purpose)} (${queue.items.length} items)</li>`).join("")}</ul>`;
}

function projectActivityDecisionPromptList(items: ProjectActivityReport["architectureDecisionPrompts"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 decision prompt가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.trigger)}</strong><br>${escapeHtml(item.question)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 근거 열기</a></li>`).join("")}</ul>`;
}

function projectActivityHotspotCards(items: ProjectActivityReport["hotspotCandidates"]): string {
  if (items.length === 0) return "<article class=\"project-activity-card\"><h3>Hotspot 후보가 없습니다.</h3><p>핵심 파일이 충분하지 않거나 정적 신호가 낮습니다.</p></article>";
  return items.map((item) => `<article class="project-activity-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">static hotspot score ${item.score}</p><p>${escapeHtml(item.reason)}</p><h4>Signals</h4>${list(item.signals)}<p><a href="${escapeHtml(htmlPageHref(item.lessonHref))}">파일 수업</a> · <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></p></article>`).join("");
}

function projectActivityDeadCodeCards(items: ProjectActivityReport["deadCodeCandidates"]): string {
  if (items.length === 0) return "<article class=\"project-activity-card\"><h3>Dead-code 후보가 없습니다.</h3><p>dependency graph에서 no-orphans 후보를 찾지 못했습니다.</p></article>";
  return items.map((item) => `<article class="project-activity-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">dead-code confidence ${item.confidence}</p><p>${escapeHtml(item.reason)}</p><p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 수업</a> · <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></p></article>`).join("");
}

function codeMetricsLanguageList(items: CodeMetricsReadinessReport["languageMetrics"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 language metric이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.language)}</strong><br>files/code/comments/blanks/branches/functions/density ${item.fileCount}/${item.codeLines}/${item.commentLines}/${item.blankLines}/${item.branchCount}/${item.functionCount}/${item.complexityDensity}<br>${escapeHtml(item.evidence)}</li>`).join("")}</ul>`;
}

function codeMetricsHotspotCards(items: CodeMetricsReadinessReport["hotspots"]): string {
  if (items.length === 0) return "<article class=\"code-metrics-readiness-card\"><h3>Metric hotspot 후보가 없습니다.</h3><p>읽을 수 있는 code metric 후보가 충분하지 않습니다.</p></article>";
  return items.map((item) => `<article class="code-metrics-readiness-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.language)} · ${escapeHtml(item.readingPriority)} priority · score ${item.hotspotScore}</p><p>lines/code/branches/functions/density ${item.lines}/${item.codeLines}/${item.branchCount}/${item.functionCount}/${item.complexityDensity}</p><p>${escapeHtml(item.evidence)}</p><p><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></p></article>`).join("");
}

function codeMetricsSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(codeMetricsHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function codeMetricsCommandList(items: CodeMetricsReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">추천 command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function codeMetricsRiskList(items: CodeMetricsReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 risk가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br>${escapeHtml(item.why)}<br><a href="${escapeHtml(codeMetricsHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function codeMetricsHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  if (href.startsWith("html/")) return href.slice("html/".length);
  return href;
}

function codeOwnershipFileList(items: CodeOwnershipReadinessReport["codeownerFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">CODEOWNERS file 후보가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.location)}/${escapeHtml(item.readiness)}]<br>rules/owners/team/user/email ${item.ruleCount}/${item.ownerCount}/${item.teamOwnerCount}/${item.userOwnerCount}/${item.emailOwnerCount}<br>wildcards/protected/duplicates/self-owned ${item.wildcardCount}/${item.protectedPathCount}/${item.duplicatePatternCount}/${item.selfOwnershipCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(codeOwnershipHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function codeOwnershipSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(codeOwnershipHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function codeOwnershipCommandList(items: CodeOwnershipReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function codeOwnershipRiskList(items: CodeOwnershipReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">검토 risk가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br>${escapeHtml(item.why)}<br><a href="${escapeHtml(codeOwnershipHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function codeOwnershipHref(href: string): string {
  return href.startsWith("source/") ? `../${href}` : htmlPageHref(href);
}

function largeAssetSetupList(items: LargeAssetReadinessReport["assetSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">large asset setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.setupType)}/${escapeHtml(item.readiness)}]<br>LFS pattern/pointer/lockable/command ${item.patternCount}/${item.pointerCount}/${item.lockableCount}/${item.commandCount}<br>DVC outs/deps/metrics/remotes/cache ${item.outCount}/${item.depCount}/${item.metricCount}/${item.remoteCount}/${item.cacheCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(largeAssetHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function largeAssetSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">large asset signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(largeAssetHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function largeAssetCommandList(items: LargeAssetReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function largeAssetRiskList(items: LargeAssetReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(largeAssetHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function largeAssetHref(href: string): string {
  return href.startsWith("source/") ? `../${href}` : htmlPageHref(href);
}

function licenseChecklistList(items: LicenseRightsReport["rightsChecklist"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 checklist가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 근거 열기</a></li>`).join("")}</ul>`;
}

function licenseWarningList(items: LicenseRightsReport["reviewWarnings"]): string {
  if (items.length === 0) return "<p class=\"muted\">검토 경고가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.severity)}</strong>: ${escapeHtml(item.message)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function packageLicenseList(items: LicenseRightsReport["packageLicenseSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">package license metadata가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.filePath)}: ${escapeHtml(item.packageName ?? "unnamed")} declares ${escapeHtml(item.licenseText)} -> ${escapeHtml(item.detectedSpdxId ?? "unknown")} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function readmeLicenseList(items: LicenseRightsReport["readmeLicenseReferences"]): string {
  if (items.length === 0) return "<p class=\"muted\">README license reference가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.filePath)}: ${escapeHtml(item.detectedSpdxId ?? "unknown")} / confidence ${item.confidence}<br><code>${escapeHtml(item.snippet)}</code><br><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function licenseFileCards(items: LicenseRightsReport["licenseFiles"]): string {
  if (items.length === 0) return "<article class=\"license-rights-card\"><h3>License file 후보가 없습니다.</h3><p>배포나 외부 공개 전에 LICENSE 파일을 추가할지 검토하세요.</p></article>";
  return items.map((item) => `<article class="license-rights-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.detectedSpdxId ?? "unknown")} · confidence ${item.confidence} · filename score ${item.filenameScore}</p><p>${escapeHtml(item.evidence)}</p><p>matcher: ${escapeHtml(item.matcher)}</p><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></article>`).join("");
}

function sbomManifestList(items: SbomReport["packageManifests"]): string {
  if (items.length === 0) return "<p class=\"muted\">package manifest가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.filePath)}: ${escapeHtml(item.ecosystem)} · packages ${item.packageCount} · direct ${item.directDependencies} · dev ${item.devDependencies}<br><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function sbomOutputFormatList(items: SbomReport["outputFormats"]): string {
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.format)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.reason)}</li>`).join("")}</ul>`;
}

function sbomWarningList(items: SbomReport["reviewWarnings"]): string {
  if (items.length === 0) return "<p class=\"muted\">검토 경고가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.severity)}</strong>: ${escapeHtml(item.message)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function sbomPackageCards(items: SbomReport["packageArtifacts"]): string {
  if (items.length === 0) return "<article class=\"sbom-card\"><h3>Package artifact가 없습니다.</h3><p>지원되는 package manifest를 추가하면 여기에 표시됩니다.</p></article>";
  return items.slice(0, 80).map((item) => `<article class="sbom-card"><h3>${escapeHtml(item.name)}${item.version ? `@${escapeHtml(item.version)}` : ""}</h3><p class="muted">${escapeHtml(item.packageType)} · ${escapeHtml(item.ecosystem)} · ${escapeHtml(item.foundBy)}</p><p>PURL: <code>${escapeHtml(item.purl ?? "unknown")}</code></p><p>Licenses: ${escapeHtml(item.licenses.join(", ") || "unknown")}</p><p>Locations: ${escapeHtml(item.locations.join(", "))}</p><a class="source-link" href="../${escapeHtml(item.evidenceHref)}">근거 열기</a></article>`).join("");
}

function sbomFileCards(items: SbomReport["fileArtifacts"]): string {
  if (items.length === 0) return "<article class=\"sbom-card\"><h3>File artifact가 없습니다.</h3><p>manifest, lockfile, container 파일이 감지되지 않았습니다.</p></article>";
  return items.map((item) => `<article class="sbom-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.artifactKind)} · ${item.size} bytes</p><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></article>`).join("");
}

function sbomRelationshipList(items: SbomReport["relationships"]): string {
  if (items.length === 0) return "<p class=\"muted\">relationship이 없습니다.</p>";
  return `<ul>${items.slice(0, 100).map((item) => `<li><code>${escapeHtml(item.from)}</code> --${escapeHtml(item.relationshipType)}--&gt; <code>${escapeHtml(item.to)}</code> <a class="source-link" href="../${escapeHtml(item.evidenceHref)}">evidence</a></li>`).join("")}</ul>`;
}

function securityTargetList(items: SecurityReadinessReport["scannerTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">scanner target이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityCoverageList(items: SecurityReadinessReport["scannerCoverage"]): string {
  if (items.length === 0) return "<p class=\"muted\">scanner coverage가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.scanner)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityActionList(items: SecurityReadinessReport["actionQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">action queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br>${escapeHtml(item.why)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityCommandList(items: SecurityReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function securitySignalCards(items: SecurityReadinessReport["securitySignals"]): string {
  if (items.length === 0) return "<article class=\"security-readiness-card\"><h3>Security signal이 없습니다.</h3><p>지원되는 manifest, lockfile, container, IaC, license, SBOM 신호가 감지되지 않았습니다.</p></article>";
  return items.slice(0, 100).map((item) => `<article class="security-readiness-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.kind)} · ${escapeHtml(item.severity)}</p><p>${escapeHtml(item.message)}</p><a class="source-link" href="${escapeHtml(securitySignalHref(item.sourceHref))}">근거 열기</a></article>`).join("");
}

function securitySignalHref(href: string): string {
  if (href.startsWith("html/")) return htmlPageHref(href);
  return `../${href}`;
}

function scorecardCheckCards(items: ScorecardReport["checks"]): string {
  if (items.length === 0) return "<article class=\"scorecard-card\"><h3>Scorecard check가 없습니다.</h3><p>분석을 다시 실행하면 이곳에 체크 결과가 쌓입니다.</p></article>";
  return items.map((item) => `<article class="scorecard-card" data-scorecard-status="${escapeHtml(item.status)}" data-scorecard-risk="${escapeHtml(item.risk)}"><h3>${escapeHtml(item.name)}</h3><p class="muted">${item.score === null ? "unknown" : `${item.score}/10`} · ${escapeHtml(item.status)} · ${escapeHtml(item.risk)}</p><p>${escapeHtml(item.evidence)}</p><h4>Remediation</h4><p>${escapeHtml(item.remediation)}</p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></article>`).join("");
}

function scorecardCategoryList(items: ScorecardReport["categoryScores"]): string {
  if (items.length === 0) return "<p class=\"muted\">category score가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.category)}</strong>: ${item.score === null ? "unknown" : `${item.score}/10`}<br>${escapeHtml(item.explanation)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scorecardPolicyList(items: ScorecardReport["policyFindings"]): string {
  if (items.length === 0) return "<p class=\"muted\">policy finding이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.policy)}</strong> [${escapeHtml(item.result)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scorecardRiskList(items: ScorecardReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong> ${escapeHtml(item.checkName)}<br>${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scorecardStructuredList(items: ScorecardReport["structuredResults"]): string {
  if (items.length === 0) return "<p class=\"muted\">structured result가 없습니다.</p>";
  return `<ul>${items.slice(0, 30).map((item) => `<li><strong>${escapeHtml(item.checkName)}</strong> [${escapeHtml(item.outcome)}]<br>${escapeHtml(item.probe)}<br><span class="muted">${escapeHtml(item.evidence)}</span></li>`).join("")}</ul>`;
}

function provenanceArtifactList(items: ProvenanceReport["artifactSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">artifact signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.artifact)}</strong> [${escapeHtml(item.artifactType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceSignatureList(items: ProvenanceReport["signatureSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">signature material이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.material)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceIdentityList(items: ProvenanceReport["identityRequirements"]): string {
  if (items.length === 0) return "<p class=\"muted\">identity requirement가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.requirement)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceRiskList(items: ProvenanceReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceAttestationCards(items: ProvenanceReport["attestationSignals"]): string {
  if (items.length === 0) return "<article class=\"provenance-card\"><h3>Attestation signal이 없습니다.</h3><p>지원되는 predicate 또는 DSSE envelope 신호가 감지되지 않았습니다.</p></article>";
  return items.map((item) => `<article class="provenance-card" data-provenance-readiness="${escapeHtml(item.readiness)}"><h3>${escapeHtml(item.predicateType)}</h3><p class="muted">${escapeHtml(item.readiness)}</p><p>${escapeHtml(item.evidence)}</p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></article>`).join("");
}

function provenanceCommandList(items: ProvenanceReport["verificationCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">verification command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function advisoryTargetCards(items: AdvisoryReport["packageQueryTargets"]): string {
  if (items.length === 0) return "<article class=\"advisory-card\"><h3>Package query target이 없습니다.</h3><p>지원되는 manifest나 SBOM package evidence가 감지되지 않았습니다.</p></article>";
  return items.slice(0, 80).map((item) => `<article class="advisory-card" data-advisory-readiness="${escapeHtml(item.readiness)}"><h3>${escapeHtml(item.name)}${item.version ? `@${escapeHtml(item.version)}` : ""}</h3><p class="muted">${escapeHtml(item.ecosystem)} · ${escapeHtml(item.sourceType)} · ${escapeHtml(item.readiness)}</p><p>PURL: <code>${escapeHtml(item.purl ?? "unknown")}</code></p><p>${escapeHtml(item.evidence)}</p><a class="source-link" href="${escapeHtml(advisoryHref(item.relatedHref))}">근거 열기</a></article>`).join("");
}

function advisoryLockfileList(items: AdvisoryReport["lockfileSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">lockfile signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.ecosystem)} / ${escapeHtml(item.readiness)}]<br>${item.packageCount} package candidate(s)<br><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function advisorySourceList(items: AdvisoryReport["advisorySources"]): string {
  if (items.length === 0) return "<p class=\"muted\">advisory source가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.source)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryPolicyList(items: AdvisoryReport["policyControls"]): string {
  if (items.length === 0) return "<p class=\"muted\">policy control이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.control)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryResultList(items: AdvisoryReport["resultModel"]): string {
  if (items.length === 0) return "<p class=\"muted\">result model이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.field)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.purpose)}<br><span class="muted">${escapeHtml(item.evidence)}</span><br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryRiskList(items: AdvisoryReport["remediationQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">remediation queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryCommandList(items: AdvisoryReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function advisoryHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function vexProductCards(items: VexReport["productTargets"]): string {
  if (items.length === 0) return "<article class=\"vex-card\"><h3>Product target이 없습니다.</h3><p>package PURL, source digest, SBOM, container evidence가 필요합니다.</p></article>";
  return items.slice(0, 80).map((item) => `<article class="vex-card" data-vex-product-type="${escapeHtml(item.productType)}"><h3>${escapeHtml(item.productType)}</h3><p><code>${escapeHtml(item.productId)}</code></p><p class="muted">${escapeHtml(item.version ?? "unversioned")}</p><p>${escapeHtml(item.evidence)}</p><a href="${escapeHtml(vexHref(item.relatedHref))}">근거 열기</a></article>`).join("");
}

function vexInputList(items: VexReport["vulnerabilityInputs"]): string {
  if (items.length === 0) return "<p class=\"muted\">vulnerability input이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.source)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vexHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vexStatusList(items: VexReport["statusMatrix"]): string {
  if (items.length === 0) return "<p class=\"muted\">status rule이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.status)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.requiredEvidence)}<br><span class="muted">filters scanner result: ${item.filtersScannerResult ? "yes" : "no"} · fields: ${escapeHtml(item.allowedFields.join(", ") || "none")}</span></li>`).join("")}</ul>`;
}

function vexJustificationList(items: VexReport["justificationCatalog"]): string {
  if (items.length === 0) return "<p class=\"muted\">justification 후보가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.justification)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.useWhen)}<br><span class="muted">impact statement: ${item.requiresImpactStatement ? "required" : "optional"}</span></li>`).join("")}</ul>`;
}

function vexStatementList(items: VexReport["statementDrafts"]): string {
  if (items.length === 0) return "<p class=\"muted\">statement draft가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.vulnerabilityId)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.productIds.join(", ") || "no products")}<br><span class="muted">justification: ${escapeHtml(item.justification ?? "none")} · review: ${item.needsHumanReview ? "required" : "not required"}</span><br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vexHref(item.relatedHref))}">근거 열기</a></li>`).join("")}</ul>`;
}

function vexWorkflowList(items: VexReport["documentWorkflow"]): string {
  if (items.length === 0) return "<p class=\"muted\">workflow command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.step)}</strong> [${escapeHtml(item.readiness)}]<br><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function vexAttestationList(items: VexReport["attestationReadiness"]): string {
  if (items.length === 0) return "<p class=\"muted\">attestation readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.requirement)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vexHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vexRiskList(items: VexReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(vexHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vexHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function policyDocumentCards(items: PolicyGateReport["policyDocuments"]): string {
  if (items.length === 0) return "<article class=\"policy-gate-card\"><h3>Rego policy가 없습니다.</h3><p>OPA gate를 만들려면 .rego policy module이 필요합니다.</p></article>";
  return items.map((item) => `<article class="policy-gate-card" data-policy-readiness="${escapeHtml(item.readiness)}"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.packageName ?? "unknown package")} · ${escapeHtml(item.readiness)}</p><p>rules ${item.ruleCount} · tests ${item.testRuleCount}</p><p>decision rules: ${escapeHtml(item.decisionRules.join(", ") || "none")}</p><a href="${escapeHtml(policyHref(item.sourceHref))}">원본 열기</a></article>`).join("");
}

function policyInputList(items: PolicyGateReport["inputDocuments"]): string {
  if (items.length === 0) return "<p class=\"muted\">input/data document가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.documentType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(policyHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function policyGateQueryList(items: PolicyGateReport["gateQueries"]): string {
  if (items.length === 0) return "<p class=\"muted\">gate query 후보가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.query)}</code> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.purpose)}<br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyCoverageList(items: PolicyGateReport["testCoverage"]): string {
  if (items.length === 0) return "<p class=\"muted\">test coverage readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyBundleList(items: PolicyGateReport["bundleReadiness"]): string {
  if (items.length === 0) return "<p class=\"muted\">bundle readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.requirement)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyDecisionList(items: PolicyGateReport["decisionOutputs"]): string {
  if (items.length === 0) return "<p class=\"muted\">decision output 모델이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.field)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.purpose)}<br><span class="muted">${escapeHtml(item.evidence)}</span><br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyCommandList(items: PolicyGateReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function policyRiskList(items: PolicyGateReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function apiContractSchemaCards(items: ApiContractReport["schemaDocuments"]): string {
  if (items.length === 0) return "<article class=\"api-contract-card\"><h3>API schema가 없습니다.</h3><p>OpenAPI, Swagger, GraphQL, Postman, AsyncAPI contract를 추가해야 generated API checks를 준비할 수 있습니다.</p></article>";
  return items.map((item) => `<article class="api-contract-card" data-contract-schema-type="${escapeHtml(item.schemaType)}"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.schemaType)} · ${escapeHtml(item.readiness)} · ${escapeHtml(item.version ?? "unknown version")}</p><p>operations ${item.operationCount}</p><p>${escapeHtml(item.evidence)}</p><a href="${escapeHtml(apiContractHref(item.sourceHref))}">원본 열기</a></article>`).join("");
}

function apiContractOperationList(items: ApiContractReport["operationTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">operation target이 없습니다.</p>";
  return `<ul>${items.slice(0, 80).map((item) => `<li><strong>${escapeHtml(item.method ?? "operation")}</strong> ${escapeHtml(item.path ?? item.operationId ?? "unknown")} [${escapeHtml(item.readiness)}]<br><span class="muted">${escapeHtml(item.source)} · ${escapeHtml(item.operationId ?? "no operationId")}</span><br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(apiContractHref(item.relatedHref))}">관련 schema 열기</a></li>`).join("")}</ul>`;
}

function apiContractPhaseList(items: ApiContractReport["testPhases"]): string {
  if (items.length === 0) return "<p class=\"muted\">test phase readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.phase)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(apiContractHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function apiContractCheckList(items: ApiContractReport["checkMatrix"]): string {
  if (items.length === 0) return "<p class=\"muted\">check matrix가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.check)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(apiContractHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function apiContractRuntimeList(items: ApiContractReport["runtimeTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">runtime target readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(apiContractHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function apiContractReportingList(items: ApiContractReport["reportingOutputs"]): string {
  if (items.length === 0) return "<p class=\"muted\">reporting output readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.output)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(apiContractHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function apiContractCommandList(items: ApiContractReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function apiContractRiskList(items: ApiContractReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(apiContractHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function apiContractHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function consumerContractReadinessSetupList(items: ConsumerContractReadinessReport["contractSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">consumer contract setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)} / ${escapeHtml(item.role)} / ${escapeHtml(item.readiness)}]<br>interactions ${item.interactionCount}, provider states ${item.providerStateCount}, verifiers ${item.verifierCount}, brokers ${item.brokerCount}, matchers ${item.matcherCount}, messages ${item.messageCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(consumerContractReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function consumerContractReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">consumer contract signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(consumerContractReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function consumerContractReadinessCommandList(items: ConsumerContractReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function consumerContractReadinessRiskList(items: ConsumerContractReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(consumerContractReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function consumerContractReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function observabilityPipelineList(items: ObservabilityReport["signalPipelines"]): string {
  if (items.length === 0) return "<p class=\"muted\">signal pipeline readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.signal)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(observabilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function observabilityInstrumentationList(items: ObservabilityReport["instrumentationSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">instrumentation signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.kind)} / ${escapeHtml(item.signal)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(observabilityHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function observabilityExporterList(items: ObservabilityReport["exporterTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">exporter target readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.signal)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(observabilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function observabilityResourceList(items: ObservabilityReport["resourceAttributes"]): string {
  if (items.length === 0) return "<p class=\"muted\">resource attribute signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.attribute)}</strong> [${escapeHtml(item.readiness)}]<br><span class="muted">${escapeHtml(item.source)}</span><br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(observabilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function observabilityPropagationList(items: ObservabilityReport["propagationContext"]): string {
  if (items.length === 0) return "<p class=\"muted\">propagation context readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.mechanism)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(observabilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function observabilityDiagnosticList(items: ObservabilityReport["diagnostics"]): string {
  if (items.length === 0) return "<p class=\"muted\">diagnostic readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.check)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(observabilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function observabilityCommandList(items: ObservabilityReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function observabilityRiskList(items: ObservabilityReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(observabilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function observabilityHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function performanceScriptList(items: PerformanceReport["scriptTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">script target이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.kind)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(performanceHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function performanceWorkloadList(items: PerformanceReport["workloadModels"]): string {
  if (items.length === 0) return "<p class=\"muted\">workload model readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.model)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(performanceHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function performanceThresholdList(items: PerformanceReport["thresholds"]): string {
  if (items.length === 0) return "<p class=\"muted\">threshold가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.metric)}</strong> [${escapeHtml(item.readiness)}]<br><code>${escapeHtml(item.expression)}</code><br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(performanceHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function performanceCheckList(items: PerformanceReport["checks"]): string {
  if (items.length === 0) return "<p class=\"muted\">k6 check가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.name)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(performanceHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function performanceMetricList(items: PerformanceReport["metrics"]): string {
  if (items.length === 0) return "<p class=\"muted\">metric evidence가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.metric)}</strong> [${escapeHtml(item.metricType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(performanceHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function performanceOutputList(items: PerformanceReport["outputs"]): string {
  if (items.length === 0) return "<p class=\"muted\">output readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(performanceHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function performanceRuntimeList(items: PerformanceReport["runtimeControls"]): string {
  if (items.length === 0) return "<p class=\"muted\">runtime control readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.control)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(performanceHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function performanceCommandList(items: PerformanceReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function performanceRiskList(items: PerformanceReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(performanceHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function performanceHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function loadTestingSetupList(items: LoadTestingReadinessReport["loadTestSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">load test setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>config/script/scenario/profile ${item.configCount}/${item.scriptCount}/${item.scenarioCount}/${item.loadProfileCount}<br>threshold/protocol/data/report ${item.thresholdCount}/${item.protocolCount}/${item.dataCount}/${item.reportCount}<br>distributed/CI ${item.distributedCount}/${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(loadTestingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function loadTestingSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">load testing signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(loadTestingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function loadTestingCommandList(items: LoadTestingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function loadTestingRiskList(items: LoadTestingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(loadTestingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function loadTestingHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function benchmarkSuiteList(items: BenchmarkReadinessReport["benchmarkSuites"]): string {
  if (items.length === 0) return "<p class=\"muted\">benchmark suite가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>config/tasks/timing ${item.configCount}/${item.taskCount}/${item.warmupCount + item.iterationCount}<br>parameters/hooks/async ${item.parameterCount}/${item.hookCount}/${item.asyncCount}<br>baseline/report/CI ${item.baselineCount}/${item.reportCount}/${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(benchmarkHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function benchmarkSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">benchmark signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(benchmarkHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function benchmarkCommandList(items: BenchmarkReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function benchmarkRiskList(items: BenchmarkReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(benchmarkHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function benchmarkHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function e2eSuiteList(items: E2eReport["testSuites"]): string {
  if (items.length === 0) return "<p class=\"muted\">E2E test suite가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(e2eHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function e2eBrowserList(items: E2eReport["browserProjects"]): string {
  if (items.length === 0) return "<p class=\"muted\">browser project readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.browser)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(e2eHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function e2eLocatorList(items: E2eReport["locatorSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">locator signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.locatorType)}</strong> in ${escapeHtml(item.filePath)} [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(e2eHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function e2eAssertionList(items: E2eReport["assertions"]): string {
  if (items.length === 0) return "<p class=\"muted\">assertion readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.assertion)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(e2eHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function e2eArtifactList(items: E2eReport["artifacts"]): string {
  if (items.length === 0) return "<p class=\"muted\">artifact readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.artifact)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(e2eHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function e2eRuntimeList(items: E2eReport["runtimeTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">runtime target readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(e2eHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function e2eCommandList(items: E2eReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function e2eRiskList(items: E2eReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(e2eHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function e2eHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function flakyTestSetupList(items: FlakyTestReadinessReport["flakyTestSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">flaky test setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)} / ${escapeHtml(item.readiness)}]<br>retry ${item.retryCount}, rerun ${item.rerunCount}, quarantine ${item.quarantineCount}, fail-on-flaky ${item.failOnFlakyCount}<br>filter ${item.filterCount}, delay ${item.delayCount}, artifact ${item.artifactCount}, isolation ${item.isolationCount}, timeout ${item.timeoutCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(flakyTestHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function flakyTestSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">flaky test readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(flakyTestHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function flakyTestCommandList(items: FlakyTestReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function flakyTestRiskList(items: FlakyTestReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(flakyTestHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function flakyTestHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function testImpactSetupList(items: TestImpactReadinessReport["impactSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">test impact setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>affected ${item.affectedCommandCount}, changed files ${item.changedFileInputCount}, base/head ${item.baseHeadCount}, graph ${item.graphCount}, cache ${item.cacheCount}<br>watch ${item.watchCount}, selection ${item.selectionCount}, report ${item.reportCount}, CI ${item.ciCount}, fallback ${item.fallbackCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(testImpactHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function testImpactSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">test impact readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(testImpactHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function testImpactCommandList(items: TestImpactReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function testImpactRiskList(items: TestImpactReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(testImpactHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function testImpactHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function testReportingSetupList(items: TestReportingReadinessReport["reportSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">test reporting setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.format)} / ${escapeHtml(item.readiness)}]<br>JUnit ${item.junitCount}, CTRF ${item.ctrfCount}, Allure ${item.allureCount}, reporters ${item.reporterCount}, outputs ${item.outputCount}<br>summary ${item.summaryCount}, annotations ${item.annotationCount}, artifacts ${item.artifactCount}, history ${item.historyCount}, metadata ${item.metadataCount}, CI ${item.ciCount}, fail policy ${item.failPolicyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(testReportingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function testReportingSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">test reporting readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(testReportingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function testReportingCommandList(items: TestReportingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function testReportingRiskList(items: TestReportingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(testReportingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function testReportingHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function snapshotSetupList(items: SnapshotReadinessReport["snapshotSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">snapshot setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)} / ${escapeHtml(item.readiness)}]<br>text ${item.textSnapshotCount}, inline ${item.inlineSnapshotCount}, file ${item.fileSnapshotCount}, visual ${item.visualSnapshotCount}, ARIA ${item.ariaSnapshotCount}<br>update ${item.updatePolicyCount}, serializers ${item.serializerCount}, path ${item.pathTemplateCount}, thresholds ${item.thresholdCount}, masks ${item.maskingCount}, CI ${item.ciCount}, baselines ${item.baselineCount}, review ${item.reviewCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(snapshotHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function snapshotSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">snapshot readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(snapshotHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function snapshotCommandList(items: SnapshotReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function snapshotRiskList(items: SnapshotReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(snapshotHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function snapshotHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function propertyBasedTestingSetupList(items: PropertyBasedTestingReadinessReport["propertySetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">property-based testing setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.ecosystem)} / ${escapeHtml(item.readiness)}]<br>properties ${item.propertyCount}, generators ${item.generatorCount}, assertions ${item.assertionCount}<br>shrink ${item.shrinkCount}, seed ${item.seedCount}, runs ${item.runCount}, stateful ${item.statefulCount}, examples ${item.exampleCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(propertyBasedTestingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function propertyBasedTestingSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">property-based testing readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(propertyBasedTestingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function propertyBasedTestingCommandList(items: PropertyBasedTestingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function propertyBasedTestingRiskList(items: PropertyBasedTestingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(propertyBasedTestingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function propertyBasedTestingHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function testDataReadinessSetupList(items: TestDataReadinessReport["dataSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">test data setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.ecosystem)} / ${escapeHtml(item.readiness)}]<br>factories ${item.factoryCount}, traits ${item.traitCount}, associations ${item.associationCount}, sequences ${item.sequenceCount}, faker ${item.fakerCount}<br>overrides ${item.overrideCount}, persistence ${item.persistenceCount}, seeds ${item.seedCount}, lint ${item.lintCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(testDataReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function testDataReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">test data readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(testDataReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function testDataReadinessCommandList(items: TestDataReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function testDataReadinessRiskList(items: TestDataReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(testDataReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function testDataReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function databaseMigrationReadinessSetupList(items: DatabaseMigrationReadinessReport["migrationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">database migration setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>versioned ${item.versionedCount}, repeatable ${item.repeatableCount}, changelog ${item.changelogCount}, changeset ${item.changesetCount}, revision ${item.revisionCount}<br>rollback ${item.rollbackCount}, validation ${item.validationCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(databaseMigrationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function databaseMigrationReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">database migration readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(databaseMigrationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function databaseMigrationReadinessCommandList(items: DatabaseMigrationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function databaseMigrationReadinessRiskList(items: DatabaseMigrationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(databaseMigrationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function databaseMigrationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function databaseOrmReadinessSetupList(items: DatabaseOrmReadinessReport["ormSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">database ORM setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)} / ${escapeHtml(item.readiness)}]<br>entity ${item.entityCount}, relation ${item.relationCount}, repository ${item.repositoryCount}, session ${item.sessionCount}, query ${item.queryCount}<br>transaction ${item.transactionCount}, migration ${item.migrationCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(databaseOrmReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function databaseOrmReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">database ORM readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(databaseOrmReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function databaseOrmReadinessCommandList(items: DatabaseOrmReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function databaseOrmReadinessRiskList(items: DatabaseOrmReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(databaseOrmReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function databaseOrmReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function dataQualityReadinessSetupList(items: DataQualityReadinessReport["dataQualitySetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">data quality setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>suite ${item.suiteCount}, expectation ${item.expectationCount}, checkpoint ${item.checkpointCount}, scan ${item.scanCount}<br>schema ${item.schemaTestCount}, freshness ${item.freshnessCount}, result ${item.resultCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataQualityReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dataQualityReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">data quality readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataQualityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataQualityReadinessCommandList(items: DataQualityReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function dataQualityReadinessRiskList(items: DataQualityReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(dataQualityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataQualityReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function dataLineageReadinessSetupList(items: DataLineageReadinessReport["lineageSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">data lineage setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>event ${item.eventCount}, dataset ${item.datasetCount}, job ${item.jobCount}, run ${item.runCount}<br>facet ${item.facetCount}, column lineage ${item.columnLineageCount}, artifact ${item.artifactCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataLineageReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dataLineageReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">data lineage readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataLineageReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataLineageReadinessCommandList(items: DataLineageReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function dataLineageReadinessRiskList(items: DataLineageReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(dataLineageReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataLineageReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function dataCatalogReadinessSetupList(items: DataCatalogReadinessReport["catalogSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">data catalog setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>ingestion ${item.ingestionCount}, entity ${item.entityCount}, schema ${item.schemaCount}, ownership ${item.ownershipCount}<br>glossary ${item.glossaryCount}, tag ${item.tagCount}, lineage ${item.lineageCount}, search ${item.searchCount}, policy ${item.policyCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataCatalogReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dataCatalogReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">data catalog readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataCatalogReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataCatalogReadinessCommandList(items: DataCatalogReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function dataCatalogReadinessRiskList(items: DataCatalogReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(dataCatalogReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataCatalogReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function dataAnnotationReadinessSetupList(items: DataAnnotationReadinessReport["annotationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">data annotation setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>project ${item.projectCount}, task ${item.taskCount}, schema ${item.schemaCount}, label ${item.labelCount}, workflow ${item.workflowCount}<br>quality ${item.qualityCount}, prelabel ${item.prelabelCount}, review ${item.reviewCount}, export ${item.exportCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataAnnotationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dataAnnotationReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">data annotation readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataAnnotationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataAnnotationReadinessCommandList(items: DataAnnotationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function dataAnnotationReadinessRiskList(items: DataAnnotationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(dataAnnotationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataAnnotationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function featureStoreReadinessSetupList(items: FeatureStoreReadinessReport["featureStoreSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">feature store setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>definition ${item.definitionCount}, entity ${item.entityCount}, source ${item.sourceCount}, offline ${item.offlineStoreCount}, online ${item.onlineStoreCount}<br>materialization ${item.materializationCount}, retrieval ${item.retrievalCount}, registry ${item.registryCount}, training ${item.trainingDatasetCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(featureStoreReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function featureStoreReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">feature store readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(featureStoreReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function featureStoreReadinessCommandList(items: FeatureStoreReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function featureStoreReadinessRiskList(items: FeatureStoreReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(featureStoreReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function featureStoreReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function modelRegistryReadinessSetupList(items: ModelRegistryReadinessReport["modelRegistrySetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">model registry setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>registered ${item.registeredModelCount}, version ${item.versionCount}, artifact ${item.artifactCount}, metadata ${item.metadataCount}, alias ${item.aliasCount}<br>stage ${item.stageCount}, lineage ${item.lineageCount}, signature ${item.signatureCount}, serving ${item.servingCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelRegistryReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function modelRegistryReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">model registry readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelRegistryReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelRegistryReadinessCommandList(items: ModelRegistryReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function modelRegistryReadinessRiskList(items: ModelRegistryReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(modelRegistryReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelRegistryReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function experimentTrackingReadinessSetupList(items: ExperimentTrackingReadinessReport["experimentTrackingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">experiment tracking setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>experiment ${item.experimentCount}, run ${item.runCount}, metric ${item.metricCount}, param ${item.paramCount}, artifact ${item.artifactCount}<br>dataset ${item.datasetCount}, tag ${item.tagCount}, config ${item.configCount}, sweep ${item.sweepCount}, offline sync ${item.offlineSyncCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(experimentTrackingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function experimentTrackingReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">experiment tracking readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(experimentTrackingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function experimentTrackingReadinessCommandList(items: ExperimentTrackingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function experimentTrackingReadinessRiskList(items: ExperimentTrackingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(experimentTrackingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function experimentTrackingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function modelMonitoringReadinessSetupList(items: ModelMonitoringReadinessReport["modelMonitoringSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">model monitoring setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>reference ${item.referenceCount}, current ${item.currentCount}, drift ${item.driftCount}, quality ${item.qualityCount}, performance ${item.performanceCount}<br>report ${item.reportCount}, alert ${item.alertCount}, schedule ${item.scheduleCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelMonitoringReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function modelMonitoringReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">model monitoring readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelMonitoringReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelMonitoringReadinessCommandList(items: ModelMonitoringReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function modelMonitoringReadinessRiskList(items: ModelMonitoringReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(modelMonitoringReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelMonitoringReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function modelServingReadinessSetupList(items: ModelServingReadinessReport["modelServingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">model serving setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>service ${item.inferenceServiceCount}, runtime ${item.runtimeCount}, repository ${item.modelRepositoryCount}, protocol ${item.protocolCount}, routing ${item.routingCount}<br>scaling ${item.autoscalingCount}, health ${item.healthCount}, resource ${item.resourceCount}, observability ${item.observabilityCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelServingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function modelServingReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">model serving readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelServingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelServingReadinessCommandList(items: ModelServingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function modelServingReadinessRiskList(items: ModelServingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(modelServingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelServingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function modelTrainingReadinessSetupList(items: ModelTrainingReadinessReport["modelTrainingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">model training setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>trainer ${item.trainerCount}, loop ${item.trainingLoopCount}, data ${item.dataCount}, optimizer ${item.optimizerCount}<br>distributed ${item.distributedCount}, accelerator ${item.acceleratorCount}, checkpoint ${item.checkpointCount}, callback ${item.callbackCount}, metric ${item.metricCount}, config ${item.configCount}, CI ${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelTrainingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function modelTrainingReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">model training readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(modelTrainingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelTrainingReadinessCommandList(items: ModelTrainingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function modelTrainingReadinessRiskList(items: ModelTrainingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(modelTrainingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function modelTrainingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function integrationTestEnvironmentReadinessSetupList(items: IntegrationTestEnvironmentReadinessReport["integrationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">integration setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.ecosystem)} / ${escapeHtml(item.readiness)}]<br>containers ${item.containerCount}, modules ${item.moduleCount}, wait ${item.hasWaitStrategy ? "yes" : "no"}, cleanup ${item.hasLifecycleCleanup ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(integrationTestEnvironmentReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function integrationTestEnvironmentReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(integrationTestEnvironmentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function integrationTestEnvironmentReadinessCommandList(items: IntegrationTestEnvironmentReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function integrationTestEnvironmentReadinessRiskList(items: IntegrationTestEnvironmentReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(integrationTestEnvironmentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function integrationTestEnvironmentReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function chaosEngineeringReadinessSetupList(items: ChaosEngineeringReadinessReport["chaosSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">chaos setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)} / ${escapeHtml(item.readiness)}]<br>experiments ${item.experimentCount}, faults ${item.faultCount}, scope ${item.scopeCount}, safety ${item.safetyCount}, observability ${item.observabilityCount}<br>selector ${item.hasSelector ? "yes" : "no"}, duration ${item.hasDuration ? "yes" : "no"}, probe/steady-state ${item.hasProbeOrSteadyState ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(chaosEngineeringReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function chaosEngineeringReadinessSignalList<T extends string>(
  items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>,
  labelKey: T
): string {
  if (items.length === 0) return "<p class=\"muted\">chaos readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(chaosEngineeringReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function chaosEngineeringReadinessCommandList(items: ChaosEngineeringReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function chaosEngineeringReadinessRiskList(items: ChaosEngineeringReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(chaosEngineeringReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function chaosEngineeringReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function accessibilityScanTargetList(items: AccessibilityReport["scanTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">scan target이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.kind)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(accessibilityHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function accessibilityRuleTagList(items: AccessibilityReport["ruleTags"]): string {
  if (items.length === 0) return "<p class=\"muted\">rule tag readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.tag)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(accessibilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function accessibilityResultBucketList(items: AccessibilityReport["resultBuckets"]): string {
  if (items.length === 0) return "<p class=\"muted\">result bucket readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.bucket)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(accessibilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function accessibilityImpactList(items: AccessibilityReport["impactLevels"]): string {
  if (items.length === 0) return "<p class=\"muted\">impact readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.impact)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(accessibilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function accessibilityIntegrationList(items: AccessibilityReport["integrationSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">integration signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.integration)}</strong> in ${escapeHtml(item.filePath)} [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(accessibilityHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function accessibilityContextList(items: AccessibilityReport["contextControls"]): string {
  if (items.length === 0) return "<p class=\"muted\">context control readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.control)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(accessibilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function accessibilityCommandList(items: AccessibilityReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function accessibilityRiskList(items: AccessibilityReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(accessibilityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function accessibilityHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function storybookStoryFileList(items: StorybookReport["storyFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">story file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.format)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(storybookHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function storybookConfigList(items: StorybookReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(storybookHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function storybookAnnotationList(items: StorybookReport["storyAnnotations"]): string {
  if (items.length === 0) return "<p class=\"muted\">story annotation readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.annotation)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(storybookHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function storybookAddonList(items: StorybookReport["addonSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">addon signal readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.addon)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(storybookHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function storybookTestList(items: StorybookReport["testSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">test signal readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.signal)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(storybookHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function storybookPublishList(items: StorybookReport["publishSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">publish signal readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.signal)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(storybookHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function storybookCommandList(items: StorybookReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function storybookRiskList(items: StorybookReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(storybookHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function storybookHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function designTokenSourceList(items: DesignTokensReport["tokenSources"]): string {
  if (items.length === 0) return "<p class=\"muted\">token source가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.format)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(designTokenHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function designTokenCategoryList(items: DesignTokensReport["tokenCategories"]): string {
  if (items.length === 0) return "<p class=\"muted\">token category readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.category)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(designTokenHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function designTokenPlatformList(items: DesignTokensReport["platformTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">platform target readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(designTokenHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function designTokenTransformList(items: DesignTokensReport["transformSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">transform signal readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.signal)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(designTokenHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function designTokenUsageList(items: DesignTokensReport["usageSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">usage signal readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.signal)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(designTokenHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function designTokenGovernanceList(items: DesignTokensReport["governanceSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">governance signal readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.signal)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(designTokenHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function designTokenCommandList(items: DesignTokensReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function designTokenRiskList(items: DesignTokensReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(designTokenHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function designTokenHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function i18nMessageSourceList(items: I18nReport["messageSources"]): string {
  if (items.length === 0) return "<p class=\"muted\">message source가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.mechanism)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(i18nHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function i18nLocaleAssetList(items: I18nReport["localeAssets"]): string {
  if (items.length === 0) return "<p class=\"muted\">locale asset이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.assetType)} / ${escapeHtml(item.readiness)}]<br>Locale: ${escapeHtml(item.locale ?? "unknown")}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(i18nHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function i18nSignalList(items: Array<{ signal: string; readiness: string; evidence: string; relatedHref: string }>): string {
  if (items.length === 0) return "<p class=\"muted\">signal readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.signal)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(i18nHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function i18nCommandList(items: I18nReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function i18nRiskList(items: I18nReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(i18nHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function i18nHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function releaseConfigList(items: ReleaseReadinessReport["releaseConfigs"]): string {
  if (items.length === 0) return "<p class=\"muted\">release config가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(releaseHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function releaseSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">release signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(releaseHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function releaseCommandList(items: ReleaseReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function releaseRiskList(items: ReleaseReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(releaseHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function releaseHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function secretSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">secret readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(secretHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function secretSurfaceList(items: SecretReadinessReport["secretSurfaces"]): string {
  if (items.length === 0) return "<p class=\"muted\">secret surface가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.surfaceType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(secretHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function secretConfigList(items: SecretReadinessReport["configSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">secret config signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.signal)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(secretHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function secretCommandList(items: SecretReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function secretRiskList(items: SecretReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(secretHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function secretHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function secretManagementReadinessSetupList(items: SecretManagementReadinessReport["secretManagementSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">secret management setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>auth/engine/policy/injection/rotation/sync/audit/lease/encryption/CLI ${item.authCount}/${item.engineCount}/${item.policyCount}/${item.injectionCount}/${item.rotationCount}/${item.syncCount}/${item.auditCount}/${item.leaseCount}/${item.encryptionCount}/${item.cliCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(secretManagementReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function secretManagementReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">secret management signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(secretManagementReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function secretManagementReadinessCommandList(items: SecretManagementReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function secretManagementReadinessRiskList(items: SecretManagementReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(secretManagementReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function secretManagementReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function containerDockerfileList(items: ContainerReadinessReport["dockerfiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">Dockerfile target이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>Stages ${item.stageCount} · base ${escapeHtml(item.baseImages.join(", ") || "none")}<br>Instructions ${escapeHtml(item.instructionKinds.join(", ") || "none")}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(containerHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function containerComposeList(items: ContainerReadinessReport["composeFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">Compose file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]: ${item.serviceCount} service(s)<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(containerHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function containerConfigList(items: ContainerReadinessReport["configSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">container config signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.signal)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(containerHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function containerSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">container readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(containerHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function containerCommandList(items: ContainerReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function containerRiskList(items: ContainerReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(containerHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function containerHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function codeQualityConfigList(items: CodeQualityReport["toolConfigs"]): string {
  if (items.length === 0) return "<p class=\"muted\">code quality config가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(codeQualityHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function codeQualitySignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">code quality signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(codeQualityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function codeQualityLanguageList(items: CodeQualityReport["languageCoverage"]): string {
  if (items.length === 0) return "<p class=\"muted\">language coverage가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.language)}</strong> [${escapeHtml(item.readiness)}]: ${item.fileCount} file(s)<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(codeQualityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function codeQualityCommandList(items: CodeQualityReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function codeQualityRiskList(items: CodeQualityReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(codeQualityHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function codeQualityHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function documentationConfigList(items: DocumentationReport["siteConfigs"]): string {
  if (items.length === 0) return "<p class=\"muted\">documentation config가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(documentationHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function documentationContentList(items: DocumentationReport["contentSurfaces"]): string {
  if (items.length === 0) return "<p class=\"muted\">content surface가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.surface)}</strong> [${escapeHtml(item.readiness)}]: ${item.count} file(s)<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(documentationHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function documentationSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">documentation signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(documentationHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function documentationCommandList(items: DocumentationReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function documentationRiskList(items: DocumentationReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(documentationHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function documentationHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function databaseSchemaList(items: DatabaseReadinessReport["schemaFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">schema.prisma 파일이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)} / ${escapeHtml(item.readiness)}]<br>datasource ${item.datasourceCount}, generator ${item.generatorCount}, model ${item.modelCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(databaseHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function databaseDatasourceList(items: DatabaseReadinessReport["datasourceSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">datasource signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.provider)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(databaseHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function databaseSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">database signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(databaseHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function databaseCommandList(items: DatabaseReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function databaseRiskList(items: DatabaseReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(databaseHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function databaseHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function ciCdWorkflowList(items: CiCdReport["workflowFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">workflow file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.workflowName ?? "unnamed")} · triggers ${item.triggerCount} · jobs ${item.jobCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(ciCdHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function ciCdSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">CI/CD signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(ciCdHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function ciCdCommandList(items: CiCdReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function ciCdRiskList(items: CiCdReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(ciCdHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function ciCdHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function unitTestFileList(items: UnitTestReport["testFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">test file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)} / ${escapeHtml(item.readiness)}]<br>tests ${item.testCount} · assertions ${item.assertionCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(unitTestHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function unitTestConfigList(items: UnitTestReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">unit test config signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(unitTestHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function unitTestSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">unit test signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(unitTestHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function unitTestCommandList(items: UnitTestReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function unitTestRiskList(items: UnitTestReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(unitTestHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function unitTestHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function coverageReadinessSetupList(items: CoverageReadinessReport["coverageSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">coverage setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>config/script/reporter/threshold ${item.configCount}/${item.scriptCount}/${item.reporterCount}/${item.thresholdCount}<br>include/exclude/upload/artifact/merge ${item.includeCount}/${item.excludeCount}/${item.uploadCount}/${item.artifactCount}/${item.mergeCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(coverageReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function coverageReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">coverage signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(coverageReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function coverageReadinessCommandList(items: CoverageReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function coverageReadinessRiskList(items: CoverageReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(coverageReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function coverageReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function mutationTestingSetupList(items: MutationTestingReadinessReport["mutationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">mutation testing setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)} / ${escapeHtml(item.readiness)}]<br>scope ${item.mutatePatternCount} · mutators ${item.mutatorCount} · runners ${item.runnerCount} · thresholds ${item.thresholdCount} · reporters ${item.reporterCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(mutationTestingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function mutationTestingSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">mutation testing signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(mutationTestingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function mutationTestingCommandList(items: MutationTestingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function mutationTestingRiskList(items: MutationTestingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(mutationTestingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function mutationTestingHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function typecheckTsconfigList(items: TypecheckReadinessReport["tsconfigFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">tsconfig file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>compiler options ${item.compilerOptionsCount} · references ${item.referencesCount} · include/files ${item.includeCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(typecheckHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function typecheckSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">typecheck signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(typecheckHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function typecheckCommandList(items: TypecheckReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function typecheckRiskList(items: TypecheckReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(typecheckHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function typecheckHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function packageManagerManifestList(items: PackageManagerReport["manifestFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">package manifest가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>packageManager ${escapeHtml(item.packageManager ?? "not declared")} · scripts ${item.scriptCount} · dependencies ${item.dependencyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(packageManagerHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function packageManagerLockfileList(items: PackageManagerReport["lockfileSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">lockfile evidence가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.ecosystem)}/${escapeHtml(item.readiness)}]<br>version ${escapeHtml(item.version ?? "unknown")} · importers ${item.importerCount} · packages ${item.packageCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(packageManagerHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function packageManagerSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">package-manager signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(packageManagerHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function packageManagerCommandList(items: PackageManagerReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function packageManagerRiskList(items: PackageManagerReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(packageManagerHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function packageManagerHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function gitHooksHookList(items: GitHooksReport["hookFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">Git hook file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.hookName)}/${escapeHtml(item.readiness)}]<br>commands ${item.commandCount} · bypass ${item.hasBypassHint ? "yes" : "no"} · node path ${item.hasNodePathHint ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(gitHooksHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function gitHooksToolConfigList(items: GitHooksReport["toolConfigFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">hook tool config가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(gitHooksHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function gitHooksSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">Git hook signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(gitHooksHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function gitHooksCommandList(items: GitHooksReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function gitHooksRiskList(items: GitHooksReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(gitHooksHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function gitHooksHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function taskRunnerConfigList(items: TaskRunnerReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">task-runner config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>tasks ${item.taskCount} · dependsOn ${item.dependsOnCount} · outputs ${item.outputsCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(taskRunnerHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function taskRunnerSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">task-runner signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(taskRunnerHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function taskRunnerCommandList(items: TaskRunnerReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function taskRunnerRiskList(items: TaskRunnerReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(taskRunnerHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function taskRunnerHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function dependencyUpdateConfigList(items: DependencyUpdateReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">dependency update config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)}/${escapeHtml(item.readiness)}]<br>extends ${item.extendsCount} · packageRules ${item.packageRuleCount} · schedules ${item.scheduleCount} · automerge ${escapeHtml(item.automergeSignal)}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dependencyUpdateHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dependencyUpdateSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">dependency update signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dependencyUpdateHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dependencyUpdateCommandList(items: DependencyUpdateReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function dependencyUpdateRiskList(items: DependencyUpdateReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(dependencyUpdateHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dependencyUpdateHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function lintReadinessConfigList(items: LintReadinessReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">lint config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)}/${escapeHtml(item.readiness)}]<br>flat ${item.flatConfig ? "yes" : "no"} · rules ${item.ruleCount} · plugins ${item.pluginCount} · ignores ${item.ignoreCount} · parser ${escapeHtml(item.parserSignal)}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(lintReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function lintReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">lint signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(lintReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function lintReadinessCommandList(items: LintReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function lintReadinessRiskList(items: LintReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(lintReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function lintReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function formatReadinessConfigList(items: FormatReadinessReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">format config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)}/${escapeHtml(item.readiness)}]<br>options ${item.optionCount} · overrides ${item.overrideCount} · plugins ${item.pluginCount} · parser ${escapeHtml(item.parserSignal)}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(formatReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function formatReadinessIgnoreList(items: FormatReadinessReport["ignoreFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">format ignore file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>patterns ${item.patternCount} · generated/build ${item.generatedSignal ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(formatReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function formatReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">format signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(formatReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function formatReadinessCommandList(items: FormatReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function formatReadinessRiskList(items: FormatReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(formatReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function formatReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function commitConventionConfigList(items: CommitConventionReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">commit convention config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)}/${escapeHtml(item.readiness)}]<br>extends ${item.extendsCount} · rules ${item.ruleCount} · parser ${escapeHtml(item.parserPreset)} · prompt ${item.promptSignal ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(commitConventionHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function commitConventionSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">commit convention signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(commitConventionHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function commitConventionCommandList(items: CommitConventionReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function commitConventionRiskList(items: CommitConventionReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(commitConventionHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function commitConventionHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function changelogReadinessConfigList(items: ChangelogReadinessReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">Changesets config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)}/${escapeHtml(item.readiness)}]<br>changelog ${escapeHtml(item.changelogMode)} · base ${escapeHtml(item.baseBranch ?? "missing")} · fixed/linked/ignored ${item.fixedCount}/${item.linkedCount}/${item.ignoredCount} · private ${escapeHtml(item.privatePackagePolicy)}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(changelogReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function changelogReadinessFileList(items: ChangelogReadinessReport["changesetFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">changeset markdown file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>packages ${item.packageCount} · bumps ${escapeHtml(item.bumpTypes.join(", ") || "none")} · summary lines ${item.summaryLines} · empty ${item.empty ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(changelogReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function changelogReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">changelog readiness signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(changelogReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function changelogReadinessCommandList(items: ChangelogReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function changelogReadinessRiskList(items: ChangelogReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(changelogReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function changelogReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function bundleAnalysisConfigList(items: BundleAnalysisReport["configFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">bundle analyzer config file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)}/${escapeHtml(item.readiness)}]<br>mode ${escapeHtml(item.analyzerMode)} · size ${escapeHtml(item.defaultSizeMode)} · stats/source-map/budget ${item.statsFileSignal ? "yes" : "no"}/${item.sourceMapSignal ? "yes" : "no"}/${item.budgetSignal ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(bundleAnalysisHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function bundleAnalysisArtifactList(items: BundleAnalysisReport["bundleArtifacts"]): string {
  if (items.length === 0) return "<p class=\"muted\">bundle artifact가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.artifactType)}/${escapeHtml(item.readiness)}]<br>${item.sizeBytes} bytes · chunk/module refs ${item.referencedChunks}<br>${escapeHtml(item.evidence)}${item.sourceHref ? `<br><a href="${escapeHtml(bundleAnalysisHref(item.sourceHref))}">원본 열기</a>` : ""}</li>`).join("")}</ul>`;
}

function bundleAnalysisSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">bundle-analysis signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(bundleAnalysisHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function bundleAnalysisCommandList(items: BundleAnalysisReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function bundleAnalysisRiskList(items: BundleAnalysisReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(bundleAnalysisHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function bundleAnalysisHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function mockingReadinessHandlerList(items: MockingReadinessReport["handlerFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">mock handler file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.environment)}/${escapeHtml(item.readiness)}]<br>handlers ${item.handlerCount} · HTTP/GraphQL/WebSocket ${item.usesHttp ? "yes" : "no"}/${item.usesGraphql ? "yes" : "no"}/${item.usesWebSocket ? "yes" : "no"} · responses ${item.responseSignals}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(mockingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function mockingReadinessSetupList(items: MockingReadinessReport["serverSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">mock setup surface가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.setupType)}/${escapeHtml(item.readiness)}]<br>start/lifecycle ${item.startSignal ? "yes" : "no"}/${item.lifecycleSignal ? "yes" : "no"} · unhandled ${escapeHtml(item.unhandledPolicy)}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(mockingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function mockingReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">mocking signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(mockingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function mockingReadinessCommandList(items: MockingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function mockingReadinessRiskList(items: MockingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(mockingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function mockingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function dataFetchingClientList(items: DataFetchingReadinessReport["clientSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">data-fetching client setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>client/provider/devtools ${item.hasClient ? "yes" : "no"}/${item.hasProvider ? "yes" : "no"}/${item.devtoolsSignal ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataFetchingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dataFetchingUsageList(items: DataFetchingReadinessReport["queryUsages"]): string {
  if (items.length === 0) return "<p class=\"muted\">query/mutation usage가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>queries/mutations/infinite ${item.queryCount}/${item.mutationCount}/${item.infiniteQueryCount} · keys/functions ${item.queryKeySignals}/${item.queryFnSignals}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataFetchingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dataFetchingSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">data-fetching signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dataFetchingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataFetchingCommandList(items: DataFetchingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function dataFetchingRiskList(items: DataFetchingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(dataFetchingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dataFetchingHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function routingSetupList(items: RoutingReadinessReport["routingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">routing setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.mode)}/${escapeHtml(item.readiness)}]<br>router/provider/config ${item.hasRouter ? "yes" : "no"}/${item.hasProvider ? "yes" : "no"}/${item.hasConfig ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(routingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function routingDefinitionList(items: RoutingReadinessReport["routeDefinitions"]): string {
  if (items.length === 0) return "<p class=\"muted\">route definition이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>routes/dynamic ${item.routeCount}/${item.dynamicSegmentCount} · nested/index/layout ${item.nestedSignal ? "yes" : "no"}/${item.indexSignal ? "yes" : "no"}/${item.layoutSignal ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(routingHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function routingSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">routing signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(routingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function routingCommandList(items: RoutingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function routingRiskList(items: RoutingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(routingHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function routingHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function stateManagementStoreList(items: StateManagementReadinessReport["storeSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">state-management store setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.storeType)}/${escapeHtml(item.readiness)}]<br>configureStore/provider/typed hooks ${item.hasConfigureStore ? "yes" : "no"}/${item.hasProvider ? "yes" : "no"}/${item.hasTypedHooks ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(stateManagementHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function stateManagementSliceList(items: StateManagementReadinessReport["sliceDefinitions"]): string {
  if (items.length === 0) return "<p class=\"muted\">slice definition이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>slices/reducers/actions/selectors ${item.sliceCount}/${item.reducerCount}/${item.actionCount}/${item.selectorCount} · Immer-style ${item.usesImmerStyle ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(stateManagementHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function stateManagementSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">state-management signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(stateManagementHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function stateManagementCommandList(items: StateManagementReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function stateManagementRiskList(items: StateManagementReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(stateManagementHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function stateManagementHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function formReadinessSetupList(items: FormReadinessReport["formSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">form setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.library)}/${escapeHtml(item.readiness)}]<br>useForm ${item.useFormCount} · submit/defaultValues/provider ${item.hasSubmitHandler ? "yes" : "no"}/${item.hasDefaultValues ? "yes" : "no"}/${item.hasFormProvider ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(formReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function formReadinessFieldList(items: FormReadinessReport["fieldRegistrations"]): string {
  if (items.length === 0) return "<p class=\"muted\">field registration이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>registered/controlled/field arrays/nested ${item.registeredFieldCount}/${item.controlledFieldCount}/${item.fieldArrayCount}/${item.nestedFieldSignals}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(formReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function formReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">form signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(formReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function formReadinessCommandList(items: FormReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function formReadinessRiskList(items: FormReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(formReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function formReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function authReadinessSetupList(items: AuthReadinessReport["authSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">auth setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>handlers ${item.handlerCount} · auth/route/middleware ${item.hasAuthFunction ? "yes" : "no"}/${item.hasRouteHandler ? "yes" : "no"}/${item.hasMiddleware ? "yes" : "no"}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(authReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function authReadinessSessionList(items: AuthReadinessReport["sessionSurfaces"]): string {
  if (items.length === 0) return "<p class=\"muted\">session surface가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.readiness)}]<br>client/server/provider/sign-in-out ${item.clientSessionCount}/${item.serverSessionCount}/${item.providerBoundaryCount}/${item.signInOutCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(authReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function authReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">auth signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(authReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function authReadinessCommandList(items: AuthReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function authReadinessRiskList(items: AuthReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(authReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function authReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function authorizationReadinessSetupList(items: AuthorizationReadinessReport["authorizationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">authorization setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>model/relation/role/permission ${item.modelCount}/${item.relationCount}/${item.roleCount}/${item.permissionCount}<br>resource/action/guard/middleware ${item.resourceCount}/${item.actionCount}/${item.guardCount}/${item.middlewareCount}<br>ownership/test ${item.ownershipCount}/${item.testCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(authorizationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function authorizationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">authorization signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(authorizationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function authorizationReadinessCommandList(items: AuthorizationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function authorizationReadinessRiskList(items: AuthorizationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(authorizationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function authorizationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function paymentReadinessSetupList(items: PaymentReadinessReport["paymentSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">payment setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>server/checkout/intent/webhook ${item.serverClientCount}/${item.checkoutSessionCount}/${item.paymentIntentCount}/${item.webhookHandlerCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(paymentReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function paymentReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">payment signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(paymentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function paymentReadinessCommandList(items: PaymentReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function paymentReadinessRiskList(items: PaymentReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(paymentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function paymentReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function emailReadinessSetupList(items: EmailReadinessReport["emailSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">email setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>client/send/template/domain/webhook ${item.clientSetupCount}/${item.sendCallCount}/${item.templateSignalCount}/${item.domainSignalCount}/${item.webhookSignalCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(emailReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function emailReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">email signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(emailReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function emailReadinessCommandList(items: EmailReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function emailReadinessRiskList(items: EmailReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(emailReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function emailReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function queueReadinessSetupList(items: QueueReadinessReport["queueSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">queue setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>queue/worker/scheduler/events/flows ${item.queueCount}/${item.workerCount}/${item.schedulerCount}/${item.eventCount}/${item.flowCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(queueReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function queueReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">queue signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(queueReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function queueReadinessCommandList(items: QueueReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function queueReadinessRiskList(items: QueueReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(queueReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function queueReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function cacheReadinessSetupList(items: CacheReadinessReport["cacheSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">cache setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>client/connect/read/write/TTL ${item.clientSetupCount}/${item.connectCount}/${item.readCount}/${item.writeCount}/${item.ttlCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(cacheReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function cacheReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">cache signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(cacheReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function cacheReadinessCommandList(items: CacheReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function cacheReadinessRiskList(items: CacheReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(cacheReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function cacheReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function loggingReadinessSetupList(items: LoggingReadinessReport["loggingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">logging setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>logger/level/calls/child/transport ${item.loggerSetupCount}/${item.levelCount}/${item.callCount}/${item.childLoggerCount}/${item.transportCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(loggingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function loggingReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">logging signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(loggingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function loggingReadinessCommandList(items: LoggingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function loggingReadinessRiskList(items: LoggingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(loggingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function loggingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function featureFlagReadinessSetupList(items: FeatureFlagReadinessReport["featureFlagSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">feature flag setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>provider/client/evaluation/context/hooks ${item.providerSetupCount}/${item.clientCount}/${item.evaluationCount}/${item.contextCount}/${item.hookCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(featureFlagReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function featureFlagReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">feature flag signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(featureFlagReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function featureFlagReadinessCommandList(items: FeatureFlagReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function featureFlagReadinessRiskList(items: FeatureFlagReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(featureFlagReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function featureFlagReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function rateLimitReadinessSetupList(items: RateLimitReadinessReport["rateLimitSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">rate limit setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>limiter/window/store/consume/headers ${item.limiterSetupCount}/${item.windowCount}/${item.storeCount}/${item.consumeCount}/${item.headerCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(rateLimitReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function rateLimitReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">rate limit signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(rateLimitReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function rateLimitReadinessCommandList(items: RateLimitReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function rateLimitReadinessRiskList(items: RateLimitReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(rateLimitReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function rateLimitReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function errorTrackingReadinessSetupList(items: ErrorTrackingReadinessReport["errorTrackingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">error tracking setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>init/DSN/capture/scope/integrations ${item.initCount}/${item.dsnCount}/${item.captureCount}/${item.scopeCount}/${item.integrationCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(errorTrackingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function errorTrackingReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">error tracking signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(errorTrackingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function errorTrackingReadinessCommandList(items: ErrorTrackingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function errorTrackingReadinessRiskList(items: ErrorTrackingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(errorTrackingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function errorTrackingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function analyticsReadinessSetupList(items: AnalyticsReadinessReport["analyticsSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">analytics setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>init/capture/identity/pageview/privacy ${item.initCount}/${item.captureCount}/${item.identityCount}/${item.pageviewCount}/${item.privacyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(analyticsReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function analyticsReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">analytics signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(analyticsReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function analyticsReadinessCommandList(items: AnalyticsReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function analyticsReadinessRiskList(items: AnalyticsReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(analyticsReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function analyticsReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function httpClientReadinessSetupList(items: HttpClientReadinessReport["httpClientSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">HTTP client setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>requests/timeouts/retries/hooks/errors ${item.requestCount}/${item.timeoutCount}/${item.retryCount}/${item.hookCount}/${item.errorCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(httpClientReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function httpClientReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">HTTP client signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(httpClientReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function httpClientReadinessCommandList(items: HttpClientReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function httpClientReadinessRiskList(items: HttpClientReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(httpClientReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function httpClientReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function schemaValidationReadinessSetupList(items: SchemaValidationReadinessReport["schemaSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">schema validation setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>schemas/parse/safeParse/refinements/transforms/errors ${item.schemaCount}/${item.parseCount}/${item.safeParseCount}/${item.refinementCount}/${item.transformCount}/${item.errorCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(schemaValidationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function schemaValidationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">schema validation signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(schemaValidationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function schemaValidationReadinessCommandList(items: SchemaValidationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function schemaValidationReadinessRiskList(items: SchemaValidationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(schemaValidationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function schemaValidationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function dateTimeReadinessSetupList(items: DateTimeReadinessReport["dateTimeSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">datetime setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>datetime/parse/format/zone/math/validity ${item.dateTimeCount}/${item.parseCount}/${item.formatCount}/${item.zoneCount}/${item.mathCount}/${item.validityCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dateTimeReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function dateTimeReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">datetime signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(dateTimeReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dateTimeReadinessCommandList(items: DateTimeReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function dateTimeReadinessRiskList(items: DateTimeReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(dateTimeReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function dateTimeReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function idGenerationReadinessSetupList(items: IdGenerationReadinessReport["idGeneratorSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">ID generator setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>generator/secure-random/custom-alphabet/custom-random/validation/usage-risk ${item.generatorCount}/${item.secureRandomCount}/${item.customAlphabetCount}/${item.customRandomCount}/${item.validationCount}/${item.usageRiskCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(idGenerationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function idGenerationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">ID generation signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(idGenerationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function idGenerationReadinessCommandList(items: IdGenerationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function idGenerationReadinessRiskList(items: IdGenerationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(idGenerationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function idGenerationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function imageProcessingReadinessSetupList(items: ImageProcessingReadinessReport["imageProcessingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">image processing setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>pipeline/resize/format/metadata/output/safety ${item.pipelineCount}/${item.resizeCount}/${item.formatCount}/${item.metadataCount}/${item.outputCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(imageProcessingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function imageProcessingReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">image processing signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(imageProcessingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function imageProcessingReadinessCommandList(items: ImageProcessingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function imageProcessingReadinessRiskList(items: ImageProcessingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(imageProcessingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function imageProcessingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function fileUploadReadinessSetupList(items: FileUploadReadinessReport["fileUploadSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">file upload setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>uploader/restriction/transport/metadata/lifecycle/safety ${item.uploaderCount}/${item.restrictionCount}/${item.transportCount}/${item.metadataCount}/${item.lifecycleCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(fileUploadReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function fileUploadReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">file upload signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(fileUploadReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function fileUploadReadinessCommandList(items: FileUploadReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function fileUploadReadinessRiskList(items: FileUploadReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(fileUploadReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function fileUploadReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function webSocketReadinessSetupList(items: WebSocketReadinessReport["webSocketSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">websocket setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>server/client/upgrade/message/heartbeat/safety ${item.serverCount}/${item.clientCount}/${item.upgradeCount}/${item.messageCount}/${item.heartbeatCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(webSocketReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function webSocketReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">websocket signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(webSocketReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function webSocketReadinessCommandList(items: WebSocketReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function webSocketReadinessRiskList(items: WebSocketReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(webSocketReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function webSocketReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function pdfGenerationReadinessSetupList(items: PdfGenerationReadinessReport["pdfGenerationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">pdf generation setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>document/page/asset/form/output/safety ${item.documentCount}/${item.pageCount}/${item.assetCount}/${item.formCount}/${item.outputCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(pdfGenerationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function pdfGenerationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">pdf generation signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(pdfGenerationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function pdfGenerationReadinessCommandList(items: PdfGenerationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function pdfGenerationReadinessRiskList(items: PdfGenerationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(pdfGenerationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function pdfGenerationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function spreadsheetReadinessSetupList(items: SpreadsheetReadinessReport["spreadsheetSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">spreadsheet setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>workbook/sheet/input/transform/output/safety ${item.workbookCount}/${item.sheetCount}/${item.inputCount}/${item.transformCount}/${item.outputCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(spreadsheetReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function spreadsheetReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">spreadsheet signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(spreadsheetReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function spreadsheetReadinessCommandList(items: SpreadsheetReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function spreadsheetReadinessRiskList(items: SpreadsheetReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(spreadsheetReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function spreadsheetReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function chartVisualizationReadinessSetupList(items: ChartVisualizationReadinessReport["chartSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">chart setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>config/data/scale/interaction/render/lifecycle/safety ${item.configCount}/${item.dataCount}/${item.scaleCount}/${item.interactionCount}/${item.renderCount}/${item.lifecycleCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(chartVisualizationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function chartVisualizationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">chart signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(chartVisualizationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function chartVisualizationReadinessCommandList(items: ChartVisualizationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function chartVisualizationReadinessRiskList(items: ChartVisualizationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(chartVisualizationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function chartVisualizationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function diagramRenderingReadinessSetupList(items: DiagramRenderingReadinessReport["diagramSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">diagram setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>syntax/render/theme/output/interaction/safety ${item.syntaxCount}/${item.renderCount}/${item.themeCount}/${item.outputCount}/${item.interactionCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(diagramRenderingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function diagramRenderingReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">diagram signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(diagramRenderingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function diagramRenderingReadinessCommandList(items: DiagramRenderingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function diagramRenderingReadinessRiskList(items: DiagramRenderingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(diagramRenderingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function diagramRenderingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function linkIntegrityReadinessSetupList(items: LinkIntegrityReadinessReport["linkSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">link setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>target/extraction/policy/network/output/CI ${item.targetCount}/${item.extractionCount}/${item.policyCount}/${item.networkCount}/${item.outputCount}/${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(linkIntegrityReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function linkIntegrityReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">link integrity signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(linkIntegrityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function linkIntegrityReadinessCommandList(items: LinkIntegrityReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function linkIntegrityReadinessRiskList(items: LinkIntegrityReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(linkIntegrityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function linkIntegrityReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function seoMetadataReadinessSetupList(items: SeoMetadataReadinessReport["seoSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">SEO setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>crawl/sitemap/metadata/structured/social/AI ${item.crawlCount}/${item.sitemapCount}/${item.metadataCount}/${item.structuredDataCount}/${item.socialCount}/${item.aiCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(seoMetadataReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function seoMetadataReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">SEO metadata signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(seoMetadataReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function seoMetadataReadinessCommandList(items: SeoMetadataReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function seoMetadataReadinessRiskList(items: SeoMetadataReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(seoMetadataReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function seoMetadataReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function pwaReadinessSetupList(items: PwaReadinessReport["pwaSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">PWA setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>manifest/service worker/caching/update/install/runtime ${item.manifestCount}/${item.serviceWorkerCount}/${item.cachingCount}/${item.updateCount}/${item.installCount}/${item.runtimeCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(pwaReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function pwaReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">PWA signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(pwaReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function pwaReadinessCommandList(items: PwaReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function pwaReadinessRiskList(items: PwaReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(pwaReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function pwaReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function browserCompatibilityReadinessSetupList(items: BrowserCompatibilityReadinessReport["compatibilitySetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">browser compatibility setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>config/query/coverage/env/update/feature ${item.configCount}/${item.queryCount}/${item.coverageCount}/${item.envCount}/${item.updateCount}/${item.featureCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(browserCompatibilityReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function browserCompatibilityReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">browser compatibility signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(browserCompatibilityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function browserCompatibilityReadinessCommandList(items: BrowserCompatibilityReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function browserCompatibilityReadinessRiskList(items: BrowserCompatibilityReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(browserCompatibilityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function browserCompatibilityReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function browserExtensionReadinessSetupList(items: BrowserExtensionReadinessReport["extensionSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">browser extension setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>manifest/entrypoint/permission/host/messaging/storage/UI/build/publish ${item.manifestCount}/${item.entrypointCount}/${item.permissionCount}/${item.hostPermissionCount}/${item.messagingCount}/${item.storageCount}/${item.uiSurfaceCount}/${item.buildCount}/${item.publishCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(browserExtensionReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function browserExtensionReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">browser extension signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(browserExtensionReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function browserExtensionReadinessCommandList(items: BrowserExtensionReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function browserExtensionReadinessRiskList(items: BrowserExtensionReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(browserExtensionReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function browserExtensionReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function envValidationReadinessSetupList(items: EnvValidationReadinessReport["envSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">env validation setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>schema/server/client/runtime/prefix/hook/transform ${item.schemaCount}/${item.serverCount}/${item.clientCount}/${item.runtimeEnvCount}/${item.prefixCount}/${item.validationHookCount}/${item.transformCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(envValidationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function envValidationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">env validation signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(envValidationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function envValidationReadinessCommandList(items: EnvValidationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function envValidationReadinessRiskList(items: EnvValidationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(envValidationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function envValidationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function securityHeadersReadinessSetupList(items: SecurityHeadersReadinessReport["headerSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">security headers setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>CSP/HSTS/cross-origin/frame/referrer/hardening/disable ${item.cspCount}/${item.hstsCount}/${item.crossOriginCount}/${item.frameCount}/${item.referrerCount}/${item.hardeningCount}/${item.disableCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(securityHeadersReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function securityHeadersReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">security headers signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(securityHeadersReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityHeadersReadinessCommandList(items: SecurityHeadersReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function securityHeadersReadinessRiskList(items: SecurityHeadersReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(securityHeadersReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityHeadersReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function graphqlReadinessSetupList(items: GraphqlReadinessReport["graphqlSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">GraphQL setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>schema/operation/resolver/validation/execution/client/codegen ${item.schemaCount}/${item.operationCount}/${item.resolverCount}/${item.validationCount}/${item.executionCount}/${item.clientCount}/${item.codegenCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(graphqlReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function graphqlReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">GraphQL signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(graphqlReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function graphqlReadinessCommandList(items: GraphqlReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function graphqlReadinessRiskList(items: GraphqlReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(graphqlReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function graphqlReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function cliReadinessSetupList(items: CliReadinessReport["cliSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">CLI setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>command/option/argument/action/parse/help/error/output ${item.commandCount}/${item.optionCount}/${item.argumentCount}/${item.actionCount}/${item.parseCount}/${item.helpCount}/${item.errorCount}/${item.outputCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(cliReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function cliReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">CLI signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(cliReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function cliReadinessCommandList(items: CliReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function cliReadinessRiskList(items: CliReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(cliReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function cliReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function llmReadinessSetupList(items: LlmReadinessReport["llmSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">LLM setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>model/prompt/tool/agent/retrieval/embedding/output/streaming/observability ${item.modelCount}/${item.promptCount}/${item.toolCount}/${item.agentCount}/${item.retrievalCount}/${item.embeddingCount}/${item.outputCount}/${item.streamingCount}/${item.observabilityCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(llmReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function llmReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">LLM signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(llmReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function llmReadinessCommandList(items: LlmReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function llmReadinessRiskList(items: LlmReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(llmReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function llmReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function llmEvalReadinessSetupList(items: LlmEvalReadinessReport["evalSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">LLM eval setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>prompt/provider/test/assertion/dataset/judge/redteam/output ${item.promptCount}/${item.providerCount}/${item.testCaseCount}/${item.assertionCount}/${item.datasetCount}/${item.judgeCount}/${item.redteamCount}/${item.outputCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(llmEvalReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function llmEvalReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">LLM eval signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(llmEvalReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function llmEvalReadinessCommandList(items: LlmEvalReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function llmEvalReadinessRiskList(items: LlmEvalReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(llmEvalReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function llmEvalReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function llmObservabilityReadinessSetupList(items: LlmObservabilityReadinessReport["observabilitySetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">LLM observability setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)}/${escapeHtml(item.readiness)}]<br>trace/span/generation/session/user/metadata/score/token/cost/prompt/feedback ${item.traceCount}/${item.spanCount}/${item.generationCount}/${item.sessionCount}/${item.userCount}/${item.metadataCount}/${item.scoreCount}/${item.tokenCount}/${item.costCount}/${item.promptCount}/${item.feedbackCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(llmObservabilityReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function llmObservabilityReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">LLM observability signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(llmObservabilityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function llmObservabilityReadinessCommandList(items: LlmObservabilityReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function llmObservabilityReadinessRiskList(items: LlmObservabilityReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(llmObservabilityReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function llmObservabilityReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function vectorDbReadinessSetupList(items: VectorDbReadinessReport["vectorSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">vector DB setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)}/${escapeHtml(item.readiness)}]<br>collection/vector-config/embedding/upsert/query/filter/hybrid/rerank/tenant/replication/snapshot ${item.collectionCount}/${item.vectorConfigCount}/${item.embeddingCount}/${item.upsertCount}/${item.queryCount}/${item.filterCount}/${item.hybridCount}/${item.rerankCount}/${item.tenantCount}/${item.replicationCount}/${item.snapshotCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vectorDbReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function vectorDbReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">vector DB signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vectorDbReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vectorDbReadinessCommandList(items: VectorDbReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function vectorDbReadinessRiskList(items: VectorDbReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(vectorDbReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vectorDbReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function searchServiceReadinessSetupList(items: SearchServiceReadinessReport["searchSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">search service setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)}/${escapeHtml(item.readiness)}]<br>index/schema/document/query/filter/facet/ranking/typo/synonym/geo/ops ${item.indexCount}/${item.schemaCount}/${item.documentCount}/${item.queryCount}/${item.filterCount}/${item.facetCount}/${item.rankingCount}/${item.typoCount}/${item.synonymCount}/${item.geoCount}/${item.opsCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(searchServiceReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function searchServiceReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">search service signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(searchServiceReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function searchServiceReadinessCommandList(items: SearchServiceReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function searchServiceReadinessRiskList(items: SearchServiceReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(searchServiceReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function searchServiceReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function objectStorageReadinessSetupList(items: ObjectStorageReadinessReport["storageSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">object storage setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)}/${escapeHtml(item.readiness)}]<br>bucket/client/upload/download/list/delete/presign/metadata/policy/lifecycle/replication/encryption/ops ${item.bucketCount}/${item.clientCount}/${item.uploadCount}/${item.downloadCount}/${item.listCount}/${item.deleteCount}/${item.presignCount}/${item.metadataCount}/${item.policyCount}/${item.lifecycleCount}/${item.replicationCount}/${item.encryptionCount}/${item.opsCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(objectStorageReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function objectStorageReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">object storage signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(objectStorageReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function objectStorageReadinessCommandList(items: ObjectStorageReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function objectStorageReadinessRiskList(items: ObjectStorageReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(objectStorageReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function objectStorageReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function realtimeCollaborationReadinessSetupList(items: RealtimeCollaborationReadinessReport["collaborationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">realtime collaboration setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)}/${escapeHtml(item.readiness)}]<br>doc/shared/provider/presence/sync/persistence/conflict/history/auth/comments ${item.docCount}/${item.sharedTypeCount}/${item.providerCount}/${item.presenceCount}/${item.syncCount}/${item.persistenceCount}/${item.conflictCount}/${item.historyCount}/${item.authCount}/${item.commentsCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(realtimeCollaborationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function realtimeCollaborationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">realtime collaboration signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(realtimeCollaborationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function realtimeCollaborationReadinessCommandList(items: RealtimeCollaborationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function realtimeCollaborationReadinessRiskList(items: RealtimeCollaborationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(realtimeCollaborationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function realtimeCollaborationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function workflowOrchestrationReadinessSetupList(items: WorkflowOrchestrationReadinessReport["workflowSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">workflow orchestration setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)}/${escapeHtml(item.readiness)}]<br>workflow/event/schedule/step/activity/queue/retry/timeout/wait/cancel/concurrency/state/observability ${item.workflowCount}/${item.eventCount}/${item.scheduleCount}/${item.stepCount}/${item.activityCount}/${item.queueCount}/${item.retryCount}/${item.timeoutCount}/${item.waitCount}/${item.cancelCount}/${item.concurrencyCount}/${item.stateCount}/${item.observabilityCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(workflowOrchestrationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function workflowOrchestrationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">workflow orchestration signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(workflowOrchestrationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function workflowOrchestrationReadinessCommandList(items: WorkflowOrchestrationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function workflowOrchestrationReadinessRiskList(items: WorkflowOrchestrationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(workflowOrchestrationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function workflowOrchestrationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function openApiClientReadinessSetupList(items: OpenApiClientReadinessReport["clientSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">OpenAPI client setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.generator)}/${escapeHtml(item.readiness)}]<br>spec/output/client/type/hook/mock/validation/config/script/package ${item.specCount}/${item.outputCount}/${item.clientCount}/${item.typeCount}/${item.hookCount}/${item.mockCount}/${item.validationCount}/${item.configCount}/${item.scriptCount}/${item.packageCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(openApiClientReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function openApiClientReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">OpenAPI client signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(openApiClientReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function openApiClientReadinessCommandList(items: OpenApiClientReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function openApiClientReadinessRiskList(items: OpenApiClientReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(openApiClientReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function openApiClientReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function webhookReadinessSetupList(items: WebhookReadinessReport["webhookSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">webhook setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>endpoint/signature/replay/idempotency/retry/delivery/event/local-debug/observability/security ${item.endpointCount}/${item.signatureCount}/${item.replayCount}/${item.idempotencyCount}/${item.retryCount}/${item.deliveryCount}/${item.eventTypeCount}/${item.localDebugCount}/${item.observabilityCount}/${item.securityCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(webhookReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function webhookReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">webhook signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(webhookReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function webhookReadinessCommandList(items: WebhookReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function webhookReadinessRiskList(items: WebhookReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(webhookReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function webhookReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function notificationReadinessSetupList(items: NotificationReadinessReport["notificationSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">notification setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>workflow/trigger/subscriber/topic/preference/channel/inbox/template/credential/observability ${item.workflowCount}/${item.triggerCount}/${item.subscriberCount}/${item.topicCount}/${item.preferenceCount}/${item.channelCount}/${item.inboxCount}/${item.templateCount}/${item.credentialCount}/${item.observabilityCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(notificationReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function notificationReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">notification signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(notificationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function notificationReadinessCommandList(items: NotificationReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function notificationReadinessRiskList(items: NotificationReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(notificationReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function notificationReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function consentReadinessSetupList(items: ConsentReadinessReport["consentSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">consent setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.provider)}/${escapeHtml(item.readiness)}]<br>banner/modal/category/service/purpose/vendor/script/storage/localization/API ${item.bannerCount}/${item.modalCount}/${item.categoryCount}/${item.serviceCount}/${item.purposeCount}/${item.vendorCount}/${item.scriptBlockingCount}/${item.storageCount}/${item.localizationCount}/${item.apiCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(consentReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function consentReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">consent signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(consentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function consentReadinessCommandList(items: ConsentReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function consentReadinessRiskList(items: ConsentReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(consentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function consentReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function privacyReadinessSetupList(items: PrivacyReadinessReport["privacySetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">privacy setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>detector/anonymizer/policy/retention/consent/DSAR/DP/CI ${item.detectorCount}/${item.anonymizerCount}/${item.policyCount}/${item.retentionCount}/${item.consentCount}/${item.dsarCount}/${item.differentialPrivacyCount}/${item.ciCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(privacyReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function privacyReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">privacy signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(privacyReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function privacyReadinessCommandList(items: PrivacyReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function privacyReadinessRiskList(items: PrivacyReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(privacyReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function privacyReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function serverFrameworkReadinessSetupList(items: ServerFrameworkReadinessReport["serverSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">server framework setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>route/schema/plugin/hook/decorator/error/runtime/test ${item.routeCount}/${item.schemaCount}/${item.pluginCount}/${item.hookCount}/${item.decoratorCount}/${item.errorCount}/${item.listenCount}/${item.testCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(serverFrameworkReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function serverFrameworkReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">server framework signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(serverFrameworkReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function serverFrameworkReadinessCommandList(items: ServerFrameworkReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function serverFrameworkReadinessRiskList(items: ServerFrameworkReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(serverFrameworkReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function serverFrameworkReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function rpcReadinessSetupList(items: RpcReadinessReport["rpcSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">RPC setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>router/procedure/query/mutation/subscription/validation/middleware/client/adapter/error ${item.routerCount}/${item.procedureCount}/${item.queryCount}/${item.mutationCount}/${item.subscriptionCount}/${item.validationCount}/${item.middlewareCount}/${item.clientCount}/${item.adapterCount}/${item.errorCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(rpcReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function rpcReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">RPC signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(rpcReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function rpcReadinessCommandList(items: RpcReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function rpcReadinessRiskList(items: RpcReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(rpcReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function rpcReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function workspaceGraphReadinessFileList(items: WorkspaceGraphReadinessReport["workspaceFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">workspace graph file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.configType)}/${escapeHtml(item.readiness)}]<br>projects/targets/tags/implicit deps/named inputs/plugins ${item.projectCount}/${item.targetCount}/${item.tagCount}/${item.implicitDependencyCount}/${item.namedInputCount}/${item.pluginCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(workspaceGraphReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function workspaceGraphReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">workspace graph signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(workspaceGraphReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function workspaceGraphReadinessCommandList(items: WorkspaceGraphReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function workspaceGraphReadinessRiskList(items: WorkspaceGraphReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(workspaceGraphReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function workspaceGraphReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function scaffoldingReadinessFileList(items: ScaffoldingReadinessReport["generatorFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">scaffolding generator file이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.generatorType)}/${escapeHtml(item.readiness)}]<br>generators/prompts/actions/templates/helpers/partials/safety ${item.generatorCount}/${item.promptCount}/${item.actionCount}/${item.templateCount}/${item.helperCount}/${item.partialCount}/${item.safetyCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(scaffoldingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function scaffoldingReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">scaffolding signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(scaffoldingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scaffoldingReadinessCommandList(items: ScaffoldingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function scaffoldingReadinessRiskList(items: ScaffoldingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(scaffoldingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scaffoldingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function schedulerReadinessSetupList(items: SchedulerReadinessReport["schedulerSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">scheduler setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>schedules/cron/tasks/timezones/lifecycle/overlap/retry/error ${item.scheduleCount}/${item.cronExpressionCount}/${item.taskCount}/${item.timezoneCount}/${item.lifecycleCount}/${item.overlapControlCount}/${item.retryCount}/${item.errorCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(schedulerReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function schedulerReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">scheduler signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(schedulerReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function schedulerReadinessCommandList(items: SchedulerReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function schedulerReadinessRiskList(items: SchedulerReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(schedulerReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function schedulerReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function buildToolReadinessSetupList(items: BuildToolReadinessReport["buildToolSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">build tool setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>config/plugins/dev/build/preview/env/SSR/deps ${item.configCount}/${item.pluginCount}/${item.devServerCount}/${item.buildCount}/${item.previewCount}/${item.envCount}/${item.ssrCount}/${item.depOptimizationCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(buildToolReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function buildToolReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">build tool signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(buildToolReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function buildToolReadinessCommandList(items: BuildToolReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function buildToolReadinessRiskList(items: BuildToolReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(buildToolReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function buildToolReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function stylingReadinessSetupList(items: StylingReadinessReport["stylingSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">styling setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>config/directives/utilities/theme/variants/content/plugins/build ${item.configCount}/${item.directiveCount}/${item.utilityCount}/${item.themeCount}/${item.variantCount}/${item.contentScanCount}/${item.pluginCount}/${item.buildIntegrationCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(stylingReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function stylingReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">styling signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(stylingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function stylingReadinessCommandList(items: StylingReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function stylingReadinessRiskList(items: StylingReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(stylingReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function stylingReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function visualRegressionReadinessSetupList(items: VisualRegressionReadinessReport["visualRegressionSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">visual regression setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>config/actual/expected/diff/threshold/report/plugin/storage/notification ${item.configCount}/${item.actualCount}/${item.expectedCount}/${item.diffCount}/${item.thresholdCount}/${item.reportCount}/${item.pluginCount}/${item.storageCount}/${item.notificationCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(visualRegressionReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function visualRegressionReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">visual regression signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(visualRegressionReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function visualRegressionReadinessCommandList(items: VisualRegressionReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function visualRegressionReadinessRiskList(items: VisualRegressionReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(visualRegressionReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function visualRegressionReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function infrastructureReadinessSetupList(items: InfrastructureReadinessReport["infrastructureSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">infrastructure setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>terraform/provider/resource/data/module/variable/output/backend/workflow ${item.terraformBlockCount}/${item.providerCount}/${item.resourceCount}/${item.dataSourceCount}/${item.moduleCount}/${item.variableCount}/${item.outputCount}/${item.backendCount}/${item.workflowCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(infrastructureReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function infrastructureReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">infrastructure signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(infrastructureReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function infrastructureReadinessCommandList(items: InfrastructureReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function infrastructureReadinessRiskList(items: InfrastructureReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(infrastructureReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function infrastructureReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function deploymentReadinessSetupList(items: DeploymentReadinessReport["deploymentSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">deployment setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>chart/values/template/manifest/dependency/hook/release ${item.chartMetadataCount}/${item.valuesCount}/${item.templateCount}/${item.manifestCount}/${item.dependencyCount}/${item.hookCount}/${item.releaseWorkflowCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(deploymentReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function deploymentReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">deployment signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(deploymentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function deploymentReadinessCommandList(items: DeploymentReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function deploymentReadinessRiskList(items: DeploymentReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(deploymentReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function deploymentReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function serverlessReadinessSetupList(items: ServerlessReadinessReport["serverlessSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">serverless setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>service/provider/function/event/env/IAM/resource/package/plugin/command ${item.serviceCount}/${item.providerCount}/${item.functionCount}/${item.eventCount}/${item.environmentCount}/${item.iamCount}/${item.resourceCount}/${item.packageCount}/${item.pluginCount}/${item.commandCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(serverlessReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function serverlessReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">serverless signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(serverlessReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function serverlessReadinessCommandList(items: ServerlessReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function serverlessReadinessRiskList(items: ServerlessReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(serverlessReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function serverlessReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function mobileReadinessSetupList(items: MobileReadinessReport["mobileSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">mobile setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>config/platform/navigation/build/update/assets/permissions/commands/packages ${item.appConfigCount}/${item.platformCount}/${item.navigationCount}/${item.buildProfileCount}/${item.updateCount}/${item.assetCount}/${item.permissionCount}/${item.commandCount}/${item.packageCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(mobileReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function mobileReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">mobile signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(mobileReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function mobileReadinessCommandList(items: MobileReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function mobileReadinessRiskList(items: MobileReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(mobileReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function mobileReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function desktopReadinessSetupList(items: DesktopReadinessReport["desktopSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">desktop setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.framework)}/${escapeHtml(item.readiness)}]<br>config/window/commands/permissions/bundle/updater/signing/platform/packages ${item.configCount}/${item.windowCount}/${item.commandCount}/${item.permissionCount}/${item.bundleCount}/${item.updaterCount}/${item.signingCount}/${item.platformCount}/${item.packageCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(desktopReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function desktopReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">desktop signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(desktopReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function desktopReadinessCommandList(items: DesktopReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function desktopReadinessRiskList(items: DesktopReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(desktopReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function desktopReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function edgeReadinessSetupList(items: EdgeReadinessReport["edgeSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">edge setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.platform)}/${escapeHtml(item.readiness)}]<br>config/handler/binding/routing/dev/deploy/observability/packages ${item.configCount}/${item.handlerCount}/${item.bindingCount}/${item.routingCount}/${item.devWorkflowCount}/${item.deploymentWorkflowCount}/${item.observabilityCount}/${item.packageCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(edgeReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function edgeReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">edge signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(edgeReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function edgeReadinessCommandList(items: EdgeReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function edgeReadinessRiskList(items: EdgeReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(edgeReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function edgeReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function composeReadinessSetupList(items: ComposeReadinessReport["composeSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">compose setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.format)}/${escapeHtml(item.readiness)}]<br>services/build/image/ports/volumes/networks/dependencies/health/env/secrets/profiles/commands ${item.serviceCount}/${item.buildCount}/${item.imageCount}/${item.portCount}/${item.volumeCount}/${item.networkCount}/${item.dependencyCount}/${item.healthcheckCount}/${item.envCount}/${item.secretConfigCount}/${item.profileCount}/${item.commandCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(composeReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function composeReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">compose signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(composeReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function composeReadinessCommandList(items: ComposeReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function composeReadinessRiskList(items: ComposeReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(composeReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function composeReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function devContainerReadinessSetupList(items: DevContainerReadinessReport["devContainerSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">devcontainer setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.format)}/${escapeHtml(item.readiness)}]<br>config/image-build/features/lifecycle/env/mounts/ports/users/customizations/workflows/lockfiles ${item.configCount}/${item.imageBuildCount}/${item.featureCount}/${item.lifecycleCount}/${item.environmentCount}/${item.mountCount}/${item.portCount}/${item.userCount}/${item.customizationCount}/${item.workflowCount}/${item.lockfileCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(devContainerReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function devContainerReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">devcontainer signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(devContainerReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function devContainerReadinessCommandList(items: DevContainerReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function devContainerReadinessRiskList(items: DevContainerReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(devContainerReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function devContainerReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function kubernetesReadinessSetupList(items: KubernetesReadinessReport["kubernetesSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">kubernetes setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.format)}/${escapeHtml(item.readiness)}]<br>manifest/workload/service/config/storage/security/policy/probes/resources/autoscaling/observability/workflows ${item.manifestCount}/${item.workloadCount}/${item.serviceCount}/${item.configCount}/${item.storageCount}/${item.securityCount}/${item.policyCount}/${item.probeCount}/${item.resourceCount}/${item.autoscalingCount}/${item.observabilityCount}/${item.workflowCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(kubernetesReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function kubernetesReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">kubernetes signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(kubernetesReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function kubernetesReadinessCommandList(items: KubernetesReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function kubernetesReadinessRiskList(items: KubernetesReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(kubernetesReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function kubernetesReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function gitopsReadinessSetupList(items: GitOpsReadinessReport["gitopsSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">gitops setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.controller)}/${escapeHtml(item.readiness)}]<br>application/source/destination/sync/generator/flux-source/flux-reconcile/image/notification/workflow ${item.applicationCount}/${item.sourceCount}/${item.destinationCount}/${item.syncPolicyCount}/${item.generatorCount}/${item.fluxSourceCount}/${item.fluxReconcileCount}/${item.imageAutomationCount}/${item.notificationCount}/${item.workflowCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(gitopsReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function gitopsReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">gitops signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(gitopsReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function gitopsReadinessCommandList(items: GitOpsReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function gitopsReadinessRiskList(items: GitOpsReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(gitopsReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function gitopsReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function backupReadinessSetupList(items: BackupReadinessReport["backupSetups"]): string {
  if (items.length === 0) return "<p class=\"muted\">backup setup이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.tool)}/${escapeHtml(item.readiness)}]<br>backup/restore/schedule/storage/retention/verification ${item.backupCount}/${item.restoreCount}/${item.scheduleCount}/${item.storageCount}/${item.retentionCount}/${item.verificationCount}<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(backupReadinessHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function backupReadinessSignalList<T extends string>(items: Array<Record<T, string> & { readiness: string; evidence: string; relatedHref: string }>, labelKey: T): string {
  if (items.length === 0) return "<p class=\"muted\">backup signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item[labelKey])}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(backupReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function backupReadinessCommandList(items: BackupReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function backupReadinessRiskList(items: BackupReadinessReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(backupReadinessHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function backupReadinessHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function contextPackCards(files: ContextPackReport["topFiles"]): string {
  if (files.length === 0) return "<article><h3>Pack 후보가 없습니다.</h3><p>텍스트 파일이 없거나 안전 필터에 의해 제외되었습니다.</p></article>";
  return files.map((file) => `<article class="context-pack-card"><h3>${escapeHtml(file.filePath)}</h3><p class="muted">${file.estimatedTokens} tokens · ${file.size} bytes</p><p>${escapeHtml(file.packReason)}</p><a href="${escapeHtml(file.lessonHref.replace(/^html\//, ""))}">파일 수업</a> <a class="context-pack-source-link" href="../${escapeHtml(file.sourceHref)}">원본 열기</a></article>`).join("");
}

function contextSplitPlanList(plans: ContextPackReport["splitPlans"]): string {
  if (plans.length === 0) return "<p class=\"muted\">split plan이 없습니다.</p>";
  return `<ul>${plans.map((plan) => `<li><strong>${escapeHtml(plan.name)}</strong>: ${plan.partCount} parts · max ${plan.maxBytes} bytes${plan.oversizedDirectories.length > 0 ? ` · oversized ${escapeHtml(plan.oversizedDirectories.join(", "))}` : ""}<ul>${plan.parts.map((part) => `<li>${escapeHtml(part.partName)}: ${part.estimatedBytes} bytes · ${part.estimatedTokens} tokens · ${part.fileCount} files · ${escapeHtml(part.directories.join(", "))}${part.overLimit ? " · over limit" : ""}</li>`).join("")}</ul></li>`).join("")}</ul>`;
}

function mcpToolCards(tools: McpHandoffReport["tools"]): string {
  if (tools.length === 0) return "<article><h3>등록된 MCP 도구가 없습니다.</h3><p>handoff report를 다시 생성하세요.</p></article>";
  return tools.map((tool) => `<article class="mcp-handoff-card"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.purpose)}</p><p class="muted">${escapeHtml(tool.useWhen)}</p><h4>Prompt</h4><p>${escapeHtml(tool.recommendedPrompt)}</p><h4>Input hints</h4>${list(tool.inputHints)}</article>`).join("");
}

function agentMemoryLayerCards(layers: AgentMemoryReport["layers"]): string {
  if (layers.length === 0) return "<article><h3>기록된 memory layer가 없습니다.</h3><p>agent memory report를 다시 생성하세요.</p></article>";
  return layers.map((layer) => `<article class="agent-memory-card"><h3>${escapeHtml(layer.name)}</h3><p>${escapeHtml(layer.role)}</p><p class="muted">Before: ${escapeHtml(layer.useBefore)}</p><a href="${escapeHtml(htmlPageHref(layer.generatedArtifact))}">${escapeHtml(layer.generatedArtifact)} 열기</a></article>`).join("");
}

function agentMemoryNoteCards(notes: AgentMemoryReport["memoryNotes"]): string {
  if (notes.length === 0) return "<article><h3>기록된 memory note가 없습니다.</h3><p>agent memory report를 다시 생성하세요.</p></article>";
  return notes.map((note) => `<article class="agent-memory-card"><h3>${escapeHtml(note.title)}</h3><p class="muted">${escapeHtml(note.noteType)}</p><pre>${escapeHtml(note.frontmatter.map((entry) => `${entry.key}: ${entry.value}`).join("\n"))}</pre><p>${escapeHtml(note.body)}</p><a href="${escapeHtml(htmlPageHref(note.relatedReportHref))}">관련 리포트 열기</a></article>`).join("");
}

function graphQueryModeCards(modes: GraphQueryReport["queryModes"]): string {
  if (modes.length === 0) return "<article><h3>기록된 graph query mode가 없습니다.</h3><p>graph query report를 다시 생성하세요.</p></article>";
  return modes.map((mode) => `<article class="graph-query-card"><h3>${escapeHtml(mode.name)}</h3><code>${escapeHtml(mode.commandShape)}</code><p>${escapeHtml(mode.purpose)}</p><p class="muted">${escapeHtml(mode.useWhen)}</p></article>`).join("");
}

function tutorialAbstractionCards(items: TutorialAbstractionReport["abstractions"]): string {
  if (items.length === 0) return "<article><h3>기록된 추상화가 없습니다.</h3><p>핵심 파일 수업을 다시 생성하면 이곳에 튜토리얼 장이 쌓입니다.</p></article>";
  return items.map((item) => `<article class="tutorial-abstraction-card" id="${htmlAnchor(item.id)}"><h3>Chapter ${item.chapterNumber}: ${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><p class="muted">relationships ${item.relationshipCount}</p><p>${escapeHtml(item.chapterGoal)}</p><h4>Relevant Files</h4>${tutorialFileLinks(item.relevantFiles)}</article>`).join("");
}

function tutorialFileLinks(items: TutorialAbstractionReport["abstractions"][number]["relevantFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 관련 파일이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.filePath)}</a> <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function decisionRecordCards(items: DecisionRecordReport["records"]): string {
  if (items.length === 0) return "<article><h3>기록된 decision record가 없습니다.</h3><p>분석 리포트를 다시 생성하세요.</p></article>";
  return items.map((item) => `<article class="decision-record-card" id="${htmlAnchor(item.id)}"><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.status)} · ${escapeHtml(item.scope)} · ${escapeHtml(item.tags.join(", "))}</p><h4>Context</h4><p>${escapeHtml(item.context)}</p><h4>Decision</h4><p>${escapeHtml(item.decision)}</p><h4>Positive Consequences</h4>${list(item.consequences.positive)}<h4>Negative Consequences</h4>${list(item.consequences.negative)}<h4>Related Reports</h4>${list(item.relatedReports.map((report) => `${report.label}: ${report.href}`))}</article>`).join("");
}

function dependencyCycleCards(items: DependencyHealthReport["cycles"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 cycle이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.id)}</strong> [${escapeHtml(item.severity)}]: ${escapeHtml(item.files.join(" -> "))}<br>${escapeHtml(item.suggestion)}</li>`).join("")}</ul>`;
}

function dependencyOrphanList(items: DependencyHealthReport["orphanModules"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 orphan module이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.filePath)}</a>: ${escapeHtml(item.reason)} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function dependencyViolationList(items: DependencyHealthReport["ruleViolations"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 rule violation이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.ruleName)}</strong> [${escapeHtml(item.severity)}]: ${escapeHtml(item.fromFile)}${item.toFile ? ` -> ${escapeHtml(item.toFile)}` : ""}<br>${escapeHtml(item.message)}<br>${escapeHtml(item.suggestion)}</li>`).join("")}</ul>`;
}

function dependencyFanList(items: DependencyHealthReport["graphMetrics"]["topFanIn"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 fan metric이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="files.html#${htmlAnchor(item.filePath)}">${escapeHtml(item.filePath)}</a>: ${item.count}</li>`).join("")}</ul>`;
}

function dependencyEdgeList(items: DependencyHealthReport["localDependencyEdges"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 local dependency edge가 없습니다.</p>";
  return `<ul>${items.slice(0, 30).map((item) => `<li data-dependency-type="${escapeHtml(item.dependencyType)}"><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.fromFile)}</a> -> ${escapeHtml(item.toFile)} <code>${escapeHtml(item.importText)}</code> <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function sourceEvidenceState(file: FileLesson): "present" | "missing" {
  return (file.sourceEvidence ?? []).length > 0 ? "present" : "missing";
}

function sourceEvidenceLabel(file: FileLesson): string {
  return sourceEvidenceState(file) === "present" ? "소스 근거 있음" : "소스 근거 부족";
}

function sourceEvidenceFilterButtons(counts: Record<string, number>): string {
  const present = counts.present ?? 0;
  const missing = counts.missing ?? 0;
  const total = present + missing;
  return [
    `<button type="button" class="active" data-source-evidence-filter="all">전체 근거 ${total}</button>`,
    `<button type="button" data-source-evidence-filter="present">근거 있음 ${present}</button>`,
    `<button type="button" data-source-evidence-filter="missing">근거 부족 ${missing}</button>`
  ].join("");
}

function fileExtension(filePath: string): string {
  const fileName = filePath.split("/").at(-1) ?? filePath;
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot).toLowerCase() : "no-ext";
}

function topDirectory(filePath: string): string {
  return filePath.includes("/") ? filePath.split("/")[0] : "root";
}

function sourceFileHref(filePath: string): string {
  return `../source/${filePath.split("/").map(encodeURIComponent).join("/")}`;
}

function htmlPageHref(filePath: string): string {
  if (filePath.startsWith("html/")) return filePath.slice(5);
  if (filePath.startsWith("markdown/") || filePath.startsWith("analysis/")) return `../${filePath}`;
  return filePath;
}

export function styleCss(): string {
  return `:root{color-scheme:light;--bg:#f7f8fa;--panel:#fff;--text:#17202a;--muted:#64748b;--line:#d9e0ea;--accent:#0f766e;--accent-weak:#e6f4f1}*{box-sizing:border-box}body{margin:0;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text);display:grid;grid-template-columns:240px 1fr;min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;padding:20px;border-right:1px solid var(--line);background:#fff}.sidebar strong{display:block;font-size:18px;margin-bottom:16px}.sidebar input{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:6px;margin-bottom:14px}.sidebar nav{display:grid;gap:4px}.sidebar a{color:var(--text);text-decoration:none;padding:8px 10px;border-radius:6px}.sidebar a.active,.sidebar a:hover{background:var(--accent-weak);color:var(--accent)}main{padding:28px;max-width:1180px;width:100%}.page-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.eyebrow{color:var(--accent);font-weight:700;margin:0 0 4px}h1,h2,h3{line-height:1.25;margin:0 0 12px}h1{font-size:32px}.lead{font-size:18px}.meta{display:grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:8px;margin:0}.meta div,.panel,article{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:16px}.meta dt{font-size:12px;color:var(--muted)}.meta dd{margin:0;font-weight:700}.panel{margin-bottom:16px}.grid,.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px}.cards article{min-height:150px}.muted{color:var(--muted)}pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;overflow:auto}.source-evidence{display:grid;gap:8px;padding-left:0;list-style:none}.source-evidence li{display:grid;gap:3px}.source-evidence code,.evidence-index-cards code{display:block;white-space:pre-wrap;background:#f1f5f9;border:1px solid var(--line);border-radius:6px;padding:7px 8px;color:#0f172a}.source-link{width:max-content;color:var(--accent);font-weight:700;text-decoration:none}.source-link:hover{text-decoration:underline}.toolbar{display:flex;flex-wrap:wrap;gap:8px}.toolbar button{border:1px solid var(--line);background:#fff;color:var(--text);border-radius:6px;padding:8px 10px;cursor:pointer}.toolbar button.active,.toolbar button:hover{border-color:var(--accent);background:var(--accent-weak);color:var(--accent)}details{border-top:1px solid var(--line);margin-top:12px;padding-top:10px}.choice-grid{display:grid;gap:8px}.choice{width:100%;text-align:left;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--text);padding:9px 10px;cursor:pointer}.choice.correct{border-color:#15803d;background:#eaf7ee}.choice.wrong{border-color:#b91c1c;background:#fdecec}.choice:disabled{cursor:default;color:var(--text)}@media print{*{print-color-adjust:exact}body{display:block;background:#fff;color:#111;font-size:12pt}.sidebar,.toolbar,.choice{display:none}main{padding:0;max-width:none}.page-header{display:block;border-bottom:1px solid #999;padding-bottom:12px;margin-bottom:16px}.panel,article,.meta div{break-inside:avoid;background:#fff;border-color:#999}a{color:#111}a[href]::after{content:" (" attr(href) ")";font-size:10pt;color:#555}pre{white-space:pre-wrap;color:#111;background:#f5f5f5}}@media(max-width:760px){body{grid-template-columns:1fr}.sidebar{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}main{padding:18px}.page-header{display:block}.meta{grid-template-columns:1fr 1fr}}`;
}

export function appJs(): string {
  return `const search=document.querySelector('#search');let graphType='all';let fileExt='all';let fileDir='all';let sourceEvidence='all';let evidenceKind='all';let quizSection='all';let quizDifficulty='all';function applyVisibility(){const q=search?search.value.toLowerCase():'';document.querySelectorAll('article,.panel').forEach(el=>{const textOk=!q||el.textContent.toLowerCase().includes(q);const nodeType=el.dataset.nodeType;const graphOk=!nodeType||graphType==='all'||nodeType===graphType;const ext=el.dataset.fileExt;const dir=el.dataset.fileDir;const evidence=el.dataset.sourceEvidence;const kind=el.dataset.evidenceKind;const quizSectionValue=el.dataset.quizSection;const quizDifficultyValue=el.dataset.quizDifficulty;const fileOk=(!ext||fileExt==='all'||ext===fileExt)&&(!dir||fileDir==='all'||dir===fileDir)&&(!evidence||sourceEvidence==='all'||evidence===sourceEvidence);const evidenceOk=!kind||evidenceKind==='all'||kind===evidenceKind;const quizOk=(!quizSectionValue||quizSection==='all'||quizSectionValue===quizSection)&&(!quizDifficultyValue||quizDifficulty==='all'||quizDifficultyValue===quizDifficulty);el.style.display=textOk&&graphOk&&fileOk&&evidenceOk&&quizOk?'':'none';});}if(search){search.addEventListener('input',applyVisibility);}document.querySelectorAll('[data-graph-filter]').forEach(btn=>{btn.addEventListener('click',()=>{graphType=btn.dataset.graphFilter||'all';document.querySelectorAll('[data-graph-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-ext-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileExt=btn.dataset.fileExtFilter||'all';document.querySelectorAll('[data-file-ext-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-dir-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileDir=btn.dataset.fileDirFilter||'all';document.querySelectorAll('[data-file-dir-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-source-evidence-filter]').forEach(btn=>{btn.addEventListener('click',()=>{sourceEvidence=btn.dataset.sourceEvidenceFilter||'all';document.querySelectorAll('[data-source-evidence-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-evidence-kind-filter]').forEach(btn=>{btn.addEventListener('click',()=>{evidenceKind=btn.dataset.evidenceKindFilter||'all';document.querySelectorAll('[data-evidence-kind-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-quiz-section-filter]').forEach(btn=>{btn.addEventListener('click',()=>{quizSection=btn.dataset.quizSectionFilter||'all';document.querySelectorAll('[data-quiz-section-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-quiz-difficulty-filter]').forEach(btn=>{btn.addEventListener('click',()=>{quizDifficulty=btn.dataset.quizDifficultyFilter||'all';document.querySelectorAll('[data-quiz-difficulty-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-download-mermaid]').forEach(btn=>{btn.addEventListener('click',()=>{const source=document.getElementById(btn.dataset.downloadMermaid||'');if(!source)return;const blob=new Blob([source.textContent||''],{type:'text/plain'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='component-graph.mmd';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);});});const learningProgressKey='repotutor:learning-path:'+location.pathname;let learningProgress=new Set();try{learningProgress=new Set(JSON.parse(localStorage.getItem(learningProgressKey)||'[]'));}catch{}function saveLearningProgress(){try{localStorage.setItem(learningProgressKey,JSON.stringify([...learningProgress]));}catch{}}const learningProgressSummary=document.querySelector('[data-learning-progress-summary]');function updateLearningProgressSummary(){if(learningProgressSummary){const inputs=document.querySelectorAll('[data-learning-step-complete]');const completed=Array.from(inputs).filter(input=>input.checked).length;learningProgressSummary.textContent='완료 '+completed+' / '+inputs.length;}}document.querySelectorAll('[data-learning-step-complete]').forEach(input=>{const step=input.dataset.learningStepComplete||'';input.checked=learningProgress.has(step);input.addEventListener('change',()=>{if(input.checked){learningProgress.add(step);}else{learningProgress.delete(step);}saveLearningProgress();updateLearningProgressSummary();});});updateLearningProgressSummary();document.querySelectorAll('[data-reset-learning-progress]').forEach(btn=>{btn.addEventListener('click',()=>{learningProgress.clear();saveLearningProgress();document.querySelectorAll('[data-learning-step-complete]').forEach(input=>{input.checked=false;});updateLearningProgressSummary();});});const picked=new Map();const score=document.querySelector('#quiz-live-score');document.querySelectorAll('[data-reset-quiz]').forEach(btn=>{btn.addEventListener('click',()=>{picked.clear();document.querySelectorAll('.choice').forEach(choice=>{choice.disabled=false;choice.classList.remove('correct','wrong');});if(score){score.textContent='아직 선택한 문제가 없습니다.';}});});document.querySelectorAll('.choice').forEach(btn=>{btn.addEventListener('click',()=>{const q=btn.dataset.question;document.querySelectorAll('.choice[data-question="'+q+'"]').forEach(b=>b.disabled=true);const ok=btn.dataset.correct==='true';btn.classList.add(ok?'correct':'wrong');picked.set(q,ok);if(!ok){document.querySelectorAll('.choice[data-question="'+q+'"][data-correct="true"]').forEach(b=>b.classList.add('correct'));}if(score){const total=picked.size;const correct=[...picked.values()].filter(Boolean).length;score.textContent='현재 브라우저 복습 점수: '+correct+' / '+total;}});});`;
}
