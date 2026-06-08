# RepoTutor Studio Learning Mission

RepoTutor Studio turns a GitHub repository or local source folder into an AI-native build briefing for vibe-coding learners.

The app is not a traditional programming course and it is not a language syntax tutor. Its primary job is to help a learner understand how a real project is structured, why each part exists, which architecture and runtime roles matter, which concepts and terms are needed for directing AI, and what prompts or next questions help the learner recreate similar software with AI assistance.

The learner may not personally write every line of code. That is expected. RepoTutor should help the learner become a better AI product builder: someone who can explain the target system, ask for the right implementation, review the result, and know what must be verified.

## Learner Outcome

A successful study session should help the learner:

- identify the system architecture and major component responsibilities
- understand project roles such as entrypoints, adapters, schemas, tests, workflows, deployment files, and runtime boundaries
- learn only the domain and engineering vocabulary needed to steer AI effectively, including when to use PRD, TDD, and acceptance criteria in prompts
- see why important patterns exist before asking AI to generate or modify code
- receive prompt-ready next steps for rebuilding or extending similar software
- distinguish static source evidence from actions that must be verified in the original project
- grow from "AI can write code for me" toward "I can direct, constrain, and verify AI output with architectural judgment"

## Product Guardrails

RepoTutor should analyze source code statically unless a feature explicitly says otherwise.

It should not pretend that a repository works just because a pattern was found. Reports should separate:

- detected source evidence
- likely readiness
- missing verification
- commands the learner or operator should run in the original project

The core educational value is not that the learner memorizes every programming language or learns to code in the traditional line-by-line way. The value is that the learner can inspect a project, explain its design, ask better AI prompts, evaluate AI output, and understand the principles behind the generated software.

## Report Design Standard

Every readiness report should answer these learner questions:

- What feature or system area is this?
- Which files prove that the area exists?
- Which architecture roles are present?
- Which terms are necessary for directing AI and reviewing output?
- What can I ask AI next?
- What is still unverified because RepoTutor did not execute the project?

Reports should prefer source-linked evidence, concise explanations, and safe next commands over generic advice.

## Not A Source Library

RepoTutor should not embed external repositories as permanent knowledge.

AI already has broad development knowledge. External repositories are useful because they provide fresh, source-grounded examples of how mature projects name, organize, and verify real systems. After those patterns are absorbed into detector signals, learner explanations, tests, and docs, the cloned source should be deleted and re-cloned only when a new research question needs fresh evidence.
