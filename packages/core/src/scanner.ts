import fs from "node:fs/promises";
import path from "node:path";
import {
  ArchitectureReport,
  DEPENDENCY_FILES,
  DEFAULT_REPO_MAP_DEPTH,
  DependencyReport,
  FileLesson,
  FlowReport,
  FolderLesson,
  GlossaryTerm,
  EvidenceIndexReport,
  LANGUAGE_BY_EXTENSION,
  LanguageReport,
  PurposeReport,
  RebuildRoadmap,
  CoverageReport,
  ComponentGraphReport,
  SourceSnapshotReport,
  IncrementalReport,
  SuggestedReadsReport,
  RuntimeEnvironmentReport,
  InterfaceMapReport,
  SymbolMapReport,
  ContextPackReport,
  McpHandoffReport,
  AgentMemoryReport,
  GraphQueryReport,
  RepoMap,
  htmlAnchor
} from "@repotutor/shared";
import { readTextIfSafe, WalkResult, walkSafe } from "./fs-utils.js";

export interface AnalysisBundle {
  repoMap: RepoMap;
  languageReport: LanguageReport;
  dependencyReport: DependencyReport;
  purposeReport: PurposeReport;
  architectureReport: ArchitectureReport;
  folderLessons: FolderLesson[];
  fileLessons: FileLesson[];
  coverageReport: CoverageReport;
  evidenceIndexReport: EvidenceIndexReport;
  suggestedReadsReport: SuggestedReadsReport;
  runtimeEnvironmentReport: RuntimeEnvironmentReport;
  interfaceMapReport: InterfaceMapReport;
  symbolMapReport: SymbolMapReport;
  contextPackReport: ContextPackReport;
  mcpHandoffReport: McpHandoffReport;
  agentMemoryReport: AgentMemoryReport;
  graphQueryReport: GraphQueryReport;
  componentGraphReport: ComponentGraphReport;
  sourceSnapshotReport: SourceSnapshotReport;
  incrementalReport: IncrementalReport;
  flowReport: FlowReport;
  glossary: GlossaryTerm[];
  rebuildRoadmap: RebuildRoadmap;
}

export async function analyzeRepository(sourceRoot: string): Promise<AnalysisBundle> {
  const walk = await walkSafe(sourceRoot);
  const repoMap = buildRepoMap(sourceRoot, walk);
  const languageReport = buildLanguageReport(walk);
  const dependencyReport = await buildDependencyReport(sourceRoot, walk);
  const purposeReport = await buildPurposeReport(sourceRoot, walk, languageReport, repoMap);
  const architectureReport = buildArchitectureReport(repoMap, languageReport, dependencyReport);
  const folderLessons = buildFolderLessons(repoMap);
  const fileLessons = await buildFileLessons(sourceRoot, walk);
  const coverageReport = buildCoverageReport(repoMap, fileLessons);
  const evidenceIndexReport = buildEvidenceIndexReport(fileLessons);
  const suggestedReadsReport = buildSuggestedReadsReport(fileLessons);
  const runtimeEnvironmentReport = buildRuntimeEnvironmentReport(walk, dependencyReport);
  const interfaceMapReport = await buildInterfaceMapReport(walk);
  const symbolMapReport = await buildSymbolMapReport(walk, fileLessons);
  const contextPackReport = buildContextPackReport(walk, fileLessons);
  const mcpHandoffReport = buildMcpHandoffReport(repoMap, contextPackReport);
  const flowReport = buildFlowReport(fileLessons, dependencyReport);
  const glossary = buildGlossary(languageReport, dependencyReport, fileLessons);
  const rebuildRoadmap = buildRebuildRoadmap(repoMap, fileLessons);
  const componentGraphReport = buildComponentGraphReport(folderLessons, fileLessons, glossary, rebuildRoadmap);
  const graphQueryReport = buildGraphQueryReport(componentGraphReport);
  const agentMemoryReport = buildAgentMemoryReport(repoMap, languageReport, purposeReport, contextPackReport, mcpHandoffReport, componentGraphReport);
  const sourceSnapshotReport = await buildSourceSnapshotReport(walk);
  const incrementalReport = emptyIncrementalReport(coverageReport);
  return { repoMap, languageReport, dependencyReport, purposeReport, architectureReport, folderLessons, fileLessons, coverageReport, evidenceIndexReport, suggestedReadsReport, runtimeEnvironmentReport, interfaceMapReport, symbolMapReport, contextPackReport, mcpHandoffReport, agentMemoryReport, graphQueryReport, componentGraphReport, sourceSnapshotReport, incrementalReport, flowReport, glossary, rebuildRoadmap };
}

function buildRepoMap(sourceRoot: string, walk: WalkResult): RepoMap {
  const extensionDistribution: Record<string, number> = {};
  for (const file of walk.files) {
    const key = file.ext || "[no extension]";
    extensionDistribution[key] = (extensionDistribution[key] ?? 0) + 1;
  }

  const folderRows = walk.folders
    .filter((folder) => folder.split("/").length <= DEFAULT_REPO_MAP_DEPTH)
    .map((folder) => {
      const files = walk.files.filter((file) => file.relPath.startsWith(`${folder}/`));
      const directFiles = files
        .filter((file) => file.relPath.slice(folder.length + 1).split("/").length === 1)
        .map((file) => path.basename(file.relPath))
        .slice(0, 5);
      return {
        folderPath: folder,
        fileCount: files.length,
        representativeFiles: directFiles,
        inferredRole: inferFolderRole(folder),
        depth: folder.split("/").length
      };
    });

  const treeMarkdown = [
    ".",
    ...folderRows.map((folder) => `${"  ".repeat(folder.depth - 1)}- ${folder.folderPath}/ (${folder.inferredRole})`)
  ].join("\n");

  return {
    root: sourceRoot,
    totalFiles: walk.files.length,
    totalFolders: walk.folders.length,
    totalBytes: walk.totalBytes,
    extensionDistribution,
    excludedPaths: walk.excludedPaths,
    secretCandidatePaths: walk.secretCandidatePaths,
    folders: folderRows,
    treeMarkdown
  };
}

function buildLanguageReport(walk: WalkResult): LanguageReport {
  const counts = new Map<string, number>();
  for (const file of walk.files) {
    const language = LANGUAGE_BY_EXTENSION[file.ext] ?? "Other";
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const primaryLanguage = sorted[0]?.[0] ?? "Unknown";
  return {
    primaryLanguage,
    secondaryLanguages: sorted.slice(1, 6).map(([language]) => language),
    languageRoles: sorted.slice(0, 8).map(([language, fileCount]) => ({
      language,
      fileCount,
      role: inferLanguageRole(language),
      beginnerExplanation: `${language}는 이 프로젝트에서 ${inferLanguageRole(language)} 역할을 맡는 언어 또는 파일 형식입니다.`,
      tradeoffs: explainLanguageTradeoff(language)
    }))
  };
}

async function buildDependencyReport(sourceRoot: string, walk: WalkResult): Promise<DependencyReport> {
  const manifests = [];
  for (const file of walk.files.filter((candidate) => DEPENDENCY_FILES.has(path.basename(candidate.relPath)))) {
    const text = await readTextIfSafe(file.absPath, 400_000);
    manifests.push({
      filePath: file.relPath,
      ecosystem: inferEcosystem(file.relPath),
      dependencies: extractDependencies(file.relPath, text)
    });
  }
  void sourceRoot;
  return { manifests };
}

async function buildPurposeReport(sourceRoot: string, walk: WalkResult, languageReport: LanguageReport, repoMap: RepoMap): Promise<PurposeReport> {
  const readme = walk.files.find((file) => /^readme\.(md|txt)$/i.test(path.basename(file.relPath)));
  const packageJson = walk.files.find((file) => path.basename(file.relPath) === "package.json");
  const readmeText = readme ? await readTextIfSafe(readme.absPath, 40_000) : null;
  const packageText = packageJson ? await readTextIfSafe(packageJson.absPath, 40_000) : null;
  const packageName = packageText ? safeJsonField(packageText, "name") : null;
  const firstHeading = readmeText?.match(/^#\s+(.+)$/m)?.[1] ?? packageName ?? path.basename(sourceRoot);
  const majorFeatures = [
    ...repoMap.folders.slice(0, 5).map((folder) => `${folder.folderPath} 폴더 기반 기능`),
    ...languageReport.languageRoles.slice(0, 3).map((role) => `${role.language} 기반 구현`)
  ];
  return {
    oneLineSummary: `${firstHeading} 프로젝트는 ${languageReport.primaryLanguage} 중심의 소프트웨어로, 폴더와 설정 파일을 통해 기능을 나누어 구현합니다.`,
    longExplanation: `${firstHeading}는 README, 의존성 파일, 폴더 구조를 기준으로 보면 ${languageReport.primaryLanguage}가 핵심인 프로젝트입니다. RepoTutor는 확실한 파일 근거와 추론을 구분해 초보자가 목적, 구조, 실행 흐름을 이해하도록 설명합니다.`,
    targetUsers: ["프로젝트 구조를 배우려는 개발 입문자", "비슷한 앱을 다시 만들고 싶은 학습자"],
    solvedProblems: ["낯선 저장소의 목적과 구조를 빠르게 파악하기 어렵다.", "어떤 파일부터 읽고 어떤 순서로 따라 만들어야 하는지 알기 어렵다."],
    majorFeatures,
    similarType: `${languageReport.primaryLanguage} 기반 앱 또는 라이브러리`,
    beginnerAnalogy: "처음 보는 건물을 설계도와 방 이름을 보며 둘러보는 것처럼, 이 리포트는 저장소의 방마다 왜 있는지 안내합니다.",
    evidence: [readme?.relPath, packageJson?.relPath, ...repoMap.folders.slice(0, 3).map((folder) => folder.folderPath)].filter(Boolean) as string[]
  };
}

function buildArchitectureReport(repoMap: RepoMap, languageReport: LanguageReport, dependencyReport: DependencyReport): ArchitectureReport {
  const hasApps = repoMap.folders.some((folder) => folder.folderPath === "apps" || folder.folderPath.startsWith("apps/"));
  const hasPackages = repoMap.folders.some((folder) => folder.folderPath === "packages" || folder.folderPath.startsWith("packages/"));
  const style = hasApps && hasPackages ? "monorepo architecture" : hasPackages ? "package-based architecture" : "folder-based modular architecture";
  const nodes = repoMap.folders.slice(0, 8).map((folder) => `  root --> ${htmlAnchor(folder.folderPath)}["${folder.folderPath}"]`).join("\n");
  return {
    architectureStyle: style,
    explanation: `${style}로 추정됩니다. 이 판단은 최상위 폴더, 의존성 매니페스트, 주요 언어 분포를 함께 본 결과이며 단정이 아니라 근거 기반 추론입니다.`,
    evidence: [
      `primary language: ${languageReport.primaryLanguage}`,
      `folders: ${repoMap.folders.slice(0, 6).map((folder) => folder.folderPath).join(", ")}`,
      `manifests: ${dependencyReport.manifests.map((manifest) => manifest.filePath).join(", ") || "none"}`
    ],
    mermaid: `flowchart TD\n  root["repo root"]\n${nodes || "  root --> source[\"source files\"]"}`
  };
}

function buildFolderLessons(repoMap: RepoMap): FolderLesson[] {
  return repoMap.folders.slice(0, 40).map((folder) => ({
    folderPath: folder.folderPath,
    role: folder.inferredRole,
    beginnerExplanation: `${folder.folderPath} 폴더는 ${folder.inferredRole}로 보입니다. 폴더는 관련 파일을 한곳에 모아 사람이 길을 잃지 않게 하는 지도 역할을 합니다.`,
    whyItExists: `${folder.fileCount}개 파일을 역할별로 묶어 프로젝트를 관리하기 쉽게 만듭니다.`,
    whatWouldBreakIfRemoved: "이 폴더가 실제 코드 또는 설정을 담고 있다면 빌드, 실행, 문서, 테스트 중 일부가 깨질 수 있습니다.",
    relatedFolders: repoMap.folders.filter((other) => other.folderPath !== folder.folderPath && other.folderPath.startsWith(folder.folderPath.split("/")[0])).slice(0, 5).map((other) => other.folderPath),
    importantFiles: folder.representativeFiles,
    designReasoning: "이름, 깊이, 대표 파일을 기준으로 역할을 추론했습니다.",
    rebuildAdvice: "비슷한 프로젝트를 만들 때는 먼저 이 폴더가 담는 책임을 한 문장으로 정하고, 그 책임에 맞는 파일만 넣으세요."
  }));
}

async function buildFileLessons(sourceRoot: string, walk: WalkResult): Promise<FileLesson[]> {
  const important = walk.files.filter(isImportantFile).slice(0, 50);
  const lessons: FileLesson[] = [];
  for (const file of important) {
    const text = file.isTextCandidate ? await readTextIfSafe(file.absPath, 60_000) : null;
    lessons.push({
      filePath: file.relPath,
      role: inferFileRole(file.relPath),
      beginnerExplanation: `${file.relPath} 파일은 ${inferFileRole(file.relPath)} 역할을 합니다. 초보자는 이 파일을 프로젝트가 어디서 시작하고 무엇을 의존하는지 알려주는 표지판으로 보면 됩니다.`,
      whyItExists: "설정, 진입점(entry point), 도메인 로직(domain logic), 또는 테스트 근거를 명시하기 위해 존재합니다.",
      sourceEvidence: extractSourceEvidence(text, file.relPath),
      keyExports: extractRegex(text, /export\s+(?:class|function|const|interface|type)\s+([A-Za-z0-9_]+)/g),
      keyImports: extractRegex(text, /import\s+.*?\s+from\s+["']([^"']+)["']/g),
      relatedFiles: relatedByFolder(file.relPath, important.map((candidate) => candidate.relPath)),
      executionFlowPosition: inferFlowPosition(file.relPath),
      rebuildAdvice: "맨땅에서 만들 때는 이 파일이 기대하는 입력과 출력부터 정하고, 가장 작은 동작 예시를 만든 뒤 확장하세요.",
      glossaryTerms: glossaryTermsForFile(file.relPath)
    });
  }
  void sourceRoot;
  return lessons;
}

function buildFlowReport(fileLessons: FileLesson[], dependencyReport: DependencyReport): FlowReport {
  const starts = fileLessons.filter((file) => /main|index|cli|app|lib|server/i.test(path.basename(file.filePath))).slice(0, 8).map((file) => file.filePath);
  return {
    startPoints: starts,
    cliFlow: ["사용자가 명령어 또는 UI 입력을 제공한다.", "입력 판별(intake)이 source type을 결정한다.", "scanner가 파일과 폴더를 읽는다.", "lesson/quiz/html 생성기가 결과를 저장한다."],
    appFlow: ["Tauri UI가 사용자의 입력을 받는다.", "Rust command가 Node sidecar를 호출한다.", "Node sidecar가 shared core pipeline을 실행한다.", "HTML preview와 session list가 갱신된다."],
    dataFlow: dependencyReport.manifests.length > 0 ? dependencyReport.manifests.map((manifest) => `${manifest.filePath} -> dependency report`) : ["source files -> analysis JSON -> Markdown -> HTML"],
    mermaid: "flowchart LR\n  Input[User input] --> Intake\n  Intake --> Scan\n  Scan --> Lessons\n  Lessons --> Quiz\n  Quiz --> WrongNotes\n  WrongNotes --> HTML"
  };
}

function buildCoverageReport(repoMap: RepoMap, fileLessons: FileLesson[]): CoverageReport {
  const covered = new Set(fileLessons.map((lesson) => lesson.filePath));
  const evidenceBackedFiles = fileLessons.filter((lesson) => lesson.sourceEvidence.length > 0).length;
  const filesWithoutEvidence = fileLessons.filter((lesson) => lesson.sourceEvidence.length === 0).map((lesson) => lesson.filePath);
  const evidenceKindCounts = countBy(fileLessons.flatMap((lesson) => lesson.sourceEvidence.map((item) => item.kind)));
  const importantCandidates = [
    ...repoMap.folders.flatMap((folder) => folder.representativeFiles.map((file) => `${folder.folderPath}/${file}`)),
    ...fileLessons.map((lesson) => lesson.filePath)
  ];
  const uniqueCandidates = [...new Set(importantCandidates)].filter(Boolean);
  const uncoveredImportantFiles = uniqueCandidates.filter((file) => !covered.has(file)).slice(0, 30);
  const highPriorityFolders = repoMap.folders
    .filter((folder) => folder.fileCount > 0)
    .sort((a, b) => b.fileCount - a.fileCount)
    .slice(0, 8)
    .map((folder) => ({
      folderPath: folder.folderPath,
      reason: `${folder.fileCount}개 파일이 있어 학습자가 구조를 놓치기 쉬운 폴더입니다.`
    }));
  return {
    totalScannedFiles: repoMap.totalFiles,
    coveredImportantFiles: fileLessons.length,
    coverageRatio: repoMap.totalFiles === 0 ? 0 : Math.min(1, fileLessons.length / repoMap.totalFiles),
    evidenceBackedFiles,
    evidenceCoverageRatio: fileLessons.length === 0 ? 0 : evidenceBackedFiles / fileLessons.length,
    evidenceKindCounts,
    filesWithoutEvidence: filesWithoutEvidence.slice(0, 30),
    uncoveredImportantFiles,
    highPriorityFolders,
    beginnerExplanation: "coverage report는 전체 파일 중 학습 리포트가 자세히 설명한 핵심 파일의 비율을 보여줍니다. 낮으면 빠진 핵심 파일이 없는지 다시 살펴봐야 합니다."
  };
}

function buildEvidenceIndexReport(fileLessons: FileLesson[]): EvidenceIndexReport {
  const items = fileLessons.flatMap((lesson) => lesson.sourceEvidence.map((item) => ({
    filePath: lesson.filePath,
    line: item.line,
    kind: item.kind,
    snippet: item.snippet,
    lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
    sourcePath: `source/${lesson.filePath}`,
    sourceHref: `source/${lesson.filePath.split("/").map(encodeURIComponent).join("/")}`
  })));
  return {
    totalEvidenceItems: items.length,
    evidenceByKind: countBy(items.map((item) => item.kind)),
    evidenceByFile: countBy(items.map((item) => item.filePath)),
    items
  };
}

function buildSuggestedReadsReport(fileLessons: FileLesson[]): SuggestedReadsReport {
  const scored = fileLessons.map((lesson, index) => ({
    lesson,
    score: suggestedReadScore(lesson, index)
  })).sort((a, b) => b.score - a.score || a.lesson.filePath.localeCompare(b.lesson.filePath));
  const items = scored.slice(0, 8).map(({ lesson }, index) => ({
    rank: index + 1,
    filePath: lesson.filePath,
    reason: [
      `소스 근거 ${lesson.sourceEvidence.length}개`,
      `관련 파일 ${lesson.relatedFiles.length}개`,
      lesson.executionFlowPosition
    ].join(" · "),
    evidenceCount: lesson.sourceEvidence.length,
    relatedFileCount: lesson.relatedFiles.length,
    lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
    sourceHref: `source/${encodedPath(lesson.filePath)}`
  }));
  return {
    summary: `Repo Baby식 추천 읽기: ${items.length}개 핵심 파일을 먼저 읽도록 정렬했습니다.`,
    sourcePattern: "Repo Baby suggested_reads importance-ranked next reads",
    items
  };
}

function buildRuntimeEnvironmentReport(walk: WalkResult, dependencyReport: DependencyReport): RuntimeEnvironmentReport {
  const detectedManifests = dependencyReport.manifests.map((manifest) => ({
    filePath: manifest.filePath,
    ecosystem: manifest.ecosystem,
    signal: `${manifest.dependencies.length}개 의존성 또는 설정 항목을 확인했습니다.`
  }));
  const setupFiles = walk.files.filter((file) => setupSignalFor(file.relPath) !== null);
  const containerFiles = walk.files.filter((file) => containerSignalFor(file.relPath) !== null);
  const setupSignals = setupFiles.slice(0, 12).map((file) => ({
    filePath: file.relPath,
    signal: setupSignalFor(file.relPath) ?? "setup file",
    beginnerExplanation: `${file.relPath} 파일은 실행 전에 필요한 설치, 스크립트, 환경 변수 단서를 제공합니다.`
  }));
  const containerSignals = containerFiles.slice(0, 12).map((file) => ({
    filePath: file.relPath,
    signal: containerSignalFor(file.relPath) ?? "container file",
    beginnerExplanation: `${file.relPath} 파일은 컨테이너 또는 서비스 실행 방식을 추정하는 근거입니다.`
  }));
  const serviceHints = [
    ...detectedManifests.map((manifest) => ({
      name: manifest.ecosystem,
      reason: `${manifest.filePath} 기준으로 ${manifest.ecosystem} 런타임 준비가 필요합니다.`,
      sourcePath: manifest.filePath
    })),
    ...containerSignals.map((signal) => ({
      name: signal.filePath.toLowerCase().includes("compose") ? "Docker Compose" : "Docker",
      reason: signal.signal,
      sourcePath: signal.filePath
    }))
  ].slice(0, 12);
  const missingSignals = [
    setupSignals.length === 0 ? "설치/실행 매니페스트를 찾지 못했습니다." : null,
    containerSignals.length === 0 ? "Dockerfile 또는 Compose 파일을 찾지 못했습니다." : null,
    walk.files.some((file) => /\.env\.example$|\.env\.sample$/i.test(file.relPath)) ? null : ".env.example 또는 .env.sample 예시 파일이 보이지 않습니다."
  ].filter(Boolean) as string[];
  return {
    summary: `docSmith식 실행 환경 점검: manifest ${detectedManifests.length}개, container signal ${containerSignals.length}개, setup signal ${setupSignals.length}개를 정적으로 확인했습니다.`,
    sourcePattern: "docSmith Dockerfile and Docker Compose generation prompts",
    detectedManifests,
    setupSignals,
    containerSignals,
    serviceHints,
    missingSignals,
    learnerNextSteps: [
      "manifest 파일에서 설치 명령과 런타임 버전을 먼저 확인하세요.",
      "Dockerfile이나 Compose 파일이 있으면 로컬 실행 방식과 컨테이너 실행 방식을 비교하세요.",
      ".env.example이 없으면 필요한 환경 변수를 README와 config 파일에서 따로 추적하세요."
    ]
  };
}

function setupSignalFor(filePath: string): string | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "package.json") return "Node package scripts/dependencies";
  if (base === "requirements.txt") return "Python pip requirements";
  if (base === "pyproject.toml") return "Python project metadata";
  if (base === "cargo.toml") return "Rust cargo manifest";
  if (base === "go.mod") return "Go module manifest";
  if (/^readme\.(md|txt)$/i.test(base)) return "README setup instructions";
  if (/\.env\.example$|\.env\.sample$/i.test(filePath)) return "environment variable example";
  return null;
}

function containerSignalFor(filePath: string): string | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "dockerfile" || base.endsWith(".dockerfile")) return "Dockerfile container recipe";
  if (base === "docker-compose.yml" || base === "docker-compose.yaml" || base === "compose.yml" || base === "compose.yaml") return "Docker Compose service map";
  return null;
}

async function buildInterfaceMapReport(walk: WalkResult): Promise<InterfaceMapReport> {
  const routeSignals = walk.files
    .map((file) => ({ filePath: file.relPath, kind: routeKindFor(file.relPath), signal: routeSignalFor(file.relPath), sourceHref: `source/${encodedPath(file.relPath)}` }))
    .filter((item) => item.kind !== null && item.signal !== null)
    .map((item) => ({ filePath: item.filePath, kind: item.kind as string, signal: item.signal as string, sourceHref: item.sourceHref }))
    .slice(0, 30);
  const apiSignals: InterfaceMapReport["apiSignals"] = [];
  const componentSignals: InterfaceMapReport["componentSignals"] = [];

  for (const file of walk.files.filter((candidate) => candidate.isTextCandidate).slice(0, 120)) {
    const text = await readTextIfSafe(file.absPath, 80_000);
    if (!text) continue;
    apiSignals.push(...extractApiSignals(file.relPath, text).slice(0, 8));
    componentSignals.push(...extractComponentSignals(file.relPath, text).slice(0, 4));
  }

  const limitedApiSignals = apiSignals.slice(0, 40);
  const limitedComponentSignals = componentSignals.slice(0, 40);
  return {
    summary: `repomap식 인터페이스 맵: route/page 신호 ${routeSignals.length}개, API 호출/핸들러 ${limitedApiSignals.length}개, 컴포넌트 ${limitedComponentSignals.length}개를 정적으로 확인했습니다.`,
    sourcePattern: "repomap page routes GraphQL REST data flow analysis",
    routeSignals,
    apiSignals: limitedApiSignals,
    componentSignals: limitedComponentSignals,
    dataFlowHints: buildDataFlowHints(routeSignals, limitedApiSignals, limitedComponentSignals),
    learnerNextSteps: [
      "route/page 파일에서 사용자가 들어오는 화면 또는 엔드포인트를 먼저 확인하세요.",
      "API 신호가 있는 파일을 열어 데이터가 어디서 들어오고 어디로 전달되는지 추적하세요.",
      "컴포넌트 신호와 route 신호를 연결해 화면과 데이터 흐름을 한 줄로 설명해 보세요."
    ]
  };
}

function routeKindFor(filePath: string): string | null {
  const normalized = filePath.toLowerCase();
  const base = path.basename(normalized);
  if (/^config\/routes\.rb$/.test(normalized)) return "rails-routes";
  if (normalized.includes("/controllers/") || base.endsWith("_controller.rb")) return "controller";
  if (normalized.includes("/routes/")) return "router";
  if (normalized.includes("/pages/")) return "page";
  if (normalized.includes("/app/") && ["page.tsx", "page.jsx", "layout.tsx", "layout.jsx", "route.ts", "route.js"].includes(base)) return "app-router";
  if (["app.tsx", "app.jsx", "main.tsx", "main.jsx"].includes(base)) return "spa-entry";
  return null;
}

function routeSignalFor(filePath: string): string | null {
  const kind = routeKindFor(filePath);
  if (!kind) return null;
  if (kind === "page") return "페이지 파일 경로로부터 사용자 진입 화면을 추정합니다.";
  if (kind === "app-router") return "App Router 파일명으로 화면, layout, route handler를 추정합니다.";
  if (kind === "controller") return "컨트롤러 파일로 서버 요청 처리 지점을 추정합니다.";
  if (kind === "router") return "routes 폴더 파일로 라우팅 정의 지점을 추정합니다.";
  if (kind === "rails-routes") return "Rails routes 설정 파일입니다.";
  return "SPA 진입점에서 클라이언트 라우팅 또는 화면 조립을 추정합니다.";
}

function extractApiSignals(filePath: string, text: string): InterfaceMapReport["apiSignals"] {
  const rows: InterfaceMapReport["apiSignals"] = [];
  const patterns: Array<{ regex: RegExp; method: (match: RegExpMatchArray) => string; pattern: (match: RegExpMatchArray) => string }> = [
    { regex: /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g, method: () => "FETCH", pattern: (match) => match[1] },
    { regex: /axios\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi, method: (match) => match[1].toUpperCase(), pattern: (match) => match[2] },
    { regex: /\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi, method: (match) => match[1].toUpperCase(), pattern: (match) => match[2] },
    { regex: /@app\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi, method: (match) => match[1].toUpperCase(), pattern: (match) => match[2] }
  ];
  for (const { regex, method, pattern } of patterns) {
    for (const match of text.matchAll(regex)) {
      rows.push({
        filePath,
        method: method(match),
        pattern: pattern(match).slice(0, 120),
        sourceHref: `source/${encodedPath(filePath)}`
      });
    }
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.filePath}:${row.method}:${row.pattern}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractComponentSignals(filePath: string, text: string): InterfaceMapReport["componentSignals"] {
  if (!/\.(tsx|jsx)$/.test(filePath)) return [];
  const rows: InterfaceMapReport["componentSignals"] = [];
  for (const match of text.matchAll(/(?:export\s+default\s+)?function\s+([A-Z][A-Za-z0-9_]*)|const\s+([A-Z][A-Za-z0-9_]*)\s*=/g)) {
    rows.push({
      filePath,
      componentName: match[1] ?? match[2],
      sourceHref: `source/${encodedPath(filePath)}`
    });
  }
  return rows;
}

function buildDataFlowHints(routeSignals: InterfaceMapReport["routeSignals"], apiSignals: InterfaceMapReport["apiSignals"], componentSignals: InterfaceMapReport["componentSignals"]): string[] {
  return [
    routeSignals.length > 0 ? `${routeSignals[0].filePath} 같은 route/page 파일에서 사용자 진입점을 시작하세요.` : "route/page 파일 신호가 없어 README와 main/app 파일을 먼저 확인하세요.",
    apiSignals.length > 0 ? `${apiSignals[0].filePath}에서 ${apiSignals[0].method} ${apiSignals[0].pattern} API 신호를 확인했습니다.` : "fetch/axios/router HTTP 신호가 없어 데이터 흐름은 import/export와 상태 관리 파일에서 추적해야 합니다.",
    componentSignals.length > 0 ? `${componentSignals[0].componentName} 컴포넌트를 화면 조립 단서로 사용할 수 있습니다.` : "명명된 React 컴포넌트 신호가 적어 파일명과 default export를 함께 확인하세요."
  ];
}

async function buildSymbolMapReport(walk: WalkResult, fileLessons: FileLesson[]): Promise<SymbolMapReport> {
  const lessonPaths = new Set(fileLessons.map((lesson) => lesson.filePath));
  const candidateFiles = walk.files
    .filter((file) => file.isTextCandidate && /\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|rs)$/.test(file.relPath))
    .sort((a, b) => Number(lessonPaths.has(b.relPath)) - Number(lessonPaths.has(a.relPath)) || a.relPath.localeCompare(b.relPath))
    .slice(0, 120);
  const symbols: SymbolMapReport["symbols"] = [];
  for (const file of candidateFiles) {
    const text = await readTextIfSafe(file.absPath, 100_000);
    if (!text) continue;
    symbols.push(...extractSymbols(file.relPath, text));
  }
  const uniqueSymbols = dedupeSymbols(symbols).slice(0, 120);
  const symbolsByKind = countBy(uniqueSymbols.map((symbol) => symbol.kind));
  const fileCounts = countBy(uniqueSymbols.map((symbol) => symbol.filePath));
  const filesWithSymbols = Object.entries(fileCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 30)
    .map(([filePath, count]) => ({
      filePath,
      count,
      lessonHref: `html/files.html#${htmlAnchor(filePath)}`,
      sourceHref: `source/${encodedPath(filePath)}`
    }));
  return {
    summary: `codebase-map식 symbol map: ${uniqueSymbols.length}개 함수/클래스/상수/type 신호를 정적으로 추출했습니다.`,
    sourcePattern: "codebase-map AST-based functions classes constants index",
    totalSymbols: uniqueSymbols.length,
    symbolsByKind,
    symbols: uniqueSymbols,
    filesWithSymbols,
    learnerNextSteps: [
      "exported symbol부터 읽어 프로젝트의 공개 API를 파악하세요.",
      "symbol이 많은 파일은 한 번에 읽지 말고 함수나 class 단위로 나누어 추적하세요.",
      "symbol map을 file lesson과 함께 열어 이름, 역할, 원본 코드를 대조하세요."
    ]
  };
}

function extractSymbols(filePath: string, text: string): SymbolMapReport["symbols"] {
  const rows: SymbolMapReport["symbols"] = [];
  const patterns: Array<{ kind: SymbolMapReport["symbols"][number]["kind"]; regex: RegExp }> = [
    { kind: "function", regex: /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g },
    { kind: "class", regex: /(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g },
    { kind: "constant", regex: /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g },
    { kind: "interface", regex: /(?:export\s+)?interface\s+([A-Za-z_$][A-Za-z0-9_$]*)/g },
    { kind: "type", regex: /(?:export\s+)?type\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g }
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern.regex)) {
      const full = match[0] ?? "";
      rows.push({
        filePath,
        name: match[1],
        kind: pattern.kind,
        exported: /^\s*export\s/.test(full),
        sourceHref: `source/${encodedPath(filePath)}`,
        lessonHref: `html/files.html#${htmlAnchor(filePath)}`
      });
    }
  }
  return rows;
}

function dedupeSymbols(symbols: SymbolMapReport["symbols"]): SymbolMapReport["symbols"] {
  const seen = new Set<string>();
  return symbols.filter((symbol) => {
    const key = `${symbol.filePath}:${symbol.kind}:${symbol.name}:${symbol.exported}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildContextPackReport(walk: WalkResult, fileLessons: FileLesson[]): ContextPackReport {
  const lessonByPath = new Map(fileLessons.map((lesson) => [lesson.filePath, lesson]));
  const packFiles = walk.files
    .filter((file) => file.isTextCandidate && !walk.secretCandidatePaths.includes(file.relPath))
    .map((file) => ({
      filePath: file.relPath,
      size: file.size,
      estimatedTokens: estimateTokens(file.size),
      packReason: contextPackReason(file.relPath, lessonByPath.get(file.relPath)),
      lessonHref: `html/files.html#${htmlAnchor(file.relPath)}`,
      sourceHref: `source/${encodedPath(file.relPath)}`
    }))
    .sort((a, b) => b.estimatedTokens - a.estimatedTokens || a.filePath.localeCompare(b.filePath));
  const totalIncludedBytes = packFiles.reduce((sum, file) => sum + file.size, 0);
  const totalEstimatedTokens = packFiles.reduce((sum, file) => sum + file.estimatedTokens, 0);
  const directoryCounts = new Map<string, { fileCount: number; estimatedTokens: number }>();
  for (const file of packFiles) {
    const directory = topDirectoryForContextPack(file.filePath);
    const current = directoryCounts.get(directory) ?? { fileCount: 0, estimatedTokens: 0 };
    current.fileCount += 1;
    current.estimatedTokens += file.estimatedTokens;
    directoryCounts.set(directory, current);
  }
  const directoryTokenTree = [...directoryCounts.entries()]
    .map(([directory, row]) => ({ directory, ...row }))
    .sort((a, b) => b.estimatedTokens - a.estimatedTokens || a.directory.localeCompare(b.directory))
    .slice(0, 30);
  const excludedFromPack = [...new Set([
    ...walk.excludedPaths,
    ...walk.files.filter((file) => !file.isTextCandidate).map((file) => file.relPath)
  ])].slice(0, 50);
  const budgetProfiles = [
    { name: "small-chat-8k", tokenLimit: 8_000 },
    { name: "standard-32k", tokenLimit: 32_000 },
    { name: "long-context-128k", tokenLimit: 128_000 }
  ].map((profile) => ({
    ...profile,
    fits: totalEstimatedTokens <= profile.tokenLimit,
    overflowTokens: Math.max(0, totalEstimatedTokens - profile.tokenLimit)
  }));
  return {
    summary: `Repomix식 context pack: ${packFiles.length}개 텍스트 파일을 약 ${totalEstimatedTokens.toLocaleString("en-US")} tokens로 추정하고 예산별 적합성을 계산했습니다.`,
    sourcePattern: "Repomix token counting git-aware ignore AI-friendly context pack",
    totalIncludedFiles: packFiles.length,
    totalIncludedBytes,
    totalEstimatedTokens,
    budgetProfiles,
    topFiles: packFiles.slice(0, 20),
    directoryTokenTree,
    splitPlans: buildContextSplitPlans(packFiles),
    excludedFromPack,
    securityNotes: [
      "RepoTutor는 secret-like path와 binary/media/large lockfile을 pack 후보에서 제외합니다.",
      "Token 값은 외부 tokenizer 실행 없이 byte 기반으로 추정한 deterministic budget signal입니다.",
      "Repomix의 include/ignore/token-count-tree 패턴을 학습용 정적 리포트로 이식했습니다."
    ],
    learnerNextSteps: [
      "먼저 token-heavy file을 열어 LLM에 넣을 필요가 있는지 판단하세요.",
      "split plan의 part 단위로 공유하면 top-level directory context를 유지하면서 큰 저장소를 나눌 수 있습니다.",
      "예산을 초과하면 top file을 그대로 붙이지 말고 파일 수업, 심볼 맵, 인터페이스 맵으로 좁혀 주세요.",
      "secret/security note를 확인한 뒤 외부 AI 도구에 공유할 context 범위를 정하세요."
    ]
  };
}

function buildContextSplitPlans(files: ContextPackReport["topFiles"]): ContextPackReport["splitPlans"] {
  const directoryGroups = new Map<string, { directory: string; fileCount: number; estimatedBytes: number; estimatedTokens: number }>();
  for (const file of files) {
    const directory = topDirectoryForContextPack(file.filePath);
    const group = directoryGroups.get(directory) ?? { directory, fileCount: 0, estimatedBytes: 0, estimatedTokens: 0 };
    group.fileCount += 1;
    group.estimatedBytes += file.size;
    group.estimatedTokens += file.estimatedTokens;
    directoryGroups.set(directory, group);
  }
  const groups = [...directoryGroups.values()].sort((a, b) => b.estimatedBytes - a.estimatedBytes || a.directory.localeCompare(b.directory));
  return [
    { name: "google-ai-studio-1mb", maxBytes: 1_000_000 },
    { name: "repomix-20mb", maxBytes: 20_000_000 }
  ].map((profile) => {
    const parts: ContextPackReport["splitPlans"][number]["parts"] = [];
    let current: ContextPackReport["splitPlans"][number]["parts"][number] | null = null;
    for (const group of groups) {
      if (current && current.estimatedBytes > 0 && current.estimatedBytes + group.estimatedBytes > profile.maxBytes) {
        parts.push(current);
        current = null;
      }
      current ??= {
        partName: `repomix-output.${parts.length + 1}.xml`,
        directories: [],
        fileCount: 0,
        estimatedBytes: 0,
        estimatedTokens: 0,
        overLimit: false
      };
      current.directories.push(group.directory);
      current.fileCount += group.fileCount;
      current.estimatedBytes += group.estimatedBytes;
      current.estimatedTokens += group.estimatedTokens;
      current.overLimit = current.overLimit || group.estimatedBytes > profile.maxBytes || current.estimatedBytes > profile.maxBytes;
    }
    if (current) parts.push(current);
    return {
      name: profile.name,
      maxBytes: profile.maxBytes,
      partCount: parts.length,
      parts,
      oversizedDirectories: groups.filter((group) => group.estimatedBytes > profile.maxBytes).map((group) => group.directory)
    };
  });
}

function estimateTokens(bytes: number): number {
  return Math.max(1, Math.ceil(bytes / 4));
}

function contextPackReason(filePath: string, lesson: FileLesson | undefined): string {
  const reasons = [];
  if (lesson) reasons.push(`핵심 파일 수업 포함, 소스 근거 ${lesson.sourceEvidence.length}개`);
  if (/readme|package\.json|pyproject|cargo\.toml|go\.mod/i.test(path.basename(filePath))) reasons.push("프로젝트 목적/실행 환경 단서");
  if (/main|index|app|cli|server/i.test(path.basename(filePath))) reasons.push("진입점 후보");
  return reasons.length > 0 ? reasons.join(" · ") : "텍스트 파일 pack 후보";
}

function topDirectoryForContextPack(filePath: string): string {
  return filePath.includes("/") ? filePath.split("/")[0] : "root";
}

function buildMcpHandoffReport(repoMap: RepoMap, contextPackReport: ContextPackReport): McpHandoffReport {
  return {
    summary: `codebase-mcp식 AI handoff: ${repoMap.totalFiles}개 파일 저장소를 다른 AI/MCP 도구에 넘길 때 쓸 tool 3개와 prompt 3개를 준비했습니다.`,
    sourcePattern: "Codebase MCP getCodebase getRemoteCodebase saveCodebase tool handoff",
    tools: [
      {
        name: "getCodebase",
        purpose: "현재 작업공간의 codebase context를 한 번에 읽도록 요청합니다.",
        useWhen: "로컬 프로젝트를 AI 도구가 처음 이해해야 할 때 사용합니다.",
        recommendedPrompt: "Analyze my current project and explain its main components, entry points, and risks.",
        inputHints: [
          "format: markdown 또는 xml",
          "includeFileSummary: true",
          "includeDirectoryStructure: true",
          `estimatedTokens: ${contextPackReport.totalEstimatedTokens}`
        ]
      },
      {
        name: "getRemoteCodebase",
        purpose: "비교 대상 public GitHub repository를 remote source로 가져와 분석합니다.",
        useWhen: "외부 프로젝트와 구조나 구현 패턴을 비교해야 할 때 사용합니다.",
        recommendedPrompt: "Analyze the repository at owner/repo and compare its onboarding flow with this project.",
        inputHints: [
          "repo: owner/repo 또는 https://github.com/owner/repo",
          "format: markdown",
          "removeComments: false"
        ]
      },
      {
        name: "saveCodebase",
        purpose: "분석 결과를 나중에 다시 볼 수 있는 파일로 저장합니다.",
        useWhen: "handoff, 리뷰, 장기 비교를 위해 codebase snapshot을 보존해야 할 때 사용합니다.",
        recommendedPrompt: "Save an analysis of this codebase to codebase-analysis.md in markdown format.",
        inputHints: [
          "outputFile: codebase-analysis.md",
          "format: markdown",
          "showLineNumbers: true"
        ]
      }
    ],
    prompts: [
      {
        title: "Architecture handoff",
        prompt: "Use the RepoTutor architecture, interface map, symbol map, and context pack reports to summarize the codebase for a new maintainer.",
        relatedReportHref: "html/architecture.html"
      },
      {
        title: "Remote comparison",
        prompt: "Compare this project against a similar public repository and list transferable patterns, non-transferable assumptions, and safe next upgrades.",
        relatedReportHref: "html/context-pack.html"
      },
      {
        title: "Saved review packet",
        prompt: "Save a markdown handoff that includes purpose, runtime setup, token-heavy files, split plan, and verification status.",
        relatedReportHref: "html/session-verification.html"
      }
    ],
    safetyNotes: [
      "RepoTutor already excludes secret-like paths from copied source snapshots.",
      "Do not send excluded paths or local secret files to remote AI tools.",
      "Use context-pack split plans when a target tool has file-size or context limits."
    ],
    learnerNextSteps: [
      "Start with getCodebase for local understanding, then use saveCodebase when the explanation needs to persist.",
      "Use getRemoteCodebase only for public comparison targets that are safe to inspect.",
      "Before sharing externally, compare the context pack excluded list with project policy."
    ]
  };
}

function buildAgentMemoryReport(
  repoMap: RepoMap,
  languageReport: LanguageReport,
  purposeReport: PurposeReport,
  contextPackReport: ContextPackReport,
  mcpHandoffReport: McpHandoffReport,
  componentGraphReport: ComponentGraphReport
): AgentMemoryReport {
  const graphQueryTokenTarget = 280;
  const estimatedReductionX = Number(Math.max(1, contextPackReport.totalEstimatedTokens / graphQueryTokenTarget).toFixed(1));
  const topFolders = repoMap.folders.slice(0, 4).map((folder) => folder.folderPath || "root");
  return {
    summary: `Claude Code memory setup식 재진입 가이드: ${repoMap.totalFiles}개 파일 저장소를 원본 재독해 전에 memory note, graph, context pack 순서로 확인하도록 정리했습니다.`,
    sourcePattern: "Claude Code Obsidian Graphify persistent memory token-saving context navigation",
    tokenSavings: {
      rawCodeReadTokens: contextPackReport.totalEstimatedTokens,
      graphQueryTokenTarget,
      estimatedReductionX
    },
    layers: [
      {
        name: "Persistent project memory",
        role: "결정, 진행상태, 재진입 규칙을 짧은 노트로 보존합니다.",
        generatedArtifact: "markdown/agent-memory.md",
        useBefore: "새 AI 세션을 시작하거나 작업을 이어받기 전"
      },
      {
        name: "Codebase knowledge graph",
        role: "파일/폴더/용어/재구현 관계를 구조 그래프로 먼저 탐색합니다.",
        generatedArtifact: "html/component-graph.html",
        useBefore: "원본 파일을 대량으로 열기 전"
      },
      {
        name: "Context budget",
        role: "token-heavy file과 split plan으로 공유 범위를 정합니다.",
        generatedArtifact: "html/context-pack.html",
        useBefore: "외부 AI 도구에 파일 묶음을 넘기기 전"
      },
      {
        name: "Tool handoff",
        role: "getCodebase, getRemoteCodebase, saveCodebase형 prompt를 준비합니다.",
        generatedArtifact: "html/mcp-handoff.html",
        useBefore: "다른 MCP/AI 도구에 분석을 맡기기 전"
      }
    ],
    memoryNotes: [
      {
        title: `${repoMap.root} project context`,
        noteType: "project-context",
        frontmatter: memoryFrontmatter(`${repoMap.root} project context`, ["repo-tutor", "project-context"], "active"),
        body: [
          `Purpose: ${purposeReport.oneLineSummary}`,
          `Primary language: ${languageReport.primaryLanguage}`,
          `Files: ${repoMap.totalFiles}, folders: ${repoMap.totalFolders}`,
          `Top folders: ${topFolders.join(", ") || "root"}`
        ].join("\n"),
        relatedReportHref: "html/overview.html"
      },
      {
        title: `${repoMap.root} context navigation`,
        noteType: "context-navigation",
        frontmatter: memoryFrontmatter(`${repoMap.root} context navigation`, ["repo-tutor", "graphify", "context-navigation"], "active"),
        body: [
          "Read generated memory first, then inspect the component graph, then open raw files only for edit targets.",
          `Graph nodes: ${componentGraphReport.summary.totalNodes}, graph edges: ${componentGraphReport.summary.totalEdges}`,
          `Context pack tokens: ${contextPackReport.totalEstimatedTokens}, graph query target: ${graphQueryTokenTarget}`
        ].join("\n"),
        relatedReportHref: "html/component-graph.html"
      },
      {
        title: `${repoMap.root} session handoff`,
        noteType: "session-log",
        frontmatter: memoryFrontmatter(`${repoMap.root} session handoff`, ["repo-tutor", "session-log"], "draft"),
        body: [
          "Record what changed, what was verified, and what remains before ending the session.",
          `Reusable handoff tools: ${mcpHandoffReport.tools.map((tool) => tool.name).join(", ")}`,
          "Keep source links and generated report paths attached to every follow-up."
        ].join("\n"),
        relatedReportHref: "html/session-verification.html"
      }
    ],
    contextNavigationRules: [
      "First read agent-memory.md for current purpose, top folders, and handoff state.",
      "Second inspect component-graph.html or symbol-map.html for structure.",
      "Third use context-pack.html to choose only the files that fit the target context window.",
      "Open raw source files only after the generated memory and graph identify the edit target."
    ],
    learnerNextSteps: [
      "Use the project-context note as the first paragraph of a new AI handoff.",
      "Use the context-navigation note when deciding which report to open next.",
      "Use the session-handoff note before committing or pausing work."
    ]
  };
}

function memoryFrontmatter(title: string, tags: string[], status: string): AgentMemoryReport["memoryNotes"][number]["frontmatter"] {
  return [
    { key: "title", value: title },
    { key: "tags", value: tags.join(", ") },
    { key: "status", value: status },
    { key: "type", value: "agent-memory" }
  ];
}

function buildGraphQueryReport(componentGraphReport: ComponentGraphReport): GraphQueryReport {
  const topNodes = componentGraphReport.summary.topConnectedNodes.slice(0, 5);
  const nodesById = new Map(componentGraphReport.nodes.map((node) => [node.id, node]));
  const nodeExplanations = topNodes.map((node) => ({
    nodeId: node.id,
    label: node.label,
    type: node.type,
    question: `graphify explain "${node.label}"`,
    href: nodesById.get(node.id)?.href ?? null
  }));
  const entryNode = componentGraphReport.entryNodeIds[0] ?? componentGraphReport.nodes[0]?.id ?? "root";
  const pathPrompts = componentGraphReport.summary.topConnectedNodes.slice(0, 4).map((node) => ({
    from: entryNode,
    to: node.id,
    question: `graphify path "${entryNode}" "${node.id}"`,
    reason: `${node.label}까지 이어지는 최단 경로를 먼저 보면 raw file 탐색 범위를 줄일 수 있습니다.`
  }));
  return {
    summary: `Graphify식 graph query guide: ${componentGraphReport.summary.totalNodes}개 노드와 ${componentGraphReport.summary.totalEdges}개 관계를 query/path/explain 방식으로 탐색할 질문을 준비했습니다.`,
    sourcePattern: "Graphify query path explain graph traversal command guide",
    queryModes: [
      {
        name: "query",
        commandShape: "graphify query \"How does this area work?\" --budget 1500",
        purpose: "넓은 질문을 BFS 스타일로 훑어 관련 노드 묶음을 찾습니다.",
        useWhen: "기능의 전체 흐름이나 개념 묶음을 처음 이해할 때"
      },
      {
        name: "path",
        commandShape: "graphify path \"EntryNode\" \"TargetNode\"",
        purpose: "두 노드 사이의 짧은 연결 경로를 확인합니다.",
        useWhen: "진입점에서 핵심 컴포넌트까지의 연결만 좁혀 보고 싶을 때"
      },
      {
        name: "explain",
        commandShape: "graphify explain \"NodeName\"",
        purpose: "한 노드를 평문 설명으로 풀어 다음 읽을 파일을 결정합니다.",
        useWhen: "god node, hub node, 낯선 용어를 먼저 해석할 때"
      }
    ],
    nodeExplanations,
    pathPrompts,
    learnerNextSteps: [
      "먼저 query mode로 넓게 묻고, path mode로 연결을 좁힌 뒤, explain mode로 핵심 노드를 해석하세요.",
      "generated component graph에서 href가 있는 노드는 바로 관련 학습 페이지로 이동하세요.",
      "질문 결과를 raw source 읽기 전에 비교하면 불필요한 파일 탐색을 줄일 수 있습니다."
    ]
  };
}

function suggestedReadScore(lesson: FileLesson, index: number): number {
  const entryBoost = /main|index|cli|app|server|lib/i.test(path.basename(lesson.filePath)) ? 6 : 0;
  return entryBoost
    + lesson.sourceEvidence.length * 3
    + lesson.keyExports.length * 2
    + lesson.keyImports.length * 2
    + lesson.relatedFiles.length
    + Math.max(0, 50 - index) / 50;
}

function buildComponentGraphReport(folderLessons: FolderLesson[], fileLessons: FileLesson[], glossary: GlossaryTerm[], rebuildRoadmap: RebuildRoadmap): ComponentGraphReport {
  const nodes: ComponentGraphReport["nodes"] = [{
    id: "root",
    type: "root",
    label: "repo root",
    path: ".",
    summary: "분석 대상 저장소의 시작점입니다.",
    href: "index.html"
  }];
  const edges: ComponentGraphReport["edges"] = [];

  for (const folder of folderLessons.slice(0, 20)) {
    const id = nodeId("folder", folder.folderPath);
    nodes.push({
      id,
      type: "folder",
      label: folder.folderPath,
      path: folder.folderPath,
      summary: folder.role,
      href: `folders.html#${htmlAnchor(folder.folderPath)}`
    });
    edges.push({ from: "root", to: id, label: "contains" });
  }

  for (const file of fileLessons.slice(0, 35)) {
    const id = nodeId("file", file.filePath);
    nodes.push({
      id,
      type: "file",
      label: file.filePath,
      path: file.filePath,
      summary: file.role,
      href: `files.html#${htmlAnchor(file.filePath)}`
    });
    const folder = closestFolderForFile(file.filePath, folderLessons);
    edges.push({ from: folder ? nodeId("folder", folder.folderPath) : "root", to: id, label: "explains file" });
  }

  for (const term of glossary.slice(0, 20)) {
    const id = nodeId("term", term.termEn);
    nodes.push({
      id,
      type: "term",
      label: `${term.termKo} (${term.termEn})`,
      path: null,
      summary: term.simpleDefinition,
      href: `glossary.html#${htmlAnchor(term.termEn)}`
    });
    const matchingFile = fileLessons.find((file) => file.glossaryTerms.some((value) => value.includes(term.termKo) || value.includes(term.termEn)));
    edges.push({ from: matchingFile ? nodeId("file", matchingFile.filePath) : "root", to: id, label: "uses term" });
  }

  for (const step of rebuildRoadmap.steps.slice(0, 10)) {
    const id = nodeId("step", String(step.order));
    nodes.push({
      id,
      type: "rebuild-step",
      label: `${step.order}. ${step.title}`,
      path: null,
      summary: step.goal,
      href: "rebuild.html"
    });
    const relatedFile = fileLessons.find((file) => step.relatedSourcePaths.some((sourcePath) => file.filePath === sourcePath || file.filePath.startsWith(`${sourcePath}/`)));
    edges.push({ from: relatedFile ? nodeId("file", relatedFile.filePath) : "root", to: id, label: "rebuilds through" });
  }

  const mermaidEdges = edges.slice(0, 80).map((edge) => `  ${edge.from}["${labelForMermaid(nodes, edge.from)}"] -->|${edge.label}| ${edge.to}["${labelForMermaid(nodes, edge.to)}"]`).join("\n");
  return {
    nodes,
    edges,
    summary: buildComponentGraphSummary(nodes, edges),
    entryNodeIds: ["root", ...fileLessons.filter((file) => /main|index|cli|app/i.test(path.basename(file.filePath))).slice(0, 5).map((file) => nodeId("file", file.filePath))],
    mermaid: `flowchart TD\n${mermaidEdges || "  root[\"repo root\"]"}`,
    beginnerExplanation: "component graph는 폴더, 핵심 파일, 용어, 재구현 단계를 하나의 관계도로 묶습니다. 학습자는 한 파일이 어느 폴더에 속하고 어떤 용어와 구현 단계로 이어지는지 한눈에 따라갈 수 있습니다."
  };
}

function buildComponentGraphSummary(nodes: ComponentGraphReport["nodes"], edges: ComponentGraphReport["edges"]): ComponentGraphReport["summary"] {
  const nodeTypeCounts = countBy(nodes.map((node) => node.type));
  const edgeLabelCounts = countBy(edges.map((edge) => edge.label));
  const degree = new Map<string, number>();
  for (const edge of edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }
  const topConnectedNodes = nodes
    .map((node) => ({ id: node.id, label: node.label, type: node.type, degree: degree.get(node.id) ?? 0 }))
    .sort((a, b) => b.degree - a.degree || a.label.localeCompare(b.label))
    .slice(0, 8);
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    nodeTypeCounts,
    edgeLabelCounts,
    topConnectedNodes,
    largeRepoAdvice: "큰 저장소에서는 먼저 연결 수가 높은 노드와 file/folder 필터를 보고, 그 다음 rebuild-step과 term 노드로 학습 순서를 좁히세요."
  };
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

async function buildSourceSnapshotReport(walk: WalkResult): Promise<SourceSnapshotReport> {
  const files = [];
  for (const file of walk.files.filter((candidate) => candidate.isTextCandidate)) {
    const text = await readTextIfSafe(file.absPath);
    files.push({
      filePath: file.relPath,
      size: file.size,
      sha256: text === null ? `untracked-${file.size}` : await sha256(text),
      tracked: text !== null
    });
  }
  return {
    createdAt: new Date().toISOString(),
    totalFiles: files.length,
    files: files.sort((a, b) => a.filePath.localeCompare(b.filePath))
  };
}

function emptyIncrementalReport(coverageReport: CoverageReport): IncrementalReport {
  return {
    baselineSessionId: null,
    baselinePath: null,
    addedFiles: [],
    changedFiles: [],
    removedFiles: [],
    unchangedFiles: [],
    coverageDelta: {
      baselineCoverageRatio: null,
      currentCoverageRatio: coverageReport.coverageRatio,
      coverageRatioDelta: null,
      baselineCoveredImportantFiles: null,
      currentCoveredImportantFiles: coverageReport.coveredImportantFiles,
      coveredImportantFilesDelta: null,
      baselineTotalScannedFiles: null,
      currentTotalScannedFiles: coverageReport.totalScannedFiles,
      totalScannedFilesDelta: null,
      summary: "분석 중에는 이전 세션 비교를 아직 적용하지 않았습니다."
    },
    summary: "이 저장소의 비교 기준 이전 세션이 아직 없습니다.",
    beginnerExplanation: "incremental report는 같은 repo를 다시 분석했을 때 어떤 파일이 추가, 변경, 삭제, 유지되었는지 알려줍니다. 첫 분석에서는 비교할 기준이 없으므로 baseline 없음으로 저장됩니다."
  };
}

async function sha256(text: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(text).digest("hex");
}

function nodeId(prefix: string, value: string): string {
  return `${prefix}_${htmlAnchor(value).replace(/-/g, "_")}`;
}

function closestFolderForFile(filePath: string, folderLessons: FolderLesson[]): FolderLesson | null {
  return folderLessons
    .filter((folder) => filePath.startsWith(`${folder.folderPath}/`))
    .sort((a, b) => b.folderPath.length - a.folderPath.length)[0] ?? null;
}

function labelForMermaid(nodes: ComponentGraphReport["nodes"], id: string): string {
  const label = nodes.find((node) => node.id === id)?.label ?? id;
  return label.replaceAll("\"", "'");
}

function buildGlossary(languageReport: LanguageReport, dependencyReport: DependencyReport, fileLessons: FileLesson[]): GlossaryTerm[] {
  const base: GlossaryTerm[] = [
    term("진입점", "entry point", "프로그램이 처음 시작되는 파일이나 함수입니다.", "startPoints와 main/index 파일 후보에서 찾습니다.", fileLessons[0]?.filePath ?? "source root", ["CLI", "runtime"], "easy", 5),
    term("의존성", "dependency", "프로젝트가 직접 만들지 않고 가져다 쓰는 외부 코드입니다.", "package.json, Cargo.toml 같은 파일에서 확인합니다.", dependencyReport.manifests[0]?.filePath ?? "manifest file", ["package manager"], "easy", 5),
    term("정적 분석", "static analysis", "코드를 실행하지 않고 파일과 구조를 읽어 이해하는 방식입니다.", "RepoTutor의 기본 분석 모드입니다.", "scanner", ["security", "read-only"], "medium", 5),
    term("오답노트", "wrong note", "틀린 문제를 복습 가능한 작은 수업으로 바꾼 기록입니다.", "quiz attempt 이후 HTML과 Markdown에 반영됩니다.", "analysis/wrong-notes.json", ["quiz"], "easy", 4)
  ];
  for (const role of languageReport.languageRoles.slice(0, 6)) {
    base.push(term(`${role.language} 언어`, role.language, `${role.language}는 ${role.role}에 쓰입니다.`, role.beginnerExplanation, role.language, ["language"], "easy", 3));
  }
  return dedupeTerms(base);
}

function buildRebuildRoadmap(repoMap: RepoMap, fileLessons: FileLesson[]): RebuildRoadmap {
  const titles = ["개념 이해", "최소 프로젝트 생성", "폴더 구조 설계", "핵심 기능 1개 구현", "설정 파일 작성", "실행 흐름 연결", "테스트 추가", "문서화", "확장 기능 추가", "원본 repo와 비교"];
  return {
    steps: titles.map((title, index) => ({
      order: index + 1,
      title,
      goal: `${title} 단계에서 프로젝트를 작은 단위로 이해하고 구현합니다.`,
      tasks: index < 3 ? repoMap.folders.slice(0, 3).map((folder) => `${folder.folderPath} 역할 확인`) : fileLessons.slice(0, 3).map((file) => `${file.filePath} 책임 확인`),
      whyNeeded: "순서를 나누면 한 번에 너무 많은 개념을 외우지 않고 실제로 작동하는 부분부터 배울 수 있습니다.",
      relatedSourcePaths: index < 3 ? repoMap.folders.slice(0, 3).map((folder) => folder.folderPath) : fileLessons.slice(0, 3).map((file) => file.filePath),
      expectedMistakes: ["파일 이름만 보고 역할을 단정하기", "설정 파일과 실행 파일의 차이를 놓치기"],
      completionCriteria: ["한 문장으로 이 단계의 목적을 설명할 수 있다.", "관련 파일 또는 폴더를 직접 가리킬 수 있다."]
    }))
  };
}

function inferFolderRole(folder: string): string {
  const name = folder.split("/").at(-1)?.toLowerCase() ?? folder.toLowerCase();
  if (["src", "source"].includes(name)) return "소스 코드(source code)";
  if (["test", "tests", "__tests__"].includes(name)) return "테스트(test)";
  if (["docs", "doc"].includes(name)) return "문서(documentation)";
  if (["apps", "app"].includes(name)) return "실행 앱(application)";
  if (["packages", "libs", "lib"].includes(name)) return "공유 패키지(shared package)";
  if (["skills", ".agents"].includes(name)) return "에이전트/스킬(agent skill)";
  if (["public", "assets", "static"].includes(name)) return "정적 자산(static assets)";
  return "기능별 파일 묶음(module)";
}

function inferLanguageRole(language: string): string {
  const roles: Record<string, string> = {
    TypeScript: "UI, CLI, 앱 로직",
    JavaScript: "런타임 스크립트와 설정",
    Python: "자동화와 데이터 처리",
    Rust: "Tauri 백엔드 또는 시스템 레벨 로직",
    HTML: "브라우저 출력",
    CSS: "화면 스타일",
    Markdown: "문서와 학습 자료",
    JSON: "설정과 구조화 데이터",
    TOML: "Rust/Python 설정",
    YAML: "워크플로우와 설정"
  };
  return roles[language] ?? "보조 파일 또는 특수 목적 코드";
}

function explainLanguageTradeoff(language: string): string {
  if (language === "TypeScript") return "타입(type)으로 실수를 줄이지만 빌드 단계가 필요합니다.";
  if (language === "Rust") return "안전성과 성능이 좋지만 초보자에게 문법이 어렵습니다.";
  if (language === "Python") return "읽기 쉽고 빠르게 만들 수 있지만 큰 앱에서는 타입 관리가 중요합니다.";
  return "역할이 분명하면 좋지만, 너무 많은 형식이 섞이면 구조 파악이 어려워질 수 있습니다.";
}

function inferEcosystem(filePath: string): string {
  const base = path.basename(filePath);
  if (base === "package.json" || base.includes("lock")) return "Node";
  if (base === "Cargo.toml") return "Rust";
  if (base === "pyproject.toml" || base === "requirements.txt") return "Python";
  if (base === "go.mod") return "Go";
  if (base.includes("Docker")) return "Docker";
  return "Project";
}

function extractDependencies(filePath: string, text: string | null): DependencyReport["manifests"][number]["dependencies"] {
  if (!text) return [];
  const base = path.basename(filePath);
  if (base === "package.json") {
    try {
      const json = JSON.parse(text) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      return Object.keys({ ...(json.dependencies ?? {}), ...(json.devDependencies ?? {}) }).slice(0, 40).map(dependencyRow);
    } catch {
      return [];
    }
  }
  if (base === "requirements.txt") {
    return text.split(/\r?\n/).filter((line) => line && !line.startsWith("#")).slice(0, 40).map((line) => dependencyRow(line.split(/[=<>~]/)[0]));
  }
  if (base === "Cargo.toml") {
    const names = [...text.matchAll(/^([A-Za-z0-9_-]+)\s*=/gm)].map((match) => match[1]).filter((name) => !["package", "workspace", "dependencies"].includes(name));
    return names.slice(0, 40).map(dependencyRow);
  }
  return [];
}

function dependencyRow(name: string): DependencyReport["manifests"][number]["dependencies"][number] {
  return {
    name,
    role: "외부 라이브러리",
    beginnerExplanation: `${name}는 직접 만들지 않고 가져다 쓰는 의존성(dependency)입니다.`,
    whyNeeded: "반복 구현을 줄이고 검증된 기능을 활용하기 위해 사용합니다.",
    whatIsHardWithoutIt: "같은 기능을 직접 구현해야 해서 시간이 늘고 버그 가능성이 커집니다."
  };
}

function safeJsonField(text: string, field: string): string | null {
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    return typeof json[field] === "string" ? json[field] : null;
  } catch {
    return null;
  }
}

function isImportantFile(file: { relPath: string }): boolean {
  const base = path.basename(file.relPath).toLowerCase();
  return /^(package\.json|cargo\.toml|pyproject\.toml|requirements\.txt|readme\.md|skill\.md|agents\.md|main\..+|index\..+|app\..+|lib\..+|cli\..+|server\..+|vite\.config\..+|tauri\.conf\.json)$/.test(base)
    || /(^|\/)(src|app|cli|core|tests?)\//.test(file.relPath);
}

function inferFileRole(filePath: string): string {
  const base = path.basename(filePath).toLowerCase();
  if (base === "package.json" || base.endsWith(".toml") || base.endsWith(".yaml")) return "설정/의존성 manifest";
  if (/readme|agents|skill/.test(base)) return "문서/에이전트 지시";
  if (/main|index|cli|app|server/.test(base)) return "진입점(entry point)";
  if (/test|spec/.test(base)) return "테스트(test)";
  return "핵심 코드 또는 보조 모듈";
}

function inferFlowPosition(filePath: string): string {
  if (/cli/i.test(filePath)) return "CLI 명령을 받아 core pipeline으로 넘기는 위치";
  if (/main|index|app/i.test(filePath)) return "앱 또는 라이브러리 시작 흐름에 가까운 위치";
  if (/test|spec/i.test(filePath)) return "동작을 검증하는 위치";
  return "중간 처리 또는 보조 로직 위치";
}

function extractRegex(text: string | null, regex: RegExp): string[] {
  if (!text) return [];
  return [...text.matchAll(regex)].map((match) => match[1]).filter(Boolean).slice(0, 20);
}

function extractSourceEvidence(text: string | null, filePath: string): FileLesson["sourceEvidence"] {
  if (!text) return [];
  const rows = text.split(/\r?\n/).map((line, index) => ({
    line: index + 1,
    snippet: line.trim()
  })).filter((row) => row.snippet.length > 0);
  const scored = rows.map((row) => ({ ...row, kind: evidenceKind(row.snippet, filePath), score: evidenceScore(row.snippet, filePath) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.line - b.line)
    .slice(0, 4)
    .sort((a, b) => a.line - b.line);
  const selected = scored.length > 0 ? scored : rows.slice(0, 2).map((row) => ({ ...row, kind: "text" as const, score: 1 }));
  return selected.map((row) => ({
    line: row.line,
    kind: row.kind,
    snippet: truncateSnippet(row.snippet)
  }));
}

function evidenceKind(snippet: string, filePath: string): FileLesson["sourceEvidence"][number]["kind"] {
  if (/^import\s/.test(snippet)) return "import";
  if (/^export\s/.test(snippet)) return "export";
  if (/\b(console\.|main\(|createRoot\(|app\.listen|run\(|invoke\(|Command::)/.test(snippet) || /main|index|cli|app|server/i.test(path.basename(filePath))) return "entry";
  if (/^"(scripts|dependencies|devDependencies|name|version)"\s*:/.test(snippet) || /=\s*["']/.test(snippet)) return "config";
  if (/\b(describe|it|test|expect)\s*\(/.test(snippet)) return "test";
  return "text";
}

function evidenceScore(snippet: string, filePath: string): number {
  if (/^import\s/.test(snippet)) return 8;
  if (/^export\s/.test(snippet)) return 8;
  if (/\b(console\.|main\(|createRoot\(|app\.listen|run\(|invoke\(|Command::)/.test(snippet)) return 7;
  if (/^"(scripts|dependencies|devDependencies|name|version)"\s*:/.test(snippet)) return 6;
  if (/\b(describe|it|test|expect)\s*\(/.test(snippet)) return 6;
  if (/main|index|cli|app|server/i.test(path.basename(filePath))) return 3;
  return 0;
}

function truncateSnippet(value: string): string {
  return value.length <= 160 ? value : `${value.slice(0, 157)}...`;
}

function relatedByFolder(filePath: string, candidates: string[]): string[] {
  const dir = path.posix.dirname(filePath);
  return candidates.filter((candidate) => candidate !== filePath && path.posix.dirname(candidate) === dir).slice(0, 6);
}

function encodedPath(filePath: string): string {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

function glossaryTermsForFile(filePath: string): string[] {
  const terms = ["파일 책임(file responsibility)"];
  if (/package|cargo|pyproject|requirements/.test(filePath)) terms.push("의존성(dependency)");
  if (/main|index|cli|app/.test(filePath)) terms.push("진입점(entry point)");
  if (/test|spec/.test(filePath)) terms.push("테스트(test)");
  return terms;
}

function term(termKo: string, termEn: string, simpleDefinition: string, projectSpecificMeaning: string, exampleFromRepo: string, relatedTerms: string[], difficulty: "easy" | "medium" | "hard", reviewPriority: number): GlossaryTerm {
  return { termKo, termEn, simpleDefinition, projectSpecificMeaning, exampleFromRepo, relatedTerms, difficulty, reviewPriority };
}

function dedupeTerms(terms: GlossaryTerm[]): GlossaryTerm[] {
  const seen = new Set<string>();
  return terms.filter((termValue) => {
    const key = termValue.termEn.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
