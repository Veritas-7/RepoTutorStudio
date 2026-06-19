import { z } from "zod";

export const E2eReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  testSuites: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["playwright", "cypress", "selenium", "webdriverio", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  browserProjects: z.array(z.object({
    browser: z.enum(["chromium", "firefox", "webkit", "mobile", "api", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  locatorSignals: z.array(z.object({
    filePath: z.string(),
    locatorType: z.enum(["role", "text", "label", "testid", "css", "xpath", "page-object", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  assertions: z.array(z.object({
    assertion: z.enum(["url", "visible", "text", "title", "network", "snapshot", "accessibility", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifacts: z.array(z.object({
    artifact: z.enum(["trace", "screenshot", "video", "html-report", "junit", "json", "none"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeTargets: z.array(z.object({
    target: z.enum(["web-server", "base-url", "env-vars", "parallel-workers", "retries", "ci-artifacts", "storage-state"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  playwrightSignals: z.array(z.object({
    signal: z.enum(["define-config", "test-fixtures", "test-describe", "test-step", "test-use", "projects", "devices", "web-server", "storage-state", "api-request", "role-locator", "testid-locator", "expect-poll", "expect-to-pass", "trace", "screenshot", "video", "reporter", "retries", "workers", "timeout", "fully-parallel", "shard", "ui-mode", "codegen", "debug-mode"]),
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

export const FlakyTestReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  flakyTestSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["playwright", "pytest", "jest", "vitest", "cypress", "mocha", "custom", "unknown"]),
    retryCount: z.number().int().nonnegative(),
    rerunCount: z.number().int().nonnegative(),
    quarantineCount: z.number().int().nonnegative(),
    failOnFlakyCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    isolationCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["playwright", "pytest-rerunfailures", "jest", "vitest", "cypress", "mocha", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  retrySignals: z.array(z.object({
    signal: z.enum(["retries", "reruns", "retry-times", "retry-immediately", "wait-before-retry", "reruns-delay", "repeat-each", "only-rerun", "rerun-except", "fail-on-flaky", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  quarantineSignals: z.array(z.object({
    signal: z.enum(["flaky-marker", "skip-fixme", "xfail", "quarantine-tag", "grep-invert", "test-list", "issue-link", "owner", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  isolationSignals: z.array(z.object({
    signal: z.enum(["workers-one", "run-in-band", "fully-parallel-control", "serial-mode", "test-timeout", "global-timeout", "detect-open-handles", "storage-state", "random-seed", "order-randomization", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifactSignals: z.array(z.object({
    signal: z.enum(["trace-on-first-retry", "screenshot-on-failure", "video-on-retry", "html-report", "junit-report", "blob-report", "retry-trace-upload", "test-results", "step-summary", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "scheduled", "shard", "matrix", "upload-artifact", "flaky-dashboard", "rerun-job", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@playwright/test", "pytest-rerunfailures", "jest", "vitest", "cypress", "mocha", "flaky", "unknown"]),
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

export const TestImpactReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  impactSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["nx", "jest", "pytest-testmon", "turbo", "bazel", "gradle", "custom", "unknown"]),
    affectedCommandCount: z.number().int().nonnegative(),
    changedFileInputCount: z.number().int().nonnegative(),
    baseHeadCount: z.number().int().nonnegative(),
    graphCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    watchCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    fallbackCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["nx", "jest", "pytest-testmon", "turbo", "bazel", "gradle", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  changeDetectionSignals: z.array(z.object({
    signal: z.enum(["base-head", "changed-since", "changed-files", "git-diff", "uncommitted", "untracked", "last-commit", "files-input", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["affected-projects", "find-related-tests", "only-changed", "testmon-select", "testmon-forceselect", "related-tests-list", "dependency-graph", "project-graph", "test-splitting", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["nx-cache", "remote-cache", "task-cache", "testmon-data", "coverage-deps", "jest-haste-map", "watchman", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "base-head-env", "matrix", "shard", "affected-only", "upload-artifact", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nx", "jest", "pytest-testmon", "turbo", "bazel", "gradle", "unknown"]),
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

export const TestReportingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  reportSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["junit", "ctrf", "allure", "trx", "xunit", "mocha-json", "github-action", "custom", "unknown"]),
    junitCount: z.number().int().nonnegative(),
    ctrfCount: z.number().int().nonnegative(),
    allureCount: z.number().int().nonnegative(),
    reporterCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    summaryCount: z.number().int().nonnegative(),
    annotationCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    historyCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    failPolicyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["junit-xml", "ctrf-json", "allure-results", "allure-report", "trx", "xunit", "mocha-json", "json", "html", "markdown", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  adapterSignals: z.array(z.object({
    signal: z.enum(["jest-junit", "vitest-junit", "pytest-junitxml", "playwright-reporters", "allure-js", "allure-pytest", "ctrf-reporter", "dorny-test-reporter", "github-test-reporter", "publish-unit-test-result", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "workflow-run", "checks-write", "job-summary", "annotations", "upload-artifact", "download-artifact", "pull-request", "always-run", "matrix", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["report-path", "glob-path", "results-dir", "output-file", "summary-file", "html-report", "history-trend", "attachments", "environment-metadata", "executor-metadata", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["fail-on-error", "fail-on-empty", "max-annotations", "threshold-summary", "rerun-history", "flaky-analysis", "categories", "owner-labels", "duration", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["jest-junit", "allure", "allure-js", "allure-pytest", "ctrf", "test-reporter", "publish-unit-test-result", "junit", "unknown"]),
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

export const SnapshotReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  snapshotSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["jest", "vitest", "playwright", "storybook", "custom", "unknown"]),
    textSnapshotCount: z.number().int().nonnegative(),
    inlineSnapshotCount: z.number().int().nonnegative(),
    fileSnapshotCount: z.number().int().nonnegative(),
    visualSnapshotCount: z.number().int().nonnegative(),
    ariaSnapshotCount: z.number().int().nonnegative(),
    updatePolicyCount: z.number().int().nonnegative(),
    serializerCount: z.number().int().nonnegative(),
    pathTemplateCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    maskingCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    baselineCount: z.number().int().nonnegative(),
    reviewCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  assertionSignals: z.array(z.object({
    signal: z.enum(["to-match-snapshot", "inline-snapshot", "file-snapshot", "throw-error-inline", "to-have-screenshot", "to-match-aria-snapshot", "property-matchers", "custom-matchers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["__snapshots__", "snap-files", "file-snapshot", "snapshot-path-template", "screenshot-baseline", "aria-yaml", "version-controlled-baseline", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["update-snapshot", "update-snapshots", "watch-update", "ci-new-snapshot-fail", "missing-only", "changed-only", "all-update", "none-update", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serializerSignals: z.array(z.object({
    signal: z.enum(["snapshot-serializers", "add-snapshot-serializer", "snapshot-format", "pretty-format", "custom-serializer", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  visualSignals: z.array(z.object({
    signal: z.enum(["to-have-screenshot", "max-diff-pixels", "max-diff-pixel-ratio", "threshold", "mask", "mask-color", "style-path", "animations", "caret", "scale", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "update-forbidden", "snapshot-artifact", "os-matrix", "browser-matrix", "snapshot-report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["jest", "vitest", "playwright", "jest-snapshot", "pretty-format", "testing-library", "unknown"]),
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

export const PropertyBasedTestingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  propertySetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["fast-check", "hypothesis", "jqwik", "quickcheck", "proptest", "custom", "unknown"]),
    propertyCount: z.number().int().nonnegative(),
    generatorCount: z.number().int().nonnegative(),
    assertionCount: z.number().int().nonnegative(),
    shrinkCount: z.number().int().nonnegative(),
    seedCount: z.number().int().nonnegative(),
    runCount: z.number().int().nonnegative(),
    statefulCount: z.number().int().nonnegative(),
    exampleCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  generatorSignals: z.array(z.object({
    signal: z.enum(["fast-check-arbitraries", "hypothesis-strategies", "jqwik-arbitraries", "custom-generators", "composite-generators", "filtered-generators", "recursive-generators", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runnerSignals: z.array(z.object({
    signal: z.enum(["fc-assert", "fc-check", "hypothesis-given", "jqwik-property", "pytest", "vitest", "jest", "junit-platform", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reproductionSignals: z.array(z.object({
    signal: z.enum(["seed", "path", "replay-path", "counterexample", "example-database", "falsifying-example", "shrinking", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  statefulSignals: z.array(z.object({
    signal: z.enum(["model-run", "commands", "rule-based-state-machine", "state-machine", "action-chain", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "property-script", "num-runs", "max-examples", "tries", "seed-policy", "artifact", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["fast-check", "@fast-check/jest", "hypothesis", "pytest", "jqwik", "quickcheck", "proptest", "unknown"]),
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

export const FuzzReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  fuzzSetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["oss-fuzz", "libfuzzer", "aflplusplus", "jazzer", "go-fuzz", "cargo-fuzz", "clusterfuzzlite", "package-script", "workflow", "unknown"]),
    targetCount: z.number().int().nonnegative(),
    harnessCount: z.number().int().nonnegative(),
    engineCount: z.number().int().nonnegative(),
    sanitizerCount: z.number().int().nonnegative(),
    corpusCount: z.number().int().nonnegative(),
    dictionaryCount: z.number().int().nonnegative(),
    coverageCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  harnessSignals: z.array(z.object({
    signal: z.enum(["llvm-fuzzer-test-one-input", "fuzztest-annotation", "jazzer-fuzztest", "go-fuzz", "cargo-fuzz-target", "afl-target", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  engineSignals: z.array(z.object({
    signal: z.enum(["oss-fuzz", "libfuzzer", "aflplusplus", "jazzer", "clusterfuzzlite", "honggfuzz", "centipede", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["oss-fuzz-dockerfile", "build-sh", "project-yaml", "compiler-wrapper", "fsanitize-fuzzer", "bazel-rules-fuzzing", "maven-plugin", "gradle-dependency", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["seed-corpus", "generated-corpus", "dictionary", "timeout", "max-len", "runs", "fork-jobs", "persistent-mode", "reproducer", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sanitizerSignals: z.array(z.object({
    signal: z.enum(["address", "undefined", "memory", "coverage", "asan", "ubsan", "msan", "jazzer-sanitizers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "cifuzz", "oss-fuzz", "clusterfuzzlite", "artifact-upload", "coverage-report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["libfuzzer", "aflplusplus", "jazzer-junit", "jazzer-maven-plugin", "rules-fuzzing", "cargo-fuzz", "go-test-fuzz", "unknown"]),
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

export const TestDataReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dataSetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["factory-bot", "factory-boy", "faker-js", "faker-python", "fixtures", "seeds", "custom", "unknown"]),
    factoryCount: z.number().int().nonnegative(),
    traitCount: z.number().int().nonnegative(),
    associationCount: z.number().int().nonnegative(),
    sequenceCount: z.number().int().nonnegative(),
    fakerCount: z.number().int().nonnegative(),
    overrideCount: z.number().int().nonnegative(),
    persistenceCount: z.number().int().nonnegative(),
    seedCount: z.number().int().nonnegative(),
    lintCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  factorySignals: z.array(z.object({
    signal: z.enum(["factory-bot-define", "factory-boy-class", "factory-girl", "fixture-files", "seed-scripts", "custom-builders", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  relationshipSignals: z.array(z.object({
    signal: z.enum(["traits", "associations", "subfactory", "transient", "post-generation", "callbacks", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  generationSignals: z.array(z.object({
    signal: z.enum(["sequence", "lazy-attribute", "faker-js", "faker-python", "fuzzy", "locale", "unique", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reproducibilitySignals: z.array(z.object({
    signal: z.enum(["faker-seed", "sequence-reset", "factory-lint", "fixed-ref-date", "deterministic-fixtures", "database-cleaner", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["build", "create", "attributes-for", "build-stubbed", "build-batch", "create-batch", "fixture-load", "db-seed", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "factory-lint", "seed-script", "test-data-artifact", "database-reset", "parallel-workers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["factory_bot", "factory_bot_rails", "factory_boy", "faker", "@faker-js/faker", "database_cleaner", "unknown"]),
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

export const IntegrationTestEnvironmentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  integrationSetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["testcontainers-node", "testcontainers-python", "java", "go", "compose", "custom", "unknown"]),
    containerCount: z.number().int().nonnegative(),
    moduleCount: z.number().int().nonnegative(),
    hasWaitStrategy: z.boolean(),
    hasLifecycleCleanup: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  containerSignals: z.array(z.object({
    signal: z.enum(["generic-container", "docker-container", "specialized-module", "docker-compose", "exposed-ports", "env-vars", "bind-mounts", "network", "image-build", "toxiproxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  waitSignals: z.array(z.object({
    signal: z.enum(["listening-ports", "log-message", "health-check", "http", "successful-command", "one-shot", "startup-timeout", "wait-for-logs", "wait-for-http", "wait-container-ready", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["start", "stop", "context-manager", "before-all", "after-all", "global-setup", "ryuk", "resource-reaper", "reuse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["docker-host", "podman", "compose-binary", "ci-service", "socket", "env-config", "timeout", "cleanup-disable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["testcontainers", "@testcontainers/*", "testcontainers-python", "pytest", "vitest", "jest", "unknown"]),
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

export const ChaosEngineeringReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  chaosSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["chaos-mesh", "litmus", "toxiproxy", "gremlin", "custom", "unknown"]),
    experimentCount: z.number().int().nonnegative(),
    faultCount: z.number().int().nonnegative(),
    scopeCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    hasSelector: z.boolean(),
    hasDuration: z.boolean(),
    hasProbeOrSteadyState: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  experimentSignals: z.array(z.object({
    signal: z.enum(["pod-chaos", "network-chaos", "stress-chaos", "io-chaos", "dns-chaos", "time-chaos", "http-chaos", "schedule", "workflow", "chaos-engine", "chaos-experiment", "chaos-result", "toxiproxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  faultSignals: z.array(z.object({
    signal: z.enum(["pod-kill", "pod-delete", "network-delay", "network-loss", "network-partition", "network-bandwidth", "cpu-stress", "memory-stress", "io-delay", "time-shift", "dns-error", "http-abort", "http-delay", "latency-toxic", "timeout-toxic", "bandwidth-toxic", "slow-close-toxic", "limit-data-toxic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["selector", "namespace", "label-selector", "mode", "duration", "container-names", "target", "blast-radius", "service-account", "annotation-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["probe", "steady-state", "sot", "eot", "prometheus-probe", "http-probe", "k8s-probe", "cmd-probe", "rollback", "abort", "pause", "cleanup", "job-cleanup-policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["prometheus", "grafana", "otel", "alert-rule", "metrics", "dashboard", "chaos-result", "report", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["chaos-mesh", "litmuschaos", "toxiproxy", "gremlin", "helm", "kubectl", "unknown"]),
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

export type E2eReport = z.infer<typeof E2eReportSchema>;
export type FlakyTestReadinessReport = z.infer<typeof FlakyTestReadinessReportSchema>;
export type TestImpactReadinessReport = z.infer<typeof TestImpactReadinessReportSchema>;
export type TestReportingReadinessReport = z.infer<typeof TestReportingReadinessReportSchema>;
export type SnapshotReadinessReport = z.infer<typeof SnapshotReadinessReportSchema>;
export type PropertyBasedTestingReadinessReport = z.infer<typeof PropertyBasedTestingReadinessReportSchema>;
export type FuzzReadinessReport = z.infer<typeof FuzzReadinessReportSchema>;
export type TestDataReadinessReport = z.infer<typeof TestDataReadinessReportSchema>;
export type IntegrationTestEnvironmentReadinessReport = z.infer<typeof IntegrationTestEnvironmentReadinessReportSchema>;
export type ChaosEngineeringReadinessReport = z.infer<typeof ChaosEngineeringReadinessReportSchema>;
