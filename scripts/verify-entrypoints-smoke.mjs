#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const checks = [
  {
    label: "source-intake-modes",
    commandText: "node scripts/verify-source-intake-smoke.mjs",
    command: "node",
    args: ["scripts/verify-source-intake-smoke.mjs"],
    covers: ["GitHub URL", "local folder", "ZIP", "SKILL.md folder", "CLI-Anything target"]
  },
  {
    label: "github-study",
    commandText: "node scripts/verify-github-study-smoke.mjs",
    command: "node",
    args: ["scripts/verify-github-study-smoke.mjs"],
    covers: ["GitHub branch URL", "git clone --depth 1 --branch", "runStudy", "session verification"]
  },
  {
    label: "zip-study",
    commandText: "node scripts/verify-zip-study-smoke.mjs",
    command: "node",
    args: ["scripts/verify-zip-study-smoke.mjs"],
    covers: ["ZIP path", "extract-zip", "runStudy", "session verification", "source snapshot still present"]
  },
  {
    label: "source-mode-study",
    commandText: "node scripts/verify-source-mode-study-smoke.mjs",
    command: "node",
    args: ["scripts/verify-source-mode-study-smoke.mjs"],
    covers: ["SKILL.md folder study", "CLI-Anything target study", "runStudy", "no target command execution"]
  },
  {
    label: "headless-cli",
    commandText: "node scripts/verify-skill-output-smoke.mjs",
    command: "node",
    args: ["scripts/verify-skill-output-smoke.mjs"],
    covers: ["study", "resume", "open", "quiz"]
  },
  {
    label: "pruned-session-full-flow",
    commandText: "node scripts/verify-pruned-session-full-flow.mjs",
    command: "node",
    args: ["scripts/verify-pruned-session-full-flow.mjs"],
    covers: ["doctor", "study", "resume", "evidence", "export", "verify-*", "list", "open", "quiz", "prune-source apply", "post-prune resume/export/verification"]
  },
  {
    label: "codex-skill-wrapper",
    commandText: "node scripts/verify-skill-wrapper-smoke.mjs",
    command: "node",
    args: ["scripts/verify-skill-wrapper-smoke.mjs"],
    covers: ["source-skill wrapper", "agent-skill mirror", "fallback without global repo-tutor"]
  },
  {
    label: "desktop-sidecar",
    commandText: "node scripts/verify-desktop-sidecar-smoke.mjs",
    command: "node",
    args: ["scripts/verify-desktop-sidecar-smoke.mjs"],
    covers: ["compiled Node sidecar", "study", "list", "resume", "quiz", "sourcePrunePlan"]
  },
  {
    label: "desktop-tauri-commands",
    commandText: "node scripts/verify-desktop-tauri-commands-smoke.mjs",
    command: "node",
    args: ["scripts/verify-desktop-tauri-commands-smoke.mjs"],
    covers: ["Tauri command handlers", "REPOTUTOR_SIDECAR", "REPOTUTOR_STUDIES_ROOT"]
  },
  {
    label: "desktop-sidecar-discovery",
    commandText: "node scripts/verify-desktop-sidecar-discovery-smoke.mjs",
    command: "node",
    args: ["scripts/verify-desktop-sidecar-discovery-smoke.mjs"],
    covers: ["Tauri command handlers", "default sidecar discovery", "REPOTUTOR_SIDECAR unset"]
  },
  {
    label: "desktop-app-build",
    commandText: "node scripts/verify-desktop-app-build-smoke.mjs",
    command: "node",
    args: ["scripts/verify-desktop-app-build-smoke.mjs"],
    covers: ["Tauri no-bundle release build", "beforeBuildCommand", "frontendDist", "release binary"]
  },
  {
    label: "desktop-bundled-sidecar",
    commandText: "node scripts/verify-desktop-bundled-sidecar-smoke.mjs",
    command: "node",
    args: ["scripts/verify-desktop-bundled-sidecar-smoke.mjs"],
    covers: ["Tauri app bundle", "bundled sidecar resource", "self-contained Node sidecar", "Codex-enabled fail-closed path"]
  },
  {
    label: "desktop-bundled-rust-sidecar",
    commandText: "node scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs",
    command: "node",
    args: ["scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs"],
    covers: ["Tauri app bundle", "Rust command handlers", "bundled app resource sidecar", "REPOTUTOR_SIDECAR unset"]
  },
  {
    label: "desktop-react-ui",
    commandText: "pnpm --filter @repotutor/desktop-tauri exec tsx src/App.ui-smoke.tsx",
    command: "pnpm",
    args: ["--filter", "@repotutor/desktop-tauri", "exec", "tsx", "src/App.ui-smoke.tsx"],
    covers: ["React invoke flow", "study_source", "resume_session", "quiz", "source retention panel"]
  },
  {
    label: "goal-completion-map",
    commandText: "node scripts/verify-goal-completion-smoke.mjs",
    command: "node",
    args: ["scripts/verify-goal-completion-smoke.mjs"],
    covers: ["prompt requirement map", "CLI skill invocation", "direct app use", "vibe-coding learning artifacts"]
  }
];

const results = checks.map((check) => {
  const output = run(check.command, check.args);
  const payload = parseJsonOutput(check.label, output);
  if (payload.ok !== true) throw new Error(`${check.label} did not report ok: true`);
  return {
    label: check.label,
    command: check.commandText,
    covers: check.covers,
    evidence: payload.checked ?? {},
    sessionId: payload.sessionId ?? null,
    sessionRoot: payload.sessionRoot ?? null,
    studiesRoot: payload.studiesRoot ?? null
  };
});

console.log(JSON.stringify({
  ok: true,
  checked: {
    objective: [
      "headless CLI can run the shared study workflow",
      "source intake can classify GitHub URL, local folder, ZIP, SKILL.md folder, and CLI-Anything target inputs",
      "GitHub branch URL input can clone with safe shallow branch arguments and produce a complete study session",
      "ZIP source input can produce a complete study session after extraction",
      "SKILL.md and CLI-Anything source inputs can produce complete study sessions without executing target commands",
      "Codex Skill wrappers can invoke the CLI without a global repo-tutor binary",
      "desktop app direct path can drive the compiled sidecar through Tauri commands",
      "desktop app direct path can discover the compiled sidecar without REPOTUTOR_SIDECAR",
      "desktop app release build can be produced without installer bundling",
      "desktop app bundle contains and can run the self-contained sidecar resource",
      "desktop app bundle logs the default Codex-enabled SDK attempt while still completing the study",
      "desktop app bundle discovers the bundled resource sidecar through Rust commands without REPOTUTOR_SIDECAR",
      "desktop React UI can consume the same command payloads",
      "all public CLI commands pass in one generated session before and after token-gated source snapshot pruning",
      "generated source snapshots remain present unless an explicit prune token is used",
      "prompt requirements map to concrete CLI skill and direct app verification artifacts"
    ],
    entrypoints: results.map((result) => result.label),
    commands: results.map((result) => result.command),
    sourceRetention: [
      "source snapshot still present",
      "sourcePrunePlan dry-run",
      "apply requires DELETE-SOURCE-SNAPSHOT",
      "post-prune verify-evidence and verify-session stay tombstone-aware"
    ]
  },
  results
}, null, 2));

function run(command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: root },
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function parseJsonOutput(label, output) {
  const trimmed = output.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    throw new Error(`Failed to parse ${label} JSON output: ${error.message}\n${trimmed.slice(-2000)}`);
  }
}
