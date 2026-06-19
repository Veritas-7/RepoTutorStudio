import type { DataCatalogReadinessReport, DataLineageReadinessReport, DataQualityReadinessReport, DataTransformationReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDataTransformationReadinessReport(walk: WalkResult): Promise<DataTransformationReadinessReport> {
  const sourceFiles = await dataTransformationSourceFiles(walk);
  const transformationSetups = dataTransformationSetupsFromSources(sourceFiles);
  const toolSignals = dataTransformationToolSignals(sourceFiles);
  const modelSignals = dataTransformationModelSignals(sourceFiles);
  const dependencySignals = dataTransformationDependencySignals(sourceFiles);
  const incrementalitySignals = dataTransformationIncrementalitySignals(sourceFiles);
  const environmentSignals = dataTransformationEnvironmentSignals(sourceFiles);
  const artifactSignals = dataTransformationArtifactSignals(sourceFiles);
  const workflowSignals = dataTransformationWorkflowSignals(sourceFiles);
  const packageSignals = dataTransformationPackageSignals(sourceFiles);

  const hasTool = toolSignals.some((item) => item.readiness === "ready") || transformationSetups.some((item) => item.tool !== "unknown");
  const hasModels = modelSignals.some((item) => item.readiness === "ready") || transformationSetups.some((item) => item.modelCount > 0);
  const hasDependencies = dependencySignals.some((item) => ["ref", "source", "dependency", "declaration"].includes(item.signal) && item.readiness === "ready") || transformationSetups.some((item) => item.sourceCount > 0);
  const hasIncrementality = incrementalitySignals.some((item) => item.readiness === "ready") || transformationSetups.some((item) => item.incrementalCount > 0);
  const hasEnvironment = environmentSignals.some((item) => item.readiness === "ready") || transformationSetups.some((item) => item.environmentCount > 0);
  const hasArtifacts = artifactSignals.some((item) => item.readiness === "ready") || transformationSetups.some((item) => item.artifactCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || transformationSetups.some((item) => item.workflowCount > 0);

  const riskQueue: DataTransformationReadinessReport["riskQueue"] = [];
  if (!hasTool && !hasModels) {
    riskQueue.push({
      priority: "high",
      action: "Add or document dbt, SQLMesh, Dataform, or custom transformation project evidence before claiming transformation readiness.",
      why: "Learners need a concrete project file, model directory, or transformation DSL entry point to understand the transformation layer.",
      relatedHref: "html/data-transformation-readiness.html"
    });
  }
  if (hasModels && !hasDependencies) {
    riskQueue.push({
      priority: "medium",
      action: "Document transformation dependencies with ref, source, declare, dependencies, or equivalent upstream references.",
      why: "Transformation models are hard to review when upstream tables and model ordering are implicit.",
      relatedHref: "html/data-transformation-readiness.html"
    });
  }
  if (hasModels && !hasIncrementality) {
    riskQueue.push({
      priority: "medium",
      action: "Document materialization and incrementality policy for large or stateful transformations.",
      why: "dbt materialized incremental, SQLMesh incremental model kinds, and Dataform uniqueKey/pre-post operations make rebuild cost and state behavior visible.",
      relatedHref: "html/data-transformation-readiness.html"
    });
  }
  if (hasModels && !hasEnvironment) {
    riskQueue.push({
      priority: "medium",
      action: "Record target profiles, SQLMesh environments, Dataform workflow settings, or warehouse engine assumptions.",
      why: "Transformation readiness depends on where models compile and run, not just on SQL files existing.",
      relatedHref: "html/data-transformation-readiness.html"
    });
  }
  if (hasModels && !hasArtifacts) {
    riskQueue.push({
      priority: "low",
      action: "Persist manifests, run results, compiled graph, catalog, snapshots, or compiled SQL artifacts.",
      why: "Compiled artifacts make dependency graphs, execution status, and generated SQL reviewable without querying production data.",
      relatedHref: "html/data-transformation-readiness.html"
    });
  }
  if ((hasTool || hasModels) && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add CI or scheduled workflow evidence for compile, plan, test, and artifact upload.",
      why: "Transformation projects are safer when compile/plan checks and outputs are repeatable outside a local laptop.",
      relatedHref: "html/data-transformation-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run transformation commands only in reviewed CI or an isolated warehouse sandbox.",
    why: "RepoTutor records data transformation readiness only; it does not run dbt, SQLMesh, Dataform, compile SQL, query warehouses, apply plans, invoke workflows, or mutate datasets.",
    relatedHref: "html/data-transformation-readiness.html"
  });

  return {
    summary: `Data transformation readiness report: transformation setup ${transformationSetups.length}개, tool signal ${toolSignals.filter((item) => item.readiness === "ready").length}개, model signal ${modelSignals.filter((item) => item.readiness === "ready").length}개, workflow signal ${workflowSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Data transformation readiness dbt SQLMesh Dataform dbt_project.yml models seeds snapshots macros ref source materialized incremental state defer sqlmesh MODEL AUDIT plan environment snapshot dataform workflow_settings definitions publish declare assert compile run",
    transformationSetups,
    toolSignals,
    modelSignals,
    dependencySignals,
    incrementalitySignals,
    environmentSignals,
    artifactSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"dbt_project.yml|models:|seeds:|snapshots:|macros:|ref\\(|source\\(\" .", purpose: "Find dbt project, model, seed, snapshot, macro, ref, and source evidence." },
      { command: "rg \"sqlmesh|MODEL \\(|model_kind|AUDIT \\(|sqlmesh plan|sqlmesh run|environment|snapshot\" .", purpose: "Find SQLMesh model, audit, plan, environment, and snapshot evidence." },
      { command: "rg \"workflow_settings.yaml|dataform.json|definitions/|publish\\(|declare\\(|assert\\(|ref\\(|resolve\\(\" .", purpose: "Find Dataform workflow settings, definitions, declarations, assertions, and dependency references." },
      { command: "rg \"materialized:|type: incremental|uniqueKey|incremental_by_time_range|SCD_TYPE_2|pre_operations|post_operations\" .", purpose: "Review incrementality, unique key, SCD, and operation boundary evidence." },
      { command: "rg \"dbt build|dbt compile|dbt ls|sqlmesh plan|sqlmesh test|dataform compile|dataform run|upload-artifact\" .github .", purpose: "Find compile, plan, test, run, and artifact workflow coverage." }
    ],
    learnerNextSteps: [
      "먼저 dbt_project.yml, SQLMesh config/model, Dataform workflow_settings.yaml/dataform.json 중 어떤 transformation project entry point가 있는지 찾으세요.",
      "models, definitions, MODEL blocks, SQL/Python models, seeds, snapshots, macros를 분리해서 읽으세요.",
      "ref, source, declare, dependencies, owner, tag, grain, cron처럼 dependency와 운영 메타데이터를 확인하세요.",
      "incremental materialization, unique key, SQLMesh incremental model kinds, SCD_TYPE_2, pre/post operations가 stateful rebuild 방식을 설명하는지 확인하세요.",
      "manifest, run_results, compiled graph, catalog, compiled SQL, CI artifact가 남는지 확인하되 이 리포트 자체는 명령을 실행하지 않는 정적 분석이라는 점을 유지하세요."
    ]
  };
}

type DataTransformationSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataTransformationSourceFiles(walk: WalkResult): Promise<DataTransformationSourceFile[]> {
  const rows: DataTransformationSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!dataTransformationInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!dataTransformationPathSignal(file.relPath) && !dataTransformationContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 260);
}

function dataTransformationInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|dbt_project\.ya?ml|profiles\.ya?ml|selectors\.ya?ml|schema\.ya?ml|sources?\.ya?ml|manifest\.json|run_results\.json|catalog\.json|workflow_settings\.ya?ml|dataform\.json|config\.ya?ml|sqlmesh\.ya?ml)$/i.test(base)
    || /(^|\/)(dbt|models|seeds|snapshots|macros|target|sqlmesh|audits|definitions|dataform|transform|transforms|warehouse|analytics)(\/|\.|-|_|$)/i.test(filePath)
    || /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(filePath)
    || /\.(sqlx?|py|json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md)$/i.test(filePath);
}

function dataTransformationPathSignal(filePath: string): boolean {
  return /(^|\/)(dbt|models|seeds|snapshots|macros|target|sqlmesh|audits|definitions|dataform|transform|transforms)(\/|\.|-|_|$)/i.test(filePath)
    || /^(dbt_project\.ya?ml|profiles\.ya?ml|selectors\.ya?ml|manifest\.json|run_results\.json|catalog\.json|workflow_settings\.ya?ml|dataform\.json|sqlmesh\.ya?ml)$/i.test(path.basename(filePath));
}

function dataTransformationContentSignal(text: string): boolean {
  return /dbt_project|dbt-core|dbt build|dbt compile|dbt ls|ref\(|source\(|materialized|unique_key|state:modified|--defer|sqlmesh|MODEL\s*\(|AUDIT\s*\(|INCREMENTAL_BY_TIME_RANGE|SCD_TYPE_2|workflow_settings|dataform|publish\(|declare\(|assert\(|resolve\(|compiled_graph|run_results|manifest\.json/i.test(text);
}

function dataTransformationSetupsFromSources(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["transformationSetups"] {
  const rows: DataTransformationReadinessReport["transformationSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const projectCount = countMatches(haystack, /dbt_project\.ya?ml|workflow_settings\.ya?ml|dataform\.json|sqlmesh\.ya?ml|gateways:|defaultProject|project_name|name:\s*/gi);
    const modelCount = countMatches(haystack, /(^|\/)(models|definitions)\/|models:\s*$|MODEL\s*\(|@model|publish\(|config\s*\{|SELECT\s+.+\s+FROM|CREATE\s+(OR\s+REPLACE\s+)?(TABLE|VIEW)/gim);
    const sourceCount = countMatches(haystack, /source\(|sources:\s*$|declare\(|raw\.|dependencies|depends_on|input|upstream/gim);
    const macroCount = countMatches(haystack, /macros?:|\{%\s*macro|macro\s+\w+|generate_schema_name/gi);
    const testCount = countMatches(haystack, /tests:\s*$|data_tests|AUDIT\s*\(|assert\(|assertion|sqlmesh test|dbt test/gim);
    const incrementalCount = countMatches(haystack, /materialized\s*[:=]\s*['"]?incremental|\+materialized:\s*incremental|type:\s*['"]?incremental|unique_key|uniqueKey|INCREMENTAL_BY_TIME_RANGE|SCD_TYPE_2|pre_operations|post_operations|is_incremental\(/gi);
    const environmentCount = countMatches(haystack, /profiles\.ya?ml|profile:|target:|environment|gateways:|default_gateway|virtual_environment|workflow_settings\.ya?ml|defaultProject|defaultDataset|warehouse|bigquery|snowflake|redshift|duckdb|databricks|trino|spark/gi);
    const artifactCount = countMatches(haystack, /manifest\.json|run_results\.json|compiled_graph|catalog\.json|target\/compiled|compiled_code|compiled_sql|snapshot|upload-artifact|artifact/gi);
    const workflowCount = countMatches(haystack, /\.github\/workflows|github actions|runs-on|dbt build|dbt compile|dbt ls|sqlmesh plan|sqlmesh test|dataform compile|dataform run|upload-artifact/gi);
    const totalSignals = projectCount + modelCount + sourceCount + macroCount + testCount + incrementalCount + environmentCount + artifactCount + workflowCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: dataTransformationTool(source),
      projectCount,
      modelCount,
      sourceCount,
      macroCount,
      testCount,
      incrementalCount,
      environmentCount,
      artifactCount,
      workflowCount,
      readiness: modelCount > 0 && sourceCount > 0 && incrementalCount > 0 && (environmentCount + artifactCount + workflowCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} data transformation readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.projectCount + b.modelCount + b.sourceCount + b.macroCount + b.testCount + b.incrementalCount + b.environmentCount + b.artifactCount + b.workflowCount) - (a.projectCount + a.modelCount + a.sourceCount + a.macroCount + a.testCount + a.incrementalCount + a.environmentCount + a.artifactCount + a.workflowCount))
    .slice(0, 80);
}

function dataTransformationTool(source: DataTransformationSourceFile): DataTransformationReadinessReport["transformationSetups"][number]["tool"] {
  if (/sqlmesh/i.test(source.filePath) || /sqlmesh|MODEL\s*\(|AUDIT\s*\(|INCREMENTAL_BY_TIME_RANGE|SCD_TYPE_2/i.test(source.text)) return "sqlmesh";
  if (/workflow_settings\.ya?ml|dataform\.json|(^|\/)definitions\//i.test(source.filePath) || /dataform|publish\(|declare\(|assert\(|workflow_settings/i.test(source.text)) return "dataform";
  if (/dbt_project\.ya?ml|(^|\/)(dbt|models|seeds|snapshots|macros)(\/|$)/i.test(source.filePath) || /dbt-core|dbt build|dbt compile|ref\(|source\(|dbt_project/i.test(source.text)) return "dbt";
  if (/transform|warehouse|analytics/i.test(source.filePath) || /transform|materialized view|CREATE\s+(TABLE|VIEW)|SELECT\s+.+\s+FROM/i.test(source.text)) return "custom";
  return "unknown";
}

function dataTransformationToolSignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["toolSignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["toolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dbt", pattern: /dbt_project\.ya?ml|dbt-core|dbt build|dbt compile|ref\(|source\(/i, evidence: "dbt project or command evidence was detected." },
    { signal: "sqlmesh", pattern: /sqlmesh|MODEL\s*\(|AUDIT\s*\(|sqlmesh plan|sqlmesh run/i, evidence: "SQLMesh model or command evidence was detected." },
    { signal: "dataform", pattern: /workflow_settings\.ya?ml|dataform\.json|dataform|publish\(|declare\(|assert\(/i, evidence: "Dataform project or definition evidence was detected." },
    { signal: "custom", pattern: /transform|materialized view|CREATE\s+(TABLE|VIEW)|SELECT\s+.+\s+FROM/i, evidence: "custom SQL transformation evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "tool", "signal");
}

function dataTransformationModelSignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["modelSignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["modelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dbt-model", pattern: /(^|\/)models\/|models:\s*$|dbt_project\.ya?ml|ref\(|source\(/im, evidence: "dbt model evidence was detected." },
    { signal: "sqlmesh-model", pattern: /MODEL\s*\(|model_kind|@model|sqlmesh/i, evidence: "SQLMesh model evidence was detected." },
    { signal: "dataform-table", pattern: /publish\(|config\s*\{[^}]*type:\s*["']?(table|incremental)|\.sqlx/i, evidence: "Dataform table or incremental definition evidence was detected." },
    { signal: "sql-model", pattern: /\.sqlx?$|SELECT\s+.+\s+FROM|CREATE\s+(OR\s+REPLACE\s+)?(TABLE|VIEW)/i, evidence: "SQL model evidence was detected." },
    { signal: "python-model", pattern: /\.py$|@model|PythonModel|def\s+model/i, evidence: "Python model evidence was detected." },
    { signal: "seed", pattern: /seed-paths|(^|\/)seeds\//i, evidence: "seed evidence was detected." },
    { signal: "snapshot", pattern: /snapshot-paths|(^|\/)snapshots\/|snapshot\(/i, evidence: "snapshot evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "model", "signal");
}

function dataTransformationDependencySignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["dependencySignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["dependencySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ref", pattern: /ref\(/i, evidence: "model ref dependency evidence was detected." },
    { signal: "source", pattern: /source\(|sources:\s*$/im, evidence: "source dependency evidence was detected." },
    { signal: "dependency", pattern: /depends_on|dependencies|dependency|input|upstream/i, evidence: "dependency declaration evidence was detected." },
    { signal: "declaration", pattern: /declare\(|declarations?:|sources:\s*$/im, evidence: "declaration evidence was detected." },
    { signal: "owner", pattern: /\bowner\b\s*[:=]?|owners?:|meta:\s*.*owner/i, evidence: "owner metadata evidence was detected." },
    { signal: "tag", pattern: /tags?\s*[:=]|\btags\s*\[/i, evidence: "tag metadata evidence was detected." },
    { signal: "grain", pattern: /\bgrain\b\s*[:=]?/i, evidence: "grain metadata evidence was detected." },
    { signal: "cron", pattern: /cron\s*[:=]|@daily|@hourly|schedule:/i, evidence: "cron/schedule metadata evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "dependency", "signal");
}

function dataTransformationIncrementalitySignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["incrementalitySignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["incrementalitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "materialized-incremental", pattern: /materialized\s*[:=]\s*['"]?incremental|\+materialized:\s*incremental|type:\s*['"]?incremental|is_incremental\(/i, evidence: "incremental materialization evidence was detected." },
    { signal: "unique-key", pattern: /unique_key|uniqueKey/i, evidence: "unique key evidence was detected." },
    { signal: "incremental-by-time-range", pattern: /INCREMENTAL_BY_TIME_RANGE|incremental_by_time_range/i, evidence: "SQLMesh time-range incrementality evidence was detected." },
    { signal: "scd-type-2", pattern: /SCD_TYPE_2|scd_type_2/i, evidence: "SCD Type 2 model evidence was detected." },
    { signal: "pre-post-ops", pattern: /pre_operations|post_operations|preOperations|postOperations/i, evidence: "pre/post operation evidence was detected." },
    { signal: "state-modified", pattern: /state:modified|--state/i, evidence: "state selection evidence was detected." },
    { signal: "defer", pattern: /--defer|\bdefer\b/i, evidence: "defer evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "incrementality", "signal");
}

function dataTransformationEnvironmentSignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["environmentSignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["environmentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "target-profile", pattern: /profiles\.ya?ml|profile:|target:/i, evidence: "target/profile evidence was detected." },
    { signal: "sqlmesh-environment", pattern: /sqlmesh|environment|gateways:|default_gateway/i, evidence: "SQLMesh environment evidence was detected." },
    { signal: "virtual-environment", pattern: /virtual_environment|virtual environment|dev|prod/i, evidence: "virtual environment evidence was detected." },
    { signal: "dataform-workflow-settings", pattern: /workflow_settings\.ya?ml|defaultProject|defaultDataset|defaultAssertionDataset/i, evidence: "Dataform workflow settings evidence was detected." },
    { signal: "warehouse-engine", pattern: /bigquery|snowflake|redshift|postgres|duckdb|databricks|trino|spark|warehouse/i, evidence: "warehouse engine evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "environment", "signal");
}

function dataTransformationArtifactSignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["artifactSignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["artifactSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "manifest", pattern: /manifest\.json|ManifestArtifact/i, evidence: "manifest artifact evidence was detected." },
    { signal: "run-results", pattern: /run_results\.json|run-results|RunResults/i, evidence: "run results artifact evidence was detected." },
    { signal: "compiled-graph", pattern: /compiled_graph|compiled graph|CompiledGraph/i, evidence: "compiled graph evidence was detected." },
    { signal: "catalog", pattern: /catalog\.json|CatalogArtifact/i, evidence: "catalog artifact evidence was detected." },
    { signal: "snapshot", pattern: /snapshot|Snapshot/i, evidence: "snapshot artifact evidence was detected." },
    { signal: "state-sync", pattern: /state:modified|--state|state sync|state_connection/i, evidence: "state sync evidence was detected." },
    { signal: "compiled-sql", pattern: /compiled_code|compiled_sql|target\/compiled|compiled SQL|dbt compile|dataform compile/i, evidence: "compiled SQL evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "artifact", "signal");
}

function dataTransformationWorkflowSignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses:\s*actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "dbt-build", pattern: /dbt build/i, evidence: "dbt build workflow evidence was detected." },
    { signal: "dbt-compile", pattern: /dbt compile/i, evidence: "dbt compile workflow evidence was detected." },
    { signal: "dbt-ls", pattern: /dbt ls/i, evidence: "dbt ls workflow evidence was detected." },
    { signal: "sqlmesh-plan", pattern: /sqlmesh plan/i, evidence: "SQLMesh plan workflow evidence was detected." },
    { signal: "sqlmesh-test", pattern: /sqlmesh test/i, evidence: "SQLMesh test workflow evidence was detected." },
    { signal: "dataform-compile", pattern: /dataform compile/i, evidence: "Dataform compile workflow evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact/i, evidence: "artifact upload evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function dataTransformationPackageSignals(sourceFiles: DataTransformationSourceFile[]): DataTransformationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataTransformationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dbt-core", pattern: /dbt-core|dbt_project\.ya?ml|dbt build|dbt compile/i, evidence: "dbt Core package/project evidence was detected." },
    { signal: "sqlmesh", pattern: /sqlmesh|SQLMesh/i, evidence: "SQLMesh package evidence was detected." },
    { signal: "dataform-core", pattern: /@dataform\/core|dataformCoreVersion/i, evidence: "Dataform Core package evidence was detected." },
    { signal: "dataform-cli", pattern: /@dataform\/cli|dataform\s+(compile|run)/i, evidence: "Dataform CLI package evidence was detected." },
    { signal: "sqlglot", pattern: /sqlglot|SQLGlot/i, evidence: "SQLGlot package evidence was detected." },
    { signal: "dbt-adapter", pattern: /dbt-(snowflake|bigquery|postgres|redshift|databricks|spark|duckdb|trino)/i, evidence: "dbt adapter package evidence was detected." }
  ];
  return dataTransformationSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataTransformationSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataTransformationSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(`${source.filePath}\n${source.text}`));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/data-transformation-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildDataQualityReadinessReport(walk: WalkResult): Promise<DataQualityReadinessReport> {
  const sourceFiles = await dataQualitySourceFiles(walk);
  const dataQualitySetups = dataQualitySetupsFromSources(sourceFiles);
  const expectationSignals = dataQualityExpectationSignals(sourceFiles);
  const sodaSignals = dataQualitySodaSignals(sourceFiles);
  const dbtSignals = dataQualityDbtSignals(sourceFiles);
  const qualityDimensionSignals = dataQualityDimensionSignals(sourceFiles);
  const resultSignals = dataQualityResultSignals(sourceFiles);
  const ciSignals = dataQualityCiSignals(sourceFiles);
  const packageSignals = dataQualityPackageSignals(sourceFiles);

  const hasExpectations = expectationSignals.some((item) => item.readiness === "ready") || dataQualitySetups.some((item) => item.expectationCount > 0);
  const hasSodaOrDbt = sodaSignals.some((item) => item.readiness === "ready") || dbtSignals.some((item) => item.readiness === "ready");
  const hasSchema = qualityDimensionSignals.some((item) => item.signal === "schema" && item.readiness === "ready") || dataQualitySetups.some((item) => item.schemaTestCount > 0);
  const hasFreshness = qualityDimensionSignals.some((item) => item.signal === "freshness" && item.readiness === "ready") || dataQualitySetups.some((item) => item.freshnessCount > 0);
  const hasResults = resultSignals.some((item) => item.readiness === "ready") || dataQualitySetups.some((item) => item.resultCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || dataQualitySetups.some((item) => item.ciCount > 0);
  const hasThresholds = sodaSignals.some((item) => item.signal === "fail-warn-threshold" && item.readiness === "ready") || dbtSignals.some((item) => item.signal === "severity" && item.readiness === "ready") || expectationSignals.some((item) => item.signal === "mostly" && item.readiness === "ready");
  const hasFailedRows = resultSignals.some((item) => ["failed-rows", "run-results", "validation-result"].includes(item.signal) && item.readiness === "ready") || dbtSignals.some((item) => item.signal === "store-failures" && item.readiness === "ready");

  const riskQueue: DataQualityReadinessReport["riskQueue"] = [];
  if (!hasExpectations && !hasSodaOrDbt) {
    riskQueue.push({
      priority: "high",
      action: "Add or document data quality checks before claiming data quality readiness.",
      why: "Learners need traceable expectations, SodaCL checks, dbt data tests, or an equivalent validation layer.",
      relatedHref: "html/data-quality-readiness.html"
    });
  }
  if ((hasExpectations || hasSodaOrDbt) && !hasSchema) {
    riskQueue.push({
      priority: "medium",
      action: "Cover schema and column contract checks such as expected columns, types, not_null, unique, and relationships.",
      why: "Quality checks without schema coverage can miss breaking contract changes in tabular data.",
      relatedHref: "html/data-quality-readiness.html"
    });
  }
  if ((hasExpectations || hasSodaOrDbt) && !hasFreshness) {
    riskQueue.push({
      priority: "medium",
      action: "Add freshness or recency checks for source and model data.",
      why: "Correct-looking stale data is a common data quality failure mode.",
      relatedHref: "html/data-quality-readiness.html"
    });
  }
  if ((hasExpectations || hasSodaOrDbt) && !hasThresholds) {
    riskQueue.push({
      priority: "low",
      action: "Document fail/warn thresholds such as mostly, severity, warn_if, error_if, or Soda thresholds.",
      why: "Thresholds explain when a quality signal becomes a blocking failure versus a warning.",
      relatedHref: "html/data-quality-readiness.html"
    });
  }
  if ((hasExpectations || hasSodaOrDbt) && !hasResults) {
    riskQueue.push({
      priority: "medium",
      action: "Persist validation results, run results, failed rows, data docs, or CI artifacts.",
      why: "Data quality checks are hard to review if the repository never records outputs or failed-row evidence.",
      relatedHref: "html/data-quality-readiness.html"
    });
  }
  if (hasResults && !hasFailedRows) {
    riskQueue.push({
      priority: "low",
      action: "Record failed-row or unexpected-row retrieval where safe.",
      why: "Debugging data quality issues is faster when learners can trace sample failures or stored failure tables.",
      relatedHref: "html/data-quality-readiness.html"
    });
  }
  if ((hasExpectations || hasSodaOrDbt) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run data quality checks in CI or scheduled jobs.",
      why: "Quality contracts need repeatable execution, not one-off local checks.",
      relatedHref: "html/data-quality-readiness.html"
    });
  }

  return {
    summary: `Data quality readiness report: data quality setup ${dataQualitySetups.length}개, expectation signal ${expectationSignals.length}개, Soda signal ${sodaSignals.length}개, dbt signal ${dbtSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Data quality readiness Great Expectations SodaCL Soda Core dbt data_tests schema.yml ExpectationSuite Checkpoint Validator BatchRequest expectations unexpected rows result_format checks for row_count missing_count duplicate_count freshness not_null unique accepted_values relationships severity store_failures CI",
    dataQualitySetups,
    expectationSignals,
    sodaSignals,
    dbtSignals,
    qualityDimensionSignals,
    resultSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"ExpectationSuite|Checkpoint|Validator|BatchRequest|expect_column_values|unexpected|result_format\" .", purpose: "Find Great Expectations suites, validators, checkpoints, expectation calls, and validation output settings." },
      { command: "rg \"checks for|SodaCL|row_count|missing_count|duplicate_count|freshness|fail|warn|threshold\" .", purpose: "Find SodaCL/Soda Core checks, dimensions, and thresholds." },
      { command: "rg \"data_tests|tests:|not_null|unique|accepted_values|relationships|freshness|store_failures|severity\" .", purpose: "Find dbt data tests, schema YAML tests, source freshness, severity, and failed-row storage." },
      { command: "dbt test --select state:modified+", purpose: "Run dbt data tests for changed resources when the target repository is a dbt project." },
      { command: "soda scan -d <data-source> -c configuration.yml checks.yml", purpose: "Run Soda checks when SodaCL configuration is present." }
    ],
    learnerNextSteps: [
      "먼저 Great Expectations suite/checkpoint, SodaCL checks, dbt data_tests 중 어떤 품질 레이어가 있는지 찾으세요.",
      "completeness, uniqueness, validity, schema, freshness, volume 같은 품질 차원이 실제 check로 커버되는지 확인하세요.",
      "mostly, fail/warn threshold, severity, warn_if/error_if 같은 실패 기준을 추적하세요.",
      "validation_result, run_results, failed rows, data docs, artifact upload이 남는지 확인하세요.",
      "CI나 scheduled job에서 품질 검사가 반복 실행되는지 마지막에 확인하세요."
    ]
  };
}

type DataQualitySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataQualitySourceFiles(walk: WalkResult): Promise<DataQualitySourceFile[]> {
  const rows: DataQualitySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!dataQualityInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!dataQualityPathSignal(file.relPath) && !dataQualityContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function dataQualityInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|dbt_project\.ya?ml|schema\.ya?ml|sources?\.ya?ml|checks?\.ya?ml|scan\.ya?ml|configuration\.ya?ml|great_expectations\.ya?ml)$/i.test(base)
    || /(^|\/)(great_expectations|gx|expectations?|checkpoints?|validations?|data_docs|data-quality|data_quality|quality|soda|sodacl|dbt|models|seeds|snapshots|tests)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|sql|py|rb|go|rs)$/i.test(filePath);
}

function dataQualityPathSignal(filePath: string): boolean {
  return /(^|\/)(great_expectations|gx|expectations?|checkpoints?|validations?|data_docs|data-quality|data_quality|quality|soda|sodacl|dbt|models|seeds|snapshots|tests)(\/|\.|-|_|$)/i.test(filePath)
    || /^(dbt_project\.ya?ml|schema\.ya?ml|sources?\.ya?ml|checks?\.ya?ml|scan\.ya?ml|configuration\.ya?ml|great_expectations\.ya?ml)$/i.test(path.basename(filePath));
}

function dataQualityContentSignal(text: string): boolean {
  return /ExpectationSuite|Checkpoint|Validator|BatchRequest|expect_column_values|expect_table|unexpected_count|result_format|DataDocs|SodaCL|checks for|row_count|missing_count|duplicate_count|freshness|dbt test|data_tests|not_null|accepted_values|relationships|store_failures|warn_if|error_if|great_expectations|soda-core|dbt-core/i.test(text);
}

function dataQualitySetupsFromSources(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["dataQualitySetups"] {
  const rows: DataQualityReadinessReport["dataQualitySetups"] = [];
  for (const source of sourceFiles) {
    const suiteCount = countMatches(source.text, /ExpectationSuite|expectation_suite|suite_name|expectation suite|great_expectations\.yml|schema\.ya?ml/gi);
    const expectationCount = countMatches(source.text, /expect_column_values|expect_table|expectation|expectations|not_null|unique|accepted_values|relationships|row_count|missing_count|duplicate_count|validity|freshness/gi);
    const checkpointCount = countMatches(source.text, /Checkpoint|checkpoint|ValidationDefinition|validation definition|RunCheckpointAction/gi);
    const scanCount = countMatches(source.text, /SodaCL|checks for|soda scan|Scan\(|dbt test|dbt build|data_tests|tests:|scan\.ya?ml|checks\.ya?ml/gi);
    const schemaTestCount = countMatches(source.text, /schema check|schema:|schema\.ya?ml|not_null|unique|relationships|accepted_values|expected columns|column type|data type/gi);
    const freshnessCount = countMatches(source.text, /freshness|source freshness|loaded_at_field|loaded_at_query|warn_after|error_after|recency|stale|SLA/gi);
    const resultCount = countMatches(source.text, /validation_result|ValidationResult|run_results|unexpected_count|unexpected_list|failed rows|failed_rows|store_failures|data docs|DataDocs|junit|sarif|artifact/gi);
    const ciCount = countMatches(source.text, /github actions|\.github\/workflows|dbt test|soda scan|great_expectations checkpoint|gx checkpoint|quality scan|upload-artifact|schedule/gi);
    const totalSignals = suiteCount + expectationCount + checkpointCount + scanCount + schemaTestCount + freshnessCount + resultCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: dataQualityTool(source),
      suiteCount,
      expectationCount,
      checkpointCount,
      scanCount,
      schemaTestCount,
      freshnessCount,
      resultCount,
      ciCount,
      readiness: (expectationCount + scanCount + schemaTestCount) > 0 && (resultCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} data quality readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.suiteCount + b.expectationCount + b.checkpointCount + b.scanCount + b.schemaTestCount + b.freshnessCount + b.resultCount + b.ciCount) - (a.suiteCount + a.expectationCount + a.checkpointCount + a.scanCount + a.schemaTestCount + a.freshnessCount + a.resultCount + a.ciCount))
    .slice(0, 60);
}

function dataQualityTool(source: DataQualitySourceFile): DataQualityReadinessReport["dataQualitySetups"][number]["tool"] {
  if (/great_expectations|\/gx\/|expectation|checkpoint/i.test(source.filePath) || /great_expectations|ExpectationSuite|Checkpoint|Validator|BatchRequest/i.test(source.text)) return "great-expectations";
  if (/soda|sodacl|checks?\.ya?ml|scan\.ya?ml/i.test(source.filePath) || /SodaCL|checks for|soda scan|soda-core/i.test(source.text)) return "soda-core";
  if (/dbt_project|(^|\/)(models|seeds|snapshots|dbt)(\/|$)|schema\.ya?ml/i.test(source.filePath) || /dbt test|data_tests|not_null|accepted_values|relationships|dbt-core/i.test(source.text)) return "dbt";
  if (/pandera/i.test(source.filePath) || /pandera|DataFrameSchema|Check\(/i.test(source.text)) return "pandera";
  if (/deequ/i.test(source.filePath) || /deequ|VerificationSuite|CheckLevel/i.test(source.text)) return "deequ";
  if (/quality|validation|checks?/i.test(source.filePath) || /quality|validation|checks?/i.test(source.text)) return "custom";
  return "unknown";
}

function dataQualityExpectationSignals(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["expectationSignals"] {
  const specs: Array<{ signal: DataQualityReadinessReport["expectationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "expectation-suite", pattern: /ExpectationSuite|expectation_suite|suite_name|expectation suite/i, evidence: "Great Expectations suite evidence was detected." },
    { signal: "validator", pattern: /Validator|context\.get_validator|validator\./i, evidence: "Great Expectations validator evidence was detected." },
    { signal: "checkpoint", pattern: /Checkpoint|checkpoint|run_checkpoint|RunCheckpointAction/i, evidence: "checkpoint evidence was detected." },
    { signal: "batch-request", pattern: /BatchRequest|batch_request|batch definition|BatchDefinition/i, evidence: "batch request/definition evidence was detected." },
    { signal: "expect-column-values", pattern: /expect_column_values|expect.*column.*values/i, evidence: "column expectation evidence was detected." },
    { signal: "expect-table", pattern: /expect_table|expect.*table|expect_table_row_count|expect_table_columns/i, evidence: "table expectation evidence was detected." },
    { signal: "mostly", pattern: /\bmostly\b|mostly=/i, evidence: "mostly threshold evidence was detected." },
    { signal: "result-format", pattern: /result_format|COMPLETE|SUMMARY|BOOLEAN_ONLY|unexpected_index_column_names/i, evidence: "result_format evidence was detected." },
    { signal: "unexpected-rows", pattern: /unexpected_count|unexpected_list|unexpected_index_list|unexpected_index_query|partial_unexpected/i, evidence: "unexpected row evidence was detected." }
  ];
  return dataQualitySignalFromSpecs(sourceFiles, specs, "expectation", "signal");
}

function dataQualitySodaSignals(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["sodaSignals"] {
  const specs: Array<{ signal: DataQualityReadinessReport["sodaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sodacl", pattern: /SodaCL|soda-core|soda_cloud|soda scan/i, evidence: "SodaCL/Soda Core evidence was detected." },
    { signal: "checks-for", pattern: /checks for|checks:\s*$/im, evidence: "checks-for block evidence was detected." },
    { signal: "row-count", pattern: /row_count|row count|row_count between|rows? must/i, evidence: "row count check evidence was detected." },
    { signal: "missing-count", pattern: /missing_count|missing percent|missing_count\(|no missing|not null/i, evidence: "missing/completeness evidence was detected." },
    { signal: "duplicate-count", pattern: /duplicate_count|duplicate percent|duplicate_count\(|duplicate rows/i, evidence: "duplicate/uniqueness evidence was detected." },
    { signal: "freshness", pattern: /freshness|freshness\(|days? old|hours? old/i, evidence: "freshness evidence was detected." },
    { signal: "fail-warn-threshold", pattern: /\bfail\b|\bwarn\b|threshold|between|must be|should be/i, evidence: "fail/warn threshold evidence was detected." },
    { signal: "scan-command", pattern: /soda scan|Scan\(|scan\.execute|scan\.set_data_source_name/i, evidence: "Soda scan command/API evidence was detected." },
    { signal: "data-source", pattern: /data_source|datasource|configuration\.ya?ml|connection|warehouse|database/i, evidence: "data source configuration evidence was detected." }
  ];
  return dataQualitySignalFromSpecs(sourceFiles, specs, "Soda", "signal");
}

function dataQualityDbtSignals(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["dbtSignals"] {
  const specs: Array<{ signal: DataQualityReadinessReport["dbtSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "data-tests", pattern: /data_tests|tests:\s*$/im, evidence: "dbt data tests evidence was detected." },
    { signal: "schema-yml", pattern: /schema\.ya?ml|models:\s*$/im, evidence: "dbt schema YAML evidence was detected." },
    { signal: "not-null", pattern: /not_null|not null/i, evidence: "dbt not_null test evidence was detected." },
    { signal: "unique", pattern: /-\s*unique\b|unique_key|unique_combination_of_columns/i, evidence: "dbt unique test evidence was detected." },
    { signal: "accepted-values", pattern: /accepted_values|accepted values|values:/i, evidence: "dbt accepted_values test evidence was detected." },
    { signal: "relationships", pattern: /relationships|to:\s*ref\(|field:/i, evidence: "dbt relationships test evidence was detected." },
    { signal: "source-freshness", pattern: /source freshness|freshness:|loaded_at_field|loaded_at_query|warn_after|error_after/i, evidence: "dbt source/model freshness evidence was detected." },
    { signal: "severity", pattern: /severity:|warn_if|error_if|warn_after|error_after/i, evidence: "dbt severity/threshold evidence was detected." },
    { signal: "store-failures", pattern: /store_failures|store_failures_as|failed rows|failures table/i, evidence: "dbt stored failures evidence was detected." }
  ];
  return dataQualitySignalFromSpecs(sourceFiles, specs, "dbt", "signal");
}

function dataQualityDimensionSignals(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["qualityDimensionSignals"] {
  const specs: Array<{ signal: DataQualityReadinessReport["qualityDimensionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "completeness", pattern: /completeness|not_null|missing_count|missing percent|expect_column_values_to_not_be_null/i, evidence: "completeness evidence was detected." },
    { signal: "uniqueness", pattern: /uniqueness|unique|duplicate_count|duplicate percent|expect_column_values_to_be_unique/i, evidence: "uniqueness evidence was detected." },
    { signal: "validity", pattern: /validity|accepted_values|expect_column_values_to_be_in_set|expect_column_values_to_match_regex|valid values/i, evidence: "validity evidence was detected." },
    { signal: "freshness", pattern: /freshness|recency|loaded_at|stale|SLA/i, evidence: "freshness evidence was detected." },
    { signal: "schema", pattern: /schema|columns:|data_type|column type|relationships|expected columns/i, evidence: "schema contract evidence was detected." },
    { signal: "volume", pattern: /row_count|row count|volume|expect_table_row_count/i, evidence: "volume evidence was detected." },
    { signal: "distribution", pattern: /distribution|quantile|mean|median|stddev|expect_column_mean|expect_column_quantile/i, evidence: "distribution evidence was detected." },
    { signal: "anomaly", pattern: /anomaly|anomalies|anomaly detection|seasonality|spike|drift/i, evidence: "anomaly/drift evidence was detected." }
  ];
  return dataQualitySignalFromSpecs(sourceFiles, specs, "quality dimension", "signal");
}

function dataQualityResultSignals(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["resultSignals"] {
  const specs: Array<{ signal: DataQualityReadinessReport["resultSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "validation-result", pattern: /ValidationResult|validation_result|ExpectationSuiteValidationResult|validation results/i, evidence: "validation result evidence was detected." },
    { signal: "run-results", pattern: /run_results|run-results|target\/run_results\.json|dbt_results/i, evidence: "run results evidence was detected." },
    { signal: "failed-rows", pattern: /failed rows|failed_rows|unexpected_index_list|unexpected_index_query|store_failures/i, evidence: "failed/unexpected row evidence was detected." },
    { signal: "data-docs", pattern: /DataDocs|data docs|docs generate|UpdateDataDocsAction/i, evidence: "data docs evidence was detected." },
    { signal: "junit", pattern: /junit|junitxml|JUnit/i, evidence: "JUnit output evidence was detected." },
    { signal: "sarif", pattern: /sarif|SARIF/i, evidence: "SARIF output evidence was detected." },
    { signal: "artifact", pattern: /artifact|upload-artifact|validation report|quality report|soda report/i, evidence: "artifact evidence was detected." }
  ];
  return dataQualitySignalFromSpecs(sourceFiles, specs, "result", "signal");
}

function dataQualityCiSignals(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["ciSignals"] {
  const specs: Array<{ signal: DataQualityReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "quality-scan-command", pattern: /quality scan|data quality|validation scan|dq check/i, evidence: "generic quality scan command evidence was detected." },
    { signal: "dbt-test-command", pattern: /dbt test|dbt build|dbt source freshness/i, evidence: "dbt test/build/freshness command evidence was detected." },
    { signal: "gx-checkpoint-command", pattern: /great_expectations checkpoint|gx checkpoint|run_checkpoint|Checkpoint/i, evidence: "Great Expectations checkpoint command evidence was detected." },
    { signal: "soda-scan-command", pattern: /soda scan|soda-core|SodaCL/i, evidence: "Soda scan command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|validation-result|run_results|data docs|quality report|soda report/i, evidence: "artifact upload/output evidence was detected." }
  ];
  return dataQualitySignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function dataQualityPackageSignals(sourceFiles: DataQualitySourceFile[]): DataQualityReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataQualityReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "great-expectations", pattern: /great_expectations|great-expectations|ExpectationSuite|Checkpoint/i, evidence: "Great Expectations package/API evidence was detected." },
    { signal: "soda-core", pattern: /soda-core|soda_core|SodaCL|soda scan/i, evidence: "Soda Core package/API evidence was detected." },
    { signal: "dbt-core", pattern: /dbt-core|dbt_project|dbt test|data_tests/i, evidence: "dbt Core package/API evidence was detected." },
    { signal: "dbt-expectations", pattern: /dbt-expectations|dbt_expectations/i, evidence: "dbt-expectations package evidence was detected." },
    { signal: "dbt-utils", pattern: /dbt-utils|dbt_utils/i, evidence: "dbt-utils package evidence was detected." },
    { signal: "pandera", pattern: /pandera|DataFrameSchema|Check\(/i, evidence: "Pandera package/API evidence was detected." },
    { signal: "deequ", pattern: /deequ|VerificationSuite|CheckLevel/i, evidence: "Deequ package/API evidence was detected." },
    { signal: "pydantic", pattern: /pydantic|BaseModel|Field\(/i, evidence: "Pydantic schema evidence was detected." }
  ];
  return dataQualitySignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataQualitySignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataQualitySourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/data-quality-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildDataLineageReadinessReport(walk: WalkResult): Promise<DataLineageReadinessReport> {
  const sourceFiles = await dataLineageSourceFiles(walk);
  const lineageSetups = dataLineageSetupsFromSources(sourceFiles);
  const eventSignals = dataLineageEventSignals(sourceFiles);
  const identitySignals = dataLineageIdentitySignals(sourceFiles);
  const datasetSignals = dataLineageDatasetSignals(sourceFiles);
  const facetSignals = dataLineageFacetSignals(sourceFiles);
  const dbtArtifactSignals = dataLineageDbtArtifactSignals(sourceFiles);
  const storageSignals = dataLineageStorageSignals(sourceFiles);
  const ciSignals = dataLineageCiSignals(sourceFiles);
  const packageSignals = dataLineagePackageSignals(sourceFiles);

  const hasEvents = eventSignals.some((item) => item.readiness === "ready") || lineageSetups.some((item) => item.eventCount > 0);
  const hasIdentity = identitySignals.filter((item) => item.readiness === "ready").length >= 3 || lineageSetups.some((item) => item.jobCount > 0 && item.runCount > 0);
  const hasDatasets = datasetSignals.some((item) => ["input-dataset", "output-dataset"].includes(item.signal) && item.readiness === "ready") || lineageSetups.some((item) => item.datasetCount > 1);
  const hasColumnLineage = datasetSignals.some((item) => item.signal === "column-lineage" && item.readiness === "ready") || lineageSetups.some((item) => item.columnLineageCount > 0);
  const hasArtifacts = dbtArtifactSignals.some((item) => item.readiness === "ready") || lineageSetups.some((item) => item.artifactCount > 0);
  const hasStorage = storageSignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || lineageSetups.some((item) => item.ciCount > 0);

  const riskQueue: DataLineageReadinessReport["riskQueue"] = [];
  if (!hasEvents && !hasArtifacts) {
    riskQueue.push({
      priority: "high",
      action: "Add lineage events or lineage artifacts before claiming lineage readiness.",
      why: "Learners need either OpenLineage/Marquez event evidence or dbt artifact DAG evidence to trace jobs and datasets.",
      relatedHref: "html/data-lineage-readiness.html"
    });
  }
  if ((hasEvents || hasArtifacts) && !hasIdentity) {
    riskQueue.push({
      priority: "medium",
      action: "Document stable namespace, job, run, dataset, and unique_id identity fields.",
      why: "Lineage graphs are hard to compare across runs if identifiers are not stable.",
      relatedHref: "html/data-lineage-readiness.html"
    });
  }
  if ((hasEvents || hasArtifacts) && !hasDatasets) {
    riskQueue.push({
      priority: "medium",
      action: "Capture both input and output dataset edges.",
      why: "A job-only trace is not enough to explain upstream and downstream data impact.",
      relatedHref: "html/data-lineage-readiness.html"
    });
  }
  if (hasDatasets && !hasColumnLineage) {
    riskQueue.push({
      priority: "low",
      action: "Add column-level lineage or field mapping when the repository transforms tabular data.",
      why: "Column lineage makes schema and metric impact analysis more precise.",
      relatedHref: "html/data-lineage-readiness.html"
    });
  }
  if (hasEvents && !hasStorage) {
    riskQueue.push({
      priority: "low",
      action: "Record where lineage events or facets are stored and queried.",
      why: "OpenLineage events need a backend, export, or retained artifact to be useful after execution.",
      relatedHref: "html/data-lineage-readiness.html"
    });
  }
  if ((hasEvents || hasArtifacts) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Generate or export lineage artifacts in CI or scheduled jobs.",
      why: "Lineage evidence should be reproducible, not only available from a local run.",
      relatedHref: "html/data-lineage-readiness.html"
    });
  }

  return {
    summary: `Data lineage readiness report: lineage setup ${lineageSetups.length}개, event signal ${eventSignals.length}개, dataset signal ${datasetSignals.length}개, facet signal ${facetSignals.length}개, dbt artifact signal ${dbtArtifactSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Data lineage readiness OpenLineage Marquez dbt RunEvent LineageEvent eventType producer schemaURL namespace job run dataset input output facet RunFacet JobFacet DatasetFacet InputDatasetFacet OutputDatasetFacet nominalTime parent errorMessage sourceCodeLocation sourceCode sql ownership dataSource lifecycleStateChange columnLineage dataQualityMetrics dataQualityAssertions inputStatistics outputStatistics custom facet _schemaURL manifest.json catalog.json run_results.json parent_map child_map depends_on lineage_events dataset_facets job_facets run_facets CI",
    lineageSetups,
    eventSignals,
    identitySignals,
    datasetSignals,
    facetSignals,
    dbtArtifactSignals,
    storageSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"RunEvent|LineageEvent|eventType|producer|schemaURL|runId|namespace\" .", purpose: "Find OpenLineage event identity and lifecycle fields." },
      { command: "rg \"inputs|outputs|InputDataset|OutputDataset|columnLineage|inputFields|DatasetVersion\" .", purpose: "Find dataset edges, dataset versions, and column-level lineage evidence." },
      { command: "rg \"nominalTime|parent|errorMessage|sourceCodeLocation|sourceCode|sql|ownership|dataQualityMetrics|inputStatistics|outputStatistics\" .", purpose: "Find OpenLineage run, job, dataset, quality, and statistics facet evidence." },
      { command: "rg \"manifest.json|catalog.json|run_results.json|parent_map|child_map|depends_on|unique_id\" .", purpose: "Find dbt artifact DAG and dependency evidence." },
      { command: "rg \"lineage_events|dataset_facets|job_facets|run_facets|POST /lineage|Marquez\" .", purpose: "Find Marquez/OpenLineage storage and API evidence." },
      { command: "dbt docs generate && dbt ls --output json", purpose: "Generate dbt lineage artifacts when the target repository is a dbt project." }
    ],
    learnerNextSteps: [
      "먼저 OpenLineage RunEvent/LineageEvent 또는 dbt manifest/catalog/run_results 산출물이 있는지 찾으세요.",
      "namespace, job name, runId/run_uuid, dataset namespace/name, dbt unique_id가 안정적으로 남는지 확인하세요.",
      "inputs/outputs dataset edge와 parent_map/child_map/depends_on이 함께 설명되는지 확인하세요.",
      "nominalTime, parent, sourceCodeLocation, schema, dataSource, dataQuality, statistics facet처럼 OpenLineage 표준 facet이 어떤 엔터티에 붙는지 구분하세요.",
      "columnLineage, inputFields, DatasetField mapping처럼 컬럼 단위 영향 분석 근거가 있는지 확인하세요.",
      "Marquez lineage_events/facet tables, export artifact, CI upload처럼 실행 후에도 남는 저장 경로를 확인하세요."
    ]
  };
}

type DataLineageSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataLineageSourceFiles(walk: WalkResult): Promise<DataLineageSourceFile[]> {
  const rows: DataLineageSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!dataLineageInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!dataLineagePathSignal(file.relPath) && !dataLineageContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function dataLineageInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|dbt_project\.ya?ml|manifest\.json|catalog\.json|run_results\.json|sources\.json|openlineage\.ya?ml|marquez\.ya?ml)$/i.test(base)
    || /(^|\/)(openlineage|open-lineage|lineage|marquez|dbt|models|exposures|metrics|semantic_models|target|artifacts)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|sql|py|java|scala|kt|go|rs)$/i.test(filePath);
}

function dataLineagePathSignal(filePath: string): boolean {
  return /(^|\/)(openlineage|open-lineage|lineage|marquez|dbt|models|exposures|metrics|semantic_models|target|artifacts)(\/|\.|-|_|$)/i.test(filePath)
    || /^(manifest\.json|catalog\.json|run_results\.json|sources\.json|openlineage\.ya?ml|marquez\.ya?ml)$/i.test(path.basename(filePath));
}

function dataLineageContentSignal(text: string): boolean {
  return /RunEvent|LineageEvent|eventType|_producer|_schemaURL|runId|run_uuid|namespace|InputDataset|OutputDataset|RunFacet|JobFacet|DatasetFacet|InputDatasetFacet|OutputDatasetFacet|nominalTime|sourceCodeLocation|lifecycleStateChange|dataQualityMetrics|dataQualityAssertions|inputStatistics|outputStatistics|columnLineage|inputFields|manifest\.json|catalog\.json|run_results|parent_map|child_map|depends_on|lineage_events|dataset_facets|job_facets|run_facets|Marquez|openlineage/i.test(text);
}

function dataLineageSetupsFromSources(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["lineageSetups"] {
  const rows: DataLineageReadinessReport["lineageSetups"] = [];
  for (const source of sourceFiles) {
    const eventCount = countMatches(source.text, /RunEvent|LineageEvent|eventType|START|RUNNING|COMPLETE|FAIL|ABORT|OpenLineage/gi);
    const datasetCount = countMatches(source.text, /InputDataset|OutputDataset|inputs|outputs|datasetNamespace|datasetName|DatasetId|DatasetVersion|dataset_version/gi);
    const jobCount = countMatches(source.text, /jobName|job_name|JobFacet|JobId|job_namespace|jobs:|job name/gi);
    const runCount = countMatches(source.text, /runId|run_id|run_uuid|RunFacet|RunState|runs:|run state/gi);
    const facetCount = countMatches(source.text, /facet|facets|_schemaURL|_producer|RunFacet|JobFacet|DatasetFacet|InputDatasetFacet|OutputDatasetFacet|nominalTime|parent|errorMessage|sourceCodeLocation|sourceCode|sql|ownership|schemaURL|dataSource|lifecycleStateChange|dataQualityMetrics|dataQualityAssertions|inputStatistics|outputStatistics/gi);
    const columnLineageCount = countMatches(source.text, /columnLineage|ColumnLineage|inputFields|field_mapping|DatasetField|column lineage|field mapping/gi);
    const artifactCount = countMatches(source.text, /manifest\.json|catalog\.json|run_results\.json|sources\.json|parent_map|child_map|depends_on|unique_id|dbt docs generate|dbt ls/gi);
    const ciCount = countMatches(source.text, /github actions|\.github\/workflows|openlineage|dbt docs generate|dbt ls|upload-artifact|lineage export|Marquez|marquez/gi);
    const totalSignals = eventCount + datasetCount + jobCount + runCount + facetCount + columnLineageCount + artifactCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: dataLineageTool(source),
      eventCount,
      datasetCount,
      jobCount,
      runCount,
      facetCount,
      columnLineageCount,
      artifactCount,
      ciCount,
      readiness: (eventCount + artifactCount) > 0 && datasetCount > 0 && (facetCount + columnLineageCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} data lineage readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.eventCount + b.datasetCount + b.jobCount + b.runCount + b.facetCount + b.columnLineageCount + b.artifactCount + b.ciCount) - (a.eventCount + a.datasetCount + a.jobCount + a.runCount + a.facetCount + a.columnLineageCount + a.artifactCount + a.ciCount))
    .slice(0, 60);
}

function dataLineageTool(source: DataLineageSourceFile): DataLineageReadinessReport["lineageSetups"][number]["tool"] {
  if (/marquez/i.test(source.filePath) || /Marquez|lineage_events|dataset_facets|job_facets|run_facets|POST \/lineage/i.test(source.text)) return "marquez";
  if (/openlineage|open-lineage/i.test(source.filePath) || /OpenLineage|RunEvent|LineageEvent|InputDataset|OutputDataset/i.test(source.text)) return "openlineage";
  if (/dbt_project|manifest\.json|catalog\.json|run_results\.json|(^|\/)(dbt|models|target)(\/|$)/i.test(source.filePath) || /dbt docs generate|parent_map|child_map|depends_on|unique_id/i.test(source.text)) return "dbt";
  if (/airflow/i.test(source.filePath) || /airflow|OpenLineageProvider|DAG\(/i.test(source.text)) return "airflow";
  if (/spark/i.test(source.filePath) || /spark\.openlineage|SparkListener|LogicalPlan/i.test(source.text)) return "spark";
  if (/lineage|dataset|job|run/i.test(source.filePath) || /lineage|dataset|job|run/i.test(source.text)) return "custom";
  return "unknown";
}

function dataLineageEventSignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["eventSignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["eventSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "run-event", pattern: /RunEvent|LineageEvent|OpenLineage\.RunEvent/i, evidence: "OpenLineage run event evidence was detected." },
    { signal: "event-type", pattern: /eventType|START|RUNNING|COMPLETE|FAIL|ABORT/i, evidence: "event lifecycle type evidence was detected." },
    { signal: "producer", pattern: /producer|_producer/i, evidence: "producer metadata evidence was detected." },
    { signal: "schema-url", pattern: /schemaURL|_schemaURL|schemaUrl/i, evidence: "schema URL evidence was detected." },
    { signal: "event-time", pattern: /eventTime|event_time|lineage_event_time|nominalTime/i, evidence: "event time evidence was detected." },
    { signal: "run-id", pattern: /runId|run_id|run_uuid/i, evidence: "run ID evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "event", "signal");
}

function dataLineageIdentitySignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["identitySignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["identitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "namespace", pattern: /namespace|job_namespace|namespaceName/i, evidence: "namespace identity evidence was detected." },
    { signal: "job-name", pattern: /jobName|job_name|job name|JobId/i, evidence: "job name identity evidence was detected." },
    { signal: "run-id", pattern: /runId|run_id|run_uuid|RunId/i, evidence: "run identity evidence was detected." },
    { signal: "dataset-namespace", pattern: /datasetNamespace|dataset namespace|DatasetId|namespace.*dataset/i, evidence: "dataset namespace evidence was detected." },
    { signal: "dataset-name", pattern: /datasetName|dataset_name|DatasetName|relation_name/i, evidence: "dataset name evidence was detected." },
    { signal: "unique-id", pattern: /unique_id|uniqueId|model\.[^.]+\.|source\.[^.]+\./i, evidence: "dbt unique_id evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "identity", "signal");
}

function dataLineageDatasetSignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["datasetSignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["datasetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "input-dataset", pattern: /InputDataset|inputs:|"inputs"|inputDataset|input dataset/i, evidence: "input dataset edge evidence was detected." },
    { signal: "output-dataset", pattern: /OutputDataset|outputs:|"outputs"|outputDataset|output dataset/i, evidence: "output dataset edge evidence was detected." },
    { signal: "dataset-version", pattern: /DatasetVersion|dataset_version|DatasetVersionDatasetFacet|version field|externalVersion/i, evidence: "dataset version evidence was detected." },
    { signal: "schema-facet", pattern: /SchemaDatasetFacet|schema facet|fields:|DatasetField|schemaURL/i, evidence: "schema/dataset field facet evidence was detected." },
    { signal: "column-lineage", pattern: /columnLineage|ColumnLineage|inputFields|field_mapping|column lineage|field mapping/i, evidence: "column lineage evidence was detected." },
    { signal: "data-source", pattern: /dataSource|datasource|database|warehouse|relation_name|DbTable|table name/i, evidence: "data source or relation evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "dataset", "signal");
}

function dataLineageFacetSignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["facetSignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["facetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "run-nominal-time", pattern: /nominalTime|NominalTimeRunFacet/i, evidence: "run nominal time facet evidence was detected." },
    { signal: "run-parent", pattern: /ParentRunFacet|"parent"|parent run|parent job/i, evidence: "parent run/job facet evidence was detected." },
    { signal: "run-error-message", pattern: /ErrorMessageRunFacet|ExtractionErrorRunFacet|errorMessage|stackTrace|programmingLanguage/i, evidence: "run error message facet evidence was detected." },
    { signal: "job-source-code-location", pattern: /SourceCodeLocationJobFacet|sourceCodeLocation|repoUrl|pullRequestNumber/i, evidence: "job source code location facet evidence was detected." },
    { signal: "job-source-code", pattern: /SourceCodeJobFacet|sourceCode|source code/i, evidence: "job source code facet evidence was detected." },
    { signal: "job-sql", pattern: /SQLJobFacet|"sql"|query/i, evidence: "job SQL facet evidence was detected." },
    { signal: "job-ownership", pattern: /OwnershipJobFacet|ownership|owners/i, evidence: "job ownership facet evidence was detected." },
    { signal: "dataset-schema", pattern: /SchemaDatasetFacet|"schema"|fields|DatasetField/i, evidence: "dataset schema facet evidence was detected." },
    { signal: "dataset-data-source", pattern: /DatasourceDatasetFacet|dataSource|datasource|uri/i, evidence: "dataset data source facet evidence was detected." },
    { signal: "dataset-lifecycle-state", pattern: /LifecycleStateChangeDatasetFacet|lifecycleStateChange|ALTER|CREATE|DROP|OVERWRITE|RENAME|TRUNCATE/i, evidence: "dataset lifecycle state facet evidence was detected." },
    { signal: "dataset-version", pattern: /DatasetVersionDatasetFacet|datasetVersion|externalVersion/i, evidence: "dataset version facet evidence was detected." },
    { signal: "dataset-column-lineage", pattern: /ColumnLineageDatasetFacet|columnLineage|inputFields|transformations|transformationType/i, evidence: "dataset column lineage facet evidence was detected." },
    { signal: "dataset-data-quality", pattern: /DataQualityMetricsDatasetFacet|DataQualityMetricsInputDatasetFacet|DataQualityAssertionsDatasetFacet|dataQualityMetrics|dataQualityAssertions|assertions/i, evidence: "dataset data quality facet evidence was detected." },
    { signal: "dataset-statistics", pattern: /InputStatisticsInputDatasetFacet|OutputStatisticsOutputDatasetFacet|inputStatistics|outputStatistics|rowCount|size|bytes/i, evidence: "dataset statistics facet evidence was detected." },
    { signal: "custom-facet", pattern: /Custom Facet|custom facets|custom[A-Za-z]+Facet|[A-Za-z]+_[A-Za-z]+Facet/i, evidence: "custom facet naming evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "facet", "signal");
}

function dataLineageDbtArtifactSignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["dbtArtifactSignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["dbtArtifactSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "manifest", pattern: /manifest\.json|ManifestArtifact|manifest:/i, evidence: "dbt manifest evidence was detected." },
    { signal: "catalog", pattern: /catalog\.json|CatalogArtifact|dbt docs generate/i, evidence: "dbt catalog evidence was detected." },
    { signal: "run-results", pattern: /run_results\.json|RunResultsArtifact|run_results/i, evidence: "dbt run results evidence was detected." },
    { signal: "sources", pattern: /sources\.json|sources:|source_status|source freshness/i, evidence: "dbt source artifact evidence was detected." },
    { signal: "exposures", pattern: /exposures:|exposure\.|exposures\b/i, evidence: "dbt exposure evidence was detected." },
    { signal: "metrics", pattern: /metrics:|metric\.|metrics\b/i, evidence: "dbt metric evidence was detected." },
    { signal: "semantic-models", pattern: /semantic_models|semantic model|semantic_models:/i, evidence: "dbt semantic model evidence was detected." },
    { signal: "parent-child-map", pattern: /parent_map|child_map|build_parent_and_child_maps/i, evidence: "dbt parent/child map evidence was detected." },
    { signal: "depends-on", pattern: /depends_on|refs:|sources:/i, evidence: "dbt dependency evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "dbt artifact", "signal");
}

function dataLineageStorageSignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["storageSignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["storageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "marquez-api", pattern: /POST [` ]?\/lineage|\/lineage|LineageResource|Marquez/i, evidence: "Marquez/OpenLineage API evidence was detected." },
    { signal: "lineage-events-table", pattern: /lineage_events|lineage event table/i, evidence: "lineage events table evidence was detected." },
    { signal: "dataset-facets", pattern: /dataset_facets|dataset facets/i, evidence: "dataset facets storage evidence was detected." },
    { signal: "job-facets", pattern: /job_facets|job facets/i, evidence: "job facets storage evidence was detected." },
    { signal: "run-facets", pattern: /run_facets|run facets/i, evidence: "run facets storage evidence was detected." },
    { signal: "dataset-version", pattern: /DatasetVersionRow|DatasetVersionId|dataset_versions|externalVersion/i, evidence: "dataset version storage evidence was detected." },
    { signal: "job-version", pattern: /JobVersionRow|JobVersionId|job_versions/i, evidence: "job version storage evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "storage", "signal");
}

function dataLineageCiSignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["ciSignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "dbt-docs-generate", pattern: /dbt docs generate|dbt docs/i, evidence: "dbt docs artifact generation evidence was detected." },
    { signal: "openlineage-command", pattern: /openlineage|OPENLINEAGE|dbt-ol|lineage backend/i, evidence: "OpenLineage command/config evidence was detected." },
    { signal: "lineage-export", pattern: /lineage export|export lineage|lineage artifact|lineage\.json/i, evidence: "lineage export evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|manifest\.json|catalog\.json|run_results\.json|lineage\.json/i, evidence: "artifact upload/output evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function dataLineagePackageSignals(sourceFiles: DataLineageSourceFile[]): DataLineageReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataLineageReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "openlineage", pattern: /openlineage|open-lineage|OpenLineage|RunEvent/i, evidence: "OpenLineage package/API evidence was detected." },
    { signal: "marquez", pattern: /marquez|Marquez|LineageResource/i, evidence: "Marquez package/API evidence was detected." },
    { signal: "dbt-core", pattern: /dbt-core|dbt_project|manifest\.json|dbt docs generate/i, evidence: "dbt Core package/artifact evidence was detected." },
    { signal: "airflow-openlineage", pattern: /airflow-openlineage|apache-airflow-providers-openlineage|OpenLineageProvider/i, evidence: "Airflow OpenLineage package evidence was detected." },
    { signal: "spark-openlineage", pattern: /spark\.openlineage|openlineage-spark|SparkListener/i, evidence: "Spark OpenLineage package evidence was detected." },
    { signal: "sqlglot", pattern: /sqlglot|SQLGlot/i, evidence: "SQLGlot lineage/parser package evidence was detected." }
  ];
  return dataLineageSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataLineageSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataLineageSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/data-lineage-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildDataCatalogReadinessReport(walk: WalkResult): Promise<DataCatalogReadinessReport> {
  const sourceFiles = await dataCatalogSourceFiles(walk);
  const catalogSetups = dataCatalogSetupsFromSources(sourceFiles);
  const ingestionSignals = dataCatalogIngestionSignals(sourceFiles);
  const entitySignals = dataCatalogEntitySignals(sourceFiles);
  const entityMetadataSignals = dataCatalogEntityMetadataSignals(sourceFiles);
  const governanceSignals = dataCatalogGovernanceSignals(sourceFiles);
  const searchSignals = dataCatalogSearchSignals(sourceFiles);
  const lineageSignals = dataCatalogLineageSignals(sourceFiles);
  const ciSignals = dataCatalogCiSignals(sourceFiles);
  const packageSignals = dataCatalogPackageSignals(sourceFiles);

  const hasIngestion = ingestionSignals.some((item) => item.readiness === "ready") || catalogSetups.some((item) => item.ingestionCount > 0);
  const hasEntities = entitySignals.filter((item) => item.readiness === "ready").length >= 3 || catalogSetups.some((item) => item.entityCount > 0 && item.schemaCount > 0);
  const hasGovernance = governanceSignals.some((item) => item.readiness === "ready") || catalogSetups.some((item) => item.ownershipCount + item.glossaryCount + item.tagCount + item.policyCount > 0);
  const hasSearch = searchSignals.some((item) => item.readiness === "ready") || catalogSetups.some((item) => item.searchCount > 0);
  const hasLineage = lineageSignals.some((item) => item.readiness === "ready") || catalogSetups.some((item) => item.lineageCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || catalogSetups.some((item) => item.ciCount > 0);

  const riskQueue: DataCatalogReadinessReport["riskQueue"] = [];
  if (!hasIngestion) {
    riskQueue.push({
      priority: "high",
      action: "Add catalog ingestion configuration before claiming data catalog readiness.",
      why: "A catalog page is stale unless connectors, recipes, workflows, or pipelines can refresh metadata.",
      relatedHref: "html/data-catalog-readiness.html"
    });
  }
  if (hasIngestion && !hasEntities) {
    riskQueue.push({
      priority: "high",
      action: "Document dataset/table/column/dashboard/job entities and schema fields.",
      why: "Learners need concrete catalog entities, not only a connector command, to inspect what the repository publishes.",
      relatedHref: "html/data-catalog-readiness.html"
    });
  }
  if (hasEntities && !hasGovernance) {
    riskQueue.push({
      priority: "medium",
      action: "Capture ownership, glossary, tags, classifications, domains, or policy metadata.",
      why: "Catalogs become operationally useful when ownership and governance are attached to entities.",
      relatedHref: "html/data-catalog-readiness.html"
    });
  }
  if (hasEntities && !hasSearch) {
    riskQueue.push({
      priority: "medium",
      action: "Add search or browse-path evidence for catalog discovery.",
      why: "Metadata that cannot be searched or browsed is hard for learners and operators to discover.",
      relatedHref: "html/data-catalog-readiness.html"
    });
  }
  if (hasEntities && !hasLineage) {
    riskQueue.push({
      priority: "low",
      action: "Connect catalog entities to upstream, column, query, or job IO lineage.",
      why: "Lineage turns catalog metadata into impact analysis instead of a static inventory.",
      relatedHref: "html/data-catalog-readiness.html"
    });
  }
  if (hasIngestion && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run catalog ingestion or metadata tests in CI and upload evidence artifacts.",
      why: "Catalog metadata should be reproducible outside a developer laptop.",
      relatedHref: "html/data-catalog-readiness.html"
    });
  }

  return {
    summary: `Data catalog readiness report: catalog setup ${catalogSetups.length}개, ingestion signal ${ingestionSignals.length}개, entity signal ${entitySignals.length}개, entity metadata signal ${entityMetadataSignals.length}개, governance signal ${governanceSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Data catalog readiness OpenMetadata DataHub Amundsen metadata ingestion connector sourceConfig recipe workflow IngestionPipeline Dataset Table Column EntityReference EntityRelationship id fullyQualifiedName href version updatedAt updatedBy changeDescription deleted entityStatus extension customProperties GlossaryTerm Tag Owner Ownership Classification Domain DataProduct Search ElasticSearch OpenSearch semantic search browsePaths lineage upstreamLineage column lineage policy CI",
    catalogSetups,
    ingestionSignals,
    entitySignals,
    entityMetadataSignals,
    governanceSignals,
    searchSignals,
    lineageSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"sourceConfig|serviceConnection|connector|recipe|IngestionPipeline|metadata ingestion\" .", purpose: "Find catalog ingestion connectors, recipes, and workflow configuration." },
      { command: "rg \"Dataset|Table|Column|Dashboard|Chart|DataJob|DataFlow|CorpUser|Team|Domain|DataProduct\" .", purpose: "Find catalog entity and schema metadata evidence." },
      { command: "rg \"EntityReference|EntityRelationship|fullyQualifiedName|changeDescription|entityStatus|extension|customProperties\" .", purpose: "Find OpenMetadata entity identity, relationship, version history, and extension metadata evidence." },
      { command: "rg \"GlossaryTerm|Glossary|Tag|Classification|Ownership|Owner|policy|steward\" .", purpose: "Find ownership and governance metadata evidence." },
      { command: "rg \"ElasticSearch|OpenSearch|semantic_search|search_metadata|browsePaths|search index\" .", purpose: "Find catalog search, browse, and index evidence." },
      { command: "rg \"upstreamLineage|columnLineage|DataJobInputOutput|query lineage|impact analysis\" .", purpose: "Find lineage and impact-analysis evidence attached to catalog entities." }
    ],
    learnerNextSteps: [
      "먼저 OpenMetadata/DataHub/Amundsen 또는 custom catalog ingestion 설정이 있는지 찾으세요.",
      "Dataset/Table/Column/Dashboard/DataJob/DataFlow 같은 엔티티와 schema field가 함께 남는지 확인하세요.",
      "id, fullyQualifiedName, EntityReference, EntityRelationship, version, changeDescription, deleted, extension 같은 공통 엔티티 메타데이터가 보존되는지 확인하세요.",
      "Owner, GlossaryTerm, Tag, Classification, Domain, DataProduct, policy가 엔티티에 연결되는지 확인하세요.",
      "ElasticSearch/OpenSearch/semantic search/browsePaths/API/MCP 검색처럼 발견 가능한 색인이 있는지 확인하세요.",
      "upstreamLineage, columnLineage, DataJobInputOutput, query lineage, CI artifact로 카탈로그가 반복 생성되는지 확인하세요."
    ]
  };
}

type DataCatalogSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataCatalogSourceFiles(walk: WalkResult): Promise<DataCatalogSourceFile[]> {
  const rows: DataCatalogSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!dataCatalogInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!dataCatalogPathSignal(file.relPath) && !dataCatalogContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function dataCatalogInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|pom\.xml|build\.gradle|build\.gradle\.kts|docker-compose\.ya?ml|catalog\.ya?ml|metadata\.ya?ml|recipe\.ya?ml|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(openmetadata|open-metadata|datahub|amundsen|catalog|metadata|metastore|databuilder|glossary|classification|classifications|search|lineage)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|sql|py|java|scala|kt|go|rs)$/i.test(filePath);
}

function dataCatalogPathSignal(filePath: string): boolean {
  return /(^|\/)(openmetadata|open-metadata|datahub|amundsen|catalog|metadata|metastore|databuilder|glossary|classification|classifications|search|lineage)(\/|\.|-|_|$)/i.test(filePath)
    || /^(catalog\.ya?ml|metadata\.ya?ml|recipe\.ya?ml|workflow\.ya?ml)$/i.test(path.basename(filePath));
}

function dataCatalogContentSignal(text: string): boolean {
  return /OpenMetadata|DataHub|Amundsen|metadata ingestion|sourceConfig|serviceConnection|IngestionPipeline|MetadataChangeProposal|MetadataChangeEvent|Dataset|TableMetadata|EntityReference|EntityRelationship|fullyQualifiedName|changeDescription|entityStatus|customProperties|GlossaryTerm|Ownership|globalTags|browsePaths|upstreamLineage|SearchService|MetadataService|databuilder|Neo4j|Elasticsearch|ElasticSearch|OpenSearch/i.test(text);
}

function dataCatalogSetupsFromSources(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["catalogSetups"] {
  const rows: DataCatalogReadinessReport["catalogSetups"] = [];
  for (const source of sourceFiles) {
    const ingestionCount = countMatches(source.text, /metadata ingestion|IngestionPipeline|sourceConfig|serviceConnection|connector|recipe|workflow|pipeline|scheduler|datahub ingest|metadata ingest|databuilder|DataHubIngestionSource/gi);
    const entityCount = countMatches(source.text, /Dataset|TableMetadata|Table\b|Column\b|Dashboard|Chart|DataJob|DataFlow|CorpUser|User\b|Team|Domain|DataProduct|ResourceType/gi);
    const schemaCount = countMatches(source.text, /SchemaMetadata|schemaMetadata|schema:|fields:|Column\b|TableSchema|schemaURL|schema field/gi);
    const ownershipCount = countMatches(source.text, /Ownership|Owner|owner|steward|CorpUser|Team|DataOwner/gi);
    const glossaryCount = countMatches(source.text, /GlossaryTerm|Glossary|glossaryTerms|glossary term/gi);
    const tagCount = countMatches(source.text, /globalTags|Tag\b|tags:|Classification|Badge|classifications/gi);
    const lineageCount = countMatches(source.text, /upstreamLineage|columnLineage|DataJobInputOutput|query lineage|QueryLineage|lineage|impact analysis/gi);
    const searchCount = countMatches(source.text, /Elasticsearch|ElasticSearch|OpenSearch|SearchService|search_metadata|semantic_search|SearchIndex|browsePaths|search index|metadata API|Restful API/gi);
    const policyCount = countMatches(source.text, /Policy|policy|classification|stewardship|DataProduct|Domain/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|metadata ingest|datahub ingest|upload-artifact|catalog-report|metadata test|databuilder\.job\.job|pytest/gi);
    const totalSignals = ingestionCount + entityCount + schemaCount + ownershipCount + glossaryCount + tagCount + lineageCount + searchCount + policyCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: dataCatalogTool(source),
      ingestionCount,
      entityCount,
      schemaCount,
      ownershipCount,
      glossaryCount,
      tagCount,
      lineageCount,
      searchCount,
      policyCount,
      ciCount,
      readiness: ingestionCount > 0 && entityCount > 0 && schemaCount > 0 && (ownershipCount + glossaryCount + tagCount + policyCount) > 0 && searchCount > 0 && (lineageCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} data catalog readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.ingestionCount + b.entityCount + b.schemaCount + b.ownershipCount + b.glossaryCount + b.tagCount + b.lineageCount + b.searchCount + b.policyCount + b.ciCount) - (a.ingestionCount + a.entityCount + a.schemaCount + a.ownershipCount + a.glossaryCount + a.tagCount + a.lineageCount + a.searchCount + a.policyCount + a.ciCount))
    .slice(0, 60);
}

function dataCatalogTool(source: DataCatalogSourceFile): DataCatalogReadinessReport["catalogSetups"][number]["tool"] {
  if (/openmetadata|open-metadata/i.test(source.filePath) || /OpenMetadata|IngestionPipeline|serviceConnection|sourceConfig|DatabaseServiceProfilerPipeline|DatabaseServiceQueryLineagePipeline/i.test(source.text)) return "openmetadata";
  if (/datahub/i.test(source.filePath) || /DataHub|MetadataChangeProposal|MetadataChangeEvent|DataHubGraph|DatasetUrn|browsePaths|upstreamLineage|globalTags/i.test(source.text)) return "datahub";
  if (/amundsen/i.test(source.filePath) || /Amundsen|amundsen-databuilder|SearchService|MetadataService|TableMetadata|Neo4j|gremlin|popular_tables/i.test(source.text)) return "amundsen";
  if (/catalog|metadata|glossary|owner|lineage|search/i.test(source.filePath) || /metadata|catalog|glossary|owner|lineage|search/i.test(source.text)) return "custom";
  return "unknown";
}

function dataCatalogIngestionSignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["ingestionSignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["ingestionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "source-config", pattern: /sourceConfig|serviceConnection|DataHubIngestionSourceConfig/i, evidence: "source configuration evidence was detected." },
    { signal: "connector", pattern: /connector|source type|DatabaseService|DashboardService|serviceConnection/i, evidence: "catalog connector evidence was detected." },
    { signal: "recipe", pattern: /recipe|datahub ingest -c|source:\s*\n\s*type:|sink:\s*\n\s*type:/i, evidence: "ingestion recipe evidence was detected." },
    { signal: "workflow", pattern: /workflow|OpenMetadataWorkflowConfig|metadata ingestion workflow/i, evidence: "catalog workflow evidence was detected." },
    { signal: "pipeline", pattern: /IngestionPipeline|PipelineType|pipeline/i, evidence: "catalog pipeline evidence was detected." },
    { signal: "scheduler", pattern: /schedule|cron|Airflow|DAG|scheduler/i, evidence: "scheduled ingestion evidence was detected." },
    { signal: "profiling", pattern: /Profiler|profiling|computeTableMetrics|computeColumnMetrics/i, evidence: "profile or metric ingestion evidence was detected." },
    { signal: "usage", pattern: /QueryUsage|usage|usageStats|popular_tables/i, evidence: "usage metadata evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "ingestion", "signal");
}

function dataCatalogEntitySignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["entitySignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["entitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dataset", pattern: /Dataset|DatasetUrn|dataset_key/i, evidence: "dataset entity evidence was detected." },
    { signal: "table", pattern: /TableMetadata|Table\b|DatabaseService|tableName|DbTable/i, evidence: "table entity evidence was detected." },
    { signal: "column", pattern: /Column\b|columns:|schemaMetadata|fields:/i, evidence: "column/schema field evidence was detected." },
    { signal: "dashboard", pattern: /Dashboard|DashboardService|dashboard/i, evidence: "dashboard entity evidence was detected." },
    { signal: "chart", pattern: /Chart|chart/i, evidence: "chart entity evidence was detected." },
    { signal: "data-job", pattern: /DataJob|data job|DataJobInputOutput/i, evidence: "data job entity evidence was detected." },
    { signal: "data-flow", pattern: /DataFlow|data flow/i, evidence: "data flow entity evidence was detected." },
    { signal: "user", pattern: /CorpUser|User\b|user_id|owner/i, evidence: "user entity evidence was detected." },
    { signal: "team", pattern: /Team\b|corpGroup|group owner/i, evidence: "team/group entity evidence was detected." },
    { signal: "domain", pattern: /Domain\b|domain:/i, evidence: "domain entity evidence was detected." },
    { signal: "data-product", pattern: /DataProduct|data product/i, evidence: "data product entity evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "entity", "signal");
}

function dataCatalogEntityMetadataSignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["entityMetadataSignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["entityMetadataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "entity-id", pattern: /\bid\b|"id"|Unique identifier|entity id|fromId|toId/i, evidence: "stable entity ID evidence was detected." },
    { signal: "fully-qualified-name", pattern: /fullyQualifiedName|fromFQN|toFQN|fully qualified/i, evidence: "fully qualified name evidence was detected." },
    { signal: "entity-reference", pattern: /EntityReference|entityReference|entity reference/i, evidence: "entity reference evidence was detected." },
    { signal: "entity-relationship", pattern: /EntityRelationship|fromEntity|toEntity|entity relationship/i, evidence: "entity relationship evidence was detected." },
    { signal: "relationship-type", pattern: /relationshipType|contains|createdBy|uses|owns|upstream|parentOf|relatedTo/i, evidence: "relationship type evidence was detected." },
    { signal: "resource-href", pattern: /\bhref\b|"href"|resource link|basic\.json#\/definitions\/href/i, evidence: "resource href evidence was detected." },
    { signal: "metadata-version", pattern: /\bversion\b|"version"|entityVersion|metadata version|previousVersion/i, evidence: "metadata version evidence was detected." },
    { signal: "audit-fields", pattern: /updatedAt|updatedBy|createdAt|createdBy/i, evidence: "audit field evidence was detected." },
    { signal: "change-description", pattern: /changeDescription|fieldsAdded|fieldsUpdated|fieldsDeleted|changeSummary/i, evidence: "change description evidence was detected." },
    { signal: "soft-delete", pattern: /deleted|soft deleted|soft-delete/i, evidence: "soft-delete evidence was detected." },
    { signal: "entity-status", pattern: /entityStatus|EntityStatus/i, evidence: "entity status evidence was detected." },
    { signal: "custom-extension", pattern: /extension|customProperties|custom attributes/i, evidence: "custom extension evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "entity metadata", "signal");
}

function dataCatalogGovernanceSignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["governanceSignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "owner", pattern: /Ownership|Owner|owners:|DataOwner|CorpUser/i, evidence: "ownership evidence was detected." },
    { signal: "glossary-term", pattern: /GlossaryTerm|Glossary|glossaryTerms|termUrn/i, evidence: "glossary evidence was detected." },
    { signal: "tag", pattern: /globalTags|Tag\b|tags:|Badge/i, evidence: "tag or badge evidence was detected." },
    { signal: "classification", pattern: /Classification|classification|classifications/i, evidence: "classification evidence was detected." },
    { signal: "policy", pattern: /Policy|policy|access policy/i, evidence: "policy evidence was detected." },
    { signal: "domain", pattern: /Domain\b|domain:/i, evidence: "domain governance evidence was detected." },
    { signal: "stewardship", pattern: /steward|Steward|data steward/i, evidence: "stewardship evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "governance", "signal");
}

function dataCatalogSearchSignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["searchSignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["searchSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "elasticsearch", pattern: /Elasticsearch|ElasticSearch/i, evidence: "Elasticsearch evidence was detected." },
    { signal: "opensearch", pattern: /OpenSearch/i, evidence: "OpenSearch evidence was detected." },
    { signal: "semantic-search", pattern: /semantic_search|semantic search/i, evidence: "semantic search evidence was detected." },
    { signal: "browse-paths", pattern: /browsePaths|browse paths|browsePath/i, evidence: "browse path evidence was detected." },
    { signal: "search-index", pattern: /SearchIndex|search index|indexing/i, evidence: "search index evidence was detected." },
    { signal: "metadata-api", pattern: /MetadataService|metadata API|Restful API|DataHubGraph|OpenMetadata API/i, evidence: "metadata API evidence was detected." },
    { signal: "mcp-search", pattern: /search_metadata|MCP|mcp-search/i, evidence: "MCP metadata search evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "search", "signal");
}

function dataCatalogLineageSignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["lineageSignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["lineageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "upstream-lineage", pattern: /upstreamLineage|upstream lineage|UpstreamLineage/i, evidence: "upstream lineage evidence was detected." },
    { signal: "column-lineage", pattern: /columnLineage|column lineage|ColumnLineage/i, evidence: "column lineage evidence was detected." },
    { signal: "data-job-io", pattern: /DataJobInputOutput|DataJob|DataFlow|inputOutput/i, evidence: "data job IO evidence was detected." },
    { signal: "query-lineage", pattern: /query lineage|QueryLineage|processQueryLineage|DatabaseServiceQueryLineagePipeline/i, evidence: "query lineage evidence was detected." },
    { signal: "impact-analysis", pattern: /impact analysis|impactAnalysis|downstream impact|lineage impact/i, evidence: "impact analysis evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "lineage", "signal");
}

function dataCatalogCiSignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["ciSignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "catalog-ingestion-command", pattern: /metadata ingest|datahub ingest|databuilder\.job\.job|catalog ingest|ingestion run/i, evidence: "catalog ingestion command evidence was detected." },
    { signal: "metadata-test-command", pattern: /metadata test|pytest.*metadata|catalog test|datahub check|ingestion test/i, evidence: "metadata test command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|catalog-report|metadata-ingestion\.log|ingestion-results|metadata artifact/i, evidence: "catalog artifact upload evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function dataCatalogPackageSignals(sourceFiles: DataCatalogSourceFile[]): DataCatalogReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataCatalogReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "openmetadata", pattern: /openmetadata-ingestion|openmetadata|OpenMetadata/i, evidence: "OpenMetadata package/API evidence was detected." },
    { signal: "datahub", pattern: /acryl-datahub|datahub|DataHub/i, evidence: "DataHub package/API evidence was detected." },
    { signal: "amundsen", pattern: /amundsen-frontend|amundsen-search|amundsen-metadata|amundsen-databuilder|Amundsen/i, evidence: "Amundsen package/API evidence was detected." },
    { signal: "elasticsearch", pattern: /@elastic\/elasticsearch|elasticsearch|ElasticSearch|Elasticsearch/i, evidence: "Elasticsearch package evidence was detected." },
    { signal: "opensearch", pattern: /opensearch|OpenSearch/i, evidence: "OpenSearch package evidence was detected." },
    { signal: "neo4j", pattern: /neo4j|Neo4j|gremlinpython|gremlin/i, evidence: "Neo4j/Gremlin package evidence was detected." }
  ];
  return dataCatalogSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataCatalogSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataCatalogSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/data-catalog-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}
