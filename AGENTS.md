# AGENTS.md - RepoTutor Studio

## Scope

This file applies to the whole RepoTutor Studio repository.

## Product Contract

RepoTutor Studio is a TypeScript + Tauri + Codex-based developer learning app.
It teaches a user how a GitHub repository, local folder, SKILL.md folder, ZIP, or
CLI-Anything target is structured so the user can rebuild a similar project from
scratch.

## Non-Negotiable Requirements

- Keep Codex Skill mode, standalone Tauri mode, and headless CLI mode working.
- Keep one shared implementation in `packages/core`; do not fork behavior per UI.
- `apps/cli` and `apps/desktop-tauri` must call the same core pipeline.
- `packages/codex` is the only package allowed to directly integrate the Codex SDK.
- The Codex SDK must never run in the Tauri WebView.
- Every study session must write JSON, Markdown, Codex logs, and static HTML under
  `studies/YYYY-MM-DD/owner__repo__branch__commit8/`.
- Quiz generation, quiz attempts, wrong notes, and HTML refresh are required.
- Secret-looking files must be excluded from scan, copy, Codex prompts, and HTML.
- Do not execute arbitrary analyzed-project commands without explicit approval.

## Build And Test

- Install: `pnpm install`
- Build: `pnpm build`
- Test: `pnpm test`
- Type check: `pnpm typecheck`
- CLI smoke: `pnpm --filter @repotutor/cli dev -- doctor`
- Fixture study: `pnpm --filter @repotutor/cli dev -- study packages/core/tests/fixtures/simple-ts-app --mode quick --level beginner`

## Security Policy

- Default analysis is read-only static analysis.
- Allowed automatic external command for public GitHub intake: `git clone --depth 1`
  with sanitized URL/branch arguments.
- Never run `npm install`, `pnpm install`, `pip install`, `cargo run`, `make`,
  `docker`, `curl | sh`, or similar commands inside analyzed source without an
  approval log.
- Ignore `.git`, dependency directories, build outputs, binary/media files,
  `.env*`, keys, credentials, tokens, and secret-looking files.
- Do not send secret-looking content to Codex.

## Code Style

- Schema-first TypeScript using Zod.
- Keep beginner-facing copy Korean-first with English technical terms in
  parentheses where useful.
- Prefer small vertical slices and tests close to the behavior.
- Keep generated study outputs out of git except intentional examples.

## Git Policy

- Stage explicit paths only.
- Run `git status --short --branch`, `git remote -v`, and gitleaks before push.
- This project is intended to map 1:1 to a private `Veritas-7/RepoTutorStudio`
  GitHub repository.
