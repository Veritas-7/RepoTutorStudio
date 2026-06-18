#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sidecarDist = path.join(root, "apps/desktop-tauri/sidecar-dist");
const bridge = path.join(sidecarDist, "sidecar/bridge.js");
const runtime = path.join(sidecarDist, "runtime/node");
const appBundle = process.env.REPOTUTOR_APP_BUNDLE
  ? path.resolve(process.env.REPOTUTOR_APP_BUNDLE)
  : path.join(root, "apps/desktop-tauri/src-tauri/target/release/bundle/macos/RepoTutor Studio.app");
const requireApp = process.argv.includes("--require-app");

assertExecutable(runtime, "bundled Node runtime");
assertFile(bridge, "bundled desktop sidecar bridge");
assertNoUnresolvedImports(bridge);
runBridgeList(runtime, bridge);

let appResources = null;
if (fs.existsSync(appBundle)) {
  const appBridge = path.join(appBundle, "Contents/Resources/sidecar-dist/sidecar/bridge.js");
  const appRuntime = path.join(appBundle, "Contents/Resources/runtime/node");
  assertFile(appBridge, "app resource sidecar bridge");
  assertExecutable(appRuntime, "app resource Node runtime");
  assertNoUnresolvedImports(appBridge);
  runBridgeList(appRuntime, appBridge);
  appResources = { appBundle, bridge: appBridge, runtime: appRuntime };
} else if (requireApp) {
  throw new Error(`macOS app bundle was not found: ${appBundle}`);
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    sidecarDist: {
      bridge,
      runtime,
      pathStrippedRun: true
    },
    appResources
  }
}, null, 2));

function runBridgeList(nodePath, bridgePath) {
  const studiesRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-runtime-bundle-"));
  const request = `${JSON.stringify({ id: "verify-runtime", method: "list", params: { studiesRoot } })}\n`;
  const result = spawnSync(nodePath, [bridgePath], {
    input: request,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: "/usr/bin:/bin"
    },
    timeout: 120_000
  });
  if (result.status !== 0) {
    throw new Error(`sidecar list failed: ${result.stderr || result.stdout}`);
  }
  const firstLine = result.stdout.trim().split(/\r?\n/)[0] ?? "";
  const envelope = JSON.parse(firstLine);
  if (envelope.id !== "verify-runtime" || !Array.isArray(envelope.result)) {
    throw new Error(`unexpected sidecar list response: ${firstLine}`);
  }
}

function assertNoUnresolvedImports(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const unresolvedWorkspaceImport = /(?:from\s+|import\s*\()\s*["']@repotutor\//.test(text);
  const unresolvedCodexSdkImport = /(?:from\s+|import\s*\(|require\s*\()\s*["']@openai\/codex-sdk["']/.test(text);
  if (unresolvedWorkspaceImport) throw new Error(`${filePath} contains unresolved @repotutor import`);
  if (unresolvedCodexSdkImport) throw new Error(`${filePath} contains unresolved @openai/codex-sdk import`);
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} was not found: ${filePath}`);
  }
}

function assertExecutable(filePath, label) {
  assertFile(filePath, label);
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
  } catch {
    throw new Error(`${label} is not executable: ${filePath}`);
  }
}
