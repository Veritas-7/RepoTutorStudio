#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

run("pnpm", ["exec", "vitest", "run", "packages/core/src/source-mode-study.test.ts"]);

console.log(JSON.stringify({
  ok: true,
  checked: {
    inputModes: ["SKILL.md folder", "CLI-Anything target"],
    pipeline: ["parseSource", "copySafeTree", "runStudy", "verifyStudySessionArtifacts"],
    artifacts: ["session.json", "analysis/quiz.json", "html/index.html"],
    safety: ["no analyzed project command execution", "CLI-Anything harness script not invoked"],
    sourceRetention: ["source snapshot still present for skill study", "source snapshot still present for CLI-Anything study"]
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
