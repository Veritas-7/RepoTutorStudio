import crypto from "node:crypto";
import type {
  ArchitectureReport,
  DependencyReport,
  FileLesson,
  FlowReport,
  FolderLesson,
  GlossaryTerm,
  HtmlExportManifest,
  LanguageReport,
  PurposeReport,
  Quiz,
  QuizAttempt,
  RebuildRoadmap,
  RepoMap,
  SuggestedReadsReport,
  RuntimeEnvironmentReport,
  InterfaceMapReport,
  StudySession,
  CoverageReport,
  ComponentGraphReport,
  SourceSnapshotReport,
  IncrementalReport,
  WrongNote
} from "@repotutor/shared";
import { htmlAnchor } from "@repotutor/shared";

export interface StudyHtmlInput {
  session: StudySession;
  repoMap: RepoMap;
  languageReport: LanguageReport;
  dependencyReport: DependencyReport;
  purposeReport: PurposeReport;
  architectureReport: ArchitectureReport;
  folderLessons: FolderLesson[];
  fileLessons: FileLesson[];
  coverageReport: CoverageReport;
  suggestedReadsReport: SuggestedReadsReport;
  runtimeEnvironmentReport: RuntimeEnvironmentReport;
  interfaceMapReport: InterfaceMapReport;
  componentGraphReport: ComponentGraphReport;
  sourceSnapshotReport: SourceSnapshotReport;
  incrementalReport: IncrementalReport;
  flowReport: FlowReport;
  glossary: GlossaryTerm[];
  rebuildRoadmap: RebuildRoadmap;
  quiz: Quiz;
  wrongNotes: WrongNote[];
  attempts: QuizAttempt[];
}

export interface RenderedPage {
  name: string;
  title: string;
  html: string;
}

export interface RenderedStudy {
  pages: RenderedPage[];
  assets: Record<string, string>;
  manifest: HtmlExportManifest;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items: string[]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function pageShell(title: string, active: string, body: string, input: StudyHtmlInput): string {
  const nav = [
    ["index.html", "Overview"],
    ["learning-path.html", "Learning Path"],
    ["language.html", "Language"],
    ["architecture.html", "Architecture"],
    ["folders.html", "Folders"],
    ["files.html", "Files"],
    ["evidence.html", "Evidence"],
    ["suggested-reads.html", "Suggested Reads"],
    ["runtime-environment.html", "Runtime Environment"],
    ["interface-map.html", "Interface Map"],
    ["session-verification.html", "Verification"],
    ["coverage.html", "Coverage"],
    ["component-graph.html", "Component Graph"],
    ["incremental.html", "Incremental"],
    ["flow.html", "Flow"],
    ["glossary.html", "Glossary"],
    ["rebuild.html", "Rebuild"],
    ["quiz.html", "Quiz"],
    ["quiz-print.html", "Quiz Print"],
    ["wrong-notes.html", "Wrong Notes"]
  ];

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - ${escapeHtml(input.session.repo)}</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <aside class="sidebar">
    <strong>RepoTutor Studio</strong>
    <input id="search" type="search" placeholder="검색">
    <nav>${nav.map(([href, label]) => `<a class="${href === active ? "active" : ""}" href="${href}">${label}</a>`).join("")}</nav>
  </aside>
  <main>
    <header class="page-header">
      <div>
        <p class="eyebrow">${escapeHtml(input.session.owner)} / ${escapeHtml(input.session.repo)}</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <dl class="meta">
        <div><dt>날짜</dt><dd>${escapeHtml(input.session.createdAt.slice(0, 10))}</dd></div>
        <div><dt>branch</dt><dd>${escapeHtml(input.session.branch)}</dd></div>
        <div><dt>commit</dt><dd>${escapeHtml(input.session.commitHash.slice(0, 8))}</dd></div>
        <div><dt>mode</dt><dd>${escapeHtml(input.session.studyMode)}</dd></div>
      </dl>
    </header>
    ${body}
  </main>
  <script src="assets/app.js"></script>
</body>
</html>`;
}

export function renderStudyHtml(input: StudyHtmlInput): RenderedStudy {
  const latestAttempt = input.attempts.at(-1);
  const weakConcepts = input.wrongNotes.flatMap((note) => note.relatedConcepts).slice(0, 5);
  const coverageEvidence = coverageEvidenceFor(input.coverageReport);
  const coverageEvidenceKinds = evidenceKindList(coverageEvidence.evidenceKindCounts);
  const coverageDelta = coverageDeltaFor(input.incrementalReport);
  const graphSummary = graphSummaryFor(input.componentGraphReport);
  const graphFilters = graphFilterButtons(input.componentGraphReport.nodes);
  const fileNavigation = fileNavigationFor(input.fileLessons);
  const evidenceFilters = evidenceKindFilterButtons(input.fileLessons);
  const quizFilters = quizFilterButtons(input.quiz.questions);
  const learningPath = learningPathFor(input);
  const pages: RenderedPage[] = [
    {
      name: "index.html",
      title: "학습 리포트",
      html: pageShell("학습 리포트", "index.html", `
        <section class="panel">
          <h2>프로젝트 요약</h2>
          <p class="lead">${escapeHtml(input.purposeReport.oneLineSummary)}</p>
          <p>${escapeHtml(input.purposeReport.longExplanation)}</p>
          <h3>대상 사용자</h3>${list(input.purposeReport.targetUsers)}
          <h3>해결하는 문제</h3>${list(input.purposeReport.solvedProblems)}
        </section>
        <section class="grid">
          <article><h3>학습 지도</h3>${list(["Overview", "Language", "Folders", "Files", "Evidence", "Verification", "Flow", "Glossary", "Rebuild", "Quiz"])}</article>
          <article><h3>커버리지</h3><p>${(input.coverageReport.coverageRatio * 100).toFixed(1)}% · 핵심 파일 ${input.coverageReport.coveredImportantFiles}개 설명</p><p>소스 근거 ${coverageEvidence.evidenceBackedFiles}개 · ${(coverageEvidence.evidenceCoverageRatio * 100).toFixed(1)}%</p><p>근거 종류 ${coverageEvidenceKinds.length}개</p><a href="coverage.html">커버리지 열기</a></article>
          <article><h3>근거 인덱스</h3><p>소스 근거 ${input.fileLessons.reduce((sum, lesson) => sum + (lesson.sourceEvidence ?? []).length, 0)}개</p><p>파일 수업과 복사된 원본 소스를 함께 엽니다.</p><a href="evidence.html">근거 인덱스 열기</a></article>
          <article><h3>추천 읽기</h3><p>${escapeHtml(input.suggestedReadsReport.summary)}</p><p>Repo Baby 패턴으로 먼저 읽을 파일을 정렬합니다.</p><a href="suggested-reads.html">추천 읽기 열기</a></article>
          <article><h3>실행 환경</h3><p>${escapeHtml(input.runtimeEnvironmentReport.summary)}</p><p>docSmith 패턴으로 Docker와 setup 신호를 정리합니다.</p><a href="runtime-environment.html">실행 환경 열기</a></article>
          <article><h3>인터페이스 맵</h3><p>${escapeHtml(input.interfaceMapReport.summary)}</p><p>repomap 패턴으로 route/page/API 신호를 모읍니다.</p><a href="interface-map.html">인터페이스 맵 열기</a></article>
          <article><h3>세션 검증</h3><p>생성 산출물, HTML 무결성, 소스 근거 링크 검증 결과를 확인합니다.</p><p><a href="session-verification.html">검증 리포트 열기</a></p></article>
          <article><h3>컴포넌트 그래프</h3><p>노드 ${graphSummary.totalNodes}개 · 관계 ${graphSummary.totalEdges}개</p><p>핵심 허브: ${graphSummary.topConnectedNodes.slice(0, 3).map((node) => escapeHtml(node.label)).join(", ") || "없음"}</p><a href="component-graph.html">그래프 열기</a></article>
          <article><h3>증분 분석</h3><p>${escapeHtml(input.incrementalReport.summary)}</p><p>${escapeHtml(coverageDelta.summary)}</p><a href="incremental.html">증분 리포트 열기</a></article>
          <article><h3>퀴즈 요약</h3><p>총 ${input.quiz.totalQuestions}문제</p><p>최근 점수: ${latestAttempt ? latestAttempt.score.toFixed(1) : "미응시"}</p></article>
          <article><h3>오답노트</h3><p>오답 ${input.wrongNotes.length}개</p><p>취약 개념: ${weakConcepts.map(escapeHtml).join(", ") || "아직 없음"}</p><a href="wrong-notes.html">오답노트 열기</a></article>
        </section>
        <section class="panel">
          <h2>폴더 트리</h2>
          <pre>${escapeHtml(input.repoMap.treeMarkdown)}</pre>
        </section>
      `, input)
    },
    {
      name: "learning-path.html",
      title: "학습 경로",
      html: pageShell("학습 경로", "learning-path.html", `<section class="panel" data-source-pattern="CodeTour"><h2>투어형 학습 순서</h2><span class="muted" data-learning-primary>기본 투어</span><p>생성된 리포트를 순서대로 따라가며 저장소의 목적, 구조, 근거, 그래프, 재구현, 복습 문제로 이동합니다.</p><p class="muted learning-progress-summary" data-learning-progress-summary>완료 0 / ${learningPath.length}</p><div class="toolbar learning-progress-toolbar" role="toolbar" aria-label="learning progress controls"><button type="button" data-reset-learning-progress>진도 초기화</button></div></section><section class="cards learning-path-cards">${learningPath.map((step, index) => `<article id="learning-step-${index + 1}" class="learning-path-step" data-learning-step="${index + 1}"><h3>${index + 1}. ${escapeHtml(step.title)}</h3><p>${escapeHtml(step.goal)}</p><p class="muted">${escapeHtml(step.evidence)}</p><a href="${escapeHtml(step.href)}">이 단계 열기</a><label><input type="checkbox" data-learning-step-complete="${index + 1}"> 학습 완료</label><p class="learning-step-nav">${index > 0 ? `<a href="#learning-step-${index}">이전 단계</a>` : ""}${index > 0 && index < learningPath.length - 1 ? " " : ""}${index < learningPath.length - 1 ? `<a href="#learning-step-${index + 2}">다음 단계</a>` : ""}</p></article>`).join("")}</section>`, input)
    },
    {
      name: "overview.html",
      title: "프로젝트 목적",
      html: pageShell("프로젝트 목적", "index.html", `
        <section class="panel"><h2>무엇을 하는 프로젝트인가?</h2><p>${escapeHtml(input.purposeReport.longExplanation)}</p><h3>초보자용 비유</h3><p>${escapeHtml(input.purposeReport.beginnerAnalogy)}</p><h3>근거</h3>${list(input.purposeReport.evidence)}</section>
      `, input)
    },
    {
      name: "language.html",
      title: "언어와 기술 스택",
      html: pageShell("언어와 기술 스택", "language.html", `
        <section class="panel"><h2>주요 언어</h2><p>${escapeHtml(input.languageReport.primaryLanguage)}</p></section>
        <section class="cards">${input.languageReport.languageRoles.map((role) => `<article id="${htmlAnchor(role.language)}"><h3>${escapeHtml(role.language)}</h3><p>${escapeHtml(role.role)}</p><p>${escapeHtml(role.beginnerExplanation)}</p><p>${escapeHtml(role.tradeoffs)}</p></article>`).join("")}</section>
        <section class="panel"><h2>의존성</h2>${input.dependencyReport.manifests.map((manifest) => `<h3>${escapeHtml(manifest.filePath)}</h3>${list(manifest.dependencies.map((dep) => `${dep.name}: ${dep.beginnerExplanation}`))}`).join("")}</section>
      `, input)
    },
    {
      name: "architecture.html",
      title: "아키텍처",
      html: pageShell("아키텍처", "architecture.html", `<section class="panel"><h2>${escapeHtml(input.architectureReport.architectureStyle)}</h2><p>${escapeHtml(input.architectureReport.explanation)}</p><h3>근거</h3>${list(input.architectureReport.evidence)}<h3>Mermaid</h3><pre>${escapeHtml(input.architectureReport.mermaid)}</pre></section>`, input)
    },
    {
      name: "folders.html",
      title: "폴더 수업",
      html: pageShell("폴더 수업", "folders.html", `<section class="cards">${input.folderLessons.map((lesson) => `<article id="${htmlAnchor(lesson.folderPath)}"><h3>${escapeHtml(lesson.folderPath)}</h3><p>${escapeHtml(lesson.beginnerExplanation)}</p><h4>왜 필요한가?</h4><p>${escapeHtml(lesson.whyItExists)}</p><h4>다시 만들 때</h4><p>${escapeHtml(lesson.rebuildAdvice)}</p></article>`).join("")}</section>`, input)
    },
    {
      name: "files.html",
      title: "핵심 파일 수업",
      html: pageShell("핵심 파일 수업", "files.html", `<section class="panel"><h2>파일 탐색 필터</h2><p>${escapeHtml(fileNavigation.summary)}</p><h3>확장자</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="file extension filters">${fileNavigation.extensionButtons}</div><h3>상위 폴더</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="file directory filters">${fileNavigation.directoryButtons}</div><h3>소스 근거</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="source evidence filters">${fileNavigation.evidenceButtons}</div></section><section class="cards file-lesson-cards">${input.fileLessons.map((lesson) => `<article id="${htmlAnchor(lesson.filePath)}" data-file-ext="${escapeHtml(fileExtension(lesson.filePath))}" data-file-dir="${escapeHtml(topDirectory(lesson.filePath))}" data-source-evidence="${sourceEvidenceState(lesson)}"><h3>${escapeHtml(lesson.filePath)}</h3><p class="muted">${escapeHtml(topDirectory(lesson.filePath))} · ${escapeHtml(fileExtension(lesson.filePath))} · ${escapeHtml(sourceEvidenceLabel(lesson))}</p><p>${escapeHtml(lesson.beginnerExplanation)}</p><p>${escapeHtml(lesson.whyItExists)}</p><h4>소스 근거</h4>${sourceEvidenceList(lesson.sourceEvidence ?? [], lesson.filePath)}<h4>관련 용어</h4>${list(lesson.glossaryTerms)}</article>`).join("")}</section>`, input)
    },
    {
      name: "evidence.html",
      title: "소스 근거 인덱스",
      html: pageShell("소스 근거 인덱스", "evidence.html", `<section class="panel"><h2>근거 전체 목록</h2><p>각 소스 근거를 파일 수업과 복사된 원본 소스에 연결합니다.</p><div class="toolbar evidence-kind-toolbar" role="toolbar" aria-label="source evidence kind filters">${evidenceFilters}</div></section><section class="cards evidence-index-cards">${evidenceIndexCards(input.fileLessons)}</section>`, input)
    },
    {
      name: "suggested-reads.html",
      title: "추천 읽기",
      html: pageShell("추천 읽기", "suggested-reads.html", `<section class="panel" data-source-pattern="Repo Baby"><h2>먼저 읽을 파일</h2><p>${escapeHtml(input.suggestedReadsReport.summary)}</p><p class="muted">${escapeHtml(input.suggestedReadsReport.sourcePattern)}</p></section><section class="cards suggested-read-cards">${input.suggestedReadsReport.items.map((item) => `<article class="suggested-read-card"><h3>${item.rank}. ${escapeHtml(item.filePath)}</h3><p>${escapeHtml(item.reason)}</p><p class="muted">소스 근거 ${item.evidenceCount}개 · 관련 파일 ${item.relatedFileCount}개</p><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">파일 수업 열기</a> <a href="../${escapeHtml(item.sourceHref)}">원본 열기</a></article>`).join("")}</section>`, input)
    },
    {
      name: "runtime-environment.html",
      title: "실행 환경",
      html: pageShell("실행 환경", "runtime-environment.html", `<section class="panel" data-source-pattern="docSmith"><h2>런타임 준비 신호</h2><p>${escapeHtml(input.runtimeEnvironmentReport.summary)}</p><p class="muted">${escapeHtml(input.runtimeEnvironmentReport.sourcePattern)}</p></section><section class="grid"><article class="runtime-env-card"><h3>매니페스트</h3>${list(input.runtimeEnvironmentReport.detectedManifests.map((item) => `${item.filePath}: ${item.ecosystem} · ${item.signal}`))}</article><article class="runtime-env-card"><h3>설치/실행</h3>${list(input.runtimeEnvironmentReport.setupSignals.map((item) => `${item.filePath}: ${item.signal}`))}</article><article class="runtime-env-card"><h3>컨테이너</h3>${list(input.runtimeEnvironmentReport.containerSignals.map((item) => `${item.filePath}: ${item.signal}`))}</article><article class="runtime-env-card"><h3>서비스 힌트</h3>${list(input.runtimeEnvironmentReport.serviceHints.map((item) => `${item.name}: ${item.reason}`))}</article></section><section class="grid"><article><h3>부족한 신호</h3>${list(input.runtimeEnvironmentReport.missingSignals)}</article><article><h3>다음 확인 단계</h3>${list(input.runtimeEnvironmentReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "interface-map.html",
      title: "인터페이스 맵",
      html: pageShell("인터페이스 맵", "interface-map.html", `<section class="panel" data-source-pattern="repomap"><h2>Route/Page/API 신호</h2><p>${escapeHtml(input.interfaceMapReport.summary)}</p><p class="muted">${escapeHtml(input.interfaceMapReport.sourcePattern)}</p></section><section class="grid"><article class="interface-map-card"><h3>Route/Page</h3>${interfaceSourceList(input.interfaceMapReport.routeSignals.map((item) => ({ text: `${item.filePath}: ${item.kind} · ${item.signal}`, sourceHref: item.sourceHref })))}</article><article class="interface-map-card"><h3>API</h3>${interfaceSourceList(input.interfaceMapReport.apiSignals.map((item) => ({ text: `${item.filePath}: ${item.method} ${item.pattern}`, sourceHref: item.sourceHref })))}</article><article class="interface-map-card"><h3>Components</h3>${interfaceSourceList(input.interfaceMapReport.componentSignals.map((item) => ({ text: `${item.componentName}: ${item.filePath}`, sourceHref: item.sourceHref })))}</article><article class="interface-map-card"><h3>Data Flow</h3>${list(input.interfaceMapReport.dataFlowHints)}</article></section><section class="panel"><h2>다음 확인 단계</h2>${list(input.interfaceMapReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "session-verification.html",
      title: "세션 검증",
      html: pageShell("세션 검증", "session-verification.html", `<section class="panel"><h2>검증 리포트</h2><p>이 세션은 생성 완료 후 필수 산출물, HTML export 무결성, 소스 근거 링크를 검증합니다.</p><dl class="meta"><div><dt>필수 산출물</dt><dd>session, analysis, markdown, HTML</dd></div><div><dt>HTML 무결성</dt><dd>manifest bytes + sha256</dd></div><div><dt>소스 근거</dt><dd>source path, source href, lesson anchor</dd></div></dl></section><section class="grid"><article><h3>JSON 리포트</h3><p>자동화와 CLI 검증에 적합한 구조화 리포트입니다.</p><a href="../analysis/session-verification-report.json">session-verification-report.json</a></article><article><h3>Markdown 리포트</h3><p>사람이 읽기 쉬운 PASS/FAIL 요약입니다.</p><a href="../markdown/session-verification.md">session-verification.md</a></article><article><h3>CLI 재검증</h3><p>같은 세션 폴더에서 <code>repo-tutor verify-session</code>을 실행하면 현재 파일 상태를 다시 확인합니다.</p></article></section>`, input)
    },
    {
      name: "coverage.html",
      title: "학습 커버리지",
      html: pageShell("학습 커버리지", "coverage.html", `<section class="panel"><h2>커버리지 요약</h2><p>${escapeHtml(input.coverageReport.beginnerExplanation)}</p><dl class="meta"><div><dt>전체 파일</dt><dd>${input.coverageReport.totalScannedFiles}</dd></div><div><dt>핵심 파일 설명</dt><dd>${input.coverageReport.coveredImportantFiles}</dd></div><div><dt>비율</dt><dd>${(input.coverageReport.coverageRatio * 100).toFixed(1)}%</dd></div><div><dt>소스 근거 파일</dt><dd>${coverageEvidence.evidenceBackedFiles}</dd></div><div><dt>근거 비율</dt><dd>${(coverageEvidence.evidenceCoverageRatio * 100).toFixed(1)}%</dd></div><div><dt>근거 종류</dt><dd>${coverageEvidenceKinds.length}</dd></div></dl></section><section class="grid"><article><h3>소스 근거 종류</h3>${list(coverageEvidenceKinds)}</article><article><h3>우선 확인 폴더</h3>${list(input.coverageReport.highPriorityFolders.map((folder) => `${folder.folderPath}: ${folder.reason}`))}</article><article><h3>미커버 후보</h3>${list(input.coverageReport.uncoveredImportantFiles)}</article><article><h3>소스 근거 부족</h3>${linkedFileList(coverageEvidence.filesWithoutEvidence)}</article></section>`, input)
    },
    {
      name: "component-graph.html",
      title: "컴포넌트 그래프",
      html: pageShell("컴포넌트 그래프", "component-graph.html", `<section class="panel"><h2>관계도</h2><p>${escapeHtml(input.componentGraphReport.beginnerExplanation)}</p><div class="toolbar component-graph-download-toolbar" role="toolbar" aria-label="component graph downloads"><button type="button" data-download-mermaid="component-graph-mermaid">Mermaid 다운로드</button></div><pre id="component-graph-mermaid">${escapeHtml(input.componentGraphReport.mermaid)}</pre></section><section class="panel"><h2>큰 그래프 요약</h2><p>${escapeHtml(graphSummary.largeRepoAdvice)}</p><dl class="meta"><div><dt>노드</dt><dd>${graphSummary.totalNodes}</dd></div><div><dt>관계</dt><dd>${graphSummary.totalEdges}</dd></div></dl><h3>노드 타입</h3>${list(Object.entries(graphSummary.nodeTypeCounts).map(([type, count]) => `${type}: ${count}`))}<h3>핵심 허브</h3>${list(graphSummary.topConnectedNodes.map((node) => `${node.label} [${node.type}] · degree ${node.degree}`))}</section><section class="panel"><h2>노드 필터</h2><div class="toolbar graph-filter-toolbar" role="toolbar" aria-label="component graph filters">${graphFilters}</div></section><section class="grid"><article><h3>진입 노드</h3>${list(input.componentGraphReport.entryNodeIds)}</article><article><h3>관계</h3>${list(input.componentGraphReport.edges.slice(0, 40).map((edge) => `${edge.from} -> ${edge.to}: ${edge.label}`))}</article></section><section class="cards component-node-cards">${input.componentGraphReport.nodes.map((node) => `<article id="${componentNodeAnchor(node.id)}" class="component-node-anchor" data-node-id="${escapeHtml(node.id)}" data-node-type="${escapeHtml(node.type)}"><h3>${escapeHtml(node.label)}</h3><p class="muted">${escapeHtml(node.type)}</p><p>${escapeHtml(node.summary)}</p>${node.href ? `<a href="${escapeHtml(node.href)}">관련 학습 섹션</a>` : ""}${componentNodeRelations(node.id, input.componentGraphReport)}</article>`).join("")}</section>`, input)
    },
    {
      name: "incremental.html",
      title: "증분 분석",
      html: pageShell("증분 분석", "incremental.html", `<section class="panel"><h2>변화 요약</h2><p>${escapeHtml(input.incrementalReport.beginnerExplanation)}</p><p class="lead">${escapeHtml(input.incrementalReport.summary)}</p><dl class="meta"><div><dt>baseline</dt><dd>${escapeHtml(input.incrementalReport.baselineSessionId ?? "none")}</dd></div><div><dt>tracked files</dt><dd>${input.sourceSnapshotReport.totalFiles}</dd></div></dl></section><section class="panel"><h2>커버리지 변화</h2><p>${escapeHtml(coverageDelta.summary)}</p><dl class="meta"><div><dt>이전 비율</dt><dd>${escapeHtml(formatPercentOrNone(coverageDelta.baselineCoverageRatio))}</dd></div><div><dt>현재 비율</dt><dd>${escapeHtml(formatPercentOrNone(coverageDelta.currentCoverageRatio))}</dd></div><div><dt>변화</dt><dd>${escapeHtml(formatPointDelta(coverageDelta.coverageRatioDelta))}</dd></div><div><dt>핵심 파일</dt><dd>${coverageDelta.currentCoveredImportantFiles}</dd></div></dl></section><section class="grid"><article><h3>추가</h3>${list(input.incrementalReport.addedFiles)}</article><article><h3>변경</h3>${list(input.incrementalReport.changedFiles)}</article><article><h3>삭제</h3>${list(input.incrementalReport.removedFiles)}</article><article><h3>유지</h3><p>${input.incrementalReport.unchangedFiles.length}개 파일</p></article></section>`, input)
    },
    {
      name: "flow.html",
      title: "실행 흐름",
      html: pageShell("실행 흐름", "flow.html", `<section class="grid"><article><h3>시작점</h3>${list(input.flowReport.startPoints)}</article><article><h3>CLI 흐름</h3>${list(input.flowReport.cliFlow)}</article><article><h3>앱 흐름</h3>${list(input.flowReport.appFlow)}</article><article><h3>데이터 흐름</h3>${list(input.flowReport.dataFlow)}</article></section><section class="panel"><h2>Mermaid</h2><pre>${escapeHtml(input.flowReport.mermaid)}</pre></section>`, input)
    },
    {
      name: "glossary.html",
      title: "용어 사전",
      html: pageShell("용어 사전", "glossary.html", `<section class="cards">${input.glossary.map((term) => `<article id="${htmlAnchor(term.termEn)}"><h3>${escapeHtml(term.termKo)} (${escapeHtml(term.termEn)})</h3><p>${escapeHtml(term.simpleDefinition)}</p><p>${escapeHtml(term.projectSpecificMeaning)}</p><p class="muted">${escapeHtml(term.exampleFromRepo)}</p></article>`).join("")}</section>`, input)
    },
    {
      name: "rebuild.html",
      title: "맨땅에서 따라 만들기",
      html: pageShell("맨땅에서 따라 만들기", "rebuild.html", `<section class="cards">${input.rebuildRoadmap.steps.map((step) => `<article><h3>${step.order}. ${escapeHtml(step.title)}</h3><p>${escapeHtml(step.goal)}</p><h4>해야 할 일</h4>${list(step.tasks)}<h4>완료 기준</h4>${list(step.completionCriteria)}</article>`).join("")}</section>`, input)
    },
    {
      name: "quiz.html",
      title: "퀴즈",
      html: pageShell("퀴즈", "quiz.html", `<section class="panel"><h2>오프라인 복습 모드</h2><p>브라우저에서 선택지를 눌러 즉시 정답을 확인할 수 있습니다. 응시 기록 저장과 오답노트 반영은 CLI 또는 Tauri 앱에서 수행합니다.</p><p id="quiz-live-score" class="muted">아직 선택한 문제가 없습니다.</p><div class="toolbar quiz-reset-toolbar" role="toolbar" aria-label="quiz reset controls"><button type="button" data-reset-quiz>복습 초기화</button></div></section><section class="panel"><h2>퀴즈 필터</h2><p>섹션과 난이도 기준으로 복습할 문제를 좁힙니다.</p><h3>섹션</h3><div class="toolbar quiz-section-toolbar" role="toolbar" aria-label="quiz section filters">${quizFilters.sectionButtons}</div><h3>난이도</h3><div class="toolbar quiz-difficulty-toolbar" role="toolbar" aria-label="quiz difficulty filters">${quizFilters.difficultyButtons}</div></section><section class="cards quiz-board">${input.quiz.questions.map((question, index) => `<article id="${question.id}" class="quiz-card" data-quiz-section="${escapeHtml(question.section)}" data-quiz-difficulty="${escapeHtml(question.difficulty)}"><h3>${index + 1}. ${escapeHtml(question.question)}</h3><p class="muted">${escapeHtml(question.section)} · ${escapeHtml(question.difficulty)}</p><div class="choice-grid">${Object.entries(question.choices).map(([key, value]) => `<button class="choice" data-correct="${key === question.correctChoice}" data-question="${question.id}"><strong>${key}</strong>. ${escapeHtml(value)}</button>`).join("")}</div><details><summary>정답과 해설</summary><p>${escapeHtml(question.correctChoice)}: ${escapeHtml(question.explanation)}</p></details></article>`).join("")}</section>`, input)
    },
    {
      name: "quiz-print.html",
      title: "퀴즈 정답지",
      html: pageShell("퀴즈 정답지", "quiz-print.html", `<section class="panel"><h2>인쇄용 정답지</h2><p>브라우저 print preview에서 질문, 선택지, 정답, 해설, 연결 수업을 한 번에 확인합니다.</p></section><section class="cards print-answer-key">${input.quiz.questions.map((question, index) => `<article id="${question.id}-print" class="print-answer-card"><h3>${index + 1}. ${escapeHtml(question.question)}</h3><ol>${Object.entries(question.choices).map(([key, value]) => `<li><strong>${key}</strong>. ${escapeHtml(value)}</li>`).join("")}</ol><p><strong>정답:</strong> ${escapeHtml(question.correctChoice)}</p><p><strong>해설:</strong> ${escapeHtml(question.explanation)}</p><p><strong>연결 수업:</strong> <a href="${escapeHtml(question.relatedLessonPath)}">${escapeHtml(question.relatedLessonPath)}</a></p></article>`).join("")}</section>`, input)
    },
    {
      name: "wrong-notes.html",
      title: "오답노트",
      html: pageShell("오답노트", "wrong-notes.html", `<section class="cards">${input.wrongNotes.length === 0 ? "<article><h3>아직 오답이 없습니다.</h3><p>퀴즈를 풀면 이곳에 복습 자료가 쌓입니다.</p></article>" : input.wrongNotes.map((note) => `<article id="${note.questionId}"><h3>${escapeHtml(note.question)}</h3><p>내 답: ${note.selectedChoice} / 정답: ${note.correctChoice}</p><p>${escapeHtml(note.reviewText)}</p><h4>미니 강의</h4><p>${escapeHtml(note.miniLesson)}</p><label><input type="checkbox"> 복습 완료</label></article>`).join("")}</section>`, input)
    }
  ];

  const assets = {
    "assets/style.css": styleCss(),
    "assets/app.js": appJs(),
    "assets/component-graph.mmd": input.componentGraphReport.mermaid,
    "assets/learning-path.tour.json": learningPathTourJson(input, learningPath)
  };
  const pageEntries = pages.map((page) => ({
    name: page.name,
    path: `html/${page.name}`,
    title: page.title,
    bytes: byteLength(page.html),
    sha256: sha256(page.html)
  }));
  const assetEntries = Object.entries(assets).map(([assetPath, content]) => ({
    path: assetPath,
    bytes: byteLength(content),
    sha256: sha256(content)
  }));

  const manifest: HtmlExportManifest = {
    sessionId: input.session.sessionId,
    generatedAt: new Date().toISOString(),
    manifestPath: "html/manifest.json",
    readmePath: "html/EXPORT-README.md",
    entrypoints: [
      { label: "학습 시작", path: "html/index.html", description: "전체 학습 리포트의 시작 페이지입니다." },
      { label: "퀴즈", path: "html/quiz.html", description: "오프라인 브라우저 복습 문제를 풉니다." },
      { label: "퀴즈 정답지", path: "html/quiz-print.html", description: "인쇄용 질문, 선택지, 정답, 해설을 확인합니다." },
      { label: "오답노트", path: "html/wrong-notes.html", description: "틀린 문제를 다시 보는 페이지입니다." },
      { label: "소스 근거 인덱스", path: "html/evidence.html", description: "파일 수업 근거와 복사된 원본 소스 파일을 함께 탐색합니다." },
      { label: "추천 읽기", path: "html/suggested-reads.html", description: "먼저 읽을 핵심 파일을 source-backed 순서로 확인합니다." },
      { label: "실행 환경", path: "html/runtime-environment.html", description: "설치, 런타임, Docker/Compose 신호를 확인합니다." },
      { label: "인터페이스 맵", path: "html/interface-map.html", description: "Route/page/API/component 신호와 data-flow 힌트를 확인합니다." },
      { label: "세션 검증", path: "html/session-verification.html", description: "생성 산출물과 무결성 검증 리포트를 확인합니다." },
      { label: "컴포넌트 그래프", path: "html/component-graph.html", description: "큰 저장소의 폴더, 파일, 용어, 재구현 단계를 탐색합니다." }
    ],
    pages: pageEntries,
    assets: assetEntries,
    integrity: {
      algorithm: "sha256",
      coveredFiles: pageEntries.length + assetEntries.length
    }
  };

  return { pages, assets, manifest };
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function coverageEvidenceFor(report: CoverageReport): Pick<CoverageReport, "evidenceBackedFiles" | "evidenceCoverageRatio" | "evidenceKindCounts" | "filesWithoutEvidence"> {
  const maybeReport = report as CoverageReport & Partial<Pick<CoverageReport, "evidenceBackedFiles" | "evidenceCoverageRatio" | "evidenceKindCounts" | "filesWithoutEvidence">>;
  return {
    evidenceBackedFiles: maybeReport.evidenceBackedFiles ?? 0,
    evidenceCoverageRatio: maybeReport.evidenceCoverageRatio ?? 0,
    evidenceKindCounts: maybeReport.evidenceKindCounts ?? {},
    filesWithoutEvidence: maybeReport.filesWithoutEvidence ?? []
  };
}

function evidenceKindList(counts: Record<string, number>): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([kind, count]) => `${kind}: ${count}`);
}

function coverageDeltaFor(report: IncrementalReport): IncrementalReport["coverageDelta"] {
  return report.coverageDelta ?? {
    baselineCoverageRatio: null,
    currentCoverageRatio: 0,
    coverageRatioDelta: null,
    baselineCoveredImportantFiles: null,
    currentCoveredImportantFiles: 0,
    coveredImportantFilesDelta: null,
    baselineTotalScannedFiles: null,
    currentTotalScannedFiles: 0,
    totalScannedFilesDelta: null,
    summary: "이 세션은 coverage delta 필드가 추가되기 전에 생성되어 커버리지 변화량을 표시하지 않습니다."
  };
}

function formatPercentOrNone(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%`;
}

function formatPointDelta(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%p`;
}

function graphSummaryFor(report: ComponentGraphReport): ComponentGraphReport["summary"] {
  const maybeReport = report as ComponentGraphReport & { summary?: ComponentGraphReport["summary"] };
  if (maybeReport.summary) return maybeReport.summary;
  const nodeTypeCounts = countBy(report.nodes.map((node) => node.type));
  const edgeLabelCounts = countBy(report.edges.map((edge) => edge.label));
  const degree = new Map<string, number>();
  for (const edge of report.edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }
  return {
    totalNodes: report.nodes.length,
    totalEdges: report.edges.length,
    nodeTypeCounts,
    edgeLabelCounts,
    topConnectedNodes: report.nodes
      .map((node) => ({ id: node.id, label: node.label, type: node.type, degree: degree.get(node.id) ?? 0 }))
      .sort((a, b) => b.degree - a.degree || a.label.localeCompare(b.label))
      .slice(0, 8),
    largeRepoAdvice: "이 세션은 graph summary 필드가 추가되기 전에 생성되어 HTML에서 요약을 재계산했습니다."
  };
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function graphFilterButtons(nodes: ComponentGraphReport["nodes"]): string {
  const labels: Record<ComponentGraphReport["nodes"][number]["type"] | "all", string> = {
    all: "전체",
    root: "루트",
    folder: "폴더",
    file: "파일",
    term: "용어",
    "rebuild-step": "재구현"
  };
  const counts = new Map<string, number>();
  for (const node of nodes) counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
  const types = ["all", "root", "folder", "file", "term", "rebuild-step"] as const;
  return types.map((type) => {
    const count = type === "all" ? nodes.length : counts.get(type) ?? 0;
    return `<button type="button" class="${type === "all" ? "active" : ""}" data-graph-filter="${type}">${labels[type]} ${count}</button>`;
  }).join("");
}

function componentNodeRelations(nodeId: string, report: ComponentGraphReport): string {
  const labels = new Map(report.nodes.map((node) => [node.id, node.label]));
  const rows = report.edges
    .flatMap((edge) => {
      if (edge.from === nodeId) {
        return [{ direction: "outgoing", targetId: edge.to, text: `outgoing -> ${labels.get(edge.to) ?? edge.to}: ${edge.label}` }];
      }
      if (edge.to === nodeId) {
        return [{ direction: "incoming", targetId: edge.from, text: `incoming <- ${labels.get(edge.from) ?? edge.from}: ${edge.label}` }];
      }
      return [];
    })
    .slice(0, 8);
  if (rows.length === 0) return "<h4>연결 관계</h4><p class=\"muted\">직접 연결된 관계가 없습니다.</p>";
  return `<h4>연결 관계</h4><ul class="component-node-relations">${rows.map((row) => `<li data-node-relation="${row.direction}"><a data-node-link="${escapeHtml(row.targetId)}" href="#${componentNodeAnchor(row.targetId)}">${escapeHtml(row.text)}</a></li>`).join("")}</ul>`;
}

function componentNodeAnchor(nodeId: string): string {
  return `component-node-${htmlAnchor(nodeId)}`;
}

function learningPathFor(input: StudyHtmlInput): Array<{ title: string; href: string; goal: string; evidence: string }> {
  return [
    {
      title: "프로젝트 목적 확인",
      href: "index.html",
      goal: input.purposeReport.oneLineSummary,
      evidence: `대상 사용자 ${input.purposeReport.targetUsers.length}개, 문제 정의 ${input.purposeReport.solvedProblems.length}개`
    },
    {
      title: "언어와 의존성 파악",
      href: "language.html",
      goal: `${input.languageReport.primaryLanguage} 중심의 기술 스택을 먼저 확인합니다.`,
      evidence: `manifest ${input.dependencyReport.manifests.length}개`
    },
    {
      title: "실행 환경 신호 확인",
      href: "runtime-environment.html",
      goal: "설치, 런타임, Docker/Compose 단서를 보고 프로젝트를 어떻게 실행할지 추정합니다.",
      evidence: `setup ${input.runtimeEnvironmentReport.setupSignals.length}개, container ${input.runtimeEnvironmentReport.containerSignals.length}개`
    },
    {
      title: "인터페이스와 데이터 흐름 확인",
      href: "interface-map.html",
      goal: "Route/page/API/component 신호를 연결해 사용자가 들어오는 경로와 데이터 이동을 추적합니다.",
      evidence: `route ${input.interfaceMapReport.routeSignals.length}개, API ${input.interfaceMapReport.apiSignals.length}개`
    },
    {
      title: "폴더와 핵심 파일 훑기",
      href: "files.html",
      goal: "핵심 파일 수업으로 진입점과 주변 파일을 연결합니다.",
      evidence: `폴더 수업 ${input.folderLessons.length}개, 파일 수업 ${input.fileLessons.length}개`
    },
    {
      title: "소스 근거 대조",
      href: "evidence.html",
      goal: "설명과 복사된 원본 소스가 어떻게 연결되는지 확인합니다.",
      evidence: `소스 근거 ${input.fileLessons.reduce((sum, lesson) => sum + (lesson.sourceEvidence ?? []).length, 0)}개`
    },
    {
      title: "컴포넌트 그래프 따라가기",
      href: "component-graph.html",
      goal: "폴더, 파일, 용어, 재구현 단계의 관계를 그래프로 추적합니다.",
      evidence: `노드 ${input.componentGraphReport.nodes.length}개, 관계 ${input.componentGraphReport.edges.length}개`
    },
    {
      title: "맨땅 재구현 순서 보기",
      href: "rebuild.html",
      goal: "학습 내용을 구현 순서로 재배열합니다.",
      evidence: `재구현 단계 ${input.rebuildRoadmap.steps.length}개`
    },
    {
      title: "퀴즈로 복습",
      href: "quiz.html",
      goal: "정답 확인과 오답노트 흐름으로 이해도를 점검합니다.",
      evidence: `퀴즈 ${input.quiz.totalQuestions}문제`
    }
  ];
}

function learningPathTourJson(input: StudyHtmlInput, steps: Array<{ title: string; href: string; goal: string; evidence: string }>): string {
  return `${JSON.stringify({
    title: `${input.session.repo} RepoTutor Learning Path`,
    description: "Portable ordered tour generated from RepoTutor analysis pages.",
    isPrimary: true,
    ref: input.session.commitHash,
    steps: steps.map((step) => ({
      title: step.title,
      description: `${step.goal}\n\nEvidence: ${step.evidence}`,
      file: `html/${step.href}`
    }))
  }, null, 2)}\n`;
}

function quizFilterButtons(questions: Quiz["questions"]): { sectionButtons: string; difficultyButtons: string } {
  return {
    sectionButtons: fileFilterButtons("quiz-section-filter", "전체 섹션", countBy(questions.map((question) => question.section))),
    difficultyButtons: fileFilterButtons("quiz-difficulty-filter", "전체 난이도", countBy(questions.map((question) => question.difficulty)))
  };
}

function fileNavigationFor(files: FileLesson[]): { summary: string; extensionButtons: string; directoryButtons: string; evidenceButtons: string } {
  const extensionCounts = countBy(files.map((file) => fileExtension(file.filePath)));
  const directoryCounts = countBy(files.map((file) => topDirectory(file.filePath)));
  const evidenceCounts = countBy(files.map(sourceEvidenceState));
  return {
    summary: `핵심 파일 ${files.length}개를 확장자, 상위 폴더, 소스 근거 상태 기준으로 좁혀 볼 수 있습니다.`,
    extensionButtons: fileFilterButtons("file-ext-filter", "전체 확장자", extensionCounts),
    directoryButtons: fileFilterButtons("file-dir-filter", "전체 폴더", directoryCounts, 12),
    evidenceButtons: sourceEvidenceFilterButtons(evidenceCounts)
  };
}

function fileFilterButtons(attribute: string, allLabel: string, counts: Record<string, number>, limit = Infinity): string {
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
  const allCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return [
    `<button type="button" class="active" data-${attribute}="all">${escapeHtml(allLabel)} ${allCount}</button>`,
    ...entries.map(([value, count]) => `<button type="button" data-${attribute}="${escapeHtml(value)}">${escapeHtml(value)} ${count}</button>`)
  ].join("");
}

function sourceEvidenceList(items: FileLesson["sourceEvidence"], filePath: string): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 소스 근거가 없습니다.</p>";
  const sourceHref = sourceFileHref(filePath);
  return `<ul class="source-evidence">${items.map((item) => `<li><span class="muted">L${item.line} · ${escapeHtml(item.kind)}</span><code>${escapeHtml(item.snippet)}</code><a class="source-link" href="${sourceHref}">원본 열기</a></li>`).join("")}</ul>`;
}

function evidenceIndexCards(fileLessons: FileLesson[]): string {
  const rows = fileLessons.flatMap((lesson) => (lesson.sourceEvidence ?? []).map((item) => ({ ...item, filePath: lesson.filePath })));
  if (rows.length === 0) return "<article><h3>기록된 소스 근거가 없습니다.</h3><p>핵심 파일 분석을 다시 실행하면 이곳에 근거가 쌓입니다.</p></article>";
  return rows.map((item) => `<article id="${htmlAnchor(`${item.filePath}-${item.line}-${item.kind}`)}" data-evidence-kind="${escapeHtml(item.kind)}"><h3>${escapeHtml(item.filePath)}:L${item.line}</h3><p class="muted">${escapeHtml(item.kind)}</p><code>${escapeHtml(item.snippet)}</code><p><a href="files.html#${htmlAnchor(item.filePath)}">파일 수업</a> · <a class="source-link" href="${sourceFileHref(item.filePath)}">원본 열기</a></p></article>`).join("");
}

function evidenceKindFilterButtons(fileLessons: FileLesson[]): string {
  const counts = countBy(fileLessons.flatMap((lesson) => (lesson.sourceEvidence ?? []).map((item) => item.kind)));
  return fileFilterButtons("evidence-kind-filter", "전체 근거 종류", counts);
}

function linkedFileList(items: string[]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="files.html#${htmlAnchor(item)}">${escapeHtml(item)}</a></li>`).join("")}</ul>`;
}

function interfaceSourceList(items: Array<{ text: string; sourceHref: string }>): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.text)} <a class="interface-source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function sourceEvidenceState(file: FileLesson): "present" | "missing" {
  return (file.sourceEvidence ?? []).length > 0 ? "present" : "missing";
}

function sourceEvidenceLabel(file: FileLesson): string {
  return sourceEvidenceState(file) === "present" ? "소스 근거 있음" : "소스 근거 부족";
}

function sourceEvidenceFilterButtons(counts: Record<string, number>): string {
  const present = counts.present ?? 0;
  const missing = counts.missing ?? 0;
  const total = present + missing;
  return [
    `<button type="button" class="active" data-source-evidence-filter="all">전체 근거 ${total}</button>`,
    `<button type="button" data-source-evidence-filter="present">근거 있음 ${present}</button>`,
    `<button type="button" data-source-evidence-filter="missing">근거 부족 ${missing}</button>`
  ].join("");
}

function fileExtension(filePath: string): string {
  const fileName = filePath.split("/").at(-1) ?? filePath;
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot).toLowerCase() : "no-ext";
}

function topDirectory(filePath: string): string {
  return filePath.includes("/") ? filePath.split("/")[0] : "root";
}

function sourceFileHref(filePath: string): string {
  return `../source/${filePath.split("/").map(encodeURIComponent).join("/")}`;
}

export function styleCss(): string {
  return `:root{color-scheme:light;--bg:#f7f8fa;--panel:#fff;--text:#17202a;--muted:#64748b;--line:#d9e0ea;--accent:#0f766e;--accent-weak:#e6f4f1}*{box-sizing:border-box}body{margin:0;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text);display:grid;grid-template-columns:240px 1fr;min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;padding:20px;border-right:1px solid var(--line);background:#fff}.sidebar strong{display:block;font-size:18px;margin-bottom:16px}.sidebar input{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:6px;margin-bottom:14px}.sidebar nav{display:grid;gap:4px}.sidebar a{color:var(--text);text-decoration:none;padding:8px 10px;border-radius:6px}.sidebar a.active,.sidebar a:hover{background:var(--accent-weak);color:var(--accent)}main{padding:28px;max-width:1180px;width:100%}.page-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.eyebrow{color:var(--accent);font-weight:700;margin:0 0 4px}h1,h2,h3{line-height:1.25;margin:0 0 12px}h1{font-size:32px}.lead{font-size:18px}.meta{display:grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:8px;margin:0}.meta div,.panel,article{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:16px}.meta dt{font-size:12px;color:var(--muted)}.meta dd{margin:0;font-weight:700}.panel{margin-bottom:16px}.grid,.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px}.cards article{min-height:150px}.muted{color:var(--muted)}pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;overflow:auto}.source-evidence{display:grid;gap:8px;padding-left:0;list-style:none}.source-evidence li{display:grid;gap:3px}.source-evidence code,.evidence-index-cards code{display:block;white-space:pre-wrap;background:#f1f5f9;border:1px solid var(--line);border-radius:6px;padding:7px 8px;color:#0f172a}.source-link{width:max-content;color:var(--accent);font-weight:700;text-decoration:none}.source-link:hover{text-decoration:underline}.toolbar{display:flex;flex-wrap:wrap;gap:8px}.toolbar button{border:1px solid var(--line);background:#fff;color:var(--text);border-radius:6px;padding:8px 10px;cursor:pointer}.toolbar button.active,.toolbar button:hover{border-color:var(--accent);background:var(--accent-weak);color:var(--accent)}details{border-top:1px solid var(--line);margin-top:12px;padding-top:10px}.choice-grid{display:grid;gap:8px}.choice{width:100%;text-align:left;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--text);padding:9px 10px;cursor:pointer}.choice.correct{border-color:#15803d;background:#eaf7ee}.choice.wrong{border-color:#b91c1c;background:#fdecec}.choice:disabled{cursor:default;color:var(--text)}@media print{*{print-color-adjust:exact}body{display:block;background:#fff;color:#111;font-size:12pt}.sidebar,.toolbar,.choice{display:none}main{padding:0;max-width:none}.page-header{display:block;border-bottom:1px solid #999;padding-bottom:12px;margin-bottom:16px}.panel,article,.meta div{break-inside:avoid;background:#fff;border-color:#999}a{color:#111}a[href]::after{content:" (" attr(href) ")";font-size:10pt;color:#555}pre{white-space:pre-wrap;color:#111;background:#f5f5f5}}@media(max-width:760px){body{grid-template-columns:1fr}.sidebar{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}main{padding:18px}.page-header{display:block}.meta{grid-template-columns:1fr 1fr}}`;
}

export function appJs(): string {
  return `const search=document.querySelector('#search');let graphType='all';let fileExt='all';let fileDir='all';let sourceEvidence='all';let evidenceKind='all';let quizSection='all';let quizDifficulty='all';function applyVisibility(){const q=search?search.value.toLowerCase():'';document.querySelectorAll('article,.panel').forEach(el=>{const textOk=!q||el.textContent.toLowerCase().includes(q);const nodeType=el.dataset.nodeType;const graphOk=!nodeType||graphType==='all'||nodeType===graphType;const ext=el.dataset.fileExt;const dir=el.dataset.fileDir;const evidence=el.dataset.sourceEvidence;const kind=el.dataset.evidenceKind;const quizSectionValue=el.dataset.quizSection;const quizDifficultyValue=el.dataset.quizDifficulty;const fileOk=(!ext||fileExt==='all'||ext===fileExt)&&(!dir||fileDir==='all'||dir===fileDir)&&(!evidence||sourceEvidence==='all'||evidence===sourceEvidence);const evidenceOk=!kind||evidenceKind==='all'||kind===evidenceKind;const quizOk=(!quizSectionValue||quizSection==='all'||quizSectionValue===quizSection)&&(!quizDifficultyValue||quizDifficulty==='all'||quizDifficultyValue===quizDifficulty);el.style.display=textOk&&graphOk&&fileOk&&evidenceOk&&quizOk?'':'none';});}if(search){search.addEventListener('input',applyVisibility);}document.querySelectorAll('[data-graph-filter]').forEach(btn=>{btn.addEventListener('click',()=>{graphType=btn.dataset.graphFilter||'all';document.querySelectorAll('[data-graph-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-ext-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileExt=btn.dataset.fileExtFilter||'all';document.querySelectorAll('[data-file-ext-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-dir-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileDir=btn.dataset.fileDirFilter||'all';document.querySelectorAll('[data-file-dir-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-source-evidence-filter]').forEach(btn=>{btn.addEventListener('click',()=>{sourceEvidence=btn.dataset.sourceEvidenceFilter||'all';document.querySelectorAll('[data-source-evidence-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-evidence-kind-filter]').forEach(btn=>{btn.addEventListener('click',()=>{evidenceKind=btn.dataset.evidenceKindFilter||'all';document.querySelectorAll('[data-evidence-kind-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-quiz-section-filter]').forEach(btn=>{btn.addEventListener('click',()=>{quizSection=btn.dataset.quizSectionFilter||'all';document.querySelectorAll('[data-quiz-section-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-quiz-difficulty-filter]').forEach(btn=>{btn.addEventListener('click',()=>{quizDifficulty=btn.dataset.quizDifficultyFilter||'all';document.querySelectorAll('[data-quiz-difficulty-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-download-mermaid]').forEach(btn=>{btn.addEventListener('click',()=>{const source=document.getElementById(btn.dataset.downloadMermaid||'');if(!source)return;const blob=new Blob([source.textContent||''],{type:'text/plain'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='component-graph.mmd';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);});});const learningProgressKey='repotutor:learning-path:'+location.pathname;let learningProgress=new Set();try{learningProgress=new Set(JSON.parse(localStorage.getItem(learningProgressKey)||'[]'));}catch{}function saveLearningProgress(){try{localStorage.setItem(learningProgressKey,JSON.stringify([...learningProgress]));}catch{}}const learningProgressSummary=document.querySelector('[data-learning-progress-summary]');function updateLearningProgressSummary(){if(learningProgressSummary){const inputs=document.querySelectorAll('[data-learning-step-complete]');const completed=Array.from(inputs).filter(input=>input.checked).length;learningProgressSummary.textContent='완료 '+completed+' / '+inputs.length;}}document.querySelectorAll('[data-learning-step-complete]').forEach(input=>{const step=input.dataset.learningStepComplete||'';input.checked=learningProgress.has(step);input.addEventListener('change',()=>{if(input.checked){learningProgress.add(step);}else{learningProgress.delete(step);}saveLearningProgress();updateLearningProgressSummary();});});updateLearningProgressSummary();document.querySelectorAll('[data-reset-learning-progress]').forEach(btn=>{btn.addEventListener('click',()=>{learningProgress.clear();saveLearningProgress();document.querySelectorAll('[data-learning-step-complete]').forEach(input=>{input.checked=false;});updateLearningProgressSummary();});});const picked=new Map();const score=document.querySelector('#quiz-live-score');document.querySelectorAll('[data-reset-quiz]').forEach(btn=>{btn.addEventListener('click',()=>{picked.clear();document.querySelectorAll('.choice').forEach(choice=>{choice.disabled=false;choice.classList.remove('correct','wrong');});if(score){score.textContent='아직 선택한 문제가 없습니다.';}});});document.querySelectorAll('.choice').forEach(btn=>{btn.addEventListener('click',()=>{const q=btn.dataset.question;document.querySelectorAll('.choice[data-question="'+q+'"]').forEach(b=>b.disabled=true);const ok=btn.dataset.correct==='true';btn.classList.add(ok?'correct':'wrong');picked.set(q,ok);if(!ok){document.querySelectorAll('.choice[data-question="'+q+'"][data-correct="true"]').forEach(b=>b.classList.add('correct'));}if(score){const total=picked.size;const correct=[...picked.values()].filter(Boolean).length;score.textContent='현재 브라우저 복습 점수: '+correct+' / '+total;}});});`;
}
