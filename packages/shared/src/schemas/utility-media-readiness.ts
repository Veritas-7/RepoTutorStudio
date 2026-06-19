import { z } from "zod";

export const AnalyticsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  analyticsSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["posthog", "segment", "amplitude", "mixpanel", "custom", "unknown"]),
    initCount: z.number().int().nonnegative(),
    captureCount: z.number().int().nonnegative(),
    identityCount: z.number().int().nonnegative(),
    pageviewCount: z.number().int().nonnegative(),
    privacyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["capture", "track", "pageview", "autocapture", "feature-interaction", "error-capture", "custom-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["identify", "alias", "group", "reset", "distinct-id", "person-properties", "group-properties", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["opt-in", "opt-out", "has-opted-in", "has-opted-out", "disable-session-recording", "before-send", "property-filter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  productSignals: z.array(z.object({
    signal: z.enum(["feature-flags", "flag-payload", "flag-bootstrap", "session-recording", "heatmaps", "surveys", "web-vitals", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["posthog-js", "posthog-js-lite", "posthog-node", "@posthog/react", "@posthog/nextjs-config", "@segment/analytics-next", "@amplitude/analytics-browser", "mixpanel-browser", "unknown"]),
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

export const HttpClientReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  httpClientSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["got", "axios", "fetch", "ky", "ofetch", "superagent", "custom", "unknown"]),
    requestCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  requestSignals: z.array(z.object({
    signal: z.enum(["get", "post", "put-patch-delete", "json-body", "form-body", "query-params", "base-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resilienceSignals: z.array(z.object({
    signal: z.enum(["timeout", "retry-limit", "retry-methods", "retry-status-codes", "retry-after", "abort-signal", "throw-http-errors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configurationSignals: z.array(z.object({
    signal: z.enum(["prefix-url", "headers", "search-params", "response-type", "resolve-body-only", "hooks", "extend-instance", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["agent", "http2", "proxy", "cache", "cookie-jar", "decompress", "unix-socket", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["http-error", "request-error", "timeout-error", "cancel-error", "metadata", "validate-status", "catch-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["got", "axios", "ky", "ofetch", "node-fetch", "undici", "superagent", "unknown"]),
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

export const SchemaValidationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schemaSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["zod", "yup", "ajv", "joi", "valibot", "arktype", "io-ts", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    parseCount: z.number().int().nonnegative(),
    safeParseCount: z.number().int().nonnegative(),
    refinementCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  shapeSignals: z.array(z.object({
    signal: z.enum(["object", "array", "union", "discriminated-union", "enum", "literal", "record", "optional-nullable", "strict-passthrough", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parserSignals: z.array(z.object({
    signal: z.enum(["parse", "safe-parse", "parse-async", "safe-parse-async", "decode", "validate", "assert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  typeSignals: z.array(z.object({
    signal: z.enum(["infer", "input-output", "branded", "standard-schema", "json-schema", "openapi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  refinementSignals: z.array(z.object({
    signal: z.enum(["refine", "super-refine", "transform", "preprocess", "coerce", "default-catch", "pipe-codec", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["zod-error", "issues", "format", "flatten", "treeify", "prettify", "custom-error-map", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    signal: z.enum(["env-validation", "api-validation", "form-validation", "trpc", "react-hook-form", "drizzle-zod", "json-schema-export", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  zodSignals: z.array(z.object({
    signal: z.enum(["zod-v4-import", "zod-mini-import", "strict-object", "loose-object", "catchall", "template-literal", "stringbool", "codec", "decode", "encode", "prefault", "readonly", "registry", "global-registry", "meta", "describe", "native-json-schema", "json-schema-io", "json-schema-registry", "error-param", "treeify-error", "flatten-error", "prettify-error", "pipe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valibotSignals: z.array(z.object({
    signal: z.enum(["v-object", "v-pipe", "v-variant", "v-picklist", "v-parser", "v-safe-parser", "v-infer-output", "v-issues", "v-flatten", "v-forward", "v-partial-check", "v-raw-check", "v-metadata", "v-json-schema", "zod-codemod", "standard-schema", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["zod", "@hookform/resolvers", "drizzle-zod", "zod-to-json-schema", "ajv", "yup", "valibot", "@valibot/to-json-schema", "io-ts", "unknown"]),
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

export const DateTimeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dateTimeSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["luxon", "date-fns", "dayjs", "moment", "native-date", "temporal", "custom", "unknown"]),
    dateTimeCount: z.number().int().nonnegative(),
    parseCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    zoneCount: z.number().int().nonnegative(),
    mathCount: z.number().int().nonnegative(),
    validityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  constructionSignals: z.array(z.object({
    signal: z.enum(["now", "local", "utc", "from-js-date", "from-millis-seconds", "from-object", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parsingSignals: z.array(z.object({
    signal: z.enum(["from-iso", "from-format", "from-rfc-http", "from-sql", "parse-debug", "native-parse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formattingSignals: z.array(z.object({
    signal: z.enum(["to-iso", "to-format", "to-locale-string", "to-rfc-http", "unix-timestamp", "relative-output", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  zoneSignals: z.array(z.object({
    signal: z.enum(["set-zone", "utc-local", "iana-zone", "fixed-offset", "default-zone", "keep-local-time", "dst-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  durationSignals: z.array(z.object({
    signal: z.enum(["duration", "interval", "diff", "plus-minus", "start-end-of", "relative", "conversion-accuracy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validitySignals: z.array(z.object({
    signal: z.enum(["is-valid", "invalid-reason", "throw-on-invalid", "invalid-duration", "invalid-interval", "test-clock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  luxonSignals: z.array(z.object({
    signal: z.enum(["datetime-class", "duration-class", "interval-class", "info-class", "settings-class", "iana-zone", "fixed-offset-zone", "invalid-zone", "system-zone", "from-rfc-http", "from-sql", "from-format-explain", "set-zone-option", "keep-local-time", "keep-calendar-time", "locale-output", "numbering-system", "output-calendar", "resolved-locale-options", "relative-calendar", "duration-human", "duration-shift", "duration-normalize", "duration-rescale", "interval-contains", "interval-split", "interval-map-endpoints", "interval-count", "interval-overlap", "interval-engulf-abut", "has-same", "equals", "week-settings", "local-week", "settings-now", "settings-throw-on-invalid", "two-digit-cutoff-year", "zone-cache-reset", "invalid-explanation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["luxon", "date-fns", "dayjs", "moment", "moment-timezone", "@js-temporal/polyfill", "unknown"]),
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

export const IdGenerationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  idGeneratorSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["nanoid", "uuid", "cuid2", "ulid", "crypto-randomuuid", "custom", "unknown"]),
    generatorCount: z.number().int().nonnegative(),
    secureRandomCount: z.number().int().nonnegative(),
    customAlphabetCount: z.number().int().nonnegative(),
    customRandomCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    usageRiskCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  generationSignals: z.array(z.object({
    signal: z.enum(["default-nanoid", "sized-nanoid", "custom-alphabet", "custom-random", "url-alphabet", "random-bytes", "cli-generation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entropySignals: z.array(z.object({
    signal: z.enum(["crypto-random-values", "node-crypto", "web-crypto", "math-random", "non-secure-import", "collision-calculator", "uniformity", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alphabetSignals: z.array(z.object({
    signal: z.enum(["url-safe", "custom-alphabet", "alphabet-size-limit", "dictionary", "prefix-suffix", "length-override", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["esm-import", "dynamic-import", "commonjs-require", "browser", "react-native-random-values", "deno-jsr", "cli", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  usageSignals: z.array(z.object({
    signal: z.enum(["model-id", "database-id", "react-key", "mock-id", "branded-type", "public-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["positive-size", "alphabet-required-with-size", "collision-tests", "uniqueness-tests", "distribution-tests", "type-tests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nanoid", "uuid", "@paralleldrive/cuid2", "ulid", "react-native-get-random-values", "unknown"]),
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

export const ImageProcessingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  imageProcessingSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["sharp", "jimp", "imagemin", "image-js", "canvas", "custom", "unknown"]),
    pipelineCount: z.number().int().nonnegative(),
    resizeCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["file-input", "buffer-input", "stream-input", "raw-create", "animated-pages", "density", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["resize", "rotate", "extract", "composite", "trim", "effects", "colourspace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["to-file", "to-buffer", "jpeg", "png", "webp-avif", "tiff-gif", "metadata-output", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["limit-input-pixels", "fail-on", "timeout", "without-enlargement", "sequential-read", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  performanceSignals: z.array(z.object({
    signal: z.enum(["cache", "concurrency", "libvips", "stream-pipeline", "clone", "queue", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["sharp", "jimp", "imagemin", "image-js", "canvas", "squoosh", "unknown"]),
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

export const FileUploadReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  fileUploadSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["uppy", "react-dropzone", "multer", "formidable", "busboy", "custom", "unknown"]),
    uploaderCount: z.number().int().nonnegative(),
    restrictionCount: z.number().int().nonnegative(),
    transportCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["dashboard", "drag-drop", "file-input", "dropzone", "camera-screen", "remote-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  restrictionSignals: z.array(z.object({
    signal: z.enum(["mime-types", "max-file-size", "max-number-files", "image-dimensions", "required-meta-fields", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["xhr-upload", "tus-resumable", "s3-multipart", "companion", "endpoint", "headers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["progress", "status", "cancel-retry", "complete", "error", "pause-resume", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["auth-headers", "csrf", "virus-scan", "content-validation", "storage-path", "rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["uppy", "@uppy/react", "@uppy/xhr-upload", "@uppy/tus", "react-dropzone", "multer", "formidable", "unknown"]),
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

export const WebSocketReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  webSocketSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["ws", "socket.io", "uwebsockets", "native-websocket", "sse", "custom", "unknown"]),
    serverCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    upgradeCount: z.number().int().nonnegative(),
    messageCount: z.number().int().nonnegative(),
    heartbeatCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  connectionSignals: z.array(z.object({
    signal: z.enum(["server", "client", "upgrade", "namespace-room", "reconnect", "tls", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  messageSignals: z.array(z.object({
    signal: z.enum(["send", "message-handler", "json-parse", "binary", "broadcast", "schema-validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["open", "close", "error", "ping-pong", "reconnect", "backpressure", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["origin-check", "auth-token", "rate-limit", "payload-limit", "heartbeat-timeout", "compression", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["ws", "socket.io", "uWebSockets.js", "isomorphic-ws", "native-websocket", "unknown"]),
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

export const RealtimeMediaReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mediaSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["livekit", "mediasoup", "peerjs", "webrtc", "daily", "twilio", "custom", "unknown"]),
    roomCount: z.number().int().nonnegative(),
    signalingCount: z.number().int().nonnegative(),
    mediaTrackCount: z.number().int().nonnegative(),
    deviceCount: z.number().int().nonnegative(),
    publishCount: z.number().int().nonnegative(),
    subscribeCount: z.number().int().nonnegative(),
    dataChannelCount: z.number().int().nonnegative(),
    transportCount: z.number().int().nonnegative(),
    iceCount: z.number().int().nonnegative(),
    qualityCount: z.number().int().nonnegative(),
    recordingCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["livekit", "mediasoup", "peerjs", "native-webrtc", "twilio-video", "daily", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  roomSignals: z.array(z.object({
    signal: z.enum(["room", "participant", "peer", "sfu-router", "call", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deviceSignals: z.array(z.object({
    signal: z.enum(["get-user-media", "camera", "microphone", "screen-share", "device-list", "autoplay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trackSignals: z.array(z.object({
    signal: z.enum(["local-track", "remote-track", "publish-track", "subscribe-track", "media-stream", "simulcast", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["ice", "dtls", "stun-turn", "webrtc-transport", "send-transport", "recv-transport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sfuSignals: z.array(z.object({
    signal: z.enum(["rtp-capabilities", "media-codecs", "producer-consumer", "plain-transport", "pipe-transport", "direct-transport", "sctp", "active-speaker-observer", "audio-level-observer", "score-trace", "transport-close", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataChannelSignals: z.array(z.object({
    signal: z.enum(["data-channel", "data-track", "peer-data-connection", "rpc", "reliable-unreliable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["adaptive-stream", "dynacast", "connection-quality", "stats", "reconnect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["token", "e2ee", "permission", "track-permission", "secure-peer-server", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["playwright", "browserstack", "media-e2e", "artifact-upload", "fuzzer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["livekit-client", "mediasoup", "mediasoup-client", "peerjs", "simple-peer", "webrtc-adapter", "unknown"]),
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

export type AnalyticsReadinessReport = z.infer<typeof AnalyticsReadinessReportSchema>;
export type HttpClientReadinessReport = z.infer<typeof HttpClientReadinessReportSchema>;
export type SchemaValidationReadinessReport = z.infer<typeof SchemaValidationReadinessReportSchema>;
export type DateTimeReadinessReport = z.infer<typeof DateTimeReadinessReportSchema>;
export type IdGenerationReadinessReport = z.infer<typeof IdGenerationReadinessReportSchema>;
export type ImageProcessingReadinessReport = z.infer<typeof ImageProcessingReadinessReportSchema>;
export type FileUploadReadinessReport = z.infer<typeof FileUploadReadinessReportSchema>;
export type WebSocketReadinessReport = z.infer<typeof WebSocketReadinessReportSchema>;
export type RealtimeMediaReadinessReport = z.infer<typeof RealtimeMediaReadinessReportSchema>;
