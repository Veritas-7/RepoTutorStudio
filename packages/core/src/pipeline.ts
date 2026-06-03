import fs from "node:fs/promises";
import path from "node:path";
import { renderStudyHtml } from "@repotutor/html";
import type { LearnerLevel, QuizAttempt, StudyMode, StudySession, WrongNote } from "@repotutor/shared";
import { StructuredRunner } from "@repotutor/codex";
import { analyzeRepository, type AnalysisBundle } from "./scanner.js";
import { parseSource } from "./intake.js";
import { ensureDir, pathExists } from "./fs-utils.js";
import { materializeSession, prepareSession, readJson, updateSessionIndex, writeJson } from "./storage.js";
import { generateQuiz, writeRenderedHtml } from "./quiz.js";
import { markdownFiles, readmeStudy, renderSessionVerificationMarkdown } from "./markdown.js";
import { buildIncrementalReport, findPreviousSnapshot } from "./incremental.js";
import { verifyStudySessionArtifacts } from "./session-verifier.js";
export { listSessions } from "./sessions.js";

export interface StudyOptions {
  source: string;
  mode?: StudyMode;
  level?: LearnerLevel;
  studiesRoot?: string;
  sourceBaseDir?: string;
  enableCodex?: boolean;
}

export interface StudyResult {
  session: StudySession;
  analysis: AnalysisBundle;
}

export async function runStudy(options: StudyOptions): Promise<StudyResult> {
  const studiesRoot = path.resolve(options.studiesRoot ?? path.join(process.cwd(), "studies"));
  const source = await parseSource(options.source, { baseDir: options.sourceBaseDir });
  const prepared = await prepareSession({ source, studiesRoot, mode: options.mode, level: options.level });
  await materializeSession(prepared);
  let session: StudySession = { ...prepared.session, status: "running" };
  await writeJson(path.join(session.outputPaths.root, "session.json"), session);
  await ensureSessionDirs(session);

  const codexRunner = new StructuredRunner({ codexDir: session.outputPaths.codex, enableSdk: options.enableCodex });
  await codexRunner.run({
    taskName: "PurposeTask",
    prompt: `Analyze ${session.owner}/${session.repo} for beginner learning. Source files are already filtered for secrets.`,
    schema: {
      parse(value: unknown) {
        return value as { ok: boolean };
      },
      safeParse(value: unknown) {
        return { success: true, data: value as { ok: boolean } };
      }
    } as never
  });

  const analysis = await analyzeRepository(session.outputPaths.source);
  const previousSnapshot = await findPreviousSnapshot(studiesRoot, session);
  analysis.incrementalReport = buildIncrementalReport(analysis.sourceSnapshotReport, analysis.coverageReport, previousSnapshot);
  const quiz = generateQuiz(session, analysis.folderLessons, analysis.fileLessons, analysis.glossary);
  const wrongNotes: WrongNote[] = [];
  const attempts: QuizAttempt[] = [];
  session = {
    ...session,
    status: "complete",
    updatedAt: new Date().toISOString(),
    quizSummary: {
      totalQuestions: quiz.totalQuestions,
      attempts: 0,
      latestScore: null,
      wrongCount: 0
    }
  };

  await writeAllArtifacts(session, analysis, quiz, wrongNotes, attempts);
  await updateSessionIndex(studiesRoot, session);
  return { session, analysis };
}

export async function loadStudyHtmlInput(sessionRoot: string): Promise<Parameters<typeof renderStudyHtml>[0]> {
  const session = await readJson<StudySession>(path.join(sessionRoot, "session.json"));
  return {
    session,
    repoMap: await readJson(path.join(sessionRoot, "analysis", "repo-map.json")),
    languageReport: await readJson(path.join(sessionRoot, "analysis", "language-report.json")),
    dependencyReport: await readJson(path.join(sessionRoot, "analysis", "dependency-report.json")),
    purposeReport: await readJson(path.join(sessionRoot, "analysis", "purpose-report.json")),
    architectureReport: await readJson(path.join(sessionRoot, "analysis", "architecture-report.json")),
    folderLessons: await readJson(path.join(sessionRoot, "analysis", "folder-lessons.json")),
    fileLessons: await readJson(path.join(sessionRoot, "analysis", "file-lessons.json")),
    coverageReport: await readJson(path.join(sessionRoot, "analysis", "coverage-report.json")),
    suggestedReadsReport: await readJson(path.join(sessionRoot, "analysis", "suggested-reads-report.json")),
    runtimeEnvironmentReport: await readJson(path.join(sessionRoot, "analysis", "runtime-environment-report.json")),
    interfaceMapReport: await readJson(path.join(sessionRoot, "analysis", "interface-map-report.json")),
    symbolMapReport: await readJson(path.join(sessionRoot, "analysis", "symbol-map-report.json")),
    componentGraphReport: await readJson(path.join(sessionRoot, "analysis", "component-graph-report.json")),
    sourceSnapshotReport: await readJson(path.join(sessionRoot, "analysis", "source-snapshot-report.json")),
    incrementalReport: await readJson(path.join(sessionRoot, "analysis", "incremental-report.json")),
    flowReport: await readJson(path.join(sessionRoot, "analysis", "flow-report.json")),
    glossary: await readJson(path.join(sessionRoot, "analysis", "glossary.json")),
    rebuildRoadmap: await readJson(path.join(sessionRoot, "analysis", "rebuild-roadmap.json")),
    quiz: await readJson(path.join(sessionRoot, "analysis", "quiz.json")),
    wrongNotes: await pathExists(path.join(sessionRoot, "analysis", "wrong-notes.json")) ? await readJson(path.join(sessionRoot, "analysis", "wrong-notes.json")) : [],
    attempts: await readAttempts(path.join(sessionRoot, "analysis", "quiz-attempts.jsonl"))
  };
}

async function writeAllArtifacts(session: StudySession, analysis: AnalysisBundle, quiz: ReturnType<typeof generateQuiz>, wrongNotes: WrongNote[], attempts: QuizAttempt[]): Promise<void> {
  await Promise.all([
    writeJson(path.join(session.outputPaths.root, "session.json"), session),
    writeJson(path.join(session.outputPaths.analysis, "repo-map.json"), analysis.repoMap),
    writeJson(path.join(session.outputPaths.analysis, "language-report.json"), analysis.languageReport),
    writeJson(path.join(session.outputPaths.analysis, "dependency-report.json"), analysis.dependencyReport),
    writeJson(path.join(session.outputPaths.analysis, "purpose-report.json"), analysis.purposeReport),
    writeJson(path.join(session.outputPaths.analysis, "architecture-report.json"), analysis.architectureReport),
    writeJson(path.join(session.outputPaths.analysis, "folder-lessons.json"), analysis.folderLessons),
    writeJson(path.join(session.outputPaths.analysis, "file-lessons.json"), analysis.fileLessons),
    writeJson(path.join(session.outputPaths.analysis, "coverage-report.json"), analysis.coverageReport),
    writeJson(path.join(session.outputPaths.analysis, "evidence-index-report.json"), analysis.evidenceIndexReport),
    writeJson(path.join(session.outputPaths.analysis, "suggested-reads-report.json"), analysis.suggestedReadsReport),
    writeJson(path.join(session.outputPaths.analysis, "runtime-environment-report.json"), analysis.runtimeEnvironmentReport),
    writeJson(path.join(session.outputPaths.analysis, "interface-map-report.json"), analysis.interfaceMapReport),
    writeJson(path.join(session.outputPaths.analysis, "symbol-map-report.json"), analysis.symbolMapReport),
    writeJson(path.join(session.outputPaths.analysis, "component-graph-report.json"), analysis.componentGraphReport),
    writeJson(path.join(session.outputPaths.analysis, "source-snapshot-report.json"), analysis.sourceSnapshotReport),
    writeJson(path.join(session.outputPaths.analysis, "incremental-report.json"), analysis.incrementalReport),
    writeJson(path.join(session.outputPaths.analysis, "flow-report.json"), analysis.flowReport),
    writeJson(path.join(session.outputPaths.analysis, "glossary.json"), analysis.glossary),
    writeJson(path.join(session.outputPaths.analysis, "rebuild-roadmap.json"), analysis.rebuildRoadmap),
    writeJson(path.join(session.outputPaths.analysis, "quiz.json"), quiz),
    writeJson(path.join(session.outputPaths.analysis, "wrong-notes.json"), wrongNotes),
    fs.writeFile(path.join(session.outputPaths.codex, "thread.json"), JSON.stringify({ sessionId: session.sessionId, codexThreadId: session.codexThreadId }, null, 2))
  ]);

  const markdown = markdownFiles(session, analysis, quiz, wrongNotes);
  for (const [fileName, content] of Object.entries(markdown)) {
    await fs.writeFile(path.join(session.outputPaths.markdown, fileName), content);
  }
  await fs.writeFile(path.join(session.outputPaths.root, "README.study.md"), readmeStudy(session));
  const htmlInput = { session, ...analysis, quiz, wrongNotes, attempts };
  const rendered = renderStudyHtml(htmlInput);
  await writeRenderedHtml(session.outputPaths.root, rendered);
  const sessionVerification = await verifyStudySessionArtifacts(session.outputPaths.root);
  await writeJson(path.join(session.outputPaths.analysis, "session-verification-report.json"), sessionVerification);
  await fs.writeFile(path.join(session.outputPaths.markdown, "session-verification.md"), renderSessionVerificationMarkdown(sessionVerification));
  if (!sessionVerification.ok) throw new Error("Session artifact verification failed.");
}

async function ensureSessionDirs(session: StudySession): Promise<void> {
  await Promise.all([
    ensureDir(session.outputPaths.analysis),
    ensureDir(session.outputPaths.markdown),
    ensureDir(session.outputPaths.codex),
    ensureDir(path.join(session.outputPaths.html, "assets"))
  ]);
}

async function readAttempts(filePath: string): Promise<QuizAttempt[]> {
  if (!await pathExists(filePath)) return [];
  const text = await fs.readFile(filePath, "utf8");
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as QuizAttempt);
}
