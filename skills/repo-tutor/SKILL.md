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

3. Report the generated session folder, `html/index.html`, and
   `html/daily-summary.html`.
4. For quiz requests, run:

```bash
repo-tutor quiz <session-id-or-path> --interactive
```

5. To continue an existing session, run:

```bash
repo-tutor resume <session-id-or-path>
```

6. When the user wants the daily recap or final learning note, open:

```bash
repo-tutor open <session-id-or-path> --target daily-summary
```

## Output Rules

- Explain in Korean by default.
- Treat the learner as a vibe-coding developer, not a traditional programming
  student. Focus on purpose, architecture, responsibility boundaries, necessary
  terms, prompt wording, and verification boundaries.
- Keep technical terms with English originals only when the term improves AI
  prompting, for example `검증 경계(verification boundary)`.
- Do not embed external repositories or reference sources as permanent app
  knowledge. Use sources as evidence, then leave distilled summaries,
  prompt-ready guidance, and verification links in the generated session.
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
- `repo-tutor open <session-id> --target daily-summary`
- `repo-tutor export <session-id> --format html`
- `repo-tutor list`
- `repo-tutor open <session-id>`
- `repo-tutor doctor`
