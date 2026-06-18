import path from "node:path";
import {
  DEPENDENCY_FILES,
  DEFAULT_REPO_MAP_DEPTH,
  LANGUAGE_BY_EXTENSION,
  htmlAnchor,
  type ArchitectureReport,
  type DependencyReport,
  type FolderLesson,
  type LanguageReport,
  type PurposeReport,
  type RepoMap
} from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";

export function buildRepoMap(sourceRoot: string, walk: WalkResult): RepoMap {
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

export function buildLanguageReport(walk: WalkResult): LanguageReport {
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

export async function buildDependencyReport(sourceRoot: string, walk: WalkResult): Promise<DependencyReport> {
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

export async function buildPurposeReport(sourceRoot: string, walk: WalkResult, languageReport: LanguageReport, repoMap: RepoMap): Promise<PurposeReport> {
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

export function buildArchitectureReport(repoMap: RepoMap, languageReport: LanguageReport, dependencyReport: DependencyReport): ArchitectureReport {
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
    vibeCodingLens: `${style}는 바이브코딩 개발자가 전체 숲을 보는 기준점입니다. 코드를 직접 외우기보다 AI에게 앱 영역, 공유 패키지, 설정, 테스트 경계를 어떤 순서로 만들게 할지 정하는 데 사용합니다.`,
    architectureRationale: `${style}로 나누는 이유는 기능 구현, 재사용 코드, 실행 앱, 설정 파일의 책임을 분리해 AI가 한 번에 너무 큰 코드를 만들지 않게 하기 위해서입니다.`,
    aiPromptBrief: `AI 요청 후보: "${style} 구조로 설계하고, 주요 폴더 책임과 의존성 매니페스트를 먼저 제안한 뒤 가장 작은 vertical slice 구현 후보를 제안해줘"를 검토하세요. 보내기 전 소스 근거, 제외 범위, 수락 기준, 검증 질문을 내 목표에 맞게 다듬습니다.`,
    sourceBoundaries: [
      `폴더 근거: ${repoMap.folders.slice(0, 6).map((folder) => folder.folderPath).join(", ") || "no folders detected"}`,
      `매니페스트 근거: ${dependencyReport.manifests.map((manifest) => manifest.filePath).join(", ") || "no manifests detected"}`,
      "정적 분석으로 추정한 구조이므로 실행 흐름, 런타임 설정, 실제 테스트 통과 여부는 별도 검증이 필요합니다."
    ],
    verificationQuestions: [
      `AI가 제안한 새 구조가 ${style}의 책임 분리를 유지하는가?`,
      "앱 코드, 공유 코드, 설정, 테스트가 서로 다른 폴더 책임으로 분리되어 있는가?",
      "정적 소스 근거로 확인한 사실과 실행/테스트로 확인해야 할 가정이 분리되어 있는가?"
    ],
    mermaid: `flowchart TD\n  root["repo root"]\n${nodes || "  root --> source[\"source files\"]"}`
  };
}

export function buildFolderLessons(repoMap: RepoMap): FolderLesson[] {
  return repoMap.folders.slice(0, 40).map((folder) => ({
    folderPath: folder.folderPath,
    role: folder.inferredRole,
    beginnerExplanation: `${folder.folderPath} 폴더는 ${folder.inferredRole}로 보입니다. 바이브코딩 개발자는 이 폴더를 코드 암기 대상이 아니라 AI에게 역할과 경계를 설명하기 위한 지도 조각으로 보면 됩니다.`,
    whyItExists: `${folder.fileCount}개 파일을 역할별로 묶어 프로젝트를 관리하기 쉽게 만듭니다.`,
    whatWouldBreakIfRemoved: "이 폴더가 실제 코드 또는 설정을 담고 있다면 빌드, 실행, 문서, 테스트 중 일부가 깨질 수 있습니다.",
    relatedFolders: repoMap.folders.filter((other) => other.folderPath !== folder.folderPath && other.folderPath.startsWith(folder.folderPath.split("/")[0])).slice(0, 5).map((other) => other.folderPath),
    importantFiles: folder.representativeFiles,
    designReasoning: "이름, 깊이, 대표 파일을 기준으로 역할을 추론했습니다.",
    rebuildAdvice: "비슷한 프로젝트를 만들 때는 먼저 이 폴더가 담는 책임을 한 문장으로 정하고, 그 책임에 맞는 파일만 넣으세요.",
    forestViewSummary: `${folder.folderPath}는 전체 숲에서 ${folder.inferredRole} 책임을 맡는 구역입니다. 관련 폴더와 대표 파일을 함께 보면 AI에게 어떤 경계로 작업을 나눠 시킬지 정할 수 있습니다.`,
    architectureRationale: "아키텍처 관점에서 폴더는 구현 기술보다 책임 경계를 먼저 보여줍니다. 이 경계를 알면 AI에게 기능, 설정, 테스트, 문서 중 무엇을 어디에 만들지 정확히 지시할 수 있습니다.",
    aiImplementationBrief: `폴더 재구현 요청 후보: ${folder.folderPath} 폴더를 다시 만들 때 필요한 목적(${folder.inferredRole}), 대표 파일(${folder.representativeFiles.slice(0, 3).join(", ") || "대표 파일 없음"}), 다른 폴더와의 연결, 검증 기준을 검토한 뒤 AI에게 보낼 문장으로 다듬으세요.`,
    vibeCodingPrompts: [
      `폴더 이해 요청 후보: 나는 전통 개발자가 아니라 바이브코딩 개발자야. ${folder.folderPath} 폴더가 맡는 제품/아키텍처 책임과 비슷한 앱에서 이 폴더가 필요한 이유를 설명해줘. 보내기 전 내 앱 목표와 소스 근거에 맞게 다듬으세요.`,
      `폴더 경계 요청 후보: ${folder.folderPath}와 관련 폴더의 경계를 비교하고, AI가 파일을 잘못 넣지 않도록 구현 지시 후보를 제안해줘. 보내기 전 포함/제외할 책임을 직접 확인하세요.`,
      `폴더 vertical slice 요청 후보: ${folder.folderPath}를 가장 작은 vertical slice로 다시 만들 때 필요한 파일 후보, 입력/출력, 수락/검증 질문을 제안해줘. 보내기 전 검증 기준을 내 목표에 맞게 좁히세요.`
    ],
    verificationQuestions: [
      `${folder.folderPath} 안의 파일들이 ${folder.inferredRole} 책임에 맞게 모여 있는가?`,
      `AI가 이 폴더에 코드를 추가한다면 다른 폴더로 옮겨야 할 책임을 섞고 있지 않은가?`,
      "정적 소스 분석만으로 확인된 사실과, 실제 실행/테스트가 필요한 가정이 분리되어 있는가?"
    ]
  }));
}

export function inferEcosystem(filePath: string): string {
  const base = path.basename(filePath);
  if (base === "package.json" || base.includes("lock")) return "Node";
  if (base === "Cargo.toml") return "Rust";
  if (base === "pyproject.toml" || base === "requirements.txt") return "Python";
  if (base === "go.mod") return "Go";
  if (base.includes("Docker")) return "Docker";
  return "Project";
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

function extractDependencies(filePath: string, text: string | null): DependencyReport["manifests"][number]["dependencies"] {
  if (!text) return [];
  const base = path.basename(filePath);
  if (base === "package.json") {
    try {
      const json = JSON.parse(text) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const dependencies = json.dependencies ?? {};
      const devDependencies = json.devDependencies ?? {};
      return Object.keys({ ...dependencies, ...devDependencies }).slice(0, 40).map(dependencyRow);
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
