import type { PipelineOrchestrationReadinessReport, SchemaRegistryReadinessReport, StreamProcessingReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildSchemaRegistryReadinessReport(walk: WalkResult): Promise<SchemaRegistryReadinessReport> {
  const sourceFiles = await schemaRegistryReadinessSourceFiles(walk);
  const registrySetups = schemaRegistryReadinessSetups(sourceFiles);
  const registrySignals = schemaRegistryReadinessRegistrySignals(sourceFiles);
  const schemaFormatSignals = schemaRegistryReadinessFormatSignals(sourceFiles);
  const identitySignals = schemaRegistryReadinessIdentitySignals(sourceFiles);
  const compatibilitySignals = schemaRegistryReadinessCompatibilitySignals(sourceFiles);
  const governanceSignals = schemaRegistryReadinessGovernanceSignals(sourceFiles);
  const workflowSignals = schemaRegistryReadinessWorkflowSignals(sourceFiles);
  const packageSignals = schemaRegistryReadinessPackageSignals(sourceFiles);

  const hasRegistry = registrySignals.some((item) => item.readiness === "ready") || registrySetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasFormat = schemaFormatSignals.some((item) => item.readiness === "ready") || registrySetups.some((item) => item.formatCount > 0);
  const hasIdentity = identitySignals.some((item) => item.readiness === "ready") || registrySetups.some((item) => item.subjectCount + item.artifactCount + item.versionCount > 0);
  const hasCompatibility = compatibilitySignals.some((item) => item.readiness === "ready") || registrySetups.some((item) => item.compatibilityCount > 0);
  const hasGovernance = governanceSignals.some((item) => item.readiness === "ready") || registrySetups.some((item) => item.governanceCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || registrySetups.some((item) => item.workflowCount > 0);

  const riskQueue: SchemaRegistryReadinessReport["riskQueue"] = [];
  if (!hasRegistry) {
    riskQueue.push({
      priority: "high",
      action: "Add schema registry or Buf module evidence before claiming schema registry readiness.",
      why: "Schema registry readiness starts from a concrete Confluent, Apicurio, Buf, or compatible registry surface.",
      relatedHref: "html/schema-registry-readiness.html"
    });
  }
  if (hasRegistry && !hasFormat) {
    riskQueue.push({
      priority: "medium",
      action: "Record the schema formats governed by the registry.",
      why: "Consumers need to know whether Avro, Protobuf, JSON Schema, OpenAPI, or AsyncAPI contracts are covered.",
      relatedHref: "html/schema-registry-readiness.html"
    });
  }
  if (hasFormat && !hasCompatibility) {
    riskQueue.push({
      priority: "high",
      action: "Add compatibility or breaking-change checks for registered schemas.",
      why: "Schema evolution is unsafe unless compatibility checks or Buf breaking policies are visible before producer changes ship.",
      relatedHref: "html/schema-registry-readiness.html"
    });
  }
  if (hasRegistry && !hasIdentity) {
    riskQueue.push({
      priority: "medium",
      action: "Document subject, artifact, group, version, ID, and reference identity strategy.",
      why: "Schema reuse and compatibility scope depend on subject naming, artifact identity, versioning, and references.",
      relatedHref: "html/schema-registry-readiness.html"
    });
  }
  if (hasCompatibility && !hasGovernance) {
    riskQueue.push({
      priority: "medium",
      action: "Pair compatibility checks with lint, validity, mode, or dependency policy.",
      why: "Registries are more reliable when compatibility is backed by explicit rules and module governance.",
      relatedHref: "html/schema-registry-readiness.html"
    });
  }
  if ((hasRegistry || hasFormat) && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add CI commands for registration, compatibility, lint, breaking, generation, or publication.",
      why: "Static registry readiness is stronger when CI records schema checks as reproducible artifacts.",
      relatedHref: "html/schema-registry-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run registry and Buf commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records schema registry readiness only; it does not start registries, register schemas, change compatibility config, run Buf, publish modules, or call registry APIs.",
    relatedHref: "html/schema-registry-readiness.html"
  });

  return {
    summary: `Schema registry readiness report: setup ${registrySetups.length}개, registry signal ${registrySignals.length}개, format signal ${schemaFormatSignals.length}개, compatibility signal ${compatibilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Schema registry readiness Confluent Apicurio Buf subject artifact version compatibility Avro Protobuf JSON Schema lint breaking generate push",
    registrySetups,
    registrySignals,
    schemaFormatSignals,
    identitySignals,
    compatibilitySignals,
    governanceSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"schema.registry.url|Schema Registry|/subjects/.*/versions|/compatibility/subjects|schema-compatibility-check\" .", purpose: "Find Confluent-compatible registry URLs, subject registration, versioning, and compatibility checks." },
      { command: "rg \"Apicurio Registry|/apis/ccompat|/groups/.*/artifacts|artifactId|groupId|contentId|globalId|validity|rules\" .", purpose: "Inventory Apicurio ccompat, group/artifact identity, ID mapping, validity, and rules evidence." },
      { command: "rg \"buf.yaml|buf.gen.yaml|buf.lock|buf lint|buf breaking|buf generate|buf push|breaking:\" .", purpose: "Review Buf module, lint, breaking, generation, dependency lock, and publication workflow." },
      { command: "rg \"Avro|Protobuf|proto3|JSON Schema|OpenAPI|AsyncAPI|references|SchemaReference\" .", purpose: "Map schema formats and reference/import relationships." },
      { command: "rg \"KafkaAvroSerializer|KafkaProtobufSerializer|KafkaJsonSchemaSerializer|@bufbuild/buf|protoc|upload-artifact\" package.json pom.xml build.gradle .github .", purpose: "Check serializer packages, Buf/protoc tooling, and schema readiness artifact uploads." }
    ],
    learnerNextSteps: [
      "먼저 Confluent, Apicurio, Buf 중 어떤 registry surface가 있는지 확인하고 registry URL 또는 module boundary를 표시하세요.",
      "subject, artifactId, groupId, version, schema ID, contentId, globalId, reference 전략을 구분해 compatibility scope를 정리하세요.",
      "Avro, Protobuf, JSON Schema, OpenAPI, AsyncAPI 중 실제로 등록되는 schema format을 producer/consumer 코드와 연결하세요.",
      "compatibility endpoint, schema-compatibility-check, buf breaking, lint, validity rule, mode 정책이 CI에서 재현되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 registry API 호출, schema registration, compatibility config 변경, Buf publish는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type SchemaRegistryReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function schemaRegistryReadinessSourceFiles(walk: WalkResult): Promise<SchemaRegistryReadinessSourceFile[]> {
  const files: SchemaRegistryReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !schemaRegistryReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!schemaRegistryReadinessPathSignal(file.relPath) && !schemaRegistryReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function schemaRegistryReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return schemaRegistryReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|build\.gradle|settings\.gradle|pom\.xml|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|buf\.ya?ml|buf\.gen\.ya?ml|buf\.lock|\.env\.example|\.env\.sample)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|java|kt|scala|py|go|rs|json|md|mdx|ya?ml|toml|properties|conf|env|proto|avsc)$/i.test(filePath);
}

function schemaRegistryReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(schema[-_]?registry|schemaregistry|schemas?|avro|protobuf|proto|apicurio|buf|ccompat|registry|kafka|contracts?)(\/|\.|-|_|$)|buf\.(yaml|gen\.yaml|lock)$|\.github\/workflows|docker-compose|compose\.ya?ml/i.test(filePath);
}

function schemaRegistryReadinessContentSignal(text: string): boolean {
  return /\b(Confluent Schema Registry|Schema Registry|schema\.registry\.url|schema-registry-start|schema-compatibility-check|\/subjects\/|\/compatibility\/subjects|Apicurio Registry|\/apis\/ccompat|\/groups\/.*\/artifacts|artifactId|groupId|contentId|globalId|Buf Schema Registry|buf\.yaml|buf lint|buf breaking|buf generate|buf push|Avro|Protobuf|proto3|JSON Schema|OpenAPI|AsyncAPI|SchemaReference|KafkaAvroSerializer|KafkaProtobufSerializer|KafkaJsonSchemaSerializer)\b/i.test(text);
}

function schemaRegistryReadinessSetups(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["registrySetups"] {
  const rows: SchemaRegistryReadinessReport["registrySetups"] = [];
  for (const source of sourceFiles) {
    const subjectCount = countMatches(source.text, /\/subjects?\/|\bsubjects?\b|\bsubject(Name|s)?\b|SubjectNameStrategy|TopicNameStrategy|RecordNameStrategy/gi);
    const artifactCount = countMatches(source.text, /\/artifacts?\b|\bartifact(Id|Type)?\b|ApicurioRegistry|artifact[-_ ]?id/gi);
    const versionCount = countMatches(source.text, /\/versions?\b|\bversions?\b|\bversionId\b|\blatest\b|\bschemaVersion\b|\bbuf\.lock\b/gi);
    const compatibilityCount = countMatches(source.text, /\bcompatibility\b|\bBACKWARD(_TRANSITIVE)?\b|\bFORWARD(_TRANSITIVE)?\b|\bFULL(_TRANSITIVE)?\b|\bNONE\b|\bbuf breaking\b|\bbreaking:/gi);
    const formatCount = countMatches(source.text, /\bAvro\b|\bPROTOBUF\b|\bProtobuf\b|\bproto3\b|\bJSON Schema\b|\bJSONSchema\b|\bOpenAPI\b|\bAsyncAPI\b|\.avsc\b|\.proto\b|\bbuf\.yaml\b/gi);
    const referenceCount = countMatches(source.text, /\breferences?\b|\bSchemaReference\b|\bimports?\b|\bdeps:\b|\bbuf\.lock\b/gi);
    const configCount = countMatches(source.text, /\bschema\.registry\.url\b|\bkafkastore\.|\blisteners=|\bbuf\.ya?ml\b|\bbuf\.gen\.ya?ml\b|\bapicurio\.|\bccompat\b|\bmode\b|\brules\b/gi);
    const governanceCount = countMatches(source.text, /\bcompatibility(Level)?\b|\bvalidity\b|\brules\b|\bbuf lint\b|\bbreaking:\b|\bmanaged:\b|\bdeps:\b|\bbuf\.lock\b|\bREADWRITE\b|\bREADONLY\b|\bIMPORT\b/gi);
    const workflowCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|buf lint|buf breaking|buf generate|buf push|schema-compatibility-check|curl .*\/subjects|upload-artifact|register.*schema/gi);
    const hasSetupSignal = subjectCount + artifactCount + versionCount + compatibilityCount + formatCount + referenceCount + configCount + governanceCount + workflowCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: schemaRegistryReadinessProvider(source),
      subjectCount,
      artifactCount,
      versionCount,
      compatibilityCount,
      formatCount,
      referenceCount,
      configCount,
      governanceCount,
      workflowCount,
      readiness: (subjectCount + artifactCount > 0) && compatibilityCount > 0 && formatCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains subjects ${subjectCount}, artifacts ${artifactCount}, versions ${versionCount}, compatibility ${compatibilityCount}, formats ${formatCount}, references ${referenceCount}, config ${configCount}, governance ${governanceCount}, workflow ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function schemaRegistryReadinessProvider(source: SchemaRegistryReadinessSourceFile): SchemaRegistryReadinessReport["registrySetups"][number]["provider"] {
  if (/Apicurio|apicurio|\/apis\/ccompat|\/groups\/.*\/artifacts/i.test(source.filePath) || /Apicurio Registry|io\.apicurio|\/apis\/ccompat|\/groups\/.*\/artifacts|artifactId|groupId/i.test(source.text)) return "apicurio";
  if (/buf\.yaml|buf\.gen\.yaml|buf\.lock|bufbuild|Buf Schema Registry/i.test(source.filePath) || /Buf Schema Registry|buf\.build\/|buf lint|buf breaking|buf generate|buf push|buf\.yaml/i.test(source.text)) return "buf";
  if (/confluent|schema-registry|schemaregistry/i.test(source.filePath) || /Confluent Schema Registry|io\.confluent\.kafka\.schemaregistry|schema\.registry\.url|kafkastore\.topic|schema-registry-start|\/subjects\/.*\/versions/i.test(source.text)) return "confluent";
  if (/KafkaAvroSerializer|KafkaProtobufSerializer|KafkaJsonSchemaSerializer|kafka/i.test(source.filePath) || /KafkaAvroSerializer|KafkaProtobufSerializer|KafkaJsonSchemaSerializer|schema\.registry\.url/i.test(source.text)) return "kafka";
  if (/schema registry|schema[-_ ]?contract|registry/i.test(source.text)) return "custom";
  return "unknown";
}

function schemaRegistryReadinessRegistrySignals(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["registrySignals"] {
  const specs: Array<{ signal: SchemaRegistryReadinessReport["registrySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "confluent-schema-registry", pattern: /Confluent Schema Registry|io\.confluent\.kafka\.schemaregistry|schema\.registry\.url|kafkastore\.topic|\/subjects\/.*\/versions|schema-registry-start/i, evidence: "Confluent-compatible Schema Registry evidence was detected." },
    { signal: "apicurio-registry", pattern: /Apicurio Registry|io\.apicurio|ApicurioRegistry|\/apis\/registry|\/groups\/.*\/artifacts|artifactId|groupId/i, evidence: "Apicurio Registry evidence was detected." },
    { signal: "buf-schema-registry", pattern: /Buf Schema Registry|buf\.build\/|buf push|BSR|buf\.yaml/i, evidence: "Buf Schema Registry or module evidence was detected." },
    { signal: "schema-registry-url", pattern: /schema\.registry\.url|SCHEMA_REGISTRY_URL|schema_registry_url|schemaRegistryUrl/i, evidence: "schema registry URL evidence was detected." },
    { signal: "ccompat-api", pattern: /\/apis\/ccompat\/v[78]|Confluent.*compatible|ccompat/i, evidence: "Confluent compatibility API evidence was detected." }
  ];
  return schemaRegistryReadinessSignalFromSpecs(sourceFiles, specs, "registry", "signal");
}

function schemaRegistryReadinessFormatSignals(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["schemaFormatSignals"] {
  const specs: Array<{ signal: SchemaRegistryReadinessReport["schemaFormatSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "avro", pattern: /\bAvro\b|\bSchema\.AVRO\b|\.avsc\b|avroSchema|kafka-avro-serializer|KafkaAvroSerializer/i, evidence: "Avro schema evidence was detected." },
    { signal: "protobuf", pattern: /\bProtobuf\b|\bPROTOBUF\b|\bproto3\b|\.proto\b|\bbuf\.yaml\b|\bprotoc\b|KafkaProtobufSerializer/i, evidence: "Protobuf schema evidence was detected." },
    { signal: "json-schema", pattern: /\bJSON Schema\b|\bJSONSchema\b|\bSchema\.JSON\b|\.schema\.json\b|kafka-json-schema-serializer|KafkaJsonSchemaSerializer/i, evidence: "JSON Schema evidence was detected." },
    { signal: "openapi", pattern: /\bOpenAPI\b|\bopenapi:\b|\bswagger\b/i, evidence: "OpenAPI schema evidence was detected." },
    { signal: "asyncapi", pattern: /\bAsyncAPI\b|\basyncapi:\b/i, evidence: "AsyncAPI schema evidence was detected." }
  ];
  return schemaRegistryReadinessSignalFromSpecs(sourceFiles, specs, "schema format", "signal");
}

function schemaRegistryReadinessIdentitySignals(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["identitySignals"] {
  const specs: Array<{ signal: SchemaRegistryReadinessReport["identitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "subject", pattern: /\/subjects?\/|\bsubject(Name|s)?\b|TopicNameStrategy|RecordNameStrategy|SubjectNameStrategy/i, evidence: "subject identity evidence was detected." },
    { signal: "artifact-id", pattern: /\bartifactId\b|artifact-id|artifact_id/i, evidence: "artifact ID evidence was detected." },
    { signal: "group-id", pattern: /\bgroupId\b|group-id|group_id/i, evidence: "group ID evidence was detected." },
    { signal: "version", pattern: /\/versions?\b|\bversionId\b|\blatest\b|\bschemaVersion\b|\bbuf\.lock\b/i, evidence: "version identity evidence was detected." },
    { signal: "schema-id", pattern: /\bschema ID\b|\bschemaId\b|\bschemas\/ids\b|RegisterSchemaResponse/i, evidence: "schema ID evidence was detected." },
    { signal: "content-id", pattern: /\bcontentId\b|content-id/i, evidence: "content ID evidence was detected." },
    { signal: "global-id", pattern: /\bglobalId\b|global-id/i, evidence: "global ID evidence was detected." },
    { signal: "references", pattern: /\breferences?\b|\bSchemaReference\b|\bimports?\b|\bdeps:\b/i, evidence: "schema references or imports evidence was detected." }
  ];
  return schemaRegistryReadinessSignalFromSpecs(sourceFiles, specs, "identity", "signal");
}

function schemaRegistryReadinessCompatibilitySignals(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["compatibilitySignals"] {
  const specs: Array<{ signal: SchemaRegistryReadinessReport["compatibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "backward", pattern: /\bBACKWARD(_TRANSITIVE)?\b|default.*BACKWARD/i, evidence: "BACKWARD compatibility evidence was detected." },
    { signal: "forward", pattern: /\bFORWARD(_TRANSITIVE)?\b/i, evidence: "FORWARD compatibility evidence was detected." },
    { signal: "full", pattern: /\bFULL(_TRANSITIVE)?\b/i, evidence: "FULL compatibility evidence was detected." },
    { signal: "transitive", pattern: /\bTRANSITIVE\b/i, evidence: "transitive compatibility evidence was detected." },
    { signal: "none", pattern: /\bNONE\b|compatibility.*none/i, evidence: "NONE compatibility evidence was detected." },
    { signal: "compatibility-check", pattern: /\/compatibility\/subjects|testCompatibility|schema-compatibility-check|compatibility check/i, evidence: "compatibility check evidence was detected." },
    { signal: "breaking-check", pattern: /buf breaking|breaking:\s*|protoc-gen-buf-breaking/i, evidence: "Buf breaking-change check evidence was detected." }
  ];
  return schemaRegistryReadinessSignalFromSpecs(sourceFiles, specs, "compatibility", "signal");
}

function schemaRegistryReadinessGovernanceSignals(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["governanceSignals"] {
  const specs: Array<{ signal: SchemaRegistryReadinessReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "compatibility-rule", pattern: /compatibility.*rule|CompatibilityLevel|compatibilityLevel|rules.*compatibility/i, evidence: "compatibility rule evidence was detected." },
    { signal: "validity-rule", pattern: /validity.*rule|VALIDITY|rule.*valid|content validity/i, evidence: "validity rule evidence was detected." },
    { signal: "mode", pattern: /\bREADWRITE\b|\bREADONLY\b|\bIMPORT\b|\/mode\b|mode:/i, evidence: "registry mode evidence was detected." },
    { signal: "lint", pattern: /buf lint|lint:\s*|protoc-gen-buf-lint/i, evidence: "schema lint evidence was detected." },
    { signal: "breaking-policy", pattern: /breaking:\s*|breaking.*use|-\s*(FILE|PACKAGE|WIRE_JSON|WIRE)\b/i, evidence: "breaking policy evidence was detected." },
    { signal: "managed-mode", pattern: /managed:\s*|managed mode/i, evidence: "Buf managed mode evidence was detected." },
    { signal: "dependency-lock", pattern: /buf\.lock|deps:\s*|dependency resolution|module dependencies/i, evidence: "schema dependency lock evidence was detected." }
  ];
  return schemaRegistryReadinessSignalFromSpecs(sourceFiles, specs, "governance", "signal");
}

function schemaRegistryReadinessWorkflowSignals(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: SchemaRegistryReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "schema-register-command", pattern: /curl .*\/subjects\/.*\/versions|registerWithResponse|registerSchema|schema registry.*register|create_artifact/i, evidence: "schema registration command evidence was detected." },
    { signal: "compatibility-command", pattern: /schema-compatibility-check|curl .*\/compatibility\/subjects|testCompatibility/i, evidence: "compatibility command evidence was detected." },
    { signal: "buf-lint", pattern: /buf lint|protoc-gen-buf-lint/i, evidence: "Buf lint command evidence was detected." },
    { signal: "buf-breaking", pattern: /buf breaking|protoc-gen-buf-breaking/i, evidence: "Buf breaking command evidence was detected." },
    { signal: "buf-generate", pattern: /buf generate|buf\.gen\.ya?ml/i, evidence: "Buf generate command evidence was detected." },
    { signal: "buf-push", pattern: /buf push/i, evidence: "Buf push command evidence was detected." },
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|schema-registry-report\.json|buf-breaking\.json|compatibility-report\.json|schema-readiness\.json/i, evidence: "schema readiness artifact upload evidence was detected." }
  ];
  return schemaRegistryReadinessSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function schemaRegistryReadinessPackageSignals(sourceFiles: SchemaRegistryReadinessSourceFile[]): SchemaRegistryReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SchemaRegistryReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "schema-registry-client", pattern: /@kafkajs\/confluent-schema-registry|io\.confluent:kafka-schema-registry-client|schema[-_]?registry.*client|schemaregistry.*client/i, evidence: "schema registry client package evidence was detected." },
    { signal: "kafka-avro-serializer", pattern: /kafka-avro-serializer|KafkaAvroSerializer/i, evidence: "Kafka Avro serializer package evidence was detected." },
    { signal: "kafka-protobuf-serializer", pattern: /kafka-protobuf-serializer|KafkaProtobufSerializer/i, evidence: "Kafka Protobuf serializer package evidence was detected." },
    { signal: "kafka-json-schema-serializer", pattern: /kafka-json-schema-serializer|KafkaJsonSchemaSerializer/i, evidence: "Kafka JSON Schema serializer package evidence was detected." },
    { signal: "apicurio-client", pattern: /apicurio.*client|io\.apicurio.*registry|apicurio-registry-client/i, evidence: "Apicurio client package evidence was detected." },
    { signal: "buf-cli", pattern: /@bufbuild\/buf|bufbuild\/buf|buf CLI|buf\.build/i, evidence: "Buf CLI package evidence was detected." },
    { signal: "protoc", pattern: /\bprotoc\b|protoc-gen-|google\.protobuf/i, evidence: "protoc or protoc plugin evidence was detected." }
  ];
  return schemaRegistryReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function schemaRegistryReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SchemaRegistryReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/schema-registry-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildStreamProcessingReadinessReport(walk: WalkResult): Promise<StreamProcessingReadinessReport> {
  const sourceFiles = await streamProcessingReadinessSourceFiles(walk);
  const streamProcessingSetups = streamProcessingReadinessSetups(sourceFiles);
  const engineSignals = streamProcessingReadinessEngineSignals(sourceFiles);
  const jobSignals = streamProcessingReadinessJobSignals(sourceFiles);
  const sourceSignals = streamProcessingReadinessSourceSignals(sourceFiles);
  const transformSignals = streamProcessingReadinessTransformSignals(sourceFiles);
  const windowSignals = streamProcessingReadinessWindowSignals(sourceFiles);
  const watermarkSignals = streamProcessingReadinessWatermarkSignals(sourceFiles);
  const stateSignals = streamProcessingReadinessStateSignals(sourceFiles);
  const checkpointSignals = streamProcessingReadinessCheckpointSignals(sourceFiles);
  const sinkSignals = streamProcessingReadinessSinkSignals(sourceFiles);
  const deploymentSignals = streamProcessingReadinessDeploymentSignals(sourceFiles);
  const monitoringSignals = streamProcessingReadinessMonitoringSignals(sourceFiles);
  const ciSignals = streamProcessingReadinessCiSignals(sourceFiles);
  const packageSignals = streamProcessingReadinessPackageSignals(sourceFiles);

  const hasEngine = engineSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasJob = jobSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.jobCount > 0);
  const hasSource = sourceSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.sourceCount > 0);
  const hasSink = sinkSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.sinkCount > 0);
  const hasWindow = windowSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.windowCount > 0);
  const hasWatermark = watermarkSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.watermarkCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.stateCount > 0);
  const hasCheckpoint = checkpointSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.checkpointCount > 0);
  const hasDeliveryGuarantee = checkpointSignals.some((item) => item.signal === "exactly-once-mode" && item.readiness === "ready")
    || sinkSignals.some((item) => ["two-phase-commit", "exactly-once-sink"].includes(item.signal) && item.readiness === "ready");
  const hasDeployment = deploymentSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.deploymentCount > 0);
  const hasMonitoring = monitoringSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.monitoringCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || streamProcessingSetups.some((item) => item.ciCount > 0);

  const riskQueue: StreamProcessingReadinessReport["riskQueue"] = [];
  if (!hasEngine && !hasJob) {
    riskQueue.push({
      priority: "high",
      action: "Document the stream processing engine and job entrypoint before claiming processing readiness.",
      why: "Flink, Beam, and Spark Structured Streaming readiness starts with an explicit engine, runner, DataStream/Pipeline/readStream job, or equivalent custom processor.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  if (hasJob && (!hasSource || !hasSink)) {
    riskQueue.push({
      priority: "high",
      action: "Pair each stream processing job with source and sink ownership.",
      why: "Processing jobs without both input and output evidence leave data boundaries, replay behavior, and delivery ownership ambiguous.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  if (hasWindow && !hasWatermark) {
    riskQueue.push({
      priority: "medium",
      action: "Add watermark and event-time handling around windowed stream logic.",
      why: "Windowed stream processing needs explicit watermark, timestamp assignment, or lateness policy to handle out-of-order events.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  if (hasState && !hasCheckpoint) {
    riskQueue.push({
      priority: "high",
      action: "Pair stateful stream transforms with checkpoint, savepoint, or checkpointLocation evidence.",
      why: "Keyed state, timers, state stores, and group-state logic need recovery checkpoints before runtime failure testing.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  if (hasSink && !hasDeliveryGuarantee) {
    riskQueue.push({
      priority: "medium",
      action: "Document sink delivery guarantees such as exactly-once mode or two-phase commit.",
      why: "Streaming sinks can duplicate, drop, or reorder output unless delivery semantics and checkpoint coupling are explicit.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  if ((hasEngine || hasJob) && !hasDeployment) {
    riskQueue.push({
      priority: "medium",
      action: "Add runner, cluster, Kubernetes, YARN, JobManager, TaskManager, or spark-submit deployment evidence.",
      why: "A stream job is not production-ready until the execution target and operator boundary are visible.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  if ((hasEngine || hasJob) && !hasMonitoring) {
    riskQueue.push({
      priority: "low",
      action: "Add metrics, backpressure, checkpoint metrics, lag, query listener, job status, or alert evidence.",
      why: "Stream processing incidents usually surface through lag, checkpoints, backpressure, or job status before user-facing failures.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  if ((hasEngine || hasJob) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Add CI smoke artifacts for stream job, checkpoint recovery, windowing, and sink delivery checks.",
      why: "Static stream processing readiness is stronger when CI records bounded runner and recovery evidence.",
      relatedHref: "html/stream-processing-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run stream processing tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records stream processing readiness only; it does not run Flink, Beam, Spark, runners, clusters, streaming jobs, checkpoint recovery, sinks, deployments, monitoring, or CI commands.",
    relatedHref: "html/stream-processing-readiness.html"
  });

  return {
    summary: `Stream processing readiness report: setup ${streamProcessingSetups.length}개, engine signal ${engineSignals.length}개, checkpoint signal ${checkpointSignals.length}개, sink signal ${sinkSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Stream processing readiness Apache Flink Apache Beam Spark Structured Streaming StreamExecutionEnvironment DataStream Pipeline PCollection readStream writeStream checkpointing savepoint state backend WatermarkStrategy window trigger exactly-once sink runner deployment metrics CI",
    streamProcessingSetups,
    engineSignals,
    jobSignals,
    sourceSignals,
    transformSignals,
    windowSignals,
    watermarkSignals,
    stateSignals,
    checkpointSignals,
    sinkSignals,
    deploymentSignals,
    monitoringSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"StreamExecutionEnvironment|DataStream|env.execute|enableCheckpointing|CheckpointingMode|WatermarkStrategy|KafkaSource|KafkaSink\" .", purpose: "Inventory Flink job entrypoints, checkpointing, watermarks, Kafka sources, and sinks." },
      { command: "rg \"Pipeline|PCollection|ParDo|DoFn|GroupByKey|Window|FixedWindows|SlidingWindows|FlinkRunner|SparkRunner|KafkaIO|PubsubIO\" .", purpose: "Find Beam pipelines, transforms, windows, IO connectors, and runner selection." },
      { command: "rg \"readStream|writeStream|StreamingQuery|withWatermark|checkpointLocation|foreachBatch|OutputMode|StreamingQueryListener\" .", purpose: "Trace Spark Structured Streaming sources, sinks, watermarks, checkpoints, and listeners." },
      { command: "rg \"ValueState|MapState|StateSpec|TimerSpec|stateStore|mapGroupsWithState|flatMapGroupsWithState|RocksDB|savepoint\" .", purpose: "Review stateful operators, timers, state backends, savepoints, and recovery assumptions." },
      { command: "rg \"stream-job-smoke|checkpoint-smoke|window-smoke|sink-smoke|upload-artifact|backpressure|checkpoint metrics\" .github .", purpose: "Check CI smoke commands, readiness artifacts, backpressure, and checkpoint metrics evidence." }
    ],
    learnerNextSteps: [
      "먼저 Flink, Beam, Spark Structured Streaming 중 어떤 engine evidence가 있는지 확인하고 job entrypoint를 표시하세요.",
      "각 job에서 source, transform, window/watermark, state/checkpoint, sink 순서로 흐름을 따라가세요.",
      "stateful transform이 있으면 checkpoint, savepoint, checkpointLocation, restart strategy, state backend를 함께 확인하세요.",
      "sink가 보이면 exactly-once mode, two-phase commit, foreachBatch idempotency, output mode 같은 delivery guarantee를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 Flink/Beam/Spark runner, cluster deployment, checkpoint recovery, sink delivery는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type StreamProcessingReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function streamProcessingReadinessSourceFiles(walk: WalkResult): Promise<StreamProcessingReadinessSourceFile[]> {
  const files: StreamProcessingReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !streamProcessingReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 280_000);
    if (!text) continue;
    if (!streamProcessingReadinessPathSignal(file.relPath) && !streamProcessingReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function streamProcessingReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return streamProcessingReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|build\.gradle|settings\.gradle|pom\.xml|build\.sbt|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|\.env\.example|\.env\.sample)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|java|kt|scala|py|go|rs|json|md|mdx|ya?ml|toml|properties|conf|xml|sbt)$/i.test(filePath);
}

function streamProcessingReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(flink|beam|spark|structured[-_]?streaming|stream[-_]?processing|streams?|pipelines?|jobs?|sources?|sinks?|watermarks?|checkpoints?|savepoints?|runners?|state[-_]?stores?|operators?)(\/|\.|-|_|$)|\.github\/workflows|docker-compose|compose\.ya?ml/i.test(filePath);
}

function streamProcessingReadinessContentSignal(text: string): boolean {
  return /\b(Apache Flink|StreamExecutionEnvironment|DataStream|env\.execute|enableCheckpointing|CheckpointingMode|WatermarkStrategy|KeyedProcessFunction|ValueState|MapState|RocksDB|KafkaSource|KafkaSink|TwoPhaseCommitSinkFunction|flink-streaming|flink-connector|Apache Beam|Pipeline\.create|PCollection|ParDo|DoFn|GroupByKey|FixedWindows|SlidingWindows|Sessions|AllowedLateness|StateSpec|TimerSpec|FlinkRunner|SparkRunner|KafkaIO|PubsubIO|BigQueryIO|beam-sdks|beam-runners|Spark Structured Streaming|readStream|writeStream|StreamingQuery|withWatermark|checkpointLocation|foreachBatch|OutputMode|stateStore|mapGroupsWithState|flatMapGroupsWithState|StreamingQueryListener|spark-sql|spark-streaming|stream-processing)\b/i.test(text);
}

function streamProcessingReadinessSetups(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["streamProcessingSetups"] {
  const rows: StreamProcessingReadinessReport["streamProcessingSetups"] = [];
  for (const source of sourceFiles) {
    const jobCount = countMatches(source.text, /\bStreamExecutionEnvironment\b|\bDataStream\b|\benv\.execute\s*\(|\bPipeline\.create\s*\(|\bPCollection\b|\breadStream\b|\bwriteStream\b|\bStreamingQuery\b|\bFlinkRunner\b|\bSparkRunner\b|\brunner\b/gi);
    const sourceCount = countMatches(source.text, /\bKafkaSource\b|\bKafkaIO\b|\bPubsubIO\b|\bKinesis\b|\bPulsar\b|\bFileSource\b|\bsocket\b|\breadStream\b|\bsource\b/gi);
    const transformCount = countMatches(source.text, /\.map\s*\(|\.flatMap\s*\(|\.filter\s*\(|\.keyBy\s*\(|\bParDo\b|\bDoFn\b|\bGroupByKey\b|\baggregation\b|\baggregate\s*\(|\bjoin\s*\(|\.select\s*\(|\.withColumn\s*\(/gi);
    const windowCount = countMatches(source.text, /\bTumblingEventTimeWindows\b|\bSlidingEventTimeWindows\b|\bEventTimeSessionWindows\b|\bWindow\.into\b|\bFixedWindows\b|\bSlidingWindows\b|\bSessions\b|\bwindow\s*\(|\btrigger\b|\bAllowedLateness\b|\blate data\b/gi);
    const watermarkCount = countMatches(source.text, /\bWatermarkStrategy\b|\bwithWatermark\b|\bevent[-_ ]?time\b|\bprocessing[-_ ]?time\b|\bassignTimestampsAndWatermarks\b|\btimestamp assigner\b|\bidle source\b/gi);
    const stateCount = countMatches(source.text, /\bKeyedProcessFunction\b|\bValueState\b|\bMapState\b|\bStateSpec\b|\bTimerSpec\b|\bTimerService\b|\bstateStore\b|\bmapGroupsWithState\b|\bflatMapGroupsWithState\b|\bRocksDB\b|\bstate\.backend\b|\bttl\b/gi);
    const checkpointCount = countMatches(source.text, /\benableCheckpointing\b|\bcheckpointing\b|\bcheckpointLocation\b|\bcheckpoint location\b|\bsavepoint\b|\bRestartStrategies\b|\bCheckpointingMode\.EXACTLY_ONCE\b|\bcheckpoint timeout\b/gi);
    const sinkCount = countMatches(source.text, /\bKafkaSink\b|\bFileSink\b|\bJdbcSink\b|\bBigQueryIO\b|\bwriteStream\b|\bforeachBatch\b|\bTwoPhaseCommitSinkFunction\b|\bexactly[-_ ]?once sink\b|\bsink\b/gi);
    const deploymentCount = countMatches(source.text, /\bFlinkRunner\b|\bSparkRunner\b|\bflink run\b|\bspark-submit\b|\bKubernetes\b|\bYARN\b|\boperator\b|\bJobManager\b|\bTaskManager\b|\bcluster submit\b/gi);
    const monitoringCount = countMatches(source.text, /\bmetrics?\b|\bbackpressure\b|\bcheckpoint metrics\b|\blag\b|\bStreamingQueryListener\b|\bjob status\b|\balert\b/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|\bgithub[-_ ]?actions\b|stream-job-smoke|checkpoint-smoke|window-smoke|sink-smoke|upload-artifact|stream-processing-report\.json|checkpoint-recovery\.json|window-lateness\.json|sink-delivery\.json/gi);
    const hasSetupSignal = jobCount + sourceCount + transformCount + windowCount + watermarkCount + stateCount + checkpointCount + sinkCount + deploymentCount + monitoringCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      engine: streamProcessingReadinessEngine(source),
      jobCount,
      sourceCount,
      transformCount,
      windowCount,
      watermarkCount,
      stateCount,
      checkpointCount,
      sinkCount,
      deploymentCount,
      monitoringCount,
      ciCount,
      readiness: jobCount > 0 && sourceCount > 0 && checkpointCount > 0 && sinkCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains jobs ${jobCount}, sources ${sourceCount}, transforms ${transformCount}, windows ${windowCount}, watermarks ${watermarkCount}, state ${stateCount}, checkpoints ${checkpointCount}, sinks ${sinkCount}, deployment ${deploymentCount}, monitoring ${monitoringCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function streamProcessingReadinessEngine(source: StreamProcessingReadinessSourceFile): StreamProcessingReadinessReport["streamProcessingSetups"][number]["engine"] {
  if (/Apache Beam|Pipeline\.create|PCollection|ParDo|DoFn|beam-sdks|beam-runners/i.test(source.text)) return "beam";
  if (/Apache Flink|StreamExecutionEnvironment|DataStream|FlinkRunner|flink-streaming|flink-connector/i.test(source.text)) return "flink";
  if (/Spark Structured Streaming|readStream|writeStream|StreamingQuery|spark-sql|spark-streaming|SparkRunner/i.test(source.text)) return "spark";
  if (/stream[-_ ]?processing|stream processor|stream job/i.test(source.text)) return "custom";
  return "unknown";
}

function streamProcessingReadinessEngineSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["engineSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["engineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "apache-flink", pattern: /Apache Flink|StreamExecutionEnvironment|DataStream|flink-streaming|FlinkRunner/i, evidence: "Apache Flink evidence was detected." },
    { signal: "apache-beam", pattern: /Apache Beam|Pipeline\.create|PCollection|beam-sdks|beam-runners/i, evidence: "Apache Beam evidence was detected." },
    { signal: "spark-structured-streaming", pattern: /Spark Structured Streaming|readStream|writeStream|StreamingQuery|spark-sql|spark-streaming/i, evidence: "Spark Structured Streaming evidence was detected." },
    { signal: "custom", pattern: /stream[-_ ]?processing|stream processor|stream job/i, evidence: "custom stream processing evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "engine", "signal");
}

function streamProcessingReadinessJobSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["jobSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["jobSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "stream-execution-environment", pattern: /\bStreamExecutionEnvironment\b|\benv\.execute\s*\(/i, evidence: "Flink StreamExecutionEnvironment evidence was detected." },
    { signal: "datastream", pattern: /\bDataStream\b|\bSingleOutputStreamOperator\b/i, evidence: "Flink DataStream evidence was detected." },
    { signal: "beam-pipeline", pattern: /\bPipeline\.create\s*\(|\bPipelineOptions\b/i, evidence: "Beam Pipeline evidence was detected." },
    { signal: "pcollection", pattern: /\bPCollection\b|\bPTransform\b/i, evidence: "Beam PCollection evidence was detected." },
    { signal: "readstream", pattern: /\breadStream\b|\.readStream\s*/i, evidence: "Spark readStream evidence was detected." },
    { signal: "writestream", pattern: /\bwriteStream\b|\.writeStream\s*/i, evidence: "Spark writeStream evidence was detected." },
    { signal: "streaming-query", pattern: /\bStreamingQuery\b|\bStreamingQueryManager\b/i, evidence: "Spark StreamingQuery evidence was detected." },
    { signal: "runner", pattern: /\bFlinkRunner\b|\bSparkRunner\b|\brunner\b/i, evidence: "runner evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "job", "signal");
}

function streamProcessingReadinessSourceSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["sourceSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["sourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kafka-source", pattern: /\bKafkaSource\b|\bKafkaIO\.read\b|\bkafka\s*\.option|format\(["']kafka["']\)/i, evidence: "Kafka source evidence was detected." },
    { signal: "file-source", pattern: /\bFileSource\b|\bTextIO\.read\b|\breadStream\.format\(["'](json|csv|parquet|text)["']\)|\bfile source\b/i, evidence: "file source evidence was detected." },
    { signal: "socket-source", pattern: /\bsocket\b|format\(["']socket["']\)/i, evidence: "socket source evidence was detected." },
    { signal: "pubsub-source", pattern: /\bPubsubIO\b|\bPubSub\b/i, evidence: "Pub/Sub source evidence was detected." },
    { signal: "kinesis-source", pattern: /\bKinesis\b|\bKinesisIO\b/i, evidence: "Kinesis source evidence was detected." },
    { signal: "pulsar-source", pattern: /\bPulsarSource\b|\bpulsar source\b|\bpulsar-client\b/i, evidence: "Pulsar source evidence was detected." },
    { signal: "custom-source", pattern: /\bSourceFunction\b|\bSourceReader\b|\bcustom source\b/i, evidence: "custom source evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "source", "signal");
}

function streamProcessingReadinessTransformSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["transformSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["transformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "map", pattern: /\.map\s*\(|\bMapElements\b/i, evidence: "map transform evidence was detected." },
    { signal: "flatmap", pattern: /\.flatMap\s*\(|\bFlatMap\b|\bFlatMapFunction\b/i, evidence: "flatMap transform evidence was detected." },
    { signal: "filter", pattern: /\.filter\s*\(|\bFilter\b|\bFilterFunction\b/i, evidence: "filter transform evidence was detected." },
    { signal: "keyby", pattern: /\.keyBy\s*\(|\bKeySelector\b/i, evidence: "keyBy transform evidence was detected." },
    { signal: "par-do", pattern: /\bParDo\b|\bDoFn\b/i, evidence: "Beam ParDo/DoFn evidence was detected." },
    { signal: "group-by-key", pattern: /\bGroupByKey\b|\bCoGroupByKey\b/i, evidence: "group-by-key evidence was detected." },
    { signal: "aggregation", pattern: /\baggregate\s*\(|\breduce\s*\(|\bCombine\b|\bcount\s*\(|\bsum\s*\(/i, evidence: "aggregation evidence was detected." },
    { signal: "join", pattern: /\bjoin\s*\(|\bCoGroupByKey\b|\bintervalJoin\b/i, evidence: "join evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "transform", "signal");
}

function streamProcessingReadinessWindowSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["windowSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["windowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tumbling-window", pattern: /\bTumblingEventTimeWindows\b|\bTumblingProcessingTimeWindows\b|\btumbling window/i, evidence: "tumbling window evidence was detected." },
    { signal: "sliding-window", pattern: /\bSlidingEventTimeWindows\b|\bSlidingProcessingTimeWindows\b|\bSlidingWindows\b|\bsliding window/i, evidence: "sliding window evidence was detected." },
    { signal: "session-window", pattern: /\bEventTimeSessionWindows\b|\bProcessingTimeSessionWindows\b|\bSessions\b|\bsession window/i, evidence: "session window evidence was detected." },
    { signal: "fixed-window", pattern: /\bFixedWindows\b|\bfixed window/i, evidence: "fixed window evidence was detected." },
    { signal: "trigger", pattern: /\btrigger\b|\bAfterWatermark\b|\bAfterProcessingTime\b/i, evidence: "trigger evidence was detected." },
    { signal: "allowed-lateness", pattern: /\bAllowedLateness\b|\ballowedLateness\b|\ballowed lateness/i, evidence: "allowed lateness evidence was detected." },
    { signal: "late-data", pattern: /\blate data\b|\bsideOutputLateData\b|\bdrop late\b/i, evidence: "late-data handling evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "window", "signal");
}

function streamProcessingReadinessWatermarkSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["watermarkSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["watermarkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "watermark-strategy", pattern: /\bWatermarkStrategy\b|\bassignTimestampsAndWatermarks\b/i, evidence: "WatermarkStrategy evidence was detected." },
    { signal: "with-watermark", pattern: /\bwithWatermark\b/i, evidence: "Spark withWatermark evidence was detected." },
    { signal: "event-time", pattern: /\bevent[-_ ]?time\b|\bEventTime\b/i, evidence: "event-time evidence was detected." },
    { signal: "processing-time", pattern: /\bprocessing[-_ ]?time\b|\bProcessingTime\b/i, evidence: "processing-time evidence was detected." },
    { signal: "timestamp-assigner", pattern: /\btimestamp assigner\b|\bTimestampAssigner\b|\bforBoundedOutOfOrderness\b/i, evidence: "timestamp assigner evidence was detected." },
    { signal: "idle-source", pattern: /\bidle source\b|\bwithIdleness\b/i, evidence: "idle source evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "watermark", "signal");
}

function streamProcessingReadinessStateSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["stateSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "keyed-state", pattern: /\bKeyedProcessFunction\b|\bkeyed state\b|\bKeyedState\b/i, evidence: "keyed state evidence was detected." },
    { signal: "value-state", pattern: /\bValueState\b|\bValueStateDescriptor\b/i, evidence: "ValueState evidence was detected." },
    { signal: "map-state", pattern: /\bMapState\b|\bMapStateDescriptor\b/i, evidence: "MapState evidence was detected." },
    { signal: "state-store", pattern: /\bstateStore\b|\bStateStore\b|\bstate store\b/i, evidence: "state store evidence was detected." },
    { signal: "rocksdb", pattern: /\bRocksDB\b|\bstate\.backend\s*=\s*rocksdb\b/i, evidence: "RocksDB state backend evidence was detected." },
    { signal: "timer", pattern: /\bTimerSpec\b|\bTimerService\b|\bonTimer\b|\bRegisterProcessingTimeTimer\b/i, evidence: "timer evidence was detected." },
    { signal: "ttl", pattern: /\bStateTtlConfig\b|\bttl\b|\bTTL\b/i, evidence: "state TTL evidence was detected." },
    { signal: "map-groups-with-state", pattern: /\bmapGroupsWithState\b|\bflatMapGroupsWithState\b/i, evidence: "Spark group-state evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function streamProcessingReadinessCheckpointSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["checkpointSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["checkpointSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "checkpointing", pattern: /\benableCheckpointing\b|\bcheckpointing\b|\bCheckpointConfig\b/i, evidence: "checkpointing evidence was detected." },
    { signal: "checkpoint-location", pattern: /\bcheckpointLocation\b|\bcheckpoint location\b|\bcheckpointDir\b/i, evidence: "checkpoint location evidence was detected." },
    { signal: "savepoint", pattern: /\bsavepoint\b|\bSavepoint\b/i, evidence: "savepoint evidence was detected." },
    { signal: "restart-strategy", pattern: /\bRestartStrategies\b|\brestart strategy\b|\bfixedDelayRestart\b|\bfailureRateRestart\b/i, evidence: "restart strategy evidence was detected." },
    { signal: "exactly-once-mode", pattern: /\bCheckpointingMode\.EXACTLY_ONCE\b|\bexactly[-_ ]?once\b|\bOutputMode\b/i, evidence: "exactly-once mode evidence was detected." },
    { signal: "checkpoint-timeout", pattern: /\bsetCheckpointTimeout\b|\bcheckpoint timeout\b|\bminPauseBetweenCheckpoints\b/i, evidence: "checkpoint timeout evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "checkpoint", "signal");
}

function streamProcessingReadinessSinkSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["sinkSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["sinkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kafka-sink", pattern: /\bKafkaSink\b|\bKafkaIO\.write\b|\bformat\(["']kafka["']\)|\bkafka sink\b/i, evidence: "Kafka sink evidence was detected." },
    { signal: "file-sink", pattern: /\bFileSink\b|\bTextIO\.write\b|\bformat\(["'](json|csv|parquet|text)["']\)|\bfile sink\b/i, evidence: "file sink evidence was detected." },
    { signal: "jdbc-sink", pattern: /\bJdbcSink\b|\bforeachBatch\b.*jdbc|\bJDBC\b/i, evidence: "JDBC sink evidence was detected." },
    { signal: "bigquery-sink", pattern: /\bBigQueryIO\.write\b|\bBigQueryIO\b/i, evidence: "BigQuery sink evidence was detected." },
    { signal: "foreach-batch", pattern: /\bforeachBatch\b/i, evidence: "foreachBatch evidence was detected." },
    { signal: "two-phase-commit", pattern: /\bTwoPhaseCommitSinkFunction\b|\btwo[-_ ]?phase commit\b/i, evidence: "two-phase commit sink evidence was detected." },
    { signal: "exactly-once-sink", pattern: /\bexactly[-_ ]?once sink\b|\bDeliveryGuarantee\.EXACTLY_ONCE\b|\bwithDeliveryGuarantee\b/i, evidence: "exactly-once sink evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "sink", "signal");
}

function streamProcessingReadinessDeploymentSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["deploymentSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["deploymentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flink-runner", pattern: /\bFlinkRunner\b|\bflink run\b|\bflink-runner\b/i, evidence: "Flink runner evidence was detected." },
    { signal: "spark-runner", pattern: /\bSparkRunner\b|\bspark-submit\b|\bspark-runner\b/i, evidence: "Spark runner evidence was detected." },
    { signal: "cluster-submit", pattern: /\bcluster submit\b|\bsubmitJob\b|\bJobClient\b/i, evidence: "cluster submit evidence was detected." },
    { signal: "kubernetes", pattern: /\bKubernetes\b|\bk8s\b|\bkubernetes\.operator\b/i, evidence: "Kubernetes evidence was detected." },
    { signal: "yarn", pattern: /\bYARN\b|\byarn-cluster\b/i, evidence: "YARN evidence was detected." },
    { signal: "operator", pattern: /\boperator\b|\bFlinkDeployment\b|\bSparkApplication\b/i, evidence: "operator evidence was detected." },
    { signal: "jobmanager", pattern: /\bJobManager\b|\bjobmanager\b/i, evidence: "Flink JobManager evidence was detected." },
    { signal: "taskmanager", pattern: /\bTaskManager\b|\btaskmanager\b/i, evidence: "Flink TaskManager evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "deployment", "signal");
}

function streamProcessingReadinessMonitoringSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["monitoringSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["monitoringSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metrics", pattern: /\bmetrics?\b|\bPrometheus\b|\bMicrometer\b/i, evidence: "metrics evidence was detected." },
    { signal: "backpressure", pattern: /\bbackpressure\b|\bback pressure\b/i, evidence: "backpressure evidence was detected." },
    { signal: "checkpoint-metrics", pattern: /\bcheckpoint metrics\b|\bnumBytesIn\b|\blastCheckpoint\b|\bcheckpointDuration\b/i, evidence: "checkpoint metrics evidence was detected." },
    { signal: "lag", pattern: /\blag\b|\bconsumer lag\b|\binputRowsPerSecond\b|\bprocessedRowsPerSecond\b/i, evidence: "stream lag or throughput evidence was detected." },
    { signal: "streaming-query-listener", pattern: /\bStreamingQueryListener\b|\bonQueryProgress\b/i, evidence: "StreamingQueryListener evidence was detected." },
    { signal: "job-status", pattern: /\bjob status\b|\bJobStatus\b|\bJobClient\b|\bquery\.status\b/i, evidence: "job status evidence was detected." },
    { signal: "alert", pattern: /\balert\b|\bAlertmanager\b|\bPagerDuty\b/i, evidence: "alert evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "monitoring", "signal");
}

function streamProcessingReadinessCiSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["ciSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "stream-job-smoke", pattern: /stream-job-smoke|stream job smoke|flink.*smoke|beam.*smoke|spark.*smoke/i, evidence: "stream job smoke command evidence was detected." },
    { signal: "checkpoint-smoke", pattern: /checkpoint-smoke|checkpoint recovery|savepoint smoke/i, evidence: "checkpoint smoke command evidence was detected." },
    { signal: "window-smoke", pattern: /window-smoke|window lateness|watermark smoke/i, evidence: "window smoke command evidence was detected." },
    { signal: "sink-smoke", pattern: /sink-smoke|sink delivery|exactly-once smoke/i, evidence: "sink smoke command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|stream-processing-report\.json|checkpoint-recovery\.json|window-lateness\.json|sink-delivery\.json/i, evidence: "stream processing readiness artifact upload evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function streamProcessingReadinessPackageSignals(sourceFiles: StreamProcessingReadinessSourceFile[]): StreamProcessingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: StreamProcessingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flink-streaming", pattern: /org\.apache\.flink:flink-streaming|flink-streaming-java|flink-core|\bflink-streaming\b/i, evidence: "Flink streaming package evidence was detected." },
    { signal: "flink-connector", pattern: /org\.apache\.flink:flink-connector|flink-connector-kafka|flink-connectors/i, evidence: "Flink connector package evidence was detected." },
    { signal: "beam-sdk", pattern: /org\.apache\.beam:beam-sdks|beam-sdks-java-core|apache-beam|apache_beam/i, evidence: "Beam SDK package evidence was detected." },
    { signal: "beam-runner", pattern: /beam-runners-flink|beam-runners-spark|FlinkRunner|SparkRunner/i, evidence: "Beam runner package evidence was detected." },
    { signal: "spark-sql", pattern: /org\.apache\.spark:spark-sql|spark-sql|pyspark/i, evidence: "Spark SQL package evidence was detected." },
    { signal: "spark-streaming", pattern: /org\.apache\.spark:spark-streaming|spark-streaming/i, evidence: "Spark Streaming package evidence was detected." },
    { signal: "custom", pattern: /\bstream[-_ ]?processing\b|\bstream processor\b/i, evidence: "custom stream processing package evidence was detected." }
  ];
  return streamProcessingReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function streamProcessingReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: StreamProcessingReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/stream-processing-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildPipelineOrchestrationReadinessReport(walk: WalkResult): Promise<PipelineOrchestrationReadinessReport> {
  const sourceFiles = await pipelineOrchestrationReadinessSourceFiles(walk);
  const pipelineOrchestrationSetups = pipelineOrchestrationReadinessSetups(sourceFiles);
  const orchestratorSignals = pipelineOrchestrationReadinessOrchestratorSignals(sourceFiles);
  const authoringSignals = pipelineOrchestrationReadinessAuthoringSignals(sourceFiles);
  const dagSignals = pipelineOrchestrationReadinessDagSignals(sourceFiles);
  const taskSignals = pipelineOrchestrationReadinessTaskSignals(sourceFiles);
  const dependencySignals = pipelineOrchestrationReadinessDependencySignals(sourceFiles);
  const scheduleSignals = pipelineOrchestrationReadinessScheduleSignals(sourceFiles);
  const sensorSignals = pipelineOrchestrationReadinessSensorSignals(sourceFiles);
  const assetSignals = pipelineOrchestrationReadinessAssetSignals(sourceFiles);
  const partitionSignals = pipelineOrchestrationReadinessPartitionSignals(sourceFiles);
  const reliabilitySignals = pipelineOrchestrationReadinessReliabilitySignals(sourceFiles);
  const executorSignals = pipelineOrchestrationReadinessExecutorSignals(sourceFiles);
  const deploymentSignals = pipelineOrchestrationReadinessDeploymentSignals(sourceFiles);
  const observabilitySignals = pipelineOrchestrationReadinessObservabilitySignals(sourceFiles);
  const ciSignals = pipelineOrchestrationReadinessCiSignals(sourceFiles);
  const packageSignals = pipelineOrchestrationReadinessPackageSignals(sourceFiles);

  const hasOrchestrator = orchestratorSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => ["apache-airflow", "dagster", "prefect", "airflow-provider"].includes(item.signal) && item.readiness === "ready");
  const hasAuthoring = authoringSignals.some((item) => item.readiness === "ready");
  const hasDag = dagSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.dagCount > 0);
  const hasTask = taskSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.taskCount > 0);
  const hasSchedule = scheduleSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.scheduleCount > 0);
  const hasSensor = sensorSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.sensorCount > 0);
  const hasAssetOrPartition = assetSignals.some((item) => item.readiness === "ready") || partitionSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.assetCount + item.partitionCount > 0);
  const hasReliability = reliabilitySignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.retryCount > 0);
  const hasBackfillOrPartitionPolicy = partitionSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.backfillCount + item.partitionCount > 0);
  const hasExecutor = executorSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.executorCount > 0);
  const hasDeployment = deploymentSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.deploymentCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.observabilityCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || pipelineOrchestrationSetups.some((item) => item.ciCount > 0);

  const riskQueue: PipelineOrchestrationReadinessReport["riskQueue"] = [];
  if (!hasOrchestrator && !hasDag) {
    riskQueue.push({
      priority: "high",
      action: "Document the data pipeline orchestrator and DAG, job, flow, or asset graph before claiming pipeline orchestration readiness.",
      why: "Airflow, Dagster, and Prefect readiness starts with a visible orchestrator boundary and pipeline graph definition.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if (hasDag && !hasTask) {
    riskQueue.push({
      priority: "high",
      action: "Pair each DAG, job, flow, or asset graph with task/operator/op/asset execution evidence.",
      why: "A pipeline graph without executable tasks leaves the actual data work and dependency order ambiguous.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if (hasOrchestrator && !hasAuthoring) {
    riskQueue.push({
      priority: "medium",
      action: "Record stable Airflow authoring imports or equivalent public DAG authoring contracts.",
      why: "Airflow 3 separates stable DAG authoring surfaces such as airflow.sdk from internal modules, so learners should see which public API owns DAG, task, asset, context, params, and trigger-rule contracts.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if (hasSchedule && !hasReliability) {
    riskQueue.push({
      priority: "medium",
      action: "Add retry, SLA, timeout, pool, queue, concurrency, or idempotency evidence to scheduled pipelines.",
      why: "Scheduled pipelines need explicit failure and overload behavior before runtime backfill or production verification.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if (hasAssetOrPartition && !hasBackfillOrPartitionPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Document partition, catchup, backfill, or parameter policy for asset-oriented pipelines.",
      why: "Partitioned assets and date-ranged pipelines need a replay story so learners can reason about missed or historical data.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if (hasSensor && !hasReliability) {
    riskQueue.push({
      priority: "medium",
      action: "Pair sensors and external triggers with retry or idempotency behavior.",
      why: "External triggers can duplicate, arrive late, or fail while polling, so static readiness should expose recovery semantics.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if (hasOrchestrator && (!hasExecutor || !hasDeployment)) {
    riskQueue.push({
      priority: "medium",
      action: "Record executor, worker, work-pool, daemon, deployment, Docker, Kubernetes, or Helm evidence for orchestrated pipelines.",
      why: "Learners need to know where scheduled work actually runs and how the scheduler/worker boundary is deployed.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if ((hasOrchestrator || hasDag || hasTask) && !hasObservability) {
    riskQueue.push({
      priority: "low",
      action: "Add run history, task logs, asset observations, metrics, alerts, or OpenLineage evidence.",
      why: "Pipeline operators need visibility into failed runs, materializations, task logs, and lineage before incidents.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  if ((hasOrchestrator || hasDag || hasTask) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Add DAG parse, orchestration unit, and backfill smoke checks with uploaded artifacts.",
      why: "Static pipeline readiness is stronger when CI proves the graph can parse and backfill smoke commands are preserved.",
      relatedHref: "html/pipeline-orchestration-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run pipeline orchestration commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records pipeline orchestration readiness only; it does not run Airflow, Dagster, Prefect, schedulers, executors, workers, backfills, deployments, or CI commands.",
    relatedHref: "html/pipeline-orchestration-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Pipeline orchestration readiness report: setup ${pipelineOrchestrationSetups.length}개, orchestrator signal ${orchestratorSignals.length}개, authoring signal ${authoringSignals.length}개, DAG/job/flow signal ${dagSignals.length}개, reliability signal ${reliabilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Pipeline orchestration readiness Apache Airflow Dagster Prefect airflow.sdk stable authoring interface DAG dag task task_group setup teardown Param Context TriggerRule Asset flow asset sensor schedule backfill catchup partition retry SLA XCom executor worker deployment run history CI",
    pipelineOrchestrationSetups,
    orchestratorSignals,
    authoringSignals,
    dagSignals,
    taskSignals,
    dependencySignals,
    scheduleSignals,
    sensorSignals,
    assetSignals,
    partitionSignals,
    reliabilitySignals,
    executorSignals,
    deploymentSignals,
    observabilitySignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"airflow\\.sdk|from airflow import DAG|from airflow\\.decorators|@dag|@task|task_group|setup|teardown|Param|Context|TriggerRule|Asset|get_current_context|chain\" .", purpose: "Review Airflow stable authoring imports, legacy imports, DAG/task decorators, task groups, setup/teardown, params, context, trigger rules, assets, and dependency helpers." },
      { command: "rg \"DAG\\(|@dag|airflow.decorators|BaseOperator|PythonOperator|BashOperator|TaskGroup|XCom|Dataset|Sensor\" .", purpose: "Inventory Airflow DAG entrypoints, operators, taskflow decorators, task groups, XCom, datasets, and sensors." },
      { command: "rg \"dagster|@op|@job|@asset|Definitions|ScheduleDefinition|SensorDefinition|PartitionsDefinition|materialize\" .", purpose: "Find Dagster jobs, ops, assets, definitions, schedules, sensors, partitions, and materializations." },
      { command: "rg \"prefect|@flow|@task|Deployment|serve\\(|work_pool|work_queue|retries|retry_delay_seconds\" .", purpose: "Trace Prefect flows, tasks, deployments, workers, work pools, queues, and retry configuration." },
      { command: "rg \"schedule_interval|catchup|backfill|sla|timeout|pool|executor|CeleryExecutor|KubernetesExecutor|dagster-daemon|prefect worker\" .", purpose: "Review scheduling, catchup, backfill, reliability, executor, daemon, and worker boundaries." },
      { command: "rg \"dag-parse-smoke|orchestration-unit-test|backfill-smoke|upload-artifact|OpenLineage|run history|task logs|alerts\" .github .", purpose: "Check CI smoke artifacts, run history, task logs, alerting, and lineage evidence." }
    ],
    learnerNextSteps: [
      "먼저 Airflow DAG, Dagster job/asset graph, Prefect flow 중 실제 pipeline graph boundary를 찾으세요.",
      "Airflow가 있으면 airflow.sdk stable authoring import, legacy import, @dag/@task, task_group, setup/teardown, Param, Context, TriggerRule, Asset, dependency helper를 분리해 보세요.",
      "DAG/job/flow가 보이면 operator, task, op, asset, mapped task가 dependency와 함께 연결되어 있는지 확인하세요.",
      "schedule, catchup, sensor, external trigger evidence는 retry, timeout, idempotency, backfill policy와 함께 읽으세요.",
      "asset, partition, materialization evidence가 있으면 어떤 날짜/파티션 범위를 replay할 수 있는지 확인하세요.",
      "executor, worker, daemon, work pool, deployment evidence로 scheduled work가 어디서 실행되는지 분리하세요.",
      "이 리포트는 정적 readiness입니다. 실제 Airflow/Dagster/Prefect scheduler, executor, worker, backfill, deployment, CI command는 안전한 환경에서 별도로 확인하세요."
    ]
  };
}

type PipelineOrchestrationReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function pipelineOrchestrationReadinessSourceFiles(walk: WalkResult): Promise<PipelineOrchestrationReadinessSourceFile[]> {
  const files: PipelineOrchestrationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !pipelineOrchestrationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 280_000);
    if (!text) continue;
    if (!pipelineOrchestrationReadinessPathSignal(file.relPath) && !pipelineOrchestrationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function pipelineOrchestrationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return pipelineOrchestrationReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|pyproject\.toml|requirements\.txt|poetry\.lock|Pipfile|Dockerfile|docker-compose\.ya?ml|compose\.ya?ml|helmfile\.ya?ml|values\.ya?ml)$/i.test(base)
    || /\.(py|ipynb|js|cjs|mjs|ts|tsx|jsx|json|md|mdx|ya?ml|toml|cfg|ini|txt)$/i.test(filePath);
}

function pipelineOrchestrationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(airflow|dags?|dagster|prefect|pipeline[-_]?orchestration|data[-_]?pipelines?|orchestration|pipelines?|assets?|sensors?|schedules?|backfills?|partitions?|workers?|work[-_]?pools?|executors?)(\/|\.|-|_|$)|\.github\/workflows|docker-compose|compose\.ya?ml|helm/i.test(filePath);
}

function pipelineOrchestrationReadinessContentSignal(text: string): boolean {
  return /(Apache Airflow|from airflow|airflow\.decorators|DAG\s*\(|@dag\b|BaseOperator|PythonOperator|BashOperator|TaskGroup|XCom|DagRun|ExternalTaskSensor|BaseSensorOperator|schedule_interval|catchup|CeleryExecutor|KubernetesExecutor|apache-airflow|airflow-provider|Dagster|dagster|@op\b|@job\b|@asset\b|Definitions|ScheduleDefinition|SensorDefinition|PartitionsDefinition|DailyPartitionsDefinition|DynamicPartitionsDefinition|AssetMaterialization|AssetObservation|RetryPolicy|dagster-daemon|Prefect|prefect|@flow\b|@task\b|Deployment|serve\s*\(|work_pool|work_queue|retry_delay_seconds|timeout_seconds|result_storage|prefect worker|pipeline orchestration|data pipeline)/i.test(text);
}

function pipelineOrchestrationReadinessSetups(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["pipelineOrchestrationSetups"] {
  const rows: PipelineOrchestrationReadinessReport["pipelineOrchestrationSetups"] = [];
  for (const source of sourceFiles) {
    const dagCount = countMatches(source.text, /\bDAG\s*\(|@dag\b|\bDagRun\b|@job\b|\bdefine_asset_job\b|\bGraphDefinition\b|@flow\b|\bFlow\b|\bpipeline graph\b|\bgraph\b/gi);
    const taskCount = countMatches(source.text, /\bBaseOperator\b|\bPythonOperator\b|\bBashOperator\b|\bOperator\b|@task\b|\btask\s*\(|@op\b|\bop\s*\(|@asset\b|\btask_id\b|\bTaskGroup\b|\bmapped task\b|\bmap\s*\(/gi);
    const dependencyCount = countMatches(source.text, />>|<<|set_upstream|set_downstream|\bdepends_on_past\b|\bTaskGroup\b|\bBranchPythonOperator\b|\bbranch\b|\bdeps\s*=|\bDynamicOut\b|\bdynamic mapping\b|\bsubflow\b|\bflow\.with_options\b/gi);
    const scheduleCount = countMatches(source.text, /\bschedule_interval\b|\bschedule\b|\bcron\b|\bTimetable\b|\bScheduleDefinition\b|\bschedules\b|\binterval\b|\bDeploymentSchedule\b|\bcatchup\b/gi);
    const sensorCount = countMatches(source.text, /\bSensor\b|\bBaseSensorOperator\b|\bExternalTaskSensor\b|\bSensorDefinition\b|\bAssetSensorDefinition\b|\bEventTrigger\b|\bevent trigger\b|\bDataset\b|\bdataset trigger\b/gi);
    const assetCount = countMatches(source.text, /@asset\b|\bAssetsDefinition\b|\bAssetMaterialization\b|\bAssetObservation\b|\bmaterialize\b|\bMaterialization\b|\bDataset\b|\bOpenLineage\b|\blineage\b|\bresult_storage\b|\bresult storage\b/gi);
    const partitionCount = countMatches(source.text, /\bPartitionsDefinition\b|\bDailyPartitionsDefinition\b|\bDynamicPartitionsDefinition\b|\bStaticPartitionsDefinition\b|\bpartition\b|\bpartitions_def\b|\bparameter\b|\bparameters\b|\bexecution_date\b|\blogical_date\b/gi);
    const retryCount = countMatches(source.text, /\bretry\b|\bretries\b|\bRetryPolicy\b|\bretry_delay\b|\bretry_delay_seconds\b|\bsla\b|\bSLA\b|\btimeout\b|\bexecution_timeout\b|\bpool\b|\bconcurrency\b|\bqueue\b|\bidempotency\b|\bidempotencyKey\b/gi);
    const backfillCount = countMatches(source.text, /\bbackfill\b|\bcatchup\b|\bBackfillPolicy\b|\basset backfill\b|\bairflow backfill\b|\bdate range\b|\bpartition backfill\b/gi);
    const executorCount = countMatches(source.text, /\bExecutor\b|\bCeleryExecutor\b|\bKubernetesExecutor\b|\bLocalExecutor\b|\bexecutor\b|\bdagster-daemon\b|\bprefect worker\b|\bworker\b|\bwork_pool\b|\bwork_queue\b|\bWorkPool\b|\bdaemon\b/gi);
    const deploymentCount = countMatches(source.text, /\bdeploy\b|\bdeployment\b|\bDeployment\b|\bDefinitions\b|\bDocker\b|\bdocker-compose\b|\bKubernetes\b|\bk8s\b|\bHelm\b|\bhelm\b|\bserver\b|\bserve\s*\(/gi);
    const observabilityCount = countMatches(source.text, /\bDagRun\b|\brun history\b|\btask logs?\b|\blogs?\b|\bAssetObservation\b|\bAssetMaterialization\b|\bmetrics?\b|\balerts?\b|\bOpenLineage\b|\blineage\b|\bmetadata\b|\btags?\b|\bstate\b/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|\bgithub[-_ ]?actions\b|dag-parse-smoke|orchestration-unit-test|backfill-smoke|upload-artifact|pipeline-orchestration-report\.json|dag-parse\.json|backfill-smoke\.json|orchestration-unit-test\.json/gi);
    const hasSetupSignal = dagCount + taskCount + dependencyCount + scheduleCount + sensorCount + assetCount + partitionCount + retryCount + backfillCount + executorCount + deploymentCount + observabilityCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      orchestrator: pipelineOrchestrationReadinessOrchestrator(source),
      dagCount,
      taskCount,
      dependencyCount,
      scheduleCount,
      sensorCount,
      assetCount,
      partitionCount,
      retryCount,
      backfillCount,
      executorCount,
      deploymentCount,
      observabilityCount,
      ciCount,
      readiness: dagCount > 0 && taskCount > 0 && (retryCount > 0 || backfillCount > 0) && (executorCount > 0 || deploymentCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains DAG/job/flow ${dagCount}, tasks ${taskCount}, dependencies ${dependencyCount}, schedules ${scheduleCount}, sensors ${sensorCount}, assets ${assetCount}, partitions ${partitionCount}, reliability ${retryCount}, backfills ${backfillCount}, executors ${executorCount}, deployments ${deploymentCount}, observability ${observabilityCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.dagCount + b.taskCount + b.scheduleCount + b.sensorCount + b.assetCount + b.retryCount + b.executorCount + b.deploymentCount) - (a.dagCount + a.taskCount + a.scheduleCount + a.sensorCount + a.assetCount + a.retryCount + a.executorCount + a.deploymentCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function pipelineOrchestrationReadinessOrchestrator(source: PipelineOrchestrationReadinessSourceFile): PipelineOrchestrationReadinessReport["pipelineOrchestrationSetups"][number]["orchestrator"] {
  if (/(^|\/)(airflow|dags?)(\/|$)/i.test(source.filePath)) return "airflow";
  if (/(^|\/)dagster(\/|$)/i.test(source.filePath)) return "dagster";
  if (/(^|\/)prefect(\/|$)/i.test(source.filePath)) return "prefect";
  if (/\bApache Airflow\b|\bfrom airflow\b|\bDAG\s*\(|@dag\b|\bBaseOperator\b|\bPythonOperator\b|\bBashOperator\b|\bXCom\b|\bDagRun\b|\bapache-airflow\b/i.test(source.text)) return "airflow";
  if (/dagster/i.test(source.filePath) || /\bDagster\b|\bdagster\b|@op\b|@job\b|@asset\b|\bDefinitions\b|\bScheduleDefinition\b|\bSensorDefinition\b|\bPartitionsDefinition\b/i.test(source.text)) return "dagster";
  if (/prefect/i.test(source.filePath) || /\bPrefect\b|\bprefect\b|@flow\b|@task\b|\bDeployment\b|\bserve\s*\(|\bwork_pool\b|\bprefect worker\b/i.test(source.text)) return "prefect";
  if (/pipeline[-_ ]?orchestration|data[-_ ]?pipeline|orchestration/i.test(source.filePath) || /pipeline orchestration|data pipeline|orchestrator/i.test(source.text)) return "custom";
  return "unknown";
}

function pipelineOrchestrationReadinessOrchestratorSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["orchestratorSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["orchestratorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "apache-airflow", pattern: /\bApache Airflow\b|\bfrom airflow\b|\bDAG\s*\(|@dag\b|\bBaseOperator\b|\bapache-airflow\b/i, evidence: "Apache Airflow evidence was detected." },
    { signal: "dagster", pattern: /\bDagster\b|\bdagster\b|@op\b|@job\b|@asset\b|\bDefinitions\b/i, evidence: "Dagster evidence was detected." },
    { signal: "prefect", pattern: /\bPrefect\b|\bprefect\b|@flow\b|@task\b|\bDeployment\b|\bprefect worker\b/i, evidence: "Prefect evidence was detected." },
    { signal: "custom", pattern: /\bpipeline[-_ ]?orchestration\b|\bdata pipeline\b|\borchestrator\b/i, evidence: "custom pipeline orchestration evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "orchestrator", "signal");
}

function pipelineOrchestrationReadinessAuthoringSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["authoringSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["authoringSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "airflow-sdk", pattern: /from airflow\.sdk import|airflow\.sdk|Stable Authoring Interface|stable public API for DAG authoring/i, evidence: "Airflow stable SDK authoring evidence was detected." },
    { signal: "dag-decorator", pattern: /@dag\b|from airflow\.sdk import .*dag|from airflow\.decorators import .*dag/i, evidence: "DAG decorator authoring evidence was detected." },
    { signal: "task-decorator", pattern: /@task\b|from airflow\.sdk import .*task|from airflow\.decorators import .*task/i, evidence: "task decorator authoring evidence was detected." },
    { signal: "asset-authoring", pattern: /from airflow\.sdk import .*Asset|\bAsset\b|asset-aware|schedule\s*=\s*Asset|schedule\s*=\s*asset/i, evidence: "asset-aware authoring evidence was detected." },
    { signal: "task-group", pattern: /\btask_group\b|\bTaskGroup\b|from airflow\.sdk import .*task_group/i, evidence: "task group authoring evidence was detected." },
    { signal: "setup-teardown", pattern: /@setup\b|@teardown\b|from airflow\.sdk import .*setup|from airflow\.sdk import .*teardown|\bsetup,\s*task,\s*teardown\b/i, evidence: "setup/teardown authoring evidence was detected." },
    { signal: "params", pattern: /\bParam\b|\bparams\s*=|DAG params|flow_run\.parameters/i, evidence: "parameter authoring evidence was detected." },
    { signal: "context", pattern: /\bContext\b|get_current_context|context_to_airflow_vars|RuntimeTaskInstanceProtocol/i, evidence: "context authoring evidence was detected." },
    { signal: "trigger-rule", pattern: /\bTriggerRule\b|trigger_rule/i, evidence: "trigger rule authoring evidence was detected." },
    { signal: "legacy-import", pattern: /from airflow import DAG|from airflow\.decorators import|from airflow\.models\.dag import|from airflow\.operators\./i, evidence: "legacy Airflow import evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "authoring", "signal");
}

function pipelineOrchestrationReadinessDagSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["dagSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["dagSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "airflow-dag", pattern: /\bDAG\s*\(|@dag\b|\bDagRun\b|\bdag_id\b/i, evidence: "Airflow DAG evidence was detected." },
    { signal: "dagster-job", pattern: /@job\b|\bdefine_asset_job\b|\bJobDefinition\b/i, evidence: "Dagster job evidence was detected." },
    { signal: "prefect-flow", pattern: /@flow\b|\bFlow\b|\bflow\.with_options\b/i, evidence: "Prefect flow evidence was detected." },
    { signal: "taskflow", pattern: /airflow\.decorators|from airflow\.decorators|@task\b|taskflow/i, evidence: "TaskFlow/task decorator evidence was detected." },
    { signal: "graph", pattern: /@graph\b|\bGraphDefinition\b|\bgraph\b|\bpipeline graph\b/i, evidence: "pipeline graph evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "dag", "signal");
}

function pipelineOrchestrationReadinessTaskSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["taskSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["taskSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "airflow-operator", pattern: /\bBaseOperator\b|\bPythonOperator\b|\bBashOperator\b|\bOperator\b|\btask_id\b/i, evidence: "Airflow operator evidence was detected." },
    { signal: "airflow-task", pattern: /from airflow\.decorators|@task\b|\bTaskGroup\b|\btaskflow\b/i, evidence: "Airflow task evidence was detected." },
    { signal: "dagster-op", pattern: /@op\b|\bop\s*\(|\bOpDefinition\b/i, evidence: "Dagster op evidence was detected." },
    { signal: "dagster-asset", pattern: /@asset\b|\bAssetsDefinition\b|\basset\s*\(/i, evidence: "Dagster asset evidence was detected." },
    { signal: "prefect-task", pattern: /@task\b|\bTask\b|\btask\.with_options\b/i, evidence: "Prefect task evidence was detected." },
    { signal: "mapped-task", pattern: /\bexpand\s*\(|\bmap\s*\(|\bdynamic mapping\b|\bDynamicOut\b|\bmapped task\b/i, evidence: "mapped/dynamic task evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "task", "signal");
}

function pipelineOrchestrationReadinessDependencySignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["dependencySignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["dependencySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "task-dependency", pattern: />>|<<|set_upstream|set_downstream|\bdepends_on_past\b|\bdeps\s*=/i, evidence: "task dependency evidence was detected." },
    { signal: "task-group", pattern: /\bTaskGroup\b|\btask_group\b|\bgroup_id\b/i, evidence: "task group evidence was detected." },
    { signal: "branching", pattern: /\bBranchPythonOperator\b|\bbranch\b|\bConditional\b|\bif\s+.*task/i, evidence: "branching evidence was detected." },
    { signal: "dynamic-mapping", pattern: /\bDynamicOut\b|\bdynamic mapping\b|\.map\s*\(|\.expand\s*\(/i, evidence: "dynamic mapping evidence was detected." },
    { signal: "subflow", pattern: /\bsubflow\b|\bchild flow\b|\bflow\.with_options\b/i, evidence: "subflow evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "dependency", "signal");
}

function pipelineOrchestrationReadinessScheduleSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["scheduleSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["scheduleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cron-schedule", pattern: /\bcron\b|\bcrontab\b|schedule_interval\s*=\s*["'][^"']*\*/i, evidence: "cron schedule evidence was detected." },
    { signal: "interval-schedule", pattern: /\btimedelta\b|\bIntervalSchedule\b|\bevery\s+\d+|\binterval\b/i, evidence: "interval schedule evidence was detected." },
    { signal: "timetable", pattern: /\bTimetable\b|\btimetable\b/i, evidence: "Airflow timetable evidence was detected." },
    { signal: "schedule-definition", pattern: /\bScheduleDefinition\b|\bschedule\s*=|\bschedules\b|\bDeploymentSchedule\b/i, evidence: "schedule definition evidence was detected." },
    { signal: "catchup", pattern: /\bcatchup\b|\bcatchup=False\b|\bcatchup=True\b/i, evidence: "catchup evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "schedule", "signal");
}

function pipelineOrchestrationReadinessSensorSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["sensorSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["sensorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "airflow-sensor", pattern: /\bSensor\b|\bBaseSensorOperator\b|\bFileSensor\b|\bHttpSensor\b|\bExternalTaskSensor\b/i, evidence: "Airflow sensor evidence was detected." },
    { signal: "dagster-sensor", pattern: /\bSensorDefinition\b|\bAssetSensorDefinition\b|\bRunStatusSensorDefinition\b|\bsensor\b/i, evidence: "Dagster sensor evidence was detected." },
    { signal: "prefect-event", pattern: /\bEventTrigger\b|\bevents?\b|\bautomations?\b|\bprefect\.events\b/i, evidence: "Prefect event evidence was detected." },
    { signal: "external-task", pattern: /\bExternalTaskSensor\b|\bexternal task\b|\bExternalTaskMarker\b/i, evidence: "external task trigger evidence was detected." },
    { signal: "dataset-trigger", pattern: /\bDataset\b|\bdataset trigger\b|\basset sensor\b|\bdataset event\b/i, evidence: "dataset trigger evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "sensor", "signal");
}

function pipelineOrchestrationReadinessAssetSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["assetSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["assetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dagster-asset", pattern: /@asset\b|\bAssetsDefinition\b|\bAssetKey\b/i, evidence: "Dagster asset evidence was detected." },
    { signal: "airflow-dataset", pattern: /\bDataset\b|\bDatasetEvent\b|\bAssets\b/i, evidence: "Airflow dataset evidence was detected." },
    { signal: "prefect-result", pattern: /\bresult_storage\b|\bResultStorage\b|\bpersist_result\b|\bresult storage\b/i, evidence: "Prefect result storage evidence was detected." },
    { signal: "materialization", pattern: /\bAssetMaterialization\b|\bmaterialize\b|\bMaterialization\b|\bmaterialized\b/i, evidence: "materialization evidence was detected." },
    { signal: "lineage", pattern: /\bOpenLineage\b|\blineage\b|\bDatasetFacet\b|\bcolumn lineage\b/i, evidence: "lineage evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "asset", "signal");
}

function pipelineOrchestrationReadinessPartitionSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["partitionSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["partitionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dagster-partition", pattern: /\bPartitionsDefinition\b|\bDailyPartitionsDefinition\b|\bStaticPartitionsDefinition\b|\bpartitions_def\b/i, evidence: "Dagster partition evidence was detected." },
    { signal: "dynamic-partition", pattern: /\bDynamicPartitionsDefinition\b|\bdynamic partition\b|\badd_dynamic_partitions\b/i, evidence: "dynamic partition evidence was detected." },
    { signal: "airflow-backfill-date", pattern: /\bbackfill\b|\bexecution_date\b|\blogical_date\b|\bdata_interval\b|\bstart_date\b|\bend_date\b/i, evidence: "Airflow date/backfill evidence was detected." },
    { signal: "prefect-parameter", pattern: /\bparameters\b|\bparameter\b|\bParam\b|\bflow_run.parameters\b/i, evidence: "Prefect parameter evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "partition", "signal");
}

function pipelineOrchestrationReadinessReliabilitySignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["reliabilitySignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["reliabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "retry-policy", pattern: /\bretry\b|\bretries\b|\bRetryPolicy\b|\bretry_delay\b|\bretry_delay_seconds\b/i, evidence: "retry policy evidence was detected." },
    { signal: "sla", pattern: /\bsla\b|\bSLA\b|\bdeadline\b/i, evidence: "SLA/deadline evidence was detected." },
    { signal: "timeout", pattern: /\btimeout\b|\bexecution_timeout\b|\btimeout_seconds\b|\bdagrun_timeout\b/i, evidence: "timeout evidence was detected." },
    { signal: "pool-concurrency", pattern: /\bpool\b|\bconcurrency\b|\bmax_active_runs\b|\bmax_active_tasks\b|\bmax_concurrent\b/i, evidence: "pool/concurrency evidence was detected." },
    { signal: "queue", pattern: /\bqueue\b|\bwork_queue\b|\btask queue\b|\bTaskQueue\b/i, evidence: "queue evidence was detected." },
    { signal: "idempotency", pattern: /\bidempotency\b|\bidempotencyKey\b|\bidempotent\b|\bdedupe\b|\bdepends_on_past\b/i, evidence: "idempotency evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "reliability", "signal");
}

function pipelineOrchestrationReadinessExecutorSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["executorSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["executorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "airflow-executor", pattern: /\bExecutor\b|\bLocalExecutor\b|\bSequentialExecutor\b|\bCeleryExecutor\b|\bKubernetesExecutor\b|\bexecutor\b/i, evidence: "Airflow executor evidence was detected." },
    { signal: "celery", pattern: /\bCeleryExecutor\b|\bCelery\b|\bcelery\b/i, evidence: "Celery executor evidence was detected." },
    { signal: "kubernetes-executor", pattern: /\bKubernetesExecutor\b|\bKubernetesPodOperator\b|\bkubernetes executor\b/i, evidence: "Kubernetes executor evidence was detected." },
    { signal: "dagster-daemon", pattern: /\bdagster-daemon\b|\bDaemon\b|\bdaemon\b/i, evidence: "Dagster daemon evidence was detected." },
    { signal: "prefect-worker", pattern: /\bprefect worker\b|\bWorker\b|\bworker start\b/i, evidence: "Prefect worker evidence was detected." },
    { signal: "work-pool", pattern: /\bwork_pool\b|\bwork-pool\b|\bwork pool\b|\bWorkPool\b|\bwork_queue\b/i, evidence: "work pool evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "executor", "signal");
}

function pipelineOrchestrationReadinessDeploymentSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["deploymentSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["deploymentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "airflow-deployment", pattern: /\bairflow scheduler\b|\bairflow webserver\b|\bairflow dags\b|\bairflow.cfg\b|\bdags_folder\b/i, evidence: "Airflow deployment evidence was detected." },
    { signal: "dagster-definitions", pattern: /\bDefinitions\b|\bdefine_asset_job\b|\bload_assets_from_modules\b|\bdagster dev\b/i, evidence: "Dagster definitions/deployment evidence was detected." },
    { signal: "prefect-deployment", pattern: /\bDeployment\b|\bdeploy\b|\bserve\s*\(|\bprefect deploy\b|\bprefect.yaml\b/i, evidence: "Prefect deployment evidence was detected." },
    { signal: "docker", pattern: /\bDocker\b|\bDockerfile\b|\bdocker-compose\b|\bcompose\.ya?ml\b|\bcontainer\b/i, evidence: "Docker deployment evidence was detected." },
    { signal: "kubernetes", pattern: /\bKubernetes\b|\bk8s\b|\bKubernetesExecutor\b|\bKubernetesPodOperator\b|\bV1Deployment\b/i, evidence: "Kubernetes deployment evidence was detected." },
    { signal: "helm", pattern: /\bHelm\b|\bhelm\b|\bChart\.yaml\b|\bvalues\.ya?ml\b/i, evidence: "Helm deployment evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "deployment", "signal");
}

function pipelineOrchestrationReadinessObservabilitySignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dag-run-history", pattern: /\bDagRun\b|\brun history\b|\bRunStatus\b|\bflow run\b|\btask run\b/i, evidence: "run history evidence was detected." },
    { signal: "task-logs", pattern: /\btask logs?\b|\blogs?\b|\blogger\b|\bLogManager\b/i, evidence: "task log evidence was detected." },
    { signal: "asset-observability", pattern: /\bAssetObservation\b|\bAssetMaterialization\b|\basset checks?\b|\basset event\b/i, evidence: "asset observability evidence was detected." },
    { signal: "metrics", pattern: /\bmetrics?\b|\bPrometheus\b|\bStatsD\b|\bOpenTelemetry\b|\botel\b/i, evidence: "metrics evidence was detected." },
    { signal: "alerts", pattern: /\balerts?\b|\bnotification\b|\bon_failure_callback\b|\bfailure alert\b|\bPagerDuty\b/i, evidence: "alert evidence was detected." },
    { signal: "openlineage", pattern: /\bOpenLineage\b|\bDatasetFacet\b|\blineage\b|\bcolumn lineage\b/i, evidence: "OpenLineage/lineage evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function pipelineOrchestrationReadinessCiSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["ciSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "dag-parse-smoke", pattern: /dag-parse-smoke|airflow dags list|dagster definitions validate|prefect.*validate/i, evidence: "DAG parse smoke evidence was detected." },
    { signal: "orchestration-unit-test", pattern: /orchestration-unit-test|pipeline orchestration test|dagster.*pytest|prefect.*pytest|airflow.*pytest/i, evidence: "orchestration unit test evidence was detected." },
    { signal: "backfill-smoke", pattern: /backfill-smoke|airflow dags backfill|dagster.*backfill|prefect.*backfill/i, evidence: "backfill smoke evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|pipeline-orchestration-report\.json|dag-parse\.json|backfill-smoke\.json|orchestration-unit-test\.json/i, evidence: "pipeline orchestration artifact upload evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function pipelineOrchestrationReadinessPackageSignals(sourceFiles: PipelineOrchestrationReadinessSourceFile[]): PipelineOrchestrationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PipelineOrchestrationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "apache-airflow", pattern: /"apache-airflow"|apache-airflow|from airflow|Airflow/i, evidence: "Apache Airflow package/import evidence was detected." },
    { signal: "dagster", pattern: /"dagster"|dagster==|dagster\b|from dagster/i, evidence: "Dagster package/import evidence was detected." },
    { signal: "prefect", pattern: /"prefect"|prefect==|prefect\b|from prefect/i, evidence: "Prefect package/import evidence was detected." },
    { signal: "airflow-provider", pattern: /apache-airflow-providers|airflow\.providers|airflow-provider/i, evidence: "Airflow provider package evidence was detected." },
    { signal: "custom", pattern: /pipeline[-_ ]?orchestration|data[-_ ]?pipeline|orchestrator/i, evidence: "custom pipeline orchestration package evidence was detected." }
  ];
  return pipelineOrchestrationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function pipelineOrchestrationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PipelineOrchestrationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/pipeline-orchestration-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
