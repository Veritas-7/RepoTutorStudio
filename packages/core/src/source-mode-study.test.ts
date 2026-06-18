import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "./pipeline.js";
import { verifyStudySessionArtifacts } from "./session-verifier.js";

describe("special source mode study intake", () => {
  it("runs SKILL.md and CLI-Anything targets through complete study sessions without executing target code", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-source-mode-study-"));
    const skillRoot = path.join(root, "repo-skill");
    const cliAnythingRoot = path.join(root, "cli-anything-target");
    const studiesRoot = path.join(root, "studies");
    const cliExecutionSentinel = path.join(root, "cli-anything-executed.txt");

    await fs.mkdir(path.join(skillRoot, "scripts"), { recursive: true });
    await fs.writeFile(path.join(skillRoot, "SKILL.md"), [
      "---",
      "name: repo-skill",
      "description: Learn a repository through source-grounded prompts.",
      "---",
      "",
      "# Repo Skill",
      "",
      "Use this skill to inspect project structure, evidence, and verification boundaries.",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(skillRoot, "scripts", "study.sh"), "#!/usr/bin/env bash\necho static skill helper\n");

    await fs.mkdir(path.join(cliAnythingRoot, "agent-harness"), { recursive: true });
    await fs.writeFile(path.join(cliAnythingRoot, "README.md"), "# CLI Anything Target\n");
    await fs.writeFile(path.join(cliAnythingRoot, "agent-harness", "manifest.json"), JSON.stringify({
      name: "cli-anything-target",
      commands: ["inspect", "summarize"],
      note: "RepoTutor must analyze this statically and must not run these commands."
    }, null, 2));
    await fs.writeFile(path.join(cliAnythingRoot, "agent-harness", "run.sh"), [
      "#!/usr/bin/env bash",
      `echo executed > ${JSON.stringify(cliExecutionSentinel)}`,
      ""
    ].join("\n"));

    const skill = await runStudy({
      source: "repo-skill",
      sourceBaseDir: root,
      studiesRoot,
      mode: "quick",
      level: "beginner",
      enableCodex: false
    });
    expect(skill.session.sourceType).toBe("skill");
    expect(skill.session.owner).toBe("skill");
    expect(skill.session.repo).toBe("repo-skill");
    expect(skill.session.status).toBe("complete");
    expect(skill.analysis.fileLessons.some((lesson) => lesson.filePath === "SKILL.md")).toBe(true);
    await expect(fs.access(path.join(skill.session.outputPaths.source, "SKILL.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(skill.session.outputPaths.analysis, "quiz.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(skill.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
    expect((await verifyStudySessionArtifacts(skill.session.outputPaths.root)).ok).toBe(true);

    const cliAnything = await runStudy({
      source: "cli-anything-target",
      sourceBaseDir: root,
      studiesRoot,
      mode: "quick",
      level: "beginner",
      enableCodex: false
    });
    expect(cliAnything.session.sourceType).toBe("cli-anything");
    expect(cliAnything.session.owner).toBe("local");
    expect(cliAnything.session.repo).toBe("cli-anything-target");
    expect(cliAnything.session.status).toBe("complete");
    const cliAnythingHarnessManifest = "agent-harness/manifest.json";
    expect(cliAnything.analysis.repoMap.folders.some((folder) => folder.folderPath === "agent-harness" && folder.representativeFiles.includes("manifest.json"))).toBe(true);
    expect(cliAnythingHarnessManifest).toBe("agent-harness/manifest.json");
    await expect(fs.access(path.join(cliAnything.session.outputPaths.source, "agent-harness", "manifest.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(cliAnything.session.outputPaths.analysis, "quiz.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(cliAnything.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
    await expect(fs.access(cliExecutionSentinel)).rejects.toThrow();
    expect((await verifyStudySessionArtifacts(cliAnything.session.outputPaths.root)).ok).toBe(true);
  }, 45_000);
});
