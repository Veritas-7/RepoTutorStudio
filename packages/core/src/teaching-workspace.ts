import fs from "node:fs/promises";
import path from "node:path";
import type { Quiz, QuizAttempt, StudySession, WrongNote } from "@repotutor/shared";
import type { AnalysisBundle } from "./scanner.js";
import { ensureDir } from "./fs-utils.js";

export const TEACHING_WORKSPACE_REQUIRED_ARTIFACTS = [
  "MISSION.md",
  "RESOURCES.md",
  "NOTES.md",
  "lessons/0001-source-to-architecture.html",
  "reference/glossary.html",
  "reference/rebuild-cheatsheet.html",
  "learning-records/README.md"
];

export async function writeTeachingWorkspaceArtifacts(session: StudySession, analysis: AnalysisBundle, quiz: Quiz): Promise<void> {
  await Promise.all([
    ensureDir(path.join(session.outputPaths.root, "lessons")),
    ensureDir(path.join(session.outputPaths.root, "reference")),
    ensureDir(path.join(session.outputPaths.root, "learning-records"))
  ]);

  await Promise.all([
    fs.writeFile(path.join(session.outputPaths.root, "MISSION.md"), renderMission(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "RESOURCES.md"), renderResources(analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "NOTES.md"), renderNotes(session, analysis, quiz)),
    fs.writeFile(path.join(session.outputPaths.root, "lessons", "0001-source-to-architecture.html"), renderFirstLesson(session, analysis, quiz)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "glossary.html"), renderGlossaryReference(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "rebuild-cheatsheet.html"), renderRebuildReference(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "learning-records", "README.md"), renderLearningRecordsReadme(session))
  ]);
}

export async function appendQuizLearningRecord(sessionRoot: string, session: StudySession, quiz: Quiz, attempt: QuizAttempt, wrongNotes: WrongNote[]): Promise<void> {
  const recordsDir = path.join(sessionRoot, "learning-records");
  await ensureDir(recordsDir);
  const existing = await fs.readdir(recordsDir).catch(() => []);
  const nextNumber = existing.filter((item) => /^\d{4}-quiz-attempt-(passed|review)\.md$/.test(item)).length + 1;
  const fileName = `${String(nextNumber).padStart(4, "0")}-quiz-attempt-${attempt.wrongCount === 0 ? "passed" : "review"}.md`;
  await fs.writeFile(path.join(recordsDir, fileName), renderQuizLearningRecord(session, quiz, attempt, wrongNotes));
}

function renderMission(session: StudySession, analysis: AnalysisBundle): string {
  return `# MISSION: ${session.owner}/${session.repo}

## Why

${analysis.purposeReport.oneLineSummary}

이 세션의 목적은 소스를 외우거나 전통적인 코딩 문법을 암기하는 것이 아니라, 바이브코딩으로 비슷한 앱을 만들 때 AI에게 설명해야 할 목적, 아키텍처, 용어, 프롬프트, 검증 경계를 익히는 것입니다.

## Success looks like

- ${analysis.purposeReport.similarType} 유형의 앱을 한 문장으로 설명할 수 있다.
- 핵심 폴더와 파일의 책임을 AI 구현 프롬프트로 바꿀 수 있다.
- ${analysis.architectureReport.architectureStyle} 구조가 왜 필요한지 설명할 수 있다.
- 퀴즈를 풀고 오답을 learning-records에 증거 기반으로 남길 수 있다.

## Constraints

- 분석은 읽기 전용입니다.
- secret 후보 파일은 소스 복사, Codex 프롬프트, HTML 산출물에서 제외합니다.
- analyzed project의 install, build, test, run 명령은 자동 실행하지 않습니다.
- Codex SDK가 사용량 제한이나 인증 문제로 실패해도 정적 리포트와 퀴즈는 계속 생성합니다.

## Out of scope

- 이 세션은 하나의 source mission만 다룹니다.
- 문법을 처음부터 손코딩하는 전통 학습 과정은 목표가 아닙니다.
- RepoTutor가 확인하지 않은 실행 결과를 성공으로 기록하지 않습니다.
`;
}

function renderResources(analysis: AnalysisBundle): string {
  const knowledge = analysis.suggestedReadsReport.items.slice(0, 12).map((item) => {
    return `- \`${item.filePath}\`: ${item.reason} (evidence ${item.evidenceCount}, related files ${item.relatedFileCount})`;
  }).join("\n") || "- 분석된 소스에서 추천 읽기 항목을 찾지 못했습니다.";

  const sourcePages = [
    "- `html/overview.html`: 제품 목적과 대상 사용자",
    "- `html/architecture.html`: 아키텍처 이유와 AI prompt brief",
    "- `html/glossary.html`: AI 지시에 필요한 핵심 용어",
    "- `html/rebuild.html`: 재구현 순서와 검증 기준",
    "- `html/learning-journal.html`: 다음 세션 질문과 review queue",
    "- `html/teaching-workspace.html`: MISSION/RESOURCES/lessons/reference/learning-records 안내"
  ].join("\n");

  const gaps = [
    ...analysis.runtimeEnvironmentReport.missingSignals,
    ...analysis.coverageReport.uncoveredImportantFiles.map((file) => `추가 근거 필요: ${file}`)
  ].slice(0, 12).map((gap) => `- ${gap}`).join("\n") || "- 현재 정적 분석 기준으로 명확한 resource gap은 없습니다.";

  return `# RESOURCES

RepoTutor는 일반 AI 지식을 다시 저장하려는 앱이 아닙니다. 이 세션에서 복사·분석한 source evidence는 특정 프로젝트의 목적, 역할, 아키텍처 선택, 검증 경계를 확인하기 위한 근거입니다.

## Knowledge

${knowledge}

## RepoTutor Pages

${sourcePages}

## Wisdom / Review Loops

- 퀴즈를 먼저 풀고 틀린 항목은 \`html/wrong-notes.html\`에서 복습합니다.
- 이해가 증명된 내용만 \`learning-records/*.md\`에 기록합니다.
- 실행이 필요한 주장은 \`html/session-verification.html\`의 검증 경계를 먼저 확인합니다.

## Gaps

${gaps}
`;
}

function renderNotes(session: StudySession, analysis: AnalysisBundle, quiz: Quiz): string {
  return `# NOTES

## Learner State

- Level: ${session.learnerLevel}
- Mode: ${session.studyMode}
- Quiz questions: ${quiz.totalQuestions}
- Primary language: ${analysis.languageReport.primaryLanguage}

## Teaching Preferences

- 한국어 설명을 우선하고, 필요한 영어 기술 용어는 괄호로 병기합니다.
- 문법 암기보다 목적, 책임 경계, 재구현 프롬프트, 검증 질문을 우선합니다.
- 사용자가 이미 아는 영역은 반복 설명하지 않고 다음 장벽으로 이동합니다.

## Guardrails

- learning-records는 퀴즈 시도처럼 이해 증거가 생긴 뒤에만 생성합니다.
- lesson은 한 번에 하나의 좁은 주제를 다룹니다.
- reference 문서는 자주 다시 보는 cheat sheet 역할만 합니다.
- source 전체를 장기 내장하지 않고 학습 산출물과 근거 링크만 남깁니다.
`;
}

function renderLearningRecordsReadme(session: StudySession): string {
  return `# Learning Records

이 폴더는 ${session.owner}/${session.repo} 세션에서 실제 이해 증거가 생긴 뒤에만 기록됩니다.

초기 lesson 생성만으로는 사용자가 배웠다고 판단하지 않습니다. 퀴즈 제출, 오답 교정, 사용자의 명시적 피드백처럼 확인 가능한 사건이 있을 때 \`0001-...\` 기록이 추가됩니다.
`;
}

function renderQuizLearningRecord(session: StudySession, quiz: Quiz, attempt: QuizAttempt, wrongNotes: WrongNote[]): string {
  const status = attempt.wrongCount === 0 ? "mastered" : "needs-review";
  const relatedNotes = wrongNotes
    .filter((note) => attempt.wrongQuestionIds.includes(note.questionId))
    .map((note) => `- ${note.questionId}: ${note.relatedConcepts.join(", ")} - ${note.reviewText}`)
    .join("\n") || "- 오답 없음";

  return `# Quiz Attempt Learning Record

## Evidence

- Session: ${session.sessionId}
- Attempt: ${attempt.attemptId}
- Created: ${attempt.createdAt}
- Score: ${attempt.score}
- Correct: ${attempt.correctCount}/${quiz.totalQuestions}
- Wrong: ${attempt.wrongCount}
- Status: ${status}

## What this proves

${attempt.wrongCount === 0
    ? "이번 퀴즈 범위의 폴더, 파일, 용어 연결을 현재 난이도에서 설명할 수 있습니다."
    : "이번 퀴즈 범위 중 일부 개념은 다시 복습해야 합니다. 이 기록은 이해 완료가 아니라 다음 수업 난이도를 낮추는 근거입니다."}

## Review Items

${relatedNotes}

## Next Teaching Move

${attempt.wrongCount === 0
    ? "다음 lesson은 재구현 로드맵이나 프롬프트 팩을 실제 AI 구현 지시로 바꾸는 단계로 이동합니다."
    : "다음 lesson은 오답 개념만 좁게 다루고, 같은 질문을 다른 예시로 재시도합니다."}
`;
}

function renderFirstLesson(session: StudySession, analysis: AnalysisBundle, quiz: Quiz): string {
  const focusFolders = analysis.folderLessons.slice(0, 4).map((folder) => `<li><strong>${escape(folder.folderPath)}</strong><br>${escape(folder.whyItExists)}</li>`).join("");
  const focusFiles = analysis.fileLessons.slice(0, 4).map((file) => `<li><strong>${escape(file.filePath)}</strong><br>${escape(file.sourceRoleSummary)}</li>`).join("");
  const checkpoints = analysis.learningJournalReport.openQuestions.slice(0, 4).map((item) => `<li>${escape(item.question)}</li>`).join("");

  return htmlDocument("0001 Source to Architecture", `
    <main>
      <p class="eyebrow">Lesson 0001 · ${escape(session.owner)}/${escape(session.repo)}</p>
      <h1>소스 지도를 아키텍처 언어로 바꾸기</h1>
      <p class="lead">${escape(analysis.purposeReport.oneLineSummary)}</p>
      <section>
        <h2>오늘 하나만 배울 것</h2>
        <p>이 lesson의 목표는 전체 코드를 외우는 것이 아니라, “이 프로젝트를 AI에게 어떻게 설명해야 비슷한 앱을 만들 수 있는가”를 잡는 것입니다.</p>
      </section>
      <section class="grid">
        <article>
          <h2>먼저 볼 폴더</h2>
          <ul>${focusFolders}</ul>
        </article>
        <article>
          <h2>먼저 볼 파일</h2>
          <ul>${focusFiles}</ul>
        </article>
      </section>
      <section>
        <h2>연습</h2>
        <ol>
          <li><a href="../html/overview.html">Overview</a>에서 목적을 한 문장으로 다시 씁니다.</li>
          <li><a href="../html/architecture.html">Architecture</a>에서 책임 경계 3개를 고릅니다.</li>
          <li><a href="../html/vibe-coding-prompt-pack.html">Prompt Pack</a>에서 첫 구현 프롬프트를 복사해 본인 말로 줄입니다.</li>
          <li><a href="../html/quiz.html">Quiz</a> ${quiz.totalQuestions}문제를 풀고, 결과가 생기면 learning-records를 확인합니다.</li>
        </ol>
      </section>
      <section>
        <h2>다음 질문</h2>
        <ul>${checkpoints}</ul>
      </section>
    </main>
  `);
}

function renderGlossaryReference(session: StudySession, analysis: AnalysisBundle): string {
  const terms = analysis.glossary.slice(0, 80).map((term) => `
    <article>
      <h2>${escape(term.termKo)} <small>${escape(term.termEn)}</small></h2>
      <p>${escape(term.simpleDefinition)}</p>
      <p class="muted">${escape(term.projectSpecificMeaning)}</p>
      <p><strong>프롬프트 사용:</strong> ${escape(term.exampleFromRepo)}</p>
    </article>
  `).join("");
  return htmlDocument("Glossary Reference", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>바이브코딩 필수 용어집</h1>
      <p class="lead">이 용어를 외우는 것이 아니라, AI에게 책임과 검증 기준을 정확히 말할 때 사용합니다.</p>
      <section class="cards">${terms}</section>
    </main>
  `);
}

function renderRebuildReference(session: StudySession, analysis: AnalysisBundle): string {
  const steps = analysis.rebuildRoadmap.steps.slice(0, 16).map((step) => `
    <article>
      <h2>${step.order}. ${escape(step.title)}</h2>
      <p>${escape(step.goal)}</p>
      <p class="muted">${escape(step.whyNeeded)}</p>
      <h3>AI Prompt</h3>
      <pre>${escape(step.aiPrompt)}</pre>
      <h3>Completion Criteria</h3>
      <ul>${step.completionCriteria.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
    </article>
  `).join("");
  return htmlDocument("Rebuild Cheatsheet", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>재구현 치트시트</h1>
      <p class="lead">전통적인 손코딩 순서가 아니라, AI에게 줄 수 있는 얇은 vertical slice 순서입니다.</p>
      <section class="cards">${steps}</section>
    </main>
  `);
}

function htmlDocument(title: string, body: string): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  <style>
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #162426; background: #edf4f1; }
    body { margin: 0; }
    main { max-width: 1100px; margin: 0 auto; padding: 32px; }
    h1 { font-size: clamp(30px, 5vw, 54px); line-height: 1.03; margin: 0 0 16px; }
    h2 { margin: 0 0 10px; }
    a { color: #0f766e; font-weight: 800; }
    section, article { background: rgba(255,255,255,.86); border: 1px solid #cbdad6; border-radius: 8px; padding: 18px; margin: 14px 0; }
    .eyebrow { color: #0f766e; font-size: 13px; font-weight: 900; text-transform: uppercase; }
    .lead { color: #465d61; font-size: 18px; line-height: 1.55; }
    .muted { color: #5b6f73; }
    .grid, .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    pre { white-space: pre-wrap; background: #102426; color: #f6fbf7; padding: 14px; border-radius: 8px; overflow-wrap: anywhere; }
    small { color: #607477; font-size: 14px; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function escape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
