import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculateQuizCount, runStudy, verifyHtmlExportManifest, writeHtmlZipBundle } from "./index.js";

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
    await expect(fs.access(path.join(result.session.outputPaths.html, "manifest.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "EXPORT-README.md"))).resolves.toBeUndefined();
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
    expect(graphText).toContain("\"nodeTypeCounts\"");
    expect(graphText).toContain("\"topConnectedNodes\"");
    const componentGraphMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "component-graph.md"), "utf8");
    expect(componentGraphMarkdown).toContain("## 큰 그래프 요약");
    const componentGraphHtml = await fs.readFile(path.join(result.session.outputPaths.html, "component-graph.html"), "utf8");
    expect(componentGraphHtml).toContain("큰 그래프 요약");
    expect(componentGraphHtml).toContain("data-graph-filter");
    expect(componentGraphHtml).toContain("data-node-type");
    const exportManifestText = await fs.readFile(path.join(result.session.outputPaths.html, "manifest.json"), "utf8");
    expect(exportManifestText).toContain("\"entrypoints\"");
    expect(exportManifestText).toContain("\"integrity\"");
    expect(exportManifestText).toContain("\"bytes\"");
    expect(exportManifestText).toContain("\"sha256\"");
    expect(exportManifestText).toContain("\"readmePath\"");
    const exportReadmeText = await fs.readFile(path.join(result.session.outputPaths.html, "EXPORT-README.md"), "utf8");
    expect(exportReadmeText).toContain("RepoTutor HTML Export");
    expect(exportReadmeText).toContain("Entry Points");
    expect(exportReadmeText).toContain("Integrity metadata uses sha256");
    const filesHtml = await fs.readFile(path.join(result.session.outputPaths.html, "files.html"), "utf8");
    expect(filesHtml).toContain("file-nav-toolbar");
    expect(filesHtml).toContain("data-file-ext-filter");
    expect(filesHtml).toContain("data-file-dir-filter");
    expect(filesHtml).toContain("data-file-dir");
    expect(filesHtml).toContain("소스 근거");
    expect(filesHtml).toContain("source-evidence");
    expect(filesHtml).toContain("import { createGreeting }");
    const filesMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "files.md"), "utf8");
    expect(filesMarkdown).toContain("### 소스 근거");
    const fileLessonsText = await fs.readFile(path.join(result.session.outputPaths.analysis, "file-lessons.json"), "utf8");
    expect(fileLessonsText).toContain("\"sourceEvidence\"");
    expect(fileLessonsText).toContain("\"snippet\"");
    const zip = await writeHtmlZipBundle(result.session.outputPaths.root);
    expect(zip.fileCount).toBeGreaterThan(5);
    expect(zip.bytes).toBeGreaterThan(100);
    const zipSignature = await fs.readFile(zip.zipPath).then((buffer) => buffer.subarray(0, 4).toString("hex"));
    expect(zipSignature).toBe("504b0304");
    const exportVerification = await verifyHtmlExportManifest(result.session.outputPaths.root);
    expect(exportVerification.ok).toBe(true);
    expect(exportVerification.checkedFiles).toBeGreaterThan(5);
    expect(exportVerification.failures).toHaveLength(0);
    await fs.appendFile(path.join(result.session.outputPaths.html, "index.html"), "\n<!-- tampered -->\n");
    const tamperedVerification = await verifyHtmlExportManifest(result.session.outputPaths.root);
    expect(tamperedVerification.ok).toBe(false);
    expect(tamperedVerification.failures[0]?.path).toBe("html/index.html");
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

  it("resolves relative local sources against an explicit source base directory", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-relative-studies-"));
    const sourceBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-relative-source-base-"));
    await fs.cp(fixtureRoot, path.join(sourceBaseDir, "relative-app"), { recursive: true });

    const result = await runStudy({
      source: "relative-app",
      sourceBaseDir,
      mode: "quick",
      level: "beginner",
      studiesRoot
    });

    expect(result.session.status).toBe("complete");
    expect(result.session.localSourcePath).toBe(path.join(sourceBaseDir, "relative-app"));
    await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
  });

  it("uses the required quiz count formula bounds", () => {
    expect(calculateQuizCount({ mode: "quick", folderCount: 1, fileCount: 1, glossaryCount: 1, sectionCount: 1 })).toBeGreaterThanOrEqual(5);
    expect(calculateQuizCount({ mode: "standard", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(35);
    expect(calculateQuizCount({ mode: "deep", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(60);
  });
});
