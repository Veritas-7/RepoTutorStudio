import { z } from "zod";

export const OpenApiClientReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  clientSetups: z.array(z.object({
    filePath: z.string(),
    generator: z.enum(["openapi-typescript", "hey-api", "orval", "openapi-generator", "swagger-codegen", "custom", "unknown"]),
    specCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    typeCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    mockCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    scriptCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  specSignals: z.array(z.object({
    signal: z.enum(["openapi", "swagger", "input-spec", "remote-schema", "multi-spec", "redocly-config", "schema-validation", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  generatorSignals: z.array(z.object({
    signal: z.enum(["openapi-typescript", "openapi-fetch", "hey-api", "orval", "openapi-generator", "swagger-codegen", "generator-name", "config-file", "cli-command", "vite-plugin", "nuxt-module", "watch-mode", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["types", "client-sdk", "hooks", "schemas", "mocks", "zod", "valibot", "arktype", "transformers", "msw", "server-stub", "docs", "split-output", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["fetch", "axios", "ky", "ofetch", "next", "nuxt", "react-query", "swr", "angular", "vue", "svelte", "hono", "mcp", "interceptors", "custom-client", "custom-mutator", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientTargetSignals: z.array(z.object({
    signal: z.enum(["models", "requests", "react", "react-query", "preact-query", "swr", "pinia-colada", "vue-query", "svelte-query", "solid-query", "solid-start", "angular", "angular-query", "hono", "fastify", "nestjs", "orpc", "zod", "valibot", "arktype", "transformers", "effect", "native-fetch", "mcp-server", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  generationWorkflowSignals: z.array(z.object({
    signal: z.enum(["update-samples", "test-samples", "snapshot-tests", "snapshot-update", "cli-type-validation", "generated-output", "vite-plugin", "nuxt-module", "watch-mode", "multi-output", "reviewed-ai-output", "valid-openapi-v3", "swagger-v2", "yaml-json-spec", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["validate-spec", "lint", "snapshots", "generated-diff", "typecheck", "ci", "ignore-file", "templates", "plugin-config", "input-error", "security-review", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["openapi-typescript", "openapi-fetch", "orval", "@openapitools/openapi-generator-cli", "openapi-generator-cli", "swagger-codegen", "@hey-api/openapi-ts", "@hey-api/client-fetch", "@hey-api/client-axios", "@hey-api/client-ky", "@hey-api/client-next", "@hey-api/client-nuxt", "@hey-api/client-ofetch", "@hey-api/sdk", "@hey-api/schemas", "@hey-api/transformers", "@hey-api/typescript", "@tanstack/preact-query", "@pinia/colada", "valibot", "arktype", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
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

export const WebhookReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  webhookSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["svix", "standard-webhooks", "hookdeck", "stripe", "github", "custom", "unknown"]),
    endpointCount: z.number().int().nonnegative(),
    signatureCount: z.number().int().nonnegative(),
    replayCount: z.number().int().nonnegative(),
    idempotencyCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    deliveryCount: z.number().int().nonnegative(),
    eventTypeCount: z.number().int().nonnegative(),
    localDebugCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  endpointSignals: z.array(z.object({
    signal: z.enum(["endpoint", "route", "source", "destination", "connection", "fan-out", "event-filter", "source-auth", "destination-auth", "transformation", "rate-limit", "healthcheck", "https", "status-code", "timeout", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  signatureSignals: z.array(z.object({
    signal: z.enum(["webhook-id", "webhook-timestamp", "webhook-signature", "hmac", "ed25519", "secret-prefix", "public-key", "private-key", "trust-list", "constant-time", "raw-body", "rotation", "asymmetric", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  verificationSignals: z.array(z.object({
    signal: z.enum(["signed-content", "metadata-binding", "versioned-signature", "multi-signature", "base64-secret", "timestamp-tolerance", "required-headers", "invalid-signature", "payload-schema", "thin-full-payload", "payload-size", "retry-after", "ssrf-protection", "legacy-migration", "api-gateway-verification", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["retry", "retry-schedule", "retry-count", "backoff", "jitter", "delivery-attempt", "manual-replay", "idempotency", "dedupe-store", "disable-endpoint", "pause-connection", "rate-limit", "retry-after", "exhausted-event", "queue-depth", "dead-letter", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  operationsSignals: z.array(z.object({
    signal: z.enum(["dashboard", "event-history", "request-log", "attempt-log", "failure-rate", "metrics", "issues", "alerts", "event-gateway", "mcp", "mcp-tools", "cli-listen", "local-forward", "config-profile", "bookmark", "healthcheck", "telemetry-opt-out", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["svix", "standardwebhooks", "standard-webhooks-spec", "hookdeck-cli", "hookdeck-gateway", "stripe", "@octokit/webhooks", "express", "next-server", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
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

export const NotificationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  notificationSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["novu", "knock", "magicbell", "firebase", "onesignal", "custom", "unknown"]),
    workflowCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    subscriberCount: z.number().int().nonnegative(),
    topicCount: z.number().int().nonnegative(),
    preferenceCount: z.number().int().nonnegative(),
    channelCount: z.number().int().nonnegative(),
    inboxCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    credentialCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["workflow", "trigger", "step", "digest", "delay", "condition", "payload", "tenant", "conversation", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  audienceSignals: z.array(z.object({
    signal: z.enum(["subscriber", "subscriber-id", "topic", "subscription", "preferences", "segments", "user-profile", "tenant", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  channelSignals: z.array(z.object({
    signal: z.enum(["inbox", "email", "sms", "push", "chat", "slack", "teams", "telegram", "whatsapp", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["template", "subject", "body", "editor", "variables", "localization", "branding", "preview", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  operationsSignals: z.array(z.object({
    signal: z.enum(["api-key", "environment", "webhook", "delivery-log", "activity-feed", "rate-limit", "retry", "analytics", "dashboard", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@novu/node", "@novu/js", "@novu/react", "@knocklabs/node", "@magicbell/react", "firebase-admin", "onesignal-node", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
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

export const ConsentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  consentSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["cookieconsent", "klaro", "iab-tcf", "custom", "unknown"]),
    bannerCount: z.number().int().nonnegative(),
    modalCount: z.number().int().nonnegative(),
    categoryCount: z.number().int().nonnegative(),
    serviceCount: z.number().int().nonnegative(),
    purposeCount: z.number().int().nonnegative(),
    vendorCount: z.number().int().nonnegative(),
    scriptBlockingCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    localizationCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  bannerSignals: z.array(z.object({
    signal: z.enum(["banner", "modal", "accept-all", "accept-selected", "reject-all", "settings-button", "revision", "hide-from-bots", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  categorySignals: z.array(z.object({
    signal: z.enum(["necessary", "analytics", "marketing", "preferences", "functional", "performance", "services", "purposes", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["data-src", "text-plain", "data-type", "data-name", "autoclear", "page-script", "disable-page-interaction", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["privacy-policy", "withdraw", "opt-out", "consent-mode", "gpc", "do-not-track", "legitimate-interest", "proof", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tcfSignals: z.array(z.object({
    signal: z.enum(["__tcfapi", "tc-string", "cmp-id", "vendor-list", "purpose-consents", "vendor-consents", "legitimate-interests", "gvl", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vanilla-cookieconsent", "klaro", "@iabtcf/core", "@iabtcf/cmpapi", "@iabtcf/stub", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
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

export const PrivacyReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  privacySetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["presidio", "opendp", "scrubadub", "pii-scanner", "gdpr", "ccpa", "custom", "unknown"]),
    detectorCount: z.number().int().nonnegative(),
    anonymizerCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    retentionCount: z.number().int().nonnegative(),
    consentCount: z.number().int().nonnegative(),
    dsarCount: z.number().int().nonnegative(),
    differentialPrivacyCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  piiDetectionSignals: z.array(z.object({
    signal: z.enum(["presidio-analyzer", "pattern-recognizer", "recognizer-result", "scrubadub-detector", "email-phone-name-address", "score-threshold", "custom-entity", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  redactionSignals: z.array(z.object({
    signal: z.enum(["anonymizer-engine", "operator-config", "replace-mask-redact", "encrypt-decrypt", "surrogate-token", "scrubadub-post-processor", "hash-tokenize", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["privacy-policy", "data-classification", "data-minimization", "retention-policy", "deletion-policy", "dsar-export-delete", "consent-purpose", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  differentialPrivacySignals: z.array(z.object({
    signal: z.enum(["opendp-measurement", "privacy-map", "epsilon-delta", "laplace-gaussian-noise", "clamp-bounds", "privacy-budget", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["allow-list", "deny-list", "score-threshold", "locale", "nlp-engine", "operator-defaults", "database-field-map", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "privacy-scan-command", "pii-test-fixture", "redaction-artifact", "policy-check", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["presidio", "opendp", "scrubadub", "faker", "zod", "yup", "pydantic", "gdpr", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
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

export const ServerFrameworkReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  serverSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["fastify", "express", "koa", "hono", "nestjs", "hapi", "elysia", "adonisjs", "sails", "meteor", "rails", "django", "laravel", "spring", "aspnet-core", "flask", "symfony", "gin", "echo", "fiber", "chi", "gorilla-mux", "custom", "unknown"]),
    routeCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    decoratorCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    listenCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  routeSignals: z.array(z.object({
    signal: z.enum(["get", "post", "put", "patch", "delete", "route", "all", "params", "prefix", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["body", "querystring", "params", "headers", "response", "add-schema", "validator-compiler", "serializer-compiler", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["register", "fastify-plugin", "autoload", "encapsulation", "plugin-options", "ready", "after", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["on-request", "pre-parsing", "pre-validation", "pre-handler", "pre-serialization", "on-send", "on-response", "on-error", "on-close", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["listen", "host", "port", "logger", "trust-proxy", "body-limit", "content-type-parser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["set-error-handler", "set-not-found-handler", "framework-errors", "validation-error", "reply-code", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["inject", "light-my-request", "supertest", "tap", "vitest", "tinytest", "rails-test", "django-test", "laravel-test", "spring-test", "aspnet-test", "flask-test", "symfony-test", "go-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fastifySignals: z.array(z.object({
    signal: z.enum(["app-instance", "route-shorthand", "route-object", "route-options-schema", "route-prefix", "register-plugin", "fastify-plugin", "autoload", "encapsulation", "decorate", "decorate-request", "decorate-reply", "has-decorator", "add-hook", "on-route-hook", "on-ready-hook", "on-listen-hook", "on-close-hook", "set-error-handler", "set-not-found-handler", "add-schema", "validator-compiler", "serializer-compiler", "schema-controller", "type-provider", "fastify-instance-type", "fastify-plugin-callback-type", "fastify-plugin-async-type", "fastify-request-type", "fastify-reply-type", "listen", "inject", "logger", "child-logger-factory", "trust-proxy", "body-limit", "content-type-parser", "reply-send", "reply-code", "request-params", "request-body", "request-query", "http2", "ajv", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  expressSignals: z.array(z.object({
    signal: z.enum(["app-instance", "router-instance", "router-mount", "route-shorthand", "route-object", "all-route", "middleware-use", "error-middleware", "param-middleware", "static-middleware", "json-parser", "urlencoded-parser", "raw-parser", "text-parser", "route-params", "request-query", "request-body", "request-cookies", "request-headers", "request-accepts", "response-send", "response-json", "response-jsonp", "response-status", "response-send-status", "response-render", "response-redirect", "response-send-file", "response-download", "response-cookie", "response-locals", "app-locals", "app-settings", "view-engine", "template-engine", "trust-proxy", "sub-app-mount", "mountpath", "next-route", "listen", "supertest", "mocha", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  koaSignals: z.array(z.object({
    signal: z.enum(["app-instance", "middleware-use", "async-middleware", "await-next", "compose", "callback", "listen", "error-listener", "context-state", "context-body", "context-status", "context-throw", "context-assert", "context-cookies", "context-set", "context-get", "context-redirect", "request-object", "response-object", "request-accepts", "request-query", "request-body-json", "response-type", "response-stream", "app-context", "app-keys", "app-proxy", "proxy-ip-header", "subdomain-offset", "async-local-storage", "ctx-respond-false", "supertest", "node-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  nestjsSignals: z.array(z.object({
    signal: z.enum(["app-factory", "module-decorator", "controller-decorator", "method-decorators", "route-params", "request-body", "request-query", "request-headers", "injectable-provider", "injection-token", "provider-registration", "module-imports", "module-exports", "middleware-consumer", "guard", "pipe", "interceptor", "exception-filter", "global-prefix", "enable-cors", "global-pipes", "global-guards", "global-interceptors", "global-filters", "validation-pipe", "platform-express", "platform-fastify", "microservice", "websocket-gateway", "graphql-resolver", "testing-module", "e2e-supertest", "lifecycle-hooks", "config-module", "orm-module", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  honoSignals: z.array(z.object({
    signal: z.enum(["app-instance", "method-routes", "route-groups", "base-path", "middleware-use", "context-request", "context-response", "validator", "zod-validator", "rpc-client", "test-client", "fetch-handler", "node-server", "cloudflare-worker", "jsx-renderer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  hapiSignals: z.array(z.object({
    signal: z.enum(["server-instance", "route-object", "route-array", "route-options", "validation-joi", "response-schema", "auth-scheme", "auth-strategy", "auth-default", "plugin-register", "plugin-options", "extension-points", "lifecycle-on-request", "lifecycle-on-pre-auth", "lifecycle-on-post-auth", "lifecycle-on-pre-handler", "lifecycle-on-pre-response", "server-method", "decorate", "state-cookie", "cache", "validator", "toolkit-response", "toolkit-redirect", "request-params", "request-query", "request-payload", "request-headers", "boom-error", "server-start", "server-inject", "lab-test", "code-assertions", "inert-vision", "realm-plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  elysiaSignals: z.array(z.object({
    signal: z.enum(["app-instance", "method-routes", "route-options", "group", "guard", "plugin-use", "mount", "decorate", "state", "derive", "resolve", "model", "macro", "schema-typebox", "schema-body", "schema-query", "schema-params", "schema-headers", "schema-cookie", "schema-response", "lifecycle-on-request", "lifecycle-on-parse", "lifecycle-on-transform", "lifecycle-on-before-handle", "lifecycle-on-after-handle", "lifecycle-on-after-response", "lifecycle-on-error", "context-body", "context-query", "context-params", "context-headers", "context-cookie", "status-helper", "redirect-helper", "set-headers", "websocket", "listen", "handle", "fetch", "eden-treaty", "bun-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  adonisSignals: z.array(z.object({
    signal: z.enum(["core-package", "router-service", "method-routes", "route-group", "route-prefix", "route-name", "resource-routes", "api-only-resource", "route-where", "route-middleware", "global-middleware", "named-middleware", "controller-string", "controller-lazy-import", "http-context", "request-input", "request-params", "request-validate-using", "response-status", "response-redirect", "bodyparser", "service-provider", "application-service", "ioc-container", "ace-command", "ignitor", "server-service", "vine-validation", "exception-handler", "health-check", "japa-test", "test-utils", "supertest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sailsSignals: z.array(z.object({
    signal: z.enum(["package", "lift-load", "config-routes", "route-address", "router-bind", "router-private", "action-classic", "action2-inputs", "action2-exits", "action2-fn", "register-action", "action-middleware", "policies-config", "policy-file", "blueprints-config", "blueprint-actions", "hooks-config", "hook-routes", "hook-initialize", "helpers", "models-waterline", "services", "request-param", "request-body-query", "request-file", "response-json", "response-view", "response-redirect", "response-status", "sockets", "sails-request", "mocha-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  meteorSignals: z.array(z.object({
    signal: z.enum(["package", "meteor-directory", "package-list", "main-module", "startup", "methods", "method-call", "method-apply", "publish", "subscribe", "ddp-connect", "ddp-runtime-config", "mongo-collection", "accounts", "settings", "is-client-server", "webapp-handlers", "check-match", "tracker-autorun", "template-lifecycle", "template-events", "template-helpers", "blaze-render", "package-describe", "package-on-use", "api-use", "api-add-files", "tinytest", "meteor-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  railsSignals: z.array(z.object({
    signal: z.enum(["gem", "application-class", "routes-draw", "route-resources", "route-member-collection", "route-namespace", "route-scope", "route-root", "route-mount", "controller-base", "controller-action", "before-action", "strong-parameters", "render", "redirect", "rescue-from", "model-base", "associations", "validations", "migration", "schema", "active-job", "action-mailer", "action-cable", "active-storage", "engine", "railtie", "environment-config", "credentials", "rake-task", "rails-command", "integration-test", "active-support-test", "fixtures", "rspec-rails", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  djangoSignals: z.array(z.object({
    signal: z.enum(["package", "settings-module", "installed-apps", "urlconf", "path-route", "re-path-route", "include-route", "reverse-resolve", "function-view", "class-view", "generic-view", "render", "redirect", "http-response", "json-response", "http404-permission", "model-base", "fields", "relationships", "queryset-manager", "model-meta", "forms", "modelform", "form-validation", "middleware", "middleware-hooks", "admin", "admin-options", "migration", "migration-operations", "management-command", "django-admin", "template", "static-files", "asgi-wsgi", "testcase", "test-client", "request-factory", "override-settings", "fixtures", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  laravelSignals: z.array(z.object({
    signal: z.enum(["package", "application", "routing-facade", "router-methods", "route-group", "route-prefix", "route-name", "route-resource", "route-model-binding", "controller", "middleware", "service-provider", "container-binding", "request-validation", "form-request", "validator", "eloquent-model", "mass-assignment", "casts", "relationships", "query-builder", "migration", "schema-builder", "factory-seeder", "blade-view", "response-json", "redirect", "abort-exception", "artisan-command", "schedule", "queue-job", "mail", "notification", "broadcast", "event-listener", "cache-session", "config-env", "http-test", "phpunit-pest", "artisan-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  springSignals: z.array(z.object({
    signal: z.enum(["package", "boot-application", "spring-application-run", "rest-controller", "controller", "request-mapping", "method-mapping", "path-variable", "request-param", "request-body", "response-entity", "validation", "configuration", "auto-configuration", "configuration-properties", "bean", "conditional", "dependency-injection", "service", "repository", "component", "entity", "jpa-repository", "transactional", "security", "actuator", "health-indicator", "metrics", "application-properties", "profiles", "embedded-server", "webmvc", "webflux", "router-function", "command-line-runner", "scheduled", "event-listener", "cache", "exception-handler", "spring-boot-test", "webmvc-test", "mockmvc", "web-test-client", "test-rest-template", "dynamic-property-source", "testcontainers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  aspnetCoreSignals: z.array(z.object({
    signal: z.enum(["package", "project-sdk", "web-application-builder", "web-application-slim-builder", "builder-services", "service-registration", "options-configuration", "middleware-pipeline", "routing-middleware", "minimal-api-route", "map-group", "endpoint-metadata", "typed-results", "results-helper", "iresult", "mvc-controller", "api-controller", "controller-base", "route-attribute", "http-method-attributes", "binding-attributes", "action-result", "model-validation", "problem-details", "razor-pages", "static-files", "https-redirection", "authentication", "authorization", "cors", "openapi", "swagger-ui", "signalr", "grpc", "health-checks", "http-client-factory", "background-service", "hosted-service", "configuration", "appsettings", "kestrel", "iis-integration", "test-server", "web-application-factory", "http-client-test", "xunit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  flaskSignals: z.array(z.object({
    signal: z.enum(["package", "app-instance", "app-factory", "blueprint", "blueprint-register", "route-decorator", "blueprint-route", "add-url-rule", "method-view", "request-object", "request-json", "request-form-args", "response-jsonify", "render-template", "redirect", "abort", "url-for", "session", "g-object", "current-app", "app-context", "request-context", "before-request", "after-request", "teardown-request", "errorhandler", "config", "instance-config", "static-files", "template-folder", "cli-command", "flask-command", "signals", "extension-init", "test-client", "test-request-context", "test-cli-runner", "pytest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  symfonySignals: z.array(z.object({
    signal: z.enum(["package", "framework-bundle", "routing-component", "route-attribute", "route-collection", "route-loader", "router-interface", "url-generator", "controller", "abstract-controller", "request-object", "request-stack", "response-object", "json-response", "redirect-response", "render-template", "http-kernel", "kernel-interface", "micro-kernel", "dependency-injection", "service-config", "autowire", "compiler-pass", "event-subscriber", "security", "form-type", "validator", "console-command", "as-command", "messenger", "workflow", "twig-bundle", "kernel-browser", "web-test-case", "kernel-test-case", "command-tester", "phpunit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ginSignals: z.array(z.object({
    signal: z.enum(["package", "default-engine", "new-engine", "engine-type", "router-group", "method-routes", "route-group", "middleware-use", "handler-func", "context-param", "context-query", "context-post-form", "context-header", "context-raw-data", "binding", "binding-json", "binding-query", "binding-uri", "validator", "json-response", "string-response", "html-response", "redirect", "file-response", "status", "abort", "no-route", "no-method", "logger", "recovery", "trusted-proxies", "templates", "static-files", "run", "run-tls", "run-unix", "httptest", "create-test-context", "test-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  echoSignals: z.array(z.object({
    signal: z.enum(["package", "new-instance", "echo-type", "group-type", "method-routes", "route-group", "middleware-use", "handler-func", "context-param", "context-query", "context-form", "context-header", "request", "binding", "validator", "json-response", "string-response", "html-response", "redirect", "file-response", "attachment", "inline", "no-content", "stream", "http-error", "not-found-handler", "method-not-allowed-handler", "recover", "logger", "renderer", "static-files", "start", "start-tls", "start-auto-tls", "start-server", "new-context", "httptest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fiberSignals: z.array(z.object({
    signal: z.enum(["package", "new-app", "app-type", "ctx-type", "router-type", "method-routes", "route-group", "route-function", "mount", "middleware-use", "handler-func", "context-next", "context-param", "context-query", "context-header", "context-body", "binding", "validator", "json-response", "string-response", "render-response", "redirect", "send-file", "download", "send-stream", "send-status", "status", "fiber-error", "error-handler", "recover", "logger", "static-files", "listen", "listen-tls", "listen-mutual-tls", "app-test", "httptest", "custom-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  chiSignals: z.array(z.object({
    signal: z.enum(["package", "new-router", "new-mux", "mux-type", "router-interface", "routes-interface", "middlewares-type", "method-routes", "method-route", "method-func-route", "handle", "handle-func", "route-group", "route-function", "mount", "middleware-use", "middleware-with", "chain", "handler-func", "url-param", "url-param-from-ctx", "route-context", "new-route-context", "route-pattern", "route-params", "request-context", "json-response", "text-response", "response-status", "redirect", "not-found", "method-not-allowed", "routes-traversal", "match", "find", "logger", "recoverer", "request-id", "real-ip", "client-ip", "timeout", "compress", "throttle", "strip-slashes", "redirect-slashes", "url-format", "no-cache", "heartbeat", "content-type", "set-header", "get-head", "clean-path", "basic-auth", "route-headers", "with-value", "httptest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  muxSignals: z.array(z.object({
    signal: z.enum(["package", "new-router", "router-type", "route-type", "route-match", "route-match-type", "serve-http", "handle", "handle-func", "handler", "handler-func", "method-routes", "path", "path-prefix", "host", "headers", "headers-regexp", "queries", "schemes", "matcher-func", "subrouter", "route-name", "url-builder", "url-host", "url-path", "var-names", "build-vars-func", "strict-slash", "skip-clean", "encoded-path", "context-omit", "vars", "set-url-vars", "current-route", "current-router", "middleware-func", "router-use", "route-use", "cors-method-middleware", "not-found-handler", "method-not-allowed-handler", "walk", "walk-func", "route-getters", "static-files", "listen", "httptest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["fastify", "@fastify/autoload", "fastify-plugin", "express", "koa", "hono", "@nestjs/core", "@hapi/hapi", "elysia", "@adonisjs/core", "sails", "meteor", "rails", "django", "laravel", "spring", "aspnet-core", "flask", "symfony", "gin", "echo", "fiber", "chi", "gorilla-mux", "unknown"]),
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

export const RpcReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  rpcSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["trpc", "grpc", "connect", "json-rpc", "custom", "unknown"]),
    routerCount: z.number().int().nonnegative(),
    procedureCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    mutationCount: z.number().int().nonnegative(),
    subscriptionCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    middlewareCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    adapterCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  routerSignals: z.array(z.object({
    signal: z.enum(["init-trpc", "router", "nested-router", "merge-routers", "app-router", "app-router-type", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  procedureSignals: z.array(z.object({
    signal: z.enum(["procedure", "public-procedure", "protected-procedure", "query", "mutation", "subscription", "streaming", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["input", "output", "zod", "valibot", "superstruct", "standard-schema", "transformer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["context", "create-context", "middleware", "auth-guard", "meta", "next-ctx", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["create-client", "react-query", "next-client", "tanstack-options", "http-link", "batch-link", "subscription-link", "ws-link", "logger-link", "retry-link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  adapterSignals: z.array(z.object({
    signal: z.enum(["standalone", "next-api", "app-router", "express", "fastify", "fetch", "node-http", "websocket", "mcp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["trpc-error", "unauthorized", "forbidden", "not-found", "bad-request", "error-formatter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callerSignals: z.array(z.object({
    signal: z.enum(["create-caller", "create-caller-factory", "router-create-caller", "infer-router", "type-import", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@trpc/server", "@trpc/client", "@trpc/react-query", "@trpc/next", "@trpc/tanstack-react-query", "superjson", "zod", "unknown"]),
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

export const WorkspaceGraphReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  workspaceFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["nx-json", "project-json", "package-json", "pnpm-workspace", "lerna", "rush", "turbo", "moon", "workspace", "unknown"]),
    projectCount: z.number().int().nonnegative(),
    targetCount: z.number().int().nonnegative(),
    tagCount: z.number().int().nonnegative(),
    implicitDependencyCount: z.number().int().nonnegative(),
    namedInputCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  projectSignals: z.array(z.object({
    signal: z.enum(["project-json", "package-workspace", "apps-dir", "libs-dir", "packages-dir", "project-name", "source-root", "project-type", "tags", "implicit-dependencies", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  graphSignals: z.array(z.object({
    signal: z.enum(["project-graph", "create-project-graph", "read-project-graph", "nx-graph", "graph-file", "dependency-edge", "affected-graph", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundarySignals: z.array(z.object({
    signal: z.enum(["enforce-module-boundaries", "dep-constraints", "tags", "scopes", "lint-rule", "tsconfig-paths", "implicit-dependencies", "circular", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  affectedSignals: z.array(z.object({
    signal: z.enum(["nx-affected", "base-head", "affected-projects", "affected-target", "print-affected", "ci-affected", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["targets", "target-defaults", "named-inputs", "depends-on", "inputs", "outputs", "executor", "cache", "continuous", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["nx-plugin", "plugins", "create-nodes", "generators", "executors", "migrations", "inferred-tasks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nx", "@nx/workspace", "@nx/js", "@nx/eslint-plugin", "turbo", "pnpm-workspace", "unknown"]),
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

export const ScaffoldingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  generatorFiles: z.array(z.object({
    filePath: z.string(),
    generatorType: z.enum(["plopfile", "hygen", "yeoman", "schematic", "nx-generator", "template-dir", "package-script", "codemod", "unknown"]),
    generatorCount: z.number().int().nonnegative(),
    promptCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    helperCount: z.number().int().nonnegative(),
    partialCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  promptSignals: z.array(z.object({
    signal: z.enum(["input", "confirm", "list", "checkbox", "choices", "validate", "default", "bypass", "custom-prompt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["add", "add-many", "modify", "append", "custom-action", "dynamic-actions", "transform", "run-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["template-file", "template-dir", "handlebars", "ejs", "mustache", "partials", "helpers", "variables", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["skip-if-exists", "force", "abort-on-fail", "dry-run", "idempotent", "validation", "conflict-check", "snapshots", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["plop", "node-plop", "hygen", "yeoman-generator", "@angular-devkit/schematics", "jscodeshift", "ts-morph", "recast", "unknown"]),
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

export const SchedulerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schedulerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["node-cron", "cron", "bree", "agenda", "bullmq-repeatable", "github-actions", "vercel-cron", "custom", "unknown"]),
    scheduleCount: z.number().int().nonnegative(),
    cronExpressionCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    timezoneCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    overlapControlCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  scheduleSignals: z.array(z.object({
    signal: z.enum(["cron-expression", "seconds-field", "interval", "fixed-date", "timezone", "validated-expression", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["inline-task", "background-task", "async-task", "named-task", "task-context", "manual-execute", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["start", "stop", "destroy", "create-task", "scheduled-false", "run-on-init", "registry", "events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["no-overlap", "max-executions", "retry", "lock", "idempotency", "error-handler", "logging", "graceful-shutdown", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["node-cron", "cron", "bree", "agenda", "bullmq", "toad-scheduler", "github-actions-cron", "vercel-cron", "unknown"]),
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

export type OpenApiClientReadinessReport = z.infer<typeof OpenApiClientReadinessReportSchema>;
export type WebhookReadinessReport = z.infer<typeof WebhookReadinessReportSchema>;
export type NotificationReadinessReport = z.infer<typeof NotificationReadinessReportSchema>;
export type ConsentReadinessReport = z.infer<typeof ConsentReadinessReportSchema>;
export type PrivacyReadinessReport = z.infer<typeof PrivacyReadinessReportSchema>;
export type ServerFrameworkReadinessReport = z.infer<typeof ServerFrameworkReadinessReportSchema>;
export type RpcReadinessReport = z.infer<typeof RpcReadinessReportSchema>;
export type WorkspaceGraphReadinessReport = z.infer<typeof WorkspaceGraphReadinessReportSchema>;
export type ScaffoldingReadinessReport = z.infer<typeof ScaffoldingReadinessReportSchema>;
export type SchedulerReadinessReport = z.infer<typeof SchedulerReadinessReportSchema>;
