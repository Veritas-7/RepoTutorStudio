import path from "node:path";
import type { BuildToolReadinessReport, StylingReadinessReport, VisualRegressionReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildBuildToolReadinessReport(walk: WalkResult): Promise<BuildToolReadinessReport> {
  const sourceFiles = await buildToolSourceFiles(walk);
  const buildToolSetups = buildToolSetupFiles(sourceFiles);
  const configSignals = buildToolConfigSignals(sourceFiles);
  const pluginSignals = buildToolPluginSignals(sourceFiles);
  const devServerSignals = buildToolDevServerSignals(sourceFiles);
  const buildSignals = buildToolBuildSignals(sourceFiles);
  const environmentSignals = buildToolEnvironmentSignals(sourceFiles);
  const ssrSignals = buildToolSsrSignals(sourceFiles);
  const dependencyOptimizationSignals = buildToolDependencyOptimizationSignals(sourceFiles);
  const packageSignals = buildToolPackageSignals(sourceFiles);

  const hasBuildTool = buildToolSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasConfig = configSignals.some((item) => item.readiness === "ready") || buildToolSetups.some((item) => item.configCount > 0);
  const hasPlugin = pluginSignals.some((item) => item.readiness === "ready") || buildToolSetups.some((item) => item.pluginCount > 0);
  const hasDevOrBuild = devServerSignals.some((item) => item.readiness === "ready")
    || buildSignals.some((item) => item.readiness === "ready")
    || buildToolSetups.some((item) => item.devServerCount + item.buildCount + item.previewCount > 0);
  const hasEnv = environmentSignals.some((item) => item.readiness === "ready") || buildToolSetups.some((item) => item.envCount > 0);
  const hasDepOptimization = dependencyOptimizationSignals.some((item) => item.readiness === "ready") || buildToolSetups.some((item) => item.depOptimizationCount > 0);

  const riskQueue: BuildToolReadinessReport["riskQueue"] = [];
  if (!hasBuildTool) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document build tooling before claiming frontend build readiness.",
      why: "Build-tool readiness starts with a discoverable Vite, Webpack, Rollup, esbuild, Parcel, framework config, or package script signal.",
      relatedHref: "html/build-tool-readiness.html"
    });
  }
  if (hasBuildTool && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Record config files, defineConfig usage, root/base, aliases, env dir, and cache directory choices.",
      why: "Learners need the build contract before they can explain entry resolution, asset paths, mode-specific behavior, or cache behavior.",
      relatedHref: "html/build-tool-readiness.html"
    });
  }
  if (hasBuildTool && !hasPlugin) {
    riskQueue.push({
      priority: "medium",
      action: "Trace plugin arrays, official plugins, custom plugin hooks, apply/enforce scope, and HTML/HMR transforms.",
      why: "Vite-style build behavior is often hidden in plugin lifecycle hooks rather than plain config fields.",
      relatedHref: "html/build-tool-readiness.html"
    });
  }
  if (hasBuildTool && !hasDevOrBuild) {
    riskQueue.push({
      priority: "high",
      action: "Document dev server, preview server, production build, output, sourcemap, target, and manifest behavior.",
      why: "A build tool is incomplete for study if learners cannot distinguish development serving from production output.",
      relatedHref: "html/build-tool-readiness.html"
    });
  }
  if (hasBuildTool && !hasEnv) {
    riskQueue.push({
      priority: "medium",
      action: "Document envPrefix, loadEnv, import.meta.env, mode, base URL, define replacements, and dotenv boundaries.",
      why: "Frontend builds can leak or miss environment values when public prefixes and mode-specific values are not explicit.",
      relatedHref: "html/build-tool-readiness.html"
    });
  }
  if (hasBuildTool && !hasDepOptimization) {
    riskQueue.push({
      priority: "medium",
      action: "Record dependency optimization include/exclude/entries, force/cache behavior, and linked-package rules.",
      why: "Vite-like tools can behave differently for pre-bundled dependencies, linked workspaces, and stale caches.",
      relatedHref: "html/build-tool-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify builds in the original runtime before treating this report as operational approval.",
    why: "RepoTutor records build-tool readiness only; it does not start dev servers, run production builds, transform modules, execute plugins, pre-bundle dependencies, load env files, or validate SSR output.",
    relatedHref: "html/build-tool-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Vite-style build tool readiness report: setup ${buildToolSetups.length}개, config signal ${configSignals.length}개, plugin signal ${pluginSignals.length}개, build signal ${buildSignals.length}개, dependency optimization signal ${dependencyOptimizationSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Vite defineConfig plugins createServer preview build optimizeDeps ssr loadEnv import.meta.env transformIndexHtml configureServer",
    buildToolSetups,
    configSignals,
    pluginSignals,
    devServerSignals,
    buildSignals,
    environmentSignals,
    ssrSignals,
    dependencyOptimizationSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"vite.config|defineConfig|webpack.config|rollup.config|parcel|esbuild|astro.config|nuxt.config|next.config\" .", purpose: "Find build tool config entrypoints and framework wrappers." },
      { command: "rg \"plugins:|@vitejs/plugin|transformIndexHtml|configureServer|configurePreviewServer|handleHotUpdate|resolveId|load\\(|transform\\(\" .", purpose: "Trace plugin arrays and lifecycle hooks that can change module output." },
      { command: "rg \"server:|preview:|middlewareMode|proxy:|cors:|https:|hmr:|warmup|vite preview\" .", purpose: "Review development and preview server behavior without starting the server." },
      { command: "rg \"build:|outDir|sourcemap|minify|target|lib:|manifest|rollupOptions|rolldownOptions|optimizeDeps|loadEnv|import\\.meta\\.env|envPrefix|ssr:\" .", purpose: "Check production build, env, SSR, and dependency optimization contracts." }
    ],
    learnerNextSteps: [
      "먼저 vite.config, webpack.config, rollup.config, package scripts, framework config 파일로 build tool entrypoint를 확인하세요.",
      "defineConfig, root/base, resolve.alias, envDir, cacheDir 신호로 config contract를 분리하세요.",
      "plugins array, official plugin, custom plugin, transformIndexHtml, configureServer, handleHotUpdate, Rollup hook 신호로 plugin lifecycle을 확인하세요.",
      "server, preview, proxy, cors, https, middlewareMode, hmr, warmup 신호로 dev/preview runtime 차이를 정리하세요.",
      "build, outDir, sourcemap, minify, target, lib, manifest, rollupOptions/rolldownOptions 신호로 production output을 확인하세요.",
      "optimizeDeps include/exclude/entries/force/cache, linked package, esbuild/rolldown options 신호로 dependency pre-bundling 준비도를 확인하세요.",
      "이 리포트는 정적 readiness입니다. dev server start, production build, plugin execution, dependency pre-bundling, SSR rendering은 원본 런타임에서 별도 검증하세요."
    ]
  };
}

type BuildToolSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function buildToolSourceFiles(walk: WalkResult): Promise<BuildToolSourceFile[]> {
  const files: BuildToolSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !buildToolInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!buildToolPathSignal(file.relPath) && !buildToolContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function buildToolInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return buildToolPathSignal(filePath)
    || /^(package\.json|vite\.config\.[cm]?[jt]s|webpack\.config\.[cm]?[jt]s|rollup\.config\.[cm]?[jt]s|esbuild\.config\.[cm]?[jt]s|parcelrc|\.parcelrc|astro\.config\.[cm]?[jt]s|nuxt\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|ya?ml|toml|md|mdx)$/i.test(filePath);
}

function buildToolPathSignal(filePath: string): boolean {
  return /(^|\/)(vite|webpack|rollup|esbuild|parcel|astro|nuxt|next)\.config\.[cm]?[jt]s$/i.test(filePath)
    || /(^|\/)(package\.json|pnpm-workspace\.yaml|turbo\.json|\.parcelrc)$/i.test(filePath)
    || /(^|\/)(build|scripts|config|configs)(\/|$)/i.test(filePath)
    || /(^|\/)\.env\.(example|sample|template)$/i.test(filePath);
}

function buildToolContentSignal(text: string): boolean {
  return /(Vite|defineConfig|PluginOption|plugins\s*:|createServer\s*\(|vite build|vite preview|optimizeDeps|loadEnv|envPrefix|import\.meta\.env|transformIndexHtml|configureServer|configurePreviewServer|handleHotUpdate|rollupOptions|rolldownOptions|webpack|rollup|esbuild|parcel|ssrManifest|ModuleRunner)/i.test(text);
}

function buildToolSetupFiles(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["buildToolSetups"] {
  const rows: BuildToolReadinessReport["buildToolSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /vite\.config|webpack\.config|rollup\.config|esbuild\.config|parcelrc|astro\.config|nuxt\.config|next\.config|defineConfig|UserConfig|loadConfigFromFile|resolveConfig|root\s*:|base\s*:|cacheDir|resolve\s*:\s*\{|alias\s*:/gi) + (/(^|\/)(vite|webpack|rollup|esbuild|parcel|astro|nuxt|next)\.config/i.test(source.filePath) ? 1 : 0);
    const pluginCount = countMatches(source.text, /plugins\s*:|PluginOption|@vitejs\/plugin-|transformIndexHtml|configureServer|configurePreviewServer|handleHotUpdate|configResolved|resolveId|load\s*\(|transform\s*\(|buildStart|generateBundle|closeBundle/gi);
    const devServerCount = countMatches(source.text, /createServer\s*\(|server\s*:\s*\{|middlewareMode|hmr\s*:|proxy\s*:|cors\s*:|https\s*:|strictPort|warmup|DEFAULT_DEV_PORT|vite --host|vite --debug/gi);
    const buildCount = countMatches(source.text, /build\s*:\s*\{|vite build|build\(|outDir|assetsDir|sourcemap|minify|target|lib\s*:|manifest|rolldownOptions|rollupOptions|cssCodeSplit|ssrManifest/gi);
    const previewCount = countMatches(source.text, /preview\s*:\s*\{|vite preview|configurePreviewServer|PreviewServer|DEFAULT_PREVIEW_PORT|preview\.port|allowedHosts|headers/gi);
    const envCount = countMatches(source.text, /loadEnv|envPrefix|envDir|import\.meta\.env|MODE|BASE_URL|DEV|PROD|define\s*:|dotenv|VITE_/gi);
    const ssrCount = countMatches(source.text, /ssr\s*:|build\.ssr|ssrLoadModule|ModuleRunner|middlewareMode|ssrManifest|ssr\.external|ssr\.noExternal|ssr\.target|import\.meta\.env\.SSR/gi);
    const depOptimizationCount = countMatches(source.text, /optimizeDeps|dep optimization|pre-bundl|include\s*:|exclude\s*:|entries\s*:|cacheDir|--force|forceOptimizeDeps|rolldownOptions|esbuildOptions|linked dep/gi);
    const hasSignal = configCount + pluginCount + devServerCount + buildCount + previewCount + envCount + ssrCount + depOptimizationCount > 0;
    if (!hasSignal) continue;
    rows.push({
      filePath: source.filePath,
      tool: buildToolTool(source),
      configCount,
      pluginCount,
      devServerCount,
      buildCount,
      previewCount,
      envCount,
      ssrCount,
      depOptimizationCount,
      readiness: configCount > 0 && (pluginCount > 0 || devServerCount > 0 || buildCount > 0) ? "ready" : hasSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, plugins ${pluginCount}, dev server ${devServerCount}, build ${buildCount}, preview ${previewCount}, env ${envCount}, SSR ${ssrCount}, dependency optimization ${depOptimizationCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function buildToolTool(source: BuildToolSourceFile): BuildToolReadinessReport["buildToolSetups"][number]["tool"] {
  if (/vite|@vitejs\/plugin-|defineConfig|optimizeDeps|transformIndexHtml|configureServer/i.test(source.filePath) || /"vite"|from ['"]vite|defineConfig|@vitejs\/plugin-|optimizeDeps|transformIndexHtml|configureServer/i.test(source.text)) return "vite";
  if (/webpack\.config/i.test(source.filePath) || /"webpack"|from ['"]webpack|webpack\(|module\.exports|webpack-dev-server/i.test(source.text)) return "webpack";
  if (/rollup\.config/i.test(source.filePath) || /"rollup"|from ['"]rollup|rollupOptions|rollup\(/i.test(source.text)) return "rollup";
  if (/esbuild/i.test(source.filePath) || /"esbuild"|from ['"]esbuild|esbuild\.build|esbuildOptions/i.test(source.text)) return "esbuild";
  if (/parcel|\.parcelrc/i.test(source.filePath) || /"parcel"|parcel build|parcel serve/i.test(source.text)) return "parcel";
  if (/next\.config/i.test(source.filePath) || /"next"|next build|next dev/i.test(source.text)) return "next";
  if (/nuxt\.config/i.test(source.filePath) || /"nuxt"|nuxt build|nuxt dev/i.test(source.text)) return "nuxt";
  if (/astro\.config/i.test(source.filePath) || /"astro"|astro build|astro dev/i.test(source.text)) return "astro";
  if (/build|bundle|compile/i.test(source.filePath) || /build\s*:\s*\{|bundle|transpile/i.test(source.text)) return "custom";
  return "unknown";
}

function buildToolConfigSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["configSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "config-file", pattern: /(^|\/)(vite|webpack|rollup|esbuild|parcel|astro|nuxt|next)\.config\.[cm]?[jt]s|\.parcelrc/i, evidence: "build config file evidence was detected." },
    { signal: "define-config", pattern: /defineConfig\s*\(/i, evidence: "defineConfig evidence was detected." },
    { signal: "config-function", pattern: /export\s+default\s+(?:defineConfig\s*\()?(\(|async\s*\(|function)|mode\s*=>|command\s*=>/i, evidence: "mode-aware config function evidence was detected." },
    { signal: "mode-aware", pattern: /\bmode\b|\bcommand\b|process\.env\.NODE_ENV|import\.meta\.env\.MODE/i, evidence: "mode-aware config evidence was detected." },
    { signal: "root-base", pattern: /root\s*:|base\s*:/i, evidence: "root/base path evidence was detected." },
    { signal: "resolve-alias", pattern: /resolve\s*:\s*\{|alias\s*:/i, evidence: "resolve alias evidence was detected." },
    { signal: "env-dir", pattern: /envDir|\.env\.(example|sample|template)/i, evidence: "environment directory/example evidence was detected." },
    { signal: "cache-dir", pattern: /cacheDir|node_modules\/\.vite|\.vite\/deps/i, evidence: "cache directory evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function buildToolPluginSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["pluginSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["pluginSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "plugins-array", pattern: /plugins\s*:/i, evidence: "plugins array evidence was detected." },
    { signal: "official-plugin", pattern: /@vitejs\/plugin-|vite-plugin-|@rollup\/plugin-/i, evidence: "official or ecosystem plugin evidence was detected." },
    { signal: "custom-plugin", pattern: /name\s*:\s*['"][^'"]+['"].{0,400}(?:transform|resolveId|load|configureServer|buildStart)|function\s+\w*Plugin/i, evidence: "custom plugin evidence was detected." },
    { signal: "enforce-order", pattern: /enforce\s*:\s*['"](pre|post)['"]/i, evidence: "plugin enforce order evidence was detected." },
    { signal: "apply-scope", pattern: /apply\s*:\s*['"](serve|build)['"]|apply\s*:\s*\(/i, evidence: "plugin apply scope evidence was detected." },
    { signal: "config-resolved", pattern: /configResolved\s*\(/i, evidence: "configResolved lifecycle evidence was detected." },
    { signal: "transform-index-html", pattern: /transformIndexHtml/i, evidence: "transformIndexHtml hook evidence was detected." },
    { signal: "hmr-hook", pattern: /handleHotUpdate|hotUpdate|moduleGraph|server\.ws/i, evidence: "HMR hook evidence was detected." },
    { signal: "rollup-hook", pattern: /resolveId\s*\(|load\s*\(|transform\s*\(|buildStart\s*\(|generateBundle\s*\(|closeBundle\s*\(/i, evidence: "Rollup-compatible hook evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "plugin", "signal");
}

function buildToolDevServerSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["devServerSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["devServerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dev-server", pattern: /createServer\s*\(|vite dev|vite --host|webpack-dev-server|next dev|astro dev|nuxt dev/i, evidence: "dev server evidence was detected." },
    { signal: "server-port", pattern: /server\s*:\s*\{|port\s*:|strictPort|DEFAULT_DEV_PORT/i, evidence: "server port evidence was detected." },
    { signal: "proxy", pattern: /proxy\s*:/i, evidence: "proxy evidence was detected." },
    { signal: "cors", pattern: /cors\s*:/i, evidence: "CORS evidence was detected." },
    { signal: "https", pattern: /https\s*:/i, evidence: "HTTPS evidence was detected." },
    { signal: "open", pattern: /open\s*:/i, evidence: "auto-open evidence was detected." },
    { signal: "middleware-mode", pattern: /middlewareMode|middlewares/i, evidence: "middleware mode evidence was detected." },
    { signal: "hmr", pattern: /hmr\s*:|handleHotUpdate|server\.ws/i, evidence: "HMR evidence was detected." },
    { signal: "warmup", pattern: /warmup\s*:/i, evidence: "warmup evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "dev server", "signal");
}

function buildToolBuildSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["buildSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["buildSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "build-command", pattern: /vite build|webpack --mode production|rollup -c|parcel build|esbuild .*--bundle|npm run build|pnpm build/i, evidence: "build command evidence was detected." },
    { signal: "out-dir", pattern: /outDir|output\.path|dist\/|build\/|assetsDir/i, evidence: "output directory evidence was detected." },
    { signal: "sourcemap", pattern: /sourcemap|sourceMap|devtool\s*:/i, evidence: "sourcemap evidence was detected." },
    { signal: "minify", pattern: /minify|terser|esbuild.*minify|cssMinify/i, evidence: "minify evidence was detected." },
    { signal: "target", pattern: /target\s*:|browserslist|esnext|modules\s*:/i, evidence: "target evidence was detected." },
    { signal: "library-mode", pattern: /lib\s*:|library\s*:|formats\s*:|entry\s*:/i, evidence: "library mode evidence was detected." },
    { signal: "manifest", pattern: /manifest\s*:|ssrManifest|manifest\.json/i, evidence: "manifest evidence was detected." },
    { signal: "rollup-options", pattern: /rollupOptions|rolldownOptions|manualChunks|external\s*:|output\s*:/i, evidence: "Rollup/Rolldown options evidence was detected." },
    { signal: "assets", pattern: /assetsDir|assetsInclude|assetFileNames|cssCodeSplit|inlineLimit/i, evidence: "asset handling evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "build", "signal");
}

function buildToolEnvironmentSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["environmentSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["environmentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "env-prefix", pattern: /envPrefix|VITE_/i, evidence: "env prefix evidence was detected." },
    { signal: "load-env", pattern: /loadEnv\s*\(/i, evidence: "loadEnv evidence was detected." },
    { signal: "import-meta-env", pattern: /import\.meta\.env/i, evidence: "import.meta.env evidence was detected." },
    { signal: "mode", pattern: /\bMODE\b|\bmode\b|process\.env\.NODE_ENV/i, evidence: "mode evidence was detected." },
    { signal: "base-url", pattern: /BASE_URL|base\s*:/i, evidence: "base URL evidence was detected." },
    { signal: "ssr-env", pattern: /import\.meta\.env\.SSR|\bSSR\b/i, evidence: "SSR env evidence was detected." },
    { signal: "dotenv", pattern: /dotenv|\.env\.(example|sample|template|local|development|production)/i, evidence: "dotenv evidence was detected." },
    { signal: "define", pattern: /define\s*:/i, evidence: "define replacement evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "environment", "signal");
}

function buildToolSsrSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["ssrSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["ssrSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ssr-entry", pattern: /build\.ssr|ssr\s*:|entry-server|server-entry|ssrLoadModule/i, evidence: "SSR entry evidence was detected." },
    { signal: "ssr-external", pattern: /ssr\.external|external\s*:/i, evidence: "SSR external evidence was detected." },
    { signal: "ssr-no-external", pattern: /ssr\.noExternal|noExternal/i, evidence: "SSR noExternal evidence was detected." },
    { signal: "ssr-target", pattern: /ssr\.target|target\s*:\s*['"](node|webworker)/i, evidence: "SSR target evidence was detected." },
    { signal: "ssr-manifest", pattern: /ssrManifest|manifest\s*:/i, evidence: "SSR manifest evidence was detected." },
    { signal: "middleware-mode", pattern: /middlewareMode|appType\s*:\s*['"]custom['"]/i, evidence: "SSR middleware evidence was detected." },
    { signal: "module-runner", pattern: /ModuleRunner|ssrLoadModule|runner\.import/i, evidence: "module runner evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "SSR", "signal");
}

function buildToolDependencyOptimizationSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["dependencyOptimizationSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["dependencyOptimizationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "optimize-deps", pattern: /optimizeDeps|dep optimization|pre-bundl/i, evidence: "dependency optimization evidence was detected." },
    { signal: "include", pattern: /optimizeDeps[\s\S]{0,400}include\s*:|include\s*:/i, evidence: "include evidence was detected." },
    { signal: "exclude", pattern: /optimizeDeps[\s\S]{0,400}exclude\s*:|exclude\s*:/i, evidence: "exclude evidence was detected." },
    { signal: "entries", pattern: /optimizeDeps[\s\S]{0,400}entries\s*:|entries\s*:/i, evidence: "entries evidence was detected." },
    { signal: "force", pattern: /--force|forceOptimizeDeps|optimizeDeps[\s\S]{0,400}force/i, evidence: "force optimization evidence was detected." },
    { signal: "cache-dir", pattern: /cacheDir|node_modules\/\.vite|\.vite\/deps/i, evidence: "cache directory evidence was detected." },
    { signal: "rolldown-options", pattern: /rolldownOptions/i, evidence: "Rolldown options evidence was detected." },
    { signal: "esbuild-options", pattern: /esbuildOptions/i, evidence: "esbuild options evidence was detected." },
    { signal: "linked-package", pattern: /linked package|linked dep|workspace:|pnpm-workspace|preserveSymlinks/i, evidence: "linked package evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "dependency optimization", "signal");
}

function buildToolPackageSignals(sourceFiles: BuildToolSourceFile[]): BuildToolReadinessReport["packageSignals"] {
  const specs: Array<{ signal: BuildToolReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vite", pattern: /"vite"|from ['"]vite|defineConfig|vite build|vite preview/i, evidence: "Vite evidence was detected." },
    { signal: "@vitejs/plugin-react", pattern: /@vitejs\/plugin-react/i, evidence: "@vitejs/plugin-react evidence was detected." },
    { signal: "@vitejs/plugin-vue", pattern: /@vitejs\/plugin-vue/i, evidence: "@vitejs/plugin-vue evidence was detected." },
    { signal: "webpack", pattern: /"webpack"|webpack\.config|webpack-dev-server/i, evidence: "Webpack evidence was detected." },
    { signal: "rollup", pattern: /"rollup"|rollup\.config|rollupOptions/i, evidence: "Rollup evidence was detected." },
    { signal: "esbuild", pattern: /"esbuild"|esbuild\.build|esbuildOptions/i, evidence: "esbuild evidence was detected." },
    { signal: "parcel", pattern: /"parcel"|\.parcelrc|parcel build/i, evidence: "Parcel evidence was detected." },
    { signal: "rolldown", pattern: /rolldown|rolldownOptions/i, evidence: "Rolldown evidence was detected." }
  ];
  return buildToolSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function buildToolSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: BuildToolSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/build-tool-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildStylingReadinessReport(walk: WalkResult): Promise<StylingReadinessReport> {
  const sourceFiles = await stylingSourceFiles(walk);
  const stylingSetups = stylingSetupFiles(sourceFiles);
  const configSignals = stylingConfigSignals(sourceFiles);
  const directiveSignals = stylingDirectiveSignals(sourceFiles);
  const classSignals = stylingClassSignals(sourceFiles);
  const themeSignals = stylingThemeSignals(sourceFiles);
  const integrationSignals = stylingIntegrationSignals(sourceFiles);
  const packageSignals = stylingPackageSignals(sourceFiles);

  const hasStyling = stylingSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasContent = configSignals.some((item) => item.signal === "content-globs" && item.readiness === "ready") || directiveSignals.some((item) => item.signal === "source-directive" && item.readiness === "ready") || stylingSetups.some((item) => item.contentScanCount > 0);
  const hasEntry = directiveSignals.some((item) => ["import-tailwind", "tailwind-directive"].includes(item.signal) && item.readiness === "ready") || integrationSignals.some((item) => item.signal === "css-entry" && item.readiness === "ready");
  const hasTheme = themeSignals.some((item) => item.readiness === "ready") || stylingSetups.some((item) => item.themeCount > 0);
  const hasIntegration = integrationSignals.some((item) => item.readiness === "ready") || stylingSetups.some((item) => item.buildIntegrationCount > 0);

  const riskQueue: StylingReadinessReport["riskQueue"] = [];
  if (!hasStyling) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the styling framework before claiming utility CSS readiness.",
      why: "Styling readiness starts with Tailwind, UnoCSS, Bootstrap, Sass, PostCSS, CSS modules, or an explicit stylesheet entrypoint.",
      relatedHref: "html/styling-readiness.html"
    });
  }
  if (hasStyling && !hasEntry) {
    riskQueue.push({
      priority: "high",
      action: "Trace the CSS entrypoint that imports Tailwind or declares Tailwind directives.",
      why: "Without a CSS entrypoint, learners cannot connect class usage to generated styles.",
      relatedHref: "html/styling-readiness.html"
    });
  }
  if (hasStyling && !hasContent) {
    riskQueue.push({
      priority: "high",
      action: "Record content globs, @source directives, safelist policy, and ignored file behavior.",
      why: "Utility CSS output depends on class candidate scanning; missing content boundaries create missing or bloated CSS.",
      relatedHref: "html/styling-readiness.html"
    });
  }
  if (hasStyling && !hasTheme) {
    riskQueue.push({
      priority: "medium",
      action: "Document theme tokens, CSS custom properties, colors, spacing, typography, and breakpoint ownership.",
      why: "Tailwind-style systems often encode design decisions in theme variables rather than component files.",
      relatedHref: "html/styling-readiness.html"
    });
  }
  if (hasStyling && !hasIntegration) {
    riskQueue.push({
      priority: "medium",
      action: "Trace PostCSS, Vite, webpack, CLI, watch, and build-script integration.",
      why: "A styling setup is incomplete if learners cannot see how CSS is compiled in development and production.",
      relatedHref: "html/styling-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify generated CSS in the original runtime before treating this report as styling approval.",
    why: "RepoTutor records styling readiness only; it does not compile Tailwind, scan class candidates, run PostCSS/Vite plugins, update caches, or validate final CSS size.",
    relatedHref: "html/styling-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Tailwind-style styling readiness report: setup ${stylingSetups.length}개, config signal ${configSignals.length}개, directive signal ${directiveSignals.length}개, theme signal ${themeSignals.length}개, integration signal ${integrationSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Tailwind CSS @import tailwindcss @theme @utility @variant @source @config @plugin @apply content safelist darkMode prefix important",
    stylingSetups,
    configSignals,
    directiveSignals,
    classSignals,
    themeSignals,
    integrationSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"tailwind.config|@import \\\\\\\"tailwindcss\\\\\\\"|@tailwind|@theme|@source|@config|@plugin|@apply\" .", purpose: "Find Tailwind config files, CSS entrypoints, and directive usage." },
      { command: "rg \"content:|safelist|darkMode|prefix|important|presets|corePlugins\" tailwind.config.* package.json .", purpose: "Review candidate scanning and global config policy." },
      { command: "rg \"className=|class=|tw:|dark:|group-|peer-|hover:|md:|\\\\[[^\\\\]]+\\\\]\" src app pages components .", purpose: "Trace utility class usage, variants, prefixes, and arbitrary values." },
      { command: "rg \"@tailwindcss/postcss|@tailwindcss/vite|@tailwindcss/cli|postcss.config|vite.config|webpack.config|tailwindcss -i|tailwindcss --watch\" .", purpose: "Check CSS build integration without compiling CSS." }
    ],
    learnerNextSteps: [
      "먼저 tailwind.config, package scripts, CSS entrypoint를 찾아 styling entrypoint를 확인하세요.",
      "content globs, @source, safelist, ignored file policy로 class candidate scanning 범위를 분리하세요.",
      "@import tailwindcss, @tailwind, @theme, @utility, @variant, @config, @plugin, @apply, @layer directive를 확인하세요.",
      "className/class 속성에서 responsive/state/dark/group/peer/important/arbitrary value utility 사용을 추적하세요.",
      "theme variables, colors, spacing, typography, breakpoints, design-token bridge를 확인하세요.",
      "PostCSS, Vite, webpack, CLI, watch, build script integration을 확인해 개발/프로덕션 CSS 생성 경로를 나누세요.",
      "이 리포트는 정적 readiness입니다. Tailwind compile, candidate scan, plugin execution, CSS size validation은 원본 런타임에서 별도 검증하세요."
    ]
  };
}

type StylingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function stylingSourceFiles(walk: WalkResult): Promise<StylingSourceFile[]> {
  const files: StylingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !stylingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!stylingPathSignal(file.relPath) && !stylingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function stylingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return stylingPathSignal(filePath)
    || /^(package\.json|tailwind\.config\.[cm]?[jt]s|postcss\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s|webpack\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(css|scss|sass|less|pcss|postcss|js|cjs|mjs|ts|tsx|jsx|json|md|mdx|html)$/i.test(filePath);
}

function stylingPathSignal(filePath: string): boolean {
  return /(^|\/)(tailwind\.config\.[cm]?[jt]s|postcss\.config\.[cm]?[jt]s|package\.json)$/i.test(filePath)
    || /(^|\/)(styles?|css|scss|sass|components?|pages?|app|src|theme|themes)(\/|$)/i.test(filePath);
}

function stylingContentSignal(text: string): boolean {
  return /(tailwindcss|@tailwindcss|@import\s+["']tailwindcss["']|@tailwind|@theme|@utility|@variant|@source|@config|@plugin|@apply|content\s*:|safelist|darkMode|className=|class=|hover:|focus:|dark:|group-|peer-|postcss|\.module\.css)/i.test(text);
}

function stylingSetupFiles(sourceFiles: StylingSourceFile[]): StylingReadinessReport["stylingSetups"] {
  const rows: StylingReadinessReport["stylingSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /tailwind\.config|content\s*:|safelist|darkMode|prefix\s*:|important\s*:|presets\s*:|corePlugins|theme\s*:/gi) + (/tailwind\.config/i.test(source.filePath) ? 1 : 0);
    const directiveCount = countMatches(source.text, /@import\s+["']tailwindcss["']|@tailwind|@theme|@utility|@variant|@source|@config|@plugin|@apply|@layer/gi);
    const utilityCount = countMatches(source.text, /\b(?:className|class)\s*=|(?:hover|focus|active|disabled|dark|group-hover|peer-focus|sm|md|lg|xl|2xl):|(?:bg|text|p|m|w|h|grid|flex|rounded|shadow|border|font|leading|tracking|container)-[A-Za-z0-9_[\]().:/%-]+/gi);
    const themeCount = countMatches(source.text, /@theme|theme\s*:|theme\(|--(?:color|spacing|font|breakpoint|container|radius|shadow)-|colors\s*:|spacing\s*:|fontSize\s*:|screens\s*:/gi);
    const variantCount = countMatches(source.text, /@variant|addVariant|matchVariant|(?:hover|focus|active|disabled|dark|group|peer|sm|md|lg|xl|2xl):/gi);
    const contentScanCount = countMatches(source.text, /content\s*:|@source|safelist|extractRawCandidates|Scanner|candidate|ignored content|class candidates/gi);
    const pluginCount = countMatches(source.text, /plugins\s*:|@plugin|plugin\(|addUtilities|matchUtilities|addComponents|addBase|@tailwindcss\/(forms|typography|container-queries|postcss|vite|cli)/gi);
    const buildIntegrationCount = countMatches(source.text, /@tailwindcss\/postcss|@tailwindcss\/vite|@tailwindcss\/cli|postcss\.config|vite\.config|webpack\.config|tailwindcss\s+(-i|--input|--watch)|lightningcss|build:css|css:build/gi);
    const hasSignal = configCount + directiveCount + utilityCount + themeCount + variantCount + contentScanCount + pluginCount + buildIntegrationCount > 0;
    if (!hasSignal) continue;
    rows.push({
      filePath: source.filePath,
      framework: stylingFramework(source),
      configCount,
      directiveCount,
      utilityCount,
      themeCount,
      variantCount,
      contentScanCount,
      pluginCount,
      buildIntegrationCount,
      readiness: (directiveCount > 0 || configCount > 0) && (utilityCount > 0 || contentScanCount > 0 || buildIntegrationCount > 0) ? "ready" : hasSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, directives ${directiveCount}, utilities ${utilityCount}, theme ${themeCount}, variants ${variantCount}, content scan ${contentScanCount}, plugins ${pluginCount}, build integration ${buildIntegrationCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function stylingFramework(source: StylingSourceFile): StylingReadinessReport["stylingSetups"][number]["framework"] {
  if (/tailwind\.config|tailwindcss|@tailwindcss|@tailwind|@theme|@utility|@source/i.test(source.filePath) || /tailwindcss|@tailwindcss|@tailwind|@theme|@utility|@source/i.test(source.text)) return "tailwind";
  if (/unocss|uno\.config/i.test(source.filePath) || /unocss|uno\.config|presetUno/i.test(source.text)) return "unocss";
  if (/bootstrap/i.test(source.filePath) || /bootstrap|btn-|navbar|container-fluid/i.test(source.text)) return "bootstrap";
  if (/\.(scss|sass)$/i.test(source.filePath) || /@use|@forward|@mixin|@include|\$[a-z0-9_-]+:/i.test(source.text)) return "sass";
  if (/postcss/i.test(source.filePath) || /postcss|autoprefixer|postcss-preset-env/i.test(source.text)) return "postcss";
  if (/\.module\.css/i.test(source.filePath)) return "css-modules";
  if (/\.(css|pcss|less)$/i.test(source.filePath) || /className=|class=|style=|stylesheet/i.test(source.text)) return "custom";
  return "unknown";
}

function stylingConfigSignals(sourceFiles: StylingSourceFile[]): StylingReadinessReport["configSignals"] {
  const specs: Array<{ signal: StylingReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "config-file", pattern: /tailwind\.config\.[cm]?[jt]s|uno\.config\.[cm]?[jt]s|postcss\.config\.[cm]?[jt]s/i, evidence: "styling config file evidence was detected." },
    { signal: "tailwind-config", pattern: /tailwind\.config|Config\s+from\s+['"]tailwindcss|defineConfig\s*\(/i, evidence: "Tailwind config evidence was detected." },
    { signal: "content-globs", pattern: /content\s*:\s*(\[[\s\S]{0,600}\]|{[\s\S]{0,600}})|files\s*:/i, evidence: "content glob evidence was detected." },
    { signal: "safelist", pattern: /safelist|blocklist/i, evidence: "safelist/blocklist evidence was detected." },
    { signal: "dark-mode", pattern: /darkMode|dark:/i, evidence: "dark mode evidence was detected." },
    { signal: "prefix", pattern: /prefix\s*:|prefix\(|tw:/i, evidence: "prefix evidence was detected." },
    { signal: "important", pattern: /important\s*:|!important|!\w/i, evidence: "important modifier evidence was detected." },
    { signal: "presets", pattern: /presets\s*:/i, evidence: "presets evidence was detected." },
    { signal: "core-plugins", pattern: /corePlugins\s*:/i, evidence: "core plugin policy evidence was detected." }
  ];
  return stylingSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function stylingDirectiveSignals(sourceFiles: StylingSourceFile[]): StylingReadinessReport["directiveSignals"] {
  const specs: Array<{ signal: StylingReadinessReport["directiveSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "import-tailwind", pattern: /@import\s+["']tailwindcss["']/i, evidence: "@import tailwindcss evidence was detected." },
    { signal: "tailwind-directive", pattern: /@tailwind\s+(base|components|utilities|screens|variants)/i, evidence: "@tailwind directive evidence was detected." },
    { signal: "theme-directive", pattern: /@theme\b/i, evidence: "@theme evidence was detected." },
    { signal: "utility-directive", pattern: /@utility\b/i, evidence: "@utility evidence was detected." },
    { signal: "variant-directive", pattern: /@variant\b|@custom-variant/i, evidence: "variant directive evidence was detected." },
    { signal: "source-directive", pattern: /@source\b/i, evidence: "@source evidence was detected." },
    { signal: "config-directive", pattern: /@config\b/i, evidence: "@config evidence was detected." },
    { signal: "plugin-directive", pattern: /@plugin\b/i, evidence: "@plugin evidence was detected." },
    { signal: "apply-directive", pattern: /@apply\b/i, evidence: "@apply evidence was detected." },
    { signal: "layer-directive", pattern: /@layer\b/i, evidence: "@layer evidence was detected." }
  ];
  return stylingSignalFromSpecs(sourceFiles, specs, "directive", "signal");
}

function stylingClassSignals(sourceFiles: StylingSourceFile[]): StylingReadinessReport["classSignals"] {
  const specs: Array<{ signal: StylingReadinessReport["classSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "utility-class", pattern: /(?:className|class)\s*=|(?:bg|text|p|m|w|h|grid|flex|rounded|shadow|border|font)-[A-Za-z0-9_[\]().:/%-]+/i, evidence: "utility class evidence was detected." },
    { signal: "arbitrary-value", pattern: /\[[^\]]+\]|[a-z-]+-\[[^\]]+\]/i, evidence: "arbitrary value evidence was detected." },
    { signal: "variant-prefix", pattern: /(?:hover|focus|active|disabled|visited|checked|first|last|odd|even):/i, evidence: "state variant evidence was detected." },
    { signal: "responsive-prefix", pattern: /(?:sm|md|lg|xl|2xl):/i, evidence: "responsive prefix evidence was detected." },
    { signal: "state-prefix", pattern: /(?:aria-|data-|supports-|motion-safe|motion-reduce):/i, evidence: "state/data prefix evidence was detected." },
    { signal: "group-peer", pattern: /group-|peer-|group:|peer:/i, evidence: "group/peer evidence was detected." },
    { signal: "dark-class", pattern: /dark:/i, evidence: "dark class evidence was detected." },
    { signal: "important-modifier", pattern: /![A-Za-z0-9_-]+:|![A-Za-z0-9_-]+|!important/i, evidence: "important modifier evidence was detected." },
    { signal: "prefix-usage", pattern: /\btw:/i, evidence: "prefixed utility evidence was detected." }
  ];
  return stylingSignalFromSpecs(sourceFiles, specs, "class", "signal");
}

function stylingThemeSignals(sourceFiles: StylingSourceFile[]): StylingReadinessReport["themeSignals"] {
  const specs: Array<{ signal: StylingReadinessReport["themeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "css-theme-vars", pattern: /@theme|--(?:color|spacing|font|breakpoint|container|radius|shadow)-/i, evidence: "CSS theme variable evidence was detected." },
    { signal: "colors", pattern: /colors\s*:|--color-|text-[A-Za-z]+|bg-[A-Za-z]+/i, evidence: "color theme evidence was detected." },
    { signal: "spacing", pattern: /spacing\s*:|--spacing|p-[0-9]|m-[0-9]|gap-[0-9]/i, evidence: "spacing theme evidence was detected." },
    { signal: "typography", pattern: /fontSize|fontFamily|lineHeight|letterSpacing|@tailwindcss\/typography|prose/i, evidence: "typography evidence was detected." },
    { signal: "breakpoints", pattern: /screens\s*:|--breakpoint-|(?:sm|md|lg|xl|2xl):/i, evidence: "breakpoint evidence was detected." },
    { signal: "container", pattern: /container\s*:|@container|container-/i, evidence: "container evidence was detected." },
    { signal: "custom-property", pattern: /--[a-z0-9-]+\s*:/i, evidence: "custom property evidence was detected." },
    { signal: "theme-function", pattern: /theme\(|--theme\(/i, evidence: "theme function evidence was detected." },
    { signal: "design-token-bridge", pattern: /tokens?|style-dictionary|design-token|var\(--/i, evidence: "design token bridge evidence was detected." }
  ];
  return stylingSignalFromSpecs(sourceFiles, specs, "theme", "signal");
}

function stylingIntegrationSignals(sourceFiles: StylingSourceFile[]): StylingReadinessReport["integrationSignals"] {
  const specs: Array<{ signal: StylingReadinessReport["integrationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "postcss-plugin", pattern: /@tailwindcss\/postcss|postcss\.config|tailwindcss\s*:\s*\{|plugins\s*:\s*\{[\s\S]{0,200}tailwindcss/i, evidence: "PostCSS plugin evidence was detected." },
    { signal: "vite-plugin", pattern: /@tailwindcss\/vite|tailwindcss\(\)|vite\.config/i, evidence: "Vite plugin evidence was detected." },
    { signal: "webpack-loader", pattern: /@tailwindcss\/webpack|postcss-loader|webpack\.config/i, evidence: "webpack loader evidence was detected." },
    { signal: "cli-command", pattern: /tailwindcss\s+(-i|--input|build|init)|@tailwindcss\/cli/i, evidence: "Tailwind CLI evidence was detected." },
    { signal: "watch-mode", pattern: /--watch|tailwindcss\s+.*-w|watch:css|dev:css/i, evidence: "watch mode evidence was detected." },
    { signal: "build-script", pattern: /build:css|css:build|tailwindcss\s+.*(-o|--output)|postcss\s+/i, evidence: "CSS build script evidence was detected." },
    { signal: "css-entry", pattern: /@import\s+["']tailwindcss["']|@tailwind|\.css['"]|import\s+['"][^'"]+\.css['"]/i, evidence: "CSS entrypoint evidence was detected." },
    { signal: "import-css", pattern: /import\s+['"][^'"]+\.(css|scss|sass|pcss)['"]|@import\s+['"][^'"]+['"]/i, evidence: "CSS import evidence was detected." },
    { signal: "lightning-css", pattern: /lightningcss|Lightning CSS/i, evidence: "Lightning CSS evidence was detected." }
  ];
  return stylingSignalFromSpecs(sourceFiles, specs, "integration", "signal");
}

function stylingPackageSignals(sourceFiles: StylingSourceFile[]): StylingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: StylingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tailwindcss", pattern: /"tailwindcss"|from ['"]tailwindcss|@import\s+["']tailwindcss["']/i, evidence: "tailwindcss evidence was detected." },
    { signal: "@tailwindcss/postcss", pattern: /@tailwindcss\/postcss/i, evidence: "@tailwindcss/postcss evidence was detected." },
    { signal: "@tailwindcss/vite", pattern: /@tailwindcss\/vite/i, evidence: "@tailwindcss/vite evidence was detected." },
    { signal: "@tailwindcss/cli", pattern: /@tailwindcss\/cli/i, evidence: "@tailwindcss/cli evidence was detected." },
    { signal: "@tailwindcss/forms", pattern: /@tailwindcss\/forms/i, evidence: "@tailwindcss/forms evidence was detected." },
    { signal: "@tailwindcss/typography", pattern: /@tailwindcss\/typography/i, evidence: "@tailwindcss/typography evidence was detected." },
    { signal: "@tailwindcss/oxide", pattern: /@tailwindcss\/oxide|Scanner/i, evidence: "@tailwindcss/oxide evidence was detected." },
    { signal: "unocss", pattern: /"unocss"|@unocss|uno\.config/i, evidence: "UnoCSS evidence was detected." },
    { signal: "bootstrap", pattern: /"bootstrap"|from ['"]bootstrap|bootstrap\/dist|btn-|navbar/i, evidence: "Bootstrap evidence was detected." }
  ];
  return stylingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function stylingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: StylingSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/styling-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildVisualRegressionReadinessReport(walk: WalkResult): Promise<VisualRegressionReadinessReport> {
  const sourceFiles = await visualRegressionSourceFiles(walk);
  const visualRegressionSetups = visualRegressionSetupFiles(sourceFiles);
  const configSignals = visualRegressionConfigSignals(sourceFiles);
  const snapshotSignals = visualRegressionSnapshotSignals(sourceFiles);
  const thresholdSignals = visualRegressionThresholdSignals(sourceFiles);
  const reportSignals = visualRegressionReportSignals(sourceFiles);
  const pluginSignals = visualRegressionPluginSignals(sourceFiles);
  const ciSignals = visualRegressionCiSignals(sourceFiles);
  const packageSignals = visualRegressionPackageSignals(sourceFiles);

  const hasVisualTool = visualRegressionSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasSnapshots = snapshotSignals.some((item) => ["actual-images", "expected-images", "screenshots", "sync-expected", "compare-command"].includes(item.signal) && item.readiness === "ready");
  const hasThresholds = thresholdSignals.some((item) => item.readiness === "ready") || visualRegressionSetups.some((item) => item.thresholdCount > 0);
  const hasReports = reportSignals.some((item) => item.readiness === "ready") || visualRegressionSetups.some((item) => item.reportCount > 0);
  const hasStorage = pluginSignals.some((item) => ["publish-s3", "publish-gcs"].includes(item.signal) && item.readiness === "ready") || visualRegressionSetups.some((item) => item.storageCount > 0);

  const riskQueue: VisualRegressionReadinessReport["riskQueue"] = [];
  if (!hasVisualTool) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the visual regression tool before claiming screenshot diff readiness.",
      why: "Visual regression readiness needs a clear tool such as reg-suit, Argos, Chromatic, Percy, Playwright screenshots, Cypress, or WebdriverIO visual testing.",
      relatedHref: "html/visual-regression-readiness.html"
    });
  }
  if (hasVisualTool && !hasSnapshots) {
    riskQueue.push({
      priority: "high",
      action: "Trace actual screenshot capture, expected baseline sync, diff image generation, and compare command ownership.",
      why: "Visual review is incomplete if learners cannot see how screenshots are produced, fetched, and compared.",
      relatedHref: "html/visual-regression-readiness.html"
    });
  }
  if (hasVisualTool && !hasThresholds) {
    riskQueue.push({
      priority: "high",
      action: "Document thresholdRate, thresholdPixel, matchingThreshold, antialias, ximgdiff, and concurrency policy.",
      why: "Unbounded pixel diffs create noisy failures or hide visual regressions when thresholds are implicit.",
      relatedHref: "html/visual-regression-readiness.html"
    });
  }
  if (hasVisualTool && !hasReports) {
    riskQueue.push({
      priority: "medium",
      action: "Record HTML report, diff report, comparison result, report URL, or artifact upload path.",
      why: "Reviewers need a durable visual diff artifact, not only a pass/fail exit code.",
      relatedHref: "html/visual-regression-readiness.html"
    });
  }
  if (hasVisualTool && !hasStorage) {
    riskQueue.push({
      priority: "medium",
      action: "Record baseline storage and publish path such as S3, GCS, artifact upload, or hosted visual review.",
      why: "Baseline management is the main operational risk in visual regression workflows.",
      relatedHref: "html/visual-regression-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original visual regression workflow only in a trusted runtime before treating this report as visual approval.",
    why: "RepoTutor records visual regression readiness only; it does not capture screenshots, compare pixels, fetch baselines, upload reports, notify services, or execute browser tests.",
    relatedHref: "html/visual-regression-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `reg-suit-style visual regression readiness report: setup ${visualRegressionSetups.length}개, snapshot signal ${snapshotSignals.length}개, threshold signal ${thresholdSignals.length}개, report signal ${reportSignals.length}개, plugin signal ${pluginSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "reg-suit regconfig actualDir expectedDir diffDir thresholdRate thresholdPixel matchingThreshold ximgdiff sync-expected compare publish report plugin storage notification",
    visualRegressionSetups,
    configSignals,
    snapshotSignals,
    thresholdSignals,
    reportSignals,
    pluginSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"regconfig|actualDir|expectedDir|diffDir|thresholdRate|thresholdPixel|matchingThreshold|ximgdiff\" .", purpose: "Find reg-suit config and pixel threshold policy." },
      { command: "rg \"reg-suit (run|sync-expected|compare|publish)|visual regression|toHaveScreenshot|percy|argos|chromatic\" package.json .github src test", purpose: "Trace visual regression commands and screenshot capture paths." },
      { command: "rg \"reg-keygen|reg-publish|reg-notify|S3|GCS|artifact|reportUrl|notification\" .", purpose: "Review baseline key generation, storage, report publication, and notification plugins." },
      { command: "rg \"detached HEAD|checkout|fetch-depth|CI|GITHUB_SHA|CIRCLE|TRAVIS|GITLAB\" .github .circleci .gitlab-ci.yml package.json", purpose: "Check CI conditions that affect baseline key selection." }
    ],
    learnerNextSteps: [
      "먼저 regconfig.json, package scripts, CI workflow에서 visual regression entrypoint를 찾으세요.",
      "actualDir, expectedDir, diffDir, workingDir를 분리해 screenshot, baseline, diff artifact 위치를 확인하세요.",
      "thresholdRate, thresholdPixel, matchingThreshold, enableAntialias, ximgdiff, concurrency 값을 확인해 noise policy를 이해하세요.",
      "sync-expected, compare, publish, run command 흐름을 따라 baseline fetch, diff, report publish 순서를 확인하세요.",
      "keygen, publisher, notifier plugin이 Git hash, S3/GCS storage, GitHub/GitLab/Slack notification을 어떻게 연결하는지 확인하세요.",
      "CI detached HEAD, branch fetch depth, artifact upload, report URL 노출 정책을 확인하세요.",
      "이 리포트는 정적 readiness입니다. screenshot capture, pixel compare, baseline fetch/publish, notification은 신뢰된 원본 런타임에서 별도 검증하세요."
    ]
  };
}

type VisualRegressionSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function visualRegressionSourceFiles(walk: WalkResult): Promise<VisualRegressionSourceFile[]> {
  const files: VisualRegressionSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !visualRegressionInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!visualRegressionPathSignal(file.relPath) && !visualRegressionContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function visualRegressionInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return visualRegressionPathSignal(filePath)
    || /^(package\.json|regconfig\.json|reg\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s|wdio\.conf\.[cm]?[jt]s)$/i.test(base)
    || /\.(json|ya?ml|js|cjs|mjs|ts|tsx|jsx|md|mdx|html|png|jpg|jpeg|webp)$/i.test(filePath);
}

function visualRegressionPathSignal(filePath: string): boolean {
  return /(^|\/)(regconfig\.json|reg\.json|package\.json|\.github\/workflows|\.circleci|\.gitlab-ci\.yml)$/i.test(filePath)
    || /(^|\/)(screenshots?|snapshots?|visual|visual-regression|__image_snapshots__|__screenshots__|regression|baseline|diffs?|reports?)(\/|$)/i.test(filePath);
}

function visualRegressionContentSignal(text: string): boolean {
  return /(reg-suit|regconfig|visual regression|actualDir|expectedDir|diffDir|thresholdRate|thresholdPixel|matchingThreshold|ximgdiff|sync-expected|toHaveScreenshot|page\.screenshot|percy|argos|chromatic|reg-keygen|reg-publish|reg-notify)/i.test(text);
}

function visualRegressionSetupFiles(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["visualRegressionSetups"] {
  const rows: VisualRegressionReadinessReport["visualRegressionSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /regconfig\.json|actualDir|workingDir|expectedDir|diffDir|plugins\s*:|thresholdRate|thresholdPixel|matchingThreshold|visual regression/gi) + (/regconfig\.json$/i.test(source.filePath) ? 1 : 0);
    const actualCount = countMatches(source.text, /actualDir|actual images?|current snapshots?|screenshots?|page\.screenshot|toHaveScreenshot|cy\.screenshot/gi);
    const expectedCount = countMatches(source.text, /expectedDir|expected snapshots?|baseline|sync-expected|previous images?|snapshot key/gi);
    const diffCount = countMatches(source.text, /diffDir|diff images?|compare|comparison|ximgdiff|pixelmatch|looks-same/gi);
    const thresholdCount = countMatches(source.text, /thresholdRate|thresholdPixel|matchingThreshold|enableAntialias|antialias|failure threshold|concurrency/gi);
    const reportCount = countMatches(source.text, /HTML report|html report|reportUrl|comparison result|diff report|artifact|publish.*report/gi);
    const pluginCount = countMatches(source.text, /reg-[a-z0-9-]+-plugin|keygen|publisher|notifier|plugins\s*:/gi);
    const storageCount = countMatches(source.text, /S3|GCS|Google Cloud Storage|bucket|storage|artifact upload|publish-s3|publish-gcs|cloud storage/gi);
    const notificationCount = countMatches(source.text, /notify|notification|GitHub status|PR comment|merge request|Slack|GitLab|Chatwork/gi);
    const hasSignal = configCount + actualCount + expectedCount + diffCount + thresholdCount + reportCount + pluginCount + storageCount + notificationCount > 0;
    if (!hasSignal) continue;
    rows.push({
      filePath: source.filePath,
      tool: visualRegressionTool(source),
      configCount,
      actualCount,
      expectedCount,
      diffCount,
      thresholdCount,
      reportCount,
      pluginCount,
      storageCount,
      notificationCount,
      readiness: (actualCount > 0 || configCount > 0) && (expectedCount > 0 || diffCount > 0 || thresholdCount > 0) ? "ready" : hasSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, actual ${actualCount}, expected ${expectedCount}, diff ${diffCount}, threshold ${thresholdCount}, report ${reportCount}, plugin ${pluginCount}, storage ${storageCount}, notification ${notificationCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function visualRegressionTool(source: VisualRegressionSourceFile): VisualRegressionReadinessReport["visualRegressionSetups"][number]["tool"] {
  if (/reg-suit|regconfig|reg-keygen|reg-publish|reg-notify/i.test(source.filePath) || /reg-suit|regconfig|reg-keygen|reg-publish|reg-notify/i.test(source.text)) return "reg-suit";
  if (/argos/i.test(source.filePath) || /@argos-ci|argos upload|argos/i.test(source.text)) return "argos";
  if (/chromatic/i.test(source.filePath) || /chromatic|@chromatic-com/i.test(source.text)) return "chromatic";
  if (/percy/i.test(source.filePath) || /@percy|percy snapshot|percy exec/i.test(source.text)) return "percy";
  if (/playwright/i.test(source.filePath) || /toHaveScreenshot|page\.screenshot|@playwright\/test/i.test(source.text)) return "playwright";
  if (/cypress/i.test(source.filePath) || /cy\.screenshot|cypress-image-snapshot|cypress-visual/i.test(source.text)) return "cypress";
  if (/wdio|webdriverio/i.test(source.filePath) || /webdriverio|saveScreenshot|checkScreen|visual-testing/i.test(source.text)) return "webdriverio";
  if (/visual|screenshot|snapshot|diff|baseline/i.test(source.filePath) || /visual regression|screenshot|snapshot|pixel diff/i.test(source.text)) return "custom";
  return "unknown";
}

function visualRegressionConfigSignals(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["configSignals"] {
  const specs: Array<{ signal: VisualRegressionReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "regconfig", pattern: /regconfig\.json|reg-suit config|RegSuitConfiguration/i, evidence: "reg-suit config evidence was detected." },
    { signal: "actual-dir", pattern: /actualDir|actual directory|actual images/i, evidence: "actualDir evidence was detected." },
    { signal: "working-dir", pattern: /workingDir|working directory|temporary files/i, evidence: "workingDir evidence was detected." },
    { signal: "expected-dir", pattern: /expectedDir|expected directory|expected images|baseline/i, evidence: "expectedDir/baseline evidence was detected." },
    { signal: "diff-dir", pattern: /diffDir|diff directory|diff images/i, evidence: "diffDir evidence was detected." },
    { signal: "config-file", pattern: /reg\.json|visual.*config|percy\.yml|argos\.config|playwright\.config|wdio\.conf|cypress\.config/i, evidence: "visual config file evidence was detected." },
    { signal: "ci-config", pattern: /\.github\/workflows|circleci|travis|gitlab-ci|CI=|GITHUB_ACTIONS/i, evidence: "CI config evidence was detected." },
    { signal: "package-script", pattern: /"[^"]*(visual|screenshot|regression|reg-suit|chromatic|percy|argos)[^"]*"\s*:/i, evidence: "package script evidence was detected." }
  ];
  return visualRegressionSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function visualRegressionSnapshotSignals(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["snapshotSignals"] {
  const specs: Array<{ signal: VisualRegressionReadinessReport["snapshotSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "actual-images", pattern: /actualDir|actual images?|current snapshots?|screenshots?\//i, evidence: "actual image evidence was detected." },
    { signal: "expected-images", pattern: /expectedDir|expected images?|baseline|previous snapshots?/i, evidence: "expected baseline evidence was detected." },
    { signal: "diff-images", pattern: /diffDir|diff images?|ximgdiff|pixel diff/i, evidence: "diff image evidence was detected." },
    { signal: "screenshots", pattern: /screenshot|toHaveScreenshot|page\.screenshot|cy\.screenshot|saveScreenshot/i, evidence: "screenshot capture evidence was detected." },
    { signal: "baseline-key", pattern: /keygen|snapshot key|git hash|compare key|actual key|expected key/i, evidence: "baseline key evidence was detected." },
    { signal: "sync-expected", pattern: /sync-expected/i, evidence: "sync-expected command evidence was detected." },
    { signal: "compare-command", pattern: /reg-suit compare|compare actual|compare images/i, evidence: "compare command evidence was detected." },
    { signal: "publish-command", pattern: /reg-suit publish|publish.*snapshot|publish.*report/i, evidence: "publish command evidence was detected." },
    { signal: "run-command", pattern: /reg-suit run|npx reg-suit run|visual regression testing/i, evidence: "run command evidence was detected." }
  ];
  return visualRegressionSignalFromSpecs(sourceFiles, specs, "snapshot", "signal");
}

function visualRegressionThresholdSignals(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["thresholdSignals"] {
  const specs: Array<{ signal: VisualRegressionReadinessReport["thresholdSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "threshold-rate", pattern: /thresholdRate|threshold rate/i, evidence: "thresholdRate evidence was detected." },
    { signal: "threshold-pixel", pattern: /thresholdPixel|threshold pixel/i, evidence: "thresholdPixel evidence was detected." },
    { signal: "matching-threshold", pattern: /matchingThreshold|matching threshold/i, evidence: "matchingThreshold evidence was detected." },
    { signal: "antialias", pattern: /enableAntialias|anti-?alias/i, evidence: "anti-alias handling evidence was detected." },
    { signal: "ximgdiff", pattern: /ximgdiff|x-img-diff/i, evidence: "ximgdiff evidence was detected." },
    { signal: "concurrency", pattern: /concurrency|parallel.*compare/i, evidence: "concurrency evidence was detected." },
    { signal: "failure-threshold", pattern: /failure threshold|maxDiff|diff.*threshold|pixel.*threshold/i, evidence: "failure threshold evidence was detected." }
  ];
  return visualRegressionSignalFromSpecs(sourceFiles, specs, "threshold", "signal");
}

function visualRegressionReportSignals(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["reportSignals"] {
  const specs: Array<{ signal: VisualRegressionReadinessReport["reportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "html-report", pattern: /HTML report|html report|report\.html|reportDir/i, evidence: "HTML report evidence was detected." },
    { signal: "diff-report", pattern: /diff report|difference report|ximgdiff|visual diff/i, evidence: "diff report evidence was detected." },
    { signal: "comparison-result", pattern: /comparison result|ComparisonResult|compare result/i, evidence: "comparison result evidence was detected." },
    { signal: "json-result", pattern: /json report|report\.json|result\.json/i, evidence: "JSON result evidence was detected." },
    { signal: "report-url", pattern: /reportUrl|report URL|published report|status target_url/i, evidence: "report URL evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifacts?:|artifact upload|store_artifacts/i, evidence: "artifact upload evidence was detected." }
  ];
  return visualRegressionSignalFromSpecs(sourceFiles, specs, "report", "signal");
}

function visualRegressionPluginSignals(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["pluginSignals"] {
  const specs: Array<{ signal: VisualRegressionReadinessReport["pluginSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "keygen-git-hash", pattern: /reg-keygen-git-hash-plugin|git hash.*keygen/i, evidence: "git hash keygen plugin evidence was detected." },
    { signal: "simple-keygen", pattern: /reg-simple-keygen-plugin|simple keygen/i, evidence: "simple keygen plugin evidence was detected." },
    { signal: "publish-s3", pattern: /reg-publish-s3-plugin|S3 bucket|AWS S3/i, evidence: "S3 publisher plugin evidence was detected." },
    { signal: "publish-gcs", pattern: /reg-publish-gcs-plugin|Google Cloud Storage|GCS/i, evidence: "GCS publisher plugin evidence was detected." },
    { signal: "notify-github", pattern: /reg-notify-github|GitHub app|PR comment|commit status/i, evidence: "GitHub notifier evidence was detected." },
    { signal: "notify-gitlab", pattern: /reg-notify-gitlab|GitLab.*merge request/i, evidence: "GitLab notifier evidence was detected." },
    { signal: "notify-slack", pattern: /reg-notify-slack|Slack.*webhook/i, evidence: "Slack notifier evidence was detected." },
    { signal: "notify-chatwork", pattern: /reg-notify-chatwork|Chatwork/i, evidence: "Chatwork notifier evidence was detected." },
    { signal: "custom-plugin", pattern: /reg-.*-plugin|PublisherPlugin|NotifierPlugin|KeyGeneratorPlugin/i, evidence: "custom plugin evidence was detected." }
  ];
  return visualRegressionSignalFromSpecs(sourceFiles, specs, "plugin", "signal");
}

function visualRegressionCiSignals(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["ciSignals"] {
  const specs: Array<{ signal: VisualRegressionReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /github\/workflows|GITHUB_ACTIONS|actions\/checkout|npx reg-suit run/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "circleci", pattern: /circleci|CircleCI|store_artifacts/i, evidence: "CircleCI evidence was detected." },
    { signal: "travis", pattern: /travis|TRAVIS/i, evidence: "Travis CI evidence was detected." },
    { signal: "gitlab-ci", pattern: /gitlab-ci|GitLab CI/i, evidence: "GitLab CI evidence was detected." },
    { signal: "ci-command", pattern: /npx reg-suit run|reg-suit run|percy exec|argos upload|chromatic/i, evidence: "CI command evidence was detected." },
    { signal: "detached-head", pattern: /detached HEAD|fetch-depth|git checkout|attach.*branch/i, evidence: "detached HEAD mitigation evidence was detected." },
    { signal: "artifact-cache", pattern: /cache|artifact|upload-artifact|store_artifacts|persist_to_workspace/i, evidence: "artifact/cache evidence was detected." }
  ];
  return visualRegressionSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function visualRegressionPackageSignals(sourceFiles: VisualRegressionSourceFile[]): VisualRegressionReadinessReport["packageSignals"] {
  const specs: Array<{ signal: VisualRegressionReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "reg-suit", pattern: /"reg-suit"|npx reg-suit|reg-suit run/i, evidence: "reg-suit package evidence was detected." },
    { signal: "reg-suit-core", pattern: /"reg-suit-core"|from ['"]reg-suit-core/i, evidence: "reg-suit-core evidence was detected." },
    { signal: "reg-suit-interface", pattern: /"reg-suit-interface"|from ['"]reg-suit-interface/i, evidence: "reg-suit-interface evidence was detected." },
    { signal: "reg-keygen-git-hash-plugin", pattern: /reg-keygen-git-hash-plugin/i, evidence: "reg keygen git hash package evidence was detected." },
    { signal: "reg-publish-s3-plugin", pattern: /reg-publish-s3-plugin/i, evidence: "reg publish S3 package evidence was detected." },
    { signal: "reg-publish-gcs-plugin", pattern: /reg-publish-gcs-plugin/i, evidence: "reg publish GCS package evidence was detected." },
    { signal: "reg-notify-github-plugin", pattern: /reg-notify-github-plugin|reg-notify-github-with-api-plugin/i, evidence: "reg notify GitHub package evidence was detected." },
    { signal: "@percy/cli", pattern: /@percy\/cli|percy exec|percy snapshot/i, evidence: "Percy package evidence was detected." },
    { signal: "@argos-ci/cli", pattern: /@argos-ci\/cli|argos upload/i, evidence: "Argos package evidence was detected." },
    { signal: "chromatic", pattern: /"chromatic"|@chromatic-com|npx chromatic/i, evidence: "Chromatic package evidence was detected." }
  ];
  return visualRegressionSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function visualRegressionSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: VisualRegressionSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/visual-regression-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
