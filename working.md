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
- 2026-06-04: Applied a ninth AutoResearch upgrade: portable HTML export
  usability. The HTML export folder now includes `manifest.json` and
  `EXPORT-README.md`; CLI `repo-tutor export --format html` returns readme,
  manifest, page/asset counts, and entrypoint paths.
- 2026-06-04: Applied a tenth AutoResearch upgrade: zipped portable HTML
  bundle export. CLI `repo-tutor export --format zip` now regenerates the
  portable HTML folder and writes `exports/html-report.zip` with the HTML
  pages, manifest, README, and assets in one dependency-free ZIP bundle.
- 2026-06-04: Applied an eleventh AutoResearch upgrade: relative local-path
  intake for filtered CLI dev runs. `runStudy` accepts `sourceBaseDir`, CLI
  `study` passes `INIT_CWD`, and relative local sources now resolve from the
  user's shell directory even when `pnpm --filter` runs the package from
  `apps/cli`.
- 2026-06-04: Applied a twelfth AutoResearch upgrade: large-repo file
  navigation filters. `files.html` now includes extension and top-folder
  toolbars, file cards expose `data-file-ext` and `data-file-dir`, and the
  offline JS combines these filters with the existing global search.
- 2026-06-04: Applied a thirteenth AutoResearch upgrade: portable export
  integrity metadata. `manifest.json` now records page/asset byte counts,
  SHA-256 hashes, and an integrity summary; `EXPORT-README.md` explains the
  hash coverage and shows short hashes for quick inspection.
- 2026-06-04: Applied a fourteenth AutoResearch upgrade: direct export
  integrity verification. CLI `repo-tutor verify-export <session>` now checks
  every manifest-listed page and asset against recorded byte counts and
  SHA-256 hashes, returning PASS/FAIL JSON with failure details.
- 2026-06-04: Applied a fifteenth AutoResearch upgrade: tamper-negative export
  verification. `verify-export` now returns a non-zero CLI exit when integrity
  verification fails, and tests/smoke prove a changed `html/index.html` is
  reported as `ok: false`.
- 2026-06-04: Applied a sixteenth AutoResearch upgrade: export integrity
  reporting. CLI `repo-tutor export --format html|zip` now verifies the freshly
  rendered HTML manifest before returning, fails closed if verification fails,
  and includes `integrityOk` plus `integrityCheckedFiles` in export JSON.
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
  - temp CLI export-polish smoke generated `html/manifest.json`,
    `html/EXPORT-README.md`, 4 entrypoints, 14 pages, and 2 assets
  - temp CLI ZIP export smoke generated
    `/tmp/repotutor-zip-smoke.eay76P/2026-06-04/local__simple-ts-app__main__8f7c2b94/exports/html-report.zip`
    with 18 files, 72,114 bytes, signature `504b0304`, 14 pages, 2 assets, and
    `unzip -l` entries for `index.html`, `manifest.json`, and
    `EXPORT-README.md`
  - temp CLI relative-path smoke generated a completed fixture study from
    `packages/core/tests/fixtures/simple-ts-app` under
    `/tmp/repotutor-relative-cli-smoke.iLBw7a/2026-06-04/local__simple-ts-app__main__d3264425`
    with `html/index.html` and 15 quiz questions
  - temp CLI file-navigation smoke generated
    `/tmp/repotutor-file-nav-smoke.YlVkai/2026-06-04/local__simple-ts-app__main__df6a42da/html/files.html`
    with `file-nav-toolbar`, extension buttons, directory buttons,
    `data-file-ext=".ts"`, `data-file-dir="src"`, and matching handlers in
    `html/assets/app.js`
  - temp CLI manifest-integrity smoke generated
    `/tmp/repotutor-manifest-integrity-smoke.DSvUWT/2026-06-04/local__simple-ts-app__main__3a2cb784/html/manifest.json`
    with 16 covered files, `index.html` byte count 3,684, and verified
    `index.html` SHA-256 prefix `a34286246376`
  - temp CLI verify-export smoke generated a completed fixture study under
    `/tmp/repotutor-verify-export-smoke.1jhUun/2026-06-04/local__simple-ts-app__main__bf88883f`
    and verified 16 manifest files with `ok: true` and no failures
  - temp CLI tamper-verify smoke generated a completed fixture study under
    `/tmp/repotutor-tamper-verify-smoke.BRu06X/2026-06-04/local__simple-ts-app__main__67bd1c8e`,
    appended to `html/index.html`, and confirmed `verify-export` returned exit
    code 1, `ok: false`, and failure path `html/index.html`
  - temp CLI export-integrity JSON smoke generated
    `/tmp/repotutor-export-integrity-json-smoke.dkSgoj/2026-06-04/local__simple-ts-app__main__f5a93a48`
    and returned `integrityOk: true`, `integrityCheckedFiles: 16`, 18 ZIP files,
    and 76,489 ZIP bytes
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
  - `c8fa07e` component graph summaries
  - `8f7c2b9` portable HTML export guide
  - `d326442` zipped HTML export bundle
  - `df6a42d` CLI relative local-source resolution
  - `3a2cb78` file navigation filters
  - `bf88883` export manifest integrity metadata
  - `67bd1c8` export integrity verifier
  - `f5a93a4` tamper-negative export verification

## Next Actions

1. Continue next AutoResearch upgrade candidate unless the user stops.
