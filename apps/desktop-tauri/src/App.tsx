import { BookOpen, BrainCircuit, FileText, KeyRound, ListChecks, MonitorCheck, Play, RotateCcw, Route, Search, ShieldCheck, Square, StickyNote, Terminal, Workflow } from "lucide-react";
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
  overview: "목적",
  language: "기술 스택",
  architecture: "아키텍처",
  folders: "폴더 역할",
  files: "파일 역할",
  flow: "작동 원리",
  glossary: "필수 용어",
  rebuild: "재구현 로드맵",
  "vibe-coding-prompt-pack": "프롬프트 팩",
  "improvement-backlog": "개선 백로그",
  quiz: "퀴즈",
  "wrong-notes": "오답노트"
};

const reportTabEntries = CORE_LEARNING_REPORT_TARGETS
  .filter((target) => target.target in reportTabLabels)
  .map((target) => ({ tab: reportTabLabels[target.target], target: target.target }));

const tabs = ["학습 타깃", ...reportTabEntries.map((entry) => entry.tab), "HTML 미리보기", "실행 로그"];

const tabTargetMap = Object.fromEntries(reportTabEntries.map((entry) => [entry.tab, entry.target])) as Record<string, string>;

const modeLabels: Record<StudyMode, string> = {
  quick: "빠른 분석",
  standard: "표준 학습",
  deep: "심층 분석"
};

const levelLabels: Record<LearnerLevel, string> = {
  beginner: "바이브코딩 입문",
  junior: "구조 이해",
  senior: "전문가 리뷰"
};

const statusLabels: Record<string, string> = {
  complete: "완료",
  running: "진행 중",
  failed: "실패"
};

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
  const [activeTab, setActiveTab] = useState("목적");
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [current, setCurrent] = useState<StudyResponse | null>(null);
  const [log, setLog] = useState<string[]>(["RepoTutor Studio 준비 완료"]);
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
    const target = activeTab === "HTML 미리보기" ? selectedTarget : (tabTargetMap[activeTab] ?? selectedTarget);
    return reportTargets.find((item) => item.target === target) ?? null;
  }, [activeTab, reportTargets, selectedTarget]);

  async function startStudy() {
    setRunning(true);
    setLog((items) => [`분석 시작: ${source} · Codex SDK 필수 AI 경로`, ...items]);
    try {
      const result = await invoke<StudyResponse>("study_source", { source, mode, level, enableCodex: true });
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
      setLog((items) => [`퀴즈 제출 완료: ${result.score}점, 오답 ${result.wrong}개`, ...items]);
      await refreshSessions();
    } catch (error) {
      setLog((items) => [`퀴즈 제출 오류: ${String(error)}`, ...items]);
    }
  }

  function openTargetInApp(target: string, path: string) {
    setSelectedTarget(target);
    setActiveTab("HTML 미리보기");
    setLog((items) => [`앱 미리보기 타깃: ${target} -> ${path}`, ...items]);
  }

  return (
    <div className="app-shell">
      <aside className="session-sidebar">
        <div className="brand">
          <BookOpen size={22} />
          <span>
            <strong>RepoTutor Studio</strong>
            <small>바이브코딩 학습 관제실</small>
          </span>
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
        <section className="mission-brief">
          <div className="mission-copy">
            <p className="eyebrow">GitHub · 소스 폴더 · SKILL.md</p>
            <h1>소스를 AI 지시 가능한 학습 설계도로 변환</h1>
            <p>목적, 아키텍처, 용어, 프롬프트, 검증 경계를 한 번에 고정하는 한국어 워크벤치입니다.</p>
            <div className="mission-badges" aria-label="RepoTutor 실행 상태">
              <span><ShieldCheck size={14} /> 읽기 전용</span>
              <span><KeyRound size={14} /> SDK 필수 인증</span>
              <span><Workflow size={14} /> CLI/스킬 동일 엔진</span>
            </div>
          </div>
          <dl className="mission-metrics">
            <div><dt>리포트</dt><dd>{CORE_LEARNING_REPORT_TARGETS.length}</dd></div>
            <div><dt>세션</dt><dd>{sessions.length}</dd></div>
            <div><dt>모드</dt><dd>{modeLabels[mode]}</dd></div>
            <div><dt>Codex</dt><dd>필수</dd></div>
          </dl>
        </section>

        <section className="command-band">
          <div className="source-input">
            <label>GitHub URL / 로컬 폴더 / ZIP / SKILL.md</label>
            <input value={source} onChange={(event) => setSource(event.target.value)} />
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
          <div className="ai-required-field" aria-label="Codex SDK 필수 AI 엔진">
            <span><KeyRound size={15} /> Codex SDK 필수 AI 엔진</span>
          </div>
          <button className="primary" onClick={startStudy} disabled={running} title="학습 분석 시작">
            {running ? <Square size={16} /> : <Play size={16} />}
            {running ? "진행 중" : "학습 시작"}
          </button>
        </section>

        <section className="status-strip">
          <div><ShieldCheck size={17} /> 읽기 전용 정적 분석</div>
          <div><FileText size={17} /> JSON · Markdown · HTML</div>
          <div><ListChecks size={17} /> 퀴즈 · 오답노트</div>
          <div><StickyNote size={17} /> Codex SDK 필수 AI 학습</div>
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
          {tabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
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
                  <div><dt>퀴즈</dt><dd>{current.quizQuestions || selectedSession?.score || "생성됨"}</dd></div>
                </dl>
                {activeTab === "학습 타깃" ? (
                  <section className="target-grid" aria-label="핵심 학습 리포트 타깃">
                    {reportTargets.map((target) => (
                      <article key={target.target} className="target-card">
                        <div className="target-card-title">
                          <Route size={16} />
                          <h2>{target.title}</h2>
                        </div>
                        <p>{target.description}</p>
                        <dl>
                          <div><dt>타깃</dt><dd>{target.target}</dd></div>
                          <div><dt>HTML</dt><dd>{target.path}</dd></div>
                          <div><dt>터미널</dt><dd>{target.command}</dd></div>
                        </dl>
                        <button onClick={() => openTargetInApp(target.target, target.path)} title={`${target.target} 리포트를 앱 안에서 미리봅니다.`}>
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
                        <p>{activeReportTarget.description}</p>
                      </div>
                      <button onClick={() => setActiveTab("학습 타깃")}>
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

          <aside className="tutor-pane">
            <h2><MonitorCheck size={18} /> 튜터 패널</h2>
            <button onClick={() => setActiveTab("필수 용어")}>필수 용어 보기</button>
            <button onClick={() => setActiveTab("폴더 역할")}>폴더 역할 보기</button>
            <button onClick={() => setActiveTab("파일 역할")}>파일 역할 보기</button>
            <button onClick={() => setActiveTab("재구현 로드맵")}>단계별 구축 지도</button>
            <button onClick={() => setActiveTab("개선 백로그")}>개선점 보기</button>
            <button onClick={() => setActiveTab("프롬프트 팩")}>프롬프트 팩 보기</button>
            <button onClick={() => setActiveTab("학습 타깃")}>CLI와 같은 타깃 보기</button>
            <button onClick={loadCurrentQuiz} disabled={!current}>퀴즈 풀기</button>
          </aside>
        </section>

        {activeTab === "퀴즈" && quiz ? (
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
