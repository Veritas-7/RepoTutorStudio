#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const gates = [
  ["typecheck", "pnpm", ["typecheck"]],
  ["test", "pnpm", ["test"]],
  ["build", "pnpm", ["build"]],
  ["quality-gate", "quality-gate", ["check", "--check-only", "-p", "js-essential", "-f", "json", "."]],
  ["pruned-session-full-flow", "pnpm", ["verify:pruned-session-full-flow"]],
  ["goal-completion", "pnpm", ["verify:goal-completion"]],
  ["entrypoints", "pnpm", ["verify:entrypoints"]],
  ["local-install", "pnpm", ["verify:local-install"]],
  ["desktop-runtime-bundle", "pnpm", ["verify:desktop-runtime-bundle"]],
  ["security-current-tree", "pnpm", ["verify:security-current-tree"]],
  ["public-sanitized", "pnpm", ["verify:public-sanitized"]],
  ["public-git-history", "pnpm", ["verify:public-git-history"]],
  ["private-history-boundary", "pnpm", ["verify:private-history-boundary"]],
  ["fixture-benchmark", "pnpm", ["bench:scanner"]],
  ["large-repo-study", "pnpm", ["verify:large-repo-study"]],
  ["desktop-signing", "pnpm", ["verify:desktop-signing"]],
  ["codesign-strict", "codesign", ["--verify", "--deep", "--strict", "apps/desktop-tauri/src-tauri/target/release/bundle/macos/RepoTutor Studio.app"]]
];

const results = [];

for (const [id, command, args] of gates) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const durationMs = Date.now() - started;
  results.push({
    id,
    command: [command, ...args].join(" "),
    ok: result.status === 0,
    exitCode: result.status,
    durationMs,
    stdoutTail: tail(result.stdout),
    stderrTail: tail(result.stderr)
  });
  if (result.status !== 0) {
    console.log(JSON.stringify({ ok: false, failedGate: id, results }, null, 2));
    process.exit(result.status ?? 1);
  }
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    gates: results.map(({ id, command, durationMs }) => ({ id, command, durationMs })),
    signingOrder: "desktop signing and direct codesign run after build and entrypoint smoke gates"
  }
}, null, 2));

function tail(text) {
  return (text ?? "").slice(-4_000);
}
