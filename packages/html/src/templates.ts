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
  SymbolMapReport,
  ApiReferenceReport,
  SearchIndexReport,
  ContextPackReport,
  McpHandoffReport,
  AgentMemoryReport,
  GraphQueryReport,
  TutorialAbstractionReport,
  DecisionRecordReport,
  DependencyHealthReport,
  LearningJournalReport,
  ProjectActivityReport,
  LicenseRightsReport,
  SbomReport,
  SecurityReadinessReport,
  ScorecardReport,
  ProvenanceReport,
  AdvisoryReport,
  VexReport,
  PolicyGateReport,
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
  symbolMapReport: SymbolMapReport;
  apiReferenceReport: ApiReferenceReport;
  searchIndexReport: SearchIndexReport;
  contextPackReport: ContextPackReport;
  mcpHandoffReport: McpHandoffReport;
  agentMemoryReport: AgentMemoryReport;
  graphQueryReport: GraphQueryReport;
  tutorialAbstractionReport: TutorialAbstractionReport;
  decisionRecordReport: DecisionRecordReport;
  dependencyHealthReport: DependencyHealthReport;
  learningJournalReport: LearningJournalReport;
  projectActivityReport: ProjectActivityReport;
  licenseRightsReport: LicenseRightsReport;
  sbomReport: SbomReport;
  securityReadinessReport: SecurityReadinessReport;
  scorecardReport: ScorecardReport;
  provenanceReport: ProvenanceReport;
  advisoryReport: AdvisoryReport;
  vexReport: VexReport;
  policyGateReport: PolicyGateReport;
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
    ["symbol-map.html", "Symbol Map"],
    ["api-reference.html", "API Reference"],
    ["search-index.html", "Search Index"],
    ["learning-journal.html", "Learning Journal"],
    ["project-activity.html", "Project Activity"],
    ["license-rights.html", "License Rights"],
    ["sbom.html", "SBOM"],
    ["security-readiness.html", "Security Readiness"],
    ["scorecard.html", "Project Scorecard"],
    ["provenance.html", "Provenance Readiness"],
    ["advisories.html", "Advisory Readiness"],
    ["vex.html", "OpenVEX Readiness"],
    ["policy-gates.html", "Policy Gates"],
    ["context-pack.html", "Context Pack"],
    ["mcp-handoff.html", "MCP Handoff"],
    ["agent-memory.html", "Agent Memory"],
    ["graph-query.html", "Graph Query"],
    ["tutorial-abstractions.html", "Tutorial Abstractions"],
    ["decision-records.html", "Decision Records"],
    ["dependency-health.html", "Dependency Health"],
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
          <article><h3>심볼 맵</h3><p>${escapeHtml(input.symbolMapReport.summary)}</p><p>codebase-map 패턴으로 함수/클래스/상수 신호를 모읍니다.</p><a href="symbol-map.html">심볼 맵 열기</a></article>
          <article><h3>API Reference</h3><p>${escapeHtml(input.apiReferenceReport.summary)}</p><p>TypeDoc 패턴으로 entry point, ReflectionKind, public export surface를 정리합니다.</p><a href="api-reference.html">API Reference 열기</a></article>
          <article><h3>Search Index</h3><p>${escapeHtml(input.searchIndexReport.summary)}</p><p>Pagefind 패턴으로 generated page, file lesson, folder lesson을 검색 가능한 문서 단위로 나눕니다.</p><a href="search-index.html">Search Index 열기</a></article>
          <article><h3>Learning Journal</h3><p>${escapeHtml(input.learningJournalReport.summary)}</p><p>learn-codebase 패턴으로 예측 질문, mastery map, spaced review queue를 남깁니다.</p><a href="learning-journal.html">Learning Journal 열기</a></article>
          <article><h3>Project Activity</h3><p>${escapeHtml(input.projectActivityReport.summary)}</p><p>Repowise 패턴으로 snapshot-only activity, hotspot, dead-code, decision queue를 묶습니다.</p><a href="project-activity.html">Project Activity 열기</a></article>
          <article><h3>License Rights</h3><p>${escapeHtml(input.licenseRightsReport.summary)}</p><p>Licensee 패턴으로 license file, package metadata, README 참조를 분리합니다.</p><a href="license-rights.html">License Rights 열기</a></article>
          <article><h3>SBOM</h3><p>${escapeHtml(input.sbomReport.summary)}</p><p>Syft 패턴으로 source descriptor, package artifacts, file artifacts, relationships를 inventory로 묶습니다.</p><a href="sbom.html">SBOM 열기</a></article>
          <article><h3>Security Readiness</h3><p>${escapeHtml(input.securityReadinessReport.summary)}</p><p>Trivy 패턴으로 targets, scanners, security signals, action queue를 분리합니다.</p><a href="security-readiness.html">Security Readiness 열기</a></article>
          <article><h3>Project Scorecard</h3><p>${escapeHtml(input.scorecardReport.summary)}</p><p>OpenSSF Scorecard 패턴으로 checks, risk, policy findings, remediation queue를 정리합니다.</p><a href="scorecard.html">Project Scorecard 열기</a></article>
          <article><h3>Provenance Readiness</h3><p>${escapeHtml(input.provenanceReport.summary)}</p><p>Cosign 패턴으로 signature material, bundle, attestation, identity requirement를 정리합니다.</p><a href="provenance.html">Provenance Readiness 열기</a></article>
          <article><h3>Advisory Query Readiness</h3><p>${escapeHtml(input.advisoryReport.summary)}</p><p>OSV-Scanner 패턴으로 package advisory query target, lockfile, ignore policy를 정리합니다.</p><a href="advisories.html">Advisory Readiness 열기</a></article>
          <article><h3>OpenVEX Impact Readiness</h3><p>${escapeHtml(input.vexReport.summary)}</p><p>OpenVEX 패턴으로 product, vulnerability input, status justification, SARIF filter 준비도를 정리합니다.</p><a href="vex.html">OpenVEX Readiness 열기</a></article>
          <article><h3>Policy Gate Readiness</h3><p>${escapeHtml(input.policyGateReport.summary)}</p><p>OPA 패턴으로 Rego policy, input/data fixture, test, bundle, decision output 준비도를 정리합니다.</p><a href="policy-gates.html">Policy Gates 열기</a></article>
          <article><h3>Context Pack</h3><p>${escapeHtml(input.contextPackReport.summary)}</p><p>Repomix 패턴으로 LLM에 넣을 파일과 token budget을 확인합니다.</p><a href="context-pack.html">Context Pack 열기</a></article>
          <article><h3>MCP Handoff</h3><p>${escapeHtml(input.mcpHandoffReport.summary)}</p><p>codebase-mcp 패턴으로 AI 도구에 넘길 tool/prompt를 정리합니다.</p><a href="mcp-handoff.html">MCP Handoff 열기</a></article>
          <article><h3>Agent Memory</h3><p>${escapeHtml(input.agentMemoryReport.summary)}</p><p>Obsidian/Graphify 패턴으로 다음 AI 세션이 먼저 읽을 기억 노트를 만듭니다.</p><a href="agent-memory.html">Agent Memory 열기</a></article>
          <article><h3>Graph Query</h3><p>${escapeHtml(input.graphQueryReport.summary)}</p><p>Graphify 패턴으로 query/path/explain 질문을 준비합니다.</p><a href="graph-query.html">Graph Query 열기</a></article>
          <article><h3>Tutorial Abstractions</h3><p>${escapeHtml(input.tutorialAbstractionReport.summary)}</p><p>PocketFlow 패턴으로 핵심 추상화, 관계, 장 순서를 정리합니다.</p><a href="tutorial-abstractions.html">Tutorial Abstractions 열기</a></article>
          <article><h3>Decision Records</h3><p>${escapeHtml(input.decisionRecordReport.summary)}</p><p>Log4brains 패턴으로 Context, Decision, Status, Consequences를 정리합니다.</p><a href="decision-records.html">Decision Records 열기</a></article>
          <article><h3>Dependency Health</h3><p>${escapeHtml(input.dependencyHealthReport.summary)}</p><p>dependency-cruiser 패턴으로 no-circular, no-orphans, fan-in/fan-out을 확인합니다.</p><a href="dependency-health.html">Dependency Health 열기</a></article>
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
      name: "symbol-map.html",
      title: "심볼 맵",
      html: pageShell("심볼 맵", "symbol-map.html", `<section class="panel" data-source-pattern="codebase-map"><h2>함수/클래스/상수 인덱스</h2><p>${escapeHtml(input.symbolMapReport.summary)}</p><p class="muted">${escapeHtml(input.symbolMapReport.sourcePattern)}</p></section><section class="grid"><article class="symbol-map-card"><h3>종류별 개수</h3>${list(Object.entries(input.symbolMapReport.symbolsByKind).map(([kind, count]) => `${kind}: ${count}`))}</article><article class="symbol-map-card"><h3>심볼이 많은 파일</h3>${list(input.symbolMapReport.filesWithSymbols.map((item) => `${item.filePath}: ${item.count}개`))}</article><article class="symbol-map-card"><h3>다음 확인 단계</h3>${list(input.symbolMapReport.learnerNextSteps)}</article></section><section class="cards symbol-map-cards">${symbolCards(input.symbolMapReport.symbols)}</section>`, input)
    },
    {
      name: "api-reference.html",
      title: "API Reference",
      html: pageShell("API Reference", "api-reference.html", `<section class="panel" data-source-pattern="TypeDoc"><h2>Public API Reference</h2><p>${escapeHtml(input.apiReferenceReport.summary)}</p><p class="muted">${escapeHtml(input.apiReferenceReport.sourcePattern)}</p><dl class="meta"><div><dt>entry points</dt><dd>${input.apiReferenceReport.entryPoints.length}</dd></div><div><dt>public symbols</dt><dd>${input.apiReferenceReport.publicSymbols.length}</dd></div><div><dt>ReflectionKind</dt><dd>${Object.keys(input.apiReferenceReport.kindCounts).length}</dd></div><div><dt>export warnings</dt><dd>${input.apiReferenceReport.exportWarnings.length}</dd></div></dl></section><section class="grid"><article class="api-reference-card"><h3>Entry Points</h3>${apiEntryPointList(input.apiReferenceReport.entryPoints)}</article><article class="api-reference-card"><h3>Kind Counts</h3>${list(Object.entries(input.apiReferenceReport.kindCounts).map(([kind, count]) => `${kind}: ${count}`))}</article><article class="api-reference-card"><h3>Category Counts</h3>${list(Object.entries(input.apiReferenceReport.categoryCounts).map(([category, count]) => `${category}: ${count}`))}</article><article class="api-reference-card"><h3>Export Warnings</h3>${apiWarningList(input.apiReferenceReport.exportWarnings)}</article></section><section class="cards api-reference-cards">${apiReferenceCards(input.apiReferenceReport.publicSymbols)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.apiReferenceReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "search-index.html",
      title: "Search Index",
      html: pageShell("Search Index", "search-index.html", `<section class="panel" data-source-pattern="Pagefind"><h2>Static Search Index</h2><p>${escapeHtml(input.searchIndexReport.summary)}</p><p class="muted">${escapeHtml(input.searchIndexReport.sourcePattern)}</p><dl class="meta"><div><dt>PageFragmentData</dt><dd>${input.searchIndexReport.totalDocuments}</dd></div><div><dt>MetaIndex terms</dt><dd>${input.searchIndexReport.totalTerms}</dd></div><div><dt>filters</dt><dd>${input.searchIndexReport.filterIndex.length}</dd></div><div><dt>metaFields</dt><dd>${input.searchIndexReport.metadataFields.length}</dd></div></dl><p><a href="assets/search-index.json">assets/search-index.json 열기</a></p></section><section class="grid"><article class="search-index-card"><h3>Filters</h3>${searchFilterList(input.searchIndexReport.filterIndex)}</article><article class="search-index-card"><h3>Metadata Fields</h3>${list(input.searchIndexReport.metadataFields)}</article><article class="search-index-card"><h3>Top Terms</h3>${searchTermList(input.searchIndexReport.termIndex.slice(0, 25))}</article><article class="search-index-card"><h3>다음 확인 단계</h3>${list(input.searchIndexReport.learnerNextSteps)}</article></section><section class="cards search-index-cards">${searchDocumentCards(input.searchIndexReport.documents)}</section>`, input)
    },
    {
      name: "learning-journal.html",
      title: "Learning Journal",
      html: pageShell("Learning Journal", "learning-journal.html", `<section class="panel" data-source-pattern="learn-codebase"><h2>Active Recall Journal</h2><p>${escapeHtml(input.learningJournalReport.summary)}</p><p class="muted">${escapeHtml(input.learningJournalReport.sourcePattern)}</p><dl class="meta"><div><dt>openQuestions</dt><dd>${input.learningJournalReport.openQuestions.length}</dd></div><div><dt>spacedReview</dt><dd>${input.learningJournalReport.spacedReviewQueue.length}</dd></div><div><dt>masteryLevels</dt><dd>${input.learningJournalReport.masteryLevels.length}</dd></div><div><dt>socraticPrompts</dt><dd>${input.learningJournalReport.socraticPrompts.length}</dd></div></dl><p><a href="assets/learning-journal-template.md">learning-journal-template.md 열기</a></p></section><section class="grid"><article class="learning-journal-card"><h3>Focus & Goals</h3>${learningFocusList(input.learningJournalReport.focusGoals)}</article><article class="learning-journal-card"><h3>Spaced Review Queue</h3>${learningReviewList(input.learningJournalReport.spacedReviewQueue)}</article><article class="learning-journal-card"><h3>Aha Moments</h3>${learningAhaList(input.learningJournalReport.ahaMoments)}</article><article class="learning-journal-card"><h3>다음 확인 단계</h3>${list(input.learningJournalReport.learnerNextSteps)}</article></section><section class="cards learning-journal-cards">${learningMasteryCards(input.learningJournalReport.masteryLevels)}${learningQuestionCards(input.learningJournalReport.openQuestions)}${learningPromptCards(input.learningJournalReport.socraticPrompts)}</section>`, input)
    },
    {
      name: "project-activity.html",
      title: "Project Activity",
      html: pageShell("Project Activity", "project-activity.html", `<section class="panel" data-source-pattern="Repowise"><h2>Project Activity Snapshot</h2><p>${escapeHtml(input.projectActivityReport.summary)}</p><p class="muted">${escapeHtml(input.projectActivityReport.sourcePattern)}</p><dl class="meta"><div><dt>history mode</dt><dd>${escapeHtml(input.projectActivityReport.historyAvailability.mode)}</dd></div><div><dt>branch</dt><dd>${escapeHtml(input.projectActivityReport.historyAvailability.branch ?? "unknown")}</dd></div><div><dt>commit</dt><dd>${escapeHtml(input.projectActivityReport.historyAvailability.commitHash?.slice(0, 12) ?? "unknown")}</dd></div><div><dt>hotspots</dt><dd>${input.projectActivityReport.hotspotCandidates.length}</dd></div></dl><p>${escapeHtml(input.projectActivityReport.historyAvailability.reason)}</p></section><section class="grid"><article class="project-activity-card"><h3>Activity Signals</h3>${projectActivitySignalList(input.projectActivityReport.activitySignals)}</article><article class="project-activity-card"><h3>Review Queues</h3>${projectActivityQueueList(input.projectActivityReport.reviewQueues)}</article><article class="project-activity-card"><h3>Decision Prompts</h3>${projectActivityDecisionPromptList(input.projectActivityReport.architectureDecisionPrompts)}</article><article class="project-activity-card"><h3>다음 확인 단계</h3>${list(input.projectActivityReport.learnerNextSteps)}</article></section><section class="cards project-activity-hotspots">${projectActivityHotspotCards(input.projectActivityReport.hotspotCandidates)}</section><section class="cards project-activity-dead-code">${projectActivityDeadCodeCards(input.projectActivityReport.deadCodeCandidates)}</section>`, input)
    },
    {
      name: "license-rights.html",
      title: "License Rights",
      html: pageShell("License Rights", "license-rights.html", `<section class="panel" data-source-pattern="Licensee"><h2>License Rights Snapshot</h2><p>${escapeHtml(input.licenseRightsReport.summary)}</p><p class="muted">${escapeHtml(input.licenseRightsReport.sourcePattern)}</p><dl class="meta"><div><dt>detected</dt><dd>${escapeHtml(input.licenseRightsReport.detectedProjectLicense.spdxId ?? "unknown")}</dd></div><div><dt>confidence</dt><dd>${input.licenseRightsReport.detectedProjectLicense.confidence}</dd></div><div><dt>license files</dt><dd>${input.licenseRightsReport.licenseFiles.length}</dd></div><div><dt>warnings</dt><dd>${input.licenseRightsReport.reviewWarnings.length}</dd></div></dl><p>${escapeHtml(input.licenseRightsReport.detectedProjectLicense.evidence)}</p></section><section class="grid"><article class="license-rights-card"><h3>Rights Checklist</h3>${licenseChecklistList(input.licenseRightsReport.rightsChecklist)}</article><article class="license-rights-card"><h3>Review Warnings</h3>${licenseWarningList(input.licenseRightsReport.reviewWarnings)}</article><article class="license-rights-card"><h3>Package Metadata</h3>${packageLicenseList(input.licenseRightsReport.packageLicenseSignals)}</article><article class="license-rights-card"><h3>README References</h3>${readmeLicenseList(input.licenseRightsReport.readmeLicenseReferences)}</article></section><section class="cards license-file-cards">${licenseFileCards(input.licenseRightsReport.licenseFiles)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.licenseRightsReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "sbom.html",
      title: "SBOM",
      html: pageShell("SBOM", "sbom.html", `<section class="panel" data-source-pattern="Syft"><h2>SBOM Snapshot</h2><p>${escapeHtml(input.sbomReport.summary)}</p><p class="muted">${escapeHtml(input.sbomReport.sourcePattern)}</p><dl class="meta"><div><dt>manifests</dt><dd>${input.sbomReport.packageManifests.length}</dd></div><div><dt>packages</dt><dd>${input.sbomReport.packageArtifacts.length}</dd></div><div><dt>files</dt><dd>${input.sbomReport.fileArtifacts.length}</dd></div><div><dt>relationships</dt><dd>${input.sbomReport.relationships.length}</dd></div></dl><p>Descriptor: ${escapeHtml(input.sbomReport.sourceDescriptor.descriptorName)} v${escapeHtml(input.sbomReport.sourceDescriptor.descriptorVersion)} · commit ${escapeHtml(input.sbomReport.sourceDescriptor.commitHash?.slice(0, 12) ?? "unknown")}</p></section><section class="grid"><article class="sbom-card"><h3>Package Manifests</h3>${sbomManifestList(input.sbomReport.packageManifests)}</article><article class="sbom-card"><h3>Output Formats</h3>${sbomOutputFormatList(input.sbomReport.outputFormats)}</article><article class="sbom-card"><h3>Review Warnings</h3>${sbomWarningList(input.sbomReport.reviewWarnings)}</article><article class="sbom-card"><h3>다음 확인 단계</h3>${list(input.sbomReport.learnerNextSteps)}</article></section><section class="cards sbom-package-cards">${sbomPackageCards(input.sbomReport.packageArtifacts)}</section><section class="cards sbom-file-cards">${sbomFileCards(input.sbomReport.fileArtifacts)}</section><section class="panel"><h2>Relationships</h2>${sbomRelationshipList(input.sbomReport.relationships)}</section>`, input)
    },
    {
      name: "security-readiness.html",
      title: "Security Readiness",
      html: pageShell("Security Readiness", "security-readiness.html", `<section class="panel" data-source-pattern="Trivy"><h2>Security Readiness Snapshot</h2><p>${escapeHtml(input.securityReadinessReport.summary)}</p><p class="muted">${escapeHtml(input.securityReadinessReport.sourcePattern)}</p><dl class="meta"><div><dt>targets</dt><dd>${input.securityReadinessReport.scannerTargets.length}</dd></div><div><dt>scanners</dt><dd>${input.securityReadinessReport.scannerCoverage.length}</dd></div><div><dt>signals</dt><dd>${input.securityReadinessReport.securitySignals.length}</dd></div><div><dt>actions</dt><dd>${input.securityReadinessReport.actionQueue.length}</dd></div></dl></section><section class="grid"><article class="security-readiness-card"><h3>Scanner Targets</h3>${securityTargetList(input.securityReadinessReport.scannerTargets)}</article><article class="security-readiness-card"><h3>Scanner Coverage</h3>${securityCoverageList(input.securityReadinessReport.scannerCoverage)}</article><article class="security-readiness-card"><h3>Action Queue</h3>${securityActionList(input.securityReadinessReport.actionQueue)}</article><article class="security-readiness-card"><h3>Recommended Commands</h3>${securityCommandList(input.securityReadinessReport.recommendedCommands)}</article></section><section class="cards security-signal-cards">${securitySignalCards(input.securityReadinessReport.securitySignals)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.securityReadinessReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "scorecard.html",
      title: "Project Scorecard",
      html: pageShell("Project Scorecard", "scorecard.html", `<section class="panel" data-source-pattern="OpenSSF Scorecard"><h2>Scorecard Snapshot</h2><p>${escapeHtml(input.scorecardReport.summary)}</p><p class="muted">${escapeHtml(input.scorecardReport.sourcePattern)}</p><dl class="meta"><div><dt>aggregate</dt><dd>${input.scorecardReport.aggregateScore}/10</dd></div><div><dt>checks</dt><dd>${input.scorecardReport.checks.length}</dd></div><div><dt>policies</dt><dd>${input.scorecardReport.policyFindings.length}</dd></div><div><dt>risk queue</dt><dd>${input.scorecardReport.riskQueue.length}</dd></div></dl></section><section class="grid"><article class="scorecard-card"><h3>Category Scores</h3>${scorecardCategoryList(input.scorecardReport.categoryScores)}</article><article class="scorecard-card"><h3>Policy Findings</h3>${scorecardPolicyList(input.scorecardReport.policyFindings)}</article><article class="scorecard-card"><h3>Risk Queue</h3>${scorecardRiskList(input.scorecardReport.riskQueue)}</article><article class="scorecard-card"><h3>Structured Results</h3>${scorecardStructuredList(input.scorecardReport.structuredResults)}</article></section><section class="cards scorecard-check-cards">${scorecardCheckCards(input.scorecardReport.checks)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.scorecardReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "provenance.html",
      title: "Provenance Readiness",
      html: pageShell("Provenance Readiness", "provenance.html", `<section class="panel" data-source-pattern="Cosign"><h2>Provenance Snapshot</h2><p>${escapeHtml(input.provenanceReport.summary)}</p><p class="muted">${escapeHtml(input.provenanceReport.sourcePattern)}</p><dl class="meta"><div><dt>artifacts</dt><dd>${input.provenanceReport.artifactSignals.length}</dd></div><div><dt>signatures</dt><dd>${input.provenanceReport.signatureSignals.length}</dd></div><div><dt>attestations</dt><dd>${input.provenanceReport.attestationSignals.length}</dd></div><div><dt>identity</dt><dd>${input.provenanceReport.identityRequirements.length}</dd></div></dl></section><section class="grid"><article class="provenance-card"><h3>Artifact Signals</h3>${provenanceArtifactList(input.provenanceReport.artifactSignals)}</article><article class="provenance-card"><h3>Signature Material</h3>${provenanceSignatureList(input.provenanceReport.signatureSignals)}</article><article class="provenance-card"><h3>Identity Requirements</h3>${provenanceIdentityList(input.provenanceReport.identityRequirements)}</article><article class="provenance-card"><h3>Risk Queue</h3>${provenanceRiskList(input.provenanceReport.riskQueue)}</article></section><section class="cards provenance-attestation-cards">${provenanceAttestationCards(input.provenanceReport.attestationSignals)}</section><section class="panel"><h2>Verification Commands</h2>${provenanceCommandList(input.provenanceReport.verificationCommands)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.provenanceReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "advisories.html",
      title: "Advisory Query Readiness",
      html: pageShell("Advisory Query Readiness", "advisories.html", `<section class="panel" data-source-pattern="OSV-Scanner"><h2>Advisory Query Snapshot</h2><p>${escapeHtml(input.advisoryReport.summary)}</p><p class="muted">${escapeHtml(input.advisoryReport.sourcePattern)}</p><dl class="meta"><div><dt>targets</dt><dd>${input.advisoryReport.packageQueryTargets.length}</dd></div><div><dt>lockfiles</dt><dd>${input.advisoryReport.lockfileSignals.length}</dd></div><div><dt>sources</dt><dd>${input.advisoryReport.advisorySources.length}</dd></div><div><dt>policies</dt><dd>${input.advisoryReport.policyControls.length}</dd></div></dl></section><section class="grid"><article class="advisory-card"><h3>Advisory Sources</h3>${advisorySourceList(input.advisoryReport.advisorySources)}</article><article class="advisory-card"><h3>Policy Controls</h3>${advisoryPolicyList(input.advisoryReport.policyControls)}</article><article class="advisory-card"><h3>Result Model</h3>${advisoryResultList(input.advisoryReport.resultModel)}</article><article class="advisory-card"><h3>Remediation Queue</h3>${advisoryRiskList(input.advisoryReport.remediationQueue)}</article></section><section class="cards advisory-target-cards">${advisoryTargetCards(input.advisoryReport.packageQueryTargets)}</section><section class="grid"><article class="advisory-card"><h3>Lockfile Signals</h3>${advisoryLockfileList(input.advisoryReport.lockfileSignals)}</article><article class="advisory-card"><h3>Recommended Commands</h3>${advisoryCommandList(input.advisoryReport.recommendedCommands)}</article><article class="advisory-card"><h3>다음 확인 단계</h3>${list(input.advisoryReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "vex.html",
      title: "OpenVEX Impact Readiness",
      html: pageShell("OpenVEX Impact Readiness", "vex.html", `<section class="panel" data-source-pattern="OpenVEX"><h2>OpenVEX Snapshot</h2><p>${escapeHtml(input.vexReport.summary)}</p><p class="muted">${escapeHtml(input.vexReport.sourcePattern)}</p><dl class="meta"><div><dt>products</dt><dd>${input.vexReport.productTargets.length}</dd></div><div><dt>inputs</dt><dd>${input.vexReport.vulnerabilityInputs.length}</dd></div><div><dt>statuses</dt><dd>${input.vexReport.statusMatrix.length}</dd></div><div><dt>workflow</dt><dd>${input.vexReport.documentWorkflow.length}</dd></div></dl><p class="muted">RepoTutor records readiness metadata only. It does not claim any actual vulnerability status.</p></section><section class="grid"><article class="vex-card"><h3>Vulnerability Inputs</h3>${vexInputList(input.vexReport.vulnerabilityInputs)}</article><article class="vex-card"><h3>Status Matrix</h3>${vexStatusList(input.vexReport.statusMatrix)}</article><article class="vex-card"><h3>Justification Catalog</h3>${vexJustificationList(input.vexReport.justificationCatalog)}</article><article class="vex-card"><h3>Risk Queue</h3>${vexRiskList(input.vexReport.riskQueue)}</article></section><section class="cards vex-product-cards">${vexProductCards(input.vexReport.productTargets)}</section><section class="grid"><article class="vex-card"><h3>Statement Drafts</h3>${vexStatementList(input.vexReport.statementDrafts)}</article><article class="vex-card"><h3>Document Workflow</h3>${vexWorkflowList(input.vexReport.documentWorkflow)}</article><article class="vex-card"><h3>Attestation Readiness</h3>${vexAttestationList(input.vexReport.attestationReadiness)}</article><article class="vex-card"><h3>다음 확인 단계</h3>${list(input.vexReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "policy-gates.html",
      title: "Policy Gate Readiness",
      html: pageShell("Policy Gate Readiness", "policy-gates.html", `<section class="panel" data-source-pattern="OPA"><h2>Policy Gate Snapshot</h2><p>${escapeHtml(input.policyGateReport.summary)}</p><p class="muted">${escapeHtml(input.policyGateReport.sourcePattern)}</p><dl class="meta"><div><dt>policies</dt><dd>${input.policyGateReport.policyDocuments.length}</dd></div><div><dt>inputs</dt><dd>${input.policyGateReport.inputDocuments.length}</dd></div><div><dt>queries</dt><dd>${input.policyGateReport.gateQueries.length}</dd></div><div><dt>bundle reqs</dt><dd>${input.policyGateReport.bundleReadiness.length}</dd></div></dl><p class="muted">RepoTutor records OPA readiness only. It does not evaluate allow, deny, or violation decisions.</p></section><section class="grid"><article class="policy-gate-card"><h3>Gate Queries</h3>${policyGateQueryList(input.policyGateReport.gateQueries)}</article><article class="policy-gate-card"><h3>Test Coverage</h3>${policyCoverageList(input.policyGateReport.testCoverage)}</article><article class="policy-gate-card"><h3>Bundle Readiness</h3>${policyBundleList(input.policyGateReport.bundleReadiness)}</article><article class="policy-gate-card"><h3>Decision Outputs</h3>${policyDecisionList(input.policyGateReport.decisionOutputs)}</article></section><section class="cards policy-document-cards">${policyDocumentCards(input.policyGateReport.policyDocuments)}</section><section class="grid"><article class="policy-gate-card"><h3>Input Documents</h3>${policyInputList(input.policyGateReport.inputDocuments)}</article><article class="policy-gate-card"><h3>Recommended Commands</h3>${policyCommandList(input.policyGateReport.recommendedCommands)}</article><article class="policy-gate-card"><h3>Risk Queue</h3>${policyRiskList(input.policyGateReport.riskQueue)}</article><article class="policy-gate-card"><h3>다음 확인 단계</h3>${list(input.policyGateReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "context-pack.html",
      title: "Context Pack",
      html: pageShell("Context Pack", "context-pack.html", `<section class="panel" data-source-pattern="Repomix"><h2>LLM Context Pack 예산</h2><p>${escapeHtml(input.contextPackReport.summary)}</p><p class="muted">${escapeHtml(input.contextPackReport.sourcePattern)}</p><dl class="meta"><div><dt>파일</dt><dd>${input.contextPackReport.totalIncludedFiles}</dd></div><div><dt>bytes</dt><dd>${input.contextPackReport.totalIncludedBytes}</dd></div><div><dt>tokens</dt><dd>${input.contextPackReport.totalEstimatedTokens}</dd></div><div><dt>excluded</dt><dd>${input.contextPackReport.excludedFromPack.length}</dd></div></dl></section><section class="grid"><article class="context-pack-card"><h3>Token Budget</h3>${list(input.contextPackReport.budgetProfiles.map((profile) => `${profile.name}: ${profile.fits ? "fits" : `overflow ${profile.overflowTokens}`} / ${profile.tokenLimit}`))}</article><article class="context-pack-card"><h3>Split Output Plan</h3>${contextSplitPlanList(input.contextPackReport.splitPlans)}</article><article class="context-pack-card"><h3>Directory Token Tree</h3>${list(input.contextPackReport.directoryTokenTree.map((item) => `${item.directory}: ${item.estimatedTokens} tokens · ${item.fileCount} files`))}</article><article class="context-pack-card"><h3>Security Notes</h3>${list(input.contextPackReport.securityNotes)}</article><article class="context-pack-card"><h3>다음 확인 단계</h3>${list(input.contextPackReport.learnerNextSteps)}</article></section><section class="panel"><h2>Pack 제외 항목</h2>${list(input.contextPackReport.excludedFromPack)}</section><section class="cards context-pack-cards">${contextPackCards(input.contextPackReport.topFiles)}</section>`, input)
    },
    {
      name: "mcp-handoff.html",
      title: "MCP Handoff",
      html: pageShell("MCP Handoff", "mcp-handoff.html", `<section class="panel" data-source-pattern="codebase-mcp"><h2>AI/MCP 인계 계획</h2><p>${escapeHtml(input.mcpHandoffReport.summary)}</p><p class="muted">${escapeHtml(input.mcpHandoffReport.sourcePattern)}</p></section><section class="cards mcp-handoff-cards">${mcpToolCards(input.mcpHandoffReport.tools)}</section><section class="cards mcp-prompt-cards">${input.mcpHandoffReport.prompts.map((item) => `<article class="mcp-prompt-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.prompt)}</p><a href="${escapeHtml(htmlPageHref(item.relatedReportHref))}">관련 리포트 열기</a></article>`).join("")}</section><section class="grid"><article class="mcp-handoff-card"><h3>Safety Notes</h3>${list(input.mcpHandoffReport.safetyNotes)}</article><article class="mcp-handoff-card"><h3>다음 확인 단계</h3>${list(input.mcpHandoffReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "agent-memory.html",
      title: "Agent Memory",
      html: pageShell("Agent Memory", "agent-memory.html", `<section class="panel" data-source-pattern="Obsidian Graphify"><h2>Persistent Agent Memory</h2><p>${escapeHtml(input.agentMemoryReport.summary)}</p><p class="muted">${escapeHtml(input.agentMemoryReport.sourcePattern)}</p><dl class="meta"><div><dt>raw tokens</dt><dd>${input.agentMemoryReport.tokenSavings.rawCodeReadTokens}</dd></div><div><dt>graph query target</dt><dd>${input.agentMemoryReport.tokenSavings.graphQueryTokenTarget}</dd></div><div><dt>estimated reduction</dt><dd>${input.agentMemoryReport.tokenSavings.estimatedReductionX}x</dd></div><div><dt>memory notes</dt><dd>${input.agentMemoryReport.memoryNotes.length}</dd></div></dl></section><section class="cards agent-memory-layer-cards">${agentMemoryLayerCards(input.agentMemoryReport.layers)}</section><section class="cards agent-memory-note-cards">${agentMemoryNoteCards(input.agentMemoryReport.memoryNotes)}</section><section class="grid"><article class="agent-memory-card"><h3>Context Navigation Rules</h3>${list(input.agentMemoryReport.contextNavigationRules)}</article><article class="agent-memory-card"><h3>다음 확인 단계</h3>${list(input.agentMemoryReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "graph-query.html",
      title: "Graph Query",
      html: pageShell("Graph Query", "graph-query.html", `<section class="panel" data-source-pattern="Graphify"><h2>Graph Query Guide</h2><p>${escapeHtml(input.graphQueryReport.summary)}</p><p class="muted">${escapeHtml(input.graphQueryReport.sourcePattern)}</p></section><section class="cards graph-query-mode-cards">${graphQueryModeCards(input.graphQueryReport.queryModes)}</section><section class="cards graph-explain-cards">${input.graphQueryReport.nodeExplanations.map((item) => `<article class="graph-query-card"><h3>${escapeHtml(item.label)}</h3><p class="muted">${escapeHtml(item.type)}</p><code>${escapeHtml(item.question)}</code>${item.href ? `<p><a href="${escapeHtml(item.href)}">관련 페이지 열기</a></p>` : ""}</article>`).join("")}</section><section class="cards graph-path-cards">${input.graphQueryReport.pathPrompts.map((item) => `<article class="graph-query-card"><h3>${escapeHtml(item.from)} -> ${escapeHtml(item.to)}</h3><code>${escapeHtml(item.question)}</code><p>${escapeHtml(item.reason)}</p></article>`).join("")}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.graphQueryReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "tutorial-abstractions.html",
      title: "Tutorial Abstractions",
      html: pageShell("Tutorial Abstractions", "tutorial-abstractions.html", `<section class="panel" data-source-pattern="PocketFlow"><h2>Codebase Tutorial Plan</h2><p>${escapeHtml(input.tutorialAbstractionReport.summary)}</p><p class="muted">${escapeHtml(input.tutorialAbstractionReport.sourcePattern)}</p></section><section class="cards tutorial-abstraction-cards">${tutorialAbstractionCards(input.tutorialAbstractionReport.abstractions)}</section><section class="grid"><article class="tutorial-abstraction-card"><h3>Relationships</h3>${list(input.tutorialAbstractionReport.relationships.map((item) => `${item.fromId} -> ${item.toId} [${item.label}]: ${item.reason}`))}</article><article class="tutorial-abstraction-card"><h3>Chapter Order</h3>${list(input.tutorialAbstractionReport.chapterOrder.map((item) => `${item.chapterNumber}. ${item.title}: ${item.whyNow}`))}</article><article class="tutorial-abstraction-card"><h3>다음 확인 단계</h3>${list(input.tutorialAbstractionReport.learnerNextSteps)}</article></section>`, input)
    },
    {
      name: "decision-records.html",
      title: "Decision Records",
      html: pageShell("Decision Records", "decision-records.html", `<section class="panel" data-source-pattern="Log4brains"><h2>Architecture Decision Records</h2><p>${escapeHtml(input.decisionRecordReport.summary)}</p><p class="muted">${escapeHtml(input.decisionRecordReport.sourcePattern)}</p></section><section class="grid"><article class="decision-record-card"><h3>Status Counts</h3>${list(Object.entries(input.decisionRecordReport.statusCounts).map(([status, count]) => `${status}: ${count}`))}</article><article class="decision-record-card"><h3>Timeline</h3>${list(input.decisionRecordReport.timeline.map((item) => `${item.sequence}. ${item.title} [${item.status}]`))}</article><article class="decision-record-card"><h3>Package Scopes</h3>${list(input.decisionRecordReport.packageScopes.map((item) => `${item.name}: ${item.adrFolder} (${item.recordCount})`))}</article></section><section class="cards decision-record-cards">${decisionRecordCards(input.decisionRecordReport.records)}</section><section class="panel"><h2>다음 확인 단계</h2>${list(input.decisionRecordReport.learnerNextSteps)}</section>`, input)
    },
    {
      name: "dependency-health.html",
      title: "Dependency Health",
      html: pageShell("Dependency Health", "dependency-health.html", `<section class="panel" data-source-pattern="dependency-cruiser"><h2>Dependency Graph Health</h2><p>${escapeHtml(input.dependencyHealthReport.summary)}</p><p class="muted">${escapeHtml(input.dependencyHealthReport.sourcePattern)}</p><dl class="meta"><div><dt>nodes</dt><dd>${input.dependencyHealthReport.graphMetrics.nodeCount}</dd></div><div><dt>localDependencyEdges</dt><dd>${input.dependencyHealthReport.totalLocalDependencies}</dd></div><div><dt>cycles</dt><dd>${input.dependencyHealthReport.cycles.length}</dd></div><div><dt>orphanModules</dt><dd>${input.dependencyHealthReport.orphanModules.length}</dd></div></dl></section><section class="grid"><article class="dependency-health-card"><h3>Graph Metrics</h3>${list([`max fan-in: ${input.dependencyHealthReport.graphMetrics.maxFanIn}`, `max fan-out: ${input.dependencyHealthReport.graphMetrics.maxFanOut}`, `edge count: ${input.dependencyHealthReport.graphMetrics.edgeCount}`])}</article><article class="dependency-health-card"><h3>no-circular</h3>${dependencyCycleCards(input.dependencyHealthReport.cycles)}</article><article class="dependency-health-card"><h3>no-orphans</h3>${dependencyOrphanList(input.dependencyHealthReport.orphanModules)}</article><article class="dependency-health-card"><h3>Rule Violations</h3>${dependencyViolationList(input.dependencyHealthReport.ruleViolations)}</article></section><section class="grid"><article class="dependency-health-card"><h3>Top Fan-in</h3>${dependencyFanList(input.dependencyHealthReport.graphMetrics.topFanIn)}</article><article class="dependency-health-card"><h3>Top Fan-out</h3>${dependencyFanList(input.dependencyHealthReport.graphMetrics.topFanOut)}</article><article class="dependency-health-card"><h3>Local Dependency Edges</h3>${dependencyEdgeList(input.dependencyHealthReport.localDependencyEdges)}</article><article class="dependency-health-card"><h3>다음 확인 단계</h3>${list(input.dependencyHealthReport.learnerNextSteps)}</article></section>`, input)
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
    "assets/learning-path.tour.json": learningPathTourJson(input, learningPath),
    "assets/search-index.json": `${JSON.stringify(input.searchIndexReport, null, 2)}\n`,
    "assets/learning-journal-template.md": input.learningJournalReport.journalTemplateMarkdown.endsWith("\n")
      ? input.learningJournalReport.journalTemplateMarkdown
      : `${input.learningJournalReport.journalTemplateMarkdown}\n`
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
      { label: "심볼 맵", path: "html/symbol-map.html", description: "함수, 클래스, 상수, 타입 신호를 원본 소스와 함께 확인합니다." },
      { label: "API Reference", path: "html/api-reference.html", description: "TypeDoc식 entry point, public symbol, export warning을 확인합니다." },
      { label: "Search Index", path: "html/search-index.html", description: "Pagefind식 document, filter, metadata, term index를 확인합니다." },
      { label: "Learning Journal", path: "html/learning-journal.html", description: "learn-codebase식 active recall 질문, mastery map, spaced review queue를 확인합니다." },
      { label: "Project Activity", path: "html/project-activity.html", description: "Repowise식 activity snapshot, hotspot, dead-code, decision review queue를 확인합니다." },
      { label: "License Rights", path: "html/license-rights.html", description: "Licensee식 license file, package metadata, README license reference 검토 상태를 확인합니다." },
      { label: "SBOM", path: "html/sbom.html", description: "Syft식 package artifact, file artifact, relationship inventory를 확인합니다." },
      { label: "Security Readiness", path: "html/security-readiness.html", description: "Trivy식 scan target, scanner coverage, security signal, action queue를 확인합니다." },
      { label: "Project Scorecard", path: "html/scorecard.html", description: "OpenSSF Scorecard식 check, risk, policy finding, remediation queue를 확인합니다." },
      { label: "Provenance Readiness", path: "html/provenance.html", description: "Cosign식 signature material, bundle, attestation, identity requirement를 확인합니다." },
      { label: "Advisory Query Readiness", path: "html/advisories.html", description: "OSV-Scanner식 package advisory query target, lockfile, policy control 준비도를 확인합니다." },
      { label: "OpenVEX Impact Readiness", path: "html/vex.html", description: "OpenVEX식 product, status, justification, SARIF filter, attestation 준비도를 확인합니다." },
      { label: "Policy Gate Readiness", path: "html/policy-gates.html", description: "OPA식 Rego policy, input/data, test, bundle, decision gate 준비도를 확인합니다." },
      { label: "Context Pack", path: "html/context-pack.html", description: "LLM context pack token budget과 제외 항목을 확인합니다." },
      { label: "MCP Handoff", path: "html/mcp-handoff.html", description: "AI/MCP 도구에 넘길 tool, prompt, safety note를 확인합니다." },
      { label: "Agent Memory", path: "html/agent-memory.html", description: "새 AI 세션이 먼저 읽을 persistent memory note와 context navigation rule을 확인합니다." },
      { label: "Graph Query", path: "html/graph-query.html", description: "Graphify식 query, path, explain 질문으로 그래프 탐색 순서를 정합니다." },
      { label: "Tutorial Abstractions", path: "html/tutorial-abstractions.html", description: "PocketFlow식 핵심 추상화, 관계, 장 순서를 확인합니다." },
      { label: "Decision Records", path: "html/decision-records.html", description: "Log4brains식 ADR 후보, status, context, consequences를 확인합니다." },
      { label: "Dependency Health", path: "html/dependency-health.html", description: "dependency-cruiser식 순환, 고아 모듈, fan-in/fan-out을 확인합니다." },
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
      title: "함수와 클래스 심볼 확인",
      href: "symbol-map.html",
      goal: "함수, 클래스, 상수, 타입 이름을 공개 API와 내부 구현 단위로 나누어 추적합니다.",
      evidence: `symbol ${input.symbolMapReport.totalSymbols}개`
    },
    {
      title: "공개 API reference 확인",
      href: "api-reference.html",
      goal: "entry point와 exported symbol을 TypeDoc식 API 문서 순서로 확인합니다.",
      evidence: `entry points ${input.apiReferenceReport.entryPoints.length}개, public symbols ${input.apiReferenceReport.publicSymbols.length}개`
    },
    {
      title: "정적 검색 인덱스 확인",
      href: "search-index.html",
      goal: "generated HTML, file lesson, folder lesson이 어떤 document/filter/meta/term 색인으로 묶였는지 확인합니다.",
      evidence: `PageFragmentData ${input.searchIndexReport.totalDocuments}개, MetaIndex terms ${input.searchIndexReport.totalTerms}개`
    },
    {
      title: "학습 저널 질문에 먼저 답하기",
      href: "learning-journal.html",
      goal: "파일 수업을 읽기 전 예측 질문에 답하고, mastery map과 spaced review queue를 다음 세션의 시작점으로 남깁니다.",
      evidence: `open questions ${input.learningJournalReport.openQuestions.length}개, spaced review ${input.learningJournalReport.spacedReviewQueue.length}개`
    },
    {
      title: "Project activity risk queue 확인",
      href: "project-activity.html",
      goal: "snapshot-only activity, hotspot 후보, dead-code 후보, decision prompt를 변경 전 검토 queue로 정리합니다.",
      evidence: `hotspots ${input.projectActivityReport.hotspotCandidates.length}개, dead-code candidates ${input.projectActivityReport.deadCodeCandidates.length}개`
    },
    {
      title: "라이선스와 소스 권리 확인",
      href: "license-rights.html",
      goal: "Licensee식 license file, package metadata, README license reference를 분리해 공개/재사용 전 검토 상태를 확인합니다.",
      evidence: `license files ${input.licenseRightsReport.licenseFiles.length}개, warnings ${input.licenseRightsReport.reviewWarnings.length}개`
    },
    {
      title: "SBOM 패키지 인벤토리 확인",
      href: "sbom.html",
      goal: "Syft식 source descriptor, package artifact, file artifact, relationship inventory로 배포 전 구성요소를 확인합니다.",
      evidence: `package artifacts ${input.sbomReport.packageArtifacts.length}개, relationships ${input.sbomReport.relationships.length}개`
    },
    {
      title: "보안 스캔 준비 상태 확인",
      href: "security-readiness.html",
      goal: "Trivy식 target/scanner readiness를 보고 실제 스캐너 실행 전에 lockfile, license, IaC, secret-scan 범위 누락을 확인합니다.",
      evidence: `scanner coverage ${input.securityReadinessReport.scannerCoverage.length}개, action queue ${input.securityReadinessReport.actionQueue.length}개`
    },
    {
      title: "Project scorecard risk queue 확인",
      href: "scorecard.html",
      goal: "OpenSSF Scorecard식 checks, policy findings, remediation queue를 보고 provider-only unknown과 정적 실패를 분리합니다.",
      evidence: `aggregate ${input.scorecardReport.aggregateScore}/10, checks ${input.scorecardReport.checks.length}개`
    },
    {
      title: "Provenance 서명 준비도 확인",
      href: "provenance.html",
      goal: "Cosign식 signature bundle, attestation, certificate identity, OIDC issuer 요구사항을 release 전에 분리해 확인합니다.",
      evidence: `signature material ${input.provenanceReport.signatureSignals.length}개, risk queue ${input.provenanceReport.riskQueue.length}개`
    },
    {
      title: "Advisory 질의 준비도 확인",
      href: "advisories.html",
      goal: "OSV-Scanner식 package extraction, vulnerability matching, offline DB, ignore policy 준비도를 확인합니다.",
      evidence: `query targets ${input.advisoryReport.packageQueryTargets.length}개, policies ${input.advisoryReport.policyControls.length}개`
    },
    {
      title: "OpenVEX impact 준비도 확인",
      href: "vex.html",
      goal: "OpenVEX식 product identity, status justification, SARIF filter, attestation 준비도를 분리해 확인합니다.",
      evidence: `product targets ${input.vexReport.productTargets.length}개, workflow ${input.vexReport.documentWorkflow.length}개`
    },
    {
      title: "Policy gate 준비도 확인",
      href: "policy-gates.html",
      goal: "OPA식 Rego policy, input/data fixture, test, bundle, decision output 준비도를 확인합니다.",
      evidence: `policy documents ${input.policyGateReport.policyDocuments.length}개, gate queries ${input.policyGateReport.gateQueries.length}개`
    },
    {
      title: "LLM Context Pack 예산 확인",
      href: "context-pack.html",
      goal: "AI 도구에 공유할 파일 묶음의 token-heavy file과 context limit 적합성을 확인합니다.",
      evidence: `estimated tokens ${input.contextPackReport.totalEstimatedTokens}개`
    },
    {
      title: "AI/MCP 인계 계획 확인",
      href: "mcp-handoff.html",
      goal: "다른 AI 또는 MCP 도구가 사용할 tool, prompt, safety note를 확인합니다.",
      evidence: `handoff tools ${input.mcpHandoffReport.tools.length}개`
    },
    {
      title: "Agent memory 재진입 규칙 확인",
      href: "agent-memory.html",
      goal: "다음 AI 세션이 원본 코드를 다시 읽기 전 사용할 기억 노트와 navigation rule을 확인합니다.",
      evidence: `memory notes ${input.agentMemoryReport.memoryNotes.length}개, reduction ${input.agentMemoryReport.tokenSavings.estimatedReductionX}x`
    },
    {
      title: "그래프 질의 방식 확인",
      href: "graph-query.html",
      goal: "query, path, explain 질문으로 컴포넌트 그래프를 먼저 탐색합니다.",
      evidence: `query modes ${input.graphQueryReport.queryModes.length}개, explain nodes ${input.graphQueryReport.nodeExplanations.length}개`
    },
    {
      title: "튜토리얼 추상화 순서 확인",
      href: "tutorial-abstractions.html",
      goal: "핵심 파일을 추상화 장으로 묶고 관계와 읽기 순서를 따라갑니다.",
      evidence: `abstractions ${input.tutorialAbstractionReport.abstractions.length}개, relationships ${input.tutorialAbstractionReport.relationships.length}개`
    },
    {
      title: "아키텍처 결정 기록 확인",
      href: "decision-records.html",
      goal: "Context, Decision, Status, Consequences 형식으로 왜 이런 구조인지 확인합니다.",
      evidence: `records ${input.decisionRecordReport.records.length}개, statuses ${Object.keys(input.decisionRecordReport.statusCounts).length}개`
    },
    {
      title: "의존성 건강도 확인",
      href: "dependency-health.html",
      goal: "로컬 import 그래프에서 순환, 고아 모듈, fan-in/fan-out이 큰 파일을 확인합니다.",
      evidence: `localDependencyEdges ${input.dependencyHealthReport.totalLocalDependencies}개, cycles ${input.dependencyHealthReport.cycles.length}개`
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

function symbolCards(symbols: SymbolMapReport["symbols"]): string {
  if (symbols.length === 0) return "<article><h3>기록된 심볼이 없습니다.</h3><p>지원되는 코드 파일이 적거나 선언 패턴을 찾지 못했습니다.</p></article>";
  return symbols.map((symbol) => `<article class="symbol-map-card" data-symbol-kind="${escapeHtml(symbol.kind)}" data-symbol-exported="${symbol.exported}"><h3>${escapeHtml(symbol.name)}</h3><p class="muted">${escapeHtml(symbol.kind)}${symbol.exported ? " · exported" : ""}</p><p>${escapeHtml(symbol.filePath)}</p><a href="${escapeHtml(symbol.lessonHref.replace(/^html\//, ""))}">파일 수업</a> <a class="symbol-source-link" href="../${escapeHtml(symbol.sourceHref)}">원본 열기</a></article>`).join("");
}

function apiEntryPointList(items: ApiReferenceReport["entryPoints"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 entry point가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.filePath)}</a>: ${escapeHtml(item.reason)} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function apiReferenceCards(symbols: ApiReferenceReport["publicSymbols"]): string {
  if (symbols.length === 0) return "<article><h3>기록된 public symbol이 없습니다.</h3><p>export 신호가 있는 파일을 다시 확인하세요.</p></article>";
  return symbols.map((symbol) => `<article class="api-reference-card" data-api-kind="${escapeHtml(symbol.kind)}" data-api-category="${escapeHtml(symbol.category)}"><h3>${escapeHtml(symbol.name)}</h3><p class="muted">ReflectionKind ${escapeHtml(symbol.kind)} · ${escapeHtml(symbol.category)}</p><code>${escapeHtml(symbol.signature)}</code><p>${escapeHtml(symbol.filePath)}</p><a href="${escapeHtml(symbol.lessonHref.replace(/^html\//, ""))}">파일 수업</a> <a class="api-reference-source-link" href="../${escapeHtml(symbol.sourceHref)}">원본 열기</a></article>`).join("");
}

function apiWarningList(items: ApiReferenceReport["exportWarnings"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 export warning이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.symbolName)}</strong> in ${escapeHtml(item.filePath)}: ${escapeHtml(item.message)} ${escapeHtml(item.suggestion)} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function searchFilterList(items: SearchIndexReport["filterIndex"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 filter index가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filter)}</strong>: ${item.values.map((value) => `${escapeHtml(value.value)} ${value.documentCount}`).join(", ")}</li>`).join("")}</ul>`;
}

function searchTermList(items: SearchIndexReport["termIndex"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 term index가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.term)}</strong>: ${item.documentCount} docs · ${escapeHtml(item.documents.slice(0, 4).join(", "))}</li>`).join("")}</ul>`;
}

function searchDocumentCards(documents: SearchIndexReport["documents"]): string {
  if (documents.length === 0) return "<article><h3>기록된 search document가 없습니다.</h3><p>분석을 다시 실행하면 이곳에 문서 프래그먼트가 쌓입니다.</p></article>";
  return documents.map((document) => `<article class="search-index-card" data-search-section="${escapeHtml(document.section)}"><h3>${escapeHtml(document.title)}</h3><p class="muted">${escapeHtml(document.section)} · ${document.wordCount} words · ${escapeHtml(document.sourcePath ?? "generated")}</p><p>filters: ${escapeHtml(Object.entries(document.filters).map(([key, values]) => `${key}=${values.join("|")}`).join(", "))}</p><p>meta: ${escapeHtml(Object.keys(document.meta).join(", "))}</p><p>top terms: ${escapeHtml(document.topTerms.join(", ") || "none")}</p><a href="${escapeHtml(document.href.replace(/^html\//, ""))}">문서 열기</a></article>`).join("");
}

function learningFocusList(items: LearningJournalReport["focusGoals"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 focus goal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong>: ${escapeHtml(item.value)} <a href="${escapeHtml(htmlPageHref(item.evidenceHref))}">evidence</a></li>`).join("")}</ul>`;
}

function learningReviewList(items: LearningJournalReport["spacedReviewQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 spaced review 항목이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.concept)}</strong> · ${escapeHtml(item.reviewBy)} · review ${item.reviewNumber}<br>${escapeHtml(item.prompt)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function learningAhaList(items: LearningJournalReport["ahaMoments"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 aha moment가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.insight)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function learningMasteryCards(levels: LearningJournalReport["masteryLevels"]): string {
  if (levels.length === 0) return "<article><h3>기록된 mastery map이 없습니다.</h3><p>분석을 다시 실행하면 이곳에 concept 상태가 쌓입니다.</p></article>";
  return levels.map((level) => `<article class="learning-journal-card" data-mastery-level="${escapeHtml(level.level)}"><h3>${escapeHtml(level.label)}</h3>${level.concepts.length === 0 ? "<p class=\"muted\">항목 없음</p>" : `<ul>${level.concepts.map((concept) => `<li><strong>${escapeHtml(concept.concept)}</strong><br>${escapeHtml(concept.status)}<br><span class="muted">${escapeHtml(concept.reason)}</span><br><em>${escapeHtml(concept.reviewPrompt)}</em><br><a href="${escapeHtml(htmlPageHref(concept.relatedHref))}">관련 리포트</a></li>`).join("")}</ul>`}</article>`).join("");
}

function learningQuestionCards(items: LearningJournalReport["openQuestions"]): string {
  if (items.length === 0) return "<article><h3>기록된 open question이 없습니다.</h3><p>분석을 다시 실행하면 이곳에 질문이 쌓입니다.</p></article>";
  return items.map((item) => `<article class="learning-journal-card" data-question-type="${escapeHtml(item.promptType)}"><h3>${escapeHtml(item.promptType)}</h3><p>${escapeHtml(item.question)}</p><p class="muted">${escapeHtml(item.sourcePattern)}</p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 리포트 열기</a></article>`).join("");
}

function learningPromptCards(items: LearningJournalReport["socraticPrompts"]): string {
  if (items.length === 0) return "<article><h3>기록된 Socratic prompt가 없습니다.</h3><p>분석을 다시 실행하면 이곳에 질문 패턴이 쌓입니다.</p></article>";
  return items.map((item) => `<article class="learning-journal-card"><h3>${escapeHtml(item.category)}</h3><p>${escapeHtml(item.question)}</p><p class="muted">${escapeHtml(item.useWhen)}</p><h4>Graduated Hints</h4>${list(item.hintLevels)}<a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 리포트 열기</a></article>`).join("");
}

function projectActivitySignalList(items: ProjectActivityReport["activitySignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 activity signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong>: ${escapeHtml(item.value)}<br>${escapeHtml(item.explanation)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 리포트 열기</a></li>`).join("")}</ul>`;
}

function projectActivityQueueList(items: ProjectActivityReport["reviewQueues"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 review queue가 없습니다.</p>";
  return `<ul>${items.map((queue) => `<li><strong>${escapeHtml(queue.queue)}</strong>: ${escapeHtml(queue.purpose)} (${queue.items.length} items)</li>`).join("")}</ul>`;
}

function projectActivityDecisionPromptList(items: ProjectActivityReport["architectureDecisionPrompts"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 decision prompt가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.trigger)}</strong><br>${escapeHtml(item.question)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 근거 열기</a></li>`).join("")}</ul>`;
}

function projectActivityHotspotCards(items: ProjectActivityReport["hotspotCandidates"]): string {
  if (items.length === 0) return "<article class=\"project-activity-card\"><h3>Hotspot 후보가 없습니다.</h3><p>핵심 파일이 충분하지 않거나 정적 신호가 낮습니다.</p></article>";
  return items.map((item) => `<article class="project-activity-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">static hotspot score ${item.score}</p><p>${escapeHtml(item.reason)}</p><h4>Signals</h4>${list(item.signals)}<p><a href="${escapeHtml(htmlPageHref(item.lessonHref))}">파일 수업</a> · <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></p></article>`).join("");
}

function projectActivityDeadCodeCards(items: ProjectActivityReport["deadCodeCandidates"]): string {
  if (items.length === 0) return "<article class=\"project-activity-card\"><h3>Dead-code 후보가 없습니다.</h3><p>dependency graph에서 no-orphans 후보를 찾지 못했습니다.</p></article>";
  return items.map((item) => `<article class="project-activity-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">dead-code confidence ${item.confidence}</p><p>${escapeHtml(item.reason)}</p><p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 수업</a> · <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></p></article>`).join("");
}

function licenseChecklistList(items: LicenseRightsReport["rightsChecklist"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 checklist가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 근거 열기</a></li>`).join("")}</ul>`;
}

function licenseWarningList(items: LicenseRightsReport["reviewWarnings"]): string {
  if (items.length === 0) return "<p class=\"muted\">검토 경고가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.severity)}</strong>: ${escapeHtml(item.message)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function packageLicenseList(items: LicenseRightsReport["packageLicenseSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">package license metadata가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.filePath)}: ${escapeHtml(item.packageName ?? "unnamed")} declares ${escapeHtml(item.licenseText)} -> ${escapeHtml(item.detectedSpdxId ?? "unknown")} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function readmeLicenseList(items: LicenseRightsReport["readmeLicenseReferences"]): string {
  if (items.length === 0) return "<p class=\"muted\">README license reference가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.filePath)}: ${escapeHtml(item.detectedSpdxId ?? "unknown")} / confidence ${item.confidence}<br><code>${escapeHtml(item.snippet)}</code><br><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function licenseFileCards(items: LicenseRightsReport["licenseFiles"]): string {
  if (items.length === 0) return "<article class=\"license-rights-card\"><h3>License file 후보가 없습니다.</h3><p>배포나 외부 공개 전에 LICENSE 파일을 추가할지 검토하세요.</p></article>";
  return items.map((item) => `<article class="license-rights-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.detectedSpdxId ?? "unknown")} · confidence ${item.confidence} · filename score ${item.filenameScore}</p><p>${escapeHtml(item.evidence)}</p><p>matcher: ${escapeHtml(item.matcher)}</p><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></article>`).join("");
}

function sbomManifestList(items: SbomReport["packageManifests"]): string {
  if (items.length === 0) return "<p class=\"muted\">package manifest가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item.filePath)}: ${escapeHtml(item.ecosystem)} · packages ${item.packageCount} · direct ${item.directDependencies} · dev ${item.devDependencies}<br><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function sbomOutputFormatList(items: SbomReport["outputFormats"]): string {
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.format)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.reason)}</li>`).join("")}</ul>`;
}

function sbomWarningList(items: SbomReport["reviewWarnings"]): string {
  if (items.length === 0) return "<p class=\"muted\">검토 경고가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.severity)}</strong>: ${escapeHtml(item.message)} <a href="${escapeHtml(htmlPageHref(item.relatedHref))}">related</a></li>`).join("")}</ul>`;
}

function sbomPackageCards(items: SbomReport["packageArtifacts"]): string {
  if (items.length === 0) return "<article class=\"sbom-card\"><h3>Package artifact가 없습니다.</h3><p>지원되는 package manifest를 추가하면 여기에 표시됩니다.</p></article>";
  return items.slice(0, 80).map((item) => `<article class="sbom-card"><h3>${escapeHtml(item.name)}${item.version ? `@${escapeHtml(item.version)}` : ""}</h3><p class="muted">${escapeHtml(item.packageType)} · ${escapeHtml(item.ecosystem)} · ${escapeHtml(item.foundBy)}</p><p>PURL: <code>${escapeHtml(item.purl ?? "unknown")}</code></p><p>Licenses: ${escapeHtml(item.licenses.join(", ") || "unknown")}</p><p>Locations: ${escapeHtml(item.locations.join(", "))}</p><a class="source-link" href="../${escapeHtml(item.evidenceHref)}">근거 열기</a></article>`).join("");
}

function sbomFileCards(items: SbomReport["fileArtifacts"]): string {
  if (items.length === 0) return "<article class=\"sbom-card\"><h3>File artifact가 없습니다.</h3><p>manifest, lockfile, container 파일이 감지되지 않았습니다.</p></article>";
  return items.map((item) => `<article class="sbom-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.artifactKind)} · ${item.size} bytes</p><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></article>`).join("");
}

function sbomRelationshipList(items: SbomReport["relationships"]): string {
  if (items.length === 0) return "<p class=\"muted\">relationship이 없습니다.</p>";
  return `<ul>${items.slice(0, 100).map((item) => `<li><code>${escapeHtml(item.from)}</code> --${escapeHtml(item.relationshipType)}--&gt; <code>${escapeHtml(item.to)}</code> <a class="source-link" href="../${escapeHtml(item.evidenceHref)}">evidence</a></li>`).join("")}</ul>`;
}

function securityTargetList(items: SecurityReadinessReport["scannerTargets"]): string {
  if (items.length === 0) return "<p class=\"muted\">scanner target이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityCoverageList(items: SecurityReadinessReport["scannerCoverage"]): string {
  if (items.length === 0) return "<p class=\"muted\">scanner coverage가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.scanner)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityActionList(items: SecurityReadinessReport["actionQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">action queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br>${escapeHtml(item.why)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function securityCommandList(items: SecurityReadinessReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function securitySignalCards(items: SecurityReadinessReport["securitySignals"]): string {
  if (items.length === 0) return "<article class=\"security-readiness-card\"><h3>Security signal이 없습니다.</h3><p>지원되는 manifest, lockfile, container, IaC, license, SBOM 신호가 감지되지 않았습니다.</p></article>";
  return items.slice(0, 100).map((item) => `<article class="security-readiness-card"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.kind)} · ${escapeHtml(item.severity)}</p><p>${escapeHtml(item.message)}</p><a class="source-link" href="${escapeHtml(securitySignalHref(item.sourceHref))}">근거 열기</a></article>`).join("");
}

function securitySignalHref(href: string): string {
  if (href.startsWith("html/")) return htmlPageHref(href);
  return `../${href}`;
}

function scorecardCheckCards(items: ScorecardReport["checks"]): string {
  if (items.length === 0) return "<article class=\"scorecard-card\"><h3>Scorecard check가 없습니다.</h3><p>분석을 다시 실행하면 이곳에 체크 결과가 쌓입니다.</p></article>";
  return items.map((item) => `<article class="scorecard-card" data-scorecard-status="${escapeHtml(item.status)}" data-scorecard-risk="${escapeHtml(item.risk)}"><h3>${escapeHtml(item.name)}</h3><p class="muted">${item.score === null ? "unknown" : `${item.score}/10`} · ${escapeHtml(item.status)} · ${escapeHtml(item.risk)}</p><p>${escapeHtml(item.evidence)}</p><h4>Remediation</h4><p>${escapeHtml(item.remediation)}</p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></article>`).join("");
}

function scorecardCategoryList(items: ScorecardReport["categoryScores"]): string {
  if (items.length === 0) return "<p class=\"muted\">category score가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.category)}</strong>: ${item.score === null ? "unknown" : `${item.score}/10`}<br>${escapeHtml(item.explanation)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scorecardPolicyList(items: ScorecardReport["policyFindings"]): string {
  if (items.length === 0) return "<p class=\"muted\">policy finding이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.policy)}</strong> [${escapeHtml(item.result)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scorecardRiskList(items: ScorecardReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong> ${escapeHtml(item.checkName)}<br>${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function scorecardStructuredList(items: ScorecardReport["structuredResults"]): string {
  if (items.length === 0) return "<p class=\"muted\">structured result가 없습니다.</p>";
  return `<ul>${items.slice(0, 30).map((item) => `<li><strong>${escapeHtml(item.checkName)}</strong> [${escapeHtml(item.outcome)}]<br>${escapeHtml(item.probe)}<br><span class="muted">${escapeHtml(item.evidence)}</span></li>`).join("")}</ul>`;
}

function provenanceArtifactList(items: ProvenanceReport["artifactSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">artifact signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.artifact)}</strong> [${escapeHtml(item.artifactType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceSignatureList(items: ProvenanceReport["signatureSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">signature material이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.material)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceIdentityList(items: ProvenanceReport["identityRequirements"]): string {
  if (items.length === 0) return "<p class=\"muted\">identity requirement가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.requirement)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceRiskList(items: ProvenanceReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function provenanceAttestationCards(items: ProvenanceReport["attestationSignals"]): string {
  if (items.length === 0) return "<article class=\"provenance-card\"><h3>Attestation signal이 없습니다.</h3><p>지원되는 predicate 또는 DSSE envelope 신호가 감지되지 않았습니다.</p></article>";
  return items.map((item) => `<article class="provenance-card" data-provenance-readiness="${escapeHtml(item.readiness)}"><h3>${escapeHtml(item.predicateType)}</h3><p class="muted">${escapeHtml(item.readiness)}</p><p>${escapeHtml(item.evidence)}</p><a href="${escapeHtml(htmlPageHref(item.relatedHref))}">관련 페이지 열기</a></article>`).join("");
}

function provenanceCommandList(items: ProvenanceReport["verificationCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">verification command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function advisoryTargetCards(items: AdvisoryReport["packageQueryTargets"]): string {
  if (items.length === 0) return "<article class=\"advisory-card\"><h3>Package query target이 없습니다.</h3><p>지원되는 manifest나 SBOM package evidence가 감지되지 않았습니다.</p></article>";
  return items.slice(0, 80).map((item) => `<article class="advisory-card" data-advisory-readiness="${escapeHtml(item.readiness)}"><h3>${escapeHtml(item.name)}${item.version ? `@${escapeHtml(item.version)}` : ""}</h3><p class="muted">${escapeHtml(item.ecosystem)} · ${escapeHtml(item.sourceType)} · ${escapeHtml(item.readiness)}</p><p>PURL: <code>${escapeHtml(item.purl ?? "unknown")}</code></p><p>${escapeHtml(item.evidence)}</p><a class="source-link" href="${escapeHtml(advisoryHref(item.relatedHref))}">근거 열기</a></article>`).join("");
}

function advisoryLockfileList(items: AdvisoryReport["lockfileSignals"]): string {
  if (items.length === 0) return "<p class=\"muted\">lockfile signal이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.ecosystem)} / ${escapeHtml(item.readiness)}]<br>${item.packageCount} package candidate(s)<br><a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function advisorySourceList(items: AdvisoryReport["advisorySources"]): string {
  if (items.length === 0) return "<p class=\"muted\">advisory source가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.source)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryPolicyList(items: AdvisoryReport["policyControls"]): string {
  if (items.length === 0) return "<p class=\"muted\">policy control이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.control)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryResultList(items: AdvisoryReport["resultModel"]): string {
  if (items.length === 0) return "<p class=\"muted\">result model이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.field)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.purpose)}<br><span class="muted">${escapeHtml(item.evidence)}</span><br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryRiskList(items: AdvisoryReport["remediationQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">remediation queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(advisoryHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function advisoryCommandList(items: AdvisoryReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function advisoryHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function vexProductCards(items: VexReport["productTargets"]): string {
  if (items.length === 0) return "<article class=\"vex-card\"><h3>Product target이 없습니다.</h3><p>package PURL, source digest, SBOM, container evidence가 필요합니다.</p></article>";
  return items.slice(0, 80).map((item) => `<article class="vex-card" data-vex-product-type="${escapeHtml(item.productType)}"><h3>${escapeHtml(item.productType)}</h3><p><code>${escapeHtml(item.productId)}</code></p><p class="muted">${escapeHtml(item.version ?? "unversioned")}</p><p>${escapeHtml(item.evidence)}</p><a href="${escapeHtml(vexHref(item.relatedHref))}">근거 열기</a></article>`).join("");
}

function vexInputList(items: VexReport["vulnerabilityInputs"]): string {
  if (items.length === 0) return "<p class=\"muted\">vulnerability input이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.source)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vexHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vexStatusList(items: VexReport["statusMatrix"]): string {
  if (items.length === 0) return "<p class=\"muted\">status rule이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.status)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.requiredEvidence)}<br><span class="muted">filters scanner result: ${item.filtersScannerResult ? "yes" : "no"} · fields: ${escapeHtml(item.allowedFields.join(", ") || "none")}</span></li>`).join("")}</ul>`;
}

function vexJustificationList(items: VexReport["justificationCatalog"]): string {
  if (items.length === 0) return "<p class=\"muted\">justification 후보가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.justification)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.useWhen)}<br><span class="muted">impact statement: ${item.requiresImpactStatement ? "required" : "optional"}</span></li>`).join("")}</ul>`;
}

function vexStatementList(items: VexReport["statementDrafts"]): string {
  if (items.length === 0) return "<p class=\"muted\">statement draft가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.vulnerabilityId)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.productIds.join(", ") || "no products")}<br><span class="muted">justification: ${escapeHtml(item.justification ?? "none")} · review: ${item.needsHumanReview ? "required" : "not required"}</span><br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vexHref(item.relatedHref))}">근거 열기</a></li>`).join("")}</ul>`;
}

function vexWorkflowList(items: VexReport["documentWorkflow"]): string {
  if (items.length === 0) return "<p class=\"muted\">workflow command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.step)}</strong> [${escapeHtml(item.readiness)}]<br><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function vexAttestationList(items: VexReport["attestationReadiness"]): string {
  if (items.length === 0) return "<p class=\"muted\">attestation readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.requirement)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(vexHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vexRiskList(items: VexReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(vexHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function vexHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function policyDocumentCards(items: PolicyGateReport["policyDocuments"]): string {
  if (items.length === 0) return "<article class=\"policy-gate-card\"><h3>Rego policy가 없습니다.</h3><p>OPA gate를 만들려면 .rego policy module이 필요합니다.</p></article>";
  return items.map((item) => `<article class="policy-gate-card" data-policy-readiness="${escapeHtml(item.readiness)}"><h3>${escapeHtml(item.filePath)}</h3><p class="muted">${escapeHtml(item.packageName ?? "unknown package")} · ${escapeHtml(item.readiness)}</p><p>rules ${item.ruleCount} · tests ${item.testRuleCount}</p><p>decision rules: ${escapeHtml(item.decisionRules.join(", ") || "none")}</p><a href="${escapeHtml(policyHref(item.sourceHref))}">원본 열기</a></article>`).join("");
}

function policyInputList(items: PolicyGateReport["inputDocuments"]): string {
  if (items.length === 0) return "<p class=\"muted\">input/data document가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.filePath)}</strong> [${escapeHtml(item.documentType)} / ${escapeHtml(item.readiness)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(policyHref(item.sourceHref))}">원본 열기</a></li>`).join("")}</ul>`;
}

function policyGateQueryList(items: PolicyGateReport["gateQueries"]): string {
  if (items.length === 0) return "<p class=\"muted\">gate query 후보가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.query)}</code> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.purpose)}<br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyCoverageList(items: PolicyGateReport["testCoverage"]): string {
  if (items.length === 0) return "<p class=\"muted\">test coverage readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.target)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyBundleList(items: PolicyGateReport["bundleReadiness"]): string {
  if (items.length === 0) return "<p class=\"muted\">bundle readiness가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.requirement)}</strong> [${escapeHtml(item.status)}]<br>${escapeHtml(item.evidence)}<br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyDecisionList(items: PolicyGateReport["decisionOutputs"]): string {
  if (items.length === 0) return "<p class=\"muted\">decision output 모델이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.field)}</strong> [${escapeHtml(item.readiness)}]<br>${escapeHtml(item.purpose)}<br><span class="muted">${escapeHtml(item.evidence)}</span><br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyCommandList(items: PolicyGateReport["recommendedCommands"]): string {
  if (items.length === 0) return "<p class=\"muted\">recommended command가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><code>${escapeHtml(item.command)}</code><br>${escapeHtml(item.purpose)}</li>`).join("")}</ul>`;
}

function policyRiskList(items: PolicyGateReport["riskQueue"]): string {
  if (items.length === 0) return "<p class=\"muted\">risk queue가 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.priority)}</strong>: ${escapeHtml(item.action)}<br><span class="muted">${escapeHtml(item.why)}</span><br><a href="${escapeHtml(policyHref(item.relatedHref))}">관련 페이지 열기</a></li>`).join("")}</ul>`;
}

function policyHref(href: string): string {
  if (href.startsWith("source/")) return `../${href}`;
  return htmlPageHref(href);
}

function contextPackCards(files: ContextPackReport["topFiles"]): string {
  if (files.length === 0) return "<article><h3>Pack 후보가 없습니다.</h3><p>텍스트 파일이 없거나 안전 필터에 의해 제외되었습니다.</p></article>";
  return files.map((file) => `<article class="context-pack-card"><h3>${escapeHtml(file.filePath)}</h3><p class="muted">${file.estimatedTokens} tokens · ${file.size} bytes</p><p>${escapeHtml(file.packReason)}</p><a href="${escapeHtml(file.lessonHref.replace(/^html\//, ""))}">파일 수업</a> <a class="context-pack-source-link" href="../${escapeHtml(file.sourceHref)}">원본 열기</a></article>`).join("");
}

function contextSplitPlanList(plans: ContextPackReport["splitPlans"]): string {
  if (plans.length === 0) return "<p class=\"muted\">split plan이 없습니다.</p>";
  return `<ul>${plans.map((plan) => `<li><strong>${escapeHtml(plan.name)}</strong>: ${plan.partCount} parts · max ${plan.maxBytes} bytes${plan.oversizedDirectories.length > 0 ? ` · oversized ${escapeHtml(plan.oversizedDirectories.join(", "))}` : ""}<ul>${plan.parts.map((part) => `<li>${escapeHtml(part.partName)}: ${part.estimatedBytes} bytes · ${part.estimatedTokens} tokens · ${part.fileCount} files · ${escapeHtml(part.directories.join(", "))}${part.overLimit ? " · over limit" : ""}</li>`).join("")}</ul></li>`).join("")}</ul>`;
}

function mcpToolCards(tools: McpHandoffReport["tools"]): string {
  if (tools.length === 0) return "<article><h3>등록된 MCP 도구가 없습니다.</h3><p>handoff report를 다시 생성하세요.</p></article>";
  return tools.map((tool) => `<article class="mcp-handoff-card"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.purpose)}</p><p class="muted">${escapeHtml(tool.useWhen)}</p><h4>Prompt</h4><p>${escapeHtml(tool.recommendedPrompt)}</p><h4>Input hints</h4>${list(tool.inputHints)}</article>`).join("");
}

function agentMemoryLayerCards(layers: AgentMemoryReport["layers"]): string {
  if (layers.length === 0) return "<article><h3>기록된 memory layer가 없습니다.</h3><p>agent memory report를 다시 생성하세요.</p></article>";
  return layers.map((layer) => `<article class="agent-memory-card"><h3>${escapeHtml(layer.name)}</h3><p>${escapeHtml(layer.role)}</p><p class="muted">Before: ${escapeHtml(layer.useBefore)}</p><a href="${escapeHtml(htmlPageHref(layer.generatedArtifact))}">${escapeHtml(layer.generatedArtifact)} 열기</a></article>`).join("");
}

function agentMemoryNoteCards(notes: AgentMemoryReport["memoryNotes"]): string {
  if (notes.length === 0) return "<article><h3>기록된 memory note가 없습니다.</h3><p>agent memory report를 다시 생성하세요.</p></article>";
  return notes.map((note) => `<article class="agent-memory-card"><h3>${escapeHtml(note.title)}</h3><p class="muted">${escapeHtml(note.noteType)}</p><pre>${escapeHtml(note.frontmatter.map((entry) => `${entry.key}: ${entry.value}`).join("\n"))}</pre><p>${escapeHtml(note.body)}</p><a href="${escapeHtml(htmlPageHref(note.relatedReportHref))}">관련 리포트 열기</a></article>`).join("");
}

function graphQueryModeCards(modes: GraphQueryReport["queryModes"]): string {
  if (modes.length === 0) return "<article><h3>기록된 graph query mode가 없습니다.</h3><p>graph query report를 다시 생성하세요.</p></article>";
  return modes.map((mode) => `<article class="graph-query-card"><h3>${escapeHtml(mode.name)}</h3><code>${escapeHtml(mode.commandShape)}</code><p>${escapeHtml(mode.purpose)}</p><p class="muted">${escapeHtml(mode.useWhen)}</p></article>`).join("");
}

function tutorialAbstractionCards(items: TutorialAbstractionReport["abstractions"]): string {
  if (items.length === 0) return "<article><h3>기록된 추상화가 없습니다.</h3><p>핵심 파일 수업을 다시 생성하면 이곳에 튜토리얼 장이 쌓입니다.</p></article>";
  return items.map((item) => `<article class="tutorial-abstraction-card" id="${htmlAnchor(item.id)}"><h3>Chapter ${item.chapterNumber}: ${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><p class="muted">relationships ${item.relationshipCount}</p><p>${escapeHtml(item.chapterGoal)}</p><h4>Relevant Files</h4>${tutorialFileLinks(item.relevantFiles)}</article>`).join("");
}

function tutorialFileLinks(items: TutorialAbstractionReport["abstractions"][number]["relevantFiles"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 관련 파일이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.filePath)}</a> <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function decisionRecordCards(items: DecisionRecordReport["records"]): string {
  if (items.length === 0) return "<article><h3>기록된 decision record가 없습니다.</h3><p>분석 리포트를 다시 생성하세요.</p></article>";
  return items.map((item) => `<article class="decision-record-card" id="${htmlAnchor(item.id)}"><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.status)} · ${escapeHtml(item.scope)} · ${escapeHtml(item.tags.join(", "))}</p><h4>Context</h4><p>${escapeHtml(item.context)}</p><h4>Decision</h4><p>${escapeHtml(item.decision)}</p><h4>Positive Consequences</h4>${list(item.consequences.positive)}<h4>Negative Consequences</h4>${list(item.consequences.negative)}<h4>Related Reports</h4>${list(item.relatedReports.map((report) => `${report.label}: ${report.href}`))}</article>`).join("");
}

function dependencyCycleCards(items: DependencyHealthReport["cycles"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 cycle이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.id)}</strong> [${escapeHtml(item.severity)}]: ${escapeHtml(item.files.join(" -> "))}<br>${escapeHtml(item.suggestion)}</li>`).join("")}</ul>`;
}

function dependencyOrphanList(items: DependencyHealthReport["orphanModules"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 orphan module이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.filePath)}</a>: ${escapeHtml(item.reason)} <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
}

function dependencyViolationList(items: DependencyHealthReport["ruleViolations"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 rule violation이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.ruleName)}</strong> [${escapeHtml(item.severity)}]: ${escapeHtml(item.fromFile)}${item.toFile ? ` -> ${escapeHtml(item.toFile)}` : ""}<br>${escapeHtml(item.message)}<br>${escapeHtml(item.suggestion)}</li>`).join("")}</ul>`;
}

function dependencyFanList(items: DependencyHealthReport["graphMetrics"]["topFanIn"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 fan metric이 없습니다.</p>";
  return `<ul>${items.map((item) => `<li><a href="files.html#${htmlAnchor(item.filePath)}">${escapeHtml(item.filePath)}</a>: ${item.count}</li>`).join("")}</ul>`;
}

function dependencyEdgeList(items: DependencyHealthReport["localDependencyEdges"]): string {
  if (items.length === 0) return "<p class=\"muted\">기록된 local dependency edge가 없습니다.</p>";
  return `<ul>${items.slice(0, 30).map((item) => `<li data-dependency-type="${escapeHtml(item.dependencyType)}"><a href="${escapeHtml(item.lessonHref.replace(/^html\//, ""))}">${escapeHtml(item.fromFile)}</a> -> ${escapeHtml(item.toFile)} <code>${escapeHtml(item.importText)}</code> <a class="source-link" href="../${escapeHtml(item.sourceHref)}">원본 열기</a></li>`).join("")}</ul>`;
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

function htmlPageHref(filePath: string): string {
  if (filePath.startsWith("html/")) return filePath.slice(5);
  if (filePath.startsWith("markdown/") || filePath.startsWith("analysis/")) return `../${filePath}`;
  return filePath;
}

export function styleCss(): string {
  return `:root{color-scheme:light;--bg:#f7f8fa;--panel:#fff;--text:#17202a;--muted:#64748b;--line:#d9e0ea;--accent:#0f766e;--accent-weak:#e6f4f1}*{box-sizing:border-box}body{margin:0;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text);display:grid;grid-template-columns:240px 1fr;min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;padding:20px;border-right:1px solid var(--line);background:#fff}.sidebar strong{display:block;font-size:18px;margin-bottom:16px}.sidebar input{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:6px;margin-bottom:14px}.sidebar nav{display:grid;gap:4px}.sidebar a{color:var(--text);text-decoration:none;padding:8px 10px;border-radius:6px}.sidebar a.active,.sidebar a:hover{background:var(--accent-weak);color:var(--accent)}main{padding:28px;max-width:1180px;width:100%}.page-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.eyebrow{color:var(--accent);font-weight:700;margin:0 0 4px}h1,h2,h3{line-height:1.25;margin:0 0 12px}h1{font-size:32px}.lead{font-size:18px}.meta{display:grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:8px;margin:0}.meta div,.panel,article{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:16px}.meta dt{font-size:12px;color:var(--muted)}.meta dd{margin:0;font-weight:700}.panel{margin-bottom:16px}.grid,.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px}.cards article{min-height:150px}.muted{color:var(--muted)}pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;overflow:auto}.source-evidence{display:grid;gap:8px;padding-left:0;list-style:none}.source-evidence li{display:grid;gap:3px}.source-evidence code,.evidence-index-cards code{display:block;white-space:pre-wrap;background:#f1f5f9;border:1px solid var(--line);border-radius:6px;padding:7px 8px;color:#0f172a}.source-link{width:max-content;color:var(--accent);font-weight:700;text-decoration:none}.source-link:hover{text-decoration:underline}.toolbar{display:flex;flex-wrap:wrap;gap:8px}.toolbar button{border:1px solid var(--line);background:#fff;color:var(--text);border-radius:6px;padding:8px 10px;cursor:pointer}.toolbar button.active,.toolbar button:hover{border-color:var(--accent);background:var(--accent-weak);color:var(--accent)}details{border-top:1px solid var(--line);margin-top:12px;padding-top:10px}.choice-grid{display:grid;gap:8px}.choice{width:100%;text-align:left;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--text);padding:9px 10px;cursor:pointer}.choice.correct{border-color:#15803d;background:#eaf7ee}.choice.wrong{border-color:#b91c1c;background:#fdecec}.choice:disabled{cursor:default;color:var(--text)}@media print{*{print-color-adjust:exact}body{display:block;background:#fff;color:#111;font-size:12pt}.sidebar,.toolbar,.choice{display:none}main{padding:0;max-width:none}.page-header{display:block;border-bottom:1px solid #999;padding-bottom:12px;margin-bottom:16px}.panel,article,.meta div{break-inside:avoid;background:#fff;border-color:#999}a{color:#111}a[href]::after{content:" (" attr(href) ")";font-size:10pt;color:#555}pre{white-space:pre-wrap;color:#111;background:#f5f5f5}}@media(max-width:760px){body{grid-template-columns:1fr}.sidebar{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}main{padding:18px}.page-header{display:block}.meta{grid-template-columns:1fr 1fr}}`;
}

export function appJs(): string {
  return `const search=document.querySelector('#search');let graphType='all';let fileExt='all';let fileDir='all';let sourceEvidence='all';let evidenceKind='all';let quizSection='all';let quizDifficulty='all';function applyVisibility(){const q=search?search.value.toLowerCase():'';document.querySelectorAll('article,.panel').forEach(el=>{const textOk=!q||el.textContent.toLowerCase().includes(q);const nodeType=el.dataset.nodeType;const graphOk=!nodeType||graphType==='all'||nodeType===graphType;const ext=el.dataset.fileExt;const dir=el.dataset.fileDir;const evidence=el.dataset.sourceEvidence;const kind=el.dataset.evidenceKind;const quizSectionValue=el.dataset.quizSection;const quizDifficultyValue=el.dataset.quizDifficulty;const fileOk=(!ext||fileExt==='all'||ext===fileExt)&&(!dir||fileDir==='all'||dir===fileDir)&&(!evidence||sourceEvidence==='all'||evidence===sourceEvidence);const evidenceOk=!kind||evidenceKind==='all'||kind===evidenceKind;const quizOk=(!quizSectionValue||quizSection==='all'||quizSectionValue===quizSection)&&(!quizDifficultyValue||quizDifficulty==='all'||quizDifficultyValue===quizDifficulty);el.style.display=textOk&&graphOk&&fileOk&&evidenceOk&&quizOk?'':'none';});}if(search){search.addEventListener('input',applyVisibility);}document.querySelectorAll('[data-graph-filter]').forEach(btn=>{btn.addEventListener('click',()=>{graphType=btn.dataset.graphFilter||'all';document.querySelectorAll('[data-graph-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-ext-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileExt=btn.dataset.fileExtFilter||'all';document.querySelectorAll('[data-file-ext-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-dir-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileDir=btn.dataset.fileDirFilter||'all';document.querySelectorAll('[data-file-dir-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-source-evidence-filter]').forEach(btn=>{btn.addEventListener('click',()=>{sourceEvidence=btn.dataset.sourceEvidenceFilter||'all';document.querySelectorAll('[data-source-evidence-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-evidence-kind-filter]').forEach(btn=>{btn.addEventListener('click',()=>{evidenceKind=btn.dataset.evidenceKindFilter||'all';document.querySelectorAll('[data-evidence-kind-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-quiz-section-filter]').forEach(btn=>{btn.addEventListener('click',()=>{quizSection=btn.dataset.quizSectionFilter||'all';document.querySelectorAll('[data-quiz-section-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-quiz-difficulty-filter]').forEach(btn=>{btn.addEventListener('click',()=>{quizDifficulty=btn.dataset.quizDifficultyFilter||'all';document.querySelectorAll('[data-quiz-difficulty-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-download-mermaid]').forEach(btn=>{btn.addEventListener('click',()=>{const source=document.getElementById(btn.dataset.downloadMermaid||'');if(!source)return;const blob=new Blob([source.textContent||''],{type:'text/plain'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='component-graph.mmd';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);});});const learningProgressKey='repotutor:learning-path:'+location.pathname;let learningProgress=new Set();try{learningProgress=new Set(JSON.parse(localStorage.getItem(learningProgressKey)||'[]'));}catch{}function saveLearningProgress(){try{localStorage.setItem(learningProgressKey,JSON.stringify([...learningProgress]));}catch{}}const learningProgressSummary=document.querySelector('[data-learning-progress-summary]');function updateLearningProgressSummary(){if(learningProgressSummary){const inputs=document.querySelectorAll('[data-learning-step-complete]');const completed=Array.from(inputs).filter(input=>input.checked).length;learningProgressSummary.textContent='완료 '+completed+' / '+inputs.length;}}document.querySelectorAll('[data-learning-step-complete]').forEach(input=>{const step=input.dataset.learningStepComplete||'';input.checked=learningProgress.has(step);input.addEventListener('change',()=>{if(input.checked){learningProgress.add(step);}else{learningProgress.delete(step);}saveLearningProgress();updateLearningProgressSummary();});});updateLearningProgressSummary();document.querySelectorAll('[data-reset-learning-progress]').forEach(btn=>{btn.addEventListener('click',()=>{learningProgress.clear();saveLearningProgress();document.querySelectorAll('[data-learning-step-complete]').forEach(input=>{input.checked=false;});updateLearningProgressSummary();});});const picked=new Map();const score=document.querySelector('#quiz-live-score');document.querySelectorAll('[data-reset-quiz]').forEach(btn=>{btn.addEventListener('click',()=>{picked.clear();document.querySelectorAll('.choice').forEach(choice=>{choice.disabled=false;choice.classList.remove('correct','wrong');});if(score){score.textContent='아직 선택한 문제가 없습니다.';}});});document.querySelectorAll('.choice').forEach(btn=>{btn.addEventListener('click',()=>{const q=btn.dataset.question;document.querySelectorAll('.choice[data-question="'+q+'"]').forEach(b=>b.disabled=true);const ok=btn.dataset.correct==='true';btn.classList.add(ok?'correct':'wrong');picked.set(q,ok);if(!ok){document.querySelectorAll('.choice[data-question="'+q+'"][data-correct="true"]').forEach(b=>b.classList.add('correct'));}if(score){const total=picked.size;const correct=[...picked.values()].filter(Boolean).length;score.textContent='현재 브라우저 복습 점수: '+correct+' / '+total;}});});`;
}
