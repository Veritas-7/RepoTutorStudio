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
    else if (parsed.command === "export") await exportSession(parsed);
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

async function exportSession(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const format = stringFlag(parsed.flags.format) ?? "html";
  if (!["html", "zip"].includes(format)) throw new Error("export supports --format html or --format zip.");
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
  const { renderStudyHtml } = await import("@repotutor/html");
  const { writeHtmlZipBundle, writeRenderedHtml } = await import("@repotutor/core");
  const rendered = renderStudyHtml(htmlInput);
  await writeRenderedHtml(sessionRoot, rendered);
  const zip = format === "zip" ? await writeHtmlZipBundle(sessionRoot) : null;
  console.log(JSON.stringify({
    exported: format,
    path: zip?.zipPath ?? path.join(sessionRoot, "html", "index.html"),
    html: path.join(sessionRoot, "html", "index.html"),
    readme: path.join(sessionRoot, "html", "EXPORT-README.md"),
    manifest: path.join(sessionRoot, "html", "manifest.json"),
    pages: rendered.manifest.pages.length,
    assets: rendered.manifest.assets.length,
    zipBytes: zip?.bytes ?? null,
    zipFiles: zip?.fileCount ?? null,
    entrypoints: rendered.manifest.entrypoints.map((entry) => ({
      label: entry.label,
      path: path.join(sessionRoot, entry.path)
    }))
  }, null, 2));
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
  export <session-id-or-path> --format html|zip
  list
  open <session-id-or-path>
  doctor`);
}

await main();
