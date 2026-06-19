<!-- VERITAS_EDU_NOTICE_START -->
> [!IMPORTANT]
> **Educational / Work-in-Progress Notice**
>
> 이 소스는 교육 목적의 애플리케이션이며, 아직 지속적으로 개발 중인 미완성 앱입니다. 자유롭게 사용, 학습, fork, 수정, 배포할 수 있습니다.
>
> This source code is for an educational-purpose application and remains an unfinished work in progress. You may freely use, study, fork, modify, and distribute it.
>
> Provided "as is", without warranty. Third-party open-source components remain under their original licenses. See [LICENSE](./LICENSE), [NOTICE.md](./NOTICE.md), and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

<!-- VERITAS_EDU_NOTICE_END -->

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
recreate or extend similar software with better judgment. The source is not
embedded because AI lacks general development knowledge; it is kept temporarily
as project-specific evidence so the learner can understand this app's purpose,
architecture choices, terms, prompts, verification questions, and cleanup
decision.

Source intake is therefore not AI training data. It is a learner briefing
process: take a real repository, extract the product intent, responsibility
map, architecture reasons, context terms, prompt skeletons, and review criteria,
then teach the learner how to give those to AI without memorizing syntax.

See [docs/product/learning-mission.md](docs/product/learning-mission.md) for the
product guardrails that keep this focused on vibe-coding education. See
[docs/product/storage-model.md](docs/product/storage-model.md) for the storage
policy that keeps generated session `source/` snapshots as session evidence
instead of app-wide embedded product knowledge.

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
The packaged desktop smoke `pnpm verify:desktop-bundled-sidecar` also exercises
this default Codex-enabled path through the `.app` sidecar resource and asserts
that `codex/prompts.jsonl` plus `codex/events.jsonl` are written while the study
session still completes.
`pnpm verify:desktop-bundled-rust-sidecar` then proves the Rust command handlers
can discover that bundled `.app/Contents/Resources/.../bridge.js` sidecar with
`REPOTUTOR_SIDECAR` unset and run study/list/resume through the app resource.

Use `--no-codex` only for deterministic offline verification when you
intentionally do not want the SDK attempt.

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
pnpm --filter @repotutor/cli dev -- doctor
pnpm verify:source-intake
pnpm verify:github-study
pnpm verify:zip-study
pnpm verify:source-mode-study
pnpm verify:skill-output
pnpm verify:skill-wrapper
pnpm verify:desktop-sidecar
pnpm verify:desktop-rust-sidecar
pnpm verify:desktop-tauri-commands
pnpm verify:desktop-sidecar-discovery
pnpm verify:desktop-bundled-sidecar
pnpm verify:desktop-bundled-rust-sidecar
pnpm verify:desktop-runtime-bundle
node scripts/verify-desktop-signing.mjs --sign
pnpm verify:desktop-signing
pnpm verify:desktop-ui
pnpm verify:desktop-app-build
pnpm verify:entrypoints
pnpm verify:goal-completion
pnpm verify:security-current-tree
pnpm verify:public-sanitized
pnpm verify:public-git-history
pnpm verify:private-history-boundary
pnpm install:local
pnpm verify:local-install
pnpm --filter @repotutor/cli dev -- study packages/core/tests/fixtures/simple-ts-app --mode quick --level beginner
pnpm --filter @repotutor/cli dev -- study packages/core/tests/fixtures/simple-ts-app --learner-brief path/to/brief.md --mode quick --level beginner
pnpm --filter @repotutor/cli dev -- prune-source <session-id-or-path> --format markdown
# READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission. Use apply only after the preserved evidence bundle,
# session verification, verification records, explicit learner confirmation that source links no longer need to open
# for the current learning goal, and the explicit confirmation token:
pnpm --filter @repotutor/cli dev -- prune-source <session-id-or-path> --apply --confirm DELETE-SOURCE-SNAPSHOT
pnpm --filter @repotutor/cli dev -- verify-session <session-id-or-path> --format json
```

Study sessions are written under `studies/YYYY-MM-DD/<source-id>/`.
Each session also writes a stateful teaching workspace: `MISSION.md`,
`RESOURCES.md`, `NOTES.md`, narrow `lessons/`, reusable `reference/` pages such
as `learner-role-contract.html`, `ai-output-review-rubric.html`,
`vibe-coding-mastery-checklist.html`,
`vibe-coding-implementation-brief.html`,
`architecture-principle-playbook.html`,
`source-to-build-interview.html`,
`similar-app-transfer-map.html`,
`learner-goal-alignment.html`,
`ai-implementation-loop.html`,
`ai-prompt-readiness-checklist.html`, `ai-prompt-ab-lab.html`,
`source-absorption-ledger.html`, and
`source-retention-guide.html`, and
evidence-based `learning-records/` created only after quiz or review events.
The CLI `study` and `resume` outputs expose `teachingWorkspaceHtml`, and quiz
submissions expose `learningRecord` when an evidence record is written.
`--learner-brief` can import a learner's current PRD, issue, or AI prompt so
RepoTutor can compare that intent against source-backed purpose, architecture,
source evidence, acceptance criteria, and verification boundaries.
Desktop learner brief input now exposes the same source-grounded goal alignment
without making the learner create a separate file. This is for a vibe-coding
learner who wants to brief, steer, and review AI, not a traditional development
lesson or syntax drill.
This is not a traditional development lesson; it is a source-grounded prompt
and verification guide for vibe-coding.
After explicit source cleanup, `verify-session` is tombstone-aware: sessions
with `analysis/source-prune-applied.json` and `SOURCE-PRUNED.md` remain
verifiable even though their intentionally pruned generated session `source/`
snapshots are gone.
The Desktop UI exposes the same desktop retention controls through a source
retention panel: check the session prune plan, verify the preserved evidence
bundle, session verification, and verification records, require explicit
learner confirmation that source links no longer need to open for the current
learning goal, treat `READY_REVIEW` as a review candidate rather than final
ACCEPT, deployment, or cleanup permission, require the `DELETE-SOURCE-SNAPSHOT`
token, and delete only the generated session `source/` snapshot.

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
recap, source absorption and source-retention references, a `/teach`-style
stateful teaching workspace, an AI output review rubric, a vibe-coding mastery
checklist, an architecture principle playbook for purpose and responsibility
judgment, a source-to-build interview for self-explanation before AI handoff,
a similar-app transfer map for deciding what to keep, adapt, ask AI, and verify,
a one-page implementation brief for the first AI-built vertical
slice, an AI implementation loop for reviewing AI results and narrowing the
next question, an AI prompt readiness checklist before sending implementation prompts,
an AI prompt A/B lab for comparing vague requests against source-grounded
prompts, a dry-run source prune plan, HTML export, CLI operation, Codex Skill handoff, and a
Tauri UI/sidecar bridge skeleton. Codex SDK calls are enabled by default,
isolated to `packages/codex`, and logged fail-closed when local Codex auth,
setup, or usage limits prevent a successful AI turn.
