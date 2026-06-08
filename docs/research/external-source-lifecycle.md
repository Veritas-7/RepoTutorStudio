# External Source Lifecycle

RepoTutor uses external GitHub repositories as temporary research inputs for improving its static analysis and learner guidance.

External repositories cloned under `research/external-src/` are cache, not product source. They are ignored by git and should not be treated as durable evidence after a research upgrade is documented.

The goal is not to build a local source-code library. The goal is to extract source-grounded patterns that help vibe-coding learners understand architecture, roles, concepts, verification boundaries, and AI prompts for recreating similar software.

## Intake Rules

- Clone external sources only under `research/external-src/`.
- Inspect external sources statically only.
- Do not install, build, test, serve, run, or connect external cloned code.
- Record the repository name, license, branch, inspected commit SHA, and date in `working.md` or a research ledger.
- Translate useful patterns into RepoTutor schemas, scanner signals, templates, tests, or learner guidance.
- Delete the clone after the patterns are absorbed and documented.

## Absorption Criteria

An external source has been absorbed when:

- the relevant patterns are mapped to concrete RepoTutor artifacts
- a focused fixture proves the static detector behavior
- the complete study smoke still passes
- full gates pass before push
- `working.md` records what was inspected and what was absorbed

After those criteria are met, the clone is no longer required for normal development.

## Deletion Policy

After absorption, delete local clones from `research/external-src/` to recover disk space.

Keep durable evidence in tracked text files instead:

- `working.md` for chronological upgrade notes and verification
- focused tests for expected detector behavior
- schema and scanner code for implemented signals
- product or research docs for operating policy

If a future upgrade needs the same external project again, re-clone it and record the fresh commit SHA before inspecting it.

## "No Further Analysis Needed" Meaning

"No further analysis needed" never means the ecosystem is permanently complete.

It means the current research question has been answered well enough for the present product slice, implemented into RepoTutor, and verified. Reopen research when a learner-facing gap is found, a major upstream pattern changes, or a new source category becomes relevant to the app's mission.
