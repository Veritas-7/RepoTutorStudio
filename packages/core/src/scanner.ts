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
  LANGUAGE_BY_EXTENSION,
  LanguageReport,
  PurposeReport,
  RebuildRoadmap,
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
  const flowReport = buildFlowReport(fileLessons, dependencyReport);
  const glossary = buildGlossary(languageReport, dependencyReport, fileLessons);
  const rebuildRoadmap = buildRebuildRoadmap(repoMap, fileLessons);
  return { repoMap, languageReport, dependencyReport, purposeReport, architectureReport, folderLessons, fileLessons, flowReport, glossary, rebuildRoadmap };
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

function relatedByFolder(filePath: string, candidates: string[]): string[] {
  const dir = path.posix.dirname(filePath);
  return candidates.filter((candidate) => candidate !== filePath && path.posix.dirname(candidate) === dir).slice(0, 6);
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
