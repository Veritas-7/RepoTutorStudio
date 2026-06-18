import path from "node:path";
import {
  htmlAnchor,
  type CoverageReport,
  type EvidenceIndexReport,
  type FileLesson,
  type RepoMap,
  type SuggestedReadsReport
} from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export async function buildFileLessons(sourceRoot: string, walk: WalkResult): Promise<FileLesson[]> {
  const important = walk.files.filter(isImportantFile).slice(0, 50);
  const lessons: FileLesson[] = [];
  for (const file of important) {
    const text = file.isTextCandidate ? await readTextIfSafe(file.absPath, 60_000) : null;
    const role = inferFileRole(file.relPath);
    const keyExports = extractRegex(text, /export\s+(?:class|function|const|interface|type)\s+([A-Za-z0-9_]+)/g);
    const keyImports = extractRegex(text, /import\s+.*?\s+from\s+["']([^"']+)["']/g);
    const relatedFiles = relatedByFolder(file.relPath, important.map((candidate) => candidate.relPath));
    const evidence = extractSourceEvidence(text, file.relPath);
    lessons.push({
      filePath: file.relPath,
      role,
      beginnerExplanation: `${file.relPath} 파일은 ${role} 역할을 합니다. 바이브코딩 개발자는 이 파일을 문법 암기 대상이 아니라 AI에게 구현 의도와 연결 관계를 설명하기 위한 증거 카드로 보면 됩니다.`,
      whyItExists: "설정, 진입점(entry point), 도메인 로직(domain logic), 또는 테스트 근거를 명시하기 위해 존재합니다.",
      sourceEvidence: evidence,
      keyExports,
      keyImports,
      relatedFiles,
      executionFlowPosition: inferFlowPosition(file.relPath),
      rebuildAdvice: "맨땅에서 만들 때는 이 파일이 기대하는 입력과 출력부터 정하고, 가장 작은 동작 예시를 만든 뒤 확장하세요.",
      sourceRoleSummary: `${file.relPath}는 ${role} 책임을 보여주는 소스 근거입니다. 이 파일의 import/export와 관련 파일을 보면 AI에게 어떤 맥락을 같이 줘야 하는지 판단할 수 있습니다.`,
      architectureResponsibility: `아키텍처 관점에서 ${file.relPath}는 ${role} 경계의 일부입니다. 역할 밖의 책임이 섞이면 AI가 기능을 크게 만들거나 잘못된 폴더에 코드를 추가할 위험이 커집니다.`,
      aiPromptBrief: `파일 구현 요청 후보: ${file.relPath}와 비슷한 파일을 만들 때 필요한 역할(${role}), 입력/출력, 관련 파일(${relatedFiles.slice(0, 3).join(", ") || "관련 파일 없음"}), 소스 근거(${evidence.length}개), 검증 기준을 검토한 뒤 AI에게 보낼 문장으로 다듬으세요.`,
      vibeCodingPrompts: [
        `파일 이해 요청 후보: 나는 전통 개발자가 아니라 바이브코딩 개발자야. ${file.relPath} 파일이 맡는 책임과 전체 앱에서 연결되는 위치를 설명해줘. 보내기 전 내 목표와 소스 근거에 맞게 다듬으세요.`,
        `파일 구현 요청 후보: ${file.relPath}와 관련 파일을 참고해 같은 역할의 파일을 만들 구현 지시 후보를 목적, 입력, 출력, 검증 기준으로 나눠 제안해줘. 보내기 전 관련 파일과 제외할 책임을 직접 확인하세요.`,
        `파일 검증 요청 후보: ${file.relPath}를 구현할 때 AI가 과하게 추측하지 않도록 정적 소스 근거와 실행으로 확인해야 할 가정을 분리해줘. 보내기 전 검증 질문을 내 목표에 맞게 좁히세요.`
      ],
      verificationQuestions: [
        `${file.relPath}가 ${role} 책임만 담고 있고 다른 책임을 섞지 않는가?`,
        `AI가 생성한 새 파일이 ${file.relPath}의 입력/출력과 관련 파일 관계를 유지하는가?`,
        "이 파일에서 정적 분석으로 확인한 사실과 실제 실행/테스트가 필요한 부분이 분리되어 있는가?"
      ],
      glossaryTerms: glossaryTermsForFile(file.relPath)
    });
  }
  void sourceRoot;
  return lessons;
}

export function buildCoverageReport(repoMap: RepoMap, fileLessons: FileLesson[]): CoverageReport {
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

export function buildEvidenceIndexReport(fileLessons: FileLesson[]): EvidenceIndexReport {
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

export function buildSuggestedReadsReport(fileLessons: FileLesson[]): SuggestedReadsReport {
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

function glossaryTermsForFile(filePath: string): string[] {
  const terms = ["파일 책임(file responsibility)"];
  if (/package|cargo|pyproject|requirements/.test(filePath)) terms.push("의존성(dependency)");
  if (/main|index|cli|app/.test(filePath)) terms.push("진입점(entry point)");
  if (/test|spec/.test(filePath)) terms.push("테스트(test)");
  return terms;
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

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}
