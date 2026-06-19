import { z } from "zod";

export const CodeMetricsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  totals: z.object({
    files: z.number().int().nonnegative(),
    lines: z.number().int().nonnegative(),
    codeLines: z.number().int().nonnegative(),
    commentLines: z.number().int().nonnegative(),
    blankLines: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    complexityDensity: z.number().nonnegative()
  }),
  languageMetrics: z.array(z.object({
    language: z.string(),
    fileCount: z.number().int().nonnegative(),
    lines: z.number().int().nonnegative(),
    codeLines: z.number().int().nonnegative(),
    commentLines: z.number().int().nonnegative(),
    blankLines: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    complexityDensity: z.number().nonnegative(),
    evidence: z.string()
  })),
  hotspots: z.array(z.object({
    filePath: z.string(),
    language: z.string(),
    lines: z.number().int().nonnegative(),
    codeLines: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    complexityDensity: z.number().nonnegative(),
    hotspotScore: z.number().nonnegative(),
    readingPriority: z.enum(["high", "medium", "low"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["scc", "lizard", "tokei", "cloc", "radon", "eslint-complexity", "complexity-report", "locomo", "cocomo", "codecharta", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metricSignals: z.array(z.object({
    signal: z.enum(["loc", "blank-lines", "comment-lines", "code-lines", "cyclomatic", "cognitive", "function-count", "function-length", "parameter-count", "halstead", "cocomo", "locomo", "dryness", "hotspots", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["json-output", "csv-output", "html-report", "openmetrics", "threshold", "ci-complexity", "baseline", "diff-check", "ignore-file", "hotspot-report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  codeMapMetricBindings: z.array(z.object({
    channel: z.enum(["area", "height", "color", "delta"]),
    metric: z.string(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  codeMapSignals: z.array(z.object({
    signal: z.enum(["cc-json", "source-parser", "git-log-parser", "metric-importer", "filter-pipeline", "web-studio", "local-only", "delta-comparison", "validation-tool", "inspection-tool"]),
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

export const CodeOwnershipReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  codeownerFiles: z.array(z.object({
    filePath: z.string(),
    location: z.enum(["root", "github", "docs", "gitlab", "unknown"]),
    ruleCount: z.number().int().nonnegative(),
    ownerCount: z.number().int().nonnegative(),
    teamOwnerCount: z.number().int().nonnegative(),
    userOwnerCount: z.number().int().nonnegative(),
    emailOwnerCount: z.number().int().nonnegative(),
    wildcardCount: z.number().int().nonnegative(),
    protectedPathCount: z.number().int().nonnegative(),
    duplicatePatternCount: z.number().int().nonnegative(),
    selfOwnershipCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ownershipSignals: z.array(z.object({
    signal: z.enum(["codeowners-file", "standard-location", "pattern-rules", "last-match-wins", "team-owner", "user-owner", "email-owner", "self-owned-codeowners", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["syntax-check", "owner-check", "file-exists-check", "duplicate-pattern-check", "not-owned-check", "github-action", "api-errors", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reviewSignals: z.array(z.object({
    signal: z.enum(["auto-review-request", "required-code-owner-review", "branch-protection", "rulesets", "dismiss-stale-review", "required-approving-review", "fork-base-branch", "draft-pr", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coverageSignals: z.array(z.object({
    signal: z.enum(["root-default", "docs", "src", "tests", "github-directory", "packages", "unowned-allowed", "case-sensitive-paths", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["hmarr/codeowners", "codeowners-validator", "github-codeowners-api", "custom", "unknown"]),
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

export const LargeAssetReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  assetSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["git-lfs", "dvc", "git-submodule", "custom", "unknown"]),
    setupType: z.enum(["gitattributes", "lfs-pointer", "dvc-file", "dvc-pipeline", "dvc-config", "gitmodules", "documentation", "script", "unknown"]),
    patternCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    outCount: z.number().int().nonnegative(),
    depCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    remoteCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    lockableCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  lfsSignals: z.array(z.object({
    signal: z.enum(["gitattributes", "filter-lfs", "diff-merge-lfs", "pointer-file", "oid-sha256", "track-command", "install-command", "status-command", "pull-push-fetch", "fsck", "migrate", "prune", "lockable", "locks", "skip-smudge", "case-sensitive-patterns", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dvcSignals: z.array(z.object({
    signal: z.enum(["dvc-yaml", "dvc-lock", "dvc-file", "outs", "deps", "metrics", "params", "remote-config", "default-remote", "cache", "push", "pull", "status", "repro", "run-cache", "dvcignore", "optional-remote-deps", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  submoduleSignals: z.array(z.object({
    signal: z.enum(["gitmodules", "submodule-url", "submodule-path", "recursive-clone", "lfs-submodule", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-fetch", "ci-pull", "ci-push", "artifact-cache", "pre-push-hook", "checkout-lfs", "dvc-repro", "dvc-doctor", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["git-lfs", "dvc", "dvc-s3", "dvc-azure", "dvc-gdrive", "dvc-gs", "dvc-oss", "dvc-ssh", "custom", "unknown"]),
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

export const LicenseRightsReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  detectedProjectLicense: z.object({
    spdxId: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    evidence: z.string(),
    sourceHref: z.string().nullable()
  }),
  licenseFiles: z.array(z.object({
    filePath: z.string(),
    filenameScore: z.number().min(0).max(1),
    detectedSpdxId: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    matcher: z.enum(["copyright-only", "exact-keyword", "spdx-filename", "text-similarity-hint", "unknown"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  packageLicenseSignals: z.array(z.object({
    filePath: z.string(),
    packageName: z.string().nullable(),
    licenseText: z.string(),
    detectedSpdxId: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    sourceHref: z.string()
  })),
  readmeLicenseReferences: z.array(z.object({
    filePath: z.string(),
    detectedSpdxId: z.string().nullable(),
    snippet: z.string(),
    confidence: z.number().min(0).max(1),
    sourceHref: z.string()
  })),
  reviewWarnings: z.array(z.object({
    severity: z.enum(["info", "warn", "error"]),
    message: z.string(),
    relatedHref: z.string()
  })),
  rightsChecklist: z.array(z.object({
    label: z.string(),
    status: z.enum(["pass", "review", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export type CodeMetricsReadinessReport = z.infer<typeof CodeMetricsReadinessReportSchema>;
export type CodeOwnershipReadinessReport = z.infer<typeof CodeOwnershipReadinessReportSchema>;
export type LargeAssetReadinessReport = z.infer<typeof LargeAssetReadinessReportSchema>;
export type LicenseRightsReport = z.infer<typeof LicenseRightsReportSchema>;
