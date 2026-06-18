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
  "tauri_commands_discover_compiled_bridge_without_env",
  "--",
  "--ignored"
], undefined, {
  REPOTUTOR_SIDECAR: undefined
});

console.log(JSON.stringify({
  ok: true,
  checked: {
    rust: ["tauri_commands_discover_compiled_bridge_without_env"],
    env: ["REPOTUTOR_SIDECAR unset", "REPOTUTOR_STUDIES_ROOT temporary"],
    discovery: ["default sidecar path", "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js"],
    commands: ["study_source", "list_sessions", "resume_session"],
    runner: ["cargo", "test", "node", "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js"],
    sourceRetention: ["source snapshot still present"]
  }
}, null, 2));

function run(command, args, input, env = {}) {
  const mergedEnv = { ...process.env, ...env, INIT_CWD: root };
  for (const [key, value] of Object.entries(mergedEnv)) {
    if (value === undefined) delete mergedEnv[key];
  }
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: mergedEnv,
    input,
    stdio: ["pipe", "pipe", "pipe"]
  });
}

function assertFile(filePath, label) {
  if (typeof filePath !== "string" || filePath.length === 0 || !fs.existsSync(filePath)) {
    throw new Error(`${label} should exist: ${filePath}`);
  }
}
