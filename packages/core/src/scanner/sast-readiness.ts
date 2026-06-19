import path from "node:path";
import type { SastReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildSastReadinessReport(walk: WalkResult): Promise<SastReadinessReport> {
  const sourceFiles = await sastReadinessSourceFiles(walk);
  const sastSetups = sastReadinessSetups(sourceFiles);
  const toolSignals = sastReadinessToolSignals(sourceFiles);
  const ruleSignals = sastReadinessRuleSignals(sourceFiles);
  const querySignals = sastReadinessQuerySignals(sourceFiles);
  const languageSignals = sastReadinessLanguageSignals(sourceFiles);
  const scopeSignals = sastReadinessScopeSignals(sourceFiles);
  const baselineSignals = sastReadinessBaselineSignals(sourceFiles);
  const outputSignals = sastReadinessOutputSignals(sourceFiles);
  const ciSignals = sastReadinessCiSignals(sourceFiles);
  const packageSignals = sastReadinessPackageSignals(sourceFiles);

  const hasTool = toolSignals.some((item) => item.readiness === "ready") || sastSetups.length > 0;
  const hasSemgrep = toolSignals.some((item) => item.signal === "semgrep" && item.readiness === "ready") || sastSetups.some((item) => item.tool === "semgrep");
  const hasCodeql = toolSignals.some((item) => item.signal === "codeql" && item.readiness === "ready") || sastSetups.some((item) => item.tool === "codeql");
  const hasSonar = toolSignals.some((item) => item.signal === "sonarqube" && item.readiness === "ready") || sastSetups.some((item) => item.tool === "sonarqube");
  const hasRules = ruleSignals.some((item) => item.readiness === "ready") || sastSetups.some((item) => item.ruleCount > 0);
  const hasQueries = querySignals.some((item) => item.readiness === "ready") || sastSetups.some((item) => item.queryCount > 0);
  const hasScope = scopeSignals.some((item) => item.readiness === "ready") || sastSetups.some((item) => item.scopeCount > 0);
  const hasBaseline = baselineSignals.some((item) => item.readiness === "ready") || sastSetups.some((item) => item.baselineCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || sastSetups.some((item) => item.outputCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || sastSetups.some((item) => item.ciCount > 0);

  const riskQueue: SastReadinessReport["riskQueue"] = [];
  if (!hasTool) riskQueue.push({ priority: "high", action: "Identify the SAST toolchain before claiming static-analysis security readiness.", why: "SAST readiness starts with visible Semgrep, CodeQL, SonarQube, Snyk Code, or equivalent tool evidence.", relatedHref: "html/sast-readiness.html" });
  if (hasSemgrep && !hasRules) riskQueue.push({ priority: "medium", action: "Pair Semgrep usage with rule, pattern, severity, and message evidence.", why: "Semgrep commands without rules do not show which code patterns are being enforced.", relatedHref: "html/sast-readiness.html" });
  if (hasCodeql && !hasQueries) riskQueue.push({ priority: "medium", action: "Pair CodeQL usage with query suite, query pack, or custom query evidence.", why: "CodeQL setup is clearer when learners can see which default or custom queries are enabled.", relatedHref: "html/sast-readiness.html" });
  if (hasSonar && !hasScope) riskQueue.push({ priority: "medium", action: "Document Sonar source and exclusion scope.", why: "SonarQube quality gates are hard to interpret without knowing which source tree and generated files are in scope.", relatedHref: "html/sast-readiness.html" });
  if (hasTool && !hasScope) riskQueue.push({ priority: "medium", action: "Add explicit include, exclude, generated-code, or test-scope boundaries.", why: "SAST findings are only reproducible when scan scope is visible.", relatedHref: "html/sast-readiness.html" });
  if (hasTool && !hasOutput) riskQueue.push({ priority: "medium", action: "Retain SAST output as SARIF, JSON, JUnit, HTML, code scanning, or artifact uploads.", why: "Static analysis value is limited if findings are not reviewable after CI completes.", relatedHref: "html/sast-readiness.html" });
  if (hasTool && !hasCi) riskQueue.push({ priority: "low", action: "Wire SAST checks into CI or document the manual review path.", why: "A local-only SAST command can drift from pull request enforcement.", relatedHref: "html/sast-readiness.html" });
  if (hasTool && !hasBaseline) riskQueue.push({ priority: "low", action: "Document baseline, PR-diff, severity threshold, fail threshold, or quality gate policy.", why: "Teams usually need a way to separate new findings from known debt.", relatedHref: "html/sast-readiness.html" });
  riskQueue.push({ priority: "low", action: "Run Semgrep, CodeQL, Sonar scanner, Snyk Code, and upload-SARIF commands only in a trusted sandbox after reviewing this static map.", why: "RepoTutor records SAST readiness only; it does not execute analyzers, compile code, upload findings, contact SaaS scanners, or change code scanning settings.", relatedHref: "html/sast-readiness.html" });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `SAST readiness report: setup ${sastSetups.length}개, tool signal ${toolSignals.length}개, rule signal ${ruleSignals.length}개, output signal ${outputSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "SAST readiness Semgrep rules pattern pattern-either metavariable CodeQL init analyze queries security-extended security-and-quality qlpack SonarQube sonar-project.properties sonar.sources sonar.exclusions quality gate Snyk Code SARIF upload-sarif code scanning",
    sastSetups,
    toolSignals,
    ruleSignals,
    querySignals,
    languageSignals,
    scopeSignals,
    baselineSignals,
    outputSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"semgrep ci|semgrep scan|p/ci|rules:|pattern-either|metavariable|mode: taint\" .", purpose: "Inventory Semgrep CI commands, configs, rule patterns, taint mode, and metadata." },
      { command: "rg \"github/codeql-action/(init|analyze)|codeql.yml|queries:|security-extended|security-and-quality|qlpack.yml|\\\\.ql\" .github .", purpose: "Trace CodeQL workflow steps, query suites, query packs, and custom query files." },
      { command: "rg \"sonar-project.properties|sonar.sources|sonar.exclusions|sonar-scanner|SonarSource/sonarqube-scan-action|sonar.qualitygate.wait\" .", purpose: "Review SonarQube project scope, scanner entrypoints, and quality gate policy." },
      { command: "rg \"snyk code test|SARIF|upload-sarif|code-scanning|upload-artifact|sast-readiness-report\" .github .", purpose: "Check retained SAST output and GitHub code scanning publication evidence." },
      { command: "rg \"nosemgrep|\\\\.semgrepignore|paths-ignore|baseline|severity|quality gate|fail-threshold\" .", purpose: "Find suppressions, scan scope, baseline policy, and severity/fail thresholds." }
    ],
    learnerNextSteps: [
      "먼저 Semgrep, CodeQL, SonarQube, Snyk Code 중 어떤 SAST toolchain이 실제 gate인지 확인하세요.",
      "Semgrep은 rule/pattern/severity/message, CodeQL은 query suite/query pack/custom query, Sonar는 source/exclusion/quality gate를 묶어 보세요.",
      "scan scope, generated-code 제외, test scope, monorepo 경계를 먼저 확인한 뒤 finding 수를 해석하세요.",
      "SARIF, JSON, JUnit, HTML, upload-artifact, GitHub code scanning처럼 결과가 어디에 남는지 확인하세요.",
      "baseline, PR-diff, severity threshold, quality gate 정책이 새 취약 패턴과 기존 부채를 어떻게 나누는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 Semgrep, CodeQL, Sonar scanner, Snyk Code 실행과 SARIF 업로드는 안전한 sandbox에서 별도로 확인하세요."
    ]
  };
}

type SastReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function sastReadinessSourceFiles(walk: WalkResult): Promise<SastReadinessSourceFile[]> {
  const files: SastReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !sastReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!sastReadinessPathSignal(file.relPath) && !sastReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function sastReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return sastReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|go\.sum|pyproject\.toml|requirements.*\.txt|sonar-project\.properties|\.semgrep\.ya?ml|semgrep\.ya?ml|codeql\.ya?ml|qlpack\.ya?ml|Dockerfile)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(json|ya?ml|toml|md|mdx|txt|properties|xml|sh|bash|py|go|java|kt|kts|js|jsx|ts|tsx|mjs|cjs|rb|swift|cs|cpp|c|h|hpp|ql|qls)$/i.test(filePath);
}

function sastReadinessPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(\.semgrep|semgrep|codeql|sonar|snyk|sast|static[-_ ]?analysis|code[-_ ]?scanning|security)(\/|\.|-|_|$)/i.test(filePath)
    || /^(sonar-project\.properties|\.semgrep\.ya?ml|semgrep\.ya?ml|codeql\.ya?ml|codeql-config\.ya?ml|qlpack\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath);
}

function sastReadinessContentSignal(text: string): boolean {
  return /(semgrep\s+(ci|scan)|\.semgrep|p\/ci|rules:\s*\n|pattern(-either|-regex)?:|metavariable|mode:\s*taint|github\/codeql-action\/(init|analyze|upload-sarif)|\bcodeql\b|queries:\s*\n|security-extended|security-and-quality|qlpack|sonar\.projectKey|sonar\.sources|sonar\.exclusions|sonar-scanner|SonarSource\/sonarqube-scan-action|sonar\.qualitygate\.wait|snyk code test|SARIF|code scanning|code-scanning|upload-sarif)/i.test(text);
}

function sastReadinessSetups(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["sastSetups"] {
  const rows: SastReadinessReport["sastSetups"] = [];
  for (const source of sourceFiles) {
    const languageCount = countMatches(source.text, /javascript|typescript|js\/ts|python|\bgo\b|golang|java|kotlin|cpp|c\+\+|csharp|c#|ruby|swift|languages?:|language:/gi);
    const ruleCount = countMatches(source.text, /rules:\s*\n|id:\s|pattern:|pattern-either|pattern-regex|metavariable|severity:|message:|mode:\s*taint|taint-mode|join-mode/gi);
    const queryCount = countMatches(source.text, /\.ql\b|\.qls\b|queries:\s*\n|query[-_ ]?suite|query[-_ ]?pack|security-extended|security-and-quality|qlpack|packs:\s*\n|custom[-_ ]?query/gi);
    const configCount = countMatches(source.text, /\.semgrep|semgrep\.ya?ml|semgrep\s+(ci|scan)|github\/codeql-action\/init|github\/codeql-action\/analyze|codeql\.ya?ml|sonar-project\.properties|sonar\.projectKey|sonar\.sources|sonar-scanner|SonarSource\/sonarqube-scan-action|snyk code test/gi) + (sastReadinessPathSignal(source.filePath) ? 1 : 0);
    const scopeCount = countMatches(source.text, /paths?:\s*\n|paths-ignore|sonar\.sources|sonar\.tests|sonar\.exclusions|sonar\.coverage\.exclusions|exclude|include|generated|vendor|test[-_ ]?scope|monorepo|working-directory/gi);
    const baselineCount = countMatches(source.text, /baseline|baseline-ref|merge-base|pull_request|only_changed|diff[-_ ]?aware|new code|new-code|severity[-_ ]?threshold|fail[-_ ]?threshold|fail-on|qualitygate|quality gate|sonar\.qualitygate\.wait/gi);
    const suppressionCount = countMatches(source.text, /nosemgrep|\.semgrepignore|suppress|suppression|sonar\.issue\.ignore|snyk ignore|#\s*lgtm|codeql\[[^\]]+\]|noqa|gosec:disable/gi);
    const outputCount = countMatches(source.text, /SARIF|sarif|--json|json-output|junit|html|upload-sarif|code scanning|code-scanning|upload-artifact|artifact|sast-readiness-report\.json|semgrep-results|codeql-results/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\/|pull_request|push:|workflow|semgrep ci|github\/codeql-action|sonarqube-scan-action|snyk\/actions|upload-sarif/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = languageCount + ruleCount + queryCount + configCount + scopeCount + baselineCount + suppressionCount + outputCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: sastReadinessTool(source),
      languageCount,
      ruleCount,
      queryCount,
      configCount,
      scopeCount,
      baselineCount,
      suppressionCount,
      outputCount,
      ciCount,
      readiness: configCount > 0 && (ruleCount > 0 || queryCount > 0 || /sonar/i.test(source.text)) && scopeCount > 0 && (outputCount > 0 || ciCount > 0) ? "ready" : "partial",
      evidence: `${source.filePath} contains languages ${languageCount}, rules ${ruleCount}, queries ${queryCount}, config ${configCount}, scope ${scopeCount}, baseline ${baselineCount}, suppressions ${suppressionCount}, output ${outputCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.configCount + b.ruleCount + b.queryCount + b.scopeCount + b.outputCount + b.ciCount;
    const aScore = a.configCount + a.ruleCount + a.queryCount + a.scopeCount + a.outputCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function sastReadinessTool(source: SastReadinessSourceFile): SastReadinessReport["sastSetups"][number]["tool"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (/^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|pyproject\.toml|requirements.*\.txt)$/i.test(path.basename(source.filePath))) return "package-script";
  if (/readme|docs?/i.test(source.filePath)) return "readme";
  if (/semgrep|p\/ci|pattern-either|nosemgrep|\.semgrep/i.test(haystack)) return "semgrep";
  if (/github\/codeql-action|codeql|security-extended|security-and-quality|qlpack|\.ql\b/i.test(haystack)) return "codeql";
  if (/sonar-project\.properties|sonar\.projectKey|sonar-scanner|sonarqube|SonarSource\/sonarqube-scan-action/i.test(haystack)) return "sonarqube";
  if (/snyk code test|snyk\/actions|snyk-to-html/i.test(haystack)) return "snyk-code";
  return "unknown";
}

function sastReadinessToolSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["toolSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "semgrep", pattern: /semgrep\s+(ci|scan)|\.semgrep|p\/ci|nosemgrep|pattern-either/i, evidence: "Semgrep evidence was detected." },
    { signal: "codeql", pattern: /github\/codeql-action\/(init|analyze)|\bcodeql\b|security-extended|security-and-quality|qlpack|\.ql\b/i, evidence: "CodeQL evidence was detected." },
    { signal: "sonarqube", pattern: /sonar-project\.properties|sonar\.projectKey|sonar\.sources|sonar-scanner|SonarSource\/sonarqube-scan-action|sonarqube/i, evidence: "SonarQube/Sonar scanner evidence was detected." },
    { signal: "snyk-code", pattern: /snyk code test|snyk\/actions|snyk-to-html/i, evidence: "Snyk Code evidence was detected." },
    { signal: "eslint-security", pattern: /eslint-plugin-security|plugin:security|security\/detect/i, evidence: "ESLint security rule evidence was detected." },
    { signal: "bandit", pattern: /\bbandit\b|bandit\.ya?ml/i, evidence: "Bandit Python SAST evidence was detected." },
    { signal: "gosec", pattern: /\bgosec\b|securego\/gosec|#nosec/i, evidence: "gosec evidence was detected." }
  ], "tool", "signal");
}

function sastReadinessRuleSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["ruleSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "semgrep-rule", pattern: /rules:\s*\n|id:\s+[\w.-]+[\s\S]{0,400}pattern/i, evidence: "Semgrep rule evidence was detected." },
    { signal: "pattern", pattern: /pattern:\s/i, evidence: "Semgrep pattern evidence was detected." },
    { signal: "pattern-either", pattern: /pattern-either:/i, evidence: "Semgrep pattern-either evidence was detected." },
    { signal: "pattern-regex", pattern: /pattern-regex:/i, evidence: "Semgrep pattern-regex evidence was detected." },
    { signal: "metavariable", pattern: /metavariable|metavariable-pattern|metavariable-regex/i, evidence: "Semgrep metavariable evidence was detected." },
    { signal: "severity", pattern: /severity:\s*(INFO|WARNING|ERROR|LOW|MEDIUM|HIGH|CRITICAL)/i, evidence: "rule severity evidence was detected." },
    { signal: "message", pattern: /message:\s/i, evidence: "rule message evidence was detected." },
    { signal: "taint-mode", pattern: /mode:\s*taint|taint[-_ ]?mode|pattern-sources|pattern-sinks/i, evidence: "taint-mode evidence was detected." }
  ], "rule", "signal");
}

function sastReadinessQuerySignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["querySignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "codeql-query", pattern: /\.ql\b|from\s+\w+\s+import|select\s+.*from/i, evidence: "CodeQL query evidence was detected." },
    { signal: "query-suite", pattern: /\.qls\b|queries:\s*\n|query[-_ ]?suite/i, evidence: "query suite evidence was detected." },
    { signal: "query-pack", pattern: /query[-_ ]?pack|packs:\s*\n|codeql pack/i, evidence: "query pack evidence was detected." },
    { signal: "security-extended", pattern: /security-extended/i, evidence: "security-extended query suite evidence was detected." },
    { signal: "security-and-quality", pattern: /security-and-quality/i, evidence: "security-and-quality query suite evidence was detected." },
    { signal: "qlpack", pattern: /qlpack\.ya?ml|dependencies:\s*[\s\S]{0,300}codeql/i, evidence: "qlpack evidence was detected." },
    { signal: "custom-query", pattern: /custom[-_ ]?query|queries\/.*\.ql|\.github\/codeql/i, evidence: "custom query evidence was detected." }
  ], "query", "signal");
}

function sastReadinessLanguageSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["languageSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "javascript-typescript", pattern: /javascript|typescript|js\/ts|\bjs\b|\bts\b/i, evidence: "JavaScript/TypeScript SAST language evidence was detected." },
    { signal: "python", pattern: /python|\.py\b/i, evidence: "Python SAST language evidence was detected." },
    { signal: "go", pattern: /\bgo\b|golang|\.go\b/i, evidence: "Go SAST language evidence was detected." },
    { signal: "java-kotlin", pattern: /java|kotlin|\.kt\b|\.kts\b/i, evidence: "Java/Kotlin SAST language evidence was detected." },
    { signal: "c-cpp", pattern: /c\/cpp|cpp|c\+\+|\.c\b|\.cpp\b|\.hpp\b/i, evidence: "C/C++ SAST language evidence was detected." },
    { signal: "csharp", pattern: /csharp|c#|\.cs\b/i, evidence: "C# SAST language evidence was detected." },
    { signal: "ruby", pattern: /ruby|\.rb\b/i, evidence: "Ruby SAST language evidence was detected." },
    { signal: "swift", pattern: /swift|\.swift\b/i, evidence: "Swift SAST language evidence was detected." },
    { signal: "multi-language", pattern: /languages?:\s*\[|matrix:\s*[\s\S]{0,500}language|autobuild/i, evidence: "multi-language SAST evidence was detected." }
  ], "language", "signal");
}

function sastReadinessScopeSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["scopeSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "paths", pattern: /paths?:\s*\n|sonar\.sources|include:\s*\n|working-directory/i, evidence: "included path scope evidence was detected." },
    { signal: "paths-ignore", pattern: /paths-ignore|sonar\.exclusions|exclude:\s*\n|exclude_paths|ignored_paths/i, evidence: "ignored path scope evidence was detected." },
    { signal: "exclusions", pattern: /sonar\.coverage\.exclusions|exclude|ignore|\.semgrepignore|snyk ignore/i, evidence: "exclusion evidence was detected." },
    { signal: "generated-code", pattern: /generated|vendor|third_party|node_modules|dist\/|build\//i, evidence: "generated or vendored code scope evidence was detected." },
    { signal: "test-scope", pattern: /sonar\.tests|test[-_ ]?scope|tests?\/|__tests__|testPaths/i, evidence: "test scope evidence was detected." },
    { signal: "monorepo", pattern: /monorepo|workspace|packages\/|matrix:\s*[\s\S]{0,500}project|projectBaseDir/i, evidence: "monorepo SAST scope evidence was detected." }
  ], "scope", "signal");
}

function sastReadinessBaselineSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["baselineSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "baseline-ref", pattern: /baseline[-_ ]?ref|baseline|merge-base|default_branch/i, evidence: "baseline reference evidence was detected." },
    { signal: "diff-aware", pattern: /only_changed|changed files|diff[-_ ]?aware|new code|new-code|pull_request/i, evidence: "diff-aware scan evidence was detected." },
    { signal: "pr-scan", pattern: /pull_request|pull_request_target|merge_group/i, evidence: "pull request SAST gate evidence was detected." },
    { signal: "fail-threshold", pattern: /fail[-_ ]?threshold|fail-on|fail_ci_if_error|blocker|break_build/i, evidence: "fail threshold evidence was detected." },
    { signal: "severity-threshold", pattern: /severity[-_ ]?threshold|minimum_severity|--severity|severity:\s*(HIGH|CRITICAL)/i, evidence: "severity threshold evidence was detected." },
    { signal: "quality-gate", pattern: /qualitygate|quality gate|sonar\.qualitygate\.wait|Quality Gate/i, evidence: "quality gate evidence was detected." }
  ], "baseline", "signal");
}

function sastReadinessOutputSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["outputSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "sarif", pattern: /SARIF|sarif|--sarif/i, evidence: "SARIF output evidence was detected." },
    { signal: "json", pattern: /--json|json-output|\.json|format:\s*json/i, evidence: "JSON output evidence was detected." },
    { signal: "junit", pattern: /junit|JUnit|test-results/i, evidence: "JUnit output evidence was detected." },
    { signal: "html", pattern: /html|snyk-to-html|sonar-report|semgrep-report\.html/i, evidence: "HTML report output evidence was detected." },
    { signal: "code-scanning", pattern: /code scanning|code-scanning|security-events|github code scanning/i, evidence: "GitHub code scanning evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact|sast-readiness-report\.json|semgrep-results|codeql-results|sonar-report/i, evidence: "artifact upload evidence was detected." }
  ], "output", "signal");
}

function sastReadinessCiSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["ciSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "semgrep-ci", pattern: /semgrep ci|semgrep\/semgrep-action|returntocorp\/semgrep-action/i, evidence: "Semgrep CI evidence was detected." },
    { signal: "codeql-init", pattern: /github\/codeql-action\/init/i, evidence: "CodeQL init evidence was detected." },
    { signal: "codeql-analyze", pattern: /github\/codeql-action\/analyze/i, evidence: "CodeQL analyze evidence was detected." },
    { signal: "sonar-scan-action", pattern: /SonarSource\/sonarqube-scan-action|sonarsource\/sonarcloud-github-action|sonar-scanner/i, evidence: "Sonar scan action evidence was detected." },
    { signal: "snyk-code", pattern: /snyk code test|snyk\/actions/i, evidence: "Snyk Code CI evidence was detected." },
    { signal: "upload-sarif", pattern: /github\/codeql-action\/upload-sarif|upload-sarif|sarif_file/i, evidence: "upload-SARIF evidence was detected." }
  ], "CI", "signal");
}

function sastReadinessPackageSignals(sourceFiles: SastReadinessSourceFile[]): SastReadinessReport["packageSignals"] {
  return sastReadinessSignalFromSpecs(sourceFiles, [
    { signal: "semgrep", pattern: /"semgrep"|semgrep\/semgrep|semgrep\s+(ci|scan)|p\/ci/i, evidence: "Semgrep package/tool evidence was detected." },
    { signal: "codeql-action", pattern: /github\/codeql-action\/(init|analyze|upload-sarif)/i, evidence: "CodeQL Action evidence was detected." },
    { signal: "codeql-cli", pattern: /\bcodeql\b|codeql-cli|github\/codeql/i, evidence: "CodeQL CLI/package evidence was detected." },
    { signal: "sonar-scanner", pattern: /sonar-scanner|sonarsource\/sonar-scanner-cli|sonar-scanner-cli/i, evidence: "Sonar scanner evidence was detected." },
    { signal: "sonarqube-scan-action", pattern: /SonarSource\/sonarqube-scan-action|sonarqube-scan-action|sonarcloud-github-action/i, evidence: "SonarQube scan action evidence was detected." },
    { signal: "snyk", pattern: /snyk\/actions|snyk code test|snyk-to-html/i, evidence: "Snyk package/tool evidence was detected." }
  ], "package", "signal");
}

function sastReadinessSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: SastReadinessSourceFile[],
  specs: T,
  label: string,
  labelKey: "signal"
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/sast-readiness.html"
    } as { signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
