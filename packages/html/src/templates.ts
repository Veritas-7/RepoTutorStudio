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
    ["language.html", "Language"],
    ["architecture.html", "Architecture"],
    ["folders.html", "Folders"],
    ["files.html", "Files"],
    ["coverage.html", "Coverage"],
    ["component-graph.html", "Component Graph"],
    ["incremental.html", "Incremental"],
    ["flow.html", "Flow"],
    ["glossary.html", "Glossary"],
    ["rebuild.html", "Rebuild"],
    ["quiz.html", "Quiz"],
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
  const coverageDelta = coverageDeltaFor(input.incrementalReport);
  const graphSummary = graphSummaryFor(input.componentGraphReport);
  const graphFilters = graphFilterButtons(input.componentGraphReport.nodes);
  const fileNavigation = fileNavigationFor(input.fileLessons);
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
          <article><h3>학습 지도</h3>${list(["Overview", "Language", "Folders", "Files", "Flow", "Glossary", "Rebuild", "Quiz"])}</article>
          <article><h3>커버리지</h3><p>${(input.coverageReport.coverageRatio * 100).toFixed(1)}% · 핵심 파일 ${input.coverageReport.coveredImportantFiles}개 설명</p><a href="coverage.html">커버리지 열기</a></article>
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
      html: pageShell("핵심 파일 수업", "files.html", `<section class="panel"><h2>파일 탐색 필터</h2><p>${escapeHtml(fileNavigation.summary)}</p><h3>확장자</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="file extension filters">${fileNavigation.extensionButtons}</div><h3>상위 폴더</h3><div class="toolbar file-nav-toolbar" role="toolbar" aria-label="file directory filters">${fileNavigation.directoryButtons}</div></section><section class="cards file-lesson-cards">${input.fileLessons.map((lesson) => `<article id="${htmlAnchor(lesson.filePath)}" data-file-ext="${escapeHtml(fileExtension(lesson.filePath))}" data-file-dir="${escapeHtml(topDirectory(lesson.filePath))}"><h3>${escapeHtml(lesson.filePath)}</h3><p class="muted">${escapeHtml(topDirectory(lesson.filePath))} · ${escapeHtml(fileExtension(lesson.filePath))}</p><p>${escapeHtml(lesson.beginnerExplanation)}</p><p>${escapeHtml(lesson.whyItExists)}</p><h4>관련 용어</h4>${list(lesson.glossaryTerms)}</article>`).join("")}</section>`, input)
    },
    {
      name: "coverage.html",
      title: "학습 커버리지",
      html: pageShell("학습 커버리지", "coverage.html", `<section class="panel"><h2>커버리지 요약</h2><p>${escapeHtml(input.coverageReport.beginnerExplanation)}</p><dl class="meta"><div><dt>전체 파일</dt><dd>${input.coverageReport.totalScannedFiles}</dd></div><div><dt>핵심 파일 설명</dt><dd>${input.coverageReport.coveredImportantFiles}</dd></div><div><dt>비율</dt><dd>${(input.coverageReport.coverageRatio * 100).toFixed(1)}%</dd></div></dl></section><section class="grid"><article><h3>우선 확인 폴더</h3>${list(input.coverageReport.highPriorityFolders.map((folder) => `${folder.folderPath}: ${folder.reason}`))}</article><article><h3>미커버 후보</h3>${list(input.coverageReport.uncoveredImportantFiles)}</article></section>`, input)
    },
    {
      name: "component-graph.html",
      title: "컴포넌트 그래프",
      html: pageShell("컴포넌트 그래프", "component-graph.html", `<section class="panel"><h2>관계도</h2><p>${escapeHtml(input.componentGraphReport.beginnerExplanation)}</p><pre>${escapeHtml(input.componentGraphReport.mermaid)}</pre></section><section class="panel"><h2>큰 그래프 요약</h2><p>${escapeHtml(graphSummary.largeRepoAdvice)}</p><dl class="meta"><div><dt>노드</dt><dd>${graphSummary.totalNodes}</dd></div><div><dt>관계</dt><dd>${graphSummary.totalEdges}</dd></div></dl><h3>노드 타입</h3>${list(Object.entries(graphSummary.nodeTypeCounts).map(([type, count]) => `${type}: ${count}`))}<h3>핵심 허브</h3>${list(graphSummary.topConnectedNodes.map((node) => `${node.label} [${node.type}] · degree ${node.degree}`))}</section><section class="panel"><h2>노드 필터</h2><div class="toolbar graph-filter-toolbar" role="toolbar" aria-label="component graph filters">${graphFilters}</div></section><section class="grid"><article><h3>진입 노드</h3>${list(input.componentGraphReport.entryNodeIds)}</article><article><h3>관계</h3>${list(input.componentGraphReport.edges.slice(0, 40).map((edge) => `${edge.from} -> ${edge.to}: ${edge.label}`))}</article></section><section class="cards component-node-cards">${input.componentGraphReport.nodes.map((node) => `<article id="${node.id}" data-node-type="${escapeHtml(node.type)}"><h3>${escapeHtml(node.label)}</h3><p class="muted">${escapeHtml(node.type)}</p><p>${escapeHtml(node.summary)}</p>${node.href ? `<a href="${escapeHtml(node.href)}">관련 학습 섹션</a>` : ""}</article>`).join("")}</section>`, input)
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
      html: pageShell("퀴즈", "quiz.html", `<section class="panel"><h2>오프라인 복습 모드</h2><p>브라우저에서 선택지를 눌러 즉시 정답을 확인할 수 있습니다. 응시 기록 저장과 오답노트 반영은 CLI 또는 Tauri 앱에서 수행합니다.</p><p id="quiz-live-score" class="muted">아직 선택한 문제가 없습니다.</p></section><section class="cards quiz-board">${input.quiz.questions.map((question, index) => `<article id="${question.id}" class="quiz-card"><h3>${index + 1}. ${escapeHtml(question.question)}</h3><div class="choice-grid">${Object.entries(question.choices).map(([key, value]) => `<button class="choice" data-correct="${key === question.correctChoice}" data-question="${question.id}"><strong>${key}</strong>. ${escapeHtml(value)}</button>`).join("")}</div><details><summary>정답과 해설</summary><p>${escapeHtml(question.correctChoice)}: ${escapeHtml(question.explanation)}</p></details></article>`).join("")}</section>`, input)
    },
    {
      name: "wrong-notes.html",
      title: "오답노트",
      html: pageShell("오답노트", "wrong-notes.html", `<section class="cards">${input.wrongNotes.length === 0 ? "<article><h3>아직 오답이 없습니다.</h3><p>퀴즈를 풀면 이곳에 복습 자료가 쌓입니다.</p></article>" : input.wrongNotes.map((note) => `<article id="${note.questionId}"><h3>${escapeHtml(note.question)}</h3><p>내 답: ${note.selectedChoice} / 정답: ${note.correctChoice}</p><p>${escapeHtml(note.reviewText)}</p><h4>미니 강의</h4><p>${escapeHtml(note.miniLesson)}</p><label><input type="checkbox"> 복습 완료</label></article>`).join("")}</section>`, input)
    }
  ];

  const assets = {
    "assets/style.css": styleCss(),
    "assets/app.js": appJs()
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
      { label: "오답노트", path: "html/wrong-notes.html", description: "틀린 문제를 다시 보는 페이지입니다." },
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

function fileNavigationFor(files: FileLesson[]): { summary: string; extensionButtons: string; directoryButtons: string } {
  const extensionCounts = countBy(files.map((file) => fileExtension(file.filePath)));
  const directoryCounts = countBy(files.map((file) => topDirectory(file.filePath)));
  return {
    summary: `핵심 파일 ${files.length}개를 확장자와 상위 폴더 기준으로 좁혀 볼 수 있습니다.`,
    extensionButtons: fileFilterButtons("file-ext-filter", "전체 확장자", extensionCounts),
    directoryButtons: fileFilterButtons("file-dir-filter", "전체 폴더", directoryCounts, 12)
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

function fileExtension(filePath: string): string {
  const fileName = filePath.split("/").at(-1) ?? filePath;
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot).toLowerCase() : "no-ext";
}

function topDirectory(filePath: string): string {
  return filePath.includes("/") ? filePath.split("/")[0] : "root";
}

export function styleCss(): string {
  return `:root{color-scheme:light;--bg:#f7f8fa;--panel:#fff;--text:#17202a;--muted:#64748b;--line:#d9e0ea;--accent:#0f766e;--accent-weak:#e6f4f1}*{box-sizing:border-box}body{margin:0;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text);display:grid;grid-template-columns:240px 1fr;min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;padding:20px;border-right:1px solid var(--line);background:#fff}.sidebar strong{display:block;font-size:18px;margin-bottom:16px}.sidebar input{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:6px;margin-bottom:14px}.sidebar nav{display:grid;gap:4px}.sidebar a{color:var(--text);text-decoration:none;padding:8px 10px;border-radius:6px}.sidebar a.active,.sidebar a:hover{background:var(--accent-weak);color:var(--accent)}main{padding:28px;max-width:1180px;width:100%}.page-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.eyebrow{color:var(--accent);font-weight:700;margin:0 0 4px}h1,h2,h3{line-height:1.25;margin:0 0 12px}h1{font-size:32px}.lead{font-size:18px}.meta{display:grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:8px;margin:0}.meta div,.panel,article{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:16px}.meta dt{font-size:12px;color:var(--muted)}.meta dd{margin:0;font-weight:700}.panel{margin-bottom:16px}.grid,.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px}.cards article{min-height:150px}.muted{color:var(--muted)}pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;overflow:auto}.toolbar{display:flex;flex-wrap:wrap;gap:8px}.toolbar button{border:1px solid var(--line);background:#fff;color:var(--text);border-radius:6px;padding:8px 10px;cursor:pointer}.toolbar button.active,.toolbar button:hover{border-color:var(--accent);background:var(--accent-weak);color:var(--accent)}details{border-top:1px solid var(--line);margin-top:12px;padding-top:10px}.choice-grid{display:grid;gap:8px}.choice{width:100%;text-align:left;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--text);padding:9px 10px;cursor:pointer}.choice.correct{border-color:#15803d;background:#eaf7ee}.choice.wrong{border-color:#b91c1c;background:#fdecec}.choice:disabled{cursor:default;color:var(--text)}@media(max-width:760px){body{grid-template-columns:1fr}.sidebar{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}main{padding:18px}.page-header{display:block}.meta{grid-template-columns:1fr 1fr}}`;
}

export function appJs(): string {
  return `const search=document.querySelector('#search');let graphType='all';let fileExt='all';let fileDir='all';function applyVisibility(){const q=search?search.value.toLowerCase():'';document.querySelectorAll('article,.panel').forEach(el=>{const textOk=!q||el.textContent.toLowerCase().includes(q);const nodeType=el.dataset.nodeType;const graphOk=!nodeType||graphType==='all'||nodeType===graphType;const ext=el.dataset.fileExt;const dir=el.dataset.fileDir;const fileOk=(!ext||fileExt==='all'||ext===fileExt)&&(!dir||fileDir==='all'||dir===fileDir);el.style.display=textOk&&graphOk&&fileOk?'':'none';});}if(search){search.addEventListener('input',applyVisibility);}document.querySelectorAll('[data-graph-filter]').forEach(btn=>{btn.addEventListener('click',()=>{graphType=btn.dataset.graphFilter||'all';document.querySelectorAll('[data-graph-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-ext-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileExt=btn.dataset.fileExtFilter||'all';document.querySelectorAll('[data-file-ext-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});document.querySelectorAll('[data-file-dir-filter]').forEach(btn=>{btn.addEventListener('click',()=>{fileDir=btn.dataset.fileDirFilter||'all';document.querySelectorAll('[data-file-dir-filter]').forEach(other=>other.classList.toggle('active',other===btn));applyVisibility();});});const picked=new Map();const score=document.querySelector('#quiz-live-score');document.querySelectorAll('.choice').forEach(btn=>{btn.addEventListener('click',()=>{const q=btn.dataset.question;document.querySelectorAll('.choice[data-question="'+q+'"]').forEach(b=>b.disabled=true);const ok=btn.dataset.correct==='true';btn.classList.add(ok?'correct':'wrong');picked.set(q,ok);if(!ok){document.querySelectorAll('.choice[data-question="'+q+'"][data-correct="true"]').forEach(b=>b.classList.add('correct'));}if(score){const total=picked.size;const correct=[...picked.values()].filter(Boolean).length;score.textContent='현재 브라우저 복습 점수: '+correct+' / '+total;}});});`;
}
