# RepoTutor Studio Security Policy

RepoTutor Studio performs read-only static analysis by default.

## Prohibited Without Approval

- Installing dependencies in analyzed repositories
- Running project code from analyzed repositories
- Docker, make, shell pipelines, and unknown executable scripts
- Reading or exporting `.env`, private keys, tokens, credentials, or secret-looking files

## Allowed Automatically

- Shallow clone of a sanitized public GitHub URL
- Recursive source snapshot copy with ignore rules
- Static text reads of non-secret files below configured size limits
- Offline HTML generation from validated analysis data

## Codex Boundary

Only `packages/codex` may call the Codex SDK. CLI `--enable-codex` and the
desktop Codex SDK toggle must route through `packages/core` into
`packages/codex`; the Tauri WebView must never import or execute Codex SDK code.
All Codex prompts and structured outputs are logged under each session's
`codex/` folder, with secret-looking paths excluded. If SDK credentials or
package setup are missing, the study must keep using deterministic local static
analysis and log the SDK failure instead of blocking the learner.

RepoTutor must not ask for, store, or proxy ChatGPT account credentials. Codex
authentication belongs to the local Codex CLI or SDK environment, including
ChatGPT sign-in or a separately configured API key.
Codex authentication belongs to the local Codex CLI, not the Tauri WebView or
RepoTutor session storage.
