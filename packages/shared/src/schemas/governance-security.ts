import { z } from "zod";
import { SourceTypeSchema } from "./core.js";

export const ProjectActivityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  historyAvailability: z.object({
    mode: z.enum(["snapshot-only", "git-metadata", "unavailable"]),
    reason: z.string(),
    sourceType: SourceTypeSchema.nullable(),
    sourceUrl: z.string().nullable(),
    localSourcePath: z.string().nullable(),
    branch: z.string().nullable(),
    commitHash: z.string().nullable()
  }),
  activitySignals: z.array(z.object({
    label: z.string(),
    value: z.string(),
    explanation: z.string(),
    relatedHref: z.string()
  })),
  hotspotCandidates: z.array(z.object({
    filePath: z.string(),
    score: z.number().min(0),
    reason: z.string(),
    signals: z.array(z.string()),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  deadCodeCandidates: z.array(z.object({
    filePath: z.string(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
    relatedHref: z.string(),
    sourceHref: z.string()
  })),
  reviewQueues: z.array(z.object({
    queue: z.string(),
    purpose: z.string(),
    items: z.array(z.object({
      target: z.string(),
      action: z.string(),
      why: z.string(),
      relatedHref: z.string()
    }))
  })),
  architectureDecisionPrompts: z.array(z.object({
    question: z.string(),
    trigger: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SbomReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sourceDescriptor: z.object({
    sourceType: SourceTypeSchema.nullable(),
    sourceUrl: z.string().nullable(),
    localSourcePath: z.string().nullable(),
    branch: z.string().nullable(),
    commitHash: z.string().nullable(),
    descriptorName: z.string(),
    descriptorVersion: z.string()
  }),
  packageManifests: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.string(),
    packageCount: z.number().int().nonnegative(),
    directDependencies: z.number().int().nonnegative(),
    devDependencies: z.number().int().nonnegative(),
    sourceHref: z.string()
  })),
  packageArtifacts: z.array(z.object({
    name: z.string(),
    version: z.string().nullable(),
    ecosystem: z.string(),
    packageType: z.string(),
    purl: z.string().nullable(),
    licenses: z.array(z.string()),
    foundBy: z.string(),
    locations: z.array(z.string()),
    evidenceHref: z.string()
  })),
  fileArtifacts: z.array(z.object({
    filePath: z.string(),
    artifactKind: z.enum(["manifest", "lockfile", "container", "source", "config"]),
    size: z.number().int().nonnegative(),
    sourceHref: z.string()
  })),
  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    relationshipType: z.enum(["declares", "contains", "evidence-for", "uses-ecosystem"]),
    evidenceHref: z.string()
  })),
  outputFormats: z.array(z.object({
    format: z.enum(["syft-json", "cyclonedx-json", "spdx-json"]),
    readiness: z.enum(["available", "partial"]),
    reason: z.string()
  })),
  reviewWarnings: z.array(z.object({
    severity: z.enum(["info", "warn", "error"]),
    message: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SecurityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scannerTargets: z.array(z.object({
    target: z.enum(["filesystem", "git-repository", "container-image", "kubernetes", "sbom"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scannerCoverage: z.array(z.object({
    scanner: z.enum(["vulnerability", "secret", "misconfiguration", "license", "sbom"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    kind: z.enum(["manifest", "lockfile", "container-config", "iac-config", "secret-candidate", "license", "sbom"]),
    filePath: z.string(),
    severity: z.enum(["info", "warn", "error"]),
    message: z.string(),
    sourceHref: z.string()
  })),
  actionQueue: z.array(z.object({
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

export const SastReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sastSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["semgrep", "codeql", "sonarqube", "snyk-code", "package-script", "workflow", "readme", "unknown"]),
    languageCount: z.number().int().nonnegative(),
    ruleCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    scopeCount: z.number().int().nonnegative(),
    baselineCount: z.number().int().nonnegative(),
    suppressionCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["semgrep", "codeql", "sonarqube", "snyk-code", "eslint-security", "bandit", "gosec", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["semgrep-rule", "pattern", "pattern-either", "pattern-regex", "metavariable", "severity", "message", "taint-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["codeql-query", "query-suite", "query-pack", "security-extended", "security-and-quality", "qlpack", "custom-query", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  languageSignals: z.array(z.object({
    signal: z.enum(["javascript-typescript", "python", "go", "java-kotlin", "c-cpp", "csharp", "ruby", "swift", "multi-language", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["paths", "paths-ignore", "exclusions", "generated-code", "test-scope", "monorepo", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  baselineSignals: z.array(z.object({
    signal: z.enum(["baseline-ref", "diff-aware", "pr-scan", "fail-threshold", "severity-threshold", "quality-gate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["sarif", "json", "junit", "html", "code-scanning", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "semgrep-ci", "codeql-init", "codeql-analyze", "sonar-scan-action", "snyk-code", "upload-sarif", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["semgrep", "codeql-action", "codeql-cli", "sonar-scanner", "sonarqube-scan-action", "snyk", "unknown"]),
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

export const DastReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dastSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["zap", "nuclei", "securecodebox", "playwright", "workflow", "package-script", "readme", "unknown"]),
    targetCount: z.number().int().nonnegative(),
    crawlerCount: z.number().int().nonnegative(),
    activeScanCount: z.number().int().nonnegative(),
    authCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["base-url", "url-list", "openapi", "graphql", "swagger", "sitemap", "environment", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scannerSignals: z.array(z.object({
    signal: z.enum(["zap", "nuclei", "securecodebox", "playwright", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  crawlSignals: z.array(z.object({
    signal: z.enum(["spider", "ajax-spider", "headless", "follow-redirects", "sitemap", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  activeScanSignals: z.array(z.object({
    signal: z.enum(["zap-active-scan", "nuclei-dast", "fuzzing", "attack-policy", "baseline", "full-scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["context", "login", "headers", "cookies", "token", "user", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["nuclei-template", "workflow", "severity", "tags", "exclude", "signature", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["rate-limit", "scope", "timeout", "concurrency", "safe-methods", "allowlist", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "sarif", "junit", "html", "markdown", "artifact-upload", "unknown"]),
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
    signal: z.enum(["zap", "nuclei", "securecodebox", "playwright", "unknown"]),
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

export const ThreatModelReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  threatModelSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["pytm", "threat-dragon", "threagile", "diagram", "workflow", "package-script", "readme", "unknown"]),
    modelCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    dataFlowCount: z.number().int().nonnegative(),
    boundaryCount: z.number().int().nonnegative(),
    threatCount: z.number().int().nonnegative(),
    strideCount: z.number().int().nonnegative(),
    mitigationCount: z.number().int().nonnegative(),
    riskTrackingCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["pytm", "threat-dragon", "threagile", "open-threat-model", "json-model", "yaml-model", "python-model", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  diagramSignals: z.array(z.object({
    signal: z.enum(["dfd", "sequence", "data-flow-diagram", "attack-tree", "trust-boundary", "component", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["actor", "process", "datastore", "technical-asset", "data-asset", "communication-link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundarySignals: z.array(z.object({
    signal: z.enum(["trust-boundary", "out-of-scope", "scope", "shared-runtime", "in-scope", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  threatSignals: z.array(z.object({
    signal: z.enum(["stride", "spoofing", "tampering", "repudiation", "information-disclosure", "denial-of-service", "elevation-of-privilege", "abuse-case", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskSignals: z.array(z.object({
    signal: z.enum(["risk-rating", "severity", "mitigation", "risk-tracking", "accepted-risk", "false-positive", "questions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["report", "json", "markdown", "pdf", "diagram-output", "excel", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "scheduled-run", "pull-request", "docker", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pytm", "threat-dragon", "threagile", "graphviz", "unknown"]),
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

export const ScorecardReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  aggregateScore: z.number().min(0).max(10),
  checks: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(10).nullable(),
    status: z.enum(["pass", "partial", "fail", "unknown"]),
    risk: z.enum(["critical", "high", "medium", "low", "unknown"]),
    evidence: z.string(),
    remediation: z.string(),
    relatedHref: z.string()
  })),
  categoryScores: z.array(z.object({
    category: z.enum(["source", "build", "dependency", "security", "maintenance"]),
    score: z.number().min(0).max(10).nullable(),
    explanation: z.string(),
    relatedHref: z.string()
  })),
  policyFindings: z.array(z.object({
    policy: z.string(),
    result: z.enum(["pass", "review", "fail"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    checkName: z.string(),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  structuredResults: z.array(z.object({
    checkName: z.string(),
    probe: z.string(),
    outcome: z.enum(["positive", "negative", "unknown"]),
    evidence: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ProvenanceReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  artifactSignals: z.array(z.object({
    artifact: z.string(),
    artifactType: z.enum(["source-snapshot", "package", "container", "sbom", "release", "blob"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  signatureSignals: z.array(z.object({
    material: z.enum(["signature", "bundle", "certificate", "public-key", "trusted-root", "transparency-log"]),
    readiness: z.enum(["present", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  attestationSignals: z.array(z.object({
    predicateType: z.enum(["slsaprovenance", "spdx", "cyclonedx", "vuln", "custom"]),
    readiness: z.enum(["available", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identityRequirements: z.array(z.object({
    requirement: z.string(),
    status: z.enum(["known", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  verificationCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AdvisoryReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  packageQueryTargets: z.array(z.object({
    name: z.string(),
    ecosystem: z.string(),
    version: z.string().nullable(),
    purl: z.string().nullable(),
    sourceType: z.enum(["manifest", "lockfile", "sbom", "container", "source"]),
    readiness: z.enum(["queryable", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lockfileSignals: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.string(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial"]),
    sourceHref: z.string()
  })),
  advisorySources: z.array(z.object({
    source: z.enum(["OSV.dev", "deps.dev", "GitHub-Advisory-Database", "RustSec", "NVD", "local-offline-db"]),
    readiness: z.enum(["external", "ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policyControls: z.array(z.object({
    control: z.enum(["ignored-vulns", "package-overrides", "license-allowlist", "offline-db", "call-analysis", "guided-remediation"]),
    status: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultModel: z.array(z.object({
    field: z.string(),
    purpose: z.string(),
    readiness: z.enum(["ready", "partial", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  remediationQueue: z.array(z.object({
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

export const VexReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  productTargets: z.array(z.object({
    productId: z.string(),
    productType: z.enum(["package", "container", "source", "sbom"]),
    version: z.string().nullable(),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  vulnerabilityInputs: z.array(z.object({
    source: z.enum(["advisory-query", "security-readiness", "scanner-sarif", "manual-cve", "attestation"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  statusMatrix: z.array(z.object({
    status: z.enum(["affected", "not_affected", "fixed", "under_investigation"]),
    requiredEvidence: z.string(),
    allowedFields: z.array(z.string()),
    filtersScannerResult: z.boolean(),
    readiness: z.enum(["ready", "partial", "external"])
  })),
  justificationCatalog: z.array(z.object({
    justification: z.string(),
    useWhen: z.string(),
    requiresImpactStatement: z.boolean(),
    readiness: z.enum(["ready", "partial", "external"])
  })),
  statementDrafts: z.array(z.object({
    vulnerabilityId: z.string(),
    productIds: z.array(z.string()),
    status: z.enum(["affected", "not_affected", "fixed", "under_investigation"]),
    justification: z.string().nullable(),
    needsHumanReview: z.boolean(),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  documentWorkflow: z.array(z.object({
    step: z.enum(["create", "add", "merge", "attest", "filter", "generate"]),
    command: z.string(),
    purpose: z.string(),
    readiness: z.enum(["ready", "partial", "external"])
  })),
  attestationReadiness: z.array(z.object({
    requirement: z.enum(["subject-digest", "dsse-envelope", "signature", "transparency-log", "product-match"]),
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
  learnerNextSteps: z.array(z.string())
});

export const PolicyGateReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  policyDocuments: z.array(z.object({
    filePath: z.string(),
    packageName: z.string().nullable(),
    ruleCount: z.number().int().nonnegative(),
    testRuleCount: z.number().int().nonnegative(),
    decisionRules: z.array(z.string()),
    readiness: z.enum(["ready", "partial", "missing"]),
    sourceHref: z.string()
  })),
  inputDocuments: z.array(z.object({
    filePath: z.string(),
    documentType: z.enum(["input", "data", "manifest", "iac", "schema", "unknown"]),
    readiness: z.enum(["ready", "partial"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  gateQueries: z.array(z.object({
    query: z.string(),
    purpose: z.string(),
    readiness: z.enum(["ready", "partial", "external"]),
    relatedHref: z.string()
  })),
  testCoverage: z.array(z.object({
    target: z.enum(["rego-policy-tests", "compile-check", "schema-validation", "decision-fixtures"]),
    status: z.enum(["covered", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  bundleReadiness: z.array(z.object({
    requirement: z.enum(["policy-files", "data-files", "entrypoints", "manifest", "signature", "capabilities"]),
    status: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  decisionOutputs: z.array(z.object({
    field: z.string(),
    purpose: z.string(),
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

export type ProjectActivityReport = z.infer<typeof ProjectActivityReportSchema>;
export type SbomReport = z.infer<typeof SbomReportSchema>;
export type SecurityReadinessReport = z.infer<typeof SecurityReadinessReportSchema>;
export type SastReadinessReport = z.infer<typeof SastReadinessReportSchema>;
export type DastReadinessReport = z.infer<typeof DastReadinessReportSchema>;
export type ThreatModelReadinessReport = z.infer<typeof ThreatModelReadinessReportSchema>;
export type ScorecardReport = z.infer<typeof ScorecardReportSchema>;
export type ProvenanceReport = z.infer<typeof ProvenanceReportSchema>;
export type AdvisoryReport = z.infer<typeof AdvisoryReportSchema>;
export type VexReport = z.infer<typeof VexReportSchema>;
export type PolicyGateReport = z.infer<typeof PolicyGateReportSchema>;
