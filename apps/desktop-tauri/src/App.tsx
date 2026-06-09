import { BookOpen, FileText, ListChecks, Play, RotateCcw, Route, Search, ShieldCheck, Square, StickyNote, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { CORE_LEARNING_REPORT_TARGETS } from "@repotutor/shared/report-targets";

type StudyMode = "quick" | "standard" | "deep";
type LearnerLevel = "beginner" | "junior" | "senior";

interface SessionRow {
  sessionId: string;
  repo: string;
  createdAt: string;
  mode: StudyMode;
  score: number | null;
  wrong: number;
  path: string;
}

interface StudyResponse {
  sessionId: string;
  status: string;
  path: string;
  html: string;
  quizQuestions: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  choices: Record<"A" | "B" | "C" | "D", string>;
}

interface QuizPayload {
  sessionId: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

interface AttemptResponse {
  attemptId: string;
  score: number;
  correct: number;
  wrong: number;
  wrongNotes: string;
}

const reportTabLabels: Record<string, string> = {
  overview: "Overview",
  language: "Language",
  architecture: "Architecture",
  folders: "Folders",
  files: "Files",
  flow: "Flow",
  glossary: "Glossary",
  rebuild: "Rebuild",
  "vibe-coding-prompt-pack": "Prompt Pack",
  "improvement-backlog": "개선 백로그",
  quiz: "Quiz",
  "wrong-notes": "Wrong Notes"
};

const reportTabEntries = CORE_LEARNING_REPORT_TARGETS
  .filter((target) => target.target in reportTabLabels)
  .map((target) => ({ tab: reportTabLabels[target.target], target: target.target }));

const tabs = ["Learning Targets", ...reportTabEntries.map((entry) => entry.tab), "HTML Preview", "Raw Logs"];

const tabTargetMap = Object.fromEntries(reportTabEntries.map((entry) => [entry.tab, entry.target])) as Record<string, string>;

function previewSrc(filePath: string): string {
  try {
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      return convertFileSrc(filePath);
    }
  } catch {
    // Browser dev fallback below.
  }
  return `file://${encodeURI(filePath)}`;
}

export default function App() {
  const [source, setSource] = useState("https://github.com/openai/codex");
  const [mode, setMode] = useState<StudyMode>("standard");
  const [level, setLevel] = useState<LearnerLevel>("beginner");
  const [enableCodex, setEnableCodex] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [current, setCurrent] = useState<StudyResponse | null>(null);
  const [log, setLog] = useState<string[]>(["RepoTutor Studio ready."]);
  const [running, setRunning] = useState(false);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
  const [selectedTarget, setSelectedTarget] = useState("overview");

  const selectedSession = useMemo(() => sessions.find((session) => current?.path === session.path), [sessions, current]);
  const reportTargets = useMemo(() => {
    if (!current) return [];
    return CORE_LEARNING_REPORT_TARGETS.map((target) => ({
      ...target,
      path: `${current.path}/html/${target.fileName}`,
      command: target.terminalCommand.replace("<session>", current.path)
    }));
  }, [current]);
  const activeReportTarget = useMemo(() => {
    const target = activeTab === "HTML Preview" ? selectedTarget : (tabTargetMap[activeTab] ?? selectedTarget);
    return reportTargets.find((item) => item.target === target) ?? null;
  }, [activeTab, reportTargets, selectedTarget]);

  async function startStudy() {
    setRunning(true);
    setLog((items) => [`분석 시작: ${source}${enableCodex ? " · Codex SDK enabled" : ""}`, ...items]);
    try {
      const result = await invoke<StudyResponse>("study_source", { source, mode, level, enableCodex });
      setCurrent(result);
      setLog((items) => [`완료: ${result.html}`, ...items]);
      await refreshSessions();
    } catch (error) {
      setLog((items) => [`오류: ${String(error)}`, ...items]);
    } finally {
      setRunning(false);
    }
  }

  async function refreshSessions() {
    try {
      const result = await invoke<SessionRow[]>("list_sessions");
      setSessions(result);
    } catch (error) {
      setLog((items) => [`세션 목록 오류: ${String(error)}`, ...items]);
    }
  }

  async function loadCurrentQuiz() {
    if (!current) return;
    try {
      const result = await invoke<QuizPayload>("load_quiz", { sessionPath: current.path });
      setQuiz(result);
      setAnswers({});
      setAttempt(null);
      setActiveTab("Quiz");
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
      setLog((items) => [`퀴즈 제출 완료: ${result.score}점, 오답 ${result.wrong}개`, ...items]);
      await refreshSessions();
    } catch (error) {
      setLog((items) => [`퀴즈 제출 오류: ${String(error)}`, ...items]);
    }
  }

  function openTargetInApp(target: string, path: string) {
    setSelectedTarget(target);
    setActiveTab("HTML Preview");
    setLog((items) => [`앱 미리보기 target: ${target} -> ${path}`, ...items]);
  }

  return (
    <div className="app-shell">
      <aside className="session-sidebar">
        <div className="brand">
          <BookOpen size={22} />
          <strong>RepoTutor Studio</strong>
        </div>
        <label className="search-box">
          <Search size={16} />
          <input placeholder="세션 검색" />
        </label>
        <button className="icon-text" onClick={refreshSessions} title="세션 새로고침">
          <RotateCcw size={16} />
          새로고침
        </button>
        <div className="session-list">
          {sessions.map((session) => (
            <button key={session.sessionId} className="session-row" onClick={() => setCurrent({ sessionId: session.sessionId, status: "complete", path: session.path, html: `${session.path}/html/index.html`, quizQuestions: 0 })}>
              <span>{session.repo}</span>
              <small>{session.createdAt.slice(0, 10)} · {session.score ?? "미응시"}점 · 오답 {session.wrong}</small>
            </button>
          ))}
        </div>
      </aside>

      <main className="workspace">
        <section className="command-band">
          <div className="source-input">
            <label>GitHub URL / Local folder / ZIP / SKILL.md</label>
            <input value={source} onChange={(event) => setSource(event.target.value)} />
          </div>
          <label>
            분석 모드
            <select value={mode} onChange={(event) => setMode(event.target.value as StudyMode)}>
              <option value="quick">Quick</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>
          </label>
          <label>
            학습자
            <select value={level} onChange={(event) => setLevel(event.target.value as LearnerLevel)}>
              <option value="beginner">완전 초보자</option>
              <option value="junior">주니어</option>
              <option value="senior">시니어</option>
            </select>
          </label>
          <label className="toggle-field">
            Codex SDK
            <span>
              <input type="checkbox" checked={enableCodex} onChange={(event) => setEnableCodex(event.target.checked)} />
              사용
            </span>
          </label>
          <button className="primary" onClick={startStudy} disabled={running} title="학습 분석 시작">
            {running ? <Square size={16} /> : <Play size={16} />}
            {running ? "진행 중" : "학습 시작"}
          </button>
        </section>

        <section className="status-strip">
          <div><ShieldCheck size={17} /> read-only static analysis</div>
          <div><FileText size={17} /> JSON + Markdown + HTML</div>
          <div><ListChecks size={17} /> quiz + wrong notes</div>
          <div><StickyNote size={17} /> Codex SDK {enableCodex ? "enabled" : "optional"}</div>
        </section>

        <nav className="tabs">
          {tabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </nav>

        <section className="content-grid">
          <article className="report-pane">
            <h1>{activeTab}</h1>
            {current ? (
              <>
                <p className="lead">세션 {current.sessionId}가 생성되었습니다. 터미널의 <code>repo-tutor open --target</code>과 같은 핵심 학습 페이지를 앱에서도 확인할 수 있습니다.</p>
                <dl className="details">
                  <div><dt>상태</dt><dd>{current.status}</dd></div>
                  <div><dt>경로</dt><dd>{current.path}</dd></div>
                  <div><dt>HTML</dt><dd>{current.html}</dd></div>
                  <div><dt>퀴즈</dt><dd>{current.quizQuestions || selectedSession?.score || "생성됨"}</dd></div>
                </dl>
                {activeTab === "Learning Targets" ? (
                  <section className="target-grid" aria-label="core learning report targets">
                    {reportTargets.map((target) => (
                      <article key={target.target} className="target-card">
                        <div className="target-card-title">
                          <Route size={16} />
                          <h2>{target.title}</h2>
                        </div>
                        <p>{target.description}</p>
                        <dl>
                          <div><dt>target</dt><dd>{target.target}</dd></div>
                          <div><dt>HTML</dt><dd>{target.path}</dd></div>
                          <div><dt>terminal</dt><dd>{target.command}</dd></div>
                        </dl>
                        <button onClick={() => openTargetInApp(target.target, target.path)} title={`${target.target} 리포트를 앱 안에서 미리봅니다.`}>
                          <Terminal size={15} />
                          앱에서 보기
                        </button>
                      </article>
                    ))}
                  </section>
                ) : null}
                {activeReportTarget && activeTab !== "Learning Targets" ? (
                  <section className="report-preview" aria-label={`${activeReportTarget.target} report preview`}>
                    <div className="report-preview-header">
                      <div>
                        <h2>{activeReportTarget.title}</h2>
                        <p>{activeReportTarget.description}</p>
                      </div>
                      <button onClick={() => setActiveTab("Learning Targets")}>
                        <Route size={15} />
                        target 목록
                      </button>
                    </div>
                    <dl className="target-meta">
                      <div><dt>terminal</dt><dd>{activeReportTarget.command}</dd></div>
                      <div><dt>HTML</dt><dd>{activeReportTarget.path}</dd></div>
                    </dl>
                    <iframe title={`${activeReportTarget.title} preview`} src={previewSrc(activeReportTarget.path)} />
                  </section>
                ) : null}
              </>
            ) : (
              <p className="lead">소스를 입력하고 학습을 시작하면 터미널과 같은 핵심 학습 target, 리포트, 진행 상태를 확인합니다.</p>
            )}
          </article>

          <aside className="tutor-pane">
            <h2>튜터 패널</h2>
            <button onClick={() => setActiveTab("Glossary")}>필수 용어 보기</button>
            <button onClick={() => setActiveTab("Folders")}>폴더 역할 보기</button>
            <button onClick={() => setActiveTab("Files")}>파일 역할 보기</button>
            <button onClick={() => setActiveTab("Rebuild")}>단계별 구축 지도</button>
            <button onClick={() => setActiveTab("개선 백로그")}>개선점 보기</button>
            <button onClick={() => setActiveTab("Prompt Pack")}>프롬프트 팩 보기</button>
            <button onClick={() => setActiveTab("Learning Targets")}>CLI와 같은 target 보기</button>
            <button onClick={loadCurrentQuiz} disabled={!current}>퀴즈 풀기</button>
          </aside>
        </section>

        {activeTab === "Quiz" && quiz ? (
          <section className="quiz-workspace">
            <div className="quiz-header">
              <h2>퀴즈 응시</h2>
              <button className="primary" onClick={submitCurrentQuiz}>제출</button>
            </div>
            <div className="quiz-list">
              {quiz.questions.map((question, index) => (
                <article key={question.id} className="quiz-item">
                  <h3>{index + 1}. {question.question}</h3>
                  <div className="choice-grid">
                    {(Object.entries(question.choices) as Array<["A" | "B" | "C" | "D", string]>).map(([key, value]) => (
                      <button key={key} className={answers[question.id] === key ? "selected" : ""} onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: key }))}>
                        <strong>{key}</strong>. {value}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            {attempt ? <p className="attempt-result">최근 제출: {attempt.score}점 · 정답 {attempt.correct} · 오답 {attempt.wrong} · {attempt.wrongNotes}</p> : null}
          </section>
        ) : null}

        <section className="log-panel">
          <h2>진행 로그</h2>
          {log.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
        </section>
      </main>
    </div>
  );
}
