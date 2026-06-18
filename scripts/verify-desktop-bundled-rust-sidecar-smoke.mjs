#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appBundle = path.join(root, "apps/desktop-tauri/src-tauri/target/release/bundle/macos/RepoTutor Studio.app");
const appBinary = path.join(appBundle, "Contents/MacOS/repotutor-studio");
const resourceSidecar = path.join(appBundle, "Contents/Resources/sidecar-dist/sidecar/bridge.js");
const resourceRuntime = path.join(appBundle, "Contents/Resources/runtime/node");

run("node", ["scripts/build-desktop-sidecar-bundle.mjs"]);
run("pnpm", ["--filter", "@repotutor/desktop-tauri", "tauri", "build", "--bundles", "app", "--ci"]);
assertFile(appBinary, "macOS app binary");
assertFile(resourceSidecar, "bundled desktop sidecar resource");
assertFile(resourceRuntime, "bundled desktop Node runtime resource");

run("cargo", [
  "test",
  "--manifest-path",
  "apps/desktop-tauri/src-tauri/Cargo.toml",
  "tauri_commands_discover_app_resource_sidecar_without_env",
  "--",
  "--ignored"
]);

console.log(JSON.stringify({
  ok: true,
  checked: {
    app: ["RepoTutor Studio.app", "Contents/MacOS/repotutor-studio"],
    resource: ["Contents/Resources/sidecar-dist/sidecar/bridge.js", "Contents/Resources/runtime/node"],
    rust: ["tauri_commands_discover_app_resource_sidecar_without_env"],
    env: ["REPOTUTOR_SIDECAR unset", "REPOTUTOR_TEST_CURRENT_EXE app layout"],
    commands: ["study_source", "list_sessions", "resume_session"],
    sourceRetention: ["source snapshot still present"]
  }
}, null, 2));

function run(command, args, input) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: root },
    input,
    stdio: ["pipe", "pipe", "pipe"]
  });
}

function assertFile(filePath, label) {
  if (typeof filePath !== "string" || filePath.length === 0 || !fs.existsSync(filePath)) {
    throw new Error(`${label} should exist: ${filePath}`);
  }
}
