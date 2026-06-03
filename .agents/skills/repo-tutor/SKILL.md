---
name: repo-tutor
description: Analyze GitHub repos or local projects into beginner-friendly Korean learning reports with quizzes, wrong notes, and offline HTML.
---

# RepoTutor Skill

This is the installable mirror for Codex app, Codex CLI, and Codex IDE extension.
It must call the same `repo-tutor` CLI used by the desktop app sidecar.

```bash
repo-tutor study <source> --mode standard --level beginner
repo-tutor quiz <session-id-or-path> --interactive
repo-tutor resume <session-id-or-path>
repo-tutor export <session-id-or-path> --format html
```

Security rules:

- Default analysis is read-only static analysis.
- Do not execute arbitrary project commands without explicit user approval.
- Exclude `.env`, credentials, tokens, private keys, and secret-looking files.
- Do not send secret-looking content to Codex.
