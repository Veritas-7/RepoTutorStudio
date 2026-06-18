import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "./intake.js";

describe("source intake mode parsing", () => {
  it("classifies the advertised source input modes without executing target code", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-intake-modes-"));
    const localDir = path.join(root, "local-app");
    const skillDir = path.join(root, "repo-skill");
    const cliAnythingDir = path.join(root, "cli-anything-target");
    const zipPath = path.join(root, "archive-app.zip");

    await fs.mkdir(localDir);
    await fs.writeFile(path.join(localDir, "README.md"), "# Local app\n");
    await fs.mkdir(skillDir);
    await fs.writeFile(path.join(skillDir, "SKILL.md"), "---\nname: repo-skill\n---\n");
    await fs.mkdir(cliAnythingDir);
    await fs.mkdir(path.join(cliAnythingDir, "agent-harness"));
    await fs.writeFile(zipPath, "zip parser classification smoke only\n");

    const github = await parseSource("https://github.com/OpenAI/codex/tree/feature/parser-smoke", { baseDir: root });
    expect(github).toMatchObject({
      sourceType: "github",
      owner: "OpenAI",
      repo: "codex",
      branch: "feature-parser-smoke",
      sourceUrl: "https://github.com/OpenAI/codex.git"
    });

    const local = await parseSource("local-app", { baseDir: root });
    expect(local).toMatchObject({
      sourceType: "local",
      owner: "local",
      repo: "local-app",
      branch: "local",
      localSourcePath: localDir
    });

    const zip = await parseSource("archive-app.zip", { baseDir: root });
    expect(zip).toMatchObject({
      sourceType: "zip",
      owner: "zip",
      repo: "archive-app",
      branch: "local",
      localSourcePath: zipPath
    });

    const skill = await parseSource("repo-skill", { baseDir: root });
    expect(skill).toMatchObject({
      sourceType: "skill",
      owner: "skill",
      repo: "repo-skill",
      branch: "local",
      localSourcePath: skillDir
    });

    const cliAnything = await parseSource("cli-anything-target", { baseDir: root });
    expect(cliAnything).toMatchObject({
      sourceType: "cli-anything",
      owner: "local",
      repo: "cli-anything-target",
      branch: "local",
      localSourcePath: cliAnythingDir
    });

    await expect(parseSource("missing-target", { baseDir: root })).rejects.toThrow("지원하지 않는 입력입니다");
  });
});
