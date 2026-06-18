#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const home = os.homedir();
const skillTargets = [
  path.join(home, ".codex/skills/repo-tutor"),
  path.join(home, ".codex-cx/skills/repo-tutor")
];
const fixture = path.join(root, "packages/core/tests/fixtures/simple-ts-app");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-local-install-"));

const commandPath = commandOutput("sh", ["-lc", "command -v repo-tutor"]).trim();
if (!commandPath) {
  throw new Error("repo-tutor was not found on PATH");
}

const doctor = run("repo-tutor", ["doctor"], { cwd: root });
if (!doctor.stdout.includes('"ok": true') && !doctor.stdout.includes("RepoTutor")) {
  throw new Error("repo-tutor doctor did not return a recognizable success payload");
}

for (const target of skillTargets) {
  assertDir(target, "installed skill directory");
  assertFile(path.join(target, "SKILL.md"), "installed skill manifest");
  assertFile(path.join(target, "scripts/repo-tutor-study.sh"), "installed skill wrapper");
}

const fallbackEnv = {
  ...process.env,
  REPOTUTOR_REPO_ROOT: root,
  PATH: fallbackPathWithoutLocalBin()
};

const localWrapper = path.join(root, "skills/repo-tutor/scripts/repo-tutor-study.sh");
run("bash", [localWrapper, fixture, "--mode", "quick", "--level", "beginner", "--no-codex", "--studies-root", path.join(tempRoot, "repo-local")], {
  cwd: root,
  env: fallbackEnv
});

for (const target of skillTargets) {
  const wrapper = path.join(target, "scripts/repo-tutor-study.sh");
  run("bash", [wrapper, fixture, "--mode", "quick", "--level", "beginner", "--no-codex", "--studies-root", path.join(tempRoot, installedSkillOwner(target))], {
    cwd: root,
    env: fallbackEnv
  });
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    commandPath,
    doctor: true,
    skillTargets,
    repoLocalWrapperFallback: true,
    installedWrapperFallback: true
  }
}, null, 2));

function commandOutput(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result;
}

function assertDir(dirPath, label) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`${label} was not found: ${dirPath}`);
  }
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} was not found: ${filePath}`);
  }
}

function fallbackPathWithoutLocalBin() {
  const homeLocalBin = path.join(home, ".local/bin");
  return (process.env.PATH ?? "")
    .split(path.delimiter)
    .filter((entry) => entry && path.resolve(entry) !== path.resolve(homeLocalBin))
    .join(path.delimiter);
}

function installedSkillOwner(target) {
  return path.basename(path.dirname(path.dirname(target))).replace(/^\./, "");
}
