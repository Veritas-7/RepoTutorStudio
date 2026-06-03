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
- `pnpm audit:brief`: PASS, 13/13 audit reports
- `gitleaks protect --staged --no-banner --redact`: PASS before pushed commits.
- Full-dir gitleaks can flag ignored Cargo `target/` artifacts after
  `cargo check`; pushed content is guarded with staged gitleaks.

## Deferred Candidate Backlog

1. Add export usability polish.
