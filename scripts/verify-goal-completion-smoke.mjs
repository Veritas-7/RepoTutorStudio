#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requirements = [
  {
    id: "vibe-coding-learning-app",
    claim: "RepoTutor is framed as a vibe-coding learning app, not a syntax course.",
    evidence: [
      ["README.md", "vibe-coding education app", "AI-native build briefing", "not a traditional programming course", "prompt strategy", "verification boundaries"],
      ["docs/product/learning-mission.md", "RepoTutor Studio turns a GitHub repository or local source folder into an AI-native build briefing", "better AI product builder", "direct, constrain, and verify AI output"]
    ]
  },
  {
    id: "source-input-modes",
    claim: "The advertised source inputs are covered by deterministic verification.",
    evidence: [
      ["scripts/verify-source-intake-smoke.mjs", "GitHub URL", "local folder", "ZIP", "SKILL.md folder", "CLI-Anything target"],
      ["scripts/verify-github-study-smoke.mjs", "GitHub branch URL", "git clone --depth 1 --branch", "runStudy"],
      ["scripts/verify-zip-study-smoke.mjs", "ZIP path", "extract-zip", "verifyStudySessionArtifacts"],
      ["scripts/verify-source-mode-study-smoke.mjs", "SKILL.md folder", "CLI-Anything target", "no analyzed project command execution"]
    ]
  },
  {
    id: "cli-and-skill-entrypoint",
    claim: "The CLI and Codex Skill wrapper can invoke the same study workflow.",
    evidence: [
      ["scripts/verify-skill-output-smoke.mjs", "study", "resume", "open", "quiz"],
      ["scripts/verify-skill-wrapper-smoke.mjs", "skills/repo-tutor/scripts/repo-tutor-study.sh", ".agents/skills/repo-tutor/scripts/repo-tutor-study.sh", "PATH without repo-tutor", "REPOTUTOR_REPO_ROOT"],
      ["README.md", "Headless CLI", "Codex Skill", "pnpm verify:skill-wrapper"]
    ]
  },
  {
    id: "direct-app-entrypoint",
    claim: "The direct app path is covered from React invoke payloads through Tauri commands and bundled sidecar discovery.",
    evidence: [
      ["scripts/verify-desktop-tauri-commands-smoke.mjs", "study_source", "list_sessions", "resume_session", "source_prune_plan"],
      ["scripts/verify-desktop-bundled-sidecar-smoke.mjs", "RepoTutor Studio.app", "self-contained @repotutor workspace code", "codex/prompts.jsonl"],
      ["scripts/verify-desktop-bundled-rust-sidecar-smoke.mjs", "RepoTutor Studio.app", "tauri_commands_discover_app_resource_sidecar_without_env", "REPOTUTOR_SIDECAR unset"],
      ["apps/desktop-tauri/src/App.ui-smoke.tsx", "study_source", "resume_session", "submit_quiz", "source_prune_plan"]
    ]
  },
  {
    id: "learning-artifacts",
    claim: "A study session emits JSON, Markdown, HTML, quiz, and verification artifacts.",
    evidence: [
      ["docs/product/storage-model.md", "analysis/", "markdown/", "html/", "codex/", "session.json"],
      ["scripts/verify-skill-output-smoke.mjs", "html", "dailySummaryHtml", "teachingWorkspaceHtml", "verificationOk", "quizQuestions"],
      ["scripts/verify-github-study-smoke.mjs", "analysis/quiz.json", "html/index.html"],
      ["scripts/verify-entrypoints-smoke.mjs", "session verification"]
    ]
  },
  {
    id: "codex-default-fail-closed",
    claim: "AI-assisted study uses the Codex SDK path by default and records fail-closed evidence.",
    evidence: [
      ["README.md", "Codex SDK is the default AI study engine", "RepoTutor delegates to that local Codex auth cache", "codex/prompts.jsonl", "codex/events.jsonl"],
      ["scripts/verify-desktop-bundled-sidecar-smoke.mjs", "enableCodex: true", "codex/prompts.jsonl", "codex/events.jsonl", "success or fail-closed status"]
    ]
  },
  {
    id: "source-safety-and-retention",
    claim: "Source is kept as session evidence, secrets are excluded, target commands are not executed, and cleanup is token-gated.",
    evidence: [
      ["docs/product/storage-model.md", "generated per-session `source/` snapshot used as evidence", "DELETE-SOURCE-SNAPSHOT", "`READY_REVIEW` alone is a cleanup review candidate"],
      ["scripts/verify-github-study-smoke.mjs", "secret-like .env excluded", "source snapshot still present after GitHub clone"],
      ["scripts/verify-source-mode-study-smoke.mjs", "CLI-Anything harness script not invoked", "source snapshot still present"],
      ["scripts/verify-entrypoints-smoke.mjs", "source snapshot still present", "sourcePrunePlan dry-run", "apply requires DELETE-SOURCE-SNAPSHOT"]
    ]
  },
  {
    id: "single-entrypoint-parity-gate",
    claim: "The top-level verifier ties the user-facing entrypoints together.",
    evidence: [
      ["scripts/verify-entrypoints-smoke.mjs", "headless-cli", "codex-skill-wrapper", "desktop-tauri-commands", "desktop-bundled-rust-sidecar", "desktop-react-ui"],
      ["package.json", "verify:production", "verify:entrypoints", "verify:goal-completion"],
      ["scripts/verify-production.mjs", "quality-gate", "large-repo-study", "codesign-strict"],
      ["README.md", "pnpm verify:production", "pnpm verify:entrypoints", "pnpm verify:goal-completion"]
    ]
  },
  {
    id: "publication-security-boundary",
    claim: "Public GitHub publication is gated through sanitized source export while private history remains explicitly bounded.",
    evidence: [
      ["package.json", "verify:security-current-tree", "verify:public-sanitized", "verify:public-git-history", "verify:private-history-boundary"],
      ["scripts/verify-security-current-tree.mjs", "gitleaks dir . --config .gitleaks.toml", "generatedArtifactsExcludedByConfig"],
      ["scripts/verify-public-sanitized-source.mjs", "^working\\.md$", "gitleaks dir <sanitized-source>"],
      ["scripts/verify-public-git-history.mjs", "git init", "Sanitized RepoTutor Studio source snapshot", "gitleaks detect --source <sanitized-git-repo>"],
      ["scripts/verify-private-history-boundary.mjs", "knownPrivateHistoryLeaks", "working.md", "sourcegraph-access-token", "public GitHub must use sanitized source-only export"],
      ["docs/security/SECURITY_POLICY.md", "Public GitHub publication must use a sanitized source-only export", "verify:public-git-history", "private history boundary", "raw `gitleaks detect --source .` pass"]
    ]
  }
];

const results = requirements.map((requirement) => {
  const missing = [];
  for (const [file, ...needles] of requirement.evidence) {
    const text = readFile(file);
    for (const needle of needles) {
      if (!text.includes(needle)) missing.push(`${file}:${needle}`);
    }
  }
  return { ...requirement, ok: missing.length === 0, missing };
});

const ok = results.every((result) => result.ok);
const payload = {
  ok,
  checked: {
    promptRequirements: results.map(({ id, claim, ok }) => ({ id, claim, ok })),
    evidenceFiles: [...new Set(requirements.flatMap((item) => item.evidence.map(([file]) => file)))],
    verifierCommands: [
      "pnpm verify:source-intake",
      "pnpm verify:github-study",
      "pnpm verify:zip-study",
      "pnpm verify:source-mode-study",
      "pnpm verify:skill-output",
      "pnpm verify:skill-wrapper",
      "pnpm verify:desktop-tauri-commands",
      "pnpm verify:desktop-bundled-sidecar",
      "pnpm verify:desktop-bundled-rust-sidecar",
      "pnpm verify:desktop-ui",
      "pnpm verify:security-current-tree",
      "pnpm verify:public-sanitized",
      "pnpm verify:public-git-history",
      "pnpm verify:private-history-boundary",
      "pnpm verify:production",
      "pnpm verify:entrypoints"
    ]
  },
  results
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);

function readFile(file) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) throw new Error(`Missing required evidence file: ${file}`);
  return fs.readFileSync(filePath, "utf8");
}
