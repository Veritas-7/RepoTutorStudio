import type { BenchmarkReadinessReport, LoadTestingReadinessReport, ProgressiveDeliveryReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildProgressiveDeliveryReadinessReport(walk: WalkResult): Promise<ProgressiveDeliveryReadinessReport> {
  const sourceFiles = await progressiveDeliverySourceFiles(walk);
  const rolloutSetups = progressiveDeliverySetupRows(sourceFiles);
  const strategySignals = progressiveDeliveryStrategySignals(sourceFiles);
  const trafficSignals = progressiveDeliveryTrafficSignals(sourceFiles);
  const analysisSignals = progressiveDeliveryAnalysisSignals(sourceFiles);
  const safetySignals = progressiveDeliverySafetySignals(sourceFiles);
  const notificationSignals = progressiveDeliveryNotificationSignals(sourceFiles);
  const workflowSignals = progressiveDeliveryWorkflowSignals(sourceFiles);
  const packageSignals = progressiveDeliveryPackageSignals(sourceFiles);

  const hasSetup = rolloutSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasStrategy = strategySignals.some((item) => item.readiness === "ready") || rolloutSetups.some((item) => item.strategyCount + item.canaryCount + item.blueGreenCount > 0);
  const hasTraffic = trafficSignals.some((item) => item.readiness === "ready") || rolloutSetups.some((item) => item.trafficRoutingCount > 0);
  const hasAnalysis = analysisSignals.some((item) => item.readiness === "ready") || rolloutSetups.some((item) => item.analysisCount + item.metricCount + item.thresholdCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || rolloutSetups.some((item) => item.promotionCount + item.abortCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || rolloutSetups.some((item) => item.workflowCount > 0);

  const riskQueue: ProgressiveDeliveryReadinessReport["riskQueue"] = [];
  if (!hasSetup) {
    riskQueue.push({
      priority: "high",
      action: "Add static progressive delivery manifests before claiming rollout safety readiness.",
      why: "Progressive delivery readiness needs Argo Rollouts, Flagger, Kayenta, Spinnaker, or equivalent staged rollout evidence.",
      relatedHref: "html/progressive-delivery-readiness.html"
    });
  }
  if (hasSetup && !hasStrategy) {
    riskQueue.push({
      priority: "medium",
      action: "Document canary, blue-green, experiment, or rollout step strategy.",
      why: "A rollout controller is not enough; learners need to see how traffic or workload progression is staged.",
      relatedHref: "html/progressive-delivery-readiness.html"
    });
  }
  if (hasSetup && !hasTraffic) {
    riskQueue.push({
      priority: "medium",
      action: "Add traffic routing evidence such as setWeight, stepWeight, TrafficSplit, VirtualService, HTTPRoute, or ingress canary settings.",
      why: "Progressive delivery depends on controlled exposure rather than a single all-at-once deployment.",
      relatedHref: "html/progressive-delivery-readiness.html"
    });
  }
  if (hasSetup && !hasAnalysis) {
    riskQueue.push({
      priority: "medium",
      action: "Pair staged rollout with metric analysis, thresholds, or automated canary analysis.",
      why: "Without AnalysisTemplate, MetricTemplate, Prometheus/Datadog query, webhook check, or Kayenta judge evidence, promotion decisions are not reviewable.",
      relatedHref: "html/progressive-delivery-readiness.html"
    });
  }
  if (hasSetup && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Add promotion, pause, abort, rollback, failure threshold, or progress-deadline evidence.",
      why: "Rollout safety needs explicit failure behavior, not only positive-path traffic shifting.",
      relatedHref: "html/progressive-delivery-readiness.html"
    });
  }
  if (hasSetup && !hasWorkflow) {
    riskQueue.push({
      priority: "medium",
      action: "Add CI, kubectl plugin, Helm install, artifact, promote, abort, or retry workflow evidence.",
      why: "Progressive delivery controls should be visible in review and operation workflows.",
      relatedHref: "html/progressive-delivery-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "RepoTutor records static progressive delivery readiness only; it does not apply Rollouts or Canaries, shift traffic, query metrics, promote, abort, or roll back releases.",
    why: "Actual rollout safety requires authorized cluster, metric backend, controller, and incident workflow verification.",
    relatedHref: "html/progressive-delivery-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Argo Rollouts/Flagger/Kayenta-style progressive delivery readiness report: setup ${rolloutSetups.length} files, strategy signals ${strategySignals.length}, traffic signals ${trafficSignals.length}, analysis signals ${analysisSignals.length} were mapped from static evidence.`,
    sourcePattern: "Progressive delivery readiness Argo Rollouts Flagger Kayenta canary blue-green traffic routing analysis promotion abort",
    rolloutSetups,
    strategySignals,
    trafficSignals,
    analysisSignals,
    safetySignals,
    notificationSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"apiVersion: argoproj.io|kind: Rollout|AnalysisTemplate|AnalysisRun|Experiment\" .", purpose: "Find Argo Rollouts CRDs and automated analysis resources." },
      { command: "rg \"kind: Canary|flagger.app|MetricTemplate|AlertProvider|thresholdRange|stepWeight|maxWeight\" .", purpose: "Find Flagger canary analysis, metrics, and alert provider evidence." },
      { command: "rg \"trafficRouting|setWeight|stepWeights|VirtualService|TrafficSplit|HTTPRoute|Ingress|Gateway\" .", purpose: "Review traffic routing and staged exposure controls." },
      { command: "rg \"Kayenta|canaryJudge|scoreThresholds|baseline|experiment|controlScope|experimentScope\" .", purpose: "Review automated canary analysis judge and baseline/experiment comparison evidence." },
      { command: "rg \"promote|abort|pause|rollback|failureThreshold|manualPromotion|kubectl argo rollouts\" .github . scripts deploy", purpose: "Review promotion, abort, pause, rollback, and workflow controls." }
    ],
    learnerNextSteps: [
      "Start by locating rollout resources and deciding whether the strategy is canary, blue-green, experiment, or custom.",
      "Map traffic movement: setWeight, stepWeight, maxWeight, traffic split, service mesh, ingress, or Gateway API.",
      "Check metric analysis next: AnalysisTemplate, MetricTemplate, Prometheus/Datadog query, webhook check, or Kayenta judge.",
      "Review failure behavior: pause, abort, rollback, failure threshold, progress deadline, and manual or automatic promotion.",
      "This report is static readiness only. Real progressive delivery verification requires authorized cluster and metrics backend checks."
    ]
  };
}

type ProgressiveDeliverySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function progressiveDeliverySourceFiles(walk: WalkResult): Promise<ProgressiveDeliverySourceFile[]> {
  const files: ProgressiveDeliverySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !progressiveDeliveryInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!progressiveDeliveryPathSignal(file.relPath) && !progressiveDeliveryContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 360) break;
  }
  return files;
}

function progressiveDeliveryInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|go\.mod|requirements.*\.txt|pyproject\.toml|Chart\.ya?ml|values.*\.ya?ml|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(rollouts?|progressive|delivery|canary|bluegreen|blue-green|flagger|kayenta|spinnaker|analysis|traffic|istio|linkerd|nginx|gateway|mesh|prometheus|datadog|alerts?|helm|charts?|k8s|kubernetes|manifests?|deploy|ops|sre|docs?)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(ya?ml|json|jsonnet|toml|md|tf|hcl|js|ts|mjs|cjs|py|go|sh|conf|ini)$/i.test(filePath);
}

function progressiveDeliveryPathSignal(filePath: string): boolean {
  return /(argo-rollouts?|rollouts?|flagger|kayenta|spinnaker|progressive-delivery|canary|bluegreen|blue-green|analysis-template|metric-template)/i.test(filePath);
}

function progressiveDeliveryContentSignal(text: string): boolean {
  return /(Argo Rollouts|argoproj\.io|kind:\s*Rollout|AnalysisTemplate|AnalysisRun|kind:\s*Experiment|Flagger|flagger\.app|kind:\s*Canary|MetricTemplate|AlertProvider|Kayenta|canaryJudge|scoreThresholds|trafficRouting|setWeight|stepWeight|stepWeights|thresholdRange|manualPromotion|kubectl argo rollouts)/i.test(text);
}

function progressiveDeliverySetupRows(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["rolloutSetups"] {
  const rows: ProgressiveDeliveryReadinessReport["rolloutSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const strategyCount = countMatches(source.text, /kind:\s*Rollout|kind:\s*Canary|strategy:|canary:|blueGreen:|blue-green|blue green|experiment|progressive delivery/gi);
    const canaryCount = countMatches(source.text, /canary:|kind:\s*Canary|Canary\b|stepWeight|stepWeights|maxWeight|setWeight|canaryService|stableService/gi);
    const blueGreenCount = countMatches(source.text, /blueGreen:|blue-green|blue green|activeService|previewService|previewReplicaCount|autoPromotionEnabled|scaleDownDelaySeconds/gi);
    const trafficRoutingCount = countMatches(source.text, /trafficRouting|setWeight|stepWeight|stepWeights|maxWeight|VirtualService|TrafficSplit|HTTPRoute|Gateway|Ingress|Istio|Linkerd|Nginx|ALB|SMI|ApisixRoute/gi);
    const analysisCount = countMatches(source.text, /AnalysisTemplate|ClusterAnalysisTemplate|AnalysisRun|analysis:|MetricTemplate|canaryJudge|metricSetMixer|judge|analysisConfigurations/gi);
    const metricCount = countMatches(source.text, /metrics:|metricName|provider:|prometheus|Prometheus|Datadog|NewRelic|Stackdriver|query:|interval:/gi);
    const thresholdCount = countMatches(source.text, /thresholdRange|failureThreshold|consecutiveErrorLimit|successCondition|failureCondition|scoreThresholds|marginal|pass|critical|nanStrategy/gi);
    const promotionCount = countMatches(source.text, /promote|promotion|autoPromotionEnabled|manualPromotion|kubectl argo rollouts promote|resume|promoted/gi);
    const abortCount = countMatches(source.text, /abort|aborted|rollback|roll back|failureThreshold|kubectl argo rollouts abort|Canary failed|scale.*zero/gi);
    const notificationCount = countMatches(source.text, /notifications|AlertProvider|alerts:|Slack|slack|MS Teams|msteams|webhook|event|analysis result/gi);
    const workflowCount = countMatches(haystack, /\.github\/workflows|GitHub Actions|runs-on|pull_request|kubectl argo rollouts|kubectl rollout|helm install|helm upgrade|upload-artifact|rollout status|flagger|kayenta/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = strategyCount + canaryCount + blueGreenCount + trafficRoutingCount + analysisCount + metricCount + thresholdCount + promotionCount + abortCount + notificationCount + workflowCount;
    if (totalSignals === 0 && !progressiveDeliveryPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: progressiveDeliveryPlatform(source),
      strategyCount,
      canaryCount,
      blueGreenCount,
      trafficRoutingCount,
      analysisCount,
      metricCount,
      thresholdCount,
      promotionCount,
      abortCount,
      notificationCount,
      workflowCount,
      readiness: strategyCount > 0 && trafficRoutingCount > 0 && (analysisCount + metricCount + thresholdCount > 0) && (promotionCount + abortCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains strategy ${strategyCount}, canary ${canaryCount}, blue-green ${blueGreenCount}, traffic routing ${trafficRoutingCount}, analysis ${analysisCount}, metrics ${metricCount}, thresholds ${thresholdCount}, promotion ${promotionCount}, abort ${abortCount}, notifications ${notificationCount}, workflows ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.strategyCount + b.trafficRoutingCount + b.analysisCount + b.metricCount + b.thresholdCount + b.promotionCount + b.abortCount + b.workflowCount;
    const aScore = a.strategyCount + a.trafficRoutingCount + a.analysisCount + a.metricCount + a.thresholdCount + a.promotionCount + a.abortCount + a.workflowCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function progressiveDeliveryPlatform(source: ProgressiveDeliverySourceFile): ProgressiveDeliveryReadinessReport["rolloutSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (/Argo Rollouts|argoproj\.io|kind:\s*Rollout|AnalysisTemplate|kubectl argo rollouts/i.test(haystack)) return "argo-rollouts";
  if (/Flagger|flagger\.app|kind:\s*Canary|MetricTemplate|AlertProvider/i.test(haystack)) return "flagger";
  if (/Kayenta|canaryJudge|scoreThresholds|metricSetMixer/i.test(haystack)) return "kayenta";
  if (/Spinnaker|orca|canaryConfigId/i.test(haystack)) return "spinnaker";
  if (/Istio|VirtualService|DestinationRule/i.test(haystack)) return "istio";
  if (/Linkerd|TrafficSplit/i.test(haystack)) return "linkerd";
  if (/Nginx|nginx\.ingress\.kubernetes\.io\/canary/i.test(haystack)) return "nginx";
  if (/Gateway API|HTTPRoute|GatewayClass|kind:\s*Gateway/i.test(haystack)) return "gateway-api";
  if (/canary|blue.?green|progressive delivery|trafficRouting/i.test(haystack)) return "custom";
  return "unknown";
}

function progressiveDeliveryStrategySignals(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["strategySignals"] {
  const specs: Array<{ signal: ProgressiveDeliveryReadinessReport["strategySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rollout-crd", pattern: /argoproj\.io|kind:\s*Rollout|AnalysisTemplate|AnalysisRun/i, evidence: "Argo Rollouts CRD evidence was detected." },
    { signal: "canary-crd", pattern: /kind:\s*Canary|canaries\.flagger\.app|flagger\.app/i, evidence: "Flagger Canary CRD evidence was detected." },
    { signal: "blue-green", pattern: /blueGreen:|blue-green|blue green|activeService|previewService|autoPromotionEnabled/i, evidence: "blue-green strategy evidence was detected." },
    { signal: "canary-steps", pattern: /setWeight|stepWeight|stepWeights|maxWeight|pause:|steps:/i, evidence: "canary step evidence was detected." },
    { signal: "experiment", pattern: /kind:\s*Experiment|experiment:|Experiment\b|baseline|experimentScope/i, evidence: "experiment strategy evidence was detected." },
    { signal: "traffic-routing", pattern: /trafficRouting|VirtualService|TrafficSplit|HTTPRoute|Gateway|Ingress/i, evidence: "traffic routing strategy evidence was detected." }
  ];
  return progressiveDeliverySignalFromSpecs(sourceFiles, specs, "strategy");
}

function progressiveDeliveryTrafficSignals(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["trafficSignals"] {
  const specs: Array<{ signal: ProgressiveDeliveryReadinessReport["trafficSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-weight", pattern: /setWeight/i, evidence: "Argo setWeight evidence was detected." },
    { signal: "step-weight", pattern: /stepWeight|stepWeights/i, evidence: "Flagger stepWeight evidence was detected." },
    { signal: "max-weight", pattern: /maxWeight/i, evidence: "maxWeight evidence was detected." },
    { signal: "traffic-split", pattern: /TrafficSplit|traffic split|weight:/i, evidence: "traffic split evidence was detected." },
    { signal: "service-mesh", pattern: /Istio|Linkerd|SMI|Kuma|App Mesh|VirtualService|DestinationRule/i, evidence: "service mesh routing evidence was detected." },
    { signal: "ingress", pattern: /Ingress|Nginx|nginx\.ingress\.kubernetes\.io\/canary|ALB|ApisixRoute/i, evidence: "ingress routing evidence was detected." },
    { signal: "gateway-api", pattern: /Gateway API|HTTPRoute|GatewayClass|kind:\s*Gateway/i, evidence: "Gateway API routing evidence was detected." }
  ];
  return progressiveDeliverySignalFromSpecs(sourceFiles, specs, "traffic");
}

function progressiveDeliveryAnalysisSignals(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["analysisSignals"] {
  const specs: Array<{ signal: ProgressiveDeliveryReadinessReport["analysisSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "analysis-template", pattern: /AnalysisTemplate|ClusterAnalysisTemplate|AnalysisRun/i, evidence: "Argo analysis template evidence was detected." },
    { signal: "metric-template", pattern: /MetricTemplate|metrics:\s*\n|templateRef/i, evidence: "Flagger metric template evidence was detected." },
    { signal: "kayenta-judge", pattern: /Kayenta|canaryJudge|NetflixACAJudge|MannWhitney/i, evidence: "Kayenta judge evidence was detected." },
    { signal: "prometheus-query", pattern: /Prometheus|prometheus|query:\s*|promql|sum\(rate|histogram_quantile/i, evidence: "Prometheus query evidence was detected." },
    { signal: "datadog-query", pattern: /Datadog|datadog|DataDog|datadogFetch/i, evidence: "Datadog query evidence was detected." },
    { signal: "webhook-check", pattern: /webhooks?:|webhook|pre-rollout|rollout|confirm-promotion|load-test/i, evidence: "webhook check evidence was detected." },
    { signal: "threshold-range", pattern: /thresholdRange|threshold range|threshold:\s*|failureThreshold|consecutiveErrorLimit/i, evidence: "threshold range evidence was detected." },
    { signal: "score-threshold", pattern: /scoreThresholds|marginal|pass|critical/i, evidence: "Kayenta score threshold evidence was detected." }
  ];
  return progressiveDeliverySignalFromSpecs(sourceFiles, specs, "analysis");
}

function progressiveDeliverySafetySignals(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["safetySignals"] {
  const specs: Array<{ signal: ProgressiveDeliveryReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "manual-promotion", pattern: /manualPromotion|manual promotion|confirm-promotion|kubectl argo rollouts promote/i, evidence: "manual promotion evidence was detected." },
    { signal: "auto-promotion", pattern: /autoPromotionEnabled|auto promotion|promoted|promotion finished/i, evidence: "automatic promotion evidence was detected." },
    { signal: "abort-on-failure", pattern: /abortOnFailure|abort|aborted|Canary failed|kubectl argo rollouts abort/i, evidence: "abort-on-failure evidence was detected." },
    { signal: "pause-step", pattern: /pause:|pause step|paused|duration:/i, evidence: "pause step evidence was detected." },
    { signal: "rollback", pattern: /rollback|roll back|routed back|scale.*zero|primary/i, evidence: "rollback/fallback evidence was detected." },
    { signal: "progress-deadline", pattern: /progressDeadlineSeconds|progress deadline|progressDeadlineAbort/i, evidence: "progress deadline evidence was detected." },
    { signal: "failure-threshold", pattern: /failureThreshold|consecutiveErrorLimit|failed checks|thresholdRange/i, evidence: "failure threshold evidence was detected." }
  ];
  return progressiveDeliverySignalFromSpecs(sourceFiles, specs, "safety");
}

function progressiveDeliveryNotificationSignals(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["notificationSignals"] {
  const specs: Array<{ signal: ProgressiveDeliveryReadinessReport["notificationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "slack", pattern: /Slack|slack|slackWebhook/i, evidence: "Slack notification evidence was detected." },
    { signal: "msteams", pattern: /MS Teams|MSTeams|msteams|teamsWebhook/i, evidence: "MS Teams notification evidence was detected." },
    { signal: "webhook", pattern: /webhook|webhooks?:/i, evidence: "webhook notification evidence was detected." },
    { signal: "alert-provider", pattern: /AlertProvider|alerts:\s*|alerting/i, evidence: "alert provider evidence was detected." },
    { signal: "event", pattern: /events?|Kubernetes Events|Normal\s+Synced|Warning\s+Synced/i, evidence: "event evidence was detected." },
    { signal: "analysis-run-status", pattern: /AnalysisRun|analysis result|Canary analysis completed|Starting canary analysis/i, evidence: "analysis status evidence was detected." }
  ];
  return progressiveDeliverySignalFromSpecs(sourceFiles, specs, "notification");
}

function progressiveDeliveryWorkflowSignals(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: ProgressiveDeliveryReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kubectl-plugin", pattern: /kubectl argo rollouts|argo rollouts|kubectl plugin/i, evidence: "kubectl argo rollouts evidence was detected." },
    { signal: "promote-command", pattern: /kubectl argo rollouts promote|rollouts promote|promote\b/i, evidence: "promote command evidence was detected." },
    { signal: "abort-command", pattern: /kubectl argo rollouts abort|rollouts abort|abort\b/i, evidence: "abort command evidence was detected." },
    { signal: "retry-command", pattern: /kubectl argo rollouts retry|rollouts retry|retry\b/i, evidence: "retry command evidence was detected." },
    { signal: "helm-install", pattern: /helm repo add|helm install|helm upgrade|Chart\.ya?ml|values\.ya?ml/i, evidence: "Helm install evidence was detected." },
    { signal: "github-actions", pattern: /\.github\/workflows|GitHub Actions|runs-on|pull_request/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|rollout report|analysis report|canary report/i, evidence: "artifact upload evidence was detected." }
  ];
  return progressiveDeliverySignalFromSpecs(sourceFiles, specs, "workflow");
}

function progressiveDeliveryPackageSignals(sourceFiles: ProgressiveDeliverySourceFile[]): ProgressiveDeliveryReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ProgressiveDeliveryReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "argo-rollouts", pattern: /argo-rollouts|Argo Rollouts|argoproj\.io|kubectl argo rollouts/i, evidence: "Argo Rollouts evidence was detected." },
    { signal: "flagger", pattern: /Flagger|flagger\.app|fluxcd\/flagger/i, evidence: "Flagger evidence was detected." },
    { signal: "kayenta", pattern: /Kayenta|canaryJudge|kayenta-/i, evidence: "Kayenta evidence was detected." },
    { signal: "spinnaker", pattern: /Spinnaker|orca|canaryConfigId/i, evidence: "Spinnaker evidence was detected." },
    { signal: "prometheus", pattern: /Prometheus|prometheus|promql/i, evidence: "Prometheus evidence was detected." },
    { signal: "istio", pattern: /Istio|VirtualService|DestinationRule/i, evidence: "Istio evidence was detected." },
    { signal: "linkerd", pattern: /Linkerd|TrafficSplit/i, evidence: "Linkerd evidence was detected." }
  ];
  return progressiveDeliverySignalFromSpecs(sourceFiles, specs, "package");
}

function progressiveDeliverySignalFromSpecs<T extends string>(
  sourceFiles: ProgressiveDeliverySourceFile[],
  specs: Array<{ signal: T; pattern: RegExp; evidence: string }>,
  label: string
): Array<{ signal: T; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(haystack);
    });
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/progressive-delivery-readiness.html"
    };
  });
}

export async function buildLoadTestingReadinessReport(walk: WalkResult): Promise<LoadTestingReadinessReport> {
  const sourceFiles = await loadTestingSourceFiles(walk);
  const loadTestSetups = loadTestingSetups(sourceFiles);
  const toolSignals = loadTestingToolSignals(sourceFiles);
  const profileSignals = loadTestingProfileSignals(sourceFiles);
  const protocolSignals = loadTestingProtocolSignals(sourceFiles);
  const assertionSignals = loadTestingAssertionSignals(sourceFiles);
  const dataSignals = loadTestingDataSignals(sourceFiles);
  const executionSignals = loadTestingExecutionSignals(sourceFiles);
  const reportSignals = loadTestingReportSignals(sourceFiles);
  const packageSignals = loadTestingPackageSignals(sourceFiles);

  const hasTool = toolSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = loadTestSetups.some((item) => item.readiness !== "missing");
  const hasProfile = profileSignals.some((item) => item.readiness === "ready") || loadTestSetups.some((item) => item.loadProfileCount > 0);
  const hasAssertion = assertionSignals.some((item) => item.readiness === "ready") || loadTestSetups.some((item) => item.thresholdCount > 0);
  const hasReport = reportSignals.some((item) => item.readiness === "ready") || loadTestSetups.some((item) => item.reportCount > 0);
  const hasExecution = executionSignals.some((item) => item.readiness === "ready") || loadTestSetups.some((item) => item.ciCount > 0 || item.distributedCount > 0);

  const riskQueue: LoadTestingReadinessReport["riskQueue"] = [];
  if (!hasTool && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a load testing tool before claiming load-test readiness.",
      why: "k6, Artillery, and Locust all start from a visible script, config, package, or CLI command.",
      relatedHref: "html/load-testing-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasProfile) {
    riskQueue.push({
      priority: "high",
      action: "Define the load profile with users, VUs, arrival rate, stages, scenarios, spawn rate, or runtime duration.",
      why: "A load test without a traffic model cannot explain how much load it generated or for how long.",
      relatedHref: "html/load-testing-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasAssertion) {
    riskQueue.push({
      priority: "high",
      action: "Add SLO gates such as k6 thresholds/checks, Artillery ensure/expect, or Locust failure criteria.",
      why: "Load tests need pass/fail criteria for latency, error rate, functional checks, and percentiles.",
      relatedHref: "html/load-testing-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasReport) {
    riskQueue.push({
      priority: "medium",
      action: "Persist summary, JSON, HTML, CSV, Prometheus, InfluxDB, Grafana, or cloud report output.",
      why: "Load-test evidence must survive beyond terminal output for review and trend comparison.",
      relatedHref: "html/load-testing-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasExecution) {
    riskQueue.push({
      priority: "low",
      action: "Document headless, CI, cloud, Docker, or distributed execution before relying on recurring runs.",
      why: "Repeatable load testing needs controlled runtime placement and artifacts.",
      relatedHref: "html/load-testing-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original load test only against an authorized target before treating this static report as approval.",
    why: "RepoTutor records load-testing readiness only; it does not generate traffic, validate targets, or contact external services.",
    relatedHref: "html/load-testing-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `k6/Artillery/Locust-style load testing readiness report: setup ${loadTestSetups.length}개, profile signal ${profileSignals.length}개, assertion signal ${assertionSignals.length}개, report signal ${reportSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "k6 Artillery Locust load testing scenarios phases thresholds checks ensure HttpUser headless distributed reports",
    loadTestSetups,
    toolSignals,
    profileSignals,
    protocolSignals,
    assertionSignals,
    dataSignals,
    executionSignals,
    reportSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "k6 run --summary-export reports/k6-summary.json performance/load-test.js", purpose: "Run k6 with a retained JSON summary artifact." },
      { command: "artillery run load-test.yml --output reports/artillery.json && artillery report reports/artillery.json", purpose: "Run Artillery and render an HTML report from JSON output." },
      { command: "locust -f locustfile.py --headless -u 50 -r 5 --run-time 5m --html reports/locust.html --csv reports/locust", purpose: "Run Locust headlessly with HTML and CSV report artifacts." },
      { command: "rg \"k6 run|artillery run|locust --headless|thresholds|ensure|HttpUser|arrivalRate|spawn-rate\" .", purpose: "Trace static load-test scripts, profiles, and gates." },
      { command: "rg \"prometheus|influxdb|grafana|datadog|cloud|upload-artifact\" .github performance tests", purpose: "Trace retained report, metrics backend, and CI artifact evidence." }
    ],
    learnerNextSteps: [
      "Start with the runnable command, then read the load profile before reviewing target endpoints.",
      "Check whether the script has pass/fail gates, not just traffic generation.",
      "Confirm report artifacts or metrics backends are retained for trend comparison.",
      "Separate local smoke load, CI load, cloud/distributed load, and production load authorization.",
      "This report is static readiness only. Real latency, error rate, and throughput require a controlled load-test run."
    ]
  };
}

type LoadTestingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function loadTestingSourceFiles(walk: WalkResult): Promise<LoadTestingSourceFile[]> {
  const files: LoadTestingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !loadTestingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!loadTestingPathSignal(file.relPath) && !loadTestingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 320) break;
  }
  return files;
}

function loadTestingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|locustfile\.py|docker-compose\.ya?ml|Dockerfile|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|py|sh|jmx|scala|conf|ini|csv)$/i.test(filePath);
}

function loadTestingPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(load[-_ ]?tests?|performance|perf|stress|soak|spike|benchmarks?|k6|artillery|locust|jmeter|gatling)(\/|\.|-|_|$)/i.test(filePath)
    || /^(locustfile\.py|artillery\.ya?ml|load-test\.ya?ml|k6\.[cm]?[jt]s|performance\.[cm]?[jt]s)$/i.test(base);
}

function loadTestingContentSignal(text: string): boolean {
  return /(k6 run|from ["']k6|k6\/http|artillery run|config:\s*[\s\S]{0,300}phases|arrivalRate|rampTo|locust --headless|from locust import|HttpUser|FastHttpUser|LoadTestShape|--spawn-rate|thresholds|ensure|publish-metrics|handleSummary|summary-export|prometheus|influxdb|grafana|load testing|stress test|soak test)/i.test(text);
}

function loadTestingSetups(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["loadTestSetups"] {
  const rows: LoadTestingReadinessReport["loadTestSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /export const options|config\s*:|phases\s*:|scenarios\s*:|locust\.conf|LoadTestShape|thresholds|ensure|target\s*:/gi) + (loadTestingPathSignal(source.filePath) ? 1 : 0);
    const scriptCount = countMatches(source.text, /k6\s+run|artillery\s+run|locust\s+|from ["']k6|from locust import|class\s+\w+\(HttpUser\)|class\s+\w+\(FastHttpUser\)|@task|http\.get|self\.client\./gi);
    const scenarioCount = countMatches(source.text, /scenarios\s*:|flow\s*:|@task|TaskSet|beforeScenario|afterScenario|setup\(|teardown\(|default function|LoadTestShape/gi);
    const loadProfileCount = countMatches(source.text, /vus\s*:|duration\s*:|stages\s*:|arrivalRate|rampTo|spawn-rate|--users|-u\s+\d+|users\s*=|run-time|wait_time|between\(|constant_pacing|load_shape/gi);
    const thresholdCount = countMatches(source.text, /thresholds|check\(|ensure\s*:|expect\s*:|apdex|SLO|p\(95\)|p\(99\)|abortOnFail|fail_ci_if_error|status is|response time/gi);
    const protocolCount = countMatches(source.text, /http\.|k6\/http|websocket|ws:\/\/|grpc|GraphQL|graphql|browser|playwright|tcp|self\.client\.(get|post|put|delete)/gi);
    const dataCount = countMatches(source.text, /SharedArray|open\(|csv|__ENV|process\.env|processor|payload|variables|tags\s*:|group\(|Counter|Rate|Trend|Gauge|events\./gi);
    const reportCount = countMatches(source.text, /handleSummary|summary-export|--output|artillery report|--html|--csv|prometheus|influxdb|grafana|datadog|cloud|json|junit|upload-artifact/gi);
    const distributedCount = countMatches(source.text, /master|worker|distributed|k6-operator|cloud run|--processes|--expect-workers|Kubernetes|docker compose|Dockerfile/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|CI|pull_request|push|upload-artifact|artifact|workflow|actions\//gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = configCount + scriptCount + scenarioCount + loadProfileCount + thresholdCount + protocolCount + dataCount + reportCount + distributedCount + ciCount;
    if (totalSignals === 0 && !loadTestingPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: loadTestingTool(source),
      configCount,
      scriptCount,
      scenarioCount,
      loadProfileCount,
      thresholdCount,
      protocolCount,
      dataCount,
      reportCount,
      distributedCount,
      ciCount,
      readiness: (configCount > 0 || scriptCount > 0) && loadProfileCount > 0 && (thresholdCount > 0 || reportCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, script ${scriptCount}, scenario ${scenarioCount}, profile ${loadProfileCount}, threshold ${thresholdCount}, protocol ${protocolCount}, data ${dataCount}, report ${reportCount}, distributed ${distributedCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.configCount + b.scriptCount + b.loadProfileCount + b.thresholdCount + b.reportCount + b.ciCount;
    const aScore = a.configCount + a.scriptCount + a.loadProfileCount + a.thresholdCount + a.reportCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function loadTestingTool(source: LoadTestingSourceFile): LoadTestingReadinessReport["loadTestSetups"][number]["tool"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/\bk6\b|from ["']k6|k6\/http|summary-export/i.test(haystack)) return "k6";
  if (/artillery|arrivalRate|rampTo|beforeScenario|afterScenario|publish-metrics/i.test(haystack)) return "artillery";
  if (/locust|HttpUser|FastHttpUser|LoadTestShape|spawn-rate/i.test(haystack)) return "locust";
  if (/jmeter|\.jmx|ThreadGroup/i.test(haystack)) return "jmeter";
  if (/gatling|Simulation|constantUsersPerSec|rampUsers/i.test(haystack)) return "gatling";
  if (/autocannon/i.test(haystack)) return "autocannon";
  if (/load testing|stress test|soak test|spike test|performance test/i.test(haystack)) return "custom";
  return "unknown";
}

function loadTestingToolSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["toolSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["toolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "k6", pattern: /\bk6\b|from ["']k6|k6\/http|summary-export/i, evidence: "k6 load testing evidence was detected." },
    { signal: "artillery", pattern: /artillery|arrivalRate|rampTo|publish-metrics/i, evidence: "Artillery load testing evidence was detected." },
    { signal: "locust", pattern: /locust|HttpUser|FastHttpUser|LoadTestShape/i, evidence: "Locust load testing evidence was detected." },
    { signal: "jmeter", pattern: /jmeter|\.jmx|ThreadGroup/i, evidence: "JMeter evidence was detected." },
    { signal: "gatling", pattern: /gatling|Simulation|constantUsersPerSec|rampUsers/i, evidence: "Gatling evidence was detected." },
    { signal: "autocannon", pattern: /autocannon/i, evidence: "autocannon evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "tool", "signal");
}

function loadTestingProfileSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["profileSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["profileSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vus", pattern: /\bvus\s*:|--vus\b|\bVUs?\b/i, evidence: "virtual user count evidence was detected." },
    { signal: "duration", pattern: /\bduration\s*:|--duration\b|run-time|-t\s+\d+/i, evidence: "duration/runtime evidence was detected." },
    { signal: "stages", pattern: /\bstages\s*:/i, evidence: "ramp stage evidence was detected." },
    { signal: "scenarios", pattern: /\bscenarios\s*:|flow\s*:|@task|TaskSet/i, evidence: "scenario/task evidence was detected." },
    { signal: "arrival-rate", pattern: /arrivalRate|arrival-rate|constant-arrival-rate|ramping-arrival-rate/i, evidence: "arrival-rate model evidence was detected." },
    { signal: "ramping", pattern: /rampTo|ramping|ramp-up|ramp down|rampUsers/i, evidence: "ramping load profile evidence was detected." },
    { signal: "spawn-rate", pattern: /spawn-rate|-r\s+\d+|spawn_rate/i, evidence: "Locust spawn-rate evidence was detected." },
    { signal: "users", pattern: /--users\b|-u\s+\d+|users\s*=|\busers?:\s*\d+/i, evidence: "user count evidence was detected." },
    { signal: "wait-time", pattern: /wait_time|between\(|constant_pacing|constant_throughput|sleep\(/i, evidence: "wait time or pacing evidence was detected." },
    { signal: "load-shape", pattern: /LoadTestShape|tick\(|load_shape|shape class/i, evidence: "custom load shape evidence was detected." },
    { signal: "soak", pattern: /\bsoak\b|long[- ]?running/i, evidence: "soak test evidence was detected." },
    { signal: "stress", pattern: /\bstress\b|stress[- ]?test/i, evidence: "stress test evidence was detected." },
    { signal: "spike", pattern: /\bspike\b|spike[- ]?test/i, evidence: "spike test evidence was detected." },
    { signal: "smoke", pattern: /\bsmoke\b|smoke[- ]?test/i, evidence: "smoke load test evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "profile", "signal");
}

function loadTestingProtocolSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["protocolSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["protocolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "http", pattern: /k6\/http|http\.get|http\.post|self\.client\.(get|post|put|delete)|target:\s*https?:/i, evidence: "HTTP load test evidence was detected." },
    { signal: "websocket", pattern: /websocket|ws:\/\/|wss:\/\/|engine:\s*['"]?ws/i, evidence: "WebSocket load test evidence was detected." },
    { signal: "grpc", pattern: /grpc|k6\/net\/grpc/i, evidence: "gRPC load test evidence was detected." },
    { signal: "graphql", pattern: /graphql|GraphQL|query\s*:\s*['"]?\{/i, evidence: "GraphQL load test evidence was detected." },
    { signal: "browser", pattern: /k6\/browser|browser\./i, evidence: "browser-level load flow evidence was detected." },
    { signal: "playwright", pattern: /playwright|engine:\s*['"]playwright/i, evidence: "Artillery Playwright engine evidence was detected." },
    { signal: "tcp", pattern: /\btcp\b|socket|net\.connect/i, evidence: "TCP/socket evidence was detected." },
    { signal: "custom-client", pattern: /class\s+\w+\(User\)|events\.request|custom client|testing other systems/i, evidence: "custom client/protocol evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "protocol", "signal");
}

function loadTestingAssertionSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["assertionSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["assertionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "thresholds", pattern: /thresholds\s*:|threshold/i, evidence: "threshold gate evidence was detected." },
    { signal: "checks", pattern: /check\s*\(|status is|response.*ok/i, evidence: "k6 check/status evidence was detected." },
    { signal: "ensure", pattern: /ensure\s*:|artillery-plugin-ensure/i, evidence: "Artillery ensure evidence was detected." },
    { signal: "expect-plugin", pattern: /expect\s*:|artillery-plugin-expect|expect plugin/i, evidence: "Artillery expect plugin evidence was detected." },
    { signal: "apdex", pattern: /apdex/i, evidence: "Apdex score evidence was detected." },
    { signal: "slo", pattern: /\bSLO\b|service level objective|objective/i, evidence: "SLO evidence was detected." },
    { signal: "abort-on-fail", pattern: /abortOnFail|fail_ci_if_error|stop.*fail/i, evidence: "abort/fail-on-error evidence was detected." },
    { signal: "percentiles", pattern: /p\(90\)|p\(95\)|p\(99\)|percentile|percentiles/i, evidence: "percentile threshold evidence was detected." },
    { signal: "status-check", pattern: /status\s*(is|==|===)|statusCode|status_code|http\.status_code/i, evidence: "HTTP status assertion evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "assertion", "signal");
}

function loadTestingDataSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["dataSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["dataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "setup-teardown", pattern: /setup\s*\(|teardown\s*\(|beforeScenario|afterScenario|test_start|test_stop/i, evidence: "setup/teardown hook evidence was detected." },
    { signal: "shared-array", pattern: /SharedArray/i, evidence: "k6 SharedArray fixture evidence was detected." },
    { signal: "csv-data", pattern: /\.csv|csv-parse|read_csv|CSV/i, evidence: "CSV data parameterization evidence was detected." },
    { signal: "env-vars", pattern: /__ENV|process\.env|os\.environ|LOCUST_|K6_|ARTILLERY_/i, evidence: "environment variable evidence was detected." },
    { signal: "processor", pattern: /processor\s*:|beforeRequest|afterResponse|function\s+\w+\(requestParams/i, evidence: "Artillery processor hook evidence was detected." },
    { signal: "custom-metrics", pattern: /new\s+(Counter|Rate|Trend|Gauge)|events\.request\.fire|stats\.log|metric/i, evidence: "custom metric evidence was detected." },
    { signal: "tags", pattern: /tags\s*:|tag_with|name\s*:|group\(/i, evidence: "tag/group labeling evidence was detected." },
    { signal: "parameterization", pattern: /payload\s*:|variables\s*:|randomString|randomInt|faker|data file/i, evidence: "payload/variable parameterization evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "data", "signal");
}

function loadTestingExecutionSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["executionSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["executionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "headless", pattern: /--headless|headless\s*[:=]\s*true/i, evidence: "headless execution evidence was detected." },
    { signal: "cloud", pattern: /k6 cloud|artillery cloud|Grafana Cloud|cloud-dashboard|K6_CLOUD/i, evidence: "cloud execution evidence was detected." },
    { signal: "distributed-master-worker", pattern: /--master|--worker|master-host|expect-workers|distributed/i, evidence: "distributed master/worker evidence was detected." },
    { signal: "k6-operator", pattern: /k6-operator|kind:\s*K6|TestRun|kubernetes/i, evidence: "k6 operator/Kubernetes evidence was detected." },
    { signal: "docker", pattern: /docker compose|docker-compose|Dockerfile|grafana\/k6|locustio\/locust|artilleryio\/artillery/i, evidence: "Docker load-test runtime evidence was detected." },
    { signal: "ci-workflow", pattern: /^\.github\/workflows\/|GitHub Actions|pull_request|CI|workflow/i, evidence: "CI workflow evidence was detected." },
    { signal: "artifact-upload", pattern: /actions\/upload-artifact|upload-artifact|artifact.*(load|performance|k6|locust|artillery)/i, evidence: "load-test artifact upload evidence was detected." },
    { signal: "parallel-workers", pattern: /--processes|workers?|parallel|shard/i, evidence: "parallel worker/process evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "execution", "signal");
}

function loadTestingReportSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["reportSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["reportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "summary", pattern: /summary-export|summaryTrendStats|end-of-test summary|print-stats/i, evidence: "summary output evidence was detected." },
    { signal: "handleSummary", pattern: /handleSummary/i, evidence: "k6 handleSummary evidence was detected." },
    { signal: "json", pattern: /--output|--summary-export|\.json|json-output|stats\.json/i, evidence: "JSON report evidence was detected." },
    { signal: "html", pattern: /artillery report|--html|\.html|html report/i, evidence: "HTML report evidence was detected." },
    { signal: "csv", pattern: /--csv|\.csv|CSV/i, evidence: "CSV report evidence was detected." },
    { signal: "prometheus", pattern: /prometheus|Prometheus|pushgateway/i, evidence: "Prometheus report/output evidence was detected." },
    { signal: "influxdb", pattern: /influxdb|InfluxDB/i, evidence: "InfluxDB output evidence was detected." },
    { signal: "grafana", pattern: /grafana|Grafana/i, evidence: "Grafana dashboard/backend evidence was detected." },
    { signal: "datadog", pattern: /datadog|Datadog/i, evidence: "Datadog output evidence was detected." },
    { signal: "cloud-dashboard", pattern: /cloud dashboard|Grafana Cloud|k6 cloud|artillery cloud/i, evidence: "cloud dashboard evidence was detected." },
    { signal: "junit", pattern: /junit|JUnit|xunit/i, evidence: "JUnit/xUnit report evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "report", "signal");
}

function loadTestingPackageSignals(sourceFiles: LoadTestingSourceFile[]): LoadTestingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LoadTestingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "k6", pattern: /grafana\/k6|\bk6\s+run\b|"k6"|from ["']k6/i, evidence: "k6 package/container/command evidence was detected." },
    { signal: "artillery", pattern: /"artillery"|artillery\s+run|artilleryio\/artillery/i, evidence: "Artillery package/command evidence was detected." },
    { signal: "@artilleryio/*", pattern: /@artilleryio\/|artillery-plugin-|artillery-engine-/i, evidence: "Artillery scoped package/plugin evidence was detected." },
    { signal: "artillery-engine-playwright", pattern: /artillery-engine-playwright|engine:\s*['"]playwright/i, evidence: "Artillery Playwright engine evidence was detected." },
    { signal: "locust", pattern: /locustio\/locust|locust\s*(==|>=|~=)|from locust import|locust\s+--/i, evidence: "Locust package/command evidence was detected." },
    { signal: "locust-plugins", pattern: /locust-plugins|locust_plugins/i, evidence: "locust-plugins evidence was detected." },
    { signal: "jmeter", pattern: /jmeter|apache-jmeter|\.jmx/i, evidence: "JMeter package/config evidence was detected." },
    { signal: "gatling", pattern: /gatling|io\.gatling|gatling-maven-plugin/i, evidence: "Gatling package/config evidence was detected." },
    { signal: "autocannon", pattern: /autocannon/i, evidence: "autocannon package evidence was detected." }
  ];
  return loadTestingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function loadTestingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LoadTestingSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/load-testing-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildBenchmarkReadinessReport(walk: WalkResult): Promise<BenchmarkReadinessReport> {
  const sourceFiles = await benchmarkSourceFiles(walk);
  const benchmarkSuites = benchmarkSuiteRows(sourceFiles);
  const toolSignals = benchmarkToolSignals(sourceFiles);
  const timingSignals = benchmarkTimingSignals(sourceFiles);
  const comparisonSignals = benchmarkComparisonSignals(sourceFiles);
  const reportSignals = benchmarkReportSignals(sourceFiles);
  const ciSignals = benchmarkCiSignals(sourceFiles);
  const packageSignals = benchmarkPackageSignals(sourceFiles);

  const hasTool = toolSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasSuite = benchmarkSuites.some((item) => item.readiness !== "missing");
  const hasTiming = timingSignals.some((item) => item.readiness === "ready") || benchmarkSuites.some((item) => item.warmupCount > 0 || item.iterationCount > 0);
  const hasComparison = comparisonSignals.some((item) => item.readiness === "ready") || benchmarkSuites.some((item) => item.taskCount > 1 || item.baselineCount > 0);
  const hasReport = reportSignals.some((item) => item.readiness === "ready") || benchmarkSuites.some((item) => item.reportCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || benchmarkSuites.some((item) => item.ciCount > 0);

  const riskQueue: BenchmarkReadinessReport["riskQueue"] = [];
  if (!hasTool && !hasSuite) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a benchmark tool before claiming benchmark readiness.",
      why: "Benchmark readiness starts from a visible Vitest bench, Tinybench, Benchmark.js, Hyperfine, Criterion, pytest-benchmark, or go benchmark entrypoint.",
      relatedHref: "html/benchmark-readiness.html"
    });
  }
  if ((hasTool || hasSuite) && !hasTiming) {
    riskQueue.push({
      priority: "high",
      action: "Define warmup, iterations, runs, minimum runs, or a time window for benchmark stability.",
      why: "Benchmarks without repeated timing controls are too sensitive to startup, cache, and scheduler noise.",
      relatedHref: "html/benchmark-readiness.html"
    });
  }
  if ((hasTool || hasSuite) && !hasComparison) {
    riskQueue.push({
      priority: "medium",
      action: "Add baseline, comparison, parameter, or fastest/slowest evidence before relying on a single benchmark number.",
      why: "Benchmark review is more useful when it compares alternatives or tracks relative regressions.",
      relatedHref: "html/benchmark-readiness.html"
    });
  }
  if ((hasTool || hasSuite) && !hasReport) {
    riskQueue.push({
      priority: "medium",
      action: "Persist benchmark outputs as JSON, Markdown, CSV, HTML, JUnit, Bencher, step summary, or artifacts.",
      why: "Benchmark evidence should survive terminal output for trend review and regression triage.",
      relatedHref: "html/benchmark-readiness.html"
    });
  }
  if ((hasTool || hasSuite) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Document CI, schedule, or pull-request benchmark execution separately from local one-off runs.",
      why: "Continuous benchmarking needs controlled runtime placement, retained artifacts, and clear trigger scope.",
      relatedHref: "html/benchmark-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run benchmarks only in a controlled environment before treating static readiness as performance evidence.",
    why: "RepoTutor records benchmark readiness only; it does not execute benchmarks, pin CPU governors, or validate statistical significance.",
    relatedHref: "html/benchmark-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Benchmark readiness report: suite ${benchmarkSuites.length}개, timing signal ${timingSignals.length}개, comparison signal ${comparisonSignals.length}개, report signal ${reportSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Vitest bench Tinybench Benchmark.js Hyperfine Criterion pytest-benchmark Go benchmark warmup iterations samples ops/sec export-json regression threshold",
    benchmarkSuites,
    toolSignals,
    timingSignals,
    comparisonSignals,
    reportSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "npx vitest bench --run", purpose: "Run Vitest benchmark suites without interactive watch mode." },
      { command: "node benchmarks/example.bench.mjs", purpose: "Run a Tinybench or Benchmark.js benchmark entrypoint directly." },
      { command: "hyperfine --warmup 3 --runs 10 --export-json reports/hyperfine.json 'npm test'", purpose: "Run Hyperfine with retained JSON output." },
      { command: "cargo bench", purpose: "Run Rust Criterion or libtest benchmark suites." },
      { command: "pytest --benchmark-json reports/pytest-benchmark.json", purpose: "Run pytest-benchmark with retained JSON output." },
      { command: "go test -bench=. -benchmem ./...", purpose: "Run Go benchmarks with memory allocation reporting." },
      { command: "rg \"vitest bench|new Bench|Benchmark.Suite|hyperfine|cargo bench|pytest --benchmark|go test -bench\" .", purpose: "Trace benchmark entrypoints and commands statically." }
    ],
    learnerNextSteps: [
      "Start with the benchmark command, then read the benchmark task definitions and timing controls.",
      "Check whether the suite compares alternatives, baselines, or parameterized inputs rather than one isolated number.",
      "Confirm outputs are retained as artifacts, summaries, or trend reports.",
      "Separate local exploratory benchmarks from CI or scheduled regression benchmarks.",
      "This report is static readiness only. Real performance claims require controlled benchmark execution and review."
    ]
  };
}

type BenchmarkSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function benchmarkSourceFiles(walk: WalkResult): Promise<BenchmarkSourceFile[]> {
  const files: BenchmarkSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !benchmarkInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!benchmarkPathSignal(file.relPath) && !benchmarkContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 320) break;
  }
  return files;
}

function benchmarkInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|Cargo\.toml|go\.mod|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|py|rs|go|sh|csv)$/i.test(filePath);
}

function benchmarkPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(benchmarks?|benchmark|perf|performance|criterion)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(bench|benchmark)\.[cm]?[jt]s$/i.test(base)
    || /^(criterion\.toml|pytest\.ini)$/i.test(base);
}

function benchmarkContentSignal(text: string): boolean {
  return /(vitest\s+bench|from ["']vitest["']|bench\s*\(|new Bench|from ["']tinybench|Benchmark\.Suite|new Benchmark|hyperfine|--export-json|--export-markdown|criterion_group!|criterion_main!|pytest-benchmark|@pytest\.mark\.benchmark|go test -bench|func Benchmark\w+)/i.test(text);
}

function benchmarkSuiteRows(sourceFiles: BenchmarkSourceFile[]): BenchmarkReadinessReport["benchmarkSuites"] {
  const rows: BenchmarkReadinessReport["benchmarkSuites"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /new Bench|Benchmark\.Suite|vitest\s+bench|hyperfine|criterion_group!|pytest-benchmark|benchmark-min-rounds|go test -bench|bench\s*:/gi) + (benchmarkPathSignal(source.filePath) ? 1 : 0);
    const taskCount = countMatches(source.text, /bench(?:mark)?\s*\(|bench\.add|suite\.add|Benchmark\(|func\s+Benchmark\w+|c\.bench_function|@pytest\.mark\.benchmark|benchmark\(/gi);
    const warmupCount = countMatches(source.text, /warmup|--warmup|-w\s+\d+|warm_up|measurement_time|sample_size/gi);
    const iterationCount = countMatches(source.text, /iterations|--runs|-r\s+\d+|--min-runs|--max-runs|minTime|maxTime|time\s*:|sample_size|benchmark-min-rounds/gi);
    const parameterCount = countMatches(source.text, /--parameter-scan|--parameter-list|-P\s+|-L\s+|parameterized|params|table\(|forEach|matrix/gi);
    const hookCount = countMatches(source.text, /setup|teardown|beforeAll|afterAll|beforeEach|afterEach|--prepare|--cleanup/gi);
    const asyncCount = countMatches(source.text, /async|defer|Deferred|await|Promise|deferred\.resolve/gi);
    const baselineCount = countMatches(source.text, /baseline|compare|fastest|slowest|relative|regression|threshold|bencher|find\(['"]fastest|find\(['"]slowest/gi);
    const reportCount = countMatches(source.text, /console\.table|bench\.table|--export-json|--export-markdown|--export-csv|json|markdown|csv|html|junit|GITHUB_STEP_SUMMARY|upload-artifact|bencher/gi);
    const ciCount = countMatches(source.text, /^\.github\/workflows\/|GitHub Actions|pull_request|schedule|workflow|actions\/|upload-artifact/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = configCount + taskCount + warmupCount + iterationCount + parameterCount + hookCount + asyncCount + baselineCount + reportCount + ciCount;
    if (totalSignals === 0 && !benchmarkPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: benchmarkTool(source),
      configCount,
      taskCount,
      warmupCount,
      iterationCount,
      parameterCount,
      hookCount,
      asyncCount,
      baselineCount,
      reportCount,
      ciCount,
      readiness: (configCount > 0 || taskCount > 0) && (warmupCount > 0 || iterationCount > 0) && (reportCount > 0 || baselineCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, tasks ${taskCount}, warmup ${warmupCount}, iterations ${iterationCount}, parameters ${parameterCount}, hooks ${hookCount}, async ${asyncCount}, baseline ${baselineCount}, reports ${reportCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.configCount + b.taskCount + b.warmupCount + b.iterationCount + b.reportCount + b.ciCount;
    const aScore = a.configCount + a.taskCount + a.warmupCount + a.iterationCount + a.reportCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function benchmarkTool(source: BenchmarkSourceFile): BenchmarkReadinessReport["benchmarkSuites"][number]["tool"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/tinybench|new Bench\b|bench\.add|bench\.run|bench\.table/i.test(haystack)) return "tinybench";
  if (/vitest\s+bench|from ["']vitest["']|\bbench\s*\(/.test(haystack)) return "vitest-bench";
  if (/benchmark\.js|Benchmark\.Suite|new Benchmark|suite\.add/i.test(haystack)) return "benchmark-js";
  if (/hyperfine|--export-json|--parameter-scan|--warmup/i.test(haystack)) return "hyperfine";
  if (/criterion|criterion_group!|criterion_main!|c\.bench_function|cargo bench/i.test(haystack)) return "criterion";
  if (/pytest-benchmark|@pytest\.mark\.benchmark|benchmark\(/i.test(haystack)) return "pytest-benchmark";
  if (/go test -bench|func\s+Benchmark\w+|testing\.B/i.test(haystack)) return "go-bench";
  if (/benchmark|microbench|performance regression/i.test(haystack)) return "custom";
  return "unknown";
}

function benchmarkToolSignals(sourceFiles: BenchmarkSourceFile[]): BenchmarkReadinessReport["toolSignals"] {
  const specs: Array<{ signal: BenchmarkReadinessReport["toolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest-bench", pattern: /vitest\s+bench|from ["']vitest["']|\bbench\s*\(/, evidence: "Vitest bench evidence was detected." },
    { signal: "tinybench", pattern: /tinybench|new Bench\b|bench\.add|bench\.run|bench\.table/i, evidence: "Tinybench evidence was detected." },
    { signal: "benchmark-js", pattern: /benchmark\.js|Benchmark\.Suite|new Benchmark|suite\.add/i, evidence: "Benchmark.js evidence was detected." },
    { signal: "hyperfine", pattern: /hyperfine|--export-json|--parameter-scan|--warmup/i, evidence: "Hyperfine command evidence was detected." },
    { signal: "criterion", pattern: /criterion|criterion_group!|criterion_main!|c\.bench_function|cargo bench/i, evidence: "Criterion/Rust benchmark evidence was detected." },
    { signal: "pytest-benchmark", pattern: /pytest-benchmark|@pytest\.mark\.benchmark|benchmark\(/i, evidence: "pytest-benchmark evidence was detected." },
    { signal: "go-bench", pattern: /go test -bench|func\s+Benchmark\w+|testing\.B/i, evidence: "Go benchmark evidence was detected." }
  ];
  return benchmarkSignalFromSpecs(sourceFiles, specs, "tool", "signal");
}

function benchmarkTimingSignals(sourceFiles: BenchmarkSourceFile[]): BenchmarkReadinessReport["timingSignals"] {
  const specs: Array<{ signal: BenchmarkReadinessReport["timingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hrtime", pattern: /process\.hrtime|hrtimeNow/i, evidence: "high-resolution process.hrtime timing evidence was detected." },
    { signal: "performance-now", pattern: /performance\.now|performanceNow/i, evidence: "performance.now timing evidence was detected." },
    { signal: "warmup", pattern: /warmup|--warmup|-w\s+\d+|warm_up/i, evidence: "warmup evidence was detected." },
    { signal: "iterations", pattern: /iterations|warmupIterations|benchmark-min-rounds/i, evidence: "iteration count evidence was detected." },
    { signal: "runs", pattern: /--runs|-r\s+\d+|runs\s*:/i, evidence: "run count evidence was detected." },
    { signal: "min-runs", pattern: /--min-runs|--max-runs|min_rounds|max_rounds/i, evidence: "minimum/maximum run bound evidence was detected." },
    { signal: "time-window", pattern: /time\s*:|minTime|maxTime|measurement_time|--time-unit/i, evidence: "time-window evidence was detected." },
    { signal: "samples", pattern: /samples|sample_size|retainSamples|sampleCount/i, evidence: "sample count/statistics evidence was detected." },
    { signal: "concurrency", pattern: /concurrency|parallel|workers?|threads?/i, evidence: "benchmark concurrency evidence was detected." },
    { signal: "async", pattern: /async|await|defer|Deferred|Promise|deferred\.resolve/i, evidence: "async/deferred benchmark evidence was detected." },
    { signal: "gc-control", pattern: /global\.gc|--expose-gc|drop_caches|garbage collector/i, evidence: "GC/cache control evidence was detected." }
  ];
  return benchmarkSignalFromSpecs(sourceFiles, specs, "timing", "signal");
}

function benchmarkComparisonSignals(sourceFiles: BenchmarkSourceFile[]): BenchmarkReadinessReport["comparisonSignals"] {
  const specs: Array<{ signal: BenchmarkReadinessReport["comparisonSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "suite", pattern: /Benchmark\.Suite|new Bench|describe\(|suite/i, evidence: "benchmark suite evidence was detected." },
    { signal: "tasks", pattern: /bench\.add|suite\.add|bench\s*\(|func\s+Benchmark\w+|c\.bench_function/i, evidence: "benchmark task evidence was detected." },
    { signal: "baseline", pattern: /baseline|before|reference|control/i, evidence: "baseline/reference evidence was detected." },
    { signal: "compare", pattern: /compare|bench\.compare|comparison/i, evidence: "comparison evidence was detected." },
    { signal: "fastest-slowest", pattern: /fastest|slowest|find\(['"]fastest|find\(['"]slowest/i, evidence: "fastest/slowest comparison evidence was detected." },
    { signal: "parameter-scan", pattern: /--parameter-scan|-P\s+|parameter scan/i, evidence: "parameter scan evidence was detected." },
    { signal: "parameter-list", pattern: /--parameter-list|-L\s+|parameter list/i, evidence: "parameter list evidence was detected." },
    { signal: "relative-times", pattern: /relative time|relative-times|relative speed|ratio/i, evidence: "relative timing evidence was detected." },
    { signal: "regression-threshold", pattern: /regression|threshold|fail-under|fail_on_regression|alert-threshold/i, evidence: "regression threshold evidence was detected." },
    { signal: "statistical-significance", pattern: /standard deviation|stddev|margin of error|rme|moe|percentile|confidence/i, evidence: "statistical significance evidence was detected." }
  ];
  return benchmarkSignalFromSpecs(sourceFiles, specs, "comparison", "signal");
}

function benchmarkReportSignals(sourceFiles: BenchmarkSourceFile[]): BenchmarkReadinessReport["reportSignals"] {
  const specs: Array<{ signal: BenchmarkReadinessReport["reportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "console-table", pattern: /console\.table|bench\.table/i, evidence: "console table benchmark output evidence was detected." },
    { signal: "json", pattern: /--export-json|benchmark-json|\.json|JSON\.stringify/i, evidence: "JSON benchmark output evidence was detected." },
    { signal: "markdown", pattern: /--export-markdown|\.md|markdown/i, evidence: "Markdown benchmark output evidence was detected." },
    { signal: "csv", pattern: /--export-csv|\.csv|CSV/i, evidence: "CSV benchmark output evidence was detected." },
    { signal: "html", pattern: /\.html|html report|criterion\/report/i, evidence: "HTML benchmark report evidence was detected." },
    { signal: "junit", pattern: /junit|xunit/i, evidence: "JUnit/xUnit benchmark report evidence was detected." },
    { signal: "bencher", pattern: /bencher|BENCHER_API_TOKEN|bencher run/i, evidence: "Bencher continuous benchmark evidence was detected." },
    { signal: "github-step-summary", pattern: /GITHUB_STEP_SUMMARY|step summary/i, evidence: "GitHub step summary evidence was detected." },
    { signal: "artifact-upload", pattern: /actions\/upload-artifact|upload-artifact|artifact.*benchmark/i, evidence: "benchmark artifact upload evidence was detected." },
    { signal: "trend-history", pattern: /trend|history|baseline branch|compare.*main/i, evidence: "benchmark trend/history evidence was detected." }
  ];
  return benchmarkSignalFromSpecs(sourceFiles, specs, "report", "signal");
}

function benchmarkCiSignals(sourceFiles: BenchmarkSourceFile[]): BenchmarkReadinessReport["ciSignals"] {
  const specs: Array<{ signal: BenchmarkReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout/i, evidence: "GitHub Actions benchmark workflow evidence was detected." },
    { signal: "scheduled", pattern: /schedule:|cron:/i, evidence: "scheduled benchmark run evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|pull-request|pr benchmark/i, evidence: "pull-request benchmark trigger evidence was detected." },
    { signal: "hyperfine-command", pattern: /hyperfine\s+/i, evidence: "Hyperfine command evidence was detected." },
    { signal: "vitest-bench-command", pattern: /vitest\s+bench/i, evidence: "Vitest bench command evidence was detected." },
    { signal: "cargo-bench-command", pattern: /cargo\s+bench/i, evidence: "cargo bench command evidence was detected." },
    { signal: "pytest-benchmark-command", pattern: /pytest\s+.*--benchmark|pytest-benchmark/i, evidence: "pytest-benchmark command evidence was detected." },
    { signal: "go-test-bench-command", pattern: /go\s+test\s+.*-bench/i, evidence: "go test -bench command evidence was detected." },
    { signal: "benchmarkjs-command", pattern: /node\s+.*bench|benchmark\.js/i, evidence: "Benchmark.js node command evidence was detected." }
  ];
  return benchmarkSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function benchmarkPackageSignals(sourceFiles: BenchmarkSourceFile[]): BenchmarkReadinessReport["packageSignals"] {
  const specs: Array<{ signal: BenchmarkReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tinybench", pattern: /"tinybench"|from ["']tinybench|new Bench/i, evidence: "tinybench package/API evidence was detected." },
    { signal: "benchmark", pattern: /"benchmark"|benchmark\.js|Benchmark\.Suite|new Benchmark/i, evidence: "Benchmark.js package/API evidence was detected." },
    { signal: "hyperfine", pattern: /hyperfine|cargo install.*hyperfine|brew install hyperfine/i, evidence: "Hyperfine package/command evidence was detected." },
    { signal: "criterion", pattern: /criterion|criterion_group!|criterion_main!/i, evidence: "Criterion package/API evidence was detected." },
    { signal: "pytest-benchmark", pattern: /pytest-benchmark|benchmark-min-rounds/i, evidence: "pytest-benchmark package/config evidence was detected." },
    { signal: "bencher", pattern: /bencher|BENCHER_API_TOKEN/i, evidence: "Bencher package/CLI evidence was detected." },
    { signal: "vitest", pattern: /"vitest"|vitest\s+bench|from ["']vitest["']/i, evidence: "Vitest benchmark package/command evidence was detected." }
  ];
  return benchmarkSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function benchmarkSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: BenchmarkSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/benchmark-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
