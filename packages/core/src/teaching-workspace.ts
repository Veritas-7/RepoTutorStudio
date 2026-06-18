import fs from "node:fs/promises";
import path from "node:path";
import type { Quiz, QuizAttempt, StudySession, WrongNote } from "@repotutor/shared";
import type { AnalysisBundle } from "./scanner.js";
import { ensureDir } from "./fs-utils.js";

export interface LearnerBriefInput {
  sourcePath: string;
  copiedRelPath: string;
  bytes: number;
  sha256: string;
  text: string;
}

export const TEACHING_WORKSPACE_REQUIRED_ARTIFACTS = [
  "MISSION.md",
  "RESOURCES.md",
  "NOTES.md",
  "lessons/0001-source-to-architecture.html",
  "reference/glossary.html",
  "reference/rebuild-cheatsheet.html",
  "reference/architecture-principle-playbook.html",
  "reference/architecture-principle-playbook.md",
  "reference/source-to-build-interview.html",
  "reference/source-to-build-interview.md",
  "reference/similar-app-transfer-map.html",
  "reference/similar-app-transfer-map.md",
  "reference/learner-goal-alignment.html",
  "reference/learner-goal-alignment.md",
  "reference/ai-implementation-loop.html",
  "reference/ai-implementation-loop.md",
  "reference/learner-role-contract.html",
  "reference/learner-role-contract.md",
  "reference/ai-output-review-rubric.html",
  "reference/ai-output-review-rubric.md",
  "reference/vibe-coding-mastery-checklist.html",
  "reference/vibe-coding-mastery-checklist.md",
  "reference/vibe-coding-implementation-brief.html",
  "reference/vibe-coding-implementation-brief.md",
  "reference/ai-prompt-readiness-checklist.html",
  "reference/ai-prompt-readiness-checklist.md",
  "reference/ai-prompt-ab-lab.html",
  "reference/ai-prompt-ab-lab.md",
  "reference/source-absorption-ledger.html",
  "reference/source-absorption-ledger.md",
  "reference/source-retention-guide.html",
  "learning-records/README.md"
];

export async function writeTeachingWorkspaceArtifacts(session: StudySession, analysis: AnalysisBundle, quiz: Quiz, learnerBrief?: LearnerBriefInput): Promise<void> {
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
    fs.writeFile(path.join(session.outputPaths.root, "reference", "architecture-principle-playbook.html"), renderArchitecturePrinciplePlaybookHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "architecture-principle-playbook.md"), renderArchitecturePrinciplePlaybookMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "source-to-build-interview.html"), renderSourceToBuildInterviewHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "source-to-build-interview.md"), renderSourceToBuildInterviewMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "similar-app-transfer-map.html"), renderSimilarAppTransferMapHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "similar-app-transfer-map.md"), renderSimilarAppTransferMapMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "learner-goal-alignment.html"), renderLearnerGoalAlignmentHtml(session, analysis, learnerBrief)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "learner-goal-alignment.md"), renderLearnerGoalAlignmentMarkdown(session, analysis, learnerBrief)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-implementation-loop.html"), renderAiImplementationLoopHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-implementation-loop.md"), renderAiImplementationLoopMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "learner-role-contract.html"), renderLearnerRoleContractHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "learner-role-contract.md"), renderLearnerRoleContractMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-output-review-rubric.html"), renderAiOutputReviewRubricHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-output-review-rubric.md"), renderAiOutputReviewRubricMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "vibe-coding-mastery-checklist.html"), renderVibeCodingMasteryChecklistHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "vibe-coding-mastery-checklist.md"), renderVibeCodingMasteryChecklistMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "vibe-coding-implementation-brief.html"), renderVibeCodingImplementationBriefHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "vibe-coding-implementation-brief.md"), renderVibeCodingImplementationBriefMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-prompt-readiness-checklist.html"), renderAiPromptReadinessChecklistHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-prompt-readiness-checklist.md"), renderAiPromptReadinessChecklistMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-prompt-ab-lab.html"), renderAiPromptAbLabHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "ai-prompt-ab-lab.md"), renderAiPromptAbLabMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "source-absorption-ledger.html"), renderSourceAbsorptionLedgerHtml(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "source-absorption-ledger.md"), renderSourceAbsorptionLedgerMarkdown(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "reference", "source-retention-guide.html"), renderSourceRetentionGuide(session, analysis)),
    fs.writeFile(path.join(session.outputPaths.root, "learning-records", "README.md"), renderLearningRecordsReadme(session))
  ]);
}

export async function appendQuizLearningRecord(sessionRoot: string, session: StudySession, quiz: Quiz, attempt: QuizAttempt, wrongNotes: WrongNote[]): Promise<string> {
  const recordsDir = path.join(sessionRoot, "learning-records");
  await ensureDir(recordsDir);
  const existing = await fs.readdir(recordsDir).catch(() => []);
  const nextNumber = existing.filter((item) => /^\d{4}-quiz-attempt-(passed|review)\.md$/.test(item)).length + 1;
  const fileName = `${String(nextNumber).padStart(4, "0")}-quiz-attempt-${attempt.wrongCount === 0 ? "passed" : "review"}.md`;
  const recordPath = path.join(recordsDir, fileName);
  await fs.writeFile(recordPath, renderQuizLearningRecord(session, quiz, attempt, wrongNotes));
  return recordPath;
}

export async function findQuizLearningRecord(sessionRoot: string, attemptId: string): Promise<string | null> {
  const recordsDir = path.join(sessionRoot, "learning-records");
  const entries = await fs.readdir(recordsDir).catch(() => []);
  for (const entry of entries.filter((item) => /^\d{4}-quiz-attempt-(passed|review)\.md$/.test(item)).sort()) {
    const recordPath = path.join(recordsDir, entry);
    const text = await fs.readFile(recordPath, "utf8").catch(() => "");
    if (text.includes(`- Attempt: ${attemptId}`)) return recordPath;
  }
  return null;
}

function renderMission(session: StudySession, analysis: AnalysisBundle): string {
  return `# MISSION: ${session.owner}/${session.repo}

## Why

${analysis.purposeReport.oneLineSummary}

이 세션의 목적은 소스를 외우거나 전통적인 코딩 문법을 암기하는 것이 아니라, 바이브코딩으로 비슷한 앱을 만들 때 AI에게 설명해야 할 목적, 아키텍처, 용어, 프롬프트, 검증 경계를 익히는 것입니다.

소스는 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다. AI는 일반 개발 지식을 이미 가지고 있으므로, RepoTutor는 이 저장소에서만 확인되는 제품 의도, 책임 지도, 아키텍처 이유, AI 지시 맥락, 검증 기준을 학습자에게 남깁니다.

## 학습 경계

- 배우지 않는 것: 언어 문법 암기, 라인별 코딩, 프레임워크 API를 전통 수업처럼 외우는 과정이 아닙니다.
- 반드시 배우는 것: 제품 목적, 아키텍처 이유, 역할 경계, 핵심 용어, AI 프롬프트, 수락 기준, 검증 습관입니다.
- AI에게 맡기는 것: 실제 코딩은 AI가 담당하고, 학습자는 무엇을 만들지와 왜 그렇게 검증할지를 지휘합니다.

## Source cleanup decision

- 생성된 세션 \`source/\` 스냅샷은 영구 학습 콘텐츠가 아니라 이 학습 세션의 프로젝트별 임시 근거입니다.
- 정리 전에는 reference/source-absorption-ledger.html, html/session-verification.html, 검증 기록, reference/source-retention-guide.html, README.study.md가 남아 있어야 합니다.
- 흡수 기록, 세션 검증, 검증 기록, source-retention-guide가 READY_REVIEW여도 이는 정리 검토 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.
- 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 뒤에만 prune-source --apply --confirm DELETE-SOURCE-SNAPSHOT로 생성된 세션 \`source/\` 스냅샷만 정리합니다.
- DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인입니다.
- 조사 필요 항목이 남아 있거나 검증 리포트와 검증 기록이 부족하면 생성된 세션 \`source/\` 스냅샷은 보존합니다.

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
    "- `reference/architecture-principle-playbook.html`: 문법 암기 대신 아키텍처 원리와 책임 판단을 배우는 플레이북",
    "- `reference/source-to-build-interview.html`: 소스 이해를 자기 설명 질문과 AI 확인 질문으로 바꾸는 빌드 인터뷰",
    "- `reference/similar-app-transfer-map.html`: 원본에서 가져갈 원리와 새 앱에 맞게 바꿀 결정을 분리하는 전이 지도",
    "- `reference/learner-goal-alignment.html`: 학습자가 가져온 PRD/이슈/프롬프트를 소스 기반 목적, 아키텍처, 검증 기준과 맞춰보는 목표 정렬 리포트",
    "- `reference/ai-implementation-loop.html`: AI가 코드를 만든 뒤 다음 질문 후보, 검토, 수정, 검증을 반복하는 구현 대화 루프",
    "- `reference/learner-role-contract.html`: 바이브코딩 학습자가 맡을 일과 AI에게 맡길 일",
    "- `reference/ai-output-review-rubric.html`: AI 산출물을 목적, 근거, 검증 기준으로 검토하는 기준표",
    "- `reference/vibe-coding-mastery-checklist.html`: 비슷한 앱 제작 준비도와 남은 학습 gap",
    "- `reference/vibe-coding-implementation-brief.html`: AI에게 넘길 한 장짜리 구현 브리프",
    "- `reference/ai-prompt-readiness-checklist.html`: AI에게 보내기 전 프롬프트가 충분한지 점검하는 체크리스트",
    "- `reference/ai-prompt-ab-lab.html`: 막연한 요청과 source-grounded 구현 요청 후보를 비교하는 A/B 랩",
    "- `reference/source-absorption-ledger.html`: 이 소스에서 흡수한 기능과 추가 조사 필요 여부",
    "- `reference/source-retention-guide.html`: 생성된 세션 `source/` 스냅샷 정리 검토 판단 기준",
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

## Learner Role

- 학습자는 전문 개발자가 아니라 바이브코딩 개발자입니다.
- 목표는 ${session.owner}/${session.repo}와 비슷한 앱을 AI와 만들 수 있도록 제품 목적, 아키텍처 이유, 책임 경계, 핵심 용어, AI 프롬프트, 수락 기준, 검증 질문을 설명하는 것입니다.
- AI는 실제 코드 작성과 반복 구현을 담당하고, 학습자는 무엇을 만들지, 왜 이 구조가 필요한지, 무엇을 통과 기준으로 볼지를 지휘합니다.
- 에이전트는 전통적인 문법 강의나 라인별 코딩 수업으로 확장하지 말고, source evidence를 AI 구현 지시와 리뷰 기준으로 바꿉니다.

## Teaching Preferences

- 한국어 설명을 우선하고, 필요한 영어 기술 용어는 괄호로 병기합니다.
- 문법 암기보다 목적, 책임 경계, 재구현 프롬프트, 검증 질문을 우선합니다.
- 사용자가 이미 아는 영역은 반복 설명하지 않고 다음 장벽으로 이동합니다.

## Guardrails

- learning-records는 퀴즈 시도처럼 이해 증거가 생긴 뒤에만 생성합니다.
- lesson은 한 번에 하나의 좁은 주제를 다룹니다.
- reference 문서는 자주 다시 보는 AI 지시 문장, 리뷰 질문, 전이 판단, 소스 정리 근거 역할을 합니다.
- source 전체를 장기 내장하지 않고 학습 산출물과 근거 링크만 남깁니다.
  - 아키텍처는 reference/architecture-principle-playbook.html에서 왜 필요한가, 검토 후 다듬을 요청 후보, 잘못 만들면 생기는 문제, 검증 질문으로 설명합니다.
  - reference/source-to-build-interview.html에서 목적, 구조, 책임, 용어, 첫 slice, 검증을 자기 말로 답한 뒤 AI에게 확인시키는 질문을 사용합니다.
  - reference/similar-app-transfer-map.html에서 원본에서 유지할 원리, 새 앱에 맞게 바꿀 결정, 검토 후 다듬을 전이 요청 후보, 검증 기준을 분리합니다.
  - reference/learner-goal-alignment.html에서 사용자의 PRD/이슈/프롬프트를 source-grounded 목적, 아키텍처, acceptance criteria, 검증 기준과 맞춥니다.
  - reference/ai-implementation-loop.html에서 AI 구현 결과를 PLAN / OBSERVE / CHECK / REVISE / VERIFY / NEXT 루프로 검토하고 다음 질문 후보로 바꿉니다.
  - 바이브코딩 학습자가 직접 배울 것과 AI에게 맡길 것은 reference/learner-role-contract.html에 고정합니다.
- AI가 만든 코드나 설계는 reference/ai-output-review-rubric.html의 기준으로 목적, 아키텍처, 근거, 검증, 사람 판단 항목을 다시 확인합니다.
  - 비슷한 앱을 만들 준비가 됐는지는 reference/vibe-coding-mastery-checklist.html에서 목적, 아키텍처, 용어, 프롬프트, 검증, 정리 판단으로 확인합니다.
  - 실제 구현을 AI에게 맡길 때는 reference/vibe-coding-implementation-brief.html의 목적, 첫 vertical slice, 수락 기준, 검증 계획을 같이 제공합니다.
  - AI에게 프롬프트를 보내기 전에는 reference/ai-prompt-readiness-checklist.html에서 맥락, 관련 source evidence, acceptance criteria, 검증 assertion, 범위 제한을 확인합니다.
  - reference/ai-prompt-ab-lab.html에서 막연한 요청 A와 source-grounded 요청 B를 비교해, 왜 B가 바이브코딩에 더 안전한지 확인합니다.
  - 무엇을 흡수했고 더 조사할 필요가 없는지는 reference/source-absorption-ledger.html을 먼저 확인합니다.
- 생성된 세션 \`source/\` 스냅샷 정리 검토 여부는 reference/source-retention-guide.html의 retained artifact, verification checkpoint, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤에만 판단합니다.
`;
}

function renderLearningRecordsReadme(session: StudySession): string {
  return `# Learning Records

이 폴더는 ${session.owner}/${session.repo} 세션에서 실제 이해 증거가 생긴 뒤에만 기록됩니다.

초기 lesson 생성만으로는 사용자가 배웠다고 판단하지 않습니다. 퀴즈 제출, 오답 교정, 사용자의 명시적 피드백처럼 확인 가능한 사건이 있을 때 \`0001-...\` 기록이 추가됩니다.

## Evidence purpose

- 이 기록은 단순 점수 저장이나 문법 암기표가 아닙니다.
- 학습자가 제품 목적, 아키텍처 이유, 파일 책임, 핵심 용어, AI 구현 프롬프트, 수락 기준, 검증 질문을 설명할 수 있음을 남기는 증거입니다.
- 오답이 있으면 AI에게 맡길 보강 프롬프트와 다음 작은 lesson 범위를 줄이는 데 사용합니다.
- 통과해도 생성된 세션 \`source/\` 스냅샷 정리 검토는 source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 확인 뒤 별도로 판단합니다.
`;
}

function renderQuizLearningRecord(session: StudySession, quiz: Quiz, attempt: QuizAttempt, wrongNotes: WrongNote[]): string {
  const status = attempt.wrongCount === 0 ? "mastered" : "needs-review";
  const relatedNotes = wrongNotes
    .filter((note) => attempt.wrongQuestionIds.includes(note.questionId))
    .map((note) => [
      `- ${note.questionId}: ${note.relatedConcepts.join(", ")} - ${note.reviewText}`,
      note.selectedChoiceRationale ? `  - 선택지 복습: ${learningRecordMarkdownText(note.selectedChoiceRationale)}` : null
    ].filter(Boolean).join("\n"))
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
    : "이번 퀴즈 범위 중 일부 개념은 다시 복습해야 합니다. 이 기록은 이해 확정 선언이 아니라 다음 수업 난이도를 낮추는 근거입니다."}

## Vibe-coding evidence

- 이 기록은 문법 암기표가 아니라 AI에게 줄 구현 맥락 준비도입니다.
- 통과 기준은 제품 목적, 책임 경계, 핵심 용어, AI 구현 프롬프트, 수락 기준, 검증 질문을 설명할 수 있는지입니다.
- 오답이 있으면 다음 응답은 코드 강의가 아니라 부족한 개념을 보강하는 AI repair prompt로 바꿉니다.
- 이 기록만으로 생성된 세션 \`source/\` 스냅샷 정리를 결정하지 않고, source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 확인합니다.

## Review Items

${relatedNotes}

## Next Teaching Move

${attempt.wrongCount === 0
    ? "다음 lesson은 재구현 로드맵이나 프롬프트 팩을 실제 AI 구현 지시로 바꾸는 단계로 이동합니다."
    : "다음 lesson은 오답 개념만 좁게 다루고, 같은 질문을 다른 예시로 재시도합니다."}
`;
}

function learningRecordMarkdownText(value: string): string {
  return value
    .replaceAll("생성된 세션 source/ 스냅샷", "생성된 세션 `source/` 스냅샷")
    .replaceAll("생성 세션 source/ 스냅샷", "생성 세션 `source/` 스냅샷");
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
      <section>
        <h2>바이브코딩 수업 경계</h2>
        <ul>
          <li>배우지 않는 것: 언어 문법 암기, 라인별 코딩, 원본 소스 전체 내장.</li>
          <li>반드시 배우는 것: 제품 목적, 아키텍처 이유, 폴더/파일 책임, 핵심 용어, AI 구현 프롬프트, 수락 기준, 검증 질문.</li>
          <li>AI에게 맡기는 것: 실제 코드 작성, 반복 구현, 문법 세부사항 적용.</li>
          <li>정리 판단: 이 lesson 통과만으로 생성된 세션 <code>source/</code> 스냅샷 정리를 결정하지 않고, source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 함께 확인합니다.</li>
        </ul>
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
          <li><a href="../html/vibe-coding-prompt-pack.html">Prompt Pack</a>에서 첫 구현 프롬프트를 검토하고 본인 말로 줄입니다.</li>
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
    <article data-glossary-use="ai-prompt-review-reference">
      <h2>${escape(term.termKo)} <small>${escape(term.termEn)}</small></h2>
      <p>${escape(term.simpleDefinition)}</p>
      <p class="muted">${escape(term.projectSpecificMeaning)}</p>
      <p><strong>Source evidence:</strong> ${escape(term.exampleFromRepo)}</p>
      <h3>AI에게 지시할 문장</h3>
      <p>${escape(term.promptUse)}</p>
      <h3>AI 출력 리뷰 질문</h3>
      <p>${escape(term.reviewQuestion)}</p>
      <h3>외우지 말 것</h3>
      <p>${escape(term.memorizationWarning)}</p>
    </article>
  `).join("");
  return htmlDocument("Glossary Reference", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>바이브코딩 필수 용어집</h1>
      <p class="lead">이 용어를 외우는 것이 아니라, AI에게 책임과 검증 기준을 정확히 말할 때 사용합니다.</p>
      <section>
        <h2>용어 사용 규칙</h2>
        <ul>
          <li>용어는 개발자 시험 단어가 아니라 AI와 소통하는 책임 라벨입니다.</li>
          <li>각 용어를 쓸 때는 이 용어가 어떤 책임, 데이터 흐름, 검증 기준에 연결되는지 함께 말합니다.</li>
          <li>설명하지 못하는 용어는 문법 세부사항으로 외우지 말고, 이 구조가 왜 필요한지 질문으로 바꿉니다.</li>
          <li>source evidence에서 발견한 용어는 구현 프롬프트 문장이나 AI 출력 리뷰 체크리스트로 바꿉니다.</li>
        </ul>
      </section>
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
      <h3>수락/검증 기준</h3>
      <ul>${step.completionCriteria.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
    </article>
  `).join("");
  return htmlDocument("Rebuild Cheatsheet", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>재구현 치트시트</h1>
      <p class="lead">전통적인 손코딩 순서가 아니라, AI에게 줄 수 있는 얇은 vertical slice 순서입니다.</p>
      <section>
        <h2>바이브코딩 재구현 규칙</h2>
        <ul>
          <li>학습자는 제품 목적, 사용자 문제, 아키텍처 책임, 수락 기준, 검증 질문을 먼저 고정합니다.</li>
          <li>AI는 실제 코드 작성, 반복 구현, 문법 세부사항 적용을 맡습니다.</li>
          <li>원본 소스 전체를 복사하거나 앱 지식으로 내장하지 않고, source evidence를 구현 지시와 리뷰 기준으로 바꿉니다.</li>
          <li>각 slice는 AI 요청을 보내거나 결과를 수락하기 전에 실행 명령, 테스트, 화면 확인, 사람 판단 항목 중 무엇으로 검증할지 적어야 합니다.</li>
        </ul>
      </section>
      <section class="cards">${steps}</section>
    </main>
  `);
}

function learnerRoleContractItems(analysis: AnalysisBundle): {
  learnerOwns: string[];
  aiOwns: string[];
  notRequired: string[];
  mustAsk: string[];
} {
  const firstTerm = analysis.dailySummaryReport.termsToKnow[0]?.term ?? "architecture responsibility";
  const firstStep = analysis.rebuildRoadmap.steps[0]?.title ?? "첫 vertical slice";
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0]?.boundary ?? "정적 분석과 실행 검증의 경계";
  return {
    learnerOwns: [
      `이 소스의 목적을 한 문장으로 설명하기: ${analysis.purposeReport.oneLineSummary}`,
      `${analysis.architectureReport.architectureStyle} 구조가 왜 필요한지와 책임 경계를 말하기`,
      `${firstTerm} 같은 AI 지시용 용어를 필요한 순간에 꺼내 쓰기`,
      `${firstBoundary}를 기준으로 AI 산출물을 그대로 믿어도 되는지 판단하기`
    ],
    aiOwns: [
      "구체적인 코드 작성, 파일 생성, 반복 구현, 문법 세부사항 검색과 적용",
      `${firstStep} 단계의 작은 구현 단위를 실제 코드 변경으로 옮기기`,
      "테스트 초안, 오류 수정안, 리팩토링 후보, 문서 초안을 빠르게 생성하기",
      "사용자가 준 목적, 아키텍처 이유, 용어, 검증 기준을 벗어나지 않도록 산출물을 맞추기"
    ],
    notRequired: [
      "프로그래밍 언어 문법을 처음부터 손으로 모두 외우기",
      "원본 소스 전체를 장기 기억하거나 앱 지식으로 내장하기",
      "모든 파일을 줄 단위로 설명하거나 재작성하기",
      "PRD, SDD, TDD, acceptance criteria 같은 용어를 의식처럼 전부 적용하기"
    ],
    mustAsk: [
      "코드를 쓰기 전에 목적, 사용자, 제외 범위, 수락/검증 기준을 먼저 분리해줘.",
      "이 아키텍처에서 폴더와 파일 책임이 섞이면 어디가 위험한지 알려줘.",
      "정적 소스 근거로 확인된 사실과 실행/테스트가 필요한 가정을 나눠줘.",
      "첫 구현은 작은 vertical slice 하나만 만들고, 검증 명령과 사람 판단 항목을 같이 보고해줘."
    ]
  };
}

function renderLearnerRoleContractHtml(session: StudySession, analysis: AnalysisBundle): string {
  const contract = learnerRoleContractItems(analysis);
  return htmlDocument("Learner Role Contract", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>바이브코딩 학습자 역할 계약</h1>
      <p class="lead">이 세션은 손코딩 문법 암기 수업이 아닙니다. 학습자의 역할은 AI가 비슷한 앱을 만들 수 있도록 목적, 아키텍처 이유, 책임 경계, 필요한 용어, 검증 기준을 정확히 주는 것입니다. 소스는 AI를 훈련시키는 데이터가 아니라, 학습자가 AI에게 줄 프로젝트 맥락을 뽑는 증거입니다.</p>
      <section class="grid">
        <article>
          <h2>학습자가 직접 가져야 할 것</h2>
          <ul>${contract.learnerOwns.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <h2>AI에게 맡겨도 되는 것</h2>
          <ul>${contract.aiOwns.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
        </article>
      </section>
      <section class="grid">
        <article>
          <h2>이 세션에서 목표가 아닌 것</h2>
          <ul>${contract.notRequired.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <h2>반드시 요구할 질문</h2>
          <ul>${contract.mustAsk.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
        </article>
      </section>
      <section>
        <h2>검토 후 다듬을 역할 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 저장소를 기준으로 내가 직접 배워야 할 것은 목적, 아키텍처 이유, 책임 경계, AI 지시용 용어, 검증 기준이야. 소스는 AI를 훈련시키는 내장 데이터가 아니라 내가 AI에게 줄 프로젝트 맥락을 뽑는 증거야. 구체적인 코드 문법과 반복 구현은 AI가 맡아도 돼. 비슷한 앱을 만들기 전에 내가 AI에게 줄 제품 목적, 폴더/파일 책임, 첫 vertical slice, 테스트/실행 검증 질문을 먼저 정리해줘.</pre>
      </section>
    </main>
  `);
}

function renderLearnerRoleContractMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const contract = learnerRoleContractItems(analysis);
  return `# 바이브코딩 학습자 역할 계약

Session: ${session.owner}/${session.repo}

이 세션은 손코딩 문법 암기 수업이 아닙니다. 학습자의 역할은 AI가 비슷한 앱을 만들 수 있도록 목적, 아키텍처 이유, 책임 경계, 필요한 용어, 검증 기준을 정확히 주는 것입니다. 소스는 AI를 훈련시키는 데이터가 아니라, 학습자가 AI에게 줄 프로젝트 맥락을 뽑는 증거입니다.

## 학습자가 직접 가져야 할 것

${contract.learnerOwns.map((item) => `- ${item}`).join("\n")}

## AI에게 맡겨도 되는 것

${contract.aiOwns.map((item) => `- ${item}`).join("\n")}

## 이 세션에서 목표가 아닌 것

${contract.notRequired.map((item) => `- ${item}`).join("\n")}

## 반드시 요구할 질문

${contract.mustAsk.map((item) => `- ${item}`).join("\n")}

## 검토 후 다듬을 역할 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 저장소를 기준으로 내가 직접 배워야 할 것은 목적, 아키텍처 이유, 책임 경계, AI 지시용 용어, 검증 기준이야. 소스는 AI를 훈련시키는 내장 데이터가 아니라 내가 AI에게 줄 프로젝트 맥락을 뽑는 증거야. 구체적인 코드 문법과 반복 구현은 AI가 맡아도 돼. 비슷한 앱을 만들기 전에 내가 AI에게 줄 제품 목적, 폴더/파일 책임, 첫 vertical slice, 테스트/실행 검증 질문을 먼저 정리해줘.
\`\`\`
`;
}

function aiOutputReviewRubricRows(analysis: AnalysisBundle): Array<{
  criterion: string;
  pass: string;
  revise: string;
  block: string;
  evidence: string;
}> {
  const firstFolder = analysis.folderLessons[0];
  const firstFile = analysis.fileLessons[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  return [
    {
      criterion: "제품 목적 일치",
      pass: `AI 산출물이 "${analysis.purposeReport.oneLineSummary}" 목적과 사용자 범위를 유지합니다.`,
      revise: "기능은 동작하지만 원래 목적, 사용자, 제외 범위 설명이 흐려졌습니다.",
      block: "AI가 다른 제품을 만들었거나 원본 목적과 무관한 기능을 중심에 놓았습니다.",
      evidence: "html/overview.html"
    },
    {
      criterion: "아키텍처 책임 경계",
      pass: `${analysis.architectureReport.architectureStyle} 구조와 책임 분리가 유지됩니다.`,
      revise: firstFolder
        ? `${firstFolder.folderPath} 같은 책임 경계가 일부 섞여 있어 폴더/파일 배치를 다시 지시해야 합니다.`
        : "책임 경계 설명이 부족해 폴더와 파일 배치를 다시 물어봐야 합니다.",
      block: "하나의 파일이나 계층에 너무 많은 책임을 몰아넣어 원본 구조에서 배운 이유가 사라졌습니다.",
      evidence: "html/architecture.html"
    },
    {
      criterion: "소스 근거 연결",
      pass: firstFile
        ? `AI 설명이 ${firstFile.filePath} 같은 실제 source role과 연결됩니다.`
        : "AI 설명이 evidence link와 생성된 파일 역할 설명으로 되돌아갈 수 있습니다.",
      revise: "근거 파일 이름은 있지만 왜 그 파일을 봐야 하는지 설명이 약합니다.",
      block: "출처 없는 추측, 존재하지 않는 파일, 확인하지 않은 실행 결과를 사실처럼 말합니다.",
      evidence: "html/evidence.html"
    },
    {
      criterion: "검증 경계 분리",
      pass: firstBoundary
        ? `${firstBoundary.boundary}처럼 정적 근거, 테스트 필요, 실행 필요, 사람 판단 항목을 나눕니다.`
        : "정적 근거, 테스트 필요, 실행 필요, 사람 판단 항목을 나눕니다.",
      revise: "검증 명령은 제안했지만 어떤 주장에 대응하는지 불분명합니다.",
      block: "검증 기록 없이 수락을 요구하거나 실패 시 보고 형식이 없습니다.",
      evidence: "html/session-verification.html"
    },
    {
      criterion: "프롬프트 품질",
      pass: "목적, 관련 파일, 산출물, acceptance criteria, 검증 질문이 함께 들어 있습니다.",
      revise: "프롬프트가 구현 요청 위주라 맥락이나 수락/검증 기준을 보강해야 합니다.",
      block: "AI에게 전체 구현을 한 번에 맡기고 리뷰/검증 기준이 없습니다.",
      evidence: "html/vibe-coding-prompt-pack.html"
    },
    {
      criterion: "사람 판단 보존",
      pass: "AI가 코드 작성을 맡더라도 제품 방향, 위험 수용, 최종 ACCEPT 여부 검토는 학습자에게 남깁니다. PASS_REVIEW도 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.",
      revise: "사람이 결정해야 할 범위가 일부 있지만 체크리스트로 분리되지 않았습니다.",
      block: "AI가 정책, 제품 범위, 삭제, 배포, 보안 판단을 사용자 승인 없이 결정합니다.",
      evidence: "reference/learner-role-contract.html"
    }
  ];
}

function renderAiOutputReviewRubricHtml(session: StudySession, analysis: AnalysisBundle): string {
  const rows = aiOutputReviewRubricRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.criterion)}</h2>
      <p><strong>PASS_REVIEW:</strong> ${escape(row.pass)}</p>
      <p><strong>REVISE:</strong> ${escape(row.revise)}</p>
      <p><strong>BLOCK:</strong> ${escape(row.block)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
    </article>
  `).join("");
  return htmlDocument("AI Output Review Rubric", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>AI 산출물 검토 루브릭</h1>
      <p class="lead">바이브코딩에서 전문성은 코드를 손으로 많이 쓰는 능력보다, AI가 만든 결과를 목적, 아키텍처, 근거, 검증 기준으로 통과 후보·수정·차단 상태로 검토할 수 있는 판단력입니다.</p>
      <section class="grid">
        <article>
          <h2>리뷰 검토 상태</h2>
          <ul>
            <li><strong>PASS_REVIEW</strong>: 목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.</li>
            <li><strong>REVISE</strong>: 방향은 맞지만 맥락, 책임, 근거, 테스트가 부족합니다.</li>
            <li><strong>BLOCK</strong>: 목적을 바꾸거나 근거 없는 주장을 사실처럼 말합니다.</li>
          </ul>
        </article>
        <article>
          <h2>리뷰어 역할</h2>
          <p>학습자는 AI가 만든 코드를 모두 직접 작성할 필요는 없지만, 이 결과가 원본 소스에서 배운 목적과 책임 경계를 지키는지는 판단해야 합니다.</p>
        </article>
      </section>
      <section>
        <h2>검토 기준표</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 리뷰 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 방금 AI가 만든 결과를 바이브코딩 리뷰어처럼 목적, 근거, 검증 기준으로 검토해줘. 원본 소스에서 확인한 목적, 아키텍처 책임, 관련 파일 근거, acceptance criteria, 테스트/실행 검증, 사람이 판단해야 할 결정을 PASS_REVIEW / REVISE / BLOCK으로 나눠줘. PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기록을 확인할 후보 상태로만 표시해줘. 코드 문법 설명보다 왜 통과 후보 또는 반려해야 하는지를 먼저 말해줘.</pre>
      </section>
    </main>
  `);
}

function renderAiOutputReviewRubricMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const rows = aiOutputReviewRubricRows(analysis).map((row) => {
    return `## ${row.criterion}

- PASS_REVIEW: ${row.pass}
- REVISE: ${row.revise}
- BLOCK: ${row.block}
- Evidence: [${row.evidence}](../${row.evidence})`;
  }).join("\n\n");
  return `# AI 산출물 검토 루브릭

Session: ${session.owner}/${session.repo}

바이브코딩에서 전문성은 코드를 손으로 많이 쓰는 능력보다, AI가 만든 결과를 목적, 아키텍처, 근거, 검증 기준으로 통과 후보·수정·차단 상태로 검토할 수 있는 판단력입니다.

## 리뷰 검토 상태

- PASS_REVIEW: 목적과 구조가 맞고 검증 기준이 분리된 검토 후보입니다. 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.
- REVISE: 방향은 맞지만 맥락, 책임, 근거, 테스트가 부족합니다.
- BLOCK: 목적을 바꾸거나 근거 없는 주장을 사실처럼 말합니다.

${rows}

## 검토 후 다듬을 리뷰 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 방금 AI가 만든 결과를 바이브코딩 리뷰어처럼 목적, 근거, 검증 기준으로 검토해줘. 원본 소스에서 확인한 목적, 아키텍처 책임, 관련 파일 근거, acceptance criteria, 테스트/실행 검증, 사람이 판단해야 할 결정을 PASS_REVIEW / REVISE / BLOCK으로 나눠줘. PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기록을 확인할 후보 상태로만 표시해줘. 코드 문법 설명보다 왜 통과 후보 또는 반려해야 하는지를 먼저 말해줘.
\`\`\`
`;
}

function vibeCodingMasteryChecklistRows(analysis: AnalysisBundle): Array<{
  area: string;
  ready: string;
  review: string;
  blocked: string;
  evidence: string;
  prompt: string;
}> {
  const firstTerm = analysis.dailySummaryReport.termsToKnow[0];
  const firstPrompt = analysis.vibeCodingPromptPackReport.promptSequence[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  return [
    {
      area: "제품 목적과 제외 범위",
      ready: `비슷한 앱을 왜 만드는지 "${analysis.purposeReport.oneLineSummary}" 수준으로 한 문장 설명할 수 있습니다.`,
      review: "사용자와 해결 문제가 흐릿하면 AI가 임의 기능을 추가하기 쉽습니다.",
      blocked: "목적 없이 소스 구조만 복제하려고 합니다.",
      evidence: "html/overview.html",
      prompt: "이 소스의 목적, 대상 사용자, 제외 범위를 비슷한 앱 제작용 PRD 첫 문단으로 바꿔줘."
    },
    {
      area: "아키텍처 역할 이해",
      ready: `${analysis.architectureReport.architectureStyle} 구조가 왜 필요한지와 책임 경계를 설명할 수 있습니다.`,
      review: "폴더와 파일 이름은 알지만 왜 분리됐는지 말하지 못합니다.",
      blocked: "AI에게 모든 코드를 한 파일이나 한 계층에 몰아넣게 지시합니다.",
      evidence: "html/architecture.html",
      prompt: "이 아키텍처를 그대로 베끼지 말고, 비슷한 앱에서 유지해야 할 책임 경계와 바꿔도 되는 부분을 나눠줘."
    },
    {
      area: "AI 지시용 용어",
      ready: firstTerm
        ? `${firstTerm.term} 같은 용어를 문법 암기가 아니라 AI 지시와 리뷰 기준으로 사용할 수 있습니다.`
        : "핵심 용어를 문법 암기가 아니라 AI 지시와 리뷰 기준으로 사용할 수 있습니다.",
      review: "용어 설명은 읽었지만 프롬프트에 어떻게 넣을지 아직 약합니다.",
      blocked: "용어를 전혀 쓰지 못해 AI에게 모호한 일반 요청만 보냅니다.",
      evidence: "html/glossary.html",
      prompt: "내가 외워야 할 문법 말고, AI에게 정확히 지시할 때 필요한 용어 5개와 사용 문장을 뽑아줘."
    },
    {
      area: "첫 구현 프롬프트",
      ready: firstPrompt
        ? `${firstPrompt.title} 단계처럼 목적, 입력 근거, 산출물, 수락 기준을 포함한 요청 후보를 검토 후 다듬을 수 있습니다.`
        : "목적, 입력 근거, 산출물, 수락 기준을 포함한 요청 후보를 검토 후 다듬을 수 있습니다.",
      review: "구현 요청은 가능하지만 acceptance criteria와 검증 질문이 빠집니다.",
      blocked: "전체 앱을 한 번에 만들어 달라고만 요청합니다.",
      evidence: "html/vibe-coding-prompt-pack.html",
      prompt: "비슷한 앱의 첫 vertical slice만 만들도록 목적, 관련 파일 근거, 산출물, acceptance criteria, 검증 명령을 포함한 프롬프트를 써줘."
    },
    {
      area: "검증과 리뷰",
      ready: firstBoundary
        ? `${firstBoundary.boundary}처럼 정적 근거와 실행/테스트 필요 항목을 분리해 AI 결과의 PASS_REVIEW / REVISE / BLOCK 검토 상태 후보를 만들 수 있습니다.`
        : "정적 근거와 실행/테스트 필요 항목을 분리해 AI 결과의 PASS_REVIEW / REVISE / BLOCK 검토 상태 후보를 만들 수 있습니다.",
      review: "테스트 명령은 알지만 무엇을 증명하는지 연결이 약합니다.",
      blocked: "AI가 성공이라고 말하면 그대로 믿습니다.",
      evidence: "reference/ai-output-review-rubric.html",
      prompt: "방금 AI 산출물을 목적, 아키텍처, 소스 근거, 검증, 사람 판단 기준으로 PASS_REVIEW / REVISE / BLOCK 검토 상태로 나눠줘. PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보로만 표시해줘."
    },
    {
      area: "소스 사용과 정리 판단",
      ready: "원본 소스는 AI 지식을 늘리기 위한 내장 데이터가 아니라, 이 프로젝트의 특수한 구조를 확인하는 임시 증거라고 설명할 수 있습니다.",
      review: "학습 산출물은 남겼지만 어떤 원본 링크가 끊기는지 아직 확인해야 합니다.",
      blocked: "분석 후에도 원본 전체를 계속 쌓아두거나, 반대로 검증 전에 지워버립니다.",
      evidence: "reference/source-retention-guide.html",
      prompt: "생성된 세션 source/ 스냅샷 정리를 검토해도 되는지, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰, 끊기는 evidence link, 재분석 필요 조건으로 판단해줘."
    }
  ];
}

function renderVibeCodingMasteryChecklistHtml(session: StudySession, analysis: AnalysisBundle): string {
  const rows = vibeCodingMasteryChecklistRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.area)}</h2>
      <p><strong>READY_REVIEW:</strong> ${escape(row.ready)}</p>
      <p><strong>REVIEW:</strong> ${escape(row.review)}</p>
      <p><strong>BLOCKED:</strong> ${escape(row.blocked)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
      <pre>${escape(row.prompt)}</pre>
    </article>
  `).join("");
  return htmlDocument("Vibe-Coding Mastery Checklist", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>바이브코딩 숙련도 체크리스트</h1>
      <p class="lead">이 체크리스트는 손코딩 문법을 외웠는지 보지 않습니다. ${escape(session.owner)}/${escape(session.repo)} 같은 소스를 받아 비슷한 앱을 AI와 만들기 위해 목적, 아키텍처, 용어, 프롬프트, 검증, 소스 정리 판단을 지휘할 준비가 됐는지 확인합니다.</p>
      <section class="grid">
        <article>
          <h2>비슷한 앱 제작 준비도</h2>
          <ul>
            <li><strong>READY_REVIEW</strong>: 근거가 충분해 다음 AI 요청 후보를 검토할 수 있는 상태이며, 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.</li>
            <li><strong>REVIEW</strong>: 검토 질문에 답하고 근거를 보강해야 진행 후보가 됩니다.</li>
            <li><strong>BLOCKED</strong>: 목적, 구조, 검증 기준이 없어 AI가 추측으로 코딩할 위험이 큽니다.</li>
          </ul>
        </article>
        <article>
          <h2>소스의 역할</h2>
          <p>AI는 이미 일반 개발 지식이 있습니다. RepoTutor가 소스를 읽는 이유는 지식을 내장하려는 것이 아니라, 이 프로젝트만의 제품 목적, 책임 경계, 검증 조건을 AI에게 줄 수 있는 말로 바꾸기 위해서입니다.</p>
        </article>
      </section>
      <section>
        <h2>준비도 검토표</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 자기평가 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스의 문법을 외우는 게 목표가 아니야. 비슷한 앱을 AI와 만들기 위해 내가 목적, 아키텍처 책임, 핵심 용어, 첫 구현 프롬프트, 검증/리뷰 기준, 원본 소스 정리 판단을 충분히 설명할 수 있는지 READY_REVIEW / REVIEW / BLOCKED로 평가하되, READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘. 부족한 항목은 학습자가 검토 후 답해야 할 다음 질문 3개로 바꿔줘.</pre>
      </section>
    </main>
  `);
}

function renderVibeCodingMasteryChecklistMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const rows = vibeCodingMasteryChecklistRows(analysis).map((row) => {
    return `## ${row.area}

- READY_REVIEW: ${row.ready}
- REVIEW: ${row.review}
- BLOCKED: ${row.blocked}
- Evidence: [${row.evidence}](../${row.evidence})
- Prompt: ${row.prompt}`;
  }).join("\n\n");
  return `# 바이브코딩 숙련도 체크리스트

Session: ${session.owner}/${session.repo}

이 체크리스트는 손코딩 문법을 외웠는지 보지 않습니다. 이 소스를 받아 비슷한 앱을 AI와 만들기 위해 목적, 아키텍처, 용어, 프롬프트, 검증, 소스 정리 판단을 지휘할 준비가 됐는지 확인합니다.

AI는 이미 일반 개발 지식이 있습니다. RepoTutor가 소스를 읽는 이유는 지식을 내장하려는 것이 아니라, 이 프로젝트만의 제품 목적, 책임 경계, 검증 조건을 AI에게 줄 수 있는 말로 바꾸기 위해서입니다.

READY_REVIEW는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태입니다.

${rows}

## 검토 후 다듬을 자기평가 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스의 문법을 외우는 게 목표가 아니야. 비슷한 앱을 AI와 만들기 위해 내가 목적, 아키텍처 책임, 핵심 용어, 첫 구현 프롬프트, 검증/리뷰 기준, 원본 소스 정리 판단을 충분히 설명할 수 있는지 READY_REVIEW / REVIEW / BLOCKED로 평가하되, READY_REVIEW도 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거, 검증 기준, 검증 기록을 확인할 후보 상태로만 표시해줘. 부족한 항목은 학습자가 검토 후 답해야 할 다음 질문 3개로 바꿔줘.
\`\`\`
`;
}

function implementationBriefData(analysis: AnalysisBundle): {
  productBrief: string;
  architectureBrief: string;
  firstSlice: {
    title: string;
    goal: string;
    why: string;
    aiPrompt: string;
    criteria: string[];
    sourceFocus: string[];
  };
  terms: string[];
  verification: string[];
  nonGoals: string[];
  learnerDecisions: string[];
  copyPrompt: string;
} {
  const firstStep = analysis.rebuildRoadmap.steps[0];
  const firstSliceTitle = firstStep?.title ?? "첫 vertical slice";
  const firstSliceGoal = firstStep?.goal ?? "비슷한 앱의 가장 작은 동작 단위를 먼저 구현합니다.";
  const firstSliceWhy = firstStep?.whyNeeded ?? "한 번에 전체 앱을 만들지 않고 목적, 구조, 검증 경계를 먼저 확인하기 위해 필요합니다.";
  const criteria = firstStep?.completionCriteria?.slice(0, 6) ?? [
    "제품 목적과 제외 범위가 README 또는 PRD 초안에 남아 있습니다.",
    "첫 기능이 실행 또는 테스트 가능한 가장 작은 단위로 구현됩니다.",
    "정적 근거, 테스트 필요 항목, 사람 판단 항목이 분리됩니다."
  ];
  const sourceFocus = firstStep?.sourceRoleFocus?.slice(0, 5).map((item) => `${item.path}: ${item.role}`) ?? analysis.fileLessons.slice(0, 5).map((file) => `${file.filePath}: ${file.sourceRoleSummary}`);
  const terms = analysis.dailySummaryReport.termsToKnow.slice(0, 6).map((term) => `${term.term}: ${term.promptUse}`);
  const verification = analysis.dailySummaryReport.verificationBoundaries.slice(0, 6).map((item) => `${item.boundary}: ${item.nextCheck}`);
  const learnerDecisions = [
    "이 앱이 누구의 어떤 문제를 해결해야 하는지 제품 방향을 학습자가 검토합니다.",
    "원본 구조에서 새 앱에 남길 책임과 버릴 책임을 결정합니다.",
    "AI가 제안한 수락 기준이 사용자 관점에서 충분한지 PASS_REVIEW / REVISE / BLOCK 검토 상태로 나누고, PASS_REVIEW도 최종 ACCEPT, 구현 완료, 배포, 삭제 허가가 아니라 source evidence와 검증 기록 확인 후보로 둡니다.",
    "실행 명령, 테스트 결과, 화면 확인, 사람 판단 중 무엇을 검토 근거로 볼지 정합니다.",
    "source-absorption-ledger, session-verification, verification records, source-retention-guide, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 확인한 뒤 생성된 세션 source/ 스냅샷 정리 검토 여부를 판단합니다."
  ];
  const nonGoals = [
    "원본 소스 전체를 앱 지식으로 내장하지 않습니다.",
    "프로그래밍 문법을 손으로 외우는 전통 수업으로 바꾸지 않습니다.",
    "전체 앱을 한 번에 생성하지 않고 첫 vertical slice만 요청합니다.",
    "실행하지 않은 테스트나 빌드 결과를 성공으로 단정하지 않습니다."
  ];
  const copyPrompt = [
    "나는 전문 개발자가 아니라 바이브코딩 개발자야.",
    `목표 제품: ${analysis.purposeReport.oneLineSummary}`,
    `아키텍처 기준: ${analysis.architectureReport.architectureStyle} - ${analysis.architectureReport.architectureRationale}`,
    `첫 구현 단위: ${firstSliceTitle} - ${firstSliceGoal}`,
    `관련 source focus: ${sourceFocus.join("; ") || "generated reports의 overview, architecture, evidence를 기준으로 삼아줘."}`,
    `수락 기준: ${criteria.join("; ")}`,
    `검증 계획: ${verification.join("; ") || "정적 근거, 테스트 필요, 실행 필요, 사람 판단 항목을 분리해줘."}`,
    `학습자 판단 체크포인트: ${learnerDecisions.join("; ")}`,
    "코드 문법 강의보다 왜 이 구조가 필요한지, 어떤 파일 책임을 유지해야 하는지, 어떤 테스트/리뷰가 필요한지를 먼저 보고해줘.",
    "구현은 첫 vertical slice만 하고, 변경 파일, 실행한 명령, 실패/가정, 다음 프롬프트를 함께 알려줘."
  ].join("\n");
  return {
    productBrief: analysis.purposeReport.oneLineSummary,
    architectureBrief: `${analysis.architectureReport.architectureStyle}: ${analysis.architectureReport.architectureRationale}`,
    firstSlice: {
      title: firstSliceTitle,
      goal: firstSliceGoal,
      why: firstSliceWhy,
      aiPrompt: firstStep?.aiPrompt ?? copyPrompt,
      criteria,
      sourceFocus
    },
    terms,
    verification,
    nonGoals,
    learnerDecisions,
    copyPrompt
  };
}

function renderVibeCodingImplementationBriefHtml(session: StudySession, analysis: AnalysisBundle): string {
  const brief = implementationBriefData(analysis);
  return htmlDocument("Vibe-Coding Implementation Brief", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>바이브코딩 구현 브리프</h1>
      <p class="lead">이 문서는 ${escape(session.owner)}/${escape(session.repo)} 소스를 AI 지식으로 내장하지 않고, 비슷한 앱을 만들기 위해 AI에게 넘길 목적, 아키텍처 책임, 첫 vertical slice, 수락 기준, 검증 계획만 한 장으로 압축합니다.</p>
      <section class="grid">
        <article>
          <h2>제품 목적</h2>
          <p>${escape(brief.productBrief)}</p>
        </article>
        <article>
          <h2>아키텍처 기준</h2>
          <p>${escape(brief.architectureBrief)}</p>
        </article>
      </section>
      <section class="grid">
        <article>
          <h2>첫 vertical slice</h2>
          <p><strong>${escape(brief.firstSlice.title)}</strong></p>
          <p>${escape(brief.firstSlice.goal)}</p>
          <p class="muted">${escape(brief.firstSlice.why)}</p>
        </article>
        <article>
          <h2>source focus</h2>
          <ul>${brief.firstSlice.sourceFocus.map((item) => `<li>${escape(item)}</li>`).join("") || "<li>overview, architecture, evidence 리포트를 기준으로 삼습니다.</li>"}</ul>
        </article>
      </section>
      <section class="grid">
        <article>
          <h2>수락 기준</h2>
          <ul>${brief.firstSlice.criteria.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <h2>검증 계획</h2>
          <ul>${brief.verification.map((item) => `<li>${escape(item)}</li>`).join("") || "<li>정적 근거, 테스트 필요, 실행 필요, 사람 판단 항목을 분리합니다.</li>"}</ul>
        </article>
      </section>
      <section>
        <h2>학습자 판단 체크포인트</h2>
        <ul>${brief.learnerDecisions.map((item) => `<li>${generatedSourceSnapshotHtml(item)}</li>`).join("")}</ul>
      </section>
      <section class="grid">
        <article>
          <h2>AI 지시용 용어</h2>
          <ul>${brief.terms.map((item) => `<li>${escape(item)}</li>`).join("") || "<li>glossary.html에서 필요한 용어를 확인합니다.</li>"}</ul>
        </article>
        <article>
          <h2>하지 않을 것</h2>
          <ul>${brief.nonGoals.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
        </article>
      </section>
      <section>
        <h2>검토 후 다듬을 구현 프롬프트</h2>
        <pre>${escape(brief.copyPrompt)}</pre>
      </section>
      <section>
        <h2>관련 근거</h2>
        <ul>
          <li><a href="../html/overview.html">제품 목적</a></li>
          <li><a href="../html/architecture.html">아키텍처</a></li>
          <li><a href="../html/rebuild.html">재구현 로드맵</a></li>
          <li><a href="../html/session-verification.html">검증 경계</a></li>
          <li><a href="ai-output-review-rubric.html">AI 산출물 검토</a></li>
        </ul>
      </section>
    </main>
  `);
}

function renderVibeCodingImplementationBriefMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const brief = implementationBriefData(analysis);
  return `# 바이브코딩 구현 브리프

Session: ${session.owner}/${session.repo}

이 문서는 소스를 AI 지식으로 내장하지 않고, 비슷한 앱을 만들기 위해 AI에게 넘길 목적, 아키텍처 책임, 첫 vertical slice, 수락 기준, 검증 계획만 한 장으로 압축합니다.

## 제품 목적

${brief.productBrief}

## 아키텍처 기준

${brief.architectureBrief}

## 첫 vertical slice

- Title: ${brief.firstSlice.title}
- Goal: ${brief.firstSlice.goal}
- Why: ${brief.firstSlice.why}

## Source Focus

${brief.firstSlice.sourceFocus.map((item) => `- ${item}`).join("\n") || "- overview, architecture, evidence 리포트를 기준으로 삼습니다."}

## 수락 기준

${brief.firstSlice.criteria.map((item) => `- ${item}`).join("\n")}

## 검증 계획

${brief.verification.map((item) => `- ${item}`).join("\n") || "- 정적 근거, 테스트 필요, 실행 필요, 사람 판단 항목을 분리합니다."}

## 학습자 판단 체크포인트

${brief.learnerDecisions.map((item) => `- ${generatedSourceSnapshotMarkdown(item)}`).join("\n")}

## AI 지시용 용어

${brief.terms.map((item) => `- ${item}`).join("\n") || "- glossary.html에서 필요한 용어를 확인합니다."}

## 하지 않을 것

${brief.nonGoals.map((item) => `- ${item}`).join("\n")}

## 검토 후 다듬을 구현 프롬프트

\`\`\`text
${brief.copyPrompt.replaceAll("```", "'''")}
\`\`\`

## 관련 근거

- [제품 목적](../html/overview.html)
- [아키텍처](../html/architecture.html)
- [재구현 로드맵](../html/rebuild.html)
- [검증 경계](../html/session-verification.html)
- [AI 산출물 검토](ai-output-review-rubric.html)
`;
}

function architecturePrincipleRows(analysis: AnalysisBundle): Array<{ principle: string; why: string; aiInstruction: string; risk: string; verification: string; evidence: string }> {
  const firstFolder = analysis.folderLessons[0];
  const secondFolder = analysis.folderLessons[1];
  const firstFile = analysis.fileLessons[0];
  const secondFile = analysis.fileLessons[1];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  const firstTerm = analysis.dailySummaryReport.termsToKnow[0];
  return [
    {
      principle: "목적이 구조를 결정한다",
      why: analysis.architectureReport.architectureRationale,
      aiInstruction: `아키텍처 요청 후보: 먼저 "${analysis.purposeReport.oneLineSummary}" 목적을 고정하고, 그 목적을 지키는 최소 구조만 제안해줘. 보내기 전 새 앱 목표와 source evidence에 맞게 다듬으세요.`,
      risk: "목적 없이 폴더와 프레임워크부터 고르면 AI가 멋있어 보이는 구조를 과하게 만들 수 있습니다.",
      verification: "AI가 제안한 구조가 제품 목적, 대상 사용자, 제외 범위와 직접 연결되는지 확인합니다.",
      evidence: "html/overview.html"
    },
    {
      principle: "책임 경계가 프롬프트 품질을 만든다",
      why: firstFolder
        ? `${firstFolder.folderPath}는 ${firstFolder.whyItExists}`
        : "폴더와 파일은 서로 다른 책임을 나누기 위해 존재합니다.",
      aiInstruction: firstFolder
        ? `아키텍처 요청 후보: ${firstFolder.folderPath}의 책임과 ${secondFolder?.folderPath ?? "나머지 계층"}의 책임을 섞지 말고 첫 slice를 설계해줘. 보내기 전 포함/제외할 책임을 직접 확인하세요.`
        : "아키텍처 요청 후보: 각 계층의 책임을 먼저 말하고, 한 책임을 바꾸면 어떤 파일이 영향을 받는지 설명해줘. 보내기 전 source evidence와 검증 기준을 붙이세요.",
      risk: "책임 경계가 흐리면 AI가 한 파일에 UI, 데이터, 검증, 설정을 모두 섞어 나중에 수정하기 어려워집니다.",
      verification: "변경 파일 목록이 각 파일의 책임과 맞는지 확인합니다.",
      evidence: "html/folders.html"
    },
    {
      principle: "핵심 파일은 외울 대상이 아니라 역할 카드다",
      why: firstFile
        ? `${firstFile.filePath}는 ${firstFile.sourceRoleSummary}`
        : "핵심 파일은 구현 세부 문법보다 입력, 처리, 출력, 연결 역할을 보여주는 근거입니다.",
      aiInstruction: firstFile
        ? `아키텍처 요청 후보: ${firstFile.filePath}와 ${secondFile?.filePath ?? "관련 파일"}의 역할을 참고해서 같은 책임을 새 앱에서는 어디에 둘지 제안해줘. 보내기 전 관련 파일과 제외할 책임을 직접 확인하세요.`
        : "아키텍처 요청 후보: 핵심 파일의 입력, 처리, 출력, 검증 역할을 표로 만든 뒤 구현 계획을 세워줘. 보내기 전 검증 질문을 내 목표에 맞게 좁히세요.",
      risk: "파일 내용을 그대로 복사하려고 하면 새 앱의 목적과 맞지 않는 구조가 따라올 수 있습니다.",
      verification: "AI가 코드 줄이 아니라 파일 역할과 연결 이유를 설명했는지 확인합니다.",
      evidence: "html/files.html"
    },
    {
      principle: "용어는 AI와 합의하는 인터페이스다",
      why: firstTerm
        ? `${firstTerm.term} 같은 용어는 AI에게 ${firstTerm.promptUse}`
        : "용어는 학습자가 직접 손코딩하지 않아도 AI에게 정확한 산출물을 요구하게 해 줍니다.",
      aiInstruction: "아키텍처 요청 후보: PRD, SDD, TDD, acceptance criteria, vertical slice 같은 용어를 필요한 만큼만 쓰고, 각 용어가 이번 요청에서 뜻하는 바를 한 줄로 정의해줘. 보내기 전 용어가 산출물과 검증 기준에 연결되는지 확인하세요.",
      risk: "용어를 모르면 AI에게 막연한 결과물을 요구하게 되고, AI가 임의의 개발 절차를 선택합니다.",
      verification: "용어가 장식이 아니라 산출물, 범위, 검증 기준과 연결되는지 봅니다.",
      evidence: "html/glossary.html"
    },
    {
      principle: "검증 가능해야 배운 것이다",
      why: firstBoundary
        ? `${firstBoundary.boundary} 경계는 ${firstBoundary.nextCheck}`
        : "정적 근거, 실행 검증, 사람 판단을 나누어야 AI 결과를 그대로 믿지 않을 수 있습니다.",
      aiInstruction: "아키텍처 요청 후보: 구현 계획 끝에 정적 확인, 실행해야 할 테스트, 사람이 판단할 항목을 분리해줘. 보내기 전 실제 관찰 가능한 검증 기준만 남기세요.",
      risk: "검증 질문이 없으면 AI가 성공이라고 말한 순간 학습과 품질 판단이 멈춥니다.",
      verification: "PASS_REVIEW / REVISE / BLOCK 검토 상태 후보를 만들 수 없는 항목은 다시 작게 쪼갭니다. PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다.",
      evidence: "html/session-verification.html"
    }
  ];
}

function renderArchitecturePrinciplePlaybookHtml(session: StudySession, analysis: AnalysisBundle): string {
  const rows = architecturePrincipleRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.principle)}</h2>
      <p><strong>왜 필요한가:</strong> ${escape(row.why)}</p>
      <p><strong>검토 후 다듬을 요청 후보:</strong> ${escape(row.aiInstruction)}</p>
      <p><strong>잘못 만들면 생기는 문제:</strong> ${escape(row.risk)}</p>
      <p><strong>검증 질문:</strong> ${escape(row.verification)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
    </article>
  `).join("");
  return htmlDocument("Architecture Principle Playbook", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>아키텍처 원리 플레이북</h1>
      <p class="lead">문법 암기 대신 구조 판단을 배웁니다. 이 문서는 ${escape(session.owner)}/${escape(session.repo)} 소스에서 확인한 목적, 책임 경계, 핵심 파일 역할, 용어, 검증 질문을 AI에게 줄 아키텍처 지시로 바꿉니다.</p>
      <section class="grid">
        <article>
          <h2>학습자 역할</h2>
          <p>학습자는 코드를 한 줄씩 외우지 않습니다. 대신 왜 이 구조가 필요한지, 어느 책임을 어디에 둘지, AI 결과를 어떤 질문으로 검증할지 판단합니다.</p>
        </article>
        <article>
          <h2>AI 역할</h2>
          <p>AI는 구현과 반복 수정을 맡습니다. 하지만 목적, 경계, 용어, 검증 기준이 없으면 AI도 추측으로 구조를 만듭니다.</p>
        </article>
      </section>
      <section>
        <h2>원리 카드</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 아키텍처 설명 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 소스 분석을 바탕으로 문법 설명은 줄이고, 비슷한 앱을 만들 때 필요한 아키텍처 원리를 설명해줘. 각 원리는 왜 필요한가, 검토 후 다듬을 요청 후보, 잘못 만들면 생기는 문제, 검증 질문으로 나눠줘. 소스 전체를 복사하지 말고 목적, 책임 경계, 핵심 파일 역할, 용어, 검증 기준만 사용해줘. 보내기 전 내 앱 목표와 source evidence에 맞게 다듬을 수 있게 해줘.</pre>
      </section>
    </main>
  `);
}

function renderArchitecturePrinciplePlaybookMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const rows = architecturePrincipleRows(analysis).map((row) => {
    return `## ${row.principle}

- 왜 필요한가: ${row.why}
- 검토 후 다듬을 요청 후보: ${row.aiInstruction}
- 잘못 만들면 생기는 문제: ${row.risk}
- 검증 질문: ${row.verification}
- Evidence: [${row.evidence}](../${row.evidence})`;
  }).join("\n\n");
  return `# 아키텍처 원리 플레이북

Session: ${session.owner}/${session.repo}

문법 암기 대신 구조 판단을 배웁니다. 이 문서는 소스에서 확인한 목적, 책임 경계, 핵심 파일 역할, 용어, 검증 질문을 AI에게 줄 아키텍처 지시로 바꿉니다.

${rows}

## 검토 후 다듬을 아키텍처 설명 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 소스 분석을 바탕으로 문법 설명은 줄이고, 비슷한 앱을 만들 때 필요한 아키텍처 원리를 설명해줘. 각 원리는 왜 필요한가, 검토 후 다듬을 요청 후보, 잘못 만들면 생기는 문제, 검증 질문으로 나눠줘. 소스 전체를 복사하지 말고 목적, 책임 경계, 핵심 파일 역할, 용어, 검증 기준만 사용해줘. 보내기 전 내 앱 목표와 source evidence에 맞게 다듬을 수 있게 해줘.
\`\`\`
`;
}

function sourceToBuildInterviewRows(analysis: AnalysisBundle): Array<{
  stage: string;
  selfQuestion: string;
  modelAnswer: string;
  aiCheck: string;
  evidence: string;
}> {
  const firstFolder = analysis.folderLessons[0];
  const firstFile = analysis.fileLessons[0];
  const firstStep = analysis.rebuildRoadmap.steps[0];
  const firstTerm = analysis.dailySummaryReport.termsToKnow[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  return [
    {
      stage: "목적을 자기 말로 설명하기",
      selfQuestion: "이 소스가 누구의 어떤 문제를 해결하는지 한 문장으로 말할 수 있는가?",
      modelAnswer: analysis.purposeReport.oneLineSummary,
      aiCheck: "내가 쓴 목적 문장이 원본 소스의 목적, 사용자, 제외 범위와 어긋나는지 확인해줘.",
      evidence: "html/overview.html"
    },
    {
      stage: "구조가 필요한 이유 말하기",
      selfQuestion: "이 앱이 왜 이 아키텍처와 책임 경계를 갖는지 설명할 수 있는가?",
      modelAnswer: analysis.architectureReport.architectureRationale,
      aiCheck: "내 설명에서 폴더/파일 책임이 섞인 부분과 과한 구조를 유도하는 표현을 찾아줘.",
      evidence: "html/architecture.html"
    },
    {
      stage: "책임 경계 연결하기",
      selfQuestion: "비슷한 앱을 만들 때 가장 먼저 유지해야 할 폴더나 파일 책임은 무엇인가?",
      modelAnswer: firstFolder
        ? `${firstFolder.folderPath}: ${firstFolder.whyItExists}`
        : firstFile
          ? `${firstFile.filePath}: ${firstFile.sourceRoleSummary}`
          : "핵심 폴더와 파일의 입력, 처리, 출력, 검증 책임을 먼저 분리합니다.",
      aiCheck: "이 책임을 새 앱에서 어느 폴더/파일에 둘지 제안하고, 책임이 섞이는 위험을 같이 알려줘.",
      evidence: firstFolder ? "html/folders.html" : "html/files.html"
    },
    {
      stage: "AI 지시용 용어 고르기",
      selfQuestion: "이 작업에서 AI와 합의해야 할 핵심 용어 3개는 무엇인가?",
      modelAnswer: analysis.dailySummaryReport.termsToKnow.slice(0, 3).map((item) => `${item.term}: ${item.promptUse}`).join(" / ") || (firstTerm?.promptUse ?? "용어가 부족하면 glossary에서 PRD, SDD, TDD, acceptance criteria, vertical slice를 확인합니다."),
      aiCheck: "내가 고른 용어가 산출물, 범위, 검증 기준과 연결되는지 점검해줘.",
      evidence: "html/glossary.html"
    },
    {
      stage: "첫 vertical slice 정하기",
      selfQuestion: "비슷한 앱을 만들 때 AI에게 처음 맡길 가장 작은 구현 단위는 무엇인가?",
      modelAnswer: firstStep
        ? `${firstStep.title}: ${firstStep.goal}`
        : "목적을 보여주는 가장 작은 사용자 흐름 하나와 검증 하나를 묶습니다.",
      aiCheck: "이 첫 slice가 너무 크거나 추상적이면 더 작게 쪼개고 acceptance criteria를 붙여줘.",
      evidence: "html/rebuild.html"
    },
    {
      stage: "검증 질문으로 끝내기",
      selfQuestion: "AI가 만든 결과를 PASS/REVISE/BLOCK으로 판단할 질문은 무엇인가?",
      modelAnswer: firstBoundary
        ? `${firstBoundary.boundary}: ${firstBoundary.nextCheck}`
        : "정적 근거, 실행해야 할 테스트, 사람이 판단할 제품 기준을 분리합니다.",
      aiCheck: "구현 계획 끝에 정적 확인, 실행 검증, 사람 판단 항목을 분리한 체크리스트를 붙여줘.",
      evidence: "html/session-verification.html"
    }
  ];
}

function renderSourceToBuildInterviewHtml(session: StudySession, analysis: AnalysisBundle): string {
  const rows = sourceToBuildInterviewRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.stage)}</h2>
      <p><strong>내가 먼저 답할 질문:</strong> ${escape(row.selfQuestion)}</p>
      <p><strong>소스 기반 예시 답:</strong> ${escape(row.modelAnswer)}</p>
      <p><strong>AI에게 확인시킬 질문:</strong> ${escape(row.aiCheck)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
    </article>
  `).join("");
  return htmlDocument("Source-to-Build Interview", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>소스에서 비슷한 앱 만들기 인터뷰</h1>
      <p class="lead">이 문서는 코딩 문법을 묻지 않습니다. 소스 이해를 자기 설명 질문, 소스 기반 예시 답, AI 확인 질문으로 바꿔서 학습자가 비슷한 앱을 바이브코딩으로 지휘할 준비가 됐는지 확인합니다.</p>
      <section class="grid">
        <article>
          <h2>사용법</h2>
          <p>각 질문에 먼저 자기 말로 답한 뒤, AI에게 확인시킬 질문을 검토해 본인 말로 바꿉니다. 답이 막히면 근거 페이지를 열고 다시 답합니다.</p>
        </article>
        <article>
          <h2>검토 기준</h2>
          <p>목적, 구조 이유, 책임 경계, 용어, 첫 slice, 검증 질문을 설명할 수 있으면 구현 문법을 몰라도 AI에게 더 정확한 작업을 맡길 수 있습니다.</p>
        </article>
      </section>
      <section>
        <h2>인터뷰 카드</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 인터뷰 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스 분석을 바탕으로 내가 비슷한 앱을 만들기 전에 답해야 할 질문을 인터뷰해줘. 문법 질문은 줄이고, 목적, 아키텍처 이유, 책임 경계, 필요한 용어, 첫 vertical slice, 검증 질문 순서로 물어봐. 내가 답하면 소스 근거와 비교해서 부족한 점을 짚고, AI에게 넘길 작업 지시로 바꿔줘.</pre>
      </section>
    </main>
  `);
}

function renderSourceToBuildInterviewMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const rows = sourceToBuildInterviewRows(analysis).map((row) => `## ${row.stage}

- 내가 먼저 답할 질문: ${row.selfQuestion}
- 소스 기반 예시 답: ${row.modelAnswer}
- AI에게 확인시킬 질문: ${row.aiCheck}
- Evidence: [${row.evidence}](../${row.evidence})`).join("\n\n");
  return `# 소스에서 비슷한 앱 만들기 인터뷰

Session: ${session.owner}/${session.repo}

이 문서는 코딩 문법을 묻지 않습니다. 소스 이해를 자기 설명 질문, 소스 기반 예시 답, AI 확인 질문으로 바꿔서 학습자가 비슷한 앱을 바이브코딩으로 지휘할 준비가 됐는지 확인합니다.

${rows}

## 검토 후 다듬을 인터뷰 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스 분석을 바탕으로 내가 비슷한 앱을 만들기 전에 답해야 할 질문을 인터뷰해줘. 문법 질문은 줄이고, 목적, 아키텍처 이유, 책임 경계, 필요한 용어, 첫 vertical slice, 검증 질문 순서로 물어봐. 내가 답하면 소스 근거와 비교해서 부족한 점을 짚고, AI에게 넘길 작업 지시로 바꿔줘.
\`\`\`
`;
}

function similarAppTransferRows(analysis: AnalysisBundle): Array<{
  stage: string;
  sourcePattern: string;
  keepPrinciple: string;
  adaptDecision: string;
  aiPrompt: string;
  verification: string;
  evidence: string;
}> {
  const firstFolder = analysis.folderLessons[0];
  const firstFile = analysis.fileLessons[0];
  const firstStep = analysis.rebuildRoadmap.steps[0];
  const firstTerm = analysis.dailySummaryReport.termsToKnow[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  return [
    {
      stage: "목적 전이",
      sourcePattern: analysis.purposeReport.oneLineSummary,
      keepPrinciple: "사용자, 해결 문제, 제외 범위를 먼저 고정한 뒤 구현을 요청합니다.",
      adaptDecision: `새 앱의 사용자와 도메인은 바꾸되, ${analysis.purposeReport.similarType} 유형의 한 문장 목적은 검토 기준으로 먼저 고정합니다.`,
      aiPrompt: "전이 요청 후보: 원본 목적을 그대로 베끼지 말고, 내 제품의 사용자/문제/제외 범위로 바꾼 목적 문장 3개를 제안해줘. 보내기 전 새 앱 목표와 source evidence에 맞게 다듬으세요.",
      verification: "목적 문장이 source evidence와 충돌하지 않고 새 앱의 사용자 문제를 설명하는지 확인합니다.",
      evidence: "html/overview.html"
    },
    {
      stage: "아키텍처 전이",
      sourcePattern: analysis.architectureReport.architectureRationale,
      keepPrinciple: "구조 이름보다 책임 경계가 왜 필요한지 가져옵니다.",
      adaptDecision: "원본 폴더 구조를 그대로 복사하지 말고, 새 앱의 데이터 흐름과 화면/명령 흐름에 맞게 줄입니다.",
      aiPrompt: "전이 요청 후보: 이 원본 구조에서 유지할 책임 경계와 새 앱에서는 줄이거나 합칠 책임을 표로 나눠줘. 보내기 전 포함/제외할 책임을 직접 확인하세요.",
      verification: "각 책임이 한 곳에만 배치됐는지, 과한 추상화가 생기지 않았는지 확인합니다.",
      evidence: "html/architecture.html"
    },
    {
      stage: "책임 전이",
      sourcePattern: firstFolder
        ? `${firstFolder.folderPath}: ${firstFolder.whyItExists}`
        : firstFile
          ? `${firstFile.filePath}: ${firstFile.sourceRoleSummary}`
          : "핵심 파일과 폴더가 입력, 처리, 출력, 검증 책임을 나눕니다.",
      keepPrinciple: "파일명이나 폴더명보다 입력, 처리, 출력, 검증 책임을 가져옵니다.",
      adaptDecision: "새 앱에서 같은 책임이 필요한지 먼저 판단하고, 필요 없는 책임은 만들지 않습니다.",
      aiPrompt: "전이 요청 후보: 이 책임을 새 앱의 최소 파일/폴더로 배치하고, 만들지 않아도 되는 원본 책임을 따로 표시해줘. 보내기 전 첫 vertical slice 범위를 넘지 않는지 확인하세요.",
      verification: "새 파일 목록이 첫 vertical slice를 넘어서지 않는지 확인합니다.",
      evidence: firstFolder ? "html/folders.html" : "html/files.html"
    },
    {
      stage: "용어 전이",
      sourcePattern: firstTerm ? `${firstTerm.term}: ${firstTerm.promptUse}` : "PRD, SDD, TDD, acceptance criteria, source evidence 같은 AI 지시 용어를 사용합니다.",
      keepPrinciple: "AI가 같은 의미로 이해해야 할 용어만 가져옵니다.",
      adaptDecision: "언어 문법 용어보다 제품 산출물, 책임, 검증 기준을 지칭하는 용어를 우선합니다.",
      aiPrompt: "전이 요청 후보: 내 앱을 만들 때 AI와 합의해야 할 용어 5개를 원본 근거와 함께 고르고, 각 용어를 프롬프트 문장으로 바꿔줘. 보내기 전 용어가 산출물과 검증 질문에 연결되는지 확인하세요.",
      verification: "용어가 구현 지시, acceptance criteria, 검증 질문 중 하나와 연결되는지 확인합니다.",
      evidence: "html/glossary.html"
    },
    {
      stage: "첫 slice 전이",
      sourcePattern: firstStep ? `${firstStep.title}: ${firstStep.goal}` : "가장 작은 사용자 흐름 하나와 검증 하나를 먼저 만듭니다.",
      keepPrinciple: "원본의 전체 기능이 아니라 학습자가 설명할 수 있는 최소 흐름만 가져옵니다.",
      adaptDecision: "새 앱의 첫 구현은 보여줄 화면/명령 하나, 저장할 데이터 하나, 검증 하나로 제한합니다.",
      aiPrompt: "전이 요청 후보: 원본을 참고해 새 앱의 첫 vertical slice를 1개만 정하고, 포함할 것/뺄 것/검증할 것을 나눠줘. 보내기 전 하루 안에 검토 가능한 크기로 좁히세요.",
      verification: "첫 slice가 하루 안에 검토 가능한 크기인지, 학습자가 수락/검증할 관찰 기준이 있는지 확인합니다.",
      evidence: "html/rebuild.html"
    },
    {
      stage: "검증 전이",
      sourcePattern: firstBoundary ? `${firstBoundary.boundary}: ${firstBoundary.nextCheck}` : "정적 근거, 실행 검증, 사람 판단을 분리합니다.",
      keepPrinciple: "AI 결과를 믿기 전에 source evidence, 실행 확인, 사람 판단 기준을 분리합니다.",
      adaptDecision: "원본의 테스트 명령을 자동 실행하지 말고, 새 앱에서 실제로 확인 가능한 기준으로 바꿉니다.",
      aiPrompt: "전이 요청 후보: 구현 계획 마지막에 정적 확인, 실행 검증, 사람 판단, 중단 조건을 PASS_REVIEW / REVISE / BLOCK 검토 상태 표로 붙여줘. PASS_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록 확인 후보로 표시해줘. 보내기 전 실제 관찰 가능한 검증 기준만 남기세요.",
      verification: "검증 질문이 없으면 AI 구현 요청을 보내지 않습니다.",
      evidence: "html/session-verification.html"
    }
  ];
}

function renderSimilarAppTransferMapHtml(session: StudySession, analysis: AnalysisBundle): string {
  const rows = similarAppTransferRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.stage)}</h2>
      <p><strong>Source pattern:</strong> ${escape(row.sourcePattern)}</p>
      <p><strong>그대로 가져갈 원리:</strong> ${escape(row.keepPrinciple)}</p>
      <p><strong>새 앱에 맞게 바꿀 결정:</strong> ${escape(row.adaptDecision)}</p>
      <p><strong>검토 후 다듬을 전이 요청 후보:</strong> ${escape(row.aiPrompt)}</p>
      <p><strong>검증 기준:</strong> ${escape(row.verification)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
    </article>
  `).join("");
  return htmlDocument("Similar App Transfer Map", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>비슷한 앱 전이 지도</h1>
      <p class="lead">이 문서는 원본 소스를 복사하지 않습니다. 원본에서 유지할 원리, 새 앱에 맞게 바꿀 결정, 검토 후 다듬을 전이 요청 후보, 검증 기준을 분리해 바이브코딩 전이를 돕습니다.</p>
      <section class="grid">
        <article>
          <h2>No Copy Rule</h2>
          <p>파일명, 폴더명, 구현 코드를 그대로 가져오는 대신 목적, 책임, 용어, 첫 slice, 검증 경계만 새 앱의 맥락으로 옮깁니다.</p>
        </article>
        <article>
          <h2>전이 검토</h2>
          <p>KEEP은 원리로 남기고, ADAPT는 새 제품에 맞게 바꾸고, ASK AI는 확인 질문으로 넘기고, VERIFY는 수락/검증 기준으로 씁니다.</p>
        </article>
      </section>
      <section>
        <h2>전이 카드</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 전이 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 원본 소스를 그대로 복사하지 말고, 비슷한 앱을 만들 때 가져갈 원리와 새 앱에 맞게 바꿀 결정을 분리해줘. 목적, 아키텍처, 책임, 용어, 첫 vertical slice, 검증 기준마다 KEEP / ADAPT / ASK AI / VERIFY로 나누고, 각 항목을 검토 후 다듬을 전이 요청 후보로 바꿔줘. 보내기 전 내 앱 목표와 source evidence에 맞게 다듬을 수 있게 해줘.</pre>
      </section>
    </main>
  `);
}

function renderSimilarAppTransferMapMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const rows = similarAppTransferRows(analysis).map((row) => `## ${row.stage}

- Source pattern: ${row.sourcePattern}
- 그대로 가져갈 원리: ${row.keepPrinciple}
- 새 앱에 맞게 바꿀 결정: ${row.adaptDecision}
- 검토 후 다듬을 전이 요청 후보: ${row.aiPrompt}
- 검증 기준: ${row.verification}
- Evidence: [${row.evidence}](../${row.evidence})`).join("\n\n");
  return `# 비슷한 앱 전이 지도

Session: ${session.owner}/${session.repo}

원본 소스를 복사하지 않습니다. 원본에서 유지할 원리, 새 앱에 맞게 바꿀 결정, 검토 후 다듬을 전이 요청 후보, 검증 기준을 분리해 바이브코딩 전이를 돕습니다.

${rows}

## No Copy Rule

파일명, 폴더명, 구현 코드를 그대로 가져오는 대신 목적, 책임, 용어, 첫 slice, 검증 경계만 새 앱의 맥락으로 옮깁니다.

## 검토 후 다듬을 전이 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 원본 소스를 그대로 복사하지 말고, 비슷한 앱을 만들 때 가져갈 원리와 새 앱에 맞게 바꿀 결정을 분리해줘. 목적, 아키텍처, 책임, 용어, 첫 vertical slice, 검증 기준마다 KEEP / ADAPT / ASK AI / VERIFY로 나누고, 각 항목을 검토 후 다듬을 전이 요청 후보로 바꿔줘. 보내기 전 내 앱 목표와 source evidence에 맞게 다듬을 수 있게 해줘.
\`\`\`
`;
}

function learnerGoalAlignmentRows(analysis: AnalysisBundle, learnerBrief?: LearnerBriefInput): Array<{
  criterion: string;
  sourceAnchor: string;
  briefSignal: string;
  status: "ACCEPT_REVIEW" | "CLARIFY" | "REWRITE" | "BLOCK";
  nextQuestion: string;
  evidence: string;
}> {
  const text = learnerBrief?.text.toLowerCase() ?? "";
  const hasBrief = Boolean(learnerBrief);
  const firstStep = analysis.rebuildRoadmap.steps[0];
  const firstFile = analysis.fileLessons[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  const signal = (patterns: RegExp[], ok: string, missing: string) => {
    if (!hasBrief) return "No learner brief supplied.";
    return patterns.some((pattern) => pattern.test(text)) ? ok : missing;
  };
  const status = (patterns: RegExp[], missingStatus: "CLARIFY" | "REWRITE" | "BLOCK" = "REWRITE") => {
    if (!hasBrief) return "CLARIFY";
    return patterns.some((pattern) => pattern.test(text)) ? "ACCEPT_REVIEW" : missingStatus;
  };
  return [
    {
      criterion: "문제와 사용자",
      sourceAnchor: analysis.purposeReport.oneLineSummary,
      briefSignal: signal([/problem|user|customer|persona|사용자|고객|문제|대상/], "사용자나 문제가 언급되었습니다.", "사용자나 해결 문제가 명확하지 않습니다."),
      status: status([/problem|user|customer|persona|사용자|고객|문제|대상/], "CLARIFY"),
      nextQuestion: "내 목표 문장에 사용자, 해결 문제, 제외할 범위를 한 문단으로 추가해줘.",
      evidence: "html/overview.html"
    },
    {
      criterion: "아키텍처 책임",
      sourceAnchor: analysis.architectureReport.architectureRationale,
      briefSignal: signal([/architecture|module|service|component|responsib|아키텍처|모듈|컴포넌트|책임|역할/], "구조나 책임 단서가 있습니다.", "구조와 책임 경계가 빠져 있습니다."),
      status: status([/architecture|module|service|component|responsib|아키텍처|모듈|컴포넌트|책임|역할/]),
      nextQuestion: "이 목표를 입력, 처리, 저장, 출력, 검증 책임으로 나누고 원본에서 유지할 원리와 바꿀 결정을 표시해줘.",
      evidence: "reference/architecture-principle-playbook.html"
    },
    {
      criterion: "첫 vertical slice",
      sourceAnchor: firstStep ? `${firstStep.title}: ${firstStep.goal}` : "첫 구현은 하나의 작은 사용자 흐름으로 제한합니다.",
      briefSignal: signal([/slice|mvp|first|small|step|첫|작은|우선|단계|mvp/], "첫 구현 단위가 언급되었습니다.", "처음 만들 작은 단위가 없습니다."),
      status: status([/slice|mvp|first|small|step|첫|작은|우선|단계|mvp/]),
      nextQuestion: "전체 앱 말고 첫 vertical slice 1개만 정하고 포함할 것, 제외할 것, 수락/검증 기준을 써줘.",
      evidence: "reference/vibe-coding-implementation-brief.html"
    },
    {
      criterion: "관련 source evidence",
      sourceAnchor: firstFile ? `${firstFile.filePath}: ${firstFile.role}` : "관련 파일과 evidence link를 붙여 AI가 추측하지 않게 합니다.",
      briefSignal: signal([/source|file|folder|evidence|reference|repo|소스|파일|폴더|근거|참고/], "소스 근거 단서가 있습니다.", "원본 근거나 관련 파일이 없습니다."),
      status: status([/source|file|folder|evidence|reference|repo|소스|파일|폴더|근거|참고/], "BLOCK"),
      nextQuestion: "이 요청에 필요한 원본 근거 파일, 역할, 가져갈 원리, 바꿀 결정을 붙여줘.",
      evidence: "html/files.html"
    },
    {
      criterion: "Acceptance criteria",
      sourceAnchor: "AI 산출물을 수락하기 전에 관찰 가능한 조건이 필요합니다.",
      briefSignal: signal([/acceptance|criteria|done|success|완료|수락|성공|조건|기준/], "수락/검증 기준이 있습니다.", "수락/검증 기준이 관찰 가능하지 않습니다."),
      status: status([/acceptance|criteria|done|success|완료|수락|성공|조건|기준/]),
      nextQuestion: "수락/검증 기준을 사용자가 볼 수 있는 행동, 저장되는 데이터, 실패 시 메시지, 제외 범위로 바꿔줘.",
      evidence: "reference/ai-prompt-readiness-checklist.html"
    },
    {
      criterion: "검증과 중단 조건",
      sourceAnchor: firstBoundary ? `${firstBoundary.boundary}: ${firstBoundary.nextCheck}` : "정적 확인, 실행 검증, 사람 판단, 중단 조건을 나눕니다.",
      briefSignal: signal([/test|verify|check|assert|pass|fail|검증|테스트|확인|중단|실패/], "검증 단서가 있습니다.", "검증이나 중단 조건이 없습니다."),
      status: status([/test|verify|check|assert|pass|fail|검증|테스트|확인|중단|실패/], "BLOCK"),
      nextQuestion: "실행하지 않은 검증은 성공이라고 말하지 말고, PASS_REVIEW / REVISE / BLOCK 검토 기준과 중단 조건을 써줘.",
      evidence: "reference/ai-implementation-loop.html"
    },
    {
      criterion: "바이브코딩 역할 경계",
      sourceAnchor: "학습자는 목적, 책임, 용어, 검증을 소유하고 반복 구현은 AI에게 맡깁니다.",
      briefSignal: signal([/ai|prompt|review|owner|검토|리뷰|프롬프트|역할|맡/], "AI와 학습자 역할 단서가 있습니다.", "AI에게 맡길 것과 사람이 판단할 것이 분리되지 않았습니다."),
      status: status([/ai|prompt|review|owner|검토|리뷰|프롬프트|역할|맡/], "CLARIFY"),
      nextQuestion: "이 목표에서 내가 직접 판단할 것과 AI에게 맡길 구현 반복을 분리해줘.",
      evidence: "reference/learner-role-contract.html"
    }
  ];
}

function renderLearnerGoalAlignmentHtml(session: StudySession, analysis: AnalysisBundle, learnerBrief?: LearnerBriefInput): string {
  const rows = learnerGoalAlignmentRows(analysis, learnerBrief).map((row) => `
    <article>
      <h2>${escape(row.criterion)}</h2>
      <p><strong>Status:</strong> ${escape(row.status)}</p>
      <p><strong>Source anchor:</strong> ${escape(row.sourceAnchor)}</p>
      <p><strong>Brief signal:</strong> ${escape(row.briefSignal)}</p>
      <p><strong>Next AI question:</strong> ${escape(row.nextQuestion)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
    </article>
  `).join("");
  const briefPreview = learnerBrief
    ? `<pre>${escape(learnerBrief.text.slice(0, 1800))}${learnerBrief.text.length > 1800 ? "\n..." : ""}</pre>`
    : `<p class="muted">아직 learner brief가 없습니다. 다음 실행 때 <code>repo-tutor study &lt;source&gt; --learner-brief path/to/brief.md</code>로 PRD, 이슈, 또는 현재 AI 프롬프트를 넣으면 이 페이지가 실제 입력을 비교합니다.</p>`;
  return htmlDocument("Learner Goal Alignment", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>학습자 목표 정렬</h1>
      <p class="lead">내 목표/PRD/이슈/프롬프트가 원본 소스의 목적, 아키텍처, source evidence, acceptance criteria, 검증 경계와 맞는지 확인합니다. 목표는 문법 학습이 아니라 AI가 추측하지 않게 하는 source-grounded gap 정리입니다.</p>
      <section class="grid">
        <article>
          <h2>입력 상태</h2>
          <ul>
            <li>learner-brief: ${learnerBrief ? "provided" : "missing"}</li>
            <li>bytes: ${learnerBrief ? learnerBrief.bytes : 0}</li>
            <li>sha256: ${learnerBrief ? learnerBrief.sha256 : "n/a"}</li>
          </ul>
        </article>
        <article>
          <h2>검토 기준</h2>
          <p>ACCEPT_REVIEW / CLARIFY / REWRITE / BLOCK으로 나누고, ACCEPT_REVIEW는 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence, 검증 기준, 검증 기록을 학습자가 다시 확인할 목표 정렬 후보입니다. BLOCK은 AI 구현 요청 전에 반드시 보강합니다.</p>
        </article>
      </section>
      <section>
        <h2>내 목표/PRD/이슈/프롬프트</h2>
        ${briefPreview}
      </section>
      <section>
        <h2>Source-grounded gap</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 목표 정렬 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 내 목표/PRD/이슈/프롬프트를 이 소스 분석 결과와 맞춰줘. 코딩 문법을 설명하지 말고 문제와 사용자, 아키텍처 책임, 첫 vertical slice, 관련 source evidence, acceptance criteria, 검증과 중단 조건, 내가 판단할 것과 AI에게 맡길 것을 ACCEPT_REVIEW / CLARIFY / REWRITE / BLOCK으로 나눠줘. ACCEPT_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 source evidence, 검증 기준, 검증 기록을 확인할 목표 정렬 후보로만 표시해줘. BLOCK 항목이 있으면 구현 프롬프트를 쓰지 말고 먼저 보강 질문 3개만 줘.</pre>
      </section>
    </main>
  `);
}

function renderLearnerGoalAlignmentMarkdown(session: StudySession, analysis: AnalysisBundle, learnerBrief?: LearnerBriefInput): string {
  const rows = learnerGoalAlignmentRows(analysis, learnerBrief).map((row) => `## ${row.criterion}

- Status: ${row.status}
- Source anchor: ${row.sourceAnchor}
- Brief signal: ${row.briefSignal}
- Next AI question: ${row.nextQuestion}
- Evidence: [${row.evidence}](../${row.evidence})`).join("\n\n");
  const briefPreview = learnerBrief
    ? `- learner-brief: provided\n- bytes: ${learnerBrief.bytes}\n- sha256: ${learnerBrief.sha256}\n- copied: ${learnerBrief.copiedRelPath}\n\n\`\`\`text\n${learnerBrief.text.slice(0, 1800).replaceAll("```", "'''")}${learnerBrief.text.length > 1800 ? "\n..." : ""}\n\`\`\``
    : "- learner-brief: missing\n\n다음 실행 때 `repo-tutor study <source> --learner-brief path/to/brief.md`로 PRD, 이슈, 또는 현재 AI 프롬프트를 넣으면 이 페이지가 실제 입력을 비교합니다.";
  return `# 학습자 목표 정렬

Session: ${session.owner}/${session.repo}

내 목표/PRD/이슈/프롬프트가 원본 소스의 목적, 아키텍처, source evidence, acceptance criteria, 검증 경계와 맞는지 확인합니다. 목표는 문법 학습이 아니라 AI가 추측하지 않게 하는 source-grounded gap 정리입니다.

## 내 목표/PRD/이슈/프롬프트

${briefPreview}

${rows}

## 검토 기준

ACCEPT_REVIEW / CLARIFY / REWRITE / BLOCK으로 나누고, ACCEPT_REVIEW는 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence, 검증 기준, 검증 기록을 학습자가 다시 확인할 목표 정렬 후보입니다. BLOCK은 AI 구현 요청 전에 반드시 보강합니다.

## 검토 후 다듬을 목표 정렬 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 내 목표/PRD/이슈/프롬프트를 이 소스 분석 결과와 맞춰줘. 코딩 문법을 설명하지 말고 문제와 사용자, 아키텍처 책임, 첫 vertical slice, 관련 source evidence, acceptance criteria, 검증과 중단 조건, 내가 판단할 것과 AI에게 맡길 것을 ACCEPT_REVIEW / CLARIFY / REWRITE / BLOCK으로 나눠줘. ACCEPT_REVIEW도 구현 시작, 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 source evidence, 검증 기준, 검증 기록을 확인할 목표 정렬 후보로만 표시해줘. BLOCK 항목이 있으면 구현 프롬프트를 쓰지 말고 먼저 보강 질문 3개만 줘.
\`\`\`
`;
}

function aiImplementationLoopRows(analysis: AnalysisBundle): Array<{
  phase: string;
  learnerJob: string;
  nextQuestion: string;
  aiAnswerCheck: string;
  reviseTrigger: string;
  stopCondition: string;
  evidence: string;
}> {
  const firstPrompt = analysis.vibeCodingPromptPackReport.promptSequence[0];
  const firstStep = analysis.rebuildRoadmap.steps[0];
  const firstFile = analysis.fileLessons[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  const candidate = (request: string, reviewReminder: string): string =>
    `구현 루프 요청 후보: ${request} 보내기 전 ${reviewReminder} 이 후보는 전송, 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록을 학습자가 확인할 구현 루프 요청 후보입니다.`;
  return [
    {
      phase: "PLAN",
      learnerJob: "AI에게 코드를 바로 쓰게 하지 말고 목적, 첫 vertical slice, 제외 범위, 수락 기준을 먼저 확인시킵니다.",
      nextQuestion: candidate(
        firstPrompt?.prompt ?? "이 소스를 참고해 비슷한 앱의 첫 구현 계획만 먼저 작성해줘. 코드는 아직 쓰지 말고 목적, 범위, 수락 기준, 검증 기준을 분리해줘.",
        "목적, 범위, 수락 기준, 검증 기준이 내 앱 목표와 source evidence에 맞는지 확인하세요."
      ),
      aiAnswerCheck: "AI가 새 앱의 사용자, 문제, 첫 slice, 제외할 기능을 분리했는지 봅니다.",
      reviseTrigger: "전체 앱을 한 번에 만들겠다고 하거나 원본 기능을 그대로 복사하려고 하면 계획을 줄이라고 요청합니다.",
      stopCondition: "목적과 첫 slice를 한 문장씩 설명할 수 없으면 구현 요청으로 넘어가지 않습니다.",
      evidence: "html/vibe-coding-prompt-pack.html"
    },
    {
      phase: "OBSERVE",
      learnerJob: "AI가 만든 결과를 받은 뒤 코드 줄이 아니라 변경 의도, 파일 책임, 가정을 먼저 요약하게 합니다.",
      nextQuestion: candidate(
        "방금 만든 결과를 파일별 책임, 사용한 가정, 아직 확인하지 못한 부분, 사람이 봐야 할 결정으로 요약해줘.",
        "실행 여부와 확인하지 못한 가정을 성공처럼 쓰지 않았는지 확인하세요."
      ),
      aiAnswerCheck: firstFile
        ? `AI가 ${firstFile.filePath} 같은 핵심 책임을 설명하고, 만든 파일이 왜 필요한지 말하는지 봅니다.`
        : "AI가 만든 파일과 책임을 제품 흐름 기준으로 설명하는지 봅니다.",
      reviseTrigger: "변경 목록만 있고 왜 필요한지 설명하지 못하면 설명을 다시 요구합니다.",
      stopCondition: "파일 책임을 설명하지 못하면 다음 구현을 요청하지 않습니다.",
      evidence: "html/files.html"
    },
    {
      phase: "CHECK",
      learnerJob: "원본 소스 근거와 새 앱 요구사항이 충돌하지 않는지 확인합니다.",
      nextQuestion: candidate(
        "이 결과가 원본에서 가져온 원리와 새 앱에 맞게 바꾼 결정 중 어디에 해당하는지 KEEP / ADAPT / ASK AI / VERIFY로 표시해줘.",
        "source evidence와 새 앱 결정을 분리하고, 베껴 쓰는 항목이 없는지 확인하세요."
      ),
      aiAnswerCheck: "AI가 원본을 베끼지 않고 전이 지도 기준으로 유지할 원리와 바꿀 결정을 나누는지 봅니다.",
      reviseTrigger: "근거 없이 일반론만 말하면 관련 source evidence와 연결해서 다시 답하게 합니다.",
      stopCondition: "source evidence와 새 제품 결정이 분리되지 않으면 구현을 확장하지 않습니다.",
      evidence: "reference/similar-app-transfer-map.html"
    },
    {
      phase: "REVISE",
      learnerJob: "큰 재작성 대신 가장 작은 수정 요청 하나로 되돌립니다.",
      nextQuestion: candidate(
        firstStep
          ? `${firstStep.title} 범위 안에서 가장 작은 수정 1개만 제안하고, 포함할 것/뺄 것/파일 책임을 나눠줘.`
          : "현재 결과에서 가장 작은 수정 1개만 제안하고, 포함할 것/뺄 것/파일 책임을 나눠줘.",
        "한 번에 사람이 리뷰할 수 있는 크기인지, 새 추상화가 과하지 않은지 확인하세요."
      ),
      aiAnswerCheck: "수정 요청이 한 번에 검토 가능한 크기인지, 새 파일이나 추상화가 과하지 않은지 봅니다.",
      reviseTrigger: "AI가 여러 기능을 동시에 고치려 하면 한 slice로 줄입니다.",
      stopCondition: "수정이 너무 커서 사람이 리뷰할 수 없으면 작업을 쪼갭니다.",
      evidence: "html/rebuild.html"
    },
    {
      phase: "VERIFY",
      learnerJob: "정적 확인, 실행 검증, 사람 판단, 중단 조건을 분리합니다.",
      nextQuestion: candidate(
        firstBoundary
          ? `${firstBoundary.boundary} 기준으로 정적 확인, 실행 검증, 사람 판단, 중단 조건을 PASS_REVIEW / REVISE / BLOCK 표로 정리해줘.`
          : "이 결과를 정적 확인, 실행 검증, 사람 판단, 중단 조건으로 나눠 PASS_REVIEW / REVISE / BLOCK 표를 만들어줘.",
        "실행하지 않은 검증을 PASS_REVIEW로 두지 말고 REVISE 또는 BLOCK 기준을 남겼는지 확인하세요."
      ),
      aiAnswerCheck: "검증 기준이 실제로 관찰 가능한지, AI가 확인하지 않은 실행 결과를 성공이라고 말하지 않는지 봅니다.",
      reviseTrigger: "테스트를 실행하지 않았는데 통과했다고 말하면 BLOCK으로 돌립니다.",
      stopCondition: "검증 기준이 없으면 다음 기능을 추가하지 않습니다.",
      evidence: "html/session-verification.html"
    },
    {
      phase: "NEXT",
      learnerJob: "검토 상태를 정한 뒤 다음 AI 질문 후보를 한 문장으로 좁힙니다.",
      nextQuestion: candidate(
        `현재 결과를 ${analysis.purposeReport.oneLineSummary} 목적 기준으로 PASS_REVIEW / REVISE / BLOCK 검토 상태 중 하나로 나누고, 다음 프롬프트 후보 1개만 작성해줘.`,
        "목적, 근거, 범위, 검증 기준을 모두 포함했는지 확인하세요."
      ),
      aiAnswerCheck: "다음 질문 후보가 목적, 근거, 범위, 검증 기준을 모두 포함하는지 봅니다.",
      reviseTrigger: "다음 질문 후보가 막연하면 prompt readiness checklist로 되돌립니다.",
      stopCondition: "다음 질문 후보를 한 문장으로 말할 수 없으면 새 작업을 시작하지 않습니다.",
      evidence: "reference/ai-prompt-readiness-checklist.html"
    }
  ];
}

function renderAiImplementationLoopHtml(session: StudySession, analysis: AnalysisBundle): string {
  const rows = aiImplementationLoopRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.phase)}</h2>
      <p><strong>학습자가 할 일:</strong> ${escape(row.learnerJob)}</p>
      <p><strong>검토 후 다듬을 다음 질문 후보:</strong> ${escape(row.nextQuestion)}</p>
      <p><strong>AI 답변에서 확인할 것:</strong> ${escape(row.aiAnswerCheck)}</p>
      <p><strong>수정 요청으로 돌릴 조건:</strong> ${escape(row.reviseTrigger)}</p>
      <p><strong>멈춤 조건:</strong> ${escape(row.stopCondition)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
    </article>
  `).join("");
  return htmlDocument("AI Implementation Loop", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>AI 구현 대화 루프</h1>
      <p class="lead">바이브코딩 학습자는 코드를 한 줄씩 외우지 않습니다. 대신 AI가 만든 결과를 계획, 관찰, 근거 확인, 작은 수정, 검증, 다음 질문 후보로 반복 관리합니다.</p>
      <section class="grid">
        <article>
          <h2>Loop Rule</h2>
          <p>AI에게 구현을 맡기되, 학습자는 목적, 범위, 책임, 근거, 검증, 다음 질문 후보를 계속 통제합니다.</p>
        </article>
        <article>
          <h2>PLAN / OBSERVE / CHECK / REVISE / VERIFY / NEXT</h2>
          <p>각 단계는 AI 답변을 그대로 믿기 전에 무엇을 확인하고 언제 멈출지 정하는 메타인지 루프입니다.</p>
        </article>
      </section>
      <section>
        <h2>구현 루프 카드</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 구현 루프 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 AI 구현 결과를 PLAN / OBSERVE / CHECK / REVISE / VERIFY / NEXT 루프로 검토해줘. 코드를 한 줄씩 가르치지 말고, 목적과 책임, 원본 근거, 새 앱에 맞게 바꾼 결정, 확인하지 못한 가정, 검토 후 다듬을 다음 질문 후보 1개, 멈춤 조건을 분리해줘. 검토 상태는 PASS_REVIEW / REVISE / BLOCK으로 표시하고, PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록을 다시 확인할 후보로만 둬. 실행하지 않은 검증은 성공이라고 말하지 말고 BLOCK 또는 REVISE로 표시해줘.</pre>
      </section>
    </main>
  `);
}

function renderAiImplementationLoopMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const rows = aiImplementationLoopRows(analysis).map((row) => `## ${row.phase}

- 학습자가 할 일: ${row.learnerJob}
- 검토 후 다듬을 다음 질문 후보: ${row.nextQuestion}
- AI 답변에서 확인할 것: ${row.aiAnswerCheck}
- 수정 요청으로 돌릴 조건: ${row.reviseTrigger}
- 멈춤 조건: ${row.stopCondition}
- Evidence: [${row.evidence}](../${row.evidence})`).join("\n\n");
  return `# AI 구현 대화 루프

Session: ${session.owner}/${session.repo}

바이브코딩 학습자는 코드를 한 줄씩 외우지 않습니다. 대신 AI가 만든 결과를 계획, 관찰, 근거 확인, 작은 수정, 검증, 다음 질문 후보로 반복 관리합니다.

${rows}

## Loop Rule

AI에게 구현을 맡기되, 학습자는 목적, 범위, 책임, 근거, 검증, 다음 질문 후보를 계속 통제합니다.

## 검토 후 다듬을 구현 루프 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 AI 구현 결과를 PLAN / OBSERVE / CHECK / REVISE / VERIFY / NEXT 루프로 검토해줘. 코드를 한 줄씩 가르치지 말고, 목적과 책임, 원본 근거, 새 앱에 맞게 바꾼 결정, 확인하지 못한 가정, 검토 후 다듬을 다음 질문 후보 1개, 멈춤 조건을 분리해줘. 검토 상태는 PASS_REVIEW / REVISE / BLOCK으로 표시하고, PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 source evidence와 검증 기록을 다시 확인할 후보로만 둬. 실행하지 않은 검증은 성공이라고 말하지 말고 BLOCK 또는 REVISE로 표시해줘.
\`\`\`
`;
}

function aiPromptReadinessRows(analysis: AnalysisBundle): Array<{
  criterion: string;
  ready: string;
  revise: string;
  block: string;
  evidence: string;
  promptCheck: string;
}> {
  const firstFile = analysis.fileLessons[0];
  const firstStep = analysis.rebuildRoadmap.steps[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  const checkCandidate = (request: string, reviewReminder: string): string =>
    `프롬프트 점검 요청 후보: ${request} 보내기 전 ${reviewReminder}`;
  return [
    {
      criterion: "문제와 목표",
      ready: `프롬프트가 "${analysis.purposeReport.oneLineSummary}" 목적과 첫 작업 범위를 분리합니다.`,
      revise: "만들고 싶은 기능은 있지만 사용자, 제외 범위, 성공 기준이 흐릿합니다.",
      block: "전체 앱을 한 번에 만들어 달라는 요청뿐입니다.",
      evidence: "html/overview.html",
      promptCheck: checkCandidate(
        "이 프롬프트에 문제 설명, 사용자, 제외 범위, 성공 기준이 각각 한 문장 이상 있는지 확인해줘.",
        "내 제품 목적과 하지 않을 일이 빠지지 않았는지 직접 확인하세요."
      )
    },
    {
      criterion: "관련 source evidence",
      ready: firstFile
        ? `${firstFile.filePath} 같은 관련 파일과 그 파일을 보는 이유가 함께 들어 있습니다.`
        : "관련 리포트와 evidence 링크가 들어 있고, 왜 그 근거를 쓰는지 설명합니다.",
      revise: "파일 이름은 있지만 어떤 책임을 참고해야 하는지 설명이 부족합니다.",
      block: "소스 전체를 붙여 넣거나, 반대로 아무 근거 없이 일반론만 요청합니다.",
      evidence: "html/evidence.html",
      promptCheck: checkCandidate(
        "관련 파일/리포트 목록과 각 근거의 역할이 충분한지 확인해줘.",
        "source evidence가 일반 개발 지식 보강이 아니라 책임/검증 근거인지 확인하세요."
      )
    },
    {
      criterion: "작은 vertical slice",
      ready: firstStep
        ? `${firstStep.title}처럼 첫 구현 단위가 작고 검증 가능한 slice로 제한됩니다.`
        : "첫 구현 단위가 작고 검증 가능한 slice로 제한됩니다.",
      revise: "단계는 있지만 여러 기능을 한 번에 묶어 AI가 추측할 여지가 큽니다.",
      block: "모든 화면, API, 저장소, 배포를 한 번에 요청합니다.",
      evidence: "reference/vibe-coding-implementation-brief.html",
      promptCheck: checkCandidate(
        "이 요청을 첫 vertical slice 하나로 더 줄일 수 있는지 보고, 줄인 버전을 작성해줘.",
        "한 번에 리뷰 가능한 크기인지, 빠진 수락 기준이 없는지 확인하세요."
      )
    },
    {
      criterion: "acceptance criteria",
      ready: "수락 기준이 관찰 가능한 bullet로 되어 있고, 테스트/문서/사람 판단 항목을 구분합니다.",
      revise: "수락 기준은 있지만 '잘 동작해야 함'처럼 측정하기 어렵습니다.",
      block: "수락/검증 기준 없이 구현만 요청합니다.",
      evidence: "html/rebuild.html",
      promptCheck: checkCandidate(
        "이 프롬프트의 acceptance criteria를 관찰 가능한 수락 기준 bullet로 바꿔줘.",
        "AI가 만든 수락 기준을 그대로 믿지 말고 관찰 가능한지 확인하세요."
      )
    },
    {
      criterion: "검증 assertion",
      ready: firstBoundary
        ? `${firstBoundary.boundary}처럼 정적 확인, 실행/테스트 필요, 사람 판단을 나눕니다.`
        : "정적 확인, 실행/테스트 필요, 사람 판단을 나눕니다.",
      revise: "테스트 명령은 있지만 어떤 기준을 검증하는지 연결이 약합니다.",
      block: "AI가 성공이라고 말하면 검증 기록 없이 그대로 받아들입니다.",
      evidence: "html/session-verification.html",
      promptCheck: checkCandidate(
        "promptfoo-style로 contains/equals/manual review assertion을 만든다면 무엇을 검사해야 하는지 제안해줘.",
        "실행하지 않은 검증을 PASS로 두지 않는 중단 조건을 포함했는지 확인하세요."
      )
    },
    {
      criterion: "반복 요청과 실패 보고",
      ready: "AI에게 변경 파일, 실행한 명령, 실패, 가정, 다음 질문을 함께 보고하라고 요구합니다.",
      revise: "결과물만 요구하고 실패나 가정을 따로 보고하게 하지 않습니다.",
      block: "실패를 숨기거나 확인하지 않은 실행 결과를 성공으로 단정하게 만듭니다.",
      evidence: "reference/ai-output-review-rubric.html",
      promptCheck: checkCandidate(
        "이 프롬프트 끝에 AI가 보고해야 할 변경 파일, 명령, 실패, 가정, 다음 질문 후보 형식을 붙여줘.",
        "보고 형식이 완료 선언이 아니라 리뷰 자료로 남는지 확인하세요."
      )
    }
  ];
}

function aiPromptStopConditions(): string[] {
  return [
    "사용자 문제와 제외 범위가 없으면 보내지 않습니다.",
    "관련 source evidence가 한 줄도 없으면 일반 개발 지식 답변으로 흐르므로 보강합니다.",
    "첫 vertical slice와 하지 않을 일을 분리하지 못하면 전체 앱 생성 요청으로 번질 수 있습니다.",
    "acceptance criteria, verification assertion, 검증 기록 보고 형식이 없으면 READY_REVIEW 검토 상태를 유보합니다.",
    "AI가 보고할 변경 파일, 실행 명령, 실패, 가정, 다음 질문 형식이 없으면 먼저 추가합니다."
  ];
}

function renderAiPromptReadinessChecklistHtml(session: StudySession, analysis: AnalysisBundle): string {
  const stopConditions = aiPromptStopConditions();
  const rows = aiPromptReadinessRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.criterion)}</h2>
      <p><strong>READY_REVIEW:</strong> ${escape(row.ready)}</p>
      <p><strong>REVISE:</strong> ${escape(row.revise)}</p>
      <p><strong>BLOCK:</strong> ${escape(row.block)}</p>
      <p><a href="../${escape(row.evidence)}">근거 열기</a></p>
      <p><strong>검토 후 다듬을 점검 요청 후보:</strong></p>
      <pre>${escape(row.promptCheck)}</pre>
    </article>
  `).join("");
  return htmlDocument("AI Prompt Readiness Checklist", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>AI 프롬프트 준비도 체크리스트</h1>
      <p class="lead">이 문서는 AI가 코드를 쓰기 전에 프롬프트가 충분한지 점검합니다. 기준은 GitHub Copilot식 well-scoped task, Spec Kit식 요구사항 명확화, promptfoo식 assertion 사고를 바이브코딩 학습자용으로 줄인 것입니다. READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.</p>
      <section class="grid">
        <article>
          <h2>목표</h2>
          <p>프롬프트가 길어지는 것이 목표가 아닙니다. 문제, 관련 source evidence, 작은 vertical slice, acceptance criteria, 검증 assertion, 실패 보고 형식이 있는지 확인합니다.</p>
        </article>
        <article>
          <h2>소스의 역할</h2>
          <p>원본 소스는 AI에게 일반 개발 지식을 주입하는 자료가 아니라, 이 프로젝트의 목적과 책임 경계를 정확히 지시하기 위한 임시 근거입니다.</p>
        </article>
      </section>
      <section>
        <h2>프롬프트 전송 중단 조건</h2>
        <ul>${stopConditions.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
      </section>
      <section>
        <h2>검토 상태표</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>검토 후 다듬을 프롬프트 평가 요청</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 구현 프롬프트를 AI에게 보내기 전에 평가해줘. 문제 설명, 관련 source evidence, 첫 vertical slice, acceptance criteria, 검증 assertion, 실패/가정 보고 형식을 READY_REVIEW / REVISE / BLOCK 검토 상태로 나눠줘. READY_REVIEW여도 바로 보내지 말고 학습자가 목표, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 전송 전 직접 확인해야 합니다. REVISE나 BLOCK이면 학습자가 검토 후 다듬어 보낼 개선 프롬프트로 다시 써줘.</pre>
      </section>
    </main>
  `);
}

function renderAiPromptReadinessChecklistMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const stopConditions = aiPromptStopConditions();
  const rows = aiPromptReadinessRows(analysis).map((row) => {
    return `## ${row.criterion}

- READY_REVIEW: ${row.ready}
- REVISE: ${row.revise}
- BLOCK: ${row.block}
- Evidence: [${row.evidence}](../${row.evidence})
- 검토 후 다듬을 점검 요청 후보: ${row.promptCheck}`;
  }).join("\n\n");
  return `# AI 프롬프트 준비도 체크리스트

Session: ${session.owner}/${session.repo}

이 문서는 AI가 코드를 쓰기 전에 프롬프트가 충분한지 점검합니다. 기준은 GitHub Copilot식 well-scoped task, Spec Kit식 요구사항 명확화, promptfoo식 assertion 사고를 바이브코딩 학습자용으로 줄인 것입니다.

원본 소스는 AI에게 일반 개발 지식을 주입하는 자료가 아니라, 이 프로젝트의 목적과 책임 경계를 정확히 지시하기 위한 임시 근거입니다.

READY_REVIEW는 문제 설명, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 학습자가 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.

## 프롬프트 전송 중단 조건

${stopConditions.map((item) => `- ${item}`).join("\n")}

${rows}

## 검토 후 다듬을 프롬프트 평가 요청

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 구현 프롬프트를 AI에게 보내기 전에 평가해줘. 문제 설명, 관련 source evidence, 첫 vertical slice, acceptance criteria, 검증 assertion, 실패/가정 보고 형식을 READY_REVIEW / REVISE / BLOCK 검토 상태로 나눠줘. READY_REVIEW여도 바로 보내지 말고 학습자가 목표, source evidence, acceptance criteria, verification assertion, 검증 기록 보고 형식을 전송 전 직접 확인해야 합니다. REVISE나 BLOCK이면 학습자가 검토 후 다듬어 보낼 개선 프롬프트로 다시 써줘.
\`\`\`
`;
}

function aiPromptAbLabRows(analysis: AnalysisBundle): Array<{ criterion: string; promptA: string; promptB: string; learnerCheck: string }> {
  const firstFile = analysis.fileLessons[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  return [
    {
      criterion: "목적 명확성",
      promptA: "비슷하게 만들어 달라고만 해서 사용자, 제외 범위, 성공 기준을 AI가 추측합니다.",
      promptB: `"${analysis.purposeReport.oneLineSummary}" 목적을 먼저 고정하고 이번 요청에서 하지 않을 일을 분리합니다.`,
      learnerCheck: "AI가 답변을 시작하기 전에 제품 목적을 다시 말하게 합니다."
    },
    {
      criterion: "source evidence",
      promptA: "소스를 통째로 참고하라고 하거나 아무 근거 없이 일반론만 요청합니다.",
      promptB: firstFile
        ? `${firstFile.filePath}의 책임처럼 관련 source evidence와 보는 이유를 함께 제공합니다.`
        : "overview, architecture, evidence 리포트처럼 관련 source evidence와 보는 이유를 함께 제공합니다.",
      learnerCheck: "AI 답변에 어떤 근거를 사용했는지 파일/리포트 단위로 표시하게 합니다."
    },
    {
      criterion: "작업 크기",
      promptA: "전체 앱, 모든 화면, 저장소, 테스트, 배포를 한 번에 요구합니다.",
      promptB: "첫 vertical slice 하나만 요청하고, 나머지는 backlog로 남기게 합니다.",
      learnerCheck: "한 번의 답변으로 끝낼 수 없으면 AI가 범위를 줄이게 합니다."
    },
    {
      criterion: "검증 가능성",
      promptA: "잘 동작하게 해달라는 말만 있어 수락/검증 기준이 흐립니다.",
      promptB: firstBoundary
        ? `${firstBoundary.boundary} 같은 검증 boundary와 관찰 가능한 assertion을 함께 둡니다.`
        : "정적 확인, 실행 테스트, 사람 판단을 관찰 가능한 assertion으로 나눕니다.",
      learnerCheck: "AI가 실행한 명령, 실행하지 못한 명령, 수동 확인이 필요한 항목을 구분하게 합니다."
    },
    {
      criterion: "실패 보고",
      promptA: "AI가 성공이라고 말하면 검증 기록 없이 수락하는 구조입니다.",
      promptB: "변경 파일, 명령 결과, 실패, 가정, 다음 질문을 반드시 보고하게 합니다.",
      learnerCheck: "확인하지 않은 성공 주장이 있으면 BLOCK 검토 상태로 둡니다."
    }
  ];
}

function aiPromptAbLabPromptA(): string {
  return `이 GitHub 소스랑 비슷한 앱 만들어줘. UI도 괜찮게 하고 알아서 필요한 기능 넣어줘.`;
}

function aiPromptAbLabPromptB(session: StudySession, analysis: AnalysisBundle): string {
  const firstFile = analysis.fileLessons[0];
  const firstStep = analysis.vibeCodingPromptPackReport.promptSequence[0];
  const firstBoundary = analysis.dailySummaryReport.verificationBoundaries[0];
  return `검토 후 다듬을 프롬프트 B 후보입니다. 보내기 전 내 앱의 사용자, 제외 범위, source evidence, acceptance criteria, verification assertion이 맞는지 직접 확인하세요.

나는 전문 개발자가 아니라 바이브코딩 개발자야. 코딩 문법을 배우려는 게 아니라 ${session.owner}/${session.repo}와 비슷한 앱을 AI와 만들기 위해 목적, 아키텍처 역할, 용어, 검증 기준을 배우고 싶어.

목표:
- ${analysis.purposeReport.oneLineSummary}

이번 요청의 범위:
- 첫 vertical slice만 만든다.
- 전체 앱, 배포, 모든 화면, 모든 테스트를 한 번에 만들지 않는다.

관련 source evidence:
- ${firstFile ? `${firstFile.filePath}: ${firstFile.sourceRoleSummary}` : "html/architecture.html: 구조 이유와 책임 경계"}
- reference/vibe-coding-implementation-brief.html: 첫 구현 단위와 수락 기준

acceptance criteria:
- 학습자가 이 앱의 목적을 한 문장으로 설명할 수 있다.
- AI가 만든 구현 계획이 source evidence와 연결된다.
- 검증할 항목과 아직 실행하지 못한 항목을 분리한다.

verification assertions:
- ${firstBoundary ? `${firstBoundary.boundary}: ${firstBoundary.nextCheck}` : "정적 근거, 실행 검증, 사람 판단을 나눠 보고한다."}
- 변경 파일, 실행 명령, 실패, 가정, 다음 질문을 마지막에 표로 보고한다.

시작 작업 후보:
- ${firstStep?.prompt ?? analysis.vibeCodingPromptPackReport.copyPastePrompt}`;
}

function aiPromptAbLabSendDecisionRows(): string[] {
  return [
    "프롬프트 A는 BLOCK입니다. source evidence, acceptance criteria, verification assertion이 없어 보내지 않습니다.",
    "프롬프트 B 후보는 READY_REVIEW 검토 후보입니다. READY_REVIEW도 내 제품 목적, source evidence, acceptance criteria, verification assertion, 학습자 판단 체크포인트, 검증 기록 보고 형식을 확인할 후보일 뿐 전송, 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.",
    "B가 새 앱의 사용자, 도메인, 제외 범위를 반영하지 못하면 REVISE로 바꾸고 다시 검토합니다.",
    "A/B 모두 부족하면 구현 요청을 멈추고 ai-prompt-readiness-checklist의 전송 중단 조건부터 보강합니다."
  ];
}

function renderAiPromptAbLabHtml(session: StudySession, analysis: AnalysisBundle): string {
  const sendDecisionRows = aiPromptAbLabSendDecisionRows();
  const rows = aiPromptAbLabRows(analysis).map((row) => `
    <article>
      <h2>${escape(row.criterion)}</h2>
      <p><strong>프롬프트 A:</strong> ${escape(row.promptA)}</p>
      <p><strong>프롬프트 B 후보:</strong> ${escape(row.promptB)}</p>
      <p><strong>학습자 확인:</strong> ${escape(row.learnerCheck)}</p>
    </article>
  `).join("");
  return htmlDocument("AI Prompt A/B Lab", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>AI 프롬프트 A/B 랩</h1>
      <p class="lead">AI는 이미 일반 개발 지식이 충분합니다. 이 랩의 목적은 소스를 앱에 내장하는 것이 아니라, 막연한 바이브코딩 요청을 source-grounded 구현 요청 후보로 바꿔 AI가 추측하지 않게 만드는 것입니다.</p>
      <section class="grid">
        <article>
          <h2>프롬프트 A</h2>
          <p>막연한 한 줄 요청입니다. 빠르지만 AI가 제품 목적, 구조, 검증 기준을 추측하게 만듭니다.</p>
          <pre>${escape(aiPromptAbLabPromptA())}</pre>
        </article>
        <article>
          <h2>검토 후 다듬을 프롬프트 B 후보</h2>
          <p>소스 전체를 외우게 하지 않고, 목적, source evidence, 작은 slice, acceptance criteria, verification assertion만 제공하는 초안입니다.</p>
          <pre>${escape(aiPromptAbLabPromptB(session, analysis))}</pre>
        </article>
      </section>
      <section>
        <h2>A/B 검토 상태표</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>보낼 프롬프트 검토 상태</h2>
        <ul>${sendDecisionRows.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>
      </section>
      <section>
        <h2>검토 후 다듬을 A/B 평가 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 프롬프트 A와 검토 후 다듬을 프롬프트 B 후보를 비교해줘. 일반 개발 지식 설명은 줄이고, 목적 명확성, source evidence, vertical slice, acceptance criteria, verification assertion, 실패 보고 기준으로 어느 쪽이 안전한 검토 후보인지 나눠줘. B 후보도 부족하면 학습자가 검토 후 다듬어 보낼 개선 프롬프트로 다시 써줘.</pre>
      </section>
    </main>
  `);
}

function renderAiPromptAbLabMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const sendDecisionRows = aiPromptAbLabSendDecisionRows();
  const rows = aiPromptAbLabRows(analysis).map((row) => {
    return `## ${row.criterion}

- 프롬프트 A: ${row.promptA}
- 프롬프트 B 후보: ${row.promptB}
- 학습자 확인: ${row.learnerCheck}`;
  }).join("\n\n");
  return `# AI 프롬프트 A/B 랩

Session: ${session.owner}/${session.repo}

AI는 이미 일반 개발 지식이 충분합니다. 이 랩의 목적은 소스를 앱에 내장하는 것이 아니라, 막연한 바이브코딩 요청을 source-grounded 구현 요청 후보로 바꿔 AI가 추측하지 않게 만드는 것입니다.

## 프롬프트 A

\`\`\`text
${aiPromptAbLabPromptA()}
\`\`\`

## 검토 후 다듬을 프롬프트 B 후보

\`\`\`text
${aiPromptAbLabPromptB(session, analysis).replaceAll("```", "'''")}
\`\`\`

${rows}

## 보낼 프롬프트 검토 상태

${sendDecisionRows.map((item) => `- ${item}`).join("\n")}

## 검토 후 다듬을 A/B 평가 프롬프트

\`\`\`text
나는 전문 개발자가 아니라 바이브코딩 개발자야. 아래 프롬프트 A와 검토 후 다듬을 프롬프트 B 후보를 비교해줘. 일반 개발 지식 설명은 줄이고, 목적 명확성, source evidence, vertical slice, acceptance criteria, verification assertion, 실패 보고 기준으로 어느 쪽이 안전한 검토 후보인지 나눠줘. B 후보도 부족하면 학습자가 검토 후 다듬어 보낼 개선 프롬프트로 다시 써줘.
\`\`\`
`;
}

type SourceAbsorptionRow = { area: string; artifact: string; absorbed: string; noFurtherResearch: string };

function currentGoalNoFurtherResearch(reason: string): string {
  return `현재 학습 목표 기준: ${reason}`;
}

function sourceAbsorptionRows(analysis: AnalysisBundle): SourceAbsorptionRow[] {
  return [
    {
      area: "목적과 제품 범위",
      artifact: "html/overview.html",
      absorbed: analysis.purposeReport.oneLineSummary,
      noFurtherResearch: "비슷한 앱의 한 문장 목적과 제외 범위는 overview/daily-summary에 남았습니다. 소스가 바뀌지 않았다면 같은 목적 조사는 반복하지 않습니다."
    },
    {
      area: "아키텍처 역할",
      artifact: "html/architecture.html",
      absorbed: analysis.architectureReport.architectureRationale,
      noFurtherResearch: "AI에게 설명할 구조 이유와 책임 경계는 architecture/rebuild에 남았습니다. 새 기능 범위가 생길 때만 재조사합니다."
    },
    {
      area: "아키텍처 원리",
      artifact: "reference/architecture-principle-playbook.html",
      absorbed: "문법 암기 대신 목적, 책임 경계, 핵심 파일 역할, 용어, 검증 질문을 AI 지시용 원리 카드로 바꿨습니다.",
      noFurtherResearch: "비슷한 앱 제작에 필요한 구조 판단 기준은 architecture principle playbook에 남았습니다. 새 아키텍처 패턴을 비교할 때만 다시 조사합니다."
    },
    {
      area: "소스 자기 설명 인터뷰",
      artifact: "reference/source-to-build-interview.html",
      absorbed: "목적, 구조 이유, 책임 경계, 용어, 첫 slice, 검증 질문을 학습자가 자기 말로 답하고 AI에게 확인시킬 인터뷰 카드로 바꿨습니다.",
      noFurtherResearch: "self-explanation, Socratic 질문, retrieval practice 원리는 source-to-build interview에 흡수했습니다. 새 교육 실험 설계가 목표가 될 때만 다시 조사합니다."
    },
    {
      area: "비슷한 앱 전이 지도",
      artifact: "reference/similar-app-transfer-map.html",
      absorbed: "원본에서 그대로 가져갈 원리와 새 앱에 맞게 바꿀 결정을 KEEP / ADAPT / ASK AI / VERIFY 흐름으로 분리했습니다.",
      noFurtherResearch: "worked examples, analogical transfer, epistemic debt 완화 원리는 similar-app transfer map에 흡수했습니다. 새 전이 평가 실험이 목표가 될 때만 다시 조사합니다."
    },
    {
      area: "학습자 목표 정렬",
      artifact: "reference/learner-goal-alignment.html",
      absorbed: "학습자가 가져온 PRD/이슈/프롬프트를 source-grounded 문제, 사용자, 아키텍처 책임, 첫 slice, acceptance criteria, 검증 기준과 비교하는 절차를 추가했습니다.",
      noFurtherResearch: "well-scoped AI task, spec-first, prompt requirement validation 원리는 learner goal alignment에 흡수했습니다. 실제 AI 도구별 프롬프트 성공률 실험이 목표가 될 때만 다시 조사합니다."
    },
    {
      area: "AI 구현 대화 루프",
      artifact: "reference/ai-implementation-loop.html",
      absorbed: "AI 구현 결과를 PLAN / OBSERVE / CHECK / REVISE / VERIFY / NEXT 루프로 검토하고 다음 질문으로 좁히는 절차를 추가했습니다.",
      noFurtherResearch: "AI-assisted programming의 metacognitive planning, monitoring, evaluation 원리는 implementation loop에 흡수했습니다. 새 대화 로그 평가 실험이 목표가 될 때만 다시 조사합니다."
    },
    {
      area: "AI 지시용 용어",
      artifact: "html/glossary.html",
      absorbed: `${analysis.dailySummaryReport.termsToKnow.length}개 용어를 AI prompt use와 함께 추출했습니다.`,
      noFurtherResearch: "PRD, SDD, TDD, acceptance criteria 같은 지시 용어는 glossary와 start page에 남았습니다."
    },
    {
      area: "구현 프롬프트",
      artifact: "html/vibe-coding-prompt-pack.html",
      absorbed: `${analysis.vibeCodingPromptPackReport.promptSequence.length}단계 prompt sequence와 source-grounded implementation prompt를 생성했습니다.`,
      noFurtherResearch: "학습자가 검토 후 다듬어 보낼 orient/architect/plan/review 프롬프트는 prompt pack에 남았습니다."
    },
    {
      area: "구현 브리프",
      artifact: "reference/vibe-coding-implementation-brief.html",
      absorbed: "비슷한 앱을 만들기 위해 AI에게 넘길 제품 목적, 첫 vertical slice, 수락 기준, 검증 계획을 한 장으로 압축했습니다.",
      noFurtherResearch: "첫 구현을 맡길 브리프는 implementation brief에 남았습니다. 새 기능 범위가 생길 때만 다시 작성합니다."
    },
    {
      area: "AI 프롬프트 준비도",
      artifact: "reference/ai-prompt-readiness-checklist.html",
      absorbed: "AI에게 보내기 전 프롬프트가 문제 설명, 관련 source evidence, vertical slice, acceptance criteria, 검증 assertion을 갖췄는지 점검합니다.",
      noFurtherResearch: "외부 AI-coding prompt best practice는 prompt readiness checklist에 흡수했습니다. 새 AI 도구 워크플로가 목표가 될 때만 다시 조사합니다."
    },
    {
      area: "프롬프트 A/B 랩",
      artifact: "reference/ai-prompt-ab-lab.html",
      absorbed: "막연한 한 줄 요청과 source-grounded 구현 요청 후보를 비교해, 바이브코딩 학습자가 왜 근거, 범위, 검증 기준을 줘야 하는지 확인합니다.",
      noFurtherResearch: "프롬프트 비교 기준은 A/B lab과 readiness checklist에 남겼습니다. 실제 AI 도구별 성능 실험이 목표가 될 때만 다시 조사합니다."
    },
    {
      area: "검증 경계",
      artifact: "html/session-verification.html",
      absorbed: `${analysis.dailySummaryReport.verificationBoundaries.length}개 검증 경계를 정적 근거와 실행 필요 항목으로 분리했습니다.`,
      noFurtherResearch: "정적 분석으로 확인한 것과 실행해야 할 것은 session verification, verification records, daily summary에 남았습니다."
    },
    {
      area: "소스 보존 판단",
      artifact: "reference/source-retention-guide.html",
      absorbed: "원본 소스를 앱 지식으로 내장하지 않고, 보존할 학습 산출물과 정리 전 체크포인트를 분리했습니다.",
      noFurtherResearch: "용량 정리 판단은 retention guide, verification records, 이 ledger를 기준으로 하고, 원본 소스 자체를 장기 지식으로 저장하지 않습니다."
    }
  ].map((row) => ({
    ...row,
    noFurtherResearch: currentGoalNoFurtherResearch(row.noFurtherResearch)
  }));
}

function sourceAbsorptionAiConfirmationPrompt(row: SourceAbsorptionRow): string {
  return `나는 전문 개발자가 아니라 바이브코딩 개발자야. ${row.area} 항목에서 흡수한 내용이 ${row.artifact}에 충분히 남았는지 확인하고, "${row.noFurtherResearch}" 판단이 현재 학습 목표와 정적 근거 기준에서 맞는지 PASS_REVIEW / REVISE / BLOCK 검토 상태로 알려줘. PASS_REVIEW도 현재 항목 검토 후보일 뿐 전체 조사 종료, 최종 ACCEPT, 배포, source 삭제 허가가 아니라 학습자가 현재 학습 목표의 보존 증거와 검증 기록을 다시 확인할 후보 상태로만 둬. 부족하면 추가 조사 질문 3개와 AI에게 줄 다음 프롬프트를 써줘.`;
}

function sourceAbsorptionResearchGaps(analysis: AnalysisBundle): string[] {
  return [
    ...analysis.runtimeEnvironmentReport.missingSignals.map((item) => `runtime gap: ${item}`),
    ...analysis.coverageReport.uncoveredImportantFiles.map((item) => `source evidence gap: ${item}`)
  ].slice(0, 12);
}

function sourceAbsorptionPreservedEvidenceBundle(): string[] {
  return [
    "reference/source-absorption-ledger.html: 무엇을 흡수했고 현재 학습 목표에서 추가 조사가 필요한지 기록합니다.",
    "analysis/daily-summary-report.json: sourceHandling, promptsToReuse, termsToKnow, verificationBoundaries를 보존합니다.",
    "html/vibe-coding-prompt-pack.html: AI에게 줄 구현 프롬프트와 학습자 역할을 보존합니다.",
    "reference/vibe-coding-implementation-brief.html: 첫 vertical slice, 수락 기준, 학습자 판단 체크포인트를 보존합니다.",
    "html/session-verification.html: 정적 근거, 실행 검증, 사람 판단 경계를 보존합니다.",
    "reference/source-retention-guide.html: 생성된 세션 `source/` 스냅샷 정리 검토 전 보존/정리 판단 가이드를 보존합니다.",
    "README.study.md: `source/` 링크가 닫혀도 학습자가 목적, 아키텍처, 프롬프트, 검증 경계를 다시 찾을 수 있게 합니다."
  ];
}

function renderSourceAbsorptionLedgerHtml(session: StudySession, analysis: AnalysisBundle): string {
  const totalBytes = analysis.sourceSnapshotReport.files.reduce((sum, file) => sum + file.size, 0);
  const absorbedRows = sourceAbsorptionRows(analysis);
  const gaps = sourceAbsorptionResearchGaps(analysis);
  const preservedEvidenceBundle = sourceAbsorptionPreservedEvidenceBundle();
  const cleanupVerdict = gaps.length === 0 ? "정리 검토 후보 · 토큰 전 보존" : "정리 보류";
  const cleanupReason = gaps.length === 0
    ? "현재 학습 목표와 정적 분석 기준으로 반복 조사할 항목은 없습니다. 그래도 생성된 세션 `source/` 스냅샷은 정리 검토 후보일 뿐이며, source-absorption-ledger, session-verification, verification records, source-retention-guide, README.study.md가 남고 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 뒤 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인을 남긴 경우에만 생성된 세션 `source/` 스냅샷 정리를 검토합니다."
    : "아직 확인할 항목이 있으므로 생성된 세션 `source/` 스냅샷을 보존하고 실행, 테스트, 빌드, 사용자 의도 확인을 먼저 진행합니다.";
  const rows = absorbedRows.map((row) => `
    <article>
      <h2>${escape(row.area)}</h2>
      <p>${escape(row.absorbed)}</p>
      <p><strong>흡수된 산출물:</strong> <code>${escape(row.artifact)}</code></p>
      <p><strong>현재 목표 조사 판단:</strong> ${escape(row.noFurtherResearch)}</p>
      <h3>AI에게 줄 확인 프롬프트</h3>
      <p>${escape(sourceAbsorptionAiConfirmationPrompt(row))}</p>
    </article>
  `).join("");
  return htmlDocument("Source Absorption Ledger", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>Source Absorption Ledger</h1>
      <p class="lead">이 문서는 ${escape(session.owner)}/${escape(session.repo)} 소스에서 RepoTutor가 무엇을 흡수했고, 현재 학습 목표에서 무엇은 반복 조사하지 않아도 되는지, 무엇은 아직 확인이 필요한지 구분합니다.</p>
      <section class="grid">
        <article>
          <h2>흡수 원칙</h2>
          <p>원본 소스 전체를 앱 지식으로 내장하지 않습니다. 남기는 것은 목적, 아키텍처 역할, AI 지시용 용어, 프롬프트, 검증 경계, 보존 판단입니다.</p>
        </article>
        <article>
          <h2>현재 생성 세션 <code>source/</code> 스냅샷</h2>
          <ul>
            <li>파일 수: ${analysis.sourceSnapshotReport.totalFiles}</li>
            <li>크기: ${formatBytes(totalBytes)}</li>
            <li>생성: ${escape(analysis.sourceSnapshotReport.createdAt)}</li>
          </ul>
        </article>
        <article>
          <h2>현재 목표 조사 요약</h2>
          <ul>
            <li>흡수한 학습 산출물: ${absorbedRows.length}</li>
            <li>추가 조사 필요 항목: ${gaps.length}</li>
            <li>정리 판단: ${escape(cleanupVerdict)}</li>
          </ul>
          <p>${generatedSourceSnapshotHtml(cleanupReason)}</p>
        </article>
      </section>
      <section>
        <h2>정리 전 보존 증거 묶음</h2>
        <p>아래 산출물이 남아 있어야 생성된 세션 <code>source/</code> 스냅샷을 장기 지식으로 보관하지 않고도 학습 목적, 아키텍처 이유, AI 프롬프트, 검증 경계, 정리 판단을 복원할 수 있습니다.</p>
        <ul>${preservedEvidenceBundle.map((item) => `<li>${generatedSourceSnapshotHtml(item)}</li>`).join("")}</ul>
      </section>
      <section>
        <h2>앱이 흡수한 기능</h2>
        <div class="cards">${rows}</div>
      </section>
      <section>
        <h2>현재 목표 추가 조사 필요 여부</h2>
        <p>아래 목록이 비어 있으면 현재 학습 목표와 정적 분석 기준으로 반복 조사할 항목은 없습니다. 항목이 있으면 원본 실행, 테스트, 빌드, 사용자 의도 확인이 필요합니다.</p>
        <ul>${gaps.length > 0 ? gaps.map((gap) => `<li>${escape(gap)}</li>`).join("") : "<li>현재 학습 목표와 정적 분석 기준으로 추가 조사 필요 항목이 없습니다.</li>"}</ul>
      </section>
      <section>
        <h2>용량 정리 판단</h2>
        <p>생성된 세션 <code>source/</code> 스냅샷은 evidence 링크 검증에 쓰입니다. 용량을 확보하려면 먼저 이 ledger, daily summary, prompt pack, session verification, verification records, source retention guide를 보존한 뒤, source evidence 링크 검증이 더 필요 없는 세션에서만 수동 정리 검토를 진행합니다.</p>
        <p>READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다. 실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록 확인 뒤 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 뒤 <code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰을 입력한 경우에만 검토합니다. <code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인을 남긴 경우에만 정리 검토 후보가 됩니다.</p>
      </section>
    </main>
  `);
}

function renderSourceAbsorptionLedgerMarkdown(session: StudySession, analysis: AnalysisBundle): string {
  const totalBytes = analysis.sourceSnapshotReport.files.reduce((sum, file) => sum + file.size, 0);
  const absorbedRows = sourceAbsorptionRows(analysis);
  const rawGaps = sourceAbsorptionResearchGaps(analysis);
  const preservedEvidenceBundle = sourceAbsorptionPreservedEvidenceBundle();
  const cleanupVerdict = rawGaps.length === 0 ? "정리 검토 후보 · 토큰 전 보존" : "정리 보류";
  const cleanupReason = rawGaps.length === 0
    ? "현재 학습 목표와 정적 분석 기준으로 반복 조사할 항목은 없습니다. 그래도 생성된 세션 `source/` 스냅샷은 정리 검토 후보일 뿐이며, source-absorption-ledger, session-verification, verification records, source-retention-guide, README.study.md가 남고 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 뒤 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인을 남긴 경우에만 생성된 세션 `source/` 스냅샷 정리를 검토합니다."
    : "아직 확인할 항목이 있으므로 생성된 세션 `source/` 스냅샷을 보존하고 실행, 테스트, 빌드, 사용자 의도 확인을 먼저 진행합니다.";
  const rows = absorbedRows.map((row) => {
    return `## ${row.area}

- 흡수된 산출물: \`${row.artifact}\`
- 흡수한 내용: ${row.absorbed}
- 현재 목표 조사 판단: ${row.noFurtherResearch}
- AI에게 줄 확인 프롬프트: ${sourceAbsorptionAiConfirmationPrompt(row)}`;
  }).join("\n\n");
  const gaps = rawGaps.map((gap) => `- ${gap}`).join("\n") || "- 현재 학습 목표와 정적 분석 기준으로 추가 조사 필요 항목이 없습니다.";
  return `# Source Absorption Ledger

Session: ${session.owner}/${session.repo}

이 문서는 소스에서 RepoTutor가 무엇을 흡수했고, 현재 학습 목표에서 무엇은 반복 조사하지 않아도 되는지, 무엇은 아직 확인이 필요한지 구분합니다.

원본 소스 전체를 앱 지식으로 내장하지 않습니다. 남기는 것은 목적, 아키텍처 역할, AI 지시용 용어, 프롬프트, 검증 경계, 보존 판단입니다.

## Generated Session Source Snapshot

- Files: ${analysis.sourceSnapshotReport.totalFiles}
- Size: ${formatBytes(totalBytes)}
- Created: ${analysis.sourceSnapshotReport.createdAt}

## 현재 목표 조사 요약

- 흡수한 학습 산출물: ${absorbedRows.length}
- 추가 조사 필요 항목: ${rawGaps.length}
- 정리 판단: ${cleanupVerdict}
- 판단 근거: ${generatedSourceSnapshotMarkdown(cleanupReason)}

## 정리 전 보존 증거 묶음

아래 산출물이 남아 있어야 생성된 세션 \`source/\` 스냅샷을 장기 지식으로 보관하지 않고도 학습 목적, 아키텍처 이유, AI 프롬프트, 검증 경계, 정리 판단을 복원할 수 있습니다.

${preservedEvidenceBundle.map((item) => `- ${generatedSourceSnapshotMarkdown(item)}`).join("\n")}

${rows}

## 현재 목표 추가 조사 필요 여부

${gaps}

## 용량 정리 판단

생성된 세션 \`source/\` 스냅샷은 evidence 링크 검증에 쓰입니다. 용량을 확보하려면 먼저 이 ledger, daily summary, prompt pack, session verification, verification records, source retention guide를 보존한 뒤, source evidence 링크 검증이 더 필요 없는 세션에서만 수동 정리 검토를 진행합니다.

READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다. 실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록 확인 뒤 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 뒤 \`DELETE-SOURCE-SNAPSHOT\` 확인 토큰을 입력한 경우에만 검토합니다. \`DELETE-SOURCE-SNAPSHOT\` 확인 토큰으로 source 링크가 더 이상 열리지 않아도 된다는 마지막 학습자 명시 확인을 남긴 경우에만 정리 검토 후보가 됩니다.
`;
}

function renderSourceRetentionGuide(session: StudySession, analysis: AnalysisBundle): string {
  const totalBytes = analysis.sourceSnapshotReport.files.reduce((sum, file) => sum + file.size, 0);
  const retainedArtifacts = analysis.dailySummaryReport.sourceHandling.retainedArtifacts.map((item) => `
    <article>
      <h2>${escape(item.label)}</h2>
      <p>${escape(item.purpose)}</p>
      <p><a href="../${escape(item.href)}">열기</a></p>
    </article>
  `).join("");
  const topFiles = analysis.sourceSnapshotReport.files
    .slice()
    .sort((a, b) => b.size - a.size)
    .slice(0, 12)
    .map((file) => `<li><code>${escape(file.filePath)}</code> · ${formatBytes(file.size)} · ${file.tracked ? "tracked evidence" : "untracked text"}</li>`)
    .join("");
  return htmlDocument("Source Retention Guide", `
    <main>
      <p class="eyebrow">Reference · ${escape(session.repo)}</p>
      <h1>소스 보존/정리 판단 가이드</h1>
      <p class="lead">RepoTutor의 목적은 원본 소스를 앱 지식으로 내장하는 것이 아니라, 바이브코딩에 필요한 목적, 구조, 용어, 프롬프트, 검증 경계로 번역하는 것입니다.</p>
      <section class="grid">
        <article>
          <h2>현재 생성 세션 <code>source/</code> 스냅샷</h2>
          <ul>
            <li>파일 수: ${analysis.sourceSnapshotReport.totalFiles}</li>
            <li>크기: ${formatBytes(totalBytes)}</li>
            <li>생성: ${escape(analysis.sourceSnapshotReport.createdAt)}</li>
          </ul>
        </article>
        <article>
          <h2>정리 전 기준</h2>
          <p>생성된 세션 <code>source/</code> 스냅샷은 근거입니다. 사용자 원본 소스는 자동 정리 대상이 아니며, 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 되는지와 보존 증거 묶음이 남았는지를 학습자가 명시 확인한 뒤에만 생성된 스냅샷 정리 후보로 봅니다.</p>
          <p>READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다. <code>DELETE-SOURCE-SNAPSHOT</code> 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 명시 확인했다는 뜻입니다.</p>
          <ul>
            <li>현재 학습 목표에서 evidence link가 필요한 리포트를 모두 열어봤는가?</li>
            <li>프롬프트 팩, daily summary, source absorption ledger, session verification, verification records가 보존 증거 묶음으로 남아 있는가?</li>
            <li>session verification이 통과했고 verification records가 남았는가?</li>
            <li>학습자가 source 링크가 더 이상 열리지 않아도 목적, 아키텍처 이유, AI 프롬프트, 검증 기준을 설명할 수 있다고 명시 확인했는가?</li>
            <li>나중에 같은 소스를 다시 받을 수 있는가?</li>
          </ul>
        </article>
      </section>
      <section>
        <h2>남겨야 할 학습 산출물</h2>
        <div class="cards">${retainedArtifacts}</div>
      </section>
      <section>
        <h2>정리 원칙</h2>
        <ul>${analysis.dailySummaryReport.sourceHandling.cleanupGuidance.map((item) => `<li>${generatedSourceSnapshotHtml(item)}</li>`).join("")}</ul>
      </section>
      <section>
        <h2>큰 파일 후보</h2>
        <p class="muted">이 목록은 삭제 명령이 아니라 용량 판단을 위한 근거입니다.</p>
        <ul>${topFiles || "<li>표시할 생성 세션 <code>source/</code> 스냅샷 파일이 없습니다.</li>"}</ul>
      </section>
      <section>
        <h2>AI에게 줄 확인 프롬프트</h2>
        <pre>나는 전문 개발자가 아니라 바이브코딩 개발자야. 현재 학습 목표에서 이 세션의 source 링크가 더 이상 열리지 않아도 되는지 판단하기 전에, 남아 있는 source absorption ledger, evidence, daily summary, prompt pack, session verification, verification records, source retention guide를 기준으로 보존 증거 묶음이 충분한지 점검해줘. READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아니며 DELETE-SOURCE-SNAPSHOT 확인 토큰은 source 링크가 더 이상 열리지 않아도 된다는 학습자의 마지막 명시 확인이라는 경계도 확인해줘. 원본 소스를 앱 지식으로 내장하지 말고, 남길 학습 산출물, 재검증이 필요한 항목, 학습자 명시 확인이 필요한 항목만 분리해줘.</pre>
      </section>
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

function generatedSourceSnapshotHtml(value: string): string {
  const placeholder = "__REPOTUTOR_GENERATED_SOURCE_SNAPSHOT_PATH__";
  return escape(value)
    .replaceAll("`source/`", placeholder)
    .replaceAll("source/", placeholder)
    .replaceAll(placeholder, "<code>source/</code>");
}

function generatedSourceSnapshotMarkdown(value: string): string {
  const placeholder = "__REPOTUTOR_GENERATED_SOURCE_SNAPSHOT_PATH__";
  return value
    .replaceAll("`source/`", placeholder)
    .replaceAll("source/", placeholder)
    .replaceAll(placeholder, "`source/`");
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && size >= 1024; index += 1) {
    size /= 1024;
    unit = units[index];
  }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${unit}`;
}
