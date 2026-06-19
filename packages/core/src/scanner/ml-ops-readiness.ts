import type { ExperimentTrackingReadinessReport, ModelMonitoringReadinessReport, ModelServingReadinessReport, ModelTrainingReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildExperimentTrackingReadinessReport(walk: WalkResult): Promise<ExperimentTrackingReadinessReport> {
  const sourceFiles = await experimentTrackingSourceFiles(walk);
  const experimentTrackingSetups = experimentTrackingSetupsFromSources(sourceFiles);
  const runSignals = experimentTrackingRunSignals(sourceFiles);
  const loggingSignals = experimentTrackingLoggingSignals(sourceFiles);
  const metadataSignals = experimentTrackingMetadataSignals(sourceFiles);
  const automationSignals = experimentTrackingAutomationSignals(sourceFiles);
  const storageSignals = experimentTrackingStorageSignals(sourceFiles);
  const ciSignals = experimentTrackingCiSignals(sourceFiles);
  const packageSignals = experimentTrackingPackageSignals(sourceFiles);

  const hasRuns = runSignals.filter((item) => item.readiness === "ready").length >= 3 || experimentTrackingSetups.some((item) => item.experimentCount > 0 && item.runCount > 0);
  const hasLogging = loggingSignals.filter((item) => item.readiness === "ready").length >= 3 || experimentTrackingSetups.some((item) => item.metricCount + item.paramCount + item.configCount + item.artifactCount > 0);
  const hasMetadata = metadataSignals.some((item) => item.readiness === "ready") || experimentTrackingSetups.some((item) => item.tagCount > 0);
  const hasAutomation = automationSignals.some((item) => item.readiness === "ready") || experimentTrackingSetups.some((item) => item.sweepCount > 0);
  const hasStorage = storageSignals.some((item) => item.readiness === "ready") || experimentTrackingSetups.some((item) => item.artifactCount + item.offlineSyncCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || experimentTrackingSetups.some((item) => item.ciCount > 0);

  const riskQueue: ExperimentTrackingReadinessReport["riskQueue"] = [];
  if (!hasRuns) {
    riskQueue.push({
      priority: "high",
      action: "Add experiment, run, run ID, project/entity, tracking URI, resume, or offline-mode evidence before claiming experiment tracking readiness.",
      why: "Experiment tracking needs durable run identity so learners can compare and resume training attempts.",
      relatedHref: "html/experiment-tracking-readiness.html"
    });
  }
  if (hasRuns && !hasLogging) {
    riskQueue.push({
      priority: "high",
      action: "Log metrics, params, config, summaries, artifacts, media, tables, or dataset references for each run.",
      why: "Runs without logged measurements and artifacts cannot support model comparison or reproducibility.",
      relatedHref: "html/experiment-tracking-readiness.html"
    });
  }
  if (hasRuns && !hasMetadata) {
    riskQueue.push({
      priority: "medium",
      action: "Add tags, notes, descriptions, source code, environment, dependency, or git commit metadata.",
      why: "Metadata explains why a run exists and which code/data environment produced it.",
      relatedHref: "html/experiment-tracking-readiness.html"
    });
  }
  if (hasLogging && !hasStorage) {
    riskQueue.push({
      priority: "medium",
      action: "Record tracking server, artifact store, workspace, offline sync, local cache, or remote project evidence.",
      why: "Experiment evidence should survive beyond a local process and support offline-to-online synchronization.",
      relatedHref: "html/experiment-tracking-readiness.html"
    });
  }
  if (hasLogging && !hasAutomation) {
    riskQueue.push({
      priority: "low",
      action: "Add autologging, sweeps, hyperparameter search, callbacks, reports, alerts, or launch jobs.",
      why: "Automation makes experiment tracking repeatable across many candidate runs instead of ad hoc notebooks.",
      relatedHref: "html/experiment-tracking-readiness.html"
    });
  }
  if ((hasRuns || hasLogging) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run experiment smoke commands, metrics assertions, artifact uploads, and offline sync in CI.",
      why: "Tracking instrumentation should be checked outside the local training session.",
      relatedHref: "html/experiment-tracking-readiness.html"
    });
  }

  return {
    summary: `Experiment tracking readiness report: tracking setup ${experimentTrackingSetups.length}개, run signal ${runSignals.length}개, logging signal ${loggingSignals.length}개, CI signal ${ciSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Experiment tracking readiness MLflow W&B Neptune experiment run metric param config summary artifact dataset tag tracking URI project entity sweep autolog offline sync report CI",
    experimentTrackingSetups,
    runSignals,
    loggingSignals,
    metadataSignals,
    automationSignals,
    storageSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"mlflow.set_experiment|mlflow.start_run|wandb.init|neptune.init_run|run_id|tracking_uri|project|entity\" .", purpose: "Find experiment/run identity and tracking destination evidence." },
      { command: "rg \"log_metric|log_param|wandb.log|run.summary|run\\[|append\\(|assign\\(|config|summary\" .", purpose: "Find metric, parameter, config, and summary logging evidence." },
      { command: "rg \"log_artifact|wandb.Artifact|wandb.Table|upload\\(|track_files|dataset|media|Image\" .", purpose: "Find artifact, table, media, and dataset evidence." },
      { command: "rg \"autolog|sweep|hyperparameter|callback|wandb.alert|wandb.launch|report\" .", purpose: "Find automation and report generation signals." },
      { command: "rg \"wandb sync|neptune sync|offline|upload-artifact|tracking-report|metrics.json\" .github workflows .", purpose: "Find offline sync, artifact upload, and CI smoke evidence." }
    ],
    learnerNextSteps: [
      "먼저 MLflow Tracking, W&B, Neptune 또는 custom tracking wrapper가 실험과 run identity를 만드는지 찾으세요.",
      "metric, param, config, summary, artifact, media, table, dataset이 같은 run에 기록되는지 확인하세요.",
      "tag, note, description, source code, environment, dependency, git commit metadata가 나중에 run을 해석하게 해주는지 확인하세요.",
      "autologging, sweep, hyperparameter search, callback, report, alert, launch job으로 반복 실험을 자동화하는지 확인하세요.",
      "tracking server, artifact store, workspace, offline sync/local cache, CI smoke command와 artifact upload로 재현 가능성을 확인하세요."
    ]
  };
}

type ExperimentTrackingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function experimentTrackingSourceFiles(walk: WalkResult): Promise<ExperimentTrackingSourceFile[]> {
  const rows: ExperimentTrackingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!experimentTrackingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!experimentTrackingPathSignal(file.relPath) && !experimentTrackingContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function experimentTrackingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|wandb\.ya?ml|mlflow\.ya?ml|neptune\.ya?ml|tracking\.py|train\.py|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(mlflow|wandb|weights-and-biases|weights_biases|neptune|experiment|experiments|tracking|runs|sweeps|artifacts|metrics)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|sql|py|go|java|scala|kt|rs|ipynb)$/i.test(filePath);
}

function experimentTrackingPathSignal(filePath: string): boolean {
  return /(^|\/)(mlflow|wandb|weights-and-biases|weights_biases|neptune|experiment|experiments|tracking|runs|sweeps|artifacts|metrics)(\/|\.|-|_|$)/i.test(filePath)
    || /^(wandb\.ya?ml|mlflow\.ya?ml|neptune\.ya?ml|tracking\.py|train\.py)$/i.test(path.basename(filePath));
}

function experimentTrackingContentSignal(text: string): boolean {
  return /MLflow Tracking|mlflow\.(set_tracking_uri|set_experiment|start_run|log_metric|log_param|log_artifact|autolog)|wandb\.(init|log|Artifact|Table|sweep|agent|alert|launch)|Weights & Biases|neptune\.(init_run|init_project)|run\[[^\]]+\]\.(append|upload|assign)|tracking URI|artifact store|offline sync|experiment tracking/i.test(text);
}

function experimentTrackingSetupsFromSources(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["experimentTrackingSetups"] {
  const rows: ExperimentTrackingReadinessReport["experimentTrackingSetups"] = [];
  for (const source of sourceFiles) {
    const experimentCount = countMatches(source.text, /set_experiment|experiment_name|experiment id|experiment_id|Experiment\b|wandb\.init|project=|init_run|init_project|project:/gi);
    const runCount = countMatches(source.text, /start_run|active_run|run_id|run id|wandb\.init|with wandb\.init|wandb\.run|init_run|custom_run_id|resume|run\[/gi);
    const metricCount = countMatches(source.text, /log_metric|log_metrics|wandb\.log|run\.log|metric|metrics|accuracy|auc|loss|f1|append\(/gi);
    const paramCount = countMatches(source.text, /log_param|log_params|parameter|parameters|param|hyperparameter|run\["parameters|params/gi);
    const artifactCount = countMatches(source.text, /log_artifact|log_artifacts|artifact_uri|artifact store|wandb\.Artifact|log_artifact|upload\(|track_files|File\.as_html|model artifact/gi);
    const datasetCount = countMatches(source.text, /dataset|Dataset|log_input|mlflow\.data|wandb\.Table|track_files|data version|dataframe/gi);
    const tagCount = countMatches(source.text, /set_tag|set_tags|tags=|tag|notes=|description|source_code|git_commit|environment|dependencies/gi);
    const configCount = countMatches(source.text, /config=|wandb\.config|run\.config|summary|run\.summary|settings=|mode=|project=|entity=/gi);
    const sweepCount = countMatches(source.text, /sweep|wandb\.sweep|wandb\.agent|hyperparameter search|optuna|callback|autolog|report|alert|launch/gi);
    const offlineSyncCount = countMatches(source.text, /offline|mode=["']offline|WANDB_MODE|wandb sync|neptune sync|local cache|sync\(\)|offline run/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|wandb sync|neptune sync|mlflow ui|pytest|metrics assertion|upload-artifact|tracking-report|metrics\.json/gi);
    const totalSignals = experimentCount + runCount + metricCount + paramCount + artifactCount + datasetCount + tagCount + configCount + sweepCount + offlineSyncCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: experimentTrackingTool(source),
      experimentCount,
      runCount,
      metricCount,
      paramCount,
      artifactCount,
      datasetCount,
      tagCount,
      configCount,
      sweepCount,
      offlineSyncCount,
      ciCount,
      readiness: experimentCount > 0 && runCount > 0 && metricCount > 0 && (paramCount + configCount) > 0 && artifactCount > 0 && (tagCount + datasetCount) > 0 && (offlineSyncCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} experiment tracking readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.experimentCount + b.runCount + b.metricCount + b.paramCount + b.artifactCount + b.datasetCount + b.tagCount + b.configCount + b.sweepCount + b.offlineSyncCount + b.ciCount) - (a.experimentCount + a.runCount + a.metricCount + a.paramCount + a.artifactCount + a.datasetCount + a.tagCount + a.configCount + a.sweepCount + a.offlineSyncCount + a.ciCount))
    .slice(0, 60);
}

function experimentTrackingTool(source: ExperimentTrackingSourceFile): ExperimentTrackingReadinessReport["experimentTrackingSetups"][number]["tool"] {
  if (/neptune/i.test(source.filePath) || /neptune\.(init_run|init_project)|Neptune|run\[[^\]]+\]\.(append|upload|assign)|neptune sync/i.test(source.text)) return "neptune";
  if (/wandb|weights/i.test(source.filePath) || /wandb\.(init|log|Artifact|Table|sweep|agent|alert|launch)|Weights & Biases|WANDB_MODE|wandb sync/i.test(source.text)) return "wandb";
  if (/mlflow/i.test(source.filePath) || /MLflow|mlflow\.(set_tracking_uri|set_experiment|start_run|log_metric|log_param|log_artifact|autolog)/i.test(source.text)) return "mlflow";
  if (/experiment|tracking|runs|metrics/i.test(source.filePath) || /experiment tracking|run id|metric logging|artifact store/i.test(source.text)) return "custom";
  return "unknown";
}

function experimentTrackingRunSignals(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["runSignals"] {
  const specs: Array<{ signal: ExperimentTrackingReadinessReport["runSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "experiment", pattern: /set_experiment|experiment_name|experiment_id|Experiment\b|project=/i, evidence: "experiment/project evidence was detected." },
    { signal: "run", pattern: /start_run|active_run|wandb\.init|with wandb\.init|init_run|run\[/i, evidence: "run creation evidence was detected." },
    { signal: "run-id", pattern: /run_id|run id|custom_run_id|WANDB_RUN_ID|id=/i, evidence: "run ID evidence was detected." },
    { signal: "project", pattern: /project=|project:|NEPTUNE_PROJECT|wandb project/i, evidence: "project evidence was detected." },
    { signal: "entity", pattern: /entity=|team|workspace|WANDB_ENTITY|workspace\/project/i, evidence: "entity/workspace evidence was detected." },
    { signal: "tracking-uri", pattern: /set_tracking_uri|tracking URI|tracking_uri|MLFLOW_TRACKING_URI|tracking server/i, evidence: "tracking URI evidence was detected." },
    { signal: "resume", pattern: /resume|resume_from|custom_run_id|allow|must|auto/i, evidence: "run resume evidence was detected." },
    { signal: "offline", pattern: /offline|mode=["']offline|WANDB_MODE|NEPTUNE_MODE|offline run/i, evidence: "offline mode evidence was detected." }
  ];
  return experimentTrackingSignalFromSpecs(sourceFiles, specs, "run", "signal");
}

function experimentTrackingLoggingSignals(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["loggingSignals"] {
  const specs: Array<{ signal: ExperimentTrackingReadinessReport["loggingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metric", pattern: /log_metric|log_metrics|wandb\.log|run\.log|metric|accuracy|auc|loss|append\(/i, evidence: "metric logging evidence was detected." },
    { signal: "param", pattern: /log_param|log_params|parameter|parameters|hyperparameter|params/i, evidence: "parameter logging evidence was detected." },
    { signal: "config", pattern: /config=|wandb\.config|run\.config|settings=|OmegaConf|Hydra/i, evidence: "config logging evidence was detected." },
    { signal: "summary", pattern: /summary|run\.summary|wandb\.summary|final metric|best_/i, evidence: "summary logging evidence was detected." },
    { signal: "artifact", pattern: /log_artifact|wandb\.Artifact|artifact_uri|artifact store|upload\(|model artifact/i, evidence: "artifact logging evidence was detected." },
    { signal: "media", pattern: /wandb\.Image|wandb\.Video|wandb\.Audio|media|plot|figure/i, evidence: "media logging evidence was detected." },
    { signal: "table", pattern: /wandb\.Table|log_table|table|DataFrame|dataframe/i, evidence: "table logging evidence was detected." },
    { signal: "dataset", pattern: /dataset|Dataset|track_files|log_input|data version/i, evidence: "dataset logging evidence was detected." }
  ];
  return experimentTrackingSignalFromSpecs(sourceFiles, specs, "logging", "signal");
}

function experimentTrackingMetadataSignals(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["metadataSignals"] {
  const specs: Array<{ signal: ExperimentTrackingReadinessReport["metadataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tag", pattern: /set_tag|set_tags|tags=|sys\/tags|tag/i, evidence: "tag metadata evidence was detected." },
    { signal: "note", pattern: /notes=|note|markdown|comment/i, evidence: "note metadata evidence was detected." },
    { signal: "description", pattern: /description|desc|run purpose/i, evidence: "description metadata evidence was detected." },
    { signal: "source-code", pattern: /source_code|source code|code_path|save_code|git diff/i, evidence: "source code metadata evidence was detected." },
    { signal: "environment", pattern: /environment|conda|python_version|docker|runtime|system metrics/i, evidence: "environment metadata evidence was detected." },
    { signal: "dependency", pattern: /dependencies|requirements|pip freeze|conda env|packages/i, evidence: "dependency metadata evidence was detected." },
    { signal: "git-commit", pattern: /git_commit|commit_hash|GITHUB_SHA|source version|revision/i, evidence: "git commit metadata evidence was detected." }
  ];
  return experimentTrackingSignalFromSpecs(sourceFiles, specs, "metadata", "signal");
}

function experimentTrackingAutomationSignals(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["automationSignals"] {
  const specs: Array<{ signal: ExperimentTrackingReadinessReport["automationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "autolog", pattern: /autolog|mlflow\.autolog|openai\.autolog|sklearn\.autolog/i, evidence: "autologging evidence was detected." },
    { signal: "sweep", pattern: /wandb\.sweep|sweep_id|sweep config|sweep:/i, evidence: "sweep evidence was detected." },
    { signal: "hyperparameter-search", pattern: /hyperparameter search|optuna|ray tune|grid search|random search|bayesian/i, evidence: "hyperparameter search evidence was detected." },
    { signal: "callback", pattern: /callback|WandbCallback|MLflowCallback|NeptuneCallback|TrainerCallback/i, evidence: "tracking callback evidence was detected." },
    { signal: "report", pattern: /report|wandb\.Api|workspace report|experiment report|tracking-report/i, evidence: "report evidence was detected." },
    { signal: "alert", pattern: /wandb\.alert|alert|notification/i, evidence: "alert evidence was detected." },
    { signal: "launch-job", pattern: /wandb\.launch|launch job|queued run|agent job/i, evidence: "launch job evidence was detected." }
  ];
  return experimentTrackingSignalFromSpecs(sourceFiles, specs, "automation", "signal");
}

function experimentTrackingStorageSignals(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["storageSignals"] {
  const specs: Array<{ signal: ExperimentTrackingReadinessReport["storageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tracking-server", pattern: /tracking server|MLFLOW_TRACKING_URI|set_tracking_uri|localhost:5000|databricks/i, evidence: "tracking server evidence was detected." },
    { signal: "artifact-store", pattern: /artifact store|artifact_uri|S3|GCS|Azure Blob|MinIO|wandb\.Artifact/i, evidence: "artifact store evidence was detected." },
    { signal: "workspace", pattern: /workspace|entity|team|project workspace|neptune workspace/i, evidence: "workspace evidence was detected." },
    { signal: "offline-sync", pattern: /wandb sync|neptune sync|offline sync|sync offline|sync\(\)/i, evidence: "offline sync evidence was detected." },
    { signal: "local-cache", pattern: /local cache|\.wandb|offline-run|neptune-offline|cache directory|WANDB_DIR/i, evidence: "local cache evidence was detected." },
    { signal: "remote-project", pattern: /remote project|wandb\.ai|app\.neptune\.ai|tracking URI|remote tracking/i, evidence: "remote project evidence was detected." }
  ];
  return experimentTrackingSignalFromSpecs(sourceFiles, specs, "storage", "signal");
}

function experimentTrackingCiSignals(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ExperimentTrackingReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "experiment-smoke-command", pattern: /python .*train|mlflow run|wandb agent|neptune.*run|pytest .*experiment|tracking smoke/i, evidence: "experiment smoke command evidence was detected." },
    { signal: "metrics-assertion-command", pattern: /metrics assertion|assert .*metric|pytest|jq .*metrics|compare metrics/i, evidence: "metrics assertion command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|tracking-report|metrics\.json|wandb-media|mlruns|neptune-offline/i, evidence: "tracking artifact upload evidence was detected." },
    { signal: "offline-sync-command", pattern: /wandb sync|neptune sync|offline-run|sync offline/i, evidence: "offline sync command evidence was detected." }
  ];
  return experimentTrackingSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function experimentTrackingPackageSignals(sourceFiles: ExperimentTrackingSourceFile[]): ExperimentTrackingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ExperimentTrackingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mlflow", pattern: /mlflow|MLflow Tracking|mlflow\.(start_run|log_metric|autolog)/i, evidence: "MLflow tracking package/API evidence was detected." },
    { signal: "wandb", pattern: /wandb|Weights & Biases|WANDB_|wandb\.(init|log|Artifact)/i, evidence: "W&B package/API evidence was detected." },
    { signal: "neptune", pattern: /neptune|Neptune|NEPTUNE_|neptune\.(init_run|init_project)/i, evidence: "Neptune package/API evidence was detected." },
    { signal: "tensorboard", pattern: /tensorboard|SummaryWriter|add_scalar|add_histogram/i, evidence: "TensorBoard tracking evidence was detected." },
    { signal: "custom", pattern: /experiment tracking|tracking client|run logger|metrics logger/i, evidence: "custom tracking evidence was detected." }
  ];
  return experimentTrackingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function experimentTrackingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ExperimentTrackingSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/experiment-tracking-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildModelMonitoringReadinessReport(walk: WalkResult): Promise<ModelMonitoringReadinessReport> {
  const sourceFiles = await modelMonitoringSourceFiles(walk);
  const modelMonitoringSetups = modelMonitoringSetupsFromSources(sourceFiles);
  const datasetSignals = modelMonitoringDatasetSignals(sourceFiles);
  const driftSignals = modelMonitoringDriftSignals(sourceFiles);
  const qualitySignals = modelMonitoringQualitySignals(sourceFiles);
  const performanceSignals = modelMonitoringPerformanceSignals(sourceFiles);
  const reportingSignals = modelMonitoringReportingSignals(sourceFiles);
  const alertSignals = modelMonitoringAlertSignals(sourceFiles);
  const ciSignals = modelMonitoringCiSignals(sourceFiles);
  const packageSignals = modelMonitoringPackageSignals(sourceFiles);

  const hasDataset = datasetSignals.filter((item) => item.readiness === "ready").length >= 4 || modelMonitoringSetups.some((item) => item.referenceCount > 0 && item.currentCount > 0);
  const hasDrift = driftSignals.filter((item) => item.readiness === "ready").length >= 2 || modelMonitoringSetups.some((item) => item.driftCount > 0);
  const hasQuality = qualitySignals.filter((item) => item.readiness === "ready").length >= 2 || modelMonitoringSetups.some((item) => item.qualityCount > 0);
  const hasPerformance = performanceSignals.filter((item) => item.readiness === "ready").length >= 2 || modelMonitoringSetups.some((item) => item.performanceCount > 0);
  const hasReporting = reportingSignals.filter((item) => item.readiness === "ready").length >= 2 || modelMonitoringSetups.some((item) => item.reportCount > 0);
  const hasAlerts = alertSignals.filter((item) => item.readiness === "ready").length >= 2 || modelMonitoringSetups.some((item) => item.alertCount + item.scheduleCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || modelMonitoringSetups.some((item) => item.ciCount > 0);

  const riskQueue: ModelMonitoringReadinessReport["riskQueue"] = [];
  if (!hasDataset) {
    riskQueue.push({
      priority: "high",
      action: "Add reference/current or reference/analysis data slices plus prediction, target, schema, segment, or timestamp columns.",
      why: "Model monitoring cannot separate baseline behavior from live behavior without explicit data periods and model-output columns.",
      relatedHref: "html/model-monitoring-readiness.html"
    });
  }
  if (hasDataset && !hasDrift) {
    riskQueue.push({
      priority: "high",
      action: "Add data, prediction, target, concept, univariate, or multivariate drift checks.",
      why: "Monitoring is incomplete if it records data but never evaluates distribution or behavior changes.",
      relatedHref: "html/model-monitoring-readiness.html"
    });
  }
  if (hasDrift && !hasQuality) {
    riskQueue.push({
      priority: "medium",
      action: "Add missing-value, outlier, data-quality, schema-validation, constraint, or validator checks.",
      why: "Drift findings are harder to trust when schema and input-quality regressions are not tracked separately.",
      relatedHref: "html/model-monitoring-readiness.html"
    });
  }
  if (hasDrift && !hasPerformance) {
    riskQueue.push({
      priority: "medium",
      action: "Add classification, regression, estimated-performance, realized-performance, or threshold evidence.",
      why: "Operational monitoring should connect drift to model performance impact, especially when labels arrive late.",
      relatedHref: "html/model-monitoring-readiness.html"
    });
  }
  if ((hasDrift || hasPerformance) && !hasReporting) {
    riskQueue.push({
      priority: "medium",
      action: "Persist monitoring reports, test suites, dashboards, snapshots, workspaces, or exported artifacts.",
      why: "Monitoring evidence needs a durable report surface for learner review and CI artifacts.",
      relatedHref: "html/model-monitoring-readiness.html"
    });
  }
  if (hasReporting && !hasAlerts) {
    riskQueue.push({
      priority: "low",
      action: "Add alert, threshold, notification, monitor, or schedule evidence.",
      why: "Reports are useful for audits, but monitoring should also flag abnormal drift or performance changes.",
      relatedHref: "html/model-monitoring-readiness.html"
    });
  }
  if ((hasReporting || hasAlerts) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run monitoring smoke commands, drift tests, threshold assertions, and report uploads in CI.",
      why: "Monitoring instrumentation should be checked automatically instead of only during ad hoc notebooks.",
      relatedHref: "html/model-monitoring-readiness.html"
    });
  }

  return {
    summary: `Model monitoring readiness report: monitoring setup ${modelMonitoringSetups.length}개, drift signal ${driftSignals.length}개, quality signal ${qualitySignals.length}개, CI signal ${ciSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Model monitoring readiness Evidently whylogs WhyLabs NannyML reference current analysis drift data quality performance report dashboard snapshot alert threshold CI",
    modelMonitoringSetups,
    datasetSignals,
    driftSignals,
    qualitySignals,
    performanceSignals,
    reportingSignals,
    alertSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"reference_data|current_data|analysis_df|reference period|prediction|target|timestamp|segment\" .", purpose: "Find baseline/live data slices and monitored model-output columns." },
      { command: "rg \"DataDriftPreset|ColumnDriftMetric|UnivariateDriftCalculator|DataReconstructionDriftCalculator|target distribution|concept drift\" .", purpose: "Find drift detection evidence across data, prediction, target, and concept signals." },
      { command: "rg \"DataQualityPreset|missing|outlier|DatasetSchema|constraints|Validator|Condition\" .", purpose: "Find data-quality, schema, constraint, and validator evidence." },
      { command: "rg \"CBPE|DLE|PerformanceCalculator|ClassificationPreset|RegressionPreset|realized performance|estimated performance|threshold\" .", purpose: "Find monitored model-performance and threshold evidence." },
      { command: "rg \"monitoring-report|drift-report|snapshot|dashboard|upload-artifact|pytest .*drift|jq .*threshold\" .github workflows .", purpose: "Find report persistence, CI drift tests, and threshold assertion evidence." }
    ],
    learnerNextSteps: [
      "먼저 reference/current 또는 reference/analysis 데이터가 분리되어 있고 prediction, target, timestamp, segment 정보가 있는지 확인하세요.",
      "Evidently, whylogs/WhyLabs, NannyML 또는 custom monitoring 코드가 data/prediction/target/concept drift를 계산하는지 확인하세요.",
      "missing value, outlier, schema validation, constraints, validators 같은 data quality gate가 drift와 분리되어 있는지 확인하세요.",
      "classification/regression metric, CBPE/DLE 같은 estimated performance, realized performance, threshold/alert가 연결되는지 확인하세요.",
      "report, test suite, dashboard, snapshot, workspace, export artifact와 CI smoke/drift/threshold command가 남는지 확인하세요."
    ]
  };
}

type ModelMonitoringSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function modelMonitoringSourceFiles(walk: WalkResult): Promise<ModelMonitoringSourceFile[]> {
  const rows: ModelMonitoringSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!modelMonitoringInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!modelMonitoringPathSignal(file.relPath) && !modelMonitoringContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 260);
}

function modelMonitoringInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|monitoring\.py|monitor\.py|drift\.py|quality\.py|performance\.py|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(evidently|whylogs|whylabs|nannyml|monitoring|monitor|drift|quality|performance|alerts|reports|model-monitoring)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|rst|sql|py|go|java|scala|kt|rs|ipynb)$/i.test(filePath);
}

function modelMonitoringPathSignal(filePath: string): boolean {
  return /(^|\/)(evidently|whylogs|whylabs|nannyml|monitoring|monitor|drift|quality|performance|alerts|reports|model-monitoring)(\/|\.|-|_|$)/i.test(filePath)
    || /^(monitoring\.py|monitor\.py|drift\.py|quality\.py|performance\.py)$/i.test(path.basename(filePath));
}

function modelMonitoringContentSignal(text: string): boolean {
  return /Evidently|DataDriftPreset|DatasetDriftMetric|ColumnDriftMetric|why\.log|DatasetProfileView|WhyLabs|NannyML|CBPE|DLE|UnivariateDriftCalculator|DataReconstructionDriftCalculator|PerformanceCalculator|reference_data|current_data|analysis_df|concept drift|model monitoring|data drift|prediction drift/i.test(text);
}

function modelMonitoringSetupsFromSources(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["modelMonitoringSetups"] {
  const rows: ModelMonitoringReadinessReport["modelMonitoringSetups"] = [];
  for (const source of sourceFiles) {
    const referenceCount = countMatches(source.text, /reference_data|reference data|reference_df|reference period|baseline|ref_data|fit\(\s*reference|adult_ref|evi_ref_data/gi);
    const currentCount = countMatches(source.text, /current_data|current data|current_df|analysis_df|analysis data|analysis period|production|prod_data|run\([^,\n]+,\s*(?:current|analysis|prod)/gi);
    const driftCount = countMatches(source.text, /DataDriftPreset|DatasetDriftMetric|ColumnDriftMetric|ColumnDataDrift|drift|UnivariateDriftCalculator|DataReconstructionDriftCalculator|DomainClassifier|TargetDistributionCalculator|concept drift|training-serving skew/gi);
    const qualityCount = countMatches(source.text, /DataQualityPreset|data quality|missing values?|missing_count|outlier|unseen value|schema validation|DatasetSchema|ColumnSchema|constraints?|Validator|Condition/gi);
    const performanceCount = countMatches(source.text, /ClassificationPreset|RegressionPreset|ModelQuality|PerformanceCalculator|CBPE|DLE|Confidence-Based Performance|performance estimation|realized performance|estimated performance|metric|roc_auc|accuracy|f1|mae|rmse/gi);
    const reportCount = countMatches(source.text, /Report\(|TestSuite|report\.run|snapshot|dashboard|workspace|save_html|as_html|json\(|to_json|writer\(|upload|monitoring-report|drift-report/gi);
    const alertCount = countMatches(source.text, /alert|threshold|upper_threshold|lower_threshold|notification|monitor|abnormal|failed test|raise_alert/gi);
    const scheduleCount = countMatches(source.text, /schedule|cron|workflow_dispatch|on:\s*\[|daily|hourly|monitoring job|scheduled/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|uses: actions\/|pytest .*drift|monitoring smoke|drift test|threshold assertion|upload-artifact|monitoring-report|drift-report|jq .*threshold/gi);
    const totalSignals = referenceCount + currentCount + driftCount + qualityCount + performanceCount + reportCount + alertCount + scheduleCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: modelMonitoringTool(source),
      referenceCount,
      currentCount,
      driftCount,
      qualityCount,
      performanceCount,
      reportCount,
      alertCount,
      scheduleCount,
      ciCount,
      readiness: referenceCount > 0 && currentCount > 0 && driftCount > 0 && qualityCount > 0 && performanceCount > 0 && reportCount > 0 && (alertCount + scheduleCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} model monitoring readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.referenceCount + b.currentCount + b.driftCount + b.qualityCount + b.performanceCount + b.reportCount + b.alertCount + b.scheduleCount + b.ciCount) - (a.referenceCount + a.currentCount + a.driftCount + a.qualityCount + a.performanceCount + a.reportCount + a.alertCount + a.scheduleCount + a.ciCount))
    .slice(0, 70);
}

function modelMonitoringTool(source: ModelMonitoringSourceFile): ModelMonitoringReadinessReport["modelMonitoringSetups"][number]["tool"] {
  if (/nannyml/i.test(source.filePath) || /NannyML|CBPE|DLE|UnivariateDriftCalculator|DataReconstructionDriftCalculator|PerformanceCalculator/i.test(source.text)) return "nannyml";
  if (/whylogs|whylabs/i.test(source.filePath) || /why\.log|DatasetProfileView|WhyLabs|DatasetSchema|ColumnSchema|constraints?|Validator|Condition/i.test(source.text)) return "whylogs";
  if (/evidently/i.test(source.filePath) || /Evidently|DataDriftPreset|ColumnDriftMetric|DatasetDriftMetric|Report\(|TestSuite|DataQualityPreset|ClassificationPreset|RegressionPreset/i.test(source.text)) return "evidently";
  if (/monitoring|monitor|drift|quality|performance|alerts/i.test(source.filePath) || /model monitoring|data drift|prediction drift|monitoring report/i.test(source.text)) return "custom";
  return "unknown";
}

function modelMonitoringDatasetSignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["datasetSignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["datasetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "reference-data", pattern: /reference_data|reference data|reference_df|reference period|baseline|fit\(\s*reference/i, evidence: "reference data evidence was detected." },
    { signal: "current-data", pattern: /current_data|current data|current_df|production|prod_data|report\.run\([^,\n]+,\s*current/i, evidence: "current/live data evidence was detected." },
    { signal: "analysis-data", pattern: /analysis_df|analysis data|analysis period|calculate\(\s*analysis/i, evidence: "analysis-period data evidence was detected." },
    { signal: "column-schema", pattern: /ColumnMapping|column_mapping|DatasetSchema|ColumnSchema|schema|column_names|feature_column_names|features=/i, evidence: "column schema evidence was detected." },
    { signal: "prediction-column", pattern: /prediction|predicted|y_pred|y_pred_proba|prediction_column|model output|model_output/i, evidence: "prediction column evidence was detected." },
    { signal: "target-column", pattern: /target|y_true|actual|ground_truth|target_column|label/i, evidence: "target/label column evidence was detected." },
    { signal: "segment", pattern: /segment|segmentation|partition|slice|chunk|groupby|chunk_size/i, evidence: "segment/chunk evidence was detected." },
    { signal: "timestamp", pattern: /timestamp|time_column|timestamp_column_name|data_timestamp|created_at|datetime/i, evidence: "timestamp evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "dataset", "signal");
}

function modelMonitoringDriftSignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["driftSignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["driftSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "data-drift", pattern: /DataDriftPreset|DatasetDriftMetric|ColumnDriftMetric|ColumnDataDrift|data drift|dataset drift/i, evidence: "data drift evidence was detected." },
    { signal: "prediction-drift", pattern: /prediction drift|model output drift|output drift|predicted.*drift|y_pred.*drift/i, evidence: "prediction drift evidence was detected." },
    { signal: "target-drift", pattern: /target.*drift|TargetDistributionCalculator|target distribution|label.*drift/i, evidence: "target drift evidence was detected." },
    { signal: "concept-drift", pattern: /concept drift|performance degradation|training-serving skew|serving skew/i, evidence: "concept drift evidence was detected." },
    { signal: "univariate-drift", pattern: /UnivariateDriftCalculator|univariate|KS test|Hellinger|Wasserstein|Jensen-Shannon/i, evidence: "univariate drift evidence was detected." },
    { signal: "multivariate-drift", pattern: /DataReconstructionDriftCalculator|multivariate|reconstruction error|DomainClassifier|PCA/i, evidence: "multivariate drift evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "drift", "signal");
}

function modelMonitoringQualitySignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["qualitySignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "missing-values", pattern: /missing values?|missing_count|null_count|nan|isnull|not_null/i, evidence: "missing-value evidence was detected." },
    { signal: "outliers", pattern: /outlier|out of range|range check|unexpected value|unseen value/i, evidence: "outlier/unseen-value evidence was detected." },
    { signal: "data-quality", pattern: /DataQualityPreset|data quality|quality metric|quality check|DataQuality/i, evidence: "data quality evidence was detected." },
    { signal: "schema-validation", pattern: /schema validation|DatasetSchema|ColumnSchema|ColumnMapping|schema|type check|column type/i, evidence: "schema validation evidence was detected." },
    { signal: "constraints", pattern: /constraints?|SummaryConstraint|ValueConstraint|threshold constraint|expectation/i, evidence: "constraint evidence was detected." },
    { signal: "validators", pattern: /Validator|Condition|validation result|test preset|TestSuite|validate/i, evidence: "validator evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "quality", "signal");
}

function modelMonitoringPerformanceSignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["performanceSignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["performanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "classification", pattern: /ClassificationPreset|classification|roc_auc|average_precision|precision|recall|f1|accuracy/i, evidence: "classification performance evidence was detected." },
    { signal: "regression", pattern: /RegressionPreset|regression|rmse|mae|mape|r2|mean absolute/i, evidence: "regression performance evidence was detected." },
    { signal: "estimated-performance", pattern: /CBPE|DLE|Confidence-Based Performance|Direct Loss Estimation|performance estimation|estimated performance/i, evidence: "estimated performance evidence was detected." },
    { signal: "realized-performance", pattern: /PerformanceCalculator|realized performance|actual performance|y_true|target values|delayed target/i, evidence: "realized performance evidence was detected." },
    { signal: "threshold", pattern: /threshold|upper_threshold|lower_threshold|ConstantThreshold|StandardDeviationThreshold|alert flag/i, evidence: "performance threshold evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "performance", "signal");
}

function modelMonitoringReportingSignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["reportingSignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["reportingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "report", pattern: /Report\(|report\.run|monitoring-report|drift-report|as_report|report json/i, evidence: "report evidence was detected." },
    { signal: "test-suite", pattern: /TestSuite|TestPreset|DataDriftTestPreset|test_report|failed test|suite/i, evidence: "test-suite evidence was detected." },
    { signal: "dashboard", pattern: /dashboard|Dashboard|panel|plot\(|visualize|charts?/i, evidence: "dashboard/visualization evidence was detected." },
    { signal: "snapshot", pattern: /snapshot|Snapshot|add_snapshot|load_model|profile view|DatasetProfileView/i, evidence: "snapshot/profile evidence was detected." },
    { signal: "workspace", pattern: /workspace|Workspace|project\.id|WhyLabs|remote project|monitoring workspace/i, evidence: "workspace evidence was detected." },
    { signal: "export", pattern: /save_html|as_html|to_json|json\(|export|writer\(|upload|upload-artifact/i, evidence: "export evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "reporting", "signal");
}

function modelMonitoringAlertSignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["alertSignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["alertSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "alert", pattern: /alert|alerts?|raise_alert|failed test|abnormal/i, evidence: "alert evidence was detected." },
    { signal: "threshold", pattern: /threshold|upper_threshold|lower_threshold|thresholds|threshold assertion/i, evidence: "threshold evidence was detected." },
    { signal: "notification", pattern: /notification|notify|slack|email|webhook|pager/i, evidence: "notification evidence was detected." },
    { signal: "monitor", pattern: /monitoring|monitor|monitoring job|model monitor/i, evidence: "monitor evidence was detected." },
    { signal: "schedule", pattern: /schedule|cron|workflow_dispatch|daily|hourly|on:\s*\[|scheduled/i, evidence: "schedule evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "alert", "signal");
}

function modelMonitoringCiSignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "monitoring-smoke-command", pattern: /python .*monitor|python .*drift|monitoring smoke|model monitor|nannyml|evidently|whylogs/i, evidence: "monitoring smoke command evidence was detected." },
    { signal: "drift-test-command", pattern: /pytest .*drift|drift test|DataDriftTestPreset|test.*drift|--drift-test/i, evidence: "drift test command evidence was detected." },
    { signal: "report-upload", pattern: /upload-artifact|monitoring-report|drift-report|profile\.bin|snapshot|dashboard|nannyml-results/i, evidence: "report upload evidence was detected." },
    { signal: "threshold-assertion-command", pattern: /threshold assertion|jq .*threshold|jq .*drift|assert .*threshold|assert .*drift/i, evidence: "threshold assertion command evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function modelMonitoringPackageSignals(sourceFiles: ModelMonitoringSourceFile[]): ModelMonitoringReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ModelMonitoringReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "evidently", pattern: /evidently|Evidently|DataDriftPreset|Report\(|ColumnDriftMetric/i, evidence: "Evidently package/API evidence was detected." },
    { signal: "whylogs", pattern: /whylogs|why\.log|DatasetProfileView|DatasetSchema|ColumnSchema/i, evidence: "whylogs package/API evidence was detected." },
    { signal: "whylabs", pattern: /whylabs|WhyLabs|WhyLabsWriter|writer\(["']whylabs["']\)/i, evidence: "WhyLabs package/API evidence was detected." },
    { signal: "nannyml", pattern: /nannyml|NannyML|CBPE|DLE|UnivariateDriftCalculator|PerformanceCalculator/i, evidence: "NannyML package/API evidence was detected." },
    { signal: "custom", pattern: /model monitoring|monitoring report|drift report|monitoring client|drift detector/i, evidence: "custom monitoring evidence was detected." }
  ];
  return modelMonitoringSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function modelMonitoringSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ModelMonitoringSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/model-monitoring-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildModelServingReadinessReport(walk: WalkResult): Promise<ModelServingReadinessReport> {
  const sourceFiles = await modelServingSourceFiles(walk);
  const modelServingSetups = modelServingSetupsFromSources(sourceFiles);
  const platformSignals = modelServingPlatformSignals(sourceFiles);
  const runtimeSignals = modelServingRuntimeSignals(sourceFiles);
  const protocolSignals = modelServingProtocolSignals(sourceFiles);
  const routingSignals = modelServingRoutingSignals(sourceFiles);
  const scalingSignals = modelServingScalingSignals(sourceFiles);
  const healthSignals = modelServingHealthSignals(sourceFiles);
  const resourceSignals = modelServingResourceSignals(sourceFiles);
  const observabilitySignals = modelServingObservabilitySignals(sourceFiles);
  const ciSignals = modelServingCiSignals(sourceFiles);
  const packageSignals = modelServingPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.filter((item) => item.readiness === "ready").length >= 2 || modelServingSetups.some((item) => item.inferenceServiceCount > 0);
  const hasRuntime = runtimeSignals.filter((item) => item.readiness === "ready").length >= 3 || modelServingSetups.some((item) => item.runtimeCount > 0);
  const hasRepository = platformSignals.some((item) => item.signal === "model-repository" && item.readiness === "ready") || modelServingSetups.some((item) => item.modelRepositoryCount > 0);
  const hasProtocol = protocolSignals.filter((item) => item.readiness === "ready").length >= 2 || modelServingSetups.some((item) => item.protocolCount > 0);
  const hasRouting = routingSignals.some((item) => item.readiness === "ready") || modelServingSetups.some((item) => item.routingCount > 0);
  const hasScaling = scalingSignals.filter((item) => item.readiness === "ready").length >= 2 || modelServingSetups.some((item) => item.autoscalingCount > 0);
  const hasHealth = healthSignals.filter((item) => item.readiness === "ready").length >= 2 || modelServingSetups.some((item) => item.healthCount > 0);
  const hasResources = resourceSignals.filter((item) => item.readiness === "ready").length >= 3 || modelServingSetups.some((item) => item.resourceCount > 0);
  const hasObservability = observabilitySignals.filter((item) => item.readiness === "ready").length >= 2 || modelServingSetups.some((item) => item.observabilityCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || modelServingSetups.some((item) => item.ciCount > 0);

  const riskQueue: ModelServingReadinessReport["riskQueue"] = [];
  if (!hasPlatform) {
    riskQueue.push({
      priority: "high",
      action: "Add KServe InferenceService, SeldonDeployment, Triton server, Bento service, or custom model-server evidence before claiming serving readiness.",
      why: "Model serving readiness needs a concrete online inference platform or service boundary, not only registered artifacts.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if (hasPlatform && !hasRuntime) {
    riskQueue.push({
      priority: "high",
      action: "Record predictor, transformer, explainer, backend, model format, GPU, or batching runtime configuration.",
      why: "Inference services are not reproducible if the serving runtime, backend, and batching model are implicit.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if (hasPlatform && !hasRepository) {
    riskQueue.push({
      priority: "high",
      action: "Record storage URI, model URI, model repository path, config.pbtxt, PVC, S3, GCS, or equivalent model artifact location.",
      why: "A serving endpoint cannot be rebuilt reliably without a durable model repository or artifact pointer.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if (hasRuntime && !hasProtocol) {
    riskQueue.push({
      priority: "medium",
      action: "Document REST, gRPC, V2 protocol, health, predict, or metadata endpoint contracts.",
      why: "Learners need protocol evidence to understand how clients call the serving endpoint.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if (hasRuntime && !hasHealth) {
    riskQueue.push({
      priority: "medium",
      action: "Add readiness, liveness, startup, /health, /v2/health/ready, or ModelReady checks.",
      why: "Serving systems need explicit health checks so deploys and smoke tests can fail before bad endpoints receive traffic.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if (hasRuntime && !hasScaling) {
    riskQueue.push({
      priority: "medium",
      action: "Add autoscaling, min/max replicas, scale-to-zero, HPA, or concurrency settings.",
      why: "Production inference behavior depends on replica and concurrency controls under changing load.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if (hasRuntime && !hasRouting) {
    riskQueue.push({
      priority: "low",
      action: "Add canary, traffic split, shadow, inference graph, gateway, or load-balancing evidence.",
      why: "Serving readiness should show how traffic is routed during rollout and fallback scenarios.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if (hasRuntime && !hasResources) {
    riskQueue.push({
      priority: "low",
      action: "Record CPU, memory, GPU, node selector, toleration, service account, storage URI, or secret resource settings.",
      why: "Serving runtimes need resource and identity constraints to be repeatable across clusters.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if ((hasProtocol || hasHealth) && !hasObservability) {
    riskQueue.push({
      priority: "low",
      action: "Add metrics, logging, tracing, Prometheus, access log, or request ID evidence.",
      why: "Online inference needs request-level observability for incident response and model-performance diagnosis.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }
  if ((hasHealth || hasScaling || hasRouting) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run manifest apply, deployment rollout, inference smoke, health check, and artifact upload commands in CI.",
      why: "Serving readiness should be checked automatically before learner-facing reports trust an endpoint configuration.",
      relatedHref: "html/model-serving-readiness.html"
    });
  }

  return {
    summary: `Model serving readiness report: serving setup ${modelServingSetups.length}개, platform signal ${platformSignals.length}개, protocol signal ${protocolSignals.length}개, health signal ${healthSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Model serving readiness KServe Seldon Triton InferenceService ServingRuntime SeldonDeployment tritonserver model repository REST gRPC autoscaling health probes routing CI",
    modelServingSetups,
    platformSignals,
    runtimeSignals,
    protocolSignals,
    routingSignals,
    scalingSignals,
    healthSignals,
    resourceSignals,
    observabilitySignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"InferenceService|ServingRuntime|SeldonDeployment|tritonserver|bentoml serve|model server\" .", purpose: "Find online inference platform or model-server definitions." },
      { command: "rg \"storageUri|modelUri|model_repository|config.pbtxt|s3://|gs://|pvc\" .", purpose: "Find durable model repository, artifact, and runtime config pointers." },
      { command: "rg \"REST|gRPC|/v2/models|/predict|/metadata|protocolVersion\" .", purpose: "Find REST, gRPC, V2, prediction, and metadata endpoint contracts." },
      { command: "rg \"canary|traffic|shadow|InferenceGraph|gateway|autoscaling|minReplicas|maxReplicas|concurrency\" .", purpose: "Find traffic routing and autoscaling rollout evidence." },
      { command: "rg \"readinessProbe|livenessProbe|startupProbe|/health|ModelReady|curl .*predict|grpcurl|kubectl apply|upload-artifact\" .github workflows .", purpose: "Find serving health checks, inference smoke tests, manifest apply commands, and CI artifacts." }
    ],
    learnerNextSteps: [
      "먼저 KServe InferenceService, SeldonDeployment, Triton server, Bento service 또는 custom model server가 있는지 확인하세요.",
      "predictor, transformer, explainer, backend, model format, GPU, batching 같은 serving runtime 구성이 명시되어 있는지 확인하세요.",
      "storageUri, modelUri, model_repository, config.pbtxt, S3/GCS/PVC처럼 모델 artifact 위치가 재현 가능한지 확인하세요.",
      "REST, gRPC, V2 protocol, predict, metadata, health endpoint가 client contract와 smoke test로 연결되는지 확인하세요.",
      "canary/traffic/shadow routing, autoscaling, health probes, resources, observability, CI manifest apply와 inference smoke evidence가 남는지 확인하세요."
    ]
  };
}

type ModelServingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function modelServingSourceFiles(walk: WalkResult): Promise<ModelServingSourceFile[]> {
  const rows: ModelServingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!modelServingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!modelServingPathSignal(file.relPath) && !modelServingContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 280);
}

function modelServingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|service\.py|server\.py|model-serving\.ya?ml|model_serving\.ya?ml|inferenceservice\.ya?ml|servingruntime\.ya?ml|seldondeployment\.ya?ml|config\.pbtxt|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(kserve|seldon|triton|triton-server|bentoml|bento|inference|serving|model-serving|model_serving|model-server|model_server|predictor|predict|runtime|models|model_repository|model-repository)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|rst|proto|pbtxt|py|go|java|scala|kt|rs|sh|Dockerfile)$/i.test(filePath);
}

function modelServingPathSignal(filePath: string): boolean {
  return /(^|\/)(kserve|seldon|triton|triton-server|bentoml|bento|inference|serving|model-serving|model_serving|model-server|model_server|predictor|predict|runtime|models|model_repository|model-repository)(\/|\.|-|_|$)/i.test(filePath)
    || /^(service\.py|server\.py|model-serving\.ya?ml|model_serving\.ya?ml|inferenceservice\.ya?ml|servingruntime\.ya?ml|seldondeployment\.ya?ml|config\.pbtxt)$/i.test(path.basename(filePath));
}

function modelServingContentSignal(text: string): boolean {
  return /KServe|InferenceService|ServingRuntime|ClusterServingRuntime|SeldonDeployment|seldon|tritonserver|TRITONSERVER|model_repository|config\.pbtxt|bentoml serve|model server|PredictorSpec|predictor/i.test(text);
}

function modelServingSetupsFromSources(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["modelServingSetups"] {
  const rows: ModelServingReadinessReport["modelServingSetups"] = [];
  for (const source of sourceFiles) {
    const inferenceServiceCount = countMatches(source.text, /InferenceService|LLMInferenceService|SeldonDeployment|inference service|tritonserver|bentoml serve|model server|model-service/gi);
    const runtimeCount = countMatches(source.text, /ServingRuntime|ClusterServingRuntime|runtime|PredictorSpec|predictor|Transformer|Explainer|backend|platform|instance_group|model format|dynamic_batching|sequence_batching/gi);
    const modelRepositoryCount = countMatches(source.text, /storageUri|modelUri|model_uri|model_repository|model-repository|config\.pbtxt|models:\/|s3:\/\/|gs:\/\/|pvc|PersistentVolumeClaim|model_path|model repository/gi);
    const protocolCount = countMatches(source.text, /REST|gRPC|grpc|HTTP|protocolVersion|v2 protocol|\/v2\/models|\/predict|\/metadata|ModelInfer|inference\.GRPCInferenceService/gi);
    const routingCount = countMatches(source.text, /canary|traffic|trafficPercent|shadow|InferenceGraph|gateway|ambassador|load balancing|load-balancing|fallback|split/gi);
    const autoscalingCount = countMatches(source.text, /autoscaling|minReplicas|maxReplicas|scale-to-zero|concurrency|HPA|HorizontalPodAutoscaler|replicas|containerConcurrency|scaleTarget/gi);
    const healthCount = countMatches(source.text, /readinessProbe|livenessProbe|startupProbe|\/health|ready|ModelReady|health-check|\/v2\/health\/ready|healthz/gi);
    const resourceCount = countMatches(source.text, /resources:|cpu|memory|nvidia\.com\/gpu|nodeSelector|tolerations|serviceAccount|serviceAccountName|secret|storageUri|envFrom/gi);
    const observabilityCount = countMatches(source.text, /metrics|prometheus|logging|tracing|OpenTelemetry|access log|access_log|request id|request_id|\/metrics/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|uses: actions\/|kubectl apply|helm upgrade|kserve|seldon|tritonserver|curl .*predict|curl .*health|grpcurl|health check|upload-artifact|rollout status/gi);
    const totalSignals = inferenceServiceCount + runtimeCount + modelRepositoryCount + protocolCount + routingCount + autoscalingCount + healthCount + resourceCount + observabilityCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: modelServingTool(source),
      inferenceServiceCount,
      runtimeCount,
      modelRepositoryCount,
      protocolCount,
      routingCount,
      autoscalingCount,
      healthCount,
      resourceCount,
      observabilityCount,
      ciCount,
      readiness: inferenceServiceCount > 0 && runtimeCount > 0 && modelRepositoryCount > 0 && protocolCount > 0 && healthCount > 0 && (routingCount + autoscalingCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} model serving readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.inferenceServiceCount + b.runtimeCount + b.modelRepositoryCount + b.protocolCount + b.routingCount + b.autoscalingCount + b.healthCount + b.resourceCount + b.observabilityCount + b.ciCount) - (a.inferenceServiceCount + a.runtimeCount + a.modelRepositoryCount + a.protocolCount + a.routingCount + a.autoscalingCount + a.healthCount + a.resourceCount + a.observabilityCount + a.ciCount))
    .slice(0, 80);
}

function modelServingTool(source: ModelServingSourceFile): ModelServingReadinessReport["modelServingSetups"][number]["tool"] {
  if (/triton|model_repository|config\.pbtxt/i.test(source.filePath) || /tritonserver|TRITONSERVER|config\.pbtxt|model_repository|inference\.GRPCInferenceService/i.test(source.text)) return "triton";
  if (/seldon/i.test(source.filePath) || /SeldonDeployment|seldon|MLSERVER|SKLEARN_SERVER|TRITON_SERVER/i.test(source.text)) return "seldon";
  if (/kserve|inferenceservice|servingruntime/i.test(source.filePath) || /KServe|InferenceService|ServingRuntime|ClusterServingRuntime|serving\.kserve\.io/i.test(source.text)) return "kserve";
  if (/bentoml|bento/i.test(source.filePath) || /BentoML|bentoml serve|bentoml deploy|BentoCloud/i.test(source.text)) return "bentoml";
  if (/serving|inference|model-server|predict/i.test(source.filePath) || /model server|inference service|predict endpoint|prediction service/i.test(source.text)) return "custom";
  return "unknown";
}

function modelServingPlatformSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["platformSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "inference-service", pattern: /InferenceService|LLMInferenceService|inference service|serving\.kserve\.io/i, evidence: "KServe/inference service evidence was detected." },
    { signal: "serving-runtime", pattern: /ServingRuntime|ClusterServingRuntime|serving runtime|PredictorSpec/i, evidence: "serving runtime evidence was detected." },
    { signal: "seldon-deployment", pattern: /SeldonDeployment|machinelearning\.seldon\.io|seldon/i, evidence: "Seldon deployment evidence was detected." },
    { signal: "triton-server", pattern: /tritonserver|TRITONSERVER|Triton Inference Server/i, evidence: "Triton server evidence was detected." },
    { signal: "model-repository", pattern: /model_repository|model-repository|config\.pbtxt|storageUri|modelUri|s3:\/\/|gs:\/\/|pvc/i, evidence: "model repository/artifact pointer evidence was detected." },
    { signal: "custom-server", pattern: /model server|prediction service|predict endpoint|FastAPI|Flask|bentoml serve/i, evidence: "custom model-server evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function modelServingRuntimeSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "predictor", pattern: /predictor|PredictorSpec|predictors:/i, evidence: "predictor evidence was detected." },
    { signal: "transformer", pattern: /transformer|Transformer/i, evidence: "transformer evidence was detected." },
    { signal: "explainer", pattern: /explainer|Explainer/i, evidence: "explainer evidence was detected." },
    { signal: "backend", pattern: /backend|implementation:|TRITON_SERVER|MLSERVER|SKLEARN_SERVER|platform:/i, evidence: "backend implementation evidence was detected." },
    { signal: "model-format", pattern: /model format|modelFormat|onnx|tensorflow|pytorch|sklearn|xgboost|platform:/i, evidence: "model format evidence was detected." },
    { signal: "gpu", pattern: /nvidia\.com\/gpu|KIND_GPU|gpu|cuda/i, evidence: "GPU serving evidence was detected." },
    { signal: "batching", pattern: /dynamic_batching|sequence_batching|max_batch_size|batching|containerConcurrency/i, evidence: "batching/concurrency evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function modelServingProtocolSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["protocolSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["protocolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rest", pattern: /REST|http-port|HTTP|curl .*http/i, evidence: "REST/HTTP protocol evidence was detected." },
    { signal: "grpc", pattern: /gRPC|grpc|grpc-port|grpcurl|GRPCInferenceService/i, evidence: "gRPC protocol evidence was detected." },
    { signal: "v2-protocol", pattern: /protocolVersion:\s*v2|v2 protocol|\/v2\/models|\/v2\/health\/ready/i, evidence: "V2 inference protocol evidence was detected." },
    { signal: "http-health", pattern: /\/health|\/v2\/health\/ready|healthz|ready endpoint/i, evidence: "HTTP health endpoint evidence was detected." },
    { signal: "predict-endpoint", pattern: /\/predict|\/infer|ModelInfer|predict endpoint|inference request/i, evidence: "predict/infer endpoint evidence was detected." },
    { signal: "metadata-endpoint", pattern: /\/metadata|\/v2\/models|model metadata|ModelMetadata/i, evidence: "metadata endpoint evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "protocol", "signal");
}

function modelServingRoutingSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["routingSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["routingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "canary", pattern: /canary|canaryTrafficPercent/i, evidence: "canary rollout evidence was detected." },
    { signal: "traffic-split", pattern: /traffic|trafficPercent|traffic split|split traffic/i, evidence: "traffic split evidence was detected." },
    { signal: "shadow", pattern: /shadow|shadowDeployment|mirror traffic/i, evidence: "shadow serving evidence was detected." },
    { signal: "inference-graph", pattern: /InferenceGraph|graph:|children:/i, evidence: "inference graph evidence was detected." },
    { signal: "gateway", pattern: /gateway|ambassador|ingress|virtualservice/i, evidence: "gateway/ingress evidence was detected." },
    { signal: "load-balancing", pattern: /load balancing|load-balancing|loadBalancer|fallback/i, evidence: "load-balancing/fallback evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "routing", "signal");
}

function modelServingScalingSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["scalingSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["scalingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "autoscaling", pattern: /autoscaling|autoscaler|scaleTarget|scaleMetric/i, evidence: "autoscaling evidence was detected." },
    { signal: "min-replicas", pattern: /minReplicas|min-replicas|replicas:\s*[1-9]/i, evidence: "minimum replica evidence was detected." },
    { signal: "max-replicas", pattern: /maxReplicas|max-replicas/i, evidence: "maximum replica evidence was detected." },
    { signal: "scale-to-zero", pattern: /scale-to-zero|scaleToZero|minReplicas:\s*0/i, evidence: "scale-to-zero evidence was detected." },
    { signal: "hpa", pattern: /HorizontalPodAutoscaler|HPA|autoscaling\/v2/i, evidence: "HPA evidence was detected." },
    { signal: "concurrency", pattern: /containerConcurrency|concurrency|targetConcurrency|max_batch_size/i, evidence: "concurrency/batch-size evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "scaling", "signal");
}

function modelServingHealthSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["healthSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["healthSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "readiness-probe", pattern: /readinessProbe|readiness probe/i, evidence: "readiness probe evidence was detected." },
    { signal: "liveness-probe", pattern: /livenessProbe|liveness probe/i, evidence: "liveness probe evidence was detected." },
    { signal: "startup-probe", pattern: /startupProbe|startup probe/i, evidence: "startup probe evidence was detected." },
    { signal: "health-endpoint", pattern: /\/health|\/v2\/health\/ready|healthz|health check/i, evidence: "health endpoint evidence was detected." },
    { signal: "model-ready", pattern: /ModelReady|model ready|ready:\s*true|rollout status/i, evidence: "model ready/rollout evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "health", "signal");
}

function modelServingResourceSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["resourceSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["resourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cpu", pattern: /cpu|requests:|limits:/i, evidence: "CPU resource evidence was detected." },
    { signal: "memory", pattern: /memory|requests:|limits:/i, evidence: "memory resource evidence was detected." },
    { signal: "gpu", pattern: /nvidia\.com\/gpu|KIND_GPU|gpu/i, evidence: "GPU resource evidence was detected." },
    { signal: "node-selector", pattern: /nodeSelector|node selector/i, evidence: "node selector evidence was detected." },
    { signal: "tolerations", pattern: /tolerations|taint/i, evidence: "toleration evidence was detected." },
    { signal: "service-account", pattern: /serviceAccount|serviceAccountName|service account/i, evidence: "service account evidence was detected." },
    { signal: "storage-uri", pattern: /storageUri|modelUri|model_repository|s3:\/\/|gs:\/\/|pvc/i, evidence: "storage URI evidence was detected." },
    { signal: "secret", pattern: /secret|secretName|imagePullSecrets|envFrom/i, evidence: "secret reference evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "resource", "signal");
}

function modelServingObservabilitySignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metrics", pattern: /metrics|\/metrics|metrics-port/i, evidence: "metrics evidence was detected." },
    { signal: "logging", pattern: /logging|logger|loglevel|log level/i, evidence: "logging evidence was detected." },
    { signal: "tracing", pattern: /tracing|OpenTelemetry|otel|trace/i, evidence: "tracing evidence was detected." },
    { signal: "prometheus", pattern: /prometheus|ServiceMonitor|prometheus\.io/i, evidence: "Prometheus evidence was detected." },
    { signal: "access-log", pattern: /access log|access_log|request log/i, evidence: "access log evidence was detected." },
    { signal: "request-id", pattern: /request id|request_id|correlation id|trace id/i, evidence: "request ID evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function modelServingCiSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "deploy-command", pattern: /helm upgrade|kubectl apply|bentoml deploy|tritonserver --model-repository/i, evidence: "deploy command evidence was detected." },
    { signal: "inference-smoke-command", pattern: /curl .*\/predict|curl .*\/infer|grpcurl .*ModelInfer|inference smoke|serving smoke/i, evidence: "inference smoke command evidence was detected." },
    { signal: "health-check-command", pattern: /curl .*\/health|\/v2\/health\/ready|health check|rollout status/i, evidence: "health check command evidence was detected." },
    { signal: "manifest-apply", pattern: /kubectl apply|kustomize build|helm upgrade|manifest apply/i, evidence: "manifest apply evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|serving-report|model-serving-report|triton-logs|inference-report/i, evidence: "serving artifact upload evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function modelServingPackageSignals(sourceFiles: ModelServingSourceFile[]): ModelServingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ModelServingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kserve", pattern: /kserve|KServe|serving\.kserve\.io|InferenceService|ServingRuntime/i, evidence: "KServe package/API evidence was detected." },
    { signal: "seldon", pattern: /seldon|SeldonDeployment|machinelearning\.seldon\.io|MLSERVER/i, evidence: "Seldon package/API evidence was detected." },
    { signal: "triton", pattern: /triton|tritonserver|TRITONSERVER|config\.pbtxt|tritonclient/i, evidence: "Triton package/API evidence was detected." },
    { signal: "bentoml", pattern: /bentoml|BentoML|bentoml serve|BentoCloud/i, evidence: "BentoML serving evidence was detected." },
    { signal: "kubernetes", pattern: /kubernetes|kubectl|autoscaling\/v2|HorizontalPodAutoscaler|readinessProbe/i, evidence: "Kubernetes serving evidence was detected." },
    { signal: "custom", pattern: /model server|inference service|prediction service|predict endpoint/i, evidence: "custom serving evidence was detected." }
  ];
  return modelServingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function modelServingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ModelServingSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/model-serving-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildModelTrainingReadinessReport(walk: WalkResult): Promise<ModelTrainingReadinessReport> {
  const sourceFiles = await modelTrainingSourceFiles(walk);
  const modelTrainingSetups = modelTrainingSetupsFromSources(sourceFiles);
  const loopSignals = modelTrainingLoopSignals(sourceFiles);
  const dataSignals = modelTrainingDataSignals(sourceFiles);
  const distributedSignals = modelTrainingDistributedSignals(sourceFiles);
  const acceleratorSignals = modelTrainingAcceleratorSignals(sourceFiles);
  const checkpointSignals = modelTrainingCheckpointSignals(sourceFiles);
  const callbackSignals = modelTrainingCallbackSignals(sourceFiles);
  const observabilitySignals = modelTrainingObservabilitySignals(sourceFiles);
  const configSignals = modelTrainingConfigSignals(sourceFiles);
  const ciSignals = modelTrainingCiSignals(sourceFiles);
  const packageSignals = modelTrainingPackageSignals(sourceFiles);

  const hasLoop = loopSignals.filter((item) => item.readiness === "ready").length >= 4 || modelTrainingSetups.some((item) => item.trainerCount > 0 && item.trainingLoopCount > 0);
  const hasData = dataSignals.filter((item) => item.readiness === "ready").length >= 3 || modelTrainingSetups.some((item) => item.dataCount > 0);
  const hasDistributed = distributedSignals.filter((item) => item.readiness === "ready").length >= 2 || modelTrainingSetups.some((item) => item.distributedCount > 0);
  const hasAccelerator = acceleratorSignals.filter((item) => item.readiness === "ready").length >= 2 || modelTrainingSetups.some((item) => item.acceleratorCount > 0);
  const hasCheckpoint = checkpointSignals.filter((item) => item.readiness === "ready").length >= 2 || modelTrainingSetups.some((item) => item.checkpointCount > 0);
  const hasCallbacks = callbackSignals.some((item) => item.readiness === "ready") || modelTrainingSetups.some((item) => item.callbackCount > 0);
  const hasObservability = observabilitySignals.filter((item) => item.readiness === "ready").length >= 2 || modelTrainingSetups.some((item) => item.metricCount > 0);
  const hasConfig = configSignals.filter((item) => item.readiness === "ready").length >= 2 || modelTrainingSetups.some((item) => item.configCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || modelTrainingSetups.some((item) => item.ciCount > 0);

  const riskQueue: ModelTrainingReadinessReport["riskQueue"] = [];
  if (!hasLoop) {
    riskQueue.push({
      priority: "high",
      action: "Add a trainer, fit call, train loop, training step, optimizer, scheduler, or gradient accumulation evidence before claiming model training readiness.",
      why: "Training readiness needs a visible training loop, not only data, model artifacts, or experiment logging.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if (hasLoop && !hasData) {
    riskQueue.push({
      priority: "high",
      action: "Add dataloader, data module, dataset shard, prepared dataloader, batch size, or validation loader evidence.",
      why: "Training loops are hard to reproduce when data loading and validation splits are implicit.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if (hasLoop && !hasAccelerator) {
    riskQueue.push({
      priority: "medium",
      action: "Record GPU, TPU/XLA, mixed precision, bf16/fp16, or device placement controls.",
      why: "Training behavior and reproducibility depend on explicit accelerator and precision settings.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if (hasLoop && !hasDistributed) {
    riskQueue.push({
      priority: "medium",
      action: "Document DDP, FSDP, DeepSpeed, torchrun, accelerate launch, Ray Train, multi-GPU, or multi-node setup.",
      why: "Scaling behavior should be visible before a learner trusts distributed training claims.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if (hasLoop && !hasCheckpoint) {
    riskQueue.push({
      priority: "medium",
      action: "Add checkpoint, resume, save_state, load_state, artifact storage, or best-model evidence.",
      why: "Training runs should be restartable and preserve best model state.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if (hasLoop && !hasCallbacks) {
    riskQueue.push({
      priority: "low",
      action: "Add early stopping, learning-rate monitor, model summary, progress bar, Ray report callback, or custom callback evidence.",
      why: "Callbacks are where training safety, reporting, and learner-visible progress often live.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if (hasLoop && !hasObservability) {
    riskQueue.push({
      priority: "low",
      action: "Log metrics through a logger, TensorBoard, W&B, MLflow, Ray report, or equivalent reporting surface.",
      why: "Training readiness should show how loss, validation metrics, and run results are observed.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if (hasLoop && !hasConfig) {
    riskQueue.push({
      priority: "low",
      action: "Record trainer, scaling, run, project, seed, or deterministic config evidence.",
      why: "Training should be repeatable from configuration rather than hidden local defaults.",
      relatedHref: "html/model-training-readiness.html"
    });
  }
  if ((hasCheckpoint || hasDistributed || hasObservability) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run training smoke, distributed smoke, checkpoint assertion, and artifact upload commands in CI.",
      why: "Training readiness should be checked automatically before reports trust the training setup.",
      relatedHref: "html/model-training-readiness.html"
    });
  }

  return {
    summary: `Model training readiness report: training setup ${modelTrainingSetups.length}개, loop signal ${loopSignals.length}개, distributed signal ${distributedSignals.length}개, checkpoint signal ${checkpointSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Model training readiness Lightning Accelerate Ray Train Trainer LightningModule Accelerator TorchTrainer train loop checkpoint distributed precision callback metrics CI",
    modelTrainingSetups,
    loopSignals,
    dataSignals,
    distributedSignals,
    acceleratorSignals,
    checkpointSignals,
    callbackSignals,
    observabilitySignals,
    configSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"LightningModule|Trainer\\(|Accelerator\\(|TorchTrainer|train_loop_per_worker|training_step|fit\\(\" .", purpose: "Find trainer definitions and training-loop entry points." },
      { command: "rg \"DataLoader|LightningDataModule|train_dataloader|get_dataset_shard|prepare_data_loader|batch_size|validation\" .", purpose: "Find data loading, validation split, and distributed dataset evidence." },
      { command: "rg \"DDP|FSDP|DeepSpeed|torchrun|accelerate launch|ScalingConfig|num_workers|multi_gpu|multi-node\" .", purpose: "Find distributed training and worker scaling evidence." },
      { command: "rg \"ModelCheckpoint|save_state|load_state|resume_from_checkpoint|CheckpointConfig|best_model|checkpoint\" .", purpose: "Find checkpoint, resume, and best-model persistence evidence." },
      { command: "rg \"EarlyStopping|LearningRateMonitor|TensorBoardLogger|WandbLogger|MLFlowLogger|ray.train.report|upload-artifact|training smoke\" .github workflows .", purpose: "Find callbacks, metrics/logging, CI smoke, and artifact upload evidence." }
    ],
    learnerNextSteps: [
      "먼저 Lightning Trainer, Accelerate Accelerator, Ray TorchTrainer 또는 custom training loop가 실제 학습 진입점을 드러내는지 확인하세요.",
      "DataLoader, LightningDataModule, Ray dataset shard, prepared dataloader, batch size, validation loader가 재현 가능하게 기록되어 있는지 확인하세요.",
      "DDP/FSDP/DeepSpeed, torchrun, accelerate launch, Ray ScalingConfig, multi-GPU/multi-node 설정이 명시되어 있는지 확인하세요.",
      "ModelCheckpoint, save_state/load_state, resume_from_checkpoint, CheckpointConfig, best model artifact가 남는지 확인하세요.",
      "callbacks, metric logger, TensorBoard/W&B/MLflow/Ray report, CI training smoke, distributed smoke, checkpoint assertion, artifact upload가 연결되는지 확인하세요."
    ]
  };
}

type ModelTrainingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function modelTrainingSourceFiles(walk: WalkResult): Promise<ModelTrainingSourceFile[]> {
  const rows: ModelTrainingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!modelTrainingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!modelTrainingPathSignal(file.relPath) && !modelTrainingContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 280);
}

function modelTrainingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|train\.py|training\.py|trainer\.py|lightning\.ya?ml|accelerate_config\.ya?ml|ray_train\.ya?ml|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(lightning|pytorch-lightning|accelerate|ray|ray-train|training|trainer|train|checkpoint|callbacks|data|datasets|models)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|rst|py|sh)$/i.test(filePath);
}

function modelTrainingPathSignal(filePath: string): boolean {
  return /(^|\/)(lightning|pytorch-lightning|accelerate|ray|ray-train|training|trainer|train|checkpoint|callbacks)(\/|\.|-|_|$)/i.test(filePath)
    || /^(train\.py|training\.py|trainer\.py|accelerate_config\.ya?ml|ray_train\.ya?ml)$/i.test(path.basename(filePath));
}

function modelTrainingContentSignal(text: string): boolean {
  return /LightningModule|Trainer\(|Accelerator\(|accelerate launch|TorchTrainer|ray\.train|train_loop_per_worker|training_step|configure_optimizers|ModelCheckpoint|save_state|load_state|ScalingConfig/i.test(text);
}

function modelTrainingSetupsFromSources(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["modelTrainingSetups"] {
  const rows: ModelTrainingReadinessReport["modelTrainingSetups"] = [];
  for (const source of sourceFiles) {
    const trainerCount = countMatches(source.text, /Trainer\(|LightningModule|Accelerator\(|TorchTrainer|ray\.train|train_loop_per_worker|trainer\.fit|\.fit\(/gi);
    const trainingLoopCount = countMatches(source.text, /training_step|train_loop|train_loop_per_worker|for .* in .*dataloader|accelerator\.backward|loss\.backward|trainer\.fit|fit\(/gi);
    const dataCount = countMatches(source.text, /DataLoader|LightningDataModule|train_dataloader|val_dataloader|validation_dataloader|get_dataset_shard|prepare_data_loader|prepare\(|batch_size|dataset/gi);
    const optimizerCount = countMatches(source.text, /configure_optimizers|optimizer|lr_scheduler|scheduler|Adam|SGD|learning rate|backward|gradient/gi);
    const distributedCount = countMatches(source.text, /DDP|FSDP|DeepSpeed|torchrun|accelerate launch|DistributedType|ScalingConfig|num_workers|multi_gpu|multi-node|num_nodes|RayDDPStrategy|RayFSDPStrategy/gi);
    const acceleratorCount = countMatches(source.text, /accelerator|Accelerator|gpu|cuda|tpu|xla|mixed_precision|precision|bf16|fp16|device_placement|devices=/gi);
    const checkpointCount = countMatches(source.text, /ModelCheckpoint|checkpoint|save_state|load_state|resume_from_checkpoint|CheckpointConfig|Checkpoint|best_model|artifact storage|storage_path/gi);
    const callbackCount = countMatches(source.text, /EarlyStopping|LearningRateMonitor|ModelSummary|ProgressBar|callback|RayTrainReportCallback|callbacks=/gi);
    const metricCount = countMatches(source.text, /metric|accuracy|loss|val_loss|logger|TensorBoardLogger|WandbLogger|MLFlowLogger|ray\.train\.report|report\(|log\(/gi);
    const configCount = countMatches(source.text, /Trainer\(|ScalingConfig|RunConfig|ProjectConfiguration|seed_everything|deterministic|config|gradient_accumulation|accumulate_grad_batches|max_epochs|max_steps/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|uses: actions\/|python .*train|accelerate launch|torchrun|ray train|training smoke|distributed smoke|pytest .*train|upload-artifact|checkpoint assertion/gi);
    const totalSignals = trainerCount + trainingLoopCount + dataCount + optimizerCount + distributedCount + acceleratorCount + checkpointCount + callbackCount + metricCount + configCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: modelTrainingTool(source),
      trainerCount,
      trainingLoopCount,
      dataCount,
      optimizerCount,
      distributedCount,
      acceleratorCount,
      checkpointCount,
      callbackCount,
      metricCount,
      configCount,
      ciCount,
      readiness: trainerCount > 0 && trainingLoopCount > 0 && dataCount > 0 && optimizerCount > 0 && checkpointCount > 0 && metricCount > 0 && (distributedCount + acceleratorCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} model training readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.trainerCount + b.trainingLoopCount + b.dataCount + b.optimizerCount + b.distributedCount + b.acceleratorCount + b.checkpointCount + b.callbackCount + b.metricCount + b.configCount + b.ciCount) - (a.trainerCount + a.trainingLoopCount + a.dataCount + a.optimizerCount + a.distributedCount + a.acceleratorCount + a.checkpointCount + a.callbackCount + a.metricCount + a.configCount + a.ciCount))
    .slice(0, 80);
}

function modelTrainingTool(source: ModelTrainingSourceFile): ModelTrainingReadinessReport["modelTrainingSetups"][number]["tool"] {
  if (/ray|ray-train/i.test(source.filePath) || /TorchTrainer|ray\.train|ScalingConfig|RunConfig|train_loop_per_worker/i.test(source.text)) return "ray";
  if (/accelerate/i.test(source.filePath) || /Accelerator\(|accelerate launch|AcceleratorState|DistributedType|save_state|load_state/i.test(source.text)) return "accelerate";
  if (/lightning|pytorch-lightning/i.test(source.filePath) || /LightningModule|LightningDataModule|Trainer\(|ModelCheckpoint|LearningRateMonitor/i.test(source.text)) return "lightning";
  if (/train|training|trainer/i.test(source.filePath) || /training loop|train_dataloader|configure_optimizers/i.test(source.text)) return "custom";
  return "unknown";
}

function modelTrainingLoopSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["loopSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["loopSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trainer", pattern: /Trainer\(|Accelerator\(|TorchTrainer|trainer =|ray\.train/i, evidence: "trainer evidence was detected." },
    { signal: "train-loop", pattern: /train_loop|train_loop_per_worker|for .* in .*dataloader|training loop/i, evidence: "training loop evidence was detected." },
    { signal: "fit", pattern: /fit\(|trainer\.fit/i, evidence: "fit entrypoint evidence was detected." },
    { signal: "training-step", pattern: /training_step|train_step|def train\(/i, evidence: "training step evidence was detected." },
    { signal: "validation-step", pattern: /validation_step|val_step|validate|validation/i, evidence: "validation step evidence was detected." },
    { signal: "optimizer", pattern: /configure_optimizers|optimizer|Adam|SGD/i, evidence: "optimizer evidence was detected." },
    { signal: "scheduler", pattern: /lr_scheduler|scheduler|LearningRateMonitor/i, evidence: "scheduler evidence was detected." },
    { signal: "gradient-accumulation", pattern: /accumulate_grad_batches|gradient_accumulation|GradientAccumulation|accumulation_steps/i, evidence: "gradient accumulation evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "loop", "signal");
}

function modelTrainingDataSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["dataSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["dataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dataloader", pattern: /DataLoader|dataloader|train_dataloader/i, evidence: "dataloader evidence was detected." },
    { signal: "datamodule", pattern: /LightningDataModule|DataModule/i, evidence: "data module evidence was detected." },
    { signal: "dataset-shard", pattern: /get_dataset_shard|dataset shard|DatasetShard/i, evidence: "dataset shard evidence was detected." },
    { signal: "prepare-dataloader", pattern: /prepare_data_loader|accelerator\.prepare|prepare\([^)]*dataloader/i, evidence: "prepared dataloader evidence was detected." },
    { signal: "batch-size", pattern: /batch_size|per_device_train_batch_size|train_batch_size/i, evidence: "batch-size evidence was detected." },
    { signal: "validation-loader", pattern: /val_dataloader|validation_dataloader|eval_dataloader|validation loader/i, evidence: "validation loader evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "data", "signal");
}

function modelTrainingDistributedSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["distributedSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["distributedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ddp", pattern: /DDP|strategy=.*ddp|RayDDPStrategy/i, evidence: "DDP evidence was detected." },
    { signal: "fsdp", pattern: /FSDP|RayFSDPStrategy|FullySharded/i, evidence: "FSDP evidence was detected." },
    { signal: "deepspeed", pattern: /DeepSpeed|deepspeed|RayDeepSpeedStrategy/i, evidence: "DeepSpeed evidence was detected." },
    { signal: "torchrun", pattern: /torchrun|torch\.distributed/i, evidence: "torchrun/distributed evidence was detected." },
    { signal: "accelerate-launch", pattern: /accelerate launch/i, evidence: "accelerate launch evidence was detected." },
    { signal: "ray-train", pattern: /TorchTrainer|ray\.train|ScalingConfig|train_loop_per_worker/i, evidence: "Ray Train evidence was detected." },
    { signal: "multi-gpu", pattern: /multi_gpu|MULTI_GPU|devices=\s*[2-9]|num_processes|use_gpu=True|gpu/i, evidence: "multi-GPU evidence was detected." },
    { signal: "multi-node", pattern: /num_nodes|multi-node|num_machines|node_rank/i, evidence: "multi-node evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "distributed", "signal");
}

function modelTrainingAcceleratorSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["acceleratorSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["acceleratorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "gpu", pattern: /gpu|cuda|accelerator=.*gpu|use_gpu=True/i, evidence: "GPU accelerator evidence was detected." },
    { signal: "tpu", pattern: /tpu|TPU/i, evidence: "TPU evidence was detected." },
    { signal: "xla", pattern: /xla|XLA|DistributedType\.XLA/i, evidence: "XLA evidence was detected." },
    { signal: "mixed-precision", pattern: /mixed_precision|precision=|mixed precision/i, evidence: "mixed precision evidence was detected." },
    { signal: "bf16", pattern: /bf16|bfloat16/i, evidence: "bf16 evidence was detected." },
    { signal: "fp16", pattern: /fp16|precision=16|float16/i, evidence: "fp16 evidence was detected." },
    { signal: "device-placement", pattern: /device_placement|accelerator\.device|to\(device\)/i, evidence: "device placement evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "accelerator", "signal");
}

function modelTrainingCheckpointSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["checkpointSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["checkpointSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "checkpoint", pattern: /ModelCheckpoint|checkpoint|CheckpointConfig|Checkpoint/i, evidence: "checkpoint evidence was detected." },
    { signal: "resume", pattern: /resume_from_checkpoint|resume|restore/i, evidence: "resume evidence was detected." },
    { signal: "save-state", pattern: /save_state|save_checkpoint|torch\.save|save_model/i, evidence: "save-state evidence was detected." },
    { signal: "load-state", pattern: /load_state|load_checkpoint|load_state_dict|get_checkpoint/i, evidence: "load-state evidence was detected." },
    { signal: "artifact-storage", pattern: /storage_path|artifact|upload-artifact|checkpoint_dir|s3:\/\//i, evidence: "artifact storage evidence was detected." },
    { signal: "best-model", pattern: /best_model|best-checkpoint|monitor=.*val|save_top_k/i, evidence: "best-model evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "checkpoint", "signal");
}

function modelTrainingCallbackSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["callbackSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["callbackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "early-stopping", pattern: /EarlyStopping|early stopping/i, evidence: "early stopping evidence was detected." },
    { signal: "lr-monitor", pattern: /LearningRateMonitor|learning rate monitor|lr monitor/i, evidence: "learning-rate monitor evidence was detected." },
    { signal: "model-summary", pattern: /ModelSummary|model summary/i, evidence: "model summary evidence was detected." },
    { signal: "progress-bar", pattern: /ProgressBar|TQDMProgressBar|progress bar/i, evidence: "progress bar evidence was detected." },
    { signal: "ray-report-callback", pattern: /RayTrainReportCallback|ray train report callback/i, evidence: "Ray report callback evidence was detected." },
    { signal: "custom-callback", pattern: /Callback|callbacks=/i, evidence: "custom callback evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "callback", "signal");
}

function modelTrainingObservabilitySignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metric", pattern: /metric|accuracy|loss|val_loss|f1|auc/i, evidence: "metric evidence was detected." },
    { signal: "logger", pattern: /logger|log\(|self\.log|accelerator\.log/i, evidence: "logger evidence was detected." },
    { signal: "tensorboard", pattern: /TensorBoardLogger|tensorboard/i, evidence: "TensorBoard evidence was detected." },
    { signal: "wandb", pattern: /WandbLogger|wandb/i, evidence: "W&B evidence was detected." },
    { signal: "mlflow", pattern: /MLFlowLogger|mlflow/i, evidence: "MLflow evidence was detected." },
    { signal: "report", pattern: /ray\.train\.report|session\.report|report\(/i, evidence: "training report evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function modelTrainingConfigSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["configSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trainer-config", pattern: /Trainer\([^)]*(max_epochs|max_steps|precision|strategy|accelerator)|TrainerConfig/i, evidence: "trainer config evidence was detected." },
    { signal: "scaling-config", pattern: /ScalingConfig|num_workers|resources_per_worker/i, evidence: "scaling config evidence was detected." },
    { signal: "run-config", pattern: /RunConfig|CheckpointConfig|FailureConfig|storage_path/i, evidence: "run config evidence was detected." },
    { signal: "project-config", pattern: /ProjectConfiguration|accelerate config|project_dir|logging_dir/i, evidence: "project config evidence was detected." },
    { signal: "seed", pattern: /seed_everything|set_seed|manual_seed|seed=/i, evidence: "seed evidence was detected." },
    { signal: "deterministic", pattern: /deterministic|benchmark=False|CUBLAS_WORKSPACE_CONFIG/i, evidence: "determinism evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function modelTrainingCiSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "training-smoke-command", pattern: /python .*train|training smoke|fast_dev_run|limit_train_batches|pytest .*train/i, evidence: "training smoke command evidence was detected." },
    { signal: "distributed-smoke-command", pattern: /accelerate launch|torchrun|ray train|distributed smoke|num_processes|num_workers/i, evidence: "distributed smoke command evidence was detected." },
    { signal: "checkpoint-assertion-command", pattern: /checkpoint assertion|test .*checkpoint|assert .*checkpoint|resume_from_checkpoint|load_state/i, evidence: "checkpoint assertion evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|training-report|checkpoint|tensorboard|wandb|mlruns/i, evidence: "artifact upload evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function modelTrainingPackageSignals(sourceFiles: ModelTrainingSourceFile[]): ModelTrainingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ModelTrainingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "lightning", pattern: /lightning|pytorch-lightning|LightningModule|Trainer\(|ModelCheckpoint/i, evidence: "Lightning package/API evidence was detected." },
    { signal: "accelerate", pattern: /accelerate|Accelerator\(|accelerate launch|AcceleratorState/i, evidence: "Accelerate package/API evidence was detected." },
    { signal: "ray", pattern: /ray|TorchTrainer|ray\.train|ScalingConfig/i, evidence: "Ray Train package/API evidence was detected." },
    { signal: "torch", pattern: /torch|torchrun|DataLoader|torch\.save|torch\.distributed/i, evidence: "PyTorch package/API evidence was detected." },
    { signal: "custom", pattern: /training loop|train_dataloader|configure_optimizers|custom trainer/i, evidence: "custom training evidence was detected." }
  ];
  return modelTrainingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function modelTrainingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ModelTrainingSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/model-training-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}
