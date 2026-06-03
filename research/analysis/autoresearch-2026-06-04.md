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

Implemented a CodeBoarding-inspired learning coverage report:

- `packages/shared/src/schemas.ts`: added `CoverageReportSchema`.
- `packages/core/src/scanner.ts`: added coverage calculation based on scanned
  files, covered file lessons, high-priority folders, and uncovered candidates.
- `packages/core/src/pipeline.ts`: writes `analysis/coverage-report.json`.
- `packages/core/src/markdown.ts`: writes `markdown/coverage.md`.
- `packages/html/src/templates.ts`: writes `html/coverage.html` and links it
  from the report navigation and index summary.

Local verification:

- `pnpm build`: PASS
- `pnpm test`: PASS
- Fixture study generated:
  `studies/2026-06-04/local__simple-ts-app__main__e47698ac/analysis/coverage-report.json`
- `pnpm audit:brief`: PASS, 13/13 audit reports

## Deferred Candidate Backlog

1. Add incremental re-analysis using file hashes and coverage deltas.
2. Add a more interactive offline quiz board inspired by `google/html-quiz`,
   while preserving 4-choice RepoTutor quiz schema and attempt history.
3. Add a source-backed component graph page that links folders, files, glossary
   terms, and rebuild roadmap steps.
