import type { DiagramRenderingReadinessReport, MapVisualizationReadinessReport, MarkdownCodeRenderingReadinessReport, NotebookReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildMarkdownCodeRenderingReadinessReport(walk: WalkResult): Promise<MarkdownCodeRenderingReadinessReport> {
  const sourceFiles = await markdownCodeRenderingReadinessSourceFiles(walk);
  const markdownCodeRenderingSetups = markdownCodeRenderingReadinessSetups(sourceFiles);
  const rendererSignals = markdownCodeRenderingReadinessRendererSignals(sourceFiles);
  const parserSignals = markdownCodeRenderingReadinessParserSignals(sourceFiles);
  const highlightSignals = markdownCodeRenderingReadinessHighlightSignals(sourceFiles);
  const pluginSignals = markdownCodeRenderingReadinessPluginSignals(sourceFiles);
  const securitySignals = markdownCodeRenderingReadinessSecuritySignals(sourceFiles);
  const themeSignals = markdownCodeRenderingReadinessThemeSignals(sourceFiles);
  const accessibilitySignals = markdownCodeRenderingReadinessAccessibilitySignals(sourceFiles);
  const testSignals = markdownCodeRenderingReadinessTestSignals(sourceFiles);
  const packageSignals = markdownCodeRenderingReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = markdownCodeRenderingSetups.some((item) => item.readiness !== "missing");
  const hasRenderer = rendererSignals.some((item) => item.readiness === "ready") || markdownCodeRenderingSetups.some((item) => item.rendererCount > 0);
  const hasParser = parserSignals.some((item) => item.readiness === "ready") || markdownCodeRenderingSetups.some((item) => item.parserCount > 0);
  const hasHighlight = highlightSignals.some((item) => item.readiness === "ready") || markdownCodeRenderingSetups.some((item) => item.highlightCount > 0);
  const hasSecurity = securitySignals.some((item) => item.readiness === "ready") || markdownCodeRenderingSetups.some((item) => item.securityCount > 0);
  const hasTest = testSignals.some((item) => item.readiness === "ready") || markdownCodeRenderingSetups.some((item) => item.testCount > 0);

  const riskQueue: MarkdownCodeRenderingReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the Markdown renderer, parser, sanitizer, highlighter, or code-block strategy before claiming Markdown/code rendering readiness.",
      why: "Markdown/code rendering readiness starts with explicit renderer, parser, syntax highlighting, security, or package evidence.",
      relatedHref: "html/markdown-code-rendering-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasRenderer) {
    riskQueue.push({
      priority: "high",
      action: "Pair Markdown package evidence with concrete renderer components or custom code/pre mappings.",
      why: "A Markdown dependency alone does not prove that Markdown body and code blocks are rendered through traceable components.",
      relatedHref: "html/markdown-code-rendering-readiness.html"
    });
  }
  if ((hasRenderer || hasPackage) && !hasParser) {
    riskQueue.push({
      priority: "medium",
      action: "Document remark/rehype/MDX parser plugins and the allowed Markdown feature surface.",
      why: "Parser plugins define tables, raw HTML, frontmatter, and MDX behavior learners need to inspect.",
      relatedHref: "html/markdown-code-rendering-readiness.html"
    });
  }
  if ((hasRenderer || hasPackage) && !hasHighlight) {
    riskQueue.push({
      priority: "medium",
      action: "Add Shiki, Prism, highlight.js, or explicit language-class code-block highlighting evidence.",
      why: "Code lessons need a visible syntax-highlighting boundary and language-class handling.",
      relatedHref: "html/markdown-code-rendering-readiness.html"
    });
  }
  if ((hasRenderer || hasPackage) && !hasSecurity) {
    riskQueue.push({
      priority: "high",
      action: "Add skipHtml, allowedElements, disallowedElements, urlTransform, rehype-sanitize, or raw HTML risk review evidence.",
      why: "Markdown rendering can expose raw HTML, links, and XSS risks unless the sanitizer boundary is explicit.",
      relatedHref: "html/markdown-code-rendering-readiness.html"
    });
  }
  if ((hasRenderer || hasHighlight || hasPackage) && !hasTest) {
    riskQueue.push({
      priority: "medium",
      action: "Add static DOM, sanitizer, snapshot, or browser smoke tests for Markdown code blocks.",
      why: "Markdown/code rendering changes are visual and security-sensitive, so tests should cover code block DOM contracts and sanitizer policy.",
      relatedHref: "html/markdown-code-rendering-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative Markdown rendering and syntax-highlighting tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records markdown/code rendering readiness only; it does not render Markdown, execute highlighters, parse raw HTML, mutate DOM, load themes, copy code, or run the analyzed project's tests.",
    relatedHref: "html/markdown-code-rendering-readiness.html"
  });

  return {
    summary: `Markdown/code rendering readiness report: setup ${markdownCodeRenderingSetups.length}개, renderer signal ${rendererSignals.length}개, highlight signal ${highlightSignals.length}개, security signal ${securitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Markdown code rendering readiness react-markdown components remarkPlugins rehypePlugins Shiki codeToHtml createHighlighter Prism highlight language classes tests",
    markdownCodeRenderingSetups,
    rendererSignals,
    parserSignals,
    highlightSignals,
    pluginSignals,
    securitySignals,
    themeSignals,
    accessibilitySignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"react-markdown|MarkdownHooks|components|remarkPlugins|rehypePlugins|MDXProvider\" src app packages", purpose: "Inventory Markdown renderer entry points, component maps, and parser plugins." },
      { command: "rg \"allowedElements|disallowedElements|skipHtml|urlTransform|rehype-sanitize|rehypeRaw|xss\" src app packages", purpose: "Review raw HTML, link, sanitizer, and XSS policy boundaries." },
      { command: "rg \"codeToHtml|createHighlighter|codeToTokens|Prism\\.highlight|highlightElement|language-\" src app packages", purpose: "Trace syntax highlighter setup, code-block language extraction, and DOM highlighting." },
      { command: "rg \"theme|themes|bundledThemes|langs|bundledLanguages|line-numbers|copy-to-clipboard|toolbar\" src app packages", purpose: "Check theme, language bundle, and code-block plugin behavior." },
      { command: "npx vitest run", purpose: "Run local tests that cover Markdown code-block DOM contracts, sanitizer policy, snapshots, and accessibility." }
    ],
    learnerNextSteps: [
      "react-markdown, MDXProvider, MarkdownHooks, components map, pre/code override 지점을 먼저 찾으세요.",
      "remarkPlugins, remark-gfm, remark-rehype, rehypePlugins, rehype-raw 신호로 Markdown feature surface를 확인하세요.",
      "skipHtml, allowedElements, disallowedElements, urlTransform, rehype-sanitize, raw HTML/XSS 신호로 보안 경계를 확인하세요.",
      "Shiki codeToHtml/createHighlighter/codeToTokens 또는 Prism highlight/highlightElement/language-* 신호로 syntax highlighting 경계를 추적하세요.",
      "theme, themes, bundledThemes, langs, bundledLanguages, transformers, line-numbers, copy-to-clipboard 신호로 코드 블록 UI 옵션을 점검하세요.",
      "이 리포트는 정적 readiness입니다. 실제 Markdown 렌더링, syntax highlighter 실행, raw HTML parsing, DOM mutation, copy button 동작은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type MarkdownCodeRenderingReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function markdownCodeRenderingReadinessSourceFiles(walk: WalkResult): Promise<MarkdownCodeRenderingReadinessSourceFile[]> {
  const files: MarkdownCodeRenderingReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !markdownCodeRenderingReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!markdownCodeRenderingReadinessPathSignal(file.relPath) && !markdownCodeRenderingReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function markdownCodeRenderingReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return markdownCodeRenderingReadinessPathSignal(filePath)
    || /^(markdown|mdx|renderer|viewer|highlighter|syntax|code-block|codeblock|prism|shiki|remark|rehype|package\.json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml|css)$/i.test(filePath);
}

function markdownCodeRenderingReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(markdown|mdx|remark|rehype|shiki|prism|highlight|syntax|code-block|codeblock|renderer|viewer|content)(\/|\.|-|_|$)/i.test(filePath);
}

function markdownCodeRenderingReadinessContentSignal(text: string): boolean {
  return /(react-markdown|MarkdownHooks|remarkPlugins|rehypePlugins|rehypeSanitize|codeToHtml|createHighlighter|codeToTokens|Prism\.highlight|highlightElement|highlightAll|language-|@mdx-js\/react|MDXProvider|prismjs|shiki)/i.test(text);
}

function markdownCodeRenderingReadinessSetups(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["markdownCodeRenderingSetups"] {
  const rows: MarkdownCodeRenderingReadinessReport["markdownCodeRenderingSetups"] = [];
  for (const source of sourceFiles) {
    const rendererCount = countMatches(source.text, /(react-markdown|<Markdown|MarkdownHooks|components\s*=|components\s*:|code\s*\(|pre\s*\(|MDXProvider|markdown renderer|renderMarkdown)/gi);
    const parserCount = countMatches(source.text, /(remarkPlugins|remarkGfm|remark-gfm|remark-rehype|rehypePlugins|rehypeRaw|rehype-raw|frontmatter|mdx)/gi);
    const highlightCount = countMatches(source.text, /(codeToHtml|createHighlighter|codeToTokens|Prism\.highlight|highlightElement|highlightAll|language-|Token|stringify|highlight\.js|hljs\.highlight)/gi);
    const pluginCount = countMatches(source.text, /(rehypeSanitize|rehype-sanitize|transformers|transformerNotation|line-numbers|copy-to-clipboard|toolbar|show-language|katex|math)/gi);
    const securityCount = countMatches(source.text, /(skipHtml|allowedElements|disallowedElements|urlTransform|rehypeSanitize|rehype-sanitize|rehypeRaw|rehype-raw|raw html|xss|sanitize|script)/gi);
    const themeCount = countMatches(source.text, /(theme\s*:|theme=|themes|bundledThemes|bundled-themes|langs|bundledLanguages|bundled-languages|github-dark|github-light|css-theme|prism-theme)/gi);
    const accessibilityCount = countMatches(source.text, /(<pre|<code|aria-label|tabIndex|tabindex|keyboard|copy-to-clipboard|copy button|screen-reader|sr-only)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|testing-library|describe\s*\(|it\s*\(|expect\s*\(|toMatchInlineSnapshot|snapshot|xss|upload-artifact|markdown-code-rendering-traces)/gi);
    const hasSetupSignal = rendererCount + parserCount + highlightCount + pluginCount + securityCount + themeCount + accessibilityCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: markdownCodeRenderingReadinessPlatform(source),
      rendererCount,
      parserCount,
      highlightCount,
      pluginCount,
      securityCount,
      themeCount,
      accessibilityCount,
      testCount,
      readiness: (rendererCount > 0 && parserCount > 0 && securityCount > 0 && accessibilityCount > 0) || (highlightCount > 0 && (pluginCount > 0 || themeCount > 0)) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains renderer ${rendererCount}, parser ${parserCount}, highlight ${highlightCount}, plugins ${pluginCount}, security ${securityCount}, theme ${themeCount}, accessibility ${accessibilityCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function markdownCodeRenderingReadinessPlatform(source: MarkdownCodeRenderingReadinessSourceFile): MarkdownCodeRenderingReadinessReport["markdownCodeRenderingSetups"][number]["platform"] {
  if (/react-markdown|MarkdownHooks|<Markdown|remarkPlugins|rehypePlugins/i.test(source.text)) return "react-markdown";
  if (/shiki|codeToHtml|createHighlighter|codeToTokens|bundledLanguages|bundledThemes/i.test(source.text)) return "shiki";
  if (/prismjs|Prism\.highlight|highlightElement|highlightAll|prism-/i.test(source.text)) return "prism";
  if (/highlight\.js|hljs\.highlight|from ['"]highlight\.js/i.test(source.text)) return "highlightjs";
  if (/@mdx-js\/react|MDXProvider|\.mdx/i.test(source.text) || /\.mdx$/i.test(source.filePath)) return "mdx";
  if (/markdown|code block|syntax|highlight/i.test(source.text) || markdownCodeRenderingReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function markdownCodeRenderingReadinessRendererSignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["rendererSignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["rendererSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "react-markdown", pattern: /react-markdown|<Markdown\b/i, evidence: "react-markdown evidence was detected." },
    { signal: "markdown-hooks", pattern: /MarkdownHooks/i, evidence: "MarkdownHooks evidence was detected." },
    { signal: "components-map", pattern: /components\s*=|components\s*:/i, evidence: "components map evidence was detected." },
    { signal: "code-component", pattern: /\bcode\s*\(|<code\b|className[\s\S]{0,80}language-/i, evidence: "code component evidence was detected." },
    { signal: "pre-code", pattern: /<pre\b|\bpre\s*\(|<code\b|\bcode\s*\(/i, evidence: "pre/code element evidence was detected." },
    { signal: "mdx-provider", pattern: /MDXProvider|@mdx-js\/react/i, evidence: "MDX provider evidence was detected." },
    { signal: "custom-renderer", pattern: /renderMarkdown|markdown renderer|markdownToHtml/i, evidence: "custom renderer evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "renderer", "signal");
}

function markdownCodeRenderingReadinessParserSignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["parserSignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["parserSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "remark-plugins", pattern: /remarkPlugins/i, evidence: "remarkPlugins evidence was detected." },
    { signal: "remark-gfm", pattern: /remarkGfm|remark-gfm/i, evidence: "remark-gfm evidence was detected." },
    { signal: "remark-rehype", pattern: /remark-rehype|remarkRehype|rehypePlugins/i, evidence: "remark-rehype evidence was detected." },
    { signal: "rehype-plugins", pattern: /rehypePlugins/i, evidence: "rehypePlugins evidence was detected." },
    { signal: "rehype-raw", pattern: /rehypeRaw|rehype-raw/i, evidence: "rehype-raw evidence was detected." },
    { signal: "frontmatter", pattern: /frontmatter|gray-matter|remark-frontmatter/i, evidence: "frontmatter evidence was detected." },
    { signal: "mdx", pattern: /@mdx-js|MDXProvider|\.mdx/i, evidence: "MDX evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "parser", "signal");
}

function markdownCodeRenderingReadinessHighlightSignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["highlightSignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["highlightSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "shiki-code-to-html", pattern: /codeToHtml/i, evidence: "Shiki codeToHtml evidence was detected." },
    { signal: "create-highlighter", pattern: /createHighlighter/i, evidence: "createHighlighter evidence was detected." },
    { signal: "code-to-tokens", pattern: /codeToTokens/i, evidence: "codeToTokens evidence was detected." },
    { signal: "prism-highlight", pattern: /Prism\.highlight/i, evidence: "Prism.highlight evidence was detected." },
    { signal: "highlight-element", pattern: /highlightElement|highlightAll/i, evidence: "highlightElement/highlightAll evidence was detected." },
    { signal: "language-class", pattern: /language-[A-Za-z0-9_-]+|language-\$|language-\(|language-\{/i, evidence: "language-* class evidence was detected." },
    { signal: "token-stream", pattern: /Token|stringify|TokenStream/i, evidence: "token stream evidence was detected." },
    { signal: "highlightjs-highlight", pattern: /highlight\.js|hljs\.highlight|hljs\.highlightElement/i, evidence: "highlight.js evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "highlight", "signal");
}

function markdownCodeRenderingReadinessPluginSignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["pluginSignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["pluginSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rehype-sanitize", pattern: /rehypeSanitize|rehype-sanitize/i, evidence: "rehype-sanitize evidence was detected." },
    { signal: "transformers", pattern: /transformers|transformerNotation/i, evidence: "Shiki transformer evidence was detected." },
    { signal: "line-numbers", pattern: /line-numbers|prism-line-numbers/i, evidence: "line-numbers plugin evidence was detected." },
    { signal: "copy-to-clipboard", pattern: /copy-to-clipboard|copy button|prism-copy-to-clipboard/i, evidence: "copy-to-clipboard plugin evidence was detected." },
    { signal: "toolbar", pattern: /toolbar|prism-toolbar/i, evidence: "toolbar plugin evidence was detected." },
    { signal: "show-language", pattern: /show-language|showLanguage/i, evidence: "show-language plugin evidence was detected." },
    { signal: "math-katex", pattern: /katex|remark-math|rehype-katex/i, evidence: "math/KaTeX plugin evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "plugin", "signal");
}

function markdownCodeRenderingReadinessSecuritySignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["securitySignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "skip-html", pattern: /skipHtml/i, evidence: "skipHtml evidence was detected." },
    { signal: "allowed-elements", pattern: /allowedElements/i, evidence: "allowedElements evidence was detected." },
    { signal: "disallowed-elements", pattern: /disallowedElements/i, evidence: "disallowedElements evidence was detected." },
    { signal: "url-transform", pattern: /urlTransform/i, evidence: "urlTransform evidence was detected." },
    { signal: "rehype-sanitize", pattern: /rehypeSanitize|rehype-sanitize/i, evidence: "rehype-sanitize evidence was detected." },
    { signal: "raw-html-risk", pattern: /rehypeRaw|rehype-raw|raw html|dangerouslySetInnerHTML/i, evidence: "raw HTML risk evidence was detected." },
    { signal: "xss", pattern: /xss|javascript:|<script|sanitize/i, evidence: "XSS/sanitizer evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "security", "signal");
}

function markdownCodeRenderingReadinessThemeSignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["themeSignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["themeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "theme", pattern: /\btheme\s*:|\btheme=|github-dark|github-light/i, evidence: "theme evidence was detected." },
    { signal: "themes", pattern: /\bthemes\b/i, evidence: "themes evidence was detected." },
    { signal: "bundled-themes", pattern: /bundledThemes|bundled-themes/i, evidence: "bundled themes evidence was detected." },
    { signal: "langs", pattern: /\blangs\b|lang\s*:/i, evidence: "language list evidence was detected." },
    { signal: "bundled-languages", pattern: /bundledLanguages|bundled-languages/i, evidence: "bundled languages evidence was detected." },
    { signal: "css-theme", pattern: /prism-theme|shiki-theme|\.css|code-theme/i, evidence: "CSS theme evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "theme", "signal");
}

function markdownCodeRenderingReadinessAccessibilitySignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pre-code", pattern: /<pre\b|<code\b|\bpre\s*\(|\bcode\s*\(/i, evidence: "pre/code evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "tabindex", pattern: /tabIndex|tabindex/i, evidence: "tabindex evidence was detected." },
    { signal: "keyboard", pattern: /keyboard|keydown|tabIndex|tabindex/i, evidence: "keyboard focus evidence was detected." },
    { signal: "copy-button", pattern: /copy-to-clipboard|copy button|clipboard/i, evidence: "copy button evidence was detected." },
    { signal: "screen-reader", pattern: /screen-reader|sr-only|aria-live/i, evidence: "screen-reader evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function markdownCodeRenderingReadinessTestSignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["testSignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|getByText|getByLabelText|getByRole/i, evidence: "Testing Library evidence was detected." },
    { signal: "snapshot-test", pattern: /toMatchInlineSnapshot|snapshot/i, evidence: "snapshot test evidence was detected." },
    { signal: "security-test", pattern: /xss|<script|rehypeSanitize|skipHtml|urlTransform/i, evidence: "security test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|markdown-code-rendering-traces|trace|screenshot/i, evidence: "artifact upload evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function markdownCodeRenderingReadinessPackageSignals(sourceFiles: MarkdownCodeRenderingReadinessSourceFile[]): MarkdownCodeRenderingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MarkdownCodeRenderingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "react-markdown", pattern: /["@']react-markdown["@']|from ["']react-markdown["']/i, evidence: "react-markdown package evidence was detected." },
    { signal: "remark-gfm", pattern: /["@']remark-gfm["@']|from ["']remark-gfm["']/i, evidence: "remark-gfm package evidence was detected." },
    { signal: "rehype-raw", pattern: /["@']rehype-raw["@']|from ["']rehype-raw["']/i, evidence: "rehype-raw package evidence was detected." },
    { signal: "rehype-sanitize", pattern: /["@']rehype-sanitize["@']|from ["']rehype-sanitize["']/i, evidence: "rehype-sanitize package evidence was detected." },
    { signal: "shiki", pattern: /["@']shiki["@']|from ["']shiki["']/i, evidence: "Shiki package evidence was detected." },
    { signal: "@shikijs/transformers", pattern: /["@']@shikijs\/transformers["@']|from ["']@shikijs\/transformers["']/i, evidence: "@shikijs/transformers package evidence was detected." },
    { signal: "prismjs", pattern: /["@']prismjs["@']|from ["']prismjs["']|prismjs\//i, evidence: "PrismJS package evidence was detected." },
    { signal: "@mdx-js/react", pattern: /["@']@mdx-js\/react["@']|from ["']@mdx-js\/react["']/i, evidence: "@mdx-js/react package evidence was detected." },
    { signal: "highlight.js", pattern: /["@']highlight\.js["@']|from ["']highlight\.js["']/i, evidence: "highlight.js package evidence was detected." }
  ];
  return markdownCodeRenderingReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function markdownCodeRenderingReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: MarkdownCodeRenderingReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/markdown-code-rendering-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildNotebookReadinessReport(walk: WalkResult): Promise<NotebookReadinessReport> {
  const sourceFiles = await notebookReadinessSourceFiles(walk);
  const notebookSetups = notebookReadinessSetups(sourceFiles);
  const platformSignals = notebookReadinessPlatformSignals(sourceFiles);
  const fileSignals = notebookReadinessFileSignals(sourceFiles);
  const kernelSignals = notebookReadinessKernelSignals(sourceFiles);
  const executionSignals = notebookReadinessExecutionSignals(sourceFiles);
  const dependencySignals = notebookReadinessDependencySignals(sourceFiles);
  const interactivitySignals = notebookReadinessInteractivitySignals(sourceFiles);
  const exportSignals = notebookReadinessExportSignals(sourceFiles);
  const reproducibilitySignals = notebookReadinessReproducibilitySignals(sourceFiles);
  const workflowSignals = notebookReadinessWorkflowSignals(sourceFiles);
  const packageSignals = notebookReadinessPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasNotebook = notebookSetups.some((item) => item.readiness !== "missing") || fileSignals.some((item) => item.readiness === "ready");
  const hasKernel = kernelSignals.some((item) => item.readiness === "ready") || notebookSetups.some((item) => item.kernelCount > 0);
  const hasExecution = executionSignals.some((item) => item.readiness === "ready") || notebookSetups.some((item) => item.executionCount > 0);
  const hasReproducibility = reproducibilitySignals.some((item) => item.readiness === "ready") || notebookSetups.some((item) => item.reproducibilityCount > 0);
  const hasExport = exportSignals.some((item) => item.readiness === "ready") || notebookSetups.some((item) => item.exportCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || notebookSetups.some((item) => item.workflowCount > 0);

  const riskQueue: NotebookReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasNotebook) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the notebook strategy before claiming literate computing readiness.",
      why: "Notebook readiness starts with visible Jupyter, marimo, Quarto, Jupytext, or notebook-like source files.",
      relatedHref: "html/notebook-readiness.html"
    });
  }
  if (hasNotebook && !hasKernel) {
    riskQueue.push({
      priority: "high",
      action: "Record kernelspec, language_info, Quarto jupyter engine, Python/R kernel, or runtime environment evidence.",
      why: "Notebook cells are hard to reproduce when the intended execution kernel is invisible.",
      relatedHref: "html/notebook-readiness.html"
    });
  }
  if (hasNotebook && !hasExecution) {
    riskQueue.push({
      priority: "medium",
      action: "Document execute counts, nbconvert execution, Papermill parameters, Quarto execute config, or marimo run behavior.",
      why: "Learners need to know whether notebook outputs are executed, parameterized, cached, or only hand-authored.",
      relatedHref: "html/notebook-readiness.html"
    });
  }
  if (hasNotebook && !hasReproducibility) {
    riskQueue.push({
      priority: "medium",
      action: "Add Jupytext, Binder, freeze/cache, parameters, committed outputs, or deterministic-cell evidence.",
      why: "Notebook projects are fragile when code, outputs, and environment assumptions cannot be replayed.",
      relatedHref: "html/notebook-readiness.html"
    });
  }
  if (hasNotebook && !hasExport) {
    riskQueue.push({
      priority: "low",
      action: "Record whether HTML/PDF export, nbconvert, marimo export, Quarto render, or artifact upload is intentionally used or absent.",
      why: "Notebook learning artifacts often need shareable rendered outputs in addition to editable source.",
      relatedHref: "html/notebook-readiness.html"
    });
  }
  if (hasNotebook && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add CI or local workflow evidence for notebook execution, parameter runs, rendering, export, and artifact retention.",
      why: "Notebook readiness is stronger when execution and rendering can be repeated outside a local editor session.",
      relatedHref: "html/notebook-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run notebook execution and rendering commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records notebook readiness only; it does not execute notebooks, start Jupyter servers, run kernels, render Quarto, launch marimo, install packages, or open Binder sessions.",
    relatedHref: "html/notebook-readiness.html"
  });

  return {
    summary: `Notebook readiness report: setup ${notebookSetups.length}개, platform signal ${platformSignals.length}개, execution signal ${executionSignals.length}개, reproducibility signal ${reproducibilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Notebook readiness Jupyter ipynb nbformat kernelspec nbconvert papermill jupytext Binder marimo @app.cell mo.ui mo.md Quarto qmd render execute freeze cache outputs widgets exports",
    notebookSetups,
    platformSignals,
    fileSignals,
    kernelSignals,
    executionSignals,
    dependencySignals,
    interactivitySignals,
    exportSignals,
    reproducibilitySignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"ipynb|nbformat|kernelspec|language_info|jupytext|Binder|mybinder\" .", purpose: "Inventory Jupyter notebook files, kernels, metadata, text pairing, and Binder launch evidence." },
      { command: "rg \"nbconvert|papermill|execute_count|parameters|outputs\" .", purpose: "Review notebook execution, parameterization, and output reproducibility surfaces." },
      { command: "rg \"marimo|@app.cell|mo.ui|mo.md|app.run|marimo export\" .", purpose: "Map marimo reactive notebook cells, UI controls, markdown, app runtime, and export surfaces." },
      { command: "rg \"quarto|_quarto.yml|qmd|quarto render|execute:|freeze:|cache:|jupyter:\" .", purpose: "Map Quarto projects, QMD inputs, execution config, freeze/cache, kernels, and render workflows." },
      { command: "rg \"upload-artifact|html|pdf|notebook-html|notebook-pdf\" .github .", purpose: "Check shareable notebook export artifacts and CI retention." }
    ],
    learnerNextSteps: [
      "먼저 `.ipynb`, marimo `.py`, Quarto `.qmd`, `_quarto.yml`, Jupytext pairing 파일을 찾으세요.",
      "kernelspec, language_info, jupyter engine, Python/R kernel 신호로 실행 환경을 확인하세요.",
      "nbconvert, Papermill, Quarto execute/freeze/cache, marimo run 신호로 실행과 재현 방식을 구분하세요.",
      "ipywidgets, display, plot output, mo.ui, mo.md, Quarto widget 신호로 interactive notebook 표면을 확인하세요.",
      "HTML/PDF export, artifact upload, Binder, outputs, parameters, Jupytext 신호로 공유와 재현성 경로를 점검하세요.",
      "이 리포트는 정적 readiness입니다. 실제 notebook 실행, kernel 시작, Quarto render, marimo launch, package install은 안전한 환경에서 별도로 검증하세요."
    ]
  };
}

type NotebookReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function notebookReadinessSourceFiles(walk: WalkResult): Promise<NotebookReadinessSourceFile[]> {
  const files: NotebookReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !notebookReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!notebookReadinessPathSignal(file.relPath) && !notebookReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function notebookReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return notebookReadinessPathSignal(filePath)
    || /^(_quarto\.ya?ml|jupytext\.toml|requirements\.txt|environment\.ya?ml|pyproject\.toml|package\.json|Dockerfile|runtime\.txt|postBuild|apt\.txt)$/i.test(base)
    || /\.(ipynb|qmd|py|r|jl|md|mdx|json|ya?ml|toml|txt)$/i.test(filePath);
}

function notebookReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(notebooks?|jupyter|ipynb|jupytext|binder|\.binder|marimo|quarto|qmd|reports?|analysis)(\/|\.|-|_|$)|(^|\/)_quarto\.ya?ml$|\.github\/workflows/i.test(filePath);
}

function notebookReadinessContentSignal(text: string): boolean {
  return /nbformat|kernelspec|language_info|jupyter|nbconvert|papermill|jupytext|Binder|mybinder|@app\.cell|marimo|mo\.ui|mo\.md|quarto|\.qmd|execute:|freeze:|cache:|ipywidgets|IPython\.display/i.test(text);
}

function notebookReadinessSetups(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["notebookSetups"] {
  const rows: NotebookReadinessReport["notebookSetups"] = [];
  for (const source of sourceFiles) {
    const ipynbCellCount = countMatches(source.text, /"cell_type"\s*:/gi);
    const qmdCellCount = countMatches(source.text, /```\{(?:python|r|julia|bash|ojs)/gi);
    const marimoCellCount = countMatches(source.text, /@app\.cell|app\.cell/gi);
    const cellCount = ipynbCellCount + qmdCellCount + marimoCellCount;
    const codeCellCount = countMatches(source.text, /"cell_type"\s*:\s*"code"|```\{(?:python|r|julia|bash|ojs)|@app\.cell|app\.cell/gi);
    const markdownCellCount = countMatches(source.text, /"cell_type"\s*:\s*"markdown"|mo\.md|markdown|# /gi);
    const outputCount = countMatches(source.text, /"outputs"\s*:|"output_type"\s*:|execute_result|display_data|stream|to html|to pdf|export html|format:\s*html/gi);
    const kernelCount = countMatches(source.text, /kernelspec|language_info|jupyter:|ipykernel|python3|IRkernel|engine:\s*jupyter/gi);
    const executionCount = countMatches(source.text, /execution_count|nbconvert\s+--execute|papermill|execute:|quarto render|app\.run|marimo run|cell-order|run:/gi);
    const dependencyCount = countMatches(source.text, /notebook|jupyterlab|nbconvert|nbformat|papermill|jupytext|marimo|quarto|ipywidgets|dependencies/gi);
    const interactivityCount = countMatches(source.text, /ipywidgets|widgets\.|IPython\.display|display\(|mo\.ui|mo\.md|plot\(|altair|plotly|bokeh|observable|ojs/gi);
    const exportCount = countMatches(source.text, /nbconvert|--to html|--to pdf|export html|export pdf|quarto render|format:\s*(html|pdf)|upload-artifact|artifact/gi);
    const reproducibilityCount = countMatches(source.text, /jupytext|Binder|mybinder|freeze:|cache:|parameters|outputs|execution_count|deterministic|environment\.ya?ml|requirements\.txt/gi);
    const workflowCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|uses:\s*actions\/|nbconvert|papermill|quarto render|marimo export|upload-artifact/gi)
      + (source.filePath.includes(".github/workflows") ? 1 : 0);
    const hasSetupSignal = cellCount + codeCellCount + outputCount + kernelCount + executionCount + dependencyCount + interactivityCount + exportCount + reproducibilityCount + workflowCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: notebookReadinessPlatform(source),
      cellCount,
      codeCellCount,
      markdownCellCount,
      outputCount,
      kernelCount,
      executionCount,
      dependencyCount,
      interactivityCount,
      exportCount,
      reproducibilityCount,
      workflowCount,
      readiness: (cellCount > 0 || notebookReadinessPathSignal(source.filePath)) && (kernelCount > 0 || executionCount > 0 || exportCount > 0) && (reproducibilityCount > 0 || dependencyCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains cells ${cellCount}, code ${codeCellCount}, markdown ${markdownCellCount}, outputs ${outputCount}, kernels ${kernelCount}, execution ${executionCount}, dependencies ${dependencyCount}, interactivity ${interactivityCount}, exports ${exportCount}, reproducibility ${reproducibilityCount}, workflow ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function notebookReadinessPlatform(source: NotebookReadinessSourceFile): NotebookReadinessReport["notebookSetups"][number]["platform"] {
  if (/\.ipynb$/i.test(source.filePath) || /nbformat|kernelspec/i.test(source.text)) return "jupyter";
  if (/marimo/i.test(source.filePath) || /@app\.cell|marimo|mo\.ui|mo\.md|app\.run/i.test(source.text)) return "marimo";
  if (/\.qmd$/i.test(source.filePath) || /_quarto\.ya?ml$/i.test(source.filePath) || /quarto|execute:|freeze:|cache:|jupyter:/i.test(source.text)) return "quarto";
  if (/jupytext|# %%/i.test(source.text)) return "jupytext";
  if (/jupyter|nbconvert|papermill/i.test(source.text)) return "jupyter";
  if (/notebook|literate|cell/i.test(source.text)) return "custom";
  return "unknown";
}

function notebookReadinessPlatformSignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["platformSignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "jupyter", pattern: /\.ipynb$|nbformat|kernelspec|jupyter|nbconvert|papermill/i, evidence: "Jupyter notebook evidence was detected." },
    { signal: "marimo", pattern: /marimo|@app\.cell|mo\.ui|mo\.md|app\.run/i, evidence: "marimo notebook evidence was detected." },
    { signal: "quarto", pattern: /\.qmd$|_quarto\.ya?ml|quarto|execute:|freeze:|cache:/i, evidence: "Quarto notebook/report evidence was detected." },
    { signal: "jupytext", pattern: /jupytext|# %%|py:percent/i, evidence: "Jupytext paired-notebook evidence was detected." },
    { signal: "custom", pattern: /literate computing|notebook report|interactive notebook/i, evidence: "custom notebook evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function notebookReadinessFileSignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["fileSignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["fileSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ipynb", pattern: /\.ipynb$|nbformat/i, evidence: "ipynb file evidence was detected." },
    { signal: "py-percent", pattern: /# %%|py:percent|formats:\s*ipynb,py/i, evidence: "percent-format paired notebook evidence was detected." },
    { signal: "marimo-py", pattern: /marimo.*\.py$|@app\.cell|marimo\.App/i, evidence: "marimo Python notebook evidence was detected." },
    { signal: "qmd", pattern: /\.qmd$|```\{python|```\{r/i, evidence: "QMD notebook/report evidence was detected." },
    { signal: "quarto-project", pattern: /_quarto\.ya?ml|project:\s*\n|quarto/i, evidence: "Quarto project evidence was detected." },
    { signal: "binder", pattern: /Binder|mybinder|(^|\/)(binder|\.binder)(\/|$)|runtime\.txt|postBuild/i, evidence: "Binder launch/environment evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "file", "signal");
}

function notebookReadinessKernelSignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["kernelSignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["kernelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kernelspec", pattern: /kernelspec/i, evidence: "kernelspec metadata evidence was detected." },
    { signal: "language-info", pattern: /language_info|language-info/i, evidence: "language info evidence was detected." },
    { signal: "jupyter-kernel", pattern: /jupyter:|ipykernel|kernel_name|kernelName|python3/i, evidence: "Jupyter kernel evidence was detected." },
    { signal: "quarto-jupyter", pattern: /jupyter:\s*python|engine:\s*jupyter|execute:/i, evidence: "Quarto Jupyter execution evidence was detected." },
    { signal: "python-kernel", pattern: /python3|ipykernel|language_info[\s\S]{0,120}python/i, evidence: "Python kernel evidence was detected." },
    { signal: "r-kernel", pattern: /IRkernel|jupyter:\s*r|```\{r\}/i, evidence: "R kernel evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "kernel", "signal");
}

function notebookReadinessExecutionSignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["executionSignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["executionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "execute-count", pattern: /execution_count/i, evidence: "notebook execution-count evidence was detected." },
    { signal: "nbconvert-execute", pattern: /nbconvert[\s\S]{0,120}--execute|--execute[\s\S]{0,120}nbconvert/i, evidence: "nbconvert execute evidence was detected." },
    { signal: "papermill", pattern: /papermill|parameters/i, evidence: "Papermill or parameter execution evidence was detected." },
    { signal: "quarto-execute", pattern: /execute:|quarto render|freeze:|cache:/i, evidence: "Quarto execute/render evidence was detected." },
    { signal: "marimo-run", pattern: /app\.run|marimo run|marimo edit/i, evidence: "marimo run/edit evidence was detected." },
    { signal: "cell-order", pattern: /cell[-_ ]?order|deterministic|reactive/i, evidence: "cell-order or reactive execution evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "execution", "signal");
}

function notebookReadinessDependencySignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["dependencySignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["dependencySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "notebook", pattern: /"notebook"|notebook\s*[<=>~]|notebook,/i, evidence: "notebook dependency evidence was detected." },
    { signal: "jupyterlab", pattern: /"jupyterlab"|jupyterlab\s*[<=>~]|jupyterlab,/i, evidence: "JupyterLab dependency evidence was detected." },
    { signal: "nbconvert", pattern: /"nbconvert"|nbconvert\s*[<=>~]|nbconvert,/i, evidence: "nbconvert dependency evidence was detected." },
    { signal: "nbformat", pattern: /"nbformat"|nbformat\s*[<=>~]|nbformat,/i, evidence: "nbformat dependency evidence was detected." },
    { signal: "papermill", pattern: /"papermill"|papermill\s*[<=>~]|papermill,/i, evidence: "Papermill dependency evidence was detected." },
    { signal: "jupytext", pattern: /"jupytext"|jupytext\s*[<=>~]|jupytext,/i, evidence: "Jupytext dependency evidence was detected." },
    { signal: "marimo", pattern: /"marimo"|marimo\s*[<=>~]|marimo,/i, evidence: "marimo dependency evidence was detected." },
    { signal: "quarto", pattern: /"quarto"|quarto\s*[<=>~]|quarto,/i, evidence: "Quarto dependency evidence was detected." },
    { signal: "ipywidgets", pattern: /"ipywidgets"|ipywidgets|widgets\./i, evidence: "ipywidgets dependency/import evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "dependency", "signal");
}

function notebookReadinessInteractivitySignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["interactivitySignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["interactivitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ipywidgets", pattern: /ipywidgets|widgets\./i, evidence: "ipywidgets evidence was detected." },
    { signal: "display", pattern: /IPython\.display|display\(/i, evidence: "display output evidence was detected." },
    { signal: "plot-output", pattern: /plot\(|altair|plotly|bokeh|matplotlib|seaborn|hvplot/i, evidence: "plot output evidence was detected." },
    { signal: "marimo-ui", pattern: /mo\.ui|marimo\.ui/i, evidence: "marimo UI evidence was detected." },
    { signal: "marimo-markdown", pattern: /mo\.md|marimo\.md/i, evidence: "marimo markdown evidence was detected." },
    { signal: "quarto-widget", pattern: /ojs|observable|htmlwidgets|shiny|widget/i, evidence: "Quarto widget evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "interactivity", "signal");
}

function notebookReadinessExportSignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["exportSignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["exportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "html-export", pattern: /--to html|format:\s*html|export html|html-export|notebook-html/i, evidence: "HTML export evidence was detected." },
    { signal: "pdf-export", pattern: /--to pdf|format:\s*pdf|export pdf|notebook-pdf/i, evidence: "PDF export evidence was detected." },
    { signal: "nbconvert", pattern: /nbconvert/i, evidence: "nbconvert export evidence was detected." },
    { signal: "marimo-export", pattern: /marimo export|export html[\s\S]{0,80}marimo/i, evidence: "marimo export evidence was detected." },
    { signal: "quarto-render", pattern: /quarto render|format:\s*(html|pdf)|_quarto\.ya?ml/i, evidence: "Quarto render evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|actions\/upload-artifact|artifact/i, evidence: "artifact upload evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "export", "signal");
}

function notebookReadinessReproducibilitySignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["reproducibilitySignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["reproducibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "jupytext", pattern: /jupytext|formats:\s*ipynb,py|py:percent|# %%/i, evidence: "Jupytext pairing evidence was detected." },
    { signal: "binder", pattern: /Binder|mybinder|(^|\/)(binder|\.binder)(\/|$)|runtime\.txt|postBuild/i, evidence: "Binder reproducibility evidence was detected." },
    { signal: "freeze", pattern: /freeze:\s*(auto|true)|quarto freeze/i, evidence: "freeze evidence was detected." },
    { signal: "cache", pattern: /cache:\s*true|cache:|\.quarto|jupyter-cache/i, evidence: "cache evidence was detected." },
    { signal: "parameters", pattern: /parameters|papermill|tags:\s*\[?parameters/i, evidence: "parameter evidence was detected." },
    { signal: "outputs", pattern: /"outputs"\s*:|output_type|execute_result|display_data/i, evidence: "committed output evidence was detected." },
    { signal: "deterministic-cells", pattern: /deterministic|reactive|cell[-_ ]?order|no hidden state/i, evidence: "deterministic cell evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "reproducibility", "signal");
}

function notebookReadinessWorkflowSignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|uses:\s*actions\/|runs-on:/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "nbconvert", pattern: /nbconvert/i, evidence: "nbconvert workflow evidence was detected." },
    { signal: "papermill", pattern: /papermill/i, evidence: "Papermill workflow evidence was detected." },
    { signal: "marimo-export", pattern: /marimo export/i, evidence: "marimo export workflow evidence was detected." },
    { signal: "quarto-render", pattern: /quarto render/i, evidence: "Quarto render workflow evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact/i, evidence: "artifact upload workflow evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function notebookReadinessPackageSignals(sourceFiles: NotebookReadinessSourceFile[]): NotebookReadinessReport["packageSignals"] {
  const specs: Array<{ signal: NotebookReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "notebook", pattern: /"notebook"|notebook\s*[<=>~]|notebook,/i, evidence: "notebook package evidence was detected." },
    { signal: "jupyterlab", pattern: /"jupyterlab"|jupyterlab\s*[<=>~]|jupyterlab,/i, evidence: "JupyterLab package evidence was detected." },
    { signal: "nbconvert", pattern: /"nbconvert"|nbconvert\s*[<=>~]|nbconvert,/i, evidence: "nbconvert package evidence was detected." },
    { signal: "nbformat", pattern: /"nbformat"|nbformat\s*[<=>~]|nbformat,/i, evidence: "nbformat package evidence was detected." },
    { signal: "papermill", pattern: /"papermill"|papermill\s*[<=>~]|papermill,/i, evidence: "Papermill package evidence was detected." },
    { signal: "jupytext", pattern: /"jupytext"|jupytext\s*[<=>~]|jupytext,/i, evidence: "Jupytext package evidence was detected." },
    { signal: "marimo", pattern: /"marimo"|marimo\s*[<=>~]|marimo,/i, evidence: "marimo package evidence was detected." },
    { signal: "quarto", pattern: /"quarto"|quarto\s*[<=>~]|quarto,/i, evidence: "Quarto package evidence was detected." }
  ];
  return notebookReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function notebookReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: NotebookReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/notebook-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildMapVisualizationReadinessReport(walk: WalkResult): Promise<MapVisualizationReadinessReport> {
  const sourceFiles = await mapVisualizationSourceFiles(walk);
  const mapSetups = mapVisualizationSetups(sourceFiles);
  const platformSignals = mapVisualizationPlatformSignals(sourceFiles);
  const containerSignals = mapVisualizationContainerSignals(sourceFiles);
  const tileSignals = mapVisualizationTileSignals(sourceFiles);
  const layerSignals = mapVisualizationLayerSignals(sourceFiles);
  const deckGlSignals = mapVisualizationDeckGlSignals(sourceFiles);
  const dataSignals = mapVisualizationDataSignals(sourceFiles);
  const viewportSignals = mapVisualizationViewportSignals(sourceFiles);
  const interactionSignals = mapVisualizationInteractionSignals(sourceFiles);
  const controlSignals = mapVisualizationControlSignals(sourceFiles);
  const styleSignals = mapVisualizationStyleSignals(sourceFiles);
  const workflowSignals = mapVisualizationWorkflowSignals(sourceFiles);
  const packageSignals = mapVisualizationPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasMap = mapSetups.some((item) => item.readiness !== "missing");
  const hasTiles = tileSignals.some((item) => item.readiness === "ready") || mapSetups.some((item) => item.tileCount > 0);
  const hasViewport = viewportSignals.some((item) => item.readiness === "ready") || mapSetups.some((item) => item.viewportCount > 0);
  const hasData = dataSignals.some((item) => item.readiness === "ready") || mapSetups.some((item) => item.geometryCount > 0 || item.sourceCount > 0);
  const hasInteractions = interactionSignals.some((item) => item.readiness === "ready") || mapSetups.some((item) => item.interactionCount > 0);

  const riskQueue: MapVisualizationReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasMap) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the map visualization strategy before claiming geospatial UI readiness.",
      why: "Map visualization readiness starts with visible MapLibre, Leaflet, deck.gl, Mapbox, Google Maps, or custom map source files.",
      relatedHref: "html/map-visualization-readiness.html"
    });
  }
  if (hasMap && !hasTiles) {
    riskQueue.push({
      priority: "high",
      action: "Record tile URL, style JSON, vector/raster source, TileLayer, or tile service evidence.",
      why: "Interactive maps are hard to reproduce when the basemap or tile source is invisible.",
      relatedHref: "html/map-visualization-readiness.html"
    });
  }
  if (hasMap && !hasViewport) {
    riskQueue.push({
      priority: "medium",
      action: "Document center/zoom, bounds, fitBounds, viewState, pitch, or bearing defaults.",
      why: "Learners need viewport defaults before they can understand what geography the map opens to.",
      relatedHref: "html/map-visualization-readiness.html"
    });
  }
  if (hasMap && !hasData) {
    riskQueue.push({
      priority: "medium",
      action: "Record GeoJSON, coordinates, feature properties, MVT, source data, or bounds data evidence.",
      why: "Map UI readiness depends on knowing which geographic data feeds layers and interactions.",
      relatedHref: "html/map-visualization-readiness.html"
    });
  }
  if (hasMap && !hasInteractions) {
    riskQueue.push({
      priority: "low",
      action: "Document click, hover, picking, popup, tooltip, or feature-query behavior.",
      why: "Learners need to distinguish passive basemaps from interactive geospatial applications.",
      relatedHref: "html/map-visualization-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Open map canvases, fetch tiles, request geolocation, and use provider tokens only in a trusted browser session.",
    why: "RepoTutor records map visualization readiness only; it does not open map canvases, fetch tiles, contact geocoders, use map tokens, render WebGL, request geolocation, or run the analyzed project's tests.",
    relatedHref: "html/map-visualization-readiness.html"
  });

  return {
    summary: `Map visualization readiness report: setup ${mapSetups.length}개, platform signal ${platformSignals.length}개, tile signal ${tileSignals.length}개, layer signal ${layerSignals.length}개, deck.gl signal ${deckGlSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Map visualization readiness MapLibre maplibregl Leaflet L.map deck.gl Deck DeckGL MapView layer catalog picking tooltip layerFilter overlays widgets test-utils tileLayer addLayer addSource GeoJSON marker popup viewport bounds controls tokens",
    mapSetups,
    platformSignals,
    containerSignals,
    tileSignals,
    layerSignals,
    deckGlSignals,
    dataSignals,
    viewportSignals,
    interactionSignals,
    controlSignals,
    styleSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"maplibregl|new maplibregl.Map|addSource|addLayer|NavigationControl|GeolocateControl|fitBounds\" .", purpose: "Inventory MapLibre map creation, sources, layers, controls, and viewport behavior." },
      { command: "rg \"L\\.map|tileLayer|L\\.marker|L\\.geoJSON|control\\.layers|fitBounds|setView\" .", purpose: "Review Leaflet map creation, tiles, markers, GeoJSON, layer controls, and bounds." },
      { command: "rg \"Deck\\(|new Deck|DeckGL|MapView|GeoJsonLayer|ScatterplotLayer|MVTLayer|HeatmapLayer|layerFilter|pickable|getTooltip|onHover|onClick|MapboxOverlay|GoogleMapsOverlay\" .", purpose: "Map deck.gl views, layer catalog, overlays, view state, filtering, tooltip, and picking interactions." },
      { command: "rg \"GeoJSON|FeatureCollection|coordinates|longitude|latitude|bounds|bbox|MVTLayer|vector tile\" .", purpose: "Check geospatial data and coordinate evidence feeding map layers." },
      { command: "rg \"MAPBOX_TOKEN|accessToken|apiKey|attribution|style.json|sprite|glyphs|upload-artifact|playwright\" .", purpose: "Check token, attribution, style assets, and static map QA workflow evidence." }
    ],
    learnerNextSteps: [
      "먼저 MapLibre, Leaflet, deck.gl, Mapbox, Google Maps, custom map wrapper 중 어떤 플랫폼이 쓰였는지 확인하세요.",
      "container/canvas, tile URL/style JSON, GeoJSON/source/layer, center/zoom/bounds 순서로 map bootstrap을 따라가세요.",
      "marker, popup, click, hover, picking, queryRenderedFeatures 신호로 상호작용을 구분하세요.",
      "deck.gl 프로젝트는 Deck/DeckGL, View/ViewState, 레이어 catalog, overlay, extension, widget, test-utils 신호를 따로 확인하세요.",
      "provider token, attribution, geolocation, external tile URL은 실제 실행 전에 보안과 개인정보 경계를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 tile fetch, WebGL render, geolocation, map screenshot QA는 안전한 브라우저 세션에서 별도로 검증하세요."
    ]
  };
}

type MapVisualizationSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function mapVisualizationSourceFiles(walk: WalkResult): Promise<MapVisualizationSourceFile[]> {
  const files: MapVisualizationSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !mapVisualizationInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!mapVisualizationPathSignal(file.relPath) && !mapVisualizationContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function mapVisualizationInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return mapVisualizationPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|vite\.config\.[jt]s|playwright\.config\.[jt]s)$/i.test(base)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|geojson|ya?ml|toml|md|mdx|css|scss)$/i.test(filePath);
}

function mapVisualizationPathSignal(filePath: string): boolean {
  return /(^|\/)(maps?|geo|geospatial|maplibre|leaflet|deck|deck-gl|mapbox|google[-_]?maps?|tiles?|layers?|markers?|bounds?|viewport|data|reports?)(\/|\.|-|_|$)|\.github\/workflows/i.test(filePath);
}

function mapVisualizationContentSignal(text: string): boolean {
  return /maplibregl|maplibre-gl|Leaflet|L\.map|tileLayer|deck\.gl|DeckGL|new Deck|MapView|GeoJsonLayer|ScatterplotLayer|MVTLayer|TerrainLayer|HeatmapLayer|HexagonLayer|GridLayer|DataFilterExtension|MapboxOverlay|GoogleMapsOverlay|FullscreenWidget|testLayer|TileLayer|addLayer|addSource|GeoJSON|FeatureCollection|Marker|Popup|fitBounds|setView|NavigationControl|GeolocateControl|viewState/i.test(text);
}

function mapVisualizationSetups(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["mapSetups"] {
  const rows: MapVisualizationReadinessReport["mapSetups"] = [];
  for (const source of sourceFiles) {
    const mapCount = countMatches(source.text, /new\s+maplibregl\.Map|L\.map\(|new\s+LeafletMap|new\s+Deck\(|Deck\(|new\s+MapView|GoogleMapsOverlay|MapboxOverlay|new\s+google\.maps\.Map/gi);
    const tileCount = countMatches(source.text, /tileLayer|TileLayer|tiles?\/|\{z\}\/\{x\}\/\{y\}|style\.json|vector tile|raster tile|tilejson|type:\s*['"]?(vector|raster)|openstreetmap/gi);
    const layerCount = countMatches(source.text, /addLayer|new\s+(GeoJsonLayer|ScatterplotLayer|TileLayer|MVTLayer|HexagonLayer|IconLayer|ArcLayer)|L\.geoJSON|L\.marker|marker|symbol|fill|line|LayerGroup|FeatureGroup/gi);
    const sourceCount = countMatches(source.text, /addSource|source:\s*|data:\s*|GeoJSON|FeatureCollection|MVTLayer|TileLayer|source-layer|sourceLayer/gi);
    const viewportCount = countMatches(source.text, /center|zoom|bounds|fitBounds|setView|initialViewState|viewState|longitude|latitude|pitch|bearing|LngLat|LatLng/gi);
    const markerCount = countMatches(source.text, /Marker|marker|Popup|popup|bindPopup|Tooltip|tooltip|Icon|DivIcon/gi);
    const geometryCount = countMatches(source.text, /GeoJSON|FeatureCollection|Feature|coordinates|Point|LineString|Polygon|MultiPolygon|getPosition|longitude|latitude|bbox|bounds/gi);
    const interactionCount = countMatches(source.text, /on\(['"]?(click|mousemove|mouseenter|mouseleave)|onClick|onHover|pickable|pickObject|queryRenderedFeatures|Popup|bindPopup|Tooltip/gi);
    const controlCount = countMatches(source.text, /addControl|NavigationControl|GeolocateControl|ScaleControl|AttributionControl|control\.layers|zoomControl|controller:\s*true/gi);
    const styleCount = countMatches(source.text, /style\.json|style:\s*|paint:\s*|layout:\s*|fill-color|line-color|circle-color|attribution|maplibre-gl\.css|leaflet\.css|sprite|glyphs/gi);
    const tokenCount = countMatches(source.text, /accessToken|MAPBOX_TOKEN|MAPTILER_KEY|GOOGLE_MAPS_API_KEY|apiKey|mapboxgl\.accessToken|token/gi);
    const workflowCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|uses:\s*actions\/|playwright|screenshot|visual[-_ ]?regression|upload-artifact|eslint/gi)
      + (source.filePath.includes(".github/workflows") ? 1 : 0);
    const hasSetupSignal = mapCount + tileCount + layerCount + sourceCount + viewportCount + markerCount + geometryCount + interactionCount + controlCount + styleCount + tokenCount + workflowCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: mapVisualizationPlatform(source),
      mapCount,
      tileCount,
      layerCount,
      sourceCount,
      viewportCount,
      markerCount,
      geometryCount,
      interactionCount,
      controlCount,
      styleCount,
      tokenCount,
      workflowCount,
      readiness: (mapCount > 0 || mapVisualizationPathSignal(source.filePath)) && (tileCount > 0 || layerCount > 0) && (viewportCount > 0 || geometryCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains maps ${mapCount}, tiles ${tileCount}, layers ${layerCount}, sources ${sourceCount}, viewport ${viewportCount}, markers ${markerCount}, geometry ${geometryCount}, interactions ${interactionCount}, controls ${controlCount}, style ${styleCount}, tokens ${tokenCount}, workflow ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function mapVisualizationPlatform(source: MapVisualizationSourceFile): MapVisualizationReadinessReport["mapSetups"][number]["platform"] {
  if (/maplibre/i.test(source.filePath) || /maplibregl|maplibre-gl|MapLibre/i.test(source.text)) return "maplibre";
  if (/deck[-_.]?gl|deck-map/i.test(source.filePath) || /deck\.gl|new\s+Deck\(|MapView|GeoJsonLayer|ScatterplotLayer|@deck\.gl/i.test(source.text)) return "deck-gl";
  if (/leaflet/i.test(source.filePath) || /Leaflet|L\.map|tileLayer|L\.geoJSON/i.test(source.text)) return "leaflet";
  if (/google[-_]?maps/i.test(source.filePath) || /google\.maps|GoogleMapsOverlay|GOOGLE_MAPS/i.test(source.text)) return "google-maps";
  if (/mapbox/i.test(source.filePath) || /mapboxgl|MapboxOverlay|MAPBOX_TOKEN/i.test(source.text)) return "mapbox";
  if (/map|geo|coordinates|tiles?|layers?/i.test(source.text)) return "custom";
  return "unknown";
}

function mapVisualizationPlatformSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["platformSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "maplibre", pattern: /maplibregl|maplibre-gl|MapLibre/i, evidence: "MapLibre map evidence was detected." },
    { signal: "leaflet", pattern: /Leaflet|L\.map|tileLayer|L\.geoJSON/i, evidence: "Leaflet map evidence was detected." },
    { signal: "deck-gl", pattern: /deck\.gl|@deck\.gl|new\s+Deck\(|MapView|GeoJsonLayer|ScatterplotLayer/i, evidence: "deck.gl map visualization evidence was detected." },
    { signal: "google-maps", pattern: /google\.maps|GoogleMapsOverlay|GOOGLE_MAPS/i, evidence: "Google Maps evidence was detected." },
    { signal: "mapbox", pattern: /mapboxgl|MapboxOverlay|MAPBOX_TOKEN/i, evidence: "Mapbox evidence was detected." },
    { signal: "custom", pattern: /interactive map|map canvas|geo visualization|geospatial UI/i, evidence: "custom map visualization evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function mapVisualizationContainerSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["containerSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["containerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "container", pattern: /container:\s*|new\s+maplibregl\.Map|L\.map\(|new\s+Deck\(/i, evidence: "map container evidence was detected." },
    { signal: "canvas", pattern: /canvas|deck-canvas|WebGL|webgl|map canvas/i, evidence: "canvas/WebGL container evidence was detected." },
    { signal: "map-div", pattern: /map[-_]?div|leaflet-map|container:\s*['"]map|id=['"]map|<div[^>]+map/i, evidence: "map div evidence was detected." },
    { signal: "webgl-context", pattern: /WebGL|webgl|GPU|deck\.gl|maplibre/i, evidence: "WebGL/GPU map context evidence was detected." },
    { signal: "react-component", pattern: /react-map-gl|<Map|function\s+\w*Map|MapboxOverlay|GoogleMapsOverlay/i, evidence: "React map component evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "container", "signal");
}

function mapVisualizationTileSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["tileSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["tileSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tile-url", pattern: /\{z\}\/\{x\}\/\{y\}|tiles?\/|tileLayer|TileLayer|style\.json|openstreetmap/i, evidence: "tile URL or style evidence was detected." },
    { signal: "vector-tile", pattern: /vector tile|MVTLayer|type:\s*['"]?vector|source-layer|sourceLayer|maplibre|style\.json/i, evidence: "vector tile evidence was detected." },
    { signal: "raster-tile", pattern: /raster tile|type:\s*['"]?raster|tileLayer|TileLayer|\{z\}\/\{x\}\/\{y\}/i, evidence: "raster tile evidence was detected." },
    { signal: "tilejson", pattern: /tilejson|TileJSON|tiles:\s*\[/i, evidence: "TileJSON evidence was detected." },
    { signal: "osm", pattern: /openstreetmap|tile\.openstreetmap|OSM/i, evidence: "OpenStreetMap tile evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "tile", "signal");
}

function mapVisualizationLayerSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["layerSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["layerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "geojson-layer", pattern: /GeoJsonLayer|L\.geoJSON|type:\s*['"]geojson|GeoJSON|FeatureCollection/i, evidence: "GeoJSON layer evidence was detected." },
    { signal: "marker-layer", pattern: /Marker|marker|L\.marker|ScatterplotLayer|IconLayer/i, evidence: "marker layer evidence was detected." },
    { signal: "symbol-layer", pattern: /type:\s*['"]symbol|symbol|text-field|label/i, evidence: "symbol layer evidence was detected." },
    { signal: "fill-line-layer", pattern: /type:\s*['"](fill|line)|fill-color|line-color|Polygon|LineString/i, evidence: "fill/line layer evidence was detected." },
    { signal: "deck-layer", pattern: /new\s+(GeoJsonLayer|ScatterplotLayer|TileLayer|MVTLayer|HexagonLayer|ArcLayer|IconLayer)/i, evidence: "deck.gl layer evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "layer", "signal");
}

function mapVisualizationDeckGlSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["deckGlSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["deckGlSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "deck-instance", pattern: /new\s+Deck\(|Deck\(/i, evidence: "Deck instance evidence was detected." },
    { signal: "deckgl-react", pattern: /DeckGL|@deck\.gl\/react/i, evidence: "DeckGL React component evidence was detected." },
    { signal: "map-view", pattern: /MapView|new\s+MapView\(/i, evidence: "MapView evidence was detected." },
    { signal: "initial-view-state", pattern: /initialViewState|INITIAL_VIEW_STATE/i, evidence: "initial view state evidence was detected." },
    { signal: "controlled-view-state", pattern: /\bviewState\b|onViewStateChange|setProps\(\{[\s\S]{0,120}viewState/i, evidence: "controlled view state evidence was detected." },
    { signal: "controller", pattern: /controller\s*[:=]\s*true|controller\b/i, evidence: "controller evidence was detected." },
    { signal: "picking", pattern: /pickable|pickObject|PickingInfo|onHover|onClick/i, evidence: "picking interaction evidence was detected." },
    { signal: "tooltip", pattern: /getTooltip|Tooltip|tooltip/i, evidence: "tooltip evidence was detected." },
    { signal: "layer-filter", pattern: /layerFilter|LayerFilter/i, evidence: "layerFilter evidence was detected." },
    { signal: "geojson-layer", pattern: /GeoJsonLayer/i, evidence: "GeoJsonLayer evidence was detected." },
    { signal: "scatterplot-layer", pattern: /ScatterplotLayer/i, evidence: "ScatterplotLayer evidence was detected." },
    { signal: "arc-layer", pattern: /ArcLayer/i, evidence: "ArcLayer evidence was detected." },
    { signal: "path-layer", pattern: /PathLayer/i, evidence: "PathLayer evidence was detected." },
    { signal: "polygon-layer", pattern: /PolygonLayer/i, evidence: "PolygonLayer evidence was detected." },
    { signal: "text-layer", pattern: /TextLayer/i, evidence: "TextLayer evidence was detected." },
    { signal: "icon-layer", pattern: /IconLayer/i, evidence: "IconLayer evidence was detected." },
    { signal: "tile-layer", pattern: /TileLayer/i, evidence: "TileLayer evidence was detected." },
    { signal: "mvt-layer", pattern: /MVTLayer/i, evidence: "MVTLayer evidence was detected." },
    { signal: "terrain-layer", pattern: /TerrainLayer/i, evidence: "TerrainLayer evidence was detected." },
    { signal: "heatmap-layer", pattern: /HeatmapLayer/i, evidence: "HeatmapLayer evidence was detected." },
    { signal: "hexagon-layer", pattern: /HexagonLayer/i, evidence: "HexagonLayer evidence was detected." },
    { signal: "grid-layer", pattern: /GridLayer/i, evidence: "GridLayer evidence was detected." },
    { signal: "screen-grid-layer", pattern: /ScreenGridLayer/i, evidence: "ScreenGridLayer evidence was detected." },
    { signal: "data-filter-extension", pattern: /DataFilterExtension/i, evidence: "DataFilterExtension evidence was detected." },
    { signal: "brushing-extension", pattern: /BrushingExtension/i, evidence: "BrushingExtension evidence was detected." },
    { signal: "path-style-extension", pattern: /PathStyleExtension/i, evidence: "PathStyleExtension evidence was detected." },
    { signal: "mask-extension", pattern: /MaskExtension/i, evidence: "MaskExtension evidence was detected." },
    { signal: "mapbox-overlay", pattern: /MapboxOverlay|@deck\.gl\/mapbox/i, evidence: "MapboxOverlay evidence was detected." },
    { signal: "google-maps-overlay", pattern: /GoogleMapsOverlay|@deck\.gl\/google-maps/i, evidence: "GoogleMapsOverlay evidence was detected." },
    { signal: "arcgis-overlay", pattern: /DeckLayer|DeckRenderer|@deck\.gl\/arcgis/i, evidence: "ArcGIS deck.gl overlay evidence was detected." },
    { signal: "widgets", pattern: /FullscreenWidget|ZoomWidget|CompassWidget|ScreenshotWidget|PopupWidget|@deck\.gl\/widgets/i, evidence: "deck.gl widget evidence was detected." },
    { signal: "test-utils", pattern: /testLayer|SnapshotTestRunner|InteractionTestRunner|@deck\.gl\/test-utils/i, evidence: "deck.gl test-utils evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "deck.gl", "signal");
}

function mapVisualizationDataSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["dataSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["dataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "geojson", pattern: /GeoJSON|geojson|FeatureCollection/i, evidence: "GeoJSON data evidence was detected." },
    { signal: "coordinates", pattern: /coordinates|longitude|latitude|LngLat|LatLng|getPosition|position:\s*\[/i, evidence: "coordinate evidence was detected." },
    { signal: "feature-properties", pattern: /properties|feature\.properties|\['get'|getProperty/i, evidence: "feature property evidence was detected." },
    { signal: "mvt", pattern: /MVTLayer|vector tile|source-layer|sourceLayer|\.pbf/i, evidence: "MVT/vector feature evidence was detected." },
    { signal: "bounds-data", pattern: /bounds|bbox|fitBounds|LatLngBounds/i, evidence: "bounds data evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "data", "signal");
}

function mapVisualizationViewportSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["viewportSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["viewportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "center-zoom", pattern: /center:\s*|zoom:\s*|setView\(|initialViewState/i, evidence: "center/zoom evidence was detected." },
    { signal: "bounds", pattern: /bounds|bbox|LatLngBounds/i, evidence: "bounds evidence was detected." },
    { signal: "deck-view-state", pattern: /initialViewState|viewState|MapView|longitude|latitude/i, evidence: "deck.gl view state evidence was detected." },
    { signal: "pitch-bearing", pattern: /pitch|bearing|rotation|tilt/i, evidence: "pitch/bearing evidence was detected." },
    { signal: "fit-bounds", pattern: /fitBounds|fitBoundsOptions/i, evidence: "fitBounds evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "viewport", "signal");
}

function mapVisualizationInteractionSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "click", pattern: /on\(['"]click|onClick|click:/i, evidence: "click interaction evidence was detected." },
    { signal: "hover-pick", pattern: /onHover|pickable|pickObject|hover|mousemove/i, evidence: "hover/picking evidence was detected." },
    { signal: "popup", pattern: /Popup|popup|bindPopup/i, evidence: "popup evidence was detected." },
    { signal: "tooltip", pattern: /Tooltip|tooltip|bindTooltip/i, evidence: "tooltip evidence was detected." },
    { signal: "feature-query", pattern: /queryRenderedFeatures|features\?\.\[|event\.features|pickObject/i, evidence: "feature query evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function mapVisualizationControlSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["controlSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["controlSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "navigation", pattern: /NavigationControl|ZoomControl|zoomControl/i, evidence: "navigation control evidence was detected." },
    { signal: "geolocation", pattern: /GeolocateControl|geolocation|trackUserLocation|locate\(/i, evidence: "geolocation control evidence was detected." },
    { signal: "layer-control", pattern: /control\.layers|LayersControl|LayerControl/i, evidence: "layer control evidence was detected." },
    { signal: "scale", pattern: /ScaleControl|control\.scale|scaleControl/i, evidence: "scale control evidence was detected." },
    { signal: "attribution-control", pattern: /AttributionControl|attribution|control\.attribution/i, evidence: "attribution control evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "control", "signal");
}

function mapVisualizationStyleSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["styleSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["styleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "style-json", pattern: /style\.json|style:\s*['"][^'"]+\.json|StyleSpecification/i, evidence: "style JSON evidence was detected." },
    { signal: "paint-layout", pattern: /paint:\s*|layout:\s*|fill-color|line-color|circle-color|text-field/i, evidence: "paint/layout style evidence was detected." },
    { signal: "attribution", pattern: /attribution|OpenStreetMap contributors|AttributionControl/i, evidence: "attribution evidence was detected." },
    { signal: "css", pattern: /maplibre-gl\.css|leaflet\.css|\.map-container|\.leaflet-container/i, evidence: "map CSS evidence was detected." },
    { signal: "icon-sprite", pattern: /sprite|glyphs|Icon|DivIcon|marker-icon/i, evidence: "sprite/icon evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "style", "signal");
}

function mapVisualizationWorkflowSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|uses:\s*actions\/|runs-on:/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "playwright", pattern: /playwright|@map|map\.spec/i, evidence: "Playwright map QA evidence was detected." },
    { signal: "visual-regression", pattern: /visual[-_ ]?regression|screenshot|pixelmatch|vrt/i, evidence: "visual regression evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact|screenshots?/i, evidence: "artifact upload evidence was detected." },
    { signal: "lint", pattern: /eslint|lint/i, evidence: "lint workflow evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function mapVisualizationPackageSignals(sourceFiles: MapVisualizationSourceFile[]): MapVisualizationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MapVisualizationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "maplibre-gl", pattern: /"maplibre-gl"|maplibre-gl/i, evidence: "maplibre-gl package evidence was detected." },
    { signal: "leaflet", pattern: /"leaflet"|leaflet/i, evidence: "Leaflet package evidence was detected." },
    { signal: "deck.gl", pattern: /"deck\.gl"|deck\.gl/i, evidence: "deck.gl package evidence was detected." },
    { signal: "@deck.gl/core", pattern: /"@deck\.gl\/core"|@deck\.gl\/core/i, evidence: "@deck.gl/core package evidence was detected." },
    { signal: "@deck.gl/layers", pattern: /"@deck\.gl\/layers"|@deck\.gl\/layers/i, evidence: "@deck.gl/layers package evidence was detected." },
    { signal: "@deck.gl/geo-layers", pattern: /"@deck\.gl\/geo-layers"|@deck\.gl\/geo-layers/i, evidence: "@deck.gl/geo-layers package evidence was detected." },
    { signal: "react-map-gl", pattern: /"react-map-gl"|react-map-gl/i, evidence: "react-map-gl package evidence was detected." }
  ];
  return mapVisualizationSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function mapVisualizationSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: MapVisualizationSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/map-visualization-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDiagramRenderingReadinessReport(walk: WalkResult): Promise<DiagramRenderingReadinessReport> {
  const sourceFiles = await diagramRenderingReadinessSourceFiles(walk);
  const diagramSetups = diagramRenderingReadinessSetups(sourceFiles);
  const diagramTypeSignals = diagramRenderingReadinessDiagramTypeSignals(sourceFiles);
  const renderSignals = diagramRenderingReadinessRenderSignals(sourceFiles);
  const themeSignals = diagramRenderingReadinessThemeSignals(sourceFiles);
  const securitySignals = diagramRenderingReadinessSecuritySignals(sourceFiles);
  const layoutSignals = diagramRenderingReadinessLayoutSignals(sourceFiles);
  const outputSignals = diagramRenderingReadinessOutputSignals(sourceFiles);
  const packageSignals = diagramRenderingReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasMermaidPackage = packageSignals.some((item) => item.signal === "mermaid" && item.readiness === "ready");
  const hasSetup = diagramSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = diagramSetups.some((item) => item.readiness === "ready");
  const hasRender = renderSignals.some((item) => item.readiness === "ready") || diagramSetups.some((item) => item.renderCount > 0);
  const hasSafety = securitySignals.some((item) => item.readiness === "ready") || diagramSetups.some((item) => item.safetyCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || diagramSetups.some((item) => item.outputCount > 0);
  const hasThemeOrLayout = themeSignals.some((item) => item.readiness === "ready")
    || layoutSignals.some((item) => item.readiness === "ready")
    || diagramSetups.some((item) => item.themeCount > 0);

  const riskQueue: DiagramRenderingReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the diagram rendering strategy before claiming Mermaid-style diagram readiness.",
      why: "Diagram readiness starts with explicit syntax, render, theme, output, interaction, safety, or package evidence.",
      relatedHref: "html/diagram-rendering-readiness.html"
    });
  }
  if (hasMermaidPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Mermaid package evidence with concrete diagram syntax, initialize/run/render/parse, SVG output, and security configuration.",
      why: "A diagram package alone does not prove diagrams render safely or produce usable output.",
      relatedHref: "html/diagram-rendering-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasRender) {
    riskQueue.push({
      priority: "high",
      action: "Add mermaid.initialize, mermaid.run, mermaid.render, mermaid.parse, Diagram.fromText, or bindFunctions evidence.",
      why: "Diagram syntax is not enough; apps need a concrete render or parse path.",
      relatedHref: "html/diagram-rendering-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Review securityLevel, strict/sandbox mode, sanitization, DOMPurify, and external-link policy.",
      why: "Text-to-diagram surfaces often accept user text and can create SVG, links, callbacks, or sandboxed iframe output.",
      relatedHref: "html/diagram-rendering-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Document SVG, iframe, download, live-editor, or snapshot output expectations.",
      why: "Rendered diagrams need a clear output target before learners can verify what users will see.",
      relatedHref: "html/diagram-rendering-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasThemeOrLayout) {
    riskQueue.push({
      priority: "low",
      action: "Check theme, themeVariables, themeCSS, htmlLabels, useMaxWidth, viewBox, and layout engine settings.",
      why: "Diagram readability depends on theme and layout settings, especially in responsive documentation pages.",
      relatedHref: "html/diagram-rendering-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative diagram rendering tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records diagram rendering readiness only; it does not render Mermaid diagrams, execute diagram callbacks, open sandboxed iframes, sanitize user text, mutate SVG, export images, or run the analyzed project's tests.",
    relatedHref: "html/diagram-rendering-readiness.html"
  });

  return {
    summary: `Mermaid-style diagram rendering readiness report: setup ${diagramSetups.length}개, diagram type signal ${diagramTypeSignals.length}개, render signal ${renderSignals.length}개, security signal ${securitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Mermaid mermaid.initialize mermaid.run mermaid.render mermaid.parse flowchart sequenceDiagram classDiagram stateDiagram erDiagram gantt journey mindmap securityLevel theme svg sandbox",
    diagramSetups,
    diagramTypeSignals,
    renderSignals,
    themeSignals,
    securitySignals,
    layoutSignals,
    outputSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"mermaid|plantuml|kroki|markmap|graphviz|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|mindmap\" src app packages docs", purpose: "Inventory diagram providers and syntax entry points." },
      { command: "rg \"mermaid\\.initialize|mermaid\\.run|mermaid\\.render|mermaid\\.parse|Diagram\\.fromText|bindFunctions\" src app packages docs", purpose: "Review diagram initialization, render, parse, and callback binding paths." },
      { command: "rg \"securityLevel|strict|loose|antiscript|sandbox|DOMPurify|sanitize|dompurifyConfig|external user\" src app packages docs", purpose: "Check user-text, SVG, iframe, and link safety policy." },
      { command: "rg \"theme|themeVariables|themeCSS|darkMode|fontFamily|htmlLabels|useMaxWidth|viewBox|elk|dagre\" src app packages docs", purpose: "Check theme and layout settings that affect readability." },
      { command: "rg \"svg|iframe|download|snapshot|mermaid\\.live|toDataURL|click|callback|href\" src app packages docs", purpose: "Confirm output, export, live-editor, and interaction behavior." },
      { command: "npx vitest run", purpose: "Run local tests that cover diagram parsing, rendering fallbacks, output snapshots, and safety policy." }
    ],
    learnerNextSteps: [
      "먼저 Mermaid, PlantUML, Kroki, Markmap, Graphviz import와 diagram syntax 지점을 찾으세요.",
      "flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, mindmap 신호로 지원 diagram 종류를 확인하세요.",
      "mermaid.initialize, mermaid.run, mermaid.render, mermaid.parse, Diagram.fromText, bindFunctions 신호로 렌더링 흐름을 추적하세요.",
      "securityLevel, strict, sandbox, sanitize, DOMPurify, external links 신호로 사용자 입력과 SVG/iframe 안전 경계를 확인하세요.",
      "themeVariables, themeCSS, darkMode, fontFamily, htmlLabels, useMaxWidth, viewBox, elk, dagre 신호로 시각적 가독성을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 Mermaid 렌더링, callback 실행, sandboxed iframe 검사, SVG export는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type DiagramRenderingReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function diagramRenderingReadinessSourceFiles(walk: WalkResult): Promise<DiagramRenderingReadinessSourceFile[]> {
  const files: DiagramRenderingReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !diagramRenderingReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!diagramRenderingReadinessPathSignal(file.relPath) && !diagramRenderingReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function diagramRenderingReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return diagramRenderingReadinessPathSignal(filePath)
    || /^(diagram\.[cm]?[jt]sx?|diagrams\.[cm]?[jt]sx?|mermaid\.[cm]?[jt]sx?|graph\.[cm]?[jt]sx?|graphs\.[cm]?[jt]sx?|flowchart\.[cm]?[jt]sx?|architecture\.[cm]?[jt]sx?|visualization\.[cm]?[jt]sx?|markdown\.[cm]?[jt]sx?|docs\.[cm]?[jt]sx?|package\.json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function diagramRenderingReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(diagram|diagrams|mermaid|graph|graphs|flowchart|sequence|architecture|visualization|docs|markdown)(\/|\.|-|_|$)/i.test(filePath);
}

function diagramRenderingReadinessContentSignal(text: string): boolean {
  return /(mermaid|mermaid\.initialize|mermaid\.run|mermaid\.render|mermaid\.parse|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|journey|mindmap|securityLevel|themeVariables|DOMPurify|kroki|plantuml|markmap|graphviz|dot)/i.test(text);
}

function diagramRenderingReadinessSetups(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["diagramSetups"] {
  const rows: DiagramRenderingReadinessReport["diagramSetups"] = [];
  for (const source of sourceFiles) {
    const syntaxCount = countMatches(source.text, /flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|gantt|journey|mindmap|architecture-beta|C4Context|graph TD|graph LR|@startuml|digraph/gi);
    const renderCount = countMatches(source.text, /mermaid\.initialize|mermaid\.run|mermaid\.render|mermaid\.parse|renderDiagram|Diagram\.fromText|bindFunctions/gi);
    const themeCount = countMatches(source.text, /theme|themeVariables|themeCSS|darkMode|fontFamily|htmlLabels/gi);
    const outputCount = countMatches(source.text, /svg|iframe|download|toDataURL|snapshot|live editor|mermaid\.live/gi);
    const interactionCount = countMatches(source.text, /click|callback|bindFunctions|href|link|zoom|pan/gi);
    const safetyCount = countMatches(source.text, /securityLevel|strict|loose|antiscript|sandbox|sanitize|DOMPurify|dompurifyConfig|external user|trusted/gi);
    const hasSetupSignal = syntaxCount + renderCount + themeCount + outputCount + interactionCount + safetyCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: diagramRenderingReadinessProvider(source),
      syntaxCount,
      renderCount,
      themeCount,
      outputCount,
      interactionCount,
      safetyCount,
      readiness: syntaxCount > 0 && renderCount > 0 && outputCount > 0 && safetyCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains syntax ${syntaxCount}, render ${renderCount}, theme ${themeCount}, output ${outputCount}, interaction ${interactionCount}, safety ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function diagramRenderingReadinessProvider(source: DiagramRenderingReadinessSourceFile): DiagramRenderingReadinessReport["diagramSetups"][number]["provider"] {
  if (/mermaid|flowchart|sequenceDiagram|securityLevel|themeVariables/i.test(source.text)) return "mermaid";
  if (/plantuml|@startuml/i.test(source.text)) return "plantuml";
  if (/kroki/i.test(source.text)) return "kroki";
  if (/markmap/i.test(source.text)) return "markmap";
  if (/graphviz|dot|digraph/i.test(source.text)) return "graphviz";
  if (/diagram|graph|svg/i.test(source.text)) return "custom";
  return "unknown";
}

function diagramRenderingReadinessDiagramTypeSignals(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["diagramTypeSignals"] {
  const specs: Array<{ signal: DiagramRenderingReadinessReport["diagramTypeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flowchart", pattern: /flowchart|graph TD|graph LR/i, evidence: "flowchart evidence was detected." },
    { signal: "sequence", pattern: /sequenceDiagram/i, evidence: "sequence diagram evidence was detected." },
    { signal: "class", pattern: /classDiagram/i, evidence: "class diagram evidence was detected." },
    { signal: "state", pattern: /stateDiagram|stateDiagram-v2/i, evidence: "state diagram evidence was detected." },
    { signal: "er", pattern: /erDiagram/i, evidence: "ER diagram evidence was detected." },
    { signal: "gantt", pattern: /gantt/i, evidence: "Gantt diagram evidence was detected." },
    { signal: "mindmap", pattern: /mindmap|markmap/i, evidence: "mindmap evidence was detected." },
    { signal: "architecture", pattern: /architecture-beta|C4Context|C4Container|digraph|graphviz/i, evidence: "architecture diagram evidence was detected." }
  ];
  return diagramRenderingReadinessSignalFromSpecs(sourceFiles, specs, "diagram type", "signal");
}

function diagramRenderingReadinessRenderSignals(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["renderSignals"] {
  const specs: Array<{ signal: DiagramRenderingReadinessReport["renderSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "initialize", pattern: /mermaid\.initialize|initialize\s*\(\s*\{/i, evidence: "diagram initialization evidence was detected." },
    { signal: "run", pattern: /mermaid\.run|run\s*\(\s*\{/i, evidence: "diagram run evidence was detected." },
    { signal: "render", pattern: /mermaid\.render|renderDiagram|render\s*\(/i, evidence: "diagram render evidence was detected." },
    { signal: "parse", pattern: /mermaid\.parse|Diagram\.fromText|parse\s*\(/i, evidence: "diagram parse evidence was detected." },
    { signal: "svg-output", pattern: /\bsvg\b|<svg|SVGElement/i, evidence: "SVG output evidence was detected." },
    { signal: "bind-functions", pattern: /bindFunctions|callback|event listener/i, evidence: "diagram callback binding evidence was detected." }
  ];
  return diagramRenderingReadinessSignalFromSpecs(sourceFiles, specs, "render", "signal");
}

function diagramRenderingReadinessThemeSignals(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["themeSignals"] {
  const specs: Array<{ signal: DiagramRenderingReadinessReport["themeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "theme", pattern: /theme\s*:|theme:/i, evidence: "theme evidence was detected." },
    { signal: "theme-variables", pattern: /themeVariables/i, evidence: "theme variable evidence was detected." },
    { signal: "theme-css", pattern: /themeCSS/i, evidence: "theme CSS evidence was detected." },
    { signal: "dark-mode", pattern: /darkMode|dark mode/i, evidence: "dark mode evidence was detected." },
    { signal: "font-family", pattern: /fontFamily|font-family/i, evidence: "font family evidence was detected." },
    { signal: "html-labels", pattern: /htmlLabels|html labels/i, evidence: "HTML labels evidence was detected." }
  ];
  return diagramRenderingReadinessSignalFromSpecs(sourceFiles, specs, "theme", "signal");
}

function diagramRenderingReadinessSecuritySignals(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["securitySignals"] {
  const specs: Array<{ signal: DiagramRenderingReadinessReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "security-level", pattern: /securityLevel/i, evidence: "security level evidence was detected." },
    { signal: "strict-mode", pattern: /securityLevel\s*:\s*['"]strict|strict mode/i, evidence: "strict security mode evidence was detected." },
    { signal: "sandbox", pattern: /securityLevel\s*:\s*['"]sandbox|sandboxed iframe|sandbox/i, evidence: "sandbox evidence was detected." },
    { signal: "sanitize", pattern: /sanitize|sanitise/i, evidence: "sanitization evidence was detected." },
    { signal: "dompurify", pattern: /DOMPurify|dompurify|dompurifyConfig/i, evidence: "DOMPurify evidence was detected." },
    { signal: "external-links", pattern: /external user|external link|trusted|href|target=/i, evidence: "external link or trust policy evidence was detected." }
  ];
  return diagramRenderingReadinessSignalFromSpecs(sourceFiles, specs, "security", "signal");
}

function diagramRenderingReadinessLayoutSignals(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["layoutSignals"] {
  const specs: Array<{ signal: DiagramRenderingReadinessReport["layoutSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "use-max-width", pattern: /useMaxWidth/i, evidence: "useMaxWidth evidence was detected." },
    { signal: "viewbox", pattern: /viewBox|viewbox/i, evidence: "viewBox evidence was detected." },
    { signal: "elk", pattern: /\belk\b|elkjs/i, evidence: "ELK layout evidence was detected." },
    { signal: "dagre", pattern: /dagre/i, evidence: "Dagre layout evidence was detected." },
    { signal: "tidy-tree", pattern: /tidy-tree|tidyTree|mindmap/i, evidence: "tidy-tree layout evidence was detected." },
    { signal: "responsive-svg", pattern: /responsive|preserveAspectRatio|ResizeObserver|useMaxWidth/i, evidence: "responsive SVG evidence was detected." }
  ];
  return diagramRenderingReadinessSignalFromSpecs(sourceFiles, specs, "layout", "signal");
}

function diagramRenderingReadinessOutputSignals(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["outputSignals"] {
  const specs: Array<{ signal: DiagramRenderingReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "svg", pattern: /\bsvg\b|<svg|SVGElement/i, evidence: "SVG output evidence was detected." },
    { signal: "iframe", pattern: /iframe|sandboxed iframe/i, evidence: "iframe output evidence was detected." },
    { signal: "download", pattern: /download|toDataURL|save image/i, evidence: "download/export evidence was detected." },
    { signal: "live-editor", pattern: /mermaid\.live|live editor|live-editor/i, evidence: "live editor evidence was detected." },
    { signal: "snapshot-test", pattern: /snapshot|toMatchSnapshot|visual test|argos/i, evidence: "snapshot or visual test evidence was detected." }
  ];
  return diagramRenderingReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function diagramRenderingReadinessPackageSignals(sourceFiles: DiagramRenderingReadinessSourceFile[]): DiagramRenderingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DiagramRenderingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mermaid", pattern: /"mermaid"|from ['"]mermaid|require\(['"]mermaid|mermaid\.initialize|mermaid\.render/i, evidence: "Mermaid package/import evidence was detected." },
    { signal: "plantuml", pattern: /"plantuml|from ['"].*plantuml|@startuml|plantuml/i, evidence: "PlantUML evidence was detected." },
    { signal: "kroki", pattern: /"kroki|from ['"].*kroki|kroki/i, evidence: "Kroki evidence was detected." },
    { signal: "markmap", pattern: /"markmap|from ['"].*markmap|markmap/i, evidence: "Markmap evidence was detected." },
    { signal: "graphviz", pattern: /"graphviz|from ['"].*graphviz|graphviz|digraph/i, evidence: "Graphviz evidence was detected." }
  ];
  return diagramRenderingReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function diagramRenderingReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DiagramRenderingReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/diagram-rendering-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
