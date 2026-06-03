#!/usr/bin/env node
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
    else if (parsed.command === "list") await list(parsed);
    else if (parsed.command === "open") await openSession(parsed);
    else if (parsed.command === "doctor") await doctor();
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
  const result = await runStudy({
    source,
    mode: flagEnum(parsed.flags.mode, ["quick", "standard", "deep"], "standard") as StudyMode,
    level: flagEnum(parsed.flags.level, ["beginner", "junior", "senior"], "beginner") as LearnerLevel,
    studiesRoot: studiesRoot(parsed.flags),
    sourceBaseDir: commandBaseDir(),
    enableCodex: parsed.flags["enable-codex"] === true
  });
  console.log(JSON.stringify({
    sessionId: result.session.sessionId,
    status: result.session.status,
    path: result.session.outputPaths.root,
    html: path.join(result.session.outputPaths.html, "index.html"),
    quizQuestions: result.session.quizSummary.totalQuestions
  }, null, 2));
}

async function quiz(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
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
  console.log(JSON.stringify({
    attemptId: attempt.attemptId,
    score: attempt.score,
    correct: attempt.correctCount,
    wrong: attempt.wrongCount,
    wrongNotes: path.join(sessionRoot, "html", "wrong-notes.html")
  }, null, 2));
}

async function resume(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const session = JSON.parse(await fs.readFile(path.join(sessionRoot, "session.json"), "utf8")) as { sessionId: string; repo: string; outputPaths: { html: string } };
  console.log(JSON.stringify({
    sessionId: session.sessionId,
    repo: session.repo,
    root: sessionRoot,
    html: path.join(session.outputPaths.html, "index.html")
  }, null, 2));
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
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
  const { renderStudyHtml } = await import("@repotutor/html");
  const { verifyHtmlExportManifest, writeHtmlZipBundle, writeRenderedHtml } = await import("@repotutor/core");
  const rendered = renderStudyHtml(htmlInput);
  await writeRenderedHtml(sessionRoot, rendered);
  const verification = await verifyHtmlExportManifest(sessionRoot);
  if (!verification.ok) throw new Error("HTML export integrity verification failed.");
  const zip = format === "zip" ? await writeHtmlZipBundle(sessionRoot) : null;
  console.log(JSON.stringify({
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
  }, null, 2));
}

async function verifyExport(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyHtmlExportManifest } = await import("@repotutor/core");
  const result = await verifyHtmlExportManifest(sessionRoot);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

async function verifyEvidence(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyEvidenceIndexReport } = await import("@repotutor/core");
  const result = await verifyEvidenceIndexReport(sessionRoot);
  console.log(JSON.stringify(result, null, 2));
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

async function list(parsed: ParsedArgs): Promise<void> {
  const sessions = await listSessions(studiesRoot(parsed.flags));
  console.log(JSON.stringify(sessions.map((session) => ({
    sessionId: session.sessionId,
    repo: `${session.owner}/${session.repo}`,
    createdAt: session.createdAt,
    mode: session.studyMode,
    score: session.quizSummary.latestScore,
    wrong: session.quizSummary.wrongCount,
    path: session.outputPaths.root
  })), null, 2));
}

async function openSession(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const html = path.join(sessionRoot, "html", "index.html");
  console.log(html);
}

async function doctor(): Promise<void> {
  console.log(JSON.stringify({
    ok: true,
    product: "RepoTutor Studio",
    modes: ["cli", "codex-skill", "tauri-sidecar"],
    security: {
      staticAnalysisDefault: true,
      arbitraryCommandExecution: false,
      secretExclusion: true
    }
  }, null, 2));
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
  const command = args[0] ?? "help";
  const rest: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[index + 1];
      if (next && !next.startsWith("--")) {
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

function flagEnum(value: string | boolean | undefined, allowed: string[], fallback: string): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

function stringFlag(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberFlag(value: string | boolean | undefined, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
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
  study <github-url-or-path> --mode quick|standard|deep --level beginner|junior|senior
  quiz <session-id-or-path> --interactive
  quiz <session-id-or-path> --answers answers.json
  resume <session-id-or-path>
  evidence <session-id-or-path> --kind import --file src/main.ts --limit 20 --format json|markdown
  export <session-id-or-path> --format html|zip
  verify-export <session-id-or-path>
  verify-evidence <session-id-or-path>
  verify-session <session-id-or-path> --format json|markdown
  list
  open <session-id-or-path>
  doctor`);
}

await main();
