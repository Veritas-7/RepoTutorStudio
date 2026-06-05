#!/usr/bin/env node
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { listSessions, loadStudyHtmlInput, runStudy } from "@repotutor/core";
import { scoreQuizAttempt } from "@repotutor/core";
import type { LearnerLevel, StudyMode } from "@repotutor/shared";

interface ParsedArgs {
  command: string;
  rest: string[];
  flags: Record<string, string | boolean>;
}

interface DoctorPayload {
  ok: boolean;
  product: string;
  commands: string[];
  defaultStudyCommand: boolean;
  formats: Record<string, string[]>;
  runtime: {
    cwd: string;
    studiesRoot: string;
    initCwd: string | null;
    envStudiesRoot: string | null;
  };
  runtimeOptions: Record<string, boolean>;
  runtimeHealth: Record<string, boolean>;
  listFilters: Record<string, string[] | boolean>;
  openTargets: string[];
  modes: string[];
  security: Record<string, boolean>;
}

interface ListRow {
  sessionId: string;
  repo: string;
  createdAt: string;
  mode: string;
  level: string;
  score: number | null;
  wrong: number;
  path: string;
  html: string;
  htmlTargetsComplete: boolean;
  missingHtmlTargets: string[];
  verificationStatus: string;
  verificationOk: boolean | null;
  verificationReport: string;
  verificationMarkdown: string;
  verificationHtml: string;
  verificationCheckedRequiredArtifacts: number | null;
  verificationChecks: Record<string, boolean> | null;
}

interface ListSummary {
  total: number;
  verificationStatus: Record<string, number>;
  modes: Record<string, number>;
  levels: Record<string, number>;
  htmlTargets: {
    complete: number;
    missing: number;
  };
  quiz: {
    scored: number;
    unattempted: number;
    wrong: number;
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
  };
  repos: Record<string, number>;
}

interface ListOutputContext {
  format: string;
  summary: boolean;
  rows: number;
  fields: string[] | null;
  fieldPreset: string | null;
  filters: ListFilterManifest;
}

interface ListOutputManifest {
  schemaVersion: number;
  outputPath: string;
  manifestPath: string;
  format: string;
  summary: boolean;
  rows: number;
  fields: string[] | null;
  fieldPreset: string | null;
  filters: ListFilterManifest;
  bytes: number;
  sha256: string;
  createdAt: string;
}

interface ListFilterManifest {
  repo: string | null;
  createdFrom: string | null;
  createdTo: string | null;
  mode: string;
  level: string;
  status: string;
  htmlTargets: string;
  sort: string | null;
  limit: number | null;
  verifiedOnly: boolean;
  wrongOnly: boolean;
  unattemptedOnly: boolean;
  scoredOnly: boolean;
  minScore: number | null;
  maxScore: number | null;
}

interface ListOutputVerification {
  ok: boolean;
  outputPath: string;
  manifestPath: string;
  schemaVersion: number | null;
  supportedSchemaVersion: boolean;
  format: string | null;
  summary: boolean | null;
  rows: number | null;
  actualRows: number | null;
  fields: string[] | null;
  actualFields: string[] | null;
  expectedBytes: number | null;
  actualBytes: number | null;
  expectedSha256: string | null;
  actualSha256: string | null;
  failures: Array<{
    reason: string;
    path: string;
    expected: string | number | boolean | null;
    actual: string | number | boolean | null;
  }>;
}

const LIST_FIELDS = [
  "sessionId",
  "repo",
  "createdAt",
  "mode",
  "level",
  "score",
  "wrong",
  "path",
  "html",
  "htmlTargetsComplete",
  "missingHtmlTargets",
  "verificationStatus",
  "verificationOk",
  "verificationReport",
  "verificationMarkdown",
  "verificationHtml",
  "verificationCheckedRequiredArtifacts",
  "verificationChecks"
] as const satisfies readonly (keyof ListRow)[];

type ListField = typeof LIST_FIELDS[number];

const LIST_FIELD_SET = new Set<string>(LIST_FIELDS);

const DEFAULT_LIST_CSV_FIELDS = [
  "sessionId",
  "repo",
  "createdAt",
  "mode",
  "level",
  "score",
  "wrong",
  "verificationStatus",
  "htmlTargetsComplete",
  "missingHtmlTargets",
  "path",
  "html"
] as const satisfies readonly ListField[];

const LIST_FIELD_PRESETS = {
  compact: ["sessionId", "repo", "createdAt", "verificationStatus"],
  scores: ["sessionId", "repo", "score", "wrong", "path"],
  handoff: ["sessionId", "repo", "mode", "level", "verificationStatus", "path", "html"],
  verification: ["sessionId", "repo", "verificationStatus", "verificationOk", "verificationReport", "verificationHtml"],
  paths: ["sessionId", "repo", "path", "html"]
} as const satisfies Record<string, readonly ListField[]>;

const LIST_FIELD_PRESET_NAMES = Object.keys(LIST_FIELD_PRESETS) as Array<keyof typeof LIST_FIELD_PRESETS>;
const LIST_OUTPUT_MANIFEST_SCHEMA_VERSION = 1;
const CLI_COMMANDS = [
  "study",
  "quiz",
  "resume",
  "evidence",
  "export",
  "verify-export",
  "verify-evidence",
  "verify-session",
  "verify-list-output",
  "list",
  "open",
  "doctor"
] as const;
const CLI_COMMAND_SET = new Set<string>(CLI_COMMANDS);
const HELP_COMMANDS = new Set(["help", "--help", "-h"]);

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
    else if (parsed.command === "list") await list(parsed);
    else if (parsed.command === "open") await openSession(parsed);
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
    enableCodex: parsed.flags["enable-codex"] === true
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

async function quiz(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("quiz supports --format json or markdown.");
  let answers: Record<string, "A" | "B" | "C" | "D">;
  const answersFile = stringFlag(parsed.flags.answers);
  if (answersFile) {
    answers = JSON.parse(await fs.readFile(path.resolve(answersFile), "utf8")) as Record<string, "A" | "B" | "C" | "D">;
  } else if (parsed.flags.interactive) {
    answers = await askAnswers(htmlInput.quiz.questions);
  } else {
    throw new Error("quiz requires --interactive or --answers answers.json");
  }
  const attempt = await scoreQuizAttempt(sessionRoot, answers, htmlInput);
  const payload = {
    attemptId: attempt.attemptId,
    score: attempt.score,
    correct: attempt.correctCount,
    wrong: attempt.wrongCount,
    wrongNotes: path.join(sessionRoot, "html", "wrong-notes.html")
  };
  console.log(format === "markdown" ? quizAttemptMarkdown(payload) : JSON.stringify(payload, null, 2));
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

async function verifyListOutput(parsed: ParsedArgs): Promise<void> {
  const outputFile = parsed.rest[0];
  if (!outputFile) throw new Error("verify-list-output requires an output file.");
  const outputPath = path.resolve(outputFile);
  const manifestFile = optionalStringFlag(parsed.flags.manifest, "manifest");
  const manifestPath = path.resolve(manifestFile ?? `${outputPath}.manifest.json`);
  const result = await verifyListOutputManifest(outputPath, manifestPath);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-list-output supports --format json or markdown.");
  const rendered = format === "markdown" ? listOutputVerificationMarkdown(result) : jsonText(result);
  await emitVerifyListOutputReport(rendered, parsed.flags.report, outputPath, format);
  if (!result.ok) process.exitCode = 1;
}

async function list(parsed: ParsedArgs): Promise<void> {
  const sessions = await listSessions(studiesRoot(parsed.flags));
  const rows: ListRow[] = await Promise.all(sessions.map(async (session) => {
    const verification = await sessionVerificationSummary(session.outputPaths.root);
    const targetStatus = await htmlTargetStatus(openTargetPaths(session.outputPaths.html));
    const missingHtmlTargets = Object.entries(targetStatus)
      .filter(([, present]) => !present)
      .map(([target]) => target);
    return {
      sessionId: session.sessionId,
      repo: `${session.owner}/${session.repo}`,
      createdAt: session.createdAt,
      mode: session.studyMode,
      level: session.learnerLevel,
      score: session.quizSummary.latestScore,
      wrong: session.quizSummary.wrongCount,
      path: session.outputPaths.root,
      html: path.join(session.outputPaths.html, "index.html"),
      htmlTargetsComplete: missingHtmlTargets.length === 0,
      missingHtmlTargets,
      verificationStatus: verification.status,
      verificationOk: verification.ok,
      verificationReport: verification.reportPath,
      verificationMarkdown: verification.markdownPath,
      verificationHtml: verification.htmlPath,
      verificationCheckedRequiredArtifacts: verification.checkedRequiredArtifacts,
      verificationChecks: verification.checks
    };
  }));
  const repoFilter = optionalStringFlag(parsed.flags.repo, "repo");
  const repoRows = repoFilter ? rows.filter((row) => repoMatches(row.repo, repoFilter)) : rows;
  const createdFrom = optionalCreatedAtBoundFlag(parsed.flags["created-from"], "created-from", "start");
  const createdTo = optionalCreatedAtBoundFlag(parsed.flags["created-to"], "created-to", "end");
  validateCreatedAtRange(createdFrom, createdTo);
  const dateRows = rowsByCreatedAtRange(repoRows, createdFrom, createdTo);
  const level = learnerLevelFlag(parsed.flags.level);
  const levelRows = level === "all" ? dateRows : dateRows.filter((row) => row.level === level);
  const mode = studyModeFlag(parsed.flags.mode);
  const modeRows = mode === "all" ? levelRows : levelRows.filter((row) => row.mode === mode);
  const status = verificationStatusFlag(parsed.flags.status);
  const statusRows = status === "all" ? modeRows : modeRows.filter((row) => row.verificationStatus === status);
  const verifiedRows = parsed.flags["verified-only"] === true ? statusRows.filter((row) => row.verificationOk === true) : statusRows;
  const wrongRows = parsed.flags["wrong-only"] === true ? verifiedRows.filter((row) => row.wrong > 0) : verifiedRows;
  const quizRows = parsed.flags["unattempted-only"] === true
    ? wrongRows.filter((row) => row.score === null)
    : parsed.flags["scored-only"] === true
      ? wrongRows.filter((row) => row.score !== null)
      : wrongRows;
  const minScore = optionalScoreFlag(parsed.flags["min-score"], "min-score");
  const maxScore = optionalScoreFlag(parsed.flags["max-score"], "max-score");
  validateListFilterCombinations(parsed.flags, minScore, maxScore);
  const minScoreRows = minScore === null ? quizRows : quizRows.filter((row) => row.score !== null && row.score >= minScore);
  const scoreRows = maxScore === null ? minScoreRows : minScoreRows.filter((row) => row.score !== null && row.score <= maxScore);
  const htmlTargets = htmlTargetsFlag(parsed.flags["html-targets"]);
  const targetRows = htmlTargets === "all"
    ? scoreRows
    : scoreRows.filter((row) => htmlTargets === "complete" ? row.htmlTargetsComplete : !row.htmlTargetsComplete);
  const sort = listSortFlag(parsed.flags.sort);
  const sortedRows = sort ? sortSessionRows(targetRows, sort) : targetRows;
  const limit = optionalPositiveIntegerFlag(parsed.flags.limit, "limit");
  const filtered = limit === null ? sortedRows : sortedRows.slice(0, limit);
  const format = stringFlag(parsed.flags.format) ?? "json";
  const filters = listFilterManifest(parsed.flags, {
    repo: repoFilter,
    createdFrom: stringFlag(parsed.flags["created-from"]) ?? null,
    createdTo: stringFlag(parsed.flags["created-to"]) ?? null,
    mode,
    level,
    status,
    htmlTargets,
    sort,
    limit,
    minScore,
    maxScore
  });
  if (parsed.flags.summary === true) {
    if (parsed.flags.fields !== undefined || parsed.flags["field-preset"] !== undefined) throw new Error("list cannot combine --summary with --fields or --field-preset.");
    if (!["json", "markdown"].includes(format)) throw new Error("list --summary supports --format json or markdown.");
    const summary = listSummary(filtered);
    await emitListOutput(format === "markdown" ? listSummaryMarkdown(summary) : jsonText(summary), parsed.flags.output, parsed.flags["output-manifest"], {
      format,
      summary: true,
      rows: filtered.length,
      fields: null,
      fieldPreset: null,
      filters
    });
    return;
  }
  const fields = listFieldSelection(parsed.flags.fields, parsed.flags["field-preset"]);
  const outputFields = fields ?? (format === "csv" ? [...DEFAULT_LIST_CSV_FIELDS] : null);
  const projected = fields ? projectListRows(filtered, fields) : filtered;
  if (!["json", "markdown", "jsonl", "csv"].includes(format)) throw new Error("list supports --format json, markdown, jsonl, or csv.");
  let rendered: string;
  if (format === "markdown") {
    rendered = fields ? listFieldsMarkdown(projected, fields) : listMarkdown(filtered);
  } else if (format === "jsonl") {
    rendered = listJsonl(projected);
  } else if (format === "csv") {
    rendered = listCsv(filtered, fields ?? [...DEFAULT_LIST_CSV_FIELDS]);
  } else {
    rendered = jsonText(projected);
  }
  await emitListOutput(rendered, parsed.flags.output, parsed.flags["output-manifest"], {
    format,
    summary: false,
    rows: filtered.length,
    fields: outputFields,
    fieldPreset: stringFlag(parsed.flags["field-preset"]) ?? null,
    filters
  });
}

async function openSession(parsed: ParsedArgs): Promise<void> {
  if (parsed.flags["list-targets"] === true) {
    const format = stringFlag(parsed.flags.format) ?? "json";
    if (!["json", "markdown"].includes(format)) throw new Error("open --list-targets supports --format json or markdown.");
    const entries = openTargetEntries();
    console.log(format === "markdown" ? openTargetsMarkdown(entries) : JSON.stringify(entries, null, 2));
    return;
  }
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const target = stringFlag(parsed.flags.target) ?? "index";
  if (target === "all") {
    const format = stringFlag(parsed.flags.format) ?? "json";
    if (!["json", "markdown"].includes(format)) throw new Error("open --target all supports --format json or markdown.");
    const targetPaths = openTargetPaths(path.join(sessionRoot, "html"));
    for (const [targetName, filePath] of Object.entries(targetPaths)) {
      await assertReadableFile(filePath, `Open target file not found for ${targetName}: ${filePath}`);
    }
    console.log(format === "markdown" ? openTargetPathsMarkdown(targetPaths) : JSON.stringify(targetPaths, null, 2));
    return;
  }
  const fileName = openTargetFile(target);
  const htmlPath = path.join(sessionRoot, "html", fileName);
  await assertReadableFile(htmlPath, `Open target file not found: ${htmlPath}`);
  console.log(htmlPath);
}

async function doctor(parsed: ParsedArgs): Promise<void> {
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("doctor supports --format json or markdown.");
  const runtimeStudiesRoot = studiesRoot(parsed.flags);
  const payload: DoctorPayload = {
    ok: true,
    product: "RepoTutor Studio",
    commands: [...CLI_COMMANDS],
    defaultStudyCommand: true,
    formats: {
      study: ["json", "markdown"],
      quiz: ["json", "markdown"],
      resume: ["json", "markdown"],
      evidence: ["json", "markdown"],
      verifyExport: ["json", "markdown"],
      verifyEvidence: ["json", "markdown"],
      verifySession: ["json", "markdown"],
      verifyListOutput: ["json", "markdown"],
      list: ["json", "markdown", "jsonl", "csv"],
      openTargets: ["json", "markdown"],
      openAll: ["json", "markdown"],
      export: ["html", "zip"],
      exportSummary: ["json", "markdown"]
    },
    runtime: {
      cwd: process.cwd(),
      studiesRoot: runtimeStudiesRoot,
      initCwd: process.env.INIT_CWD ?? null,
      envStudiesRoot: process.env.REPOTUTOR_STUDIES_ROOT ?? null
    },
    runtimeOptions: {
      studiesRootFlag: true,
      envStudiesRoot: true,
      initCwdFallback: true
    },
    runtimeHealth: await doctorRuntimeHealth(runtimeStudiesRoot),
    listFilters: {
      level: ["beginner", "junior", "senior", "all"],
      mode: ["quick", "standard", "deep", "all"],
      status: ["passed", "failed", "missing", "all"],
      htmlTargets: ["complete", "missing", "all"],
      sort: ["newest", "oldest", "score-desc", "score-asc"],
      fields: [...LIST_FIELDS],
      fieldPresets: LIST_FIELD_PRESET_NAMES,
      summary: true,
      output: true,
      outputManifest: true,
      repo: true,
      createdFrom: true,
      createdTo: true,
      createdRangeValidation: true,
      verifiedOnly: true,
      wrongOnly: true,
      unattemptedOnly: true,
      scoredOnly: true,
      minScore: true,
      maxScore: true,
      filterConflictValidation: true,
      limit: true
    },
    openTargets: [...openTargetEntries().map((entry) => entry.target), "all"],
    modes: ["cli", "codex-skill", "tauri-sidecar"],
    security: {
      staticAnalysisDefault: true,
      arbitraryCommandExecution: false,
      secretExclusion: true
    }
  };
  if (format === "markdown") {
    console.log(doctorMarkdown(payload));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

async function doctorRuntimeHealth(studiesRootPath: string): Promise<Record<string, boolean>> {
  const studiesRootExists = await pathAccess(studiesRootPath, fsConstants.F_OK);
  return {
    studiesRootExists,
    studiesRootReadable: studiesRootExists && await pathAccess(studiesRootPath, fsConstants.R_OK),
    studiesRootWritable: studiesRootExists && await pathAccess(studiesRootPath, fsConstants.W_OK),
    studiesRootParentWritable: await pathAccess(path.dirname(studiesRootPath), fsConstants.W_OK)
  };
}

async function pathAccess(targetPath: string, mode: number): Promise<boolean> {
  try {
    await fs.access(targetPath, mode);
    return true;
  } catch {
    return false;
  }
}

async function resolveSessionRoot(value: string | undefined, flags: Record<string, string | boolean>): Promise<string> {
  if (value && value.includes(path.sep)) return path.resolve(value);
  const sessions = await listSessions(studiesRoot(flags));
  const match = sessions.find((session) => session.sessionId === value || session.repo === value);
  if (!match) throw new Error(`Session not found: ${value ?? "(missing)"}`);
  return match.outputPaths.root;
}

async function askAnswers(questions: Array<{ id: string; question: string; choices: Record<string, string> }>): Promise<Record<string, "A" | "B" | "C" | "D">> {
  const rl = readline.createInterface({ input, output });
  const answers: Record<string, "A" | "B" | "C" | "D"> = {};
  try {
    for (const question of questions) {
      console.log(`\n${question.question}`);
      for (const [key, value] of Object.entries(question.choices)) console.log(`${key}. ${value}`);
      let answer = "";
      while (!["A", "B", "C", "D"].includes(answer)) {
        answer = (await rl.question("Answer (A/B/C/D): ")).trim().toUpperCase();
      }
      answers[question.id] = answer as "A" | "B" | "C" | "D";
    }
  } finally {
    rl.close();
  }
  return answers;
}

function parseArgs(args: string[]): ParsedArgs {
  args = args.filter((arg) => arg !== "--");
  args = injectDefaultStudyCommand(args);
  const command = args[0] ?? "help";
  const rest: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[index + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        index += 1;
      } else {
        flags[key] = true;
      }
    } else {
      rest.push(arg);
    }
  }
  return { command, rest, flags };
}

function injectDefaultStudyCommand(args: string[]): string[] {
  if (args.length === 0) return args;
  const first = args[0];
  if (CLI_COMMAND_SET.has(first) || HELP_COMMANDS.has(first) || first.startsWith("-")) return args;
  return isStudyTargetCandidate(first) ? ["study", ...args] : args;
}

function isStudyTargetCandidate(value: string): boolean {
  return value.startsWith("http://")
    || value.startsWith("https://")
    || value.startsWith("git@")
    || value.startsWith("/")
    || value.startsWith(".")
    || value.includes("/")
    || value.endsWith(".git");
}

function flagEnum(value: string | boolean | undefined, allowed: string[], fallback: string): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

function stringFlag(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optionalStringFlag(value: string | boolean | undefined, name: string): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${name} must be a non-empty string.`);
  return value.trim();
}

function verifyListOutputReportPath(value: string | boolean | undefined, outputPath: string, format: string): string | null {
  if (value === undefined) return null;
  if (value === true) return `${outputPath}${format === "markdown" ? ".verification.md" : ".verification.json"}`;
  if (typeof value !== "string" || value.trim() === "") throw new Error("report must be a non-empty string.");
  return value.trim();
}

function numberFlag(value: string | boolean | undefined, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function optionalPositiveIntegerFlag(value: string | boolean | undefined, name: string): number | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error(`${name} must be a positive integer.`);
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

function optionalScoreFlag(value: string | boolean | undefined, name: string): number | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error(`${name} must be a number from 0 to 100.`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) throw new Error(`${name} must be a number from 0 to 100.`);
  return parsed;
}

function optionalCreatedAtBoundFlag(value: string | boolean | undefined, name: string, dateOnlyBoundary: "start" | "end"): number | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error(`${name} must be an ISO date or timestamp.`);
  const trimmed = value.trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T${dateOnlyBoundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`
    : trimmed;
  const parsed = Date.parse(normalized);
  if (Number.isNaN(parsed)) throw new Error(`${name} must be an ISO date or timestamp.`);
  return parsed;
}

function listFieldsFlag(value: string | boolean | undefined): ListField[] | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`fields must be a comma-separated list of: ${LIST_FIELDS.join(", ")}.`);
  const selected = value.split(",").map((field) => field.trim()).filter(Boolean);
  const fields: ListField[] = [];
  for (const field of selected) {
    if (!LIST_FIELD_SET.has(field)) throw new Error(`list supports --fields ${LIST_FIELDS.join(", ")}.`);
    if (!fields.includes(field as ListField)) fields.push(field as ListField);
  }
  if (fields.length === 0) throw new Error(`fields must be a comma-separated list of: ${LIST_FIELDS.join(", ")}.`);
  return fields;
}

function listFieldPresetFlag(value: string | boolean | undefined): ListField[] | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`field-preset must be one of: ${LIST_FIELD_PRESET_NAMES.join(", ")}.`);
  if (!LIST_FIELD_PRESET_NAMES.includes(value as keyof typeof LIST_FIELD_PRESETS)) {
    throw new Error(`list supports --field-preset ${LIST_FIELD_PRESET_NAMES.join(", ")}.`);
  }
  return [...LIST_FIELD_PRESETS[value as keyof typeof LIST_FIELD_PRESETS]];
}

function listFieldSelection(fieldsValue: string | boolean | undefined, presetValue: string | boolean | undefined): ListField[] | null {
  const fields = listFieldsFlag(fieldsValue);
  const preset = listFieldPresetFlag(presetValue);
  if (fields && preset) throw new Error("list cannot combine --fields and --field-preset.");
  return fields ?? preset;
}

function projectListRows(rows: ListRow[], fields: ListField[]): Array<Partial<ListRow>> {
  return rows.map((row) => Object.fromEntries(fields.map((field) => [field, row[field]])) as Partial<ListRow>);
}

function validateCreatedAtRange(createdFrom: number | null, createdTo: number | null): void {
  if (createdFrom !== null && createdTo !== null && createdFrom > createdTo) {
    throw new Error("created-from must be less than or equal to created-to.");
  }
}

function rowsByCreatedAtRange<T extends { createdAt: string }>(rows: T[], createdFrom: number | null, createdTo: number | null): T[] {
  if (createdFrom === null && createdTo === null) return rows;
  return rows.filter((row) => {
    const createdAt = Date.parse(row.createdAt);
    if (Number.isNaN(createdAt)) return false;
    if (createdFrom !== null && createdAt < createdFrom) return false;
    if (createdTo !== null && createdAt > createdTo) return false;
    return true;
  });
}

function validateListFilterCombinations(flags: Record<string, string | boolean>, minScore: number | null, maxScore: number | null): void {
  const unattemptedOnly = flags["unattempted-only"] === true;
  const scoredOnly = flags["scored-only"] === true;
  const wrongOnly = flags["wrong-only"] === true;
  const hasScoreRange = minScore !== null || maxScore !== null;
  if (unattemptedOnly && scoredOnly) throw new Error("list cannot combine --unattempted-only and --scored-only.");
  if (unattemptedOnly && wrongOnly) throw new Error("list cannot combine --unattempted-only and --wrong-only.");
  if (unattemptedOnly && hasScoreRange) throw new Error("list cannot combine --unattempted-only with score filters.");
  if (minScore !== null && maxScore !== null && minScore > maxScore) throw new Error("min-score must be less than or equal to max-score.");
}

function listFilterManifest(
  flags: Record<string, string | boolean>,
  values: Pick<ListFilterManifest, "repo" | "createdFrom" | "createdTo" | "mode" | "level" | "status" | "htmlTargets" | "sort" | "limit" | "minScore" | "maxScore">
): ListFilterManifest {
  return {
    ...values,
    verifiedOnly: flags["verified-only"] === true,
    wrongOnly: flags["wrong-only"] === true,
    unattemptedOnly: flags["unattempted-only"] === true,
    scoredOnly: flags["scored-only"] === true
  };
}

function verificationStatusFlag(value: string | boolean | undefined): "all" | "passed" | "failed" | "missing" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --status passed, failed, missing, or all.");
  if (["all", "passed", "failed", "missing"].includes(value)) return value as "all" | "passed" | "failed" | "missing";
  throw new Error("list supports --status passed, failed, missing, or all.");
}

function learnerLevelFlag(value: string | boolean | undefined): "all" | "beginner" | "junior" | "senior" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --level beginner, junior, senior, or all.");
  if (["all", "beginner", "junior", "senior"].includes(value)) return value as "all" | "beginner" | "junior" | "senior";
  throw new Error("list supports --level beginner, junior, senior, or all.");
}

function studyModeFlag(value: string | boolean | undefined): "all" | "quick" | "standard" | "deep" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --mode quick, standard, deep, or all.");
  if (["all", "quick", "standard", "deep"].includes(value)) return value as "all" | "quick" | "standard" | "deep";
  throw new Error("list supports --mode quick, standard, deep, or all.");
}

function htmlTargetsFlag(value: string | boolean | undefined): "all" | "complete" | "missing" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --html-targets complete, missing, or all.");
  if (["all", "complete", "missing"].includes(value)) return value as "all" | "complete" | "missing";
  throw new Error("list supports --html-targets complete, missing, or all.");
}

function repoMatches(repo: string, filter: string): boolean {
  const normalizedRepo = repo.toLowerCase();
  const normalizedFilter = filter.toLowerCase();
  return normalizedRepo === normalizedFilter || normalizedRepo.endsWith(`/${normalizedFilter}`);
}

function listSortFlag(value: string | boolean | undefined): "newest" | "oldest" | "score-desc" | "score-asc" | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error("list supports --sort newest, oldest, score-desc, or score-asc.");
  if (["newest", "oldest", "score-desc", "score-asc"].includes(value)) return value as "newest" | "oldest" | "score-desc" | "score-asc";
  throw new Error("list supports --sort newest, oldest, score-desc, or score-asc.");
}

function sortSessionRows<T extends { createdAt: string; sessionId: string; score: number | null }>(rows: T[], direction: "newest" | "oldest" | "score-desc" | "score-asc"): T[] {
  if (direction === "score-desc" || direction === "score-asc") {
    const multiplier = direction === "score-desc" ? -1 : 1;
    return [...rows].sort((left, right) => {
      if (left.score === null && right.score === null) return right.createdAt.localeCompare(left.createdAt) || left.sessionId.localeCompare(right.sessionId);
      if (left.score === null) return 1;
      if (right.score === null) return -1;
      const scoreDelta = (left.score - right.score) * multiplier;
      return scoreDelta || right.createdAt.localeCompare(left.createdAt) || left.sessionId.localeCompare(right.sessionId);
    });
  }
  const multiplier = direction === "newest" ? -1 : 1;
  return [...rows].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt);
    const rightTime = Date.parse(right.createdAt);
    const timeDelta = (leftTime - rightTime) * multiplier;
    return timeDelta || left.sessionId.localeCompare(right.sessionId);
  });
}

async function assertReadableFile(filePath: string, message: string): Promise<void> {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error(message);
  } catch {
    throw new Error(message);
  }
}

async function readableFileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function htmlTargetStatus(targets: Record<string, string>): Promise<Record<string, boolean>> {
  const statuses = await Promise.all(
    Object.entries(targets).map(async ([target, filePath]) => [target, await readableFileExists(filePath)] as const)
  );
  return Object.fromEntries(statuses);
}

function studyMarkdown(payload: {
  sessionId: string;
  status: string;
  path: string;
  html: string;
  verificationOk: boolean;
  verificationReport: string;
  verificationMarkdown: string;
  verificationHtml: string;
  verificationCheckedRequiredArtifacts: number;
  verificationChecks: Record<string, boolean>;
  quizQuestions: number;
}): string {
  const checks = Object.entries(payload.verificationChecks)
    .map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`)
    .join("\n");
  return [
    "# RepoTutor Study",
    "",
    `- Session ID: ${payload.sessionId}`,
    `- Status: ${payload.status}`,
    `- Root: ${payload.path}`,
    `- Main HTML: ${payload.html}`,
    `- Verification OK: ${payload.verificationOk}`,
    `- Verification report: ${payload.verificationReport}`,
    `- Verification markdown: ${payload.verificationMarkdown}`,
    `- Verification HTML: ${payload.verificationHtml}`,
    `- Required artifacts checked: ${payload.verificationCheckedRequiredArtifacts}`,
    `- Quiz questions: ${payload.quizQuestions}`,
    "",
    "## Verification Checks",
    "",
    checks
  ].join("\n");
}

function exportSummaryMarkdown(payload: {
  exported: string;
  path: string;
  html: string;
  readme: string;
  manifest: string;
  pages: number;
  assets: number;
  integrityOk: boolean;
  integrityCheckedFiles: number;
  zipBytes: number | null;
  zipFiles: number | null;
  entrypoints: Array<{ label: string; path: string }>;
}): string {
  const entrypoints = payload.entrypoints
    .map((entry) => `- ${entry.label}: ${entry.path}`)
    .join("\n");
  return [
    "# RepoTutor Export",
    "",
    `- Exported: ${payload.exported}`,
    `- Path: ${payload.path}`,
    `- Main HTML: ${payload.html}`,
    `- README: ${payload.readme}`,
    `- Manifest: ${payload.manifest}`,
    `- Pages: ${payload.pages}`,
    `- Assets: ${payload.assets}`,
    `- Integrity OK: ${payload.integrityOk}`,
    `- Integrity checked files: ${payload.integrityCheckedFiles}`,
    `- ZIP bytes: ${payload.zipBytes ?? "none"}`,
    `- ZIP files: ${payload.zipFiles ?? "none"}`,
    "",
    "## Entry Points",
    "",
    entrypoints || "- none"
  ].join("\n");
}

function evidenceMarkdown(payload: {
  sessionRoot: string;
  totalEvidenceItems: number;
  evidenceByKind: Record<string, number>;
  filteredKind: string | null;
  filteredFile: string | null;
  returnedItems: number;
  items: Array<{ filePath: string; line: number; kind: string; snippet: string; sourceHref: string; lessonHref: string }>;
}): string {
  const filters = [
    payload.filteredKind ? `kind=${payload.filteredKind}` : null,
    payload.filteredFile ? `file=${payload.filteredFile}` : null
  ].filter(Boolean).join(", ") || "none";
  return [
    "# RepoTutor Evidence",
    "",
    `- Session: ${payload.sessionRoot}`,
    `- Total evidence items: ${payload.totalEvidenceItems}`,
    `- Returned items: ${payload.returnedItems}`,
    `- Filters: ${filters}`,
    `- Kinds: ${Object.entries(payload.evidenceByKind).map(([kind, count]) => `${kind} ${count}`).join(", ") || "none"}`,
    "",
    ...payload.items.map((item) => `## ${item.filePath}:L${item.line}\n\n- Kind: ${item.kind}\n- Lesson: ${item.lessonHref}\n- Source: ${item.sourceHref}\n\n\`${item.snippet.replaceAll("`", "'")}\`\n`)
  ].join("\n");
}

function quizAttemptMarkdown(payload: {
  attemptId: string;
  score: number;
  correct: number;
  wrong: number;
  wrongNotes: string;
}): string {
  return [
    "# RepoTutor Quiz Attempt",
    "",
    `- Attempt ID: ${payload.attemptId}`,
    `- Score: ${payload.score}`,
    `- Correct: ${payload.correct}`,
    `- Wrong: ${payload.wrong}`,
    `- Wrong notes: ${payload.wrongNotes}`
  ].join("\n");
}

function resumeMarkdown(payload: {
  sessionId: string;
  repo: string;
  mode: string;
  level: string;
  root: string;
  html: string;
  htmlTargets: Record<string, string>;
  htmlTargetStatus: Record<string, boolean>;
  verificationStatus: string;
  verificationOk: boolean | null;
  verificationReport: string;
  verificationMarkdown: string;
  verificationHtml: string;
  verificationCheckedRequiredArtifacts: number | null;
  verificationChecks: Record<string, boolean> | null;
}): string {
  const verificationChecks = payload.verificationChecks
    ? Object.entries(payload.verificationChecks).map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`).join("\n")
    : "- none";
  const targets = Object.entries(payload.htmlTargets)
    .map(([target, filePath]) => `- ${target}: ${filePath}`)
    .join("\n");
  const targetStatus = Object.entries(payload.htmlTargetStatus)
    .map(([target, exists]) => `- ${target}: ${exists ? "present" : "missing"}`)
    .join("\n");
  return [
    "# RepoTutor Resume",
    "",
    `- Session ID: ${payload.sessionId}`,
    `- Repo: ${payload.repo}`,
    `- Study mode: ${payload.mode}`,
    `- Learner level: ${payload.level}`,
    `- Root: ${payload.root}`,
    `- Main HTML: ${payload.html}`,
    `- Verification status: ${payload.verificationStatus}`,
    `- Verification OK: ${payload.verificationOk === null ? "unknown" : String(payload.verificationOk)}`,
    `- Required artifacts checked: ${payload.verificationCheckedRequiredArtifacts ?? "unknown"}`,
    `- Verification report: ${payload.verificationReport}`,
    `- Verification markdown: ${payload.verificationMarkdown}`,
    `- Verification HTML: ${payload.verificationHtml}`,
    "",
    "## HTML Targets",
    "",
    targets,
    "",
    "## HTML Target Status",
    "",
    targetStatus,
    "",
    "## Verification Checks",
    "",
    verificationChecks
  ].join("\n");
}

function listMarkdown(rows: Array<{
  sessionId: string;
  repo: string;
  createdAt: string;
  mode: string;
  level: string;
  score: number | null;
  wrong: number;
  path: string;
  html: string;
  htmlTargetsComplete: boolean;
  missingHtmlTargets: string[];
  verificationStatus: string;
  verificationOk: boolean | null;
  verificationHtml: string;
}>): string {
  const body = rows.length === 0
    ? "_No sessions found._"
    : [
      "| Session | Repo | Created | Mode | Level | Score | Wrong | Verification | HTML Targets | Session Path | HTML |",
      "|---|---|---|---|---|---:|---:|---|---|---|---|",
      ...rows.map((row) => [
        row.sessionId,
        row.repo,
        row.createdAt,
        row.mode,
        row.level,
        row.score === null ? "none" : String(row.score),
        String(row.wrong),
        row.verificationStatus,
        row.htmlTargetsComplete ? "complete" : `missing: ${row.missingHtmlTargets.join(", ")}`,
        row.path,
        row.html
      ].map(markdownTableCell).join(" | "))
        .map((line) => `| ${line} |`)
    ].join("\n");
  return [
    "# RepoTutor Sessions",
    "",
    `- Returned sessions: ${rows.length}`,
    "",
    body
  ].join("\n");
}

function listJsonl(rows: unknown[]): string {
  return rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length > 0 ? "\n" : "");
}

async function emitListOutput(
  text: string,
  outputValue: string | boolean | undefined,
  outputManifestValue: string | boolean | undefined,
  context: ListOutputContext
): Promise<void> {
  const outputFile = optionalStringFlag(outputValue, "output");
  const normalizedText = text.endsWith("\n") ? text : `${text}\n`;
  if (outputFile === null) {
    if (outputManifestValue !== undefined) throw new Error("list requires --output when --output-manifest is used.");
    process.stdout.write(normalizedText);
    return;
  }
  const outputPath = path.resolve(outputFile);
  const manifestPath = outputManifestPath(outputManifestValue, outputPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, normalizedText);
  if (manifestPath !== null) {
    const manifest = createListOutputManifest(normalizedText, outputPath, manifestPath, context);
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(manifestPath, jsonText(manifest));
    process.stdout.write(jsonText({ outputPath, manifestPath }));
    return;
  }
  console.log(outputPath);
}

function jsonText(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function emitVerifyListOutputReport(text: string, reportValue: string | boolean | undefined, outputPath: string, format: string): Promise<void> {
  const reportFile = verifyListOutputReportPath(reportValue, outputPath, format);
  const normalizedText = text.endsWith("\n") ? text : `${text}\n`;
  if (reportFile === null) {
    process.stdout.write(normalizedText);
    return;
  }
  const reportPath = path.resolve(reportFile);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, normalizedText);
  console.log(reportPath);
}

function outputManifestPath(value: string | boolean | undefined, outputPath: string): string | null {
  if (value === undefined) return null;
  if (value === true) return `${outputPath}.manifest.json`;
  if (typeof value !== "string") throw new Error("output-manifest must be a non-empty manifest path.");
  if (value.trim() === "") throw new Error("output-manifest must be a non-empty manifest path.");
  return path.resolve(value.trim());
}

function createListOutputManifest(text: string, outputPath: string, manifestPath: string, context: ListOutputContext): ListOutputManifest {
  return {
    schemaVersion: LIST_OUTPUT_MANIFEST_SCHEMA_VERSION,
    outputPath,
    manifestPath,
    format: context.format,
    summary: context.summary,
    rows: context.rows,
    fields: context.fields,
    fieldPreset: context.fieldPreset,
    filters: context.filters,
    bytes: Buffer.byteLength(text),
    sha256: createHash("sha256").update(text).digest("hex"),
    createdAt: new Date().toISOString()
  };
}

async function verifyListOutputManifest(outputPath: string, manifestPath: string): Promise<ListOutputVerification> {
  const failures: ListOutputVerification["failures"] = [];
  let manifest: Partial<ListOutputManifest> | null = null;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as Partial<ListOutputManifest>;
  } catch {
    failures.push({
      reason: "manifest-read-failed",
      path: manifestPath,
      expected: "readable JSON manifest",
      actual: null
    });
  }

  const expectedBytes = typeof manifest?.bytes === "number" ? manifest.bytes : null;
  const expectedSha256 = typeof manifest?.sha256 === "string" ? manifest.sha256 : null;
  const schemaVersion = typeof manifest?.schemaVersion === "number" ? manifest.schemaVersion : null;
  const supportedSchemaVersion = schemaVersion === null || schemaVersion === LIST_OUTPUT_MANIFEST_SCHEMA_VERSION;
  const format = typeof manifest?.format === "string" ? manifest.format : null;
  const summary = typeof manifest?.summary === "boolean" ? manifest.summary : null;
  const rows = typeof manifest?.rows === "number" ? manifest.rows : null;
  const fields = Array.isArray(manifest?.fields) && manifest.fields.every((field) => typeof field === "string")
    ? manifest.fields
    : null;

  if (manifest) {
    if (manifest.outputPath !== outputPath) {
      failures.push({ reason: "output-path-mismatch", path: manifestPath, expected: outputPath, actual: manifest.outputPath ?? null });
    }
    if (manifest.manifestPath !== manifestPath) {
      failures.push({ reason: "manifest-path-mismatch", path: manifestPath, expected: manifestPath, actual: manifest.manifestPath ?? null });
    }
    if (format === null) failures.push({ reason: "format-missing", path: manifestPath, expected: "string", actual: null });
    if (summary === null) failures.push({ reason: "summary-missing", path: manifestPath, expected: "boolean", actual: null });
    if (rows === null) failures.push({ reason: "rows-missing", path: manifestPath, expected: "number", actual: null });
    if (expectedBytes === null) failures.push({ reason: "bytes-missing", path: manifestPath, expected: "number", actual: null });
    if (expectedSha256 === null) failures.push({ reason: "sha256-missing", path: manifestPath, expected: "string", actual: null });
    if (!supportedSchemaVersion) {
      failures.push({ reason: "unsupported-schema-version", path: manifestPath, expected: LIST_OUTPUT_MANIFEST_SCHEMA_VERSION, actual: schemaVersion });
    }
  }

  let actualBytes: number | null = null;
  let actualSha256: string | null = null;
  let actualRows: number | null = null;
  let actualFields: string[] | null = null;
  try {
    const outputText = await fs.readFile(outputPath, "utf8");
    actualBytes = Buffer.byteLength(outputText);
    actualSha256 = createHash("sha256").update(outputText).digest("hex");
    actualRows = listOutputRowCount(outputText, format, summary);
    actualFields = listOutputFields(outputText, format, summary);
  } catch {
    if (actualBytes !== null) {
      failures.push({
        reason: "output-format-parse-failed",
        path: outputPath,
        expected: format ?? "known list format",
        actual: null
      });
    }
  }
  if (actualBytes === null) {
    try {
      await fs.access(outputPath);
    } catch {
      failures.push({
        reason: "output-read-failed",
        path: outputPath,
        expected: "readable output file",
        actual: null
      });
    }
  }

  if (rows !== null && actualRows !== null && rows !== actualRows) {
    failures.push({ reason: "rows-mismatch", path: outputPath, expected: rows, actual: actualRows });
  }
  if (fields !== null && actualFields !== null && fieldListKey(fields) !== fieldListKey(actualFields)) {
    failures.push({ reason: "fields-mismatch", path: outputPath, expected: fieldListKey(fields), actual: fieldListKey(actualFields) });
  }

  if (expectedBytes !== null && actualBytes !== null && expectedBytes !== actualBytes) {
    failures.push({ reason: "bytes-mismatch", path: outputPath, expected: expectedBytes, actual: actualBytes });
  }
  if (expectedSha256 !== null && actualSha256 !== null && expectedSha256 !== actualSha256) {
    failures.push({ reason: "sha256-mismatch", path: outputPath, expected: expectedSha256, actual: actualSha256 });
  }

  return {
    ok: failures.length === 0,
    outputPath,
    manifestPath,
    schemaVersion,
    supportedSchemaVersion,
    format,
    summary,
    rows,
    actualRows,
    fields,
    actualFields,
    expectedBytes,
    actualBytes,
    expectedSha256,
    actualSha256,
    failures
  };
}

function listOutputRowCount(text: string, format: string | null, summary: boolean | null): number | null {
  if (summary === true) return null;
  if (format === "json") {
    const parsed = JSON.parse(text) as unknown;
    return Array.isArray(parsed) ? parsed.length : null;
  }
  if (format === "jsonl") {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    for (const line of lines) JSON.parse(line);
    return lines.length;
  }
  if (format === "csv") {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    return Math.max(0, lines.length - 1);
  }
  return null;
}

function listOutputFields(text: string, format: string | null, summary: boolean | null): string[] | null {
  if (summary === true) return null;
  if (format === "json") {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return null;
    const first = parsed[0] as unknown;
    return first && typeof first === "object" && !Array.isArray(first) ? Object.keys(first) : [];
  }
  if (format === "jsonl") {
    const firstLine = text.split("\n").find((line) => line.trim() !== "");
    if (!firstLine) return [];
    const first = JSON.parse(firstLine) as unknown;
    return first && typeof first === "object" && !Array.isArray(first) ? Object.keys(first) : null;
  }
  if (format === "csv") {
    const header = text.split("\n").find((line) => line.trim() !== "");
    return header ? header.split(",") : [];
  }
  return null;
}

function fieldListKey(fields: readonly string[]): string {
  return fields.join(",");
}

function listSummary(rows: ListRow[]): ListSummary {
  const scores = rows.map((row) => row.score).filter((score): score is number => score !== null);
  return {
    total: rows.length,
    verificationStatus: countBy(rows, (row) => row.verificationStatus),
    modes: countBy(rows, (row) => row.mode),
    levels: countBy(rows, (row) => row.level),
    htmlTargets: {
      complete: rows.filter((row) => row.htmlTargetsComplete).length,
      missing: rows.filter((row) => !row.htmlTargetsComplete).length
    },
    quiz: {
      scored: scores.length,
      unattempted: rows.length - scores.length,
      wrong: rows.filter((row) => row.wrong > 0).length,
      averageScore: scores.length === 0 ? null : Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)),
      minScore: scores.length === 0 ? null : Math.min(...scores),
      maxScore: scores.length === 0 ? null : Math.max(...scores)
    },
    repos: countBy(rows, (row) => row.repo)
  };
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const value = key(item);
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function listSummaryMarkdown(summary: ListSummary): string {
  return [
    "# RepoTutor Session Summary",
    "",
    `- Total sessions: ${summary.total}`,
    `- HTML targets complete: ${summary.htmlTargets.complete}`,
    `- HTML targets missing: ${summary.htmlTargets.missing}`,
    `- Scored sessions: ${summary.quiz.scored}`,
    `- Unattempted sessions: ${summary.quiz.unattempted}`,
    `- Wrong-answer sessions: ${summary.quiz.wrong}`,
    `- Average score: ${summary.quiz.averageScore ?? "none"}`,
    `- Min score: ${summary.quiz.minScore ?? "none"}`,
    `- Max score: ${summary.quiz.maxScore ?? "none"}`,
    "",
    "## Verification Status",
    "",
    countMarkdown(summary.verificationStatus),
    "",
    "## Modes",
    "",
    countMarkdown(summary.modes),
    "",
    "## Levels",
    "",
    countMarkdown(summary.levels),
    "",
    "## Repositories",
    "",
    countMarkdown(summary.repos)
  ].join("\n");
}

function countMarkdown(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort(([left], [right]) => left.localeCompare(right));
  return entries.length === 0 ? "- none" : entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function listFieldsMarkdown(rows: Array<Partial<ListRow>>, fields: ListField[]): string {
  const body = rows.length === 0
    ? "_No sessions found._"
    : [
      `| ${fields.map(markdownTableCell).join(" | ")} |`,
      `| ${fields.map(() => "---").join(" | ")} |`,
      ...rows.map((row) => `| ${fields.map((field) => markdownTableCell(listFieldDisplayValue(row[field]))).join(" | ")} |`)
    ].join("\n");
  return [
    "# RepoTutor Sessions",
    "",
    `- Returned sessions: ${rows.length}`,
    `- Fields: ${fields.join(", ")}`,
    "",
    body
  ].join("\n");
}

function listCsv(rows: ListRow[], fields: readonly ListField[]): string {
  const lines = rows.map((row) => fields.map((field) => csvCell(listFieldCsvValue(row[field]))).join(","));
  return [fields.join(","), ...lines].join("\n") + "\n";
}

function listFieldDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return "none";
  if (Array.isArray(value)) return value.length === 0 ? "none" : value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function listFieldCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(String).join(";");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function doctorMarkdown(payload: DoctorPayload): string {
  const formats = Object.entries(payload.formats)
    .map(([command, values]) => `- ${command}: ${values.join(", ")}`)
    .join("\n");
  const runtime = [
    `- cwd: ${payload.runtime.cwd}`,
    `- studiesRoot: ${payload.runtime.studiesRoot}`,
    `- initCwd: ${payload.runtime.initCwd ?? "none"}`,
    `- envStudiesRoot: ${payload.runtime.envStudiesRoot ?? "none"}`
  ].join("\n");
  const filters = Object.entries(payload.listFilters)
    .map(([name, value]) => `- ${name}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join("\n");
  const runtimeOptions = Object.entries(payload.runtimeOptions)
    .map(([name, ok]) => `- ${name}: ${ok ? "true" : "false"}`)
    .join("\n");
  const runtimeHealth = Object.entries(payload.runtimeHealth)
    .map(([name, ok]) => `- ${name}: ${ok ? "true" : "false"}`)
    .join("\n");
  const security = Object.entries(payload.security)
    .map(([name, ok]) => `- ${name}: ${ok ? "true" : "false"}`)
    .join("\n");
  return [
    "# RepoTutor Doctor",
    "",
    `- Product: ${payload.product}`,
    `- OK: ${String(payload.ok)}`,
    `- Modes: ${payload.modes.join(", ")}`,
    `- Commands: ${payload.commands.join(", ")}`,
    `- Default study command: ${payload.defaultStudyCommand ? "enabled" : "disabled"}`,
    `- Open targets: ${payload.openTargets.join(", ")}`,
    "",
    "## Formats",
    "",
    formats,
    "",
    "## Runtime",
    "",
    runtime,
    "",
    "## Runtime Options",
    "",
    runtimeOptions,
    "",
    "## Runtime Health",
    "",
    runtimeHealth,
    "",
    "## List Filters",
    "",
    filters,
    "",
    "## Security",
    "",
    security
  ].join("\n");
}

function openTargetsMarkdown(entries: Array<{ target: string; fileName: string }>): string {
  return [
    "# RepoTutor Open Targets",
    "",
    "| Target | File |",
    "|---|---|",
    ...entries.map((entry) => `| ${markdownTableCell(entry.target)} | ${markdownTableCell(entry.fileName)} |`)
  ].join("\n");
}

function openTargetPathsMarkdown(paths: Record<string, string>): string {
  return [
    "# RepoTutor Open Target Paths",
    "",
    "| Target | Path |",
    "|---|---|",
    ...Object.entries(paths).map(([target, filePath]) => `| ${markdownTableCell(target)} | ${markdownTableCell(filePath)} |`)
  ].join("\n");
}

function exportVerificationMarkdown(payload: {
  ok: boolean;
  manifestPath: string;
  checkedFiles: number;
  failures: Array<{
    path: string;
    expectedBytes: number;
    actualBytes: number | null;
    expectedSha256: string;
    actualSha256: string | null;
  }>;
}): string {
  const failures = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => [
      `- ${failure.path}`,
      `  - Expected bytes: ${failure.expectedBytes}`,
      `  - Actual bytes: ${failure.actualBytes ?? "missing"}`,
      `  - Expected sha256: ${failure.expectedSha256}`,
      `  - Actual sha256: ${failure.actualSha256 ?? "missing"}`
    ].join("\n")).join("\n");
  return [
    "# RepoTutor Export Verification",
    "",
    `- OK: ${payload.ok ? "PASS" : "FAIL"}`,
    `- Manifest: ${payload.manifestPath}`,
    `- Checked files: ${payload.checkedFiles}`,
    "",
    "## Failures",
    "",
    failures
  ].join("\n");
}

function evidenceVerificationMarkdown(payload: {
  ok: boolean;
  reportPath: string;
  checkedItems: number;
  checkedSourceFiles: number;
  checkedSourceLinks: number;
  checkedLessonLinks: number;
  failures: Array<{
    reason: string;
    path: string;
    filePath?: string;
    line?: number;
    detail?: string;
  }>;
}): string {
  const failures = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => [
      `- ${failure.reason}: ${failure.path}`,
      failure.filePath ? `  - File: ${failure.filePath}` : null,
      failure.line === undefined ? null : `  - Line: ${failure.line}`,
      failure.detail ? `  - Detail: ${failure.detail}` : null
    ].filter(Boolean).join("\n")).join("\n");
  return [
    "# RepoTutor Evidence Verification",
    "",
    `- OK: ${payload.ok ? "PASS" : "FAIL"}`,
    `- Report: ${payload.reportPath}`,
    `- Checked items: ${payload.checkedItems}`,
    `- Checked source files: ${payload.checkedSourceFiles}`,
    `- Checked source links: ${payload.checkedSourceLinks}`,
    `- Checked lesson links: ${payload.checkedLessonLinks}`,
    "",
    "## Failures",
    "",
    failures
  ].join("\n");
}

function listOutputVerificationMarkdown(payload: ListOutputVerification): string {
  const failures = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => [
      `- ${failure.reason}: ${failure.path}`,
      `  - Expected: ${failure.expected ?? "none"}`,
      `  - Actual: ${failure.actual ?? "none"}`
    ].join("\n")).join("\n");
  return [
    "# RepoTutor List Output Verification",
    "",
    `- OK: ${payload.ok ? "PASS" : "FAIL"}`,
    `- Output: ${payload.outputPath}`,
    `- Manifest: ${payload.manifestPath}`,
    `- Schema version: ${payload.schemaVersion ?? "unknown"}`,
    `- Supported schema version: ${payload.supportedSchemaVersion ? "yes" : "no"}`,
    `- Format: ${payload.format ?? "unknown"}`,
    `- Summary: ${payload.summary ?? "unknown"}`,
    `- Rows: ${payload.rows ?? "unknown"}`,
    `- Actual rows: ${payload.actualRows ?? "unknown"}`,
    `- Fields: ${payload.fields ? fieldListKey(payload.fields) : "unknown"}`,
    `- Actual fields: ${payload.actualFields ? fieldListKey(payload.actualFields) : "unknown"}`,
    `- Expected bytes: ${payload.expectedBytes ?? "unknown"}`,
    `- Actual bytes: ${payload.actualBytes ?? "missing"}`,
    `- Expected sha256: ${payload.expectedSha256 ?? "unknown"}`,
    `- Actual sha256: ${payload.actualSha256 ?? "missing"}`,
    "",
    "## Failures",
    "",
    failures
  ].join("\n");
}

function markdownTableCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

async function sessionVerificationSummary(sessionRoot: string): Promise<{
  status: "passed" | "failed" | "missing";
  ok: boolean | null;
  reportPath: string;
  markdownPath: string;
  htmlPath: string;
  checkedRequiredArtifacts: number | null;
  checks: Record<string, boolean> | null;
}> {
  const reportPath = path.join(sessionRoot, "analysis", "session-verification-report.json");
  try {
    const report = JSON.parse(await fs.readFile(reportPath, "utf8")) as {
      ok: boolean;
      checkedRequiredArtifacts: number;
      checks: Record<string, boolean>;
    };
    return {
      status: report.ok ? "passed" : "failed",
      ok: report.ok,
      reportPath,
      markdownPath: path.join(sessionRoot, "markdown", "session-verification.md"),
      htmlPath: path.join(sessionRoot, "html", "session-verification.html"),
      checkedRequiredArtifacts: report.checkedRequiredArtifacts,
      checks: report.checks
    };
  } catch {
    return {
      status: "missing",
      ok: null,
      reportPath,
      markdownPath: path.join(sessionRoot, "markdown", "session-verification.md"),
      htmlPath: path.join(sessionRoot, "html", "session-verification.html"),
      checkedRequiredArtifacts: null,
      checks: null
    };
  }
}

function openTargetFile(target: string): string {
  const targets = Object.fromEntries(openTargetEntries().map((entry) => [entry.target, entry.fileName]));
  const fileName = targets[target];
  if (!fileName) throw new Error(`Unsupported open target: ${target}`);
  return fileName;
}

function openTargetEntries(): Array<{ target: string; fileName: string }> {
  return [
    { target: "index", fileName: "index.html" },
    { target: "overview", fileName: "overview.html" },
    { target: "learning-path", fileName: "learning-path.html" },
    { target: "language", fileName: "language.html" },
    { target: "architecture", fileName: "architecture.html" },
    { target: "folders", fileName: "folders.html" },
    { target: "files", fileName: "files.html" },
    { target: "evidence", fileName: "evidence.html" },
    { target: "suggested-reads", fileName: "suggested-reads.html" },
    { target: "runtime-environment", fileName: "runtime-environment.html" },
    { target: "interface-map", fileName: "interface-map.html" },
    { target: "symbol-map", fileName: "symbol-map.html" },
    { target: "api-reference", fileName: "api-reference.html" },
    { target: "search-index", fileName: "search-index.html" },
    { target: "learning-journal", fileName: "learning-journal.html" },
    { target: "project-activity", fileName: "project-activity.html" },
    { target: "code-metrics-readiness", fileName: "code-metrics-readiness.html" },
    { target: "code-ownership-readiness", fileName: "code-ownership-readiness.html" },
    { target: "large-asset-readiness", fileName: "large-asset-readiness.html" },
    { target: "license-rights", fileName: "license-rights.html" },
    { target: "sbom", fileName: "sbom.html" },
    { target: "security-readiness", fileName: "security-readiness.html" },
    { target: "scorecard", fileName: "scorecard.html" },
    { target: "provenance", fileName: "provenance.html" },
    { target: "advisories", fileName: "advisories.html" },
    { target: "vex", fileName: "vex.html" },
    { target: "policy-gates", fileName: "policy-gates.html" },
    { target: "api-contracts", fileName: "api-contracts.html" },
    { target: "consumer-contract-readiness", fileName: "consumer-contract-readiness.html" },
    { target: "observability", fileName: "observability.html" },
    { target: "performance", fileName: "performance.html" },
    { target: "load-testing-readiness", fileName: "load-testing-readiness.html" },
    { target: "benchmark-readiness", fileName: "benchmark-readiness.html" },
    { target: "e2e", fileName: "e2e.html" },
    { target: "flaky-test-readiness", fileName: "flaky-test-readiness.html" },
    { target: "test-impact-readiness", fileName: "test-impact-readiness.html" },
    { target: "test-reporting-readiness", fileName: "test-reporting-readiness.html" },
    { target: "snapshot-readiness", fileName: "snapshot-readiness.html" },
    { target: "property-based-testing-readiness", fileName: "property-based-testing-readiness.html" },
    { target: "test-data-readiness", fileName: "test-data-readiness.html" },
    { target: "integration-test-environment-readiness", fileName: "integration-test-environment-readiness.html" },
    { target: "chaos-engineering-readiness", fileName: "chaos-engineering-readiness.html" },
    { target: "accessibility", fileName: "accessibility.html" },
    { target: "storybook", fileName: "storybook.html" },
    { target: "design-tokens", fileName: "design-tokens.html" },
    { target: "i18n", fileName: "i18n.html" },
    { target: "release-readiness", fileName: "release-readiness.html" },
    { target: "secret-readiness", fileName: "secret-readiness.html" },
    { target: "secret-management-readiness", fileName: "secret-management-readiness.html" },
    { target: "container-readiness", fileName: "container-readiness.html" },
    { target: "code-quality", fileName: "code-quality.html" },
    { target: "documentation", fileName: "documentation.html" },
    { target: "database-readiness", fileName: "database-readiness.html" },
    { target: "database-migration-readiness", fileName: "database-migration-readiness.html" },
    { target: "database-orm-readiness", fileName: "database-orm-readiness.html" },
    { target: "data-quality-readiness", fileName: "data-quality-readiness.html" },
    { target: "data-lineage-readiness", fileName: "data-lineage-readiness.html" },
    { target: "data-catalog-readiness", fileName: "data-catalog-readiness.html" },
    { target: "data-annotation-readiness", fileName: "data-annotation-readiness.html" },
    { target: "lakehouse-table-readiness", fileName: "lakehouse-table-readiness.html" },
    { target: "feature-store-readiness", fileName: "feature-store-readiness.html" },
    { target: "model-registry-readiness", fileName: "model-registry-readiness.html" },
    { target: "experiment-tracking-readiness", fileName: "experiment-tracking-readiness.html" },
    { target: "model-monitoring-readiness", fileName: "model-monitoring-readiness.html" },
    { target: "model-serving-readiness", fileName: "model-serving-readiness.html" },
    { target: "model-training-readiness", fileName: "model-training-readiness.html" },
    { target: "ci-cd", fileName: "ci-cd.html" },
    { target: "unit-tests", fileName: "unit-tests.html" },
    { target: "coverage-readiness", fileName: "coverage-readiness.html" },
    { target: "mutation-testing-readiness", fileName: "mutation-testing-readiness.html" },
    { target: "typecheck-readiness", fileName: "typecheck-readiness.html" },
    { target: "package-manager", fileName: "package-manager.html" },
    { target: "git-hooks", fileName: "git-hooks.html" },
    { target: "task-runner", fileName: "task-runner.html" },
    { target: "dependency-updates", fileName: "dependency-updates.html" },
    { target: "lint-readiness", fileName: "lint-readiness.html" },
    { target: "format-readiness", fileName: "format-readiness.html" },
    { target: "commit-conventions", fileName: "commit-conventions.html" },
    { target: "changelog-readiness", fileName: "changelog-readiness.html" },
    { target: "bundle-analysis", fileName: "bundle-analysis.html" },
    { target: "mocking-readiness", fileName: "mocking-readiness.html" },
    { target: "data-fetching-readiness", fileName: "data-fetching-readiness.html" },
    { target: "routing-readiness", fileName: "routing-readiness.html" },
    { target: "state-management-readiness", fileName: "state-management-readiness.html" },
    { target: "form-readiness", fileName: "form-readiness.html" },
    { target: "auth-readiness", fileName: "auth-readiness.html" },
    { target: "authorization-readiness", fileName: "authorization-readiness.html" },
    { target: "payment-readiness", fileName: "payment-readiness.html" },
    { target: "email-readiness", fileName: "email-readiness.html" },
    { target: "queue-readiness", fileName: "queue-readiness.html" },
    { target: "event-stream-readiness", fileName: "event-stream-readiness.html" },
    { target: "stream-processing-readiness", fileName: "stream-processing-readiness.html" },
    { target: "pipeline-orchestration-readiness", fileName: "pipeline-orchestration-readiness.html" },
    { target: "service-mesh-readiness", fileName: "service-mesh-readiness.html" },
    { target: "ingress-controller-readiness", fileName: "ingress-controller-readiness.html" },
    { target: "dns-readiness", fileName: "dns-readiness.html" },
    { target: "cache-readiness", fileName: "cache-readiness.html" },
    { target: "logging-readiness", fileName: "logging-readiness.html" },
    { target: "feature-flag-readiness", fileName: "feature-flag-readiness.html" },
    { target: "rate-limit-readiness", fileName: "rate-limit-readiness.html" },
    { target: "error-tracking-readiness", fileName: "error-tracking-readiness.html" },
    { target: "analytics-readiness", fileName: "analytics-readiness.html" },
    { target: "http-client-readiness", fileName: "http-client-readiness.html" },
    { target: "schema-validation-readiness", fileName: "schema-validation-readiness.html" },
    { target: "datetime-readiness", fileName: "datetime-readiness.html" },
    { target: "id-generation-readiness", fileName: "id-generation-readiness.html" },
    { target: "image-processing-readiness", fileName: "image-processing-readiness.html" },
    { target: "file-upload-readiness", fileName: "file-upload-readiness.html" },
    { target: "websocket-readiness", fileName: "websocket-readiness.html" },
    { target: "pdf-generation-readiness", fileName: "pdf-generation-readiness.html" },
    { target: "spreadsheet-readiness", fileName: "spreadsheet-readiness.html" },
    { target: "chart-visualization-readiness", fileName: "chart-visualization-readiness.html" },
    { target: "diagram-rendering-readiness", fileName: "diagram-rendering-readiness.html" },
    { target: "link-integrity-readiness", fileName: "link-integrity-readiness.html" },
    { target: "seo-metadata-readiness", fileName: "seo-metadata-readiness.html" },
    { target: "pwa-readiness", fileName: "pwa-readiness.html" },
    { target: "browser-compat-readiness", fileName: "browser-compat-readiness.html" },
    { target: "browser-extension-readiness", fileName: "browser-extension-readiness.html" },
    { target: "env-validation-readiness", fileName: "env-validation-readiness.html" },
    { target: "security-headers-readiness", fileName: "security-headers-readiness.html" },
    { target: "graphql-readiness", fileName: "graphql-readiness.html" },
    { target: "cli-readiness", fileName: "cli-readiness.html" },
    { target: "llm-readiness", fileName: "llm-readiness.html" },
    { target: "llm-eval-readiness", fileName: "llm-eval-readiness.html" },
    { target: "llm-observability-readiness", fileName: "llm-observability-readiness.html" },
    { target: "vector-db-readiness", fileName: "vector-db-readiness.html" },
    { target: "search-service-readiness", fileName: "search-service-readiness.html" },
    { target: "object-storage-readiness", fileName: "object-storage-readiness.html" },
    { target: "realtime-collaboration-readiness", fileName: "realtime-collaboration-readiness.html" },
    { target: "workflow-orchestration-readiness", fileName: "workflow-orchestration-readiness.html" },
    { target: "openapi-client-readiness", fileName: "openapi-client-readiness.html" },
    { target: "webhook-readiness", fileName: "webhook-readiness.html" },
    { target: "notification-readiness", fileName: "notification-readiness.html" },
    { target: "consent-readiness", fileName: "consent-readiness.html" },
    { target: "privacy-readiness", fileName: "privacy-readiness.html" },
    { target: "server-framework-readiness", fileName: "server-framework-readiness.html" },
    { target: "rpc-readiness", fileName: "rpc-readiness.html" },
    { target: "workspace-graph-readiness", fileName: "workspace-graph-readiness.html" },
    { target: "scaffolding-readiness", fileName: "scaffolding-readiness.html" },
    { target: "scheduler-readiness", fileName: "scheduler-readiness.html" },
    { target: "build-tool-readiness", fileName: "build-tool-readiness.html" },
    { target: "styling-readiness", fileName: "styling-readiness.html" },
    { target: "visual-regression-readiness", fileName: "visual-regression-readiness.html" },
    { target: "infrastructure-readiness", fileName: "infrastructure-readiness.html" },
    { target: "deployment-readiness", fileName: "deployment-readiness.html" },
    { target: "serverless-readiness", fileName: "serverless-readiness.html" },
    { target: "mobile-readiness", fileName: "mobile-readiness.html" },
    { target: "desktop-readiness", fileName: "desktop-readiness.html" },
    { target: "edge-readiness", fileName: "edge-readiness.html" },
    { target: "compose-readiness", fileName: "compose-readiness.html" },
    { target: "devcontainer-readiness", fileName: "devcontainer-readiness.html" },
    { target: "kubernetes-readiness", fileName: "kubernetes-readiness.html" },
    { target: "gitops-readiness", fileName: "gitops-readiness.html" },
    { target: "backup-readiness", fileName: "backup-readiness.html" },
    { target: "context-pack", fileName: "context-pack.html" },
    { target: "mcp-handoff", fileName: "mcp-handoff.html" },
    { target: "agent-memory", fileName: "agent-memory.html" },
    { target: "graph-query", fileName: "graph-query.html" },
    { target: "tutorial-abstractions", fileName: "tutorial-abstractions.html" },
    { target: "decision-records", fileName: "decision-records.html" },
    { target: "dependency-health", fileName: "dependency-health.html" },
    { target: "verification", fileName: "session-verification.html" },
    { target: "coverage", fileName: "coverage.html" },
    { target: "graph", fileName: "component-graph.html" },
    { target: "component-graph", fileName: "component-graph.html" },
    { target: "incremental", fileName: "incremental.html" },
    { target: "flow", fileName: "flow.html" },
    { target: "glossary", fileName: "glossary.html" },
    { target: "rebuild", fileName: "rebuild.html" },
    { target: "quiz", fileName: "quiz.html" },
    { target: "quiz-print", fileName: "quiz-print.html" },
    { target: "wrong-notes", fileName: "wrong-notes.html" }
  ];
}

function openTargetPaths(htmlRoot: string): Record<string, string> {
  return Object.fromEntries(openTargetEntries().map((entry) => [entry.target, path.join(htmlRoot, entry.fileName)]));
}

function sessionVerificationMarkdown(payload: {
  ok: boolean;
  sessionRoot: string;
  sessionId: string | null;
  checkedRequiredArtifacts: number;
  checks: Record<string, boolean>;
  htmlExport: { ok: boolean; checkedFiles: number; failures: Array<{ path: string }> } | null;
  evidenceIndex: { ok: boolean; checkedItems: number; checkedSourceFiles: number; checkedSourceLinks: number; checkedLessonLinks: number; failures: Array<{ path: string; reason: string }> } | null;
  failures: Array<{ check: string; reason: string; path: string; detail?: string }>;
}): string {
  const status = payload.ok ? "PASS" : "FAIL";
  const checks = Object.entries(payload.checks)
    .map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`)
    .join("\n");
  const failureLines = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => `- ${failure.check}: ${failure.reason} at ${failure.path}${failure.detail ? ` (${failure.detail})` : ""}`).join("\n");
  return [
    "# RepoTutor Session Verification",
    "",
    `- Status: ${status}`,
    `- Session ID: ${payload.sessionId ?? "unknown"}`,
    `- Session root: ${payload.sessionRoot}`,
    `- Required artifacts checked: ${payload.checkedRequiredArtifacts}`,
    `- HTML files checked: ${payload.htmlExport?.checkedFiles ?? 0}`,
    `- Evidence items checked: ${payload.evidenceIndex?.checkedItems ?? 0}`,
    `- Evidence source files checked: ${payload.evidenceIndex?.checkedSourceFiles ?? 0}`,
    `- Evidence source links checked: ${payload.evidenceIndex?.checkedSourceLinks ?? 0}`,
    `- Evidence lesson links checked: ${payload.evidenceIndex?.checkedLessonLinks ?? 0}`,
    "",
    "## Checks",
    "",
    checks,
    "",
    "## Failures",
    "",
    failureLines
  ].join("\n");
}

function studiesRoot(flags: Record<string, string | boolean>): string {
  return path.resolve(
    stringFlag(flags["studies-root"])
      ?? process.env.REPOTUTOR_STUDIES_ROOT
      ?? path.join(process.env.INIT_CWD ?? process.cwd(), "studies")
  );
}

function commandBaseDir(): string {
  return path.resolve(process.env.INIT_CWD ?? process.cwd());
}

function help(): void {
  console.log(`repo-tutor commands:
  <github-url-or-path> --mode quick|standard|deep --level beginner|junior|senior --format json|markdown
  study <github-url-or-path> --mode quick|standard|deep --level beginner|junior|senior --format json|markdown
  quiz <session-id-or-path> --interactive --format json|markdown
  quiz <session-id-or-path> --answers answers.json --format json|markdown
  resume <session-id-or-path> --format json|markdown
  evidence <session-id-or-path> --kind import --file src/main.ts --limit 20 --format json|markdown
  export <session-id-or-path> --format html|zip --summary-format json|markdown
  verify-export <session-id-or-path> --format json|markdown
  verify-evidence <session-id-or-path> --format json|markdown
  verify-session <session-id-or-path> --format json|markdown
  verify-list-output <output-file> --manifest output.manifest.json --report [verification.json] --format json|markdown
  list --repo owner/name --summary --fields sessionId,repo,score,path --field-preset compact|scores|handoff|verification|paths --output reports/list.json --output-manifest [manifest.json] --created-from YYYY-MM-DD --created-to YYYY-MM-DD --mode quick|standard|deep|all --level beginner|junior|senior|all --status passed|failed|missing|all --html-targets complete|missing|all --sort newest|oldest|score-desc|score-asc --verified-only --wrong-only --unattempted-only --scored-only --min-score 80 --max-score 100 --limit 10 --format json|markdown|jsonl|csv
  open <session-id-or-path> --target verification|evidence|suggested-reads|runtime-environment|interface-map|symbol-map|api-reference|search-index|learning-journal|project-activity|code-metrics-readiness|code-ownership-readiness|large-asset-readiness|license-rights|sbom|security-readiness|scorecard|provenance|advisories|vex|policy-gates|api-contracts|consumer-contract-readiness|observability|performance|load-testing-readiness|benchmark-readiness|e2e|flaky-test-readiness|test-impact-readiness|test-reporting-readiness|snapshot-readiness|property-based-testing-readiness|test-data-readiness|integration-test-environment-readiness|chaos-engineering-readiness|accessibility|storybook|design-tokens|i18n|release-readiness|secret-readiness|secret-management-readiness|container-readiness|code-quality|documentation|database-readiness|database-migration-readiness|database-orm-readiness|data-quality-readiness|data-lineage-readiness|data-catalog-readiness|data-annotation-readiness|lakehouse-table-readiness|feature-store-readiness|model-registry-readiness|experiment-tracking-readiness|model-monitoring-readiness|model-serving-readiness|model-training-readiness|ci-cd|unit-tests|coverage-readiness|mutation-testing-readiness|typecheck-readiness|package-manager|git-hooks|task-runner|dependency-updates|lint-readiness|format-readiness|commit-conventions|changelog-readiness|bundle-analysis|mocking-readiness|data-fetching-readiness|routing-readiness|state-management-readiness|form-readiness|auth-readiness|authorization-readiness|payment-readiness|email-readiness|queue-readiness|event-stream-readiness|stream-processing-readiness|pipeline-orchestration-readiness|service-mesh-readiness|ingress-controller-readiness|dns-readiness|cache-readiness|logging-readiness|feature-flag-readiness|rate-limit-readiness|error-tracking-readiness|analytics-readiness|http-client-readiness|schema-validation-readiness|datetime-readiness|id-generation-readiness|image-processing-readiness|file-upload-readiness|websocket-readiness|pdf-generation-readiness|spreadsheet-readiness|chart-visualization-readiness|diagram-rendering-readiness|link-integrity-readiness|seo-metadata-readiness|pwa-readiness|browser-compat-readiness|browser-extension-readiness|env-validation-readiness|security-headers-readiness|graphql-readiness|cli-readiness|llm-readiness|llm-eval-readiness|llm-observability-readiness|vector-db-readiness|search-service-readiness|object-storage-readiness|realtime-collaboration-readiness|workflow-orchestration-readiness|openapi-client-readiness|webhook-readiness|notification-readiness|consent-readiness|privacy-readiness|server-framework-readiness|rpc-readiness|workspace-graph-readiness|scaffolding-readiness|scheduler-readiness|build-tool-readiness|styling-readiness|visual-regression-readiness|infrastructure-readiness|deployment-readiness|serverless-readiness|mobile-readiness|desktop-readiness|edge-readiness|compose-readiness|devcontainer-readiness|kubernetes-readiness|gitops-readiness|backup-readiness|context-pack|mcp-handoff|agent-memory|graph-query|tutorial-abstractions|decision-records|dependency-health|learning-path|quiz|quiz-print|all --format json|markdown
  open --list-targets --format json|markdown
  doctor --format json|markdown
  study/list/doctor option: --studies-root <dir>`);
}

await main();
