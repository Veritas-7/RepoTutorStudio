#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRepo = fs.mkdtempSync(path.join(os.tmpdir(), "repotutor-public-git-history-"));
const config = path.join(root, ".gitleaks.toml");

run("node", ["scripts/verify-public-sanitized-source.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    REPOTUTOR_PUBLIC_SNAPSHOT_DIR: publicRepo
  }
});
run("git", ["init"], { cwd: publicRepo });
run("git", ["add", "."], { cwd: publicRepo });
run("git", ["commit", "-m", "Sanitized RepoTutor Studio source snapshot"], {
  cwd: publicRepo,
  env: {
    ...process.env,
    GIT_AUTHOR_NAME: "RepoTutor Security Gate",
    GIT_AUTHOR_EMAIL: "repotutor-security@example.invalid",
    GIT_COMMITTER_NAME: "RepoTutor Security Gate",
    GIT_COMMITTER_EMAIL: "repotutor-security@example.invalid"
  }
});
run("gitleaks", ["detect", "--source", publicRepo, "--config", config, "--redact", "--no-banner"], { cwd: publicRepo });

console.log(JSON.stringify({
  ok: true,
  checked: {
    publicRepo,
    commands: [
      "REPOTUTOR_PUBLIC_SNAPSHOT_DIR=<tmp> node scripts/verify-public-sanitized-source.mjs",
      "git init && git add . && git commit -m <sanitized-source-snapshot>",
      "gitleaks detect --source <sanitized-git-repo> --config .gitleaks.toml --redact --no-banner"
    ]
  }
}, null, 2));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: options.env ?? process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stdout}${result.stderr}`);
  }
  return result;
}
