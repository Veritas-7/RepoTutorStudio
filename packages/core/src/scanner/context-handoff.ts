import path from "node:path";
import {
  htmlAnchor,
  type AgentMemoryReport,
  type ArchitectureReport,
  type ComponentGraphReport,
  type ContextPackReport,
  type DecisionRecordReport,
  type FileLesson,
  type GraphQueryReport,
  type InterfaceMapReport,
  type LanguageReport,
  type McpHandoffReport,
  type PurposeReport,
  type RepoMap,
  type RuntimeEnvironmentReport,
  type SuggestedReadsReport,
  type TutorialAbstractionReport
} from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export async function buildContextPackReport(walk: WalkResult, fileLessons: FileLesson[]): Promise<ContextPackReport> {
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
  const splitPlans = buildContextSplitPlans(packFiles);
  const contextPackSignals = await buildContextPackSignals(walk, {
    packFiles,
    budgetProfiles,
    directoryTokenTree,
    splitPlans,
    excludedFromPack
  });
  return {
    summary: `Repomix식 context pack: ${packFiles.length}개 텍스트 파일을 약 ${totalEstimatedTokens.toLocaleString("en-US")} tokens로 추정하고 예산별 적합성과 ${contextPackSignals.filter((item) => item.readiness === "ready").length}개 context pack signal을 계산했습니다.`,
    sourcePattern: "Repomix token counting git-aware ignore AI-friendly context pack output styles compression token budget split output MCP skill generation",
    totalIncludedFiles: packFiles.length,
    totalIncludedBytes,
    totalEstimatedTokens,
    budgetProfiles,
    topFiles: packFiles.slice(0, 20),
    directoryTokenTree,
    splitPlans,
    contextPackSignals,
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

type ContextPackSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function contextPackSourceFiles(walk: WalkResult): Promise<ContextPackSourceFile[]> {
  const candidates = walk.files
    .filter((file) => file.isTextCandidate && contextPackInspectablePath(file.relPath))
    .slice(0, 160);
  const sourceFiles: ContextPackSourceFile[] = [];
  for (const file of candidates) {
    const text = await readTextIfSafe(file.absPath, 120_000);
    if (!text) continue;
    if (!contextPackPathSignal(file.relPath) && !contextPackContentSignal(text)) continue;
    sourceFiles.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return sourceFiles;
}

function contextPackInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|readme\.(md|txt)|repomix\.config\.(json|jsonc|js|cjs|mjs|ts)|\.repomixignore|\.ignore|\.gitignore)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /^\.claude\/(skills|plugins)\//i.test(filePath)
    || /(^|\/)(repomix|context|prompt|ai|llm|mcp|skill).*\.(md|mdx|json|jsonc|ya?ml|[cm]?[jt]s)$/i.test(filePath);
}

function contextPackPathSignal(filePath: string): boolean {
  return /repomix|context|prompt|ai|llm|mcp|skill|\.repomixignore|\.gitignore|\.ignore/i.test(filePath);
}

function contextPackContentSignal(text: string): boolean {
  return /repomix|context pack|AI-friendly|token-count|tokenBudget|token-budget|split-output|includeDiffs|includeLogs|remote-trust-config|security check|Secretlint|Tree-sitter|pack_codebase|pack_remote_repository|skill-generate|MCP/i.test(text);
}

async function buildContextPackSignals(
  walk: WalkResult,
  facts: {
    packFiles: ContextPackReport["topFiles"];
    budgetProfiles: ContextPackReport["budgetProfiles"];
    directoryTokenTree: ContextPackReport["directoryTokenTree"];
    splitPlans: ContextPackReport["splitPlans"];
    excludedFromPack: string[];
  }
): Promise<ContextPackReport["contextPackSignals"]> {
  const sourceFiles = await contextPackSourceFiles(walk);
  const generatedSignals: ContextPackReport["contextPackSignals"] = [
    {
      signal: "text-candidate-filter",
      readiness: facts.packFiles.length > 0 ? "ready" : "missing",
      evidence: facts.packFiles.length > 0 ? `${facts.packFiles.length} safe text file(s) are context pack candidates.` : "No safe text pack candidates were found.",
      relatedHref: "html/context-pack.html"
    },
    {
      signal: "token-estimate",
      readiness: facts.packFiles.length > 0 ? "ready" : "missing",
      evidence: facts.packFiles.length > 0 ? "RepoTutor estimated tokens from byte size for deterministic static budgeting." : "Token estimate was not produced.",
      relatedHref: "html/context-pack.html"
    },
    {
      signal: "budget-profiles",
      readiness: facts.budgetProfiles.length > 0 ? "ready" : "missing",
      evidence: facts.budgetProfiles.length > 0 ? `${facts.budgetProfiles.length} context budget profile(s) were evaluated.` : "No context budget profiles were evaluated.",
      relatedHref: "html/context-pack.html"
    },
    {
      signal: "directory-token-tree",
      readiness: facts.directoryTokenTree.length > 0 ? "ready" : "missing",
      evidence: facts.directoryTokenTree.length > 0 ? `${facts.directoryTokenTree.length} directory token bucket(s) were generated.` : "No directory token tree was generated.",
      relatedHref: "html/context-pack.html"
    },
    {
      signal: "top-files",
      readiness: facts.packFiles.length > 0 ? "ready" : "missing",
      evidence: facts.packFiles.length > 0 ? `${facts.packFiles.slice(0, 20).length} token-heavy top file(s) were ranked.` : "No top file ranking was generated.",
      relatedHref: "html/context-pack.html"
    },
    {
      signal: "split-output-plan",
      readiness: facts.splitPlans.some((plan) => plan.partCount > 0) ? "ready" : "missing",
      evidence: facts.splitPlans.some((plan) => plan.partCount > 0) ? `${facts.splitPlans.length} split output profile(s) were planned.` : "No split output plan was generated.",
      relatedHref: "html/context-pack.html"
    },
    {
      signal: "security-exclusions",
      readiness: "ready",
      evidence: walk.secretCandidatePaths.length > 0
        ? `${walk.secretCandidatePaths.length} secret-like path(s) were excluded from context packing.`
        : facts.excludedFromPack.length > 0
          ? `${facts.excludedFromPack.length} non-pack path(s) were excluded from context packing.`
          : "RepoTutor context pack policy excludes secret-like paths and binary/media files; no matching path was present in this safe snapshot.",
      relatedHref: "html/context-pack.html"
    }
  ];
  const specs: Array<{ signal: ContextPackReport["contextPackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "repomix-config", pattern: /(^|\/)repomix\.config\.(json|jsonc|js|cjs|mjs|ts)$|defineConfig\s*\(|repomixConfig/i, evidence: "Repomix config file or config helper evidence was detected." },
    { signal: "repomix-ignore", pattern: /(^|\/)\.repomixignore$|\.repomixignore/i, evidence: ".repomixignore evidence was detected." },
    { signal: "include-patterns", pattern: /--include\b|\binclude\s*:\s*\[|includePatterns/i, evidence: "include pattern evidence was detected." },
    { signal: "ignore-patterns", pattern: /--ignore\b|\bignore\s*:\s*\{|customPatterns|ignorePatterns/i, evidence: "ignore pattern evidence was detected." },
    { signal: "gitignore-aware", pattern: /--no-gitignore|useGitignore|\.gitignore/i, evidence: "gitignore-aware filtering evidence was detected." },
    { signal: "default-ignore-patterns", pattern: /--no-default-patterns|useDefaultPatterns|defaultIgnore/i, evidence: "default ignore pattern control evidence was detected." },
    { signal: "max-file-size", pattern: /maxFileSize|--max-file-size|input\s*:\s*\{[\s\S]{0,300}maxFileSize/i, evidence: "max file size guard evidence was detected." },
    { signal: "output-style", pattern: /--style\b|\bstyle\s*:\s*['"]?(xml|markdown|json|plain)|repomixOutputStyle/i, evidence: "output style selection evidence was detected." },
    { signal: "xml-output", pattern: /--style\s+xml|style\s*:\s*['"]xml['"]|repomix-output\.xml/i, evidence: "XML output evidence was detected." },
    { signal: "markdown-output", pattern: /--style\s+markdown|style\s*:\s*['"]markdown['"]|repomix-output\.md/i, evidence: "Markdown output evidence was detected." },
    { signal: "json-output", pattern: /--style\s+json|style\s*:\s*['"]json['"]|repomix-output\.json/i, evidence: "JSON output evidence was detected." },
    { signal: "plain-output", pattern: /--style\s+plain|style\s*:\s*['"]plain['"]|repomix-output\.txt/i, evidence: "Plain text output evidence was detected." },
    { signal: "stdout-output", pattern: /--stdout|\bstdout\s*:/i, evidence: "stdout output evidence was detected." },
    { signal: "stdin-input", pattern: /--stdin|\bstdin\b|file paths from stdin/i, evidence: "stdin file list evidence was detected." },
    { signal: "copy-clipboard", pattern: /--copy|copyToClipboard|copy.*clipboard/i, evidence: "copy-to-clipboard evidence was detected." },
    { signal: "line-numbers", pattern: /--output-show-line-numbers|showLineNumbers|line numbers/i, evidence: "line-number output evidence was detected." },
    { signal: "file-summary", pattern: /--no-file-summary|fileSummary|file summary/i, evidence: "file summary control evidence was detected." },
    { signal: "directory-structure", pattern: /--no-directory-structure|directoryStructure|directory structure/i, evidence: "directory structure output evidence was detected." },
    { signal: "remove-comments", pattern: /--remove-comments|removeComments/i, evidence: "comment removal evidence was detected." },
    { signal: "remove-empty-lines", pattern: /--remove-empty-lines|removeEmptyLines/i, evidence: "empty-line removal evidence was detected." },
    { signal: "truncate-base64", pattern: /--truncate-base64|truncateBase64/i, evidence: "base64 truncation evidence was detected." },
    { signal: "compress", pattern: /--compress|\bcompress\s*:\s*true|Tree-sitter/i, evidence: "Tree-sitter compression evidence was detected." },
    { signal: "token-count-tree", pattern: /--token-count-tree|tokenCountTree/i, evidence: "token count tree evidence was detected." },
    { signal: "token-budget", pattern: /--token-budget|tokenBudget/i, evidence: "token budget guard evidence was detected." },
    { signal: "git-diffs", pattern: /--include-diffs|includeDiffs|git diff/i, evidence: "git diff context evidence was detected." },
    { signal: "git-logs", pattern: /--include-logs|includeLogs|git log/i, evidence: "git log context evidence was detected." },
    { signal: "remote-repository", pattern: /--remote\b|pack_remote_repository|remote repository/i, evidence: "remote repository packing evidence was detected." },
    { signal: "remote-branch", pattern: /--remote-branch|remoteBranch|remote branch/i, evidence: "remote branch or commit selection evidence was detected." },
    { signal: "remote-trust-config", pattern: /--remote-trust-config|remoteTrustConfig|REPOMIX_REMOTE_TRUST_CONFIG|trust.*remote.*config/i, evidence: "remote config trust boundary evidence was detected." },
    { signal: "security-check", pattern: /--no-security-check|enableSecurityCheck|Secretlint|security check/i, evidence: "security check evidence was detected." },
    { signal: "mcp-server", pattern: /--mcp|pack_codebase|pack_remote_repository|Model Context Protocol/i, evidence: "MCP integration evidence was detected." },
    { signal: "skill-generation", pattern: /--skill-generate|--skill-output|skillGenerate|generateSkill/i, evidence: "agent skill generation evidence was detected." }
  ];
  return [
    ...generatedSignals,
    ...specs.map((spec) => {
      const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
      return {
        signal: spec.signal,
        readiness: match ? "ready" as const : sourceFiles.length > 0 ? "external" as const : "missing" as const,
        evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} evidence was not detected in source files.`,
        relatedHref: match?.sourceHref ?? "html/context-pack.html"
      };
    })
  ];
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

export function buildMcpHandoffReport(repoMap: RepoMap, contextPackReport: ContextPackReport): McpHandoffReport {
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
      "RepoTutor already excludes secret-like paths from generated session `source/` snapshots.",
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

export function buildAgentMemoryReport(
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

export function buildGraphQueryReport(componentGraphReport: ComponentGraphReport): GraphQueryReport {
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

export function buildTutorialAbstractionReport(
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

export function buildDecisionRecordReport(
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

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

