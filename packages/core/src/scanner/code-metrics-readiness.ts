import path from "node:path";
import { LANGUAGE_BY_EXTENSION, type CodeMetricsReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

interface CodeMetricSourceFile {
  filePath: string;
  text: string;
  sourceHref: string;
}

export async function buildCodeMetricsReadinessReport(walk: WalkResult): Promise<CodeMetricsReadinessReport> {
  const sourceFiles = await codeMetricsSourceFiles(walk);
  const metricRows = codeMetricsRows(sourceFiles);
  const totals = codeMetricsTotals(metricRows);
  const languageMetrics = codeMetricsByLanguage(metricRows);
  const hotspots = metricRows
    .filter((row) => row.codeLines > 0)
    .sort((a, b) => b.hotspotScore - a.hotspotScore || b.branchCount - a.branchCount || a.filePath.localeCompare(b.filePath))
    .slice(0, 15)
    .map((row, index) => ({
      filePath: row.filePath,
      language: row.language,
      lines: row.lines,
      codeLines: row.codeLines,
      branchCount: row.branchCount,
      functionCount: row.functionCount,
      complexityDensity: row.complexityDensity,
      hotspotScore: row.hotspotScore,
      readingPriority: index < 5 ? "high" as const : index < 10 ? "medium" as const : "low" as const,
      evidence: `${row.filePath} has ${row.codeLines} code lines, ${row.branchCount} branch tokens, ${row.functionCount} function-like tokens, density ${row.complexityDensity}.`,
      sourceHref: row.sourceHref
    }));
  const toolSignals = codeMetricsToolSignals(sourceFiles);
  const metricSignals = codeMetricsMetricSignals(totals, hotspots, sourceFiles);
  const workflowSignals = codeMetricsWorkflowSignals(sourceFiles);
  const codeMapMetricBindings = codeMetricsCodeMapMetricBindings(totals, hotspots, workflowSignals);
  const codeMapSignals = codeMetricsCodeMapSignals(sourceFiles);
  const hasThreshold = workflowSignals.some((item) => item.signal === "threshold" && item.readiness === "ready");
  const hasCi = workflowSignals.some((item) => item.signal === "ci-complexity" && item.readiness === "ready");
  const hasDedicatedTool = toolSignals.some((item) => ["scc", "lizard", "tokei", "cloc", "radon", "eslint-complexity", "complexity-report"].includes(item.signal) && item.readiness === "ready");
  const hasCodeMapOutput = codeMapSignals.some((item) => item.signal === "cc-json" && item.readiness === "ready");
  const riskQueue: CodeMetricsReadinessReport["riskQueue"] = [];
  if (hotspots.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Add enough source-backed files for code metrics before using hotspot ordering.",
      why: "A learner cannot prioritize complex files when the static snapshot has no readable code candidates.",
      relatedHref: "html/code-metrics-readiness.html"
    });
  }
  if (!hasDedicatedTool) {
    riskQueue.push({
      priority: "medium",
      action: "Decide whether a dedicated code metrics tool such as scc, lizard, tokei, cloc, or radon belongs in the trusted workflow.",
      why: "RepoTutor's built-in estimator is useful for reading order, but it is not a substitute for team-approved metrics thresholds.",
      relatedHref: "html/code-metrics-readiness.html"
    });
  }
  if (!hasThreshold) {
    riskQueue.push({
      priority: "low",
      action: "Document a review threshold for very large or branch-heavy files.",
      why: "Without a threshold, metric pages can become passive dashboards instead of an explicit review contract.",
      relatedHref: hotspots[0]?.sourceHref ?? "html/code-metrics-readiness.html"
    });
  }
  if (!hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Keep CI metric enforcement opt-in and separate from RepoTutor static analysis.",
      why: "CI gates can block delivery if thresholds are added without historical baselines and team agreement.",
      relatedHref: "html/code-metrics-readiness.html"
    });
  }
  if (hotspots.length > 0 && !hasCodeMapOutput) {
    riskQueue.push({
      priority: "low",
      action: "If a visual code-map workflow is desired, export a trusted CodeCharta-style cc.json map beside the static metrics report.",
      why: "RepoTutor can explain area, height, color, and delta map channels, but it does not generate or validate CodeCharta maps itself.",
      relatedHref: "html/code-metrics-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Treat branch-token complexity as an estimate and validate with a language-aware tool before refactoring.",
    why: "scc-style token scanning is fast and safe, but it cannot fully model recursion, generated code, or language-specific control flow.",
    relatedHref: hotspots[0]?.sourceHref ?? "html/code-metrics-readiness.html"
  });

  return {
    summary: `scc/lizard/tokei/CodeCharta식 code metrics readiness report: readable code ${totals.files}개에서 code line ${totals.codeLines}개, branch token ${totals.branchCount}개, hotspot 후보 ${hotspots.length}개와 code-map channel ${codeMapMetricBindings.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "scc lizard tokei cloc radon cyclomatic complexity code lines comments blanks hotspots COCOMO LOCOMO JSON CSV HTML OpenMetrics thresholds CodeCharta local code maps cc.json Web Studio area height color delta parser importer filter ValidationTool InspectionTool",
    totals,
    languageMetrics,
    hotspots,
    toolSignals,
    metricSignals,
    workflowSignals,
    codeMapMetricBindings,
    codeMapSignals,
    riskQueue,
    recommendedCommands: [
      { command: "scc --by-file --wide --format json .", purpose: "Trusted workspace에서 파일별 LOC, comments, blanks, complexity를 JSON으로 확인합니다." },
      { command: "scc --hotspots --format json .", purpose: "Git history가 있는 원본 저장소에서 complexity x churn hotspot을 확인합니다." },
      { command: "lizard -l javascript -l typescript -l python .", purpose: "언어별 함수 단위 cyclomatic complexity 후보를 확인합니다." },
      { command: "tokei --output json .", purpose: "빠른 language/line breakdown을 JSON으로 확인합니다." },
      { command: "ccsh rawtextparser .", purpose: "Trusted workspace에서 CodeCharta cc.json code map 입력을 생성할 수 있는지 확인합니다." },
      { command: "rg \"scc|lizard|tokei|cloc|radon|complexity|cyclomatic|cognitive|COCOMO|LOCOMO\" .", purpose: "프로젝트가 이미 metric tooling이나 threshold를 문서화했는지 정적으로 찾습니다." }
    ],
    learnerNextSteps: [
      "Language Metrics에서 코드 라인이 가장 큰 언어를 먼저 확인하고 해당 언어의 entry point로 이동하세요.",
      "Hotspots의 high priority 파일은 원본, 파일 수업, dependency health fan-in/fan-out을 함께 열어 읽기 순서를 잡으세요.",
      "Code Map Metric Bindings에서 area/height/color/delta를 어떤 학습 질문으로 읽을지 정하고, 맵이 있다면 실제 cc.json과 비교하세요.",
      "Tool Signals가 ready라면 실제 명령은 신뢰된 작업공간에서만 실행하고, RepoTutor 결과와 차이를 비교하세요.",
      "branch token이 높은 파일은 바로 리팩터링하지 말고 테스트, ownership, decision record를 먼저 확인하세요."
    ]
  };
}

async function codeMetricsSourceFiles(walk: WalkResult): Promise<CodeMetricSourceFile[]> {
  const candidates = walk.files.filter((file) => file.isTextCandidate && (codeMetricsIsCodeFile(file.relPath, file.ext) || codeMetricsIsConfigFile(file.relPath)));
  const rows: CodeMetricSourceFile[] = [];
  for (const file of candidates) {
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows;
}

function codeMetricsIsCodeFile(filePath: string, ext: string): boolean {
  if (LANGUAGE_BY_EXTENSION[ext] && ![".md", ".json", ".toml", ".yaml", ".yml"].includes(ext)) return true;
  return /(^|\/)(Dockerfile|Makefile|Rakefile|Gemfile)$/i.test(filePath);
}

function codeMetricsIsConfigFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return ["package.json", "pyproject.toml", "tox.ini", "setup.cfg", ".sccignore", ".lizard", ".lizardrc", ".eslintrc", ".eslintrc.json", ".eslintrc.cjs"].includes(base)
    || /\.cc\.json$/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /(^|\/)(readme|contributing|quality|metrics|complexity|maintainability|codecharta|code-map|codemap)[^/]*\.(md|rst|txt)$/i.test(filePath);
}

function codeMetricsRows(sourceFiles: CodeMetricSourceFile[]): Array<CodeMetricsReadinessReport["hotspots"][number] & { commentLines: number; blankLines: number }> {
  return sourceFiles
    .filter((source) => codeMetricsIsCodeFile(source.filePath, path.extname(source.filePath).toLowerCase()))
    .map((source) => {
      const lineRows = codeMetricsLineRows(source.text);
      const branchCount = codeMetricsBranchCount(source.text);
      const functionCount = codeMetricsFunctionCount(source.text);
      const complexityDensity = Number((branchCount / Math.max(1, lineRows.codeLines)).toFixed(4));
      const hotspotScore = Number((lineRows.codeLines * 0.25 + branchCount * 3 + functionCount * 0.8 + complexityDensity * 100).toFixed(2));
      return {
        filePath: source.filePath,
        language: LANGUAGE_BY_EXTENSION[path.extname(source.filePath).toLowerCase()] ?? (path.extname(source.filePath).replace(".", "").toUpperCase() || "Text"),
        lines: lineRows.lines,
        codeLines: lineRows.codeLines,
        commentLines: lineRows.commentLines,
        blankLines: lineRows.blankLines,
        branchCount,
        functionCount,
        complexityDensity,
        hotspotScore,
        readingPriority: "low" as const,
        evidence: "",
        sourceHref: source.sourceHref
      };
    });
}

function codeMetricsLineRows(text: string): { lines: number; codeLines: number; commentLines: number; blankLines: number } {
  const lines = text.split(/\r?\n/);
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  let inBlockComment = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      blankLines += 1;
      continue;
    }
    if (inBlockComment) {
      commentLines += 1;
      if (/\*\/|-->|'''|"""/.test(trimmed)) inBlockComment = false;
      continue;
    }
    if (/^(\/\/|#|--|;|<!--|\*)/.test(trimmed)) {
      commentLines += 1;
      continue;
    }
    if (/^(\/\*|'''|""")/.test(trimmed)) {
      commentLines += 1;
      if (!/\*\/|'''|"""/.test(trimmed.slice(2))) inBlockComment = true;
      continue;
    }
    codeLines += 1;
  }
  return { lines: lines.length, codeLines, commentLines, blankLines };
}

function codeMetricsBranchCount(text: string): number {
  return countMatches(text, /\b(if|else\s+if|for|while|switch|case|catch|except|elif|elsif|match|when|guard|select|foreach)\b|&&|\|\||\?/gi);
}

function codeMetricsFunctionCount(text: string): number {
  return countMatches(text, /\b(function|def|func|fn)\s+[$A-Z_a-z][$\w]*|\b[A-Z_a-z][$\w]*\s*=\s*(async\s*)?\([^)]*\)\s*=>|=>|\b(public|private|protected)?\s*(static\s+)?[A-Z_a-z][$\w<>,[\]\s]*\s+[$A-Z_a-z][$\w]*\s*\([^)]*\)\s*[{;]/g);
}

function codeMetricsTotals(rows: ReturnType<typeof codeMetricsRows>): CodeMetricsReadinessReport["totals"] {
  const totals = rows.reduce((acc, row) => ({
    files: acc.files + 1,
    lines: acc.lines + row.lines,
    codeLines: acc.codeLines + row.codeLines,
    commentLines: acc.commentLines + row.commentLines,
    blankLines: acc.blankLines + row.blankLines,
    branchCount: acc.branchCount + row.branchCount,
    functionCount: acc.functionCount + row.functionCount,
    complexityDensity: 0
  }), { files: 0, lines: 0, codeLines: 0, commentLines: 0, blankLines: 0, branchCount: 0, functionCount: 0, complexityDensity: 0 });
  return { ...totals, complexityDensity: Number((totals.branchCount / Math.max(1, totals.codeLines)).toFixed(4)) };
}

function codeMetricsByLanguage(rows: ReturnType<typeof codeMetricsRows>): CodeMetricsReadinessReport["languageMetrics"] {
  const grouped = new Map<string, CodeMetricsReadinessReport["languageMetrics"][number]>();
  for (const row of rows) {
    const current = grouped.get(row.language) ?? {
      language: row.language,
      fileCount: 0,
      lines: 0,
      codeLines: 0,
      commentLines: 0,
      blankLines: 0,
      branchCount: 0,
      functionCount: 0,
      complexityDensity: 0,
      evidence: ""
    };
    current.fileCount += 1;
    current.lines += row.lines;
    current.codeLines += row.codeLines;
    current.commentLines += row.commentLines;
    current.blankLines += row.blankLines;
    current.branchCount += row.branchCount;
    current.functionCount += row.functionCount;
    grouped.set(row.language, current);
  }
  return [...grouped.values()]
    .map((item) => ({
      ...item,
      complexityDensity: Number((item.branchCount / Math.max(1, item.codeLines)).toFixed(4)),
      evidence: `${item.fileCount} ${item.language} files with ${item.codeLines} code lines and ${item.branchCount} branch tokens.`
    }))
    .sort((a, b) => b.codeLines - a.codeLines || a.language.localeCompare(b.language));
}

function codeMetricsToolSignals(sourceFiles: CodeMetricSourceFile[]): CodeMetricsReadinessReport["toolSignals"] {
  const specs: Array<{ signal: CodeMetricsReadinessReport["toolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "scc", pattern: /\bscc\b|Sloc Cloc and Code/i, evidence: "scc evidence was detected." },
    { signal: "lizard", pattern: /\blizard\b|CCN|cyclomatic complexity analyser/i, evidence: "lizard evidence was detected." },
    { signal: "tokei", pattern: /\btokei\b/i, evidence: "tokei evidence was detected." },
    { signal: "cloc", pattern: /\bcloc\b/i, evidence: "cloc evidence was detected." },
    { signal: "radon", pattern: /\bradon\b/i, evidence: "radon evidence was detected." },
    { signal: "eslint-complexity", pattern: /\bcomplexity\b|sonarjs\/cognitive-complexity|eslint-plugin-complexity/i, evidence: "ESLint complexity rule evidence was detected." },
    { signal: "complexity-report", pattern: /complexity-report|plato|jscomplexity/i, evidence: "complexity-report style tool evidence was detected." },
    { signal: "locomo", pattern: /\bLOCOMO\b|--locomo/i, evidence: "LOCOMO evidence was detected." },
    { signal: "cocomo", pattern: /\bCOCOMO\b|--cocomo|sloccount/i, evidence: "COCOMO evidence was detected." },
    { signal: "codecharta", pattern: /CodeCharta|codecharta|ccsh|\.cc\.json|cc\.json|Web Studio/i, evidence: "CodeCharta code-map evidence was detected." }
  ];
  return codeMetricsSignals(specs, sourceFiles, "html/code-metrics-readiness.html");
}

function codeMetricsMetricSignals(totals: CodeMetricsReadinessReport["totals"], hotspots: CodeMetricsReadinessReport["hotspots"], sourceFiles: CodeMetricSourceFile[]): CodeMetricsReadinessReport["metricSignals"] {
  const builtin: CodeMetricsReadinessReport["metricSignals"] = [
    { signal: "loc", readiness: totals.lines > 0 ? "ready" : "missing", evidence: `RepoTutor counted ${totals.lines} total lines.`, relatedHref: "html/code-metrics-readiness.html" },
    { signal: "code-lines", readiness: totals.codeLines > 0 ? "ready" : "missing", evidence: `RepoTutor counted ${totals.codeLines} code lines.`, relatedHref: "html/code-metrics-readiness.html" },
    { signal: "comment-lines", readiness: totals.commentLines > 0 ? "ready" : "missing", evidence: `RepoTutor counted ${totals.commentLines} comment lines.`, relatedHref: "html/code-metrics-readiness.html" },
    { signal: "blank-lines", readiness: totals.blankLines > 0 ? "ready" : "missing", evidence: `RepoTutor counted ${totals.blankLines} blank lines.`, relatedHref: "html/code-metrics-readiness.html" },
    { signal: "cyclomatic", readiness: totals.branchCount > 0 ? "partial" : "missing", evidence: `RepoTutor estimated ${totals.branchCount} branch tokens, not full AST cyclomatic complexity.`, relatedHref: hotspots[0]?.sourceHref ?? "html/code-metrics-readiness.html" },
    { signal: "function-count", readiness: totals.functionCount > 0 ? "partial" : "missing", evidence: `RepoTutor estimated ${totals.functionCount} function-like tokens.`, relatedHref: hotspots[0]?.sourceHref ?? "html/code-metrics-readiness.html" },
    { signal: "hotspots", readiness: hotspots.length > 0 ? "partial" : "missing", evidence: `RepoTutor ranked ${hotspots.length} file-level hotspots from static size and branch tokens.`, relatedHref: hotspots[0]?.sourceHref ?? "html/code-metrics-readiness.html" }
  ];
  const externalSpecs: Array<{ signal: CodeMetricsReadinessReport["metricSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cognitive", pattern: /cognitive[-_ ]complexity/i, evidence: "cognitive complexity evidence was detected." },
    { signal: "function-length", pattern: /max[-_ ]?(function|method)[-_ ]?length|function length/i, evidence: "function length threshold evidence was detected." },
    { signal: "parameter-count", pattern: /max[-_ ]?params|parameter count|argument count/i, evidence: "parameter count threshold evidence was detected." },
    { signal: "halstead", pattern: /halstead/i, evidence: "Halstead metric evidence was detected." },
    { signal: "cocomo", pattern: /\bCOCOMO\b|--cocomo|sloccount/i, evidence: "COCOMO metric evidence was detected." },
    { signal: "locomo", pattern: /\bLOCOMO\b|--locomo/i, evidence: "LOCOMO metric evidence was detected." },
    { signal: "dryness", pattern: /\bDRYness\b|duplicate code|copy[-_ ]paste/i, evidence: "DRYness/duplicate-code evidence was detected." }
  ];
  return [...builtin, ...codeMetricsSignals(externalSpecs, sourceFiles, "html/code-metrics-readiness.html")];
}

function codeMetricsWorkflowSignals(sourceFiles: CodeMetricSourceFile[]): CodeMetricsReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: CodeMetricsReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "json-output", pattern: /--format\s+json|--output\s+json|output json/i, evidence: "JSON metric output evidence was detected." },
    { signal: "csv-output", pattern: /--format\s+csv|output csv/i, evidence: "CSV metric output evidence was detected." },
    { signal: "html-report", pattern: /--report|--format\s+html|html report/i, evidence: "HTML metric report evidence was detected." },
    { signal: "openmetrics", pattern: /openmetrics|prometheus/i, evidence: "OpenMetrics/Prometheus metric output evidence was detected." },
    { signal: "threshold", pattern: /threshold|--ccn|cyclomatic_complexity|max-complexity|complexity\s*[:=]\s*\d+/i, evidence: "metric threshold evidence was detected." },
    { signal: "ci-complexity", pattern: /(^|\/)\.github\/workflows\/[^/]+\.ya?ml[\s\S]*(scc|lizard|tokei|cloc|radon|complexity)|\bCI\b[\s\S]*(scc|lizard|tokei|cloc|radon|complexity)/i, evidence: "CI complexity workflow evidence was detected." },
    { signal: "baseline", pattern: /baseline|previous run|compare|trend/i, evidence: "baseline/trend evidence was detected." },
    { signal: "diff-check", pattern: /diff|changed files|pull request|merge request/i, evidence: "diff-check evidence was detected." },
    { signal: "ignore-file", pattern: /\.sccignore|\.ignore|exclude-file|exclude-ext/i, evidence: "metric ignore file evidence was detected." },
    { signal: "hotspot-report", pattern: /--hotspots|hotspot/i, evidence: "hotspot report evidence was detected." }
  ];
  return codeMetricsSignals(specs, sourceFiles, "html/code-metrics-readiness.html");
}

function codeMetricsCodeMapMetricBindings(
  totals: CodeMetricsReadinessReport["totals"],
  hotspots: CodeMetricsReadinessReport["hotspots"],
  workflowSignals: CodeMetricsReadinessReport["workflowSignals"]
): CodeMetricsReadinessReport["codeMapMetricBindings"] {
  const hotspotHref = hotspots[0]?.sourceHref ?? "html/code-metrics-readiness.html";
  const hasDeltaEvidence = workflowSignals.some((item) => ["baseline", "diff-check"].includes(item.signal) && item.readiness === "ready");
  return [
    {
      channel: "area",
      metric: "code-lines",
      readiness: totals.codeLines > 0 ? "ready" : "missing",
      evidence: `Map area can represent ${totals.codeLines} static code lines across ${totals.files} files.`,
      relatedHref: "html/code-metrics-readiness.html"
    },
    {
      channel: "height",
      metric: "branch-token-complexity",
      readiness: totals.branchCount > 0 ? "partial" : "missing",
      evidence: `Map height can represent ${totals.branchCount} branch tokens; this is a static estimate, not language-aware cyclomatic complexity.`,
      relatedHref: hotspotHref
    },
    {
      channel: "color",
      metric: "complexity-density",
      readiness: hotspots.length > 0 ? "partial" : "missing",
      evidence: `Map color can highlight hotspot density; top hotspot count is ${hotspots.length}.`,
      relatedHref: hotspotHref
    },
    {
      channel: "delta",
      metric: "baseline-vs-current",
      readiness: hasDeltaEvidence ? "ready" : "missing",
      evidence: hasDeltaEvidence
        ? "Baseline or diff evidence was detected, so a CodeCharta-style delta-map learning question can be framed."
        : "No baseline or diff evidence was detected for comparing two code maps over time.",
      relatedHref: "html/code-metrics-readiness.html"
    }
  ];
}

function codeMetricsCodeMapSignals(sourceFiles: CodeMetricSourceFile[]): CodeMetricsReadinessReport["codeMapSignals"] {
  const specs: Array<{ signal: CodeMetricsReadinessReport["codeMapSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cc-json", pattern: /\.cc\.json|cc\.json|CodeCharta/i, evidence: "CodeCharta cc.json map evidence was detected." },
    { signal: "source-parser", pattern: /RawTextParser|SourceCodeParser|source code parser|parse your code base|ccsh rawtextparser/i, evidence: "CodeCharta source parser evidence was detected." },
    { signal: "git-log-parser", pattern: /GitLogParser|git log parser|git log/i, evidence: "CodeCharta git-log parser evidence was detected." },
    { signal: "metric-importer", pattern: /SonarQube|SonarImporter|TokeiImporter|CodeMaat|CSVImporter|CoverageImporter|SourceMonitor/i, evidence: "CodeCharta metric importer evidence was detected." },
    { signal: "filter-pipeline", pattern: /EdgeFilter|MergeFilter|StructureModifier|pipes and filters/i, evidence: "CodeCharta filter pipeline evidence was detected." },
    { signal: "web-studio", pattern: /Web Studio|3D map|city-like map|area[,/ ]+height[,/ ]+color|area.*height.*color|codecharta-visualization/i, evidence: "CodeCharta Web Studio visualization evidence was detected." },
    { signal: "local-only", pattern: /data stays local|no analytics|no telemetry|no data.*uploaded|local.*analysis.*visualization/i, evidence: "local-only code-map evidence was detected." },
    { signal: "delta-comparison", pattern: /delta|compare two maps|baseline|previous run|trend/i, evidence: "CodeCharta delta comparison evidence was detected." },
    { signal: "validation-tool", pattern: /ValidationTool|validates?.*json|cc\.json.*schema|generatedSchema\.json/i, evidence: "CodeCharta validation tool evidence was detected." },
    { signal: "inspection-tool", pattern: /InspectionTool|shows information.*json|inspect.*cc\.json/i, evidence: "CodeCharta inspection tool evidence was detected." }
  ];
  return codeMetricsSignals(specs, sourceFiles, "html/code-metrics-readiness.html");
}

function codeMetricsSignals<T extends { signal: string; pattern: RegExp; evidence: string }>(
  specs: T[],
  sourceFiles: CodeMetricSourceFile[],
  fallbackHref: string
): Array<{ signal: T["signal"]; readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(`${source.filePath}\n${source.text}`));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${spec.evidence} (${match.filePath})` : `${spec.signal} evidence was not detected in the static snapshot.`,
      relatedHref: match?.sourceHref ?? fallbackHref
    };
  });
}

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

