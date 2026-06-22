# Dependency Security Exceptions

This file records dependency alerts that cannot be fully remediated inside this
repo without an upstream migration. Keep entries narrow and evidence-backed.

## GitHub Dependabot #2: `glib` via Tauri Linux GTK backend

- Advisory: `GHSA-wrw7-89jp-8q8g`
- Package: `glib`
- Vulnerable range: `>= 0.15.0, < 0.20.0`
- Patched version: `0.20.0`
- Manifest: `apps/desktop-tauri/src-tauri/Cargo.lock`
- Current remediation attempted: Tauri stack updated to the latest compatible
  `2.11.3` lockfile set.
- Upstream blocker: `gtk 0.18.2`, pulled by Tauri's Linux GTK backend, requires
  `glib = ^0.18`, so `cargo update -p glib --precise 0.20.0` cannot resolve.
- Evidence command:

```bash
cargo tree --target all -i glib
```

The vulnerable package is not present in macOS target dependency trees:

```bash
cargo tree --target x86_64-apple-darwin -i glib
cargo tree --target aarch64-apple-darwin -i glib
```

Reopen this exception if RepoTutorStudio ships Linux builds, if Tauri migrates
the Linux backend to a patched GTK/glib generation, or if a compatible Tauri
release removes the `gtk 0.18 -> glib 0.18` chain.
