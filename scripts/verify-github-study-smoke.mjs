#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

run("pnpm", ["exec", "vitest", "run", "packages/core/src/github-study.test.ts"]);

console.log(JSON.stringify({
  ok: true,
  checked: {
    inputModes: ["GitHub URL", "GitHub branch URL"],
    pipeline: ["parseSource", "git clone --depth 1 --branch", "runStudy", "verifyStudySessionArtifacts"],
    artifacts: ["session.json", "analysis/quiz.json", "html/index.html"],
    safety: ["no network dependency in smoke", "no analyzed project command execution", "secret-like .env excluded from generated session source snapshot"],
    sourceRetention: ["source snapshot still present after GitHub clone"]
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
