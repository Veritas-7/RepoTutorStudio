import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readFlag(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`--${name} requires a value.`);
  return value;
}

function readNumberFlag(name, fallback) {
  const value = readFlag(name, String(fallback));
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`--${name} must be a positive number.`);
  return parsed;
}

const label = readFlag("label", "fixture-quick-study");
const source = readFlag("source", "packages/core/tests/fixtures/simple-ts-app");
const mode = readFlag("mode", "quick");
const level = readFlag("level", "beginner");
const maxMs = readNumberFlag("max-ms", 30_000);
const maxRssMb = readNumberFlag("max-rss-mb", 512);
const studiesRoot = fs.mkdtempSync(path.join(os.tmpdir(), `repotutor-benchmark-${label.replace(/[^a-z0-9_-]/gi, "-")}-`));
const cliEntrypoint = path.join(root, "apps/cli/dist/index.js");

if (!fs.existsSync(cliEntrypoint)) {
  throw new Error("CLI build output is missing. Run `pnpm build` before benchmark gates.");
}

const child = spawn(process.execPath, [
  cliEntrypoint,
  "study",
  source,
  "--mode",
  mode,
  "--level",
  level,
  "--no-codex",
  "--studies-root",
  studiesRoot
], {
  cwd: root,
  env: {
    ...process.env,
    REPOTUTOR_STUDIES_ROOT: studiesRoot
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let stdout = "";
let stderr = "";
let peakRssKb = 0;
const started = performance.now();
const sampler = setInterval(() => {
  if (!child.pid) return;
  const rssKb = processTreeRssKb(child.pid);
  if (Number.isFinite(rssKb)) peakRssKb = Math.max(peakRssKb, rssKb);
}, 250);

child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  stdout += chunk;
});
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});

const exitCode = await new Promise((resolve) => {
  child.on("close", resolve);
});
clearInterval(sampler);

const durationMs = Math.round(performance.now() - started);
const peakRssMb = Math.round((peakRssKb / 1024) * 10) / 10;
let payload = null;
try {
  payload = JSON.parse(stdout);
} catch {
  payload = null;
}

const ok = exitCode === 0 && durationMs <= maxMs && peakRssMb <= maxRssMb;
const result = {
  ok,
  label,
  source,
  mode,
  level,
  durationMs,
  maxMs,
  peakRssMb,
  maxRssMb,
  studiesRoot,
  sessionId: payload?.sessionId ?? null,
  sessionPath: payload?.path ?? null,
  exitCode,
  stderrTail: stderr.slice(-2_000)
};

console.log(JSON.stringify(result, null, 2));
if (!ok) process.exit(1);

function processTreeRssKb(rootPid) {
  const result = spawnSync("ps", ["-axo", "pid=,ppid=,rss="], { encoding: "utf8" });
  if (result.status !== 0) return Number.NaN;
  const rows = result.stdout
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const [pidText, ppidText, rssText] = line.trim().split(/\s+/);
      return {
        pid: Number(pidText),
        ppid: Number(ppidText),
        rss: Number(rssText)
      };
    })
    .filter((row) => Number.isFinite(row.pid) && Number.isFinite(row.ppid) && Number.isFinite(row.rss));
  const childrenByParent = new Map();
  for (const row of rows) {
    const children = childrenByParent.get(row.ppid) ?? [];
    children.push(row);
    childrenByParent.set(row.ppid, children);
  }
  const pending = [rootPid];
  const pids = new Set();
  while (pending.length > 0) {
    const pid = pending.pop();
    if (!pid || pids.has(pid)) continue;
    pids.add(pid);
    for (const childRow of childrenByParent.get(pid) ?? []) {
      pending.push(childRow.pid);
    }
  }
  return rows
    .filter((row) => pids.has(row.pid))
    .reduce((total, row) => total + row.rss, 0);
}
