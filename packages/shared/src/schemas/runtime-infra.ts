import { z } from "zod";

export const BuildToolReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  buildToolSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["vite", "webpack", "rollup", "esbuild", "parcel", "next", "nuxt", "astro", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    devServerCount: z.number().int().nonnegative(),
    buildCount: z.number().int().nonnegative(),
    previewCount: z.number().int().nonnegative(),
    envCount: z.number().int().nonnegative(),
    ssrCount: z.number().int().nonnegative(),
    depOptimizationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["config-file", "define-config", "config-function", "mode-aware", "root-base", "resolve-alias", "env-dir", "cache-dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["plugins-array", "official-plugin", "custom-plugin", "enforce-order", "apply-scope", "config-resolved", "transform-index-html", "hmr-hook", "rollup-hook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  devServerSignals: z.array(z.object({
    signal: z.enum(["dev-server", "server-port", "proxy", "cors", "https", "open", "middleware-mode", "hmr", "warmup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["build-command", "out-dir", "sourcemap", "minify", "target", "library-mode", "manifest", "rollup-options", "assets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["env-prefix", "load-env", "import-meta-env", "mode", "base-url", "ssr-env", "dotenv", "define", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ssrSignals: z.array(z.object({
    signal: z.enum(["ssr-entry", "ssr-external", "ssr-no-external", "ssr-target", "ssr-manifest", "middleware-mode", "module-runner", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencyOptimizationSignals: z.array(z.object({
    signal: z.enum(["optimize-deps", "include", "exclude", "entries", "force", "cache-dir", "rolldown-options", "esbuild-options", "linked-package", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vite", "@vitejs/plugin-react", "@vitejs/plugin-vue", "webpack", "rollup", "esbuild", "parcel", "rolldown", "unknown"]),
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

export const StylingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  stylingSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["tailwind", "unocss", "bootstrap", "sass", "postcss", "css-modules", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    directiveCount: z.number().int().nonnegative(),
    utilityCount: z.number().int().nonnegative(),
    themeCount: z.number().int().nonnegative(),
    variantCount: z.number().int().nonnegative(),
    contentScanCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    buildIntegrationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["config-file", "tailwind-config", "content-globs", "safelist", "dark-mode", "prefix", "important", "presets", "core-plugins", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  directiveSignals: z.array(z.object({
    signal: z.enum(["import-tailwind", "tailwind-directive", "theme-directive", "utility-directive", "variant-directive", "source-directive", "config-directive", "plugin-directive", "apply-directive", "layer-directive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  classSignals: z.array(z.object({
    signal: z.enum(["utility-class", "arbitrary-value", "variant-prefix", "responsive-prefix", "state-prefix", "group-peer", "dark-class", "important-modifier", "prefix-usage", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  themeSignals: z.array(z.object({
    signal: z.enum(["css-theme-vars", "colors", "spacing", "typography", "breakpoints", "container", "custom-property", "theme-function", "design-token-bridge", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    signal: z.enum(["postcss-plugin", "vite-plugin", "webpack-loader", "cli-command", "watch-mode", "build-script", "css-entry", "import-css", "lightning-css", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tailwindcss", "@tailwindcss/postcss", "@tailwindcss/vite", "@tailwindcss/cli", "@tailwindcss/forms", "@tailwindcss/typography", "@tailwindcss/oxide", "unocss", "bootstrap", "unknown"]),
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

export const VisualRegressionReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  visualRegressionSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["reg-suit", "argos", "chromatic", "percy", "playwright", "cypress", "webdriverio", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    actualCount: z.number().int().nonnegative(),
    expectedCount: z.number().int().nonnegative(),
    diffCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["regconfig", "actual-dir", "working-dir", "expected-dir", "diff-dir", "config-file", "ci-config", "package-script", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  snapshotSignals: z.array(z.object({
    signal: z.enum(["actual-images", "expected-images", "diff-images", "screenshots", "baseline-key", "sync-expected", "compare-command", "publish-command", "run-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  thresholdSignals: z.array(z.object({
    signal: z.enum(["threshold-rate", "threshold-pixel", "matching-threshold", "antialias", "ximgdiff", "concurrency", "failure-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["html-report", "diff-report", "comparison-result", "json-result", "report-url", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["keygen-git-hash", "simple-keygen", "publish-s3", "publish-gcs", "notify-github", "notify-gitlab", "notify-slack", "notify-chatwork", "custom-plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "circleci", "travis", "gitlab-ci", "ci-command", "detached-head", "artifact-cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["reg-suit", "reg-suit-core", "reg-suit-interface", "reg-keygen-git-hash-plugin", "reg-publish-s3-plugin", "reg-publish-gcs-plugin", "reg-notify-github-plugin", "@percy/cli", "@argos-ci/cli", "chromatic", "unknown"]),
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

export const InfrastructureReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  infrastructureSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["opentofu", "terraform", "terragrunt", "pulumi", "cdk", "cloudformation", "helm", "kustomize", "custom", "unknown"]),
    terraformBlockCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    dataSourceCount: z.number().int().nonnegative(),
    moduleCount: z.number().int().nonnegative(),
    variableCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    backendCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["tf-file", "terraform-block", "required-providers", "required-version", "provider-block", "resource-block", "data-source", "module-block", "variable-block", "output-block", "locals-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["backend", "remote-state", "state-lock", "workspace", "terraform-lock-hcl", "state-file-warning", "state-encryption", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["init-command", "plan-command", "apply-command", "destroy-command", "import-command", "validate-command", "fmt-command", "test-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  moduleSignals: z.array(z.object({
    signal: z.enum(["source-url", "local-module", "registry-module", "provider-alias", "for-each", "count", "depends-on", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  variableSignals: z.array(z.object({
    signal: z.enum(["tfvars", "auto-tfvars", "sensitive-var", "validation", "default-value", "environment-var", "input-variable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["tflint", "tfsec", "checkov", "opa", "conftest", "sentinel", "infracost", "terraform-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["opentofu", "terraform", "terragrunt", "tflint", "tfsec", "checkov", "cdktf", "pulumi", "unknown"]),
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

export const IacDriftReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  driftSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "package-script", "workflow", "readme", "unknown"]),
    inventoryCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    refreshCount: z.number().int().nonnegative(),
    planCount: z.number().int().nonnegative(),
    driftCount: z.number().int().nonnegative(),
    ignoreCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    remediationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "cloud-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["tfstate", "remote-state", "backend", "workspace", "stack", "state-lock", "import", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inventorySignals: z.array(z.object({
    signal: z.enum(["provider", "account", "region", "resource-address", "asset-inventory", "cloud-control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  refreshSignals: z.array(z.object({
    signal: z.enum(["refresh-only", "refresh", "pulumi-refresh", "state-pull", "drift-scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  planSignals: z.array(z.object({
    signal: z.enum(["plan", "detailed-exitcode", "out-plan", "pulumi-preview", "terragrunt-plan", "cost-diff", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  driftSignals: z.array(z.object({
    signal: z.enum(["changed", "missing", "unmanaged", "drift", "ignore-rules", "exit-code", "summary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  remediationSignals: z.array(z.object({
    signal: z.enum(["import", "state-rm", "state-mv", "pulumi-import", "apply-gated", "manual-review", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "sarif", "markdown", "html", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "scheduled-run", "pull-request", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "infracost", "unknown"]),
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

export const DeploymentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  deploymentSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["helm", "kustomize", "kubernetes", "argo-cd", "flux", "skaffold", "kubectl", "custom", "unknown"]),
    chartMetadataCount: z.number().int().nonnegative(),
    valuesCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    manifestCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    releaseWorkflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  chartSignals: z.array(z.object({
    signal: z.enum(["chart-yaml", "api-version", "chart-name", "chart-version", "app-version", "chart-type", "dependencies", "chart-lock", "helmignore", "values-yaml", "values-schema", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["deployment", "service", "ingress", "configmap", "secret", "serviceaccount", "hpa", "notes", "helpers", "crd", "hooks", "tests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["values-file", "values-override", "set-flag", "set-string-flag", "set-file-flag", "set-json-flag", "schema-validation", "global-values", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["lint-command", "template-command", "install-command", "upgrade-command", "rollback-command", "uninstall-command", "test-command", "status-command", "history-command", "dependency-command", "package-command", "repo-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["dry-run", "wait", "rollback-on-failure", "no-hooks", "skip-crds", "disable-openapi-validation", "namespace", "kube-context", "create-namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["helm", "kustomize", "kubectl", "argo-cd", "flux", "skaffold", "chart-releaser", "unknown"]),
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

export const ServerlessReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  serverlessSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["serverless-framework", "aws-sam", "sst", "vercel-functions", "netlify-functions", "cloudflare-workers", "custom", "unknown"]),
    serviceCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    environmentCount: z.number().int().nonnegative(),
    iamCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["serverless-yml", "service", "framework-version", "provider", "runtime", "stage", "region", "custom", "params", "variables", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  functionSignals: z.array(z.object({
    signal: z.enum(["functions", "handler", "timeout", "memory-size", "layers", "url", "reserved-concurrency", "provisioned-concurrency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["http", "http-api", "schedule", "event-bridge", "sqs", "sns", "s3", "stream", "websocket", "alb", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["nodejs", "python", "go", "java", "dotnet", "ruby", "arm64", "x86-64", "ephemeral-storage", "vpc", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["deploy", "deploy-function", "package", "remove", "invoke", "invoke-local", "info", "logs", "doctor", "offline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["iam-role-statements", "least-privilege", "environment", "secrets", "deployment-bucket", "rollback", "prune", "log-retention", "tracing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["serverless", "serverless-offline", "serverless-esbuild", "serverless-webpack", "serverless-prune-plugin", "serverless-domain-manager", "aws-sam", "sst", "vercel", "netlify", "wrangler", "unknown"]),
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

export const MobileReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mobileSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["expo", "react-native", "eas", "bare-native", "capacitor", "unknown"]),
    appConfigCount: z.number().int().nonnegative(),
    platformCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    buildProfileCount: z.number().int().nonnegative(),
    updateCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["app-json", "app-config", "name", "slug", "version", "scheme", "extra", "plugins", "experiments", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["ios", "bundle-identifier", "android", "android-package", "native-ios-dir", "native-android-dir", "web", "permissions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["expo-router", "app-directory", "typed-routes", "deep-linking", "react-navigation", "entry-point", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["eas-json", "eas-build", "development-client", "internal-distribution", "submit", "auto-increment", "prebuild", "run-ios", "run-android", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["expo-updates", "runtime-version", "updates-url", "eas-update", "update-branch", "channel", "check-for-update", "fetch-update", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["icon", "adaptive-icon", "splash-screen", "favicon", "assets-directory", "font-assets", "image-assets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["expo", "react-native", "expo-router", "expo-dev-client", "expo-updates", "eas-cli", "react-native-web", "metro-config", "unknown"]),
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

export const DesktopReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  desktopSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["tauri", "electron", "wails", "neutralino", "desktop-webview", "unknown"]),
    configCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    bundleCount: z.number().int().nonnegative(),
    updaterCount: z.number().int().nonnegative(),
    signingCount: z.number().int().nonnegative(),
    platformCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["tauri", "electron", "wails", "neutralino", "webview", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["tauri-conf", "wails-json", "electron-builder", "forge-config", "package-main", "cargo-manifest", "frontend-dist", "dev-url", "identifier", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["window", "multi-window", "tray", "menu", "dialog", "deep-link", "file-association", "custom-protocol", "ipc", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  permissionSignals: z.array(z.object({
    signal: z.enum(["tauri-capabilities", "permissions", "csp", "allowlist", "entitlements", "sandbox", "shell-open", "fs-scope", "global-tauri", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  bundleSignals: z.array(z.object({
    signal: z.enum(["bundle-targets", "icons", "resources", "macos", "windows", "linux", "dmg", "nsis", "appimage", "msi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["updater", "updater-artifacts", "signing", "notarization", "hardened-runtime", "ci-build", "artifact-upload", "release-draft", "version-sync", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tauri-cli", "tauri-api", "tauri-plugin", "electron", "electron-builder", "electron-forge", "electron-notarize", "wails", "wails-cli", "unknown"]),
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

export const EdgeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  edgeSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["cloudflare-workers", "wrangler", "pages-functions", "miniflare", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    handlerCount: z.number().int().nonnegative(),
    bindingCount: z.number().int().nonnegative(),
    routingCount: z.number().int().nonnegative(),
    devWorkflowCount: z.number().int().nonnegative(),
    deploymentWorkflowCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["wrangler-toml", "wrangler-json", "name", "main", "compatibility-date", "compatibility-flags", "env", "vars", "limits", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  handlerSignals: z.array(z.object({
    signal: z.enum(["module-worker", "fetch-handler", "scheduled", "queue-handler", "durable-object-class", "workflow-class", "email-handler", "assets-worker", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  bindingSignals: z.array(z.object({
    signal: z.enum(["kv", "r2", "d1", "durable-objects", "queues", "services", "workflows", "analytics-engine", "secrets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routingSignals: z.array(z.object({
    signal: z.enum(["workers-dev", "route", "routes", "custom-domain", "assets", "site", "durable-object-migrations", "placement", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  devSignals: z.array(z.object({
    signal: z.enum(["wrangler-dev", "local-mode", "remote-bindings", "dev-vars", "miniflare", "vitest-pool-workers", "typegen", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["wrangler-deploy", "wrangler-versions", "wrangler-tail", "wrangler-secret", "wrangler-kv", "wrangler-r2", "wrangler-d1", "ci-deploy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["tail", "logs", "console", "traces", "analytics-engine", "version-metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["wrangler", "cloudflare-workers-types", "miniflare", "vitest-pool-workers", "vite-plugin-cloudflare", "workers-tsconfig", "kv-asset-handler", "unknown"]),
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

export const ComposeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  composeSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["compose-yaml", "docker-compose-yaml", "override", "env-file", "package-script", "unknown"]),
    serviceCount: z.number().int().nonnegative(),
    buildCount: z.number().int().nonnegative(),
    imageCount: z.number().int().nonnegative(),
    portCount: z.number().int().nonnegative(),
    volumeCount: z.number().int().nonnegative(),
    networkCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    healthcheckCount: z.number().int().nonnegative(),
    envCount: z.number().int().nonnegative(),
    secretConfigCount: z.number().int().nonnegative(),
    profileCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["compose-yaml", "docker-compose-yaml", "override-file", "services", "name", "include", "extends", "x-extension", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serviceSignals: z.array(z.object({
    signal: z.enum(["build", "image", "command", "entrypoint", "ports", "expose", "restart", "profiles", "scale-deploy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["depends-on", "service-healthy", "healthcheck", "links", "external-network", "aliases", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["volumes", "bind-mounts", "named-volumes", "networks", "secrets", "configs", "env-file", "environment", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["config", "up", "down", "build", "run", "exec", "logs", "ps", "pull", "watch", "wait", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["healthcheck", "restart-policy", "profiles", "resource-limits", "read-only", "cap-drop", "security-opt", "secrets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["docker-compose-plugin", "docker-compose-v1", "compose-spec", "compose-watch", "dockerfile", "unknown"]),
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

export const DevContainerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  devContainerSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["devcontainer-json", "devcontainer-lock", "feature-json", "template-json", "dockerfile", "compose-file", "package-script", "workflow", "unknown"]),
    configCount: z.number().int().nonnegative(),
    imageBuildCount: z.number().int().nonnegative(),
    featureCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    environmentCount: z.number().int().nonnegative(),
    mountCount: z.number().int().nonnegative(),
    portCount: z.number().int().nonnegative(),
    userCount: z.number().int().nonnegative(),
    customizationCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    lockfileCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["devcontainer-json", "devcontainer-lock", "name", "image", "build", "dockerfile", "docker-compose-file", "service", "workspace-folder", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  featureSignals: z.array(z.object({
    signal: z.enum(["features", "feature-json", "template-json", "installs-after", "options", "override-feature-install-order", "lockfile", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["initialize-command", "on-create-command", "update-content-command", "post-create-command", "post-start-command", "post-attach-command", "wait-for", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["container-env", "remote-env", "user-env-probe", "secrets", "remote-user", "container-user", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workspaceSignals: z.array(z.object({
    signal: z.enum(["workspace-folder", "workspace-mount", "mounts", "forward-ports", "ports-attributes", "other-ports-attributes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  customizationSignals: z.array(z.object({
    signal: z.enum(["customizations", "vscode-extensions", "vscode-settings", "codespaces", "dotfiles", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["devcontainer-up", "devcontainer-build", "devcontainer-exec", "read-configuration", "run-user-commands", "features-test", "features-package", "outdated", "upgrade", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["lockfile", "frozen-lockfile", "non-root-user", "cap-add", "security-opt", "privileged", "host-requirements", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["devcontainers-cli", "devcontainer-cli", "devcontainer-feature", "devcontainer-template", "vscode-dev-containers", "unknown"]),
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

export const AdmissionPolicyReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  admissionSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["kyverno", "gatekeeper", "kubernetes-native", "webhook", "package-script", "workflow", "readme", "unknown"]),
    policyCount: z.number().int().nonnegative(),
    constraintCount: z.number().int().nonnegative(),
    webhookCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    mutationCount: z.number().int().nonnegative(),
    exceptionCount: z.number().int().nonnegative(),
    enforcementCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  controllerSignals: z.array(z.object({
    signal: z.enum(["kyverno", "gatekeeper", "validating-admission-policy", "mutating-admission-policy", "admission-webhook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["cluster-policy", "policy", "constraint-template", "constraint", "validating-admission-policy", "policy-binding", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["validate", "mutate", "generate", "verify-images", "cel-expression", "rego-violation", "match-conditions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  enforcementSignals: z.array(z.object({
    signal: z.enum(["enforce", "audit", "warn", "dryrun", "failure-policy-fail", "failure-policy-ignore", "validation-actions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exceptionSignals: z.array(z.object({
    signal: z.enum(["policy-exception", "namespace-selector", "object-selector", "match-exclude", "exemptions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["kyverno-test", "kyverno-apply", "gator-test", "gator-verify", "conftest", "kubectl-dry-run", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["policy-report", "cluster-policy-report", "violations", "audit-results", "metrics", "events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "artifact-upload", "kyverno-cli", "gator-cli", "kubectl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kyverno", "gatekeeper", "opa", "kubernetes-client", "unknown"]),
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

export const ApiGatewayReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  apiGatewaySetups: z.array(z.object({
    filePath: z.string(),
    gateway: z.enum(["kong", "tyk", "krakend", "cloud-api-gateway", "package-script", "workflow", "readme", "unknown"]),
    routeCount: z.number().int().nonnegative(),
    upstreamCount: z.number().int().nonnegative(),
    authCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    trafficPolicyCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    deploymentCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  gatewaySignals: z.array(z.object({
    signal: z.enum(["kong", "tyk", "krakend", "cloud-api-gateway", "reverse-proxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routeSignals: z.array(z.object({
    signal: z.enum(["service", "route", "endpoint", "listen-path", "path-method", "host", "strip-path", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  upstreamSignals: z.array(z.object({
    signal: z.enum(["upstream", "target", "backend", "host", "load-balancing", "health-check", "timeout", "circuit-breaker", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["key-auth", "jwt", "oauth2", "openid-connect", "acl", "mtls", "auth-configs", "keyless", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["plugin", "custom-middleware", "request-transformer", "response-transformer", "cors", "cache", "cel", "lua", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trafficPolicySignals: z.array(z.object({
    signal: z.enum(["rate-limiting", "quota", "throttle", "retry", "timeout", "circuit-breaker", "proxy-cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["prometheus", "metrics", "analytics", "tracing", "logs", "health", "status", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["deck", "deck-sync", "tyk-sync", "krakend-check", "krakend-test-plugin", "gateway-tests", "openapi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "artifact-upload", "docker-compose", "helm", "kubernetes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kong", "deck", "tyk", "krakend", "lura", "gateway-api", "unknown"]),
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

export const KubernetesReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  kubernetesSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["manifest-yaml", "kustomization", "package-script", "workflow", "readme", "unknown"]),
    manifestCount: z.number().int().nonnegative(),
    workloadCount: z.number().int().nonnegative(),
    serviceCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    probeCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    autoscalingCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  manifestSignals: z.array(z.object({
    signal: z.enum(["api-version", "kind", "metadata", "labels", "annotations", "namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workloadSignals: z.array(z.object({
    signal: z.enum(["deployment", "statefulset", "daemonset", "job", "cronjob", "pod", "replicas", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  networkSignals: z.array(z.object({
    signal: z.enum(["service", "ingress", "network-policy", "ports", "selectors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["configmap", "secret", "env", "env-from", "image-pull-secret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["persistent-volume", "persistent-volume-claim", "volume-mount", "volume", "storage-class", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["service-account", "role", "role-binding", "cluster-role", "cluster-role-binding", "security-context", "pod-security-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  healthSignals: z.array(z.object({
    signal: z.enum(["readiness-probe", "liveness-probe", "startup-probe", "resources", "limits", "requests", "hpa", "pdb", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  kustomizeSignals: z.array(z.object({
    signal: z.enum(["kustomization", "resources", "bases", "patches", "configmap-generator", "secret-generator", "images", "replacements", "components", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["kubectl-apply", "kubectl-diff", "kubectl-wait", "kubectl-rollout", "kubectl-logs", "kubectl-describe", "kubectl-port-forward", "kubectl-delete", "kustomize-build", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kubectl", "kustomize", "kubernetes-yaml", "kind", "minikube", "unknown"]),
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

export const GitOpsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  gitopsSetups: z.array(z.object({
    filePath: z.string(),
    controller: z.enum(["argo-cd", "flux", "hybrid", "package-script", "workflow", "readme", "unknown"]),
    applicationCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    destinationCount: z.number().int().nonnegative(),
    syncPolicyCount: z.number().int().nonnegative(),
    generatorCount: z.number().int().nonnegative(),
    fluxSourceCount: z.number().int().nonnegative(),
    fluxReconcileCount: z.number().int().nonnegative(),
    imageAutomationCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  argoSignals: z.array(z.object({
    signal: z.enum(["application", "applicationset", "app-project", "repo-url", "target-revision", "path", "destination-server", "destination-namespace", "sync-policy", "automated-sync", "prune", "self-heal", "sync-options", "helm-source", "kustomize-source", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fluxSourceSignals: z.array(z.object({
    signal: z.enum(["git-repository", "helm-repository", "oci-repository", "bucket", "source-ref", "interval", "secret-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fluxReconcileSignals: z.array(z.object({
    signal: z.enum(["kustomization", "helm-release", "depends-on", "prune", "suspend", "health-checks", "timeout", "retry-interval", "target-namespace", "service-account", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  imageNotificationSignals: z.array(z.object({
    signal: z.enum(["image-repository", "image-policy", "image-update-automation", "receiver", "alert", "provider", "webhook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["argocd-app-sync", "argocd-app-diff", "argocd-app-wait", "argocd-app-get", "argocd-repo-add", "argocd-cluster-add", "flux-bootstrap", "flux-reconcile", "flux-get", "flux-suspend", "flux-resume", "flux-trace", "flux-tree", "flux-logs", "flux-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["dry-run", "namespace", "project-boundary", "sync-window", "allow-list", "deny-list", "signed-commit", "health-check", "drift-detection", "manual-approval", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["argocd", "argo-cd", "flux", "fluxcd", "source-controller", "kustomize-controller", "helm-controller", "notification-controller", "image-automation-controller", "unknown"]),
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

export const BackupReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  backupSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["velero", "litestream", "restic", "hybrid", "script", "workflow", "readme", "unknown"]),
    backupCount: z.number().int().nonnegative(),
    restoreCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    retentionCount: z.number().int().nonnegative(),
    verificationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  veleroSignals: z.array(z.object({
    signal: z.enum(["backup", "schedule", "restore", "backup-storage-location", "volume-snapshot-location", "included-namespaces", "excluded-namespaces", "ttl", "storage-location", "volume-snapshot", "fs-backup", "backup-describe", "backup-logs", "restore-describe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  litestreamSignals: z.array(z.object({
    signal: z.enum(["config", "db-path", "replica-url", "s3", "gcs", "azure", "snapshot-interval", "snapshot-retention", "replicate-command", "restore-command", "database-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resticSignals: z.array(z.object({
    signal: z.enum(["repository", "password-file", "init", "backup-command", "snapshots-command", "restore-command", "forget-prune", "check", "tags", "exclude", "read-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  restoreDrillSignals: z.array(z.object({
    signal: z.enum(["restore-runbook", "restore-command", "point-in-time", "wait", "describe", "logs", "integrity-check", "read-data", "target-path", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["retention-policy", "encrypted-secret", "namespace-scope", "storage-location", "snapshot-location", "verification-check", "prune-policy", "restore-drill", "external-repository", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["velero", "litestream", "restic", "backup-script", "cron", "workflow", "unknown"]),
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

export type BuildToolReadinessReport = z.infer<typeof BuildToolReadinessReportSchema>;
export type StylingReadinessReport = z.infer<typeof StylingReadinessReportSchema>;
export type VisualRegressionReadinessReport = z.infer<typeof VisualRegressionReadinessReportSchema>;
export type InfrastructureReadinessReport = z.infer<typeof InfrastructureReadinessReportSchema>;
export type IacDriftReadinessReport = z.infer<typeof IacDriftReadinessReportSchema>;
export type DeploymentReadinessReport = z.infer<typeof DeploymentReadinessReportSchema>;
export type ServerlessReadinessReport = z.infer<typeof ServerlessReadinessReportSchema>;
export type MobileReadinessReport = z.infer<typeof MobileReadinessReportSchema>;
export type DesktopReadinessReport = z.infer<typeof DesktopReadinessReportSchema>;
export type EdgeReadinessReport = z.infer<typeof EdgeReadinessReportSchema>;
export type ComposeReadinessReport = z.infer<typeof ComposeReadinessReportSchema>;
export type DevContainerReadinessReport = z.infer<typeof DevContainerReadinessReportSchema>;
export type AdmissionPolicyReadinessReport = z.infer<typeof AdmissionPolicyReadinessReportSchema>;
export type ApiGatewayReadinessReport = z.infer<typeof ApiGatewayReadinessReportSchema>;
export type KubernetesReadinessReport = z.infer<typeof KubernetesReadinessReportSchema>;
export type GitOpsReadinessReport = z.infer<typeof GitOpsReadinessReportSchema>;
export type BackupReadinessReport = z.infer<typeof BackupReadinessReportSchema>;
