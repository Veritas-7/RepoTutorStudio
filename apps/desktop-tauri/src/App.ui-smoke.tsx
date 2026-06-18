import { Window } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";

type InvokeCall = {
  command: string;
  args?: Record<string, unknown>;
};

type SmokeWindow = {
  document: Document;
  navigator: Navigator;
  HTMLElement: typeof HTMLElement;
  HTMLButtonElement: typeof HTMLButtonElement;
  HTMLInputElement: typeof HTMLInputElement;
  HTMLTextAreaElement: typeof HTMLTextAreaElement;
  Event: typeof Event;
  MouseEvent: typeof MouseEvent;
  Node: typeof Node;
  happyDOM: {
    whenAsyncComplete: () => Promise<void>;
  };
  __REPOTUTOR_STUDIO_TEST_API__?: {
    invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
    convertFileSrc: (filePath: string) => string;
  };
};

const domWindow = new Window({ url: "http://localhost:1420" }) as unknown as SmokeWindow;
const invokeCalls: InvokeCall[] = [];
const sessionPath = "/tmp/repotutor-ui-smoke/session";
const studyResponse = {
  sessionId: "ui-smoke-session",
  status: "complete",
  path: sessionPath,
  html: `${sessionPath}/html/index.html`,
  dailySummaryHtml: `${sessionPath}/html/daily-summary.html`,
  teachingWorkspaceHtml: `${sessionPath}/html/teaching-workspace.html`,
  learnerGoalAlignmentHtml: `${sessionPath}/reference/learner-goal-alignment.html`,
  verificationOk: true,
  verificationReport: `${sessionPath}/analysis/session-verification-report.json`,
  verificationMarkdown: `${sessionPath}/markdown/session-verification.md`,
  verificationHtml: `${sessionPath}/html/session-verification.html`,
  verificationCheckedRequiredArtifacts: 17,
  verificationChecks: { htmlExportOk: true, evidenceIndexOk: true },
  quizQuestions: 2
};
const sourcePruneResponse = {
  sourcePresent: true,
  sourcePruned: false,
  sourceFiles: 12,
  sourceBytes: 4096,
  applyReady: true,
  blockers: [],
  checks: {
    sessionVerificationOk: true,
    requiredArtifactsOk: true,
    htmlExportOk: true,
    evidenceIndexOk: true,
    preservedArtifactsOk: true,
    preservedEvidenceBundleOk: true
  },
  preservedArtifacts: [
    { path: `${sessionPath}/reference/source-absorption-ledger.html`, present: true, bytes: 512 },
    { path: `${sessionPath}/html/vibe-coding-prompt-pack.html`, present: true, bytes: 768 }
  ],
  preservedEvidenceBundle: [
    { path: `${sessionPath}/markdown/source-retention-guide.md`, present: true, bytes: 256 }
  ],
  sourceKnowledgePolicy: "source/ was temporary project evidence, not embedded AI development knowledge",
  learnerCleanupDecision: {
    sourcePurpose: "temporary project evidence",
    applyWhen: [
      "Session verification, verification records, and the preserved evidence bundle are available.",
      "Learner explicitly confirms source links no longer need to open for this learning goal."
    ],
    holdWhen: [
      "Architecture reason or role boundaries still require source links."
    ],
    retainedEvidence: [
      "source absorption ledger",
      "implementation brief and prompt pack"
    ]
  },
  recommendedAction: "READY_REVIEW only; keep until explicit DELETE-SOURCE-SNAPSHOT confirmation."
};
const quizPayload = {
  sessionId: studyResponse.sessionId,
  totalQuestions: 2,
  questions: [
    {
      id: "q1",
      question: "무엇을 먼저 확인해야 하나요?",
      choices: { A: "목적과 검증 기준", B: "랜덤 문법", C: "배포 권한", D: "원본 삭제" }
    },
    {
      id: "q2",
      question: "source/ 스냅샷의 역할은?",
      choices: { A: "임시 프로젝트 근거", B: "영구 AI 지식", C: "삭제 권한", D: "비밀 저장소" }
    }
  ]
};
const attemptResponse = {
  attemptId: "attempt-ui-smoke",
  score: 100,
  correct: 2,
  wrong: 0,
  wrongNotes: `${sessionPath}/html/wrong-notes.html`,
  wrongNotesHtml: `${sessionPath}/html/wrong-notes.html`,
  wrongNotesMarkdown: `${sessionPath}/markdown/wrong-notes.md`,
  learningRecord: `${sessionPath}/learning-records/0001-quiz-attempt-passed.md`,
  reviewGuidance: "learning-record를 열어 이번 퀴즈가 어떤 AI 구현 맥락 준비도를 증명했는지 확인하세요."
};

defineGlobal("window", domWindow);
defineGlobal("document", domWindow.document);
defineGlobal("navigator", domWindow.navigator);
defineGlobal("HTMLElement", domWindow.HTMLElement);
defineGlobal("HTMLButtonElement", domWindow.HTMLButtonElement);
defineGlobal("HTMLInputElement", domWindow.HTMLInputElement);
defineGlobal("HTMLTextAreaElement", domWindow.HTMLTextAreaElement);
defineGlobal("Event", domWindow.Event);
defineGlobal("MouseEvent", domWindow.MouseEvent);
defineGlobal("Node", domWindow.Node);
defineGlobal("IS_REACT_ACT_ENVIRONMENT", true);

domWindow.__REPOTUTOR_STUDIO_TEST_API__ = {
  async invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    invokeCalls.push({ command, args });
    if (command === "list_sessions") {
      return [{
        sessionId: studyResponse.sessionId,
        repo: "simple-ts-app",
        createdAt: "2026-06-11T07:00:00.000Z",
        mode: "quick",
        score: null,
        wrong: 0,
        path: sessionPath
      }] as T;
    }
    if (command === "resume_session" || command === "study_source") return studyResponse as T;
    if (command === "source_prune_plan") return sourcePruneResponse as T;
    if (command === "load_quiz") return quizPayload as T;
    if (command === "submit_quiz") return attemptResponse as T;
    throw new Error(`Unexpected invoke command: ${command}`);
  },
  convertFileSrc(filePath: string): string {
    return `mock-file://${encodeURIComponent(filePath)}`;
  }
};

const { default: App } = await import("./App.js");
const rootElement = domWindow.document.createElement("div");
rootElement.id = "root";
domWindow.document.body.append(rootElement);
const root = createRoot(rootElement);

await act(async () => {
  root.render(<App />);
  await settle();
});

await waitForText("세션 ui-smoke-session");
await waitForText("검증 PASS");
await waitForText("정리 검토 후보");
assertInvoke("list_sessions");
assertInvoke("resume_session", { sessionPath });
assertInvoke("source_prune_plan", { sessionPath });

await clickButton("학습 시작");
await waitForText("학습 설계 산출물 생성됨");
const studyCall = lastInvoke("study_source");
assert(studyCall.args?.source === "https://github.com/openai/codex", "study_source should use the source input");
assert(studyCall.args?.enableCodex === true, "study_source should keep Codex enabled for app use");

await clickButton("퀴즈 풀기");
await waitForText("AI 지시 맥락 판단 0/2 응답됨");
for (const questionNumber of [1, 2]) {
  const choice = domWindow.document.querySelector(`.quiz-item[data-question-number="${questionNumber}"] .choice-grid button`) as HTMLButtonElement | null;
  assert(choice, `question ${questionNumber} first choice should exist`);
  await act(async () => {
    choice.click();
    await settle();
  });
}
await waitForText("제출 가능");
await clickButton("제출");
await waitForText("최근 제출: 100점");
await waitForText("Learning record:");
assertInvoke("load_quiz", { sessionPath });
assertInvoke("submit_quiz", { sessionPath });

await clickButton("상태 확인");
await waitForText("소스 보존 상태: 정리 검토 후보");
assert(invokeCalls.filter((call) => call.command === "source_prune_plan").length >= 3, "source retention should be refreshed by app UI actions");

await act(async () => {
  root.unmount();
  await settle();
});

console.log(JSON.stringify({
  ok: true,
  checked: {
    render: ["autoResumeLatest", "verification PASS", "source retention panel"],
    commands: invokeCalls.map((call) => call.command),
    quiz: ["load_quiz", "answer choices", "submit_quiz", "learningRecord"],
    sourceRetention: ["source_prune_plan", "READY_REVIEW text", "source snapshot preserved"]
  }
}, null, 2));

async function clickButton(label: string): Promise<void> {
  const button = (Array.from(domWindow.document.querySelectorAll("button")) as HTMLButtonElement[])
    .find((item) => item.textContent?.includes(label) && !item.disabled);
  assert(button, `enabled button should exist: ${label}`);
  await act(async () => {
    button.click();
    await settle();
  });
}

function assertInvoke(command: string, expectedArgs?: Record<string, unknown>): void {
  const found = invokeCalls.some((call) => call.command === command && (!expectedArgs || Object.entries(expectedArgs).every(([key, value]) => call.args?.[key] === value)));
  assert(found, `expected invoke ${command}`);
}

function lastInvoke(command: string): InvokeCall {
  const found = invokeCalls.filter((call) => call.command === command).at(-1);
  assert(found, `expected invoke ${command}`);
  return found;
}

async function waitForText(text: string): Promise<void> {
  for (let index = 0; index < 60; index += 1) {
    await settle();
    if (bodyText().includes(text)) return;
  }
  throw new Error(`Timed out waiting for text: ${text}\n${bodyText().slice(0, 2000)}`);
}

async function settle(): Promise<void> {
  await domWindow.happyDOM.whenAsyncComplete();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function bodyText(): string {
  return domWindow.document.body.textContent ?? "";
}

function defineGlobal(key: string, value: unknown): void {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
