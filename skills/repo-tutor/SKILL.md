---
name: repo-tutor
description: Analyze GitHub repos or local projects into beginner-friendly Korean learning reports with quizzes, wrong notes, and offline HTML.
---

# RepoTutor Skill

Use this skill when the user asks to learn a repository, GitHub URL, local
project, SKILL.md folder, ZIP, or CLI-Anything target.

## What To Do

1. Identify the source URL or folder.
2. Run the shared CLI:

```bash
repo-tutor study <source> --mode standard --level beginner
```

3. Report the generated session folder and `html/index.html`.
4. For quiz requests, run:

```bash
repo-tutor quiz <session-id-or-path> --interactive
```

5. To continue an existing session, run:

```bash
repo-tutor resume <session-id-or-path>
```

## Output Rules

- Explain in Korean by default.
- Keep technical terms with English originals, for example `진입점(entry point)`.
- Never run install/build/run commands inside the analyzed repository unless the
  user explicitly approves the command and the approval is logged.
- Do not read, summarize, send, or export `.env`, token, credential, key, or
  secret-looking files.
- The skill must use the `repo-tutor` CLI, which calls `packages/core`.
- Do not implement a separate analysis path inside the skill.

## Commands

- `repo-tutor study <github-url-or-path> --mode quick|standard|deep --level beginner|junior|senior`
- `repo-tutor quiz <session-id> --interactive`
- `repo-tutor quiz <session-id> --answers answers.json`
- `repo-tutor resume <session-id>`
- `repo-tutor export <session-id> --format html`
- `repo-tutor list`
- `repo-tutor open <session-id>`
- `repo-tutor doctor`
