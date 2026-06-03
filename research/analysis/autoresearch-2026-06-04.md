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

### Upgrade 36: Target-Aware Open Command

- `apps/cli/src/index.ts`: `repo-tutor open` now accepts `--target` and
  defaults to `index`.
- `apps/cli/src/index.ts`: maps target names including `verification`,
  `evidence`, `quiz`, `coverage`, `component-graph`, `wrong-notes`, and other
  generated pages to their HTML filenames.
- `apps/cli/src/index.ts`: fails closed for unsupported targets with
  `Unsupported open target: <target>`.
- `scripts/compliance-audit.mjs`: verifies the open-target CLI tokens.

### Upgrade 37: Open Target Discovery

- `apps/cli/src/index.ts`: `repo-tutor open --list-targets` prints all
  supported HTML target names and filenames as JSON.
- `apps/cli/src/index.ts`: target discovery works without resolving a session
  path, so users can inspect available pages before choosing a session.
- `apps/cli/src/index.ts`: `openTargetFile` now reuses the same target table as
  `--list-targets`.
- `scripts/compliance-audit.mjs`: verifies the list-targets CLI surface.

### Upgrade 38: Fail-Closed Open Targets

- `apps/cli/src/index.ts`: `repo-tutor open` now checks that the selected HTML
  target exists and is a readable file before printing the path.
- `apps/cli/src/index.ts`: missing target files fail with
  `Open target file not found: <path>`.
- `apps/cli/src/index.ts`: `open --list-targets` remains session-free and does
  not require target file existence.
- `scripts/compliance-audit.mjs`: verifies the fail-closed open target tokens.

### Upgrade 39: Resume Page Targets

- `apps/cli/src/index.ts`: `repo-tutor resume` now includes
  `verificationStatus`, verification report paths, checked artifact counts, and
  verification checks.
- `apps/cli/src/index.ts`: `repo-tutor resume` returns `htmlTargets` for all
  generated pages using the same target table as `open`.
- `apps/cli/src/index.ts`: resume output now points directly to evidence,
  verification, quiz, component graph, and other learning pages.
- `scripts/compliance-audit.mjs`: verifies the resume target metadata tokens.

### Upgrade 40: Markdown Resume Output

- `apps/cli/src/index.ts`: `repo-tutor resume --format markdown` now renders a
  human-readable session resume.
- `apps/cli/src/index.ts`: the Markdown output includes verification status,
  verification report paths, all HTML targets, and verification check statuses.
- `apps/cli/src/index.ts`: unsupported resume formats fail with
  `resume supports --format json or markdown`.
- `scripts/compliance-audit.mjs`: verifies the Markdown resume output surface.

### Upgrade 41: Markdown Session Listing

- `apps/cli/src/index.ts`: `repo-tutor list --format markdown` now renders a
  human-readable session table.
- `apps/cli/src/index.ts`: the Markdown list includes session id, repo,
  creation time, mode, score, wrong count, verification status, and HTML path.
- `apps/cli/src/index.ts`: `list --verified-only --format markdown` filters
  before rendering.
- `scripts/compliance-audit.mjs`: verifies the Markdown list output surface.

### Upgrade 42: Bounded Session Listing

- `apps/cli/src/index.ts`: `repo-tutor list --limit N` now limits returned rows
  after `--verified-only` filtering.
- `apps/cli/src/index.ts`: the limit applies to both JSON and Markdown list
  output.
- `apps/cli/src/index.ts`: invalid limits fail closed with
  `limit must be a positive integer`.
- `scripts/compliance-audit.mjs`: verifies the list limit CLI surface.

### Upgrade 43: Verification-Status Session Filters

- `apps/cli/src/index.ts`: `repo-tutor list --status passed|failed|missing|all`
  now filters sessions by verification status.
- `apps/cli/src/index.ts`: status filtering happens before `--verified-only`,
  `--limit`, and JSON/Markdown rendering.
- `apps/cli/src/index.ts`: invalid status values fail closed with
  `list supports --status passed, failed, missing, or all.`
- `scripts/compliance-audit.mjs`: verifies the list status CLI surface.

### Upgrade 44: Repo-Filtered Session Listing

- `apps/cli/src/index.ts`: `repo-tutor list --repo <owner/name-or-name>` now
  filters sessions by full repo id or repo basename.
- `apps/cli/src/index.ts`: repo filtering happens before `--status`,
  `--verified-only`, `--limit`, and JSON/Markdown rendering.
- `apps/cli/src/index.ts`: missing or empty repo filters fail closed with
  `repo must be a non-empty string`.
- `scripts/compliance-audit.mjs`: verifies the repo-filter list CLI surface.

### Upgrade 45: Sorted Session Listing

- `apps/cli/src/index.ts`: `repo-tutor list --sort newest|oldest` now sorts
  sessions by `createdAt`.
- `apps/cli/src/index.ts`: sorting happens after repo/status/verified filters
  and before `--limit`, JSON, and Markdown rendering.
- `apps/cli/src/index.ts`: invalid sort values fail closed with
  `list supports --sort newest or oldest.`
- `scripts/compliance-audit.mjs`: verifies the list sort CLI surface.

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
- Temp CLI open-target smoke generated:
  `/tmp/repotutor-open-target-smoke.5JnnCP/2026-06-04/local__simple-ts-app__main__e9a3fc98`;
  `repo-tutor open --target verification`, `--target evidence`, and
  `--target quiz` returned existing HTML page paths, while `--target nope`
  exited 1 with `Unsupported open target: nope`.
- Temp CLI open-target-list smoke generated:
  `/tmp/repotutor-open-target-list-smoke.WK6yKx/2026-06-04/local__simple-ts-app__main__fc9d7184`;
  `repo-tutor open --list-targets` returned 17 targets including
  `verification`, `evidence`, `quiz`, and `component-graph`, and
  `open --target verification`, `--target evidence`, and `--target quiz`
  returned existing files.
- Temp CLI open-exists smoke generated:
  `/tmp/repotutor-open-exists-smoke.oXYr5x/2026-06-04/local__simple-ts-app__main__35d90f7a`;
  `open --target verification` returned an existing file, then deleting
  `html/session-verification.html` made the same command exit 1 with
  `Open target file not found`.
- Temp CLI resume-targets smoke generated:
  `/tmp/repotutor-resume-targets-smoke.nVkVm8/2026-06-04/local__simple-ts-app__main__643161c4`;
  `repo-tutor resume` returned `verificationStatus: passed`, 17 `htmlTargets`,
  and direct `verification`, `evidence`, and `quiz` page paths.
- Temp CLI resume-markdown smoke generated:
  `/tmp/repotutor-resume-md-smoke.2S1j83/2026-06-04/local__simple-ts-app__main__5fc5ecdd`;
  `repo-tutor resume --format markdown` returned `# RepoTutor Resume`,
  `Verification status: passed`, direct verification/evidence/quiz paths, and
  `session: PASS`.
- Temp CLI list-markdown smoke generated:
  `/tmp/repotutor-list-md-smoke.wN4Bip`; `repo-tutor list --verified-only
  --format markdown` returned `# RepoTutor Sessions`, `Returned sessions: 1`, a
  session table, `passed`, and `html/index.html`.
- Temp CLI list-limit smoke generated:
  `/tmp/repotutor-list-limit-smoke.Getzel`; two fixture sessions were created,
  `list --verified-only --limit 1` returned one JSON row,
  `list --verified-only --limit 1 --format markdown` returned
  `Returned sessions: 1`, and `--limit 0` exited 1 with
  `limit must be a positive integer`.
- Temp CLI list-status smoke generated:
  `/tmp/repotutor-list-status-smoke.ZfCoNP`; after removing one generated
  session verification report, `list --status passed` returned one passed row,
  `list --status missing` returned one missing row in JSON and Markdown, and
  `--status stale` exited 1 with `list supports --status`.
- Temp CLI list-repo smoke generated:
  `/tmp/repotutor-list-repo-smoke.XIo0gm`; two copied fixture repos `repo-alpha`
  and `repo-beta` were studied, `list --repo repo-alpha` returned one JSON row
  for `local/repo-alpha`, `list --repo local/repo-beta --format markdown`
  returned one Markdown row, and missing `--repo` value exited 1 with
  `repo must be a non-empty string`.
- Temp CLI list-sort smoke generated:
  `/tmp/repotutor-list-sort-smoke.rLGkoH`; two fixture sessions had
  `createdAt` set to `2001-01-01T00:00:00.000Z` and
  `2099-01-01T00:00:00.000Z`; `list --sort newest --limit 1` returned the 2099
  row, `list --sort oldest --limit 1` returned the 2001 row, Markdown oldest
  output included the 2001 timestamp, and `--sort random` exited 1 with
  `list supports --sort`.

### Upgrade 46: Learner-Level Session Filters

- Added `learnerLevel` to `repo-tutor list` JSON rows as `level`, so quick
  terminal triage can distinguish beginner, junior, and senior learning
  sessions without opening `session.json`.
- Added `repo-tutor list --level beginner|junior|senior|all` with fail-closed
  validation and composition with existing repo, verification status, sort,
  verified-only, limit, and format filters.
- Added a `Level` column to Markdown session lists for reviewer-friendly
  summaries.
- Temp CLI list-level smoke generated
  `/tmp/repotutor-list-level-smoke.Ue9Ehd` with two fixture sessions using
  `--level beginner` and `--level senior`; `list --level senior` returned one
  JSON row with `level: senior`, `list --level beginner --format markdown`
  returned the `Level` column and `beginner`, and `--level expert` exited 1
  with `list supports --level`.

### Upgrade 47: Resume Mode and Level Context

- Added session `studyMode` and `learnerLevel` to `repo-tutor resume` JSON as
  `mode` and `level`, so a resumed session carries the same learning-context
  signal as `repo-tutor list`.
- Added `Study mode` and `Learner level` lines to `repo-tutor resume --format
  markdown` for portable handoff summaries.
- Temp CLI resume-level smoke generated
  `/tmp/repotutor-resume-level-smoke.5JYl1L`; `repo-tutor resume` returned
  `mode: deep` and `level: junior`, and `repo-tutor resume --format markdown`
  returned `Study mode: deep` and `Learner level: junior`.

### Upgrade 48: Open All HTML Targets

- Added `repo-tutor open <session> --target all` to return a JSON map of all
  concrete HTML target paths for shell automation and handoff scripts.
- The `all` path is fail-closed: every target file is checked before output, so
  a stale or partial HTML export is surfaced immediately.
- Temp CLI open-all smoke generated `/tmp/repotutor-open-all-smoke.zJptpK`;
  `open --target all` returned existing paths for `index`, `verification`,
  `evidence`, `quiz`, and `component-graph`, and deleting `html/quiz.html`
  made the command exit 1 with `Open target file not found`.

### Upgrade 49: Doctor Capability Metadata

- Enriched `repo-tutor doctor` with machine-readable command metadata, supported
  output formats, list filters, and open target names.
- This makes operator checks and shell wrappers able to discover current CLI
  surfaces without scraping help text.
- Temp CLI doctor-metadata smoke generated
  `/tmp/repotutor-doctor-metadata-smoke.I5Ezqp`; `repo-tutor doctor` returned
  commands including `study`, `list`, `open`, and `doctor`, list filters for
  `level` and `status`, Markdown resume support, and open targets including
  `verification` and `all`.

### Upgrade 50: Doctor Markdown Output

- Added `repo-tutor doctor --format markdown` for operator-friendly handoffs
  while preserving JSON as the default machine-readable output.
- Added fail-closed format validation so unsupported formats return a direct
  `doctor supports --format json or markdown` error.
- Temp CLI doctor-markdown smoke generated
  `/tmp/repotutor-doctor-md-smoke.1a0B3j`; Markdown output included
  `# RepoTutor Doctor`, commands, open targets, and list filters, and invalid
  `--format text` exited 1 with `doctor supports --format`.

### Upgrade 51: Resume HTML Target Status

- Added `htmlTargetStatus` to `repo-tutor resume` JSON so each known HTML target
  is reported as present or missing without requiring a separate open command.
- Added an `HTML Target Status` section to Markdown resume output for handoff
  reports.
- Temp CLI resume-target-status smoke generated
  `/tmp/repotutor-resume-target-status-smoke.WosgZN`; `repo-tutor resume`
  reported `quiz: true`, deleting `html/quiz.html` changed that target to
  `false`, and Markdown output included `quiz: missing` and `index: present`.

### Upgrade 52: List HTML Target Status Filters

- Added `htmlTargetsComplete` and `missingHtmlTargets` to `repo-tutor list`
  JSON rows so multi-session triage can detect incomplete HTML exports.
- Added `repo-tutor list --html-targets complete|missing|all` with fail-closed
  validation and a Markdown `HTML Targets` column.
- Temp CLI list-target-status smoke generated
  `/tmp/repotutor-list-target-status-smoke.Lc24EP`; after deleting
  `html/quiz.html` in one fixture session, `list --html-targets missing`
  returned one row with `quiz` in `missingHtmlTargets`, `--html-targets complete`
  returned the intact session, Markdown output included `missing: quiz`, and
  invalid `--html-targets stale` exited 1 with `list supports --html-targets`.

### Upgrade 53: Open Target Markdown Discovery

- Added `repo-tutor open --list-targets --format markdown` for portable target
  discovery in handoff notes.
- Added fail-closed format validation for open-target discovery and exposed
  Markdown support in `repo-tutor doctor` format metadata.
- Temp CLI open-targets-markdown smoke generated
  `/tmp/repotutor-open-targets-md-smoke.hUWyo4`; Markdown output included
  `# RepoTutor Open Targets`, verification and component-graph rows, `doctor`
  reported Markdown support for `openTargets`, and invalid `--format text`
  exited 1 with `open --list-targets supports --format`.

### Upgrade 54: Open All Markdown Paths

- Added `repo-tutor open <session> --target all --format markdown` so all
  concrete HTML target paths can be copied into handoff notes after fail-closed
  existence checks.
- Added `openAll` format metadata to `repo-tutor doctor` and fail-closed format
  validation for `--target all`.
- Temp CLI open-all-markdown smoke generated
  `/tmp/repotutor-open-all-md-smoke.KWmraZ`; Markdown output included
  `# RepoTutor Open Target Paths`, verification and quiz path rows, `doctor`
  reported Markdown support for `openAll`, and invalid `--format text` exited 1
  with `open --target all supports --format`.

### Upgrade 55: Export Verification Markdown

- Added `repo-tutor verify-export <session> --format markdown` so HTML export
  integrity checks can be pasted into handoff notes without losing the
  fail-closed exit behavior.
- Added `verifyExport` format metadata to `repo-tutor doctor` and fail-closed
  format validation for `verify-export`.
- Temp CLI verify-export-markdown smoke generated
  `/tmp/repotutor-verify-export-md-smoke.4JKJLi`; Markdown output included
  `# RepoTutor Export Verification`, `OK: PASS`, and `Checked files: 18`,
  `doctor` reported Markdown support for `verifyExport`, invalid
  `--format text` exited 1 with `verify-export supports --format`, and a
  tampered `html/index.html` made Markdown output return exit 1 with `OK: FAIL`
  and `html/index.html`.

### Upgrade 56: Evidence Verification Markdown

- Added `repo-tutor verify-evidence <session> --format markdown` so source
  evidence integrity checks can be pasted into handoff notes while preserving
  fail-closed exit behavior.
- Added `verifyEvidence` format metadata to `repo-tutor doctor` and fail-closed
  format validation for `verify-evidence`.
- Temp CLI verify-evidence-markdown smoke generated
  `/tmp/repotutor-verify-evidence-md-smoke.BBWQSx`; Markdown output included
  `# RepoTutor Evidence Verification`, `OK: PASS`, and `Checked items: 9`,
  `doctor` reported Markdown support for `verifyEvidence`, invalid
  `--format text` exited 1 with `verify-evidence supports --format`, and
  removing `source/src/main.ts` made Markdown output return exit 1 with
  `OK: FAIL` and `missing-source-path`.

### Upgrade 57: Quiz Attempt Markdown

- Added `repo-tutor quiz <session> --answers answers.json --format markdown` so
  scored quiz attempts can be pasted into handoff notes immediately after an
  offline review.
- Added `quiz` format metadata to `repo-tutor doctor` and fail-closed format
  validation for `quiz`.
- Temp CLI quiz-markdown smoke generated
  `/tmp/repotutor-quiz-md-smoke.0omscj`; Markdown output included
  `# RepoTutor Quiz Attempt`, `Score: 100`, `Correct: 15`, and
  `Wrong notes: .../html/wrong-notes.html`, `doctor` reported Markdown support
  for `quiz`, and invalid `--format text` exited 1 with
  `quiz supports --format`.

### Upgrade 58: Study Result Markdown

- Added `repo-tutor study <source> --format markdown` so newly generated study
  sessions can produce a portable handoff summary immediately after creation.
- Added `study` format metadata to `repo-tutor doctor` and fail-closed format
  validation for `study`.
- Temp CLI study-markdown smoke generated
  `/tmp/repotutor-study-md-smoke.UdhoAw`; Markdown output included
  `# RepoTutor Study`, `Verification OK: true`, `Quiz questions: 15`, and
  `Verification Checks`, `doctor` reported Markdown support for `study`, and
  invalid `--format text` exited 1 with `study supports --format`.

### Upgrade 59: Export Summary Markdown

- Added `repo-tutor export <session> --format html|zip --summary-format
  markdown` so regenerated HTML and ZIP exports can produce a portable handoff
  summary without overloading the existing artifact `--format` flag.
- Added `exportSummary` format metadata to `repo-tutor doctor` and fail-closed
  validation for `--summary-format`.
- Temp CLI export-summary-markdown smoke generated
  `/tmp/repotutor-export-summary-md-smoke.HFdHEH`; HTML Markdown output
  included `# RepoTutor Export`, `Exported: html`, `Integrity OK: true`, and
  `Entry Points`; ZIP Markdown output included `Exported: zip`,
  `ZIP files: 20`, and `html-report.zip`; `doctor` reported Markdown support
  for `exportSummary`; invalid `--summary-format text` exited 1 with
  `export supports --summary-format`.

### Upgrade 60: List Markdown Session Paths

- Added the session root path to `repo-tutor list --format markdown` so a
  multi-session handoff contains both the browser entrypoint and the resumable
  session root without requiring a follow-up `resume` call.
- Temp CLI list-path-markdown smoke generated
  `/tmp/repotutor-list-path-md-smoke.QEFZRq`; Markdown output included
  `# RepoTutor Sessions`, a `Session Path` column, and the concrete session
  root path.

### Upgrade 61: Doctor Runtime Metadata

- Added runtime metadata to `repo-tutor doctor` so operator diagnostics expose
  the current cwd, resolved `studiesRoot`, `INIT_CWD`, and
  `REPOTUTOR_STUDIES_ROOT` context.
- Added a Runtime section to `repo-tutor doctor --format markdown`.
- Temp CLI doctor-runtime smoke generated
  `/tmp/repotutor-doctor-runtime-smoke.laIdbD`; JSON output included
  `runtime.studiesRoot`, `runtime.cwd`, and `envStudiesRoot`, and Markdown
  output included `## Runtime`, `studiesRoot`, and `cwd`.

### Upgrade 62: Mode-Filtered Session Lists

- Added `repo-tutor list --mode quick|standard|deep|all` so operators can
  isolate quick, standard, or deep learning sessions without manually scanning
  all rows.
- Added `mode` filter metadata to `repo-tutor doctor`.
- Temp CLI list-mode smoke generated
  `/tmp/repotutor-list-mode-smoke.Eo8An5`; quick and deep fixture sessions were
  created, `list --mode deep` returned one JSON row with `mode: deep`,
  `list --mode quick --format markdown` returned one Markdown row with `quick`,
  `doctor` reported list filter support for `mode`, and invalid `--mode slow`
  exited 1 with `list supports --mode`.

### Upgrade 63: Wrong-Only Session Lists

- Added `repo-tutor list --wrong-only` so operators can jump directly to
  learning sessions that still need quiz review.
- Added `wrongOnly` filter metadata to `repo-tutor doctor`.
- Temp CLI list-wrong-only smoke generated
  `/tmp/repotutor-list-wrong-smoke.FlvSHS`; two fixture sessions were created,
  one session was scored with 15 wrong answers, `list --wrong-only` returned
  exactly that one JSON row, Markdown output included the `Wrong` column with
  score `0` and wrong count `15`, and `doctor` reported
  `listFilters.wrongOnly: true`.

### Upgrade 64: Unattempted Session Lists

- Added `repo-tutor list --unattempted-only` so operators can find sessions
  that have generated quiz material but no recorded quiz attempt yet.
- Added `unattemptedOnly` filter metadata to `repo-tutor doctor`.
- Temp CLI list-unattempted smoke generated
  `/tmp/repotutor-list-unattempted-smoke.usbNPL`; two fixture sessions were
  created, one session was scored with all correct answers, `list
  --unattempted-only` returned exactly the unattempted JSON row with
  `score: null`, Markdown output included `Score` as `none` and `Wrong` as
  `0`, and `doctor` reported `listFilters.unattemptedOnly: true`.

### Upgrade 65: Scored Session Lists

- Added `repo-tutor list --scored-only` so operators can find sessions with a
  recorded quiz attempt and review score-bearing study runs separately from
  untouched sessions.
- Added `scoredOnly` filter metadata to `repo-tutor doctor`.
- Temp CLI list-scored smoke generated
  `/tmp/repotutor-list-scored-smoke.pkn8ux`; two fixture sessions were created,
  one senior session was scored with all correct answers, `list --scored-only`
  returned exactly that scored JSON row, Markdown output included `Score` as
  `100` and `Wrong` as `0`, and `doctor` reported
  `listFilters.scoredOnly: true`.

### Upgrade 66: Score Range Session Lists

- Added `repo-tutor list --min-score N --max-score N` so operators can isolate
  high-scoring or low-scoring quiz attempts without reading every session row.
- Added `minScore` and `maxScore` filter metadata to `repo-tutor doctor`.
- Temp CLI list-score-range smoke generated
  `/tmp/repotutor-list-score-range-smoke.ppUrvq`; two fixture sessions were
  scored at `0` and `100`, `list --min-score 50` returned only the `100` row,
  `list --max-score 50` returned only the `0` row, Markdown output included
  `Score` as `100`, `doctor` reported `minScore` and `maxScore` filters, and
  invalid `--min-score 101` exited 1 with `min-score must be a number from 0 to
  100`.

### Upgrade 67: List Filter Conflict Validation

- Added fail-closed validation for contradictory `repo-tutor list` filter
  combinations so invalid review slices do not silently return empty output.
- Added `filterConflictValidation` metadata to `repo-tutor doctor`.
- Temp CLI list-filter-conflict smoke generated
  `/tmp/repotutor-list-filter-conflict-smoke.nlhvCp`; invalid combinations
  `--unattempted-only --scored-only`, `--unattempted-only --wrong-only`,
  `--unattempted-only --min-score 1`, and `--min-score 90 --max-score 10` all
  exited 1 with explicit conflict messages, and `doctor` reported
  `listFilters.filterConflictValidation: true`.

### Upgrade 68: Created-Date Session Lists

- Added `repo-tutor list --created-from YYYY-MM-DD --created-to YYYY-MM-DD` so
  operators can split old and recent study sessions by creation time.
- Added created-date filter metadata and range validation metadata to
  `repo-tutor doctor`.
- Temp CLI list-date-range smoke generated
  `/tmp/repotutor-list-date-range-smoke.U4NaZ6`; two fixture sessions had
  `createdAt` set to `2001-01-01T12:00:00.000Z` and
  `2099-01-01T12:00:00.000Z`, `list --created-from 2099-01-01` returned only
  the senior 2099 row, `list --created-to 2001-01-01` returned only the
  beginner 2001 row, Markdown output included the 2099 timestamp, `doctor`
  reported created-date filters, and invalid date/range flags exited 1 with
  explicit messages.

### Upgrade 69: Score-Sorted Session Lists

- Added `repo-tutor list --sort score-desc|score-asc` so operators can rank
  scored sessions by quiz outcome while keeping unscored sessions at the end.
- Added score sort metadata to `repo-tutor doctor`.
- Temp CLI list-score-sort smoke generated
  `/tmp/repotutor-list-score-sort-smoke.2FS1UL`; two scored sessions and one
  unscored session were created, `list --sort score-desc` returned scores in
  `100`, `0`, `null` order, `list --sort score-asc` returned `0`, `100`,
  `null` order, Markdown output included the `100` score row, `doctor`
  reported `score-desc` and `score-asc` sort support, and invalid
  `--sort score` exited 1 with the expanded sort error.
- `pnpm audit:brief`: PASS, 13/13 audit reports
- `gitleaks protect --staged --no-banner --redact`: PASS before pushed commits.
- Full-dir gitleaks can flag ignored Cargo `target/` artifacts after
  `cargo check`; pushed content is guarded with staged gitleaks.

## Deferred Candidate Backlog

1. Continue source-backed usability upgrades.
