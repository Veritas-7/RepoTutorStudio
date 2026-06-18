import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "./pipeline.js";
import { verifyStudySessionArtifacts } from "./session-verifier.js";

describe("ZIP source study intake", () => {
  it("runs an advertised ZIP input through the full study pipeline after extraction", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zip-study-"));
    const sourceRoot = path.join(root, "archive-app");
    const zipPath = path.join(root, "archive-app.zip");
    const studiesRoot = path.join(root, "studies");

    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), "# Archive App\n\nA small static fixture for ZIP source study intake.\n");
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "archive-app",
      scripts: {
        test: "vitest run"
      },
      dependencies: {
        zod: "^4.1.13"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "index.ts"), [
      "import { z } from 'zod';",
      "",
      "const Message = z.object({ text: z.string() });",
      "export function parseMessage(input: unknown): string {",
      "  return Message.parse(input).text;",
      "}",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".env"), "SECRET_TOKEN=zip-fixture-secret\n");

    execFileSync("zip", ["-qr", zipPath, "."], { cwd: sourceRoot, stdio: "ignore" });

    const result = await runStudy({
      source: "archive-app.zip",
      sourceBaseDir: root,
      studiesRoot,
      mode: "quick",
      level: "beginner",
      enableCodex: false
    });

    expect(result.session.sourceType).toBe("zip");
    expect(result.session.owner).toBe("zip");
    expect(result.session.repo).toBe("archive-app");
    expect(result.session.localSourcePath).toBe(zipPath);
    expect(result.session.status).toBe("complete");
    expect(result.session.quizSummary.totalQuestions).toBeGreaterThan(0);
    expect(result.analysis.repoMap.totalFiles).toBeGreaterThan(0);
    expect(result.analysis.fileLessons.some((lesson) => lesson.filePath === "src/index.ts")).toBe(true);

    await expect(fs.access(path.join(result.session.outputPaths.source, "README.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.source, "src", "index.ts"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.source, ".env"))).rejects.toThrow();
    const requiredGeneratedArtifacts = ["analysis/quiz.json", "markdown/vibe-coding-start.md", "html/index.html"];
    expect(requiredGeneratedArtifacts).toContain("analysis/quiz.json");
    expect(requiredGeneratedArtifacts).toContain("html/index.html");
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "quiz.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "vibe-coding-start.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();

    const verification = await verifyStudySessionArtifacts(result.session.outputPaths.root);
    expect(verification.ok).toBe(true);
    expect(verification.checks.requiredArtifacts).toBe(true);
    expect(verification.checks.htmlExport).toBe(true);
    expect(verification.checks.evidenceIndex).toBe(true);
  }, 30_000);
});
