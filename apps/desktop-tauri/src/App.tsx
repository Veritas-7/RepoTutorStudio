import { BookOpen, FileText, ListChecks, Play, RotateCcw, Search, ShieldCheck, Square, StickyNote } from "lucide-react";
import { useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

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

const tabs = ["Overview", "Language", "Architecture", "Folders", "Files", "Flow", "Glossary", "Rebuild", "Quiz", "Wrong Notes", "HTML Preview", "Raw Logs"];

export default function App() {
  const [source, setSource] = useState("https://github.com/openai/codex");
  const [mode, setMode] = useState<StudyMode>("standard");
  const [level, setLevel] = useState<LearnerLevel>("beginner");
  const [activeTab, setActiveTab] = useState("Overview");
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [current, setCurrent] = useState<StudyResponse | null>(null);
  const [log, setLog] = useState<string[]>(["RepoTutor Studio ready."]);
  const [running, setRunning] = useState(false);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);

  const selectedSession = useMemo(() => sessions.find((session) => current?.path === session.path), [sessions, current]);

  async function startStudy() {
    setRunning(true);
    setLog((items) => [`분석 시작: ${source}`, ...items]);
    try {
      const result = await invoke<StudyResponse>("study_source", { source, mode, level });
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
          <button className="primary" onClick={startStudy} disabled={running} title="학습 분석 시작">
            {running ? <Square size={16} /> : <Play size={16} />}
            {running ? "진행 중" : "학습 시작"}
          </button>
        </section>

        <section className="status-strip">
          <div><ShieldCheck size={17} /> read-only static analysis</div>
          <div><FileText size={17} /> JSON + Markdown + HTML</div>
          <div><ListChecks size={17} /> quiz + wrong notes</div>
          <div><StickyNote size={17} /> Codex logs saved</div>
        </section>

        <nav className="tabs">
          {tabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </nav>

        <section className="content-grid">
          <article className="report-pane">
            <h1>{activeTab}</h1>
            {current ? (
              <>
                <p className="lead">세션 {current.sessionId}가 생성되었습니다. HTML, JSON, Markdown, Codex 로그가 날짜별 폴더에 저장됩니다.</p>
                <dl className="details">
                  <div><dt>상태</dt><dd>{current.status}</dd></div>
                  <div><dt>경로</dt><dd>{current.path}</dd></div>
                  <div><dt>HTML</dt><dd>{current.html}</dd></div>
                  <div><dt>퀴즈</dt><dd>{current.quizQuestions || selectedSession?.score || "생성됨"}</dd></div>
                </dl>
              </>
            ) : (
              <p className="lead">소스를 입력하고 학습을 시작하면 이 영역에서 리포트와 진행 상태를 확인합니다.</p>
            )}
          </article>

          <aside className="tutor-pane">
            <h2>튜터 패널</h2>
            <button>선택한 용어 설명</button>
            <button>특정 폴더 더 자세히</button>
            <button>특정 파일 다시 만들기</button>
            <button onClick={loadCurrentQuiz} disabled={!current}>퀴즈 풀기</button>
            <button>현재 대화를 HTML에 추가</button>
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
