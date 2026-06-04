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
- 2026-06-04: Applied an eighty-second AutoResearch upgrade: saved session list
  row-count verification. `verify-list-output` now reports `actualRows`,
  validates manifest `rows` against JSON, JSONL, and CSV output content, and
  fails closed with `rows-mismatch` when manifest row metadata drifts.
- 2026-06-04: Applied an eighty-third AutoResearch upgrade: saved session list
  field verification. `verify-list-output` now reports `actualFields`, compares
  manifest `fields` against JSON, JSONL, and CSV output keys or headers, and
  fails closed with `fields-mismatch` when field metadata drifts.
- 2026-06-04: Applied an eighty-fourth AutoResearch upgrade: saved list
  verification report files. `verify-list-output --report <file>` now writes
  JSON or Markdown verification reports while preserving fail-closed exits.
- 2026-06-04: Applied an eighty-fifth AutoResearch upgrade: default saved list
  verification report paths. Bare `--report` now writes
  `<output>.verification.json` or `<output>.verification.md`, and explicit empty
  report values fail closed.
- 2026-06-04: Applied an eighty-sixth AutoResearch upgrade: default study
  target command. Passing a source path or GitHub URL as the first argument now
  runs `study`, while typo commands still show help.
- 2026-06-04: Applied an eighty-seventh AutoResearch upgrade: studies-root
  runtime option discovery. CLI help and doctor output now expose
  `--studies-root <dir>` and runtime option metadata.
- 2026-06-04: Applied an eighty-eighth AutoResearch upgrade: doctor runtime
  health checks. `repo-tutor doctor` now reports studies-root existence,
  readability, writability, and parent-writability without mutating state.
- 2026-06-04: Applied an eighty-ninth AutoResearch upgrade: print-friendly
  offline HTML reports. Generated HTML includes print media rules and export
  README print-preview guidance for PDF or paper handouts.
- 2026-06-04: Applied a ninetieth AutoResearch upgrade: printable quiz answer
  key. Generated HTML now includes `html/quiz-print.html`, a manifest
  entrypoint, required-artifact verification, and CLI `open --target quiz-print`
  support.
- 2026-06-04: Applied a ninety-first AutoResearch upgrade: quiz section and
  difficulty filters. `html/quiz.html` now exposes section and difficulty
  filter toolbars, per-card quiz metadata, and offline JS handlers that combine
  with global search.
- 2026-06-04: Applied a ninety-second AutoResearch upgrade: component graph
  Mermaid download. `html/component-graph.html` now exposes a Mermaid download
  toolbar and offline JS saves the graph source as `component-graph.mmd`.
- 2026-06-04: Applied a ninety-third AutoResearch upgrade: manifested component
  graph Mermaid asset. Generated HTML exports now include
  `html/assets/component-graph.mmd`, and manifest, export README, integrity
  verification, and ZIP export all track it.
- 2026-06-04: Applied a ninety-fourth AutoResearch upgrade: component node
  relation lists. `html/component-graph.html` node cards now show direct
  incoming and outgoing graph relationships with `component-node-relations`
  rows.
- 2026-06-04: Applied a ninety-fifth AutoResearch upgrade: component node
  anchor links. Component graph node cards now expose stable
  `component-node-*` anchors, `data-node-id` metadata, and relation rows that
  link to connected cards with `data-node-link`.
- 2026-06-04: Applied a ninety-sixth AutoResearch upgrade: offline quiz reset
  controls. `html/quiz.html` now includes a `data-reset-quiz` button and
  offline JS clears picked answers, choice state, and live score text for
  reload-free quiz retry.
- 2026-06-04: Applied a ninety-seventh AutoResearch upgrade: guided learning
  path HTML. `html/learning-path.html` now provides a CodeTour-inspired ordered
  tour over generated report pages and is included in manifest, session
  verification, and `open --target learning-path`.
- 2026-06-04: Applied a ninety-eighth AutoResearch upgrade: portable learning
  path tour asset. Generated HTML now includes
  `html/assets/learning-path.tour.json`, a CodeTour-style ordered JSON tour
  asset with `isPrimary: true` and file-linked report steps.
- 2026-06-04: Applied a ninety-ninth AutoResearch upgrade: learning path
  progress persistence. `html/learning-path.html` now has
  `data-learning-step-complete` checkboxes and offline JS persists completed
  steps in browser localStorage under `repotutor:learning-path:<path>`.
- 2026-06-04: Applied a hundredth AutoResearch upgrade: learning path progress
  reset controls. `html/learning-path.html` now has a
  `data-reset-learning-progress` button labeled `진도 초기화`, and offline JS
  clears `learningProgress`, persists the cleared state, and unchecks all
  learning-step completion boxes without a reload.
- 2026-06-04: Applied a hundred-first AutoResearch upgrade: learning path
  progress summary. `html/learning-path.html` now shows
  `data-learning-progress-summary` with `완료 0 / N`, and offline JS updates it
  after initial restore, checkbox changes, and progress reset.
- 2026-06-04: Applied a hundred-second AutoResearch upgrade: learning path
  step navigation. Each `html/learning-path.html` step now has a stable
  `learning-step-N` anchor and `learning-step-nav` previous/next links.
- 2026-06-04: Applied a hundred-third AutoResearch upgrade: learning path
  primary marker. `html/learning-path.html` now marks the generated tour with
  `data-learning-primary` and `기본 투어`.
- 2026-06-04: Cloned `k3-2o/pi-repo-baby` under
  `research/external-src/k3-2o-pi-repo-baby` for read-only AutoResearch source
  inspection.
- 2026-06-04: Applied a hundred-fourth AutoResearch upgrade: suggested reads
  report. RepoTutor now writes `analysis/suggested-reads-report.json`,
  `markdown/suggested-reads.md`, and `html/suggested-reads.html`, and CLI
  `open --target suggested-reads` returns the new page.
- 2026-06-04: Pushed Upgrade 104 at `45bc3aa` with HEAD and `origin/main`
  matching.
- 2026-06-04: Cloned `Jai0401/docSmith` under
  `research/external-src/Jai0401-docSmith` for read-only AutoResearch source
  inspection. Source pattern: structured docs plus Dockerfile and Docker Compose
  generation prompts for runtime setup understanding.
- 2026-06-04: Started a hundred-fifth AutoResearch upgrade: runtime environment
  report. RepoTutor now targets `analysis/runtime-environment-report.json`,
  `markdown/runtime-environment.md`, `html/runtime-environment.html`, and CLI
  `open --target runtime-environment`.
- 2026-06-04: RED smoke for Upgrade 105 failed as expected at
  `/tmp/repotutor-runtime-env-red.*` with
  `missing analysis/runtime-environment-report.json`.
- 2026-06-04: GREEN smoke for Upgrade 105 generated
  `/tmp/repotutor-runtime-env-smoke.8d4vTV`; generated runtime environment
  JSON, Markdown, and HTML artifacts, included `runtime-env-card`, `docSmith`,
  `실행 환경`, and `data-source-pattern="docSmith"`, and
  `open --target runtime-environment` returned the new page.
- 2026-06-04: Upgrade 105 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
  - `jq empty research/analysis/autoresearch-2026-06-04.json`
  - `jq empty docs/audits/compliance-audit-summary.json`
  - `git diff --check`
- 2026-06-04: Pushed Upgrade 105 at `dc84793` with HEAD and `origin/main`
  matching.
- 2026-06-04: Cloned `wtdlee/repomap` under
  `research/external-src/wtdlee-repomap` for read-only AutoResearch source
  inspection. Source pattern: page map, route/API detection, component tracking,
  and data-flow hints.
- 2026-06-04: Started a hundred-sixth AutoResearch upgrade: interface map
  report. RepoTutor now targets `analysis/interface-map-report.json`,
  `markdown/interface-map.md`, `html/interface-map.html`, and CLI
  `open --target interface-map`.
- 2026-06-04: RED smoke for Upgrade 106 failed as expected at
  `/tmp/repotutor-interface-map-red.*` with
  `missing analysis/interface-map-report.json`.
- 2026-06-04: GREEN smoke for Upgrade 106 generated
  `/tmp/repotutor-interface-map-smoke.CNPJhA`; generated interface map JSON,
  Markdown, and HTML artifacts, included `interface-map-card`, `repomap`,
  `인터페이스 맵`, and `data-source-pattern="repomap"`, and
  `open --target interface-map` returned the new page.
- 2026-06-04: Upgrade 106 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 106 at `04ac644` with HEAD and `origin/main`
  matching.
- 2026-06-04: Applied a hundred-seventh AutoResearch upgrade: interface map
  source links. `html/interface-map.html` now renders `interface-source-link`
  anchors for route/page, API, and component signals.
- 2026-06-04: RED smoke for Upgrade 107 failed as expected at
  `/tmp/repotutor-interface-links-red.*` with
  `interface links missing interface-source-link`.
- 2026-06-04: GREEN smoke for Upgrade 107 generated
  `/tmp/repotutor-interface-links-smoke.eYV9Wk` and confirmed source links to
  `../source/src/pages/index.tsx` and `../source/src/api/client.ts`.
- 2026-06-04: Upgrade 107 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 107 at `4c9c030` with HEAD and `origin/main`
  matching.
- 2026-06-04: Cloned `carlrannaberg/codebase-map` under
  `research/external-src/carlrannaberg-codebase-map` for read-only AutoResearch
  source inspection. Source pattern: AST-based functions/classes/constants
  extraction for LLM-optimized code maps.
- 2026-06-04: Started a hundred-eighth AutoResearch upgrade: symbol map report.
  RepoTutor now targets `analysis/symbol-map-report.json`,
  `markdown/symbol-map.md`, `html/symbol-map.html`, and CLI
  `open --target symbol-map`.
- 2026-06-04: RED smoke for Upgrade 108 failed as expected at
  `/tmp/repotutor-symbol-map-red.*` with
  `missing analysis/symbol-map-report.json`.
- 2026-06-04: GREEN smoke for Upgrade 108 generated
  `/tmp/repotutor-symbol-map-smoke.Es0ZGq`; generated symbol map JSON,
  Markdown, and HTML artifacts, detected `createThing`, `HiddenThing`, and
  `VALUE`, included `symbol-map-card`, `symbol-source-link`, `codebase-map`,
  `심볼 맵`, and `data-source-pattern="codebase-map"`, and
  `open --target symbol-map` returned the new page.
- 2026-06-04: Upgrade 108 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 108 at `2c6101d` with HEAD and `origin/main`
  matching.
- 2026-06-04: Cloned `yamadashy/repomix` under
  `research/external-src/yamadashy-repomix` for read-only AutoResearch source
  inspection. Source pattern: AI-friendly repository context packing, token
  counting, token-count tree, git-aware ignore rules, and security-aware pack
  exclusions.
- 2026-06-04: Started a hundred-ninth AutoResearch upgrade: context pack token
  budget report. RepoTutor now targets `analysis/context-pack-report.json`,
  `markdown/context-pack.md`, `html/context-pack.html`, and CLI
  `open --target context-pack`.
- 2026-06-04: RED smoke for Upgrade 109 failed as expected at
  `/tmp/repotutor-context-pack-red.*` with
  `missing analysis/context-pack-report.json`.
- 2026-06-04: GREEN smoke for Upgrade 109 generated
  `/tmp/repotutor-context-pack-smoke.1fAGLi`; generated context pack JSON,
  Markdown, and HTML artifacts, included `small-chat-8k`, `standard-32k`,
  `long-context-128k`, `context-pack-card`, `context-pack-source-link`,
  `data-source-pattern="Repomix"`, and `Token Budget`, and
  `open --target context-pack` returned the new page.
- 2026-06-04: Upgrade 109 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 109 at `303713d` with HEAD and `origin/main`
  matching.
- 2026-06-04: Started a hundred-tenth AutoResearch upgrade: context pack split
  output plan. RepoTutor now extends `analysis/context-pack-report.json` with
  `splitPlans` and renders split output plans in `markdown/context-pack.md` and
  `html/context-pack.html`.
- 2026-06-04: RED smoke for Upgrade 110 failed as expected at
  `/tmp/repotutor-split-plan-red.*` with `missing splitPlans`.
- 2026-06-04: GREEN smoke for Upgrade 110 generated
  `/tmp/repotutor-split-plan-smoke.VLPZde`; generated splitPlans with
  `google-ai-studio-1mb`, `repomix-output.1.xml`, top-level directory grouping,
  and rendered `Split Output Plan` in HTML/Markdown while
  `open --target context-pack` still returned the context pack page.
- 2026-06-04: Upgrade 110 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 110 at `b54511d` with HEAD and `origin/main`
  matching.
- 2026-06-04: Cloned `DeDeveloper23/codebase-mcp` under
  `research/external-src/DeDeveloper23-codebase-mcp` for read-only AutoResearch
  source inspection. Source pattern: MCP tools for local codebase retrieval,
  remote public repository comparison, and saved codebase snapshots.
- 2026-06-04: Started a hundred-eleventh AutoResearch upgrade: MCP handoff
  report. RepoTutor now targets `analysis/mcp-handoff-report.json`,
  `markdown/mcp-handoff.md`, `html/mcp-handoff.html`, and CLI
  `open --target mcp-handoff`.
- 2026-06-04: RED smoke for Upgrade 111 failed as expected at
  `/tmp/repotutor-mcp-handoff-red.*` with
  `missing analysis/mcp-handoff-report.json`.
- 2026-06-04: GREEN smoke for Upgrade 111 generated
  `/tmp/repotutor-mcp-handoff-smoke.WWgM6S`; generated MCP handoff JSON,
  Markdown, and HTML artifacts, included `getCodebase`, `getRemoteCodebase`,
  `saveCodebase`, `mcp-handoff-card`, `data-source-pattern="codebase-mcp"`,
  and `MCP Handoff`, and `open --target mcp-handoff` returned the new page.
- 2026-06-04: Upgrade 111 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 111 at `e4bf95e` with HEAD and `origin/main`
  matching.
- 2026-06-04: Cloned `lucasrosati/claude-code-memory-setup` under
  `research/external-src/lucasrosati-claude-code-memory-setup` for read-only
  AutoResearch source inspection. Source pattern: persistent Obsidian memory,
  Graphify codebase knowledge graph, token-saving context navigation, and
  session save/resume notes.
- 2026-06-04: Started a hundred-twelfth AutoResearch upgrade: agent memory
  report. RepoTutor now targets `analysis/agent-memory-report.json`,
  `markdown/agent-memory.md`, `html/agent-memory.html`, and CLI
  `open --target agent-memory`.
- 2026-06-04: RED smoke for Upgrade 112 failed as expected at
  `/tmp/repotutor-agent-memory-red.*` with
  `missing analysis/agent-memory-report.json`.
- 2026-06-04: GREEN smoke for Upgrade 112 generated
  `/tmp/repotutor-agent-memory-smoke.XIDqRo`; generated Agent Memory JSON,
  Markdown, and HTML artifacts, included `tokenSavings`, `memoryNotes`,
  `project-context`, `agent-memory-card`,
  `data-source-pattern="Obsidian Graphify"`, and `Agent Memory`, and
  `open --target agent-memory` returned the new page.
- 2026-06-04: Upgrade 112 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 112 at `f96b54d` with HEAD and `origin/main`
  matching.
- 2026-06-04: Cloned `safishamsi/graphify` under
  `research/external-src/safishamsi-graphify` for read-only AutoResearch source
  inspection. Source pattern: query/path/explain graph traversal commands,
  query-first assistant guidance, node explanation cards, and shortest-path
  prompts.
- 2026-06-04: Started a hundred-thirteenth AutoResearch upgrade: graph query
  guide. RepoTutor now targets `analysis/graph-query-report.json`,
  `markdown/graph-query.md`, `html/graph-query.html`, and CLI
  `open --target graph-query`.
- 2026-06-04: RED smoke for Upgrade 113 failed as expected at
  `/tmp/repotutor-graph-query-red.*` with
  `missing analysis/graph-query-report.json`.
- 2026-06-04: GREEN smoke for Upgrade 113 generated
  `/tmp/repotutor-graph-query-smoke.VPMkZu`; generated Graph Query JSON,
  Markdown, and HTML artifacts, included `queryModes`, `nodeExplanations`,
  `pathPrompts`, `graph-query-card`, `data-source-pattern="Graphify"`,
  `graphify query`, `graphify path`, and `graphify explain`, and
  `open --target graph-query` returned the new page.
- 2026-06-04: Upgrade 113 verification passed:
  - `pnpm build`
  - `pnpm test`
  - `pnpm audit:brief`
- 2026-06-04: Pushed Upgrade 113 at `af7807a` with HEAD and `origin/main`
  matching.
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
  - temp CLI list-row-count smoke generated
    `/tmp/repotutor-list-row-count-smoke.gQgKb1`; two fixture sessions were
    created, JSON and CSV saved list outputs reported `actualRows: 2`,
    JSONL verifier Markdown included `Actual rows: 2`, and tampering manifest
    `rows` to `999` failed closed with `rows-mismatch` while output bytes and
    SHA-256 remained unchanged
  - temp CLI list-field-count smoke generated
    `/tmp/repotutor-list-field-count-smoke.96Q5Mn`; two fixture sessions were
    created, JSONL verifier Markdown reported matching `Fields` and
    `Actual fields`, CSV verification returned matching `fields` and
    `actualFields`, and tampering manifest fields to include `missingField`
    failed closed with `fields-mismatch`
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
  - temp CLI verify-list-report smoke generated
    `/tmp/repotutor-verify-list-report-smoke.51ZnNB`; an isolated fixture study
    was created, JSON and Markdown verification reports were saved to nested
    report paths, stdout returned the saved report paths, tampering manifest
    fields saved a failure report and exited non-zero with `fields-mismatch`,
    and missing `--report` value exited non-zero with
    `report must be a non-empty string.`
  - temp CLI default verify-list-report smoke generated
    `/tmp/repotutor-verify-list-default-report-smoke.uYu5Lv`; an isolated JSONL
    list output wrote default `.verification.json` and `.verification.md`
    reports for bare `--report`, stdout returned those default paths, and
    explicit `--report ""` failed closed with
    `report must be a non-empty string.`
  - temp CLI default-study smoke generated
    `/tmp/repotutor-default-study-smoke.WEdkrL`; passing a local source path as
    the first argument ran the `study` pipeline, `resume` confirmed
    `mode: quick` and `level: beginner`, doctor JSON/Markdown exposed the
    default study command, help listed default target usage, and typo command
    `lisst` still showed help.
  - temp CLI studies-root option smoke generated
    `/tmp/repotutor-studies-root-doc-smoke.M26C1G`; help listed
    `--studies-root <dir>`, doctor JSON returned runtime option metadata, and
    doctor Markdown included `## Runtime Options`.
  - temp CLI doctor runtime-health smoke generated
    `/tmp/repotutor-runtime-health-smoke.oY71Py`; absent custom studies root
    reported `studiesRootExists: false` and writable parent, existing studies
    root reported readable/writable true, and Markdown included
    `## Runtime Health`.
  - temp CLI print CSS smoke generated
    `/tmp/repotutor-print-css-smoke.KvSOCH`; generated `assets/style.css`
    included `@media print`, `print-color-adjust`, hidden sidebar/toolbar/choice
    rules, and printable link target rules, and `EXPORT-README.md` included
    browser print-preview guidance.
  - temp CLI quiz-print smoke generated
    `/tmp/repotutor-quiz-print-smoke.inb4sR`; generated `html/quiz-print.html`
    contained `정답지`, `print-answer-key`, `<strong>정답:</strong>`,
    `<strong>해설:</strong>`, and `연결 수업`; `manifest.json`,
    `verify-session`, `open --target quiz-print`, and `open --list-targets`
    all recognized the page.
  - temp CLI quiz-filter smoke generated
    `/tmp/repotutor-quiz-filter-smoke.vFPca8`; generated `html/quiz.html`
    contained `quiz-section-toolbar`, `quiz-difficulty-toolbar`,
    `data-quiz-section-filter`, `data-quiz-difficulty-filter`,
    `data-quiz-section`, and `data-quiz-difficulty`, with matching handlers in
    `html/assets/app.js`.
  - temp CLI graph-download smoke generated
    `/tmp/repotutor-graph-download-smoke.nkHqGQ`; generated
    `html/component-graph.html` contained `component-graph-download-toolbar`,
    `data-download-mermaid`, `component-graph-mermaid`, and
    `Mermaid 다운로드`, with Blob download logic in `html/assets/app.js`.
  - temp CLI graph-asset smoke generated
    `/tmp/repotutor-graph-asset-smoke.NCKVXv`; generated
    `html/assets/component-graph.mmd` contained `flowchart`, `manifest.json`
    and `EXPORT-README.md` listed `assets/component-graph.mmd`,
    `verify-export` checked the asset, and ZIP export included it.
  - temp CLI node-relations smoke generated
    `/tmp/repotutor-node-relations-smoke.KYweIs`; generated
    `html/component-graph.html` contained `component-node-relations`,
    `data-node-relation`, `연결 관계`, `outgoing`, and `incoming`.
  - temp CLI node-anchor smoke generated
    `/tmp/repotutor-node-anchor-smoke.UsF7cn`; generated
    `html/component-graph.html` contained `component-node-anchor`,
    `data-node-link`, `href="#component-node-`, and `data-node-id`.
  - temp CLI quiz-reset smoke generated
    `/tmp/repotutor-quiz-reset-smoke.pHoPiN`; generated `html/quiz.html`
    contained `quiz-reset-toolbar`, `data-reset-quiz`, and `복습 초기화`, and
    `html/assets/app.js` contained `[data-reset-quiz]`, `picked.clear()`, and
    `quiz-live-score`.
  - corrected temp CLI learning-path smoke generated
    `/tmp/repotutor-learning-path-smoke.dvaNGA`; generated
    `html/learning-path.html` contained `learning-path-step`,
    `data-learning-step`, `CodeTour`, `학습 경로`, and `component-graph.html`,
    `manifest.json` listed `html/learning-path.html`, and
    `open --target learning-path` returned the page path. An earlier smoke
    script at `/tmp/repotutor-learning-path-smoke.9p9xjX` exposed a test-script
    issue because single-target `open` returns a plain path, not JSON.
  - temp CLI learning-path tour asset smoke generated
    `/tmp/repotutor-tour-asset-smoke.FzAzmz`; generated
    `html/assets/learning-path.tour.json` parsed as JSON, had
    `isPrimary: true`, included a component graph file step, and appeared in
    `manifest.json` plus `EXPORT-README.md`.
  - temp CLI learning-progress smoke generated
    `/tmp/repotutor-learning-progress-smoke.6p1hD6`; generated
    `html/learning-path.html` contained `data-learning-step-complete` and
    `학습 완료`, while `html/assets/app.js` contained
    `repotutor:learning-path`, `localStorage`, `learningProgress`, and
    `[data-learning-step-complete]`.
  - temp CLI learning-reset smoke generated
    `/tmp/repotutor-learning-reset-smoke.hW6IZB`; generated
    `html/learning-path.html` contained `data-reset-learning-progress` and
    `진도 초기화`, while `html/assets/app.js` contained
    `[data-reset-learning-progress]` and `learningProgress.clear()`.
  - temp CLI learning-summary smoke generated
    `/tmp/repotutor-learning-summary-smoke.m3SHE4`; generated
    `html/learning-path.html` contained `data-learning-progress-summary` and
    `완료 0 /`, while `html/assets/app.js` contained
    `updateLearningProgressSummary` and `[data-learning-progress-summary]`.
  - temp CLI learning-nav smoke generated
    `/tmp/repotutor-learning-nav-smoke.UIf7oU`; generated
    `html/learning-path.html` contained `id="learning-step-1"`,
    `learning-step-nav`, `href="#learning-step-2"`, `다음 단계`, and
    `이전 단계`.
  - temp CLI learning-primary smoke generated
    `/tmp/repotutor-learning-primary-smoke.wnerUs`; generated
    `html/learning-path.html` contained `data-learning-primary` and
    `기본 투어`.
  - temp CLI suggested-reads smoke generated
    `/tmp/repotutor-suggested-reads-smoke.lyMXF2`; generated
    `analysis/suggested-reads-report.json`, `markdown/suggested-reads.md`, and
    `html/suggested-reads.html`, contained `suggested-read-card`, `Repo Baby`,
    and `추천 읽기`, and `open --target suggested-reads` returned the new HTML
    page path.
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
  - `04eba07` saved session list manifest schema gate
  - `91dd874` saved session list row-count verification
  - `a141f33` saved session list field verification
  - `b94218d` saved session list verification report files
  - `db5312b` default saved list verification report paths
  - `d361825` default study target command
  - `7c2ee7a` studies root runtime option discovery
  - `524c9f1` doctor runtime health checks
  - `82a4c3c` printable html reports
  - `ee040cc` printable quiz answer key
  - `1928282` offline quiz filters
  - `5747a91` component graph Mermaid download
  - `c75f777` component graph Mermaid asset
  - `2a96d42` component node relation lists
  - `3e82dac` component node anchor links
  - `3f4267c` offline quiz reset controls
  - `da775e1` guided learning path report
  - `9454f79` learning path tour asset
  - `86762b2` learning path progress persistence
  - `cc64368` learning path progress reset
  - `65d92d1` learning path progress summary
  - `3d0b4ea` learning path step navigation
  - `46b15e3` learning path primary marker
- 2026-06-04: AutoResearch Upgrade 114 candidate selected:
  `The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge`
  (`https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge`;
  public MIT; 12,367 stars; 1,408 forks; updated 2026-06-03T16:14:05Z).
  Cloned ignored external source to
  `research/external-src/The-Pocket-PocketFlow-Tutorial-Codebase-Knowledge`
  and inspected `flow.py`, `nodes.py`, and `main.py` without executing it.
- 2026-06-04: RED tutorial-abstractions smoke generated
  `/tmp/repotutor-tutorial-abstractions-red-studies.hcQfdw/...`; old build
  was missing `analysis/tutorial-abstraction-report.json` as expected.
- 2026-06-04: Implemented PocketFlow-style tutorial abstraction report:
  `TutorialAbstractionReportSchema`, `analysis/tutorial-abstraction-report.json`,
  `markdown/tutorial-abstractions.md`, `html/tutorial-abstractions.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target tutorial-abstractions`.
- 2026-06-04: GREEN tutorial-abstractions smoke generated
  `/tmp/repotutor-tutorial-abstractions-green-studies.0D2g33/...`; confirmed
  `abstractions`, `relationships`, `chapterOrder`,
  `tutorial-abstraction-card`, `data-source-pattern="PocketFlow"`, and
  `open --target tutorial-abstractions` -> `html/tutorial-abstractions.html`.
- 2026-06-04: Verification for Upgrade 114:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 114:
  - `a6772e6` tutorial abstraction report
- 2026-06-04: AutoResearch Upgrade 115 candidate selected:
  `thomvaill/log4brains` (`https://github.com/thomvaill/log4brains`;
  public Apache-2.0; 1,482 stars; 111 forks; updated
  2026-06-02T19:03:24Z). Cloned ignored external source to
  `research/external-src/thomvaill-log4brains` and inspected README, ADR
  template, ADR status/relation domain code, config schema, and CLI new/list
  commands without executing it.
- 2026-06-04: RED decision-records smoke generated
  `/tmp/repotutor-decision-records-red-studies.bLIq5o/...`; old build was
  missing `analysis/decision-record-report.json` as expected.
- 2026-06-04: Implemented Log4brains-style decision record report:
  `DecisionRecordReportSchema`, `analysis/decision-record-report.json`,
  `markdown/decision-records.md`, `html/decision-records.html`,
  status/timeline/package-scope fields, manifest/session-verification coverage,
  learning-path linkage, and `open --target decision-records`.
- 2026-06-04: GREEN decision-records smoke generated
  `/tmp/repotutor-decision-records-green-studies.1HGBOe/...`; confirmed
  `records`, `statusCounts`, `timeline`, `packageScopes`,
  `decision-record-card`, `data-source-pattern="Log4brains"`, and
  `open --target decision-records` -> `html/decision-records.html`.
- 2026-06-04: Verification for Upgrade 115:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 115:
  - `5451ce5` decision record report
- 2026-06-04: AutoResearch Upgrade 116 candidate selected:
  `sverweij/dependency-cruiser`
  (`https://github.com/sverweij/dependency-cruiser`; public MIT; 6,719 stars;
  284 forks; updated 2026-06-03T14:12:03Z). Cloned ignored external source to
  `research/external-src/sverweij-dependency-cruiser` and inspected README,
  `configs/rules/no-circular.cjs`, `configs/rules/no-orphans.cjs`,
  `src/graph-utl/indexed-module-graph.mjs`, and `types/cruise-result.d.mts`
  without executing it.
- 2026-06-04: RED dependency-health smoke generated
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-dependency-health-red-studies.ElcnGI8FyZ/...`;
  old build was missing `analysis/dependency-health-report.json` as expected.
- 2026-06-04: Implemented dependency-cruiser-style dependency health report:
  `DependencyHealthReportSchema`, `analysis/dependency-health-report.json`,
  `markdown/dependency-health.md`, `html/dependency-health.html`,
  local dependency edges, cycle/orphan/rule-violation fields,
  fan-in/fan-out graph metrics, manifest/session-verification coverage,
  learning-path linkage, and `open --target dependency-health`.
- 2026-06-04: GREEN dependency-health smoke generated
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-dependency-health-green-studies.h1ibguTvLv/...`;
  confirmed `localDependencyEdges`, `cycles`, `orphanModules`,
  `ruleViolations`, `dependency-health-card`,
  `data-source-pattern="dependency-cruiser"`, `no-circular`, `no-orphans`,
  and `open --target dependency-health` -> `html/dependency-health.html`.
- 2026-06-04: Verification for Upgrade 116:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 116:
  - `3d16f0e` dependency health report
- 2026-06-04: AutoResearch Upgrade 117 candidate selected:
  `TypeStrong/typedoc` (`https://github.com/TypeStrong/typedoc`; public
  Apache-2.0; 8,405 stars; 766 forks; updated 2026-06-02T13:47:49Z). Cloned
  ignored external source to `research/external-src/TypeStrong-typedoc` and
  inspected README, `package.json`, `src/index.ts`,
  `src/lib/models/DeclarationReflection.ts`,
  `src/lib/models/ProjectReflection.ts`, `src/lib/models/kind.ts`, and
  `src/lib/validation/exports.ts` without executing it.
- 2026-06-04: RED api-reference smoke generated
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-api-reference-red-studies.ALp7FF8Pin/...`;
  old build was missing `analysis/api-reference-report.json` as expected.
- 2026-06-04: Implemented TypeDoc-style API reference report:
  `ApiReferenceReportSchema`, `analysis/api-reference-report.json`,
  `markdown/api-reference.md`, `html/api-reference.html`, entry point rows,
  public symbols, ReflectionKind-style categories, export warnings,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target api-reference`.
- 2026-06-04: GREEN api-reference smoke generated
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-api-reference-green-studies.C2R90GpBXb/...`;
  confirmed `entryPoints`, `publicSymbols`, `exportWarnings`,
  `api-reference-card`, `data-source-pattern="TypeDoc"`, `ReflectionKind`, and
  `open --target api-reference` -> `html/api-reference.html`.
- 2026-06-04: Verification for Upgrade 117:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 117:
  - `ff5a960` API reference report
- 2026-06-04: AutoResearch Upgrade 118 candidate selected:
  `Pagefind/pagefind` (`https://github.com/Pagefind/pagefind`; public MIT;
  5,254 stars; 193 forks; updated 2026-06-03T14:47:40Z). Cloned ignored
  external source to `research/external-src/Pagefind-pagefind` and inspected
  README, `pagefind/src/fragments/mod.rs`,
  `pagefind/src/index/index_metadata.rs`, `pagefind/src/index/mod.rs`,
  `pagefind/src/index/index_filter.rs`, `pagefind/src/output/mod.rs`,
  `pagefind_web_js/lib/public_search_api.ts`,
  `pagefind_web_js/lib/search_wrapper.ts`, and docs for metadata/filtering
  without executing it.
- 2026-06-04: RED search-index smoke generated
  `/tmp/repotutor-search-index-red-studies.FaSruS/2026-06-04/local__simple-ts-app__HEAD__56931863`;
  old build was missing `analysis/search-index-report.json`,
  `html/search-index.html`, and `html/assets/search-index.json` as expected.
- 2026-06-04: Implemented Pagefind-style static search index report:
  `SearchIndexReportSchema`, `analysis/search-index-report.json`,
  `markdown/search-index.md`, `html/search-index.html`,
  `html/assets/search-index.json`, PageFragmentData-style documents,
  MetaIndex-style term/filter/metadata fields, manifest/session-verification
  coverage, learning-path linkage, and `open --target search-index`.
- 2026-06-04: GREEN search-index smoke generated
  `/tmp/repotutor-search-index-green-studies.1VlF5F/2026-06-04/local__simple-ts-app__main__56931863`;
  confirmed `documents`, `termIndex`, `filterIndex`, `metadataFields`,
  `search-index-card`, `data-source-pattern="Pagefind"`, `PageFragmentData`,
  `MetaIndex`, `assets/search-index.json`, manifest/learning-path entries, and
  `open --target search-index` -> `html/search-index.html`.
- 2026-06-04: Verification for Upgrade 118:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 118:
  - `2d163f5` static search index report
- 2026-06-04: AutoResearch Upgrade 119 candidate selected:
  `ktaletsk/learn-codebase` (`https://github.com/ktaletsk/learn-codebase`;
  public MIT; 19 stars; 0 forks; updated 2026-04-20T06:31:01Z). Cloned
  ignored external source to `research/external-src/ktaletsk-learn-codebase`
  and inspected README, `SKILL.md`, `JOURNAL-TEMPLATE.md`, and
  `QUESTION-PATTERNS.md` without executing it.
- 2026-06-04: RED learning-journal smoke generated
  `/tmp/repotutor-learning-journal-red-studies.4vOcud/2026-06-04/local__simple-ts-app__main__e966b5a6`;
  old build was missing `analysis/learning-journal-report.json`,
  `markdown/learning-journal.md`, `html/learning-journal.html`, and
  `html/assets/learning-journal-template.md` as expected.
- 2026-06-04: Implemented learn-codebase-style active recall learning journal:
  `LearningJournalReportSchema`, `analysis/learning-journal-report.json`,
  `markdown/learning-journal.md`, `html/learning-journal.html`,
  `html/assets/learning-journal-template.md`, focus goals, mastery levels,
  open questions, spaced review queue, Socratic prompts, manifest/session
  verification coverage, learning-path linkage, and
  `open --target learning-journal`.
- 2026-06-04: GREEN learning-journal smoke generated
  `/tmp/repotutor-learning-journal-green-studies.Idy1BV/2026-06-04/local__simple-ts-app__main__e966b5a6`;
  confirmed `verificationCheckedRequiredArtifacts=57`, `focusGoals`,
  `masteryLevels`, `openQuestions`, `spacedReviewQueue`, `socraticPrompts`,
  `journalTemplateMarkdown`, `learning-journal-card`,
  `data-source-pattern="learn-codebase"`, `Active Recall Journal`,
  `Spaced Review Queue`, template asset, manifest/learning-path entries, and
  `open --target learning-journal` -> `html/learning-journal.html`.
- 2026-06-04: Verification for Upgrade 119:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 119:
  - `96c3588` active recall learning journal
- 2026-06-04: AutoResearch Upgrade 120 candidate selected:
  `repowise-dev/repowise` (`https://github.com/repowise-dev/repowise`;
  public; GitHub license key `Other`, checked `LICENSE` AGPL-3.0-or-later;
  2,187 stars; 282 forks; updated 2026-06-03T16:35:56Z). Cloned ignored
  external source to `research/external-src/repowise-dev-repowise` and
  inspected README, docs for intelligence/code health, and git indexer records
  without executing it.
- 2026-06-04: RED project-activity smoke generated
  `/tmp/repotutor-project-activity-red-studies.*/...`; old build was missing
  `analysis/project-activity-report.json`, `markdown/project-activity.md`, and
  `html/project-activity.html` as expected.
- 2026-06-04: Implemented Repowise-style project activity risk report:
  `ProjectActivityReportSchema`, `analysis/project-activity-report.json`,
  `markdown/project-activity.md`, `html/project-activity.html`, explicit
  history availability, activity signals, static hotspot candidates, dead-code
  candidates, review queues, architecture decision prompts,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target project-activity`. The report preserves source type,
  branch, commit, URL/path metadata but does not fabricate full Git churn,
  ownership, or co-change history after `.git` is removed from the safe study
  source.
- 2026-06-04: GREEN project-activity smoke generated
  `/tmp/repotutor-project-activity-green-studies.jiEuX6/2026-06-04/local__simple-ts-app__main__9d0b090f`;
  confirmed `verificationCheckedRequiredArtifacts=60`,
  `historyAvailability`, `activitySignals`, `hotspotCandidates`,
  `deadCodeCandidates`, `reviewQueues`, `architectureDecisionPrompts`,
  `project-activity-card`, `data-source-pattern="Repowise"`,
  manifest/learning-path entries, and `open --target project-activity` ->
  `html/project-activity.html`.
- 2026-06-04: Verification for Upgrade 120:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 120:
  - `9ce2cc6` project activity risk report
- 2026-06-04: AutoResearch Upgrade 121 candidate selected:
  `licensee/licensee` (`https://github.com/licensee/licensee`; public MIT;
  899 stars; 331 forks; updated 2026-06-01T01:51:54Z). Cloned ignored
  external source to `research/external-src/licensee-licensee` and inspected
  docs plus core project/license file classes without executing it.
- 2026-06-04: RED license-rights smoke generated
  `/tmp/repotutor-license-rights-red.json`; old build was missing
  `analysis/license-rights-report.json`, `markdown/license-rights.md`, and
  `html/license-rights.html` as expected.
- 2026-06-04: Implemented Licensee-style license rights report:
  `LicenseRightsReportSchema`, `analysis/license-rights-report.json`,
  `markdown/license-rights.md`, `html/license-rights.html`, license file
  candidate scoring, package metadata license signals, README license hints,
  review warnings, rights checklist, manifest/session-verification coverage,
  learning-path linkage, and `open --target license-rights`.
- 2026-06-04: GREEN license-rights smoke generated
  `/tmp/repotutor-license-rights-green-studies.VPkljT/2026-06-04/local__simple-ts-app__main__f989eeae`;
  confirmed `verificationCheckedRequiredArtifacts=63`,
  `detectedProjectLicense`, `licenseFiles`, `packageLicenseSignals`,
  `readmeLicenseReferences`, `reviewWarnings`, `rightsChecklist`,
  `license-rights-card`, `data-source-pattern="Licensee"`,
  manifest/learning-path entries, and `open --target license-rights` ->
  `html/license-rights.html`.
- 2026-06-04: Verification for Upgrade 121:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 121:
  - `f7c8f7a` license rights report
- 2026-06-04: AutoResearch Upgrade 122 candidate selected:
  `anchore/syft` (`https://github.com/anchore/syft`; public Apache-2.0;
  9,064 stars; 868 forks; updated 2026-06-02T20:22:49Z). Cloned ignored
  external source to `research/external-src/anchore-syft` and inspected
  README plus SBOM/package/relationship source files without executing it.
- 2026-06-04: RED sbom smoke generated
  `/tmp/repotutor-sbom-red-studies.2uhpgw/2026-06-04/local__simple-ts-app__main__36517a48`;
  old build was missing `analysis/sbom-report.json`, `markdown/sbom.md`, and
  `html/sbom.html` as expected.
- 2026-06-04: Implemented Syft-style software bill of materials report:
  `SbomReportSchema`, `analysis/sbom-report.json`, `markdown/sbom.md`,
  `html/sbom.html`, source descriptor, package manifests, package artifacts,
  file artifacts, relationships, output-format readiness notes, review
  warnings, manifest/session-verification coverage, learning-path linkage, and
  `open --target sbom`.
- 2026-06-04: GREEN sbom smoke generated
  `/tmp/repotutor-sbom-green-studies.HFeXCi/2026-06-04/local__simple-ts-app__main__36517a48`;
  confirmed `verificationCheckedRequiredArtifacts=66`, package manifest 1,
  package artifacts 3, file artifact 1, relationships 8, `sourceDescriptor`,
  `packageArtifacts`, `fileArtifacts`, `outputFormats`, `sbom-card`,
  `data-source-pattern="Syft"`, manifest/learning-path entries, and
  `open --target sbom` -> `html/sbom.html`.
- 2026-06-04: Verification for Upgrade 122:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 122:
  - `b670092` software bill of materials report
- 2026-06-04: AutoResearch Upgrade 123 candidate selected:
  `aquasecurity/trivy` (`https://github.com/aquasecurity/trivy`; public
  Apache-2.0; 35,386 stars; 415 forks; updated
  2026-06-03T21:09:55Z). Cloned ignored external source to
  `research/external-src/aquasecurity-trivy` and inspected README plus
  vulnerability/secret/misconfiguration/license scanner docs without executing
  it.
- 2026-06-04: RED security-readiness smoke generated
  `/tmp/repotutor-security-readiness-red-studies.MSL819/2026-06-04/local__simple-ts-app__main__17ba0081`;
  old build was missing `analysis/security-readiness-report.json`,
  `markdown/security-readiness.md`, and `html/security-readiness.html` as
  expected.
- 2026-06-04: Implemented Trivy-style security readiness report:
  `SecurityReadinessReportSchema`,
  `analysis/security-readiness-report.json`,
  `markdown/security-readiness.md`, `html/security-readiness.html`, scanner
  targets, scanner coverage, security signals, action queue, recommended
  commands, manifest/session-verification coverage, learning-path linkage, and
  `open --target security-readiness`.
- 2026-06-04: GREEN security-readiness smoke generated
  `/tmp/repotutor-security-readiness-green-studies.oQb24K/2026-06-04/local__simple-ts-app__main__17ba0081`;
  confirmed `verificationCheckedRequiredArtifacts=69`, targets 5, scanner
  coverage 5, security signals 2, actions 4, recommended commands 3,
  `security-readiness-card`, `data-source-pattern="Trivy"`,
  manifest/learning-path entries, and `open --target security-readiness` ->
  `html/security-readiness.html`.
- 2026-06-04: Verification for Upgrade 123:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 123:
  - `b321fe4` security readiness report
- 2026-06-04: AutoResearch Upgrade 124 candidate selected:
  `ossf/scorecard` (`https://github.com/ossf/scorecard`; public Apache-2.0;
  5,475 stars; 656 forks; updated 2026-06-02T01:43:46Z). Cloned ignored
  external source to `research/external-src/ossf-scorecard` and inspected
  README, check documentation, check registration, result scoring, and selected
  check implementations without executing external source.
- 2026-06-04: RED scorecard smoke generated
  `/tmp/repotutor-scorecard-red-studies.j9fKRs/2026-06-04/local__simple-ts-app__main__d1482871`;
  old build was missing `analysis/scorecard-report.json`,
  `markdown/scorecard.md`, and `html/scorecard.html` as expected.
- 2026-06-04: Implemented OpenSSF Scorecard-style project scorecard report:
  `ScorecardReportSchema`, `analysis/scorecard-report.json`,
  `markdown/scorecard.md`, `html/scorecard.html`, checks, aggregate score,
  category scores, policy findings, risk queue, structured results,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target scorecard`.
- 2026-06-04: GREEN scorecard smoke generated
  `/tmp/repotutor-scorecard-green-studies.Lj2fvZ/2026-06-04/local__simple-ts-app__main__d1482871`;
  confirmed `verificationCheckedRequiredArtifacts=72`, aggregate score 3,
  checks 12, risk queue 12, policy findings 5, `scorecard-card`,
  `data-source-pattern="OpenSSF Scorecard"`, manifest/learning-path entries,
  and `open --target scorecard` -> `html/scorecard.html`.
- 2026-06-04: Verification for Upgrade 124:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 124:
  - `450a280` project scorecard report
- 2026-06-04: AutoResearch Upgrade 125 candidate selected:
  `sigstore/cosign` (`https://github.com/sigstore/cosign`; public
  Apache-2.0; 5,997 stars; 745 forks; updated 2026-06-03T21:10:07Z).
  Cloned ignored external source to `research/external-src/sigstore-cosign`
  and inspected README, signature/attestation/bundle specs, verify-blob docs,
  policy attestation conversion, and verification option code without executing
  external source.
- 2026-06-04: RED provenance smoke generated
  `/tmp/repotutor-provenance-red-studies.U4FSZk/2026-06-04/local__simple-ts-app__main__d11526e6`;
  old build was missing `analysis/provenance-report.json`,
  `markdown/provenance.md`, and `html/provenance.html` as expected.
- 2026-06-04: Implemented Cosign-style provenance readiness report:
  `ProvenanceReportSchema`, `analysis/provenance-report.json`,
  `markdown/provenance.md`, `html/provenance.html`, artifact signals,
  signature material, attestation predicates, identity requirements,
  verification commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target provenance`.
- 2026-06-04: GREEN provenance smoke generated
  `/tmp/repotutor-provenance-green-studies.kLwDTm/2026-06-04/local__simple-ts-app__main__d11526e6`;
  confirmed `verificationCheckedRequiredArtifacts=75`, artifact signals 6,
  signature material 6, attestations 5, identity requirements 5, risk queue 5,
  verification commands 4, `provenance-card`, `data-source-pattern="Cosign"`,
  manifest/learning-path entries, and `open --target provenance` ->
  `html/provenance.html`.
- 2026-06-04: Verification for Upgrade 125:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 13/13 audit reports
- 2026-06-04: Pushed AutoResearch Upgrade 125:
  - `ab8f07b` provenance readiness report
- 2026-06-04: AutoResearch Upgrade 126 candidate selected:
  `google/osv-scanner` (`https://github.com/google/osv-scanner`; public
  Apache-2.0; 10,426 stars; 713 forks; updated 2026-06-03T21:51:24Z).
  Cloned ignored external source to `research/external-src/google-osv-scanner`
  and inspected README, usage/configuration/output/offline docs, result models,
  vulnerability result building, config parsing, and lockfile scanner mapping
  without executing external source.
- 2026-06-04: RED advisories smoke generated
  `/tmp/repotutor-advisories-red-studies.GMKrqn/2026-06-04/local__simple-ts-app__main__6afec26d`;
  old build was missing `analysis/advisory-report.json`,
  `markdown/advisories.md`, and `html/advisories.html` as expected.
- 2026-06-04: Implemented OSV-Scanner-style advisory query readiness report:
  `AdvisoryReportSchema`, `analysis/advisory-report.json`,
  `markdown/advisories.md`, `html/advisories.html`, package query targets,
  lockfile signals, advisory sources, policy controls, result model,
  remediation queue, recommended commands, manifest/session-verification
  coverage, learning-path linkage, and `open --target advisories`.
- 2026-06-04: GREEN advisories smoke generated
  `/tmp/repotutor-advisories-final-studies.nWy5FO/2026-06-04/local__simple-ts-app__main__6afec26d`;
  confirmed `verificationCheckedRequiredArtifacts=78`, query targets 3,
  lockfile signals 0, advisory sources 6, policy controls 6, result model 5,
  remediation queue 4, recommended commands 5, `advisory-card`,
  `data-source-pattern="OSV-Scanner"`, manifest/learning-path entries, and
  `open --target advisories` -> `html/advisories.html`.
- 2026-06-04: Verification for Upgrade 126:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 14/14 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 126:
  - `50921d0` advisory query readiness report

- 2026-06-04: AutoResearch Upgrade 127 candidate selected:
  `openvex/vexctl` (`https://github.com/openvex/vexctl`; public Apache-2.0;
  194 stars; 27 forks; updated 2026-06-03T07:27:47Z). Cloned ignored
  external source to `research/external-src/openvex-vexctl` and inspected
  README, create/add/filter/merge/generate/attest commands, implementation
  interfaces, statement option validation, attestation code, and examples
  without executing external source.
- 2026-06-04: RED VEX smoke generated
  `/tmp/repotutor-vex-red-studies.SHPpdU/2026-06-04/local__simple-ts-app__main__076b7e4b`;
  old build was missing `analysis/vex-report.json`, `markdown/vex.md`, and
  `html/vex.html` as expected.
- 2026-06-04: Implemented OpenVEX-style impact readiness report:
  `VexReportSchema`, `analysis/vex-report.json`, `markdown/vex.md`,
  `html/vex.html`, product targets, vulnerability inputs, status matrix,
  justification catalog, statement drafts, document workflow, attestation
  readiness, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target vex`.
- 2026-06-04: GREEN VEX smoke generated
  `/tmp/repotutor-vex-green-studies.xgwwZK/2026-06-04/local__simple-ts-app__main__076b7e4b`;
  confirmed `verificationCheckedRequiredArtifacts=81`, product targets 5,
  vulnerability inputs 5, statuses 4, justifications 5, statement drafts 5,
  workflow 6, attestation readiness 5, risk queue 4, `vex-card`,
  `data-source-pattern="OpenVEX"`, manifest/learning-path entries, and
  `open --target vex` -> `html/vex.html`.
- 2026-06-04: Verification for Upgrade 127:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 25/25 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 127:
  - `eb4176e` OpenVEX impact readiness report

- 2026-06-04: AutoResearch Upgrade 128 candidate selected:
  `open-policy-agent/opa` (`https://github.com/open-policy-agent/opa`;
  public Apache-2.0; 11,817 stars; 1,578 forks; updated
  2026-06-03T15:45:37Z). Cloned ignored external source to
  `research/external-src/open-policy-agent-opa` and inspected README, policy
  language/testing docs, eval/check/build command code, and bundle-related
  docs without executing external source.
- 2026-06-04: RED policy-gates smoke generated
  `/tmp/repotutor-policy-gates-red-studies.9VAWoh/2026-06-04/local__simple-ts-app__main__265e638e`;
  old build was missing `analysis/policy-gate-report.json`,
  `markdown/policy-gates.md`, and `html/policy-gates.html` as expected.
- 2026-06-04: Implemented OPA-style policy gate readiness report:
  `PolicyGateReportSchema`, `analysis/policy-gate-report.json`,
  `markdown/policy-gates.md`, `html/policy-gates.html`, policy documents,
  input documents, gate queries, test coverage, bundle readiness, decision
  outputs, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, and `open --target policy-gates`.
- 2026-06-04: GREEN policy-gates smoke generated
  `/tmp/repotutor-policy-gates-green-studies.ugd9P0/2026-06-04/local__simple-ts-app__main__265e638e`;
  confirmed `verificationCheckedRequiredArtifacts=84`, policy documents 0,
  input documents 1, gate queries 0, test coverage rows 4, bundle readiness 6,
  decision outputs 5, recommended commands 5, risk queue 4,
  `policy-gate-card`, `data-source-pattern="OPA"`, manifest/learning-path
  entries, and `open --target policy-gates` -> `html/policy-gates.html`.
- 2026-06-04: Verification for Upgrade 128:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 26/26 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 128:
  - `24570c7` policy gate readiness report

- 2026-06-04: AutoResearch Upgrade 129 candidate selected:
  `schemathesis/schemathesis` (`https://github.com/schemathesis/schemathesis`;
  public MIT; 3,337 stars; 216 forks; updated 2026-06-03T13:37:58Z). Cloned
  ignored external source to `research/external-src/schemathesis-schemathesis`
  and inspected README, quick start, CI/CD, Allure, coverage, stateful testing,
  CLI reference, and generation/check code without executing external source.
- 2026-06-04: RED api-contracts smoke generated
  `/tmp/repotutor-contracts-red-studies.TF2TRb/2026-06-04/local__simple-ts-app__main__4d7cbd26`;
  old build was missing `analysis/api-contract-report.json`,
  `markdown/api-contracts.md`, and `html/api-contracts.html` as expected.
- 2026-06-04: Implemented Schemathesis-style API contract readiness report:
  `ApiContractReportSchema`, `analysis/api-contract-report.json`,
  `markdown/api-contracts.md`, `html/api-contracts.html`, schema documents,
  operation targets, test phases, check matrix, runtime targets, reporting
  outputs, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, and `open --target api-contracts`.
- 2026-06-04: GREEN api-contracts smoke generated
  `/tmp/repotutor-contracts-green-studies.ROVc7l/2026-06-04/local__simple-ts-app__main__4d7cbd26`;
  confirmed `verificationCheckedRequiredArtifacts=87`, schema documents 0,
  operation targets 0, test phases 5, checks 6, runtime targets 5, reporting
  outputs 6, recommended commands 6, risk queue 2, `api-contract-card`,
  `data-source-pattern="Schemathesis"`, manifest/learning-path entries, and
  `open --target api-contracts` -> `html/api-contracts.html`.
- 2026-06-04: Verification for Upgrade 129:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 27/27 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 129:
  - `0b1e685` API contract readiness report

- 2026-06-04: AutoResearch Upgrade 130 candidate selected:
  `open-telemetry/opentelemetry-js`
  (`https://github.com/open-telemetry/opentelemetry-js`; public Apache-2.0;
  3,387 stars; 1,052 forks; updated 2026-06-03T14:58:51Z). Cloned ignored
  external source to `research/external-src/open-telemetry-opentelemetry-js`
  and inspected README, metrics docs, SDK setup, auto-instrumentation,
  exporters, resource/context packages, semantic conventions, and diagnostics
  patterns without executing external source.
- 2026-06-04: RED observability smoke generated
  `/tmp/repotutor-observability-red-studies.WwbQXF/2026-06-04/local__simple-ts-app__main__ac8cad2e`;
  old build was missing `analysis/observability-report.json`,
  `markdown/observability.md`, and `html/observability.html` as expected.
- 2026-06-04: Implemented OpenTelemetry-style observability readiness report:
  `ObservabilityReportSchema`, `analysis/observability-report.json`,
  `markdown/observability.md`, `html/observability.html`, signal pipelines,
  instrumentation signals, exporter targets, resource attributes, propagation
  context, diagnostics, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target observability`.
- 2026-06-04: GREEN observability smoke generated
  `/tmp/repotutor-observability-green-studies.PILjIS/2026-06-04/local__simple-ts-app__main__ac8cad2e`;
  confirmed `verificationCheckedRequiredArtifacts=90`, signal pipelines 3,
  instrumentation signals 0, exporter targets 1, resource attributes 0,
  propagation context 5, diagnostics 6, recommended commands 5, risk queue 2,
  `observability-card`, `data-source-pattern="OpenTelemetry"`,
  manifest/learning-path entries, and `open --target observability` ->
  `html/observability.html`.
- 2026-06-04: Verification for Upgrade 130:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 28/28 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 130:
  - `53e9469` observability readiness report

- 2026-06-04: AutoResearch Upgrade 131 candidate selected:
  `grafana/k6` (`https://github.com/grafana/k6`; public AGPL-3.0; 30,725
  stars; 1,554 forks; updated 2026-06-03T20:35:08Z). Cloned ignored external
  source to `research/external-src/grafana-k6` and inspected README, examples,
  threshold/scenario/executor/summary/options code, outputs, release notes, and
  workflow hints without executing external source.
- 2026-06-04: RED performance smoke generated
  `/tmp/repotutor-performance-red-studies.Ld7wHh/2026-06-04/local__simple-ts-app__main__470b176e`;
  old build was missing `analysis/performance-report.json`,
  `markdown/performance.md`, and `html/performance.html` as expected.
- 2026-06-04: Implemented k6-style performance readiness report:
  `PerformanceReportSchema`, `analysis/performance-report.json`,
  `markdown/performance.md`, `html/performance.html`, script targets, workload
  models, thresholds, checks, metrics, outputs, runtime controls, recommended
  commands, risk queue, manifest/session-verification coverage, learning-path
  linkage, and `open --target performance`.
- 2026-06-04: GREEN performance smoke generated
  `/tmp/repotutor-performance-green-studies.ItApNO/2026-06-04/local__simple-ts-app__main__470b176e`;
  confirmed `verificationCheckedRequiredArtifacts=93`, script targets 0,
  workload models 8, thresholds 0, checks 0, metrics 0, outputs 1, runtime
  controls 8, recommended commands 5, risk queue 2, `performance-card`,
  `data-source-pattern="k6"`, manifest/learning-path entries, and
  `open --target performance` -> `html/performance.html`.
- 2026-06-04: Verification for Upgrade 131:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 29/29 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 131:
  - `7627676` performance readiness report

- 2026-06-04: AutoResearch Upgrade 132 candidate selected:
  `microsoft/playwright` (`https://github.com/microsoft/playwright`; public
  Apache-2.0; 90,218 stars; 5,853 forks; updated 2026-06-04T01:39:58Z).
  Compared with `cypress-io/cypress`, `SeleniumHQ/selenium`, and
  `webdriverio/webdriverio`; selected Playwright for current activity, license
  clarity, browser-project model, trace/report artifacts, and direct alignment
  with RepoTutor user-flow readiness. Cloned ignored external source to
  `research/external-src/microsoft-playwright` and inspected README, config
  docs, browser projects, locators, assertions, trace/screenshot/video
  reporting, webServer/baseURL/runtime controls, and CLI/MCP docs without
  executing external source.
- 2026-06-04: RED e2e smoke generated
  `/tmp/repotutor-e2e-red-studies.T2zTjI/2026-06-04/local__simple-ts-app__main__c688d74e`;
  old build was missing `analysis/e2e-report.json`, `markdown/e2e.md`, and
  `html/e2e.html` as expected.
- 2026-06-04: Implemented Playwright-style E2E readiness report:
  `E2eReportSchema`, `analysis/e2e-report.json`, `markdown/e2e.md`,
  `html/e2e.html`, test suites, browser projects, locator signals, assertions,
  artifacts, runtime targets, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target e2e`.
- 2026-06-04: GREEN e2e smoke generated
  `/tmp/repotutor-e2e-green-studies.Ce8iow/2026-06-04/local__simple-ts-app__main__c688d74e`;
  confirmed `verificationCheckedRequiredArtifacts=96`, test suites 0, browser
  projects 5, locator signals 0, assertions 7, artifacts 1, runtime targets 7,
  recommended commands 5, risk queue 2, `e2e-card`,
  `data-source-pattern="Playwright"`, manifest/learning-path entries, and
  `open --target e2e` -> `html/e2e.html`.
- 2026-06-04: Verification for Upgrade 132:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 30/30 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 132:
  - `e30247d` e2e readiness report

- 2026-06-04: AutoResearch Upgrade 133 candidate selected:
  `dequelabs/axe-core` (`https://github.com/dequelabs/axe-core`; public
  MPL-2.0; 7,215 stars; 891 forks; updated 2026-06-03T17:43:51Z). Compared
  with `pa11y/pa11y`, `GoogleChrome/lighthouse`, and `webhintio/hint`;
  selected axe-core for focused accessibility engine/rule/result modeling.
  Cloned ignored external source to `research/external-src/dequelabs-axe-core`
  and inspected README, API docs, rule descriptions, impact docs, partial run
  docs, and integration examples without executing external source.
- 2026-06-04: RED accessibility smoke generated
  `/tmp/repotutor-accessibility-red-studies.adt06F/2026-06-04/local__simple-ts-app__main__538313d3`;
  old build was missing `analysis/accessibility-report.json`,
  `markdown/accessibility.md`, and `html/accessibility.html` as expected.
- 2026-06-04: Implemented axe-core-style accessibility readiness report:
  `AccessibilityReportSchema`, `analysis/accessibility-report.json`,
  `markdown/accessibility.md`, `html/accessibility.html`, scan targets,
  WCAG/category rule tags, result buckets, impact levels, integration signals,
  context controls, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target accessibility`.
- 2026-06-04: GREEN accessibility smoke generated
  `/tmp/repotutor-accessibility-green-studies.z7ESax/2026-06-04/local__simple-ts-app__main__538313d3`;
  confirmed `verificationCheckedRequiredArtifacts=99`, scan targets 0, rule
  tags 19, result buckets 4, impact levels 5, integration signals 0, context
  controls 9, recommended commands 5, risk queue 2, `accessibility-card`,
  `data-source-pattern="axe-core"`, manifest/learning-path entries, and
  `open --target accessibility` -> `html/accessibility.html`.
- 2026-06-04: Verification for Upgrade 133:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 31/31 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 133:
  - `fc4c240` accessibility readiness report

- 2026-06-04: AutoResearch Upgrade 134 candidate selected:
  `storybookjs/storybook` (`https://github.com/storybookjs/storybook`; public
  MIT; 90,173 stars; 10,113 forks; updated 2026-06-03T21:40:35Z). Compared
  with `tajo/ladle`, `histoire-dev/histoire`, and `mui/toolpad`; selected
  Storybook for its broad CSF, docs, addon, test, and publish model. Cloned
  ignored external source to `research/external-src/storybookjs-storybook` and
  inspected README, CSF docs, story writing docs, play function docs,
  configure docs, autodocs docs, decorators docs, and test-runner/testing docs
  without executing external source.
- 2026-06-04: RED storybook smoke generated
  `/tmp/repotutor-storybook-red-studies.bLw8c4/2026-06-04/local__simple-ts-app__main__028712bd`;
  old build was missing `analysis/storybook-report.json`,
  `markdown/storybook.md`, and `html/storybook.html` as expected.
- 2026-06-04: Implemented Storybook-style component workshop readiness report:
  `StorybookReportSchema`, `analysis/storybook-report.json`,
  `markdown/storybook.md`, `html/storybook.html`, story files, config files,
  story annotations, addon signals, test signals, publish signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target storybook`.
- 2026-06-04: GREEN storybook smoke generated
  `/tmp/repotutor-storybook-green-studies.Czhy2F/2026-06-04/local__simple-ts-app__main__028712bd`;
  confirmed `verificationCheckedRequiredArtifacts=102`, story files 0,
  config files 0, annotations 12, addon signals 13, test signals 9,
  publish signals 7, recommended commands 5, risk queue 2, `storybook-card`,
  `data-source-pattern="Storybook"`, manifest/learning-path entries, and
  `open --target storybook` -> `html/storybook.html`.
- 2026-06-04: Verification for Upgrade 134:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 32/32 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 134:
  - `c500fd7` storybook readiness report

- 2026-06-04: AutoResearch Upgrade 135 candidate selected:
  `style-dictionary/style-dictionary`
  (`https://github.com/style-dictionary/style-dictionary`; public Apache-2.0;
  4,674 stars; 621 forks; updated 2026-06-02T15:14:43Z). Compared with
  `tokens-studio/sd-transforms`, `tailwindlabs/tailwindcss`, and
  `primer/primitives`; selected Style Dictionary because it directly models
  canonical design token inputs, transforms, and multi-platform outputs.
  Cloned ignored external source to
  `research/external-src/style-dictionary-style-dictionary` and inspected the
  README, basic examples, and examples index without executing external source.
- 2026-06-04: RED design tokens smoke generated
  `/tmp/repotutor-design-tokens-red-studies.Oeb524/2026-06-04/local__simple-ts-app__main__557a2318`;
  old build was missing `analysis/design-tokens-report.json`,
  `markdown/design-tokens.md`, and `html/design-tokens.html` as expected.
- 2026-06-04: Implemented Style Dictionary-style design token readiness report:
  `DesignTokensReportSchema`, `analysis/design-tokens-report.json`,
  `markdown/design-tokens.md`, `html/design-tokens.html`, token sources,
  token categories, platform targets, transform signals, usage signals,
  governance signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target design-tokens`.
- 2026-06-04: GREEN design tokens smoke generated
  `/tmp/repotutor-design-tokens-green-studies.WSnXYL/2026-06-04/local__simple-ts-app__main__557a2318`;
  confirmed `verificationCheckedRequiredArtifacts=105`, token sources 0,
  token categories 14, platform targets 11, transform signals 12, usage
  signals 8, governance signals 9, recommended commands 5, risk queue 2,
  `design-token-card`, `data-source-pattern="Style Dictionary"`,
  manifest/learning-path entries, and `open --target design-tokens` ->
  `html/design-tokens.html`.
- 2026-06-04: Verification for Upgrade 135:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 33/33 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 135:
  - `38b7cd1` design tokens readiness report

- 2026-06-04: AutoResearch Upgrade 136 candidate selected:
  `formatjs/formatjs` (`https://github.com/formatjs/formatjs`; public;
  license not specified by `gh repo view`; 14,715 stars; 1,385 forks; updated
  2026-06-03T23:48:10Z). Compared with `i18next/i18next`,
  `lingui/js-lingui`, and `facebook/fbt`; selected FormatJS for its broad
  React Intl, ICU message, extract/compile/verify, polyfill, and ESLint tooling
  model. Cloned ignored external source to
  `research/external-src/formatjs-formatjs` and inspected README, CLI docs,
  React Intl docs, Intl MessageFormat docs, application workflow docs,
  polyfill docs, and linter docs without executing external source.
- 2026-06-04: RED i18n smoke generated
  `/tmp/repotutor-i18n-red-studies.hqox29/2026-06-04/local__simple-ts-app__main__ada41a1b`;
  old build was missing `analysis/i18n-report.json`, `markdown/i18n.md`, and
  `html/i18n.html` as expected.
- 2026-06-04: Implemented FormatJS-style i18n readiness report:
  `I18nReportSchema`, `analysis/i18n-report.json`, `markdown/i18n.md`,
  `html/i18n.html`, message sources, locale assets, runtime signals,
  extraction signals, ICU signals, QA signals, recommended commands, risk
  queue, manifest/session-verification coverage, learning-path linkage, and
  `open --target i18n`.
- 2026-06-04: GREEN i18n smoke generated
  `/tmp/repotutor-i18n-green-studies.zbv6Sc/2026-06-04/local__simple-ts-app__main__ada41a1b`;
  confirmed `verificationCheckedRequiredArtifacts=108`, message sources 0,
  locale assets 0, runtime signals 8, extraction signals 10, ICU signals 10,
  QA signals 9, recommended commands 5, risk queue 2, `i18n-card`,
  `data-source-pattern="FormatJS"`, manifest/learning-path entries, and
  `open --target i18n` -> `html/i18n.html`.
- 2026-06-04: Verification for Upgrade 136:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 34/34 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 136:
  - `70ac6c9` i18n readiness report

- 2026-06-04: AutoResearch Upgrade 137 candidate selected:
  `semantic-release/semantic-release`
  (`https://github.com/semantic-release/semantic-release`; public MIT;
  23,742 stars; 1,804 forks; updated 2026-06-04T02:41:15Z). Compared with
  `changesets/changesets`, `googleapis/release-please`, and
  `conventional-changelog/commitlint`; selected semantic-release for its
  automated version calculation, release notes, branch/channel workflows,
  CI-only publishing, plugin lifecycle, auth, OIDC, and provenance model.
  Cloned ignored external source to
  `research/external-src/semantic-release-semantic-release` and inspected
  README, configuration docs, plugin docs, CI configuration docs, and GitHub
  Actions recipe docs without executing external source.
- 2026-06-04: RED release readiness smoke generated
  `/tmp/repotutor-release-red-studies.ij2rnJ/2026-06-04/local__simple-ts-app__main__3b04f674`;
  old build was missing `analysis/release-readiness-report.json`,
  `markdown/release-readiness.md`, and `html/release-readiness.html` as
  expected.
- 2026-06-04: Implemented semantic-release-style release readiness report:
  `ReleaseReadinessReportSchema`, `analysis/release-readiness-report.json`,
  `markdown/release-readiness.md`, `html/release-readiness.html`, release
  configs, branch channels, version signals, CI signals, publish targets, auth
  signals, plugin steps, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target release-readiness`.
- 2026-06-04: GREEN release readiness smoke generated
  `/tmp/repotutor-release-green-studies.Knbfhz/2026-06-04/local__simple-ts-app__main__3b04f674`;
  confirmed `verificationCheckedRequiredArtifacts=111`, release configs 0,
  branch channels 7, version signals 8, CI signals 9, publish targets 8, auth
  signals 7, plugin steps 9, recommended commands 5, risk queue 2,
  `release-card`, `data-source-pattern="semantic-release"`,
  manifest/learning-path entries, and `open --target release-readiness` ->
  `html/release-readiness.html`.
- 2026-06-04: Verification for Upgrade 137:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 35/35 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 137:
  - `482bfd1` release readiness report

- 2026-06-04: AutoResearch Upgrade 138 candidate selected:
  `gitleaks/gitleaks` (`https://github.com/gitleaks/gitleaks`; public MIT;
  27,491 stars; 2,094 forks; updated 2026-06-04T01:09:53Z). Compared with
  `trufflesecurity/trufflehog`, `Yelp/detect-secrets`, and
  `awslabs/git-secrets`; selected Gitleaks for its git, dir, stdin, baseline,
  config, allowlist, redaction, report format, pre-commit, and staged scanning
  model. Cloned ignored external source to
  `research/external-src/gitleaks-gitleaks` and inspected README,
  configuration docs in README, reporting docs in README, and
  `.pre-commit-hooks.yaml` without executing external source.
- 2026-06-04: RED secret readiness smoke generated
  `/tmp/repotutor-secret-red-studies.nvmRuY/2026-06-04/local__simple-ts-app__main__9b8131fe`;
  old build was missing `analysis/secret-readiness-report.json`,
  `markdown/secret-readiness.md`, and `html/secret-readiness.html` as expected.
- 2026-06-04: Implemented Gitleaks-style secret readiness report:
  `SecretReadinessReportSchema`, `analysis/secret-readiness-report.json`,
  `markdown/secret-readiness.md`, `html/secret-readiness.html`, scan targets,
  secret surfaces, config signals, reporting signals, prevention signals,
  advanced signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target secret-readiness`.
- 2026-06-04: GREEN secret readiness smoke generated
  `/tmp/repotutor-secret-green-studies.Fey0h5/2026-06-04/local__simple-ts-app__main__9b8131fe`;
  confirmed `verificationCheckedRequiredArtifacts=114`, scan targets 6,
  secret surfaces 0, config signals 0, reporting signals 9, prevention signals
  7, advanced signals 6, recommended commands 5, risk queue 5, `secret-card`,
  `data-source-pattern="Gitleaks"`, manifest/learning-path entries, and
  `open --target secret-readiness` -> `html/secret-readiness.html`.
- 2026-06-04: Verification for Upgrade 138:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 36/36 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 138:
  - `6198347` secret readiness report

- 2026-06-04: AutoResearch Upgrade 139 candidate selected:
  `hadolint/hadolint` (`https://github.com/hadolint/hadolint`; public
  GPL-3.0; 12,185 stars; 495 forks; updated 2026-06-01T09:57:49Z).
  Compared with `wagoodman/dive`,
  `GoogleContainerTools/container-structure-test`, and `bridgecrewio/checkov`;
  selected Hadolint for Dockerfile AST linting, ShellCheck-backed RUN review,
  project config, ignored rules, severity/failure thresholds, trusted
  registries, label schemas, output formats, pre-commit, and CI integration
  patterns. Cloned ignored external source to
  `research/external-src/hadolint-hadolint` and inspected README,
  integration docs, pre-commit hook metadata, and Docker docs without executing
  external source.
- 2026-06-04: RED container readiness smoke generated
  `/tmp/repotutor-container-red-studies.B1NoYh/2026-06-04/local__simple-ts-app__main__3583b1c4`;
  old build was missing `analysis/container-readiness-report.json`,
  `markdown/container-readiness.md`, and `html/container-readiness.html`, and
  `open --target container-readiness` failed as expected.
- 2026-06-04: Implemented Hadolint-style container readiness report:
  `ContainerReadinessReportSchema`, `analysis/container-readiness-report.json`,
  `markdown/container-readiness.md`, `html/container-readiness.html`,
  Dockerfile and Compose summaries, config signals, instruction risk queue,
  label policy, integration signals, recommended commands,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target container-readiness`.
- 2026-06-04: GREEN container readiness smoke generated
  `/tmp/repotutor-container-green-studies.27lWGI/2026-06-04/local__simple-ts-app__main__3583b1c4`;
  confirmed `verificationCheckedRequiredArtifacts=117`, Dockerfiles 0,
  Compose files 0, config signals 0, instruction risks 15, label policies 7,
  integration signals 9, recommended commands 5, risk queue 2,
  `container-card`, `data-source-pattern="Hadolint"`,
  manifest/learning-path entries, and `open --target container-readiness` ->
  `html/container-readiness.html`.
- 2026-06-04: Verification for Upgrade 139:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 37/37 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 139:
  - `ea6ec44` container readiness report

- 2026-06-04: AutoResearch Upgrade 140 candidate selected:
  `biomejs/biome` (`https://github.com/biomejs/biome`; public Apache-2.0/MIT;
  24,817 stars; 1,014 forks; updated 2026-06-03T22:12:06Z). Compared with
  `eslint/eslint`, `prettier/prettier`, and `oxc-project/oxc`; selected Biome
  for its unified formatter, linter, `check`, `ci`, config, assist/source
  action, diagnostics, editor/LSP, and safe write workflow. Cloned ignored
  external source to `research/external-src/biomejs-biome` and inspected
  README, `.biome.json`, GitHub workflow/config files, package scripts, and
  e2e config fixtures without executing external source.
- 2026-06-04: RED code quality smoke generated
  `/tmp/repotutor-code-quality-red-studies.99eopw/2026-06-04/local__simple-ts-app__main__80547f82`;
  old build was missing `analysis/code-quality-report.json`,
  `markdown/code-quality.md`, and `html/code-quality.html`, and
  `open --target code-quality` failed as expected.
- 2026-06-04: Implemented Biome-style code quality report:
  `CodeQualityReportSchema`, `analysis/code-quality-report.json`,
  `markdown/code-quality.md`, `html/code-quality.html`, tool configs,
  formatter signals, linter signals, assist signals, CI/editor signals,
  language coverage, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target code-quality`.
- 2026-06-04: GREEN code quality smoke generated
  `/tmp/repotutor-code-quality-green-studies.jk8kVy/2026-06-04/local__simple-ts-app__main__80547f82`;
  confirmed `verificationCheckedRequiredArtifacts=120`, tool configs 0,
  formatter signals 7, linter signals 9, assist signals 5, CI/editor signals
  8, language coverage 8, recommended commands 5, risk queue 7,
  `code-quality-card`, `data-source-pattern="Biome"`,
  manifest/learning-path entries, and `open --target code-quality` ->
  `html/code-quality.html`.
- 2026-06-04: Verification for Upgrade 140:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 38/38 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 140:
  - `0567acb` code quality report

- 2026-06-04: AutoResearch Upgrade 141 candidate selected:
  `facebook/docusaurus` (`https://github.com/facebook/docusaurus`; public
  MIT; 65,096 stars; 9,917 forks; updated 2026-06-02T18:49:20Z). Compared
  with `vuejs/vitepress`, `withastro/starlight`, and `mkdocs/mkdocs`;
  selected Docusaurus for docs/blog/pages, MDX, `docusaurus.config`,
  sidebars, themeConfig navbar/footer, i18n, docs versioning, search,
  build/serve/deploy, and hosted preview patterns. Cloned ignored external
  source to `research/external-src/facebook-docusaurus` and inspected README,
  `AGENTS.md`, `website/docusaurus.config.ts`, `website/sidebars.ts`,
  website docs/blog/page examples, package scripts, workflow/config files, and
  deploy docs without executing external source.
- 2026-06-04: RED documentation smoke generated
  `/tmp/repotutor-docs-red-studies.h7VvU7/2026-06-04/local__simple-ts-app__main__27a15351`;
  old build was missing `analysis/documentation-report.json`,
  `markdown/documentation.md`, and `html/documentation.html`, and
  `open --target documentation` failed as expected.
- 2026-06-04: Implemented Docusaurus-style documentation readiness report:
  `DocumentationReportSchema`, `analysis/documentation-report.json`,
  `markdown/documentation.md`, `html/documentation.html`, site configs,
  content surfaces, navigation signals, quality signals, localization
  signals, release signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target documentation`.
- 2026-06-04: GREEN documentation smoke generated
  `/tmp/repotutor-docs-green-studies.qnhIhx/2026-06-04/local__simple-ts-app__main__27a15351`;
  confirmed `verificationCheckedRequiredArtifacts=123`, site configs 0,
  content surfaces 7, navigation signals 6, quality signals 8, localization
  signals 5, release signals 7, recommended commands 5, risk queue 1,
  `documentation-card`, `data-source-pattern="Docusaurus"`,
  manifest/learning-path entries, and `open --target documentation` ->
  `html/documentation.html`.
- 2026-06-04: Verification for Upgrade 141:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 39/39 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 141:
  - `c8dd6e4` documentation readiness report

- 2026-06-04: AutoResearch Upgrade 142 candidate selected:
  `prisma/prisma` (`https://github.com/prisma/prisma`; public Apache-2.0;
  46,060 stars; 2,234 forks; updated 2026-06-03T16:29:53Z). Compared with
  `drizzle-team/drizzle-orm`, `typeorm/typeorm`, and `sequelize/sequelize`;
  selected Prisma for schema.prisma, datasource/generator/model blocks,
  `prisma.config`, migrations, generate/db push workflows, Prisma Client,
  driver adapters, `DATABASE_URL`, seed scripts, and local database services.
  Cloned ignored external source to `research/external-src/prisma-prisma` and
  inspected README, `AGENTS.md`, schema/config fixtures, package scripts,
  migration fixtures, seed utilities, and docker compose files without
  executing external source.
- 2026-06-04: RED database readiness smoke generated
  `/tmp/repotutor-database-red-studies.I6noIN/2026-06-04/local__simple-ts-app__main__3afacc02`;
  old build was missing `analysis/database-readiness-report.json`,
  `markdown/database-readiness.md`, and `html/database-readiness.html`, and
  `open --target database-readiness` failed as expected.
- 2026-06-04: Implemented Prisma-style database readiness report:
  `DatabaseReadinessReportSchema`, `analysis/database-readiness-report.json`,
  `markdown/database-readiness.md`, `html/database-readiness.html`, schema
  files, datasource signals, migration signals, client signals, config
  signals, model signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target database-readiness`.
- 2026-06-04: GREEN database readiness smoke generated
  `/tmp/repotutor-database-green-studies.XJ1CF2/2026-06-04/local__simple-ts-app__main__3afacc02`;
  confirmed `verificationCheckedRequiredArtifacts=126`, schema files 0,
  datasource signals 7, migration signals 8, client signals 7, config signals
  7, model signals 9, recommended commands 7, risk queue 1, `database-card`,
  `data-source-pattern="Prisma"`, manifest/learning-path entries, and
  `open --target database-readiness` -> `html/database-readiness.html`.
- 2026-06-04: Verification for Upgrade 142:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 40/40 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 142:
  - `17c6b5f` database readiness report

- 2026-06-04: AutoResearch Upgrade 143 candidate selected:
  `github/docs` (`https://github.com/github/docs`; public CC-BY-4.0; 20,395
  stars; 67,331 forks; updated 2026-06-04T00:02:00Z). Compared with
  `actions/starter-workflows`, `nektos/act`, and
  `step-security/harden-runner`; selected GitHub Docs for official GitHub
  Actions workflow syntax, trigger events, jobs, permissions, `GITHUB_TOKEN`,
  OIDC, cache/artifact, concurrency, environments, and deployment guidance.
  Cloned sparse ignored external source to `research/external-src/github-docs`
  and inspected Actions docs/reusables without executing external source.
- 2026-06-04: RED CI/CD readiness smoke generated
  `/tmp/repotutor-cicd-red-studies.kYsdLH/2026-06-04/local__simple-ts-app__main__c83f7d20`;
  old build was missing `analysis/ci-cd-report.json`, `markdown/ci-cd.md`,
  and `html/ci-cd.html`, and `open --target ci-cd` failed as expected.
- 2026-06-04: Implemented GitHub Actions-style CI/CD readiness report:
  `CiCdReportSchema`, `analysis/ci-cd-report.json`, `markdown/ci-cd.md`,
  `html/ci-cd.html`, workflow files, trigger signals, job signals, security
  signals, delivery signals, platform signals, recommended commands, risk
  queue, manifest/session-verification coverage, learning-path linkage, and
  `open --target ci-cd`.
- 2026-06-04: GREEN CI/CD readiness smoke generated
  `/tmp/repotutor-cicd-green-studies.S3BdhY/2026-06-04/local__simple-ts-app__main__c83f7d20`;
  confirmed `verificationCheckedRequiredArtifacts=129`, workflow files 0,
  trigger signals 8, job signals 11, security signals 8, delivery signals 8,
  platform signals 8, recommended commands 6, risk queue 2, `ci-cd-card`,
  `data-source-pattern="GitHub Actions"`, manifest/learning-path entries, and
  `open --target ci-cd` -> `html/ci-cd.html`.
- 2026-06-04: Verification for Upgrade 143:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 41/41 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 143:
  - `ee68545` CI/CD readiness report

- 2026-06-04: AutoResearch Upgrade 144 candidate selected:
  `vitest-dev/vitest` (`https://github.com/vitest-dev/vitest`; public MIT;
  16,625 stars; 1,799 forks; updated 2026-06-04T00:58:09Z). Compared with
  `jestjs/jest`, `mochajs/mocha`, and `avajs/ava`; selected Vitest for
  test file/config discovery, expect/assert assertions, snapshots, `vi`
  mocks/spies/fake timers, v8/istanbul coverage, jsdom/happy-dom/browser
  environments, projects/workspaces, typecheck, UI/reporters, watch/run, and
  sharding. Cloned ignored external source to
  `research/external-src/vitest-dev-vitest` and inspected README, docs, config
  examples, packages, and examples without executing external source.
- 2026-06-04: RED unit test readiness smoke generated
  `/tmp/repotutor-unit-tests-red-studies.Kjl4iU/2026-06-04/local__simple-ts-app__main__78437cc2`;
  old build was missing `analysis/unit-test-report.json`,
  `markdown/unit-tests.md`, and `html/unit-tests.html`, and
  `open --target unit-tests` failed as expected.
- 2026-06-04: Implemented Vitest-style unit test readiness report:
  `UnitTestReportSchema`, `analysis/unit-test-report.json`,
  `markdown/unit-tests.md`, `html/unit-tests.html`, test files, config files,
  assertion signals, mock signals, coverage signals, environment signals,
  reporting signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target unit-tests`.
- 2026-06-04: GREEN unit test readiness smoke generated
  `/tmp/repotutor-unit-tests-green-studies.SERqqs/2026-06-04/local__simple-ts-app__main__78437cc2`;
  confirmed `verificationCheckedRequiredArtifacts=132`, test files 0,
  config files 1, assertion signals 9, mock signals 8, coverage signals 8,
  environment signals 11, reporting signals 11, recommended commands 6, risk
  queue 4, `unit-test-card`, `data-source-pattern="Vitest"`,
  manifest/learning-path entries, and `open --target unit-tests` ->
  `html/unit-tests.html`.
- 2026-06-04: Verification for Upgrade 144:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 42/42 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 144:
  - `bc92f69` unit test readiness report

- 2026-06-04: AutoResearch Upgrade 145 candidate selected:
  `microsoft/TypeScript` (`https://github.com/microsoft/TypeScript`; public
  Apache-2.0; 109,062 stars; 13,430 forks; updated
  2026-06-02T18:17:24Z). Compared with `tsconfig/bases`,
  `typescript-eslint/typescript-eslint`, and `mattpocock/ts-reset`; selected
  TypeScript for authoritative compilerOptions, strict flags, project
  references, moduleResolution, declaration emit, tsconfig root options, and
  `tsc` project/build commands. Cloned ignored external source to
  `research/external-src/microsoft-typescript` and inspected README,
  package scripts, compiler option declarations, compiler types, and config
  fixtures without executing external source.
- 2026-06-04: RED typecheck readiness smoke generated
  `/tmp/repotutor-typecheck-red-studies.Mn1sce/2026-06-04/local__simple-ts-app__main__7dbe8c24`;
  old build was missing `analysis/typecheck-readiness-report.json`,
  `markdown/typecheck-readiness.md`, and `html/typecheck-readiness.html`, and
  `open --target typecheck-readiness` failed as expected.
- 2026-06-04: Implemented TypeScript-style typecheck readiness report:
  `TypecheckReadinessReportSchema`,
  `analysis/typecheck-readiness-report.json`,
  `markdown/typecheck-readiness.md`, `html/typecheck-readiness.html`,
  tsconfig files, compiler option signals, project signals, module resolution
  signals, declaration signals, script signals, recommended commands, risk
  queue, manifest/session-verification coverage, learning-path linkage, and
  `open --target typecheck-readiness`.
- 2026-06-04: GREEN typecheck readiness smoke generated
  `/tmp/repotutor-typecheck-green-studies.6zrl4P/2026-06-04/local__simple-ts-app__main__7dbe8c24`;
  confirmed `verificationCheckedRequiredArtifacts=135`, tsconfig files 0,
  compiler option signals 13, project signals 10, module resolution signals
  10, declaration signals 7, script signals 7, recommended commands 6, risk
  queue 3, `typecheck-card`, `data-source-pattern="TypeScript"`,
  manifest/learning-path entries, and `open --target typecheck-readiness` ->
  `html/typecheck-readiness.html`.
- 2026-06-04: Verification for Upgrade 145:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 43/43 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 145:
  - `20224a5` typecheck readiness report

- 2026-06-04: AutoResearch Upgrade 146 candidate selected:
  `pnpm/pnpm` (`https://github.com/pnpm/pnpm`; public MIT; 35,358 stars;
  1,475 forks; updated 2026-06-04T02:33:19Z). Compared with `npm/cli`,
  `yarnpkg/berry`, and `oven-sh/bun`; selected pnpm for package-manager
  choice, deterministic lockfiles, monorepo workspaces, package include/exclude
  globs, catalogs, build-script policy, audit config, packageManager/devEngines,
  lifecycle hooks, recursive/filter commands, and frozen-lockfile installs.
  Cloned ignored external source to `research/external-src/pnpm-pnpm` and
  inspected README, package metadata, workspace file, lockfile, and `.pnpmfile`
  without executing external source.
- 2026-06-04: RED package-manager readiness smoke generated
  `/tmp/repotutor-package-manager-red-studies.8KT87t/2026-06-04/local__simple-ts-app__main__9651bbfc`;
  old build was missing `analysis/package-manager-report.json`,
  `markdown/package-manager.md`, and `html/package-manager.html`, and
  `open --target package-manager` failed as expected.
- 2026-06-04: Implemented pnpm-style package-manager readiness report:
  `PackageManagerReportSchema`, `analysis/package-manager-report.json`,
  `markdown/package-manager.md`, `html/package-manager.html`, manifest files,
  workspace signals, lockfile signals, script signals, policy signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target package-manager`.
- 2026-06-04: GREEN package-manager readiness smoke generated
  `/tmp/repotutor-package-manager-green-studies.OjoTZl/2026-06-04/local__simple-ts-app__main__9651bbfc`;
  confirmed `verificationCheckedRequiredArtifacts=138`, manifest files 1,
  workspace signals 8, lockfile signals 0, script signals 11, policy signals
  10, recommended commands 6, risk queue 3, `package-manager-card`,
  `data-source-pattern="pnpm"`, manifest/learning-path entries, and
  `open --target package-manager` -> `html/package-manager.html`.
- 2026-06-04: Verification for Upgrade 146:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 44/44 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 146:
  - `f5abe94` package manager readiness report

- 2026-06-04: AutoResearch Upgrade 147 candidate selected:
  `typicode/husky` (`https://github.com/typicode/husky`; public MIT;
  35,122 stars; 1,086 forks; updated 2026-03-19T23:03:16Z). Compared with
  `lint-staged/lint-staged`, `conventional-changelog/commitlint`, and
  `pre-commit/pre-commit`; selected Husky for .husky hook files, prepare
  install scripts, Git `core.hooksPath`, pre-commit/pre-push/commit-msg
  policy, `HUSKY=0` and `--no-verify` bypass semantics, CI skip handling,
  GUI/Node PATH mitigation, POSIX shell hooks, and lint-staged handoff.
  Cloned ignored external source to `research/external-src/typicode-husky`
  and inspected docs, package metadata, implementation, and tests without
  executing external source.
- 2026-06-04: RED Git hooks readiness smoke generated
  `/tmp/repotutor-git-hooks-red-studies.o0Mw9c/2026-06-04/local__simple-ts-app__main__9d91477c`;
  old build was missing `analysis/git-hooks-report.json`,
  `markdown/git-hooks.md`, and `html/git-hooks.html`, and
  `open --target git-hooks` failed as expected.
- 2026-06-04: Implemented Husky-style Git hooks readiness report:
  `GitHooksReportSchema`, `analysis/git-hooks-report.json`,
  `markdown/git-hooks.md`, `html/git-hooks.html`, hook files, install signals,
  command signals, policy signals, tool config files, recommended commands,
  risk queue, manifest/session-verification coverage, learning-path linkage,
  nav entry for package-manager/git-hooks, and `open --target git-hooks`.
- 2026-06-04: GREEN Git hooks readiness smoke generated
  `/tmp/repotutor-git-hooks-green-studies.OiRXQ5/2026-06-04/local__simple-ts-app__main__9d91477c`;
  confirmed `verificationCheckedRequiredArtifacts=141`, hook files 0,
  install signals 6, command signals 11, policy signals 9, tool config files
  0, recommended commands 6, risk queue 3, `git-hooks-card`,
  `data-source-pattern="Husky"`, manifest/learning-path entries,
  `node-entrypoint=external`, and `open --target git-hooks` ->
  `html/git-hooks.html`.
- 2026-06-04: Verification for Upgrade 147:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 45/45 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 147:
  - `d505f24` git hooks readiness report

- 2026-06-04: AutoResearch Upgrade 148 candidate selected:
  `vercel/turborepo` (`https://github.com/vercel/turborepo`; public MIT;
  30,491 stars; 2,356 forks; updated 2026-06-03T21:05:38Z). Compared with
  `nrwl/nx`, `moonrepo/moon`, and `go-task/task`; selected Turborepo for
  `turbo.json` tasks, `dependsOn` workspace ordering, cache `outputs`/`inputs`,
  cache-disabled and persistent tasks, remote cache/env boundaries,
  package scripts, dry-run/summarize/daemon/prune commands, and filter-based
  task selection. Cloned ignored external source to
  `research/external-src/vercel-turborepo` and inspected README, package
  metadata, root/example/cli turbo configs, docs, and examples without
  executing external source. Tracked-file count for
  `research/external-src/vercel-turborepo` returned `0`.
- 2026-06-04: RED task-runner readiness smoke generated
  `/tmp/repotutor-task-runner-red-studies.mmx6dc/2026-06-04/local__simple-ts-app__main__3a9e7dbd`;
  old build was missing `analysis/task-runner-report.json`,
  `markdown/task-runner.md`, and `html/task-runner.html`, and
  `open --target task-runner` failed as expected.
- 2026-06-04: Implemented Turborepo-style task-runner readiness report:
  `TaskRunnerReportSchema`, `analysis/task-runner-report.json`,
  `markdown/task-runner.md`, `html/task-runner.html`, config files, task
  signals, cache signals, dependency signals, environment signals, package
  script signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry
  for package-manager/git-hooks/task-runner, and `open --target task-runner`.
- 2026-06-04: GREEN task-runner readiness smoke generated
  `/tmp/repotutor-task-runner-green-studies.IXhmGC/2026-06-04/local__simple-ts-app__main__3a9e7dbd`;
  confirmed `verificationCheckedRequiredArtifacts=144`, config files 0,
  task signals 8, cache signals 7, dependency signals 6, environment signals
  6, package script signals 6, recommended commands 6, risk queue 2,
  `task-runner-card`, `data-source-pattern="Turborepo"`,
  manifest/learning-path entries, and `open --target task-runner` ->
  `html/task-runner.html`.
- 2026-06-04: Verification for Upgrade 148:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 46/46 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 148:
  - `29e858d` task runner readiness report

- 2026-06-04: AutoResearch Upgrade 149 candidate selected:
  `renovatebot/renovate` (`https://github.com/renovatebot/renovate`; public;
  AGPL-3.0-only from repo license file; 21,684 stars; 3,089 forks; updated
  2026-06-04T05:03:37Z). Compared with `dependabot/dependabot-core`,
  `renovatebot/github-action`, and `googleapis/release-please`; selected
  Renovate for dependency-update config, presets, `packageRules`, automerge,
  schedules, dependency dashboard approval, manager/package-file discovery,
  registry/private package policy, rate limits, range strategy, and config
  migration. Cloned ignored external source to
  `research/external-src/renovatebot-renovate` and inspected README, license,
  package metadata, `renovate.json`, config docs, config validator, and
  examples without executing external source. Tracked-file count for
  `research/external-src/renovatebot-renovate` returned `0`.
- 2026-06-04: RED dependency-updates readiness smoke generated
  `/tmp/repotutor-dependency-updates-red-studies.AFZpPj/2026-06-04/local__simple-ts-app__main__95221a2c`;
  old build was missing `analysis/dependency-update-report.json`,
  `markdown/dependency-updates.md`, and `html/dependency-updates.html`, and
  `open --target dependency-updates` failed as expected.
- 2026-06-04: Implemented Renovate-style dependency-updates readiness report:
  `DependencyUpdateReportSchema`, `analysis/dependency-update-report.json`,
  `markdown/dependency-updates.md`, `html/dependency-updates.html`, config
  files, manager signals, policy signals, workflow signals, registry signals,
  package file signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target dependency-updates`.
- 2026-06-04: GREEN dependency-updates readiness smoke generated
  `/tmp/repotutor-dependency-updates-green-studies.7fSpWZ/2026-06-04/local__simple-ts-app__main__95221a2c`;
  confirmed `verificationCheckedRequiredArtifacts=147`, config files 0,
  manager signals 9, policy signals 11, workflow signals 8, registry signals
  5, package file signals 12, recommended commands 6, risk queue 2,
  `package-json=ready`, `npm=ready`, `dependency-update-card`,
  `data-source-pattern="Renovate"`, manifest/learning-path entries, and
  `open --target dependency-updates` -> `html/dependency-updates.html`.
- 2026-06-04: Verification for Upgrade 149:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 47/47 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 149:
  - `4646abb` dependency updates readiness report

- 2026-06-04: AutoResearch Upgrade 150 candidate selected:
  `eslint/eslint` (`https://github.com/eslint/eslint`; public; MIT from
  cloned license/package metadata; 27,265 stars; 5,017 forks; updated
  2026-06-04T01:32:13Z). Compared with `biomejs/biome`,
  `oxc-project/oxc`, and `standard/standard`; selected ESLint for flat config,
  rules/plugins/parser boundaries, ignores, inline disables, formatter/output
  controls, fix/cache/max-warnings workflows, config inspection, and package
  script handoff. Cloned ignored external source to
  `research/external-src/eslint-eslint` and inspected README, license,
  package metadata, flat config, CLI options, docs, and tests without
  executing external source. Tracked-file count for
  `research/external-src/eslint-eslint` returned `0`.
- 2026-06-04: RED lint-readiness smoke generated
  `/tmp/repotutor-lint-readiness-red-studies.zVyVO1/2026-06-04/local__simple-ts-app__main__a0316049`;
  old build was missing `analysis/lint-readiness-report.json`,
  `markdown/lint-readiness.md`, and `html/lint-readiness.html`, and
  `open --target lint-readiness` failed as expected.
- 2026-06-04: Implemented ESLint-style lint readiness report:
  `LintReadinessReportSchema`, `analysis/lint-readiness-report.json`,
  `markdown/lint-readiness.md`, `html/lint-readiness.html`, config files,
  rule signals, script signals, scope signals, output signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, nav entry, and
  `open --target lint-readiness`.
- 2026-06-04: GREEN lint-readiness smoke generated
  `/tmp/repotutor-lint-readiness-green-studies.mTm9Eq/2026-06-04/local__simple-ts-app__main__a0316049`;
  confirmed `verificationCheckedRequiredArtifacts=150`, config files 0,
  rule signals 11, script signals 9, scope signals 7, output signals 7,
  package signals 7, recommended commands 6, risk queue 3,
  `formatter=ready`, `typescript=ready`, manifest/learning-path entries, and
  `open --target lint-readiness` -> `html/lint-readiness.html`.
- 2026-06-04: Verification for Upgrade 150:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 48/48 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 150:
  - `218f9ad` lint readiness report

- 2026-06-04: AutoResearch Upgrade 151 candidate selected:
  `prettier/prettier` (`https://github.com/prettier/prettier`; public MIT;
  51,899 stars; 4,743 forks; updated 2026-06-04T04:26:21Z). Compared with
  `dprint/dprint`, `biomejs/biome`, and `standard/standard`; selected
  Prettier for formatter config discovery, `.prettierignore`, option signals,
  parser/plugin boundaries, safe `--check`/`--list-different` gates,
  `--write` risk, cache strategy, `.editorconfig`, file-info, and config-path
  handoff. Cloned ignored external source to
  `research/external-src/prettier-prettier` and inspected README, license,
  package metadata, CLI/config/ignore/plugins docs, and CLI option definitions
  without executing external source. Tracked-file count for
  `research/external-src/prettier-prettier` returned `0`.
- 2026-06-04: RED format-readiness smoke generated
  `/tmp/repotutor-format-readiness-red-studies.nssQ2F/2026-06-04/local__simple-ts-app__main__dacdd6d6`;
  old build was missing `analysis/format-readiness-report.json`,
  `markdown/format-readiness.md`, and `html/format-readiness.html`, and
  `open --target format-readiness` failed as expected.
- 2026-06-04: Implemented Prettier-style format readiness report:
  `FormatReadinessReportSchema`, `analysis/format-readiness-report.json`,
  `markdown/format-readiness.md`, `html/format-readiness.html`, config files,
  ignore files, option signals, script signals, scope signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, nav entry, and
  `open --target format-readiness`.
- 2026-06-04: GREEN format-readiness smoke generated
  `/tmp/repotutor-format-readiness-green-studies.UUtaMX/2026-06-04/local__simple-ts-app__main__dacdd6d6`;
  confirmed `verificationCheckedRequiredArtifacts=153`, config files 0,
  ignore files 0, option signals 10, script signals 9, scope signals 8,
  package signals 6, recommended commands 6, risk queue 2,
  `javascript=ready`, `typescript=ready`, `json=ready`,
  manifest/learning-path entries, and `open --target format-readiness` ->
  `html/format-readiness.html`.
- 2026-06-04: Verification for Upgrade 151:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 49/49 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 151:
  - `75db1b2` format readiness report

- 2026-06-04: AutoResearch Upgrade 152 candidate selected:
  `conventional-changelog/commitlint`
  (`https://github.com/conventional-changelog/commitlint`; public MIT;
  18,572 stars; 963 forks; updated 2026-06-03T17:02:48Z). Compared with
  `conventional-changelog/conventional-changelog`, `changesets/changesets`,
  and `semantic-release/semantic-release`; selected commitlint for
  Conventional Commit config discovery, `@commitlint/config-conventional`
  rule defaults, `parserPreset`, `type(scope?): subject` shape,
  commit-message hooks, CI range checks, edit/last commit commands, verbose
  diagnostics, strict mode, prompts, and commitizen handoff. Cloned ignored
  external source to `research/external-src/conventional-changelog-commitlint`
  and inspected README, license, package metadata, config docs, CLI docs,
  rules docs, prompt config, and CI workflow without executing external
  source. Tracked-file count for
  `research/external-src/conventional-changelog-commitlint` returned `0`.
- 2026-06-04: RED commit-conventions smoke generated
  `/tmp/repotutor-commit-conventions-red-studies.qnxgrW/2026-06-04/local__simple-ts-app__main__48d2a74a`;
  old build was missing `analysis/commit-conventions-report.json`,
  `markdown/commit-conventions.md`, and `html/commit-conventions.html`, and
  `open --target commit-conventions` failed as expected.
- 2026-06-04: Implemented commitlint-style commit-conventions report:
  `CommitConventionReportSchema`, `analysis/commit-conventions-report.json`,
  `markdown/commit-conventions.md`, `html/commit-conventions.html`, config
  files, rule signals, hook signals, command signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, nav entry, and `open --target commit-conventions`.
- 2026-06-04: GREEN commit-conventions smoke generated
  `/tmp/repotutor-commit-conventions-green-studies.lQ5POD/2026-06-04/local__simple-ts-app__main__48d2a74a`;
  confirmed `verificationCheckedRequiredArtifacts=156`, config files 0,
  rule signals 11, hook signals 7, command signals 8, package signals 6,
  recommended commands 6, risk queue 2, no false-positive ready
  `type-enum` signal on the simple fixture, manifest/learning-path entries,
  and `open --target commit-conventions` -> `html/commit-conventions.html`.
- 2026-06-04: Verification for Upgrade 152:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 50/50 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 152:
  - `743e68c` commit convention report

- 2026-06-04: AutoResearch Upgrade 153 candidate selected:
  `changesets/changesets` (`https://github.com/changesets/changesets`;
  public MIT; 11,936 stars; 791 forks; updated 2026-06-02T21:11:56Z).
  Compared with `conventional-changelog/conventional-changelog`,
  `semantic-release/semantic-release`, and `googleapis/release-please`;
  selected Changesets for release-intent markdown files, changelog config,
  `status` checks, version PRs, publish/tag handoff, prerelease/snapshot
  policy, fixed/linked packages, internal dependency updates, access/private
  package policy, bot/action automation, and monorepo-focused release notes.
  Cloned ignored external source to `research/external-src/changesets-changesets`
  and inspected README, license, config docs, command docs, automation docs,
  checking docs, package metadata, and package changelog helpers without
  executing external source. Clone HEAD was `18e1661`; tracked-file count for
  `research/external-src/changesets-changesets` returned `0`.
- 2026-06-04: RED changelog-readiness smoke generated
  `/tmp/repotutor-changelog-readiness-red-studies.zoN99g/2026-06-04/local__simple-ts-app__main__6fe1d17b`;
  old build was missing `analysis/changelog-readiness-report.json`,
  `markdown/changelog-readiness.md`, and `html/changelog-readiness.html`, and
  `open --target changelog-readiness` failed as expected.
- 2026-06-04: Implemented Changesets-style changelog-readiness report:
  `ChangelogReadinessReportSchema`,
  `analysis/changelog-readiness-report.json`,
  `markdown/changelog-readiness.md`, `html/changelog-readiness.html`, config
  files, changeset files, workflow signals, command signals, package signals,
  policy signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target changelog-readiness`.
- 2026-06-04: GREEN changelog-readiness smoke generated
  `/tmp/repotutor-changelog-readiness-green-studies.KZxOaK/2026-06-04/local__simple-ts-app__main__6fe1d17b`;
  confirmed `verificationCheckedRequiredArtifacts=159`, config files 0,
  changeset files 0, workflow signals 7, command signals 10, package signals
  6, policy signals 9, recommended commands 6, risk queue 2,
  manifest/learning-path entries, and `open --target changelog-readiness` ->
  `html/changelog-readiness.html`.
- 2026-06-04: Verification for Upgrade 153:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 51/51 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 153:
  - `ff0522e` changelog readiness report

- 2026-06-04: AutoResearch Upgrade 154 candidate selected:
  `webpack/webpack-bundle-analyzer`
  (`https://github.com/webpack/webpack-bundle-analyzer`; public MIT;
  12,667 stars; 504 forks; updated 2026-05-20T11:27:07Z). Compared with
  `btd/rollup-plugin-visualizer`, `vitejs/vite`, and
  `danvk/source-map-explorer`; selected Webpack Bundle Analyzer for stats JSON
  bundle composition, zoomable treemap reporting, `analyzerMode`,
  `reportFilename`, `defaultSizes`, gzip/Brotli/Zstandard size modes, source
  maps, chunk visibility, bundle directory handoff, and trusted analyzer CLI
  commands. Cloned ignored external source to
  `research/external-src/webpack-webpack-bundle-analyzer` and inspected README,
  license, package metadata, CLI/plugin docs, examples, and source layout
  without executing external source. Clone HEAD was `9ba43c7`; tracked-file
  count for `research/external-src/webpack-webpack-bundle-analyzer` returned
  `0`.
- 2026-06-04: RED bundle-analysis smoke generated
  `/tmp/repotutor-bundle-analysis-red-studies.7oWjQJ/2026-06-04/local__simple-ts-app__main__419a1930`;
  old build was missing `analysis/bundle-analysis-report.json`,
  `markdown/bundle-analysis.md`, and `html/bundle-analysis.html`, and
  `open --target bundle-analysis` failed as expected.
- 2026-06-04: Implemented Webpack Bundle Analyzer-style bundle-analysis report:
  `BundleAnalysisReportSchema`, `analysis/bundle-analysis-report.json`,
  `markdown/bundle-analysis.md`, `html/bundle-analysis.html`, config files,
  bundle artifacts, size signals, script signals, package signals, recommended
  commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, nav entry, and `open --target bundle-analysis`.
- 2026-06-04: GREEN bundle-analysis smoke generated
  `/tmp/repotutor-bundle-analysis-green-studies.l4dWOy/2026-06-04/local__simple-ts-app__main__419a1930`;
  confirmed `verificationCheckedRequiredArtifacts=162`, config files 0,
  bundle artifacts 0, size signals 10, script signals 7, package signals 6,
  recommended commands 6, risk queue 2, manifest/learning-path entries, and
  `open --target bundle-analysis` -> `html/bundle-analysis.html`.
- 2026-06-04: Verification for Upgrade 154:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 52/52 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 154:
  - `7af6246` bundle analysis report

- 2026-06-04: AutoResearch Upgrade 155 candidate selected: `mswjs/msw`
  (`https://github.com/mswjs/msw`; public MIT; 17,971 stars; 620 forks;
  updated 2026-05-15T16:46:30Z). Compared with `nock/nock`,
  `pact-foundation/pact-js`, and `wiremock/wiremock`; selected MSW for
  JavaScript/TypeScript API mocking because it directly models request
  handlers, `setupWorker`, `setupServer`, HTTP/GraphQL/WebSocket handlers,
  `HttpResponse`, unhandled request policy, passthrough/bypass, lifecycle
  cleanup, and shared browser/Node mock definitions. Cloned ignored external
  source to `research/external-src/mswjs-msw` and inspected README, license,
  package metadata, source layout, Node/browser setup files, test typings, and
  lifecycle helpers without executing external source. Clone HEAD was
  `8a19d54`; tracked-file count for `research/external-src/mswjs-msw`
  returned `0`.
- 2026-06-04: RED mocking-readiness smoke generated
  `/tmp/repotutor-mocking-readiness-red-studies.K4N4Nd/2026-06-04/local__simple-ts-app__main__398ff3ee`;
  old build was missing `analysis/mocking-readiness-report.json`,
  `markdown/mocking-readiness.md`, and `html/mocking-readiness.html`, and
  `open --target mocking-readiness` failed as expected.
- 2026-06-04: Implemented MSW-style mocking-readiness report:
  `MockingReadinessReportSchema`,
  `analysis/mocking-readiness-report.json`,
  `markdown/mocking-readiness.md`, `html/mocking-readiness.html`, handler
  files, setup surfaces, protocol signals, lifecycle signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, nav entry, and `open --target mocking-readiness`.
- 2026-06-04: GREEN mocking-readiness smoke generated
  `/tmp/repotutor-mocking-readiness-green-studies.3l2NAd/2026-06-04/local__simple-ts-app__main__398ff3ee`;
  confirmed `verificationCheckedRequiredArtifacts=165`, handler files 0,
  server setups 0, protocol signals 9, lifecycle signals 10, package signals
  6, recommended commands 6, risk queue 2, manifest/learning-path entries,
  and `open --target mocking-readiness` -> `html/mocking-readiness.html`.
- 2026-06-04: Verification for Upgrade 155:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 53/53 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 155:
  - `09b903a` mocking readiness report

- 2026-06-04: AutoResearch Upgrade 156 candidate selected:
  `TanStack/query` (`https://github.com/TanStack/query`; public MIT; 49,582
  stars; 3,862 forks; updated 2026-06-04T06:14:40Z). Compared with
  `vercel/swr`, `axios/axios`, and `sindresorhus/ky`; selected TanStack Query
  because it directly models server-state/data-fetching readiness: `QueryClient`,
  provider boundaries, query hooks, query keys/functions, mutations,
  invalidation, cache timing, retry/enabled controls, hydration, persistence,
  focus/online managers, and devtools. Cloned ignored external source to
  `research/external-src/tanstack-query` and inspected README, license,
  package metadata, docs/reference, package source layout, and examples without
  executing external source. Clone HEAD was `c4b39ff`; tracked-file count for
  `research/external-src/tanstack-query` returned `0`.
- 2026-06-04: RED data-fetching-readiness smoke generated
  `/tmp/repotutor-data-fetching-red-studies.fd8btT/2026-06-04/local__simple-ts-app__main__db6e89f5`;
  old build was missing `analysis/data-fetching-readiness-report.json`,
  `markdown/data-fetching-readiness.md`, and
  `html/data-fetching-readiness.html`, and
  `open --target data-fetching-readiness` failed as expected.
- 2026-06-04: Implemented TanStack Query-style data-fetching-readiness report:
  `DataFetchingReadinessReportSchema`,
  `analysis/data-fetching-readiness-report.json`,
  `markdown/data-fetching-readiness.md`,
  `html/data-fetching-readiness.html`, client setups, query usages, cache
  signals, data-flow signals, package signals, recommended commands, risk
  queue, manifest/session-verification coverage, learning-path linkage, nav
  entry, and `open --target data-fetching-readiness`.
- 2026-06-04: GREEN data-fetching-readiness smoke generated
  `/tmp/repotutor-data-fetching-green-studies.4dPN9V/2026-06-04/local__simple-ts-app__main__db6e89f5`;
  confirmed `verificationCheckedRequiredArtifacts=168`, client setups 0,
  query usages 0, cache signals 10, data-flow signals 10, package signals 7,
  recommended commands 6, risk queue 2, manifest/learning-path entries, and
  `open --target data-fetching-readiness` ->
  `html/data-fetching-readiness.html`.
- 2026-06-04: Verification for Upgrade 156:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 54/54 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 156:
  - `a1884b8` data fetching readiness report

- 2026-06-04: AutoResearch Upgrade 157 candidate selected:
  `remix-run/react-router` (`https://github.com/remix-run/react-router`;
  public MIT; 56,440 stars; 10,860 forks; updated
  2026-06-03T21:31:33Z). Compared with `TanStack/router`, `vercel/next.js`,
  and `vuejs/router`; selected React Router because it directly models
  route/navigation readiness across declarative, data, and framework modes:
  `BrowserRouter`, `createBrowserRouter`, `RouterProvider`, `routes.ts`,
  `route`, `index`, `Link`, `NavLink`, `Outlet`, `loader`, `action`,
  `ErrorBoundary`, `useNavigate`, `useParams`, and `useSearchParams`. Cloned
  ignored external source to `research/external-src/remix-run-react-router` and
  inspected README, license, package metadata, docs, route conventions, data
  loading, navigation blocking, and source/tests without executing external
  source. Clone HEAD was `2c22bcb`; tracked-file count for
  `research/external-src/remix-run-react-router` returned `0`.
- 2026-06-04: RED routing-readiness smoke generated
  `/tmp/repotutor-routing-readiness-red-studies.DvaPVY/2026-06-04/local__simple-ts-app__main__55dd6154`;
  old build was missing `analysis/routing-readiness-report.json`,
  `markdown/routing-readiness.md`, and `html/routing-readiness.html`, and
  `open --target routing-readiness` failed as expected.
- 2026-06-04: Implemented React Router-style routing-readiness report:
  `RoutingReadinessReportSchema`,
  `analysis/routing-readiness-report.json`,
  `markdown/routing-readiness.md`, `html/routing-readiness.html`, routing
  setups, route definitions, navigation signals, data-route signals, file-route
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target routing-readiness`.
- 2026-06-04: GREEN routing-readiness smoke generated
  `/tmp/repotutor-routing-readiness-green-studies.g5BKxB/2026-06-04/local__simple-ts-app__main__55dd6154`;
  confirmed `verificationCheckedRequiredArtifacts=171`, routing setups 0,
  route definitions 0, navigation signals 10, data-route signals 11,
  file-route signals 9, package signals 7, recommended commands 6, risk queue
  2, manifest/learning-path entries, and `open --target routing-readiness` ->
  `html/routing-readiness.html`.
- 2026-06-04: Verification for Upgrade 157:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 55/55 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 157:
  - `833ea28` routing readiness report

- 2026-06-04: AutoResearch Upgrade 158 candidate selected:
  `reduxjs/redux-toolkit` (`https://github.com/reduxjs/redux-toolkit`;
  public MIT; 11,216 stars; 1,266 forks; updated
  2026-06-02T21:26:33Z). Compared with `pmndrs/zustand`,
  `pmndrs/jotai`, and `mobxjs/mobx`; selected Redux Toolkit because it
  directly models client state-management readiness: `configureStore`,
  `createSlice`, reducers, actions, selectors, `Provider`, `useSelector`,
  `useDispatch`, `createAsyncThunk`, `createListenerMiddleware`,
  `createEntityAdapter`, middleware/devTools, and optional RTK Query. Cloned
  ignored external source to `research/external-src/reduxjs-redux-toolkit` and
  inspected README, license, package metadata, docs, usage guides, API docs,
  and RTK Query overview without executing external source. Clone HEAD was
  `7c49510`; tracked-file count for
  `research/external-src/reduxjs-redux-toolkit` returned `0`.
- 2026-06-04: RED state-management-readiness smoke generated
  `/tmp/repotutor-state-management-red-studies.4nPyHI/2026-06-04/local__simple-ts-app__main__e6abe9b6`;
  old build was missing `analysis/state-management-readiness-report.json`,
  `markdown/state-management-readiness.md`, and
  `html/state-management-readiness.html`, and
  `open --target state-management-readiness` failed as expected.
- 2026-06-04: Implemented Redux Toolkit-style state-management-readiness
  report: `StateManagementReadinessReportSchema`,
  `analysis/state-management-readiness-report.json`,
  `markdown/state-management-readiness.md`,
  `html/state-management-readiness.html`, store setups, slice definitions,
  selector signals, side-effect signals, entity signals, middleware signals,
  RTK Query signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target state-management-readiness`.
- 2026-06-04: GREEN state-management-readiness smoke generated
  `/tmp/repotutor-state-management-green-studies.Kt67k1/2026-06-04/local__simple-ts-app__main__e6abe9b6`;
  confirmed `verificationCheckedRequiredArtifacts=174`, store setups 0,
  slice definitions 0, selector signals 6, side-effect signals 8, entity
  signals 6, middleware signals 8, RTK Query signals 8, package signals 7,
  recommended commands 6, risk queue 2, manifest/learning-path entries, and
  `open --target state-management-readiness` ->
  `html/state-management-readiness.html`.
- 2026-06-04: Verification for Upgrade 158:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 56/56 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 158:
  - `05c5b41` state management readiness report

- 2026-06-04: AutoResearch Upgrade 159 candidate selected:
  `react-hook-form/react-hook-form`
  (`https://github.com/react-hook-form/react-hook-form`; public MIT; 44,754
  stars; 2,408 forks; updated 2026-06-04T06:47:19Z). Compared with
  `jaredpalmer/formik`, `TanStack/form`, and `colinhacks/zod`; selected React
  Hook Form because it directly models form readiness: `useForm`, `register`,
  `handleSubmit`, `Controller`, `FormProvider`, `useFormContext`,
  `useFieldArray`, validation rules, schema resolvers, `formState.errors`,
  default values, value helpers, and package signals. Cloned ignored external
  source to `research/external-src/react-hook-form-react-hook-form` and
  inspected README, license, package metadata, examples, and package source
  without executing external source. Clone HEAD was `6a501e0`;
  tracked-file count for
  `research/external-src/react-hook-form-react-hook-form` returned `0`.
- 2026-06-04: RED form-readiness smoke generated
  `/tmp/repotutor-form-readiness-red-studies.t4Op5n/2026-06-04/local__simple-ts-app__main__e86e1089`;
  old build was missing `analysis/form-readiness-report.json`,
  `markdown/form-readiness.md`, and `html/form-readiness.html`, and
  `open --target form-readiness` failed as expected.
- 2026-06-04: Implemented React Hook Form-style form-readiness report:
  `FormReadinessReportSchema`, `analysis/form-readiness-report.json`,
  `markdown/form-readiness.md`, `html/form-readiness.html`, form setups, field
  registrations, validation signals, error signals, value-flow signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, nav entry, and `open --target
  form-readiness`.
- 2026-06-04: GREEN form-readiness smoke generated
  `/tmp/repotutor-form-readiness-green-studies.v0vTVE/2026-06-04/local__simple-ts-app__main__e86e1089`;
  confirmed `verificationCheckedRequiredArtifacts=177`, form setups 0, field
  registrations 0, validation signals 11, error signals 9, value-flow signals
  10, package signals 7, recommended commands 6, risk queue 2,
  manifest/learning-path entries, and `open --target form-readiness` ->
  `html/form-readiness.html`.
- 2026-06-04: Verification for Upgrade 159:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 57/57 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 159:
  - `c1dc796` form readiness report

- 2026-06-04: AutoResearch Upgrade 160 candidate selected:
  `nextauthjs/next-auth` (`https://github.com/nextauthjs/next-auth`;
  public ISC; 28,268 stars; 4,039 forks; updated
  2026-06-04T05:12:37Z). Compared with `better-auth/better-auth`,
  `clerk/javascript`, and `auth0/nextjs-auth0`; selected Auth.js/NextAuth
  because it directly models authentication readiness: `NextAuth`, `auth`,
  `handlers`, providers, callbacks, sessions, JWT/database strategy,
  middleware, protected routes, env secrets, adapters, `signIn`, `signOut`,
  `useSession`, and `SessionProvider`. Cloned ignored external source to
  `research/external-src/nextauthjs-next-auth` and inspected README, license,
  package metadata, examples, docs, and package source without executing
  external source. Clone HEAD was `dab3cfb`; tracked-file count for
  `research/external-src/nextauthjs-next-auth` returned `0`.
- 2026-06-04: RED auth-readiness smoke generated
  `/tmp/repotutor-auth-readiness-red-studies.2vFU8G/2026-06-04/local__simple-ts-app__main__9e34bd67`;
  old build was missing `analysis/auth-readiness-report.json`,
  `markdown/auth-readiness.md`, and `html/auth-readiness.html`, and
  `open --target auth-readiness` failed as expected.
- 2026-06-04: Implemented Auth.js-style auth-readiness report:
  `AuthReadinessReportSchema`, `analysis/auth-readiness-report.json`,
  `markdown/auth-readiness.md`, `html/auth-readiness.html`, auth setups,
  session surfaces, protection signals, provider signals, callback signals,
  credential signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target auth-readiness`.
- 2026-06-04: GREEN auth-readiness smoke generated
  `/tmp/repotutor-auth-readiness-green-studies.GUbWzS/2026-06-04/local__simple-ts-app__main__9e34bd67`;
  confirmed `verificationCheckedRequiredArtifacts=180`, auth setups 0,
  session surfaces 0, protection signals 7, provider signals 7, callback
  signals 8, credential signals 8, package signals 6, recommended commands 6,
  risk queue 2, manifest/learning-path entries, and
  `open --target auth-readiness` -> `html/auth-readiness.html`.
- 2026-06-04: Verification for Upgrade 160:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 58/58 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 160:
  - `870ff07` auth readiness report

- 2026-06-04: AutoResearch Upgrade 161 candidate selected:
  `stripe/stripe-node` (`https://github.com/stripe/stripe-node`; public MIT;
  4,430 stars; 908 forks; updated 2026-06-03T11:34:15Z). Compared with
  `stripe/stripe-js`, `stripe/react-stripe-js`, and
  `stripe-samples/checkout-single-subscription`; selected Stripe Node because
  it directly models server-side payment readiness: `new Stripe`, secret-key
  setup, `apiVersion`, Checkout Sessions, PaymentIntents, subscriptions,
  customers, invoices, billing portal, webhooks, `constructEvent`, raw body,
  signature verification, idempotency, price/product IDs, currency, and
  quantity assumptions. Cloned ignored external source to
  `research/external-src/stripe-stripe-node` and inspected README, license,
  package metadata, webhook helpers, config surfaces, and resource files
  without executing external source. Clone HEAD was `23f097e`; tracked-file
  count for `research/external-src/stripe-stripe-node` returned `0`.
- 2026-06-04: RED payment-readiness smoke generated
  `/tmp/repotutor-payment-readiness-red-studies.D5t0yw/2026-06-04/local__simple-ts-app__main__5e1943ff`;
  old build was missing `analysis/payment-readiness-report.json`,
  `markdown/payment-readiness.md`, and `html/payment-readiness.html`, and
  `open --target payment-readiness` failed as expected.
- 2026-06-04: Implemented Stripe-style payment-readiness report:
  `PaymentReadinessReportSchema`, `analysis/payment-readiness-report.json`,
  `markdown/payment-readiness.md`, `html/payment-readiness.html`, payment
  setups, checkout signals, webhook signals, customer/billing signals,
  credential signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target payment-readiness`.
- 2026-06-04: GREEN payment-readiness smoke generated
  `/tmp/repotutor-payment-readiness-green-studies.esOBKP/2026-06-04/local__simple-ts-app__main__5e1943ff`;
  confirmed `verificationCheckedRequiredArtifacts=183`, payment setups 0,
  checkout signals 8, webhook signals 8, customer signals 8, credential
  signals 7, package signals 6, risk queue 2, manifest/learning-path entries,
  and `open --target payment-readiness` -> `html/payment-readiness.html`.
- 2026-06-04: Verification for Upgrade 161:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 59/59 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 161:
  - `1950bf9` payment readiness report

- 2026-06-04: AutoResearch Upgrade 162 candidate selected:
  `resend/resend-node` (`https://github.com/resend/resend-node`; public MIT;
  913 stars; 81 forks; updated 2026-06-03T05:02:14Z). Compared with
  `nodemailer/nodemailer`, `sendgrid/sendgrid-nodejs`, and
  `mailgun/mailgun.js`; selected Resend Node because it directly models
  transactional email readiness: `new Resend`, `RESEND_API_KEY`, `emails.send`,
  `batch.send`, `domains.verify`, `webhooks.verify`, `standardwebhooks`,
  `from`, `to`, `replyTo`, `subject`, `text`, `html`, `react`, attachments,
  template rendering, idempotency, contacts, broadcasts, and delivery events.
  Cloned ignored external source to `research/external-src/resend-resend-node`
  and inspected README, license, package metadata, client setup, email, batch,
  domains, and webhook source without executing external source. Clone HEAD
  was `965ed8e`; tracked-file count for
  `research/external-src/resend-resend-node` returned `0`.
- 2026-06-04: RED email-readiness smoke generated
  `/tmp/repotutor-email-readiness-red-studies.zZn54X/2026-06-04/local__simple-ts-app__main__5680bc48`;
  old build was missing `analysis/email-readiness-report.json`,
  `markdown/email-readiness.md`, and `html/email-readiness.html`, and
  `open --target email-readiness` failed as expected.
- 2026-06-04: Implemented Resend-style email-readiness report:
  `EmailReadinessReportSchema`, `analysis/email-readiness-report.json`,
  `markdown/email-readiness.md`, `html/email-readiness.html`, email setups,
  recipient/content signals, delivery signals, template signals, credential
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target email-readiness`.
- 2026-06-04: GREEN email-readiness smoke generated
  `/tmp/repotutor-email-readiness-green-studies.y0zWlS/2026-06-04/local__simple-ts-app__main__5680bc48`;
  confirmed `verificationCheckedRequiredArtifacts=186`, email setups 0,
  recipient signals 12, delivery signals 11, template signals 6, credential
  signals 10, package signals 7, risk queue 2, manifest/learning-path entries,
  and `open --target email-readiness` -> `html/email-readiness.html`.
- 2026-06-04: Verification for Upgrade 162:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 60/60 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 162:
  - `7c492ad` email readiness report

- 2026-06-04: AutoResearch Upgrade 163 candidate selected:
  `taskforcesh/bullmq` (`https://github.com/taskforcesh/bullmq`; public MIT;
  8,964 stars; 626 forks; updated 2026-06-04T07:43:54Z). Compared with
  `OptimalBits/bull`, `graphile/worker`, and `breejs/bree`; selected BullMQ
  because it directly models Redis-backed queue readiness: `Queue`, `Worker`,
  `QueueEvents`, `FlowProducer`, `JobScheduler`, `queue.add`, `addBulk`,
  repeat/delay/priority/job IDs, attempts/backoff, completed/failed/stalled
  events, Redis connection configuration, concurrency, limiter, metrics, and
  telemetry. Cloned ignored external source to
  `research/external-src/taskforcesh-bullmq` and inspected README, license,
  package metadata, queue, worker, flow, job-options, and worker-options source
  without executing external source. Clone HEAD was `3fe7cb1`; tracked-file
  count for `research/external-src/taskforcesh-bullmq` returned `0`.
- 2026-06-04: RED queue-readiness smoke generated
  `/tmp/repotutor-queue-readiness-red-studies.sY3u5L/2026-06-04/local__simple-ts-app__main__794225dd`;
  old build was missing `analysis/queue-readiness-report.json`,
  `markdown/queue-readiness.md`, and `html/queue-readiness.html`, and
  `open --target queue-readiness` failed as expected.
- 2026-06-04: Implemented BullMQ-style queue-readiness report:
  `QueueReadinessReportSchema`, `analysis/queue-readiness-report.json`,
  `markdown/queue-readiness.md`, `html/queue-readiness.html`, queue setups,
  producer signals, worker signals, reliability signals, Redis connection
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target queue-readiness`.
- 2026-06-04: GREEN queue-readiness smoke generated
  `/tmp/repotutor-queue-readiness-green-studies.eOVjto/2026-06-04/local__simple-ts-app__main__794225dd`;
  confirmed `verificationCheckedRequiredArtifacts=189`, queue setups 0,
  producer signals 9, worker signals 9, reliability signals 10, connection
  signals 8, package signals 8, risk queue 2, manifest/learning-path entries,
  and `open --target queue-readiness` -> `html/queue-readiness.html`.
- 2026-06-04: Verification for Upgrade 163:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 61/61 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 163:
  - `15f1afa` queue readiness report

- 2026-06-04: AutoResearch Upgrade 164 candidate selected:
  `redis/node-redis` (`https://github.com/redis/node-redis`; public MIT;
  17,534 stars; 1,957 forks; updated 2026-06-04T07:39:03Z). Compared with
  `redis/ioredis`, `upstash/redis-js`, and `jaredwray/keyv`; selected
  Node Redis because it directly models cache readiness: `createClient`,
  `.connect()`, `get`, `set`, `EX`, `NX`, `expire`, `ttl`, `del`, `mGet`,
  `mSet`, `scanIterator`, `multi`, `watch`, `clientSideCache`, `RESP`,
  socket/TLS/reconnect configuration, `isReady`, `isOpen`, Pub/Sub, pool,
  cluster/sentinel, and telemetry. Cloned ignored external source to
  `research/external-src/redis-node-redis` and inspected README, license,
  package metadata, docs, examples, and package source without executing
  external source. Clone HEAD was `8ce181c`; tracked-file count for
  `research/external-src/redis-node-redis` returned `0`.
- 2026-06-04: RED cache-readiness smoke generated
  `/tmp/repotutor-cache-readiness-red-studies.lHw6Bj/2026-06-04/local__simple-ts-app__main__fcae1d44`;
  old build was missing `analysis/cache-readiness-report.json`,
  `markdown/cache-readiness.md`, and `html/cache-readiness.html`, and
  `open --target cache-readiness` failed as expected.
- 2026-06-04: Implemented Node Redis-style cache-readiness report:
  `CacheReadinessReportSchema`, `analysis/cache-readiness-report.json`,
  `markdown/cache-readiness.md`, `html/cache-readiness.html`, cache setups,
  operation signals, policy signals, connection signals, advanced signals,
  package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target cache-readiness`.
- 2026-06-04: GREEN cache-readiness smoke generated
  `/tmp/repotutor-cache-readiness-green-studies.RoIWl1/2026-06-04/local__simple-ts-app__main__fcae1d44`;
  confirmed `verificationCheckedRequiredArtifacts=192`, cache setups 0,
  operation signals 9, policy signals 9, connection signals 9, advanced
  signals 9, package signals 7, risk queue 2, manifest/learning-path entries,
  and `open --target cache-readiness` -> `html/cache-readiness.html`.
- 2026-06-04: Verification for Upgrade 164:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 62/62 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 164:
  - `dc6f56d` cache readiness report

- 2026-06-04: AutoResearch Upgrade 165 candidate selected:
  `pinojs/pino` (`https://github.com/pinojs/pino`; public MIT;
  17,911 stars; 958 forks; updated 2026-06-04T03:01:27Z). Compared with
  `winstonjs/winston`, `fastify/fastify`, and `getsentry/sentry-javascript`;
  selected Pino because it directly models structured JSON logging readiness:
  `pino()`, `logger.info`, `logger.error`, child loggers, bindings, level
  policy, transports, destinations, redaction, serializers, `pino-pretty`,
  multistream, timestamps, formatters, mixins, async worker-thread transports,
  and flush behavior. Cloned ignored external source to
  `research/external-src/pinojs-pino` and inspected README, license, package
  metadata, docs, examples, and tests without executing external source. Clone
  HEAD was `ff0dc5c`; tracked-file count for
  `research/external-src/pinojs-pino` returned `0`.
- 2026-06-04: RED logging-readiness smoke generated
  `/tmp/repotutor-logging-readiness-red-studies.fMi67e/2026-06-04/local__simple-ts-app__main__633408e3`;
  old build was missing `analysis/logging-readiness-report.json`,
  `markdown/logging-readiness.md`, and `html/logging-readiness.html`, and
  `open --target logging-readiness` failed as expected.
- 2026-06-04: Implemented Pino-style logging-readiness report:
  `LoggingReadinessReportSchema`, `analysis/logging-readiness-report.json`,
  `markdown/logging-readiness.md`, `html/logging-readiness.html`, logging
  setups, level signals, context signals, safety signals, transport signals,
  package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target logging-readiness`.
- 2026-06-04: GREEN logging-readiness smoke generated
  `/tmp/repotutor-logging-readiness-green-studies.q38b5b/2026-06-04/local__simple-ts-app__main__633408e3`;
  confirmed `verificationCheckedRequiredArtifacts=195`, logging setups 0,
  level signals 8, context signals 8, safety signals 7, transport signals 8,
  package signals 7, risk queue 2, manifest/learning-path entries, and
  `open --target logging-readiness` -> `html/logging-readiness.html`.
- 2026-06-04: Verification for Upgrade 165:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 63/63 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 165:
  - `c5a9c47` logging readiness report

- 2026-06-04: AutoResearch Upgrade 166 candidate selected:
  `open-feature/js-sdk` (`https://github.com/open-feature/js-sdk`; public
  Apache-2.0; 269 stars; 63 forks; updated 2026-06-02T11:57:25Z). Compared
  with `Unleash/unleash`, `growthbook/growthbook`, and
  `launchdarkly/js-client-sdk`; selected OpenFeature because it directly models
  vendor-neutral feature flag readiness: `OpenFeature`, `setProviderAndWait`,
  `setProvider`, `getClient`, boolean/string/number/object evaluations,
  details calls, `EvaluationContext`, `targetingKey`, hooks, events, tracking,
  shutdown, domains, React provider/hooks, Nest context factory, and
  `MultiProvider`. Cloned ignored external source to
  `research/external-src/open-feature-js-sdk` and inspected README, package
  metadata, server/web/react docs, and source hits without executing external
  source. Clone HEAD was `3854c5f`; tracked-file count for
  `research/external-src/open-feature-js-sdk` returned `0`.
- 2026-06-04: RED feature-flag-readiness smoke generated
  `/tmp/repotutor-feature-flag-readiness-red-studies.vGPC88/2026-06-04/local__simple-ts-app__main__0de5b192`;
  old build was missing `analysis/feature-flag-readiness-report.json`,
  `markdown/feature-flag-readiness.md`, and
  `html/feature-flag-readiness.html`, and `open --target
  feature-flag-readiness` failed as expected.
- 2026-06-04: Implemented OpenFeature-style feature-flag-readiness report:
  `FeatureFlagReadinessReportSchema`,
  `analysis/feature-flag-readiness-report.json`,
  `markdown/feature-flag-readiness.md`,
  `html/feature-flag-readiness.html`, feature-flag setups, evaluation signals,
  context signals, lifecycle signals, package signals, recommended commands,
  risk queue, manifest/session-verification coverage, learning-path linkage,
  nav entry, and `open --target feature-flag-readiness`.
- 2026-06-04: GREEN feature-flag-readiness smoke generated
  `/tmp/repotutor-feature-flag-readiness-green-studies.w2DAtE/2026-06-04/local__simple-ts-app__main__0de5b192`;
  confirmed `verificationCheckedRequiredArtifacts=198`, feature flag setups
  0, evaluation signals 8, context signals 8, lifecycle signals 8, package
  signals 8, risk queue 2, manifest/learning-path entries, and `open --target
  feature-flag-readiness` -> `html/feature-flag-readiness.html`.
- 2026-06-04: Verification for Upgrade 166:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 64/64 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 166:
  - `1926092` feature flag readiness report

- 2026-06-04: AutoResearch Upgrade 167 candidate selected:
  `animir/node-rate-limiter-flexible`
  (`https://github.com/animir/node-rate-limiter-flexible`; public ISC;
  3,552 stars; 189 forks; updated 2026-06-03T21:18:56Z). Compared with
  `express-rate-limit/express-rate-limit`, `fastify/fastify-rate-limit`, and
  `upstash/ratelimit-js`; selected `rate-limiter-flexible` because it directly
  models generic, store-backed rate-limit readiness: `RateLimiterMemory`,
  `RateLimiterRedis`, `points`, `duration`, `blockDuration`, `keyPrefix`,
  `storeClient`, `consume`, `penalty`, `reward`, `insuranceLimiter`,
  `msBeforeNext`, `remainingPoints`, `Retry-After`, `X-RateLimit-*`,
  in-memory block, queue wrappers, and Redis/Valkey/Mongo/Postgres/MySQL/
  SQLite/Prisma/Memcached/DynamoDB stores. Cloned ignored external source to
  `research/external-src/animir-node-rate-limiter-flexible` and inspected
  README, license, package metadata, lib, wrappers, and tests without
  executing external source. Clone HEAD was `3c9c826`; tracked-file count for
  `research/external-src/animir-node-rate-limiter-flexible` returned `0`.
- 2026-06-04: RED rate-limit-readiness smoke generated
  `/tmp/repotutor-rate-limit-readiness-red-studies.eBKq0F/2026-06-04/local__simple-ts-app__main__9732f9ec`;
  old build was missing `analysis/rate-limit-readiness-report.json`,
  `markdown/rate-limit-readiness.md`, and
  `html/rate-limit-readiness.html`, and `open --target rate-limit-readiness`
  failed as expected.
- 2026-06-04: Implemented rate-limiter-flexible-style
  rate-limit-readiness report: `RateLimitReadinessReportSchema`,
  `analysis/rate-limit-readiness-report.json`,
  `markdown/rate-limit-readiness.md`, `html/rate-limit-readiness.html`,
  rate-limit setups, quota signals, identity signals, store signals, response
  signals, resilience signals, package signals, recommended commands, risk
  queue, manifest/session-verification coverage, learning-path linkage, nav
  entry, and `open --target rate-limit-readiness`.
- 2026-06-04: GREEN rate-limit-readiness smoke generated
  `/tmp/repotutor-rate-limit-readiness-green-studies.ShKmIf/2026-06-04/local__simple-ts-app__main__9732f9ec`;
  confirmed `verificationCheckedRequiredArtifacts=201`, rate-limit setups 0,
  quota signals 8, identity signals 8, store signals 10, response signals 8,
  resilience signals 8, package signals 6, risk queue 2,
  manifest/learning-path entries, and `open --target rate-limit-readiness` ->
  `html/rate-limit-readiness.html`.
- 2026-06-04: Verification for Upgrade 167:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 65/65 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 167:
  - `ec321f0` rate limit readiness report

- 2026-06-04: AutoResearch Upgrade 168 candidate selected:
  `getsentry/sentry-javascript`
  (`https://github.com/getsentry/sentry-javascript`; public MIT; 8,662
  stars; 1,777 forks; updated 2026-06-03T19:49:45Z). Compared with
  `open-telemetry/opentelemetry-js`, `rollbar/rollbar.js`, and
  `bugsnag/bugsnag-js`; selected Sentry JavaScript because it directly models
  production error-tracking readiness: `Sentry.init`, DSN setup, early
  instrumentation, `captureException`, `captureMessage`, `captureEvent`,
  `ErrorBoundary`, `reactErrorHandler`, breadcrumbs, `withScope`, `setUser`,
  `setContext`, `setTag`, `beforeSend`, `beforeBreadcrumb`, `ignoreErrors`,
  URL filters, `sendDefaultPii`, `tracesSampleRate`,
  `tracePropagationTargets`, replay, profiling, and feedback integrations.
  Cloned ignored external source to
  `research/external-src/getsentry-sentry-javascript` and inspected README,
  package metadata, browser/node/react docs, and source hits without executing
  external source. Clone HEAD was `983fbac`; tracked-file count for
  `research/external-src/getsentry-sentry-javascript` returned `0`.
- 2026-06-04: RED error-tracking-readiness smoke generated
  `/tmp/repotutor-error-tracking-readiness-red-studies.9MpSbM/2026-06-04/local__simple-ts-app__main__9e64e605`;
  old build was missing `analysis/error-tracking-readiness-report.json`,
  `markdown/error-tracking-readiness.md`, and
  `html/error-tracking-readiness.html`, and `open --target
  error-tracking-readiness` failed as expected.
- 2026-06-04: Implemented Sentry-style error-tracking-readiness report:
  `ErrorTrackingReadinessReportSchema`,
  `analysis/error-tracking-readiness-report.json`,
  `markdown/error-tracking-readiness.md`,
  `html/error-tracking-readiness.html`, error-tracking setups, capture
  signals, context signals, filtering signals, observability signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, nav entry, and `open --target
  error-tracking-readiness`.
- 2026-06-04: GREEN error-tracking-readiness smoke generated
  `/tmp/repotutor-error-tracking-readiness-green-studies.Wzf5W4/2026-06-04/local__simple-ts-app__main__9e64e605`;
  confirmed `verificationCheckedRequiredArtifacts=204`, error-tracking setups
  0, capture signals 7, context signals 7, filtering signals 7, observability
  signals 7, package signals 7, risk queue 2, manifest/learning-path entries,
  and `open --target error-tracking-readiness` ->
  `html/error-tracking-readiness.html`.
- 2026-06-04: Verification for Upgrade 168:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 66/66 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 168:
  - `dec711d` error tracking readiness report

- 2026-06-04: AutoResearch Upgrade 169 candidate selected:
  `PostHog/posthog-js`
  (`https://github.com/PostHog/posthog-js`; public; GitHub licenseInfo key
  `other`; 545 stars; 263 forks; updated 2026-06-03T23:19:22Z). Compared
  with `segmentio/analytics-next`, `amplitude/Amplitude-TypeScript`, and
  `mixpanel/mixpanel-js`; selected PostHog JavaScript because it directly
  models product analytics readiness: `posthog.init`, `PostHogProvider`,
  `posthog.capture`, `posthog.identify`, `posthog.reset`, groups, feature flag
  hooks, feature payloads, SSR/bootstrap flags, session recording, consent,
  opt-in/opt-out controls, and `before_send` filtering. Cloned ignored external
  source to `research/external-src/PostHog-posthog-js` and inspected README,
  package metadata, browser/react/node docs, examples, hooks, and type/source
  hits without executing external source. Clone HEAD was `76a2d6b`;
  tracked-file count for `research/external-src/PostHog-posthog-js` returned
  `0`.
- 2026-06-04: RED analytics-readiness smoke generated
  `/tmp/repotutor-analytics-readiness-red-studies.eLChGX/2026-06-04/local__simple-ts-app__main__f9e07776`;
  old build was missing `analysis/analytics-readiness-report.json`,
  `markdown/analytics-readiness.md`, and `html/analytics-readiness.html`, and
  `open --target analytics-readiness` failed as expected.
- 2026-06-04: Implemented PostHog-style analytics-readiness report:
  `AnalyticsReadinessReportSchema`,
  `analysis/analytics-readiness-report.json`,
  `markdown/analytics-readiness.md`, `html/analytics-readiness.html`,
  analytics setups, event signals, identity signals, privacy signals, product
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target analytics-readiness`.
- 2026-06-04: GREEN analytics-readiness smoke generated
  `/tmp/repotutor-analytics-readiness-green-studies.2zbfvL/2026-06-04/local__simple-ts-app__main__f9e07776`;
  confirmed `verificationCheckedRequiredArtifacts=207`, analytics setups 0,
  event signals 7, identity signals 7, privacy signals 7, product signals 7,
  package signals 8, risk queue 2, and `open --target analytics-readiness` ->
  `html/analytics-readiness.html`.
- 2026-06-04: Verification for Upgrade 169:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 67/67 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 169:
  - `3e2e592` analytics readiness report

- 2026-06-04: AutoResearch Upgrade 170 candidate selected:
  `sindresorhus/got`
  (`https://github.com/sindresorhus/got`; public; MIT; 14,910 stars; 988
  forks; updated 2026-06-03T07:51:29Z). Compared with `axios/axios`,
  `unjs/ofetch`, and `sindresorhus/ky`; selected Got because it directly
  models HTTP client readiness: request methods, `got.extend`, `prefixUrl`,
  `searchParams`, `responseType`, `resolveBodyOnly`, timeout blocks, retry
  limits/methods/status codes, `Retry-After`, hooks, metadata errors, agents,
  cache, HTTP/2, proxies, cookies, Unix sockets, and pagination. Cloned ignored
  external source to `research/external-src/sindresorhus-got` and inspected
  README, package metadata, docs, examples, source hits, and tests without
  executing external source. Clone HEAD was `a5b76bf`; tracked-file count for
  `research/external-src/sindresorhus-got` returned `0`.
- 2026-06-04: RED http-client-readiness smoke generated
  `/tmp/repotutor-http-client-readiness-red-studies.lFCvAE/2026-06-04/local__simple-ts-app__main__b9061c6d`;
  old build was missing `analysis/http-client-readiness-report.json`,
  `markdown/http-client-readiness.md`, and
  `html/http-client-readiness.html`, and `open --target
  http-client-readiness` failed as expected.
- 2026-06-04: Implemented Got-style http-client-readiness report:
  `HttpClientReadinessReportSchema`,
  `analysis/http-client-readiness-report.json`,
  `markdown/http-client-readiness.md`,
  `html/http-client-readiness.html`, HTTP client setups, request signals,
  resilience signals, configuration signals, transport signals, error signals,
  package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target http-client-readiness`.
- 2026-06-04: GREEN http-client-readiness smoke generated
  `/tmp/repotutor-http-client-readiness-green-studies.H96obf/2026-06-04/local__simple-ts-app__main__b9061c6d`;
  confirmed `verificationCheckedRequiredArtifacts=210`, HTTP client setups 0,
  request signals 7, resilience signals 7, configuration signals 7, transport
  signals 7, error signals 7, package signals 7, risk queue 2, all three new
  artifacts, and `open --target http-client-readiness` ->
  `html/http-client-readiness.html`.
- 2026-06-04: Verification for Upgrade 170:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 68/68 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 170:
  - `76a490f` HTTP client readiness report

- 2026-06-04: AutoResearch Upgrade 171 candidate selected:
  `colinhacks/zod`
  (`https://github.com/colinhacks/zod`; public; MIT; 42,860 stars; 1,995
  forks; updated 2026-06-04T08:39:38Z). Compared with `jquense/yup`,
  `ajv-validator/ajv`, and `gcanti/io-ts`; selected Zod because it directly
  models TypeScript-first schema validation readiness: schema shapes,
  parse/safeParse, async parsing, inferred input/output types, refinements,
  transforms, coercion, defaults, error issues/formatting, Standard Schema, and
  JSON Schema conversion. Cloned ignored external source to
  `research/external-src/colinhacks-zod` and inspected README, package
  metadata, source files, tests, and docs without executing external source.
  Clone HEAD was `bbc68f9`; tracked-file count for
  `research/external-src/colinhacks-zod` returned `0`.
- 2026-06-04: RED schema-validation-readiness smoke generated
  `/tmp/repotutor-schema-validation-readiness-red-studies.oR7uY4/2026-06-04/local__simple-ts-app__main__ad85b95b`;
  old build was missing `analysis/schema-validation-readiness-report.json`,
  `markdown/schema-validation-readiness.md`, and
  `html/schema-validation-readiness.html`, and `open --target
  schema-validation-readiness` failed as expected.
- 2026-06-04: Implemented Zod-style schema-validation-readiness report:
  `SchemaValidationReadinessReportSchema`,
  `analysis/schema-validation-readiness-report.json`,
  `markdown/schema-validation-readiness.md`,
  `html/schema-validation-readiness.html`, schema setups, shape signals, parser
  signals, type signals, refinement signals, error signals, integration
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target schema-validation-readiness`.
- 2026-06-04: GREEN schema-validation-readiness smoke generated
  `/tmp/repotutor-schema-validation-readiness-green-studies.BirGH0/2026-06-04/local__simple-ts-app__main__ad85b95b`;
  confirmed `verificationCheckedRequiredArtifacts=213`, schema setups 0, shape
  signals 9, parser signals 7, type signals 6, refinement signals 7, error
  signals 7, integration signals 7, package signals 8, risk queue 2, all three
  new artifacts, and `open --target schema-validation-readiness` ->
  `html/schema-validation-readiness.html`.
- 2026-06-04: Verification for Upgrade 171:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 69/69 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 171:
  - `657d543` schema validation readiness report

- 2026-06-04: AutoResearch Upgrade 172 candidate selected:
  `moment/luxon`
  (`https://github.com/moment/luxon`; public; MIT; 16,407 stars; 775 forks;
  updated 2026-06-04T08:21:13Z). Compared with `date-fns/date-fns`,
  `iamkun/dayjs`, and `moment/moment`; selected Luxon because it directly
  models DateTime, Duration, Interval, Zone, locale, ISO parsing, formatting,
  timezone, and validity concepts. Cloned ignored external source to
  `research/external-src/moment-luxon` and inspected README, package metadata,
  docs, source files, and tests without executing external source. Clone HEAD
  was `b6b9d03`; tracked-file count for
  `research/external-src/moment-luxon` returned `0`.
- 2026-06-04: RED datetime-readiness smoke generated
  `/tmp/repotutor-datetime-readiness-red-studies.sv2rO3/2026-06-04/local__simple-ts-app__main__19f4a707`;
  old build was missing `analysis/datetime-readiness-report.json`,
  `markdown/datetime-readiness.md`, and `html/datetime-readiness.html`, and
  `open --target datetime-readiness` failed as expected.
- 2026-06-04: Implemented Luxon-style datetime-readiness report:
  `DateTimeReadinessReportSchema`,
  `analysis/datetime-readiness-report.json`,
  `markdown/datetime-readiness.md`, `html/datetime-readiness.html`,
  DateTime setups, construction signals, parsing signals, formatting signals,
  zone signals, duration signals, validity signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, nav entry, and `open --target datetime-readiness`.
- 2026-06-04: GREEN datetime-readiness smoke generated
  `/tmp/repotutor-datetime-readiness-green-studies.h6O8Xy/2026-06-04/local__simple-ts-app__main__19f4a707`;
  confirmed `verificationCheckedRequiredArtifacts=216`, DateTime setups 0,
  construction signals 6, parsing signals 6, formatting signals 6, zone
  signals 7, duration signals 7, validity signals 6, package signals 6, risk
  queue 2, all three new artifacts, and `open --target datetime-readiness` ->
  `html/datetime-readiness.html`.
- 2026-06-04: Verification for Upgrade 172:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 70/70 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 172:
  - `1eae77d` datetime readiness report

- 2026-06-04: AutoResearch Upgrade 173 candidate selected:
  `ai/nanoid`
  (`https://github.com/ai/nanoid`; public; MIT; 26,808 stars; 849 forks;
  updated 2026-06-04T09:39:14Z). Compared with `uuidjs/uuid`,
  `paralleldrive/cuid2`, and `ulid/javascript`; selected Nano ID because it
  directly models secure URL-friendly IDs, `customAlphabet`, `customRandom`,
  `urlAlphabet`, random bytes, non-secure fallback, size/alphabet CLI flags,
  collision probability, uniformity, runtime imports, and React key cautions.
  Cloned ignored external source to `research/external-src/ai-nanoid` and
  inspected README, package metadata, type definitions, CLI source, and tests
  without executing external source. Clone HEAD was `78f4a02`; tracked-file
  count for `research/external-src/ai-nanoid` returned `0`.
- 2026-06-04: RED id-generation-readiness smoke generated
  `/tmp/repotutor-id-generation-readiness-red-studies.wP6s6n/2026-06-04/local__simple-ts-app__main__d3a4452c`;
  old build was missing `analysis/id-generation-readiness-report.json`,
  `markdown/id-generation-readiness.md`, and
  `html/id-generation-readiness.html`, and `open --target
  id-generation-readiness` failed as expected.
- 2026-06-04: Implemented Nano ID-style id-generation-readiness report:
  `IdGenerationReadinessReportSchema`,
  `analysis/id-generation-readiness-report.json`,
  `markdown/id-generation-readiness.md`,
  `html/id-generation-readiness.html`, ID generator setups, generation signals,
  entropy signals, alphabet signals, runtime signals, usage signals,
  validation signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target id-generation-readiness`.
- 2026-06-04: GREEN id-generation-readiness smoke generated
  `/tmp/repotutor-id-generation-readiness-green-studies.Rs5B6i/2026-06-04/local__simple-ts-app__main__d3a4452c`;
  confirmed `verificationCheckedRequiredArtifacts=219`, ID generator setups 0,
  generation signals 7, entropy signals 7, alphabet signals 6, runtime signals
  7, usage signals 6, validation signals 6, package signals 5, risk queue 2,
  all three new artifacts, and `open --target id-generation-readiness` ->
  `html/id-generation-readiness.html`.
- 2026-06-04: Verification for Upgrade 173:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 71/71 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 173:
  - `5674be7` ID generation readiness report

- 2026-06-04: AutoResearch Upgrade 174 candidate selected:
  `lovell/sharp`
  (`https://github.com/lovell/sharp`; public; Apache-2.0; 32,275 stars;
  1,412 forks; updated 2026-06-04T08:27:33Z). Compared with `jimp-dev/jimp`,
  `image-js/image-js`, and `imagemin/imagemin`; selected Sharp because it
  directly models image processing readiness: file/buffer/stream/raw input,
  resize, format conversion, metadata, rotation, extraction, compositing,
  output buffers/files, safety limits, performance controls, and libvips/native
  deployment. Cloned ignored external source to
  `research/external-src/lovell-sharp` and inspected README, package metadata,
  docs/source/type/test hits without executing external source. Clone HEAD was
  `7b4c4762`; tracked-file count for
  `research/external-src/lovell-sharp` returned `0`.
- 2026-06-04: RED image-processing-readiness smoke generated
  `/tmp/repotutor-image-processing-readiness-red-studies.wBp0uT/2026-06-04/local__simple-ts-app__main__76adf013`;
  old build was missing `analysis/image-processing-readiness-report.json`,
  `markdown/image-processing-readiness.md`, and
  `html/image-processing-readiness.html`, and `open --target
  image-processing-readiness` failed as expected.
- 2026-06-04: Implemented Sharp-style image-processing-readiness report:
  `ImageProcessingReadinessReportSchema`,
  `analysis/image-processing-readiness-report.json`,
  `markdown/image-processing-readiness.md`,
  `html/image-processing-readiness.html`, image processing setups, input
  signals, transform signals, output signals, safety signals, performance
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target image-processing-readiness`.
- 2026-06-04: GREEN image-processing-readiness smoke generated
  `/tmp/repotutor-image-processing-readiness-green-studies.4YACcH/2026-06-04/local__simple-ts-app__main__76adf013`;
  confirmed `verificationCheckedRequiredArtifacts=222`, image processing
  setups 0, input signals 6, transform signals 7, output signals 7, safety
  signals 6, performance signals 6, package signals 6, risk queue 2, all three
  new artifacts, and `open --target image-processing-readiness` ->
  `html/image-processing-readiness.html`.
- 2026-06-04: Verification for Upgrade 174:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 72/72 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 174:
  - `cd2aef0` image processing readiness report

- 2026-06-04: AutoResearch Upgrade 175 candidate selected:
  `transloadit/uppy`
  (`https://github.com/transloadit/uppy`; public; MIT; 30,804 stars; 2,096
  forks; updated 2026-06-04T07:27:43Z). Compared with
  `react-dropzone/react-dropzone`, `expressjs/multer`, and
  `node-formidable/formidable`; selected Uppy because it directly models file
  upload readiness: browser widgets, drag/drop and file input, restrictions,
  metadata fields, XHR/Tus/S3/Companion transports, progress/status,
  cancellation/retry, and safety boundaries. Cloned ignored external source to
  `research/external-src/transloadit-uppy` and inspected package/source hits
  without executing external source. Clone HEAD was `981fced`; tracked-file
  count for `research/external-src/transloadit-uppy` returned `0`.
- 2026-06-04: RED file-upload-readiness smoke generated
  `/tmp/repotutor-file-upload-red-studies.xbUM4A/2026-06-04/local__simple-ts-app__HEAD__3a16f802`;
  old build was missing `analysis/file-upload-readiness-report.json`,
  `markdown/file-upload-readiness.md`, and
  `html/file-upload-readiness.html`, and `open --target
  file-upload-readiness` failed as expected.
- 2026-06-04: Implemented Uppy-style file-upload-readiness report:
  `FileUploadReadinessReportSchema`,
  `analysis/file-upload-readiness-report.json`,
  `markdown/file-upload-readiness.md`, `html/file-upload-readiness.html`, file
  upload setups, input signals, restriction signals, transport signals,
  lifecycle signals, safety signals, package signals, recommended commands,
  risk queue, manifest/session-verification coverage, learning-path linkage,
  nav entry, and `open --target file-upload-readiness`.
- 2026-06-04: GREEN file-upload-readiness smoke generated
  `/tmp/repotutor-file-upload-green-studies.qXQgki/2026-06-04/local__simple-ts-app__main__3a16f802`;
  confirmed `verificationCheckedRequiredArtifacts=225`, file upload setups 0,
  input signals 6, restriction signals 5, transport signals 6, lifecycle
  signals 6, safety signals 6, package signals 7, risk queue 2, all three new
  artifacts, and `open --target file-upload-readiness` ->
  `html/file-upload-readiness.html`.
- 2026-06-04: Verification for Upgrade 175:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 73/73 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 175:
  - `c051bc2` file upload readiness report

- 2026-06-04: AutoResearch Upgrade 176 candidate selected:
  `websockets/ws`
  (`https://github.com/websockets/ws`; public; MIT; 22,768 stars; 2,552 forks;
  updated 2026-06-03T19:54:55Z). Compared with `socketio/socket.io`,
  `uNetworking/uWebSockets.js`, and `pladaria/reconnecting-websocket`;
  selected `ws` because it directly models WebSocket readiness: server/client
  setup, HTTP upgrade, connection/message/send flow, close/error lifecycle,
  ping/pong heartbeat, backpressure, payload limits, compression, origin
  checks, and auth boundaries. Cloned ignored external source to
  `research/external-src/websockets-ws` and inspected docs/source/test hits
  without executing external source. Clone HEAD was `2120f4c`; tracked-file
  count for `research/external-src/websockets-ws` returned `0`.
- 2026-06-04: RED websocket-readiness smoke generated
  `/tmp/repotutor-websocket-red-studies.WvCrNQ/2026-06-04/local__simple-ts-app__HEAD__a0f10f43`;
  old build was missing `analysis/websocket-readiness-report.json`,
  `markdown/websocket-readiness.md`, and `html/websocket-readiness.html`, and
  `open --target websocket-readiness` failed as expected.
- 2026-06-04: Implemented ws-style websocket-readiness report:
  `WebSocketReadinessReportSchema`,
  `analysis/websocket-readiness-report.json`,
  `markdown/websocket-readiness.md`, `html/websocket-readiness.html`,
  WebSocket setups, connection signals, message signals, lifecycle signals,
  safety signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target websocket-readiness`.
- 2026-06-04: GREEN websocket-readiness smoke generated
  `/tmp/repotutor-websocket-green-studies.hUze7y/2026-06-04/local__simple-ts-app__main__a0f10f43`;
  confirmed `verificationCheckedRequiredArtifacts=228`, WebSocket setups 0,
  connection signals 6, message signals 6, lifecycle signals 6, safety signals
  6, package signals 5, risk queue 2, all three new artifacts, and
  `open --target websocket-readiness` -> `html/websocket-readiness.html`.
- 2026-06-04: Verification for Upgrade 176:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 74/74 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 176:
  - `658177d` websocket readiness report

- 2026-06-04: AutoResearch Upgrade 177 candidate selected:
  `Hopding/pdf-lib`
  (`https://github.com/Hopding/pdf-lib`; public; MIT; 8,488 stars; 888 forks;
  updated 2026-06-03T11:52:27Z). Compared with `foliojs/pdfkit`,
  `diegomura/react-pdf`, and `bpampuch/pdfmake`; selected `pdf-lib` because it
  directly models PDF generation readiness: document creation/loading, page
  composition, text/image drawing, font/image embedding, forms, copy pages,
  save bytes, base64/data URI output, and browser/Node/Deno/RN usage. Cloned
  ignored external source to `research/external-src/Hopding-pdf-lib` and
  inspected README/source/test hits without executing external source. Clone
  HEAD was `93dd36e`; tracked-file count for
  `research/external-src/Hopding-pdf-lib` returned `0`.
- 2026-06-04: RED pdf-generation-readiness smoke generated
  `/tmp/repotutor-pdf-red-studies.mSvlDk/2026-06-04/local__simple-ts-app__HEAD__4cc1bd08`;
  old build was missing `analysis/pdf-generation-readiness-report.json`,
  `markdown/pdf-generation-readiness.md`, and
  `html/pdf-generation-readiness.html`, and `open --target
  pdf-generation-readiness` failed as expected.
- 2026-06-04: Implemented pdf-lib-style pdf-generation-readiness report:
  `PdfGenerationReadinessReportSchema`,
  `analysis/pdf-generation-readiness-report.json`,
  `markdown/pdf-generation-readiness.md`,
  `html/pdf-generation-readiness.html`, PDF generation setups, document
  signals, page signals, asset signals, form signals, output signals, safety
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target pdf-generation-readiness`.
- 2026-06-04: GREEN pdf-generation-readiness smoke generated
  `/tmp/repotutor-pdf-green-studies.gpeFIv/2026-06-04/local__simple-ts-app__main__4cc1bd08`;
  confirmed `verificationCheckedRequiredArtifacts=231`, PDF generation setups
  0, document signals 5, page signals 6, asset signals 6, form signals 5,
  output signals 6, safety signals 6, package signals 5, risk queue 2, all
  three new artifacts, and `open --target pdf-generation-readiness` ->
  `html/pdf-generation-readiness.html`.
- 2026-06-04: Verification for Upgrade 177:
  - `pnpm build`: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 75/75 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 177:
  - `f4e965b` PDF generation readiness report

- 2026-06-04: AutoResearch Upgrade 178 candidate selected:
  `SheetJS/sheetjs`
  (`https://github.com/SheetJS/sheetjs`; public; Apache-2.0; 36,259 stars;
  7,948 forks; updated 2026-06-04T03:36:57Z). Compared with
  `exceljs/exceljs`, `mholt/PapaParse`, and `adaltas/node-csv`; selected
  SheetJS because it directly models spreadsheet/CSV readiness: workbook
  read/write, sheet creation and conversion, CSV/XLSX/ODS/HTML/JSON formats,
  browser/Node output, and spreadsheet safety boundaries. Cloned ignored
  external source to `research/external-src/SheetJS-sheetjs` and inspected
  README/demo hits without executing external source. Clone HEAD was
  `3f44ddd`; tracked-file count for
  `research/external-src/SheetJS-sheetjs` returned `0`.
- 2026-06-04: RED spreadsheet-readiness smoke generated
  `/tmp/repotutor-spreadsheet-red-studies.lNRD8A/2026-06-04/local__simple-ts-app__main__918e9e6a`;
  old build was missing `analysis/spreadsheet-readiness-report.json`,
  `markdown/spreadsheet-readiness.md`, and
  `html/spreadsheet-readiness.html`, and `open --target
  spreadsheet-readiness` failed as expected.
- 2026-06-04: Implemented SheetJS-style spreadsheet-readiness report:
  `SpreadsheetReadinessReportSchema`,
  `analysis/spreadsheet-readiness-report.json`,
  `markdown/spreadsheet-readiness.md`, `html/spreadsheet-readiness.html`,
  spreadsheet setups, workbook signals, sheet signals, format signals, input
  signals, output signals, safety signals, package signals, recommended
  commands, risk queue, manifest/session-verification coverage, learning-path
  linkage, nav entry, and `open --target spreadsheet-readiness`.
- 2026-06-04: GREEN spreadsheet-readiness smoke generated
  `/tmp/repotutor-spreadsheet-green-studies.ZE5rGg/2026-06-04/local__simple-ts-app__main__918e9e6a`;
  confirmed `verificationCheckedRequiredArtifacts=234`, spreadsheet setups 0,
  workbook signals 5, sheet signals 6, format signals 6, input signals 6,
  output signals 6, safety signals 6, package signals 6, risk queue 2, all
  three new artifacts, and `open --target spreadsheet-readiness` ->
  `html/spreadsheet-readiness.html`.
- 2026-06-04: Verification for Upgrade 178:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 76/76 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 178:
  - `9f32cde` spreadsheet readiness report

- 2026-06-04: AutoResearch Upgrade 179 candidate selected:
  `chartjs/Chart.js`
  (`https://github.com/chartjs/Chart.js`; public; MIT; 67,476 stars; 11,948
  forks; updated 2026-06-04T05:49:47Z). Compared with `recharts/recharts`,
  `apache/echarts`, and `d3/d3`; selected Chart.js because it directly models
  chart visualization readiness: chart creation, registration, datasets,
  scales, tooltips, legends, interactions, responsive canvas rendering,
  lifecycle, plugins, decimation, and accessibility/SSR boundaries. Cloned
  ignored external source to `research/external-src/chartjs-Chart.js` and
  inspected docs/source/test hits without executing external source. Clone HEAD
  was `cb02e1d`; tracked-file count for
  `research/external-src/chartjs-Chart.js` returned `0`.
- 2026-06-04: RED chart-visualization-readiness smoke generated
  `/tmp/repotutor-chart-red-studies.NQGNyj/2026-06-04/local__simple-ts-app__main__4c3bd50d`;
  old build was missing
  `analysis/chart-visualization-readiness-report.json`,
  `markdown/chart-visualization-readiness.md`, and
  `html/chart-visualization-readiness.html`, and `open --target
  chart-visualization-readiness` failed as expected.
- 2026-06-04: Implemented Chart.js-style chart-visualization-readiness report:
  `ChartVisualizationReadinessReportSchema`,
  `analysis/chart-visualization-readiness-report.json`,
  `markdown/chart-visualization-readiness.md`,
  `html/chart-visualization-readiness.html`, chart setups, chart type signals,
  data signals, scale signals, interaction signals, render signals, lifecycle
  signals, safety signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target chart-visualization-readiness`.
- 2026-06-04: GREEN chart-visualization-readiness smoke generated
  `/tmp/repotutor-chart-green-studies.W31jA2/2026-06-04/local__simple-ts-app__main__4c3bd50d`;
  confirmed `verificationCheckedRequiredArtifacts=237`, chart setups 0, chart
  type signals 7, data signals 6, scale signals 6, interaction signals 6,
  render signals 6, lifecycle signals 6, safety signals 6, package signals 6,
  risk queue 2, all three new artifacts, and `open --target
  chart-visualization-readiness` -> `html/chart-visualization-readiness.html`.
- 2026-06-04: Verification for Upgrade 179:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 77/77 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 179:
  - `5b0fd64` chart visualization readiness report

- 2026-06-04: AutoResearch Upgrade 180 candidate selected:
  `mermaid-js/mermaid`
  (`https://github.com/mermaid-js/mermaid`; public; MIT; 88,421 stars; 9,024
  forks; updated 2026-06-04T09:35:29Z). Compared with `plantuml/plantuml`,
  `yuzutech/kroki`, and `markmap/markmap`; selected Mermaid because it directly
  models diagram rendering readiness: text-to-diagram syntax,
  `mermaid.initialize`, `mermaid.run`, `mermaid.render`, `mermaid.parse`, SVG
  output, `bindFunctions`, diagram families, theme/layout settings, sandbox
  mode, and sanitization boundaries. Cloned ignored external source to
  `research/external-src/mermaid-js-mermaid` and inspected docs/source/test hits
  without executing external source. Clone HEAD was `0c00846`; tracked-file
  count for `research/external-src/mermaid-js-mermaid` returned `0`.
- 2026-06-04: RED diagram-rendering-readiness smoke generated
  `/tmp/repotutor-diagram-red-studies.K5YD0w/2026-06-04/local__simple-ts-app__HEAD__4fb02829`;
  old build had `verificationCheckedRequiredArtifacts=237`, was missing
  `analysis/diagram-rendering-readiness-report.json`,
  `markdown/diagram-rendering-readiness.md`, and
  `html/diagram-rendering-readiness.html`, and `open --target
  diagram-rendering-readiness` failed as expected.
- 2026-06-04: Implemented Mermaid-style diagram-rendering-readiness report:
  `DiagramRenderingReadinessReportSchema`,
  `analysis/diagram-rendering-readiness-report.json`,
  `markdown/diagram-rendering-readiness.md`,
  `html/diagram-rendering-readiness.html`, diagram setups, diagram type signals,
  render signals, theme signals, security signals, layout signals, output
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target diagram-rendering-readiness`.
- 2026-06-04: GREEN diagram-rendering-readiness smoke generated
  `/tmp/repotutor-diagram-green-studies.6nQ6vE/2026-06-04/local__simple-ts-app__main__4fb02829`;
  confirmed `verificationCheckedRequiredArtifacts=240`, diagram setups 0,
  diagram type signals 8, render signals 6, theme signals 6, security signals
  6, layout signals 6, output signals 5, package signals 5, risk queue 2, all
  three new artifacts, and `open --target diagram-rendering-readiness` ->
  `html/diagram-rendering-readiness.html`.
- 2026-06-04: Verification for Upgrade 180:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 78/78 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 180:
  - `d2079e4` diagram rendering readiness report

- 2026-06-04: AutoResearch Upgrade 181 candidate selected:
  `lycheeverse/lychee`
  (`https://github.com/lycheeverse/lychee`; public; Apache-2.0; 3,659 stars;
  212 forks; updated 2026-06-04T09:17:33Z). Compared with
  `tcort/markdown-link-check`, `stevenvachon/broken-link-checker`, and
  `filiph/linkcheck`; selected Lychee because it directly models link
  integrity readiness: Markdown/HTML/reStructuredText/website/mail targets,
  accept-status and exclude/include policy, schemes and fragments, timeout,
  retry, user-agent, headers, GitHub token, offline mode, JSON/Markdown/JUnit
  output, cache, GitHub Action, Docker, Nix, pre-commit, and script usage.
  Cloned ignored external source to `research/external-src/lycheeverse-lychee`
  and inspected docs/source hits without executing external source. Clone HEAD
  was `ed088a7`; tracked-file count for
  `research/external-src/lycheeverse-lychee` returned `0`.
- 2026-06-04: RED link-integrity-readiness smoke generated
  `/tmp/repotutor-link-red-studies.dGImur/2026-06-04/local__simple-ts-app__HEAD__f8b6305b`;
  old build had `verificationCheckedRequiredArtifacts=240`, was missing
  `analysis/link-integrity-readiness-report.json`,
  `markdown/link-integrity-readiness.md`, and
  `html/link-integrity-readiness.html`, and `open --target
  link-integrity-readiness` failed as expected.
- 2026-06-04: Implemented Lychee-style link-integrity-readiness report:
  `LinkIntegrityReadinessReportSchema`,
  `analysis/link-integrity-readiness-report.json`,
  `markdown/link-integrity-readiness.md`,
  `html/link-integrity-readiness.html`, link setups, target signals, policy
  signals, network signals, output signals, CI signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, nav entry, and `open --target
  link-integrity-readiness`.
- 2026-06-04: GREEN link-integrity-readiness smoke generated
  `/tmp/repotutor-link-green-studies.plPPCN/2026-06-04/local__simple-ts-app__main__f8b6305b`;
  confirmed `verificationCheckedRequiredArtifacts=243`, link setups 0, target
  signals 6, policy signals 6, network signals 6, output signals 6, CI signals
  5, package signals 6, risk queue 2, all three new artifacts, and
  `open --target link-integrity-readiness` ->
  `html/link-integrity-readiness.html`.
- 2026-06-04: Verification for Upgrade 181:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 79/79 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 181:
  - `b4e24b0` link integrity readiness report

- 2026-06-04: AutoResearch Upgrade 182 candidate selected:
  `harlan-zw/nuxt-seo`
  (`https://github.com/harlan-zw/nuxt-seo`; public; MIT; 1,406 stars; 92
  forks; updated 2026-06-03T17:25:42Z). Compared with
  `GoogleChrome/lighthouse`, `vercel/next.js`, and `h5bp/html5-boilerplate`;
  selected Nuxt SEO because it directly models SEO/AEO readiness:
  robots.txt, meta robots, X-Robots-Tag, indexable/noindex policy, sitemap.xml,
  sitemap index, hreflang, canonical URLs, Open Graph, Twitter cards,
  Schema.org JSON-LD, breadcrumbs, llms.txt, AI crawler policy, and
  agent-readability. Cloned ignored external source to
  `research/external-src/harlan-zw-nuxt-seo` and inspected docs/source/test
  hits without executing external source. Clone HEAD was `51442e0`; tracked
  file count for `research/external-src/harlan-zw-nuxt-seo` returned `0`.
- 2026-06-04: RED seo-metadata-readiness smoke generated
  `/tmp/repotutor-seo-red-studies.bihlLa/2026-06-04/local__simple-ts-app__HEAD__725f7693`;
  old build had `verificationCheckedRequiredArtifacts=243`, was missing
  `analysis/seo-metadata-readiness-report.json`,
  `markdown/seo-metadata-readiness.md`, and
  `html/seo-metadata-readiness.html`, and `open --target
  seo-metadata-readiness` failed as expected.
- 2026-06-04: Implemented Nuxt SEO-style seo-metadata-readiness report:
  `SeoMetadataReadinessReportSchema`,
  `analysis/seo-metadata-readiness-report.json`,
  `markdown/seo-metadata-readiness.md`,
  `html/seo-metadata-readiness.html`, SEO setups, crawl signals, sitemap
  signals, metadata signals, structured data signals, AI readiness signals,
  package signals, recommended commands, risk queue, manifest/session-
  verification coverage, learning-path linkage, nav entry, and `open --target
  seo-metadata-readiness`.
- 2026-06-04: GREEN seo-metadata-readiness smoke generated
  `/tmp/repotutor-seo-green-studies.5OBYLN/2026-06-04/local__simple-ts-app__main__725f7693`;
  confirmed `verificationCheckedRequiredArtifacts=246`, SEO setups 0, crawl
  signals 6, sitemap signals 6, metadata signals 6, structured data signals 6,
  AI readiness signals 5, package signals 6, risk queue 2, all three new
  artifacts, and `open --target seo-metadata-readiness` ->
  `html/seo-metadata-readiness.html`.
- 2026-06-04: Verification for Upgrade 182:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 80/80 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 182:
  - `eb7b5ad` SEO metadata readiness report

- 2026-06-04: AutoResearch Upgrade 183 candidate selected:
  `vite-pwa/vite-plugin-pwa`
  (`https://github.com/vite-pwa/vite-plugin-pwa`; public; MIT; 4,181 stars;
  256 forks; updated 2026-06-04T08:29:09Z). Compared with
  `GoogleChrome/workbox`, `pwa-builder/PWABuilder`, and `nuxt-modules/pwa`
  (repo not found); selected Vite PWA because it directly models PWA readiness:
  `manifest.webmanifest`, icons, `theme_color`, `start_url`, display, scope,
  `registerSW`, `virtual:pwa-register`, generateSW, injectManifest, Workbox
  precache/runtimeCaching, glob patterns, CacheFirst/NetworkFirst/
  StaleWhileRevalidate, `offlineReady`, `needRefresh`, update prompts,
  `skipWaiting`, `clientsClaim`, install prompts, credentials, shortcuts, and
  Vite package integration. Cloned ignored external source to
  `research/external-src/vite-pwa-vite-plugin-pwa` and inspected docs/source
  hits without executing external source. Clone HEAD was `05670fc`; tracked
  file count for `research/external-src/vite-pwa-vite-plugin-pwa` returned `0`.
- 2026-06-04: RED pwa-readiness smoke generated
  `/tmp/repotutor-pwa-red-studies.oJcQHU/2026-06-04/local__simple-ts-app__HEAD__aa1377b8`;
  old build had `verificationCheckedRequiredArtifacts=246`, was missing
  `analysis/pwa-readiness-report.json`, `markdown/pwa-readiness.md`, and
  `html/pwa-readiness.html`, and `open --target pwa-readiness` failed as
  expected.
- 2026-06-04: Implemented Vite PWA-style pwa-readiness report:
  `PwaReadinessReportSchema`, `analysis/pwa-readiness-report.json`,
  `markdown/pwa-readiness.md`, `html/pwa-readiness.html`, PWA setups, manifest
  signals, service worker signals, caching signals, update signals, install
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target pwa-readiness`.
- 2026-06-04: GREEN pwa-readiness smoke generated
  `/tmp/repotutor-pwa-green-studies.EK2MKg/2026-06-04/local__simple-ts-app__main__aa1377b8`;
  confirmed `verificationCheckedRequiredArtifacts=249`, PWA setups 0, manifest
  signals 6, service worker signals 6, caching signals 6, update signals 5,
  install signals 5, package signals 6, risk queue 2, all three new artifacts,
  and `open --target pwa-readiness` -> `html/pwa-readiness.html`.
- 2026-06-04: Verification for Upgrade 183:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 81/81 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 183:
  - `1c6e107` PWA readiness report

- 2026-06-04: AutoResearch Upgrade 184 candidate selected:
  `browserslist/browserslist`
  (`https://github.com/browserslist/browserslist`; public; MIT; 13,545 stars;
  765 forks; updated 2026-06-04T07:53:43Z). Compared with
  `postcss/autoprefixer`, `amilajack/eslint-plugin-compat`, and
  `mdn/browser-compat-data`; selected Browserslist because it directly models
  shared target browser policy: package.json `browserslist`,
  `.browserslistrc`, standalone config files, env-specific targets, shareable
  config, `defaults`, last versions, usage thresholds, `not dead`, coverage,
  custom stats, mobile-to-desktop, caniuse-lite freshness, update-browserslist-
  db, and consumer tools. Cloned ignored external source to
  `research/external-src/browserslist-browserslist` and inspected docs/source
  hits without executing external source. Clone HEAD was `ef1895c`; tracked
  file count for `research/external-src/browserslist-browserslist` returned `0`.
- 2026-06-04: RED browser-compat-readiness smoke generated
  `/tmp/repotutor-browser-compat-red-studies.q4UaN5/2026-06-04/local__simple-ts-app__HEAD__47215d1d`;
  old build had `verificationCheckedRequiredArtifacts=249`, was missing
  `analysis/browser-compat-readiness-report.json`,
  `markdown/browser-compat-readiness.md`, and
  `html/browser-compat-readiness.html`, and `open --target
  browser-compat-readiness` failed as expected.
- 2026-06-04: Implemented Browserslist-style browser-compat-readiness report:
  `BrowserCompatibilityReadinessReportSchema`,
  `analysis/browser-compat-readiness-report.json`,
  `markdown/browser-compat-readiness.md`,
  `html/browser-compat-readiness.html`, compatibility setups, config signals,
  query signals, coverage signals, feature signals, update signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, nav entry, and `open --target
  browser-compat-readiness`.
- 2026-06-04: GREEN browser-compat-readiness smoke generated
  `/tmp/repotutor-browser-compat-green-studies.as1ELt/2026-06-04/local__simple-ts-app__main__47215d1d`;
  confirmed `verificationCheckedRequiredArtifacts=252`, compatibility setups 0,
  config signals 6, query signals 6, coverage signals 5, feature signals 6,
  update signals 5, package signals 6, risk queue 2, all three new artifacts,
  and `open --target browser-compat-readiness` ->
  `html/browser-compat-readiness.html`.
- 2026-06-04: Verification for Upgrade 184:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 82/82 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 184:
  - `d5b0baa` browser compatibility readiness report

- 2026-06-04: AutoResearch Upgrade 185 candidate selected:
  `t3-oss/t3-env`
  (`https://github.com/t3-oss/t3-env`; public; MIT; 3,936 stars; 127 forks;
  updated 2026-06-03T12:20:25Z). Compared with `af/envalid`,
  `dotenvx/dotenvx`, and `evanshortiss/env-var`; selected t3-env because it
  directly models typed environment contracts: `createEnv`, server/client/shared
  schemas, Standard Schema-compatible validators, `runtimeEnv`,
  `runtimeEnvStrict`, `experimental__runtimeEnv`, framework public prefixes,
  validation hooks, `emptyStringAsUndefined`, transforms/defaults, and invalid
  client access guards. Cloned ignored external source to
  `research/external-src/t3-oss-t3-env` and inspected docs/source hits without
  executing external source. Clone HEAD was `7d26a64`; tracked file count for
  `research/external-src/t3-oss-t3-env` returned `0`.
- 2026-06-04: RED env-validation-readiness smoke generated
  `/tmp/repotutor-env-validation-red-studies.5b2b1e/2026-06-04/local__simple-ts-app__HEAD__39239644`;
  old build had `verificationCheckedRequiredArtifacts=252`, was missing
  `analysis/env-validation-readiness-report.json`,
  `markdown/env-validation-readiness.md`, and
  `html/env-validation-readiness.html`, and `open --target
  env-validation-readiness` failed as expected.
- 2026-06-04: Implemented t3-env-style env-validation-readiness report:
  `EnvValidationReadinessReportSchema`,
  `analysis/env-validation-readiness-report.json`,
  `markdown/env-validation-readiness.md`,
  `html/env-validation-readiness.html`, env setups, schema signals, runtime
  signals, boundary signals, validation signals, documentation signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, nav entry, and `open --target
  env-validation-readiness`.
- 2026-06-04: GREEN env-validation-readiness smoke generated
  `/tmp/repotutor-env-validation-green-studies.263126/2026-06-04/local__simple-ts-app__main__39239644`;
  confirmed `verificationCheckedRequiredArtifacts=255`, env setups 0, schema
  signals 8, runtime signals 6, boundary signals 6, validation signals 7,
  documentation signals 5, package signals 10, risk queue 2, all three new
  artifacts, and `open --target env-validation-readiness` ->
  `html/env-validation-readiness.html`.
- 2026-06-04: Verification for Upgrade 185:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 83/83 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 185:
  - `3d51791` env validation readiness report

- 2026-06-04: AutoResearch Upgrade 186 candidate selected:
  `helmetjs/helmet`
  (`https://github.com/helmetjs/helmet`; public; MIT; 10,684 stars; 407
  forks; updated 2026-06-03T02:56:47Z). Compared with
  `google/csp-evaluator`, `helmetjs/csp`, and framework-level header examples;
  selected Helmet because it directly models HTTP security header ownership:
  `helmet()`, per-header enable/disable, Content-Security-Policy directives,
  report-only mode, HSTS, COEP/COOP/CORP, Origin-Agent-Cluster,
  Referrer-Policy, X-Frame-Options, X-Content-Type-Options, X-Powered-By
  removal, and legacy hardening headers. Cloned ignored external source to
  `research/external-src/helmetjs-helmet` and inspected docs/source hits
  without executing external source. Clone HEAD was `5aaf544`; tracked file
  count for `research/external-src/helmetjs-helmet` returned `0`.
- 2026-06-04: RED security-headers-readiness smoke generated
  `/tmp/repotutor-security-headers-red-studies.7af80e/2026-06-04/local__simple-ts-app__HEAD__5c4d2cd5`;
  old build had `verificationCheckedRequiredArtifacts=255`, was missing
  `analysis/security-headers-readiness-report.json`,
  `markdown/security-headers-readiness.md`, and
  `html/security-headers-readiness.html`, and `open --target
  security-headers-readiness` failed as expected.
- 2026-06-04: Implemented Helmet-style security-headers-readiness report:
  `SecurityHeadersReadinessReportSchema`,
  `analysis/security-headers-readiness-report.json`,
  `markdown/security-headers-readiness.md`,
  `html/security-headers-readiness.html`, header setups, CSP signals,
  transport signals, cross-origin signals, legacy header signals, middleware
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target security-headers-readiness`.
- 2026-06-04: GREEN security-headers-readiness smoke generated
  `/tmp/repotutor-security-headers-green-studies.bf5dd0/2026-06-04/local__simple-ts-app__main__5c4d2cd5`;
  confirmed `verificationCheckedRequiredArtifacts=258`, header setups 0, CSP
  signals 9, transport signals 6, cross-origin signals 5, legacy header
  signals 8, middleware signals 6, package signals 6, risk queue 2, all three
  new artifacts, and `open --target security-headers-readiness` ->
  `html/security-headers-readiness.html`.
- 2026-06-04: Verification for Upgrade 186:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 84/84 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 186:
  - `ff3a1ed` security headers readiness report

- 2026-06-04: AutoResearch Upgrade 187 candidate selected:
  `graphql/graphql-js`
  (`https://github.com/graphql/graphql-js`; public; MIT; 20,316 stars; 2,048
  forks; updated 2026-06-04T11:28:53Z). Compared with
  `apollographql/apollo-server`, `dotansimha/graphql-code-generator`, and
  `urql-graphql/urql`; selected GraphQL.js because it directly models
  `GraphQLSchema`, SDL, parse/validate/execute, subscriptions, introspection,
  resolver hooks, and typed document/codegen workflows. Cloned ignored external
  source to `research/external-src/graphql-graphql-js` and inspected
  docs/source hits without executing external source. Clone HEAD was
  `9c68b2a`; tracked file count for
  `research/external-src/graphql-graphql-js` returned `0`.
- 2026-06-04: RED graphql-readiness smoke generated
  `/tmp/repotutor-graphql-red-studies.VLdL7o/2026-06-04/local__simple-ts-app__HEAD__ee3af3c3`;
  old build had `verificationCheckedRequiredArtifacts=258`, was missing
  `analysis/graphql-readiness-report.json`, `markdown/graphql-readiness.md`,
  and `html/graphql-readiness.html`, and `open --target graphql-readiness`
  failed as expected.
- 2026-06-04: Implemented GraphQL.js-style graphql-readiness report:
  `GraphqlReadinessReportSchema`, `analysis/graphql-readiness-report.json`,
  `markdown/graphql-readiness.md`, `html/graphql-readiness.html`, GraphQL
  setups, schema signals, operation signals, resolver signals, validation
  signals, execution signals, client signals, codegen signals, recommended
  commands, risk queue, manifest/session-verification coverage, learning-path
  linkage, nav entry, and `open --target graphql-readiness`.
- 2026-06-04: GREEN graphql-readiness smoke generated
  `/tmp/repotutor-graphql-green-studies.ONglFp/2026-06-04/local__simple-ts-app__main__ee3af3c3`;
  confirmed `verificationCheckedRequiredArtifacts=261`, GraphQL setups 0,
  schema signals 8, operation signals 7, resolver signals 7, validation
  signals 7, execution signals 7, client signals 7, codegen signals 5, risk
  queue 2, all three new artifacts, and `open --target graphql-readiness` ->
  `html/graphql-readiness.html`.
- 2026-06-04: Verification for Upgrade 187:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 85/85 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 187:
  - `13ba079` GraphQL readiness report

- 2026-06-04: AutoResearch Upgrade 188 candidate selected:
  `tj/commander.js`
  (`https://github.com/tj/commander.js`; public; MIT; 28,247 stars; 1,751
  forks; updated 2026-06-04T04:59:00Z). Compared with `yargs/yargs`,
  `oclif/core`, and `cacjs/cac`; selected Commander.js because it directly
  models CLI command ownership: `Command`, `.command()`, `.argument()`,
  `.option()`, `.requiredOption()`, `.action()`, `.hook()`, `parse()`,
  `parseAsync()`, automated help, output configuration, `exitOverride()`,
  `showHelpAfterError()`, `CommanderError`, stderr, and exit codes. Cloned
  ignored external source to `research/external-src/tj-commander-js` and
  inspected docs/source/test hits without executing external source. Clone
  HEAD was `ba6d13d`; tracked file count for
  `research/external-src/tj-commander-js` returned `0`.
- 2026-06-04: RED cli-readiness smoke generated
  `/tmp/repotutor-cli-red-studies.kflGSM/2026-06-04/local__simple-ts-app__HEAD__739b5cd6`;
  old build had `verificationCheckedRequiredArtifacts=261`, was missing
  `analysis/cli-readiness-report.json`, `markdown/cli-readiness.md`, and
  `html/cli-readiness.html`, and `open --target cli-readiness` failed as
  expected.
- 2026-06-04: Implemented Commander.js-style cli-readiness report:
  `CliReadinessReportSchema`, `analysis/cli-readiness-report.json`,
  `markdown/cli-readiness.md`, `html/cli-readiness.html`, CLI setups, command
  signals, option signals, parse signals, action signals, help signals, error
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry,
  and `open --target cli-readiness`.
- 2026-06-04: GREEN cli-readiness smoke generated
  `/tmp/repotutor-cli-green-studies.dxMJk0/2026-06-04/local__simple-ts-app__main__739b5cd6`;
  confirmed `verificationCheckedRequiredArtifacts=264`, CLI setups 0, command
  signals 6, option signals 8, parse signals 6, action signals 6, help
  signals 6, error signals 6, package signals 6, risk queue 5, all three new
  artifacts, and `open --target cli-readiness` ->
  `html/cli-readiness.html`.
- 2026-06-04: Verification for Upgrade 188:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 86/86 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 188:
  - `41f0d67` CLI readiness report

- 2026-06-04: AutoResearch Upgrade 189 candidate selected:
  `langchain-ai/langchainjs`
  (`https://github.com/langchain-ai/langchainjs`; public; MIT; 17,756 stars;
  3,195 forks; updated 2026-06-04T12:27:31Z). Compared with `vercel/ai`,
  `openai/openai-node`, and `run-llama/LlamaIndexTS`; selected LangChain.js
  because it directly models LLM integration ownership: chat models, prompt
  templates, tools/agents, retrievers/vector stores, structured output,
  streaming, callbacks, and LangSmith-style observability. Cloned ignored
  external source to `research/external-src/langchain-ai-langchainjs` and
  inspected docs/source/example hits without executing external source. Clone
  HEAD was `9db45b5`; tracked file count for
  `research/external-src/langchain-ai-langchainjs` returned `0`.
- 2026-06-04: RED llm-readiness smoke generated
  `/tmp/repotutor-llm-red-studies.mXHsJV/2026-06-04/local__simple-ts-app__HEAD__7d24969f`;
  old build had `verificationCheckedRequiredArtifacts=264`, was missing
  `analysis/llm-readiness-report.json`, `markdown/llm-readiness.md`, and
  `html/llm-readiness.html`, and `open --target llm-readiness` failed as
  expected.
- 2026-06-04: Implemented LangChain.js-style llm-readiness report:
  `LlmReadinessReportSchema`, `analysis/llm-readiness-report.json`,
  `markdown/llm-readiness.md`, `html/llm-readiness.html`, LLM setups, model
  signals, prompt signals, tool signals, retrieval signals, structured output
  signals, streaming signals, safety signals, package signals, recommended
  commands, risk queue, manifest/session-verification coverage, learning-path
  linkage, nav entry, and `open --target llm-readiness`.
- 2026-06-04: GREEN llm-readiness smoke generated
  `/tmp/repotutor-llm-green-studies.RuSYQO/2026-06-04/local__simple-ts-app__main__7d24969f`;
  confirmed `verificationCheckedRequiredArtifacts=267`, LLM setups 1, model
  signals 7, prompt signals 6, tool signals 6, retrieval signals 6, structured
  output signals 5, streaming signals 6, safety signals 6, package signals 8,
  risk queue 3, all three new artifacts, and `open --target llm-readiness` ->
  `html/llm-readiness.html`.
- 2026-06-04: Verification for Upgrade 189:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 87/87 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 189:
  - `4de4615` LLM readiness report

- 2026-06-04: AutoResearch Upgrade 190 candidate selected:
  `fastify/fastify`
  (`https://github.com/fastify/fastify`; public; MIT; 36,365 stars; 2,700
  forks; updated 2026-06-04T09:17:25Z). Compared with `expressjs/express`,
  `koajs/koa`, and `honojs/hono`; selected Fastify because it exposes explicit
  server framework ownership boundaries: route shorthands, route objects, JSON
  Schema validation, plugins, hooks, decorators, listen/runtime configuration,
  error handlers, and inject-style tests. Cloned ignored external source to
  `research/external-src/fastify-fastify` and inspected docs/source/test hits
  without executing external source. Clone HEAD was `66128b0`; tracked file
  count for `research/external-src/fastify-fastify` returned `0`.
- 2026-06-04: RED server-framework-readiness smoke generated
  `/tmp/repotutor-server-framework-red-studies.qaHUyw/2026-06-04/local__simple-ts-app__HEAD__f2fdfcbf`;
  old build had `verificationCheckedRequiredArtifacts=267`, was missing
  `analysis/server-framework-readiness-report.json`,
  `markdown/server-framework-readiness.md`, and
  `html/server-framework-readiness.html`, and `open --target
  server-framework-readiness` failed as expected.
- 2026-06-04: Implemented Fastify-style server-framework-readiness report:
  `ServerFrameworkReadinessReportSchema`,
  `analysis/server-framework-readiness-report.json`,
  `markdown/server-framework-readiness.md`,
  `html/server-framework-readiness.html`, server setups, route signals, schema
  signals, plugin signals, lifecycle signals, runtime signals, error signals,
  test signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target server-framework-readiness`.
- 2026-06-04: GREEN server-framework-readiness smoke generated
  `/tmp/repotutor-server-framework-green-studies.uWtHsN/2026-06-04/local__simple-ts-app__main__f2fdfcbf`;
  confirmed `verificationCheckedRequiredArtifacts=270`, server setups 0, route
  signals 9, schema signals 8, plugin signals 7, lifecycle signals 9, runtime
  signals 7, error signals 5, test signals 5, package signals 8, risk queue 2,
  all three new artifacts, and `open --target server-framework-readiness` ->
  `html/server-framework-readiness.html`.
- 2026-06-04: Verification for Upgrade 190:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 88/88 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 190:
  - `f070f00` server framework readiness report

- 2026-06-04: AutoResearch Upgrade 191 candidate selected:
  `trpc/trpc`
  (`https://github.com/trpc/trpc`; public; MIT; 40,303 stars; 1,628 forks;
  updated 2026-06-04T11:52:54Z). Compared with `connectrpc/connect-es` and
  `grpc/grpc-node`; selected tRPC because it directly models end-to-end
  type-safe RPC boundaries: root routers, procedures, validation,
  context/middleware, typed clients, transport links, adapters, structured
  errors, and local callers. Cloned ignored external source to
  `research/external-src/trpc-trpc` and inspected docs/source/example/test hits
  without executing external source. Clone HEAD was `c7360d4`; tracked file
  count for `research/external-src/trpc-trpc` returned `0`.
- 2026-06-04: RED rpc-readiness smoke generated
  `/tmp/repotutor-rpc-red-studies.wETSbj/2026-06-04/local__simple-ts-app__main__3d645e49`;
  old build was missing `analysis/rpc-readiness-report.json`,
  `markdown/rpc-readiness.md`, and `html/rpc-readiness.html`, and
  `open --target rpc-readiness` failed as expected.
- 2026-06-04: Implemented tRPC-style rpc-readiness report:
  `RpcReadinessReportSchema`, `analysis/rpc-readiness-report.json`,
  `markdown/rpc-readiness.md`, `html/rpc-readiness.html`, RPC setups, router
  signals, procedure signals, validation signals, context signals, client
  signals, adapter signals, error signals, caller signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, nav entry, and `open --target rpc-readiness`.
- 2026-06-04: GREEN rpc-readiness smoke generated
  `/tmp/repotutor-rpc-green-studies.l3OflZ/2026-06-04/local__simple-ts-app__main__3d645e49`;
  confirmed `verificationCheckedRequiredArtifacts=273`, RPC setups 0, router
  signals 6, procedure signals 7, validation signals 7, context signals 6,
  client signals 10, adapter signals 9, error signals 6, caller signals 5,
  package signals 7, risk queue 2, all three new artifacts, and
  `open --target rpc-readiness` -> `html/rpc-readiness.html`.
- 2026-06-04: Verification for Upgrade 191:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 89/89 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 191:
  - `6b0e2f8` RPC readiness report

- 2026-06-04: AutoResearch Upgrade 192 candidate selected:
  `nrwl/nx`
  (`https://github.com/nrwl/nx`; public; MIT; 28,809 stars; 2,739 forks;
  updated 2026-06-04T13:46:10Z). Compared with `vercel/turborepo`,
  `moonrepo/moon`, `pnpm/pnpm`, and `microsoft/rushstack`; selected Nx because
  Turborepo was already represented by task-runner readiness, while Nx directly
  models project graph ownership, affected-only runs, boundary enforcement,
  target defaults, named inputs, plugin inference, generators, and executors.
  Cloned ignored external source to `research/external-src/nrwl-nx` and
  inspected docs/source/example/test hits without executing external source.
  Clone HEAD was `82c1825`; tracked file count for
  `research/external-src/nrwl-nx` returned `0`.
- 2026-06-04: RED workspace-graph-readiness smoke generated
  `/tmp/repotutor-workspace-graph-red-studies.fUo4FX/2026-06-04/local__simple-ts-app__main__185ae7eb`;
  old build had `verificationCheckedRequiredArtifacts=273`, was missing
  `analysis/workspace-graph-readiness-report.json`,
  `markdown/workspace-graph-readiness.md`, and
  `html/workspace-graph-readiness.html`, and `open --target
  workspace-graph-readiness` failed as expected.
- 2026-06-04: Implemented Nx-style workspace-graph-readiness report:
  `WorkspaceGraphReadinessReportSchema`,
  `analysis/workspace-graph-readiness-report.json`,
  `markdown/workspace-graph-readiness.md`,
  `html/workspace-graph-readiness.html`, workspace files, project signals,
  graph signals, boundary signals, affected signals, target signals, plugin
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target workspace-graph-readiness`.
- 2026-06-04: GREEN workspace-graph-readiness smoke generated
  `/tmp/repotutor-workspace-graph-green-studies.cpUQIw/2026-06-04/local__simple-ts-app__main__185ae7eb`;
  confirmed `verificationCheckedRequiredArtifacts=276`, workspace files 1,
  project signals 10, graph signals 7, boundary signals 8, affected signals 6,
  target signals 9, plugin signals 7, package signals 6, risk queue 3, all
  three new artifacts, and `open --target workspace-graph-readiness` ->
  `html/workspace-graph-readiness.html`.
- 2026-06-04: Verification for Upgrade 192:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 90/90 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 192:
  - `948f442` workspace graph readiness report

- 2026-06-04: AutoResearch Upgrade 193 candidate selected:
  `plopjs/plop`
  (`https://github.com/plopjs/plop`; public; MIT; 7,661 stars; 295 forks;
  updated 2026-06-04T08:40:11Z). Compared with `jondot/hygen`,
  `yeoman/generator`, `facebook/jscodeshift`, and
  `OpenAPITools/openapi-generator`; selected Plop because it directly models
  prompt-driven micro-generators, action arrays, templates, helpers, partials,
  package loading, and overwrite safety. Cloned ignored external source to
  `research/external-src/plopjs-plop` and inspected docs/source/example/test
  hits without executing external source. Clone HEAD was `0c90e7e`; tracked file
  count for `research/external-src/plopjs-plop` returned `0`.
- 2026-06-04: RED scaffolding-readiness smoke generated
  `/tmp/repotutor-scaffolding-red-studies.UcXxzJ/2026-06-04/local__simple-ts-app__HEAD__ac1bf33d`;
  old build had `verificationCheckedRequiredArtifacts=276`, was missing
  `analysis/scaffolding-readiness-report.json`,
  `markdown/scaffolding-readiness.md`, and
  `html/scaffolding-readiness.html`, and `open --target scaffolding-readiness`
  failed as expected.
- 2026-06-04: Implemented Plop-style scaffolding-readiness report:
  `ScaffoldingReadinessReportSchema`,
  `analysis/scaffolding-readiness-report.json`,
  `markdown/scaffolding-readiness.md`,
  `html/scaffolding-readiness.html`, generator files, prompt signals, action
  signals, template signals, safety signals, package signals, recommended
  commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, nav entry, and `open --target scaffolding-readiness`.
- 2026-06-04: GREEN scaffolding-readiness smoke generated
  `/tmp/repotutor-scaffolding-green-studies.Y1ydxh/2026-06-04/local__simple-ts-app__main__ac1bf33d`;
  confirmed `verificationCheckedRequiredArtifacts=279`, generator files 0,
  prompt signals 9, action signals 8, template signals 8, safety signals 8,
  package signals 8, risk queue 2, all three new artifacts, and
  `open --target scaffolding-readiness` ->
  `html/scaffolding-readiness.html`.
- 2026-06-04: Verification for Upgrade 193:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 91/91 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 193:
  - `0b7a41b` scaffolding readiness report

- 2026-06-04: AutoResearch Upgrade 194 candidate selected:
  `node-cron/node-cron`
  (`https://github.com/node-cron/node-cron`; public; ISC; 3,261 stars; 281
  forks; updated 2026-06-03T19:59:29Z). Compared with
  `kelektiv/node-cron`, `agenda/agenda`, and `breejs/bree`; selected
  `node-cron/node-cron` because it directly models scheduler ownership:
  cron expressions, `schedule`, `createTask`, timezone handling, no-overlap
  execution, max execution count, task lifecycle, validation, and task context.
  Cloned ignored external source to `research/external-src/node-cron-node-cron`
  and inspected docs/source/test hits without executing external source. Clone
  HEAD was `c76f95e`; tracked file count for
  `research/external-src/node-cron-node-cron` returned `0`.
- 2026-06-04: RED scheduler-readiness smoke generated
  `/tmp/repotutor-scheduler-red-studies.JH3h5Y/2026-06-04/local__simple-ts-app__HEAD__50370079`;
  old build had `verificationCheckedRequiredArtifacts=279`, was missing
  `analysis/scheduler-readiness-report.json`,
  `markdown/scheduler-readiness.md`, and `html/scheduler-readiness.html`, and
  `open --target scheduler-readiness` failed as expected.
- 2026-06-04: Implemented node-cron-style scheduler-readiness report:
  `SchedulerReadinessReportSchema`,
  `analysis/scheduler-readiness-report.json`,
  `markdown/scheduler-readiness.md`, `html/scheduler-readiness.html`,
  scheduler setups, schedule signals, task signals, lifecycle signals,
  reliability signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, nav entry, and
  `open --target scheduler-readiness`.
- 2026-06-04: GREEN scheduler-readiness smoke generated
  `/tmp/repotutor-scheduler-green-studies.nbYr6k/2026-06-04/local__simple-ts-app__main__50370079`;
  confirmed `verificationCheckedRequiredArtifacts=282`, scheduler setups 0,
  schedule signals 6, task signals 6, lifecycle signals 8, reliability signals
  8, package signals 8, risk queue 2, all three new artifacts, and
  `open --target scheduler-readiness` -> `html/scheduler-readiness.html`.
- 2026-06-04: Verification for Upgrade 194:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 92/92 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 194:
  - `1139e26` scheduler readiness report

- 2026-06-04: AutoResearch Upgrade 195 candidate selected:
  `vitejs/vite`
  (`https://github.com/vitejs/vite`; public; MIT; 80,990 stars; 8,254 forks;
  updated 2026-06-04T13:55:56Z). Compared with `webpack/webpack`,
  `rollup/rollup`, `evanw/esbuild`, and `parcel-bundler/parcel`; selected Vite
  because existing RepoTutor reports already cover package manager, task runner,
  and bundle analysis surfaces, while Vite directly models build tool
  readiness: config, plugin lifecycle, dev server, preview, production build,
  env, SSR, and dependency optimization. Cloned ignored external source to
  `research/external-src/vitejs-vite` and inspected docs/source hits without
  executing external source. Clone HEAD was `4551a4b`; tracked file count for
  `research/external-src/vitejs-vite` returned `0`.
- 2026-06-04: RED build-tool-readiness smoke generated
  `/tmp/repotutor-build-tool-red-studies.RkpAGA/2026-06-04/local__simple-ts-app__HEAD__1139dbe2`;
  old build had `verificationCheckedRequiredArtifacts=282`, was missing
  `analysis/build-tool-readiness-report.json`,
  `markdown/build-tool-readiness.md`, and
  `html/build-tool-readiness.html`, and `open --target
  build-tool-readiness` failed as expected.
- 2026-06-04: Implemented Vite-style build-tool-readiness report:
  `BuildToolReadinessReportSchema`,
  `analysis/build-tool-readiness-report.json`,
  `markdown/build-tool-readiness.md`, `html/build-tool-readiness.html`, build
  tool setups, config signals, plugin signals, dev server signals, build
  signals, environment signals, SSR signals, dependency optimization signals,
  package signals, recommended commands, risk queue, manifest/session
  verification coverage, learning-path linkage, nav entry, and
  `open --target build-tool-readiness`.
- 2026-06-04: GREEN build-tool-readiness smoke generated
  `/tmp/repotutor-build-tool-green-studies.IyvrS3/2026-06-04/local__simple-ts-app__main__1139dbe2`;
  confirmed `verificationCheckedRequiredArtifacts=285`, build tool setups 1,
  config signals 8, plugin signals 9, dev server signals 9, build signals 9,
  environment signals 8, SSR signals 7, dependency optimization signals 9,
  package signals 8, risk queue 5, all three new artifacts, and
  `open --target build-tool-readiness` ->
  `html/build-tool-readiness.html`.
- 2026-06-04: Verification for Upgrade 195:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 93/93 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 195:
  - `7defefd` build tool readiness report

- 2026-06-04: AutoResearch Upgrade 196 candidate selected:
  `tailwindlabs/tailwindcss`
  (`https://github.com/tailwindlabs/tailwindcss`; public; MIT; 95,232 stars;
  5,286 forks; updated 2026-06-04T14:27:21Z). Compared with
  `unocss/unocss`, `sass/sass`, and `twbs/bootstrap`; selected Tailwind CSS
  because existing RepoTutor reports already cover design tokens, while
  Tailwind directly models styling pipeline readiness: CSS entry directives,
  utility class candidates, content scanning, theme extension, plugins, and
  build integration. Cloned ignored external source to
  `research/external-src/tailwindlabs-tailwindcss` and inspected
  docs/source/test/codemod hits without executing external source. Clone HEAD
  was `ad66939`; tracked file count for
  `research/external-src/tailwindlabs-tailwindcss` returned `0`.
- 2026-06-04: RED styling-readiness smoke generated
  `/tmp/repotutor-styling-red-studies.vmu3oq/2026-06-05/local__simple-ts-app__HEAD__85b51db6`;
  old build had `verificationCheckedRequiredArtifacts=285`, was missing
  `analysis/styling-readiness-report.json`,
  `markdown/styling-readiness.md`, and `html/styling-readiness.html`, and
  `open --target styling-readiness` failed as expected.
- 2026-06-04: Implemented Tailwind CSS-style styling-readiness report:
  `StylingReadinessReportSchema`,
  `analysis/styling-readiness-report.json`,
  `markdown/styling-readiness.md`, `html/styling-readiness.html`, styling
  setups, config signals, directive signals, class signals, theme signals,
  integration signals, package signals, recommended commands, risk queue,
  manifest/session verification coverage, learning-path linkage, nav entry, and
  `open --target styling-readiness`.
- 2026-06-04: GREEN styling-readiness smoke generated
  `/tmp/repotutor-styling-green-studies.fWnFPC/2026-06-05/local__simple-ts-app__main__85b51db6`;
  confirmed `verificationCheckedRequiredArtifacts=288`, styling setups 0,
  config signals 9, directive signals 10, class signals 9, theme signals 9,
  integration signals 9, package signals 9, risk queue 2, all three new
  artifacts, and `open --target styling-readiness` ->
  `html/styling-readiness.html`.
- 2026-06-04: Verification for Upgrade 196:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests after a retry; the first concurrent
    test+audit run hit Vitest's 5s fixture-test timeout.
  - `pnpm audit:brief`: PASS, 94/94 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 196:
  - `7468f63` styling readiness report

- 2026-06-04: AutoResearch Upgrade 197 candidate selected:
  `reg-viz/reg-suit`
  (`https://github.com/reg-viz/reg-suit`; public; MIT; 1,274 stars; 107 forks;
  updated 2026-06-03T23:39:15Z). Compared with `lost-pixel/lost-pixel`,
  `argos-ci/argos`, and `webdriverio/visual-testing`; selected reg-suit because
  existing RepoTutor reports already cover E2E and Storybook surfaces, while
  reg-suit directly models visual regression readiness: actual screenshots,
  expected baselines, diffs, thresholds, reports, plugins, storage,
  notification, and CI handoff. Cloned ignored external source to
  `research/external-src/reg-viz-reg-suit` and inspected docs/source hits
  without executing external source. Clone HEAD was `5c09c8e`; tracked file
  count for `research/external-src/reg-viz-reg-suit` returned `0`.
- 2026-06-04: RED visual-regression-readiness smoke generated
  `/tmp/repotutor-visual-red-studies.1creOu/2026-06-05/local__simple-ts-app__HEAD__bdf9bbbf`;
  old build had `verificationCheckedRequiredArtifacts=288`, was missing
  `analysis/visual-regression-readiness-report.json`,
  `markdown/visual-regression-readiness.md`, and
  `html/visual-regression-readiness.html`, and `open --target
  visual-regression-readiness` failed as expected.
- 2026-06-04: Implemented reg-suit-style visual-regression-readiness report:
  `VisualRegressionReadinessReportSchema`,
  `analysis/visual-regression-readiness-report.json`,
  `markdown/visual-regression-readiness.md`,
  `html/visual-regression-readiness.html`, visual regression setups, config
  signals, snapshot signals, threshold signals, report signals, plugin signals,
  CI signals, package signals, recommended commands, risk queue,
  manifest/session verification coverage, learning-path linkage, nav entry, and
  `open --target visual-regression-readiness`.
- 2026-06-04: GREEN visual-regression-readiness smoke generated
  `/tmp/repotutor-visual-green-studies.KP2l2p/2026-06-05/local__simple-ts-app__main__bdf9bbbf`;
  confirmed `verificationCheckedRequiredArtifacts=291`, visual setups 0, config
  signals 8, snapshot signals 9, threshold signals 7, report signals 6, plugin
  signals 9, CI signals 7, package signals 10, risk queue 2, all three new
  artifacts, and `open --target visual-regression-readiness` ->
  `html/visual-regression-readiness.html`.
- 2026-06-04: Verification for Upgrade 197:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 4/4 tests
  - `pnpm audit:brief`: PASS, 95/95 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 197:
  - `a5e3d51` visual regression readiness report

- 2026-06-04: AutoResearch Upgrade 198 candidate selected:
  `opentofu/opentofu`
  (`https://github.com/opentofu/opentofu`; public; MPL-2.0; 28,938 stars;
  1,262 forks; updated 2026-06-04T15:07:10Z). Compared with
  `hashicorp/terraform`, `helm/helm`, `kubernetes-sigs/kustomize`,
  `gruntwork-io/terragrunt`, `terraform-linters/tflint`, and
  `aquasecurity/tfsec`; selected OpenTofu because it is the canonical IaC
  engine surface for `.tf` configuration, providers, resources, modules,
  variables, backend/state, execution plans, imports, workspaces, and lockfiles.
  Cloned ignored external source to `research/external-src/opentofu-opentofu`
  and inspected docs/source hits without executing external source. Clone HEAD
  was `50d94e0`; tracked file count for
  `research/external-src/opentofu-opentofu` returned `0`.
- 2026-06-04: RED infrastructure-readiness smoke generated
  `/tmp/repotutor-infra-red-studies.OBwyUH/2026-06-05/local__simple-ts-app__HEAD__d44d9594`;
  old build had `verificationCheckedRequiredArtifacts=291`, was missing
  `analysis/infrastructure-readiness-report.json`,
  `markdown/infrastructure-readiness.md`, and
  `html/infrastructure-readiness.html`, and `open --target
  infrastructure-readiness` failed as expected.
- 2026-06-04: Implemented OpenTofu-style infrastructure-readiness report:
  `InfrastructureReadinessReportSchema`,
  `analysis/infrastructure-readiness-report.json`,
  `markdown/infrastructure-readiness.md`, `html/infrastructure-readiness.html`,
  infrastructure setups, config signals, state signals, workflow signals,
  module signals, variable signals, policy signals, package signals,
  recommended commands, risk queue, manifest/session verification coverage,
  learning-path linkage, nav entry, and `open --target
  infrastructure-readiness`.
- 2026-06-04: GREEN infrastructure-readiness smoke generated
  `/tmp/repotutor-infra-green-studies.eQrGb9/2026-06-05/local__simple-ts-app__main__d44d9594`;
  confirmed `verificationCheckedRequiredArtifacts=294`, infrastructure setups
  0, config signals 11, state signals 7, workflow signals 8, module signals 7,
  variable signals 7, policy signals 8, package signals 8, risk queue 1, all
  three new artifacts, and `open --target infrastructure-readiness` ->
  `html/infrastructure-readiness.html`.
- 2026-06-04: Verification for Upgrade 198:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 5/5 tests
  - `pnpm audit:brief`: PASS, 96/96 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 198:
  - `cb774b7` infrastructure readiness report

- 2026-06-04: AutoResearch Upgrade 199 candidate selected:
  `helm/helm`
  (`https://github.com/helm/helm`; public; Apache-2.0; 29,845 stars; 7,635
  forks; updated 2026-06-04T12:49:12Z). Compared with
  `kubernetes-sigs/kustomize`, `argoproj/argo-cd`, `fluxcd/flux2`, and
  `kubernetes/kubernetes`; selected Helm because it directly models Kubernetes
  deployment readiness through chart metadata, values, templates, release
  commands, dependency management, packaging, repositories, test hooks, and
  safety flags. Cloned ignored external source to
  `research/external-src/helm-helm` and inspected docs/source hits without
  executing external source. Clone HEAD was `827a960`; tracked file count for
  `research/external-src/helm-helm` returned `0`.
- 2026-06-04: RED deployment-readiness smoke generated
  `/tmp/repotutor-deploy-red-studies.2HHnxY/2026-06-05/local__simple-ts-app__HEAD__9c5e2546`;
  old build had `verificationCheckedRequiredArtifacts=294`, was missing
  `analysis/deployment-readiness-report.json`,
  `markdown/deployment-readiness.md`, and `html/deployment-readiness.html`, and
  `open --target deployment-readiness` failed as expected.
- 2026-06-04: Implemented Helm-style deployment-readiness report:
  `DeploymentReadinessReportSchema`,
  `analysis/deployment-readiness-report.json`,
  `markdown/deployment-readiness.md`, `html/deployment-readiness.html`,
  deployment setups, chart signals, template signals, value signals, release
  signals, safety signals, package signals, recommended commands, risk queue,
  manifest/session verification coverage, learning-path linkage, nav entry, and
  `open --target deployment-readiness`.
- 2026-06-04: GREEN deployment-readiness smoke generated
  `/tmp/repotutor-deploy-green-studies.TFOtPG/2026-06-05/local__simple-ts-app__main__9c5e2546`;
  confirmed `verificationCheckedRequiredArtifacts=297`, deployment setups 0,
  chart signals 11, template signals 12, value signals 8, release signals 12,
  safety signals 9, package signals 7, risk queue 1, all three new artifacts,
  and `open --target deployment-readiness` ->
  `html/deployment-readiness.html`.
- 2026-06-04: Verification for Upgrade 199:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 6/6 tests
  - `pnpm audit:brief`: PASS, 97/97 audit checks across 13 reports
- 2026-06-04: Pushed AutoResearch Upgrade 199:
  - `a017c51` deployment readiness report

- 2026-06-05: AutoResearch Upgrade 200 candidate selected:
  `serverless/serverless`
  (`https://github.com/serverless/serverless`; public; license `NOASSERTION`;
  46,923 stars; 5,734 forks; updated 2026-06-04T02:40:16Z). Compared with
  `aws/serverless-application-model`, `anomalyco/sst`, and `vercel/vercel`;
  selected Serverless Framework because it directly models serverless service
  readiness through `serverless.yml`, provider/runtime/stage/region, functions,
  handlers, events, resources, packaging, plugins, deploy, invoke, offline,
  logs, and safety guardrails. Cloned ignored external source to
  `research/external-src/serverless-serverless` and inspected docs/source hits
  without executing external source. Clone HEAD was `94663bd`; tracked file
  count for `research/external-src/serverless-serverless` returned `0`.
- 2026-06-05: RED serverless-readiness smoke generated
  `/tmp/repotutor-serverless-red-studies.JGaMIf/2026-06-05/local__repotutor-serverless-red-repo.BkBQ33__local__6d946f40`;
  old build had `verificationCheckedRequiredArtifacts=297`, was missing
  `analysis/serverless-readiness-report.json`,
  `markdown/serverless-readiness.md`, and `html/serverless-readiness.html`,
  and `open --target serverless-readiness` failed as expected.
- 2026-06-05: Implemented Serverless Framework-style serverless-readiness
  report: `ServerlessReadinessReportSchema`,
  `analysis/serverless-readiness-report.json`,
  `markdown/serverless-readiness.md`, `html/serverless-readiness.html`,
  serverless setups, config signals, function signals, event signals, runtime
  signals, deployment signals, safety signals, package signals, recommended
  commands, risk queue, manifest/session verification coverage, learning-path
  linkage, nav entry, and `open --target serverless-readiness`.
- 2026-06-05: GREEN serverless-readiness smoke generated
  `/tmp/repotutor-serverless-green-studies.H9Kb7c/2026-06-05/local__repotutor-serverless-green-repo.Ypcwpj__local__cb27279a`;
  confirmed `verificationCheckedRequiredArtifacts=300`, serverless setups 2,
  config signals 10, function signals 8, event signals 10, deployment signals
  10, safety signals 9, package signals 11, risk queue 0, all three new
  artifacts, and `open --target serverless-readiness` ->
  `html/serverless-readiness.html`.
- 2026-06-05: Verification for Upgrade 200:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 7/7 tests
  - `pnpm audit:brief`: PASS, 98/98 audit checks across 13 reports
- 2026-06-05: Pushed AutoResearch Upgrade 200:
  - `d841db7` serverless readiness report

- 2026-06-05: AutoResearch Upgrade 201 candidate selected: `expo/expo`
  (`https://github.com/expo/expo`; public; MIT; 49,870 stars; 12,607 forks;
  updated 2026-06-04T15:24:02Z). Compared with `facebook/react-native`,
  `cloudflare/workers-sdk`, and `vercel/edge-runtime`; selected Expo because
  it directly models mobile app readiness through `app.json`, `app.config`,
  `eas.json`, Expo Router, platform identifiers, native folders, EAS build,
  OTA updates, assets, permissions, and package/tooling signals. Cloned sparse
  ignored external source to `research/external-src/expo-expo` and inspected
  docs/templates/packages without executing external source. Clone HEAD was
  `27d742c`; tracked file count for `research/external-src/expo-expo` returned
  `0`.
- 2026-06-05: RED mobile-readiness smoke generated
  `/tmp/repotutor-mobile-red-studies.BVpqQq/2026-06-05/local__repotutor-mobile-red-repo.RXVHwE__local__e2c6e90f`;
  old build had `verificationCheckedRequiredArtifacts=300`, was missing
  `analysis/mobile-readiness-report.json`, `markdown/mobile-readiness.md`, and
  `html/mobile-readiness.html`, and `open --target mobile-readiness` failed as
  expected.
- 2026-06-05: Implemented Expo/React Native-style mobile-readiness report:
  `MobileReadinessReportSchema`, `analysis/mobile-readiness-report.json`,
  `markdown/mobile-readiness.md`, `html/mobile-readiness.html`, mobile setups,
  config signals, platform signals, navigation signals, build signals, update
  signals, asset signals, package signals, recommended commands, risk queue,
  manifest/session verification coverage, learning-path linkage, nav entry,
  and `open --target mobile-readiness`.
- 2026-06-05: GREEN mobile-readiness smoke generated
  `/tmp/repotutor-mobile-green-studies.xPywfA/2026-06-05/local__repotutor-mobile-green-repo.ZK3Ajc__local__2fbf6b9c`;
  confirmed `verificationCheckedRequiredArtifacts=303`, mobile setups 7,
  config signals 9, platform signals 8, navigation signals 6, build signals 9,
  update signals 8, asset signals 7, package signals 8, risk queue 0, all
  three new artifacts, and `open --target mobile-readiness` ->
  `html/mobile-readiness.html`.
- 2026-06-05: Verification for Upgrade 201:
  - `pnpm build`: PASS
  - RED old-head smoke: PASS
  - GREEN current smoke: PASS
  - `pnpm test`: PASS, 8/8 tests
  - `pnpm audit:brief`: PASS, 99/99 audit checks across 13 reports

## Next Actions

1. Continue next AutoResearch upgrade candidate unless the user stops.
