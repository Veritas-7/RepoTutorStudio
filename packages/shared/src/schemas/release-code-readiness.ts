import { z } from "zod";

export const ReleaseReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  releaseConfigs: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["semantic-release-config", "releaserc", "package-release-key", "package-script", "github-workflow", "changesets-config", "release-please-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  branchChannels: z.array(z.object({
    channel: z.enum(["main", "maintenance", "next", "next-major", "beta", "alpha", "custom"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  versionSignals: z.array(z.object({
    signal: z.enum(["semantic-versioning", "conventional-commits", "breaking-change", "commit-analyzer", "release-notes-generator", "tag-format", "last-release-tag", "changelog", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["ci-workflow", "tests-before-release", "fetch-depth-zero", "contents-write", "id-token-write", "manual-trigger", "dry-run", "npm-audit-signatures", "protected-branch", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  publishTargets: z.array(z.object({
    target: z.enum(["npm", "github-release", "gitlab-release", "docker", "vs-code", "git-commit", "changelog", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["github-token", "npm-token", "oidc-trusted-publishing", "registry-config", "ssh-key", "persist-credentials-false", "token-redaction", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSteps: z.array(z.object({
    step: z.enum(["verifyConditions", "analyzeCommits", "verifyRelease", "generateNotes", "prepare", "publish", "addChannel", "success", "fail"]),
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

export const SecretReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scanTargets: z.array(z.object({
    target: z.enum(["git-history", "working-tree", "stdin", "pre-commit", "archive", "config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  secretSurfaces: z.array(z.object({
    filePath: z.string(),
    surfaceType: z.enum(["env-file", "key-file", "credential-config", "token-path", "ignored-secret-candidate", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    filePath: z.string(),
    signal: z.enum(["gitleaks-config", "extend-default", "custom-rule", "entropy", "secret-group", "keywords", "allowlist", "gitleaksignore", "allow-comment", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  reportingSignals: z.array(z.object({
    signal: z.enum(["json", "csv", "junit", "sarif", "template", "report-path", "baseline", "fingerprint", "redaction"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  preventionSignals: z.array(z.object({
    signal: z.enum(["pre-commit", "staged", "git-hook", "github-action", "ci", "exit-code", "protect-legacy"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  advancedSignals: z.array(z.object({
    signal: z.enum(["decode-depth", "archive-depth", "diagnostics", "enable-rule", "log-opts", "timeout"]),
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

export const SecretManagementReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  secretManagementSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["vault", "infisical", "doppler", "sops", "sealed-secrets", "external-secrets", "custom", "unknown"]),
    authCount: z.number().int().nonnegative(),
    engineCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    injectionCount: z.number().int().nonnegative(),
    rotationCount: z.number().int().nonnegative(),
    syncCount: z.number().int().nonnegative(),
    auditCount: z.number().int().nonnegative(),
    leaseCount: z.number().int().nonnegative(),
    encryptionCount: z.number().int().nonnegative(),
    cliCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["vault", "infisical", "doppler", "sops", "sealed-secrets", "external-secrets", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["token", "approle", "kubernetes-auth", "oidc", "aws-auth", "gcp-auth", "azure-auth", "universal-auth", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["kv", "secret-engine", "dynamic-secrets", "pki", "transit", "certificate", "database-credentials", "environment-config", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["env-injection", "cli-run", "agent", "kubernetes-operator", "sync", "github-action", "ci-cd", "sdk-api", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["policy", "rbac", "audit-log", "lease", "rotation", "versioning", "access-request", "break-glass", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@infisical/sdk", "infisical", "vault", "node-vault", "doppler", "sops", "sealed-secrets", "external-secrets", "unknown"]),
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

export const ContainerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dockerfiles: z.array(z.object({
    filePath: z.string(),
    stageCount: z.number().int().nonnegative(),
    baseImages: z.array(z.string()),
    instructionKinds: z.array(z.string()),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  composeFiles: z.array(z.object({
    filePath: z.string(),
    serviceCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    filePath: z.string(),
    signal: z.enum(["hadolint-config", "ignored-rules", "severity-override", "failure-threshold", "trusted-registries", "label-schema", "strict-labels", "disable-ignore-pragma", "output-format", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  instructionRisks: z.array(z.object({
    rule: z.enum(["DL3002", "DL3006", "DL3007", "DL3008", "DL3013", "DL3016", "DL3018", "DL3020", "DL3025", "DL3026", "DL3042", "DL3057", "DL3059", "DL4006", "SC", "unknown"]),
    severity: z.enum(["error", "warning", "info", "style", "external"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  labelPolicy: z.array(z.object({
    label: z.enum(["author", "contact", "created", "version", "documentation", "git-revision", "license", "custom"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    signal: z.enum(["pre-commit", "github-action", "gitlab-ci", "circleci", "jenkins", "editor", "code-quality-report", "sarif", "junit"]),
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

export const ContainerScanReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  containerScanSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["trivy", "grype", "dockle", "github-actions", "package-script", "readme", "unknown"]),
    imageCount: z.number().int().nonnegative(),
    vulnerabilityCount: z.number().int().nonnegative(),
    misconfigCount: z.number().int().nonnegative(),
    secretCount: z.number().int().nonnegative(),
    licenseCount: z.number().int().nonnegative(),
    sbomCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["image", "filesystem", "sbom", "dockerfile", "kubernetes", "tar-input", "registry", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scannerSignals: z.array(z.object({
    signal: z.enum(["trivy", "grype", "dockle", "vulnerability", "misconfig", "secret", "license", "cis-benchmark", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  gateSignals: z.array(z.object({
    signal: z.enum(["exit-code", "severity", "ignore-unfixed", "only-fixed", "fail-on", "exit-level", "ignore-policy", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "sarif", "cyclonedx", "spdx", "table", "template", "github", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["trivyignore", "grype-ignore", "dockleignore", "vex", "ignore-policy", "accept-key", "sensitive-file", "offline-db", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["image-ref", "registry-token", "docker-host", "podman", "private-registry", "platform", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "docker-build", "artifact-upload", "sarif-upload", "permissions", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["trivy-action", "grype", "dockle-action", "docker", "syft", "unknown"]),
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

export const CodeQualityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  toolConfigs: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["biome-config", "eslint-config", "prettier-config", "package-script", "editor-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  formatterSignals: z.array(z.object({
    signal: z.enum(["formatter-enabled", "format-command", "write-mode", "language-support", "line-width", "indent-style", "prettier-compat", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  linterSignals: z.array(z.object({
    signal: z.enum(["linter-enabled", "rule-groups", "custom-rules", "recommended-rules", "safe-fixes", "unsafe-fixes", "dependency-rule", "import-cycle-rule", "promise-rule", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assistSignals: z.array(z.object({
    signal: z.enum(["assist-enabled", "organize-imports", "sorted-keys", "plugins", "vcs-ignore", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["biome-ci", "biome-check", "github-action", "gitlab-ci", "pre-commit", "package-script", "editor-lsp", "reporter", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  languageCoverage: z.array(z.object({
    language: z.enum(["javascript", "typescript", "jsx", "json", "css", "graphql", "html", "markdown", "unknown"]),
    fileCount: z.number().int().nonnegative(),
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

export const DocumentationReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  siteConfigs: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["docusaurus-config", "package-script", "sidebar", "theme-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  contentSurfaces: z.array(z.object({
    surface: z.enum(["docs", "blog", "pages", "mdx", "static-assets", "versioned-docs", "i18n", "unknown"]),
    count: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["sidebar", "navbar", "footer", "breadcrumbs", "toc", "edit-url", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["search", "seo", "sitemap", "pwa", "analytics", "theme", "mdx", "typescript", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  localizationSignals: z.array(z.object({
    signal: z.enum(["i18n-config", "locale-dropdown", "translation-folder", "crowdin", "localized-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["build-script", "serve-script", "deploy-script", "github-pages", "netlify", "vercel", "ci-preview", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  docusaurusSignals: z.array(z.object({
    signal: z.enum(["core-package", "preset-classic", "config-ts", "async-config", "docs-plugin", "blog-plugin", "pages-plugin", "theme-classic", "sidebars-config", "autogenerated-sidebar", "generated-index", "navbar-items", "footer-links", "theme-config", "prism-theme", "color-mode", "mdx-loader", "remark-plugin", "rehype-plugin", "admonitions", "edit-url", "broken-links-policy", "versioning", "i18n-config", "translate-api", "locale-dropdown", "docsearch", "sitemap-plugin", "client-redirects", "swizzle", "plugin-lifecycle", "configure-webpack", "content-loaded", "create-data", "static-assets", "deployment-netlify", "deployment-vercel", "github-pages"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  objectDocumentationTargets: z.array(z.object({
    filePath: z.string(),
    language: z.string(),
    objectCount: z.number().int().nonnegative(),
    relationHintCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  repoAgentAutomationSignals: z.array(z.object({
    signal: z.enum(["ast-object-docs", "bidirectional-relations", "change-detection", "markdown-replacement", "project-hierarchy-record", "pre-commit-hook", "gitbook-display", "chat-with-repo", "local-model-support"]),
    readiness: z.enum(["ready", "suggested", "static-only", "missing"]),
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

export type ReleaseReadinessReport = z.infer<typeof ReleaseReadinessReportSchema>;
export type SecretReadinessReport = z.infer<typeof SecretReadinessReportSchema>;
export type SecretManagementReadinessReport = z.infer<typeof SecretManagementReadinessReportSchema>;
export type ContainerReadinessReport = z.infer<typeof ContainerReadinessReportSchema>;
export type ContainerScanReadinessReport = z.infer<typeof ContainerScanReadinessReportSchema>;
export type CodeQualityReport = z.infer<typeof CodeQualityReportSchema>;
export type DocumentationReport = z.infer<typeof DocumentationReportSchema>;
