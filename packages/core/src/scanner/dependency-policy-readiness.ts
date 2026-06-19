import type { DependencyReviewReadinessReport, DependencyUpdateReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

function stripJsonComments(text: string): string {
  return text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

export async function buildDependencyUpdateReport(walk: WalkResult): Promise<DependencyUpdateReport> {
  const sourceFiles = await dependencyUpdateSourceFiles(walk);
  const configFiles = dependencyUpdateConfigFiles(sourceFiles);
  const managerSignals = dependencyUpdateManagerSignals(sourceFiles);
  const policySignals = dependencyUpdatePolicySignals(sourceFiles);
  const workflowSignals = dependencyUpdateWorkflowSignals(sourceFiles);
  const registrySignals = dependencyUpdateRegistrySignals(sourceFiles);
  const packageFileSignals = dependencyUpdatePackageFileSignals(sourceFiles);

  const hasConfig = configFiles.length > 0;
  const hasPackageFiles = packageFileSignals.some((item) => item.readiness === "ready");
  const hasPackageRules = policySignals.some((item) => item.signal === "package-rules" && item.readiness === "ready");
  const hasDashboard = policySignals.some((item) => item.signal === "dependency-dashboard" && item.readiness === "ready");
  const hasRateLimits = policySignals.some((item) => item.signal === "rate-limits" && item.readiness === "ready");
  const hasRegistryRules = registrySignals.some((item) => ["host-rules", "registry-url", "private-packages"].includes(item.signal) && item.readiness === "ready");
  const hasAutomerge = policySignals.some((item) => item.signal === "automerge" && item.readiness === "ready");
  const hasSchedule = policySignals.some((item) => item.signal === "schedule" && item.readiness === "ready");

  const riskQueue: DependencyUpdateReport["riskQueue"] = [];
  if (hasPackageFiles && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add a dependency update configuration before relying on automated update PRs.",
      why: "Renovate-style automation needs repository policy for presets, grouping, schedules, and review boundaries.",
      relatedHref: "html/dependency-updates.html"
    });
  }
  if (hasConfig && !hasPackageRules) {
    riskQueue.push({
      priority: "medium",
      action: "Review packageRules for grouping, major-update handling, and ecosystem-specific policy.",
      why: "Renovate packageRules make selective automerge, labels, schedules, grouping, and manager-specific rules inspectable.",
      relatedHref: "html/dependency-updates.html"
    });
  }
  if (hasConfig && !hasDashboard) {
    riskQueue.push({
      priority: "medium",
      action: "Consider a dependency dashboard or approval workflow for high-risk updates.",
      why: "Dependency dashboards give maintainers a single queue for approvals, blocked updates, and manual decisions.",
      relatedHref: "html/dependency-updates.html"
    });
  }
  if (hasConfig && !hasRateLimits) {
    riskQueue.push({
      priority: "low",
      action: "Set PR or branch concurrency limits when the repository has many dependency files.",
      why: "Automated update tools can create noisy PR bursts unless concurrency and hourly limits are explicit.",
      relatedHref: "html/dependency-updates.html"
    });
  }
  if (hasRegistryRules) {
    riskQueue.push({
      priority: "medium",
      action: "Verify private registry credentials outside static RepoTutor analysis.",
      why: "RepoTutor can detect hostRules and registry URLs, but it does not validate tokens, access, or registry reachability.",
      relatedHref: "html/dependency-updates.html"
    });
  }
  if (hasAutomerge && !hasSchedule) {
    riskQueue.push({
      priority: "medium",
      action: "Pair automerge with schedule, status-check, and branch-protection review.",
      why: "Renovate warns that automerge behavior depends on checks, platform automerge mode, and schedule semantics.",
      relatedHref: "html/dependency-updates.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the config validator and dry-run in a trusted workspace before enabling update PRs.",
    why: "RepoTutor records dependency-update readiness statically; it does not query registries, create branches, or open pull requests.",
    relatedHref: "html/dependency-updates.html"
  });

  return {
    summary: `Renovate식 dependency-update readiness report: config file ${configFiles.length}개, manager signal ${managerSignals.length}개, policy signal ${policySignals.length}개, package file signal ${packageFileSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Renovate config presets packageRules automerge schedule dependencyDashboard enabledManagers hostRules rangeStrategy prConcurrentLimit configMigration",
    configFiles,
    managerSignals,
    policySignals,
    workflowSignals,
    registrySignals,
    packageFileSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx renovate-config-validator", purpose: "Validate Renovate config syntax and schema in a trusted workspace." },
      { command: "npx renovate --dry-run=full", purpose: "Preview discovered dependencies, branches, and PR decisions without writing changes." },
      { command: "npx renovate --print-config", purpose: "Inspect the resolved config after presets and inherited settings are applied." },
      { command: "npx renovate --platform=github --autodiscover=false <owner/repo>", purpose: "Run a scoped repository check instead of broad autodiscovery." },
      { command: "npx renovate --dry-run=lookup", purpose: "Check lookup behavior before creating branches or pull requests." },
      { command: "gh workflow run renovate.yml --ref <branch>", purpose: "Trigger a dedicated Renovate workflow only after reviewing workflow permissions." }
    ],
    learnerNextSteps: [
      "Start with renovate.json, .renovaterc, or dependabot.yml to find the automation policy before reading package manifests.",
      "Check packageRules and schedules before trusting automerge or grouped dependency PRs.",
      "Separate public package-file discovery from private registry credentials such as hostRules and token environment variables.",
      "RepoTutor does not call registries or create branches; use this page as a static review map before enabling automation."
    ]
  };
}

type DependencyUpdateSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dependencyUpdateSourceFiles(walk: WalkResult): Promise<DependencyUpdateSourceFile[]> {
  const files: DependencyUpdateSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dependencyUpdateInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!dependencyUpdatePathSignal(file.relPath) && !dependencyUpdatePackageFilePathSignal(file.relPath) && !dependencyUpdateContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function dependencyUpdateInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dependencyUpdatePathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|Dockerfile|go\.mod|pyproject\.toml|requirements.*\.txt|Gemfile|versions\.tf)$/i.test(base)
    || filePath.startsWith(".github/workflows/")
    || /\.(json|json5|ya?ml|toml|md)$/i.test(filePath);
}

function dependencyUpdatePathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(renovate\.json|renovate\.json5|\.renovaterc|\.renovaterc\.json|\.renovaterc\.json5|\.renovaterc\.ya?ml|renovate\.config\.[cm]?[jt]s|dependabot\.ya?ml)$/i.test(base)
    || filePath === ".github/dependabot.yml"
    || filePath === ".github/dependabot.yaml"
    || /renovate|dependabot|dependency-update|dependency-updates/i.test(filePath);
}

function dependencyUpdatePackageFilePathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|Dockerfile|go\.mod|pyproject\.toml|requirements.*\.txt|Gemfile|versions\.tf)$/i.test(base)
    || filePath.startsWith(".github/workflows/")
    || /\.tf$/i.test(filePath);
}

function dependencyUpdateContentSignal(text: string): boolean {
  return /renovate|dependabot|packageRules|dependencyDashboard|automerge|hostRules|enabledManagers|rangeStrategy|prConcurrentLimit|branchConcurrentLimit|lockFileMaintenance/i.test(text);
}

function dependencyUpdateConfigFiles(sourceFiles: DependencyUpdateSourceFile[]): DependencyUpdateReport["configFiles"] {
  return sourceFiles
    .filter((source) => dependencyUpdateConfigPathSignal(source.filePath, source.text))
    .slice(0, 80)
    .map((source) => {
      const configType = dependencyUpdateConfigType(source.filePath, source.text);
      const extendsCount = countMatches(source.text, /"extends"\s*:|extends:/g);
      const packageRuleCount = dependencyUpdatePackageRuleCount(source.text);
      const scheduleCount = countMatches(source.text, /schedule|automergeSchedule/g);
      const automergeSignal = dependencyUpdateAutomergeSignal(source.text);
      return {
        filePath: source.filePath,
        configType,
        extendsCount,
        packageRuleCount,
        scheduleCount,
        automergeSignal,
        readiness: extendsCount > 0 || packageRuleCount > 0 || scheduleCount > 0 || automergeSignal !== "missing" ? "ready" : "partial",
        evidence: `${source.filePath} contains ${configType} dependency-update config with ${extendsCount} preset signal(s), ${packageRuleCount} package rule signal(s), and ${scheduleCount} schedule signal(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function dependencyUpdateConfigPathSignal(filePath: string, text: string): boolean {
  const base = path.basename(filePath);
  return dependencyUpdatePathSignal(filePath)
    || (base === "package.json" && /"renovate"\s*:/.test(text))
    || (filePath.startsWith(".github/workflows/") && /\brenovate\b|dependabot/i.test(text));
}

function dependencyUpdateConfigType(filePath: string, text: string): DependencyUpdateReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath).toLowerCase();
  if (filePath === ".github/dependabot.yml" || filePath === ".github/dependabot.yaml" || /dependabot/i.test(filePath)) return "dependabot";
  if (base === "package.json") return "package-json";
  if (filePath.startsWith(".github/workflows/")) return "github-action";
  if (/renovate|packageRules|dependencyDashboard|hostRules|enabledManagers/i.test(filePath) || /renovate|packageRules|dependencyDashboard|hostRules|enabledManagers/i.test(text)) return "renovate";
  return "unknown";
}

function dependencyUpdatePackageRuleCount(text: string): number {
  try {
    const cleaned = stripJsonComments(text);
    const json = JSON.parse(cleaned) as { packageRules?: unknown[]; renovate?: { packageRules?: unknown[] } };
    return Array.isArray(json.packageRules) ? json.packageRules.length : Array.isArray(json.renovate?.packageRules) ? json.renovate.packageRules.length : 0;
  } catch {
    const section = text.match(/packageRules["']?\s*:\s*\[([\s\S]*?)\n\s*\]/)?.[1] ?? "";
    return Math.max(countMatches(section, /\{[\s\S]*?\}/g), countMatches(text, /packageRules/g));
  }
}

function dependencyUpdateAutomergeSignal(text: string): DependencyUpdateReport["configFiles"][number]["automergeSignal"] {
  if (/automerge[^:\n]*["']?\s*:\s*true|platformAutomerge[^:\n]*["']?\s*:\s*true/i.test(text)) return /packageRules|matchPackage|matchDep|matchUpdateTypes/i.test(text) ? "conditional" : "enabled";
  if (/automerge[^:\n]*["']?\s*:\s*false|platformAutomerge[^:\n]*["']?\s*:\s*false/i.test(text)) return "disabled";
  if (/automergeType|automergeSchedule|automergeStrategy/i.test(text)) return "conditional";
  return "missing";
}

function dependencyUpdateManagerSignals(sourceFiles: DependencyUpdateSourceFile[]): DependencyUpdateReport["managerSignals"] {
  const specs: Array<{ signal: DependencyUpdateReport["managerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "npm", pattern: /package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|npm|pnpm|yarn|bun/i, evidence: "npm-family dependency manager evidence was detected." },
    { signal: "docker", pattern: /Dockerfile|dockerfile|containerbase|docker-compose|docker/i, evidence: "Docker dependency manager evidence was detected." },
    { signal: "github-actions", pattern: /\.github\/workflows|github-actions|github action/i, evidence: "GitHub Actions dependency manager evidence was detected." },
    { signal: "python", pattern: /pyproject\.toml|requirements.*\.txt|poetry|pipenv|pip-compile/i, evidence: "Python dependency manager evidence was detected." },
    { signal: "go", pattern: /go\.mod|go\.sum|gomod|golang/i, evidence: "Go module manager evidence was detected." },
    { signal: "ruby", pattern: /Gemfile|bundler|rubygems/i, evidence: "Ruby dependency manager evidence was detected." },
    { signal: "terraform", pattern: /\.tf\b|terraform|terragrunt/i, evidence: "Terraform dependency manager evidence was detected." },
    { signal: "maven", pattern: /pom\.xml|maven/i, evidence: "Maven dependency manager evidence was detected." },
    { signal: "gradle", pattern: /build\.gradle|gradle/i, evidence: "Gradle dependency manager evidence was detected." }
  ];
  return dependencyUpdateSignalFromSpecs(sourceFiles, specs, "manager", "signal");
}

function dependencyUpdatePolicySignals(sourceFiles: DependencyUpdateSourceFile[]): DependencyUpdateReport["policySignals"] {
  const specs: Array<{ signal: DependencyUpdateReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "extends", pattern: /"extends"\s*:|extends:/i, evidence: "preset extends evidence was detected." },
    { signal: "package-rules", pattern: /packageRules|package-rules/i, evidence: "packageRules evidence was detected." },
    { signal: "schedule", pattern: /schedule|automergeSchedule/i, evidence: "schedule evidence was detected." },
    { signal: "automerge", pattern: /automerge|platformAutomerge/i, evidence: "automerge policy evidence was detected." },
    { signal: "dependency-dashboard", pattern: /dependencyDashboard|dependency dashboard|dependencyDashboardApproval/i, evidence: "dependency dashboard evidence was detected." },
    { signal: "labels-reviewers", pattern: /labels|addLabels|reviewers|assignees/i, evidence: "labels, reviewers, or assignees evidence was detected." },
    { signal: "rate-limits", pattern: /prConcurrentLimit|branchConcurrentLimit|prHourlyLimit|prCreation/i, evidence: "PR or branch rate-limit evidence was detected." },
    { signal: "range-strategy", pattern: /rangeStrategy|range strategy|pinDigests|separateMajor/i, evidence: "version range strategy evidence was detected." },
    { signal: "config-migration", pattern: /configMigration|config migration/i, evidence: "config migration evidence was detected." },
    { signal: "host-rules", pattern: /hostRules|hostType|matchHost/i, evidence: "hostRules evidence was detected." },
    { signal: "vulnerability-alerts", pattern: /vulnerabilityAlerts|osv|security|dependency-review/i, evidence: "vulnerability update evidence was detected." }
  ];
  return dependencyUpdateSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function dependencyUpdateWorkflowSignals(sourceFiles: DependencyUpdateSourceFile[]): DependencyUpdateReport["workflowSignals"] {
  const specs: Array<{ signal: DependencyUpdateReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "branch-pr", pattern: /prCreation|branchName|branchPrefix|pull request|update PR/i, evidence: "branch or PR creation evidence was detected." },
    { signal: "dashboard-approval", pattern: /dependencyDashboardApproval|dashboard approval/i, evidence: "dashboard approval evidence was detected." },
    { signal: "grouping", pattern: /groupName|minimumGroupSize|groupSlug/i, evidence: "dependency grouping evidence was detected." },
    { signal: "separate-major", pattern: /separateMajor|separateMultipleMajor|matchUpdateTypes.*major/i, evidence: "major-update separation evidence was detected." },
    { signal: "semantic-commits", pattern: /semanticCommit|commitMessagePrefix|commitMessageTopic/i, evidence: "semantic commit evidence was detected." },
    { signal: "lockfile-maintenance", pattern: /lockFileMaintenance|lockfile maintenance/i, evidence: "lockfile maintenance evidence was detected." },
    { signal: "rebase", pattern: /rebaseWhen|automerge.*rebase|conflicted/i, evidence: "rebase policy evidence was detected." },
    { signal: "ignore-paths", pattern: /ignorePaths|ignoreDeps|ignorePresets|ignoreUnstable/i, evidence: "ignore path or ignore preset evidence was detected." }
  ];
  return dependencyUpdateSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function dependencyUpdateRegistrySignals(sourceFiles: DependencyUpdateSourceFile[]): DependencyUpdateReport["registrySignals"] {
  const specs: Array<{ signal: DependencyUpdateReport["registrySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "host-rules", pattern: /hostRules|matchHost|hostType/i, evidence: "hostRules evidence was detected." },
    { signal: "encrypted-secrets", pattern: /encrypted|encryptedSecrets|secrets/i, evidence: "encrypted secret evidence was detected." },
    { signal: "registry-url", pattern: /registryUrls|registryUrl|npmrc|index-url|docker-registry/i, evidence: "registry URL evidence was detected." },
    { signal: "token-env", pattern: /RENOVATE_TOKEN|GITHUB_TOKEN|NPM_TOKEN|DOCKER_PASSWORD|token/i, evidence: "token environment evidence was detected." },
    { signal: "private-packages", pattern: /private package|private repositor|private registr|internal package|hostRules/i, evidence: "private package evidence was detected." }
  ];
  return dependencyUpdateSignalFromSpecs(sourceFiles, specs, "registry", "signal");
}

function dependencyUpdatePackageFileSignals(sourceFiles: DependencyUpdateSourceFile[]): DependencyUpdateReport["packageFileSignals"] {
  const specs: Array<{ signal: DependencyUpdateReport["packageFileSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "package-json", pattern: /(^|\/)package\.json$/i, evidence: "package.json evidence was detected." },
    { signal: "package-lock", pattern: /(^|\/)package-lock\.json$/i, evidence: "package-lock.json evidence was detected." },
    { signal: "pnpm-lock", pattern: /(^|\/)pnpm-lock\.yaml$/i, evidence: "pnpm-lock.yaml evidence was detected." },
    { signal: "yarn-lock", pattern: /(^|\/)yarn\.lock$/i, evidence: "yarn.lock evidence was detected." },
    { signal: "bun-lock", pattern: /(^|\/)bun\.lockb?$/i, evidence: "bun lockfile evidence was detected." },
    { signal: "dockerfile", pattern: /(^|\/)Dockerfile$/i, evidence: "Dockerfile evidence was detected." },
    { signal: "github-actions", pattern: /^\.github\/workflows\/.+\.ya?ml$/i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "go-mod", pattern: /(^|\/)go\.mod$/i, evidence: "go.mod evidence was detected." },
    { signal: "pyproject", pattern: /(^|\/)pyproject\.toml$/i, evidence: "pyproject.toml evidence was detected." },
    { signal: "requirements", pattern: /(^|\/)requirements.*\.txt$/i, evidence: "Python requirements evidence was detected." },
    { signal: "gemfile", pattern: /(^|\/)Gemfile$/i, evidence: "Gemfile evidence was detected." },
    { signal: "terraform", pattern: /\.tf$/i, evidence: "Terraform file evidence was detected." }
  ];
  return dependencyUpdateSignalFromSpecs(sourceFiles, specs, "package file", "signal");
}

function dependencyUpdateSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DependencyUpdateSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/dependency-updates.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDependencyReviewReadinessReport(walk: WalkResult): Promise<DependencyReviewReadinessReport> {
  const sourceFiles = await dependencyReviewSourceFiles(walk);
  const dependencyReviewSetups = dependencyReviewSetupsFromSources(sourceFiles);
  const reviewSignals = dependencyReviewReviewSignals(sourceFiles);
  const vulnerabilitySignals = dependencyReviewVulnerabilitySignals(sourceFiles);
  const licenseSignals = dependencyReviewLicenseSignals(sourceFiles);
  const packagePolicySignals = dependencyReviewPackagePolicySignals(sourceFiles);
  const ciSignals = dependencyReviewCiSignals(sourceFiles);
  const scorecardSignals = dependencyReviewScorecardSignals(sourceFiles);
  const outputSignals = dependencyReviewOutputSignals(sourceFiles);
  const packageSignals = dependencyReviewPackageSignals(sourceFiles);

  const hasReviewGate = reviewSignals.some((item) => item.readiness === "ready")
    || dependencyReviewSetups.some((item) => item.reviewCount > 0 || item.diffCount > 0);
  const hasSeverityGate = vulnerabilitySignals.some((item) => ["fail-on-severity", "min-severity", "vulnerability-check"].includes(item.signal) && item.readiness === "ready")
    || dependencyReviewSetups.some((item) => item.vulnerabilityCount > 0);
  const hasLicensePolicy = licenseSignals.some((item) => item.readiness === "ready")
    || dependencyReviewSetups.some((item) => item.licenseCount > 0);
  const hasPrDiff = reviewSignals.some((item) => ["base-head-compare", "pull-request", "snapshot-warning"].includes(item.signal) && item.readiness === "ready")
    || dependencyReviewSetups.some((item) => item.diffCount > 0 || item.snapshotCount > 0 || item.ciCount > 0);
  const hasPackagePolicy = packagePolicySignals.some((item) => item.readiness === "ready")
    || dependencyReviewSetups.some((item) => item.packagePolicyCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready")
    || dependencyReviewSetups.some((item) => item.outputCount > 0);

  const riskQueue: DependencyReviewReadinessReport["riskQueue"] = [];
  if (!hasReviewGate) {
    riskQueue.push({
      priority: "high",
      action: "Add a PR dependency review gate before treating dependency changes as reviewed.",
      why: "Dependency-review readiness needs an inspectable pull-request diff gate such as actions/dependency-review-action, dependency graph review, or OSV review workflow evidence.",
      relatedHref: "html/dependency-review-readiness.html"
    });
  }
  if (hasReviewGate && !hasSeverityGate) {
    riskQueue.push({
      priority: "high",
      action: "Set a vulnerability severity threshold for dependency review failures.",
      why: "Review gates without fail-on-severity, vulnerability-check, OSV minimum severity, or equivalent policy can surface findings without blocking risky dependency changes.",
      relatedHref: "html/dependency-review-readiness.html"
    });
  }
  if (hasReviewGate && !hasLicensePolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Add license allow or deny policy to the dependency review workflow.",
      why: "License policy makes dependency review useful for both security and rights review before a dependency enters the project.",
      relatedHref: "html/dependency-review-readiness.html"
    });
  }
  if (hasReviewGate && !hasPrDiff) {
    riskQueue.push({
      priority: "medium",
      action: "Tie dependency review to pull-request base/head comparison and snapshot warning handling.",
      why: "Dependency-review-action and OSV review are most useful when the reviewed dependency diff is explicit and snapshot warning behavior is visible.",
      relatedHref: "html/dependency-review-readiness.html"
    });
  }
  if (hasReviewGate && !hasPackagePolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Document package deny, allow, ignore, group, registry, or ecosystem-directory policy.",
      why: "Package policy helps reviewers separate intentional exceptions from unreviewed dependency additions.",
      relatedHref: "html/dependency-review-readiness.html"
    });
  }
  if (hasReviewGate && !hasOutput) {
    riskQueue.push({
      priority: "low",
      action: "Persist dependency review summaries, PR comments, SARIF, JSON, HTML, Markdown, or artifacts.",
      why: "Dependency review output should remain inspectable after CI finishes so learners can trace why a dependency change passed or failed.",
      relatedHref: "html/dependency-review-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Dependency Review, Dependabot, OSV Scanner, GitHub API, registry, deps.dev, and remediation commands only in an authorized local or CI environment.",
    why: "RepoTutor records static dependency-review readiness only and never calls GitHub APIs, OSV.dev, deps.dev, registries, creates pull requests, or runs actions.",
    relatedHref: "html/dependency-review-readiness.html"
  });

  return {
    summary: `Dependency review readiness report: setup ${dependencyReviewSetups.length}개, review signal ${reviewSignals.length}개, vulnerability signal ${vulnerabilitySignals.length}개, license signal ${licenseSignals.length}개, package policy signal ${packagePolicySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Dependency Review readiness actions/dependency-review-action fail-on-severity vulnerability-check license-check allow-licenses deny-licenses allow-dependencies-licenses deny-packages base-ref head-ref snapshot warnings OpenSSF scorecard Dependabot OSV Scanner lockfile license offline remediation PR summary artifact SARIF JSON HTML",
    dependencyReviewSetups,
    reviewSignals,
    vulnerabilitySignals,
    licenseSignals,
    packagePolicySignals,
    ciSignals,
    scorecardSignals,
    outputSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"actions/dependency-review-action|fail-on-severity|license-check|vulnerability-check|base-ref|head-ref|comment-summary-in-pr|retry-on-snapshot-warnings\" .github .", purpose: "Find Dependency Review Action gate, PR diff, vulnerability, license, summary, and snapshot-warning policy." },
      { command: "rg \"allow-licenses|deny-licenses|allow-dependencies-licenses|deny-packages|SPDX|purl\" .github .", purpose: "Find license and package policy evidence used during dependency review." },
      { command: "rg \"osv-scanner|--licenses|--offline|--download-offline-databases|--allow-no-lockfiles|--format|--json|--sarif|--min-severity|--ignore-dev\" .", purpose: "Find OSV Scanner vulnerability, license, offline, output, and guided-remediation readiness." },
      { command: "rg \"dependabot.yml|package-ecosystem|directory|schedule|groups|ignore|allow|registries|open-pull-requests-limit|security-updates\" .github .", purpose: "Find Dependabot ecosystem, directory, grouping, ignore, registry, and security-update policy." },
      { command: "rg \"permissions:|contents: read|pull-requests: write|security-events: write|upload-artifact|summary\" .github .", purpose: "Find CI permissions, PR comment/summary, SARIF, and artifact retention evidence." }
    ],
    learnerNextSteps: [
      "Open Dependency Review Readiness and verify the PR dependency diff gate before reading broader update automation.",
      "Check vulnerability severity, license allow/deny, and package policy together; one gate without the others leaves review gaps.",
      "Use OSV Scanner and Dependabot signals as complementary evidence, not proof that external databases or registries were queried.",
      "Treat all GitHub API, registry, dependency review, OSV, and remediation commands as external execution; RepoTutor only records static readiness."
    ]
  };
}

type DependencyReviewSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dependencyReviewSourceFiles(walk: WalkResult): Promise<DependencyReviewSourceFile[]> {
  const files: DependencyReviewSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dependencyReviewInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!dependencyReviewPathSignal(file.relPath) && !dependencyReviewContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function dependencyReviewInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dependencyReviewPathSignal(filePath)
    || /(^|\/)(README|docs?|security|polic(y|ies)|compliance|risk|scripts?|workflows?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|osv-scanner\.toml|dependabot\.ya?ml|Makefile|Taskfile\.ya?ml|justfile)$/i.test(base)
    || filePath.startsWith(".github/workflows/")
    || /\.(json|json5|ya?ml|toml|md)$/i.test(filePath);
}

function dependencyReviewPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return filePath.startsWith(".github/workflows/")
    || filePath === ".github/dependabot.yml"
    || filePath === ".github/dependabot.yaml"
    || /dependency[-_ ]?review|dependabot|osv[-_ ]?scanner|osv-scanner|dependency[-_ ]?graph|dependency[-_ ]?submission|license[-_ ]?policy|security[-_ ]?update/i.test(filePath)
    || /^(osv-scanner\.toml|dependabot\.ya?ml)$/i.test(base);
}

function dependencyReviewContentSignal(text: string): boolean {
  return /(actions\/dependency-review-action|dependency review|Dependency Review|fail-on-severity|vulnerability-check|license-check|allow-licenses|deny-licenses|allow-dependencies-licenses|deny-packages|base-ref|head-ref|comment-summary-in-pr|retry-on-snapshot-warnings|show-openssf-scorecard|warn-on-openssf-scorecard-level|dependency graph|dependency submission|osv-scanner|OSV Scanner|--licenses|--offline|--download-offline-databases|--allow-no-lockfiles|--min-severity|--ignore-dev|package-ecosystem|open-pull-requests-limit|security-updates)/i.test(text);
}

function dependencyReviewSetupsFromSources(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["dependencyReviewSetups"] {
  const rows: DependencyReviewReadinessReport["dependencyReviewSetups"] = [];
  for (const source of sourceFiles) {
    const reviewCount = countMatches(source.text, /(actions\/dependency-review-action|dependency review|Dependency Review|dependency graph|dependency submission|comment-summary-in-pr|pull_request)/gi);
    const vulnerabilityCount = countMatches(source.text, /(fail-on-severity|vulnerability-check|osv-scanner|--min-severity|--ignore-dev|security advisory|vulnerabilit|GHSA|CVE)/gi);
    const licenseCount = countMatches(source.text, /(license-check|allow-licenses|deny-licenses|allow-dependencies-licenses|--licenses|SPDX|license scan|license policy)/gi);
    const packagePolicyCount = countMatches(source.text, /(deny-packages|allowlist|allow:|ignore:|groups:|security-updates|package-ecosystem|directory:|registries:|open-pull-requests-limit|purl)/gi);
    const diffCount = countMatches(source.text, /(base-ref|head-ref|base sha|head sha|base\/head|compare|pull_request|dependency diff)/gi);
    const snapshotCount = countMatches(source.text, /(snapshot warning|snapshot warnings|retry-on-snapshot-warnings|retry-on-snapshot-warnings-timeout|dependency graph snapshot)/gi);
    const scorecardCount = countMatches(source.text, /(show-openssf-scorecard|warn-on-openssf-scorecard-level|OpenSSF Scorecard|scorecard)/gi);
    const outputCount = countMatches(source.text, /(summary|GITHUB_STEP_SUMMARY|comment-summary-in-pr|pr comment|sarif|json|html|markdown|upload-artifact|artifact)/gi);
    const ciCount = countMatches(source.text, /(github actions|\.github\/workflows|pull_request|schedule:|cron:|permissions:|contents: read|pull-requests: write|security-events: write|actions\/checkout|upload-artifact)/gi);
    const totalSignals = reviewCount + vulnerabilityCount + licenseCount + packagePolicyCount + diffCount + snapshotCount + scorecardCount + outputCount + ciCount;
    if (totalSignals === 0 && !dependencyReviewPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: dependencyReviewTool(source),
      reviewCount,
      vulnerabilityCount,
      licenseCount,
      packagePolicyCount,
      diffCount,
      snapshotCount,
      scorecardCount,
      outputCount,
      ciCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} dependency-review readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.reviewCount + b.vulnerabilityCount + b.licenseCount + b.packagePolicyCount + b.diffCount + b.snapshotCount + b.outputCount + b.ciCount;
    const aScore = a.reviewCount + a.vulnerabilityCount + a.licenseCount + a.packagePolicyCount + a.diffCount + a.snapshotCount + a.outputCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function dependencyReviewTool(source: DependencyReviewSourceFile): DependencyReviewReadinessReport["dependencyReviewSetups"][number]["tool"] {
  if (/package\.json$/i.test(source.filePath) || /scripts?["']?\s*:/.test(source.text)) return "package-script";
  if (/\.github\/dependabot\.ya?ml$/i.test(source.filePath) || /dependabot/i.test(source.filePath) || /package-ecosystem|open-pull-requests-limit|security-updates/i.test(source.text)) return "dependabot";
  if (/osv[-_ ]?scanner|osv-scanner/i.test(source.filePath) || /osv-scanner|--download-offline-databases|--allow-no-lockfiles/i.test(source.text)) return "osv-scanner";
  if (/actions\/dependency-review-action|dependency-review-action/i.test(source.text) || /dependency[-_ ]?review/i.test(source.filePath)) return "dependency-review-action";
  if (/\.github\/workflows/i.test(source.filePath)) return "github-actions";
  if (/README|docs?/i.test(source.filePath)) return "readme";
  return "unknown";
}

function dependencyReviewReviewSignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["reviewSignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "dependency-review-action", pattern: /actions\/dependency-review-action|dependency-review-action/i, evidence: "Dependency Review Action evidence was detected." },
    { signal: "dependency-graph", pattern: /dependency graph|dependency-graph|graph\/snapshots|dependencyGraph/i, evidence: "Dependency graph evidence was detected." },
    { signal: "dependency-submission", pattern: /dependency submission|dependency-submission|dependency-submission-action/i, evidence: "Dependency submission evidence was detected." },
    { signal: "base-head-compare", pattern: /base-ref|head-ref|base sha|head sha|base\/head|compare/i, evidence: "base/head comparison evidence was detected." },
    { signal: "snapshot-warning", pattern: /snapshot warning|snapshot warnings|retry-on-snapshot-warnings|dependency graph snapshot/i, evidence: "snapshot warning evidence was detected." },
    { signal: "pr-summary", pattern: /comment-summary-in-pr|pull request summary|PR summary|GITHUB_STEP_SUMMARY/i, evidence: "PR summary evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|pull request|merge_request/i, evidence: "pull-request trigger evidence was detected." }
  ], "review");
}

function dependencyReviewVulnerabilitySignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["vulnerabilitySignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "fail-on-severity", pattern: /fail-on-severity/i, evidence: "fail-on-severity evidence was detected." },
    { signal: "vulnerability-check", pattern: /vulnerability-check|vulnerability check/i, evidence: "vulnerability-check evidence was detected." },
    { signal: "osv-scanner", pattern: /osv-scanner|OSV Scanner/i, evidence: "OSV Scanner evidence was detected." },
    { signal: "lockfile-scan", pattern: /lockfile|package-lock|pnpm-lock|yarn\.lock|go\.sum|Gemfile\.lock|scan source/i, evidence: "lockfile scan evidence was detected." },
    { signal: "min-severity", pattern: /--min-severity|min_severity|min-severity/i, evidence: "minimum severity evidence was detected." },
    { signal: "ignore-dev", pattern: /--ignore-dev|ignore dev|dev dependency/i, evidence: "dev dependency filtering evidence was detected." },
    { signal: "offline-db", pattern: /--offline|--offline-vulnerabilities|--download-offline-databases|offline database/i, evidence: "offline vulnerability database evidence was detected." }
  ], "vulnerability");
}

function dependencyReviewLicenseSignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["licenseSignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "license-check", pattern: /license-check|license check/i, evidence: "license-check evidence was detected." },
    { signal: "allow-licenses", pattern: /allow-licenses|allowed licenses/i, evidence: "allowed license evidence was detected." },
    { signal: "deny-licenses", pattern: /deny-licenses|denied licenses/i, evidence: "denied license evidence was detected." },
    { signal: "allow-dependencies-licenses", pattern: /allow-dependencies-licenses/i, evidence: "dependency-specific license exception evidence was detected." },
    { signal: "license-scan", pattern: /--licenses|license scan|license scanning/i, evidence: "license scan evidence was detected." },
    { signal: "spdx", pattern: /SPDX|spdx|Apache-2\.0|MIT|GPL|LGPL|AGPL/i, evidence: "SPDX/license identifier evidence was detected." }
  ], "license");
}

function dependencyReviewPackagePolicySignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["packagePolicySignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "deny-packages", pattern: /deny-packages|denied packages|blocked packages/i, evidence: "denied package evidence was detected." },
    { signal: "allowlist", pattern: /allowlist|allow-list|allow:\s|allowed dependencies|allow-dependencies/i, evidence: "allowlist evidence was detected." },
    { signal: "ignore", pattern: /ignore:|ignored-vulns|ignored vulnerabilities|ignore conditions|ignoredUpdates/i, evidence: "ignore policy evidence was detected." },
    { signal: "groups", pattern: /groups:|dependency group|groupName|grouped dependencies/i, evidence: "dependency grouping evidence was detected." },
    { signal: "security-updates", pattern: /security-updates|security updates|security update/i, evidence: "security update evidence was detected." },
    { signal: "ecosystem-directory", pattern: /package-ecosystem|directory:|directories:/i, evidence: "ecosystem directory evidence was detected." },
    { signal: "registries", pattern: /registries:|registry-url|registry url|private registry|npmrc|index-url/i, evidence: "registry policy evidence was detected." }
  ], "package policy");
}

function dependencyReviewCiSignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["ciSignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|merge_request|pull request/i, evidence: "pull-request evidence was detected." },
    { signal: "permissions", pattern: /permissions:|contents: read|pull-requests: write|security-events: write|actions: read/i, evidence: "workflow permissions evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|actions\/upload-artifact|artifact upload/i, evidence: "artifact upload evidence was detected." },
    { signal: "summary-comment", pattern: /GITHUB_STEP_SUMMARY|comment-summary-in-pr|pull-requests: write|pr comment/i, evidence: "summary or comment evidence was detected." },
    { signal: "scheduled-run", pattern: /schedule:|cron:|scheduled/i, evidence: "scheduled run evidence was detected." }
  ], "CI");
}

function dependencyReviewScorecardSignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["scorecardSignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "show-openssf-scorecard", pattern: /show-openssf-scorecard/i, evidence: "show-openssf-scorecard evidence was detected." },
    { signal: "warn-on-openssf-scorecard-level", pattern: /warn-on-openssf-scorecard-level/i, evidence: "OpenSSF warning-level evidence was detected." },
    { signal: "scorecard-api", pattern: /scorecard api|OpenSSF Scorecard|openssf scorecard|scorecard/i, evidence: "OpenSSF Scorecard evidence was detected." }
  ], "scorecard");
}

function dependencyReviewOutputSignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["outputSignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "summary", pattern: /summary|GITHUB_STEP_SUMMARY|Dependency Review summary/i, evidence: "summary output evidence was detected." },
    { signal: "pr-comment", pattern: /comment-summary-in-pr|pr comment|pull request comment|pull-requests: write/i, evidence: "PR comment evidence was detected." },
    { signal: "sarif", pattern: /sarif|security-events: write|upload-sarif/i, evidence: "SARIF output evidence was detected." },
    { signal: "json", pattern: /\.json\b|--json|format=json|json report/i, evidence: "JSON output evidence was detected." },
    { signal: "html", pattern: /\.html\b|--format=html|format html|html report/i, evidence: "HTML output evidence was detected." },
    { signal: "markdown", pattern: /markdown|\.md\b|format markdown/i, evidence: "Markdown output evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|actions\/upload-artifact|artifact/i, evidence: "artifact output evidence was detected." }
  ], "output");
}

function dependencyReviewPackageSignals(sourceFiles: DependencyReviewSourceFile[]): DependencyReviewReadinessReport["packageSignals"] {
  return dependencyReviewSignalFromSpecs(sourceFiles, [
    { signal: "dependency-review-action", pattern: /actions\/dependency-review-action|@actions\/dependency-review-action/i, evidence: "Dependency Review Action package/tool evidence was detected." },
    { signal: "dependabot", pattern: /dependabot|package-ecosystem|open-pull-requests-limit/i, evidence: "Dependabot evidence was detected." },
    { signal: "osv-scanner", pattern: /osv-scanner|OSV Scanner/i, evidence: "OSV Scanner package/tool evidence was detected." },
    { signal: "github-action", pattern: /uses:\s*actions\/|github action|\.github\/workflows/i, evidence: "GitHub Action evidence was detected." }
  ], "package");
}

function dependencyReviewSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: DependencyReviewSourceFile[],
  specs: T,
  label: string
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/dependency-review-readiness.html"
    };
  });
}
