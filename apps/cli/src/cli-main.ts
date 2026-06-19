#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { loadStudyHtmlInput, runStudy } from "@repotutor/core";
import type { LearnerLevel, StudyMode } from "@repotutor/shared";
import { parseArgs, type ParsedArgs } from "./args.js";
import { flagEnum, numberFlag, stringFlag } from "./flags.js";
import { help } from "./help.js";
import { list, verifyListOutput } from "./list-command.js";
import { openTargetPaths } from "./open-targets.js";
import { doctor } from "./doctor-command.js";
import { openSession } from "./open-command.js";
import { pruneSource } from "./prune-command.js";
import { quiz } from "./quiz-command.js";
import { htmlTargetStatus, resolveSessionRoot, sessionVerificationSummary, studiesRoot } from "./session-utils.js";
import {
  evidenceMarkdown,
  evidenceVerificationMarkdown,
  exportSummaryMarkdown,
  exportVerificationMarkdown,
  resumeMarkdown,
  sessionVerificationMarkdown,
  studyMarkdown
} from "./cli-formatters.js";
async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  try {
    if (parsed.command === "study") await study(parsed);
    else if (parsed.command === "quiz") await quiz(parsed);
    else if (parsed.command === "resume") await resume(parsed);
    else if (parsed.command === "evidence") await evidence(parsed);
    else if (parsed.command === "export") await exportSession(parsed);
    else if (parsed.command === "verify-export") await verifyExport(parsed);
    else if (parsed.command === "verify-evidence") await verifyEvidence(parsed);
    else if (parsed.command === "verify-session") await verifySession(parsed);
    else if (parsed.command === "verify-list-output") await verifyListOutput(parsed);
    else if (parsed.command === "list") await list(parsed, studiesRoot(parsed.flags));
    else if (parsed.command === "open") await openSession(parsed);
    else if (parsed.command === "prune-source") await pruneSource(parsed);
    else if (parsed.command === "doctor") await doctor(parsed);
    else help();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`ERROR: ${message}`);
    process.exitCode = 1;
  }
}

async function study(parsed: ParsedArgs): Promise<void> {
  const source = parsed.rest[0];
  if (!source) throw new Error("study requires a GitHub URL or local path.");
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("study supports --format json or markdown.");
  const result = await runStudy({
    source,
    mode: flagEnum(parsed.flags.mode, ["quick", "standard", "deep"], "standard") as StudyMode,
    level: flagEnum(parsed.flags.level, ["beginner", "junior", "senior"], "beginner") as LearnerLevel,
    studiesRoot: studiesRoot(parsed.flags),
    sourceBaseDir: commandBaseDir(),
    enableCodex: parsed.flags["no-codex"] !== true,
    learnerBriefPath: stringFlag(parsed.flags["learner-brief"])
  });
  const verificationReport = path.join(result.session.outputPaths.analysis, "session-verification-report.json");
  const verification = JSON.parse(await fs.readFile(verificationReport, "utf8")) as {
    ok: boolean;
    checkedRequiredArtifacts: number;
    checks: Record<string, boolean>;
  };
  const payload = {
    sessionId: result.session.sessionId,
    status: result.session.status,
    path: result.session.outputPaths.root,
    html: path.join(result.session.outputPaths.html, "index.html"),
    dailySummaryHtml: path.join(result.session.outputPaths.html, "daily-summary.html"),
    teachingWorkspaceHtml: path.join(result.session.outputPaths.html, "teaching-workspace.html"),
    learnerGoalAlignmentHtml: path.join(result.session.outputPaths.root, "reference", "learner-goal-alignment.html"),
    verificationOk: verification.ok,
    verificationReport,
    verificationMarkdown: path.join(result.session.outputPaths.markdown, "session-verification.md"),
    verificationHtml: path.join(result.session.outputPaths.html, "session-verification.html"),
    verificationCheckedRequiredArtifacts: verification.checkedRequiredArtifacts,
    verificationChecks: verification.checks,
    quizQuestions: result.session.quizSummary.totalQuestions
  };
  console.log(format === "markdown" ? studyMarkdown(payload) : JSON.stringify(payload, null, 2));
}

async function resume(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const session = JSON.parse(await fs.readFile(path.join(sessionRoot, "session.json"), "utf8")) as {
    sessionId: string;
    repo: string;
    studyMode: string;
    learnerLevel: string;
    outputPaths: { html: string };
  };
  const verification = await sessionVerificationSummary(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("resume supports --format json or markdown.");
  const htmlTargets = openTargetPaths(session.outputPaths.html);
  const payload = {
    sessionId: session.sessionId,
    repo: session.repo,
    mode: session.studyMode,
    level: session.learnerLevel,
    root: sessionRoot,
    html: path.join(session.outputPaths.html, "index.html"),
    dailySummaryHtml: path.join(session.outputPaths.html, "daily-summary.html"),
    teachingWorkspaceHtml: path.join(session.outputPaths.html, "teaching-workspace.html"),
    htmlTargets,
    htmlTargetStatus: await htmlTargetStatus(htmlTargets),
    verificationStatus: verification.status,
    verificationOk: verification.ok,
    verificationReport: verification.reportPath,
    verificationMarkdown: verification.markdownPath,
    verificationHtml: verification.htmlPath,
    verificationCheckedRequiredArtifacts: verification.checkedRequiredArtifacts,
    verificationChecks: verification.checks
  };
  if (format === "markdown") {
    console.log(resumeMarkdown(payload));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

async function evidence(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const report = JSON.parse(await fs.readFile(path.join(sessionRoot, "analysis", "evidence-index-report.json"), "utf8")) as {
    totalEvidenceItems: number;
    evidenceByKind: Record<string, number>;
    evidenceByFile: Record<string, number>;
    items: Array<{
      filePath: string;
      line: number;
      kind: string;
      snippet: string;
      lessonHref: string;
      sourcePath: string;
      sourceHref: string;
    }>;
  };
  const kind = stringFlag(parsed.flags.kind);
  const file = stringFlag(parsed.flags.file);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("evidence supports --format json or markdown.");
  const limit = numberFlag(parsed.flags.limit, 20);
  const items = report.items
    .filter((item) => !kind || item.kind === kind)
    .filter((item) => !file || item.filePath === file)
    .slice(0, limit);
  const payload = {
    sessionRoot,
    totalEvidenceItems: report.totalEvidenceItems,
    evidenceByKind: report.evidenceByKind,
    evidenceByFile: report.evidenceByFile,
    filteredKind: kind ?? null,
    filteredFile: file ?? null,
    returnedItems: items.length,
    items
  };
  if (format === "markdown") {
    console.log(evidenceMarkdown(payload));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

async function exportSession(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const format = stringFlag(parsed.flags.format) ?? "html";
  if (!["html", "zip"].includes(format)) throw new Error("export supports --format html or --format zip.");
  const summaryFormat = stringFlag(parsed.flags["summary-format"]) ?? "json";
  if (!["json", "markdown"].includes(summaryFormat)) throw new Error("export supports --summary-format json or markdown.");
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
  const { renderStudyHtml } = await import("@repotutor/html");
  const { verifyHtmlExportManifest, writeHtmlZipBundle, writeRenderedHtml } = await import("@repotutor/core");
  const rendered = renderStudyHtml(htmlInput);
  await writeRenderedHtml(sessionRoot, rendered);
  const verification = await verifyHtmlExportManifest(sessionRoot);
  if (!verification.ok) throw new Error("HTML export integrity verification failed.");
  const zip = format === "zip" ? await writeHtmlZipBundle(sessionRoot) : null;
  const payload = {
    exported: format,
    path: zip?.zipPath ?? path.join(sessionRoot, "html", "index.html"),
    html: path.join(sessionRoot, "html", "index.html"),
    readme: path.join(sessionRoot, "html", "EXPORT-README.md"),
    manifest: path.join(sessionRoot, "html", "manifest.json"),
    pages: rendered.manifest.pages.length,
    assets: rendered.manifest.assets.length,
    integrityOk: verification.ok,
    integrityCheckedFiles: verification.checkedFiles,
    zipBytes: zip?.bytes ?? null,
    zipFiles: zip?.fileCount ?? null,
    entrypoints: rendered.manifest.entrypoints.map((entry) => ({
      label: entry.label,
      path: path.join(sessionRoot, entry.path)
    }))
  };
  console.log(summaryFormat === "markdown" ? exportSummaryMarkdown(payload) : JSON.stringify(payload, null, 2));
}

async function verifyExport(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyHtmlExportManifest } = await import("@repotutor/core");
  const result = await verifyHtmlExportManifest(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-export supports --format json or markdown.");
  console.log(format === "markdown" ? exportVerificationMarkdown(result) : JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

async function verifyEvidence(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyEvidenceIndexReport } = await import("@repotutor/core");
  const result = await verifyEvidenceIndexReport(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-evidence supports --format json or markdown.");
  console.log(format === "markdown" ? evidenceVerificationMarkdown(result) : JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

async function verifySession(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyStudySessionArtifacts } = await import("@repotutor/core");
  const result = await verifyStudySessionArtifacts(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-session supports --format json or markdown.");
  if (format === "markdown") {
    console.log(sessionVerificationMarkdown(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  if (!result.ok) process.exitCode = 1;
}

function commandBaseDir(): string {
  return path.resolve(process.env.INIT_CWD ?? process.cwd());
}


await main();
