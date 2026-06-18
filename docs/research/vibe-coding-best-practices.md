# Vibe-Coding Best Practices Research

Date: 2026-06-09

Refreshed: 2026-06-10

This note records which external GitHub and AI-coding references were used to
shape RepoTutor Studio's vibe-coding learning flow.

The goal is not to teach traditional programming line by line. The goal is to
help a non-traditional developer understand a real source tree well enough to
direct AI: purpose, architecture, responsibilities, terms, prompts, and
verification boundaries.

## Sources Checked

- GitHub Copilot cloud agent best practices:
  https://docs.github.com/en/copilot/tutorials/cloud-agent/get-the-best-results
- GitHub Copilot prompt engineering:
  https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering
- GitHub Spec Kit:
  https://github.com/github/spec-kit
- Microsoft CodeTour:
  https://github.com/microsoft/codetour
- promptfoo:
  https://github.com/promptfoo/promptfoo
- GitHub Copilot task best practices:
  https://docs.github.com/copilot/how-tos/agents/copilot-coding-agent/best-practices-for-using-copilot-to-work-on-tasks
- Promptfoo assertions and metrics:
  https://www.promptfoo.dev/docs/configuration/expected-outputs/
- Prompting for free self-explanations in code comprehension:
  https://ceur-ws.org/Vol-3051/CSEDM_13.pdf
- Socratic Tutor for source code comprehension:
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7334736/
- Retrieval practice overview:
  https://psychology.ucsd.edu/undergraduate-program/undergraduate-resources/academic-writing-resources/effective-studying/retrieval-practice.html
- Applications of analogical transfer for programming education:
  https://terpconnect.umd.edu/~weintrop/papers/KaoEtAl_TOCE_2022.pdf
- Prompt engineering as a 21st century skill:
  https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1366434/full
- Epistemic debt and metacognitive scripts for vibe coding:
  https://arxiv.org/html/2602.20206
- Scaffolding metacognition in programming education through student-AI
  interaction analysis:
  https://arxiv.org/html/2511.04144v1
- Plan More, Debug Less: applying metacognitive theory to AI-assisted
  programming education:
  https://arxiv.org/html/2509.03171v1
- Reflective AI Programming Lab for AI-generated-code collaboration:
  https://ceur-ws.org/Vol-3879/AIxEDU2024_paper_13.pdf
- GitHub Spec Kit documentation:
  https://github.github.com/spec-kit/
- Prompts Blend Requirements and Solutions: From Intent to Implementation in
  AI-Assisted Software Development:
  https://arxiv.org/html/2603.16348v1

## Absorbed Principles

| External principle | RepoTutor absorption |
|---|---|
| Well-scoped AI tasks need problem description, acceptance criteria, and relevant files. | `vibe-coding-prompt-pack.html` asks the learner to provide purpose, relevant source evidence, expected artifact, and verification boundary before implementation. |
| Research, plan, and iterate before opening implementation work. | Prompt phases are split into orient, architect, plan, implement, verify, and review instead of one-shot "make this app" prompting. |
| Start broad, then add specific requirements. | Daily summary and prompt pack start from product goal and architecture, then narrow into files, terms, and first vertical slice. |
| Break complex tasks into smaller tasks. | Rebuild guidance and prompt sequences ask for one small feature or slice at a time, with the next check attached. |
| Indicate relevant code and keep context focused. | Reports link folder/file responsibilities, evidence pages, and context bundle items instead of dumping the whole source tree into the prompt. |
| Spec-driven development puts "what" before "how" and uses multi-step refinement. | RepoTutor teaches PRD, SDD, TDD, and acceptance criteria as AI-direction vocabulary, only when those terms help produce a clearer prompt. |
| Code walkthroughs improve onboarding. | Learning path, folder lessons, file lessons, and daily summary follow a guided-source-tour model rather than a syntax course model. |
| Prompt and agent outputs need evaluation, not trust. | Verification boundaries separate generated-session source evidence, commands that must be run in the original project, and human product decisions. |
| Learners need architecture judgment more than syntax memorization. | `architecture-principle-playbook.html` turns purpose, responsibility boundaries, core file roles, terms, and verification questions into AI-direction principles. |
| Code comprehension improves when learners explain before seeing the answer. | `source-to-build-interview.html` asks the learner to answer purpose, structure, responsibility, terminology, first slice, and verification questions before asking AI to check the answer. |
| Socratic tutoring should guide with questions rather than premature solutions. | The source-to-build interview gives AI confirmation prompts that critique the learner's answer and convert it into an implementation instruction. |
| Retrieval practice should require recall and then checking materials. | The interview cards ask for a self answer first, then link back to source-backed evidence pages for checking. |
| Transfer requires mapping what stays structurally similar and what changes for the new problem. | `similar-app-transfer-map.html` separates KEEP principles, ADAPT decisions, ASK AI questions, and VERIFY checks before implementation. |
| Prompt engineering is a problem, context, and constraint articulation skill. | Transfer cards turn source evidence into problem context, adaptation constraints, and prompt-ready verification criteria. |
| Unrestricted AI use can create epistemic debt when learners accept code without a mental model. | The transfer map adds metacognitive friction before implementation by forcing learners to say what they keep, adapt, ask, and verify. |
| AI-assisted programming benefits from explicit planning, monitoring, and evaluation prompts. | `ai-implementation-loop.html` turns AI-generated output into PLAN, OBSERVE, CHECK, REVISE, VERIFY, and NEXT prompts. |
| Learners using AI-generated code still need reflective dialogue and constraints. | The implementation loop asks for assumptions, file responsibility, source evidence, verification claims, and stop conditions instead of accepting code blindly. |
| AI coding tasks work better when the user's intent is scoped with problem, acceptance criteria, and file hints. | `learner-goal-alignment.html` compares an optional learner PRD, issue, or prompt against source-backed purpose, architecture, source evidence, acceptance criteria, and verification boundaries before implementation. |
| Spec-first AI development keeps intent and constraints ahead of code generation. | The learner goal alignment report marks missing source-grounded intent as CLARIFY, REWRITE, or BLOCK instead of allowing a broad "make this app" request to reach AI. |
| Prompts can be evaluated with explicit assertions and thresholds. | `ai-prompt-readiness-checklist.html` asks whether the prompt includes problem context, relevant source evidence, a small vertical slice, acceptance criteria, verification assertions, and failure reporting before it is sent to AI. |
| Learners need to compare prompt quality, not memorize syntax. | `ai-prompt-ab-lab.html` contrasts a vague "make this app" request with a source-grounded prompt that includes purpose, evidence, scope, acceptance criteria, verification assertions, and failure reporting. |

## Current App Coverage

RepoTutor already includes these learner-facing outputs:

- `overview.html`: project mission and first orientation
- `architecture.html`: architecture style and responsibility boundaries
- `folders.html`: folder responsibilities and AI implementation briefs
- `files.html`: key file roles, rebuild advice, and evidence
- `glossary.html`: terms a vibe coder needs to steer AI
- `rebuild.html`: prompt-ready rebuild roadmap
- `learning-journal.html`: active-recall questions, spaced review, and mentor loops
- `daily-summary.html`: source handling policy, takeaways, prompts, and next session
- `vibe-coding-prompt-pack.html`: source-grounded implementation prompts for AI-directed development
- `reference/ai-prompt-readiness-checklist.html`: prompt readiness review before
  sending an AI implementation request
- `reference/architecture-principle-playbook.html`: source-backed architecture
  principles for purpose, responsibility boundaries, core file roles, terms,
  and verification questions
- `reference/source-to-build-interview.html`: self-explanation and Socratic
  interview cards before AI implementation handoff
- `reference/similar-app-transfer-map.html`: source-to-similar-app transfer
  cards that separate reusable principles from decisions that must change
- `reference/learner-goal-alignment.html`: optional learner PRD, issue, or
  prompt import that checks source-grounded gaps before AI implementation
- Desktop learner brief input: sends the learner's rough goal, PRD, issue, or
  AI prompt into the same source-grounded goal alignment flow, keeping the app
  focused on a vibe-coding learner rather than a traditional development lesson
- `reference/ai-implementation-loop.html`: multi-turn AI implementation loop
  for reviewing AI output, asking the next question, and separating unchecked
  claims from verified progress
- `reference/ai-prompt-ab-lab.html`: A/B comparison of vague versus
  source-grounded implementation prompts
- `repo-tutor prune-source <session> --apply --confirm DELETE-SOURCE-SNAPSHOT`:
  explicit cleanup for the generated session `source/` snapshot after the
  preserved evidence bundle remains available, session verification and
  verification records pass, the learner explicitly confirms source links no
  longer need to open for the current learning goal, and the
  `DELETE-SOURCE-SNAPSHOT` confirmation token is supplied.
  `READY_REVIEW` alone is a cleanup review candidate, not final ACCEPT,
  deployment, or cleanup permission
- `repo-tutor verify-session <session>`: tombstone-aware verification so
  pruned sessions stay verifiable after explicit cleanup, while lesson links
  and retained learning artifacts still have to pass
- Desktop UI source retention panel: exposes the same cleanup readiness,
  preserved-evidence, session-verification, verification-record,
  source-link explicit-confirmation, and confirmation-token flow without making
  the learner switch to a terminal
- `verification.html`: what is proven by static analysis and what still needs runtime checks

## Not Absorbed As Permanent Source

External repositories and documents should not be embedded into RepoTutor as a
permanent source library. Once a pattern is mapped into reports, schemas,
scanner signals, docs, or tests, the original research clone is no longer
needed for normal app operation.

The retained artifact should be the learner guidance and the implementation
pattern, not a local copy of someone else's full repository.

## Remaining Improvement Candidates

- Add cross-session search over generated study reports.
- Add learner bookmarks for important terms, architecture decisions, and prompts.
- Add a UI layer for source retention controls; the CLI cleanup gate now exists.

These are product improvements, not blockers for the current mission.
