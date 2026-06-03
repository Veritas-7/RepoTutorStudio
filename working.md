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
- 2026-06-04: Applied a seventeenth AutoResearch upgrade: source evidence
  snippets for file lessons. `analysis/file-lessons.json`, `markdown/files.md`,
  and `html/files.html` now show short source-backed import/export/config/entry
  evidence with line numbers for each core file lesson.
- 2026-06-04: Applied an eighteenth AutoResearch upgrade: source evidence
  coverage summaries. `coverage-report.json`, `coverage.md`, and
  `coverage.html` now show how many core file lessons have source evidence,
  the evidence coverage ratio, and any files that still lack source evidence.
- 2026-06-04: Applied a nineteenth AutoResearch upgrade: source evidence
  drilldown filters. `files.html` now filters core file lessons by source
  evidence state, each file card exposes `data-source-evidence`, and
  `coverage.html` links source-evidence gaps back to the matching file lesson
  anchors.
- 2026-06-04: Applied a twentieth AutoResearch upgrade: source evidence kind
  breakdowns. `coverage-report.json`, `coverage.md`, and `coverage.html` now
  show how much evidence comes from import, export, entry, config, test, or
  text snippets.
- 2026-06-04: Applied a twenty-first AutoResearch upgrade: source evidence
  source-file links. `files.md` and `files.html` now link each source evidence
  snippet back to the copied `source/` file, so learners can jump from the
  lesson evidence to the original project file.
- 2026-06-04: Applied a twenty-second AutoResearch upgrade: source evidence
  index pages. RepoTutor now emits `markdown/evidence.md` and
  `html/evidence.html`, adds Evidence navigation, and includes an HTML manifest
  entrypoint for the evidence index.
- 2026-06-04: Applied a twenty-third AutoResearch upgrade: source evidence kind
  filters. `html/evidence.html` now includes evidence-kind filter buttons, and
  `assets/app.js` filters evidence cards by import, export, entry, config,
  test, or text.
- 2026-06-04: Applied a twenty-fourth AutoResearch upgrade: normalized source
  evidence index reports. RepoTutor now writes
  `analysis/evidence-index-report.json` with total evidence count, counts by
  kind, counts by file, lesson links, copied source paths, and source hrefs.
- 2026-06-04: Applied a twenty-fifth AutoResearch upgrade: CLI source evidence
  report access. `repo-tutor evidence <session>` now reads
  `analysis/evidence-index-report.json`, supports `--kind` and `--limit`, and
  returns evidence counts plus filtered evidence rows as JSON.
- 2026-06-04: Applied a twenty-sixth AutoResearch upgrade: CLI source evidence
  file filtering. `repo-tutor evidence <session>` now supports `--file <path>`
  and returns `filteredFile` so users can inspect evidence for one source file.
- 2026-06-04: Applied a twenty-seventh AutoResearch upgrade: Markdown output for
  CLI source evidence. `repo-tutor evidence <session>` now supports
  `--format markdown` for human-readable evidence summaries.
- 2026-06-04: Applied a twenty-eighth AutoResearch upgrade: source evidence
  integrity verification. Core now exports `verifyEvidenceIndexReport`, and CLI
  `repo-tutor verify-evidence <session>` checks the normalized evidence report,
  copied source paths, source hrefs, lesson HTML files, and lesson anchors with
  fail-closed JSON output.
- 2026-06-04: Applied a twenty-ninth AutoResearch upgrade: session-level
  readiness verification. Core now exports `verifyStudySessionArtifacts`, and
  CLI `repo-tutor verify-session <session>` checks `session.json`, required
  report artifacts, HTML export integrity, and source evidence integrity in one
  fail-closed JSON result.
- 2026-06-04: Applied a thirtieth AutoResearch upgrade: Markdown output for
  session readiness verification. `repo-tutor verify-session <session>` now
  supports `--format markdown`, rendering a human-readable PASS/FAIL summary,
  checked artifact counts, sub-check statuses, and compact failure rows.
- 2026-06-04: Applied a thirty-first AutoResearch upgrade: persistent session
  verification reports. Each completed `repo-tutor study` run now writes
  `analysis/session-verification-report.json` after rendering artifacts and
  fails closed if the aggregate session verifier reports a broken artifact set.
- 2026-06-04: Applied a thirty-second AutoResearch upgrade: Markdown session
  verification reports. Each completed `repo-tutor study` run now writes
  `markdown/session-verification.md` with PASS/FAIL status, artifact counts,
  sub-check status, and compact failure rows; `README.study.md` points to both
  the JSON and Markdown verification reports.
- 2026-06-04: Applied a thirty-third AutoResearch upgrade: HTML session
  verification entrypoint. The portable HTML export now includes
  `html/session-verification.html`, sidebar/index navigation, and a manifest
  entrypoint linking to the JSON and Markdown verification reports without
  creating a verifier-manifest cycle.
- 2026-06-04: Applied a thirty-fourth AutoResearch upgrade: study completion
  verification output. CLI `repo-tutor study` now returns `verificationOk`,
  verification report paths, checked required artifact count, and sub-check
  statuses in the completion JSON.
- 2026-06-04: Applied a thirty-fifth AutoResearch upgrade: list verification
  summaries. CLI `repo-tutor list` now reads each session's
  `analysis/session-verification-report.json`, returns verification status,
  report paths, checked artifact count, and sub-check statuses, and supports
  `--verified-only`.
- 2026-06-04: Applied a thirty-sixth AutoResearch upgrade: target-aware open
  command. CLI `repo-tutor open` now supports
  `--target verification|evidence|quiz` and other generated HTML pages so users
  can print direct paths to learning pages without manually composing paths.
- 2026-06-04: Applied a thirty-seventh AutoResearch upgrade: open target
  discovery. CLI `repo-tutor open --list-targets` now prints the supported
  HTML target names and filenames as JSON without requiring a session path.
- 2026-06-04: Applied a thirty-eighth AutoResearch upgrade: fail-closed open
  targets. CLI `repo-tutor open` now verifies the selected HTML target exists
  before printing the path, returning a clear error if the page is missing.
- 2026-06-04: Applied a thirty-ninth AutoResearch upgrade: resume page targets.
  CLI `repo-tutor resume` now returns verification status and all generated
  HTML target paths so a learner can resume directly into evidence,
  verification, quiz, or graph pages.
- 2026-06-04: Applied a fortieth AutoResearch upgrade: Markdown resume output.
  CLI `repo-tutor resume --format markdown` now renders a human-readable resume
  summary with verification status, target page paths, and verification checks.
- 2026-06-04: Applied a forty-first AutoResearch upgrade: Markdown session
  listing. CLI `repo-tutor list --format markdown` now renders a human-readable
  session table, and still works with `--verified-only`.
- 2026-06-04: Applied a forty-second AutoResearch upgrade: bounded session
  listing. CLI `repo-tutor list --limit N` now limits JSON and Markdown session
  output after filters, and invalid limits fail closed.
- 2026-06-04: Applied a forty-third AutoResearch upgrade: verification-status
  session filters. CLI `repo-tutor list --status passed|failed|missing|all`
  now filters sessions by verification state before limit and output rendering.
- 2026-06-04: Applied a forty-fourth AutoResearch upgrade: repo-filtered
  session listing. CLI `repo-tutor list --repo <owner/name-or-name>` now
  filters sessions by full repo id or repo basename before status, verified,
  limit, and output rendering.
- 2026-06-04: Applied a forty-fifth AutoResearch upgrade: sorted session
  listing. CLI `repo-tutor list --sort newest|oldest` now sorts filtered
  sessions by `createdAt` before limit and output rendering.
- 2026-06-04: Applied a seventieth AutoResearch upgrade: JSONL session list
  output. CLI `repo-tutor list --format jsonl` now streams filtered session
  rows as one JSON object per line, and `repo-tutor doctor` advertises JSONL
  support for list output.
- 2026-06-04: Applied a seventy-first AutoResearch upgrade: CSV session list
  output. CLI `repo-tutor list --format csv` now writes filtered session rows
  with stable CSV headers and escaped path cells, and `repo-tutor doctor`
  advertises CSV support for list output.
- 2026-06-04: Applied a seventy-second AutoResearch upgrade: field-selected
  session list output. CLI `repo-tutor list --fields <comma-list>` now projects
  filtered session rows across JSON, JSONL, CSV, and Markdown outputs, and
  `repo-tutor doctor` reports the supported list fields.
- 2026-06-04: Applied a seventy-third AutoResearch upgrade: field preset
  session list output. CLI `repo-tutor list --field-preset
  compact|scores|handoff|verification|paths` now reuses common field
  selections, and `repo-tutor doctor` reports the supported preset names.
- 2026-06-04: Applied a seventy-fourth AutoResearch upgrade: session list
  summary output. CLI `repo-tutor list --summary --format json|markdown` now
  summarizes filtered sessions by verification status, mode, level, HTML target
  completeness, quiz score state, and repository.
- 2026-06-04: Applied a seventy-fifth AutoResearch upgrade: saved session list
  output. CLI `repo-tutor list --output <file>` now writes JSON, JSONL, CSV,
  Markdown, or summary output directly to a file and returns the absolute output
  path.
- 2026-06-04: Applied a seventy-sixth AutoResearch upgrade: saved session list
  output manifests. CLI `repo-tutor list --output <file> --output-manifest` now
  writes a sidecar manifest with format, summary mode, row count, byte count,
  SHA-256, and timestamp metadata, and returns JSON receipt paths.
- 2026-06-04: Applied a seventy-seventh AutoResearch upgrade: saved session
  list output verification. CLI `repo-tutor verify-list-output <output-file>`
  now validates a saved list output against its `.manifest.json` sidecar,
  supports Markdown output, and fails closed on byte or SHA-256 drift.
- 2026-06-04: Applied a seventy-eighth AutoResearch upgrade: custom saved list
  output manifest paths. CLI `repo-tutor list --output <file>
  --output-manifest <manifest-file>` now writes manifests to caller-selected
  paths while preserving the default sidecar behavior for bare
  `--output-manifest`.
- 2026-06-04: Applied a seventy-ninth AutoResearch upgrade: saved session list
  manifest selection metadata. List output manifests now record selected
  fields, field presets, filters, sort, and limit metadata so saved inventories
  can be reproduced and audited after handoff.
- 2026-06-04: Applied an eightieth AutoResearch upgrade: saved session list
  manifest schema versioning. New list output manifests now record
  `schemaVersion: 1`, and `verify-list-output` reports the schema version in
  JSON and Markdown outputs.
- 2026-06-04: Applied an eighty-first AutoResearch upgrade: saved session list
  manifest schema gate. `verify-list-output` now reports
  `supportedSchemaVersion` and fails closed with `unsupported-schema-version`
  for future manifest schema versions instead of silently accepting them.
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
  - temp CLI source-evidence smoke generated
    `/tmp/repotutor-source-evidence-smoke.9DljR1/2026-06-04/local__simple-ts-app__main__25cfde25`
    with `sourceEvidence` JSON, Markdown `### 소스 근거`, HTML
    `source-evidence`, and source snippets such as
    `import { createGreeting } from "./message.js";`
  - temp CLI evidence-coverage smoke generated
    `/tmp/repotutor-evidence-coverage-smoke.9WcFv0/2026-06-04/local__simple-ts-app__main__d687db03`
    with 4 evidence-backed files, evidence coverage ratio 1.0, HTML
    `소스 근거 파일` / `근거 비율`, and Markdown source-evidence coverage
    sections
  - temp CLI evidence-filter smoke generated
    `studies/2026-06-04/local__simple-ts-app__main__eb9b601e` with
    `data-source-evidence-filter`, `data-source-evidence="present"`,
    `근거 있음`, `근거 부족`, and a matching
    `[data-source-evidence-filter]` handler in `html/assets/app.js`
  - temp CLI evidence-kind smoke generated
    `/tmp/repotutor-evidence-kind-smoke.qk4tIy/2026-06-04/local__simple-ts-app__main__63a77df2`
    with `evidenceKindCounts` `{text: 2, config: 4, import: 1, entry: 1,
    export: 1}`, Markdown `## 소스 근거 종류`, and HTML `근거 종류`
    / `소스 근거 종류`
  - temp CLI source-link smoke generated
    `/tmp/repotutor-source-link-smoke.5z54ZK/2026-06-04/local__simple-ts-app__main__946bc81d`
    with HTML `source-link`, `원본 열기`, `../source/src/main.ts`, Markdown
    `[원본](../source/src/main.ts)`, and copied
    `source/src/main.ts` present
  - temp CLI evidence-index smoke generated
    `/tmp/repotutor-evidence-index-smoke.8xjsZh/2026-06-04/local__simple-ts-app__main__8a6f5e80`
    with `html/evidence.html`, `markdown/evidence.md`,
    `evidence-index-cards`, links to `files.html#src-main.ts`,
    `../source/src/main.ts`, and manifest entrypoint `html/evidence.html`
  - temp CLI evidence-kind-filter smoke generated
    `/tmp/repotutor-evidence-kind-filter-smoke.HkAyVZ/2026-06-04/local__simple-ts-app__main__a3e504ae`
    with `evidence-kind-toolbar`, six `data-evidence-kind-filter` buttons,
    `data-evidence-kind="import"`, and matching `evidenceKind` /
    `evidenceOk` logic in `html/assets/app.js`
  - temp CLI evidence-report smoke generated
    `/tmp/repotutor-evidence-report-smoke.YejPLz/2026-06-04/local__simple-ts-app__main__020887fb`
    with `analysis/evidence-index-report.json`, `totalEvidenceItems: 9`,
    `evidenceByKind`, `lessonHref: html/files.html#src-main.ts`,
    `sourcePath: source/src/main.ts`, and `sourceHref: source/src/main.ts`
  - `pnpm audit:brief` initially caught the new artifact token outside the
    audit file scope; `scripts/compliance-audit.mjs` was corrected to include
    `packages/core/src/pipeline.ts`, then `pnpm audit:brief` passed 13/13
  - temp CLI evidence command smoke generated
    `/tmp/repotutor-evidence-cli-smoke.hnBk02/2026-06-04/local__simple-ts-app__main__dba4cad7`
    and `repo-tutor evidence <session> --kind import --limit 1` returned
    `filteredKind: import`, `returnedItems: 1`, `totalEvidenceItems: 9`,
    `evidenceByKind`, `evidenceByFile`, and `sourceHref: source/src/main.ts`
  - temp CLI evidence file-filter smoke generated
    `/tmp/repotutor-evidence-file-cli-smoke.VdnFYA/2026-06-04/local__simple-ts-app__main__f54b60e4`
    and `repo-tutor evidence <session> --kind import --file src/main.ts --limit 5`
    returned `filteredKind: import`, `filteredFile: src/main.ts`,
    `returnedItems: 1`, and `sourceHref: source/src/main.ts`
  - temp CLI evidence markdown smoke generated
    `/tmp/repotutor-evidence-md-cli-smoke.T4Yahz/2026-06-04/local__simple-ts-app__main__b9bf2e51`
    and `repo-tutor evidence <session> --kind import --file src/main.ts --limit 5 --format markdown`
    returned `# RepoTutor Evidence`, `Filters: kind=import, file=src/main.ts`,
    `src/main.ts:L1`, and `Source: source/src/main.ts`
  - temp CLI verify-evidence smoke generated
    `/tmp/repotutor-verify-evidence-smoke.qrxS8b/2026-06-04/local__simple-ts-app__main__625d78d3`
    and `repo-tutor verify-evidence <session>` returned `ok: true`,
    `checkedItems: 9`, `checkedSourceFiles: 4`, `checkedSourceLinks: 4`,
    `checkedLessonLinks: 4`, and no failures
  - temp CLI verify-evidence negative smoke removed
    `source/src/main.ts` from that temp session and confirmed
    `repo-tutor verify-evidence <session>` exited 1 with `ok: false`,
    `missing-source-path`, and `missing-source-href`
  - temp CLI verify-session smoke generated
    `/tmp/repotutor-verify-session-smoke.dNZW6T/2026-06-04/local__simple-ts-app__main__02727b8a`
    and `repo-tutor verify-session <session>` returned `ok: true`,
    `checkedRequiredArtifacts: 11`, `htmlExport: true`, and
    `evidenceIndex: true`
  - temp CLI verify-session negative smoke appended to `html/index.html`,
    removed `source/src/main.ts`, and confirmed
    `repo-tutor verify-session <session>` exited 1 with `htmlExport: false`,
    `evidenceIndex: false`, `html-export-failed`, and `evidence-index-failed`
  - temp CLI verify-session Markdown smoke generated
    `/tmp/repotutor-verify-session-md-smoke.AIwXar/2026-06-04/local__simple-ts-app__main__9c815df5`
    and `repo-tutor verify-session <session> --format markdown` returned
    `# RepoTutor Session Verification`, `Status: PASS`, all four sub-checks as
    PASS, and `Failures` as `none`
  - temp CLI persistent session report smoke generated
    `/tmp/repotutor-session-report-smoke.oxj2h3/2026-06-04/local__simple-ts-app__main__a5bc3b3f`
    with `analysis/session-verification-report.json` containing `ok: true`,
    `checkedRequiredArtifacts: 11`, `htmlExport: true`, `evidenceIndex: true`,
    and zero failures
  - temp CLI session verification Markdown report smoke generated
    `/tmp/repotutor-session-md-report-smoke.wybixW/2026-06-04/local__simple-ts-app__main__10a43db1`
    with `markdown/session-verification.md` containing `# 세션 검증`,
    `상태: PASS`, all four sub-checks as PASS, and `실패 항목` as `없음`
  - temp CLI session verification HTML smoke generated
    `/tmp/repotutor-session-html-smoke.C9HLsl/2026-06-04/local__simple-ts-app__main__3a4153ce`
    with `html/session-verification.html`, links to
    `../analysis/session-verification-report.json` and
    `../markdown/session-verification.md`, a manifest page entry, a manifest
    entrypoint, and 18 manifest-covered files
  - temp CLI study verification-output smoke generated
    `/tmp/repotutor-study-verification-output-smoke.iOjSiV/2026-06-04/local__simple-ts-app__main__8acedeae`
    and `repo-tutor study` returned `verificationOk: true`,
    `verificationReport`, `verificationMarkdown`, `verificationHtml`,
    `verificationCheckedRequiredArtifacts: 11`, and all four
    `verificationChecks` as true
  - temp CLI list verification smoke generated
    `/tmp/repotutor-list-verification-smoke.7R2dO9/2026-06-04/local__simple-ts-app__main__cca0b13a`
    and `repo-tutor list --verified-only` returned one verified session with
    `verificationStatus: passed`, `verificationOk: true`, verification
    report/Markdown/HTML paths, `verificationCheckedRequiredArtifacts: 11`,
    `htmlExport: true`, and `evidenceIndex: true`
  - temp CLI open-target smoke generated
    `/tmp/repotutor-open-target-smoke.5JnnCP/2026-06-04/local__simple-ts-app__main__e9a3fc98`;
    `repo-tutor open --target verification|evidence|quiz` returned existing
    HTML page paths, and unsupported target `nope` exited 1 with
    `Unsupported open target: nope`
  - temp CLI open-target-list smoke generated
    `/tmp/repotutor-open-target-list-smoke.WK6yKx/2026-06-04/local__simple-ts-app__main__fc9d7184`;
    `repo-tutor open --list-targets` returned 17 targets including
    `verification`, `evidence`, `quiz`, and `component-graph`, and
    `open --target verification|evidence|quiz` returned existing HTML files
  - temp CLI open-targets-markdown smoke generated
    `/tmp/repotutor-open-targets-md-smoke.hUWyo4`;
    `open --list-targets --format markdown` returned
    `# RepoTutor Open Targets`, verification and component-graph rows,
    `doctor` reported Markdown support for open target discovery, and invalid
    `--format text` exited 1 with
    `open --list-targets supports --format`
  - temp CLI open-exists smoke generated
    `/tmp/repotutor-open-exists-smoke.oXYr5x/2026-06-04/local__simple-ts-app__main__35d90f7a`;
    `open --target verification` returned an existing file, then deleting
    `html/session-verification.html` made the same command exit 1 with
    `Open target file not found`
  - temp CLI open-all smoke generated
    `/tmp/repotutor-open-all-smoke.zJptpK`; `open --target all` returned JSON
    paths for `index`, `verification`, `evidence`, `quiz`, and
    `component-graph`, and removing `html/quiz.html` made the command exit 1
    with `Open target file not found`
  - temp CLI open-all-markdown smoke generated
    `/tmp/repotutor-open-all-md-smoke.KWmraZ`;
    `open --target all --format markdown` returned
    `# RepoTutor Open Target Paths`, verification and quiz path rows, `doctor`
    reported Markdown support for `openAll`, and invalid `--format text`
    exited 1 with `open --target all supports --format`
  - temp CLI verify-export-markdown smoke generated
    `/tmp/repotutor-verify-export-md-smoke.4JKJLi`;
    `verify-export --format markdown` returned
    `# RepoTutor Export Verification`, `OK: PASS`, and `Checked files: 18`,
    `doctor` reported Markdown support for `verifyExport`, invalid
    `--format text` exited 1 with `verify-export supports --format`, and a
    tampered `html/index.html` made Markdown output return exit 1 with
    `OK: FAIL` and `html/index.html`
  - temp CLI verify-evidence-markdown smoke generated
    `/tmp/repotutor-verify-evidence-md-smoke.BBWQSx`;
    `verify-evidence --format markdown` returned
    `# RepoTutor Evidence Verification`, `OK: PASS`, and `Checked items: 9`,
    `doctor` reported Markdown support for `verifyEvidence`, invalid
    `--format text` exited 1 with `verify-evidence supports --format`, and
    removing `source/src/main.ts` made Markdown output return exit 1 with
    `OK: FAIL` and `missing-source-path`
  - temp CLI quiz-markdown smoke generated
    `/tmp/repotutor-quiz-md-smoke.0omscj`; `quiz --format markdown`
    returned `# RepoTutor Quiz Attempt`, `Score: 100`, `Correct: 15`, and
    `Wrong notes: .../html/wrong-notes.html`, `doctor` reported Markdown
    support for `quiz`, and invalid `--format text` exited 1 with
    `quiz supports --format`
  - temp CLI study-markdown smoke generated
    `/tmp/repotutor-study-md-smoke.UdhoAw`; `study --format markdown`
    returned `# RepoTutor Study`, `Verification OK: true`,
    `Quiz questions: 15`, and `Verification Checks`, `doctor` reported
    Markdown support for `study`, and invalid `--format text` exited 1 with
    `study supports --format`
  - temp CLI export-summary-markdown smoke generated
    `/tmp/repotutor-export-summary-md-smoke.HFdHEH`; `export --format html
    --summary-format markdown` returned `# RepoTutor Export`, `Exported: html`,
    `Integrity OK: true`, and `Entry Points`; `export --format zip
    --summary-format markdown` returned `Exported: zip`, `ZIP files: 20`, and
    `html-report.zip`; `doctor` reported Markdown support for `exportSummary`;
    invalid `--summary-format text` exited 1 with
    `export supports --summary-format`
  - temp CLI list-path-markdown smoke generated
    `/tmp/repotutor-list-path-md-smoke.QEFZRq`; `list --format markdown`
    returned `# RepoTutor Sessions`, a `Session Path` column, and the concrete
    session root path
  - temp CLI doctor-runtime smoke generated
    `/tmp/repotutor-doctor-runtime-smoke.laIdbD`; `doctor --studies-root`
    JSON returned `runtime.studiesRoot`, `runtime.cwd`, and `envStudiesRoot`,
    and `doctor --format markdown` returned `## Runtime`, `studiesRoot`, and
    `cwd`
  - temp CLI list-mode smoke generated
    `/tmp/repotutor-list-mode-smoke.Eo8An5`; quick and deep fixture sessions
    were created, `list --mode deep` returned one JSON row with `mode: deep`,
    `list --mode quick --format markdown` returned one Markdown row with
    `quick`, `doctor` reported list filter support for `mode`, and invalid
    `--mode slow` exited 1 with `list supports --mode`
  - temp CLI list-wrong-only smoke generated
    `/tmp/repotutor-list-wrong-smoke.FlvSHS`; two fixture sessions were
    created, one session was scored with 15 wrong answers, `list --wrong-only`
    returned exactly that one JSON row, Markdown output included the `Wrong`
    column with score `0` and wrong count `15`, and `doctor` reported
    `listFilters.wrongOnly: true`
  - temp CLI list-unattempted smoke generated
    `/tmp/repotutor-list-unattempted-smoke.usbNPL`; two fixture sessions were
    created, one session was scored with all correct answers, `list
    --unattempted-only` returned exactly the unattempted JSON row with
    `score: null`, Markdown output included `Score` as `none` and `Wrong` as
    `0`, and `doctor` reported `listFilters.unattemptedOnly: true`
  - temp CLI list-scored smoke generated
    `/tmp/repotutor-list-scored-smoke.pkn8ux`; two fixture sessions were
    created, one senior session was scored with all correct answers, `list
    --scored-only` returned exactly that scored JSON row, Markdown output
    included `Score` as `100` and `Wrong` as `0`, and `doctor` reported
    `listFilters.scoredOnly: true`
  - temp CLI list-score-range smoke generated
    `/tmp/repotutor-list-score-range-smoke.ppUrvq`; two fixture sessions were
    scored at `0` and `100`, `list --min-score 50` returned only the `100`
    row, `list --max-score 50` returned only the `0` row, Markdown output
    included `Score` as `100`, `doctor` reported `minScore` and `maxScore`
    filters, and invalid `--min-score 101` exited 1 with `min-score must be a
    number from 0 to 100`
  - temp CLI list-filter-conflict smoke generated
    `/tmp/repotutor-list-filter-conflict-smoke.nlhvCp`; invalid combinations
    `--unattempted-only --scored-only`, `--unattempted-only --wrong-only`,
    `--unattempted-only --min-score 1`, and `--min-score 90 --max-score 10`
    all exited 1 with explicit conflict messages, and `doctor` reported
    `listFilters.filterConflictValidation: true`
  - temp CLI list-date-range smoke generated
    `/tmp/repotutor-list-date-range-smoke.U4NaZ6`; two fixture sessions had
    `createdAt` set to `2001-01-01T12:00:00.000Z` and
    `2099-01-01T12:00:00.000Z`, `list --created-from 2099-01-01` returned
    only the senior 2099 row, `list --created-to 2001-01-01` returned only the
    beginner 2001 row, Markdown output included the 2099 timestamp, `doctor`
    reported created-date filters, and invalid date/range flags exited 1 with
    explicit messages
  - temp CLI list-score-sort smoke generated
    `/tmp/repotutor-list-score-sort-smoke.2FS1UL`; two scored sessions and one
    unscored session were created, `list --sort score-desc` returned scores in
    `100`, `0`, `null` order, `list --sort score-asc` returned `0`, `100`,
    `null` order, Markdown output included the `100` score row, `doctor`
    reported `score-desc` and `score-asc` sort support, and invalid
    `--sort score` exited 1 with the expanded sort error
  - temp CLI list-jsonl smoke generated
    `/tmp/repotutor-list-jsonl-smoke.0aMoEN`; two fixture sessions were
    created, `list --sort newest --format jsonl` returned exactly two parseable
    JSONL rows with expected session fields and passed verification status,
    `doctor` reported `formats.list` including `jsonl`, and invalid
    `--format yaml` exited 1 with the expanded list format error
  - temp CLI list-csv smoke generated
    `/tmp/repotutor-list-csv-smoke,sqqzVc`; two fixture sessions were created
    under a comma-containing studies root, `list --sort newest --format csv`
    returned the expected header plus two passed rows, comma-containing path
    cells were quoted, `doctor` reported `formats.list` including `csv`, and
    invalid `--format yaml` exited 1 with the expanded list format error
  - temp CLI list-fields smoke generated
    `/tmp/repotutor-list-fields-smoke.nsSYI7`; one fixture session was created,
    `list --fields sessionId,repo,score,path` returned exactly those keys in
    JSON and JSONL, CSV used those headers, Markdown rendered a selected-field
    table, `doctor` reported supported `listFilters.fields`, invalid
    `--fields nope` failed closed, and duplicate fields were de-duplicated in
    output order
  - temp CLI list-field-preset smoke generated
    `/tmp/repotutor-list-field-preset-smoke.Io8yRb`; one fixture session was
    created, the `scores` preset returned `sessionId,repo,score,wrong,path` in
    JSON, the `paths` preset produced matching CSV headers, the `compact`
    preset rendered selected Markdown fields, `doctor` reported all preset
    names, invalid `--field-preset nope` failed closed, and combining
    `--fields` with `--field-preset` failed closed with an explicit conflict
    message
  - temp CLI list-summary smoke generated
    `/tmp/repotutor-list-summary-smoke.MHi2AF`; two fixture sessions were
    created, one session was scored at `100`, JSON summary reported total `2`,
    two passed sessions, one scored session, one unattempted session, average
    score `100`, and complete HTML target counts, Markdown summary rendered the
    same totals, `--summary --format csv` failed closed, and combining
    `--summary` with `--fields` failed closed with an explicit conflict message
  - temp CLI list-output smoke generated
    `/tmp/repotutor-list-output-smoke.sHVw9m`; two fixture sessions were
    created, JSONL score-preset output, CSV paths-preset output, and Markdown
    summary output were written under `reports/`, stdout returned each absolute
    output path, saved file contents matched expected headers/totals, `doctor`
    reported output support, and bare `--output` failed closed with
    `output must be a non-empty string`
  - temp CLI list-output-manifest smoke generated
    `/tmp/repotutor-list-output-manifest-smoke.glkRlb`; two fixture sessions
    were created, JSONL score-preset output and Markdown summary output wrote
    `.manifest.json` sidecars, receipt JSON returned absolute output and
    manifest paths, manifest `bytes` and `sha256` matched recomputed file
    contents, summary manifests set `summary: true`, `doctor` reported
    `outputManifest: true`, and `--output-manifest` without `--output` failed
    closed with `list requires --output when --output-manifest is used`
  - temp CLI verify-list-output smoke generated
    `/tmp/repotutor-verify-list-output-smoke.JB1fqu`; two fixture sessions were
    created, saved JSONL score-preset output verified cleanly in JSON and
    Markdown using the default and explicit `--manifest` paths, tampering with
    the output failed closed with both `bytes-mismatch` and `sha256-mismatch`,
    and `doctor` reported `verify-list-output` plus JSON/Markdown formats
  - temp CLI custom-manifest smoke generated
    `/tmp/repotutor-list-custom-manifest-smoke.kMVXye`; two fixture sessions
    were created, JSONL score-preset output wrote a custom manifest under
    `manifests/custom-scores.json`, no default sidecar was created for that
    output, `verify-list-output --manifest` passed against the custom path, and
    bare `--output-manifest` still wrote the default summary sidecar
  - temp CLI list-manifest-metadata smoke generated
    `/tmp/repotutor-list-manifest-metadata-smoke.4M0xZA`; two fixture sessions
    were created, filtered JSONL score-preset output wrote manifest `fields`,
    `fieldPreset`, `filters.mode`, `filters.level`, `filters.status`,
    `filters.sort`, and `filters.limit` metadata matching the CLI invocation,
    output row count matched manifest `rows`, and summary manifests recorded
    `fields: null`, `fieldPreset: null`, and `filters.wrongOnly: true`
  - temp CLI list-manifest-schema smoke generated
    `/tmp/repotutor-list-manifest-schema-smoke.pMWIQQ`; one fixture session was
    created, saved JSONL output wrote `schemaVersion: 1`, `verify-list-output`
    JSON reported `schemaVersion: 1`, and verifier Markdown included
    `Schema version: 1`
  - temp CLI list-manifest-schema-gate smoke generated
    `/tmp/repotutor-list-manifest-schema-gate-smoke.MLa7HU`; one fixture
    session was created, schema version `1` verified with
    `supportedSchemaVersion: true`, verifier Markdown reported
    `Supported schema version: yes`, and a copied future manifest with
    `schemaVersion: 999` failed closed with `unsupported-schema-version`
  - temp CLI doctor-metadata smoke generated
    `/tmp/repotutor-doctor-metadata-smoke.I5Ezqp`; `repo-tutor doctor`
    returned command metadata, list filters, Markdown-capable resume formats,
    and open targets including `verification` and `all`
  - temp CLI doctor-markdown smoke generated
    `/tmp/repotutor-doctor-md-smoke.1a0B3j`; `repo-tutor doctor --format markdown`
    returned `# RepoTutor Doctor`, commands, open targets, list filters, and
    invalid `--format text` exited 1 with `doctor supports --format`
  - temp CLI resume-targets smoke generated
    `/tmp/repotutor-resume-targets-smoke.nVkVm8/2026-06-04/local__simple-ts-app__main__643161c4`;
    `repo-tutor resume` returned `verificationStatus: passed`, 17
    `htmlTargets`, and direct `verification`, `evidence`, and `quiz` page paths
  - temp CLI resume-markdown smoke generated
    `/tmp/repotutor-resume-md-smoke.2S1j83/2026-06-04/local__simple-ts-app__main__5fc5ecdd`;
    `repo-tutor resume --format markdown` returned `# RepoTutor Resume`,
    `Verification status: passed`, direct verification/evidence/quiz paths, and
    `session: PASS`
  - temp CLI resume-level smoke generated
    `/tmp/repotutor-resume-level-smoke.5JYl1L`; `repo-tutor resume` returned
    `mode: deep` and `level: junior`, and `repo-tutor resume --format markdown`
    returned `Study mode: deep` and `Learner level: junior`
  - temp CLI resume-target-status smoke generated
    `/tmp/repotutor-resume-target-status-smoke.WosgZN`; `repo-tutor resume`
    returned `htmlTargetStatus.quiz: true`, deleting `html/quiz.html` changed
    that status to `false`, and Markdown output included `HTML Target Status`,
    `quiz: missing`, and `index: present`
  - temp CLI list-markdown smoke generated
    `/tmp/repotutor-list-md-smoke.wN4Bip`; `repo-tutor list --verified-only
    --format markdown` returned `# RepoTutor Sessions`, `Returned sessions: 1`,
    a session table, `passed`, and `html/index.html`
  - temp CLI list-limit smoke generated `/tmp/repotutor-list-limit-smoke.Getzel`;
    two fixture sessions were created, `list --verified-only --limit 1`
    returned one JSON row, `list --verified-only --limit 1 --format markdown`
    returned `Returned sessions: 1`, and `--limit 0` exited 1 with
    `limit must be a positive integer`
  - temp CLI list-status smoke generated `/tmp/repotutor-list-status-smoke.ZfCoNP`;
    after removing one generated session verification report, `list --status
    passed` returned one passed row, `list --status missing` returned one
    missing row in JSON and Markdown, and `--status stale` exited 1 with
    `list supports --status`
  - temp CLI list-repo smoke generated `/tmp/repotutor-list-repo-smoke.XIo0gm`;
    two copied fixture repos `repo-alpha` and `repo-beta` were studied,
    `list --repo repo-alpha` returned one JSON row for `local/repo-alpha`,
    `list --repo local/repo-beta --format markdown` returned one Markdown row,
    and missing `--repo` value exited 1 with `repo must be a non-empty string`
  - temp CLI list-sort smoke generated `/tmp/repotutor-list-sort-smoke.rLGkoH`;
    two fixture sessions had `createdAt` set to `2001-01-01T00:00:00.000Z`
    and `2099-01-01T00:00:00.000Z`; `list --sort newest --limit 1` returned
    the 2099 row, `list --sort oldest --limit 1` returned the 2001 row,
    Markdown oldest output included the 2001 timestamp, and `--sort random`
    exited 1 with `list supports --sort`
  - temp CLI list-level smoke generated
    `/tmp/repotutor-list-level-smoke.Ue9Ehd`; two fixture sessions were created
    with `--level beginner` and `--level senior`, `list --level senior`
    returned one JSON row with
    `level: senior`, `list --level beginner --format markdown` returned the
    `Level` column and `beginner`, and `--level expert` exited 1 with
    `list supports --level`
  - temp CLI list-target-status smoke generated
    `/tmp/repotutor-list-target-status-smoke.Lc24EP`; one complete and one
    missing-target fixture session were created, deleting `html/quiz.html` made
    `list --html-targets missing` return one row with `missingHtmlTargets`
    containing `quiz`, `list --html-targets complete` returned the intact row,
    Markdown output included `HTML Targets` and `missing: quiz`, and invalid
    `--html-targets stale` exited 1 with `list supports --html-targets`
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
  - `25cfde2` export integrity reporting
  - `d687db0` source evidence snippets
  - `eb9b601` source evidence coverage summaries
  - `63a77df` source evidence drilldown filters
  - `946bc81` source evidence kind summaries
  - `8a6f5e8` source evidence source-file links
  - `a3e504a` source evidence index pages
  - `020887f` source evidence kind filters
  - `dba4cad` normalized source evidence report
  - `f54b60e` CLI evidence report command
  - `b9bf2e5` CLI evidence file filtering
  - `625d78d` Markdown output for CLI evidence
  - `02727b8` source evidence integrity verification
  - `9c815df` complete study session verification
  - `a5bc3b3` Markdown output for session verification
  - `10a43db` persistent session verification reports
  - `3a4153c` Markdown session verification reports
  - `8acedea` HTML session verification entrypoint
  - `cca0b13` study completion verification output
  - `e9a3fc9` list verification summaries
  - `fc9d718` target-aware open command
  - `35d90f7` open target discovery
  - `643161c` fail-closed open targets
  - `5fc5ecd` enriched resume output
  - `b88d17f` Markdown resume output
  - `9e52046` Markdown session list
  - `0544e48` bounded session list output
  - `f5f1cf0` verification-status session filters
  - `1411f76` repo-filtered session list
  - `b35ca6d` sorted session list
  - `d4ae5b8` learner-level session filters
  - `c44f095` resume learning context
  - `082056d` open all study targets
  - `29e98b2` doctor capability metadata
  - `1221061` doctor Markdown output
  - `eb633c4` resume HTML target status
  - `095090a` list HTML target status filters
  - `171e62f` open target Markdown discovery
  - `4feced9` open all target Markdown paths
  - `4788d27` export verification Markdown output
  - `87b5b94` evidence verification Markdown output
  - `4d7610c` quiz attempt Markdown output
  - `d14351f` study result Markdown output
  - `e609cfc` export summary Markdown output
  - `5cfe507` list Markdown session paths
  - `e3a123a` doctor runtime metadata
  - `0f9b92b` study-mode session list filters
  - `de92329` quiz-mistake session list filters
  - `30e48f2` unattempted session list filters
  - `5d937fc` scored session list filters
  - `3f86f3a` quiz-score session list filters
  - `d97b75b` list filter conflict validation
  - `c445345` created-date session list filters
  - `4023fc6` score-sorted session list filters
  - `ffc98e5` JSONL session list output
  - `cacc71c` CSV session list output
  - `219c480` field-selected session list output
  - `44730b7` field preset session list output
  - `7935087` session list summary output
  - `8f09c26` saved session list outputs
  - `05fdb53` saved session list output manifests
  - `fd1b60b` saved session list output verification
  - `d71ac45` custom saved list output manifest paths
  - `6877d93` saved session list manifest selection metadata
  - `b399160` saved session list manifest schema versioning

## Next Actions

1. Continue next AutoResearch upgrade candidate unless the user stops.
