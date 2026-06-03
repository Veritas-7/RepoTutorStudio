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
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "component-graph.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "incremental.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "component-graph.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "incremental.html"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.codex, "events.jsonl"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.source, ".env"))).rejects.toThrow();
    const snapshotText = await fs.readFile(path.join(result.session.outputPaths.analysis, "source-snapshot-report.json"), "utf8");
    expect(snapshotText).toContain("\"sha256\"");
    const incrementalText = await fs.readFile(path.join(result.session.outputPaths.analysis, "incremental-report.json"), "utf8");
    expect(incrementalText).toContain("\"baselineSessionId\"");
    expect(incrementalText).toContain("\"coverageDelta\"");
    const graphText = await fs.readFile(path.join(result.session.outputPaths.analysis, "component-graph-report.json"), "utf8");
    expect(graphText).toContain("\"nodes\"");
    expect(graphText).toContain("\"edges\"");
    const componentGraphHtml = await fs.readFile(path.join(result.session.outputPaths.html, "component-graph.html"), "utf8");
    expect(componentGraphHtml).toContain("data-graph-filter");
    expect(componentGraphHtml).toContain("data-node-type");
    const quizText = await fs.readFile(path.join(result.session.outputPaths.analysis, "quiz.json"), "utf8");
    expect(quizText).toContain("\"choices\"");
  });

  it("compares a new study session against the previous source snapshot", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incremental-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incremental-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "scratch.txt"), "temporary notes not important to the lesson map\n");

    const first = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    await fs.writeFile(path.join(sourceRoot, "src", "added.ts"), "export const added = 'next lesson';\n");
    await fs.appendFile(path.join(sourceRoot, "src", "message.ts"), "\nexport const changed = true;\n");
    await fs.rm(path.join(sourceRoot, "README.md"));
    await fs.rm(path.join(sourceRoot, "scratch.txt"));

    const second = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });

    expect(second.analysis.incrementalReport.baselineSessionId).toBe(first.session.sessionId);
    expect(second.analysis.incrementalReport.addedFiles).toContain("src/added.ts");
    expect(second.analysis.incrementalReport.changedFiles).toContain("src/message.ts");
    expect(second.analysis.incrementalReport.removedFiles).toContain("README.md");
    expect(second.analysis.incrementalReport.unchangedFiles).toContain("src/main.ts");
    expect(second.analysis.incrementalReport.coverageDelta.baselineCoverageRatio).toBeLessThan(second.analysis.incrementalReport.coverageDelta.currentCoverageRatio);
    expect(second.analysis.incrementalReport.coverageDelta.coverageRatioDelta).toBeGreaterThan(0);
  });

  it("uses the required quiz count formula bounds", () => {
    expect(calculateQuizCount({ mode: "quick", folderCount: 1, fileCount: 1, glossaryCount: 1, sectionCount: 1 })).toBeGreaterThanOrEqual(5);
    expect(calculateQuizCount({ mode: "standard", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(35);
    expect(calculateQuizCount({ mode: "deep", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(60);
  });
});
