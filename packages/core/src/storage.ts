import fs from "node:fs/promises";
import path from "node:path";
import extractZip from "extract-zip";
import {
  DEFAULT_LEARNER_LEVEL,
  DEFAULT_STUDY_MODE,
  LearnerLevel,
  SourceInput,
  StudyMode,
  StudySession,
  sessionFolderName,
  todayIsoDate
} from "@repotutor/shared";
import { copySafeTree, ensureDir, pathExists, removeUnsafeSnapshotFiles, runCommand, stableHash } from "./fs-utils.js";

export interface PrepareSessionOptions {
  source: SourceInput;
  studiesRoot: string;
  mode?: StudyMode;
  level?: LearnerLevel;
}

export interface PreparedSession {
  session: StudySession;
  tempRoot: string;
  finalRoot: string;
}

export async function prepareSession(options: PrepareSessionOptions): Promise<PreparedSession> {
  const now = new Date();
  const sessionId = `${Date.now().toString(36)}-${stableHash(options.source.raw).slice(0, 8)}`;
  const tempRoot = path.join(options.studiesRoot, ".tmp", sessionId);
  const sourceRoot = path.join(tempRoot, "source");
  await ensureDir(sourceRoot);
  await fetchOrCopySource(options.source, sourceRoot, tempRoot);
  const metadata = await sourceMetadata(options.source, sourceRoot);
  await removeUnsafeSnapshotFiles(sourceRoot);
  const date = todayIsoDate(now);
  const folder = sessionFolderName(options.source.owner, options.source.repo, metadata.branch, metadata.commitHash);
  let finalRoot = path.join(options.studiesRoot, date, folder);
  let suffix = 2;
  while (await pathExists(finalRoot)) {
    finalRoot = path.join(options.studiesRoot, date, `${folder}-${suffix}`);
    suffix += 1;
  }
  const session: StudySession = {
    sessionId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    sourceType: options.source.sourceType,
    sourceUrl: options.source.sourceUrl ?? null,
    localSourcePath: options.source.localSourcePath ?? null,
    owner: options.source.owner,
    repo: options.source.repo,
    branch: metadata.branch,
    commitHash: metadata.commitHash,
    studyMode: options.mode ?? DEFAULT_STUDY_MODE,
    learnerLevel: options.level ?? DEFAULT_LEARNER_LEVEL,
    language: "ko",
    status: "created",
    outputPaths: {
      root: finalRoot,
      source: path.join(finalRoot, "source"),
      analysis: path.join(finalRoot, "analysis"),
      markdown: path.join(finalRoot, "markdown"),
      codex: path.join(finalRoot, "codex"),
      html: path.join(finalRoot, "html")
    },
    codexThreadId: null,
    quizSummary: {
      totalQuestions: 0,
      attempts: 0,
      latestScore: null,
      wrongCount: 0
    },
    wrongNoteSummary: {
      totalWrongNotes: 0,
      unresolved: 0,
      topConcepts: []
    }
  };
  return { session, tempRoot, finalRoot };
}

export async function materializeSession(prepared: PreparedSession): Promise<void> {
  await ensureDir(path.dirname(prepared.finalRoot));
  await fs.rename(prepared.tempRoot, prepared.finalRoot);
  await Promise.all([
    ensureDir(prepared.session.outputPaths.analysis),
    ensureDir(prepared.session.outputPaths.markdown),
    ensureDir(prepared.session.outputPaths.codex),
    ensureDir(path.join(prepared.session.outputPaths.html, "assets"))
  ]);
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

export async function updateSessionIndex(studiesRoot: string, session: StudySession): Promise<void> {
  await ensureDir(studiesRoot);
  const dbPath = path.join(studiesRoot, "index.sqlite");
  try {
    const sqlite = await import("node:sqlite");
    const DatabaseSync = (sqlite as unknown as { DatabaseSync: new (path: string) => { exec: (sql: string) => void; prepare: (sql: string) => { run: (...args: unknown[]) => void }; close: () => void } }).DatabaseSync;
    const db = new DatabaseSync(dbPath);
    db.exec("CREATE TABLE IF NOT EXISTS sessions (session_id TEXT PRIMARY KEY, repo TEXT, owner TEXT, branch TEXT, commit_hash TEXT, created_at TEXT, mode TEXT, level TEXT, score REAL, wrong_count INTEGER, path TEXT)");
    db.prepare("INSERT OR REPLACE INTO sessions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      session.sessionId,
      session.repo,
      session.owner,
      session.branch,
      session.commitHash,
      session.createdAt,
      session.studyMode,
      session.learnerLevel,
      session.quizSummary.latestScore,
      session.quizSummary.wrongCount,
      session.outputPaths.root
    );
    db.close();
  } catch {
    const jsonPath = path.join(studiesRoot, "index.json");
    const existing = await pathExists(jsonPath) ? await readJson<StudySession[]>(jsonPath) : [];
    const next = existing.filter((item) => item.sessionId !== session.sessionId);
    next.push(session);
    await writeJson(jsonPath, next);
  }
}

async function fetchOrCopySource(source: SourceInput, sourceRoot: string, tempRoot: string): Promise<void> {
  if (source.sourceType === "github") {
    if (!source.sourceUrl?.startsWith("https://github.com/")) throw new Error("Only public HTTPS GitHub URLs are supported.");
    await fs.rm(sourceRoot, { recursive: true, force: true });
    const args = ["clone", "--depth", "1"];
    if (source.branch && source.branch !== "main") args.push("--branch", source.branch);
    args.push(source.sourceUrl, sourceRoot);
    await runCommand("git", args, tempRoot);
    return;
  }
  if (!source.localSourcePath) throw new Error("Local source path is required.");
  if (source.sourceType === "zip") {
    await extractZip(source.localSourcePath, { dir: sourceRoot });
    return;
  }
  await copySafeTree(source.localSourcePath, sourceRoot);
}

async function sourceMetadata(source: SourceInput, sourceRoot: string): Promise<{ branch: string; commitHash: string }> {
  if (source.sourceType === "github") {
    const branch = await runCommand("git", ["-C", sourceRoot, "rev-parse", "--abbrev-ref", "HEAD"], sourceRoot).then((result) => result.stdout).catch(() => source.branch);
    const commitHash = await runCommand("git", ["-C", sourceRoot, "rev-parse", "HEAD"], sourceRoot).then((result) => result.stdout).catch(() => stableHash(source.raw));
    return { branch: branch || source.branch, commitHash };
  }
  if (source.localSourcePath) {
    const branch = await runCommand("git", ["-C", source.localSourcePath, "rev-parse", "--abbrev-ref", "HEAD"], source.localSourcePath).then((result) => result.stdout).catch(() => "local");
    const commitHash = await runCommand("git", ["-C", source.localSourcePath, "rev-parse", "HEAD"], source.localSourcePath).then((result) => result.stdout).catch(() => stableHash(`${source.localSourcePath}-${Date.now()}`));
    return { branch, commitHash };
  }
  return { branch: source.branch, commitHash: stableHash(source.raw) };
}
