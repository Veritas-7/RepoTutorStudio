# RepoTutor Storage Model

RepoTutor Studio does not use the app database as a permanent source-code
library.

The database is only a session index. The durable learning record for a study
session is the folder that contains the source snapshot, analysis JSON,
Markdown lessons, HTML lessons, Codex prompts, and verification notes.

## What The Database Stores

`studies/index.sqlite` stores lightweight session metadata:

- session id
- repository owner and name
- branch and commit hash
- created time
- study mode and learner level
- latest quiz score and wrong-count summary
- path to the session folder

If the local Node runtime cannot use SQLite, RepoTutor writes the same index to
`studies/index.json`.

This index is useful for listing past sessions, opening a report quickly, and
showing learning progress. It is not the authoritative copy of the learning
content.

## What The Session Folder Stores

Each session is written under:

```text
studies/YYYY-MM-DD/<source-id>/
```

The session folder contains:

- `source/`: the per-session source snapshot used as evidence
- `analysis/`: structured report JSON
- `markdown/`: learner-readable Markdown reports
- `html/`: offline HTML study pages
- `codex/`: required Codex SDK prompt logs, events, and fail-closed handoff output
- `MISSION.md`: the source-specific learning contract for this session
- `RESOURCES.md`: source-backed pages, recommended reads, and remaining gaps
- `NOTES.md`: learner state, teaching preferences, and guardrails
- `lessons/`: narrow self-contained lessons such as source-to-architecture
- `reference/`: reusable glossary and rebuild cheat sheets
- `learning-records/`: quiz/review evidence records created only after learning evidence exists
- `session.json`: session metadata and output paths

This layout keeps the study auditable. A learner can inspect which source was
used, which reports were generated, what teaching state should carry into the
next session, and which claims still need runtime verification.

## Why Raw Source Is Not Stored As Product Knowledge

AI already has broad general development knowledge. RepoTutor should not try to
become a giant embedded source database.

For a vibe-coding learner, raw source is useful because it gives current,
concrete evidence. The product value comes from translating that evidence into:

- project purpose
- architecture roles
- folder and file responsibilities
- necessary terms
- AI-ready prompts
- PRD, SDD, TDD, and acceptance-criteria cues when useful
- verification boundaries
- stateful teaching artifacts such as MISSION, RESOURCES, reference pages, and
  learning records

Storing every external repository as permanent app knowledge would make the
system heavier, less transparent, harder to clean, and riskier for privacy and
license boundaries. RepoTutor should keep the interpreted learning artifacts,
not turn external code into a hidden knowledge base.

## Cleanup Policy

User-provided source snapshots inside a study session are part of that session's
evidence and should not be deleted automatically without a retention feature or
explicit user action.

Temporary research clones under `research/external-src/` are different. They
are disposable inputs used to improve RepoTutor itself. After their patterns are
absorbed into schemas, scanner signals, docs, fixtures, or tests, the clone can
be deleted and re-cloned later if a new research question needs fresh evidence.

## Sensible Future DB Improvements

The next useful database upgrades should index generated learning artifacts,
not raw source:

- full-text search over generated reports
- tags, bookmarks, and review status across sessions
- a spaced-review queue for terms and architecture concepts
- optional vector search over summaries and prompt packs, with links back to
  source evidence
- retention controls for old session source snapshots

Those upgrades would make the learner's own study history searchable while
preserving the product principle: source is evidence; the durable product
knowledge is the interpreted learning guide.
