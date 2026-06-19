import { htmlAnchor, type ApiReferenceReport, type FileLesson, type SymbolMapReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

type ApiReferenceSourceFile = { filePath: string; text: string; sourceHref: string };

export async function buildApiReferenceSourceFiles(walk: WalkResult): Promise<ApiReferenceSourceFile[]> {
  const files: ApiReferenceSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!apiReferencePathCandidate(file.relPath) && !/\.(ts|tsx|js|jsx|mjs|cjs|jsonc?|md|mdx)$/.test(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!apiReferencePathCandidate(file.relPath) && !apiReferenceTextCandidate(text)) continue;
    files.push({
      filePath: file.relPath,
      text,
      sourceHref: `source/${encodedPath(file.relPath)}`
    });
  }
  return files.slice(0, 120);
}

function apiReferencePathCandidate(filePath: string): boolean {
  return /(^|\/)(typedoc(\.config)?\.(jsonc?|[cm]?[jt]s)|typedoc\.[cm]?[jt]s|\.config\/typedoc\.jsonc?|tsdoc\.json|tsconfig\.json|package\.json|README\.md|docs?\/|api-reference|reference|docs-config)(\/|$|\.|-|_)/i.test(filePath);
}

function apiReferenceTextCandidate(text: string): boolean {
  return /typedoc|TypeDocOptions|typedocOptions|entryPoints|entryPointStrategy|ReflectionKind|typedoc-plugin|tsdoc\.json|validation\.invalidLink|requiredToBeDocumented|treatValidationWarningsAsErrors|generateOutputs|validationWarningCount/i.test(text);
}

export function buildApiReferenceReport(fileLessons: FileLesson[], symbolMapReport: SymbolMapReport, sourceFiles: ApiReferenceSourceFile[]): ApiReferenceReport {
  const entryPoints = fileLessons
    .filter((lesson) => /(^|\/)(index|main|cli|app|server|lib)\.[^.]+$/.test(lesson.filePath) || lesson.keyExports.length > 0)
    .slice(0, 10)
    .map((lesson) => ({
      filePath: lesson.filePath,
      reason: lesson.keyExports.length > 0
        ? `TypeDoc entry point처럼 ${lesson.keyExports.length}개 export 신호를 문서 시작점으로 삼습니다.`
        : "파일명과 역할상 API 문서의 entry point 후보입니다.",
      lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
      sourceHref: `source/${encodedPath(lesson.filePath)}`
    }));
  const exportedSymbols = symbolMapReport.symbols.filter((symbol) => symbol.exported);
  const fallbackSymbols = exportedSymbols.length > 0 ? exportedSymbols : symbolMapReport.symbols.slice(0, 20);
  const publicSymbols = fallbackSymbols.slice(0, 80).map((symbol) => ({
    name: symbol.name,
    kind: symbol.kind,
    category: apiCategory(symbol.kind),
    filePath: symbol.filePath,
    signature: apiSignature(symbol),
    lessonHref: symbol.lessonHref,
    sourceHref: symbol.sourceHref
  }));
  const entryPointPaths = new Set(entryPoints.map((entry) => entry.filePath));
  const exportWarnings = symbolMapReport.symbols
    .filter((symbol) => !symbol.exported && (entryPointPaths.has(symbol.filePath) || /(^|\/)(index|main|lib)\.[^.]+$/.test(symbol.filePath)))
    .slice(0, 12)
    .map((symbol) => ({
      filePath: symbol.filePath,
      symbolName: symbol.name,
      message: `${symbol.name} appears in an API-adjacent file but is not exported in the static symbol map.`,
      suggestion: "공개 API라면 export하고, 내부 helper라면 파일 수업에서 internal로 설명하세요.",
      sourceHref: symbol.sourceHref
    }));
  const typedocConfigSignals = apiReferenceTypedocConfigSignals(sourceFiles);
  const outputSignals = apiReferenceOutputSignals(sourceFiles);
  const validationSignals = apiReferenceValidationSignals(sourceFiles);
  const readyConfigCount = typedocConfigSignals.filter((item) => item.readiness === "ready").length;
  const readyOutputCount = outputSignals.filter((item) => item.readiness === "ready").length;
  const readyValidationCount = validationSignals.filter((item) => item.readiness === "ready").length;
  return {
    summary: `TypeDoc식 API reference report: entry point ${entryPoints.length}개, public symbol ${publicSymbols.length}개, TypeDoc config signal ${readyConfigCount}개, output signal ${readyOutputCount}개, validation signal ${readyValidationCount}개를 ReflectionKind 스타일 category로 정리했습니다.`,
    sourcePattern: "TypeDoc entry points reflections ReflectionKind public API documentation export validation typedoc.json typedocOptions outputs html json emit plugin",
    entryPoints,
    publicSymbols,
    kindCounts: countBy(publicSymbols.map((symbol) => symbol.kind)),
    categoryCounts: countBy(publicSymbols.map((symbol) => symbol.category)),
    exportWarnings,
    typedocConfigSignals,
    outputSignals,
    validationSignals,
    learnerNextSteps: [
      "entryPoints에서 시작해 공개 symbol이 어느 파일에서 export되는지 확인하세요.",
      "function/class/interface/type category를 나누어 값 API와 타입 API를 따로 읽으세요.",
      "typedocConfigSignals에서 typedoc.json, package script, typedocOptions, entryPointStrategy가 실제로 고정되어 있는지 확인하세요.",
      "outputSignals에서 HTML/JSON/Markdown 출력과 emit 정책이 문서 배포 목적에 맞는지 확인하세요.",
      "validationSignals에서 invalid link, not exported, not documented 경고가 CI에서 실패로 승격되는지 확인하세요.",
      "exportWarnings는 공개 API 후보인지 내부 helper인지 사람 검토로 확정하세요."
    ]
  };
}

function apiReferenceTypedocConfigSignals(sourceFiles: ApiReferenceSourceFile[]): ApiReferenceReport["typedocConfigSignals"] {
  return apiReferenceSignalFromSpecs(sourceFiles, [
    { signal: "typedoc-config", pattern: /(^|\/)(typedoc(\.config)?\.(jsonc?|[cm]?[jt]s)|\.config\/typedoc\.jsonc?|typedoc\.[cm]?[jt]s)(\n|$)/i, evidence: "TypeDoc configuration file evidence was detected." },
    { signal: "package-script", pattern: /"scripts"\s*:|typedoc\s+|npx\s+typedoc|pnpm\s+typedoc|yarn\s+typedoc|bunx\s+typedoc/i, evidence: "package script or command evidence for TypeDoc was detected." },
    { signal: "options-file", pattern: /--options\b|options\s*:|extends\s*:/i, evidence: "TypeDoc options file or config extension evidence was detected." },
    { signal: "tsconfig", pattern: /--tsconfig\b|tsconfig\.json|compilerOptions\s*:/i, evidence: "TypeScript compiler config evidence for TypeDoc was detected." },
    { signal: "typedoc-options", pattern: /typedocOptions|TypeDocOptions/i, evidence: "typedocOptions or TypeDocOptions evidence was detected." },
    { signal: "entry-points", pattern: /entryPoints|typedoc\s+[^-\n]*(?:\.ts|\.tsx|\.js|\.jsx)/i, evidence: "TypeDoc entry point evidence was detected." },
    { signal: "entry-point-strategy", pattern: /entryPointStrategy|EntryPointStrategy\./i, evidence: "TypeDoc entryPointStrategy evidence was detected." },
    { signal: "packages-strategy", pattern: /entryPointStrategy["'\s:=]+packages|EntryPointStrategy\.Packages|\bpackages\b[\s\S]{0,80}\bentryPointStrategy\b/i, evidence: "TypeDoc packages entry point strategy evidence was detected." },
    { signal: "plugin", pattern: /--plugin\b|plugin\s*:|typedoc-plugin/i, evidence: "TypeDoc plugin configuration evidence was detected." },
    { signal: "tsdoc-config", pattern: /(^|\/)tsdoc\.json(\n|$)|tsdoc\.json|blockTags|inlineTags|modifierTags|typedoc\/tsdoc\.json/i, evidence: "TSDoc tag configuration evidence was detected." }
  ]);
}

function apiReferenceOutputSignals(sourceFiles: ApiReferenceSourceFile[]): ApiReferenceReport["outputSignals"] {
  return apiReferenceSignalFromSpecs(sourceFiles, [
    { signal: "out", pattern: /--out\b|["']out["']\s*:|\bout\s*:/i, evidence: "TypeDoc default output path evidence was detected." },
    { signal: "html", pattern: /--html\b|["']html["']\s*:|["']?name["']?\s*:\s*["']html["']/i, evidence: "TypeDoc HTML output evidence was detected." },
    { signal: "json", pattern: /--json\b|["']json["']\s*:|["']?name["']?\s*:\s*["']json["']/i, evidence: "TypeDoc JSON reflection output evidence was detected." },
    { signal: "outputs-array", pattern: /outputs\s*:\s*\[|"outputs"\s*:\s*\[/i, evidence: "TypeDoc multi-output configuration evidence was detected." },
    { signal: "emit-docs", pattern: /--emit\s+docs|emit\s*:\s*["']docs["']/i, evidence: "TypeDoc documentation-only emit policy evidence was detected." },
    { signal: "emit-none", pattern: /--emit\s+none|emit\s*:\s*["']none["']/i, evidence: "TypeDoc validation-only emit policy evidence was detected." },
    { signal: "theme", pattern: /--theme\b|["']?theme["']?\s*:|customCss|customJs|defineTheme/i, evidence: "TypeDoc theme customization evidence was detected." },
    { signal: "router", pattern: /--router\b|["']?router["']?\s*:|kind-dir|structure-dir|CategoryRouter|GroupRouter|KindRouter|StructureRouter/i, evidence: "TypeDoc router or URL structure evidence was detected." },
    { signal: "navigation", pattern: /["']?navigation["']?\s*:|includeCategories|includeGroups|includeFolders|NavigationPlugin|navbar|sidebar/i, evidence: "TypeDoc navigation evidence was detected." },
    { signal: "search", pattern: /search|JavascriptIndexPlugin|sitemap|SitemapPlugin|githubPages/i, evidence: "TypeDoc search, sitemap, or hosted-docs evidence was detected." },
    { signal: "markdown-plugin", pattern: /typedoc-plugin-markdown|name\s*:\s*["']markdown["']|--plugin\s+.*markdown/i, evidence: "TypeDoc Markdown output plugin evidence was detected." },
    { signal: "external-documents", pattern: /external documents?|documents\s*:|@document|frontmatter|\.mdx?/i, evidence: "TypeDoc external document or guide content evidence was detected." }
  ]);
}

function apiReferenceValidationSignals(sourceFiles: ApiReferenceSourceFile[]): ApiReferenceReport["validationSignals"] {
  return apiReferenceSignalFromSpecs(sourceFiles, [
    { signal: "validation-object", pattern: /["']?validation["']?\s*:\s*\{|--validation\b/i, evidence: "TypeDoc validation configuration evidence was detected." },
    { signal: "not-exported", pattern: /notExported|intentionallyNotExported|validateExports/i, evidence: "TypeDoc not-exported validation evidence was detected." },
    { signal: "invalid-link", pattern: /invalidLink|validateLinks|@link/i, evidence: "TypeDoc invalid link validation evidence was detected." },
    { signal: "invalid-path", pattern: /invalidPath|validateFilePaths|relative path/i, evidence: "TypeDoc invalid path validation evidence was detected." },
    { signal: "rewritten-link", pattern: /rewrittenLink|rewrite.*link/i, evidence: "TypeDoc rewritten link validation evidence was detected." },
    { signal: "not-documented", pattern: /notDocumented|validateDocumentation/i, evidence: "TypeDoc not-documented validation evidence was detected." },
    { signal: "treat-warnings-as-errors", pattern: /treatWarningsAsErrors|--treatWarningsAsErrors/i, evidence: "TypeDoc warning-to-error policy evidence was detected." },
    { signal: "treat-validation-warnings-as-errors", pattern: /treatValidationWarningsAsErrors|--treatValidationWarningsAsErrors/i, evidence: "TypeDoc validation-warning-to-error policy evidence was detected." },
    { signal: "required-to-be-documented", pattern: /requiredToBeDocumented/i, evidence: "TypeDoc required documentation coverage evidence was detected." },
    { signal: "intentionally-not-documented", pattern: /intentionallyNotDocumented/i, evidence: "TypeDoc intentionally undocumented allowlist evidence was detected." },
    { signal: "intentionally-not-exported", pattern: /intentionallyNotExported/i, evidence: "TypeDoc intentionally not-exported allowlist evidence was detected." },
    { signal: "packages-requiring-documentation", pattern: /packagesRequiringDocumentation/i, evidence: "TypeDoc package documentation scope evidence was detected." },
    { signal: "validation-warning-count", pattern: /validationWarningCount|validationWarning\(/i, evidence: "TypeDoc validation warning count evidence was detected." }
  ]);
}

function apiReferenceSignalFromSpecs<TSignal extends { signal: string; readiness: "ready" | "missing" | "external"; evidence: string; filePath: string | null; sourceHref: string | null }>(
  sourceFiles: ApiReferenceSourceFile[],
  specs: Array<{ signal: TSignal["signal"]; pattern: RegExp; evidence: string }>
): TSignal[] {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(`${source.filePath}\n${source.text}`));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? spec.evidence : "No matching TypeDoc evidence was found in the generated session `source/` snapshot.",
      filePath: match?.filePath ?? null,
      sourceHref: match?.sourceHref ?? null
    } as TSignal;
  });
}

function apiCategory(kind: SymbolMapReport["symbols"][number]["kind"]): ApiReferenceReport["publicSymbols"][number]["category"] {
  if (kind === "class") return "class";
  if (kind === "interface" || kind === "type") return "type";
  return "value";
}

function apiSignature(symbol: SymbolMapReport["symbols"][number]): string {
  const prefix = symbol.exported ? "export " : "";
  if (symbol.kind === "function") return `${prefix}function ${symbol.name}(...)`;
  if (symbol.kind === "class") return `${prefix}class ${symbol.name}`;
  if (symbol.kind === "interface") return `${prefix}interface ${symbol.name}`;
  if (symbol.kind === "type") return `${prefix}type ${symbol.name} = ...`;
  return `${prefix}const ${symbol.name}`;
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}
