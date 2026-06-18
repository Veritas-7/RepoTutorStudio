#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const compiledSidecar = path.join(root, "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js");

run("pnpm", ["-w", "build:runtime-deps"]);
run("node", ["scripts/build-desktop-sidecar-bundle.mjs"]);
assertFile(compiledSidecar, "compiled desktop sidecar bridge");

run("cargo", [
  "test",
  "--manifest-path",
  "apps/desktop-tauri/src-tauri/Cargo.toml",
  "call_sidecar_drives_compiled_bridge",
  "--",
  "--ignored"
], undefined, {
  REPOTUTOR_SIDECAR: compiledSidecar
});

console.log(JSON.stringify({
  ok: true,
  checked: {
    rust: ["call_sidecar_drives_compiled_bridge"],
    env: ["REPOTUTOR_SIDECAR"],
    runner: ["cargo", "test", "node", "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js"]
  }
}, null, 2));

function run(command, args, input, env = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env, INIT_CWD: root },
    input,
    stdio: ["pipe", "pipe", "pipe"]
  });
}

function assertFile(filePath, label) {
  if (typeof filePath !== "string" || filePath.length === 0 || !fs.existsSync(filePath)) {
    throw new Error(`${label} should exist: ${filePath}`);
  }
}
