#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiesRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-skill-output-smoke-"));
const fixtureSource = "packages/core/tests/fixtures/simple-ts-app";

run("pnpm", ["-w", "build:runtime-deps"]);

const study = runCli([
  "study",
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
]);

assertString(study, "sessionId");
assertString(study, "path");
assertFile(study.html, "study html");
assertFile(study.dailySummaryHtml, "daily summary html");
assertFile(study.teachingWorkspaceHtml, "teaching workspace html");
assertFile(study.learnerGoalAlignmentHtml, "learner goal alignment html");
assert(study.verificationOk === true, "study verificationOk should be true");
assert(Number.isInteger(study.verificationCheckedRequiredArtifacts) && study.verificationCheckedRequiredArtifacts > 0, "study verificationCheckedRequiredArtifacts should be positive");
assert(Number.isInteger(study.quizQuestions) && study.quizQuestions > 0, "study quizQuestions should be positive");

const resume = runCli([
  "resume",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);

assert(resume.root === study.path, "resume root should match study path");
assertFile(resume.html, "resume html");
assertFile(resume.dailySummaryHtml, "resume daily summary html");
assertFile(resume.teachingWorkspaceHtml, "resume teaching workspace html");
assert(resume.verificationOk === true, "resume verificationOk should be true");
assert(resume.verificationStatus === "passed", "resume verificationStatus should be passed");

const openTargets = runCli([
  "open",
  study.path,
  "--target",
  "all",
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);

assertFile(openTargets.index, "open target index");
assertFile(openTargets["daily-summary"], "open target daily-summary");
assertFile(openTargets["teaching-workspace"], "open target teaching-workspace");

const quiz = JSON.parse(fs.readFileSync(path.join(study.path, "analysis", "quiz.json"), "utf8"));
const answers = Object.fromEntries(quiz.questions.map((question) => [question.id, question.correctChoice]));
const answersPath = path.join(studiesRoot, "answers.json");
fs.writeFileSync(answersPath, `${JSON.stringify(answers, null, 2)}\n`);

const quizResult = runCli([
  "quiz",
  study.path,
  "--answers",
  answersPath,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);

assertString(quizResult, "attemptId");
assert(quizResult.score === 100, "quiz score should be 100 with generated correct answers");
assert(quizResult.wrong === 0, "quiz wrong count should be 0 with generated correct answers");
assertFile(quizResult.wrongNotesHtml, "quiz wrongNotesHtml");
assertFile(quizResult.wrongNotesMarkdown, "quiz wrongNotesMarkdown");
assertFile(quizResult.learningRecord, "quiz learningRecord");
assertString(quizResult, "reviewGuidance");

console.log(JSON.stringify({
  ok: true,
  studiesRoot,
  sessionRoot: study.path,
  sessionId: study.sessionId,
  checked: {
    study: ["html", "dailySummaryHtml", "teachingWorkspaceHtml", "verificationOk", "verificationCheckedRequiredArtifacts", "quizQuestions"],
    resume: ["html", "dailySummaryHtml", "teachingWorkspaceHtml", "verificationStatus"],
    open: ["index", "daily-summary", "teaching-workspace"],
    quiz: ["wrongNotesHtml", "wrongNotesMarkdown", "learningRecord", "reviewGuidance"]
  }
}, null, 2));

function runCli(args) {
  const output = run("pnpm", ["--silent", "--filter", "@repotutor/cli", "exec", "tsx", "src/index.ts", ...args]);
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Failed to parse CLI JSON for ${args.join(" ")}:\n${output.slice(0, 2000)}`);
  }
}

function run(command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: root },
    stdio: ["ignore", "pipe", "pipe"]
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
