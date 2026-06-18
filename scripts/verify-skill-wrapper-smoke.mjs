#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiesRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-skill-wrapper-smoke-"));
const smokeBin = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-skill-wrapper-bin-"));
const fixtureSource = path.join(root, "packages/core/tests/fixtures/simple-ts-app");
const wrappers = [
  { label: "source-skill", script: path.join(root, "skills/repo-tutor/scripts/repo-tutor-study.sh") },
  { label: "agent-skill-mirror", script: path.join(root, ".agents/skills/repo-tutor/scripts/repo-tutor-study.sh") }
];

linkTool("bash", "/bin/bash");
linkTool("node", process.execPath);
linkTool("pnpm", commandPath("pnpm"));

const smokePath = [smokeBin, "/usr/bin", "/bin", "/usr/sbin", "/sbin"].join(":");
assertCommandMissing("repo-tutor", smokePath);

const results = wrappers.map((wrapper) => {
  assertFile(wrapper.script, `${wrapper.label} wrapper`);
  const output = execFileSync(wrapper.script, [
    fixtureSource,
    "--mode",
    "quick",
    "--level",
    "beginner",
    "--format",
    "json",
    "--studies-root",
    studiesRoot,
    "--no-codex"
  ], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: smokePath,
      REPOTUTOR_REPO_ROOT: root,
      INIT_CWD: root
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const study = parseJson(output, wrapper.label);
  assertString(study, "sessionId");
  assertString(study, "path");
  assertFile(study.html, `${wrapper.label} study html`);
  assertFile(study.dailySummaryHtml, `${wrapper.label} daily summary html`);
  assertFile(study.teachingWorkspaceHtml, `${wrapper.label} teaching workspace html`);
  assertFile(study.learnerGoalAlignmentHtml, `${wrapper.label} learner goal alignment html`);
  assert(study.verificationOk === true, `${wrapper.label} verificationOk should be true`);
  assertFile(study.verificationReport, `${wrapper.label} verification report`);
  assertFile(study.verificationMarkdown, `${wrapper.label} verification markdown`);
  assertFile(study.verificationHtml, `${wrapper.label} verification html`);
  assert(Number.isInteger(study.verificationCheckedRequiredArtifacts) && study.verificationCheckedRequiredArtifacts > 0, `${wrapper.label} verificationCheckedRequiredArtifacts should be positive`);
  assert(Number.isInteger(study.quizQuestions) && study.quizQuestions > 0, `${wrapper.label} quizQuestions should be positive`);
  assert(fs.existsSync(path.join(study.path, "source")), `${wrapper.label} source snapshot should remain present`);
  return {
    label: wrapper.label,
    script: path.relative(root, wrapper.script),
    sessionId: study.sessionId,
    sessionRoot: study.path,
    html: study.html,
    teachingWorkspaceHtml: study.teachingWorkspaceHtml
  };
});

console.log(JSON.stringify({
  ok: true,
  studiesRoot,
  wrapperMode: "fallback-with-REPOTUTOR_REPO_ROOT",
  checked: {
    wrappers: results.map((result) => result.label),
    commands: ["skills/repo-tutor/scripts/repo-tutor-study.sh", ".agents/skills/repo-tutor/scripts/repo-tutor-study.sh"],
    fallback: ["PATH without repo-tutor", "REPOTUTOR_REPO_ROOT", "pnpm --silent --dir \"$repo_root\" -w build:runtime-deps", "pnpm --silent --dir \"$repo_root\" --filter @repotutor/cli exec tsx src/index.ts study"],
    study: ["html", "dailySummaryHtml", "teachingWorkspaceHtml", "learnerGoalAlignmentHtml", "verificationOk", "verificationReport", "verificationMarkdown", "verificationHtml", "verificationCheckedRequiredArtifacts", "quizQuestions"],
    sourceRetention: ["source snapshot still present"]
  },
  results
}, null, 2));

function commandPath(command) {
  return execFileSync("bash", ["-lc", `command -v ${command}`], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function linkTool(name, target) {
  fs.symlinkSync(target, path.join(smokeBin, name));
}

function assertCommandMissing(command, envPath) {
  try {
    execFileSync("bash", ["-c", `command -v ${command}`], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, PATH: envPath },
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch {
    return;
  }
  throw new Error(`${command} must be absent from the wrapper smoke PATH to prove fallback execution`);
}

function parseJson(output, label) {
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Failed to parse ${label} wrapper JSON:\n${output.slice(0, 2000)}`);
  }
}

function assertString(value, key) {
  assert(typeof value[key] === "string" && value[key].length > 0, `${key} should be a non-empty string`);
}

function assertFile(filePath, label) {
  assert(typeof filePath === "string" && filePath.length > 0, `${label} path should be a non-empty string`);
  assert(fs.existsSync(filePath), `${label} should exist: ${filePath}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
