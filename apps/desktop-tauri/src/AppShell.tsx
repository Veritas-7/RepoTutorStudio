import { BrainCircuit, Copy, FileText, KeyRound, ListChecks, Play, RotateCcw, Route, ShieldCheck, Square, StickyNote, Terminal, Trash2 } from "lucide-react";
import React from "react";
import { CORE_LEARNING_REPORT_TARGETS } from "@repotutor/shared/report-targets";
import {
  cleanupDecisionText,
  evidenceLineHasDetail,
  formatBytes,
  learnerBriefScaffold,
  learningBoundaryItems,
  levelLabels,
  modeLabels,
  previewSrc,
  quizSummaryText,
  readableReportPath,
  reportTargetDescriptionNode,
  sourceSnapshotCodePathNode,
  statusLabels
} from "./app-copy.js";
import { LogPanel } from "./components/LogPanel.js";
import { MissionBrief } from "./components/MissionBrief.js";
import { QuizWorkspace } from "./components/QuizWorkspace.js";
import { SessionSidebar } from "./components/SessionSidebar.js";
import { TutorPane } from "./components/TutorPane.js";
import { implementationHandoffCheckpoints, sourceCleanupCheckpoints, sourcePurposeContractItems, tabTargetMap, tabs, vibeCodingStartTab, vibeCodingStartTarget } from "./report-targets.js";
import { invoke } from "./tauri-api.js";
import type { AttemptResponse, LearnerLevel, QuizPayload, SessionRow, SourcePruneResponse, StudyMode, StudyResponse } from "./types.js";

const { useEffect, useMemo, useRef, useState } = React;

export default function App() {
  const [source, setSource] = useState("https://github.com/openai/codex");
  const [learnerBriefText, setLearnerBriefText] = useState("");
  const [mode, setMode] = useState<StudyMode>("standard");
  const [level, setLevel] = useState<LearnerLevel>("beginner");
  const [activeTab, setActiveTab] = useState(vibeCodingStartTab);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [current, setCurrent] = useState<StudyResponse | null>(null);
  const [log, setLog] = useState<string[]>(["RepoTutor Studio 대기 중: 소스를 입력하면 학습 설계를 시작합니다"]);
  const [running, setRunning] = useState(false);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
  const [selectedTarget, setSelectedTarget] = useState(vibeCodingStartTarget);
  const [sourcePrune, setSourcePrune] = useState<SourcePruneResponse | null>(null);
  const [pruneRunning, setPruneRunning] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [showOnlyMissingQuizQuestions, setShowOnlyMissingQuizQuestions] = useState(false);
  const [aiResponseReviewState, setAiResponseReviewState] = useState<Record<string, boolean>>({});
  const [implementationResultReviewState, setImplementationResultReviewState] = useState<Record<string, boolean>>({});
  const [implementationResultEvidenceText, setImplementationResultEvidenceText] = useState("");
  const didAutoResumeSession = useRef(false);

  const normalizedLearnerBrief = learnerBriefText.trim();
  const learnerBriefReadinessChecks = [
    {
      label: "목적/문제",
      ready: /목적|목표|문제|사용자|기능|앱|제품|만들|해결/.test(normalizedLearnerBrief),
      hint: "무엇을 왜 만들려는지"
    },
    {
      label: "구조/역할",
      ready: /아키텍처|구조|역할|책임|흐름|폴더|파일|컴포넌트|경계/.test(normalizedLearnerBrief),
      hint: "어떤 부분의 책임을 배울지"
    },
    {
      label: "검증/AI 지시",
      ready: /검증|테스트|기준|수락|프롬프트|AI|구현|리뷰|확인/.test(normalizedLearnerBrief),
      hint: "AI에게 맡길 일과 확인 기준"
    }
  ];
  const learnerBriefReadyCount = learnerBriefReadinessChecks.filter((item) => item.ready).length;
  const learnerBriefReadinessSummary = learnerBriefReadyCount === learnerBriefReadinessChecks.length
    ? `브리프 준비도 ${learnerBriefReadyCount}/${learnerBriefReadinessChecks.length} · AI 지시 초안 검토 후보`
    : `브리프 준비도 ${learnerBriefReadyCount}/${learnerBriefReadinessChecks.length} · 맥락 보강 필요`;
  const learnerBriefMissingLabels = learnerBriefReadinessChecks.filter((item) => !item.ready).map((item) => item.label);
  const learnerBriefNextStep = learnerBriefMissingLabels.length === 0
    ? "다음 보강: 검토 준비 후보입니다. 학습 시작 전 AI 구현 브리프와 검증 기준을 다시 확인하세요."
    : `다음 보강: ${learnerBriefMissingLabels.join(", ")} 맥락을 한 문장씩 추가하세요.`;
  const learnerPromptDraftLines = [
    "다음 소스/깃허브를 근거로 비슷한 앱을 바이브코딩으로 만들 수 있게 첫 vertical slice를 설계하세요.",
    `소스: ${source.trim() || "분석 대상 미입력"}`,
    `학습자 목표: ${normalizedLearnerBrief || "목표, 구조, AI 지시, 검증 기준을 먼저 작성"}`,
    "전제: AI는 일반 개발지식을 이미 알고 있으므로, 소스를 지식으로 내장하지 말고 이 프로젝트의 목적/책임/검증 근거로만 사용하세요.",
    "학습 방식: 전통적인 문법 강의나 라인별 코딩 수업이 아니라, 바이브코딩 학습자가 AI를 지휘하고 검토하는 데 필요한 원리, 용어, 아키텍처 이유만 설명하세요.",
    "요구: 문법 설명보다 제품 목적, 아키텍처 역할, 파일 책임, AI가 구현할 첫 기능, 수락 기준을 제시하세요.",
    "검증: 정적 분석 근거와 실제 실행/테스트 필요 항목을 분리하세요."
  ];
  const learnerPromptDraft = learnerPromptDraftLines.join("\n");
  const learnerAiResponseReviewChecks = [
    {
      label: "목적 보존",
      text: "원래 문제와 학습자 목표가 구현 제안에 남아 있는지"
    },
    {
      label: "역할 경계",
      text: "아키텍처, 폴더, 파일 책임이 섞이지 않고 설명되는지"
    },
    {
      label: "검증 근거",
      text: "정적 분석 근거와 실제 실행/테스트 필요 항목이 분리되는지"
    }
  ];
  const aiResponseReviewDoneCount = learnerAiResponseReviewChecks.filter((item) => aiResponseReviewState[item.label]).length;
  const aiResponseReviewSummary = aiResponseReviewDoneCount === learnerAiResponseReviewChecks.length
    ? `AI 응답 검토 ${aiResponseReviewDoneCount}/${learnerAiResponseReviewChecks.length} 확인됨 · 구현 지시 검토 후보`
    : `AI 응답 검토 ${aiResponseReviewDoneCount}/${learnerAiResponseReviewChecks.length} 확인됨 · 검토 필요`;
  const aiResponseRevisionMissingLabels = learnerAiResponseReviewChecks.filter((item) => !aiResponseReviewState[item.label]).map((item) => item.label);
  const aiResponseRevisionPromptLines = aiResponseRevisionMissingLabels.length === 0
    ? [
      "AI 응답 검토 기준이 모두 확인됐습니다.",
      "다음 단계: 제안된 첫 vertical slice를 바로 보내지 말고, 작은 구현 후보로 나눈 뒤 실행 전 수락 기준과 테스트 비교 방법을 다시 확인하세요."
    ]
    : [
      "방금 받은 AI 응답을 아래 기준으로 다시 보강하세요.",
      `부족한 검토 기준: ${aiResponseRevisionMissingLabels.join(", ")}`,
      "전제: 소스는 AI에게 개발지식을 새로 가르치는 내장 데이터가 아니라, 이 프로젝트의 맥락을 확인하는 임시 근거입니다.",
      "학습 방식: 전통적인 코딩 강의처럼 문법을 나열하지 말고, 바이브코딩 학습자가 AI에게 다시 지시할 수 있는 목적, 책임, 용어, 검증 기준으로 정리하세요.",
      "수정 요구: 원래 학습자 목표를 보존하고, 아키텍처/폴더/파일 책임을 분리하며, 정적 분석 근거와 실제 실행/테스트 필요 항목을 분리하세요.",
      "출력 형식: 수정된 첫 vertical slice, 책임 경계, 수락 기준, 검증 계획."
    ];
  const aiResponseRevisionPrompt = aiResponseRevisionPromptLines.join("\n");

  const selectedSession = useMemo(() => sessions.find((session) => current?.path === session.path), [sessions, current]);
  const quizAnsweredCount = quiz ? quiz.questions.filter((question) => answers[question.id]).length : 0;
  const quizTotalCount = quiz?.questions.length ?? 0;
  const quizMissingCount = Math.max(quizTotalCount - quizAnsweredCount, 0);
  const quizMissingQuestionNumbers = quiz ? quiz.questions.flatMap((question, index) => answers[question.id] ? [] : [index + 1]) : [];
  const quizMissingQuestionSummary = quizMissingQuestionNumbers.length === 0
    ? "미응답 문항 없음"
    : `미응답 문항: ${quizMissingQuestionNumbers.slice(0, 8).join(", ")}${quizMissingQuestionNumbers.length > 8 ? ` 외 ${quizMissingQuestionNumbers.length - 8}개` : ""}`;
  const quizReadyToSubmit = quizTotalCount > 0 && quizAnsweredCount === quizTotalCount;
  const visibleQuizQuestions = quiz
    ? quiz.questions
      .map((question, index) => ({ question, questionNumber: index + 1 }))
      .filter(({ question }) => !showOnlyMissingQuizQuestions || !answers[question.id])
    : [];
  const quizQuestionVisibilitySummary = showOnlyMissingQuizQuestions
    ? `미응답 문항만 표시: ${visibleQuizQuestions.length}개`
    : `전체 문항 표시: ${quizTotalCount}개`;
  const attemptWrongNotesHtml = attempt?.wrongNotesHtml ?? attempt?.wrongNotes ?? null;
  const attemptWrongNotesMarkdown = attempt?.wrongNotesMarkdown ?? (attempt && current ? `${current.path}/markdown/wrong-notes.md` : null);
  const attemptReviewGuidance = attempt?.reviewGuidance ?? (
    attempt
      ? attempt.wrong > 0
        ? "오답노트의 선택지 복습과 learning-record를 열어 부족한 개념을 AI repair prompt로 다시 설명하세요."
        : "learning-record를 열어 이번 퀴즈가 어떤 AI 구현 맥락 준비도를 증명했는지 확인하세요."
      : ""
  );
  const filteredSessions = useMemo(() => {
    const searchTerm = sessionSearch.trim().toLowerCase();
    if (!searchTerm) return sessions;
    return sessions.filter((session) => [
      session.repo,
      session.path,
      session.mode,
      session.createdAt.slice(0, 10),
      String(session.score ?? "미응시"),
      String(session.wrong)
    ].some((value) => value.toLowerCase().includes(searchTerm)));
  }, [sessionSearch, sessions]);
  const visibleLog = log.filter((line, index, items) => index === 0 || line !== items[index - 1]);
  const visibleLogEntries = useMemo(() => {
    const seen = new Map<string, number>();
    return visibleLog.map((line) => {
      const count = (seen.get(line) ?? 0) + 1;
      seen.set(line, count);
      return { line, key: `${line}-${count}` };
    });
  }, [visibleLog]);
  const reportTargets = useMemo(() => {
    if (!current) return [];
    return CORE_LEARNING_REPORT_TARGETS.map((target) => ({
      ...target,
      path: `${current.path}/html/${target.fileName}`,
      command: target.terminalCommand.replace("<session>", current.path)
    }));
  }, [current]);
  const activeReportTarget = useMemo(() => {
    const target = activeTab === "HTML 미리보기" ? selectedTarget : (tabTargetMap[activeTab] ?? selectedTarget);
    return reportTargets.find((item) => item.target === target) ?? null;
  }, [activeTab, reportTargets, selectedTarget]);
  const implementationHandoffReports = implementationHandoffCheckpoints.map((checkpoint) => ({
    ...checkpoint,
    path: readableReportPath(reportTargets.find((target) => target.target === checkpoint.target)?.path ?? `${current?.path ?? "세션 미선택"}/html/${checkpoint.target}.html`)
  }));
  const implementationHandoffReadinessChecks = [
    {
      label: "세션 산출물",
      ready: Boolean(current && implementationHandoffReports.every((item) => !item.path.includes("세션 미선택"))),
      hint: "구현 브리프와 프롬프트 리포트 경로"
    },
    {
      label: "학습자 목표",
      ready: learnerBriefReadyCount === learnerBriefReadinessChecks.length,
      hint: "목적, 구조/역할, 검증/AI 지시"
    },
    {
      label: "검증 기준",
      ready: Boolean(sourcePrune?.checks?.sessionVerificationOk),
      hint: "세션 검증 PASS · 검증 기록 확인"
    },
    {
      label: "소스 경계",
      ready: Boolean(sourcePrune),
      hint: "생성된 세션 source/ 스냅샷은 임시 근거라는 보존 상태"
    }
  ];
  const implementationHandoffReadyCount = implementationHandoffReadinessChecks.filter((item) => item.ready).length;
  const implementationHandoffReadinessSummary = implementationHandoffReadyCount === implementationHandoffReadinessChecks.length
    ? `인계 준비도 ${implementationHandoffReadyCount}/${implementationHandoffReadinessChecks.length} · AI 구현 요청 검토 후보`
    : `인계 준비도 ${implementationHandoffReadyCount}/${implementationHandoffReadinessChecks.length} · 부족한 맥락 보강 필요`;
  const implementationHandoffMissingChecks = implementationHandoffReadinessChecks.filter((item) => !item.ready);
  const implementationHandoffRepairPrompt = [
    "다음 RepoTutor 구현 인계 준비도에서 부족한 맥락을 보강하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `현재 준비도: ${implementationHandoffReadinessSummary}`,
    "부족한 항목:",
    ...(implementationHandoffMissingChecks.length > 0
      ? implementationHandoffMissingChecks.map((item) => `- ${item.label}: ${item.hint}`)
      : ["- 없음: 첫 vertical slice 구현 전에 수락 기준과 검증 질문만 다시 점검하세요."]),
    `학습자 목표 초안: ${normalizedLearnerBrief || "비어 있음"}`,
    "전제: 학습자는 전문 개발자가 아니라 바이브코딩 개발자입니다. 문법 설명이나 코드 강의보다 AI에게 줄 목적, 역할, 용어, 검증 기준을 채우는 질문이 필요합니다.",
    "요구: 아직 구현을 시작하지 말고, 부족한 항목별로 학습자에게 물을 질문 3개, 검토 후 내 목표에 맞게 다듬을 브리프 문장, 열어볼 RepoTutor 리포트, 구현을 보류해야 할 조건을 작성하세요.",
    "출력: 1) 보강 질문 2) 브리프 보강문 3) 확인할 리포트 4) 구현 보류 조건 5) 준비 조건 확인 후 검토할 첫 vertical slice 요청 후보."
  ].join("\n");
  const normalizedImplementationResultEvidence = implementationResultEvidenceText.trim();
  const implementationResultEvidenceDetailLines = normalizedImplementationResultEvidence
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const implementationResultEvidenceWritingRules = [
    "라벨만 적으면 통과하지 않습니다.",
    "변경 파일은 실제 경로나 파일명을 적습니다.",
    "실행 명령은 명령과 PASS/FAIL 같은 결과를 함께 적습니다.",
    "실패/위험은 없음, 남음, 오류, 리스크 상태를 분명히 적습니다.",
    "직접 확인은 Playwright, 스크린샷, 클릭, 클립보드 저장 같은 관찰 행동을 적습니다."
  ];
  const implementationResultEvidenceChecks = [
    {
      label: "변경 파일",
      ready: evidenceLineHasDetail(
        implementationResultEvidenceDetailLines,
        /변경|파일|path|apps\/|packages\/|src\/|\.tsx|\.ts|\.md|\.css|\.json/,
        /(?:apps|packages|src)\/\S+|\/tmp\/\S+|\S+\.(?:tsx?|md|css|json)\b/
      ),
      hint: "AI가 실제로 바꾼 파일/영역"
    },
    {
      label: "실행 명령",
      ready: evidenceLineHasDetail(
        implementationResultEvidenceDetailLines,
        /pnpm|npm|yarn|node|test|typecheck|build|실행|명령|검증|PASS|FAIL|통과/,
        /(?:pnpm|npm|yarn|node|npx|bun|cargo|pytest|test|typecheck|build).*(?:PASS|FAIL|통과|실패|완료|OK|0)|(?:PASS|FAIL|통과|실패).*(?:pnpm|npm|node|test|build|typecheck)/
      ),
      hint: "실행한 명령과 결과"
    },
    {
      label: "실패/위험",
      ready: evidenceLineHasDetail(
        implementationResultEvidenceDetailLines,
        /실패|오류|FAIL|남은|없음|리스크|위험|block|BLOCK|pass|PASS|통과/,
        /없음|해결|남음|남은\s+\S+|FAIL|오류\s+\S+|리스크\s+\S+|위험\s+\S+|PASS|통과/
      ),
      hint: "남은 실패 로그나 위험"
    },
    {
      label: "직접 확인",
      ready: evidenceLineHasDetail(
        implementationResultEvidenceDetailLines,
        /화면|클릭|복사|브라우저|Playwright|스크린샷|직접|확인|동작|UI/,
        /Playwright|스크린샷|브라우저|화면에서|클릭|복사|동작\s+\S+|확인\s+\S+|봤|열었|눌렀/
      ),
      hint: "사람이 직접 본 화면/동작"
    }
  ];
  const implementationResultEvidenceReadyCount = implementationResultEvidenceChecks.filter((item) => item.ready).length;
  const implementationResultEvidenceReady = implementationResultEvidenceReadyCount === implementationResultEvidenceChecks.length;
  const implementationResultEvidenceSummary = implementationResultEvidenceReady
    ? `근거 준비도 ${implementationResultEvidenceReadyCount}/${implementationResultEvidenceChecks.length} · 검토 근거 충분`
    : `근거 준비도 ${implementationResultEvidenceReadyCount}/${implementationResultEvidenceChecks.length} · 근거 보강 필요`;
  const implementationResultEvidenceMissingLabels = implementationResultEvidenceChecks
    .filter((item) => !item.ready)
    .map((item) => `${item.label}: ${item.hint}`);
  const implementationResultEvidenceMissingNames = implementationResultEvidenceChecks
    .filter((item) => !item.ready)
    .map((item) => item.label);
  const implementationResultEvidenceBlockerSummary = implementationResultEvidenceReady
    ? "근거 게이트 통과 · ACCEPT_REVIEW 검토 후보 (검증 기록 확인 후)"
    : `근거 차단: ${implementationResultEvidenceMissingNames.join(", ")} 보강 필요`;
  const implementationResultEvidenceNextStep = implementationResultEvidenceReady
    ? "결과 검토 기준, 실행/화면 증거, 학습 기록을 확인하세요."
    : "근거 보강 프롬프트를 검토한 뒤 AI에게 증거와 검증 기준만 먼저 수집시키세요.";
  const implementationResultEvidenceRepairPrompt = [
    "다음 RepoTutor AI 구현 결과 근거 준비도에서 부족한 증거를 보강하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `현재 근거 준비도: ${implementationResultEvidenceSummary}`,
    `현재 근거 메모: ${normalizedImplementationResultEvidence || "비어 있음"}`,
    "부족한 근거:",
    ...(implementationResultEvidenceMissingLabels.length > 0
      ? implementationResultEvidenceMissingLabels.map((item) => `- ${item}`)
      : ["- 없음: 검토 상태 후보 전에 changed files, command results, failures/risks, direct screen checks를 짧게 재확인하세요."]),
    "전제: 학습자는 전문 개발자가 아니라 바이브코딩 개발자입니다. 코드 줄별 해설보다 AI 결과를 받아들일지 판단할 증거가 필요합니다.",
    "요구: ACCEPT_REVIEW / REVISE / BLOCK 검토 상태를 정하기 전에 부족한 근거를 먼저 채우세요. ACCEPT_REVIEW도 근거와 검증 기록 확인 후보일 뿐 최종 ACCEPT, 배포, 삭제 허가가 아닙니다. 새 기능 구현이나 전체 리팩토링을 시작하지 말고, 증거와 검증 기준 수집만 요청하세요.",
    "출력: 1) 확인할 변경 파일 2) 다시 실행할 명령과 예상 결과 3) 남은 실패/위험 확인 질문 4) 사람이 직접 볼 화면/동작 5) 근거가 채워진 뒤 보낼 검토 상태 프롬프트."
  ].join("\n");
  const implementationResultReviewPrompt = [
    "방금 AI가 만든 첫 vertical slice 구현 결과를 RepoTutor 세션 산출물 기준으로 검토하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `학습자 목표: ${normalizedLearnerBrief || "목표가 비어 있으면 먼저 목표 확인 질문을 하세요."}`,
    `구현 결과 근거 메모: ${normalizedImplementationResultEvidence || "비어 있음. AI가 바꾼 파일/명령/실패 로그/사람이 본 화면을 먼저 적으세요."}`,
    `근거 준비도: ${implementationResultEvidenceSummary}`,
    "부족한 근거:",
    ...(implementationResultEvidenceMissingLabels.length > 0
      ? implementationResultEvidenceMissingLabels.map((item) => `- ${item}`)
      : ["- 없음"]),
    "검토 기준:",
    "- 목적 보존: 원래 만들려는 앱/기능의 문제와 사용자가 유지됐는가",
    "- 범위 제한: 첫 vertical slice를 넘어서 전체 앱 재작성이나 불필요한 리팩토링으로 커지지 않았는가",
    "- 역할 경계: 파일/폴더/컴포넌트 책임이 RepoTutor 구현 브리프와 어긋나지 않는가",
    "- 검증 근거: 실행한 명령, 실패 로그, 사람이 직접 볼 화면/동작 확인 항목이 분리됐는가",
    "- 학습자 판단: 문법 설명보다 목적, 아키텍처 이유, 용어, 수락 기준을 학습자가 설명할 수 있는가",
    "전제: 학습자는 전문 개발자가 아니라 바이브코딩 개발자입니다. 코드 줄별 강의가 아니라 ACCEPT_REVIEW / REVISE / BLOCK 검토 상태와 수정 프롬프트가 필요합니다.",
    "출력: 1) ACCEPT_REVIEW / REVISE / BLOCK 검토 상태 2) 근거 3) 반드시 다시 시킬 수정 프롬프트 4) 실행/테스트 확인 5) 학습자가 이해해야 할 용어 3개. ACCEPT_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 학습자가 근거와 검증 기록을 확인할 후보로 표시하세요."
  ].join("\n");
  const implementationResultReviewChecks = [
    {
      label: "목적 보존",
      text: "원래 만들려는 앱/기능의 문제와 사용자가 유지됐는지"
    },
    {
      label: "범위 제한",
      text: "첫 vertical slice를 넘어 전체 앱 재작성으로 커지지 않았는지"
    },
    {
      label: "역할 경계",
      text: "파일/폴더/컴포넌트 책임이 구현 브리프와 맞는지"
    },
    {
      label: "검증 근거",
      text: "실행한 명령, 실패 로그, 사람이 볼 확인 항목이 분리됐는지"
    },
    {
      label: "학습자 판단",
      text: "문법보다 목적, 구조 이유, 용어, 수락 기준을 설명할 수 있는지"
    }
  ];
  const implementationResultReviewDoneCount = implementationResultReviewChecks.filter((item) => implementationResultReviewState[item.label]).length;
  const implementationResultReviewMissingLabels = implementationResultReviewChecks
    .filter((item) => !implementationResultReviewState[item.label])
    .map((item) => `${item.label}: ${item.text}`);
  const implementationResultReviewCompletedLabels = implementationResultReviewChecks
    .filter((item) => implementationResultReviewState[item.label])
    .map((item) => item.label);
  const implementationResultReviewDecision = !implementationResultEvidenceReady
    ? "BLOCK 검토"
    : implementationResultReviewDoneCount === implementationResultReviewChecks.length
    ? "ACCEPT_REVIEW 검토 후보"
    : implementationResultReviewDoneCount === 0
      ? "BLOCK 검토"
      : "REVISE 검토";
  const implementationResultReviewNextAction = !implementationResultEvidenceReady
    ? "근거 보강 프롬프트로 증거와 검증 기준 먼저 수집"
    : implementationResultReviewDecision === "ACCEPT_REVIEW 검토 후보"
    ? "학습 기록과 검증 근거를 직접 확인한 뒤 다음 작은 개선 후보 1개만 검토"
    : implementationResultReviewDecision === "REVISE 검토"
      ? "재작업 프롬프트로 첫 vertical slice 안에서 수정"
      : "구현을 멈추고 누락 기준을 먼저 보강";
  const implementationResultReviewSummary = implementationResultReviewDoneCount === implementationResultReviewChecks.length && implementationResultEvidenceReady
    ? `결과 검토 ${implementationResultReviewDoneCount}/${implementationResultReviewChecks.length} 확인됨 · ACCEPT_REVIEW 검토 후보`
    : implementationResultReviewDoneCount === implementationResultReviewChecks.length
      ? `결과 검토 ${implementationResultReviewDoneCount}/${implementationResultReviewChecks.length} 확인됨 · 근거 보강 후 ACCEPT_REVIEW 검토`
      : `결과 검토 ${implementationResultReviewDoneCount}/${implementationResultReviewChecks.length} 확인됨 · REVISE/BLOCK 검토 필요`;
  const implementationResultAcceptGuardSummary = implementationResultReviewDecision === "ACCEPT_REVIEW 검토 후보"
    ? "ACCEPT_REVIEW 근거 확인(허가 아님): 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 학습자가 확인할 검토 후보로만 남깁니다."
    : !implementationResultEvidenceReady
      ? "ACCEPT_REVIEW 보류: 근거 게이트가 차단됐습니다."
      : "ACCEPT_REVIEW 보류: 검토 기준이 남았습니다.";
  const implementationResultReviewDecisionSummary = [
    `검토 상태 ${implementationResultReviewDecision}`,
    `확인 기준 ${implementationResultReviewDoneCount}/${implementationResultReviewChecks.length}`,
    `남은 기준 ${implementationResultReviewChecks.length - implementationResultReviewDoneCount}`,
    `근거 ${implementationResultEvidenceReadyCount}/${implementationResultEvidenceChecks.length}`,
    `ACCEPT_REVIEW 가드: ${implementationResultAcceptGuardSummary}`,
    `다음 행동: ${implementationResultReviewNextAction}`
  ].join(" · ");
  const implementationResultReviewRecordPrompt = [
    "다음 AI 구현 결과 검토 상태를 RepoTutor 학습 기록으로 정리하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `검토 상태: ${implementationResultReviewDecision}`,
    `검토 상태: ${implementationResultReviewSummary}`,
    `검토 상태 요약: ${implementationResultReviewDecisionSummary}`,
    `다음 행동: ${implementationResultReviewNextAction}`,
    `근거 게이트: ${implementationResultEvidenceReady ? "통과" : "차단"}`,
    `근거 차단 사유: ${implementationResultEvidenceBlockerSummary}`,
    `근거 다음 행동: ${implementationResultEvidenceNextStep}`,
    `ACCEPT_REVIEW 가드: ${implementationResultAcceptGuardSummary}`,
    `구현 결과 근거: ${normalizedImplementationResultEvidence || "비어 있음"}`,
    `근거 준비도: ${implementationResultEvidenceSummary}`,
    "부족한 근거:",
    ...(implementationResultEvidenceMissingLabels.length > 0
      ? implementationResultEvidenceMissingLabels.map((item) => `- ${item}`)
      : ["- 없음"]),
    `확인한 검토 기준: ${implementationResultReviewCompletedLabels.length > 0 ? implementationResultReviewCompletedLabels.join(", ") : "없음"}`,
    "남은 검토 기준:",
    ...(implementationResultReviewMissingLabels.length > 0
      ? implementationResultReviewMissingLabels.map((item) => `- ${item}`)
      : ["- 없음"]),
    "전제: 이 기록은 코드를 외우는 개발 일지가 아니라, 바이브코딩 학습자가 AI 결과를 어떤 목적, 역할, 검증 기준으로 받아들였는지 남기는 학습 증거입니다.",
    "요구: 1) 오늘 검토 상태 2) 받아들인 근거 3) 다시 시킬 수정 4) 다음 검증 5) 다음 세션 질문을 한국어로 짧게 정리하세요."
  ].join("\n");
  const implementationResultNextActionPrompt = [
    "다음 AI 구현 결과 검토 상태에 맞춰 학습자가 검토 후 다듬어 실행할 다음 행동을 작성하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `검토 상태 요약: ${implementationResultReviewDecisionSummary}`,
    `다음 행동: ${implementationResultReviewNextAction}`,
    `구현 결과 근거: ${normalizedImplementationResultEvidence || "비어 있음. AI가 바꾼 파일, 실행 명령, 실패 로그, 직접 본 화면을 먼저 적으세요."}`,
    `근거 준비도: ${implementationResultEvidenceSummary}`,
    `근거 게이트: ${implementationResultEvidenceReady ? "통과" : "차단"}`,
    `근거 차단 사유: ${implementationResultEvidenceBlockerSummary}`,
    `근거 다음 행동: ${implementationResultEvidenceNextStep}`,
    `ACCEPT_REVIEW 가드: ${implementationResultAcceptGuardSummary}`,
    "부족한 근거:",
    ...(implementationResultEvidenceMissingLabels.length > 0
      ? implementationResultEvidenceMissingLabels.map((item) => `- ${item}`)
      : ["- 없음"]),
    `확인한 검토 기준: ${implementationResultReviewCompletedLabels.length > 0 ? implementationResultReviewCompletedLabels.join(", ") : "없음"}`,
    "남은 검토 기준:",
    ...(implementationResultReviewMissingLabels.length > 0
      ? implementationResultReviewMissingLabels.map((item) => `- ${item}`)
      : ["- 없음"]),
    "전제: 학습자는 전문 개발자가 아니라 바이브코딩 개발자입니다. 문법 강의가 아니라 AI에게 무엇을 멈추게 하고, 무엇을 수정시키고, 무엇을 다음 작은 개선으로 보낼지 판단해야 합니다.",
    !implementationResultEvidenceReady
      ? "요구: 구현 검토 상태 후보를 만들거나 다음 기능으로 넘어가지 말고, 근거 보강 프롬프트로 변경 파일, 실행 명령, 실패/위험, 직접 화면 확인을 먼저 수집하세요."
      : implementationResultReviewDecision === "ACCEPT_REVIEW 검토 후보"
      ? "요구: 현재 구현을 ACCEPT_REVIEW로도 확정하지 말고, 학습자가 근거와 검증 기록을 직접 확인한 뒤 검토할 다음 작은 vertical slice 후보 1개만 제안하세요. 새 소스를 더 내장하거나 전체 앱 재작성으로 확장하지 마세요."
      : implementationResultReviewDecision === "REVISE 검토"
        ? "요구: 다음 기능으로 넘어가지 말고, 남은 검토 기준만 첫 vertical slice 안에서 고치는 재작업 지시문을 작성하세요."
        : "요구: 아직 구현을 진행하지 말고, 남은 검토 기준을 채우기 위한 질문과 확인할 RepoTutor 리포트를 먼저 작성하세요.",
    "출력: 1) 지금 검토 상태 2) 학습자가 검토 후 다듬어 보낼 AI 프롬프트 3) 확인할 리포트/명령 4) 사람이 볼 화면/동작 5) 다음 세션 질문."
  ].join("\n");
  const implementationResultRevisionPrompt = [
    "방금 AI가 만든 첫 vertical slice 구현 결과를 아래 누락 기준으로 다시 수정하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `현재 검토 상태: ${implementationResultReviewSummary}`,
    `구현 결과 근거: ${normalizedImplementationResultEvidence || "비어 있음. 재작업 전 AI가 실제로 바꾼 파일과 검증 결과를 먼저 확인하세요."}`,
    `근거 준비도: ${implementationResultEvidenceSummary}`,
    "누락 기준:",
    ...(implementationResultReviewMissingLabels.length > 0
      ? implementationResultReviewMissingLabels.map((item) => `- ${item}`)
      : ["- 없음: 현재 결과는 ACCEPT_REVIEW 검토 후보입니다. 그래도 실행/테스트 증거와 다음 작은 개선만 짧게 제안하세요."]),
    "전제: 학습자는 전문 개발자가 아니라 바이브코딩 개발자입니다. 코드 줄별 설명보다 무엇을 고쳐야 하는지, 어떤 검증을 다시 해야 하는지, 어떤 용어를 이해해야 하는지가 필요합니다.",
    "요구: REVISE 또는 BLOCK이면 수정 범위를 첫 vertical slice 안으로 제한하고, 변경할 파일/역할, 수정 프롬프트, 재검증 명령, 사람이 확인할 화면/동작을 제시하세요.",
    "출력: 1) 검토 상태 2) 수정 프롬프트 3) 재검증 명령 4) 사람이 볼 확인 항목 5) 학습자가 이해할 용어."
  ].join("\n");
  const implementationHandoffPrompt = [
    "다음 RepoTutor 세션 산출물을 근거로 비슷한 앱의 첫 vertical slice 구현 인계를 작성하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `학습자 목표: ${normalizedLearnerBrief || "내 목표/PRD/이슈/AI 프롬프트가 비어 있음. 먼저 목표를 3문장으로 확인 질문하세요."}`,
    `인계 준비도: ${implementationHandoffReadinessSummary}`,
    "핵심 리포트:",
    ...implementationHandoffReports.map((item) => `- ${item.label}: ${item.path}`),
    "전제: AI는 일반 개발지식을 이미 알고 있으므로 원본 소스를 영구 내장 지식처럼 학습하지 말고, 이 세션의 목적/책임/검증 근거만 사용하세요.",
    "학습자 역할: 전문 개발자가 아니라 바이브코딩 개발자입니다. 문법 강의보다 목적, 아키텍처 이유, 용어, 책임 경계, 수락 기준, 검증 질문을 우선하세요.",
    "범위: 전체 앱 재작성이나 대규모 리팩토링을 제안하지 말고 첫 vertical slice 하나만 구현 가능한 크기로 자르세요.",
    "출력: 1) 첫 vertical slice 2) 파일/역할 지도 3) AI에게 보낼 구현 프롬프트 4) 수락 기준 5) 검증 명령과 사람이 직접 볼 확인 항목 6) 다음 질문."
  ].join("\n");
  const preservedArtifactCount = sourcePrune?.preservedArtifacts?.filter((artifact) => artifact.present).length ?? 0;
  const preservedArtifactTotal = sourcePrune?.preservedArtifacts?.length ?? 0;
  const retainedLearningArtifacts = sourcePrune?.apply?.retainedLearningArtifacts ?? sourcePrune?.preservedEvidenceBundle ?? [];
  const retainedLearningArtifactCount = retainedLearningArtifacts.filter((artifact) => artifact.present).length;
  const retainedLearningArtifactSummary = retainedLearningArtifacts.length > 0
    ? `${retainedLearningArtifactCount}/${retainedLearningArtifacts.length}`
    : "확인 전";
  const retainedLearningArtifactPreview = retainedLearningArtifacts.slice(0, 6);
  const learnerCleanupApplyWhen = sourcePrune?.learnerCleanupDecision?.applyWhen ?? [];
  const learnerCleanupHoldWhen = sourcePrune?.learnerCleanupDecision?.holdWhen ?? [];
  const learnerCleanupApplyWhenDisplay = learnerCleanupApplyWhen.length > 0
    ? learnerCleanupApplyWhen.map(cleanupDecisionText)
    : ["세션 검증, 검증 기록, 보존 증거 묶음을 먼저 확인합니다."];
  const learnerCleanupHoldWhenDisplay = learnerCleanupHoldWhen.length > 0
    ? learnerCleanupHoldWhen.map(cleanupDecisionText)
    : ["아키텍처 이유, 역할 경계, 검증 기준이 불명확하면 생성된 세션 source/ 스냅샷 정리를 보류합니다."];
  const learnerCleanupApplyWhenSummary = learnerCleanupApplyWhenDisplay.join(" / ");
  const learnerCleanupHoldWhenSummary = learnerCleanupHoldWhenDisplay.join(" / ");
  const sourceKnowledgePolicy = sourcePrune?.apply?.sourceKnowledgePolicy ?? sourcePrune?.sourceKnowledgePolicy;
  const sourceKnowledgePolicyLabel = sourcePrune?.apply?.sourceKnowledgePolicy
    ? "정리 기록에 생성된 세션 source/ 스냅샷은 임시 프로젝트 근거이며 내장 AI 지식이 아니라고 남았습니다."
    : sourceKnowledgePolicy
      ? "정리 계획에 생성된 세션 source/ 스냅샷은 임시 프로젝트 근거이며 내장 AI 지식이 아니라고 남았습니다."
    : sourcePrune?.checks?.preservedEvidenceBundleOk
      ? "보존 증거 묶음, 세션 검증, 검증 기록, 현재 학습 목표 확인이 준비되어 생성된 세션 source/ 스냅샷은 장기 앱 지식이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인과 DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤의 정리 검토 후보입니다."
      : "보존 증거 묶음이 준비되기 전까지 생성된 세션 source/ 스냅샷 정리를 보류합니다.";
  const sourceAbsorptionVerdict = !sourcePrune
    ? "세션 선택 후 판단"
    : sourcePrune.sourcePruned
      ? "흡수 확인됨 · 세션 스냅샷 정리됨"
      : sourcePrune.applyReady
        ? "현재 목표 기준 흡수/검증 확인됨"
        : "흡수 확인 필요 · 추가 조사/검증 필요";
  const sourceAbsorptionEvidence = !sourcePrune
    ? "세션 source/ 상태를 확인하면 흡수 기록과 보존 기준을 함께 보여줍니다."
    : sourcePrune.applyReady || sourcePrune.sourcePruned
      ? "소스 흡수 기록, 보존 증거 묶음, 세션 검증, 검증 기록, 보존 판단 산출물이 남아 있어 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 학습자 명시 확인과 DELETE-SOURCE-SNAPSHOT 토큰 전 정리 검토 후보를 판단할 수 있습니다."
      : "차단 항목을 먼저 해결해야 현재 목표 기준 흡수 확인과 조사 보류 판단을 신뢰할 수 있습니다.";
  const sourceAbsorptionNextAction = !sourcePrune
    ? "상태 확인으로 흡수 산출물과 보존 게이트를 먼저 불러오세요."
    : sourcePrune.sourcePruned
      ? "생성된 세션 source/ 스냅샷이 정리된 뒤에는 보존된 학습 산출물과 SOURCE-PRUNED 기록으로 복습하세요."
      : sourcePrune.applyReady
        ? "소스 보존 판단과 dry-run plan을 검토하고, 보존 증거 묶음, 세션 검증, 검증 기록이 남았으며 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 경우에만 DELETE-SOURCE-SNAPSHOT 확인 토큰 입력을 검토하세요. READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다."
        : sourcePrune.blockers.some((blocker) => blocker.includes("session-verification"))
          ? "세션 검증 리포트를 먼저 열어 실패한 근거 링크, HTML export, evidence index를 복구하세요."
          : sourcePrune.blockers.some((blocker) => blocker.includes("missing-preserved-artifact"))
            ? "소스 흡수 기록과 보존 산출물을 다시 생성한 뒤 정리 판단을 재확인하세요."
            : "차단 항목을 해소한 뒤 상태 확인을 다시 실행하세요.";
  const sourceAbsorptionActionTarget = !sourcePrune
    ? { label: "상태 확인", tab: "소스 보존", target: "source-retention-guide" }
    : sourcePrune.sourcePruned || sourcePrune.applyReady
      ? { label: "소스 보존 판단 열기", tab: "소스 보존", target: "source-retention-guide" }
      : sourcePrune.blockers.some((blocker) => blocker.includes("session-verification"))
        ? { label: "세션 검증 열기", tab: "검증", target: "verification" }
        : sourcePrune.blockers.some((blocker) => blocker.includes("missing-preserved-artifact"))
          ? { label: "소스 흡수 기록 열기", tab: "소스 흡수", target: "source-absorption-ledger" }
          : { label: "소스 보존 판단 열기", tab: "소스 보존", target: "source-retention-guide" };
  const sourceRetentionRecommendation = !sourcePrune
    ? "생성된 세션 source/ 스냅샷 보존 상태를 확인합니다."
    : sourcePrune.sourcePruned
      ? "이미 정리됨: 생성된 세션 source/ 스냅샷은 정리됐고, 보존된 학습 산출물과 정리 기록으로 복습할 수 있습니다."
      : sourcePrune.applyReady
        ? "정리 검토 후보: 보존 증거 묶음, 흡수 산출물, 세션 검증, 검증 기록이 준비됐습니다. 학습자가 현재 학습 목표에서 소스 링크가 더 이상 열리지 않아도 된다고 명시 확인하고 DELETE-SOURCE-SNAPSHOT 확인 토큰을 입력한 뒤에만 스냅샷 정리를 검토하세요. READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다."
        : `정리 보류: ${sourcePrune.blockers.length > 0 ? `${sourcePrune.blockers.length}개 차단 항목` : "차단 항목"}을 해결해야 합니다. 생성된 세션 source/ 스냅샷은 차단 항목이 해소될 때까지 보존하세요.`;
  const sourceRetentionStatusLabel = !sourcePrune
    ? "확인 전"
    : sourcePrune.sourcePruned
      ? "세션 스냅샷 정리됨"
      : sourcePrune.applyReady
        ? "정리 검토 후보 · 토큰 전 보존"
        : "보류 · 보존";
  const sourceRetentionDecisionPrompt = [
    "다음 RepoTutor 세션의 생성된 세션 source/ 스냅샷 보존/정리 판단을 검토하세요.",
    `세션: ${current?.path ?? "세션 미선택"}`,
    `세션 스냅샷 상태: ${sourcePrune?.sourcePruned ? "정리됨" : sourcePrune?.sourcePresent ? "있음" : "확인 전"}`,
    `흡수 산출물: ${preservedArtifactTotal > 0 ? `${preservedArtifactCount}/${preservedArtifactTotal}` : "확인 전"}`,
    `보존 증거 묶음: ${retainedLearningArtifactSummary}`,
    `현재 목표 조사 판단: ${sourceAbsorptionVerdict}`,
    `검증/기록 기준: ${sourcePrune?.checks?.sessionVerificationOk ? "세션 검증 PASS · 검증 기록 확인" : "세션 검증과 검증 기록 확인 필요"}`,
    `정리 검토 조건: ${learnerCleanupApplyWhenSummary}`,
    `정리 보류 조건: ${learnerCleanupHoldWhenSummary}`,
    `차단 항목: ${sourcePrune?.blockers.length ? sourcePrune.blockers.join(", ") : "없음"}`,
    `권장 조치: ${sourceRetentionRecommendation}`,
    "전제: AI는 일반 개발지식을 이미 알고 있으므로 사용자 원본 소스는 영구 내장 지식이나 정리 대상이 아니고, 생성된 세션 source/ 스냅샷은 프로젝트별 임시 근거입니다.",
    "정리 전 확인: markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 모두 필요합니다.",
    "확인 토큰 경계: DELETE-SOURCE-SNAPSHOT 확인 토큰은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 명시 확인했다는 뜻입니다.",
    "검토 상태: READY_REVIEW / HOLD / PRUNED 중 하나로 답하세요. READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다. 정리 검토 후보여도 원본이 아니라 생성된 세션 source/ 스냅샷만 대상으로 하세요."
  ].join("\n");

  useEffect(() => {
    void refreshSessions({ autoResumeLatest: true });
  }, []);

  async function startStudy() {
    setRunning(true);
    setLog((items) => [`분석 시작: ${source} · Codex SDK 필수 AI 경로`, ...items]);
    try {
      const result = await invoke<StudyResponse>("study_source", { source, mode, level, enableCodex: true, learnerBriefText });
      setCurrent(result);
      setSourcePrune(null);
      setImplementationResultReviewState({});
      setImplementationResultEvidenceText("");
      setActiveTab(vibeCodingStartTab);
      setSelectedTarget(vibeCodingStartTarget);
      setLog((items) => [`학습 설계 산출물 생성됨: ${result.html}`, `첫 화면: 바이브코딩 시작 가이드`, ...items]);
      await refreshSessions();
      await refreshSourceRetention(result.path);
    } catch (error) {
      setLog((items) => [`오류: ${String(error)}`, ...items]);
    } finally {
      setRunning(false);
    }
  }

  async function refreshSessions(options: { autoResumeLatest?: boolean } = {}) {
    try {
      const result = await invoke<SessionRow[]>("list_sessions");
      setSessions(result);
      if (options.autoResumeLatest && !didAutoResumeSession.current && result.length > 0) {
        didAutoResumeSession.current = true;
        void selectSession(result[0]);
      }
    } catch (error) {
      setLog((items) => [`세션 목록 오류: ${String(error)}`, ...items]);
    }
  }

  async function refreshSourceRetention(sessionPath = current?.path) {
    if (!sessionPath) return;
    setPruneRunning(true);
    try {
      const result = await invoke<SourcePruneResponse>("source_prune_plan", { sessionPath });
      setSourcePrune(result);
      const status = result.sourcePruned ? "정리됨" : result.applyReady ? "정리 검토 후보" : "보류";
      setLog((items) => [`소스 보존 상태: ${status} · 생성된 세션 source/ 스냅샷은 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 뒤에만 정리 검토`, ...items]);
    } catch (error) {
      setLog((items) => [`소스 보존 상태 오류: ${String(error)}`, ...items]);
    } finally {
      setPruneRunning(false);
    }
  }

  async function applySourceRetentionCleanup() {
    if (!current || !sourcePrune?.applyReady) return;
    const confirm = window.prompt("정리 전 markdown/source-prune-plan.md dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록을 확인했고, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인한 경우에만 생성된 세션 source/ 스냅샷을 정리합니다. 원본 소스는 삭제하지 않습니다. DELETE-SOURCE-SNAPSHOT은 READY_REVIEW가 만든 최종 ACCEPT, 배포, 삭제 권한이 아니라 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 마지막으로 명시 확인했다는 뜻입니다. 계속하려면 DELETE-SOURCE-SNAPSHOT을 입력하세요.");
    if (confirm !== "DELETE-SOURCE-SNAPSHOT") {
      setLog((items) => ["소스 정리 취소: DELETE-SOURCE-SNAPSHOT 확인 토큰이 일치하지 않아 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 학습자 명시 확인이 완료되지 않았습니다.", ...items]);
      return;
    }
    setPruneRunning(true);
    try {
      const result = await invoke<SourcePruneResponse>("apply_source_prune", { sessionPath: current.path, confirm });
      setSourcePrune(result);
      setLog((items) => [`생성된 세션 source/ 스냅샷 정리 적용됨(source 링크 정리 명시 확인 및 DELETE-SOURCE-SNAPSHOT 토큰 후): ${result.apply?.removedFiles ?? 0}개 파일, ${formatBytes(result.apply?.removedBytes ?? 0)}`, ...items]);
      await refreshSourceRetention(current.path);
    } catch (error) {
      setLog((items) => [`소스 정리 오류: ${String(error)}`, ...items]);
    } finally {
      setPruneRunning(false);
    }
  }

  async function loadCurrentQuiz() {
    if (!current) return;
    try {
      const result = await invoke<QuizPayload>("load_quiz", { sessionPath: current.path });
      setQuiz(result);
      setAnswers({});
      setAttempt(null);
      setShowOnlyMissingQuizQuestions(false);
      setActiveTab("퀴즈");
      setLog((items) => [`퀴즈 로드: ${result.totalQuestions}문제`, ...items]);
    } catch (error) {
      setLog((items) => [`퀴즈 로드 오류: ${String(error)}`, ...items]);
    }
  }

  async function submitCurrentQuiz() {
    if (!current || !quiz) return;
    if (Object.keys(answers).length !== quiz.questions.length) {
      setLog((items) => ["퀴즈 제출 전 모든 문제를 선택해야 합니다.", ...items]);
      return;
    }
    try {
      const result = await invoke<AttemptResponse>("submit_quiz", { sessionPath: current.path, answers });
      setAttempt(result);
      const learningRecordLog = result.learningRecord
        ? `학습기록 저장: ${result.learningRecord}`
        : "학습기록 저장 없음: learning-records에 남길 증거가 없습니다.";
      const reviewLog = result.wrong > 0
        ? `AI 지시 복습 필요: 오답 ${result.wrong}개를 목적, 책임, 검증 기준으로 다시 설명하세요. ${result.reviewGuidance ?? "오답노트의 선택지 복습과 learning-record를 열어 AI repair prompt로 다시 설명하세요."}`
        : "AI 지시 복습 근거 확인: 학습기록에서 통과 근거를 확인하세요.";
      const artifactLog = `복습 산출물 준비: HTML ${result.wrongNotesHtml ?? result.wrongNotes}, Markdown ${result.wrongNotesMarkdown ?? "없음"}`;
      setLog((items) => [reviewLog, artifactLog, learningRecordLog, `퀴즈 제출 결과 기록됨: ${result.score}점, 오답 ${result.wrong}개`, ...items]);
      await refreshSessions();
    } catch (error) {
      setLog((items) => [`퀴즈 제출 오류: ${String(error)}`, ...items]);
    }
  }

  function resetQuizAnswers() {
    setAnswers({});
    setAttempt(null);
    setShowOnlyMissingQuizQuestions(false);
    setLog((items) => ["퀴즈 답변 초기화: AI 지시 맥락 판단을 다시 시작합니다.", ...items]);
  }

  function addLearnerBriefScaffold() {
    setLearnerBriefText((currentText) => {
      const trimmed = currentText.trim();
      if (!trimmed) return learnerBriefScaffold;
      if (trimmed.includes("내 목표:") && trimmed.includes("검증 기준:")) return currentText;
      return `${trimmed}\n\n${learnerBriefScaffold}`;
    });
    setLog((items) => ["브리프 예시 추가: 목적, 구조, AI 지시, 검증 기준을 보강합니다.", ...items]);
  }

  function prependLogOnce(message: string) {
    setLog((items) => items[0] === message ? items : [message, ...items]);
  }

  async function copyTextToClipboard(text: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "true");
    fallback.style.position = "fixed";
    fallback.style.left = "-9999px";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    document.body.removeChild(fallback);
  }

  async function copyLearnerPromptDraft() {
    try {
      await copyTextToClipboard(learnerPromptDraft);
      prependLogOnce("AI 구현 지시문 클립보드에 초안 저장됨: 전송 전 내 목표, 소스 근거, 수락 기준, 검증 기준에 맞게 검토 후 다듬을 AI 채팅 초안입니다.");
    } catch (error) {
      prependLogOnce(`AI 구현 지시문 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyAiResponseRevisionPrompt() {
    try {
      await copyTextToClipboard(aiResponseRevisionPrompt);
      prependLogOnce("AI 응답 보강 프롬프트 클립보드에 초안 저장됨: 전송 전 미체크 기준과 검증 기준을 검토한 뒤 다듬을 보강 요청 초안입니다.");
    } catch (error) {
      prependLogOnce(`AI 응답 보강 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyImplementationHandoffPrompt() {
    try {
      await copyTextToClipboard(implementationHandoffPrompt);
      prependLogOnce("AI 구현 인계 프롬프트 클립보드에 초안 저장됨: 전송 전 세션 근거, 내 목표, 수락 기준, 검증 기준에 맞게 첫 vertical slice 요청 후보를 다듬으세요.");
    } catch (error) {
      prependLogOnce(`AI 구현 인계 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyImplementationHandoffRepairPrompt() {
    try {
      await copyTextToClipboard(implementationHandoffRepairPrompt);
      prependLogOnce("AI 구현 인계 맥락 보강 프롬프트 클립보드에 초안 저장됨: 전송 전 부족한 준비도 항목을 검토해 AI 질문 후보로 바꿀 수 있습니다.");
    } catch (error) {
      prependLogOnce(`AI 구현 인계 맥락 보강 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyImplementationResultReviewPrompt() {
    try {
      await copyTextToClipboard(implementationResultReviewPrompt);
      prependLogOnce("AI 구현 결과 검토 프롬프트 클립보드에 초안 저장됨: 전송 전 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 확인한 뒤 ACCEPT_REVIEW / REVISE / BLOCK 검토 상태 후보를 만드세요.");
    } catch (error) {
      prependLogOnce(`AI 구현 결과 검토 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyImplementationResultEvidenceRepairPrompt() {
    try {
      await copyTextToClipboard(implementationResultEvidenceRepairPrompt);
      prependLogOnce("AI 구현 결과 근거 보강 프롬프트 클립보드에 초안 저장됨: 전송 전 부족한 증거와 검증 기준만 먼저 수집할 AI 질문 후보로 다듬으세요.");
    } catch (error) {
      prependLogOnce(`AI 구현 결과 근거 보강 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyImplementationResultRevisionPrompt() {
    try {
      await copyTextToClipboard(implementationResultRevisionPrompt);
      prependLogOnce("AI 구현 결과 재작업 프롬프트 클립보드에 초안 저장됨: 전송 전 누락 검토 기준만 REVISE/BLOCK 수정 요청 후보로 바꾸세요.");
    } catch (error) {
      prependLogOnce(`AI 구현 결과 재작업 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyImplementationResultReviewRecordPrompt() {
    try {
      await copyTextToClipboard(implementationResultReviewRecordPrompt);
      prependLogOnce("AI 구현 결과 검토 기록 프롬프트 클립보드에 초안 저장됨: 전송 전 검토 상태 근거와 남은 검토 기준을 확인한 뒤 학습 기록 후보로 남기세요.");
    } catch (error) {
      prependLogOnce(`AI 구현 결과 검토 기록 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copyImplementationResultNextActionPrompt() {
    try {
      await copyTextToClipboard(implementationResultNextActionPrompt);
      prependLogOnce("AI 구현 결과 다음 행동 프롬프트 클립보드에 초안 저장됨: 전송 전 현재 검토 상태 근거를 확인하고 멈춤, 수정, 다음 개선 중 하나의 지시 후보로 검토하세요.");
    } catch (error) {
      prependLogOnce(`AI 구현 결과 다음 행동 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  async function copySourceRetentionDecisionPrompt() {
    try {
      await copyTextToClipboard(sourceRetentionDecisionPrompt);
      prependLogOnce("소스 정리 판단 프롬프트 클립보드에 초안 저장됨: 전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토한 뒤 AI에게 재검토시킬 수 있습니다.");
    } catch (error) {
      prependLogOnce(`소스 정리 판단 프롬프트 클립보드 저장 오류: ${String(error)}`);
    }
  }

  function toggleAiResponseReview(label: string) {
    const nextChecked = !aiResponseReviewState[label];
    const nextState = { ...aiResponseReviewState, [label]: nextChecked };
    const doneCount = learnerAiResponseReviewChecks.filter((item) => nextState[item.label]).length;
    const status = nextChecked ? "체크됨" : "해제";
    const message = `AI 응답 검토 ${status}: ${label} (${doneCount}/${learnerAiResponseReviewChecks.length})`;
    setAiResponseReviewState(nextState);
    prependLogOnce(message);
  }

  function resetAiResponseReview() {
    setAiResponseReviewState({});
    prependLogOnce("AI 응답 검토 초기화: 목적, 역할, 검증 기준을 다시 확인합니다.");
  }

  function toggleImplementationResultReview(label: string) {
    const nextChecked = !implementationResultReviewState[label];
    const nextState = { ...implementationResultReviewState, [label]: nextChecked };
    const doneCount = implementationResultReviewChecks.filter((item) => nextState[item.label]).length;
    const status = nextChecked ? "체크됨" : "해제";
    setImplementationResultReviewState(nextState);
    prependLogOnce(`AI 구현 결과 검토 ${status}: ${label} (${doneCount}/${implementationResultReviewChecks.length})`);
  }

  function resetImplementationResultReview() {
    setImplementationResultReviewState({});
    prependLogOnce("AI 구현 결과 검토 초기화: 목적, 범위, 역할, 검증 기준을 다시 확인합니다.");
  }

  function openTargetInApp(target: string, path: string) {
    setSelectedTarget(target);
    setActiveTab("HTML 미리보기");
    setLog((items) => [`앱 미리보기 타깃: ${target} -> ${path}`, ...items]);
  }

  function openReportTab(tab: string, target: string) {
    setSelectedTarget(target);
    setActiveTab(tab);
    setLog((items) => [`학습 타깃 열기: ${target}`, ...items]);
  }

  async function selectSession(session: SessionRow) {
    setCurrent({ sessionId: session.sessionId, status: "complete", path: session.path, html: `${session.path}/html/index.html`, quizQuestions: 0 });
    setQuiz(null);
    setAnswers({});
    setAttempt(null);
    setSourcePrune(null);
    setImplementationResultReviewState({});
    setImplementationResultEvidenceText("");
    setActiveTab(vibeCodingStartTab);
    setSelectedTarget(vibeCodingStartTarget);
    try {
      const resumed = await invoke<StudyResponse>("resume_session", { sessionPath: session.path });
      setCurrent(resumed);
      setLog((items) => [`세션 재개됨: ${resumed.html} · 검증 ${resumed.verificationOk ? "PASS" : "확인 필요"}`, ...items]);
      await refreshSourceRetention(resumed.path);
    } catch (error) {
      setLog((items) => [`세션 재개 오류: ${String(error)}`, ...items]);
      await refreshSourceRetention(session.path);
    }
  }

  function focusFirstMissingQuizQuestion() {
    const firstMissing = document.querySelector<HTMLElement>('.quiz-item[data-answer-state="missing"]');
    if (!firstMissing) return;
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    firstMissing.querySelector<HTMLButtonElement>(".choice-grid button")?.focus({ preventScroll: true });
    setLog((items) => [`첫 미응답 AI 지시 판단으로 이동: ${quizMissingCount}개 남음`, ...items]);
  }

  function focusQuizQuestionByNumber(questionNumber: number) {
    const targetQuestion = document.querySelector<HTMLElement>(`.quiz-item[data-question-number="${questionNumber}"]`);
    if (!targetQuestion) return;
    targetQuestion.scrollIntoView({ behavior: "smooth", block: "center" });
    targetQuestion.querySelector<HTMLButtonElement>(".choice-grid button")?.focus({ preventScroll: true });
    setLog((items) => [`미응답 문항 ${questionNumber}번으로 이동`, ...items]);
  }

  return (
    <div className="app-shell">
      <SessionSidebar
        currentPath={current?.path ?? null}
        filteredSessions={filteredSessions}
        onRefreshSessions={() => { void refreshSessions(); }}
        onSearchChange={setSessionSearch}
        onSelectSession={(session) => { void selectSession(session); }}
        search={sessionSearch}
        totalSessions={sessions.length}
      />

      <main className="workspace">
        <MissionBrief modeLabel={modeLabels[mode]} reportCount={CORE_LEARNING_REPORT_TARGETS.length} sessionCount={sessions.length} />

        <section className="command-band">
          <div className="source-input">
            <label htmlFor="source-target-input">GitHub URL / 로컬 폴더 / ZIP / SKILL.md</label>
            <input id="source-target-input" value={source} onChange={(event) => setSource(event.target.value)} />
          </div>
          <div className="learner-brief-input">
            <label htmlFor="learner-brief-textarea">내 목표 / PRD / 이슈 / AI 프롬프트</label>
            <textarea
              id="learner-brief-textarea"
              value={learnerBriefText}
              onChange={(event) => setLearnerBriefText(event.target.value)}
              placeholder="예: 이 소스처럼 학습 앱을 만들고 싶다. 첫 기능은 GitHub 소스를 분석해서 아키텍처, 용어, 프롬프트, 검증 기준을 보여주는 것이다."
            />
            <fieldset className="brief-readiness">
              <legend className="sr-only">바이브코딩 브리프 준비도</legend>
              <span className="brief-readiness-note">문법 암기보다 AI에게 줄 맥락</span>
              <span className="brief-readiness-summary" aria-live="polite">{learnerBriefReadinessSummary}</span>
              <span className="brief-readiness-next" aria-live="polite">{learnerBriefNextStep}</span>
              {learnerBriefReadinessChecks.map((item) => (
                <span key={item.label} className={item.ready ? "ready" : "missing"}>
                  {item.label}: {item.ready ? "준비됨" : "보강 필요"} · {sourceSnapshotCodePathNode(item.hint)}
                </span>
              ))}
              <button type="button" className="brief-scaffold-button" onClick={addLearnerBriefScaffold}>브리프 예시 추가</button>
            </fieldset>
            <div className="brief-prompt-draft">
              <div className="prompt-draft-header">
                <strong>AI 구현 지시문 초안</strong>
                <button type="button" className="prompt-copy-button" onClick={copyLearnerPromptDraft} title="전송 전 목표, 소스 근거, 수락 기준, 검증 기준을 검토할 AI 구현 지시문 초안을 저장합니다.">
                  <Copy size={14} />
                  AI 지시문 클립보드 저장
                </button>
              </div>
              <pre>{learnerPromptDraft}</pre>
            </div>
            <div className="ai-response-review">
              <strong>AI 응답 검토 기준</strong>
              <span className="ai-response-review-summary" aria-live="polite">{aiResponseReviewSummary}</span>
              {learnerAiResponseReviewChecks.map((item) => (
                <label key={item.label} className={aiResponseReviewState[item.label] ? "checked" : ""}>
                  <input
                    checked={Boolean(aiResponseReviewState[item.label])}
                    onChange={() => toggleAiResponseReview(item.label)}
                    type="checkbox"
                  />
                  {item.label}: {item.text}
                </label>
              ))}
              <button type="button" className="ai-response-review-reset" disabled={aiResponseReviewDoneCount === 0} onClick={resetAiResponseReview}>검토 초기화</button>
            </div>
            <div className="ai-response-revision">
              <div className="revision-prompt-header">
                <strong>AI 응답 보강 프롬프트 초안</strong>
                <button type="button" className="revision-copy-button" onClick={copyAiResponseRevisionPrompt} title="전송 전 미체크 기준과 검증 기준을 검토할 AI 응답 보강 프롬프트를 저장합니다.">
                  <Copy size={14} />
                  AI 보강문 클립보드 저장
                </button>
              </div>
              <pre>{aiResponseRevisionPrompt}</pre>
            </div>
          </div>
          <label>
            분석 모드
            <select value={mode} onChange={(event) => setMode(event.target.value as StudyMode)}>
              <option value="quick">{modeLabels.quick}</option>
              <option value="standard">{modeLabels.standard}</option>
              <option value="deep">{modeLabels.deep}</option>
            </select>
          </label>
          <label>
            학습자
            <select value={level} onChange={(event) => setLevel(event.target.value as LearnerLevel)}>
              <option value="beginner">{levelLabels.beginner}</option>
              <option value="junior">{levelLabels.junior}</option>
              <option value="senior">{levelLabels.senior}</option>
            </select>
          </label>
          <div className="ai-required-field">
            <span><KeyRound size={15} /> Codex SDK 필수 AI 엔진</span>
          </div>
          <button type="button" className="primary" onClick={startStudy} disabled={running} title="학습 분석 시작">
            {running ? <Square size={16} /> : <Play size={16} />}
            {running ? "진행 중" : "학습 시작"}
          </button>
        </section>

        <section className="status-strip">
          <div><ShieldCheck size={17} /> 읽기 전용 정적 분석</div>
          <div><FileText size={17} /> 소스는 임시 근거</div>
          <div><FileText size={17} /> JSON · Markdown · HTML</div>
          <div><ListChecks size={17} /> 퀴즈 · 오답노트</div>
          <div><StickyNote size={17} /> Codex SDK 필수 AI 학습</div>
        </section>

        <section className="source-purpose-contract" aria-label="소스 입력 목적 계약">
          {sourcePurposeContractItems.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <span>{sourceSnapshotCodePathNode(item.body)}</span>
            </article>
          ))}
        </section>

        <section className="learning-boundary-strip" aria-label="바이브코딩 학습 경계">
          {learningBoundaryItems.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </article>
          ))}
        </section>

        <section className="ai-contract-strip" aria-label="Codex SDK 인증 및 학습 계약">
          <article>
            <strong>공식 인증 경로</strong>
            <span>ChatGPT 구독 로그인 또는 API key는 로컬 Codex CLI/SDK가 처리합니다.</span>
          </article>
          <article>
            <strong>앱 보안 경계</strong>
            <span>RepoTutor는 ChatGPT 비밀번호, 토큰, API key를 입력받거나 저장하지 않습니다.</span>
          </article>
          <article>
            <strong>학습 지속성</strong>
            <span>사용량 제한이 생기면 실패 로그를 남기고 정적 리포트와 퀴즈는 계속 생성합니다.</span>
          </article>
        </section>

        <nav className="tabs">
          {tabs.map((tab) => <button type="button" key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </nav>

        <section className="content-grid">
          <article className="report-pane">
            <h1>{activeTab}</h1>
            {current ? (
              <>
                <p className="lead">세션 {current.sessionId}가 생성되었습니다. 터미널의 <code>repo-tutor open --target</code>과 같은 핵심 학습 페이지를 앱에서도 확인할 수 있습니다.</p>
                <dl className="details">
                  <div><dt>상태</dt><dd>{statusLabels[current.status] ?? current.status}</dd></div>
                  <div><dt>경로</dt><dd>{current.path}</dd></div>
                  <div><dt>HTML</dt><dd>{current.html}</dd></div>
                  <div><dt>일일 요약</dt><dd>{current.dailySummaryHtml ?? `${current.path}/html/daily-summary.html`}</dd></div>
                  <div><dt>학습 워크스페이스</dt><dd>{current.teachingWorkspaceHtml ?? `${current.path}/html/teaching-workspace.html`}</dd></div>
                  <div><dt>목표 정렬</dt><dd>{current.learnerGoalAlignmentHtml ?? `${current.path}/reference/learner-goal-alignment.html`}</dd></div>
                  <div><dt>세션 검증</dt><dd>{current.verificationOk === undefined ? "확인 필요" : current.verificationOk ? "PASS" : "FAIL"}{current.verificationCheckedRequiredArtifacts ? ` · ${current.verificationCheckedRequiredArtifacts}개 산출물 확인` : ""}</dd></div>
                  <div><dt>검증 리포트</dt><dd>{current.verificationHtml ?? current.verificationReport ?? `${current.path}/html/session-verification.html`}</dd></div>
                  <div><dt>퀴즈</dt><dd>{quizSummaryText(current, selectedSession)}</dd></div>
                </dl>
                <section className="implementation-handoff" aria-label="AI 구현 인계 프롬프트">
                  <div>
                    <h2>AI 구현 인계 프롬프트</h2>
                    <p>세션 산출물을 AI에게 넘겨 첫 vertical slice, 역할 경계, 수락 기준, 검증 계획으로 바꿉니다.</p>
                  </div>
                  <button type="button" onClick={copyImplementationHandoffPrompt} title="전송 전 세션 근거, 목표, 수락 기준, 검증 기준을 검토할 구현 인계 프롬프트를 저장합니다.">
                    <Copy size={15} />
                    구현 인계 클립보드 저장
                  </button>
                  <div className="implementation-handoff-readiness">
                    <span className="handoff-readiness-summary" aria-live="polite">{implementationHandoffReadinessSummary}</span>
                    {implementationHandoffReadinessChecks.map((item) => (
                      <span key={item.label} className={item.ready ? "ready" : "missing"}>
                        {item.label}: {item.ready ? "준비됨" : "보강 필요"} · {sourceSnapshotCodePathNode(item.hint)}
                      </span>
                    ))}
                  </div>
                  <div className="implementation-handoff-repair">
                    <div>
                      <strong>맥락 보강 프롬프트</strong>
                      <span>준비도에서 부족한 항목을 구현 전 질문과 브리프 보강문으로 바꿉니다.</span>
                    </div>
                    <button type="button" onClick={copyImplementationHandoffRepairPrompt} title="전송 전 부족한 인계 맥락을 질문 후보로 바꿀 보강 프롬프트를 저장합니다.">
                      <Copy size={15} />
                      맥락 보강 클립보드 저장
                    </button>
                    <pre>{implementationHandoffRepairPrompt}</pre>
                  </div>
                  <div className="implementation-result-review">
                    <div>
                      <strong>구현 결과 검토 프롬프트</strong>
                      <span>AI가 만든 첫 구현 결과를 목적, 범위, 역할, 검증 기준으로 검토 상태 후보로 확인합니다.</span>
                    </div>
                    <button type="button" onClick={copyImplementationResultReviewPrompt} title="전송 전 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 검토할 결과 검토 프롬프트를 저장합니다.">
                      <Copy size={15} />
                      결과 검토 클립보드 저장
                    </button>
                    <div className="implementation-result-evidence">
                      <label htmlFor="implementation-result-evidence-textarea">
                        <strong>구현 결과 근거 메모</strong>
                        <span>AI가 바꾼 파일, 실행 명령, 실패 로그, 직접 본 화면을 적습니다.</span>
                      </label>
                      <ul className="implementation-result-evidence-rules" aria-label="AI 구현 결과 근거 작성 규칙">
                        {implementationResultEvidenceWritingRules.map((rule) => (
                          <li key={rule}>{rule}</li>
                        ))}
                      </ul>
                      <textarea
                        id="implementation-result-evidence-textarea"
                        onChange={(event) => setImplementationResultEvidenceText(event.target.value)}
                        placeholder="예: 변경 파일 apps/..., 실행 명령 pnpm build PASS, 화면에서 클립보드 저장 확인, 남은 실패 로그 없음"
                        rows={4}
                        value={implementationResultEvidenceText}
                      />
                      <div className="implementation-result-evidence-readiness">
                        <span className="evidence-readiness-summary" aria-live="polite">{implementationResultEvidenceSummary}</span>
                        {implementationResultEvidenceChecks.map((item) => (
                          <span key={item.label} className={item.ready ? "ready" : "missing"}>
                            {item.label}: {item.ready ? "준비됨" : "보강 필요"} · {sourceSnapshotCodePathNode(item.hint)}
                          </span>
                        ))}
                      </div>
                      <div className="implementation-result-evidence-repair">
                        <div>
                          <strong>근거 보강 프롬프트</strong>
                          <span>부족한 증거와 검증 기준을 검토 상태 후보 전에 AI에게 수집시키는 요청문으로 바꿉니다.</span>
                        </div>
                        <button type="button" onClick={copyImplementationResultEvidenceRepairPrompt} title="전송 전 부족한 증거와 검증 기준만 수집할 근거 보강 프롬프트를 저장합니다.">
                          <Copy size={15} />
                          근거 보강 클립보드 저장
                        </button>
                        <pre>{implementationResultEvidenceRepairPrompt}</pre>
                      </div>
                    </div>
                    <div className="implementation-result-checklist">
                      <span className="result-review-summary" aria-live="polite">{implementationResultReviewSummary}</span>
                      {implementationResultReviewChecks.map((item) => (
                        <label key={item.label} className={implementationResultReviewState[item.label] ? "checked" : ""}>
                          <input
                            checked={Boolean(implementationResultReviewState[item.label])}
                            onChange={() => toggleImplementationResultReview(item.label)}
                            type="checkbox"
                          />
                          {item.label}: {item.text}
                        </label>
                      ))}
                      <button type="button" disabled={implementationResultReviewDoneCount === 0} onClick={resetImplementationResultReview}>결과 검토 초기화</button>
                    </div>
                    <fieldset className="implementation-result-decision">
                      <legend className="sr-only">AI 구현 결과 검토 상태 요약</legend>
                      <div className={implementationResultEvidenceReady ? "implementation-result-evidence-blocker ready" : "implementation-result-evidence-blocker blocked"}>
                        <strong>{implementationResultEvidenceBlockerSummary}</strong>
                        <span>{implementationResultEvidenceNextStep}</span>
                      </div>
                      <span>
                        <strong>검토 상태</strong>
                        {implementationResultReviewDecision}
                      </span>
                      <span>
                        <strong>확인 기준</strong>
                        {implementationResultReviewDoneCount}/{implementationResultReviewChecks.length}
                      </span>
                      <span>
                        <strong>남은 기준</strong>
                        {implementationResultReviewChecks.length - implementationResultReviewDoneCount}
                      </span>
                      <span>
                        <strong>근거</strong>
                        {implementationResultEvidenceReady ? "통과" : "차단"}
                      </span>
                      <span className={implementationResultReviewDecision === "ACCEPT_REVIEW 검토 후보" ? "accept-guard ready" : "accept-guard blocked"}>
                        <strong>ACCEPT_REVIEW 가드</strong>
                        {implementationResultAcceptGuardSummary}
                      </span>
                      <span>
                        <strong>다음 행동</strong>
                        {implementationResultReviewNextAction}
                      </span>
                    </fieldset>
                    <div className="implementation-result-next-action">
                      <div>
                        <strong>결과 다음 행동 프롬프트</strong>
                        <span>현재 검토 상태에 맞춰 멈춤, 재작업, 다음 작은 개선 중 하나를 AI 지시문으로 바꿉니다.</span>
                      </div>
                      <button type="button" onClick={copyImplementationResultNextActionPrompt} title="전송 전 현재 검토 상태 근거를 확인할 다음 행동 프롬프트를 저장합니다.">
                        <Copy size={15} />
                        다음 행동 클립보드 저장
                      </button>
                      <pre>{implementationResultNextActionPrompt}</pre>
                    </div>
                    <div className="implementation-result-revision">
                      <div>
                        <strong>결과 재작업 프롬프트</strong>
                        <span>체크하지 못한 기준을 REVISE/BLOCK 수정 요청으로 바꿉니다.</span>
                      </div>
                      <button type="button" onClick={copyImplementationResultRevisionPrompt} title="전송 전 누락 검토 기준만 수정 요청으로 바꿀 재작업 프롬프트를 저장합니다.">
                        <Copy size={15} />
                        재작업 요청 클립보드 저장
                      </button>
                      <pre>{implementationResultRevisionPrompt}</pre>
                    </div>
                    <div className="implementation-result-record">
                      <div>
                        <strong>결과 검토 기록 프롬프트</strong>
                        <span>현재 검토 상태와 남은 검토 기준을 다음 학습 기록으로 남깁니다.</span>
                      </div>
                      <button type="button" onClick={copyImplementationResultReviewRecordPrompt} title="전송 전 검토 상태 근거와 남은 검토 기준을 확인할 검토 기록 프롬프트를 저장합니다.">
                        <Copy size={15} />
                        결과 기록 클립보드 저장
                      </button>
                      <pre>{implementationResultReviewRecordPrompt}</pre>
                    </div>
                    <pre>{implementationResultReviewPrompt}</pre>
                  </div>
                  <pre>{implementationHandoffPrompt}</pre>
                  <div className="implementation-handoff-links">
                    {implementationHandoffCheckpoints.map((checkpoint) => (
                      <button type="button" key={checkpoint.target} onClick={() => openReportTab(checkpoint.tab, checkpoint.target)} title={checkpoint.description}>
                        <Route size={15} />
                        <span>{checkpoint.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="retention-panel" aria-label="소스 보존 상태">
                  <div>
                    <h2>소스 보존 상태</h2>
                    <p>{sourceSnapshotCodePathNode(sourceRetentionRecommendation)}</p>
                    <p className="retention-purpose">AI는 일반 개발지식을 이미 가지고 있습니다. 생성된 세션 <code>source/</code> 스냅샷은 영구 내장 지식이 아니라 목적, 아키텍처, 용어, 프롬프트, 검증 기준을 추출하기 위한 임시 근거입니다.</p>
                  </div>
                  <dl>
                    <div><dt>상태</dt><dd>{sourceRetentionStatusLabel}</dd></div>
                    <div><dt>세션 스냅샷</dt><dd>{sourcePrune?.sourcePresent ? "있음" : sourcePrune?.sourcePruned ? "정리됨" : "없음"}</dd></div>
                    <div><dt>크기</dt><dd>{formatBytes(sourcePrune?.sourceBytes ?? 0)}</dd></div>
                    <div><dt>차단</dt><dd>{sourcePrune?.blockers.length ? sourcePrune.blockers.join(", ") : "없음"}</dd></div>
                  </dl>
                  <div className="retention-actions">
                    <button type="button" onClick={() => refreshSourceRetention()} disabled={pruneRunning} title="생성된 세션 source/ 스냅샷 보존 상태를 다시 확인합니다.">
                      <RotateCcw size={15} />
                      상태 확인
                    </button>
                    <button type="button" onClick={applySourceRetentionCleanup} disabled={pruneRunning || !sourcePrune?.applyReady} title="dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인 후 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 생성된 세션 source/ 스냅샷만 정리합니다. READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.">
                      <Trash2 size={15} />
                      토큰 확인 후 세션 스냅샷만 정리
                    </button>
                    <button type="button" onClick={copySourceRetentionDecisionPrompt} disabled={pruneRunning} title="전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토할 보존/정리 판단 프롬프트를 저장합니다.">
                      <Copy size={15} />
                      정리 판단 클립보드 저장
                    </button>
                  </div>
                  <section className="absorption-summary" aria-label="소스 흡수 요약">
                    <div>
                      <h3>소스 흡수 요약</h3>
                      <p>{sourceSnapshotCodePathNode(sourceAbsorptionEvidence)}</p>
                    </div>
                    <dl>
                      <div><dt>흡수 산출물</dt><dd>{preservedArtifactTotal > 0 ? `${preservedArtifactCount}/${preservedArtifactTotal}` : "확인 전"}</dd></div>
                      <div><dt>현재 목표 조사</dt><dd>{sourceAbsorptionVerdict}</dd></div>
                      <div><dt>검증 기준</dt><dd>{sourcePrune?.checks?.sessionVerificationOk ? "세션 검증 PASS · 검증 기록 확인" : "세션 검증/검증 기록 확인 필요"}</dd></div>
                      <div><dt>다음 행동</dt><dd>{sourceSnapshotCodePathNode(sourceAbsorptionNextAction)}</dd></div>
                    </dl>
                    <button type="button" onClick={() => sourcePrune ? openReportTab(sourceAbsorptionActionTarget.tab, sourceAbsorptionActionTarget.target) : refreshSourceRetention()} title={sourceAbsorptionNextAction}>
                      <Route size={15} />
                      {sourceAbsorptionActionTarget.label}
                    </button>
                  </section>
                  <section className="retained-learning-assets" aria-label="보존 학습 자산">
                    <div>
                      <h3>보존 학습 자산</h3>
                      <p>{sourceSnapshotCodePathNode(sourceKnowledgePolicyLabel)}</p>
                    </div>
                    <dl>
                      <div><dt>증거 묶음</dt><dd>{retainedLearningArtifactSummary}</dd></div>
                      <div><dt>정책</dt><dd>{sourceKnowledgePolicy ? "정리 정책 기록됨" : sourcePrune?.checks?.preservedEvidenceBundleOk ? "정리 전 증거 확인됨" : "확인 필요"}</dd></div>
                    </dl>
                    {retainedLearningArtifactPreview.length > 0 ? (
                      <ul>
                        {retainedLearningArtifactPreview.map((artifact) => (
                          <li key={artifact.path}>
                            <span>{artifact.present ? "PASS" : "MISSING"}</span>
                            <code>{artifact.path}</code>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="retained-learning-empty">상태 확인을 실행하면 생성된 세션 <code>source/</code> 스냅샷 대신 남겨야 할 핵심 학습 자산이 표시됩니다.</p>
                    )}
                  </section>
                  <section className="cleanup-decision-conditions" aria-label="정리 판단 조건">
                    <div>
                      <h3>정리 검토 조건</h3>
                      <ul>
                        {learnerCleanupApplyWhenDisplay.map((condition) => (
                          <li key={condition}>{sourceSnapshotCodePathNode(condition)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>정리 보류 조건</h3>
                      <ul>
                        {learnerCleanupHoldWhenDisplay.map((condition) => (
                          <li key={condition}>{sourceSnapshotCodePathNode(condition)}</li>
                        ))}
                      </ul>
                    </div>
                  </section>
                  <section className="retention-prompt-preview" aria-label="소스 정리 판단 프롬프트 미리보기">
                    <div>
                      <h3>소스 정리 판단 프롬프트 미리보기</h3>
                      <p>클립보드 저장 전에 AI에게 전달될 보존/정리 판단 맥락을 확인합니다.</p>
                    </div>
                    <pre>{sourceRetentionDecisionPrompt}</pre>
                  </section>
                  <div className="retention-checkpoints">
                    <p>정리 전 확인: 생성된 세션 <code>source/</code> 스냅샷을 보관하는 목적이 아니라, 비슷한 앱을 AI와 만들기 위한 설명과 검증 기준이 남았는지 확인합니다.</p>
                    {sourceCleanupCheckpoints.map((checkpoint) => (
                      <button type="button" key={checkpoint.target} onClick={() => openReportTab(checkpoint.tab, checkpoint.target)} title={checkpoint.description}>
                        <FileText size={15} />
                        <span>{checkpoint.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
                {activeTab === "학습 타깃" ? (
                  <section className="target-grid" aria-label="핵심 학습 리포트 타깃">
                    {reportTargets.map((target) => (
                      <article key={target.target} className="target-card">
                        <div className="target-card-title">
                          <Route size={16} />
                          <h2>{target.title}</h2>
                        </div>
                        <p>{reportTargetDescriptionNode(target.description)}</p>
                        <dl>
                          <div><dt>타깃</dt><dd>{target.target}</dd></div>
                          <div><dt>HTML</dt><dd>{target.path}</dd></div>
                          <div><dt>터미널</dt><dd>{target.command}</dd></div>
                        </dl>
                        <button type="button" onClick={() => openTargetInApp(target.target, target.path)} title={`${target.target} 리포트를 앱 안에서 미리봅니다.`}>
                          <Terminal size={15} />
                          앱에서 보기
                        </button>
                      </article>
                    ))}
                  </section>
                ) : null}
                {activeReportTarget && activeTab !== "학습 타깃" ? (
                  <section className="report-preview" aria-label={`${activeReportTarget.target} 리포트 미리보기`}>
                    <div className="report-preview-header">
                      <div>
                        <h2>{activeReportTarget.title}</h2>
                        <p>{reportTargetDescriptionNode(activeReportTarget.description)}</p>
                      </div>
                      <button type="button" onClick={() => setActiveTab("학습 타깃")}>
                        <Route size={15} />
                        타깃 목록
                      </button>
                    </div>
                    <dl className="target-meta">
                      <div><dt>터미널</dt><dd>{activeReportTarget.command}</dd></div>
                      <div><dt>HTML</dt><dd>{activeReportTarget.path}</dd></div>
                    </dl>
                    <iframe title={`${activeReportTarget.title} preview`} src={previewSrc(activeReportTarget.path)} />
                  </section>
                ) : null}
              </>
            ) : (
              <div className="empty-state">
                <BrainCircuit size={34} />
                <p className="lead">소스를 입력하면 Codex SDK와 정적 분석이 함께 목적, 구조, 용어, 프롬프트, 검증 경계를 한국어 리포트로 정리합니다.</p>
              </div>
            )}
          </article>

          <TutorPane hasCurrentSession={Boolean(current)} onLoadQuiz={loadCurrentQuiz} onSelectTab={setActiveTab} />
        </section>

        {activeTab === "퀴즈" && quiz ? (
          <QuizWorkspace
            answers={answers}
            attempt={attempt}
            attemptReviewGuidance={attemptReviewGuidance}
            attemptWrongNotesHtml={attemptWrongNotesHtml}
            attemptWrongNotesMarkdown={attemptWrongNotesMarkdown}
            onAnswer={(questionId, answer) => setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: answer }))}
            onFocusFirstMissing={focusFirstMissingQuizQuestion}
            onFocusQuestion={focusQuizQuestionByNumber}
            onOpenReportTab={openReportTab}
            onResetQuizAnswers={resetQuizAnswers}
            onSubmitQuiz={submitCurrentQuiz}
            onToggleMissingOnly={() => setShowOnlyMissingQuizQuestions((currentValue) => !currentValue)}
            quizAnsweredCount={quizAnsweredCount}
            quizMissingCount={quizMissingCount}
            quizMissingQuestionNumbers={quizMissingQuestionNumbers}
            quizMissingQuestionSummary={quizMissingQuestionSummary}
            quizQuestionVisibilitySummary={quizQuestionVisibilitySummary}
            quizReadyToSubmit={quizReadyToSubmit}
            quizTotalCount={quizTotalCount}
            showOnlyMissingQuizQuestions={showOnlyMissingQuizQuestions}
            visibleQuizQuestions={visibleQuizQuestions}
          />
        ) : null}

        <LogPanel entries={visibleLogEntries} />
      </main>
    </div>
  );
}
