import { z } from "zod";

export const ApiContractReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schemaDocuments: z.array(z.object({
    filePath: z.string(),
    schemaType: z.enum(["openapi", "swagger", "graphql", "postman", "asyncapi", "unknown"]),
    version: z.string().nullable(),
    operationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  operationTargets: z.array(z.object({
    operationId: z.string().nullable(),
    method: z.string().nullable(),
    path: z.string().nullable(),
    source: z.string(),
    readiness: z.enum(["ready", "partial", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testPhases: z.array(z.object({
    phase: z.enum(["examples", "coverage", "fuzzing", "stateful", "negative"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checkMatrix: z.array(z.object({
    check: z.enum(["not-a-server-error", "schema-conformance", "status-code-conformance", "content-type-conformance", "response-headers", "auth-required"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeTargets: z.array(z.object({
    target: z.enum(["base-url", "asgi-wsgi", "pytest", "ci-action", "mock-server"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportingOutputs: z.array(z.object({
    output: z.enum(["junit-xml", "allure", "cassette", "replay", "curl-repro", "coverage"]),
    readiness: z.enum(["ready", "partial", "external"]),
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

export const ConsumerContractReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  contractSetups: z.array(z.object({
    filePath: z.string(),
    role: z.enum(["consumer", "provider", "broker", "ci", "mixed", "unknown"]),
    framework: z.enum(["pact-js", "pact-jvm", "pact-ruby", "pact-go", "pact-python", "custom", "unknown"]),
    interactionCount: z.number().int().nonnegative(),
    providerStateCount: z.number().int().nonnegative(),
    verifierCount: z.number().int().nonnegative(),
    brokerCount: z.number().int().nonnegative(),
    matcherCount: z.number().int().nonnegative(),
    messageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pact-v3", "pact-v4", "interaction", "given", "upon-receiving", "with-request", "will-respond-with", "execute-test", "message", "graphql", "plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["verifier", "provider-state", "state-handlers", "provider-base-url", "verification-context", "publish-results", "provider-version", "provider-branch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  brokerSignals: z.array(z.object({
    signal: z.enum(["pact-broker", "pactflow", "can-i-deploy", "consumer-version-selector", "pending-pacts", "wip-pacts", "webhook", "token-auth", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  matcherSignals: z.array(z.object({
    signal: z.enum(["like", "each-like", "regex", "term", "from-provider-state", "matching-rules", "headers", "body", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["publish-pact", "verify-provider", "junit", "github-actions", "gradle", "maven", "npm-script", "rake-task", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@pact-foundation/pact", "pact-jvm", "pact-ruby", "pact-broker-client", "pactflow", "unknown"]),
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

export const ObservabilityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  signalPipelines: z.array(z.object({
    signal: z.enum(["traces", "metrics", "logs"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    filePath: z.string(),
    kind: z.enum(["auto", "manual", "middleware", "browser", "server", "unknown"]),
    signal: z.enum(["traces", "metrics", "logs", "mixed"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  exporterTargets: z.array(z.object({
    target: z.enum(["otlp", "console", "prometheus", "jaeger", "zipkin", "vendor", "none"]),
    signal: z.enum(["traces", "metrics", "logs", "mixed"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceAttributes: z.array(z.object({
    attribute: z.string(),
    source: z.string(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  propagationContext: z.array(z.object({
    mechanism: z.enum(["trace-context", "baggage", "b3", "async-context", "zone-context"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  diagnostics: z.array(z.object({
    check: z.enum(["diag-logger", "collector-endpoint", "shutdown", "sampling", "attribute-limits", "runtime-support"]),
    status: z.enum(["ready", "partial", "missing", "external"]),
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

export const PerformanceReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scriptTargets: z.array(z.object({
    filePath: z.string(),
    kind: z.enum(["k6-script", "package-script", "ci-workflow", "config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workloadModels: z.array(z.object({
    model: z.enum(["stages", "scenarios", "constant-vus", "ramping-vus", "shared-iterations", "per-vu-iterations", "constant-arrival-rate", "ramping-arrival-rate"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  thresholds: z.array(z.object({
    metric: z.string(),
    expression: z.string(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checks: z.array(z.object({
    filePath: z.string(),
    name: z.string(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  metrics: z.array(z.object({
    metric: z.string(),
    metricType: z.enum(["counter", "gauge", "rate", "trend", "built-in", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputs: z.array(z.object({
    target: z.enum(["summary", "json", "cloud", "prometheus", "influxdb", "statsd", "otel", "none"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeControls: z.array(z.object({
    control: z.enum(["vus", "duration", "stages", "iterations", "env-vars", "archive", "browser", "distributed"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
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

export const ProfilingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  profilingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["clinicjs", "py-spy", "pyroscope", "pprof", "sentry-profiling", "package-script", "workflow", "unknown"]),
    cpuCount: z.number().int().nonnegative(),
    wallCount: z.number().int().nonnegative(),
    heapCount: z.number().int().nonnegative(),
    asyncCount: z.number().int().nonnegative(),
    attachCount: z.number().int().nonnegative(),
    continuousCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["node-process", "python-process", "go-pprof", "http-pprof", "kubernetes-pod", "container", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modeSignals: z.array(z.object({
    signal: z.enum(["clinic-doctor", "clinic-bubbleprof", "clinic-flame", "clinic-heapprofiler", "py-spy-top", "py-spy-record", "py-spy-dump", "pyroscope-agent", "pprof", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["html", "flamegraph", "speedscope", "raw", "pprof", "json", "profilecli", "grafana-dashboard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["on-port", "autocannon", "duration", "sample-rate", "native-symbols", "subprocesses", "gil", "tags", "application-name", "server-address", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["sudo", "ptrace", "sys-ptrace", "nonblocking", "production-warning", "sampling-overhead", "data-retention", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["clinic", "autocannon", "py-spy", "pyroscope", "pprof", "sentry-profiling", "unknown"]),
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

export const TracingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tracingSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["opentelemetry", "jaeger", "zipkin", "tempo", "sentry-tracing", "package-script", "workflow", "collector-config", "unknown"]),
    tracerCount: z.number().int().nonnegative(),
    spanCount: z.number().int().nonnegative(),
    propagationCount: z.number().int().nonnegative(),
    exporterCount: z.number().int().nonnegative(),
    samplingCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    processorCount: z.number().int().nonnegative(),
    backendCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    signal: z.enum(["manual-span", "auto-instrumentation", "http-instrumentation", "grpc-instrumentation", "db-instrumentation", "browser-instrumentation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  propagationSignals: z.array(z.object({
    signal: z.enum(["tracecontext", "baggage", "b3", "jaeger", "xray", "async-context", "zone-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exporterSignals: z.array(z.object({
    signal: z.enum(["otlp-grpc", "otlp-http", "console", "jaeger", "zipkin", "tempo", "collector", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  samplingSignals: z.array(z.object({
    signal: z.enum(["parent-based", "traceid-ratio", "always-on", "always-off", "tail-sampling", "remote-sampling", "rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["service-name", "service-version", "deployment-environment", "resource-detector", "attributes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  backendSignals: z.array(z.object({
    signal: z.enum(["jaeger-all-in-one", "jaeger-collector", "jaeger-query", "tempo-distributor", "tempo-ingester", "tempo-querier", "zipkin-server", "storage-backend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["span-metrics", "service-graph", "dropped-spans", "export-failures", "health-check", "dashboard", "retention", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@opentelemetry/api", "@opentelemetry/sdk-node", "@opentelemetry/instrumentation", "@opentelemetry/exporter-trace-otlp", "jaeger", "zipkin", "tempo", "unknown"]),
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

export const DebugReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  debugSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["vscode-js-debug", "debugpy", "delve", "dap", "launch-config", "package-script", "workflow", "unknown"]),
    launchCount: z.number().int().nonnegative(),
    attachCount: z.number().int().nonnegative(),
    breakpointCount: z.number().int().nonnegative(),
    sourceMapCount: z.number().int().nonnegative(),
    pathMappingCount: z.number().int().nonnegative(),
    runtimeCount: z.number().int().nonnegative(),
    adapterCount: z.number().int().nonnegative(),
    logCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    remoteCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  adapterSignals: z.array(z.object({
    signal: z.enum(["debug-adapter-protocol", "vscode-js-debug", "debugpy", "delve-dap", "chrome-devtools", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modeSignals: z.array(z.object({
    signal: z.enum(["launch", "attach", "remote-attach", "headless", "listen", "connect", "wait-for-client", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  breakpointSignals: z.array(z.object({
    signal: z.enum(["line-breakpoint", "conditional-breakpoint", "logpoint", "function-breakpoint", "exception-breakpoint", "hit-condition", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mappingSignals: z.array(z.object({
    signal: z.enum(["source-map", "source-map-overrides", "skip-files", "smart-step", "path-mappings", "cwd-root", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["node-inspect", "browser-debug", "python-module", "pytest-debug", "go-dlv", "core-dump", "native-attach", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  remoteSignals: z.array(z.object({
    signal: z.enum(["port", "host", "pid", "subprocess", "multiclient", "container", "ssh-wsl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  diagnosticSignals: z.array(z.object({
    signal: z.enum(["trace", "debug-logs", "adapter-logs", "verbose", "stack-trace", "goroutine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vscode-js-debug", "debugpy", "delve", "@vscode/debugadapter", "vscode", "unknown"]),
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

export const CrashReportingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  crashSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["sentry", "bugsnag", "rollbar", "source-map-config", "symbol-file-config", "package-script", "workflow", "native-crash", "unknown"]),
    eventCount: z.number().int().nonnegative(),
    releaseCount: z.number().int().nonnegative(),
    sourceMapCount: z.number().int().nonnegative(),
    debugIdCount: z.number().int().nonnegative(),
    symbolCount: z.number().int().nonnegative(),
    stacktraceCount: z.number().int().nonnegative(),
    breadcrumbCount: z.number().int().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
    privacyCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  captureSignals: z.array(z.object({
    signal: z.enum(["exception-capture", "unhandled-exception", "unhandled-rejection", "native-crash", "manual-notify", "event-pipeline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["release-version", "dist-build", "environment-stage", "commit-sha", "deploy-tracking", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  symbolicationSignals: z.array(z.object({
    signal: z.enum(["source-map-upload", "debug-id", "artifact-bundle", "dsym", "proguard-mapping", "stacktrace-linking", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["breadcrumbs", "sessions", "user-context", "tags-metadata", "severity-level", "fingerprint-grouping", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["before-send", "on-error-filter", "scrub-fields", "pii-toggle", "payload-truncation", "sampling-rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["dsn-access-token", "notify-endpoint", "sessions-endpoint", "offline-queue", "retry-rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-upload", "release-command", "artifact-upload", "sourcemap-test", "crash-smoke-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@sentry/*", "@bugsnag/js", "rollbar", "sentry-cli", "bugsnag-source-maps", "unknown"]),
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

export const IncidentResponseReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  incidentSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["pagerduty", "grafana-oncall", "firehydrant", "runbook", "status-page", "workflow", "terraform", "unknown"]),
    incidentCount: z.number().int().nonnegative(),
    alertRouteCount: z.number().int().nonnegative(),
    escalationCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    runbookCount: z.number().int().nonnegative(),
    statusPageCount: z.number().int().nonnegative(),
    roleCount: z.number().int().nonnegative(),
    severityCount: z.number().int().nonnegative(),
    timelineCount: z.number().int().nonnegative(),
    postmortemCount: z.number().int().nonnegative(),
    automationCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  intakeSignals: z.array(z.object({
    signal: z.enum(["alert-route", "signal-rule", "webhook", "email-ingest", "manual-incident", "deduplication", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  triageSignals: z.array(z.object({
    signal: z.enum(["severity", "priority", "incident-type", "service-ownership", "team-assignment", "deduplication", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  onCallSignals: z.array(z.object({
    signal: z.enum(["schedule", "rotation", "handoff", "escalation-policy", "override", "follow-the-sun", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  communicationSignals: z.array(z.object({
    signal: z.enum(["slack", "chatops", "phone", "sms", "email", "status-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runbookSignals: z.array(z.object({
    signal: z.enum(["runbook", "automatic-step", "manual-step", "owner", "attachment-rule", "private-incident", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["acknowledge", "resolve", "timeline", "retrospective", "postmortem", "incident-role", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["terraform-provider", "api-token", "audit-log", "access-control", "restricted-runbook", "enterprise-tier", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-validate", "terraform-plan", "import", "drift-detection", "incident-drill", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pagerduty-provider", "grafana-oncall", "firehydrant-provider", "slack-sdk", "twilio", "unknown"]),
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

export const SloReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sloSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["openslo", "sloth", "pyrra", "prometheus-rule", "grafana-dashboard", "workflow", "custom", "unknown"]),
    sloCount: z.number().int().nonnegative(),
    sliCount: z.number().int().nonnegative(),
    objectiveCount: z.number().int().nonnegative(),
    targetCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    budgetCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    recordingRuleCount: z.number().int().nonnegative(),
    burnRateCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    dataSourceCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    dashboardCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  specSignals: z.array(z.object({
    signal: z.enum(["openslo", "sloth-spec", "pyrra-crd", "prometheus-rule", "yaml-manifest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  openSloObjectSignals: z.array(z.object({
    signal: z.enum(["data-source-kind", "slo-kind", "sli-kind", "alert-policy-kind", "alert-condition-kind", "alert-notification-target-kind", "service-kind", "metadata-name", "display-name", "labels", "annotations", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timeWindowSignals: z.array(z.object({
    signal: z.enum(["duration-shorthand", "rolling-window", "calendar-window", "time-zone", "budgeting-occurrences", "budgeting-timeslices", "budgeting-ratio-timeslices", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metricSourceSignals: z.array(z.object({
    signal: z.enum(["metric-source-ref", "metric-source-type", "connection-details", "ratio-good-total", "ratio-bad-total", "raw-ratio-type", "threshold-operator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  indicatorSignals: z.array(z.object({
    signal: z.enum(["ratio-metric", "threshold-metric", "latency", "availability", "error-query", "total-query", "raw-ratio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  objectiveSignals: z.array(z.object({
    signal: z.enum(["target", "target-percent", "time-window", "budgeting-method", "composite-weight", "error-budget", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alertSignals: z.array(z.object({
    signal: z.enum(["burn-rate", "multi-window", "page-alert", "ticket-alert", "prometheus-alert", "alert-after", "alert-labels", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["recording-rules", "prometheus-operator", "promql-window-template", "rule-output", "generic-rules", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["service-owner", "labels", "team", "runbook-link", "dashboard", "validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-validate", "sloth-validate", "kubectl-apply", "helm-chart", "dry-run", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["sloth", "pyrra", "openslo", "prometheus-operator", "grafana", "unknown"]),
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

export const CostReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  costSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["infracost", "opencost", "kubecost", "prometheus", "helm", "terraform", "workflow", "custom", "unknown"]),
    estimateCount: z.number().int().nonnegative(),
    diffCount: z.number().int().nonnegative(),
    allocationCount: z.number().int().nonnegative(),
    pricingCount: z.number().int().nonnegative(),
    cloudCostCount: z.number().int().nonnegative(),
    budgetCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    prometheusCount: z.number().int().nonnegative(),
    dashboardCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  estimateSignals: z.array(z.object({
    signal: z.enum(["infracost-breakdown", "infracost-diff", "usage-file", "config-file", "monthly-cost", "policy-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  allocationSignals: z.array(z.object({
    signal: z.enum(["namespace", "pod", "node", "controller", "service", "label", "cloud-cost", "asset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pricingSignals: z.array(z.object({
    signal: z.enum(["custom-pricing", "pricing-csv", "cloud-provider", "aws", "azure", "gcp", "on-prem", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  budgetSignals: z.array(z.object({
    signal: z.enum(["budget-config", "threshold", "forecast", "savings", "rightsizing", "cost-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["prometheus-endpoint", "metrics", "recording-rules", "grafana", "thanos", "network-costs", "persistent-volume", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["pull-request-comment", "github-actions", "ci-cost-diff", "helm-install", "kubectl-cost", "mcp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["infracost", "opencost", "kubecost", "prometheus", "grafana", "helm", "unknown"]),
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

export const ProgressiveDeliveryReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  rolloutSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["argo-rollouts", "flagger", "kayenta", "spinnaker", "istio", "linkerd", "nginx", "gateway-api", "workflow", "custom", "unknown"]),
    strategyCount: z.number().int().nonnegative(),
    canaryCount: z.number().int().nonnegative(),
    blueGreenCount: z.number().int().nonnegative(),
    trafficRoutingCount: z.number().int().nonnegative(),
    analysisCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    promotionCount: z.number().int().nonnegative(),
    abortCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  strategySignals: z.array(z.object({
    signal: z.enum(["rollout-crd", "canary-crd", "blue-green", "canary-steps", "experiment", "traffic-routing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trafficSignals: z.array(z.object({
    signal: z.enum(["set-weight", "step-weight", "max-weight", "traffic-split", "service-mesh", "ingress", "gateway-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  analysisSignals: z.array(z.object({
    signal: z.enum(["analysis-template", "metric-template", "kayenta-judge", "prometheus-query", "datadog-query", "webhook-check", "threshold-range", "score-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["manual-promotion", "auto-promotion", "abort-on-failure", "pause-step", "rollback", "progress-deadline", "failure-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  notificationSignals: z.array(z.object({
    signal: z.enum(["slack", "msteams", "webhook", "alert-provider", "event", "analysis-run-status", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["kubectl-plugin", "promote-command", "abort-command", "retry-command", "helm-install", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["argo-rollouts", "flagger", "kayenta", "spinnaker", "prometheus", "istio", "linkerd", "unknown"]),
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

export const LoadTestingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  loadTestSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["k6", "artillery", "locust", "jmeter", "gatling", "autocannon", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    scriptCount: z.number().int().nonnegative(),
    scenarioCount: z.number().int().nonnegative(),
    loadProfileCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    protocolCount: z.number().int().nonnegative(),
    dataCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    distributedCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["k6", "artillery", "locust", "jmeter", "gatling", "autocannon", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  profileSignals: z.array(z.object({
    signal: z.enum(["vus", "duration", "stages", "scenarios", "arrival-rate", "ramping", "spawn-rate", "users", "wait-time", "load-shape", "soak", "stress", "spike", "smoke", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  protocolSignals: z.array(z.object({
    signal: z.enum(["http", "websocket", "grpc", "graphql", "browser", "playwright", "tcp", "custom-client", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assertionSignals: z.array(z.object({
    signal: z.enum(["thresholds", "checks", "ensure", "expect-plugin", "apdex", "slo", "abort-on-fail", "percentiles", "status-check", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["setup-teardown", "shared-array", "csv-data", "env-vars", "processor", "custom-metrics", "tags", "parameterization", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["headless", "cloud", "distributed-master-worker", "k6-operator", "docker", "ci-workflow", "artifact-upload", "parallel-workers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["summary", "handleSummary", "json", "html", "csv", "prometheus", "influxdb", "grafana", "datadog", "cloud-dashboard", "junit", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["k6", "artillery", "@artilleryio/*", "artillery-engine-playwright", "locust", "locust-plugins", "jmeter", "gatling", "autocannon", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
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

export const BenchmarkReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  benchmarkSuites: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["vitest-bench", "tinybench", "benchmark-js", "hyperfine", "criterion", "pytest-benchmark", "go-bench", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    warmupCount: z.number().int().nonnegative(),
    iterationCount: z.number().int().nonnegative(),
    parameterCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    asyncCount: z.number().int().nonnegative(),
    baselineCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["vitest-bench", "tinybench", "benchmark-js", "hyperfine", "criterion", "pytest-benchmark", "go-bench", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timingSignals: z.array(z.object({
    signal: z.enum(["hrtime", "performance-now", "warmup", "iterations", "runs", "min-runs", "time-window", "samples", "concurrency", "async", "gc-control", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  comparisonSignals: z.array(z.object({
    signal: z.enum(["suite", "tasks", "baseline", "compare", "fastest-slowest", "parameter-scan", "parameter-list", "relative-times", "regression-threshold", "statistical-significance", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["console-table", "json", "markdown", "csv", "html", "junit", "bencher", "github-step-summary", "artifact-upload", "trend-history", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "scheduled", "pull-request", "hyperfine-command", "vitest-bench-command", "cargo-bench-command", "pytest-benchmark-command", "go-test-bench-command", "benchmarkjs-command", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tinybench", "benchmark", "hyperfine", "criterion", "pytest-benchmark", "bencher", "vitest", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
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

export type ApiContractReport = z.infer<typeof ApiContractReportSchema>;
export type ConsumerContractReadinessReport = z.infer<typeof ConsumerContractReadinessReportSchema>;
export type ObservabilityReport = z.infer<typeof ObservabilityReportSchema>;
export type PerformanceReport = z.infer<typeof PerformanceReportSchema>;
export type ProfilingReadinessReport = z.infer<typeof ProfilingReadinessReportSchema>;
export type TracingReadinessReport = z.infer<typeof TracingReadinessReportSchema>;
export type DebugReadinessReport = z.infer<typeof DebugReadinessReportSchema>;
export type CrashReportingReadinessReport = z.infer<typeof CrashReportingReadinessReportSchema>;
export type IncidentResponseReadinessReport = z.infer<typeof IncidentResponseReadinessReportSchema>;
export type SloReadinessReport = z.infer<typeof SloReadinessReportSchema>;
export type CostReadinessReport = z.infer<typeof CostReadinessReportSchema>;
export type ProgressiveDeliveryReadinessReport = z.infer<typeof ProgressiveDeliveryReadinessReportSchema>;
export type LoadTestingReadinessReport = z.infer<typeof LoadTestingReadinessReportSchema>;
export type BenchmarkReadinessReport = z.infer<typeof BenchmarkReadinessReportSchema>;
