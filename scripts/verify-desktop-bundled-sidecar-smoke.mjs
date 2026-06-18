#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiesRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-desktop-bundled-sidecar-smoke-"));
const fixtureSource = path.join(root, "packages/core/tests/fixtures/simple-ts-app");
const appBundle = path.join(root, "apps/desktop-tauri/src-tauri/target/release/bundle/macos/RepoTutor Studio.app");
const appBinary = path.join(appBundle, "Contents/MacOS/repotutor-studio");
const resourceSidecar = path.join(appBundle, "Contents/Resources/sidecar-dist/sidecar/bridge.js");
const resourceRuntime = path.join(appBundle, "Contents/Resources/runtime/node");

run("node", ["scripts/build-desktop-sidecar-bundle.mjs"]);
assertBundledBridge(path.join(root, "apps/desktop-tauri/sidecar-dist/sidecar/bridge.js"));
run("pnpm", ["--filter", "@repotutor/desktop-tauri", "tauri", "build", "--bundles", "app", "--ci"]);
assertFile(appBinary, "macOS app binary");
assertFile(resourceSidecar, "bundled desktop sidecar resource");
assertFile(resourceRuntime, "bundled desktop Node runtime resource");
assertBundledBridge(resourceSidecar);

const study = sidecar(resourceSidecar, "study", {
  source: fixtureSource,
  mode: "quick",
  level: "beginner",
  studiesRoot,
  enableCodex: false
});

assertString(study, "sessionId");
assertString(study, "path");
assertFile(study.html, "bundled sidecar study html");
assertFile(study.dailySummaryHtml, "bundled sidecar daily summary html");
assertFile(study.teachingWorkspaceHtml, "bundled sidecar teaching workspace html");
assert(study.verificationOk === true, "bundled sidecar study verificationOk should be true");
assert(Number.isInteger(study.quizQuestions) && study.quizQuestions > 0, "bundled sidecar quizQuestions should be positive");
assert(fs.existsSync(path.join(study.path, "source")), "bundled sidecar smoke must keep generated source snapshot");

const listed = sidecar(resourceSidecar, "list", { studiesRoot });
assert(Array.isArray(listed), "bundled sidecar list result should be an array");
assert(listed.some((session) => session.sessionId === study.sessionId), "bundled sidecar list should include the study session");

const resumed = sidecar(resourceSidecar, "resume", { sessionPath: study.path });
assert(resumed.sessionId === study.sessionId, "bundled sidecar resume sessionId should match");
assert(resumed.path === study.path, "bundled sidecar resume path should match");
assert(resumed.verificationOk === true, "bundled sidecar resume verificationOk should be true");

const codexEnabledStudy = sidecar(resourceSidecar, "study", {
  source: fixtureSource,
  mode: "quick",
  level: "beginner",
  studiesRoot,
  enableCodex: true,
  learnerBriefText: "Verify the packaged app default Codex-enabled path stays fail-closed."
});
assertString(codexEnabledStudy, "sessionId");
assertFile(codexEnabledStudy.html, "Codex-enabled bundled sidecar study html");
assert(codexEnabledStudy.status === "complete", "Codex-enabled bundled sidecar study should complete");
assert(codexEnabledStudy.verificationOk === true, "Codex-enabled bundled sidecar study verificationOk should be true");
assert(fs.existsSync(path.join(codexEnabledStudy.path, "source")), "Codex-enabled bundled sidecar smoke must keep generated source snapshot");
const codexPrompts = fs.readFileSync(path.join(codexEnabledStudy.path, "codex", "prompts.jsonl"), "utf8");
assert(codexPrompts.includes("vibe-coding learner"), "Codex prompts should keep the vibe-coding learner framing");
const codexEvents = readJsonLines(path.join(codexEnabledStudy.path, "codex", "events.jsonl"));
const codexStatuses = codexEvents.map((event) => event.status);
assert(codexStatuses.length > 0, "Codex-enabled bundled sidecar should write codex events");
assert(!codexStatuses.includes("skipped"), "Codex-enabled bundled sidecar should attempt the SDK path instead of skipping it");
assert(codexStatuses.every((status) => status === "success" || status === "failed"), "Codex-enabled bundled sidecar should log success or fail-closed status");

console.log(JSON.stringify({
  ok: true,
  studiesRoot,
  sessionRoot: study.path,
  sessionId: study.sessionId,
  checked: {
    app: ["RepoTutor Studio.app", "Contents/MacOS/repotutor-studio"],
    resource: ["Contents/Resources/sidecar-dist/sidecar/bridge.js", "Contents/Resources/runtime/node"],
    bundle: ["self-contained @repotutor workspace code", "bundled @openai/codex-sdk"],
    sidecar: ["study", "list", "resume"],
    codexEnabled: ["enableCodex true", "codex/prompts.jsonl", "codex/events.jsonl", ...codexStatuses.map((status) => `codex ${status}`)],
    sourceRetention: ["source snapshot still present"]
  }
}, null, 2));

function sidecar(sidecarPath, method, params) {
  const request = `${JSON.stringify({ id: method, method, params })}\n`;
  const output = run(resourceRuntime, [sidecarPath], request, { PATH: "/usr/bin:/bin" });
  const line = output.split(/\r?\n/).find(Boolean);
  if (!line) throw new Error(`No bundled sidecar output for ${method}`);
  const envelope = JSON.parse(line);
  if (envelope.result?.error) throw new Error(`Bundled sidecar ${method} error: ${envelope.result.error}`);
  return envelope.result;
}

function run(command, args, input, envOverride = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: root, ...envOverride },
    input,
    stdio: ["pipe", "pipe", "pipe"]
  });
}

function assertBundledBridge(filePath) {
  assertFile(filePath, "self-contained desktop sidecar bridge");
  const text = fs.readFileSync(filePath, "utf8");
  assert(!/(?:from\s+|import\s*\()\s*["']@repotutor\//.test(text), "sidecar bridge should not contain unresolved @repotutor imports");
  assert(!/(?:from\s+|import\s*\(|require\s*\()\s*["']@openai\/codex-sdk["']/.test(text), "sidecar bridge should not contain unresolved @openai/codex-sdk imports");
}

function assertString(value, key) {
  assert(typeof value[key] === "string" && value[key].length > 0, `${key} should be a non-empty string`);
}

function assertFile(filePath, label) {
  assert(typeof filePath === "string" && filePath.length > 0, `${label} path should be a non-empty string`);
  assert(fs.existsSync(filePath), `${label} should exist: ${filePath}`);
}

function readJsonLines(filePath) {
  assertFile(filePath, "JSONL file");
  return fs.readFileSync(filePath, "utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
