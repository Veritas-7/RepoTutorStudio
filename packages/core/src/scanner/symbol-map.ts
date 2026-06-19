import { htmlAnchor, type FileLesson, type SymbolMapReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export async function buildSymbolMapReport(walk: WalkResult, fileLessons: FileLesson[]): Promise<SymbolMapReport> {
  const lessonPaths = new Set(fileLessons.map((lesson) => lesson.filePath));
  const candidateFiles = walk.files
    .filter((file) => file.isTextCandidate && /\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|rs)$/.test(file.relPath))
    .sort((a, b) => Number(lessonPaths.has(b.relPath)) - Number(lessonPaths.has(a.relPath)) || a.relPath.localeCompare(b.relPath))
    .slice(0, 120);
  const symbols: SymbolMapReport["symbols"] = [];
  for (const file of candidateFiles) {
    const text = await readTextIfSafe(file.absPath, 100_000);
    if (!text) continue;
    symbols.push(...extractSymbols(file.relPath, text));
  }
  const uniqueSymbols = dedupeSymbols(symbols).slice(0, 120);
  const symbolsByKind = countBy(uniqueSymbols.map((symbol) => symbol.kind));
  const fileCounts = countBy(uniqueSymbols.map((symbol) => symbol.filePath));
  const filesWithSymbols = Object.entries(fileCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 30)
    .map(([filePath, count]) => ({
      filePath,
      count,
      lessonHref: `html/files.html#${htmlAnchor(filePath)}`,
      sourceHref: `source/${encodedPath(filePath)}`
    }));
  const intelligenceFiles = await symbolMapIntelligenceFiles(walk);
  const codeIntelligenceSignals = symbolMapCodeIntelligenceSignals(intelligenceFiles);
  const syntaxParserSignals = symbolMapSyntaxParserSignals(intelligenceFiles);
  const symbolNavigationPrompts = symbolMapNavigationPrompts(uniqueSymbols);
  const syntaxQueryPrompts = symbolMapSyntaxQueryPrompts(uniqueSymbols, syntaxParserSignals);
  return {
    summary: `codebase-map/SCIP/Tree-sitter식 symbol map: ${uniqueSymbols.length}개 함수/클래스/상수/type 신호, code-intelligence signal ${codeIntelligenceSignals.length}개, syntax parser signal ${syntaxParserSignals.length}개를 정적으로 추출했습니다.`,
    sourcePattern: "codebase-map AST-based functions classes constants index SCIP Code Intelligence Protocol definitions references implementations occurrences SymbolInformation relationships hover signatures diagnostics snapshot stats language indexers Tree-sitter incremental parser concrete syntax tree grammar.js tree-sitter.json node-types.json queries captures predicates highlights locals injections tags parse query test",
    totalSymbols: uniqueSymbols.length,
    symbolsByKind,
    symbols: uniqueSymbols,
    filesWithSymbols,
    codeIntelligenceSignals,
    syntaxParserSignals,
    symbolNavigationPrompts,
    syntaxQueryPrompts,
    learnerNextSteps: [
      "exported symbol부터 읽어 프로젝트의 공개 API를 파악하세요.",
      "symbol이 많은 파일은 한 번에 읽지 말고 함수나 class 단위로 나누어 추적하세요.",
      "symbol map을 file lesson과 함께 열어 이름, 역할, 원본 코드를 대조하세요.",
      "SCIP/LSIF 같은 precise code intelligence 신호가 있다면 definition, references, implementations를 실제 인덱스와 비교하세요.",
      "Tree-sitter grammar/query 신호가 있다면 node-types, highlights, locals, tags 쿼리로 정의와 참조를 어떻게 캡처하는지 확인하세요."
    ]
  };
}

type SymbolIntelligenceSourceFile = { filePath: string; text: string; sourceHref: string };

async function symbolMapIntelligenceFiles(walk: WalkResult): Promise<SymbolIntelligenceSourceFile[]> {
  const files: SymbolIntelligenceSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!symbolMapIntelligencePathCandidate(file.relPath) && !/\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|rs|proto|json|ya?ml|md|txt|scm)$/.test(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 120_000);
    if (!text) continue;
    if (!symbolMapIntelligencePathCandidate(file.relPath) && !symbolMapIntelligenceTextCandidate(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files.slice(0, 120);
}

function symbolMapIntelligencePathCandidate(filePath: string): boolean {
  return /(^|\/)(README|docs?|code[-_]?intel|code[-_]?intelligence|symbol|symbols|scip|lsif|index\.scip|scip\.proto|grammar\.js|grammar\.json|tree-sitter\.json|node-types\.json|queries|highlights\.scm|locals\.scm|injections\.scm|tags\.scm|test\/corpus|test\/tags|package\.json|\.github\/workflows)(\/|\.|-|_|$)/i.test(filePath);
}

function symbolMapIntelligenceTextCandidate(text: string): boolean {
  return /SCIP|LSIF|code intelligence|go to definition|find references|find implementations|SymbolInformation|Occurrence|Relationship|hover|diagnostic|scip\s+(lint|print|snapshot|stats|test)|Tree-sitter|tree-sitter|incremental parser|concrete syntax tree|syntax tree|grammar\(|node-types\.json|queries\/.*\.scm|@\w|#(?:eq|match|set|strip|select-adjacent)[?!]|tree-sitter\s+(parse|query|highlight|tags|test)/i.test(text);
}

function symbolMapCodeIntelligenceSignals(sourceFiles: SymbolIntelligenceSourceFile[]): SymbolMapReport["codeIntelligenceSignals"] {
  const specs: Array<{ signal: SymbolMapReport["codeIntelligenceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "scip-index", pattern: /\bSCIP\b|index\.scip|scip\.proto|Code Intelligence Protocol/i, evidence: "SCIP index or protocol evidence was detected." },
    { signal: "scip-cli", pattern: /scip\s+(lint|print|snapshot|stats|test|expt-convert)|SCIP CLI/i, evidence: "SCIP CLI command evidence was detected." },
    { signal: "definition-navigation", pattern: /go to definition|definition navigation|\bdefinitions?\b/i, evidence: "definition navigation evidence was detected." },
    { signal: "reference-navigation", pattern: /find references|reference navigation|\breferences?\b/i, evidence: "reference navigation evidence was detected." },
    { signal: "implementation-navigation", pattern: /find implementations?|implementation navigation|is_implementation|implements/i, evidence: "implementation navigation evidence was detected." },
    { signal: "occurrence-ranges", pattern: /Occurrence|occurrences|position_encoding|range|start_line|end_line/i, evidence: "occurrence range evidence was detected." },
    { signal: "symbol-information", pattern: /SymbolInformation|symbol information|signature_documentation|documentation/i, evidence: "symbol information evidence was detected." },
    { signal: "relationships", pattern: /Relationship|relationships|is_definition|type_definition|reference_symbol/i, evidence: "symbol relationship evidence was detected." },
    { signal: "hover-signature", pattern: /hover|Signature|signature|docstring/i, evidence: "hover or signature evidence was detected." },
    { signal: "diagnostics", pattern: /Diagnostic|diagnostics|compiler error|warning|severity/i, evidence: "diagnostic evidence was detected." },
    { signal: "snapshot-testing", pattern: /scip snapshot|snapshot files|golden testing|snapshot testing/i, evidence: "snapshot testing evidence was detected." },
    { signal: "stats-command", pattern: /scip stats|statistics about a SCIP index|useful statistics/i, evidence: "SCIP stats evidence was detected." },
    { signal: "language-indexers", pattern: /scip-java|scip-typescript|rust-analyzer|scip-clang|scip-ruby|scip-python|scip-dotnet|scip-dart|scip-php/i, evidence: "language indexer evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(`${source.filePath}\n${source.text}`));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${spec.evidence} (${match.filePath})` : `${spec.signal} evidence was not detected in the static snapshot.`,
      relatedHref: match?.sourceHref ?? "html/symbol-map.html"
    };
  });
}

function symbolMapSyntaxParserSignals(sourceFiles: SymbolIntelligenceSourceFile[]): SymbolMapReport["syntaxParserSignals"] {
  const specs: Array<{ signal: SymbolMapReport["syntaxParserSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tree-sitter-grammar", pattern: /(^|\/)(grammar\.(js|json)|tree-sitter\.json)\b|grammar\s*\(|"grammars"\s*:/i, evidence: "Tree-sitter grammar or language configuration evidence was detected." },
    { signal: "incremental-parser", pattern: /incremental parsing|incremental parser|efficiently update the syntax tree|as the source file is edited|parse on every keystroke/i, evidence: "incremental parser evidence was detected." },
    { signal: "concrete-syntax-tree", pattern: /concrete syntax tree|\bCST\b|S-expression|syntax trees?|parse --cst|--cst/i, evidence: "concrete syntax tree evidence was detected." },
    { signal: "node-types", pattern: /node-types\.json|Static Node Types|"node-types"|fields"\s*:|children"\s*:|subtypes"\s*:/i, evidence: "node-types schema evidence was detected." },
    { signal: "query-captures", pattern: /queries\/.*\.scm|@\w[\w.-]*|capture names?|Query Syntax|S-expression.*matches/i, evidence: "Tree-sitter query capture evidence was detected." },
    { signal: "highlight-query", pattern: /highlights\.scm|tree-sitter highlight|@keyword|@function|@type|highlight names?/i, evidence: "highlight query evidence was detected." },
    { signal: "locals-query", pattern: /locals\.scm|@local\.scope|@local\.definition|@local\.reference|local variables query/i, evidence: "locals query evidence was detected." },
    { signal: "injections-query", pattern: /injections\.scm|@injection\.content|injection\.language|language injection|#set!\s+injection/i, evidence: "injection query evidence was detected." },
    { signal: "tags-query", pattern: /tags\.scm|tree-sitter tags|@definition\.(class|function|interface|method|module)|@reference\.(call|class|implementation)|@name|#strip!|#select-adjacent!/i, evidence: "tags query evidence was detected." },
    { signal: "parse-command", pattern: /tree-sitter parse|--json-summary|--stat|--dot|--xml|parse \[OPTIONS\]/i, evidence: "parse command evidence was detected." },
    { signal: "query-command", pattern: /tree-sitter query|--captures|--byte-range|--row-range|query \[OPTIONS\]/i, evidence: "query command evidence was detected." },
    { signal: "grammar-tests", pattern: /tree-sitter test|test\/corpus|test\/tags|:cst|:error|:skip|expected output syntax tree/i, evidence: "grammar or query test evidence was detected." },
    { signal: "error-node-query", pattern: /\(ERROR\)|\(MISSING\)|@error-node|@missing-node|syntax errors/i, evidence: "ERROR/MISSING node query evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(`${source.filePath}\n${source.text}`));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${spec.evidence} (${match.filePath})` : `${spec.signal} evidence was not detected in the static snapshot.`,
      relatedHref: match?.sourceHref ?? "html/symbol-map.html"
    };
  });
}

function symbolMapNavigationPrompts(symbols: SymbolMapReport["symbols"]): SymbolMapReport["symbolNavigationPrompts"] {
  const anchor = symbols.find((symbol) => symbol.exported) ?? symbols[0];
  if (!anchor) {
    return [{
      title: "Create a first symbol index",
      question: "Which files should be indexed first so definition and reference navigation can start from concrete symbols?",
      relatedHref: "html/symbol-map.html"
    }];
  }
  return [
    {
      title: "Go to definition",
      question: `${anchor.name}의 정의를 먼저 열고, 이름만으로 알 수 있는 역할과 실제 구현이 일치하는지 확인하세요.`,
      relatedHref: anchor.sourceHref
    },
    {
      title: "Find references",
      question: `${anchor.name}를 호출하거나 참조하는 위치를 찾아 public API인지 내부 helper인지 구분하세요.`,
      relatedHref: anchor.lessonHref
    },
    {
      title: "Check hover and diagnostics",
      question: `${anchor.name}의 signature, docstring, warning/diagnostic이 있다면 학습 노트에 같이 기록하세요.`,
      relatedHref: anchor.sourceHref
    }
  ];
}

function symbolMapSyntaxQueryPrompts(symbols: SymbolMapReport["symbols"], signals: SymbolMapReport["syntaxParserSignals"]): SymbolMapReport["syntaxQueryPrompts"] {
  const ready = new Set(signals.filter((signal) => signal.readiness === "ready").map((signal) => signal.signal));
  const anchor = symbols.find((symbol) => symbol.exported) ?? symbols[0];
  const grammarHref = signals.find((signal) => signal.signal === "tree-sitter-grammar" && signal.readiness === "ready")?.relatedHref ?? "html/symbol-map.html";
  const queryHref = signals.find((signal) => signal.signal === "tags-query" && signal.readiness === "ready")?.relatedHref
    ?? signals.find((signal) => signal.signal === "query-captures" && signal.readiness === "ready")?.relatedHref
    ?? "html/symbol-map.html";
  const nodeTypesHref = signals.find((signal) => signal.signal === "node-types" && signal.readiness === "ready")?.relatedHref ?? grammarHref;
  const anchorName = anchor?.name ?? "첫 번째 핵심 symbol";
  return [
    {
      title: "Trace grammar to node-types",
      question: ready.has("node-types")
        ? "grammar.js나 tree-sitter.json에서 시작해 node-types.json의 fields/children/subtypes가 실제 코드 구조를 어떻게 설명하는지 대조하세요."
        : "grammar.js나 tree-sitter.json이 있다면 node-types.json을 생성 또는 문서화해 학습자가 문법 노드와 소스 구조를 대조할 수 있게 하세요.",
      relatedHref: nodeTypesHref
    },
    {
      title: "Map captures to symbols",
      question: `${anchorName} 같은 symbol을 @definition.*, @reference.*, @name capture로 어떻게 잡을 수 있는지 tags/highlights query에서 확인하세요.`,
      relatedHref: queryHref
    },
    {
      title: "Separate syntax errors from missing context",
      question: ready.has("error-node-query")
        ? "(ERROR)/(MISSING) query 신호를 사용해 문법 오류와 아직 학습하지 않은 주변 문맥을 분리하세요."
        : "(ERROR)/(MISSING) query가 없다면 문법 오류를 학습 질문으로 바꾸는 별도 점검 단계를 추가하세요.",
      relatedHref: queryHref
    }
  ];
}

function extractSymbols(filePath: string, text: string): SymbolMapReport["symbols"] {
  const rows: SymbolMapReport["symbols"] = [];
  const patterns: Array<{ kind: SymbolMapReport["symbols"][number]["kind"]; regex: RegExp }> = [
    { kind: "function", regex: /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g },
    { kind: "class", regex: /(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g },
    { kind: "constant", regex: /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g },
    { kind: "interface", regex: /(?:export\s+)?interface\s+([A-Za-z_$][A-Za-z0-9_$]*)/g },
    { kind: "type", regex: /(?:export\s+)?type\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g }
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern.regex)) {
      const full = match[0] ?? "";
      rows.push({
        filePath,
        name: match[1],
        kind: pattern.kind,
        exported: /^\s*export\s/.test(full),
        sourceHref: `source/${encodedPath(filePath)}`,
        lessonHref: `html/files.html#${htmlAnchor(filePath)}`
      });
    }
  }
  return rows;
}

function dedupeSymbols(symbols: SymbolMapReport["symbols"]): SymbolMapReport["symbols"] {
  const seen = new Set<string>();
  return symbols.filter((symbol) => {
    const key = `${symbol.filePath}:${symbol.kind}:${symbol.name}:${symbol.exported}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}
