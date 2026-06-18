import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "./pipeline.js";
import { verifyStudySessionArtifacts } from "./session-verifier.js";

describe("GitHub source study intake", () => {
  it("runs a GitHub branch URL through clone and the full study pipeline without network", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-github-study-"));
    const fixtureRoot = path.join(root, "remote-fixture");
    const binRoot = path.join(root, "bin");
    const gitLog = path.join(root, "git-commands.log");
    const studiesRoot = path.join(root, "studies");
    const previousPath = process.env.PATH;
    const previousFixture = process.env.REPOTUTOR_GIT_STUB_FIXTURE;
    const previousLog = process.env.REPOTUTOR_GIT_STUB_LOG;

    await fs.mkdir(path.join(fixtureRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(fixtureRoot, "README.md"), "# GitHub Fixture\n\nA static fixture copied by a fake git clone.\n");
    await fs.writeFile(path.join(fixtureRoot, "package.json"), JSON.stringify({
      name: "github-fixture",
      scripts: {
        test: "vitest run"
      }
    }, null, 2));
    await fs.writeFile(path.join(fixtureRoot, "src", "index.ts"), "export const clonedFromGithub = true;\n");
    await fs.writeFile(path.join(fixtureRoot, ".env"), "SECRET_TOKEN=github-fixture-secret\n");

    await fs.mkdir(binRoot, { recursive: true });
    await fs.writeFile(path.join(binRoot, "git"), [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      "printf '%s\\n' \"$*\" >> \"$REPOTUTOR_GIT_STUB_LOG\"",
      "if [ \"$1\" = \"clone\" ]; then",
      "  dest=\"${!#}\"",
      "  rm -rf \"$dest\"",
      "  mkdir -p \"$dest\"",
      "  cp -R \"$REPOTUTOR_GIT_STUB_FIXTURE\"/. \"$dest\"/",
      "  exit 0",
      "fi",
      "if [ \"$1\" = \"-C\" ] && [ \"$3\" = \"rev-parse\" ] && [ \"$4\" = \"--abbrev-ref\" ]; then",
      "  printf '%s\\n' 'feature-smoke'",
      "  exit 0",
      "fi",
      "if [ \"$1\" = \"-C\" ] && [ \"$3\" = \"rev-parse\" ] && [ \"$4\" = \"HEAD\" ]; then",
      "  printf '%s\\n' '0123456789abcdef0123456789abcdef01234567'",
      "  exit 0",
      "fi",
      "printf 'unexpected git args: %s\\n' \"$*\" >&2",
      "exit 2",
      ""
    ].join("\n"), { mode: 0o755 });

    process.env.PATH = `${binRoot}${path.delimiter}${previousPath ?? ""}`;
    process.env.REPOTUTOR_GIT_STUB_FIXTURE = fixtureRoot;
    process.env.REPOTUTOR_GIT_STUB_LOG = gitLog;
    try {
      const result = await runStudy({
        source: "https://github.com/Veritas-7/repotutor-fixture/tree/feature-smoke",
        studiesRoot,
        mode: "quick",
        level: "beginner",
        enableCodex: false
      });

      expect(result.session.sourceType).toBe("github");
      expect(result.session.owner).toBe("Veritas-7");
      expect(result.session.repo).toBe("repotutor-fixture");
      expect(result.session.branch).toBe("feature-smoke");
      expect(result.session.commitHash).toBe("0123456789abcdef0123456789abcdef01234567");
      expect(result.session.sourceUrl).toBe("https://github.com/Veritas-7/repotutor-fixture.git");
      expect(result.session.status).toBe("complete");
      expect(result.analysis.fileLessons.some((lesson) => lesson.filePath === "src/index.ts")).toBe(true);
      await expect(fs.access(path.join(result.session.outputPaths.source, "src", "index.ts"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(result.session.outputPaths.source, ".env"))).rejects.toThrow();
      await expect(fs.access(path.join(result.session.outputPaths.analysis, "quiz.json"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();

      const commands = await fs.readFile(gitLog, "utf8");
      const expectedCloneCommand = "git clone --depth 1 --branch feature-smoke https://github.com/Veritas-7/repotutor-fixture.git";
      expect(`git ${commands}`).toContain(expectedCloneCommand);
      expect(commands).toContain("rev-parse --abbrev-ref HEAD");
      expect(commands).toContain("rev-parse HEAD");
      expect((await verifyStudySessionArtifacts(result.session.outputPaths.root)).ok).toBe(true);
    } finally {
      if (previousPath === undefined) delete process.env.PATH;
      else process.env.PATH = previousPath;
      if (previousFixture === undefined) delete process.env.REPOTUTOR_GIT_STUB_FIXTURE;
      else process.env.REPOTUTOR_GIT_STUB_FIXTURE = previousFixture;
      if (previousLog === undefined) delete process.env.REPOTUTOR_GIT_STUB_LOG;
      else process.env.REPOTUTOR_GIT_STUB_LOG = previousLog;
    }
  }, 30_000);
});
