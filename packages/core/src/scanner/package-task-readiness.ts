import type { GitHooksReport, PackageManagerReport, TaskRunnerReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}


function packageManagerLockfileEcosystem(filePath: string): PackageManagerReport["lockfileSignals"][number]["ecosystem"] | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "pnpm-lock.yaml") return "pnpm";
  if (base === "package-lock.json") return "npm";
  if (base === "yarn.lock") return "yarn";
  if (base === "bun.lock" || base === "bun.lockb") return "bun";
  return null;
}

function packageManagerPnpmImporterCount(text: string): number {
  const section = text.match(/importers:\n([\s\S]*?)(?:\n[a-zA-Z][A-Za-z0-9_-]*:|\n*$)/)?.[1] ?? "";
  return countMatches(section, /^\s{2}[^\s][^:\n]*:/gm);
}

function packageManagerPnpmPackageCount(text: string): number {
  const section = text.match(/packages:\n([\s\S]*?)(?:\n[a-zA-Z][A-Za-z0-9_-]*:|\n*$)/)?.[1] ?? "";
  return countMatches(section, /^\s{2}[^\s][^:\n]*:/gm);
}

function packageManagerJsonObjectCount(text: string, field: string): number {
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const value = json[field];
    return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).length : 0;
  } catch {
    return 0;
  }
}

function firstJsonNumber(text: string, field: string): string | null {
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const value = json[field];
    return typeof value === "number" || typeof value === "string" ? String(value) : null;
  } catch {
    return null;
  }
}

function firstMatch(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match?.[1] ?? null;
}
export async function buildPackageManagerReport(walk: WalkResult): Promise<PackageManagerReport> {
  const sourceFiles = await packageManagerSourceFiles(walk);
  const manifestFiles = packageManagerManifestFiles(sourceFiles);
  const workspaceSignals = packageManagerWorkspaceSignals(sourceFiles);
  const lockfileSignals = packageManagerLockfileSignals(sourceFiles);
  const scriptSignals = packageManagerScriptSignals(sourceFiles);
  const policySignals = packageManagerPolicySignals(sourceFiles);

  const hasManifest = manifestFiles.length > 0;
  const hasPackageManagerField = policySignals.some((item) => item.signal === "packageManager" && item.readiness === "ready");
  const hasLockfile = lockfileSignals.length > 0;
  const hasWorkspaceFile = workspaceSignals.some((item) => item.signal === "workspace-file" && item.readiness === "ready");
  const hasWorkspacePackages = workspaceSignals.some((item) => item.signal === "packages-include" && item.readiness === "ready");
  const hasFrozenLockfile = scriptSignals.some((item) => item.signal === "frozen-lockfile" && item.readiness === "ready");
  const hasBuildPolicy = policySignals.some((item) => ["onlyBuiltDependencies", "allowBuilds"].includes(item.signal) && item.readiness === "ready");
  const hasPnpmfileHook = policySignals.some((item) => item.signal === "pnpmfile-hook" && item.readiness === "ready");
  const lockfileEcosystems = new Set(lockfileSignals.map((item) => item.ecosystem).filter((ecosystem) => ecosystem !== "unknown"));

  const riskQueue: PackageManagerReport["riskQueue"] = [];
  if (!hasManifest) {
    riskQueue.push({
      priority: "high",
      action: "Add a package manifest before claiming JavaScript package-manager readiness.",
      why: "Package managers start from manifest files such as package.json, where scripts, dependencies, and packageManager policy are declared.",
      relatedHref: "html/package-manager.html"
    });
  }
  if (hasManifest && !hasPackageManagerField) {
    riskQueue.push({
      priority: "medium",
      action: "Declare the expected package manager and version in package.json.",
      why: "pnpm-style repositories use packageManager/devEngines to make install behavior repeatable across machines.",
      relatedHref: "html/package-manager.html"
    });
  }
  if (hasManifest && !hasLockfile) {
    riskQueue.push({
      priority: "high",
      action: "Commit the matching package-manager lockfile.",
      why: "pnpm documents deterministic installs through pnpm-lock.yaml; npm, Yarn, and Bun have equivalent lockfiles for resolved dependency state.",
      relatedHref: "html/package-manager.html"
    });
  }
  if (lockfileEcosystems.size > 1) {
    riskQueue.push({
      priority: "medium",
      action: "Choose one package-manager lockfile family for this repository.",
      why: "Multiple lockfile ecosystems make it unclear whether contributors should install with pnpm, npm, Yarn, or Bun.",
      relatedHref: "html/package-manager.html"
    });
  }
  if (hasWorkspacePackages && !hasWorkspaceFile) {
    riskQueue.push({
      priority: "medium",
      action: "Move workspace package globs into an explicit workspace file or root workspace declaration.",
      why: "Monorepos need a readable workspace package list so beginners can see which folders are linked together.",
      relatedHref: "html/package-manager.html"
    });
  }
  if (hasWorkspaceFile && !hasFrozenLockfile) {
    riskQueue.push({
      priority: "low",
      action: "Document a frozen-lockfile CI install command for workspace repos.",
      why: "Workspace lockfiles are useful only if CI refuses accidental lockfile drift during install.",
      relatedHref: "html/package-manager.html"
    });
  }
  if (hasWorkspaceFile && !hasBuildPolicy) {
    riskQueue.push({
      priority: "low",
      action: "Review dependency build-script policy for packages that run install-time builds.",
      why: "pnpm workspace files can declare allowBuilds or related controls so install-time build scripts are explicit.",
      relatedHref: "html/package-manager.html"
    });
  }
  if (hasPnpmfileHook) {
    riskQueue.push({
      priority: "low",
      action: "Review .pnpmfile hooks before trusting install-time dependency rewrites.",
      why: "pnpm hooks can mutate package manifests during resolution, so they deserve a separate learning and security review.",
      relatedHref: "html/package-manager.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the real package-manager commands in a trusted workspace before treating this static report as approval.",
    why: "RepoTutor records package-manager readiness statically; it does not run install, resolve registry metadata, or execute lifecycle scripts.",
    relatedHref: "html/package-manager.html"
  });

  return {
    summary: `pnpm식 package-manager readiness report: manifest ${manifestFiles.length}개, workspace signal ${workspaceSignals.length}개, lockfile ${lockfileSignals.length}개, script signal ${scriptSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "pnpm packageManager devEngines workspace packages catalog lockfile importers allowBuilds auditConfig pnpmfile hooks recursive filter frozen-lockfile",
    manifestFiles,
    workspaceSignals,
    lockfileSignals,
    scriptSignals,
    policySignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "corepack enable", purpose: "Use the packageManager field to activate the expected package-manager binary." },
      { command: "pnpm install --frozen-lockfile", purpose: "Verify the lockfile is reproducible without modifying it." },
      { command: "pnpm -r build", purpose: "Run build scripts across workspace packages recursively." },
      { command: "pnpm -r test", purpose: "Run test scripts across workspace packages recursively." },
      { command: "pnpm audit", purpose: "Review advisory data for the current lockfile in a trusted workspace." },
      { command: "pnpm list -r --depth 0", purpose: "Inspect workspace package boundaries and direct dependencies." }
    ],
    learnerNextSteps: [
      "Start with package.json: identify packageManager, scripts, dependency groups, and whether the root is private.",
      "Then read the workspace file and lockfile together; workspace globs define projects, while the lockfile records resolved dependency state.",
      "Treat lifecycle hooks, .pnpmfile, and build-script allowlists as policy, not ordinary metadata.",
      "RepoTutor does not execute install commands; use this page as a static map before running package-manager commands yourself."
    ]
  };
}

type PackageManagerSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function packageManagerSourceFiles(walk: WalkResult): Promise<PackageManagerSourceFile[]> {
  const files: PackageManagerSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !packageManagerInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!packageManagerPathSignal(file.relPath) && !packageManagerContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function packageManagerInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|package-lock\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|yarn\.lock|bun\.lockb?|bun\.lock|\.npmrc|\.yarnrc\.ya?ml|\.pnpmfile\.cjs|README\.md)$/i.test(base)
    || /(package-manager|packageManager|workspace|lockfile|pnpm|npm|yarn|bun|dependencies|devEngines)/i.test(filePath)
    || /\.(json|md|ya?ml|cjs|mjs|toml)$/i.test(filePath);
}

function packageManagerPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|package-lock\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|yarn\.lock|bun\.lockb?|bun\.lock|\.npmrc|\.yarnrc\.ya?ml|\.pnpmfile\.cjs)$/i.test(base)
    || /(package-manager|packageManager|workspace|lockfile|pnpm|npm|yarn|bun|dependencies|devEngines)/i.test(filePath);
}

function packageManagerContentSignal(text: string): boolean {
  return /packageManager|devEngines|workspaces?|pnpm|npm|yarn|bun|lockfileVersion|dependencies|devDependencies|catalog:|allowBuilds|auditConfig|frozen-lockfile|\.pnpmfile|readPackage|beforePacking/i.test(text);
}

function packageManagerManifestFiles(sourceFiles: PackageManagerSourceFile[]): PackageManagerReport["manifestFiles"] {
  return sourceFiles
    .filter((source) => path.basename(source.filePath) === "package.json")
    .slice(0, 120)
    .map((source) => {
      let packageManager: string | null = null;
      let scriptCount = 0;
      let dependencyCount = 0;
      try {
        const json = JSON.parse(source.text) as {
          packageManager?: unknown;
          scripts?: Record<string, unknown>;
          dependencies?: Record<string, unknown>;
          devDependencies?: Record<string, unknown>;
          peerDependencies?: Record<string, unknown>;
          optionalDependencies?: Record<string, unknown>;
        };
        packageManager = typeof json.packageManager === "string" ? json.packageManager : null;
        scriptCount = Object.keys(json.scripts ?? {}).length;
        dependencyCount = Object.keys({
          ...json.dependencies,
          ...json.devDependencies,
          ...json.peerDependencies,
          ...json.optionalDependencies
        }).length;
      } catch {
        // Keep the manifest visible even when JSON parsing fails.
      }
      return {
        filePath: source.filePath,
        packageManager,
        scriptCount,
        dependencyCount,
        readiness: packageManager || dependencyCount > 0 || scriptCount > 0 ? "ready" : "partial",
        evidence: `${source.filePath} has packageManager ${packageManager ?? "not declared"}, ${scriptCount} script(s), and ${dependencyCount} dependency declaration(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function packageManagerWorkspaceSignals(sourceFiles: PackageManagerSourceFile[]): PackageManagerReport["workspaceSignals"] {
  const specs: Array<{ signal: PackageManagerReport["workspaceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "workspace-file", pattern: /pnpm-workspace\.ya?ml|workspaces?\s*:/i, evidence: "workspace file or root workspace declaration evidence was detected." },
    { signal: "packages-include", pattern: /packages\s*:\s*\n\s*-\s+|workspaces?\s*:\s*\[/i, evidence: "workspace package include glob evidence was detected." },
    { signal: "packages-exclude", pattern: /^\s*-\s*['"]?!|!\*\*\/|exclude/i, evidence: "workspace package exclude glob evidence was detected." },
    { signal: "workspace-protocol", pattern: /workspace:\*|workspace:\^|workspace:~/i, evidence: "workspace protocol dependency evidence was detected." },
    { signal: "catalog", pattern: /\bcatalogs?\s*:|catalog:/i, evidence: "catalog dependency version evidence was detected." },
    { signal: "overrides", pattern: /\boverrides\s*:|"overrides"\s*:/i, evidence: "dependency override evidence was detected." },
    { signal: "patched-dependencies", pattern: /patchedDependencies|patches?:|\.patch\b/i, evidence: "patched dependency evidence was detected." },
    { signal: "shared-workspace-lockfile", pattern: /shared-workspace-lockfile|sharedWorkspaceLockfile/i, evidence: "shared workspace lockfile policy evidence was detected." }
  ];
  return packageManagerSignalFromSpecs(sourceFiles, specs, "workspace", "signal");
}

function packageManagerLockfileSignals(sourceFiles: PackageManagerSourceFile[]): PackageManagerReport["lockfileSignals"] {
  return sourceFiles
    .filter((source) => packageManagerLockfileEcosystem(source.filePath) !== null)
    .slice(0, 20)
    .map((source) => {
      const ecosystem = packageManagerLockfileEcosystem(source.filePath) ?? "unknown";
      const version = ecosystem === "npm" ? firstJsonNumber(source.text, "lockfileVersion") : firstMatch(source.text, /lockfileVersion:\s*['"]?([^'"\n]+)['"]?/i);
      const importerCount = ecosystem === "pnpm" ? packageManagerPnpmImporterCount(source.text) : packageManagerJsonObjectCount(source.text, "packages");
      const packageCount = ecosystem === "pnpm" ? packageManagerPnpmPackageCount(source.text) : packageManagerJsonObjectCount(source.text, "packages");
      return {
        filePath: source.filePath,
        ecosystem,
        version,
        importerCount,
        packageCount,
        readiness: version || packageCount > 0 || importerCount > 0 ? "ready" : "partial",
        evidence: `${source.filePath} appears to be a ${ecosystem} lockfile with version ${version ?? "unknown"}, ${importerCount} importer signal(s), and ${packageCount} package signal(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function packageManagerScriptSignals(sourceFiles: PackageManagerSourceFile[]): PackageManagerReport["scriptSignals"] {
  const specs: Array<{ signal: PackageManagerReport["scriptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "install", pattern: /\b(pnpm|npm|yarn|bun)\s+(install|i|ci)\b/i, evidence: "install command evidence was detected." },
    { signal: "dev", pattern: /"dev"\s*:|\b(pnpm|npm|yarn|bun)\s+(run\s+)?dev\b/i, evidence: "dev script evidence was detected." },
    { signal: "build", pattern: /"build"\s*:|\b(pnpm|npm|yarn|bun)\s+(run\s+)?build\b/i, evidence: "build script evidence was detected." },
    { signal: "test", pattern: /"test[^"]*"\s*:|\b(pnpm|npm|yarn|bun)\s+(run\s+)?test\b/i, evidence: "test script evidence was detected." },
    { signal: "lint", pattern: /"lint[^"]*"\s*:|\b(pnpm|npm|yarn|bun)\s+(run\s+)?lint\b/i, evidence: "lint script evidence was detected." },
    { signal: "typecheck", pattern: /"type(check|s)?"\s*:|\b(pnpm|npm|yarn|bun)\s+(run\s+)?type(check|s)?\b/i, evidence: "typecheck script evidence was detected." },
    { signal: "workspace-recursive", pattern: /\b(pnpm\s+(-r|--recursive)|npm\s+.*--workspaces|yarn\s+workspaces|bun\s+.*--filter)\b/i, evidence: "workspace-recursive command evidence was detected." },
    { signal: "filter", pattern: /\b(--filter|-F=|-F\s+|--workspace|workspaces? foreach)\b/i, evidence: "workspace filter evidence was detected." },
    { signal: "frozen-lockfile", pattern: /--frozen-lockfile|npm\s+ci|yarn\s+install\s+--immutable|bun\s+install\s+--frozen-lockfile/i, evidence: "frozen lockfile install evidence was detected." },
    { signal: "prepare", pattern: /"preinstall"\s*:|"postinstall"\s*:|"prepare"\s*:/i, evidence: "lifecycle prepare/install hook evidence was detected." },
    { signal: "release", pattern: /"release"\s*:|\b(pnpm|npm|yarn|bun)\s+(run\s+)?release\b|publish\b/i, evidence: "release or publish script evidence was detected." }
  ];
  return packageManagerSignalFromSpecs(sourceFiles, specs, "script", "signal");
}

function packageManagerPolicySignals(sourceFiles: PackageManagerSourceFile[]): PackageManagerReport["policySignals"] {
  const specs: Array<{ signal: PackageManagerReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "packageManager", pattern: /"packageManager"\s*:|packageManager:/i, evidence: "packageManager pin evidence was detected." },
    { signal: "devEngines", pattern: /"devEngines"\s*:|devEngines:/i, evidence: "devEngines policy evidence was detected." },
    { signal: "engines", pattern: /"engines"\s*:|engines:/i, evidence: "runtime engines policy evidence was detected." },
    { signal: "onlyBuiltDependencies", pattern: /onlyBuiltDependencies/i, evidence: "onlyBuiltDependencies policy evidence was detected." },
    { signal: "allowBuilds", pattern: /allowBuilds/i, evidence: "allowBuilds policy evidence was detected." },
    { signal: "auditConfig", pattern: /auditConfig|ignoreGhsas|audit-level/i, evidence: "audit configuration evidence was detected." },
    { signal: "minimumReleaseAge", pattern: /minimumReleaseAge|minimum-release-age/i, evidence: "minimum release age policy evidence was detected." },
    { signal: "nodeLinker", pattern: /nodeLinker|node-linker/i, evidence: "node linker policy evidence was detected." },
    { signal: "configDependencies", pattern: /configDependencies/i, evidence: "config dependency evidence was detected." },
    { signal: "pnpmfile-hook", pattern: /\.pnpmfile|readPackage|afterAllResolved|beforePacking/i, evidence: "pnpmfile hook evidence was detected." }
  ];
  return packageManagerSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function packageManagerSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PackageManagerSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/package-manager.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildGitHooksReport(walk: WalkResult): Promise<GitHooksReport> {
  const sourceFiles = await gitHooksSourceFiles(walk);
  const hookFiles = gitHooksHookFiles(sourceFiles);
  const installSignals = gitHooksInstallSignals(sourceFiles);
  const commandSignals = gitHooksCommandSignals(sourceFiles);
  const policySignals = gitHooksPolicySignals(sourceFiles);
  const toolConfigFiles = gitHooksToolConfigFiles(sourceFiles);
  const lefthookSignals = gitHooksLefthookSignals(sourceFiles);

  const hasHuskyDependency = gitHooksPackageHasDependency(sourceFiles, "husky");
  const hasHookFiles = hookFiles.length > 0;
  const hasInstallSignal = installSignals.some((item) => ["prepare-script", "postinstall-script", "husky-init", "core-hooks-path"].includes(item.signal) && item.readiness === "ready");
  const hasLefthookConfig = toolConfigFiles.some((item) => item.tool === "lefthook") || lefthookSignals.some((item) => item.signal === "config-file" && item.readiness === "ready");
  const hasLefthookParallel = lefthookSignals.some((item) => item.signal === "parallel" && item.readiness === "ready");
  const hasLefthookFilters = lefthookSignals.some((item) => ["glob-filter", "files-template", "root"].includes(item.signal) && item.readiness === "ready");
  const hasLefthookSkipPolicy = lefthookSignals.some((item) => ["skip", "only"].includes(item.signal) && item.readiness === "ready");
  const hasPreCommit = policySignals.some((item) => item.signal === "pre-commit" && item.readiness === "ready");
  const hasPrePush = policySignals.some((item) => item.signal === "pre-push" && item.readiness === "ready");
  const hasCommitMsg = policySignals.some((item) => item.signal === "commit-msg" && item.readiness === "ready");
  const hasBypassPolicy = policySignals.some((item) => ["skip-env", "no-verify"].includes(item.signal) && item.readiness === "ready");
  const hasLintStaged = commandSignals.some((item) => item.signal === "lint-staged" && item.readiness === "ready") || toolConfigFiles.some((item) => item.tool === "lint-staged");
  const hasDeprecatedHuskyShim = policySignals.some((item) => item.signal === "deprecated-husky-sh" && item.readiness === "ready");

  const riskQueue: GitHooksReport["riskQueue"] = [];
  if (!hasHookFiles && toolConfigFiles.length === 0 && !hasHuskyDependency) {
    riskQueue.push({
      priority: "medium",
      action: "Decide whether local Git hooks should be part of the learner-facing quality path.",
      why: "Husky-style projects make local checks visible through .husky hook files and install scripts, while this source has no hook evidence.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasHuskyDependency && !hasHookFiles) {
    riskQueue.push({
      priority: "high",
      action: "Add or recover the .husky hook files that use the declared Husky dependency.",
      why: "A Husky dependency without hook files leaves contributors unable to see what will run before commit or push.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasHookFiles && !hasInstallSignal) {
    riskQueue.push({
      priority: "medium",
      action: "Document how hooks are installed, such as a prepare script or core.hooksPath setup.",
      why: "Husky initializes Git through core.hooksPath; without an install signal, hooks may exist but never run for new contributors.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasHookFiles && !hasPreCommit) {
    riskQueue.push({
      priority: "medium",
      action: "Add a pre-commit hook or document why commits do not run local checks.",
      why: "pre-commit is the common hook for fast local test, lint, format, or staged-file checks.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasPreCommit && !hasLintStaged) {
    riskQueue.push({
      priority: "low",
      action: "Consider a staged-file command for expensive lint or format hooks.",
      why: "Husky documentation points to lint-staged when teams need staged-file filtering instead of whole-repo commands.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasLefthookConfig && !hasLefthookParallel) {
    riskQueue.push({
      priority: "low",
      action: "Decide whether independent Lefthook jobs can run in parallel.",
      why: "Lefthook can run hook jobs concurrently; this reduces local latency when jobs do not depend on each other.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasLefthookConfig && !hasLefthookFilters) {
    riskQueue.push({
      priority: "low",
      action: "Add glob, files, or root filters to Lefthook jobs when checks should run only on relevant files.",
      why: "Lefthook file filtering helps learners distinguish staged-file checks from whole-repository checks.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasLefthookConfig && !hasLefthookSkipPolicy) {
    riskQueue.push({
      priority: "low",
      action: "Document Lefthook skip or only conditions if hooks differ by branch, merge, or rebase state.",
      why: "Lefthook skip/only policy is where teams encode when a local hook should not run.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasHookFiles && !hasPrePush) {
    riskQueue.push({
      priority: "low",
      action: "Decide whether slower checks belong in pre-push instead of pre-commit.",
      why: "pre-push can protect shared branches without slowing every local commit.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (!hasCommitMsg) {
    riskQueue.push({
      priority: "low",
      action: "Add commit-msg policy only if the team relies on structured commit messages.",
      why: "commitlint-style commit-msg hooks make commit conventions explicit, but they are optional for many learning repos.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasHookFiles && !hasBypassPolicy) {
    riskQueue.push({
      priority: "low",
      action: "Document emergency bypass behavior for hooks.",
      why: "Husky supports HUSKY=0 and Git supports --no-verify; learners should know when bypassing is allowed.",
      relatedHref: "html/git-hooks.html"
    });
  }
  if (hasDeprecatedHuskyShim) {
    riskQueue.push({
      priority: "medium",
      action: "Remove deprecated husky.sh shim lines from hook files.",
      why: "Husky v9 warns that old husky.sh sourcing lines are deprecated and will fail in v10.",
      relatedHref: "html/git-hooks.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real hook commands in a trusted workspace before treating this static report as approval.",
    why: "RepoTutor records Git hook readiness statically; it does not run hooks, mutate Git config, or create commits.",
    relatedHref: "html/git-hooks.html"
  });

  return {
    summary: `Husky/Lefthook식 Git hook readiness report: hook file ${hookFiles.length}개, install signal ${installSignals.length}개, command signal ${commandSignals.length}개, tool config ${toolConfigFiles.length}개, Lefthook signal ${lefthookSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Husky .husky hook files prepare core.hooksPath pre-commit pre-push commit-msg HUSKY=0 no-verify lint-staged POSIX shell; Lefthook lefthook.yml jobs commands scripts parallel group piped glob files root tags skip only stage_fixed runner output extends remotes local config run validate dump",
    hookFiles,
    installSignals,
    commandSignals,
    policySignals,
    toolConfigFiles,
    lefthookSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "pnpm exec husky init", purpose: "Initialize a Husky hook directory and prepare script in a trusted JavaScript workspace." },
      { command: "pnpm run prepare", purpose: "Run the install hook that configures Git hooks for the repository." },
      { command: "git config --get core.hooksPath", purpose: "Confirm which hook directory Git will read from." },
      { command: "pnpm exec lint-staged", purpose: "Run staged-file tasks without creating a commit when lint-staged is configured." },
      { command: "pnpm exec commitlint --from HEAD~1 --to HEAD", purpose: "Check recent commit messages when commitlint policy exists." },
      { command: "lefthook install", purpose: "Install Lefthook-managed Git hooks in a trusted workspace." },
      { command: "lefthook run pre-commit", purpose: "Run the pre-commit Lefthook group directly without creating a commit." },
      { command: "lefthook validate", purpose: "Validate Lefthook configuration syntax before relying on local hooks." },
      { command: "lefthook dump", purpose: "Inspect merged Lefthook configuration after extends, remotes, and local overrides." },
      { command: "HUSKY=0 git commit ...", purpose: "Understand the documented emergency bypass path; do not use it as a normal workflow." }
    ],
    learnerNextSteps: [
      "Start with .husky files: hook filenames explain when a command runs, and file contents explain what command runs.",
      "For Lefthook projects, start with lefthook.yml and compare hook-level jobs, commands, scripts, groups, and local overrides.",
      "Then read package.json scripts; Husky usually installs through prepare or postinstall, and hooks often call package scripts.",
      "Look for parallel, glob, files, root, tags, skip, and only because those fields explain latency and scope.",
      "Separate fast pre-commit checks from slower pre-push checks so learners understand latency and safety tradeoffs.",
      "Treat HUSKY=0 and --no-verify as policy-sensitive escape hatches, not ordinary commands."
    ]
  };
}

type GitHooksSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function gitHooksSourceFiles(walk: WalkResult): Promise<GitHooksSourceFile[]> {
  const files: GitHooksSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !gitHooksInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!gitHooksPathSignal(file.relPath) && !gitHooksContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function gitHooksInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return filePath.startsWith(".husky/")
    || /^(\.lintstagedrc(\..+)?|lint-staged\.config\.(js|cjs|mjs|ts)|commitlint\.config\.(js|cjs|mjs|ts)|\.?lefthook(-local)?\.(ya?ml|toml|jsonc?)|\.pre-commit-config\.ya?ml|\.simple-git-hooks\.(json|js|cjs)|package\.json|README\.md)$/i.test(base)
    || /^\.config\/lefthook(-local)?\.(ya?ml|toml|jsonc?)$/i.test(filePath)
    || /(husky|lint-staged|commitlint|pre-commit|pre-push|commit-msg|git-hooks?|hooksPath|lefthook|simple-git-hooks)/i.test(filePath)
    || /\.(json|md|ya?ml|sh|bash|zsh|js|cjs|mjs|ts)$/i.test(filePath);
}

function gitHooksPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return filePath.startsWith(".husky/")
    || /^(\.lintstagedrc(\..+)?|lint-staged\.config\.(js|cjs|mjs|ts)|commitlint\.config\.(js|cjs|mjs|ts)|\.?lefthook(-local)?\.(ya?ml|toml|jsonc?)|\.pre-commit-config\.ya?ml|\.simple-git-hooks\.(json|js|cjs)|package\.json)$/i.test(base)
    || /^\.config\/lefthook(-local)?\.(ya?ml|toml|jsonc?)$/i.test(filePath)
    || /(husky|lint-staged|commitlint|pre-commit|pre-push|commit-msg|git-hooks?|hooksPath|lefthook|simple-git-hooks)/i.test(filePath);
}

function gitHooksContentSignal(text: string): boolean {
  return /husky|\.husky|core\.hooksPath|pre-commit|pre-push|commit-msg|prepare-commit-msg|HUSKY=0|LEFTHOOK=0|--no-verify|lint-staged|commitlint|lefthook|stage_fixed|pre-commit-config|simple-git-hooks|node_modules\/\.bin/i.test(text);
}

function gitHooksHookFiles(sourceFiles: GitHooksSourceFile[]): GitHooksReport["hookFiles"] {
  return sourceFiles
    .filter((source) => source.filePath.startsWith(".husky/") && !source.filePath.startsWith(".husky/_/") && !path.basename(source.filePath).includes("."))
    .slice(0, 80)
    .map((source) => {
      const commandCount = source.text.split(/\r?\n/).filter((line) => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith("#") && !trimmed.startsWith(". \"$(dirname");
      }).length;
      const hasBypassHint = /HUSKY=0|--no-verify|\b-n\b/i.test(source.text);
      const hasNodePathHint = /node_modules\/\.bin|\bPATH\b|NVM_DIR|nvm|fnm|asdf|volta|init\.sh/i.test(source.text);
      return {
        filePath: source.filePath,
        hookName: path.basename(source.filePath),
        commandCount,
        hasBypassHint,
        hasNodePathHint,
        readiness: commandCount > 0 ? "ready" : "partial",
        evidence: `${source.filePath} declares ${commandCount} executable command line(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function gitHooksInstallSignals(sourceFiles: GitHooksSourceFile[]): GitHooksReport["installSignals"] {
  const specs: Array<{ signal: GitHooksReport["installSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prepare-script", pattern: /"prepare"\s*:\s*"[^"]*husky|prepare.*husky/i, evidence: "prepare script or prepare documentation for Husky was detected." },
    { signal: "postinstall-script", pattern: /"postinstall"\s*:\s*"[^"]*husky|postinstall.*husky/i, evidence: "postinstall hook setup evidence was detected." },
    { signal: "husky-init", pattern: /\b(npx|pnpm exec|bunx|yarn dlx)?\s*husky\s+init\b/i, evidence: "husky init setup evidence was detected." },
    { signal: "core-hooks-path", pattern: /core\.hooksPath|hooksPath|git config.*core\.hooksPath|\.husky\/_/i, evidence: "Git core.hooksPath setup evidence was detected." },
    { signal: "git-root-subdir", pattern: /cd\s+\.\.\s*&&\s*husky|husky\s+[^"'\n]*\/\.husky|Project Not in Git Root Directory/i, evidence: "subdirectory project hook setup evidence was detected." },
    { signal: "ci-skip", pattern: /HUSKY=0|process\.env\.CI|CI\s*={0,2}\s*['"]?true|NODE_ENV\s*={0,2}\s*['"]?production/i, evidence: "CI or production hook install skip evidence was detected." }
  ];
  return gitHooksSignalFromSpecs(sourceFiles, specs, "install", "signal");
}

function gitHooksCommandSignals(sourceFiles: GitHooksSourceFile[]): GitHooksReport["commandSignals"] {
  const specs: Array<{ signal: GitHooksReport["commandSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "test", pattern: /\b(npm|pnpm|yarn|bun)\s+(run\s+)?test\b|\bvitest\b|\bjest\b/i, evidence: "test command evidence was detected." },
    { signal: "lint", pattern: /\b(npm|pnpm|yarn|bun)\s+(run\s+)?lint\b|\beslint\b|\blint\b/i, evidence: "lint command evidence was detected." },
    { signal: "format", pattern: /\bprettier\b|\bformat\b/i, evidence: "format command evidence was detected." },
    { signal: "typecheck", pattern: /\btsc\b|typecheck|type-check/i, evidence: "typecheck command evidence was detected." },
    { signal: "security", pattern: /\bgitleaks\b|\bsemgrep\b|\bsnyk\b|\baudit\b/i, evidence: "security or audit command evidence was detected." },
    { signal: "commitlint", pattern: /\bcommitlint\b|commit-msg/i, evidence: "commit message lint evidence was detected." },
    { signal: "lint-staged", pattern: /\blint-staged\b|lintstaged/i, evidence: "staged-file task evidence was detected." },
    { signal: "npm-run", pattern: /\bnpm\s+run\s+/i, evidence: "npm script invocation evidence was detected." },
    { signal: "pnpm-run", pattern: /\bpnpm\s+(run|exec)\s+/i, evidence: "pnpm script or exec invocation evidence was detected." },
    { signal: "node-entrypoint", pattern: /\bnode\s+\.husky\/[^\s]+|\bnode\s+[^"'\n]*(pre-commit|pre-push|commit-msg)[^"'\n]*\.(mjs|cjs|js)\b|\.husky\/[^\s"']+\.(mjs|cjs|js)\b/i, evidence: "Node hook entrypoint evidence was detected." },
    { signal: "posix-shell", pattern: /^#!\/(?:usr\/bin\/env\s+)?sh\b|POSIX|bash\s+<<\s*EOF|set\s+-e/im, evidence: "POSIX shell hook evidence was detected." }
  ];
  return gitHooksSignalFromSpecs(sourceFiles, specs, "command", "signal");
}

function gitHooksPolicySignals(sourceFiles: GitHooksSourceFile[]): GitHooksReport["policySignals"] {
  const specs: Array<{ signal: GitHooksReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pre-commit", pattern: /\.husky\/pre-commit|\bpre-commit\b/i, evidence: "pre-commit hook evidence was detected." },
    { signal: "pre-push", pattern: /\.husky\/pre-push|\bpre-push\b/i, evidence: "pre-push hook evidence was detected." },
    { signal: "commit-msg", pattern: /\.husky\/commit-msg|\bcommit-msg\b/i, evidence: "commit-msg hook evidence was detected." },
    { signal: "prepare-commit-msg", pattern: /\.husky\/prepare-commit-msg|\bprepare-commit-msg\b/i, evidence: "prepare-commit-msg hook evidence was detected." },
    { signal: "post-merge", pattern: /\.husky\/post-merge|\bpost-merge\b/i, evidence: "post-merge hook evidence was detected." },
    { signal: "skip-env", pattern: /HUSKY=0|export\s+HUSKY=0/i, evidence: "HUSKY=0 skip policy evidence was detected." },
    { signal: "no-verify", pattern: /--no-verify|git\s+\w+[^\n]*\s-n(\s|$)/i, evidence: "Git --no-verify bypass evidence was detected." },
    { signal: "gui-node-path", pattern: /init\.sh|node_modules\/\.bin|\bPATH\b|NVM_DIR|version manager|nvm|fnm|asdf|volta/i, evidence: "GUI or Node PATH mitigation evidence was detected." },
    { signal: "deprecated-husky-sh", pattern: /husky\.sh|_\/husky\.sh/i, evidence: "deprecated husky.sh shim evidence was detected." }
  ];
  return gitHooksSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function gitHooksToolConfigFiles(sourceFiles: GitHooksSourceFile[]): GitHooksReport["toolConfigFiles"] {
  return sourceFiles
    .filter((source) => gitHooksToolForPath(source.filePath, source.text) !== null)
    .slice(0, 80)
    .map((source) => {
      const tool = gitHooksToolForPath(source.filePath, source.text) ?? "unknown";
      return {
        filePath: source.filePath,
        tool,
        readiness: tool === "unknown" ? "partial" : "ready",
        evidence: `${source.filePath} contains ${tool} hook-tool configuration evidence.`,
        sourceHref: source.sourceHref
      };
    });
}

function gitHooksToolForPath(filePath: string, text: string): GitHooksReport["toolConfigFiles"][number]["tool"] | null {
  const base = path.basename(filePath).toLowerCase();
  if (filePath.startsWith(".husky/") || /\bhusky\b/i.test(text)) return "husky";
  if (/^\.lintstagedrc|lint-staged\.config\./i.test(base) || /\blint-staged\b|lintstaged/i.test(text)) return "lint-staged";
  if (/^\.?lefthook(-local)?\.(ya?ml|toml|jsonc?)$/i.test(base) || /^\.config\/lefthook(-local)?\.(ya?ml|toml|jsonc?)$/i.test(filePath) || /\blefthook\b/i.test(text)) return "lefthook";
  if (/^commitlint\.config\./i.test(base) || /\bcommitlint\b/i.test(text)) return "commitlint";
  if (/^\.pre-commit-config\.ya?ml$/i.test(base) || /\brepos:\s*\n[\s\S]*hooks:/i.test(text)) return "pre-commit";
  if (/^\.simple-git-hooks\./i.test(base) || /simple-git-hooks/i.test(text)) return "simple-git-hooks";
  return null;
}

function gitHooksLefthookSignals(sourceFiles: GitHooksSourceFile[]): GitHooksReport["lefthookSignals"] {
  const specs: Array<{ signal: GitHooksReport["lefthookSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "config-file", pattern: /(^|\/)\.?lefthook\.(ya?ml|toml|jsonc?)$|(^|\/)\.config\/lefthook\.(ya?ml|toml|jsonc?)$/i, evidence: "Lefthook main config file evidence was detected." },
    { signal: "local-config", pattern: /(^|\/)\.?lefthook-local\.(ya?ml|toml|jsonc?)$|lefthook-local/i, evidence: "Lefthook local override config evidence was detected." },
    { signal: "parallel", pattern: /\bparallel\s*[:=]\s*true\b/i, evidence: "parallel hook execution evidence was detected." },
    { signal: "jobs", pattern: /\bjobs\s*[:=]/i, evidence: "Lefthook jobs list evidence was detected." },
    { signal: "commands", pattern: /\bcommands\s*[:=]/i, evidence: "Lefthook named commands evidence was detected." },
    { signal: "scripts", pattern: /\bscripts\s*[:=]|\.lefthook\//i, evidence: "Lefthook scripts evidence was detected." },
    { signal: "group", pattern: /\bgroup\s*[:=]/i, evidence: "Lefthook grouped jobs evidence was detected." },
    { signal: "piped", pattern: /\bpiped\s*[:=]\s*true\b/i, evidence: "piped group execution evidence was detected." },
    { signal: "glob-filter", pattern: /\bglob\s*[:=]/i, evidence: "Lefthook glob filter evidence was detected." },
    { signal: "files-template", pattern: /\bfiles\s*[:=]|\{(?:staged_files|push_files|all_files|files)\}/i, evidence: "Lefthook file list or template evidence was detected." },
    { signal: "root", pattern: /\broot\s*[:=]/i, evidence: "Lefthook per-job root directory evidence was detected." },
    { signal: "tags", pattern: /\btags\s*[:=]|\bexclude_tags\s*[:=]/i, evidence: "Lefthook tags or exclude_tags evidence was detected." },
    { signal: "skip", pattern: /\bskip\s*[:=]|LEFTHOOK=0/i, evidence: "Lefthook skip condition evidence was detected." },
    { signal: "only", pattern: /\bonly\s*[:=]/i, evidence: "Lefthook only condition evidence was detected." },
    { signal: "stage-fixed", pattern: /\bstage_fixed\s*[:=]\s*true\b/i, evidence: "Lefthook stage_fixed auto-restage evidence was detected." },
    { signal: "runner", pattern: /\brunner\s*[:=]/i, evidence: "Lefthook script runner evidence was detected." },
    { signal: "output-control", pattern: /\boutput\s*[:=]|LEFTHOOK_OUTPUT/i, evidence: "Lefthook output control evidence was detected." },
    { signal: "extends", pattern: /\bextends\s*[:=]/i, evidence: "Lefthook extends merge evidence was detected." },
    { signal: "remotes", pattern: /\bremotes\s*[:=]|\bgit_url\s*[:=]|\brefetch_frequency\s*[:=]/i, evidence: "Lefthook remote config evidence was detected." },
    { signal: "run-command", pattern: /\blefthook\s+run\b/i, evidence: "lefthook run command evidence was detected." },
    { signal: "validate-command", pattern: /\blefthook\s+validate\b/i, evidence: "lefthook validate command evidence was detected." },
    { signal: "dump-command", pattern: /\blefthook\s+dump\b/i, evidence: "lefthook dump command evidence was detected." }
  ];
  return gitHooksSignalFromSpecs(sourceFiles, specs, "Lefthook", "signal");
}

function gitHooksPackageHasDependency(sourceFiles: GitHooksSourceFile[], dependencyName: string): boolean {
  return sourceFiles.some((source) => {
    if (path.basename(source.filePath) !== "package.json") return false;
    try {
      const json = JSON.parse(source.text) as {
        dependencies?: Record<string, unknown>;
        devDependencies?: Record<string, unknown>;
        optionalDependencies?: Record<string, unknown>;
      };
      return Boolean(json.dependencies?.[dependencyName] ?? json.devDependencies?.[dependencyName] ?? json.optionalDependencies?.[dependencyName]);
    } catch {
      return source.text.includes(`"${dependencyName}"`);
    }
  });
}

function gitHooksSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: GitHooksSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/git-hooks.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildTaskRunnerReport(walk: WalkResult): Promise<TaskRunnerReport> {
  const sourceFiles = await taskRunnerSourceFiles(walk);
  const configFiles = taskRunnerConfigFiles(sourceFiles);
  const taskSignals = taskRunnerTaskSignals(sourceFiles);
  const cacheSignals = taskRunnerCacheSignals(sourceFiles);
  const dependencySignals = taskRunnerDependencySignals(sourceFiles);
  const environmentSignals = taskRunnerEnvironmentSignals(sourceFiles);
  const packageScriptSignals = taskRunnerPackageScriptSignals(sourceFiles);

  const hasConfig = configFiles.length > 0;
  const hasTurboScript = packageScriptSignals.some((item) => item.signal === "turbo-run" && item.readiness === "ready");
  const hasTaskDependencies = dependencySignals.some((item) => ["depends-on", "caret-dependency"].includes(item.signal) && item.readiness === "ready");
  const hasOutputs = cacheSignals.some((item) => item.signal === "outputs" && item.readiness === "ready");
  const hasInputs = cacheSignals.some((item) => item.signal === "inputs" && item.readiness === "ready");
  const hasEnv = environmentSignals.some((item) => ["globalEnv", "globalPassThroughEnv", "passThroughEnv", "env"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: TaskRunnerReport["riskQueue"] = [];
  if (!hasConfig && !hasTurboScript) {
    riskQueue.push({
      priority: "medium",
      action: "Decide whether workspace task orchestration should be documented for learners.",
      why: "Turbo-style monorepos make build/test/lint ordering and cache boundaries explicit through task-runner config and package scripts.",
      relatedHref: "html/task-runner.html"
    });
  }
  if (hasTurboScript && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add the task-runner config that explains the turbo script behavior.",
      why: "A package script that calls turbo without turbo.json makes task dependencies, inputs, outputs, and cache policy hard to inspect.",
      relatedHref: "html/task-runner.html"
    });
  }
  if (hasConfig && !hasTaskDependencies) {
    riskQueue.push({
      priority: "medium",
      action: "Document task ordering with dependsOn where build/test tasks depend on upstream packages.",
      why: "Turborepo uses dependsOn such as ^build to express workspace task graph order.",
      relatedHref: "html/task-runner.html"
    });
  }
  if (hasConfig && !hasOutputs) {
    riskQueue.push({
      priority: "medium",
      action: "Declare cacheable task outputs for build-like tasks.",
      why: "Task runner caching needs output paths so learners can understand what is restored or invalidated.",
      relatedHref: "html/task-runner.html"
    });
  }
  if (hasConfig && !hasInputs) {
    riskQueue.push({
      priority: "low",
      action: "Review task inputs for expensive tasks or generated artifacts.",
      why: "Turbo-style inputs let teams narrow cache invalidation and avoid costly glob walking.",
      relatedHref: "html/task-runner.html"
    });
  }
  if (hasConfig && !hasEnv) {
    riskQueue.push({
      priority: "low",
      action: "Document environment variables that affect cached task results.",
      why: "Turbo separates env, globalEnv, and pass-through env so cache keys and runtime-only variables are explicit.",
      relatedHref: "html/task-runner.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run task-runner commands in a trusted workspace before treating this static report as approval.",
    why: "RepoTutor records task-runner readiness statically; it does not run builds, restore cache, or contact remote cache services.",
    relatedHref: "html/task-runner.html"
  });

  return {
    summary: `Turborepo식 task-runner readiness report: config file ${configFiles.length}개, task signal ${taskSignals.length}개, cache signal ${cacheSignals.length}개, dependency signal ${dependencySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Turborepo turbo.json tasks dependsOn outputs inputs cache env globalEnv passThroughEnv persistent turbo run filter remote cache",
    configFiles,
    taskSignals,
    cacheSignals,
    dependencySignals,
    environmentSignals,
    packageScriptSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "pnpm turbo run build --dry=json", purpose: "Inspect the task graph and package selection without running build work." },
      { command: "pnpm turbo run test --filter <package>", purpose: "Run a scoped task for one package when the workspace is trusted." },
      { command: "pnpm turbo run build --summarize", purpose: "Review cache inputs, outputs, and task summaries after a real run." },
      { command: "pnpm turbo daemon status", purpose: "Check local Turbo daemon state when task discovery feels stale." },
      { command: "pnpm turbo prune <package>", purpose: "Understand which files a package needs for isolated builds." },
      { command: "pnpm turbo run lint --cache=local:rw", purpose: "Keep cache behavior local while validating a lint task." }
    ],
    learnerNextSteps: [
      "Start with turbo.json: task names explain what can be orchestrated, dependsOn explains ordering, and outputs explain cache artifacts.",
      "Then read package.json scripts to see which commands call the task runner and which remain direct package-manager scripts.",
      "Separate cache-key inputs from runtime-only pass-through environment variables before trusting task results.",
      "RepoTutor does not run task-runner commands; use this page as a static map before executing workspace tasks yourself."
    ]
  };
}

type TaskRunnerSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function taskRunnerSourceFiles(walk: WalkResult): Promise<TaskRunnerSourceFile[]> {
  const files: TaskRunnerSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !taskRunnerInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!taskRunnerPathSignal(file.relPath) && !taskRunnerContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function taskRunnerInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(turbo\.json|nx\.json|workspace\.json|project\.json|Taskfile\.ya?ml|moon\.ya?ml|package\.json|README\.md)$/i.test(base)
    || filePath.startsWith(".moon/")
    || /(turbo|turborepo|task-runner|taskfile|moonrepo|nx|monorepo|workspace)/i.test(filePath)
    || /\.(json|md|ya?ml|toml)$/i.test(filePath);
}

function taskRunnerPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(turbo\.json|nx\.json|workspace\.json|project\.json|Taskfile\.ya?ml|moon\.ya?ml|package\.json)$/i.test(base)
    || filePath.startsWith(".moon/")
    || /(turbo|turborepo|task-runner|taskfile|moonrepo|nx)/i.test(filePath);
}

function taskRunnerContentSignal(text: string): boolean {
  return /\bturbo\b|turborepo|"tasks"\s*:|"pipeline"\s*:|dependsOn|outputs|inputs|globalEnv|globalPassThroughEnv|passThroughEnv|remoteCache|cache\s*:\s*false|persistent|nx\s+run|moon\s+run|Taskfile/i.test(text);
}

function taskRunnerConfigFiles(sourceFiles: TaskRunnerSourceFile[]): TaskRunnerReport["configFiles"] {
  return sourceFiles
    .filter((source) => taskRunnerConfigPathSignal(source.filePath) && taskRunnerToolForPath(source.filePath, source.text) !== null)
    .slice(0, 80)
    .map((source) => {
      const tool = taskRunnerToolForPath(source.filePath, source.text) ?? "unknown";
      const taskCount = taskRunnerTaskCount(source.text);
      const dependsOnCount = countMatches(source.text, /dependsOn/g);
      const outputsCount = countMatches(source.text, /outputs/g);
      return {
        filePath: source.filePath,
        tool,
        taskCount,
        dependsOnCount,
        outputsCount,
        readiness: taskCount > 0 || dependsOnCount > 0 || outputsCount > 0 ? "ready" : "partial",
        evidence: `${source.filePath} contains ${tool} task-runner config with ${taskCount} task signal(s), ${dependsOnCount} dependency signal(s), and ${outputsCount} output signal(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function taskRunnerConfigPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(turbo\.json|nx\.json|workspace\.json|project\.json|Taskfile\.ya?ml|moon\.ya?ml|package\.json)$/i.test(base)
    || filePath.startsWith(".moon/")
    || /(turbo|task-runner|taskfile|moonrepo|nx|lage).*\.(json|ya?ml|toml)$/i.test(filePath);
}

function taskRunnerToolForPath(filePath: string, text: string): TaskRunnerReport["configFiles"][number]["tool"] | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "turbo.json" || /\bturbo\b|turborepo/i.test(text)) return "turbo";
  if (base === "nx.json" || base === "project.json" || /\bnx\s+run|\bnx\b/i.test(text)) return "nx";
  if (/^taskfile\.ya?ml$/i.test(base)) return "taskfile";
  if (base === "moon.yml" || base === "moon.yaml" || filePath.startsWith(".moon/") || /\bmoon\s+run\b/i.test(text)) return "moon";
  if (/\blage\b/i.test(text)) return "lage";
  return null;
}

function taskRunnerTaskCount(text: string): number {
  try {
    const cleaned = stripJsonComments(text);
    const json = JSON.parse(cleaned) as { tasks?: Record<string, unknown>; pipeline?: Record<string, unknown> };
    return Object.keys(json.tasks ?? json.pipeline ?? {}).length;
  } catch {
    const section = text.match(/"?(tasks|pipeline)"?\s*:\s*\{([\s\S]*?)\n\s*\}/)?.[2] ?? "";
    return Math.max(countMatches(section, /"[^"]+"\s*:/g), 0);
  }
}

function taskRunnerTaskSignals(sourceFiles: TaskRunnerSourceFile[]): TaskRunnerReport["taskSignals"] {
  const specs: Array<{ signal: TaskRunnerReport["taskSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "build", pattern: /"build[^"]*"\s*:|\bturbo\s+run\s+build\b|\bnx\s+run\s+\S+:build\b/i, evidence: "build task evidence was detected." },
    { signal: "test", pattern: /"test[^"]*"\s*:|\bturbo\s+run\s+test\b|\bnx\s+run\s+\S+:test\b/i, evidence: "test task evidence was detected." },
    { signal: "lint", pattern: /"lint[^"]*"\s*:|\bturbo\s+run\s+lint\b|\bnx\s+run\s+\S+:lint\b/i, evidence: "lint task evidence was detected." },
    { signal: "dev", pattern: /"dev[^"]*"\s*:|\bturbo\s+run\s+dev\b/i, evidence: "dev task evidence was detected." },
    { signal: "typecheck", pattern: /typecheck|check-types|tsc\s+-b/i, evidence: "typecheck task evidence was detected." },
    { signal: "format", pattern: /"format[^"]*"\s*:|\bturbo\s+run\s+format\b|prettier|oxfmt/i, evidence: "format task evidence was detected." },
    { signal: "quality", pattern: /quality|check|verify/i, evidence: "quality or check task evidence was detected." },
    { signal: "release", pattern: /release|publish|deploy/i, evidence: "release or deploy task evidence was detected." }
  ];
  return taskRunnerSignalFromSpecs(sourceFiles, specs, "task", "signal");
}

function taskRunnerCacheSignals(sourceFiles: TaskRunnerSourceFile[]): TaskRunnerReport["cacheSignals"] {
  const specs: Array<{ signal: TaskRunnerReport["cacheSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "outputs", pattern: /"outputs"\s*:|outputs:/i, evidence: "cache output declaration evidence was detected." },
    { signal: "inputs", pattern: /"inputs"\s*:|inputs:/i, evidence: "cache input declaration evidence was detected." },
    { signal: "cache-false", pattern: /"cache"\s*:\s*false|cache:\s*false/i, evidence: "cache disabled task evidence was detected." },
    { signal: "remote-cache", pattern: /remoteCache|remote cache|TURBO_TOKEN|TURBO_TEAM/i, evidence: "remote cache evidence was detected." },
    { signal: "global-env", pattern: /globalEnv|globalDependencies/i, evidence: "global cache environment evidence was detected." },
    { signal: "pass-through-env", pattern: /globalPassThroughEnv|passThroughEnv/i, evidence: "pass-through environment evidence was detected." },
    { signal: "persistent", pattern: /"persistent"\s*:\s*true|persistent:\s*true/i, evidence: "persistent task evidence was detected." }
  ];
  return taskRunnerSignalFromSpecs(sourceFiles, specs, "cache", "signal");
}

function taskRunnerDependencySignals(sourceFiles: TaskRunnerSourceFile[]): TaskRunnerReport["dependencySignals"] {
  const specs: Array<{ signal: TaskRunnerReport["dependencySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "depends-on", pattern: /dependsOn/i, evidence: "task dependsOn evidence was detected." },
    { signal: "caret-dependency", pattern: /"\^[^"]+"|\^build|\^topo/i, evidence: "upstream workspace dependency task evidence was detected." },
    { signal: "root-task", pattern: /"\/\/#|\/\/#/i, evidence: "root task evidence was detected." },
    { signal: "package-task", pattern: /[A-Za-z0-9_-]+#[A-Za-z0-9:_-]+/i, evidence: "package-scoped task evidence was detected." },
    { signal: "filter", pattern: /--filter|-F\s+|--affected|affected:/i, evidence: "task filter evidence was detected." },
    { signal: "workspace-script", pattern: /workspace|workspaces|pnpm\s+-r|pnpm\s+--filter|turbo\s+run/i, evidence: "workspace script orchestration evidence was detected." }
  ];
  return taskRunnerSignalFromSpecs(sourceFiles, specs, "dependency", "signal");
}

function taskRunnerEnvironmentSignals(sourceFiles: TaskRunnerSourceFile[]): TaskRunnerReport["environmentSignals"] {
  const specs: Array<{ signal: TaskRunnerReport["environmentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "globalEnv", pattern: /globalEnv/i, evidence: "globalEnv evidence was detected." },
    { signal: "globalPassThroughEnv", pattern: /globalPassThroughEnv/i, evidence: "globalPassThroughEnv evidence was detected." },
    { signal: "passThroughEnv", pattern: /passThroughEnv/i, evidence: "passThroughEnv evidence was detected." },
    { signal: "env", pattern: /"env"\s*:|env:/i, evidence: "task env evidence was detected." },
    { signal: "dot-env", pattern: /\.env|dotenv/i, evidence: "dot-env file evidence was detected." },
    { signal: "ci", pattern: /RUNNER_OS|GITHUB_ACTIONS|CI\b|ACTIONS_/i, evidence: "CI environment evidence was detected." }
  ];
  return taskRunnerSignalFromSpecs(sourceFiles, specs, "environment", "signal");
}

function taskRunnerPackageScriptSignals(sourceFiles: TaskRunnerSourceFile[]): TaskRunnerReport["packageScriptSignals"] {
  const specs: Array<{ signal: TaskRunnerReport["packageScriptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "turbo-run", pattern: /\bturbo\s+run\b|\bpnpm\s+--\s+turbo\b|\bnpx\s+turbo\b/i, evidence: "turbo run package script evidence was detected." },
    { signal: "nx-run", pattern: /\bnx\s+run\b|\bnx\s+affected\b/i, evidence: "Nx run package script evidence was detected." },
    { signal: "task-run", pattern: /\btask\s+[A-Za-z0-9:_-]+|Taskfile\.ya?ml/i, evidence: "Taskfile task script evidence was detected." },
    { signal: "moon-run", pattern: /\bmoon\s+run\b/i, evidence: "Moon task script evidence was detected." },
    { signal: "recursive-run", pattern: /\bpnpm\s+-r\b|\bnpm\s+.*--workspaces\b|yarn\s+workspaces/i, evidence: "recursive workspace package script evidence was detected." },
    { signal: "filter-run", pattern: /--filter|-F\s+|--affected/i, evidence: "filtered task run evidence was detected." }
  ];
  return taskRunnerSignalFromSpecs(sourceFiles, specs, "package script", "signal");
}

function taskRunnerSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TaskRunnerSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/task-runner.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

function stripJsonComments(text: string): string {
  return text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}
