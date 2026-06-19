#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiesRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-pruned-full-flow-"));
const fixtureSource = "packages/core/tests/fixtures/simple-ts-app";
const checked = {};

run("pnpm", ["-w", "build:runtime-deps"]);

const doctor = runCli(["doctor", "--format", "json", "--studies-root", studiesRoot]);
assert(doctor.ok === true, "doctor should report ok");
assertArrayIncludesAll(doctor.commands, [
  "study",
  "quiz",
  "resume",
  "evidence",
  "export",
  "verify-export",
  "verify-evidence",
  "verify-session",
  "verify-list-output",
  "list",
  "open",
  "prune-source",
  "doctor"
], "doctor commands");
assert(doctor.runtimeHealth.studiesRootExists === true, "doctor should see studies root");
checked.doctor = ["commands", "runtimeHealth"];

const openTargetsCatalog = runCli(["open", "--list-targets", "--format", "json"]);
assert(openTargetsCatalog.some((entry) => entry.target === "source-retention-guide"), "open target catalog should include source-retention-guide");
assert(openTargetsCatalog.some((entry) => entry.target === "teaching-workspace"), "open target catalog should include teaching-workspace");
checked.openCatalog = ["source-retention-guide", "teaching-workspace"];

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
assert(study.verificationOk === true, "study verificationOk should be true");
assertDirectory(path.join(study.path, "source"), "generated session source snapshot");
assertFile(study.html, "study html");
assertFile(study.dailySummaryHtml, "daily summary html");
assertFile(study.teachingWorkspaceHtml, "teaching workspace html");
checked.study = ["session", "sourceSnapshot", "htmlTargets", "verification"];

const resumeBeforePrune = runCli([
  "resume",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(resumeBeforePrune.verificationOk === true, "resume before prune should pass verification summary");
assert(resumeBeforePrune.verificationStatus === "passed", "resume before prune verificationStatus should be passed");
assertFile(resumeBeforePrune.htmlTargets["source-retention-guide"], "resume source-retention-guide target");
checked.resumeBeforePrune = ["verification", "htmlTargetStatus", "source-retention-guide"];

const evidence = runCli([
  "evidence",
  study.path,
  "--format",
  "json",
  "--limit",
  "50",
  "--studies-root",
  studiesRoot
]);
assert(evidence.totalEvidenceItems > 0, "evidence should report source-grounded items");
assert(evidence.returnedItems > 0, "evidence should return at least one item");
const firstEvidence = evidence.items[0];
assertString(firstEvidence, "kind");
assertString(firstEvidence, "filePath");
const filteredEvidence = runCli([
  "evidence",
  study.path,
  "--format",
  "json",
  "--kind",
  firstEvidence.kind,
  "--file",
  firstEvidence.filePath,
  "--limit",
  "1",
  "--studies-root",
  studiesRoot
]);
assert(filteredEvidence.returnedItems === 1, "filtered evidence should return one item");
checked.evidence = ["index", "kindFilter", "fileFilter"];

const exportHtml = runCli([
  "export",
  study.path,
  "--format",
  "html",
  "--summary-format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(exportHtml.integrityOk === true, "html export integrity should pass");
assertFile(exportHtml.path, "html export path");
assertFile(exportHtml.manifest, "html export manifest");

const verifyExport = runCli([
  "verify-export",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(verifyExport.ok === true, "verify-export should pass");

const exportZip = runCli([
  "export",
  study.path,
  "--format",
  "zip",
  "--summary-format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(exportZip.integrityOk === true, "zip export integrity should pass");
assertFile(exportZip.path, "zip export path");
assert(exportZip.zipBytes > 0, "zip export should report bytes");
assert(exportZip.zipFiles > 0, "zip export should report files");
checked.export = ["html", "zip", "verify-export"];

const verifyEvidenceBeforePrune = runCli([
  "verify-evidence",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(verifyEvidenceBeforePrune.ok === true, "verify-evidence before prune should pass");
assert(verifyEvidenceBeforePrune.sourcePruned === false, "verify-evidence before prune should not be pruned");

const verifySessionBeforePrune = runCli([
  "verify-session",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(verifySessionBeforePrune.ok === true, "verify-session before prune should pass");
checked.verificationBeforePrune = ["verify-evidence", "verify-session"];

const quizDefinition = JSON.parse(fs.readFileSync(path.join(study.path, "analysis", "quiz.json"), "utf8"));
const answers = Object.fromEntries(quizDefinition.questions.map((question) => [question.id, question.correctChoice]));
const answersPath = path.join(studiesRoot, "answers.json");
fs.writeFileSync(answersPath, `${JSON.stringify(answers, null, 2)}\n`);
const quiz = runCli([
  "quiz",
  study.path,
  "--answers",
  answersPath,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(quiz.score === 100, "quiz should score 100 with generated correct answers");
assert(quiz.wrong === 0, "quiz wrong count should be 0");
assertFile(quiz.learningRecord, "quiz learning record");
checked.quiz = ["answersFile", "score", "learningRecord"];

const listRows = runCli([
  "list",
  "--format",
  "json",
  "--verified-only",
  "--scored-only",
  "--min-score",
  "100",
  "--max-score",
  "100",
  "--sort",
  "score-desc",
  "--studies-root",
  studiesRoot
]);
assert(Array.isArray(listRows) && listRows.length === 1, "list json should return one scored session");
assert(listRows[0].sessionId === study.sessionId, "list should include created session");
assert(listRows[0].score === 100, "list should include quiz score");

const listSummary = runCli([
  "list",
  "--summary",
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(listSummary.total === 1, "list summary should count one session");
assert(listSummary.quiz.scored === 1, "list summary should count scored session");

const listCsvPath = path.join(studiesRoot, "sessions.csv");
const listCsvManifest = runCli([
  "list",
  "--format",
  "csv",
  "--field-preset",
  "compact",
  "--output",
  listCsvPath,
  "--output-manifest",
  "--studies-root",
  studiesRoot
]);
assertFile(listCsvManifest.outputPath, "list csv output");
assertFile(listCsvManifest.manifestPath, "list csv manifest");

const verifyListOutput = runCli([
  "verify-list-output",
  listCsvManifest.outputPath,
  "--manifest",
  listCsvManifest.manifestPath,
  "--format",
  "json"
]);
assert(verifyListOutput.ok === true, "verify-list-output should pass");

const listJsonlText = runCliText([
  "list",
  "--format",
  "jsonl",
  "--fields",
  "sessionId,score,path",
  "--studies-root",
  studiesRoot
]);
const jsonlRows = listJsonlText.trim().split("\n").map((line) => JSON.parse(line));
assert(jsonlRows.length === 1 && jsonlRows[0].sessionId === study.sessionId, "list jsonl should return created session");
checked.list = ["jsonFilters", "summary", "csvManifest", "verify-list-output", "jsonlFields"];

const openIndexText = runCliText([
  "open",
  study.path,
  "--target",
  "index",
  "--studies-root",
  studiesRoot
]).trim();
assertFile(openIndexText, "open index target");
const openAll = runCli([
  "open",
  study.path,
  "--target",
  "all",
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assertFile(openAll.index, "open all index");
assertFile(openAll["source-retention-guide"], "open all source-retention-guide");
checked.openSession = ["index", "all", "source-retention-guide"];

const pruneWithoutConfirm = runCliFailure([
  "prune-source",
  study.path,
  "--apply",
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(pruneWithoutConfirm.exitCode !== 0, "prune-source --apply without confirm should fail");
assert(pruneWithoutConfirm.stderr.includes("DELETE-SOURCE-SNAPSHOT"), "prune-source failure should mention confirmation token");

const pruneDryRun = runCli([
  "prune-source",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(pruneDryRun.applied === false, "prune-source dry run should not apply");
assert(pruneDryRun.applyReady === true, "prune-source dry run should be ready on verified session");
assert(pruneDryRun.sourcePresent === true, "prune-source dry run should see source present");
assertDirectory(path.join(study.path, "source"), "source snapshot before prune apply");

const pruneApply = runCli([
  "prune-source",
  study.path,
  "--apply",
  "--confirm",
  "DELETE-SOURCE-SNAPSHOT",
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(pruneApply.applied === true, "prune-source apply should report applied");
assert(pruneApply.apply.applied === true, "prune-source apply payload should include apply result");
assert(pruneApply.apply.removedFiles > 0, "prune-source apply should remove files");
assert(!fs.existsSync(path.join(study.path, "source")), "generated session source snapshot should be removed after prune");
assertFile(path.join(study.path, "SOURCE-PRUNED.md"), "source prune tombstone");
assertFile(path.join(study.path, "analysis", "source-prune-applied.json"), "source prune apply report");
checked.pruneSource = ["missingConfirmGuard", "dryRun", "apply", "tombstone"];

const verifyEvidenceAfterPrune = runCli([
  "verify-evidence",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(verifyEvidenceAfterPrune.ok === true, "verify-evidence after prune should pass");
assert(verifyEvidenceAfterPrune.sourcePruned === true, "verify-evidence after prune should be sourcePruned");
assert(verifyEvidenceAfterPrune.skippedPrunedSourceLinks > 0, "verify-evidence after prune should skip pruned source links");

const verifySessionAfterPrune = runCli([
  "verify-session",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(verifySessionAfterPrune.ok === true, "verify-session after prune should pass");
assert(verifySessionAfterPrune.evidenceIndex.sourcePruned === true, "verify-session after prune should carry sourcePruned evidence status");

const resumeAfterPrune = runCli([
  "resume",
  study.path,
  "--format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(resumeAfterPrune.verificationOk === true, "resume after prune should still pass stored verification summary");
assertFile(resumeAfterPrune.html, "resume after prune html");

const exportAfterPrune = runCli([
  "export",
  study.path,
  "--format",
  "html",
  "--summary-format",
  "json",
  "--studies-root",
  studiesRoot
]);
assert(exportAfterPrune.integrityOk === true, "export after prune should pass");
checked.afterPrune = ["verify-evidence", "verify-session", "resume", "export"];

console.log(JSON.stringify({
  ok: true,
  studiesRoot,
  sessionRoot: study.path,
  sessionId: study.sessionId,
  sourcePruned: true,
  checked,
  commandCoverage: [
    "doctor",
    "study",
    "resume",
    "evidence",
    "export",
    "verify-export",
    "verify-evidence",
    "verify-session",
    "verify-list-output",
    "list",
    "open",
    "quiz",
    "prune-source"
  ],
  pruneSafety: {
    userOriginalSourceTouched: false,
    deletedPath: path.join(study.path, "source"),
    tombstone: path.join(study.path, "SOURCE-PRUNED.md"),
    afterPruneEvidenceOk: verifyEvidenceAfterPrune.ok,
    afterPruneSessionOk: verifySessionAfterPrune.ok
  }
}, null, 2));

function runCli(args) {
  const output = runCliText(args);
  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse CLI JSON for ${args.join(" ")}: ${error.message}\n${output.slice(0, 2000)}`);
  }
}

function runCliText(args) {
  return run("pnpm", ["--silent", "--filter", "@repotutor/cli", "exec", "tsx", "src/index.ts", ...args]);
}

function runCliFailure(args) {
  const result = spawnSync("pnpm", ["--silent", "--filter", "@repotutor/cli", "exec", "tsx", "src/index.ts", ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: root },
    stdio: ["ignore", "pipe", "pipe"]
  });
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
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
  assert(fs.statSync(filePath).isFile(), `${label} should be a file: ${filePath}`);
}

function assertDirectory(filePath, label) {
  assert(typeof filePath === "string" && filePath.length > 0, `${label} path should be a non-empty string`);
  assert(fs.existsSync(filePath), `${label} should exist: ${filePath}`);
  assert(fs.statSync(filePath).isDirectory(), `${label} should be a directory: ${filePath}`);
}

function assertArrayIncludesAll(actual, expected, label) {
  assert(Array.isArray(actual), `${label} should be an array`);
  const missing = expected.filter((item) => !actual.includes(item));
  assert(missing.length === 0, `${label} missing expected values: ${missing.join(", ")}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
