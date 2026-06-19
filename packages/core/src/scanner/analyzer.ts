import path from "node:path";
import { htmlAnchor, todayIsoDate } from "@repotutor/shared";
import type {
  ArchitectureReport,
  DependencyReport,
  FileLesson,
  FlowReport,
  FolderLesson,
  GlossaryTerm,
  EvidenceIndexReport,
  LanguageReport,
  PurposeReport,
  RebuildRoadmap,
  CoverageReport,
  ComponentGraphReport,
  SourceSnapshotReport,
  IncrementalReport,
  SuggestedReadsReport,
  RuntimeEnvironmentReport,
  InterfaceMapReport,
  SymbolMapReport,
  ApiReferenceReport,
  ContextPackReport,
  McpHandoffReport,
  AgentMemoryReport,
  GraphQueryReport,
  TutorialAbstractionReport,
  DecisionRecordReport,
  DependencyHealthReport,
  SearchIndexReport,
  LearningJournalReport,
  DailySummaryReport,
  VibeCodingPromptPackReport,
  ProjectActivityReport,
  CodeMetricsReadinessReport,
  CodeOwnershipReadinessReport,
  LargeAssetReadinessReport,
  LicenseRightsReport,
  SbomReport,
  SecurityReadinessReport,
  SastReadinessReport,
  DastReadinessReport,
  ThreatModelReadinessReport,
  ScorecardReport,
  ProvenanceReport,
  AdvisoryReport,
  VexReport,
  PolicyGateReport,
  ApiContractReport,
  ConsumerContractReadinessReport,
  ObservabilityReport,
  PerformanceReport,
  ProfilingReadinessReport,
  TracingReadinessReport,
  DebugReadinessReport,
  CrashReportingReadinessReport,
  IncidentResponseReadinessReport,
  SloReadinessReport,
  CostReadinessReport,
  ProgressiveDeliveryReadinessReport,
  LoadTestingReadinessReport,
  BenchmarkReadinessReport,
  E2eReport,
  FlakyTestReadinessReport,
  TestImpactReadinessReport,
  TestReportingReadinessReport,
  SnapshotReadinessReport,
  PropertyBasedTestingReadinessReport,
  FuzzReadinessReport,
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
  ContainerScanReadinessReport,
  CodeQualityReport,
  DocumentationReport,
  DatabaseReadinessReport,
  DatabaseMigrationReadinessReport,
  DatabaseOrmReadinessReport,
  DataTransformationReadinessReport,
  DataQualityReadinessReport,
  DataLineageReadinessReport,
  DataCatalogReadinessReport,
  DataAnnotationReadinessReport,
  LakehouseTableReadinessReport,
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
  DependencyReviewReadinessReport,
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
  EventStreamReadinessReport,
  DataConnectorReadinessReport,
  SemanticLayerReadinessReport,
  BiDashboardReadinessReport,
  SchemaRegistryReadinessReport,
  StreamProcessingReadinessReport,
  PipelineOrchestrationReadinessReport,
  ServiceMeshReadinessReport,
  IngressControllerReadinessReport,
  DnsReadinessReport,
  CertificateReadinessReport,
  HelmReadinessReport,
  AdmissionPolicyReadinessReport,
  ApiGatewayReadinessReport,
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
  RealtimeMediaReadinessReport,
  PdfGenerationReadinessReport,
  SpreadsheetReadinessReport,
  ChartVisualizationReadinessReport,
  MarkdownCodeRenderingReadinessReport,
  NotebookReadinessReport,
  MapVisualizationReadinessReport,
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
  TerminalUiReadinessReport,
  StateMachineReadinessReport,
  AnimationReadinessReport,
  DragAndDropReadinessReport,
  RichTextEditorReadinessReport,
  CommandPaletteReadinessReport,
  GuidedTourReadinessReport,
  DataTableReadinessReport,
  CalendarReadinessReport,
  DialogReadinessReport,
  PopoverTooltipReadinessReport,
  MenuDropdownReadinessReport,
  ToastSnackbarReadinessReport,
  TabsAccordionReadinessReport,
  CheckboxRadioSwitchReadinessReport,
  SliderProgressReadinessReport,
  SelectComboboxReadinessReport,
  ToolbarToggleReadinessReport,
  ScrollAreaReadinessReport,
  AvatarReadinessReport,
  PinInputReadinessReport,
  PaginationReadinessReport,
  NumberInputReadinessReport,
  RatingGroupReadinessReport,
  ColorPickerReadinessReport,
  SplitterReadinessReport,
  TagsInputReadinessReport,
  ClipboardReadinessReport,
  QrCodeReadinessReport,
  TimerReadinessReport,
  StepsReadinessReport,
  CarouselReadinessReport,
  TreeViewReadinessReport,
  CollapsibleReadinessReport,
  EditableReadinessReport,
  PasswordInputReadinessReport,
  SignaturePadReadinessReport,
  AngleSliderReadinessReport,
  CascadeSelectReadinessReport,
  AsyncListReadinessReport,
  ImageCropperReadinessReport,
  ListboxReadinessReport,
  DatePickerReadinessReport,
  MarqueeReadinessReport,
  TocReadinessReport,
  FloatingPanelReadinessReport,
  DrawerReadinessReport,
  HoverCardReadinessReport,
  NavigationMenuReadinessReport,
  PresenceReadinessReport,
  MenuReadinessReport,
  TooltipReadinessReport,
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
  IacDriftReadinessReport,
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
  SourceType,
  RepoMap
} from "@repotutor/shared";
import { readTextIfSafe, walkSafe, type WalkResult } from "../fs-utils.js";
import {
  buildCoverageReport,
  buildEvidenceIndexReport,
  buildFileLessons,
  buildSuggestedReadsReport
} from "./lessons.js";
import {
  buildArchitectureReport,
  buildDependencyReport,
  buildFolderLessons,
  buildLanguageReport,
  buildPurposeReport,
  buildRepoMap
} from "./repo-structure.js";
import { encodedPath } from "./source-links.js";
import { buildRuntimeEnvironmentReport } from "./runtime-readiness.js";
import { buildInterfaceMapReport } from "./interface-map.js";
import { buildSymbolMapReport } from "./symbol-map.js";
import { buildApiReferenceReport, buildApiReferenceSourceFiles } from "./api-reference.js";
import {
  buildAgentMemoryReport,
  buildContextPackReport,
  buildDecisionRecordReport,
  buildGraphQueryReport,
  buildMcpHandoffReport,
  buildTutorialAbstractionReport
} from "./context-handoff.js";
import { buildCodeMetricsReadinessReport } from "./code-metrics-readiness.js";
import { buildCodeOwnershipReadinessReport } from "./code-ownership-readiness.js";
import { buildLargeAssetReadinessReport } from "./large-asset-readiness.js";
import { buildLicenseRightsReport, buildSbomReport } from "./compliance-metadata.js";
import { buildSecurityReadinessReport } from "./security-readiness.js";
import { buildLlmEvalReadinessReport, buildLlmObservabilityReadinessReport, buildLlmReadinessReport } from "./llm-readiness.js";
import { buildObjectStorageReadinessReport, buildRealtimeCollaborationReadinessReport, buildSearchServiceReadinessReport, buildVectorDbReadinessReport, buildWorkflowOrchestrationReadinessReport } from "./storage-collaboration-readiness.js";
import { buildNotificationReadinessReport, buildOpenApiClientReadinessReport, buildWebhookReadinessReport } from "./api-communication-readiness.js";
import { buildConsentReadinessReport, buildPrivacyReadinessReport } from "./privacy-governance-readiness.js";
import { buildServerFrameworkReadinessReport } from "./server-framework-readiness.js";
import { buildRpcReadinessReport, buildScaffoldingReadinessReport, buildSchedulerReadinessReport, buildWorkspaceGraphReadinessReport } from "./workspace-runtime-readiness.js";
import {
  buildDataTableReadinessReport,
  buildCalendarReadinessReport,
  buildDialogReadinessReport,
  buildPopoverTooltipReadinessReport,
  buildMenuDropdownReadinessReport,
  buildToastSnackbarReadinessReport,
  buildTabsAccordionReadinessReport,
  buildCheckboxRadioSwitchReadinessReport,
  buildSliderProgressReadinessReport,
  buildSelectComboboxReadinessReport,
  buildToolbarToggleReadinessReport,
  buildScrollAreaReadinessReport,
  buildAvatarReadinessReport,
  buildPinInputReadinessReport,
  buildPaginationReadinessReport,
  buildNumberInputReadinessReport,
  buildRatingGroupReadinessReport,
  buildColorPickerReadinessReport,
  buildSplitterReadinessReport,
  buildTagsInputReadinessReport,
  buildClipboardReadinessReport,
  buildQrCodeReadinessReport,
  buildTimerReadinessReport,
  buildStepsReadinessReport,
  buildCarouselReadinessReport,
  buildTreeViewReadinessReport,
  buildCollapsibleReadinessReport,
  buildEditableReadinessReport,
  buildPasswordInputReadinessReport,
  buildSignaturePadReadinessReport,
  buildAngleSliderReadinessReport,
  buildCascadeSelectReadinessReport,
  buildAsyncListReadinessReport,
  buildImageCropperReadinessReport,
  buildListboxReadinessReport,
  buildDatePickerReadinessReport,
  buildMarqueeReadinessReport,
  buildTocReadinessReport,
  buildFloatingPanelReadinessReport,
  buildDrawerReadinessReport,
  buildHoverCardReadinessReport,
  buildNavigationMenuReadinessReport,
  buildPresenceReadinessReport,
  buildMenuReadinessReport,
  buildTooltipReadinessReport
} from "./ui-components-readiness.js";
import { buildCliReadinessReport, buildEnvValidationReadinessReport, buildGraphqlReadinessReport, buildSecurityHeadersReadinessReport, buildTerminalUiReadinessReport } from "./config-api-cli-readiness.js";
import { buildAnimationReadinessReport, buildDragAndDropReadinessReport, buildRichTextEditorReadinessReport, buildStateMachineReadinessReport } from "./interaction-editor-readiness.js";
import { buildCommandPaletteReadinessReport, buildGuidedTourReadinessReport } from "./command-tour-readiness.js";
import { buildDateTimeReadinessReport, buildFileUploadReadinessReport, buildIdGenerationReadinessReport, buildImageProcessingReadinessReport } from "./utility-core-readiness.js";
import { buildRealtimeMediaReadinessReport, buildWebSocketReadinessReport } from "./realtime-media-readiness.js";
import { buildChartVisualizationReadinessReport, buildPdfGenerationReadinessReport, buildSpreadsheetReadinessReport } from "./document-visualization-readiness.js";
import { buildDiagramRenderingReadinessReport, buildMapVisualizationReadinessReport, buildMarkdownCodeRenderingReadinessReport, buildNotebookReadinessReport } from "./markdown-map-readiness.js";
import { buildBrowserCompatibilityReadinessReport, buildBrowserExtensionReadinessReport, buildLinkIntegrityReadinessReport, buildPwaReadinessReport, buildSeoMetadataReadinessReport } from "./web-discovery-readiness.js";
import { buildBiDashboardReadinessReport, buildDataConnectorReadinessReport, buildSemanticLayerReadinessReport } from "./data-analytics-readiness.js";
import { buildPipelineOrchestrationReadinessReport, buildSchemaRegistryReadinessReport, buildStreamProcessingReadinessReport } from "./schema-stream-readiness.js";
import { buildCertificateReadinessReport, buildDnsReadinessReport, buildIngressControllerReadinessReport, buildServiceMeshReadinessReport } from "./network-mesh-readiness.js";
import { buildAdmissionPolicyReadinessReport, buildApiGatewayReadinessReport, buildHelmReadinessReport } from "./deploy-policy-readiness.js";
import { buildCacheReadinessReport, buildErrorTrackingReadinessReport, buildFeatureFlagReadinessReport, buildLoggingReadinessReport, buildRateLimitReadinessReport } from "./app-ops-readiness.js";
import { buildAnalyticsReadinessReport, buildHttpClientReadinessReport, buildSchemaValidationReadinessReport } from "./analytics-http-readiness.js";
import { buildDataFetchingReadinessReport, buildRoutingReadinessReport, buildStateManagementReadinessReport } from "./frontend-data-state-readiness.js";
import { buildAuthReadinessReport, buildAuthorizationReadinessReport, buildFormReadinessReport, buildPaymentReadinessReport } from "./frontend-form-auth-readiness.js";
import { buildEmailReadinessReport, buildEventStreamReadinessReport, buildQueueReadinessReport } from "./async-messaging-readiness.js";
import { buildAccessibilityReport, buildDesignTokensReport, buildI18nReport, buildStorybookReport } from "./ui-foundation-readiness.js";
import { buildReleaseReadinessReport, buildSecretManagementReadinessReport, buildSecretReadinessReport } from "./release-secret-readiness.js";
import { buildCodeQualityReport, buildContainerReadinessReport, buildContainerScanReadinessReport, buildDocumentationReport } from "./container-code-doc-readiness.js";
import { buildCiCdReport, buildCoverageReadinessReport, buildMutationTestingReadinessReport, buildTypecheckReadinessReport, buildUnitTestReport } from "./ci-test-readiness.js";
import { buildGitHooksReport, buildPackageManagerReport, buildTaskRunnerReport } from "./package-task-readiness.js";
import { buildDependencyReviewReadinessReport, buildDependencyUpdateReport } from "./dependency-policy-readiness.js";
import { buildChangelogReadinessReport, buildCommitConventionReport, buildFormatReadinessReport, buildLintReadinessReport } from "./style-release-readiness.js";
import { buildBundleAnalysisReport, buildMockingReadinessReport } from "./bundle-mocking-readiness.js";
import { buildDatabaseMigrationReadinessReport, buildDatabaseOrmReadinessReport, buildDatabaseReadinessReport } from "./database-readiness.js";
import { buildDataCatalogReadinessReport, buildDataLineageReadinessReport, buildDataQualityReadinessReport, buildDataTransformationReadinessReport } from "./data-pipeline-readiness.js";
import { buildDataAnnotationReadinessReport, buildFeatureStoreReadinessReport, buildLakehouseTableReadinessReport, buildModelRegistryReadinessReport } from "./ml-data-readiness.js";
import { buildExperimentTrackingReadinessReport, buildModelMonitoringReadinessReport, buildModelServingReadinessReport, buildModelTrainingReadinessReport } from "./ml-ops-readiness.js";
import { buildApiContractReport, buildConsumerContractReadinessReport } from "./api-contract-readiness.js";
import { buildObservabilityReport, buildPerformanceReport, buildProfilingReadinessReport, buildTracingReadinessReport } from "./observability-performance-readiness.js";
import { buildCrashReportingReadinessReport, buildDebugReadinessReport } from "./debug-crash-readiness.js";
import { buildCostReadinessReport, buildIncidentResponseReadinessReport, buildSloReadinessReport } from "./reliability-cost-readiness.js";
import { buildBenchmarkReadinessReport, buildLoadTestingReadinessReport, buildProgressiveDeliveryReadinessReport } from "./performance-gate-readiness.js";
import {
  buildChaosEngineeringReadinessReport,
  buildE2eReport,
  buildFlakyTestReadinessReport,
  buildFuzzReadinessReport,
  buildIntegrationTestEnvironmentReadinessReport,
  buildPropertyBasedTestingReadinessReport,
  buildSnapshotReadinessReport,
  buildTestDataReadinessReport,
  buildTestImpactReadinessReport,
  buildTestReportingReadinessReport
} from "./testing-readiness.js";
import {
  buildBackupReadinessReport,
  buildBuildToolReadinessReport,
  buildComposeReadinessReport,
  buildDeploymentReadinessReport,
  buildDesktopReadinessReport,
  buildDevContainerReadinessReport,
  buildEdgeReadinessReport,
  buildGitOpsReadinessReport,
  buildIacDriftReadinessReport,
  buildInfrastructureReadinessReport,
  buildKubernetesReadinessReport,
  buildMobileReadinessReport,
  buildServerlessReadinessReport,
  buildStylingReadinessReport,
  buildVisualRegressionReadinessReport
} from "./infra-readiness.js";
import { buildSastReadinessReport } from "./sast-readiness.js";
import { buildDastReadinessReport } from "./dast-readiness.js";
import { buildThreatModelReadinessReport } from "./threat-model-readiness.js";
import { buildAdvisoryReport, buildPolicyGateReport, buildVexReport } from "./advisory-policy-readiness.js";

export interface AnalysisContext {
  sourceType?: SourceType;
  sourceUrl?: string | null;
  localSourcePath?: string | null;
  branch?: string | null;
  commitHash?: string | null;
}

export interface AnalysisBundle {
  repoMap: RepoMap;
  languageReport: LanguageReport;
  dependencyReport: DependencyReport;
  purposeReport: PurposeReport;
  architectureReport: ArchitectureReport;
  folderLessons: FolderLesson[];
  fileLessons: FileLesson[];
  coverageReport: CoverageReport;
  evidenceIndexReport: EvidenceIndexReport;
  suggestedReadsReport: SuggestedReadsReport;
  runtimeEnvironmentReport: RuntimeEnvironmentReport;
  interfaceMapReport: InterfaceMapReport;
  symbolMapReport: SymbolMapReport;
  apiReferenceReport: ApiReferenceReport;
  contextPackReport: ContextPackReport;
  mcpHandoffReport: McpHandoffReport;
  agentMemoryReport: AgentMemoryReport;
  graphQueryReport: GraphQueryReport;
  tutorialAbstractionReport: TutorialAbstractionReport;
  decisionRecordReport: DecisionRecordReport;
  dependencyHealthReport: DependencyHealthReport;
  searchIndexReport: SearchIndexReport;
  learningJournalReport: LearningJournalReport;
  dailySummaryReport: DailySummaryReport;
  vibeCodingPromptPackReport: VibeCodingPromptPackReport;
  projectActivityReport: ProjectActivityReport;
  codeMetricsReadinessReport: CodeMetricsReadinessReport;
  codeOwnershipReadinessReport: CodeOwnershipReadinessReport;
  largeAssetReadinessReport: LargeAssetReadinessReport;
  licenseRightsReport: LicenseRightsReport;
  sbomReport: SbomReport;
  securityReadinessReport: SecurityReadinessReport;
  sastReadinessReport: SastReadinessReport;
  dastReadinessReport: DastReadinessReport;
  threatModelReadinessReport: ThreatModelReadinessReport;
  scorecardReport: ScorecardReport;
  provenanceReport: ProvenanceReport;
  advisoryReport: AdvisoryReport;
  vexReport: VexReport;
  policyGateReport: PolicyGateReport;
  apiContractReport: ApiContractReport;
  consumerContractReadinessReport: ConsumerContractReadinessReport;
  observabilityReport: ObservabilityReport;
  performanceReport: PerformanceReport;
  profilingReadinessReport: ProfilingReadinessReport;
  tracingReadinessReport: TracingReadinessReport;
  debugReadinessReport: DebugReadinessReport;
  crashReportingReadinessReport: CrashReportingReadinessReport;
  incidentResponseReadinessReport: IncidentResponseReadinessReport;
  sloReadinessReport: SloReadinessReport;
  costReadinessReport: CostReadinessReport;
  progressiveDeliveryReadinessReport: ProgressiveDeliveryReadinessReport;
  loadTestingReadinessReport: LoadTestingReadinessReport;
  benchmarkReadinessReport: BenchmarkReadinessReport;
  e2eReport: E2eReport;
  flakyTestReadinessReport: FlakyTestReadinessReport;
  testImpactReadinessReport: TestImpactReadinessReport;
  testReportingReadinessReport: TestReportingReadinessReport;
  snapshotReadinessReport: SnapshotReadinessReport;
  propertyBasedTestingReadinessReport: PropertyBasedTestingReadinessReport;
  fuzzReadinessReport: FuzzReadinessReport;
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
  containerScanReadinessReport: ContainerScanReadinessReport;
  codeQualityReport: CodeQualityReport;
  documentationReport: DocumentationReport;
  databaseReadinessReport: DatabaseReadinessReport;
  databaseMigrationReadinessReport: DatabaseMigrationReadinessReport;
  databaseOrmReadinessReport: DatabaseOrmReadinessReport;
  dataTransformationReadinessReport: DataTransformationReadinessReport;
  dataQualityReadinessReport: DataQualityReadinessReport;
  dataLineageReadinessReport: DataLineageReadinessReport;
  dataCatalogReadinessReport: DataCatalogReadinessReport;
  dataAnnotationReadinessReport: DataAnnotationReadinessReport;
  lakehouseTableReadinessReport: LakehouseTableReadinessReport;
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
  dependencyReviewReadinessReport: DependencyReviewReadinessReport;
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
  eventStreamReadinessReport: EventStreamReadinessReport;
  dataConnectorReadinessReport: DataConnectorReadinessReport;
  semanticLayerReadinessReport: SemanticLayerReadinessReport;
  biDashboardReadinessReport: BiDashboardReadinessReport;
  schemaRegistryReadinessReport: SchemaRegistryReadinessReport;
  streamProcessingReadinessReport: StreamProcessingReadinessReport;
  pipelineOrchestrationReadinessReport: PipelineOrchestrationReadinessReport;
  serviceMeshReadinessReport: ServiceMeshReadinessReport;
  ingressControllerReadinessReport: IngressControllerReadinessReport;
  dnsReadinessReport: DnsReadinessReport;
  certificateReadinessReport: CertificateReadinessReport;
  helmReadinessReport: HelmReadinessReport;
  admissionPolicyReadinessReport: AdmissionPolicyReadinessReport;
  apiGatewayReadinessReport: ApiGatewayReadinessReport;
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
  realtimeMediaReadinessReport: RealtimeMediaReadinessReport;
  pdfGenerationReadinessReport: PdfGenerationReadinessReport;
  spreadsheetReadinessReport: SpreadsheetReadinessReport;
  chartVisualizationReadinessReport: ChartVisualizationReadinessReport;
  markdownCodeRenderingReadinessReport: MarkdownCodeRenderingReadinessReport;
  notebookReadinessReport: NotebookReadinessReport;
  mapVisualizationReadinessReport: MapVisualizationReadinessReport;
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
  terminalUiReadinessReport: TerminalUiReadinessReport;
  stateMachineReadinessReport: StateMachineReadinessReport;
  animationReadinessReport: AnimationReadinessReport;
  dragAndDropReadinessReport: DragAndDropReadinessReport;
  richTextEditorReadinessReport: RichTextEditorReadinessReport;
  commandPaletteReadinessReport: CommandPaletteReadinessReport;
  guidedTourReadinessReport: GuidedTourReadinessReport;
  dataTableReadinessReport: DataTableReadinessReport;
  calendarReadinessReport: CalendarReadinessReport;
  dialogReadinessReport: DialogReadinessReport;
  popoverTooltipReadinessReport: PopoverTooltipReadinessReport;
  menuDropdownReadinessReport: MenuDropdownReadinessReport;
  toastSnackbarReadinessReport: ToastSnackbarReadinessReport;
  tabsAccordionReadinessReport: TabsAccordionReadinessReport;
  checkboxRadioSwitchReadinessReport: CheckboxRadioSwitchReadinessReport;
  sliderProgressReadinessReport: SliderProgressReadinessReport;
  selectComboboxReadinessReport: SelectComboboxReadinessReport;
  toolbarToggleReadinessReport: ToolbarToggleReadinessReport;
  scrollAreaReadinessReport: ScrollAreaReadinessReport;
  avatarReadinessReport: AvatarReadinessReport;
  pinInputReadinessReport: PinInputReadinessReport;
  paginationReadinessReport: PaginationReadinessReport;
  numberInputReadinessReport: NumberInputReadinessReport;
  ratingGroupReadinessReport: RatingGroupReadinessReport;
  colorPickerReadinessReport: ColorPickerReadinessReport;
  splitterReadinessReport: SplitterReadinessReport;
  tagsInputReadinessReport: TagsInputReadinessReport;
  clipboardReadinessReport: ClipboardReadinessReport;
  qrCodeReadinessReport: QrCodeReadinessReport;
  timerReadinessReport: TimerReadinessReport;
  stepsReadinessReport: StepsReadinessReport;
  carouselReadinessReport: CarouselReadinessReport;
  treeViewReadinessReport: TreeViewReadinessReport;
  collapsibleReadinessReport: CollapsibleReadinessReport;
  editableReadinessReport: EditableReadinessReport;
  passwordInputReadinessReport: PasswordInputReadinessReport;
  signaturePadReadinessReport: SignaturePadReadinessReport;
  angleSliderReadinessReport: AngleSliderReadinessReport;
  cascadeSelectReadinessReport: CascadeSelectReadinessReport;
  asyncListReadinessReport: AsyncListReadinessReport;
  imageCropperReadinessReport: ImageCropperReadinessReport;
  listboxReadinessReport: ListboxReadinessReport;
  datePickerReadinessReport: DatePickerReadinessReport;
  marqueeReadinessReport: MarqueeReadinessReport;
  tocReadinessReport: TocReadinessReport;
  floatingPanelReadinessReport: FloatingPanelReadinessReport;
  drawerReadinessReport: DrawerReadinessReport;
  hoverCardReadinessReport: HoverCardReadinessReport;
  navigationMenuReadinessReport: NavigationMenuReadinessReport;
  presenceReadinessReport: PresenceReadinessReport;
  menuReadinessReport: MenuReadinessReport;
  tooltipReadinessReport: TooltipReadinessReport;
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
  iacDriftReadinessReport: IacDriftReadinessReport;
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
}

export async function analyzeRepository(sourceRoot: string, context: AnalysisContext = {}): Promise<AnalysisBundle> {
  const walk = await walkSafe(sourceRoot);
  const repoMap = buildRepoMap(sourceRoot, walk);
  const languageReport = buildLanguageReport(walk);
  const dependencyReport = await buildDependencyReport(sourceRoot, walk);
  const purposeReport = await buildPurposeReport(sourceRoot, walk, languageReport, repoMap);
  const architectureReport = buildArchitectureReport(repoMap, languageReport, dependencyReport);
  const folderLessons = buildFolderLessons(repoMap);
  const fileLessons = await buildFileLessons(sourceRoot, walk);
  const coverageReport = buildCoverageReport(repoMap, fileLessons);
  const evidenceIndexReport = buildEvidenceIndexReport(fileLessons);
  const suggestedReadsReport = buildSuggestedReadsReport(fileLessons);
  const runtimeEnvironmentReport = buildRuntimeEnvironmentReport(walk, dependencyReport);
  const interfaceMapReport = await buildInterfaceMapReport(walk);
  const symbolMapReport = await buildSymbolMapReport(walk, fileLessons);
  const apiReferenceSourceFiles = await buildApiReferenceSourceFiles(walk);
  const apiReferenceReport = buildApiReferenceReport(fileLessons, symbolMapReport, apiReferenceSourceFiles);
  const contextPackReport = await buildContextPackReport(walk, fileLessons);
  const mcpHandoffReport = buildMcpHandoffReport(repoMap, contextPackReport);
  const flowReport = buildFlowReport(fileLessons, dependencyReport);
  const glossary = buildGlossary(languageReport, dependencyReport, fileLessons);
  const rebuildRoadmap = buildRebuildRoadmap(repoMap, fileLessons);
  const componentGraphReport = buildComponentGraphReport(folderLessons, fileLessons, glossary, rebuildRoadmap);
  const graphQueryReport = buildGraphQueryReport(componentGraphReport);
  const tutorialAbstractionReport = buildTutorialAbstractionReport(fileLessons, suggestedReadsReport, componentGraphReport);
  const decisionRecordReport = buildDecisionRecordReport(repoMap, architectureReport, runtimeEnvironmentReport, interfaceMapReport, contextPackReport, tutorialAbstractionReport);
  const dependencyHealthReport = buildDependencyHealthReport(fileLessons);
  const searchIndexReport = buildSearchIndexReport(fileLessons, folderLessons, suggestedReadsReport, runtimeEnvironmentReport, interfaceMapReport, symbolMapReport, apiReferenceReport, dependencyHealthReport);
  const learningJournalReport = buildLearningJournalReport(fileLessons, glossary, graphQueryReport, tutorialAbstractionReport, searchIndexReport);
  const dailySummaryReport = buildDailySummaryReport(purposeReport, architectureReport, folderLessons, fileLessons, glossary, rebuildRoadmap, learningJournalReport);
  const vibeCodingPromptPackReport = buildVibeCodingPromptPackReport(purposeReport, architectureReport, folderLessons, fileLessons, glossary, rebuildRoadmap, learningJournalReport);
  const agentMemoryReport = buildAgentMemoryReport(repoMap, languageReport, purposeReport, contextPackReport, mcpHandoffReport, componentGraphReport);
  const sourceSnapshotReport = await buildSourceSnapshotReport(walk);
  const projectActivityReport = buildProjectActivityReport(context, sourceSnapshotReport, fileLessons, dependencyHealthReport, decisionRecordReport);
  const codeMetricsReadinessReport = await buildCodeMetricsReadinessReport(walk);
  const codeOwnershipReadinessReport = await buildCodeOwnershipReadinessReport(walk);
  const largeAssetReadinessReport = await buildLargeAssetReadinessReport(walk);
  const licenseRightsReport = await buildLicenseRightsReport(walk);
  const sbomReport = await buildSbomReport(context, walk);
  const securityReadinessReport = buildSecurityReadinessReport(walk, sbomReport, licenseRightsReport);
  const sastReadinessReport = await buildSastReadinessReport(walk);
  const dastReadinessReport = await buildDastReadinessReport(walk);
  const threatModelReadinessReport = await buildThreatModelReadinessReport(walk);
  const advisoryReport = await buildAdvisoryReport(walk, sbomReport, securityReadinessReport, licenseRightsReport);
  const scorecardReport = await buildScorecardReport(walk, licenseRightsReport, sbomReport, securityReadinessReport);
  const provenanceReport = buildProvenanceReport(context, walk, sbomReport, securityReadinessReport, sourceSnapshotReport);
  const vexReport = buildVexReport(walk, sbomReport, securityReadinessReport, advisoryReport, provenanceReport, sourceSnapshotReport);
  const policyGateReport = await buildPolicyGateReport(walk, securityReadinessReport);
  const apiContractReport = await buildApiContractReport(walk);
  const consumerContractReadinessReport = await buildConsumerContractReadinessReport(walk);
  const observabilityReport = await buildObservabilityReport(walk, runtimeEnvironmentReport);
  const performanceReport = await buildPerformanceReport(walk, runtimeEnvironmentReport);
  const profilingReadinessReport = await buildProfilingReadinessReport(walk);
  const tracingReadinessReport = await buildTracingReadinessReport(walk);
  const debugReadinessReport = await buildDebugReadinessReport(walk);
  const crashReportingReadinessReport = await buildCrashReportingReadinessReport(walk);
  const incidentResponseReadinessReport = await buildIncidentResponseReadinessReport(walk);
  const sloReadinessReport = await buildSloReadinessReport(walk);
  const costReadinessReport = await buildCostReadinessReport(walk);
  const progressiveDeliveryReadinessReport = await buildProgressiveDeliveryReadinessReport(walk);
  const loadTestingReadinessReport = await buildLoadTestingReadinessReport(walk);
  const benchmarkReadinessReport = await buildBenchmarkReadinessReport(walk);
  const e2eReport = await buildE2eReport(walk, runtimeEnvironmentReport);
  const flakyTestReadinessReport = await buildFlakyTestReadinessReport(walk);
  const testImpactReadinessReport = await buildTestImpactReadinessReport(walk);
  const testReportingReadinessReport = await buildTestReportingReadinessReport(walk);
  const snapshotReadinessReport = await buildSnapshotReadinessReport(walk);
  const propertyBasedTestingReadinessReport = await buildPropertyBasedTestingReadinessReport(walk);
  const fuzzReadinessReport = await buildFuzzReadinessReport(walk);
  const testDataReadinessReport = await buildTestDataReadinessReport(walk);
  const integrationTestEnvironmentReadinessReport = await buildIntegrationTestEnvironmentReadinessReport(walk, runtimeEnvironmentReport);
  const chaosEngineeringReadinessReport = await buildChaosEngineeringReadinessReport(walk);
  const accessibilityReport = await buildAccessibilityReport(walk, e2eReport);
  const storybookReport = await buildStorybookReport(walk);
  const designTokensReport = await buildDesignTokensReport(walk, storybookReport);
  const i18nReport = await buildI18nReport(walk);
  const releaseReadinessReport = await buildReleaseReadinessReport(walk);
  const secretReadinessReport = await buildSecretReadinessReport(walk);
  const secretManagementReadinessReport = await buildSecretManagementReadinessReport(walk);
  const containerReadinessReport = await buildContainerReadinessReport(walk);
  const containerScanReadinessReport = await buildContainerScanReadinessReport(walk);
  const codeQualityReport = await buildCodeQualityReport(walk);
  const documentationReport = await buildDocumentationReport(walk);
  const databaseReadinessReport = await buildDatabaseReadinessReport(walk);
  const databaseMigrationReadinessReport = await buildDatabaseMigrationReadinessReport(walk);
  const databaseOrmReadinessReport = await buildDatabaseOrmReadinessReport(walk);
  const dataTransformationReadinessReport = await buildDataTransformationReadinessReport(walk);
  const dataQualityReadinessReport = await buildDataQualityReadinessReport(walk);
  const dataLineageReadinessReport = await buildDataLineageReadinessReport(walk);
  const dataCatalogReadinessReport = await buildDataCatalogReadinessReport(walk);
  const dataAnnotationReadinessReport = await buildDataAnnotationReadinessReport(walk);
  const lakehouseTableReadinessReport = await buildLakehouseTableReadinessReport(walk);
  const featureStoreReadinessReport = await buildFeatureStoreReadinessReport(walk);
  const modelRegistryReadinessReport = await buildModelRegistryReadinessReport(walk);
  const experimentTrackingReadinessReport = await buildExperimentTrackingReadinessReport(walk);
  const modelMonitoringReadinessReport = await buildModelMonitoringReadinessReport(walk);
  const modelServingReadinessReport = await buildModelServingReadinessReport(walk);
  const modelTrainingReadinessReport = await buildModelTrainingReadinessReport(walk);
  const ciCdReport = await buildCiCdReport(walk);
  const unitTestReport = await buildUnitTestReport(walk);
  const coverageReadinessReport = await buildCoverageReadinessReport(walk);
  const mutationTestingReadinessReport = await buildMutationTestingReadinessReport(walk);
  const typecheckReadinessReport = await buildTypecheckReadinessReport(walk);
  const packageManagerReport = await buildPackageManagerReport(walk);
  const gitHooksReport = await buildGitHooksReport(walk);
  const taskRunnerReport = await buildTaskRunnerReport(walk);
  const dependencyUpdateReport = await buildDependencyUpdateReport(walk);
  const dependencyReviewReadinessReport = await buildDependencyReviewReadinessReport(walk);
  const lintReadinessReport = await buildLintReadinessReport(walk);
  const formatReadinessReport = await buildFormatReadinessReport(walk);
  const commitConventionReport = await buildCommitConventionReport(walk);
  const changelogReadinessReport = await buildChangelogReadinessReport(walk);
  const bundleAnalysisReport = await buildBundleAnalysisReport(walk);
  const mockingReadinessReport = await buildMockingReadinessReport(walk);
  const dataFetchingReadinessReport = await buildDataFetchingReadinessReport(walk);
  const routingReadinessReport = await buildRoutingReadinessReport(walk);
  const stateManagementReadinessReport = await buildStateManagementReadinessReport(walk);
  const formReadinessReport = await buildFormReadinessReport(walk);
  const authReadinessReport = await buildAuthReadinessReport(walk);
  const authorizationReadinessReport = await buildAuthorizationReadinessReport(walk);
  const paymentReadinessReport = await buildPaymentReadinessReport(walk);
  const emailReadinessReport = await buildEmailReadinessReport(walk);
  const queueReadinessReport = await buildQueueReadinessReport(walk);
  const eventStreamReadinessReport = await buildEventStreamReadinessReport(walk);
  const dataConnectorReadinessReport = await buildDataConnectorReadinessReport(walk);
  const semanticLayerReadinessReport = await buildSemanticLayerReadinessReport(walk);
  const biDashboardReadinessReport = await buildBiDashboardReadinessReport(walk);
  const schemaRegistryReadinessReport = await buildSchemaRegistryReadinessReport(walk);
  const streamProcessingReadinessReport = await buildStreamProcessingReadinessReport(walk);
  const pipelineOrchestrationReadinessReport = await buildPipelineOrchestrationReadinessReport(walk);
  const serviceMeshReadinessReport = await buildServiceMeshReadinessReport(walk);
  const ingressControllerReadinessReport = await buildIngressControllerReadinessReport(walk);
  const dnsReadinessReport = await buildDnsReadinessReport(walk);
  const certificateReadinessReport = await buildCertificateReadinessReport(walk);
  const helmReadinessReport = await buildHelmReadinessReport(walk);
  const admissionPolicyReadinessReport = await buildAdmissionPolicyReadinessReport(walk);
  const apiGatewayReadinessReport = await buildApiGatewayReadinessReport(walk);
  const cacheReadinessReport = await buildCacheReadinessReport(walk);
  const loggingReadinessReport = await buildLoggingReadinessReport(walk);
  const featureFlagReadinessReport = await buildFeatureFlagReadinessReport(walk);
  const rateLimitReadinessReport = await buildRateLimitReadinessReport(walk);
  const errorTrackingReadinessReport = await buildErrorTrackingReadinessReport(walk);
  const analyticsReadinessReport = await buildAnalyticsReadinessReport(walk);
  const httpClientReadinessReport = await buildHttpClientReadinessReport(walk);
  const schemaValidationReadinessReport = await buildSchemaValidationReadinessReport(walk);
  const dateTimeReadinessReport = await buildDateTimeReadinessReport(walk);
  const idGenerationReadinessReport = await buildIdGenerationReadinessReport(walk);
  const imageProcessingReadinessReport = await buildImageProcessingReadinessReport(walk);
  const fileUploadReadinessReport = await buildFileUploadReadinessReport(walk);
  const webSocketReadinessReport = await buildWebSocketReadinessReport(walk);
  const realtimeMediaReadinessReport = await buildRealtimeMediaReadinessReport(walk);
  const pdfGenerationReadinessReport = await buildPdfGenerationReadinessReport(walk);
  const spreadsheetReadinessReport = await buildSpreadsheetReadinessReport(walk);
  const chartVisualizationReadinessReport = await buildChartVisualizationReadinessReport(walk);
  const markdownCodeRenderingReadinessReport = await buildMarkdownCodeRenderingReadinessReport(walk);
  const notebookReadinessReport = await buildNotebookReadinessReport(walk);
  const mapVisualizationReadinessReport = await buildMapVisualizationReadinessReport(walk);
  const diagramRenderingReadinessReport = await buildDiagramRenderingReadinessReport(walk);
  const linkIntegrityReadinessReport = await buildLinkIntegrityReadinessReport(walk);
  const seoMetadataReadinessReport = await buildSeoMetadataReadinessReport(walk);
  const pwaReadinessReport = await buildPwaReadinessReport(walk);
  const browserCompatibilityReadinessReport = await buildBrowserCompatibilityReadinessReport(walk);
  const browserExtensionReadinessReport = await buildBrowserExtensionReadinessReport(walk);
  const envValidationReadinessReport = await buildEnvValidationReadinessReport(walk);
  const securityHeadersReadinessReport = await buildSecurityHeadersReadinessReport(walk);
  const graphqlReadinessReport = await buildGraphqlReadinessReport(walk);
  const cliReadinessReport = await buildCliReadinessReport(walk);
  const terminalUiReadinessReport = await buildTerminalUiReadinessReport(walk);
  const stateMachineReadinessReport = await buildStateMachineReadinessReport(walk);
  const animationReadinessReport = await buildAnimationReadinessReport(walk);
  const dragAndDropReadinessReport = await buildDragAndDropReadinessReport(walk);
  const richTextEditorReadinessReport = await buildRichTextEditorReadinessReport(walk);
  const commandPaletteReadinessReport = await buildCommandPaletteReadinessReport(walk);
  const guidedTourReadinessReport = await buildGuidedTourReadinessReport(walk);
  const dataTableReadinessReport = await buildDataTableReadinessReport(walk);
  const calendarReadinessReport = await buildCalendarReadinessReport(walk);
  const dialogReadinessReport = await buildDialogReadinessReport(walk);
  const popoverTooltipReadinessReport = await buildPopoverTooltipReadinessReport(walk);
  const menuDropdownReadinessReport = await buildMenuDropdownReadinessReport(walk);
  const toastSnackbarReadinessReport = await buildToastSnackbarReadinessReport(walk);
  const tabsAccordionReadinessReport = await buildTabsAccordionReadinessReport(walk);
  const checkboxRadioSwitchReadinessReport = await buildCheckboxRadioSwitchReadinessReport(walk);
  const sliderProgressReadinessReport = await buildSliderProgressReadinessReport(walk);
  const selectComboboxReadinessReport = await buildSelectComboboxReadinessReport(walk);
  const toolbarToggleReadinessReport = await buildToolbarToggleReadinessReport(walk);
  const scrollAreaReadinessReport = await buildScrollAreaReadinessReport(walk);
  const avatarReadinessReport = await buildAvatarReadinessReport(walk);
  const pinInputReadinessReport = await buildPinInputReadinessReport(walk);
  const paginationReadinessReport = await buildPaginationReadinessReport(walk);
  const numberInputReadinessReport = await buildNumberInputReadinessReport(walk);
  const ratingGroupReadinessReport = await buildRatingGroupReadinessReport(walk);
  const colorPickerReadinessReport = await buildColorPickerReadinessReport(walk);
  const splitterReadinessReport = await buildSplitterReadinessReport(walk);
  const tagsInputReadinessReport = await buildTagsInputReadinessReport(walk);
  const clipboardReadinessReport = await buildClipboardReadinessReport(walk);
  const qrCodeReadinessReport = await buildQrCodeReadinessReport(walk);
  const timerReadinessReport = await buildTimerReadinessReport(walk);
  const stepsReadinessReport = await buildStepsReadinessReport(walk);
  const carouselReadinessReport = await buildCarouselReadinessReport(walk);
  const treeViewReadinessReport = await buildTreeViewReadinessReport(walk);
  const collapsibleReadinessReport = await buildCollapsibleReadinessReport(walk);
  const editableReadinessReport = await buildEditableReadinessReport(walk);
  const passwordInputReadinessReport = await buildPasswordInputReadinessReport(walk);
  const signaturePadReadinessReport = await buildSignaturePadReadinessReport(walk);
  const angleSliderReadinessReport = await buildAngleSliderReadinessReport(walk);
  const cascadeSelectReadinessReport = await buildCascadeSelectReadinessReport(walk);
  const asyncListReadinessReport = await buildAsyncListReadinessReport(walk);
  const imageCropperReadinessReport = await buildImageCropperReadinessReport(walk);
  const listboxReadinessReport = await buildListboxReadinessReport(walk);
  const datePickerReadinessReport = await buildDatePickerReadinessReport(walk);
  const marqueeReadinessReport = await buildMarqueeReadinessReport(walk);
  const tocReadinessReport = await buildTocReadinessReport(walk);
  const floatingPanelReadinessReport = await buildFloatingPanelReadinessReport(walk);
  const drawerReadinessReport = await buildDrawerReadinessReport(walk);
  const hoverCardReadinessReport = await buildHoverCardReadinessReport(walk);
  const navigationMenuReadinessReport = await buildNavigationMenuReadinessReport(walk);
  const presenceReadinessReport = await buildPresenceReadinessReport(walk);
  const menuReadinessReport = await buildMenuReadinessReport(walk);
  const tooltipReadinessReport = await buildTooltipReadinessReport(walk);
  const llmReadinessReport = await buildLlmReadinessReport(walk);
  const llmEvalReadinessReport = await buildLlmEvalReadinessReport(walk);
  const llmObservabilityReadinessReport = await buildLlmObservabilityReadinessReport(walk);
  const vectorDbReadinessReport = await buildVectorDbReadinessReport(walk);
  const searchServiceReadinessReport = await buildSearchServiceReadinessReport(walk);
  const objectStorageReadinessReport = await buildObjectStorageReadinessReport(walk);
  const realtimeCollaborationReadinessReport = await buildRealtimeCollaborationReadinessReport(walk);
  const workflowOrchestrationReadinessReport = await buildWorkflowOrchestrationReadinessReport(walk);
  const openApiClientReadinessReport = await buildOpenApiClientReadinessReport(walk);
  const webhookReadinessReport = await buildWebhookReadinessReport(walk);
  const notificationReadinessReport = await buildNotificationReadinessReport(walk);
  const consentReadinessReport = await buildConsentReadinessReport(walk);
  const privacyReadinessReport = await buildPrivacyReadinessReport(walk);
  const serverFrameworkReadinessReport = await buildServerFrameworkReadinessReport(walk);
  const rpcReadinessReport = await buildRpcReadinessReport(walk);
  const workspaceGraphReadinessReport = await buildWorkspaceGraphReadinessReport(walk);
  const scaffoldingReadinessReport = await buildScaffoldingReadinessReport(walk);
  const schedulerReadinessReport = await buildSchedulerReadinessReport(walk);
  const buildToolReadinessReport = await buildBuildToolReadinessReport(walk);
  const stylingReadinessReport = await buildStylingReadinessReport(walk);
  const visualRegressionReadinessReport = await buildVisualRegressionReadinessReport(walk);
  const infrastructureReadinessReport = await buildInfrastructureReadinessReport(walk);
  const iacDriftReadinessReport = await buildIacDriftReadinessReport(walk);
  const deploymentReadinessReport = await buildDeploymentReadinessReport(walk);
  const serverlessReadinessReport = await buildServerlessReadinessReport(walk);
  const mobileReadinessReport = await buildMobileReadinessReport(walk);
  const desktopReadinessReport = await buildDesktopReadinessReport(walk);
  const edgeReadinessReport = await buildEdgeReadinessReport(walk);
  const composeReadinessReport = await buildComposeReadinessReport(walk);
  const devContainerReadinessReport = await buildDevContainerReadinessReport(walk);
  const kubernetesReadinessReport = await buildKubernetesReadinessReport(walk);
  const gitopsReadinessReport = await buildGitOpsReadinessReport(walk);
  const backupReadinessReport = await buildBackupReadinessReport(walk);
  const incrementalReport = emptyIncrementalReport(coverageReport);
  return { repoMap, languageReport, dependencyReport, purposeReport, architectureReport, folderLessons, fileLessons, coverageReport, evidenceIndexReport, suggestedReadsReport, runtimeEnvironmentReport, interfaceMapReport, symbolMapReport, apiReferenceReport, contextPackReport, mcpHandoffReport, agentMemoryReport, graphQueryReport, tutorialAbstractionReport, decisionRecordReport, dependencyHealthReport, searchIndexReport, learningJournalReport, dailySummaryReport, vibeCodingPromptPackReport, projectActivityReport, codeMetricsReadinessReport, codeOwnershipReadinessReport, largeAssetReadinessReport, licenseRightsReport, sbomReport, securityReadinessReport, sastReadinessReport, dastReadinessReport, threatModelReadinessReport, advisoryReport, scorecardReport, provenanceReport, vexReport, policyGateReport, apiContractReport, consumerContractReadinessReport, observabilityReport, performanceReport, profilingReadinessReport, tracingReadinessReport, debugReadinessReport, crashReportingReadinessReport, incidentResponseReadinessReport, sloReadinessReport, costReadinessReport, progressiveDeliveryReadinessReport, loadTestingReadinessReport, benchmarkReadinessReport, e2eReport, flakyTestReadinessReport, testImpactReadinessReport, testReportingReadinessReport, snapshotReadinessReport, propertyBasedTestingReadinessReport, fuzzReadinessReport, testDataReadinessReport, integrationTestEnvironmentReadinessReport, chaosEngineeringReadinessReport, accessibilityReport, storybookReport, designTokensReport, i18nReport, releaseReadinessReport, secretReadinessReport, secretManagementReadinessReport, containerReadinessReport, containerScanReadinessReport, codeQualityReport, documentationReport, databaseReadinessReport, databaseMigrationReadinessReport, databaseOrmReadinessReport, dataTransformationReadinessReport, dataQualityReadinessReport, dataLineageReadinessReport, dataCatalogReadinessReport, dataAnnotationReadinessReport, lakehouseTableReadinessReport, featureStoreReadinessReport, modelRegistryReadinessReport, experimentTrackingReadinessReport, modelMonitoringReadinessReport, modelServingReadinessReport, modelTrainingReadinessReport, ciCdReport, unitTestReport, coverageReadinessReport, mutationTestingReadinessReport, typecheckReadinessReport, packageManagerReport, gitHooksReport, taskRunnerReport, dependencyUpdateReport, dependencyReviewReadinessReport, lintReadinessReport, formatReadinessReport, commitConventionReport, changelogReadinessReport, bundleAnalysisReport, mockingReadinessReport, dataFetchingReadinessReport, routingReadinessReport, stateManagementReadinessReport, formReadinessReport, authReadinessReport, authorizationReadinessReport, paymentReadinessReport, emailReadinessReport, queueReadinessReport, eventStreamReadinessReport, dataConnectorReadinessReport, semanticLayerReadinessReport, biDashboardReadinessReport, schemaRegistryReadinessReport, streamProcessingReadinessReport, pipelineOrchestrationReadinessReport, serviceMeshReadinessReport, ingressControllerReadinessReport, dnsReadinessReport, certificateReadinessReport, helmReadinessReport, admissionPolicyReadinessReport, apiGatewayReadinessReport, cacheReadinessReport, loggingReadinessReport, featureFlagReadinessReport, rateLimitReadinessReport, errorTrackingReadinessReport, analyticsReadinessReport, httpClientReadinessReport, schemaValidationReadinessReport, dateTimeReadinessReport, idGenerationReadinessReport, imageProcessingReadinessReport, fileUploadReadinessReport, webSocketReadinessReport, realtimeMediaReadinessReport, pdfGenerationReadinessReport, spreadsheetReadinessReport, chartVisualizationReadinessReport, markdownCodeRenderingReadinessReport, notebookReadinessReport, mapVisualizationReadinessReport, diagramRenderingReadinessReport, linkIntegrityReadinessReport, seoMetadataReadinessReport, pwaReadinessReport, browserCompatibilityReadinessReport, browserExtensionReadinessReport, envValidationReadinessReport, securityHeadersReadinessReport, graphqlReadinessReport, cliReadinessReport, terminalUiReadinessReport, stateMachineReadinessReport, animationReadinessReport, dragAndDropReadinessReport, richTextEditorReadinessReport, commandPaletteReadinessReport, guidedTourReadinessReport, dataTableReadinessReport, calendarReadinessReport, dialogReadinessReport, popoverTooltipReadinessReport, menuDropdownReadinessReport, toastSnackbarReadinessReport, tabsAccordionReadinessReport, checkboxRadioSwitchReadinessReport, sliderProgressReadinessReport, selectComboboxReadinessReport, toolbarToggleReadinessReport, scrollAreaReadinessReport, avatarReadinessReport, pinInputReadinessReport, paginationReadinessReport, numberInputReadinessReport, ratingGroupReadinessReport, colorPickerReadinessReport, splitterReadinessReport, tagsInputReadinessReport, clipboardReadinessReport, qrCodeReadinessReport, timerReadinessReport, stepsReadinessReport, carouselReadinessReport, treeViewReadinessReport, collapsibleReadinessReport, editableReadinessReport, passwordInputReadinessReport, signaturePadReadinessReport, angleSliderReadinessReport, cascadeSelectReadinessReport, asyncListReadinessReport, imageCropperReadinessReport, listboxReadinessReport, datePickerReadinessReport, marqueeReadinessReport, tocReadinessReport, floatingPanelReadinessReport, drawerReadinessReport, hoverCardReadinessReport, navigationMenuReadinessReport, presenceReadinessReport, menuReadinessReport, tooltipReadinessReport, llmReadinessReport, llmEvalReadinessReport, llmObservabilityReadinessReport, vectorDbReadinessReport, searchServiceReadinessReport, objectStorageReadinessReport, realtimeCollaborationReadinessReport, workflowOrchestrationReadinessReport, openApiClientReadinessReport, webhookReadinessReport, notificationReadinessReport, consentReadinessReport, privacyReadinessReport, serverFrameworkReadinessReport, rpcReadinessReport, workspaceGraphReadinessReport, scaffoldingReadinessReport, schedulerReadinessReport, buildToolReadinessReport, stylingReadinessReport, visualRegressionReadinessReport, infrastructureReadinessReport, iacDriftReadinessReport, deploymentReadinessReport, serverlessReadinessReport, mobileReadinessReport, desktopReadinessReport, edgeReadinessReport, composeReadinessReport, devContainerReadinessReport, kubernetesReadinessReport, gitopsReadinessReport, backupReadinessReport, componentGraphReport, sourceSnapshotReport, incrementalReport, flowReport, glossary, rebuildRoadmap };
}

function buildFlowReport(fileLessons: FileLesson[], dependencyReport: DependencyReport): FlowReport {
  const starts = fileLessons.filter((file) => /main|index|cli|app|lib|server/i.test(path.basename(file.filePath))).slice(0, 8).map((file) => file.filePath);
  return {
    startPoints: starts,
    cliFlow: ["사용자가 명령어 또는 UI 입력을 제공한다.", "입력 판별(intake)이 source type을 결정한다.", "scanner가 파일과 폴더를 읽는다.", "lesson/quiz/html 생성기가 결과를 저장한다."],
    appFlow: ["Tauri UI가 사용자의 입력을 받는다.", "Rust command가 Node sidecar를 호출한다.", "Node sidecar가 shared core pipeline을 실행한다.", "HTML preview와 session list가 갱신된다."],
    dataFlow: dependencyReport.manifests.length > 0 ? dependencyReport.manifests.map((manifest) => `${manifest.filePath} -> dependency report`) : ["source files -> analysis JSON -> Markdown -> HTML"],
    mermaid: "flowchart LR\n  Input[User input] --> Intake\n  Intake --> Scan\n  Scan --> Lessons\n  Lessons --> Quiz\n  Quiz --> WrongNotes\n  WrongNotes --> HTML"
  };
}

function buildDependencyHealthReport(fileLessons: FileLesson[]): DependencyHealthReport {
  const fileSet = new Set(fileLessons.map((lesson) => lesson.filePath));
  const resolvedEdges: DependencyHealthReport["localDependencyEdges"] = [];
  const unresolvedEdges: DependencyHealthReport["localDependencyEdges"] = [];

  for (const lesson of fileLessons) {
    for (const importText of lesson.keyImports.filter(isRelativeImport)) {
      const resolved = resolveLocalImport(lesson.filePath, importText, fileSet);
      const edge = {
        fromFile: lesson.filePath,
        toFile: resolved ?? unresolvedLocalPath(lesson.filePath, importText),
        importText,
        dependencyType: resolved ? "local-import" as const : "unresolved-local-import" as const,
        lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
        sourceHref: `source/${encodedPath(lesson.filePath)}`
      };
      if (resolved) resolvedEdges.push(edge);
      else unresolvedEdges.push(edge);
    }
  }

  const outgoing = new Map(fileLessons.map((lesson) => [lesson.filePath, [] as string[]]));
  const incoming = new Map(fileLessons.map((lesson) => [lesson.filePath, [] as string[]]));
  for (const edge of resolvedEdges) {
    outgoing.get(edge.fromFile)?.push(edge.toFile);
    incoming.get(edge.toFile)?.push(edge.fromFile);
  }

  const cycles = detectDependencyCycles(outgoing).slice(0, 8).map((files, index) => ({
    id: `cycle-${index + 1}`,
    files,
    severity: "error" as const,
    suggestion: "dependency-cruiser의 no-circular 규칙처럼 책임을 나누거나 dependency inversion으로 한쪽 방향 의존성으로 바꾸세요."
  }));
  const orphanModules = fileLessons
    .filter((lesson) => isDependencyHealthModule(lesson.filePath))
    .filter((lesson) => (incoming.get(lesson.filePath)?.length ?? 0) === 0 && (outgoing.get(lesson.filePath)?.length ?? 0) === 0)
    .slice(0, 12)
    .map((lesson) => ({
      filePath: lesson.filePath,
      reason: "다른 핵심 파일에서 import하지 않고 이 파일도 핵심 파일을 import하지 않아 고립된 모듈 후보입니다.",
      lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
      sourceHref: `source/${encodedPath(lesson.filePath)}`
    }));
  const ruleViolations: DependencyHealthReport["ruleViolations"] = [
    ...cycles.map((cycle) => ({
      ruleName: "no-circular",
      severity: "error" as const,
      fromFile: cycle.files[0] ?? "unknown",
      toFile: cycle.files[1] ?? cycle.files[0] ?? null,
      message: `Circular dependency path: ${cycle.files.join(" -> ")}`,
      suggestion: cycle.suggestion
    })),
    ...orphanModules.map((module) => ({
      ruleName: "no-orphans",
      severity: "warn" as const,
      fromFile: module.filePath,
      toFile: null,
      message: `${module.filePath} is not connected to the local dependency graph.`,
      suggestion: "사용 중인 entry/config/test 파일이면 예외로 문서화하고, 아니라면 제거 또는 연결 여부를 검토하세요."
    })),
    ...unresolvedEdges.slice(0, 12).map((edge) => ({
      ruleName: "no-unresolved-local",
      severity: "warn" as const,
      fromFile: edge.fromFile,
      toFile: edge.toFile,
      message: `${edge.importText} could not be resolved inside the analyzed lesson files.`,
      suggestion: "확장자, index 파일, alias 설정, 또는 RepoTutor 핵심 파일 선정 범위를 확인하세요."
    }))
  ];
  const fanIn = rankFan(incoming);
  const fanOut = rankFan(outgoing);
  const graphMetrics = {
    nodeCount: fileLessons.length,
    edgeCount: resolvedEdges.length,
    maxFanIn: fanIn[0]?.count ?? 0,
    maxFanOut: fanOut[0]?.count ?? 0,
    topFanIn: fanIn.slice(0, 8),
    topFanOut: fanOut.slice(0, 8)
  };

  return {
    summary: `dependency-cruiser식 dependency health report: 핵심 파일 ${fileLessons.length}개에서 로컬 의존성 ${resolvedEdges.length}개, 순환 ${cycles.length}개, 고아 모듈 ${orphanModules.length}개, 미해결 로컬 import ${unresolvedEdges.length}개를 확인했습니다.`,
    sourcePattern: "dependency-cruiser no-circular no-orphans forbidden rules dependency graph validation",
    totalLocalDependencies: resolvedEdges.length,
    localDependencyEdges: [...resolvedEdges, ...unresolvedEdges],
    cycles,
    orphanModules,
    ruleViolations,
    graphMetrics,
    learnerNextSteps: [
      "cycles가 있으면 no-circular 항목의 파일 순서를 따라가며 한 방향 의존성으로 바꿀 수 있는지 확인하세요.",
      "orphanModules는 의도된 entry/config/test 예외인지, 실제로 제거 가능한 죽은 코드인지 구분하세요.",
      "topFanIn과 topFanOut이 큰 파일은 변경 영향도가 크므로 파일 수업과 원본을 함께 열어 책임을 나누세요."
    ]
  };
}

function buildProjectActivityReport(
  context: AnalysisContext,
  sourceSnapshotReport: SourceSnapshotReport,
  fileLessons: FileLesson[],
  dependencyHealthReport: DependencyHealthReport,
  decisionRecordReport: DecisionRecordReport
): ProjectActivityReport {
  const snapshotFiles = new Map(sourceSnapshotReport.files.map((file) => [file.filePath, file]));
  const fanIn = new Map(dependencyHealthReport.graphMetrics.topFanIn.map((item) => [item.filePath, item.count]));
  const fanOut = new Map(dependencyHealthReport.graphMetrics.topFanOut.map((item) => [item.filePath, item.count]));
  for (const edge of dependencyHealthReport.localDependencyEdges) {
    if (edge.dependencyType === "local-import") {
      fanOut.set(edge.fromFile, Math.max(fanOut.get(edge.fromFile) ?? 0, 1));
      fanIn.set(edge.toFile, Math.max(fanIn.get(edge.toFile) ?? 0, 1));
    }
  }

  const hotspotCandidates = fileLessons
    .map((lesson) => {
      const snapshotFile = snapshotFiles.get(lesson.filePath);
      const sizeKb = (snapshotFile?.size ?? 0) / 1024;
      const localImportCount = lesson.keyImports.filter(isRelativeImport).length;
      const externalImportCount = lesson.keyImports.length - localImportCount;
      const evidenceCount = lesson.sourceEvidence.length;
      const inbound = fanIn.get(lesson.filePath) ?? 0;
      const outbound = fanOut.get(lesson.filePath) ?? 0;
      const exportedSurface = lesson.keyExports.length;
      const entryWeight = lesson.executionFlowPosition.toLowerCase().includes("entry") ? 4 : 0;
      const score = Number((sizeKb + inbound * 3 + outbound * 2 + localImportCount * 1.5 + exportedSurface * 1.2 + evidenceCount * 0.5 + entryWeight).toFixed(2));
      const signals = [
        `${Math.round(sizeKb * 10) / 10} KiB generated session \`source/\` snapshot size`,
        `${inbound} fan-in / ${outbound} fan-out static dependency signal`,
        `${localImportCount} local imports / ${externalImportCount} external imports`,
        `${exportedSurface} exported symbols / ${evidenceCount} source evidence snippets`
      ];
      if (entryWeight > 0) signals.push("entry-like execution flow position");
      return {
        filePath: lesson.filePath,
        score,
        reason: "정적 파일 크기, import fan-in/fan-out, export surface, source evidence를 합산한 review hotspot 후보입니다.",
        signals,
        lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
        sourceHref: `source/${encodedPath(lesson.filePath)}`
      };
    })
    .sort((a, b) => b.score - a.score || a.filePath.localeCompare(b.filePath))
    .slice(0, 12);

  const lessonByPath = new Map(fileLessons.map((lesson) => [lesson.filePath, lesson]));
  const deadCodeCandidates = dependencyHealthReport.orphanModules.map((module) => {
    const lesson = lessonByPath.get(module.filePath);
    const signalCount = (lesson?.keyExports.length ?? 0) + (lesson?.keyImports.length ?? 0) + (lesson?.sourceEvidence.length ?? 0);
    const confidence = Number(Math.min(0.95, 0.45 + (signalCount === 0 ? 0.3 : 0.1) + (dependencyHealthReport.ruleViolations.some((violation) => violation.fromFile === module.filePath && violation.ruleName === "no-orphans") ? 0.2 : 0)).toFixed(2));
    return {
      filePath: module.filePath,
      confidence,
      reason: `${module.reason} Git history가 없는 학습 snapshot에서는 실제 사용 여부를 단정하지 않고 검토 후보로만 표시합니다.`,
      relatedHref: module.lessonHref,
      sourceHref: module.sourceHref
    };
  });

  const decisionPrompts = [
    ...hotspotCandidates.slice(0, 4).map((candidate) => ({
      question: `${candidate.filePath} 같은 hotspot 후보를 바꿀 때 어떤 아키텍처 결정을 먼저 확인해야 하나요?`,
      trigger: `static hotspot score ${candidate.score}`,
      relatedHref: candidate.lessonHref
    })),
    ...decisionRecordReport.records.slice(0, 4).map((record) => ({
      question: `${record.title} 결정은 현재 분석된 파일 구조와 여전히 맞나요?`,
      trigger: `${record.status} decision in ${record.scope}`,
      relatedHref: `html/decision-records.html#${htmlAnchor(record.id)}`
    }))
  ].slice(0, 8);

  const reviewQueues: ProjectActivityReport["reviewQueues"] = [
    {
      queue: "hotspot-review",
      purpose: "fan-in/fan-out, 크기, export surface가 큰 파일을 먼저 읽고 변경 영향도를 확인합니다.",
      items: hotspotCandidates.slice(0, 5).map((candidate) => ({
        target: candidate.filePath,
        action: "파일 수업과 원본을 열어 책임, import 방향, test gap을 확인합니다.",
        why: `static hotspot score ${candidate.score}; ${candidate.signals[1]}`,
        relatedHref: candidate.lessonHref
      }))
    },
    {
      queue: "dead-code-review",
      purpose: "dependency-cruiser식 no-orphans 후보를 entry/config/test 예외와 실제 제거 후보로 분리합니다.",
      items: deadCodeCandidates.slice(0, 5).map((candidate) => ({
        target: candidate.filePath,
        action: "사용 중인 진입점인지 확인하고, 아니라면 제거 또는 연결을 검토합니다.",
        why: `dead-code confidence ${candidate.confidence}; ${candidate.reason}`,
        relatedHref: candidate.relatedHref
      }))
    },
    {
      queue: "decision-review",
      purpose: "변경 전에 관련 결정 기록과 ungoverned hotspot 후보를 확인합니다.",
      items: decisionPrompts.slice(0, 5).map((prompt) => ({
        target: prompt.trigger,
        action: prompt.question,
        why: "Repowise decision intelligence처럼 위험 파일과 결정 근거를 함께 보게 합니다.",
        relatedHref: prompt.relatedHref
      }))
    }
  ];

  const historyMode = context.commitHash || context.branch ? "git-metadata" : "snapshot-only";
  const historyReason = historyMode === "git-metadata"
    ? "학습 세션 생성 전에 branch/commit 메타데이터는 보존했지만, 안전한 복사본에서는 .git 디렉터리를 제거하므로 전체 churn, ownership, co-change history는 계산하지 않습니다."
    : "학습 세션 소스에는 Git 히스토리가 없어서 생성된 세션 `source/` 스냅샷과 정적 dependency/evidence 신호만 사용합니다.";

  return {
    summary: `Repowise식 project activity report: ${sourceSnapshotReport.totalFiles}개 파일 snapshot에서 hotspot 후보 ${hotspotCandidates.length}개, dead-code 후보 ${deadCodeCandidates.length}개, decision prompt ${decisionPrompts.length}개를 정리했습니다.`,
    sourcePattern: "Repowise git analytics code health hotspots ownership co-change dead code architectural decisions MCP risk",
    historyAvailability: {
      mode: historyMode,
      reason: historyReason,
      sourceType: context.sourceType ?? null,
      sourceUrl: context.sourceUrl ?? null,
      localSourcePath: context.localSourcePath ?? null,
      branch: context.branch ?? null,
      commitHash: context.commitHash ?? null
    },
    activitySignals: [
      {
        label: "Source snapshot",
        value: `${sourceSnapshotReport.totalFiles} files / ${sourceSnapshotReport.files.reduce((sum, file) => sum + file.size, 0)} bytes`,
        explanation: "세션 생성 시점의 파일 크기와 SHA-256 snapshot을 activity 기준선으로 사용합니다.",
        relatedHref: "html/incremental.html"
      },
      {
        label: "Git metadata",
        value: `${context.branch ?? "unknown"} @ ${context.commitHash ? context.commitHash.slice(0, 12) : "unknown"}`,
        explanation: historyReason,
        relatedHref: "session.json"
      },
      {
        label: "Dependency graph health",
        value: `${dependencyHealthReport.totalLocalDependencies} localDependencyEdges / ${dependencyHealthReport.orphanModules.length} orphanModules`,
        explanation: "정적 import 그래프에서 변경 영향도와 dead-code 검토 후보를 가져옵니다.",
        relatedHref: "html/dependency-health.html"
      },
      {
        label: "Decision coverage",
        value: `${decisionRecordReport.records.length} decision records / ${Object.keys(decisionRecordReport.statusCounts).length} statuses`,
        explanation: "위험 파일을 바꾸기 전에 읽을 architecture decision 후보를 연결합니다.",
        relatedHref: "html/decision-records.html"
      }
    ],
    hotspotCandidates,
    deadCodeCandidates,
    reviewQueues,
    architectureDecisionPrompts: decisionPrompts,
    learnerNextSteps: [
      "hotspot-review queue의 첫 파일을 열고 fan-in/fan-out 방향과 source evidence를 대조하세요.",
      "dead-code-review queue는 삭제 단정이 아니라 검토 후보입니다. entry/config/test 예외를 먼저 확인하세요.",
      "Git history가 필요한 churn, ownership, co-change 분석은 원본 Git 저장소에서 별도 full-history 분석으로 보강하세요.",
      "decision-review queue의 질문을 실제 ADR 또는 팀 결정 기록으로 승격할지 판단하세요."
    ]
  };
}

async function buildScorecardReport(
  walk: WalkResult,
  licenseRightsReport: LicenseRightsReport,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport
): Promise<ScorecardReport> {
  const securityPolicyFiles = walk.files.filter((file) => /(^|\/)(SECURITY|security)\.md$/i.test(file.relPath));
  const workflowFiles = walk.files.filter((file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file.relPath));
  const testFiles = walk.files.filter((file) => /(^|\/)(__tests__|tests?|spec)\/|(\.test|\.spec)\.[cm]?[jt]sx?$/i.test(file.relPath));
  const dependencyUpdateFiles = walk.files.filter((file) => /(^|\/)(dependabot\.ya?ml|renovate\.json|renovate\.json5|\.renovaterc(?:\.json)?|\.github\/renovate\.json)$/i.test(file.relPath));
  const sastFiles = walk.files.filter((file) => /(^|\/)(codeql|semgrep|snyk|sonar-project|\.snyk|\.semgrep)\b/i.test(file.relPath));
  const binaryArtifacts = walk.files.filter((file) => /\.(exe|dll|dylib|so|class|pyc|jar|war|ear|min\.js)$/i.test(file.relPath));
  const packageRanges = await packageDependencyRangeSignals(walk);
  const scriptSignals = await packageJsonScriptSignals(walk);
  const workflowSignals = await workflowSafetySignals(workflowFiles);
  const hasLicenseEvidence = Boolean(licenseRightsReport.detectedProjectLicense.spdxId);
  const hasPackageInventory = sbomReport.packageArtifacts.length > 0;
  const hasLockfile = sbomReport.fileArtifacts.some((artifact) => artifact.artifactKind === "lockfile");
  const dangerousWorkflowEvidence = workflowSignals.dangerousFiles.length > 0
    ? `${workflowSignals.dangerousFiles.join(", ")} workflow uses pull_request_target with checkout/script patterns.`
    : workflowFiles.length > 0
      ? `${workflowFiles.length} workflow file(s) found without the dangerous static pattern.`
      : "No GitHub workflow files were detected, so dangerous workflow analysis is inconclusive.";

  const checks: ScorecardReport["checks"] = [
    {
      name: "Maintained",
      score: walk.files.length > 0 ? 8 : 0,
      status: walk.files.length > 0 ? "pass" : "fail",
      risk: "low",
      evidence: walk.files.length > 0 ? `${walk.files.length} safe source file(s) are present in the study snapshot.` : "No source files were available in the safe snapshot.",
      remediation: "Keep release, issue, and commit freshness checks in the original repository before depending on this project.",
      relatedHref: "html/project-activity.html"
    },
    {
      name: "License",
      score: hasLicenseEvidence ? 10 : licenseRightsReport.packageLicenseSignals.length > 0 ? 4 : 0,
      status: hasLicenseEvidence ? "pass" : licenseRightsReport.packageLicenseSignals.length > 0 ? "partial" : "fail",
      risk: "medium",
      evidence: hasLicenseEvidence ? `Project license detected as ${licenseRightsReport.detectedProjectLicense.spdxId}.` : licenseRightsReport.packageLicenseSignals.length > 0 ? "Package metadata has license hints, but no project-level license was detected." : "No project license evidence was detected.",
      remediation: "Add or verify a project-level LICENSE file and keep package metadata aligned.",
      relatedHref: "html/license-rights.html"
    },
    {
      name: "SBOM",
      score: hasPackageInventory && hasLockfile ? 10 : hasPackageInventory ? 6 : 0,
      status: hasPackageInventory && hasLockfile ? "pass" : hasPackageInventory ? "partial" : "fail",
      risk: "medium",
      evidence: `${sbomReport.packageArtifacts.length} package artifact(s), ${sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile").length} lockfile artifact(s).`,
      remediation: "Generate a full CycloneDX/SPDX/Syft SBOM when distribution or security review requires resolved components.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "Security-Policy",
      score: securityPolicyFiles.length > 0 ? 10 : 0,
      status: securityPolicyFiles.length > 0 ? "pass" : "fail",
      risk: "high",
      evidence: securityPolicyFiles.length > 0 ? `Security policy file(s): ${securityPolicyFiles.map((file) => file.relPath).join(", ")}.` : "No SECURITY.md file was detected.",
      remediation: "Add SECURITY.md with supported versions and vulnerability disclosure instructions.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "CI-Tests",
      score: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? 10 : testFiles.length > 0 || scriptSignals.testScripts > 0 ? 5 : 0,
      status: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? "pass" : testFiles.length > 0 || scriptSignals.testScripts > 0 ? "partial" : "fail",
      risk: "low",
      evidence: `${workflowFiles.length} workflow file(s), ${scriptSignals.testScripts} package test script(s), ${testFiles.length} test file(s).`,
      remediation: "Check in test commands and run them in CI on every pull request.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Pinned-Dependencies",
      score: packageRanges.total === 0 ? null : packageRanges.unpinned === 0 && hasLockfile ? 10 : packageRanges.unpinned === 0 ? 7 : 2,
      status: packageRanges.total === 0 ? "unknown" : packageRanges.unpinned === 0 && hasLockfile ? "pass" : packageRanges.unpinned === 0 ? "partial" : "fail",
      risk: "medium",
      evidence: packageRanges.total === 0 ? "No supported dependency range fields were found." : `${packageRanges.pinned}/${packageRanges.total} dependency range(s) look exact; unpinned examples: ${packageRanges.examples.join(", ") || "none"}.`,
      remediation: "Pin direct dependency ranges or keep a package-manager lockfile so resolved versions are reviewable.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "Dependency-Update-Tool",
      score: dependencyUpdateFiles.length > 0 ? 10 : 0,
      status: dependencyUpdateFiles.length > 0 ? "pass" : "fail",
      risk: "medium",
      evidence: dependencyUpdateFiles.length > 0 ? `Dependency update config(s): ${dependencyUpdateFiles.map((file) => file.relPath).join(", ")}.` : "No Dependabot or Renovate config was detected.",
      remediation: "Add Dependabot or Renovate so dependency updates arrive as reviewable pull requests.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "SAST",
      score: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? 10 : 0,
      status: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? "pass" : "fail",
      risk: "medium",
      evidence: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? `SAST signal(s): ${[...sastFiles.map((file) => file.relPath), ...workflowSignals.sastMentions].join(", ")}.` : "No CodeQL, Semgrep, Snyk, Sonar, or similar SAST signal was detected.",
      remediation: "Add a SAST workflow or document an equivalent static analysis step.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Binary-Artifacts",
      score: binaryArtifacts.length === 0 ? 10 : 0,
      status: binaryArtifacts.length === 0 ? "pass" : "fail",
      risk: "high",
      evidence: binaryArtifacts.length === 0 ? "No generated binary artifact extensions were detected in the safe snapshot." : `Binary-like artifact(s): ${binaryArtifacts.slice(0, 8).map((file) => file.relPath).join(", ")}.`,
      remediation: "Remove generated binaries from source or document reproducible build provenance.",
      relatedHref: "html/files.html"
    },
    {
      name: "Dangerous-Workflow",
      score: workflowFiles.length === 0 ? null : workflowSignals.dangerousFiles.length === 0 ? 10 : 0,
      status: workflowFiles.length === 0 ? "unknown" : workflowSignals.dangerousFiles.length === 0 ? "pass" : "fail",
      risk: "high",
      evidence: dangerousWorkflowEvidence,
      remediation: "Avoid pull_request_target workflows that check out or execute untrusted pull request code.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Branch-Protection",
      score: null,
      status: "unknown",
      risk: "high",
      evidence: "Branch protection requires live source-host provider settings and cannot be proven from the generated session `source/` snapshot.",
      remediation: "Verify branch rules or rulesets in GitHub/GitLab with required reviews, status checks, and force-push protection.",
      relatedHref: "html/project-activity.html"
    },
    {
      name: "Code-Review",
      score: null,
      status: "unknown",
      risk: "high",
      evidence: "Code review enforcement requires provider pull request or merge request history.",
      remediation: "Verify required human review on protected branches in the original repository.",
      relatedHref: "html/project-activity.html"
    }
  ];

  const categoryScores: ScorecardReport["categoryScores"] = [
    scorecardCategory("source", ["Maintained", "Binary-Artifacts", "License"], checks, "Source hygiene combines maintained source, binary artifact absence, and license evidence.", "html/files.html"),
    scorecardCategory("build", ["CI-Tests", "Dangerous-Workflow"], checks, "Build hygiene checks whether tests and workflow safety are visible.", "html/security-readiness.html"),
    scorecardCategory("dependency", ["SBOM", "Pinned-Dependencies", "Dependency-Update-Tool"], checks, "Dependency hygiene combines inventory, pinning, lockfiles, and update automation.", "html/sbom.html"),
    scorecardCategory("security", ["Security-Policy", "SAST", "Branch-Protection", "Code-Review"], checks, "Security hygiene separates local evidence from provider-only controls.", "html/security-readiness.html"),
    scorecardCategory("maintenance", ["Maintained", "Dependency-Update-Tool"], checks, "Maintenance hygiene tracks whether the project leaves future upkeep signals.", "html/project-activity.html")
  ];

  const policyFindings: ScorecardReport["policyFindings"] = [
    {
      policy: "Project has discoverable license evidence",
      result: hasLicenseEvidence ? "pass" : "fail",
      evidence: hasLicenseEvidence ? `Detected ${licenseRightsReport.detectedProjectLicense.spdxId}.` : "License Rights report could not detect a project license.",
      relatedHref: "html/license-rights.html"
    },
    {
      policy: "Project has dependency inventory",
      result: hasPackageInventory ? "pass" : "fail",
      evidence: hasPackageInventory ? `${sbomReport.packageArtifacts.length} package artifact(s) recorded.` : "No package artifacts recorded.",
      relatedHref: "html/sbom.html"
    },
    {
      policy: "Project has security disclosure policy",
      result: securityPolicyFiles.length > 0 ? "pass" : "fail",
      evidence: securityPolicyFiles.length > 0 ? securityPolicyFiles.map((file) => file.relPath).join(", ") : "No SECURITY.md file detected.",
      relatedHref: "html/security-readiness.html"
    },
    {
      policy: "Project has automated test signal",
      result: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? "pass" : testFiles.length > 0 || scriptSignals.testScripts > 0 ? "review" : "fail",
      evidence: `${workflowFiles.length} workflow file(s), ${scriptSignals.testScripts} test script(s), ${testFiles.length} test file(s).`,
      relatedHref: "html/security-readiness.html"
    },
    {
      policy: "Provider controls require live verification",
      result: "review",
      evidence: "Branch-Protection and Code-Review are intentionally unknown in a safe local snapshot.",
      relatedHref: "html/project-activity.html"
    }
  ];

  const riskQueue = scorecardRiskQueue(checks, securityReadinessReport);
  const structuredResults: ScorecardReport["structuredResults"] = checks.map((check) => ({
    checkName: check.name,
    probe: `${check.name} static evidence probe`,
    outcome: check.status === "unknown" ? "unknown" : check.status === "fail" ? "negative" : "positive",
    evidence: check.evidence
  }));

  const aggregateScore = scorecardWeightedScore(checks);
  return {
    summary: `OpenSSF Scorecard식 project scorecard: aggregate ${aggregateScore}/10, checks ${checks.length}개, policy finding ${policyFindings.length}개, risk queue ${riskQueue.length}개를 정적 학습 리포트로 정리했습니다.`,
    sourcePattern: "OpenSSF Scorecard checks score 0-10 risk remediation structured results policy measurement",
    aggregateScore,
    checks,
    categoryScores,
    policyFindings,
    riskQueue,
    structuredResults,
    learnerNextSteps: [
      "unknown check는 실패가 아니라 provider API나 repository history가 필요한 항목입니다.",
      "high risk queue부터 확인하고, 관련 License/SBOM/Security Readiness 리포트의 원본 근거를 대조하세요.",
      "이 리포트는 OpenSSF Scorecard 실행 결과가 아니라 RepoTutor의 정적 학습용 사전 점검입니다.",
      "배포, 의존성 채택, 보안 의사결정에는 원본 repository에서 실제 scorecard 도구를 실행하세요."
    ]
  };
}

function scorecardWeightedScore(checks: ScorecardReport["checks"]): number {
  const weights: Record<ScorecardReport["checks"][number]["risk"], number> = {
    critical: 10,
    high: 7.5,
    medium: 5,
    low: 2.5,
    unknown: 1
  };
  const scored = checks.filter((check) => check.score !== null);
  const totalWeight = scored.reduce((sum, check) => sum + weights[check.risk], 0);
  if (totalWeight === 0) return 0;
  const weighted = scored.reduce((sum, check) => sum + (check.score ?? 0) * weights[check.risk], 0) / totalWeight;
  return Number(weighted.toFixed(1));
}

function scorecardCategory(
  category: ScorecardReport["categoryScores"][number]["category"],
  names: string[],
  checks: ScorecardReport["checks"],
  explanation: string,
  relatedHref: string
): ScorecardReport["categoryScores"][number] {
  const selected = checks.filter((check) => names.includes(check.name) && check.score !== null);
  const score = selected.length === 0 ? null : Number((selected.reduce((sum, check) => sum + (check.score ?? 0), 0) / selected.length).toFixed(1));
  return { category, score, explanation, relatedHref };
}

function scorecardRiskQueue(checks: ScorecardReport["checks"], securityReadinessReport: SecurityReadinessReport): ScorecardReport["riskQueue"] {
  const queue: ScorecardReport["riskQueue"] = [];
  for (const check of checks) {
    if (check.status === "pass") continue;
    const priority = check.risk === "high" || check.risk === "critical" ? "high" : check.risk === "medium" ? "medium" : "low";
    if (check.status === "unknown") {
      queue.push({
        priority: "low",
        checkName: check.name,
        action: `Verify ${check.name} in the original source-host provider.`,
        why: check.evidence,
        relatedHref: check.relatedHref
      });
      continue;
    }
    queue.push({
      priority,
      checkName: check.name,
      action: check.remediation,
      why: check.evidence,
      relatedHref: check.relatedHref
    });
  }
  for (const action of securityReadinessReport.actionQueue.filter((item) => item.priority !== "low").slice(0, 3)) {
    queue.push({
      priority: action.priority,
      checkName: "Security-Readiness",
      action: action.action,
      why: action.why,
      relatedHref: action.relatedHref
    });
  }
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.checkName.localeCompare(b.checkName)).slice(0, 12);
}

function buildProvenanceReport(
  context: AnalysisContext,
  walk: WalkResult,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport,
  sourceSnapshotReport: SourceSnapshotReport
): ProvenanceReport {
  const sourceFileCount = sourceSnapshotReport.totalFiles;
  const lockfileCount = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile").length;
  const containerFiles = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "container");
  const signatureFiles = provenanceFiles(walk, isSignatureMaterialFile);
  const bundleFiles = provenanceFiles(walk, isSigstoreBundleFile);
  const certificateFiles = provenanceFiles(walk, isCertificateMaterialFile);
  const publicKeyFiles = provenanceFiles(walk, isPublicKeyMaterialFile);
  const trustedRootFiles = provenanceFiles(walk, isTrustedRootMaterialFile);
  const attestationFiles = provenanceFiles(walk, isAttestationMaterialFile);
  const slsaFiles = attestationFiles.filter((filePath) => /slsa|provenance|intoto|in-toto|\.link/i.test(filePath));
  const spdxFiles = provenanceFiles(walk, (filePath) => /spdx/i.test(filePath));
  const cyclonedxFiles = provenanceFiles(walk, (filePath) => /cyclonedx|cdx/i.test(filePath));
  const vulnFiles = attestationFiles.filter((filePath) => /vuln|vulnerability/i.test(filePath));
  const hasPackageArtifacts = sbomReport.packageArtifacts.length > 0;
  const vulnerabilityScanner = securityReadinessReport.scannerCoverage.find((scanner) => scanner.scanner === "vulnerability");

  const artifactSignals: ProvenanceReport["artifactSignals"] = [
    {
      artifact: "generated session `source/` snapshot",
      artifactType: "source-snapshot",
      readiness: sourceFileCount > 0 ? "ready" : "missing",
      evidence: sourceFileCount > 0 ? `${sourceFileCount} generated session \`source/\` snapshot text file digest(s) are recorded in source-snapshot-report.json.` : "No generated session `source/` snapshot digest evidence is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      artifact: "package inventory",
      artifactType: "package",
      readiness: hasPackageArtifacts && lockfileCount > 0 ? "ready" : hasPackageArtifacts ? "partial" : "missing",
      evidence: hasPackageArtifacts ? `${sbomReport.packageArtifacts.length} package artifact(s), ${lockfileCount} lockfile artifact(s).` : "No package artifacts are recorded in the SBOM report.",
      relatedHref: "html/sbom.html"
    },
    {
      artifact: "container image",
      artifactType: "container",
      readiness: containerFiles.length > 0 ? "partial" : "missing",
      evidence: containerFiles.length > 0 ? `${containerFiles.length} container build/config file(s) found; a signed image digest still requires an external registry artifact.` : "No Dockerfile or Compose evidence was detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      artifact: "static SBOM report",
      artifactType: "sbom",
      readiness: hasPackageArtifacts ? "ready" : "missing",
      evidence: hasPackageArtifacts ? "RepoTutor generated static SBOM package evidence that can be exported or signed as a blob." : "The static SBOM report has no package artifacts to sign.",
      relatedHref: "html/sbom.html"
    },
    {
      artifact: "release candidate",
      artifactType: "release",
      readiness: sbomReport.packageManifests.length > 0 || context.commitHash ? "partial" : "missing",
      evidence: sbomReport.packageManifests.length > 0 || context.commitHash ? `Release evidence is partial: ${sbomReport.packageManifests.length} package manifest(s), commit ${context.commitHash?.slice(0, 12) ?? "unknown"}.` : "No package manifest or commit metadata is available for release provenance.",
      relatedHref: "html/project-activity.html"
    },
    {
      artifact: "generic source blob",
      artifactType: "blob",
      readiness: sourceFileCount > 0 ? "ready" : "missing",
      evidence: sourceFileCount > 0 ? "Any generated markdown, JSON, or source digest can be treated as a cosign sign-blob candidate." : "No file digest evidence exists for blob signing.",
      relatedHref: "html/files.html"
    }
  ];

  const signatureSignals: ProvenanceReport["signatureSignals"] = [
    {
      material: "signature",
      readiness: signatureFiles.length > 0 ? "present" : "missing",
      evidence: signatureFiles.length > 0 ? `Detached signature file(s): ${signatureFiles.join(", ")}.` : "No detached signature file such as .sig was detected.",
      relatedHref: signatureFiles[0] ? `source/${encodedPath(signatureFiles[0])}` : "html/provenance.html"
    },
    {
      material: "bundle",
      readiness: bundleFiles.length > 0 ? "present" : "missing",
      evidence: bundleFiles.length > 0 ? `Sigstore bundle file(s): ${bundleFiles.join(", ")}.` : "No Sigstore bundle was detected; bundles are the preferred offline verification material.",
      relatedHref: bundleFiles[0] ? `source/${encodedPath(bundleFiles[0])}` : "html/provenance.html"
    },
    {
      material: "certificate",
      readiness: certificateFiles.length > 0 ? "present" : "missing",
      evidence: certificateFiles.length > 0 ? `Certificate material file(s): ${certificateFiles.join(", ")}.` : "No certificate material was detected outside a possible external bundle.",
      relatedHref: certificateFiles[0] ? `source/${encodedPath(certificateFiles[0])}` : "html/provenance.html"
    },
    {
      material: "public-key",
      readiness: publicKeyFiles.length > 0 ? "present" : "missing",
      evidence: publicKeyFiles.length > 0 ? `Public key file(s): ${publicKeyFiles.join(", ")}.` : "No public key material such as cosign.pub was detected.",
      relatedHref: publicKeyFiles[0] ? `source/${encodedPath(publicKeyFiles[0])}` : "html/provenance.html"
    },
    {
      material: "trusted-root",
      readiness: trustedRootFiles.length > 0 ? "present" : "external",
      evidence: trustedRootFiles.length > 0 ? `Trusted root file(s): ${trustedRootFiles.join(", ")}.` : "Trusted root material usually comes from Sigstore trust-root distribution or an explicit trusted_root.json.",
      relatedHref: trustedRootFiles[0] ? `source/${encodedPath(trustedRootFiles[0])}` : "html/provenance.html"
    },
    {
      material: "transparency-log",
      readiness: bundleFiles.length > 0 ? "present" : "external",
      evidence: bundleFiles.length > 0 ? "A Sigstore bundle can carry transparency log proof for offline verification." : "Transparency log inclusion must be checked through Rekor or a downloaded bundle.",
      relatedHref: bundleFiles[0] ? `source/${encodedPath(bundleFiles[0])}` : "html/provenance.html"
    }
  ];

  const attestationSignals: ProvenanceReport["attestationSignals"] = [
    {
      predicateType: "slsaprovenance",
      readiness: slsaFiles.length > 0 ? "available" : "missing",
      evidence: slsaFiles.length > 0 ? `SLSA/provenance attestation candidate(s): ${slsaFiles.join(", ")}.` : "No SLSA provenance, in-toto, or link attestation file was detected.",
      relatedHref: slsaFiles[0] ? `source/${encodedPath(slsaFiles[0])}` : "html/provenance.html"
    },
    {
      predicateType: "spdx",
      readiness: spdxFiles.length > 0 ? "available" : hasPackageArtifacts ? "partial" : "missing",
      evidence: spdxFiles.length > 0 ? `SPDX artifact(s): ${spdxFiles.join(", ")}.` : hasPackageArtifacts ? "Static SBOM package inventory exists, but no standalone SPDX predicate file was detected." : "No SPDX evidence was detected.",
      relatedHref: spdxFiles[0] ? `source/${encodedPath(spdxFiles[0])}` : "html/sbom.html"
    },
    {
      predicateType: "cyclonedx",
      readiness: cyclonedxFiles.length > 0 ? "available" : hasPackageArtifacts ? "partial" : "missing",
      evidence: cyclonedxFiles.length > 0 ? `CycloneDX artifact(s): ${cyclonedxFiles.join(", ")}.` : hasPackageArtifacts ? "Static SBOM package inventory exists, but no standalone CycloneDX predicate file was detected." : "No CycloneDX evidence was detected.",
      relatedHref: cyclonedxFiles[0] ? `source/${encodedPath(cyclonedxFiles[0])}` : "html/sbom.html"
    },
    {
      predicateType: "vuln",
      readiness: vulnFiles.length > 0 ? "available" : vulnerabilityScanner?.readiness === "missing" ? "missing" : "partial",
      evidence: vulnFiles.length > 0 ? `Vulnerability attestation candidate(s): ${vulnFiles.join(", ")}.` : vulnerabilityScanner ? vulnerabilityScanner.evidence : "No vulnerability scanner readiness evidence is available.",
      relatedHref: vulnFiles[0] ? `source/${encodedPath(vulnFiles[0])}` : "html/security-readiness.html"
    },
    {
      predicateType: "custom",
      readiness: attestationFiles.length > 0 ? "available" : "missing",
      evidence: attestationFiles.length > 0 ? `Generic attestation/predicate file(s): ${attestationFiles.join(", ")}.` : "No generic attestation, predicate, or DSSE envelope file was detected.",
      relatedHref: attestationFiles[0] ? `source/${encodedPath(attestationFiles[0])}` : "html/provenance.html"
    }
  ];

  const identityRequirements: ProvenanceReport["identityRequirements"] = [
    {
      requirement: "artifact digest pinning",
      status: sourceFileCount > 0 || Boolean(context.commitHash) ? "known" : "missing",
      evidence: sourceFileCount > 0 ? `${sourceFileCount} source file digest(s) are available; repository commit is ${context.commitHash?.slice(0, 12) ?? "unknown"}.` : "No digest or commit metadata is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      requirement: "expected certificate identity",
      status: "missing",
      evidence: "Keyless verification requires an expected certificate identity; RepoTutor cannot infer the release identity from a safe local snapshot.",
      relatedHref: "html/provenance.html"
    },
    {
      requirement: "expected OIDC issuer",
      status: "external",
      evidence: "Keyless verification requires the OIDC issuer, commonly https://token.actions.githubusercontent.com for GitHub Actions or another issuer chosen by the publisher.",
      relatedHref: "html/provenance.html"
    },
    {
      requirement: "public key or certificate chain",
      status: publicKeyFiles.length > 0 || certificateFiles.length > 0 ? "known" : "missing",
      evidence: publicKeyFiles.length > 0 || certificateFiles.length > 0 ? `Verification material found: ${[...publicKeyFiles, ...certificateFiles].join(", ")}.` : "No public key or certificate chain material was detected.",
      relatedHref: publicKeyFiles[0] || certificateFiles[0] ? `source/${encodedPath(publicKeyFiles[0] ?? certificateFiles[0])}` : "html/provenance.html"
    },
    {
      requirement: "trusted root and transparency log proof",
      status: trustedRootFiles.length > 0 || bundleFiles.length > 0 ? "known" : "external",
      evidence: trustedRootFiles.length > 0 || bundleFiles.length > 0 ? `Trusted verification evidence found: ${[...trustedRootFiles, ...bundleFiles].join(", ")}.` : "Trusted root and Rekor proof must be fetched or provided outside the generated session `source/` snapshot.",
      relatedHref: trustedRootFiles[0] || bundleFiles[0] ? `source/${encodedPath(trustedRootFiles[0] ?? bundleFiles[0])}` : "html/provenance.html"
    }
  ];

  const riskQueue: ProvenanceReport["riskQueue"] = [];
  if (signatureFiles.length === 0 && bundleFiles.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Create and store a Sigstore bundle or detached signature for release artifacts.",
      why: "Cosign verification needs signature material; a bundle is preferred because it can carry certificate and transparency log proof.",
      relatedHref: "html/provenance.html"
    });
  }
  if (!identityRequirements.some((requirement) => requirement.requirement === "expected certificate identity" && requirement.status === "known")) {
    riskQueue.push({
      priority: "high",
      action: "Document the expected certificate identity and OIDC issuer for keyless verification.",
      why: "Cosign keyless verification should pin identity and issuer, not just accept any valid certificate.",
      relatedHref: "html/provenance.html"
    });
  }
  if (!attestationSignals.some((signal) => signal.readiness === "available")) {
    riskQueue.push({
      priority: "medium",
      action: "Add SLSA, SBOM, or vulnerability attestations for artifacts that will be distributed.",
      why: "Cosign attestations let verifiers check provenance and subject relationship instead of only checking a signature.",
      relatedHref: "html/provenance.html"
    });
  }
  if (containerFiles.length > 0) {
    riskQueue.push({
      priority: "medium",
      action: "Sign and verify container images by digest, not tags.",
      why: "Container config exists, but a mutable tag is not enough provenance evidence.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (publicKeyFiles.length === 0 && certificateFiles.length === 0 && bundleFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Provide a public key, certificate chain, or Sigstore bundle alongside signed artifacts.",
      why: "Offline verification needs trust material available to the verifier.",
      relatedHref: "html/provenance.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real cosign verification outside RepoTutor for release decisions.",
    why: "This report is readiness metadata only and does not query Rekor, validate certificates, or verify signatures.",
    relatedHref: "html/provenance.html"
  });

  return {
    summary: `Cosign식 provenance readiness report: artifact signal ${artifactSignals.length}개, signature material ${signatureSignals.length}개, attestation ${attestationSignals.length}개, identity requirement ${identityRequirements.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Cosign signature bundle attestation transparency log trusted root certificate identity verification",
    artifactSignals,
    signatureSignals,
    attestationSignals,
    identityRequirements,
    verificationCommands: [
      {
        command: "cosign verify-blob <artifact> --bundle <artifact.sigstore.json> --certificate-identity <identity> --certificate-oidc-issuer <issuer>",
        purpose: "Generic blob을 Sigstore bundle, expected identity, OIDC issuer로 검증합니다."
      },
      {
        command: "cosign verify-attestation --type slsaprovenance --certificate-identity <identity> --certificate-oidc-issuer <issuer> <image>",
        purpose: "컨테이너 이미지의 SLSA provenance attestation과 subject 관계를 검증합니다."
      },
      {
        command: "cosign tree <image>",
        purpose: "OCI artifact에 붙은 signature, attestation, SBOM referrer를 확인합니다."
      },
      {
        command: "cosign verify --key cosign.pub <image>@sha256:<digest>",
        purpose: "공개키 기반으로 digest-pinned container image signature를 검증합니다."
      }
    ],
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    learnerNextSteps: [
      "artifact readiness와 signature material을 먼저 대조해 어떤 산출물을 서명해야 하는지 정하세요.",
      "keyless flow는 certificate identity와 OIDC issuer를 반드시 명시해서 검증하세요.",
      "attestation subject가 실제 artifact digest와 연결되는지 원본 registry나 bundle에서 확인하세요.",
      "이 리포트는 Cosign 실행 결과가 아니라 정적 준비도 리포트입니다. 실제 release 판단에는 cosign verify 계열 명령을 실행하세요."
    ]
  };
}

function provenanceFiles(walk: WalkResult, predicate: (filePath: string) => boolean): string[] {
  return walk.files
    .filter((file) => predicate(file.relPath))
    .map((file) => file.relPath)
    .sort((a, b) => a.localeCompare(b));
}

function isSignatureMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "cosign.sig" || base.endsWith(".sig") || base.endsWith(".signature") || base.endsWith(".pem.sig");
}

function isSigstoreBundleFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "bundle.json" || base === "artifact.sigstore.json" || base.endsWith(".sigstore") || base.endsWith(".sigstore.json") || base.endsWith(".bundle") || base.endsWith(".bundle.json");
}

function isCertificateMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base.endsWith(".crt") || base.endsWith(".cert") || base.endsWith(".cer") || (base.endsWith(".pem") && !isPublicKeyMaterialFile(filePath));
}

function isPublicKeyMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "cosign.pub" || base === "public.key" || base === "public_key.pem" || base.endsWith(".pub");
}

function isTrustedRootMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "trusted_root.json" || base === "trusted-root.json" || base === "sigstore-root.json" || base === "root.json";
}

function isAttestationMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return /attestation|predicate|provenance|intoto|in-toto|dsse|slsa/.test(filePath.toLowerCase()) || base.endsWith(".intoto.jsonl") || base.endsWith(".link");
}

async function packageDependencyRangeSignals(walk: WalkResult): Promise<{ total: number; pinned: number; unpinned: number; filePaths: string[]; examples: string[] }> {
  const result = { total: 0, pinned: 0, unpinned: 0, filePaths: [] as string[], examples: [] as string[] };
  const packageJsonFiles = walk.files.filter((file) => path.basename(file.relPath) === "package.json");
  for (const file of packageJsonFiles) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    try {
      const json = JSON.parse(text) as Record<string, Record<string, string> | unknown>;
      for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        const dependencies = json[section];
        if (!dependencies || typeof dependencies !== "object" || Array.isArray(dependencies)) continue;
        result.filePaths.push(file.relPath);
        for (const [name, version] of Object.entries(dependencies as Record<string, string>)) {
          if (typeof version !== "string") continue;
          result.total += 1;
          if (isPinnedDependencyRange(version)) {
            result.pinned += 1;
          } else {
            result.unpinned += 1;
            if (result.examples.length < 5) result.examples.push(`${name}@${version}`);
          }
        }
      }
    } catch {
      // Ignore malformed package manifests in the static readiness pass.
    }
  }
  result.filePaths = [...new Set(result.filePaths)].sort();
  return result;
}

function isPinnedDependencyRange(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /workspace:|file:|link:|git\+|github:|latest|\*|x/i.test(trimmed)) return false;
  if (/^[~^<>!=]/.test(trimmed)) return false;
  if (/\s*\|\|\s*|\s+-\s+/.test(trimmed)) return false;
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(trimmed);
}

async function packageJsonScriptSignals(walk: WalkResult): Promise<{ testScripts: number; scriptFiles: string[] }> {
  const scriptFiles: string[] = [];
  let testScripts = 0;
  for (const file of walk.files.filter((candidate) => path.basename(candidate.relPath) === "package.json")) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    try {
      const json = JSON.parse(text) as { scripts?: Record<string, string> };
      for (const [name, command] of Object.entries(json.scripts ?? {})) {
        if (/test|spec|vitest|jest|mocha|tap|ava|playwright|cypress/i.test(`${name} ${command}`)) {
          testScripts += 1;
          scriptFiles.push(file.relPath);
        }
      }
    } catch {
      // Ignore malformed package manifests in the static readiness pass.
    }
  }
  return { testScripts, scriptFiles: [...new Set(scriptFiles)].sort() };
}

async function workflowSafetySignals(workflowFiles: WalkResult["files"]): Promise<{ dangerousFiles: string[]; sastMentions: string[] }> {
  const dangerousFiles: string[] = [];
  const sastMentions: string[] = [];
  for (const file of workflowFiles) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    if (/pull_request_target/i.test(text) && /(actions\/checkout|github\.event\.pull_request|head_ref|npm\s+(install|ci|test)|yarn|pnpm|pip|bash|sh\s)/i.test(text)) {
      dangerousFiles.push(file.relPath);
    }
    if (/codeql|semgrep|snyk|sonar|static analysis|sast/i.test(text)) {
      sastMentions.push(file.relPath);
    }
  }
  return {
    dangerousFiles: [...new Set(dangerousFiles)].sort(),
    sastMentions: [...new Set(sastMentions)].sort()
  };
}

function isRelativeImport(importText: string): boolean {
  return importText.startsWith("./") || importText.startsWith("../");
}

function resolveLocalImport(fromFile: string, importText: string, fileSet: Set<string>): string | null {
  const base = unresolvedLocalPath(fromFile, importText);
  const candidates = [
    base,
    ...[".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".json"].map((ext) => `${base}${ext}`),
    ...["index.ts", "index.tsx", "index.js", "index.jsx", "index.mjs", "index.cjs", "__init__.py"].map((fileName) => `${base}/${fileName}`)
  ];
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
}

function unresolvedLocalPath(fromFile: string, importText: string): string {
  return path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), importText));
}

function detectDependencyCycles(graph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const seen = new Set<string>();
  for (const start of graph.keys()) {
    walkDependencyCycle(start, start, graph, [], seen, cycles);
  }
  return cycles;
}

function walkDependencyCycle(start: string, current: string, graph: Map<string, string[]>, pathStack: string[], seen: Set<string>, cycles: string[][]): void {
  if (pathStack.length > 30 || cycles.length >= 20) return;
  const nextPath = [...pathStack, current];
  for (const next of graph.get(current) ?? []) {
    if (next === start && nextPath.length > 1) {
      const normalized = normalizeCycle(nextPath);
      const key = normalized.join(">");
      if (!seen.has(key)) {
        seen.add(key);
        cycles.push(normalized);
      }
      continue;
    }
    if (!nextPath.includes(next)) walkDependencyCycle(start, next, graph, nextPath, seen, cycles);
  }
}

function normalizeCycle(files: string[]): string[] {
  const unique = files.slice(0, files.findIndex((file, index) => files.indexOf(file) !== index) === -1 ? files.length : files.findIndex((file, index) => files.indexOf(file) !== index));
  const smallestIndex = unique.reduce((best, file, index) => file.localeCompare(unique[best]) < 0 ? index : best, 0);
  return [...unique.slice(smallestIndex), ...unique.slice(0, smallestIndex)];
}

function isDependencyHealthModule(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  if (!/\.(cjs|js|jsx|mjs|py|ts|tsx)$/.test(base)) return false;
  if (/^(main|index|app|cli|server|lib)\./.test(base)) return false;
  if (/(test|spec|config|setup|mock|fixture|stories)\./.test(base)) return false;
  return true;
}

function rankFan(graph: Map<string, string[]>): Array<{ filePath: string; count: number }> {
  return [...graph.entries()]
    .map(([filePath, files]) => ({ filePath, count: new Set(files).size }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.filePath.localeCompare(b.filePath));
}

function buildSearchIndexReport(
  fileLessons: FileLesson[],
  folderLessons: FolderLesson[],
  suggestedReadsReport: SuggestedReadsReport,
  runtimeEnvironmentReport: RuntimeEnvironmentReport,
  interfaceMapReport: InterfaceMapReport,
  symbolMapReport: SymbolMapReport,
  apiReferenceReport: ApiReferenceReport,
  dependencyHealthReport: DependencyHealthReport
): SearchIndexReport {
  const seeds: Array<{
    id: string;
    title: string;
    href: string;
    section: string;
    sourcePath: string | null;
    text: string;
    filters: Record<string, string[]>;
    meta: Record<string, string>;
    anchors: SearchIndexReport["documents"][number]["anchors"];
  }> = [
    searchSeed({
      id: "report-suggested-reads",
      title: "추천 읽기",
      href: "html/suggested-reads.html",
      section: "report",
      sourcePath: null,
      text: [suggestedReadsReport.summary, suggestedReadsReport.sourcePattern, ...suggestedReadsReport.items.map((item) => `${item.filePath} ${item.reason}`)].join("\n"),
      sourcePattern: "Repo Baby",
      kind: "recommended-reading"
    }),
    searchSeed({
      id: "report-runtime-environment",
      title: "실행 환경",
      href: "html/runtime-environment.html",
      section: "report",
      sourcePath: null,
      text: [runtimeEnvironmentReport.summary, runtimeEnvironmentReport.sourcePattern, ...runtimeEnvironmentReport.detectedManifests.map((item) => `${item.filePath} ${item.ecosystem} ${item.signal}`), ...runtimeEnvironmentReport.missingSignals].join("\n"),
      sourcePattern: "docSmith",
      kind: "runtime"
    }),
    searchSeed({
      id: "report-interface-map",
      title: "인터페이스 맵",
      href: "html/interface-map.html",
      section: "report",
      sourcePath: null,
      text: [interfaceMapReport.summary, interfaceMapReport.sourcePattern, ...interfaceMapReport.routeSignals.map((item) => `${item.filePath} ${item.kind} ${item.signal}`), ...interfaceMapReport.apiSignals.map((item) => `${item.filePath} ${item.method} ${item.pattern}`)].join("\n"),
      sourcePattern: "repomap",
      kind: "interface"
    }),
    searchSeed({
      id: "report-symbol-map",
      title: "심볼 맵",
      href: "html/symbol-map.html",
      section: "report",
      sourcePath: null,
      text: [symbolMapReport.summary, symbolMapReport.sourcePattern, ...symbolMapReport.symbols.map((item) => `${item.name} ${item.kind} ${item.filePath}`)].join("\n"),
      sourcePattern: "codebase-map",
      kind: "symbols"
    }),
    searchSeed({
      id: "report-api-reference",
      title: "API Reference",
      href: "html/api-reference.html",
      section: "report",
      sourcePath: null,
      text: [apiReferenceReport.summary, apiReferenceReport.sourcePattern, ...apiReferenceReport.publicSymbols.map((item) => `${item.name} ${item.kind} ${item.category} ${item.signature}`)].join("\n"),
      sourcePattern: "TypeDoc",
      kind: "api-reference"
    }),
    searchSeed({
      id: "report-dependency-health",
      title: "Dependency Health",
      href: "html/dependency-health.html",
      section: "report",
      sourcePath: null,
      text: [dependencyHealthReport.summary, dependencyHealthReport.sourcePattern, ...dependencyHealthReport.ruleViolations.map((item) => `${item.ruleName} ${item.fromFile} ${item.toFile ?? ""} ${item.message}`)].join("\n"),
      sourcePattern: "dependency-cruiser",
      kind: "dependency-health"
    }),
    ...folderLessons.slice(0, 25).map((lesson) => searchSeed({
      id: `folder-${htmlAnchor(lesson.folderPath)}`,
      title: lesson.folderPath,
      href: `html/folders.html#${htmlAnchor(lesson.folderPath)}`,
      section: "folder",
      sourcePath: lesson.folderPath,
      text: [lesson.role, lesson.beginnerExplanation, lesson.whyItExists, lesson.designReasoning, lesson.rebuildAdvice, ...lesson.importantFiles].join("\n"),
      sourcePattern: "RepoTutor folder lesson",
      kind: "folder"
    })),
    ...fileLessons.slice(0, 50).map((lesson) => searchSeed({
      id: `file-${htmlAnchor(lesson.filePath)}`,
      title: lesson.filePath,
      href: `html/files.html#${htmlAnchor(lesson.filePath)}`,
      section: "file",
      sourcePath: lesson.filePath,
      text: [
        lesson.role,
        lesson.beginnerExplanation,
        lesson.whyItExists,
        lesson.executionFlowPosition,
        lesson.rebuildAdvice,
        ...lesson.keyExports,
        ...lesson.keyImports,
        ...lesson.glossaryTerms,
        ...lesson.sourceEvidence.map((item) => `${item.kind} ${item.snippet}`)
      ].join("\n"),
      sourcePattern: "RepoTutor file lesson",
      kind: "file"
    }))
  ];

  const documents = seeds.map((seed) => {
    const terms = tokenizeSearchText(`${seed.title}\n${seed.text}\n${Object.values(seed.meta).join("\n")}`);
    const topTerms = rankSearchTerms(terms).slice(0, 8).map(([term]) => term);
    return {
      id: seed.id,
      title: seed.title,
      href: seed.href,
      section: seed.section,
      sourcePath: seed.sourcePath,
      wordCount: terms.length,
      filters: seed.filters,
      meta: seed.meta,
      anchors: seed.anchors,
      topTerms
    };
  });
  const termIndex = buildSearchTermIndex(seeds);
  const metadataFields = [...new Set(documents.flatMap((document) => Object.keys(document.meta)))].sort();
  const fileDocuments = documents.filter((document) => document.section === "file");
  const codeFileDocument = fileDocuments.find((document) => {
    const language = document.sourcePath ? searchLanguageFromPath(document.sourcePath) : "text";
    return !["json", "markdown", "text", "yaml"].includes(language);
  });
  const topFileDocument = codeFileDocument ?? fileDocuments[0] ?? documents.find((document) => document.section === "report") ?? documents[0];
  const topFilePath = topFileDocument?.sourcePath ?? "README.md";
  const topLanguage = searchLanguageFromPath(topFilePath);
  const topSymbol = symbolMapReport.symbols.find((symbol) => symbol.exported)?.name ?? symbolMapReport.symbols[0]?.name ?? "main";
  const ragChunkingSignals: SearchIndexReport["ragChunkingSignals"] = [
    {
      signal: "repository-load",
      readiness: "ready",
      evidence: `${documents.length} generated learning documents can be treated as loaded repository context before any chat layer is attached.`,
      relatedHref: "html/search-index.html"
    },
    {
      signal: "file-filtering",
      readiness: "ready",
      evidence: "RepoTutor already separates generated report, folder, and file documents with filters so retrieval can exclude low-value or noisy groups.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "notebook-support",
      readiness: "suggested",
      evidence: "RepoChat includes NotebookLoader for .ipynb sources; RepoTutor records this as a future loader hint and keeps current indexing static.",
      relatedHref: "html/notebook-readiness.html"
    },
    {
      signal: "chunk-size",
      readiness: "suggested",
      evidence: "RepoChat uses RecursiveCharacterTextSplitter with chunk_size=2000; RepoTutor documents the target chunk budget without running a vectorizer.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "chunk-overlap",
      readiness: "suggested",
      evidence: "RepoChat uses chunk_overlap=200 so cross-boundary code explanations keep context; RepoTutor can use this as a static export hint.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "local-vector-store",
      readiness: "static-only",
      evidence: "RepoChat persists ChromaDB locally; RepoTutor currently emits JSON/HTML assets only and does not create embeddings or vector databases.",
      relatedHref: "html/vector-db-readiness.html"
    },
    {
      signal: "top-k-retrieval",
      readiness: "suggested",
      evidence: "RepoChat retrieves k=3 documents with cosine distance; RepoTutor exposes topTerms and document ids so a later chat layer can show retrieved citations.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "conversation-memory",
      readiness: "suggested",
      evidence: "RepoChat keeps ConversationBufferMemory; RepoTutor can pair this with learning-journal session logs before adding any live chat runtime.",
      relatedHref: "html/learning-journal.html"
    },
    {
      signal: "standalone-question",
      readiness: "suggested",
      evidence: "RepoChat condenses follow-up questions into standalone questions; RepoTutor now provides starter prompts with retrieval hints.",
      relatedHref: "html/search-index.html"
    }
  ];
  const codeSearchQuerySignals: SearchIndexReport["codeSearchQuerySignals"] = [
    {
      signal: "substring-search",
      readiness: "ready",
      evidence: "RepoTutor termIndex and topTerms already support substring-style lookup across generated learning documents.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "regexp-search",
      readiness: "suggested",
      evidence: "Zoekt supports regexp queries; RepoTutor records regex drill prompts but does not execute regular expressions against target code.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "boolean-operators",
      readiness: "suggested",
      evidence: "Zoekt query language combines expressions with implicit AND, explicit OR, grouping, and negation; RepoTutor exposes drill prompts for those shapes.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "repo-filter",
      readiness: "suggested",
      evidence: "Zoekt supports repo: and r: filters; a single RepoTutor session can translate this into session/repo scoping before multi-repo search exists.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "file-filter",
      readiness: "ready",
      evidence: `RepoTutor file documents retain sourcePath values such as ${topFilePath}, which can be used to teach file: scoped code searches.`,
      relatedHref: topFileDocument?.href ?? "html/files.html"
    },
    {
      signal: "language-filter",
      readiness: "ready",
      evidence: `RepoTutor document filters include language facets; the leading language drill uses lang:${topLanguage}.`,
      relatedHref: "html/search-index.html"
    },
    {
      signal: "branch-filter",
      readiness: "suggested",
      evidence: "Zoekt supports branch: filters; RepoTutor sessions know the analyzed source revision but do not index multiple branches.",
      relatedHref: "html/project-activity.html"
    },
    {
      signal: "case-sensitivity",
      readiness: "suggested",
      evidence: "Zoekt supports case:yes/no/auto; RepoTutor records exact-case drills for symbol and filename searches.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "result-type-filter",
      readiness: "suggested",
      evidence: "Zoekt supports type:filematch, type:filename, and type:repo; RepoTutor records result-type drills for narrowing learning searches.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "symbol-search",
      readiness: symbolMapReport.symbols.length > 0 ? "ready" : "suggested",
      evidence: symbolMapReport.symbols.length > 0
        ? `RepoTutor symbol map found ${symbolMapReport.symbols.length} symbols, so sym:${topSymbol} can be used as a code-search learning drill.`
        : "Zoekt supports sym: queries, but no RepoTutor symbols were extracted from this static snapshot.",
      relatedHref: symbolMapReport.symbols.length > 0 ? "html/symbol-map.html" : "html/search-index.html"
    },
    {
      signal: "trigram-index",
      readiness: "static-only",
      evidence: "Zoekt uses trigram indexing for fast code search; RepoTutor only records this design pattern and does not build search shards.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "ctags-ranking",
      readiness: "static-only",
      evidence: "Zoekt can use ctags symbol information for ranking; RepoTutor keeps ranking hints static and never runs ctags.",
      relatedHref: "html/symbol-map.html"
    },
    {
      signal: "index-shards",
      readiness: "static-only",
      evidence: "Zoekt stores repository indexes as shards with branch masks and metadata; RepoTutor emits JSON/HTML assets only.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "json-api",
      readiness: "static-only",
      evidence: "Zoekt webserver can expose a JSON search API; RepoTutor does not start webservers or expose live search APIs during static analysis.",
      relatedHref: "html/search-service-readiness.html"
    }
  ];
  const conversationStarterPrompts: SearchIndexReport["conversationStarterPrompts"] = [
    {
      questionType: "overview",
      question: "What is this repository trying to teach me first, and which generated report should I open before reading code?",
      retrievalHint: "Retrieve report-suggested-reads, report-runtime-environment, and report-interface-map before answering.",
      relatedHref: "html/suggested-reads.html"
    },
    {
      questionType: "trace",
      question: "Trace one user-facing flow through the indexed documents and name the evidence link for each step.",
      retrievalHint: "Retrieve report-interface-map, report-dependency-health, and the highest-priority file document.",
      relatedHref: "html/graph-query.html"
    },
    {
      questionType: "file",
      question: topFileDocument
        ? `Explain ${topFileDocument.title} as if I will edit it next.`
        : "Explain the first indexed file as if I will edit it next.",
      retrievalHint: topFileDocument
        ? `Retrieve ${topFileDocument.id} plus linked evidence anchors before answering.`
        : "Retrieve the highest-ranked file lesson and its evidence anchors before answering.",
      relatedHref: topFileDocument?.href ?? "html/files.html"
    },
    {
      questionType: "debug",
      question: "If my explanation is wrong, which indexed document would falsify it fastest?",
      retrievalHint: "Retrieve source evidence and dependency-health documents before suggesting a correction.",
      relatedHref: "html/evidence.html"
    },
    {
      questionType: "follow-up",
      question: "Earlier I asked about the main flow. Turn this follow-up into a standalone question: why does the next file matter?",
      retrievalHint: "Rewrite the follow-up with explicit file/report names, then retrieve the matching file and graph documents.",
      relatedHref: "html/search-index.html"
    },
    {
      questionType: "evidence",
      question: "Which three citations should a chat answer show so I can trust it?",
      retrievalHint: "Prefer generated report hrefs, file lesson anchors, and source evidence snippets over uncited summaries.",
      relatedHref: "html/evidence.html"
    }
  ];
  const codeSearchDrillPrompts: SearchIndexReport["codeSearchDrillPrompts"] = [
    {
      queryType: "scope",
      query: `lang:${topLanguage} file:"${topFilePath.split("/").pop() ?? topFilePath}"`,
      learningGoal: "Start by scoping search to one language and one filename before reading broader generated reports.",
      relatedHref: topFileDocument?.href ?? "html/files.html"
    },
    {
      queryType: "symbol",
      query: `sym:"${topSymbol}" case:auto`,
      learningGoal: "Practice moving from a symbol name to the file lesson and source evidence that explain it.",
      relatedHref: symbolMapReport.symbols.length > 0 ? "html/symbol-map.html" : "html/search-index.html"
    },
    {
      queryType: "regex",
      query: `content:/(${topSymbol}|${topLanguage})/ file:/\\.(ts|tsx|js|py|go|rs)$/`,
      learningGoal: "Use regexp-style matching only after simple scoped searches fail to find the concept.",
      relatedHref: "html/search-index.html"
    },
    {
      queryType: "exclude",
      query: `content:"TODO" -file:/test|spec|dist|build/`,
      learningGoal: "Learn to exclude generated, build, and test paths before treating a match as implementation evidence.",
      relatedHref: "html/evidence.html"
    },
    {
      queryType: "branch",
      query: `branch:main content:"${topSymbol}"`,
      learningGoal: "Use branch scoping as a mental model even though RepoTutor currently analyzes one source revision at a time.",
      relatedHref: "html/project-activity.html"
    },
    {
      queryType: "result-type",
      query: `type:filename file:"${topFilePath.split("/").pop() ?? topFilePath}" or type:repo content:"${topSymbol}"`,
      learningGoal: "Distinguish filename discovery, repository discovery, and file-content evidence before answering a learning question.",
      relatedHref: "html/search-index.html"
    }
  ];
  return {
    summary: `Pagefind/Zoekt식 search index report: ${documents.length}개 학습 문서를 PageFragmentData처럼 href, filters, meta, anchors로 나누고 ${termIndex.length}개 검색어 색인, ${ragChunkingSignals.length}개 RepoChat식 RAG 준비 신호, ${codeSearchQuerySignals.length}개 code-search query 신호를 만들었습니다.`,
    sourcePattern: "Pagefind PageFragmentData MetaIndex filters meta_fields static low-bandwidth search index; Repochat GitHub Repository Interactive Chatbot local-first RAG ChromaDB RecursiveCharacterTextSplitter chunk_size chunk_overlap k=3 ConversationBufferMemory standalone question; Zoekt fast code search substring regexp boolean operators repo file lang branch case type sym trigram index ctags ranking shards JSON API",
    totalDocuments: documents.length,
    totalTerms: termIndex.length,
    documents,
    termIndex,
    filterIndex: buildSearchFilterIndex(documents),
    metadataFields,
    ragChunkingSignals,
    codeSearchQuerySignals,
    conversationStarterPrompts,
    codeSearchDrillPrompts,
    learnerNextSteps: [
      "search-index.html에서 보고서, 폴더, 파일 문서가 어떤 filter와 metadata로 묶였는지 확인하세요.",
      "termIndex의 상위 문서를 따라가면 generated HTML 전체를 가로지르는 학습 검색 출발점을 잡을 수 있습니다.",
      "metadataFields와 filters를 보면 Pagefind식 정적 검색 UI를 붙일 때 어떤 facet을 노출할지 결정할 수 있습니다.",
      "conversationStarterPrompts를 사용하면 live chat 없이도 저장소 근거가 붙은 첫 질문과 follow-up 질문을 연습할 수 있습니다.",
      "codeSearchDrillPrompts를 사용해 repo/file/lang/sym/regex/type 필터를 조합하는 검색 질문 훈련을 진행하세요."
    ]
  };
}

function searchSeed(input: {
  id: string;
  title: string;
  href: string;
  section: string;
  sourcePath: string | null;
  text: string;
  sourcePattern: string;
  kind: string;
}): {
  id: string;
  title: string;
  href: string;
  section: string;
  sourcePath: string | null;
  text: string;
  filters: Record<string, string[]>;
  meta: Record<string, string>;
  anchors: SearchIndexReport["documents"][number]["anchors"];
} {
  return {
    ...input,
    filters: {
      section: [input.section],
      kind: [input.kind],
      sourcePattern: [input.sourcePattern]
    },
    meta: {
      title: input.title,
      section: input.section,
      kind: input.kind,
      sourcePath: input.sourcePath ?? "",
      sourcePattern: input.sourcePattern
    },
    anchors: [{
      id: htmlAnchor(input.title),
      text: input.title,
      href: input.href
    }]
  };
}

function searchLanguageFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".py": "python",
    ".go": "go",
    ".rs": "rust",
    ".rb": "ruby",
    ".java": "java",
    ".kt": "kotlin",
    ".scala": "scala",
    ".cc": "cpp",
    ".cpp": "cpp",
    ".c": "c",
    ".cs": "csharp",
    ".md": "markdown",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml"
  };
  return map[ext] ?? "text";
}

function tokenizeSearchText(text: string): string[] {
  const stopWords = new Set(["the", "and", "for", "with", "this", "that", "from", "html", "source", "report"]);
  return [...text.toLowerCase().matchAll(/[a-z0-9가-힣_/-]{2,}/g)]
    .map((match) => match[0])
    .filter((term) => !stopWords.has(term))
    .slice(0, 4_000);
}

function rankSearchTerms(terms: string[]): Array<[string, number]> {
  return Object.entries(countBy(terms)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function buildSearchTermIndex(seeds: Array<{ id: string; title: string; text: string; meta: Record<string, string> }>): SearchIndexReport["termIndex"] {
  const termDocuments = new Map<string, Set<string>>();
  for (const seed of seeds) {
    const uniqueTerms = new Set(tokenizeSearchText(`${seed.title}\n${seed.text}\n${Object.values(seed.meta).join("\n")}`));
    for (const term of uniqueTerms) {
      const documents = termDocuments.get(term) ?? new Set<string>();
      documents.add(seed.id);
      termDocuments.set(term, documents);
    }
  }
  return [...termDocuments.entries()]
    .map(([term, documents]) => ({
      term,
      documentCount: documents.size,
      documents: [...documents].sort().slice(0, 12)
    }))
    .sort((a, b) => b.documentCount - a.documentCount || a.term.localeCompare(b.term))
    .slice(0, 80);
}

function buildSearchFilterIndex(documents: SearchIndexReport["documents"]): SearchIndexReport["filterIndex"] {
  const filters = new Map<string, Map<string, Set<string>>>();
  for (const document of documents) {
    for (const [filter, values] of Object.entries(document.filters)) {
      const valueMap = filters.get(filter) ?? new Map<string, Set<string>>();
      for (const value of values) {
        const documentSet = valueMap.get(value) ?? new Set<string>();
        documentSet.add(document.id);
        valueMap.set(value, documentSet);
      }
      filters.set(filter, valueMap);
    }
  }
  return [...filters.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([filter, values]) => ({
      filter,
      values: [...values.entries()]
        .map(([value, documents]) => ({ value, documentCount: documents.size }))
        .sort((a, b) => b.documentCount - a.documentCount || a.value.localeCompare(b.value))
    }));
}

function buildLearningJournalReport(
  fileLessons: FileLesson[],
  glossary: GlossaryTerm[],
  graphQueryReport: GraphQueryReport,
  tutorialAbstractionReport: TutorialAbstractionReport,
  searchIndexReport: SearchIndexReport
): LearningJournalReport {
  const priorityFiles = fileLessons.slice(0, 5);
  const primaryFile = priorityFiles[0];
  const secondaryFile = priorityFiles[1];
  const glossaryConcepts = glossary.slice(0, 4);
  const abstractionConcepts = tutorialAbstractionReport.abstractions.slice(0, 3);
  const sourcePattern = "learn-codebase Socratic tutor active recall prediction before revelation persistent learning journal; Hephaestus process-aware mentoring self-regulated learning repo-grounded guidance issues commits reviews pull requests standup leaderboard recognition; AI-native vibe-coding build brief repo map context curation planning agent spec writer task breakdown reviewer debugger verification prompt pack";
  const focusGoals: LearningJournalReport["focusGoals"] = [
    {
      label: "Primary goal",
      value: "낯선 저장소를 설명 가능한 mental model로 바꾸기",
      evidenceHref: "html/index.html"
    },
    {
      label: "Learning style",
      value: "예측 질문, 소스 근거 대조, active recall, spaced review 순서로 학습",
      evidenceHref: "html/evidence.html"
    },
    {
      label: "Current focus",
      value: primaryFile ? `${primaryFile.filePath}부터 실제 진입점을 추적` : "먼저 overview와 파일 수업으로 진입점 확인",
      evidenceHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/files.html"
    }
  ];

  const masteryLevels: LearningJournalReport["masteryLevels"] = [
    {
      level: "need-to-explore",
      label: "Need to Explore",
      concepts: priorityFiles.slice(0, 3).map((lesson) => ({
        concept: lesson.filePath,
        status: "아직 예측과 trace가 필요한 핵심 파일",
        reason: `${lesson.role} 역할이지만 학습자가 직접 설명해보기 전까지는 확신하지 않습니다.`,
        reviewPrompt: `파일명 ${lesson.filePath}만 보고 어떤 입력과 출력이 있을지 먼저 예측하세요.`,
        relatedHref: `html/files.html#${htmlAnchor(lesson.filePath)}`
      }))
    },
    {
      level: "learning",
      label: "Learning",
      concepts: glossaryConcepts.map((term) => ({
        concept: `${term.termKo} (${term.termEn})`,
        status: "부분 이해 상태로 active recall 복습 필요",
        reason: term.projectSpecificMeaning,
        reviewPrompt: `${term.termEn}를 이 저장소의 실제 파일 예시와 연결해 한 문장으로 설명하세요.`,
        relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
      }))
    },
    {
      level: "confident",
      label: "Confident",
      concepts: abstractionConcepts.map((item) => ({
        concept: item.name,
        status: "튜토리얼 장으로 설명 가능한 개념 후보",
        reason: item.chapterGoal,
        reviewPrompt: `${item.name} 장을 읽지 않은 사람에게 왜 이 순서로 배워야 하는지 설명하세요.`,
        relatedHref: `html/tutorial-abstractions.html#${htmlAnchor(item.id)}`
      }))
    }
  ];

  const tracePrompt = graphQueryReport.pathPrompts[0];
  const promptSeeds = [
    {
      promptType: "prediction" as const,
      question: primaryFile
        ? `Looking at just ${primaryFile.filePath}, what do you expect it to coordinate before reading the lesson?`
        : "Looking at the repository name and folders, what do you expect this project to do?",
      relatedHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/index.html"
    },
    {
      promptType: "trace" as const,
      question: tracePrompt
        ? `Trace the path from ${tracePrompt.from} to ${tracePrompt.to}. What happens first, and what evidence would prove it?`
        : "Trace one user input from intake to generated HTML. What happens first?",
      relatedHref: "html/graph-query.html"
    },
    {
      promptType: "design-reasoning" as const,
      question: tutorialAbstractionReport.relationships[0]
        ? `Why does ${tutorialAbstractionReport.relationships[0].fromId} connect to ${tutorialAbstractionReport.relationships[0].toId}?`
        : "Why are these responsibilities split across folders instead of one file?",
      relatedHref: "html/tutorial-abstractions.html"
    },
    {
      promptType: "comparison" as const,
      question: priorityFiles[1]
        ? `How is ${priorityFiles[0]?.filePath ?? "the entry file"} different from ${priorityFiles[1].filePath}?`
        : "How is the architecture page different from the file lessons page?",
      relatedHref: "html/files.html"
    },
    {
      promptType: "error-prediction" as const,
      question: "Which generated report would fail first if a generated session `source/` file disappeared?",
      relatedHref: "html/session-verification.html"
    },
    {
      promptType: "meta" as const,
      question: "What would you need to explain back before you should edit this codebase?",
      relatedHref: "html/learning-journal.html"
    }
  ];

  const openQuestions = promptSeeds.map((seed, index) => ({
    id: `journal-question-${index + 1}`,
    question: seed.question,
    promptType: seed.promptType,
    relatedHref: seed.relatedHref,
    sourcePattern
  }));

  const spacedReviewQueue = [
    ...glossaryConcepts.map((term, index) => ({
      concept: `${term.termKo} (${term.termEn})`,
      reviewBy: index === 0 ? "next-session" : `after-${index + 1}-days`,
      reviewNumber: index + 1,
      prompt: `${term.termEn}를 원본 파일 하나와 연결해 다시 설명하세요.`,
      relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
    })),
    ...priorityFiles.slice(0, 3).map((lesson, index) => ({
      concept: lesson.filePath,
      reviewBy: `after-${index + 1}-days`,
      reviewNumber: index + 1,
      prompt: `${lesson.filePath}의 역할과 제거 시 깨질 흐름을 설명하세요.`,
      relatedHref: `html/files.html#${htmlAnchor(lesson.filePath)}`
    }))
  ].slice(0, 8);

  const ahaMoments = [
    {
      title: "Prediction before revelation",
      insight: "파일 수업을 열기 전에 역할을 먼저 예측하면, 설명을 읽을 때 맞은 부분과 빈틈이 분리됩니다.",
      relatedHref: "html/files.html"
    },
    {
      title: "Evidence-backed confidence",
      insight: "이해했다고 느끼는 것보다 source evidence와 lesson link로 다시 말할 수 있는지가 더 중요합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      title: "Searchable review surface",
      insight: `Pagefind식 색인 ${searchIndexReport.totalDocuments}개 문서를 복습 출발점으로 쓰면 모르는 개념을 빠르게 되찾을 수 있습니다.`,
      relatedHref: "html/search-index.html"
    }
  ];

  const mentorReflectionLoops: LearningJournalReport["mentorReflectionLoops"] = [
    {
      loop: "goal-strategy-reflection",
      title: "Goal -> Strategy -> Reflection",
      prompt: "이번 세션의 목표 하나를 정하고, 읽을 순서와 검증 전략을 적은 뒤, 마지막에 어떤 근거로 이해가 바뀌었는지 회고하세요.",
      evidence: "Hephaestus의 self-regulated learning mentor pattern을 정적 학습 저널에 맞춘 루프입니다.",
      relatedHref: "html/learning-journal.html"
    },
    {
      loop: "repo-grounded-context",
      title: "Repo-Grounded Mentor Context",
      prompt: primaryFile
        ? `${primaryFile.filePath} 설명을 읽기 전에 관련 파일, evidence, graph query를 연결해 멘토에게 줄 맥락을 직접 구성하세요.`
        : "overview, evidence, graph query를 연결해 멘토에게 줄 저장소 맥락을 직접 구성하세요.",
      evidence: "Hephaestus의 repo-grounded guidance 아이디어를 파일 수업, evidence index, graph query 링크로 제한해 재현합니다.",
      relatedHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/evidence.html"
    },
    {
      loop: "standup-summary",
      title: "Standup Learning Summary",
      prompt: "어제 이해한 것, 오늘 추적할 파일, 막힌 질문을 세 줄 standup으로 남기세요.",
      evidence: "Hephaestus의 automated standup mentor 흐름을 개인 학습 세션 로그로 바꾼 신호입니다.",
      relatedHref: "html/project-activity.html"
    },
    {
      loop: "review-feedback",
      title: "Practice Review Feedback",
      prompt: "이 저장소를 수정한다면 리뷰어가 먼저 물어볼 위험, 테스트, 근거 링크를 하나씩 적으세요.",
      evidence: "Hephaestus의 practice-aware PR review 패턴을 실행 없는 정적 review rehearsal 질문으로 옮겼습니다.",
      relatedHref: "html/evidence.html"
    },
    {
      loop: "team-ritual",
      title: "Team Ritual Recognition",
      prompt: "팀 학습 회고에서 공유할 만한 insight와 인정할 기여를 하나 고르고 관련 리포트 링크를 붙이세요.",
      evidence: "Hephaestus의 leaderboard, team competition, recognition 흐름을 개인/팀 학습 ritual prompt로 축소했습니다.",
      relatedHref: "html/suggested-reads.html"
    }
  ];

  const repoGroundedFeedbackPrompts: LearningJournalReport["repoGroundedFeedbackPrompts"] = [
    {
      signal: "issues",
      question: "이 파일 또는 개념은 어떤 사용자 문제나 issue를 해결하기 위해 존재한다고 추정할 수 있나요?",
      evidence: "issue context를 직접 조회하지 않고, purpose와 file lesson 근거로 문제 가설을 세우게 합니다.",
      relatedHref: "html/overview.html"
    },
    {
      signal: "commits",
      question: "최근 변경 설명을 모른다고 가정할 때, 이 코드의 어떤 부분을 standup에서 먼저 설명하겠습니까?",
      evidence: "commit context를 project activity 학습 질문으로 바꿔 변경 설명 능력을 점검합니다.",
      relatedHref: "html/project-activity.html"
    },
    {
      signal: "pull-requests",
      question: "이 아키텍처 경로를 PR로 올린다면 reviewer가 묻기 전에 어떤 데이터 흐름을 증명해야 하나요?",
      evidence: "pull request mentor 신호를 graph query와 component graph의 사전 설명 과제로 변환합니다.",
      relatedHref: "html/graph-query.html"
    },
    {
      signal: "reviews",
      question: "리뷰 코멘트를 남긴다면 어떤 source evidence 링크를 함께 붙여야 설득력이 생기나요?",
      evidence: "review feedback을 evidence-backed confidence 훈련으로 연결합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      signal: "leaderboard",
      question: "이번 주 학습 leaderboard가 있다면 어떤 설명/검증 행동에 점수를 주겠습니까?",
      evidence: "leaderboard를 경쟁 자체가 아니라 좋은 학습 행동을 보이게 만드는 기준으로 사용합니다.",
      relatedHref: "html/learning-journal.html"
    },
    {
      signal: "recognition",
      question: "누군가의 온보딩을 도왔다고 인정하려면 어떤 설명 링크와 확인 질문을 공유해야 하나요?",
      evidence: "recognition을 team learning artifact 공유로 바꿔 학습 전이를 유도합니다.",
      relatedHref: "html/suggested-reads.html"
    },
    {
      signal: "prompt-scheduler",
      question: "다음 세션 시작 때 자동으로 다시 물어볼 질문 하나를 고른다면 무엇이어야 하나요?",
      evidence: "mentor prompt scheduler를 spaced review queue와 연결한 반복 질문입니다.",
      relatedHref: "html/learning-journal.html"
    }
  ];

  const primaryEvidence = primaryFile?.sourceEvidence[0]?.snippet ?? primaryFile?.role ?? "overview, file lessons, evidence index";
  const coreTerms = glossaryConcepts.map((term) => `${term.termKo}(${term.termEn})`).join(", ") || "architecture, data flow, verification";
  const vibeCodingBuildBriefs: LearningJournalReport["vibeCodingBuildBriefs"] = [
    {
      role: "context-curator",
      title: "AI에게 줄 맥락 선별",
      whyItMatters: "바이브코딩 학습자는 모든 코드를 외우는 대신, AI가 헷갈리지 않도록 어떤 파일, 용어, 흐름을 함께 줘야 하는지 알아야 합니다.",
      sourceEvidence: primaryFile
        ? `${primaryFile.filePath}: ${primaryEvidence}`
        : "RepoTutor overview, files, evidence index를 묶어 맥락을 구성합니다.",
      learnerAction: primaryFile
        ? `${primaryFile.filePath}, evidence link, 관련 glossary term을 한 묶음으로 AI에게 전달할 준비를 합니다.`
        : "overview, files, glossary에서 AI에게 줄 최소 맥락을 고릅니다.",
      prompt: primaryFile
        ? `이 저장소에서 ${primaryFile.filePath}가 맡은 역할, 관련 용어, 검증해야 할 흐름을 초보자가 AI에게 지시할 수 있는 build brief로 정리해줘.`
        : "이 저장소의 목적, 핵심 폴더, 검증할 흐름을 AI에게 줄 build brief로 정리해줘.",
      relatedHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/index.html"
    },
    {
      role: "architect",
      title: "구조와 책임을 말로 설명",
      whyItMatters: "전통적인 구현 문법보다 어떤 책임을 어떤 모듈에 맡기는지가 AI 산출물의 품질을 좌우합니다.",
      sourceEvidence: abstractionConcepts[0]
        ? `${abstractionConcepts[0].name}: ${abstractionConcepts[0].chapterGoal}`
        : "architecture, component graph, tutorial abstractions를 연결합니다.",
      learnerAction: "아키텍처를 입력, 처리, 출력, 검증 책임으로 나누어 AI에게 말할 수 있게 준비합니다.",
      prompt: "이 저장소를 비슷하게 만들려면 어떤 역할의 모듈들이 필요하고, 왜 분리되어야 하는지 product owner가 이해할 말로 설명해줘.",
      relatedHref: "html/tutorial-abstractions.html"
    },
    {
      role: "product-owner",
      title: "만들려는 앱의 목적 고정",
      whyItMatters: "AI에게 코딩을 맡겨도 제품 목적, 학습자 수준, 성공 기준은 사람이 명확히 잡아야 합니다.",
      sourceEvidence: `주요 학습 용어: ${coreTerms}`,
      learnerAction: "비슷한 앱을 만들 때 반드시 보존할 사용자 가치와 제외할 전통 개발 학습 범위를 적습니다.",
      prompt: "나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스를 참고해 같은 목적의 앱을 만들 때 제품 목표, 사용자 여정, 제외할 기능을 먼저 정리해줘.",
      relatedHref: "html/overview.html"
    },
    {
      role: "implementer",
      title: "작게 나눈 작업으로 AI에게 맡기기",
      whyItMatters: "큰 요구를 한 번에 던지면 AI도 검증하기 어렵습니다. 파일 역할과 리포트 산출물을 기준으로 작은 작업 단위가 필요합니다.",
      sourceEvidence: secondaryFile
        ? `${secondaryFile.filePath}: ${secondaryFile.role}`
        : "file lessons와 rebuild roadmap의 단계 단위를 사용합니다.",
      learnerAction: "AI에게 줄 구현 요청을 한 번에 하나의 책임, 하나의 산출물, 하나의 검증 기준으로 쪼갭니다.",
      prompt: secondaryFile
        ? `${secondaryFile.filePath}와 연결된 기능을 비슷하게 구현하려면 작업을 3단계로 쪼개고, 각 단계마다 확인할 산출물을 적어줘.`
        : "이 앱을 비슷하게 만들기 위한 첫 구현 작업을 3단계로 쪼개고, 각 단계마다 확인할 산출물을 적어줘.",
      relatedHref: "html/rebuild.html"
    },
    {
      role: "reviewer",
      title: "AI 산출물을 근거로 검토",
      whyItMatters: "바이브코딩에서도 '잘 돌아갈 것 같다'는 느낌만으로 끝내면 안 됩니다. 소스 근거, 테스트, 실행 확인의 경계를 구분해야 합니다.",
      sourceEvidence: "evidence index, session verification, graph query가 검토 질문의 기준입니다.",
      learnerAction: "AI가 만든 결과가 어떤 원본 근거와 어떤 검증 명령으로 확인되어야 하는지 먼저 질문합니다.",
      prompt: "방금 만든 구현을 리뷰어 관점에서 봐줘. 원본 소스 근거와 비교해 확인된 것, 테스트가 필요한 것, 사람이 판단해야 할 것을 나눠줘.",
      relatedHref: "html/session-verification.html"
    }
  ];

  const aiBuildPromptPacks: LearningJournalReport["aiBuildPromptPacks"] = [
    {
      phase: "understand",
      prompt: `이 저장소를 한 줄씩 가르치지 말고, 바이브코딩 개발자가 AI에게 지시하려면 알아야 할 목적, 핵심 용어(${coreTerms}), 모듈 역할을 설명해줘.`,
      why: "학습 목표를 전통 문법 암기가 아니라 AI 지시를 위한 mental model로 고정합니다.",
      inputEvidence: "overview, architecture, glossary, file lessons",
      expectedOutput: "목적, 역할, 용어, 흐름, 모르는 상태에서 물어볼 질문 목록",
      relatedHref: "html/index.html"
    },
    {
      phase: "specify",
      prompt: "이 앱을 비슷하게 만들기 위한 제품 명세를 써줘. 사용자, 핵심 기능, 제외할 범위, 성공 기준, 필요한 입력 자료를 분리해줘.",
      why: "AI 개발 도구의 spec writer 흐름처럼 구현 전에 요구사항의 빈틈을 드러냅니다.",
      inputEvidence: "purpose report, learning path, user goal",
      expectedOutput: "AI에게 넘길 수 있는 product spec과 확인 질문",
      relatedHref: "html/learning-path.html"
    },
    {
      phase: "plan",
      prompt: "코드는 아직 만들지 말고 계획만 세워줘. 어떤 모듈을 어떤 순서로 만들고, 각 단계에서 어떤 산출물로 검증할지 PLAN 형태로 정리해줘.",
      why: "planning agent와 code agent 역할을 분리해, 설계가 흐려진 상태에서 바로 구현으로 뛰어드는 위험을 줄입니다.",
      inputEvidence: "architecture, component graph, rebuild roadmap",
      expectedOutput: "실행 가능한 작업 순서, 의존관계, 검증 기준",
      relatedHref: "html/rebuild.html"
    },
    {
      phase: "implement",
      prompt: "한 번에 전체를 만들지 말고 첫 번째 작은 기능만 구현해줘. 변경 파일, 이유, 다음 검증 명령을 함께 보고해줘.",
      why: "작은 task breakdown은 AI와 사람이 모두 버그 원인을 추적하기 쉽게 만듭니다.",
      inputEvidence: "file lessons, graph query, rebuild roadmap",
      expectedOutput: "작은 구현 결과, 변경 요약, 다음 검증 항목",
      relatedHref: "html/files.html"
    },
    {
      phase: "review",
      prompt: "이 변경을 리뷰해줘. 원본 소스와 달라진 의도, 깨질 수 있는 흐름, 테스트로 증명할 항목을 우선순위로 정리해줘.",
      why: "리뷰어 역할을 별도로 세우면 AI가 만든 코드도 근거 중심으로 점검할 수 있습니다.",
      inputEvidence: "evidence index, graph query, session verification",
      expectedOutput: "위험 목록, 누락 검증, 다음 수정 요청",
      relatedHref: "html/evidence.html"
    },
    {
      phase: "debug",
      prompt: "실패 로그를 보고 바로 고치기 전에 원인을 추정해줘. 어떤 입력, 모듈, 검증 경로를 확인해야 하는지 단계별로 말해줘.",
      why: "실행 로그를 AI에게 주되, 추측과 증거를 구분하게 만드는 디버깅 습관을 만듭니다.",
      inputEvidence: "test output, runtime error, related file lesson",
      expectedOutput: "원인 가설, 확인 순서, 최소 수정 범위",
      relatedHref: "html/session-verification.html"
    },
    {
      phase: "document",
      prompt: "현재 산출물을 학습자 문서 초안으로 바꿔줘. 내가 알아야 할 용어, 왜 필요한지, AI에게 다시 시킬 때 쓸 프롬프트를 포함해줘.",
      why: "코드 작성 자체보다 다음에 비슷한 시스템을 만들 수 있는 설명 자산을 남깁니다.",
      inputEvidence: "glossary, learning journal, suggested reads",
      expectedOutput: "용어 해설, 아키텍처 설명, 재사용 프롬프트",
      relatedHref: "html/glossary.html"
    }
  ];

  const verificationBoundaries: LearningJournalReport["verificationBoundaries"] = [
    {
      boundary: "static-evidence",
      claim: "RepoTutor가 원본 소스에서 파일 역할, 용어, 구조 신호를 추출했다.",
      whatRepoTutorKnows: "복사된 원본 파일, evidence line, generated lesson, graph/query report에 근거한 정적 사실입니다.",
      whatAiMustNotAssume: "이 정보만으로 실제 런타임 동작, 최신 원격 상태, 운영 환경 성공을 확정하면 안 됩니다.",
      nextVerification: "evidence.html과 source 링크를 열어 같은 근거가 있는지 확인합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      boundary: "needs-test-run",
      claim: "AI가 비슷한 기능을 구현하면 테스트로 통과 여부를 확인해야 한다.",
      whatRepoTutorKnows: "이 저장소가 어떤 검증 산출물을 요구하는지 session verification으로 안내할 수 있습니다.",
      whatAiMustNotAssume: "테스트를 실행하지 않고 기능이 완성됐다고 말하면 안 됩니다.",
      nextVerification: "AI에게 변경 후 실행할 테스트 명령과 실패 시 보고 형식을 요구합니다.",
      relatedHref: "html/session-verification.html"
    },
    {
      boundary: "needs-runtime-run",
      claim: "UI, CLI, 서버, 브라우저 동작은 실제 실행 확인이 필요하다.",
      whatRepoTutorKnows: "정적 분석으로 실행 후보와 인터페이스 신호를 보여줄 수 있습니다.",
      whatAiMustNotAssume: "정적 코드만 보고 사용자가 실제로 클릭하거나 실행할 수 있다고 단정하면 안 됩니다.",
      nextVerification: "runtime environment와 interface map을 보고 어떤 실행 확인이 필요한지 고릅니다.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      boundary: "needs-human-review",
      claim: "제품 목적, 학습 난이도, 제외 범위는 사람이 판단해야 한다.",
      whatRepoTutorKnows: "목적과 학습 경로를 제안할 수 있지만 사용자 맥락의 최종 우선순위는 알 수 없습니다.",
      whatAiMustNotAssume: "사용자가 전통 개발자가 되려 한다고 가정하거나 불필요한 문법 학습을 강요하면 안 됩니다.",
      nextVerification: "학습자가 원하는 build brief와 제외할 학습 범위를 직접 확인합니다.",
      relatedHref: "html/learning-journal.html"
    },
    {
      boundary: "needs-source-owner",
      claim: "외부 GitHub 프로젝트의 최신 의도와 라이선스 판단은 소유자/문서 확인이 필요하다.",
      whatRepoTutorKnows: "정적 소스와 공개 메타데이터에서 패턴을 흡수할 수 있습니다.",
      whatAiMustNotAssume: "외부 코드를 앱 안에 내장하거나 라이선스/운영 의도를 임의로 확정하면 안 됩니다.",
      nextVerification: "외부 소스는 분석 후 문서화하고 임시 캐시는 삭제합니다.",
      relatedHref: "html/license-rights.html"
    }
  ];

  return {
    summary: `learn-codebase식 learning journal report: ${openQuestions.length}개 Socratic 질문, ${spacedReviewQueue.length}개 spaced review 항목, ${masteryLevels.reduce((sum, level) => sum + level.concepts.length, 0)}개 mastery concept, ${mentorReflectionLoops.length}개 mentor loop, ${vibeCodingBuildBriefs.length}개 vibe-coding build brief, ${aiBuildPromptPacks.length}개 AI prompt pack, ${verificationBoundaries.length}개 verification boundary를 생성했습니다. 이 리포트는 전통 문법 암기가 아니라 AI에게 비슷한 앱을 만들도록 지시하는 데 필요한 구조, 용어, 원리, 검증 경계를 학습하게 합니다.`,
    sourcePattern,
    focusGoals,
    masteryLevels,
    openQuestions,
    spacedReviewQueue,
    ahaMoments,
    mentorReflectionLoops,
    repoGroundedFeedbackPrompts,
    vibeCodingBuildBriefs,
    aiBuildPromptPacks,
    verificationBoundaries,
    sessionLog: [{
      explored: "RepoTutor generated overview, file lessons, graph query, tutorial abstractions, search index",
      learned: [
        "예측 질문으로 파일 역할을 먼저 가정한다.",
        "소스 근거 링크로 설명의 신뢰도를 확인한다.",
        "spaced review queue로 다음 세션의 복습 대상을 남긴다.",
        "Hephaestus식 process-aware mentoring 루프로 목표, 전략, 리뷰, standup reflection을 연결한다.",
        "바이브코딩에서는 코드를 외우는 대신 AI에게 줄 맥락, 역할, 용어, 검증 경계를 설명할 수 있어야 한다."
      ],
      struggledWith: priorityFiles.slice(0, 3).map((lesson) => lesson.filePath),
      next: [
        "Need to Explore 항목 하나를 골라 예측을 적는다.",
        "관련 파일 수업과 원본 소스를 대조한다.",
        "정답을 본 뒤 review prompt에 다시 답한다."
      ]
    }],
    socraticPrompts: [
      {
        category: "Prediction",
        question: openQuestions[0]?.question ?? "What do you expect this module to do?",
        useWhen: "파일이나 함수 설명을 열기 전",
        relatedHref: openQuestions[0]?.relatedHref ?? "html/files.html",
        hintLevels: [
          "폴더명과 파일명에서 책임을 추론하세요.",
          "입력, 처리, 출력 중 어느 쪽에 가까운지 고르세요.",
          "파일 수업의 role 문장을 빈칸으로 두고 채워보세요."
        ]
      },
      {
        category: "Trace",
        question: "한 입력이 analysis JSON, Markdown, HTML까지 이동하는 순서를 말해보세요.",
        useWhen: "실행 흐름과 데이터 흐름을 학습할 때",
        relatedHref: "html/flow.html",
        hintLevels: [
          "처음에는 intake 또는 source copy에서 시작합니다.",
          "scanner와 renderer 사이의 산출물을 찾으세요.",
          "source files -> analysis JSON -> Markdown -> HTML 순서로 채워보세요."
        ]
      },
      {
        category: "Evidence",
        question: "그 설명을 뒷받침하는 실제 소스 근거 링크는 어디에 있나요?",
        useWhen: "이해했다고 느끼지만 근거를 아직 못 댈 때",
        relatedHref: "html/evidence.html",
        hintLevels: [
          "파일 수업의 소스 근거 섹션을 보세요.",
          "evidence kind와 line snippet을 연결하세요.",
          "원본 열기 링크를 따라가 같은 줄을 찾으세요."
        ]
      }
    ],
    journalTemplateMarkdown: learningJournalTemplateMarkdown(
      focusGoals,
      masteryLevels,
      openQuestions,
      spacedReviewQueue,
      ahaMoments,
      mentorReflectionLoops,
      repoGroundedFeedbackPrompts,
      vibeCodingBuildBriefs,
      aiBuildPromptPacks,
      verificationBoundaries
    ),
    learnerNextSteps: [
      "learning-journal.html에서 Vibe-Coding Build Brief 하나를 고르고 그대로 AI에게 줄 수 있는 말로 다시 써보세요.",
      "AI Prompt Pack 중 specify 또는 plan 프롬프트를 골라 자신의 앱 아이디어에 맞게 바꿔보세요.",
      "Verification Boundaries를 보고 AI가 단정하면 안 되는 항목을 먼저 표시하세요."
    ]
  };
}

function learningJournalTemplateMarkdown(
  focusGoals: LearningJournalReport["focusGoals"],
  masteryLevels: LearningJournalReport["masteryLevels"],
  openQuestions: LearningJournalReport["openQuestions"],
  spacedReviewQueue: LearningJournalReport["spacedReviewQueue"],
  ahaMoments: LearningJournalReport["ahaMoments"],
  mentorReflectionLoops: LearningJournalReport["mentorReflectionLoops"],
  repoGroundedFeedbackPrompts: LearningJournalReport["repoGroundedFeedbackPrompts"],
  vibeCodingBuildBriefs: LearningJournalReport["vibeCodingBuildBriefs"],
  aiBuildPromptPacks: LearningJournalReport["aiBuildPromptPacks"],
  verificationBoundaries: LearningJournalReport["verificationBoundaries"]
): string {
  return [
    "# Codebase Learning Journal",
    "",
    "> 나는 코드를 한 줄씩 외우는 사람이 아니라, 소스를 이해해 AI에게 비슷한 앱을 만들도록 정확히 지시하는 바이브코딩 개발자다.",
    "",
    "## Focus & Goals",
    ...focusGoals.map((item) => `- **${item.label}**: ${item.value} (${item.evidenceHref})`),
    "",
    "## Concept Mastery Map",
    ...masteryLevels.map((level) => [
      `### ${level.label}`,
      ...level.concepts.map((concept) => `- ${concept.concept}: ${concept.status} - ${concept.reviewPrompt}`)
    ].join("\n")),
    "",
    "## Open Questions",
    ...openQuestions.map((item) => `- [ ] ${item.question} (${item.promptType}, ${item.relatedHref})`),
    "",
    "## Spaced Review Queue",
    ...spacedReviewQueue.map((item) => `- [ ] ${item.concept} (review by: ${item.reviewBy}) - ${item.reviewNumber} review - ${item.prompt}`),
    "",
    "## Aha Moments",
    ...ahaMoments.map((item) => `### ${item.title}\n${item.insight}`),
    "",
    "## Mentor Reflection Loops",
    ...mentorReflectionLoops.map((item) => `- **${item.title}** (${item.loop}): ${item.prompt} Evidence: ${item.evidence} (${item.relatedHref})`),
    "",
    "## Repo-Grounded Feedback Prompts",
    ...repoGroundedFeedbackPrompts.map((item) => `- [ ] ${item.question} (${item.signal}) - ${item.evidence} (${item.relatedHref})`),
    "",
    "## Vibe-Coding Build Brief",
    ...vibeCodingBuildBriefs.map((item) => [
      `### ${item.title}`,
      `- Role: ${item.role}`,
      `- Why it matters: ${item.whyItMatters}`,
      `- Source evidence: ${item.sourceEvidence}`,
      `- Learner action: ${item.learnerAction}`,
      `- Prompt: ${item.prompt}`,
      `- Related: ${item.relatedHref}`
    ].join("\n")),
    "",
    "## AI Build Prompt Packs",
    ...aiBuildPromptPacks.map((item) => [
      `### ${item.phase}`,
      `- Prompt: ${item.prompt}`,
      `- Why: ${item.why}`,
      `- Input evidence: ${item.inputEvidence}`,
      `- Expected output: ${item.expectedOutput}`,
      `- Related: ${item.relatedHref}`
    ].join("\n")),
    "",
    "## Verification Boundaries",
    ...verificationBoundaries.map((item) => [
      `### ${item.boundary}`,
      `- Claim: ${item.claim}`,
      `- RepoTutor knows: ${item.whatRepoTutorKnows}`,
      `- AI must not assume: ${item.whatAiMustNotAssume}`,
      `- Next verification: ${item.nextVerification}`,
      `- Related: ${item.relatedHref}`
    ].join("\n")),
    "",
    "## Session Log",
    "- **Explored**: generated RepoTutor reports",
    "- **Next**: answer one open question before reading the linked report",
    ""
  ].join("\n");
}

function buildComponentGraphReport(folderLessons: FolderLesson[], fileLessons: FileLesson[], glossary: GlossaryTerm[], rebuildRoadmap: RebuildRoadmap): ComponentGraphReport {
  const nodes: ComponentGraphReport["nodes"] = [{
    id: "root",
    type: "root",
    label: "repo root",
    path: ".",
    summary: "분석 대상 저장소의 시작점입니다.",
    href: "index.html"
  }];
  const edges: ComponentGraphReport["edges"] = [];

  for (const folder of folderLessons.slice(0, 20)) {
    const id = nodeId("folder", folder.folderPath);
    nodes.push({
      id,
      type: "folder",
      label: folder.folderPath,
      path: folder.folderPath,
      summary: folder.role,
      href: `folders.html#${htmlAnchor(folder.folderPath)}`
    });
    edges.push({ from: "root", to: id, label: "contains" });
  }

  for (const file of fileLessons.slice(0, 35)) {
    const id = nodeId("file", file.filePath);
    nodes.push({
      id,
      type: "file",
      label: file.filePath,
      path: file.filePath,
      summary: file.role,
      href: `files.html#${htmlAnchor(file.filePath)}`
    });
    const folder = closestFolderForFile(file.filePath, folderLessons);
    edges.push({ from: folder ? nodeId("folder", folder.folderPath) : "root", to: id, label: "explains file" });
  }

  for (const term of glossary.slice(0, 20)) {
    const id = nodeId("term", term.termEn);
    nodes.push({
      id,
      type: "term",
      label: `${term.termKo} (${term.termEn})`,
      path: null,
      summary: term.simpleDefinition,
      href: `glossary.html#${htmlAnchor(term.termEn)}`
    });
    const matchingFile = fileLessons.find((file) => file.glossaryTerms.some((value) => value.includes(term.termKo) || value.includes(term.termEn)));
    edges.push({ from: matchingFile ? nodeId("file", matchingFile.filePath) : "root", to: id, label: "uses term" });
  }

  for (const step of rebuildRoadmap.steps.slice(0, 10)) {
    const id = nodeId("step", String(step.order));
    nodes.push({
      id,
      type: "rebuild-step",
      label: `${step.order}. ${step.title}`,
      path: null,
      summary: step.goal,
      href: "rebuild.html"
    });
    const relatedFile = fileLessons.find((file) => step.relatedSourcePaths.some((sourcePath) => file.filePath === sourcePath || file.filePath.startsWith(`${sourcePath}/`)));
    edges.push({ from: relatedFile ? nodeId("file", relatedFile.filePath) : "root", to: id, label: "rebuilds through" });
  }

  const mermaidEdges = edges.slice(0, 80).map((edge) => `  ${edge.from}["${labelForMermaid(nodes, edge.from)}"] -->|${edge.label}| ${edge.to}["${labelForMermaid(nodes, edge.to)}"]`).join("\n");
  return {
    nodes,
    edges,
    summary: buildComponentGraphSummary(nodes, edges),
    entryNodeIds: ["root", ...fileLessons.filter((file) => /main|index|cli|app/i.test(path.basename(file.filePath))).slice(0, 5).map((file) => nodeId("file", file.filePath))],
    mermaid: `flowchart TD\n${mermaidEdges || "  root[\"repo root\"]"}`,
    beginnerExplanation: "component graph는 폴더, 핵심 파일, 용어, 재구현 단계를 하나의 관계도로 묶습니다. 학습자는 한 파일이 어느 폴더에 속하고 어떤 용어와 구현 단계로 이어지는지 한눈에 따라갈 수 있습니다."
  };
}

function buildComponentGraphSummary(nodes: ComponentGraphReport["nodes"], edges: ComponentGraphReport["edges"]): ComponentGraphReport["summary"] {
  const nodeTypeCounts = countBy(nodes.map((node) => node.type));
  const edgeLabelCounts = countBy(edges.map((edge) => edge.label));
  const degree = new Map<string, number>();
  for (const edge of edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }
  const topConnectedNodes = nodes
    .map((node) => ({ id: node.id, label: node.label, type: node.type, degree: degree.get(node.id) ?? 0 }))
    .sort((a, b) => b.degree - a.degree || a.label.localeCompare(b.label))
    .slice(0, 8);
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    nodeTypeCounts,
    edgeLabelCounts,
    topConnectedNodes,
    largeRepoAdvice: "큰 저장소에서는 먼저 연결 수가 높은 노드와 file/folder 필터를 보고, 그 다음 rebuild-step과 term 노드로 학습 순서를 좁히세요."
  };
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

async function buildSourceSnapshotReport(walk: WalkResult): Promise<SourceSnapshotReport> {
  const files = [];
  for (const file of walk.files.filter((candidate) => candidate.isTextCandidate)) {
    const text = await readTextIfSafe(file.absPath);
    files.push({
      filePath: file.relPath,
      size: file.size,
      sha256: text === null ? `untracked-${file.size}` : await sha256(text),
      tracked: text !== null
    });
  }
  return {
    createdAt: new Date().toISOString(),
    totalFiles: files.length,
    files: files.sort((a, b) => a.filePath.localeCompare(b.filePath))
  };
}

function emptyIncrementalReport(coverageReport: CoverageReport): IncrementalReport {
  return {
    baselineSessionId: null,
    baselinePath: null,
    addedFiles: [],
    changedFiles: [],
    removedFiles: [],
    unchangedFiles: [],
    coverageDelta: {
      baselineCoverageRatio: null,
      currentCoverageRatio: coverageReport.coverageRatio,
      coverageRatioDelta: null,
      baselineCoveredImportantFiles: null,
      currentCoveredImportantFiles: coverageReport.coveredImportantFiles,
      coveredImportantFilesDelta: null,
      baselineTotalScannedFiles: null,
      currentTotalScannedFiles: coverageReport.totalScannedFiles,
      totalScannedFilesDelta: null,
      summary: "분석 중에는 이전 세션 비교를 아직 적용하지 않았습니다."
    },
    summary: "이 저장소의 비교 기준 이전 세션이 아직 없습니다.",
    beginnerExplanation: "incremental report는 같은 repo를 다시 분석했을 때 어떤 파일이 추가, 변경, 삭제, 유지되었는지 알려줍니다. 첫 분석에서는 비교할 기준이 없으므로 baseline 없음으로 저장됩니다."
  };
}

async function sha256(text: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(text).digest("hex");
}

function nodeId(prefix: string, value: string): string {
  return `${prefix}_${htmlAnchor(value).replace(/-/g, "_")}`;
}

function closestFolderForFile(filePath: string, folderLessons: FolderLesson[]): FolderLesson | null {
  return folderLessons
    .filter((folder) => filePath.startsWith(`${folder.folderPath}/`))
    .sort((a, b) => b.folderPath.length - a.folderPath.length)[0] ?? null;
}

function labelForMermaid(nodes: ComponentGraphReport["nodes"], id: string): string {
  const label = nodes.find((node) => node.id === id)?.label ?? id;
  return label.replaceAll("\"", "'");
}

function buildGlossary(languageReport: LanguageReport, dependencyReport: DependencyReport, fileLessons: FileLesson[]): GlossaryTerm[] {
  const base: GlossaryTerm[] = [
    term("진입점", "entry point", "프로그램이 처음 시작되는 파일이나 함수입니다.", "startPoints와 main/index 파일 후보에서 찾습니다.", fileLessons[0]?.filePath ?? "source root", ["CLI", "runtime"], "easy", 5),
    term("의존성", "dependency", "프로젝트가 직접 만들지 않고 가져다 쓰는 외부 코드입니다.", "package.json, Cargo.toml 같은 파일에서 확인합니다.", dependencyReport.manifests[0]?.filePath ?? "manifest file", ["package manager"], "easy", 5),
    term("정적 분석", "static analysis", "코드를 실행하지 않고 파일과 구조를 읽어 이해하는 방식입니다.", "RepoTutor의 기본 분석 모드입니다.", "scanner", ["security", "read-only"], "medium", 5),
    term("AI 작업 지시", "AI build prompt", "AI에게 바로 코딩을 시키기 전에 목적, 맥락, 산출물, 검증 기준을 함께 주는 요청입니다.", "Learning Journal과 Rebuild Roadmap이 단계별 prompt pack으로 생성합니다.", "html/rebuild.html", ["context pack", "verification boundary"], "easy", 5),
    term("제품 요구사항 문서", "PRD", "무엇을, 누구를 위해, 왜 만들고, 수락/검증 기준이 무엇인지 구현 전에 정리한 문서입니다.", "RepoTutor는 소스의 목적, 사용자, 주요 기능, 제외 범위를 PRD 초안으로 바꾸어 AI가 추측으로 코딩하지 않게 합니다.", "html/vibe-coding-prompt-pack.html", ["AI build prompt", "acceptance criteria"], "medium", 5),
    term("명세 주도 개발", "SDD", "코드를 먼저 만들지 않고 명세, 계획, 작업 목록이 구현을 이끌게 하는 방식입니다.", "RepoTutor는 GitHub Spec Kit의 Spec -> Plan -> Tasks -> Implement 흐름을 참고해 소스 분석 결과를 명세, 아키텍처 계획, 작업 단위, 검증 질문으로 나눕니다.", "html/rebuild.html", ["PRD", "TDD", "spec-first"], "medium", 5),
    term("테스트 주도 요청", "TDD", "구현 전에 실패해야 할 테스트나 검증 조건을 먼저 정하고, 그 기준을 통과하도록 AI에게 작업을 맡기는 방식입니다.", "Rebuild Roadmap은 구현 단계마다 확인 명령과 verification prompt를 요구해 AI 산출물을 검증 가능한 단위로 만듭니다.", "html/rebuild.html", ["verification boundary", "vertical slice"], "medium", 5),
    term("수용 기준", "acceptance criteria", "기능을 수락할 수 있는 관찰 가능한 조건입니다.", "Prompt Pack은 PRD와 TDD 흐름에서 산출물, 확인 명령, 사람 판단 항목을 분리하게 합니다.", "html/vibe-coding-prompt-pack.html", ["PRD", "TDD"], "easy", 5),
    term("오답노트", "wrong note", "틀린 문제를 복습 가능한 작은 수업으로 바꾼 기록입니다.", "quiz attempt 이후 HTML과 Markdown에 반영됩니다.", "analysis/wrong-notes.json", ["quiz"], "easy", 4),
    term("맥락 꾸러미", "context pack", "AI가 길을 잃지 않도록 관련 파일, 역할, 용어, 근거를 한 묶음으로 정리한 자료입니다.", "RepoTutor는 파일 수업, evidence, graph query, rebuild prompt를 묶어 AI 지시 맥락으로 바꿉니다.", "html/context-pack.html", ["source evidence", "repo map"], "easy", 5),
    term("아키텍처 책임", "architecture responsibility", "폴더나 파일이 맡는 역할과 경계를 말합니다. 어떤 책임이 어디에 있어야 하는지 설명하는 능력입니다.", "Folder lessons와 Rebuild Roadmap의 sourceRoleFocus가 이 책임을 보여줍니다.", "html/folders.html", ["module", "vertical slice"], "medium", 5),
    term("수직 슬라이스", "vertical slice", "전체 앱을 한 번에 만들지 않고, 입력부터 출력과 검증까지 이어지는 작은 기능 하나를 먼저 만드는 방식입니다.", "Rebuild Roadmap은 AI에게 한 번에 하나의 책임과 검증 기준을 맡기도록 안내합니다.", "html/rebuild.html", ["verification-first", "task breakdown"], "medium", 5),
    term("검증 경계", "verification boundary", "정적 분석으로 아는 것, 테스트가 필요한 것, 실제 실행이 필요한 것, 사람이 판단해야 할 것을 나누는 기준입니다.", "Learning Journal은 AI가 단정하면 안 되는 항목을 verification boundary로 보여줍니다.", "html/learning-journal.html", ["static analysis", "source evidence"], "medium", 5),
    term("소스 근거", "source evidence", "설명이 실제 원본 파일의 줄, import/export, 설정, 테스트 신호에 연결되어 있다는 뜻입니다.", "Evidence Index와 파일 수업의 sourceEvidence가 학습자의 설명을 근거 기반으로 만듭니다.", "html/evidence.html", ["static analysis", "review loop"], "easy", 5),
    term("리뷰 루프", "review loop", "AI가 만든 결과를 바로 믿지 않고 목적, 변경, 위험, 테스트, 문서 기준으로 다시 검토하는 반복입니다.", "Rebuild Roadmap과 Learning Journal은 reviewer/debugger 역할 프롬프트로 이 루프를 훈련합니다.", "html/learning-journal.html", ["verification boundary", "AI build prompt"], "medium", 4)
  ];
  for (const role of languageReport.languageRoles.slice(0, 6)) {
    base.push(term(`${role.language} 언어`, role.language, `${role.language}는 ${role.role}에 쓰입니다.`, role.beginnerExplanation, role.language, ["language"], "easy", 3));
  }
  return dedupeTerms(base);
}

function buildRebuildRoadmap(repoMap: RepoMap, fileLessons: FileLesson[]): RebuildRoadmap {
  const titles = ["개념 이해", "PRD/SDD 명세 초안 작성", "폴더 구조 설계", "핵심 기능 1개 구현", "설정 파일 작성", "실행 흐름 연결", "TDD 검증 루프 추가", "문서화", "확장 기능 추가", "원본 repo와 비교"];
  const methods: RebuildRoadmap["steps"][number]["vibeCodingMethod"][] = [
    "context-first",
    "sdd-first",
    "architecture-first",
    "vertical-slice",
    "context-first",
    "vertical-slice",
    "test-driven",
    "review-loop",
    "vertical-slice",
    "review-loop"
  ];
  const focusFolders = repoMap.folders.slice(0, 3);
  const focusFiles = fileLessons.slice(0, 3);
  const fallbackRoleFocus = [{
    path: "repo root",
    role: "프로젝트 전체 구조",
    whyItExists: "AI에게 목적, 폴더, 진입점, 검증 기준을 한 번에 설명하기 위한 기준점입니다.",
    promptHint: "이 저장소의 숲을 먼저 설명하고, 구현 전에 확인해야 할 질문을 뽑아줘."
  }];
  return {
    steps: titles.map((title, index) => {
      const useFolders = index < 3;
      const roleFocus = useFolders
        ? focusFolders.map((folder) => ({
          path: folder.folderPath,
          role: folder.inferredRole,
          whyItExists: `${folder.fileCount}개 파일을 ${folder.inferredRole} 책임으로 묶어 AI와 사람이 같은 지도를 보게 합니다.`,
          promptHint: `${folder.folderPath} 폴더가 어떤 책임을 맡고, 비슷한 앱에서 이 책임을 어디에 둘지 설명해줘.`
        }))
        : focusFiles.map((file) => ({
          path: file.filePath,
          role: file.role,
          whyItExists: file.whyItExists,
          promptHint: `${file.filePath}의 입력, 처리, 출력, 검증 기준을 비슷한 앱 구현 지시문으로 바꿔줘.`
        }));
      const sourceRoleFocus = roleFocus.length > 0 ? roleFocus : fallbackRoleFocus;
      const relatedSourcePaths = sourceRoleFocus.map((item) => item.path);
      const method = methods[index] ?? "vertical-slice";
      return {
        order: index + 1,
        title,
        goal: `${title} 단계에서 코드를 외우기보다 AI에게 줄 맥락, 역할, 검증 기준을 작은 단위로 정리합니다.`,
        tasks: sourceRoleFocus.map((item) => `${item.path} 역할을 ${item.role} 관점에서 설명`),
        vibeCodingMethod: method,
        aiPrompt: rebuildAiPrompt(title, method, sourceRoleFocus),
        architectureRationale: useFolders
          ? "폴더 구조는 AI에게 책임 경계를 알려주는 지도입니다. 같은 종류의 파일을 한곳에 묶으면 프롬프트에서 맥락을 적게 줘도 AI가 수정 범위를 좁힐 수 있습니다."
          : "핵심 파일 단위의 vertical slice는 AI가 한 번에 하나의 책임만 구현하고 사람이 산출물과 검증 기준을 확인하게 만듭니다.",
        sourceRoleFocus,
        whyNeeded: "순서를 나누면 전통 문법을 모두 배우지 않아도 소스의 숲, 역할, 검증 경계를 이해한 뒤 AI에게 정확히 지시할 수 있습니다.",
        relatedSourcePaths,
        expectedMistakes: [
          "파일 이름만 보고 역할을 단정하기",
          "PRD/SDD 없이 AI에게 바로 전체 구현을 맡기기",
          "TDD나 acceptance criteria 없이 AI 산출물을 수락하기",
          "설정 파일과 실행 파일의 차이를 놓치기",
          "AI에게 전체 구현을 한 번에 맡기고 검증 기준을 말하지 않기",
          "정적 분석으로 안 것과 실제 실행으로 확인해야 할 것을 섞기"
        ],
        verificationPrompts: [
          "이 단계에서 소스 근거로 확인된 사실과 아직 테스트가 필요한 가정을 나눠줘.",
          "AI가 만든 결과가 이 단계의 source role focus와 다르면 어떤 질문으로 수정시켜야 해?",
          "다음 단계로 넘어가기 전에 사람이 확인해야 할 산출물과 명령을 체크리스트로 써줘.",
          "이 단계에 PRD, SDD, TDD, acceptance criteria 중 어떤 용어를 써야 하는지와 쓰지 않아도 되는 이유를 구분해줘."
        ],
        completionCriteria: [
          "한 문장으로 이 단계의 목적을 설명할 수 있다.",
          "관련 파일 또는 폴더를 직접 가리킬 수 있다.",
          "필요한 경우 PRD/SDD/TDD/acceptance criteria를 AI 지시문에 넣을 수 있다.",
          "source evidence와 내 목표에 맞게 다듬은 AI 구현 지시서를 하나 작성했다.",
          "확인된 사실, 테스트 필요 항목, 사람 판단 항목을 구분했다."
        ]
      };
    })
  };
}

function rebuildAiPrompt(
  title: string,
  method: RebuildRoadmap["steps"][number]["vibeCodingMethod"],
  sourceRoleFocus: RebuildRoadmap["steps"][number]["sourceRoleFocus"]
): string {
  const paths = sourceRoleFocus.map((item) => `${item.path}=${item.role}`).join(", ");
  const processHint = method === "prd-first"
    ? "PRD 초안에는 사용자, 문제, 범위, 제외 범위, acceptance criteria를 포함해줘."
    : method === "sdd-first"
      ? "SDD 흐름으로 Spec, Plan, Tasks, Implement 단계와 각 단계의 산출물을 먼저 분리해줘."
    : method === "test-driven"
      ? "TDD 흐름으로 먼저 실패해야 할 테스트나 검증 명령, 통과 기준, 사람이 확인할 항목을 적어줘."
      : "PRD, SDD, TDD, acceptance criteria 같은 프로세스 용어가 필요한지 판단하고 필요한 경우에만 써줘.";
  return `나는 전통 개발자가 아니라 바이브코딩 개발자야. ${title} 단계에서 ${paths}를 근거로, ${method} 방식으로 비슷한 앱을 만들기 위한 작업 지시문을 작성해줘. 코드를 바로 쓰기 전에 목적, 아키텍처 이유, 필요한 용어, 작은 구현 단위, 검증 기준을 분리해줘. ${processHint}`;
}

function buildDailySummaryReport(
  purposeReport: PurposeReport,
  architectureReport: ArchitectureReport,
  folderLessons: FolderLesson[],
  fileLessons: FileLesson[],
  glossary: GlossaryTerm[],
  rebuildRoadmap: RebuildRoadmap,
  learningJournalReport: LearningJournalReport
): DailySummaryReport {
  const topFolders = folderLessons.slice(0, 3);
  const topFiles = fileLessons.slice(0, 3);
  const coreTerms = glossary.slice(0, 5);
  const firstStep = rebuildRoadmap.steps[0];
  const secondStep = rebuildRoadmap.steps[1];
  const firstPromptPack = learningJournalReport.aiBuildPromptPacks[0];
  const firstBoundary = learningJournalReport.verificationBoundaries[0];
  return {
    summary: "오늘의 학습 요약: 코딩 문법 암기가 아니라, 이 소스를 근거로 비슷한 앱을 바이브코딩하기 위해 필요한 목적, 구조, 용어, 프롬프트, 검증 경계를 정리했습니다.",
    sourcePattern: "CodeTour-style source walkthrough; self-contained semantic HTML daily recap; source-as-evidence not source-as-product-knowledge",
    date: todayIsoDate(),
    learningGoal: "깃허브나 소스 폴더를 받았을 때 AI에게 같은 계열의 앱을 만들도록 지시할 수 있는 mental model을 만든다.",
    sourceHandling: {
      policy: "원본 소스 전체를 앱 지식으로 내장하지 않고, 세션 산출물 안에 필요한 근거와 해석만 남긴다.",
      why: "AI는 일반 개발 지식은 이미 충분히 갖고 있습니다. 학습자에게 필요한 것은 이 저장소에서 확인된 목적, 책임 경계, 용어, 검증 기준을 AI에게 정확히 말하는 능력입니다.",
      retainedArtifacts: [
        { label: "소스 근거", href: "html/evidence.html", purpose: "설명이 실제 파일과 연결되는지 확인합니다." },
        { label: "학습 저널", href: "html/learning-journal.html", purpose: "이해한 것과 다음 복습 질문을 남깁니다." },
        { label: "프롬프트 팩", href: "html/vibe-coding-prompt-pack.html", purpose: "AI에게 다시 지시할 문장으로 압축합니다." },
        { label: "아키텍처 원리", href: "reference/architecture-principle-playbook.html", purpose: "문법 암기 대신 구조 판단과 AI 지시용 원리 카드를 남깁니다." },
        { label: "소스-빌드 인터뷰", href: "reference/source-to-build-interview.html", purpose: "비슷한 앱을 만들기 전 자기 설명 질문과 AI 확인 질문을 남깁니다." },
        { label: "비슷한 앱 전이 지도", href: "reference/similar-app-transfer-map.html", purpose: "원본에서 가져갈 원리와 새 앱에 맞게 바꿀 결정을 남깁니다." },
        { label: "학습자 목표 정렬", href: "reference/learner-goal-alignment.html", purpose: "내 PRD, 이슈, 프롬프트를 소스 기반 목적, 아키텍처, 검증 기준과 맞춥니다." },
        { label: "AI 구현 대화 루프", href: "reference/ai-implementation-loop.html", purpose: "AI 구현 결과를 다음 질문, 수정, 검증 루프로 관리합니다." },
        { label: "구현 브리프", href: "reference/vibe-coding-implementation-brief.html", purpose: "AI에게 넘길 첫 vertical slice, 수락 기준, 검증 계획을 한 장으로 남깁니다." },
        { label: "프롬프트 준비도", href: "reference/ai-prompt-readiness-checklist.html", purpose: "AI에게 보내기 전 맥락, source evidence, acceptance criteria, 검증 assertion을 점검합니다." },
        { label: "프롬프트 A/B 랩", href: "reference/ai-prompt-ab-lab.html", purpose: "막연한 요청과 source-grounded 구현 프롬프트를 비교합니다." },
        { label: "세션 검증", href: "html/session-verification.html", purpose: "생성된 산출물과 링크가 깨지지 않았는지 확인합니다." }
      ],
      cleanupGuidance: [
        "외부 조사 원본은 리포트에 흡수된 뒤 필수 캐시로 남기지 않습니다.",
        "삭제 판단은 원본 소스가 아니라 임시 조사/중간 산출물에만 적용합니다.",
        "소스는 근거이고, 남길 것은 해석과 프롬프트입니다.",
        "보존해야 할 것은 전체 소스 복사본이 아니라 evidence link, 요약, 프롬프트, 검증 결과입니다."
      ]
    },
    takeaways: [
      {
        title: "무엇을 만드는 소스인지 먼저 고정",
        explanation: purposeReport.oneLineSummary,
        relatedHref: "html/overview.html"
      },
      {
        title: "아키텍처는 AI에게 주는 책임 지도",
        explanation: architectureReport.vibeCodingLens,
        relatedHref: "html/architecture.html"
      },
      {
        title: "폴더와 파일은 외울 대상이 아니라 역할 카드",
        explanation: topFiles.map((file) => `${file.filePath}: ${file.role}`).join("; ") || "핵심 파일 역할을 파일 수업에서 확인합니다.",
        relatedHref: "html/files.html"
      },
      {
        title: "검증 경계가 품질을 만든다",
        explanation: firstBoundary
          ? `${firstBoundary.claim} / 다음 확인: ${firstBoundary.nextVerification}`
          : "정적 분석으로 아는 것과 실행/테스트가 필요한 것을 분리합니다.",
        relatedHref: "html/session-verification.html"
      }
    ],
    architectureLens: [
      {
        topic: architectureReport.architectureStyle,
        whyItMatters: architectureReport.architectureRationale,
        promptCue: architectureReport.aiPromptBrief,
        relatedHref: "html/architecture.html"
      },
      ...topFolders.map((folder) => ({
        topic: folder.folderPath,
        whyItMatters: folder.whyItExists,
        promptCue: folder.aiImplementationBrief,
        relatedHref: `html/folders.html#${htmlAnchor(folder.folderPath)}`
      })),
      ...topFiles.map((file) => ({
        topic: file.filePath,
        whyItMatters: file.architectureResponsibility,
        promptCue: file.aiPromptBrief,
        relatedHref: `html/files.html#${htmlAnchor(file.filePath)}`
      }))
    ].slice(0, 7),
    termsToKnow: coreTerms.map((term) => ({
      term: `${term.termKo} (${term.termEn})`,
      simpleMeaning: term.simpleDefinition,
      whyNeeded: term.projectSpecificMeaning,
      promptUse: `AI 설명 요청 후보: "${term.termEn}"를 이 프로젝트의 ${term.projectSpecificMeaning} 맥락으로 설명하고, 내 구현 프롬프트의 책임/수락 기준에 어떻게 써야 할지 알려줘. 보내기 전 소스 근거와 내 목표에 맞게 다듬으세요.`,
      relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
    })),
    promptsToReuse: [
      {
        title: "오늘 배운 소스를 바이브코딩 계획으로 바꾸기",
        prompt: "나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스에서 확인된 목적, 아키텍처 이유, 폴더/파일 책임, 필요한 용어, 검증 경계를 바탕으로 비슷한 앱을 만들기 위한 작업 순서를 먼저 설계해줘. 코드는 아직 쓰지 말고 PRD/SDD/TDD/acceptance criteria가 필요한 지점만 골라서 설명해줘.",
        expectedUse: "새 프로젝트를 시작하기 전 AI에게 방향을 고정시킬 때 사용합니다.",
        relatedHref: "html/vibe-coding-prompt-pack.html"
      },
      {
        title: firstPromptPack ? "학습 저널의 첫 AI 빌드 프롬프트" : "소스 근거 기반 구현 요청",
        prompt: firstPromptPack?.prompt ?? "핵심 파일 하나만 골라 입력, 처리, 출력, 검증 기준을 설명하고 첫 vertical slice 구현 지시문으로 바꿔줘.",
        expectedUse: firstPromptPack?.expectedOutput ?? "작은 구현 단위를 만들기 전에 맥락을 압축합니다.",
        relatedHref: firstPromptPack?.relatedHref ?? "html/learning-journal.html"
      },
      {
        title: firstStep ? `${firstStep.title} 단계 프롬프트` : "첫 단계 프롬프트",
        prompt: firstStep?.aiPrompt ?? "목적과 역할을 먼저 설명하고 첫 작업 단위를 제안해줘.",
        expectedUse: "다음 학습/구현 세션을 시작할 때 사용합니다.",
        relatedHref: "html/rebuild.html"
      }
    ],
    nextSession: [
      {
        task: secondStep?.title ?? "학습 저널 질문 하나에 답하기",
        reason: secondStep?.whyNeeded ?? "오늘 요약을 다음 세션의 시작점으로 연결합니다.",
        relatedHref: "html/rebuild.html"
      },
      {
        task: "프롬프트 팩에서 orient, architect, plan 단계만 먼저 실행",
        reason: "전통 개발 문법 학습으로 빠지지 않고 목적과 구조부터 고정합니다.",
        relatedHref: "html/vibe-coding-prompt-pack.html"
      },
      {
        task: "세션 검증 리포트 확인",
        reason: "정적 분석으로 확인된 사실과 실제 실행이 필요한 가정을 분리합니다.",
        relatedHref: "html/session-verification.html"
      }
    ],
    verificationBoundaries: learningJournalReport.verificationBoundaries.slice(0, 4).map((item) => ({
      claim: item.claim,
      boundary: item.boundary,
      nextCheck: item.nextVerification,
      relatedHref: item.relatedHref
    })),
    learnerNextSteps: [
      "daily-summary.html을 먼저 읽고 오늘 배운 목적, 구조, 용어를 한 문장씩 말해보세요.",
      "vibe-coding-prompt-pack.html의 첫 프롬프트를 내 목표에 맞게 다듬어 AI에게 계획과 검증 기준만 요청하세요.",
      "AI가 코드를 쓰기 전에 source evidence와 verification boundary를 함께 요구하세요.",
      "원본 소스 전체를 외우려 하지 말고, 역할과 검증 기준만 다음 세션으로 가져가세요."
    ]
  };
}

function buildVibeCodingPromptPackReport(
  purposeReport: PurposeReport,
  architectureReport: ArchitectureReport,
  folderLessons: FolderLesson[],
  fileLessons: FileLesson[],
  glossary: GlossaryTerm[],
  rebuildRoadmap: RebuildRoadmap,
  learningJournalReport: LearningJournalReport
): VibeCodingPromptPackReport {
  const topFolders = folderLessons.slice(0, 4);
  const topFiles = fileLessons.slice(0, 4);
  const coreTerms = glossary.slice(0, 6).map((term) => `${term.termKo}(${term.termEn})`).join(", ") || "architecture responsibility, source evidence, verification boundary";
  const firstStep = rebuildRoadmap.steps[0];
  const finalStep = rebuildRoadmap.steps.at(-1);
  const contextBundle: VibeCodingPromptPackReport["contextBundle"] = [
    { label: "Product Mission", evidence: purposeReport.oneLineSummary, relatedHref: "html/index.html" },
    { label: "Architecture Lens", evidence: architectureReport.vibeCodingLens, relatedHref: "html/architecture.html" },
    { label: "Folder Responsibility Map", evidence: topFolders.map((folder) => `${folder.folderPath}: ${folder.role}`).join("; ") || "No folder lessons generated.", relatedHref: "html/folders.html" },
    { label: "Source Role Cards", evidence: topFiles.map((file) => `${file.filePath}: ${file.role}`).join("; ") || "No file lessons generated.", relatedHref: "html/files.html" },
    { label: "Core Terms", evidence: coreTerms, relatedHref: "html/glossary.html" },
    { label: "Verification Boundaries", evidence: learningJournalReport.verificationBoundaries.map((item) => item.boundary).join(", "), relatedHref: "html/learning-journal.html" }
  ];
  const promptSequence: VibeCodingPromptPackReport["promptSequence"] = [
    {
      phase: "orient",
      title: "목적과 제외 범위 고정",
      prompt: `나는 전통 개발자가 아니라 바이브코딩 개발자야. 이 저장소의 목적을 ${purposeReport.oneLineSummary} 기준으로 설명하고, 비슷한 앱을 만들 때 코딩 문법보다 먼저 알아야 할 용어와 제외할 학습 범위를 정리해줘. PRD, SDD, TDD, acceptance criteria 같은 프로세스 용어는 언제 써야 하는지도 같이 구분해줘.`,
      why: "AI에게 코딩을 맡기더라도 제품 목적과 학습 목표는 사람이 고정해야 합니다.",
      inputEvidence: "overview, glossary, learning journal",
      expectedArtifact: "제품 목적, 사용자, 핵심 용어, 제외 범위",
      relatedHref: "html/index.html"
    },
    {
      phase: "architect",
      title: "전체 숲과 책임 경계 설명",
      prompt: `${architectureReport.architectureStyle} 구조를 유지해서 비슷한 앱을 설계해줘. 왜 이 아키텍처가 필요한지, 폴더 책임을 어떻게 나눠야 하는지, AI가 잘못 섞기 쉬운 책임 경계를 먼저 설명해줘.`,
      why: "전체 숲을 이해해야 AI가 파일을 잘못 배치하거나 한 번에 너무 큰 기능을 만들지 않습니다.",
      inputEvidence: "architecture report, folder lessons",
      expectedArtifact: "아키텍처 이유, 폴더 책임표, 경계 위반 위험",
      relatedHref: "html/architecture.html"
    },
    {
      phase: "plan",
      title: "바이브코딩 작업 순서 만들기",
      prompt: firstStep
        ? `${firstStep.title}부터 시작해서 ${rebuildRoadmap.steps.length}단계 작업 계획을 만들어줘. 각 단계마다 목적, 사용할 소스 근거, AI에게 줄 지시문, PRD/SDD 산출물, acceptance criteria, TDD 검증 질문을 분리해줘.`
        : "비슷한 앱을 만들기 위한 작업 계획을 목적, 소스 근거, AI 지시문, PRD/SDD 산출물, acceptance criteria, TDD 검증 질문으로 나눠줘.",
      why: "계획과 구현을 분리하면 AI가 추측으로 바로 코드를 만들 위험을 줄입니다.",
      inputEvidence: "rebuild roadmap, folder lessons, file lessons",
      expectedArtifact: "단계별 구현 계획과 검증 기준",
      relatedHref: "html/rebuild.html"
    },
    {
      phase: "implement",
      title: "첫 vertical slice만 구현",
      prompt: topFiles[0]
        ? `${topFiles[0].filePath}의 역할을 참고해서 첫 번째 작은 기능만 구현해줘. TDD 방식으로 먼저 실패해야 할 테스트나 확인 조건을 쓰고, 변경할 파일, 각 파일의 책임, 변경 뒤 확인할 명령을 함께 보고해줘.`
        : "첫 번째 작은 기능만 구현해줘. TDD 방식으로 먼저 실패해야 할 테스트나 확인 조건을 쓰고, 변경할 파일, 각 파일의 책임, 변경 뒤 확인할 명령을 함께 보고해줘.",
      why: "바이브코딩에서도 작은 단위로 구현해야 사람이 방향과 품질을 검토할 수 있습니다.",
      inputEvidence: "file lessons, source evidence, rebuild roadmap",
      expectedArtifact: "작은 구현 결과, 변경 파일 목록, 확인 명령",
      relatedHref: "html/files.html"
    },
    {
      phase: "verify",
      title: "근거와 실행 검증 분리",
      prompt: "방금 만든 결과를 검증해줘. 정적 소스 근거로 확인된 사실, 테스트 실행이 필요한 항목, 사람이 판단해야 할 제품 결정을 분리하고 다음 확인 명령을 제안해줘.",
      why: "AI 산출물을 믿기 전에 확인된 사실과 가정을 분리해야 합니다.",
      inputEvidence: "evidence index, session verification, learning journal verification boundaries",
      expectedArtifact: "검증 체크리스트, 테스트 필요 항목, 사람 판단 항목",
      relatedHref: "html/session-verification.html"
    },
    {
      phase: "review",
      title: "바이브코딩 리뷰 요청",
      prompt: finalStep
        ? `${finalStep.title}까지 구현됐다고 가정하고 리뷰해줘. 원본 구조와 비교해 빠진 책임, 과한 구현, 잘못된 폴더 배치, 추가 검증이 필요한 부분을 우선순위로 정리해줘.`
        : "현재 산출물을 리뷰해줘. 원본 구조와 비교해 빠진 책임, 과한 구현, 잘못된 폴더 배치, 추가 검증이 필요한 부분을 우선순위로 정리해줘.",
      why: "코딩 자체는 AI가 해도, 방향과 품질을 묻는 리뷰 능력은 학습자가 가져야 합니다.",
      inputEvidence: "architecture, folders, files, rebuild roadmap, verification report",
      expectedArtifact: "리뷰 findings, 수정 프롬프트, 남은 검증",
      relatedHref: "html/rebuild.html"
    }
  ];
  const aiGuardrails: VibeCodingPromptPackReport["aiGuardrails"] = [
    {
      rule: "전체 소스를 앱 지식으로 내장하지 말고 분석 근거로만 사용한다.",
      reason: "AI는 일반 개발지식은 이미 알고 있고, 필요한 것은 해당 저장소의 구조와 책임 근거입니다.",
      verification: "external source cache가 남아 있지 않고 generated report에 흡수 내용만 남는지 확인합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      rule: "코드를 바로 쓰기 전에 목적, 아키텍처, 폴더/파일 책임을 먼저 말하게 한다.",
      reason: "전통 개발자 교육이 아니라 AI에게 올바른 방향을 주는 훈련이 목표입니다.",
      verification: "promptSequence의 orient, architect, plan 단계를 먼저 사용합니다.",
      relatedHref: "html/vibe-coding-prompt-pack.html"
    },
    {
      rule: "정적 분석으로 아는 것과 실행/테스트가 필요한 것을 분리한다.",
      reason: "RepoTutor의 분석은 source-backed이지만 런타임 성공을 자동 보장하지 않습니다.",
      verification: "Verification Questions와 session-verification report를 함께 확인합니다.",
      relatedHref: "html/session-verification.html"
    },
    {
      rule: "PRD, SDD, TDD, acceptance criteria는 장식 용어가 아니라 AI 지시 품질을 높일 때만 사용한다.",
      reason: "바이브코더는 모든 전통 개발 절차를 외우는 것이 아니라, 필요한 프로세스 언어를 골라 AI에게 명확한 산출물과 검증 기준을 요구해야 합니다.",
      verification: "Prompt Pack과 Rebuild Roadmap이 요구사항, 작은 구현 단위, 테스트 기준을 분리하는지 확인합니다.",
      relatedHref: "html/rebuild.html"
    }
  ];
  const learnerChecklist = [
    "목적을 한 문장으로 설명했다.",
    "핵심 용어를 AI에게 설명할 수 있다.",
    "왜 이 아키텍처와 폴더 구조가 필요한지 말할 수 있다.",
    "PRD, SDD, TDD, acceptance criteria를 언제 AI 프롬프트에 넣어야 하는지 구분했다.",
    "핵심 파일의 역할과 연결 관계를 프롬프트에 넣었다.",
    "첫 구현 요청을 작은 vertical slice로 줄였다.",
    "검증 질문과 실행 확인 명령을 AI에게 요구했다."
  ];
  const copyPastePrompt = [
    "나는 전문 개발자가 아니라 바이브코딩 개발자야.",
    `목표: ${purposeReport.oneLineSummary}`,
    `아키텍처 기준: ${architectureReport.architectureStyle}`,
    `핵심 용어: ${coreTerms}`,
    "필요한 프로세스 용어: PRD, SDD, TDD, acceptance criteria, vertical slice, review loop",
    `핵심 폴더: ${topFolders.map((folder) => `${folder.folderPath}=${folder.role}`).join(", ") || "none"}`,
    `핵심 파일: ${topFiles.map((file) => `${file.filePath}=${file.role}`).join(", ") || "none"}`,
    "이 정보를 바탕으로 비슷한 품질의 앱을 만들기 위한 목적, 아키텍처 이유, 폴더/파일 책임, 작은 구현 순서, 검증 질문을 먼저 정리해줘.",
    "코드를 바로 쓰지 말고, 계획과 확인 기준을 먼저 제시해줘."
  ].join("\n");
  return {
    summary: `Vibe-coding prompt pack: ${promptSequence.length}개 단계, ${contextBundle.length}개 context bundle, ${aiGuardrails.length}개 AI guardrail을 생성했습니다.`,
    sourcePattern: "AI-native vibe-coding prompt pack",
    mission: "깃허브 링크나 소스 폴더를 분석한 뒤, 바이브코더가 AI에게 같은 품질의 프로젝트를 만들게 지시할 수 있도록 목적, 구조, 용어, 책임, 검증 기준을 하나의 프롬프트 패키지로 묶습니다.",
    contextBundle,
    promptSequence,
    aiGuardrails,
    learnerChecklist,
    copyPastePrompt
  };
}

function term(termKo: string, termEn: string, simpleDefinition: string, projectSpecificMeaning: string, exampleFromRepo: string, relatedTerms: string[], difficulty: "easy" | "medium" | "hard", reviewPriority: number): GlossaryTerm {
  return {
    termKo,
    termEn,
    simpleDefinition,
    projectSpecificMeaning,
    exampleFromRepo,
    promptUse: `"${termEn}"를 ${projectSpecificMeaning} 맥락에서 설명하고, 비슷한 앱 구현 프롬프트의 책임/수락 기준으로 바꿔줘.`,
    reviewQuestion: `AI 결과가 ${termEn}의 책임을 ${exampleFromRepo} 근거와 맞게 구현했는지, 검증 기준까지 포함했는지 확인하세요.`,
    memorizationWarning: `${termKo}를 문법 세부사항으로 외우지 말고, 언제 AI에게 이 용어를 써야 하는지와 어떤 검증 질문으로 이어지는지만 남기세요.`,
    relatedTerms,
    difficulty,
    reviewPriority
  };
}

function dedupeTerms(terms: GlossaryTerm[]): GlossaryTerm[] {
  const seen = new Set<string>();
  return terms.filter((termValue) => {
    const key = termValue.termEn.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
