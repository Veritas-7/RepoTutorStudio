#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = path.join(root, ".gitleaks.toml");
const reportPath = path.join(os.tmpdir(), `repotutor-private-history-gitleaks-${Date.now()}.json`);

const scan = spawnSync("gitleaks", [
  "detect",
  "--source",
  root,
  "--config",
  config,
  "--redact",
  "--no-banner",
  "--report-format",
  "json",
  "--report-path",
  reportPath
], {
  cwd: root,
  encoding: "utf8"
});

const leaks = readLeaks(reportPath);
const unexpectedLeaks = leaks.filter((leak) => !isKnownPrivateWorkingLeak(leak));
if (unexpectedLeaks.length > 0 || (scan.status !== 0 && leaks.length === 0)) {
  const summary = unexpectedLeaks.slice(0, 20).map((leak) => ({
    rule: leak.RuleID,
    file: leak.File,
    startLine: leak.StartLine,
    commit: leak.Commit
  }));
  throw new Error(`private history scan found unexpected leak surfaces:\n${JSON.stringify(summary, null, 2)}\n${scan.stdout}${scan.stderr}`);
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    command: "gitleaks detect --source . --config .gitleaks.toml --redact --no-banner",
    rawHistoryClean: leaks.length === 0,
    knownPrivateHistoryLeaks: leaks.length,
    allowedPrivateHistoryBoundary: leaks.length > 0 ? {
      file: "working.md",
      rule: "sourcegraph-access-token",
      reason: "private working notes are preserved for NAS/private history; public GitHub must use sanitized source-only export"
    } : null,
    publicPublicationGate: "pnpm verify:public-sanitized"
  }
}, null, 2));

function readLeaks(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return JSON.parse(text);
}

function isKnownPrivateWorkingLeak(leak) {
  return leak?.File === "working.md" && leak?.RuleID === "sourcegraph-access-token";
}
