import type { ObservabilityReport, PerformanceReport, ProfilingReadinessReport, RuntimeEnvironmentReport, TracingReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildObservabilityReport(
  walk: WalkResult,
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): Promise<ObservabilityReport> {
  const sourceFiles = await observabilitySourceFiles(walk);
  const instrumentationSignals = sourceFiles
    .map((item) => observabilityInstrumentationSignal(item))
    .filter((item): item is ObservabilityReport["instrumentationSignals"][number] => Boolean(item))
    .slice(0, 80);
  const exporterTargets = observabilityExporterTargets(sourceFiles);
  const resourceAttributes = observabilityResourceAttributes(sourceFiles);
  const propagationContext = observabilityPropagationContext(sourceFiles);
  const diagnostics = observabilityDiagnostics(sourceFiles, runtimeEnvironmentReport);
  const hasInstrumentation = instrumentationSignals.length > 0;
  const hasExporter = exporterTargets.some((item) => item.target !== "none" && item.readiness !== "missing");
  const hasResourceName = resourceAttributes.some((item) => item.attribute === "service.name" && item.readiness === "ready");
  const hasShutdown = diagnostics.some((item) => item.check === "shutdown" && item.status === "ready");
  const hasCollectorEndpoint = diagnostics.some((item) => item.check === "collector-endpoint" && item.status === "ready");
  const signalPipelines: ObservabilityReport["signalPipelines"] = (["traces", "metrics", "logs"] as const).map((signal) => {
    const signalInstrumentation = instrumentationSignals.filter((item) => item.signal === signal || item.signal === "mixed");
    const signalExporters = exporterTargets.filter((item) => item.target !== "none" && (item.signal === signal || item.signal === "mixed"));
    const readiness = signalInstrumentation.length > 0 && signalExporters.length > 0
      ? "ready"
      : signalInstrumentation.length > 0 || signalExporters.length > 0
        ? "partial"
        : "missing";
    const relatedHref = signalInstrumentation[0]?.sourceHref ?? signalExporters[0]?.relatedHref ?? "html/observability.html";
    return {
      signal,
      readiness,
      evidence: readiness === "ready"
        ? `${signal} pipeline has instrumentation and exporter evidence.`
        : readiness === "partial"
          ? `${signal} pipeline has only one side of instrumentation/export evidence.`
          : `${signal} pipeline was not detected in static repository files.`,
      relatedHref
    };
  });

  const riskQueue: ObservabilityReport["riskQueue"] = [];
  if (!hasInstrumentation) {
    riskQueue.push({
      priority: "high",
      action: "Add OpenTelemetry SDK setup and at least one auto or manual instrumentation entrypoint.",
      why: "Traces, metrics, and logs cannot be collected until application code starts providers or instrumentation.",
      relatedHref: "html/observability.html"
    });
  }
  if (hasInstrumentation && !hasExporter) {
    riskQueue.push({
      priority: "high",
      action: "Configure an OTLP, Prometheus, console, Jaeger, Zipkin, or vendor exporter before relying on telemetry.",
      why: "Instrumented signals need a destination or they will remain local process data.",
      relatedHref: "html/observability.html"
    });
  }
  if (hasInstrumentation && !hasResourceName) {
    riskQueue.push({
      priority: "medium",
      action: "Set service.name with resourceFromAttributes, OTEL_SERVICE_NAME, or OTEL_RESOURCE_ATTRIBUTES.",
      why: "Backends group telemetry by resource attributes; missing service.name makes traces and metrics hard to read.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasInstrumentation && !hasCollectorEndpoint) {
    riskQueue.push({
      priority: "medium",
      action: "Document collector endpoint variables such as OTEL_EXPORTER_OTLP_ENDPOINT for local and CI runs.",
      why: "A repeatable endpoint makes telemetry smoke tests deterministic.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasInstrumentation && !hasShutdown) {
    riskQueue.push({
      priority: "medium",
      action: "Flush or shutdown SDK providers on process exit.",
      why: "Short-lived CLIs and tests can lose spans or metrics without explicit provider shutdown.",
      relatedHref: "html/observability.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original app with a collector before treating this report as an observability pass.",
    why: "RepoTutor only performs static readiness analysis and does not receive spans, metrics, or logs.",
    relatedHref: "html/observability.html"
  });

  return {
    summary: `OpenTelemetry식 observability readiness report: signal pipeline ${signalPipelines.length}개, instrumentation signal ${instrumentationSignals.length}개, exporter target ${exporterTargets.length}개, diagnostic ${diagnostics.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OpenTelemetry traces metrics logs resource context propagation exporter instrumentation semantic conventions diagnostics",
    signalPipelines,
    instrumentationSignals,
    exporterTargets,
    resourceAttributes,
    propagationContext,
    diagnostics,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: "OTEL_SERVICE_NAME=<service> OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 node -r ./tracing.js app.js",
        purpose: "Start a Node app with a preload tracing setup and an OTLP collector endpoint."
      },
      {
        command: "curl -s http://localhost:9464/metrics",
        purpose: "Check a Prometheus exporter endpoint after metrics are enabled."
      },
      {
        command: "OTEL_LOG_LEVEL=debug node -r ./tracing.js app.js",
        purpose: "Turn on OpenTelemetry diagnostics while debugging instrumentation setup."
      },
      {
        command: "docker run --rm -p 4317:4317 -p 4318:4318 otel/opentelemetry-collector-contrib:latest",
        purpose: "Run a local collector target for OTLP smoke tests."
      },
      {
        command: "npm ls @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node",
        purpose: "Confirm the Node OpenTelemetry API, SDK, and auto-instrumentation packages are installed together."
      }
    ],
    learnerNextSteps: [
      "먼저 traces, metrics, logs 중 어떤 signal pipeline이 필요한지 정하고 instrumentation entrypoint를 찾으세요.",
      "instrumentation만 있고 exporter가 없으면 telemetry가 backend로 나가지 않습니다.",
      "service.name, deployment.environment, service.version 같은 resource attribute를 먼저 고정하세요.",
      "이 리포트는 OpenTelemetry 실행 결과가 아닙니다. 실제 spans, metrics, logs는 원본 앱과 collector에서 별도 확인하세요."
    ]
  };
}

type ObservabilitySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function observabilitySourceFiles(walk: WalkResult): Promise<ObservabilitySourceFile[]> {
  const files: ObservabilitySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !observabilityInspectablePath(file.relPath)) continue;
    const pathCandidate = observabilityPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !observabilityContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 120) break;
  }
  return files;
}

function observabilityInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(Dockerfile|docker-compose\.ya?ml|package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|requirements.*\.txt|pyproject\.toml|go\.mod|Cargo\.toml)$/i.test(base)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|toml|md|py|go|rs|java|kt|cs|rb|php|sh|env|conf|ini)$/i.test(filePath);
}

function observabilityPathSignal(filePath: string): boolean {
  return /(opentelemetry|otel|observability|telemetry|tracing|trace|metrics?|prometheus|jaeger|zipkin|grafana|tempo|sentry|datadog|newrelic|honeycomb|logger|logging|instrument)/i.test(filePath);
}

function observabilityContentSignal(text: string): boolean {
  return /(@opentelemetry|opentelemetry|OpenTelemetry|OTEL_|NodeSDK|TracerProvider|MeterProvider|LoggerProvider|getNodeAutoInstrumentations|getTracer|startSpan|createCounter|createHistogram|PrometheusExporter|OTLP|ConsoleSpanExporter|JaegerExporter|ZipkinExporter|resourceFromAttributes|ATTR_SERVICE_NAME|W3CTraceContextPropagator|W3CBaggagePropagator|B3Propagator|AsyncHooksContextManager|ZoneContextManager|diag\.setLogger|DiagConsoleLogger)/i.test(text);
}

function observabilityInstrumentationSignal(source: ObservabilitySourceFile): ObservabilityReport["instrumentationSignals"][number] | null {
  const { filePath, text, sourceHref } = source;
  if (!/(@opentelemetry|opentelemetry|NodeSDK|TracerProvider|MeterProvider|LoggerProvider|getNodeAutoInstrumentations|getTracer|startSpan|metrics\.getMeter|createCounter|createHistogram|getLogger|instrumentation)/i.test(text)) return null;
  const signal = observabilitySignalForText(text);
  const kind = observabilityInstrumentationKind(filePath, text);
  return {
    filePath,
    kind,
    signal,
    evidence: observabilityInstrumentationEvidence(kind, signal, filePath, text),
    sourceHref
  };
}

function observabilitySignalForText(text: string): ObservabilityReport["instrumentationSignals"][number]["signal"] {
  const hasTrace = /\b(trace|tracer|span|TracerProvider|startSpan|getTracer|NodeTracerProvider|traceparent)\b/i.test(text);
  const hasMetrics = /\b(metric|meter|counter|histogram|MeterProvider|PrometheusExporter|metrics\.getMeter|createCounter|createHistogram)\b/i.test(text);
  const hasLogs = /\b(logs?|logger|LoggerProvider|getLogger|diag\.setLogger|DiagConsoleLogger)\b/i.test(text);
  const count = [hasTrace, hasMetrics, hasLogs].filter(Boolean).length;
  if (count > 1) return "mixed";
  if (hasMetrics) return "metrics";
  if (hasLogs) return "logs";
  return "traces";
}

function observabilityInstrumentationKind(filePath: string, text: string): ObservabilityReport["instrumentationSignals"][number]["kind"] {
  if (/getNodeAutoInstrumentations|auto-instrumentations|autoInstrumentations/i.test(text)) return "auto";
  if (/express|fastify|koa|hapi|middleware|interceptor|filter/i.test(text)) return "middleware";
  if (/browser|web|fetch|XMLHttpRequest|document\.|window\./i.test(filePath) || /browser|fetch|XMLHttpRequest|document\.|window\./i.test(text)) return "browser";
  if (/node|http|https|grpc|server|listen\(|Fastify|Express/i.test(filePath) || /node|http|https|grpc|server|listen\(|Fastify|Express/i.test(text)) return "server";
  if (/getTracer|startSpan|metrics\.getMeter|createCounter|createHistogram|getLogger|new\s+(NodeSDK|MeterProvider|TracerProvider|LoggerProvider)/i.test(text)) return "manual";
  return "unknown";
}

function observabilityInstrumentationEvidence(
  kind: ObservabilityReport["instrumentationSignals"][number]["kind"],
  signal: ObservabilityReport["instrumentationSignals"][number]["signal"],
  filePath: string,
  text: string
): string {
  if (/getNodeAutoInstrumentations|auto-instrumentations/i.test(text)) return `${filePath} configures OpenTelemetry auto-instrumentation for ${signal}.`;
  if (/NodeSDK|TracerProvider|MeterProvider|LoggerProvider/i.test(text)) return `${filePath} starts an OpenTelemetry SDK/provider for ${signal}.`;
  if (/getTracer|startSpan/i.test(text)) return `${filePath} creates manual trace spans.`;
  if (/metrics\.getMeter|createCounter|createHistogram/i.test(text)) return `${filePath} creates manual metric instruments.`;
  if (/getLogger|LoggerProvider|diag\.setLogger/i.test(text)) return `${filePath} contains logging or diagnostic telemetry setup.`;
  return `${filePath} has ${kind} observability instrumentation evidence for ${signal}.`;
}

function observabilityExporterTargets(sourceFiles: ObservabilitySourceFile[]): ObservabilityReport["exporterTargets"] {
  const specs: Array<{
    target: Exclude<ObservabilityReport["exporterTargets"][number]["target"], "none">;
    signal: ObservabilityReport["exporterTargets"][number]["signal"];
    pattern: RegExp;
    evidence: (filePath: string) => string;
  }> = [
    { target: "otlp", signal: "mixed", pattern: /OTLP|otlp|OTEL_EXPORTER_OTLP|collector|4317|4318/i, evidence: (filePath) => `${filePath} references OTLP or collector endpoint configuration.` },
    { target: "console", signal: "mixed", pattern: /ConsoleSpanExporter|ConsoleMetricExporter|ConsoleLogRecordExporter|console exporter/i, evidence: (filePath) => `${filePath} references a console exporter for local telemetry inspection.` },
    { target: "prometheus", signal: "metrics", pattern: /PrometheusExporter|prom-client|\/metrics\b|9464/i, evidence: (filePath) => `${filePath} references Prometheus metrics export.` },
    { target: "jaeger", signal: "traces", pattern: /JaegerExporter|jaeger/i, evidence: (filePath) => `${filePath} references Jaeger trace export.` },
    { target: "zipkin", signal: "traces", pattern: /ZipkinExporter|zipkin/i, evidence: (filePath) => `${filePath} references Zipkin trace export.` },
    { target: "vendor", signal: "mixed", pattern: /sentry|datadog|honeycomb|dynatrace|newrelic|grafana|tempo|splunk|lightstep/i, evidence: (filePath) => `${filePath} references a vendor observability backend.` }
  ];
  const targets: ObservabilityReport["exporterTargets"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((item) => spec.pattern.test(item.text) || spec.pattern.test(item.filePath));
    if (!match) continue;
    targets.push({
      target: spec.target,
      signal: spec.signal,
      readiness: "ready",
      evidence: spec.evidence(match.filePath),
      relatedHref: match.sourceHref
    });
  }
  if (targets.length === 0) {
    targets.push({
      target: "none",
      signal: "mixed",
      readiness: "missing",
      evidence: "No OTLP, Prometheus, console, Jaeger, Zipkin, or vendor exporter signal was detected.",
      relatedHref: "html/observability.html"
    });
  }
  return targets;
}

function observabilityResourceAttributes(sourceFiles: ObservabilitySourceFile[]): ObservabilityReport["resourceAttributes"] {
  const specs = [
    { attribute: "service.name", pattern: /ATTR_SERVICE_NAME|service\.name|OTEL_SERVICE_NAME|serviceName/i },
    { attribute: "service.version", pattern: /service\.version|ATTR_SERVICE_VERSION|OTEL_SERVICE_VERSION|npm_package_version/i },
    { attribute: "deployment.environment", pattern: /deployment\.environment|DEPLOYMENT_ENVIRONMENT|OTEL_RESOURCE_ATTRIBUTES|NODE_ENV/i },
    { attribute: "resource", pattern: /resourceFromAttributes|new\s+Resource|Resource\.default|resources?/i }
  ];
  const rows: ObservabilityReport["resourceAttributes"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((item) => spec.pattern.test(item.text));
    if (!match) continue;
    rows.push({
      attribute: spec.attribute,
      source: match.filePath,
      readiness: spec.attribute === "resource" ? "partial" : "ready",
      evidence: `${match.filePath} contains ${spec.attribute} resource attribute evidence.`,
      relatedHref: match.sourceHref
    });
  }
  return rows.slice(0, 30);
}

function observabilityPropagationContext(sourceFiles: ObservabilitySourceFile[]): ObservabilityReport["propagationContext"] {
  const specs: Array<{
    mechanism: ObservabilityReport["propagationContext"][number]["mechanism"];
    pattern: RegExp;
    externalEvidence: string;
  }> = [
    { mechanism: "trace-context", pattern: /W3CTraceContextPropagator|traceparent|trace-context/i, externalEvidence: "W3C trace context is the default OpenTelemetry propagation baseline for most SDKs." },
    { mechanism: "baggage", pattern: /W3CBaggagePropagator|\bbaggage\b/i, externalEvidence: "Baggage propagation is external until explicitly configured or verified in requests." },
    { mechanism: "b3", pattern: /B3Propagator|\bb3\b/i, externalEvidence: "B3 propagation is external unless Zipkin/B3 compatibility is configured." },
    { mechanism: "async-context", pattern: /AsyncLocalStorage|AsyncHooksContextManager|context-async-hooks/i, externalEvidence: "Node async context propagation depends on the runtime context manager." },
    { mechanism: "zone-context", pattern: /ZoneContextManager|context-zone|zone\.js/i, externalEvidence: "Browser zone context propagation depends on zone.js or a web context manager." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((item) => spec.pattern.test(item.text) || spec.pattern.test(item.filePath));
    return {
      mechanism: spec.mechanism,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} contains ${spec.mechanism} propagation evidence.` : spec.externalEvidence,
      relatedHref: match?.sourceHref ?? "html/observability.html"
    };
  });
}

function observabilityDiagnostics(
  sourceFiles: ObservabilitySourceFile[],
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): ObservabilityReport["diagnostics"] {
  const runtimeSignalCount = runtimeEnvironmentReport.detectedManifests.length
    + runtimeEnvironmentReport.setupSignals.length
    + runtimeEnvironmentReport.containerSignals.length;
  const checks: Array<{
    check: ObservabilityReport["diagnostics"][number]["check"];
    pattern: RegExp | null;
    readyEvidence: (filePath: string) => string;
    missingEvidence: string;
  }> = [
    { check: "diag-logger", pattern: /diag\.setLogger|DiagConsoleLogger|DiagLogLevel|OTEL_LOG_LEVEL/i, readyEvidence: (filePath) => `${filePath} configures OpenTelemetry diagnostics logging.`, missingEvidence: "No OpenTelemetry diagnostic logger or OTEL_LOG_LEVEL setup was detected." },
    { check: "collector-endpoint", pattern: /OTEL_EXPORTER_OTLP_ENDPOINT|collector|4317|4318|OTLP/i, readyEvidence: (filePath) => `${filePath} documents an OTLP collector endpoint.`, missingEvidence: "No collector endpoint or OTLP environment variable was detected." },
    { check: "shutdown", pattern: /sdk\.shutdown|provider\.shutdown|shutdown\(\)|process\.on\(['"]SIG(INT|TERM)['"]/i, readyEvidence: (filePath) => `${filePath} flushes or shuts down telemetry providers.`, missingEvidence: "No SDK/provider shutdown path was detected." },
    { check: "sampling", pattern: /Sampler|sampling|OTEL_TRACES_SAMPLER|TraceIdRatioBasedSampler|ParentBasedSampler/i, readyEvidence: (filePath) => `${filePath} contains trace sampling configuration.`, missingEvidence: "No trace sampler policy was detected." },
    { check: "attribute-limits", pattern: /attributeCountLimit|attributeValueLengthLimit|spanLimits|metricReader|OTEL_ATTRIBUTE/i, readyEvidence: (filePath) => `${filePath} references attribute limits or metric reader controls.`, missingEvidence: "No attribute limit or reader control was detected." },
    { check: "runtime-support", pattern: null, readyEvidence: () => "Runtime manifests and setup/container signals exist for telemetry smoke tests.", missingEvidence: "Runtime manifest/setup/container evidence is sparse." }
  ];
  return checks.map((item) => {
    if (item.check === "runtime-support") {
      return {
        check: item.check,
        status: runtimeSignalCount >= 2 ? "ready" : runtimeSignalCount === 1 ? "partial" : "missing",
        evidence: runtimeSignalCount >= 2 ? item.readyEvidence("runtime-environment-report") : item.missingEvidence,
        relatedHref: "html/runtime-environment.html"
      };
    }
    const match = item.pattern ? sourceFiles.find((source) => item.pattern?.test(source.text) || item.pattern?.test(source.filePath)) : null;
    return {
      check: item.check,
      status: match ? "ready" : sourceFiles.length > 0 ? "partial" : "missing",
      evidence: match ? item.readyEvidence(match.filePath) : item.missingEvidence,
      relatedHref: match?.sourceHref ?? "html/observability.html"
    };
  });
}

export async function buildPerformanceReport(
  walk: WalkResult,
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): Promise<PerformanceReport> {
  const sourceFiles = await performanceSourceFiles(walk);
  const scriptTargets = performanceScriptTargets(sourceFiles);
  const workloadModels = performanceWorkloadModels(sourceFiles);
  const thresholds = performanceThresholds(sourceFiles);
  const checks = performanceChecks(sourceFiles);
  const metrics = performanceMetrics(sourceFiles);
  const outputs = performanceOutputs(sourceFiles);
  const runtimeControls = performanceRuntimeControls(sourceFiles, runtimeEnvironmentReport);
  const hasScript = scriptTargets.some((item) => item.readiness === "ready");
  const hasWorkload = workloadModels.some((item) => item.readiness === "ready");
  const hasThreshold = thresholds.length > 0;
  const hasCheck = checks.length > 0;
  const hasOutput = outputs.some((item) => item.target !== "none" && item.readiness !== "missing");

  const riskQueue: PerformanceReport["riskQueue"] = [];
  if (!hasScript) {
    riskQueue.push({
      priority: "high",
      action: "Add a k6 script or package script before claiming load-test coverage.",
      why: "k6-style performance testing needs a runnable JavaScript scenario or documented CLI target.",
      relatedHref: "html/performance.html"
    });
  }
  if (hasScript && !hasWorkload) {
    riskQueue.push({
      priority: "high",
      action: "Define stages or scenarios with an explicit executor and traffic model.",
      why: "A load test without a workload model cannot explain VUs, arrival rate, duration, or iteration shape.",
      relatedHref: "html/performance.html"
    });
  }
  if (hasScript && !hasThreshold) {
    riskQueue.push({
      priority: "medium",
      action: "Add thresholds for latency, error rate, and key custom metrics.",
      why: "Thresholds turn performance runs into pass/fail SLO checks instead of screenshots.",
      relatedHref: "html/performance.html"
    });
  }
  if (hasScript && !hasCheck) {
    riskQueue.push({
      priority: "medium",
      action: "Add checks for expected status codes or response invariants.",
      why: "A fast endpoint can still be functionally wrong under load.",
      relatedHref: "html/api-contracts.html"
    });
  }
  if (hasScript && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Configure summary, JSON, cloud, Prometheus, InfluxDB, StatsD, or OpenTelemetry output.",
      why: "Performance evidence needs a retained result artifact or metrics backend.",
      relatedHref: "html/performance.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run k6 against the original service before treating this report as a performance result.",
    why: "RepoTutor only performs static readiness analysis and does not generate load.",
    relatedHref: "html/performance.html"
  });

  return {
    summary: `k6식 performance readiness report: script target ${scriptTargets.length}개, workload model ${workloadModels.length}개, threshold ${thresholds.length}개, runtime control ${runtimeControls.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "k6 load testing scripts scenarios executors thresholds checks metrics outputs summaries cloud performance SLO",
    scriptTargets,
    workloadModels,
    thresholds,
    checks,
    metrics,
    outputs,
    runtimeControls,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "k6 run performance/load-test.js", purpose: "Run a committed k6 script locally and inspect the terminal summary." },
      { command: "k6 run --vus 10 --duration 30s performance/load-test.js", purpose: "Override VU and duration controls for a quick smoke load run." },
      { command: "k6 run --summary-export reports/k6-summary.json performance/load-test.js", purpose: "Persist a JSON summary artifact for CI review." },
      { command: "K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write k6 run -o experimental-prometheus-rw performance/load-test.js", purpose: "Stream metrics to Prometheus remote write when a backend is available." },
      { command: "k6 cloud run performance/load-test.js", purpose: "Run a Grafana Cloud k6 test after credentials and stack settings are configured." }
    ],
    learnerNextSteps: [
      "먼저 runnable k6 script나 package script가 있는지 확인하세요.",
      "stages/scenarios/executor가 없으면 부하 모델을 설명할 수 없습니다.",
      "thresholds와 checks를 함께 두어 latency SLO와 기능적 정상성을 동시에 확인하세요.",
      "이 리포트는 k6 실행 결과가 아닙니다. 실제 성능 판단은 원본 서비스에서 별도 실행하세요."
    ]
  };
}

type PerformanceSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function performanceSourceFiles(walk: WalkResult): Promise<PerformanceSourceFile[]> {
  const files: PerformanceSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !performanceInspectablePath(file.relPath)) continue;
    const pathCandidate = performancePathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !performanceContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 120) break;
  }
  return files;
}

function performanceInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|docker-compose\.ya?ml|Dockerfile)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|sh)$/i.test(filePath);
}

function performancePathSignal(filePath: string): boolean {
  return /(k6|load[-_ ]?test|performance|perf|benchmark|stress|soak|spike|threshold|scenario|grafana|prometheus|influx|statsd)/i.test(filePath);
}

function performanceContentSignal(text: string): boolean {
  return /\b(k6 run|from ["']k6|k6\/http|export const options|thresholds|scenarios|stages|vus|duration|executor|check\(|Trend|Counter|Rate|Gauge|handleSummary|summary-export|experimental-prometheus-rw|K6_|http_req_duration)\b/i.test(text);
}

function performanceScriptTargets(sourceFiles: PerformanceSourceFile[]): PerformanceReport["scriptTargets"] {
  const rows: PerformanceReport["scriptTargets"] = [];
  for (const source of sourceFiles) {
    const isK6Script = /from ["']k6|k6\/http|export const options|check\(|sleep\(/i.test(source.text);
    const isPackageScript = path.basename(source.filePath) === "package.json" && /k6\s+run|load[-_:]?test|performance/i.test(source.text);
    const isWorkflow = /^\.github\/workflows\//i.test(source.filePath) && /k6\s+run|grafana\/k6-action|load test|performance/i.test(source.text);
    const isConfig = /\.(json|ya?ml|toml|md|sh)$/i.test(source.filePath) && /k6\s+run|K6_|thresholds|scenarios/i.test(source.text);
    if (!isK6Script && !isPackageScript && !isWorkflow && !isConfig) continue;
    rows.push({
      filePath: source.filePath,
      kind: isK6Script ? "k6-script" : isPackageScript ? "package-script" : isWorkflow ? "ci-workflow" : isConfig ? "config" : "unknown",
      readiness: isK6Script || isPackageScript || isWorkflow ? "ready" : "partial",
      evidence: performanceTargetEvidence(source.filePath, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 60);
}

function performanceTargetEvidence(filePath: string, text: string): string {
  if (/from ["']k6|k6\/http/i.test(text)) return `${filePath} imports k6 modules for a runnable load-test script.`;
  if (/k6\s+run/i.test(text)) return `${filePath} documents a k6 run command.`;
  if (/thresholds|scenarios|stages/i.test(text)) return `${filePath} contains k6 option-style performance configuration.`;
  return `${filePath} has performance/load-test evidence.`;
}

function performanceWorkloadModels(sourceFiles: PerformanceSourceFile[]): PerformanceReport["workloadModels"] {
  const specs: Array<{ model: PerformanceReport["workloadModels"][number]["model"]; pattern: RegExp; evidence: string }> = [
    { model: "stages", pattern: /\bstages\s*:/i, evidence: "stages define ramp-up, steady, or ramp-down targets." },
    { model: "scenarios", pattern: /\bscenarios\s*:/i, evidence: "scenarios configure named workloads." },
    { model: "constant-vus", pattern: /constant-vus/i, evidence: "constant-vus keeps a fixed virtual user count." },
    { model: "ramping-vus", pattern: /ramping-vus/i, evidence: "ramping-vus changes virtual users over time." },
    { model: "shared-iterations", pattern: /shared-iterations/i, evidence: "shared-iterations distributes fixed iterations across VUs." },
    { model: "per-vu-iterations", pattern: /per-vu-iterations/i, evidence: "per-vu-iterations assigns fixed iterations per VU." },
    { model: "constant-arrival-rate", pattern: /constant-arrival-rate/i, evidence: "constant-arrival-rate models open traffic at a fixed rate." },
    { model: "ramping-arrival-rate", pattern: /ramping-arrival-rate/i, evidence: "ramping-arrival-rate models open traffic with rate changes." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      model: spec.model,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.model} workload evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/performance.html"
    };
  });
}

function performanceThresholds(sourceFiles: PerformanceSourceFile[]): PerformanceReport["thresholds"] {
  const rows: PerformanceReport["thresholds"] = [];
  for (const source of sourceFiles) {
    if (!/thresholds\s*:/i.test(source.text)) continue;
    const thresholdBlock = source.text.match(/thresholds\s*:\s*\{([\s\S]{0,2500}?)\n\s*\}/i)?.[1] ?? source.text;
    const matches = [...thresholdBlock.matchAll(/["']?([A-Za-z_][A-Za-z0-9_.{}:-]*)["']?\s*:\s*(\[[^\]]+\]|["'][^"']+["'])/g)].slice(0, 40);
    for (const match of matches) {
      rows.push({
        metric: match[1],
        expression: match[2].replace(/\s+/g, " ").slice(0, 160),
        readiness: "ready",
        evidence: `${source.filePath} defines a k6 threshold for ${match[1]}.`,
        relatedHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 80);
}

function performanceChecks(sourceFiles: PerformanceSourceFile[]): PerformanceReport["checks"] {
  const rows: PerformanceReport["checks"] = [];
  for (const source of sourceFiles) {
    if (!/check\s*\(/i.test(source.text)) continue;
    const names = [...source.text.matchAll(/["']([^"']{2,80})["']\s*:\s*\(?\s*\w+/g)]
      .map((match) => match[1])
      .filter((name) => /status|response|ok|success|body|header|latency|valid/i.test(name))
      .slice(0, 20);
    rows.push({
      filePath: source.filePath,
      name: names[0] ?? "k6 check",
      readiness: "ready",
      evidence: names.length > 0 ? `${source.filePath} defines check(s): ${names.slice(0, 5).join(", ")}.` : `${source.filePath} calls k6 check().`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 60);
}

function performanceMetrics(sourceFiles: PerformanceSourceFile[]): PerformanceReport["metrics"] {
  const rows: PerformanceReport["metrics"] = [];
  const builtIns = ["http_req_duration", "http_req_failed", "http_reqs", "vus", "iterations", "checks", "data_received", "data_sent"];
  for (const metric of builtIns) {
    const match = sourceFiles.find((source) => new RegExp(`\\b${metric}\\b`, "i").test(source.text));
    if (!match) continue;
    rows.push({ metric, metricType: "built-in", readiness: "ready", evidence: `${match.filePath} references built-in k6 metric ${metric}.`, relatedHref: match.sourceHref });
  }
  const constructors: Array<{ metricType: PerformanceReport["metrics"][number]["metricType"]; pattern: RegExp }> = [
    { metricType: "counter", pattern: /new\s+Counter\s*\(\s*["']([^"']+)["']/g },
    { metricType: "gauge", pattern: /new\s+Gauge\s*\(\s*["']([^"']+)["']/g },
    { metricType: "rate", pattern: /new\s+Rate\s*\(\s*["']([^"']+)["']/g },
    { metricType: "trend", pattern: /new\s+Trend\s*\(\s*["']([^"']+)["']/g }
  ];
  for (const source of sourceFiles) {
    for (const spec of constructors) {
      for (const match of source.text.matchAll(spec.pattern)) {
        rows.push({ metric: match[1], metricType: spec.metricType, readiness: "ready", evidence: `${source.filePath} defines custom ${spec.metricType} metric ${match[1]}.`, relatedHref: source.sourceHref });
      }
    }
  }
  return rows.slice(0, 80);
}

function performanceOutputs(sourceFiles: PerformanceSourceFile[]): PerformanceReport["outputs"] {
  const specs: Array<{ target: Exclude<PerformanceReport["outputs"][number]["target"], "none">; pattern: RegExp; evidence: (filePath: string) => string }> = [
    { target: "summary", pattern: /handleSummary|summary-export|summaryTrendStats/i, evidence: (filePath) => `${filePath} configures summary output or summary export.` },
    { target: "json", pattern: /--summary-export|json-output|K6_OUT=json|\.json/i, evidence: (filePath) => `${filePath} references JSON performance output.` },
    { target: "cloud", pattern: /k6 cloud|K6_CLOUD|cloud:\s*\{/i, evidence: (filePath) => `${filePath} references Grafana Cloud k6 execution.` },
    { target: "prometheus", pattern: /experimental-prometheus-rw|K6_PROMETHEUS|prometheus/i, evidence: (filePath) => `${filePath} references Prometheus output.` },
    { target: "influxdb", pattern: /influxdb|K6_INFLUXDB/i, evidence: (filePath) => `${filePath} references InfluxDB output.` },
    { target: "statsd", pattern: /statsd|K6_STATSD/i, evidence: (filePath) => `${filePath} references StatsD output.` },
    { target: "otel", pattern: /traces-output|K6_TRACES_OUTPUT|opentelemetry|otel/i, evidence: (filePath) => `${filePath} references OpenTelemetry trace output.` }
  ];
  const outputs: PerformanceReport["outputs"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (!match) continue;
    outputs.push({ target: spec.target, readiness: "ready", evidence: spec.evidence(match.filePath), relatedHref: match.sourceHref });
  }
  if (outputs.length === 0) {
    outputs.push({ target: "none", readiness: "missing", evidence: "No k6 summary, JSON, cloud, Prometheus, InfluxDB, StatsD, or OpenTelemetry output was detected.", relatedHref: "html/performance.html" });
  }
  return outputs;
}

function performanceRuntimeControls(
  sourceFiles: PerformanceSourceFile[],
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): PerformanceReport["runtimeControls"] {
  const runtimeHref = "html/runtime-environment.html";
  const specs: Array<{ control: PerformanceReport["runtimeControls"][number]["control"]; pattern: RegExp; evidence: string }> = [
    { control: "vus", pattern: /\bvus\s*:|--vus\b|-u\s+\d+/i, evidence: "VU count can be controlled." },
    { control: "duration", pattern: /\bduration\s*:|--duration\b/i, evidence: "Duration can be controlled." },
    { control: "stages", pattern: /\bstages\s*:/i, evidence: "Ramp stages are configured." },
    { control: "iterations", pattern: /\biterations\s*:|--iterations\b/i, evidence: "Iteration count is configured." },
    { control: "env-vars", pattern: /__ENV|K6_|--env\b/i, evidence: "Environment variable controls are configured." },
    { control: "archive", pattern: /k6 archive|--archive-out|archive/i, evidence: "k6 archive packaging is referenced." },
    { control: "browser", pattern: /k6\/browser|browser\./i, evidence: "Browser performance flow is referenced." },
    { control: "distributed", pattern: /operator|kubernetes|k6-operator|cloud run|distributed/i, evidence: "Distributed/cloud execution is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (match) return { control: spec.control, readiness: "ready", evidence: `${match.filePath} ${spec.evidence}`, relatedHref: match.sourceHref };
    const runtimeSignals = runtimeEnvironmentReport.containerSignals.length + runtimeEnvironmentReport.setupSignals.length;
    return {
      control: spec.control,
      readiness: runtimeSignals > 0 && ["env-vars", "distributed"].includes(spec.control) ? "external" : "missing",
      evidence: `${spec.control} runtime control was not detected in static performance files.`,
      relatedHref: runtimeHref
    };
  });
}

export async function buildProfilingReadinessReport(walk: WalkResult): Promise<ProfilingReadinessReport> {
  const sourceFiles = await profilingSourceFiles(walk);
  const profilingSetups = profilingSetupRows(sourceFiles);
  const targetSignals = profilingTargetSignals(sourceFiles);
  const modeSignals = profilingModeSignals(sourceFiles);
  const outputSignals = profilingOutputSignals(sourceFiles);
  const runtimeSignals = profilingRuntimeSignals(sourceFiles);
  const safetySignals = profilingSafetySignals(sourceFiles);
  const packageSignals = profilingPackageSignals(sourceFiles);

  const hasTool = profilingSetups.some((item) => item.tool !== "unknown" && item.readiness !== "missing")
    || packageSignals.some((item) => item.readiness === "ready");
  const hasMode = modeSignals.some((item) => item.readiness === "ready")
    || profilingSetups.some((item) => item.cpuCount + item.wallCount + item.heapCount + item.asyncCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready")
    || profilingSetups.some((item) => item.outputCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready")
    || profilingSetups.some((item) => item.permissionCount > 0);
  const hasContinuous = profilingSetups.some((item) => item.continuousCount > 0)
    || modeSignals.some((item) => item.signal === "pyroscope-agent" && item.readiness === "ready");
  const hasContinuousMetadata = runtimeSignals.some((item) => ["tags", "application-name", "server-address"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: ProfilingReadinessReport["riskQueue"] = [];
  if (!hasTool && !hasMode) {
    riskQueue.push({
      priority: "high",
      action: "Add or document a profiling tool and mode before claiming profiling readiness.",
      why: "Clinic.js, py-spy, Pyroscope, and pprof readiness starts from visible CPU, wall, heap, async, attach, or continuous profiling commands.",
      relatedHref: "html/profiling-readiness.html"
    });
  }
  if (hasTool && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Persist flamegraph, speedscope, raw, pprof, HTML, JSON, profilecli, or dashboard output.",
      why: "Profiling evidence needs a retained artifact or dashboard target for later review.",
      relatedHref: "html/profiling-readiness.html"
    });
  }
  if (hasTool && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Document profiler permission, overhead, ptrace, sudo, native symbol, and retention boundaries.",
      why: "Attach-style and continuous profilers can require elevated permissions or expose production stack data.",
      relatedHref: "html/profiling-readiness.html"
    });
  }
  if (hasContinuous && !hasContinuousMetadata) {
    riskQueue.push({
      priority: "medium",
      action: "Add application name, server address, and tags for continuous profiling correlation.",
      why: "Continuous profiling needs stable service identity and labels before trends can be compared.",
      relatedHref: "html/profiling-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Clinic.js, py-spy, Pyroscope, pprof, eBPF, or profiling commands only in an authorized environment.",
    why: "RepoTutor records static profiling readiness only; it does not attach to processes, sample stacks, start eBPF collectors, or upload profiles.",
    relatedHref: "html/profiling-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Clinic.js/py-spy/Pyroscope/pprof-style profiling readiness report: setup ${profilingSetups.length}개, mode signal ${modeSignals.length}개, output signal ${outputSignals.length}개, safety signal ${safetySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Profiling readiness Clinic.js py-spy Pyroscope pprof flamegraph speedscope heap CPU wall sampling tags permissions CI",
    profilingSetups,
    targetSignals,
    modeSignals,
    outputSignals,
    runtimeSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"clinic doctor|clinic bubbleprof|clinic flame|clinic heapprofiler|py-spy|pyroscope|pprof\" .", purpose: "Trace profiler tools, modes, and attach targets without running them." },
      { command: "rg \"flamegraph|speedscope|profilecli|pprof|profiles.grafana.com|application_name|server_address\" .", purpose: "Trace retained profile outputs, dashboards, and continuous profiling labels." },
      { command: "rg \"sudo|ptrace|SYS_PTRACE|--native|--subprocesses|--gil|sample_rate|duration|tags\" .", purpose: "Trace permission, overhead, and runtime controls before any profiler run." },
      { command: "rg \"autocannon|--on-port|--collect-only|--visualize-only|upload-artifact|profile artifact\" .", purpose: "Trace repeatable runtime triggers and CI artifact retention." }
    ],
    learnerNextSteps: [
      "Start with the profiler mode, then check the target process/runtime boundary.",
      "Confirm whether the setup captures CPU, wall, heap, async, attach, or continuous profile data.",
      "Check that profile output is retained as an artifact, pprof file, speedscope file, flamegraph, or dashboard.",
      "Review permission and data-retention notes before using profilers on shared or production systems.",
      "This report is static readiness only. Real bottleneck claims require authorized profiler execution on the original service."
    ]
  };
}

type ProfilingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function profilingSourceFiles(walk: WalkResult): Promise<ProfilingSourceFile[]> {
  const files: ProfilingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !profilingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!profilingPathSignal(file.relPath) && !profilingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 320) break;
  }
  return files;
}

function profilingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|Pipfile|Cargo\.toml|go\.mod|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|Makefile|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|py|go|sh|conf|ini)$/i.test(filePath);
}

function profilingPathSignal(filePath: string): boolean {
  return /(profil|profile|pyroscope|py-spy|clinic|pprof|flamegraph|speedscope|autocannon)/i.test(filePath);
}

function profilingContentSignal(text: string): boolean {
  return /(clinic doctor|clinic bubbleprof|clinic flame|clinic heapprofiler|py-spy|pyroscope|pprof|profilecli|flamegraph|speedscope|--on-port|autocannon|SYS_PTRACE|ptrace|profiles\.grafana\.com|application_name|server_address|profilesSampleRate|nodeProfilingIntegration|continuous profiling|net\/http\/pprof|\/debug\/pprof)/i.test(text);
}

function profilingSetupRows(sourceFiles: ProfilingSourceFile[]): ProfilingReadinessReport["profilingSetups"] {
  const rows: ProfilingReadinessReport["profilingSetups"] = [];
  for (const source of sourceFiles) {
    const cpuCount = countMatches(source.text, /CPU|cpu|clinic doctor|clinic flame|py-spy|pprof|profilecpu|cpu\.port_name|go tool pprof/gi);
    const wallCount = countMatches(source.text, /wall|wall-clock|fgprof|wall time|py-spy record/gi);
    const heapCount = countMatches(source.text, /heap|heapprofiler|heapprofile|memory\.port_name/gi);
    const asyncCount = countMatches(source.text, /bubbleprof|async|event loop|trace_events/gi);
    const attachCount = countMatches(source.text, /--pid|\bpid\b|attach|process id|\bpod\b|container|target|\/debug\/pprof/gi);
    const continuousCount = countMatches(source.text, /Pyroscope|pyroscope|continuous profiling|server_address|application_name|profiles\.grafana\.com|scrape|agent/gi);
    const outputCount = countMatches(source.text, /flamegraph|clinic-flame|speedscope|raw|html|profilecli|pprof|json|dashboard|visualize-only|output-html|open=false|upload-artifact|artifact/gi);
    const permissionCount = countMatches(source.text, /sudo|ptrace|SYS_PTRACE|CAP_SYS_PTRACE|--native|eBPF|ebpf|sampling overhead|data retention|production warning|nonblocking|non-blocking/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|upload-artifact|artifact|CI|pull_request|schedule|runs-on/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = cpuCount + wallCount + heapCount + asyncCount + attachCount + continuousCount + outputCount + permissionCount + ciCount;
    if (totalSignals === 0 && !profilingPathSignal(source.filePath)) continue;
    const hasProfileMode = cpuCount + wallCount + heapCount + asyncCount > 0;
    rows.push({
      filePath: source.filePath,
      tool: profilingTool(source),
      cpuCount,
      wallCount,
      heapCount,
      asyncCount,
      attachCount,
      continuousCount,
      outputCount,
      permissionCount,
      ciCount,
      readiness: hasProfileMode && outputCount > 0 && (attachCount > 0 || continuousCount > 0 || ciCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains CPU ${cpuCount}, wall ${wallCount}, heap ${heapCount}, async ${asyncCount}, attach ${attachCount}, continuous ${continuousCount}, output ${outputCount}, permission/safety ${permissionCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.cpuCount + b.wallCount + b.heapCount + b.asyncCount + b.outputCount + b.permissionCount + b.ciCount;
    const aScore = a.cpuCount + a.wallCount + a.heapCount + a.asyncCount + a.outputCount + a.permissionCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function profilingTool(source: ProfilingSourceFile): ProfilingReadinessReport["profilingSetups"][number]["tool"] {
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (path.basename(source.filePath) === "package.json" && /clinic|profile:/i.test(source.text)) return "package-script";
  if (/clinic doctor|clinic bubbleprof|clinic flame|clinic heapprofiler|clinic\b/i.test(source.text)) return "clinicjs";
  if (/py-spy/i.test(source.text)) return "py-spy";
  if (/pyroscope|profiles\.grafana\.com|profilecli/i.test(source.text)) return "pyroscope";
  if (/profilesSampleRate|nodeProfilingIntegration|@sentry\/profiling/i.test(source.text)) return "sentry-profiling";
  if (/pprof|net\/http\/pprof|\/debug\/pprof/i.test(source.text)) return "pprof";
  return "unknown";
}

function profilingTargetSignals(sourceFiles: ProfilingSourceFile[]): ProfilingReadinessReport["targetSignals"] {
  const specs = [
    { signal: "node-process", pattern: /clinic|node\s+\w|nodeProfilingIntegration|profilesSampleRate|@sentry\/profiling-node/i, evidence: "Node process profiling target evidence was detected." },
    { signal: "python-process", pattern: /py-spy|python|pyroscope-io|pyroscope\.io/i, evidence: "Python process profiling target evidence was detected." },
    { signal: "go-pprof", pattern: /net\/http\/pprof|go tool pprof|pprof/i, evidence: "Go pprof profiling target evidence was detected." },
    { signal: "http-pprof", pattern: /\/debug\/pprof|-http=|:6060|pprof\/profile/i, evidence: "HTTP pprof endpoint evidence was detected." },
    { signal: "kubernetes-pod", pattern: /profiles\.grafana\.com|kubernetes|\bk8s\b|\bpod\b|pod_annotations/i, evidence: "Kubernetes pod profiling evidence was detected." },
    { signal: "container", pattern: /Dockerfile|docker compose|container|CAP_SYS_PTRACE|SYS_PTRACE/i, evidence: "Container profiling target evidence was detected." }
  ] as const;
  return profilingSignalFromSpecs(specs, sourceFiles, "signal", "html/profiling-readiness.html");
}

function profilingModeSignals(sourceFiles: ProfilingSourceFile[]): ProfilingReadinessReport["modeSignals"] {
  const specs = [
    { signal: "clinic-doctor", pattern: /clinic doctor/i, evidence: "Clinic.js doctor mode evidence was detected." },
    { signal: "clinic-bubbleprof", pattern: /clinic bubbleprof|bubbleprof/i, evidence: "Clinic.js Bubbleprof async profiling evidence was detected." },
    { signal: "clinic-flame", pattern: /clinic flame/i, evidence: "Clinic.js flame mode evidence was detected." },
    { signal: "clinic-heapprofiler", pattern: /clinic heapprofiler|heapprofiler/i, evidence: "Clinic.js heap profiler evidence was detected." },
    { signal: "py-spy-top", pattern: /py-spy top/i, evidence: "py-spy top mode evidence was detected." },
    { signal: "py-spy-record", pattern: /py-spy record/i, evidence: "py-spy record mode evidence was detected." },
    { signal: "py-spy-dump", pattern: /py-spy dump/i, evidence: "py-spy dump mode evidence was detected." },
    { signal: "pyroscope-agent", pattern: /pyroscope|profiles\.grafana\.com|server_address|application_name/i, evidence: "Pyroscope continuous profiling agent evidence was detected." },
    { signal: "pprof", pattern: /pprof|net\/http\/pprof|\/debug\/pprof|go tool pprof/i, evidence: "pprof profiling evidence was detected." }
  ] as const;
  return profilingSignalFromSpecs(specs, sourceFiles, "signal", "html/profiling-readiness.html");
}

function profilingOutputSignals(sourceFiles: ProfilingSourceFile[]): ProfilingReadinessReport["outputSignals"] {
  const specs = [
    { signal: "html", pattern: /\.html|--output.*html|output-html|--open=false/i, evidence: "HTML profile output evidence was detected." },
    { signal: "flamegraph", pattern: /flamegraph|\.svg/i, evidence: "Flamegraph output evidence was detected." },
    { signal: "speedscope", pattern: /speedscope/i, evidence: "Speedscope profile output evidence was detected." },
    { signal: "raw", pattern: /--format raw|\braw\b/i, evidence: "Raw profile output evidence was detected." },
    { signal: "pprof", pattern: /\.pprof|pprof/i, evidence: "pprof output evidence was detected." },
    { signal: "json", pattern: /\.json|json/i, evidence: "JSON profile output evidence was detected." },
    { signal: "profilecli", pattern: /profilecli/i, evidence: "profilecli output/query evidence was detected." },
    { signal: "grafana-dashboard", pattern: /Grafana|dashboard|profiles\.grafana\.com/i, evidence: "Grafana dashboard profiling evidence was detected." }
  ] as const;
  return profilingSignalFromSpecs(specs, sourceFiles, "signal", "html/profiling-readiness.html");
}

function profilingRuntimeSignals(sourceFiles: ProfilingSourceFile[]): ProfilingReadinessReport["runtimeSignals"] {
  const specs = [
    { signal: "on-port", pattern: /--on-port|on-port|\$PORT/i, evidence: "on-port runtime trigger evidence was detected." },
    { signal: "autocannon", pattern: /autocannon/i, evidence: "autocannon profiler trigger evidence was detected." },
    { signal: "duration", pattern: /--duration|duration|run-time|--rate/i, evidence: "Duration or bounded sampling evidence was detected." },
    { signal: "sample-rate", pattern: /sample_rate|sample rate|--rate|\brate\s*:/i, evidence: "Sampling rate control evidence was detected." },
    { signal: "native-symbols", pattern: /--native|native symbols|native/i, evidence: "Native symbol profiling evidence was detected." },
    { signal: "subprocesses", pattern: /--subprocesses|subprocesses|subprocess/i, evidence: "Subprocess profiling evidence was detected." },
    { signal: "gil", pattern: /--gil|\bGIL\b/i, evidence: "Python GIL profiling evidence was detected." },
    { signal: "tags", pattern: /\btags\s*:|tags\.|labels|service:/i, evidence: "Profile tag or label evidence was detected." },
    { signal: "application-name", pattern: /application_name|applicationName|app name/i, evidence: "Application name evidence was detected." },
    { signal: "server-address", pattern: /server_address|serverAddress|pyroscope.*4040/i, evidence: "Profiling server address evidence was detected." }
  ] as const;
  return profilingSignalFromSpecs(specs, sourceFiles, "signal", "html/profiling-readiness.html");
}

function profilingSafetySignals(sourceFiles: ProfilingSourceFile[]): ProfilingReadinessReport["safetySignals"] {
  const specs = [
    { signal: "sudo", pattern: /\bsudo\b/i, evidence: "sudo boundary evidence was detected." },
    { signal: "ptrace", pattern: /ptrace|CAP_SYS_PTRACE/i, evidence: "ptrace permission evidence was detected." },
    { signal: "sys-ptrace", pattern: /SYS_PTRACE/i, evidence: "SYS_PTRACE capability evidence was detected." },
    { signal: "nonblocking", pattern: /nonblocking|non-blocking/i, evidence: "Nonblocking profiler note was detected." },
    { signal: "production-warning", pattern: /production warning|production.*profil/i, evidence: "Production profiling warning evidence was detected." },
    { signal: "sampling-overhead", pattern: /sampling overhead|overhead/i, evidence: "Sampling overhead note was detected." },
    { signal: "data-retention", pattern: /data retention|retention|profile data/i, evidence: "Profile data retention evidence was detected." }
  ] as const;
  return profilingSignalFromSpecs(specs, sourceFiles, "signal", "html/profiling-readiness.html");
}

function profilingPackageSignals(sourceFiles: ProfilingSourceFile[]): ProfilingReadinessReport["packageSignals"] {
  const specs = [
    { signal: "clinic", pattern: /["']clinic["']|@clinic\/|clinic doctor|clinic flame|clinic bubbleprof/i, evidence: "Clinic package or command evidence was detected." },
    { signal: "autocannon", pattern: /["']autocannon["']|autocannon/i, evidence: "autocannon package or command evidence was detected." },
    { signal: "py-spy", pattern: /py-spy/i, evidence: "py-spy package or command evidence was detected." },
    { signal: "pyroscope", pattern: /pyroscope|pyroscope-io|profiles\.grafana\.com/i, evidence: "Pyroscope package or config evidence was detected." },
    { signal: "pprof", pattern: /pprof|net\/http\/pprof|go tool pprof/i, evidence: "pprof package or command evidence was detected." },
    { signal: "sentry-profiling", pattern: /@sentry\/profiling|nodeProfilingIntegration|profilesSampleRate/i, evidence: "Sentry profiling package or config evidence was detected." }
  ] as const;
  return profilingSignalFromSpecs(specs, sourceFiles, "signal", "html/profiling-readiness.html");
}

function profilingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  specs: readonly T[],
  sourceFiles: ProfilingSourceFile[],
  labelKey: K,
  fallbackHref: string
): Array<Omit<T, "pattern"> & { readiness: "ready" | "missing" | "external"; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    const { pattern: _pattern, ...rest } = spec;
    return {
      ...rest,
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec[labelKey]} profiling signal was not detected.`,
      relatedHref: match?.sourceHref ?? fallbackHref
    } as Omit<T, "pattern"> & { readiness: "ready" | "missing" | "external"; relatedHref: string };
  });
}

export async function buildTracingReadinessReport(walk: WalkResult): Promise<TracingReadinessReport> {
  const sourceFiles = await tracingSourceFiles(walk);
  const tracingSetups = tracingSetupRows(sourceFiles);
  const instrumentationSignals = tracingInstrumentationSignals(sourceFiles);
  const propagationSignals = tracingPropagationSignals(sourceFiles);
  const exporterSignals = tracingExporterSignals(sourceFiles);
  const samplingSignals = tracingSamplingSignals(sourceFiles);
  const resourceSignals = tracingResourceSignals(sourceFiles);
  const backendSignals = tracingBackendSignals(sourceFiles);
  const qualitySignals = tracingQualitySignals(sourceFiles);
  const packageSignals = tracingPackageSignals(sourceFiles);

  const hasInstrumentation = instrumentationSignals.some((item) => item.readiness === "ready")
    || tracingSetups.some((item) => item.tracerCount + item.spanCount > 0);
  const hasPropagation = propagationSignals.some((item) => item.readiness === "ready")
    || tracingSetups.some((item) => item.propagationCount > 0);
  const hasExporterOrBackend = exporterSignals.some((item) => item.readiness === "ready")
    || backendSignals.some((item) => item.readiness === "ready")
    || tracingSetups.some((item) => item.exporterCount + item.backendCount > 0);
  const hasResource = resourceSignals.some((item) => item.readiness === "ready")
    || tracingSetups.some((item) => item.resourceCount > 0);
  const hasBackend = backendSignals.some((item) => item.readiness === "ready")
    || tracingSetups.some((item) => item.backendCount > 0);
  const hasQuality = qualitySignals.some((item) => item.readiness === "ready");

  const riskQueue: TracingReadinessReport["riskQueue"] = [];
  if (!hasInstrumentation) {
    riskQueue.push({
      priority: "high",
      action: "Add or document tracing instrumentation before claiming distributed tracing readiness.",
      why: "Tracing readiness starts from visible tracer, span, auto-instrumentation, or framework instrumentation evidence.",
      relatedHref: "html/tracing-readiness.html"
    });
  }
  if (hasInstrumentation && !hasPropagation) {
    riskQueue.push({
      priority: "medium",
      action: "Document W3C tracecontext, baggage, B3, Jaeger, X-Ray, async, or zone propagation.",
      why: "Distributed traces need context propagation across process, queue, browser, and service boundaries.",
      relatedHref: "html/tracing-readiness.html"
    });
  }
  if (hasInstrumentation && !hasExporterOrBackend) {
    riskQueue.push({
      priority: "medium",
      action: "Add an OTLP, Jaeger, Zipkin, Tempo, or collector exporter path.",
      why: "Spans are not reviewable unless exporter and backend routing are visible.",
      relatedHref: "html/tracing-readiness.html"
    });
  }
  if (hasInstrumentation && !hasResource) {
    riskQueue.push({
      priority: "medium",
      action: "Add service.name, service.version, deployment.environment, or resource attributes.",
      why: "Tracing backends rely on stable resource identity for search, aggregation, and ownership.",
      relatedHref: "html/tracing-readiness.html"
    });
  }
  if (hasBackend && !hasQuality) {
    riskQueue.push({
      priority: "medium",
      action: "Document span metrics, service graph, dropped span, export failure, health, dashboard, or retention checks.",
      why: "Tracing backends need quality signals before teams trust trace completeness.",
      relatedHref: "html/tracing-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "RepoTutor records static tracing readiness only; it does not start SDKs, send spans, contact collectors, query Jaeger/Tempo/Zipkin, or inspect live dashboards.",
    why: "Tracing runtime checks must happen in an authorized environment because SDK startup and exporters can emit production telemetry.",
    relatedHref: "html/tracing-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `OpenTelemetry/Jaeger/Zipkin/Tempo-style tracing readiness report: setup ${tracingSetups.length}개, instrumentation signal ${instrumentationSignals.length}개, propagation signal ${propagationSignals.length}개, exporter signal ${exporterSignals.length}개, backend signal ${backendSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Tracing readiness OpenTelemetry Jaeger Zipkin Tempo traceparent baggage spans exporters sampling resources backends quality",
    tracingSetups,
    instrumentationSignals,
    propagationSignals,
    exporterSignals,
    samplingSignals,
    resourceSignals,
    backendSignals,
    qualitySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"NodeSDK|TracerProvider|startSpan|trace.getTracer|registerInstrumentations|getNodeAutoInstrumentations\" .", purpose: "Find tracer, span, manual, and auto-instrumentation setup without starting SDKs." },
      { command: "rg \"traceparent|baggage|B3Propagator|W3CTraceContextPropagator|OTEL_PROPAGATORS\" .", purpose: "Find trace context propagation evidence across service boundaries." },
      { command: "rg \"OTLPTraceExporter|JaegerExporter|ZipkinExporter|OTEL_EXPORTER_OTLP_ENDPOINT|collector|tempo|jaeger|zipkin\" .", purpose: "Find exporter, collector, and tracing backend routing evidence." },
      { command: "rg \"ParentBasedSampler|TraceIdRatioBasedSampler|tail_sampling|remote sampling|spanmetrics|service_graph|dropped spans\" .", purpose: "Find sampling, span metrics, service graph, and quality-control evidence." }
    ],
    learnerNextSteps: [
      "Start with instrumentation, then check propagation across request, async, browser, and service boundaries.",
      "Confirm exporters route to an owned collector or tracing backend without assuming spans are being sent.",
      "Check resource identity so service.name, version, and environment are visible in trace search.",
      "Review sampling, dropped span, export failure, dashboard, health, and retention evidence before relying on trace completeness.",
      "This report is static readiness only. Real trace coverage claims require authorized SDK/runtime and backend verification."
    ]
  };
}

type TracingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function tracingSourceFiles(walk: WalkResult): Promise<TracingSourceFile[]> {
  const files: TracingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !tracingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!tracingPathSignal(file.relPath) && !tracingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 360) break;
  }
  return files;
}

function tracingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|go\.mod|Cargo\.toml|Dockerfile|docker-compose\.ya?ml|compose\.ya?ml|Makefile|Taskfile\.ya?ml|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|py|go|sh|conf|ini)$/i.test(filePath);
}

function tracingPathSignal(filePath: string): boolean {
  return /(trac|otel|opentelemetry|jaeger|zipkin|tempo|collector|span|traceql)/i.test(filePath);
}

function tracingContentSignal(text: string): boolean {
  return /(NodeSDK|TracerProvider|startSpan|trace\.getTracer|registerInstrumentations|getNodeAutoInstrumentations|traceparent|baggage|B3Propagator|W3CTraceContextPropagator|OTLPTraceExporter|JaegerExporter|ZipkinExporter|OTEL_EXPORTER_OTLP_ENDPOINT|tail_sampling|spanmetrics|service_graph|jaeger|zipkin|tempo|TraceQL|opentelemetry|OpenTelemetry|collector|SpanProcessor)/i.test(text);
}

function tracingSetupRows(sourceFiles: TracingSourceFile[]): TracingReadinessReport["tracingSetups"] {
  const rows: TracingReadinessReport["tracingSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const tracerCount = countMatches(source.text, /NodeSDK|TracerProvider|trace\.getTracer|getTracer|tracer|sdk-trace|go\.opentelemetry\.io\/otel/gi);
    const spanCount = countMatches(source.text, /startSpan|span\.|SpanProcessor|spans?|traceparent/gi);
    const propagationCount = countMatches(source.text, /traceparent|baggage|W3CTraceContextPropagator|W3CBaggagePropagator|B3Propagator|OTEL_PROPAGATORS|AsyncHooksContextManager|ZoneContextManager/gi);
    const exporterCount = countMatches(source.text, /OTLPTraceExporter|ConsoleSpanExporter|JaegerExporter|ZipkinExporter|OTEL_EXPORTER_OTLP_ENDPOINT|exporters?|collector|otlp/gi);
    const samplingCount = countMatches(source.text, /ParentBasedSampler|TraceIdRatioBasedSampler|AlwaysOnSampler|AlwaysOffSampler|tail_sampling|remote sampling|rate limit|sampling/gi);
    const resourceCount = countMatches(source.text, /ATTR_SERVICE_NAME|service\.name|service\.version|deployment\.environment|resourceFromAttributes|WithResource|Resource/gi);
    const processorCount = countMatches(source.text, /BatchSpanProcessor|SimpleSpanProcessor|SpanProcessor|batch|tail_sampling|memory_limiter/gi);
    const backendCount = countMatches(source.text, /jaeger|zipkin|tempo|collector|distributor|ingester|querier|all-in-one/gi);
    const storageCount = countMatches(source.text, /badger|elasticsearch|cassandra|kafka|s3|gcs|object storage|WAL|retention/gi);
    const queryCount = countMatches(source.text, /query|16686|TraceQL|\/api\/traces|dashboard|service graph|service_graph/gi);
    const ciCount = countMatches(haystack, /\.github\/workflows|upload-artifact|artifact|CI|pull_request|schedule|runs-on/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = tracerCount + spanCount + propagationCount + exporterCount + samplingCount + resourceCount + processorCount + backendCount + storageCount + queryCount + ciCount;
    if (totalSignals === 0 && !tracingPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: tracingPlatform(source),
      tracerCount,
      spanCount,
      propagationCount,
      exporterCount,
      samplingCount,
      resourceCount,
      processorCount,
      backendCount,
      storageCount,
      queryCount,
      ciCount,
      readiness: (tracerCount > 0 || spanCount > 0) && propagationCount > 0 && exporterCount > 0 && (resourceCount > 0 || backendCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains tracer ${tracerCount}, span ${spanCount}, propagation ${propagationCount}, exporter ${exporterCount}, sampling ${samplingCount}, resource ${resourceCount}, processor ${processorCount}, backend ${backendCount}, storage ${storageCount}, query ${queryCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.tracerCount + b.spanCount + b.propagationCount + b.exporterCount + b.backendCount + b.storageCount + b.ciCount;
    const aScore = a.tracerCount + a.spanCount + a.propagationCount + a.exporterCount + a.backendCount + a.storageCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function tracingPlatform(source: TracingSourceFile): TracingReadinessReport["tracingSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (path.basename(source.filePath) === "package.json" && /(trace|otel|opentelemetry|@opentelemetry)/i.test(source.text)) return "package-script";
  if (/opentelemetry|OpenTelemetry|NodeSDK|TracerProvider|OTLPTraceExporter|@opentelemetry/i.test(haystack)) return "opentelemetry";
  if (/otel-collector|opentelemetry-collector|collector\.ya?ml|receivers:|exporters:/i.test(haystack)) return "collector-config";
  if (/sentry|Sentry|startTransaction|spanStatus/i.test(haystack)) return "sentry-tracing";
  if (/tempo|TraceQL|metrics-generator|service_graph|spanmetrics/i.test(haystack)) return "tempo";
  if (/jaeger|all-in-one|16686|14250|14268|remote sampling/i.test(haystack)) return "jaeger";
  if (/zipkin|9411|ZipkinExporter/i.test(haystack)) return "zipkin";
  return "unknown";
}

function tracingInstrumentationSignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["instrumentationSignals"] {
  const specs: Array<{ signal: TracingReadinessReport["instrumentationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "manual-span", pattern: /startSpan|trace\.getTracer|span\.setAttribute|span\.addEvent|span\.end/i, evidence: "manual span evidence was detected." },
    { signal: "auto-instrumentation", pattern: /registerInstrumentations|getNodeAutoInstrumentations|auto[- ]?instrument/i, evidence: "auto-instrumentation evidence was detected." },
    { signal: "http-instrumentation", pattern: /HttpInstrumentation|instrumentation-http|http instrumentation/i, evidence: "HTTP instrumentation evidence was detected." },
    { signal: "grpc-instrumentation", pattern: /GrpcInstrumentation|instrumentation-grpc|grpc instrumentation/i, evidence: "gRPC instrumentation evidence was detected." },
    { signal: "db-instrumentation", pattern: /PgInstrumentation|instrumentation-pg|db instrumentation|database instrumentation|SQL instrumentation/i, evidence: "database instrumentation evidence was detected." },
    { signal: "browser-instrumentation", pattern: /browser tracing|ZoneContextManager|instrumentation-document-load|instrumentation-user-interaction|web-vitals/i, evidence: "browser tracing instrumentation evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "instrumentation");
}

function tracingPropagationSignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["propagationSignals"] {
  const specs: Array<{ signal: TracingReadinessReport["propagationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tracecontext", pattern: /traceparent|tracecontext|W3CTraceContextPropagator/i, evidence: "W3C tracecontext evidence was detected." },
    { signal: "baggage", pattern: /baggage|W3CBaggagePropagator/i, evidence: "W3C baggage evidence was detected." },
    { signal: "b3", pattern: /B3Propagator|\bB3\b/i, evidence: "B3 propagation evidence was detected." },
    { signal: "jaeger", pattern: /JaegerPropagator|jaeger/i, evidence: "Jaeger propagation/backend evidence was detected." },
    { signal: "xray", pattern: /X-Ray|xray|AWSXRay/i, evidence: "AWS X-Ray propagation evidence was detected." },
    { signal: "async-context", pattern: /AsyncHooksContextManager|context-async-hooks|async context/i, evidence: "async context propagation evidence was detected." },
    { signal: "zone-context", pattern: /ZoneContextManager|zone context|zone-context/i, evidence: "zone context propagation evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "propagation");
}

function tracingExporterSignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["exporterSignals"] {
  const specs: Array<{ signal: TracingReadinessReport["exporterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "otlp-grpc", pattern: /exporter-trace-otlp-grpc|OTLPTraceExporter|otlp.*grpc|4317/i, evidence: "OTLP gRPC exporter evidence was detected." },
    { signal: "otlp-http", pattern: /exporter-trace-otlp-http|otlp.*http|4318|\/v1\/traces/i, evidence: "OTLP HTTP exporter evidence was detected." },
    { signal: "console", pattern: /ConsoleSpanExporter/i, evidence: "Console span exporter evidence was detected." },
    { signal: "jaeger", pattern: /JaegerExporter|jaeger/i, evidence: "Jaeger exporter/backend evidence was detected." },
    { signal: "zipkin", pattern: /ZipkinExporter|zipkin/i, evidence: "Zipkin exporter/backend evidence was detected." },
    { signal: "tempo", pattern: /tempo|otlp\/tempo/i, evidence: "Tempo exporter/backend evidence was detected." },
    { signal: "collector", pattern: /collector|otelcol|opentelemetry-collector|OTEL_EXPORTER_OTLP_ENDPOINT/i, evidence: "collector routing evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "exporter");
}

function tracingSamplingSignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["samplingSignals"] {
  const specs: Array<{ signal: TracingReadinessReport["samplingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "parent-based", pattern: /ParentBasedSampler|parent[- ]?based/i, evidence: "parent-based sampling evidence was detected." },
    { signal: "traceid-ratio", pattern: /TraceIdRatioBasedSampler|traceid[- ]?ratio|trace id ratio/i, evidence: "trace ID ratio sampling evidence was detected." },
    { signal: "always-on", pattern: /AlwaysOnSampler|always[- ]?on/i, evidence: "always-on sampling evidence was detected." },
    { signal: "always-off", pattern: /AlwaysOffSampler|always[- ]?off/i, evidence: "always-off sampling evidence was detected." },
    { signal: "tail-sampling", pattern: /tail_sampling|tail[- ]?sampling/i, evidence: "tail sampling evidence was detected." },
    { signal: "remote-sampling", pattern: /remote sampling|remote-sampling|remote_sampling/i, evidence: "remote sampling evidence was detected." },
    { signal: "rate-limit", pattern: /rate limit|rate-limit|rate_limiting|rate_limiter/i, evidence: "rate-limit sampling evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "sampling");
}

function tracingResourceSignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["resourceSignals"] {
  const specs: Array<{ signal: TracingReadinessReport["resourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "service-name", pattern: /ATTR_SERVICE_NAME|service\.name|OTEL_SERVICE_NAME/i, evidence: "service.name evidence was detected." },
    { signal: "service-version", pattern: /service\.version|service version/i, evidence: "service.version evidence was detected." },
    { signal: "deployment-environment", pattern: /deployment\.environment|deployment environment/i, evidence: "deployment.environment evidence was detected." },
    { signal: "resource-detector", pattern: /detectResources|ResourceDetector|resource detector|envDetector|containerDetector/i, evidence: "resource detector evidence was detected." },
    { signal: "attributes", pattern: /resourceFromAttributes|WithResource|Resource|attributes/i, evidence: "resource attribute evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "resource");
}

function tracingBackendSignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["backendSignals"] {
  const specs: Array<{ signal: TracingReadinessReport["backendSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "jaeger-all-in-one", pattern: /jaeger.*all-in-one|all-in-one.*jaeger|all in one/i, evidence: "Jaeger all-in-one evidence was detected." },
    { signal: "jaeger-collector", pattern: /jaeger.*collector|collector.*jaeger|14250|14268/i, evidence: "Jaeger collector evidence was detected." },
    { signal: "jaeger-query", pattern: /jaeger.*query|query.*jaeger|\b16686\b/i, evidence: "Jaeger query evidence was detected." },
    { signal: "tempo-distributor", pattern: /tempo.*distributor|distributor.*tempo|distributor/i, evidence: "Tempo distributor evidence was detected." },
    { signal: "tempo-ingester", pattern: /tempo.*ingester|ingester.*tempo|ingester/i, evidence: "Tempo ingester evidence was detected." },
    { signal: "tempo-querier", pattern: /tempo.*querier|querier.*tempo|TraceQL|querier/i, evidence: "Tempo querier or TraceQL evidence was detected." },
    { signal: "zipkin-server", pattern: /zipkin.*server|server.*zipkin|9411/i, evidence: "Zipkin server evidence was detected." },
    { signal: "storage-backend", pattern: /badger|elasticsearch|cassandra|kafka|s3|gcs|object storage|WAL|storage backend/i, evidence: "tracing storage backend evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "backend");
}

function tracingQualitySignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["qualitySignals"] {
  const specs: Array<{ signal: TracingReadinessReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "span-metrics", pattern: /spanmetrics|span metrics|span-metrics/i, evidence: "span metrics evidence was detected." },
    { signal: "service-graph", pattern: /service_graph|service graph|service-graph/i, evidence: "service graph evidence was detected." },
    { signal: "dropped-spans", pattern: /dropped spans|dropped_spans|dropped-spans/i, evidence: "dropped span evidence was detected." },
    { signal: "export-failures", pattern: /export failures|export_failures|export-failures|failed exports/i, evidence: "export failure evidence was detected." },
    { signal: "health-check", pattern: /health check|health_check|health-check|\/health/i, evidence: "health check evidence was detected." },
    { signal: "dashboard", pattern: /dashboard|Grafana/i, evidence: "dashboard evidence was detected." },
    { signal: "retention", pattern: /retention|retention_period/i, evidence: "retention evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "quality");
}

function tracingPackageSignals(sourceFiles: TracingSourceFile[]): TracingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TracingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@opentelemetry/api", pattern: /["@']@opentelemetry\/api["@']|@opentelemetry\/api/i, evidence: "OpenTelemetry API package evidence was detected." },
    { signal: "@opentelemetry/sdk-node", pattern: /["@']@opentelemetry\/sdk-node["@']|@opentelemetry\/sdk-node|NodeSDK/i, evidence: "OpenTelemetry Node SDK evidence was detected." },
    { signal: "@opentelemetry/instrumentation", pattern: /@opentelemetry\/instrumentation|auto-instrumentations/i, evidence: "OpenTelemetry instrumentation package evidence was detected." },
    { signal: "@opentelemetry/exporter-trace-otlp", pattern: /@opentelemetry\/exporter-trace-otlp|OTLPTraceExporter/i, evidence: "OpenTelemetry OTLP exporter package evidence was detected." },
    { signal: "jaeger", pattern: /jaeger|JaegerExporter/i, evidence: "Jaeger package/config evidence was detected." },
    { signal: "zipkin", pattern: /zipkin|ZipkinExporter/i, evidence: "Zipkin package/config evidence was detected." },
    { signal: "tempo", pattern: /tempo|TraceQL/i, evidence: "Tempo package/config evidence was detected." }
  ];
  return tracingSignalFromSpecs(sourceFiles, specs, "package");
}

function tracingSignalFromSpecs<T extends string>(
  sourceFiles: TracingSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/tracing-readiness.html"
    };
  });
}
