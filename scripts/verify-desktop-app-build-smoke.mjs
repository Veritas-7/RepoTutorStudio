#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const desktopRoot = path.join(root, "apps/desktop-tauri");
const binary = path.join(desktopRoot, "src-tauri/target/release/repotutor-studio");
const frontendIndex = path.join(desktopRoot, "dist/index.html");

run("pnpm", ["--filter", "@repotutor/desktop-tauri", "tauri", "build", "--no-bundle", "--ci"]);

assertFile(binary, "Tauri release binary");
assertExecutable(binary, "Tauri release binary");
assertFile(frontendIndex, "Tauri frontend dist index");

const stats = fs.statSync(binary);
assert(stats.size > 0, "Tauri release binary should be non-empty");

console.log(JSON.stringify({
  ok: true,
  checked: {
    command: ["pnpm", "--filter", "@repotutor/desktop-tauri", "tauri", "build", "--no-bundle", "--ci"],
    tauri: ["beforeBuildCommand", "frontendDist", "release binary", "no installer bundle required"],
    artifacts: ["apps/desktop-tauri/dist/index.html", "apps/desktop-tauri/src-tauri/target/release/repotutor-studio"]
  },
  artifacts: {
    binary,
    binaryBytes: stats.size,
    frontendIndex
  }
}, null, 2));

function run(command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: root },
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function assertFile(filePath, label) {
  assert(typeof filePath === "string" && filePath.length > 0, `${label} path should be a non-empty string`);
  assert(fs.existsSync(filePath), `${label} should exist: ${filePath}`);
}

function assertExecutable(filePath, label) {
  fs.accessSync(filePath, fs.constants.X_OK);
  assert(true, `${label} should be executable`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
