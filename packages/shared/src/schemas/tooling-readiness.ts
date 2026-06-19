import { z } from "zod";

export const CiCdReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  workflowFiles: z.array(z.object({
    filePath: z.string(),
    workflowName: z.string().nullable(),
    triggerCount: z.number().int().nonnegative(),
    jobCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  triggerSignals: z.array(z.object({
    trigger: z.enum(["push", "pull_request", "workflow_dispatch", "schedule", "repository_dispatch", "workflow_call", "release", "deployment", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  jobSignals: z.array(z.object({
    signal: z.enum(["jobs", "runs-on", "steps", "uses", "run", "needs", "matrix", "services", "container", "defaults", "timeout-minutes", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["permissions", "contents-read", "id-token-write", "secrets", "environment", "pinned-actions", "pull-request-target", "oidc", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["cache", "artifact-upload", "artifact-download", "concurrency", "environment-protection", "deployment", "release", "package-publish", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["github-hosted-runner", "self-hosted-runner", "linux", "macos", "windows", "node-setup", "python-setup", "docker-build", "unknown"]),
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

export const UnitTestReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  testFiles: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["vitest", "jest", "mocha", "ava", "node-test", "unknown"]),
    testCount: z.number().int().nonnegative(),
    assertionCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["vitest-config", "vite-config-test", "package-script", "workspace", "setup-file", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  assertionSignals: z.array(z.object({
    assertion: z.enum(["expect", "assert", "toEqual", "toBe", "toMatchSnapshot", "throws", "resolves", "rejects", "custom-matcher", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mockSignals: z.array(z.object({
    signal: z.enum(["vi-fn", "vi-mock", "vi-spyOn", "fake-timers", "mock-reset", "fixture-data", "module-mock", "request-mock", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coverageSignals: z.array(z.object({
    signal: z.enum(["coverage-enabled", "coverage-provider-v8", "coverage-provider-istanbul", "coverage-include", "coverage-exclude", "coverage-thresholds", "coverage-reporters", "coverage-script", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["node", "jsdom", "happy-dom", "browser-mode", "globals", "setup-files", "pool", "isolate", "projects", "workspace", "typecheck", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportingSignals: z.array(z.object({
    signal: z.enum(["watch", "run", "ui", "reporter", "junit", "json", "html", "snapshot-update", "filtering", "sharding", "benchmark", "unknown"]),
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

export const CoverageReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  coverageSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["nyc", "c8", "vitest", "jest", "coverage.py", "pytest-cov", "go-cover", "codecov", "coveralls", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    scriptCount: z.number().int().nonnegative(),
    reporterCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    includeCount: z.number().int().nonnegative(),
    excludeCount: z.number().int().nonnegative(),
    uploadCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    mergeCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    signal: z.enum(["nyc", "c8", "v8-provider", "istanbul-provider", "babel-istanbul", "coverage-py", "pytest-cov", "go-cover", "lcov-genhtml", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["all-files", "include", "exclude", "exclude-after-remap", "source-map", "per-file", "workspace-src", "ignore-hints", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  thresholdSignals: z.array(z.object({
    signal: z.enum(["check-coverage", "lines", "functions", "branches", "statements", "watermarks", "global-threshold", "per-file-threshold", "patch-threshold", "project-threshold", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["text", "text-summary", "html", "lcov", "json", "json-summary", "cobertura", "clover", "junit", "coverage-final", "coverage-out", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciUploadSignals: z.array(z.object({
    signal: z.enum(["codecov-action", "codecov-token", "codecov-oidc", "codecov-flags", "codecov-files", "fail-ci-if-error", "coveralls", "github-step-summary", "upload-artifact", "badge", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nyc", "c8", "@vitest/coverage-v8", "@vitest/coverage-istanbul", "jest", "babel-plugin-istanbul", "coverage", "pytest-cov", "codecov-action", "coveralls", "unknown"]),
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

export const MutationTestingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mutationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["stryker", "infection", "mutmut", "pitest", "mutation-testing-elements", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    mutatePatternCount: z.number().int().nonnegative(),
    mutatorCount: z.number().int().nonnegative(),
    runnerCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    reporterCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    incrementalCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["stryker", "infection", "mutmut", "pitest", "mutation-testing-elements", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["config-file", "package-script", "schema", "mutate-pattern", "test-runner", "coverage-analysis", "disable-type-checks", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["thresholds", "mutation-score", "covered-score", "survived", "killed", "timeout", "ignored", "no-coverage", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reporterSignals: z.array(z.object({
    signal: z.enum(["html", "json", "clear-text", "progress", "dashboard", "badge", "junit", "mutation-testing-report-schema", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["src", "lib", "test-files", "ignore-patterns", "with-uncovered", "incremental", "dry-run", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@stryker-mutator/core", "@stryker-mutator/vitest-runner", "@stryker-mutator/jest-runner", "mutation-testing-report-schema", "infection/infection", "mutmut", "pitest", "custom", "unknown"]),
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

export const TypecheckReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tsconfigFiles: z.array(z.object({
    filePath: z.string(),
    compilerOptionsCount: z.number().int().nonnegative(),
    referencesCount: z.number().int().nonnegative(),
    includeCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  compilerOptionSignals: z.array(z.object({
    signal: z.enum(["strict", "noImplicitAny", "strictNullChecks", "noUncheckedIndexedAccess", "exactOptionalPropertyTypes", "noEmit", "noEmitOnError", "skipLibCheck", "isolatedModules", "moduleDetection", "jsx", "target", "module", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  projectSignals: z.array(z.object({
    signal: z.enum(["references", "composite", "incremental", "tsBuildInfoFile", "include", "exclude", "files", "rootDir", "outDir", "extends", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  moduleResolutionSignals: z.array(z.object({
    signal: z.enum(["moduleResolution", "baseUrl", "paths", "typeRoots", "types", "lib", "allowImportingTsExtensions", "rewriteRelativeImportExtensions", "esModuleInterop", "resolveJsonModule", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  declarationSignals: z.array(z.object({
    signal: z.enum(["declaration", "declarationMap", "emitDeclarationOnly", "declarationDir", "sourceMap", "noEmit", "composite-declaration", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["tsc", "typecheck-script", "build-script", "noEmit-command", "project-build", "watch", "generated-types", "unknown"]),
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

export const PackageManagerReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  manifestFiles: z.array(z.object({
    filePath: z.string(),
    packageManager: z.string().nullable(),
    scriptCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workspaceSignals: z.array(z.object({
    signal: z.enum(["workspace-file", "packages-include", "packages-exclude", "workspace-protocol", "catalog", "overrides", "patched-dependencies", "shared-workspace-lockfile", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lockfileSignals: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["pnpm", "npm", "yarn", "bun", "unknown"]),
    version: z.string().nullable(),
    importerCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["install", "dev", "build", "test", "lint", "typecheck", "workspace-recursive", "filter", "frozen-lockfile", "prepare", "release", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["packageManager", "devEngines", "engines", "onlyBuiltDependencies", "allowBuilds", "auditConfig", "minimumReleaseAge", "nodeLinker", "configDependencies", "pnpmfile-hook", "unknown"]),
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

export const GitHooksReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  hookFiles: z.array(z.object({
    filePath: z.string(),
    hookName: z.string(),
    commandCount: z.number().int().nonnegative(),
    hasBypassHint: z.boolean(),
    hasNodePathHint: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  installSignals: z.array(z.object({
    signal: z.enum(["prepare-script", "postinstall-script", "husky-init", "core-hooks-path", "git-root-subdir", "ci-skip", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["test", "lint", "format", "typecheck", "security", "commitlint", "lint-staged", "npm-run", "pnpm-run", "node-entrypoint", "posix-shell", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["pre-commit", "pre-push", "commit-msg", "prepare-commit-msg", "post-merge", "skip-env", "no-verify", "gui-node-path", "deprecated-husky-sh", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  toolConfigFiles: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["husky", "lint-staged", "commitlint", "lefthook", "pre-commit", "simple-git-hooks", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  lefthookSignals: z.array(z.object({
    signal: z.enum(["config-file", "local-config", "parallel", "jobs", "commands", "scripts", "group", "piped", "glob-filter", "files-template", "root", "tags", "skip", "only", "stage-fixed", "runner", "output-control", "extends", "remotes", "run-command", "validate-command", "dump-command"]),
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

export const TaskRunnerReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["turbo", "nx", "taskfile", "moon", "lage", "unknown"]),
    taskCount: z.number().int().nonnegative(),
    dependsOnCount: z.number().int().nonnegative(),
    outputsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["build", "test", "lint", "dev", "typecheck", "format", "quality", "release", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["outputs", "inputs", "cache-false", "remote-cache", "global-env", "pass-through-env", "persistent", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["depends-on", "caret-dependency", "root-task", "package-task", "filter", "workspace-script", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["globalEnv", "globalPassThroughEnv", "passThroughEnv", "env", "dot-env", "ci", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageScriptSignals: z.array(z.object({
    signal: z.enum(["turbo-run", "nx-run", "task-run", "moon-run", "recursive-run", "filter-run", "unknown"]),
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

export const DependencyUpdateReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["renovate", "dependabot", "package-json", "github-action", "unknown"]),
    extendsCount: z.number().int().nonnegative(),
    packageRuleCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    automergeSignal: z.enum(["enabled", "disabled", "conditional", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  managerSignals: z.array(z.object({
    signal: z.enum(["npm", "docker", "github-actions", "python", "go", "ruby", "terraform", "maven", "gradle", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["extends", "package-rules", "schedule", "automerge", "dependency-dashboard", "labels-reviewers", "rate-limits", "range-strategy", "config-migration", "host-rules", "vulnerability-alerts", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["branch-pr", "dashboard-approval", "grouping", "separate-major", "semantic-commits", "lockfile-maintenance", "rebase", "ignore-paths", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["host-rules", "encrypted-secrets", "registry-url", "token-env", "private-packages", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageFileSignals: z.array(z.object({
    signal: z.enum(["package-json", "package-lock", "pnpm-lock", "yarn-lock", "bun-lock", "dockerfile", "github-actions", "go-mod", "pyproject", "requirements", "gemfile", "terraform", "unknown"]),
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

export const DependencyReviewReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dependencyReviewSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["dependency-review-action", "dependabot", "osv-scanner", "github-actions", "package-script", "readme", "unknown"]),
    reviewCount: z.number().int().nonnegative(),
    vulnerabilityCount: z.number().int().nonnegative(),
    licenseCount: z.number().int().nonnegative(),
    packagePolicyCount: z.number().int().nonnegative(),
    diffCount: z.number().int().nonnegative(),
    snapshotCount: z.number().int().nonnegative(),
    scorecardCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  reviewSignals: z.array(z.object({
    signal: z.enum(["dependency-review-action", "dependency-graph", "dependency-submission", "base-head-compare", "snapshot-warning", "pr-summary", "pull-request", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  vulnerabilitySignals: z.array(z.object({
    signal: z.enum(["fail-on-severity", "vulnerability-check", "osv-scanner", "lockfile-scan", "min-severity", "ignore-dev", "offline-db", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  licenseSignals: z.array(z.object({
    signal: z.enum(["license-check", "allow-licenses", "deny-licenses", "allow-dependencies-licenses", "license-scan", "spdx", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packagePolicySignals: z.array(z.object({
    signal: z.enum(["deny-packages", "allowlist", "ignore", "groups", "security-updates", "ecosystem-directory", "registries", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "permissions", "artifact-upload", "summary-comment", "scheduled-run", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scorecardSignals: z.array(z.object({
    signal: z.enum(["show-openssf-scorecard", "warn-on-openssf-scorecard-level", "scorecard-api", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["summary", "pr-comment", "sarif", "json", "html", "markdown", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["dependency-review-action", "dependabot", "osv-scanner", "github-action", "unknown"]),
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

export const LintReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["eslint", "biome", "oxlint", "standard", "package-json", "unknown"]),
    flatConfig: z.boolean(),
    ruleCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    ignoreCount: z.number().int().nonnegative(),
    parserSignal: z.enum(["default", "typescript", "babel", "custom", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["rules", "extends", "recommended", "severity", "files-overrides", "globals", "parser", "plugins", "ignores", "inline-disable", "unused-disable", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["lint", "lint-fix", "cache", "max-warnings", "format", "type-aware", "ci", "stdin", "report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["javascript", "typescript", "jsx", "tests", "docs", "config-files", "generated", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["formatter", "output-file", "stats", "quiet", "debug", "report-unused-disable", "suppressions", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["eslint", "typescript-eslint", "eslint-plugin", "eslint-config", "parser", "prettier-integration", "globals", "unknown"]),
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

export const FormatReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["prettier", "editorconfig", "biome", "dprint", "package-json", "unknown"]),
    optionCount: z.number().int().nonnegative(),
    overrideCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    parserSignal: z.enum(["inferred", "override", "plugin", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ignoreFiles: z.array(z.object({
    filePath: z.string(),
    patternCount: z.number().int().nonnegative(),
    generatedSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  optionSignals: z.array(z.object({
    signal: z.enum(["print-width", "tab-width", "single-quote", "trailing-comma", "semi", "bracket-spacing", "end-of-line", "parser", "overrides", "editorconfig", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["format", "format-check", "format-write", "list-different", "cache", "config-path", "ignore-path", "stdin", "ci", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["javascript", "typescript", "json", "css", "html", "markdown", "yaml", "graphql", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["prettier", "prettier-plugin", "eslint-config-prettier", "dprint", "biome", "editorconfig", "unknown"]),
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

export const CommitConventionReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["commitlint", "package-json", "husky", "unknown"]),
    extendsCount: z.number().int().nonnegative(),
    ruleCount: z.number().int().nonnegative(),
    parserPreset: z.enum(["conventional", "custom", "missing"]),
    promptSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["type-enum", "scope-enum", "subject-case", "subject-empty", "subject-full-stop", "header-max-length", "body-leading-blank", "body-max-line-length", "footer-leading-blank", "footer-max-line-length", "breaking-change", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  hookSignals: z.array(z.object({
    signal: z.enum(["commit-msg", "husky", "ci-range", "last-commit", "edit-message", "prompt", "bypass", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["from-to", "last", "edit", "verbose", "strict", "format", "config", "help-url", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["commitlint-cli", "config-conventional", "commitizen", "cz-commitlint", "husky", "conventional-changelog", "unknown"]),
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

export const ChangelogReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["changeset-config", "package-json", "workflow", "unknown"]),
    changelogMode: z.enum(["default", "github", "custom", "disabled", "missing"]),
    baseBranch: z.string().nullable(),
    fixedCount: z.number().int().nonnegative(),
    linkedCount: z.number().int().nonnegative(),
    ignoredCount: z.number().int().nonnegative(),
    privatePackagePolicy: z.enum(["version-only", "tagged", "disabled", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  changesetFiles: z.array(z.object({
    filePath: z.string(),
    packageCount: z.number().int().nonnegative(),
    bumpTypes: z.array(z.enum(["major", "minor", "patch", "none", "unknown"])),
    summaryLines: z.number().int().nonnegative(),
    empty: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["status-check", "changeset-bot", "changesets-action", "version-pr", "publish", "follow-tags", "manual-release", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["add", "status", "version", "publish", "pre", "tag", "snapshot", "since", "output", "otp", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["changesets-cli", "changesets-action", "changelog-github", "workspace", "package-manager", "npm-publish", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["fixed", "linked", "base-branch", "internal-deps", "access", "ignore", "private-packages", "pre-mode", "snapshot", "unknown"]),
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

export const BundleAnalysisReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["webpack", "vite", "rollup", "esbuild", "next", "package-json", "unknown"]),
    analyzerMode: z.enum(["server", "static", "json", "disabled", "missing"]),
    defaultSizeMode: z.enum(["stat", "parsed", "gzip", "brotli", "zstd", "missing"]),
    statsFileSignal: z.boolean(),
    sourceMapSignal: z.boolean(),
    budgetSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  bundleArtifacts: z.array(z.object({
    filePath: z.string(),
    artifactType: z.enum(["stats-json", "source-map", "asset-manifest", "bundle-report", "dist-file", "unknown"]),
    sizeBytes: z.number().int().nonnegative(),
    referencedChunks: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string().nullable()
  })),
  sizeSignals: z.array(z.object({
    signal: z.enum(["js-bundle", "css-bundle", "asset", "chunk", "vendor", "sourcemap", "gzip", "brotli", "zstd", "budget", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["analyze", "build", "stats", "visualizer", "bundle-analyzer", "source-map-explorer", "webpack-profile", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["webpack-bundle-analyzer", "rollup-plugin-visualizer", "source-map-explorer", "vite", "webpack", "next-bundle-analyzer", "unknown"]),
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

export const MockingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  handlerFiles: z.array(z.object({
    filePath: z.string(),
    environment: z.enum(["browser", "node", "shared", "test", "unknown"]),
    handlerCount: z.number().int().nonnegative(),
    usesHttp: z.boolean(),
    usesGraphql: z.boolean(),
    usesWebSocket: z.boolean(),
    responseSignals: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  serverSetups: z.array(z.object({
    filePath: z.string(),
    setupType: z.enum(["setupWorker", "setupServer", "native", "unknown"]),
    startSignal: z.boolean(),
    lifecycleSignal: z.boolean(),
    unhandledPolicy: z.enum(["error", "warn", "bypass", "custom", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  protocolSignals: z.array(z.object({
    signal: z.enum(["rest", "graphql", "websocket", "http-response", "delay", "passthrough", "bypass", "cookies", "params", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["setupWorker", "setupServer", "listen", "start", "use", "resetHandlers", "restoreHandlers", "close", "boundary", "onUnhandledRequest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mswSignals: z.array(z.object({
    signal: z.enum(["http-handler", "graphql-handler", "websocket-handler", "sse-handler", "setup-worker", "setup-server", "native-server", "service-worker-options", "find-worker", "quiet-option", "wait-until-ready", "worker-integrity", "http-response-json", "http-response-text", "http-response-html", "http-response-xml", "http-response-array-buffer", "http-response-form-data", "delay", "passthrough", "bypass", "route-params", "request-cookies", "response-cookies", "unhandled-error", "unhandled-warn", "unhandled-bypass", "unhandled-callback", "lifecycle-events", "request-events", "response-events", "unhandled-exception-event", "boundary", "list-handlers", "runtime-use", "reset-handlers", "restore-handlers", "close-stop", "request-handler-types", "response-resolver-types", "ws-client-send", "ws-server-connect", "sse-client-send", "sse-retry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["msw", "nock", "pact", "wiremock", "fetch-mock", "axios-mock-adapter", "unknown"]),
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

export type CiCdReport = z.infer<typeof CiCdReportSchema>;
export type UnitTestReport = z.infer<typeof UnitTestReportSchema>;
export type CoverageReadinessReport = z.infer<typeof CoverageReadinessReportSchema>;
export type MutationTestingReadinessReport = z.infer<typeof MutationTestingReadinessReportSchema>;
export type TypecheckReadinessReport = z.infer<typeof TypecheckReadinessReportSchema>;
export type PackageManagerReport = z.infer<typeof PackageManagerReportSchema>;
export type GitHooksReport = z.infer<typeof GitHooksReportSchema>;
export type TaskRunnerReport = z.infer<typeof TaskRunnerReportSchema>;
export type DependencyUpdateReport = z.infer<typeof DependencyUpdateReportSchema>;
export type DependencyReviewReadinessReport = z.infer<typeof DependencyReviewReadinessReportSchema>;
export type LintReadinessReport = z.infer<typeof LintReadinessReportSchema>;
export type FormatReadinessReport = z.infer<typeof FormatReadinessReportSchema>;
export type CommitConventionReport = z.infer<typeof CommitConventionReportSchema>;
export type ChangelogReadinessReport = z.infer<typeof ChangelogReadinessReportSchema>;
export type BundleAnalysisReport = z.infer<typeof BundleAnalysisReportSchema>;
export type MockingReadinessReport = z.infer<typeof MockingReadinessReportSchema>;
