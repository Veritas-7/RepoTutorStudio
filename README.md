# RepoTutor Studio

RepoTutor Studio is a developer learning app for repository study. It accepts a
GitHub URL, local folder, ZIP, SKILL.md folder, or CLI-Anything target and creates
a beginner-friendly Korean learning report with quizzes, wrong notes, and static
HTML exports.

## Modes

- Headless CLI: `repo-tutor study <source>`
- Codex Skill: `skills/repo-tutor/SKILL.md` calls the same CLI
- Tauri app: React + Tauri shell talks to a Node sidecar that calls the same core

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
pnpm --filter @repotutor/cli dev -- doctor
pnpm --filter @repotutor/cli dev -- study packages/core/tests/fixtures/simple-ts-app --mode quick --level beginner
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
- `research`: external project research and source-code analysis

## Current Scope

The MVP implements static analysis, deterministic beginner lessons, quiz
generation, wrong-note updates, HTML export, CLI operation, Codex Skill handoff,
and a Tauri UI/sidecar bridge skeleton. Codex SDK calls are isolated to
`packages/codex` and fail closed when credentials or package setup are missing.
