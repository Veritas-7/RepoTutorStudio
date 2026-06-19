import type { CiCdReport, CoverageReadinessReport, MutationTestingReadinessReport, TypecheckReadinessReport, UnitTestReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

function firstMatch(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match?.[1] ?? null;
}

export async function buildCiCdReport(walk: WalkResult): Promise<CiCdReport> {
  const sourceFiles = await ciCdSourceFiles(walk);
  const workflowFiles = ciCdWorkflowFiles(sourceFiles);
  const triggerSignals = ciCdTriggerSignals(sourceFiles);
  const jobSignals = ciCdJobSignals(sourceFiles);
  const securitySignals = ciCdSecuritySignals(sourceFiles, workflowFiles);
  const deliverySignals = ciCdDeliverySignals(sourceFiles);
  const platformSignals = ciCdPlatformSignals(sourceFiles);
  const hasWorkflow = workflowFiles.length > 0;
  const hasPushOrPr = triggerSignals.some((item) => ["push", "pull_request"].includes(item.trigger) && item.readiness === "ready");
  const hasJobs = jobSignals.some((item) => item.signal === "jobs" && item.readiness === "ready")
    && jobSignals.some((item) => item.signal === "runs-on" && item.readiness === "ready");
  const hasPermissions = securitySignals.some((item) => item.signal === "permissions" && item.readiness === "ready");
  const hasDeployment = deliverySignals.some((item) => ["deployment", "release", "package-publish"].includes(item.signal) && item.readiness === "ready");
  const hasEnvironment = securitySignals.some((item) => item.signal === "environment" && item.readiness === "ready")
    || deliverySignals.some((item) => item.signal === "environment-protection" && item.readiness === "ready");
  const hasConcurrency = deliverySignals.some((item) => item.signal === "concurrency" && item.readiness === "ready");
  const hasCacheOrArtifacts = deliverySignals.some((item) => ["cache", "artifact-upload", "artifact-download"].includes(item.signal) && item.readiness === "ready");
  const usesSecrets = securitySignals.some((item) => item.signal === "secrets" && item.readiness === "ready");
  const hasOidc = securitySignals.some((item) => ["id-token-write", "oidc"].includes(item.signal) && item.readiness === "ready");
  const hasPullRequestTarget = securitySignals.some((item) => item.signal === "pull-request-target" && item.readiness === "partial");

  const riskQueue: CiCdReport["riskQueue"] = [];
  if (!hasWorkflow) {
    riskQueue.push({
      priority: "high",
      action: "Add at least one GitHub Actions workflow under .github/workflows before claiming CI/CD readiness.",
      why: "GitHub Actions workflow syntax requires YAML files in .github/workflows; package scripts alone do not prove automation.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (hasWorkflow && !hasPushOrPr) {
    riskQueue.push({
      priority: "high",
      action: "Trigger CI on push or pull_request events.",
      why: "GitHub's CI guidance centers on building and testing code when commits or pull requests enter the shared repository.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (hasWorkflow && !hasJobs) {
    riskQueue.push({
      priority: "high",
      action: "Declare jobs with runs-on targets and executable steps.",
      why: "Workflow files are only useful when they define jobs that can run on GitHub-hosted or self-hosted runners.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (hasWorkflow && !hasPermissions) {
    riskQueue.push({
      priority: "medium",
      action: "Set explicit workflow or job permissions for GITHUB_TOKEN.",
      why: "GitHub recommends setting the token permissions needed by the workflow instead of relying on broad defaults.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (hasDeployment && !hasEnvironment) {
    riskQueue.push({
      priority: "medium",
      action: "Use environments or deployment protection rules for deploy jobs.",
      why: "GitHub deployments and environments can require approval, restrict branches, and scope environment secrets before rollout.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (hasDeployment && !hasConcurrency) {
    riskQueue.push({
      priority: "medium",
      action: "Add concurrency groups around deployment workflows.",
      why: "GitHub Actions concurrency prevents overlapping deployments to the same target environment.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (usesSecrets && !hasOidc) {
    riskQueue.push({
      priority: "low",
      action: "Prefer OIDC for cloud deployment credentials where the provider supports it.",
      why: "GitHub's OIDC guidance reduces long-lived cloud secrets and requires explicit trust conditions.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (hasWorkflow && !hasCacheOrArtifacts) {
    riskQueue.push({
      priority: "low",
      action: "Add cache or artifact steps when build outputs, test reports, screenshots, or dependency downloads matter.",
      why: "GitHub Actions distinguishes dependency caching from workflow artifacts that persist data after jobs finish.",
      relatedHref: "html/ci-cd.html"
    });
  }
  if (hasPullRequestTarget) {
    riskQueue.push({
      priority: "high",
      action: "Review pull_request_target workflows for untrusted code checkout and secret exposure.",
      why: "pull_request_target can run with privileged repository context and needs stricter review than ordinary pull_request CI.",
      relatedHref: "html/ci-cd.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: hasWorkflow ? "Run workflow validation and a safe branch CI run before treating this report as CI/CD approval." : "If this repository later adds GitHub Actions, rerun RepoTutor to populate CI/CD readiness.",
    why: "RepoTutor records static GitHub Actions readiness only; it does not execute workflows, validate YAML semantics, or call GitHub APIs.",
    relatedHref: "html/ci-cd.html"
  });

  return {
    summary: `GitHub Actions식 CI/CD readiness report: workflow ${workflowFiles.length}개, trigger signal ${triggerSignals.length}개, job signal ${jobSignals.length}개, delivery signal ${deliverySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "GitHub Actions workflow syntax events jobs permissions GITHUB_TOKEN OIDC cache artifacts concurrency environments deployments",
    workflowFiles,
    triggerSignals,
    jobSignals,
    securitySignals,
    deliverySignals,
    platformSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "gh workflow list", purpose: "List workflows visible to GitHub for the repository." },
      { command: "gh workflow view <workflow.yml>", purpose: "Inspect workflow metadata and dispatchability from GitHub's view." },
      { command: "gh run list --workflow <workflow.yml> --limit 10", purpose: "Check recent run status before trusting the static report." },
      { command: "act -n", purpose: "Dry-run GitHub Actions locally where nektos/act supports the workflow shape." },
      { command: "npx actionlint", purpose: "Validate workflow YAML syntax, expressions, and common GitHub Actions mistakes." },
      { command: "gh run watch", purpose: "Watch a live workflow run after pushing to a safe branch." }
    ],
    learnerNextSteps: [
      "Start with .github/workflows: identify trigger events, job names, runner labels, and the order imposed by needs.",
      "Separate CI jobs that build/test pull requests from CD jobs that deploy or publish artifacts.",
      "Review permissions, secrets, OIDC, environments, and concurrency before treating deploy jobs as safe.",
      "RepoTutor does not execute GitHub Actions or validate YAML semantics; run actionlint and a safe branch workflow before approval."
    ]
  };
}

type CiCdSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function ciCdSourceFiles(walk: WalkResult): Promise<CiCdSourceFile[]> {
  const files: CiCdSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !ciCdInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!ciCdPathSignal(file.relPath) && !ciCdContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function ciCdInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /^\.github\/actions\//i.test(filePath)
    || /^(package\.json|pnpm-workspace\.yaml|turbo\.json|nx\.json|README\.md|action\.ya?ml)$/i.test(base)
    || /(ci|cd|deploy|workflow|release|pipeline|build|test|publish)/i.test(filePath)
    || /\.(ya?ml|json|md|[cm]?[jt]sx?|sh)$/i.test(filePath);
}

function ciCdPathSignal(filePath: string): boolean {
  return /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(github\/actions|workflow|ci|cd|deploy|release|pipeline|publish|action\.ya?ml)/i.test(filePath);
}

function ciCdContentSignal(text: string): boolean {
  return /GitHub Actions|\.github\/workflows|workflow_dispatch|pull_request|repository_dispatch|GITHUB_TOKEN|id-token|actions\/checkout|actions\/cache|upload-artifact|download-artifact|runs-on|concurrency|environment:|gh workflow|actionlint/i.test(text);
}

function ciCdWorkflowFiles(sourceFiles: CiCdSourceFile[]): CiCdReport["workflowFiles"] {
  return sourceFiles
    .filter((source) => /^\.github\/workflows\/.+\.ya?ml$/i.test(source.filePath))
    .slice(0, 120)
    .map((source) => {
      const workflowName = firstMatch(source.text, /^\s*name\s*:\s*(.+)$/im)?.replace(/^["']|["']$/g, "").trim() ?? null;
      const triggerCount = ciCdTriggerCount(source.text);
      const jobCount = ciCdJobCount(source.text);
      return {
        filePath: source.filePath,
        workflowName,
        triggerCount,
        jobCount,
        readiness: triggerCount > 0 && jobCount > 0 ? "ready" : triggerCount > 0 || jobCount > 0 ? "partial" : "missing",
        evidence: `${source.filePath} has ${triggerCount} trigger signal(s) and ${jobCount} job candidate(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function ciCdTriggerCount(text: string): number {
  const triggers = ["push", "pull_request", "workflow_dispatch", "schedule", "repository_dispatch", "workflow_call", "release", "deployment"];
  return triggers.filter((trigger) => new RegExp(`(^|\\n)\\s*${trigger}\\s*:|\\bon\\s*:\\s*\\[[^\\]]*${trigger}|\\bon\\s*:\\s*${trigger}\\b`, "i").test(text)).length;
}

function ciCdJobCount(text: string): number {
  const jobsBlock = text.match(/^jobs\s*:\s*([\s\S]*)/im)?.[1] ?? "";
  const matches = [...jobsBlock.matchAll(/^\s{2}[A-Za-z0-9_-]+\s*:\s*(?:\n|$)/gm)];
  return matches.length;
}

function ciCdTriggerSignals(sourceFiles: CiCdSourceFile[]): CiCdReport["triggerSignals"] {
  const specs: Array<{ trigger: CiCdReport["triggerSignals"][number]["trigger"]; pattern: RegExp; evidence: string }> = [
    { trigger: "push", pattern: /(^|\n)\s*push\s*:|\bon\s*:\s*\[[^\]]*push|\bon\s*:\s*push\b/i, evidence: "push trigger evidence was detected." },
    { trigger: "pull_request", pattern: /(^|\n)\s*pull_request\s*:|\bon\s*:\s*\[[^\]]*pull_request|\bon\s*:\s*pull_request\b/i, evidence: "pull_request trigger evidence was detected." },
    { trigger: "workflow_dispatch", pattern: /workflow_dispatch/i, evidence: "manual workflow_dispatch trigger evidence was detected." },
    { trigger: "schedule", pattern: /(^|\n)\s*schedule\s*:|\bcron\s*:/i, evidence: "scheduled trigger evidence was detected." },
    { trigger: "repository_dispatch", pattern: /repository_dispatch/i, evidence: "repository_dispatch trigger evidence was detected." },
    { trigger: "workflow_call", pattern: /workflow_call/i, evidence: "reusable workflow_call trigger evidence was detected." },
    { trigger: "release", pattern: /(^|\n)\s*release\s*:|\bon\s*:\s*\[[^\]]*release|\bon\s*:\s*release\b/i, evidence: "release trigger evidence was detected." },
    { trigger: "deployment", pattern: /(^|\n)\s*deployment(_status)?\s*:|\bon\s*:\s*\[[^\]]*deployment/i, evidence: "deployment trigger evidence was detected." }
  ];
  return ciCdSignalFromSpecs(sourceFiles, specs, "trigger", "trigger");
}

function ciCdJobSignals(sourceFiles: CiCdSourceFile[]): CiCdReport["jobSignals"] {
  const specs: Array<{ signal: CiCdReport["jobSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "jobs", pattern: /(^|\n)\s*jobs\s*:/i, evidence: "jobs block evidence was detected." },
    { signal: "runs-on", pattern: /(^|\n)\s*runs-on\s*:/i, evidence: "runner selection evidence was detected." },
    { signal: "steps", pattern: /(^|\n)\s*steps\s*:/i, evidence: "job steps evidence was detected." },
    { signal: "uses", pattern: /(^|\n)\s*uses\s*:/i, evidence: "action or reusable workflow usage evidence was detected." },
    { signal: "run", pattern: /(^|\n)\s*run\s*:/i, evidence: "shell command step evidence was detected." },
    { signal: "needs", pattern: /(^|\n)\s*needs\s*:/i, evidence: "job dependency ordering evidence was detected." },
    { signal: "matrix", pattern: /strategy\s*:|matrix\s*:/i, evidence: "matrix strategy evidence was detected." },
    { signal: "services", pattern: /(^|\n)\s*services\s*:/i, evidence: "service container evidence was detected." },
    { signal: "container", pattern: /(^|\n)\s*container\s*:/i, evidence: "job container evidence was detected." },
    { signal: "defaults", pattern: /(^|\n)\s*defaults\s*:/i, evidence: "workflow/job defaults evidence was detected." },
    { signal: "timeout-minutes", pattern: /timeout-minutes\s*:/i, evidence: "timeout control evidence was detected." }
  ];
  return ciCdSignalFromSpecs(sourceFiles, specs, "job", "signal");
}

function ciCdSecuritySignals(sourceFiles: CiCdSourceFile[], workflowFiles: CiCdReport["workflowFiles"]): CiCdReport["securitySignals"] {
  const specs: Array<{ signal: CiCdReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "permissions", pattern: /(^|\n)\s*permissions\s*:/i, evidence: "explicit GITHUB_TOKEN permissions evidence was detected." },
    { signal: "contents-read", pattern: /contents\s*:\s*read/i, evidence: "contents: read permission evidence was detected." },
    { signal: "id-token-write", pattern: /id-token\s*:\s*write/i, evidence: "OIDC id-token: write permission evidence was detected." },
    { signal: "secrets", pattern: /secrets\.|secrets\s*:|GITHUB_TOKEN|GH_TOKEN/i, evidence: "secrets or GITHUB_TOKEN usage evidence was detected." },
    { signal: "environment", pattern: /(^|\n)\s*environment\s*:/i, evidence: "environment-scoped job evidence was detected." },
    { signal: "pull-request-target", pattern: /pull_request_target/i, evidence: "privileged pull_request_target trigger evidence was detected." },
    { signal: "oidc", pattern: /OIDC|OpenID Connect|id-token|aws-actions\/configure-aws-credentials|azure\/login|google-github-actions\/auth/i, evidence: "OIDC authentication evidence was detected." }
  ];
  const rows = ciCdSignalFromSpecs(sourceFiles, specs, "security", "signal") as CiCdReport["securitySignals"];
  const usesLines = sourceFiles.flatMap((source) => [...source.text.matchAll(/^\s*uses\s*:\s*([^\s#]+)/gim)].map((match) => ({ source, value: match[1] })));
  const pinnedCount = usesLines.filter((item) => /@[0-9a-f]{40}$/i.test(item.value)).length;
  rows.push({
    signal: "pinned-actions",
    readiness: usesLines.length === 0 ? (workflowFiles.length > 0 ? "external" : "missing") : pinnedCount === usesLines.length ? "ready" : "partial",
    evidence: usesLines.length === 0 ? "action pinning evidence was not detected." : `${pinnedCount}/${usesLines.length} uses references appear pinned to full commit SHAs.`,
    relatedHref: usesLines[0]?.source.sourceHref ?? "html/ci-cd.html"
  });
  return rows.map((item) => item.signal === "pull-request-target" && item.readiness === "ready" ? { ...item, readiness: "partial" } : item);
}

function ciCdDeliverySignals(sourceFiles: CiCdSourceFile[]): CiCdReport["deliverySignals"] {
  const specs: Array<{ signal: CiCdReport["deliverySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cache", pattern: /actions\/cache|cache-dependency-path|setup-node[\s\S]{0,200}cache\s*:|dependency caching/i, evidence: "dependency cache evidence was detected." },
    { signal: "artifact-upload", pattern: /actions\/upload-artifact|upload-artifact/i, evidence: "artifact upload evidence was detected." },
    { signal: "artifact-download", pattern: /actions\/download-artifact|download-artifact/i, evidence: "artifact download evidence was detected." },
    { signal: "concurrency", pattern: /(^|\n)\s*concurrency\s*:/i, evidence: "workflow or job concurrency evidence was detected." },
    { signal: "environment-protection", pattern: /environment\s*:|required reviewers|deployment protection/i, evidence: "environment or deployment protection evidence was detected." },
    { signal: "deployment", pattern: /deploy|deployment|environment\s*:/i, evidence: "deployment workflow evidence was detected." },
    { signal: "release", pattern: /release|gh release|semantic-release|release-please|changesets/i, evidence: "release workflow evidence was detected." },
    { signal: "package-publish", pattern: /npm publish|pnpm publish|docker\/build-push-action|ghcr\.io|packages:\s*write|publish/i, evidence: "package publish evidence was detected." }
  ];
  return ciCdSignalFromSpecs(sourceFiles, specs, "delivery", "signal");
}

function ciCdPlatformSignals(sourceFiles: CiCdSourceFile[]): CiCdReport["platformSignals"] {
  const specs: Array<{ signal: CiCdReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-hosted-runner", pattern: /ubuntu-latest|macos-latest|windows-latest/i, evidence: "GitHub-hosted runner label evidence was detected." },
    { signal: "self-hosted-runner", pattern: /self-hosted/i, evidence: "self-hosted runner label evidence was detected." },
    { signal: "linux", pattern: /ubuntu-|linux/i, evidence: "Linux runner evidence was detected." },
    { signal: "macos", pattern: /macos-/i, evidence: "macOS runner evidence was detected." },
    { signal: "windows", pattern: /windows-/i, evidence: "Windows runner evidence was detected." },
    { signal: "node-setup", pattern: /actions\/setup-node|node-version|pnpm\/action-setup|npm ci|pnpm install/i, evidence: "Node setup evidence was detected." },
    { signal: "python-setup", pattern: /actions\/setup-python|python-version|pip install|uv sync/i, evidence: "Python setup evidence was detected." },
    { signal: "docker-build", pattern: /docker\/build-push-action|docker build|buildx|Dockerfile/i, evidence: "Docker build evidence was detected." }
  ];
  return ciCdSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function ciCdSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CiCdSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/ci-cd.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildUnitTestReport(walk: WalkResult): Promise<UnitTestReport> {
  const sourceFiles = await unitTestSourceFiles(walk);
  const testFiles = unitTestFiles(sourceFiles);
  const configFiles = unitTestConfigFiles(sourceFiles);
  const assertionSignals = unitTestAssertionSignals(sourceFiles);
  const mockSignals = unitTestMockSignals(sourceFiles);
  const coverageSignals = unitTestCoverageSignals(sourceFiles);
  const environmentSignals = unitTestEnvironmentSignals(sourceFiles);
  const reportingSignals = unitTestReportingSignals(sourceFiles);
  const hasTestFiles = testFiles.length > 0;
  const hasConfig = configFiles.some((item) => item.readiness === "ready" || item.readiness === "partial");
  const hasAssertions = assertionSignals.some((item) => item.readiness === "ready");
  const hasMocks = mockSignals.some((item) => ["vi-fn", "vi-mock", "vi-spyOn", "module-mock", "request-mock", "fake-timers"].includes(item.signal) && item.readiness === "ready");
  const hasMockReset = mockSignals.some((item) => item.signal === "mock-reset" && item.readiness === "ready");
  const hasCoverage = coverageSignals.some((item) => item.readiness === "ready");
  const hasDomEnvironment = environmentSignals.some((item) => ["jsdom", "happy-dom", "browser-mode"].includes(item.signal) && item.readiness === "ready");
  const hasDomLookingTests = sourceFiles.some((source) => unitTestPathSignal(source.filePath) && /\b(document|window|HTMLElement|@testing-library|render\s*\()/i.test(source.text));
  const hasReporter = reportingSignals.some((item) => ["reporter", "junit", "json", "html", "ui"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: UnitTestReport["riskQueue"] = [];
  if (!hasTestFiles) {
    riskQueue.push({
      priority: "high",
      action: "Add focused unit or component test files before claiming test readiness.",
      why: "Vitest discovers files such as *.test.ts, *.spec.ts, tests/, and __tests__/; this scan did not find test files.",
      relatedHref: "html/unit-tests.html"
    });
  }
  if (!hasConfig) {
    riskQueue.push({
      priority: "medium",
      action: "Add a test script or Vitest/Vite test configuration.",
      why: "A package test script, vitest.config file, or Vite test block makes the expected runner and environment explicit.",
      relatedHref: "html/unit-tests.html"
    });
  }
  if (hasTestFiles && !hasAssertions) {
    riskQueue.push({
      priority: "medium",
      action: "Add explicit assertions to test files.",
      why: "Vitest can run test bodies without meaningful checks; expect/assert and matcher usage proves behavior is verified.",
      relatedHref: "html/unit-tests.html"
    });
  }
  if (hasMocks && !hasMockReset) {
    riskQueue.push({
      priority: "low",
      action: "Reset or restore mocks between tests.",
      why: "Vitest mocking guidance warns that shared mocks, spies, and fake timers can leak state across tests.",
      relatedHref: "html/unit-tests.html"
    });
  }
  if (!hasCoverage) {
    riskQueue.push({
      priority: "medium",
      action: "Add coverage reporting for unit tests.",
      why: "Vitest supports v8 and istanbul coverage providers, but this repository has no static coverage signal.",
      relatedHref: "html/unit-tests.html"
    });
  }
  if (hasDomLookingTests && !hasDomEnvironment) {
    riskQueue.push({
      priority: "medium",
      action: "Configure jsdom, happy-dom, or browser mode for DOM-oriented tests.",
      why: "Vitest's default environment is Node; DOM APIs need an explicit compatible environment.",
      relatedHref: "html/unit-tests.html"
    });
  }
  if (hasTestFiles && !hasReporter) {
    riskQueue.push({
      priority: "low",
      action: "Add machine-readable reporters when CI or dashboards need test results.",
      why: "Vitest can emit JUnit, JSON, HTML, and UI outputs, but no static reporting signal was found.",
      relatedHref: "html/unit-tests.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: hasTestFiles ? "Run the unit test suite before treating this static report as approval." : "If this repository later adds Vitest tests, rerun RepoTutor to populate unit test readiness.",
    why: "RepoTutor records static unit-test readiness only; it does not execute tests, measure coverage, update snapshots, or validate jsdom/browser behavior.",
    relatedHref: "html/unit-tests.html"
  });

  return {
    summary: `Vitest-style unit test readiness report: test files ${testFiles.length}개, config files ${configFiles.length}개, assertion signals ${assertionSignals.length}개, coverage signals ${coverageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Vitest test files config coverage v8 istanbul snapshots mocks jsdom happy-dom browser mode projects reporters",
    testFiles,
    configFiles,
    assertionSignals,
    mockSignals,
    coverageSignals,
    environmentSignals,
    reportingSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx vitest run", purpose: "Run unit tests once in CI-style run mode." },
      { command: "npx vitest --watch", purpose: "Use watch mode while developing tests locally." },
      { command: "npx vitest run --coverage", purpose: "Generate coverage with the configured v8 or istanbul provider." },
      { command: "npx vitest --ui", purpose: "Open Vitest UI for interactive test inspection." },
      { command: "npx vitest --reporter=junit", purpose: "Emit CI-friendly test results for dashboards or annotations." },
      { command: "npx vitest --update", purpose: "Update snapshots intentionally after reviewing behavior changes." }
    ],
    learnerNextSteps: [
      "Start with package.json and vitest.config: identify the test command, environment, coverage provider, setup files, and reporter outputs.",
      "Open each test file and separate arrange/act/assert lines, mock setup, fixture data, and snapshot assertions.",
      "Check whether DOM or browser tests declare jsdom, happy-dom, or browser mode instead of relying on Node defaults.",
      "RepoTutor does not execute tests or measure real coverage; run Vitest before treating this as test approval."
    ]
  };
}

type UnitTestSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function unitTestSourceFiles(walk: WalkResult): Promise<UnitTestSourceFile[]> {
  const files: UnitTestSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !unitTestInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!unitTestPathSignal(file.relPath) && !unitTestContentSignal(text) && path.basename(file.relPath) !== "package.json") continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function unitTestInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(__tests__|tests?|spec|fixtures?|mocks?|__mocks__|snapshots?)\//i.test(filePath)
    || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(base)
    || /\.snap$/i.test(base)
    || /^vitest\.config\.[cm]?[jt]s$/i.test(base)
    || /^vitest\.workspace\.[cm]?[jt]s(on)?$/i.test(base)
    || /^vite\.config\.[cm]?[jt]s$/i.test(base)
    || /^(package\.json|pnpm-workspace\.yaml|README\.md)$/i.test(base)
    || /(test|spec|vitest|jest|mocha|ava|coverage|snapshot|setupTests|setup-tests)/i.test(filePath)
    || /\.(json|md|ya?ml|[cm]?[jt]sx?)$/i.test(filePath);
}

function unitTestPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(__tests__|tests?|spec|fixtures?|mocks?|__mocks__|snapshots?)\//i.test(filePath)
    || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(base)
    || /\.snap$/i.test(base)
    || /^vitest\.(config|workspace)\./i.test(base)
    || /^vite\.config\./i.test(base)
    || /(vitest|jest|mocha|ava|coverage|snapshot|setupTests|setup-tests)/i.test(filePath);
}

function unitTestContentSignal(text: string): boolean {
  return /\b(vitest|jest|mocha|ava|node:test|describe\s*\(|it\s*\(|test\s*\(|expect\s*\(|assert\.|vi\.|toMatchSnapshot|jsdom|happy-dom|coverage|@testing-library)\b/i.test(text);
}

function unitTestFiles(sourceFiles: UnitTestSourceFile[]): UnitTestReport["testFiles"] {
  return sourceFiles
    .filter((source) => unitTestPathSignal(source.filePath) && (/\.(test|spec)\.[cm]?[jt]sx?$/i.test(path.basename(source.filePath)) || /(^|\/)(__tests__|tests?|spec)\//i.test(source.filePath)))
    .slice(0, 160)
    .map((source) => {
      const testCount = countMatches(source.text, /\b(describe|it|test)\s*\(/g);
      const assertionCount = unitTestAssertionCount(source.text);
      return {
        filePath: source.filePath,
        framework: inferUnitTestFramework(source),
        testCount,
        assertionCount,
        readiness: testCount > 0 && assertionCount > 0 ? "ready" : testCount > 0 || assertionCount > 0 ? "partial" : "missing",
        evidence: `${source.filePath} has ${testCount} test block candidate(s) and ${assertionCount} assertion candidate(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function unitTestConfigFiles(sourceFiles: UnitTestSourceFile[]): UnitTestReport["configFiles"] {
  return sourceFiles
    .filter((source) => unitTestConfigType(source.filePath, source.text) !== "unknown" || path.basename(source.filePath) === "package.json")
    .slice(0, 120)
    .map((source) => {
      const configType = unitTestConfigType(source.filePath, source.text);
      const hasTestScript = path.basename(source.filePath) === "package.json" && /"scripts"\s*:\s*\{[\s\S]*"test"\s*:\s*"[^"]+"/i.test(source.text);
      const readiness = configType === "package-script" ? (hasTestScript ? "ready" : "missing") : configType === "unknown" ? "missing" : "ready";
      return {
        filePath: source.filePath,
        configType: configType === "unknown" && path.basename(source.filePath) === "package.json" ? "package-script" : configType,
        readiness,
        evidence: configType === "package-script" || path.basename(source.filePath) === "package.json"
          ? (hasTestScript ? `${source.filePath} declares a package test script.` : `${source.filePath} does not declare a package test script.`)
          : `${source.filePath} matches ${configType} static configuration.`,
        sourceHref: source.sourceHref
      };
    });
}

function unitTestConfigType(filePath: string, text: string): UnitTestReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath);
  if (/^vitest\.config\.[cm]?[jt]s$/i.test(base)) return "vitest-config";
  if (/^vite\.config\.[cm]?[jt]s$/i.test(base) && /\btest\s*:/i.test(text)) return "vite-config-test";
  if (base === "package.json") return "package-script";
  if (/^vitest\.workspace\./i.test(base) || path.basename(filePath) === "pnpm-workspace.yaml") return "workspace";
  if (/(setupTests|setup-tests|test-setup|setup\.[cm]?[jt]s)/i.test(filePath)) return "setup-file";
  return "unknown";
}

function inferUnitTestFramework(source: UnitTestSourceFile): UnitTestReport["testFiles"][number]["framework"] {
  if (/vitest|from\s+["']vitest["']|vi\./i.test(source.text)) return "vitest";
  if (/jest|from\s+["']@jest\/globals["']/i.test(source.text)) return "jest";
  if (/mocha|from\s+["']mocha["']/i.test(source.text)) return "mocha";
  if (/from\s+["']ava["']|\bava\b/i.test(source.text)) return "ava";
  if (/node:test|from\s+["']node:test["']/i.test(source.text)) return "node-test";
  return "unknown";
}

function unitTestAssertionCount(text: string): number {
  return countMatches(text, /\bexpect\s*\(|\bassert\.|\.to(Equal|Be|StrictEqual|MatchSnapshot|Throw|Have)|\bthrows\s*\(|\.resolves\b|\.rejects\b/g);
}

function unitTestAssertionSignals(sourceFiles: UnitTestSourceFile[]): UnitTestReport["assertionSignals"] {
  const specs: Array<{ assertion: UnitTestReport["assertionSignals"][number]["assertion"]; pattern: RegExp; evidence: string }> = [
    { assertion: "expect", pattern: /\bexpect\s*\(/i, evidence: "expect assertion evidence was detected." },
    { assertion: "assert", pattern: /\bassert\./i, evidence: "assert API evidence was detected." },
    { assertion: "toEqual", pattern: /\.to(Equal|StrictEqual)\s*\(/i, evidence: "deep equality matcher evidence was detected." },
    { assertion: "toBe", pattern: /\.to(Be|BeTruthy|BeFalsy|BeDefined|BeNull|BeUndefined)\s*\(/i, evidence: "identity/truthiness matcher evidence was detected." },
    { assertion: "toMatchSnapshot", pattern: /toMatch(Inline)?Snapshot\s*\(/i, evidence: "snapshot assertion evidence was detected." },
    { assertion: "throws", pattern: /toThrow\s*\(|\bthrows\s*\(/i, evidence: "throw assertion evidence was detected." },
    { assertion: "resolves", pattern: /\.resolves\b/i, evidence: "async resolves assertion evidence was detected." },
    { assertion: "rejects", pattern: /\.rejects\b/i, evidence: "async rejects assertion evidence was detected." },
    { assertion: "custom-matcher", pattern: /expect\.extend|toHave[A-Z][A-Za-z]+\s*\(/i, evidence: "custom matcher-style evidence was detected." }
  ];
  return unitTestSignalFromSpecs(sourceFiles, specs, "assertion", "assertion");
}

function unitTestMockSignals(sourceFiles: UnitTestSourceFile[]): UnitTestReport["mockSignals"] {
  const specs: Array<{ signal: UnitTestReport["mockSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vi-fn", pattern: /\bvi\.fn\s*\(/i, evidence: "vi.fn mock evidence was detected." },
    { signal: "vi-mock", pattern: /\bvi\.mock\s*\(/i, evidence: "vi.mock module mock evidence was detected." },
    { signal: "vi-spyOn", pattern: /\bvi\.spyOn\s*\(/i, evidence: "vi.spyOn spy evidence was detected." },
    { signal: "fake-timers", pattern: /useFakeTimers|setSystemTime|advanceTimers/i, evidence: "fake timer evidence was detected." },
    { signal: "mock-reset", pattern: /clearAllMocks|resetAllMocks|restoreAllMocks|mockReset|mockRestore|afterEach/i, evidence: "mock reset or cleanup evidence was detected." },
    { signal: "fixture-data", pattern: /(^|\/)(fixtures?|__fixtures__)\//i, evidence: "fixture path evidence was detected." },
    { signal: "module-mock", pattern: /__mocks__|mockImplementation|mockResolvedValue|mockRejectedValue/i, evidence: "module mock behavior evidence was detected." },
    { signal: "request-mock", pattern: /msw|Mock Service Worker|fetchMock|nock|mock.*request|request.*mock/i, evidence: "request mocking evidence was detected." }
  ];
  return unitTestSignalFromSpecs(sourceFiles, specs, "mock", "signal");
}

function unitTestCoverageSignals(sourceFiles: UnitTestSourceFile[]): UnitTestReport["coverageSignals"] {
  const specs: Array<{ signal: UnitTestReport["coverageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "coverage-enabled", pattern: /--coverage|coverage\s*:\s*\{[\s\S]{0,300}enabled\s*:\s*true/i, evidence: "coverage enablement evidence was detected." },
    { signal: "coverage-provider-v8", pattern: /@vitest\/coverage-v8|provider\s*:\s*["']v8["']/i, evidence: "v8 coverage provider evidence was detected." },
    { signal: "coverage-provider-istanbul", pattern: /@vitest\/coverage-istanbul|provider\s*:\s*["']istanbul["']/i, evidence: "istanbul coverage provider evidence was detected." },
    { signal: "coverage-include", pattern: /coverage\s*:\s*\{[\s\S]{0,600}include\s*:/i, evidence: "coverage include pattern evidence was detected." },
    { signal: "coverage-exclude", pattern: /coverage\s*:\s*\{[\s\S]{0,600}exclude\s*:/i, evidence: "coverage exclude pattern evidence was detected." },
    { signal: "coverage-thresholds", pattern: /thresholds\s*:\s*\{|lines\s*:\s*\d+|branches\s*:\s*\d+|functions\s*:\s*\d+/i, evidence: "coverage threshold evidence was detected." },
    { signal: "coverage-reporters", pattern: /reporter(s)?\s*:\s*\[?[^\n\]]*(text|json|html|lcov|cobertura)/i, evidence: "coverage reporter evidence was detected." },
    { signal: "coverage-script", pattern: /"[^"]*coverage[^"]*"\s*:\s*"[^"]*vitest[^"]*--coverage/i, evidence: "package coverage script evidence was detected." }
  ];
  return unitTestSignalFromSpecs(sourceFiles, specs, "coverage", "signal");
}

function unitTestEnvironmentSignals(sourceFiles: UnitTestSourceFile[]): UnitTestReport["environmentSignals"] {
  const specs: Array<{ signal: UnitTestReport["environmentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "node", pattern: /environment\s*:\s*["']node["']|node:test|process\.env/i, evidence: "Node environment evidence was detected." },
    { signal: "jsdom", pattern: /environment\s*:\s*["']jsdom["']|@vitest-environment\s+jsdom|jsdom/i, evidence: "jsdom environment evidence was detected." },
    { signal: "happy-dom", pattern: /environment\s*:\s*["']happy-dom["']|@vitest-environment\s+happy-dom|happy-dom/i, evidence: "happy-dom environment evidence was detected." },
    { signal: "browser-mode", pattern: /browser\s*:\s*\{|browser\.enabled|@vitest\/browser|playwright/i, evidence: "browser mode evidence was detected." },
    { signal: "globals", pattern: /globals\s*:\s*true/i, evidence: "globals option evidence was detected." },
    { signal: "setup-files", pattern: /setupFiles\s*:/i, evidence: "setupFiles evidence was detected." },
    { signal: "pool", pattern: /pool\s*:\s*["'](threads|forks|vmThreads|vmForks)["']/i, evidence: "pool selection evidence was detected." },
    { signal: "isolate", pattern: /isolate\s*:\s*(true|false)/i, evidence: "isolate option evidence was detected." },
    { signal: "projects", pattern: /projects\s*:\s*\[|test\.projects|defineProject/i, evidence: "project configuration evidence was detected." },
    { signal: "workspace", pattern: /vitest\.workspace|workspace\s*:/i, evidence: "workspace evidence was detected." },
    { signal: "typecheck", pattern: /typecheck\s*:\s*\{|--typecheck|expectTypeOf|assertType/i, evidence: "typecheck test evidence was detected." }
  ];
  return unitTestSignalFromSpecs(sourceFiles, specs, "environment", "signal");
}

function unitTestReportingSignals(sourceFiles: UnitTestSourceFile[]): UnitTestReport["reportingSignals"] {
  const specs: Array<{ signal: UnitTestReport["reportingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "watch", pattern: /vitest\s+(--watch|watch)|watch\s*:\s*true/i, evidence: "watch mode evidence was detected." },
    { signal: "run", pattern: /vitest\s+run|CI\s*=\s*true/i, evidence: "run mode evidence was detected." },
    { signal: "ui", pattern: /@vitest\/ui|vitest\s+--ui|\bui\s*:\s*true/i, evidence: "Vitest UI evidence was detected." },
    { signal: "reporter", pattern: /reporter(s)?\s*:/i, evidence: "reporter config evidence was detected." },
    { signal: "junit", pattern: /junit/i, evidence: "JUnit reporter evidence was detected." },
    { signal: "json", pattern: /json\s*(?:reporter|output|summary)|reporter(s)?\s*:\s*\[?[^\n\]]*json/i, evidence: "JSON reporter evidence was detected." },
    { signal: "html", pattern: /html\s*(?:reporter|output)|reporter(s)?\s*:\s*\[?[^\n\]]*html/i, evidence: "HTML reporter evidence was detected." },
    { signal: "snapshot-update", pattern: /--update|\b-u\b|toMatch(Inline)?Snapshot/i, evidence: "snapshot update or assertion evidence was detected." },
    { signal: "filtering", pattern: /--grep|--testNamePattern|\.only\s*\(|\.skip\s*\(/i, evidence: "test filtering evidence was detected." },
    { signal: "sharding", pattern: /--shard|shard\s*:/i, evidence: "test sharding evidence was detected." },
    { signal: "benchmark", pattern: /bench\s*\(|\.bench\.|vitest\s+bench|@vitest\/bench/i, evidence: "benchmark evidence was detected." }
  ];
  return unitTestSignalFromSpecs(sourceFiles, specs, "reporting", "signal");
}

function unitTestSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: UnitTestSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/unit-tests.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildCoverageReadinessReport(walk: WalkResult): Promise<CoverageReadinessReport> {
  const sourceFiles = await coverageReadinessSourceFiles(walk);
  const coverageSetups = coverageReadinessSetups(sourceFiles);
  const instrumentationSignals = coverageReadinessInstrumentationSignals(sourceFiles);
  const scopeSignals = coverageReadinessScopeSignals(sourceFiles);
  const thresholdSignals = coverageReadinessThresholdSignals(sourceFiles);
  const reportSignals = coverageReadinessReportSignals(sourceFiles);
  const ciUploadSignals = coverageReadinessCiUploadSignals(sourceFiles);
  const packageSignals = coverageReadinessPackageSignals(sourceFiles);

  const hasTool = packageSignals.some((item) => ["nyc", "c8", "@vitest/coverage-v8", "@vitest/coverage-istanbul", "coverage", "pytest-cov"].includes(item.signal) && item.readiness === "ready");
  const hasSetup = coverageSetups.some((item) => item.readiness !== "missing");
  const hasReporter = reportSignals.some((item) => item.readiness === "ready") || coverageSetups.some((item) => item.reporterCount > 0 || item.artifactCount > 0);
  const hasThreshold = thresholdSignals.some((item) => item.readiness === "ready") || coverageSetups.some((item) => item.thresholdCount > 0);
  const hasScope = scopeSignals.some((item) => item.readiness === "ready") || coverageSetups.some((item) => item.includeCount > 0 || item.excludeCount > 0);
  const hasUpload = ciUploadSignals.some((item) => item.readiness === "ready") || coverageSetups.some((item) => item.uploadCount > 0);

  const riskQueue: CoverageReadinessReport["riskQueue"] = [];
  if (!hasTool && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a coverage tool before claiming code coverage readiness.",
      why: "nyc/c8/Vitest/Jest/coverage.py-style coverage starts from a visible runner, config, or script.",
      relatedHref: "html/coverage-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasReporter) {
    riskQueue.push({
      priority: "high",
      action: "Emit at least one machine-readable report such as LCOV, Cobertura, JSON, or coverage-final.json.",
      why: "Coverage dashboards and CI gates need durable artifacts, not only terminal output.",
      relatedHref: "html/coverage-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasThreshold) {
    riskQueue.push({
      priority: "medium",
      action: "Add coverage thresholds for lines, functions, branches, statements, or patch/project status.",
      why: "Coverage without gates can drift downward silently after tests pass.",
      relatedHref: "html/coverage-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasScope) {
    riskQueue.push({
      priority: "medium",
      action: "Document all/include/exclude/per-file scope so uncovered files are not hidden by defaults.",
      why: "nyc and c8 can omit untouched files unless all/include/exclude rules are explicit.",
      relatedHref: "html/coverage-readiness.html"
    });
  }
  if ((hasTool || hasSetup) && !hasUpload) {
    riskQueue.push({
      priority: "low",
      action: "Add a CI upload/status workflow if pull requests should see coverage deltas.",
      why: "Codecov/Coveralls-style uploads make patch and project coverage visible during review.",
      relatedHref: "html/coverage-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original coverage command before treating this static report as approval.",
    why: "RepoTutor records coverage readiness only; it does not execute tests, merge raw coverage, generate reports, upload artifacts, or contact coverage services.",
    relatedHref: "html/coverage-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `nyc/c8/Codecov-style coverage readiness report: setup ${coverageSetups.length}개, instrumentation signal ${instrumentationSignals.length}개, scope signal ${scopeSignals.length}개, threshold signal ${thresholdSignals.length}개, report signal ${reportSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "nyc c8 Istanbul V8 coverage lcov cobertura coverage-final check-coverage thresholds Codecov OIDC flags",
    coverageSetups,
    instrumentationSignals,
    scopeSignals,
    thresholdSignals,
    reportSignals,
    ciUploadSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "npx nyc --all --check-coverage --reporter=lcov --reporter=text-summary npm test", purpose: "Run Istanbul/nyc with all-file accounting, thresholds, LCOV, and summary output." },
      { command: "npx c8 --all --check-coverage --reporter=lcov --reporter=text-summary npm test", purpose: "Run V8-native c8 coverage with explicit all-file and threshold gates." },
      { command: "npx vitest run --coverage", purpose: "Generate Vitest coverage using the configured v8 or istanbul provider." },
      { command: "python -m pytest --cov --cov-report=term --cov-report=xml", purpose: "Generate Python coverage through pytest-cov and Cobertura-compatible XML." },
      { command: "go test ./... -coverprofile=coverage.out", purpose: "Generate Go coverage profile output for downstream reporting." },
      { command: "rg \"codecov/codecov-action|coveralls|lcov.info|coverage.xml|coverage-final.json|coverage.out\" .github package.json pyproject.toml", purpose: "Trace CI upload, report artifact, and dashboard integration evidence." }
    ],
    learnerNextSteps: [
      "Start with package.json, pyproject.toml, coverage config files, and CI workflows to find the source of truth.",
      "Check whether all/include/exclude/per-file scope includes untouched production files instead of only executed files.",
      "Verify reporters produce durable artifacts such as lcov.info, cobertura XML, coverage-final.json, or coverage.out.",
      "Review threshold gates for line, function, branch, statement, patch, and project coverage.",
      "If CI uploads to Codecov or Coveralls, confirm token/OIDC, flags, files, and fail-on-error behavior.",
      "This report is static readiness only. Real percentages require running the original coverage command."
    ]
  };
}

type CoverageReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function coverageReadinessSourceFiles(walk: WalkResult): Promise<CoverageReadinessSourceFile[]> {
  const files: CoverageReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !coverageReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!coverageReadinessPathSignal(file.relPath) && !coverageReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 300) break;
  }
  return files;
}

function coverageReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return coverageReadinessPathSignal(filePath)
    || /^(package\.json|pyproject\.toml|setup\.cfg|tox\.ini|pytest\.ini|go\.mod|codecov\.ya?ml|\.coveragerc|README\.md)$/i.test(base)
    || /^(\.nycrc(\.(json|ya?ml))?|nyc\.config\.[cm]?[jt]s|\.c8rc(\.(json|ya?ml))?|c8\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(json|ya?ml|toml|ini|js|cjs|mjs|ts|tsx|jsx|md|mdx|sh)$/i.test(filePath);
}

function coverageReadinessPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(\.nycrc(\.(json|ya?ml))?|nyc\.config\.[cm]?[jt]s|\.c8rc(\.(json|ya?ml))?|c8\.config\.[cm]?[jt]s|codecov\.ya?ml|\.coveragerc)$/i.test(base)
    || /(^|\/)(coverage|reports?|\.github\/workflows|scripts?|test|tests|__tests__|ci)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(lcov|info)$/i.test(base)
    || /coverage-(final|summary)\.json$/i.test(base)
    || /coverage\.(xml|json|out)$/i.test(base)
    || /cobertura.*\.xml$/i.test(base);
}

function coverageReadinessContentSignal(text: string): boolean {
  return /(nyc|c8|istanbul|coverage-final|lcov\.info|cobertura|check-coverage|coverageThreshold|@vitest\/coverage|pytest-cov|--cov|coverage\.py|codecov\/codecov-action|CODECOV_TOKEN|use_oidc|codecov\.io|shields\.io.*coverage|coverage.*badge|coveralls|genhtml|go test .*coverprofile)/i.test(text);
}

function coverageReadinessSetups(sourceFiles: CoverageReadinessSourceFile[]): CoverageReadinessReport["coverageSetups"] {
  const rows: CoverageReadinessReport["coverageSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /nyc|c8|coverage\s*[:=]|coverageThreshold|codecov|\.coveragerc|tool\.coverage|coverage:\s*\{/gi) + (coverageReadinessPathSignal(source.filePath) ? 1 : 0);
    const scriptCount = countMatches(source.text, /"[^"]*(coverage|cov)[^"]*"\s*:\s*"[^"]+"|nyc\s+|c8\s+|vitest[^"\n]*--coverage|jest[^"\n]*--coverage|pytest[^"\n]*--cov|go test[^"\n]*-coverprofile/gi);
    const reporterCount = countMatches(source.text, /reporter|reporters|--reporter|--cov-report|coverageReporters|text-summary|lcov|html|json-summary|cobertura|clover|junit/gi);
    const thresholdCount = countMatches(source.text, /check-coverage|coverageThreshold|thresholds?|branches\s*[:=]\s*\d+|functions\s*[:=]\s*\d+|lines\s*[:=]\s*\d+|statements\s*[:=]\s*\d+|patch|project/gi);
    const includeCount = countMatches(source.text, /include|--include|src\s*:|source\s*=|source_pkgs|collectCoverageFrom|files\s*:/gi);
    const excludeCount = countMatches(source.text, /exclude|omit|ignore|--exclude|coveragePathIgnorePatterns|exclude-after-remap|excludeNodeModules/gi);
    const uploadCount = countMatches(source.text, /codecov\/codecov-action|Codecov|CODECOV_TOKEN|use_oidc|coveralls|lcovonly|upload.*coverage|coverage.*upload/gi);
    const artifactCount = countMatches(source.text, /lcov\.info|coverage-final\.json|coverage-summary\.json|coverage\.xml|cobertura|clover\.xml|coverage\.out|htmlcov|coverage\/|upload-artifact/gi);
    const mergeCount = countMatches(source.text, /nyc merge|--no-clean|c8 report|coverage combine|lcov .*--add-tracefile|merge coverage|combine coverage/gi);
    const totalSignals = configCount + scriptCount + reporterCount + thresholdCount + includeCount + excludeCount + uploadCount + artifactCount + mergeCount;
    if (totalSignals === 0 && !coverageReadinessPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: coverageReadinessTool(source),
      configCount,
      scriptCount,
      reporterCount,
      thresholdCount,
      includeCount,
      excludeCount,
      uploadCount,
      artifactCount,
      mergeCount,
      readiness: (configCount > 0 || scriptCount > 0) && reporterCount > 0 && (thresholdCount > 0 || uploadCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, script ${scriptCount}, reporter ${reporterCount}, threshold ${thresholdCount}, include ${includeCount}, exclude ${excludeCount}, upload ${uploadCount}, artifact ${artifactCount}, merge ${mergeCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.configCount + b.scriptCount + b.reporterCount + b.thresholdCount + b.uploadCount + b.artifactCount;
    const aScore = a.configCount + a.scriptCount + a.reporterCount + a.thresholdCount + a.uploadCount + a.artifactCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 90);
}

function coverageReadinessTool(source: CoverageReadinessSourceFile): CoverageReadinessReport["coverageSetups"][number]["tool"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/nyc|\.nycrc|nyc\.config/i.test(haystack)) return "nyc";
  if (/\bc8\b|\.c8rc|c8\.config/i.test(haystack)) return "c8";
  if (/vitest|@vitest\/coverage/i.test(haystack)) return "vitest";
  if (/jest|coverageThreshold|collectCoverageFrom/i.test(haystack)) return "jest";
  if (/coverage\.py|\.coveragerc|\[tool\.coverage|coverage run|coverage xml/i.test(haystack)) return "coverage.py";
  if (/pytest-cov|pytest[^"\n]*--cov|--cov-report/i.test(haystack)) return "pytest-cov";
  if (/go test[^"\n]*-cover|-coverprofile|coverage\.out/i.test(haystack)) return "go-cover";
  if (/codecov\/codecov-action|Codecov|CODECOV_TOKEN|codecov\.ya?ml/i.test(haystack)) return "codecov";
  if (/coveralls|COVERALLS_REPO_TOKEN/i.test(haystack)) return "coveralls";
  if (/coverage|lcov|cobertura|clover/i.test(haystack)) return "custom";
  return "unknown";
}

function coverageReadinessInstrumentationSignals(sourceFiles: CoverageReadinessSourceFile[]): CoverageReadinessReport["instrumentationSignals"] {
  const specs: Array<{ signal: CoverageReadinessReport["instrumentationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nyc", pattern: /\bnyc\b|\.nycrc|nyc\.config/i, evidence: "nyc/Istanbul CLI evidence was detected." },
    { signal: "c8", pattern: /\bc8\b|\.c8rc|c8\.config/i, evidence: "c8 V8 coverage evidence was detected." },
    { signal: "v8-provider", pattern: /@vitest\/coverage-v8|provider\s*:\s*["']v8["']|--coverage\.provider=v8/i, evidence: "V8 coverage provider evidence was detected." },
    { signal: "istanbul-provider", pattern: /@vitest\/coverage-istanbul|provider\s*:\s*["']istanbul["']|istanbul/i, evidence: "Istanbul provider evidence was detected." },
    { signal: "babel-istanbul", pattern: /babel-plugin-istanbul|@istanbuljs\/nyc-config-babel|nyc-config-typescript/i, evidence: "Babel/Istanbul instrumentation evidence was detected." },
    { signal: "coverage-py", pattern: /coverage\.py|coverage run|coverage xml|\.coveragerc|\[tool\.coverage/i, evidence: "coverage.py evidence was detected." },
    { signal: "pytest-cov", pattern: /pytest-cov|pytest[^"\n]*--cov|--cov-report/i, evidence: "pytest-cov evidence was detected." },
    { signal: "go-cover", pattern: /go test[^"\n]*-cover|-coverprofile|coverage\.out/i, evidence: "Go coverage profile evidence was detected." },
    { signal: "lcov-genhtml", pattern: /\blcov\b|genhtml|lcov\.info/i, evidence: "lcov/genhtml evidence was detected." }
  ];
  return coverageReadinessSignalFromSpecs(sourceFiles, specs, "instrumentation", "signal");
}

function coverageReadinessScopeSignals(sourceFiles: CoverageReadinessSourceFile[]): CoverageReadinessReport["scopeSignals"] {
  const specs: Array<{ signal: CoverageReadinessReport["scopeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "all-files", pattern: /--all\b|all\s*[:=]\s*true|collectCoverage\s*:\s*true|collectCoverageFrom/i, evidence: "all-file coverage evidence was detected." },
    { signal: "include", pattern: /include\s*[:=]|--include|collectCoverageFrom|source\s*=|source_pkgs/i, evidence: "coverage include/source scope evidence was detected." },
    { signal: "exclude", pattern: /exclude\s*[:=]|--exclude|omit\s*=|coveragePathIgnorePatterns|excludeNodeModules/i, evidence: "coverage exclude/omit evidence was detected." },
    { signal: "exclude-after-remap", pattern: /exclude-after-remap|excludeAfterRemap/i, evidence: "source-map remap exclusion evidence was detected." },
    { signal: "source-map", pattern: /source-?map|\.map\b|exclude-after-remap|babel-plugin-istanbul/i, evidence: "source-map coverage evidence was detected." },
    { signal: "per-file", pattern: /per-file|perFile|each file|file coverage/i, evidence: "per-file coverage evidence was detected." },
    { signal: "workspace-src", pattern: /--src\b|src\s*:|workspaces?|packages\/\*|monorepo/i, evidence: "workspace/source directory evidence was detected." },
    { signal: "ignore-hints", pattern: /istanbul ignore|c8 ignore|coverage: ignore|pragma: no cover/i, evidence: "inline coverage ignore evidence was detected." }
  ];
  return coverageReadinessSignalFromSpecs(sourceFiles, specs, "scope", "signal");
}

function coverageReadinessThresholdSignals(sourceFiles: CoverageReadinessSourceFile[]): CoverageReadinessReport["thresholdSignals"] {
  const specs: Array<{ signal: CoverageReadinessReport["thresholdSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "check-coverage", pattern: /check-coverage|checkCoverage|--check-coverage/i, evidence: "coverage gate evidence was detected." },
    { signal: "lines", pattern: /lines\s*[:=]\s*\d+|--lines\s+\d+|line-rate/i, evidence: "line threshold evidence was detected." },
    { signal: "functions", pattern: /functions\s*[:=]\s*\d+|--functions\s+\d+|function-rate/i, evidence: "function threshold evidence was detected." },
    { signal: "branches", pattern: /branches\s*[:=]\s*\d+|--branches\s+\d+|branch-rate/i, evidence: "branch threshold evidence was detected." },
    { signal: "statements", pattern: /statements\s*[:=]\s*\d+|--statements\s+\d+/i, evidence: "statement threshold evidence was detected." },
    { signal: "watermarks", pattern: /watermarks?["']?\s*[:=]|highWatermark|lowWatermark/i, evidence: "watermark evidence was detected." },
    { signal: "global-threshold", pattern: /global\s*[:=]\s*\{|coverageThreshold|fail_under/i, evidence: "global coverage threshold evidence was detected." },
    { signal: "per-file-threshold", pattern: /per-file|perFile|each file/i, evidence: "per-file threshold evidence was detected." },
    { signal: "patch-threshold", pattern: /patch\s*[:=]|patch:\s*\{|target:\s*auto|threshold:\s*\d+/i, evidence: "patch coverage threshold evidence was detected." },
    { signal: "project-threshold", pattern: /project\s*[:=]|project:\s*\{|coverage:\s+status/i, evidence: "project coverage threshold evidence was detected." }
  ];
  return coverageReadinessSignalFromSpecs(sourceFiles, specs, "threshold", "signal");
}

function coverageReadinessReportSignals(sourceFiles: CoverageReadinessSourceFile[]): CoverageReadinessReport["reportSignals"] {
  const specs: Array<{ signal: CoverageReadinessReport["reportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "text", pattern: /reporter=?["']?text["']?|--cov-report[=\s]term\b/i, evidence: "text report evidence was detected." },
    { signal: "text-summary", pattern: /text-summary|summary/i, evidence: "text-summary evidence was detected." },
    { signal: "html", pattern: /reporter=?["']?html["']?|htmlcov|coverage\/index\.html|--cov-report[=\s]html/i, evidence: "HTML coverage report evidence was detected." },
    { signal: "lcov", pattern: /lcov|lcov\.info|text-lcov/i, evidence: "LCOV evidence was detected." },
    { signal: "json", pattern: /coverage-final\.json|reporter=?["']?json["']?|coverage\.json/i, evidence: "JSON coverage report evidence was detected." },
    { signal: "json-summary", pattern: /json-summary|coverage-summary\.json/i, evidence: "JSON summary evidence was detected." },
    { signal: "cobertura", pattern: /cobertura|coverage\.xml|cobertura-coverage\.xml/i, evidence: "Cobertura report evidence was detected." },
    { signal: "clover", pattern: /clover|clover\.xml/i, evidence: "Clover report evidence was detected." },
    { signal: "junit", pattern: /junit|test_results|test-results/i, evidence: "JUnit/test results evidence was detected." },
    { signal: "coverage-final", pattern: /coverage-final\.json/i, evidence: "Istanbul coverage-final evidence was detected." },
    { signal: "coverage-out", pattern: /coverage\.out|cover\.out|-coverprofile/i, evidence: "Go coverage.out evidence was detected." }
  ];
  return coverageReadinessSignalFromSpecs(sourceFiles, specs, "report", "signal");
}

function coverageReadinessCiUploadSignals(sourceFiles: CoverageReadinessSourceFile[]): CoverageReadinessReport["ciUploadSignals"] {
  const specs: Array<{ signal: CoverageReadinessReport["ciUploadSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "codecov-action", pattern: /codecov\/codecov-action/i, evidence: "Codecov Action evidence was detected." },
    { signal: "codecov-token", pattern: /CODECOV_TOKEN|secrets\.CODECOV_TOKEN|token:\s*\$\{\{[^}]*CODECOV/i, evidence: "Codecov token evidence was detected." },
    { signal: "codecov-oidc", pattern: /use_oidc\s*:\s*true|id-token:\s*write|OIDC/i, evidence: "Codecov OIDC evidence was detected." },
    { signal: "codecov-flags", pattern: /flags\s*:|CC_FLAGS|--flag|env_vars\s*:/i, evidence: "coverage upload flag evidence was detected." },
    { signal: "codecov-files", pattern: /files\s*:|CC_FILES|disable_search|directory\s*:/i, evidence: "explicit Codecov file selection evidence was detected." },
    { signal: "fail-ci-if-error", pattern: /fail_ci_if_error\s*:\s*true|fail_ci_if_error|CC_FAIL_ON_ERROR/i, evidence: "upload failure gate evidence was detected." },
    { signal: "coveralls", pattern: /coveralls|COVERALLS_REPO_TOKEN/i, evidence: "Coveralls evidence was detected." },
    { signal: "github-step-summary", pattern: /GITHUB_STEP_SUMMARY|coverage.*summary|vitest-coverage-report-action/i, evidence: "GitHub step summary evidence was detected." },
    { signal: "upload-artifact", pattern: /actions\/upload-artifact|upload-artifact|artifact.*coverage/i, evidence: "coverage artifact upload evidence was detected." },
    { signal: "badge", pattern: /codecov\/c\/github|coverage\.svg|shields\.io.*coverage|badge/i, evidence: "coverage badge evidence was detected." }
  ];
  return coverageReadinessSignalFromSpecs(sourceFiles, specs, "ci-upload", "signal");
}

function coverageReadinessPackageSignals(sourceFiles: CoverageReadinessSourceFile[]): CoverageReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CoverageReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nyc", pattern: /"nyc"|@istanbuljs\/nyc-config|nyc\s+/i, evidence: "nyc package/command evidence was detected." },
    { signal: "c8", pattern: /"c8"|\bc8\s+/i, evidence: "c8 package/command evidence was detected." },
    { signal: "@vitest/coverage-v8", pattern: /@vitest\/coverage-v8/i, evidence: "Vitest V8 coverage package evidence was detected." },
    { signal: "@vitest/coverage-istanbul", pattern: /@vitest\/coverage-istanbul/i, evidence: "Vitest Istanbul coverage package evidence was detected." },
    { signal: "jest", pattern: /"jest"|jest\s+.*--coverage|coverageThreshold|collectCoverageFrom/i, evidence: "Jest coverage evidence was detected." },
    { signal: "babel-plugin-istanbul", pattern: /babel-plugin-istanbul/i, evidence: "Babel Istanbul package evidence was detected." },
    { signal: "coverage", pattern: /coverage\.py|coverage\s*(=|>=|~=)|"coverage"/i, evidence: "coverage.py package evidence was detected." },
    { signal: "pytest-cov", pattern: /pytest-cov|--cov\b/i, evidence: "pytest-cov package/command evidence was detected." },
    { signal: "codecov-action", pattern: /codecov\/codecov-action/i, evidence: "Codecov Action package/workflow evidence was detected." },
    { signal: "coveralls", pattern: /coveralls/i, evidence: "Coveralls package/workflow evidence was detected." }
  ];
  return coverageReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function coverageReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CoverageReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/coverage-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildMutationTestingReadinessReport(walk: WalkResult): Promise<MutationTestingReadinessReport> {
  const sourceFiles = await mutationTestingSourceFiles(walk);
  const mutationSetups = mutationTestingSetups(sourceFiles);
  const toolSignals = mutationTestingToolSignals(sourceFiles);
  const configSignals = mutationTestingConfigSignals(sourceFiles);
  const qualitySignals = mutationTestingQualitySignals(sourceFiles);
  const reporterSignals = mutationTestingReporterSignals(sourceFiles);
  const scopeSignals = mutationTestingScopeSignals(sourceFiles);
  const packageSignals = mutationTestingPackageSignals(sourceFiles);
  const hasSetup = mutationSetups.length > 0;
  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasMutate = configSignals.some((item) => item.signal === "mutate-pattern" && item.readiness === "ready")
    || scopeSignals.some((item) => ["src", "lib"].includes(item.signal) && item.readiness === "ready");
  const hasRunner = configSignals.some((item) => item.signal === "test-runner" && item.readiness === "ready");
  const hasThreshold = qualitySignals.some((item) => ["thresholds", "mutation-score", "covered-score"].includes(item.signal) && item.readiness === "ready");
  const hasReporter = reporterSignals.some((item) => ["html", "json", "dashboard", "mutation-testing-report-schema", "junit"].includes(item.signal) && item.readiness === "ready");
  const hasSafety = qualitySignals.some((item) => ["survived", "timeout", "ignored", "no-coverage"].includes(item.signal) && item.readiness === "ready")
    || scopeSignals.some((item) => ["ignore-patterns", "with-uncovered"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: MutationTestingReadinessReport["riskQueue"] = [];
  if (!hasSetup) {
    riskQueue.push({
      priority: "high",
      action: "Add mutation testing configuration before claiming mutation readiness.",
      why: "Stryker and Infection both center readiness on explicit config, mutation scope, runner, reporters, and score thresholds; this scan did not find a setup.",
      relatedHref: "html/mutation-testing-readiness.html"
    });
  }
  if (hasSetup && !hasPackage) {
    riskQueue.push({
      priority: "medium",
      action: "Declare the mutation testing tool dependency or documented installer.",
      why: "A config file without an installed Stryker, Infection, mutmut, or PIT package makes the repeatable command unclear.",
      relatedHref: "html/mutation-testing-readiness.html"
    });
  }
  if (hasSetup && !hasMutate) {
    riskQueue.push({
      priority: "high",
      action: "Define the mutation scope with mutate/source patterns.",
      why: "Mutation engines need explicit source files or directories so tests are not wasted on fixtures, generated files, or test files.",
      relatedHref: "html/mutation-testing-readiness.html"
    });
  }
  if (hasSetup && !hasRunner) {
    riskQueue.push({
      priority: "medium",
      action: "Connect the mutation engine to the test runner.",
      why: "Mutation score is only meaningful when the engine can run the repository's real test framework for each mutant.",
      relatedHref: "html/mutation-testing-readiness.html"
    });
  }
  if (hasSetup && !hasThreshold) {
    riskQueue.push({
      priority: "medium",
      action: "Set mutation score thresholds before using mutation testing as a release gate.",
      why: "Thresholds such as Stryker high/low/break or Infection min-msi/min-covered-msi convert reports into enforceable quality gates.",
      relatedHref: "html/mutation-testing-readiness.html"
    });
  }
  if (hasSetup && !hasReporter) {
    riskQueue.push({
      priority: "low",
      action: "Add HTML or JSON mutation reports for learner review.",
      why: "Machine-readable and browsable reports show killed, survived, timeout, ignored, and no-coverage mutants without rerunning the engine.",
      relatedHref: "html/mutation-testing-readiness.html"
    });
  }
  if (hasSetup && !hasSafety) {
    riskQueue.push({
      priority: "low",
      action: "Document timeout, ignored mutant, or no-coverage handling.",
      why: "Mutation testing can produce slow or intentionally equivalent mutants; safety metadata helps learners separate real gaps from tool noise.",
      relatedHref: "html/mutation-testing-readiness.html"
    });
  }

  return {
    summary: `Mutation testing readiness report: setups ${mutationSetups.length}개, tool signals ${toolSignals.filter((item) => item.readiness === "ready").length}개, quality signals ${qualitySignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Stryker mutation testing mutate patterns mutators testRunner coverageAnalysis reporters thresholds mutationScore killed survived timeout ignored incremental dashboard HTML JSON mutation-testing-report-schema Infection MSI covered MSI with-uncovered",
    mutationSetups,
    toolSignals,
    configSignals,
    qualitySignals,
    reporterSignals,
    scopeSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx stryker run", purpose: "Run the configured JavaScript or TypeScript mutation test suite once." },
      { command: "npx stryker run --incremental", purpose: "Reuse prior Stryker results when the repository supports incremental mutation testing." },
      { command: "npx stryker run --reporters html,json,clear-text", purpose: "Emit learner-friendly and machine-readable mutation reports." },
      { command: "npx stryker run --testRunner vitest", purpose: "Force Stryker to use the Vitest runner when the config is ambiguous." },
      { command: "vendor/bin/infection --min-msi=80 --min-covered-msi=90", purpose: "Run Infection in a trusted PHP workspace with explicit MSI gates." },
      { command: "rg \"stryker|infection|mutationScore|mutate|mutators|thresholds\" .", purpose: "Audit mutation testing configuration and report evidence statically." }
    ],
    learnerNextSteps: [
      "Open the mutation config first: identify mutate/source scope, runner, mutators, coverage analysis, timeout, reporters, and score thresholds.",
      "Compare survived mutants with existing tests and write one focused test that kills a high-value survived mutant.",
      "Use HTML/JSON mutation reports to separate killed, survived, timeout, ignored, and no-coverage mutants before changing thresholds.",
      "RepoTutor records static mutation-readiness evidence only; run Stryker or Infection in a trusted workspace before treating this as quality approval."
    ]
  };
}

type MutationTestingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function mutationTestingSourceFiles(walk: WalkResult): Promise<MutationTestingSourceFile[]> {
  const files: MutationTestingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !mutationTestingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    const base = path.basename(file.relPath);
    if (!mutationTestingPathSignal(file.relPath) && !mutationTestingContentSignal(text) && base !== "package.json") continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function mutationTestingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return mutationTestingPathSignal(filePath)
    || /^(package\.json|composer\.json|stryker\.conf\.[cm]?[jt]s|stryker\.conf\.json|stryker\.config\.[cm]?[jt]s|infection\.json5?|README\.md)$/i.test(base)
    || /\.(json|md|ya?ml|xml|php|[cm]?[jt]sx?)$/i.test(base);
}

function mutationTestingPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(stryker|infection|mutmut|pitest|mutation|mutations?|mutators?|mutation-reports?|reports\/mutation|reports\/stryker|\.stryker-tmp)(\/|$)/i.test(filePath)
    || /^stryker\.(conf|config)\./i.test(base)
    || /^infection\.json5?$/i.test(base)
    || /(mutation|mutator|stryker|infection|mutmut|pitest)/i.test(filePath);
}

function mutationTestingContentSignal(text: string): boolean {
  return /\b(@stryker-mutator|stryker\s+run|Stryker|infection\/infection|bin\/infection|mutation testing|mutationScore|mutation score|mutators?|mutants?|testRunner|coverageAnalysis|disableTypeChecks|min-msi|min-covered-msi|covered MSI|with-uncovered|NoCoverage|mutation-testing-report-schema|mutmut|pitest)\b/i.test(text);
}

function mutationTestingSetups(sourceFiles: MutationTestingSourceFile[]): MutationTestingReadinessReport["mutationSetups"] {
  return sourceFiles
    .filter((source) => mutationTestingPathSignal(source.filePath) || mutationTestingContentSignal(source.text))
    .slice(0, 160)
    .map((source) => {
      const configCount = countMatches(source.text, /stryker\.conf|stryker\.config|infection\.json|pitest|mutmut|mutation testing|@stryker-mutator\/core|infection\/infection/gim);
      const mutatePatternCount = countMatches(source.text, /mutate\s*:|mutate"\s*:|sourceDirs|src\/|lib\/|--with-uncovered|with-uncovered/gim);
      const mutatorCount = countMatches(source.text, /mutator|mutators|BooleanLiteral|StringLiteral|ArrayDeclaration|ReturnRemoval/gim);
      const runnerCount = countMatches(source.text, /testRunner|vitest|jest|mocha|jasmine|phpunit|testFramework|JUnit/gim);
      const thresholdCount = countMatches(source.text, /threshold|thresholds|min-msi|min-covered-msi|mutationScore|mutation score|msi|covered MSI|high|low|break/gim);
      const reporterCount = countMatches(source.text, /reporters?|html|json|clear-text|dashboard|badge|junit|mutation-testing-report-schema|logs/gim);
      const timeoutCount = countMatches(source.text, /timeout|timeoutMS|timeoutFactor/gim);
      const incrementalCount = countMatches(source.text, /incremental|stryker-incremental|download-incremental-reports/gim);
      const ciCount = countMatches(source.text, /\.github\/workflows|CI|pull_request|workflow|dashboard/gim) + (/\.github\/workflows/i.test(source.filePath) ? 1 : 0);
      const total = configCount + mutatePatternCount + mutatorCount + runnerCount + thresholdCount + reporterCount + timeoutCount + incrementalCount + ciCount;
      return {
        filePath: source.filePath,
        tool: mutationTestingTool(source),
        configCount,
        mutatePatternCount,
        mutatorCount,
        runnerCount,
        thresholdCount,
        reporterCount,
        timeoutCount,
        incrementalCount,
        ciCount,
        readiness: configCount > 0 && mutatePatternCount > 0 && runnerCount > 0 && (thresholdCount > 0 || reporterCount > 0) && total >= 8 ? "ready" : total > 0 ? "partial" : "missing",
        evidence: `${source.filePath} has ${total} mutation testing setup signal(s): scope ${mutatePatternCount}, runner ${runnerCount}, thresholds ${thresholdCount}, reporters ${reporterCount}.`,
        sourceHref: source.sourceHref
      };
    });
}

function mutationTestingTool(source: MutationTestingSourceFile): MutationTestingReadinessReport["mutationSetups"][number]["tool"] {
  if (/@stryker-mutator|stryker\s+run|stryker\.conf|Stryker/i.test(source.text) || /stryker/i.test(source.filePath)) return "stryker";
  if (/infection\/infection|bin\/infection|infection\.json|MSI|covered MSI|min-msi|min-covered-msi/i.test(source.text) || /infection/i.test(source.filePath)) return "infection";
  if (/mutation-testing-report-schema|mutation-testing-elements|mutation testing report/i.test(source.text) || /mutation-testing-elements/i.test(source.filePath)) return "mutation-testing-elements";
  if (/mutmut/i.test(source.text) || /mutmut/i.test(source.filePath)) return "mutmut";
  if (/pitest|\bPIT\b/i.test(source.text) || /pitest/i.test(source.filePath)) return "pitest";
  if (/mutation testing|mutator|mutants?/i.test(source.text) || /mutation|mutator/i.test(source.filePath)) return "custom";
  return "unknown";
}

function mutationTestingToolSignals(sourceFiles: MutationTestingSourceFile[]): MutationTestingReadinessReport["toolSignals"] {
  const specs: Array<{ signal: MutationTestingReadinessReport["toolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "stryker", pattern: /@stryker-mutator|stryker\s+run|stryker\.conf|Stryker/i, evidence: "Stryker mutation testing evidence was detected." },
    { signal: "infection", pattern: /infection\/infection|bin\/infection|infection\.json|min-msi|min-covered-msi|\bMSI\b|covered MSI/i, evidence: "Infection mutation testing evidence was detected." },
    { signal: "mutmut", pattern: /\bmutmut\b/i, evidence: "mutmut evidence was detected." },
    { signal: "pitest", pattern: /\bpitest\b|\bPIT\b/i, evidence: "PIT mutation testing evidence was detected." },
    { signal: "mutation-testing-elements", pattern: /mutation-testing-report-schema|mutation-testing-elements|mutation testing report/i, evidence: "Mutation Testing Elements report schema evidence was detected." },
    { signal: "custom", pattern: /mutation testing|mutator|mutants?|mutationScore|mutation score/i, evidence: "custom mutation testing terminology was detected." }
  ];
  return mutationTestingSignalFromSpecs(sourceFiles, specs, "tool");
}

function mutationTestingConfigSignals(sourceFiles: MutationTestingSourceFile[]): MutationTestingReadinessReport["configSignals"] {
  const specs: Array<{ signal: MutationTestingReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "config-file", pattern: /stryker\.(conf|config)\.|infection\.json|pitest|mutmut/i, evidence: "mutation testing config file evidence was detected." },
    { signal: "package-script", pattern: /"[^"]*(mutation|stryker|infection)[^"]*"\s*:\s*"[^"]*(stryker|infection|mutmut|pitest)[^"]*"/i, evidence: "package script evidence was detected." },
    { signal: "schema", pattern: /\$schema|mutation-testing-report-schema|schemaVersion/i, evidence: "schema evidence was detected." },
    { signal: "mutate-pattern", pattern: /mutate\s*:|mutate"\s*:|sourceDirs|src\/|lib\/|include\s*:|files\s*:/i, evidence: "mutation scope pattern evidence was detected." },
    { signal: "test-runner", pattern: /testRunner|vitest|jest|mocha|jasmine|phpunit|testFramework/i, evidence: "test runner evidence was detected." },
    { signal: "coverage-analysis", pattern: /coverageAnalysis|perTest|all|coverage/i, evidence: "coverage analysis evidence was detected." },
    { signal: "disable-type-checks", pattern: /disableTypeChecks|disable type checks/i, evidence: "disableTypeChecks evidence was detected." }
  ];
  return mutationTestingSignalFromSpecs(sourceFiles, specs, "config");
}

function mutationTestingQualitySignals(sourceFiles: MutationTestingSourceFile[]): MutationTestingReadinessReport["qualitySignals"] {
  const specs: Array<{ signal: MutationTestingReadinessReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "thresholds", pattern: /threshold|thresholds|min-msi|min-covered-msi|high\s*:|low\s*:|break\s*:/i, evidence: "mutation threshold evidence was detected." },
    { signal: "mutation-score", pattern: /mutationScore|mutation score|\bMSI\b|min-msi/i, evidence: "mutation score evidence was detected." },
    { signal: "covered-score", pattern: /coveredScore|covered score|covered MSI|min-covered-msi/i, evidence: "covered mutation score evidence was detected." },
    { signal: "survived", pattern: /survived|Survived/i, evidence: "survived mutant evidence was detected." },
    { signal: "killed", pattern: /killed|Killed/i, evidence: "killed mutant evidence was detected." },
    { signal: "timeout", pattern: /timeout|Timeout|timeoutMS|timeoutFactor/i, evidence: "timeout mutant or config evidence was detected." },
    { signal: "ignored", pattern: /ignored|Ignored|ignoreStatic|ignore-pattern/i, evidence: "ignored mutant evidence was detected." },
    { signal: "no-coverage", pattern: /NoCoverage|no coverage|no-coverage/i, evidence: "no-coverage mutant evidence was detected." }
  ];
  return mutationTestingSignalFromSpecs(sourceFiles, specs, "quality");
}

function mutationTestingReporterSignals(sourceFiles: MutationTestingSourceFile[]): MutationTestingReadinessReport["reporterSignals"] {
  const specs: Array<{ signal: MutationTestingReadinessReport["reporterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "html", pattern: /reporters?[\s\S]{0,200}html|\bhtml\b/i, evidence: "HTML reporter evidence was detected." },
    { signal: "json", pattern: /reporters?[\s\S]{0,200}json|\bjson\b/i, evidence: "JSON reporter evidence was detected." },
    { signal: "clear-text", pattern: /clear-text|clearText/i, evidence: "clear-text reporter evidence was detected." },
    { signal: "progress", pattern: /\bprogress\b/i, evidence: "progress reporter evidence was detected." },
    { signal: "dashboard", pattern: /dashboard/i, evidence: "dashboard reporter evidence was detected." },
    { signal: "badge", pattern: /\bbadge\b/i, evidence: "badge reporter evidence was detected." },
    { signal: "junit", pattern: /\bjunit\b|JUnit/i, evidence: "JUnit reporter evidence was detected." },
    { signal: "mutation-testing-report-schema", pattern: /mutation-testing-report-schema|schemaVersion/i, evidence: "mutation testing report schema evidence was detected." }
  ];
  return mutationTestingSignalFromSpecs(sourceFiles, specs, "reporter");
}

function mutationTestingScopeSignals(sourceFiles: MutationTestingSourceFile[]): MutationTestingReadinessReport["scopeSignals"] {
  const specs: Array<{ signal: MutationTestingReadinessReport["scopeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "src", pattern: /src\/|sourceDirs[\s\S]{0,120}src|["']src["']/i, evidence: "src mutation scope evidence was detected." },
    { signal: "lib", pattern: /lib\/|["']lib["']|mutate[\s\S]{0,120}lib/i, evidence: "lib mutation scope evidence was detected." },
    { signal: "test-files", pattern: /tests?\/|__tests__|\.test\.|\.spec\.|testRunner|phpunit/i, evidence: "test file or runner scope evidence was detected." },
    { signal: "ignore-patterns", pattern: /ignoreStatic|ignorePatterns|ignore-pattern|excludedMutations|exclude\s*:/i, evidence: "ignore pattern evidence was detected." },
    { signal: "with-uncovered", pattern: /--with-uncovered|with-uncovered|withUncovered/i, evidence: "with-uncovered evidence was detected." },
    { signal: "incremental", pattern: /incremental|stryker-incremental|download-incremental-reports/i, evidence: "incremental mutation testing evidence was detected." },
    { signal: "dry-run", pattern: /dryRun|dry-run|dry run/i, evidence: "dry-run evidence was detected." }
  ];
  return mutationTestingSignalFromSpecs(sourceFiles, specs, "scope");
}

function mutationTestingPackageSignals(sourceFiles: MutationTestingSourceFile[]): MutationTestingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MutationTestingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@stryker-mutator/core", pattern: /@stryker-mutator\/core/i, evidence: "@stryker-mutator/core dependency evidence was detected." },
    { signal: "@stryker-mutator/vitest-runner", pattern: /@stryker-mutator\/vitest-runner/i, evidence: "Stryker Vitest runner dependency evidence was detected." },
    { signal: "@stryker-mutator/jest-runner", pattern: /@stryker-mutator\/jest-runner/i, evidence: "Stryker Jest runner dependency evidence was detected." },
    { signal: "mutation-testing-report-schema", pattern: /mutation-testing-report-schema/i, evidence: "mutation testing report schema package evidence was detected." },
    { signal: "infection/infection", pattern: /infection\/infection|bin\/infection/i, evidence: "Infection package evidence was detected." },
    { signal: "mutmut", pattern: /\bmutmut\b/i, evidence: "mutmut package evidence was detected." },
    { signal: "pitest", pattern: /\bpitest\b|\bPIT\b/i, evidence: "PIT package evidence was detected." },
    { signal: "custom", pattern: /mutation testing|mutator|mutants?|mutationScore|mutation score/i, evidence: "custom mutation testing package or terminology evidence was detected." }
  ];
  return mutationTestingSignalFromSpecs(sourceFiles, specs, "package");
}

function mutationTestingSignalFromSpecs<T extends { signal: string; pattern: RegExp; evidence: string }>(
  sourceFiles: MutationTestingSourceFile[],
  specs: T[],
  label: string
): Array<{ signal: T["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/mutation-testing-readiness.html"
    };
  });
}

export async function buildTypecheckReadinessReport(walk: WalkResult): Promise<TypecheckReadinessReport> {
  const sourceFiles = await typecheckSourceFiles(walk);
  const tsconfigFiles = typecheckTsconfigFiles(sourceFiles);
  const compilerOptionSignals = typecheckCompilerOptionSignals(sourceFiles);
  const projectSignals = typecheckProjectSignals(sourceFiles);
  const moduleResolutionSignals = typecheckModuleResolutionSignals(sourceFiles);
  const declarationSignals = typecheckDeclarationSignals(sourceFiles);
  const scriptSignals = typecheckScriptSignals(sourceFiles);
  const hasTsconfig = tsconfigFiles.length > 0;
  const hasStrict = compilerOptionSignals.some((item) => item.signal === "strict" && item.readiness === "ready");
  const hasTypecheckCommand = scriptSignals.some((item) => ["typecheck-script", "tsc", "noEmit-command", "project-build"].includes(item.signal) && item.readiness === "ready");
  const usesProjectReferences = projectSignals.some((item) => item.signal === "references" && item.readiness === "ready");
  const hasComposite = projectSignals.some((item) => item.signal === "composite" && item.readiness === "ready");
  const hasIncremental = projectSignals.some((item) => item.signal === "incremental" && item.readiness === "ready");
  const hasModuleResolution = moduleResolutionSignals.some((item) => item.signal === "moduleResolution" && item.readiness === "ready");
  const hasPaths = moduleResolutionSignals.some((item) => ["paths", "baseUrl"].includes(item.signal) && item.readiness === "ready");
  const hasDeclaration = declarationSignals.some((item) => ["declaration", "emitDeclarationOnly"].includes(item.signal) && item.readiness === "ready");
  const hasNoEmitOnError = compilerOptionSignals.some((item) => item.signal === "noEmitOnError" && item.readiness === "ready");
  const hasSkipLibCheck = compilerOptionSignals.some((item) => item.signal === "skipLibCheck" && item.readiness === "ready");

  const riskQueue: TypecheckReadinessReport["riskQueue"] = [];
  if (!hasTsconfig) {
    riskQueue.push({
      priority: "high",
      action: "Add a tsconfig.json or jsconfig.json before claiming TypeScript typecheck readiness.",
      why: "TypeScript's project mode centers on compilerOptions, files/include/exclude, and references loaded from config files.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  if (!hasTypecheckCommand) {
    riskQueue.push({
      priority: "high",
      action: "Add a package script or documented command that runs tsc.",
      why: "A static tsconfig is not enough; the repository needs a repeatable typecheck command such as tsc --noEmit or tsc --build.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  if (hasTsconfig && !hasStrict) {
    riskQueue.push({
      priority: "medium",
      action: "Enable strict or document why strict type checking is intentionally disabled.",
      why: "TypeScript treats strict as the umbrella for strictNullChecks, noImplicitAny, noImplicitThis, and related strict flags.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  if (usesProjectReferences && !hasComposite) {
    riskQueue.push({
      priority: "high",
      action: "Pair project references with composite projects.",
      why: "TypeScript's compiler options describe composite as the constraint that allows a project to participate in project references.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  if (usesProjectReferences && !hasIncremental) {
    riskQueue.push({
      priority: "low",
      action: "Review incremental build info settings for referenced projects.",
      why: "TypeScript supports incremental and tsBuildInfoFile to persist project build state across runs.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  if (hasPaths && !hasModuleResolution) {
    riskQueue.push({
      priority: "medium",
      action: "Make moduleResolution explicit when using paths or baseUrl.",
      why: "TypeScript's moduleResolution strategy controls how non-relative imports and path aliases are resolved.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  if (hasDeclaration && !hasNoEmitOnError) {
    riskQueue.push({
      priority: "low",
      action: "Consider noEmitOnError for declaration-producing packages.",
      why: "Declaration outputs can become misleading if emitted while type checking errors are present.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  if (hasSkipLibCheck) {
    riskQueue.push({
      priority: "low",
      action: "Review skipLibCheck as a tradeoff, not as proof that dependency types are healthy.",
      why: "TypeScript describes skipLibCheck as skipping type checking for declaration files, which can hide third-party type conflicts.",
      relatedHref: "html/typecheck-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: hasTypecheckCommand ? "Run the typecheck command before treating this static report as approval." : "If this repository later adds a tsc command, rerun RepoTutor to populate typecheck readiness.",
    why: "RepoTutor records static TypeScript readiness only; it does not execute tsc, resolve modules, emit declarations, or inspect real diagnostics.",
    relatedHref: "html/typecheck-readiness.html"
  });

  return {
    summary: `TypeScript typecheck readiness report: tsconfig files ${tsconfigFiles.length}개, compiler option signals ${compilerOptionSignals.length}개, project signals ${projectSignals.length}개, script signals ${scriptSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "TypeScript compilerOptions strict noImplicitAny strictNullChecks composite references declaration noEmit moduleResolution paths types skipLibCheck tsc build",
    tsconfigFiles,
    compilerOptionSignals,
    projectSignals,
    moduleResolutionSignals,
    declarationSignals,
    scriptSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx tsc --noEmit", purpose: "Run a no-output semantic typecheck for the current project." },
      { command: "npx tsc --build", purpose: "Build project references using TypeScript project mode." },
      { command: "npx tsc --showConfig", purpose: "Inspect the final compilerOptions after extends resolution." },
      { command: "npx tsc --watch --noEmit", purpose: "Keep type diagnostics running during local development." },
      { command: "npx tsc --extendedDiagnostics --noEmit", purpose: "Review typecheck performance and file counts." },
      { command: "npx tsc --traceResolution --noEmit", purpose: "Debug moduleResolution, paths, typeRoots, and types lookup behavior." }
    ],
    learnerNextSteps: [
      "Start with tsconfig files: read compilerOptions, extends, include/files/exclude, and references before looking at source code.",
      "Separate strictness flags from project build flags and declaration emit flags; they answer different readiness questions.",
      "Use --showConfig when extends or base configs are involved, then run --noEmit or --build to confirm real diagnostics.",
      "RepoTutor does not execute tsc or resolve imports; treat this report as a static checklist, not typecheck approval."
    ]
  };
}

type TypecheckSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function typecheckSourceFiles(walk: WalkResult): Promise<TypecheckSourceFile[]> {
  const files: TypecheckSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !typecheckInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!typecheckPathSignal(file.relPath) && !typecheckContentSignal(text) && path.basename(file.relPath) !== "package.json") continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function typecheckInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^tsconfig.*\.json$/i.test(base)
    || /^jsconfig.*\.json$/i.test(base)
    || /^(package\.json|pnpm-workspace\.yaml|README\.md)$/i.test(base)
    || /(typescript|typecheck|tsc|tsconfig|declaration|types|compilerOptions)/i.test(filePath)
    || /\.(json|md|ya?ml|[cm]?[jt]sx?)$/i.test(filePath);
}

function typecheckPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^tsconfig.*\.json$/i.test(base)
    || /^jsconfig.*\.json$/i.test(base)
    || /(typescript|typecheck|tsc|tsconfig|declaration|types|compilerOptions)/i.test(filePath);
}

function typecheckContentSignal(text: string): boolean {
  return /typescript|tsc\b|tsconfig|compilerOptions|strictNullChecks|noImplicitAny|noEmit|declaration|composite|references|moduleResolution|skipLibCheck|typecheck/i.test(text);
}

function typecheckTsconfigFiles(sourceFiles: TypecheckSourceFile[]): TypecheckReadinessReport["tsconfigFiles"] {
  return sourceFiles
    .filter((source) => /^tsconfig.*\.json$/i.test(path.basename(source.filePath)) || /^jsconfig.*\.json$/i.test(path.basename(source.filePath)))
    .slice(0, 120)
    .map((source) => {
      const compilerOptionsCount = typecheckOptionCount(source.text);
      const referencesCount = countMatches(source.text, /"references"\s*:\s*\[[\s\S]*?\]/g) > 0 ? countMatches(source.text, /"path"\s*:/g) : 0;
      const includeCount = countMatches(source.text, /"(include|files)"\s*:\s*\[[\s\S]*?\]/g);
      return {
        filePath: source.filePath,
        compilerOptionsCount,
        referencesCount,
        includeCount,
        readiness: compilerOptionsCount > 0 ? "ready" : referencesCount > 0 || includeCount > 0 ? "partial" : "missing",
        evidence: `${source.filePath} has ${compilerOptionsCount} recognized compiler option signal(s), ${referencesCount} reference path(s), and ${includeCount} include/files list signal(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function typecheckOptionCount(text: string): number {
  const options = ["strict", "noImplicitAny", "strictNullChecks", "noUncheckedIndexedAccess", "exactOptionalPropertyTypes", "noEmit", "noEmitOnError", "skipLibCheck", "isolatedModules", "moduleDetection", "jsx", "target", "module", "moduleResolution", "baseUrl", "paths", "typeRoots", "types", "lib", "declaration", "declarationMap", "emitDeclarationOnly", "declarationDir", "sourceMap", "composite", "incremental", "tsBuildInfoFile"];
  return options.filter((option) => new RegExp(`"${option}"\\s*:`, "i").test(text)).length;
}

function typecheckCompilerOptionSignals(sourceFiles: TypecheckSourceFile[]): TypecheckReadinessReport["compilerOptionSignals"] {
  const specs: Array<{ signal: TypecheckReadinessReport["compilerOptionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "strict", pattern: /"strict"\s*:\s*true/i, evidence: "strict compiler option evidence was detected." },
    { signal: "noImplicitAny", pattern: /"noImplicitAny"\s*:\s*true/i, evidence: "noImplicitAny evidence was detected." },
    { signal: "strictNullChecks", pattern: /"strictNullChecks"\s*:\s*true/i, evidence: "strictNullChecks evidence was detected." },
    { signal: "noUncheckedIndexedAccess", pattern: /"noUncheckedIndexedAccess"\s*:\s*true/i, evidence: "noUncheckedIndexedAccess evidence was detected." },
    { signal: "exactOptionalPropertyTypes", pattern: /"exactOptionalPropertyTypes"\s*:\s*true/i, evidence: "exactOptionalPropertyTypes evidence was detected." },
    { signal: "noEmit", pattern: /"noEmit"\s*:\s*true|tsc[^"\n]*--noEmit/i, evidence: "noEmit evidence was detected." },
    { signal: "noEmitOnError", pattern: /"noEmitOnError"\s*:\s*true/i, evidence: "noEmitOnError evidence was detected." },
    { signal: "skipLibCheck", pattern: /"skipLibCheck"\s*:\s*true/i, evidence: "skipLibCheck evidence was detected." },
    { signal: "isolatedModules", pattern: /"isolatedModules"\s*:\s*true/i, evidence: "isolatedModules evidence was detected." },
    { signal: "moduleDetection", pattern: /"moduleDetection"\s*:/i, evidence: "moduleDetection evidence was detected." },
    { signal: "jsx", pattern: /"jsx"\s*:/i, evidence: "jsx compiler option evidence was detected." },
    { signal: "target", pattern: /"target"\s*:/i, evidence: "target compiler option evidence was detected." },
    { signal: "module", pattern: /"module"\s*:/i, evidence: "module compiler option evidence was detected." }
  ];
  return typecheckSignalFromSpecs(sourceFiles, specs, "compiler option", "signal");
}

function typecheckProjectSignals(sourceFiles: TypecheckSourceFile[]): TypecheckReadinessReport["projectSignals"] {
  const specs: Array<{ signal: TypecheckReadinessReport["projectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "references", pattern: /"references"\s*:\s*\[/i, evidence: "project references evidence was detected." },
    { signal: "composite", pattern: /"composite"\s*:\s*true/i, evidence: "composite project evidence was detected." },
    { signal: "incremental", pattern: /"incremental"\s*:\s*true/i, evidence: "incremental build evidence was detected." },
    { signal: "tsBuildInfoFile", pattern: /"tsBuildInfoFile"\s*:/i, evidence: "tsBuildInfoFile evidence was detected." },
    { signal: "include", pattern: /"include"\s*:\s*\[/i, evidence: "include list evidence was detected." },
    { signal: "exclude", pattern: /"exclude"\s*:\s*\[/i, evidence: "exclude list evidence was detected." },
    { signal: "files", pattern: /"files"\s*:\s*\[/i, evidence: "files list evidence was detected." },
    { signal: "rootDir", pattern: /"rootDir"\s*:/i, evidence: "rootDir evidence was detected." },
    { signal: "outDir", pattern: /"outDir"\s*:/i, evidence: "outDir evidence was detected." },
    { signal: "extends", pattern: /"extends"\s*:/i, evidence: "extends base config evidence was detected." }
  ];
  return typecheckSignalFromSpecs(sourceFiles, specs, "project", "signal");
}

function typecheckModuleResolutionSignals(sourceFiles: TypecheckSourceFile[]): TypecheckReadinessReport["moduleResolutionSignals"] {
  const specs: Array<{ signal: TypecheckReadinessReport["moduleResolutionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "moduleResolution", pattern: /"moduleResolution"\s*:/i, evidence: "moduleResolution evidence was detected." },
    { signal: "baseUrl", pattern: /"baseUrl"\s*:/i, evidence: "baseUrl evidence was detected." },
    { signal: "paths", pattern: /"paths"\s*:\s*\{/i, evidence: "paths mapping evidence was detected." },
    { signal: "typeRoots", pattern: /"typeRoots"\s*:\s*\[/i, evidence: "typeRoots evidence was detected." },
    { signal: "types", pattern: /"types"\s*:\s*\[/i, evidence: "types package allowlist evidence was detected." },
    { signal: "lib", pattern: /"lib"\s*:\s*\[/i, evidence: "lib declaration bundle evidence was detected." },
    { signal: "allowImportingTsExtensions", pattern: /"allowImportingTsExtensions"\s*:\s*true/i, evidence: "allowImportingTsExtensions evidence was detected." },
    { signal: "rewriteRelativeImportExtensions", pattern: /"rewriteRelativeImportExtensions"\s*:\s*true/i, evidence: "rewriteRelativeImportExtensions evidence was detected." },
    { signal: "esModuleInterop", pattern: /"esModuleInterop"\s*:\s*true/i, evidence: "esModuleInterop evidence was detected." },
    { signal: "resolveJsonModule", pattern: /"resolveJsonModule"\s*:\s*true/i, evidence: "resolveJsonModule evidence was detected." }
  ];
  return typecheckSignalFromSpecs(sourceFiles, specs, "module resolution", "signal");
}

function typecheckDeclarationSignals(sourceFiles: TypecheckSourceFile[]): TypecheckReadinessReport["declarationSignals"] {
  const specs: Array<{ signal: TypecheckReadinessReport["declarationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "declaration", pattern: /"declaration"\s*:\s*true/i, evidence: "declaration emit evidence was detected." },
    { signal: "declarationMap", pattern: /"declarationMap"\s*:\s*true/i, evidence: "declarationMap evidence was detected." },
    { signal: "emitDeclarationOnly", pattern: /"emitDeclarationOnly"\s*:\s*true/i, evidence: "emitDeclarationOnly evidence was detected." },
    { signal: "declarationDir", pattern: /"declarationDir"\s*:/i, evidence: "declarationDir evidence was detected." },
    { signal: "sourceMap", pattern: /"sourceMap"\s*:\s*true/i, evidence: "sourceMap evidence was detected." },
    { signal: "noEmit", pattern: /"noEmit"\s*:\s*true|tsc[^"\n]*--noEmit/i, evidence: "noEmit evidence was detected." },
    { signal: "composite-declaration", pattern: /"composite"\s*:\s*true[\s\S]{0,500}"declaration"\s*:\s*true|"declaration"\s*:\s*true[\s\S]{0,500}"composite"\s*:\s*true/i, evidence: "composite plus declaration evidence was detected." }
  ];
  return typecheckSignalFromSpecs(sourceFiles, specs, "declaration", "signal");
}

function typecheckScriptSignals(sourceFiles: TypecheckSourceFile[]): TypecheckReadinessReport["scriptSignals"] {
  const specs: Array<{ signal: TypecheckReadinessReport["scriptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tsc", pattern: /"[^"]*"\s*:\s*"[^"]*\btsc\b[^"]*"|\btsc\b/i, evidence: "tsc command evidence was detected." },
    { signal: "typecheck-script", pattern: /"type(check|s)?"\s*:\s*"[^"]*\b(tsc|vue-tsc|svelte-check)\b/i, evidence: "typecheck script evidence was detected." },
    { signal: "build-script", pattern: /"build"\s*:\s*"[^"]*\b(tsc|tsc\s+-b|tsc\s+--build)\b/i, evidence: "build script typecheck evidence was detected." },
    { signal: "noEmit-command", pattern: /\btsc\b[^"\n]*--noEmit/i, evidence: "noEmit command evidence was detected." },
    { signal: "project-build", pattern: /\btsc\b[^"\n]*(--build|-b)\b/i, evidence: "project build command evidence was detected." },
    { signal: "watch", pattern: /\btsc\b[^"\n]*(--watch|-w)\b/i, evidence: "watch command evidence was detected." },
    { signal: "generated-types", pattern: /"types"\s*:|\.d\.ts|declaration/i, evidence: "generated type output evidence was detected." }
  ];
  return typecheckSignalFromSpecs(sourceFiles, specs, "script", "signal");
}

function typecheckSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TypecheckSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/typecheck-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
