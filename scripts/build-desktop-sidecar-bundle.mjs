#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entryPoint = path.join(root, "apps/desktop-tauri/sidecar/bridge.ts");
const outfile = path.join(root, "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js");
const metafile = path.join(root, "apps/desktop-tauri/sidecar-dist/sidecar/bridge.meta.json");
const runtimeOutfile = path.join(root, "apps/desktop-tauri/sidecar-dist/runtime/node");

const esbuild = await loadRepoLocalEsbuild();

fs.mkdirSync(path.dirname(outfile), { recursive: true });
const result = await esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node22"],
  outfile,
  banner: {
    js: "import { createRequire as __repoTutorCreateRequire } from 'node:module'; const require = __repoTutorCreateRequire(import.meta.url);"
  },
  sourcemap: true,
  metafile: true,
  packages: "bundle",
  logLevel: "silent"
});

fs.writeFileSync(metafile, `${JSON.stringify(result.metafile, null, 2)}\n`);
copyNodeRuntime();

const bundled = fs.readFileSync(outfile, "utf8");
const unresolvedWorkspaceImport = /(?:from\s+|import\s*\()\s*["']@repotutor\//.test(bundled);
if (unresolvedWorkspaceImport) {
  throw new Error("desktop sidecar bundle still contains unresolved @repotutor imports");
}
const unresolvedPackageImport = /(?:from\s+|import\s*\(|require\s*\()\s*["']@openai\/codex-sdk["']/.test(bundled);
if (unresolvedPackageImport) {
  throw new Error("desktop sidecar bundle still contains unresolved @openai/codex-sdk import");
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    builder: "esbuild",
    esbuildVersion: esbuild.version,
    entryPoint: path.relative(root, entryPoint),
    outfile: path.relative(root, outfile),
    metafile: path.relative(root, metafile),
    runtime: path.relative(root, runtimeOutfile),
    bundle: ["@repotutor/core", "@repotutor/html", "@repotutor/shared", "@repotutor/codex"],
    external: [],
    unresolvedWorkspaceImports: false
  }
}, null, 2));

function copyNodeRuntime() {
  const source = process.execPath;
  if (!fs.existsSync(source)) {
    throw new Error(`current Node runtime was not found: ${source}`);
  }
  fs.mkdirSync(path.dirname(runtimeOutfile), { recursive: true });
  fs.copyFileSync(source, runtimeOutfile);
  fs.chmodSync(runtimeOutfile, 0o755);
}

async function loadRepoLocalEsbuild() {
  const pnpmDir = path.join(root, "node_modules/.pnpm");
  const entries = fs.readdirSync(pnpmDir)
    .filter((entry) => /^esbuild@/.test(entry))
    .sort(comparePnpmPackageNames)
    .reverse();
  for (const entry of entries) {
    const candidate = path.join(pnpmDir, entry, "node_modules/esbuild/lib/main.js");
    if (fs.existsSync(candidate)) {
      const resolved = path.resolve(candidate);
      if (!resolved.startsWith(path.resolve(root, "node_modules/.pnpm") + path.sep)) {
        throw new Error(`refusing non-repo esbuild path: ${resolved}`);
      }
      return import(pathToFileURL(resolved).href);
    }
  }
  throw new Error("repo-local esbuild package was not found under node_modules/.pnpm");
}

function comparePnpmPackageNames(left, right) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}
