---
name: repo-tutor
description: Analyze GitHub repos or local projects into beginner-friendly Korean learning reports with quizzes, wrong notes, and offline HTML.
---

# RepoTutor Skill

This is the installable mirror for Codex app, Codex CLI, and Codex IDE extension.
It must call the same `repo-tutor` CLI used by the desktop app sidecar.

```bash
repo-tutor study <source> --mode standard --level beginner
repo-tutor study <source> --mode standard --level beginner --enable-codex
repo-tutor quiz <session-id-or-path> --interactive
repo-tutor resume <session-id-or-path>
repo-tutor open <session-id-or-path> --target daily-summary
repo-tutor export <session-id-or-path> --format html
```

Learning mode:

- Treat the user as a vibe-coding developer, not a traditional programming
  student.
- Focus on purpose, architecture, responsibility boundaries, necessary terms,
  prompt wording, and verification boundaries.
- Use external repositories and source folders as evidence only. Do not embed
  them as permanent app knowledge; keep distilled summaries and prompts in the
  generated session.
- Use `--enable-codex` only when Codex SDK assistance is desired; it must still
  flow through the shared CLI/core/codex packages, not a separate skill path.

Security rules:

- Default analysis is read-only static analysis.
- Do not execute arbitrary project commands without explicit user approval.
- Exclude `.env`, credentials, tokens, private keys, and secret-looking files.
- Do not send secret-looking content to Codex.
