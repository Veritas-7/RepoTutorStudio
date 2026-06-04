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

## Deferred Candidate Backlog

1. Continue source-backed usability upgrades.
