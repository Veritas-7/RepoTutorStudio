import { z } from "zod";

export const EnvValidationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  envSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["t3-env", "envalid", "dotenvx", "dotenv", "env-var", "zod", "valibot", "arktype", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    serverCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    runtimeEnvCount: z.number().int().nonnegative(),
    prefixCount: z.number().int().nonnegative(),
    validationHookCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["create-env", "server-schema", "client-schema", "shared-schema", "standard-schema", "zod", "valibot", "arktype", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["process-env", "import-meta-env", "runtime-env", "runtime-env-strict", "experimental-runtime-env", "dotenv-file", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundarySignals: z.array(z.object({
    signal: z.enum(["client-prefix", "next-public", "nuxt-public", "vite-public", "server-only", "invalid-access-guard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["core-package", "nextjs-preset", "nuxt-preset", "astro-vite", "extends-env", "is-server-override", "standard-schema-adapter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["parse", "safe-parse", "on-validation-error", "skip-validation", "empty-string-as-undefined", "transform-default", "synchronous-validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  documentationSignals: z.array(z.object({
    signal: z.enum(["env-example", "required-vars-doc", "deployment-vars", "build-time-validation", "secret-warning", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@t3-oss/env-core", "@t3-oss/env-nextjs", "@t3-oss/env-nuxt", "envalid", "env-var", "dotenv", "dotenvx", "zod", "valibot", "arktype", "unknown"]),
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

export const SecurityHeadersReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  headerSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["helmet", "express", "next-headers", "nginx", "cloudflare", "custom", "unknown"]),
    cspCount: z.number().int().nonnegative(),
    hstsCount: z.number().int().nonnegative(),
    crossOriginCount: z.number().int().nonnegative(),
    frameCount: z.number().int().nonnegative(),
    referrerCount: z.number().int().nonnegative(),
    hardeningCount: z.number().int().nonnegative(),
    disableCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  cspSignals: z.array(z.object({
    signal: z.enum(["content-security-policy", "default-src", "script-src", "style-src", "frame-ancestors", "object-src", "nonce", "report-only", "upgrade-insecure-requests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["strict-transport-security", "max-age", "include-subdomains", "preload", "https-redirect", "development-exception", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  crossOriginSignals: z.array(z.object({
    signal: z.enum(["cross-origin-embedder-policy", "cross-origin-opener-policy", "cross-origin-resource-policy", "origin-agent-cluster", "cors-boundary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  legacyHeaderSignals: z.array(z.object({
    signal: z.enum(["x-frame-options", "x-content-type-options", "referrer-policy", "x-dns-prefetch-control", "x-download-options", "x-permitted-cross-domain-policies", "x-powered-by", "x-xss-protection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  middlewareSignals: z.array(z.object({
    signal: z.enum(["helmet", "app-use", "disable-header", "standalone-middleware", "next-headers", "reverse-proxy-headers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["helmet", "express", "fastify-helmet", "koa-helmet", "next", "csp-evaluator", "unknown"]),
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

export const GraphqlReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  graphqlSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["graphql-js", "apollo", "graphql-yoga", "urql", "relay", "graphql-codegen", "graphql-request", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    operationCount: z.number().int().nonnegative(),
    resolverCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    executionCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    codegenCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["graphql-schema", "build-schema", "sdl", "object-type", "input-type", "scalar-type", "enum-type", "directive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  operationSignals: z.array(z.object({
    signal: z.enum(["query", "mutation", "subscription", "operation-name", "variables", "fragments", "typed-document-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resolverSignals: z.array(z.object({
    signal: z.enum(["resolve", "field-resolver", "type-resolver", "root-value", "context-value", "dataloader", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["parse", "validate", "specified-rules", "custom-rules", "max-errors", "introspection-limit", "schema-validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  documentSignals: z.array(z.object({
    signal: z.enum(["source-object", "lexer-token-kind", "ast-kind", "visit", "type-info", "visit-with-type-info", "separate-operations", "concat-ast", "strip-ignored-characters", "extend-schema", "lexicographic-sort-schema", "type-from-ast", "value-from-ast", "coerce-input-value", "schema-coordinate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["graphql", "graphql-sync", "execute", "subscribe", "defer-stream", "operation-ast", "variable-values", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["graphql-client", "urql", "apollo-client", "relay", "graphql-request", "cache", "fetch-exchange", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  codegenSignals: z.array(z.object({
    signal: z.enum(["graphql-codegen", "typed-query-document-node", "generated-types", "schema-introspection", "print-schema", "unknown"]),
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

export const CliReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  cliSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["commander", "yargs", "oclif", "cac", "meow", "clipanion", "custom", "unknown"]),
    commandCount: z.number().int().nonnegative(),
    optionCount: z.number().int().nonnegative(),
    argumentCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    parseCount: z.number().int().nonnegative(),
    helpCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["command", "subcommand", "argument", "description", "alias", "version", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  optionSignals: z.array(z.object({
    signal: z.enum(["option", "required-option", "variadic-option", "default-value", "choices", "env", "conflicts", "implies", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parseSignals: z.array(z.object({
    signal: z.enum(["parse", "parse-async", "program-name", "executable", "exit-override", "allow-unknown-option", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["action", "hook", "pre-action", "post-action", "async-action", "pass-through-options", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  helpSignals: z.array(z.object({
    signal: z.enum(["help", "usage", "help-option", "add-help-text", "show-help-after-error", "completion", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["command-error", "missing-argument", "unknown-option", "invalid-option", "exit-code", "stderr", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["commander", "yargs", "@oclif/core", "cac", "meow", "clipanion", "unknown"]),
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

export const TerminalUiReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  terminalSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["ink", "bubbletea", "blessed", "curses", "ratatui", "custom", "unknown"]),
    componentCount: z.number().int().nonnegative(),
    screenCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    layoutCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    mouseCount: z.number().int().nonnegative(),
    rawModeCount: z.number().int().nonnegative(),
    altScreenCount: z.number().int().nonnegative(),
    resizeCount: z.number().int().nonnegative(),
    styleCount: z.number().int().nonnegative(),
    widgetCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["ink", "bubbletea", "blessed", "curses", "ratatui", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  screenSignals: z.array(z.object({
    signal: z.enum(["screen", "program", "alt-screen", "raw-mode", "tty", "terminal-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["box", "text", "list", "form", "style", "border", "table", "viewport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["keyboard", "use-input", "key-msg", "keypress", "stdin", "paste", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["focus", "focus-manager", "cursor", "selection", "blur", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mouseSignals: z.array(z.object({
    signal: z.enum(["mouse", "click", "hover", "drag", "wheel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["render", "view", "static-output", "transform", "ansi", "snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["init", "update", "exit", "resize", "tick", "batch-sequence", "suspend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["ink-testing-library", "go-test", "snapshot", "artifact-upload", "pty-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["ink", "blessed", "bubbletea", "bubbles", "lipgloss", "ratatui", "ncurses", "unknown"]),
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

export const StateMachineReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  stateMachineSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["xstate", "robot", "zag", "javascript-state-machine", "custom", "unknown"]),
    machineCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    transitionCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    guardCount: z.number().int().nonnegative(),
    actorCount: z.number().int().nonnegative(),
    invokeCount: z.number().int().nonnegative(),
    contextCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["xstate", "robot", "zag", "javascript-state-machine", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["initial", "states", "final", "nested", "parallel", "history", "computed", "watch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transitionSignals: z.array(z.object({
    signal: z.enum(["on", "target", "always", "immediate", "transition", "after", "delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["assign", "actions", "reduce", "entry", "exit", "effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["guard", "guards", "can-guard", "cond", "choose", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actorSignals: z.array(z.object({
    signal: z.enum(["create-actor", "interpret", "invoke", "from-promise", "service", "actor-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["context", "snapshot", "matches", "computed", "watch", "input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["send", "subscribe", "event-type", "on-done", "on-error", "event-payload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "model-test", "transition-test", "artifact-upload", "storybook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["xstate", "robot3", "@zag-js/core", "@zag-js/react", "@zag-js/toggle", "javascript-state-machine", "unknown"]),
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

export const AnimationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  animationSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["motion", "framer-motion", "react-spring", "gsap", "css", "waapi", "custom", "unknown"]),
    componentCount: z.number().int().nonnegative(),
    timelineCount: z.number().int().nonnegative(),
    keyframeCount: z.number().int().nonnegative(),
    springCount: z.number().int().nonnegative(),
    gestureCount: z.number().int().nonnegative(),
    layoutCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  librarySignals: z.array(z.object({
    signal: z.enum(["motion", "framer-motion", "react-spring", "gsap", "css", "waapi", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  declarationSignals: z.array(z.object({
    signal: z.enum(["motion-component", "animated-component", "animate-prop", "variants", "keyframes", "css-keyframes", "transition", "timeline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timingSignals: z.array(z.object({
    signal: z.enum(["duration", "delay", "ease", "spring-config", "stagger", "repeat", "yoyo", "timeline-defaults", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["while-hover", "while-tap", "drag", "scroll-trigger", "in-view", "gesture", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["layout", "layout-id", "animate-presence", "exit", "flip", "shared-layout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["reduced-motion", "prefers-reduced-motion", "disable-motion", "will-change", "compositor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["controls", "motion-value", "animation-frame", "get-animations", "ticker", "kill", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "fake-timers", "frame-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["motion", "framer-motion", "@react-spring/web", "gsap", "animejs", "unknown"]),
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

export const DragAndDropReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dragAndDropSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["dnd-kit", "react-dnd", "sortablejs", "native-html5", "custom", "unknown"]),
    providerCount: z.number().int().nonnegative(),
    draggableCount: z.number().int().nonnegative(),
    droppableCount: z.number().int().nonnegative(),
    sortableCount: z.number().int().nonnegative(),
    sensorCount: z.number().int().nonnegative(),
    feedbackCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  librarySignals: z.array(z.object({
    signal: z.enum(["dnd-kit", "react-dnd", "sortablejs", "native-html5", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["dnd-context", "dnd-provider", "backend", "sortable-create", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sensorSignals: z.array(z.object({
    signal: z.enum(["pointer-sensor", "keyboard-sensor", "touch-backend", "html5-backend", "test-backend", "activation-constraint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  draggableSignals: z.array(z.object({
    signal: z.enum(["use-draggable", "use-drag", "drag-ref", "dragstart", "draggable-attribute", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  droppableSignals: z.array(z.object({
    signal: z.enum(["use-droppable", "use-drop", "drop-ref", "drop-handler", "can-drop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sortableSignals: z.array(z.object({
    signal: z.enum(["sortable-context", "use-sortable", "array-move", "sortable-create", "on-end", "on-update", "group", "swap-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  feedbackSignals: z.array(z.object({
    signal: z.enum(["drag-overlay", "ghost-class", "chosen-class", "drag-class", "monitor", "collect", "preview", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["keyboard", "screen-reader-instructions", "aria-live", "aria-grabbed", "role", "handle", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "pointer-event", "drag-event", "test-backend", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "react-dnd", "react-dnd-html5-backend", "react-dnd-touch-backend", "react-dnd-test-backend", "sortablejs", "unknown"]),
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

export const RichTextEditorReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  richTextEditorSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["tiptap", "prosemirror", "lexical", "contenteditable", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    extensionCount: z.number().int().nonnegative(),
    collaborationCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["tiptap", "prosemirror", "lexical", "contenteditable", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["starter-kit", "schema", "node", "mark", "nodes", "decorator-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["editor-content", "editor-view", "contenteditable", "rich-text-plugin", "bubble-menu", "floating-menu", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["chain", "commands", "dispatch-command", "format-text", "keymap", "input-rule", "exec-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["editor-state", "transaction", "update", "selection", "json-html", "on-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  extensionSignals: z.array(z.object({
    signal: z.enum(["extension-create", "node-create", "mark-create", "plugin", "history", "placeholder", "link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collaborationSignals: z.array(z.object({
    signal: z.enum(["collaboration", "awareness", "yjs", "provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-textbox", "aria-label", "keyboard", "placeholder", "focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "input-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lexicalSignals: z.array(z.object({
    signal: z.enum(["composer", "composer-context", "initial-config", "namespace", "theme", "nodes-registration", "on-error", "rich-text-plugin", "plain-text-plugin", "content-editable", "error-boundary", "history-plugin", "on-change-plugin", "autofocus-plugin", "nested-composer", "editor-update", "editor-read", "editor-state", "parse-editor-state", "serialized-editor-state", "editable-state", "dispatch-command", "register-command", "create-command", "command-priority", "format-text-command", "format-element-command", "key-command", "selection-change-command", "update-listener", "text-content-listener", "mutation-listener", "root-listener", "decorator-listener", "root-node", "selection-api", "range-selection", "node-selection", "grid-selection", "text-node", "element-node", "decorator-node", "paragraph-node", "line-break-node", "html-import-export", "markdown-shortcut", "list-plugin", "link-plugin", "check-list-plugin", "table-plugin", "code-highlight-plugin", "hashtag-plugin", "auto-link-plugin", "collaboration-plugin", "yjs-collab", "update-tags", "merge-register", "create-editor", "tree-view", "draggable-block", "floating-toolbar", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@tiptap/react", "@tiptap/starter-kit", "@tiptap/core", "prosemirror-state", "prosemirror-view", "prosemirror-model", "lexical", "@lexical/react", "yjs", "unknown"]),
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

export const CommandPaletteReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  commandPaletteSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["cmdk", "algolia-autocomplete", "downshift", "custom", "unknown"]),
    inputCount: z.number().int().nonnegative(),
    resultCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["cmdk", "algolia-autocomplete", "downshift", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["command-input", "get-input-props", "placeholder", "open-on-focus", "search-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultSignals: z.array(z.object({
    signal: z.enum(["command-list", "command-item", "command-group", "get-sources", "get-items", "get-menu-props", "get-item-props", "empty-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["on-select", "selected-item", "highlighted-index", "set-query", "value", "item-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filterSignals: z.array(z.object({
    signal: z.enum(["filter", "keywords", "should-filter", "query", "state-reducer", "source-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["search", "input-value", "is-open", "on-state-change", "refresh-update", "open-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["recent-searches", "query-suggestions", "plugins", "insights", "templates", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["combobox", "listbox", "option", "aria-activedescendant", "aria-expanded", "aria-controls", "aria-autocomplete", "aria-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-down", "arrow-up", "enter", "escape", "meta-k", "ime-guard", "keyboard-handler", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["cmdk", "@algolia/autocomplete-js", "@algolia/autocomplete-core", "@algolia/autocomplete-plugin-recent-searches", "@algolia/autocomplete-plugin-query-suggestions", "downshift", "unknown"]),
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

export const GuidedTourReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  guidedTourSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["react-joyride", "shepherd", "driver-js", "zag-tour", "custom", "unknown"]),
    stepCount: z.number().int().nonnegative(),
    targetCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    overlayCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["react-joyride", "shepherd", "driver-js", "zag-tour", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stepSignals: z.array(z.object({
    signal: z.enum(["steps-array", "step-object", "title", "content-text", "placement", "popover", "step-type-tooltip", "step-type-dialog", "step-type-wait", "step-type-floating", "step-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["target", "attach-to", "element", "selector", "highlight", "spotlight", "resolved-target", "target-rect", "boundary-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["start", "next", "back-prev", "skip-cancel-close", "complete", "progress", "continuous", "goto", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  overlaySignals: z.array(z.object({
    signal: z.enum(["modal-overlay", "spotlight", "stage-padding", "stage-radius", "popover-class", "styles", "scroll", "backdrop", "clip-path", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["callback", "on-event", "on-next-click", "on-prev-click", "on-close-click", "before-show", "after-hook", "analytics-event", "status-change", "step-change", "steps-change", "interact-outside", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["dialog-role", "aria-label", "aria-labelledby", "aria-describedby", "aria-controls", "focus-trap", "keyboard-escape", "tab-order", "aria-modal", "aria-live", "tabindex", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["run", "step-index", "status", "lifecycle", "controlled-mode", "set-steps", "local-storage-progress", "open-tag", "closed-tag", "internal-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["tour-inactive", "running", "resolving", "scrolling", "waiting", "active", "step-route", "step-changed", "target-resolved", "target-not-found", "scroll-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  targetResolutionSignals: z.array(z.object({
    signal: z.enum(["target-function", "resolved-target", "mutation-observer", "wait-for-target", "wait-for-target-timeout", "target-cleanup", "data-tour-highlighted", "prevent-interaction-inert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["get-placement", "current-placement", "placement-side", "popper-styles", "positioner", "arrow", "arrow-tip", "anchor-rect", "spotlight-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  spotlightSignals: z.array(z.object({
    signal: z.enum(["backdrop", "spotlight", "clip-path", "target-rect", "boundary-size", "spotlight-radius", "visual-viewport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-boundary-size", "track-placement", "track-dismissable-branch", "track-interact-outside", "track-escape-keydown", "trap-focus", "wait-for-scroll-end", "cleanup-all", "cleanup-step-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["add-step", "remove-step", "update-step", "set-step", "start", "next", "prev", "dismiss", "skip", "goto", "progress-percent", "progress-text", "action-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["positioner-id", "content-id", "title-id", "description-id", "arrow-id", "backdrop-id", "content-el", "positioner-el", "backdrop-el", "sync-z-index", "raf", "computed-style", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "total-steps", "step-index", "step-api", "next-step-state", "prev-step-state", "first-step-state", "last-step-state", "add-step-api", "remove-step-api", "update-step-api", "set-steps-api", "set-step-api", "start-api", "valid-step-api", "current-step-api", "next-api", "prev-api", "progress-percent-api", "progress-text-api", "backdrop-props", "spotlight-props", "progress-text-props", "positioner-props", "arrow-props", "arrow-tip-props", "content-props", "title-props", "description-props", "close-trigger-props", "action-trigger-props", "keyboard-navigation", "data-state", "data-type", "data-placement", "data-side", "aria-modal", "aria-live", "aria-atomic", "aria-labelledby", "aria-describedby", "data-step", "action-map", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "user-event", "keyboard-test", "a11y-test", "fake-timers", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-joyride", "shepherd.js", "react-shepherd", "driver.js", "@zag-js/tour", "@zag-js/focus-trap", "@zag-js/popper", "@zag-js/dismissable", "@zag-js/interact-outside", "@zag-js/dom-query", "@zag-js/anatomy", "@zag-js/core", "@zag-js/utils", "react", "unknown"]),
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

export type EnvValidationReadinessReport = z.infer<typeof EnvValidationReadinessReportSchema>;
export type SecurityHeadersReadinessReport = z.infer<typeof SecurityHeadersReadinessReportSchema>;
export type GraphqlReadinessReport = z.infer<typeof GraphqlReadinessReportSchema>;
export type CliReadinessReport = z.infer<typeof CliReadinessReportSchema>;
export type TerminalUiReadinessReport = z.infer<typeof TerminalUiReadinessReportSchema>;
export type StateMachineReadinessReport = z.infer<typeof StateMachineReadinessReportSchema>;
export type AnimationReadinessReport = z.infer<typeof AnimationReadinessReportSchema>;
export type DragAndDropReadinessReport = z.infer<typeof DragAndDropReadinessReportSchema>;
export type RichTextEditorReadinessReport = z.infer<typeof RichTextEditorReadinessReportSchema>;
export type CommandPaletteReadinessReport = z.infer<typeof CommandPaletteReadinessReportSchema>;
export type GuidedTourReadinessReport = z.infer<typeof GuidedTourReadinessReportSchema>;
