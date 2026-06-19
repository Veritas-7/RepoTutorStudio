import path from "node:path";
import { htmlAnchor } from "@repotutor/shared";
import type { CoverageReport, DecisionRecordReport, DependencyHealthReport, DependencyReport, FileLesson, FlowReport, IncrementalReport, ProjectActivityReport, SourceSnapshotReport } from "@repotutor/shared";
import type { AnalysisContext } from "./analyzer.js";
import { encodedPath } from "./source-links.js";

export function buildFlowReport(fileLessons: FileLesson[], dependencyReport: DependencyReport): FlowReport {
  const starts = fileLessons.filter((file) => /main|index|cli|app|lib|server/i.test(path.basename(file.filePath))).slice(0, 8).map((file) => file.filePath);
  return {
    startPoints: starts,
    cliFlow: ["사용자가 명령어 또는 UI 입력을 제공한다.", "입력 판별(intake)이 source type을 결정한다.", "scanner가 파일과 폴더를 읽는다.", "lesson/quiz/html 생성기가 결과를 저장한다."],
    appFlow: ["Tauri UI가 사용자의 입력을 받는다.", "Rust command가 Node sidecar를 호출한다.", "Node sidecar가 shared core pipeline을 실행한다.", "HTML preview와 session list가 갱신된다."],
    dataFlow: dependencyReport.manifests.length > 0 ? dependencyReport.manifests.map((manifest) => `${manifest.filePath} -> dependency report`) : ["source files -> analysis JSON -> Markdown -> HTML"],
    mermaid: "flowchart LR\n  Input[User input] --> Intake\n  Intake --> Scan\n  Scan --> Lessons\n  Lessons --> Quiz\n  Quiz --> WrongNotes\n  WrongNotes --> HTML"
  };
}


export function buildDependencyHealthReport(fileLessons: FileLesson[]): DependencyHealthReport {
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


export function buildProjectActivityReport(
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
        `${Math.round(sizeKb * 10) / 10} KiB generated session \`source/\` snapshot size`,
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
    : "학습 세션 소스에는 Git 히스토리가 없어서 생성된 세션 `source/` 스냅샷과 정적 dependency/evidence 신호만 사용합니다.";

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


export function emptyIncrementalReport(coverageReport: CoverageReport): IncrementalReport {
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
