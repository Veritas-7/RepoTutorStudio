import path from "node:path";
import type { CodeOwnershipReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export async function buildCodeOwnershipReadinessReport(walk: WalkResult): Promise<CodeOwnershipReadinessReport> {
  const sourceFiles = await codeOwnershipSourceFiles(walk);
  const codeownerFiles = codeOwnershipFiles(sourceFiles);
  const ownershipSignals = codeOwnershipSignals(sourceFiles);
  const validationSignals = codeOwnershipValidationSignals(sourceFiles);
  const reviewSignals = codeOwnershipReviewSignals(sourceFiles);
  const coverageSignals = codeOwnershipCoverageSignals(sourceFiles);
  const packageSignals = codeOwnershipPackageSignals(sourceFiles);
  const hasCodeowners = codeownerFiles.length > 0;
  const hasStandardLocation = ownershipSignals.some((item) => item.signal === "standard-location" && item.readiness === "ready");
  const hasOwners = codeownerFiles.some((item) => item.ownerCount > 0);
  const hasTeamOwner = ownershipSignals.some((item) => item.signal === "team-owner" && item.readiness === "ready");
  const hasSelfOwnership = ownershipSignals.some((item) => item.signal === "self-owned-codeowners" && item.readiness === "ready");
  const hasValidation = validationSignals.some((item) => ["syntax-check", "owner-check", "file-exists-check", "duplicate-pattern-check", "github-action"].includes(item.signal) && item.readiness === "ready");
  const hasRequiredReview = reviewSignals.some((item) => ["required-code-owner-review", "branch-protection", "rulesets", "required-approving-review"].includes(item.signal) && item.readiness === "ready");
  const hasCoverage = coverageSignals.some((item) => ["src", "packages", "root-default"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: CodeOwnershipReadinessReport["riskQueue"] = [];
  if (!hasCodeowners) {
    riskQueue.push({
      priority: "high",
      action: "Add a CODEOWNERS file before claiming code ownership readiness.",
      why: "GitHub only requests code owners when a CODEOWNERS file exists in a supported location on the base branch.",
      relatedHref: "html/code-ownership-readiness.html"
    });
  }
  if (hasCodeowners && !hasStandardLocation) {
    riskQueue.push({
      priority: "high",
      action: "Move CODEOWNERS to root, .github/, or docs/ for GitHub review routing.",
      why: "GitHub documents root, .github, and docs as supported CODEOWNERS locations; other paths are static evidence only.",
      relatedHref: codeownerFiles[0]?.sourceHref ?? "html/code-ownership-readiness.html"
    });
  }
  if (hasCodeowners && !hasOwners) {
    riskQueue.push({
      priority: "high",
      action: "Add at least one valid user, team, or email owner to CODEOWNERS rules.",
      why: "Path patterns without owners do not route review responsibility.",
      relatedHref: codeownerFiles[0]?.sourceHref ?? "html/code-ownership-readiness.html"
    });
  }
  if (hasCodeowners && !hasTeamOwner) {
    riskQueue.push({
      priority: "medium",
      action: "Prefer team owners for durable ownership where possible.",
      why: "GitHub requires teams to be visible and have write access; team ownership avoids single-user bottlenecks.",
      relatedHref: "html/code-ownership-readiness.html"
    });
  }
  if (hasCodeowners && !hasSelfOwnership) {
    riskQueue.push({
      priority: "medium",
      action: "Own the CODEOWNERS file or .github directory itself.",
      why: "GitHub guidance recommends protecting CODEOWNERS with an owner so review routing cannot be changed without owner review.",
      relatedHref: "html/code-ownership-readiness.html"
    });
  }
  if (hasCodeowners && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Add CODEOWNERS syntax, owner, file-existence, or duplicate-pattern validation.",
      why: "Invalid syntax lines are skipped and nonexistent owners or patterns silently weaken review routing.",
      relatedHref: "html/code-ownership-readiness.html"
    });
  }
  if (hasCodeowners && !hasRequiredReview) {
    riskQueue.push({
      priority: "medium",
      action: "Document branch protection or rulesets that require code owner review.",
      why: "Automatic review requests are not the same as merge protection; required code owner review must be enabled separately.",
      relatedHref: "html/code-ownership-readiness.html"
    });
  }
  if (hasCodeowners && !hasCoverage) {
    riskQueue.push({
      priority: "low",
      action: "Add default or source/package ownership rules for broad coverage.",
      why: "Narrow CODEOWNERS rules can leave core source paths unowned unless a default owner or package/source rule is present.",
      relatedHref: "html/code-ownership-readiness.html"
    });
  }

  return {
    summary: `CODEOWNERS readiness report: CODEOWNERS files ${codeownerFiles.length}개, validation signals ${validationSignals.filter((item) => item.readiness === "ready").length}개, review signals ${reviewSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "CODEOWNERS standard locations root .github docs gitignore-style patterns owners teams users email last matching rule branch protection required code owner reviews rulesets syntax owner file duplicate not-owned validation",
    codeownerFiles,
    ownershipSignals,
    validationSignals,
    reviewSignals,
    coverageSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "codeowners --help", purpose: "Inspect CODEOWNERS parsing and file ownership lookup options when hmarr/codeowners is installed." },
      { command: "codeowners-validator --checks files,owners,duppatterns,syntax", purpose: "Validate CODEOWNERS syntax, owner existence, file coverage, and duplicate patterns in a trusted workspace." },
      { command: "gh api repos/{owner}/{repo}/codeowners/errors", purpose: "Read GitHub CODEOWNERS parsing errors for a repository when authenticated." },
      { command: "gh api repos/{owner}/{repo}/branches/{branch}/protection", purpose: "Inspect branch protection for required approving reviews and code owner review requirements." },
      { command: "rg \"CODEOWNERS|Require review from Code Owners|required_approving_review_count|codeowners-validator\" .", purpose: "Inventory CODEOWNERS files, review rules, and validation workflows statically." }
    ],
    learnerNextSteps: [
      "Find the CODEOWNERS file first and confirm it is in root, .github/, or docs/ on the base branch.",
      "Read rules from top to bottom, then remember GitHub-style matching uses the last matching rule for a path.",
      "Check whether owners are teams, users, or emails and whether team visibility/write access must be verified outside static analysis.",
      "Separate automatic review requests from merge gates: branch protection or rulesets must require code owner review before this becomes enforcement."
    ]
  };
}

type CodeOwnershipSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function codeOwnershipSourceFiles(walk: WalkResult): Promise<CodeOwnershipSourceFile[]> {
  const files: CodeOwnershipSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !codeOwnershipInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!codeOwnershipPathSignal(file.relPath) && !codeOwnershipContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function codeOwnershipInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^CODEOWNERS$/i.test(base)
    || codeOwnershipPathSignal(filePath)
    || /^(package\.json|README\.md|SECURITY\.md|CONTRIBUTING\.md)$/i.test(base)
    || /\.(ya?ml|json|md|toml|[cm]?[jt]sx?|go|rb|py)$/i.test(base);
}

function codeOwnershipPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^CODEOWNERS$/i.test(base)
    || /(^|\/)(\.github\/workflows|\.github\/CODEOWNERS|docs\/CODEOWNERS|\.gitlab\/CODEOWNERS|CODEOWNERS)(\/|$)/i.test(filePath)
    || /(codeowners?|branch-protection|ruleset|reviewers?|owners?)/i.test(filePath);
}

function codeOwnershipContentSignal(text: string): boolean {
  return /\b(CODEOWNERS|code owners?|codeowners-validator|hmarr\/codeowners|Require review from Code Owners|required_approving_review_count|required approving review|branch protection|rulesets?|duppatterns|not[- ]owned|owner_checker|pull request review|draft pull request)\b/i.test(text);
}

function codeOwnershipFiles(sourceFiles: CodeOwnershipSourceFile[]): CodeOwnershipReadinessReport["codeownerFiles"] {
  return sourceFiles
    .filter((source) => /^CODEOWNERS$/i.test(path.basename(source.filePath)))
    .slice(0, 40)
    .map((source) => {
      const lines = source.text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
      const patterns = lines.map((line) => line.split(/\s+/)[0] ?? "").filter(Boolean);
      const owners = lines.flatMap((line) => line.split(/\s+/).slice(1));
      const teamOwnerCount = owners.filter((owner) => /^@[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(owner)).length;
      const userOwnerCount = owners.filter((owner) => /^@[A-Za-z0-9_.-]+$/.test(owner)).length;
      const emailOwnerCount = owners.filter((owner) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(owner)).length;
      const wildcardCount = patterns.filter((pattern) => /[*?]/.test(pattern) || pattern === "/").length;
      const protectedPathCount = patterns.filter((pattern) => /(^|\/)(\.github|CODEOWNERS|SECURITY|package\.json|pnpm-lock|package-lock|yarn\.lock|src|app|packages|infra|deploy)/i.test(pattern)).length;
      const duplicatePatternCount = patterns.length - new Set(patterns).size;
      const selfOwnershipCount = patterns.filter((pattern) => /CODEOWNERS|\.github\/?$/i.test(pattern)).length;
      return {
        filePath: source.filePath,
        location: codeOwnershipLocation(source.filePath),
        ruleCount: lines.length,
        ownerCount: owners.length,
        teamOwnerCount,
        userOwnerCount,
        emailOwnerCount,
        wildcardCount,
        protectedPathCount,
        duplicatePatternCount,
        selfOwnershipCount,
        readiness: lines.length > 0 && owners.length > 0 && codeOwnershipLocation(source.filePath) !== "unknown" ? "ready" : lines.length > 0 || owners.length > 0 ? "partial" : "missing",
        evidence: `${source.filePath} has ${lines.length} CODEOWNERS rule candidate(s), ${owners.length} owner token(s), ${teamOwnerCount} team owner(s), and ${duplicatePatternCount} duplicate pattern candidate(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function codeOwnershipLocation(filePath: string): CodeOwnershipReadinessReport["codeownerFiles"][number]["location"] {
  if (/^CODEOWNERS$/i.test(filePath)) return "root";
  if (/^\.github\/CODEOWNERS$/i.test(filePath)) return "github";
  if (/^docs\/CODEOWNERS$/i.test(filePath)) return "docs";
  if (/^\.gitlab\/CODEOWNERS$/i.test(filePath)) return "gitlab";
  return "unknown";
}

function codeOwnershipSignals(sourceFiles: CodeOwnershipSourceFile[]): CodeOwnershipReadinessReport["ownershipSignals"] {
  const specs: Array<{ signal: CodeOwnershipReadinessReport["ownershipSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "codeowners-file", pattern: /(^|\/)CODEOWNERS$/i, evidence: "CODEOWNERS file path evidence was detected." },
    { signal: "standard-location", pattern: /(^CODEOWNERS$|^\.github\/CODEOWNERS$|^docs\/CODEOWNERS$)/i, evidence: "GitHub standard CODEOWNERS location evidence was detected." },
    { signal: "pattern-rules", pattern: /^\/?[\w.*?/\-[\]{}!]+[ \t]+@/im, evidence: "CODEOWNERS path pattern and owner rule evidence was detected." },
    { signal: "last-match-wins", pattern: /last (matching|mentioned)|order matters|last rule|last matching rule/i, evidence: "last matching rule precedence evidence was detected." },
    { signal: "team-owner", pattern: /@[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/i, evidence: "team owner evidence was detected." },
    { signal: "user-owner", pattern: /(^|\s)@[A-Za-z0-9_.-]+(\s|$)/i, evidence: "user owner evidence was detected." },
    { signal: "email-owner", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, evidence: "email owner evidence was detected." },
    { signal: "self-owned-codeowners", pattern: /CODEOWNERS\s+@|\.github\/?\s+@|\/\.github\/CODEOWNERS\s+@/i, evidence: "CODEOWNERS self-ownership evidence was detected." }
  ];
  return codeOwnershipSignalFromSpecs(sourceFiles, specs, "ownership");
}

function codeOwnershipValidationSignals(sourceFiles: CodeOwnershipSourceFile[]): CodeOwnershipReadinessReport["validationSignals"] {
  const specs: Array<{ signal: CodeOwnershipReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "syntax-check", pattern: /syntax|ParseFile|parseRule|CODEOWNERS errors?|codeowners\/errors/i, evidence: "CODEOWNERS syntax validation evidence was detected." },
    { signal: "owner-check", pattern: /owner_checker|owners?_must_be_teams|owner existence|write permissions?|visible team|owners/i, evidence: "owner validation evidence was detected." },
    { signal: "file-exists-check", pattern: /files|file_exists|does not match any files|zglob|not-owned/i, evidence: "file existence or coverage validation evidence was detected." },
    { signal: "duplicate-pattern-check", pattern: /duppatterns|duplicate pattern|duplicate/i, evidence: "duplicate pattern validation evidence was detected." },
    { signal: "not-owned-check", pattern: /not[-_ ]owned|unowned|allow_unowned|not_owned_checker/i, evidence: "not-owned coverage validation evidence was detected." },
    { signal: "github-action", pattern: /codeowners-validator|GitHub CODEOWNERS Validator|mszostok\/codeowners-validator|ghcr\.io\/mszostok\/codeowners-validator/i, evidence: "CODEOWNERS validator GitHub Action evidence was detected." },
    { signal: "api-errors", pattern: /codeowners\/errors|CODEOWNERS.*API|errors highlighted|List codeowners errors/i, evidence: "GitHub CODEOWNERS errors API evidence was detected." }
  ];
  return codeOwnershipSignalFromSpecs(sourceFiles, specs, "validation");
}

function codeOwnershipReviewSignals(sourceFiles: CodeOwnershipSourceFile[]): CodeOwnershipReadinessReport["reviewSignals"] {
  const specs: Array<{ signal: CodeOwnershipReadinessReport["reviewSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "auto-review-request", pattern: /automatically requested|request(ed)? reviews?|code owners.*review/i, evidence: "automatic code owner review request evidence was detected." },
    { signal: "required-code-owner-review", pattern: /Require review from Code Owners|required code owner review|required.*code owners/i, evidence: "required code owner review evidence was detected." },
    { signal: "branch-protection", pattern: /branch protection|branchProtection|branch_protection|protected branches?|branches\/.*protection/i, evidence: "branch protection evidence was detected." },
    { signal: "rulesets", pattern: /rulesets?|repository rules|ruleset/i, evidence: "ruleset evidence was detected." },
    { signal: "dismiss-stale-review", pattern: /dismiss stale|stale review|dismiss.*review/i, evidence: "stale review dismissal evidence was detected." },
    { signal: "required-approving-review", pattern: /required_approving_review_count|required approving review|approving reviews?/i, evidence: "required approving review count evidence was detected." },
    { signal: "fork-base-branch", pattern: /fork|base branch|upstream repository/i, evidence: "fork/base branch CODEOWNERS behavior evidence was detected." },
    { signal: "draft-pr", pattern: /draft pull request|ready for review|draft PR/i, evidence: "draft pull request review request behavior evidence was detected." }
  ];
  return codeOwnershipSignalFromSpecs(sourceFiles, specs, "review");
}

function codeOwnershipCoverageSignals(sourceFiles: CodeOwnershipSourceFile[]): CodeOwnershipReadinessReport["coverageSignals"] {
  const specs: Array<{ signal: CodeOwnershipReadinessReport["coverageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-default", pattern: /^\*\s+@|^\/\*\s+@/im, evidence: "default wildcard ownership evidence was detected." },
    { signal: "docs", pattern: /(^|\n)\s*\/?docs\/|\bdocs\/CODEOWNERS\b/i, evidence: "docs ownership evidence was detected." },
    { signal: "src", pattern: /(^|\n)\s*\/?src\/|source code|code base/i, evidence: "source directory ownership evidence was detected." },
    { signal: "tests", pattern: /(^|\n)\s*\/?(test|tests|__tests__)\/|\.test\.|\.spec\./i, evidence: "test ownership evidence was detected." },
    { signal: "github-directory", pattern: /(^|\n)\s*\/?\.github\/|CODEOWNERS\s+@|\.github\/CODEOWNERS/i, evidence: ".github ownership evidence was detected." },
    { signal: "packages", pattern: /(^|\n)\s*\/?(packages|apps|libs)\//i, evidence: "package/app ownership evidence was detected." },
    { signal: "unowned-allowed", pattern: /allow_unowned|allow unowned|unowned.*allowed|owner_checker_allow_unowned_patterns/i, evidence: "allowed-unowned policy evidence was detected." },
    { signal: "case-sensitive-paths", pattern: /case sensitive|cased correctly|case-sensitive/i, evidence: "case-sensitive CODEOWNERS path evidence was detected." }
  ];
  return codeOwnershipSignalFromSpecs(sourceFiles, specs, "coverage");
}

function codeOwnershipPackageSignals(sourceFiles: CodeOwnershipSourceFile[]): CodeOwnershipReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CodeOwnershipReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hmarr/codeowners", pattern: /hmarr\/codeowners|\bcodeowners\b.*ParseFile|LoadFileFromStandardLocation/i, evidence: "hmarr/codeowners parser evidence was detected." },
    { signal: "codeowners-validator", pattern: /mszostok\/codeowners-validator|codeowners-validator|GitHub CODEOWNERS Validator/i, evidence: "codeowners-validator evidence was detected." },
    { signal: "github-codeowners-api", pattern: /codeowners\/errors|List codeowners errors|CODEOWNERS.*API/i, evidence: "GitHub CODEOWNERS API evidence was detected." },
    { signal: "custom", pattern: /CODEOWNERS|code owners?|required code owner review|branch protection/i, evidence: "custom CODEOWNERS/readiness terminology evidence was detected." }
  ];
  return codeOwnershipSignalFromSpecs(sourceFiles, specs, "package");
}

function codeOwnershipSignalFromSpecs<T extends { signal: string; pattern: RegExp; evidence: string }>(
  sourceFiles: CodeOwnershipSourceFile[],
  specs: T[],
  label: string
): Array<{ signal: T["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/code-ownership-readiness.html"
    };
  });
}
