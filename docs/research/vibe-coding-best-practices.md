# Vibe-Coding Best Practices Research

Date: 2026-06-09

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
| Prompt and agent outputs need evaluation, not trust. | Verification boundaries separate static source evidence, commands that must be run in the original project, and human product decisions. |

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
- `vibe-coding-prompt-pack.html`: copy/paste prompts for AI-directed development
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
- Add a prompt-evaluation checklist inspired by promptfoo, focused on whether a
  generated prompt has enough context, acceptance criteria, source links, and
  verification steps.
- Add optional retention controls so a learner can delete old source snapshots
  while keeping the generated lessons.
- Add import support for an existing issue, PRD, or prompt file so RepoTutor can
  compare the learner's current AI instruction against the source-derived guide.

These are product improvements, not blockers for the current mission.
