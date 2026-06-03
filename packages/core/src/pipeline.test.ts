import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculateQuizCount, runStudy } from "./index.js";

const fixtureRoot = path.resolve("packages/core/tests/fixtures/simple-ts-app");

describe("RepoTutor core pipeline", () => {
  it("generates a complete study session for a TypeScript fixture", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-study-"));
    const result = await runStudy({ source: fixtureRoot, mode: "quick", level: "beginner", studiesRoot });
    expect(result.session.status).toBe("complete");
    expect(result.session.quizSummary.totalQuestions).toBeGreaterThanOrEqual(5);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "repo-map.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "overview.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.codex, "events.jsonl"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.source, ".env"))).rejects.toThrow();
    const quizText = await fs.readFile(path.join(result.session.outputPaths.analysis, "quiz.json"), "utf8");
    expect(quizText).toContain("\"choices\"");
  });

  it("uses the required quiz count formula bounds", () => {
    expect(calculateQuizCount({ mode: "quick", folderCount: 1, fileCount: 1, glossaryCount: 1, sectionCount: 1 })).toBeGreaterThanOrEqual(5);
    expect(calculateQuizCount({ mode: "standard", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(35);
    expect(calculateQuizCount({ mode: "deep", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(60);
  });
});
