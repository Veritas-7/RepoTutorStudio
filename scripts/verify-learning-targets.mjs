#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharedDistPath = path.join(root, "packages", "shared", "dist", "report-targets.js");
const cliSourcePath = path.join(root, "apps", "cli", "src", "index.ts");
const desktopSourcePath = path.join(root, "apps", "desktop-tauri", "src", "App.tsx");

const failures = [];

if (!fs.existsSync(sharedDistPath)) {
  fail("shared-report-targets-dist-missing", `${path.relative(root, sharedDistPath)} is missing. Run pnpm --filter @repotutor/shared build first.`);
} else {
  const { CORE_LEARNING_REPORT_TARGETS } = await import(pathToFileURL(sharedDistPath).href);
  const cliSource = readText(cliSourcePath);
  const desktopSource = readText(desktopSourcePath);
  const targets = Array.isArray(CORE_LEARNING_REPORT_TARGETS) ? CORE_LEARNING_REPORT_TARGETS : [];

  if (targets.length === 0) {
    fail("core-targets-empty", "CORE_LEARNING_REPORT_TARGETS must not be empty.");
  }

  assertNoDuplicates("target", targets.map((target) => target.target));
  assertNoDuplicates("fileName", targets.map((target) => target.fileName));

  for (const target of targets) {
    if (!target.target || !target.fileName || !target.title || !target.description || !target.terminalCommand) {
      fail("core-target-field-missing", `Incomplete learning target: ${JSON.stringify(target)}`);
      continue;
    }

    const expectedCommand = `repo-tutor open <session> --target ${target.target}`;
    if (target.terminalCommand !== expectedCommand) {
      fail("core-target-command-mismatch", `${target.target} terminalCommand must be ${expectedCommand}`);
    }

    const cliEntryPattern = new RegExp(`\\{\\s*target:\\s*["']${escapeRegExp(target.target)}["']\\s*,\\s*fileName:\\s*["']${escapeRegExp(target.fileName)}["']\\s*\\}`);
    if (!cliEntryPattern.test(cliSource)) {
      fail("cli-open-target-missing", `apps/cli/src/index.ts openTargetEntries() is missing ${target.target} -> ${target.fileName}`);
    }
  }

  const desktopRequired = [
    "import { CORE_LEARNING_REPORT_TARGETS } from \"@repotutor/shared/report-targets\"",
    "CORE_LEARNING_REPORT_TARGETS.map",
    "target.terminalCommand.replace",
    "Learning Targets",
    "target-grid",
    "report-preview",
    "<dt>terminal</dt>"
  ];
  for (const token of desktopRequired) {
    if (!desktopSource.includes(token)) {
      fail("desktop-learning-target-surface-missing", `apps/desktop-tauri/src/App.tsx is missing ${token}`);
    }
  }

  if (failures.length === 0) {
    console.log(JSON.stringify({
      ok: true,
      targets: targets.length,
      checked: {
        shared: path.relative(root, sharedDistPath),
        cli: path.relative(root, cliSourcePath),
        desktop: path.relative(root, desktopSourcePath)
      }
    }, null, 2));
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) {
    fail("source-file-missing", `${path.relative(root, filePath)} is missing.`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function fail(code, message) {
  failures.push({ code, message });
}

function assertNoDuplicates(label, values) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      fail("core-target-duplicate", `Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
