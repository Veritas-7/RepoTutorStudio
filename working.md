# RepoTutor Studio Working Log

## Objective

Build RepoTutor Studio from `DEVELOPMENT_BRIEF.txt` without omitting required
features, keep the project under `/Users/wj/Ai/System/10_Projects`, map it 1:1
to a private repository, and preserve resumable state in this file.

## Success Criteria From User Request

- Project folder exists under `/Users/wj/Ai/System/10_Projects`.
- Development brief is copied into the project folder.
- `working.md` tracks state so work can resume any time.
- Project is mapped 1:1 to a private repository.
- App follows the brief without omitted required features.
- After development, run 13 compliance checks against the brief.
- After development, use `$autoresearch` style external GitHub research, place
  comparable project source under `research/`, analyze it, and keep upgrading
  until stopped.

## Current State

- 2026-06-04: Created project root and initialized a new git repository.
- 2026-06-04: Copied the source brief to `DEVELOPMENT_BRIEF.txt`.
- 2026-06-04: Started walking-skeleton implementation.
- 2026-06-04: Added pnpm workspace, shared schemas, core static analyzer,
  session storage, SQLite index fallback, quiz/wrong-note engine, HTML renderer,
  CLI, Codex Skill folders, optional CLI-Anything adapter, Tauri UI, Rust
  commands, Node sidecar bridge, fixture repos, and initial tests.
- 2026-06-04: Verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm --filter @repotutor/cli dev -- doctor`
  - `pnpm --filter @repotutor/cli dev -- study /Users/wj/Ai/System/10_Projects/RepoTutorStudio/packages/core/tests/fixtures/simple-ts-app --mode quick --level beginner`
  - `pnpm --filter @repotutor/cli dev -- quiz <generated-session-path> --answers /tmp/repotutor-answers.json`
  - `cargo check` in `apps/desktop-tauri/src-tauri`
- 2026-06-04: Created private GitHub repo
  `https://github.com/Veritas-7/RepoTutorStudio`, verified `PRIVATE`, committed
  and pushed initial implementation at `e47698a`.
- 2026-06-04: Ran external GitHub research with `$autoresearch` workflow:
  cloned `CodeBoarding/CodeBoarding` and `google/html-quiz` under
  `research/external-src/`, wrote analysis under `research/analysis/`, and
  applied the CodeBoarding-inspired learning coverage report upgrade plus the
  google/html-quiz-inspired offline quiz interaction upgrade.
- 2026-06-04: Applied a third AutoResearch upgrade: persisted Tauri quiz
  attempts. Tauri now loads `analysis/quiz.json`, renders A/B/C/D choices, and
  submits answers through `repo-tutor quiz`, preserving shared core attempt and
  wrong-note behavior.
- 2026-06-04: Applied a fourth AutoResearch upgrade: source-backed component
  graph. RepoTutor now emits `analysis/component-graph-report.json`,
  `markdown/component-graph.md`, and `html/component-graph.html`, linking folders,
  files, glossary terms, and rebuild-roadmap steps.
- 2026-06-04: Applied a fifth AutoResearch upgrade: incremental re-analysis.
  RepoTutor now emits `analysis/source-snapshot-report.json`,
  `analysis/incremental-report.json`, `markdown/incremental.md`, and
  `html/incremental.html`, comparing each completed same-repo session against
  the previous source snapshot by file hash and size.
- 2026-06-04: Applied a sixth AutoResearch upgrade: coverage delta summaries
  across repeated sessions. `incremental-report.json`, `incremental.md`, and
  `incremental.html` now show previous/current coverage ratio, ratio delta, and
  covered important file deltas when the previous same-repo session has
  `coverage-report.json`.
- 2026-06-04: Applied a seventh AutoResearch upgrade: component graph filters
  for large repositories. `component-graph.html` now renders node-type filter
  controls for root, folder, file, term, and rebuild-step nodes; `assets/app.js`
  applies graph filters together with the global search filter.
- 2026-06-04: Applied an eighth AutoResearch upgrade: richer large-repo graph
  summaries. `component-graph-report.json` now stores total node/edge counts,
  `nodeTypeCounts`, `edgeLabelCounts`, `topConnectedNodes`, and
  `largeRepoAdvice`; `component-graph.md` and `component-graph.html` render the
  summary before the detailed graph.
- 2026-06-04: Post-upgrade verification passed:
  - `pnpm build`
  - `pnpm test`
  - `cargo check` in `apps/desktop-tauri/src-tauri`
  - staged `gitleaks protect --staged --no-banner --redact` before each push
  - fixture study generated `analysis/coverage-report.json`,
    `markdown/coverage.md`, `html/coverage.html`, interactive `html/quiz.html`,
    component graph artifacts, source snapshot artifacts, and incremental
    re-analysis artifacts
  - second fixture study generated a non-null incremental baseline:
    `studies/2026-06-04/local__simple-ts-app__main__a30cec65-2/analysis/incremental-report.json`
  - temp CLI delta smoke generated coverageRatioDelta `0.19999999999999996`
    with summary `80.0%에서 100.0%로 20.0%p`
  - temp CLI graph-filter smoke generated `component-graph.html` with
    `data-graph-filter`, `data-node-type`, `graph-filter-toolbar`, and
    `component-node-cards`
  - temp CLI graph-summary smoke generated 23 nodes, 22 edges, node type counts,
    and top hub `README.md` with degree 8
  - `pnpm audit:brief` produced 13/13 PASS
  - full-dir gitleaks can flag ignored Cargo `target/` artifacts after
    `cargo check`; those artifacts are not tracked or staged.
- 2026-06-04: Pushed AutoResearch upgrades:
  - `dc34c88` coverage report upgrade
  - `e7ac6c5` offline quiz review mode
  - `15d0897` Tauri quiz attempt flow
  - `a30cec6` source-backed component graph
  - `6e56360` incremental re-analysis reports
  - `6aeb168` coverage delta summaries
  - `28f1bc5` component graph filters

## Next Actions

1. Continue next AutoResearch upgrade candidate unless the user stops:
   export usability polish.
