# AutoResearch External GitHub Scan - 2026-06-04

## Scope

Goal: find external GitHub projects similar to RepoTutor Studio, clone their
source under `research/external-src/`, analyze transferable implementation
patterns, and apply at least one upgrade to RepoTutor Studio.

No external project code was executed. Repositories were shallow-cloned for
read-only static inspection.

## Sources

### CodeBoarding/CodeBoarding

- URL: https://github.com/CodeBoarding/CodeBoarding
- Local source: `research/external-src/CodeBoarding`
- Stars at check: 2082
- Forks at check: 177
- License: MIT
- Updated: 2026-06-03T15:28:23Z
- Relevance: interactive architecture diagrams, component-level codebase
  documentation, Mermaid output, and `.codeboarding/file_coverage.json`.

Transferable patterns:

- Treat codebase understanding as a persistent artifact set, not a one-shot
  chat answer.
- Emit component/coverage files that explain how much of the repository was
  actually covered.
- Keep generated documentation navigable with diagrams and component pages.
- Support incremental analysis later by knowing which files/folders were covered.

### google/html-quiz

- URL: https://github.com/google/html-quiz
- Local source: `research/external-src/google-html-quiz`
- Stars at check: 111
- Forks at check: 104
- License: mixed repository licenses, main quiz script Apache-2.0
- Updated: 2026-03-31T07:34:00Z
- Relevance: standalone offline HTML+JavaScript quiz flow.

Transferable patterns:

- Keep quiz interaction usable offline.
- Derive question state from the DOM/static assets without server dependency.
- Keep configuration simple and inspectable.

## Adopted Upgrade

### Upgrade 1: CodeBoarding-Inspired Coverage Report

- `packages/shared/src/schemas.ts`: added `CoverageReportSchema`.
- `packages/core/src/scanner.ts`: added coverage calculation based on scanned
  files, covered file lessons, high-priority folders, and uncovered candidates.
- `packages/core/src/pipeline.ts`: writes `analysis/coverage-report.json`.
- `packages/core/src/markdown.ts`: writes `markdown/coverage.md`.
- `packages/html/src/templates.ts`: writes `html/coverage.html` and links it
  from the report navigation and index summary.

### Upgrade 2: google/html-quiz-Inspired Offline Quiz Interaction

- `packages/html/src/templates.ts`: `quiz.html` now renders each 4-choice
  question as offline browser buttons.
- `html/assets/app.js`: marks selected answers correct/wrong and updates a
  live browser-only review score.
- Persistence remains in CLI/Tauri as required; the static page is for offline
  review and does not pretend to save attempts.

### Upgrade 3: Persisted Tauri Quiz Attempts

- `apps/desktop-tauri/src-tauri/src/lib.rs`: added `load_quiz` and
  `submit_quiz` commands.
- `apps/desktop-tauri/src/App.tsx`: renders session quiz questions in the Tauri
  UI, collects A/B/C/D answers, and submits them.
- `apps/desktop-tauri/src/styles.css`: added stable quiz layout and selected
  answer state.
- Scoring still uses `repo-tutor quiz`, so `quiz-attempts.jsonl`,
  `wrong-notes.json`, Markdown, and HTML refresh stay on the shared core path.

### Upgrade 4: Source-Backed Component Graph

- `packages/shared/src/schemas.ts`: added `ComponentGraphReportSchema`.
- `packages/core/src/scanner.ts`: builds graph nodes for repo root, folders,
  files, glossary terms, and rebuild-roadmap steps, plus labeled edges and
  Mermaid text.
- `packages/core/src/pipeline.ts`: writes
  `analysis/component-graph-report.json` and reloads it during export/resume.
- `packages/core/src/markdown.ts`: writes `markdown/component-graph.md`.
- `packages/html/src/templates.ts`: writes `html/component-graph.html`, links it
  from navigation, and adds an index summary.
- `scripts/compliance-audit.mjs` and `packages/core/src/pipeline.test.ts` now
  verify the component graph artifacts.

### Upgrade 5: Incremental Re-analysis

- `packages/shared/src/schemas.ts`: added `SourceSnapshotReportSchema` and
  `IncrementalReportSchema`.
- `packages/core/src/scanner.ts`: builds a source snapshot of safe text files
  using file path, byte size, and SHA-256.
- `packages/core/src/sessions.ts`: isolates session listing so incremental
  comparison can reuse it without circular imports.
- `packages/core/src/incremental.ts`: finds the previous completed same-repo
  session and compares added, changed, removed, and unchanged files.
- `packages/core/src/pipeline.ts`: writes and reloads
  `analysis/source-snapshot-report.json` and
  `analysis/incremental-report.json`.
- `packages/core/src/markdown.ts`: writes `markdown/incremental.md`.
- `packages/html/src/templates.ts`: writes `html/incremental.html` and links it
  from navigation and the index summary.
- `scripts/compliance-audit.mjs` and `packages/core/src/pipeline.test.ts` now
  verify the incremental artifacts and previous-snapshot comparison behavior.

### Upgrade 6: Coverage Delta Summaries

- `packages/shared/src/schemas.ts`: extended `IncrementalReportSchema` with a
  `coverageDelta` object.
- `packages/core/src/incremental.ts`: reads the previous session's
  `analysis/coverage-report.json` when available and compares coverage ratio,
  covered important files, and total scanned files.
- `packages/core/src/scanner.ts`: includes current coverage values in the
  analysis-time placeholder incremental report.
- `packages/core/src/markdown.ts`: adds a coverage-change section to
  `markdown/incremental.md`.
- `packages/html/src/templates.ts`: adds coverage-change details to the index
  summary and `html/incremental.html`, with a fallback for older sessions that
  predate the `coverageDelta` field.
- `scripts/compliance-audit.mjs` and `packages/core/src/pipeline.test.ts` now
  verify `coverageDelta`; the test uses a first session with an unimportant
  scratch file and a second session without it to prove a positive ratio delta.

### Upgrade 7: Component Graph Filters

- `packages/html/src/templates.ts`: adds a node-type toolbar to
  `html/component-graph.html` with counts for all, root, folder, file, term,
  and rebuild-step nodes.
- `packages/html/src/templates.ts`: marks graph node cards with
  `data-node-type` and renders them inside `component-node-cards`.
- `html/assets/app.js`: applies graph-type filtering and global text search
  through one visibility function so large graphs can be narrowed offline.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify the graph filter markers.

### Upgrade 8: Richer Large-Repo Graph Summaries

- `packages/shared/src/schemas.ts`: extends `ComponentGraphReportSchema` with a
  `summary` object containing total node/edge counts, `nodeTypeCounts`,
  `edgeLabelCounts`, `topConnectedNodes`, and `largeRepoAdvice`.
- `packages/core/src/scanner.ts`: computes graph summary statistics from graph
  nodes and edges, including degree-ranked hub nodes.
- `packages/core/src/markdown.ts`: writes a "큰 그래프 요약" section before
  the Mermaid graph.
- `packages/html/src/templates.ts`: renders a summary panel before filters and
  includes a runtime fallback for older sessions that predate graph summaries.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify `nodeTypeCounts` and `topConnectedNodes`.

### Upgrade 9: Portable HTML Export Usability

- `packages/shared/src/schemas.ts`: extends `HtmlExportManifestSchema` with
  `manifestPath`, `readmePath`, and explicit `entrypoints`.
- `packages/html/src/templates.ts`: fills portable entrypoints for index, quiz,
  wrong notes, and component graph pages.
- `packages/core/src/quiz.ts`: writes `html/manifest.json` and
  `html/EXPORT-README.md` alongside the HTML pages and assets.
- `apps/cli/src/index.ts`: `repo-tutor export --format html` now returns
  manifest/readme paths, page/asset counts, and entrypoint paths.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify the portable export files and manifest entrypoints.

### Upgrade 10: Zipped Portable HTML Bundle Export

- `packages/core/src/exporter.ts`: adds `writeHtmlZipBundle`, a dependency-free
  store-only ZIP writer for the portable `html/` export folder.
- `packages/core/src/index.ts`: exports the bundle writer for CLI and tests.
- `apps/cli/src/index.ts`: supports `repo-tutor export --format zip` and returns
  the ZIP path, byte count, file count, regenerated HTML paths, and entrypoints.
- `packages/core/src/pipeline.test.ts`: verifies ZIP creation and the `504b0304`
  ZIP signature from a fixture study session.
- `scripts/compliance-audit.mjs`: includes the ZIP bundle writer and
  `html-report.zip` in the offline export compliance check.

### Upgrade 11: Relative Local-Path Intake for Filtered CLI Dev Runs

- `packages/core/src/intake.ts`: resolves local path candidates against an
  explicit base directory before falling back to `process.cwd()`.
- `packages/core/src/pipeline.ts`: adds optional `sourceBaseDir` to `runStudy`.
- `apps/cli/src/index.ts`: passes `INIT_CWD` as the command base directory so
  `pnpm --filter @repotutor/cli dev -- study packages/...` resolves from the
  user's shell directory.
- `packages/core/src/pipeline.test.ts`: proves a relative local source can be
  resolved from a base directory different from the process CWD.
- `scripts/compliance-audit.mjs`: includes the path-base handoff in the safe
  intake compliance check.

### Upgrade 12: Large-Repo File Navigation Filters

- `packages/html/src/templates.ts`: adds extension and top-folder filter
  toolbars to `files.html`.
- `packages/html/src/templates.ts`: marks file lesson cards with
  `data-file-ext` and `data-file-dir` so large file lists can be narrowed
  offline.
- `html/assets/app.js`: combines file filters with the existing global search
  and component-graph filters.
- `packages/core/src/pipeline.test.ts`: verifies file navigation markers in the
  generated fixture `files.html`.
- `scripts/compliance-audit.mjs`: includes the file navigation markers in the
  offline HTML export compliance check.

### Upgrade 13: Portable Export Integrity Metadata

- `packages/shared/src/schemas.ts`: extends `HtmlExportManifestSchema` page and
  asset records with `bytes` and `sha256`, plus an `integrity` summary.
- `packages/html/src/templates.ts`: computes byte counts and SHA-256 hashes
  while rendering the portable HTML manifest.
- `packages/core/src/quiz.ts`: renders integrity coverage and short hashes in
  `html/EXPORT-README.md`.
- `packages/core/src/pipeline.test.ts`: verifies manifest integrity fields and
  README integrity text.
- `scripts/compliance-audit.mjs`: includes `integrity`, `sha256`, and `bytes`
  in the offline export compliance check.

### Upgrade 14: Direct Export Integrity Verification

- `packages/core/src/exporter.ts`: adds `verifyHtmlExportManifest`, which
  recalculates byte counts and SHA-256 hashes for every manifest-listed page and
  asset.
- `apps/cli/src/index.ts`: adds `repo-tutor verify-export <session-id-or-path>`.
- `packages/core/src/pipeline.test.ts`: verifies the core verifier returns
  `ok: true` for a generated fixture export.
- `scripts/compliance-audit.mjs`: includes `verify-export` and
  `verifyHtmlExportManifest` in the CLI/export compliance checks.

### Upgrade 15: Tamper-Negative Export Verification

- `apps/cli/src/index.ts`: `repo-tutor verify-export` now sets a non-zero exit
  code when manifest verification fails.
- `packages/core/src/pipeline.test.ts`: appends to generated `html/index.html`
  and verifies `verifyHtmlExportManifest` reports `ok: false` for that file.
- `scripts/compliance-audit.mjs`: checks the CLI failure path includes
  `process.exitCode`.

### Upgrade 16: Export Integrity Reporting

- `apps/cli/src/index.ts`: `repo-tutor export --format html|zip` now verifies
  the freshly written HTML export before returning.
- `apps/cli/src/index.ts`: export JSON includes `integrityOk` and
  `integrityCheckedFiles`.
- `apps/cli/src/index.ts`: export fails closed if integrity verification fails.
- `scripts/compliance-audit.mjs`: includes the export integrity JSON fields in
  the offline export compliance check.

### Upgrade 17: Source Evidence Snippets for File Lessons

- `packages/shared/src/schemas.ts`: extends `FileLessonSchema` with
  `sourceEvidence` entries containing line, kind, and snippet.
- `packages/core/src/scanner.ts`: extracts short source-backed
  import/export/config/entry/test/text snippets from safe text files.
- `packages/core/src/markdown.ts`: renders `### 소스 근거` under each file
  lesson in `markdown/files.md`.
- `packages/html/src/templates.ts`: renders source evidence snippets in
  `html/files.html`.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify source evidence artifacts.

### Upgrade 18: Source Evidence Coverage Summaries

- `packages/shared/src/schemas.ts`: extends `CoverageReportSchema` with
  evidence-backed file counts, evidence coverage ratio, and files without
  evidence.
- `packages/core/src/scanner.ts`: calculates source evidence coverage from file
  lessons.
- `packages/core/src/markdown.ts`: renders evidence coverage in
  `markdown/coverage.md`.
- `packages/html/src/templates.ts`: renders evidence coverage in the index
  summary and `html/coverage.html`.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify evidence coverage artifacts.

### Upgrade 19: Source Evidence Drilldown Filters

- `packages/html/src/templates.ts`: adds source-evidence filter controls to
  `html/files.html`.
- `packages/html/src/templates.ts`: marks file lesson cards with
  `data-source-evidence` so learners can isolate files that have or lack source
  evidence.
- `packages/html/src/templates.ts`: renders source-evidence gaps in
  `html/coverage.html` as links back to matching `files.html` lesson anchors.
- `html/assets/app.js`: combines source-evidence filtering with global search,
  graph filters, extension filters, and folder filters.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify the source evidence filter markers.

### Upgrade 20: Source Evidence Kind Breakdowns

- `packages/shared/src/schemas.ts`: extends `CoverageReportSchema` with
  `evidenceKindCounts`.
- `packages/core/src/scanner.ts`: counts file lesson source evidence by kind
  across import, export, entry, config, test, and text snippets.
- `packages/core/src/markdown.ts`: renders a `소스 근거 종류` section in
  `markdown/coverage.md`.
- `packages/html/src/templates.ts`: renders evidence kind counts in the index
  coverage card and `html/coverage.html`.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify evidence kind breakdown artifacts.

### Upgrade 21: Source Evidence Source-File Links

- `packages/core/src/markdown.ts`: links each source evidence bullet in
  `markdown/files.md` back to the copied `../source/...` file.
- `packages/html/src/templates.ts`: adds `원본 열기` source links under each
  source evidence snippet in `html/files.html`.
- `packages/html/src/templates.ts`: adds a compact `source-link` style for
  source traceability links.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify source-file link markers.

### Upgrade 22: Source Evidence Index Pages

- `packages/core/src/markdown.ts`: emits `markdown/evidence.md` with a
  repository-wide source evidence index.
- `packages/html/src/templates.ts`: emits `html/evidence.html`, adds Evidence
  navigation, and links evidence cards to file lessons and copied source files.
- `packages/html/src/templates.ts`: includes `html/evidence.html` as a portable
  export manifest entrypoint.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify evidence index artifacts.

### Upgrade 23: Source Evidence Kind Filters

- `packages/html/src/templates.ts`: adds an evidence-kind filter toolbar to
  `html/evidence.html`.
- `packages/html/src/templates.ts`: reuses evidence kind counts to render
  import, export, entry, config, test, and text filter buttons.
- `html/assets/app.js`: combines evidence kind filtering with global search and
  existing file/component filters.
- `packages/core/src/pipeline.test.ts` and `scripts/compliance-audit.mjs` now
  verify evidence kind filter markers.

### Upgrade 24: Normalized Source Evidence Index Reports

- `packages/shared/src/schemas.ts`: adds `EvidenceIndexReportSchema`.
- `packages/core/src/scanner.ts`: builds a normalized evidence index from file
  lesson source evidence rows.
- `packages/core/src/pipeline.ts`: writes
  `analysis/evidence-index-report.json`.
- `packages/core/src/pipeline.test.ts`: verifies evidence index counts and
  lesson/source links.
- `scripts/compliance-audit.mjs`: verifies the new report and includes
  `packages/core/src/pipeline.ts` in the lesson-generation audit scope.

### Upgrade 25: CLI Source Evidence Report Access

- `apps/cli/src/index.ts`: adds `repo-tutor evidence <session-id-or-path>`.
- `apps/cli/src/index.ts`: supports `--kind` filtering and `--limit` for
  evidence report rows.
- `apps/cli/src/index.ts`: returns `totalEvidenceItems`, `evidenceByKind`,
  `evidenceByFile`, filtered rows, lesson links, and source links as JSON.
- `scripts/compliance-audit.mjs`: verifies the new headless CLI command.

### Upgrade 26: CLI Source Evidence File Filtering

- `apps/cli/src/index.ts`: adds `--file <path>` to `repo-tutor evidence`.
- `apps/cli/src/index.ts`: returns `filteredFile` in evidence command JSON.
- `scripts/compliance-audit.mjs`: verifies the file-filter CLI surface.

### Upgrade 27: Markdown Output for CLI Source Evidence

- `apps/cli/src/index.ts`: adds `--format json|markdown` to
  `repo-tutor evidence`.
- `apps/cli/src/index.ts`: renders human-readable Markdown evidence summaries
  with filters, kind counts, lesson links, source links, and snippets.
- `scripts/compliance-audit.mjs`: verifies the Markdown CLI output surface.

### Upgrade 28: Source Evidence Integrity Verification

- `packages/core/src/evidence.ts`: adds `verifyEvidenceIndexReport` for
  fail-closed verification of `analysis/evidence-index-report.json`.
- `packages/core/src/evidence.ts`: checks copied source paths, encoded source
  hrefs, lesson HTML files, lesson anchors, report count consistency, and
  session-root path safety.
- `apps/cli/src/index.ts`: adds
  `repo-tutor verify-evidence <session-id-or-path>` with JSON output and
  non-zero exit on verification failure.
- `packages/core/src/pipeline.test.ts`: verifies the positive report path and a
  missing copied source file negative path.
- `scripts/compliance-audit.mjs`: verifies the new core verifier and CLI
  command surface.

### Upgrade 29: Session-Level Readiness Verification

- `packages/core/src/session-verifier.ts`: adds
  `verifyStudySessionArtifacts` as an aggregate readiness gate.
- `packages/core/src/session-verifier.ts`: checks `session.json`, required
  analysis/Markdown/HTML artifacts, HTML export integrity, and source evidence
  integrity without hiding the underlying verifier results.
- `apps/cli/src/index.ts`: adds
  `repo-tutor verify-session <session-id-or-path>` with JSON output and
  non-zero exit on any failed sub-check.
- `packages/core/src/pipeline.test.ts`: verifies the complete-session pass path
  and a combined tampered HTML plus missing source negative path.
- `scripts/compliance-audit.mjs`: verifies the aggregate verifier and CLI
  command surface.

### Upgrade 30: Markdown Output for Session Verification

- `apps/cli/src/index.ts`: adds `--format json|markdown` to
  `repo-tutor verify-session`.
- `apps/cli/src/index.ts`: renders a human-readable session verification
  summary with PASS/FAIL status, artifact counts, sub-check statuses, and
  compact failure rows.
- `scripts/compliance-audit.mjs`: verifies the Markdown session verification
  output surface.

### Upgrade 31: Persistent Session Verification Reports

- `packages/core/src/pipeline.ts`: runs `verifyStudySessionArtifacts` after the
  study artifacts and HTML export are written.
- `packages/core/src/pipeline.ts`: writes
  `analysis/session-verification-report.json` for every completed study run.
- `packages/core/src/pipeline.ts`: fails closed if the generated artifact set
  does not pass aggregate session verification.
- `packages/core/src/pipeline.test.ts`: verifies the persistent report exists
  and records `ok: true`, `checkedRequiredArtifacts`, and evidence-index status.
- `scripts/compliance-audit.mjs`: verifies the persistent report artifact.

### Upgrade 32: Markdown Session Verification Reports

- `packages/core/src/markdown.ts`: adds `renderSessionVerificationMarkdown`.
- `packages/core/src/pipeline.ts`: writes
  `markdown/session-verification.md` after the aggregate verifier runs.
- `packages/core/src/markdown.ts`: updates `README.study.md` to point to both
  JSON and Markdown session verification reports.
- `packages/core/src/pipeline.test.ts`: verifies the Markdown report contains
  PASS status and sub-check statuses.
- `scripts/compliance-audit.mjs`: verifies the Markdown report artifact.

### Upgrade 33: HTML Session Verification Entrypoint

- `packages/html/src/templates.ts`: adds `html/session-verification.html`.
- `packages/html/src/templates.ts`: links the Verification page from the
  sidebar, index summary, and HTML manifest entrypoints.
- `packages/html/src/templates.ts`: links to
  `../analysis/session-verification-report.json` and
  `../markdown/session-verification.md` without embedding self-referential
  verification data in the HTML manifest.
- `packages/core/src/pipeline.test.ts`: verifies the HTML page and report links.
- `scripts/compliance-audit.mjs`: verifies the HTML verification entrypoint.

### Upgrade 34: Study Completion Verification Output

- `apps/cli/src/index.ts`: reads
  `analysis/session-verification-report.json` after `runStudy` completes.
- `apps/cli/src/index.ts`: includes `verificationOk`, verification report
  paths, checked required artifact count, and sub-check statuses in
  `repo-tutor study` completion JSON.
- `scripts/compliance-audit.mjs`: verifies the study output verification
  fields.

### Upgrade 35: List Verification Summaries

- `apps/cli/src/index.ts`: `repo-tutor list` now reads each session's
  `analysis/session-verification-report.json`.
- `apps/cli/src/index.ts`: list rows include `verificationStatus`,
  `verificationOk`, verification report paths, checked artifact count, and
  sub-check statuses.
- `apps/cli/src/index.ts`: adds `repo-tutor list --verified-only` to show only
  sessions whose aggregate verification passed.
- `scripts/compliance-audit.mjs`: verifies the list verification output surface.

Local verification:

- `pnpm build`: PASS
- `pnpm test`: PASS
- `cargo check`: PASS
- Fixture study generated:
  `studies/2026-06-04/local__simple-ts-app__main__e47698ac/analysis/coverage-report.json`
- Later fixture study generated:
  `studies/2026-06-04/local__simple-ts-app__main__c0316b25/analysis/component-graph-report.json`
  plus `markdown/component-graph.md` and `html/component-graph.html`
- Latest fixture study generated:
  `studies/2026-06-04/local__simple-ts-app__main__a30cec65/analysis/source-snapshot-report.json`
  plus `analysis/incremental-report.json`, `markdown/incremental.md`, and
  `html/incremental.html`
- Second latest fixture study generated:
  `studies/2026-06-04/local__simple-ts-app__main__a30cec65-2/analysis/incremental-report.json`
  with baseline session `mpy9kgb5-91d5524a`
- Temp CLI delta smoke generated:
  `/tmp/repotutor-delta-studies-lJgVZf/2026-06-04/local__repotutor-delta-source-p1n5wA__local__eb48ab36/analysis/incremental-report.json`
  with `coverageRatioDelta: 0.19999999999999996` and summary
  `커버리지 비율은 80.0%에서 100.0%로 20.0%p 변했습니다.`
- Temp CLI graph-filter smoke generated:
  `/tmp/repotutor-graph-filter-studies-90McrL/2026-06-04/local__simple-ts-app__main__6aeb168b/html/component-graph.html`
  with `data-graph-filter`, `data-node-type`, `graph-filter-toolbar`, and
  `component-node-cards`; `assets/app.js` includes the `[data-graph-filter]`
  handler.
- Temp CLI graph-summary smoke generated:
  `/tmp/repotutor-graph-summary-studies-tohE0d/2026-06-04/local__simple-ts-app__main__28f1bc56/analysis/component-graph-report.json`
  with 23 nodes, 22 edges, node type counts `{root: 1, folder: 1, file: 4, term: 7, rebuild-step: 10}`,
  and top hub `README.md` degree 8; Markdown and HTML both include
  `큰 그래프 요약`.
- Temp CLI export-polish smoke generated:
  `/tmp/repotutor-export-polish-studies-eTpBRE/2026-06-04/local__simple-ts-app__main__c8fa07ea/html/manifest.json`
  and `html/EXPORT-README.md`; CLI export returned 4 entrypoints, 14 pages, and
  2 assets.
- Temp CLI ZIP export smoke generated:
  `/tmp/repotutor-zip-smoke.eay76P/2026-06-04/local__simple-ts-app__main__8f7c2b94/exports/html-report.zip`
  with 18 files, 72,114 bytes, signature `504b0304`, 14 pages, 2 assets, and
  `unzip -l` entries for `index.html`, `manifest.json`, and
  `EXPORT-README.md`.
- Temp CLI relative-path smoke generated:
  `/tmp/repotutor-relative-cli-smoke.iLBw7a/2026-06-04/local__simple-ts-app__main__d3264425/html/index.html`
  from `packages/core/tests/fixtures/simple-ts-app` with 15 quiz questions.
- Temp CLI file-navigation smoke generated:
  `/tmp/repotutor-file-nav-smoke.YlVkai/2026-06-04/local__simple-ts-app__main__df6a42da/html/files.html`
  with `file-nav-toolbar`, `data-file-ext-filter`, `data-file-dir-filter`,
  `data-file-ext=".ts"`, `data-file-dir="src"`, and matching handlers in
  `html/assets/app.js`.
- Temp CLI manifest-integrity smoke generated:
  `/tmp/repotutor-manifest-integrity-smoke.DSvUWT/2026-06-04/local__simple-ts-app__main__3a2cb784/html/manifest.json`
  with 16 covered files, `index.html` byte count 3,684, and verified
  `index.html` SHA-256 prefix `a34286246376`.
- Temp CLI verify-export smoke generated:
  `/tmp/repotutor-verify-export-smoke.1jhUun/2026-06-04/local__simple-ts-app__main__bf88883f`
  and verified 16 manifest files with `ok: true` and no failures.
- Temp CLI tamper-verify smoke generated:
  `/tmp/repotutor-tamper-verify-smoke.BRu06X/2026-06-04/local__simple-ts-app__main__67bd1c8e`,
  appended to `html/index.html`, and confirmed `verify-export` returned exit
  code 1, `ok: false`, and failure path `html/index.html`.
- Temp CLI export-integrity JSON smoke generated:
  `/tmp/repotutor-export-integrity-json-smoke.dkSgoj/2026-06-04/local__simple-ts-app__main__f5a93a48`
  and returned `integrityOk: true`, `integrityCheckedFiles: 16`, 18 ZIP files,
  and 76,489 ZIP bytes.
- Temp CLI source-evidence smoke generated:
  `/tmp/repotutor-source-evidence-smoke.9DljR1/2026-06-04/local__simple-ts-app__main__25cfde25`
  with `sourceEvidence` JSON, Markdown `### 소스 근거`, HTML
  `source-evidence`, and source snippets such as
  `import { createGreeting } from "./message.js";`.
- Temp CLI evidence-coverage smoke generated:
  `/tmp/repotutor-evidence-coverage-smoke.9WcFv0/2026-06-04/local__simple-ts-app__main__d687db03`
  with 4 evidence-backed files, evidence coverage ratio 1.0, HTML
  `소스 근거 파일` / `근거 비율`, and Markdown source-evidence coverage
  sections.
- Temp CLI evidence-filter smoke generated:
  `studies/2026-06-04/local__simple-ts-app__main__eb9b601e/html/files.html`
  with `data-source-evidence-filter`, `data-source-evidence="present"`,
  `근거 있음`, `근거 부족`, and matching source-evidence filtering logic in
  `html/assets/app.js`.
- Temp CLI evidence-kind smoke generated:
  `/tmp/repotutor-evidence-kind-smoke.qk4tIy/2026-06-04/local__simple-ts-app__main__63a77df2`
  with `evidenceKindCounts` `{text: 2, config: 4, import: 1, entry: 1, export:
  1}`, Markdown `## 소스 근거 종류`, and HTML `근거 종류` / `소스 근거 종류`.
- Temp CLI source-link smoke generated:
  `/tmp/repotutor-source-link-smoke.5z54ZK/2026-06-04/local__simple-ts-app__main__946bc81d`
  with HTML `source-link`, `원본 열기`, `../source/src/main.ts`, Markdown
  `[원본](../source/src/main.ts)`, and copied `source/src/main.ts` present.
- Temp CLI evidence-index smoke generated:
  `/tmp/repotutor-evidence-index-smoke.8xjsZh/2026-06-04/local__simple-ts-app__main__8a6f5e80`
  with `html/evidence.html`, `markdown/evidence.md`, `evidence-index-cards`,
  links to `files.html#src-main.ts`, `../source/src/main.ts`, and manifest
  entrypoint `html/evidence.html`.
- Temp CLI evidence-kind-filter smoke generated:
  `/tmp/repotutor-evidence-kind-filter-smoke.HkAyVZ/2026-06-04/local__simple-ts-app__main__a3e504ae`
  with `evidence-kind-toolbar`, six `data-evidence-kind-filter` buttons,
  `data-evidence-kind="import"`, and matching `evidenceKind` / `evidenceOk`
  logic in `html/assets/app.js`.
- Temp CLI evidence-report smoke generated:
  `/tmp/repotutor-evidence-report-smoke.YejPLz/2026-06-04/local__simple-ts-app__main__020887fb`
  with `analysis/evidence-index-report.json`, `totalEvidenceItems: 9`,
  `evidenceByKind`, `lessonHref: html/files.html#src-main.ts`,
  `sourcePath: source/src/main.ts`, and `sourceHref: source/src/main.ts`.
- `pnpm audit:brief` initially caught the new artifact token outside the audit
  file scope; after adding `packages/core/src/pipeline.ts` to the
  lesson-generation audit, `pnpm audit:brief` passed 13/13.
- Temp CLI evidence command smoke generated:
  `/tmp/repotutor-evidence-cli-smoke.hnBk02/2026-06-04/local__simple-ts-app__main__dba4cad7`
  and `repo-tutor evidence <session> --kind import --limit 1` returned
  `filteredKind: import`, `returnedItems: 1`, `totalEvidenceItems: 9`,
  `evidenceByKind`, `evidenceByFile`, and `sourceHref: source/src/main.ts`.
- Temp CLI evidence file-filter smoke generated:
  `/tmp/repotutor-evidence-file-cli-smoke.VdnFYA/2026-06-04/local__simple-ts-app__main__f54b60e4`
  and `repo-tutor evidence <session> --kind import --file src/main.ts --limit 5`
  returned `filteredKind: import`, `filteredFile: src/main.ts`,
  `returnedItems: 1`, and `sourceHref: source/src/main.ts`.
- Temp CLI evidence markdown smoke generated:
  `/tmp/repotutor-evidence-md-cli-smoke.T4Yahz/2026-06-04/local__simple-ts-app__main__b9bf2e51`
  and `repo-tutor evidence <session> --kind import --file src/main.ts --limit 5 --format markdown`
  returned `# RepoTutor Evidence`, `Filters: kind=import, file=src/main.ts`,
  `src/main.ts:L1`, and `Source: source/src/main.ts`.
- Temp CLI verify-evidence smoke generated:
  `/tmp/repotutor-verify-evidence-smoke.qrxS8b/2026-06-04/local__simple-ts-app__main__625d78d3`
  and `repo-tutor verify-evidence <session>` returned `ok: true`,
  `checkedItems: 9`, `checkedSourceFiles: 4`, `checkedSourceLinks: 4`,
  `checkedLessonLinks: 4`, and no failures.
- Temp CLI verify-evidence negative smoke removed `source/src/main.ts` from
  that temp session and confirmed `repo-tutor verify-evidence <session>` exited
  1 with `ok: false`, `missing-source-path`, and `missing-source-href`.
- Temp CLI verify-session smoke generated:
  `/tmp/repotutor-verify-session-smoke.dNZW6T/2026-06-04/local__simple-ts-app__main__02727b8a`
  and `repo-tutor verify-session <session>` returned `ok: true`,
  `checkedRequiredArtifacts: 11`, `checks.htmlExport: true`, and
  `checks.evidenceIndex: true`.
- Temp CLI verify-session negative smoke appended to `html/index.html`, removed
  `source/src/main.ts`, and confirmed `repo-tutor verify-session <session>`
  exited 1 with `htmlExport: false`, `evidenceIndex: false`,
  `html-export-failed`, and `evidence-index-failed`.
- Temp CLI verify-session Markdown smoke generated:
  `/tmp/repotutor-verify-session-md-smoke.AIwXar/2026-06-04/local__simple-ts-app__main__9c815df5`
  and `repo-tutor verify-session <session> --format markdown` returned
  `# RepoTutor Session Verification`, `Status: PASS`, four PASS sub-checks, and
  `Failures` as `none`.
- Temp CLI persistent session report smoke generated:
  `/tmp/repotutor-session-report-smoke.oxj2h3/2026-06-04/local__simple-ts-app__main__a5bc3b3f`
  with `analysis/session-verification-report.json` containing `ok: true`,
  `checkedRequiredArtifacts: 11`, `htmlExport: true`, `evidenceIndex: true`,
  and zero failures.
- Temp CLI session verification Markdown report smoke generated:
  `/tmp/repotutor-session-md-report-smoke.wybixW/2026-06-04/local__simple-ts-app__main__10a43db1`
  with `markdown/session-verification.md` containing `# 세션 검증`,
  `상태: PASS`, all four sub-checks as PASS, and `실패 항목` as `없음`.
- Temp CLI session verification HTML smoke generated:
  `/tmp/repotutor-session-html-smoke.C9HLsl/2026-06-04/local__simple-ts-app__main__3a4153ce`
  with `html/session-verification.html`, links to the JSON and Markdown
  verification reports, a manifest page entry, a manifest entrypoint, and 18
  manifest-covered files.
- Temp CLI study verification-output smoke generated:
  `/tmp/repotutor-study-verification-output-smoke.iOjSiV/2026-06-04/local__simple-ts-app__main__8acedeae`
  and `repo-tutor study` returned `verificationOk: true`,
  `verificationReport`, `verificationMarkdown`, `verificationHtml`,
  `verificationCheckedRequiredArtifacts: 11`, and all four `verificationChecks`
  as true.
- Temp CLI list verification smoke generated:
  `/tmp/repotutor-list-verification-smoke.7R2dO9/2026-06-04/local__simple-ts-app__main__cca0b13a`
  and `repo-tutor list --verified-only` returned one verified session with
  `verificationStatus: passed`, `verificationOk: true`, verification
  report/Markdown/HTML paths, `verificationCheckedRequiredArtifacts: 11`,
  `htmlExport: true`, and `evidenceIndex: true`.
- `pnpm audit:brief`: PASS, 13/13 audit reports
- `gitleaks protect --staged --no-banner --redact`: PASS before pushed commits.
- Full-dir gitleaks can flag ignored Cargo `target/` artifacts after
  `cargo check`; pushed content is guarded with staged gitleaks.

## Deferred Candidate Backlog

1. Continue source-backed usability upgrades.
