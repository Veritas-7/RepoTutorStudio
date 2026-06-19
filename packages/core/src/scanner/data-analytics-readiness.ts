import type { BiDashboardReadinessReport, DataConnectorReadinessReport, SemanticLayerReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDataConnectorReadinessReport(walk: WalkResult): Promise<DataConnectorReadinessReport> {
  const sourceFiles = await dataConnectorReadinessSourceFiles(walk);
  const connectorSetups = dataConnectorReadinessSetups(sourceFiles);
  const platformSignals = dataConnectorReadinessPlatformSignals(sourceFiles);
  const connectorKindSignals = dataConnectorReadinessKindSignals(sourceFiles);
  const configSignals = dataConnectorReadinessConfigSignals(sourceFiles);
  const protocolSignals = dataConnectorReadinessProtocolSignals(sourceFiles);
  const stateSignals = dataConnectorReadinessStateSignals(sourceFiles);
  const transformSignals = dataConnectorReadinessTransformSignals(sourceFiles);
  const opsSignals = dataConnectorReadinessOpsSignals(sourceFiles);
  const workflowSignals = dataConnectorReadinessWorkflowSignals(sourceFiles);
  const packageSignals = dataConnectorReadinessPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasConnector = connectorKindSignals.some((item) => item.readiness === "ready") || connectorSetups.some((item) => item.sourceCount + item.sinkCount > 0);
  const hasConfig = configSignals.some((item) => item.readiness === "ready") || connectorSetups.some((item) => item.configCount > 0);
  const hasProtocol = protocolSignals.some((item) => item.readiness === "ready");
  const hasState = stateSignals.some((item) => item.readiness === "ready") || connectorSetups.some((item) => item.offsetCount + item.stateCount > 0);
  const hasOps = opsSignals.some((item) => item.readiness === "ready") || connectorSetups.some((item) => item.errorCount + item.apiCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || connectorSetups.some((item) => item.workflowCount > 0);
  const hasTransform = transformSignals.some((item) => item.readiness === "ready") || connectorSetups.some((item) => item.transformCount > 0);

  const riskQueue: DataConnectorReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasConnector) {
    riskQueue.push({
      priority: "high",
      action: "Add a concrete Kafka Connect, Debezium, Airbyte, or custom connector surface before claiming data connector readiness.",
      why: "Connector readiness starts from an owned source/sink connector, CDC connector, Airbyte connection, or embedded connector engine.",
      relatedHref: "html/data-connector-readiness.html"
    });
  }
  if (hasConnector && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Document connector class, tasks, plugin path, source/destination definitions, or CDC include lists.",
      why: "Operators need the connector identity and configuration boundary before reviewing runtime behavior.",
      relatedHref: "html/data-connector-readiness.html"
    });
  }
  if (hasConnector && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Add offset, state, cursor, incremental sync, checkpoint, or storage-topic evidence.",
      why: "Connectors are replay systems; without state evidence, restart and backfill behavior is ambiguous.",
      relatedHref: "html/data-connector-readiness.html"
    });
  }
  if (hasConnector && !hasProtocol) {
    riskQueue.push({
      priority: "medium",
      action: "Add Airbyte protocol, catalog, stream, sync-mode, and message contract evidence.",
      why: "Airbyte connector review depends on the Spec, Check, Discover, Read lifecycle and the catalog/message protocol shape, not only source and destination IDs.",
      relatedHref: "html/data-connector-readiness.html"
    });
  }
  if (hasConnector && !hasOps) {
    riskQueue.push({
      priority: "medium",
      action: "Add REST/status/task/error handling evidence for connector operations.",
      why: "Connector failures are usually observed through REST status, task state, DLQ, retry, and tolerance settings.",
      relatedHref: "html/data-connector-readiness.html"
    });
  }
  if (hasConnector && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add repeatable commands or CI artifacts for connector validation.",
      why: "Static connector readiness is stronger when worker startup, API calls, or sync checks are recorded as reproducible commands.",
      relatedHref: "html/data-connector-readiness.html"
    });
  }
  if ((hasConnector || hasConfig) && !hasTransform) {
    riskQueue.push({
      priority: "low",
      action: "Document whether transforms, predicates, normalization, or dbt are intentionally used or absent.",
      why: "Connectors often reshape records; learners should know whether topic routing, masking, flattening, or normalization is part of the contract.",
      relatedHref: "html/data-connector-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run connector commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records data connector readiness only; it does not start Kafka Connect, deploy Debezium, call Airbyte APIs, create connectors, reset offsets, run syncs, or move data.",
    relatedHref: "html/data-connector-readiness.html"
  });

  return {
    summary: `Data connector readiness report: setup ${connectorSetups.length}개, platform signal ${platformSignals.length}개, config signal ${configSignals.length}개, protocol signal ${protocolSignals.length}개, ops signal ${opsSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Data connector readiness Debezium Kafka Connect Airbyte Spec Check Discover Read AirbyteCatalog ConfiguredAirbyteCatalog AirbyteStream ConfiguredAirbyteStream SyncMode DestinationSyncMode primary_key cursor_field AirbyteRecordMessage AirbyteStateMessage AirbyteTraceMessage stream status SourceConnector SinkConnector connector.class tasks.max plugin.path transforms predicates offset.storage.topic status.storage.topic CDC snapshot schema history sync catalog state",
    connectorSetups,
    platformSignals,
    connectorKindSignals,
    configSignals,
    protocolSignals,
    stateSignals,
    transformSignals,
    opsSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"connector.class|tasks.max|plugin.path|connect-distributed|connect-standalone|/connectors\" .", purpose: "Find Kafka Connect worker, connector class, task, plugin, and REST management surfaces." },
      { command: "rg \"Debezium|snapshot.mode|schema.history|slot.name|publication.name|topic.prefix|database.include.list|table.include.list\" .", purpose: "Review Debezium CDC snapshot, schema history, replication slot/publication, topic prefix, and include-list configuration." },
      { command: "rg \"Spec|Check|Discover|Read|AirbyteCatalog|ConfiguredAirbyteCatalog|AirbyteRecordMessage|AirbyteStateMessage|AirbyteTraceMessage|supported_sync_modes|primary_key|cursor_field\" .", purpose: "Review Airbyte protocol lifecycle, catalog/stream shape, sync modes, keys, cursors, record/state/trace messages, and stream status." },
      { command: "rg \"Airbyte|sourceId|destinationId|connectionId|configuredCatalog|syncMode|cursor|state|checkpoint\" .", purpose: "Inventory Airbyte sources, destinations, connections, catalogs, sync modes, cursors, and state handling." },
      { command: "rg \"transforms\\\\.|predicates\\\\.|RegexRouter|MaskField|ExtractField|HoistField|Flatten|normalization|dbt\" .", purpose: "Check single-message transforms, predicates, topic routing, masking, flattening, and normalization contracts." },
      { command: "rg \"errors.deadletterqueue|errors.tolerance|offset.storage|status.storage|config.storage|restart|pause|resume|tasks/.*/status|upload-artifact\" .github .", purpose: "Check connector error handling, storage topics, restart/pause/resume operations, task status, and retained artifacts." }
    ],
    learnerNextSteps: [
      "먼저 Kafka Connect, Debezium, Airbyte 중 어떤 connector runtime이 있는지 확인하고 source/sink/CDC/ELT 경계를 표시하세요.",
      "connector.class, tasks.max, plugin.path, source/destination definition, include list 같은 config ownership을 runtime별로 묶으세요.",
      "Airbyte가 있으면 Spec, Check, Discover, Read, AirbyteCatalog, ConfiguredAirbyteCatalog, stream, sync mode, primary key, cursor, record/state/trace message 계약을 분리해 확인하세요.",
      "offset.storage, config.storage, status.storage, Airbyte state, cursor, checkpoint가 어디에 저장되는지 확인해 restart/replay 동작을 설명하세요.",
      "transforms, predicates, RegexRouter, MaskField, Flatten, normalization, dbt가 record shape을 바꾸는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 connector 생성, offset reset, Debezium deployment, Airbyte sync 실행은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type DataConnectorReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataConnectorReadinessSourceFiles(walk: WalkResult): Promise<DataConnectorReadinessSourceFile[]> {
  const files: DataConnectorReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dataConnectorReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!dataConnectorReadinessPathSignal(file.relPath) && !dataConnectorReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function dataConnectorReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dataConnectorReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|build\.gradle|settings\.gradle|pom\.xml|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|connect[-_].*\.properties|.*connector.*\.properties|.*connector.*\.json|airbyte.*\.json|catalog\.json|configured_catalog\.json|\.env\.example|\.env\.sample)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|java|kt|scala|py|go|rs|json|md|mdx|ya?ml|toml|properties|conf|env|sql)$/i.test(filePath);
}

function dataConnectorReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(connectors?|kafka[-_]?connect|debezium|airbyte|cdc|change[-_]?data|elt|etl|replication|source[-_]?connector|sink[-_]?connector|catalog|sync|normalization|transforms?|predicates?)(\/|\.|-|_|$)|\.github\/workflows|docker-compose|compose\.ya?ml/i.test(filePath);
}

function dataConnectorReadinessContentSignal(text: string): boolean {
  return /\b(Kafka Connect|connect-distributed|connect-standalone|connector\.class|tasks\.max|plugin\.path|SourceConnector|SinkConnector|offset\.storage|config\.storage|status\.storage|transforms\.|predicates\.|errors\.deadletterqueue|Debezium|snapshot\.mode|schema\.history|slot\.name|publication\.name|topic\.prefix|database\.include\.list|table\.include\.list|Airbyte|sourceId|destinationId|connectionId|configuredCatalog|syncMode|cursor|checkpoint|AirbyteCatalog|ConfiguredAirbyteCatalog|AirbyteRecordMessage|AirbyteStateMessage|AirbyteTraceMessage|AirbyteStreamStatus|supported_sync_modes|primary_key|cursor_field|normalization|dbt)\b/i.test(text);
}

function dataConnectorReadinessSetups(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["connectorSetups"] {
  const rows: DataConnectorReadinessReport["connectorSetups"] = [];
  for (const source of sourceFiles) {
    const sourceCount = countMatches(source.text, /\bSourceConnector\b|FileStreamSource|source connector|sourceDefinition|sourceId|sourceType|source\.|Debezium|CDC|change events?|read\s*\(/gi);
    const sinkCount = countMatches(source.text, /\bSinkConnector\b|FileStreamSink|sink connector|destinationDefinition|destinationId|destinationType|destination\.|write\s*\(|topics(\.regex)?\b/gi);
    const workerCount = countMatches(source.text, /connect-standalone|connect-distributed|standalone mode|distributed mode|worker configuration|bootstrap\.servers|group\.id|plugin\.path|listeners=/gi);
    const configCount = countMatches(source.text, /connector\.class|tasks\.max|plugin\.path|key\.converter|value\.converter|topics\.regex|snapshot\.mode|schema\.history|topic\.prefix|database\.include\.list|table\.include\.list|slot\.name|publication\.name|sourceDefinition|destinationDefinition|connectionId|configuredCatalog/gi);
    const offsetCount = countMatches(source.text, /offset\.storage(\.topic|\.file\.filename)?|offsets? endpoint|\/offsets|offset reset|commit offsets?|checkpoint_target_interval_seconds|checkpoint/gi);
    const stateCount = countMatches(source.text, /status\.storage\.topic|config\.storage\.topic|AirbyteStateMessage|state message|cursor|incremental|syncMode|state|checkpoint/gi);
    const transformCount = countMatches(source.text, /transforms\.|predicates\.|RegexRouter|MaskField|ExtractField|HoistField|Flatten|InsertField|TimestampRouter|normalization|dbt/gi);
    const errorCount = countMatches(source.text, /errors\.deadletterqueue|dead[-_ ]?letter|errors\.tolerance|retry|failed status|FAILED|pause|resume|restart|tolerance|DLQ/gi);
    const apiCount = countMatches(source.text, /\/connectors|GET \/connectors|POST \/connectors|PUT \/connectors|PATCH \/connectors|DELETE \/connectors|\/status|\/tasks|Airbyte API|\/api\/public\/v1|sources\?|connections\?|jobs\?/gi);
    const workflowCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|connect-standalone|connect-distributed|curl .*\/connectors|airbyte api|Airflow|Dagster|Kestra|docker compose|docker-compose|upload-artifact/gi);
    const hasSetupSignal = sourceCount + sinkCount + workerCount + configCount + offsetCount + stateCount + transformCount + errorCount + apiCount + workflowCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: dataConnectorReadinessPlatform(source),
      sourceCount,
      sinkCount,
      workerCount,
      configCount,
      offsetCount,
      stateCount,
      transformCount,
      errorCount,
      apiCount,
      workflowCount,
      readiness: (sourceCount + sinkCount > 0) && configCount > 0 && (offsetCount + stateCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains source ${sourceCount}, sink ${sinkCount}, worker ${workerCount}, config ${configCount}, offset ${offsetCount}, state ${stateCount}, transform ${transformCount}, error ${errorCount}, API ${apiCount}, workflow ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function dataConnectorReadinessPlatform(source: DataConnectorReadinessSourceFile): DataConnectorReadinessReport["connectorSetups"][number]["platform"] {
  if (/Airbyte|airbyte/i.test(source.filePath) || /Airbyte|sourceId|destinationId|connectionId|configuredCatalog|AirbyteStateMessage|syncMode/i.test(source.text)) return "airbyte";
  if (/Debezium|debezium/i.test(source.filePath) || /Debezium|snapshot\.mode|schema\.history|topic\.prefix|slot\.name|publication\.name/i.test(source.text)) return "debezium";
  if (/kafka[-_]?connect|connectors?/i.test(source.filePath) || /Kafka Connect|connect-distributed|connect-standalone|connector\.class|SourceConnector|SinkConnector/i.test(source.text)) return "kafka-connect";
  if (/connector|CDC|ELT|ETL|data movement/i.test(source.text)) return "custom";
  return "unknown";
}

function dataConnectorReadinessPlatformSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["platformSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kafka-connect", pattern: /Kafka Connect|connect-distributed|connect-standalone|org\.apache\.kafka\.connect|connector\.class/i, evidence: "Kafka Connect evidence was detected." },
    { signal: "debezium", pattern: /Debezium|io\.debezium|snapshot\.mode|schema\.history|topic\.prefix/i, evidence: "Debezium CDC evidence was detected." },
    { signal: "airbyte", pattern: /Airbyte|airbyte-cdk|sourceId|destinationId|connectionId|configuredCatalog/i, evidence: "Airbyte data movement evidence was detected." },
    { signal: "custom", pattern: /custom connector|data connector|CDC|ELT|ETL|data movement/i, evidence: "custom connector evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function dataConnectorReadinessKindSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["connectorKindSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["connectorKindSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "source-connector", pattern: /SourceConnector|FileStreamSource|source connector|sourceDefinition|sourceId|sourceType/i, evidence: "source connector evidence was detected." },
    { signal: "sink-connector", pattern: /SinkConnector|FileStreamSink|sink connector|destinationDefinition|destinationId|destinationType/i, evidence: "sink connector evidence was detected." },
    { signal: "cdc-connector", pattern: /Debezium|CDC|change data capture|change events?|binlog|logical decoding|replication slot|oplog/i, evidence: "CDC connector evidence was detected." },
    { signal: "elt-connection", pattern: /Airbyte|ELT|ETL|connectionId|syncMode|configuredCatalog|destination/i, evidence: "ELT connection evidence was detected." },
    { signal: "embedded-engine", pattern: /DebeziumEngine|EmbeddedEngine|embedded connector|record the progress of the connector/i, evidence: "embedded connector engine evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "connector kind", "signal");
}

function dataConnectorReadinessConfigSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["configSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "connector-class", pattern: /connector\.class|ConnectorConfig|SourceConnector|SinkConnector/i, evidence: "connector class evidence was detected." },
    { signal: "tasks-max", pattern: /tasks\.max|max tasks|maximum number of tasks/i, evidence: "tasks.max evidence was detected." },
    { signal: "plugin-path", pattern: /plugin\.path|plugin path|Connect plugins/i, evidence: "plugin path evidence was detected." },
    { signal: "converters", pattern: /key\.converter|value\.converter|JsonConverter|AvroConverter|converter schemas/i, evidence: "converter configuration evidence was detected." },
    { signal: "topics", pattern: /\btopics\b|topic=|topic\.prefix|topic prefix/i, evidence: "topics evidence was detected." },
    { signal: "topics-regex", pattern: /topics\.regex|topic regex|TopicNameMatches/i, evidence: "topics regex evidence was detected." },
    { signal: "snapshot-mode", pattern: /snapshot\.mode|snapshot mode|initial snapshot/i, evidence: "snapshot mode evidence was detected." },
    { signal: "schema-history", pattern: /schema\.history|database\.history|schema history/i, evidence: "schema history evidence was detected." },
    { signal: "database-include-list", pattern: /database\.include\.list|database\.whitelist|database include/i, evidence: "database include-list evidence was detected." },
    { signal: "table-include-list", pattern: /table\.include\.list|table\.whitelist|table include/i, evidence: "table include-list evidence was detected." },
    { signal: "slot-name", pattern: /slot\.name|replication slot/i, evidence: "replication slot evidence was detected." },
    { signal: "publication-name", pattern: /publication\.name|publication\.autocreate|publication name/i, evidence: "publication evidence was detected." },
    { signal: "source-definition", pattern: /sourceDefinition|sourceId|sourceType|source connector definition/i, evidence: "source definition evidence was detected." },
    { signal: "destination-definition", pattern: /destinationDefinition|destinationId|destinationType|destination connector definition/i, evidence: "destination definition evidence was detected." },
    { signal: "connection-id", pattern: /connectionId|connection ID|AirbyteConnection|connections\//i, evidence: "connection ID evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function dataConnectorReadinessProtocolSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["protocolSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["protocolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "spec", pattern: /Airbyte Spec|spec\.ya?ml|connectionSpecification|ConnectorSpecification/i, evidence: "Airbyte Spec lifecycle evidence was detected." },
    { signal: "check", pattern: /Airbyte Check|check_connection|check connection/i, evidence: "Airbyte Check lifecycle evidence was detected." },
    { signal: "discover", pattern: /Airbyte Discover|AirbyteCatalog/i, evidence: "Airbyte Discover lifecycle evidence was detected." },
    { signal: "read", pattern: /Airbyte Read|AirbyteRecordMessage|read\s*\(/i, evidence: "Airbyte Read lifecycle evidence was detected." },
    { signal: "airbyte-catalog", pattern: /AirbyteCatalog/i, evidence: "AirbyteCatalog evidence was detected." },
    { signal: "configured-catalog", pattern: /ConfiguredAirbyteCatalog|configuredCatalog/i, evidence: "ConfiguredAirbyteCatalog evidence was detected." },
    { signal: "airbyte-stream", pattern: /AirbyteStream|supported_sync_modes|json_schema/i, evidence: "Airbyte stream evidence was detected." },
    { signal: "configured-stream", pattern: /ConfiguredAirbyteStream|configured stream|configuredCatalog/i, evidence: "configured stream evidence was detected." },
    { signal: "sync-mode", pattern: /SyncMode|syncMode|supported_sync_modes|full_refresh|incremental/i, evidence: "sync mode evidence was detected." },
    { signal: "destination-sync-mode", pattern: /DestinationSyncMode|destination sync mode|append_dedup|overwrite/i, evidence: "destination sync mode evidence was detected." },
    { signal: "primary-key", pattern: /primary_key|primary key|primaryKey/i, evidence: "primary key evidence was detected." },
    { signal: "cursor-field", pattern: /cursor_field|cursor field|cursorField|cursor/i, evidence: "cursor field evidence was detected." },
    { signal: "record-message", pattern: /AirbyteRecordMessage|\bRECORD\b|record message/i, evidence: "record message evidence was detected." },
    { signal: "state-message", pattern: /AirbyteStateMessage|\bSTATE\b|state message/i, evidence: "state message evidence was detected." },
    { signal: "trace-message", pattern: /AirbyteTraceMessage|\bTRACE\b|trace message/i, evidence: "trace message evidence was detected." },
    { signal: "stream-status", pattern: /AirbyteStreamStatus|stream status|STREAM_STATUS/i, evidence: "stream status evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "protocol", "signal");
}

function dataConnectorReadinessStateSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["stateSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "offset-storage-file", pattern: /offset\.storage\.file\.filename|offset storage file/i, evidence: "offset storage file evidence was detected." },
    { signal: "offset-storage-topic", pattern: /offset\.storage\.topic|offsets topic|offset commit data/i, evidence: "offset storage topic evidence was detected." },
    { signal: "config-storage-topic", pattern: /config\.storage\.topic|connector and task configurations/i, evidence: "config storage topic evidence was detected." },
    { signal: "status-storage-topic", pattern: /status\.storage\.topic|task statuses|status topic/i, evidence: "status storage topic evidence was detected." },
    { signal: "airbyte-state", pattern: /AirbyteStateMessage|state message|STATE\b|stream state|global state/i, evidence: "Airbyte state evidence was detected." },
    { signal: "cursor", pattern: /cursor|cursor_field|cursor method|cursor_method/i, evidence: "cursor evidence was detected." },
    { signal: "incremental-sync", pattern: /incremental|syncMode|sync mode|dedup/i, evidence: "incremental sync evidence was detected." },
    { signal: "checkpoint", pattern: /checkpoint|checkpoint_target_interval_seconds|checkpoint interval/i, evidence: "checkpoint evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function dataConnectorReadinessTransformSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["transformSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["transformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "smt-transform", pattern: /transforms\.|single message transform|SMT|InsertField|TimestampRouter|SetSchemaMetadata/i, evidence: "single-message transform evidence was detected." },
    { signal: "predicate", pattern: /predicates\.|TopicNameMatches|HasHeaderKey|RecordIsTombstone|predicate=/i, evidence: "predicate evidence was detected." },
    { signal: "regex-router", pattern: /RegexRouter|regex router/i, evidence: "RegexRouter evidence was detected." },
    { signal: "mask-field", pattern: /MaskField|mask field|field masking/i, evidence: "MaskField evidence was detected." },
    { signal: "extract-field", pattern: /ExtractField|extract field/i, evidence: "ExtractField evidence was detected." },
    { signal: "hoist-field", pattern: /HoistField|hoist field/i, evidence: "HoistField evidence was detected." },
    { signal: "flatten", pattern: /Flatten|flatten nested/i, evidence: "Flatten evidence was detected." },
    { signal: "normalization", pattern: /normalization|normalize\/|base-normalization/i, evidence: "normalization evidence was detected." },
    { signal: "dbt", pattern: /\bdbt\b|dbt project|profiles\.yml/i, evidence: "dbt transformation evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "transform", "signal");
}

function dataConnectorReadinessOpsSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["opsSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["opsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rest-api", pattern: /REST API|\/connectors|GET \/connectors|POST \/connectors|\/api\/public\/v1|Airbyte API/i, evidence: "connector REST/API evidence was detected." },
    { signal: "connector-status", pattern: /\/connectors\/\{name\}\/status|connector status|current status of the connector/i, evidence: "connector status evidence was detected." },
    { signal: "task-status", pattern: /\/tasks\/\{taskid\}\/status|task status|state of all its tasks/i, evidence: "task status evidence was detected." },
    { signal: "pause-resume", pattern: /\/pause|\/resume|pause the connector|resume a paused|PAUSED|STOPPED|RUNNING/i, evidence: "pause/resume evidence was detected." },
    { signal: "restart", pattern: /\/restart|restart an individual task|onlyFailed|includeTasks/i, evidence: "restart evidence was detected." },
    { signal: "offset-reset", pattern: /DELETE .*\/offsets|PATCH .*\/offsets|reset the offsets|alter the offsets|offset reset/i, evidence: "offset reset evidence was detected." },
    { signal: "dead-letter-queue", pattern: /errors\.deadletterqueue|dead[-_ ]?letter|DLQ/i, evidence: "dead-letter queue evidence was detected." },
    { signal: "errors-tolerance", pattern: /errors\.tolerance|tolerance|errors\.log\.enable/i, evidence: "error tolerance evidence was detected." },
    { signal: "retry", pattern: /retry|backoff|attempts|failure retry/i, evidence: "retry evidence was detected." },
    { signal: "health-metrics", pattern: /health|metrics?|JMX|Prometheus|usage|monitoring/i, evidence: "health or metrics evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "ops", "signal");
}

function dataConnectorReadinessWorkflowSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "connect-standalone", pattern: /connect-standalone|standalone mode/i, evidence: "connect-standalone workflow evidence was detected." },
    { signal: "connect-distributed", pattern: /connect-distributed|distributed mode/i, evidence: "connect-distributed workflow evidence was detected." },
    { signal: "curl-connectors", pattern: /curl .*\/connectors|POST .*\/connectors|PUT .*\/connectors/i, evidence: "curl connector API workflow evidence was detected." },
    { signal: "airbyte-api", pattern: /Airbyte API|api\.airbyte\.com|\/api\/public\/v1|reference\.airbyte\.com/i, evidence: "Airbyte API workflow evidence was detected." },
    { signal: "orchestrator", pattern: /Airflow|Dagster|Kestra|orchestrate Airbyte syncs|operator/i, evidence: "orchestrated sync evidence was detected." },
    { signal: "docker-compose", pattern: /docker compose|docker-compose|compose\.ya?ml/i, evidence: "Docker Compose workflow evidence was detected." },
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|connector-readiness-report\.json|connect-status\.json|airbyte-sync-report\.json|debezium-report\.json/i, evidence: "connector readiness artifact upload evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function dataConnectorReadinessPackageSignals(sourceFiles: DataConnectorReadinessSourceFile[]): DataConnectorReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataConnectorReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kafka-connect-api", pattern: /org\.apache\.kafka:connect-api|kafka-connect|connect-api|org\.apache\.kafka\.connect/i, evidence: "Kafka Connect API package evidence was detected." },
    { signal: "connect-json", pattern: /connect-json|JsonConverter|org\.apache\.kafka\.connect\.json/i, evidence: "Kafka Connect JSON converter evidence was detected." },
    { signal: "debezium-connector", pattern: /io\.debezium|debezium-connector|debezium.*postgres|debezium.*mysql|debezium.*sqlserver/i, evidence: "Debezium connector package evidence was detected." },
    { signal: "debezium-embedded", pattern: /debezium-embedded|DebeziumEngine|EmbeddedEngine/i, evidence: "Debezium embedded package evidence was detected." },
    { signal: "airbyte-cdk", pattern: /airbyte-cdk|airbyte_cdk|Airbyte CDK/i, evidence: "Airbyte CDK package evidence was detected." },
    { signal: "airbyte-api", pattern: /airbyte-api|Airbyte API|airbytehq\/airbyte/i, evidence: "Airbyte API package evidence was detected." },
    { signal: "custom", pattern: /connector sdk|custom connector|data connector/i, evidence: "custom connector package evidence was detected." }
  ];
  return dataConnectorReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataConnectorReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataConnectorReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/data-connector-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSemanticLayerReadinessReport(walk: WalkResult): Promise<SemanticLayerReadinessReport> {
  const sourceFiles = await semanticLayerReadinessSourceFiles(walk);
  const semanticLayerSetups = semanticLayerReadinessSetups(sourceFiles);
  const platformSignals = semanticLayerReadinessPlatformSignals(sourceFiles);
  const modelSignals = semanticLayerReadinessModelSignals(sourceFiles);
  const metricSignals = semanticLayerReadinessMetricSignals(sourceFiles);
  const dimensionSignals = semanticLayerReadinessDimensionSignals(sourceFiles);
  const entitySignals = semanticLayerReadinessEntitySignals(sourceFiles);
  const querySignals = semanticLayerReadinessQuerySignals(sourceFiles);
  const cacheSignals = semanticLayerReadinessCacheSignals(sourceFiles);
  const accessSignals = semanticLayerReadinessAccessSignals(sourceFiles);
  const workflowSignals = semanticLayerReadinessWorkflowSignals(sourceFiles);
  const packageSignals = semanticLayerReadinessPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasModel = modelSignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.semanticModelCount + item.joinCount > 0);
  const hasMetric = metricSignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.metricCount + item.measureCount > 0);
  const hasDimension = dimensionSignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.dimensionCount > 0);
  const hasEntity = entitySignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.entityCount + item.joinCount > 0);
  const hasQuery = querySignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.savedQueryCount + item.apiCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.workflowCount > 0);
  const hasAccess = accessSignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.accessCount > 0);
  const hasCache = cacheSignals.some((item) => item.readiness === "ready") || semanticLayerSetups.some((item) => item.cacheCount > 0);

  const riskQueue: SemanticLayerReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasModel) {
    riskQueue.push({
      priority: "high",
      action: "Add a concrete MetricFlow, dbt semantic layer, Cube, or custom semantic model surface before claiming semantic layer readiness.",
      why: "Semantic layer readiness starts from an owned model surface that defines business concepts above raw tables.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  if (hasModel && !hasMetric) {
    riskQueue.push({
      priority: "high",
      action: "Define metrics, measures, or calculated metric types beside the semantic models.",
      why: "A semantic layer without metric definitions cannot explain the business numbers it serves.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  if (hasMetric && !hasDimension) {
    riskQueue.push({
      priority: "high",
      action: "Add time, categorical, dimension-reference, or granularity evidence for metric slicing.",
      why: "Metrics need declared dimensions and time grains before learners can understand query shape.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  if (hasMetric && !hasEntity) {
    riskQueue.push({
      priority: "medium",
      action: "Document primary, foreign, unique entity, relationship, or join semantics.",
      why: "Entity and join evidence shows how metrics can traverse models without accidental fanout.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  if (hasMetric && !hasQuery) {
    riskQueue.push({
      priority: "medium",
      action: "Add saved queries, MetricFlow query commands, explain SQL, or API query examples.",
      why: "Query examples make the model contract reviewable without running the warehouse.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  if (hasMetric && !hasAccess) {
    riskQueue.push({
      priority: "low",
      action: "Document access policies, security context, row/member rules, or query rewrite assumptions.",
      why: "Semantic layers often expose analytics APIs; access boundaries should be visible before production use.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  if ((hasMetric || hasQuery) && !hasCache) {
    riskQueue.push({
      priority: "low",
      action: "Document whether pre-aggregations, rollups, refresh keys, or cache engines are intentionally used or absent.",
      why: "Metric layers often hide expensive queries behind rollups or cache engines, which changes freshness and cost assumptions.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  if (hasMetric && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add repeatable validation commands or CI artifacts for semantic model review.",
      why: "Static readiness is stronger when model validation, metric listing, query explain, and artifact retention are reproducible.",
      relatedHref: "html/semantic-layer-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run semantic layer commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records semantic layer readiness only; it does not run MetricFlow, compile SQL, query warehouses, start Cube, refresh pre-aggregations, call APIs, or expose analytics data.",
    relatedHref: "html/semantic-layer-readiness.html"
  });

  return {
    summary: `Semantic layer readiness report: setup ${semanticLayerSetups.length}개, platform signal ${platformSignals.length}개, metric signal ${metricSignals.length}개, query signal ${querySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Semantic layer readiness MetricFlow dbt Semantic Layer Cube semantic_models metrics measures dimensions entities saved_queries TimeDimension Dimension agg_time_dimension type_params ratio derived cumulative cubes joins pre_aggregations access_policy query_rewrite SQL REST GraphQL",
    semanticLayerSetups,
    platformSignals,
    modelSignals,
    metricSignals,
    dimensionSignals,
    entitySignals,
    querySignals,
    cacheSignals,
    accessSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"semantic_models:|metrics:|saved_queries:|MetricFlow|dbt-metricflow|dbt_semantic_interfaces\" .", purpose: "Find MetricFlow/dbt semantic layer model, metric, saved-query, and package surfaces." },
      { command: "rg \"measures:|dimensions:|entities:|agg_time_dimension|type_params|TimeDimension|Dimension\\\\(\" .", purpose: "Review measures, dimensions, entities, aggregate time dimensions, type params, and query dimension references." },
      { command: "rg \"type: (SIMPLE|ratio|derived|cumulative)|numerator|denominator|cumulative_type_params|filter:\" .", purpose: "Trace simple, ratio, derived, cumulative, and filtered metric definitions." },
      { command: "rg \"cubes:|joins:|pre_aggregations:|refresh_key|rollup|query_rewrite|COMPILE_CONTEXT|access_policy\" .", purpose: "Inventory Cube model, join, pre-aggregation, refresh, access, and query rewrite signals." },
      { command: "rg \"mf validate-configs|mf list metrics|mf list dimensions|mf query|--explain|SQL API|REST API|GraphQL API|upload-artifact\" .github .", purpose: "Check validation, listing, query explain, API examples, and retained semantic layer artifacts." }
    ],
    learnerNextSteps: [
      "먼저 MetricFlow, dbt Semantic Layer, Cube 중 어떤 semantic layer surface가 있는지 확인하고 model boundary를 표시하세요.",
      "semantic_models, cubes, measures, metrics, dimensions, entities를 한데 묶어 raw table과 business metric 사이의 계약을 설명하세요.",
      "ratio, derived, cumulative, filter, agg_time_dimension, time_granularity가 metric meaning과 grain을 어떻게 바꾸는지 추적하세요.",
      "saved_queries, mf query, SQL/REST/GraphQL API 예제가 있으면 실제 warehouse query를 실행하지 않고 shape만 검토하세요.",
      "pre_aggregations, refresh_key, access_policy, securityContext, query_rewrite가 freshness, cost, and access boundary를 어떻게 바꾸는지 확인하세요."
    ]
  };
}

type SemanticLayerReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function semanticLayerReadinessSourceFiles(walk: WalkResult): Promise<SemanticLayerReadinessSourceFile[]> {
  const files: SemanticLayerReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !semanticLayerReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!semanticLayerReadinessPathSignal(file.relPath) && !semanticLayerReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function semanticLayerReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return semanticLayerReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|pyproject\.toml|requirements\.txt|dbt_project\.ya?ml|profiles\.ya?ml|cube\.js|cube\.ts|\.env\.example|\.env\.sample)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|py|json|md|mdx|ya?ml|toml|sql)$/i.test(filePath);
}

function semanticLayerReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(semantic[-_ ]?layer|semantic[-_]?models?|metricflow|dbt[-_]?metricflow|metrics?|measures?|dimensions?|entities|saved[-_]?queries|cube|cubes|pre[-_]?aggregations?|access[-_]?polic(y|ies)|data[-_]?modeling)(\/|\.|-|_|$)|\.github\/workflows/i.test(filePath);
}

function semanticLayerReadinessContentSignal(text: string): boolean {
  return /MetricFlow|dbt[-_ ]?Semantic Layer|dbt-metricflow|dbt_semantic_interfaces|semantic_models|semantic model|saved_queries|agg_time_dimension|TimeDimension|Dimension\(|type_params|ratio|derived|cumulative|cubes:|pre_aggregations|Cube\.js|Cube Core|@cubejs-backend\/server|@cubejs-client\/core|["']cube["']|SQL API|REST API|GraphQL API|query_rewrite|COMPILE_CONTEXT|access_policy/i.test(text);
}

function semanticLayerReadinessSetups(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["semanticLayerSetups"] {
  const rows: SemanticLayerReadinessReport["semanticLayerSetups"] = [];
  for (const source of sourceFiles) {
    const semanticModelCount = countMatches(source.text, /\bsemantic_models?:|\bsemantic model\b|\bSemanticModel\b|\bsemanticModel\b|time[_-]?spine|sql_table|model:\s*ref\(/gi);
    const metricCount = countMatches(source.text, /\bmetrics?:|\bMetric\(|type:\s*(SIMPLE|simple|ratio|derived|cumulative)|\bnumerator\b|\bdenominator\b|cumulative_type_params|metric_time/gi);
    const measureCount = countMatches(source.text, /\bmeasures?:|\bmeasure:|\bagg:|COUNT_DISTINCT|SUM_BOOLEAN|average|sum|count/gi);
    const dimensionCount = countMatches(source.text, /\bdimensions?:|\bDimension\(|type:\s*(time|categorical)|time_granularity|granularity|group_by/gi);
    const entityCount = countMatches(source.text, /\bentities?:|type:\s*(primary|foreign|unique)|primary entity|foreign entity|unique entity|entity_path|entity path/gi);
    const joinCount = countMatches(source.text, /\bjoins?:|relationship|many_to_one|one_to_many|sql_on|primary_key|foreign_key/gi);
    const savedQueryCount = countMatches(source.text, /\bsaved_queries?:|saved query|SavedQuery|query_params|queryParams/gi);
    const apiCount = countMatches(source.text, /\bSQL API\b|\bREST API\b|\bGraphQL API\b|\/cubejs-api\/v1\/(load|sql)|graphql|api endpoint/gi);
    const cacheCount = countMatches(source.text, /\bpre_aggregations?:|pre[- ]aggregations?|rollup|refresh_key|partition_granularity|incremental refresh|cache engine|Cube Store/gi);
    const accessCount = countMatches(source.text, /\baccess_policy|access policies|data_access_policies|row[- ]level|member security|securityContext|security_context|query_rewrite|COMPILE_CONTEXT|access control/gi);
    const workflowCount = countMatches(source.text, /\bmf tutorial|mf validate-configs|mf list metrics|mf list dimensions|mf query|--explain|--display-plans|semantic-layer-report|metricflow-sql|cube-pre-aggregations|github[-_ ]?actions|upload-artifact/gi);
    const hasSetupSignal = semanticModelCount + metricCount + measureCount + dimensionCount + entityCount + joinCount + savedQueryCount + apiCount + cacheCount + accessCount + workflowCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: semanticLayerReadinessPlatform(source),
      semanticModelCount,
      metricCount,
      measureCount,
      dimensionCount,
      entityCount,
      joinCount,
      savedQueryCount,
      apiCount,
      cacheCount,
      accessCount,
      workflowCount,
      readiness: (semanticModelCount + joinCount > 0) && (metricCount + measureCount > 0) && dimensionCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains semantic models ${semanticModelCount}, metrics ${metricCount}, measures ${measureCount}, dimensions ${dimensionCount}, entities ${entityCount}, joins ${joinCount}, saved queries ${savedQueryCount}, APIs ${apiCount}, cache ${cacheCount}, access ${accessCount}, workflow ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function semanticLayerReadinessPlatform(source: SemanticLayerReadinessSourceFile): SemanticLayerReadinessReport["semanticLayerSetups"][number]["platform"] {
  if (/MetricFlow|metricflow|dbt-metricflow/i.test(source.filePath) || /MetricFlow|metricflow|mf validate-configs|dbt-metricflow/i.test(source.text)) return "metricflow";
  if (/semantic_models|dbt[-_ ]?Semantic Layer|dbt_semantic_interfaces|dbt_project/i.test(source.filePath) || /semantic_models|dbt[-_ ]?Semantic Layer|dbt_semantic_interfaces|agg_time_dimension/i.test(source.text)) return "dbt-semantic-layer";
  if (/(^|\/)cube(s)?(\/|\.|-|_|$)|cube\.js|cube\.ts/i.test(source.filePath) || /Cube\.js|Cube Core|cubes:|pre_aggregations|\/cubejs-api\/v1/i.test(source.text)) return "cube";
  if (/semantic layer|business metric|metrics layer|analytics API/i.test(source.text)) return "custom";
  return "unknown";
}

function semanticLayerReadinessPlatformSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["platformSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metricflow", pattern: /MetricFlow|metricflow|mf validate-configs|mf list metrics|mf query/i, evidence: "MetricFlow evidence was detected." },
    { signal: "dbt-semantic-layer", pattern: /dbt[-_ ]?Semantic Layer|semantic_models|dbt_semantic_interfaces|agg_time_dimension/i, evidence: "dbt semantic layer evidence was detected." },
    { signal: "cube", pattern: /Cube\.js|Cube Core|@cubejs|cubes:|pre_aggregations|\/cubejs-api\/v1/i, evidence: "Cube semantic layer evidence was detected." },
    { signal: "custom", pattern: /custom semantic layer|business metric layer|analytics API|metrics layer/i, evidence: "custom semantic layer evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function semanticLayerReadinessModelSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["modelSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["modelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "semantic-model", pattern: /semantic_models?:|semantic model|SemanticModel/i, evidence: "semantic model evidence was detected." },
    { signal: "cube", pattern: /\bcubes:|cube\(`|Cube Core|Cube\.js/i, evidence: "Cube model evidence was detected." },
    { signal: "view", pattern: /\bviews?:|multi[-_ ]?fact views?|view definition/i, evidence: "view evidence was detected." },
    { signal: "sql-table", pattern: /sql_table|sql table|sql:\s*`|FROM\s+[A-Za-z0-9_.]+/i, evidence: "SQL table evidence was detected." },
    { signal: "ref-model", pattern: /model:\s*ref\(|ref\(['"][A-Za-z0-9_]+['"]\)/i, evidence: "dbt ref model evidence was detected." },
    { signal: "time-spine", pattern: /time[_-]?spine|metric_time/i, evidence: "time spine evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "model", "signal");
}

function semanticLayerReadinessMetricSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["metricSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["metricSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "simple-metric", pattern: /type:\s*(SIMPLE|simple)|simple metric/i, evidence: "simple metric evidence was detected." },
    { signal: "ratio-metric", pattern: /type:\s*ratio|\bnumerator\b|\bdenominator\b|ratio metric/i, evidence: "ratio metric evidence was detected." },
    { signal: "derived-metric", pattern: /type:\s*derived|derived metric|\bexpr\b/i, evidence: "derived metric evidence was detected." },
    { signal: "cumulative-metric", pattern: /type:\s*cumulative|cumulative_type_params|cumulative metric/i, evidence: "cumulative metric evidence was detected." },
    { signal: "filtered-metric", pattern: /\bfilter:|Dimension\(|where:/i, evidence: "filtered metric evidence was detected." },
    { signal: "measure", pattern: /\bmeasures?:|\bmeasure:|\bagg:|COUNT_DISTINCT|SUM_BOOLEAN/i, evidence: "measure evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "metric", "signal");
}

function semanticLayerReadinessDimensionSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["dimensionSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["dimensionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "time-dimension", pattern: /type:\s*time|TimeDimension\(|metric_time|agg_time_dimension/i, evidence: "time dimension evidence was detected." },
    { signal: "categorical-dimension", pattern: /type:\s*categorical|categorical dimension/i, evidence: "categorical dimension evidence was detected." },
    { signal: "dimension-reference", pattern: /Dimension\(|\bdimensions?:|dimension reference/i, evidence: "dimension reference evidence was detected." },
    { signal: "entity-path", pattern: /entity_path|entity path|__[A-Za-z0-9_]+/i, evidence: "entity path evidence was detected." },
    { signal: "granularity", pattern: /time_granularity|granularity|partition_granularity/i, evidence: "granularity evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "dimension", "signal");
}

function semanticLayerReadinessEntitySignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["entitySignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["entitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "primary-entity", pattern: /type:\s*primary|primary entity|primary_key/i, evidence: "primary entity evidence was detected." },
    { signal: "foreign-entity", pattern: /type:\s*foreign|foreign entity|foreign_key/i, evidence: "foreign entity evidence was detected." },
    { signal: "unique-entity", pattern: /type:\s*unique|unique entity/i, evidence: "unique entity evidence was detected." },
    { signal: "entity-relationship", pattern: /\bentities?:|relationship|many_to_one|one_to_many/i, evidence: "entity relationship evidence was detected." },
    { signal: "join", pattern: /\bjoins?:|sql_on|join relationship/i, evidence: "join evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "entity", "signal");
}

function semanticLayerReadinessQuerySignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["querySignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["querySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "saved-query", pattern: /saved_queries?:|saved query|query_params/i, evidence: "saved query evidence was detected." },
    { signal: "metricflow-query", pattern: /mf query|metricflow query|--metrics|--group-by/i, evidence: "MetricFlow query command evidence was detected." },
    { signal: "explain-sql", pattern: /--explain|explain sql|generated SQL|display SQL/i, evidence: "explain SQL evidence was detected." },
    { signal: "display-plan", pattern: /--display-plans|display plans|query plan/i, evidence: "display plan evidence was detected." },
    { signal: "sql-api", pattern: /\bSQL API\b|\/cubejs-api\/v1\/sql/i, evidence: "SQL API evidence was detected." },
    { signal: "rest-api", pattern: /\bREST API\b|\/cubejs-api\/v1\/load|api endpoint/i, evidence: "REST API evidence was detected." },
    { signal: "graphql-api", pattern: /\bGraphQL API\b|graphql/i, evidence: "GraphQL API evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "query", "signal");
}

function semanticLayerReadinessCacheSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["cacheSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["cacheSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pre-aggregation", pattern: /pre_aggregations?:|pre[- ]aggregation/i, evidence: "pre-aggregation evidence was detected." },
    { signal: "rollup", pattern: /rollup|rollups/i, evidence: "rollup evidence was detected." },
    { signal: "refresh-key", pattern: /refresh_key|refresh key/i, evidence: "refresh key evidence was detected." },
    { signal: "partition-granularity", pattern: /partition_granularity|partition granularity/i, evidence: "partition granularity evidence was detected." },
    { signal: "incremental-refresh", pattern: /incremental refresh|incremental_refresh|incremental/i, evidence: "incremental refresh evidence was detected." },
    { signal: "cache-engine", pattern: /cache engine|Cube Store|relational caching engine/i, evidence: "cache engine evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "cache", "signal");
}

function semanticLayerReadinessAccessSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["accessSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["accessSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "access-policy", pattern: /access_policy|access policies|data_access_policies/i, evidence: "access policy evidence was detected." },
    { signal: "row-level-security", pattern: /row[-_ ]level[-_ ]security|RLS|row level/i, evidence: "row-level security evidence was detected." },
    { signal: "member-security", pattern: /member[-_ ]security|memberSecurity|member-level/i, evidence: "member security evidence was detected." },
    { signal: "security-context", pattern: /securityContext|security_context|security context/i, evidence: "security context evidence was detected." },
    { signal: "query-rewrite", pattern: /query_rewrite|query rewrite/i, evidence: "query rewrite evidence was detected." },
    { signal: "compile-context", pattern: /COMPILE_CONTEXT|compile context/i, evidence: "compile context evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "access", "signal");
}

function semanticLayerReadinessWorkflowSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mf-tutorial", pattern: /mf tutorial/i, evidence: "MetricFlow tutorial command evidence was detected." },
    { signal: "validate-configs", pattern: /mf validate-configs|validate-configs/i, evidence: "MetricFlow validation command evidence was detected." },
    { signal: "list-metrics", pattern: /mf list metrics|list metrics/i, evidence: "MetricFlow list metrics evidence was detected." },
    { signal: "list-dimensions", pattern: /mf list dimensions|list dimensions/i, evidence: "MetricFlow list dimensions evidence was detected." },
    { signal: "query-command", pattern: /mf query|--metrics|--group-by/i, evidence: "MetricFlow query command evidence was detected." },
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|semantic-layer-report\.json|metricflow-sql\.sql|cube-pre-aggregations\.json/i, evidence: "semantic layer artifact upload evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function semanticLayerReadinessPackageSignals(sourceFiles: SemanticLayerReadinessSourceFile[]): SemanticLayerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SemanticLayerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metricflow", pattern: /\bmetricflow\b/i, evidence: "MetricFlow package evidence was detected." },
    { signal: "dbt-metricflow", pattern: /dbt-metricflow/i, evidence: "dbt-metricflow package evidence was detected." },
    { signal: "dbt-semantic-interfaces", pattern: /dbt-semantic-interfaces|dbt_semantic_interfaces/i, evidence: "dbt semantic interfaces package evidence was detected." },
    { signal: "cubejs-server", pattern: /@cubejs-backend\/server|cubejs-server/i, evidence: "Cube server package evidence was detected." },
    { signal: "cube-client", pattern: /@cubejs-client\/core|cube-client/i, evidence: "Cube client package evidence was detected." },
    { signal: "cube", pattern: /["']cube["']|Cube\.js|Cube Core/i, evidence: "Cube package evidence was detected." }
  ];
  return semanticLayerReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function semanticLayerReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SemanticLayerReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/semantic-layer-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildBiDashboardReadinessReport(walk: WalkResult): Promise<BiDashboardReadinessReport> {
  const sourceFiles = await biDashboardReadinessSourceFiles(walk);
  const dashboardSetups = biDashboardReadinessSetups(sourceFiles);
  const platformSignals = biDashboardReadinessPlatformSignals(sourceFiles);
  const dashboardSignals = biDashboardReadinessDashboardSignals(sourceFiles);
  const querySignals = biDashboardReadinessQuerySignals(sourceFiles);
  const filterSignals = biDashboardReadinessFilterSignals(sourceFiles);
  const accessSignals = biDashboardReadinessAccessSignals(sourceFiles);
  const embeddingSignals = biDashboardReadinessEmbeddingSignals(sourceFiles);
  const alertSignals = biDashboardReadinessAlertSignals(sourceFiles);
  const cacheSignals = biDashboardReadinessCacheSignals(sourceFiles);
  const workflowSignals = biDashboardReadinessWorkflowSignals(sourceFiles);
  const packageSignals = biDashboardReadinessPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasDashboard = dashboardSignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.dashboardCount + item.chartCount > 0);
  const hasQuery = querySignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.queryCount + item.datasetCount > 0);
  const hasFilters = filterSignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.filterCount > 0);
  const hasAccess = accessSignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.permissionCount > 0);
  const hasEmbedding = embeddingSignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.embeddingCount > 0);
  const hasAlert = alertSignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.alertCount > 0);
  const hasCache = cacheSignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.cacheCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || dashboardSetups.some((item) => item.workflowCount > 0);

  const riskQueue: BiDashboardReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasDashboard) {
    riskQueue.push({
      priority: "high",
      action: "Add a concrete Metabase, Superset, Lightdash, or custom dashboard configuration before claiming BI dashboard readiness.",
      why: "BI dashboard readiness starts from an owned dashboard surface with visible cards, charts, explores, or dashboard definitions.",
      relatedHref: "html/bi-dashboard-readiness.html"
    });
  }
  if (hasDashboard && !hasQuery) {
    riskQueue.push({
      priority: "high",
      action: "Document the SQL, native query, dataset, semantic model, metric, dimension, or join contract behind dashboard tiles.",
      why: "Dashboards without visible data contracts cannot be reviewed for correctness or freshness.",
      relatedHref: "html/bi-dashboard-readiness.html"
    });
  }
  if (hasDashboard && !hasFilters) {
    riskQueue.push({
      priority: "medium",
      action: "Add parameter, field filter, dashboard filter, date filter, cross-filter, or drilldown evidence.",
      why: "BI learners need to see how dashboard interactivity changes query scope.",
      relatedHref: "html/bi-dashboard-readiness.html"
    });
  }
  if ((hasDashboard || hasEmbedding) && !hasAccess) {
    riskQueue.push({
      priority: "medium",
      action: "Document roles, permissions, row-level security, collection access, space access, or embedding secrets.",
      why: "Dashboards and embeds can expose analytics data; access boundaries should be visible before production use.",
      relatedHref: "html/bi-dashboard-readiness.html"
    });
  }
  if (hasDashboard && !hasCache) {
    riskQueue.push({
      priority: "low",
      action: "Document cache, refresh, TTL, async query, result cache, or precomputed dashboard assumptions.",
      why: "Dashboard cache and refresh choices affect freshness, latency, and warehouse cost.",
      relatedHref: "html/bi-dashboard-readiness.html"
    });
  }
  if (hasDashboard && !hasAlert) {
    riskQueue.push({
      priority: "low",
      action: "Record whether alerts, subscriptions, pulses, scheduled reports, Slack, or email delivery are intentionally used or absent.",
      why: "Scheduled BI delivery changes operational expectations beyond interactive dashboard views.",
      relatedHref: "html/bi-dashboard-readiness.html"
    });
  }
  if (hasDashboard && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add repeatable dashboard validation, export/import, SQL validation, dbt sync, visual regression, or artifact retention workflows.",
      why: "Static readiness is stronger when dashboard definitions and validation artifacts are reproducible.",
      relatedHref: "html/bi-dashboard-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run BI dashboard commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records BI dashboard readiness only; it does not connect to BI servers, query databases, render dashboards, publish embeds, send alerts, or change permissions.",
    relatedHref: "html/bi-dashboard-readiness.html"
  });

  return {
    summary: `BI dashboard readiness report: setup ${dashboardSetups.length}개, platform signal ${platformSignals.length}개, dashboard signal ${dashboardSignals.length}개, workflow signal ${workflowSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "BI dashboard readiness Metabase Superset Lightdash dashboards cards charts queries datasets saved questions explores metrics semantic layer filters parameters drilldowns alerts subscriptions embedded analytics permissions roles row level security cache refresh SQL lab database connections",
    dashboardSetups,
    platformSignals,
    dashboardSignals,
    querySignals,
    filterSignals,
    accessSignals,
    embeddingSignals,
    alertSignals,
    cacheSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"metabase|dashboard|card|native_query|dataset_query|pulse|collection|field_filter\" .", purpose: "Find Metabase dashboard, card, native query, dataset query, pulse, collection, and field-filter surfaces." },
      { command: "rg \"superset|Slice|Dashboard|SqlaTable|SQL Lab|RLS|row_level_security|ChartData\" .", purpose: "Review Superset chart, dashboard, dataset, SQL Lab, RLS, and chart data signals." },
      { command: "rg \"lightdash|explores|metrics|dimensions|Dashboard|SavedChart|Space|scheduled_delivery\" .", purpose: "Inventory Lightdash explores, metrics, dimensions, dashboards, saved charts, spaces, and scheduled delivery." },
      { command: "rg \"embed|iframe|signed|public link|JWT|permissions|roles|row-level|collection\" .", purpose: "Trace embedded analytics, public links, signed JWT embeds, permissions, roles, row-level rules, and collection access." },
      { command: "rg \"cache|refresh|ttl|async query|dashboard export|visual regression|upload-artifact\" .github .", purpose: "Check cache, refresh, async query, dashboard export, visual regression, and artifact-retention workflows." }
    ],
    learnerNextSteps: [
      "먼저 Metabase, Superset, Lightdash, custom dashboard 중 어떤 BI dashboard surface가 있는지 확인하세요.",
      "dashboard, card, chart, slice, explore, saved question이 어떤 query, dataset, metric, dimension에 연결되는지 표시하세요.",
      "parameters, field filters, date filters, cross filters, drilldowns가 query scope를 어떻게 바꾸는지 추적하세요.",
      "embedding, public link, signed embed, SDK embed가 있으면 roles, permissions, row-level security, collection/space access를 같이 검토하세요.",
      "cache TTL, refresh, scheduled delivery, Slack/email reports, validation workflow를 운영 준비도 관점에서 확인하세요."
    ]
  };
}

type BiDashboardReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function biDashboardReadinessSourceFiles(walk: WalkResult): Promise<BiDashboardReadinessSourceFile[]> {
  const files: BiDashboardReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !biDashboardReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!biDashboardReadinessPathSignal(file.relPath) && !biDashboardReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function biDashboardReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return biDashboardReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|pyproject\.toml|requirements\.txt|dashboard\.ya?ml|dashboard\.json|lightdash\.ya?ml|superset_config\.py|\.env\.example|\.env\.sample)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|py|json|md|mdx|ya?ml|toml|sql)$/i.test(filePath);
}

function biDashboardReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(metabase|superset|lightdash|bi[-_ ]?dashboard|dashboards?|cards?|charts?|slices?|explores?|saved[-_ ]?(question|chart)s?|embedded[-_ ]?analytics|embeds?|permissions?|row[-_ ]?level|collections?|spaces?)(\/|\.|-|_|$)|\.github\/workflows/i.test(filePath);
}

function biDashboardReadinessContentSignal(text: string): boolean {
  return /Metabase|Superset|Lightdash|dashboard_id|dashboard_title|dataset_query|native_query|field_filter|pulse|collection_id|enable_embedding|superset|Slice|SqlaTable|SQL Lab|row_level_security|lightdash|explores:|savedCharts|scheduled_delivery|embedded analytics|signed embed|iframe|public link|cache_ttl|cache_timeout/i.test(text);
}

function biDashboardReadinessSetups(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["dashboardSetups"] {
  const rows: BiDashboardReadinessReport["dashboardSetups"] = [];
  for (const source of sourceFiles) {
    const dashboardCount = countMatches(source.text, /\bdashboards?:|dashboard_id|dashboard_title|dashboardId|Dashboard\b|dashboard[-_ ]?config|executive_revenue/gi);
    const chartCount = countMatches(source.text, /\bcards?:|\bcard_id\b|\bcharts?:|\bslice_name\b|SavedChart|savedCharts|savedChartUuid|\btiles?:|visualization_settings|ChartData/gi);
    const queryCount = countMatches(source.text, /\bquery\b|native_query|dataset_query|query_context|SQL Lab|SELECT\s+|saved question|SavedQuestion|explore:/gi);
    const datasetCount = countMatches(source.text, /dataset_query|datasetId|datasource|SqlaTable|table_id|explores?:|\bmetrics?:|\bdimensions?:|semantic layer|semantic model/gi);
    const filterCount = countMatches(source.text, /\bparameters?:|parameter_mappings|template_tags|field_filter|native_filter|filter_select|dashboard filter|date filter|created_at|cross[-_ ]?filter|drilldown|drill[-_ ]?through/gi);
    const permissionCount = countMatches(source.text, /\bpermissions?:|\broles?:|row[-_ ]level[-_ ]security|RLS|collection_id|collection permission|spaces?:|space access|user_attributes|access:|viewer|Admin|Gamma/gi);
    const embeddingCount = countMatches(source.text, /enable_embedding|embedding_params|embedded_dashboard|embedded analytics|iframe|signedEmbed|signed embed|public_uuid|publicLink|public link|JWT|jwt|sdkEmbed|embedConfig|embed\/dashboard/gi);
    const alertCount = countMatches(source.text, /\balerts?:|\bsubscriptions?:|\bpulse\b|scheduled_delivery|schedule_type|scheduled report|slack|email/gi);
    const cacheCount = countMatches(source.text, /\bcache\b|cache_ttl|cache_timeout|\bttl\b|refresh|async[-_ ]?query|query_context|result[-_ ]?cache|precomputed/gi);
    const workflowCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\/|metabase export|metabase import|superset import-dashboards|superset export-dashboards|lightdash validate|lightdash compile|lightdash dbt sync|visual[-_ ]regression|upload-artifact/gi)
      + (source.filePath.includes(".github/workflows") ? 1 : 0);
    const hasSetupSignal = dashboardCount + chartCount + queryCount + datasetCount + filterCount + permissionCount + embeddingCount + alertCount + cacheCount + workflowCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: biDashboardReadinessPlatform(source),
      dashboardCount,
      chartCount,
      queryCount,
      datasetCount,
      filterCount,
      permissionCount,
      embeddingCount,
      alertCount,
      cacheCount,
      workflowCount,
      readiness: (dashboardCount + chartCount > 0) && (queryCount + datasetCount > 0) && (filterCount + permissionCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains dashboards ${dashboardCount}, charts ${chartCount}, queries ${queryCount}, datasets ${datasetCount}, filters ${filterCount}, permissions ${permissionCount}, embedding ${embeddingCount}, alerts ${alertCount}, cache ${cacheCount}, workflow ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function biDashboardReadinessPlatform(source: BiDashboardReadinessSourceFile): BiDashboardReadinessReport["dashboardSetups"][number]["platform"] {
  if (/metabase/i.test(source.filePath) || /Metabase|dataset_query|native_query|field_filter|pulse|collection_id|enable_embedding/i.test(source.text)) return "metabase";
  if (/superset/i.test(source.filePath) || /Superset|dashboard_title|slice_name|SqlaTable|SQL Lab|row_level_security|native_filter_configuration/i.test(source.text)) return "superset";
  if (/lightdash/i.test(source.filePath) || /Lightdash|lightdash|explores:|savedCharts|scheduled_delivery|@lightdash\/sdk/i.test(source.text)) return "lightdash";
  if (/BI Dashboard|business intelligence|embedded analytics|custom dashboard/i.test(source.text)) return "custom";
  return "unknown";
}

function biDashboardReadinessPlatformSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["platformSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metabase", pattern: /Metabase|metabase|dataset_query|native_query|field_filter|pulse|collection_id/i, evidence: "Metabase evidence was detected." },
    { signal: "superset", pattern: /Superset|superset|dashboard_title|slice_name|SqlaTable|SQL Lab|row_level_security/i, evidence: "Superset evidence was detected." },
    { signal: "lightdash", pattern: /Lightdash|lightdash|explores:|savedCharts|scheduled_delivery|@lightdash\/sdk/i, evidence: "Lightdash evidence was detected." },
    { signal: "custom", pattern: /BI Dashboard|business intelligence|embedded analytics|custom dashboard/i, evidence: "custom BI dashboard evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function biDashboardReadinessDashboardSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["dashboardSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["dashboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dashboard", pattern: /\bdashboards?:|dashboard_id|dashboard_title|Dashboard\b/i, evidence: "dashboard evidence was detected." },
    { signal: "card", pattern: /\bcards?:|\bcard_id\b|metabase card/i, evidence: "card evidence was detected." },
    { signal: "chart", pattern: /\bcharts?:|SavedChart|savedCharts|savedChartUuid|echarts|chart\.js/i, evidence: "chart evidence was detected." },
    { signal: "slice", pattern: /\bslice_name\b|\bSlice\b/i, evidence: "Superset slice evidence was detected." },
    { signal: "explore", pattern: /\bexplores?:|\bexplore:/i, evidence: "explore evidence was detected." },
    { signal: "saved-question", pattern: /saved question|SavedQuestion|savedCharts|savedChartUuid/i, evidence: "saved question/chart evidence was detected." },
    { signal: "dashboard-config", pattern: /dashboard\.ya?ml|dashboard\.json|dashboard[-_ ]?config|position_json|native_filter_configuration/i, evidence: "dashboard config evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "dashboard", "signal");
}

function biDashboardReadinessQuerySignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["querySignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["querySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sql-query", pattern: /SELECT\s+|SQL Lab|sql:\s|query_context/i, evidence: "SQL query evidence was detected." },
    { signal: "native-query", pattern: /native_query|dataset_query|type:\s*["']?native|native:/i, evidence: "native query evidence was detected." },
    { signal: "dataset", pattern: /dataset_query|datasetId|datasource|SqlaTable|table_id/i, evidence: "dataset evidence was detected." },
    { signal: "semantic-model", pattern: /semantic layer|semantic model|explores?:|\bmetrics?:/i, evidence: "semantic model or explore evidence was detected." },
    { signal: "metric", pattern: /\bmetrics?:|sum__|total_revenue|measure|Metric\b/i, evidence: "metric evidence was detected." },
    { signal: "dimension", pattern: /\bdimensions?:|field_filter|column:|created_at|region/i, evidence: "dimension evidence was detected." },
    { signal: "join", pattern: /\bjoins?:|sql_on|join relationship/i, evidence: "join evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "query", "signal");
}

function biDashboardReadinessFilterSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["filterSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["filterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "parameter", pattern: /\bparameters?:|parameter_mappings|template_tags/i, evidence: "parameter evidence was detected." },
    { signal: "filter", pattern: /\bfilter\b|filter_select|native_filter/i, evidence: "filter evidence was detected." },
    { signal: "field-filter", pattern: /field_filter|field filter/i, evidence: "field filter evidence was detected." },
    { signal: "dashboard-filter", pattern: /native_filter_configuration|dashboard filter|filter_select/i, evidence: "dashboard filter evidence was detected." },
    { signal: "date-filter", pattern: /date filter|created_at|time range|time_range/i, evidence: "date filter evidence was detected." },
    { signal: "cross-filter", pattern: /cross[-_ ]?filter|native_filter_configuration/i, evidence: "cross-filter evidence was detected." },
    { signal: "drilldown", pattern: /drilldown|drill[-_ ]?through|parameter_mappings/i, evidence: "drilldown evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "filter", "signal");
}

function biDashboardReadinessAccessSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["accessSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["accessSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role", pattern: /\broles?:|\bAdmin\b|\bGamma\b|\banalyst\b/i, evidence: "role evidence was detected." },
    { signal: "permission", pattern: /\bpermissions?:|access:|viewer|permission/i, evidence: "permission evidence was detected." },
    { signal: "row-level-security", pattern: /row[-_ ]level[-_ ]security|RLS|user_attributes/i, evidence: "row-level security evidence was detected." },
    { signal: "collection-permission", pattern: /collection_id|collection permission|collection access|collection/i, evidence: "collection permission evidence was detected." },
    { signal: "space-access", pattern: /\bspaces?:|space access|access:\s*viewer/i, evidence: "space access evidence was detected." },
    { signal: "embedding-secret", pattern: /JWT|jwt|signedEmbed|signed embed|embedding_secret|embed secret/i, evidence: "embedding secret evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "access", "signal");
}

function biDashboardReadinessEmbeddingSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["embeddingSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["embeddingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "iframe", pattern: /<iframe|iframe/i, evidence: "iframe embed evidence was detected." },
    { signal: "signed-embed", pattern: /signedEmbed|signed embed|JWT|jwt/i, evidence: "signed embed evidence was detected." },
    { signal: "public-link", pattern: /public_uuid|publicLink|public link/i, evidence: "public link evidence was detected." },
    { signal: "sdk-embed", pattern: /sdkEmbed|@lightdash\/sdk|embed SDK/i, evidence: "SDK embed evidence was detected." },
    { signal: "embed-config", pattern: /embedConfig|enable_embedding|embedding_params|embedded_dashboard|embed\/dashboard/i, evidence: "embed config evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "embedding", "signal");
}

function biDashboardReadinessAlertSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["alertSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["alertSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "alert", pattern: /\balerts?:|\bpulse\b|scheduled_delivery/i, evidence: "alert evidence was detected." },
    { signal: "subscription", pattern: /\bsubscriptions?:|\bpulse\b|scheduled_delivery/i, evidence: "subscription evidence was detected." },
    { signal: "pulse", pattern: /\bpulse\b/i, evidence: "Metabase pulse evidence was detected." },
    { signal: "report-schedule", pattern: /scheduled_delivery|schedule_type|scheduled report/i, evidence: "scheduled report evidence was detected." },
    { signal: "slack-email", pattern: /slack|email/i, evidence: "Slack/email delivery evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "alert", "signal");
}

function biDashboardReadinessCacheSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["cacheSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["cacheSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cache", pattern: /\bcache\b|cache_ttl|cache_timeout/i, evidence: "cache evidence was detected." },
    { signal: "refresh", pattern: /refresh|cache_ttl|cache_timeout/i, evidence: "refresh evidence was detected." },
    { signal: "ttl", pattern: /\bttl\b|cache_ttl|cache_timeout/i, evidence: "TTL evidence was detected." },
    { signal: "async-query", pattern: /async[-_ ]?query|query_context/i, evidence: "async query evidence was detected." },
    { signal: "result-cache", pattern: /result[-_ ]?cache|cache_ttl|cache_timeout/i, evidence: "result cache evidence was detected." },
    { signal: "precomputed", pattern: /precomputed|cache_ttl|cache_timeout/i, evidence: "precomputed/cache evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "cache", "signal");
}

function biDashboardReadinessWorkflowSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "dashboard-export", pattern: /metabase export|superset export-dashboards|dashboard export|export dashboards/i, evidence: "dashboard export evidence was detected." },
    { signal: "asset-import", pattern: /superset import-dashboards|metabase import|asset import|import-dashboards/i, evidence: "dashboard import evidence was detected." },
    { signal: "sql-validation", pattern: /SQL Lab|sql validation|query_context|lightdash validate/i, evidence: "SQL validation evidence was detected." },
    { signal: "dbt-sync", pattern: /lightdash dbt sync|dbt sync/i, evidence: "dbt sync evidence was detected." },
    { signal: "visual-regression", pattern: /visual[-_ ]regression/i, evidence: "visual regression evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|bi-dashboard-artifacts|dashboard artifact/i, evidence: "dashboard artifact upload evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function biDashboardReadinessPackageSignals(sourceFiles: BiDashboardReadinessSourceFile[]): BiDashboardReadinessReport["packageSignals"] {
  const specs: Array<{ signal: BiDashboardReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metabase", pattern: /\bmetabase\b/i, evidence: "Metabase package evidence was detected." },
    { signal: "apache-superset", pattern: /apache-superset|\bsuperset\b/i, evidence: "Apache Superset package evidence was detected." },
    { signal: "lightdash", pattern: /\blightdash\b|@lightdash\/sdk/i, evidence: "Lightdash package evidence was detected." },
    { signal: "echarts", pattern: /\becharts\b/i, evidence: "ECharts package evidence was detected." },
    { signal: "chartjs", pattern: /chart\.js|chartjs/i, evidence: "Chart.js package evidence was detected." }
  ];
  return biDashboardReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function biDashboardReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: BiDashboardReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/bi-dashboard-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
