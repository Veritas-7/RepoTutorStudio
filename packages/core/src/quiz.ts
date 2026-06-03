import fs from "node:fs/promises";
import path from "node:path";
import type { FileLesson, FolderLesson, GlossaryTerm, HtmlExportManifest, Quiz, QuizAttempt, QuizQuestion, StudyMode, StudySession, WrongNote } from "@repotutor/shared";
import { htmlAnchor } from "@repotutor/shared";
import { ensureDir, pathExists } from "./fs-utils.js";
import { readJson, writeJson } from "./storage.js";
import { renderWrongNotesMarkdown } from "./markdown.js";
import { renderStudyHtml, type StudyHtmlInput } from "@repotutor/html";

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
  const topicPool = [
    ...folders.map((folder) => ({ section: "folders", title: folder.folderPath, answer: folder.role, lesson: `folders.html#${htmlAnchor(folder.folderPath)}`, terms: ["폴더 구조(folder structure)"] })),
    ...files.map((file) => ({ section: "files", title: file.filePath, answer: file.role, lesson: `files.html#${htmlAnchor(file.filePath)}`, terms: file.glossaryTerms })),
    ...glossary.map((term) => ({ section: "glossary", title: `${term.termKo} (${term.termEn})`, answer: term.simpleDefinition, lesson: `glossary.html#${htmlAnchor(term.termEn)}`, terms: [term.termKo] }))
  ];
  for (let index = 0; index < count; index += 1) {
    const topic = topicPool[index % Math.max(topicPool.length, 1)] ?? { section: "overview", title: session.repo, answer: "프로젝트 목적과 구조를 배우는 것", lesson: "index.html", terms: ["학습 리포트"] };
    const difficulty = index % 5 === 4 ? "hard" : index % 2 === 0 ? "easy" : "medium";
    questions.push({
      id: `q-${String(index + 1).padStart(3, "0")}`,
      section: topic.section,
      difficulty,
      question: `${topic.title}에 대한 설명으로 가장 알맞은 것은?`,
      choices: {
        A: topic.answer,
        B: "사용자 승인 없이 임의 명령을 실행하는 부분입니다.",
        C: "secret 파일 내용을 HTML에 저장하는 부분입니다.",
        D: "분석 결과와 관계없는 임시 캐시입니다."
      },
      correctChoice: "A",
      explanation: `${topic.title}는 리포트에서 ${topic.answer}로 설명됩니다.`,
      whyOtherChoicesAreWrong: {
        A: "정답입니다.",
        B: "RepoTutor는 승인 없는 임의 명령 실행을 금지합니다.",
        C: "secret 파일은 분석과 HTML 저장 대상에서 제외됩니다.",
        D: "리포트의 실제 학습 섹션과 연결된 항목입니다."
      },
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
    .map((entry) => `- ${entry.label}: ${insideHtmlPath(entry.path)} - ${entry.description}`)
    .join("\n");
  const pages = manifest.pages.map((page) => `- ${page.title}: ${insideHtmlPath(page.path)} (${page.bytes} bytes, sha256 ${shortHash(page.sha256)})`).join("\n");
  const assets = manifest.assets.map((asset) => `- ${insideHtmlPath(asset.path)} (${asset.bytes} bytes, sha256 ${shortHash(asset.sha256)})`).join("\n");
  return `# RepoTutor HTML Export\n\nOpen \`index.html\` in a browser to start. This folder is portable and can be copied as one offline report bundle.\n\nUse browser print preview when you need a PDF or paper handout; \`assets/style.css\` includes print rules that hide navigation and expand the report content.\n\nIntegrity metadata uses ${manifest.integrity.algorithm} for ${manifest.integrity.coveredFiles} files. Full hashes are in \`manifest.json\`.\n\n## Entry Points\n\n${entrypoints}\n\n## Pages\n\n${pages}\n\n## Assets\n\n${assets}\n`;
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
    mistakeReason: inferMistakeReason(question),
    relatedConcepts: question.glossaryTerms,
    relatedFolderOrFile: question.relatedLessonPath,
    relatedLessonPath: question.relatedLessonPath,
    reviewText: `이 문제는 ${question.section} 섹션과 연결됩니다. 정답 근거를 다시 읽고, 왜 다른 선택지가 위험한지 확인하세요.`,
    miniLesson: "프로젝트를 배울 때는 이름만 외우는 것보다 역할, 필요한 이유, 제거하면 생기는 문제를 함께 묶어 이해해야 합니다. 이렇게 묶으면 비슷한 프로젝트를 새로 만들 때 어떤 파일을 먼저 만들지 판단할 수 있습니다.",
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
  if (question.section === "folders") return ["폴더 역할 혼동", "설계 의도 이해 부족"];
  if (question.section === "files") return ["파일 책임 혼동", "실행 흐름 이해 부족"];
  if (question.section === "glossary") return ["용어 이해 부족"];
  return ["재구현 순서 이해 부족"];
}

async function countJsonlLines(filePath: string): Promise<number> {
  if (!await pathExists(filePath)) return 0;
  const text = await fs.readFile(filePath, "utf8");
  return text.split(/\r?\n/).filter(Boolean).length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
