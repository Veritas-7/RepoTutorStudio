#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

run("pnpm", ["exec", "vitest", "run", "packages/core/src/zip-study.test.ts"]);

console.log(JSON.stringify({
  ok: true,
  checked: {
    inputModes: ["ZIP path"],
    pipeline: ["parseSource", "extract-zip", "runStudy", "verifyStudySessionArtifacts"],
    artifacts: ["session.json", "analysis/quiz.json", "markdown/vibe-coding-start.md", "html/index.html"],
    safety: ["no analyzed project command execution", "secret-like .env excluded from generated session source snapshot"],
    sourceRetention: ["source snapshot still present after ZIP extraction"]
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
