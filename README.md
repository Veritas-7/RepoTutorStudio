# RepoTutor Studio

RepoTutor Studio is a vibe-coding education app for repository study. It accepts
a GitHub URL, local source folder, ZIP, SKILL.md folder, or CLI-Anything target
and turns the source into an AI-native build briefing for learners who direct AI
instead of manually writing every line of code.

It is not a traditional programming course and it is not a language syntax
tutor. The goal is to help a vibe coder understand a real project's mission,
architecture, folder and file responsibilities, important terms, prompt
strategy, PRD/SDD/TDD/acceptance-criteria language when it is useful, and
verification boundaries so they can ask AI to recreate or extend similar
software with better judgment.

In short: source analysis should teach prompt strategy and help the learner
recreate or extend similar software with better judgment.

See [docs/product/learning-mission.md](docs/product/learning-mission.md) for the
product guardrails that keep this focused on vibe-coding education. See
[docs/product/storage-model.md](docs/product/storage-model.md) for the storage
policy that keeps source snapshots as session evidence instead of app-wide
embedded product knowledge.

## Modes

- Headless CLI: `repo-tutor study <source>` with Codex SDK enabled by default
- Codex Skill: `skills/repo-tutor/SKILL.md` calls the same CLI
- Tauri app: React + Tauri shell talks to a Node sidecar that calls the same core
  and always routes AI-assisted study through Codex SDK on the server side

## Codex Authentication

RepoTutor does not collect or store ChatGPT credentials. Codex SDK is the default AI study engine for `repo-tutor study` and the desktop app. The
implementation in `packages/codex` invokes `@openai/codex-sdk`, which controls
the local Codex runtime. Official Codex authentication supports `Sign in with ChatGPT` for subscription access and API key sign-in for usage-based access; the
Codex CLI defaults to ChatGPT sign-in when no valid session is available.
RepoTutor delegates to that local Codex auth cache and never asks the learner
for ChatGPT passwords, access tokens, or API keys. If the SDK cannot run because
of missing auth, setup, or usage limits, RepoTutor logs that failure under the
session `codex/` folder and continues with local read-only static analysis.

Use `--no-codex` only for deterministic offline verification when you
intentionally do not want the SDK attempt.

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
pnpm --filter @repotutor/cli dev -- doctor
pnpm --filter @repotutor/cli dev -- study packages/core/tests/fixtures/simple-ts-app --mode quick --level beginner
```

Study sessions are written under `studies/YYYY-MM-DD/<source-id>/`.
Each session also writes a stateful teaching workspace: `MISSION.md`,
`RESOURCES.md`, `NOTES.md`, narrow `lessons/`, reusable `reference/`, and
evidence-based `learning-records/` created only after quiz or review events.

## Repository Layout

- `apps/cli`: `repo-tutor` command line interface
- `apps/desktop-tauri`: standalone Tauri app and Node sidecar bridge
- `packages/core`: shared intake, scan, lesson, quiz, wrong-note, and storage pipeline
- `packages/codex`: required Codex SDK wrapper and structured-output logging
- `packages/html`: offline static HTML renderer
- `packages/shared`: schemas, constants, and path/security utilities
- `DESIGN.md`: Korean-first desktop workbench design contract
- `skills/repo-tutor`: Codex Skill distribution
- `.agents/skills/repo-tutor`: installable agent skill mirror
- `adapters/cli-anything`: optional CLI-Anything inspection adapter
- `docs/security`: product security policy
- `docs/product/storage-model.md`: DB, session artifact, and source-retention
  policy
- `docs/research/vibe-coding-best-practices.md`: external GitHub and AI-coding
  research mapped into RepoTutor learner artifacts
- `research`: temporary external project research and source-code analysis
  evidence; external repositories should not be embedded as permanent product
  knowledge

## Current Scope

The MVP implements static analysis, vibe-coding lessons, prompt-ready rebuild
guidance, quiz generation, wrong-note updates, a daily learning-summary HTML
recap, a `/teach`-style stateful teaching workspace, HTML export, CLI
operation, Codex Skill handoff, and a Tauri UI/sidecar bridge skeleton. Codex
SDK calls are enabled by default, isolated to `packages/codex`, and logged
fail-closed when local Codex auth, setup, or usage limits prevent a successful
AI turn.
