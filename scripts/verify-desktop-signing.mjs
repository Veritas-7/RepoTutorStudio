#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appBundle = process.env.REPOTUTOR_APP_BUNDLE
  ? path.resolve(process.env.REPOTUTOR_APP_BUNDLE)
  : path.join(root, "apps/desktop-tauri/src-tauri/target/release/bundle/macos/RepoTutor Studio.app");
const shouldSign = process.argv.includes("--sign");

if (!fs.existsSync(appBundle) || !fs.statSync(appBundle).isDirectory()) {
  throw new Error(`macOS app bundle was not found: ${appBundle}`);
}

if (shouldSign) {
  run("codesign", ["--force", "--deep", "--sign", "-", appBundle]);
}

run("codesign", ["--verify", "--deep", "--strict", appBundle]);

console.log(JSON.stringify({
  ok: true,
  checked: {
    appBundle,
    command: "codesign --verify --deep --strict",
    signedThisRun: shouldSign
  }
}, null, 2));

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result;
}
