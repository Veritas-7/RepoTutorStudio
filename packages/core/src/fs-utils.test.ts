import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copySafeTree, walkSafe } from "./fs-utils.js";

describe("safe source tree walking", () => {
  it("excludes generated runtime and study artifacts from source snapshots", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-safe-walk-"));
    const dest = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-safe-copy-"));
    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await fs.mkdir(path.join(root, "apps", "desktop-tauri", "sidecar-dist", "runtime"), { recursive: true });
    await fs.mkdir(path.join(root, "docs", "audits", "generated", "run-1"), { recursive: true });
    await fs.mkdir(path.join(root, "studies", "2026-06-19", "session"), { recursive: true });
    await fs.mkdir(path.join(root, "apps", "cli", "studies", "2026-06-19", "session"), { recursive: true });

    await fs.writeFile(path.join(root, "src", "index.ts"), "export const value = 1;\n");
    await fs.writeFile(path.join(root, "apps", "desktop-tauri", "sidecar-dist", "runtime", "node"), "runtime-binary-placeholder\n");
    await fs.writeFile(path.join(root, "docs", "audits", "generated", "run-1", "audit.md"), "# generated audit\n");
    await fs.writeFile(path.join(root, "studies", "2026-06-19", "session", "session.json"), "{}\n");
    await fs.writeFile(path.join(root, "apps", "cli", "studies", "2026-06-19", "session", "session.json"), "{}\n");

    const walk = await walkSafe(root);
    expect(walk.files.map((file) => file.relPath)).toContain("src/index.ts");
    expect(walk.files.map((file) => file.relPath)).not.toContain("apps/desktop-tauri/sidecar-dist/runtime/node");
    expect(walk.files.map((file) => file.relPath)).not.toContain("docs/audits/generated/run-1/audit.md");
    expect(walk.files.map((file) => file.relPath)).not.toContain("studies/2026-06-19/session/session.json");
    expect(walk.files.map((file) => file.relPath)).not.toContain("apps/cli/studies/2026-06-19/session/session.json");
    expect(walk.excludedPaths).toEqual(expect.arrayContaining([
      "apps/desktop-tauri/sidecar-dist",
      "docs/audits/generated",
      "studies",
      "apps/cli/studies"
    ]));

    await copySafeTree(root, dest);
    await expect(fs.access(path.join(dest, "src", "index.ts"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(dest, "apps", "desktop-tauri", "sidecar-dist", "runtime", "node"))).rejects.toThrow();
    await expect(fs.access(path.join(dest, "docs", "audits", "generated", "run-1", "audit.md"))).rejects.toThrow();
    await expect(fs.access(path.join(dest, "studies", "2026-06-19", "session", "session.json"))).rejects.toThrow();
    await expect(fs.access(path.join(dest, "apps", "cli", "studies", "2026-06-19", "session", "session.json"))).rejects.toThrow();
  });
});
