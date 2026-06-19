import type { BundleAnalysisReport, MockingReadinessReport } from "@repotutor/shared";
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

export async function buildBundleAnalysisReport(walk: WalkResult): Promise<BundleAnalysisReport> {
  const sourceFiles = await bundleAnalysisSourceFiles(walk);
  const configFiles = bundleAnalysisConfigFiles(sourceFiles);
  const bundleArtifacts = bundleAnalysisArtifacts(walk.files, sourceFiles);
  const sizeSignals = bundleAnalysisSizeSignals(sourceFiles);
  const scriptSignals = bundleAnalysisScriptSignals(sourceFiles);
  const packageSignals = bundleAnalysisPackageSignals(sourceFiles);

  const hasAnalyzer = packageSignals.some((item) => item.readiness === "ready")
    || configFiles.some((item) => item.analyzerMode !== "missing");
  const hasStats = configFiles.some((item) => item.statsFileSignal)
    || bundleArtifacts.some((item) => item.artifactType === "stats-json");
  const hasArtifacts = bundleArtifacts.length > 0;
  const hasSourceMaps = configFiles.some((item) => item.sourceMapSignal)
    || bundleArtifacts.some((item) => item.artifactType === "source-map");
  const hasBudget = configFiles.some((item) => item.budgetSignal)
    || sizeSignals.some((item) => item.signal === "budget" && item.readiness === "ready");
  const serverMode = configFiles.some((item) => item.analyzerMode === "server");

  const riskQueue: BundleAnalysisReport["riskQueue"] = [];
  if (!hasAnalyzer && !hasStats && !hasArtifacts) {
    riskQueue.push({
      priority: "medium",
      action: "Add a bundle analyzer, stats JSON workflow, or committed size artifact before claiming bundle visibility.",
      why: "Webpack Bundle Analyzer starts from an explicit stats/report surface that explains which modules and chunks make up the output.",
      relatedHref: "html/bundle-analysis.html"
    });
  }
  if (hasAnalyzer && !hasStats && !hasArtifacts) {
    riskQueue.push({
      priority: "medium",
      action: "Generate or document a stats JSON/report output for CI review.",
      why: "A package dependency alone does not prove learners can inspect emitted chunks, parsed size, gzip, Brotli, or Zstandard size.",
      relatedHref: "html/bundle-analysis.html"
    });
  }
  if (serverMode) {
    riskQueue.push({
      priority: "low",
      action: "Prefer static or JSON analyzer output for repeatable CI artifacts.",
      why: "Server mode is useful locally, but static reports and JSON files are easier to archive and inspect after a build.",
      relatedHref: "html/bundle-analysis.html"
    });
  }
  if ((hasAnalyzer || hasArtifacts) && !hasSourceMaps) {
    riskQueue.push({
      priority: "low",
      action: "Confirm source maps are available when debugging unexpected bundle weight.",
      why: "Source-map based tools and analyzer reports are easier to teach when minified output maps back to source modules.",
      relatedHref: "html/bundle-analysis.html"
    });
  }
  if ((hasAnalyzer || hasArtifacts || hasStats) && !hasBudget) {
    riskQueue.push({
      priority: "medium",
      action: "Add size budgets or review thresholds for bundle growth.",
      why: "Bundle analysis is more actionable when growth has a threshold, owner, and review path.",
      relatedHref: "html/bundle-analysis.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run build and analyzer commands only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not build the analyzed project, start analyzer servers, parse arbitrary bundles, or open generated reports.",
    relatedHref: "html/bundle-analysis.html"
  });

  return {
    summary: `Webpack Bundle Analyzer식 bundle analysis report: config file ${configFiles.length}개, artifact ${bundleArtifacts.length}개, size signal ${sizeSignals.length}개, package signal ${packageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Webpack Bundle Analyzer stats json analyzerMode reportFilename defaultSizes gzip parsed stat source maps chunks assets",
    configFiles,
    bundleArtifacts,
    sizeSignals,
    scriptSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx webpack --profile --json > stats.json", purpose: "Generate webpack stats JSON for offline bundle analysis." },
      { command: "npx webpack-bundle-analyzer stats.json dist --mode static --report bundle-report.html --no-open", purpose: "Create an archived static treemap report without opening a browser." },
      { command: "npx webpack-bundle-analyzer stats.json dist --mode json --default-sizes gzip", purpose: "Create machine-readable analyzer output with gzip size focus." },
      { command: "npx vite build --sourcemap", purpose: "Build Vite output with source maps before inspecting bundle ownership." },
      { command: "npx rollup -c --bundleConfigAsCjs", purpose: "Run Rollup build only in a trusted workspace before visualizer review." },
      { command: "find dist -name '*.map' -o -name '*.js' -o -name '*.css'", purpose: "Inventory emitted JS/CSS/source-map artifacts before opening analyzer output." }
    ],
    learnerNextSteps: [
      "Start with package scripts and bundler config to see whether bundle analysis is wired into the normal build workflow.",
      "Look for stats JSON, static HTML reports, source maps, chunks, vendor bundles, and compression-size signals.",
      "Treat server-mode analyzers as local-only unless static or JSON reports are archived for review.",
      "RepoTutor never runs build or analyzer commands automatically; use this page as a static readiness map before executing bundle tooling yourself."
    ]
  };
}

type BundleAnalysisSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function bundleAnalysisSourceFiles(walk: WalkResult): Promise<BundleAnalysisSourceFile[]> {
  const files: BundleAnalysisSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !bundleAnalysisInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!bundleAnalysisPathSignal(file.relPath) && !bundleAnalysisContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function bundleAnalysisInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return bundleAnalysisPathSignal(filePath)
    || /^(package\.json|stats\.json|asset-manifest\.json|manifest\.json)$/i.test(base)
    || /\.(json|ya?ml|md|js|cjs|mjs|ts|tsx|jsx|css|map|html)$/i.test(filePath);
}

function bundleAnalysisPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /webpack\.config|vite\.config|rollup\.config|esbuild|next\.config|bundle-analy[sz]er|bundle-report|source-map-explorer|visualizer|stats\.json|asset-manifest\.json/i.test(filePath)
    || /^(report\.html|bundle-report\.html|stats\.json)$/i.test(base)
    || /(^|\/)(dist|build|public\/assets|static\/js|static\/css)\//i.test(filePath);
}

function bundleAnalysisContentSignal(text: string): boolean {
  return /webpack-bundle-analyzer|BundleAnalyzerPlugin|analyzerMode|generateStatsFile|statsFilename|defaultSizes|reportFilename|webpack --profile --json|rollup-plugin-visualizer|source-map-explorer|sourceMappingURL|sourcemap|bundle size|gzip|brotli|zstd|chunks?|assets?/i.test(text);
}

function bundleAnalysisConfigFiles(sourceFiles: BundleAnalysisSourceFile[]): BundleAnalysisReport["configFiles"] {
  return sourceFiles
    .filter((source) => bundleAnalysisConfigPathSignal(source.filePath, source.text))
    .slice(0, 80)
    .map((source) => {
      const configType = bundleAnalysisConfigType(source.filePath, source.text);
      const analyzerMode = bundleAnalysisAnalyzerMode(source.text);
      const defaultSizeMode = bundleAnalysisDefaultSizeMode(source.text);
      const statsFileSignal = /generateStatsFile|statsFilename|stats\.json|--profile\s+--json|--json\s*>\s*stats/i.test(source.text);
      const sourceMapSignal = /sourceMap|sourcemap|sourceMappingURL|\.map\b/i.test(source.text);
      const budgetSignal = /budget|budgets|maxAssetSize|maxEntrypointSize|performance\s*:|size-limit|bundlesize/i.test(source.text);
      const readiness = analyzerMode !== "missing" || statsFileSignal || /webpack-bundle-analyzer|rollup-plugin-visualizer|source-map-explorer|visualizer/i.test(source.text) ? "ready" : "partial";
      return {
        filePath: source.filePath,
        configType,
        analyzerMode,
        defaultSizeMode,
        statsFileSignal,
        sourceMapSignal,
        budgetSignal,
        readiness,
        evidence: `${source.filePath} contains ${configType} bundle-analysis signal with analyzer mode ${analyzerMode}, default size ${defaultSizeMode}, stats ${statsFileSignal ? "yes" : "no"}, source maps ${sourceMapSignal ? "yes" : "no"}, budget ${budgetSignal ? "yes" : "no"}.`,
        sourceHref: source.sourceHref
      };
    });
}

function bundleAnalysisConfigPathSignal(filePath: string, text: string): boolean {
  const base = path.basename(filePath);
  return /webpack\.config|vite\.config|rollup\.config|esbuild|next\.config/i.test(filePath)
    || (base === "package.json" && /webpack-bundle-analyzer|rollup-plugin-visualizer|source-map-explorer|bundle-analy[sz]e|stats\.json|size-limit|bundlesize/i.test(text))
    || (filePath.startsWith(".github/workflows/") && /webpack-bundle-analyzer|source-map-explorer|rollup-plugin-visualizer|stats\.json|bundle-report/i.test(text));
}

function bundleAnalysisConfigType(filePath: string, text: string): BundleAnalysisReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath).toLowerCase();
  if (base === "package.json") return "package-json";
  if (/webpack\.config/i.test(filePath) || /webpack-bundle-analyzer|BundleAnalyzerPlugin/i.test(text)) return "webpack";
  if (/vite\.config/i.test(filePath) || /vite\b/i.test(text)) return "vite";
  if (/rollup\.config/i.test(filePath) || /rollup-plugin-visualizer/i.test(text)) return "rollup";
  if (/esbuild/i.test(filePath) || /esbuild/i.test(text)) return "esbuild";
  if (/next\.config/i.test(filePath) || /next-bundle-analyzer/i.test(text)) return "next";
  return "unknown";
}

function bundleAnalysisAnalyzerMode(text: string): BundleAnalysisReport["configFiles"][number]["analyzerMode"] {
  const match = firstMatch(text, /analyzerMode\s*:\s*["'](server|static|json|disabled)["']/i)
    ?? firstMatch(text, /--mode\s+(server|static|json|disabled)\b/i)
    ?? firstMatch(text, /mode\s*:\s*["'](server|static|json|disabled)["']/i);
  return (match as BundleAnalysisReport["configFiles"][number]["analyzerMode"] | null) ?? "missing";
}

function bundleAnalysisDefaultSizeMode(text: string): BundleAnalysisReport["configFiles"][number]["defaultSizeMode"] {
  const match = firstMatch(text, /defaultSizes\s*:\s*["'](stat|parsed|gzip|brotli|zstd)["']/i)
    ?? firstMatch(text, /--default-sizes\s+(stat|parsed|gzip|brotli|zstd)\b/i);
  return (match as BundleAnalysisReport["configFiles"][number]["defaultSizeMode"] | null) ?? "missing";
}

function bundleAnalysisArtifacts(files: WalkResult["files"], sourceFiles: BundleAnalysisSourceFile[]): BundleAnalysisReport["bundleArtifacts"] {
  const textByPath = new Map(sourceFiles.map((source) => [source.filePath, source]));
  return files
    .filter((file) => bundleAnalysisArtifactType(file.relPath) !== "unknown")
    .slice(0, 120)
    .map((file) => {
      const artifactType = bundleAnalysisArtifactType(file.relPath);
      const source = textByPath.get(file.relPath);
      const referencedChunks = source ? countMatches(source.text, /chunks?|assets?|modules?|sourceMappingURL|import\(/gi) : 0;
      return {
        filePath: file.relPath,
        artifactType,
        sizeBytes: file.size,
        referencedChunks,
        readiness: artifactType === "unknown" ? "missing" : source || artifactType === "dist-file" ? "ready" : "partial",
        evidence: `${file.relPath} looks like ${artifactType} bundle-analysis artifact with ${file.size} bytes and ${referencedChunks} chunk/module reference(s).`,
        sourceHref: source?.sourceHref ?? null
      };
    });
}

function bundleAnalysisArtifactType(filePath: string): BundleAnalysisReport["bundleArtifacts"][number]["artifactType"] {
  const base = path.basename(filePath).toLowerCase();
  if (/stats.*\.json$|^stats\.json$/.test(base)) return "stats-json";
  if (base.endsWith(".map")) return "source-map";
  if (/asset-manifest\.json|manifest\.json/.test(base)) return "asset-manifest";
  if (/bundle-report|report\.html|analy[sz]er.*\.html/i.test(filePath)) return "bundle-report";
  if (/(^|\/)(dist|build|public\/assets|static\/js|static\/css)\/.+\.(js|mjs|cjs|css)$/i.test(filePath)) return "dist-file";
  return "unknown";
}

function bundleAnalysisSizeSignals(sourceFiles: BundleAnalysisSourceFile[]): BundleAnalysisReport["sizeSignals"] {
  const specs: Array<{ signal: BundleAnalysisReport["sizeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "js-bundle", pattern: /(^|\/)(dist|build|static\/js|assets)\/.*\.(js|mjs|cjs)|bundle\.js|main\.[a-f0-9]+\.js/i, evidence: "JavaScript bundle evidence was detected." },
    { signal: "css-bundle", pattern: /(^|\/)(dist|build|static\/css|assets)\/.*\.css|main\.[a-f0-9]+\.css/i, evidence: "CSS bundle evidence was detected." },
    { signal: "asset", pattern: /assets?|asset-manifest|public\/assets|static\/media/i, evidence: "asset output evidence was detected." },
    { signal: "chunk", pattern: /chunks?|chunkFilename|splitChunks|manualChunks|dynamic import|import\(/i, evidence: "chunk splitting evidence was detected." },
    { signal: "vendor", pattern: /vendor|node_modules|splitChunks|common-vendor/i, evidence: "vendor chunk evidence was detected." },
    { signal: "sourcemap", pattern: /sourceMappingURL|sourceMap|sourcemap|\.map\b/i, evidence: "source map evidence was detected." },
    { signal: "gzip", pattern: /gzip|defaultSizes.*gzip|--default-sizes gzip/i, evidence: "gzip size evidence was detected." },
    { signal: "brotli", pattern: /brotli|defaultSizes.*brotli|--default-sizes brotli/i, evidence: "Brotli size evidence was detected." },
    { signal: "zstd", pattern: /zstd|defaultSizes.*zstd|compressionAlgorithm.*zstd/i, evidence: "Zstandard size evidence was detected." },
    { signal: "budget", pattern: /budget|budgets|maxAssetSize|maxEntrypointSize|size-limit|bundlesize/i, evidence: "bundle budget evidence was detected." }
  ];
  return bundleAnalysisSignalFromSpecs(sourceFiles, specs, "size", "signal");
}

function bundleAnalysisScriptSignals(sourceFiles: BundleAnalysisSourceFile[]): BundleAnalysisReport["scriptSignals"] {
  const specs: Array<{ signal: BundleAnalysisReport["scriptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "analyze", pattern: /"[^"]*analy[sz]e[^"]*"\s*:|npm run analy[sz]e|pnpm analy[sz]e|yarn analy[sz]e/i, evidence: "analyze script evidence was detected." },
    { signal: "build", pattern: /"build"\s*:|npm run build|pnpm build|vite build|webpack\b|next build/i, evidence: "build script evidence was detected." },
    { signal: "stats", pattern: /stats\.json|--profile\s+--json|generateStatsFile|statsFilename/i, evidence: "stats generation evidence was detected." },
    { signal: "visualizer", pattern: /rollup-plugin-visualizer|visualizer\(|vite-bundle-visualizer/i, evidence: "visualizer script evidence was detected." },
    { signal: "bundle-analyzer", pattern: /webpack-bundle-analyzer|BundleAnalyzerPlugin/i, evidence: "webpack-bundle-analyzer evidence was detected." },
    { signal: "source-map-explorer", pattern: /source-map-explorer/i, evidence: "source-map-explorer evidence was detected." },
    { signal: "webpack-profile", pattern: /webpack --profile|--profile --json|profile:\s*true/i, evidence: "webpack profile evidence was detected." }
  ];
  return bundleAnalysisSignalFromSpecs(sourceFiles, specs, "script", "signal");
}

function bundleAnalysisPackageSignals(sourceFiles: BundleAnalysisSourceFile[]): BundleAnalysisReport["packageSignals"] {
  const specs: Array<{ signal: BundleAnalysisReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "webpack-bundle-analyzer", pattern: /webpack-bundle-analyzer|BundleAnalyzerPlugin/i, evidence: "webpack-bundle-analyzer package evidence was detected." },
    { signal: "rollup-plugin-visualizer", pattern: /rollup-plugin-visualizer|vite-bundle-visualizer/i, evidence: "Rollup/Vite visualizer package evidence was detected." },
    { signal: "source-map-explorer", pattern: /source-map-explorer/i, evidence: "source-map-explorer package evidence was detected." },
    { signal: "vite", pattern: /"vite"\s*:|vite build|vite\.config/i, evidence: "Vite package or config evidence was detected." },
    { signal: "webpack", pattern: /"webpack"\s*:|webpack\.config|webpack\b/i, evidence: "webpack package or config evidence was detected." },
    { signal: "next-bundle-analyzer", pattern: /@next\/bundle-analyzer|next-bundle-analyzer/i, evidence: "Next bundle analyzer evidence was detected." }
  ];
  return bundleAnalysisSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function bundleAnalysisSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: BundleAnalysisSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/bundle-analysis.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildMockingReadinessReport(walk: WalkResult): Promise<MockingReadinessReport> {
  const sourceFiles = await mockingReadinessSourceFiles(walk);
  const handlerFiles = mockingReadinessHandlerFiles(sourceFiles);
  const serverSetups = mockingReadinessServerSetups(sourceFiles);
  const protocolSignals = mockingReadinessProtocolSignals(sourceFiles);
  const lifecycleSignals = mockingReadinessLifecycleSignals(sourceFiles);
  const mswSignals = mockingReadinessMswSignals(sourceFiles);
  const packageSignals = mockingReadinessPackageSignals(sourceFiles);

  const hasHandlers = handlerFiles.some((item) => item.readiness === "ready");
  const hasSetup = serverSetups.some((item) => item.readiness === "ready");
  const hasLifecycle = serverSetups.some((item) => item.lifecycleSignal)
    || lifecycleSignals.some((item) => ["resetHandlers", "restoreHandlers", "close"].includes(item.signal) && item.readiness === "ready");
  const hasUnhandledPolicy = serverSetups.some((item) => item.unhandledPolicy !== "missing")
    || lifecycleSignals.some((item) => item.signal === "onUnhandledRequest" && item.readiness === "ready");
  const hasPackage = packageSignals.some((item) => item.readiness === "ready");

  const riskQueue: MockingReadinessReport["riskQueue"] = [];
  if (!hasHandlers && !hasSetup && !hasPackage) {
    riskQueue.push({
      priority: "medium",
      action: "Add request handlers and a test or development mock setup before claiming API mocking coverage.",
      why: "MSW-style mocking starts from explicit handlers that describe network behavior without changing application code.",
      relatedHref: "html/mocking-readiness.html"
    });
  }
  if (hasPackage && !hasHandlers) {
    riskQueue.push({
      priority: "medium",
      action: "Create reusable HTTP, GraphQL, or WebSocket handlers next to the tests or app mock layer.",
      why: "A mocking package dependency alone does not prove learners can see what network behavior is replaced.",
      relatedHref: "html/mocking-readiness.html"
    });
  }
  if (hasHandlers && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Wire handlers into setupWorker for browser/dev flows or setupServer for Node test flows.",
      why: "Handlers need an interception boundary before tests or local development can rely on them.",
      relatedHref: "html/mocking-readiness.html"
    });
  }
  if (hasSetup && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Add lifecycle cleanup such as resetHandlers, restoreHandlers, and close in test hooks.",
      why: "Mock handlers can leak between tests unless runtime overrides are reset after each case.",
      relatedHref: "html/unit-tests.html"
    });
  }
  if (hasSetup && !hasUnhandledPolicy) {
    riskQueue.push({
      priority: "low",
      action: "Set an explicit onUnhandledRequest policy for unexpected live network calls.",
      why: "Beginners can trust mock coverage more when unhandled requests fail or warn intentionally.",
      relatedHref: "html/mocking-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run mock-enabled tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not start service workers, open network servers, execute handlers, or run the analyzed project's tests.",
    relatedHref: "html/mocking-readiness.html"
  });

  return {
    summary: `MSW식 mocking readiness report: handler file ${handlerFiles.length}개, setup surface ${serverSetups.length}개, protocol signal ${protocolSignals.length}개, MSW signal ${mswSignals.length}개, package signal ${packageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Mock Service Worker setupWorker setupServer http graphql ws sse HttpResponse handlers onUnhandledRequest resetHandlers restoreHandlers passthrough bypass boundary events listHandlers serviceWorker findWorker quiet waitUntilReady cookieStore delay",
    handlerFiles,
    serverSetups,
    protocolSignals,
    lifecycleSignals,
    mswSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx msw init public/ --save", purpose: "Create a browser service-worker file for MSW development flows." },
      { command: "rg \"setupWorker|setupServer|http\\.|graphql\\.|ws\\.\" src test", purpose: "Inventory mock setup and handler definitions before running tests." },
      { command: "npx vitest run", purpose: "Run Node/jsdom tests that may use setupServer or shared handlers." },
      { command: "npx playwright test", purpose: "Run browser tests that may depend on setupWorker or route-level mocking." },
      { command: "MSW_UNHANDLED_REQUEST=error pnpm test", purpose: "Use a strict local test policy when the project supports it." },
      { command: "rg \"resetHandlers|restoreHandlers|server.close|worker.stop|onUnhandledRequest\" src test", purpose: "Check mock lifecycle cleanup and unexpected-request policy." },
      { command: "rg \"events\\.on|request:start|request:match|request:unhandled|response:mocked|response:bypass|unhandledException|boundary\\(|listHandlers|sse\\(|ws\\.link|HttpResponse\\.(json|text|html|xml|arrayBuffer|formData)|cookieStore|findWorker|serviceWorker\" src test", purpose: "Map MSW-specific lifecycle events, scoped boundaries, response builders, SSE/WebSocket mocks, cookie handling, and worker options." }
    ],
    learnerNextSteps: [
      "먼저 handlers 파일에서 어떤 API 경로와 응답이 가짜로 정의되어 있는지 확인하세요.",
      "브라우저 개발 흐름은 setupWorker, Node 테스트 흐름은 setupServer 연결을 찾으세요.",
      "테스트마다 resetHandlers나 restoreHandlers가 있는지 확인해 mock 상태가 새지 않게 하세요.",
      "MSW v2 프로젝트처럼 events, boundary, listHandlers, serviceWorker 옵션, SSE/WebSocket handler, HttpResponse variants를 별도 신호로 확인하세요.",
      "이 리포트는 mock 실행 결과가 아닙니다. 실제 API 대체 동작은 원본 프로젝트의 테스트나 브라우저에서 별도 확인하세요."
    ]
  };
}

type MockingReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function mockingReadinessSourceFiles(walk: WalkResult): Promise<MockingReadinessSourceFile[]> {
  const files: MockingReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !mockingReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!mockingReadinessPathSignal(file.relPath) && !mockingReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function mockingReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return mockingReadinessPathSignal(filePath)
    || /^(package\.json|vitest\.config\.[cm]?[jt]s|jest\.config\.[cm]?[jt]s|playwright\.config\.[cm]?[jt]s|setupTests\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|md|ya?ml)$/i.test(filePath);
}

function mockingReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(__mocks__|mocks?|mock[-_]?server|mock[-_]?worker|handlers?|fixtures?|test|tests|spec|e2e|msw)(\/|\.|-|_)/i.test(filePath)
    || /setup[-_.]?(tests?|server|worker|msw)|mockServiceWorker\.js/i.test(filePath);
}

function mockingReadinessContentSignal(text: string): boolean {
  return /\b(msw|setupWorker|setupServer|http\.(get|post|put|patch|delete|all)|graphql\.(query|mutation|operation|link)|ws\.link|sse\(|HttpResponse|server\.listen|worker\.start|resetHandlers|restoreHandlers|onUnhandledRequest|passthrough|bypass|boundary\(|events\.on|listHandlers|cookieStore|serviceWorker|findWorker|nock\(|pact|wiremock|fetch-mock|axios-mock-adapter)\b/i.test(text);
}

function mockingReadinessHandlerFiles(sourceFiles: MockingReadinessSourceFile[]): MockingReadinessReport["handlerFiles"] {
  const rows: MockingReadinessReport["handlerFiles"] = [];
  for (const source of sourceFiles) {
    const usesHttp = /\b(http\.(get|post|put|patch|delete|head|options|all)|rest\.(get|post|put|patch|delete|all))\b/i.test(source.text);
    const usesGraphql = /\bgraphql\.(query|mutation|operation|link)\b/i.test(source.text);
    const usesWebSocket = /\b(ws\.link|WebSocketHandler|webSocket|WebSocket)\b/i.test(source.text);
    const handlerCount = countMatches(source.text, /\b(http|rest)\.(get|post|put|patch|delete|head|options|all)\b|\bgraphql\.(query|mutation|operation|link)\b|\bws\.link\b/gi);
    const responseSignals = countMatches(source.text, /\b(HttpResponse|Response\.json|ctx\.|res\(|delay\(|passthrough\(|bypass\(|status\s*:|status\()/gi);
    if (handlerCount === 0 && responseSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      environment: mockingReadinessEnvironment(source),
      handlerCount,
      usesHttp,
      usesGraphql,
      usesWebSocket,
      responseSignals,
      readiness: handlerCount > 0 && responseSignals > 0 ? "ready" : "partial",
      evidence: `${source.filePath} contains ${handlerCount} handler definition(s), HTTP ${usesHttp ? "yes" : "no"}, GraphQL ${usesGraphql ? "yes" : "no"}, WebSocket ${usesWebSocket ? "yes" : "no"}, response signal ${responseSignals}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function mockingReadinessEnvironment(source: MockingReadinessSourceFile): MockingReadinessReport["handlerFiles"][number]["environment"] {
  if (/setupWorker|msw\/browser|mockServiceWorker|service worker/i.test(source.text) || /browser|worker/i.test(source.filePath)) return "browser";
  if (/setupServer|msw\/node|server\.listen|node/i.test(source.text) || /node|server/i.test(source.filePath)) return "node";
  if (/test|spec|vitest|jest|playwright/i.test(source.filePath)) return "test";
  if (/handlers?/i.test(source.filePath)) return "shared";
  return "unknown";
}

function mockingReadinessServerSetups(sourceFiles: MockingReadinessSourceFile[]): MockingReadinessReport["serverSetups"] {
  const rows: MockingReadinessReport["serverSetups"] = [];
  for (const source of sourceFiles) {
    const setupType = mockingReadinessSetupType(source.text);
    const startSignal = /\b(worker\.start|server\.listen|setupWorker\(|setupServer\()/i.test(source.text);
    const lifecycleSignal = /\b(resetHandlers|restoreHandlers|server\.close|worker\.stop|afterEach|afterAll|beforeAll|beforeEach|server\.use|worker\.use)\b/i.test(source.text);
    const unhandledPolicy = mockingReadinessUnhandledPolicy(source.text);
    if (setupType === "unknown" && !startSignal && !lifecycleSignal && unhandledPolicy === "missing") continue;
    rows.push({
      filePath: source.filePath,
      setupType,
      startSignal,
      lifecycleSignal,
      unhandledPolicy,
      readiness: setupType !== "unknown" && startSignal ? "ready" : "partial",
      evidence: `${source.filePath} contains ${setupType} setup with start ${startSignal ? "yes" : "no"}, lifecycle ${lifecycleSignal ? "yes" : "no"}, unhandled policy ${unhandledPolicy}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function mockingReadinessSetupType(text: string): MockingReadinessReport["serverSetups"][number]["setupType"] {
  if (/setupWorker|msw\/browser/i.test(text)) return "setupWorker";
  if (/setupServer|msw\/node/i.test(text)) return "setupServer";
  if (/msw\/native/i.test(text)) return "native";
  return "unknown";
}

function mockingReadinessUnhandledPolicy(text: string): MockingReadinessReport["serverSetups"][number]["unhandledPolicy"] {
  const match = firstMatch(text, /onUnhandledRequest\s*:\s*["'](error|warn|bypass)["']/i);
  if (match === "error" || match === "warn" || match === "bypass") return match;
  if (/onUnhandledRequest\s*:/i.test(text)) return "custom";
  return "missing";
}

function mockingReadinessProtocolSignals(sourceFiles: MockingReadinessSourceFile[]): MockingReadinessReport["protocolSignals"] {
  const specs: Array<{ signal: MockingReadinessReport["protocolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rest", pattern: /\b(http|rest)\.(get|post|put|patch|delete|head|options|all)\b/i, evidence: "REST/HTTP handler evidence was detected." },
    { signal: "graphql", pattern: /\bgraphql\.(query|mutation|operation|link)\b/i, evidence: "GraphQL handler evidence was detected." },
    { signal: "websocket", pattern: /\b(ws\.link|WebSocketHandler|webSocket|WebSocket)\b/i, evidence: "WebSocket mock evidence was detected." },
    { signal: "http-response", pattern: /\bHttpResponse|Response\.json|ctx\.json|res\(/i, evidence: "mock response builder evidence was detected." },
    { signal: "delay", pattern: /\bdelay\(/i, evidence: "mock latency/delay evidence was detected." },
    { signal: "passthrough", pattern: /\bpassthrough\(|x-msw-bypass/i, evidence: "passthrough evidence was detected." },
    { signal: "bypass", pattern: /\bbypass\(/i, evidence: "bypass request evidence was detected." },
    { signal: "cookies", pattern: /\bcookies\b|cookieStore|Set-Cookie/i, evidence: "cookie-aware mock evidence was detected." },
    { signal: "params", pattern: /\bparams\b|path-to-regexp|:id\b|:slug\b/i, evidence: "route parameter evidence was detected." }
  ];
  return mockingReadinessSignalFromSpecs(sourceFiles, specs, "protocol", "signal");
}

function mockingReadinessLifecycleSignals(sourceFiles: MockingReadinessSourceFile[]): MockingReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: MockingReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "setupWorker", pattern: /\bsetupWorker\b|msw\/browser/i, evidence: "browser worker setup evidence was detected." },
    { signal: "setupServer", pattern: /\bsetupServer\b|msw\/node/i, evidence: "Node server setup evidence was detected." },
    { signal: "listen", pattern: /\bserver\.listen\b/i, evidence: "server listen lifecycle evidence was detected." },
    { signal: "start", pattern: /\bworker\.start\b/i, evidence: "worker start lifecycle evidence was detected." },
    { signal: "use", pattern: /\b(server|worker)\.use\b/i, evidence: "runtime handler override evidence was detected." },
    { signal: "resetHandlers", pattern: /\bresetHandlers\b/i, evidence: "handler reset evidence was detected." },
    { signal: "restoreHandlers", pattern: /\brestoreHandlers\b/i, evidence: "handler restore evidence was detected." },
    { signal: "close", pattern: /\bserver\.close\b|\bworker\.stop\b/i, evidence: "mock shutdown evidence was detected." },
    { signal: "boundary", pattern: /\bboundary\(/i, evidence: "scoped mock boundary evidence was detected." },
    { signal: "onUnhandledRequest", pattern: /\bonUnhandledRequest\b/i, evidence: "unhandled request policy evidence was detected." }
  ];
  return mockingReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function mockingReadinessMswSignals(sourceFiles: MockingReadinessSourceFile[]): MockingReadinessReport["mswSignals"] {
  const specs: Array<{ signal: MockingReadinessReport["mswSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "http-handler", pattern: /\bhttp\.(get|post|put|patch|delete|head|options|all)\b/i, evidence: "MSW v2 HTTP handler evidence was detected." },
    { signal: "graphql-handler", pattern: /\bgraphql\.(query|mutation|operation|link)\b/i, evidence: "MSW GraphQL handler evidence was detected." },
    { signal: "websocket-handler", pattern: /\bws\.link|WebSocketHandler|addEventListener\(['"]connection['"]/i, evidence: "MSW WebSocket handler evidence was detected." },
    { signal: "sse-handler", pattern: /\bsse\(|ServerSentEvent|EventSource|text\/event-stream/i, evidence: "MSW Server-Sent Events handler evidence was detected." },
    { signal: "setup-worker", pattern: /\bsetupWorker\b|msw\/browser/i, evidence: "MSW browser setupWorker evidence was detected." },
    { signal: "setup-server", pattern: /\bsetupServer\b|msw\/node/i, evidence: "MSW Node setupServer evidence was detected." },
    { signal: "native-server", pattern: /msw\/native|native\/index|setupServer\(\.\.\.handlers/i, evidence: "MSW native server evidence was detected." },
    { signal: "service-worker-options", pattern: /serviceWorker\s*:|serviceWorker\.url|serviceWorker\.options|mockServiceWorker\.js/i, evidence: "Service worker configuration evidence was detected." },
    { signal: "find-worker", pattern: /findWorker/i, evidence: "Custom worker lookup evidence was detected." },
    { signal: "quiet-option", pattern: /quiet\s*:\s*true|options\.quiet/i, evidence: "Quiet logging option evidence was detected." },
    { signal: "wait-until-ready", pattern: /waitUntilReady/i, evidence: "waitUntilReady compatibility evidence was detected." },
    { signal: "worker-integrity", pattern: /integrity|checksum|check.*worker.*script/i, evidence: "Service worker integrity check evidence was detected." },
    { signal: "http-response-json", pattern: /HttpResponse\.json|Response\.json/i, evidence: "JSON response builder evidence was detected." },
    { signal: "http-response-text", pattern: /HttpResponse\.text/i, evidence: "Text response builder evidence was detected." },
    { signal: "http-response-html", pattern: /HttpResponse\.html/i, evidence: "HTML response builder evidence was detected." },
    { signal: "http-response-xml", pattern: /HttpResponse\.xml/i, evidence: "XML response builder evidence was detected." },
    { signal: "http-response-array-buffer", pattern: /HttpResponse\.arrayBuffer|arrayBuffer\(/i, evidence: "Binary response builder evidence was detected." },
    { signal: "http-response-form-data", pattern: /HttpResponse\.formData|formData\(/i, evidence: "FormData response builder evidence was detected." },
    { signal: "delay", pattern: /\bdelay\(/i, evidence: "Mock latency helper evidence was detected." },
    { signal: "passthrough", pattern: /\bpassthrough\(|x-msw-intention|msw\/passthrough/i, evidence: "Passthrough response evidence was detected." },
    { signal: "bypass", pattern: /\bbypass\(|msw\/passthrough/i, evidence: "Bypass request evidence was detected." },
    { signal: "route-params", pattern: /\bparams\b|:id\b|:slug\b|path-to-regexp|matchRequestUrl/i, evidence: "Route parameter matching evidence was detected." },
    { signal: "request-cookies", pattern: /\bcookies\b|getRequestCookies|document\.cookie|requestCookieHeader/i, evidence: "Request cookie handling evidence was detected." },
    { signal: "response-cookies", pattern: /Set-Cookie|set-cookie|storeResponseCookies|cookieStore\.setCookie/i, evidence: "Response cookie persistence evidence was detected." },
    { signal: "unhandled-error", pattern: /onUnhandledRequest\s*:\s*["']error["']|case ['"]error['"]/i, evidence: "Unhandled request error strategy evidence was detected." },
    { signal: "unhandled-warn", pattern: /onUnhandledRequest\s*:\s*["']warn["']|case ['"]warn['"]/i, evidence: "Unhandled request warn strategy evidence was detected." },
    { signal: "unhandled-bypass", pattern: /onUnhandledRequest\s*:\s*["']bypass["']|case ['"]bypass['"]/i, evidence: "Unhandled request bypass strategy evidence was detected." },
    { signal: "unhandled-callback", pattern: /onUnhandledRequest\s*\([^)]|onUnhandledRequest\s*:\s*\(|UnhandledRequestCallback/i, evidence: "Unhandled request callback evidence was detected." },
    { signal: "lifecycle-events", pattern: /LifeCycleEventEmitter|life-cycle events|events:\s*LifeCycleEventEmitter|events\.on/i, evidence: "MSW lifecycle event API evidence was detected." },
    { signal: "request-events", pattern: /request:(start|match|unhandled|end)/i, evidence: "Request lifecycle event evidence was detected." },
    { signal: "response-events", pattern: /response:(mocked|bypass)/i, evidence: "Response lifecycle event evidence was detected." },
    { signal: "unhandled-exception-event", pattern: /unhandledException/i, evidence: "Unhandled exception event evidence was detected." },
    { signal: "boundary", pattern: /\bboundary\(/i, evidence: "Scoped server boundary evidence was detected." },
    { signal: "list-handlers", pattern: /listHandlers/i, evidence: "Handler inventory API evidence was detected." },
    { signal: "runtime-use", pattern: /\b(server|worker)\.use\b|\buse\(\.\.\.handlers/i, evidence: "Runtime handler override evidence was detected." },
    { signal: "reset-handlers", pattern: /resetHandlers/i, evidence: "Reset handlers evidence was detected." },
    { signal: "restore-handlers", pattern: /restoreHandlers/i, evidence: "Restore handlers evidence was detected." },
    { signal: "close-stop", pattern: /server\.close|worker\.stop|\bstop:\s*StopHandler/i, evidence: "Mock shutdown evidence was detected." },
    { signal: "request-handler-types", pattern: /RequestHandler|HttpHandler|GraphQLHandler|WebSocketHandler|AnyHandler/i, evidence: "Typed handler API evidence was detected." },
    { signal: "response-resolver-types", pattern: /ResponseResolver|HttpResponseResolver|ServerSentEventResolver/i, evidence: "Typed response resolver evidence was detected." },
    { signal: "ws-client-send", pattern: /client\.send\(|WebSocketClient/i, evidence: "WebSocket client send evidence was detected." },
    { signal: "ws-server-connect", pattern: /server\.connect\(|WebSocketServerConnection|addEventListener\(['"]connection['"]/i, evidence: "WebSocket server connection evidence was detected." },
    { signal: "sse-client-send", pattern: /client\.send\(\{[^}]*data|ServerSentEventClient/i, evidence: "SSE client send evidence was detected." },
    { signal: "sse-retry", pattern: /retry:\s*\d+|retry\?:|ServerSentEventMessage/i, evidence: "SSE retry/message metadata evidence was detected." }
  ];
  return mockingReadinessSignalFromSpecs(sourceFiles, specs, "msw", "signal");
}

function mockingReadinessPackageSignals(sourceFiles: MockingReadinessSourceFile[]): MockingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MockingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "msw", pattern: /["']msw["']|msw\/browser|msw\/node|Mock Service Worker/i, evidence: "MSW package evidence was detected." },
    { signal: "nock", pattern: /["']nock["']|\bnock\(/i, evidence: "Nock package evidence was detected." },
    { signal: "pact", pattern: /@pact-foundation\/pact|pact-js|\bPact\b/i, evidence: "Pact package evidence was detected." },
    { signal: "wiremock", pattern: /wiremock/i, evidence: "WireMock package evidence was detected." },
    { signal: "fetch-mock", pattern: /fetch-mock/i, evidence: "fetch-mock package evidence was detected." },
    { signal: "axios-mock-adapter", pattern: /axios-mock-adapter/i, evidence: "axios-mock-adapter package evidence was detected." }
  ];
  return mockingReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function mockingReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: MockingReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/mocking-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
