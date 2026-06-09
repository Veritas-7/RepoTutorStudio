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

- Headless CLI: `repo-tutor study <source>` with optional `--enable-codex`
- Codex Skill: `skills/repo-tutor/SKILL.md` calls the same CLI
- Tauri app: React + Tauri shell talks to a Node sidecar that calls the same core
  and can toggle optional Codex SDK assistance

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
pnpm --filter @repotutor/cli dev -- doctor
pnpm --filter @repotutor/cli dev -- study packages/core/tests/fixtures/simple-ts-app --mode quick --level beginner
pnpm --filter @repotutor/cli dev -- study packages/core/tests/fixtures/simple-ts-app --mode quick --level beginner --enable-codex
```

Study sessions are written under `studies/YYYY-MM-DD/<source-id>/`.

## Repository Layout

- `apps/cli`: `repo-tutor` command line interface
- `apps/desktop-tauri`: standalone Tauri app and Node sidecar bridge
- `packages/core`: shared intake, scan, lesson, quiz, wrong-note, and storage pipeline
- `packages/codex`: optional Codex SDK wrapper and structured-output logging
- `packages/html`: offline static HTML renderer
- `packages/shared`: schemas, constants, and path/security utilities
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
recap, HTML export, CLI operation, Codex Skill handoff, and a Tauri UI/sidecar
bridge skeleton. Codex SDK calls are optional, isolated to `packages/codex`, and
fail closed when credentials or package setup are missing.
