#!/usr/bin/env bash
set -euo pipefail

if command -v repo-tutor >/dev/null 2>&1; then
  exec repo-tutor study "$@"
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
search_dir="${REPOTUTOR_REPO_ROOT:-$script_dir}"
repo_root=""
while [[ "$search_dir" != "/" ]]; do
  if [[ -f "$search_dir/package.json" ]] && grep -q '"name": "repotutor-studio"' "$search_dir/package.json"; then
    repo_root="$search_dir"
    break
  fi
  search_dir="$(dirname "$search_dir")"
done

if [[ -z "$repo_root" ]]; then
  echo "repo-tutor command not found and RepoTutor Studio root could not be located." >&2
  exit 127
fi

exec pnpm --dir "$repo_root" --filter @repotutor/cli dev -- study "$@"
