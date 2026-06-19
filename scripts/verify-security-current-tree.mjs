#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = path.join(root, ".gitleaks.toml");

const scan = spawnSync("gitleaks", ["dir", root, "--config", config, "--redact", "--no-banner"], {
  cwd: root,
  encoding: "utf8",
});

if (scan.status !== 0) {
  throw new Error(`current tree gitleaks scan failed:\n${scan.stdout}${scan.stderr}`);
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    command: "gitleaks dir . --config .gitleaks.toml --redact --no-banner",
    generatedArtifactsExcludedByConfig: [
      "node_modules/",
      "dist/",
      "target/",
      "apps/desktop-tauri/sidecar-dist/",
      "docs/audits/generated/",
      "studies/",
      "apps/cli/studies/"
    ]
  }
}, null, 2));
