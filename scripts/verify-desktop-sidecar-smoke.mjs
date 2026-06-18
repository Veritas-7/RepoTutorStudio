#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiesRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-desktop-sidecar-smoke-"));
const fixtureSource = path.join(root, "packages/core/tests/fixtures/simple-ts-app");
const compiledSidecar = path.join(root, "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js");

run("pnpm", ["-w", "build:runtime-deps"]);
run("node", ["scripts/build-desktop-sidecar-bundle.mjs"]);
assertFile(compiledSidecar, "compiled desktop sidecar bridge");

const study = sidecar("study", {
  source: fixtureSource,
  mode: "quick",
  level: "beginner",
  studiesRoot,
  enableCodex: false
});

assertString(study, "sessionId");
assertString(study, "path");
assertFile(study.html, "study html");
assertFile(study.dailySummaryHtml, "daily summary html");
assertFile(study.teachingWorkspaceHtml, "teaching workspace html");
assertFile(study.learnerGoalAlignmentHtml, "learner goal alignment html");
assert(study.verificationOk === true, "study verificationOk should be true");
assertFile(study.verificationReport, "study verification report");
assertFile(study.verificationMarkdown, "study verification markdown");
assertFile(study.verificationHtml, "study verification html");
assert(Number.isInteger(study.verificationCheckedRequiredArtifacts) && study.verificationCheckedRequiredArtifacts > 0, "study verificationCheckedRequiredArtifacts should be positive");
assert(Number.isInteger(study.quizQuestions) && study.quizQuestions > 0, "study quizQuestions should be positive");

const listed = sidecar("list", { studiesRoot });
assert(Array.isArray(listed), "list result should be an array");
const listedRow = listed.find((session) => session.sessionId === study.sessionId);
assert(listedRow, "list should include the study session");
assert(listedRow.repo === "local/simple-ts-app", "list row repo should match owner/repo");
assert(listedRow.mode === "quick", "list row mode should match study mode");
assert(listedRow.level === "beginner", "list row level should match learner level");
assert(listedRow.score === null, "list row score should be null before quiz submission");
assert(listedRow.wrong === 0, "list row wrong count should be 0 before quiz submission");
assert(listedRow.path === study.path, "list row path should match study path");
assertFile(listedRow.html, "list row html");

const resumed = sidecar("resume", { sessionPath: study.path });
assert(resumed.sessionId === study.sessionId, "resumed sessionId should match study session");
assert(resumed.path === study.path, "resumed path should match study path");
assertFile(resumed.html, "resumed study html");
assertFile(resumed.dailySummaryHtml, "resumed daily summary html");
assertFile(resumed.teachingWorkspaceHtml, "resumed teaching workspace html");
assertFile(resumed.learnerGoalAlignmentHtml, "resumed learner goal alignment html");
assert(resumed.verificationOk === true, "resumed verificationOk should be true");
assertFile(resumed.verificationReport, "resumed verification report");
assertFile(resumed.verificationMarkdown, "resumed verification markdown");
assertFile(resumed.verificationHtml, "resumed verification html");
assert(resumed.verificationCheckedRequiredArtifacts === study.verificationCheckedRequiredArtifacts, "resumed verificationCheckedRequiredArtifacts should match study");
assert(resumed.quizQuestions === study.quizQuestions, "resumed quizQuestions should match study");

const quiz = JSON.parse(fs.readFileSync(path.join(study.path, "analysis", "quiz.json"), "utf8"));
const answers = Object.fromEntries(quiz.questions.map((question) => [question.id, question.correctChoice]));
const attempt = sidecar("quiz", {
  sessionPath: study.path,
  answers
});

assertString(attempt, "attemptId");
assert(attempt.score === 100, "sidecar quiz score should be 100 with generated correct answers");
assert(attempt.wrong === 0, "sidecar quiz wrong count should be 0 with generated correct answers");
assertFile(attempt.wrongNotesHtml, "sidecar quiz wrongNotesHtml");
assertFile(attempt.wrongNotesMarkdown, "sidecar quiz wrongNotesMarkdown");
assertFile(attempt.learningRecord, "sidecar quiz learningRecord");
assertString(attempt, "reviewGuidance");

const prune = sidecar("sourcePrunePlan", { sessionPath: study.path });
assert(prune.applied === false, "sourcePrunePlan should stay dry-run");
assertFile(prune.reportPath, "source prune report");
assertFile(prune.markdownPath, "source prune markdown");
assert(fs.existsSync(path.join(study.path, "source")), "sidecar smoke must not prune generated source snapshot");

console.log(JSON.stringify({
  ok: true,
  studiesRoot,
  sessionRoot: study.path,
  sessionId: study.sessionId,
  checked: {
    sidecar: ["study", "list", "resume", "quiz", "sourcePrunePlan"],
    runner: ["node", "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js"],
    list: ["sessionId", "repo", "mode", "level", "score", "wrong", "path", "html"],
    study: ["html", "dailySummaryHtml", "teachingWorkspaceHtml", "learnerGoalAlignmentHtml", "verificationOk", "verificationReport", "verificationMarkdown", "verificationHtml", "verificationCheckedRequiredArtifacts", "quizQuestions"],
    resume: ["html", "dailySummaryHtml", "teachingWorkspaceHtml", "learnerGoalAlignmentHtml", "verificationOk", "verificationReport", "verificationMarkdown", "verificationHtml", "verificationCheckedRequiredArtifacts", "quizQuestions"],
    quiz: ["wrongNotesHtml", "wrongNotesMarkdown", "learningRecord", "reviewGuidance"],
    prune: ["dryRun", "sourceStillPresent"]
  }
}, null, 2));

function sidecar(method, params) {
  const request = `${JSON.stringify({ id: method, method, params })}\n`;
  const output = run("node", [compiledSidecar], request);
  const line = output.split(/\r?\n/).find(Boolean);
  if (!line) throw new Error(`No sidecar output for ${method}`);
  const envelope = JSON.parse(line);
  if (envelope.result?.error) throw new Error(`Sidecar ${method} error: ${envelope.result.error}`);
  return envelope.result;
}

function run(command, args, input) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: root },
    input,
    stdio: ["pipe", "pipe", "pipe"]
  });
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
