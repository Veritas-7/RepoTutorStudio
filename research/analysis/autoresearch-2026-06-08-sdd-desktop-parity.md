# AutoResearch 2026-06-08: SDD and Desktop Learning Parity

## Question

RepoTutor should not become a bundled source-code library. AI already has broad
development knowledge. The product value is to translate a supplied GitHub URL
or local source folder into a source-grounded learning path for a vibe-coding
learner: mission, architecture, folder/file roles, essential terms, operating
principles, and step-by-step prompts.

## External Signal

Official GitHub Spec Kit documentation describes Spec-Driven Development as an
AI-assisted workflow centered on specifications, with a core sequence of Spec,
Plan, Tasks, and Implement.

Source: https://github.github.com/spec-kit/

## Absorbed Into RepoTutor

- Added SDD as a learner-facing process term alongside PRD, TDD, and acceptance
  criteria.
- Changed the rebuild roadmap to include an `sdd-first` step where the learner
  asks AI to separate Spec, Plan, Tasks, and Implement before code generation.
- Updated the vibe-coding prompt pack so prompts ask for PRD/SDD artifacts,
  acceptance criteria, and TDD checks only when those terms improve the AI
  implementation request.
- Added a shared core learning target list so the desktop app can expose the
  same high-value report targets that the terminal opens with
  `repo-tutor open <session> --target ...`.
- Added desktop in-app HTML preview for the selected learning target, so a
  learner can study the generated briefing inside the app instead of only
  copying file paths from the terminal.

## Not Absorbed

- No external repository source was cloned or embedded for this slice.
- GitHub Spec Kit itself is not vendored, copied, or treated as permanent
  product knowledge.
- RepoTutor does not teach full traditional SDD ceremony. It only teaches the
  parts useful for directing AI: state the desired behavior, plan architecture
  and boundaries, split tasks, implement in small slices, and verify output.

## Cleanup Status

There is no new external source cache to delete for this slice. Future source
research should keep cloned repositories under ignored `research/external-src/`
only while analyzing them, then document the absorbed signal here and remove the
cache when the signal is implemented and verified.
