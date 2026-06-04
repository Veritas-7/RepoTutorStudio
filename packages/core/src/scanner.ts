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
  ApiReferenceReport,
  ContextPackReport,
  McpHandoffReport,
  AgentMemoryReport,
  GraphQueryReport,
  TutorialAbstractionReport,
  DecisionRecordReport,
  DependencyHealthReport,
  SearchIndexReport,
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
  ApiContractReport,
  ObservabilityReport,
  PerformanceReport,
  E2eReport,
  AccessibilityReport,
  StorybookReport,
  DesignTokensReport,
  SourceType,
  RepoMap,
  htmlAnchor
} from "@repotutor/shared";
import { readTextIfSafe, WalkResult, walkSafe } from "./fs-utils.js";

export interface AnalysisContext {
  sourceType?: SourceType;
  sourceUrl?: string | null;
  localSourcePath?: string | null;
  branch?: string | null;
  commitHash?: string | null;
}

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
  apiReferenceReport: ApiReferenceReport;
  contextPackReport: ContextPackReport;
  mcpHandoffReport: McpHandoffReport;
  agentMemoryReport: AgentMemoryReport;
  graphQueryReport: GraphQueryReport;
  tutorialAbstractionReport: TutorialAbstractionReport;
  decisionRecordReport: DecisionRecordReport;
  dependencyHealthReport: DependencyHealthReport;
  searchIndexReport: SearchIndexReport;
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
  apiContractReport: ApiContractReport;
  observabilityReport: ObservabilityReport;
  performanceReport: PerformanceReport;
  e2eReport: E2eReport;
  accessibilityReport: AccessibilityReport;
  storybookReport: StorybookReport;
  designTokensReport: DesignTokensReport;
  componentGraphReport: ComponentGraphReport;
  sourceSnapshotReport: SourceSnapshotReport;
  incrementalReport: IncrementalReport;
  flowReport: FlowReport;
  glossary: GlossaryTerm[];
  rebuildRoadmap: RebuildRoadmap;
}

export async function analyzeRepository(sourceRoot: string, context: AnalysisContext = {}): Promise<AnalysisBundle> {
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
  const apiReferenceReport = buildApiReferenceReport(fileLessons, symbolMapReport);
  const contextPackReport = buildContextPackReport(walk, fileLessons);
  const mcpHandoffReport = buildMcpHandoffReport(repoMap, contextPackReport);
  const flowReport = buildFlowReport(fileLessons, dependencyReport);
  const glossary = buildGlossary(languageReport, dependencyReport, fileLessons);
  const rebuildRoadmap = buildRebuildRoadmap(repoMap, fileLessons);
  const componentGraphReport = buildComponentGraphReport(folderLessons, fileLessons, glossary, rebuildRoadmap);
  const graphQueryReport = buildGraphQueryReport(componentGraphReport);
  const tutorialAbstractionReport = buildTutorialAbstractionReport(fileLessons, suggestedReadsReport, componentGraphReport);
  const decisionRecordReport = buildDecisionRecordReport(repoMap, architectureReport, runtimeEnvironmentReport, interfaceMapReport, contextPackReport, tutorialAbstractionReport);
  const dependencyHealthReport = buildDependencyHealthReport(fileLessons);
  const searchIndexReport = buildSearchIndexReport(fileLessons, folderLessons, suggestedReadsReport, runtimeEnvironmentReport, interfaceMapReport, symbolMapReport, apiReferenceReport, dependencyHealthReport);
  const learningJournalReport = buildLearningJournalReport(fileLessons, glossary, graphQueryReport, tutorialAbstractionReport, searchIndexReport);
  const agentMemoryReport = buildAgentMemoryReport(repoMap, languageReport, purposeReport, contextPackReport, mcpHandoffReport, componentGraphReport);
  const sourceSnapshotReport = await buildSourceSnapshotReport(walk);
  const projectActivityReport = buildProjectActivityReport(context, sourceSnapshotReport, fileLessons, dependencyHealthReport, decisionRecordReport);
  const licenseRightsReport = await buildLicenseRightsReport(walk);
  const sbomReport = await buildSbomReport(context, walk);
  const securityReadinessReport = buildSecurityReadinessReport(walk, sbomReport, licenseRightsReport);
  const advisoryReport = await buildAdvisoryReport(walk, sbomReport, securityReadinessReport, licenseRightsReport);
  const scorecardReport = await buildScorecardReport(walk, licenseRightsReport, sbomReport, securityReadinessReport);
  const provenanceReport = buildProvenanceReport(context, walk, sbomReport, securityReadinessReport, sourceSnapshotReport);
  const vexReport = buildVexReport(walk, sbomReport, securityReadinessReport, advisoryReport, provenanceReport, sourceSnapshotReport);
  const policyGateReport = await buildPolicyGateReport(walk, securityReadinessReport);
  const apiContractReport = await buildApiContractReport(walk);
  const observabilityReport = await buildObservabilityReport(walk, runtimeEnvironmentReport);
  const performanceReport = await buildPerformanceReport(walk, runtimeEnvironmentReport);
  const e2eReport = await buildE2eReport(walk, runtimeEnvironmentReport);
  const accessibilityReport = await buildAccessibilityReport(walk, e2eReport);
  const storybookReport = await buildStorybookReport(walk);
  const designTokensReport = await buildDesignTokensReport(walk, storybookReport);
  const incrementalReport = emptyIncrementalReport(coverageReport);
  return { repoMap, languageReport, dependencyReport, purposeReport, architectureReport, folderLessons, fileLessons, coverageReport, evidenceIndexReport, suggestedReadsReport, runtimeEnvironmentReport, interfaceMapReport, symbolMapReport, apiReferenceReport, contextPackReport, mcpHandoffReport, agentMemoryReport, graphQueryReport, tutorialAbstractionReport, decisionRecordReport, dependencyHealthReport, searchIndexReport, learningJournalReport, projectActivityReport, licenseRightsReport, sbomReport, securityReadinessReport, advisoryReport, scorecardReport, provenanceReport, vexReport, policyGateReport, apiContractReport, observabilityReport, performanceReport, e2eReport, accessibilityReport, storybookReport, designTokensReport, componentGraphReport, sourceSnapshotReport, incrementalReport, flowReport, glossary, rebuildRoadmap };
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

function buildApiReferenceReport(fileLessons: FileLesson[], symbolMapReport: SymbolMapReport): ApiReferenceReport {
  const entryPoints = fileLessons
    .filter((lesson) => /(^|\/)(index|main|cli|app|server|lib)\.[^.]+$/.test(lesson.filePath) || lesson.keyExports.length > 0)
    .slice(0, 10)
    .map((lesson) => ({
      filePath: lesson.filePath,
      reason: lesson.keyExports.length > 0
        ? `TypeDoc entry point처럼 ${lesson.keyExports.length}개 export 신호를 문서 시작점으로 삼습니다.`
        : "파일명과 역할상 API 문서의 entry point 후보입니다.",
      lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
      sourceHref: `source/${encodedPath(lesson.filePath)}`
    }));
  const exportedSymbols = symbolMapReport.symbols.filter((symbol) => symbol.exported);
  const fallbackSymbols = exportedSymbols.length > 0 ? exportedSymbols : symbolMapReport.symbols.slice(0, 20);
  const publicSymbols = fallbackSymbols.slice(0, 80).map((symbol) => ({
    name: symbol.name,
    kind: symbol.kind,
    category: apiCategory(symbol.kind),
    filePath: symbol.filePath,
    signature: apiSignature(symbol),
    lessonHref: symbol.lessonHref,
    sourceHref: symbol.sourceHref
  }));
  const entryPointPaths = new Set(entryPoints.map((entry) => entry.filePath));
  const exportWarnings = symbolMapReport.symbols
    .filter((symbol) => !symbol.exported && (entryPointPaths.has(symbol.filePath) || /(^|\/)(index|main|lib)\.[^.]+$/.test(symbol.filePath)))
    .slice(0, 12)
    .map((symbol) => ({
      filePath: symbol.filePath,
      symbolName: symbol.name,
      message: `${symbol.name} appears in an API-adjacent file but is not exported in the static symbol map.`,
      suggestion: "공개 API라면 export하고, 내부 helper라면 파일 수업에서 internal로 설명하세요.",
      sourceHref: symbol.sourceHref
    }));
  return {
    summary: `TypeDoc식 API reference report: entry point ${entryPoints.length}개와 public symbol ${publicSymbols.length}개를 ReflectionKind 스타일 category로 정리했습니다.`,
    sourcePattern: "TypeDoc entry points reflections ReflectionKind public API documentation export validation",
    entryPoints,
    publicSymbols,
    kindCounts: countBy(publicSymbols.map((symbol) => symbol.kind)),
    categoryCounts: countBy(publicSymbols.map((symbol) => symbol.category)),
    exportWarnings,
    learnerNextSteps: [
      "entryPoints에서 시작해 공개 symbol이 어느 파일에서 export되는지 확인하세요.",
      "function/class/interface/type category를 나누어 값 API와 타입 API를 따로 읽으세요.",
      "exportWarnings는 공개 API 후보인지 내부 helper인지 사람 검토로 확정하세요."
    ]
  };
}

function apiCategory(kind: SymbolMapReport["symbols"][number]["kind"]): ApiReferenceReport["publicSymbols"][number]["category"] {
  if (kind === "class") return "class";
  if (kind === "interface" || kind === "type") return "type";
  return "value";
}

function apiSignature(symbol: SymbolMapReport["symbols"][number]): string {
  const prefix = symbol.exported ? "export " : "";
  if (symbol.kind === "function") return `${prefix}function ${symbol.name}(...)`;
  if (symbol.kind === "class") return `${prefix}class ${symbol.name}`;
  if (symbol.kind === "interface") return `${prefix}interface ${symbol.name}`;
  if (symbol.kind === "type") return `${prefix}type ${symbol.name} = ...`;
  return `${prefix}const ${symbol.name}`;
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

function buildTutorialAbstractionReport(
  fileLessons: FileLesson[],
  suggestedReadsReport: SuggestedReadsReport,
  componentGraphReport: ComponentGraphReport
): TutorialAbstractionReport {
  const lessonByPath = new Map(fileLessons.map((lesson) => [lesson.filePath, lesson]));
  const orderedLessons = suggestedReadsReport.items
    .map((item) => lessonByPath.get(item.filePath))
    .filter((lesson): lesson is FileLesson => Boolean(lesson));
  const candidates = (orderedLessons.length > 0 ? orderedLessons : fileLessons).slice(0, 7);
  const rawAbstractions = candidates.map((lesson, index) => {
    const id = `abstraction-${index + 1}`;
    const relatedLessons = [lesson, ...lesson.relatedFiles.map((filePath) => lessonByPath.get(filePath)).filter((item): item is FileLesson => Boolean(item))]
      .filter((item, itemIndex, items) => items.findIndex((candidate) => candidate.filePath === item.filePath) === itemIndex)
      .slice(0, 4);
    return {
      id,
      name: abstractionNameForFile(lesson.filePath),
      description: `${lesson.role}: ${lesson.beginnerExplanation}`,
      chapterNumber: index + 1,
      chapterGoal: `이 장에서는 ${lesson.filePath}의 책임과 주변 파일을 연결해 ${lesson.executionFlowPosition} 흐름을 이해합니다.`,
      relevantFiles: relatedLessons.map((item) => ({
        filePath: item.filePath,
        lessonHref: `html/files.html#${htmlAnchor(item.filePath)}`,
        sourceHref: `source/${encodedPath(item.filePath)}`
      })),
      relationshipCount: 0
    };
  });

  const abstractionByFile = new Map<string, string>();
  for (const abstraction of rawAbstractions) {
    for (const file of abstraction.relevantFiles) abstractionByFile.set(file.filePath, abstraction.id);
  }
  const graphFileByNode = new Map(componentGraphReport.nodes.filter((node) => node.type === "file" && node.path).map((node) => [node.id, node.path as string]));
  const relationships: TutorialAbstractionReport["relationships"] = [];
  const seenRelationships = new Set<string>();
  for (const edge of componentGraphReport.edges) {
    const fromFile = graphFileByNode.get(edge.from);
    const toFile = graphFileByNode.get(edge.to);
    const fromId = fromFile ? abstractionByFile.get(fromFile) : null;
    const toId = toFile ? abstractionByFile.get(toFile) : null;
    if (!fromId || !toId || fromId === toId) continue;
    const key = `${fromId}:${toId}:${edge.label}`;
    if (seenRelationships.has(key)) continue;
    seenRelationships.add(key);
    relationships.push({
      fromId,
      toId,
      label: edge.label,
      reason: `component graph에서 ${fromFile}와 ${toFile}가 ${edge.label} 관계로 이어집니다.`
    });
    if (relationships.length >= 12) break;
  }
  for (let index = 0; relationships.length < Math.max(0, rawAbstractions.length - 1) && index < rawAbstractions.length - 1; index += 1) {
    const from = rawAbstractions[index];
    const to = rawAbstractions[index + 1];
    const key = `${from.id}:${to.id}:chapter-order`;
    if (seenRelationships.has(key)) continue;
    seenRelationships.add(key);
    relationships.push({
      fromId: from.id,
      toId: to.id,
      label: "chapter-order",
      reason: `${from.name}를 먼저 읽은 뒤 ${to.name}로 넘어가면 튜토리얼 순서가 자연스럽습니다.`
    });
  }
  const abstractions = rawAbstractions.map((abstraction) => ({
    ...abstraction,
    relationshipCount: relationships.filter((relationship) => relationship.fromId === abstraction.id || relationship.toId === abstraction.id).length
  }));
  const chapterOrder = abstractions.map((abstraction, index) => ({
    chapterNumber: abstraction.chapterNumber,
    abstractionId: abstraction.id,
    title: abstraction.name,
    whyNow: index === 0
      ? "가장 먼저 읽을 핵심 파일에서 프로젝트의 출발점을 잡습니다."
      : "앞 장에서 잡은 책임과 관계를 바탕으로 다음 구현 단위를 확장합니다."
  }));
  return {
    summary: `PocketFlow식 codebase tutorial: ${abstractions.length}개 핵심 추상화를 찾고 ${relationships.length}개 관계와 장 순서로 재배열했습니다.`,
    sourcePattern: "PocketFlow codebase tutorial identify abstractions analyze relationships order chapters",
    abstractions,
    relationships,
    chapterOrder,
    learnerNextSteps: [
      "chapter order를 따라 첫 장의 관련 파일부터 원본과 파일 수업을 함께 여세요.",
      "relationship label을 보며 두 추상화가 왜 같은 튜토리얼 흐름에 들어가는지 설명해 보세요.",
      "각 추상화의 relevant files를 작은 코드 읽기 범위로 삼고, 필요한 경우 component graph에서 더 좁혀 보세요."
    ]
  };
}

function abstractionNameForFile(filePath: string): string {
  const base = path.basename(filePath).replace(/\.[^.]+$/, "");
  const words = base
    .split(/[-_\s.]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return `${words.join(" ") || "Source"} Abstraction`;
}

function buildDecisionRecordReport(
  repoMap: RepoMap,
  architectureReport: ArchitectureReport,
  runtimeEnvironmentReport: RuntimeEnvironmentReport,
  interfaceMapReport: InterfaceMapReport,
  contextPackReport: ContextPackReport,
  tutorialAbstractionReport: TutorialAbstractionReport
): DecisionRecordReport {
  const records: DecisionRecordReport["records"] = [
    {
      id: "adr-architecture-style",
      title: `Adopt ${architectureReport.architectureStyle} as the teaching model`,
      status: "accepted",
      scope: "global",
      context: architectureReport.explanation,
      decision: `Explain the repository as ${architectureReport.architectureStyle} and keep the architecture evidence attached to learner-facing pages.`,
      consequences: {
        positive: ["Learners start from a named architecture shape instead of isolated files.", "Architecture evidence stays linked to source-backed reports."],
        negative: ["The style is inferred statically and should be revisited after runtime verification."]
      },
      relatedReports: [{ label: "Architecture", href: "html/architecture.html" }],
      tags: ["architecture", "onboarding"]
    },
    {
      id: "adr-runtime-signals",
      title: "Document runtime setup from manifests and setup signals",
      status: runtimeEnvironmentReport.detectedManifests.length > 0 ? "accepted" : "proposed",
      scope: "global",
      context: runtimeEnvironmentReport.summary,
      decision: "Treat detected manifests, setup files, and container files as the first runtime decision record for a new maintainer.",
      consequences: {
        positive: ["Setup decisions are visible before a learner runs commands.", "Missing runtime signals become explicit follow-up work."],
        negative: ["Static setup signals cannot prove the app actually starts."]
      },
      relatedReports: [{ label: "Runtime Environment", href: "html/runtime-environment.html" }],
      tags: ["runtime", "setup"]
    },
    {
      id: "adr-interface-onboarding",
      title: "Use interface signals to orient user-facing entry points",
      status: interfaceMapReport.routeSignals.length + interfaceMapReport.apiSignals.length > 0 ? "accepted" : "proposed",
      scope: "global",
      context: interfaceMapReport.summary,
      decision: "Keep route, page, API, and component signals grouped as an onboarding decision surface.",
      consequences: {
        positive: ["Learners can connect code structure to user-visible behavior.", "API and component hints reduce blind source browsing."],
        negative: ["Projects with unconventional routing may need manual confirmation."]
      },
      relatedReports: [{ label: "Interface Map", href: "html/interface-map.html" }],
      tags: ["interface", "data-flow"]
    },
    {
      id: "adr-context-budget",
      title: "Budget AI handoff context before reading raw source",
      status: "accepted",
      scope: "global",
      context: contextPackReport.summary,
      decision: "Use context pack size, split plans, and excluded paths as a decision record before sending code to another AI tool.",
      consequences: {
        positive: ["Context-heavy files and excluded files are visible before handoff.", "Large repos can be split without losing directory grouping."],
        negative: ["Token estimates are approximate and should not replace target-tool validation."]
      },
      relatedReports: [{ label: "Context Pack", href: "html/context-pack.html" }],
      tags: ["ai-handoff", "context-budget"]
    },
    {
      id: "adr-tutorial-order",
      title: "Teach core abstractions in a fixed chapter order",
      status: tutorialAbstractionReport.abstractions.length > 0 ? "accepted" : "draft",
      scope: "global",
      context: tutorialAbstractionReport.summary,
      decision: "Use identified abstractions, relationships, and chapter order as the tutorial decision record for source reading.",
      consequences: {
        positive: ["Learners get a stable order through the most important source concepts.", "Relationships explain why one chapter follows another."],
        negative: ["Static chapter order may need adjustment after human domain review."]
      },
      relatedReports: [{ label: "Tutorial Abstractions", href: "html/tutorial-abstractions.html" }],
      tags: ["tutorial", "learning-path"]
    }
  ];
  const topScopes = repoMap.folders.slice(0, 5).map((folder) => ({
    name: folder.folderPath.split("/")[0] || "root",
    path: folder.folderPath,
    adrFolder: folder.folderPath === "." ? "docs/adr" : `${folder.folderPath}/docs/adr`,
    recordCount: records.filter((record) => record.scope === folder.folderPath).length
  }));
  const packageScopes = [{ name: "global", path: ".", adrFolder: "docs/adr", recordCount: records.length }, ...topScopes];
  const timeline = records.map((record, index) => ({
    sequence: index + 1,
    recordId: record.id,
    title: record.title,
    status: record.status,
    scope: record.scope
  }));
  return {
    summary: `Log4brains식 decision record report: ${records.length}개 ADR 후보를 status, context, decision, consequences, timeline, package scope로 정리했습니다.`,
    sourcePattern: "Log4brains ADR docs-as-code status context decision consequences timeline package-specific records",
    statusCounts: countBy(records.map((record) => record.status)),
    packageScopes,
    records,
    timeline,
    learnerNextSteps: [
      "accepted record는 현재 분석 근거로 설명하고 proposed/draft record는 사람 검토 대상으로 표시하세요.",
      "Context, Decision, Consequences를 한 문장씩 읽고 관련 report 링크에서 근거를 확인하세요.",
      "package scope가 있는 저장소라면 각 패키지의 docs/adr 위치에 실제 ADR을 둘지 결정하세요."
    ]
  };
}

function buildDependencyHealthReport(fileLessons: FileLesson[]): DependencyHealthReport {
  const fileSet = new Set(fileLessons.map((lesson) => lesson.filePath));
  const resolvedEdges: DependencyHealthReport["localDependencyEdges"] = [];
  const unresolvedEdges: DependencyHealthReport["localDependencyEdges"] = [];

  for (const lesson of fileLessons) {
    for (const importText of lesson.keyImports.filter(isRelativeImport)) {
      const resolved = resolveLocalImport(lesson.filePath, importText, fileSet);
      const edge = {
        fromFile: lesson.filePath,
        toFile: resolved ?? unresolvedLocalPath(lesson.filePath, importText),
        importText,
        dependencyType: resolved ? "local-import" as const : "unresolved-local-import" as const,
        lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
        sourceHref: `source/${encodedPath(lesson.filePath)}`
      };
      if (resolved) resolvedEdges.push(edge);
      else unresolvedEdges.push(edge);
    }
  }

  const outgoing = new Map(fileLessons.map((lesson) => [lesson.filePath, [] as string[]]));
  const incoming = new Map(fileLessons.map((lesson) => [lesson.filePath, [] as string[]]));
  for (const edge of resolvedEdges) {
    outgoing.get(edge.fromFile)?.push(edge.toFile);
    incoming.get(edge.toFile)?.push(edge.fromFile);
  }

  const cycles = detectDependencyCycles(outgoing).slice(0, 8).map((files, index) => ({
    id: `cycle-${index + 1}`,
    files,
    severity: "error" as const,
    suggestion: "dependency-cruiser의 no-circular 규칙처럼 책임을 나누거나 dependency inversion으로 한쪽 방향 의존성으로 바꾸세요."
  }));
  const orphanModules = fileLessons
    .filter((lesson) => isDependencyHealthModule(lesson.filePath))
    .filter((lesson) => (incoming.get(lesson.filePath)?.length ?? 0) === 0 && (outgoing.get(lesson.filePath)?.length ?? 0) === 0)
    .slice(0, 12)
    .map((lesson) => ({
      filePath: lesson.filePath,
      reason: "다른 핵심 파일에서 import하지 않고 이 파일도 핵심 파일을 import하지 않아 고립된 모듈 후보입니다.",
      lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
      sourceHref: `source/${encodedPath(lesson.filePath)}`
    }));
  const ruleViolations: DependencyHealthReport["ruleViolations"] = [
    ...cycles.map((cycle) => ({
      ruleName: "no-circular",
      severity: "error" as const,
      fromFile: cycle.files[0] ?? "unknown",
      toFile: cycle.files[1] ?? cycle.files[0] ?? null,
      message: `Circular dependency path: ${cycle.files.join(" -> ")}`,
      suggestion: cycle.suggestion
    })),
    ...orphanModules.map((module) => ({
      ruleName: "no-orphans",
      severity: "warn" as const,
      fromFile: module.filePath,
      toFile: null,
      message: `${module.filePath} is not connected to the local dependency graph.`,
      suggestion: "사용 중인 entry/config/test 파일이면 예외로 문서화하고, 아니라면 제거 또는 연결 여부를 검토하세요."
    })),
    ...unresolvedEdges.slice(0, 12).map((edge) => ({
      ruleName: "no-unresolved-local",
      severity: "warn" as const,
      fromFile: edge.fromFile,
      toFile: edge.toFile,
      message: `${edge.importText} could not be resolved inside the analyzed lesson files.`,
      suggestion: "확장자, index 파일, alias 설정, 또는 RepoTutor 핵심 파일 선정 범위를 확인하세요."
    }))
  ];
  const fanIn = rankFan(incoming);
  const fanOut = rankFan(outgoing);
  const graphMetrics = {
    nodeCount: fileLessons.length,
    edgeCount: resolvedEdges.length,
    maxFanIn: fanIn[0]?.count ?? 0,
    maxFanOut: fanOut[0]?.count ?? 0,
    topFanIn: fanIn.slice(0, 8),
    topFanOut: fanOut.slice(0, 8)
  };

  return {
    summary: `dependency-cruiser식 dependency health report: 핵심 파일 ${fileLessons.length}개에서 로컬 의존성 ${resolvedEdges.length}개, 순환 ${cycles.length}개, 고아 모듈 ${orphanModules.length}개, 미해결 로컬 import ${unresolvedEdges.length}개를 확인했습니다.`,
    sourcePattern: "dependency-cruiser no-circular no-orphans forbidden rules dependency graph validation",
    totalLocalDependencies: resolvedEdges.length,
    localDependencyEdges: [...resolvedEdges, ...unresolvedEdges],
    cycles,
    orphanModules,
    ruleViolations,
    graphMetrics,
    learnerNextSteps: [
      "cycles가 있으면 no-circular 항목의 파일 순서를 따라가며 한 방향 의존성으로 바꿀 수 있는지 확인하세요.",
      "orphanModules는 의도된 entry/config/test 예외인지, 실제로 제거 가능한 죽은 코드인지 구분하세요.",
      "topFanIn과 topFanOut이 큰 파일은 변경 영향도가 크므로 파일 수업과 원본을 함께 열어 책임을 나누세요."
    ]
  };
}

function buildProjectActivityReport(
  context: AnalysisContext,
  sourceSnapshotReport: SourceSnapshotReport,
  fileLessons: FileLesson[],
  dependencyHealthReport: DependencyHealthReport,
  decisionRecordReport: DecisionRecordReport
): ProjectActivityReport {
  const snapshotFiles = new Map(sourceSnapshotReport.files.map((file) => [file.filePath, file]));
  const fanIn = new Map(dependencyHealthReport.graphMetrics.topFanIn.map((item) => [item.filePath, item.count]));
  const fanOut = new Map(dependencyHealthReport.graphMetrics.topFanOut.map((item) => [item.filePath, item.count]));
  for (const edge of dependencyHealthReport.localDependencyEdges) {
    if (edge.dependencyType === "local-import") {
      fanOut.set(edge.fromFile, Math.max(fanOut.get(edge.fromFile) ?? 0, 1));
      fanIn.set(edge.toFile, Math.max(fanIn.get(edge.toFile) ?? 0, 1));
    }
  }

  const hotspotCandidates = fileLessons
    .map((lesson) => {
      const snapshotFile = snapshotFiles.get(lesson.filePath);
      const sizeKb = (snapshotFile?.size ?? 0) / 1024;
      const localImportCount = lesson.keyImports.filter(isRelativeImport).length;
      const externalImportCount = lesson.keyImports.length - localImportCount;
      const evidenceCount = lesson.sourceEvidence.length;
      const inbound = fanIn.get(lesson.filePath) ?? 0;
      const outbound = fanOut.get(lesson.filePath) ?? 0;
      const exportedSurface = lesson.keyExports.length;
      const entryWeight = lesson.executionFlowPosition.toLowerCase().includes("entry") ? 4 : 0;
      const score = Number((sizeKb + inbound * 3 + outbound * 2 + localImportCount * 1.5 + exportedSurface * 1.2 + evidenceCount * 0.5 + entryWeight).toFixed(2));
      const signals = [
        `${Math.round(sizeKb * 10) / 10} KiB source snapshot size`,
        `${inbound} fan-in / ${outbound} fan-out static dependency signal`,
        `${localImportCount} local imports / ${externalImportCount} external imports`,
        `${exportedSurface} exported symbols / ${evidenceCount} source evidence snippets`
      ];
      if (entryWeight > 0) signals.push("entry-like execution flow position");
      return {
        filePath: lesson.filePath,
        score,
        reason: "정적 파일 크기, import fan-in/fan-out, export surface, source evidence를 합산한 review hotspot 후보입니다.",
        signals,
        lessonHref: `html/files.html#${htmlAnchor(lesson.filePath)}`,
        sourceHref: `source/${encodedPath(lesson.filePath)}`
      };
    })
    .sort((a, b) => b.score - a.score || a.filePath.localeCompare(b.filePath))
    .slice(0, 12);

  const lessonByPath = new Map(fileLessons.map((lesson) => [lesson.filePath, lesson]));
  const deadCodeCandidates = dependencyHealthReport.orphanModules.map((module) => {
    const lesson = lessonByPath.get(module.filePath);
    const signalCount = (lesson?.keyExports.length ?? 0) + (lesson?.keyImports.length ?? 0) + (lesson?.sourceEvidence.length ?? 0);
    const confidence = Number(Math.min(0.95, 0.45 + (signalCount === 0 ? 0.3 : 0.1) + (dependencyHealthReport.ruleViolations.some((violation) => violation.fromFile === module.filePath && violation.ruleName === "no-orphans") ? 0.2 : 0)).toFixed(2));
    return {
      filePath: module.filePath,
      confidence,
      reason: `${module.reason} Git history가 없는 학습 snapshot에서는 실제 사용 여부를 단정하지 않고 검토 후보로만 표시합니다.`,
      relatedHref: module.lessonHref,
      sourceHref: module.sourceHref
    };
  });

  const decisionPrompts = [
    ...hotspotCandidates.slice(0, 4).map((candidate) => ({
      question: `${candidate.filePath} 같은 hotspot 후보를 바꿀 때 어떤 아키텍처 결정을 먼저 확인해야 하나요?`,
      trigger: `static hotspot score ${candidate.score}`,
      relatedHref: candidate.lessonHref
    })),
    ...decisionRecordReport.records.slice(0, 4).map((record) => ({
      question: `${record.title} 결정은 현재 분석된 파일 구조와 여전히 맞나요?`,
      trigger: `${record.status} decision in ${record.scope}`,
      relatedHref: `html/decision-records.html#${htmlAnchor(record.id)}`
    }))
  ].slice(0, 8);

  const reviewQueues: ProjectActivityReport["reviewQueues"] = [
    {
      queue: "hotspot-review",
      purpose: "fan-in/fan-out, 크기, export surface가 큰 파일을 먼저 읽고 변경 영향도를 확인합니다.",
      items: hotspotCandidates.slice(0, 5).map((candidate) => ({
        target: candidate.filePath,
        action: "파일 수업과 원본을 열어 책임, import 방향, test gap을 확인합니다.",
        why: `static hotspot score ${candidate.score}; ${candidate.signals[1]}`,
        relatedHref: candidate.lessonHref
      }))
    },
    {
      queue: "dead-code-review",
      purpose: "dependency-cruiser식 no-orphans 후보를 entry/config/test 예외와 실제 제거 후보로 분리합니다.",
      items: deadCodeCandidates.slice(0, 5).map((candidate) => ({
        target: candidate.filePath,
        action: "사용 중인 진입점인지 확인하고, 아니라면 제거 또는 연결을 검토합니다.",
        why: `dead-code confidence ${candidate.confidence}; ${candidate.reason}`,
        relatedHref: candidate.relatedHref
      }))
    },
    {
      queue: "decision-review",
      purpose: "변경 전에 관련 결정 기록과 ungoverned hotspot 후보를 확인합니다.",
      items: decisionPrompts.slice(0, 5).map((prompt) => ({
        target: prompt.trigger,
        action: prompt.question,
        why: "Repowise decision intelligence처럼 위험 파일과 결정 근거를 함께 보게 합니다.",
        relatedHref: prompt.relatedHref
      }))
    }
  ];

  const historyMode = context.commitHash || context.branch ? "git-metadata" : "snapshot-only";
  const historyReason = historyMode === "git-metadata"
    ? "학습 세션 생성 전에 branch/commit 메타데이터는 보존했지만, 안전한 복사본에서는 .git 디렉터리를 제거하므로 전체 churn, ownership, co-change history는 계산하지 않습니다."
    : "학습 세션 소스에는 Git 히스토리가 없어서 source snapshot과 정적 dependency/evidence 신호만 사용합니다.";

  return {
    summary: `Repowise식 project activity report: ${sourceSnapshotReport.totalFiles}개 파일 snapshot에서 hotspot 후보 ${hotspotCandidates.length}개, dead-code 후보 ${deadCodeCandidates.length}개, decision prompt ${decisionPrompts.length}개를 정리했습니다.`,
    sourcePattern: "Repowise git analytics code health hotspots ownership co-change dead code architectural decisions MCP risk",
    historyAvailability: {
      mode: historyMode,
      reason: historyReason,
      sourceType: context.sourceType ?? null,
      sourceUrl: context.sourceUrl ?? null,
      localSourcePath: context.localSourcePath ?? null,
      branch: context.branch ?? null,
      commitHash: context.commitHash ?? null
    },
    activitySignals: [
      {
        label: "Source snapshot",
        value: `${sourceSnapshotReport.totalFiles} files / ${sourceSnapshotReport.files.reduce((sum, file) => sum + file.size, 0)} bytes`,
        explanation: "세션 생성 시점의 파일 크기와 SHA-256 snapshot을 activity 기준선으로 사용합니다.",
        relatedHref: "html/incremental.html"
      },
      {
        label: "Git metadata",
        value: `${context.branch ?? "unknown"} @ ${context.commitHash ? context.commitHash.slice(0, 12) : "unknown"}`,
        explanation: historyReason,
        relatedHref: "session.json"
      },
      {
        label: "Dependency graph health",
        value: `${dependencyHealthReport.totalLocalDependencies} localDependencyEdges / ${dependencyHealthReport.orphanModules.length} orphanModules`,
        explanation: "정적 import 그래프에서 변경 영향도와 dead-code 검토 후보를 가져옵니다.",
        relatedHref: "html/dependency-health.html"
      },
      {
        label: "Decision coverage",
        value: `${decisionRecordReport.records.length} decision records / ${Object.keys(decisionRecordReport.statusCounts).length} statuses`,
        explanation: "위험 파일을 바꾸기 전에 읽을 architecture decision 후보를 연결합니다.",
        relatedHref: "html/decision-records.html"
      }
    ],
    hotspotCandidates,
    deadCodeCandidates,
    reviewQueues,
    architectureDecisionPrompts: decisionPrompts,
    learnerNextSteps: [
      "hotspot-review queue의 첫 파일을 열고 fan-in/fan-out 방향과 source evidence를 대조하세요.",
      "dead-code-review queue는 삭제 단정이 아니라 검토 후보입니다. entry/config/test 예외를 먼저 확인하세요.",
      "Git history가 필요한 churn, ownership, co-change 분석은 원본 Git 저장소에서 별도 full-history 분석으로 보강하세요.",
      "decision-review queue의 질문을 실제 ADR 또는 팀 결정 기록으로 승격할지 판단하세요."
    ]
  };
}

async function buildLicenseRightsReport(walk: WalkResult): Promise<LicenseRightsReport> {
  const licenseFiles: LicenseRightsReport["licenseFiles"] = [];
  const packageLicenseSignals: LicenseRightsReport["packageLicenseSignals"] = [];
  const readmeLicenseReferences: LicenseRightsReport["readmeLicenseReferences"] = [];

  for (const file of walk.files) {
    const licenseScore = licenseFilenameScore(file.relPath);
    if (licenseScore > 0) {
      const text = (await readTextIfSafe(file.absPath, 120_000)) ?? "";
      const detected = detectLicenseFromText(text, file.relPath);
      licenseFiles.push({
        filePath: file.relPath,
        filenameScore: licenseScore,
        detectedSpdxId: detected.spdxId,
        confidence: detected.confidence,
        matcher: detected.matcher,
        evidence: detected.evidence,
        sourceHref: `source/${encodedPath(file.relPath)}`
      });
      continue;
    }

    const packageSignal = await packageLicenseSignal(file);
    if (packageSignal) packageLicenseSignals.push(packageSignal);

    if (/^readme(\.[a-z0-9]+)?$/i.test(path.basename(file.relPath))) {
      const text = (await readTextIfSafe(file.absPath, 80_000)) ?? "";
      readmeLicenseReferences.push(...readmeLicenseSignals(file.relPath, text));
    }
  }

  licenseFiles.sort((a, b) => b.filenameScore - a.filenameScore || b.confidence - a.confidence || a.filePath.localeCompare(b.filePath));
  packageLicenseSignals.sort((a, b) => b.confidence - a.confidence || a.filePath.localeCompare(b.filePath));
  readmeLicenseReferences.sort((a, b) => b.confidence - a.confidence || a.filePath.localeCompare(b.filePath));

  const selected = selectProjectLicense(licenseFiles, packageLicenseSignals, readmeLicenseReferences);
  const reviewWarnings: LicenseRightsReport["reviewWarnings"] = [];
  if (licenseFiles.length === 0) {
    reviewWarnings.push({
      severity: "error",
      message: "Licensee pattern: no root LICENSE/COPYING/UNLICENSE or top-level LICENSES/* candidate was found.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (licenseFiles.length > 1 && new Set(licenseFiles.map((file) => file.detectedSpdxId ?? "unknown")).size > 1) {
    reviewWarnings.push({
      severity: "warn",
      message: "Multiple license file candidates point to different identifiers; human review is required before publishing or reusing code.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (packageLicenseSignals.length > 0 && licenseFiles.length === 0) {
    reviewWarnings.push({
      severity: "warn",
      message: "Package metadata declares a license, but Licensee notes package fields are not a platform-agnostic substitute for a distributed license file.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (readmeLicenseReferences.length > 0) {
    reviewWarnings.push({
      severity: "info",
      message: "README license references are treated as review hints because natural-language license claims can be ambiguous.",
      relatedHref: "html/license-rights.html"
    });
  }

  const rightsChecklist: LicenseRightsReport["rightsChecklist"] = [
    {
      label: "Root license file",
      status: licenseFiles.length > 0 ? "pass" : "missing",
      evidence: licenseFiles.length > 0 ? `${licenseFiles.length} candidate license file(s) found.` : "No LICENSE, LICENCE, COPYING, COPYRIGHT, UNLICENSE, or LICENSES/* candidate found.",
      relatedHref: "html/license-rights.html"
    },
    {
      label: "Package license metadata",
      status: packageLicenseSignals.length > 0 ? "review" : "missing",
      evidence: packageLicenseSignals.length > 0 ? `${packageLicenseSignals.length} package manifest license signal(s) found.` : "No package manager license field detected in supported manifests.",
      relatedHref: "html/license-rights.html"
    },
    {
      label: "README license references",
      status: readmeLicenseReferences.length > 0 ? "review" : "missing",
      evidence: readmeLicenseReferences.length > 0 ? `${readmeLicenseReferences.length} README license reference(s) found.` : "No README license reference detected.",
      relatedHref: "html/license-rights.html"
    },
    {
      label: "Project license confidence",
      status: selected.spdxId && selected.confidence >= 0.8 ? "pass" : selected.spdxId ? "review" : "missing",
      evidence: selected.evidence,
      relatedHref: selected.sourceHref ?? "html/license-rights.html"
    }
  ];

  return {
    summary: `Licensee식 license rights report: license file 후보 ${licenseFiles.length}개, package license 신호 ${packageLicenseSignals.length}개, README 참조 ${readmeLicenseReferences.length}개를 분리해 검토 상태를 표시했습니다.`,
    sourcePattern: "Licensee license file detection filename score SPDX confidence matched_files package metadata README references human compliance review",
    detectedProjectLicense: selected,
    licenseFiles,
    packageLicenseSignals,
    readmeLicenseReferences,
    reviewWarnings,
    rightsChecklist,
    learnerNextSteps: [
      "Root license file 항목이 missing이면 배포/공개 전 LICENSE 파일을 추가할지 결정하세요.",
      "package license metadata는 보조 신호입니다. 실제 배포 권리는 license file과 원문을 먼저 확인하세요.",
      "README license reference는 자연어 힌트이므로 detectedProjectLicense를 확정하는 근거로 단독 사용하지 마세요.",
      "여러 license 후보가 있으면 선택형/이중 라이선스인지, 서로 충돌하는지 사람 검토로 분리하세요."
    ]
  };
}

function licenseFilenameScore(filePath: string): number {
  const parts = filePath.split("/");
  const fileName = parts.at(-1) ?? filePath;
  const lower = fileName.toLowerCase();
  if (parts.length === 2 && parts[0] === "LICENSES" && /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.(?:md|markdown|txt|html)$/i.test(fileName)) return 1;
  if (/^(un)?licen[sc]e$/i.test(fileName)) return 1;
  if (/^(un)?licen[sc]e\.(md|markdown|txt|html)$/i.test(fileName)) return 0.95;
  if (/^copying$/i.test(fileName)) return 0.9;
  if (/^copying\.(md|markdown|txt|html)$/i.test(fileName)) return 0.85;
  if (/^(un)?licen[sc]e[-_][^.]+(\.[a-z0-9]+)?$/i.test(fileName)) return 0.7;
  if (/^copying[-_][^.]+(\.[a-z0-9]+)?$/i.test(fileName)) return 0.65;
  if (/^copyright(\.(md|markdown|txt|html))?$/i.test(fileName)) return 0.35;
  if (/^patents(\.[a-z0-9]+)?$/i.test(fileName)) return 0.15;
  if (lower === "unlicense") return 1;
  return 0;
}

function detectLicenseFromText(text: string, filePath: string): { spdxId: string | null; confidence: number; matcher: LicenseRightsReport["licenseFiles"][number]["matcher"]; evidence: string } {
  const spdxFromFilename = spdxFromLicenseFilename(filePath);
  const normalized = text.toLowerCase().replace(/\s+/g, " ");
  if (/^\s*copyright\s+\(?(c\))?\s+/i.test(text.trim()) && text.trim().split(/\r?\n/).length <= 3) {
    return { spdxId: null, confidence: 0.8, matcher: "copyright-only", evidence: "Only a short copyright notice was detected; treat as no explicit license until reviewed." };
  }
  const keyword = knownLicenseKeyword(normalized);
  if (keyword) {
    return { spdxId: keyword.spdxId, confidence: keyword.confidence, matcher: keyword.exact ? "exact-keyword" : "text-similarity-hint", evidence: keyword.evidence };
  }
  if (spdxFromFilename) {
    return { spdxId: spdxFromFilename, confidence: 0.75, matcher: "spdx-filename", evidence: `SPDX-style identifier inferred from filename ${path.basename(filePath)}.` };
  }
  return { spdxId: null, confidence: 0.2, matcher: "unknown", evidence: "Filename looked license-related, but no supported license keyword was detected." };
}

function knownLicenseKeyword(normalized: string): { spdxId: string; confidence: number; exact: boolean; evidence: string } | null {
  const candidates = [
    { spdxId: "MIT", exact: /mit license|permission is hereby granted, free of charge/.test(normalized) },
    { spdxId: "Apache-2.0", exact: /apache license, version 2\.0|www\.apache\.org\/licenses\/license-2\.0/.test(normalized) },
    { spdxId: "AGPL-3.0-or-later", exact: /gnu affero general public license|agpl/.test(normalized) },
    { spdxId: "LGPL-3.0-or-later", exact: /gnu lesser general public license|lgpl/.test(normalized) },
    { spdxId: "GPL-3.0-or-later", exact: /gnu general public license|\bgpl\b/.test(normalized) },
    { spdxId: "BSD-3-Clause", exact: /redistribution and use in source and binary forms|bsd 3-clause/.test(normalized) },
    { spdxId: "ISC", exact: /isc license|permission to use, copy, modify, and\/or distribute this software/.test(normalized) },
    { spdxId: "MPL-2.0", exact: /mozilla public license version 2\.0|mpl-2\.0/.test(normalized) },
    { spdxId: "Unlicense", exact: /this is free and unencumbered software released into the public domain|unlicense/.test(normalized) },
    { spdxId: "CC0-1.0", exact: /creative commons zero|cc0 1\.0 universal/.test(normalized) }
  ];
  const found = candidates.find((candidate) => candidate.exact);
  if (!found) return null;
  return { spdxId: found.spdxId, confidence: 0.92, exact: true, evidence: `Recognized ${found.spdxId} license keyword in license text.` };
}

function spdxFromLicenseFilename(filePath: string): string | null {
  const base = path.basename(filePath).replace(/\.(md|markdown|txt|html)$/i, "");
  if (filePath.startsWith("LICENSES/") && /^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(base)) return base;
  const match = base.match(/(?:license|copying)[-_]([A-Za-z0-9][A-Za-z0-9.-]*)$/i);
  return match?.[1] ?? null;
}

async function packageLicenseSignal(file: WalkResult["files"][number]): Promise<LicenseRightsReport["packageLicenseSignals"][number] | null> {
  const base = path.basename(file.relPath);
  if (!["package.json", "Cargo.toml", "pyproject.toml"].includes(base)) return null;
  const text = await readTextIfSafe(file.absPath, 120_000);
  if (text === null) return null;
  let packageName: string | null = null;
  let licenseText: string | null = null;
  if (base === "package.json") {
    try {
      const parsed = JSON.parse(text) as { name?: unknown; license?: unknown };
      packageName = typeof parsed.name === "string" ? parsed.name : null;
      licenseText = typeof parsed.license === "string" ? parsed.license : null;
    } catch {
      licenseText = null;
    }
  } else {
    packageName = text.match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1] ?? null;
    licenseText = text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1] ?? null;
  }
  if (!licenseText) return null;
  return {
    filePath: file.relPath,
    packageName,
    licenseText,
    detectedSpdxId: normalizeSpdxExpression(licenseText),
    confidence: 0.65,
    sourceHref: `source/${encodedPath(file.relPath)}`
  };
}

function readmeLicenseSignals(filePath: string, text: string): LicenseRightsReport["readmeLicenseReferences"] {
  const signals: LicenseRightsReport["readmeLicenseReferences"] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!/licen[sc]e|copyright|apache|mit|gpl|agpl|bsd|unlicense/i.test(line)) continue;
    const detected = normalizeSpdxExpression(line) ?? knownLicenseKeyword(line.toLowerCase())?.spdxId ?? null;
    signals.push({
      filePath,
      detectedSpdxId: detected,
      snippet: line.trim().slice(0, 220),
      confidence: detected ? 0.45 : 0.25,
      sourceHref: `source/${encodedPath(filePath)}`
    });
    if (signals.length >= 6) break;
  }
  return signals;
}

function normalizeSpdxExpression(value: string): string | null {
  const clean = value.trim().replace(/^license\s*[:=]\s*/i, "").replace(/^["']|["']$/g, "");
  const simple = clean.match(/\b(MIT|Apache-2\.0|AGPL-3\.0(?:-or-later|-only)?|GPL-3\.0(?:-or-later|-only)?|LGPL-3\.0(?:-or-later|-only)?|BSD-3-Clause|BSD-2-Clause|ISC|MPL-2\.0|Unlicense|CC0-1\.0)\b/i)?.[1];
  if (!simple) return null;
  const canonical = simple.toUpperCase() === "UNLICENSE" ? "Unlicense" : simple.toUpperCase() === "MIT" ? "MIT" : simple;
  return canonical;
}

function selectProjectLicense(
  licenseFiles: LicenseRightsReport["licenseFiles"],
  packageSignals: LicenseRightsReport["packageLicenseSignals"],
  readmeSignals: LicenseRightsReport["readmeLicenseReferences"]
): LicenseRightsReport["detectedProjectLicense"] {
  const primaryFile = licenseFiles.find((file) => file.detectedSpdxId) ?? licenseFiles[0];
  if (primaryFile?.detectedSpdxId) {
    return {
      spdxId: primaryFile.detectedSpdxId,
      confidence: primaryFile.confidence,
      evidence: `${primaryFile.filePath} matched by ${primaryFile.matcher}: ${primaryFile.evidence}`,
      sourceHref: primaryFile.sourceHref
    };
  }
  const packageSignal = packageSignals[0];
  if (packageSignal?.detectedSpdxId) {
    return {
      spdxId: packageSignal.detectedSpdxId,
      confidence: packageSignal.confidence,
      evidence: `${packageSignal.filePath} declares license ${packageSignal.licenseText}; treat as package metadata review signal.`,
      sourceHref: packageSignal.sourceHref
    };
  }
  const readmeSignal = readmeSignals[0];
  if (readmeSignal?.detectedSpdxId) {
    return {
      spdxId: readmeSignal.detectedSpdxId,
      confidence: readmeSignal.confidence,
      evidence: `${readmeSignal.filePath} contains license reference: ${readmeSignal.snippet}`,
      sourceHref: readmeSignal.sourceHref
    };
  }
  return {
    spdxId: null,
    confidence: 0,
    evidence: "No project license could be detected from Licensee-style file, package, or README signals.",
    sourceHref: null
  };
}

async function buildSbomReport(context: AnalysisContext, walk: WalkResult): Promise<SbomReport> {
  const packageManifests: SbomReport["packageManifests"] = [];
  const packageArtifacts: SbomReport["packageArtifacts"] = [];
  const fileArtifacts: SbomReport["fileArtifacts"] = [];
  const relationships: SbomReport["relationships"] = [];
  const sourceNode = "source:repository";

  for (const file of walk.files) {
    const artifactKind = sbomFileArtifactKind(file.relPath);
    if (artifactKind) {
      fileArtifacts.push({
        filePath: file.relPath,
        artifactKind,
        size: file.size,
        sourceHref: `source/${encodedPath(file.relPath)}`
      });
      relationships.push({
        from: sourceNode,
        to: file.relPath,
        relationshipType: "contains",
        evidenceHref: `source/${encodedPath(file.relPath)}`
      });
    }

    const manifest = await sbomManifestArtifacts(file);
    if (!manifest) continue;
    packageManifests.push(manifest.manifest);
    packageArtifacts.push(...manifest.packages);
    relationships.push(...manifest.relationships);
  }

  packageManifests.sort((a, b) => a.filePath.localeCompare(b.filePath));
  packageArtifacts.sort((a, b) => a.ecosystem.localeCompare(b.ecosystem) || a.name.localeCompare(b.name) || (a.version ?? "").localeCompare(b.version ?? ""));
  fileArtifacts.sort((a, b) => a.filePath.localeCompare(b.filePath));

  const reviewWarnings: SbomReport["reviewWarnings"] = [];
  if (packageManifests.length === 0) {
    reviewWarnings.push({
      severity: "error",
      message: "Syft-style SBOM inventory found no supported package manifests.",
      relatedHref: "html/sbom.html"
    });
  }
  if (packageArtifacts.length > 0 && !fileArtifacts.some((artifact) => artifact.artifactKind === "lockfile")) {
    reviewWarnings.push({
      severity: "warn",
      message: "Package manifests were found, but no lockfile artifact was detected; exact resolved package versions may need a package-manager lockfile.",
      relatedHref: "html/sbom.html"
    });
  }
  if (fileArtifacts.some((artifact) => artifact.artifactKind === "container")) {
    reviewWarnings.push({
      severity: "info",
      message: "Container build files were detected. This static report records them as evidence but does not inspect built images or OS packages.",
      relatedHref: "html/sbom.html"
    });
  }

  return {
    summary: `Syft식 SBOM report: package manifest ${packageManifests.length}개, package artifact ${packageArtifacts.length}개, file artifact ${fileArtifacts.length}개, relationship ${relationships.length}개를 정적 분석으로 기록했습니다.`,
    sourcePattern: "Syft SBOM source descriptor artifacts packages file metadata relationships CycloneDX SPDX output formats",
    sourceDescriptor: {
      sourceType: context.sourceType ?? null,
      sourceUrl: context.sourceUrl ?? null,
      localSourcePath: context.localSourcePath ?? null,
      branch: context.branch ?? null,
      commitHash: context.commitHash ?? null,
      descriptorName: "RepoTutor static SBOM",
      descriptorVersion: "1"
    },
    packageManifests,
    packageArtifacts,
    fileArtifacts,
    relationships,
    outputFormats: [
      {
        format: "syft-json",
        readiness: "partial",
        reason: "RepoTutor emits a static educational SBOM report, not Syft's full schema with resolver metadata."
      },
      {
        format: "cyclonedx-json",
        readiness: "partial",
        reason: "Package name/version/PURL fields are present where manifest data allows, but this report does not emit a full CycloneDX document."
      },
      {
        format: "spdx-json",
        readiness: "partial",
        reason: "Package and license hints are recorded, but SPDX document namespace, checksums, and full package verification are outside the static learner report."
      }
    ],
    reviewWarnings,
    learnerNextSteps: [
      "Lockfile가 missing이면 실제 배포 전 package manager lockfile로 resolved version을 확인하세요.",
      "container artifact가 있으면 Syft 같은 실제 SBOM 도구로 image/filesystem을 별도 스캔하세요.",
      "PURL이 없는 package artifact는 manifest가 이름/버전 정보를 충분히 제공하는지 확인하세요.",
      "이 report는 학습용 정적 inventory입니다. 보안 스캔이나 규제 제출용 SBOM을 대체하지 않습니다."
    ]
  };
}

async function sbomManifestArtifacts(file: WalkResult["files"][number]): Promise<{
  manifest: SbomReport["packageManifests"][number];
  packages: SbomReport["packageArtifacts"];
  relationships: SbomReport["relationships"];
} | null> {
  const base = path.basename(file.relPath);
  if (!["package.json", "Cargo.toml", "requirements.txt", "pyproject.toml", "go.mod"].includes(base)) return null;
  const text = await readTextIfSafe(file.absPath, 160_000);
  if (text === null) return null;
  const ecosystem = sbomEcosystemForManifest(file.relPath);
  const sourceHref = `source/${encodedPath(file.relPath)}`;
  const packages = parseSbomPackages(file.relPath, text, ecosystem);
  const directDependencies = packages.filter((pkg) => !/dev|test/i.test(pkg.foundBy)).length;
  const devDependencies = packages.length - directDependencies;
  return {
    manifest: {
      filePath: file.relPath,
      ecosystem,
      packageCount: packages.length,
      directDependencies,
      devDependencies,
      sourceHref
    },
    packages,
    relationships: [
      {
        from: file.relPath,
        to: ecosystem,
        relationshipType: "uses-ecosystem",
        evidenceHref: sourceHref
      },
      ...packages.map((pkg) => ({
        from: file.relPath,
        to: `${pkg.packageType}:${pkg.name}`,
        relationshipType: "declares" as const,
        evidenceHref: sourceHref
      })),
      ...packages.map((pkg) => ({
        from: `${pkg.packageType}:${pkg.name}`,
        to: file.relPath,
        relationshipType: "evidence-for" as const,
        evidenceHref: sourceHref
      }))
    ]
  };
}

function parseSbomPackages(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const base = path.basename(filePath);
  if (base === "package.json") return parsePackageJsonSbom(filePath, text, ecosystem);
  if (base === "Cargo.toml") return parseCargoSbom(filePath, text, ecosystem);
  if (base === "requirements.txt") return parseRequirementsSbom(filePath, text, ecosystem);
  if (base === "pyproject.toml") return parsePyprojectSbom(filePath, text, ecosystem);
  if (base === "go.mod") return parseGoModSbom(filePath, text, ecosystem);
  return [];
}

function parsePackageJsonSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  try {
    const json = JSON.parse(text) as {
      name?: unknown;
      version?: unknown;
      license?: unknown;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const packages: SbomReport["packageArtifacts"] = [];
    if (typeof json.name === "string") {
      packages.push(sbomPackageArtifact({
        name: json.name,
        version: typeof json.version === "string" ? json.version : null,
        ecosystem,
        packageType: "npm",
        foundBy: "package-json-project",
        filePath,
        licenses: typeof json.license === "string" ? [json.license] : []
      }));
    }
    for (const [name, version] of Object.entries(json.dependencies ?? {})) {
      packages.push(sbomPackageArtifact({ name, version, ecosystem, packageType: "npm", foundBy: "package-json-dependencies", filePath, licenses: [] }));
    }
    for (const [name, version] of Object.entries(json.devDependencies ?? {})) {
      packages.push(sbomPackageArtifact({ name, version, ecosystem, packageType: "npm", foundBy: "package-json-devDependencies", filePath, licenses: [] }));
    }
    return packages;
  } catch {
    return [];
  }
}

function parseCargoSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const packages: SbomReport["packageArtifacts"] = [];
  const projectName = text.match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1];
  if (projectName) {
    packages.push(sbomPackageArtifact({
      name: projectName,
      version: text.match(/^\s*version\s*=\s*["']([^"']+)["']/m)?.[1] ?? null,
      ecosystem,
      packageType: "cargo",
      foundBy: "cargo-project",
      filePath,
      licenses: text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1]?.split(/\s+OR\s+|\s+AND\s+/i) ?? []
    }));
  }
  for (const name of manifestSectionKeys(text, "dependencies")) {
    packages.push(sbomPackageArtifact({ name, version: null, ecosystem, packageType: "cargo", foundBy: "cargo-dependencies", filePath, licenses: [] }));
  }
  for (const name of manifestSectionKeys(text, "dev-dependencies")) {
    packages.push(sbomPackageArtifact({ name, version: null, ecosystem, packageType: "cargo", foundBy: "cargo-dev-dependencies", filePath, licenses: [] }));
  }
  return packages;
}

function parseRequirementsSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"))
    .slice(0, 80)
    .map((line) => {
      const [name, version] = line.split(/[=<>~!]=?/);
      return sbomPackageArtifact({ name: name.trim(), version: version?.trim() ?? null, ecosystem, packageType: "pypi", foundBy: "requirements.txt", filePath, licenses: [] });
    });
}

function parsePyprojectSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const packages: SbomReport["packageArtifacts"] = [];
  const projectName = text.match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1];
  if (projectName) {
    packages.push(sbomPackageArtifact({
      name: projectName,
      version: text.match(/^\s*version\s*=\s*["']([^"']+)["']/m)?.[1] ?? null,
      ecosystem,
      packageType: "pypi",
      foundBy: "pyproject-project",
      filePath,
      licenses: text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1] ? [text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1] as string] : []
    }));
  }
  const dependencyBlock = text.match(/dependencies\s*=\s*\[([\s\S]*?)\]/m)?.[1] ?? "";
  for (const match of dependencyBlock.matchAll(/["']([^"']+)["']/g)) {
    const [name, version] = match[1].split(/[=<>~!]=?/);
    packages.push(sbomPackageArtifact({ name: name.trim(), version: version?.trim() ?? null, ecosystem, packageType: "pypi", foundBy: "pyproject-dependencies", filePath, licenses: [] }));
  }
  return packages;
}

function parseGoModSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const packages: SbomReport["packageArtifacts"] = [];
  const moduleName = text.match(/^module\s+(.+)$/m)?.[1]?.trim();
  if (moduleName) {
    packages.push(sbomPackageArtifact({ name: moduleName, version: null, ecosystem, packageType: "go", foundBy: "go-module", filePath, licenses: [] }));
  }
  const requireLines = [...text.matchAll(/^\s*require\s+([^\s]+)\s+([^\s]+)/gm)].map((match) => [match[1], match[2]] as const);
  const blockLines = [...text.matchAll(/^\s*([^\s()]+)\s+(v[^\s]+)(?:\s+\/\/.*)?$/gm)].map((match) => [match[1], match[2]] as const);
  for (const [name, version] of [...requireLines, ...blockLines].slice(0, 80)) {
    if (name === moduleName || name === "module" || name === "go") continue;
    packages.push(sbomPackageArtifact({ name, version, ecosystem, packageType: "go", foundBy: "go-mod-require", filePath, licenses: [] }));
  }
  return packages;
}

function sbomPackageArtifact(input: {
  name: string;
  version: string | null;
  ecosystem: string;
  packageType: string;
  foundBy: string;
  filePath: string;
  licenses: string[];
}): SbomReport["packageArtifacts"][number] {
  const version = normalizeManifestVersion(input.version);
  return {
    name: input.name,
    version,
    ecosystem: input.ecosystem,
    packageType: input.packageType,
    purl: packageUrl(input.packageType, input.name, version),
    licenses: input.licenses.filter(Boolean),
    foundBy: input.foundBy,
    locations: [input.filePath],
    evidenceHref: `source/${encodedPath(input.filePath)}`
  };
}

function sbomFileArtifactKind(filePath: string): SbomReport["fileArtifacts"][number]["artifactKind"] | null {
  const base = path.basename(filePath);
  if (["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "Cargo.lock", "poetry.lock", "Pipfile.lock", "go.sum"].includes(base)) return "lockfile";
  if (["package.json", "Cargo.toml", "requirements.txt", "pyproject.toml", "go.mod"].includes(base)) return "manifest";
  if (/^Dockerfile/i.test(base) || /docker-compose\.ya?ml$/i.test(base)) return "container";
  if (/\.ya?ml$/i.test(base) || /\.toml$/i.test(base)) return "config";
  return null;
}

function sbomEcosystemForManifest(filePath: string): string {
  const base = path.basename(filePath);
  if (base === "package.json") return "JavaScript/Node";
  if (base === "Cargo.toml") return "Rust/Cargo";
  if (base === "requirements.txt" || base === "pyproject.toml") return "Python";
  if (base === "go.mod") return "Go";
  return inferEcosystem(filePath);
}

function manifestSectionKeys(text: string, section: string): string[] {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = text.match(new RegExp(`^\\s*\\[${escaped}\\]\\s*$([\\s\\S]*?)(?=^\\s*\\[|$)`, "m"))?.[1] ?? "";
  return [...block.matchAll(/^\s*([A-Za-z0-9_-]+)\s*=/gm)].map((match) => match[1]).filter(Boolean);
}

function normalizeManifestVersion(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/^[\^~<>=!* ]+/, "");
  return cleaned || value.trim();
}

function packageUrl(packageType: string, name: string, version: string | null): string | null {
  const normalizedName = name.trim();
  if (!normalizedName) return null;
  const encodedName = normalizedName.split("/").map(encodeURIComponent).join("/");
  return `pkg:${packageType}/${encodedName}${version ? `@${encodeURIComponent(version)}` : ""}`;
}

function buildSecurityReadinessReport(
  walk: WalkResult,
  sbomReport: SbomReport,
  licenseRightsReport: LicenseRightsReport
): SecurityReadinessReport {
  const textFileCount = walk.files.filter((file) => file.isTextCandidate).length;
  const lockfiles = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile");
  const containerFiles = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "container");
  const iacFiles = walk.files.filter((file) => isIacConfigFile(file.relPath));
  const hasPackages = sbomReport.packageArtifacts.length > 0;
  const hasLicenseEvidence = licenseRightsReport.licenseFiles.length > 0 || licenseRightsReport.packageLicenseSignals.length > 0;
  const securitySignals: SecurityReadinessReport["securitySignals"] = [
    ...sbomReport.packageManifests.map((manifest) => ({
      kind: "manifest" as const,
      filePath: manifest.filePath,
      severity: "info" as const,
      message: `${manifest.ecosystem} manifest declares ${manifest.packageCount} package artifact(s).`,
      sourceHref: manifest.sourceHref
    })),
    ...lockfiles.map((artifact) => ({
      kind: "lockfile" as const,
      filePath: artifact.filePath,
      severity: "info" as const,
      message: "Lockfile can improve exact vulnerability matching for language package scanners.",
      sourceHref: artifact.sourceHref
    })),
    ...containerFiles.map((artifact) => ({
      kind: "container-config" as const,
      filePath: artifact.filePath,
      severity: "warn" as const,
      message: "Container build/config file should be scanned for image, package, and misconfiguration risk.",
      sourceHref: artifact.sourceHref
    })),
    ...iacFiles.map((file) => ({
      kind: "iac-config" as const,
      filePath: file.relPath,
      severity: "warn" as const,
      message: "IaC-style config file can be checked by Trivy misconfiguration scanning.",
      sourceHref: `source/${encodedPath(file.relPath)}`
    })),
    ...walk.secretCandidatePaths.map((filePath) => ({
      kind: "secret-candidate" as const,
      filePath,
      severity: "error" as const,
      message: "Secret-like path was excluded from the safe study snapshot and should be scanned in the original repository.",
      sourceHref: "html/security-readiness.html"
    })),
    ...licenseRightsReport.licenseFiles.map((file) => ({
      kind: "license" as const,
      filePath: file.filePath,
      severity: file.detectedSpdxId ? "info" as const : "warn" as const,
      message: file.detectedSpdxId ? `License evidence detected as ${file.detectedSpdxId}.` : "License file exists but needs human classification.",
      sourceHref: file.sourceHref
    })),
    {
      kind: "sbom" as const,
      filePath: "analysis/sbom-report.json",
      severity: hasPackages ? "info" as const : "warn" as const,
      message: hasPackages ? `${sbomReport.packageArtifacts.length} package artifact(s) are available for scanner handoff.` : "No package artifact inventory is available.",
      sourceHref: "html/sbom.html"
    }
  ];

  const scannerTargets: SecurityReadinessReport["scannerTargets"] = [
    {
      target: "filesystem",
      readiness: textFileCount > 0 ? "ready" : "missing",
      evidence: textFileCount > 0 ? `${textFileCount} safe text file(s) are available in the study snapshot.` : "No safe text files are available to scan.",
      relatedHref: "html/files.html"
    },
    {
      target: "git-repository",
      readiness: "partial",
      evidence: "RepoTutor preserves branch/commit metadata, but the safe study source removes .git history; scan the original repository for full git context.",
      relatedHref: "html/project-activity.html"
    },
    {
      target: "container-image",
      readiness: containerFiles.length > 0 ? "partial" : "missing",
      evidence: containerFiles.length > 0 ? `${containerFiles.length} container config file(s) found; built image scanning still requires an image reference.` : "No Dockerfile or docker-compose file was detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      target: "kubernetes",
      readiness: iacFiles.some((file) => /k8s|kubernetes|helm|chart|deployment|service/i.test(file.relPath)) ? "partial" : "missing",
      evidence: iacFiles.length > 0 ? `${iacFiles.length} IaC-like config file(s) found; Kubernetes readiness depends on actual manifest type.` : "No Kubernetes or IaC config file was detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      target: "sbom",
      readiness: hasPackages ? "ready" : "missing",
      evidence: hasPackages ? `${sbomReport.packageArtifacts.length} package artifact(s) are available in the static SBOM report.` : "No package artifacts are available for SBOM target scanning.",
      relatedHref: "html/sbom.html"
    }
  ];

  const scannerCoverage: SecurityReadinessReport["scannerCoverage"] = [
    {
      scanner: "vulnerability",
      readiness: hasPackages && lockfiles.length > 0 ? "ready" : hasPackages ? "partial" : "missing",
      evidence: hasPackages && lockfiles.length > 0 ? `${lockfiles.length} lockfile(s) and ${sbomReport.packageArtifacts.length} package artifact(s) found.` : hasPackages ? "Package manifests exist, but no lockfile was detected for exact resolved versions." : "No package artifacts were detected.",
      relatedHref: "html/sbom.html"
    },
    {
      scanner: "secret",
      readiness: textFileCount > 0 ? "ready" : "missing",
      evidence: textFileCount > 0 ? `Secret scanning can inspect ${textFileCount} safe text file(s); excluded secret-like paths must be scanned in the original source.` : "No text files are available for secret scanning.",
      relatedHref: "html/security-readiness.html"
    },
    {
      scanner: "misconfiguration",
      readiness: containerFiles.length > 0 || iacFiles.length > 0 ? "ready" : "missing",
      evidence: containerFiles.length > 0 || iacFiles.length > 0 ? `${containerFiles.length} container config and ${iacFiles.length} IaC config file(s) found.` : "No Docker, Kubernetes, Terraform, CloudFormation, or Helm-style config files were detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      scanner: "license",
      readiness: hasLicenseEvidence ? "ready" : "missing",
      evidence: hasLicenseEvidence ? "License evidence is available from License Rights report." : "No license file or package license signal was detected.",
      relatedHref: "html/license-rights.html"
    },
    {
      scanner: "sbom",
      readiness: hasPackages ? "ready" : "missing",
      evidence: hasPackages ? "Static SBOM package artifacts are available for handoff." : "No package artifacts are available.",
      relatedHref: "html/sbom.html"
    }
  ];

  const actionQueue: SecurityReadinessReport["actionQueue"] = [];
  if (hasPackages && lockfiles.length === 0) {
    actionQueue.push({
      priority: "high",
      action: "Add or verify a package lockfile before vulnerability triage.",
      why: "Trivy vulnerability matching is more precise when resolved package versions are known.",
      relatedHref: "html/sbom.html"
    });
  }
  if (!hasLicenseEvidence) {
    actionQueue.push({
      priority: "high",
      action: "Add or verify project license evidence.",
      why: "Trivy can classify licenses, but the project first needs discoverable license evidence.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (containerFiles.length === 0 && iacFiles.length === 0) {
    actionQueue.push({
      priority: "medium",
      action: "Record deployment artifacts if this project ships containers or infrastructure.",
      why: "Misconfiguration scanning needs Docker, Kubernetes, Terraform, CloudFormation, or similar config files.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  actionQueue.push({
    priority: "low",
    action: "Run the real scanner outside RepoTutor when security decisions matter.",
    why: "This report is readiness metadata only and does not query vulnerability databases or scan secrets.",
    relatedHref: "html/security-readiness.html"
  });

  return {
    summary: `Trivy식 security readiness report: targets ${scannerTargets.length}개, scanner coverage ${scannerCoverage.length}개, security signal ${securitySignals.length}개, action ${actionQueue.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Trivy targets scanners vulnerability secret misconfiguration license SBOM severity security readiness",
    scannerTargets,
    scannerCoverage,
    securitySignals,
    actionQueue,
    recommendedCommands: [
      {
        command: "trivy fs --scanners vuln,secret,misconfig,license <project>",
        purpose: "Filesystem snapshot에서 vulnerability, secret, misconfiguration, license scanner를 함께 실행합니다."
      },
      {
        command: "trivy repo --scanners vuln,secret,misconfig,license <git-url>",
        purpose: "원본 Git repository를 대상으로 safe study snapshot에서 빠진 git context와 secret-like paths를 확인합니다."
      },
      {
        command: "trivy sbom <sbom-file>",
        purpose: "실제 CycloneDX/SPDX/Syft SBOM 파일이 있을 때 SBOM target으로 재검토합니다."
      }
    ],
    learnerNextSteps: [
      "readiness가 partial인 scanner는 왜 partial인지 evidence를 먼저 읽으세요.",
      "이 report는 취약점 결과가 아닙니다. 실제 CVE, secret, misconfig 판단은 Trivy 같은 스캐너 실행이 필요합니다.",
      "safe study snapshot에서 제외된 secret-like paths는 원본 저장소에서 별도 스캔하세요.",
      "license와 SBOM report를 함께 보고 공개/배포 전 누락된 evidence를 보강하세요."
    ]
  };
}

async function buildAdvisoryReport(
  walk: WalkResult,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport,
  licenseRightsReport: LicenseRightsReport
): Promise<AdvisoryReport> {
  const packageQueryTargets = sbomReport.packageArtifacts.slice(0, 80).map((pkg): AdvisoryReport["packageQueryTargets"][number] => ({
    name: pkg.name,
    ecosystem: advisoryEcosystemForPackage(pkg.packageType, pkg.ecosystem),
    version: pkg.version,
    purl: pkg.purl,
    sourceType: "manifest",
    readiness: pkg.version ? "queryable" : "partial",
    evidence: pkg.version
      ? `${pkg.foundBy} declares ${pkg.name}@${pkg.version}; OSV-style matching can query by ecosystem, name, and version.`
      : `${pkg.foundBy} declares ${pkg.name}, but no resolved version was available for exact vulnerability matching.`,
    relatedHref: pkg.evidenceHref
  }));
  const lockfileArtifacts = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile");
  const lockfileSignals: AdvisoryReport["lockfileSignals"] = lockfileArtifacts.map((artifact) => {
    const packageCount = advisoryPackageCountForLockfile(artifact.filePath, sbomReport);
    return {
      filePath: artifact.filePath,
      ecosystem: advisoryEcosystemForLockfile(artifact.filePath),
      packageCount,
      readiness: packageCount > 0 ? "ready" : "partial",
      sourceHref: artifact.sourceHref
    };
  });
  const configFiles = walk.files.filter((file) => isOsvScannerConfigFile(file.relPath));
  const configTexts = await Promise.all(configFiles.map(async (file) => ({
    filePath: file.relPath,
    text: await readTextIfSafe(file.absPath, 120_000)
  })));
  const configText = configTexts.map((item) => item.text ?? "").join("\n");
  const hasIgnoredVulns = /\[\[IgnoredVulns\]\]|IgnoredVulns/i.test(configText);
  const hasPackageOverrides = /\[\[PackageOverrides\]\]|PackageOverrides/i.test(configText);
  const hasLicenseEvidence = licenseRightsReport.licenseFiles.length > 0 || licenseRightsReport.packageLicenseSignals.length > 0;
  const localDbFiles = walk.files.filter((file) => /(^|\/)(osv-scanner|osv-vulnerabilities|vulnerability-db)\/.+all\.zip$/i.test(file.relPath) || /(^|\/)all\.zip$/i.test(file.relPath) && /osv|vulnerab/i.test(file.relPath));
  const containerArtifacts = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "container");
  const versionedTargets = packageQueryTargets.filter((target) => target.readiness === "queryable");
  const partialTargets = packageQueryTargets.filter((target) => target.readiness === "partial");
  const vulnerabilityScanner = securityReadinessReport.scannerCoverage.find((scanner) => scanner.scanner === "vulnerability");
  const npmManifest = sbomReport.packageManifests.find((manifest) => advisoryEcosystemForLockfile(manifest.filePath) === "npm" || /javascript|node/i.test(manifest.ecosystem));
  const npmLockfile = lockfileSignals.find((signal) => signal.ecosystem === "npm");

  const advisorySources: AdvisoryReport["advisorySources"] = [
    {
      source: "OSV.dev",
      readiness: packageQueryTargets.length > 0 ? "external" : "missing",
      evidence: packageQueryTargets.length > 0 ? `${packageQueryTargets.length} package target(s) can be sent to OSV.dev; RepoTutor does not send package data.` : "No package targets were available for OSV.dev matching.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "deps.dev",
      readiness: packageQueryTargets.length > 0 ? "external" : "missing",
      evidence: packageQueryTargets.length > 0 ? "Dependency resolution and transitive graph enrichment require external deps.dev/OSV-Scanner execution." : "No package manifest was found for dependency graph enrichment.",
      relatedHref: "html/sbom.html"
    },
    {
      source: "GitHub-Advisory-Database",
      readiness: packageQueryTargets.some((target) => ["npm", "pypi", "Go", "Maven", "Packagist", "NuGet", "RubyGems"].includes(target.ecosystem)) ? "external" : "missing",
      evidence: "GitHub advisory data can corroborate ecosystem package results, but this static report does not call the GitHub API.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "RustSec",
      readiness: packageQueryTargets.some((target) => target.ecosystem === "crates.io") ? "external" : "missing",
      evidence: packageQueryTargets.some((target) => target.ecosystem === "crates.io") ? "Rust/Cargo package target(s) were found for RustSec-backed advisory matching." : "No Rust/Cargo package target was detected.",
      relatedHref: "html/sbom.html"
    },
    {
      source: "NVD",
      readiness: packageQueryTargets.length > 0 || containerArtifacts.length > 0 ? "external" : "missing",
      evidence: packageQueryTargets.length > 0 || containerArtifacts.length > 0 ? "NVD/CVE enrichment is an external scanner concern after package or OS evidence is available." : "No package or container artifact was found for CVE enrichment.",
      relatedHref: containerArtifacts[0]?.sourceHref ?? "html/advisories.html"
    },
    {
      source: "local-offline-db",
      readiness: localDbFiles.length > 0 ? "ready" : "missing",
      evidence: localDbFiles.length > 0 ? `Offline OSV database candidate(s): ${localDbFiles.map((file) => file.relPath).join(", ")}.` : "No local OSV offline database all.zip files were detected.",
      relatedHref: localDbFiles[0] ? `source/${encodedPath(localDbFiles[0].relPath)}` : "html/advisories.html"
    }
  ];

  const policyControls: AdvisoryReport["policyControls"] = [
    {
      control: "ignored-vulns",
      status: hasIgnoredVulns ? "ready" : configFiles.length > 0 ? "partial" : "missing",
      evidence: hasIgnoredVulns ? `IgnoredVulns policy found in ${configFiles.map((file) => file.relPath).join(", ")}.` : configFiles.length > 0 ? "OSV config exists, but no IgnoredVulns section was detected." : "No osv-scanner.toml policy file with IgnoredVulns was detected.",
      relatedHref: configFiles[0] ? `source/${encodedPath(configFiles[0].relPath)}` : "html/advisories.html"
    },
    {
      control: "package-overrides",
      status: hasPackageOverrides ? "ready" : configFiles.length > 0 ? "partial" : "missing",
      evidence: hasPackageOverrides ? `PackageOverrides policy found in ${configFiles.map((file) => file.relPath).join(", ")}.` : configFiles.length > 0 ? "OSV config exists, but no PackageOverrides section was detected." : "No PackageOverrides policy was detected.",
      relatedHref: configFiles[0] ? `source/${encodedPath(configFiles[0].relPath)}` : "html/advisories.html"
    },
    {
      control: "license-allowlist",
      status: hasLicenseEvidence ? "partial" : "missing",
      evidence: hasLicenseEvidence ? `${licenseRightsReport.licenseFiles.length} license file(s) and ${licenseRightsReport.packageLicenseSignals.length} package license signal(s) can seed an allowlist, but OSV-Scanner allowlist execution is external.` : "No license evidence was available for license allowlist planning.",
      relatedHref: "html/license-rights.html"
    },
    {
      control: "offline-db",
      status: localDbFiles.length > 0 ? "ready" : "missing",
      evidence: localDbFiles.length > 0 ? "A local OSV database artifact was detected for offline vulnerability matching." : "Offline mode needs a downloaded OSV database; none was found in the source snapshot.",
      relatedHref: localDbFiles[0] ? `source/${encodedPath(localDbFiles[0].relPath)}` : "html/advisories.html"
    },
    {
      control: "call-analysis",
      status: versionedTargets.length > 0 ? "external" : "missing",
      evidence: versionedTargets.length > 0 ? "OSV-Scanner may enrich some results with reachability/call analysis, but RepoTutor does not execute source analysis." : "No versioned package targets were available for call-analysis planning.",
      relatedHref: "html/security-readiness.html"
    },
    {
      control: "guided-remediation",
      status: npmManifest && npmLockfile ? "partial" : npmManifest ? "missing" : "external",
      evidence: npmManifest && npmLockfile ? `npm manifest ${npmManifest.filePath} and lockfile ${npmLockfile.filePath} are present; use OSV fix only in a trusted workspace.` : npmManifest ? "npm manifest exists, but guided remediation usually needs a matching lockfile." : "Guided remediation is ecosystem-specific and must be run outside RepoTutor.",
      relatedHref: npmLockfile?.sourceHref ?? npmManifest?.sourceHref ?? "html/advisories.html"
    }
  ];

  const resultModel: AdvisoryReport["resultModel"] = [
    {
      field: "results[].source.path/type",
      purpose: "각 취약점 결과가 어떤 lockfile, SBOM, git, artifact, OS image source에서 왔는지 추적합니다.",
      readiness: sbomReport.fileArtifacts.length > 0 ? "ready" : "partial",
      evidence: `${sbomReport.fileArtifacts.length} SBOM file artifact(s) can become OSV result source rows.`,
      relatedHref: "html/sbom.html"
    },
    {
      field: "packages[].package",
      purpose: "ecosystem, name, version, PURL을 advisory query key로 사용합니다.",
      readiness: packageQueryTargets.length > 0 ? "ready" : "partial",
      evidence: `${packageQueryTargets.length} package query target(s), ${versionedTargets.length} with exact version(s).`,
      relatedHref: "html/advisories.html"
    },
    {
      field: "packages[].vulnerabilities",
      purpose: "OSV IDs, aliases, severity, fixed versions를 scanner 결과로 채웁니다.",
      readiness: packageQueryTargets.length > 0 ? "external" : "partial",
      evidence: vulnerabilityScanner?.evidence ?? "Vulnerability matching requires an external advisory database query.",
      relatedHref: "html/security-readiness.html"
    },
    {
      field: "packages[].licenseViolations",
      purpose: "license allowlist 정책과 package license evidence를 대조합니다.",
      readiness: hasLicenseEvidence ? "partial" : "external",
      evidence: hasLicenseEvidence ? "License evidence exists, but allowlist policy execution is outside the static report." : "License violation fields require scanner policy execution.",
      relatedHref: "html/license-rights.html"
    },
    {
      field: "imageMetadata",
      purpose: "container layer, base image, distro/OS package advisory context를 담습니다.",
      readiness: containerArtifacts.length > 0 ? "partial" : "external",
      evidence: containerArtifacts.length > 0 ? `${containerArtifacts.length} container config artifact(s) were detected; built image metadata still requires scanner execution.` : "No container image metadata exists in this source-only snapshot.",
      relatedHref: containerArtifacts[0]?.sourceHref ?? "html/runtime-environment.html"
    }
  ];

  const remediationQueue: AdvisoryReport["remediationQueue"] = [];
  if (packageQueryTargets.length === 0) {
    remediationQueue.push({
      priority: "high",
      action: "Add or expose supported package manifests before advisory scanning.",
      why: "OSV-style matching needs ecosystem package coordinates.",
      relatedHref: "html/sbom.html"
    });
  }
  if (packageQueryTargets.length > 0 && lockfileSignals.length === 0) {
    remediationQueue.push({
      priority: "high",
      action: "Commit package lockfiles for deployable package ecosystems.",
      why: "Lockfiles improve exact version matching and reduce advisory ambiguity.",
      relatedHref: "html/sbom.html"
    });
  }
  if (partialTargets.length > 0) {
    remediationQueue.push({
      priority: "medium",
      action: "Resolve package targets that lack versions before relying on advisory results.",
      why: `${partialTargets.length} package target(s) only have name/ecosystem evidence.`,
      relatedHref: "html/advisories.html"
    });
  }
  if (!hasIgnoredVulns) {
    remediationQueue.push({
      priority: "medium",
      action: "Create an osv-scanner.toml policy for ignored vulnerabilities with reason and expiry.",
      why: "Accepted vulnerability risk should be explicit, time-bounded, and reviewable.",
      relatedHref: "html/advisories.html"
    });
  }
  if (localDbFiles.length === 0) {
    remediationQueue.push({
      priority: "low",
      action: "Download an OSV offline database when scans must run without sending package metadata.",
      why: "Offline mode avoids network disclosure but needs a fresh local database.",
      relatedHref: "html/advisories.html"
    });
  }
  remediationQueue.push({
    priority: "low",
    action: "Run real OSV-Scanner outside RepoTutor before making security release decisions.",
    why: "This report is query readiness metadata only and does not claim actual vulnerability presence or absence.",
    relatedHref: "html/advisories.html"
  });

  return {
    summary: `OSV-Scanner식 advisory query readiness report: package target ${packageQueryTargets.length}개, lockfile signal ${lockfileSignals.length}개, advisory source ${advisorySources.length}개, policy control ${policyControls.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OSV-Scanner package extraction vulnerability matching OSV.dev lockfile SBOM offline remediation ignore policy",
    packageQueryTargets,
    lockfileSignals,
    advisorySources,
    policyControls,
    resultModel,
    remediationQueue: remediationQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: "osv-scanner scan source -r <project> --format json",
        purpose: "source directory에서 package extraction과 advisory matching을 실행합니다."
      },
      {
        command: "osv-scanner scan -L <lockfile> --format json",
        purpose: "특정 lockfile을 기준으로 정확한 package version advisory 결과를 확인합니다."
      },
      {
        command: "osv-scanner --offline-vulnerabilities --download-offline-databases <project>",
        purpose: "offline DB를 미리 내려받아 이후 offline scan 준비를 합니다."
      },
      {
        command: "osv-scanner scan image <image>:<tag> --format html",
        purpose: "container image layer와 OS package advisory context를 HTML로 확인합니다."
      },
      {
        command: "osv-scanner fix -M package.json -L package-lock.json",
        purpose: "trusted workspace에서만 guided remediation을 검토합니다. package manager scripts가 실행될 수 있습니다."
      }
    ],
    learnerNextSteps: [
      "package query target 중 version이 없는 항목부터 lockfile 또는 resolved metadata로 보강하세요.",
      "IgnoredVulns와 PackageOverrides 정책은 reason과 expiry를 포함해 리뷰 가능하게 유지하세요.",
      "privacy가 중요한 프로젝트는 online scan 대신 offline database 준비 상태를 먼저 확인하세요.",
      "이 리포트는 OSV-Scanner 실행 결과가 아니라 정적 질의 준비도입니다. 실제 취약점 판단에는 OSV-Scanner를 별도 실행하세요."
    ]
  };
}

function buildVexReport(
  walk: WalkResult,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport,
  advisoryReport: AdvisoryReport,
  provenanceReport: ProvenanceReport,
  sourceSnapshotReport: SourceSnapshotReport
): VexReport {
  const productTargets = vexProductTargets(sbomReport, sourceSnapshotReport);
  const sarifFiles = walk.files.filter((file) => /\.sarif(?:\.json)?$/i.test(file.relPath) || /(^|\/)sarif-results\.json$/i.test(file.relPath));
  const vexTemplateFiles = walk.files.filter((file) => /(^|\/)\.openvex\/templates\//.test(file.relPath) || /(^|\/)openvex\.(json|ya?ml)$/i.test(file.relPath));
  const vulnerabilityScanner = securityReadinessReport.scannerCoverage.find((scanner) => scanner.scanner === "vulnerability");
  const vulnAttestation = provenanceReport.attestationSignals.find((signal) => signal.predicateType === "vuln");
  const signatureSignal = provenanceReport.signatureSignals.find((signal) => signal.material === "signature");
  const dsseSignal = provenanceReport.signatureSignals.find((signal) => signal.material === "bundle");
  const transparencySignal = provenanceReport.signatureSignals.find((signal) => signal.material === "transparency-log");
  const firstProduct = productTargets[0]?.productId ?? "<product-purl-or-uri>";
  const statementDrafts: VexReport["statementDrafts"] = productTargets.slice(0, 5).map((product) => ({
    vulnerabilityId: "pending-advisory-id",
    productIds: [product.productId],
    status: "under_investigation",
    justification: null,
    needsHumanReview: true,
    evidence: `${product.productId} has product identity evidence, but RepoTutor has not confirmed any specific vulnerability impact.`,
    relatedHref: product.relatedHref
  }));

  const vulnerabilityInputs: VexReport["vulnerabilityInputs"] = [
    {
      source: "advisory-query",
      readiness: advisoryReport.packageQueryTargets.length > 0 ? "ready" : "missing",
      evidence: advisoryReport.packageQueryTargets.length > 0 ? `${advisoryReport.packageQueryTargets.length} advisory query target(s) are available for later VEX statement matching.` : "No advisory query targets were available.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "security-readiness",
      readiness: vulnerabilityScanner?.readiness ?? "missing",
      evidence: vulnerabilityScanner?.evidence ?? "No vulnerability scanner readiness row was available.",
      relatedHref: vulnerabilityScanner?.relatedHref ?? "html/security-readiness.html"
    },
    {
      source: "scanner-sarif",
      readiness: sarifFiles.length > 0 ? "ready" : "missing",
      evidence: sarifFiles.length > 0 ? `SARIF result candidate(s): ${sarifFiles.map((file) => file.relPath).join(", ")}.` : "No SARIF scanner result file was detected; vexctl filter needs scanner results as input.",
      relatedHref: sarifFiles[0] ? `source/${encodedPath(sarifFiles[0].relPath)}` : "html/security-readiness.html"
    },
    {
      source: "manual-cve",
      readiness: "external",
      evidence: "Manual CVE/GHSA/RUSTSEC review must be supplied by a human or an external advisory source before producing final VEX statements.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "attestation",
      readiness: vulnAttestation?.readiness === "available" ? "ready" : vulnAttestation?.readiness === "partial" ? "partial" : "external",
      evidence: vulnAttestation?.evidence ?? "No vulnerability predicate attestation was detected; VEX can still be created as a new document and attested later.",
      relatedHref: vulnAttestation?.relatedHref ?? "html/provenance.html"
    }
  ];

  const statusMatrix: VexReport["statusMatrix"] = [
    {
      status: "affected",
      requiredEvidence: "Confirmed vulnerable code path plus an action statement, mitigation plan, or fixed-version target.",
      allowedFields: ["action_statement", "status_notes", "aliases", "subcomponents"],
      filtersScannerResult: false,
      readiness: productTargets.length > 0 ? "partial" : "external"
    },
    {
      status: "not_affected",
      requiredEvidence: "A specific OpenVEX justification and, when useful, an impact statement that explains why the product is not affected.",
      allowedFields: ["justification", "impact_statement", "status_notes", "aliases", "subcomponents"],
      filtersScannerResult: true,
      readiness: advisoryReport.packageQueryTargets.length > 0 ? "partial" : "external"
    },
    {
      status: "fixed",
      requiredEvidence: "Release, commit, package, or image digest evidence proving the vulnerability is fixed for the product.",
      allowedFields: ["status_notes", "aliases", "subcomponents"],
      filtersScannerResult: true,
      readiness: provenanceReport.artifactSignals.some((signal) => signal.readiness === "ready") ? "partial" : "external"
    },
    {
      status: "under_investigation",
      requiredEvidence: "An owner, timebox, product identity, and pending advisory identifier for triage.",
      allowedFields: ["status_notes", "aliases", "subcomponents"],
      filtersScannerResult: false,
      readiness: productTargets.length > 0 ? "ready" : "partial"
    }
  ];

  const justificationCatalog: VexReport["justificationCatalog"] = [
    {
      justification: "component_not_present",
      useWhen: "Scanner result names a dependency or component that is absent from the shipped product.",
      requiresImpactStatement: true,
      readiness: productTargets.length > 0 ? "partial" : "external"
    },
    {
      justification: "vulnerable_code_not_present",
      useWhen: "The package exists, but the vulnerable function, file, feature, or build option is not present.",
      requiresImpactStatement: true,
      readiness: "external"
    },
    {
      justification: "vulnerable_code_not_in_execute_path",
      useWhen: "The vulnerable code is present but cannot be reached by product execution paths.",
      requiresImpactStatement: true,
      readiness: "external"
    },
    {
      justification: "inline_mitigations_already_exist",
      useWhen: "The product includes controls that neutralize the vulnerable behavior.",
      requiresImpactStatement: true,
      readiness: "external"
    },
    {
      justification: "protected_by_compiler",
      useWhen: "Compiler or build hardening prevents exploitation for the shipped artifact.",
      requiresImpactStatement: true,
      readiness: "external"
    }
  ];

  const documentWorkflow: VexReport["documentWorkflow"] = [
    {
      step: "create",
      command: `vexctl create --product ${firstProduct} --vuln pending-advisory-id --status under_investigation`,
      purpose: "Start a new OpenVEX document with product identity and a pending vulnerability record.",
      readiness: productTargets.length > 0 ? "ready" : "partial"
    },
    {
      step: "add",
      command: `vexctl add --in-place main.openvex.json --product ${firstProduct} --vuln pending-advisory-id --status not_affected --justification vulnerable_code_not_in_execute_path`,
      purpose: "Add a reviewed not_affected statement only after evidence and justification are available.",
      readiness: "external"
    },
    {
      step: "merge",
      command: "vexctl merge investigation.openvex.json resolution.openvex.json",
      purpose: "Merge chronological VEX documents so investigation and resolution history stay reviewable.",
      readiness: statementDrafts.length > 0 ? "partial" : "external"
    },
    {
      step: "attest",
      command: "vexctl attest --attach --sign main.openvex.json <image>@sha256:<digest>",
      purpose: "Wrap VEX metadata in a signed in-toto/Sigstore attestation for a concrete subject digest.",
      readiness: provenanceReport.signatureSignals.some((signal) => signal.readiness === "present") ? "partial" : "external"
    },
    {
      step: "filter",
      command: "vexctl filter scan_results.sarif.json main.openvex.json",
      purpose: "Apply fixed or not_affected VEX statements to SARIF scanner output after human review.",
      readiness: sarifFiles.length > 0 && statementDrafts.length > 0 ? "partial" : "external"
    },
    {
      step: "generate",
      command: "vexctl generate --templates=\".openvex/templates/\" --product <product>",
      purpose: "Generate VEX from local golden templates when a repository has .openvex/templates.",
      readiness: vexTemplateFiles.length > 0 ? "ready" : "external"
    }
  ];

  const attestationReadiness: VexReport["attestationReadiness"] = [
    {
      requirement: "subject-digest",
      status: sourceSnapshotReport.totalFiles > 0 ? "ready" : "missing",
      evidence: sourceSnapshotReport.totalFiles > 0 ? `${sourceSnapshotReport.totalFiles} source file digest(s) are available; release/image subject digests still need external artifact evidence.` : "No source digest evidence is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      requirement: "dsse-envelope",
      status: dsseSignal?.readiness === "present" ? "ready" : "external",
      evidence: dsseSignal?.evidence ?? "No DSSE/Sigstore bundle was detected; vexctl attest can produce one in a signing environment.",
      relatedHref: dsseSignal?.relatedHref ?? "html/provenance.html"
    },
    {
      requirement: "signature",
      status: signatureSignal?.readiness === "present" ? "ready" : "external",
      evidence: signatureSignal?.evidence ?? "No detached signature was detected; signing is an external release step.",
      relatedHref: signatureSignal?.relatedHref ?? "html/provenance.html"
    },
    {
      requirement: "transparency-log",
      status: transparencySignal?.readiness === "present" ? "ready" : "external",
      evidence: transparencySignal?.evidence ?? "Transparency log proof usually comes from Sigstore/Rekor or a downloaded bundle.",
      relatedHref: transparencySignal?.relatedHref ?? "html/provenance.html"
    },
    {
      requirement: "product-match",
      status: productTargets.length > 0 ? "ready" : "missing",
      evidence: productTargets.length > 0 ? `${productTargets.length} product target(s) can be matched to VEX statements.` : "No product identity evidence is available for VEX statements.",
      relatedHref: productTargets[0]?.relatedHref ?? "html/sbom.html"
    }
  ];

  const riskQueue: VexReport["riskQueue"] = [];
  if (productTargets.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Add package, SBOM, source, or container product identity before producing VEX.",
      why: "OpenVEX statements must name affected products.",
      relatedHref: "html/sbom.html"
    });
  }
  if (advisoryReport.packageQueryTargets.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Run or prepare advisory matching before writing final VEX statuses.",
      why: "VEX statements need a concrete vulnerability identifier and impact analysis.",
      relatedHref: "html/advisories.html"
    });
  }
  if (sarifFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Export scanner results as SARIF before relying on vexctl filter workflows.",
      why: "vexctl filter applies reviewed VEX statements to SARIF results.",
      relatedHref: "html/security-readiness.html"
    });
  }
  if (vexTemplateFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Create .openvex/templates when VEX statements should be generated repeatedly.",
      why: "Template-backed generation keeps author, role, and document defaults consistent.",
      relatedHref: "html/vex.html"
    });
  }
  riskQueue.push({
    priority: "medium",
    action: "Require human evidence review before using not_affected or fixed statuses.",
    why: "VEX can suppress scanner findings; every suppressing status needs traceable impact evidence.",
    relatedHref: "html/vex.html"
  });
  riskQueue.push({
    priority: "low",
    action: "Run real vexctl in a trusted release workspace before attaching or signing VEX metadata.",
    why: "RepoTutor records readiness metadata only and does not create signed attestations.",
    relatedHref: "html/provenance.html"
  });

  return {
    summary: `OpenVEX impact readiness report: product target ${productTargets.length}개, vulnerability input ${vulnerabilityInputs.length}개, status rule ${statusMatrix.length}개, workflow ${documentWorkflow.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OpenVEX affected not_affected fixed under_investigation justification product subcomponent vulnerability statement attestation SARIF filter",
    productTargets,
    vulnerabilityInputs,
    statusMatrix,
    justificationCatalog,
    statementDrafts,
    documentWorkflow,
    attestationReadiness,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    learnerNextSteps: [
      "statementDrafts는 실제 취약점 판정이 아니라 pending triage 템플릿입니다.",
      "not_affected 또는 fixed 상태는 scanner 결과를 숨길 수 있으므로 impact evidence와 reviewer를 먼저 기록하세요.",
      "제품 식별자는 package PURL, container digest, source digest처럼 재현 가능한 값으로 고정하세요.",
      "SARIF 필터링과 attestation signing은 RepoTutor 밖의 신뢰된 release workspace에서 실행하세요."
    ]
  };
}

function vexProductTargets(sbomReport: SbomReport, sourceSnapshotReport: SourceSnapshotReport): VexReport["productTargets"] {
  const seen = new Set<string>();
  const targets: VexReport["productTargets"] = [];
  for (const pkg of sbomReport.packageArtifacts.slice(0, 80)) {
    const productId = pkg.purl ?? `pkg:${pkg.packageType}/${pkg.name}${pkg.version ? `@${pkg.version}` : ""}`;
    if (seen.has(productId)) continue;
    seen.add(productId);
    targets.push({
      productId,
      productType: "package",
      version: pkg.version,
      evidence: `${pkg.foundBy} records ${pkg.name}${pkg.version ? `@${pkg.version}` : ""} as a VEX product candidate.`,
      relatedHref: pkg.evidenceHref
    });
  }
  for (const artifact of sbomReport.fileArtifacts.filter((item) => item.artifactKind === "container").slice(0, 10)) {
    const productId = `container-config:${artifact.filePath}`;
    if (seen.has(productId)) continue;
    seen.add(productId);
    targets.push({
      productId,
      productType: "container",
      version: null,
      evidence: `${artifact.filePath} is a container configuration candidate; a real image digest is needed for release VEX.`,
      relatedHref: artifact.sourceHref
    });
  }
  if (sbomReport.packageArtifacts.length > 0 && !seen.has("analysis/sbom-report.json")) {
    seen.add("analysis/sbom-report.json");
    targets.push({
      productId: "analysis/sbom-report.json",
      productType: "sbom",
      version: sbomReport.sourceDescriptor.descriptorVersion,
      evidence: "RepoTutor static SBOM can be signed or referenced as product inventory evidence.",
      relatedHref: "html/sbom.html"
    });
  }
  const firstDigest = sourceSnapshotReport.files[0]?.sha256;
  if (firstDigest && !seen.has(`pkg:generic/source-snapshot@${firstDigest.slice(0, 16)}`)) {
    targets.push({
      productId: `pkg:generic/source-snapshot@${firstDigest.slice(0, 16)}`,
      productType: "source",
      version: firstDigest.slice(0, 16),
      evidence: `${sourceSnapshotReport.totalFiles} source file digest(s) are recorded for source-level product identity.`,
      relatedHref: "analysis/source-snapshot-report.json"
    });
  }
  return targets;
}

async function buildPolicyGateReport(
  walk: WalkResult,
  securityReadinessReport: SecurityReadinessReport
): Promise<PolicyGateReport> {
  const regoFiles = walk.files.filter((file) => file.relPath.endsWith(".rego"));
  const policyDocuments: PolicyGateReport["policyDocuments"] = [];
  for (const file of regoFiles.slice(0, 100)) {
    const text = await readTextIfSafe(file.absPath, 180_000);
    const packageName = text?.match(/^\s*package\s+([A-Za-z0-9_./-]+)/m)?.[1] ?? null;
    const ruleNames = text ? extractRegoRuleNames(text) : [];
    const testRuleCount = ruleNames.filter((name) => /^test_|^todo_test/.test(name)).length;
    const decisionRules = ruleNames.filter((name) => /^(allow|deny|violation|warn|warning|errors?|fail|pass|authz|allowed|main)$/i.test(name)).slice(0, 20);
    policyDocuments.push({
      filePath: file.relPath,
      packageName,
      ruleCount: ruleNames.length,
      testRuleCount,
      decisionRules,
      readiness: packageName && ruleNames.length > 0 ? "ready" : packageName || ruleNames.length > 0 ? "partial" : "missing",
      sourceHref: `source/${encodedPath(file.relPath)}`
    });
  }

  const inputDocuments = policyInputDocuments(walk);
  const schemaDocuments = inputDocuments.filter((doc) => doc.documentType === "schema");
  const testRuleTotal = policyDocuments.reduce((sum, doc) => sum + doc.testRuleCount, 0);
  const decisionDocs = policyDocuments.filter((doc) => doc.packageName && doc.decisionRules.length > 0);
  const gateQueries: PolicyGateReport["gateQueries"] = decisionDocs.flatMap((doc) => doc.decisionRules.slice(0, 4).map((rule) => ({
    query: `data.${doc.packageName}.${rule}`,
    purpose: /deny|violation|warn|fail|error/i.test(rule)
      ? "Use with --fail-defined when non-empty deny or violation output should fail CI."
      : "Use with --fail when an allow/pass decision must be defined and truthy.",
    readiness: "ready" as const,
    relatedHref: doc.sourceHref
  }))).slice(0, 24);
  if (gateQueries.length === 0 && policyDocuments.length > 0) {
    gateQueries.push({
      query: "data",
      purpose: "Inspect loaded policy/data documents before choosing a CI gate entrypoint.",
      readiness: "partial",
      relatedHref: policyDocuments[0].sourceHref
    });
  }

  const manifestFiles = walk.files.filter((file) => /(^|\/)\.manifest$|(^|\/)manifest\.ya?ml$|(^|\/)manifest\.json$/i.test(file.relPath));
  const signatureFiles = walk.files.filter((file) => /(^|\/)\.signatures\.json$|\.sig$|signature/i.test(file.relPath));
  const capabilitiesFiles = walk.files.filter((file) => /capabilities.*\.json$/i.test(file.relPath));
  const hasIacSignal = securityReadinessReport.securitySignals.some((signal) => signal.kind === "iac-config" || signal.kind === "container-config");

  const testCoverage: PolicyGateReport["testCoverage"] = [
    {
      target: "rego-policy-tests",
      status: testRuleTotal > 0 ? "covered" : policyDocuments.length > 0 ? "missing" : "missing",
      evidence: testRuleTotal > 0 ? `${testRuleTotal} Rego test/todo test rule(s) were detected.` : "No Rego test_ rules were detected.",
      relatedHref: policyDocuments.find((doc) => doc.testRuleCount > 0)?.sourceHref ?? "html/policy-gates.html"
    },
    {
      target: "compile-check",
      status: policyDocuments.length > 0 ? "partial" : "missing",
      evidence: policyDocuments.length > 0 ? `${policyDocuments.length} Rego policy file(s) can be handed to opa check --strict.` : "No Rego files were detected for opa check.",
      relatedHref: policyDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    },
    {
      target: "schema-validation",
      status: schemaDocuments.length > 0 ? "covered" : "missing",
      evidence: schemaDocuments.length > 0 ? `${schemaDocuments.length} schema document(s) can be supplied with --schema.` : "No schema files were detected for typed input/data validation.",
      relatedHref: schemaDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    },
    {
      target: "decision-fixtures",
      status: inputDocuments.length > 0 ? "partial" : "missing",
      evidence: inputDocuments.length > 0 ? `${inputDocuments.length} input/data/config document(s) can seed policy decision fixtures.` : "No input.json, data.json/yaml, IaC, or manifest fixture was detected.",
      relatedHref: inputDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    }
  ];

  const bundleReadiness: PolicyGateReport["bundleReadiness"] = [
    {
      requirement: "policy-files",
      status: policyDocuments.length > 0 ? "ready" : "missing",
      evidence: policyDocuments.length > 0 ? `${policyDocuments.length} Rego file(s) are available for opa build.` : "No Rego policy files were found.",
      relatedHref: policyDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    },
    {
      requirement: "data-files",
      status: inputDocuments.length > 0 ? "ready" : hasIacSignal ? "partial" : "missing",
      evidence: inputDocuments.length > 0 ? `${inputDocuments.length} data/input document(s) were detected.` : hasIacSignal ? "IaC/security signals exist, but no explicit OPA data fixture was detected." : "No data/input documents were detected.",
      relatedHref: inputDocuments[0]?.sourceHref ?? "html/security-readiness.html"
    },
    {
      requirement: "entrypoints",
      status: gateQueries.length > 0 && gateQueries[0].query !== "data" ? "ready" : policyDocuments.length > 0 ? "partial" : "missing",
      evidence: gateQueries.length > 0 ? `${gateQueries.length} gate query candidate(s) were inferred.` : "No decision rule entrypoint was detected.",
      relatedHref: gateQueries[0]?.relatedHref ?? "html/policy-gates.html"
    },
    {
      requirement: "manifest",
      status: manifestFiles.length > 0 ? "ready" : "missing",
      evidence: manifestFiles.length > 0 ? `Bundle manifest candidate(s): ${manifestFiles.map((file) => file.relPath).join(", ")}.` : "No OPA bundle .manifest or manifest.yaml/json file was detected.",
      relatedHref: manifestFiles[0] ? `source/${encodedPath(manifestFiles[0].relPath)}` : "html/policy-gates.html"
    },
    {
      requirement: "signature",
      status: signatureFiles.length > 0 ? "ready" : "external",
      evidence: signatureFiles.length > 0 ? `Signature material candidate(s): ${signatureFiles.map((file) => file.relPath).join(", ")}.` : "Bundle signing/verification is an external release step unless .signatures.json is committed.",
      relatedHref: signatureFiles[0] ? `source/${encodedPath(signatureFiles[0].relPath)}` : "html/provenance.html"
    },
    {
      requirement: "capabilities",
      status: capabilitiesFiles.length > 0 ? "ready" : "external",
      evidence: capabilitiesFiles.length > 0 ? `Capabilities file(s): ${capabilitiesFiles.map((file) => file.relPath).join(", ")}.` : "Capabilities constraints are external unless the repository pins an OPA capabilities JSON file.",
      relatedHref: capabilitiesFiles[0] ? `source/${encodedPath(capabilitiesFiles[0].relPath)}` : "html/policy-gates.html"
    }
  ];

  const decisionOutputs: PolicyGateReport["decisionOutputs"] = [
    {
      field: "result",
      purpose: "Contains the raw Rego query value returned by opa eval.",
      readiness: gateQueries.length > 0 ? "ready" : "partial",
      evidence: gateQueries.length > 0 ? "Gate query candidates are available for JSON result capture." : "A query entrypoint still needs to be selected.",
      relatedHref: "html/policy-gates.html"
    },
    {
      field: "errors",
      purpose: "Captures parse, compile, type, or runtime errors for CI failure handling.",
      readiness: policyDocuments.length > 0 ? "partial" : "external",
      evidence: policyDocuments.length > 0 ? "opa check --strict can produce structured errors before eval." : "No policy documents exist to check.",
      relatedHref: "html/policy-gates.html"
    },
    {
      field: "metrics/profile",
      purpose: "Records evaluation timing and hot expressions when policy performance matters.",
      readiness: policyDocuments.length > 0 ? "external" : "partial",
      evidence: "OPA exposes metrics/profile output, but RepoTutor does not execute policies.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      field: "coverage",
      purpose: "Shows which policy expressions were exercised by opa test.",
      readiness: testRuleTotal > 0 ? "external" : "partial",
      evidence: testRuleTotal > 0 ? "Test rules exist; run opa test --coverage for exact coverage." : "No test rules were detected for coverage.",
      relatedHref: "html/policy-gates.html"
    },
    {
      field: "explanation/trace",
      purpose: "Debugs why a policy decision passed, failed, or was undefined.",
      readiness: policyDocuments.length > 0 ? "external" : "partial",
      evidence: "OPA can emit explanation traces, but they require executing a chosen input/query pair.",
      relatedHref: "html/policy-gates.html"
    }
  ];

  const riskQueue: PolicyGateReport["riskQueue"] = [];
  if (policyDocuments.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Add Rego policy files before advertising policy-as-code gates.",
      why: "OPA gates need policy modules with packages and rules.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (policyDocuments.length > 0 && testRuleTotal === 0) {
    riskQueue.push({
      priority: "high",
      action: "Add Rego test_ rules and run opa test --fail-on-empty.",
      why: "Policy gates are risky without tests that prove allow/deny behavior.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (inputDocuments.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Commit sample input/data fixtures for each policy gate entrypoint.",
      why: "OPA decisions depend on structured input and data documents.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (schemaDocuments.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Add JSON Schema for important input/data documents.",
      why: "opa check/eval can use schemas to catch reference mistakes before runtime.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (manifestFiles.length === 0) {
    riskQueue.push({
      priority: "low",
      action: "Package release policy as an OPA bundle with manifest and entrypoints.",
      why: "Bundles make policy distribution, inspection, and signing repeatable.",
      relatedHref: "html/policy-gates.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real OPA commands in CI before enforcing deploy or release decisions.",
    why: "RepoTutor reports readiness only and does not evaluate policy decisions.",
    relatedHref: "html/policy-gates.html"
  });

  const primaryQuery = gateQueries.find((query) => query.query !== "data")?.query ?? "data.<package>.<rule>";

  return {
    summary: `OPA식 policy gate readiness report: policy document ${policyDocuments.length}개, input/data document ${inputDocuments.length}개, gate query ${gateQueries.length}개, bundle requirement ${bundleReadiness.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OPA Rego policy input data decision eval test bundle schema strict fail gate",
    policyDocuments,
    inputDocuments,
    gateQueries,
    testCoverage,
    bundleReadiness,
    decisionOutputs,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: "opa check --strict <policy-dir>",
        purpose: "Parse, compile, type-check, and strict-check Rego modules before policy evaluation."
      },
      {
        command: "opa test <policy-dir> --fail-on-empty --format=json",
        purpose: "Run Rego test_ rules and fail CI when no tests are discovered."
      },
      {
        command: `opa eval --data <policy-dir> --input input.json '${primaryQuery}' --format=json`,
        purpose: "Evaluate a selected policy decision against an input fixture and capture structured results."
      },
      {
        command: "opa build -b <policy-dir> -e <entrypoint> -o bundle.tar.gz",
        purpose: "Package policy/data into a distributable bundle with explicit entrypoints."
      },
      {
        command: "opa inspect bundle.tar.gz",
        purpose: "Inspect bundled packages, data roots, and manifest metadata before deployment."
      }
    ],
    learnerNextSteps: [
      "먼저 Rego package와 decision rule이 있는지 확인하고, CI gate query를 하나씩 명시하세요.",
      "deny/violation/warn 계열 rule은 non-empty result가 실패인지 명확히 정하세요.",
      "policy input fixture와 schema를 함께 두면 undefined decision과 reference typo를 줄일 수 있습니다.",
      "이 리포트는 OPA 실행 결과가 아닙니다. 실제 allow/deny 판단은 opa check/test/eval을 별도 실행하세요."
    ]
  };
}

function extractRegoRuleNames(text: string): string[] {
  const names = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(package|import|else|some|every|with|not)\b/.test(line)) continue;
    const match = line.match(/^\s*(?:default\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*(?:\[|\(|contains\b|:=|=|\{|if\b)/);
    if (!match) continue;
    names.add(match[1]);
  }
  return [...names].sort();
}

function policyInputDocuments(walk: WalkResult): PolicyGateReport["inputDocuments"] {
  const docs: PolicyGateReport["inputDocuments"] = [];
  const seen = new Set<string>();
  for (const file of walk.files) {
    const type = policyDocumentType(file.relPath);
    if (!type || seen.has(file.relPath)) continue;
    seen.add(file.relPath);
    docs.push({
      filePath: file.relPath,
      documentType: type,
      readiness: type === "unknown" ? "partial" : "ready",
      evidence: policyDocumentEvidence(file.relPath, type),
      sourceHref: `source/${encodedPath(file.relPath)}`
    });
  }
  return docs.slice(0, 80);
}

function policyDocumentType(filePath: string): PolicyGateReport["inputDocuments"][number]["documentType"] | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "input.json" || base === "input.yaml" || base === "input.yml") return "input";
  if (base === "data.json" || base === "data.yaml" || base === "data.yml") return "data";
  if (base.endsWith(".schema.json") || /(^|\/)schemas?\//i.test(filePath)) return "schema";
  if (isIacConfigFile(filePath)) return "iac";
  if (["package.json", "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "go.mod", "Cargo.toml", "pyproject.toml"].includes(path.basename(filePath))) return "manifest";
  if (/policy|gate|admission|terraform|kubernetes|deploy/i.test(filePath) && /\.(json|ya?ml|toml)$/i.test(filePath)) return "unknown";
  return null;
}

function policyDocumentEvidence(filePath: string, type: PolicyGateReport["inputDocuments"][number]["documentType"]): string {
  if (type === "input") return `${filePath} can be passed to opa eval with --input.`;
  if (type === "data") return `${filePath} can be loaded under data for policy evaluation.`;
  if (type === "schema") return `${filePath} can validate input/data references with --schema.`;
  if (type === "iac") return `${filePath} is an IaC/config candidate for policy-as-code gates.`;
  if (type === "manifest") return `${filePath} is a project/deployment manifest candidate for policy checks.`;
  return `${filePath} looks policy-related but needs a human to classify its role.`;
}

async function buildApiContractReport(walk: WalkResult): Promise<ApiContractReport> {
  const detected = await apiContractSchemaEvidence(walk);
  const schemaDocuments = detected.map((item) => item.document);
  const operationTargets = detected.flatMap((item) => item.operations).slice(0, 80);
  const primarySchema = schemaDocuments[0]?.filePath ?? "<schema>";
  const primarySchemaHref = schemaDocuments[0]?.sourceHref ?? "html/api-contracts.html";
  const hasSchema = schemaDocuments.length > 0;
  const hasOperation = operationTargets.length > 0 || schemaDocuments.some((doc) => doc.operationCount > 0);
  const hasExamples = detected.some((item) => item.hasExamples);
  const hasServers = detected.some((item) => item.hasServers);
  const hasAuth = detected.some((item) => item.hasAuth);
  const hasResponses = detected.some((item) => item.hasResponses);
  const hasHeaders = detected.some((item) => item.hasHeaders);
  const hasContentTypes = detected.some((item) => item.hasContentTypes);
  const hasLinks = detected.some((item) => item.hasLinks);
  const repoSignals = await apiContractRepoSignals(walk);

  const testPhases: ApiContractReport["testPhases"] = [
    {
      phase: "examples",
      readiness: hasExamples ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasExamples ? "Schema example/example(s) fields can seed Schemathesis examples phase." : hasSchema ? "Schema files exist, but no explicit examples were detected." : "No API schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "coverage",
      readiness: hasOperation ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasOperation ? `${operationTargets.length || schemaDocuments.reduce((sum, doc) => sum + doc.operationCount, 0)} operation target(s) can be exercised by the coverage phase.` : hasSchema ? "A schema exists, but no operation target could be counted." : "Coverage phase needs an OpenAPI or GraphQL schema.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "fuzzing",
      readiness: hasSchema ? "external" : "missing",
      evidence: hasSchema ? "Schemathesis can generate property-based inputs, but RepoTutor does not execute the API." : "No schema was detected for generated test cases.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "stateful",
      readiness: hasLinks ? "ready" : hasOperation ? "external" : hasSchema ? "partial" : "missing",
      evidence: hasLinks ? "Schema link/relationship signals exist for stateful workflows." : hasOperation ? "Operations exist; stateful execution still needs discoverable links or runtime responses." : hasSchema ? "Schema exists but operation links were not detected." : "Stateful workflows need schema operations.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "negative",
      readiness: hasSchema ? "external" : "missing",
      evidence: hasSchema ? "Negative cases require executing generated invalid inputs against a running target." : "No schema was detected for negative contract tests.",
      relatedHref: primarySchemaHref
    }
  ];

  const checkMatrix: ApiContractReport["checkMatrix"] = [
    {
      check: "not-a-server-error",
      readiness: hasSchema ? "external" : "missing",
      evidence: hasSchema ? "Schemathesis can flag 5xx responses once a target URL or app adapter is available." : "No schema target exists for server-error checks.",
      relatedHref: "html/api-contracts.html"
    },
    {
      check: "schema-conformance",
      readiness: hasResponses ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasResponses ? "Response schema/status definitions were detected." : hasSchema ? "Schema exists, but response definitions were not obvious in the static scan." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "status-code-conformance",
      readiness: hasResponses ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasResponses ? "Response status definitions can be checked against observed responses." : hasSchema ? "Status-code checking needs response definitions and a live target." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "content-type-conformance",
      readiness: hasContentTypes ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasContentTypes ? "Content/media type definitions were detected." : hasSchema ? "No explicit content/media type definitions were detected." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "response-headers",
      readiness: hasHeaders ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasHeaders ? "Response/header definitions were detected." : hasSchema ? "No response header contract was detected." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "auth-required",
      readiness: hasAuth ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasAuth ? "Security/auth scheme definitions or authorization hints were detected." : hasSchema ? "No explicit auth scheme was detected; protected APIs need configured headers or hooks." : "No schema was detected.",
      relatedHref: primarySchemaHref
    }
  ];

  const runtimeTargets: ApiContractReport["runtimeTargets"] = [
    {
      target: "base-url",
      readiness: hasServers ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasServers ? "OpenAPI server/base URL signal exists in the schema." : hasSchema ? "A static schema exists; provide --url or serve the schema from a running API." : "No schema or base URL was detected.",
      relatedHref: primarySchemaHref
    },
    {
      target: "asgi-wsgi",
      readiness: repoSignals.pythonAppFiles.length > 0 ? "partial" : "missing",
      evidence: repoSignals.pythonAppFiles.length > 0 ? `Python app adapter candidate(s): ${repoSignals.pythonAppFiles.slice(0, 6).join(", ")}.` : "No ASGI/WSGI framework signal was detected.",
      relatedHref: repoSignals.pythonAppFiles[0] ? `source/${encodedPath(repoSignals.pythonAppFiles[0])}` : "html/runtime-environment.html"
    },
    {
      target: "pytest",
      readiness: repoSignals.schemathesisMentions.length > 0 && repoSignals.testFiles.length > 0 ? "ready" : repoSignals.testFiles.length > 0 ? "partial" : "missing",
      evidence: repoSignals.testFiles.length > 0 ? `${repoSignals.testFiles.length} test file(s) exist; Schemathesis pytest integration ${repoSignals.schemathesisMentions.length > 0 ? "is mentioned" : "was not detected"}.` : "No pytest/test file signal was detected.",
      relatedHref: repoSignals.testFiles[0] ? `source/${encodedPath(repoSignals.testFiles[0])}` : "html/files.html"
    },
    {
      target: "ci-action",
      readiness: repoSignals.schemathesisWorkflowFiles.length > 0 ? "ready" : repoSignals.workflowFiles.length > 0 ? "partial" : "missing",
      evidence: repoSignals.schemathesisWorkflowFiles.length > 0 ? `Schemathesis CI workflow signal(s): ${repoSignals.schemathesisWorkflowFiles.join(", ")}.` : repoSignals.workflowFiles.length > 0 ? `${repoSignals.workflowFiles.length} workflow file(s) exist, but Schemathesis action/command was not detected.` : "No CI workflow was detected.",
      relatedHref: repoSignals.workflowFiles[0] ? `source/${encodedPath(repoSignals.workflowFiles[0])}` : "html/security-readiness.html"
    },
    {
      target: "mock-server",
      readiness: repoSignals.mockServerFiles.length > 0 ? "ready" : hasSchema ? "external" : "missing",
      evidence: repoSignals.mockServerFiles.length > 0 ? `Mock server signal(s): ${repoSignals.mockServerFiles.join(", ")}.` : hasSchema ? "A schema exists, but no Prism/WireMock/MSW-style mock server config was detected." : "No schema exists to back a mock server.",
      relatedHref: repoSignals.mockServerFiles[0] ? `source/${encodedPath(repoSignals.mockServerFiles[0])}` : "html/api-contracts.html"
    }
  ];

  const reportingOutputs: ApiContractReport["reportingOutputs"] = [
    {
      output: "junit-xml",
      readiness: repoSignals.junitMentions.length > 0 ? "ready" : repoSignals.workflowFiles.length > 0 ? "partial" : "external",
      evidence: repoSignals.junitMentions.length > 0 ? `JUnit report signal(s): ${repoSignals.junitMentions.join(", ")}.` : "Schemathesis can emit --report junit; no committed JUnit setup was detected.",
      relatedHref: repoSignals.junitMentions[0] ? `source/${encodedPath(repoSignals.junitMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "allure",
      readiness: repoSignals.allureMentions.length > 0 ? "ready" : "external",
      evidence: repoSignals.allureMentions.length > 0 ? `Allure signal(s): ${repoSignals.allureMentions.join(", ")}.` : "Allure output requires schemathesis[allure] and --report-allure-path.",
      relatedHref: repoSignals.allureMentions[0] ? `source/${encodedPath(repoSignals.allureMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "cassette",
      readiness: repoSignals.vcrMentions.length > 0 ? "ready" : hasSchema ? "external" : "external",
      evidence: repoSignals.vcrMentions.length > 0 ? `VCR/cassette signal(s): ${repoSignals.vcrMentions.join(", ")}.` : "Schemathesis can emit --report vcr with --report-vcr-path for replayable HTTP evidence.",
      relatedHref: repoSignals.vcrMentions[0] ? `source/${encodedPath(repoSignals.vcrMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "replay",
      readiness: repoSignals.replayMentions.length > 0 ? "ready" : "external",
      evidence: repoSignals.replayMentions.length > 0 ? `Replay signal(s): ${repoSignals.replayMentions.join(", ")}.` : "Replay/triage is external until failing cases or cassette/HAR output exists.",
      relatedHref: repoSignals.replayMentions[0] ? `source/${encodedPath(repoSignals.replayMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "curl-repro",
      readiness: hasSchema ? "external" : "external",
      evidence: hasSchema ? "Schemathesis reports curl reproduction commands for failures after a real run." : "Curl reproduction commands require an executed contract test.",
      relatedHref: "html/api-contracts.html"
    },
    {
      output: "coverage",
      readiness: repoSignals.coverageMentions.length > 0 ? "ready" : hasSchema ? "partial" : "external",
      evidence: repoSignals.coverageMentions.length > 0 ? `Coverage/TraceCov signal(s): ${repoSignals.coverageMentions.join(", ")}.` : hasSchema ? "Schemathesis coverage phase can target schema constraints; TraceCov setup was not detected." : "Coverage output requires schema execution.",
      relatedHref: repoSignals.coverageMentions[0] ? `source/${encodedPath(repoSignals.coverageMentions[0])}` : "html/api-contracts.html"
    }
  ];

  const riskQueue: ApiContractReport["riskQueue"] = [];
  if (!hasSchema) {
    riskQueue.push({
      priority: "high",
      action: "Add an OpenAPI, Swagger, GraphQL, Postman, or AsyncAPI contract before advertising contract tests.",
      why: "Schemathesis-style generated tests need a machine-readable API schema.",
      relatedHref: "html/api-contracts.html"
    });
  }
  if (hasSchema && !hasOperation) {
    riskQueue.push({
      priority: "high",
      action: "Define at least one operation target in the API schema.",
      why: "Contract testing cannot generate request cases without operations, paths, or GraphQL fields.",
      relatedHref: primarySchemaHref
    });
  }
  if (hasSchema && !hasServers && repoSignals.pythonAppFiles.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Declare a runnable target with --url, a served schema URL, or a pytest app adapter.",
      why: "Generated requests need a live base URL or in-process application target.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasSchema && repoSignals.schemathesisWorkflowFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Add Schemathesis to CI with JUnit or artifact upload before enforcing API contracts.",
      why: "Contract failures should be reproducible and visible in pull request checks.",
      relatedHref: "html/security-readiness.html"
    });
  }
  if (hasSchema && !hasExamples) {
    riskQueue.push({
      priority: "medium",
      action: "Add example/example(s) values for important request bodies and parameters.",
      why: "Examples improve deterministic coverage before fuzzing explores edge cases.",
      relatedHref: primarySchemaHref
    });
  }
  if (hasSchema && !hasAuth && /auth|login|token|session|user/i.test(schemaDocuments.map((doc) => doc.filePath).join(" "))) {
    riskQueue.push({
      priority: "medium",
      action: "Document authentication headers or hooks for protected API paths.",
      why: "Schemathesis needs configured credentials for endpoints that reject anonymous requests.",
      relatedHref: primarySchemaHref
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Schemathesis against the original API before treating this as a pass/fail contract result.",
    why: "RepoTutor only reports static readiness and never sends generated requests.",
    relatedHref: "html/api-contracts.html"
  });

  return {
    summary: `Schemathesis식 API contract readiness report: schema document ${schemaDocuments.length}개, operation target ${operationTargets.length}개, test phase ${testPhases.length}개, check ${checkMatrix.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Schemathesis OpenAPI GraphQL schema generated cases Hypothesis checks stateful workflows JUnit Allure contract testing",
    schemaDocuments,
    operationTargets,
    testPhases,
    checkMatrix,
    runtimeTargets,
    reportingOutputs,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: `schemathesis run ${primarySchema} --url <base-url>`,
        purpose: "Run generated API checks against a local or deployed target when the schema is stored in the repository."
      },
      {
        command: `schemathesis run ${primarySchema} --checks all --report junit --report-junit-path reports/schemathesis-junit.xml`,
        purpose: "Capture CI-readable JUnit XML while keeping all response checks enabled."
      },
      {
        command: `schemathesis run ${primarySchema} --report vcr --report-vcr-path reports/schemathesis-vcr.yaml`,
        purpose: "Record replayable HTTP cassette evidence for triage."
      },
      {
        command: `schemathesis run ${primarySchema} --report-allure-path allure-results`,
        purpose: "Write Allure result files for operation-level failure review."
      },
      {
        command: `SCHEMATHESIS_HOOKS=hooks schemathesis run ${primarySchema}`,
        purpose: "Enable custom hooks or TraceCov schema coverage instrumentation."
      },
      {
        command: `schemathesis run ${primarySchema} --phases=stateful`,
        purpose: "Focus on linked/stateful API workflows after links or producer responses are available."
      }
    ],
    learnerNextSteps: [
      "먼저 schema document와 operation target이 있는지 확인하고, missing이면 OpenAPI/GraphQL contract부터 추가하세요.",
      "base URL, app adapter, auth header 중 하나를 명시해야 generated request가 실제 API에 도달합니다.",
      "response schema, status code, content type, header check는 schema 정의와 실제 응답을 함께 봐야 합니다.",
      "이 리포트는 Schemathesis 실행 결과가 아닙니다. 실제 버그 판정은 원본 API에서 별도 실행하세요."
    ]
  };
}

type ApiContractDetectedSchema = {
  document: ApiContractReport["schemaDocuments"][number];
  operations: ApiContractReport["operationTargets"];
  hasExamples: boolean;
  hasServers: boolean;
  hasAuth: boolean;
  hasResponses: boolean;
  hasHeaders: boolean;
  hasContentTypes: boolean;
  hasLinks: boolean;
};

async function apiContractSchemaEvidence(walk: WalkResult): Promise<ApiContractDetectedSchema[]> {
  const detected: ApiContractDetectedSchema[] = [];
  const seen = new Set<string>();
  for (const file of walk.files) {
    const pathCandidate = apiContractCandidatePath(file.relPath);
    const canInspect = /\.(json|ya?ml|graphql|gql|toml|md)$/i.test(file.relPath);
    if (!pathCandidate && !canInspect) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!pathCandidate && !apiContractContentSignal(text ?? "")) continue;
    const schemaType = apiContractSchemaType(file.relPath, text ?? "");
    if (!schemaType || seen.has(file.relPath)) continue;
    seen.add(file.relPath);
    const operations = apiContractOperationsFor(file.relPath, text ?? "", schemaType);
    const operationCount = operations.length || apiContractOperationCount(text ?? "", schemaType);
    const version = apiContractVersion(text ?? "", schemaType);
    const evidence = apiContractDocumentEvidence(file.relPath, schemaType, operationCount, Boolean(text));
    const sourceHref = `source/${encodedPath(file.relPath)}`;
    detected.push({
      document: {
        filePath: file.relPath,
        schemaType,
        version,
        operationCount,
        readiness: operationCount > 0 ? "ready" : text ? "partial" : "missing",
        evidence,
        sourceHref
      },
      operations: operations.map((operation) => ({
        ...operation,
        source: file.relPath,
        readiness: operation.method || operation.path || operation.operationId ? "ready" as const : "partial" as const,
        relatedHref: sourceHref
      })),
      hasExamples: /\bexamples?\b\s*[:=]/i.test(text ?? ""),
      hasServers: /\bservers?\b\s*[:=]|https?:\/\/|localhost:\d+/i.test(text ?? ""),
      hasAuth: /\b(securitySchemes|securityDefinitions|authorization|bearerAuth|apiKey|oauth2|cookieAuth)\b/i.test(text ?? ""),
      hasResponses: /\bresponses?\b\s*[:=]|"responses"\s*:/i.test(text ?? ""),
      hasHeaders: /\bheaders?\b\s*[:=]|"headers"\s*:/i.test(text ?? ""),
      hasContentTypes: /\b(application\/json|text\/plain|multipart\/form-data|content)\b/i.test(text ?? ""),
      hasLinks: /\blinks?\b\s*[:=]|operationRef|operationId/i.test(text ?? "")
    });
  }
  return detected.slice(0, 60);
}

function apiContractCandidatePath(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return /(^|\/)(openapi|swagger|asyncapi)(\.|[-_])/i.test(filePath)
    || /(^|\/)(schema|schemas|api|contract|contracts|spec|specs)\//i.test(filePath)
    || /\.(graphql|gql)$/i.test(filePath)
    || base === "schemathesis.toml"
    || base.endsWith(".postman_collection.json");
}

function apiContractContentSignal(text: string): boolean {
  return /\b(openapi|swagger|asyncapi)\b\s*[:=]/i.test(text)
    || /"info"\s*:\s*\{[\s\S]{0,800}"title"\s*:/i.test(text)
    || /\b(type\s+(Query|Mutation|Subscription)|schema\s*\{)\b/i.test(text)
    || /"item"\s*:\s*\[[\s\S]{0,1200}"request"\s*:/i.test(text);
}

function apiContractSchemaType(filePath: string, text: string): ApiContractReport["schemaDocuments"][number]["schemaType"] | null {
  const lower = filePath.toLowerCase();
  if (/\.(graphql|gql)$/i.test(filePath) || /\btype\s+(Query|Mutation|Subscription)\b|schema\s*\{/i.test(text)) return "graphql";
  if (/postman_collection\.json$/i.test(filePath) || /"item"\s*:\s*\[[\s\S]{0,1200}"request"\s*:/i.test(text)) return "postman";
  if (/\basyncapi\b\s*[:=]|"asyncapi"\s*:/i.test(text) || /(^|\/)asyncapi[._-]/i.test(lower)) return "asyncapi";
  if (/\bswagger\b\s*[:=]|"swagger"\s*:/i.test(text) || /(^|\/)swagger[._-]/i.test(lower)) return "swagger";
  if (/\bopenapi\b\s*[:=]|"openapi"\s*:/i.test(text) || /(^|\/)openapi[._-]/i.test(lower)) return "openapi";
  if (apiContractCandidatePath(filePath)) return "unknown";
  return null;
}

function apiContractVersion(text: string, schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"]): string | null {
  const field = schemaType === "swagger" ? "swagger" : schemaType === "asyncapi" ? "asyncapi" : schemaType === "openapi" ? "openapi" : null;
  if (!field) return null;
  const match = text.match(new RegExp(`["']?${field}["']?\\s*[:=]\\s*["']?([^"',\\n\\r\\s]+)`, "i"));
  return match?.[1] ?? null;
}

function apiContractOperationsFor(
  filePath: string,
  text: string,
  schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"]
): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  if (!text) return [];
  if (schemaType === "openapi" || schemaType === "swagger") return openApiOperationTargets(text);
  if (schemaType === "graphql") return graphqlOperationTargets(text);
  if (schemaType === "postman") return postmanOperationTargets(text);
  if (schemaType === "asyncapi") {
    const channels = [...text.matchAll(/^\s{0,8}([A-Za-z0-9_./{}-]+)\s*:\s*$/gm)]
      .map((match) => match[1])
      .filter((value) => value.includes("/") || value.includes("{"))
      .slice(0, 40);
    return channels.map((channel) => ({
      operationId: null,
      method: null,
      path: channel,
      evidence: `${filePath} declares AsyncAPI channel ${channel}.`
    }));
  }
  return [];
}

function openApiOperationTargets(text: string): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  const methods = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
  const parsed = parseJsonObject(text);
  if (parsed && typeof parsed === "object" && "paths" in parsed) {
    const paths = (parsed as { paths?: unknown }).paths;
    if (paths && typeof paths === "object") {
      const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
      for (const [route, value] of Object.entries(paths as Record<string, unknown>)) {
        if (!value || typeof value !== "object") continue;
        for (const [method, operation] of Object.entries(value as Record<string, unknown>)) {
          if (!methods.has(method.toLowerCase())) continue;
          const operationId = operation && typeof operation === "object" && "operationId" in operation
            ? String((operation as { operationId?: unknown }).operationId ?? "") || null
            : null;
          rows.push({ operationId, method: method.toUpperCase(), path: route, evidence: `${method.toUpperCase()} ${route} is declared in the API schema.` });
        }
      }
      return rows.slice(0, 80);
    }
  }
  const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
  const lines = text.split(/\r?\n/);
  let currentPath: string | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const pathMatch = lines[index].match(/^\s{0,8}(['"]?\/[^:'"]+['"]?)\s*:\s*(?:#.*)?$/);
    if (pathMatch) currentPath = pathMatch[1].replace(/^['"]|['"]$/g, "");
    const methodMatch = lines[index].match(/^\s{2,12}(get|put|post|delete|options|head|patch|trace)\s*:\s*(?:#.*)?$/i);
    if (!methodMatch || !currentPath) continue;
    const lookahead = lines.slice(index, Math.min(index + 10, lines.length)).join("\n");
    const operationId = lookahead.match(/^\s*operationId\s*:\s*["']?([^"'\n\r#]+)/m)?.[1]?.trim() ?? null;
    rows.push({
      operationId,
      method: methodMatch[1].toUpperCase(),
      path: currentPath,
      evidence: `${methodMatch[1].toUpperCase()} ${currentPath} is declared in the API schema.`
    });
  }
  return rows.slice(0, 80);
}

function graphqlOperationTargets(text: string): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
  for (const match of text.matchAll(/type\s+(Query|Mutation|Subscription)\s*\{([\s\S]*?)\}/g)) {
    const group = match[1];
    const body = match[2];
    for (const field of body.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(|:)/gm)) {
      rows.push({
        operationId: `${group}.${field[1]}`,
        method: group.toUpperCase(),
        path: field[1],
        evidence: `GraphQL ${group}.${field[1]} field is declared.`
      });
    }
  }
  return rows.slice(0, 80);
}

function postmanOperationTargets(text: string): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
  const parsed = parseJsonObject(text);
  const visit = (value: unknown): void => {
    if (rows.length >= 80 || !value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (record.request && typeof record.request === "object") {
      const request = record.request as Record<string, unknown>;
      const method = typeof request.method === "string" ? request.method.toUpperCase() : null;
      const urlValue = request.url;
      const url = typeof urlValue === "string"
        ? urlValue
        : urlValue && typeof urlValue === "object" && "raw" in urlValue
          ? String((urlValue as { raw?: unknown }).raw ?? "")
          : null;
      rows.push({
        operationId: typeof record.name === "string" ? record.name : null,
        method,
        path: url,
        evidence: `${method ?? "REQUEST"} ${url ?? "Postman request"} is declared in the collection.`
      });
    }
    for (const child of Object.values(record)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === "object") visit(child);
    }
  };
  if (parsed) visit(parsed);
  return rows;
}

function apiContractOperationCount(text: string, schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"]): number {
  if (!text) return 0;
  if (schemaType === "openapi" || schemaType === "swagger") return openApiOperationTargets(text).length;
  if (schemaType === "graphql") return graphqlOperationTargets(text).length;
  if (schemaType === "postman") return postmanOperationTargets(text).length;
  if (schemaType === "asyncapi") return (text.match(/^\s{0,8}([A-Za-z0-9_./{}-]+)\s*:\s*$/gm) ?? []).length;
  return 0;
}

function apiContractDocumentEvidence(
  filePath: string,
  schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"],
  operationCount: number,
  readable: boolean
): string {
  if (!readable) return `${filePath} is a ${schemaType} path candidate but was too large or unsafe to inspect.`;
  if (operationCount > 0) return `${filePath} exposes ${operationCount} ${schemaType} operation target(s) for generated contract checks.`;
  return `${filePath} looks like a ${schemaType} contract document, but no operation target was counted.`;
}

type ApiContractRepoSignals = {
  workflowFiles: string[];
  schemathesisWorkflowFiles: string[];
  schemathesisMentions: string[];
  junitMentions: string[];
  allureMentions: string[];
  vcrMentions: string[];
  replayMentions: string[];
  coverageMentions: string[];
  pythonAppFiles: string[];
  testFiles: string[];
  mockServerFiles: string[];
};

async function apiContractRepoSignals(walk: WalkResult): Promise<ApiContractRepoSignals> {
  const workflowFiles = walk.files.filter((file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file.relPath)).map((file) => file.relPath);
  const testFiles = walk.files.filter((file) => /(^|\/)(__tests__|tests?|spec)\/|(\.test|\.spec)\.[cm]?[jt]sx?$|test_.*\.py$/i.test(file.relPath)).map((file) => file.relPath);
  const mockServerFiles = walk.files.filter((file) => /(^|\/)(mocks?|mock-server|wiremock|prism|msw)\b|prism\.ya?ml|wiremock\.json/i.test(file.relPath)).map((file) => file.relPath);
  const signals: ApiContractRepoSignals = {
    workflowFiles,
    schemathesisWorkflowFiles: [],
    schemathesisMentions: [],
    junitMentions: [],
    allureMentions: [],
    vcrMentions: [],
    replayMentions: [],
    coverageMentions: [],
    pythonAppFiles: [],
    testFiles,
    mockServerFiles
  };
  const candidates = walk.files.filter((file) => {
    if (!file.isTextCandidate) return false;
    if (/^\.github\/workflows\/.+\.ya?ml$/i.test(file.relPath)) return true;
    if (/(schemathesis|openapi|swagger|graphql|pytest|tox|nox|Dockerfile|docker-compose|package\.json|pyproject\.toml)/i.test(file.relPath)) return true;
    if (/\.(py|toml|json|ya?ml|md)$/i.test(file.relPath) && /(api|contract|test|spec|coverage|allure|junit|vcr|replay|mock)/i.test(file.relPath)) return true;
    return false;
  });
  for (const file of candidates.slice(0, 300)) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    if (/schemathesis|st\s+run|schemathesis\/action/i.test(text)) {
      signals.schemathesisMentions.push(file.relPath);
      if (/^\.github\/workflows\//i.test(file.relPath)) signals.schemathesisWorkflowFiles.push(file.relPath);
    }
    if (/junit|report-junit|--report\s+junit/i.test(text)) signals.junitMentions.push(file.relPath);
    if (/allure|report-allure/i.test(text)) signals.allureMentions.push(file.relPath);
    if (/\bvcr\b|cassette|report-vcr/i.test(text)) signals.vcrMentions.push(file.relPath);
    if (/replay|har|ndjson|curl\s+-X/i.test(text)) signals.replayMentions.push(file.relPath);
    if (/tracecov|schema-coverage|SCHEMATHESIS_COVERAGE|coverage/i.test(text)) signals.coverageMentions.push(file.relPath);
    if (/\.py$/i.test(file.relPath) && /\b(FastAPI|Flask|Django|Sanic|Starlette|ASGI|WSGI)\b/.test(text)) signals.pythonAppFiles.push(file.relPath);
  }
  return {
    workflowFiles: [...new Set(signals.workflowFiles)].slice(0, 40),
    schemathesisWorkflowFiles: [...new Set(signals.schemathesisWorkflowFiles)].slice(0, 40),
    schemathesisMentions: [...new Set(signals.schemathesisMentions)].slice(0, 40),
    junitMentions: [...new Set(signals.junitMentions)].slice(0, 40),
    allureMentions: [...new Set(signals.allureMentions)].slice(0, 40),
    vcrMentions: [...new Set(signals.vcrMentions)].slice(0, 40),
    replayMentions: [...new Set(signals.replayMentions)].slice(0, 40),
    coverageMentions: [...new Set(signals.coverageMentions)].slice(0, 40),
    pythonAppFiles: [...new Set(signals.pythonAppFiles)].slice(0, 40),
    testFiles: [...new Set(signals.testFiles)].slice(0, 80),
    mockServerFiles: [...new Set(signals.mockServerFiles)].slice(0, 40)
  };
}

function parseJsonObject(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function buildObservabilityReport(
  walk: WalkResult,
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): Promise<ObservabilityReport> {
  const sourceFiles = await observabilitySourceFiles(walk);
  const instrumentationSignals = sourceFiles
    .map((item) => observabilityInstrumentationSignal(item))
    .filter((item): item is ObservabilityReport["instrumentationSignals"][number] => Boolean(item))
    .slice(0, 80);
  const exporterTargets = observabilityExporterTargets(sourceFiles);
  const resourceAttributes = observabilityResourceAttributes(sourceFiles);
  const propagationContext = observabilityPropagationContext(sourceFiles);
  const diagnostics = observabilityDiagnostics(sourceFiles, runtimeEnvironmentReport);
  const hasInstrumentation = instrumentationSignals.length > 0;
  const hasExporter = exporterTargets.some((item) => item.target !== "none" && item.readiness !== "missing");
  const hasResourceName = resourceAttributes.some((item) => item.attribute === "service.name" && item.readiness === "ready");
  const hasShutdown = diagnostics.some((item) => item.check === "shutdown" && item.status === "ready");
  const hasCollectorEndpoint = diagnostics.some((item) => item.check === "collector-endpoint" && item.status === "ready");
  const signalPipelines: ObservabilityReport["signalPipelines"] = (["traces", "metrics", "logs"] as const).map((signal) => {
    const signalInstrumentation = instrumentationSignals.filter((item) => item.signal === signal || item.signal === "mixed");
    const signalExporters = exporterTargets.filter((item) => item.target !== "none" && (item.signal === signal || item.signal === "mixed"));
    const readiness = signalInstrumentation.length > 0 && signalExporters.length > 0
      ? "ready"
      : signalInstrumentation.length > 0 || signalExporters.length > 0
        ? "partial"
        : "missing";
    const relatedHref = signalInstrumentation[0]?.sourceHref ?? signalExporters[0]?.relatedHref ?? "html/observability.html";
    return {
      signal,
      readiness,
      evidence: readiness === "ready"
        ? `${signal} pipeline has instrumentation and exporter evidence.`
        : readiness === "partial"
          ? `${signal} pipeline has only one side of instrumentation/export evidence.`
          : `${signal} pipeline was not detected in static repository files.`,
      relatedHref
    };
  });

  const riskQueue: ObservabilityReport["riskQueue"] = [];
  if (!hasInstrumentation) {
    riskQueue.push({
      priority: "high",
      action: "Add OpenTelemetry SDK setup and at least one auto or manual instrumentation entrypoint.",
      why: "Traces, metrics, and logs cannot be collected until application code starts providers or instrumentation.",
      relatedHref: "html/observability.html"
    });
  }
  if (hasInstrumentation && !hasExporter) {
    riskQueue.push({
      priority: "high",
      action: "Configure an OTLP, Prometheus, console, Jaeger, Zipkin, or vendor exporter before relying on telemetry.",
      why: "Instrumented signals need a destination or they will remain local process data.",
      relatedHref: "html/observability.html"
    });
  }
  if (hasInstrumentation && !hasResourceName) {
    riskQueue.push({
      priority: "medium",
      action: "Set service.name with resourceFromAttributes, OTEL_SERVICE_NAME, or OTEL_RESOURCE_ATTRIBUTES.",
      why: "Backends group telemetry by resource attributes; missing service.name makes traces and metrics hard to read.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasInstrumentation && !hasCollectorEndpoint) {
    riskQueue.push({
      priority: "medium",
      action: "Document collector endpoint variables such as OTEL_EXPORTER_OTLP_ENDPOINT for local and CI runs.",
      why: "A repeatable endpoint makes telemetry smoke tests deterministic.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasInstrumentation && !hasShutdown) {
    riskQueue.push({
      priority: "medium",
      action: "Flush or shutdown SDK providers on process exit.",
      why: "Short-lived CLIs and tests can lose spans or metrics without explicit provider shutdown.",
      relatedHref: "html/observability.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original app with a collector before treating this report as an observability pass.",
    why: "RepoTutor only performs static readiness analysis and does not receive spans, metrics, or logs.",
    relatedHref: "html/observability.html"
  });

  return {
    summary: `OpenTelemetry식 observability readiness report: signal pipeline ${signalPipelines.length}개, instrumentation signal ${instrumentationSignals.length}개, exporter target ${exporterTargets.length}개, diagnostic ${diagnostics.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OpenTelemetry traces metrics logs resource context propagation exporter instrumentation semantic conventions diagnostics",
    signalPipelines,
    instrumentationSignals,
    exporterTargets,
    resourceAttributes,
    propagationContext,
    diagnostics,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: "OTEL_SERVICE_NAME=<service> OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 node -r ./tracing.js app.js",
        purpose: "Start a Node app with a preload tracing setup and an OTLP collector endpoint."
      },
      {
        command: "curl -s http://localhost:9464/metrics",
        purpose: "Check a Prometheus exporter endpoint after metrics are enabled."
      },
      {
        command: "OTEL_LOG_LEVEL=debug node -r ./tracing.js app.js",
        purpose: "Turn on OpenTelemetry diagnostics while debugging instrumentation setup."
      },
      {
        command: "docker run --rm -p 4317:4317 -p 4318:4318 otel/opentelemetry-collector-contrib:latest",
        purpose: "Run a local collector target for OTLP smoke tests."
      },
      {
        command: "npm ls @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node",
        purpose: "Confirm the Node OpenTelemetry API, SDK, and auto-instrumentation packages are installed together."
      }
    ],
    learnerNextSteps: [
      "먼저 traces, metrics, logs 중 어떤 signal pipeline이 필요한지 정하고 instrumentation entrypoint를 찾으세요.",
      "instrumentation만 있고 exporter가 없으면 telemetry가 backend로 나가지 않습니다.",
      "service.name, deployment.environment, service.version 같은 resource attribute를 먼저 고정하세요.",
      "이 리포트는 OpenTelemetry 실행 결과가 아닙니다. 실제 spans, metrics, logs는 원본 앱과 collector에서 별도 확인하세요."
    ]
  };
}

type ObservabilitySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function observabilitySourceFiles(walk: WalkResult): Promise<ObservabilitySourceFile[]> {
  const files: ObservabilitySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !observabilityInspectablePath(file.relPath)) continue;
    const pathCandidate = observabilityPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !observabilityContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 120) break;
  }
  return files;
}

function observabilityInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(Dockerfile|docker-compose\.ya?ml|package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|requirements.*\.txt|pyproject\.toml|go\.mod|Cargo\.toml)$/i.test(base)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|toml|md|py|go|rs|java|kt|cs|rb|php|sh|env|conf|ini)$/i.test(filePath);
}

function observabilityPathSignal(filePath: string): boolean {
  return /(opentelemetry|otel|observability|telemetry|tracing|trace|metrics?|prometheus|jaeger|zipkin|grafana|tempo|sentry|datadog|newrelic|honeycomb|logger|logging|instrument)/i.test(filePath);
}

function observabilityContentSignal(text: string): boolean {
  return /(@opentelemetry|opentelemetry|OpenTelemetry|OTEL_|NodeSDK|TracerProvider|MeterProvider|LoggerProvider|getNodeAutoInstrumentations|getTracer|startSpan|createCounter|createHistogram|PrometheusExporter|OTLP|ConsoleSpanExporter|JaegerExporter|ZipkinExporter|resourceFromAttributes|ATTR_SERVICE_NAME|W3CTraceContextPropagator|W3CBaggagePropagator|B3Propagator|AsyncHooksContextManager|ZoneContextManager|diag\.setLogger|DiagConsoleLogger)/i.test(text);
}

function observabilityInstrumentationSignal(source: ObservabilitySourceFile): ObservabilityReport["instrumentationSignals"][number] | null {
  const { filePath, text, sourceHref } = source;
  if (!/(@opentelemetry|opentelemetry|NodeSDK|TracerProvider|MeterProvider|LoggerProvider|getNodeAutoInstrumentations|getTracer|startSpan|metrics\.getMeter|createCounter|createHistogram|getLogger|instrumentation)/i.test(text)) return null;
  const signal = observabilitySignalForText(text);
  const kind = observabilityInstrumentationKind(filePath, text);
  return {
    filePath,
    kind,
    signal,
    evidence: observabilityInstrumentationEvidence(kind, signal, filePath, text),
    sourceHref
  };
}

function observabilitySignalForText(text: string): ObservabilityReport["instrumentationSignals"][number]["signal"] {
  const hasTrace = /\b(trace|tracer|span|TracerProvider|startSpan|getTracer|NodeTracerProvider|traceparent)\b/i.test(text);
  const hasMetrics = /\b(metric|meter|counter|histogram|MeterProvider|PrometheusExporter|metrics\.getMeter|createCounter|createHistogram)\b/i.test(text);
  const hasLogs = /\b(logs?|logger|LoggerProvider|getLogger|diag\.setLogger|DiagConsoleLogger)\b/i.test(text);
  const count = [hasTrace, hasMetrics, hasLogs].filter(Boolean).length;
  if (count > 1) return "mixed";
  if (hasMetrics) return "metrics";
  if (hasLogs) return "logs";
  return "traces";
}

function observabilityInstrumentationKind(filePath: string, text: string): ObservabilityReport["instrumentationSignals"][number]["kind"] {
  if (/getNodeAutoInstrumentations|auto-instrumentations|autoInstrumentations/i.test(text)) return "auto";
  if (/express|fastify|koa|hapi|middleware|interceptor|filter/i.test(text)) return "middleware";
  if (/browser|web|fetch|XMLHttpRequest|document\.|window\./i.test(filePath) || /browser|fetch|XMLHttpRequest|document\.|window\./i.test(text)) return "browser";
  if (/node|http|https|grpc|server|listen\(|Fastify|Express/i.test(filePath) || /node|http|https|grpc|server|listen\(|Fastify|Express/i.test(text)) return "server";
  if (/getTracer|startSpan|metrics\.getMeter|createCounter|createHistogram|getLogger|new\s+(NodeSDK|MeterProvider|TracerProvider|LoggerProvider)/i.test(text)) return "manual";
  return "unknown";
}

function observabilityInstrumentationEvidence(
  kind: ObservabilityReport["instrumentationSignals"][number]["kind"],
  signal: ObservabilityReport["instrumentationSignals"][number]["signal"],
  filePath: string,
  text: string
): string {
  if (/getNodeAutoInstrumentations|auto-instrumentations/i.test(text)) return `${filePath} configures OpenTelemetry auto-instrumentation for ${signal}.`;
  if (/NodeSDK|TracerProvider|MeterProvider|LoggerProvider/i.test(text)) return `${filePath} starts an OpenTelemetry SDK/provider for ${signal}.`;
  if (/getTracer|startSpan/i.test(text)) return `${filePath} creates manual trace spans.`;
  if (/metrics\.getMeter|createCounter|createHistogram/i.test(text)) return `${filePath} creates manual metric instruments.`;
  if (/getLogger|LoggerProvider|diag\.setLogger/i.test(text)) return `${filePath} contains logging or diagnostic telemetry setup.`;
  return `${filePath} has ${kind} observability instrumentation evidence for ${signal}.`;
}

function observabilityExporterTargets(sourceFiles: ObservabilitySourceFile[]): ObservabilityReport["exporterTargets"] {
  const specs: Array<{
    target: Exclude<ObservabilityReport["exporterTargets"][number]["target"], "none">;
    signal: ObservabilityReport["exporterTargets"][number]["signal"];
    pattern: RegExp;
    evidence: (filePath: string) => string;
  }> = [
    { target: "otlp", signal: "mixed", pattern: /OTLP|otlp|OTEL_EXPORTER_OTLP|collector|4317|4318/i, evidence: (filePath) => `${filePath} references OTLP or collector endpoint configuration.` },
    { target: "console", signal: "mixed", pattern: /ConsoleSpanExporter|ConsoleMetricExporter|ConsoleLogRecordExporter|console exporter/i, evidence: (filePath) => `${filePath} references a console exporter for local telemetry inspection.` },
    { target: "prometheus", signal: "metrics", pattern: /PrometheusExporter|prom-client|\/metrics\b|9464/i, evidence: (filePath) => `${filePath} references Prometheus metrics export.` },
    { target: "jaeger", signal: "traces", pattern: /JaegerExporter|jaeger/i, evidence: (filePath) => `${filePath} references Jaeger trace export.` },
    { target: "zipkin", signal: "traces", pattern: /ZipkinExporter|zipkin/i, evidence: (filePath) => `${filePath} references Zipkin trace export.` },
    { target: "vendor", signal: "mixed", pattern: /sentry|datadog|honeycomb|dynatrace|newrelic|grafana|tempo|splunk|lightstep/i, evidence: (filePath) => `${filePath} references a vendor observability backend.` }
  ];
  const targets: ObservabilityReport["exporterTargets"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((item) => spec.pattern.test(item.text) || spec.pattern.test(item.filePath));
    if (!match) continue;
    targets.push({
      target: spec.target,
      signal: spec.signal,
      readiness: "ready",
      evidence: spec.evidence(match.filePath),
      relatedHref: match.sourceHref
    });
  }
  if (targets.length === 0) {
    targets.push({
      target: "none",
      signal: "mixed",
      readiness: "missing",
      evidence: "No OTLP, Prometheus, console, Jaeger, Zipkin, or vendor exporter signal was detected.",
      relatedHref: "html/observability.html"
    });
  }
  return targets;
}

function observabilityResourceAttributes(sourceFiles: ObservabilitySourceFile[]): ObservabilityReport["resourceAttributes"] {
  const specs = [
    { attribute: "service.name", pattern: /ATTR_SERVICE_NAME|service\.name|OTEL_SERVICE_NAME|serviceName/i },
    { attribute: "service.version", pattern: /service\.version|ATTR_SERVICE_VERSION|OTEL_SERVICE_VERSION|npm_package_version/i },
    { attribute: "deployment.environment", pattern: /deployment\.environment|DEPLOYMENT_ENVIRONMENT|OTEL_RESOURCE_ATTRIBUTES|NODE_ENV/i },
    { attribute: "resource", pattern: /resourceFromAttributes|new\s+Resource|Resource\.default|resources?/i }
  ];
  const rows: ObservabilityReport["resourceAttributes"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((item) => spec.pattern.test(item.text));
    if (!match) continue;
    rows.push({
      attribute: spec.attribute,
      source: match.filePath,
      readiness: spec.attribute === "resource" ? "partial" : "ready",
      evidence: `${match.filePath} contains ${spec.attribute} resource attribute evidence.`,
      relatedHref: match.sourceHref
    });
  }
  return rows.slice(0, 30);
}

function observabilityPropagationContext(sourceFiles: ObservabilitySourceFile[]): ObservabilityReport["propagationContext"] {
  const specs: Array<{
    mechanism: ObservabilityReport["propagationContext"][number]["mechanism"];
    pattern: RegExp;
    externalEvidence: string;
  }> = [
    { mechanism: "trace-context", pattern: /W3CTraceContextPropagator|traceparent|trace-context/i, externalEvidence: "W3C trace context is the default OpenTelemetry propagation baseline for most SDKs." },
    { mechanism: "baggage", pattern: /W3CBaggagePropagator|\bbaggage\b/i, externalEvidence: "Baggage propagation is external until explicitly configured or verified in requests." },
    { mechanism: "b3", pattern: /B3Propagator|\bb3\b/i, externalEvidence: "B3 propagation is external unless Zipkin/B3 compatibility is configured." },
    { mechanism: "async-context", pattern: /AsyncLocalStorage|AsyncHooksContextManager|context-async-hooks/i, externalEvidence: "Node async context propagation depends on the runtime context manager." },
    { mechanism: "zone-context", pattern: /ZoneContextManager|context-zone|zone\.js/i, externalEvidence: "Browser zone context propagation depends on zone.js or a web context manager." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((item) => spec.pattern.test(item.text) || spec.pattern.test(item.filePath));
    return {
      mechanism: spec.mechanism,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} contains ${spec.mechanism} propagation evidence.` : spec.externalEvidence,
      relatedHref: match?.sourceHref ?? "html/observability.html"
    };
  });
}

function observabilityDiagnostics(
  sourceFiles: ObservabilitySourceFile[],
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): ObservabilityReport["diagnostics"] {
  const runtimeSignalCount = runtimeEnvironmentReport.detectedManifests.length
    + runtimeEnvironmentReport.setupSignals.length
    + runtimeEnvironmentReport.containerSignals.length;
  const checks: Array<{
    check: ObservabilityReport["diagnostics"][number]["check"];
    pattern: RegExp | null;
    readyEvidence: (filePath: string) => string;
    missingEvidence: string;
  }> = [
    { check: "diag-logger", pattern: /diag\.setLogger|DiagConsoleLogger|DiagLogLevel|OTEL_LOG_LEVEL/i, readyEvidence: (filePath) => `${filePath} configures OpenTelemetry diagnostics logging.`, missingEvidence: "No OpenTelemetry diagnostic logger or OTEL_LOG_LEVEL setup was detected." },
    { check: "collector-endpoint", pattern: /OTEL_EXPORTER_OTLP_ENDPOINT|collector|4317|4318|OTLP/i, readyEvidence: (filePath) => `${filePath} documents an OTLP collector endpoint.`, missingEvidence: "No collector endpoint or OTLP environment variable was detected." },
    { check: "shutdown", pattern: /sdk\.shutdown|provider\.shutdown|shutdown\(\)|process\.on\(['"]SIG(INT|TERM)['"]/i, readyEvidence: (filePath) => `${filePath} flushes or shuts down telemetry providers.`, missingEvidence: "No SDK/provider shutdown path was detected." },
    { check: "sampling", pattern: /Sampler|sampling|OTEL_TRACES_SAMPLER|TraceIdRatioBasedSampler|ParentBasedSampler/i, readyEvidence: (filePath) => `${filePath} contains trace sampling configuration.`, missingEvidence: "No trace sampler policy was detected." },
    { check: "attribute-limits", pattern: /attributeCountLimit|attributeValueLengthLimit|spanLimits|metricReader|OTEL_ATTRIBUTE/i, readyEvidence: (filePath) => `${filePath} references attribute limits or metric reader controls.`, missingEvidence: "No attribute limit or reader control was detected." },
    { check: "runtime-support", pattern: null, readyEvidence: () => "Runtime manifests and setup/container signals exist for telemetry smoke tests.", missingEvidence: "Runtime manifest/setup/container evidence is sparse." }
  ];
  return checks.map((item) => {
    if (item.check === "runtime-support") {
      return {
        check: item.check,
        status: runtimeSignalCount >= 2 ? "ready" : runtimeSignalCount === 1 ? "partial" : "missing",
        evidence: runtimeSignalCount >= 2 ? item.readyEvidence("runtime-environment-report") : item.missingEvidence,
        relatedHref: "html/runtime-environment.html"
      };
    }
    const match = item.pattern ? sourceFiles.find((source) => item.pattern?.test(source.text) || item.pattern?.test(source.filePath)) : null;
    return {
      check: item.check,
      status: match ? "ready" : sourceFiles.length > 0 ? "partial" : "missing",
      evidence: match ? item.readyEvidence(match.filePath) : item.missingEvidence,
      relatedHref: match?.sourceHref ?? "html/observability.html"
    };
  });
}

async function buildPerformanceReport(
  walk: WalkResult,
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): Promise<PerformanceReport> {
  const sourceFiles = await performanceSourceFiles(walk);
  const scriptTargets = performanceScriptTargets(sourceFiles);
  const workloadModels = performanceWorkloadModels(sourceFiles);
  const thresholds = performanceThresholds(sourceFiles);
  const checks = performanceChecks(sourceFiles);
  const metrics = performanceMetrics(sourceFiles);
  const outputs = performanceOutputs(sourceFiles);
  const runtimeControls = performanceRuntimeControls(sourceFiles, runtimeEnvironmentReport);
  const hasScript = scriptTargets.some((item) => item.readiness === "ready");
  const hasWorkload = workloadModels.some((item) => item.readiness === "ready");
  const hasThreshold = thresholds.length > 0;
  const hasCheck = checks.length > 0;
  const hasOutput = outputs.some((item) => item.target !== "none" && item.readiness !== "missing");

  const riskQueue: PerformanceReport["riskQueue"] = [];
  if (!hasScript) {
    riskQueue.push({
      priority: "high",
      action: "Add a k6 script or package script before claiming load-test coverage.",
      why: "k6-style performance testing needs a runnable JavaScript scenario or documented CLI target.",
      relatedHref: "html/performance.html"
    });
  }
  if (hasScript && !hasWorkload) {
    riskQueue.push({
      priority: "high",
      action: "Define stages or scenarios with an explicit executor and traffic model.",
      why: "A load test without a workload model cannot explain VUs, arrival rate, duration, or iteration shape.",
      relatedHref: "html/performance.html"
    });
  }
  if (hasScript && !hasThreshold) {
    riskQueue.push({
      priority: "medium",
      action: "Add thresholds for latency, error rate, and key custom metrics.",
      why: "Thresholds turn performance runs into pass/fail SLO checks instead of screenshots.",
      relatedHref: "html/performance.html"
    });
  }
  if (hasScript && !hasCheck) {
    riskQueue.push({
      priority: "medium",
      action: "Add checks for expected status codes or response invariants.",
      why: "A fast endpoint can still be functionally wrong under load.",
      relatedHref: "html/api-contracts.html"
    });
  }
  if (hasScript && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Configure summary, JSON, cloud, Prometheus, InfluxDB, StatsD, or OpenTelemetry output.",
      why: "Performance evidence needs a retained result artifact or metrics backend.",
      relatedHref: "html/performance.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run k6 against the original service before treating this report as a performance result.",
    why: "RepoTutor only performs static readiness analysis and does not generate load.",
    relatedHref: "html/performance.html"
  });

  return {
    summary: `k6식 performance readiness report: script target ${scriptTargets.length}개, workload model ${workloadModels.length}개, threshold ${thresholds.length}개, runtime control ${runtimeControls.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "k6 load testing scripts scenarios executors thresholds checks metrics outputs summaries cloud performance SLO",
    scriptTargets,
    workloadModels,
    thresholds,
    checks,
    metrics,
    outputs,
    runtimeControls,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "k6 run performance/load-test.js", purpose: "Run a committed k6 script locally and inspect the terminal summary." },
      { command: "k6 run --vus 10 --duration 30s performance/load-test.js", purpose: "Override VU and duration controls for a quick smoke load run." },
      { command: "k6 run --summary-export reports/k6-summary.json performance/load-test.js", purpose: "Persist a JSON summary artifact for CI review." },
      { command: "K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write k6 run -o experimental-prometheus-rw performance/load-test.js", purpose: "Stream metrics to Prometheus remote write when a backend is available." },
      { command: "k6 cloud run performance/load-test.js", purpose: "Run a Grafana Cloud k6 test after credentials and stack settings are configured." }
    ],
    learnerNextSteps: [
      "먼저 runnable k6 script나 package script가 있는지 확인하세요.",
      "stages/scenarios/executor가 없으면 부하 모델을 설명할 수 없습니다.",
      "thresholds와 checks를 함께 두어 latency SLO와 기능적 정상성을 동시에 확인하세요.",
      "이 리포트는 k6 실행 결과가 아닙니다. 실제 성능 판단은 원본 서비스에서 별도 실행하세요."
    ]
  };
}

type PerformanceSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function performanceSourceFiles(walk: WalkResult): Promise<PerformanceSourceFile[]> {
  const files: PerformanceSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !performanceInspectablePath(file.relPath)) continue;
    const pathCandidate = performancePathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !performanceContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 120) break;
  }
  return files;
}

function performanceInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|docker-compose\.ya?ml|Dockerfile)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|sh)$/i.test(filePath);
}

function performancePathSignal(filePath: string): boolean {
  return /(k6|load[-_ ]?test|performance|perf|benchmark|stress|soak|spike|threshold|scenario|grafana|prometheus|influx|statsd)/i.test(filePath);
}

function performanceContentSignal(text: string): boolean {
  return /\b(k6 run|from ["']k6|k6\/http|export const options|thresholds|scenarios|stages|vus|duration|executor|check\(|Trend|Counter|Rate|Gauge|handleSummary|summary-export|experimental-prometheus-rw|K6_|http_req_duration)\b/i.test(text);
}

function performanceScriptTargets(sourceFiles: PerformanceSourceFile[]): PerformanceReport["scriptTargets"] {
  const rows: PerformanceReport["scriptTargets"] = [];
  for (const source of sourceFiles) {
    const isK6Script = /from ["']k6|k6\/http|export const options|check\(|sleep\(/i.test(source.text);
    const isPackageScript = path.basename(source.filePath) === "package.json" && /k6\s+run|load[-_:]?test|performance/i.test(source.text);
    const isWorkflow = /^\.github\/workflows\//i.test(source.filePath) && /k6\s+run|grafana\/k6-action|load test|performance/i.test(source.text);
    const isConfig = /\.(json|ya?ml|toml|md|sh)$/i.test(source.filePath) && /k6\s+run|K6_|thresholds|scenarios/i.test(source.text);
    if (!isK6Script && !isPackageScript && !isWorkflow && !isConfig) continue;
    rows.push({
      filePath: source.filePath,
      kind: isK6Script ? "k6-script" : isPackageScript ? "package-script" : isWorkflow ? "ci-workflow" : isConfig ? "config" : "unknown",
      readiness: isK6Script || isPackageScript || isWorkflow ? "ready" : "partial",
      evidence: performanceTargetEvidence(source.filePath, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 60);
}

function performanceTargetEvidence(filePath: string, text: string): string {
  if (/from ["']k6|k6\/http/i.test(text)) return `${filePath} imports k6 modules for a runnable load-test script.`;
  if (/k6\s+run/i.test(text)) return `${filePath} documents a k6 run command.`;
  if (/thresholds|scenarios|stages/i.test(text)) return `${filePath} contains k6 option-style performance configuration.`;
  return `${filePath} has performance/load-test evidence.`;
}

function performanceWorkloadModels(sourceFiles: PerformanceSourceFile[]): PerformanceReport["workloadModels"] {
  const specs: Array<{ model: PerformanceReport["workloadModels"][number]["model"]; pattern: RegExp; evidence: string }> = [
    { model: "stages", pattern: /\bstages\s*:/i, evidence: "stages define ramp-up, steady, or ramp-down targets." },
    { model: "scenarios", pattern: /\bscenarios\s*:/i, evidence: "scenarios configure named workloads." },
    { model: "constant-vus", pattern: /constant-vus/i, evidence: "constant-vus keeps a fixed virtual user count." },
    { model: "ramping-vus", pattern: /ramping-vus/i, evidence: "ramping-vus changes virtual users over time." },
    { model: "shared-iterations", pattern: /shared-iterations/i, evidence: "shared-iterations distributes fixed iterations across VUs." },
    { model: "per-vu-iterations", pattern: /per-vu-iterations/i, evidence: "per-vu-iterations assigns fixed iterations per VU." },
    { model: "constant-arrival-rate", pattern: /constant-arrival-rate/i, evidence: "constant-arrival-rate models open traffic at a fixed rate." },
    { model: "ramping-arrival-rate", pattern: /ramping-arrival-rate/i, evidence: "ramping-arrival-rate models open traffic with rate changes." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      model: spec.model,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.model} workload evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/performance.html"
    };
  });
}

function performanceThresholds(sourceFiles: PerformanceSourceFile[]): PerformanceReport["thresholds"] {
  const rows: PerformanceReport["thresholds"] = [];
  for (const source of sourceFiles) {
    if (!/thresholds\s*:/i.test(source.text)) continue;
    const thresholdBlock = source.text.match(/thresholds\s*:\s*\{([\s\S]{0,2500}?)\n\s*\}/i)?.[1] ?? source.text;
    const matches = [...thresholdBlock.matchAll(/["']?([A-Za-z_][A-Za-z0-9_.{}:-]*)["']?\s*:\s*(\[[^\]]+\]|["'][^"']+["'])/g)].slice(0, 40);
    for (const match of matches) {
      rows.push({
        metric: match[1],
        expression: match[2].replace(/\s+/g, " ").slice(0, 160),
        readiness: "ready",
        evidence: `${source.filePath} defines a k6 threshold for ${match[1]}.`,
        relatedHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 80);
}

function performanceChecks(sourceFiles: PerformanceSourceFile[]): PerformanceReport["checks"] {
  const rows: PerformanceReport["checks"] = [];
  for (const source of sourceFiles) {
    if (!/check\s*\(/i.test(source.text)) continue;
    const names = [...source.text.matchAll(/["']([^"']{2,80})["']\s*:\s*\(?\s*\w+/g)]
      .map((match) => match[1])
      .filter((name) => /status|response|ok|success|body|header|latency|valid/i.test(name))
      .slice(0, 20);
    rows.push({
      filePath: source.filePath,
      name: names[0] ?? "k6 check",
      readiness: "ready",
      evidence: names.length > 0 ? `${source.filePath} defines check(s): ${names.slice(0, 5).join(", ")}.` : `${source.filePath} calls k6 check().`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 60);
}

function performanceMetrics(sourceFiles: PerformanceSourceFile[]): PerformanceReport["metrics"] {
  const rows: PerformanceReport["metrics"] = [];
  const builtIns = ["http_req_duration", "http_req_failed", "http_reqs", "vus", "iterations", "checks", "data_received", "data_sent"];
  for (const metric of builtIns) {
    const match = sourceFiles.find((source) => new RegExp(`\\b${metric}\\b`, "i").test(source.text));
    if (!match) continue;
    rows.push({ metric, metricType: "built-in", readiness: "ready", evidence: `${match.filePath} references built-in k6 metric ${metric}.`, relatedHref: match.sourceHref });
  }
  const constructors: Array<{ metricType: PerformanceReport["metrics"][number]["metricType"]; pattern: RegExp }> = [
    { metricType: "counter", pattern: /new\s+Counter\s*\(\s*["']([^"']+)["']/g },
    { metricType: "gauge", pattern: /new\s+Gauge\s*\(\s*["']([^"']+)["']/g },
    { metricType: "rate", pattern: /new\s+Rate\s*\(\s*["']([^"']+)["']/g },
    { metricType: "trend", pattern: /new\s+Trend\s*\(\s*["']([^"']+)["']/g }
  ];
  for (const source of sourceFiles) {
    for (const spec of constructors) {
      for (const match of source.text.matchAll(spec.pattern)) {
        rows.push({ metric: match[1], metricType: spec.metricType, readiness: "ready", evidence: `${source.filePath} defines custom ${spec.metricType} metric ${match[1]}.`, relatedHref: source.sourceHref });
      }
    }
  }
  return rows.slice(0, 80);
}

function performanceOutputs(sourceFiles: PerformanceSourceFile[]): PerformanceReport["outputs"] {
  const specs: Array<{ target: Exclude<PerformanceReport["outputs"][number]["target"], "none">; pattern: RegExp; evidence: (filePath: string) => string }> = [
    { target: "summary", pattern: /handleSummary|summary-export|summaryTrendStats/i, evidence: (filePath) => `${filePath} configures summary output or summary export.` },
    { target: "json", pattern: /--summary-export|json-output|K6_OUT=json|\.json/i, evidence: (filePath) => `${filePath} references JSON performance output.` },
    { target: "cloud", pattern: /k6 cloud|K6_CLOUD|cloud:\s*\{/i, evidence: (filePath) => `${filePath} references Grafana Cloud k6 execution.` },
    { target: "prometheus", pattern: /experimental-prometheus-rw|K6_PROMETHEUS|prometheus/i, evidence: (filePath) => `${filePath} references Prometheus output.` },
    { target: "influxdb", pattern: /influxdb|K6_INFLUXDB/i, evidence: (filePath) => `${filePath} references InfluxDB output.` },
    { target: "statsd", pattern: /statsd|K6_STATSD/i, evidence: (filePath) => `${filePath} references StatsD output.` },
    { target: "otel", pattern: /traces-output|K6_TRACES_OUTPUT|opentelemetry|otel/i, evidence: (filePath) => `${filePath} references OpenTelemetry trace output.` }
  ];
  const outputs: PerformanceReport["outputs"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (!match) continue;
    outputs.push({ target: spec.target, readiness: "ready", evidence: spec.evidence(match.filePath), relatedHref: match.sourceHref });
  }
  if (outputs.length === 0) {
    outputs.push({ target: "none", readiness: "missing", evidence: "No k6 summary, JSON, cloud, Prometheus, InfluxDB, StatsD, or OpenTelemetry output was detected.", relatedHref: "html/performance.html" });
  }
  return outputs;
}

function performanceRuntimeControls(
  sourceFiles: PerformanceSourceFile[],
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): PerformanceReport["runtimeControls"] {
  const runtimeHref = "html/runtime-environment.html";
  const specs: Array<{ control: PerformanceReport["runtimeControls"][number]["control"]; pattern: RegExp; evidence: string }> = [
    { control: "vus", pattern: /\bvus\s*:|--vus\b|-u\s+\d+/i, evidence: "VU count can be controlled." },
    { control: "duration", pattern: /\bduration\s*:|--duration\b/i, evidence: "Duration can be controlled." },
    { control: "stages", pattern: /\bstages\s*:/i, evidence: "Ramp stages are configured." },
    { control: "iterations", pattern: /\biterations\s*:|--iterations\b/i, evidence: "Iteration count is configured." },
    { control: "env-vars", pattern: /__ENV|K6_|--env\b/i, evidence: "Environment variable controls are configured." },
    { control: "archive", pattern: /k6 archive|--archive-out|archive/i, evidence: "k6 archive packaging is referenced." },
    { control: "browser", pattern: /k6\/browser|browser\./i, evidence: "Browser performance flow is referenced." },
    { control: "distributed", pattern: /operator|kubernetes|k6-operator|cloud run|distributed/i, evidence: "Distributed/cloud execution is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (match) return { control: spec.control, readiness: "ready", evidence: `${match.filePath} ${spec.evidence}`, relatedHref: match.sourceHref };
    const runtimeSignals = runtimeEnvironmentReport.containerSignals.length + runtimeEnvironmentReport.setupSignals.length;
    return {
      control: spec.control,
      readiness: runtimeSignals > 0 && ["env-vars", "distributed"].includes(spec.control) ? "external" : "missing",
      evidence: `${spec.control} runtime control was not detected in static performance files.`,
      relatedHref: runtimeHref
    };
  });
}

async function buildE2eReport(
  walk: WalkResult,
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): Promise<E2eReport> {
  const sourceFiles = await e2eSourceFiles(walk);
  const testSuites = e2eTestSuites(sourceFiles);
  const browserProjects = e2eBrowserProjects(sourceFiles);
  const locatorSignals = e2eLocatorSignals(sourceFiles);
  const assertions = e2eAssertions(sourceFiles);
  const artifacts = e2eArtifacts(sourceFiles);
  const runtimeTargets = e2eRuntimeTargets(sourceFiles, runtimeEnvironmentReport);
  const hasSuite = testSuites.some((item) => item.readiness === "ready");
  const hasLocator = locatorSignals.length > 0;
  const hasAssertion = assertions.some((item) => item.readiness === "ready");
  const hasArtifact = artifacts.some((item) => item.artifact !== "none" && item.readiness !== "missing");
  const hasRuntime = runtimeTargets.some((item) => item.target === "web-server" && item.readiness === "ready")
    || runtimeTargets.some((item) => item.target === "base-url" && item.readiness === "ready");

  const riskQueue: E2eReport["riskQueue"] = [];
  if (!hasSuite) {
    riskQueue.push({
      priority: "high",
      action: "Add a Playwright test suite or equivalent browser E2E tests before claiming user-flow coverage.",
      why: "Browser readiness requires executable tests that drive real pages or API contexts.",
      relatedHref: "html/e2e.html"
    });
  }
  if (hasSuite && !hasRuntime) {
    riskQueue.push({
      priority: "high",
      action: "Configure webServer or baseURL so E2E tests can start and target the app deterministically.",
      why: "Tests that depend on an already-running local server are harder to reproduce in CI.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasSuite && !hasLocator) {
    riskQueue.push({
      priority: "medium",
      action: "Prefer user-facing locators such as getByRole, getByLabel, getByText, or getByTestId.",
      why: "Playwright's resilient locator model reduces brittle CSS/XPath coupling.",
      relatedHref: "html/e2e.html"
    });
  }
  if (hasSuite && !hasAssertion) {
    riskQueue.push({
      priority: "medium",
      action: "Add web-first assertions for URL, visibility, title, text, network, or snapshots.",
      why: "Navigation without assertions only proves automation can click, not that the flow works.",
      relatedHref: "html/e2e.html"
    });
  }
  if (hasSuite && !hasArtifact) {
    riskQueue.push({
      priority: "medium",
      action: "Enable trace, screenshot, video, HTML, JUnit, or JSON artifacts for failed tests.",
      why: "E2E failures are expensive to triage without retained browser evidence.",
      relatedHref: "html/e2e.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Playwright against the original app before treating this report as an E2E pass.",
    why: "RepoTutor only performs static readiness analysis and never launches a browser.",
    relatedHref: "html/e2e.html"
  });

  return {
    summary: `Playwright식 E2E readiness report: test suite ${testSuites.length}개, browser project ${browserProjects.length}개, locator signal ${locatorSignals.length}개, artifact ${artifacts.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Playwright browser E2E tests config projects locators assertions traces screenshots video reporters CI webServer",
    testSuites,
    browserProjects,
    locatorSignals,
    assertions,
    artifacts,
    runtimeTargets,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm init playwright@latest", purpose: "Scaffold Playwright Test configuration and starter browser tests." },
      { command: "npx playwright install --with-deps", purpose: "Install browser binaries and system dependencies for CI-like runs." },
      { command: "npx playwright test", purpose: "Run the configured E2E test suite." },
      { command: "npx playwright test --project=chromium --reporter=html,junit", purpose: "Run one browser project while producing local HTML and CI-readable JUnit output." },
      { command: "npx playwright show-trace trace.zip", purpose: "Open a retained trace artifact for failed-test triage." }
    ],
    learnerNextSteps: [
      "먼저 Playwright config와 test suite가 있는지 확인하세요.",
      "webServer 또는 baseURL이 없으면 로컬/CI 재현성이 약합니다.",
      "getByRole/getByLabel/getByText 같은 사용자 중심 locator와 web-first assertion을 함께 보세요.",
      "이 리포트는 브라우저 실행 결과가 아닙니다. 실제 pass/fail은 원본 앱에서 별도 실행하세요."
    ]
  };
}

type E2eSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function e2eSourceFiles(walk: WalkResult): Promise<E2eSourceFile[]> {
  const files: E2eSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !e2eInspectablePath(file.relPath)) continue;
    const pathCandidate = e2ePathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !e2eContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 140) break;
  }
  return files;
}

function e2eInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s|wdio\.conf\.[cm]?[jt]s|selenium.*\.(json|ya?ml)|docker-compose\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md|feature)$/i.test(filePath);
}

function e2ePathSignal(filePath: string): boolean {
  return /(playwright|cypress|selenium|webdriverio|wdio|e2e|end-to-end|browser|ui-test|trace|screenshots?|videos?|test-results?)/i.test(filePath);
}

function e2eContentSignal(text: string): boolean {
  return /(@playwright\/test|playwright\.config|defineConfig|npx playwright|test\(|expect\(page|page\.goto|getByRole|getByText|getByLabel|getByTestId|page\.locator|toBeVisible|toHaveURL|toHaveTitle|trace:|screenshot:|video:|webServer|baseURL|cypress|cy\.|selenium|webdriverio|browser\.url)/i.test(text);
}

function e2eTestSuites(sourceFiles: E2eSourceFile[]): E2eReport["testSuites"] {
  const rows: E2eReport["testSuites"] = [];
  for (const source of sourceFiles) {
    const framework = e2eFrameworkFor(source.filePath, source.text);
    if (framework === "unknown" && !/\b(test|it)\s*\(|describe\s*\(/i.test(source.text)) continue;
    rows.push({
      filePath: source.filePath,
      framework,
      readiness: framework === "unknown" ? "partial" : "ready",
      evidence: e2eSuiteEvidence(source.filePath, framework, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function e2eFrameworkFor(filePath: string, text: string): E2eReport["testSuites"][number]["framework"] {
  if (/@playwright\/test|playwright\.config|npx playwright|from ["']playwright|from ["']@playwright/i.test(text) || /playwright/i.test(filePath)) return "playwright";
  if (/cypress|cy\./i.test(text) || /cypress/i.test(filePath)) return "cypress";
  if (/selenium|webdriver\.|By\./i.test(text) || /selenium/i.test(filePath)) return "selenium";
  if (/webdriverio|browser\.url|\$\(.*\)\.click|wdio/i.test(text) || /wdio|webdriverio/i.test(filePath)) return "webdriverio";
  return "unknown";
}

function e2eSuiteEvidence(filePath: string, framework: E2eReport["testSuites"][number]["framework"], text: string): string {
  if (/playwright\.config|defineConfig/i.test(text)) return `${filePath} configures Playwright Test.`;
  if (/@playwright\/test/i.test(text)) return `${filePath} imports Playwright Test fixtures and assertions.`;
  if (/cypress|cy\./i.test(text)) return `${filePath} contains Cypress browser test evidence.`;
  if (/selenium/i.test(text)) return `${filePath} contains Selenium browser automation evidence.`;
  if (/webdriverio|browser\.url/i.test(text)) return `${filePath} contains WebdriverIO browser automation evidence.`;
  return `${filePath} has browser/E2E test-shaped evidence.`;
}

function e2eBrowserProjects(sourceFiles: E2eSourceFile[]): E2eReport["browserProjects"] {
  const specs: Array<{ browser: E2eReport["browserProjects"][number]["browser"]; pattern: RegExp; evidence: string }> = [
    { browser: "chromium", pattern: /chromium|Desktop Chrome|Google Chrome/i, evidence: "Chromium browser project is configured or referenced." },
    { browser: "firefox", pattern: /firefox|Desktop Firefox/i, evidence: "Firefox browser project is configured or referenced." },
    { browser: "webkit", pattern: /webkit|Desktop Safari|Safari/i, evidence: "WebKit/Safari browser project is configured or referenced." },
    { browser: "mobile", pattern: /Pixel 5|iPhone|iPad|devices\[/i, evidence: "Mobile device project or device descriptor is configured." },
    { browser: "api", pattern: /request\.newContext|APIRequestContext|api testing|playwright\/test.*request/i, evidence: "Playwright API testing context is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      browser: spec.browser,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.browser} project evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/e2e.html"
    };
  });
}

function e2eLocatorSignals(sourceFiles: E2eSourceFile[]): E2eReport["locatorSignals"] {
  const specs: Array<{ locatorType: E2eReport["locatorSignals"][number]["locatorType"]; pattern: RegExp; evidence: string }> = [
    { locatorType: "role", pattern: /getByRole\s*\(/i, evidence: "uses role-based user-facing locators." },
    { locatorType: "text", pattern: /getByText\s*\(|locator\(\s*["']text=/i, evidence: "uses visible text locators." },
    { locatorType: "label", pattern: /getByLabel\s*\(|getByPlaceholder\s*\(/i, evidence: "uses form label or placeholder locators." },
    { locatorType: "testid", pattern: /getByTestId\s*\(|data-testid|data-test-id/i, evidence: "uses stable test id locators." },
    { locatorType: "css", pattern: /page\.locator\s*\(\s*["'][#.A-Za-z[]|locator\(\s*["']css=/i, evidence: "uses CSS locator selectors." },
    { locatorType: "xpath", pattern: /locator\(\s*["']xpath=|\/\/[A-Za-z]/i, evidence: "uses XPath locator selectors." },
    { locatorType: "page-object", pattern: /class\s+\w*(Page|Pom|Object)|Page Object|POM/i, evidence: "uses a page object model or page wrapper." }
  ];
  const rows: E2eReport["locatorSignals"] = [];
  for (const source of sourceFiles) {
    for (const spec of specs) {
      if (!spec.pattern.test(source.text) && !spec.pattern.test(source.filePath)) continue;
      rows.push({
        filePath: source.filePath,
        locatorType: spec.locatorType,
        readiness: "ready",
        evidence: `${source.filePath} ${spec.evidence}`,
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 80);
}

function e2eAssertions(sourceFiles: E2eSourceFile[]): E2eReport["assertions"] {
  const specs: Array<{ assertion: E2eReport["assertions"][number]["assertion"]; pattern: RegExp; evidence: string }> = [
    { assertion: "url", pattern: /toHaveURL|url\(\)|expect\(.*url/i, evidence: "URL assertion evidence was detected." },
    { assertion: "visible", pattern: /toBeVisible|toBeHidden|isVisible/i, evidence: "Visibility assertion evidence was detected." },
    { assertion: "text", pattern: /toHaveText|toContainText|textContent/i, evidence: "Text assertion evidence was detected." },
    { assertion: "title", pattern: /toHaveTitle|title\(\)/i, evidence: "Title assertion evidence was detected." },
    { assertion: "network", pattern: /waitForResponse|route\(|request\.|response\.|toHaveStatus/i, evidence: "Network/API assertion or routing evidence was detected." },
    { assertion: "snapshot", pattern: /toHaveScreenshot|toMatchSnapshot|snapshot/i, evidence: "Snapshot assertion evidence was detected." },
    { assertion: "accessibility", pattern: /aria|accessibility|axe|toHaveAccessibleName|toHaveAccessibleDescription/i, evidence: "Accessibility assertion evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      assertion: spec.assertion,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.assertion} assertion evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/e2e.html"
    };
  });
}

function e2eArtifacts(sourceFiles: E2eSourceFile[]): E2eReport["artifacts"] {
  const specs: Array<{ artifact: Exclude<E2eReport["artifacts"][number]["artifact"], "none">; pattern: RegExp; evidence: string }> = [
    { artifact: "trace", pattern: /trace\s*:|show-trace|trace\.zip|trace viewer/i, evidence: "trace artifact capture is configured or documented." },
    { artifact: "screenshot", pattern: /screenshot\s*:|toHaveScreenshot|page\.screenshot|screenshots?/i, evidence: "screenshot artifact capture is configured or documented." },
    { artifact: "video", pattern: /video\s*:|recordVideo|videos?/i, evidence: "video artifact capture is configured or documented." },
    { artifact: "html-report", pattern: /reporter\s*:.*html|html reporter|show-report|playwright-report/i, evidence: "HTML reporter output is configured or documented." },
    { artifact: "junit", pattern: /reporter\s*:.*junit|\bjunit\b/i, evidence: "JUnit reporter output is configured or documented." },
    { artifact: "json", pattern: /reporter\s*:.*json|\bjson reporter\b|test-results\.json/i, evidence: "JSON reporter output is configured or documented." }
  ];
  const rows: E2eReport["artifacts"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (!match) continue;
    rows.push({ artifact: spec.artifact, readiness: "ready", evidence: `${match.filePath} ${spec.evidence}`, relatedHref: match.sourceHref });
  }
  if (rows.length === 0) {
    rows.push({ artifact: "none", readiness: "missing", evidence: "No trace, screenshot, video, HTML, JUnit, or JSON E2E artifact signal was detected.", relatedHref: "html/e2e.html" });
  }
  return rows;
}

function e2eRuntimeTargets(
  sourceFiles: E2eSourceFile[],
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): E2eReport["runtimeTargets"] {
  const specs: Array<{ target: E2eReport["runtimeTargets"][number]["target"]; pattern: RegExp; evidence: string }> = [
    { target: "web-server", pattern: /webServer\s*:|reuseExistingServer|npm run dev|pnpm dev|yarn dev/i, evidence: "webServer or dev-server startup is configured." },
    { target: "base-url", pattern: /baseURL\s*:|PLAYWRIGHT_BASE_URL|process\.env\.\w*BASE_URL/i, evidence: "baseURL target is configured." },
    { target: "env-vars", pattern: /process\.env|dotenv|PLAYWRIGHT_|CI\b/i, evidence: "environment variable controls are referenced." },
    { target: "parallel-workers", pattern: /workers\s*:|fullyParallel|parallel/i, evidence: "parallel worker controls are configured." },
    { target: "retries", pattern: /retries\s*:|--retries/i, evidence: "retry controls are configured." },
    { target: "ci-artifacts", pattern: /upload-artifact|actions\/upload-artifact|test-results|playwright-report/i, evidence: "CI artifact upload or retained test output is configured." },
    { target: "storage-state", pattern: /storageState|auth\.json|context\(\)\.storageState/i, evidence: "authenticated storage state reuse is configured." }
  ];
  const runtimeSignals = runtimeEnvironmentReport.setupSignals.length + runtimeEnvironmentReport.containerSignals.length;
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (match) return { target: spec.target, readiness: "ready", evidence: `${match.filePath} ${spec.evidence}`, relatedHref: match.sourceHref };
    return {
      target: spec.target,
      readiness: runtimeSignals > 0 && ["web-server", "base-url", "env-vars"].includes(spec.target) ? "external" : "missing",
      evidence: `${spec.target} runtime target was not detected in E2E files.`,
      relatedHref: "html/runtime-environment.html"
    };
  });
}

async function buildAccessibilityReport(
  walk: WalkResult,
  e2eReport: E2eReport
): Promise<AccessibilityReport> {
  const sourceFiles = await accessibilitySourceFiles(walk);
  const scanTargets = accessibilityScanTargets(sourceFiles);
  const ruleTags = accessibilityRuleTags(sourceFiles);
  const resultBuckets = accessibilityResultBuckets(sourceFiles);
  const impactLevels = accessibilityImpactLevels(sourceFiles);
  const integrationSignals = accessibilityIntegrationSignals(sourceFiles);
  const contextControls = accessibilityContextControls(sourceFiles, e2eReport);
  const hasScanTarget = scanTargets.some((item) => item.readiness === "ready");
  const hasIntegration = integrationSignals.some((item) => item.readiness === "ready");
  const hasResultModel = resultBuckets.some((item) => item.bucket === "violations" && item.readiness === "ready");
  const hasWcagTag = ruleTags.some((item) => item.tag.startsWith("wcag") && item.readiness === "ready");
  const hasManualReview = resultBuckets.some((item) => item.bucket === "incomplete" && item.readiness === "ready")
    || integrationSignals.some((item) => item.integration === "manual-review" && item.readiness === "ready");

  const riskQueue: AccessibilityReport["riskQueue"] = [];
  if (!hasScanTarget) {
    riskQueue.push({
      priority: "high",
      action: "Add an accessibility scan target for at least one rendered page, component, or browser test flow.",
      why: "axe-core needs rendered HTML or a browser/test harness context before results can represent user-facing UI.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasScanTarget && !hasIntegration) {
    riskQueue.push({
      priority: "high",
      action: "Wire axe-core, jest-axe, Playwright axe injection, Cypress axe, Pa11y, or Lighthouse into the test workflow.",
      why: "Static markup hints are useful, but automated accessibility readiness needs an executable scan integration.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasIntegration && !hasResultModel) {
    riskQueue.push({
      priority: "medium",
      action: "Persist or assert the axe result buckets: violations, passes, incomplete, and inapplicable.",
      why: "The incomplete bucket is where axe-core asks for manual review; dropping it can hide important uncertainty.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasIntegration && !hasWcagTag) {
    riskQueue.push({
      priority: "medium",
      action: "Record WCAG/category tags or runOnly configuration so failures map back to standards and remediation queues.",
      why: "Axe rules are more actionable when grouped by WCAG level, best-practice, and content category.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasIntegration && !hasManualReview) {
    riskQueue.push({
      priority: "medium",
      action: "Add a manual-review path for incomplete results and hidden or newly revealed UI states.",
      why: "axe-core explicitly returns incomplete results when it cannot be certain.",
      relatedHref: "html/accessibility.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the accessibility scanner against the original app before treating this report as an accessibility pass.",
    why: "RepoTutor only performs static readiness analysis and never executes axe-core or a browser.",
    relatedHref: "html/accessibility.html"
  });

  return {
    summary: `axe-core식 accessibility readiness report: scan target ${scanTargets.length}개, integration signal ${integrationSignals.length}개, rule tag ${ruleTags.length}개, context control ${contextControls.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "axe-core accessibility engine WCAG tags violations passes incomplete inapplicable impact selectors context configure reporter iframes",
    scanTargets,
    ruleTags,
    resultBuckets,
    impactLevels,
    integrationSignals,
    contextControls,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm install axe-core --save-dev", purpose: "Install the axe-core accessibility engine for browser or fixture tests." },
      { command: "await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })", purpose: "Run axe against rendered UI and scope the result to WCAG A/AA tags." },
      { command: "expect(results.violations).toHaveLength(0)", purpose: "Fail CI when automated violations are returned." },
      { command: "review results.incomplete", purpose: "Route uncertain axe checks to manual accessibility review." },
      { command: "npx lighthouse <url> --only-categories=accessibility --output=json", purpose: "Optionally collect a browser-level accessibility audit artifact." }
    ],
    learnerNextSteps: [
      "먼저 rendered page/component/test flow 중 어디에서 accessibility scan을 실행할지 정하세요.",
      "`violations`만 보지 말고 `incomplete`를 manual review queue로 남기세요.",
      "WCAG tag와 axe category를 저장하면 remediation 우선순위를 잡기 쉽습니다.",
      "이 리포트는 정적 readiness입니다. 실제 접근성 pass/fail은 원본 앱에서 axe-core나 브라우저 audit로 확인하세요."
    ]
  };
}

type AccessibilitySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function accessibilitySourceFiles(walk: WalkResult): Promise<AccessibilitySourceFile[]> {
  const files: AccessibilitySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !accessibilityInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!accessibilityPathSignal(file.relPath) && !accessibilityContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 140) break;
  }
  return files;
}

function accessibilityInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s|lighthouserc\.(json|js|cjs|mjs)|pa11y\.(json|js|cjs|mjs)|axe\.(json|js|cjs|mjs))$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(html|tsx|jsx|vue|svelte|astro|ts|js|mjs|cjs|json|ya?ml|md)$/i.test(filePath);
}

function accessibilityPathSignal(filePath: string): boolean {
  return /(accessibility|a11y|axe|pa11y|lighthouse|wcag|aria|screenreader|screen-reader|keyboard|contrast|semantic|landmark|alt-text)/i.test(filePath);
}

function accessibilityContentSignal(text: string): boolean {
  return /(axe-core|axe\.run|axe\.configure|axe\.getRules|jest-axe|toHaveNoViolations|injectAxe|checkA11y|cy\.checkA11y|pa11y|lighthouse|violations|incomplete|inapplicable|wcag2a|wcag2aa|wcag21aa|wcag22aa|best-practice|aria-|role=|alt=|tabindex|skip link|color-contrast|accessible name|screen reader)/i.test(text);
}

function accessibilityScanTargets(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["scanTargets"] {
  return sourceFiles
    .filter((source) => /\.(html|tsx|jsx|vue|svelte|astro|ts|js|mjs|cjs|json|ya?ml)$/i.test(source.filePath))
    .map((source) => ({
      filePath: source.filePath,
      kind: accessibilityTargetKind(source.filePath, source.text),
      readiness: accessibilityContentSignal(source.text) ? "ready" as const : "partial" as const,
      evidence: accessibilityTargetEvidence(source.filePath, source.text),
      sourceHref: source.sourceHref
    }))
    .slice(0, 80);
}

function accessibilityTargetKind(filePath: string, text: string): AccessibilityReport["scanTargets"][number]["kind"] {
  if (/package\.json|lighthouserc|pa11y|axe\.(json|js|cjs|mjs)/i.test(filePath)) return "config";
  if (/\.(test|spec|cy|e2e)\.[cm]?[jt]sx?$/i.test(filePath) || /axe\.run|checkA11y|toHaveNoViolations|pa11y|lighthouse/i.test(text)) return "test";
  if (/\.(tsx|jsx|vue|svelte|astro)$/i.test(filePath)) return "component";
  if (/\.html$/i.test(filePath)) return "page";
  if (/template|handlebars|mustache|njk|ejs/i.test(filePath)) return "template";
  return "unknown";
}

function accessibilityTargetEvidence(filePath: string, text: string): string {
  if (/axe\.run|checkA11y|toHaveNoViolations/i.test(text)) return `${filePath} includes an executable axe-style accessibility check.`;
  if (/axe-core|jest-axe|pa11y|lighthouse/i.test(text)) return `${filePath} references an accessibility audit dependency or command.`;
  if (/aria-|role=|alt=|tabindex|skip link|color-contrast|accessible name/i.test(text)) return `${filePath} contains accessibility-relevant markup or guidance.`;
  return `${filePath} is an accessibility-shaped target candidate.`;
}

function accessibilityRuleTags(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["ruleTags"] {
  const specs: Array<{ tag: AccessibilityReport["ruleTags"][number]["tag"]; pattern: RegExp; evidence: string }> = [
    { tag: "wcag2a", pattern: /wcag2a|wcag 2(?:\.0)? level a|\bA\/AA\b/i, evidence: "WCAG 2 A tag evidence was detected." },
    { tag: "wcag2aa", pattern: /wcag2aa|wcag 2(?:\.0)? level aa|\bA\/AA\b/i, evidence: "WCAG 2 AA tag evidence was detected." },
    { tag: "wcag21a", pattern: /wcag21a|wcag 2\.1 level a/i, evidence: "WCAG 2.1 A tag evidence was detected." },
    { tag: "wcag21aa", pattern: /wcag21aa|wcag 2\.1 level aa/i, evidence: "WCAG 2.1 AA tag evidence was detected." },
    { tag: "wcag22aa", pattern: /wcag22aa|wcag 2\.2 level aa/i, evidence: "WCAG 2.2 AA tag evidence was detected." },
    { tag: "best-practice", pattern: /best-practice|best practice/i, evidence: "axe best-practice tag evidence was detected." },
    { tag: "section508", pattern: /section508|section 508/i, evidence: "Section 508 tag evidence was detected." },
    { tag: "cat.aria", pattern: /cat\.aria|aria-/i, evidence: "ARIA category evidence was detected." },
    { tag: "cat.color", pattern: /cat\.color|color-contrast|contrast ratio/i, evidence: "Color/contrast category evidence was detected." },
    { tag: "cat.forms", pattern: /cat\.forms|label|form|input|select|textarea/i, evidence: "Forms category evidence was detected." },
    { tag: "cat.keyboard", pattern: /cat\.keyboard|keyboard|tabindex|focus|skip link/i, evidence: "Keyboard category evidence was detected." },
    { tag: "cat.language", pattern: /cat\.language|html lang|language/i, evidence: "Language category evidence was detected." },
    { tag: "cat.name-role-value", pattern: /cat\.name-role-value|accessible name|role=|aria-label/i, evidence: "Name/role/value category evidence was detected." },
    { tag: "cat.parsing", pattern: /cat\.parsing|duplicate id|valid html|parser/i, evidence: "Parsing category evidence was detected." },
    { tag: "cat.semantics", pattern: /cat\.semantics|heading|landmark|main|nav|footer|header/i, evidence: "Semantics category evidence was detected." },
    { tag: "cat.structure", pattern: /cat\.structure|iframe|frame|region|document title/i, evidence: "Structure category evidence was detected." },
    { tag: "cat.tables", pattern: /cat\.tables|table|th|td|caption|scope/i, evidence: "Tables category evidence was detected." },
    { tag: "cat.text-alternatives", pattern: /cat\.text-alternatives|alt=|alternative text|image alt/i, evidence: "Text alternatives category evidence was detected." },
    { tag: "cat.time-and-media", pattern: /cat\.time-and-media|video|audio|caption|autoplay/i, evidence: "Time/media category evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      tag: spec.tag,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.tag} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/accessibility.html"
    };
  });
}

function accessibilityResultBuckets(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["resultBuckets"] {
  const specs: Array<{ bucket: AccessibilityReport["resultBuckets"][number]["bucket"]; pattern: RegExp; evidence: string }> = [
    { bucket: "violations", pattern: /violations|results\.violations|violation/i, evidence: "violations result bucket is read, asserted, or persisted." },
    { bucket: "passes", pattern: /passes|results\.passes/i, evidence: "passes result bucket is read or persisted." },
    { bucket: "incomplete", pattern: /incomplete|needs review|manual review/i, evidence: "incomplete/manual-review bucket is read or persisted." },
    { bucket: "inapplicable", pattern: /inapplicable|not applicable/i, evidence: "inapplicable result bucket is read or persisted." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      bucket: spec.bucket,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.bucket} result bucket evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/accessibility.html"
    };
  });
}

function accessibilityImpactLevels(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["impactLevels"] {
  const specs: Array<{ impact: AccessibilityReport["impactLevels"][number]["impact"]; pattern: RegExp; evidence: string }> = [
    { impact: "critical", pattern: /critical/i, evidence: "critical impact handling is referenced." },
    { impact: "serious", pattern: /serious/i, evidence: "serious impact handling is referenced." },
    { impact: "moderate", pattern: /moderate/i, evidence: "moderate impact handling is referenced." },
    { impact: "minor", pattern: /minor/i, evidence: "minor impact handling is referenced." },
    { impact: "unknown", pattern: /impact|severity|priority/i, evidence: "generic impact/severity handling is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      impact: spec.impact,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.impact} impact evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/accessibility.html"
    };
  });
}

function accessibilityIntegrationSignals(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["integrationSignals"] {
  const specs: Array<{ integration: AccessibilityReport["integrationSignals"][number]["integration"]; pattern: RegExp; evidence: string }> = [
    { integration: "axe-run", pattern: /axe\.run|axe\.runPartial|axe\.finishRun/i, evidence: "runs axe directly against a rendered context." },
    { integration: "axe-core-package", pattern: /["']axe-core["']|axe-core/i, evidence: "declares or imports axe-core." },
    { integration: "jest-axe", pattern: /jest-axe|toHaveNoViolations/i, evidence: "uses jest-axe matchers." },
    { integration: "playwright-axe", pattern: /@axe-core\/playwright|injectAxe|playwright.*axe|axe.*playwright/i, evidence: "uses Playwright accessibility scan integration." },
    { integration: "cypress-axe", pattern: /cypress-axe|cy\.injectAxe|cy\.checkA11y/i, evidence: "uses Cypress accessibility scan integration." },
    { integration: "pa11y", pattern: /pa11y/i, evidence: "uses Pa11y accessibility scan integration." },
    { integration: "lighthouse", pattern: /lighthouse|only-categories=accessibility/i, evidence: "uses Lighthouse accessibility category." },
    { integration: "manual-review", pattern: /manual review|needs review|incomplete/i, evidence: "keeps a manual review path for uncertain checks." }
  ];
  const rows: AccessibilityReport["integrationSignals"] = [];
  for (const source of sourceFiles) {
    for (const spec of specs) {
      if (!spec.pattern.test(source.text) && !spec.pattern.test(source.filePath)) continue;
      rows.push({
        filePath: source.filePath,
        integration: spec.integration,
        readiness: "ready",
        evidence: `${source.filePath} ${spec.evidence}`,
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 80);
}

function accessibilityContextControls(
  sourceFiles: AccessibilitySourceFile[],
  e2eReport: E2eReport
): AccessibilityReport["contextControls"] {
  const specs: Array<{ control: AccessibilityReport["contextControls"][number]["control"]; pattern: RegExp; evidence: string }> = [
    { control: "include-exclude", pattern: /include|exclude|context\s*:|axe\.run\([^)]*\{/i, evidence: "include/exclude context scoping is configured." },
    { control: "run-only-tags", pattern: /runOnly|wcag2a|wcag2aa|best-practice|tags/i, evidence: "runOnly tag or rule filtering is configured." },
    { control: "disable-rules", pattern: /enabled\s*:\s*false|disableOtherRules|rules\s*:/i, evidence: "rule disabling or custom rule configuration is present." },
    { control: "iframes", pattern: /iframe|frameMessenger|runPartial|finishRun|allowedOrigins/i, evidence: "iframe or frame communication control is referenced." },
    { control: "shadow-dom", pattern: /shadow dom|shadowSelect|shadow/i, evidence: "Shadow DOM scanning constraints are referenced." },
    { control: "locale", pattern: /locale|axe\.configure|resetLocale/i, evidence: "locale configuration is referenced." },
    { control: "reporter", pattern: /reporter|json|html report|junit/i, evidence: "reporter/output configuration is referenced." },
    { control: "jsdom", pattern: /jsdom/i, evidence: "JSDOM compatibility constraints are referenced." },
    { control: "timeouts", pattern: /timeout|elementInternals|wait/i, evidence: "timeout or async scan controls are referenced." }
  ];
  const hasE2eRuntime = e2eReport.runtimeTargets.some((item) => item.readiness === "ready" || item.readiness === "external");
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      control: spec.control,
      readiness: match ? "ready" : hasE2eRuntime && ["include-exclude", "reporter", "timeouts"].includes(spec.control) ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.control} control evidence was not detected.`,
      relatedHref: match?.sourceHref ?? (hasE2eRuntime ? "html/e2e.html" : "html/accessibility.html")
    };
  });
}

async function buildStorybookReport(walk: WalkResult): Promise<StorybookReport> {
  const sourceFiles = await storybookSourceFiles(walk);
  const storyFiles = storybookStoryFiles(sourceFiles);
  const configFiles = storybookConfigFiles(sourceFiles);
  const storyAnnotations = storybookAnnotations(sourceFiles);
  const addonSignals = storybookAddonSignals(sourceFiles);
  const testSignals = storybookTestSignals(sourceFiles);
  const publishSignals = storybookPublishSignals(sourceFiles);
  const hasStory = storyFiles.some((item) => item.readiness === "ready");
  const hasConfig = configFiles.some((item) => item.configType === "main" && item.readiness === "ready");
  const hasArgs = storyAnnotations.some((item) => item.annotation === "args" && item.readiness === "ready");
  const hasDocs = addonSignals.some((item) => item.addon === "docs" && item.readiness === "ready")
    || storyAnnotations.some((item) => item.annotation === "tags" && item.readiness === "ready");
  const hasInteraction = storyAnnotations.some((item) => item.annotation === "play" && item.readiness === "ready")
    || testSignals.some((item) => item.signal === "interaction-tests" && item.readiness === "ready");
  const hasPublish = publishSignals.some((item) => item.signal === "build-storybook" && item.readiness === "ready")
    || publishSignals.some((item) => item.signal === "chromatic" && item.readiness === "ready");

  const riskQueue: StorybookReport["riskQueue"] = [];
  if (!hasStory) {
    riskQueue.push({
      priority: "high",
      action: "Add colocated CSF or MDX story files before claiming component-state coverage.",
      why: "Storybook's learning value starts with executable component examples such as Button.stories.tsx.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add `.storybook/main.*` with story globs, framework, addons, and build settings.",
      why: "Story files without a main config are hard to discover, build, or run consistently.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasArgs) {
    riskQueue.push({
      priority: "medium",
      action: "Use args and argTypes so learners can inspect component states through Controls.",
      why: "Storybook's Controls and Autodocs are most useful when stories expose state as args.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasDocs) {
    riskQueue.push({
      priority: "medium",
      action: "Enable docs/autodocs tags or MDX pages for living component documentation.",
      why: "Stories double as documentation when metadata, tags, and doc blocks are present.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add play functions or Storybook Test coverage for interactive component states.",
      why: "Render-only stories smoke-test appearance, but play functions capture user behavior.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasPublish) {
    riskQueue.push({
      priority: "low",
      action: "Add build-storybook, Chromatic, or composition signals before treating stories as shareable docs.",
      why: "Published Storybooks are easier to review, compare visually, and link from learning material.",
      relatedHref: "html/storybook.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Storybook or Storybook Test against the original app before treating this report as a UI test pass.",
    why: "RepoTutor only performs static readiness analysis and never starts the Storybook dev server.",
    relatedHref: "html/storybook.html"
  });

  return {
    summary: `Storybook식 component workshop readiness report: story file ${storyFiles.length}개, config ${configFiles.length}개, annotation ${storyAnnotations.length}개, addon signal ${addonSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Storybook Component Story Format stories args argTypes decorators play functions autodocs addons test-runner Chromatic component workshop",
    storyFiles,
    configFiles,
    storyAnnotations,
    addonSignals,
    testSignals,
    publishSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx storybook@latest init", purpose: "Scaffold Storybook config, framework integration, and starter stories." },
      { command: "npm run storybook", purpose: "Start the component workshop locally for manual story review." },
      { command: "npm run build-storybook", purpose: "Build static Storybook documentation for review or hosting." },
      { command: "npm run test-storybook", purpose: "Run Storybook Test or test-runner checks for render and play-function coverage." },
      { command: "npx chromatic --project-token=<token>", purpose: "Optionally publish visual regression snapshots and review diffs." }
    ],
    learnerNextSteps: [
      "먼저 `.stories.*` 또는 MDX story가 컴포넌트 옆에 있는지 확인하세요.",
      "args/argTypes/parameters/decorators를 보면 어떤 상태를 학습자가 조작할 수 있는지 알 수 있습니다.",
      "play function은 story가 실제 사용자 행동까지 설명하는지 판단하는 핵심 신호입니다.",
      "이 리포트는 정적 readiness입니다. 실제 pass/fail은 원본 앱에서 Storybook과 Storybook Test로 확인하세요."
    ]
  };
}

type StorybookSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function storybookSourceFiles(walk: WalkResult): Promise<StorybookSourceFile[]> {
  const files: StorybookSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !storybookInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!storybookPathSignal(file.relPath) && !storybookContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 160) break;
  }
  return files;
}

function storybookInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|vitest\.config\.storybook\.[cm]?[jt]s|test-runner-jest\.config\.[cm]?[jt]s|chromatic\.(config\.)?(json|ya?ml|js|cjs|mjs))$/i.test(base)
    || /^\.storybook\/.+\.[cm]?[jt]sx?$/i.test(filePath)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(stories|story)\.(ts|tsx|js|jsx|mjs|cjs|mdx|svelte|vue)$/i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md|mdx)$/i.test(filePath);
}

function storybookPathSignal(filePath: string): boolean {
  return /(^|\/)\.storybook\/|storybook|\.stories\.|\.story\.|chromatic|test-storybook|stories\.json/i.test(filePath);
}

function storybookContentSignal(text: string): boolean {
  return /(@storybook\/|storybook|StoryObj|Meta<|satisfies\s+Meta|defineMeta|<Story\b|args\s*:|argTypes\s*:|decorators\s*:|parameters\s*:|loaders\s*:|tags\s*:|play\s*:|build-storybook|test-storybook|chromatic|composeStor(?:y|ies)|setProjectAnnotations)/i.test(text);
}

function storybookStoryFiles(sourceFiles: StorybookSourceFile[]): StorybookReport["storyFiles"] {
  return sourceFiles
    .filter((source) => /\.(stories|story)\.(ts|tsx|js|jsx|mjs|cjs|mdx|svelte|vue)$/i.test(source.filePath) || storybookStoryContent(source.text))
    .map((source) => ({
      filePath: source.filePath,
      format: storybookStoryFormat(source.filePath, source.text),
      readiness: storybookStoryContent(source.text) ? "ready" as const : "partial" as const,
      evidence: storybookStoryEvidence(source.filePath, source.text),
      sourceHref: source.sourceHref
    }))
    .slice(0, 100);
}

function storybookStoryContent(text: string): boolean {
  return /export\s+default|defineMeta|<Meta\b|export\s+const\s+[A-Z]\w+|StoryObj|satisfies\s+Meta|args\s*:|play\s*:/i.test(text)
    && /(@storybook\/|StoryObj|Meta<|defineMeta|<Story\b|\.stories\.|args\s*:|render\s*:|play\s*:)/i.test(text);
}

function storybookStoryFormat(filePath: string, text: string): StorybookReport["storyFiles"][number]["format"] {
  if (/\.mdx$/i.test(filePath) || /<Meta\b|<Story\b/i.test(text)) return "mdx";
  if (/defineMeta|@storybook\/addon-svelte-csf/i.test(text) || /\.stories\.svelte$/i.test(filePath)) return "svelte-csf";
  if (/StoryObj|satisfies\s+Meta|export\s+const\s+\w+\s*:\s*Story|export\s+const\s+\w+\s*=\s*\{/i.test(text)) return "csf3";
  if (/\.bind\(\{\}\)|Template\.bind|StoryFn|ComponentStory/i.test(text)) return "csf2";
  if (/storiesOf\s*\(/i.test(text)) return "legacy";
  return "unknown";
}

function storybookStoryEvidence(filePath: string, text: string): string {
  if (/StoryObj|satisfies\s+Meta/i.test(text)) return `${filePath} uses typed CSF story objects.`;
  if (/defineMeta|@storybook\/addon-svelte-csf/i.test(text)) return `${filePath} uses Svelte CSF metadata.`;
  if (/<Meta\b|<Story\b/i.test(text)) return `${filePath} uses MDX story/doc blocks.`;
  if (/play\s*:/i.test(text)) return `${filePath} includes play function evidence.`;
  if (/args\s*:/i.test(text)) return `${filePath} exposes args for interactive story states.`;
  return `${filePath} is a Storybook-shaped story file.`;
}

function storybookConfigFiles(sourceFiles: StorybookSourceFile[]): StorybookReport["configFiles"] {
  const rows: StorybookReport["configFiles"] = [];
  for (const source of sourceFiles) {
    const configType = storybookConfigType(source.filePath, source.text);
    if (configType === "unknown") continue;
    rows.push({
      filePath: source.filePath,
      configType,
      readiness: storybookConfigReadiness(configType, source.text),
      evidence: storybookConfigEvidence(source.filePath, configType, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function storybookConfigType(filePath: string, text: string): StorybookReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath);
  if (/^main\.[cm]?[jt]sx?$/i.test(base) && filePath.includes(".storybook/")) return "main";
  if (/^preview\.[cm]?[jt]sx?$/i.test(base) && filePath.includes(".storybook/")) return "preview";
  if (/^manager\.[cm]?[jt]sx?$/i.test(base) && filePath.includes(".storybook/")) return "manager";
  if (/test-runner-jest\.config/i.test(base) || /test-storybook|@storybook\/test-runner/i.test(text)) return "test-runner";
  if (/vitest\.config\.storybook/i.test(base) || /storybook\/experimental-addon-test|@storybook\/addon-vitest/i.test(text)) return "vitest";
  if (/^package\.json$/i.test(base) && /storybook|build-storybook|test-storybook|chromatic/i.test(text)) return "package-script";
  return "unknown";
}

function storybookConfigReadiness(configType: StorybookReport["configFiles"][number]["configType"], text: string): StorybookReport["configFiles"][number]["readiness"] {
  if (configType === "main" && /stories\s*:|framework\s*:|addons\s*:/i.test(text)) return "ready";
  if (configType === "preview" && /decorators|parameters|globalTypes|tags/i.test(text)) return "ready";
  if (configType === "package-script" && /storybook|build-storybook|test-storybook/i.test(text)) return "ready";
  if (configType === "test-runner" || configType === "vitest" || configType === "manager") return "ready";
  return "partial";
}

function storybookConfigEvidence(filePath: string, configType: StorybookReport["configFiles"][number]["configType"], text: string): string {
  if (configType === "main") return `${filePath} configures stories, framework, addons, or build features.`;
  if (configType === "preview") return `${filePath} configures global decorators, parameters, tags, or toolbar globals.`;
  if (configType === "manager") return `${filePath} customizes the Storybook manager UI.`;
  if (configType === "test-runner") return `${filePath} configures or invokes Storybook test-runner.`;
  if (configType === "vitest") return `${filePath} configures Storybook Test or Vitest browser mode.`;
  if (/build-storybook/i.test(text)) return `${filePath} exposes a static Storybook build command.`;
  return `${filePath} contains Storybook package script evidence.`;
}

function storybookAnnotations(sourceFiles: StorybookSourceFile[]): StorybookReport["storyAnnotations"] {
  const specs: Array<{ annotation: StorybookReport["storyAnnotations"][number]["annotation"]; pattern: RegExp; evidence: string }> = [
    { annotation: "component", pattern: /component\s*:/i, evidence: "component metadata is present for docs and prop inference." },
    { annotation: "title", pattern: /title\s*:/i, evidence: "static title metadata is present for story hierarchy." },
    { annotation: "args", pattern: /args\s*:/i, evidence: "args are used to model component states." },
    { annotation: "argTypes", pattern: /argTypes\s*:/i, evidence: "argTypes customize Controls and docs metadata." },
    { annotation: "parameters", pattern: /parameters\s*:/i, evidence: "parameters configure addons or story rendering." },
    { annotation: "decorators", pattern: /decorators\s*:/i, evidence: "decorators wrap stories with layout, providers, or mocks." },
    { annotation: "loaders", pattern: /loaders\s*:/i, evidence: "loaders prepare data before stories render." },
    { annotation: "tags", pattern: /tags\s*:|autodocs/i, evidence: "tags or autodocs annotations are present." },
    { annotation: "render", pattern: /render\s*:/i, evidence: "custom render functions are present." },
    { annotation: "play", pattern: /play\s*:|async\s+\(\s*\{\s*canvas/i, evidence: "play functions capture post-render interaction steps." },
    { annotation: "name", pattern: /name\s*:/i, evidence: "story display name overrides are present." },
    { annotation: "subcomponents", pattern: /subcomponents\s*:/i, evidence: "subcomponent documentation metadata is present." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      annotation: spec.annotation,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.annotation} annotation evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

function storybookAddonSignals(sourceFiles: StorybookSourceFile[]): StorybookReport["addonSignals"] {
  const specs: Array<{ addon: StorybookReport["addonSignals"][number]["addon"]; pattern: RegExp; evidence: string }> = [
    { addon: "docs", pattern: /@storybook\/addon-docs|autodocs|docs\s*:/i, evidence: "Docs or Autodocs addon evidence was detected." },
    { addon: "controls", pattern: /@storybook\/addon-controls|controls\s*:|argTypes\s*:/i, evidence: "Controls addon or argTypes evidence was detected." },
    { addon: "actions", pattern: /@storybook\/addon-actions|actions\s*:|fn\(\)|argTypesRegex/i, evidence: "Actions or spy function evidence was detected." },
    { addon: "interactions", pattern: /@storybook\/addon-interactions|play\s*:|storybook\/test/i, evidence: "Interactions panel or play-function testing evidence was detected." },
    { addon: "a11y", pattern: /@storybook\/addon-a11y|a11y\s*:|accessibility/i, evidence: "A11y addon evidence was detected." },
    { addon: "viewport", pattern: /@storybook\/addon-viewport|viewport\s*:|globalTypes/i, evidence: "Viewport or globals toolbar evidence was detected." },
    { addon: "backgrounds", pattern: /@storybook\/addon-backgrounds|backgrounds\s*:/i, evidence: "Backgrounds addon evidence was detected." },
    { addon: "measure", pattern: /@storybook\/addon-measure|measure/i, evidence: "Measure addon evidence was detected." },
    { addon: "outline", pattern: /@storybook\/addon-outline|outline/i, evidence: "Outline addon evidence was detected." },
    { addon: "coverage", pattern: /@storybook\/addon-coverage|coverage/i, evidence: "Coverage addon evidence was detected." },
    { addon: "vitest", pattern: /@storybook\/addon-vitest|storybook\/experimental-addon-test|vitest/i, evidence: "Storybook Test or Vitest addon evidence was detected." },
    { addon: "test-runner", pattern: /@storybook\/test-runner|test-storybook/i, evidence: "Storybook test-runner evidence was detected." },
    { addon: "chromatic", pattern: /chromatic|@chromatic-com\/storybook/i, evidence: "Chromatic visual testing or publish evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      addon: spec.addon,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.addon} addon evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

function storybookTestSignals(sourceFiles: StorybookSourceFile[]): StorybookReport["testSignals"] {
  const specs: Array<{ signal: StorybookReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "render-tests", pattern: /\.stories\.|render test|stories are tests/i, evidence: "stories can act as browser render tests." },
    { signal: "interaction-tests", pattern: /play\s*:|userEvent|within\(|canvas\.|expect\(/i, evidence: "interaction testing evidence was detected." },
    { signal: "accessibility-tests", pattern: /@storybook\/addon-a11y|a11y|axe|accessibility/i, evidence: "accessibility testing evidence was detected." },
    { signal: "visual-tests", pattern: /chromatic|visual test|toHaveScreenshot|snapshot/i, evidence: "visual testing evidence was detected." },
    { signal: "snapshot-tests", pattern: /toMatchSnapshot|snapshot test|__snapshots__|serializer/i, evidence: "snapshot testing evidence was detected." },
    { signal: "coverage", pattern: /coverage|@storybook\/addon-coverage|--coverage/i, evidence: "coverage reporting evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|CI\b|upload-artifact|pull_request|storybook.*test/i, evidence: "CI workflow evidence was detected." },
    { signal: "storybook-test", pattern: /vitest --project=storybook|@storybook\/addon-vitest|storybook\/experimental-addon-test/i, evidence: "Storybook Test with Vitest evidence was detected." },
    { signal: "portable-stories", pattern: /composeStor(?:y|ies)|setProjectAnnotations|@storybook\/.*\/testing|portable stories/i, evidence: "portable stories reuse evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

function storybookPublishSignals(sourceFiles: StorybookSourceFile[]): StorybookReport["publishSignals"] {
  const specs: Array<{ signal: StorybookReport["publishSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "build-storybook", pattern: /build-storybook|storybook build|--output-dir/i, evidence: "static Storybook build command is configured." },
    { signal: "storybook-static", pattern: /storybook-static|static storybook|dist-storybook/i, evidence: "static Storybook output path is referenced." },
    { signal: "chromatic", pattern: /chromatic|@chromatic-com\/storybook/i, evidence: "Chromatic publish or visual review is configured." },
    { signal: "composition", pattern: /storybook composition|refs\s*:|storybook composition/i, evidence: "Storybook composition evidence was detected." },
    { signal: "refs", pattern: /refs\s*:/i, evidence: "refs are configured for composed Storybooks." },
    { signal: "static-dirs", pattern: /staticDirs\s*:/i, evidence: "static asset directories are configured." },
    { signal: "docs-mode", pattern: /docsMode\s*:|--docs/i, evidence: "docs-only mode evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

async function buildDesignTokensReport(
  walk: WalkResult,
  storybookReport: StorybookReport
): Promise<DesignTokensReport> {
  const sourceFiles = await designTokenSourceFiles(walk);
  const tokenSources = designTokenSources(sourceFiles);
  const tokenCategories = designTokenCategories(sourceFiles);
  const platformTargets = designTokenPlatformTargets(sourceFiles);
  const transformSignals = designTokenTransformSignals(sourceFiles);
  const usageSignals = designTokenUsageSignals(sourceFiles, storybookReport);
  const governanceSignals = designTokenGovernanceSignals(sourceFiles);
  const hasTokenSource = tokenSources.some((item) => item.readiness === "ready");
  const hasPlatform = platformTargets.some((item) => item.readiness === "ready");
  const hasTransform = transformSignals.some((item) => ["transform-group", "transforms", "formats"].includes(item.signal) && item.readiness === "ready");
  const hasUsage = usageSignals.some((item) => item.readiness === "ready");
  const hasGovernance = governanceSignals.some((item) => ["aliases", "comments", "deprecation", "multi-brand", "themes"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: DesignTokensReport["riskQueue"] = [];
  if (!hasTokenSource) {
    riskQueue.push({
      priority: "high",
      action: "Add a canonical design token source such as tokens/**/*.json or a Style Dictionary config.",
      why: "Generated styles are only trustworthy when design values have a single source of truth.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasPlatform) {
    riskQueue.push({
      priority: "high",
      action: "Define Style Dictionary platforms with buildPath, files, destination, and format outputs.",
      why: "Tokens need explicit platform targets before they can reach CSS, Android, iOS, JS, or docs.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasTransform) {
    riskQueue.push({
      priority: "medium",
      action: "Choose transformGroup or transforms and output formats for each target platform.",
      why: "Raw token values often need naming, unit, color, or platform transforms before use.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasUsage) {
    riskQueue.push({
      priority: "medium",
      action: "Connect generated tokens to CSS variables, theme providers, Tailwind config, components, or Storybook docs.",
      why: "A token build that is never consumed will drift from the real UI.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasGovernance) {
    riskQueue.push({
      priority: "low",
      action: "Add naming, alias, comment, theme, deprecation, or release governance for tokens.",
      why: "Design tokens become shared API; governance prevents breaking style changes.",
      relatedHref: "html/design-tokens.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the token build in the original repository before treating this report as design-system parity.",
    why: "RepoTutor only performs static readiness analysis and never executes Style Dictionary.",
    relatedHref: "html/design-tokens.html"
  });

  return {
    summary: `Style Dictionary식 design token readiness report: token source ${tokenSources.length}개, platform target ${platformTargets.length}개, transform signal ${transformSignals.length}개, usage signal ${usageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Style Dictionary design tokens source include platforms transformGroup transforms buildPath files formats CTI aliases multi-platform CSS Android iOS",
    tokenSources,
    tokenCategories,
    platformTargets,
    transformSignals,
    usageSignals,
    governanceSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm install -D style-dictionary", purpose: "Install Style Dictionary as the design token build tool." },
      { command: "style-dictionary init basic", purpose: "Create a starter token source and multi-platform config." },
      { command: "style-dictionary build --config config.json", purpose: "Build all configured token platforms." },
      { command: "style-dictionary build --platform css", purpose: "Build one target platform while iterating on transforms or formats." },
      { command: "git diff -- build/", purpose: "Review generated token artifacts before publishing them." }
    ],
    learnerNextSteps: [
      "먼저 canonical token source와 Style Dictionary config가 분리되어 있는지 확인하세요.",
      "source/include, platforms, transformGroup, buildPath, files, format이 한 흐름으로 이어지는지 보세요.",
      "color/size/font 같은 token category와 alias reference가 실제 UI 사용처까지 연결되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 token output은 원본 repo에서 Style Dictionary build로 확인하세요."
    ]
  };
}

type DesignTokenSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function designTokenSourceFiles(walk: WalkResult): Promise<DesignTokenSourceFile[]> {
  const files: DesignTokenSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !designTokenInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!designTokenPathSignal(file.relPath) && !designTokenContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 160) break;
  }
  return files;
}

function designTokenInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|config\.(json|js|cjs|mjs|ts)|style-dictionary\.(config\.)?(json|js|cjs|mjs|ts)|tokens\.(json|js|cjs|mjs|ts)|tailwind\.config\.[cm]?[jt]s)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(tokens?|design-tokens?|style-dictionary|theme|themes|styles|css|scss|sass)\//i.test(filePath)
    || /\.(json|ya?ml|ts|tsx|js|jsx|mjs|cjs|css|scss|sass|md|mdx)$/i.test(filePath);
}

function designTokenPathSignal(filePath: string): boolean {
  return /(style-dictionary|design-tokens?|tokens?\/|\/tokens?|theme|themes|variables|primitives|semantic|css\/variables|tailwind\.config|colors?|typography|spacing|radius|shadow)/i.test(filePath);
}

function designTokenContentSignal(text: string): boolean {
  return /(style-dictionary|source\s*:|include\s*:|platforms\s*:|transformGroup|transforms\s*:|buildPath|destination\s*:|format\s*:|css\/variables|scss\/variables|android\/|ios-|ios\/|compose\/|registerTransform|registerFormat|registerParser|outputReferences|usesDtcg|DTCG|\$type|["']value["']|--[a-z0-9-]+:\s*|theme\s*:|colors\s*:|spacing\s*:|fontSize\s*:)/i.test(text);
}

function designTokenSources(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["tokenSources"] {
  const rows: DesignTokensReport["tokenSources"] = [];
  for (const source of sourceFiles) {
    const format = designTokenSourceFormat(source.filePath, source.text);
    if (format === "unknown" && !/["']value["']|\$type|--[a-z0-9-]+:\s*/i.test(source.text)) continue;
    rows.push({
      filePath: source.filePath,
      format,
      readiness: format === "unknown" ? "partial" : "ready",
      evidence: designTokenSourceEvidence(source.filePath, format, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function designTokenSourceFormat(filePath: string, text: string): DesignTokensReport["tokenSources"][number]["format"] {
  if (/style-dictionary|platforms\s*:|transformGroup|buildPath|source\s*:/i.test(text) || /style-dictionary|config\.(json|js|cjs|mjs|ts)$/i.test(filePath)) return "style-dictionary-config";
  if (/usesDtcg|DTCG|\$type|\$value/i.test(text)) return "dtcg-json";
  if (/tokens?\.(js|cjs|mjs|ts)$/i.test(filePath)) return "tokens-js";
  if (/tokens?.*\.json|design-tokens?.*\.json/i.test(filePath) || /["']value["']\s*:/i.test(text)) return "tokens-json";
  if (/--[a-z0-9-]+:\s*[^;]+;/i.test(text) || /\.css$/i.test(filePath)) return "css-custom-properties";
  if (/tailwind\.config/i.test(filePath) || /theme\s*:|colors\s*:|spacing\s*:|fontSize\s*:/i.test(text)) return "tailwind-theme";
  if (/\$[a-z0-9_-]+:\s*[^;]+;/i.test(text) || /\.(scss|sass)$/i.test(filePath)) return "sass-variables";
  return "unknown";
}

function designTokenSourceEvidence(filePath: string, format: DesignTokensReport["tokenSources"][number]["format"], text: string): string {
  if (format === "style-dictionary-config") return `${filePath} configures Style Dictionary source/platform/build output.`;
  if (format === "dtcg-json") return `${filePath} contains DTCG-style token metadata.`;
  if (format === "tokens-json" || format === "tokens-js") return `${filePath} contains token value objects.`;
  if (format === "css-custom-properties") return `${filePath} exposes CSS custom property tokens.`;
  if (format === "tailwind-theme") return `${filePath} exposes Tailwind theme tokens.`;
  if (format === "sass-variables") return `${filePath} exposes Sass variable tokens.`;
  if (/["']value["']|\$type/i.test(text)) return `${filePath} contains token-shaped value metadata.`;
  return `${filePath} is a design-token-shaped source candidate.`;
}

function designTokenCategories(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["tokenCategories"] {
  const specs: Array<{ category: DesignTokensReport["tokenCategories"][number]["category"]; pattern: RegExp; evidence: string }> = [
    { category: "color", pattern: /color|colors|#[0-9a-f]{3,8}|rgb\(|hsl\(|\$type["']?\s*:\s*["']color/i, evidence: "color token evidence was detected." },
    { category: "size", pattern: /\bsize\b|sizing|dimension|\d+(px|rem|em|dp|sp)/i, evidence: "size/dimension token evidence was detected." },
    { category: "dimension", pattern: /dimension|\$type["']?\s*:\s*["']dimension/i, evidence: "DTCG dimension token evidence was detected." },
    { category: "typography", pattern: /typography|fontFamily|fontWeight|lineHeight|letterSpacing/i, evidence: "typography token evidence was detected." },
    { category: "font", pattern: /\bfont\b|fontSize|font-size|font-weight/i, evidence: "font token evidence was detected." },
    { category: "spacing", pattern: /spacing|space|gap|padding|margin/i, evidence: "spacing token evidence was detected." },
    { category: "border", pattern: /border|stroke/i, evidence: "border token evidence was detected." },
    { category: "radius", pattern: /radius|borderRadius|rounded/i, evidence: "radius token evidence was detected." },
    { category: "shadow", pattern: /shadow|boxShadow|elevation/i, evidence: "shadow/elevation token evidence was detected." },
    { category: "motion", pattern: /motion|duration|easing|transition|animation/i, evidence: "motion token evidence was detected." },
    { category: "opacity", pattern: /opacity|alpha/i, evidence: "opacity token evidence was detected." },
    { category: "breakpoint", pattern: /breakpoint|screen|media/i, evidence: "breakpoint token evidence was detected." },
    { category: "asset", pattern: /asset|icon|image|font-face|base64/i, evidence: "asset token evidence was detected." },
    { category: "z-index", pattern: /zIndex|z-index|layer/i, evidence: "z-index token evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      category: spec.category,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.category} token evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

function designTokenPlatformTargets(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["platformTargets"] {
  const specs: Array<{ target: DesignTokensReport["platformTargets"][number]["target"]; pattern: RegExp; evidence: string }> = [
    { target: "css", pattern: /css\/variables|build\/css|\.css|platforms\s*:[\s\S]*css/i, evidence: "CSS token output target is configured or referenced." },
    { target: "scss", pattern: /scss\/variables|sass\/|scss|\.scss/i, evidence: "SCSS/Sass token output target is configured or referenced." },
    { target: "javascript", pattern: /javascript|js\/|\.js|format["']?\s*:\s*["']javascript/i, evidence: "JavaScript token output target is configured or referenced." },
    { target: "typescript", pattern: /typescript|\.d\.ts|\.ts|ts\/definitions/i, evidence: "TypeScript token output target is configured or referenced." },
    { target: "android", pattern: /android\/|build\/android|fontDimens|colors\.xml/i, evidence: "Android token output target is configured." },
    { target: "compose", pattern: /compose\/|StyleDictionary.*\.kt|Kotlin/i, evidence: "Jetpack Compose token output target is configured." },
    { target: "ios", pattern: /ios\/|build\/ios|\.h"|\.m"|UIColor/i, evidence: "iOS Objective-C token output target is configured." },
    { target: "ios-swift", pattern: /ios-swift|SwiftUI|\.swift|enum\.swift|class\.swift/i, evidence: "iOS Swift token output target is configured." },
    { target: "flutter", pattern: /flutter|\.dart/i, evidence: "Flutter token output target is referenced." },
    { target: "react-native", pattern: /react-native|React Native/i, evidence: "React Native token output target is referenced." },
    { target: "docs", pattern: /style documentation|docs|html\/|markdown/i, evidence: "Token documentation output target is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      target: spec.target,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.target} platform target evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

function designTokenTransformSignals(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["transformSignals"] {
  const specs: Array<{ signal: DesignTokensReport["transformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "transform-group", pattern: /transformGroup/i, evidence: "transformGroup is configured." },
    { signal: "transforms", pattern: /transforms\s*:/i, evidence: "explicit transform list is configured." },
    { signal: "formats", pattern: /format\s*:|formats\./i, evidence: "output formats are configured." },
    { signal: "build-path", pattern: /buildPath/i, evidence: "buildPath output directory is configured." },
    { signal: "files", pattern: /files\s*:|destination\s*:/i, evidence: "generated output files are configured." },
    { signal: "filters", pattern: /filter\s*:|\$type/i, evidence: "file/token filters are configured." },
    { signal: "custom-transform", pattern: /registerTransform|transformTypes|custom transform/i, evidence: "custom transform evidence was detected." },
    { signal: "custom-format", pattern: /registerFormat|custom format/i, evidence: "custom format evidence was detected." },
    { signal: "custom-parser", pattern: /registerParser|custom parser|yaml tokens/i, evidence: "custom parser evidence was detected." },
    { signal: "output-references", pattern: /outputReferences|references|aliasing|\{[a-z0-9_.-]+\}/i, evidence: "alias/reference output evidence was detected." },
    { signal: "expand", pattern: /expand\s*:|expanded tokens/i, evidence: "token expansion evidence was detected." },
    { signal: "dtcg", pattern: /DTCG|usesDtcg|\$value|\$type/i, evidence: "DTCG token compatibility evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} transform evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

function designTokenUsageSignals(
  sourceFiles: DesignTokenSourceFile[],
  storybookReport: StorybookReport
): DesignTokensReport["usageSignals"] {
  const specs: Array<{ signal: DesignTokensReport["usageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "css-variables", pattern: /var\(--|css\/variables|--[a-z0-9-]+:/i, evidence: "CSS variable token consumption is referenced." },
    { signal: "theme-provider", pattern: /ThemeProvider|theme provider|createTheme|ConfigProvider/i, evidence: "theme provider token consumption is referenced." },
    { signal: "tailwind-config", pattern: /tailwind\.config|theme\s*:|colors\s*:|spacing\s*:/i, evidence: "Tailwind theme token consumption is referenced." },
    { signal: "component-style", pattern: /styled\.|className|style=|\.module\.css|emotion|styled-components/i, evidence: "component style consumption evidence was detected." },
    { signal: "storybook", pattern: /storybook|\.stories\.|autodocs/i, evidence: "Storybook documentation or preview consumption is referenced." },
    { signal: "docs", pattern: /style documentation|design token docs|mdx|docs/i, evidence: "token documentation consumption is referenced." },
    { signal: "package-script", pattern: /style-dictionary build|build:tokens|tokens:build/i, evidence: "package script invokes token build." },
    { signal: "build-output", pattern: /build\/|dist\/|generated|do not edit/i, evidence: "generated token output path is referenced." }
  ];
  const hasStorybook = storybookReport.storyFiles.length > 0 || storybookReport.configFiles.length > 0;
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : hasStorybook && ["storybook", "docs", "component-style"].includes(spec.signal) ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} usage evidence was not detected.`,
      relatedHref: match?.sourceHref ?? (hasStorybook ? "html/storybook.html" : "html/design-tokens.html")
    };
  });
}

function designTokenGovernanceSignals(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["governanceSignals"] {
  const specs: Array<{ signal: DesignTokensReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cti-structure", pattern: /category\/type\/item|attribute\/cti|cti|color[\\s\\S]{0,80}background|size[\\s\\S]{0,80}font/i, evidence: "CTI naming/category structure evidence was detected." },
    { signal: "aliases", pattern: /\{[a-z0-9_.-]+\}|alias|references?/i, evidence: "alias/reference governance evidence was detected." },
    { signal: "comments", pattern: /comment\s*:|description\s*:|\$description/i, evidence: "token comments or descriptions are present." },
    { signal: "themes", pattern: /theme|themes|dark|light|mode/i, evidence: "theme/mode token evidence was detected." },
    { signal: "multi-brand", pattern: /multi-brand|brand|brands/i, evidence: "multi-brand token evidence was detected." },
    { signal: "deprecation", pattern: /deprecated|deprecation/i, evidence: "token deprecation evidence was detected." },
    { signal: "npm-module", pattern: /npm module|publishConfig|package\.json|npm publish/i, evidence: "token package publish evidence was detected." },
    { signal: "ci-build", pattern: /\.github\/workflows|style-dictionary build|build:tokens|tokens:build/i, evidence: "CI or scripted token build evidence was detected." },
    { signal: "s3-publish", pattern: /s3|aws/i, evidence: "remote token artifact publish evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} governance evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

function advisoryEcosystemForPackage(packageType: string, fallback: string): string {
  const normalized = packageType.toLowerCase();
  if (normalized === "npm") return "npm";
  if (normalized === "pypi") return "PyPI";
  if (normalized === "cargo") return "crates.io";
  if (normalized === "go") return "Go";
  if (normalized === "maven") return "Maven";
  if (normalized === "composer") return "Packagist";
  if (normalized === "nuget") return "NuGet";
  if (normalized === "gem") return "RubyGems";
  return fallback;
}

function advisoryEcosystemForLockfile(filePath: string): string {
  const base = path.basename(filePath);
  if (["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock"].includes(base)) return "npm";
  if (base === "Cargo.lock") return "crates.io";
  if (["poetry.lock", "Pipfile.lock", "pdm.lock", "uv.lock", "pylock.toml"].includes(base)) return "PyPI";
  if (base === "go.sum" || base === "go.mod") return "Go";
  if (base === "composer.lock") return "Packagist";
  if (base === "Gemfile.lock" || base === "gems.locked") return "RubyGems";
  if (base === "packages.lock.json" || base === "packages.config") return "NuGet";
  if (base === "pom.xml" || base === "gradle.lockfile") return "Maven";
  return "unknown";
}

function advisoryPackageCountForLockfile(filePath: string, sbomReport: SbomReport): number {
  const directory = path.posix.dirname(filePath);
  const ecosystem = advisoryEcosystemForLockfile(filePath);
  return sbomReport.packageArtifacts.filter((pkg) => {
    const sameDirectory = pkg.locations.some((location) => path.posix.dirname(location) === directory);
    const sameEcosystem = advisoryEcosystemForPackage(pkg.packageType, pkg.ecosystem) === ecosystem;
    return sameDirectory || sameEcosystem;
  }).length;
}

function isOsvScannerConfigFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "osv-scanner.toml" || base === ".osv-scanner.toml";
}

async function buildScorecardReport(
  walk: WalkResult,
  licenseRightsReport: LicenseRightsReport,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport
): Promise<ScorecardReport> {
  const securityPolicyFiles = walk.files.filter((file) => /(^|\/)(SECURITY|security)\.md$/i.test(file.relPath));
  const workflowFiles = walk.files.filter((file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file.relPath));
  const testFiles = walk.files.filter((file) => /(^|\/)(__tests__|tests?|spec)\/|(\.test|\.spec)\.[cm]?[jt]sx?$/i.test(file.relPath));
  const dependencyUpdateFiles = walk.files.filter((file) => /(^|\/)(dependabot\.ya?ml|renovate\.json|renovate\.json5|\.renovaterc(?:\.json)?|\.github\/renovate\.json)$/i.test(file.relPath));
  const sastFiles = walk.files.filter((file) => /(^|\/)(codeql|semgrep|snyk|sonar-project|\.snyk|\.semgrep)\b/i.test(file.relPath));
  const binaryArtifacts = walk.files.filter((file) => /\.(exe|dll|dylib|so|class|pyc|jar|war|ear|min\.js)$/i.test(file.relPath));
  const packageRanges = await packageDependencyRangeSignals(walk);
  const scriptSignals = await packageJsonScriptSignals(walk);
  const workflowSignals = await workflowSafetySignals(workflowFiles);
  const hasLicenseEvidence = Boolean(licenseRightsReport.detectedProjectLicense.spdxId);
  const hasPackageInventory = sbomReport.packageArtifacts.length > 0;
  const hasLockfile = sbomReport.fileArtifacts.some((artifact) => artifact.artifactKind === "lockfile");
  const dangerousWorkflowEvidence = workflowSignals.dangerousFiles.length > 0
    ? `${workflowSignals.dangerousFiles.join(", ")} workflow uses pull_request_target with checkout/script patterns.`
    : workflowFiles.length > 0
      ? `${workflowFiles.length} workflow file(s) found without the dangerous static pattern.`
      : "No GitHub workflow files were detected, so dangerous workflow analysis is inconclusive.";

  const checks: ScorecardReport["checks"] = [
    {
      name: "Maintained",
      score: walk.files.length > 0 ? 8 : 0,
      status: walk.files.length > 0 ? "pass" : "fail",
      risk: "low",
      evidence: walk.files.length > 0 ? `${walk.files.length} safe source file(s) are present in the study snapshot.` : "No source files were available in the safe snapshot.",
      remediation: "Keep release, issue, and commit freshness checks in the original repository before depending on this project.",
      relatedHref: "html/project-activity.html"
    },
    {
      name: "License",
      score: hasLicenseEvidence ? 10 : licenseRightsReport.packageLicenseSignals.length > 0 ? 4 : 0,
      status: hasLicenseEvidence ? "pass" : licenseRightsReport.packageLicenseSignals.length > 0 ? "partial" : "fail",
      risk: "medium",
      evidence: hasLicenseEvidence ? `Project license detected as ${licenseRightsReport.detectedProjectLicense.spdxId}.` : licenseRightsReport.packageLicenseSignals.length > 0 ? "Package metadata has license hints, but no project-level license was detected." : "No project license evidence was detected.",
      remediation: "Add or verify a project-level LICENSE file and keep package metadata aligned.",
      relatedHref: "html/license-rights.html"
    },
    {
      name: "SBOM",
      score: hasPackageInventory && hasLockfile ? 10 : hasPackageInventory ? 6 : 0,
      status: hasPackageInventory && hasLockfile ? "pass" : hasPackageInventory ? "partial" : "fail",
      risk: "medium",
      evidence: `${sbomReport.packageArtifacts.length} package artifact(s), ${sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile").length} lockfile artifact(s).`,
      remediation: "Generate a full CycloneDX/SPDX/Syft SBOM when distribution or security review requires resolved components.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "Security-Policy",
      score: securityPolicyFiles.length > 0 ? 10 : 0,
      status: securityPolicyFiles.length > 0 ? "pass" : "fail",
      risk: "high",
      evidence: securityPolicyFiles.length > 0 ? `Security policy file(s): ${securityPolicyFiles.map((file) => file.relPath).join(", ")}.` : "No SECURITY.md file was detected.",
      remediation: "Add SECURITY.md with supported versions and vulnerability disclosure instructions.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "CI-Tests",
      score: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? 10 : testFiles.length > 0 || scriptSignals.testScripts > 0 ? 5 : 0,
      status: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? "pass" : testFiles.length > 0 || scriptSignals.testScripts > 0 ? "partial" : "fail",
      risk: "low",
      evidence: `${workflowFiles.length} workflow file(s), ${scriptSignals.testScripts} package test script(s), ${testFiles.length} test file(s).`,
      remediation: "Check in test commands and run them in CI on every pull request.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Pinned-Dependencies",
      score: packageRanges.total === 0 ? null : packageRanges.unpinned === 0 && hasLockfile ? 10 : packageRanges.unpinned === 0 ? 7 : 2,
      status: packageRanges.total === 0 ? "unknown" : packageRanges.unpinned === 0 && hasLockfile ? "pass" : packageRanges.unpinned === 0 ? "partial" : "fail",
      risk: "medium",
      evidence: packageRanges.total === 0 ? "No supported dependency range fields were found." : `${packageRanges.pinned}/${packageRanges.total} dependency range(s) look exact; unpinned examples: ${packageRanges.examples.join(", ") || "none"}.`,
      remediation: "Pin direct dependency ranges or keep a package-manager lockfile so resolved versions are reviewable.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "Dependency-Update-Tool",
      score: dependencyUpdateFiles.length > 0 ? 10 : 0,
      status: dependencyUpdateFiles.length > 0 ? "pass" : "fail",
      risk: "medium",
      evidence: dependencyUpdateFiles.length > 0 ? `Dependency update config(s): ${dependencyUpdateFiles.map((file) => file.relPath).join(", ")}.` : "No Dependabot or Renovate config was detected.",
      remediation: "Add Dependabot or Renovate so dependency updates arrive as reviewable pull requests.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "SAST",
      score: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? 10 : 0,
      status: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? "pass" : "fail",
      risk: "medium",
      evidence: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? `SAST signal(s): ${[...sastFiles.map((file) => file.relPath), ...workflowSignals.sastMentions].join(", ")}.` : "No CodeQL, Semgrep, Snyk, Sonar, or similar SAST signal was detected.",
      remediation: "Add a SAST workflow or document an equivalent static analysis step.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Binary-Artifacts",
      score: binaryArtifacts.length === 0 ? 10 : 0,
      status: binaryArtifacts.length === 0 ? "pass" : "fail",
      risk: "high",
      evidence: binaryArtifacts.length === 0 ? "No generated binary artifact extensions were detected in the safe snapshot." : `Binary-like artifact(s): ${binaryArtifacts.slice(0, 8).map((file) => file.relPath).join(", ")}.`,
      remediation: "Remove generated binaries from source or document reproducible build provenance.",
      relatedHref: "html/files.html"
    },
    {
      name: "Dangerous-Workflow",
      score: workflowFiles.length === 0 ? null : workflowSignals.dangerousFiles.length === 0 ? 10 : 0,
      status: workflowFiles.length === 0 ? "unknown" : workflowSignals.dangerousFiles.length === 0 ? "pass" : "fail",
      risk: "high",
      evidence: dangerousWorkflowEvidence,
      remediation: "Avoid pull_request_target workflows that check out or execute untrusted pull request code.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Branch-Protection",
      score: null,
      status: "unknown",
      risk: "high",
      evidence: "Branch protection requires live source-host provider settings and cannot be proven from the safe local source snapshot.",
      remediation: "Verify branch rules or rulesets in GitHub/GitLab with required reviews, status checks, and force-push protection.",
      relatedHref: "html/project-activity.html"
    },
    {
      name: "Code-Review",
      score: null,
      status: "unknown",
      risk: "high",
      evidence: "Code review enforcement requires provider pull request or merge request history.",
      remediation: "Verify required human review on protected branches in the original repository.",
      relatedHref: "html/project-activity.html"
    }
  ];

  const categoryScores: ScorecardReport["categoryScores"] = [
    scorecardCategory("source", ["Maintained", "Binary-Artifacts", "License"], checks, "Source hygiene combines maintained source, binary artifact absence, and license evidence.", "html/files.html"),
    scorecardCategory("build", ["CI-Tests", "Dangerous-Workflow"], checks, "Build hygiene checks whether tests and workflow safety are visible.", "html/security-readiness.html"),
    scorecardCategory("dependency", ["SBOM", "Pinned-Dependencies", "Dependency-Update-Tool"], checks, "Dependency hygiene combines inventory, pinning, lockfiles, and update automation.", "html/sbom.html"),
    scorecardCategory("security", ["Security-Policy", "SAST", "Branch-Protection", "Code-Review"], checks, "Security hygiene separates local evidence from provider-only controls.", "html/security-readiness.html"),
    scorecardCategory("maintenance", ["Maintained", "Dependency-Update-Tool"], checks, "Maintenance hygiene tracks whether the project leaves future upkeep signals.", "html/project-activity.html")
  ];

  const policyFindings: ScorecardReport["policyFindings"] = [
    {
      policy: "Project has discoverable license evidence",
      result: hasLicenseEvidence ? "pass" : "fail",
      evidence: hasLicenseEvidence ? `Detected ${licenseRightsReport.detectedProjectLicense.spdxId}.` : "License Rights report could not detect a project license.",
      relatedHref: "html/license-rights.html"
    },
    {
      policy: "Project has dependency inventory",
      result: hasPackageInventory ? "pass" : "fail",
      evidence: hasPackageInventory ? `${sbomReport.packageArtifacts.length} package artifact(s) recorded.` : "No package artifacts recorded.",
      relatedHref: "html/sbom.html"
    },
    {
      policy: "Project has security disclosure policy",
      result: securityPolicyFiles.length > 0 ? "pass" : "fail",
      evidence: securityPolicyFiles.length > 0 ? securityPolicyFiles.map((file) => file.relPath).join(", ") : "No SECURITY.md file detected.",
      relatedHref: "html/security-readiness.html"
    },
    {
      policy: "Project has automated test signal",
      result: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? "pass" : testFiles.length > 0 || scriptSignals.testScripts > 0 ? "review" : "fail",
      evidence: `${workflowFiles.length} workflow file(s), ${scriptSignals.testScripts} test script(s), ${testFiles.length} test file(s).`,
      relatedHref: "html/security-readiness.html"
    },
    {
      policy: "Provider controls require live verification",
      result: "review",
      evidence: "Branch-Protection and Code-Review are intentionally unknown in a safe local snapshot.",
      relatedHref: "html/project-activity.html"
    }
  ];

  const riskQueue = scorecardRiskQueue(checks, securityReadinessReport);
  const structuredResults: ScorecardReport["structuredResults"] = checks.map((check) => ({
    checkName: check.name,
    probe: `${check.name} static evidence probe`,
    outcome: check.status === "unknown" ? "unknown" : check.status === "fail" ? "negative" : "positive",
    evidence: check.evidence
  }));

  const aggregateScore = scorecardWeightedScore(checks);
  return {
    summary: `OpenSSF Scorecard식 project scorecard: aggregate ${aggregateScore}/10, checks ${checks.length}개, policy finding ${policyFindings.length}개, risk queue ${riskQueue.length}개를 정적 학습 리포트로 정리했습니다.`,
    sourcePattern: "OpenSSF Scorecard checks score 0-10 risk remediation structured results policy measurement",
    aggregateScore,
    checks,
    categoryScores,
    policyFindings,
    riskQueue,
    structuredResults,
    learnerNextSteps: [
      "unknown check는 실패가 아니라 provider API나 repository history가 필요한 항목입니다.",
      "high risk queue부터 확인하고, 관련 License/SBOM/Security Readiness 리포트의 원본 근거를 대조하세요.",
      "이 리포트는 OpenSSF Scorecard 실행 결과가 아니라 RepoTutor의 정적 학습용 사전 점검입니다.",
      "배포, 의존성 채택, 보안 의사결정에는 원본 repository에서 실제 scorecard 도구를 실행하세요."
    ]
  };
}

function scorecardWeightedScore(checks: ScorecardReport["checks"]): number {
  const weights: Record<ScorecardReport["checks"][number]["risk"], number> = {
    critical: 10,
    high: 7.5,
    medium: 5,
    low: 2.5,
    unknown: 1
  };
  const scored = checks.filter((check) => check.score !== null);
  const totalWeight = scored.reduce((sum, check) => sum + weights[check.risk], 0);
  if (totalWeight === 0) return 0;
  const weighted = scored.reduce((sum, check) => sum + (check.score ?? 0) * weights[check.risk], 0) / totalWeight;
  return Number(weighted.toFixed(1));
}

function scorecardCategory(
  category: ScorecardReport["categoryScores"][number]["category"],
  names: string[],
  checks: ScorecardReport["checks"],
  explanation: string,
  relatedHref: string
): ScorecardReport["categoryScores"][number] {
  const selected = checks.filter((check) => names.includes(check.name) && check.score !== null);
  const score = selected.length === 0 ? null : Number((selected.reduce((sum, check) => sum + (check.score ?? 0), 0) / selected.length).toFixed(1));
  return { category, score, explanation, relatedHref };
}

function scorecardRiskQueue(checks: ScorecardReport["checks"], securityReadinessReport: SecurityReadinessReport): ScorecardReport["riskQueue"] {
  const queue: ScorecardReport["riskQueue"] = [];
  for (const check of checks) {
    if (check.status === "pass") continue;
    const priority = check.risk === "high" || check.risk === "critical" ? "high" : check.risk === "medium" ? "medium" : "low";
    if (check.status === "unknown") {
      queue.push({
        priority: "low",
        checkName: check.name,
        action: `Verify ${check.name} in the original source-host provider.`,
        why: check.evidence,
        relatedHref: check.relatedHref
      });
      continue;
    }
    queue.push({
      priority,
      checkName: check.name,
      action: check.remediation,
      why: check.evidence,
      relatedHref: check.relatedHref
    });
  }
  for (const action of securityReadinessReport.actionQueue.filter((item) => item.priority !== "low").slice(0, 3)) {
    queue.push({
      priority: action.priority,
      checkName: "Security-Readiness",
      action: action.action,
      why: action.why,
      relatedHref: action.relatedHref
    });
  }
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.checkName.localeCompare(b.checkName)).slice(0, 12);
}

function buildProvenanceReport(
  context: AnalysisContext,
  walk: WalkResult,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport,
  sourceSnapshotReport: SourceSnapshotReport
): ProvenanceReport {
  const sourceFileCount = sourceSnapshotReport.totalFiles;
  const lockfileCount = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile").length;
  const containerFiles = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "container");
  const signatureFiles = provenanceFiles(walk, isSignatureMaterialFile);
  const bundleFiles = provenanceFiles(walk, isSigstoreBundleFile);
  const certificateFiles = provenanceFiles(walk, isCertificateMaterialFile);
  const publicKeyFiles = provenanceFiles(walk, isPublicKeyMaterialFile);
  const trustedRootFiles = provenanceFiles(walk, isTrustedRootMaterialFile);
  const attestationFiles = provenanceFiles(walk, isAttestationMaterialFile);
  const slsaFiles = attestationFiles.filter((filePath) => /slsa|provenance|intoto|in-toto|\.link/i.test(filePath));
  const spdxFiles = provenanceFiles(walk, (filePath) => /spdx/i.test(filePath));
  const cyclonedxFiles = provenanceFiles(walk, (filePath) => /cyclonedx|cdx/i.test(filePath));
  const vulnFiles = attestationFiles.filter((filePath) => /vuln|vulnerability/i.test(filePath));
  const hasPackageArtifacts = sbomReport.packageArtifacts.length > 0;
  const vulnerabilityScanner = securityReadinessReport.scannerCoverage.find((scanner) => scanner.scanner === "vulnerability");

  const artifactSignals: ProvenanceReport["artifactSignals"] = [
    {
      artifact: "source snapshot",
      artifactType: "source-snapshot",
      readiness: sourceFileCount > 0 ? "ready" : "missing",
      evidence: sourceFileCount > 0 ? `${sourceFileCount} text file digest(s) are recorded in source-snapshot-report.json.` : "No source snapshot digest evidence is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      artifact: "package inventory",
      artifactType: "package",
      readiness: hasPackageArtifacts && lockfileCount > 0 ? "ready" : hasPackageArtifacts ? "partial" : "missing",
      evidence: hasPackageArtifacts ? `${sbomReport.packageArtifacts.length} package artifact(s), ${lockfileCount} lockfile artifact(s).` : "No package artifacts are recorded in the SBOM report.",
      relatedHref: "html/sbom.html"
    },
    {
      artifact: "container image",
      artifactType: "container",
      readiness: containerFiles.length > 0 ? "partial" : "missing",
      evidence: containerFiles.length > 0 ? `${containerFiles.length} container build/config file(s) found; a signed image digest still requires an external registry artifact.` : "No Dockerfile or Compose evidence was detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      artifact: "static SBOM report",
      artifactType: "sbom",
      readiness: hasPackageArtifacts ? "ready" : "missing",
      evidence: hasPackageArtifacts ? "RepoTutor generated static SBOM package evidence that can be exported or signed as a blob." : "The static SBOM report has no package artifacts to sign.",
      relatedHref: "html/sbom.html"
    },
    {
      artifact: "release candidate",
      artifactType: "release",
      readiness: sbomReport.packageManifests.length > 0 || context.commitHash ? "partial" : "missing",
      evidence: sbomReport.packageManifests.length > 0 || context.commitHash ? `Release evidence is partial: ${sbomReport.packageManifests.length} package manifest(s), commit ${context.commitHash?.slice(0, 12) ?? "unknown"}.` : "No package manifest or commit metadata is available for release provenance.",
      relatedHref: "html/project-activity.html"
    },
    {
      artifact: "generic source blob",
      artifactType: "blob",
      readiness: sourceFileCount > 0 ? "ready" : "missing",
      evidence: sourceFileCount > 0 ? "Any generated markdown, JSON, or source digest can be treated as a cosign sign-blob candidate." : "No file digest evidence exists for blob signing.",
      relatedHref: "html/files.html"
    }
  ];

  const signatureSignals: ProvenanceReport["signatureSignals"] = [
    {
      material: "signature",
      readiness: signatureFiles.length > 0 ? "present" : "missing",
      evidence: signatureFiles.length > 0 ? `Detached signature file(s): ${signatureFiles.join(", ")}.` : "No detached signature file such as .sig was detected.",
      relatedHref: signatureFiles[0] ? `source/${encodedPath(signatureFiles[0])}` : "html/provenance.html"
    },
    {
      material: "bundle",
      readiness: bundleFiles.length > 0 ? "present" : "missing",
      evidence: bundleFiles.length > 0 ? `Sigstore bundle file(s): ${bundleFiles.join(", ")}.` : "No Sigstore bundle was detected; bundles are the preferred offline verification material.",
      relatedHref: bundleFiles[0] ? `source/${encodedPath(bundleFiles[0])}` : "html/provenance.html"
    },
    {
      material: "certificate",
      readiness: certificateFiles.length > 0 ? "present" : "missing",
      evidence: certificateFiles.length > 0 ? `Certificate material file(s): ${certificateFiles.join(", ")}.` : "No certificate material was detected outside a possible external bundle.",
      relatedHref: certificateFiles[0] ? `source/${encodedPath(certificateFiles[0])}` : "html/provenance.html"
    },
    {
      material: "public-key",
      readiness: publicKeyFiles.length > 0 ? "present" : "missing",
      evidence: publicKeyFiles.length > 0 ? `Public key file(s): ${publicKeyFiles.join(", ")}.` : "No public key material such as cosign.pub was detected.",
      relatedHref: publicKeyFiles[0] ? `source/${encodedPath(publicKeyFiles[0])}` : "html/provenance.html"
    },
    {
      material: "trusted-root",
      readiness: trustedRootFiles.length > 0 ? "present" : "external",
      evidence: trustedRootFiles.length > 0 ? `Trusted root file(s): ${trustedRootFiles.join(", ")}.` : "Trusted root material usually comes from Sigstore trust-root distribution or an explicit trusted_root.json.",
      relatedHref: trustedRootFiles[0] ? `source/${encodedPath(trustedRootFiles[0])}` : "html/provenance.html"
    },
    {
      material: "transparency-log",
      readiness: bundleFiles.length > 0 ? "present" : "external",
      evidence: bundleFiles.length > 0 ? "A Sigstore bundle can carry transparency log proof for offline verification." : "Transparency log inclusion must be checked through Rekor or a downloaded bundle.",
      relatedHref: bundleFiles[0] ? `source/${encodedPath(bundleFiles[0])}` : "html/provenance.html"
    }
  ];

  const attestationSignals: ProvenanceReport["attestationSignals"] = [
    {
      predicateType: "slsaprovenance",
      readiness: slsaFiles.length > 0 ? "available" : "missing",
      evidence: slsaFiles.length > 0 ? `SLSA/provenance attestation candidate(s): ${slsaFiles.join(", ")}.` : "No SLSA provenance, in-toto, or link attestation file was detected.",
      relatedHref: slsaFiles[0] ? `source/${encodedPath(slsaFiles[0])}` : "html/provenance.html"
    },
    {
      predicateType: "spdx",
      readiness: spdxFiles.length > 0 ? "available" : hasPackageArtifacts ? "partial" : "missing",
      evidence: spdxFiles.length > 0 ? `SPDX artifact(s): ${spdxFiles.join(", ")}.` : hasPackageArtifacts ? "Static SBOM package inventory exists, but no standalone SPDX predicate file was detected." : "No SPDX evidence was detected.",
      relatedHref: spdxFiles[0] ? `source/${encodedPath(spdxFiles[0])}` : "html/sbom.html"
    },
    {
      predicateType: "cyclonedx",
      readiness: cyclonedxFiles.length > 0 ? "available" : hasPackageArtifacts ? "partial" : "missing",
      evidence: cyclonedxFiles.length > 0 ? `CycloneDX artifact(s): ${cyclonedxFiles.join(", ")}.` : hasPackageArtifacts ? "Static SBOM package inventory exists, but no standalone CycloneDX predicate file was detected." : "No CycloneDX evidence was detected.",
      relatedHref: cyclonedxFiles[0] ? `source/${encodedPath(cyclonedxFiles[0])}` : "html/sbom.html"
    },
    {
      predicateType: "vuln",
      readiness: vulnFiles.length > 0 ? "available" : vulnerabilityScanner?.readiness === "missing" ? "missing" : "partial",
      evidence: vulnFiles.length > 0 ? `Vulnerability attestation candidate(s): ${vulnFiles.join(", ")}.` : vulnerabilityScanner ? vulnerabilityScanner.evidence : "No vulnerability scanner readiness evidence is available.",
      relatedHref: vulnFiles[0] ? `source/${encodedPath(vulnFiles[0])}` : "html/security-readiness.html"
    },
    {
      predicateType: "custom",
      readiness: attestationFiles.length > 0 ? "available" : "missing",
      evidence: attestationFiles.length > 0 ? `Generic attestation/predicate file(s): ${attestationFiles.join(", ")}.` : "No generic attestation, predicate, or DSSE envelope file was detected.",
      relatedHref: attestationFiles[0] ? `source/${encodedPath(attestationFiles[0])}` : "html/provenance.html"
    }
  ];

  const identityRequirements: ProvenanceReport["identityRequirements"] = [
    {
      requirement: "artifact digest pinning",
      status: sourceFileCount > 0 || Boolean(context.commitHash) ? "known" : "missing",
      evidence: sourceFileCount > 0 ? `${sourceFileCount} source file digest(s) are available; repository commit is ${context.commitHash?.slice(0, 12) ?? "unknown"}.` : "No digest or commit metadata is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      requirement: "expected certificate identity",
      status: "missing",
      evidence: "Keyless verification requires an expected certificate identity; RepoTutor cannot infer the release identity from a safe local snapshot.",
      relatedHref: "html/provenance.html"
    },
    {
      requirement: "expected OIDC issuer",
      status: "external",
      evidence: "Keyless verification requires the OIDC issuer, commonly https://token.actions.githubusercontent.com for GitHub Actions or another issuer chosen by the publisher.",
      relatedHref: "html/provenance.html"
    },
    {
      requirement: "public key or certificate chain",
      status: publicKeyFiles.length > 0 || certificateFiles.length > 0 ? "known" : "missing",
      evidence: publicKeyFiles.length > 0 || certificateFiles.length > 0 ? `Verification material found: ${[...publicKeyFiles, ...certificateFiles].join(", ")}.` : "No public key or certificate chain material was detected.",
      relatedHref: publicKeyFiles[0] || certificateFiles[0] ? `source/${encodedPath(publicKeyFiles[0] ?? certificateFiles[0])}` : "html/provenance.html"
    },
    {
      requirement: "trusted root and transparency log proof",
      status: trustedRootFiles.length > 0 || bundleFiles.length > 0 ? "known" : "external",
      evidence: trustedRootFiles.length > 0 || bundleFiles.length > 0 ? `Trusted verification evidence found: ${[...trustedRootFiles, ...bundleFiles].join(", ")}.` : "Trusted root and Rekor proof must be fetched or provided outside the static source snapshot.",
      relatedHref: trustedRootFiles[0] || bundleFiles[0] ? `source/${encodedPath(trustedRootFiles[0] ?? bundleFiles[0])}` : "html/provenance.html"
    }
  ];

  const riskQueue: ProvenanceReport["riskQueue"] = [];
  if (signatureFiles.length === 0 && bundleFiles.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Create and store a Sigstore bundle or detached signature for release artifacts.",
      why: "Cosign verification needs signature material; a bundle is preferred because it can carry certificate and transparency log proof.",
      relatedHref: "html/provenance.html"
    });
  }
  if (!identityRequirements.some((requirement) => requirement.requirement === "expected certificate identity" && requirement.status === "known")) {
    riskQueue.push({
      priority: "high",
      action: "Document the expected certificate identity and OIDC issuer for keyless verification.",
      why: "Cosign keyless verification should pin identity and issuer, not just accept any valid certificate.",
      relatedHref: "html/provenance.html"
    });
  }
  if (!attestationSignals.some((signal) => signal.readiness === "available")) {
    riskQueue.push({
      priority: "medium",
      action: "Add SLSA, SBOM, or vulnerability attestations for artifacts that will be distributed.",
      why: "Cosign attestations let verifiers check provenance and subject relationship instead of only checking a signature.",
      relatedHref: "html/provenance.html"
    });
  }
  if (containerFiles.length > 0) {
    riskQueue.push({
      priority: "medium",
      action: "Sign and verify container images by digest, not tags.",
      why: "Container config exists, but a mutable tag is not enough provenance evidence.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (publicKeyFiles.length === 0 && certificateFiles.length === 0 && bundleFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Provide a public key, certificate chain, or Sigstore bundle alongside signed artifacts.",
      why: "Offline verification needs trust material available to the verifier.",
      relatedHref: "html/provenance.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real cosign verification outside RepoTutor for release decisions.",
    why: "This report is readiness metadata only and does not query Rekor, validate certificates, or verify signatures.",
    relatedHref: "html/provenance.html"
  });

  return {
    summary: `Cosign식 provenance readiness report: artifact signal ${artifactSignals.length}개, signature material ${signatureSignals.length}개, attestation ${attestationSignals.length}개, identity requirement ${identityRequirements.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Cosign signature bundle attestation transparency log trusted root certificate identity verification",
    artifactSignals,
    signatureSignals,
    attestationSignals,
    identityRequirements,
    verificationCommands: [
      {
        command: "cosign verify-blob <artifact> --bundle <artifact.sigstore.json> --certificate-identity <identity> --certificate-oidc-issuer <issuer>",
        purpose: "Generic blob을 Sigstore bundle, expected identity, OIDC issuer로 검증합니다."
      },
      {
        command: "cosign verify-attestation --type slsaprovenance --certificate-identity <identity> --certificate-oidc-issuer <issuer> <image>",
        purpose: "컨테이너 이미지의 SLSA provenance attestation과 subject 관계를 검증합니다."
      },
      {
        command: "cosign tree <image>",
        purpose: "OCI artifact에 붙은 signature, attestation, SBOM referrer를 확인합니다."
      },
      {
        command: "cosign verify --key cosign.pub <image>@sha256:<digest>",
        purpose: "공개키 기반으로 digest-pinned container image signature를 검증합니다."
      }
    ],
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    learnerNextSteps: [
      "artifact readiness와 signature material을 먼저 대조해 어떤 산출물을 서명해야 하는지 정하세요.",
      "keyless flow는 certificate identity와 OIDC issuer를 반드시 명시해서 검증하세요.",
      "attestation subject가 실제 artifact digest와 연결되는지 원본 registry나 bundle에서 확인하세요.",
      "이 리포트는 Cosign 실행 결과가 아니라 정적 준비도 리포트입니다. 실제 release 판단에는 cosign verify 계열 명령을 실행하세요."
    ]
  };
}

function provenanceFiles(walk: WalkResult, predicate: (filePath: string) => boolean): string[] {
  return walk.files
    .filter((file) => predicate(file.relPath))
    .map((file) => file.relPath)
    .sort((a, b) => a.localeCompare(b));
}

function isSignatureMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "cosign.sig" || base.endsWith(".sig") || base.endsWith(".signature") || base.endsWith(".pem.sig");
}

function isSigstoreBundleFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "bundle.json" || base === "artifact.sigstore.json" || base.endsWith(".sigstore") || base.endsWith(".sigstore.json") || base.endsWith(".bundle") || base.endsWith(".bundle.json");
}

function isCertificateMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base.endsWith(".crt") || base.endsWith(".cert") || base.endsWith(".cer") || (base.endsWith(".pem") && !isPublicKeyMaterialFile(filePath));
}

function isPublicKeyMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "cosign.pub" || base === "public.key" || base === "public_key.pem" || base.endsWith(".pub");
}

function isTrustedRootMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "trusted_root.json" || base === "trusted-root.json" || base === "sigstore-root.json" || base === "root.json";
}

function isAttestationMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return /attestation|predicate|provenance|intoto|in-toto|dsse|slsa/.test(filePath.toLowerCase()) || base.endsWith(".intoto.jsonl") || base.endsWith(".link");
}

async function packageDependencyRangeSignals(walk: WalkResult): Promise<{ total: number; pinned: number; unpinned: number; filePaths: string[]; examples: string[] }> {
  const result = { total: 0, pinned: 0, unpinned: 0, filePaths: [] as string[], examples: [] as string[] };
  const packageJsonFiles = walk.files.filter((file) => path.basename(file.relPath) === "package.json");
  for (const file of packageJsonFiles) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    try {
      const json = JSON.parse(text) as Record<string, Record<string, string> | unknown>;
      for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        const dependencies = json[section];
        if (!dependencies || typeof dependencies !== "object" || Array.isArray(dependencies)) continue;
        result.filePaths.push(file.relPath);
        for (const [name, version] of Object.entries(dependencies as Record<string, string>)) {
          if (typeof version !== "string") continue;
          result.total += 1;
          if (isPinnedDependencyRange(version)) {
            result.pinned += 1;
          } else {
            result.unpinned += 1;
            if (result.examples.length < 5) result.examples.push(`${name}@${version}`);
          }
        }
      }
    } catch {
      continue;
    }
  }
  result.filePaths = [...new Set(result.filePaths)].sort();
  return result;
}

function isPinnedDependencyRange(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /workspace:|file:|link:|git\+|github:|latest|\*|x/i.test(trimmed)) return false;
  if (/^[~^<>!=]/.test(trimmed)) return false;
  if (/\s*\|\|\s*|\s+-\s+/.test(trimmed)) return false;
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(trimmed);
}

async function packageJsonScriptSignals(walk: WalkResult): Promise<{ testScripts: number; scriptFiles: string[] }> {
  const scriptFiles: string[] = [];
  let testScripts = 0;
  for (const file of walk.files.filter((candidate) => path.basename(candidate.relPath) === "package.json")) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    try {
      const json = JSON.parse(text) as { scripts?: Record<string, string> };
      for (const [name, command] of Object.entries(json.scripts ?? {})) {
        if (/test|spec|vitest|jest|mocha|tap|ava|playwright|cypress/i.test(`${name} ${command}`)) {
          testScripts += 1;
          scriptFiles.push(file.relPath);
        }
      }
    } catch {
      continue;
    }
  }
  return { testScripts, scriptFiles: [...new Set(scriptFiles)].sort() };
}

async function workflowSafetySignals(workflowFiles: WalkResult["files"]): Promise<{ dangerousFiles: string[]; sastMentions: string[] }> {
  const dangerousFiles: string[] = [];
  const sastMentions: string[] = [];
  for (const file of workflowFiles) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    if (/pull_request_target/i.test(text) && /(actions\/checkout|github\.event\.pull_request|head_ref|npm\s+(install|ci|test)|yarn|pnpm|pip|bash|sh\s)/i.test(text)) {
      dangerousFiles.push(file.relPath);
    }
    if (/codeql|semgrep|snyk|sonar|static analysis|sast/i.test(text)) {
      sastMentions.push(file.relPath);
    }
  }
  return {
    dangerousFiles: [...new Set(dangerousFiles)].sort(),
    sastMentions: [...new Set(sastMentions)].sort()
  };
}

function isIacConfigFile(filePath: string): boolean {
  const base = path.basename(filePath);
  if (/^Dockerfile/i.test(base) || /docker-compose\.ya?ml$/i.test(base)) return true;
  if (/\.(tf|tfvars)$/i.test(base)) return true;
  if (/cloudformation|serverless|sam-template/i.test(filePath)) return true;
  if (/(k8s|kubernetes|helm|charts?|deployment|service|ingress|configmap|secret).*\.(ya?ml|json)$/i.test(filePath)) return true;
  return false;
}

function isRelativeImport(importText: string): boolean {
  return importText.startsWith("./") || importText.startsWith("../");
}

function resolveLocalImport(fromFile: string, importText: string, fileSet: Set<string>): string | null {
  const base = unresolvedLocalPath(fromFile, importText);
  const candidates = [
    base,
    ...[".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".json"].map((ext) => `${base}${ext}`),
    ...["index.ts", "index.tsx", "index.js", "index.jsx", "index.mjs", "index.cjs", "__init__.py"].map((fileName) => `${base}/${fileName}`)
  ];
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
}

function unresolvedLocalPath(fromFile: string, importText: string): string {
  return path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), importText));
}

function detectDependencyCycles(graph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const seen = new Set<string>();
  for (const start of graph.keys()) {
    walkDependencyCycle(start, start, graph, [], seen, cycles);
  }
  return cycles;
}

function walkDependencyCycle(start: string, current: string, graph: Map<string, string[]>, pathStack: string[], seen: Set<string>, cycles: string[][]): void {
  if (pathStack.length > 30 || cycles.length >= 20) return;
  const nextPath = [...pathStack, current];
  for (const next of graph.get(current) ?? []) {
    if (next === start && nextPath.length > 1) {
      const normalized = normalizeCycle(nextPath);
      const key = normalized.join(">");
      if (!seen.has(key)) {
        seen.add(key);
        cycles.push(normalized);
      }
      continue;
    }
    if (!nextPath.includes(next)) walkDependencyCycle(start, next, graph, nextPath, seen, cycles);
  }
}

function normalizeCycle(files: string[]): string[] {
  const unique = files.slice(0, files.findIndex((file, index) => files.indexOf(file) !== index) === -1 ? files.length : files.findIndex((file, index) => files.indexOf(file) !== index));
  const smallestIndex = unique.reduce((best, file, index) => file.localeCompare(unique[best]) < 0 ? index : best, 0);
  return [...unique.slice(smallestIndex), ...unique.slice(0, smallestIndex)];
}

function isDependencyHealthModule(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  if (!/\.(cjs|js|jsx|mjs|py|ts|tsx)$/.test(base)) return false;
  if (/^(main|index|app|cli|server|lib)\./.test(base)) return false;
  if (/(test|spec|config|setup|mock|fixture|stories)\./.test(base)) return false;
  return true;
}

function rankFan(graph: Map<string, string[]>): Array<{ filePath: string; count: number }> {
  return [...graph.entries()]
    .map(([filePath, files]) => ({ filePath, count: new Set(files).size }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.filePath.localeCompare(b.filePath));
}

function buildSearchIndexReport(
  fileLessons: FileLesson[],
  folderLessons: FolderLesson[],
  suggestedReadsReport: SuggestedReadsReport,
  runtimeEnvironmentReport: RuntimeEnvironmentReport,
  interfaceMapReport: InterfaceMapReport,
  symbolMapReport: SymbolMapReport,
  apiReferenceReport: ApiReferenceReport,
  dependencyHealthReport: DependencyHealthReport
): SearchIndexReport {
  const seeds: Array<{
    id: string;
    title: string;
    href: string;
    section: string;
    sourcePath: string | null;
    text: string;
    filters: Record<string, string[]>;
    meta: Record<string, string>;
    anchors: SearchIndexReport["documents"][number]["anchors"];
  }> = [
    searchSeed({
      id: "report-suggested-reads",
      title: "추천 읽기",
      href: "html/suggested-reads.html",
      section: "report",
      sourcePath: null,
      text: [suggestedReadsReport.summary, suggestedReadsReport.sourcePattern, ...suggestedReadsReport.items.map((item) => `${item.filePath} ${item.reason}`)].join("\n"),
      sourcePattern: "Repo Baby",
      kind: "recommended-reading"
    }),
    searchSeed({
      id: "report-runtime-environment",
      title: "실행 환경",
      href: "html/runtime-environment.html",
      section: "report",
      sourcePath: null,
      text: [runtimeEnvironmentReport.summary, runtimeEnvironmentReport.sourcePattern, ...runtimeEnvironmentReport.detectedManifests.map((item) => `${item.filePath} ${item.ecosystem} ${item.signal}`), ...runtimeEnvironmentReport.missingSignals].join("\n"),
      sourcePattern: "docSmith",
      kind: "runtime"
    }),
    searchSeed({
      id: "report-interface-map",
      title: "인터페이스 맵",
      href: "html/interface-map.html",
      section: "report",
      sourcePath: null,
      text: [interfaceMapReport.summary, interfaceMapReport.sourcePattern, ...interfaceMapReport.routeSignals.map((item) => `${item.filePath} ${item.kind} ${item.signal}`), ...interfaceMapReport.apiSignals.map((item) => `${item.filePath} ${item.method} ${item.pattern}`)].join("\n"),
      sourcePattern: "repomap",
      kind: "interface"
    }),
    searchSeed({
      id: "report-symbol-map",
      title: "심볼 맵",
      href: "html/symbol-map.html",
      section: "report",
      sourcePath: null,
      text: [symbolMapReport.summary, symbolMapReport.sourcePattern, ...symbolMapReport.symbols.map((item) => `${item.name} ${item.kind} ${item.filePath}`)].join("\n"),
      sourcePattern: "codebase-map",
      kind: "symbols"
    }),
    searchSeed({
      id: "report-api-reference",
      title: "API Reference",
      href: "html/api-reference.html",
      section: "report",
      sourcePath: null,
      text: [apiReferenceReport.summary, apiReferenceReport.sourcePattern, ...apiReferenceReport.publicSymbols.map((item) => `${item.name} ${item.kind} ${item.category} ${item.signature}`)].join("\n"),
      sourcePattern: "TypeDoc",
      kind: "api-reference"
    }),
    searchSeed({
      id: "report-dependency-health",
      title: "Dependency Health",
      href: "html/dependency-health.html",
      section: "report",
      sourcePath: null,
      text: [dependencyHealthReport.summary, dependencyHealthReport.sourcePattern, ...dependencyHealthReport.ruleViolations.map((item) => `${item.ruleName} ${item.fromFile} ${item.toFile ?? ""} ${item.message}`)].join("\n"),
      sourcePattern: "dependency-cruiser",
      kind: "dependency-health"
    }),
    ...folderLessons.slice(0, 25).map((lesson) => searchSeed({
      id: `folder-${htmlAnchor(lesson.folderPath)}`,
      title: lesson.folderPath,
      href: `html/folders.html#${htmlAnchor(lesson.folderPath)}`,
      section: "folder",
      sourcePath: lesson.folderPath,
      text: [lesson.role, lesson.beginnerExplanation, lesson.whyItExists, lesson.designReasoning, lesson.rebuildAdvice, ...lesson.importantFiles].join("\n"),
      sourcePattern: "RepoTutor folder lesson",
      kind: "folder"
    })),
    ...fileLessons.slice(0, 50).map((lesson) => searchSeed({
      id: `file-${htmlAnchor(lesson.filePath)}`,
      title: lesson.filePath,
      href: `html/files.html#${htmlAnchor(lesson.filePath)}`,
      section: "file",
      sourcePath: lesson.filePath,
      text: [
        lesson.role,
        lesson.beginnerExplanation,
        lesson.whyItExists,
        lesson.executionFlowPosition,
        lesson.rebuildAdvice,
        ...lesson.keyExports,
        ...lesson.keyImports,
        ...lesson.glossaryTerms,
        ...lesson.sourceEvidence.map((item) => `${item.kind} ${item.snippet}`)
      ].join("\n"),
      sourcePattern: "RepoTutor file lesson",
      kind: "file"
    }))
  ];

  const documents = seeds.map((seed) => {
    const terms = tokenizeSearchText(`${seed.title}\n${seed.text}\n${Object.values(seed.meta).join("\n")}`);
    const topTerms = rankSearchTerms(terms).slice(0, 8).map(([term]) => term);
    return {
      id: seed.id,
      title: seed.title,
      href: seed.href,
      section: seed.section,
      sourcePath: seed.sourcePath,
      wordCount: terms.length,
      filters: seed.filters,
      meta: seed.meta,
      anchors: seed.anchors,
      topTerms
    };
  });
  const termIndex = buildSearchTermIndex(seeds);
  const metadataFields = [...new Set(documents.flatMap((document) => Object.keys(document.meta)))].sort();
  return {
    summary: `Pagefind식 search index report: ${documents.length}개 학습 문서를 PageFragmentData처럼 href, filters, meta, anchors로 나누고 ${termIndex.length}개 검색어 색인을 만들었습니다.`,
    sourcePattern: "Pagefind PageFragmentData MetaIndex filters meta_fields static low-bandwidth search index",
    totalDocuments: documents.length,
    totalTerms: termIndex.length,
    documents,
    termIndex,
    filterIndex: buildSearchFilterIndex(documents),
    metadataFields,
    learnerNextSteps: [
      "search-index.html에서 보고서, 폴더, 파일 문서가 어떤 filter와 metadata로 묶였는지 확인하세요.",
      "termIndex의 상위 문서를 따라가면 generated HTML 전체를 가로지르는 학습 검색 출발점을 잡을 수 있습니다.",
      "metadataFields와 filters를 보면 Pagefind식 정적 검색 UI를 붙일 때 어떤 facet을 노출할지 결정할 수 있습니다."
    ]
  };
}

function searchSeed(input: {
  id: string;
  title: string;
  href: string;
  section: string;
  sourcePath: string | null;
  text: string;
  sourcePattern: string;
  kind: string;
}): {
  id: string;
  title: string;
  href: string;
  section: string;
  sourcePath: string | null;
  text: string;
  filters: Record<string, string[]>;
  meta: Record<string, string>;
  anchors: SearchIndexReport["documents"][number]["anchors"];
} {
  return {
    ...input,
    filters: {
      section: [input.section],
      kind: [input.kind],
      sourcePattern: [input.sourcePattern]
    },
    meta: {
      title: input.title,
      section: input.section,
      kind: input.kind,
      sourcePath: input.sourcePath ?? "",
      sourcePattern: input.sourcePattern
    },
    anchors: [{
      id: htmlAnchor(input.title),
      text: input.title,
      href: input.href
    }]
  };
}

function tokenizeSearchText(text: string): string[] {
  const stopWords = new Set(["the", "and", "for", "with", "this", "that", "from", "html", "source", "report"]);
  return [...text.toLowerCase().matchAll(/[a-z0-9가-힣_/-]{2,}/g)]
    .map((match) => match[0])
    .filter((term) => !stopWords.has(term))
    .slice(0, 4_000);
}

function rankSearchTerms(terms: string[]): Array<[string, number]> {
  return Object.entries(countBy(terms)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function buildSearchTermIndex(seeds: Array<{ id: string; title: string; text: string; meta: Record<string, string> }>): SearchIndexReport["termIndex"] {
  const termDocuments = new Map<string, Set<string>>();
  for (const seed of seeds) {
    const uniqueTerms = new Set(tokenizeSearchText(`${seed.title}\n${seed.text}\n${Object.values(seed.meta).join("\n")}`));
    for (const term of uniqueTerms) {
      const documents = termDocuments.get(term) ?? new Set<string>();
      documents.add(seed.id);
      termDocuments.set(term, documents);
    }
  }
  return [...termDocuments.entries()]
    .map(([term, documents]) => ({
      term,
      documentCount: documents.size,
      documents: [...documents].sort().slice(0, 12)
    }))
    .sort((a, b) => b.documentCount - a.documentCount || a.term.localeCompare(b.term))
    .slice(0, 80);
}

function buildSearchFilterIndex(documents: SearchIndexReport["documents"]): SearchIndexReport["filterIndex"] {
  const filters = new Map<string, Map<string, Set<string>>>();
  for (const document of documents) {
    for (const [filter, values] of Object.entries(document.filters)) {
      const valueMap = filters.get(filter) ?? new Map<string, Set<string>>();
      for (const value of values) {
        const documentSet = valueMap.get(value) ?? new Set<string>();
        documentSet.add(document.id);
        valueMap.set(value, documentSet);
      }
      filters.set(filter, valueMap);
    }
  }
  return [...filters.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([filter, values]) => ({
      filter,
      values: [...values.entries()]
        .map(([value, documents]) => ({ value, documentCount: documents.size }))
        .sort((a, b) => b.documentCount - a.documentCount || a.value.localeCompare(b.value))
    }));
}

function buildLearningJournalReport(
  fileLessons: FileLesson[],
  glossary: GlossaryTerm[],
  graphQueryReport: GraphQueryReport,
  tutorialAbstractionReport: TutorialAbstractionReport,
  searchIndexReport: SearchIndexReport
): LearningJournalReport {
  const priorityFiles = fileLessons.slice(0, 5);
  const primaryFile = priorityFiles[0];
  const glossaryConcepts = glossary.slice(0, 4);
  const abstractionConcepts = tutorialAbstractionReport.abstractions.slice(0, 3);
  const sourcePattern = "learn-codebase Socratic tutor active recall prediction before revelation persistent learning journal";
  const focusGoals: LearningJournalReport["focusGoals"] = [
    {
      label: "Primary goal",
      value: "낯선 저장소를 설명 가능한 mental model로 바꾸기",
      evidenceHref: "html/index.html"
    },
    {
      label: "Learning style",
      value: "예측 질문, 소스 근거 대조, active recall, spaced review 순서로 학습",
      evidenceHref: "html/evidence.html"
    },
    {
      label: "Current focus",
      value: primaryFile ? `${primaryFile.filePath}부터 실제 진입점을 추적` : "먼저 overview와 파일 수업으로 진입점 확인",
      evidenceHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/files.html"
    }
  ];

  const masteryLevels: LearningJournalReport["masteryLevels"] = [
    {
      level: "need-to-explore",
      label: "Need to Explore",
      concepts: priorityFiles.slice(0, 3).map((lesson) => ({
        concept: lesson.filePath,
        status: "아직 예측과 trace가 필요한 핵심 파일",
        reason: `${lesson.role} 역할이지만 학습자가 직접 설명해보기 전까지는 확신하지 않습니다.`,
        reviewPrompt: `파일명 ${lesson.filePath}만 보고 어떤 입력과 출력이 있을지 먼저 예측하세요.`,
        relatedHref: `html/files.html#${htmlAnchor(lesson.filePath)}`
      }))
    },
    {
      level: "learning",
      label: "Learning",
      concepts: glossaryConcepts.map((term) => ({
        concept: `${term.termKo} (${term.termEn})`,
        status: "부분 이해 상태로 active recall 복습 필요",
        reason: term.projectSpecificMeaning,
        reviewPrompt: `${term.termEn}를 이 저장소의 실제 파일 예시와 연결해 한 문장으로 설명하세요.`,
        relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
      }))
    },
    {
      level: "confident",
      label: "Confident",
      concepts: abstractionConcepts.map((item) => ({
        concept: item.name,
        status: "튜토리얼 장으로 설명 가능한 개념 후보",
        reason: item.chapterGoal,
        reviewPrompt: `${item.name} 장을 읽지 않은 사람에게 왜 이 순서로 배워야 하는지 설명하세요.`,
        relatedHref: `html/tutorial-abstractions.html#${htmlAnchor(item.id)}`
      }))
    }
  ];

  const tracePrompt = graphQueryReport.pathPrompts[0];
  const promptSeeds = [
    {
      promptType: "prediction" as const,
      question: primaryFile
        ? `Looking at just ${primaryFile.filePath}, what do you expect it to coordinate before reading the lesson?`
        : "Looking at the repository name and folders, what do you expect this project to do?",
      relatedHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/index.html"
    },
    {
      promptType: "trace" as const,
      question: tracePrompt
        ? `Trace the path from ${tracePrompt.from} to ${tracePrompt.to}. What happens first, and what evidence would prove it?`
        : "Trace one user input from intake to generated HTML. What happens first?",
      relatedHref: "html/graph-query.html"
    },
    {
      promptType: "design-reasoning" as const,
      question: tutorialAbstractionReport.relationships[0]
        ? `Why does ${tutorialAbstractionReport.relationships[0].fromId} connect to ${tutorialAbstractionReport.relationships[0].toId}?`
        : "Why are these responsibilities split across folders instead of one file?",
      relatedHref: "html/tutorial-abstractions.html"
    },
    {
      promptType: "comparison" as const,
      question: priorityFiles[1]
        ? `How is ${priorityFiles[0]?.filePath ?? "the entry file"} different from ${priorityFiles[1].filePath}?`
        : "How is the architecture page different from the file lessons page?",
      relatedHref: "html/files.html"
    },
    {
      promptType: "error-prediction" as const,
      question: "Which generated report would fail first if a copied source file disappeared?",
      relatedHref: "html/session-verification.html"
    },
    {
      promptType: "meta" as const,
      question: "What would you need to explain back before you should edit this codebase?",
      relatedHref: "html/learning-journal.html"
    }
  ];

  const openQuestions = promptSeeds.map((seed, index) => ({
    id: `journal-question-${index + 1}`,
    question: seed.question,
    promptType: seed.promptType,
    relatedHref: seed.relatedHref,
    sourcePattern
  }));

  const spacedReviewQueue = [
    ...glossaryConcepts.map((term, index) => ({
      concept: `${term.termKo} (${term.termEn})`,
      reviewBy: index === 0 ? "next-session" : `after-${index + 1}-days`,
      reviewNumber: index + 1,
      prompt: `${term.termEn}를 원본 파일 하나와 연결해 다시 설명하세요.`,
      relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
    })),
    ...priorityFiles.slice(0, 3).map((lesson, index) => ({
      concept: lesson.filePath,
      reviewBy: `after-${index + 1}-days`,
      reviewNumber: index + 1,
      prompt: `${lesson.filePath}의 역할과 제거 시 깨질 흐름을 설명하세요.`,
      relatedHref: `html/files.html#${htmlAnchor(lesson.filePath)}`
    }))
  ].slice(0, 8);

  const ahaMoments = [
    {
      title: "Prediction before revelation",
      insight: "파일 수업을 열기 전에 역할을 먼저 예측하면, 설명을 읽을 때 맞은 부분과 빈틈이 분리됩니다.",
      relatedHref: "html/files.html"
    },
    {
      title: "Evidence-backed confidence",
      insight: "이해했다고 느끼는 것보다 source evidence와 lesson link로 다시 말할 수 있는지가 더 중요합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      title: "Searchable review surface",
      insight: `Pagefind식 색인 ${searchIndexReport.totalDocuments}개 문서를 복습 출발점으로 쓰면 모르는 개념을 빠르게 되찾을 수 있습니다.`,
      relatedHref: "html/search-index.html"
    }
  ];

  return {
    summary: `learn-codebase식 learning journal report: ${openQuestions.length}개 Socratic 질문, ${spacedReviewQueue.length}개 spaced review 항목, ${masteryLevels.reduce((sum, level) => sum + level.concepts.length, 0)}개 mastery concept를 생성했습니다.`,
    sourcePattern,
    focusGoals,
    masteryLevels,
    openQuestions,
    spacedReviewQueue,
    ahaMoments,
    sessionLog: [{
      explored: "RepoTutor generated overview, file lessons, graph query, tutorial abstractions, search index",
      learned: [
        "예측 질문으로 파일 역할을 먼저 가정한다.",
        "소스 근거 링크로 설명의 신뢰도를 확인한다.",
        "spaced review queue로 다음 세션의 복습 대상을 남긴다."
      ],
      struggledWith: priorityFiles.slice(0, 3).map((lesson) => lesson.filePath),
      next: [
        "Need to Explore 항목 하나를 골라 예측을 적는다.",
        "관련 파일 수업과 원본 소스를 대조한다.",
        "정답을 본 뒤 review prompt에 다시 답한다."
      ]
    }],
    socraticPrompts: [
      {
        category: "Prediction",
        question: openQuestions[0]?.question ?? "What do you expect this module to do?",
        useWhen: "파일이나 함수 설명을 열기 전",
        relatedHref: openQuestions[0]?.relatedHref ?? "html/files.html",
        hintLevels: [
          "폴더명과 파일명에서 책임을 추론하세요.",
          "입력, 처리, 출력 중 어느 쪽에 가까운지 고르세요.",
          "파일 수업의 role 문장을 빈칸으로 두고 채워보세요."
        ]
      },
      {
        category: "Trace",
        question: "한 입력이 analysis JSON, Markdown, HTML까지 이동하는 순서를 말해보세요.",
        useWhen: "실행 흐름과 데이터 흐름을 학습할 때",
        relatedHref: "html/flow.html",
        hintLevels: [
          "처음에는 intake 또는 source copy에서 시작합니다.",
          "scanner와 renderer 사이의 산출물을 찾으세요.",
          "source files -> analysis JSON -> Markdown -> HTML 순서로 채워보세요."
        ]
      },
      {
        category: "Evidence",
        question: "그 설명을 뒷받침하는 실제 소스 근거 링크는 어디에 있나요?",
        useWhen: "이해했다고 느끼지만 근거를 아직 못 댈 때",
        relatedHref: "html/evidence.html",
        hintLevels: [
          "파일 수업의 소스 근거 섹션을 보세요.",
          "evidence kind와 line snippet을 연결하세요.",
          "원본 열기 링크를 따라가 같은 줄을 찾으세요."
        ]
      }
    ],
    journalTemplateMarkdown: learningJournalTemplateMarkdown(focusGoals, masteryLevels, openQuestions, spacedReviewQueue, ahaMoments),
    learnerNextSteps: [
      "learning-journal.html에서 Need to Explore 개념 하나를 고르고 답을 먼저 적으세요.",
      "관련 파일 수업과 원본 소스를 확인한 뒤 자신의 답을 수정하세요.",
      "spaced review queue 항목을 다음 세션 시작 질문으로 사용하세요."
    ]
  };
}

function learningJournalTemplateMarkdown(
  focusGoals: LearningJournalReport["focusGoals"],
  masteryLevels: LearningJournalReport["masteryLevels"],
  openQuestions: LearningJournalReport["openQuestions"],
  spacedReviewQueue: LearningJournalReport["spacedReviewQueue"],
  ahaMoments: LearningJournalReport["ahaMoments"]
): string {
  return [
    "# Codebase Learning Journal",
    "",
    "## Focus & Goals",
    ...focusGoals.map((item) => `- **${item.label}**: ${item.value} (${item.evidenceHref})`),
    "",
    "## Concept Mastery Map",
    ...masteryLevels.map((level) => [
      `### ${level.label}`,
      ...level.concepts.map((concept) => `- ${concept.concept}: ${concept.status} - ${concept.reviewPrompt}`)
    ].join("\n")),
    "",
    "## Open Questions",
    ...openQuestions.map((item) => `- [ ] ${item.question} (${item.promptType}, ${item.relatedHref})`),
    "",
    "## Spaced Review Queue",
    ...spacedReviewQueue.map((item) => `- [ ] ${item.concept} (review by: ${item.reviewBy}) - ${item.reviewNumber} review - ${item.prompt}`),
    "",
    "## Aha Moments",
    ...ahaMoments.map((item) => `### ${item.title}\n${item.insight}`),
    "",
    "## Session Log",
    "- **Explored**: generated RepoTutor reports",
    "- **Next**: answer one open question before reading the linked report",
    ""
  ].join("\n");
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
