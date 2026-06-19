import type { ChangelogReadinessReport, CommitConventionReport, FormatReadinessReport, LintReadinessReport } from "@repotutor/shared";
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

export async function buildLintReadinessReport(walk: WalkResult): Promise<LintReadinessReport> {
  const sourceFiles = await lintReadinessSourceFiles(walk);
  const configFiles = lintReadinessConfigFiles(sourceFiles);
  const ruleSignals = lintReadinessRuleSignals(sourceFiles);
  const scriptSignals = lintReadinessScriptSignals(sourceFiles);
  const scopeSignals = lintReadinessScopeSignals(sourceFiles);
  const outputSignals = lintReadinessOutputSignals(sourceFiles);
  const packageSignals = lintReadinessPackageSignals(sourceFiles);

  const hasConfig = configFiles.length > 0;
  const hasLintScript = scriptSignals.some((item) => item.signal === "lint" && item.readiness === "ready");
  const hasRules = ruleSignals.some((item) => item.signal === "rules" && item.readiness === "ready");
  const hasIgnores = ruleSignals.some((item) => item.signal === "ignores" && item.readiness === "ready");
  const hasTypeScript = scopeSignals.some((item) => item.signal === "typescript" && item.readiness === "ready")
    || packageSignals.some((item) => item.signal === "typescript-eslint" && item.readiness === "ready");
  const hasParser = ruleSignals.some((item) => item.signal === "parser" && item.readiness === "ready");
  const hasMaxWarnings = scriptSignals.some((item) => item.signal === "max-warnings" && item.readiness === "ready");
  const hasUnusedDisable = outputSignals.some((item) => item.signal === "report-unused-disable" && item.readiness === "ready");

  const riskQueue: LintReadinessReport["riskQueue"] = [];
  if (!hasConfig && !hasLintScript) {
    riskQueue.push({
      priority: "medium",
      action: "Add a lint config or package script so learners can find the lint boundary.",
      why: "ESLint-style readiness starts from eslint.config.*, package scripts, and ignore rules that define what is checked.",
      relatedHref: "html/lint-readiness.html"
    });
  }
  if (hasLintScript && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add the lint configuration referenced by the lint script.",
      why: "A lint script without an inspectable config hides rule severity, parser, plugin, globals, and ignore policy.",
      relatedHref: "html/lint-readiness.html"
    });
  }
  if (hasConfig && !hasRules) {
    riskQueue.push({
      priority: "medium",
      action: "Document explicit rules or an extends/recommended preset.",
      why: "ESLint rule severity is the learner-facing contract for which patterns fail CI.",
      relatedHref: "html/lint-readiness.html"
    });
  }
  if (hasConfig && !hasIgnores) {
    riskQueue.push({
      priority: "low",
      action: "Review ignore patterns for generated files, build output, and vendored code.",
      why: "Flat config and ignore files decide whether lint output is meaningful or noisy.",
      relatedHref: "html/lint-readiness.html"
    });
  }
  if (hasTypeScript && !hasParser) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm TypeScript parser and typed linting boundaries.",
      why: "TypeScript linting often needs parser/plugin configuration and may need separate type-aware commands.",
      relatedHref: "html/lint-readiness.html"
    });
  }
  if (hasLintScript && !hasMaxWarnings) {
    riskQueue.push({
      priority: "low",
      action: "Consider --max-warnings=0 for CI lint scripts.",
      why: "Warnings otherwise may hide policy drift while still passing automation.",
      relatedHref: "html/lint-readiness.html"
    });
  }
  if (hasConfig && !hasUnusedDisable) {
    riskQueue.push({
      priority: "low",
      action: "Consider reporting unused eslint-disable directives.",
      why: "Unused suppression comments can keep stale exceptions alive after code changes.",
      relatedHref: "html/lint-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run lint commands in a trusted workspace before treating this static report as approval.",
    why: "RepoTutor records lint readiness statically; it does not execute ESLint, autofix files, or resolve parser/plugin packages.",
    relatedHref: "html/lint-readiness.html"
  });

  return {
    summary: `ESLint식 lint readiness report: config file ${configFiles.length}개, rule signal ${ruleSignals.length}개, script signal ${scriptSignals.length}개, package signal ${packageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "ESLint flat config rules plugins parser ignores fix cache max-warnings report-unused-disable-directives print-config inspect-config",
    configFiles,
    ruleSignals,
    scriptSignals,
    scopeSignals,
    outputSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx eslint .", purpose: "Run the configured lint check in a trusted workspace." },
      { command: "npx eslint . --fix-dry-run", purpose: "Preview autofixable problems without writing files." },
      { command: "npx eslint . --max-warnings=0", purpose: "Make warning drift fail CI during readiness checks." },
      { command: "npx eslint --print-config <file>", purpose: "Inspect the resolved config for one representative file." },
      { command: "npx eslint --inspect-config", purpose: "Open ESLint's config inspector when flat config resolution is unclear." },
      { command: "npx eslint . --cache --cache-location .eslintcache", purpose: "Validate cache behavior while keeping cache files explicit." }
    ],
    learnerNextSteps: [
      "Start with eslint.config.* or package.json scripts to learn which files are checked and which command CI should run.",
      "Then inspect rules, extends, plugins, parser, globals, and ignores to understand the actual lint contract.",
      "Check TypeScript and JSX scopes separately because parser/plugin setup can differ from plain JavaScript linting.",
      "RepoTutor does not run ESLint or apply fixes; use this page as a static map before executing lint commands yourself."
    ]
  };
}

type LintReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function lintReadinessSourceFiles(walk: WalkResult): Promise<LintReadinessSourceFile[]> {
  const files: LintReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !lintReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!lintReadinessPathSignal(file.relPath) && !lintReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function lintReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return lintReadinessPathSignal(filePath)
    || /^(package\.json|tsconfig\.json|jsconfig\.json|\.eslintignore|\.gitignore)$/i.test(base)
    || filePath.startsWith(".github/workflows/")
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|ya?ml|toml|md)$/i.test(filePath);
}

function lintReadinessPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(eslint\.config\.[cm]?[jt]s|\.eslintrc|\.eslintrc\.(json|ya?ml|js|cjs)|biome\.json|biome\.jsonc|\.oxlintrc\.json|standard\.json|package\.json)$/i.test(base)
    || /eslint|lint|biome|oxlint|standard/i.test(filePath);
}

function lintReadinessContentSignal(text: string): boolean {
  return /eslint|biome|oxlint|standard|defineConfig|rules\s*:|plugins\s*:|parser\s*:|languageOptions|globalIgnores|includeIgnoreFile|max-warnings|fix-dry-run|report-unused-disable/i.test(text);
}

function lintReadinessConfigFiles(sourceFiles: LintReadinessSourceFile[]): LintReadinessReport["configFiles"] {
  return sourceFiles
    .filter((source) => lintReadinessConfigPathSignal(source.filePath, source.text))
    .slice(0, 80)
    .map((source) => {
      const configType = lintReadinessConfigType(source.filePath, source.text);
      const flatConfig = /eslint\.config\.[cm]?[jt]s$/i.test(source.filePath) || /defineConfig|globalIgnores|languageOptions/i.test(source.text);
      const ruleCount = countMatches(source.text, /rules\s*:|["'][A-Za-z0-9@/_-]+\/?[A-Za-z0-9_-]+["']\s*:/g);
      const pluginCount = countMatches(source.text, /plugins\s*:|eslint-plugin|@typescript-eslint|plugin:/g);
      const ignoreCount = countMatches(source.text, /ignores\s*:|ignorePatterns|globalIgnores|includeIgnoreFile|\.eslintignore|ignore-pattern/g);
      const parserSignal = lintReadinessParserSignal(source.text);
      return {
        filePath: source.filePath,
        configType,
        flatConfig,
        ruleCount,
        pluginCount,
        ignoreCount,
        parserSignal,
        readiness: ruleCount > 0 || pluginCount > 0 || ignoreCount > 0 || parserSignal !== "missing" ? "ready" : "partial",
        evidence: `${source.filePath} contains ${configType} lint config with ${ruleCount} rule signal(s), ${pluginCount} plugin signal(s), and ${ignoreCount} ignore signal(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function lintReadinessConfigPathSignal(filePath: string, text: string): boolean {
  const base = path.basename(filePath);
  return /^(eslint\.config\.[cm]?[jt]s|\.eslintrc|\.eslintrc\.(json|ya?ml|js|cjs)|biome\.json|biome\.jsonc|\.oxlintrc\.json|standard\.json)$/i.test(base)
    || (base === "package.json" && /"eslintConfig"\s*:|"standard"\s*:|"scripts"\s*:[\s\S]*"lint"/i.test(text));
}

function lintReadinessConfigType(filePath: string, text: string): LintReadinessReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath).toLowerCase();
  if (/eslint|\.eslintrc/.test(base) || /eslintConfig|eslint-plugin|defineConfig/i.test(text)) return "eslint";
  if (/biome/.test(base) || /biome\s+check/i.test(text)) return "biome";
  if (/oxlint|\.oxlintrc/.test(base) || /oxlint/i.test(text)) return "oxlint";
  if (/standard/.test(base) || /standard/i.test(text)) return "standard";
  if (base === "package.json") return "package-json";
  return "unknown";
}

function lintReadinessParserSignal(text: string): LintReadinessReport["configFiles"][number]["parserSignal"] {
  if (/@typescript-eslint\/parser|typescript-eslint|tsParser/i.test(text)) return "typescript";
  if (/@babel\/eslint-parser|babel-eslint/i.test(text)) return "babel";
  if (/parser\s*:|languageOptions\s*:[\s\S]*parser/i.test(text)) return "custom";
  if (/eslint|defineConfig|rules\s*:/i.test(text)) return "default";
  return "missing";
}

function lintReadinessRuleSignals(sourceFiles: LintReadinessSourceFile[]): LintReadinessReport["ruleSignals"] {
  const specs: Array<{ signal: LintReadinessReport["ruleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rules", pattern: /rules\s*:/i, evidence: "rule map evidence was detected." },
    { signal: "extends", pattern: /extends\s*:|eslint:recommended|plugin:|recommended/i, evidence: "extends or recommended preset evidence was detected." },
    { signal: "recommended", pattern: /recommended|eslint:recommended|configs\.recommended/i, evidence: "recommended preset evidence was detected." },
    { signal: "severity", pattern: /"error"|"warn"|"off"|:\s*[012]\b/i, evidence: "rule severity evidence was detected." },
    { signal: "files-overrides", pattern: /files\s*:|overrides\s*:/i, evidence: "file scope or overrides evidence was detected." },
    { signal: "globals", pattern: /globals\s*:|languageOptions|env\s*:/i, evidence: "global variable or language options evidence was detected." },
    { signal: "parser", pattern: /parser\s*:|@typescript-eslint\/parser|@babel\/eslint-parser|languageOptions[\s\S]*parser/i, evidence: "parser evidence was detected." },
    { signal: "plugins", pattern: /plugins\s*:|eslint-plugin|@typescript-eslint/i, evidence: "plugin evidence was detected." },
    { signal: "ignores", pattern: /ignores\s*:|ignorePatterns|globalIgnores|includeIgnoreFile|\.eslintignore/i, evidence: "ignore policy evidence was detected." },
    { signal: "inline-disable", pattern: /eslint-disable|noInlineConfig|inlineConfig/i, evidence: "inline disable policy evidence was detected." },
    { signal: "unused-disable", pattern: /reportUnusedDisableDirectives|unused eslint-disable|report-unused-disable/i, evidence: "unused-disable reporting evidence was detected." }
  ];
  return lintReadinessSignalFromSpecs(sourceFiles, specs, "rule", "signal");
}

function lintReadinessScriptSignals(sourceFiles: LintReadinessSourceFile[]): LintReadinessReport["scriptSignals"] {
  const specs: Array<{ signal: LintReadinessReport["scriptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "lint", pattern: /"lint[^"]*"\s*:|\beslint\b|\bbiome\s+check\b|\boxlint\b|\bstandard\b/i, evidence: "lint script evidence was detected." },
    { signal: "lint-fix", pattern: /lint:fix|--fix\b|fix-dry-run|biome.*--write|oxlint.*--fix/i, evidence: "lint fix script evidence was detected." },
    { signal: "cache", pattern: /--cache\b|cache-location|cache-strategy/i, evidence: "lint cache evidence was detected." },
    { signal: "max-warnings", pattern: /max-warnings|--max-warnings/i, evidence: "max warnings gate evidence was detected." },
    { signal: "format", pattern: /prettier|fmt:|format|biome.*format/i, evidence: "format integration evidence was detected." },
    { signal: "type-aware", pattern: /typescript-eslint|parserOptions|projectService|tsconfig/i, evidence: "type-aware lint evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|CI\b|--format|junit|github/i, evidence: "CI lint evidence was detected." },
    { signal: "stdin", pattern: /--stdin|stdin-filename|Lint code provided on <STDIN>/i, evidence: "stdin lint evidence was detected." },
    { signal: "report", pattern: /--format|--output-file|formatter|json|sarif/i, evidence: "lint report output evidence was detected." }
  ];
  return lintReadinessSignalFromSpecs(sourceFiles, specs, "script", "signal");
}

function lintReadinessScopeSignals(sourceFiles: LintReadinessSourceFile[]): LintReadinessReport["scopeSignals"] {
  const specs: Array<{ signal: LintReadinessReport["scopeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "javascript", pattern: /\.m?js\b|\.cjs\b|\*\*\/\*\.js|ECMAScript|JavaScript/i, evidence: "JavaScript lint scope evidence was detected." },
    { signal: "typescript", pattern: /\.tsx?\b|typescript-eslint|tsconfig|TypeScript/i, evidence: "TypeScript lint scope evidence was detected." },
    { signal: "jsx", pattern: /\.jsx\b|\.tsx\b|JSX|react/i, evidence: "JSX lint scope evidence was detected." },
    { signal: "tests", pattern: /tests?\/|\.spec\.|\.test\.|mocha|vitest|jest/i, evidence: "test file lint scope evidence was detected." },
    { signal: "docs", pattern: /docs\/|markdown|lintDocs|mdx/i, evidence: "docs lint scope evidence was detected." },
    { signal: "config-files", pattern: /config|\.ya?ml|\.json|toml/i, evidence: "config-file lint scope evidence was detected." },
    { signal: "generated", pattern: /generated|dist\/|build\/|coverage\/|templates\/|fixtures\//i, evidence: "generated or ignored file scope evidence was detected." }
  ];
  return lintReadinessSignalFromSpecs(sourceFiles, specs, "scope", "signal");
}

function lintReadinessOutputSignals(sourceFiles: LintReadinessSourceFile[]): LintReadinessReport["outputSignals"] {
  const specs: Array<{ signal: LintReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "formatter", pattern: /--format|formatter|stylish|json|sarif|junit/i, evidence: "formatter evidence was detected." },
    { signal: "output-file", pattern: /--output-file|outputFile/i, evidence: "output file evidence was detected." },
    { signal: "stats", pattern: /--stats|stats/i, evidence: "stats evidence was detected." },
    { signal: "quiet", pattern: /--quiet|quiet/i, evidence: "quiet mode evidence was detected." },
    { signal: "debug", pattern: /--debug|debug/i, evidence: "debug output evidence was detected." },
    { signal: "report-unused-disable", pattern: /reportUnusedDisableDirectives|report-unused-disable/i, evidence: "unused-disable output evidence was detected." },
    { signal: "suppressions", pattern: /suppressions|suppressAll|suppressRule|pruneSuppressions/i, evidence: "suppression output evidence was detected." }
  ];
  return lintReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function lintReadinessPackageSignals(sourceFiles: LintReadinessSourceFile[]): LintReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LintReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "eslint", pattern: /"eslint"\s*:|eslint\b/i, evidence: "ESLint package evidence was detected." },
    { signal: "typescript-eslint", pattern: /@typescript-eslint|typescript-eslint/i, evidence: "typescript-eslint package evidence was detected." },
    { signal: "eslint-plugin", pattern: /eslint-plugin|plugins\s*:/i, evidence: "ESLint plugin evidence was detected." },
    { signal: "eslint-config", pattern: /eslint-config|extends\s*:/i, evidence: "ESLint shareable config evidence was detected." },
    { signal: "parser", pattern: /eslint-parser|parser\s*:/i, evidence: "parser package evidence was detected." },
    { signal: "prettier-integration", pattern: /prettier|eslint-config-prettier|eslint-plugin-prettier/i, evidence: "Prettier integration evidence was detected." },
    { signal: "globals", pattern: /"globals"\s*:|globals\b/i, evidence: "globals package or config evidence was detected." }
  ];
  return lintReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function lintReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LintReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/lint-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildFormatReadinessReport(walk: WalkResult): Promise<FormatReadinessReport> {
  const sourceFiles = await formatReadinessSourceFiles(walk);
  const configFiles = formatReadinessConfigFiles(sourceFiles);
  const ignoreFiles = formatReadinessIgnoreFiles(sourceFiles);
  const optionSignals = formatReadinessOptionSignals(sourceFiles);
  const scriptSignals = formatReadinessScriptSignals(sourceFiles);
  const scopeSignals = formatReadinessScopeSignals(sourceFiles);
  const packageSignals = formatReadinessPackageSignals(sourceFiles);

  const hasConfig = configFiles.length > 0;
  const hasIgnore = ignoreFiles.length > 0;
  const hasFormatScript = scriptSignals.some((item) => item.signal === "format" && item.readiness === "ready");
  const hasCheck = scriptSignals.some((item) => item.signal === "format-check" && item.readiness === "ready");
  const hasWrite = scriptSignals.some((item) => item.signal === "format-write" && item.readiness === "ready");
  const hasPackage = packageSignals.some((item) => item.signal === "prettier" && item.readiness === "ready");
  const hasPlugin = packageSignals.some((item) => item.signal === "prettier-plugin" && item.readiness === "ready")
    || configFiles.some((item) => item.pluginCount > 0);

  const riskQueue: FormatReadinessReport["riskQueue"] = [];
  if (!hasConfig && !hasFormatScript) {
    riskQueue.push({
      priority: "medium",
      action: "Add a Prettier config or package script so learners can find the formatting boundary.",
      why: "Prettier-style readiness starts from .prettierrc, prettier.config.*, package scripts, and ignore rules that define what can be rewritten.",
      relatedHref: "html/format-readiness.html"
    });
  }
  if (hasWrite && !hasIgnore) {
    riskQueue.push({
      priority: "high",
      action: "Add or review .prettierignore before using write-mode formatting.",
      why: "Prettier --write rewrites files in place; ignore files protect generated output, build artifacts, and vendored code.",
      relatedHref: "html/format-readiness.html"
    });
  }
  if ((hasConfig || hasFormatScript) && !hasCheck) {
    riskQueue.push({
      priority: "medium",
      action: "Add a non-writing format check command for CI and learner verification.",
      why: "Prettier --check or --list-different provides a safe readiness gate before any --write workflow.",
      relatedHref: "html/format-readiness.html"
    });
  }
  if ((hasConfig || hasFormatScript) && !hasPackage) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm the formatter package is installed where the script runs.",
      why: "A script or config without package metadata can depend on global tooling or editor-only behavior that RepoTutor cannot verify statically.",
      relatedHref: "html/format-readiness.html"
    });
  }
  if (hasPlugin) {
    riskQueue.push({
      priority: "low",
      action: "Clear or scope the Prettier cache when formatter plugins change.",
      why: "Prettier warns that plugin versions and implementations are not cache keys.",
      relatedHref: "html/format-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run format commands in a trusted workspace before treating this static report as approval.",
    why: "RepoTutor records formatter readiness statically; it does not execute Prettier, rewrite files, load plugins, or create cache files.",
    relatedHref: "html/format-readiness.html"
  });

  return {
    summary: `Prettier식 format readiness report: config file ${configFiles.length}개, ignore file ${ignoreFiles.length}개, option signal ${optionSignals.length}개, script signal ${scriptSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Prettier config ignore options plugins parser check write list-different cache editorconfig file-info find-config-path",
    configFiles,
    ignoreFiles,
    optionSignals,
    scriptSignals,
    scopeSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx prettier . --check", purpose: "Check formatting in a trusted workspace without writing files." },
      { command: "npx prettier . --list-different", purpose: "Print only files that differ from Prettier output for CI handoff." },
      { command: "npx prettier . --write", purpose: "Rewrite supported files only after reviewing config and ignore boundaries." },
      { command: "npx prettier --find-config-path <file>", purpose: "Find the config Prettier would resolve for one representative file." },
      { command: "npx prettier --file-info <file> --ignore-path .prettierignore", purpose: "Check parser inference and ignore handling for one file." },
      { command: "npx prettier . --check --cache --cache-strategy content", purpose: "Validate cached checking while making cache behavior explicit." }
    ],
    learnerNextSteps: [
      "Start with .prettierrc, prettier.config.*, package.json, and .editorconfig to learn which options are shared across CLI and editors.",
      "Then inspect .prettierignore and .gitignore before any write-mode command so generated files are not reformatted.",
      "Use --check or --list-different as the safe CI gate, and keep --write as a deliberate trusted-workspace action.",
      "RepoTutor does not run Prettier or load plugins; use this page as a static map before executing formatter commands yourself."
    ]
  };
}

type FormatReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function formatReadinessSourceFiles(walk: WalkResult): Promise<FormatReadinessSourceFile[]> {
  const files: FormatReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !formatReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!formatReadinessPathSignal(file.relPath) && !formatReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function formatReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return formatReadinessPathSignal(filePath)
    || /^(package\.json|\.gitignore|\.editorconfig)$/i.test(base)
    || filePath.startsWith(".github/workflows/")
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|json5|ya?ml|toml|md|css|scss|html|graphql)$/i.test(filePath);
}

function formatReadinessPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(\.prettierrc|\.prettierrc\.(json|json5|ya?ml|toml|js|cjs|mjs|ts|cts|mts)|prettier\.config\.[cm]?[jt]s|\.prettierignore|\.editorconfig|dprint\.json|biome\.json|biome\.jsonc|package\.json)$/i.test(base)
    || /prettier|format|dprint|biome/i.test(filePath);
}

function formatReadinessContentSignal(text: string): boolean {
  return /prettier|\.prettierignore|printWidth|tabWidth|singleQuote|trailingComma|bracketSpacing|endOfLine|list-different|find-config-path|ignore-path|cache-strategy|editorconfig/i.test(text);
}

function formatReadinessConfigFiles(sourceFiles: FormatReadinessSourceFile[]): FormatReadinessReport["configFiles"] {
  return sourceFiles
    .filter((source) => formatReadinessConfigPathSignal(source.filePath, source.text))
    .slice(0, 80)
    .map((source) => {
      const configType = formatReadinessConfigType(source.filePath, source.text);
      const optionCount = countMatches(source.text, /printWidth|tabWidth|useTabs|singleQuote|jsxSingleQuote|trailingComma|semi|bracketSpacing|bracketSameLine|arrowParens|endOfLine|quoteProps|htmlWhitespaceSensitivity/g);
      const overrideCount = countMatches(source.text, /overrides\s*:|files\s*:|excludeFiles/g);
      const pluginCount = countMatches(source.text, /plugins\s*:|prettier-plugin|@prettier\/plugin/g);
      const parserSignal = formatReadinessParserSignal(source.text);
      return {
        filePath: source.filePath,
        configType,
        optionCount,
        overrideCount,
        pluginCount,
        parserSignal,
        readiness: optionCount > 0 || overrideCount > 0 || pluginCount > 0 || parserSignal !== "missing" ? "ready" : "partial",
        evidence: `${source.filePath} contains ${configType} formatter config with ${optionCount} option signal(s), ${overrideCount} override signal(s), and ${pluginCount} plugin signal(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function formatReadinessIgnoreFiles(sourceFiles: FormatReadinessSourceFile[]): FormatReadinessReport["ignoreFiles"] {
  return sourceFiles
    .filter((source) => /^(\.prettierignore|\.gitignore)$/i.test(path.basename(source.filePath)) || /--ignore-path|ignorePath/i.test(source.text))
    .slice(0, 80)
    .map((source) => {
      const patternCount = source.text.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("#")).length;
      const generatedSignal = /dist|build|coverage|generated|node_modules|vendor|\.cache/i.test(source.text);
      return {
        filePath: source.filePath,
        patternCount,
        generatedSignal,
        readiness: patternCount > 0 ? "ready" : "partial",
        evidence: `${source.filePath} contains ${patternCount} ignore pattern(s)${generatedSignal ? " including generated/build output signals" : ""}.`,
        sourceHref: source.sourceHref
      };
    });
}

function formatReadinessConfigPathSignal(filePath: string, text: string): boolean {
  const base = path.basename(filePath);
  return /^(\.prettierrc|\.prettierrc\.(json|json5|ya?ml|toml|js|cjs|mjs|ts|cts|mts)|prettier\.config\.[cm]?[jt]s|\.editorconfig|dprint\.json|biome\.json|biome\.jsonc)$/i.test(base)
    || (base === "package.json" && /"prettier"\s*:|"scripts"\s*:[\s\S]*("format"|"fmt"|prettier)/i.test(text));
}

function formatReadinessConfigType(filePath: string, text: string): FormatReadinessReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath).toLowerCase();
  if (/prettier|\.prettierrc/.test(base) || /"prettier"\s*:|prettier-plugin|printWidth|tabWidth/i.test(text)) return "prettier";
  if (base === ".editorconfig") return "editorconfig";
  if (/biome/.test(base) || /biome\s+format/i.test(text)) return "biome";
  if (/dprint/.test(base) || /dprint/i.test(text)) return "dprint";
  if (base === "package.json") return "package-json";
  return "unknown";
}

function formatReadinessParserSignal(text: string): FormatReadinessReport["configFiles"][number]["parserSignal"] {
  if (/plugins\s*:|prettier-plugin|@prettier\/plugin/i.test(text)) return "plugin";
  if (/parser\s*:|overrides\s*:[\s\S]*parser/i.test(text)) return "override";
  if (/prettier|printWidth|tabWidth|trailingComma|editorconfig/i.test(text)) return "inferred";
  return "missing";
}

function formatReadinessOptionSignals(sourceFiles: FormatReadinessSourceFile[]): FormatReadinessReport["optionSignals"] {
  const specs: Array<{ signal: FormatReadinessReport["optionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "print-width", pattern: /printWidth|print-width|max_line_length/i, evidence: "print width evidence was detected." },
    { signal: "tab-width", pattern: /tabWidth|tab-width|tab_width|indent_size/i, evidence: "tab width evidence was detected." },
    { signal: "single-quote", pattern: /singleQuote|single-quote|jsxSingleQuote/i, evidence: "quote style evidence was detected." },
    { signal: "trailing-comma", pattern: /trailingComma|trailing-comma/i, evidence: "trailing comma evidence was detected." },
    { signal: "semi", pattern: /\bsemi\b|--no-semi/i, evidence: "semicolon option evidence was detected." },
    { signal: "bracket-spacing", pattern: /bracketSpacing|bracket-spacing|bracketSameLine/i, evidence: "bracket spacing evidence was detected." },
    { signal: "end-of-line", pattern: /endOfLine|end-of-line|end_of_line/i, evidence: "end-of-line evidence was detected." },
    { signal: "parser", pattern: /parser\s*:|--parser|stdin-filepath|file-info/i, evidence: "parser inference or override evidence was detected." },
    { signal: "overrides", pattern: /overrides\s*:|excludeFiles|files\s*:/i, evidence: "override evidence was detected." },
    { signal: "editorconfig", pattern: /\.editorconfig|editorconfig|no-editorconfig/i, evidence: "EditorConfig evidence was detected." }
  ];
  return formatReadinessSignalFromSpecs(sourceFiles, specs, "option", "signal");
}

function formatReadinessScriptSignals(sourceFiles: FormatReadinessSourceFile[]): FormatReadinessReport["scriptSignals"] {
  const specs: Array<{ signal: FormatReadinessReport["scriptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "format", pattern: /"format[^"]*"\s*:|"fmt"\s*:|\bprettier\b|\bdprint\b|\bbiome\s+format\b/i, evidence: "format script evidence was detected." },
    { signal: "format-check", pattern: /--check\b|list-different|biome\s+format[^\n"]*--write\s+false|dprint\s+check/i, evidence: "non-writing format check evidence was detected." },
    { signal: "format-write", pattern: /--write\b|\b-w\b|dprint\s+fmt|biome\s+format[^\n"]*--write/i, evidence: "write-mode format evidence was detected." },
    { signal: "list-different", pattern: /list-different|-l\b/i, evidence: "list-different evidence was detected." },
    { signal: "cache", pattern: /--cache\b|cache-location|cache-strategy|\.prettier-cache/i, evidence: "formatter cache evidence was detected." },
    { signal: "config-path", pattern: /find-config-path|--config\b|--no-config|config-precedence/i, evidence: "config path evidence was detected." },
    { signal: "ignore-path", pattern: /ignore-path|\.prettierignore|ignorePath/i, evidence: "ignore path evidence was detected." },
    { signal: "stdin", pattern: /stdin-filepath|--stdin|file-info/i, evidence: "stdin/file-info evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|CI\b|--check|list-different/i, evidence: "CI formatter evidence was detected." }
  ];
  return formatReadinessSignalFromSpecs(sourceFiles, specs, "script", "signal");
}

function formatReadinessScopeSignals(sourceFiles: FormatReadinessSourceFile[]): FormatReadinessReport["scopeSignals"] {
  const specs: Array<{ signal: FormatReadinessReport["scopeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "javascript", pattern: /\.m?js\b|\.cjs\b|JavaScript|babel|estree/i, evidence: "JavaScript format scope evidence was detected." },
    { signal: "typescript", pattern: /\.tsx?\b|TypeScript|typescript-estree|tsconfig/i, evidence: "TypeScript format scope evidence was detected." },
    { signal: "json", pattern: /\.json\b|json5|package\.json/i, evidence: "JSON format scope evidence was detected." },
    { signal: "css", pattern: /\.s?css\b|postcss|css/i, evidence: "CSS format scope evidence was detected." },
    { signal: "html", pattern: /\.html\b|html|angular|vue/i, evidence: "HTML format scope evidence was detected." },
    { signal: "markdown", pattern: /\.md\b|markdown|mdx|remark/i, evidence: "Markdown format scope evidence was detected." },
    { signal: "yaml", pattern: /\.ya?ml\b|yaml/i, evidence: "YAML format scope evidence was detected." },
    { signal: "graphql", pattern: /\.graphql\b|graphql/i, evidence: "GraphQL format scope evidence was detected." }
  ];
  return formatReadinessSignalFromSpecs(sourceFiles, specs, "scope", "signal");
}

function formatReadinessPackageSignals(sourceFiles: FormatReadinessSourceFile[]): FormatReadinessReport["packageSignals"] {
  const specs: Array<{ signal: FormatReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prettier", pattern: /"prettier"\s*:|prettier\b/i, evidence: "Prettier package evidence was detected." },
    { signal: "prettier-plugin", pattern: /prettier-plugin|@prettier\/plugin|plugins\s*:/i, evidence: "Prettier plugin evidence was detected." },
    { signal: "eslint-config-prettier", pattern: /eslint-config-prettier/i, evidence: "ESLint/Prettier conflict-prevention package evidence was detected." },
    { signal: "dprint", pattern: /"dprint"\s*:|dprint\b/i, evidence: "dprint package evidence was detected." },
    { signal: "biome", pattern: /"@biomejs\/biome"\s*:|biome\b/i, evidence: "Biome package evidence was detected." },
    { signal: "editorconfig", pattern: /editorconfig|\.editorconfig/i, evidence: "EditorConfig package or config evidence was detected." }
  ];
  return formatReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function formatReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: FormatReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/format-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildCommitConventionReport(walk: WalkResult): Promise<CommitConventionReport> {
  const sourceFiles = await commitConventionSourceFiles(walk);
  const configFiles = commitConventionConfigFiles(sourceFiles);
  const ruleSignals = commitConventionRuleSignals(sourceFiles);
  const hookSignals = commitConventionHookSignals(sourceFiles);
  const commandSignals = commitConventionCommandSignals(sourceFiles);
  const packageSignals = commitConventionPackageSignals(sourceFiles);

  const hasConfig = configFiles.length > 0;
  const hasHook = hookSignals.some((item) => item.signal === "commit-msg" && item.readiness === "ready");
  const hasCiRange = hookSignals.some((item) => item.signal === "ci-range" && item.readiness === "ready");
  const hasTypeEnum = ruleSignals.some((item) => item.signal === "type-enum" && item.readiness === "ready");
  const hasCli = packageSignals.some((item) => item.signal === "commitlint-cli" && item.readiness === "ready");
  const hasConventional = packageSignals.some((item) => item.signal === "config-conventional" && item.readiness === "ready")
    || configFiles.some((item) => item.parserPreset === "conventional");

  const riskQueue: CommitConventionReport["riskQueue"] = [];
  if (!hasConfig && !hasHook && !hasCiRange) {
    riskQueue.push({
      priority: "medium",
      action: "Add commitlint config, a commit-msg hook, or CI range check so learners can find the commit convention boundary.",
      why: "Commitlint readiness starts from config discovery, rules, and the command surface that checks messages before merge.",
      relatedHref: "html/commit-conventions.html"
    });
  }
  if ((hasHook || hasCiRange) && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add the commitlint configuration referenced by hooks or CI.",
      why: "A commit-msg hook without visible rules hides type, scope, subject, body, footer, and parser policy.",
      relatedHref: "html/commit-conventions.html"
    });
  }
  if (hasConfig && !hasTypeEnum && !hasConventional) {
    riskQueue.push({
      priority: "medium",
      action: "Define a type-enum rule or extend a conventional commit preset.",
      why: "Commit types are the learner-facing contract for release notes, changelog grouping, and review triage.",
      relatedHref: "html/commit-conventions.html"
    });
  }
  if ((hasConfig || hasHook || hasCiRange) && !hasCli) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm @commitlint/cli is installed where the hook or CI command runs.",
      why: "Global commitlint installs and editor-only integrations are not reproducible from the repository alone.",
      relatedHref: "html/commit-conventions.html"
    });
  }
  if (hasHook && !hasCiRange) {
    riskQueue.push({
      priority: "low",
      action: "Add a CI range check for pull request commits.",
      why: "Local hooks can be bypassed; commitlint --from/--to protects commits that arrive through remote workflows.",
      relatedHref: "html/commit-conventions.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run commitlint in a trusted workspace before treating this static report as approval.",
    why: "RepoTutor records commit convention readiness statically; it does not inspect private commit history or execute hooks.",
    relatedHref: "html/commit-conventions.html"
  });

  return {
    summary: `commitlint식 commit convention report: config file ${configFiles.length}개, rule signal ${ruleSignals.length}개, hook signal ${hookSignals.length}개, package signal ${packageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "commitlint config conventional commits rules parserPreset commit-msg husky from to last edit strict verbose prompt",
    configFiles,
    ruleSignals,
    hookSignals,
    commandSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx commitlint --last --verbose", purpose: "Check the latest commit message in a trusted workspace." },
      { command: "npx commitlint --from <base-sha> --to <head-sha> --verbose", purpose: "Check a pull request commit range in CI." },
      { command: "npx commitlint --edit .git/COMMIT_EDITMSG", purpose: "Check the current commit message file from a commit-msg hook." },
      { command: "npx commitlint --print-config", purpose: "Inspect resolved config, extends, parserPreset, and rules." },
      { command: "npx commitlint --strict --last", purpose: "Fail on warnings as well as errors when the policy requires it." },
      { command: "npx commit", purpose: "Use the prompt flow when @commitlint/prompt-cli or commitizen is configured." }
    ],
    learnerNextSteps: [
      "Start with commitlint.config.* or package.json commitlint fields to learn the rules and presets.",
      "Then inspect commit-msg hooks and CI range commands because local hooks can be bypassed.",
      "Check type-enum, scope-enum, subject, body, footer, and breaking-change rules as the actual commit contract.",
      "RepoTutor does not run commitlint or inspect private history; use this page as a static map before executing commit checks yourself."
    ]
  };
}

type CommitConventionSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function commitConventionSourceFiles(walk: WalkResult): Promise<CommitConventionSourceFile[]> {
  const files: CommitConventionSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !commitConventionInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!commitConventionPathSignal(file.relPath) && !commitConventionContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function commitConventionInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return commitConventionPathSignal(filePath)
    || /^(package\.json|\.gitmessage|COMMIT_EDITMSG)$/i.test(base)
    || filePath.startsWith(".github/workflows/")
    || filePath.startsWith(".husky/")
    || /\.(js|cjs|mjs|ts|json|json5|ya?ml|md|sh)$/i.test(filePath);
}

function commitConventionPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(commitlint\.config\.[cm]?[jt]s|\.commitlintrc|\.commitlintrc\.(json|ya?ml|js|cjs|mjs|ts|cts|mts)|package\.json)$/i.test(base)
    || /commitlint|commit-msg|conventional-commit|commitizen|cz-commitlint/i.test(filePath);
}

function commitConventionContentSignal(text: string): boolean {
  return /commitlint|conventional commits?|parserPreset|type-enum|scope-enum|commit-msg|COMMIT_EDITMSG|--from|--to|--last|--edit|@commitlint|commitizen|cz-commitlint/i.test(text);
}

function commitConventionConfigFiles(sourceFiles: CommitConventionSourceFile[]): CommitConventionReport["configFiles"] {
  return sourceFiles
    .filter((source) => commitConventionConfigPathSignal(source.filePath, source.text))
    .slice(0, 80)
    .map((source) => {
      const configType = commitConventionConfigType(source.filePath, source.text);
      const extendsCount = countMatches(source.text, /extends\s*:|@commitlint\/config-|commitlint-config-|config-conventional/g);
      const ruleCount = countMatches(source.text, /rules\s*:|type-enum|scope-enum|subject-|body-|footer-|header-|breaking-/g);
      const parserPreset = commitConventionParserPreset(source.text);
      const promptSignal = /prompt|commitizen|cz-commitlint|@commitlint\/prompt/i.test(source.text);
      return {
        filePath: source.filePath,
        configType,
        extendsCount,
        ruleCount,
        parserPreset,
        promptSignal,
        readiness: extendsCount > 0 || ruleCount > 0 || parserPreset !== "missing" ? "ready" : "partial",
        evidence: `${source.filePath} contains ${configType} commit convention config with ${extendsCount} extends signal(s), ${ruleCount} rule signal(s), and parserPreset ${parserPreset}.`,
        sourceHref: source.sourceHref
      };
    });
}

function commitConventionConfigPathSignal(filePath: string, text: string): boolean {
  const base = path.basename(filePath);
  return /^(commitlint\.config\.[cm]?[jt]s|\.commitlintrc|\.commitlintrc\.(json|ya?ml|js|cjs|mjs|ts|cts|mts))$/i.test(base)
    || (base === "package.json" && /"commitlint"\s*:|"scripts"\s*:[\s\S]*(commitlint|"commit")/i.test(text))
    || (filePath.startsWith(".husky/") && /commitlint/i.test(text));
}

function commitConventionConfigType(filePath: string, text: string): CommitConventionReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath).toLowerCase();
  if (base === "package.json") return "package-json";
  if (filePath.startsWith(".husky/")) return "husky";
  if (/commitlint|\.commitlintrc/.test(base) || /commitlint|parserPreset|type-enum/i.test(text)) return "commitlint";
  return "unknown";
}

function commitConventionParserPreset(text: string): CommitConventionReport["configFiles"][number]["parserPreset"] {
  if (/conventional-changelog-conventionalcommits|config-conventional|conventionalcommits/i.test(text)) return "conventional";
  if (/parserPreset\s*:/i.test(text)) return "custom";
  return "missing";
}

function commitConventionRuleSignals(sourceFiles: CommitConventionSourceFile[]): CommitConventionReport["ruleSignals"] {
  const specs: Array<{ signal: CommitConventionReport["ruleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "type-enum", pattern: /type-enum|@commitlint\/config-conventional|config-conventional|conventional commits?/i, evidence: "type-enum or conventional preset evidence was detected." },
    { signal: "scope-enum", pattern: /scope-enum|scope-case|scope-empty/i, evidence: "scope rule evidence was detected." },
    { signal: "subject-case", pattern: /subject-case|sentence-case|start-case|pascal-case|upper-case/i, evidence: "subject-case evidence was detected." },
    { signal: "subject-empty", pattern: /subject-empty/i, evidence: "subject-empty evidence was detected." },
    { signal: "subject-full-stop", pattern: /subject-full-stop/i, evidence: "subject-full-stop evidence was detected." },
    { signal: "header-max-length", pattern: /header-max-length|header-max/i, evidence: "header length evidence was detected." },
    { signal: "body-leading-blank", pattern: /body-leading-blank/i, evidence: "body leading blank evidence was detected." },
    { signal: "body-max-line-length", pattern: /body-max-line-length/i, evidence: "body max line length evidence was detected." },
    { signal: "footer-leading-blank", pattern: /footer-leading-blank/i, evidence: "footer leading blank evidence was detected." },
    { signal: "footer-max-line-length", pattern: /footer-max-line-length/i, evidence: "footer max line length evidence was detected." },
    { signal: "breaking-change", pattern: /BREAKING CHANGE|breaking-change|breakingBody|breaking/i, evidence: "breaking-change evidence was detected." }
  ];
  return commitConventionSignalFromSpecs(sourceFiles, specs, "rule", "signal");
}

function commitConventionHookSignals(sourceFiles: CommitConventionSourceFile[]): CommitConventionReport["hookSignals"] {
  const specs: Array<{ signal: CommitConventionReport["hookSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "commit-msg", pattern: /\.husky\/commit-msg|commit-msg|COMMIT_EDITMSG|--edit/i, evidence: "commit-msg hook evidence was detected." },
    { signal: "husky", pattern: /\.husky|husky|prepare.*husky/i, evidence: "Husky hook install evidence was detected." },
    { signal: "ci-range", pattern: /--from|--to|pull_request|base\.sha|head\.sha/i, evidence: "CI commit range evidence was detected." },
    { signal: "last-commit", pattern: /--last|last commit/i, evidence: "last commit command evidence was detected." },
    { signal: "edit-message", pattern: /--edit|COMMIT_EDITMSG|edit/i, evidence: "commit message file evidence was detected." },
    { signal: "prompt", pattern: /@commitlint\/prompt|prompt-cli|commitizen|cz-commitlint|npm run commit/i, evidence: "commit prompt evidence was detected." },
    { signal: "bypass", pattern: /--no-verify|HUSKY=0|bypass/i, evidence: "hook bypass policy evidence was detected." }
  ];
  return commitConventionSignalFromSpecs(sourceFiles, specs, "hook", "signal");
}

function commitConventionCommandSignals(sourceFiles: CommitConventionSourceFile[]): CommitConventionReport["commandSignals"] {
  const specs: Array<{ signal: CommitConventionReport["commandSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "from-to", pattern: /--from|--to/i, evidence: "from/to range command evidence was detected." },
    { signal: "last", pattern: /--last/i, evidence: "last command evidence was detected." },
    { signal: "edit", pattern: /--edit|COMMIT_EDITMSG/i, evidence: "edit command evidence was detected." },
    { signal: "verbose", pattern: /--verbose|verbose/i, evidence: "verbose command evidence was detected." },
    { signal: "strict", pattern: /--strict|strict/i, evidence: "strict command evidence was detected." },
    { signal: "format", pattern: /--format|@commitlint\/format|formatter/i, evidence: "formatter command evidence was detected." },
    { signal: "config", pattern: /--config|print-config|commitlint\.config|\.commitlintrc/i, evidence: "config command evidence was detected." },
    { signal: "help-url", pattern: /help-url|helpUrl/i, evidence: "help URL evidence was detected." }
  ];
  return commitConventionSignalFromSpecs(sourceFiles, specs, "command", "signal");
}

function commitConventionPackageSignals(sourceFiles: CommitConventionSourceFile[]): CommitConventionReport["packageSignals"] {
  const specs: Array<{ signal: CommitConventionReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "commitlint-cli", pattern: /@commitlint\/cli|commitlint\b/i, evidence: "@commitlint/cli evidence was detected." },
    { signal: "config-conventional", pattern: /@commitlint\/config-conventional|config-conventional|conventional-changelog-conventionalcommits/i, evidence: "conventional config evidence was detected." },
    { signal: "commitizen", pattern: /commitizen|cz-cli/i, evidence: "Commitizen evidence was detected." },
    { signal: "cz-commitlint", pattern: /cz-commitlint|@commitlint\/cz-commitlint/i, evidence: "cz-commitlint evidence was detected." },
    { signal: "husky", pattern: /"husky"\s*:|husky\b|\.husky/i, evidence: "Husky package evidence was detected." },
    { signal: "conventional-changelog", pattern: /conventional-changelog|semantic-release|changesets/i, evidence: "release/changelog integration evidence was detected." }
  ];
  return commitConventionSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function commitConventionSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CommitConventionSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/commit-conventions.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildChangelogReadinessReport(walk: WalkResult): Promise<ChangelogReadinessReport> {
  const sourceFiles = await changelogReadinessSourceFiles(walk);
  const configFiles = changelogReadinessConfigFiles(sourceFiles);
  const changesetFiles = changelogReadinessChangesetFiles(sourceFiles);
  const workflowSignals = changelogReadinessWorkflowSignals(sourceFiles);
  const commandSignals = changelogReadinessCommandSignals(sourceFiles);
  const packageSignals = changelogReadinessPackageSignals(sourceFiles);
  const policySignals = changelogReadinessPolicySignals(sourceFiles);

  const hasConfig = configFiles.some((item) => item.configType === "changeset-config" || item.configType === "package-json");
  const hasChangesets = changesetFiles.length > 0;
  const hasStatus = commandSignals.some((item) => item.signal === "status" && item.readiness === "ready")
    || workflowSignals.some((item) => item.signal === "status-check" && item.readiness === "ready");
  const hasAction = workflowSignals.some((item) => item.signal === "changesets-action" && item.readiness === "ready");
  const hasPublish = commandSignals.some((item) => item.signal === "publish" && item.readiness === "ready")
    || workflowSignals.some((item) => item.signal === "publish" && item.readiness === "ready");
  const hasChangelog = configFiles.some((item) => item.changelogMode !== "missing" && item.changelogMode !== "disabled");
  const hasBaseBranch = configFiles.some((item) => item.baseBranch);
  const hasFollowTags = workflowSignals.some((item) => item.signal === "follow-tags" && item.readiness === "ready");

  const riskQueue: ChangelogReadinessReport["riskQueue"] = [];
  if (!hasConfig && !hasChangesets && !hasStatus && !hasAction) {
    riskQueue.push({
      priority: "medium",
      action: "Add Changesets config, changeset files, or a status/action workflow before treating changelog readiness as present.",
      why: "Changesets readiness starts from explicit release intent files plus the workflow that turns them into versions and changelogs.",
      relatedHref: "html/changelog-readiness.html"
    });
  }
  if (hasChangesets && !hasConfig) {
    riskQueue.push({
      priority: "medium",
      action: "Run changeset init or add `.changeset/config.json` so changeset files have visible release policy.",
      why: "Without config, learners cannot see baseBranch, changelog mode, fixed/linked groups, access, and private package policy.",
      relatedHref: "html/changelog-readiness.html"
    });
  }
  if ((hasConfig || hasChangesets) && !hasStatus && !hasAction) {
    riskQueue.push({
      priority: "medium",
      action: "Add a Changesets bot/action or `changeset status --since=main` CI check for pull requests.",
      why: "Reviewers can miss absent changeset files; a status surface makes release-note intent visible before merge.",
      relatedHref: "html/changelog-readiness.html"
    });
  }
  if (hasPublish && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Do not publish from Changesets automation until config and package access policy are visible.",
      why: "`changeset publish` can create npm releases and git tags; static readiness should show the publishing boundary first.",
      relatedHref: "html/changelog-readiness.html"
    });
  }
  if (hasConfig && !hasChangelog) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm whether changelog generation is intentionally disabled or customize the changelog generator.",
      why: "The report is about release notes; disabled changelog output should be a deliberate product decision.",
      relatedHref: "html/changelog-readiness.html"
    });
  }
  if (hasConfig && !hasBaseBranch) {
    riskQueue.push({
      priority: "low",
      action: "Set or document the Changesets baseBranch used for status and changed-package detection.",
      why: "Wrong base branches make `status --since` and contributor prompts harder to trust.",
      relatedHref: "html/changelog-readiness.html"
    });
  }
  if (hasPublish && !hasFollowTags) {
    riskQueue.push({
      priority: "low",
      action: "Document `git push --follow-tags` or equivalent tag publishing after releases.",
      why: "Changesets publish/tag workflows create git tags that must be pushed if consumers rely on source tags.",
      relatedHref: "html/changelog-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Changesets commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not create changesets, version packages, publish to npm, create tags, or push release commits.",
    relatedHref: "html/changelog-readiness.html"
  });

  return {
    summary: `Changesets식 changelog readiness report: config file ${configFiles.length}개, changeset file ${changesetFiles.length}개, workflow signal ${workflowSignals.length}개, command signal ${commandSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Changesets config changeset files changelog version publish status pre snapshot fixed linked private packages",
    configFiles,
    changesetFiles,
    workflowSignals,
    commandSignals,
    packageSignals,
    policySignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx changeset", purpose: "Create a release-intent markdown file with package bump metadata." },
      { command: "npx changeset status --verbose", purpose: "Inspect pending changesets and planned package versions." },
      { command: "npx changeset status --since=main --output=changeset-status.json", purpose: "Write CI-readable status output for pull request checks." },
      { command: "npx changeset version", purpose: "Apply pending changesets to package versions and changelogs in a release PR." },
      { command: "npx changeset publish --tag latest", purpose: "Publish packages only after reviewing the release commit and npm access policy." },
      { command: "git push --follow-tags", purpose: "Publish git tags created by the release process." }
    ],
    learnerNextSteps: [
      "Start with `.changeset/config.json` to learn changelog mode, baseBranch, access, private package, fixed, and linked package policy.",
      "Then inspect `.changeset/*.md` files because those are the human-written release-note and semver bump intent.",
      "Check CI for changeset status, bot comments, or Changesets action version PRs before trusting release automation.",
      "RepoTutor never runs `changeset version`, `publish`, or tag commands; use this page as a static map before executing release tooling yourself."
    ]
  };
}

type ChangelogReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function changelogReadinessSourceFiles(walk: WalkResult): Promise<ChangelogReadinessSourceFile[]> {
  const files: ChangelogReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !changelogReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!changelogReadinessPathSignal(file.relPath) && !changelogReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function changelogReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return changelogReadinessPathSignal(filePath)
    || /^(package\.json|CHANGELOG\.md|RELEASES?\.md)$/i.test(base)
    || filePath.startsWith(".github/workflows/")
    || /\.(json|ya?ml|md|js|cjs|mjs|ts|sh)$/i.test(filePath);
}

function changelogReadinessPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return filePath.startsWith(".changeset/")
    || /changeset|CHANGELOG|release-notes|release-notes|versioning|publishing/i.test(filePath)
    || /^(CHANGELOG\.md|RELEASES?\.md)$/i.test(base);
}

function changelogReadinessContentSignal(text: string): boolean {
  return /@changesets\/cli|changeset (status|version|publish|pre|tag)|changesets\/action|changeset-bot|\.changeset|baseBranch|updateInternalDependencies|fixed|linked|privatePackages|changelog|snapshot|follow-tags/i.test(text);
}

function changelogReadinessConfigFiles(sourceFiles: ChangelogReadinessSourceFile[]): ChangelogReadinessReport["configFiles"] {
  return sourceFiles
    .filter((source) => changelogReadinessConfigPathSignal(source.filePath, source.text))
    .slice(0, 80)
    .map((source) => {
      const configType = changelogReadinessConfigType(source.filePath, source.text);
      const changelogMode = changelogReadinessChangelogMode(source.text);
      const baseBranch = firstMatch(source.text, /"baseBranch"\s*:\s*"([^"]+)"/) ?? firstMatch(source.text, /baseBranch:\s*["']?([^"'\n]+)/);
      const fixedCount = changelogReadinessArrayCount(source.text, "fixed");
      const linkedCount = changelogReadinessArrayCount(source.text, "linked");
      const ignoredCount = changelogReadinessArrayCount(source.text, "ignore");
      const privatePackagePolicy = changelogReadinessPrivatePolicy(source.text);
      const readiness = changelogMode !== "missing" || baseBranch || fixedCount > 0 || linkedCount > 0 || /@changesets\/cli|changesets\/action|changeset status/i.test(source.text) ? "ready" : "partial";
      return {
        filePath: source.filePath,
        configType,
        changelogMode,
        baseBranch,
        fixedCount,
        linkedCount,
        ignoredCount,
        privatePackagePolicy,
        readiness,
        evidence: `${source.filePath} contains ${configType} Changesets signal with changelog ${changelogMode}, baseBranch ${baseBranch ?? "missing"}, fixed ${fixedCount}, linked ${linkedCount}, ignored ${ignoredCount}, private policy ${privatePackagePolicy}.`,
        sourceHref: source.sourceHref
      };
    });
}

function changelogReadinessConfigPathSignal(filePath: string, text: string): boolean {
  const base = path.basename(filePath);
  return filePath === ".changeset/config.json"
    || (base === "package.json" && /@changesets\/cli|changeset (status|version|publish)|"changeset"\s*:/i.test(text))
    || (filePath.startsWith(".github/workflows/") && /changesets\/action|changeset (status|version|publish)|@changesets\/cli/i.test(text));
}

function changelogReadinessConfigType(filePath: string, text: string): ChangelogReadinessReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath).toLowerCase();
  if (filePath === ".changeset/config.json") return "changeset-config";
  if (base === "package.json") return "package-json";
  if (filePath.startsWith(".github/workflows/")) return "workflow";
  if (/\.changeset|@changesets\/cli|changesets\/action/i.test(text)) return "changeset-config";
  return "unknown";
}

function changelogReadinessChangelogMode(text: string): ChangelogReadinessReport["configFiles"][number]["changelogMode"] {
  if (/"changelog"\s*:\s*false|changelog:\s*false/i.test(text)) return "disabled";
  if (/@changesets\/changelog-github/i.test(text)) return "github";
  if (/"changelog"\s*:\s*"@changesets\/cli\/changelog"|@changesets\/cli\/changelog/i.test(text)) return "default";
  if (/"changelog"\s*:\s*(\[|"[^"]+")|changelog:\s*(\[|['"][^'"]+['"])/i.test(text)) return "custom";
  return "missing";
}

function changelogReadinessPrivatePolicy(text: string): ChangelogReadinessReport["configFiles"][number]["privatePackagePolicy"] {
  if (/"privatePackages"\s*:\s*false|privatePackages:\s*false/i.test(text)) return "disabled";
  if (/"privatePackages"[\s\S]*"tag"\s*:\s*true|privatePackages[\s\S]*tag:\s*true/i.test(text)) return "tagged";
  if (/"privatePackages"[\s\S]*"version"\s*:\s*true|privatePackages[\s\S]*version:\s*true/i.test(text)) return "version-only";
  return "missing";
}

function changelogReadinessArrayCount(text: string, field: string): number {
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const value = json[field];
    return Array.isArray(value) ? value.length : 0;
  } catch {
    return countMatches(text, new RegExp(`${field}\\s*:`, "gi"));
  }
}

function changelogReadinessChangesetFiles(sourceFiles: ChangelogReadinessSourceFile[]): ChangelogReadinessReport["changesetFiles"] {
  return sourceFiles
    .filter((source) => /^\.changeset\/(?!config\.json|README\.md)[^/]+\.md$/i.test(source.filePath))
    .slice(0, 120)
    .map((source) => {
      const parsed = changelogReadinessChangesetFrontmatter(source.text);
      const bumpTypes = changelogReadinessBumpTypes(parsed.frontmatter, parsed.summary);
      const packageCount = countMatches(parsed.frontmatter, /["']?[^"'\n:]+["']?\s*:\s*(major|minor|patch)\b/g);
      const summaryLines = parsed.summary.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;
      const empty = packageCount === 0 && summaryLines === 0;
      const readiness = empty || (packageCount > 0 && summaryLines > 0) ? "ready" : packageCount > 0 || summaryLines > 0 ? "partial" : "missing";
      return {
        filePath: source.filePath,
        packageCount,
        bumpTypes,
        summaryLines,
        empty,
        readiness,
        evidence: `${source.filePath} declares ${packageCount} package bump(s), ${bumpTypes.join(", ")} bump type(s), and ${summaryLines} summary line(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function changelogReadinessChangesetFrontmatter(text: string): { frontmatter: string; summary: string } {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return { frontmatter: match?.[1] ?? "", summary: match?.[2] ?? text };
}

function changelogReadinessBumpTypes(frontmatter: string, summary: string): Array<ChangelogReadinessReport["changesetFiles"][number]["bumpTypes"][number]> {
  const bumps = [...frontmatter.matchAll(/:\s*(major|minor|patch)\b/g)].map((match) => match[1] as "major" | "minor" | "patch");
  if (bumps.length > 0) return Array.from(new Set(bumps));
  if (!frontmatter.trim() && !summary.trim()) return ["none"];
  return ["unknown"];
}

function changelogReadinessWorkflowSignals(sourceFiles: ChangelogReadinessSourceFile[]): ChangelogReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: ChangelogReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "status-check", pattern: /changeset status|@changesets\/cli status|status --since/i, evidence: "changeset status check evidence was detected." },
    { signal: "changeset-bot", pattern: /changeset-bot|github\.com\/apps\/changeset-bot/i, evidence: "Changeset bot evidence was detected." },
    { signal: "changesets-action", pattern: /changesets\/action|@changesets\/action/i, evidence: "Changesets GitHub action evidence was detected." },
    { signal: "version-pr", pattern: /version.?pr|changeset version|versioning pull request/i, evidence: "version PR or version command evidence was detected." },
    { signal: "publish", pattern: /changeset publish|publish:\s|NPM_TOKEN|npm publish/i, evidence: "publish workflow evidence was detected." },
    { signal: "follow-tags", pattern: /push --follow-tags|follow-tags|git push.*tags/i, evidence: "tag push evidence was detected." },
    { signal: "manual-release", pattern: /release coordinator|manual release|stop any merging|release PR/i, evidence: "manual release coordination evidence was detected." }
  ];
  return changelogReadinessSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function changelogReadinessCommandSignals(sourceFiles: ChangelogReadinessSourceFile[]): ChangelogReadinessReport["commandSignals"] {
  const specs: Array<{ signal: ChangelogReadinessReport["commandSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "add", pattern: /changeset add|npx changeset\b|changeset --empty|changeset --open|changeset -m/i, evidence: "changeset add evidence was detected." },
    { signal: "status", pattern: /changeset status|status --verbose/i, evidence: "changeset status evidence was detected." },
    { signal: "version", pattern: /changeset version|version packages|update package versions/i, evidence: "changeset version evidence was detected." },
    { signal: "publish", pattern: /changeset publish|publish --tag|publish --otp/i, evidence: "changeset publish evidence was detected." },
    { signal: "pre", pattern: /changeset pre|pre enter|pre exit|prerelease/i, evidence: "pre-release command evidence was detected." },
    { signal: "tag", pattern: /changeset tag|push --follow-tags|git tags/i, evidence: "tag command evidence was detected." },
    { signal: "snapshot", pattern: /--snapshot|snapshot release|snapshot/i, evidence: "snapshot release evidence was detected." },
    { signal: "since", pattern: /--since|baseBranch/i, evidence: "since/baseBranch command evidence was detected." },
    { signal: "output", pattern: /--output|changeset-status\.json/i, evidence: "status output evidence was detected." },
    { signal: "otp", pattern: /--otp|one-time password|NPM_CONFIG_OTP/i, evidence: "npm OTP evidence was detected." }
  ];
  return changelogReadinessSignalFromSpecs(sourceFiles, specs, "command", "signal");
}

function changelogReadinessPackageSignals(sourceFiles: ChangelogReadinessSourceFile[]): ChangelogReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ChangelogReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "changesets-cli", pattern: /@changesets\/cli|changeset\b/i, evidence: "@changesets/cli evidence was detected." },
    { signal: "changesets-action", pattern: /changesets\/action|@changesets\/action/i, evidence: "Changesets action evidence was detected." },
    { signal: "changelog-github", pattern: /@changesets\/changelog-github|changelog-github/i, evidence: "GitHub changelog generator evidence was detected." },
    { signal: "workspace", pattern: /workspaces|pnpm-workspace|workspace:\*|workspace:/i, evidence: "workspace package evidence was detected." },
    { signal: "package-manager", pattern: /pnpm|yarn|npm|bun|packageManager/i, evidence: "package manager evidence was detected." },
    { signal: "npm-publish", pattern: /npm publish|pnpm publish|NPM_TOKEN|registry\.npmjs/i, evidence: "npm publish evidence was detected." }
  ];
  return changelogReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function changelogReadinessPolicySignals(sourceFiles: ChangelogReadinessSourceFile[]): ChangelogReadinessReport["policySignals"] {
  const specs: Array<{ signal: ChangelogReadinessReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "fixed", pattern: /"fixed"\s*:|fixed packages|fixedPackages/i, evidence: "fixed package policy evidence was detected." },
    { signal: "linked", pattern: /"linked"\s*:|linked packages|linkedPackages/i, evidence: "linked package policy evidence was detected." },
    { signal: "base-branch", pattern: /baseBranch|--since/i, evidence: "base branch policy evidence was detected." },
    { signal: "internal-deps", pattern: /updateInternalDependencies|bumpVersionsWithWorkspaceProtocolOnly|internal dependencies/i, evidence: "internal dependency update policy evidence was detected." },
    { signal: "access", pattern: /"access"\s*:|access:\s*(public|restricted)|restricted|public registry/i, evidence: "npm access policy evidence was detected." },
    { signal: "ignore", pattern: /"ignore"\s*:|--ignore|ignored packages/i, evidence: "ignore package policy evidence was detected." },
    { signal: "private-packages", pattern: /privatePackages|private packages|private:\s*true/i, evidence: "private package policy evidence was detected." },
    { signal: "pre-mode", pattern: /changeset pre|pre\.json|pre mode|prerelease/i, evidence: "pre-release mode evidence was detected." },
    { signal: "snapshot", pattern: /snapshot|--snapshot|prereleaseTemplate/i, evidence: "snapshot policy evidence was detected." }
  ];
  return changelogReadinessSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function changelogReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ChangelogReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/changelog-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
