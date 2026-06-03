import type {
  AnalysisBundle,
} from "./scanner.js";
import type { Quiz, StudySession, WrongNote } from "@repotutor/shared";

export function markdownFiles(session: StudySession, analysis: AnalysisBundle, quiz: Quiz, wrongNotes: WrongNote[]): Record<string, string> {
  return {
    "overview.md": `# ${session.repo} 학습 개요\n\n${analysis.purposeReport.longExplanation}\n\n## 대상 사용자\n\n${bullets(analysis.purposeReport.targetUsers)}\n`,
    "language.md": `# 언어와 기술 스택\n\n주요 언어: **${analysis.languageReport.primaryLanguage}**\n\n${analysis.languageReport.languageRoles.map((role) => `## ${role.language}\n\n${role.beginnerExplanation}\n\n${role.tradeoffs}`).join("\n\n")}\n`,
    "architecture.md": `# 아키텍처\n\n${analysis.architectureReport.explanation}\n\n\`\`\`mermaid\n${analysis.architectureReport.mermaid}\n\`\`\`\n`,
    "folders.md": `# 폴더 수업\n\n${analysis.folderLessons.map((lesson) => `## ${lesson.folderPath}\n\n${lesson.beginnerExplanation}\n\n- 왜 필요한가: ${lesson.whyItExists}\n- 다시 만들기: ${lesson.rebuildAdvice}`).join("\n\n")}\n`,
    "files.md": `# 핵심 파일 수업\n\n${analysis.fileLessons.map((lesson) => `## ${lesson.filePath}\n\n${lesson.beginnerExplanation}\n\n- 역할: ${lesson.role}\n- 다시 만들기: ${lesson.rebuildAdvice}\n\n### 소스 근거\n\n${sourceEvidenceBullets(lesson.sourceEvidence ?? [])}`).join("\n\n")}\n`,
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

export function readmeStudy(session: StudySession): string {
  return `# ${session.repo} Study Session\n\n- Session: ${session.sessionId}\n- Source: ${session.sourceUrl ?? session.localSourcePath ?? session.repo}\n- Created: ${session.createdAt}\n- Mode: ${session.studyMode}\n- Learner level: ${session.learnerLevel}\n\nOpen \`html/index.html\` to continue learning.\n`;
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

function sourceEvidenceBullets(items: Array<{ line: number; kind: string; snippet: string }>): string {
  if (items.length === 0) return "- 기록된 소스 근거가 없습니다.";
  return items.map((item) => `- L${item.line} [${item.kind}] \`${item.snippet.replaceAll("`", "'")}\``).join("\n");
}

function formatPercentOrNone(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%`;
}

function formatPointDelta(value: number | null): string {
  return value === null ? "없음" : `${(value * 100).toFixed(1)}%p`;
}
