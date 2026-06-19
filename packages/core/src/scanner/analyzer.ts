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
import { walkSafe } from "../fs-utils.js";
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
import { buildProvenanceReport, buildScorecardReport } from "./scorecard-provenance.js";
import { buildLearningJournalReport, buildSearchIndexReport } from "./search-journal.js";
import { buildComponentGraphReport, buildSourceSnapshotReport } from "./component-snapshot.js";
import { buildDailySummaryReport, buildGlossary, buildRebuildRoadmap, buildVibeCodingPromptPackReport } from "./summary-prompt-pack.js";
import { buildDependencyHealthReport, buildFlowReport, buildProjectActivityReport, emptyIncrementalReport } from "./overview-reports.js";
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
