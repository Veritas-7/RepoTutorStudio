#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

run("pnpm", ["exec", "vitest", "run", "packages/core/src/intake.test.ts"]);

console.log(JSON.stringify({
  ok: true,
  checked: {
    parser: ["parseSource"],
    inputModes: ["GitHub URL", "local folder", "ZIP", "SKILL.md folder", "CLI-Anything target"],
    sourceTypes: ["github", "local", "zip", "skill", "cli-anything"],
    safety: ["no target code execution", "unsupported input rejects"],
    fixtures: ["temporary local folder", "temporary zip path", "temporary SKILL.md folder", "temporary agent-harness folder"]
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
