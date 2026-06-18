# External Source Lifecycle

RepoTutor uses external GitHub repositories as temporary research inputs for improving its static analysis and learner guidance.

Disposable external-source work copies under `research/external-src/` are cache, not product source. They are ignored by git and should not be treated as durable evidence after a research upgrade is documented.

The goal is not to build a local source-code library. The goal is to extract source-grounded patterns that help vibe-coding learners understand architecture, roles, concepts, verification boundaries, and AI prompts for recreating similar software.

## Intake Rules

- Clone external sources only under `research/external-src/`.
- Inspect external sources statically only.
- Do not install, build, test, serve, run, or connect external cloned code.
- Record the repository name, license, branch, inspected commit SHA, and date in `working.md` or a research ledger.
- Translate useful patterns into RepoTutor schemas, scanner signals, templates, tests, or learner guidance.
- Prune the disposable work copy only after the patterns are absorbed,
  documented, mapped to retained RepoTutor evidence, and linked to a retained
  verification record.
- Record what was absorbed and why no further analysis is needed for this
  research question before pruning.

## Absorption Criteria

An external source has been absorbed when:

- the relevant patterns are mapped to concrete RepoTutor artifacts
- a focused fixture proves the static detector behavior
- the complete study smoke still passes
- full gates pass before push
- `working.md` records what was inspected and what was absorbed
- a retained research or working-log entry records the verification evidence
  and why no further analysis is needed for the current question

After those criteria are met, the clone is no longer required for normal development.

## Deletion Policy

After absorption, retained-evidence verification, and a recorded
no-further-analysis decision, prune disposable external-source work copies from
`research/external-src/` to recover disk space. This cleanup target is not the
learner's source repository, not the generated study-session `source/`
snapshot, and not product source.
This external-cache policy does not grant study-session `READY_REVIEW` final
ACCEPT, deployment, or cleanup permission; generated session cleanup still
requires the preserved evidence bundle, session verification, verification
records, learner explicit confirmation that source links no longer need to
open, and the explicit `DELETE-SOURCE-SNAPSHOT` token.

Keep durable evidence in tracked text files instead:

- `working.md` for chronological upgrade notes and verification
- focused tests for expected detector behavior
- schema and scanner code for implemented signals
- product or research docs for operating policy

If a future upgrade needs the same external project again, re-clone it and record the fresh commit SHA before inspecting it.

## "No Further Analysis Needed" Meaning

"No further analysis needed" never means the ecosystem is permanently complete.

It means the current research question has been answered well enough for the present product slice, implemented into RepoTutor, and verified. Reopen research when a learner-facing gap is found, a major upstream pattern changes, or a new source category becomes relevant to the app's mission.
