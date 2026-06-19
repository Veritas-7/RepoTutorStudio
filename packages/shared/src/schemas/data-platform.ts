import { z } from "zod";

export const SchemaRegistryReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  registrySetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["confluent", "apicurio", "buf", "kafka", "custom", "unknown"]),
    subjectCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    versionCount: z.number().int().nonnegative(),
    compatibilityCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    referenceCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    governanceCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["confluent-schema-registry", "apicurio-registry", "buf-schema-registry", "schema-registry-url", "ccompat-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaFormatSignals: z.array(z.object({
    signal: z.enum(["avro", "protobuf", "json-schema", "openapi", "asyncapi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["subject", "artifact-id", "group-id", "version", "schema-id", "content-id", "global-id", "references", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  compatibilitySignals: z.array(z.object({
    signal: z.enum(["backward", "forward", "full", "transitive", "none", "compatibility-check", "breaking-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["compatibility-rule", "validity-rule", "mode", "lint", "breaking-policy", "managed-mode", "dependency-lock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["schema-register-command", "compatibility-command", "buf-lint", "buf-breaking", "buf-generate", "buf-push", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["schema-registry-client", "kafka-avro-serializer", "kafka-protobuf-serializer", "kafka-json-schema-serializer", "apicurio-client", "buf-cli", "protoc", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataConnectorReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  connectorSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["kafka-connect", "debezium", "airbyte", "custom", "unknown"]),
    sourceCount: z.number().int().nonnegative(),
    sinkCount: z.number().int().nonnegative(),
    workerCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    offsetCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["kafka-connect", "debezium", "airbyte", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  connectorKindSignals: z.array(z.object({
    signal: z.enum(["source-connector", "sink-connector", "cdc-connector", "elt-connection", "embedded-engine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["connector-class", "tasks-max", "plugin-path", "converters", "topics", "topics-regex", "snapshot-mode", "schema-history", "database-include-list", "table-include-list", "slot-name", "publication-name", "source-definition", "destination-definition", "connection-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  protocolSignals: z.array(z.object({
    signal: z.enum(["spec", "check", "discover", "read", "airbyte-catalog", "configured-catalog", "airbyte-stream", "configured-stream", "sync-mode", "destination-sync-mode", "primary-key", "cursor-field", "record-message", "state-message", "trace-message", "stream-status", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["offset-storage-file", "offset-storage-topic", "config-storage-topic", "status-storage-topic", "airbyte-state", "cursor", "incremental-sync", "checkpoint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["smt-transform", "predicate", "regex-router", "mask-field", "extract-field", "hoist-field", "flatten", "normalization", "dbt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["rest-api", "connector-status", "task-status", "pause-resume", "restart", "offset-reset", "dead-letter-queue", "errors-tolerance", "retry", "health-metrics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["connect-standalone", "connect-distributed", "curl-connectors", "airbyte-api", "orchestrator", "docker-compose", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kafka-connect-api", "connect-json", "debezium-connector", "debezium-embedded", "airbyte-cdk", "airbyte-api", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SemanticLayerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  semanticLayerSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["metricflow", "dbt-semantic-layer", "cube", "custom", "unknown"]),
    semanticModelCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    measureCount: z.number().int().nonnegative(),
    dimensionCount: z.number().int().nonnegative(),
    entityCount: z.number().int().nonnegative(),
    joinCount: z.number().int().nonnegative(),
    savedQueryCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    accessCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["metricflow", "dbt-semantic-layer", "cube", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["semantic-model", "cube", "view", "sql-table", "ref-model", "time-spine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metricSignals: z.array(z.object({
    signal: z.enum(["simple-metric", "ratio-metric", "derived-metric", "cumulative-metric", "filtered-metric", "measure", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dimensionSignals: z.array(z.object({
    signal: z.enum(["time-dimension", "categorical-dimension", "dimension-reference", "entity-path", "granularity", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["primary-entity", "foreign-entity", "unique-entity", "entity-relationship", "join", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["saved-query", "metricflow-query", "explain-sql", "display-plan", "sql-api", "rest-api", "graphql-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["pre-aggregation", "rollup", "refresh-key", "partition-granularity", "incremental-refresh", "cache-engine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["access-policy", "row-level-security", "member-security", "security-context", "query-rewrite", "compile-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["mf-tutorial", "validate-configs", "list-metrics", "list-dimensions", "query-command", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["metricflow", "dbt-metricflow", "dbt-semantic-interfaces", "cubejs-server", "cube-client", "cube", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BiDashboardReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dashboardSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["metabase", "superset", "lightdash", "custom", "unknown"]),
    dashboardCount: z.number().int().nonnegative(),
    chartCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    embeddingCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["metabase", "superset", "lightdash", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dashboardSignals: z.array(z.object({
    signal: z.enum(["dashboard", "card", "chart", "slice", "explore", "saved-question", "dashboard-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["sql-query", "native-query", "dataset", "semantic-model", "metric", "dimension", "join", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filterSignals: z.array(z.object({
    signal: z.enum(["parameter", "filter", "field-filter", "dashboard-filter", "date-filter", "cross-filter", "drilldown", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["role", "permission", "row-level-security", "collection-permission", "space-access", "embedding-secret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  embeddingSignals: z.array(z.object({
    signal: z.enum(["iframe", "signed-embed", "public-link", "sdk-embed", "embed-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alertSignals: z.array(z.object({
    signal: z.enum(["alert", "subscription", "pulse", "report-schedule", "slack-email", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["cache", "refresh", "ttl", "async-query", "result-cache", "precomputed", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dashboard-export", "asset-import", "sql-validation", "dbt-sync", "visual-regression", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["metabase", "apache-superset", "lightdash", "echarts", "chartjs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StreamProcessingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  streamProcessingSetups: z.array(z.object({
    filePath: z.string(),
    engine: z.enum(["flink", "beam", "spark", "custom", "unknown"]),
    jobCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    watermarkCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    checkpointCount: z.number().int().nonnegative(),
    sinkCount: z.number().int().nonnegative(),
    deploymentCount: z.number().int().nonnegative(),
    monitoringCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  engineSignals: z.array(z.object({
    signal: z.enum(["apache-flink", "apache-beam", "spark-structured-streaming", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  jobSignals: z.array(z.object({
    signal: z.enum(["stream-execution-environment", "datastream", "beam-pipeline", "pcollection", "readstream", "writestream", "streaming-query", "runner", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sourceSignals: z.array(z.object({
    signal: z.enum(["kafka-source", "file-source", "socket-source", "pubsub-source", "kinesis-source", "pulsar-source", "custom-source", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["map", "flatmap", "filter", "keyby", "par-do", "group-by-key", "aggregation", "join", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  windowSignals: z.array(z.object({
    signal: z.enum(["tumbling-window", "sliding-window", "session-window", "fixed-window", "trigger", "allowed-lateness", "late-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  watermarkSignals: z.array(z.object({
    signal: z.enum(["watermark-strategy", "with-watermark", "event-time", "processing-time", "timestamp-assigner", "idle-source", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["keyed-state", "value-state", "map-state", "state-store", "rocksdb", "timer", "ttl", "map-groups-with-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checkpointSignals: z.array(z.object({
    signal: z.enum(["checkpointing", "checkpoint-location", "savepoint", "restart-strategy", "exactly-once-mode", "checkpoint-timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sinkSignals: z.array(z.object({
    signal: z.enum(["kafka-sink", "file-sink", "jdbc-sink", "bigquery-sink", "foreach-batch", "two-phase-commit", "exactly-once-sink", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["flink-runner", "spark-runner", "cluster-submit", "kubernetes", "yarn", "operator", "jobmanager", "taskmanager", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  monitoringSignals: z.array(z.object({
    signal: z.enum(["metrics", "backpressure", "checkpoint-metrics", "lag", "streaming-query-listener", "job-status", "alert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "stream-job-smoke", "checkpoint-smoke", "window-smoke", "sink-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["flink-streaming", "flink-connector", "beam-sdk", "beam-runner", "spark-sql", "spark-streaming", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PipelineOrchestrationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pipelineOrchestrationSetups: z.array(z.object({
    filePath: z.string(),
    orchestrator: z.enum(["airflow", "dagster", "prefect", "custom", "unknown"]),
    dagCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    sensorCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    partitionCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    backfillCount: z.number().int().nonnegative(),
    executorCount: z.number().int().nonnegative(),
    deploymentCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  orchestratorSignals: z.array(z.object({
    signal: z.enum(["apache-airflow", "dagster", "prefect", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authoringSignals: z.array(z.object({
    signal: z.enum(["airflow-sdk", "dag-decorator", "task-decorator", "asset-authoring", "task-group", "setup-teardown", "params", "context", "trigger-rule", "legacy-import", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dagSignals: z.array(z.object({
    signal: z.enum(["airflow-dag", "dagster-job", "prefect-flow", "taskflow", "graph", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["airflow-operator", "airflow-task", "dagster-op", "dagster-asset", "prefect-task", "mapped-task", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["task-dependency", "task-group", "branching", "dynamic-mapping", "subflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scheduleSignals: z.array(z.object({
    signal: z.enum(["cron-schedule", "interval-schedule", "timetable", "schedule-definition", "catchup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sensorSignals: z.array(z.object({
    signal: z.enum(["airflow-sensor", "dagster-sensor", "prefect-event", "external-task", "dataset-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["dagster-asset", "airflow-dataset", "prefect-result", "materialization", "lineage", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  partitionSignals: z.array(z.object({
    signal: z.enum(["dagster-partition", "dynamic-partition", "airflow-backfill-date", "prefect-parameter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["retry-policy", "sla", "timeout", "pool-concurrency", "queue", "idempotency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executorSignals: z.array(z.object({
    signal: z.enum(["airflow-executor", "celery", "kubernetes-executor", "dagster-daemon", "prefect-worker", "work-pool", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["airflow-deployment", "dagster-definitions", "prefect-deployment", "docker", "kubernetes", "helm", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["dag-run-history", "task-logs", "asset-observability", "metrics", "alerts", "openlineage", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dag-parse-smoke", "orchestration-unit-test", "backfill-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["apache-airflow", "dagster", "prefect", "airflow-provider", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export type SchemaRegistryReadinessReport = z.infer<typeof SchemaRegistryReadinessReportSchema>;
export type DataConnectorReadinessReport = z.infer<typeof DataConnectorReadinessReportSchema>;
export type SemanticLayerReadinessReport = z.infer<typeof SemanticLayerReadinessReportSchema>;
export type BiDashboardReadinessReport = z.infer<typeof BiDashboardReadinessReportSchema>;
export type StreamProcessingReadinessReport = z.infer<typeof StreamProcessingReadinessReportSchema>;
export type PipelineOrchestrationReadinessReport = z.infer<typeof PipelineOrchestrationReadinessReportSchema>;
