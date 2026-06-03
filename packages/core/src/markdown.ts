import type {
  AnalysisBundle,
} from "./scanner.js";
import type { StudySessionVerificationResult } from "./session-verifier.js";
import type { Quiz, StudySession, WrongNote } from "@repotutor/shared";

export function markdownFiles(session: StudySession, analysis: AnalysisBundle, quiz: Quiz, wrongNotes: WrongNote[]): Record<string, string> {
  return {
    "overview.md": `# ${session.repo} 학습 개요\n\n${analysis.purposeReport.longExplanation}\n\n## 대상 사용자\n\n${bullets(analysis.purposeReport.targetUsers)}\n`,
    "language.md": `# 언어와 기술 스택\n\n주요 언어: **${analysis.languageReport.primaryLanguage}**\n\n${analysis.languageReport.languageRoles.map((role) => `## ${role.language}\n\n${role.beginnerExplanation}\n\n${role.tradeoffs}`).join("\n\n")}\n`,
    "architecture.md": `# 아키텍처\n\n${analysis.architectureReport.explanation}\n\n\`\`\`mermaid\n${analysis.architectureReport.mermaid}\n\`\`\`\n`,
    "folders.md": `# 폴더 수업\n\n${analysis.folderLessons.map((lesson) => `## ${lesson.folderPath}\n\n${lesson.beginnerExplanation}\n\n- 왜 필요한가: ${lesson.whyItExists}\n- 다시 만들기: ${lesson.rebuildAdvice}`).join("\n\n")}\n`,
    "files.md": `# 핵심 파일 수업\n\n${analysis.fileLessons.map((lesson) => `## ${lesson.filePath}\n\n${lesson.beginnerExplanation}\n\n- 역할: ${lesson.role}\n- 다시 만들기: ${lesson.rebuildAdvice}\n\n### 소스 근거\n\n${sourceEvidenceBullets(lesson.sourceEvidence ?? [], lesson.filePath)}`).join("\n\n")}\n`,
    "evidence.md": `# 소스 근거 인덱스\n\n${sourceEvidenceIndexMarkdown(analysis.fileLessons)}\n`,
    "suggested-reads.md": `# 추천 읽기\n\n${analysis.suggestedReadsReport.summary}\n\nSource pattern: ${analysis.suggestedReadsReport.sourcePattern}\n\n${suggestedReadsMarkdown(analysis.suggestedReadsReport.items)}\n`,
    "runtime-environment.md": `# 실행 환경\n\n${analysis.runtimeEnvironmentReport.summary}\n\nSource pattern: ${analysis.runtimeEnvironmentReport.sourcePattern}\n\n## 감지된 매니페스트\n\n${runtimeEnvRows(analysis.runtimeEnvironmentReport.detectedManifests)}\n\n## 설치/실행 신호\n\n${runtimeEnvRows(analysis.runtimeEnvironmentReport.setupSignals)}\n\n## 컨테이너 신호\n\n${runtimeEnvRows(analysis.runtimeEnvironmentReport.containerSignals)}\n\n## 서비스 힌트\n\n${analysis.runtimeEnvironmentReport.serviceHints.map((hint) => `- ${hint.name}: ${hint.reason} (${hint.sourcePath})`).join("\n") || "- 없음"}\n\n## 부족한 신호\n\n${bulletsOrNone(analysis.runtimeEnvironmentReport.missingSignals)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.runtimeEnvironmentReport.learnerNextSteps)}\n`,
    "interface-map.md": `# 인터페이스 맵\n\n${analysis.interfaceMapReport.summary}\n\nSource pattern: ${analysis.interfaceMapReport.sourcePattern}\n\n## Route/Page 신호\n\n${interfaceMapRows(analysis.interfaceMapReport.routeSignals)}\n\n## API 신호\n\n${analysis.interfaceMapReport.apiSignals.map((item) => `- ${item.filePath}: ${item.method} ${item.pattern} ([원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## Component 신호\n\n${analysis.interfaceMapReport.componentSignals.map((item) => `- ${item.componentName}: ${item.filePath} ([원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## Data-flow 힌트\n\n${bulletsOrNone(analysis.interfaceMapReport.dataFlowHints)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.interfaceMapReport.learnerNextSteps)}\n`,
    "symbol-map.md": `# 심볼 맵\n\n${analysis.symbolMapReport.summary}\n\nSource pattern: ${analysis.symbolMapReport.sourcePattern}\n\n## 종류별 개수\n\n${recordBullets(analysis.symbolMapReport.symbolsByKind)}\n\n## 심볼\n\n${symbolRows(analysis.symbolMapReport.symbols)}\n\n## 심볼이 많은 파일\n\n${analysis.symbolMapReport.filesWithSymbols.map((item) => `- ${item.filePath}: ${item.count}개 ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n") || "- 없음"}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.symbolMapReport.learnerNextSteps)}\n`,
    "context-pack.md": `# Context Pack\n\n${analysis.contextPackReport.summary}\n\nSource pattern: ${analysis.contextPackReport.sourcePattern}\n\n## Token Budget\n\n${analysis.contextPackReport.budgetProfiles.map((profile) => `- ${profile.name}: ${profile.fits ? "fits" : `overflow ${profile.overflowTokens} tokens`} / limit ${profile.tokenLimit}`).join("\n")}\n\n## Split Output Plan\n\n${contextSplitPlanRows(analysis.contextPackReport.splitPlans)}\n\n## Token-heavy Files\n\n${contextPackRows(analysis.contextPackReport.topFiles)}\n\n## Directory Token Tree\n\n${analysis.contextPackReport.directoryTokenTree.map((item) => `- ${item.directory}: ${item.estimatedTokens} tokens / ${item.fileCount} files`).join("\n") || "- 없음"}\n\n## Pack 제외 항목\n\n${bulletsOrNone(analysis.contextPackReport.excludedFromPack)}\n\n## Security Notes\n\n${bulletsOrNone(analysis.contextPackReport.securityNotes)}\n\n## 다음 확인 단계\n\n${bulletsOrNone(analysis.contextPackReport.learnerNextSteps)}\n`,
    "coverage.md": `# 학습 커버리지\n\n${analysis.coverageReport.beginnerExplanation}\n\n- 전체 스캔 파일: ${analysis.coverageReport.totalScannedFiles}\n- 자세히 설명한 핵심 파일: ${analysis.coverageReport.coveredImportantFiles}\n- 커버리지 비율: ${(analysis.coverageReport.coverageRatio * 100).toFixed(1)}%\n- 소스 근거가 있는 핵심 파일: ${analysis.coverageReport.evidenceBackedFiles}\n- 소스 근거 비율: ${(analysis.coverageReport.evidenceCoverageRatio * 100).toFixed(1)}%\n- 소스 근거 종류: ${recordSummary(analysis.coverageReport.evidenceKindCounts)}\n\n## 소스 근거 종류\n\n${recordBullets(analysis.coverageReport.evidenceKindCounts)}\n\n## 우선 확인 폴더\n\n${analysis.coverageReport.highPriorityFolders.map((folder) => `- ${folder.folderPath}: ${folder.reason}`).join("\n")}\n\n## 아직 자세히 다루지 않은 후보\n\n${analysis.coverageReport.uncoveredImportantFiles.map((file) => `- ${file}`).join("\n") || "- 없음"}\n\n## 소스 근거가 부족한 파일\n\n${analysis.coverageReport.filesWithoutEvidence.map((file) => `- ${file}`).join("\n") || "- 없음"}\n`,
    "component-graph.md": `# 컴포넌트 그래프\n\n${analysis.componentGraphReport.beginnerExplanation}\n\n## 큰 그래프 요약\n\n- 전체 노드: ${analysis.componentGraphReport.summary.totalNodes}\n- 전체 관계: ${analysis.componentGraphReport.summary.totalEdges}\n- 노드 타입: ${Object.entries(analysis.componentGraphReport.summary.nodeTypeCounts).map(([type, count]) => `${type} ${count}`).join(", ")}\n- 핵심 허브: ${analysis.componentGraphReport.summary.topConnectedNodes.map((node) => `${node.label} (${node.degree})`).join(", ") || "없음"}\n\n${analysis.componentGraphReport.summary.largeRepoAdvice}\n\n## Mermaid\n\n\`\`\`mermaid\n${analysis.componentGraphReport.mermaid}\n\`\`\`\n\n## 노드\n\n${analysis.componentGraphReport.nodes.map((node) => `- ${node.label} [${node.type}]: ${node.summary}`).join("\n")}\n\n## 관계\n\n${analysis.componentGraphReport.edges.map((edge) => `- ${edge.from} -> ${edge.to}: ${edge.label}`).join("\n")}\n`,
    "incremental.md": `# 증분 분석\n\n${analysis.incrementalReport.beginnerExplanation}\n\n${analysis.incrementalReport.summary}\n\n## 커버리지 변화\n\n${analysis.incrementalReport.coverageDelta.summary}\n\n- 이전 비율: ${formatPercentOrNone(analysis.incrementalReport.coverageDelta.baselineCoverageRatio)}\n- 현재 비율: ${formatPercentOrNone(analysis.incrementalReport.coverageDelta.currentCoverageRatio)}\n- 변화: ${formatPointDelta(analysis.incrementalReport.coverageDelta.coverageRatioDelta)}\n\n## 추가된 파일\n\n${bulletsOrNone(analysis.incrementalReport.addedFiles)}\n\n## 변경된 파일\n\n${bulletsOrNone(analysis.incrementalReport.changedFiles)}\n\n## 삭제된 파일\n\n${bulletsOrNone(analysis.incrementalReport.removedFiles)}\n`,
    "flow.md": `# 실행 흐름\n\n## CLI\n\n${bullets(analysis.flowReport.cliFlow)}\n\n## App\n\n${bullets(analysis.flowReport.appFlow)}\n\n\`\`\`mermaid\n${analysis.flowReport.mermaid}\n\`\`\`\n`,
    "glossary.md": `# 용어 사전\n\n${analysis.glossary.map((term) => `## ${term.termKo} (${term.termEn})\n\n${term.simpleDefinition}\n\n${term.projectSpecificMeaning}`).join("\n\n")}\n`,
    "rebuild.md": `# 맨땅에서 따라 만들기\n\n${analysis.rebuildRoadmap.steps.map((step) => `## ${step.order}. ${step.title}\n\n${step.goal}\n\n${bullets(step.tasks)}\n\n완료 기준:\n\n${bullets(step.completionCriteria)}`).join("\n\n")}\n`,
    "quiz.md": `# 퀴즈\n\n${quiz.questions.map((question, index) => `## ${index + 1}. ${question.question}\n\nA. ${question.choices.A}\nB. ${question.choices.B}\nC. ${question.choices.C}\nD. ${question.choices.D}\n\n정답: ${question.correctChoice}\n\n${question.explanation}`).join("\n\n")}\n`,
    "wrong-notes.md": renderWrongNotesMarkdown(wrongNotes)
  };
}

export function renderWrongNotesMarkdown(wrongNotes: WrongNote[]): string {
  if (wrongNotes.length === 0) return "# 오답노트\n\n아직 오답이 없습니다.\n";
  return `# 오답노트\n\n${wrongNotes.map((note) => `## ${note.question}\n\n- 내가 고른 답: ${note.selectedChoice}\n- 정답: ${note.correctChoice}\n- 이유: ${note.explanation}\n- 놓친 개념: ${note.relatedConcepts.join(", ")}\n\n${note.miniLesson}\n`).join("\n")}`;
}

export function renderSessionVerificationMarkdown(result: StudySessionVerificationResult): string {
  const status = result.ok ? "PASS" : "FAIL";
  const checks = Object.entries(result.checks)
    .map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`)
    .join("\n");
  const failures = result.failures.length === 0
    ? "- 없음"
    : result.failures.map((failure) => `- ${failure.check}: ${failure.reason} at \`${failure.path}\`${failure.detail ? ` - ${failure.detail.replaceAll("`", "'")}` : ""}`).join("\n");
  return `# 세션 검증\n\n- 상태: ${status}\n- 세션 ID: ${result.sessionId ?? "unknown"}\n- 필수 산출물 검사: ${result.checkedRequiredArtifacts}\n- HTML 파일 검사: ${result.htmlExport?.checkedFiles ?? 0}\n- 소스 근거 검사: ${result.evidenceIndex?.checkedItems ?? 0}\n- 소스 파일 검사: ${result.evidenceIndex?.checkedSourceFiles ?? 0}\n- 소스 링크 검사: ${result.evidenceIndex?.checkedSourceLinks ?? 0}\n- 수업 링크 검사: ${result.evidenceIndex?.checkedLessonLinks ?? 0}\n\n## 검사 항목\n\n${checks}\n\n## 실패 항목\n\n${failures}\n`;
}

export function readmeStudy(session: StudySession): string {
  return `# ${session.repo} Study Session\n\n- Session: ${session.sessionId}\n- Source: ${session.sourceUrl ?? session.localSourcePath ?? session.repo}\n- Created: ${session.createdAt}\n- Mode: ${session.studyMode}\n- Learner level: ${session.learnerLevel}\n\nOpen \`html/index.html\` to continue learning.\nReview \`analysis/session-verification-report.json\` and \`markdown/session-verification.md\` to verify generated artifacts.\n`;
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function bulletsOrNone(items: string[]): string {
  return items.length === 0 ? "- 없음" : bullets(items);
}

function recordSummary(record: Record<string, number> | undefined): string {
  const entries = Object.entries(record ?? {});
  return entries.length === 0 ? "없음" : entries.map(([key, value]) => `${key} ${value}`).join(", ");
}

function recordBullets(record: Record<string, number> | undefined): string {
  const entries = Object.entries(record ?? {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return entries.length === 0 ? "- 없음" : entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function sourceEvidenceBullets(items: Array<{ line: number; kind: string; snippet: string }>, filePath: string): string {
  if (items.length === 0) return "- 기록된 소스 근거가 없습니다.";
  return items.map((item) => `- L${item.line} [${item.kind}] \`${item.snippet.replaceAll("`", "'")}\` ([원본](../source/${encodedPath(filePath)}))`).join("\n");
}

function sourceEvidenceIndexMarkdown(fileLessons: Array<{ filePath: string; sourceEvidence: Array<{ line: number; kind: string; snippet: string }> }>): string {
  const rows = fileLessons.flatMap((lesson) => lesson.sourceEvidence.map((item) => ({ ...item, filePath: lesson.filePath })));
  if (rows.length === 0) return "기록된 소스 근거가 없습니다.\n";
  return rows.map((item) => `## ${item.filePath}:L${item.line}\n\n- 종류: ${item.kind}\n- 파일 수업: [${item.filePath}](files.md#${markdownAnchor(item.filePath)})\n- 원본: [source/${item.filePath}](../source/${encodedPath(item.filePath)})\n\n\`${item.snippet.replaceAll("`", "'")}\``).join("\n\n");
}

function suggestedReadsMarkdown(items: Array<{ rank: number; filePath: string; reason: string; evidenceCount: number; relatedFileCount: number; lessonHref: string; sourceHref: string }>): string {
  if (items.length === 0) return "추천 읽기 후보가 없습니다.\n";
  return items.map((item) => `## ${item.rank}. ${item.filePath}\n\n- 이유: ${item.reason}\n- 소스 근거: ${item.evidenceCount}\n- 관련 파일: ${item.relatedFileCount}\n- 파일 수업: [${item.filePath}](../${item.lessonHref})\n- 원본: [${item.sourceHref}](../${item.sourceHref})`).join("\n\n");
}

function runtimeEnvRows(items: Array<{ filePath: string; signal: string; beginnerExplanation?: string; ecosystem?: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.signal}${item.ecosystem ? ` (${item.ecosystem})` : ""}${item.beginnerExplanation ? ` - ${item.beginnerExplanation}` : ""}`).join("\n");
}

function interfaceMapRows(items: Array<{ filePath: string; kind: string; signal: string; sourceHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.kind} - ${item.signal} ([원본](../${item.sourceHref}))`).join("\n");
}

function symbolRows(items: Array<{ filePath: string; name: string; kind: string; exported: boolean; sourceHref: string; lessonHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.name} [${item.kind}${item.exported ? ", exported" : ""}]: ${item.filePath} ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n");
}

function contextPackRows(items: Array<{ filePath: string; size: number; estimatedTokens: number; packReason: string; sourceHref: string; lessonHref: string }>): string {
  if (items.length === 0) return "- 없음";
  return items.map((item) => `- ${item.filePath}: ${item.estimatedTokens} tokens / ${item.size} bytes - ${item.packReason} ([파일 수업](../${item.lessonHref}), [원본](../${item.sourceHref}))`).join("\n");
}

function contextSplitPlanRows(plans: Array<{ name: string; maxBytes: number; partCount: number; parts: Array<{ partName: string; directories: string[]; fileCount: number; estimatedBytes: number; estimatedTokens: number; overLimit: boolean }>; oversizedDirectories: string[] }>): string {
  if (plans.length === 0) return "- 없음";
  return plans.map((plan) => `### ${plan.name}\n\n- max bytes: ${plan.maxBytes}\n- parts: ${plan.partCount}\n- oversized directories: ${plan.oversizedDirectories.join(", ") || "none"}\n\n${plan.parts.map((part) => `- ${part.partName}: ${part.estimatedBytes} bytes / ${part.estimatedTokens} tokens / ${part.fileCount} files / ${part.directories.join(", ")}${part.overLimit ? " / over limit" : ""}`).join("\n") || "- 없음"}`).join("\n\n");
}

function encodedPath(filePath: string): string {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

function markdownAnchor(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");
}

function formatPercentOrNone(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%`;
}

function formatPointDelta(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%p`;
}
