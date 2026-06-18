import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { applySourcePrunePlan, findQuizLearningRecord, listSessions, loadStudyHtmlInput, runStudy, scoreQuizAttempt, writeSourcePrunePlan } from "@repotutor/core";
import type { StudySession } from "@repotutor/shared";

// Node sidecar JSONL bridge for Tauri commands.
interface SessionListRow {
  sessionId: string;
  repo: string;
  createdAt: string;
  mode: string;
  level: string;
  score: number | null;
  wrong: number;
  path: string;
  html: string;
}

type QuizAnswer = "A" | "B" | "C" | "D";

const studyModeSchema = z.enum(["quick", "standard", "deep"]);
const learnerLevelSchema = z.enum(["beginner", "junior", "senior"]);
const nonEmptyPathSchema = z.string().trim().min(1);
const quizAnswerSchema = z.enum(["A", "B", "C", "D"]);
const requestBaseSchema = z.object({
  id: z.string().trim().min(1)
});
const requestSchema = z.discriminatedUnion("method", [
  requestBaseSchema.extend({
    method: z.literal("study"),
    params: z.object({
      source: nonEmptyPathSchema,
      mode: studyModeSchema,
      level: learnerLevelSchema,
      studiesRoot: nonEmptyPathSchema.optional(),
      enableCodex: z.boolean().optional(),
      learnerBriefText: z.string().optional()
    })
  }),
  requestBaseSchema.extend({
    method: z.literal("list"),
    params: z.object({
      studiesRoot: nonEmptyPathSchema.optional()
    }).default({})
  }),
  requestBaseSchema.extend({
    method: z.literal("resume"),
    params: z.object({
      sessionPath: nonEmptyPathSchema
    })
  }),
  requestBaseSchema.extend({
    method: z.literal("quiz"),
    params: z.object({
      sessionPath: nonEmptyPathSchema,
      answers: z.record(z.string().trim().min(1), quizAnswerSchema)
    })
  }),
  requestBaseSchema.extend({
    method: z.literal("sourcePrunePlan"),
    params: z.object({
      sessionPath: nonEmptyPathSchema
    })
  }),
  requestBaseSchema.extend({
    method: z.literal("applySourcePrune"),
    params: z.object({
      sessionPath: nonEmptyPathSchema,
      confirm: z.literal("DELETE-SOURCE-SNAPSHOT")
    })
  })
]);

process.stdin.setEncoding("utf8");

let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() ?? "";
  for (const line of lines.filter(Boolean)) {
    void handle(line);
  }
});

async function handle(line: string): Promise<void> {
  let requestId = "invalid-request";
  try {
    const raw = JSON.parse(line) as unknown;
    if (raw !== null && typeof raw === "object" && typeof (raw as { id?: unknown }).id === "string") {
      requestId = (raw as { id: string }).id;
    }
    const request = requestSchema.parse(raw);
    requestId = request.id;
    if (request.method === "study") {
      const result = await runStudy({
        source: request.params.source,
        mode: request.params.mode,
        level: request.params.level,
        studiesRoot: request.params.studiesRoot ?? "studies",
        enableCodex: request.params.enableCodex !== false,
        learnerBriefText: optionalString(request.params.learnerBriefText)
      });
      respond(request.id, await studyResponseFromSessionRoot(result.session.outputPaths.root));
      return;
    }
    if (request.method === "list") {
      const sessions = await listSessions(request.params.studiesRoot ?? "studies");
      respond(request.id, listRowsFromSessions(sessions));
      return;
    }
    if (request.method === "resume") {
      respond(request.id, await studyResponseFromSessionRoot(request.params.sessionPath));
      return;
    }
    if (request.method === "quiz") {
      const sessionPath = request.params.sessionPath;
      const answers = quizAnswers(request.params.answers);
      const htmlInput = await loadStudyHtmlInput(sessionPath);
      const attempt = await scoreQuizAttempt(sessionPath, answers, htmlInput);
      const learningRecord = await findQuizLearningRecord(sessionPath, attempt.attemptId);
      respond(request.id, {
        attemptId: attempt.attemptId,
        score: attempt.score,
        correct: attempt.correctCount,
        wrong: attempt.wrongCount,
        wrongNotes: `${sessionPath}/html/wrong-notes.html`,
        wrongNotesHtml: `${sessionPath}/html/wrong-notes.html`,
        wrongNotesMarkdown: `${sessionPath}/markdown/wrong-notes.md`,
        learningRecord,
        reviewGuidance: attempt.wrongCount > 0
          ? "오답노트의 선택지 복습과 learning-record를 열어 부족한 개념을 AI repair prompt로 다시 설명하세요."
          : "learning-record를 열어 이번 퀴즈가 어떤 AI 구현 맥락 준비도를 증명했는지 확인하세요."
      });
      return;
    }
    if (request.method === "sourcePrunePlan") {
      const result = await writeSourcePrunePlan(request.params.sessionPath);
      respond(request.id, {
        ...result.plan,
        reportPath: result.reportPath,
        markdownPath: result.markdownPath,
        applied: false
      });
      return;
    }
    if (request.method === "applySourcePrune") {
      const confirm = request.params.confirm;
      const result = await applySourcePrunePlan(request.params.sessionPath, { confirm });
      respond(request.id, {
        ...result.plan,
        apply: result.apply,
        applied: true
      });
      return;
    }
    return;
  } catch (error) {
    respond(requestId, { error: formatError(error) });
  }
}

function respond(id: string, result: unknown): void {
  process.stdout.write(`${JSON.stringify({ id, result })}\n`);
}

function listRowsFromSessions(sessions: StudySession[]): SessionListRow[] {
  return sessions.map((session) => ({
    sessionId: session.sessionId,
    repo: `${session.owner}/${session.repo}`,
    createdAt: session.createdAt,
    mode: session.studyMode,
    level: session.learnerLevel,
    score: session.quizSummary.latestScore,
    wrong: session.quizSummary.wrongCount,
    path: session.outputPaths.root,
    html: path.join(session.outputPaths.html, "index.html")
  }));
}

async function studyResponseFromSessionRoot(sessionRoot: string): Promise<Record<string, unknown>> {
  const session = JSON.parse(await fs.readFile(path.join(sessionRoot, "session.json"), "utf8")) as StudySession;
  const verificationReport = path.join(session.outputPaths.analysis, "session-verification-report.json");
  const verification = JSON.parse(await fs.readFile(verificationReport, "utf8")) as {
    ok: boolean;
    checkedRequiredArtifacts: number;
    checks: Record<string, boolean>;
  };
  return {
    sessionId: session.sessionId,
    status: session.status,
    path: session.outputPaths.root,
    html: path.join(session.outputPaths.html, "index.html"),
    dailySummaryHtml: path.join(session.outputPaths.html, "daily-summary.html"),
    teachingWorkspaceHtml: path.join(session.outputPaths.html, "teaching-workspace.html"),
    learnerGoalAlignmentHtml: path.join(session.outputPaths.root, "reference", "learner-goal-alignment.html"),
    verificationOk: verification.ok,
    verificationReport,
    verificationMarkdown: path.join(session.outputPaths.markdown, "session-verification.md"),
    verificationHtml: path.join(session.outputPaths.html, "session-verification.html"),
    verificationCheckedRequiredArtifacts: verification.checkedRequiredArtifacts,
    verificationChecks: verification.checks,
    quizQuestions: session.quizSummary.totalQuestions
  };
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim().length > 0 ? value : undefined;
}

function quizAnswers(value: unknown): Record<string, QuizAnswer> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("quiz requires an answers object.");
  }
  const answers: Record<string, QuizAnswer> = {};
  for (const [key, answer] of Object.entries(value)) {
    if (!["A", "B", "C", "D"].includes(String(answer))) {
      throw new Error(`quiz answer for ${key} must be A, B, C, or D.`);
    }
    answers[key] = String(answer) as QuizAnswer;
  }
  return answers;
}

function formatError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join(".") || "request"}: ${issue.message}`)
      .join("; ");
  }
  return error instanceof Error ? error.message : String(error);
}
