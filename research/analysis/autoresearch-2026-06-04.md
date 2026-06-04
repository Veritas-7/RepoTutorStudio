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

### microsoft/codetour

- URL: https://github.com/microsoft/codetour
- Local source: `research/external-src/microsoft-codetour`
- Stars at check: 4536
- Forks at check: not captured in local search output
- License: MIT
- Updated: 2026-06-01T13:58:15Z
- Relevance: ordered, file-linked codebase walkthroughs for developer
  onboarding.

Transferable patterns:

- Model onboarding as an ordered tour of steps.
- Let each step link to a file, directory, content page, or follow-up tour.
- Provide a primary tour so new developers have a clear first path.

### k3-2o/pi-repo-baby

- URL: https://github.com/k3-2o/pi-repo-baby
- Local source: `research/external-src/k3-2o-pi-repo-baby`
- Stars at check: 7
- Forks at check: 1
- License: not specified
- Updated: 2026-06-01T04:42:03Z
- Relevance: Tree-sitter structural repo map with suggested next reads and
  importance-ranked files for first-contact codebase orientation.

Transferable patterns:

- Rank first reads instead of asking agents to chain `ls`, `find`, `rg`, and
  `read` manually.
- Keep suggested next reads explicit and source-backed.
- Offer a single page/report that tells learners where to start reading.

### Jai0401/docSmith

- URL: https://github.com/Jai0401/docSmith
- Local source: `research/external-src/Jai0401-docSmith`
- Stars at check: 16
- Forks at check: 0
- License: MIT
- Updated: 2026-05-24T14:36:59Z
- Relevance: structured codebase documentation plus Dockerfile and Docker
  Compose generation prompts for runtime setup understanding.

Transferable patterns:

- Treat setup/runtime documentation as a first-class codebase understanding
  output, not only a README detail.
- Separate dependency manifests, setup prerequisites, Dockerfile signals, and
  Compose/service signals.
- Give learners a checklist for what to verify before attempting local or
  container execution.

### wtdlee/repomap

- URL: https://github.com/wtdlee/repomap
- Local source: `research/external-src/wtdlee-repomap`
- Stars at check: 2
- Forks at check: 0
- License: MIT
- Updated: 2026-01-07T05:11:45Z
- Relevance: interactive repository map for pages, routes, components,
  GraphQL, REST API detection, and data-flow diagrams.

Transferable patterns:

- Treat route/page files as first-class learner entry points.
- Extract API call and handler signals separately from generic file lessons.
- Surface component and data-flow hints so a learner can trace UI entry to data
  movement.

### carlrannaberg/codebase-map

- URL: https://github.com/carlrannaberg/codebase-map
- Local source: `research/external-src/carlrannaberg-codebase-map`
- Stars at check: 16
- Forks at check: 2
- License: not specified
- Updated: 2026-05-09T22:11:18Z
- Relevance: TypeScript/JavaScript code indexer that extracts functions,
  classes, constants, dependencies, and compact LLM-oriented project maps.

Transferable patterns:

- Extract named code symbols separately from file-level summaries.
- Keep symbol maps compact and linked to source files for LLM and learner use.
- Use symbol counts to identify files that should be read function-by-function
  instead of as one large blob.

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

### Upgrade 70: JSONL Session List Output

- Added `repo-tutor list --format jsonl` so large session inventories can be
  streamed one JSON object per line into shell pipelines, log collectors, or
  handoff automation without loading a full JSON array.
- Added JSONL list format metadata to `repo-tutor doctor`.
- Temp CLI list-jsonl smoke generated
  `/tmp/repotutor-list-jsonl-smoke.0aMoEN`; two fixture sessions were created,
  `list --sort newest --format jsonl` returned exactly two parseable JSONL
  rows with session, repo, path, HTML, and passed verification fields, `doctor`
  reported `formats.list` including `jsonl`, and invalid `--format yaml`
  exited 1 with the expanded list format error.

### Upgrade 71: CSV Session List Output

- Added `repo-tutor list --format csv` so session inventories can be opened in
  spreadsheets or imported into reporting tools without post-processing JSON.
- Added CSV list format metadata to `repo-tutor doctor`.
- Temp CLI list-csv smoke generated
  `/tmp/repotutor-list-csv-smoke,sqqzVc`; two fixture sessions were created
  under a comma-containing studies root, `list --sort newest --format csv`
  returned the expected header plus two passed rows, path cells were quoted,
  `doctor` reported `formats.list` including `csv`, and invalid
  `--format yaml` exited 1 with the expanded list format error.

### Upgrade 72: Field-Selected Session List Output

- Added `repo-tutor list --fields <comma-list>` so JSON, JSONL, CSV, and
  Markdown session inventories can emit only the fields needed by a handoff,
  shell pipeline, or report import.
- Added field metadata to `repo-tutor doctor` under `listFilters.fields`.
- Temp CLI list-fields smoke generated
  `/tmp/repotutor-list-fields-smoke.nsSYI7`; one fixture session was created,
  `list --fields sessionId,repo,score,path` returned exactly those keys in
  JSON and JSONL, CSV used those headers, Markdown rendered a selected-field
  table, `doctor` reported the supported field list, invalid `--fields nope`
  failed closed, and duplicate fields were de-duplicated in output order.

### Upgrade 73: Field Preset Session List Output

- Added `repo-tutor list --field-preset compact|scores|handoff|verification|paths`
  so common field selections can be reused without spelling every column.
- Added `fieldPresets` metadata to `repo-tutor doctor`.
- Temp CLI list-field-preset smoke generated
  `/tmp/repotutor-list-field-preset-smoke.Io8yRb`; one fixture session was
  created, the `scores` preset returned `sessionId,repo,score,wrong,path` in
  JSON, the `paths` preset produced matching CSV headers, the `compact` preset
  rendered selected Markdown fields, `doctor` reported all preset names,
  invalid `--field-preset nope` failed closed, and combining `--fields` with
  `--field-preset` failed closed with an explicit conflict message.

### Upgrade 74: Session List Summary Output

- Added `repo-tutor list --summary --format json|markdown` so filtered session
  inventories can be summarized by verification status, mode, level, HTML
  target completeness, quiz score state, and repository.
- Added `summary` list-filter metadata to `repo-tutor doctor`.
- Temp CLI list-summary smoke generated
  `/tmp/repotutor-list-summary-smoke.MHi2AF`; two fixture sessions were
  created, one session was scored at `100`, JSON summary reported total `2`,
  two passed sessions, one scored session, one unattempted session, average
  score `100`, and complete HTML target counts, Markdown summary rendered the
  same totals, `--summary --format csv` failed closed, and combining
  `--summary` with `--fields` failed closed with an explicit conflict message.

### Upgrade 75: Saved Session List Output

- Added `repo-tutor list --output <file>` so JSON, JSONL, CSV, Markdown, and
  summary outputs can be saved directly for handoff notes or automation
  artifacts.
- Added `output` list metadata to `repo-tutor doctor`.
- Temp CLI list-output smoke generated
  `/tmp/repotutor-list-output-smoke.sHVw9m`; two fixture sessions were created,
  JSONL score-preset output, CSV paths-preset output, and Markdown summary
  output were written under `reports/`, stdout returned each absolute output
  path, saved file contents matched expected headers/totals, `doctor` reported
  output support, and bare `--output` failed closed with `output must be a
  non-empty string`.
- `pnpm audit:brief`: PASS, 13/13 audit reports
- `gitleaks protect --staged --no-banner --redact`: PASS before pushed commits.
- Full-dir gitleaks can flag ignored Cargo `target/` artifacts after
  `cargo check`; pushed content is guarded with staged gitleaks.

### Upgrade 76: Saved Session List Output Manifests

- Added `repo-tutor list --output <file> --output-manifest` so saved list
  artifacts can carry reproducible sidecar metadata.
- Manifest sidecars record absolute output and manifest paths, format, summary
  mode, row count, byte count, SHA-256, and creation timestamp.
- Added `outputManifest` list-filter metadata to `repo-tutor doctor`.
- Temp CLI list-output-manifest smoke generated
  `/tmp/repotutor-list-output-manifest-smoke.glkRlb`; two fixture sessions were
  created, JSONL score-preset output and Markdown summary output wrote
  `.manifest.json` sidecars, receipt JSON returned absolute output and manifest
  paths, manifest `bytes` and `sha256` matched recomputed file contents,
  summary manifests set `summary: true`, `doctor` reported
  `outputManifest: true`, and `--output-manifest` without `--output` failed
  closed with `list requires --output when --output-manifest is used`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 77: Saved Session List Output Verification

- Added `repo-tutor verify-list-output <output-file>` so saved list artifacts
  can be validated against their `.manifest.json` sidecars after handoff or
  tamper-prone transport.
- Added optional `--manifest <file>` and `--format json|markdown` support.
- Added `verify-list-output` command and `verifyListOutput` format metadata to
  `repo-tutor doctor`.
- Temp CLI verify-list-output smoke generated
  `/tmp/repotutor-verify-list-output-smoke.JB1fqu`; two fixture sessions were
  created, saved JSONL score-preset output verified cleanly in JSON and
  Markdown using the default and explicit manifest paths, tampering with the
  output failed closed with both `bytes-mismatch` and `sha256-mismatch`, and
  `doctor` reported `verify-list-output` plus JSON/Markdown formats.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 78: Custom Saved List Output Manifest Paths

- Extended `repo-tutor list --output <file> --output-manifest` so callers can
  pass a custom manifest path as `--output-manifest <manifest-file>`.
- Bare `--output-manifest` still writes the default `<output>.manifest.json`
  sidecar.
- Temp CLI custom-manifest smoke generated
  `/tmp/repotutor-list-custom-manifest-smoke.kMVXye`; two fixture sessions were
  created, JSONL score-preset output wrote a custom manifest under
  `manifests/custom-scores.json`, no default sidecar was created for that
  output, `verify-list-output --manifest` passed against the custom path, and
  bare `--output-manifest` still wrote the default summary sidecar.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 79: Saved Session List Manifest Selection Metadata

- Extended list output manifests with selected `fields`, `fieldPreset`, and a
  `filters` snapshot containing repo/date/mode/level/status/HTML-target/sort/
  limit/quiz-filter metadata.
- Summary manifests record `fields: null` and `fieldPreset: null` while still
  recording the filters used to produce the summary.
- Temp CLI list-manifest-metadata smoke generated
  `/tmp/repotutor-list-manifest-metadata-smoke.4M0xZA`; two fixture sessions
  were created, filtered JSONL score-preset output wrote manifest `fields`,
  `fieldPreset`, `filters.mode`, `filters.level`, `filters.status`,
  `filters.sort`, and `filters.limit` metadata matching the CLI invocation,
  output row count matched manifest `rows`, and summary manifests recorded
  `fields: null`, `fieldPreset: null`, and `filters.wrongOnly: true`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 80: Saved Session List Manifest Schema Versioning

- Added `schemaVersion: 1` to newly generated list output manifests.
- `repo-tutor verify-list-output` now reports the schema version in both JSON
  and Markdown output while still allowing older manifests to show
  `schemaVersion: null`.
- Temp CLI list-manifest-schema smoke generated
  `/tmp/repotutor-list-manifest-schema-smoke.pMWIQQ`; one fixture session was
  created, saved JSONL output wrote `schemaVersion: 1`, `verify-list-output`
  JSON reported `schemaVersion: 1`, and verifier Markdown included
  `Schema version: 1`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 81: Saved Session List Manifest Schema Gate

- Added `supportedSchemaVersion` to `repo-tutor verify-list-output` results.
- Future manifest schema versions now fail closed with
  `unsupported-schema-version` instead of being silently accepted.
- Temp CLI list-manifest-schema-gate smoke generated
  `/tmp/repotutor-list-manifest-schema-gate-smoke.MLa7HU`; one fixture session
  was created, schema version `1` verified with `supportedSchemaVersion: true`,
  verifier Markdown reported `Supported schema version: yes`, and a copied
  future manifest with `schemaVersion: 999` failed closed with
  `unsupported-schema-version`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 82: Saved Session List Row-Count Verification

- Added `actualRows` to `repo-tutor verify-list-output` results.
- Verifier now compares manifest `rows` with JSON, JSONL, and CSV output
  content and fails closed with `rows-mismatch` when row metadata drifts.
- Temp CLI list-row-count smoke generated
  `/tmp/repotutor-list-row-count-smoke.gQgKb1`; two fixture sessions were
  created, JSON and CSV saved list outputs reported `actualRows: 2`, JSONL
  verifier Markdown included `Actual rows: 2`, and tampering manifest `rows` to
  `999` failed closed with `rows-mismatch` while output bytes and SHA-256
  remained unchanged.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 83: Saved Session List Field Verification

- Added `actualFields` to `repo-tutor verify-list-output` results.
- Verifier now compares manifest `fields` with JSON, JSONL, and CSV output
  keys or headers and fails closed with `fields-mismatch` when field metadata
  drifts.
- Temp CLI list-field-count smoke generated
  `/tmp/repotutor-list-field-count-smoke.96Q5Mn`; two fixture sessions were
  created, JSONL verifier Markdown reported matching `Fields` and
  `Actual fields`, CSV verification returned matching `fields` and
  `actualFields`, and tampering manifest fields to include `missingField`
  failed closed with `fields-mismatch`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 84: Saved Session List Verification Report Files

- Added `repo-tutor verify-list-output <output-file> --report <file>` so list
  output verification reports can be saved to caller-selected JSON or Markdown
  paths.
- The report writer creates parent directories, prints the saved report path to
  stdout, and preserves fail-closed non-zero exit behavior when the saved
  report contains verification failures.
- Temp CLI verify-list-report smoke generated
  `/tmp/repotutor-verify-list-report-smoke.51ZnNB`; an isolated fixture study
  was created, JSON and Markdown verification reports were saved under nested
  report directories, stdout returned the saved paths, tampering manifest fields
  saved a failure report and exited non-zero with `fields-mismatch`, and missing
  `--report` value exited non-zero with `report must be a non-empty string.`
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 85: Default Saved List Verification Report Paths

- Extended bare `repo-tutor verify-list-output <output-file> --report` to save
  reports beside the output as `<output>.verification.json` or
  `<output>.verification.md`, matching the requested `--format`.
- Preserved explicit empty string validation by fixing CLI flag parsing so
  `--report ""` is treated as an empty value instead of a bare flag.
- Source pattern: CodeBoarding writes fixed health artifacts such as
  `.codeboarding/health/health_report.json`; RepoTutor now offers the same kind
  of convention-based report path for saved list verification.
- RED smoke `/tmp/repotutor-verify-list-default-report-red.*` failed on the old
  behavior with `report must be a non-empty string.`
- GREEN smoke generated
  `/tmp/repotutor-verify-list-default-report-smoke.uYu5Lv`; isolated JSONL
  list output wrote default JSON and Markdown verification reports, stdout
  returned the default paths, and `--report ""` failed closed with
  `report must be a non-empty string.`
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 86: Default Study Target Command

- Added a CodeBoarding-inspired default subcommand flow: when the first argument
  looks like a GitHub URL or local path, RepoTutor injects `study` and runs the
  normal study pipeline.
- Kept typo safety by applying the default only to URL/path-shaped targets;
  unknown words such as `lisst` still show help instead of being treated as a
  source path.
- Added `defaultStudyCommand: true` to `repo-tutor doctor` JSON and a Markdown
  `Default study command: enabled` line.
- RED smoke `/tmp/repotutor-default-study-red.*` failed on the old behavior
  because the CLI printed help instead of JSON.
- GREEN smoke generated `/tmp/repotutor-default-study-smoke.WEdkrL`; bare
  target study produced a complete session, `resume` confirmed `mode: quick`
  and `level: beginner`, doctor JSON/Markdown exposed the default command, help
  listed the default target usage, and typo command `lisst` still showed help.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 87: Studies Root Runtime Option Discovery

- Exposed the existing `--studies-root <dir>` runtime option in CLI help so
  scripted users can find the isolated output-root control without reading
  source.
- Added `runtimeOptions` metadata to `repo-tutor doctor` JSON and a Markdown
  `## Runtime Options` section covering `studiesRootFlag`,
  `envStudiesRoot`, and `initCwdFallback`.
- Source pattern: CodeBoarding exposes output-directory controls in CLI help;
  RepoTutor now makes its comparable studies-root control visible in help and
  doctor output.
- RED smoke `/tmp/repotutor-studies-root-doc-red.*` failed on the old behavior
  because help omitted `--studies-root <dir>`.
- GREEN smoke generated `/tmp/repotutor-studies-root-doc-smoke.M26C1G`;
  help listed `--studies-root <dir>`, doctor JSON returned
  `runtimeOptions.studiesRootFlag: true`, and doctor Markdown included
  `## Runtime Options`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 88: Doctor Runtime Health Checks

- Added non-mutating runtime health checks to `repo-tutor doctor` so scripted
  users can see whether the selected studies root exists, is readable, is
  writable, and whether its parent directory is writable before running studies.
- Added `runtimeHealth` to doctor JSON and a Markdown `## Runtime Health`
  section.
- Source pattern: CodeBoarding has a standalone health check flow that writes
  health reports; RepoTutor now exposes a smaller local runtime-health surface
  for its output root.
- RED smoke `/tmp/repotutor-runtime-health-red.*` failed on the old behavior
  because doctor JSON had no `runtimeHealth`.
- GREEN smoke generated `/tmp/repotutor-runtime-health-smoke.oY71Py`;
  absent custom studies root reported `studiesRootExists: false` and
  `studiesRootParentWritable: true`, existing root reported readable/writable
  true, and Markdown included `## Runtime Health`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 89: Print-Friendly Offline HTML Reports

- Added print media CSS to `html/assets/style.css` so offline learning reports
  can be printed or saved as PDFs with navigation, filter toolbars, and quiz
  buttons hidden.
- Print mode switches the report to a single-column page, keeps panels together
  with `break-inside: avoid`, preserves print colors with
  `print-color-adjust`, and prints link targets with `a[href]::after`.
- Added export README guidance telling users to use browser print preview for
  PDF or paper handouts.
- Source pattern: google/html-quiz recommends checking print preview because
  its offline quiz can double as a printable question/answer handout.
- RED smoke `/tmp/repotutor-print-css-red.*` failed on the old generated
  `style.css` because it lacked `@media print`.
- GREEN smoke generated `/tmp/repotutor-print-css-smoke.KvSOCH`; generated
  `style.css` included `@media print`, `print-color-adjust`,
  hidden sidebar/toolbar/choice rules, and printable link targets, while
  `EXPORT-README.md` included print preview guidance.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 90: Printable Quiz Answer Key

- Added `html/quiz-print.html`, a static printable answer-key page that lists
  each question, all choices, the correct answer, explanation, and linked
  lesson path.
- Added the page to sidebar navigation, HTML manifest pages, manifest
  entrypoints, session required-artifact verification, and CLI open target
  discovery as `quiz-print`.
- Source pattern: google/html-quiz's offline quiz can be reviewed in print
  preview as a question/answer handout; RepoTutor now makes that handout an
  explicit generated page instead of depending on hidden interactive answers.
- RED smoke `/tmp/repotutor-quiz-print-red.*` failed on the old behavior with
  `missing quiz-print.html`.
- GREEN smoke generated `/tmp/repotutor-quiz-print-smoke.inb4sR`; generated
  `quiz-print.html` included `정답지`, `print-answer-key`, `<strong>정답:</strong>`,
  `<strong>해설:</strong>`, and `연결 수업`, while manifest pages,
  manifest entrypoints, `verify-session`, `open --target quiz-print`, and
  `open --list-targets` all recognized the page.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 91: Quiz Section And Difficulty Filters

- Added section and difficulty filter toolbars to `html/quiz.html` so larger
  quiz sets can be narrowed without leaving the offline browser report.
- Quiz cards now expose `data-quiz-section` and `data-quiz-difficulty`; the
  shared offline JS combines those filters with global search and the existing
  graph/file/evidence filters.
- Source pattern: google/html-quiz builds a category board from question groups;
  RepoTutor maps that idea to its existing `section` and `difficulty` quiz
  metadata.
- RED smoke `/tmp/repotutor-quiz-filter-red.ko2HXz` failed on the old behavior
  with `quiz missing quiz-section-toolbar`.
- GREEN smoke generated `/tmp/repotutor-quiz-filter-smoke.vFPca8`; generated
  `quiz.html` included `quiz-section-toolbar`, `quiz-difficulty-toolbar`,
  `data-quiz-section-filter`, `data-quiz-difficulty-filter`,
  `data-quiz-section`, and `data-quiz-difficulty`, while `assets/app.js`
  included the matching quiz section and difficulty handlers.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 92: Component Graph Mermaid Download

- Added a component graph download toolbar to `html/component-graph.html` so the
  generated Mermaid source can be saved as `component-graph.mmd` from the
  offline report.
- The graph Mermaid `<pre>` now has a stable `component-graph-mermaid` id, and
  `assets/app.js` attaches a dependency-free Blob download handler to
  `data-download-mermaid` buttons.
- Source pattern: CodeBoarding's HTML output exposes diagram export controls;
  RepoTutor now offers a lightweight local equivalent for its Mermaid graph.
- RED smoke `/tmp/repotutor-graph-download-red.PQEqc4` failed on the old
  behavior with `graph html missing component-graph-download-toolbar`.
- GREEN smoke generated `/tmp/repotutor-graph-download-smoke.nkHqGQ`; generated
  `component-graph.html` included `component-graph-download-toolbar`,
  `data-download-mermaid`, `component-graph-mermaid`, and `Mermaid 다운로드`,
  while `assets/app.js` included `[data-download-mermaid]`,
  `component-graph.mmd`, `URL.createObjectURL`, and `new Blob`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 93: Manifested Component Graph Mermaid Asset

- Added `html/assets/component-graph.mmd` as a generated portable export asset
  containing the component graph Mermaid source.
- The asset is now included in `manifest.json`, `EXPORT-README.md`, HTML export
  integrity verification, and the ZIP bundle, so the graph source survives
  offline handoff even without clicking the browser download button.
- Source pattern: CodeBoarding preserves generated diagram artifacts alongside
  HTML output; RepoTutor now keeps the Mermaid graph as a first-class portable
  asset.
- RED smoke `/tmp/repotutor-graph-asset-red.nJ27gn` failed on the old behavior
  with `missing component-graph.mmd asset`.
- GREEN smoke generated `/tmp/repotutor-graph-asset-smoke.NCKVXv`; generated
  `assets/component-graph.mmd` contained `flowchart`, `manifest.json` and
  `EXPORT-README.md` listed the asset, `verify-export` checked at least 20
  files, and ZIP export included `assets/component-graph.mmd`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 94: Component Node Relation Lists

- Added per-node relationship lists to `html/component-graph.html` so each
  component card shows directly connected incoming and outgoing graph edges.
- Node cards now render a `연결 관계` section with
  `component-node-relations` and `data-node-relation="incoming|outgoing"`
  rows, making the graph explorable even when a learner is reading filtered
  cards instead of the full Mermaid source.
- Source pattern: CodeBoarding's component HTML includes related
  classes/methods references; RepoTutor maps that idea to source-backed graph
  edge context for each node.
- RED smoke `/tmp/repotutor-node-relations-red.Jp2Nko` failed on the old
  behavior with `graph html missing component-node-relations`.
- GREEN smoke generated `/tmp/repotutor-node-relations-smoke.KYweIs`; generated
  `component-graph.html` included `component-node-relations`,
  `data-node-relation`, `연결 관계`, `outgoing`, and `incoming`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 95: Component Node Anchor Links

- Turned component graph node cards into stable in-page anchors with
  `component-node-anchor` and `data-node-id` metadata.
- Incoming and outgoing relation rows now link directly to the connected node
  card with `data-node-link` and `href="#component-node-..."`, so learners can
  follow graph relationships from card to card without scanning the full
  Mermaid source.
- Source pattern: CodeBoarding's component Markdown links expandable components
  to detail files; RepoTutor maps that to local, source-backed graph-card
  drilldown links inside the portable HTML report.
- RED smoke `/tmp/repotutor-node-anchor-red.9b9L1H` failed on the old behavior
  with `graph html missing component-node-anchor`.
- GREEN smoke generated `/tmp/repotutor-node-anchor-smoke.UsF7cn`; generated
  `component-graph.html` included `component-node-anchor`, `data-node-link`,
  `href="#component-node-`, and `data-node-id`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 96: Offline Quiz Reset Controls

- Added a `quiz-reset-toolbar` to `html/quiz.html` with a
  `data-reset-quiz` button labeled `복습 초기화`.
- The offline JavaScript now clears the browser-only picked answer map,
  re-enables all quiz choices, removes `correct`/`wrong` classes, and restores
  the live score message so learners can retry the static quiz without a page
  reload.
- Source pattern: google/html-quiz manages in-browser score and button state for
  replayable quiz sessions; RepoTutor maps that to a no-storage offline reset
  flow for its generated quiz board.
- RED smoke `/tmp/repotutor-quiz-reset-red.mXQtxk` failed on the old behavior
  with `quiz html missing quiz-reset-toolbar`.
- GREEN smoke generated `/tmp/repotutor-quiz-reset-smoke.pHoPiN`; generated
  `quiz.html` included `quiz-reset-toolbar`, `data-reset-quiz`, and
  `복습 초기화`, while `assets/app.js` included `[data-reset-quiz]`,
  `picked.clear()`, and `quiz-live-score`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 97: Guided Learning Path HTML

- Added `html/learning-path.html`, a generated tour-style page that orders the
  existing RepoTutor report pages into purpose, language, files, evidence,
  component graph, rebuild, and quiz steps.
- Each card renders as `learning-path-step` with `data-learning-step` metadata
  and a direct link to the corresponding generated page.
- Added the page to sidebar navigation, HTML manifest output, required session
  artifact verification, and CLI target discovery as
  `open --target learning-path`.
- Source pattern: microsoft/codetour represents onboarding as ordered
  `CodeTourStep` entries with file/directory/content targets and primary tour
  guidance; RepoTutor maps that to a static portable learning path over its
  generated report pages.
- RED smoke `/tmp/repotutor-learning-path-red.AOxxTD` failed on the old
  behavior with `missing learning-path.html`.
- Corrected GREEN smoke generated `/tmp/repotutor-learning-path-smoke.dvaNGA`;
  generated `learning-path.html` included `learning-path-step`,
  `data-learning-step`, `CodeTour`, `학습 경로`, and `component-graph.html`,
  manifest listed `html/learning-path.html`, and `open --target learning-path`
  returned the page path.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 98: Portable Learning Path Tour Asset

- Added `html/assets/learning-path.tour.json`, a CodeTour-style JSON asset
  generated from the same ordered learning path used by `learning-path.html`.
- The asset includes a `RepoTutor Learning Path` title, `isPrimary: true`, the
  session commit hash as `ref`, and file-linked steps such as
  `html/component-graph.html`.
- The asset is included in `manifest.json`, `EXPORT-README.md`, integrity
  verification, and ZIP export because it is emitted through the shared HTML
  asset pipeline.
- Source pattern: microsoft/codetour persists walkthroughs as simple JSON tour
  files with ordered steps and file targets; RepoTutor now exports an
  inspectable tour artifact beside its static HTML pages.
- RED smoke `/tmp/repotutor-tour-asset-red.*` failed on the old behavior with
  `missing learning-path.tour.json`.
- GREEN smoke generated `/tmp/repotutor-tour-asset-smoke.FzAzmz`; generated
  `learning-path.tour.json` parsed as JSON, had `isPrimary: true`, contained a
  component graph file step, and was listed by `manifest.json` plus
  `EXPORT-README.md`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 99: Learning Path Progress Persistence

- Added `data-learning-step-complete` checkboxes to each `learning-path.html`
  step so learners can mark tour steps as complete.
- The offline JavaScript now stores completed learning path step numbers in
  localStorage under `repotutor:learning-path:<path>`, restores checked state on
  reload, and updates the saved set on change.
- Source pattern: microsoft/codetour stores per-tour step progress and exposes
  completed state in the tree; RepoTutor maps that to lightweight browser-local
  progress for the static learning path.
- RED smoke `/tmp/repotutor-learning-progress-red.*` failed on the old behavior
  with `learning path missing data-learning-step-complete`.
- GREEN smoke generated `/tmp/repotutor-learning-progress-smoke.6p1hD6`;
  generated `learning-path.html` included `data-learning-step-complete` and
  `학습 완료`, while `assets/app.js` included `repotutor:learning-path`,
  `localStorage`, `learningProgress`, and `[data-learning-step-complete]`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 100: Learning Path Progress Reset

- Added a `learning-progress-toolbar` reset control to `learning-path.html`
  with a `data-reset-learning-progress` button labeled `진도 초기화`.
- The offline JavaScript now clears the learning path progress set with
  `learningProgress.clear()`, persists the cleared state, and unchecks all
  `data-learning-step-complete` boxes without requiring a page reload.
- Source pattern: microsoft/codetour exposes progress reset behavior through
  `progress.reset(...)`; RepoTutor maps that to a reload-safe browser-local
  reset action for its static learning path.
- RED smoke `/tmp/repotutor-learning-reset-red.*` failed on the old behavior
  with `learning path missing data-reset-learning-progress`.
- GREEN smoke generated `/tmp/repotutor-learning-reset-smoke.hW6IZB`;
  generated `learning-path.html` included `data-reset-learning-progress` and
  `진도 초기화`, while `assets/app.js` included
  `[data-reset-learning-progress]` and `learningProgress.clear()`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 101: Learning Path Progress Summary

- Added a `data-learning-progress-summary` status line to
  `learning-path.html` showing `완료 0 / N` before any local browser progress
  is restored.
- The offline JavaScript now updates the summary through
  `updateLearningProgressSummary()` after initial restore, step checkbox
  changes, and progress reset.
- Source pattern: microsoft/codetour publishes current-step status as
  `#current of total`; RepoTutor maps that to a browser-local completed-step
  counter for the static learning path.
- RED smoke `/tmp/repotutor-learning-summary-red.*` failed on the old behavior
  with `learning path missing data-learning-progress-summary`.
- GREEN smoke generated `/tmp/repotutor-learning-summary-smoke.m3SHE4`;
  generated `learning-path.html` included `data-learning-progress-summary` and
  `완료 0 /`, while `assets/app.js` included
  `updateLearningProgressSummary` and `[data-learning-progress-summary]`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 102: Learning Path Step Navigation

- Added stable `learning-step-N` anchors to each `learning-path.html` card.
- Added `learning-step-nav` previous/next intra-page links so learners can move
  between generated tour steps without returning to the top of the page.
- Source pattern: microsoft/codetour appends Previous/Next step links to tour
  content; RepoTutor maps that to portable static anchors in its learning path.
- RED smoke `/tmp/repotutor-learning-nav-red.*` failed on the old behavior with
  `learning path missing id="learning-step-1"`.
- GREEN smoke generated `/tmp/repotutor-learning-nav-smoke.UIf7oU`; generated
  `learning-path.html` included `id="learning-step-1"`, `learning-step-nav`,
  `href="#learning-step-2"`, `다음 단계`, and `이전 단계`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports after source-token audit
  adjustment for dynamic step IDs and links

### Upgrade 103: Learning Path Primary Marker

- Added a `data-learning-primary` marker labeled `기본 투어` to
  `learning-path.html`.
- Source pattern: microsoft/codetour marks `isPrimary` tours in tree
  descriptions with `(Primary)`; RepoTutor maps that to a portable static label
  on the generated learning path.
- RED smoke `/tmp/repotutor-learning-primary-red.*` failed on the old behavior
  with `learning path missing data-learning-primary`.
- GREEN smoke generated `/tmp/repotutor-learning-primary-smoke.wnerUs`;
  generated `learning-path.html` included `data-learning-primary` and
  `기본 투어`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 104: Suggested Reads Report

- Added `SuggestedReadsReportSchema` and `analysis/suggested-reads-report.json`
  with Repo Baby-style recommended first-read files.
- The scanner now ranks suggested reads from source evidence count,
  imports/exports, related files, and entrypoint-like filenames.
- Added `markdown/suggested-reads.md`, `html/suggested-reads.html`,
  manifest/verification coverage, and `open --target suggested-reads`.
- Source pattern: k3-2o/pi-repo-baby uses `suggested_reads()` and ranked
  structural maps so an agent knows which files to inspect first; RepoTutor maps
  that to source-backed learner next reads.
- RED smoke `/tmp/repotutor-suggested-reads-red.*` failed on the old behavior
  with `missing analysis/suggested-reads-report.json`.
- GREEN smoke generated `/tmp/repotutor-suggested-reads-smoke.lyMXF2`;
  generated the JSON, Markdown, and HTML artifacts, included
  `suggested-read-card`, `Repo Baby`, and `추천 읽기`, and
  `open --target suggested-reads` returned `html/suggested-reads.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports after adding scanner/Markdown
  to the offline export audit scope

### Upgrade 105: Runtime Environment Report

- Added `RuntimeEnvironmentReportSchema` and
  `analysis/runtime-environment-report.json` with docSmith-style setup and
  container readiness signals.
- The scanner now detects dependency manifests, README/setup hints,
  `.env.example`/`.env.sample`, Dockerfile, and Docker Compose files without
  executing external code.
- Added `markdown/runtime-environment.md`, `html/runtime-environment.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target runtime-environment`.
- Source pattern: docSmith asks for Dockerfile and Docker Compose generation
  from packed codebase context; RepoTutor maps that to a static learner report
  showing which runtime/container files are present and what to inspect next.
- RED smoke `/tmp/repotutor-runtime-env-red.*` failed on the old behavior with
  `missing analysis/runtime-environment-report.json`.
- GREEN smoke generated `/tmp/repotutor-runtime-env-smoke.8d4vTV`; generated
  the JSON, Markdown, and HTML artifacts, included `runtime-env-card`,
  `docSmith`, `실행 환경`, and `data-source-pattern="docSmith"`, and
  `open --target runtime-environment` returned
  `html/runtime-environment.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 106: Interface Map Report

- Added `InterfaceMapReportSchema` and `analysis/interface-map-report.json`
  with repomap-style route/page/API/component/data-flow signals.
- The scanner now detects page/router/controller/App Router file patterns,
  fetch/axios/router/FastAPI-style API signals, and named React component
  signals from safe text files.
- Added `markdown/interface-map.md`, `html/interface-map.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target interface-map`.
- Source pattern: repomap maps pages, routes, REST APIs, GraphQL operations,
  components, and data flows; RepoTutor maps the transferable static subset to
  learner-facing interface and data-flow hints.
- RED smoke `/tmp/repotutor-interface-map-red.*` failed on the old behavior
  with `missing analysis/interface-map-report.json`.
- GREEN smoke generated `/tmp/repotutor-interface-map-smoke.CNPJhA`;
  generated the JSON, Markdown, and HTML artifacts, included
  `interface-map-card`, `repomap`, `인터페이스 맵`, and
  `data-source-pattern="repomap"`, and `open --target interface-map` returned
  `html/interface-map.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 107: Interface Map Source Links

- Added `interface-source-link` anchors in `html/interface-map.html` so
  route/page, API, and component signals can jump to copied source files.
- Source pattern: repomap detail views expose evidence chains for operations;
  RepoTutor maps that to direct source links for each static interface signal.
- RED smoke `/tmp/repotutor-interface-links-red.*` failed on the old behavior
  with `interface links missing interface-source-link`.
- GREEN smoke generated `/tmp/repotutor-interface-links-smoke.eYV9Wk` and
  confirmed `interface-source-link`, `../source/src/pages/index.tsx`, and
  `../source/src/api/client.ts`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 108: Symbol Map Report

- Added `SymbolMapReportSchema` and `analysis/symbol-map-report.json` with
  codebase-map-style function, class, constant, interface, and type signals.
- The scanner now extracts supported symbols from safe text code files, records
  exported status, groups counts by symbol kind, and links each symbol to the
  file lesson plus copied source file.
- Added `markdown/symbol-map.md`, `html/symbol-map.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target symbol-map`.
- Source pattern: codebase-map performs AST-based extraction of functions,
  classes, constants, and dependencies for LLM-optimized maps; RepoTutor maps
  the transferable symbol-index idea to a dependency-free static report.
- RED smoke `/tmp/repotutor-symbol-map-red.*` failed on the old behavior with
  `missing analysis/symbol-map-report.json`.
- GREEN smoke generated `/tmp/repotutor-symbol-map-smoke.Es0ZGq`; generated
  the JSON, Markdown, and HTML artifacts, found `createThing`, `HiddenThing`,
  and `VALUE`, included `symbol-map-card`, `symbol-source-link`,
  `codebase-map`, `심볼 맵`, and `data-source-pattern="codebase-map"`, and
  `open --target symbol-map` returned `html/symbol-map.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 109: Context Pack Token Budget Report

- Cloned and inspected `yamadashy/repomix` under
  `research/external-src/yamadashy-repomix` without executing external source.
- Added `ContextPackReportSchema` and
  `analysis/context-pack-report.json` with Repomix-style included file counts,
  byte totals, estimated token totals, budget profiles, token-heavy files,
  directory token tree, excluded pack candidates, and security notes.
- Added `markdown/context-pack.md`, `html/context-pack.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target context-pack`.
- Source pattern: Repomix packs repositories into AI-friendly outputs, reports
  token counts/token-count trees, respects ignore rules, and uses security
  checks; RepoTutor maps the transferable planning subset to a deterministic
  static context budget report.
- RED smoke `/tmp/repotutor-context-pack-red.*` failed on the old behavior with
  `missing analysis/context-pack-report.json`.
- GREEN smoke generated `/tmp/repotutor-context-pack-smoke.1fAGLi`;
  generated the JSON, Markdown, and HTML artifacts, included
  `small-chat-8k`, `standard-32k`, `long-context-128k`,
  `context-pack-card`, `context-pack-source-link`,
  `data-source-pattern="Repomix"`, and `Token Budget`, and
  `open --target context-pack` returned `html/context-pack.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 110: Context Pack Split Output Plan

- Extended `analysis/context-pack-report.json` with `splitPlans` that preserve
  top-level directory groups while estimating numbered output parts.
- Added split output planning to `markdown/context-pack.md` and
  `html/context-pack.html`, including `google-ai-studio-1mb`,
  `repomix-20mb`, `repomix-output.N.xml`, part byte/token totals, and
  oversized-directory warnings.
- Source pattern: Repomix `--split-output` creates numbered output files and
  explicitly keeps files grouped by top-level directory so context is not split
  mid-directory; RepoTutor maps that to a static learner planning report.
- RED smoke `/tmp/repotutor-split-plan-red.*` failed on the old behavior with
  `missing splitPlans`.
- GREEN smoke generated `/tmp/repotutor-split-plan-smoke.VLPZde`; generated
  `splitPlans`, included `google-ai-studio-1mb`,
  `repomix-output.1.xml`, top-level directory grouping, and rendered
  `Split Output Plan` in HTML/Markdown while `open --target context-pack`
  still returned `html/context-pack.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 111: MCP Handoff Report

- Cloned and inspected `DeDeveloper23/codebase-mcp` under
  `research/external-src/DeDeveloper23-codebase-mcp` without executing external
  source.
- Added `McpHandoffReportSchema` and
  `analysis/mcp-handoff-report.json` with codebase-mcp-style tool handoff rows
  for `getCodebase`, `getRemoteCodebase`, and `saveCodebase`.
- Added `markdown/mcp-handoff.md`, `html/mcp-handoff.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target mcp-handoff`.
- Source pattern: Codebase MCP exposes MCP tools for local codebase retrieval,
  remote public repository comparison, and saving codebase analysis snapshots;
  RepoTutor maps that to a static AI handoff report with prompts, input hints,
  safety notes, and related generated reports.
- RED smoke `/tmp/repotutor-mcp-handoff-red.*` failed on the old behavior with
  `missing analysis/mcp-handoff-report.json`.
- GREEN smoke generated `/tmp/repotutor-mcp-handoff-smoke.WWgM6S`; generated
  the JSON, Markdown, and HTML artifacts, included `getCodebase`,
  `getRemoteCodebase`, `saveCodebase`, `mcp-handoff-card`,
  `data-source-pattern="codebase-mcp"`, and `MCP Handoff`, and
  `open --target mcp-handoff` returned `html/mcp-handoff.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 112: Agent Memory Report

- Cloned and inspected `lucasrosati/claude-code-memory-setup` under
  `research/external-src/lucasrosati-claude-code-memory-setup` without
  executing external source.
- Added `AgentMemoryReportSchema` and
  `analysis/agent-memory-report.json` with Obsidian/Graphify-style persistent
  memory layers, token-saving estimates, generated memory notes, and context
  navigation rules.
- Added `markdown/agent-memory.md`, `html/agent-memory.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target agent-memory`.
- Source pattern: the Claude Code memory setup uses a persistent Obsidian vault
  for decisions/progress and a Graphify codebase knowledge graph before raw-code
  reads; RepoTutor maps that to a static Agent Memory report that tells the next
  AI session what to read before opening source files.
- RED smoke `/tmp/repotutor-agent-memory-red.*` failed on the old behavior with
  `missing analysis/agent-memory-report.json`.
- GREEN smoke generated `/tmp/repotutor-agent-memory-smoke.XIDqRo`; generated
  the JSON, Markdown, and HTML artifacts, included `tokenSavings`,
  `memoryNotes`, `project-context`, `agent-memory-card`,
  `data-source-pattern="Obsidian Graphify"`, and `Agent Memory`, and
  `open --target agent-memory` returned `html/agent-memory.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 113: Graph Query Guide

- Cloned and inspected `safishamsi/graphify` under
  `research/external-src/safishamsi-graphify` without executing external
  source.
- Added `GraphQueryReportSchema` and
  `analysis/graph-query-report.json` with Graphify-style `query`, `path`, and
  `explain` modes, node explanation commands, and shortest-path prompts.
- Added `markdown/graph-query.md`, `html/graph-query.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target graph-query`.
- Source pattern: Graphify tells agents to query the existing graph before
  grepping or reading raw files, and exposes `graphify query`, `graphify path`,
  and `graphify explain`; RepoTutor maps those ideas to static graph traversal
  questions over the generated component graph.
- RED smoke `/tmp/repotutor-graph-query-red.*` failed on the old behavior with
  `missing analysis/graph-query-report.json`.
- GREEN smoke generated `/tmp/repotutor-graph-query-smoke.VPMkZu`; generated
  the JSON, Markdown, and HTML artifacts, included `queryModes`,
  `nodeExplanations`, `pathPrompts`, `graph-query-card`,
  `data-source-pattern="Graphify"`, `graphify query`, `graphify path`, and
  `graphify explain`, and `open --target graph-query` returned
  `html/graph-query.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 114: Tutorial Abstraction Report

- Cloned and inspected `The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge`
  under `research/external-src/The-Pocket-PocketFlow-Tutorial-Codebase-Knowledge`
  without executing external source.
- Added `TutorialAbstractionReportSchema` and
  `analysis/tutorial-abstraction-report.json` with PocketFlow-style core
  abstractions, relationship rows, and chapter order.
- Added `markdown/tutorial-abstractions.md`,
  `html/tutorial-abstractions.html`, manifest/verification coverage,
  learning-path linkage, and `open --target tutorial-abstractions`.
- Source pattern: PocketFlow turns a codebase into a beginner tutorial by
  identifying core abstractions, analyzing relationships, ordering chapters,
  writing chapters, and combining a tutorial index; RepoTutor maps that to a
  deterministic static report over existing file lessons and the component
  graph.
- RED smoke `/tmp/repotutor-tutorial-abstractions-red.*` failed on the old
  behavior with `missing analysis/tutorial-abstraction-report.json`.
- GREEN smoke generated
  `/tmp/repotutor-tutorial-abstractions-green-studies.0D2g33`; generated the
  JSON, Markdown, and HTML artifacts, included `abstractions`,
  `relationships`, `chapterOrder`, `tutorial-abstraction-card`,
  `data-source-pattern="PocketFlow"`, and `Tutorial Abstractions`, and
  `open --target tutorial-abstractions` returned
  `html/tutorial-abstractions.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 115: Decision Record Report

- Cloned and inspected `thomvaill/log4brains` under
  `research/external-src/thomvaill-log4brains` without executing external
  source.
- Added `DecisionRecordReportSchema` and
  `analysis/decision-record-report.json` with Log4brains-style ADR candidates,
  status counts, context, decision, consequences, timeline, and package scopes.
- Added `markdown/decision-records.md`, `html/decision-records.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target decision-records`.
- Source pattern: Log4brains stores ADRs as docs-as-code near the source,
  tracks status metadata, uses Context/Decision/Consequences sections, supports
  package-specific ADR folders, and publishes a searchable timeline; RepoTutor
  maps that to a static decision-record report over generated analysis pages.
- RED smoke `/tmp/repotutor-decision-records-red.*` failed on the old behavior
  with `missing analysis/decision-record-report.json`.
- GREEN smoke generated
  `/tmp/repotutor-decision-records-green-studies.1HGBOe`; generated the JSON,
  Markdown, and HTML artifacts, included `records`, `statusCounts`, `timeline`,
  `packageScopes`, `decision-record-card`, `data-source-pattern="Log4brains"`,
  and `Decision Records`, and `open --target decision-records` returned
  `html/decision-records.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 116: Dependency Health Report

- Cloned and inspected `sverweij/dependency-cruiser` under
  `research/external-src/sverweij-dependency-cruiser` without executing
  external source.
- Added `DependencyHealthReportSchema` and
  `analysis/dependency-health-report.json` with dependency-cruiser-style local
  dependency edges, cycles, orphan modules, rule violations, and fan-in/fan-out
  metrics.
- Added `markdown/dependency-health.md`, `html/dependency-health.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target dependency-health`.
- Source pattern: dependency-cruiser validates dependencies with forbidden
  rules like `no-circular` and `no-orphans`, indexes modules as dependencies
  and dependents, and reports concrete violations; RepoTutor maps that to a
  deterministic static report over existing file lessons and relative imports.
- RED smoke
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-dependency-health-red-studies.ElcnGI8FyZ`
  failed on the old behavior with
  `missing analysis/dependency-health-report.json`.
- GREEN smoke generated
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-dependency-health-green-studies.h1ibguTvLv`;
  generated the JSON, Markdown, and HTML artifacts, included
  `localDependencyEdges`, `cycles`, `orphanModules`, `ruleViolations`,
  `dependency-health-card`, `data-source-pattern="dependency-cruiser"`,
  `no-circular`, and `no-orphans`, and `open --target dependency-health`
  returned `html/dependency-health.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 117: API Reference Report

- Cloned and inspected `TypeStrong/typedoc` under
  `research/external-src/TypeStrong-typedoc` without executing external
  source.
- Added `ApiReferenceReportSchema` and `analysis/api-reference-report.json`
  with TypeDoc-style entry points, public symbols, ReflectionKind categories,
  kind/category counts, and export warnings.
- Added `markdown/api-reference.md`, `html/api-reference.html`,
  manifest/verification coverage, learning-path linkage, and
  `open --target api-reference`.
- Source pattern: TypeDoc starts from configured entry points, converts source
  into ProjectReflection/DeclarationReflection objects, groups declarations by
  ReflectionKind, and validates exports; RepoTutor maps that to a deterministic
  static API reference over the generated symbol map and file lessons.
- RED smoke
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-api-reference-red-studies.ALp7FF8Pin`
  failed on the old behavior with `missing analysis/api-reference-report.json`.
- GREEN smoke generated
  `/var/folders/1n/7vk05dld54v11w5snxcg4wxr0000gn/T/repotutor-api-reference-green-studies.C2R90GpBXb`;
  generated the JSON, Markdown, and HTML artifacts, included `entryPoints`,
  `publicSymbols`, `exportWarnings`, `api-reference-card`,
  `data-source-pattern="TypeDoc"`, and `ReflectionKind`, and
  `open --target api-reference` returned `html/api-reference.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 118: Static Search Index Report

- Cloned and inspected `Pagefind/pagefind` under
  `research/external-src/Pagefind-pagefind` without executing external source.
- Added `SearchIndexReportSchema` and `analysis/search-index-report.json`
  with Pagefind-style document fragments, term index, filter index, metadata
  fields, anchors, and top terms.
- Added `markdown/search-index.md`, `html/search-index.html`,
  `html/assets/search-index.json`, manifest/verification coverage,
  learning-path linkage, and `open --target search-index`.
- Source pattern: Pagefind stores each page as `PageFragmentData` with URL,
  content, word count, filters, metadata, and anchors, then connects queries to
  pages through `MetaIndex`, filter chunks, and static assets; RepoTutor maps
  that to a deterministic JSON search index over generated reports, file
  lessons, and folder lessons.
- RED smoke
  `/tmp/repotutor-search-index-red-studies.FaSruS/2026-06-04/local__simple-ts-app__HEAD__56931863`
  failed on the old behavior with missing `analysis/search-index-report.json`,
  `html/search-index.html`, and `html/assets/search-index.json`.
- GREEN smoke generated
  `/tmp/repotutor-search-index-green-studies.1VlF5F/2026-06-04/local__simple-ts-app__main__56931863`;
  generated JSON, Markdown, HTML, and asset artifacts, included
  `documents`, `termIndex`, `filterIndex`, `metadataFields`,
  `search-index-card`, `data-source-pattern="Pagefind"`, `PageFragmentData`,
  `MetaIndex`, manifest/learning-path entries, and `open --target
  search-index` returned `html/search-index.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 119: Active Recall Learning Journal

- Cloned and inspected `ktaletsk/learn-codebase` under
  `research/external-src/ktaletsk-learn-codebase` without executing external
  source.
- Added `LearningJournalReportSchema` and
  `analysis/learning-journal-report.json` with learn-codebase-style focus
  goals, mastery levels, open questions, spaced review queue, aha moments,
  session log, Socratic prompts, and a portable journal template.
- Added `markdown/learning-journal.md`, `html/learning-journal.html`,
  `html/assets/learning-journal-template.md`, manifest/verification coverage,
  learning-path linkage, and `open --target learning-journal`.
- Source pattern: learn-codebase teaches codebases through Socratic
  questioning, prediction before revelation, active recall, spaced repetition,
  and a persistent learning journal; RepoTutor maps that to deterministic
  session artifacts linked back to file lessons, glossary, source evidence,
  graph query, tutorial abstractions, and search index pages.
- RED smoke
  `/tmp/repotutor-learning-journal-red-studies.4vOcud/2026-06-04/local__simple-ts-app__main__e966b5a6`
  showed the old behavior was missing `analysis/learning-journal-report.json`,
  `markdown/learning-journal.md`, `html/learning-journal.html`, and
  `html/assets/learning-journal-template.md`.
- GREEN smoke generated
  `/tmp/repotutor-learning-journal-green-studies.Idy1BV/2026-06-04/local__simple-ts-app__main__e966b5a6`;
  generated JSON, Markdown, HTML, and template asset artifacts, included
  `focusGoals`, `masteryLevels`, `openQuestions`, `spacedReviewQueue`,
  `socraticPrompts`, `journalTemplateMarkdown`, `learning-journal-card`,
  `data-source-pattern="learn-codebase"`, `Active Recall Journal`,
  `Spaced Review Queue`, and `open --target learning-journal` returned
  `html/learning-journal.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 120: Project Activity Risk Report

- Cloned and inspected `repowise-dev/repowise` under
  `research/external-src/repowise-dev-repowise` without executing external
  source.
- GitHub metadata: public repo, 2,187 stars, 282 forks, updated
  2026-06-03T16:35:56Z; GitHub license key reports `Other`, while the checked
  `LICENSE` file is AGPL-3.0-or-later. No source code was copied into
  RepoTutor.
- Added `ProjectActivityReportSchema` and
  `analysis/project-activity-report.json` with Repowise-style activity signals,
  explicit history availability, static hotspot candidates, dead-code review
  candidates, review queues, and architecture decision prompts.
- Added `markdown/project-activity.md`, `html/project-activity.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target project-activity`.
- Source pattern: Repowise combines graph, Git history, code health, dead-code
  detection, and architecture decisions for agent risk handoff. RepoTutor maps
  that to a deterministic snapshot-only report because the generated study
  source intentionally removes `.git`; the report preserves branch/commit
  metadata but does not invent churn, ownership, or co-change history.
- RED smoke
  `/tmp/repotutor-project-activity-red-studies.*/...` showed the old behavior
  was missing `analysis/project-activity-report.json`,
  `markdown/project-activity.md`, and `html/project-activity.html`.
- GREEN smoke generated
  `/tmp/repotutor-project-activity-green-studies.jiEuX6/2026-06-04/local__simple-ts-app__main__9d0b090f`;
  confirmed `verificationCheckedRequiredArtifacts=60`, `historyAvailability`,
  `activitySignals`, `hotspotCandidates`, `deadCodeCandidates`,
  `reviewQueues`, `architectureDecisionPrompts`,
  `project-activity-card`, `data-source-pattern="Repowise"`, manifest/learning
  path entries, and `open --target project-activity` ->
  `html/project-activity.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 121: License Rights Report

- Cloned and inspected `licensee/licensee` under
  `research/external-src/licensee-licensee` without executing external source.
- GitHub metadata: public repo, MIT license, 899 stars, 331 forks, updated
  2026-06-01T01:51:54Z. No source code was copied into RepoTutor.
- Added `LicenseRightsReportSchema` and
  `analysis/license-rights-report.json` with Licensee-style license file
  scoring, matched-file confidence, package metadata signals, README license
  hints, review warnings, and a learner-facing rights checklist.
- Added `markdown/license-rights.md`, `html/license-rights.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target license-rights`.
- Source pattern: Licensee finds likely license files from root license-like
  filenames and top-level `LICENSES/*`, treats package manager license metadata
  as an optional review signal, and keeps README license references as
  low-confidence human-review hints.
- RED smoke `/tmp/repotutor-license-rights-red.json` showed the old behavior
  was missing `analysis/license-rights-report.json`,
  `markdown/license-rights.md`, and `html/license-rights.html`.
- GREEN smoke generated
  `/tmp/repotutor-license-rights-green-studies.VPkljT/2026-06-04/local__simple-ts-app__main__f989eeae`;
  confirmed `verificationCheckedRequiredArtifacts=63`,
  `detectedProjectLicense`, `licenseFiles`, `packageLicenseSignals`,
  `readmeLicenseReferences`, `reviewWarnings`, `rightsChecklist`,
  `license-rights-card`, `data-source-pattern="Licensee"`, manifest/learning
  path entries, and `open --target license-rights` ->
  `html/license-rights.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 122: Software Bill of Materials Report

- Cloned and inspected `anchore/syft` under
  `research/external-src/anchore-syft` without executing external source.
- GitHub metadata: public repo, Apache-2.0 license, 9,064 stars, 868 forks,
  updated 2026-06-02T20:22:49Z. No source code was copied into RepoTutor.
- Added `SbomReportSchema` and `analysis/sbom-report.json` with Syft-style
  source descriptor, package manifests, package artifacts, file artifacts,
  relationships, output-format readiness notes, and review warnings.
- Added `markdown/sbom.md`, `html/sbom.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target sbom`.
- Source pattern: Syft represents an SBOM as source, descriptor, artifacts
  packages/file metadata/licenses, and artifact relationships, with output
  formats such as Syft JSON, CycloneDX, and SPDX. RepoTutor maps that to a
  deterministic static learner inventory from package manifests without
  executing external tooling.
- RED smoke generated
  `/tmp/repotutor-sbom-red-studies.2uhpgw/2026-06-04/local__simple-ts-app__main__36517a48`;
  old behavior was missing `analysis/sbom-report.json`, `markdown/sbom.md`,
  and `html/sbom.html`.
- GREEN smoke generated
  `/tmp/repotutor-sbom-green-studies.HFeXCi/2026-06-04/local__simple-ts-app__main__36517a48`;
  confirmed `verificationCheckedRequiredArtifacts=66`, package manifest 1,
  package artifacts 3, file artifacts 1, relationships 8,
  `sourceDescriptor`, `packageArtifacts`, `fileArtifacts`, `outputFormats`,
  `sbom-card`, `data-source-pattern="Syft"`, manifest/learning path entries,
  and `open --target sbom` -> `html/sbom.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 123: Security Readiness Report

- Cloned and inspected `aquasecurity/trivy` under
  `research/external-src/aquasecurity-trivy` without executing external source.
- GitHub metadata: public repo, Apache-2.0 license, 35,386 stars, 415 forks,
  updated 2026-06-03T21:09:55Z. No source code was copied into RepoTutor.
- Added `SecurityReadinessReportSchema` and
  `analysis/security-readiness-report.json` with Trivy-style scanner targets,
  scanner coverage, security signals, action queue, and recommended commands.
- Added `markdown/security-readiness.md`,
  `html/security-readiness.html`, manifest/session-verification coverage,
  learning-path linkage, and `open --target security-readiness`.
- Source pattern: Trivy separates scan targets such as filesystem, repository,
  container image, Kubernetes, and SBOM from scanners such as vulnerability,
  secret, misconfiguration, license, and SBOM. RepoTutor maps that to static
  readiness metadata and explicitly does not produce vulnerability or secret
  scan results.
- RED smoke generated
  `/tmp/repotutor-security-readiness-red-studies.MSL819/2026-06-04/local__simple-ts-app__main__17ba0081`;
  old behavior was missing `analysis/security-readiness-report.json`,
  `markdown/security-readiness.md`, and `html/security-readiness.html`.
- GREEN smoke generated
  `/tmp/repotutor-security-readiness-green-studies.oQb24K/2026-06-04/local__simple-ts-app__main__17ba0081`;
  confirmed `verificationCheckedRequiredArtifacts=69`, targets 5, scanner
  coverage 5, security signals 2, actions 4, recommended commands 3,
  `security-readiness-card`, `data-source-pattern="Trivy"`,
  manifest/learning path entries, and `open --target security-readiness` ->
  `html/security-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 124: Project Scorecard Report

- Cloned and inspected `ossf/scorecard` under
  `research/external-src/ossf-scorecard` without executing external source.
- GitHub metadata: public repo, Apache-2.0 license, 5,475 stars, 656 forks,
  updated 2026-06-02T01:43:46Z. No source code was copied into RepoTutor.
- Added `ScorecardReportSchema` and `analysis/scorecard-report.json` with
  OpenSSF Scorecard-style checks, 0-10 scores, unknown provider-only states,
  risk-aware aggregate scoring, category scores, policy findings, risk queue,
  structured results, and learner next steps.
- Added `markdown/scorecard.md`, `html/scorecard.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target scorecard`.
- Source pattern: Scorecard represents repository health as named checks with
  scores, risk, remediation, and structured findings. RepoTutor maps that to a
  deterministic static learner report and explicitly leaves Branch-Protection
  and Code-Review as unknown because they require live source-host provider
  data.
- RED smoke generated
  `/tmp/repotutor-scorecard-red-studies.j9fKRs/2026-06-04/local__simple-ts-app__main__d1482871`;
  old behavior was missing `analysis/scorecard-report.json`,
  `markdown/scorecard.md`, and `html/scorecard.html`.
- GREEN smoke generated
  `/tmp/repotutor-scorecard-green-studies.Lj2fvZ/2026-06-04/local__simple-ts-app__main__d1482871`;
  confirmed `verificationCheckedRequiredArtifacts=72`, aggregate score 3,
  checks 12, risk queue 12, policy findings 5, `scorecard-card`,
  `data-source-pattern="OpenSSF Scorecard"`, manifest/learning path entries,
  and `open --target scorecard` -> `html/scorecard.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 125: Provenance Readiness Report

- Cloned and inspected `sigstore/cosign` under
  `research/external-src/sigstore-cosign` without executing external source.
- GitHub metadata: public repo, Apache-2.0 license, 5,997 stars, 745 forks,
  updated 2026-06-03T21:10:07Z. No source code was copied into RepoTutor.
- Added `ProvenanceReportSchema` and `analysis/provenance-report.json` with
  Cosign-style artifact signals, signature material, attestation predicates,
  identity requirements, verification commands, risk queue, and learner next
  steps.
- Added `markdown/provenance.md`, `html/provenance.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target provenance`.
- Source pattern: Cosign verification centers on signed artifact digests,
  detached signatures or Sigstore bundles, certificate identity, OIDC issuer,
  trusted root, transparency log proof, and optional attestations. RepoTutor
  maps that to a deterministic static readiness report and explicitly does not
  verify signatures, query Rekor, or validate certificates.
- RED smoke generated
  `/tmp/repotutor-provenance-red-studies.U4FSZk/2026-06-04/local__simple-ts-app__main__d11526e6`;
  old behavior was missing `analysis/provenance-report.json`,
  `markdown/provenance.md`, and `html/provenance.html`.
- GREEN smoke generated
  `/tmp/repotutor-provenance-green-studies.kLwDTm/2026-06-04/local__simple-ts-app__main__d11526e6`;
  confirmed `verificationCheckedRequiredArtifacts=75`, artifact signals 6,
  signature material 6, attestations 5, identity requirements 5, risk queue 5,
  verification commands 4, `provenance-card`, `data-source-pattern="Cosign"`,
  manifest/learning path entries, and `open --target provenance` ->
  `html/provenance.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 13/13 audit reports

### Upgrade 126: Advisory Query Readiness Report

- Cloned and inspected `google/osv-scanner` under
  `research/external-src/google-osv-scanner` without executing external
  source.
- GitHub metadata: public repo, Apache-2.0 license, 10,426 stars, 713 forks,
  updated 2026-06-03T21:51:24Z. No source code was copied into RepoTutor.
- Added `AdvisoryReportSchema` and `analysis/advisory-report.json` with
  OSV-Scanner-style package query targets, lockfile signals, advisory sources,
  policy controls, result model, remediation queue, recommended commands, and
  learner next steps.
- Added `markdown/advisories.md`, `html/advisories.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target advisories`.
- Source pattern: OSV-Scanner separates package extraction from vulnerability
  matching, models result source path/type and package vulnerability groups,
  supports `osv-scanner.toml` `IgnoredVulns`/`PackageOverrides`, and can use
  offline vulnerability databases or guided remediation. RepoTutor maps that to
  deterministic static advisory query readiness and explicitly does not claim
  actual vulnerabilities.
- RED smoke generated
  `/tmp/repotutor-advisories-red-studies.GMKrqn/2026-06-04/local__simple-ts-app__main__6afec26d`;
  old behavior was missing `analysis/advisory-report.json`,
  `markdown/advisories.md`, and `html/advisories.html`.
- GREEN smoke generated
  `/tmp/repotutor-advisories-final-studies.nWy5FO/2026-06-04/local__simple-ts-app__main__6afec26d`;
  confirmed `verificationCheckedRequiredArtifacts=78`, query targets 3,
  lockfile signals 0, advisory sources 6, policy controls 6, result model 5,
  remediation queue 4, recommended commands 5, `advisory-card`,
  `data-source-pattern="OSV-Scanner"`, manifest/learning path entries, and
  `open --target advisories` -> `html/advisories.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 14/14 audit checks across 13 generated reports

### Upgrade 127: OpenVEX Impact Readiness Report

- Cloned and inspected `openvex/vexctl` under
  `research/external-src/openvex-vexctl` without executing external source.
- GitHub metadata: public repo, Apache-2.0 license, 194 stars, 27 forks,
  updated 2026-06-03T07:27:47Z. No source code was copied into RepoTutor.
- Added `VexReportSchema` and `analysis/vex-report.json` with OpenVEX-style
  product targets, vulnerability inputs, status matrix, justification catalog,
  statement drafts, document workflow, attestation readiness, risk queue, and
  learner next steps.
- Added `markdown/vex.md`, `html/vex.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target vex`.
- Source pattern: OpenVEX separates product identity, vulnerability IDs,
  status transitions (`affected`, `not_affected`, `fixed`,
  `under_investigation`), justifications, SARIF filtering, and signed
  attestations. RepoTutor maps that to deterministic static impact readiness
  and explicitly does not claim actual vulnerability impact status.
- RED smoke generated
  `/tmp/repotutor-vex-red-studies.SHPpdU/2026-06-04/local__simple-ts-app__main__076b7e4b`;
  old behavior was missing `analysis/vex-report.json`,
  `markdown/vex.md`, and `html/vex.html`.
- GREEN smoke generated
  `/tmp/repotutor-vex-green-studies.xgwwZK/2026-06-04/local__simple-ts-app__main__076b7e4b`;
  confirmed `verificationCheckedRequiredArtifacts=81`, product targets 5,
  vulnerability inputs 5, status matrix 4, justifications 5, statement drafts
  5, workflow 6, attestation readiness 5, risk queue 4, `vex-card`,
  `data-source-pattern="OpenVEX"`, manifest/learning path entries, and
  `open --target vex` -> `html/vex.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 25/25 audit checks across 13 generated reports

### Upgrade 128: Policy Gate Readiness Report

- Cloned and inspected `open-policy-agent/opa` under
  `research/external-src/open-policy-agent-opa` without executing external
  source.
- GitHub metadata: public repo, Apache-2.0 license, 11,817 stars, 1,578
  forks, updated 2026-06-03T15:45:37Z. No source code was copied into
  RepoTutor.
- Added `PolicyGateReportSchema` and `analysis/policy-gate-report.json` with
  OPA-style policy documents, input/data documents, gate queries, test
  coverage, bundle readiness, decision output model, recommended commands,
  risk queue, and learner next steps.
- Added `markdown/policy-gates.md`, `html/policy-gates.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target policy-gates`.
- Source pattern: OPA separates Rego policy modules, structured input/data,
  compile checks, `test_` rule discovery, `eval` decision results,
  schema/strict validation, and bundle build/inspect/signature readiness.
  RepoTutor maps that to deterministic static policy gate readiness and
  explicitly does not evaluate allow/deny/violation decisions.
- RED smoke generated
  `/tmp/repotutor-policy-gates-red-studies.9VAWoh/2026-06-04/local__simple-ts-app__main__265e638e`;
  old behavior was missing `analysis/policy-gate-report.json`,
  `markdown/policy-gates.md`, and `html/policy-gates.html`.
- GREEN smoke generated
  `/tmp/repotutor-policy-gates-green-studies.ugd9P0/2026-06-04/local__simple-ts-app__main__265e638e`;
  confirmed `verificationCheckedRequiredArtifacts=84`, policy documents 0,
  input documents 1, gate queries 0, test coverage rows 4, bundle readiness 6,
  decision outputs 5, recommended commands 5, risk queue 4,
  `policy-gate-card`, `data-source-pattern="OPA"`, manifest/learning path
  entries, and `open --target policy-gates` -> `html/policy-gates.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 26/26 audit checks across 13 generated reports

### Upgrade 129: API Contract Readiness Report

- Cloned and inspected `schemathesis/schemathesis` under
  `research/external-src/schemathesis-schemathesis` without executing
  external source.
- GitHub metadata: public repo, MIT license, 3,337 stars, 216 forks, updated
  2026-06-03T13:37:58Z. No source code was copied into RepoTutor.
- Added `ApiContractReportSchema` and `analysis/api-contract-report.json` with
  Schemathesis-style schema documents, operation targets, test phases, check
  matrix, runtime targets, reporting outputs, recommended commands, risk queue,
  and learner next steps.
- Added `markdown/api-contracts.md`, `html/api-contracts.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target api-contracts`.
- Source pattern: Schemathesis separates OpenAPI/GraphQL schema discovery,
  generated examples/coverage/fuzzing/stateful phases, response checks,
  pytest/CI targets, JUnit/Allure/VCR reporting, curl reproduction, and
  TraceCov-style coverage evidence. RepoTutor maps that to deterministic
  static API contract readiness and explicitly does not execute generated API
  requests or claim pass/fail contract results.
- RED smoke generated
  `/tmp/repotutor-contracts-red-studies.TF2TRb/2026-06-04/local__simple-ts-app__main__4d7cbd26`;
  old behavior was missing `analysis/api-contract-report.json`,
  `markdown/api-contracts.md`, and `html/api-contracts.html`.
- GREEN smoke generated
  `/tmp/repotutor-contracts-green-studies.ROVc7l/2026-06-04/local__simple-ts-app__main__4d7cbd26`;
  confirmed `verificationCheckedRequiredArtifacts=87`, schema documents 0,
  operation targets 0, test phases 5, checks 6, runtime targets 5,
  reporting outputs 6, recommended commands 6, risk queue 2,
  `api-contract-card`, `data-source-pattern="Schemathesis"`,
  manifest/learning path entries, and `open --target api-contracts` ->
  `html/api-contracts.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 27/27 audit checks across 13 generated reports

### Upgrade 130: Observability Readiness Report

- Cloned and inspected `open-telemetry/opentelemetry-js` under
  `research/external-src/open-telemetry-opentelemetry-js` without executing
  external source.
- GitHub metadata: public repo, Apache-2.0 license, 3,387 stars, 1,052 forks,
  updated 2026-06-03T14:58:51Z. No source code was copied into RepoTutor.
- Added `ObservabilityReportSchema` and `analysis/observability-report.json`
  with OpenTelemetry-style signal pipelines, instrumentation signals, exporter
  targets, resource attributes, propagation context, diagnostics, risk queue,
  recommended commands, and learner next steps.
- Added `markdown/observability.md`, `html/observability.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target observability`.
- Source pattern: OpenTelemetry separates traces, metrics, logs,
  auto/manual instrumentation, OTLP/Prometheus/console/vendor exporters,
  resource attributes, context propagation, diagnostics, shutdown, sampling,
  and runtime support. RepoTutor maps that to deterministic static
  observability readiness and explicitly does not collect spans, metrics, or
  logs from the target app.
- RED smoke generated
  `/tmp/repotutor-observability-red-studies.WwbQXF/2026-06-04/local__simple-ts-app__main__ac8cad2e`;
  old behavior was missing `analysis/observability-report.json`,
  `markdown/observability.md`, and `html/observability.html`.
- GREEN smoke generated
  `/tmp/repotutor-observability-green-studies.PILjIS/2026-06-04/local__simple-ts-app__main__ac8cad2e`;
  confirmed `verificationCheckedRequiredArtifacts=90`, signal pipelines 3,
  instrumentation signals 0, exporter targets 1, resource attributes 0,
  propagation context 5, diagnostics 6, recommended commands 5, risk queue 2,
  `observability-card`, `data-source-pattern="OpenTelemetry"`,
  manifest/learning path entries, and `open --target observability` ->
  `html/observability.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 28/28 audit checks across 13 generated reports

### Upgrade 131: Performance Readiness Report

- Cloned and inspected `grafana/k6` under
  `research/external-src/grafana-k6` without executing external source.
- GitHub metadata: public repo, AGPL-3.0 license, 30,725 stars, 1,554 forks,
  updated 2026-06-03T20:35:08Z. No source code was copied into RepoTutor.
- Added `PerformanceReportSchema` and `analysis/performance-report.json` with
  k6-style script targets, workload models, thresholds, checks, metrics,
  outputs, runtime controls, risk queue, recommended commands, and learner next
  steps.
- Added `markdown/performance.md`, `html/performance.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target performance`.
- Source pattern: k6 separates JavaScript load-test scripts, stages/scenarios,
  executors, VUs/duration/iterations, thresholds, checks, built-in/custom
  metrics, summary/cloud/Prometheus/InfluxDB/StatsD/OpenTelemetry outputs, and
  runtime controls. RepoTutor maps that to deterministic static performance
  readiness and explicitly does not generate load or claim performance
  pass/fail results.
- RED smoke generated
  `/tmp/repotutor-performance-red-studies.Ld7wHh/2026-06-04/local__simple-ts-app__main__470b176e`;
  old behavior was missing `analysis/performance-report.json`,
  `markdown/performance.md`, and `html/performance.html`.
- GREEN smoke generated
  `/tmp/repotutor-performance-green-studies.ItApNO/2026-06-04/local__simple-ts-app__main__470b176e`;
  confirmed `verificationCheckedRequiredArtifacts=93`, script targets 0,
  workload models 8, thresholds 0, checks 0, metrics 0, outputs 1, runtime
  controls 8, recommended commands 5, risk queue 2, `performance-card`,
  `data-source-pattern="k6"`, manifest/learning path entries, and
  `open --target performance` -> `html/performance.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 29/29 audit checks across 13 generated reports

### Upgrade 132: E2E Readiness Report

- Cloned and inspected `microsoft/playwright` under
  `research/external-src/microsoft-playwright` without executing external
  source.
- GitHub metadata: public repo, Apache-2.0 license, 90,218 stars, 5,853 forks,
  updated 2026-06-04T01:39:58Z. No source code was copied into RepoTutor.
- Added `E2eReportSchema` and `analysis/e2e-report.json` with
  Playwright-style test suites, browser projects, locator signals, assertions,
  artifacts, runtime targets, risk queue, recommended commands, and learner
  next steps.
- Added `markdown/e2e.md`, `html/e2e.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target e2e`.
- Source pattern: Playwright separates browser projects for Chromium, Firefox,
  WebKit/mobile/API flows, web-first locators and assertions, trace/screenshot/
  video/report artifacts, `webServer`/`baseURL`, retries, workers, storage
  state, and CI artifact readiness. RepoTutor maps that to deterministic static
  E2E readiness and explicitly does not launch browsers or claim user-flow
  pass/fail results.
- RED smoke generated
  `/tmp/repotutor-e2e-red-studies.T2zTjI/2026-06-04/local__simple-ts-app__main__c688d74e`;
  old behavior was missing `analysis/e2e-report.json`, `markdown/e2e.md`, and
  `html/e2e.html`.
- GREEN smoke generated
  `/tmp/repotutor-e2e-green-studies.Ce8iow/2026-06-04/local__simple-ts-app__main__c688d74e`;
  confirmed `verificationCheckedRequiredArtifacts=96`, test suites 0, browser
  projects 5, locator signals 0, assertions 7, artifacts 1, runtime targets 7,
  recommended commands 5, risk queue 2, `e2e-card`,
  `data-source-pattern="Playwright"`, manifest/learning-path entries, and
  `open --target e2e` -> `html/e2e.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 30/30 audit checks across 13 generated reports

### Upgrade 133: Accessibility Readiness Report

- Cloned and inspected `dequelabs/axe-core` under
  `research/external-src/dequelabs-axe-core` without executing external
  source.
- GitHub metadata: public repo, MPL-2.0 license, 7,215 stars, 891 forks,
  updated 2026-06-03T17:43:51Z. No source code was copied into RepoTutor.
- Added `AccessibilityReportSchema` and `analysis/accessibility-report.json`
  with axe-core-style scan targets, WCAG/category rule tags, result buckets,
  impact levels, integration signals, context controls, risk queue,
  recommended commands, and learner next steps.
- Added `markdown/accessibility.md`, `html/accessibility.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target accessibility`.
- Source pattern: axe-core separates rendered scan targets, `axe.run`/
  `axe.getRules`, WCAG and category tags, `violations`, `passes`,
  `incomplete`, `inapplicable`, impact severity, selector/context controls,
  reporters, iframes, locale/configuration, and manual review paths.
  RepoTutor maps that to deterministic static accessibility readiness and
  explicitly does not run axe-core or claim WCAG pass/fail results.
- RED smoke generated
  `/tmp/repotutor-accessibility-red-studies.adt06F/2026-06-04/local__simple-ts-app__main__538313d3`;
  old behavior was missing `analysis/accessibility-report.json`,
  `markdown/accessibility.md`, and `html/accessibility.html`.
- GREEN smoke generated
  `/tmp/repotutor-accessibility-green-studies.z7ESax/2026-06-04/local__simple-ts-app__main__538313d3`;
  confirmed `verificationCheckedRequiredArtifacts=99`, scan targets 0, rule
  tags 19, result buckets 4, impact levels 5, integration signals 0, context
  controls 9, recommended commands 5, risk queue 2, `accessibility-card`,
  `data-source-pattern="axe-core"`, manifest/learning-path entries, and
  `open --target accessibility` -> `html/accessibility.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 31/31 audit checks across 13 generated reports

### Upgrade 134: Storybook Readiness Report

- Cloned and inspected `storybookjs/storybook` under
  `research/external-src/storybookjs-storybook` without executing external
  source.
- GitHub metadata: public repo, MIT license, 90,173 stars, 10,113 forks,
  updated 2026-06-03T21:40:35Z. Compared with `tajo/ladle`,
  `histoire-dev/histoire`, and `mui/toolpad`; selected Storybook for the broad
  CSF, docs, addon, test, and publish model. No source code was copied into
  RepoTutor.
- Added `StorybookReportSchema` and `analysis/storybook-report.json` with
  Storybook-style story files, config files, story annotations, addon signals,
  test signals, publish signals, risk queue, recommended commands, and learner
  next steps.
- Added `markdown/storybook.md`, `html/storybook.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target storybook`.
- Source pattern: Storybook separates Component Story Format story files,
  default metadata, named story exports, `args`, `argTypes`, `parameters`,
  `decorators`, `loaders`, `tags`, `play` functions, `.storybook/main`,
  `.storybook/preview`, Docs/Autodocs, addon signals, Storybook Test,
  test-runner, coverage, visual testing, Chromatic, and static publish
  workflows. RepoTutor maps that to deterministic static component-workshop
  readiness and explicitly does not start Storybook or claim component-test
  pass/fail results.
- RED smoke generated
  `/tmp/repotutor-storybook-red-studies.bLw8c4/2026-06-04/local__simple-ts-app__main__028712bd`;
  old behavior was missing `analysis/storybook-report.json`,
  `markdown/storybook.md`, and `html/storybook.html`.
- GREEN smoke generated
  `/tmp/repotutor-storybook-green-studies.Czhy2F/2026-06-04/local__simple-ts-app__main__028712bd`;
  confirmed `verificationCheckedRequiredArtifacts=102`, story files 0,
  config files 0, annotations 12, addon signals 13, test signals 9,
  publish signals 7, recommended commands 5, risk queue 2, `storybook-card`,
  `data-source-pattern="Storybook"`, manifest/learning-path entries, and
  `open --target storybook` -> `html/storybook.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 32/32 audit checks across 13 generated reports

### Upgrade 135: Design Tokens Readiness Report

- Cloned and inspected `style-dictionary/style-dictionary` under
  `research/external-src/style-dictionary-style-dictionary` without executing
  external source.
- GitHub metadata: public repo, Apache-2.0 license, 4,674 stars, 621 forks,
  updated 2026-06-02T15:14:43Z. Compared with
  `tokens-studio/sd-transforms`, `tailwindlabs/tailwindcss`, and
  `primer/primitives`; selected Style Dictionary because it directly models
  canonical design token inputs, transforms, and multi-platform outputs.
  No source code was copied into RepoTutor.
- Added `DesignTokensReportSchema` and
  `analysis/design-tokens-report.json` with token source files, token
  categories, platform targets, transform signals, usage signals, governance
  signals, risk queue, recommended commands, and learner next steps.
- Added `markdown/design-tokens.md`, `html/design-tokens.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target design-tokens`.
- Source pattern: Style Dictionary centralizes design token `source` and
  `include` inputs, `platforms`, `transformGroup`, `transforms`, `buildPath`,
  `files`, `destination`, `format`, CTI category/type/item structure, aliases,
  comments, custom transforms/formats/parsers, output references, and
  multi-platform CSS, Android, Compose, iOS, and iOS Swift outputs. RepoTutor
  maps that to deterministic static design-token readiness and explicitly does
  not run token builds or claim generated platform assets are fresh.
- RED smoke generated
  `/tmp/repotutor-design-tokens-red-studies.Oeb524/2026-06-04/local__simple-ts-app__main__557a2318`;
  old behavior was missing `analysis/design-tokens-report.json`,
  `markdown/design-tokens.md`, and `html/design-tokens.html`.
- GREEN smoke generated
  `/tmp/repotutor-design-tokens-green-studies.WSnXYL/2026-06-04/local__simple-ts-app__main__557a2318`;
  confirmed `verificationCheckedRequiredArtifacts=105`, token sources 0,
  token categories 14, platform targets 11, transform signals 12, usage
  signals 8, governance signals 9, recommended commands 5, risk queue 2,
  `design-token-card`, `data-source-pattern="Style Dictionary"`,
  manifest/learning-path entries, and `open --target design-tokens` ->
  `html/design-tokens.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 33/33 audit checks across 13 generated reports

### Upgrade 136: I18n Readiness Report

- Cloned and inspected `formatjs/formatjs` under
  `research/external-src/formatjs-formatjs` without executing external source.
- GitHub metadata: public repo, license not specified by `gh repo view`,
  14,715 stars, 1,385 forks, updated 2026-06-03T23:48:10Z. Compared with
  `i18next/i18next`, `lingui/js-lingui`, and `facebook/fbt`; selected FormatJS
  for the broad React Intl, ICU message, extract/compile/verify, polyfill, and
  ESLint tooling model. No source code was copied into RepoTutor.
- Added `I18nReportSchema` and `analysis/i18n-report.json` with message
  sources, locale assets, runtime signals, extraction signals, ICU signals, QA
  signals, risk queue, recommended commands, and learner next steps.
- Added `markdown/i18n.md`, `html/i18n.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target i18n`.
- Source pattern: FormatJS separates React Intl message declarations
  (`defineMessages`, `defineMessage`, `FormattedMessage`, `intl.formatMessage`),
  `IntlProvider` runtime locale/messages, ICU plural/select/selectordinal
  syntax, `formatjs extract`, `compile`, `compile-folder`, `verify`,
  pseudo-locale and source-location options, ECMA-402 polyfills/locale data,
  and `eslint-plugin-formatjs` rules. RepoTutor maps that to deterministic
  static i18n readiness and explicitly does not extract, compile, or verify
  ICU catalogs.
- RED smoke generated
  `/tmp/repotutor-i18n-red-studies.hqox29/2026-06-04/local__simple-ts-app__main__ada41a1b`;
  old behavior was missing `analysis/i18n-report.json`, `markdown/i18n.md`,
  and `html/i18n.html`.
- GREEN smoke generated
  `/tmp/repotutor-i18n-green-studies.zbv6Sc/2026-06-04/local__simple-ts-app__main__ada41a1b`;
  confirmed `verificationCheckedRequiredArtifacts=108`, message sources 0,
  locale assets 0, runtime signals 8, extraction signals 10, ICU signals 10,
  QA signals 9, recommended commands 5, risk queue 2, `i18n-card`,
  `data-source-pattern="FormatJS"`, manifest/learning-path entries, and
  `open --target i18n` -> `html/i18n.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 34/34 audit checks across 13 generated reports

### Upgrade 137: Release Readiness Report

- Cloned and inspected `semantic-release/semantic-release` under
  `research/external-src/semantic-release-semantic-release` without executing
  external source.
- GitHub metadata: public repo, MIT license, 23,742 stars, 1,804 forks,
  updated 2026-06-04T02:41:15Z. Compared with
  `changesets/changesets`, `googleapis/release-please`, and
  `conventional-changelog/commitlint`; selected semantic-release because it
  directly models automated version calculation, release notes, branch/channel
  workflows, CI publishing, plugin lifecycle steps, authentication, and
  provenance-aware npm publishing. No source code was copied into RepoTutor.
- Added `ReleaseReadinessReportSchema` and
  `analysis/release-readiness-report.json` with release configs, branch
  channels, version signals, CI signals, publish targets, auth signals, plugin
  lifecycle steps, risk queue, recommended commands, and learner next steps.
- Added `markdown/release-readiness.md`, `html/release-readiness.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target release-readiness`.
- Source pattern: semantic-release separates repository release config,
  `branches`, `tagFormat`, conventional commit analysis, generated release
  notes, plugin lifecycle steps (`verifyConditions`, `analyzeCommits`,
  `verifyRelease`, `generateNotes`, `prepare`, `publish`, `addChannel`,
  `success`, `fail`), CI-only execution after tests, full git history checkout,
  scoped `GITHUB_TOKEN`/`NPM_TOKEN`, OIDC trusted publishing, npm provenance,
  and dry-run review. RepoTutor maps that to deterministic static release
  readiness and explicitly does not create tags, publish packages, or verify
  live credentials.
- RED smoke generated
  `/tmp/repotutor-release-red-studies.ij2rnJ/2026-06-04/local__simple-ts-app__main__3b04f674`;
  old behavior was missing `analysis/release-readiness-report.json`,
  `markdown/release-readiness.md`, and `html/release-readiness.html`.
- GREEN smoke generated
  `/tmp/repotutor-release-green-studies.Knbfhz/2026-06-04/local__simple-ts-app__main__3b04f674`;
  confirmed `verificationCheckedRequiredArtifacts=111`, release configs 0,
  branch channels 7, version signals 8, CI signals 9, publish targets 8,
  auth signals 7, plugin steps 9, recommended commands 5, risk queue 2,
  `release-card`, `data-source-pattern="semantic-release"`,
  manifest/learning-path entries, and `open --target release-readiness` ->
  `html/release-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 35/35 audit checks across 13 generated reports

### Upgrade 138: Secret Readiness Report

- Cloned and inspected `gitleaks/gitleaks` under
  `research/external-src/gitleaks-gitleaks` without executing external source.
- GitHub metadata: public repo, MIT license, 27,491 stars, 2,094 forks,
  updated 2026-06-04T01:09:53Z. Compared with
  `trufflesecurity/trufflehog`, `Yelp/detect-secrets`, and
  `awslabs/git-secrets`; selected Gitleaks because it directly models git,
  directory, stdin, baseline, config, allowlist, redaction, report format,
  pre-commit, and staged scanning workflows. No source code was copied into
  RepoTutor.
- Added `SecretReadinessReportSchema` and
  `analysis/secret-readiness-report.json` with scan targets, secret surfaces,
  config signals, reporting signals, prevention signals, advanced signals,
  risk queue, recommended commands, and learner next steps.
- Added `markdown/secret-readiness.md`, `html/secret-readiness.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target secret-readiness`.
- Source pattern: Gitleaks separates `git`, `dir`, and `stdin` scan targets;
  `--baseline-path`/fingerprint handling; `.gitleaks.toml` config precedence;
  custom `[[rules]]` with regex, `secretGroup`, entropy, keywords, tags, and
  composite rules; global/rule allowlists and `.gitleaksignore`; `--redact`;
  JSON, CSV, JUnit, SARIF, and template reports; archive/decode depth;
  pre-commit staged scans and CI gates. RepoTutor maps that to deterministic
  static secret readiness and explicitly does not scan excluded secret-like
  content or traverse full git history.
- RED smoke generated
  `/tmp/repotutor-secret-red-studies.nvmRuY/2026-06-04/local__simple-ts-app__main__9b8131fe`;
  old behavior was missing `analysis/secret-readiness-report.json`,
  `markdown/secret-readiness.md`, and `html/secret-readiness.html`.
- GREEN smoke generated
  `/tmp/repotutor-secret-green-studies.Fey0h5/2026-06-04/local__simple-ts-app__main__9b8131fe`;
  confirmed `verificationCheckedRequiredArtifacts=114`, scan targets 6,
  secret surfaces 0, config signals 0, reporting signals 9, prevention
  signals 7, advanced signals 6, recommended commands 5, risk queue 5,
  `secret-card`, `data-source-pattern="Gitleaks"`, manifest/learning-path
  entries, and `open --target secret-readiness` -> `html/secret-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 36/36 audit checks across 13 generated reports

### Upgrade 139: Container Readiness Report

- Cloned and inspected `hadolint/hadolint` under
  `research/external-src/hadolint-hadolint` without executing external source.
- GitHub metadata: public repo, GPL-3.0 license, 12,185 stars, 495 forks,
  updated 2026-06-01T09:57:49Z. Compared with `wagoodman/dive`,
  `GoogleContainerTools/container-structure-test`, and `bridgecrewio/checkov`;
  selected Hadolint because it directly models Dockerfile AST linting,
  ShellCheck-backed `RUN` review, `.hadolint.yaml` config, trusted registry
  policy, label schema, ignored rules, severity thresholds, CI integrations,
  and SARIF/JUnit/code-quality output. No source code was copied into
  RepoTutor.
- Added `ContainerReadinessReportSchema` and
  `analysis/container-readiness-report.json` with Dockerfiles, Compose files,
  config signals, instruction risks, label policy, integration signals, risk
  queue, recommended commands, and learner next steps.
- Added `markdown/container-readiness.md`, `html/container-readiness.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target container-readiness`.
- Source pattern: Hadolint separates Dockerfile AST rules (`DL`), ShellCheck
  shell checks (`SC`) inside `RUN`, config discovery via `.hadolint.yaml`,
  ignored rules and inline/global ignore pragmas, severity overrides,
  `failure-threshold`, `trustedRegistries`, label schema and strict labels,
  output formats including JSON/SARIF/JUnit/code-quality reports, and
  pre-commit/CI/editor integrations. RepoTutor maps that to deterministic
  static container readiness and explicitly does not build images, parse the
  Dockerfile AST, execute ShellCheck, or verify registries.
- RED smoke generated
  `/tmp/repotutor-container-red-studies.B1NoYh/2026-06-04/local__simple-ts-app__main__3583b1c4`;
  old behavior was missing `analysis/container-readiness-report.json`,
  `markdown/container-readiness.md`, and `html/container-readiness.html`, and
  `open --target container-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-container-green-studies.27lWGI/2026-06-04/local__simple-ts-app__main__3583b1c4`;
  confirmed `verificationCheckedRequiredArtifacts=117`, Dockerfiles 0,
  Compose files 0, config signals 0, instruction risks 15, label policies 7,
  integration signals 9, recommended commands 5, risk queue 2,
  `container-card`, `data-source-pattern="Hadolint"`,
  manifest/learning-path entries, and `open --target container-readiness` ->
  `html/container-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 37/37 audit checks across 13 generated reports

### Upgrade 140: Code Quality Report

- Cloned and inspected `biomejs/biome` under
  `research/external-src/biomejs-biome` without executing external source.
- GitHub metadata: public repo, Apache-2.0/MIT dual license, 24,817 stars,
  1,014 forks, updated 2026-06-03T22:12:06Z. Compared with `eslint/eslint`,
  `prettier/prettier`, and `oxc-project/oxc`; selected Biome because it
  directly models a unified formatter, linter, `check`, `ci`, config,
  assist/source-action, diagnostics, editor/LSP, and safe write workflow.
  No source code was copied into RepoTutor.
- Added `CodeQualityReportSchema` and `analysis/code-quality-report.json`
  with tool configs, formatter signals, linter signals, assist signals,
  CI/editor signals, language coverage, risk queue, recommended commands, and
  learner next steps.
- Added `markdown/code-quality.md`, `html/code-quality.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target code-quality`.
- Source pattern: Biome unifies formatter, linter, `check`, and `ci`;
  supports `biome.json` config for files, formatter, linter, assist, and VCS
  ignore behavior; provides organize-imports/source actions, diagnostics,
  editor/LSP usage, safe `--write` workflows, and CI quality gates. RepoTutor
  maps that to deterministic static code-quality readiness and explicitly does
  not execute Biome, ESLint, Prettier, editor LSPs, or unsafe fixes.
- RED smoke generated
  `/tmp/repotutor-code-quality-red-studies.99eopw/2026-06-04/local__simple-ts-app__main__80547f82`;
  old behavior was missing `analysis/code-quality-report.json`,
  `markdown/code-quality.md`, and `html/code-quality.html`, and
  `open --target code-quality` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-code-quality-green-studies.jk8kVy/2026-06-04/local__simple-ts-app__main__80547f82`;
  confirmed `verificationCheckedRequiredArtifacts=120`, tool configs 0,
  formatter signals 7, linter signals 9, assist signals 5, CI/editor signals
  8, language coverage 8, recommended commands 5, risk queue 7,
  `code-quality-card`, `data-source-pattern="Biome"`,
  manifest/learning-path entries, and `open --target code-quality` ->
  `html/code-quality.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 38/38 audit checks across 13 generated reports

### Upgrade 141: Documentation Readiness Report

- Cloned and inspected `facebook/docusaurus` under
  `research/external-src/facebook-docusaurus` without executing external
  source.
- GitHub metadata: public repo, MIT license, 65,096 stars, 9,917 forks,
  updated 2026-06-02T18:49:20Z. Compared with `vuejs/vitepress`,
  `withastro/starlight`, and `mkdocs/mkdocs`; selected Docusaurus because it
  directly models docs, blog, custom pages, MDX, `docusaurus.config`,
  sidebars, themeConfig navbar/footer, i18n, docs versioning, search,
  build/serve/deploy, and hosted preview workflows. No source code was copied
  into RepoTutor.
- Added `DocumentationReportSchema` and
  `analysis/documentation-report.json` with site configs, content surfaces,
  navigation signals, quality signals, localization signals, release signals,
  risk queue, recommended commands, and learner next steps.
- Added `markdown/documentation.md`, `html/documentation.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target documentation`.
- Source pattern: Docusaurus separates site config, docs/blog/pages content,
  sidebars/navigation, themeConfig, i18n locales and translation folders,
  versioned docs, search/SEO/sitemap/PWA/analytics, and build/serve/deploy
  workflows. RepoTutor maps that to deterministic static documentation
  readiness and explicitly does not compile MDX, generate routes, check links,
  index search, or deploy documentation.
- RED smoke generated
  `/tmp/repotutor-docs-red-studies.h7VvU7/2026-06-04/local__simple-ts-app__main__27a15351`;
  old behavior was missing `analysis/documentation-report.json`,
  `markdown/documentation.md`, and `html/documentation.html`, and
  `open --target documentation` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-docs-green-studies.qnhIhx/2026-06-04/local__simple-ts-app__main__27a15351`;
  confirmed `verificationCheckedRequiredArtifacts=123`, site configs 0,
  content surfaces 7, navigation signals 6, quality signals 8, localization
  signals 5, release signals 7, recommended commands 5, risk queue 1,
  `documentation-card`, `data-source-pattern="Docusaurus"`,
  manifest/learning-path entries, and `open --target documentation` ->
  `html/documentation.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 39/39 audit checks across 13 generated reports

### Upgrade 142: Database Readiness Report

- Cloned and inspected `prisma/prisma` under
  `research/external-src/prisma-prisma` without executing external source.
- GitHub metadata: public repo, Apache-2.0 license, 46,060 stars, 2,234 forks,
  updated 2026-06-03T16:29:53Z. Compared with `drizzle-team/drizzle-orm`,
  `typeorm/typeorm`, and `sequelize/sequelize`; selected Prisma because it
  directly models schema.prisma, datasource/generator/model blocks,
  `prisma.config`, migrations, generate/db push workflows, Prisma Client,
  driver adapters, `DATABASE_URL`, seed scripts, and local database services.
  No source code was copied into RepoTutor.
- Added `DatabaseReadinessReportSchema` and
  `analysis/database-readiness-report.json` with schema files, datasource
  signals, migration signals, client signals, config signals, model signals,
  risk queue, recommended commands, and learner next steps.
- Added `markdown/database-readiness.md`, `html/database-readiness.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target database-readiness`.
- Source pattern: Prisma separates schema files, datasource providers,
  generators, models, migrations, db push, introspection, generated clients,
  driver adapters, `prisma.config`, `DATABASE_URL`, seed scripts, and Studio
  inspection. RepoTutor maps that to deterministic static database readiness
  and explicitly does not connect to databases, run migrations, introspect
  schemas, generate clients, or seed data.
- RED smoke generated
  `/tmp/repotutor-database-red-studies.I6noIN/2026-06-04/local__simple-ts-app__main__3afacc02`;
  old behavior was missing `analysis/database-readiness-report.json`,
  `markdown/database-readiness.md`, and `html/database-readiness.html`, and
  `open --target database-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-database-green-studies.XJ1CF2/2026-06-04/local__simple-ts-app__main__3afacc02`;
  confirmed `verificationCheckedRequiredArtifacts=126`, schema files 0,
  datasource signals 7, migration signals 8, client signals 7, config signals
  7, model signals 9, recommended commands 7, risk queue 1, `database-card`,
  `data-source-pattern="Prisma"`, manifest/learning-path entries, and
  `open --target database-readiness` -> `html/database-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 40/40 audit checks across 13 generated reports

### Upgrade 143: CI/CD Readiness Report

- Cloned and inspected `github/docs` under
  `research/external-src/github-docs` without executing external source.
- GitHub metadata: public repo, CC-BY-4.0 license, 20,395 stars, 67,331
  forks, updated 2026-06-04T00:02:00Z. Compared with
  `actions/starter-workflows`, `nektos/act`, and
  `step-security/harden-runner`; selected `github/docs` because it is the
  official Actions documentation source for workflow syntax, events, jobs,
  permissions, GITHUB_TOKEN, OIDC, cache/artifacts, concurrency,
  environments, and deployments. No source code was copied into RepoTutor.
- Added `CiCdReportSchema` and `analysis/ci-cd-report.json` with workflow
  files, trigger signals, job signals, security signals, delivery signals,
  platform signals, risk queue, recommended commands, and learner next steps.
- Added `markdown/ci-cd.md`, `html/ci-cd.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target ci-cd`.
- Source pattern: GitHub Actions separates workflow YAML placement under
  `.github/workflows`, trigger events, jobs/runners/steps, permissions and
  token boundaries, artifact/cache persistence, concurrency, and protected
  deployment environments. RepoTutor maps that to deterministic static CI/CD
  readiness and explicitly does not execute workflows, validate YAML
  semantics, or call GitHub APIs.
- RED smoke generated
  `/tmp/repotutor-cicd-red-studies.kYsdLH/2026-06-04/local__simple-ts-app__main__c83f7d20`;
  old behavior was missing `analysis/ci-cd-report.json`,
  `markdown/ci-cd.md`, and `html/ci-cd.html`, and
  `open --target ci-cd` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-cicd-green-studies.S3BdhY/2026-06-04/local__simple-ts-app__main__c83f7d20`;
  confirmed `verificationCheckedRequiredArtifacts=129`, workflow files 0,
  trigger signals 8, job signals 11, security signals 8, delivery signals 8,
  platform signals 8, recommended commands 6, risk queue 2, `ci-cd-card`,
  `data-source-pattern="GitHub Actions"`, manifest/learning-path entries,
  and `open --target ci-cd` -> `html/ci-cd.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 41/41 audit checks across 13 generated reports

### Upgrade 144: Unit Test Readiness Report

- Cloned and inspected `vitest-dev/vitest` under
  `research/external-src/vitest-dev-vitest` without executing external source.
- GitHub metadata: public repo, MIT license, 16,625 stars, 1,799 forks,
  updated 2026-06-04T00:58:09Z. Compared with `jestjs/jest`,
  `mochajs/mocha`, and `avajs/ava`; selected Vitest because it directly
  models Vite-backed test files/config, expect/assert assertions, snapshots,
  `vi` mocks/spies/fake timers, v8/istanbul coverage, jsdom/happy-dom/browser
  environments, projects/workspaces, typecheck, UI, reporters, watch/run, and
  sharding. No source code was copied into RepoTutor.
- Added `UnitTestReportSchema` and `analysis/unit-test-report.json` with test
  files, config files, assertion signals, mock signals, coverage signals,
  environment signals, reporting signals, risk queue, recommended commands,
  and learner next steps.
- Added `markdown/unit-tests.md`, `html/unit-tests.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target unit-tests`.
- Source pattern: Vitest separates test discovery, config, assertions, mocks,
  snapshots, coverage providers, DOM/browser environments, projects,
  workspaces, type checks, watch/run modes, UI, reporters, and sharding.
  RepoTutor maps that to deterministic static unit-test readiness and
  explicitly does not execute tests, measure coverage, update snapshots, or
  validate jsdom/browser behavior.
- RED smoke generated
  `/tmp/repotutor-unit-tests-red-studies.Kjl4iU/2026-06-04/local__simple-ts-app__main__78437cc2`;
  old behavior was missing `analysis/unit-test-report.json`,
  `markdown/unit-tests.md`, and `html/unit-tests.html`, and
  `open --target unit-tests` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-unit-tests-green-studies.SERqqs/2026-06-04/local__simple-ts-app__main__78437cc2`;
  confirmed `verificationCheckedRequiredArtifacts=132`, test files 0,
  config files 1, assertion signals 9, mock signals 8, coverage signals 8,
  environment signals 11, reporting signals 11, recommended commands 6, risk
  queue 4, `unit-test-card`, `data-source-pattern="Vitest"`,
  manifest/learning-path entries, and `open --target unit-tests` ->
  `html/unit-tests.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 42/42 audit checks across 13 generated reports

### Upgrade 145: Typecheck Readiness Report

- Cloned and inspected `microsoft/TypeScript` under
  `research/external-src/microsoft-typescript` without executing external
  source.
- GitHub metadata: public repo, Apache-2.0 license, 109,062 stars, 13,430
  forks, updated 2026-06-02T18:17:24Z. Compared with `tsconfig/bases`,
  `typescript-eslint/typescript-eslint`, and `mattpocock/ts-reset`; selected
  TypeScript because it is the authoritative source for compilerOptions,
  strict flags, project references, moduleResolution, declaration emit,
  tsconfig root options, and `tsc` project/build commands. No source code was
  copied into RepoTutor.
- Added `TypecheckReadinessReportSchema` and
  `analysis/typecheck-readiness-report.json` with tsconfig files, compiler
  option signals, project signals, module resolution signals, declaration
  signals, script signals, risk queue, recommended commands, and learner next
  steps.
- Added `markdown/typecheck-readiness.md`, `html/typecheck-readiness.html`,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target typecheck-readiness`.
- Source pattern: TypeScript separates `compilerOptions`, `strict` and strict
  subflags, project references, `composite`, incremental build info,
  declaration emit, `noEmit`, moduleResolution, paths/types lookup, and `tsc`
  run/build/showConfig/traceResolution commands. RepoTutor maps that to
  deterministic static typecheck readiness and explicitly does not execute
  `tsc`, resolve modules, emit declarations, or inspect real diagnostics.
- RED smoke generated
  `/tmp/repotutor-typecheck-red-studies.Mn1sce/2026-06-04/local__simple-ts-app__main__7dbe8c24`;
  old behavior was missing `analysis/typecheck-readiness-report.json`,
  `markdown/typecheck-readiness.md`, and `html/typecheck-readiness.html`, and
  `open --target typecheck-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-typecheck-green-studies.6zrl4P/2026-06-04/local__simple-ts-app__main__7dbe8c24`;
  confirmed `verificationCheckedRequiredArtifacts=135`, tsconfig files 0,
  compiler option signals 13, project signals 10, module resolution signals
  10, declaration signals 7, script signals 7, recommended commands 6, risk
  queue 3, `typecheck-card`, `data-source-pattern="TypeScript"`,
  manifest/learning-path entries, and `open --target typecheck-readiness` ->
  `html/typecheck-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS
- `pnpm audit:brief`: PASS, 43/43 audit checks across 13 generated reports

### Upgrade 146: Package Manager Readiness Report

- Cloned and inspected `pnpm/pnpm` under
  `research/external-src/pnpm-pnpm` without executing external source.
- GitHub metadata: public repo, MIT license, 35,358 stars, 1,475 forks,
  updated 2026-06-04T02:33:19Z. Compared with `npm/cli`,
  `yarnpkg/berry`, and `oven-sh/bun`; selected pnpm because it directly
  models package-manager choice, deterministic lockfiles, monorepo
  workspaces, workspace package includes/excludes, catalogs, build-script
  allowlists, audit config, packageManager/devEngines, lifecycle hooks, and
  recursive/filter commands. No source code was copied into RepoTutor.
- Implemented pnpm-style package-manager readiness report:
  `PackageManagerReportSchema`, `analysis/package-manager-report.json`,
  `markdown/package-manager.md`, `html/package-manager.html`, manifest files,
  workspace signals, lockfile signals, script signals, policy signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target package-manager`.
- Source pattern: pnpm separates `packageManager`, `devEngines`, workspace
  package globs, catalog dependency versions, allowBuilds/audit policy,
  lockfile importers/packages, recursive workspace commands, filters,
  frozen-lockfile installs, and `.pnpmfile` hooks. RepoTutor maps that to
  deterministic static package-manager readiness and explicitly does not run
  install commands, resolve registry metadata, or execute lifecycle scripts.
- RED smoke generated
  `/tmp/repotutor-package-manager-red-studies.8KT87t/2026-06-04/local__simple-ts-app__main__9651bbfc`;
  old behavior was missing `analysis/package-manager-report.json`,
  `markdown/package-manager.md`, and `html/package-manager.html`, and
  `open --target package-manager` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-package-manager-green-studies.OjoTZl/2026-06-04/local__simple-ts-app__main__9651bbfc`;
  confirmed `verificationCheckedRequiredArtifacts=138`, manifest files 1,
  workspace signals 8, lockfile signals 0, script signals 11, policy signals
  10, recommended commands 6, risk queue 3, `package-manager-card`,
  `data-source-pattern="pnpm"`, manifest/learning-path entries, and
  `open --target package-manager` -> `html/package-manager.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 44/44 audit checks across 13 generated reports

### Upgrade 147: Git Hooks Readiness Report

- Cloned and inspected `typicode/husky` under
  `research/external-src/typicode-husky` without executing external source.
- GitHub metadata: public repo, MIT license, 35,122 stars, 1,086 forks,
  updated 2026-03-19T23:03:16Z. Compared with `lint-staged/lint-staged`,
  `conventional-changelog/commitlint`, and `pre-commit/pre-commit`; selected
  Husky because it directly models `.husky` hook files, prepare install
  scripts, Git `core.hooksPath`, pre-commit/pre-push/commit-msg policy,
  `HUSKY=0` and `--no-verify` bypass semantics, CI skip handling,
  GUI/Node PATH mitigation, POSIX shell hooks, and lint-staged handoff. No
  source code was copied into RepoTutor.
- Implemented Husky-style Git hooks readiness report:
  `GitHooksReportSchema`, `analysis/git-hooks-report.json`,
  `markdown/git-hooks.md`, `html/git-hooks.html`, hook files, install signals,
  command signals, policy signals, tool config files, recommended commands,
  risk queue, manifest/session-verification coverage, learning-path linkage,
  nav entry for package-manager/git-hooks, and `open --target git-hooks`.
- Source pattern: Husky separates `.husky` hook files, install/setup through
  `prepare` or `core.hooksPath`, hook trigger names such as pre-commit,
  pre-push, and commit-msg, bypass policy through `HUSKY=0` and
  `--no-verify`, POSIX shell portability, GUI/Node PATH mitigation, and
  staged-file handoff to lint-staged. RepoTutor maps that to deterministic
  static Git hook readiness and explicitly does not run hooks, mutate Git
  config, or create commits.
- RED smoke generated
  `/tmp/repotutor-git-hooks-red-studies.o0Mw9c/2026-06-04/local__simple-ts-app__main__9d91477c`;
  old behavior was missing `analysis/git-hooks-report.json`,
  `markdown/git-hooks.md`, and `html/git-hooks.html`, and
  `open --target git-hooks` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-git-hooks-green-studies.OiRXQ5/2026-06-04/local__simple-ts-app__main__9d91477c`;
  confirmed `verificationCheckedRequiredArtifacts=141`, hook files 0,
  install signals 6, command signals 11, policy signals 9, tool config files
  0, recommended commands 6, risk queue 3, `git-hooks-card`,
  `data-source-pattern="Husky"`, manifest/learning-path entries,
  `node-entrypoint=external`, and `open --target git-hooks` ->
  `html/git-hooks.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 45/45 audit checks across 13 generated reports

### Upgrade 148: Task Runner Readiness Report

- Cloned and inspected `vercel/turborepo` under
  `research/external-src/vercel-turborepo` without executing external source.
- GitHub metadata: public repo, MIT license, 30,491 stars, 2,356 forks,
  updated 2026-06-03T21:05:38Z. Compared with `nrwl/nx`,
  `moonrepo/moon`, and `go-task/task`; selected Turborepo because it directly
  models `turbo.json` tasks, `dependsOn`, cache `outputs`/`inputs`, disabled
  cache tasks, persistent dev tasks, workspace filters, global/pass-through
  environment variables, package scripts, dry-run graph inspection, summaries,
  daemon status, and prune handoff. No source code was copied into RepoTutor.
- Implemented Turborepo-style task-runner readiness report:
  `TaskRunnerReportSchema`, `analysis/task-runner-report.json`,
  `markdown/task-runner.md`, `html/task-runner.html`, config files, task
  signals, cache signals, dependency signals, environment signals, package
  script signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target task-runner`.
- Source pattern: Turborepo separates `turbo.json` task definitions,
  `dependsOn` graph ordering, cache `outputs`/`inputs`, remote/local cache
  controls, persistent tasks, package selection filters, global/cache-key env,
  pass-through runtime env, package scripts, dry-run task graph inspection,
  summaries, daemon status, and prune workflows. RepoTutor maps that to
  deterministic static task-runner readiness and explicitly does not run
  task commands, restore cache, contact remote cache, or execute package
  scripts.
- RED smoke generated
  `/tmp/repotutor-task-runner-red-studies.mmx6dc/2026-06-04/local__simple-ts-app__main__3a9e7dbd`;
  old behavior was missing `analysis/task-runner-report.json`,
  `markdown/task-runner.md`, and `html/task-runner.html`, and
  `open --target task-runner` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-task-runner-green-studies.IXhmGC/2026-06-04/local__simple-ts-app__main__3a9e7dbd`;
  confirmed `verificationCheckedRequiredArtifacts=144`, config files 0,
  task signals 8, cache signals 7, dependency signals 6, environment signals
  6, package script signals 6, recommended commands 6, risk queue 2,
  `task-runner-card`, `data-source-pattern="Turborepo"`,
  manifest/learning-path entries, and `open --target task-runner` ->
  `html/task-runner.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 46/46 audit checks across 13 generated reports

### Upgrade 149: Dependency Updates Readiness Report

- Cloned and inspected `renovatebot/renovate` under
  `research/external-src/renovatebot-renovate` without executing external
  source.
- GitHub metadata: public repo, AGPL-3.0-only license from the cloned license
  file, 21,684 stars, 3,089 forks, updated 2026-06-04T05:03:37Z. Compared
  with `dependabot/dependabot-core`, `renovatebot/github-action`, and
  `googleapis/release-please`; selected Renovate because it directly models
  dependency-update config, presets, `packageRules`, automerge, schedules,
  dependency dashboard approval, manager/package-file discovery,
  registry/private package policy, rate limits, range strategy, and config
  migration. No source code was copied into RepoTutor.
- Implemented Renovate-style dependency-updates readiness report:
  `DependencyUpdateReportSchema`, `analysis/dependency-update-report.json`,
  `markdown/dependency-updates.md`, `html/dependency-updates.html`, config
  files, manager signals, policy signals, workflow signals, registry signals,
  package file signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target dependency-updates`.
- Source pattern: Renovate separates config presets, `packageRules`,
  automerge, schedules, dependency dashboard and approval flow, enabled
  managers, package-file discovery, host rules, registry URLs, token env,
  labels/reviewers, PR concurrency/rate limits, range strategy, config
  migration, grouping, rebase policy, and lockfile maintenance. RepoTutor maps
  that to deterministic static dependency-update readiness and explicitly does
  not query registries, create branches, open pull requests, or validate
  private credentials.
- RED smoke generated
  `/tmp/repotutor-dependency-updates-red-studies.AFZpPj/2026-06-04/local__simple-ts-app__main__95221a2c`;
  old behavior was missing `analysis/dependency-update-report.json`,
  `markdown/dependency-updates.md`, and `html/dependency-updates.html`, and
  `open --target dependency-updates` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-dependency-updates-green-studies.7fSpWZ/2026-06-04/local__simple-ts-app__main__95221a2c`;
  confirmed `verificationCheckedRequiredArtifacts=147`, config files 0,
  manager signals 9, policy signals 11, workflow signals 8, registry signals
  5, package file signals 12, recommended commands 6, risk queue 2,
  `package-json=ready`, `npm=ready`, `dependency-update-card`,
  `data-source-pattern="Renovate"`, manifest/learning-path entries, and
  `open --target dependency-updates` -> `html/dependency-updates.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 47/47 audit checks across 13 generated reports

### Upgrade 150: Lint Readiness Report

- Cloned and inspected `eslint/eslint` under
  `research/external-src/eslint-eslint` without executing external source.
- GitHub metadata: public repo, MIT license from the cloned license/package
  metadata, 27,265 stars, 5,017 forks, updated 2026-06-04T01:32:13Z.
  Compared with `biomejs/biome`, `oxc-project/oxc`, and
  `standard/standard`; selected ESLint because it directly models flat config,
  rules, plugins, parser boundaries, ignores, inline disables, formatter and
  output controls, fix/cache/max-warnings workflows, config inspection, and
  package script handoff. No source code was copied into RepoTutor.
- Implemented ESLint-style lint readiness report:
  `LintReadinessReportSchema`, `analysis/lint-readiness-report.json`,
  `markdown/lint-readiness.md`, `html/lint-readiness.html`, config files,
  rule signals, script signals, scope signals, output signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, and `open --target lint-readiness`.
- Source pattern: ESLint separates flat config file discovery, rules and
  severities, plugins, parsers, globals, ignores, inline disable handling,
  output formatters/files, fix and fix-dry-run modes, cache strategy, warning
  budgets, and `--print-config`/`--inspect-config` diagnostics. RepoTutor maps
  that to deterministic static lint readiness and explicitly does not run
  ESLint, apply fixes, resolve plugin/parser packages, or write cache files.
- RED smoke generated
  `/tmp/repotutor-lint-readiness-red-studies.zVyVO1/2026-06-04/local__simple-ts-app__main__a0316049`;
  old behavior was missing `analysis/lint-readiness-report.json`,
  `markdown/lint-readiness.md`, and `html/lint-readiness.html`, and
  `open --target lint-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-lint-readiness-green-studies.mTm9Eq/2026-06-04/local__simple-ts-app__main__a0316049`;
  confirmed `verificationCheckedRequiredArtifacts=150`, config files 0,
  rule signals 11, script signals 9, scope signals 7, output signals 7,
  package signals 7, recommended commands 6, risk queue 3,
  `formatter=ready`, `typescript=ready`, manifest/learning-path entries, and
  `open --target lint-readiness` -> `html/lint-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 48/48 audit checks across 13 generated reports

### Upgrade 151: Format Readiness Report

- Cloned and inspected `prettier/prettier` under
  `research/external-src/prettier-prettier` without executing external source.
- GitHub metadata: public repo, MIT license, 51,899 stars, 4,743 forks,
  updated 2026-06-04T04:26:21Z. Compared with `dprint/dprint`,
  `biomejs/biome`, and `standard/standard`; selected Prettier because it
  directly models formatter config discovery, `.prettierignore`, option
  signals, parser/plugin boundaries, safe `--check`/`--list-different` gates,
  write-mode risk, cache strategy, `.editorconfig`, file-info, and config-path
  handoff. No source code was copied into RepoTutor.
- Implemented Prettier-style format readiness report:
  `FormatReadinessReportSchema`, `analysis/format-readiness-report.json`,
  `markdown/format-readiness.md`, `html/format-readiness.html`, config files,
  ignore files, option signals, script signals, scope signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, and `open --target format-readiness`.
- Source pattern: Prettier separates config files, package metadata,
  `.editorconfig`, `.prettierignore`/`.gitignore`, parser inference and
  overrides, plugins, options, `--check`, `--list-different`, `--write`,
  cache/cache-strategy, `--find-config-path`, and `--file-info`. RepoTutor
  maps that to deterministic static format readiness and explicitly does not
  run Prettier, rewrite files, load plugins, or create cache files.
- RED smoke generated
  `/tmp/repotutor-format-readiness-red-studies.nssQ2F/2026-06-04/local__simple-ts-app__main__dacdd6d6`;
  old behavior was missing `analysis/format-readiness-report.json`,
  `markdown/format-readiness.md`, and `html/format-readiness.html`, and
  `open --target format-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-format-readiness-green-studies.UUtaMX/2026-06-04/local__simple-ts-app__main__dacdd6d6`;
  confirmed `verificationCheckedRequiredArtifacts=153`, config files 0,
  ignore files 0, option signals 10, script signals 9, scope signals 8,
  package signals 6, recommended commands 6, risk queue 2,
  `javascript=ready`, `typescript=ready`, `json=ready`,
  manifest/learning-path entries, and `open --target format-readiness` ->
  `html/format-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 49/49 audit checks across 13 generated reports

### Upgrade 152: Commit Conventions Report

- Cloned and inspected `conventional-changelog/commitlint` under
  `research/external-src/conventional-changelog-commitlint` without executing
  external source.
- GitHub metadata: public repo, MIT license, 18,572 stars, 963 forks, updated
  2026-06-03T17:02:48Z. Compared with
  `conventional-changelog/conventional-changelog`, `changesets/changesets`,
  and `semantic-release/semantic-release`; selected commitlint because it
  directly models Conventional Commit config discovery,
  `@commitlint/config-conventional`, rule defaults, `parserPreset`,
  commit-message hooks, CI range checks, edit/last commands, strict/verbose
  diagnostics, prompts, and commitizen handoff. No source code was copied into
  RepoTutor.
- Implemented commitlint-style commit-conventions report:
  `CommitConventionReportSchema`, `analysis/commit-conventions-report.json`,
  `markdown/commit-conventions.md`, `html/commit-conventions.html`, config
  files, rule signals, hook signals, command signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target commit-conventions`.
- Source pattern: commitlint separates config discovery through
  `.commitlintrc*`, `commitlint.config.*`, and package metadata, shared config
  extension, parser presets, rule checks for type/scope/subject/header/body
  and footer shape, commit-message hooks, CI `--from`/`--to` ranges,
  `--last`, `--edit`, verbose output, strict mode, prompts, and commitizen
  flows. RepoTutor maps that to deterministic static commit-convention
  readiness and explicitly does not lint real commits, mutate Git history,
  install hooks, or run external commit tooling.
- RED smoke generated
  `/tmp/repotutor-commit-conventions-red-studies.qnxgrW/2026-06-04/local__simple-ts-app__main__48d2a74a`;
  old behavior was missing `analysis/commit-conventions-report.json`,
  `markdown/commit-conventions.md`, and `html/commit-conventions.html`, and
  `open --target commit-conventions` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-commit-conventions-green-studies.lQ5POD/2026-06-04/local__simple-ts-app__main__48d2a74a`;
  confirmed `verificationCheckedRequiredArtifacts=156`, config files 0,
  rule signals 11, hook signals 7, command signals 8, package signals 6,
  recommended commands 6, risk queue 2, no false-positive ready `type-enum`
  signal on the simple fixture, manifest/learning-path entries, and
  `open --target commit-conventions` -> `html/commit-conventions.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 50/50 audit checks across 13 generated reports

### Upgrade 153: Changelog Readiness Report

- Cloned and inspected `changesets/changesets` under
  `research/external-src/changesets-changesets` without executing external
  source. Clone HEAD was `18e1661`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 11,936 stars, 791 forks, updated
  2026-06-02T21:11:56Z. Compared with
  `conventional-changelog/conventional-changelog`,
  `semantic-release/semantic-release`, and `googleapis/release-please`;
  selected Changesets because it directly models release-intent markdown
  files, changelog config, status checks, version PRs, publish/tag handoff,
  prerelease and snapshot policy, fixed/linked packages, internal dependency
  updates, access/private package policy, bot/action automation, and monorepo
  release notes. No source code was copied into RepoTutor.
- Implemented Changesets-style changelog-readiness report:
  `ChangelogReadinessReportSchema`,
  `analysis/changelog-readiness-report.json`,
  `markdown/changelog-readiness.md`, `html/changelog-readiness.html`, config
  files, changeset files, workflow signals, command signals, package signals,
  policy signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target changelog-readiness`.
- Source pattern: Changesets separates `.changeset/config.json`, release
  intent markdown files with semver bump front matter, changelog generator
  selection, base branch comparison, `status`, `version`, `publish`, `pre`,
  `tag`, snapshot commands, fixed/linked packages, internal dependency update
  policy, access/private package controls, bot/action automation, version PRs,
  and git tag publishing. RepoTutor maps that to deterministic static
  changelog readiness and explicitly does not create changesets, version
  packages, publish to npm, create tags, or push release commits.
- RED smoke generated
  `/tmp/repotutor-changelog-readiness-red-studies.zoN99g/2026-06-04/local__simple-ts-app__main__6fe1d17b`;
  old behavior was missing `analysis/changelog-readiness-report.json`,
  `markdown/changelog-readiness.md`, and `html/changelog-readiness.html`, and
  `open --target changelog-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-changelog-readiness-green-studies.KZxOaK/2026-06-04/local__simple-ts-app__main__6fe1d17b`;
  confirmed `verificationCheckedRequiredArtifacts=159`, config files 0,
  changeset files 0, workflow signals 7, command signals 10, package signals
  6, policy signals 9, recommended commands 6, risk queue 2,
  manifest/learning-path entries, and `open --target changelog-readiness` ->
  `html/changelog-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 51/51 audit checks across 13 generated reports

### Upgrade 154: Bundle Analysis Report

- Cloned and inspected `webpack/webpack-bundle-analyzer` under
  `research/external-src/webpack-webpack-bundle-analyzer` without executing
  external source. Clone HEAD was `9ba43c7`; the clone remains ignored by
  RepoTutor.
- GitHub metadata: public repo, MIT license, 12,667 stars, 504 forks, updated
  2026-05-20T11:27:07Z. Compared with
  `btd/rollup-plugin-visualizer`, `vitejs/vite`, and
  `danvk/source-map-explorer`; selected Webpack Bundle Analyzer because it
  directly models stats JSON bundle composition, zoomable treemap reporting,
  analyzer mode selection, static/JSON report outputs, stat/parsed/gzip/Brotli/
  Zstandard size modes, source-map and bundle directory handoff, chunk/asset
  visibility, and trusted analyzer CLI commands. No source code was copied into
  RepoTutor.
- Implemented Webpack Bundle Analyzer-style bundle-analysis report:
  `BundleAnalysisReportSchema`, `analysis/bundle-analysis-report.json`,
  `markdown/bundle-analysis.md`, `html/bundle-analysis.html`, config files,
  bundle artifacts, size signals, script signals, package signals, recommended
  commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target bundle-analysis`.
- Source pattern: Webpack Bundle Analyzer separates stats generation
  (`webpack --profile --json`), analyzer plugin and CLI entrypoints,
  `analyzerMode` (`server`, `static`, `json`, `disabled`), report and stats
  filenames, default size mode (`stat`, `parsed`, `gzip`, `brotli`, `zstd`),
  compression algorithms, bundle directories, source maps, chunks, assets,
  exclusions, and no-open behavior. RepoTutor maps that to deterministic static
  bundle-analysis readiness and explicitly does not run webpack, open analyzer
  servers, calculate compressed sizes, or execute external analyzer code.
- RED smoke generated
  `/tmp/repotutor-bundle-analysis-red-studies.7oWjQJ/2026-06-04/local__simple-ts-app__main__419a1930`;
  old behavior was missing `analysis/bundle-analysis-report.json`,
  `markdown/bundle-analysis.md`, and `html/bundle-analysis.html`, and
  `open --target bundle-analysis` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-bundle-analysis-green-studies.l4dWOy/2026-06-04/local__simple-ts-app__main__419a1930`;
  confirmed `verificationCheckedRequiredArtifacts=162`, config files 0,
  bundle artifacts 0, size signals 10, script signals 7, package signals 6,
  recommended commands 6, risk queue 2, manifest/learning-path entries, and
  `open --target bundle-analysis` -> `html/bundle-analysis.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 52/52 audit checks across 13 generated reports

### Upgrade 155: Mocking Readiness Report

- Cloned and inspected `mswjs/msw` under
  `research/external-src/mswjs-msw` without executing external source. Clone
  HEAD was `8a19d54`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 17,971 stars, 620 forks, updated
  2026-05-15T16:46:30Z. Compared with `nock/nock`,
  `pact-foundation/pact-js`, and `wiremock/wiremock`; selected MSW because it
  directly models JavaScript/TypeScript request handlers, `setupWorker`,
  `setupServer`, HTTP/GraphQL/WebSocket mocking, `HttpResponse`, unhandled
  request policy, passthrough/bypass, lifecycle reset/restore/close, and
  reusable browser/Node mock definitions. No source code was copied into
  RepoTutor.
- Implemented MSW-style mocking-readiness report:
  `MockingReadinessReportSchema`,
  `analysis/mocking-readiness-report.json`,
  `markdown/mocking-readiness.md`, `html/mocking-readiness.html`, handler
  files, setup surfaces, protocol signals, lifecycle signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target mocking-readiness`.
- Source pattern: MSW separates request handlers (`http`, `graphql`, `ws`),
  response builders (`HttpResponse`), browser setup (`setupWorker`), Node setup
  (`setupServer`), lifecycle controls (`listen`, `start`, `use`,
  `resetHandlers`, `restoreHandlers`, `close`, `boundary`), strictness through
  `onUnhandledRequest`, and passthrough/bypass controls. RepoTutor maps that to
  deterministic static mocking readiness and explicitly does not start service
  workers, open network servers, execute handlers, or run the analyzed
  project's tests.
- RED smoke generated
  `/tmp/repotutor-mocking-readiness-red-studies.K4N4Nd/2026-06-04/local__simple-ts-app__main__398ff3ee`;
  old behavior was missing `analysis/mocking-readiness-report.json`,
  `markdown/mocking-readiness.md`, and `html/mocking-readiness.html`, and
  `open --target mocking-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-mocking-readiness-green-studies.3l2NAd/2026-06-04/local__simple-ts-app__main__398ff3ee`;
  confirmed `verificationCheckedRequiredArtifacts=165`, handler files 0,
  server setups 0, protocol signals 9, lifecycle signals 10, package signals
  6, recommended commands 6, risk queue 2, manifest/learning-path entries, and
  `open --target mocking-readiness` -> `html/mocking-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 53/53 audit checks across 13 generated reports

### Upgrade 156: Data Fetching Readiness Report

- Cloned and inspected `TanStack/query` under
  `research/external-src/tanstack-query` without executing external source.
  Clone HEAD was `c4b39ff`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 49,582 stars, 3,862 forks,
  updated 2026-06-04T06:14:40Z. Compared with `vercel/swr`,
  `axios/axios`, and `sindresorhus/ky`; selected TanStack Query because it
  directly models server-state/data-fetching readiness: `QueryClient`,
  provider boundaries, query hooks, query keys/functions, mutations,
  invalidation, cache timing, retry/enabled controls, hydration, persistence,
  focus/online managers, and devtools. No source code was copied into
  RepoTutor.
- Implemented TanStack Query-style data-fetching-readiness report:
  `DataFetchingReadinessReportSchema`,
  `analysis/data-fetching-readiness-report.json`,
  `markdown/data-fetching-readiness.md`,
  `html/data-fetching-readiness.html`, client setups, query usages, cache
  signals, data-flow signals, package signals, recommended commands, risk
  queue, manifest/session-verification coverage, learning-path linkage, and
  `open --target data-fetching-readiness`.
- Source pattern: TanStack Query separates `QueryClient` creation,
  provider/root boundaries, query hooks, query keys/functions, mutation
  functions, cache invalidation and manual cache writes, `staleTime`, `gcTime`,
  retry/enabled/refetch controls, hydration/dehydration, persistence,
  focus/online managers, and devtools. RepoTutor maps that to deterministic
  static data-fetching readiness and explicitly does not fetch remote APIs,
  instantiate providers, hydrate caches, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-data-fetching-red-studies.fd8btT/2026-06-04/local__simple-ts-app__main__db6e89f5`;
  old behavior was missing `analysis/data-fetching-readiness-report.json`,
  `markdown/data-fetching-readiness.md`, and
  `html/data-fetching-readiness.html`, and
  `open --target data-fetching-readiness` exited with
  `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-data-fetching-green-studies.4dPN9V/2026-06-04/local__simple-ts-app__main__db6e89f5`;
  confirmed `verificationCheckedRequiredArtifacts=168`, client setups 0,
  query usages 0, cache signals 10, data-flow signals 10, package signals 7,
  recommended commands 6, risk queue 2, manifest/learning-path entries, and
  `open --target data-fetching-readiness` ->
  `html/data-fetching-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 54/54 audit checks across 13 generated reports

### Upgrade 157: Routing Readiness Report

- Cloned and inspected `remix-run/react-router` under
  `research/external-src/remix-run-react-router` without executing external
  source. Clone HEAD was `2c22bcb`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 56,440 stars, 10,860 forks,
  updated 2026-06-03T21:31:33Z. Compared with `TanStack/router`,
  `vercel/next.js`, and `vuejs/router`; selected React Router because it
  directly models route/navigation readiness: declarative, data, and framework
  modes; `BrowserRouter`, `createBrowserRouter`, `RouterProvider`, `routes.ts`,
  `route`, `index`, `Link`, `NavLink`, `Outlet`, `loader`, `action`,
  `ErrorBoundary`, `useNavigate`, `useParams`, and `useSearchParams`. No
  source code was copied into RepoTutor.
- Implemented React Router-style routing-readiness report:
  `RoutingReadinessReportSchema`,
  `analysis/routing-readiness-report.json`,
  `markdown/routing-readiness.md`, `html/routing-readiness.html`, routing
  setups, route definitions, navigation signals, data-route signals, file-route
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target routing-readiness`.
- Source pattern: React Router separates router mode setup, route definitions,
  nested `Outlet` layout, dynamic params, visible navigation, data loaders and
  actions, client loaders/actions, route error boundaries, redirects, and
  file-route conventions. RepoTutor maps that to deterministic static routing
  readiness and explicitly does not execute loaders, actions, navigation
  transitions, dev servers, or browser route flows.
- RED smoke generated
  `/tmp/repotutor-routing-readiness-red-studies.DvaPVY/2026-06-04/local__simple-ts-app__main__55dd6154`;
  old behavior was missing `analysis/routing-readiness-report.json`,
  `markdown/routing-readiness.md`, and `html/routing-readiness.html`, and
  `open --target routing-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-routing-readiness-green-studies.g5BKxB/2026-06-04/local__simple-ts-app__main__55dd6154`;
  confirmed `verificationCheckedRequiredArtifacts=171`, routing setups 0,
  route definitions 0, navigation signals 10, data-route signals 11,
  file-route signals 9, package signals 7, recommended commands 6, risk queue
  2, manifest/learning-path entries, and `open --target routing-readiness` ->
  `html/routing-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 55/55 audit checks across 13 generated reports

### Upgrade 158: State Management Readiness Report

- Cloned and inspected `reduxjs/redux-toolkit` under
  `research/external-src/reduxjs-redux-toolkit` without executing external
  source. Clone HEAD was `7c49510`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 11,216 stars, 1,266 forks,
  updated 2026-06-02T21:26:33Z. Compared with `pmndrs/zustand`,
  `pmndrs/jotai`, and `mobxjs/mobx`; selected Redux Toolkit because it
  directly models client state-management readiness: `configureStore`,
  `createSlice`, reducers, actions, selectors, `Provider`, `useSelector`,
  `useDispatch`, `createAsyncThunk`, `createListenerMiddleware`,
  `createEntityAdapter`, middleware/devTools, and optional RTK Query. No
  source code was copied into RepoTutor.
- Implemented Redux Toolkit-style state-management-readiness report:
  `StateManagementReadinessReportSchema`,
  `analysis/state-management-readiness-report.json`,
  `markdown/state-management-readiness.md`,
  `html/state-management-readiness.html`, store setups, slice definitions,
  selector signals, side-effect signals, entity signals, middleware signals,
  RTK Query signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target state-management-readiness`.
- Source pattern: Redux Toolkit separates store setup through
  `configureStore`, generated slice reducers/actions through `createSlice`,
  typed React-Redux hooks, selectors, async request lifecycles through
  `createAsyncThunk`, listener middleware, normalized entity adapters,
  middleware/devTools configuration, and optional RTK Query API-slice cache
  wiring. RepoTutor maps that to deterministic static state-management
  readiness and explicitly does not instantiate stores, dispatch actions,
  mount providers, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-state-management-red-studies.4nPyHI/2026-06-04/local__simple-ts-app__main__e6abe9b6`;
  old behavior was missing
  `analysis/state-management-readiness-report.json`,
  `markdown/state-management-readiness.md`, and
  `html/state-management-readiness.html`, and
  `open --target state-management-readiness` exited with
  `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-state-management-green-studies.Kt67k1/2026-06-04/local__simple-ts-app__main__e6abe9b6`;
  confirmed `verificationCheckedRequiredArtifacts=174`, store setups 0,
  slice definitions 0, selector signals 6, side-effect signals 8, entity
  signals 6, middleware signals 8, RTK Query signals 8, package signals 7,
  recommended commands 6, risk queue 2, manifest/learning-path entries, and
  `open --target state-management-readiness` ->
  `html/state-management-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 56/56 audit checks across 13 generated reports

### Upgrade 159: Form Readiness Report

- Cloned and inspected `react-hook-form/react-hook-form` under
  `research/external-src/react-hook-form-react-hook-form` without executing
  external source. Clone HEAD was `6a501e0`; the clone remains ignored by
  RepoTutor.
- GitHub metadata: public repo, MIT license, 44,754 stars, 2,408 forks,
  updated 2026-06-04T06:47:19Z. Compared with `jaredpalmer/formik`,
  `TanStack/form`, and `colinhacks/zod`; selected React Hook Form because it
  directly models form readiness: `useForm`, `register`, `handleSubmit`,
  `Controller`, `FormProvider`, `useFormContext`, `useFieldArray`, validation
  rules, schema resolvers, `formState.errors`, default values, value helpers,
  and package signals. No source code was copied into RepoTutor.
- Implemented React Hook Form-style form-readiness report:
  `FormReadinessReportSchema`, `analysis/form-readiness-report.json`,
  `markdown/form-readiness.md`, `html/form-readiness.html`, form setups, field
  registrations, validation signals, error signals, value-flow signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, and `open --target form-readiness`.
- Source pattern: React Hook Form separates `useForm` setup, field
  registration, submit handling through `handleSubmit`, controlled inputs
  through `Controller`/`useController`, context sharing through `FormProvider`
  and `useFormContext`, dynamic fields through `useFieldArray`, validation
  rules and resolvers, visible error state, default values, reset/watch/value
  helpers, and package-level resolver/schema choices. RepoTutor maps that to
  deterministic static form readiness and explicitly does not mount forms,
  submit values, execute schema validators, or run the analyzed project's
  tests.
- RED smoke generated
  `/tmp/repotutor-form-readiness-red-studies.t4Op5n/2026-06-04/local__simple-ts-app__main__e86e1089`;
  old behavior was missing `analysis/form-readiness-report.json`,
  `markdown/form-readiness.md`, and `html/form-readiness.html`, and
  `open --target form-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-form-readiness-green-studies.v0vTVE/2026-06-04/local__simple-ts-app__main__e86e1089`;
  confirmed `verificationCheckedRequiredArtifacts=177`, form setups 0, field
  registrations 0, validation signals 11, error signals 9, value-flow signals
  10, package signals 7, recommended commands 6, risk queue 2,
  manifest/learning-path entries, and `open --target form-readiness` ->
  `html/form-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 57/57 audit checks across 13 generated reports

### Upgrade 160: Auth Readiness Report

- Cloned and inspected `nextauthjs/next-auth` under
  `research/external-src/nextauthjs-next-auth` without executing external
  source. Clone HEAD was `dab3cfb`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, ISC license, 28,268 stars, 4,039 forks,
  updated 2026-06-04T05:12:37Z. Compared with `better-auth/better-auth`,
  `clerk/javascript`, and `auth0/nextjs-auth0`; selected Auth.js/NextAuth
  because it directly models authentication readiness: `NextAuth`, `auth`,
  `handlers`, providers, callbacks, sessions, JWT/database strategy,
  middleware, protected routes, env secrets, adapters, `signIn`, `signOut`,
  `useSession`, and `SessionProvider`. No source code was copied into
  RepoTutor.
- Implemented Auth.js-style auth-readiness report:
  `AuthReadinessReportSchema`, `analysis/auth-readiness-report.json`,
  `markdown/auth-readiness.md`, `html/auth-readiness.html`, auth setups,
  session surfaces, protection signals, provider signals, callback signals,
  credential signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target auth-readiness`.
- Source pattern: Auth.js separates request handlers and auth helpers,
  sign-in providers, adapters, session strategy, callback/event logic, client
  and server session consumers, middleware/protected-route gates, redirects,
  role checks, cookies/CSRF hints, and deployment secret variables. RepoTutor
  maps that to deterministic static auth readiness and explicitly does not
  start auth servers, call providers, mint tokens, submit credentials, or run
  the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-auth-readiness-red-studies.2vFU8G/2026-06-04/local__simple-ts-app__main__9e34bd67`;
  old behavior was missing `analysis/auth-readiness-report.json`,
  `markdown/auth-readiness.md`, and `html/auth-readiness.html`, and
  `open --target auth-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-auth-readiness-green-studies.GUbWzS/2026-06-04/local__simple-ts-app__main__9e34bd67`;
  confirmed `verificationCheckedRequiredArtifacts=180`, auth setups 0,
  session surfaces 0, protection signals 7, provider signals 7, callback
  signals 8, credential signals 8, package signals 6, recommended commands 6,
  risk queue 2, manifest/learning-path entries, and
  `open --target auth-readiness` -> `html/auth-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 58/58 audit checks across 13 generated reports

### Upgrade 161: Payment Readiness Report

- Cloned and inspected `stripe/stripe-node` under
  `research/external-src/stripe-stripe-node` without executing external
  source. Clone HEAD was `23f097e`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 4,430 stars, 908 forks, updated
  2026-06-03T11:34:15Z. Compared with `stripe/stripe-js`,
  `stripe/react-stripe-js`, and
  `stripe-samples/checkout-single-subscription`; selected Stripe Node because
  it directly models server-side payment readiness: `new Stripe`, Checkout
  Sessions, PaymentIntents, subscriptions, customers, invoices, billing
  portal, webhooks, `constructEvent`, raw body/signature verification,
  idempotency, `apiVersion`, secret/env configuration, price/product IDs,
  currency, and quantity assumptions. No source code was copied into
  RepoTutor.
- Implemented Stripe-style payment-readiness report:
  `PaymentReadinessReportSchema`, `analysis/payment-readiness-report.json`,
  `markdown/payment-readiness.md`, `html/payment-readiness.html`, payment
  setups, checkout signals, webhook signals, customer/billing signals,
  credential signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target payment-readiness`.
- Source pattern: Stripe Node separates server-side client setup through
  `new Stripe`, secret-key and `apiVersion` configuration, Checkout Session
  and PaymentIntent creation, subscription/customer/invoice/billing portal
  lifecycle surfaces, raw-body webhook signature verification through
  `constructEvent`, event-type dispatch, idempotency or duplicate-event
  handling, and price/product/currency/quantity assumptions. RepoTutor maps
  that to deterministic static payment readiness and explicitly does not call
  payment APIs, create checkout sessions, charge cards, verify live webhooks,
  or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-payment-readiness-red-studies.D5t0yw/2026-06-04/local__simple-ts-app__main__5e1943ff`;
  old behavior was missing `analysis/payment-readiness-report.json`,
  `markdown/payment-readiness.md`, and `html/payment-readiness.html`, and
  `open --target payment-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-payment-readiness-green-studies.esOBKP/2026-06-04/local__simple-ts-app__main__5e1943ff`;
  confirmed `verificationCheckedRequiredArtifacts=183`, payment setups 0,
  checkout signals 8, webhook signals 8, customer signals 8, credential
  signals 7, package signals 6, risk queue 2, manifest/learning-path entries,
  and `open --target payment-readiness` ->
  `html/payment-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 59/59 audit checks across 13 generated reports

### Upgrade 162: Email Readiness Report

- Cloned and inspected `resend/resend-node` under
  `research/external-src/resend-resend-node` without executing external
  source. Clone HEAD was `965ed8e`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 913 stars, 81 forks, updated
  2026-06-03T05:02:14Z. Compared with `nodemailer/nodemailer`,
  `sendgrid/sendgrid-nodejs`, and `mailgun/mailgun.js`; selected Resend Node
  because it directly models transactional email readiness: `new Resend`,
  `RESEND_API_KEY`, `emails.send`, `batch.send`, `domains.verify`,
  `webhooks.verify`, `standardwebhooks`, sender/recipient payload fields,
  HTML/React templates, attachments, idempotency, contacts, broadcasts, and
  delivery events. No source code was copied into RepoTutor.
- Implemented Resend-style email-readiness report:
  `EmailReadinessReportSchema`, `analysis/email-readiness-report.json`,
  `markdown/email-readiness.md`, `html/email-readiness.html`, email setups,
  recipient/content signals, delivery signals, template signals, credential
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target email-readiness`.
- Source pattern: Resend separates provider client setup through `new Resend`
  and `RESEND_API_KEY`, email payloads through `from`, `to`, `replyTo`,
  `subject`, `text`, `html`, `react`, and attachments, batch sends with
  validation headers, sender-domain verification through domain APIs,
  webhook signature verification through `standardwebhooks`, and delivery
  event handling for bounces, complaints, delivery, opens, clicks, and
  unsubscribe/preferences. RepoTutor maps that to deterministic static email
  readiness and explicitly does not send email, call provider APIs, verify
  live DNS, process live callbacks, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-email-readiness-red-studies.zZn54X/2026-06-04/local__simple-ts-app__main__5680bc48`;
  old behavior was missing `analysis/email-readiness-report.json`,
  `markdown/email-readiness.md`, and `html/email-readiness.html`, and
  `open --target email-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-email-readiness-green-studies.y0zWlS/2026-06-04/local__simple-ts-app__main__5680bc48`;
  confirmed `verificationCheckedRequiredArtifacts=186`, email setups 0,
  recipient signals 12, delivery signals 11, template signals 6, credential
  signals 10, package signals 7, risk queue 2, manifest/learning-path entries,
  and `open --target email-readiness` -> `html/email-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 60/60 audit checks across 13 generated reports

### Upgrade 163: Queue Readiness Report

- Cloned and inspected `taskforcesh/bullmq` under
  `research/external-src/taskforcesh-bullmq` without executing external source.
  Clone HEAD was `3fe7cb1`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 8,964 stars, 626 forks, updated
  2026-06-04T07:43:54Z. Compared with `OptimalBits/bull`,
  `graphile/worker`, and `breejs/bree`; selected BullMQ because it directly
  models Redis-backed queue readiness: `Queue`, `Worker`, `QueueEvents`,
  `FlowProducer`, `JobScheduler`, producer calls, repeat/delay/priority/job ID
  options, retry attempts/backoff, worker events, stalled job handling, Redis
  connection setup, concurrency, rate limiting, metrics, and telemetry. No
  source code was copied into RepoTutor.
- Implemented BullMQ-style queue-readiness report:
  `QueueReadinessReportSchema`, `analysis/queue-readiness-report.json`,
  `markdown/queue-readiness.md`, `html/queue-readiness.html`, queue setups,
  producer signals, worker signals, reliability signals, connection signals,
  package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target queue-readiness`.
- Source pattern: BullMQ separates Redis-backed queue producers through
  `Queue` and `queue.add`, workers through `Worker` processors, lifecycle
  observation through `QueueEvents`, multi-job dependencies through
  `FlowProducer`, repeat or scheduled jobs through scheduler/repeat options,
  reliability through attempts/backoff, failed/completed/stalled events,
  cleanup policy, concurrency/rate limits, metrics, telemetry, and Redis
  connection configuration. RepoTutor maps that to deterministic static queue
  readiness and explicitly does not start Redis, enqueue jobs, run workers,
  process queues, retry failed jobs, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-queue-readiness-red-studies.sY3u5L/2026-06-04/local__simple-ts-app__main__794225dd`;
  old behavior was missing `analysis/queue-readiness-report.json`,
  `markdown/queue-readiness.md`, and `html/queue-readiness.html`, and
  `open --target queue-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-queue-readiness-green-studies.eOVjto/2026-06-04/local__simple-ts-app__main__794225dd`;
  confirmed `verificationCheckedRequiredArtifacts=189`, queue setups 0,
  producer signals 9, worker signals 9, reliability signals 10, connection
  signals 8, package signals 8, risk queue 2, manifest/learning-path entries,
  and `open --target queue-readiness` -> `html/queue-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 61/61 audit checks across 13 generated reports

### Upgrade 164: Cache Readiness Report

- Cloned and inspected `redis/node-redis` under
  `research/external-src/redis-node-redis` without executing external source.
  Clone HEAD was `8ce181c`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 17,534 stars, 1,957 forks,
  updated 2026-06-04T07:39:03Z. Compared with `redis/ioredis`,
  `upstash/redis-js`, and `jaredwray/keyv`; selected Node Redis because it
  directly models cache readiness: `createClient`, `.connect()`, get/set,
  TTL/EX/NX policy, key deletion, multi-key reads/writes, scan iterators,
  transactions, `watch`, client-side caching, RESP/socket/TLS/reconnect
  configuration, readiness state, Pub/Sub, pools, cluster/sentinel, and
  telemetry. No source code was copied into RepoTutor.
- Implemented Node Redis-style cache-readiness report:
  `CacheReadinessReportSchema`, `analysis/cache-readiness-report.json`,
  `markdown/cache-readiness.md`, `html/cache-readiness.html`, cache setups,
  operation signals, policy signals, connection signals, advanced signals,
  package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target cache-readiness`.
- Source pattern: Node Redis separates client setup through `createClient` or
  `createClientPool`, connection and readiness through `.connect()`,
  `isReady`, `isOpen`, `error`, and `reconnecting`, cache operations through
  `get`, `set`, `mGet`, `mSet`, `del`, `expire`, `ttl`, and `scanIterator`,
  policy through `EX`, `PX`, `NX`, invalidation, namespaces, and serialization,
  and advanced behavior through transactions, `watch`, Pub/Sub,
  client-side caching, cluster/sentinel, RESP mapping, and telemetry.
  RepoTutor maps that to deterministic static cache readiness and explicitly
  does not start Redis, open cache sockets, read or write cache keys,
  subscribe to channels, flush data, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-cache-readiness-red-studies.lHw6Bj/2026-06-04/local__simple-ts-app__main__fcae1d44`;
  old behavior was missing `analysis/cache-readiness-report.json`,
  `markdown/cache-readiness.md`, and `html/cache-readiness.html`, and
  `open --target cache-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-cache-readiness-green-studies.RoIWl1/2026-06-04/local__simple-ts-app__main__fcae1d44`;
  confirmed `verificationCheckedRequiredArtifacts=192`, cache setups 0,
  operation signals 9, policy signals 9, connection signals 9, advanced
  signals 9, package signals 7, risk queue 2, manifest/learning-path entries,
  and `open --target cache-readiness` -> `html/cache-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 62/62 audit checks across 13 generated reports

### Upgrade 165: Logging Readiness Report

- Cloned and inspected `pinojs/pino` under
  `research/external-src/pinojs-pino` without executing external source.
  Clone HEAD was `ff0dc5c`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 17,911 stars, 958 forks,
  updated 2026-06-04T03:01:27Z. Compared with `winstonjs/winston`,
  `fastify/fastify`, and `getsentry/sentry-javascript`; selected Pino because
  it directly models structured logging readiness: `pino()`, JSON log levels,
  `logger.info`, `logger.error`, child loggers, bindings, request context,
  serializers, redaction, transports, destinations, `pino-pretty`,
  multistream, timestamps, formatters, mixins, async worker-thread transports,
  and flush behavior. No source code was copied into RepoTutor.
- Implemented Pino-style logging-readiness report:
  `LoggingReadinessReportSchema`, `analysis/logging-readiness-report.json`,
  `markdown/logging-readiness.md`, `html/logging-readiness.html`, logging
  setups, level signals, context signals, safety signals, transport signals,
  package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target logging-readiness`.
- Source pattern: Pino separates logger construction through `pino()` or
  logger factories, emitted records through level calls such as `info`,
  `warn`, `error`, and `fatal`, correlation through child loggers, bindings,
  request IDs, serializers, mixins, timestamps, and formatters, safety through
  redaction paths, secret-field detection, safe stringification, and error
  serializers, and delivery through transports, destinations, multistream,
  worker-thread async logging, file output, and log processors. RepoTutor maps
  that to deterministic static logging readiness and explicitly does not
  execute logger calls, emit logs, start transports, flush worker threads,
  call log processors, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-logging-readiness-red-studies.fMi67e/2026-06-04/local__simple-ts-app__main__633408e3`;
  old behavior was missing `analysis/logging-readiness-report.json`,
  `markdown/logging-readiness.md`, and `html/logging-readiness.html`, and
  `open --target logging-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-logging-readiness-green-studies.q38b5b/2026-06-04/local__simple-ts-app__main__633408e3`;
  confirmed `verificationCheckedRequiredArtifacts=195`, logging setups 0,
  level signals 8, context signals 8, safety signals 7, transport signals 8,
  package signals 7, risk queue 2, manifest/learning-path entries, and
  `open --target logging-readiness` -> `html/logging-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 63/63 audit checks across 13 generated reports

### Upgrade 166: Feature Flag Readiness Report

- Cloned and inspected `open-feature/js-sdk` under
  `research/external-src/open-feature-js-sdk` without executing external
  source. Clone HEAD was `3854c5f`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, Apache-2.0 license, 269 stars, 63 forks,
  updated 2026-06-02T11:57:25Z. Compared with `Unleash/unleash`,
  `growthbook/growthbook`, and `launchdarkly/js-client-sdk`; selected
  OpenFeature because it directly models vendor-neutral feature flag readiness:
  `OpenFeature`, `setProviderAndWait`, `setProvider`, `getClient`,
  boolean/string/number/object evaluation calls, detailed evaluations,
  `EvaluationContext`, `targetingKey`, hooks, provider events, tracking,
  shutdown, domains, React provider/hooks, Nest context factory, and
  `MultiProvider`. No source code was copied into RepoTutor.
- Implemented OpenFeature-style feature-flag-readiness report:
  `FeatureFlagReadinessReportSchema`,
  `analysis/feature-flag-readiness-report.json`,
  `markdown/feature-flag-readiness.md`,
  `html/feature-flag-readiness.html`, feature-flag setups, evaluation signals,
  context signals, lifecycle signals, package signals, recommended commands,
  risk queue, manifest/session-verification coverage, learning-path linkage,
  and `open --target feature-flag-readiness`.
- Source pattern: OpenFeature separates provider setup through
  `setProviderAndWait`, `setProvider`, domains, and `MultiProvider`, client
  access through `getClient` and React/Nest integrations, flag resolution
  through boolean/string/number/object value and details calls, targeting
  through `EvaluationContext`, `targetingKey`, user/request/transaction
  context, lifecycle through hooks, READY/ERROR events, tracking, shutdown,
  and package evidence across OpenFeature, LaunchDarkly, Unleash, GrowthBook,
  and Flagsmith. RepoTutor maps that to deterministic static feature-flag
  readiness and explicitly does not initialize providers, fetch remote flags,
  evaluate live targeting rules, emit tracking events, close providers, or run
  the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-feature-flag-readiness-red-studies.vGPC88/2026-06-04/local__simple-ts-app__main__0de5b192`;
  old behavior was missing `analysis/feature-flag-readiness-report.json`,
  `markdown/feature-flag-readiness.md`, and
  `html/feature-flag-readiness.html`, and `open --target
  feature-flag-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-feature-flag-readiness-green-studies.w2DAtE/2026-06-04/local__simple-ts-app__main__0de5b192`;
  confirmed `verificationCheckedRequiredArtifacts=198`, feature flag setups
  0, evaluation signals 8, context signals 8, lifecycle signals 8, package
  signals 8, risk queue 2, manifest/learning-path entries, and `open --target
  feature-flag-readiness` -> `html/feature-flag-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 64/64 audit checks across 13 generated reports

### Upgrade 167: Rate Limit Readiness Report

- Cloned and inspected `animir/node-rate-limiter-flexible` under
  `research/external-src/animir-node-rate-limiter-flexible` without executing
  external source. Clone HEAD was `3c9c826`; the clone remains ignored by
  RepoTutor.
- GitHub metadata: public repo, ISC license, 3,552 stars, 189 forks, updated
  2026-06-03T21:18:56Z. Compared with
  `express-rate-limit/express-rate-limit`, `fastify/fastify-rate-limit`, and
  `upstash/ratelimit-js`; selected `rate-limiter-flexible` because it models
  generic and store-backed limiter readiness: `RateLimiterMemory`,
  `RateLimiterRedis`, `points`, `duration`, `blockDuration`, `keyPrefix`,
  `storeClient`, `consume`, `penalty`, `reward`, `insuranceLimiter`,
  `msBeforeNext`, `remainingPoints`, `Retry-After`, `X-RateLimit-*`, in-memory
  block, queue wrappers, and Redis/Valkey/Mongo/Postgres/MySQL/SQLite/Prisma/
  Memcached/DynamoDB stores. No source code was copied into RepoTutor.
- Implemented rate-limiter-flexible-style rate-limit-readiness report:
  `RateLimitReadinessReportSchema`,
  `analysis/rate-limit-readiness-report.json`,
  `markdown/rate-limit-readiness.md`,
  `html/rate-limit-readiness.html`, rate-limit setups, quota signals, identity
  signals, store signals, response signals, resilience signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, and `open --target rate-limit-readiness`.
- Source pattern: rate-limiter-flexible separates limiter construction through
  memory, Redis, cluster, union, bursty, and queue limiters; quota through
  `points`, `duration`, `blockDuration`, `execEvenly`, in-memory blocks, and
  queueing; identity through IP, user, token, route, `keyPrefix`, and `getKey`;
  response behavior through `msBeforeNext`, `remainingPoints`,
  `consumedPoints`, `Retry-After`, `X-RateLimit-*`, and 429 responses; and
  resilience through store clients, not-ready rejection, atomic increments,
  `insuranceLimiter`, `penalty`, `reward`, `delete`, and `block`. RepoTutor
  maps that to deterministic static rate-limit readiness and explicitly does
  not initialize limiters, consume points, mutate stores, sleep for windows,
  emit responses, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-rate-limit-readiness-red-studies.eBKq0F/2026-06-04/local__simple-ts-app__main__9732f9ec`;
  old behavior was missing `analysis/rate-limit-readiness-report.json`,
  `markdown/rate-limit-readiness.md`, and
  `html/rate-limit-readiness.html`, and `open --target
  rate-limit-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-rate-limit-readiness-green-studies.ShKmIf/2026-06-04/local__simple-ts-app__main__9732f9ec`;
  confirmed `verificationCheckedRequiredArtifacts=201`, rate-limit setups 0,
  quota signals 8, identity signals 8, store signals 10, response signals 8,
  resilience signals 8, package signals 6, risk queue 2,
  manifest/learning-path entries, and `open --target rate-limit-readiness` ->
  `html/rate-limit-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 65/65 audit checks across 13 generated reports

### Upgrade 168: Error Tracking Readiness Report

- Cloned and inspected `getsentry/sentry-javascript` under
  `research/external-src/getsentry-sentry-javascript` without executing
  external source. Clone HEAD was `983fbac`; the clone remains ignored by
  RepoTutor.
- GitHub metadata: public repo, MIT license, 8,662 stars, 1,777 forks, updated
  2026-06-03T19:49:45Z. Compared with
  `open-telemetry/opentelemetry-js`, `rollbar/rollbar.js`, and
  `bugsnag/bugsnag-js`; selected Sentry JavaScript because it directly models
  error-tracking readiness: `Sentry.init`, DSN setup, early instrumentation,
  `captureException`, `captureMessage`, `captureEvent`, `ErrorBoundary`,
  `reactErrorHandler`, breadcrumbs, `withScope`, `setUser`, `setContext`,
  `setTag`, `beforeSend`, `beforeBreadcrumb`, `ignoreErrors`, URL filters,
  `sendDefaultPii`, `tracesSampleRate`, `tracePropagationTargets`, replay,
  profiling, and feedback integrations. No source code was copied into
  RepoTutor.
- Implemented Sentry-style error-tracking-readiness report:
  `ErrorTrackingReadinessReportSchema`,
  `analysis/error-tracking-readiness-report.json`,
  `markdown/error-tracking-readiness.md`,
  `html/error-tracking-readiness.html`, error-tracking setups, capture
  signals, context signals, filtering signals, observability signals, package
  signals, recommended commands, risk queue, manifest/session-verification
  coverage, learning-path linkage, and `open --target
  error-tracking-readiness`.
- Source pattern: Sentry separates setup through early `Sentry.init`, DSN,
  instrument files, and framework SDK packages; event capture through
  `captureException`, `captureMessage`, `captureEvent`, Error Boundaries,
  React root error hooks, unhandled errors, and breadcrumbs; event enrichment
  through scopes, user/tags/context/extras, component stack, release, and
  environment; filtering through `beforeSend`, `beforeBreadcrumb`,
  `ignoreErrors`, URL filters, PII controls, scrubbers, and sample rates; and
  observability through tracing, propagation targets, profiling, replay, and
  feedback. RepoTutor maps that to deterministic static error-tracking
  readiness and explicitly does not initialize SDKs, send events, upload source
  maps, start tracing/replay, collect PII, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-error-tracking-readiness-red-studies.9MpSbM/2026-06-04/local__simple-ts-app__main__9e64e605`;
  old behavior was missing
  `analysis/error-tracking-readiness-report.json`,
  `markdown/error-tracking-readiness.md`, and
  `html/error-tracking-readiness.html`, and `open --target
  error-tracking-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-error-tracking-readiness-green-studies.Wzf5W4/2026-06-04/local__simple-ts-app__main__9e64e605`;
  confirmed `verificationCheckedRequiredArtifacts=204`, error-tracking setups
  0, capture signals 7, context signals 7, filtering signals 7, observability
  signals 7, package signals 7, risk queue 2, manifest/learning-path entries,
  and `open --target error-tracking-readiness` ->
  `html/error-tracking-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 66/66 audit checks across 13 generated reports

### Upgrade 169: Analytics Readiness Report

- Cloned and inspected `PostHog/posthog-js` under
  `research/external-src/PostHog-posthog-js` without executing external source.
  Clone HEAD was `76a2d6b`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, licenseInfo key `other`, 545 stars, 263 forks,
  updated 2026-06-03T23:19:22Z. Compared with
  `segmentio/analytics-next`, `amplitude/Amplitude-TypeScript`, and
  `mixpanel/mixpanel-js`; selected PostHog JavaScript because it directly
  models product analytics readiness: `posthog.init`, `PostHogProvider`,
  `posthog.capture`, `posthog.identify`, `posthog.reset`, groups, feature flag
  hooks, flag payloads, SSR/bootstrap flags, session recording, consent,
  opt-in/opt-out controls, and `before_send` filtering. No source code was
  copied into RepoTutor.
- Implemented PostHog-style analytics-readiness report:
  `AnalyticsReadinessReportSchema`,
  `analysis/analytics-readiness-report.json`,
  `markdown/analytics-readiness.md`, `html/analytics-readiness.html`,
  analytics setups, event signals, identity signals, privacy signals, product
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target analytics-readiness`.
- Source pattern: PostHog separates setup through `posthog.init`,
  `PostHogProvider`, API host options, and package imports; event capture
  through `posthog.capture`, track/pageview/autocapture, feature interactions,
  error capture, and custom event names; identity through identify, alias,
  group, reset, distinct IDs, person properties, and group properties; privacy
  through opt-in/out checks, `before_send`, property filtering, masking, and
  session-recording disable controls; and product analytics through feature
  flags, flag payloads, bootstrap flags, session recording, heatmaps, surveys,
  and web vitals. RepoTutor maps that to deterministic static analytics
  readiness and explicitly does not initialize SDKs, send events, collect
  identities, start replay/heatmaps, mutate cookies or local storage, or run
  the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-analytics-readiness-red-studies.eLChGX/2026-06-04/local__simple-ts-app__main__f9e07776`;
  old behavior was missing `analysis/analytics-readiness-report.json`,
  `markdown/analytics-readiness.md`, and `html/analytics-readiness.html`, and
  `open --target analytics-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-analytics-readiness-green-studies.2zbfvL/2026-06-04/local__simple-ts-app__main__f9e07776`;
  confirmed `verificationCheckedRequiredArtifacts=207`, analytics setups 0,
  event signals 7, identity signals 7, privacy signals 7, product signals 7,
  package signals 8, risk queue 2, and `open --target
  analytics-readiness` -> `html/analytics-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 67/67 audit checks across 13 generated reports

### Upgrade 170: HTTP Client Readiness Report

- Cloned and inspected `sindresorhus/got` under
  `research/external-src/sindresorhus-got` without executing external source.
  Clone HEAD was `a5b76bf`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 14,910 stars, 988 forks, updated
  2026-06-03T07:51:29Z. Compared with `axios/axios`,
  `unjs/ofetch`, and `sindresorhus/ky`; selected Got because it directly
  models HTTP client readiness: request methods, instances/defaults,
  `prefixUrl`, `searchParams`, response shaping, timeout blocks, retry limits,
  retry status and method controls, `Retry-After`, hooks, metadata errors,
  agents, cache, HTTP/2, proxies, cookies, Unix sockets, and pagination. No
  source code was copied into RepoTutor.
- Implemented Got-style HTTP-client-readiness report:
  `HttpClientReadinessReportSchema`,
  `analysis/http-client-readiness-report.json`,
  `markdown/http-client-readiness.md`,
  `html/http-client-readiness.html`, HTTP client setups, request signals,
  resilience signals, configuration signals, transport signals, error signals,
  package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target http-client-readiness`.
- Source pattern: Got separates setup through `got.extend`, `prefixUrl`,
  `searchParams`, `responseType`, `resolveBodyOnly`, and package imports;
  resilience through `timeout`, retry limits, methods, status codes,
  `maxRetryAfter`, `Retry-After`, and abort signals; customization through
  hooks such as `beforeRequest`, `afterResponse`, `beforeRetry`, and
  `beforeError`; transport through agents, cache, HTTP/2, proxy, cookies, and
  Unix socket options; and failures through `HTTPError`, `RequestError`,
  `TimeoutError`, `throwHttpErrors`, validation, catch handling, and metadata.
  RepoTutor maps that to deterministic static HTTP client readiness and
  explicitly does not make outbound requests, open sockets, mutate caches or
  cookies, follow redirects, call hooks, or run the analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-http-client-readiness-red-studies.lFCvAE/2026-06-04/local__simple-ts-app__main__b9061c6d`;
  old behavior was missing
  `analysis/http-client-readiness-report.json`,
  `markdown/http-client-readiness.md`, and
  `html/http-client-readiness.html`, and `open --target
  http-client-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-http-client-readiness-green-studies.H96obf/2026-06-04/local__simple-ts-app__main__b9061c6d`;
  confirmed `verificationCheckedRequiredArtifacts=210`, HTTP client setups 0,
  request signals 7, resilience signals 7, configuration signals 7, transport
  signals 7, error signals 7, package signals 7, risk queue 2, and
  `open --target http-client-readiness` ->
  `html/http-client-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 68/68 audit checks across 13 generated reports

### Upgrade 171: Schema Validation Readiness Report

- Cloned and inspected `colinhacks/zod` under
  `research/external-src/colinhacks-zod` without executing external source.
  Clone HEAD was `bbc68f9`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 42,860 stars, 1,995 forks,
  updated 2026-06-04T08:39:38Z. Compared with `jquense/yup`,
  `ajv-validator/ajv`, and `gcanti/io-ts`; selected Zod because it directly
  models TypeScript-first schema validation readiness: schema shapes,
  parse/safeParse, async parsing, inferred input/output types, refinements,
  transforms, coercion, defaults, error issues/formatting, Standard Schema, and
  JSON Schema conversion. No source code was copied into RepoTutor.
- Implemented Zod-style schema-validation-readiness report:
  `SchemaValidationReadinessReportSchema`,
  `analysis/schema-validation-readiness-report.json`,
  `markdown/schema-validation-readiness.md`,
  `html/schema-validation-readiness.html`, schema setups, shape signals,
  parser signals, type signals, refinement signals, error signals, integration
  signals, package signals, recommended commands, risk queue,
  manifest/session-verification coverage, learning-path linkage, and
  `open --target schema-validation-readiness`.
- Source pattern: Zod separates schema shape through `z.object`, `z.array`,
  `z.union`, `z.discriminatedUnion`, enums, literals, records, optional and
  unknown-key controls; parsing through `parse`, `safeParse`, `parseAsync`,
  `safeParseAsync`, decode, validate, and assert call sites; type linkage
  through `z.infer`, `z.input`, `z.output`, Standard Schema, JSON Schema, and
  OpenAPI exports; refinement through `refine`, `superRefine`, `transform`,
  `preprocess`, `coerce`, defaults, catches, pipes, and codecs; and failure
  output through `ZodError`, issues, format, flatten, treeify, prettify, and
  custom error maps. RepoTutor maps that to deterministic static schema
  validation readiness and explicitly does not execute schemas, parsers, async
  refinements, transforms, coercions, user-supplied validation logic, or the
  analyzed project's tests.
- RED smoke generated
  `/tmp/repotutor-schema-validation-readiness-red-studies.oR7uY4/2026-06-04/local__simple-ts-app__main__ad85b95b`;
  old behavior was missing
  `analysis/schema-validation-readiness-report.json`,
  `markdown/schema-validation-readiness.md`, and
  `html/schema-validation-readiness.html`, and `open --target
  schema-validation-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-schema-validation-readiness-green-studies.BirGH0/2026-06-04/local__simple-ts-app__main__ad85b95b`;
  confirmed `verificationCheckedRequiredArtifacts=213`, schema setups 0,
  shape signals 9, parser signals 7, type signals 6, refinement signals 7,
  error signals 7, integration signals 7, package signals 8, risk queue 2, and
  `open --target schema-validation-readiness` ->
  `html/schema-validation-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 69/69 audit checks across 13 generated reports

### Upgrade 172: Datetime Readiness Report

- Cloned and inspected `moment/luxon` under
  `research/external-src/moment-luxon` without executing external source.
  Clone HEAD was `b6b9d03`; the clone remains ignored by RepoTutor.
- GitHub metadata: public repo, MIT license, 16,407 stars, 775 forks, updated
  2026-06-04T08:21:13Z. Compared with `date-fns/date-fns`,
  `iamkun/dayjs`, and `moment/moment`; selected Luxon because it directly
  models DateTime, Duration, Interval, Zone, locale, ISO parsing, formatting,
  timezone, and validity concepts. No source code was copied into RepoTutor.
- Implemented Luxon-style datetime-readiness report:
  `DateTimeReadinessReportSchema`,
  `analysis/datetime-readiness-report.json`,
  `markdown/datetime-readiness.md`, `html/datetime-readiness.html`,
  DateTime setups, construction signals, parsing signals, formatting signals,
  zone signals, duration signals, validity signals, package signals,
  recommended commands, risk queue, manifest/session-verification coverage,
  learning-path linkage, and `open --target datetime-readiness`.
- Source pattern: Luxon separates construction through `DateTime.now`,
  `DateTime.local`, `DateTime.utc`, `fromJSDate`, `fromMillis`, `fromSeconds`,
  and `fromObject`; parsing through `fromISO`, `fromFormat`, `fromRFC2822`,
  `fromHTTP`, `fromSQL`, and parse explanation; formatting through `toISO`,
  `toFormat`, `toLocaleString`, HTTP/RFC output, timestamps, and relative
  output; zones through `setZone`, `toUTC`, `toLocal`, IANA names, fixed
  offsets, default zones, `keepLocalTime`, DST, and offset fields; and
  duration/validity through `Duration`, `Interval`, `diff`, `plus`, `minus`,
  `startOf`, `endOf`, `isValid`, `invalidReason`, throw-on-invalid settings,
  and test-clock hooks. RepoTutor maps that to deterministic static datetime
  readiness and explicitly does not evaluate current time, parse dates, change
  process timezone, modify Luxon Settings, run timers, or run the analyzed
  project's tests.
- RED smoke generated
  `/tmp/repotutor-datetime-readiness-red-studies.sv2rO3/2026-06-04/local__simple-ts-app__main__19f4a707`;
  old behavior was missing `analysis/datetime-readiness-report.json`,
  `markdown/datetime-readiness.md`, and `html/datetime-readiness.html`, and
  `open --target datetime-readiness` exited with `Unsupported open target`.
- GREEN smoke generated
  `/tmp/repotutor-datetime-readiness-green-studies.h6O8Xy/2026-06-04/local__simple-ts-app__main__19f4a707`;
  confirmed `verificationCheckedRequiredArtifacts=216`, DateTime setups 0,
  construction signals 6, parsing signals 6, formatting signals 6, zone
  signals 7, duration signals 7, validity signals 6, package signals 6, risk
  queue 2, all three new artifacts, and `open --target datetime-readiness` ->
  `html/datetime-readiness.html`.
- `pnpm build`: PASS
- `pnpm test`: PASS, 4/4 tests
- `pnpm audit:brief`: PASS, 70/70 audit checks across 13 generated reports

## Deferred Candidate Backlog

1. Continue source-backed usability upgrades.
