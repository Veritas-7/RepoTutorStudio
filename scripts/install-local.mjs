#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const home = os.homedir();
const cliEntry = path.join(root, "apps/cli/dist/index.js");
const binDir = path.join(home, ".local/bin");
const binLink = path.join(binDir, "repo-tutor");
const sourceSkill = path.join(root, "skills/repo-tutor");
const skillTargets = [
  path.join(home, ".codex/skills/repo-tutor"),
  path.join(home, ".codex-cx/skills/repo-tutor")
];

run("pnpm", ["--filter", "@repotutor/cli", "build"], { cwd: root });

assertFile(cliEntry, "CLI build output");
fs.chmodSync(cliEntry, 0o755);
fs.mkdirSync(binDir, { recursive: true });
try {
  fs.rmSync(binLink, { force: true });
} catch (error) {
  throw new Error(`failed to replace ${binLink}: ${error.message}`);
}
fs.symlinkSync(cliEntry, binLink);

for (const target of skillTargets) {
  if (!target.startsWith(home + path.sep)) {
    throw new Error(`refusing to install skill outside the home directory: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(sourceSkill, target, { recursive: true, dereference: false });
  const wrapper = path.join(target, "scripts/repo-tutor-study.sh");
  if (fs.existsSync(wrapper)) fs.chmodSync(wrapper, 0o755);
}

console.log(JSON.stringify({
  ok: true,
  installed: {
    bin: binLink,
    binTarget: cliEntry,
    skills: skillTargets
  }
}, null, 2));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} was not found: ${filePath}`);
  }
}
