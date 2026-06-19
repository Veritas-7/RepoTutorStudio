import type { ReleaseReadinessReport, SecretManagementReadinessReport, SecretReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildReleaseReadinessReport(walk: WalkResult): Promise<ReleaseReadinessReport> {
  const sourceFiles = await releaseSourceFiles(walk);
  const releaseConfigs = releaseConfigSignals(sourceFiles);
  const branchChannels = releaseBranchChannels(sourceFiles);
  const versionSignals = releaseVersionSignals(sourceFiles);
  const ciSignals = releaseCiSignals(sourceFiles);
  const publishTargets = releasePublishTargets(sourceFiles);
  const authSignals = releaseAuthSignals(sourceFiles);
  const pluginSteps = releasePluginSteps(sourceFiles);

  const hasReleaseConfig = releaseConfigs.some((item) => ["semantic-release-config", "releaserc", "package-release-key", "github-workflow"].includes(item.configType));
  const hasCiWorkflow = ciSignals.some((item) => item.signal === "ci-workflow" && item.readiness === "ready");
  const hasTestsBeforeRelease = ciSignals.some((item) => item.signal === "tests-before-release" && item.readiness === "ready");
  const hasAnalyzer = versionSignals.some((item) => ["conventional-commits", "commit-analyzer"].includes(item.signal) && item.readiness === "ready")
    || pluginSteps.some((item) => item.step === "analyzeCommits" && item.readiness === "ready");
  const hasNotes = versionSignals.some((item) => ["release-notes-generator", "changelog"].includes(item.signal) && item.readiness === "ready")
    || pluginSteps.some((item) => item.step === "generateNotes" && item.readiness === "ready");
  const hasPublish = publishTargets.some((item) => item.readiness === "ready")
    || pluginSteps.some((item) => item.step === "publish" && item.readiness === "ready");
  const hasAuth = authSignals.some((item) => ["github-token", "npm-token", "oidc-trusted-publishing", "ssh-key"].includes(item.signal) && item.readiness === "ready");
  const hasOidc = authSignals.some((item) => item.signal === "oidc-trusted-publishing" && item.readiness === "ready")
    || ciSignals.some((item) => item.signal === "id-token-write" && item.readiness === "ready");
  const hasDryRun = ciSignals.some((item) => item.signal === "dry-run" && item.readiness === "ready");
  const hasFetchDepth = ciSignals.some((item) => item.signal === "fetch-depth-zero" && item.readiness === "ready");

  const riskQueue: ReleaseReadinessReport["riskQueue"] = [];
  if (!hasReleaseConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add a semantic-release config before claiming automated release readiness.",
      why: "semantic-release needs branches, tag format, and plugin configuration from package.json, .releaserc, release.config, or CI command context.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasReleaseConfig && !hasCiWorkflow) {
    riskQueue.push({
      priority: "high",
      action: "Run semantic-release only from a release CI workflow after tests pass.",
      why: "semantic-release is designed to publish after successful CI on a release branch, not from an unverified local run.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasCiWorkflow && !hasTestsBeforeRelease) {
    riskQueue.push({
      priority: "high",
      action: "Gate the release job behind test/build jobs.",
      why: "The release command should execute only after every required build and test job succeeds.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasReleaseConfig && !hasAnalyzer) {
    riskQueue.push({
      priority: "medium",
      action: "Configure conventional commit analysis for next-version calculation.",
      why: "Automated releases need repeatable mapping from commits to patch/minor/major outcomes.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasReleaseConfig && !hasNotes) {
    riskQueue.push({
      priority: "medium",
      action: "Add release note or changelog generation.",
      why: "Consumers need generated notes explaining what changed between release tags.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasReleaseConfig && !hasPublish) {
    riskQueue.push({
      priority: "medium",
      action: "Declare at least one publish target such as npm, GitHub release, Docker, changelog, or custom exec.",
      why: "A version calculation without a publish target is useful for dry-run only.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasReleaseConfig && !hasAuth) {
    riskQueue.push({
      priority: "medium",
      action: "Document release authentication through scoped CI tokens or trusted publishing.",
      why: "Tag creation and package publication require explicit credentials with safe scope boundaries.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasReleaseConfig && !hasOidc) {
    riskQueue.push({
      priority: "low",
      action: "Prefer OIDC trusted publishing for npm release jobs when GitHub Actions is used.",
      why: "Trusted publishing reduces reliance on long-lived npm tokens and can produce npm provenance.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasCiWorkflow && !hasFetchDepth) {
    riskQueue.push({
      priority: "low",
      action: "Use full git history in release checkout.",
      why: "semantic-release uses tags and commits since the last release, so shallow checkouts can hide release history.",
      relatedHref: "html/release-readiness.html"
    });
  }
  if (hasReleaseConfig && !hasDryRun) {
    riskQueue.push({
      priority: "low",
      action: "Add a semantic-release dry-run path for configuration review.",
      why: "Dry runs preview the next version and notes without prepare, publish, addChannel, success, or fail side effects.",
      relatedHref: "html/release-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run semantic-release in the original repository before treating this static report as release approval.",
    why: "RepoTutor detects readiness signals only; it does not create tags, publish packages, or verify remote credentials.",
    relatedHref: "html/release-readiness.html"
  });

  return {
    summary: `semantic-release식 release readiness report: config ${releaseConfigs.length}개, branch/channel signal ${branchChannels.length}개, CI signal ${ciSignals.length}개, publish target ${publishTargets.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "semantic-release branches tagFormat plugins verifyConditions analyzeCommits generateNotes prepare publish CI OIDC provenance",
    releaseConfigs,
    branchChannels,
    versionSignals,
    ciSignals,
    publishTargets,
    authSignals,
    pluginSteps,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm install --save-dev semantic-release", purpose: "Install the automated release runner." },
      { command: "npx semantic-release --dry-run", purpose: "Preview next version, tag, and release notes without publishing." },
      { command: "npx semantic-release", purpose: "Run the real release from CI after all required tests pass." },
      { command: "npx commitlint --from <last-release-tag> --to HEAD", purpose: "Check that commits can drive conventional release analysis." },
      { command: "npm audit signatures", purpose: "Verify npm registry signatures or provenance-adjacent package integrity in CI." }
    ],
    learnerNextSteps: [
      "먼저 release config와 CI workflow를 분리해 확인하세요. config만 있고 CI gate가 없으면 아직 배포 준비가 아닙니다.",
      "branches, tagFormat, conventional commit analyzer, release notes generator가 같은 릴리스 모델을 바라보는지 확인하세요.",
      "publish target마다 필요한 토큰과 권한을 기록하고, 가능하면 OIDC trusted publishing을 우선 검토하세요.",
      "이 report는 정적 readiness입니다. 실제 release approval은 원본 repo에서 dry-run과 CI 권한 검증으로 확인하세요."
    ]
  };
}

type ReleaseSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function releaseSourceFiles(walk: WalkResult): Promise<ReleaseSourceFile[]> {
  const files: ReleaseSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !releaseInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!releasePathSignal(file.relPath) && !releaseContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 200) break;
  }
  return files;
}

function releaseInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|\.releaserc(\.json|\.ya?ml|\.js|\.cjs|\.mjs)?|release\.config\.[cm]?js|\.changeset\/config\.json|release-please-config\.json|commitlint\.config\.[cm]?js|CHANGELOG\.md|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(json|ya?ml|md|js|mjs|cjs|ts|tsx|sh)$/i.test(filePath);
}

function releasePathSignal(filePath: string): boolean {
  return /(semantic-release|release\.config|\.releaserc|release-please|changeset|changesets|commitlint|conventional|changelog|publish|deploy|\.github\/workflows\/.+(release|publish|deploy)|npmrc)/i.test(filePath);
}

function releaseContentSignal(text: string): boolean {
  return /(semantic-release|@semantic-release|release-please|changesets?|conventionalcommits?|commitlint|analyzeCommits|generateNotes|verifyConditions|verifyRelease|tagFormat|branches\s*:|GH_TOKEN|GITHUB_TOKEN|NPM_TOKEN|id-token:\s*write|fetch-depth:\s*0|npm audit signatures|workflow_dispatch|dry-run|CHANGELOG|BREAKING CHANGE|npm publish|docker push)/i.test(text);
}

function releaseConfigSignals(sourceFiles: ReleaseSourceFile[]): ReleaseReadinessReport["releaseConfigs"] {
  const rows: ReleaseReadinessReport["releaseConfigs"] = [];
  for (const source of sourceFiles) {
    const configTypes = releaseConfigTypes(source.filePath, source.text);
    for (const configType of configTypes) {
      rows.push({
        filePath: source.filePath,
        configType,
        readiness: configType === "unknown" ? "partial" : "ready",
        evidence: releaseConfigEvidence(source.filePath, configType),
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 120);
}

function releaseConfigTypes(filePath: string, text: string): ReleaseReadinessReport["releaseConfigs"][number]["configType"][] {
  const base = path.basename(filePath);
  const types = new Set<ReleaseReadinessReport["releaseConfigs"][number]["configType"]>();
  if (/^\.releaserc/i.test(base)) types.add("releaserc");
  if (/^release\.config\.[cm]?js$/i.test(base)) types.add("semantic-release-config");
  if (base === "package.json") {
    if (/"release"\s*:/.test(text)) types.add("package-release-key");
    if (/"[^"]*(release|publish)[^"]*"\s*:\s*"[^"]*(semantic-release|changeset|release-please|npm publish)/i.test(text)) types.add("package-script");
  }
  if (/^\.github\/workflows\//i.test(filePath) && /(semantic-release|release-please|changeset|npm publish|docker push)/i.test(text)) types.add("github-workflow");
  if (/\.changeset\/config\.json$/i.test(filePath) || /@changesets\/cli|changeset\s+(version|publish)/i.test(text)) types.add("changesets-config");
  if (/release-please-config\.json$/i.test(filePath) || /release-please/i.test(text)) types.add("release-please-config");
  if (types.size === 0 && /(release|publish|changelog|conventional)/i.test(text)) types.add("unknown");
  return [...types];
}

function releaseConfigEvidence(filePath: string, configType: ReleaseReadinessReport["releaseConfigs"][number]["configType"]): string {
  if (configType === "semantic-release-config") return `${filePath} exports semantic-release configuration.`;
  if (configType === "releaserc") return `${filePath} is a semantic-release config file.`;
  if (configType === "package-release-key") return `${filePath} declares a package.json release configuration key.`;
  if (configType === "package-script") return `${filePath} declares a release or publish package script.`;
  if (configType === "github-workflow") return `${filePath} contains release automation in GitHub Actions.`;
  if (configType === "changesets-config") return `${filePath} contains Changesets release workflow evidence.`;
  if (configType === "release-please-config") return `${filePath} contains release-please workflow evidence.`;
  return `${filePath} contains release-shaped configuration evidence.`;
}

function releaseBranchChannels(sourceFiles: ReleaseSourceFile[]): ReleaseReadinessReport["branchChannels"] {
  const specs: Array<{ channel: ReleaseReadinessReport["branchChannels"][number]["channel"]; pattern: RegExp; evidence: string }> = [
    { channel: "main", pattern: /\bbranches\s*[:=]\s*\[[^\]]*(main|master)|on:\s*[\s\S]{0,200}branches:\s*[\s\S]{0,120}(main|master)/i, evidence: "main/master release branch evidence was detected." },
    { channel: "maintenance", pattern: /\+?\(\[0-9\]\)|\b\d+\.x\b|\bmaintenance\b/i, evidence: "maintenance branch/channel evidence was detected." },
    { channel: "next", pattern: /['"]next['"]|channel\s*:\s*['"]next['"]/i, evidence: "next distribution channel evidence was detected." },
    { channel: "next-major", pattern: /next-major/i, evidence: "next-major distribution channel evidence was detected." },
    { channel: "beta", pattern: /\bbeta\b|prerelease\s*:\s*true/i, evidence: "beta prerelease channel evidence was detected." },
    { channel: "alpha", pattern: /\balpha\b/i, evidence: "alpha prerelease channel evidence was detected." },
    { channel: "custom", pattern: /channel\s*:|branches\s*:\s*\[[\s\S]{0,300}\{[\s\S]{0,300}name\s*:/i, evidence: "custom branch/channel configuration evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      channel: spec.channel,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.channel} branch/channel evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/release-readiness.html"
    };
  });
}

function releaseVersionSignals(sourceFiles: ReleaseSourceFile[]): ReleaseReadinessReport["versionSignals"] {
  const specs: Array<{ signal: ReleaseReadinessReport["versionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "semantic-versioning", pattern: /semantic version|semver|major|minor|patch|version\s*[:=]/i, evidence: "semantic versioning evidence was detected." },
    { signal: "conventional-commits", pattern: /conventionalcommits?|conventional-changelog|commitlint|feat\(|fix\(|perf\(/i, evidence: "conventional commit evidence was detected." },
    { signal: "breaking-change", pattern: /BREAKING CHANGE|breaking\s+release|major release/i, evidence: "breaking change release evidence was detected." },
    { signal: "commit-analyzer", pattern: /@semantic-release\/commit-analyzer|analyzeCommits|commit analyzer/i, evidence: "commit analyzer evidence was detected." },
    { signal: "release-notes-generator", pattern: /@semantic-release\/release-notes-generator|generateNotes|release notes generator/i, evidence: "release notes generator evidence was detected." },
    { signal: "tag-format", pattern: /tagFormat|tag-format|v\$\{version\}|git tag/i, evidence: "tag format or release tag evidence was detected." },
    { signal: "last-release-tag", pattern: /last release|lastRelease|git tag --contains|git branch --contains/i, evidence: "last release tag alignment evidence was detected." },
    { signal: "changelog", pattern: /CHANGELOG|@semantic-release\/changelog|changelog/i, evidence: "changelog evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} version evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/release-readiness.html"
    };
  });
}

function releaseCiSignals(sourceFiles: ReleaseSourceFile[]): ReleaseReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ReleaseReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ci-workflow", pattern: /^\.github\/workflows\//i, evidence: "CI workflow file can host release automation." },
    { signal: "tests-before-release", pattern: /needs\s*:|requires\s*:|test|build|pnpm test|npm test|yarn test|vitest|jest/i, evidence: "test/build gate evidence was detected." },
    { signal: "fetch-depth-zero", pattern: /fetch-depth\s*:\s*0/i, evidence: "full git history checkout is configured." },
    { signal: "contents-write", pattern: /contents\s*:\s*write/i, evidence: "GitHub contents write permission is configured." },
    { signal: "id-token-write", pattern: /id-token\s*:\s*write/i, evidence: "OIDC id-token write permission is configured." },
    { signal: "manual-trigger", pattern: /workflow_dispatch|repository_dispatch/i, evidence: "manual or dispatch release trigger evidence was detected." },
    { signal: "dry-run", pattern: /semantic-release[^\n]*--dry-run|dryRun\s*:\s*true|dry-run/i, evidence: "semantic-release dry-run evidence was detected." },
    { signal: "npm-audit-signatures", pattern: /npm audit signatures/i, evidence: "npm signature verification is configured." },
    { signal: "protected-branch", pattern: /protected branch|branch protection|protected_branches|environments?\s*:/i, evidence: "protected branch/environment release control evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} CI evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/release-readiness.html"
    };
  });
}

function releasePublishTargets(sourceFiles: ReleaseSourceFile[]): ReleaseReadinessReport["publishTargets"] {
  const specs: Array<{ target: ReleaseReadinessReport["publishTargets"][number]["target"]; pattern: RegExp; evidence: string }> = [
    { target: "npm", pattern: /@semantic-release\/npm|npm publish|NPM_TOKEN|trusted publishing|npm provenance/i, evidence: "npm publishing evidence was detected." },
    { target: "github-release", pattern: /@semantic-release\/github|GitHub release|GH_TOKEN|GITHUB_TOKEN|contents\s*:\s*write/i, evidence: "GitHub release publishing evidence was detected." },
    { target: "gitlab-release", pattern: /@semantic-release\/gitlab|GitLab release|GL_TOKEN|GITLAB_TOKEN/i, evidence: "GitLab release publishing evidence was detected." },
    { target: "docker", pattern: /semantic-release.*docker|docker push|Docker Hub|container registry|ghcr\.io/i, evidence: "Docker/container publishing evidence was detected." },
    { target: "vs-code", pattern: /vsce|visual studio code marketplace|\.vsix/i, evidence: "VS Code extension publishing evidence was detected." },
    { target: "git-commit", pattern: /@semantic-release\/git|git plugin|prepare\s*:\s*.*package\.json|persist-credentials\s*:\s*false/i, evidence: "release commit preparation evidence was detected." },
    { target: "changelog", pattern: /@semantic-release\/changelog|CHANGELOG\.md/i, evidence: "changelog publish/prepare evidence was detected." },
    { target: "custom", pattern: /@semantic-release\/exec|exec plugin|verifyRelease|prepareCmd|publishCmd|successCmd|failCmd/i, evidence: "custom exec publish hook evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      target: spec.target,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.target} publish target evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/release-readiness.html"
    };
  });
}

function releaseAuthSignals(sourceFiles: ReleaseSourceFile[]): ReleaseReadinessReport["authSignals"] {
  const specs: Array<{ signal: ReleaseReadinessReport["authSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-token", pattern: /GH_TOKEN|GITHUB_TOKEN/i, evidence: "GitHub token release authentication is referenced." },
    { signal: "npm-token", pattern: /NPM_TOKEN/i, evidence: "npm token release authentication is referenced." },
    { signal: "oidc-trusted-publishing", pattern: /id-token\s*:\s*write|trusted publishing|OIDC|provenance/i, evidence: "OIDC trusted publishing or provenance evidence was detected." },
    { signal: "registry-config", pattern: /\.npmrc|registry-url|custom registry|npm config/i, evidence: "registry configuration evidence was detected." },
    { signal: "ssh-key", pattern: /SSH_PRIVATE_KEY|ssh-key|git-auth-ssh|deploy key/i, evidence: "SSH release authentication evidence was detected." },
    { signal: "persist-credentials-false", pattern: /persist-credentials\s*:\s*false/i, evidence: "checkout credential override control is configured." },
    { signal: "token-redaction", pattern: /hide-sensitive|redact|mask|::add-mask::/i, evidence: "token redaction or masking evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} authentication evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/release-readiness.html"
    };
  });
}

function releasePluginSteps(sourceFiles: ReleaseSourceFile[]): ReleaseReadinessReport["pluginSteps"] {
  const specs: Array<{ step: ReleaseReadinessReport["pluginSteps"][number]["step"]; pattern: RegExp; evidence: string }> = [
    { step: "verifyConditions", pattern: /verifyConditions|@semantic-release\/(npm|github|gitlab|git|exec)/i, evidence: "verifyConditions plugin step evidence was detected." },
    { step: "analyzeCommits", pattern: /analyzeCommits|@semantic-release\/commit-analyzer/i, evidence: "analyzeCommits plugin step evidence was detected." },
    { step: "verifyRelease", pattern: /verifyRelease/i, evidence: "verifyRelease plugin step evidence was detected." },
    { step: "generateNotes", pattern: /generateNotes|@semantic-release\/release-notes-generator/i, evidence: "generateNotes plugin step evidence was detected." },
    { step: "prepare", pattern: /\bprepare\b|@semantic-release\/(npm|git|changelog)|prepareCmd/i, evidence: "prepare plugin step evidence was detected." },
    { step: "publish", pattern: /\bpublish\b|@semantic-release\/(npm|github|gitlab|exec)|publishCmd/i, evidence: "publish plugin step evidence was detected." },
    { step: "addChannel", pattern: /addChannel|dist-tag|distribution channel/i, evidence: "addChannel plugin step evidence was detected." },
    { step: "success", pattern: /\bsuccess\b|successCmd|released issues|released pull requests/i, evidence: "success notification step evidence was detected." },
    { step: "fail", pattern: /\bfail\b|failCmd|release failed|failed release/i, evidence: "fail notification step evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      step: spec.step,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.step} plugin step evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/release-readiness.html"
    };
  });
}

export async function buildSecretReadinessReport(walk: WalkResult): Promise<SecretReadinessReport> {
  const sourceFiles = await secretSourceFiles(walk);
  const secretSurfaces = secretSurfaceRows(walk, sourceFiles);
  const configSignals = secretConfigSignals(sourceFiles);
  const scanTargets = secretScanTargets(sourceFiles, walk);
  const reportingSignals = secretReportingSignals(sourceFiles);
  const preventionSignals = secretPreventionSignals(sourceFiles);
  const advancedSignals = secretAdvancedSignals(sourceFiles);
  const hasConfig = configSignals.some((item) => ["gitleaks-config", "extend-default", "custom-rule"].includes(item.signal));
  const hasGitScan = scanTargets.some((item) => item.target === "git-history" && item.readiness === "ready");
  const hasDirScan = scanTargets.some((item) => item.target === "working-tree" && item.readiness === "ready");
  const hasPrevention = preventionSignals.some((item) => ["pre-commit", "staged", "github-action", "ci"].includes(item.signal) && item.readiness === "ready");
  const hasReport = reportingSignals.some((item) => ["json", "sarif", "report-path"].includes(item.signal) && item.readiness === "ready");
  const hasRedaction = reportingSignals.some((item) => item.signal === "redaction" && item.readiness === "ready");
  const hasBaseline = reportingSignals.some((item) => item.signal === "baseline" && item.readiness === "ready");
  const hasAllowlist = configSignals.some((item) => ["allowlist", "gitleaksignore", "allow-comment"].includes(item.signal));

  const riskQueue: SecretReadinessReport["riskQueue"] = [];
  if (!hasGitScan && !hasDirScan) {
    riskQueue.push({
      priority: "high",
      action: "Add a Gitleaks git or dir scan target before claiming secret scanning coverage.",
      why: "Gitleaks separates git-history scanning from working-tree file scanning, and each catches different leak surfaces.",
      relatedHref: "html/secret-readiness.html"
    });
  }
  if (!hasPrevention) {
    riskQueue.push({
      priority: "high",
      action: "Run secret scanning before commits or in CI.",
      why: "A report-only scanner catches leaks late; pre-commit, staged, and CI gates reduce the chance of publishing credentials.",
      relatedHref: "html/secret-readiness.html"
    });
  }
  if (secretSurfaces.length > 0 && !hasConfig) {
    riskQueue.push({
      priority: "medium",
      action: "Add a .gitleaks.toml config or explicit config path for project-specific rules and false-positive handling.",
      why: "Secret-shaped paths exist, so default rules may need project-specific allowlists or custom rule tuning.",
      relatedHref: "html/secret-readiness.html"
    });
  }
  if (!hasReport) {
    riskQueue.push({
      priority: "medium",
      action: "Emit machine-readable secret scan reports such as JSON or SARIF.",
      why: "Auditable release gates need a durable report path rather than transient terminal output.",
      relatedHref: "html/secret-readiness.html"
    });
  }
  if (!hasRedaction) {
    riskQueue.push({
      priority: "medium",
      action: "Use --redact when showing findings in logs.",
      why: "Secret scanners can accidentally reprint credentials unless output is redacted.",
      relatedHref: "html/secret-readiness.html"
    });
  }
  if (!hasBaseline && secretSurfaces.length > 0) {
    riskQueue.push({
      priority: "low",
      action: "Create a baseline before enforcing on a repository with existing findings.",
      why: "Gitleaks baselines let teams separate old accepted findings from new leaks.",
      relatedHref: "html/secret-readiness.html"
    });
  }
  if (!hasAllowlist && hasConfig) {
    riskQueue.push({
      priority: "low",
      action: "Document allowlists or .gitleaksignore fingerprints for intentional test fixtures.",
      why: "False-positive handling should be reviewable and narrow instead of disabling broad scan coverage.",
      relatedHref: "html/secret-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Gitleaks in the original repository before treating this static report as secret-scan approval.",
    why: "RepoTutor does not inspect excluded secret-like file contents or traverse full git history.",
    relatedHref: "html/secret-readiness.html"
  });

  return {
    summary: `Gitleaks식 secret readiness report: scan target ${scanTargets.length}개, secret surface ${secretSurfaces.length}개, config signal ${configSignals.length}개, prevention signal ${preventionSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Gitleaks git dir stdin baseline config rules allowlists redaction report formats pre-commit staged secret scanning",
    scanTargets,
    secretSurfaces,
    configSignals,
    reportingSignals,
    preventionSignals,
    advancedSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "gitleaks git --redact --report-format sarif --report-path gitleaks.sarif .", purpose: "Scan git history and write a redacted SARIF report for code-scanning systems." },
      { command: "gitleaks dir --redact --report-format json --report-path gitleaks.json .", purpose: "Scan the current working tree and write durable JSON findings." },
      { command: "gitleaks git --baseline-path gitleaks-report.json --report-path findings.json .", purpose: "Filter known findings through a baseline and report only new issues." },
      { command: "gitleaks git --pre-commit --redact --staged --verbose", purpose: "Run a staged pre-commit scan before local commits." },
      { command: "gitleaks git --config .gitleaks.toml --redact .", purpose: "Run with project-specific rules, entropy thresholds, and allowlists." }
    ],
    learnerNextSteps: [
      "git-history scan과 working-tree scan은 다릅니다. 둘 중 무엇을 커버하는지 먼저 확인하세요.",
      "secret-shaped path는 내용이 안전 필터로 제외될 수 있으므로 원본 repo에서 실제 scanner를 다시 실행하세요.",
      "baseline, allowlist, gitleaks:allow는 누락을 숨길 수 있으므로 좁은 scope와 fingerprint 중심으로 검토하세요.",
      "로그나 CI summary에 findings를 노출할 때는 반드시 redaction과 report artifact 경로를 확인하세요."
    ]
  };
}

type SecretSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function secretSourceFiles(walk: WalkResult): Promise<SecretSourceFile[]> {
  const files: SecretSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !secretInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!secretPathSignal(file.relPath) && !secretContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 200) break;
  }
  return files;
}

function secretInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|\.gitleaks\.toml|gitleaks\.toml|\.gitleaksignore|\.pre-commit-config\.ya?ml|pre-commit-config\.ya?ml|\.pre-commit-hooks\.ya?ml|README\.md|SECURITY\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(toml|ya?ml|json|md|js|ts|tsx|sh|env|example|sample)$/i.test(filePath);
}

function secretPathSignal(filePath: string): boolean {
  return /(gitleaks|secret|secrets|credential|credentials|token|tokens|password|passwd|apikey|api-key|\.env|pre-commit|security|sarif)/i.test(filePath);
}

function secretContentSignal(text: string): boolean {
  return /(gitleaks|secret scanning|detect secrets|hardcoded secrets|baseline-path|gitleaksignore|gitleaks:allow|allowlists?|secretGroup|entropy|report-format|report-path|redact|pre-commit|--staged|SARIF|GITLEAKS_CONFIG|GITLEAKS_CONFIG_TOML|max-decode-depth|max-archive-depth)/i.test(text);
}

function secretSurfaceRows(walk: WalkResult, sourceFiles: SecretSourceFile[]): SecretReadinessReport["secretSurfaces"] {
  const ignored = walk.secretCandidatePaths.map((filePath): SecretReadinessReport["secretSurfaces"][number] => ({
    filePath,
    surfaceType: "ignored-secret-candidate",
    readiness: "partial",
    evidence: `${filePath} matched RepoTutor secret-like path filters and was excluded from generated session \`source/\` snapshot content.`,
    sourceHref: "html/secret-readiness.html"
  }));
  const detected = sourceFiles
    .filter((source) => secretSurfaceType(source.filePath) !== "unknown")
    .map((source): SecretReadinessReport["secretSurfaces"][number] => {
      const surfaceType = secretSurfaceType(source.filePath);
      return {
        filePath: source.filePath,
        surfaceType,
        readiness: surfaceType === "unknown" ? "partial" : "ready",
        evidence: `${source.filePath} is a secret-scanning surface candidate by path or config role.`,
        sourceHref: source.sourceHref
      };
    });
  const rows = [...ignored, ...detected];
  return rows.slice(0, 120);
}

function secretSurfaceType(filePath: string): SecretReadinessReport["secretSurfaces"][number]["surfaceType"] {
  const base = path.basename(filePath).toLowerCase();
  if (/^\.env|\.env\.|env\.|\.env$/.test(base)) return "env-file";
  if (/\.(pem|key|p12|pfx|crt|cer|jks)$/i.test(base)) return "key-file";
  if (/(credential|credentials|secrets?)\.(json|ya?ml|toml|ini|conf)$/i.test(base) || /(credential|credentials|secrets?)\//i.test(filePath)) return "credential-config";
  if (/(token|apikey|api-key|password|passwd)/i.test(filePath)) return "token-path";
  return "unknown";
}

function secretConfigSignals(sourceFiles: SecretSourceFile[]): SecretReadinessReport["configSignals"] {
  const rows: SecretReadinessReport["configSignals"] = [];
  for (const source of sourceFiles) {
    for (const signal of secretConfigSignalTypes(source.filePath, source.text)) {
      rows.push({
        filePath: source.filePath,
        signal,
        readiness: signal === "unknown" ? "partial" : "ready",
        evidence: secretConfigSignalEvidence(source.filePath, signal),
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 140);
}

function secretConfigSignalTypes(filePath: string, text: string): SecretReadinessReport["configSignals"][number]["signal"][] {
  const signals = new Set<SecretReadinessReport["configSignals"][number]["signal"]>();
  if (/\.gitleaks\.toml$|gitleaks\.toml$/i.test(filePath) || /GITLEAKS_CONFIG|GITLEAKS_CONFIG_TOML/i.test(text)) signals.add("gitleaks-config");
  if (/\[extend\]|useDefault|disabledRules|path\s*=.*gitleaks/i.test(text)) signals.add("extend-default");
  if (/\[\[rules\]\]|id\s*=|description\s*=|regex\s*=|path\s*=/i.test(text)) signals.add("custom-rule");
  if (/entropy\s*=/i.test(text)) signals.add("entropy");
  if (/secretGroup\s*=/i.test(text)) signals.add("secret-group");
  if (/keywords\s*=/i.test(text)) signals.add("keywords");
  if (/allowlists?|targetRules|stopwords|regexTarget/i.test(text)) signals.add("allowlist");
  if (/\.gitleaksignore$/i.test(filePath) || /Fingerprint|gitleaksignore/i.test(text)) signals.add("gitleaksignore");
  if (/gitleaks:allow/i.test(text)) signals.add("allow-comment");
  if (signals.size === 0 && secretContentSignal(text)) signals.add("unknown");
  return [...signals];
}

function secretConfigSignalEvidence(filePath: string, signal: SecretReadinessReport["configSignals"][number]["signal"]): string {
  if (signal === "gitleaks-config") return `${filePath} provides or references Gitleaks configuration.`;
  if (signal === "extend-default") return `${filePath} config extends default or shared Gitleaks rules.`;
  if (signal === "custom-rule") return `${filePath} contains custom rule metadata or regex evidence.`;
  if (signal === "entropy") return `${filePath} config references entropy thresholds.`;
  if (signal === "secret-group") return `${filePath} config references secretGroup extraction.`;
  if (signal === "keywords") return `${filePath} config references keyword prefilters.`;
  if (signal === "allowlist") return `${filePath} config references allowlist criteria.`;
  if (signal === "gitleaksignore") return `${filePath} references finding fingerprint ignore workflow.`;
  if (signal === "allow-comment") return `${filePath} references inline gitleaks:allow suppression.`;
  return `${filePath} contains secret-scanning configuration evidence.`;
}

function secretScanTargets(sourceFiles: SecretSourceFile[], walk: WalkResult): SecretReadinessReport["scanTargets"] {
  const specs: Array<{ target: SecretReadinessReport["scanTargets"][number]["target"]; pattern: RegExp; evidence: string }> = [
    { target: "git-history", pattern: /gitleaks\s+(git|detect)|git log -p|log-opts/i, evidence: "git history scan evidence was detected." },
    { target: "working-tree", pattern: /gitleaks\s+(dir|files|directory)|scan directories|scan files/i, evidence: "directory or file scan evidence was detected." },
    { target: "stdin", pattern: /gitleaks\s+stdin|detect secrets from stdin/i, evidence: "stdin scan evidence was detected." },
    { target: "pre-commit", pattern: /pre-commit|--pre-commit|\.pre-commit-config/i, evidence: "pre-commit scan evidence was detected." },
    { target: "archive", pattern: /max-archive-depth|archive scanning|zip|tarball/i, evidence: "archive scan evidence was detected." },
    { target: "config", pattern: /\.gitleaks\.toml|--config|GITLEAKS_CONFIG/i, evidence: "config-driven scan evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    const hasSurface = walk.files.some((file) => file.isTextCandidate) || walk.secretCandidatePaths.length > 0;
    return {
      target: spec.target,
      readiness: match ? "ready" : hasSurface ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.target} scan target evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/secret-readiness.html"
    };
  });
}

function secretReportingSignals(sourceFiles: SecretSourceFile[]): SecretReadinessReport["reportingSignals"] {
  const specs: Array<{ signal: SecretReadinessReport["reportingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "json", pattern: /report-format\s+(json|.*json)|--report-format[=\s]+json/i, evidence: "JSON report output evidence was detected." },
    { signal: "csv", pattern: /report-format\s+(csv|.*csv)|--report-format[=\s]+csv/i, evidence: "CSV report output evidence was detected." },
    { signal: "junit", pattern: /report-format\s+(junit|.*junit)|--report-format[=\s]+junit/i, evidence: "JUnit report output evidence was detected." },
    { signal: "sarif", pattern: /sarif|--report-format[=\s]+sarif/i, evidence: "SARIF report output evidence was detected." },
    { signal: "template", pattern: /--report-template|report format template|\.tmpl/i, evidence: "custom template report evidence was detected." },
    { signal: "report-path", pattern: /--report-path|report-path|gitleaks-report\.json|findings\.json/i, evidence: "durable report path evidence was detected." },
    { signal: "baseline", pattern: /--baseline-path|baseline-path|baseline/i, evidence: "baseline report evidence was detected." },
    { signal: "fingerprint", pattern: /Fingerprint|fingerprint/i, evidence: "finding fingerprint evidence was detected." },
    { signal: "redaction", pattern: /--redact|redact/i, evidence: "redacted output evidence was detected." }
  ];
  return specs.map((spec) => secretReadinessFromSpecs(sourceFiles, spec, "reporting"));
}

function secretPreventionSignals(sourceFiles: SecretSourceFile[]): SecretReadinessReport["preventionSignals"] {
  const specs: Array<{ signal: SecretReadinessReport["preventionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pre-commit", pattern: /pre-commit|\.pre-commit-config|\.pre-commit-hooks/i, evidence: "pre-commit hook evidence was detected." },
    { signal: "staged", pattern: /--staged|staged/i, evidence: "staged diff scan evidence was detected." },
    { signal: "git-hook", pattern: /\.git\/hooks|git hooks?|pre-commit\.py/i, evidence: "git hook installation evidence was detected." },
    { signal: "github-action", pattern: /gitleaks-action|uses:\s*gitleaks|github action/i, evidence: "GitHub Action scanner evidence was detected." },
    { signal: "ci", pattern: /^\.github\/workflows\//i, evidence: "CI workflow can host secret scanning." },
    { signal: "exit-code", pattern: /--exit-code|exit-code/i, evidence: "scanner failure exit code evidence was detected." },
    { signal: "protect-legacy", pattern: /gitleaks\s+protect|protect command/i, evidence: "legacy protect command evidence was detected." }
  ];
  return specs.map((spec) => secretReadinessFromSpecs(sourceFiles, spec, "prevention"));
}

function secretAdvancedSignals(sourceFiles: SecretSourceFile[]): SecretReadinessReport["advancedSignals"] {
  const specs: Array<{ signal: SecretReadinessReport["advancedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "decode-depth", pattern: /--max-decode-depth|max-decode-depth|decoded:/i, evidence: "recursive decoding evidence was detected." },
    { signal: "archive-depth", pattern: /--max-archive-depth|max-archive-depth|archive scanning/i, evidence: "archive traversal evidence was detected." },
    { signal: "diagnostics", pattern: /--diagnostics|diagnostics-dir|pprof|cpu,mem,trace/i, evidence: "diagnostics evidence was detected." },
    { signal: "enable-rule", pattern: /--enable-rule|enable-rule/i, evidence: "rule selection evidence was detected." },
    { signal: "log-opts", pattern: /--log-opts|log-opts|git log -p/i, evidence: "git log option evidence was detected." },
    { signal: "timeout", pattern: /--timeout|timeout/i, evidence: "scanner timeout control evidence was detected." }
  ];
  return specs.map((spec) => secretReadinessFromSpecs(sourceFiles, spec, "advanced"));
}

function secretReadinessFromSpecs<T extends string>(
  sourceFiles: SecretSourceFile[],
  spec: { signal: T; pattern: RegExp; evidence: string },
  label: string
): { signal: T; readiness: "ready" | "partial" | "missing" | "external"; evidence: string; relatedHref: string } {
  const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
  return {
    signal: spec.signal,
    readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
    evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} ${label} evidence was not detected.`,
    relatedHref: match?.sourceHref ?? "html/secret-readiness.html"
  };
}

export async function buildSecretManagementReadinessReport(walk: WalkResult): Promise<SecretManagementReadinessReport> {
  const sourceFiles = await secretManagementSourceFiles(walk);
  const secretManagementSetups = secretManagementSetupRows(sourceFiles);
  const platformSignals = secretManagementPlatformSignals(sourceFiles);
  const authSignals = secretManagementAuthSignals(sourceFiles);
  const storageSignals = secretManagementStorageSignals(sourceFiles);
  const deliverySignals = secretManagementDeliverySignals(sourceFiles);
  const governanceSignals = secretManagementGovernanceSignals(sourceFiles);
  const packageSignals = secretManagementPackageSignals(sourceFiles);
  const hasPlatform = platformSignals.some((item) => item.readiness === "ready" && item.signal !== "custom");
  const hasAuth = authSignals.some((item) => item.readiness === "ready");
  const hasPolicy = governanceSignals.some((item) => ["policy", "rbac"].includes(item.signal) && item.readiness === "ready");
  const hasDelivery = deliverySignals.some((item) => item.readiness === "ready");
  const hasRotationOrLease = governanceSignals.some((item) => ["rotation", "lease"].includes(item.signal) && item.readiness === "ready")
    || secretManagementSetups.some((item) => item.rotationCount > 0 || item.leaseCount > 0);
  const hasAudit = governanceSignals.some((item) => item.signal === "audit-log" && item.readiness === "ready")
    || secretManagementSetups.some((item) => item.auditCount > 0);
  const hasEncryption = storageSignals.some((item) => ["transit", "certificate"].includes(item.signal) && item.readiness === "ready")
    || secretManagementSetups.some((item) => item.encryptionCount > 0);

  const riskQueue: SecretManagementReadinessReport["riskQueue"] = [];
  if (!hasPlatform) {
    riskQueue.push({
      priority: "high",
      action: "Identify the runtime secret-management platform before treating secrets as operationally managed.",
      why: "Secret scanning can catch leaks, but production operation also needs a system of record such as Vault, Infisical, Doppler, SOPS, or Kubernetes secret controllers.",
      relatedHref: "html/secret-management-readiness.html"
    });
  }
  if (hasPlatform && (!hasAuth || !hasPolicy)) {
    riskQueue.push({
      priority: "high",
      action: "Pair the secret-management platform with explicit auth methods and policy or RBAC controls.",
      why: "A configured platform without auth and authorization evidence can still expose broad tokens or unmanaged access paths.",
      relatedHref: "html/secret-management-readiness.html"
    });
  }
  if (hasPlatform && !hasDelivery) {
    riskQueue.push({
      priority: "medium",
      action: "Document how applications receive secrets at runtime.",
      why: "Operators need to know whether secrets are injected through CLI wrappers, agents, Kubernetes operators, sync controllers, CI/CD, or SDK/API calls.",
      relatedHref: "html/secret-management-readiness.html"
    });
  }
  if (hasPlatform && !hasRotationOrLease) {
    riskQueue.push({
      priority: "medium",
      action: "Add rotation, TTL, lease, renew, or revoke evidence for secrets that should not be static.",
      why: "Managed secret systems are strongest when credentials expire or rotate instead of persisting indefinitely.",
      relatedHref: "html/secret-management-readiness.html"
    });
  }
  if (hasPlatform && !hasAudit) {
    riskQueue.push({
      priority: "low",
      action: "Expose audit logs or telemetry for secret access.",
      why: "Access logs make incident review and permission drift visible.",
      relatedHref: "html/secret-management-readiness.html"
    });
  }
  if (hasPlatform && !hasEncryption) {
    riskQueue.push({
      priority: "low",
      action: "Record encryption, KMS, SOPS, transit, PKI, or certificate-management evidence.",
      why: "Secret management often includes encryption workflows beyond simple key/value storage.",
      relatedHref: "html/secret-management-readiness.html"
    });
  }

  return {
    summary: `Secret-management readiness report: platform signal ${platformSignals.filter((item) => item.readiness === "ready").length}개, auth signal ${authSignals.filter((item) => item.readiness === "ready").length}개, delivery signal ${deliverySignals.filter((item) => item.readiness === "ready").length}개, governance signal ${governanceSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Secrets management readiness Vault Infisical Doppler SOPS Sealed Secrets External Secrets secret engines auth methods policies tokens leases rotation transit kv env injection sync Kubernetes operator agent CLI SDK API audit logs dynamic secrets",
    secretManagementSetups,
    platformSignals,
    authSignals,
    storageSignals,
    deliverySignals,
    governanceSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"Vault|VAULT_ADDR|vault kv|vault secrets|Infisical|infisical|Doppler|doppler run|doppler setup\" package.json src app docs .github", purpose: "Find platform-specific secret-management references across code, docs, and workflows." },
      { command: "rg \"auth method|AppRole|kubernetes auth|oidc|aws auth|gcp auth|azure auth|universal auth|token|policy|rbac\" src app docs infra config", purpose: "Review auth method and authorization evidence for secret-management access." },
      { command: "rg \"SOPS|\\.sops|SealedSecret|ExternalSecret|SecretStore|ClusterSecretStore|rotation|lease|audit log|transit|pki|dynamic secrets\" .", purpose: "Find encryption, Kubernetes sync, rotation, lease, and audit-log readiness signals." }
    ],
    learnerNextSteps: [
      "Secret scanning과 secret management를 분리해서 보세요. 스캐너는 유출 탐지이고, Vault/Infisical/Doppler/SOPS 계열은 운영·전달·회전 체계입니다.",
      "플랫폼 이름만 있으면 부족합니다. auth method, policy/RBAC, delivery path, audit log, rotation/lease 증거를 같이 확인하세요.",
      "Kubernetes에서는 ExternalSecret, SecretStore, ClusterSecretStore, SealedSecret이 실제 배포 경로와 연결되는지 추적하세요.",
      "RepoTutor는 설정을 실행하지 않습니다. 실제 플랫폼 CLI/API 검증은 원본 환경에서 별도 수행해야 합니다."
    ]
  };
}

type SecretManagementSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function secretManagementSourceFiles(walk: WalkResult): Promise<SecretManagementSourceFile[]> {
  const files: SecretManagementSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !secretManagementInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!secretManagementPathSignal(file.relPath) && !secretManagementContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function secretManagementInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|README\.md|SECURITY\.md|\.sops\.ya?ml|sops\.ya?ml|vault\.(hcl|json|ya?ml|toml)|infisical\.(json|ya?ml|toml)|doppler\.(json|ya?ml|toml))$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(vault|infisical|doppler|sops|sealed-?secret|external-?secret|secret-store|clustersecretstore|secrets?-management|secret-sync|pki|kms)/i.test(filePath)
    || /\.(hcl|toml|ya?ml|json|md|js|jsx|ts|tsx|mjs|cjs|go|py|rb|sh|env|example|sample)$/i.test(filePath);
}

function secretManagementPathSignal(filePath: string): boolean {
  return /(vault|infisical|doppler|sops|sealed-?secret|external-?secret|secret-store|clustersecretstore|secrets?-management|secret-sync|pki|kms|secret)/i.test(filePath);
}

function secretManagementContentSignal(text: string): boolean {
  return /(Vault|vault\s+(kv|secrets|auth|policy|login)|VAULT_ADDR|VAULT_TOKEN|Infisical|infisical|Doppler|doppler\s+(run|setup|login|secrets)|SOPS|\.sops|SealedSecret|ExternalSecret|SecretStore|ClusterSecretStore|secret engine|auth method|AppRole|transit|lease|rotation|audit log|dynamic secrets|env injection|secret sync|machine identity|Universal Auth|Kubernetes Operator|External Secrets)/i.test(text);
}

function secretManagementSetupRows(sourceFiles: SecretManagementSourceFile[]): SecretManagementReadinessReport["secretManagementSetups"] {
  return sourceFiles.map((source): SecretManagementReadinessReport["secretManagementSetups"][number] => {
    const authCount = countMatches(source.text, /(auth method|login|token|AppRole|Kubernetes Auth|kubernetes auth|OIDC|AWS Auth|GCP Auth|Azure Auth|Universal Auth|machine identity|service token)/gi);
    const engineCount = countMatches(source.text, /(secret engine|kv|transit|pki|database secrets|dynamic secrets|secret mount|vault secrets enable|certificates?)/gi);
    const policyCount = countMatches(source.text, /(policy|policies|rbac|role|permission|least privilege|access request|break glass)/gi);
    const injectionCount = countMatches(source.text, /(doppler run|infisical run|env injection|agent|sidecar|template|envFrom|secretRef|secrets\.inject)/gi);
    const rotationCount = countMatches(source.text, /(rotation|rotate|dynamic|TTL|lease|renew|revoke|expiry|expiration)/gi);
    const syncCount = countMatches(source.text, /(sync|Kubernetes Operator|ExternalSecret|SecretStore|ClusterSecretStore|SealedSecret|certificate sync)/gi);
    const auditCount = countMatches(source.text, /(audit|audit log|logs|telemetry|metrics|access log|event)/gi);
    const leaseCount = countMatches(source.text, /(lease|renew|revoke|ttl|token TTL|max_ttl)/gi);
    const encryptionCount = countMatches(source.text, /(transit|kms|SOPS|age|pgp|sealed secret|encryption as a service|encrypt|decrypt)/gi);
    const cliCount = countMatches(source.text, /(vault\s+(kv|login|secrets|auth|policy)|infisical\s+(run|login|secrets|export)|doppler\s+(run|setup|login|secrets)|sops\b)/gi);
    const filledBuckets = [authCount, engineCount, policyCount, injectionCount, rotationCount, syncCount, auditCount, leaseCount, encryptionCount, cliCount].filter((count) => count > 0).length;
    return {
      filePath: source.filePath,
      provider: secretManagementProvider(source),
      authCount,
      engineCount,
      policyCount,
      injectionCount,
      rotationCount,
      syncCount,
      auditCount,
      leaseCount,
      encryptionCount,
      cliCount,
      readiness: filledBuckets >= 4 ? "ready" : filledBuckets > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains secret-management platform, delivery, governance, or package evidence.`,
      sourceHref: source.sourceHref
    };
  }).slice(0, 140);
}

function secretManagementProvider(source: SecretManagementSourceFile): SecretManagementReadinessReport["secretManagementSetups"][number]["provider"] {
  const combined = `${source.filePath}\n${source.text}`;
  if (/Vault|VAULT_|vault\s+(kv|secrets|auth|policy|login)|node-vault/i.test(combined)) return "vault";
  if (/Infisical|@infisical\/sdk|infisical/i.test(combined)) return "infisical";
  if (/Doppler|doppler\s+(run|setup|login|secrets)/i.test(combined)) return "doppler";
  if (/\.sops|SOPS|\bsops\b|age|pgp/i.test(combined)) return "sops";
  if (/SealedSecret|sealed-?secrets?|kubeseal/i.test(combined)) return "sealed-secrets";
  if (/ExternalSecret|SecretStore|ClusterSecretStore|external-?secrets?/i.test(combined)) return "external-secrets";
  if (/secret management|secret sync|dynamic secrets|env injection/i.test(combined)) return "custom";
  return "unknown";
}

function secretManagementPlatformSignals(sourceFiles: SecretManagementSourceFile[]): SecretManagementReadinessReport["platformSignals"] {
  const specs: Array<{ signal: SecretManagementReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vault", pattern: /Vault|VAULT_|vault\s+(kv|secrets|auth|policy|login)|node-vault/i, evidence: "Vault platform evidence was detected." },
    { signal: "infisical", pattern: /Infisical|@infisical\/sdk|infisical/i, evidence: "Infisical platform evidence was detected." },
    { signal: "doppler", pattern: /Doppler|doppler\s+(run|setup|login|secrets)/i, evidence: "Doppler platform evidence was detected." },
    { signal: "sops", pattern: /\.sops|SOPS|\bsops\b|age|pgp/i, evidence: "SOPS encrypted file workflow evidence was detected." },
    { signal: "sealed-secrets", pattern: /SealedSecret|sealed-?secrets?|kubeseal/i, evidence: "Sealed Secrets evidence was detected." },
    { signal: "external-secrets", pattern: /ExternalSecret|SecretStore|ClusterSecretStore|external-?secrets?/i, evidence: "External Secrets evidence was detected." },
    { signal: "custom", pattern: /secret management|secret sync|dynamic secrets|env injection/i, evidence: "Custom secret-management evidence was detected." }
  ];
  return specs.map((spec) => secretManagementSignalFromSpecs(sourceFiles, spec, "platform"));
}

function secretManagementAuthSignals(sourceFiles: SecretManagementSourceFile[]): SecretManagementReadinessReport["authSignals"] {
  const specs: Array<{ signal: SecretManagementReadinessReport["authSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "token", pattern: /\btoken\b|VAULT_TOKEN|service token|personal token/i, evidence: "token auth evidence was detected." },
    { signal: "approle", pattern: /AppRole|approle|role_id|secret_id/i, evidence: "AppRole auth evidence was detected." },
    { signal: "kubernetes-auth", pattern: /Kubernetes Auth|kubernetes auth|auth\/kubernetes|serviceaccount|service account/i, evidence: "Kubernetes auth evidence was detected." },
    { signal: "oidc", pattern: /OIDC|OpenID Connect|JWT auth|auth\/jwt/i, evidence: "OIDC or JWT auth evidence was detected." },
    { signal: "aws-auth", pattern: /AWS Auth|aws auth|auth\/aws|IAM role|IAM auth/i, evidence: "AWS auth evidence was detected." },
    { signal: "gcp-auth", pattern: /GCP Auth|gcp auth|auth\/gcp|Google Cloud auth/i, evidence: "GCP auth evidence was detected." },
    { signal: "azure-auth", pattern: /Azure Auth|azure auth|auth\/azure|managed identity/i, evidence: "Azure auth evidence was detected." },
    { signal: "universal-auth", pattern: /Universal Auth|machine identity|client secret|client id/i, evidence: "Universal or machine identity auth evidence was detected." }
  ];
  return specs.map((spec) => secretManagementSignalFromSpecs(sourceFiles, spec, "auth"));
}

function secretManagementStorageSignals(sourceFiles: SecretManagementSourceFile[]): SecretManagementReadinessReport["storageSignals"] {
  const specs: Array<{ signal: SecretManagementReadinessReport["storageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kv", pattern: /\bkv\b|key\/value|key-value|vault kv/i, evidence: "key/value secret storage evidence was detected." },
    { signal: "secret-engine", pattern: /secret engine|vault secrets enable|secret mount/i, evidence: "secret engine evidence was detected." },
    { signal: "dynamic-secrets", pattern: /dynamic secrets?|database credentials?|leased credentials?/i, evidence: "dynamic secret evidence was detected." },
    { signal: "pki", pattern: /\bpki\b|PKI|certificate authority/i, evidence: "PKI evidence was detected." },
    { signal: "transit", pattern: /transit|encryption as a service/i, evidence: "transit encryption evidence was detected." },
    { signal: "certificate", pattern: /certificates?|certificate sync|TLS cert/i, evidence: "certificate management evidence was detected." },
    { signal: "database-credentials", pattern: /database secrets?|database credentials?|db credentials?/i, evidence: "database credential evidence was detected." },
    { signal: "environment-config", pattern: /environment config|app config|env injection|doppler run|infisical run/i, evidence: "environment configuration evidence was detected." }
  ];
  return specs.map((spec) => secretManagementSignalFromSpecs(sourceFiles, spec, "storage"));
}

function secretManagementDeliverySignals(sourceFiles: SecretManagementSourceFile[]): SecretManagementReadinessReport["deliverySignals"] {
  const specs: Array<{ signal: SecretManagementReadinessReport["deliverySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "env-injection", pattern: /env injection|environment injection|envFrom|secretRef|doppler run|infisical run/i, evidence: "environment injection evidence was detected." },
    { signal: "cli-run", pattern: /doppler run|infisical run|vault\s+(kv|login|secrets|auth|policy)|sops\b/i, evidence: "CLI runtime evidence was detected." },
    { signal: "agent", pattern: /agent|sidecar|vault agent|infisical agent|template/i, evidence: "agent or sidecar delivery evidence was detected." },
    { signal: "kubernetes-operator", pattern: /Kubernetes Operator|operator|ExternalSecret|SecretStore|ClusterSecretStore/i, evidence: "Kubernetes operator evidence was detected." },
    { signal: "sync", pattern: /sync|secret sync|certificate sync|ExternalSecret|SealedSecret/i, evidence: "secret sync evidence was detected." },
    { signal: "github-action", pattern: /GitHub Action|github action|uses:\s*.*(vault|infisical|doppler|sops|external-secrets)/i, evidence: "GitHub Action delivery evidence was detected." },
    { signal: "ci-cd", pattern: /CI\/CD|continuous integration|pipeline|workflow|gitlab-ci|circleci|jenkins/i, evidence: "CI/CD delivery evidence was detected." },
    { signal: "sdk-api", pattern: /SDK|API|@infisical\/sdk|node-vault|client\.secrets|vault client/i, evidence: "SDK/API access evidence was detected." }
  ];
  return specs.map((spec) => secretManagementSignalFromSpecs(sourceFiles, spec, "delivery"));
}

function secretManagementGovernanceSignals(sourceFiles: SecretManagementSourceFile[]): SecretManagementReadinessReport["governanceSignals"] {
  const specs: Array<{ signal: SecretManagementReadinessReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "policy", pattern: /policy|policies|vault policy|least privilege/i, evidence: "policy evidence was detected." },
    { signal: "rbac", pattern: /rbac|role-based|role binding|permission|role:/i, evidence: "RBAC or role evidence was detected." },
    { signal: "audit-log", pattern: /audit log|audit|access log|telemetry|metrics/i, evidence: "audit log or telemetry evidence was detected." },
    { signal: "lease", pattern: /lease|renew|revoke|ttl|token TTL|max_ttl/i, evidence: "lease lifecycle evidence was detected." },
    { signal: "rotation", pattern: /rotation|rotate|expiry|expiration|dynamic secret/i, evidence: "rotation evidence was detected." },
    { signal: "versioning", pattern: /versioning|versions?|kv-v2|versioned secrets?/i, evidence: "versioning evidence was detected." },
    { signal: "access-request", pattern: /access request|approval|temporary access|privileged access/i, evidence: "access request evidence was detected." },
    { signal: "break-glass", pattern: /break glass|break-glass|emergency access/i, evidence: "break-glass evidence was detected." }
  ];
  return specs.map((spec) => secretManagementSignalFromSpecs(sourceFiles, spec, "governance"));
}

function secretManagementPackageSignals(sourceFiles: SecretManagementSourceFile[]): SecretManagementReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SecretManagementReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@infisical/sdk", pattern: /@infisical\/sdk/i, evidence: "@infisical/sdk dependency evidence was detected." },
    { signal: "infisical", pattern: /"infisical"|\binfisical\b/i, evidence: "Infisical package or CLI evidence was detected." },
    { signal: "vault", pattern: /"vault"|\bvault\b/i, evidence: "Vault package or CLI evidence was detected." },
    { signal: "node-vault", pattern: /node-vault/i, evidence: "node-vault dependency evidence was detected." },
    { signal: "doppler", pattern: /"doppler"|\bdoppler\b/i, evidence: "Doppler package or CLI evidence was detected." },
    { signal: "sops", pattern: /"sops"|\bsops\b|\.sops/i, evidence: "SOPS package or config evidence was detected." },
    { signal: "sealed-secrets", pattern: /sealed-?secrets?|kubeseal|SealedSecret/i, evidence: "Sealed Secrets package or manifest evidence was detected." },
    { signal: "external-secrets", pattern: /external-?secrets?|ExternalSecret|SecretStore|ClusterSecretStore/i, evidence: "External Secrets package or manifest evidence was detected." }
  ];
  return specs.map((spec) => secretManagementSignalFromSpecs(sourceFiles, spec, "package"));
}

function secretManagementSignalFromSpecs<T extends string>(
  sourceFiles: SecretManagementSourceFile[],
  spec: { signal: T; pattern: RegExp; evidence: string },
  label: string
): { signal: T; readiness: "ready" | "missing"; evidence: string; relatedHref: string } {
  const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
  return {
    signal: spec.signal,
    readiness: match ? "ready" : "missing",
    evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} ${label} evidence was not detected.`,
    relatedHref: match?.sourceHref ?? "html/secret-management-readiness.html"
  };
}
