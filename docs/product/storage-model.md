# RepoTutor Storage Model

RepoTutor Studio does not use the app database as a permanent source-code
library.

The database is only a session index. The durable learning record for a study
session is the folder that contains the generated `source/` snapshot, analysis
JSON, Markdown lessons, HTML lessons, Codex prompts, and verification notes.

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

- `source/`: the generated per-session `source/` snapshot used as evidence
- `analysis/`: structured report JSON
- `markdown/`: learner-readable Markdown reports
- `html/`: offline HTML study pages
- `codex/`: required Codex SDK prompt logs, events, and fail-closed handoff output
- `MISSION.md`: the source-specific learning contract for this session
- `RESOURCES.md`: source-backed pages, recommended reads, and remaining gaps
- `NOTES.md`: learner state, teaching preferences, and guardrails
- `lessons/`: narrow self-contained lessons such as source-to-architecture
- `reference/`: reusable glossary, rebuild prompt guides, learner role contract,
  AI output review rubric, vibe-coding mastery checklist, implementation brief,
  AI implementation loop, AI prompt readiness checklist, source absorption
  ledger, and source-retention guidance
- `learning-records/`: quiz/review evidence records created only after learning evidence exists
- `session.json`: session metadata and output paths

This layout keeps the study auditable. A learner can inspect which source was
used, which reports were generated, what teaching state should carry into the
next session, and which claims still need runtime verification.

## Why Raw Source Is Not Stored As Product Knowledge

AI already has broad general development knowledge. RepoTutor should not try to
become a giant embedded source database.

For a vibe-coding learner, raw source is useful because it gives current,
concrete project-specific evidence. The product value comes from translating
that evidence into:

- project purpose
- architecture roles
- folder and file responsibilities
- necessary terms
- AI-ready prompts
- PRD, SDD, TDD, and acceptance-criteria cues when useful
- verification boundaries
- `reference/learner-role-contract.html`, which separates what a vibe-coding
  learner must understand from what AI can implement
- `reference/ai-output-review-rubric.html`, which helps the learner judge AI
  output as PASS, REVISE, or BLOCK using purpose, architecture, evidence, and
  verification criteria
- `reference/vibe-coding-mastery-checklist.html`, which checks whether the
  learner is ready to direct AI toward a similar app without memorizing
  language syntax
- `reference/architecture-principle-playbook.html`, which keeps purpose,
  responsibility boundaries, core file roles, terms, and verification questions
  as reusable architecture principles rather than syntax lessons
- `reference/source-to-build-interview.html`, which turns source understanding
  into self-explanation questions, source-backed example answers, and AI
  confirmation prompts before implementation begins
- `reference/similar-app-transfer-map.html`, which separates source principles
  to keep from product decisions to adapt before asking AI to build a similar
  app
- `reference/learner-goal-alignment.html`, which compares an optional learner
  PRD, issue, or current AI prompt against source-backed purpose,
  architecture, source evidence, acceptance criteria, and verification
  boundaries. When supplied, the input is copied separately as
  `inputs/learner-brief.md`; it is not merged into the generated session
  `source/` snapshot.
- `reference/vibe-coding-implementation-brief.html`, which compresses the first
  AI-built vertical slice, source focus, acceptance criteria, and verification
  plan into a handoff brief
- `reference/ai-implementation-loop.html`, which turns AI-generated results
  into a planning, observation, evidence check, revision, verification, and next
  prompt loop
- `reference/ai-prompt-readiness-checklist.html`, which checks whether a prompt
  has enough context, source evidence, acceptance criteria, verification
  assertions, and failure-reporting structure before it is sent to AI
- `reference/ai-prompt-ab-lab.html`, which compares a vague one-line request
  against a source-grounded implementation prompt so learners can see why the
  source is useful as evidence, not as permanent AI knowledge
- stateful teaching artifacts such as MISSION, RESOURCES, reference pages, and
  learning records
- `reference/source-absorption-ledger.html`, which states what was absorbed,
  what no longer needs repeated investigation for the current learning goal, and
  what still needs evidence
- `reference/source-retention-guide.html`, which separates preserved learning
  artifacts from generated session `source/` snapshot cleanup-review decisions

Storing every external repository as permanent app knowledge would make the
system heavier, less transparent, harder to clean, and riskier for privacy and
license boundaries. RepoTutor should keep the interpreted learning artifacts,
not turn external code into a hidden knowledge base.

## Cleanup Policy

Generated session `source/` snapshots copied from user-provided source are part
of that session's evidence and should not be deleted automatically without a
retention feature or explicit user action. The user's original repository or
local source folder is not the cleanup target.

Run `repo-tutor prune-source <session> --format json|markdown` before cleanup.
By default this is a dry-run: it writes `analysis/source-prune-plan.json` and
`markdown/source-prune-plan.md`, checks that the absorption ledger, learner role
contract, architecture principle playbook, source-to-build interview,
similar-app transfer map, learner goal alignment, AI implementation loop, AI
output review rubric, mastery checklist, implementation brief, prompt readiness
checklist, retention guide, daily summary, prompt pack, verification reports,
and verification records are still present, and reports the generated session
`source/` snapshot size and blockers.
The dry-run JSON also includes `sourceKnowledgePolicy` and
`learnerCleanupDecision`, so automation can tell that `source/` is temporary
project evidence and can read the apply/hold conditions without parsing
Markdown.
Actual cleanup requires the explicit destructive command
`repo-tutor prune-source <session> --apply --confirm DELETE-SOURCE-SNAPSHOT`
after the preserved evidence bundle remains available, session verification and
verification records pass, and the learner explicitly confirms source links no
longer need to open for the current learning goal.
The `DELETE-SOURCE-SNAPSHOT` confirmation token records the learner's final
explicit confirmation that source links no longer need to open.
`READY_REVIEW` alone is a cleanup review candidate, not final ACCEPT,
deployment, or cleanup permission.
It deletes only the generated session `source/` snapshot and writes
`analysis/source-prune-applied.json` plus `SOURCE-PRUNED.md`; both applied records keep the same `sourceKnowledgePolicy` and `learnerCleanupDecision`
context so the learner can prove why source cleanup was allowed after the
generated session `source/` folder is gone.
Session verification is tombstone-aware: when both files are present, source
evidence links are treated as intentionally pruned generated session `source/`
snapshots while the generated lessons, reference pages, HTML export, and lesson
anchors still have to pass normal verification. This keeps pruned sessions
verifiable without pretending the generated source copy is still available.
The Desktop UI uses the same prune plan and apply commands as the CLI through
desktop retention controls, so the app surface shows whether cleanup is ready,
blocked, or already pruned and still requires preserved evidence, session
verification, verification records, learner explicit confirmation that source
links no longer need to open, and the explicit token before any destructive
action is attempted.
Desktop learner brief text is stored as `inputs/learner-brief.md` with the
source marker `inline:learner-brief` and is used only for source-grounded goal
alignment. It is learner intent, not imported source code, and its purpose is to
teach a vibe-coding learner how to brief, steer, and review AI rather than turn
the app into a traditional development lesson.

Disposable external-source work copies under `research/external-src/` are
different. They are temporary inputs used to improve RepoTutor itself. After
their patterns are absorbed into schemas, scanner signals, docs, fixtures, or
tests, the work copy can be pruned and re-cloned later if a new research
question needs fresh evidence.

## Sensible Future DB Improvements

The next useful database upgrades should index generated learning artifacts,
not raw source:

- full-text search over generated reports
- tags, bookmarks, and review status across sessions
- a spaced-review queue for terms and architecture concepts
- optional vector search over summaries and prompt packs, with links back to
  source evidence
- retention controls for old generated session `source/` snapshots

Those upgrades would make the learner's own study history searchable while
preserving the product principle: source is evidence; the durable product
knowledge is the interpreted learning guide.
