# RepoTutor Studio Security Policy

RepoTutor Studio attempts Codex SDK-assisted study by default and keeps
read-only static analysis as the fail-closed local evidence path.

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

## Publication Security Gates

Public GitHub publication must use a sanitized source-only export, not the
private working tree or its full git history. Run `pnpm verify:public-sanitized`
and `pnpm verify:public-git-history` before any public push; they exclude
private working notes, generated studies, generated audits, external-source
work copies, and secret-looking files before running `gitleaks`, then create a
temporary sanitized git repository and run `gitleaks detect` on that publishable
history.

The current working tree gate is `pnpm verify:security-current-tree`. It scans
the repository with `.gitleaks.toml` while excluding generated dependency,
build, release, and study artifacts such as `node_modules/`, `dist/`,
`target/`, `apps/desktop-tauri/sidecar-dist/`, `docs/audits/generated/`, and
`studies/`.

The private history boundary gate is `pnpm verify:private-history-boundary`.
It is allowed to report preserved private `working.md` history leaks for NAS or
private backup workflows, but any leak outside that explicit private boundary
must fail. A raw `gitleaks detect --source .` pass is not a public-release
requirement for this private working tree; public release safety is proven by
the sanitized source-only export gate.

## Codex Boundary

Only `packages/codex` may call the Codex SDK. CLI study runs and the desktop
study flow enable Codex SDK by default and must route through `packages/core`
into `packages/codex`; the Tauri WebView must never import or execute Codex SDK
code. `--no-codex` is an explicit offline-verification escape hatch, not the
normal product path.
All Codex prompts and structured outputs are logged under each session's
`codex/` folder, with secret-looking paths excluded. If SDK credentials or
package setup are missing, the study must keep using deterministic local static
analysis and log the SDK failure instead of blocking the learner.

RepoTutor must not ask for, store, or proxy ChatGPT account credentials. Codex
authentication belongs to the local Codex CLI or SDK environment, including
ChatGPT sign-in for subscription access or a separately configured API key for
usage-based access. Codex authentication belongs to the local Codex CLI, not the
Tauri WebView or RepoTutor session storage.
