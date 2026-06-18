import fs from "node:fs/promises";
import path from "node:path";
import type { FileLesson, FolderLesson, GlossaryTerm, HtmlExportManifest, Quiz, QuizAttempt, QuizQuestion, StudyMode, StudySession, WrongNote } from "@repotutor/shared";
import { htmlAnchor } from "@repotutor/shared";
import { ensureDir, pathExists } from "./fs-utils.js";
import { readJson, writeJson } from "./storage.js";
import { renderWrongNotesMarkdown } from "./markdown.js";
import { renderStudyHtml, type StudyHtmlInput } from "@repotutor/html";
import { appendQuizLearningRecord } from "./teaching-workspace.js";

type QuizTopic = {
  section: string;
  title: string;
  answer: string;
  lesson: string;
  terms: string[];
  aiPromptUse: string;
  aiReviewQuestion: string;
  memorizationWarning: string;
};

export function calculateQuizCount(params: { mode: StudyMode; folderCount: number; fileCount: number; glossaryCount: number; sectionCount: number }): number {
  const base = 5;
  const modeFactor = params.mode === "quick" ? 0.7 : params.mode === "deep" ? 1.4 : 1.0;
  const raw = Math.ceil((base + params.folderCount * 0.8 + params.fileCount * 0.6 + params.glossaryCount * 0.35 + params.sectionCount * 1.2) * modeFactor);
  if (params.mode === "quick") return clamp(raw, 5, 15);
  if (params.mode === "deep") return clamp(raw, 20, 60);
  return clamp(raw, 10, 35);
}

export function generateQuiz(session: StudySession, folders: FolderLesson[], files: FileLesson[], glossary: GlossaryTerm[]): Quiz {
  const count = calculateQuizCount({ mode: session.studyMode, folderCount: folders.length, fileCount: files.length, glossaryCount: glossary.length, sectionCount: 8 });
  const questions: QuizQuestion[] = [];
  const topicPool: QuizTopic[] = [
    ...folders.map((folder) => ({
      section: "folders",
      title: folder.folderPath,
      answer: folder.role,
      lesson: `folders.html#${htmlAnchor(folder.folderPath)}`,
      terms: ["폴더 구조(folder structure)"],
      aiPromptUse: `${folder.folderPath}는 ${folder.role} 책임 경계입니다. 비슷한 앱에서 이 책임을 어떤 기능 단위로 재구성할지 AI에게 설명하게 하세요.`,
      aiReviewQuestion: `AI 결과가 ${folder.folderPath}의 책임을 분리하고 관련 검증 기준까지 제시했는지 확인하세요.`,
      memorizationWarning: "폴더 이름을 외우지 말고, 이 경계가 왜 필요한지와 AI에게 어떤 구현 책임으로 넘길지만 남기세요."
    })),
    ...files.map((file) => ({
      section: "files",
      title: file.filePath,
      answer: file.role,
      lesson: `files.html#${htmlAnchor(file.filePath)}`,
      terms: file.glossaryTerms,
      aiPromptUse: `${file.filePath}는 ${file.role} 역할을 하는 파일입니다. 비슷한 앱에서 같은 책임을 어떤 모듈이나 화면으로 만들지 AI에게 제안하게 하세요.`,
      aiReviewQuestion: `AI 결과가 ${file.filePath}의 역할, 입력/출력, 수락 기준, 검증 명령을 분리했는지 확인하세요.`,
      memorizationWarning: "파일 구현 줄을 외우지 말고, 이 파일이 맡은 책임과 AI 결과를 검토할 질문만 남기세요."
    })),
    ...glossary.map((term) => ({
      section: "glossary",
      title: `${term.termKo} (${term.termEn})`,
      answer: term.projectSpecificMeaning,
      lesson: `glossary.html#${htmlAnchor(term.termEn)}`,
      terms: [term.termKo],
      aiPromptUse: term.promptUse,
      aiReviewQuestion: term.reviewQuestion,
      memorizationWarning: term.memorizationWarning
    }))
  ];
  for (let index = 0; index < count; index += 1) {
    const topic = topicPool[index % Math.max(topicPool.length, 1)] ?? {
      section: "overview",
      title: session.repo,
      answer: "프로젝트 목적과 구조를 배우는 것",
      lesson: "index.html",
      terms: ["학습 리포트"],
      aiPromptUse: `${session.repo}의 목적, 사용자 문제, 첫 구현 단위, 수락 기준을 AI에게 먼저 설명하게 하세요.`,
      aiReviewQuestion: "AI 결과가 원본 소스를 복사하지 않고 목적, 책임, 검증 기준으로 전환했는지 확인하세요.",
      memorizationWarning: "프로젝트를 통째로 외우지 말고, 비슷한 앱을 만들 때 재사용할 판단 기준만 남기세요."
    };
    const difficulty = index % 5 === 4 ? "hard" : index % 2 === 0 ? "easy" : "medium";
    questions.push({
      id: `q-${String(index + 1).padStart(3, "0")}`,
      section: topic.section,
      difficulty,
      question: `${topic.title}를 AI에게 설명할 때 가장 알맞은 지시 맥락은?`,
      choices: {
        A: `이 항목은 ${topic.answer}라는 역할/의미를 가지므로 목적, 책임, 연결된 검증 기준을 AI 지시 맥락으로 쓴다. AI 지시 문장: ${topic.aiPromptUse} AI 출력 리뷰 질문: ${topic.aiReviewQuestion}`,
        B: "이 항목의 언어 문법을 먼저 외우라고 AI에게 지시한다.",
        C: "원본 소스를 앱에 영구 내장 지식으로 보관하라고 AI에게 지시한다.",
        D: "검증 기준 없이 AI에게 전체 구현을 한 번에 맡긴다."
      },
      correctChoice: "A",
      explanation: `${topic.title}는 리포트에서 ${topic.answer}로 설명됩니다. RepoTutor 퀴즈는 문법 암기가 아니라 이 역할을 AI에게 줄 목적, 책임, 용어, 검증 기준으로 바꿀 수 있는지 확인합니다. AI 지시 문장: ${topic.aiPromptUse} AI 출력 리뷰 질문: ${topic.aiReviewQuestion} 외우지 말 것: ${topic.memorizationWarning}`,
      whyOtherChoicesAreWrong: {
        A: "정답입니다.",
        B: "바이브코딩 학습자는 언어 문법보다 런타임, 파일 역할, 아키텍처 책임, 검증 기준을 AI에게 설명해야 합니다.",
        C: "사용자 원본 소스는 앱 지식이나 정리 대상이 아닙니다. 생성된 세션 source/ 스냅샷은 임시 프로젝트 근거이므로 흡수한 학습 산출물, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 정리 검토 여부를 판단해야 합니다.",
        D: "AI에게 맡기더라도 첫 vertical slice, 수락 기준, 검증 명령, 실패 시 되물어볼 질문을 분리해야 합니다."
      },
      aiPromptUse: topic.aiPromptUse,
      aiReviewQuestion: topic.aiReviewQuestion,
      memorizationWarning: topic.memorizationWarning,
      relatedLessonPath: topic.lesson,
      relatedHtmlAnchor: topic.lesson.split("#")[1] ?? "top",
      glossaryTerms: topic.terms,
      reviewPriority: difficulty === "hard" ? 5 : difficulty === "medium" ? 4 : 3
    });
  }
  return {
    sessionId: session.sessionId,
    generatedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    questions
  };
}

export async function scoreQuizAttempt(sessionRoot: string, answers: Record<string, "A" | "B" | "C" | "D">, htmlInput?: StudyHtmlInput): Promise<QuizAttempt> {
  const sessionPath = path.join(sessionRoot, "session.json");
  const quizPath = path.join(sessionRoot, "analysis", "quiz.json");
  const attemptsPath = path.join(sessionRoot, "analysis", "quiz-attempts.jsonl");
  const wrongNotesPath = path.join(sessionRoot, "analysis", "wrong-notes.json");
  const session = await readJson<StudySession>(sessionPath);
  const quiz = await readJson<Quiz>(quizPath);
  const wrongQuestionIds = quiz.questions.filter((question) => answers[question.id] !== question.correctChoice).map((question) => question.id);
  const correctCount = quiz.totalQuestions - wrongQuestionIds.length;
  const attemptNumber = await countJsonlLines(attemptsPath) + 1;
  const attempt: QuizAttempt = {
    attemptId: `${Date.now().toString(36)}-${attemptNumber}`,
    sessionId: session.sessionId,
    createdAt: new Date().toISOString(),
    answers,
    totalQuestions: quiz.totalQuestions,
    correctCount,
    wrongCount: wrongQuestionIds.length,
    score: Math.round((correctCount / quiz.totalQuestions) * 1000) / 10,
    wrongQuestionIds
  };
  await ensureDir(path.dirname(attemptsPath));
  await fs.appendFile(attemptsPath, `${JSON.stringify(attempt)}\n`);
  const existingWrongNotes = await pathExists(wrongNotesPath) ? await readJson<WrongNote[]>(wrongNotesPath) : [];
  const newWrongNotes = quiz.questions
    .filter((question) => wrongQuestionIds.includes(question.id))
    .map((question) => buildWrongNote(question, answers[question.id] ?? "A", attemptNumber));
  const wrongNotes = [...existingWrongNotes, ...newWrongNotes];
  await writeJson(wrongNotesPath, wrongNotes);
  await fs.writeFile(path.join(sessionRoot, "markdown", "wrong-notes.md"), renderWrongNotesMarkdown(wrongNotes));
  const updatedSession: StudySession = {
    ...session,
    updatedAt: new Date().toISOString(),
    quizSummary: {
      totalQuestions: quiz.totalQuestions,
      attempts: attemptNumber,
      latestScore: attempt.score,
      wrongCount: attempt.wrongCount
    },
    wrongNoteSummary: {
      totalWrongNotes: wrongNotes.length,
      unresolved: wrongNotes.filter((note) => !note.resolved).length,
      topConcepts: [...new Set(wrongNotes.flatMap((note) => note.relatedConcepts))].slice(0, 5)
    }
  };
  await writeJson(sessionPath, updatedSession);
  await appendQuizLearningRecord(sessionRoot, updatedSession, quiz, attempt, wrongNotes);
  if (htmlInput) {
    const rendered = renderStudyHtml({ ...htmlInput, session: updatedSession, wrongNotes, attempts: [...htmlInput.attempts, attempt] });
    await writeRenderedHtml(sessionRoot, rendered);
  }
  return attempt;
}

export async function writeRenderedHtml(sessionRoot: string, rendered: ReturnType<typeof renderStudyHtml>): Promise<void> {
  for (const page of rendered.pages) {
    await fs.writeFile(path.join(sessionRoot, "html", page.name), page.html);
  }
  for (const [assetPath, content] of Object.entries(rendered.assets)) {
    await ensureDir(path.join(sessionRoot, "html", path.dirname(assetPath)));
    await fs.writeFile(path.join(sessionRoot, "html", assetPath), content);
  }
  await writeJson(path.join(sessionRoot, "html", "manifest.json"), rendered.manifest);
  await fs.writeFile(path.join(sessionRoot, "html", "EXPORT-README.md"), renderExportReadme(rendered.manifest));
  await writeJson(path.join(sessionRoot, "analysis", "html-export-manifest.json"), rendered.manifest);
}

function renderExportReadme(manifest: HtmlExportManifest): string {
  const entrypoints = manifest.entrypoints
    .map((entry) => `- ${entry.label}: ${insideHtmlPath(entry.path)} - ${exportReadmeDescriptionMarkdown(entry.description)}`)
    .join("\n");
  const pages = manifest.pages.map((page) => `- ${page.title}: ${insideHtmlPath(page.path)} (${page.bytes} bytes, sha256 ${shortHash(page.sha256)})`).join("\n");
  const assets = manifest.assets.map((asset) => `- ${insideHtmlPath(asset.path)} (${asset.bytes} bytes, sha256 ${shortHash(asset.sha256)})`).join("\n");
  return `# RepoTutor HTML Export\n\nOpen \`index.html\` in a browser to start. This folder is portable and can be copied as one offline report bundle.\n\nUse browser print preview when you need a PDF or paper handout; \`assets/style.css\` includes print rules that hide navigation and expand the report content.\n\nIntegrity metadata uses ${manifest.integrity.algorithm} for ${manifest.integrity.coveredFiles} files. Full hashes are in \`manifest.json\`.\n\n## Entry Points\n\n${entrypoints}\n\n## Pages\n\n${pages}\n\n## Assets\n\n${assets}\n`;
}

function exportReadmeDescriptionMarkdown(value: string): string {
  return value
    .replaceAll("생성된 세션 source/ 스냅샷", "생성된 세션 `source/` 스냅샷")
    .replaceAll("생성 세션 source/ 스냅샷", "생성 세션 `source/` 스냅샷");
}

function insideHtmlPath(filePath: string): string {
  return filePath.startsWith("html/") ? filePath.slice("html/".length) : filePath;
}

function shortHash(value: string): string {
  return value.slice(0, 12);
}

function buildWrongNote(question: QuizQuestion, selectedChoice: "A" | "B" | "C" | "D", attemptNumber: number): WrongNote {
  return {
    questionId: question.id,
    question: question.question,
    selectedChoice,
    correctChoice: question.correctChoice,
    explanation: question.explanation,
    selectedChoiceRationale: question.whyOtherChoicesAreWrong[selectedChoice] ?? "선택한 답에 대한 별도 오답 해설이 없습니다.",
    mistakeReason: inferMistakeReason(question),
    relatedConcepts: question.glossaryTerms,
    relatedFolderOrFile: question.relatedLessonPath,
    relatedLessonPath: question.relatedLessonPath,
    reviewText: `이 문제는 ${question.section} 섹션과 연결됩니다. 정답 근거를 다시 읽고, 이 항목을 AI에게 어떤 목적, 책임, 검증 기준으로 설명할지 한 문장으로 다시 써보세요. AI 지시 문장: ${question.aiPromptUse} AI 출력 리뷰 질문: ${question.aiReviewQuestion}`,
    miniLesson: `바이브코딩 학습자는 코드를 손으로 암기하는 사람이 아니라 AI에게 올바른 맥락과 검토 기준을 주는 사람입니다. 소스에서 배울 것은 문법 줄이 아니라 역할, 필요한 이유, 용어, 첫 구현 단위, 검증 질문입니다. 외우지 말 것: ${question.memorizationWarning}`,
    retryQuestion: {
      ...question,
      id: `${question.id}-retry`,
      question: `[재도전] ${question.question}`
    },
    createdAt: new Date().toISOString(),
    attemptNumber,
    resolved: false
  };
}

function inferMistakeReason(question: QuizQuestion): string[] {
  if (question.section === "folders") return ["AI 지시용 폴더 맥락 부족", "아키텍처 책임 경계 혼동"];
  if (question.section === "files") return ["AI 지시용 파일 책임 혼동", "검증 기준 분리 부족"];
  if (question.section === "glossary") return ["AI 프롬프트 용어 맥락 부족", "개념을 구현 판단으로 연결하지 못함"];
  return ["비슷한 앱 전이 전략 부족", "AI 작업 단위 분리 부족"];
}

async function countJsonlLines(filePath: string): Promise<number> {
  if (!await pathExists(filePath)) return 0;
  const text = await fs.readFile(filePath, "utf8");
  return text.split(/\r?\n/).filter(Boolean).length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
