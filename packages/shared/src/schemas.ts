import { z } from "zod";

export const StudyModeSchema = z.enum(["quick", "standard", "deep"]);
export const LearnerLevelSchema = z.enum(["beginner", "junior", "senior"]);
export const SourceTypeSchema = z.enum(["github", "local", "zip", "skill", "cli-anything"]);

export const SourceInputSchema = z.object({
  raw: z.string().min(1),
  sourceType: SourceTypeSchema,
  owner: z.string(),
  repo: z.string(),
  branch: z.string(),
  sourceUrl: z.string().optional(),
  localSourcePath: z.string().optional()
});

export const OutputPathsSchema = z.object({
  root: z.string(),
  source: z.string(),
  analysis: z.string(),
  markdown: z.string(),
  codex: z.string(),
  html: z.string()
});

export const QuizSummarySchema = z.object({
  totalQuestions: z.number().int().nonnegative(),
  attempts: z.number().int().nonnegative(),
  latestScore: z.number().nullable(),
  wrongCount: z.number().int().nonnegative()
});

export const StudySessionSchema = z.object({
  sessionId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sourceType: SourceTypeSchema,
  sourceUrl: z.string().nullable(),
  localSourcePath: z.string().nullable(),
  owner: z.string(),
  repo: z.string(),
  branch: z.string(),
  commitHash: z.string(),
  studyMode: StudyModeSchema,
  learnerLevel: LearnerLevelSchema,
  language: z.string(),
  status: z.enum(["created", "running", "complete", "failed"]),
  outputPaths: OutputPathsSchema,
  codexThreadId: z.string().nullable(),
  quizSummary: QuizSummarySchema,
  wrongNoteSummary: z.object({
    totalWrongNotes: z.number().int().nonnegative(),
    unresolved: z.number().int().nonnegative(),
    topConcepts: z.array(z.string())
  })
});

export const RepoFolderSchema = z.object({
  folderPath: z.string(),
  fileCount: z.number().int().nonnegative(),
  representativeFiles: z.array(z.string()),
  inferredRole: z.string(),
  depth: z.number().int().nonnegative()
});

export const RepoMapSchema = z.object({
  root: z.string(),
  totalFiles: z.number().int().nonnegative(),
  totalFolders: z.number().int().nonnegative(),
  totalBytes: z.number().int().nonnegative(),
  extensionDistribution: z.record(z.string(), z.number().int().nonnegative()),
  excludedPaths: z.array(z.string()),
  secretCandidatePaths: z.array(z.string()),
  folders: z.array(RepoFolderSchema),
  treeMarkdown: z.string()
});

export const LanguageReportSchema = z.object({
  primaryLanguage: z.string(),
  secondaryLanguages: z.array(z.string()),
  languageRoles: z.array(z.object({
    language: z.string(),
    fileCount: z.number().int().nonnegative(),
    role: z.string(),
    beginnerExplanation: z.string(),
    tradeoffs: z.string()
  }))
});

export const DependencyReportSchema = z.object({
  manifests: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.string(),
    dependencies: z.array(z.object({
      name: z.string(),
      role: z.string(),
      beginnerExplanation: z.string(),
      whyNeeded: z.string(),
      whatIsHardWithoutIt: z.string()
    }))
  }))
});

export const PurposeReportSchema = z.object({
  oneLineSummary: z.string(),
  longExplanation: z.string(),
  targetUsers: z.array(z.string()),
  solvedProblems: z.array(z.string()),
  majorFeatures: z.array(z.string()),
  similarType: z.string(),
  beginnerAnalogy: z.string(),
  evidence: z.array(z.string())
});

export const ArchitectureReportSchema = z.object({
  architectureStyle: z.string(),
  explanation: z.string(),
  evidence: z.array(z.string()),
  mermaid: z.string()
});

export const FolderLessonSchema = z.object({
  folderPath: z.string(),
  role: z.string(),
  beginnerExplanation: z.string(),
  whyItExists: z.string(),
  whatWouldBreakIfRemoved: z.string(),
  relatedFolders: z.array(z.string()),
  importantFiles: z.array(z.string()),
  designReasoning: z.string(),
  rebuildAdvice: z.string()
});

export const FileLessonSchema = z.object({
  filePath: z.string(),
  role: z.string(),
  beginnerExplanation: z.string(),
  whyItExists: z.string(),
  sourceEvidence: z.array(z.object({
    line: z.number().int().positive(),
    kind: z.enum(["import", "export", "entry", "config", "test", "text"]),
    snippet: z.string()
  })),
  keyExports: z.array(z.string()),
  keyImports: z.array(z.string()),
  relatedFiles: z.array(z.string()),
  executionFlowPosition: z.string(),
  rebuildAdvice: z.string(),
  glossaryTerms: z.array(z.string())
});

export const CoverageReportSchema = z.object({
  totalScannedFiles: z.number().int().nonnegative(),
  coveredImportantFiles: z.number().int().nonnegative(),
  coverageRatio: z.number().min(0).max(1),
  evidenceBackedFiles: z.number().int().nonnegative(),
  evidenceCoverageRatio: z.number().min(0).max(1),
  evidenceKindCounts: z.record(z.string(), z.number().int().nonnegative()),
  filesWithoutEvidence: z.array(z.string()),
  uncoveredImportantFiles: z.array(z.string()),
  highPriorityFolders: z.array(z.object({
    folderPath: z.string(),
    reason: z.string()
  })),
  beginnerExplanation: z.string()
});

export const EvidenceIndexReportSchema = z.object({
  totalEvidenceItems: z.number().int().nonnegative(),
  evidenceByKind: z.record(z.string(), z.number().int().nonnegative()),
  evidenceByFile: z.record(z.string(), z.number().int().nonnegative()),
  items: z.array(z.object({
    filePath: z.string(),
    line: z.number().int().positive(),
    kind: z.enum(["import", "export", "entry", "config", "test", "text"]),
    snippet: z.string(),
    lessonHref: z.string(),
    sourcePath: z.string(),
    sourceHref: z.string()
  }))
});

export const SuggestedReadsReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  items: z.array(z.object({
    rank: z.number().int().positive(),
    filePath: z.string(),
    reason: z.string(),
    evidenceCount: z.number().int().nonnegative(),
    relatedFileCount: z.number().int().nonnegative(),
    lessonHref: z.string(),
    sourceHref: z.string()
  }))
});

export const RuntimeEnvironmentReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  detectedManifests: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.string(),
    signal: z.string()
  })),
  setupSignals: z.array(z.object({
    filePath: z.string(),
    signal: z.string(),
    beginnerExplanation: z.string()
  })),
  containerSignals: z.array(z.object({
    filePath: z.string(),
    signal: z.string(),
    beginnerExplanation: z.string()
  })),
  serviceHints: z.array(z.object({
    name: z.string(),
    reason: z.string(),
    sourcePath: z.string()
  })),
  missingSignals: z.array(z.string()),
  learnerNextSteps: z.array(z.string())
});

export const InterfaceMapReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  routeSignals: z.array(z.object({
    filePath: z.string(),
    kind: z.string(),
    signal: z.string(),
    sourceHref: z.string()
  })),
  apiSignals: z.array(z.object({
    filePath: z.string(),
    method: z.string(),
    pattern: z.string(),
    sourceHref: z.string()
  })),
  componentSignals: z.array(z.object({
    filePath: z.string(),
    componentName: z.string(),
    sourceHref: z.string()
  })),
  dataFlowHints: z.array(z.string()),
  learnerNextSteps: z.array(z.string())
});

export const SymbolMapReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  totalSymbols: z.number().int().nonnegative(),
  symbolsByKind: z.record(z.string(), z.number().int().nonnegative()),
  symbols: z.array(z.object({
    filePath: z.string(),
    name: z.string(),
    kind: z.enum(["function", "class", "constant", "interface", "type"]),
    exported: z.boolean(),
    sourceHref: z.string(),
    lessonHref: z.string()
  })),
  filesWithSymbols: z.array(z.object({
    filePath: z.string(),
    count: z.number().int().nonnegative(),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ApiReferenceReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  entryPoints: z.array(z.object({
    filePath: z.string(),
    reason: z.string(),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  publicSymbols: z.array(z.object({
    name: z.string(),
    kind: z.enum(["function", "class", "constant", "interface", "type"]),
    category: z.enum(["value", "type", "class", "module"]),
    filePath: z.string(),
    signature: z.string(),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  kindCounts: z.record(z.string(), z.number().int().nonnegative()),
  categoryCounts: z.record(z.string(), z.number().int().nonnegative()),
  exportWarnings: z.array(z.object({
    filePath: z.string(),
    symbolName: z.string(),
    message: z.string(),
    suggestion: z.string(),
    sourceHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ContextPackReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  totalIncludedFiles: z.number().int().nonnegative(),
  totalIncludedBytes: z.number().int().nonnegative(),
  totalEstimatedTokens: z.number().int().nonnegative(),
  budgetProfiles: z.array(z.object({
    name: z.string(),
    tokenLimit: z.number().int().positive(),
    fits: z.boolean(),
    overflowTokens: z.number().int().nonnegative()
  })),
  topFiles: z.array(z.object({
    filePath: z.string(),
    size: z.number().int().nonnegative(),
    estimatedTokens: z.number().int().nonnegative(),
    packReason: z.string(),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  directoryTokenTree: z.array(z.object({
    directory: z.string(),
    fileCount: z.number().int().nonnegative(),
    estimatedTokens: z.number().int().nonnegative()
  })),
  splitPlans: z.array(z.object({
    name: z.string(),
    maxBytes: z.number().int().positive(),
    partCount: z.number().int().nonnegative(),
    parts: z.array(z.object({
      partName: z.string(),
      directories: z.array(z.string()),
      fileCount: z.number().int().nonnegative(),
      estimatedBytes: z.number().int().nonnegative(),
      estimatedTokens: z.number().int().nonnegative(),
      overLimit: z.boolean()
    })),
    oversizedDirectories: z.array(z.string())
  })),
  excludedFromPack: z.array(z.string()),
  securityNotes: z.array(z.string()),
  learnerNextSteps: z.array(z.string())
});

export const McpHandoffReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tools: z.array(z.object({
    name: z.enum(["getCodebase", "getRemoteCodebase", "saveCodebase"]),
    purpose: z.string(),
    useWhen: z.string(),
    recommendedPrompt: z.string(),
    inputHints: z.array(z.string())
  })),
  prompts: z.array(z.object({
    title: z.string(),
    prompt: z.string(),
    relatedReportHref: z.string()
  })),
  safetyNotes: z.array(z.string()),
  learnerNextSteps: z.array(z.string())
});

export const AgentMemoryReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tokenSavings: z.object({
    rawCodeReadTokens: z.number().int().nonnegative(),
    graphQueryTokenTarget: z.number().int().positive(),
    estimatedReductionX: z.number().nonnegative()
  }),
  layers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    generatedArtifact: z.string(),
    useBefore: z.string()
  })),
  memoryNotes: z.array(z.object({
    title: z.string(),
    noteType: z.enum(["project-context", "context-navigation", "session-log"]),
    frontmatter: z.array(z.object({
      key: z.string(),
      value: z.string()
    })),
    body: z.string(),
    relatedReportHref: z.string()
  })),
  contextNavigationRules: z.array(z.string()),
  learnerNextSteps: z.array(z.string())
});

export const GraphQueryReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  queryModes: z.array(z.object({
    name: z.enum(["query", "path", "explain"]),
    commandShape: z.string(),
    purpose: z.string(),
    useWhen: z.string()
  })),
  nodeExplanations: z.array(z.object({
    nodeId: z.string(),
    label: z.string(),
    type: z.string(),
    question: z.string(),
    href: z.string().nullable()
  })),
  pathPrompts: z.array(z.object({
    from: z.string(),
    to: z.string(),
    question: z.string(),
    reason: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TutorialAbstractionReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  abstractions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    chapterNumber: z.number().int().positive(),
    chapterGoal: z.string(),
    relevantFiles: z.array(z.object({
      filePath: z.string(),
      lessonHref: z.string(),
      sourceHref: z.string()
    })),
    relationshipCount: z.number().int().nonnegative()
  })),
  relationships: z.array(z.object({
    fromId: z.string(),
    toId: z.string(),
    label: z.string(),
    reason: z.string()
  })),
  chapterOrder: z.array(z.object({
    chapterNumber: z.number().int().positive(),
    abstractionId: z.string(),
    title: z.string(),
    whyNow: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DecisionRecordReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  statusCounts: z.record(z.string(), z.number().int().nonnegative()),
  packageScopes: z.array(z.object({
    name: z.string(),
    path: z.string(),
    adrFolder: z.string(),
    recordCount: z.number().int().nonnegative()
  })),
  records: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(["draft", "proposed", "rejected", "accepted", "deprecated", "superseded"]),
    scope: z.string(),
    context: z.string(),
    decision: z.string(),
    consequences: z.object({
      positive: z.array(z.string()),
      negative: z.array(z.string())
    }),
    relatedReports: z.array(z.object({
      label: z.string(),
      href: z.string()
    })),
    tags: z.array(z.string())
  })),
  timeline: z.array(z.object({
    sequence: z.number().int().positive(),
    recordId: z.string(),
    title: z.string(),
    status: z.string(),
    scope: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DependencyHealthReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  totalLocalDependencies: z.number().int().nonnegative(),
  localDependencyEdges: z.array(z.object({
    fromFile: z.string(),
    toFile: z.string(),
    importText: z.string(),
    dependencyType: z.enum(["local-import", "unresolved-local-import"]),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  cycles: z.array(z.object({
    id: z.string(),
    files: z.array(z.string()),
    severity: z.enum(["warn", "error"]),
    suggestion: z.string()
  })),
  orphanModules: z.array(z.object({
    filePath: z.string(),
    reason: z.string(),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  ruleViolations: z.array(z.object({
    ruleName: z.string(),
    severity: z.enum(["info", "warn", "error"]),
    fromFile: z.string(),
    toFile: z.string().nullable(),
    message: z.string(),
    suggestion: z.string()
  })),
  graphMetrics: z.object({
    nodeCount: z.number().int().nonnegative(),
    edgeCount: z.number().int().nonnegative(),
    maxFanIn: z.number().int().nonnegative(),
    maxFanOut: z.number().int().nonnegative(),
    topFanIn: z.array(z.object({
      filePath: z.string(),
      count: z.number().int().nonnegative()
    })),
    topFanOut: z.array(z.object({
      filePath: z.string(),
      count: z.number().int().nonnegative()
    }))
  }),
  learnerNextSteps: z.array(z.string())
});

export const SearchIndexReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  totalDocuments: z.number().int().nonnegative(),
  totalTerms: z.number().int().nonnegative(),
  documents: z.array(z.object({
    id: z.string(),
    title: z.string(),
    href: z.string(),
    section: z.string(),
    sourcePath: z.string().nullable(),
    wordCount: z.number().int().nonnegative(),
    filters: z.record(z.string(), z.array(z.string())),
    meta: z.record(z.string(), z.string()),
    anchors: z.array(z.object({
      id: z.string(),
      text: z.string(),
      href: z.string()
    })),
    topTerms: z.array(z.string())
  })),
  termIndex: z.array(z.object({
    term: z.string(),
    documentCount: z.number().int().nonnegative(),
    documents: z.array(z.string())
  })),
  filterIndex: z.array(z.object({
    filter: z.string(),
    values: z.array(z.object({
      value: z.string(),
      documentCount: z.number().int().nonnegative()
    }))
  })),
  metadataFields: z.array(z.string()),
  learnerNextSteps: z.array(z.string())
});

export const LearningJournalReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  focusGoals: z.array(z.object({
    label: z.string(),
    value: z.string(),
    evidenceHref: z.string()
  })),
  masteryLevels: z.array(z.object({
    level: z.enum(["need-to-explore", "learning", "confident"]),
    label: z.string(),
    concepts: z.array(z.object({
      concept: z.string(),
      status: z.string(),
      reason: z.string(),
      reviewPrompt: z.string(),
      relatedHref: z.string()
    }))
  })),
  openQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    promptType: z.enum(["prediction", "trace", "design-reasoning", "comparison", "error-prediction", "meta"]),
    relatedHref: z.string(),
    sourcePattern: z.string()
  })),
  spacedReviewQueue: z.array(z.object({
    concept: z.string(),
    reviewBy: z.string(),
    reviewNumber: z.number().int().positive(),
    prompt: z.string(),
    relatedHref: z.string()
  })),
  ahaMoments: z.array(z.object({
    title: z.string(),
    insight: z.string(),
    relatedHref: z.string()
  })),
  sessionLog: z.array(z.object({
    explored: z.string(),
    learned: z.array(z.string()),
    struggledWith: z.array(z.string()),
    next: z.array(z.string())
  })),
  socraticPrompts: z.array(z.object({
    category: z.string(),
    question: z.string(),
    useWhen: z.string(),
    relatedHref: z.string(),
    hintLevels: z.array(z.string())
  })),
  journalTemplateMarkdown: z.string(),
  learnerNextSteps: z.array(z.string())
});

export const ProjectActivityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  historyAvailability: z.object({
    mode: z.enum(["snapshot-only", "git-metadata", "unavailable"]),
    reason: z.string(),
    sourceType: SourceTypeSchema.nullable(),
    sourceUrl: z.string().nullable(),
    localSourcePath: z.string().nullable(),
    branch: z.string().nullable(),
    commitHash: z.string().nullable()
  }),
  activitySignals: z.array(z.object({
    label: z.string(),
    value: z.string(),
    explanation: z.string(),
    relatedHref: z.string()
  })),
  hotspotCandidates: z.array(z.object({
    filePath: z.string(),
    score: z.number().min(0),
    reason: z.string(),
    signals: z.array(z.string()),
    lessonHref: z.string(),
    sourceHref: z.string()
  })),
  deadCodeCandidates: z.array(z.object({
    filePath: z.string(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
    relatedHref: z.string(),
    sourceHref: z.string()
  })),
  reviewQueues: z.array(z.object({
    queue: z.string(),
    purpose: z.string(),
    items: z.array(z.object({
      target: z.string(),
      action: z.string(),
      why: z.string(),
      relatedHref: z.string()
    }))
  })),
  architectureDecisionPrompts: z.array(z.object({
    question: z.string(),
    trigger: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CodeMetricsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  totals: z.object({
    files: z.number().int().nonnegative(),
    lines: z.number().int().nonnegative(),
    codeLines: z.number().int().nonnegative(),
    commentLines: z.number().int().nonnegative(),
    blankLines: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    complexityDensity: z.number().nonnegative()
  }),
  languageMetrics: z.array(z.object({
    language: z.string(),
    fileCount: z.number().int().nonnegative(),
    lines: z.number().int().nonnegative(),
    codeLines: z.number().int().nonnegative(),
    commentLines: z.number().int().nonnegative(),
    blankLines: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    complexityDensity: z.number().nonnegative(),
    evidence: z.string()
  })),
  hotspots: z.array(z.object({
    filePath: z.string(),
    language: z.string(),
    lines: z.number().int().nonnegative(),
    codeLines: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    complexityDensity: z.number().nonnegative(),
    hotspotScore: z.number().nonnegative(),
    readingPriority: z.enum(["high", "medium", "low"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["scc", "lizard", "tokei", "cloc", "radon", "eslint-complexity", "complexity-report", "locomo", "cocomo", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metricSignals: z.array(z.object({
    signal: z.enum(["loc", "blank-lines", "comment-lines", "code-lines", "cyclomatic", "cognitive", "function-count", "function-length", "parameter-count", "halstead", "cocomo", "locomo", "dryness", "hotspots", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["json-output", "csv-output", "html-report", "openmetrics", "threshold", "ci-complexity", "baseline", "diff-check", "ignore-file", "hotspot-report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CodeOwnershipReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  codeownerFiles: z.array(z.object({
    filePath: z.string(),
    location: z.enum(["root", "github", "docs", "gitlab", "unknown"]),
    ruleCount: z.number().int().nonnegative(),
    ownerCount: z.number().int().nonnegative(),
    teamOwnerCount: z.number().int().nonnegative(),
    userOwnerCount: z.number().int().nonnegative(),
    emailOwnerCount: z.number().int().nonnegative(),
    wildcardCount: z.number().int().nonnegative(),
    protectedPathCount: z.number().int().nonnegative(),
    duplicatePatternCount: z.number().int().nonnegative(),
    selfOwnershipCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ownershipSignals: z.array(z.object({
    signal: z.enum(["codeowners-file", "standard-location", "pattern-rules", "last-match-wins", "team-owner", "user-owner", "email-owner", "self-owned-codeowners", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["syntax-check", "owner-check", "file-exists-check", "duplicate-pattern-check", "not-owned-check", "github-action", "api-errors", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reviewSignals: z.array(z.object({
    signal: z.enum(["auto-review-request", "required-code-owner-review", "branch-protection", "rulesets", "dismiss-stale-review", "required-approving-review", "fork-base-branch", "draft-pr", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coverageSignals: z.array(z.object({
    signal: z.enum(["root-default", "docs", "src", "tests", "github-directory", "packages", "unowned-allowed", "case-sensitive-paths", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["hmarr/codeowners", "codeowners-validator", "github-codeowners-api", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LargeAssetReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  assetSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["git-lfs", "dvc", "git-submodule", "custom", "unknown"]),
    setupType: z.enum(["gitattributes", "lfs-pointer", "dvc-file", "dvc-pipeline", "dvc-config", "gitmodules", "documentation", "script", "unknown"]),
    patternCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    outCount: z.number().int().nonnegative(),
    depCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    remoteCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    lockableCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  lfsSignals: z.array(z.object({
    signal: z.enum(["gitattributes", "filter-lfs", "diff-merge-lfs", "pointer-file", "oid-sha256", "track-command", "install-command", "status-command", "pull-push-fetch", "fsck", "migrate", "prune", "lockable", "locks", "skip-smudge", "case-sensitive-patterns", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dvcSignals: z.array(z.object({
    signal: z.enum(["dvc-yaml", "dvc-lock", "dvc-file", "outs", "deps", "metrics", "params", "remote-config", "default-remote", "cache", "push", "pull", "status", "repro", "run-cache", "dvcignore", "optional-remote-deps", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  submoduleSignals: z.array(z.object({
    signal: z.enum(["gitmodules", "submodule-url", "submodule-path", "recursive-clone", "lfs-submodule", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-fetch", "ci-pull", "ci-push", "artifact-cache", "pre-push-hook", "checkout-lfs", "dvc-repro", "dvc-doctor", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["git-lfs", "dvc", "dvc-s3", "dvc-azure", "dvc-gdrive", "dvc-gs", "dvc-oss", "dvc-ssh", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LicenseRightsReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  detectedProjectLicense: z.object({
    spdxId: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    evidence: z.string(),
    sourceHref: z.string().nullable()
  }),
  licenseFiles: z.array(z.object({
    filePath: z.string(),
    filenameScore: z.number().min(0).max(1),
    detectedSpdxId: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    matcher: z.enum(["copyright-only", "exact-keyword", "spdx-filename", "text-similarity-hint", "unknown"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  packageLicenseSignals: z.array(z.object({
    filePath: z.string(),
    packageName: z.string().nullable(),
    licenseText: z.string(),
    detectedSpdxId: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    sourceHref: z.string()
  })),
  readmeLicenseReferences: z.array(z.object({
    filePath: z.string(),
    detectedSpdxId: z.string().nullable(),
    snippet: z.string(),
    confidence: z.number().min(0).max(1),
    sourceHref: z.string()
  })),
  reviewWarnings: z.array(z.object({
    severity: z.enum(["info", "warn", "error"]),
    message: z.string(),
    relatedHref: z.string()
  })),
  rightsChecklist: z.array(z.object({
    label: z.string(),
    status: z.enum(["pass", "review", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SbomReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sourceDescriptor: z.object({
    sourceType: SourceTypeSchema.nullable(),
    sourceUrl: z.string().nullable(),
    localSourcePath: z.string().nullable(),
    branch: z.string().nullable(),
    commitHash: z.string().nullable(),
    descriptorName: z.string(),
    descriptorVersion: z.string()
  }),
  packageManifests: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.string(),
    packageCount: z.number().int().nonnegative(),
    directDependencies: z.number().int().nonnegative(),
    devDependencies: z.number().int().nonnegative(),
    sourceHref: z.string()
  })),
  packageArtifacts: z.array(z.object({
    name: z.string(),
    version: z.string().nullable(),
    ecosystem: z.string(),
    packageType: z.string(),
    purl: z.string().nullable(),
    licenses: z.array(z.string()),
    foundBy: z.string(),
    locations: z.array(z.string()),
    evidenceHref: z.string()
  })),
  fileArtifacts: z.array(z.object({
    filePath: z.string(),
    artifactKind: z.enum(["manifest", "lockfile", "container", "source", "config"]),
    size: z.number().int().nonnegative(),
    sourceHref: z.string()
  })),
  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    relationshipType: z.enum(["declares", "contains", "evidence-for", "uses-ecosystem"]),
    evidenceHref: z.string()
  })),
  outputFormats: z.array(z.object({
    format: z.enum(["syft-json", "cyclonedx-json", "spdx-json"]),
    readiness: z.enum(["available", "partial"]),
    reason: z.string()
  })),
  reviewWarnings: z.array(z.object({
    severity: z.enum(["info", "warn", "error"]),
    message: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SecurityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scannerTargets: z.array(z.object({
    target: z.enum(["filesystem", "git-repository", "container-image", "kubernetes", "sbom"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scannerCoverage: z.array(z.object({
    scanner: z.enum(["vulnerability", "secret", "misconfiguration", "license", "sbom"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    kind: z.enum(["manifest", "lockfile", "container-config", "iac-config", "secret-candidate", "license", "sbom"]),
    filePath: z.string(),
    severity: z.enum(["info", "warn", "error"]),
    message: z.string(),
    sourceHref: z.string()
  })),
  actionQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SastReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sastSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["semgrep", "codeql", "sonarqube", "snyk-code", "package-script", "workflow", "readme", "unknown"]),
    languageCount: z.number().int().nonnegative(),
    ruleCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    scopeCount: z.number().int().nonnegative(),
    baselineCount: z.number().int().nonnegative(),
    suppressionCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["semgrep", "codeql", "sonarqube", "snyk-code", "eslint-security", "bandit", "gosec", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["semgrep-rule", "pattern", "pattern-either", "pattern-regex", "metavariable", "severity", "message", "taint-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["codeql-query", "query-suite", "query-pack", "security-extended", "security-and-quality", "qlpack", "custom-query", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  languageSignals: z.array(z.object({
    signal: z.enum(["javascript-typescript", "python", "go", "java-kotlin", "c-cpp", "csharp", "ruby", "swift", "multi-language", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["paths", "paths-ignore", "exclusions", "generated-code", "test-scope", "monorepo", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  baselineSignals: z.array(z.object({
    signal: z.enum(["baseline-ref", "diff-aware", "pr-scan", "fail-threshold", "severity-threshold", "quality-gate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["sarif", "json", "junit", "html", "code-scanning", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "semgrep-ci", "codeql-init", "codeql-analyze", "sonar-scan-action", "snyk-code", "upload-sarif", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["semgrep", "codeql-action", "codeql-cli", "sonar-scanner", "sonarqube-scan-action", "snyk", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DastReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dastSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["zap", "nuclei", "securecodebox", "playwright", "workflow", "package-script", "readme", "unknown"]),
    targetCount: z.number().int().nonnegative(),
    crawlerCount: z.number().int().nonnegative(),
    activeScanCount: z.number().int().nonnegative(),
    authCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["base-url", "url-list", "openapi", "graphql", "swagger", "sitemap", "environment", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scannerSignals: z.array(z.object({
    signal: z.enum(["zap", "nuclei", "securecodebox", "playwright", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  crawlSignals: z.array(z.object({
    signal: z.enum(["spider", "ajax-spider", "headless", "follow-redirects", "sitemap", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  activeScanSignals: z.array(z.object({
    signal: z.enum(["zap-active-scan", "nuclei-dast", "fuzzing", "attack-policy", "baseline", "full-scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["context", "login", "headers", "cookies", "token", "user", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["nuclei-template", "workflow", "severity", "tags", "exclude", "signature", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["rate-limit", "scope", "timeout", "concurrency", "safe-methods", "allowlist", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "sarif", "junit", "html", "markdown", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "scheduled-run", "pull-request", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["zap", "nuclei", "securecodebox", "playwright", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ThreatModelReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  threatModelSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["pytm", "threat-dragon", "threagile", "diagram", "workflow", "package-script", "readme", "unknown"]),
    modelCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    dataFlowCount: z.number().int().nonnegative(),
    boundaryCount: z.number().int().nonnegative(),
    threatCount: z.number().int().nonnegative(),
    strideCount: z.number().int().nonnegative(),
    mitigationCount: z.number().int().nonnegative(),
    riskTrackingCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["pytm", "threat-dragon", "threagile", "open-threat-model", "json-model", "yaml-model", "python-model", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  diagramSignals: z.array(z.object({
    signal: z.enum(["dfd", "sequence", "data-flow-diagram", "attack-tree", "trust-boundary", "component", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["actor", "process", "datastore", "technical-asset", "data-asset", "communication-link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundarySignals: z.array(z.object({
    signal: z.enum(["trust-boundary", "out-of-scope", "scope", "shared-runtime", "in-scope", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  threatSignals: z.array(z.object({
    signal: z.enum(["stride", "spoofing", "tampering", "repudiation", "information-disclosure", "denial-of-service", "elevation-of-privilege", "abuse-case", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskSignals: z.array(z.object({
    signal: z.enum(["risk-rating", "severity", "mitigation", "risk-tracking", "accepted-risk", "false-positive", "questions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["report", "json", "markdown", "pdf", "diagram-output", "excel", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "scheduled-run", "pull-request", "docker", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pytm", "threat-dragon", "threagile", "graphviz", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ScorecardReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  aggregateScore: z.number().min(0).max(10),
  checks: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(10).nullable(),
    status: z.enum(["pass", "partial", "fail", "unknown"]),
    risk: z.enum(["critical", "high", "medium", "low", "unknown"]),
    evidence: z.string(),
    remediation: z.string(),
    relatedHref: z.string()
  })),
  categoryScores: z.array(z.object({
    category: z.enum(["source", "build", "dependency", "security", "maintenance"]),
    score: z.number().min(0).max(10).nullable(),
    explanation: z.string(),
    relatedHref: z.string()
  })),
  policyFindings: z.array(z.object({
    policy: z.string(),
    result: z.enum(["pass", "review", "fail"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    checkName: z.string(),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  structuredResults: z.array(z.object({
    checkName: z.string(),
    probe: z.string(),
    outcome: z.enum(["positive", "negative", "unknown"]),
    evidence: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ProvenanceReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  artifactSignals: z.array(z.object({
    artifact: z.string(),
    artifactType: z.enum(["source-snapshot", "package", "container", "sbom", "release", "blob"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  signatureSignals: z.array(z.object({
    material: z.enum(["signature", "bundle", "certificate", "public-key", "trusted-root", "transparency-log"]),
    readiness: z.enum(["present", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  attestationSignals: z.array(z.object({
    predicateType: z.enum(["slsaprovenance", "spdx", "cyclonedx", "vuln", "custom"]),
    readiness: z.enum(["available", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identityRequirements: z.array(z.object({
    requirement: z.string(),
    status: z.enum(["known", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  verificationCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AdvisoryReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  packageQueryTargets: z.array(z.object({
    name: z.string(),
    ecosystem: z.string(),
    version: z.string().nullable(),
    purl: z.string().nullable(),
    sourceType: z.enum(["manifest", "lockfile", "sbom", "container", "source"]),
    readiness: z.enum(["queryable", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lockfileSignals: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.string(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial"]),
    sourceHref: z.string()
  })),
  advisorySources: z.array(z.object({
    source: z.enum(["OSV.dev", "deps.dev", "GitHub-Advisory-Database", "RustSec", "NVD", "local-offline-db"]),
    readiness: z.enum(["external", "ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policyControls: z.array(z.object({
    control: z.enum(["ignored-vulns", "package-overrides", "license-allowlist", "offline-db", "call-analysis", "guided-remediation"]),
    status: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultModel: z.array(z.object({
    field: z.string(),
    purpose: z.string(),
    readiness: z.enum(["ready", "partial", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  remediationQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const VexReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  productTargets: z.array(z.object({
    productId: z.string(),
    productType: z.enum(["package", "container", "source", "sbom"]),
    version: z.string().nullable(),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  vulnerabilityInputs: z.array(z.object({
    source: z.enum(["advisory-query", "security-readiness", "scanner-sarif", "manual-cve", "attestation"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  statusMatrix: z.array(z.object({
    status: z.enum(["affected", "not_affected", "fixed", "under_investigation"]),
    requiredEvidence: z.string(),
    allowedFields: z.array(z.string()),
    filtersScannerResult: z.boolean(),
    readiness: z.enum(["ready", "partial", "external"])
  })),
  justificationCatalog: z.array(z.object({
    justification: z.string(),
    useWhen: z.string(),
    requiresImpactStatement: z.boolean(),
    readiness: z.enum(["ready", "partial", "external"])
  })),
  statementDrafts: z.array(z.object({
    vulnerabilityId: z.string(),
    productIds: z.array(z.string()),
    status: z.enum(["affected", "not_affected", "fixed", "under_investigation"]),
    justification: z.string().nullable(),
    needsHumanReview: z.boolean(),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  documentWorkflow: z.array(z.object({
    step: z.enum(["create", "add", "merge", "attest", "filter", "generate"]),
    command: z.string(),
    purpose: z.string(),
    readiness: z.enum(["ready", "partial", "external"])
  })),
  attestationReadiness: z.array(z.object({
    requirement: z.enum(["subject-digest", "dsse-envelope", "signature", "transparency-log", "product-match"]),
    status: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PolicyGateReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  policyDocuments: z.array(z.object({
    filePath: z.string(),
    packageName: z.string().nullable(),
    ruleCount: z.number().int().nonnegative(),
    testRuleCount: z.number().int().nonnegative(),
    decisionRules: z.array(z.string()),
    readiness: z.enum(["ready", "partial", "missing"]),
    sourceHref: z.string()
  })),
  inputDocuments: z.array(z.object({
    filePath: z.string(),
    documentType: z.enum(["input", "data", "manifest", "iac", "schema", "unknown"]),
    readiness: z.enum(["ready", "partial"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  gateQueries: z.array(z.object({
    query: z.string(),
    purpose: z.string(),
    readiness: z.enum(["ready", "partial", "external"]),
    relatedHref: z.string()
  })),
  testCoverage: z.array(z.object({
    target: z.enum(["rego-policy-tests", "compile-check", "schema-validation", "decision-fixtures"]),
    status: z.enum(["covered", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  bundleReadiness: z.array(z.object({
    requirement: z.enum(["policy-files", "data-files", "entrypoints", "manifest", "signature", "capabilities"]),
    status: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  decisionOutputs: z.array(z.object({
    field: z.string(),
    purpose: z.string(),
    readiness: z.enum(["ready", "partial", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ApiContractReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schemaDocuments: z.array(z.object({
    filePath: z.string(),
    schemaType: z.enum(["openapi", "swagger", "graphql", "postman", "asyncapi", "unknown"]),
    version: z.string().nullable(),
    operationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  operationTargets: z.array(z.object({
    operationId: z.string().nullable(),
    method: z.string().nullable(),
    path: z.string().nullable(),
    source: z.string(),
    readiness: z.enum(["ready", "partial", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testPhases: z.array(z.object({
    phase: z.enum(["examples", "coverage", "fuzzing", "stateful", "negative"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checkMatrix: z.array(z.object({
    check: z.enum(["not-a-server-error", "schema-conformance", "status-code-conformance", "content-type-conformance", "response-headers", "auth-required"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeTargets: z.array(z.object({
    target: z.enum(["base-url", "asgi-wsgi", "pytest", "ci-action", "mock-server"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportingOutputs: z.array(z.object({
    output: z.enum(["junit-xml", "allure", "cassette", "replay", "curl-repro", "coverage"]),
    readiness: z.enum(["ready", "partial", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ConsumerContractReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  contractSetups: z.array(z.object({
    filePath: z.string(),
    role: z.enum(["consumer", "provider", "broker", "ci", "mixed", "unknown"]),
    framework: z.enum(["pact-js", "pact-jvm", "pact-ruby", "pact-go", "pact-python", "custom", "unknown"]),
    interactionCount: z.number().int().nonnegative(),
    providerStateCount: z.number().int().nonnegative(),
    verifierCount: z.number().int().nonnegative(),
    brokerCount: z.number().int().nonnegative(),
    matcherCount: z.number().int().nonnegative(),
    messageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pact-v3", "pact-v4", "interaction", "given", "upon-receiving", "with-request", "will-respond-with", "execute-test", "message", "graphql", "plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["verifier", "provider-state", "state-handlers", "provider-base-url", "verification-context", "publish-results", "provider-version", "provider-branch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  brokerSignals: z.array(z.object({
    signal: z.enum(["pact-broker", "pactflow", "can-i-deploy", "consumer-version-selector", "pending-pacts", "wip-pacts", "webhook", "token-auth", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  matcherSignals: z.array(z.object({
    signal: z.enum(["like", "each-like", "regex", "term", "from-provider-state", "matching-rules", "headers", "body", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["publish-pact", "verify-provider", "junit", "github-actions", "gradle", "maven", "npm-script", "rake-task", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@pact-foundation/pact", "pact-jvm", "pact-ruby", "pact-broker-client", "pactflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ObservabilityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  signalPipelines: z.array(z.object({
    signal: z.enum(["traces", "metrics", "logs"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    filePath: z.string(),
    kind: z.enum(["auto", "manual", "middleware", "browser", "server", "unknown"]),
    signal: z.enum(["traces", "metrics", "logs", "mixed"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  exporterTargets: z.array(z.object({
    target: z.enum(["otlp", "console", "prometheus", "jaeger", "zipkin", "vendor", "none"]),
    signal: z.enum(["traces", "metrics", "logs", "mixed"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceAttributes: z.array(z.object({
    attribute: z.string(),
    source: z.string(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  propagationContext: z.array(z.object({
    mechanism: z.enum(["trace-context", "baggage", "b3", "async-context", "zone-context"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  diagnostics: z.array(z.object({
    check: z.enum(["diag-logger", "collector-endpoint", "shutdown", "sampling", "attribute-limits", "runtime-support"]),
    status: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PerformanceReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scriptTargets: z.array(z.object({
    filePath: z.string(),
    kind: z.enum(["k6-script", "package-script", "ci-workflow", "config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workloadModels: z.array(z.object({
    model: z.enum(["stages", "scenarios", "constant-vus", "ramping-vus", "shared-iterations", "per-vu-iterations", "constant-arrival-rate", "ramping-arrival-rate"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  thresholds: z.array(z.object({
    metric: z.string(),
    expression: z.string(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checks: z.array(z.object({
    filePath: z.string(),
    name: z.string(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  metrics: z.array(z.object({
    metric: z.string(),
    metricType: z.enum(["counter", "gauge", "rate", "trend", "built-in", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputs: z.array(z.object({
    target: z.enum(["summary", "json", "cloud", "prometheus", "influxdb", "statsd", "otel", "none"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeControls: z.array(z.object({
    control: z.enum(["vus", "duration", "stages", "iterations", "env-vars", "archive", "browser", "distributed"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ProfilingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  profilingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["clinicjs", "py-spy", "pyroscope", "pprof", "sentry-profiling", "package-script", "workflow", "unknown"]),
    cpuCount: z.number().int().nonnegative(),
    wallCount: z.number().int().nonnegative(),
    heapCount: z.number().int().nonnegative(),
    asyncCount: z.number().int().nonnegative(),
    attachCount: z.number().int().nonnegative(),
    continuousCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["node-process", "python-process", "go-pprof", "http-pprof", "kubernetes-pod", "container", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modeSignals: z.array(z.object({
    signal: z.enum(["clinic-doctor", "clinic-bubbleprof", "clinic-flame", "clinic-heapprofiler", "py-spy-top", "py-spy-record", "py-spy-dump", "pyroscope-agent", "pprof", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["html", "flamegraph", "speedscope", "raw", "pprof", "json", "profilecli", "grafana-dashboard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["on-port", "autocannon", "duration", "sample-rate", "native-symbols", "subprocesses", "gil", "tags", "application-name", "server-address", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["sudo", "ptrace", "sys-ptrace", "nonblocking", "production-warning", "sampling-overhead", "data-retention", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["clinic", "autocannon", "py-spy", "pyroscope", "pprof", "sentry-profiling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TracingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tracingSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["opentelemetry", "jaeger", "zipkin", "tempo", "sentry-tracing", "package-script", "workflow", "collector-config", "unknown"]),
    tracerCount: z.number().int().nonnegative(),
    spanCount: z.number().int().nonnegative(),
    propagationCount: z.number().int().nonnegative(),
    exporterCount: z.number().int().nonnegative(),
    samplingCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    processorCount: z.number().int().nonnegative(),
    backendCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    signal: z.enum(["manual-span", "auto-instrumentation", "http-instrumentation", "grpc-instrumentation", "db-instrumentation", "browser-instrumentation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  propagationSignals: z.array(z.object({
    signal: z.enum(["tracecontext", "baggage", "b3", "jaeger", "xray", "async-context", "zone-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exporterSignals: z.array(z.object({
    signal: z.enum(["otlp-grpc", "otlp-http", "console", "jaeger", "zipkin", "tempo", "collector", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  samplingSignals: z.array(z.object({
    signal: z.enum(["parent-based", "traceid-ratio", "always-on", "always-off", "tail-sampling", "remote-sampling", "rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["service-name", "service-version", "deployment-environment", "resource-detector", "attributes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  backendSignals: z.array(z.object({
    signal: z.enum(["jaeger-all-in-one", "jaeger-collector", "jaeger-query", "tempo-distributor", "tempo-ingester", "tempo-querier", "zipkin-server", "storage-backend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["span-metrics", "service-graph", "dropped-spans", "export-failures", "health-check", "dashboard", "retention", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@opentelemetry/api", "@opentelemetry/sdk-node", "@opentelemetry/instrumentation", "@opentelemetry/exporter-trace-otlp", "jaeger", "zipkin", "tempo", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DebugReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  debugSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["vscode-js-debug", "debugpy", "delve", "dap", "launch-config", "package-script", "workflow", "unknown"]),
    launchCount: z.number().int().nonnegative(),
    attachCount: z.number().int().nonnegative(),
    breakpointCount: z.number().int().nonnegative(),
    sourceMapCount: z.number().int().nonnegative(),
    pathMappingCount: z.number().int().nonnegative(),
    runtimeCount: z.number().int().nonnegative(),
    adapterCount: z.number().int().nonnegative(),
    logCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    remoteCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  adapterSignals: z.array(z.object({
    signal: z.enum(["debug-adapter-protocol", "vscode-js-debug", "debugpy", "delve-dap", "chrome-devtools", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modeSignals: z.array(z.object({
    signal: z.enum(["launch", "attach", "remote-attach", "headless", "listen", "connect", "wait-for-client", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  breakpointSignals: z.array(z.object({
    signal: z.enum(["line-breakpoint", "conditional-breakpoint", "logpoint", "function-breakpoint", "exception-breakpoint", "hit-condition", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mappingSignals: z.array(z.object({
    signal: z.enum(["source-map", "source-map-overrides", "skip-files", "smart-step", "path-mappings", "cwd-root", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["node-inspect", "browser-debug", "python-module", "pytest-debug", "go-dlv", "core-dump", "native-attach", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  remoteSignals: z.array(z.object({
    signal: z.enum(["port", "host", "pid", "subprocess", "multiclient", "container", "ssh-wsl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  diagnosticSignals: z.array(z.object({
    signal: z.enum(["trace", "debug-logs", "adapter-logs", "verbose", "stack-trace", "goroutine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vscode-js-debug", "debugpy", "delve", "@vscode/debugadapter", "vscode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CrashReportingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  crashSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["sentry", "bugsnag", "rollbar", "source-map-config", "symbol-file-config", "package-script", "workflow", "native-crash", "unknown"]),
    eventCount: z.number().int().nonnegative(),
    releaseCount: z.number().int().nonnegative(),
    sourceMapCount: z.number().int().nonnegative(),
    debugIdCount: z.number().int().nonnegative(),
    symbolCount: z.number().int().nonnegative(),
    stacktraceCount: z.number().int().nonnegative(),
    breadcrumbCount: z.number().int().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
    privacyCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  captureSignals: z.array(z.object({
    signal: z.enum(["exception-capture", "unhandled-exception", "unhandled-rejection", "native-crash", "manual-notify", "event-pipeline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["release-version", "dist-build", "environment-stage", "commit-sha", "deploy-tracking", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  symbolicationSignals: z.array(z.object({
    signal: z.enum(["source-map-upload", "debug-id", "artifact-bundle", "dsym", "proguard-mapping", "stacktrace-linking", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["breadcrumbs", "sessions", "user-context", "tags-metadata", "severity-level", "fingerprint-grouping", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["before-send", "on-error-filter", "scrub-fields", "pii-toggle", "payload-truncation", "sampling-rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["dsn-access-token", "notify-endpoint", "sessions-endpoint", "offline-queue", "retry-rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-upload", "release-command", "artifact-upload", "sourcemap-test", "crash-smoke-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@sentry/*", "@bugsnag/js", "rollbar", "sentry-cli", "bugsnag-source-maps", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const IncidentResponseReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  incidentSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["pagerduty", "grafana-oncall", "firehydrant", "runbook", "status-page", "workflow", "terraform", "unknown"]),
    incidentCount: z.number().int().nonnegative(),
    alertRouteCount: z.number().int().nonnegative(),
    escalationCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    runbookCount: z.number().int().nonnegative(),
    statusPageCount: z.number().int().nonnegative(),
    roleCount: z.number().int().nonnegative(),
    severityCount: z.number().int().nonnegative(),
    timelineCount: z.number().int().nonnegative(),
    postmortemCount: z.number().int().nonnegative(),
    automationCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  intakeSignals: z.array(z.object({
    signal: z.enum(["alert-route", "signal-rule", "webhook", "email-ingest", "manual-incident", "deduplication", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  triageSignals: z.array(z.object({
    signal: z.enum(["severity", "priority", "incident-type", "service-ownership", "team-assignment", "deduplication", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  onCallSignals: z.array(z.object({
    signal: z.enum(["schedule", "rotation", "handoff", "escalation-policy", "override", "follow-the-sun", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  communicationSignals: z.array(z.object({
    signal: z.enum(["slack", "chatops", "phone", "sms", "email", "status-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runbookSignals: z.array(z.object({
    signal: z.enum(["runbook", "automatic-step", "manual-step", "owner", "attachment-rule", "private-incident", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["acknowledge", "resolve", "timeline", "retrospective", "postmortem", "incident-role", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["terraform-provider", "api-token", "audit-log", "access-control", "restricted-runbook", "enterprise-tier", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-validate", "terraform-plan", "import", "drift-detection", "incident-drill", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pagerduty-provider", "grafana-oncall", "firehydrant-provider", "slack-sdk", "twilio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SloReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sloSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["openslo", "sloth", "pyrra", "prometheus-rule", "grafana-dashboard", "workflow", "custom", "unknown"]),
    sloCount: z.number().int().nonnegative(),
    sliCount: z.number().int().nonnegative(),
    objectiveCount: z.number().int().nonnegative(),
    targetCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    budgetCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    recordingRuleCount: z.number().int().nonnegative(),
    burnRateCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    dataSourceCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    dashboardCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  specSignals: z.array(z.object({
    signal: z.enum(["openslo", "sloth-spec", "pyrra-crd", "prometheus-rule", "yaml-manifest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  indicatorSignals: z.array(z.object({
    signal: z.enum(["ratio-metric", "threshold-metric", "latency", "availability", "error-query", "total-query", "raw-ratio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  objectiveSignals: z.array(z.object({
    signal: z.enum(["target", "target-percent", "time-window", "budgeting-method", "composite-weight", "error-budget", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alertSignals: z.array(z.object({
    signal: z.enum(["burn-rate", "multi-window", "page-alert", "ticket-alert", "prometheus-alert", "alert-after", "alert-labels", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["recording-rules", "prometheus-operator", "promql-window-template", "rule-output", "generic-rules", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["service-owner", "labels", "team", "runbook-link", "dashboard", "validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["ci-validate", "sloth-validate", "kubectl-apply", "helm-chart", "dry-run", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["sloth", "pyrra", "openslo", "prometheus-operator", "grafana", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CostReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  costSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["infracost", "opencost", "kubecost", "prometheus", "helm", "terraform", "workflow", "custom", "unknown"]),
    estimateCount: z.number().int().nonnegative(),
    diffCount: z.number().int().nonnegative(),
    allocationCount: z.number().int().nonnegative(),
    pricingCount: z.number().int().nonnegative(),
    cloudCostCount: z.number().int().nonnegative(),
    budgetCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    prometheusCount: z.number().int().nonnegative(),
    dashboardCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  estimateSignals: z.array(z.object({
    signal: z.enum(["infracost-breakdown", "infracost-diff", "usage-file", "config-file", "monthly-cost", "policy-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  allocationSignals: z.array(z.object({
    signal: z.enum(["namespace", "pod", "node", "controller", "service", "label", "cloud-cost", "asset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pricingSignals: z.array(z.object({
    signal: z.enum(["custom-pricing", "pricing-csv", "cloud-provider", "aws", "azure", "gcp", "on-prem", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  budgetSignals: z.array(z.object({
    signal: z.enum(["budget-config", "threshold", "forecast", "savings", "rightsizing", "cost-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["prometheus-endpoint", "metrics", "recording-rules", "grafana", "thanos", "network-costs", "persistent-volume", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["pull-request-comment", "github-actions", "ci-cost-diff", "helm-install", "kubectl-cost", "mcp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["infracost", "opencost", "kubecost", "prometheus", "grafana", "helm", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ProgressiveDeliveryReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  rolloutSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["argo-rollouts", "flagger", "kayenta", "spinnaker", "istio", "linkerd", "nginx", "gateway-api", "workflow", "custom", "unknown"]),
    strategyCount: z.number().int().nonnegative(),
    canaryCount: z.number().int().nonnegative(),
    blueGreenCount: z.number().int().nonnegative(),
    trafficRoutingCount: z.number().int().nonnegative(),
    analysisCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    promotionCount: z.number().int().nonnegative(),
    abortCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  strategySignals: z.array(z.object({
    signal: z.enum(["rollout-crd", "canary-crd", "blue-green", "canary-steps", "experiment", "traffic-routing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trafficSignals: z.array(z.object({
    signal: z.enum(["set-weight", "step-weight", "max-weight", "traffic-split", "service-mesh", "ingress", "gateway-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  analysisSignals: z.array(z.object({
    signal: z.enum(["analysis-template", "metric-template", "kayenta-judge", "prometheus-query", "datadog-query", "webhook-check", "threshold-range", "score-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["manual-promotion", "auto-promotion", "abort-on-failure", "pause-step", "rollback", "progress-deadline", "failure-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  notificationSignals: z.array(z.object({
    signal: z.enum(["slack", "msteams", "webhook", "alert-provider", "event", "analysis-run-status", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["kubectl-plugin", "promote-command", "abort-command", "retry-command", "helm-install", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["argo-rollouts", "flagger", "kayenta", "spinnaker", "prometheus", "istio", "linkerd", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LoadTestingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  loadTestSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["k6", "artillery", "locust", "jmeter", "gatling", "autocannon", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    scriptCount: z.number().int().nonnegative(),
    scenarioCount: z.number().int().nonnegative(),
    loadProfileCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    protocolCount: z.number().int().nonnegative(),
    dataCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    distributedCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["k6", "artillery", "locust", "jmeter", "gatling", "autocannon", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  profileSignals: z.array(z.object({
    signal: z.enum(["vus", "duration", "stages", "scenarios", "arrival-rate", "ramping", "spawn-rate", "users", "wait-time", "load-shape", "soak", "stress", "spike", "smoke", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  protocolSignals: z.array(z.object({
    signal: z.enum(["http", "websocket", "grpc", "graphql", "browser", "playwright", "tcp", "custom-client", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assertionSignals: z.array(z.object({
    signal: z.enum(["thresholds", "checks", "ensure", "expect-plugin", "apdex", "slo", "abort-on-fail", "percentiles", "status-check", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["setup-teardown", "shared-array", "csv-data", "env-vars", "processor", "custom-metrics", "tags", "parameterization", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["headless", "cloud", "distributed-master-worker", "k6-operator", "docker", "ci-workflow", "artifact-upload", "parallel-workers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["summary", "handleSummary", "json", "html", "csv", "prometheus", "influxdb", "grafana", "datadog", "cloud-dashboard", "junit", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["k6", "artillery", "@artilleryio/*", "artillery-engine-playwright", "locust", "locust-plugins", "jmeter", "gatling", "autocannon", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BenchmarkReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  benchmarkSuites: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["vitest-bench", "tinybench", "benchmark-js", "hyperfine", "criterion", "pytest-benchmark", "go-bench", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    warmupCount: z.number().int().nonnegative(),
    iterationCount: z.number().int().nonnegative(),
    parameterCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    asyncCount: z.number().int().nonnegative(),
    baselineCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["vitest-bench", "tinybench", "benchmark-js", "hyperfine", "criterion", "pytest-benchmark", "go-bench", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timingSignals: z.array(z.object({
    signal: z.enum(["hrtime", "performance-now", "warmup", "iterations", "runs", "min-runs", "time-window", "samples", "concurrency", "async", "gc-control", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  comparisonSignals: z.array(z.object({
    signal: z.enum(["suite", "tasks", "baseline", "compare", "fastest-slowest", "parameter-scan", "parameter-list", "relative-times", "regression-threshold", "statistical-significance", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["console-table", "json", "markdown", "csv", "html", "junit", "bencher", "github-step-summary", "artifact-upload", "trend-history", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "scheduled", "pull-request", "hyperfine-command", "vitest-bench-command", "cargo-bench-command", "pytest-benchmark-command", "go-test-bench-command", "benchmarkjs-command", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tinybench", "benchmark", "hyperfine", "criterion", "pytest-benchmark", "bencher", "vitest", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const E2eReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  testSuites: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["playwright", "cypress", "selenium", "webdriverio", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  browserProjects: z.array(z.object({
    browser: z.enum(["chromium", "firefox", "webkit", "mobile", "api", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  locatorSignals: z.array(z.object({
    filePath: z.string(),
    locatorType: z.enum(["role", "text", "label", "testid", "css", "xpath", "page-object", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  assertions: z.array(z.object({
    assertion: z.enum(["url", "visible", "text", "title", "network", "snapshot", "accessibility", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifacts: z.array(z.object({
    artifact: z.enum(["trace", "screenshot", "video", "html-report", "junit", "json", "none"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeTargets: z.array(z.object({
    target: z.enum(["web-server", "base-url", "env-vars", "parallel-workers", "retries", "ci-artifacts", "storage-state"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FlakyTestReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  flakyTestSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["playwright", "pytest", "jest", "vitest", "cypress", "mocha", "custom", "unknown"]),
    retryCount: z.number().int().nonnegative(),
    rerunCount: z.number().int().nonnegative(),
    quarantineCount: z.number().int().nonnegative(),
    failOnFlakyCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    isolationCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["playwright", "pytest-rerunfailures", "jest", "vitest", "cypress", "mocha", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  retrySignals: z.array(z.object({
    signal: z.enum(["retries", "reruns", "retry-times", "retry-immediately", "wait-before-retry", "reruns-delay", "repeat-each", "only-rerun", "rerun-except", "fail-on-flaky", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  quarantineSignals: z.array(z.object({
    signal: z.enum(["flaky-marker", "skip-fixme", "xfail", "quarantine-tag", "grep-invert", "test-list", "issue-link", "owner", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  isolationSignals: z.array(z.object({
    signal: z.enum(["workers-one", "run-in-band", "fully-parallel-control", "serial-mode", "test-timeout", "global-timeout", "detect-open-handles", "storage-state", "random-seed", "order-randomization", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifactSignals: z.array(z.object({
    signal: z.enum(["trace-on-first-retry", "screenshot-on-failure", "video-on-retry", "html-report", "junit-report", "blob-report", "retry-trace-upload", "test-results", "step-summary", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "scheduled", "shard", "matrix", "upload-artifact", "flaky-dashboard", "rerun-job", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@playwright/test", "pytest-rerunfailures", "jest", "vitest", "cypress", "mocha", "flaky", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TestImpactReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  impactSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["nx", "jest", "pytest-testmon", "turbo", "bazel", "gradle", "custom", "unknown"]),
    affectedCommandCount: z.number().int().nonnegative(),
    changedFileInputCount: z.number().int().nonnegative(),
    baseHeadCount: z.number().int().nonnegative(),
    graphCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    watchCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    fallbackCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["nx", "jest", "pytest-testmon", "turbo", "bazel", "gradle", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  changeDetectionSignals: z.array(z.object({
    signal: z.enum(["base-head", "changed-since", "changed-files", "git-diff", "uncommitted", "untracked", "last-commit", "files-input", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["affected-projects", "find-related-tests", "only-changed", "testmon-select", "testmon-forceselect", "related-tests-list", "dependency-graph", "project-graph", "test-splitting", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["nx-cache", "remote-cache", "task-cache", "testmon-data", "coverage-deps", "jest-haste-map", "watchman", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "base-head-env", "matrix", "shard", "affected-only", "upload-artifact", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nx", "jest", "pytest-testmon", "turbo", "bazel", "gradle", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TestReportingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  reportSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["junit", "ctrf", "allure", "trx", "xunit", "mocha-json", "github-action", "custom", "unknown"]),
    junitCount: z.number().int().nonnegative(),
    ctrfCount: z.number().int().nonnegative(),
    allureCount: z.number().int().nonnegative(),
    reporterCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    summaryCount: z.number().int().nonnegative(),
    annotationCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    historyCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    failPolicyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["junit-xml", "ctrf-json", "allure-results", "allure-report", "trx", "xunit", "mocha-json", "json", "html", "markdown", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  adapterSignals: z.array(z.object({
    signal: z.enum(["jest-junit", "vitest-junit", "pytest-junitxml", "playwright-reporters", "allure-js", "allure-pytest", "ctrf-reporter", "dorny-test-reporter", "github-test-reporter", "publish-unit-test-result", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "workflow-run", "checks-write", "job-summary", "annotations", "upload-artifact", "download-artifact", "pull-request", "always-run", "matrix", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["report-path", "glob-path", "results-dir", "output-file", "summary-file", "html-report", "history-trend", "attachments", "environment-metadata", "executor-metadata", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["fail-on-error", "fail-on-empty", "max-annotations", "threshold-summary", "rerun-history", "flaky-analysis", "categories", "owner-labels", "duration", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["jest-junit", "allure", "allure-js", "allure-pytest", "ctrf", "test-reporter", "publish-unit-test-result", "junit", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SnapshotReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  snapshotSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["jest", "vitest", "playwright", "storybook", "custom", "unknown"]),
    textSnapshotCount: z.number().int().nonnegative(),
    inlineSnapshotCount: z.number().int().nonnegative(),
    fileSnapshotCount: z.number().int().nonnegative(),
    visualSnapshotCount: z.number().int().nonnegative(),
    ariaSnapshotCount: z.number().int().nonnegative(),
    updatePolicyCount: z.number().int().nonnegative(),
    serializerCount: z.number().int().nonnegative(),
    pathTemplateCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    maskingCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    baselineCount: z.number().int().nonnegative(),
    reviewCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  assertionSignals: z.array(z.object({
    signal: z.enum(["to-match-snapshot", "inline-snapshot", "file-snapshot", "throw-error-inline", "to-have-screenshot", "to-match-aria-snapshot", "property-matchers", "custom-matchers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["__snapshots__", "snap-files", "file-snapshot", "snapshot-path-template", "screenshot-baseline", "aria-yaml", "version-controlled-baseline", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["update-snapshot", "update-snapshots", "watch-update", "ci-new-snapshot-fail", "missing-only", "changed-only", "all-update", "none-update", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serializerSignals: z.array(z.object({
    signal: z.enum(["snapshot-serializers", "add-snapshot-serializer", "snapshot-format", "pretty-format", "custom-serializer", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  visualSignals: z.array(z.object({
    signal: z.enum(["to-have-screenshot", "max-diff-pixels", "max-diff-pixel-ratio", "threshold", "mask", "mask-color", "style-path", "animations", "caret", "scale", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "update-forbidden", "snapshot-artifact", "os-matrix", "browser-matrix", "snapshot-report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["jest", "vitest", "playwright", "jest-snapshot", "pretty-format", "testing-library", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PropertyBasedTestingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  propertySetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["fast-check", "hypothesis", "jqwik", "quickcheck", "proptest", "custom", "unknown"]),
    propertyCount: z.number().int().nonnegative(),
    generatorCount: z.number().int().nonnegative(),
    assertionCount: z.number().int().nonnegative(),
    shrinkCount: z.number().int().nonnegative(),
    seedCount: z.number().int().nonnegative(),
    runCount: z.number().int().nonnegative(),
    statefulCount: z.number().int().nonnegative(),
    exampleCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  generatorSignals: z.array(z.object({
    signal: z.enum(["fast-check-arbitraries", "hypothesis-strategies", "jqwik-arbitraries", "custom-generators", "composite-generators", "filtered-generators", "recursive-generators", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runnerSignals: z.array(z.object({
    signal: z.enum(["fc-assert", "fc-check", "hypothesis-given", "jqwik-property", "pytest", "vitest", "jest", "junit-platform", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reproductionSignals: z.array(z.object({
    signal: z.enum(["seed", "path", "replay-path", "counterexample", "example-database", "falsifying-example", "shrinking", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  statefulSignals: z.array(z.object({
    signal: z.enum(["model-run", "commands", "rule-based-state-machine", "state-machine", "action-chain", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "property-script", "num-runs", "max-examples", "tries", "seed-policy", "artifact", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["fast-check", "@fast-check/jest", "hypothesis", "pytest", "jqwik", "quickcheck", "proptest", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FuzzReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  fuzzSetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["oss-fuzz", "libfuzzer", "aflplusplus", "jazzer", "go-fuzz", "cargo-fuzz", "clusterfuzzlite", "package-script", "workflow", "unknown"]),
    targetCount: z.number().int().nonnegative(),
    harnessCount: z.number().int().nonnegative(),
    engineCount: z.number().int().nonnegative(),
    sanitizerCount: z.number().int().nonnegative(),
    corpusCount: z.number().int().nonnegative(),
    dictionaryCount: z.number().int().nonnegative(),
    coverageCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  harnessSignals: z.array(z.object({
    signal: z.enum(["llvm-fuzzer-test-one-input", "fuzztest-annotation", "jazzer-fuzztest", "go-fuzz", "cargo-fuzz-target", "afl-target", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  engineSignals: z.array(z.object({
    signal: z.enum(["oss-fuzz", "libfuzzer", "aflplusplus", "jazzer", "clusterfuzzlite", "honggfuzz", "centipede", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["oss-fuzz-dockerfile", "build-sh", "project-yaml", "compiler-wrapper", "fsanitize-fuzzer", "bazel-rules-fuzzing", "maven-plugin", "gradle-dependency", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["seed-corpus", "generated-corpus", "dictionary", "timeout", "max-len", "runs", "fork-jobs", "persistent-mode", "reproducer", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sanitizerSignals: z.array(z.object({
    signal: z.enum(["address", "undefined", "memory", "coverage", "asan", "ubsan", "msan", "jazzer-sanitizers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "cifuzz", "oss-fuzz", "clusterfuzzlite", "artifact-upload", "coverage-report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["libfuzzer", "aflplusplus", "jazzer-junit", "jazzer-maven-plugin", "rules-fuzzing", "cargo-fuzz", "go-test-fuzz", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TestDataReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dataSetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["factory-bot", "factory-boy", "faker-js", "faker-python", "fixtures", "seeds", "custom", "unknown"]),
    factoryCount: z.number().int().nonnegative(),
    traitCount: z.number().int().nonnegative(),
    associationCount: z.number().int().nonnegative(),
    sequenceCount: z.number().int().nonnegative(),
    fakerCount: z.number().int().nonnegative(),
    overrideCount: z.number().int().nonnegative(),
    persistenceCount: z.number().int().nonnegative(),
    seedCount: z.number().int().nonnegative(),
    lintCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  factorySignals: z.array(z.object({
    signal: z.enum(["factory-bot-define", "factory-boy-class", "factory-girl", "fixture-files", "seed-scripts", "custom-builders", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  relationshipSignals: z.array(z.object({
    signal: z.enum(["traits", "associations", "subfactory", "transient", "post-generation", "callbacks", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  generationSignals: z.array(z.object({
    signal: z.enum(["sequence", "lazy-attribute", "faker-js", "faker-python", "fuzzy", "locale", "unique", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reproducibilitySignals: z.array(z.object({
    signal: z.enum(["faker-seed", "sequence-reset", "factory-lint", "fixed-ref-date", "deterministic-fixtures", "database-cleaner", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["build", "create", "attributes-for", "build-stubbed", "build-batch", "create-batch", "fixture-load", "db-seed", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "factory-lint", "seed-script", "test-data-artifact", "database-reset", "parallel-workers", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["factory_bot", "factory_bot_rails", "factory_boy", "faker", "@faker-js/faker", "database_cleaner", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const IntegrationTestEnvironmentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  integrationSetups: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["testcontainers-node", "testcontainers-python", "java", "go", "compose", "custom", "unknown"]),
    containerCount: z.number().int().nonnegative(),
    moduleCount: z.number().int().nonnegative(),
    hasWaitStrategy: z.boolean(),
    hasLifecycleCleanup: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  containerSignals: z.array(z.object({
    signal: z.enum(["generic-container", "docker-container", "specialized-module", "docker-compose", "exposed-ports", "env-vars", "bind-mounts", "network", "image-build", "toxiproxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  waitSignals: z.array(z.object({
    signal: z.enum(["listening-ports", "log-message", "health-check", "http", "successful-command", "one-shot", "startup-timeout", "wait-for-logs", "wait-for-http", "wait-container-ready", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["start", "stop", "context-manager", "before-all", "after-all", "global-setup", "ryuk", "resource-reaper", "reuse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["docker-host", "podman", "compose-binary", "ci-service", "socket", "env-config", "timeout", "cleanup-disable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["testcontainers", "@testcontainers/*", "testcontainers-python", "pytest", "vitest", "jest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ChaosEngineeringReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  chaosSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["chaos-mesh", "litmus", "toxiproxy", "gremlin", "custom", "unknown"]),
    experimentCount: z.number().int().nonnegative(),
    faultCount: z.number().int().nonnegative(),
    scopeCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    hasSelector: z.boolean(),
    hasDuration: z.boolean(),
    hasProbeOrSteadyState: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  experimentSignals: z.array(z.object({
    signal: z.enum(["pod-chaos", "network-chaos", "stress-chaos", "io-chaos", "dns-chaos", "time-chaos", "http-chaos", "schedule", "workflow", "chaos-engine", "chaos-experiment", "chaos-result", "toxiproxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  faultSignals: z.array(z.object({
    signal: z.enum(["pod-kill", "pod-delete", "network-delay", "network-loss", "network-partition", "network-bandwidth", "cpu-stress", "memory-stress", "io-delay", "time-shift", "dns-error", "http-abort", "http-delay", "latency-toxic", "timeout-toxic", "bandwidth-toxic", "slow-close-toxic", "limit-data-toxic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["selector", "namespace", "label-selector", "mode", "duration", "container-names", "target", "blast-radius", "service-account", "annotation-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["probe", "steady-state", "sot", "eot", "prometheus-probe", "http-probe", "k8s-probe", "cmd-probe", "rollback", "abort", "pause", "cleanup", "job-cleanup-policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["prometheus", "grafana", "otel", "alert-rule", "metrics", "dashboard", "chaos-result", "report", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["chaos-mesh", "litmuschaos", "toxiproxy", "gremlin", "helm", "kubectl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AccessibilityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scanTargets: z.array(z.object({
    filePath: z.string(),
    kind: z.enum(["page", "component", "template", "test", "config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ruleTags: z.array(z.object({
    tag: z.enum(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice", "section508", "cat.aria", "cat.color", "cat.forms", "cat.keyboard", "cat.language", "cat.name-role-value", "cat.parsing", "cat.semantics", "cat.structure", "cat.tables", "cat.text-alternatives", "cat.time-and-media", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultBuckets: z.array(z.object({
    bucket: z.enum(["violations", "passes", "incomplete", "inapplicable"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  impactLevels: z.array(z.object({
    impact: z.enum(["critical", "serious", "moderate", "minor", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    filePath: z.string(),
    integration: z.enum(["axe-run", "axe-core-package", "jest-axe", "playwright-axe", "cypress-axe", "pa11y", "lighthouse", "manual-review", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  contextControls: z.array(z.object({
    control: z.enum(["include-exclude", "run-only-tags", "disable-rules", "iframes", "shadow-dom", "locale", "reporter", "jsdom", "timeouts"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StorybookReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  storyFiles: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["csf3", "csf2", "mdx", "svelte-csf", "legacy", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["main", "preview", "manager", "test-runner", "vitest", "package-script", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  storyAnnotations: z.array(z.object({
    annotation: z.enum(["component", "title", "args", "argTypes", "parameters", "decorators", "loaders", "tags", "render", "play", "name", "subcomponents"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  addonSignals: z.array(z.object({
    addon: z.enum(["docs", "controls", "actions", "interactions", "a11y", "viewport", "backgrounds", "measure", "outline", "coverage", "vitest", "test-runner", "chromatic", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["render-tests", "interaction-tests", "accessibility-tests", "visual-tests", "snapshot-tests", "coverage", "ci", "storybook-test", "portable-stories"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  publishSignals: z.array(z.object({
    signal: z.enum(["build-storybook", "storybook-static", "chromatic", "composition", "refs", "static-dirs", "docs-mode", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DesignTokensReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tokenSources: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["style-dictionary-config", "tokens-json", "tokens-js", "dtcg-json", "css-custom-properties", "tailwind-theme", "sass-variables", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  tokenCategories: z.array(z.object({
    category: z.enum(["color", "size", "dimension", "typography", "font", "spacing", "border", "radius", "shadow", "motion", "opacity", "breakpoint", "asset", "z-index", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  platformTargets: z.array(z.object({
    target: z.enum(["css", "scss", "javascript", "typescript", "android", "compose", "ios", "ios-swift", "flutter", "react-native", "docs", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["transform-group", "transforms", "formats", "build-path", "files", "filters", "custom-transform", "custom-format", "custom-parser", "output-references", "expand", "dtcg"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  usageSignals: z.array(z.object({
    signal: z.enum(["css-variables", "theme-provider", "tailwind-config", "component-style", "storybook", "docs", "package-script", "build-output", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["cti-structure", "aliases", "comments", "themes", "multi-brand", "deprecation", "npm-module", "ci-build", "s3-publish", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const I18nReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  messageSources: z.array(z.object({
    filePath: z.string(),
    mechanism: z.enum(["defineMessages", "defineMessage", "FormattedMessage", "formatMessage", "IntlProvider", "locale-json", "message-catalog", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  localeAssets: z.array(z.object({
    filePath: z.string(),
    locale: z.string().nullable(),
    assetType: z.enum(["source-locale", "target-locale", "compiled-messages", "extracted-messages", "runtime-locale-data", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["IntlProvider", "locale-prop", "messages-prop", "navigator-language", "fallback-locale", "polyfill", "locale-data", "resolved-options", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  extractionSignals: z.array(z.object({
    signal: z.enum(["formatjs-extract", "formatjs-compile", "formatjs-verify", "compile-folder", "id-interpolation", "extract-source-location", "additional-names", "ignore-globs", "flatten", "pseudo-locale"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  icuSignals: z.array(z.object({
    signal: z.enum(["plural", "select", "selectordinal", "number", "date", "time", "rich-text", "description", "placeholder", "ast"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qaSignals: z.array(z.object({
    signal: z.enum(["eslint-plugin-formatjs", "enforce-description", "enforce-id", "no-invalid-icu", "missing-keys", "structural-equality", "extra-keys", "tms-format", "ci-workflow", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ReleaseReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  releaseConfigs: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["semantic-release-config", "releaserc", "package-release-key", "package-script", "github-workflow", "changesets-config", "release-please-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  branchChannels: z.array(z.object({
    channel: z.enum(["main", "maintenance", "next", "next-major", "beta", "alpha", "custom"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  versionSignals: z.array(z.object({
    signal: z.enum(["semantic-versioning", "conventional-commits", "breaking-change", "commit-analyzer", "release-notes-generator", "tag-format", "last-release-tag", "changelog", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["ci-workflow", "tests-before-release", "fetch-depth-zero", "contents-write", "id-token-write", "manual-trigger", "dry-run", "npm-audit-signatures", "protected-branch", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  publishTargets: z.array(z.object({
    target: z.enum(["npm", "github-release", "gitlab-release", "docker", "vs-code", "git-commit", "changelog", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["github-token", "npm-token", "oidc-trusted-publishing", "registry-config", "ssh-key", "persist-credentials-false", "token-redaction", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSteps: z.array(z.object({
    step: z.enum(["verifyConditions", "analyzeCommits", "verifyRelease", "generateNotes", "prepare", "publish", "addChannel", "success", "fail"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SecretReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scanTargets: z.array(z.object({
    target: z.enum(["git-history", "working-tree", "stdin", "pre-commit", "archive", "config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  secretSurfaces: z.array(z.object({
    filePath: z.string(),
    surfaceType: z.enum(["env-file", "key-file", "credential-config", "token-path", "ignored-secret-candidate", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    filePath: z.string(),
    signal: z.enum(["gitleaks-config", "extend-default", "custom-rule", "entropy", "secret-group", "keywords", "allowlist", "gitleaksignore", "allow-comment", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  reportingSignals: z.array(z.object({
    signal: z.enum(["json", "csv", "junit", "sarif", "template", "report-path", "baseline", "fingerprint", "redaction"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  preventionSignals: z.array(z.object({
    signal: z.enum(["pre-commit", "staged", "git-hook", "github-action", "ci", "exit-code", "protect-legacy"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  advancedSignals: z.array(z.object({
    signal: z.enum(["decode-depth", "archive-depth", "diagnostics", "enable-rule", "log-opts", "timeout"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SecretManagementReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  secretManagementSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["vault", "infisical", "doppler", "sops", "sealed-secrets", "external-secrets", "custom", "unknown"]),
    authCount: z.number().int().nonnegative(),
    engineCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    injectionCount: z.number().int().nonnegative(),
    rotationCount: z.number().int().nonnegative(),
    syncCount: z.number().int().nonnegative(),
    auditCount: z.number().int().nonnegative(),
    leaseCount: z.number().int().nonnegative(),
    encryptionCount: z.number().int().nonnegative(),
    cliCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["vault", "infisical", "doppler", "sops", "sealed-secrets", "external-secrets", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["token", "approle", "kubernetes-auth", "oidc", "aws-auth", "gcp-auth", "azure-auth", "universal-auth", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["kv", "secret-engine", "dynamic-secrets", "pki", "transit", "certificate", "database-credentials", "environment-config", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["env-injection", "cli-run", "agent", "kubernetes-operator", "sync", "github-action", "ci-cd", "sdk-api", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["policy", "rbac", "audit-log", "lease", "rotation", "versioning", "access-request", "break-glass", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@infisical/sdk", "infisical", "vault", "node-vault", "doppler", "sops", "sealed-secrets", "external-secrets", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ContainerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dockerfiles: z.array(z.object({
    filePath: z.string(),
    stageCount: z.number().int().nonnegative(),
    baseImages: z.array(z.string()),
    instructionKinds: z.array(z.string()),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  composeFiles: z.array(z.object({
    filePath: z.string(),
    serviceCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    filePath: z.string(),
    signal: z.enum(["hadolint-config", "ignored-rules", "severity-override", "failure-threshold", "trusted-registries", "label-schema", "strict-labels", "disable-ignore-pragma", "output-format", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  instructionRisks: z.array(z.object({
    rule: z.enum(["DL3002", "DL3006", "DL3007", "DL3008", "DL3013", "DL3016", "DL3018", "DL3020", "DL3025", "DL3026", "DL3042", "DL3057", "DL3059", "DL4006", "SC", "unknown"]),
    severity: z.enum(["error", "warning", "info", "style", "external"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  labelPolicy: z.array(z.object({
    label: z.enum(["author", "contact", "created", "version", "documentation", "git-revision", "license", "custom"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    signal: z.enum(["pre-commit", "github-action", "gitlab-ci", "circleci", "jenkins", "editor", "code-quality-report", "sarif", "junit"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ContainerScanReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  containerScanSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["trivy", "grype", "dockle", "github-actions", "package-script", "readme", "unknown"]),
    imageCount: z.number().int().nonnegative(),
    vulnerabilityCount: z.number().int().nonnegative(),
    misconfigCount: z.number().int().nonnegative(),
    secretCount: z.number().int().nonnegative(),
    licenseCount: z.number().int().nonnegative(),
    sbomCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["image", "filesystem", "sbom", "dockerfile", "kubernetes", "tar-input", "registry", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scannerSignals: z.array(z.object({
    signal: z.enum(["trivy", "grype", "dockle", "vulnerability", "misconfig", "secret", "license", "cis-benchmark", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  gateSignals: z.array(z.object({
    signal: z.enum(["exit-code", "severity", "ignore-unfixed", "only-fixed", "fail-on", "exit-level", "ignore-policy", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "sarif", "cyclonedx", "spdx", "table", "template", "github", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["trivyignore", "grype-ignore", "dockleignore", "vex", "ignore-policy", "accept-key", "sensitive-file", "offline-db", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["image-ref", "registry-token", "docker-host", "podman", "private-registry", "platform", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "docker-build", "artifact-upload", "sarif-upload", "permissions", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["trivy-action", "grype", "dockle-action", "docker", "syft", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CodeQualityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  toolConfigs: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["biome-config", "eslint-config", "prettier-config", "package-script", "editor-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  formatterSignals: z.array(z.object({
    signal: z.enum(["formatter-enabled", "format-command", "write-mode", "language-support", "line-width", "indent-style", "prettier-compat", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  linterSignals: z.array(z.object({
    signal: z.enum(["linter-enabled", "rule-groups", "custom-rules", "recommended-rules", "safe-fixes", "unsafe-fixes", "dependency-rule", "import-cycle-rule", "promise-rule", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assistSignals: z.array(z.object({
    signal: z.enum(["assist-enabled", "organize-imports", "sorted-keys", "plugins", "vcs-ignore", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["biome-ci", "biome-check", "github-action", "gitlab-ci", "pre-commit", "package-script", "editor-lsp", "reporter", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  languageCoverage: z.array(z.object({
    language: z.enum(["javascript", "typescript", "jsx", "json", "css", "graphql", "html", "markdown", "unknown"]),
    fileCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DocumentationReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  siteConfigs: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["docusaurus-config", "package-script", "sidebar", "theme-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  contentSurfaces: z.array(z.object({
    surface: z.enum(["docs", "blog", "pages", "mdx", "static-assets", "versioned-docs", "i18n", "unknown"]),
    count: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["sidebar", "navbar", "footer", "breadcrumbs", "toc", "edit-url", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["search", "seo", "sitemap", "pwa", "analytics", "theme", "mdx", "typescript", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  localizationSignals: z.array(z.object({
    signal: z.enum(["i18n-config", "locale-dropdown", "translation-folder", "crowdin", "localized-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["build-script", "serve-script", "deploy-script", "github-pages", "netlify", "vercel", "ci-preview", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DatabaseReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schemaFiles: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["postgresql", "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb", "mariadb", "unknown"]),
    datasourceCount: z.number().int().nonnegative(),
    generatorCount: z.number().int().nonnegative(),
    modelCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  datasourceSignals: z.array(z.object({
    provider: z.enum(["postgresql", "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb", "mariadb", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  migrationSignals: z.array(z.object({
    signal: z.enum(["migrations-folder", "migration-sql", "migration-lock", "migrate-dev", "migrate-deploy", "db-push", "introspection", "schema-drift", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["prisma-client", "client-generation", "custom-output", "prisma-client-js", "driver-adapter", "typed-query", "studio", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["prisma-config", "database-url", "dotenv", "seed", "package-script", "docker-compose", "env-example", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["model", "relation", "id", "unique", "index", "enum", "native-type", "default", "map", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DatabaseMigrationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  migrationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["flyway", "liquibase", "alembic", "drizzle", "rails", "prisma", "sql", "custom", "unknown"]),
    versionedCount: z.number().int().nonnegative(),
    repeatableCount: z.number().int().nonnegative(),
    changelogCount: z.number().int().nonnegative(),
    changesetCount: z.number().int().nonnegative(),
    revisionCount: z.number().int().nonnegative(),
    rollbackCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  fileSignals: z.array(z.object({
    signal: z.enum(["flyway-versioned", "flyway-repeatable", "flyway-undo", "liquibase-changelog", "liquibase-formatted-sql", "alembic-revision", "drizzle-migration", "rails-migration", "sql-migration", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lineageSignals: z.array(z.object({
    signal: z.enum(["version-prefix", "repeatable-prefix", "down-revision", "heads", "branch-label", "timestamped-version", "checksum", "databasechangelog", "schema-history", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rollbackSignals: z.array(z.object({
    signal: z.enum(["liquibase-rollback", "alembic-downgrade", "flyway-undo", "rails-down-change", "drizzle-down", "transactional-ddl", "restore-point", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["flyway-validate", "flyway-repair", "flyway-info", "liquibase-status", "liquibase-update-sql", "alembic-current", "alembic-heads", "alembic-check", "drizzle-check", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["flyway-conf", "flyway-toml", "liquibase-properties", "alembic-ini", "script-location", "version-locations", "database-url", "migration-path", "placeholder", "contexts-labels", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "migration-command", "dry-run", "schema-drift", "artifact-upload", "database-service", "manual-approval", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["flyway", "liquibase", "alembic", "drizzle-kit", "typeorm", "knex", "sequelize", "rails", "prisma", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DatabaseOrmReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  ormSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["typeorm", "sequelize", "sqlalchemy", "prisma", "django", "rails", "drizzle", "knex", "unknown"]),
    entityCount: z.number().int().nonnegative(),
    relationCount: z.number().int().nonnegative(),
    repositoryCount: z.number().int().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    transactionCount: z.number().int().nonnegative(),
    migrationCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["typeorm-entity", "sequelize-model", "sqlalchemy-declarative", "prisma-model", "django-model", "rails-model", "drizzle-table", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  relationSignals: z.array(z.object({
    signal: z.enum(["typeorm-relations", "sequelize-associations", "sqlalchemy-relationship", "prisma-relations", "foreign-key", "join-table", "cascade", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  repositorySignals: z.array(z.object({
    signal: z.enum(["typeorm-repository", "sequelize-model-query", "sqlalchemy-session", "active-record-query", "query-builder", "raw-query", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transactionSignals: z.array(z.object({
    signal: z.enum(["typeorm-transaction", "sequelize-transaction", "sqlalchemy-session-begin", "active-record-transaction", "rollback", "isolation-level", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadingSignals: z.array(z.object({
    signal: z.enum(["eager-loading", "lazy-loading", "joined-load", "select-in-load", "include", "relation-load-strategy", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["datasource-config", "sequelize-config", "sqlalchemy-engine", "database-url", "naming-strategy", "synchronization-policy", "connection-pool", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "orm-command", "schema-sync-check", "migration-check", "database-service", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["typeorm", "sequelize", "sqlalchemy", "prisma", "django", "rails", "drizzle-orm", "knex", "objection", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataTransformationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  transformationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["dbt", "sqlmesh", "dataform", "custom", "unknown"]),
    projectCount: z.number().int().nonnegative(),
    modelCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    macroCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    incrementalCount: z.number().int().nonnegative(),
    environmentCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["dbt", "sqlmesh", "dataform", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["dbt-model", "sqlmesh-model", "dataform-table", "sql-model", "python-model", "seed", "snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["ref", "source", "dependency", "declaration", "owner", "tag", "grain", "cron", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  incrementalitySignals: z.array(z.object({
    signal: z.enum(["materialized-incremental", "unique-key", "incremental-by-time-range", "scd-type-2", "pre-post-ops", "state-modified", "defer", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["target-profile", "sqlmesh-environment", "virtual-environment", "dataform-workflow-settings", "warehouse-engine", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifactSignals: z.array(z.object({
    signal: z.enum(["manifest", "run-results", "compiled-graph", "catalog", "snapshot", "state-sync", "compiled-sql", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dbt-build", "dbt-compile", "dbt-ls", "sqlmesh-plan", "sqlmesh-test", "dataform-compile", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["dbt-core", "sqlmesh", "dataform-core", "dataform-cli", "sqlglot", "dbt-adapter", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataQualityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dataQualitySetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["great-expectations", "soda-core", "dbt", "deequ", "pandera", "custom", "unknown"]),
    suiteCount: z.number().int().nonnegative(),
    expectationCount: z.number().int().nonnegative(),
    checkpointCount: z.number().int().nonnegative(),
    scanCount: z.number().int().nonnegative(),
    schemaTestCount: z.number().int().nonnegative(),
    freshnessCount: z.number().int().nonnegative(),
    resultCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  expectationSignals: z.array(z.object({
    signal: z.enum(["expectation-suite", "validator", "checkpoint", "batch-request", "expect-column-values", "expect-table", "mostly", "result-format", "unexpected-rows", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sodaSignals: z.array(z.object({
    signal: z.enum(["sodacl", "checks-for", "row-count", "missing-count", "duplicate-count", "freshness", "fail-warn-threshold", "scan-command", "data-source", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dbtSignals: z.array(z.object({
    signal: z.enum(["data-tests", "schema-yml", "not-null", "unique", "accepted-values", "relationships", "source-freshness", "severity", "store-failures", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualityDimensionSignals: z.array(z.object({
    signal: z.enum(["completeness", "uniqueness", "validity", "freshness", "schema", "volume", "distribution", "anomaly", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultSignals: z.array(z.object({
    signal: z.enum(["validation-result", "run-results", "failed-rows", "data-docs", "junit", "sarif", "artifact", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "quality-scan-command", "dbt-test-command", "gx-checkpoint-command", "soda-scan-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["great-expectations", "soda-core", "dbt-core", "dbt-expectations", "dbt-utils", "pandera", "deequ", "pydantic", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataLineageReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  lineageSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["openlineage", "marquez", "dbt", "airflow", "spark", "custom", "unknown"]),
    eventCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    jobCount: z.number().int().nonnegative(),
    runCount: z.number().int().nonnegative(),
    facetCount: z.number().int().nonnegative(),
    columnLineageCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["run-event", "event-type", "producer", "schema-url", "event-time", "run-id", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["namespace", "job-name", "run-id", "dataset-namespace", "dataset-name", "unique-id", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  datasetSignals: z.array(z.object({
    signal: z.enum(["input-dataset", "output-dataset", "dataset-version", "schema-facet", "column-lineage", "data-source", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dbtArtifactSignals: z.array(z.object({
    signal: z.enum(["manifest", "catalog", "run-results", "sources", "exposures", "metrics", "semantic-models", "parent-child-map", "depends-on", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["marquez-api", "lineage-events-table", "dataset-facets", "job-facets", "run-facets", "dataset-version", "job-version", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dbt-docs-generate", "openlineage-command", "lineage-export", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["openlineage", "marquez", "dbt-core", "airflow-openlineage", "spark-openlineage", "sqlglot", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataCatalogReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  catalogSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["openmetadata", "datahub", "amundsen", "custom", "unknown"]),
    ingestionCount: z.number().int().nonnegative(),
    entityCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    ownershipCount: z.number().int().nonnegative(),
    glossaryCount: z.number().int().nonnegative(),
    tagCount: z.number().int().nonnegative(),
    lineageCount: z.number().int().nonnegative(),
    searchCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ingestionSignals: z.array(z.object({
    signal: z.enum(["source-config", "connector", "recipe", "workflow", "pipeline", "scheduler", "profiling", "usage", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["dataset", "table", "column", "dashboard", "chart", "data-job", "data-flow", "user", "team", "domain", "data-product", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["owner", "glossary-term", "tag", "classification", "policy", "domain", "stewardship", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  searchSignals: z.array(z.object({
    signal: z.enum(["elasticsearch", "opensearch", "semantic-search", "browse-paths", "search-index", "metadata-api", "mcp-search", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lineageSignals: z.array(z.object({
    signal: z.enum(["upstream-lineage", "column-lineage", "data-job-io", "query-lineage", "impact-analysis", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "catalog-ingestion-command", "metadata-test-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["openmetadata", "datahub", "amundsen", "elasticsearch", "opensearch", "neo4j", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataAnnotationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  annotationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom", "unknown"]),
    projectCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    qualityCount: z.number().int().nonnegative(),
    prelabelCount: z.number().int().nonnegative(),
    reviewCount: z.number().int().nonnegative(),
    exportCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  projectSignals: z.array(z.object({
    signal: z.enum(["project", "dataset", "workspace", "labeling-interface", "task-template", "guidelines", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["task", "record", "sample", "import", "metadata", "assignment", "overlap", "bulk", "filter", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["label-config", "question", "choice", "taxonomy", "bounding-box", "segmentation", "span", "ranking", "rating", "text-response", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["annotate", "load-annotations", "submit-response", "draft", "review", "consensus", "ground-truth", "active-learning", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["inter-annotator-agreement", "consensus", "disagreement", "review-queue", "confidence-score", "evaluation", "validation", "metrics", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  prelabelSignals: z.array(z.object({
    signal: z.enum(["prediction", "suggestion", "model-assisted", "similarity", "embedding", "weak-supervision", "active-learning", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exportSignals: z.array(z.object({
    signal: z.enum(["export", "json", "csv", "coco", "yolo", "fiftyone-dataset", "storage", "downstream", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "import-smoke-command", "export-smoke-command", "schema-check-command", "quality-check-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LakehouseTableReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  lakehouseSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["delta", "iceberg", "hudi", "custom", "unknown"]),
    tableCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    transactionCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    partitionCount: z.number().int().nonnegative(),
    mergeCount: z.number().int().nonnegative(),
    timeTravelCount: z.number().int().nonnegative(),
    maintenanceCount: z.number().int().nonnegative(),
    streamingCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["delta-lake", "apache-iceberg", "apache-hudi", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tableSignals: z.array(z.object({
    signal: z.enum(["delta-table", "iceberg-table", "hudi-table", "catalog-table", "path-table", "managed-table", "external-table", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["delta-log", "checkpoint", "protocol-version", "iceberg-metadata-json", "manifest-list", "manifest-file", "snapshot", "hudi-timeline", "commit-instant", "metadata-table", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["schema-evolution", "partition-spec", "partition-evolution", "generated-column", "constraints", "sort-order", "record-key", "precombine-key", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  writeSignals: z.array(z.object({
    signal: z.enum(["append", "merge-into", "upsert", "delete", "overwrite", "copy-on-write", "merge-on-read", "streaming-write", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timeTravelSignals: z.array(z.object({
    signal: z.enum(["version-as-of", "timestamp-as-of", "snapshot-id", "branch-or-tag", "restore", "rollback", "savepoint", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  maintenanceSignals: z.array(z.object({
    signal: z.enum(["vacuum", "optimize", "compaction", "clustering", "cleaner", "expire-snapshots", "rewrite-data-files", "remove-orphan-files", "manifest-rewrite", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  streamingSignals: z.array(z.object({
    signal: z.enum(["checkpoint-location", "change-data-feed", "incremental-query", "delta-streaming", "flink-sink", "kafka-connect", "deltastreamer", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "table-smoke-command", "merge-smoke-command", "maintenance-smoke-command", "streaming-smoke-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["delta-spark", "delta-rs", "iceberg", "iceberg-spark", "iceberg-flink", "hudi", "hudi-spark", "hudi-flink", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FeatureStoreReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  featureStoreSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["feast", "feathr", "hopsworks", "custom", "unknown"]),
    definitionCount: z.number().int().nonnegative(),
    entityCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    offlineStoreCount: z.number().int().nonnegative(),
    onlineStoreCount: z.number().int().nonnegative(),
    materializationCount: z.number().int().nonnegative(),
    retrievalCount: z.number().int().nonnegative(),
    registryCount: z.number().int().nonnegative(),
    trainingDatasetCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  definitionSignals: z.array(z.object({
    signal: z.enum(["entity", "feature-view", "feature-service", "feature-anchor", "derived-feature", "feature-group", "schema-field", "transform", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sourceSignals: z.array(z.object({
    signal: z.enum(["batch-source", "stream-source", "request-source", "push-source", "data-source", "event-timestamp", "ttl", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["offline-store", "online-store", "registry", "provider", "redis", "spark", "snowflake", "bigquery", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  retrievalSignals: z.array(z.object({
    signal: z.enum(["historical-features", "online-features", "point-in-time", "training-dataset", "feature-join", "entity-df", "serving-api", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  materializationSignals: z.array(z.object({
    signal: z.enum(["materialize-command", "incremental-materialize", "scheduled-materialization", "streaming-ingestion", "sink", "feature-server", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "feature-store-apply-command", "materialization-command", "offline-online-test-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["feast", "feathr", "hopsworks", "redis", "spark", "kafka", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelRegistryReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelRegistrySetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["mlflow", "kubeflow", "bentoml", "custom", "unknown"]),
    registeredModelCount: z.number().int().nonnegative(),
    versionCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    aliasCount: z.number().int().nonnegative(),
    stageCount: z.number().int().nonnegative(),
    lineageCount: z.number().int().nonnegative(),
    signatureCount: z.number().int().nonnegative(),
    servingCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  registrationSignals: z.array(z.object({
    signal: z.enum(["registered-model", "model-version", "model-artifact", "model-uri", "model-store", "bento", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["tag", "alias", "stage", "custom-property", "description", "metric", "signature", "input-example", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifactSignals: z.array(z.object({
    signal: z.enum(["artifact-uri", "model-uri", "download-uri", "container-image", "dockerfile", "bento-build", "package-config", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["create", "update", "search", "delete", "transition-stage", "approval", "promotion", "rollback", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  servingSignals: z.array(z.object({
    signal: z.enum(["inference-service", "serving-environment", "kserve", "model-server", "rest-api", "grpc", "bento-serve", "deployment", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lineageSignals: z.array(z.object({
    signal: z.enum(["run-link", "source-run", "model-version-lineage", "dataset-link", "evaluation-metric", "provenance", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "register-command", "model-test-command", "serving-smoke-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["mlflow", "kubeflow-model-registry", "bentoml", "kserve", "docker", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ExperimentTrackingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  experimentTrackingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["mlflow", "wandb", "neptune", "custom", "unknown"]),
    experimentCount: z.number().int().nonnegative(),
    runCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    paramCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    tagCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    sweepCount: z.number().int().nonnegative(),
    offlineSyncCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  runSignals: z.array(z.object({
    signal: z.enum(["experiment", "run", "run-id", "project", "entity", "tracking-uri", "resume", "offline", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loggingSignals: z.array(z.object({
    signal: z.enum(["metric", "param", "config", "summary", "artifact", "media", "table", "dataset", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["tag", "note", "description", "source-code", "environment", "dependency", "git-commit", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  automationSignals: z.array(z.object({
    signal: z.enum(["autolog", "sweep", "hyperparameter-search", "callback", "report", "alert", "launch-job", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["tracking-server", "artifact-store", "workspace", "offline-sync", "local-cache", "remote-project", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "experiment-smoke-command", "metrics-assertion-command", "artifact-upload", "offline-sync-command", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["mlflow", "wandb", "neptune", "tensorboard", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelMonitoringReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelMonitoringSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["evidently", "whylogs", "nannyml", "custom", "unknown"]),
    referenceCount: z.number().int().nonnegative(),
    currentCount: z.number().int().nonnegative(),
    driftCount: z.number().int().nonnegative(),
    qualityCount: z.number().int().nonnegative(),
    performanceCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  datasetSignals: z.array(z.object({
    signal: z.enum(["reference-data", "current-data", "analysis-data", "column-schema", "prediction-column", "target-column", "segment", "timestamp", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  driftSignals: z.array(z.object({
    signal: z.enum(["data-drift", "prediction-drift", "target-drift", "concept-drift", "univariate-drift", "multivariate-drift", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["missing-values", "outliers", "data-quality", "schema-validation", "constraints", "validators", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  performanceSignals: z.array(z.object({
    signal: z.enum(["classification", "regression", "estimated-performance", "realized-performance", "threshold", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportingSignals: z.array(z.object({
    signal: z.enum(["report", "test-suite", "dashboard", "snapshot", "workspace", "export", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alertSignals: z.array(z.object({
    signal: z.enum(["alert", "threshold", "notification", "monitor", "schedule", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "monitoring-smoke-command", "drift-test-command", "report-upload", "threshold-assertion-command", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["evidently", "whylogs", "whylabs", "nannyml", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelServingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelServingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["kserve", "seldon", "triton", "bentoml", "custom", "unknown"]),
    inferenceServiceCount: z.number().int().nonnegative(),
    runtimeCount: z.number().int().nonnegative(),
    modelRepositoryCount: z.number().int().nonnegative(),
    protocolCount: z.number().int().nonnegative(),
    routingCount: z.number().int().nonnegative(),
    autoscalingCount: z.number().int().nonnegative(),
    healthCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["inference-service", "serving-runtime", "seldon-deployment", "triton-server", "model-repository", "custom-server", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["predictor", "transformer", "explainer", "backend", "model-format", "gpu", "batching", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  protocolSignals: z.array(z.object({
    signal: z.enum(["rest", "grpc", "v2-protocol", "http-health", "predict-endpoint", "metadata-endpoint", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routingSignals: z.array(z.object({
    signal: z.enum(["canary", "traffic-split", "shadow", "inference-graph", "gateway", "load-balancing", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scalingSignals: z.array(z.object({
    signal: z.enum(["autoscaling", "min-replicas", "max-replicas", "scale-to-zero", "hpa", "concurrency", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  healthSignals: z.array(z.object({
    signal: z.enum(["readiness-probe", "liveness-probe", "startup-probe", "health-endpoint", "model-ready", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["cpu", "memory", "gpu", "node-selector", "tolerations", "service-account", "storage-uri", "secret", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "logging", "tracing", "prometheus", "access-log", "request-id", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "deploy-command", "inference-smoke-command", "health-check-command", "manifest-apply", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kserve", "seldon", "triton", "bentoml", "kubernetes", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelTrainingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelTrainingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["lightning", "accelerate", "ray", "custom", "unknown"]),
    trainerCount: z.number().int().nonnegative(),
    trainingLoopCount: z.number().int().nonnegative(),
    dataCount: z.number().int().nonnegative(),
    optimizerCount: z.number().int().nonnegative(),
    distributedCount: z.number().int().nonnegative(),
    acceleratorCount: z.number().int().nonnegative(),
    checkpointCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  loopSignals: z.array(z.object({
    signal: z.enum(["trainer", "train-loop", "fit", "training-step", "validation-step", "optimizer", "scheduler", "gradient-accumulation", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["dataloader", "datamodule", "dataset-shard", "prepare-dataloader", "batch-size", "validation-loader", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  distributedSignals: z.array(z.object({
    signal: z.enum(["ddp", "fsdp", "deepspeed", "torchrun", "accelerate-launch", "ray-train", "multi-gpu", "multi-node", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  acceleratorSignals: z.array(z.object({
    signal: z.enum(["gpu", "tpu", "xla", "mixed-precision", "bf16", "fp16", "device-placement", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checkpointSignals: z.array(z.object({
    signal: z.enum(["checkpoint", "resume", "save-state", "load-state", "artifact-storage", "best-model", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["early-stopping", "lr-monitor", "model-summary", "progress-bar", "ray-report-callback", "custom-callback", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metric", "logger", "tensorboard", "wandb", "mlflow", "report", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["trainer-config", "scaling-config", "run-config", "project-config", "seed", "deterministic", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "training-smoke-command", "distributed-smoke-command", "checkpoint-assertion-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["lightning", "accelerate", "ray", "torch", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CiCdReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  workflowFiles: z.array(z.object({
    filePath: z.string(),
    workflowName: z.string().nullable(),
    triggerCount: z.number().int().nonnegative(),
    jobCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  triggerSignals: z.array(z.object({
    trigger: z.enum(["push", "pull_request", "workflow_dispatch", "schedule", "repository_dispatch", "workflow_call", "release", "deployment", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  jobSignals: z.array(z.object({
    signal: z.enum(["jobs", "runs-on", "steps", "uses", "run", "needs", "matrix", "services", "container", "defaults", "timeout-minutes", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["permissions", "contents-read", "id-token-write", "secrets", "environment", "pinned-actions", "pull-request-target", "oidc", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["cache", "artifact-upload", "artifact-download", "concurrency", "environment-protection", "deployment", "release", "package-publish", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["github-hosted-runner", "self-hosted-runner", "linux", "macos", "windows", "node-setup", "python-setup", "docker-build", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const UnitTestReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  testFiles: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["vitest", "jest", "mocha", "ava", "node-test", "unknown"]),
    testCount: z.number().int().nonnegative(),
    assertionCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["vitest-config", "vite-config-test", "package-script", "workspace", "setup-file", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  assertionSignals: z.array(z.object({
    assertion: z.enum(["expect", "assert", "toEqual", "toBe", "toMatchSnapshot", "throws", "resolves", "rejects", "custom-matcher", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mockSignals: z.array(z.object({
    signal: z.enum(["vi-fn", "vi-mock", "vi-spyOn", "fake-timers", "mock-reset", "fixture-data", "module-mock", "request-mock", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coverageSignals: z.array(z.object({
    signal: z.enum(["coverage-enabled", "coverage-provider-v8", "coverage-provider-istanbul", "coverage-include", "coverage-exclude", "coverage-thresholds", "coverage-reporters", "coverage-script", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["node", "jsdom", "happy-dom", "browser-mode", "globals", "setup-files", "pool", "isolate", "projects", "workspace", "typecheck", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportingSignals: z.array(z.object({
    signal: z.enum(["watch", "run", "ui", "reporter", "junit", "json", "html", "snapshot-update", "filtering", "sharding", "benchmark", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CoverageReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  coverageSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["nyc", "c8", "vitest", "jest", "coverage.py", "pytest-cov", "go-cover", "codecov", "coveralls", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    scriptCount: z.number().int().nonnegative(),
    reporterCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    includeCount: z.number().int().nonnegative(),
    excludeCount: z.number().int().nonnegative(),
    uploadCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    mergeCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    signal: z.enum(["nyc", "c8", "v8-provider", "istanbul-provider", "babel-istanbul", "coverage-py", "pytest-cov", "go-cover", "lcov-genhtml", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["all-files", "include", "exclude", "exclude-after-remap", "source-map", "per-file", "workspace-src", "ignore-hints", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  thresholdSignals: z.array(z.object({
    signal: z.enum(["check-coverage", "lines", "functions", "branches", "statements", "watermarks", "global-threshold", "per-file-threshold", "patch-threshold", "project-threshold", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["text", "text-summary", "html", "lcov", "json", "json-summary", "cobertura", "clover", "junit", "coverage-final", "coverage-out", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciUploadSignals: z.array(z.object({
    signal: z.enum(["codecov-action", "codecov-token", "codecov-oidc", "codecov-flags", "codecov-files", "fail-ci-if-error", "coveralls", "github-step-summary", "upload-artifact", "badge", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nyc", "c8", "@vitest/coverage-v8", "@vitest/coverage-istanbul", "jest", "babel-plugin-istanbul", "coverage", "pytest-cov", "codecov-action", "coveralls", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MutationTestingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mutationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["stryker", "infection", "mutmut", "pitest", "mutation-testing-elements", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    mutatePatternCount: z.number().int().nonnegative(),
    mutatorCount: z.number().int().nonnegative(),
    runnerCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    reporterCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    incrementalCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["stryker", "infection", "mutmut", "pitest", "mutation-testing-elements", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["config-file", "package-script", "schema", "mutate-pattern", "test-runner", "coverage-analysis", "disable-type-checks", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["thresholds", "mutation-score", "covered-score", "survived", "killed", "timeout", "ignored", "no-coverage", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reporterSignals: z.array(z.object({
    signal: z.enum(["html", "json", "clear-text", "progress", "dashboard", "badge", "junit", "mutation-testing-report-schema", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["src", "lib", "test-files", "ignore-patterns", "with-uncovered", "incremental", "dry-run", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@stryker-mutator/core", "@stryker-mutator/vitest-runner", "@stryker-mutator/jest-runner", "mutation-testing-report-schema", "infection/infection", "mutmut", "pitest", "custom", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TypecheckReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tsconfigFiles: z.array(z.object({
    filePath: z.string(),
    compilerOptionsCount: z.number().int().nonnegative(),
    referencesCount: z.number().int().nonnegative(),
    includeCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  compilerOptionSignals: z.array(z.object({
    signal: z.enum(["strict", "noImplicitAny", "strictNullChecks", "noUncheckedIndexedAccess", "exactOptionalPropertyTypes", "noEmit", "noEmitOnError", "skipLibCheck", "isolatedModules", "moduleDetection", "jsx", "target", "module", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  projectSignals: z.array(z.object({
    signal: z.enum(["references", "composite", "incremental", "tsBuildInfoFile", "include", "exclude", "files", "rootDir", "outDir", "extends", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  moduleResolutionSignals: z.array(z.object({
    signal: z.enum(["moduleResolution", "baseUrl", "paths", "typeRoots", "types", "lib", "allowImportingTsExtensions", "rewriteRelativeImportExtensions", "esModuleInterop", "resolveJsonModule", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  declarationSignals: z.array(z.object({
    signal: z.enum(["declaration", "declarationMap", "emitDeclarationOnly", "declarationDir", "sourceMap", "noEmit", "composite-declaration", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["tsc", "typecheck-script", "build-script", "noEmit-command", "project-build", "watch", "generated-types", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PackageManagerReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  manifestFiles: z.array(z.object({
    filePath: z.string(),
    packageManager: z.string().nullable(),
    scriptCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workspaceSignals: z.array(z.object({
    signal: z.enum(["workspace-file", "packages-include", "packages-exclude", "workspace-protocol", "catalog", "overrides", "patched-dependencies", "shared-workspace-lockfile", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lockfileSignals: z.array(z.object({
    filePath: z.string(),
    ecosystem: z.enum(["pnpm", "npm", "yarn", "bun", "unknown"]),
    version: z.string().nullable(),
    importerCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["install", "dev", "build", "test", "lint", "typecheck", "workspace-recursive", "filter", "frozen-lockfile", "prepare", "release", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["packageManager", "devEngines", "engines", "onlyBuiltDependencies", "allowBuilds", "auditConfig", "minimumReleaseAge", "nodeLinker", "configDependencies", "pnpmfile-hook", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const GitHooksReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  hookFiles: z.array(z.object({
    filePath: z.string(),
    hookName: z.string(),
    commandCount: z.number().int().nonnegative(),
    hasBypassHint: z.boolean(),
    hasNodePathHint: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  installSignals: z.array(z.object({
    signal: z.enum(["prepare-script", "postinstall-script", "husky-init", "core-hooks-path", "git-root-subdir", "ci-skip", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["test", "lint", "format", "typecheck", "security", "commitlint", "lint-staged", "npm-run", "pnpm-run", "node-entrypoint", "posix-shell", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["pre-commit", "pre-push", "commit-msg", "prepare-commit-msg", "post-merge", "skip-env", "no-verify", "gui-node-path", "deprecated-husky-sh", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  toolConfigFiles: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["husky", "lint-staged", "commitlint", "lefthook", "pre-commit", "simple-git-hooks", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TaskRunnerReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["turbo", "nx", "taskfile", "moon", "lage", "unknown"]),
    taskCount: z.number().int().nonnegative(),
    dependsOnCount: z.number().int().nonnegative(),
    outputsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["build", "test", "lint", "dev", "typecheck", "format", "quality", "release", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["outputs", "inputs", "cache-false", "remote-cache", "global-env", "pass-through-env", "persistent", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["depends-on", "caret-dependency", "root-task", "package-task", "filter", "workspace-script", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["globalEnv", "globalPassThroughEnv", "passThroughEnv", "env", "dot-env", "ci", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageScriptSignals: z.array(z.object({
    signal: z.enum(["turbo-run", "nx-run", "task-run", "moon-run", "recursive-run", "filter-run", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DependencyUpdateReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["renovate", "dependabot", "package-json", "github-action", "unknown"]),
    extendsCount: z.number().int().nonnegative(),
    packageRuleCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    automergeSignal: z.enum(["enabled", "disabled", "conditional", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  managerSignals: z.array(z.object({
    signal: z.enum(["npm", "docker", "github-actions", "python", "go", "ruby", "terraform", "maven", "gradle", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["extends", "package-rules", "schedule", "automerge", "dependency-dashboard", "labels-reviewers", "rate-limits", "range-strategy", "config-migration", "host-rules", "vulnerability-alerts", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["branch-pr", "dashboard-approval", "grouping", "separate-major", "semantic-commits", "lockfile-maintenance", "rebase", "ignore-paths", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["host-rules", "encrypted-secrets", "registry-url", "token-env", "private-packages", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageFileSignals: z.array(z.object({
    signal: z.enum(["package-json", "package-lock", "pnpm-lock", "yarn-lock", "bun-lock", "dockerfile", "github-actions", "go-mod", "pyproject", "requirements", "gemfile", "terraform", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DependencyReviewReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dependencyReviewSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["dependency-review-action", "dependabot", "osv-scanner", "github-actions", "package-script", "readme", "unknown"]),
    reviewCount: z.number().int().nonnegative(),
    vulnerabilityCount: z.number().int().nonnegative(),
    licenseCount: z.number().int().nonnegative(),
    packagePolicyCount: z.number().int().nonnegative(),
    diffCount: z.number().int().nonnegative(),
    snapshotCount: z.number().int().nonnegative(),
    scorecardCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  reviewSignals: z.array(z.object({
    signal: z.enum(["dependency-review-action", "dependency-graph", "dependency-submission", "base-head-compare", "snapshot-warning", "pr-summary", "pull-request", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  vulnerabilitySignals: z.array(z.object({
    signal: z.enum(["fail-on-severity", "vulnerability-check", "osv-scanner", "lockfile-scan", "min-severity", "ignore-dev", "offline-db", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  licenseSignals: z.array(z.object({
    signal: z.enum(["license-check", "allow-licenses", "deny-licenses", "allow-dependencies-licenses", "license-scan", "spdx", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packagePolicySignals: z.array(z.object({
    signal: z.enum(["deny-packages", "allowlist", "ignore", "groups", "security-updates", "ecosystem-directory", "registries", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "pull-request", "permissions", "artifact-upload", "summary-comment", "scheduled-run", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scorecardSignals: z.array(z.object({
    signal: z.enum(["show-openssf-scorecard", "warn-on-openssf-scorecard-level", "scorecard-api", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["summary", "pr-comment", "sarif", "json", "html", "markdown", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["dependency-review-action", "dependabot", "osv-scanner", "github-action", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LintReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["eslint", "biome", "oxlint", "standard", "package-json", "unknown"]),
    flatConfig: z.boolean(),
    ruleCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    ignoreCount: z.number().int().nonnegative(),
    parserSignal: z.enum(["default", "typescript", "babel", "custom", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["rules", "extends", "recommended", "severity", "files-overrides", "globals", "parser", "plugins", "ignores", "inline-disable", "unused-disable", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["lint", "lint-fix", "cache", "max-warnings", "format", "type-aware", "ci", "stdin", "report", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["javascript", "typescript", "jsx", "tests", "docs", "config-files", "generated", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["formatter", "output-file", "stats", "quiet", "debug", "report-unused-disable", "suppressions", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["eslint", "typescript-eslint", "eslint-plugin", "eslint-config", "parser", "prettier-integration", "globals", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FormatReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["prettier", "editorconfig", "biome", "dprint", "package-json", "unknown"]),
    optionCount: z.number().int().nonnegative(),
    overrideCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    parserSignal: z.enum(["inferred", "override", "plugin", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ignoreFiles: z.array(z.object({
    filePath: z.string(),
    patternCount: z.number().int().nonnegative(),
    generatedSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  optionSignals: z.array(z.object({
    signal: z.enum(["print-width", "tab-width", "single-quote", "trailing-comma", "semi", "bracket-spacing", "end-of-line", "parser", "overrides", "editorconfig", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["format", "format-check", "format-write", "list-different", "cache", "config-path", "ignore-path", "stdin", "ci", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scopeSignals: z.array(z.object({
    signal: z.enum(["javascript", "typescript", "json", "css", "html", "markdown", "yaml", "graphql", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["prettier", "prettier-plugin", "eslint-config-prettier", "dprint", "biome", "editorconfig", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CommitConventionReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["commitlint", "package-json", "husky", "unknown"]),
    extendsCount: z.number().int().nonnegative(),
    ruleCount: z.number().int().nonnegative(),
    parserPreset: z.enum(["conventional", "custom", "missing"]),
    promptSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["type-enum", "scope-enum", "subject-case", "subject-empty", "subject-full-stop", "header-max-length", "body-leading-blank", "body-max-line-length", "footer-leading-blank", "footer-max-line-length", "breaking-change", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  hookSignals: z.array(z.object({
    signal: z.enum(["commit-msg", "husky", "ci-range", "last-commit", "edit-message", "prompt", "bypass", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["from-to", "last", "edit", "verbose", "strict", "format", "config", "help-url", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["commitlint-cli", "config-conventional", "commitizen", "cz-commitlint", "husky", "conventional-changelog", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ChangelogReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["changeset-config", "package-json", "workflow", "unknown"]),
    changelogMode: z.enum(["default", "github", "custom", "disabled", "missing"]),
    baseBranch: z.string().nullable(),
    fixedCount: z.number().int().nonnegative(),
    linkedCount: z.number().int().nonnegative(),
    ignoredCount: z.number().int().nonnegative(),
    privatePackagePolicy: z.enum(["version-only", "tagged", "disabled", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  changesetFiles: z.array(z.object({
    filePath: z.string(),
    packageCount: z.number().int().nonnegative(),
    bumpTypes: z.array(z.enum(["major", "minor", "patch", "none", "unknown"])),
    summaryLines: z.number().int().nonnegative(),
    empty: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["status-check", "changeset-bot", "changesets-action", "version-pr", "publish", "follow-tags", "manual-release", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["add", "status", "version", "publish", "pre", "tag", "snapshot", "since", "output", "otp", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["changesets-cli", "changesets-action", "changelog-github", "workspace", "package-manager", "npm-publish", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["fixed", "linked", "base-branch", "internal-deps", "access", "ignore", "private-packages", "pre-mode", "snapshot", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BundleAnalysisReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["webpack", "vite", "rollup", "esbuild", "next", "package-json", "unknown"]),
    analyzerMode: z.enum(["server", "static", "json", "disabled", "missing"]),
    defaultSizeMode: z.enum(["stat", "parsed", "gzip", "brotli", "zstd", "missing"]),
    statsFileSignal: z.boolean(),
    sourceMapSignal: z.boolean(),
    budgetSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  bundleArtifacts: z.array(z.object({
    filePath: z.string(),
    artifactType: z.enum(["stats-json", "source-map", "asset-manifest", "bundle-report", "dist-file", "unknown"]),
    sizeBytes: z.number().int().nonnegative(),
    referencedChunks: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string().nullable()
  })),
  sizeSignals: z.array(z.object({
    signal: z.enum(["js-bundle", "css-bundle", "asset", "chunk", "vendor", "sourcemap", "gzip", "brotli", "zstd", "budget", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["analyze", "build", "stats", "visualizer", "bundle-analyzer", "source-map-explorer", "webpack-profile", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["webpack-bundle-analyzer", "rollup-plugin-visualizer", "source-map-explorer", "vite", "webpack", "next-bundle-analyzer", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MockingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  handlerFiles: z.array(z.object({
    filePath: z.string(),
    environment: z.enum(["browser", "node", "shared", "test", "unknown"]),
    handlerCount: z.number().int().nonnegative(),
    usesHttp: z.boolean(),
    usesGraphql: z.boolean(),
    usesWebSocket: z.boolean(),
    responseSignals: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  serverSetups: z.array(z.object({
    filePath: z.string(),
    setupType: z.enum(["setupWorker", "setupServer", "native", "unknown"]),
    startSignal: z.boolean(),
    lifecycleSignal: z.boolean(),
    unhandledPolicy: z.enum(["error", "warn", "bypass", "custom", "missing"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  protocolSignals: z.array(z.object({
    signal: z.enum(["rest", "graphql", "websocket", "http-response", "delay", "passthrough", "bypass", "cookies", "params", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["setupWorker", "setupServer", "listen", "start", "use", "resetHandlers", "restoreHandlers", "close", "boundary", "onUnhandledRequest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["msw", "nock", "pact", "wiremock", "fetch-mock", "axios-mock-adapter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataFetchingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  clientSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["react", "vue", "svelte", "solid", "angular", "core", "unknown"]),
    hasClient: z.boolean(),
    hasProvider: z.boolean(),
    devtoolsSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  queryUsages: z.array(z.object({
    filePath: z.string(),
    queryCount: z.number().int().nonnegative(),
    mutationCount: z.number().int().nonnegative(),
    infiniteQueryCount: z.number().int().nonnegative(),
    queryKeySignals: z.number().int().nonnegative(),
    queryFnSignals: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["staleTime", "gcTime", "retry", "enabled", "placeholderData", "initialData", "select", "suspense", "refetchOnWindowFocus", "refetchOnReconnect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataFlowSignals: z.array(z.object({
    signal: z.enum(["invalidateQueries", "prefetchQuery", "setQueryData", "getQueryData", "dehydrate", "hydrate", "persistQueryClient", "onlineManager", "focusManager", "devtools", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tanstack-react-query", "tanstack-query-core", "swr", "axios", "ky", "graphql-request", "apollo-client", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const RoutingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  routingSetups: z.array(z.object({
    filePath: z.string(),
    mode: z.enum(["framework", "data", "declarative", "file-routes", "next", "vue", "tanstack", "unknown"]),
    hasRouter: z.boolean(),
    hasProvider: z.boolean(),
    hasConfig: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  routeDefinitions: z.array(z.object({
    filePath: z.string(),
    routeCount: z.number().int().nonnegative(),
    dynamicSegmentCount: z.number().int().nonnegative(),
    nestedSignal: z.boolean(),
    indexSignal: z.boolean(),
    layoutSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["Link", "NavLink", "Navigate", "useNavigate", "useLocation", "useParams", "useSearchParams", "useMatches", "useBlocker", "useFetcher", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataRouteSignals: z.array(z.object({
    signal: z.enum(["loader", "action", "clientLoader", "clientAction", "useLoaderData", "useActionData", "useRouteError", "ErrorBoundary", "HydrateFallback", "redirect", "defer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fileRouteSignals: z.array(z.object({
    signal: z.enum(["routes-ts", "app-routes-directory", "flatRoutes", "index-route", "dynamic-segment", "nested-route", "pathless-route", "ignoredRouteFiles", "root-route", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-router", "react-router-dom", "@react-router/dev", "@react-router/fs-routes", "tanstack-router", "next", "vue-router", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StateManagementReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  storeSetups: z.array(z.object({
    filePath: z.string(),
    storeType: z.enum(["redux-toolkit", "redux", "zustand", "jotai", "mobx", "unknown"]),
    hasConfigureStore: z.boolean(),
    hasProvider: z.boolean(),
    hasTypedHooks: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  sliceDefinitions: z.array(z.object({
    filePath: z.string(),
    sliceCount: z.number().int().nonnegative(),
    reducerCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    selectorCount: z.number().int().nonnegative(),
    usesImmerStyle: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  selectorSignals: z.array(z.object({
    signal: z.enum(["useSelector", "useAppSelector", "createSelector", "slice-selectors", "RootState", "selectFromResult", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sideEffectSignals: z.array(z.object({
    signal: z.enum(["createAsyncThunk", "createListenerMiddleware", "listenerMiddleware", "thunkMiddleware", "extraReducers", "builder-callback", "rejectWithValue", "abort-signal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["createEntityAdapter", "selectId", "sortComparer", "getSelectors", "upsertMany", "normalized-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  middlewareSignals: z.array(z.object({
    signal: z.enum(["getDefaultMiddleware", "serializableCheck", "immutableCheck", "devTools", "autoBatchEnhancer", "dynamicMiddleware", "logger", "redux-thunk", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rtkQuerySignals: z.array(z.object({
    signal: z.enum(["createApi", "fetchBaseQuery", "reducerPath", "api-middleware", "tagTypes", "providesTags", "invalidatesTags", "generated-hooks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["redux-toolkit", "react-redux", "redux", "zustand", "jotai", "mobx", "valtio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FormReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  formSetups: z.array(z.object({
    filePath: z.string(),
    library: z.enum(["react-hook-form", "formik", "tanstack-form", "native", "unknown"]),
    useFormCount: z.number().int().nonnegative(),
    hasSubmitHandler: z.boolean(),
    hasDefaultValues: z.boolean(),
    hasFormProvider: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  fieldRegistrations: z.array(z.object({
    filePath: z.string(),
    registeredFieldCount: z.number().int().nonnegative(),
    controlledFieldCount: z.number().int().nonnegative(),
    fieldArrayCount: z.number().int().nonnegative(),
    nestedFieldSignals: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["required", "min", "max", "minLength", "maxLength", "pattern", "validate", "resolver", "zodResolver", "yupResolver", "schema", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["formState-errors", "ErrorMessage", "setError", "clearErrors", "trigger", "isValid", "isSubmitting", "dirtyFields", "touchedFields", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueFlowSignals: z.array(z.object({
    signal: z.enum(["watch", "useWatch", "getValues", "setValue", "reset", "resetField", "defaultValues", "values", "unregister", "shouldUnregister", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-hook-form", "hookform-resolvers", "formik", "tanstack-form", "zod", "yup", "valibot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AuthReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  authSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["authjs", "next-auth", "better-auth", "clerk", "auth0", "custom", "unknown"]),
    handlerCount: z.number().int().nonnegative(),
    hasAuthFunction: z.boolean(),
    hasRouteHandler: z.boolean(),
    hasMiddleware: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  sessionSurfaces: z.array(z.object({
    filePath: z.string(),
    clientSessionCount: z.number().int().nonnegative(),
    serverSessionCount: z.number().int().nonnegative(),
    providerBoundaryCount: z.number().int().nonnegative(),
    signInOutCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  protectionSignals: z.array(z.object({
    signal: z.enum(["middleware", "authorized-callback", "protected-route", "redirect", "role-check", "session-required", "csrf", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["oauth-provider", "credentials-provider", "email-provider", "webauthn-passkey", "adapter", "database-session", "jwt-session", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["signIn", "redirect", "session", "jwt", "authorized", "account", "profile", "events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  credentialSignals: z.array(z.object({
    signal: z.enum(["AUTH_SECRET", "NEXTAUTH_SECRET", "AUTH_URL", "NEXTAUTH_URL", "provider-client-id", "provider-client-secret", "cookie-policy", "csrf-token", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["next-auth", "@auth/core", "@auth-adapter", "better-auth", "@clerk/nextjs", "@auth0/nextjs-auth0", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AuthorizationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  authorizationSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["openfga", "casbin", "casl", "oso", "opa", "custom", "unknown"]),
    modelCount: z.number().int().nonnegative(),
    relationCount: z.number().int().nonnegative(),
    roleCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    guardCount: z.number().int().nonnegative(),
    middlewareCount: z.number().int().nonnegative(),
    ownershipCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["rbac", "abac", "rebac", "acl", "relationship-tuples", "policy-file", "subject-object-action", "resource-action", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  enforcementSignals: z.array(z.object({
    signal: z.enum(["guard", "middleware", "can-check", "authorize-call", "deny-by-default", "route-protection", "resolver-protection", "ui-ability", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["user", "role", "group", "tenant", "organization", "service-account", "owner", "anonymous", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["document", "project", "repository", "organization", "tenant", "record", "field", "collection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["least-privilege", "separation-of-duties", "audit-log", "permission-review", "policy-versioning", "migration", "decision-log", "break-glass", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["unit-test", "fixture", "table-test", "negative-test", "policy-test", "e2e-test", "type-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@openfga/sdk", "openfga", "casbin", "casl", "@casl/ability", "oso", "opa", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PaymentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  paymentSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["stripe", "paypal", "paddle", "lemonsqueezy", "custom", "unknown"]),
    serverClientCount: z.number().int().nonnegative(),
    checkoutSessionCount: z.number().int().nonnegative(),
    paymentIntentCount: z.number().int().nonnegative(),
    webhookHandlerCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  checkoutSignals: z.array(z.object({
    signal: z.enum(["checkout-session", "payment-intent", "subscription", "customer-portal", "price-id", "product-id", "currency", "quantity", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  webhookSignals: z.array(z.object({
    signal: z.enum(["webhook-route", "signature-verification", "raw-body", "event-switch", "checkout-completed", "invoice-paid", "payment-failed", "idempotency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  customerSignals: z.array(z.object({
    signal: z.enum(["customer", "subscription", "invoice", "billing-portal", "trial", "coupon", "tax", "refund", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  credentialSignals: z.array(z.object({
    signal: z.enum(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PUBLISHABLE_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "price-env", "api-version", "webhook-secret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["stripe", "@stripe/stripe-js", "@stripe/react-stripe-js", "paypal", "paddle", "lemonsqueezy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const EmailReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  emailSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["resend", "nodemailer", "sendgrid", "mailgun", "postmark", "ses", "custom", "unknown"]),
    clientSetupCount: z.number().int().nonnegative(),
    sendCallCount: z.number().int().nonnegative(),
    templateSignalCount: z.number().int().nonnegative(),
    domainSignalCount: z.number().int().nonnegative(),
    webhookSignalCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  recipientSignals: z.array(z.object({
    signal: z.enum(["from", "to", "cc", "bcc", "reply-to", "subject", "text", "html", "react", "attachments", "scheduled", "tags", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["domain-verification", "batch-send", "idempotency", "webhook-verification", "event-handling", "bounce", "complaint", "delivery", "open-tracking", "click-tracking", "unsubscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["react-email", "html-template", "text-template", "jsx-runtime", "template-id", "variables", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  credentialSignals: z.array(z.object({
    signal: z.enum(["RESEND_API_KEY", "RESEND_BASE_URL", "RESEND_USER_AGENT", "SENDGRID_API_KEY", "MAILGUN_API_KEY", "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "POSTMARK_SERVER_TOKEN", "AWS_SES", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["resend", "nodemailer", "@sendgrid/mail", "mailgun.js", "postmark", "@aws-sdk/client-ses", "@react-email/render", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const QueueReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  queueSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["bullmq", "bull", "graphile-worker", "bree", "agenda", "custom", "unknown"]),
    queueCount: z.number().int().nonnegative(),
    workerCount: z.number().int().nonnegative(),
    schedulerCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    flowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  producerSignals: z.array(z.object({
    signal: z.enum(["queue-add", "add-bulk", "job-name", "job-data", "priority", "delay", "repeat", "job-id", "parent", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workerSignals: z.array(z.object({
    signal: z.enum(["worker", "processor", "concurrency", "rate-limit", "sandbox", "stalled-check", "lock-renewal", "remove-on-complete", "remove-on-fail", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["attempts", "backoff", "failed-event", "completed-event", "queue-events", "retry", "dead-letter", "metrics", "telemetry", "dashboard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  connectionSignals: z.array(z.object({
    signal: z.enum(["REDIS_URL", "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD", "connection", "ioredis", "node-redis", "docker-compose-redis", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["bullmq", "bull", "@nestjs/bullmq", "graphile-worker", "bree", "agenda", "ioredis", "redis", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const EventStreamReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  eventStreamSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["kafka", "redpanda", "pulsar", "custom", "unknown"]),
    brokerCount: z.number().int().nonnegative(),
    topicCount: z.number().int().nonnegative(),
    producerCount: z.number().int().nonnegative(),
    consumerCount: z.number().int().nonnegative(),
    groupCount: z.number().int().nonnegative(),
    offsetCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    reliabilityCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    opsCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["apache-kafka", "redpanda", "apache-pulsar", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  brokerSignals: z.array(z.object({
    signal: z.enum(["broker", "bootstrap-server", "listener", "advertised-listener", "kraft", "zookeeper", "bookkeeper", "broker-service", "proxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  topicSignals: z.array(z.object({
    signal: z.enum(["topic", "partition", "replication-factor", "retention", "compaction", "cleanup-policy", "partitioned-topic", "tenant-namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  producerSignals: z.array(z.object({
    signal: z.enum(["kafka-producer", "pulsar-producer", "producer-config", "acks", "idempotence", "transactional-id", "batching", "compression", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  consumerSignals: z.array(z.object({
    signal: z.enum(["kafka-consumer", "pulsar-consumer", "consumer-group", "subscription", "offset-commit", "rebalance", "acknowledge", "negative-ack", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["schema-registry", "avro", "protobuf", "json-schema", "schema-evolution", "compatibility", "schema-definition", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["dead-letter-queue", "retry-topic", "poison-record", "transaction", "exactly-once", "mirror-replication", "geo-replication", "backpressure", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["sasl", "tls", "acl", "authentication", "authorization", "oauth", "scram", "certificates", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["metrics", "lag-monitoring", "quota", "rack-awareness", "admin-client", "topic-create", "reassignment", "health-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "broker-smoke-command", "producer-smoke-command", "consumer-smoke-command", "schema-smoke-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kafka-client", "kafka-streams", "kafka-connect", "redpanda", "pulsar-client", "pulsar-broker", "pulsar-functions", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SchemaRegistryReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  registrySetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["confluent", "apicurio", "buf", "kafka", "custom", "unknown"]),
    subjectCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    versionCount: z.number().int().nonnegative(),
    compatibilityCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    referenceCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    governanceCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["confluent-schema-registry", "apicurio-registry", "buf-schema-registry", "schema-registry-url", "ccompat-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaFormatSignals: z.array(z.object({
    signal: z.enum(["avro", "protobuf", "json-schema", "openapi", "asyncapi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["subject", "artifact-id", "group-id", "version", "schema-id", "content-id", "global-id", "references", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  compatibilitySignals: z.array(z.object({
    signal: z.enum(["backward", "forward", "full", "transitive", "none", "compatibility-check", "breaking-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["compatibility-rule", "validity-rule", "mode", "lint", "breaking-policy", "managed-mode", "dependency-lock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["schema-register-command", "compatibility-command", "buf-lint", "buf-breaking", "buf-generate", "buf-push", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["schema-registry-client", "kafka-avro-serializer", "kafka-protobuf-serializer", "kafka-json-schema-serializer", "apicurio-client", "buf-cli", "protoc", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataConnectorReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  connectorSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["kafka-connect", "debezium", "airbyte", "custom", "unknown"]),
    sourceCount: z.number().int().nonnegative(),
    sinkCount: z.number().int().nonnegative(),
    workerCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    offsetCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["kafka-connect", "debezium", "airbyte", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  connectorKindSignals: z.array(z.object({
    signal: z.enum(["source-connector", "sink-connector", "cdc-connector", "elt-connection", "embedded-engine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["connector-class", "tasks-max", "plugin-path", "converters", "topics", "topics-regex", "snapshot-mode", "schema-history", "database-include-list", "table-include-list", "slot-name", "publication-name", "source-definition", "destination-definition", "connection-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["offset-storage-file", "offset-storage-topic", "config-storage-topic", "status-storage-topic", "airbyte-state", "cursor", "incremental-sync", "checkpoint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["smt-transform", "predicate", "regex-router", "mask-field", "extract-field", "hoist-field", "flatten", "normalization", "dbt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["rest-api", "connector-status", "task-status", "pause-resume", "restart", "offset-reset", "dead-letter-queue", "errors-tolerance", "retry", "health-metrics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["connect-standalone", "connect-distributed", "curl-connectors", "airbyte-api", "orchestrator", "docker-compose", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kafka-connect-api", "connect-json", "debezium-connector", "debezium-embedded", "airbyte-cdk", "airbyte-api", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SemanticLayerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  semanticLayerSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["metricflow", "dbt-semantic-layer", "cube", "custom", "unknown"]),
    semanticModelCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    measureCount: z.number().int().nonnegative(),
    dimensionCount: z.number().int().nonnegative(),
    entityCount: z.number().int().nonnegative(),
    joinCount: z.number().int().nonnegative(),
    savedQueryCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    accessCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["metricflow", "dbt-semantic-layer", "cube", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["semantic-model", "cube", "view", "sql-table", "ref-model", "time-spine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metricSignals: z.array(z.object({
    signal: z.enum(["simple-metric", "ratio-metric", "derived-metric", "cumulative-metric", "filtered-metric", "measure", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dimensionSignals: z.array(z.object({
    signal: z.enum(["time-dimension", "categorical-dimension", "dimension-reference", "entity-path", "granularity", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["primary-entity", "foreign-entity", "unique-entity", "entity-relationship", "join", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["saved-query", "metricflow-query", "explain-sql", "display-plan", "sql-api", "rest-api", "graphql-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["pre-aggregation", "rollup", "refresh-key", "partition-granularity", "incremental-refresh", "cache-engine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["access-policy", "row-level-security", "member-security", "security-context", "query-rewrite", "compile-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["mf-tutorial", "validate-configs", "list-metrics", "list-dimensions", "query-command", "github-actions", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["metricflow", "dbt-metricflow", "dbt-semantic-interfaces", "cubejs-server", "cube-client", "cube", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BiDashboardReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dashboardSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["metabase", "superset", "lightdash", "custom", "unknown"]),
    dashboardCount: z.number().int().nonnegative(),
    chartCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    embeddingCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    cacheCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["metabase", "superset", "lightdash", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dashboardSignals: z.array(z.object({
    signal: z.enum(["dashboard", "card", "chart", "slice", "explore", "saved-question", "dashboard-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["sql-query", "native-query", "dataset", "semantic-model", "metric", "dimension", "join", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filterSignals: z.array(z.object({
    signal: z.enum(["parameter", "filter", "field-filter", "dashboard-filter", "date-filter", "cross-filter", "drilldown", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["role", "permission", "row-level-security", "collection-permission", "space-access", "embedding-secret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  embeddingSignals: z.array(z.object({
    signal: z.enum(["iframe", "signed-embed", "public-link", "sdk-embed", "embed-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alertSignals: z.array(z.object({
    signal: z.enum(["alert", "subscription", "pulse", "report-schedule", "slack-email", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["cache", "refresh", "ttl", "async-query", "result-cache", "precomputed", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dashboard-export", "asset-import", "sql-validation", "dbt-sync", "visual-regression", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["metabase", "apache-superset", "lightdash", "echarts", "chartjs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StreamProcessingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  streamProcessingSetups: z.array(z.object({
    filePath: z.string(),
    engine: z.enum(["flink", "beam", "spark", "custom", "unknown"]),
    jobCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    watermarkCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    checkpointCount: z.number().int().nonnegative(),
    sinkCount: z.number().int().nonnegative(),
    deploymentCount: z.number().int().nonnegative(),
    monitoringCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  engineSignals: z.array(z.object({
    signal: z.enum(["apache-flink", "apache-beam", "spark-structured-streaming", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  jobSignals: z.array(z.object({
    signal: z.enum(["stream-execution-environment", "datastream", "beam-pipeline", "pcollection", "readstream", "writestream", "streaming-query", "runner", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sourceSignals: z.array(z.object({
    signal: z.enum(["kafka-source", "file-source", "socket-source", "pubsub-source", "kinesis-source", "pulsar-source", "custom-source", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["map", "flatmap", "filter", "keyby", "par-do", "group-by-key", "aggregation", "join", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  windowSignals: z.array(z.object({
    signal: z.enum(["tumbling-window", "sliding-window", "session-window", "fixed-window", "trigger", "allowed-lateness", "late-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  watermarkSignals: z.array(z.object({
    signal: z.enum(["watermark-strategy", "with-watermark", "event-time", "processing-time", "timestamp-assigner", "idle-source", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["keyed-state", "value-state", "map-state", "state-store", "rocksdb", "timer", "ttl", "map-groups-with-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checkpointSignals: z.array(z.object({
    signal: z.enum(["checkpointing", "checkpoint-location", "savepoint", "restart-strategy", "exactly-once-mode", "checkpoint-timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sinkSignals: z.array(z.object({
    signal: z.enum(["kafka-sink", "file-sink", "jdbc-sink", "bigquery-sink", "foreach-batch", "two-phase-commit", "exactly-once-sink", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["flink-runner", "spark-runner", "cluster-submit", "kubernetes", "yarn", "operator", "jobmanager", "taskmanager", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  monitoringSignals: z.array(z.object({
    signal: z.enum(["metrics", "backpressure", "checkpoint-metrics", "lag", "streaming-query-listener", "job-status", "alert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "stream-job-smoke", "checkpoint-smoke", "window-smoke", "sink-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["flink-streaming", "flink-connector", "beam-sdk", "beam-runner", "spark-sql", "spark-streaming", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PipelineOrchestrationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pipelineOrchestrationSetups: z.array(z.object({
    filePath: z.string(),
    orchestrator: z.enum(["airflow", "dagster", "prefect", "custom", "unknown"]),
    dagCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    sensorCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    partitionCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    backfillCount: z.number().int().nonnegative(),
    executorCount: z.number().int().nonnegative(),
    deploymentCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  orchestratorSignals: z.array(z.object({
    signal: z.enum(["apache-airflow", "dagster", "prefect", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dagSignals: z.array(z.object({
    signal: z.enum(["airflow-dag", "dagster-job", "prefect-flow", "taskflow", "graph", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["airflow-operator", "airflow-task", "dagster-op", "dagster-asset", "prefect-task", "mapped-task", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["task-dependency", "task-group", "branching", "dynamic-mapping", "subflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scheduleSignals: z.array(z.object({
    signal: z.enum(["cron-schedule", "interval-schedule", "timetable", "schedule-definition", "catchup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sensorSignals: z.array(z.object({
    signal: z.enum(["airflow-sensor", "dagster-sensor", "prefect-event", "external-task", "dataset-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["dagster-asset", "airflow-dataset", "prefect-result", "materialization", "lineage", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  partitionSignals: z.array(z.object({
    signal: z.enum(["dagster-partition", "dynamic-partition", "airflow-backfill-date", "prefect-parameter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["retry-policy", "sla", "timeout", "pool-concurrency", "queue", "idempotency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executorSignals: z.array(z.object({
    signal: z.enum(["airflow-executor", "celery", "kubernetes-executor", "dagster-daemon", "prefect-worker", "work-pool", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["airflow-deployment", "dagster-definitions", "prefect-deployment", "docker", "kubernetes", "helm", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["dag-run-history", "task-logs", "asset-observability", "metrics", "alerts", "openlineage", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dag-parse-smoke", "orchestration-unit-test", "backfill-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["apache-airflow", "dagster", "prefect", "airflow-provider", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ServiceMeshReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  serviceMeshSetups: z.array(z.object({
    filePath: z.string(),
    mesh: z.enum(["istio", "linkerd", "consul", "gateway-api", "envoy", "custom", "unknown"]),
    controlPlaneCount: z.number().int().nonnegative(),
    sidecarCount: z.number().int().nonnegative(),
    gatewayCount: z.number().int().nonnegative(),
    routeCount: z.number().int().nonnegative(),
    trafficPolicyCount: z.number().int().nonnegative(),
    securityPolicyCount: z.number().int().nonnegative(),
    mtlsCount: z.number().int().nonnegative(),
    identityCount: z.number().int().nonnegative(),
    telemetryCount: z.number().int().nonnegative(),
    resilienceCount: z.number().int().nonnegative(),
    multiClusterCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  meshSignals: z.array(z.object({
    signal: z.enum(["istio", "linkerd", "consul", "gateway-api", "envoy", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlPlaneSignals: z.array(z.object({
    signal: z.enum(["istiod", "linkerd-control-plane", "consul-server", "proxy-injector", "xds", "crds", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  injectionSignals: z.array(z.object({
    signal: z.enum(["sidecar-injection", "proxy-container", "transparent-proxy", "cni", "ambient", "waypoint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trafficSignals: z.array(z.object({
    signal: z.enum(["virtual-service", "destination-rule", "gateway-api-route", "traffic-split", "service-router", "service-splitter", "service-resolver", "service-defaults", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["peer-authentication", "authorization-policy", "request-authentication", "server-authorization", "mesh-tls-authentication", "network-authentication", "intentions", "jwt-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mtlsSignals: z.array(z.object({
    signal: z.enum(["strict-mtls", "permissive-mtls", "spiffe", "identity", "ca", "certificate-rotation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resilienceSignals: z.array(z.object({
    signal: z.enum(["retry", "timeout", "circuit-breaker", "outlier-detection", "fault-injection", "rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  gatewaySignals: z.array(z.object({
    signal: z.enum(["ingress-gateway", "egress-gateway", "mesh-gateway", "terminating-gateway", "api-gateway", "gateway-class", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  telemetrySignals: z.array(z.object({
    signal: z.enum(["telemetry-api", "metrics", "tracing", "access-logs", "prometheus", "tap", "viz", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  multiclusterSignals: z.array(z.object({
    signal: z.enum(["multi-cluster", "service-entry", "east-west-gateway", "cluster-link", "sameness-group", "peering", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "mesh-lint", "proxy-config-smoke", "policy-smoke", "traffic-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["istio", "linkerd", "consul", "envoy", "gateway-api", "helm-chart", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const IngressControllerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  ingressControllerSetups: z.array(z.object({
    filePath: z.string(),
    controller: z.enum(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "nginx", "custom", "unknown"]),
    controllerCount: z.number().int().nonnegative(),
    ingressClassCount: z.number().int().nonnegative(),
    routeCount: z.number().int().nonnegative(),
    serviceExposureCount: z.number().int().nonnegative(),
    tlsCount: z.number().int().nonnegative(),
    middlewareCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    loadBalancingCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    admissionCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  controllerSignals: z.array(z.object({
    signal: z.enum(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "nginx", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ingressClassSignals: z.array(z.object({
    signal: z.enum(["ingress-class", "controller-class", "gateway-class", "default-class", "class-annotation", "parameters-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routeSignals: z.array(z.object({
    signal: z.enum(["kubernetes-ingress", "ingress-rule", "path-rule", "ingressroute", "httproute", "grpcroute", "tcproute", "tls-route", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serviceExposureSignals: z.array(z.object({
    signal: z.enum(["loadbalancer-service", "nodeport-service", "external-ip", "external-dns", "ingress-status", "load-balancer-ip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tlsSignals: z.array(z.object({
    signal: z.enum(["tls-secret", "cert-manager", "cluster-issuer", "acme", "tls-option", "tls-store", "backend-tls", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  middlewareSignals: z.array(z.object({
    signal: z.enum(["traefik-middleware", "rewrite-target", "headers", "forward-auth", "rate-limit", "cors", "modsecurity", "waf", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["backend-traffic-policy", "client-traffic-policy", "security-policy", "envoy-patch-policy", "extension-policy", "ip-allowlist", "auth-policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadBalancingSignals: z.array(z.object({
    signal: z.enum(["service-weight", "sticky-session", "health-check", "circuit-breaker", "retry", "timeout", "canary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "prometheus", "access-logs", "tracing", "dashboard", "events", "kubectl-plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  admissionSignals: z.array(z.object({
    signal: z.enum(["validating-webhook", "admission-controller", "webhook-certgen", "crd", "status-update", "lint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "helm-template", "kubeconform", "kubectl-dry-run", "ingress-lint", "route-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "helm-chart", "cert-manager", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DnsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dnsSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["external-dns", "coredns", "octodns", "route53", "cloudflare", "custom", "unknown"]),
    sourceCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    zoneCount: z.number().int().nonnegative(),
    recordCount: z.number().int().nonnegative(),
    ownershipCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    coreDnsCount: z.number().int().nonnegative(),
    automationCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["external-dns", "route53", "cloudflare", "google-cloud-dns", "azure-dns", "octodns", "coredns", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sourceSignals: z.array(z.object({
    signal: z.enum(["service", "ingress", "gateway", "dnsendpoint-crd", "endpoint-slice", "node", "file-zone", "yaml-provider", "dynamic-zone", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  zoneSignals: z.array(z.object({
    signal: z.enum(["domain-filter", "zone-id-filter", "managed-zone", "public-private-zone", "reverse-zone", "split-horizon", "soa-serial", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  recordSignals: z.array(z.object({
    signal: z.enum(["a", "aaaa", "cname", "txt", "mx", "ns", "srv", "caa", "alias", "ptr", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ownershipSignals: z.array(z.object({
    signal: z.enum(["txt-registry", "txt-owner-id", "txt-prefix-suffix", "txt-encryption", "policy-sync", "upsert-only", "dry-run", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coreDnsSignals: z.array(z.object({
    signal: z.enum(["corefile", "forward", "cache", "kubernetes-plugin", "rewrite", "template", "health", "ready", "prometheus", "reload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  automationSignals: z.array(z.object({
    signal: z.enum(["octodns-sync", "octodns-plan", "providers-config", "sources-targets", "record-validation", "processors", "ci", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "prometheus", "logs", "errors", "health", "ready", "events", "dig-smoke", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "external-dns-dry-run", "octodns-validate", "coredns-check", "dig-smoke", "artifact-upload", "provider-plan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["external-dns", "coredns", "octodns", "route53", "cloudflare", "google-cloud-dns", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CertificateReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  certificateSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["cert-manager", "step-ca", "certmagic", "acme", "custom", "unknown"]),
    resourceCount: z.number().int().nonnegative(),
    issuerCount: z.number().int().nonnegative(),
    challengeCount: z.number().int().nonnegative(),
    renewalCount: z.number().int().nonnegative(),
    secretCount: z.number().int().nonnegative(),
    keyCount: z.number().int().nonnegative(),
    trustCount: z.number().int().nonnegative(),
    revocationCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["cert-manager", "step-ca", "certmagic", "acme", "vault", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["certificate", "certificate-request", "issuer", "cluster-issuer", "order", "challenge", "csr", "secret", "ingress", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  issuerSignals: z.array(z.object({
    signal: z.enum(["acme", "ca", "self-signed", "vault", "step-ca", "lets-encrypt", "external", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  challengeSignals: z.array(z.object({
    signal: z.enum(["dns01", "http01", "tls-alpn-01", "solver", "eab", "self-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["duration", "renew-before", "revision-history", "private-key-rotation", "keystore", "status-conditions", "on-demand", "cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trustSignals: z.array(z.object({
    signal: z.enum(["root-ca", "intermediate-ca", "ca-bundle", "cainjector", "trust-manager", "bootstrap", "install-root", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  revocationSignals: z.array(z.object({
    signal: z.enum(["crl", "ocsp", "revoke", "short-lived", "passive-revocation", "must-staple", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  automationSignals: z.array(z.object({
    signal: z.enum(["cmctl", "step-ca-renew", "certmagic-manage", "storage", "issuer-config", "solver-config", "policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "prometheus", "events", "logs", "health", "webhook", "readiness", "expiration-alert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "helm-template", "kubeconform", "cmctl-check", "step-ca-smoke", "certmagic-tests", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["cert-manager", "step-ca", "certmagic", "lego", "x509", "openssl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const HelmReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  helmSetups: z.array(z.object({
    filePath: z.string(),
    chartType: z.enum(["application", "library", "unknown"]),
    chartCount: z.number().int().nonnegative(),
    valuesCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    packagingCount: z.number().int().nonnegative(),
    releaseCount: z.number().int().nonnegative(),
    provenanceCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  chartSignals: z.array(z.object({
    signal: z.enum(["chart-yaml", "values", "templates", "helpers", "library-chart", "chart-lock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["helm-template", "include", "tpl", "lookup", "required", "capabilities", "hooks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valuesSignals: z.array(z.object({
    signal: z.enum(["values-schema", "global-values", "env-values", "required-values", "default-values", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["dependencies", "repository", "condition", "alias", "helm-dependency", "chart-lock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["helm-lint", "helm-template", "dry-run", "kubeconform", "ct-lint", "ct-install", "helm-unittest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["helm-upgrade", "helm-install", "helm-rollback", "helm-test", "chart-releaser", "oci-push", "repo-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["provenance", "signing", "verify", "keyring", "digest", "oci-registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "chart-testing", "helm-lint", "helm-template", "kubeconform", "chart-releaser", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["helm", "chart-testing", "chart-releaser", "helm-docs", "helm-unittest", "kubeconform", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CacheReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  cacheSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["redis", "ioredis", "upstash-redis", "keyv", "memcached", "custom", "unknown"]),
    clientSetupCount: z.number().int().nonnegative(),
    connectCount: z.number().int().nonnegative(),
    readCount: z.number().int().nonnegative(),
    writeCount: z.number().int().nonnegative(),
    ttlCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  operationSignals: z.array(z.object({
    signal: z.enum(["get", "set", "mget", "mset", "del", "exists", "expire", "ttl", "scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["ttl", "nx", "xx", "ex", "px", "stale-while-revalidate", "invalidation", "namespace", "serialization", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  connectionSignals: z.array(z.object({
    signal: z.enum(["REDIS_URL", "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD", "url", "socket", "tls", "reconnect", "is-ready", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  advancedSignals: z.array(z.object({
    signal: z.enum(["transaction", "watch", "pubsub", "client-side-cache", "pipeline", "pool", "cluster", "sentinel", "telemetry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["redis", "@redis/client", "ioredis", "@upstash/redis", "keyv", "memcached", "lru-cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LoggingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  loggingSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["pino", "winston", "bunyan", "loglevel", "console", "custom", "unknown"]),
    loggerSetupCount: z.number().int().nonnegative(),
    levelCount: z.number().int().nonnegative(),
    callCount: z.number().int().nonnegative(),
    childLoggerCount: z.number().int().nonnegative(),
    transportCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  levelSignals: z.array(z.object({
    signal: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent", "custom-level", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["child-logger", "bindings", "request-id", "http-request", "error-object", "serializer", "mixin", "timestamp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["redact", "redact-paths", "secret-fields", "safe-stringify", "error-serializer", "stdout-stderr", "flush-on-exit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["transport", "destination", "pino-pretty", "multistream", "worker-thread", "async-logging", "file-output", "log-processor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pino", "pino-pretty", "pino-http", "winston", "bunyan", "loglevel", "@pinojs/redact", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FeatureFlagReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  featureFlagSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["openfeature", "launchdarkly", "unleash", "growthbook", "flagsmith", "custom", "unknown"]),
    providerSetupCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    evaluationCount: z.number().int().nonnegative(),
    contextCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  evaluationSignals: z.array(z.object({
    signal: z.enum(["boolean", "string", "number", "object", "details", "default-value", "variant", "flag-key", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["evaluation-context", "targeting-key", "user-attributes", "request-context", "transaction-context", "domain", "react-provider", "nest-context-factory", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["set-provider", "set-provider-and-wait", "ready-event", "error-event", "hooks", "tracking", "shutdown", "multi-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@openfeature/server-sdk", "@openfeature/web-sdk", "@openfeature/react-sdk", "@openfeature/nestjs-sdk", "launchdarkly", "unleash", "growthbook", "flagsmith", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const RateLimitReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  rateLimitSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["rate-limiter-flexible", "express-rate-limit", "fastify-rate-limit", "upstash-ratelimit", "custom", "unknown"]),
    limiterSetupCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    storeCount: z.number().int().nonnegative(),
    consumeCount: z.number().int().nonnegative(),
    headerCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  quotaSignals: z.array(z.object({
    signal: z.enum(["points", "duration", "limit", "window", "block-duration", "exec-evenly", "in-memory-block", "queue", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["ip", "user-id", "authorization-token", "api-route", "key-prefix", "get-key", "black-white-list", "skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storeSignals: z.array(z.object({
    signal: z.enum(["memory", "redis", "valkey", "mongo", "postgres", "mysql", "sqlite", "dynamodb", "memcached", "prisma", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  responseSignals: z.array(z.object({
    signal: z.enum(["ms-before-next", "remaining-points", "consumed-points", "retry-after", "x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset", "too-many-requests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resilienceSignals: z.array(z.object({
    signal: z.enum(["insurance-limiter", "store-client", "reject-if-not-ready", "atomic-increment", "penalty", "reward", "delete", "block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["rate-limiter-flexible", "express-rate-limit", "@fastify/rate-limit", "@upstash/ratelimit", "bottleneck", "limiter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ErrorTrackingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  errorTrackingSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["sentry", "rollbar", "bugsnag", "airbrake", "custom", "unknown"]),
    initCount: z.number().int().nonnegative(),
    dsnCount: z.number().int().nonnegative(),
    captureCount: z.number().int().nonnegative(),
    scopeCount: z.number().int().nonnegative(),
    integrationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  captureSignals: z.array(z.object({
    signal: z.enum(["capture-exception", "capture-message", "capture-event", "error-boundary", "react-error-handler", "unhandled-errors", "breadcrumbs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["set-user", "set-tag", "set-context", "set-extra", "with-scope", "component-stack", "release-environment", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filteringSignals: z.array(z.object({
    signal: z.enum(["before-send", "before-breadcrumb", "ignore-errors", "allow-deny-urls", "send-default-pii", "scrubbers", "sample-rate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["traces-sample-rate", "traces-sampler", "trace-propagation-targets", "browser-tracing", "profiles-sample-rate", "replay", "feedback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@sentry/browser", "@sentry/node", "@sentry/react", "@sentry/nextjs", "@sentry/vue", "rollbar", "@bugsnag/js", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AnalyticsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  analyticsSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["posthog", "segment", "amplitude", "mixpanel", "custom", "unknown"]),
    initCount: z.number().int().nonnegative(),
    captureCount: z.number().int().nonnegative(),
    identityCount: z.number().int().nonnegative(),
    pageviewCount: z.number().int().nonnegative(),
    privacyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["capture", "track", "pageview", "autocapture", "feature-interaction", "error-capture", "custom-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["identify", "alias", "group", "reset", "distinct-id", "person-properties", "group-properties", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["opt-in", "opt-out", "has-opted-in", "has-opted-out", "disable-session-recording", "before-send", "property-filter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  productSignals: z.array(z.object({
    signal: z.enum(["feature-flags", "flag-payload", "flag-bootstrap", "session-recording", "heatmaps", "surveys", "web-vitals", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["posthog-js", "posthog-js-lite", "posthog-node", "@posthog/react", "@posthog/nextjs-config", "@segment/analytics-next", "@amplitude/analytics-browser", "mixpanel-browser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const HttpClientReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  httpClientSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["got", "axios", "fetch", "ky", "ofetch", "superagent", "custom", "unknown"]),
    requestCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  requestSignals: z.array(z.object({
    signal: z.enum(["get", "post", "put-patch-delete", "json-body", "form-body", "query-params", "base-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resilienceSignals: z.array(z.object({
    signal: z.enum(["timeout", "retry-limit", "retry-methods", "retry-status-codes", "retry-after", "abort-signal", "throw-http-errors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configurationSignals: z.array(z.object({
    signal: z.enum(["prefix-url", "headers", "search-params", "response-type", "resolve-body-only", "hooks", "extend-instance", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["agent", "http2", "proxy", "cache", "cookie-jar", "decompress", "unix-socket", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["http-error", "request-error", "timeout-error", "cancel-error", "metadata", "validate-status", "catch-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["got", "axios", "ky", "ofetch", "node-fetch", "undici", "superagent", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SchemaValidationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schemaSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["zod", "yup", "ajv", "joi", "valibot", "arktype", "io-ts", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    parseCount: z.number().int().nonnegative(),
    safeParseCount: z.number().int().nonnegative(),
    refinementCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  shapeSignals: z.array(z.object({
    signal: z.enum(["object", "array", "union", "discriminated-union", "enum", "literal", "record", "optional-nullable", "strict-passthrough", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parserSignals: z.array(z.object({
    signal: z.enum(["parse", "safe-parse", "parse-async", "safe-parse-async", "decode", "validate", "assert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  typeSignals: z.array(z.object({
    signal: z.enum(["infer", "input-output", "branded", "standard-schema", "json-schema", "openapi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  refinementSignals: z.array(z.object({
    signal: z.enum(["refine", "super-refine", "transform", "preprocess", "coerce", "default-catch", "pipe-codec", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["zod-error", "issues", "format", "flatten", "treeify", "prettify", "custom-error-map", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    signal: z.enum(["env-validation", "api-validation", "form-validation", "trpc", "react-hook-form", "drizzle-zod", "json-schema-export", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["zod", "@hookform/resolvers", "drizzle-zod", "zod-to-json-schema", "ajv", "yup", "valibot", "io-ts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DateTimeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dateTimeSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["luxon", "date-fns", "dayjs", "moment", "native-date", "temporal", "custom", "unknown"]),
    dateTimeCount: z.number().int().nonnegative(),
    parseCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    zoneCount: z.number().int().nonnegative(),
    mathCount: z.number().int().nonnegative(),
    validityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  constructionSignals: z.array(z.object({
    signal: z.enum(["now", "local", "utc", "from-js-date", "from-millis-seconds", "from-object", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parsingSignals: z.array(z.object({
    signal: z.enum(["from-iso", "from-format", "from-rfc-http", "from-sql", "parse-debug", "native-parse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formattingSignals: z.array(z.object({
    signal: z.enum(["to-iso", "to-format", "to-locale-string", "to-rfc-http", "unix-timestamp", "relative-output", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  zoneSignals: z.array(z.object({
    signal: z.enum(["set-zone", "utc-local", "iana-zone", "fixed-offset", "default-zone", "keep-local-time", "dst-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  durationSignals: z.array(z.object({
    signal: z.enum(["duration", "interval", "diff", "plus-minus", "start-end-of", "relative", "conversion-accuracy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validitySignals: z.array(z.object({
    signal: z.enum(["is-valid", "invalid-reason", "throw-on-invalid", "invalid-duration", "invalid-interval", "test-clock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["luxon", "date-fns", "dayjs", "moment", "moment-timezone", "@js-temporal/polyfill", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const IdGenerationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  idGeneratorSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["nanoid", "uuid", "cuid2", "ulid", "crypto-randomuuid", "custom", "unknown"]),
    generatorCount: z.number().int().nonnegative(),
    secureRandomCount: z.number().int().nonnegative(),
    customAlphabetCount: z.number().int().nonnegative(),
    customRandomCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    usageRiskCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  generationSignals: z.array(z.object({
    signal: z.enum(["default-nanoid", "sized-nanoid", "custom-alphabet", "custom-random", "url-alphabet", "random-bytes", "cli-generation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entropySignals: z.array(z.object({
    signal: z.enum(["crypto-random-values", "node-crypto", "web-crypto", "math-random", "non-secure-import", "collision-calculator", "uniformity", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alphabetSignals: z.array(z.object({
    signal: z.enum(["url-safe", "custom-alphabet", "alphabet-size-limit", "dictionary", "prefix-suffix", "length-override", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["esm-import", "dynamic-import", "commonjs-require", "browser", "react-native-random-values", "deno-jsr", "cli", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  usageSignals: z.array(z.object({
    signal: z.enum(["model-id", "database-id", "react-key", "mock-id", "branded-type", "public-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["positive-size", "alphabet-required-with-size", "collision-tests", "uniqueness-tests", "distribution-tests", "type-tests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nanoid", "uuid", "@paralleldrive/cuid2", "ulid", "react-native-get-random-values", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ImageProcessingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  imageProcessingSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["sharp", "jimp", "imagemin", "image-js", "canvas", "custom", "unknown"]),
    pipelineCount: z.number().int().nonnegative(),
    resizeCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["file-input", "buffer-input", "stream-input", "raw-create", "animated-pages", "density", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["resize", "rotate", "extract", "composite", "trim", "effects", "colourspace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["to-file", "to-buffer", "jpeg", "png", "webp-avif", "tiff-gif", "metadata-output", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["limit-input-pixels", "fail-on", "timeout", "without-enlargement", "sequential-read", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  performanceSignals: z.array(z.object({
    signal: z.enum(["cache", "concurrency", "libvips", "stream-pipeline", "clone", "queue", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["sharp", "jimp", "imagemin", "image-js", "canvas", "squoosh", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FileUploadReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  fileUploadSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["uppy", "react-dropzone", "multer", "formidable", "busboy", "custom", "unknown"]),
    uploaderCount: z.number().int().nonnegative(),
    restrictionCount: z.number().int().nonnegative(),
    transportCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["dashboard", "drag-drop", "file-input", "dropzone", "camera-screen", "remote-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  restrictionSignals: z.array(z.object({
    signal: z.enum(["mime-types", "max-file-size", "max-number-files", "image-dimensions", "required-meta-fields", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["xhr-upload", "tus-resumable", "s3-multipart", "companion", "endpoint", "headers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["progress", "status", "cancel-retry", "complete", "error", "pause-resume", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["auth-headers", "csrf", "virus-scan", "content-validation", "storage-path", "rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["uppy", "@uppy/react", "@uppy/xhr-upload", "@uppy/tus", "react-dropzone", "multer", "formidable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const WebSocketReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  webSocketSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["ws", "socket.io", "uwebsockets", "native-websocket", "sse", "custom", "unknown"]),
    serverCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    upgradeCount: z.number().int().nonnegative(),
    messageCount: z.number().int().nonnegative(),
    heartbeatCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  connectionSignals: z.array(z.object({
    signal: z.enum(["server", "client", "upgrade", "namespace-room", "reconnect", "tls", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  messageSignals: z.array(z.object({
    signal: z.enum(["send", "message-handler", "json-parse", "binary", "broadcast", "schema-validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["open", "close", "error", "ping-pong", "reconnect", "backpressure", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["origin-check", "auth-token", "rate-limit", "payload-limit", "heartbeat-timeout", "compression", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["ws", "socket.io", "uWebSockets.js", "isomorphic-ws", "native-websocket", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const RealtimeMediaReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mediaSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["livekit", "mediasoup", "peerjs", "webrtc", "daily", "twilio", "custom", "unknown"]),
    roomCount: z.number().int().nonnegative(),
    signalingCount: z.number().int().nonnegative(),
    mediaTrackCount: z.number().int().nonnegative(),
    deviceCount: z.number().int().nonnegative(),
    publishCount: z.number().int().nonnegative(),
    subscribeCount: z.number().int().nonnegative(),
    dataChannelCount: z.number().int().nonnegative(),
    transportCount: z.number().int().nonnegative(),
    iceCount: z.number().int().nonnegative(),
    qualityCount: z.number().int().nonnegative(),
    recordingCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["livekit", "mediasoup", "peerjs", "native-webrtc", "twilio-video", "daily", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  roomSignals: z.array(z.object({
    signal: z.enum(["room", "participant", "peer", "sfu-router", "call", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deviceSignals: z.array(z.object({
    signal: z.enum(["get-user-media", "camera", "microphone", "screen-share", "device-list", "autoplay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trackSignals: z.array(z.object({
    signal: z.enum(["local-track", "remote-track", "publish-track", "subscribe-track", "media-stream", "simulcast", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["ice", "dtls", "stun-turn", "webrtc-transport", "send-transport", "recv-transport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataChannelSignals: z.array(z.object({
    signal: z.enum(["data-channel", "data-track", "peer-data-connection", "rpc", "reliable-unreliable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["adaptive-stream", "dynacast", "connection-quality", "stats", "reconnect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["token", "e2ee", "permission", "track-permission", "secure-peer-server", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["playwright", "browserstack", "media-e2e", "artifact-upload", "fuzzer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["livekit-client", "mediasoup", "mediasoup-client", "peerjs", "simple-peer", "webrtc-adapter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PdfGenerationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pdfGenerationSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["pdf-lib", "pdfkit", "react-pdf", "pdfmake", "jspdf", "custom", "unknown"]),
    documentCount: z.number().int().nonnegative(),
    pageCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  documentSignals: z.array(z.object({
    signal: z.enum(["create-document", "load-document", "copy-pages", "metadata", "attachments", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pageSignals: z.array(z.object({
    signal: z.enum(["add-page", "page-size", "draw-text", "draw-image", "draw-shapes", "coordinates", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["standard-fonts", "custom-fontkit", "embed-font", "embed-png", "embed-jpg", "colors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["get-form", "text-field", "checkbox-radio", "dropdown-option", "flatten", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["save-bytes", "save-base64", "data-uri", "write-file", "download", "stream", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["input-bytes", "encrypted-pdf", "font-embedding", "large-page-count", "metadata-policy", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pdf-lib", "pdfkit", "@react-pdf/renderer", "pdfmake", "jspdf", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SpreadsheetReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  spreadsheetSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["sheetjs", "exceljs", "papaparse", "node-csv", "csv-stringify", "custom", "unknown"]),
    workbookCount: z.number().int().nonnegative(),
    sheetCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workbookSignals: z.array(z.object({
    signal: z.enum(["workbook-create", "workbook-read", "workbook-write", "multi-sheet", "workbook-metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sheetSignals: z.array(z.object({
    signal: z.enum(["json-to-sheet", "aoa-to-sheet", "table-to-sheet", "sheet-to-json", "sheet-add-json", "range-encode-decode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["xlsx", "csv", "ods", "html", "json", "array-buffer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["read-file", "upload-buffer", "array-buffer", "html-table", "stream-input", "remote-fetch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["write-file", "download", "buffer-output", "base64-output", "stream-output", "csv-stringify", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["formula-injection", "large-workbook", "date-parsing", "encoding", "cell-type-policy", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["xlsx", "exceljs", "papaparse", "csv-parse", "csv-stringify", "node-csv", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ChartVisualizationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  chartSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["chartjs", "recharts", "echarts", "d3", "visx", "nivo", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    dataCount: z.number().int().nonnegative(),
    scaleCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  chartTypeSignals: z.array(z.object({
    signal: z.enum(["bar", "line", "pie-doughnut", "scatter-bubble", "radar-polar", "mixed", "area", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["labels", "datasets", "series", "object-data", "parsing", "stacking", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scaleSignals: z.array(z.object({
    signal: z.enum(["category", "linear", "time", "logarithmic", "radial", "multi-axis", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["tooltip", "legend", "hover", "click", "zoom-pan", "html-legend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["canvas", "svg", "responsive", "animation", "layout", "export-image", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["create", "update", "resize", "destroy", "plugin-hook", "registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["large-dataset", "decimation", "parsing-policy", "accessibility-label", "ssr-guard", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["chart.js", "recharts", "echarts", "d3", "visx", "nivo", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MarkdownCodeRenderingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  markdownCodeRenderingSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["react-markdown", "shiki", "prism", "highlightjs", "mdx", "custom", "unknown"]),
    rendererCount: z.number().int().nonnegative(),
    parserCount: z.number().int().nonnegative(),
    highlightCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    themeCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  rendererSignals: z.array(z.object({
    signal: z.enum(["react-markdown", "markdown-hooks", "components-map", "code-component", "pre-code", "mdx-provider", "custom-renderer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parserSignals: z.array(z.object({
    signal: z.enum(["remark-plugins", "remark-gfm", "remark-rehype", "rehype-plugins", "rehype-raw", "frontmatter", "mdx", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  highlightSignals: z.array(z.object({
    signal: z.enum(["shiki-code-to-html", "create-highlighter", "code-to-tokens", "prism-highlight", "highlight-element", "language-class", "token-stream", "highlightjs-highlight", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["rehype-sanitize", "transformers", "line-numbers", "copy-to-clipboard", "toolbar", "show-language", "math-katex", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["skip-html", "allowed-elements", "disallowed-elements", "url-transform", "rehype-sanitize", "raw-html-risk", "xss", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  themeSignals: z.array(z.object({
    signal: z.enum(["theme", "themes", "bundled-themes", "langs", "bundled-languages", "css-theme", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["pre-code", "aria-label", "tabindex", "keyboard", "copy-button", "screen-reader", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "testing-library", "snapshot-test", "security-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-markdown", "remark-gfm", "rehype-raw", "rehype-sanitize", "shiki", "@shikijs/transformers", "prismjs", "@mdx-js/react", "highlight.js", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const NotebookReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  notebookSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["jupyter", "marimo", "quarto", "jupytext", "custom", "unknown"]),
    cellCount: z.number().int().nonnegative(),
    codeCellCount: z.number().int().nonnegative(),
    markdownCellCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    kernelCount: z.number().int().nonnegative(),
    executionCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    interactivityCount: z.number().int().nonnegative(),
    exportCount: z.number().int().nonnegative(),
    reproducibilityCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["jupyter", "marimo", "quarto", "jupytext", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fileSignals: z.array(z.object({
    signal: z.enum(["ipynb", "py-percent", "marimo-py", "qmd", "quarto-project", "binder", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  kernelSignals: z.array(z.object({
    signal: z.enum(["kernelspec", "language-info", "jupyter-kernel", "quarto-jupyter", "python-kernel", "r-kernel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["execute-count", "nbconvert-execute", "papermill", "quarto-execute", "marimo-run", "cell-order", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["notebook", "jupyterlab", "nbconvert", "nbformat", "papermill", "jupytext", "marimo", "quarto", "ipywidgets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactivitySignals: z.array(z.object({
    signal: z.enum(["ipywidgets", "display", "plot-output", "marimo-ui", "marimo-markdown", "quarto-widget", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exportSignals: z.array(z.object({
    signal: z.enum(["html-export", "pdf-export", "nbconvert", "marimo-export", "quarto-render", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reproducibilitySignals: z.array(z.object({
    signal: z.enum(["jupytext", "binder", "freeze", "cache", "parameters", "outputs", "deterministic-cells", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "nbconvert", "papermill", "marimo-export", "quarto-render", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["notebook", "jupyterlab", "nbconvert", "nbformat", "papermill", "jupytext", "marimo", "quarto", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MapVisualizationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mapSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["maplibre", "leaflet", "deck-gl", "google-maps", "mapbox", "custom", "unknown"]),
    mapCount: z.number().int().nonnegative(),
    tileCount: z.number().int().nonnegative(),
    layerCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    markerCount: z.number().int().nonnegative(),
    geometryCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    styleCount: z.number().int().nonnegative(),
    tokenCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["maplibre", "leaflet", "deck-gl", "google-maps", "mapbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  containerSignals: z.array(z.object({
    signal: z.enum(["container", "canvas", "map-div", "webgl-context", "react-component", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tileSignals: z.array(z.object({
    signal: z.enum(["tile-url", "vector-tile", "raster-tile", "tilejson", "osm", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layerSignals: z.array(z.object({
    signal: z.enum(["geojson-layer", "marker-layer", "symbol-layer", "fill-line-layer", "deck-layer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["geojson", "coordinates", "feature-properties", "mvt", "bounds-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewportSignals: z.array(z.object({
    signal: z.enum(["center-zoom", "bounds", "deck-view-state", "pitch-bearing", "fit-bounds", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "hover-pick", "popup", "tooltip", "feature-query", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlSignals: z.array(z.object({
    signal: z.enum(["navigation", "geolocation", "layer-control", "scale", "attribution-control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  styleSignals: z.array(z.object({
    signal: z.enum(["style-json", "paint-layout", "attribution", "css", "icon-sprite", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "playwright", "visual-regression", "artifact-upload", "lint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["maplibre-gl", "leaflet", "deck.gl", "@deck.gl/core", "@deck.gl/layers", "@deck.gl/geo-layers", "react-map-gl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DiagramRenderingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  diagramSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["mermaid", "plantuml", "kroki", "markmap", "graphviz", "custom", "unknown"]),
    syntaxCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    themeCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  diagramTypeSignals: z.array(z.object({
    signal: z.enum(["flowchart", "sequence", "class", "state", "er", "gantt", "mindmap", "architecture", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["initialize", "run", "render", "parse", "svg-output", "bind-functions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  themeSignals: z.array(z.object({
    signal: z.enum(["theme", "theme-variables", "theme-css", "dark-mode", "font-family", "html-labels", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["security-level", "strict-mode", "sandbox", "sanitize", "dompurify", "external-links", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["use-max-width", "viewbox", "elk", "dagre", "tidy-tree", "responsive-svg", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["svg", "iframe", "download", "live-editor", "snapshot-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["mermaid", "plantuml", "kroki", "markmap", "graphviz", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LinkIntegrityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  linkSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["lychee", "markdown-link-check", "broken-link-checker", "linkinator", "html-proofer", "custom", "unknown"]),
    targetCount: z.number().int().nonnegative(),
    extractionCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    networkCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["markdown", "html", "restructuredtext", "website", "mail", "sitemap", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["accept-status", "exclude", "include", "scheme", "private-network", "fragments", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  networkSignals: z.array(z.object({
    signal: z.enum(["timeout", "retry", "user-agent", "headers", "github-token", "offline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "markdown-report", "junit", "summary", "dump", "cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-action", "docker", "nix", "precommit", "script", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["lychee", "markdown-link-check", "broken-link-checker", "linkinator", "html-proofer", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SeoMetadataReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  seoSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["nuxt-seo", "next-seo", "unhead", "astro-seo", "custom", "unknown"]),
    crawlCount: z.number().int().nonnegative(),
    sitemapCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    structuredDataCount: z.number().int().nonnegative(),
    socialCount: z.number().int().nonnegative(),
    aiCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  crawlSignals: z.array(z.object({
    signal: z.enum(["robots-txt", "meta-robots", "x-robots-tag", "indexable", "noindex", "crawler-rules", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sitemapSignals: z.array(z.object({
    signal: z.enum(["sitemap-xml", "sitemap-index", "route-sources", "lastmod", "hreflang", "robots-sitemap", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["title", "description", "canonical", "open-graph", "twitter-card", "favicon", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structuredDataSignals: z.array(z.object({
    signal: z.enum(["json-ld", "schema-org", "breadcrumbs", "article", "product", "faq", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  aiReadinessSignals: z.array(z.object({
    signal: z.enum(["aeo", "llms-txt", "markdown-endpoint", "ai-crawlers", "agent-readability", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nuxt-seo", "nuxt-robots", "nuxt-sitemap", "nuxt-schema-org", "nuxt-og-image", "seo-utils", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PwaReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pwaSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["vite-plugin-pwa", "workbox", "next-pwa", "nuxt-pwa", "custom", "unknown"]),
    manifestCount: z.number().int().nonnegative(),
    serviceWorkerCount: z.number().int().nonnegative(),
    cachingCount: z.number().int().nonnegative(),
    updateCount: z.number().int().nonnegative(),
    installCount: z.number().int().nonnegative(),
    runtimeCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  manifestSignals: z.array(z.object({
    signal: z.enum(["webmanifest", "icons", "theme-color", "start-url", "display", "scope", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serviceWorkerSignals: z.array(z.object({
    signal: z.enum(["register", "generate-sw", "inject-manifest", "custom-sw", "sw-scope", "self-destroying", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cachingSignals: z.array(z.object({
    signal: z.enum(["precache", "runtime-caching", "glob-patterns", "maximum-file-size", "cache-first", "network-first", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["auto-update", "prompt-update", "skip-waiting", "clients-claim", "need-refresh", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  installSignals: z.array(z.object({
    signal: z.enum(["offline-ready", "install-prompt", "beforeinstallprompt", "use-credentials", "shortcuts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vite-plugin-pwa", "workbox", "workbox-window", "next-pwa", "nuxt-pwa", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BrowserCompatibilityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  compatibilitySetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["browserslist", "autoprefixer", "babel-preset-env", "postcss-preset-env", "eslint-plugin-compat", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    coverageCount: z.number().int().nonnegative(),
    envCount: z.number().int().nonnegative(),
    updateCount: z.number().int().nonnegative(),
    featureCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["package-json", "browserslistrc", "browserslist-file", "env-config", "shareable-config", "env-var", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["defaults", "last-versions", "usage-threshold", "not-dead", "coverage", "maintained-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coverageSignals: z.array(z.object({
    signal: z.enum(["global-coverage", "regional-coverage", "custom-stats", "stats-file", "mobile-to-desktop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  featureSignals: z.array(z.object({
    signal: z.enum(["supports-feature", "es-modules", "baseline", "dead-browsers", "unreleased", "electron", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["caniuse-lite", "update-browserslist-db", "old-data-warning", "ignore-old-data", "update-action", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["browserslist", "caniuse-lite", "autoprefixer", "@babel/preset-env", "postcss-preset-env", "eslint-plugin-compat", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BrowserExtensionReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  extensionSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["wxt", "plasmo", "crxjs", "manifest", "webextension-polyfill", "custom", "unknown"]),
    manifestCount: z.number().int().nonnegative(),
    entrypointCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    hostPermissionCount: z.number().int().nonnegative(),
    messagingCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    uiSurfaceCount: z.number().int().nonnegative(),
    buildCount: z.number().int().nonnegative(),
    publishCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  manifestSignals: z.array(z.object({
    signal: z.enum(["manifest-v3", "manifest-v2", "manifest-json", "generated-manifest", "wxt-config", "plasmo-config", "crxjs-plugin", "browser-targets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entrypointSignals: z.array(z.object({
    signal: z.enum(["background", "service-worker", "content-script", "popup", "options", "side-panel", "devtools", "offscreen", "newtab", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  permissionSignals: z.array(z.object({
    signal: z.enum(["permissions", "host-permissions", "optional-permissions", "optional-host-permissions", "active-tab", "scripting", "storage", "declarative-net-request", "web-accessible-resources", "content-security-policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  messagingSignals: z.array(z.object({
    signal: z.enum(["chrome-runtime", "browser-runtime", "send-message", "runtime-connect", "tabs-message", "plasmo-messaging", "wxt-messaging", "webextension-polyfill", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["wxt-build", "plasmo-build", "vite-crx", "web-ext", "zip-artifact", "watch-dev", "hmr", "typescript", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  publishSignals: z.array(z.object({
    signal: z.enum(["chrome-web-store", "firefox-addons", "edge-addons", "plasmo-bpp", "wxt-submit", "web-ext-sign", "release-action", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["wxt", "plasmo", "@crxjs/vite-plugin", "webextension-polyfill", "@types/chrome", "chrome-types", "web-ext", "extension-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const EnvValidationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  envSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["t3-env", "envalid", "dotenvx", "dotenv", "env-var", "zod", "valibot", "arktype", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    serverCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    runtimeEnvCount: z.number().int().nonnegative(),
    prefixCount: z.number().int().nonnegative(),
    validationHookCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["create-env", "server-schema", "client-schema", "shared-schema", "standard-schema", "zod", "valibot", "arktype", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["process-env", "import-meta-env", "runtime-env", "runtime-env-strict", "experimental-runtime-env", "dotenv-file", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundarySignals: z.array(z.object({
    signal: z.enum(["client-prefix", "next-public", "nuxt-public", "vite-public", "server-only", "invalid-access-guard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["parse", "safe-parse", "on-validation-error", "skip-validation", "empty-string-as-undefined", "transform-default", "synchronous-validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  documentationSignals: z.array(z.object({
    signal: z.enum(["env-example", "required-vars-doc", "deployment-vars", "build-time-validation", "secret-warning", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@t3-oss/env-core", "@t3-oss/env-nextjs", "@t3-oss/env-nuxt", "envalid", "env-var", "dotenv", "dotenvx", "zod", "valibot", "arktype", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SecurityHeadersReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  headerSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["helmet", "express", "next-headers", "nginx", "cloudflare", "custom", "unknown"]),
    cspCount: z.number().int().nonnegative(),
    hstsCount: z.number().int().nonnegative(),
    crossOriginCount: z.number().int().nonnegative(),
    frameCount: z.number().int().nonnegative(),
    referrerCount: z.number().int().nonnegative(),
    hardeningCount: z.number().int().nonnegative(),
    disableCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  cspSignals: z.array(z.object({
    signal: z.enum(["content-security-policy", "default-src", "script-src", "style-src", "frame-ancestors", "object-src", "nonce", "report-only", "upgrade-insecure-requests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["strict-transport-security", "max-age", "include-subdomains", "preload", "https-redirect", "development-exception", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  crossOriginSignals: z.array(z.object({
    signal: z.enum(["cross-origin-embedder-policy", "cross-origin-opener-policy", "cross-origin-resource-policy", "origin-agent-cluster", "cors-boundary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  legacyHeaderSignals: z.array(z.object({
    signal: z.enum(["x-frame-options", "x-content-type-options", "referrer-policy", "x-dns-prefetch-control", "x-download-options", "x-permitted-cross-domain-policies", "x-powered-by", "x-xss-protection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  middlewareSignals: z.array(z.object({
    signal: z.enum(["helmet", "app-use", "disable-header", "standalone-middleware", "next-headers", "reverse-proxy-headers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["helmet", "express", "fastify-helmet", "koa-helmet", "next", "csp-evaluator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const GraphqlReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  graphqlSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["graphql-js", "apollo", "graphql-yoga", "urql", "relay", "graphql-codegen", "graphql-request", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    operationCount: z.number().int().nonnegative(),
    resolverCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    executionCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    codegenCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["graphql-schema", "build-schema", "sdl", "object-type", "input-type", "scalar-type", "enum-type", "directive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  operationSignals: z.array(z.object({
    signal: z.enum(["query", "mutation", "subscription", "operation-name", "variables", "fragments", "typed-document-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resolverSignals: z.array(z.object({
    signal: z.enum(["resolve", "field-resolver", "type-resolver", "root-value", "context-value", "dataloader", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["parse", "validate", "specified-rules", "custom-rules", "max-errors", "introspection-limit", "schema-validation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["graphql", "graphql-sync", "execute", "subscribe", "defer-stream", "operation-ast", "variable-values", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["graphql-client", "urql", "apollo-client", "relay", "graphql-request", "cache", "fetch-exchange", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  codegenSignals: z.array(z.object({
    signal: z.enum(["graphql-codegen", "typed-query-document-node", "generated-types", "schema-introspection", "print-schema", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CliReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  cliSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["commander", "yargs", "oclif", "cac", "meow", "clipanion", "custom", "unknown"]),
    commandCount: z.number().int().nonnegative(),
    optionCount: z.number().int().nonnegative(),
    argumentCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    parseCount: z.number().int().nonnegative(),
    helpCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["command", "subcommand", "argument", "description", "alias", "version", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  optionSignals: z.array(z.object({
    signal: z.enum(["option", "required-option", "variadic-option", "default-value", "choices", "env", "conflicts", "implies", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parseSignals: z.array(z.object({
    signal: z.enum(["parse", "parse-async", "program-name", "executable", "exit-override", "allow-unknown-option", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["action", "hook", "pre-action", "post-action", "async-action", "pass-through-options", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  helpSignals: z.array(z.object({
    signal: z.enum(["help", "usage", "help-option", "add-help-text", "show-help-after-error", "completion", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["command-error", "missing-argument", "unknown-option", "invalid-option", "exit-code", "stderr", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["commander", "yargs", "@oclif/core", "cac", "meow", "clipanion", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TerminalUiReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  terminalSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["ink", "bubbletea", "blessed", "curses", "ratatui", "custom", "unknown"]),
    componentCount: z.number().int().nonnegative(),
    screenCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    layoutCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    mouseCount: z.number().int().nonnegative(),
    rawModeCount: z.number().int().nonnegative(),
    altScreenCount: z.number().int().nonnegative(),
    resizeCount: z.number().int().nonnegative(),
    styleCount: z.number().int().nonnegative(),
    widgetCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["ink", "bubbletea", "blessed", "curses", "ratatui", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  screenSignals: z.array(z.object({
    signal: z.enum(["screen", "program", "alt-screen", "raw-mode", "tty", "terminal-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["box", "text", "list", "form", "style", "border", "table", "viewport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["keyboard", "use-input", "key-msg", "keypress", "stdin", "paste", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["focus", "focus-manager", "cursor", "selection", "blur", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mouseSignals: z.array(z.object({
    signal: z.enum(["mouse", "click", "hover", "drag", "wheel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["render", "view", "static-output", "transform", "ansi", "snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["init", "update", "exit", "resize", "tick", "batch-sequence", "suspend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["ink-testing-library", "go-test", "snapshot", "artifact-upload", "pty-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["ink", "blessed", "bubbletea", "bubbles", "lipgloss", "ratatui", "ncurses", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StateMachineReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  stateMachineSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["xstate", "robot", "zag", "javascript-state-machine", "custom", "unknown"]),
    machineCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    transitionCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    guardCount: z.number().int().nonnegative(),
    actorCount: z.number().int().nonnegative(),
    invokeCount: z.number().int().nonnegative(),
    contextCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["xstate", "robot", "zag", "javascript-state-machine", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["initial", "states", "final", "nested", "parallel", "history", "computed", "watch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transitionSignals: z.array(z.object({
    signal: z.enum(["on", "target", "always", "immediate", "transition", "after", "delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["assign", "actions", "reduce", "entry", "exit", "effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["guard", "guards", "can-guard", "cond", "choose", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actorSignals: z.array(z.object({
    signal: z.enum(["create-actor", "interpret", "invoke", "from-promise", "service", "actor-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["context", "snapshot", "matches", "computed", "watch", "input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["send", "subscribe", "event-type", "on-done", "on-error", "event-payload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "model-test", "transition-test", "artifact-upload", "storybook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["xstate", "robot3", "@zag-js/core", "@zag-js/react", "@zag-js/toggle", "javascript-state-machine", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AnimationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  animationSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["motion", "framer-motion", "react-spring", "gsap", "css", "waapi", "custom", "unknown"]),
    componentCount: z.number().int().nonnegative(),
    timelineCount: z.number().int().nonnegative(),
    keyframeCount: z.number().int().nonnegative(),
    springCount: z.number().int().nonnegative(),
    gestureCount: z.number().int().nonnegative(),
    layoutCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  librarySignals: z.array(z.object({
    signal: z.enum(["motion", "framer-motion", "react-spring", "gsap", "css", "waapi", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  declarationSignals: z.array(z.object({
    signal: z.enum(["motion-component", "animated-component", "animate-prop", "variants", "keyframes", "css-keyframes", "transition", "timeline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timingSignals: z.array(z.object({
    signal: z.enum(["duration", "delay", "ease", "spring-config", "stagger", "repeat", "yoyo", "timeline-defaults", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["while-hover", "while-tap", "drag", "scroll-trigger", "in-view", "gesture", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["layout", "layout-id", "animate-presence", "exit", "flip", "shared-layout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["reduced-motion", "prefers-reduced-motion", "disable-motion", "will-change", "compositor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["controls", "motion-value", "animation-frame", "get-animations", "ticker", "kill", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "fake-timers", "frame-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["motion", "framer-motion", "@react-spring/web", "gsap", "animejs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DragAndDropReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dragAndDropSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["dnd-kit", "react-dnd", "sortablejs", "native-html5", "custom", "unknown"]),
    providerCount: z.number().int().nonnegative(),
    draggableCount: z.number().int().nonnegative(),
    droppableCount: z.number().int().nonnegative(),
    sortableCount: z.number().int().nonnegative(),
    sensorCount: z.number().int().nonnegative(),
    feedbackCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  librarySignals: z.array(z.object({
    signal: z.enum(["dnd-kit", "react-dnd", "sortablejs", "native-html5", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["dnd-context", "dnd-provider", "backend", "sortable-create", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sensorSignals: z.array(z.object({
    signal: z.enum(["pointer-sensor", "keyboard-sensor", "touch-backend", "html5-backend", "test-backend", "activation-constraint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  draggableSignals: z.array(z.object({
    signal: z.enum(["use-draggable", "use-drag", "drag-ref", "dragstart", "draggable-attribute", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  droppableSignals: z.array(z.object({
    signal: z.enum(["use-droppable", "use-drop", "drop-ref", "drop-handler", "can-drop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sortableSignals: z.array(z.object({
    signal: z.enum(["sortable-context", "use-sortable", "array-move", "sortable-create", "on-end", "on-update", "group", "swap-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  feedbackSignals: z.array(z.object({
    signal: z.enum(["drag-overlay", "ghost-class", "chosen-class", "drag-class", "monitor", "collect", "preview", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["keyboard", "screen-reader-instructions", "aria-live", "aria-grabbed", "role", "handle", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "pointer-event", "drag-event", "test-backend", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "react-dnd", "react-dnd-html5-backend", "react-dnd-touch-backend", "react-dnd-test-backend", "sortablejs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const RichTextEditorReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  richTextEditorSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["tiptap", "prosemirror", "lexical", "contenteditable", "custom", "unknown"]),
    schemaCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    extensionCount: z.number().int().nonnegative(),
    collaborationCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["tiptap", "prosemirror", "lexical", "contenteditable", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["starter-kit", "schema", "node", "mark", "nodes", "decorator-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["editor-content", "editor-view", "contenteditable", "rich-text-plugin", "bubble-menu", "floating-menu", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  commandSignals: z.array(z.object({
    signal: z.enum(["chain", "commands", "dispatch-command", "format-text", "keymap", "input-rule", "exec-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["editor-state", "transaction", "update", "selection", "json-html", "on-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  extensionSignals: z.array(z.object({
    signal: z.enum(["extension-create", "node-create", "mark-create", "plugin", "history", "placeholder", "link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collaborationSignals: z.array(z.object({
    signal: z.enum(["collaboration", "awareness", "yjs", "provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-textbox", "aria-label", "keyboard", "placeholder", "focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "input-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@tiptap/react", "@tiptap/starter-kit", "@tiptap/core", "prosemirror-state", "prosemirror-view", "prosemirror-model", "lexical", "@lexical/react", "yjs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CommandPaletteReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  commandPaletteSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["cmdk", "algolia-autocomplete", "downshift", "custom", "unknown"]),
    inputCount: z.number().int().nonnegative(),
    resultCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["cmdk", "algolia-autocomplete", "downshift", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["command-input", "get-input-props", "placeholder", "open-on-focus", "search-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultSignals: z.array(z.object({
    signal: z.enum(["command-list", "command-item", "command-group", "get-sources", "get-items", "get-menu-props", "get-item-props", "empty-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["on-select", "selected-item", "highlighted-index", "set-query", "value", "item-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filterSignals: z.array(z.object({
    signal: z.enum(["filter", "keywords", "should-filter", "query", "state-reducer", "source-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["search", "input-value", "is-open", "on-state-change", "refresh-update", "open-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["recent-searches", "query-suggestions", "plugins", "insights", "templates", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["combobox", "listbox", "option", "aria-activedescendant", "aria-expanded", "aria-controls", "aria-autocomplete", "aria-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-down", "arrow-up", "enter", "escape", "meta-k", "ime-guard", "keyboard-handler", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["cmdk", "@algolia/autocomplete-js", "@algolia/autocomplete-core", "@algolia/autocomplete-plugin-recent-searches", "@algolia/autocomplete-plugin-query-suggestions", "downshift", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const GuidedTourReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  guidedTourSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["react-joyride", "shepherd", "driver-js", "zag-tour", "custom", "unknown"]),
    stepCount: z.number().int().nonnegative(),
    targetCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    overlayCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["react-joyride", "shepherd", "driver-js", "zag-tour", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stepSignals: z.array(z.object({
    signal: z.enum(["steps-array", "step-object", "title", "content-text", "placement", "popover", "step-type-tooltip", "step-type-dialog", "step-type-wait", "step-type-floating", "step-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["target", "attach-to", "element", "selector", "highlight", "spotlight", "resolved-target", "target-rect", "boundary-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["start", "next", "back-prev", "skip-cancel-close", "complete", "progress", "continuous", "goto", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  overlaySignals: z.array(z.object({
    signal: z.enum(["modal-overlay", "spotlight", "stage-padding", "stage-radius", "popover-class", "styles", "scroll", "backdrop", "clip-path", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["callback", "on-event", "on-next-click", "on-prev-click", "on-close-click", "before-show", "after-hook", "analytics-event", "status-change", "step-change", "steps-change", "interact-outside", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["dialog-role", "aria-label", "aria-labelledby", "aria-describedby", "aria-controls", "focus-trap", "keyboard-escape", "tab-order", "aria-modal", "aria-live", "tabindex", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["run", "step-index", "status", "lifecycle", "controlled-mode", "set-steps", "local-storage-progress", "open-tag", "closed-tag", "internal-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["tour-inactive", "running", "resolving", "scrolling", "waiting", "active", "step-route", "step-changed", "target-resolved", "target-not-found", "scroll-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  targetResolutionSignals: z.array(z.object({
    signal: z.enum(["target-function", "resolved-target", "mutation-observer", "wait-for-target", "wait-for-target-timeout", "target-cleanup", "data-tour-highlighted", "prevent-interaction-inert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["get-placement", "current-placement", "placement-side", "popper-styles", "positioner", "arrow", "arrow-tip", "anchor-rect", "spotlight-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  spotlightSignals: z.array(z.object({
    signal: z.enum(["backdrop", "spotlight", "clip-path", "target-rect", "boundary-size", "spotlight-radius", "visual-viewport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-boundary-size", "track-placement", "track-dismissable-branch", "track-interact-outside", "track-escape-keydown", "trap-focus", "wait-for-scroll-end", "cleanup-all", "cleanup-step-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["add-step", "remove-step", "update-step", "set-step", "start", "next", "prev", "dismiss", "skip", "goto", "progress-percent", "progress-text", "action-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["positioner-id", "content-id", "title-id", "description-id", "arrow-id", "backdrop-id", "content-el", "positioner-el", "backdrop-el", "sync-z-index", "raf", "computed-style", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "total-steps", "step-index", "step-api", "next-step-state", "prev-step-state", "first-step-state", "last-step-state", "add-step-api", "remove-step-api", "update-step-api", "set-steps-api", "set-step-api", "start-api", "valid-step-api", "current-step-api", "next-api", "prev-api", "progress-percent-api", "progress-text-api", "backdrop-props", "spotlight-props", "progress-text-props", "positioner-props", "arrow-props", "arrow-tip-props", "content-props", "title-props", "description-props", "close-trigger-props", "action-trigger-props", "keyboard-navigation", "data-state", "data-type", "data-placement", "data-side", "aria-modal", "aria-live", "aria-atomic", "aria-labelledby", "aria-describedby", "data-step", "action-map", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "user-event", "keyboard-test", "a11y-test", "fake-timers", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-joyride", "shepherd.js", "react-shepherd", "driver.js", "@zag-js/tour", "@zag-js/focus-trap", "@zag-js/popper", "@zag-js/dismissable", "@zag-js/interact-outside", "@zag-js/dom-query", "@zag-js/anatomy", "@zag-js/core", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataTableReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dataTableSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["tanstack-table", "ag-grid", "react-data-grid", "custom", "unknown"]),
    columnCount: z.number().int().nonnegative(),
    rowCount: z.number().int().nonnegative(),
    sortCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    paginationCount: z.number().int().nonnegative(),
    virtualizationCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    editingCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["tanstack-table", "ag-grid", "react-data-grid", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  columnSignals: z.array(z.object({
    signal: z.enum(["column-defs", "column-helper", "accessor-key", "cell-renderer", "header", "column-visibility", "column-pinning", "column-sizing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rowModelSignals: z.array(z.object({
    signal: z.enum(["core-row-model", "sorted-row-model", "filtered-row-model", "pagination-row-model", "grouped-row-model", "expanded-row-model", "row-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["sorting", "filtering", "pagination", "row-selection", "column-reorder", "row-expansion", "faceting", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["controlled-state", "on-state-change", "row-selection-state", "sorting-state", "pagination-state", "rows-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  virtualizationSignals: z.array(z.object({
    signal: z.enum(["use-virtualizer", "enable-virtualization", "virtual-rows", "viewport", "row-height", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  editingSignals: z.array(z.object({
    signal: z.enum(["editable", "cell-editor", "render-edit-cell", "on-rows-change", "value-getter", "value-formatter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["grid-role", "row-role", "columnheader-role", "gridcell-role", "aria-rowcount", "aria-colcount", "aria-rowindex", "aria-colindex", "aria-sort", "keyboard-navigation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@tanstack/react-table", "@tanstack/react-virtual", "ag-grid-react", "ag-grid-community", "react-data-grid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CalendarReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  calendarSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["fullcalendar", "react-big-calendar", "react-day-picker", "custom", "unknown"]),
    viewCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    localizationCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    dragDropCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["fullcalendar", "react-big-calendar", "react-day-picker", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewSignals: z.array(z.object({
    signal: z.enum(["initial-view", "day-grid", "time-grid", "list-view", "month-view", "week-view", "agenda-view", "number-of-months", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["events", "event-click", "date-click", "event-content", "event-class-names", "event-source", "event-accessors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["selectable", "select-callback", "on-select-slot", "on-select-event", "selected-date", "on-select-date", "selection-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["header-toolbar", "toolbar", "today-button", "prev-next", "default-date", "date-range-navigation", "caption-layout", "nav-layout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  localizationSignals: z.array(z.object({
    signal: z.enum(["time-zone", "locale", "localizer", "moment-localizer", "date-fns-localizer", "week-starts-on", "formats-messages", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["resources", "resource-accessor", "resource-id", "resource-title", "resource-time-grid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dragDropSignals: z.array(z.object({
    signal: z.enum(["interaction-plugin", "editable-events", "event-drop", "event-resize", "with-drag-and-drop", "draggable-accessor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rangeConstraintSignals: z.array(z.object({
    signal: z.enum(["valid-range", "min-max-time", "disabled-dates", "date-range", "start-end-month", "modifiers", "matcher", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["calendar-label", "grid-role", "aria-label", "keyboard-navigation", "button-labels", "focus-management", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "timezone-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@fullcalendar/react", "@fullcalendar/core", "react-big-calendar", "react-day-picker", "date-fns", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DialogReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dialogSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-dialog", "headlessui-dialog", "ariakit-dialog", "native-dialog", "custom", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    portalCount: z.number().int().nonnegative(),
    overlayCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    titleDescriptionCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-dialog", "radix-alert-dialog", "headlessui-dialog", "ariakit-dialog", "native-dialog", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "trigger", "portal", "overlay", "content", "title", "description", "close", "panel", "backdrop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open-prop", "default-open", "on-open-change", "on-close", "dialog-provider", "dialog-store", "controlled-state", "transition-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["focus-scope", "focus-trap", "initial-focus", "restore-focus", "auto-focus", "final-focus", "tab-lock", "inert-others", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dismissalSignals: z.array(z.object({
    signal: z.enum(["dismissable-layer", "outside-click", "escape-key", "close-button", "dialog-dismiss", "hide-on-escape", "hide-on-interact-outside", "on-dismiss", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  portalOverlaySignals: z.array(z.object({
    signal: z.enum(["portal", "portal-group", "force-portal-root", "remove-scroll", "scroll-lock", "backdrop", "overlay", "modal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-dialog", "role-alertdialog", "aria-modal", "aria-labelledby", "aria-describedby", "aria-label", "title-required", "description-warning", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  animationSignals: z.array(z.object({
    signal: z.enum(["transition", "transition-child", "data-state", "force-mount", "open-closed-state", "mounted-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum([
      "server-handoff",
      "nested-portals",
      "root-containers",
      "main-tree-provider",
      "inert-others",
      "stack-machine",
      "top-layer",
      "outside-click",
      "escape-close",
      "escape-blur-active-element",
      "scroll-lock",
      "disappear-close",
      "description-provider",
      "focus-trap-features",
      "focus-trap-none",
      "focus-lock",
      "focus-trap-props",
      "resolve-containers",
      "sync-refs",
      "owner-document",
      "restore-element-history",
      "restore-focus-hook",
      "initial-focus-hook",
      "initial-focus-fallback",
      "focus-lock-hook",
      "tab-direction",
      "hidden-focus-guards",
      "focus-guard-dataset",
      "focusable-hidden",
      "microtask-focus",
      "focus-in-first-last",
      "focus-next-previous-wrap",
      "recent-tab-key",
      "disposables-raf",
      "blur-focus-lock",
      "event-listener",
      "contains-containers",
      "focus-trap-object-assign",
      "restore-focus",
      "tab-lock",
      "auto-focus",
      "initial-focus",
      "force-portal-root",
      "portal-group",
      "close-provider",
      "reset-open-closed-provider",
      "open-closed-context",
      "closing-state",
      "role-validation",
      "controlled-prop-validation",
      "aria-modal-open",
      "aria-labelledby",
      "aria-describedby",
      "tab-index-minus-one",
      "panel-stop-propagation",
      "backdrop-aria-hidden",
      "title-registration",
      "transition-wrapper",
      "render-strategy-static",
      "unknown"
    ]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "role-test", "keyboard-test", "focus-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-dialog", "@radix-ui/react-alert-dialog", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PopoverTooltipReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  popoverTooltipSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-popover", "radix-tooltip", "radix-hover-card", "headless-popover", "floating-ui", "ariakit-popover", "ariakit-tooltip", "ariakit-hovercard", "custom", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    anchorCount: z.number().int().nonnegative(),
    portalCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    positionCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-popover", "radix-tooltip", "radix-hover-card", "headless-popover", "floating-ui", "ariakit-popover", "ariakit-tooltip", "ariakit-hovercard", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "provider", "trigger", "anchor", "portal", "content", "arrow", "dismiss", "heading", "description", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["use-floating", "popper", "side-offset", "align", "placement", "offset", "flip", "shift", "arrow-middleware", "auto-update", "collision-boundary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "hover", "focus", "safe-polygon", "delay-duration", "open-prop", "on-open-change", "controlled-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dismissalSignals: z.array(z.object({
    signal: z.enum(["dismissable-layer", "use-dismiss", "escape-key", "outside-click", "popover-dismiss", "hide-on-escape", "hide-on-interact-outside", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["focus-scope", "floating-focus-manager", "initial-focus", "return-focus", "modal-focus", "tab-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-tooltip", "role-dialog", "aria-describedby", "aria-labelledby", "aria-label", "aria-expanded", "aria-controls", "keyboard-navigation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  portalSignals: z.array(z.object({
    signal: z.enum(["portal", "floating-portal", "force-mount", "mounted-state", "overlay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["popover-machine", "machine-context", "demo-mode-open", "stack-machine", "action-open-close", "refocusable-close", "portalled-selector", "owner-document-focusables", "root-document", "group-context", "group-close-others", "nested-portals", "root-containers", "main-tree-provider", "close-provider", "open-closed-provider", "focus-out-close", "outside-click-close", "outside-click-refocus", "floating-provider", "floating-reference", "button-unique-identifier", "single-button-warning", "within-panel-close-button", "keyboard-toggle", "keyboard-escape-close", "space-keyup-prevent-default", "active-press", "focus-ring", "hover-state", "focus-guard-sentinels", "hidden-focus-sentinel", "tab-direction", "focus-in-panel", "microtask-focus", "backdrop-transition", "backdrop-aria-hidden", "panel-anchor", "floating-panel", "portal-owner-document", "transition-data", "disappear-close", "scroll-lock-modal", "panel-unlink-on-unmount", "panel-blur-close", "reset-open-closed-provider", "portal-enabled-visible-static", "button-width-css-var", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "hover-test", "keyboard-test", "role-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-popover", "@radix-ui/react-tooltip", "@radix-ui/react-hover-card", "@headlessui/react", "@floating-ui/react", "@floating-ui/react-dom", "@ariakit/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MenuDropdownReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  menuDropdownSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-dropdown-menu", "radix-context-menu", "radix-menubar", "radix-navigation-menu", "headless-menu", "headless-listbox", "headless-combobox", "ariakit-menu", "ariakit-select", "ariakit-combobox", "custom", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-dropdown-menu", "radix-context-menu", "radix-menubar", "radix-navigation-menu", "headless-menu", "headless-listbox", "headless-combobox", "ariakit-menu", "ariakit-select", "ariakit-combobox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "trigger-button", "portal", "content", "item", "group", "label", "separator", "checkbox-item", "radio-item", "indicator", "submenu", "arrow", "viewport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["value-prop", "on-value-change", "checked-state", "on-checked-change", "radio-group", "selected-state", "multiple-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["side", "align", "side-offset", "collision-boundary", "popper", "anchor", "viewport", "floating-panel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "context-menu", "hover", "typeahead", "roving-focus", "keyboard-navigation", "escape-key", "outside-click", "tab-close", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-menu", "role-menuitem", "role-listbox", "role-option", "aria-haspopup", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-labelledby", "aria-selected", "aria-checked", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open-prop", "default-open", "on-open-change", "disabled", "data-state", "data-highlighted", "data-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["menu-machine", "machine-context", "stack-machine", "top-layer", "outside-click-close", "button-refocus", "floating-provider", "open-closed-provider", "button-floating-reference", "button-keyboard-open", "space-keyup-prevent-default", "quick-release", "handle-toggle", "pointer-open-trigger", "active-press", "button-aria-haspopup-menu", "button-aria-controls", "button-aria-expanded", "items-anchor", "items-floating-panel", "portal-owner-document", "transition-data", "disappear-close", "scroll-lock", "inert-others", "button-movement-cancel-transition", "items-focus-on-open", "items-tree-walker-role-none", "items-role-menu", "items-open-tab-index", "items-active-descendant", "typeahead-search", "search-timeout", "enter-click-active", "restore-focus", "focus-next-prev", "focus-first-last", "escape-close", "tab-close-focus-next", "register-items", "unregister-items", "sort-items", "scroll-into-view", "text-value", "pointer-tracking", "disabled-focus-nothing", "item-role-menuitem", "aria-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "pointer-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-dropdown-menu", "@radix-ui/react-context-menu", "@radix-ui/react-menubar", "@radix-ui/react-navigation-menu", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ToastSnackbarReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  toastSnackbarSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-toast", "sonner", "react-hot-toast", "notistack", "mui-snackbar", "zag-toast", "custom", "unknown"]),
    providerCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    toastCount: z.number().int().nonnegative(),
    titleDescriptionCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    closeCount: z.number().int().nonnegative(),
    variantCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-toast", "sonner", "react-hot-toast", "notistack", "mui-snackbar", "zag-toast", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["provider", "toaster", "viewport", "root", "title", "description", "action", "close", "icon", "portal-container", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  variantSignals: z.array(z.object({
    signal: z.enum(["success", "error", "warning", "info", "loading", "promise", "custom", "rich-colors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["open-state", "duration", "auto-dismiss", "dismiss", "remove", "pause-resume", "queue-limit", "prevent-duplicate", "persist", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["swipe", "keyboard-shortcut", "escape-key", "click-away", "action-button", "close-button", "hover-pause", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-status", "aria-live", "aria-atomic", "region-label", "alt-text", "close-label", "focus-visible", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stylingSignals: z.array(z.object({
    signal: z.enum(["position", "offset", "transition", "swipe-direction", "theme", "unstyled", "class-names", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["toast-machine", "group-machine", "visible-state", "visible-persist-state", "visible-updating-state", "dismissing-state", "unmounted-state", "computed-z-index", "computed-height", "computed-frontmost", "computed-should-persist", "wait-for-duration", "wait-for-remove-delay", "wait-for-next-tick", "track-height", "mutation-observer", "queue-microtask-measure", "status-change-callback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storeSignals: z.array(z.object({
    signal: z.enum(["create-toast-store", "priority-sorting", "queue-max", "toast-create-update", "dismissed-set", "visible-toasts", "promise-unwrap", "http-response-error", "pause-resume-messages", "expand-collapse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  groupSignals: z.array(z.object({
    signal: z.enum(["subscribe-to-store", "document-visibility", "hotkey-focus-region", "dismissable-branch", "stack-overlap-states", "pointer-enter-leave", "focus-blur-region", "ignore-mouse-timer", "restore-last-focus", "region-live-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["root-props", "ghost-before-after", "title-description-props", "action-trigger", "close-trigger", "placement-style", "toast-data-attrs", "keyboard-dismiss", "group-props", "group-subscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "timer-test", "role-test", "interaction-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-toast", "sonner", "react-hot-toast", "notistack", "@mui/material", "@zag-js/toast", "@zag-js/core", "@zag-js/dom-query", "@zag-js/dismissable", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TabsAccordionReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tabsAccordionSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix", "headless-ui", "ariakit", "zag-accordion", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    panelCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-tabs", "radix-accordion", "radix-collapsible", "headless-tabs", "headless-disclosure", "ariakit-tabs", "ariakit-disclosure", "zag-accordion", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "list", "trigger", "content", "item", "header", "panel", "provider", "disclosure-button", "disclosure-panel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["controlled-value", "default-value", "selected-index", "selected-id", "open-state", "default-open", "on-change", "data-state", "force-mount", "unmount-on-hide", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["keyboard-navigation", "arrow-keys", "home-end", "tab-key", "click", "manual-activation", "automatic-activation", "roving-focus", "disabled-item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-tablist", "role-tab", "role-tabpanel", "aria-selected", "aria-controls", "aria-expanded", "aria-orientation", "aria-label", "focus-management", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["horizontal", "vertical", "activation-mode", "dir", "rtl", "collapsible", "multiple", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "value-set-event", "trigger-focus-event", "trigger-click-event", "goto-next-prev", "goto-first-last", "trigger-blur-event", "can-toggle-guard", "is-expanded-guard", "collapse-action", "expand-action", "focus-trigger-actions", "focused-value", "bindable-value", "computed-horizontal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "item-id", "item-content-id", "item-trigger-id", "root-el", "trigger-elements", "first-last-trigger", "next-prev-trigger", "data-ownedby", "data-controls", "data-state", "data-focus", "data-disabled", "data-orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focused-value-api", "value-api", "set-value-api", "item-state-api", "root-props", "item-props", "item-content-props", "item-indicator-props", "item-trigger-props", "region-role", "aria-labelledby", "aria-hidden", "aria-controls", "aria-expanded", "data-controls", "data-ownedby", "hidden-content", "trigger-focus-handler", "trigger-blur-handler", "trigger-click-handler", "trigger-keydown-handler", "arrow-key-map", "home-end-key-map", "safari-focus-fix", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["tabs-data-context", "tabs-actions-context", "tabs-controlled-info", "tabs-register-tab", "tabs-register-panel", "tabs-dom-sort", "tabs-focus-sentinel", "tabs-stable-collection", "tabs-stable-index", "tabs-iso-effect", "tabs-latest-value", "tabs-auto-activation", "tabs-manual-activation", "tabs-keyboard-map", "tabs-focus-in", "tabs-mousedown-prevent-default", "tabs-click-selection", "tabs-microtask-ready", "tabs-hidden-panel", "tabs-object-assign", "disclosure-context", "disclosure-api-context", "disclosure-panel-context", "disclosure-reducer", "disclosure-default-open", "disclosure-close-refocus", "disclosure-open-closed-provider", "disclosure-close-provider", "disclosure-button-id", "disclosure-panel-id", "disclosure-within-panel", "disclosure-space-enter-toggle", "disclosure-keyup-prevent-default", "disclosure-disabled-guard", "disclosure-button-type", "disclosure-focus-ring", "disclosure-hover-state", "disclosure-active-press", "disclosure-transition", "disclosure-reset-open-closed", "disclosure-start-transition", "disclosure-object-assign", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "user-event", "role-test", "keyboard-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-tabs", "@radix-ui/react-accordion", "@radix-ui/react-collapsible", "@headlessui/react", "@ariakit/react", "@zag-js/accordion", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CheckboxRadioSwitchReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  checkboxRadioSwitchSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix", "headless-ui", "ariakit", "custom", "unknown"]),
    checkboxCount: z.number().int().nonnegative(),
    radioCount: z.number().int().nonnegative(),
    switchCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-checkbox", "radix-radio-group", "radix-switch", "headless-checkbox", "headless-radio-group", "headless-switch", "ariakit-checkbox", "ariakit-radio", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlSignals: z.array(z.object({
    signal: z.enum(["checkbox", "radio-group", "switch", "menu-checkbox", "menu-radio", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "provider", "group", "item", "indicator", "thumb", "label", "description", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["checked", "default-checked", "on-checked-change", "on-change", "value", "default-value", "set-value", "indeterminate", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "required", "disabled", "hidden-input", "field", "value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "keyboard", "space-key", "arrow-keys", "roving-focus", "focus", "disabled-control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-checkbox", "role-radio", "role-switch", "aria-checked", "aria-label", "aria-labelledby", "aria-describedby", "focus-management", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["group-context", "label-provider", "description-provider", "label-click-focus", "provided-id", "provided-disabled", "controllable-value", "default-value-hook", "sync-refs", "group-set-switch", "disposables-next-frame", "changing-state", "toggle-onchange", "disabled-react-issue", "click-prevent-default", "space-toggle", "enter-attempt-submit", "keypress-prevent-default", "labelled-by", "described-by", "focus-ring", "hover-state", "active-press", "slot-state", "role-switch", "aria-checked", "aria-labelledby", "aria-describedby", "resolve-button-type", "tab-index-normalize", "form-fields", "hidden-checkbox-override", "form-reset", "object-assign-subcomponents", "checkbox-indeterminate", "checkbox-mixed-aria", "checkbox-form-value-on", "radio-data-context", "radio-actions-context", "radio-register-option", "radio-unregister-option", "radio-comparator", "radio-first-option", "radio-contains-checked-option", "radio-trigger-change", "radio-keydown-arrow-focus", "radio-enter-submit", "radio-space-change", "radio-group-role", "radio-hidden-field-override", "radio-option-tab-index", "radio-option-focus-after-change", "radio-label-description-providers", "radio-object-assign-subcomponents", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "user-event", "role-test", "keyboard-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-checkbox", "@radix-ui/react-radio-group", "@radix-ui/react-switch", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SliderProgressReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sliderProgressSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-slider", "radix-progress", "zag-progress", "native", "custom", "unknown"]),
    sliderCount: z.number().int().nonnegative(),
    progressCount: z.number().int().nonnegative(),
    trackCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    thumbCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-slider", "radix-progress", "zag-progress", "native-range", "native-progress", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "track", "range", "thumb", "indicator", "provider", "bubble-input", "label", "value-text", "view", "circle", "circle-track", "circle-range", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "min", "max", "step", "percentage", "indeterminate", "data-state", "data-value", "value-as-string", "set-value", "set-to-min-max", "locale-format", "translation-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer", "keyboard", "home-end", "arrow-keys", "page-keys", "disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["horizontal", "vertical", "inverted", "rtl-dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "bubble-input", "input-range", "value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-slider", "role-progressbar", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-orientation", "aria-label", "aria-live", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "value-set-event", "set-value-action", "validate-context-action", "bindable-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-indeterminate", "percent", "formatter", "is-horizontal", "progress-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  circleSignals: z.array(z.object({
    signal: z.enum(["circle-root", "circle-track", "circle-range", "dasharray", "dashoffset", "rotate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "track-id", "label-id", "circle-id", "data-max", "data-value", "data-state", "data-orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value-api", "value-as-string-api", "min-api", "max-api", "percent-api", "percent-as-string-api", "indeterminate-api", "set-value-api", "set-to-max-api", "set-to-min-api", "root-props", "label-props", "value-text-props", "track-props", "range-props", "view-props", "circle-props", "circle-track-props", "circle-range-props", "progressbar-role", "data-max", "data-value", "data-state", "data-orientation", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-label", "aria-live", "percent-css-var", "circle-css-vars", "circle-dasharray", "circle-dashoffset", "view-hidden-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "precision-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-slider", "@radix-ui/react-progress", "@zag-js/progress", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SelectComboboxReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  selectComboboxSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-select", "headlessui", "ariakit", "native", "custom", "unknown"]),
    selectCount: z.number().int().nonnegative(),
    comboboxCount: z.number().int().nonnegative(),
    listboxCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    optionsCount: z.number().int().nonnegative(),
    optionCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    portalPopoverCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-select", "headlessui-combobox", "headlessui-listbox", "headlessui-select", "ariakit-combobox", "ariakit-select", "native-select", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root-provider", "trigger-button", "input", "value-display", "options-list", "option-item", "portal-popover", "label", "indicator-check", "cancel-clear", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "on-change", "on-value-change", "multiple", "nullable", "active-option", "selected-option", "disabled-option", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["keyboard", "arrow-keys", "home-end", "enter", "escape", "pointer", "typeahead", "focus-management", "virtual-or-filtered", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-combobox", "role-listbox", "role-option", "aria-expanded", "aria-controls", "aria-selected", "aria-activedescendant", "aria-autocomplete", "aria-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "required", "native-select", "hidden-select", "value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum([
      "controllable-value",
      "default-value-hook",
      "comparator",
      "combobox-machine",
      "virtualizer",
      "virtual-configuration",
      "display-value",
      "input-value-sync",
      "composition-guard",
      "immediate-focus-open",
      "input-ref-sync",
      "input-role-combobox",
      "input-aria-expanded",
      "input-aria-controls",
      "input-aria-activedescendant",
      "input-aria-autocomplete",
      "clear-on-empty",
      "open-on-input-change",
      "escape-clear",
      "tab-select-close",
      "button-refocus-input",
      "options-tree-walker-role-none",
      "options-modal-scroll-lock",
      "portal-owner-document",
      "input-movement-cancel-transition",
      "virtual-option-positioning",
      "option-refocus-input",
      "mobile-keyboard-guard",
      "option-register-order",
      "pointer-activation-trigger",
      "default-first-option",
      "active-descendant-virtual",
      "voiceover-input-reset",
      "listbox-machine",
      "data-ref-sync",
      "slice-state",
      "stack-machine",
      "top-layer",
      "outside-click-close",
      "refocus-button",
      "label-provider",
      "form-fields",
      "open-closed-provider",
      "floating-provider",
      "quick-release",
      "active-press",
      "floating-reference",
      "handle-toggle",
      "keyboard-open",
      "attempt-submit",
      "aria-haspopup-listbox",
      "button-aria-expanded",
      "button-aria-controls",
      "options-anchor",
      "portal-enabled",
      "transition-data",
      "disappear-close",
      "scroll-lock",
      "inert-others",
      "frozen-value",
      "active-descendant",
      "multiselectable",
      "orientation",
      "open-tab-index",
      "typeahead-search",
      "search-timeout",
      "select-active-option",
      "focus-next-prev",
      "focus-first-last",
      "tab-close-focus-next",
      "register-option",
      "unregister-option",
      "scroll-into-view",
      "pointer-tracking",
      "disabled-prevent-default",
      "option-role",
      "aria-selected",
      "data-focus",
      "unknown"
    ]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-select", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ToolbarToggleReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  toolbarToggleSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-toolbar", "radix-toggle", "radix-toggle-group", "zag-toggle-group", "ariakit-toolbar", "custom", "unknown"]),
    toolbarCount: z.number().int().nonnegative(),
    toggleCount: z.number().int().nonnegative(),
    toggleGroupCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    separatorCount: z.number().int().nonnegative(),
    buttonLinkCount: z.number().int().nonnegative(),
    pressedStateCount: z.number().int().nonnegative(),
    rovingFocusCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-toolbar", "radix-toggle", "radix-toggle-group", "zag-toggle-group", "ariakit-toolbar", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["toolbar-root", "toolbar-provider", "toolbar-item", "button-link", "separator", "toggle-root", "toggle-group", "toggle-item", "input-container", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["pressed", "default-pressed", "on-pressed-change", "value", "default-value", "on-value-change", "single", "multiple", "data-state", "disabled", "deselectable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["roving-focus", "composite-focus", "focus-loop", "virtual-focus", "active-item", "focusable-item", "rtl-dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["horizontal", "vertical", "aria-orientation", "dir", "loop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-toolbar", "role-group", "role-radio", "aria-pressed", "aria-checked", "aria-label", "aria-disabled", "tabindex", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "value-set", "toggle-click", "root-mouse-down", "root-focus", "root-blur", "toggle-focus", "focus-next", "focus-prev", "focus-first", "focus-last", "shift-tab", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value-array", "controlled-value", "default-value", "on-value-change", "multiple", "deselectable", "ensure-props", "add-or-remove", "item-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rovingFocusSignals: z.array(z.object({
    signal: z.enum(["focused-id", "tabbing-backward", "click-focus", "within-toolbar", "current-loop-focus", "raf-focus", "next-prev-by-id", "first-last", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "item-id", "data-ownedby", "data-disabled", "data-orientation", "data-focus", "data-state", "role-radiogroup", "role-group", "role-radio", "aria-checked", "aria-pressed", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value-api", "set-value-api", "item-state-api", "root-props", "item-props", "root-radiogroup-role", "root-group-role", "item-radio-role", "root-tabindex", "item-tabindex", "data-disabled", "data-orientation", "data-focus", "data-ownedby", "data-state", "aria-checked", "aria-pressed", "root-mouse-down-handler", "root-focus-handler", "root-blur-handler", "item-focus-handler", "item-click-handler", "item-keydown-handler", "arrow-key-map", "home-end-key-map", "shift-tab-key-map", "safari-focus-fix", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-toolbar", "@radix-ui/react-toggle", "@radix-ui/react-toggle-group", "@zag-js/toggle-group", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/utils", "@ariakit/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ScrollAreaReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scrollAreaSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-scroll-area", "zag-scroll-area", "native-scroll", "custom", "unknown"]),
    scrollAreaCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    scrollbarCount: z.number().int().nonnegative(),
    thumbCount: z.number().int().nonnegative(),
    cornerCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    overflowCount: z.number().int().nonnegative(),
    measurementCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-scroll-area", "zag-scroll-area", "native-scroll", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "viewport", "content", "scrollbar", "thumb", "corner", "provider-context", "anatomy-parts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["type", "scroll-hide-delay", "force-mount", "overflow-x", "overflow-y", "scrollbar-hidden", "scroll-progress", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  measurementSignals: z.array(z.object({
    signal: z.enum(["resize-observer", "scroll-height", "scroll-width", "client-height", "client-width", "thumb-size", "thumb-offset", "corner-size", "ratio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["vertical", "horizontal", "dir", "rtl", "ltr", "data-orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer", "wheel", "drag", "scroll-event", "scroll-to", "scroll-to-edge", "keyboard-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-presentation", "tabindex", "aria-label", "data-overflow", "data-ownedby", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "props-ensure-id", "bindable-context", "refs", "initial-idle", "watch-hidden-state", "top-level-effects", "entry-check-hovering", "exit-clear-timeouts", "thumb-measure-event", "viewport-scroll-event", "root-pointer-events", "idle-state", "dragging-state", "scrollbar-pointerdown-event", "thumb-pointerdown-event", "thumb-pointermove-event", "pointerup-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["scrolling-x", "scrolling-y", "hovering", "dragging", "touch-modality", "at-sides", "corner-size", "thumb-size", "hidden-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  refSignals: z.array(z.object({
    signal: z.enum(["orientation-ref", "scroll-position-ref", "scroll-y-timeout", "scroll-x-timeout", "scroll-end-timeout", "start-x", "start-y", "start-scroll-top", "start-scroll-left", "programmatic-scroll", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-content-resize", "resize-observer", "track-viewport-visibility", "intersection-observer", "track-wheel-event", "add-dom-event", "track-pointer-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-touch-modality", "set-hovering", "clear-hovering", "set-programmatic-scroll", "clear-scrolling", "set-thumb-size", "set-overflow-css-vars", "set-at-sides", "scroll-to-pointer", "start-dragging", "set-dragging-scroll", "stop-dragging", "clear-timeouts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "viewport-id", "content-id", "root-el", "viewport-el", "content-el", "scrollbar-x-el", "scrollbar-y-el", "thumb-x-el", "thumb-y-el", "corner-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  utilitySignals: z.array(z.object({
    signal: z.enum(["scroll-offset", "scroll-sides", "timeout", "scroll-to", "smooth-scroll", "scroll-progress", "scroll-to-edge", "rtl-scroll", "compact-scroll-options", "request-animation-frame", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["is-at-top", "is-at-bottom", "is-at-left", "is-at-right", "has-overflow-x", "has-overflow-y", "get-scroll-progress", "scroll-to-edge", "scroll-to", "get-scrollbar-state", "root-props", "viewport-props", "content-props", "scrollbar-props", "thumb-props", "corner-props", "root-pointer-handlers", "viewport-scroll-handler", "viewport-user-interaction", "scrollbar-pointer-handlers", "thumb-pointer-handler", "data-overflow", "data-ownedby", "data-orientation", "data-scrolling", "data-hover", "data-dragging", "corner-state", "css-vars", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "scroll-event-test", "wheel-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-scroll-area", "@zag-js/scroll-area", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AvatarReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  avatarSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-avatar", "zag-avatar", "native-img", "custom", "unknown"]),
    avatarCount: z.number().int().nonnegative(),
    imageCount: z.number().int().nonnegative(),
    fallbackCount: z.number().int().nonnegative(),
    loadingStatusCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    srcCount: z.number().int().nonnegative(),
    altCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    ssrCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-avatar", "zag-avatar", "native-img", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "image", "fallback", "provider-context", "anatomy-parts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "loading", "loaded", "error", "data-state", "hidden", "delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  imageSignals: z.array(z.object({
    signal: z.enum(["src", "srcset", "alt", "referrer-policy", "crossorigin", "complete", "natural-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["load-event", "error-event", "src-change", "image-removal", "status-change", "set-loaded-error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ssrSignals: z.array(z.object({
    signal: z.enum(["hydration", "render-to-string", "use-is-hydrated", "server-render", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["alt-text", "role-img", "axe", "label", "fallback-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "loading-state", "loaded-state", "error-state", "src-change-event", "image-unmount-event", "image-loaded-event", "image-error-event", "check-image-status", "status-callback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-image-removal", "track-src-change", "observe-children", "observe-attributes", "removed-nodes", "src-srcset-watch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "image-id", "fallback-id", "root-el", "image-el", "data-scope-part", "data-state", "hidden", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["loaded", "set-src", "set-loaded", "set-error", "root-props", "image-props", "fallback-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "axe", "wait-for", "role-test", "fallback-test", "ssr-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-avatar", "@zag-js/avatar", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PinInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pinInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-otp", "zag-pin-input", "native-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-otp", "zag-pin-input", "native-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "input", "hidden-input", "label", "control", "collection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "value-as-string", "complete", "count", "focused-index", "set-value", "clear-value", "set-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["numeric", "alpha", "alphanumeric", "pattern", "sanitize", "invalid", "mask", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["paste", "before-input", "change", "backspace", "delete", "arrow-left", "arrow-right", "home", "end", "enter", "focus-blur", "auto-advance", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "auto-submit", "request-submit", "hidden-submit-input", "reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "group-role", "input-mode", "autocomplete-one-time-code", "disabled", "readonly", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "value-set-event", "value-clear-event", "input-focus-event", "input-change-event", "input-paste-event", "input-keyboard-events", "value-invalid-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["normalized-value", "value-length", "filled-value-length", "is-value-complete", "value-as-string", "focused-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["auto-focus", "has-value", "is-value-complete", "has-index", "valid-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-input-count", "focus-input", "select-input", "invoke-complete", "invoke-invalid", "dispatch-input-event", "sync-input-elements", "request-form-submit", "auto-submit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "hidden-input-id", "label-id", "control-id", "input-elements", "data-complete", "data-ownedby", "data-invalid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focus", "items", "set-value", "clear-value", "set-value-at-index", "root-props", "label-props", "hidden-input-props", "control-props", "input-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "axe", "keyboard-test", "paste-test", "form-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-one-time-password-field", "@zag-js/pin-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PaginationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  paginationSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-pagination", "tanstack-table", "native-controls", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    ellipsisCount: z.number().int().nonnegative(),
    pageStateCount: z.number().int().nonnegative(),
    pageSizeCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    linkCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-pagination", "tanstack-table", "native-controls", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "item", "ellipsis", "first-trigger", "prev-trigger", "next-trigger", "last-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["page", "default-page", "page-size", "default-page-size", "total-pages", "page-count", "row-count", "page-range", "manual-pagination", "auto-reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["set-page", "set-page-size", "first-page", "previous-page", "next-page", "last-page", "can-next-prev", "clamp", "slice", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["button-mode", "link-mode", "href", "selected", "disabled", "ellipsis", "page-options", "row-model", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-current", "data-selected", "data-disabled", "translations", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "page-bindable", "page-size-bindable", "page-size-watch", "set-page-event", "set-page-size-event", "first-page-event", "previous-page-event", "next-page-event", "last-page-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["total-pages", "page-range", "previous-page", "next-page", "valid-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["valid-page", "valid-count", "can-next-page", "can-prev-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-page", "set-page-size", "first-page", "previous-page", "next-page", "last-page", "set-page-if-needed", "clamp-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rangeSignals: z.array(z.object({
    signal: z.enum(["range-helper", "transform-helper", "transformed-range", "sibling-count", "boundary-count", "left-ellipsis", "right-ellipsis", "ellipsis-collapse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "first-trigger-id", "prev-trigger-id", "next-trigger-id", "last-trigger-id", "ellipsis-id", "item-id", "data-selected", "data-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["page", "count", "page-size", "total-pages", "pages", "previous-page", "next-page", "page-range", "slice", "set-page", "set-page-size", "first-page", "previous-page-action", "next-page-action", "last-page-action", "root-props", "item-props", "ellipsis-props", "trigger-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "disabled-test", "aria-test", "row-model-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/pagination", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@tanstack/react-table", "@tanstack/table-core", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const NumberInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  numberInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-number-input", "native-spinbutton", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    scrubberCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    boundsCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-number-input", "native-spinbutton", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "increment-trigger", "decrement-trigger", "scrubber", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "value-as-number", "formatted-value", "set-value", "clear-value", "increment", "decrement", "set-to-min-max", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundsSignals: z.array(z.object({
    signal: z.enum(["min", "max", "step", "allow-overflow", "clamp-on-blur", "at-min-max", "out-of-range", "invalid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["locale", "format-options", "parser", "formatter", "pattern", "input-mode", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-up", "arrow-down", "home", "end", "enter", "before-input", "change", "blur", "focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["spin-on-press", "mouse-wheel", "pointer", "scrubber", "pointer-lock", "virtual-cursor", "caret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-spinbutton", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext", "aria-invalid", "aria-controls", "aria-label", "data-disabled", "required-readonly", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "track-form-control", "disabled-fieldset", "value-commit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "before-spin-state", "spinning-state", "scrubbing-state", "value-set-event", "value-clear-event", "value-increment-event", "value-decrement-event", "trigger-press-events", "scrubber-events", "input-events", "spin-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["value-as-number", "formatted-value", "at-min", "at-max", "out-of-range", "value-empty", "disabled", "can-increment", "can-decrement", "value-text", "rtl", "formatter", "parser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control", "wheel-listener", "pointer-lock", "mouse-move", "virtual-cursor", "prevent-text-selection", "button-disabled", "change-delay", "spin-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["focus-input", "increment", "decrement", "set-clamped-value", "set-raw-value", "set-value", "clear-value", "set-to-max", "set-to-min", "hint", "focus-callback", "blur-callback", "invalid-callback", "commit-callback", "sync-input", "formatted-value", "cursor-point", "virtual-cursor-position", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "increment-trigger-id", "decrement-trigger-id", "scrubber-id", "cursor-id", "label-id", "input-el", "trigger-el", "scrubber-el", "cursor-el", "pressed-trigger", "mousemove-value", "data-state", "aria-spinbutton", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cursorSignals: z.array(z.object({
    signal: z.enum(["record-cursor", "restore-cursor", "next-cursor-position", "selection-range", "prefix-suffix", "fallback-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focused", "invalid", "empty", "value", "value-as-number", "set-value", "clear-value", "increment", "decrement", "set-to-max", "set-to-min", "focus", "root-props", "label-props", "control-props", "value-text-props", "input-props", "trigger-props", "scrubber-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "wheel-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/number-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@internationalized/number", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const RatingGroupReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  ratingGroupSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-rating-group", "native-radiogroup", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    hoverCount: z.number().int().nonnegative(),
    halfCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-rating-group", "native-radiogroup", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "hidden-input", "control", "item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "hovered-value", "count", "items", "set-value", "clear-value", "item-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["highlighted", "half", "checked", "allow-half", "rounding", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-over", "pointer-leave", "click", "focus-blur", "space", "arrow-left", "arrow-right", "home", "end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["radiogroup", "radio", "aria-label", "aria-checked", "aria-setsize", "aria-posinset", "aria-readonly", "disabled-readonly-required", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "hidden-input", "track-form-control", "reset", "fieldset-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "hover-state", "focus-state", "set-value-event", "clear-value-event", "group-pointer-over-event", "group-pointer-leave-event", "pointer-over-event", "click-event", "focus-blur-events", "keyboard-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["interactive", "hovering", "disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control", "fieldset-disabled", "form-reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["interactive", "hovered-value-empty", "value-empty", "radio-focused", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["clear-hovered-value", "focus-active-radio", "set-prev-value", "set-next-value", "set-min-value", "set-max-value", "set-value", "clear-value", "set-hovered-value", "round-value", "dispatch-change-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "hidden-input-id", "control-id", "item-id", "root-el", "control-el", "radio-el", "hidden-input-el", "dispatch-change-event", "aria-posinset-query", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["hovering", "value", "hovered-value", "count", "items", "item-state", "set-value", "clear-value", "root-props", "hidden-input-props", "label-props", "control-props", "item-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "aria-test", "form-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/rating-group", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ColorPickerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  colorPickerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-color-picker", "native-color-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    areaCount: z.number().int().nonnegative(),
    areaThumbCount: z.number().int().nonnegative(),
    channelSliderCount: z.number().int().nonnegative(),
    channelInputCount: z.number().int().nonnegative(),
    swatchCount: z.number().int().nonnegative(),
    eyeDropperCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-color-picker", "native-color-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "trigger", "content", "area", "area-thumb", "channel-slider", "channel-input", "swatch", "eyedropper", "format-select", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "value-as-string", "format", "alpha", "set-value", "set-channel-value", "set-format", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  channelSignals: z.array(z.object({
    signal: z.enum(["hue", "saturation", "brightness", "alpha", "hex", "rgba", "hsla", "hsba", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["open-close", "area-pointer", "channel-pointer", "keyboard", "page-keys", "home-end", "channel-input", "swatch-click", "eyedropper", "dismissable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["dialog", "slider", "2d-slider", "aria-label", "aria-valuemin-max", "aria-valuenow", "aria-valuetext", "aria-expanded", "disabled-readonly-invalid-required", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "hidden-input", "track-form-control", "reset", "fieldset-disabled", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "open-state", "dragging-state", "value-set-event", "format-set-event", "channel-input-events", "eyedropper-event", "swatch-trigger-event", "trigger-events", "area-pointer-events", "channel-slider-events", "controlled-open-close-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["disabled", "rtl", "interactive", "value-as-string", "area-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control", "track-positioning", "dismissable-element", "pointer-move", "text-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["close-on-select", "open-controlled", "restore-focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["open-eyedropper", "active-channel", "clear-active-channel", "area-color-from-point", "channel-color-from-point", "set-value", "set-format", "dispatch-change-event", "sync-inputs", "change-end-callback", "channel-color-from-input", "increment-decrement-channel", "area-channel-increment", "channel-min-max", "focus-thumbs", "initial-focus", "return-focus", "sync-format-select", "sync-value-with-format", "open-close-callback", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "hidden-input-id", "control-id", "trigger-id", "content-id", "positioner-id", "format-select-id", "area-id", "area-gradient-id", "area-thumb-id", "channel-slider-ids", "content-el", "area-thumb-el", "channel-input-els", "format-select-el", "hidden-input-el", "area-point", "slider-point", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["dragging", "open", "inline", "value", "value-as-string", "set-open", "set-value", "channel-value", "channel-value-text", "set-channel-value", "format", "set-format", "alpha", "set-alpha", "root-props", "trigger-props", "content-props", "area-props", "channel-props", "hidden-input-props", "eyedropper-props", "swatch-props", "format-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "eyedropper-test", "swatch-test", "format-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/color-picker", "@zag-js/color-utils", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/dismissable", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SplitterReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  splitterSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-splitter", "native-resize-handle", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    panelCount: z.number().int().nonnegative(),
    handleCount: z.number().int().nonnegative(),
    sizeCount: z.number().int().nonnegative(),
    collapseCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    boundsCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    registryCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-splitter", "native-resize-handle", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "panel", "resize-trigger", "indicator", "items", "layout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sizeSignals: z.array(z.object({
    signal: z.enum(["size", "default-size", "set-sizes", "reset-sizes", "get-sizes", "panel-size", "min-max", "validate-sizes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collapseSignals: z.array(z.object({
    signal: z.enum(["collapsible", "collapsed-size", "collapse-panel", "expand-panel", "is-collapsed", "is-expanded", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "keyboard-move", "enter", "home-end", "f6", "focus-blur", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["separator", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-controls", "aria-orientation", "data-orientation", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["registry", "root-resize", "global-cursor", "preserve-fixed-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "hover-temp-state", "hover-state", "focused-state", "dragging-state", "size-events", "panel-events", "root-resize-event", "pointer-events", "focus-events", "keyboard-events", "focus-cycle-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["horizontal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-resize-handles", "track-root-resize", "hover-delay", "pointer-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["resize-trigger-focused", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-size", "reset-size", "sync-size", "dragging-state", "keyboard-state", "collapse-panel", "expand-panel", "resize-panel", "pointer-value", "keyboard-value", "resize-callbacks", "collapse-or-expand", "global-cursor", "focus-next-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "resize-trigger-id", "label-id", "panel-id", "panel-els", "root-el", "resize-trigger-el", "panel-el", "resolve-trigger-id", "cursor", "global-cursor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  utilitySignals: z.array(z.object({
    signal: z.enum(["aria-values", "fuzzy-compare", "panel-layout", "panel-flex-style", "default-size", "parse-panel-size", "css-panel-size", "resolve-panel-sizes", "normalize-panels", "resize-by-delta", "validate-sizes", "preserve-fixed-size", "registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["dragging", "orientation", "panels", "items", "sizes", "set-sizes", "reset-sizes", "collapse-panel", "expand-panel", "resize-panel", "panel-size", "panel-state", "layout", "resize-trigger-state", "root-props", "panel-props", "resize-trigger-props", "resize-trigger-indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "aria-test", "collapse-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/splitter", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TagsInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tagsInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-tags-input", "native-token-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    editCount: z.number().int().nonnegative(),
    deleteCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    liveRegionCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-tags-input", "native-token-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "hidden-input", "item", "item-preview", "item-input", "item-text", "clear-trigger", "delete-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "input-value", "default-input-value", "value-as-string", "set-value", "add-value", "clear-value", "set-value-at-index", "count-at-max", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["max", "max-length", "validate", "sanitize-value", "allow-duplicates", "allow-overflow", "invalid-reason", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["type", "enter", "delimiter", "paste", "blur", "arrow-navigation", "backspace-delete", "escape", "double-click-edit", "pointer-tag", "focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["label", "aria-invalid", "aria-label", "data-highlighted", "data-disabled", "data-readonly", "data-required", "data-empty", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["hidden-input", "name", "form", "required", "disabled-fieldset", "form-reset", "dispatch-input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  liveRegionSignals: z.array(z.object({
    signal: z.enum(["live-region", "translations", "announce-add", "announce-update", "announce-delete", "announce-paste", "announce-select", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-input-state", "navigating-tag-state", "editing-tag-state", "double-click-tag-event", "pointer-tag-event", "delete-tag-event", "set-value-events", "add-insert-events", "external-blur-event", "input-key-events", "tag-input-events", "paste-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["count", "value-as-string", "sanitized-input-value", "disabled", "interactive", "at-max", "overflowing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["live-region", "form-control", "interact-outside", "auto-resize", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["input-related-target", "at-max", "highlighted-tag", "first-last-highlighted", "edited-tag-empty", "input-empty", "has-tags", "allow-overflow", "auto-focus", "blur-behavior", "add-on-paste", "tag-editable", "caret-start", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["raise-insert", "external-blur", "dispatch-change", "highlight-navigation", "delete-tag", "edited-id", "edited-tag-value", "submit-edited-tag", "set-value-at-index", "focus-edited-input", "input-value", "highlighted-id", "focus-input", "sync-inputs", "add-tag", "paste-tag", "clear-tags", "set-value", "invalid-callback", "log-announcements", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "clear-trigger-id", "hidden-input-id", "label-id", "control-id", "item-id", "item-delete-trigger-id", "item-input-id", "edit-input-id", "item-els", "tag-input-el", "root-el", "input-el", "hidden-input-el", "tag-elements", "first-last", "prev-next", "index-of-id", "input-focused", "tag-value", "hover-intent", "dispatch-input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["empty", "input-value", "value", "value-as-string", "count", "at-max", "set-value", "clear-value", "add-value", "set-value-at-index", "set-input-value", "clear-input-value", "focus", "item-state", "root-props", "label-props", "control-props", "input-props", "hidden-input-props", "item-props", "item-preview-props", "item-text-props", "item-input-props", "item-delete-trigger-props", "clear-trigger-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "paste-test", "edit-test", "delete-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/tags-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/auto-resize", "@zag-js/core", "@zag-js/dom-query", "@zag-js/interact-outside", "@zag-js/live-region", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ClipboardReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  clipboardSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-clipboard", "native-clipboard", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    copyCount: z.number().int().nonnegative(),
    statusCount: z.number().int().nonnegative(),
    timerCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    fallbackCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-clipboard", "native-clipboard", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "trigger", "indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "set-value", "sync-input", "read-only-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  copySignals: z.array(z.object({
    signal: z.enum(["copy", "input-copy", "navigator-clipboard", "exec-command", "selection-range", "fallback-node", "copy-done", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  statusSignals: z.array(z.object({
    signal: z.enum(["copied-state", "data-copied", "status-change", "timeout", "translations", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "label", "read-only", "data-readonly", "focus-select", "hidden-indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "copied-state", "value-context", "value-set-event", "copy-event", "input-copy-event", "copy-done-event", "watch-value-sync", "default-value", "timeout-default", "translation-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["timeout-effect", "raf-timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "copy-to-clipboard", "invoke-on-copy", "sync-input-element", "send-copy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "label-id", "input-el", "write-to-clipboard", "create-node", "copy-node", "copy-text", "navigator-write-text", "exec-command", "selection-range", "append-remove-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["copied", "value", "set-value", "copy", "root-props", "label-props", "control-props", "input-props", "trigger-props", "indicator-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "copy-test", "aria-test", "status-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/clipboard", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const QrCodeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  qrCodeSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-qr-code", "native-svg-qr", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    frameCount: z.number().int().nonnegative(),
    patternCount: z.number().int().nonnegative(),
    overlayCount: z.number().int().nonnegative(),
    downloadCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    encodingCount: z.number().int().nonnegative(),
    pixelCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    dataUrlCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-qr-code", "native-svg-qr", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "frame", "pattern", "overlay", "download-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "set-value", "on-value-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  encodingSignals: z.array(z.object({
    signal: z.enum(["encoding", "uqr", "encoded-size", "pixel-size", "path-data", "viewbox", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  downloadSignals: z.array(z.object({
    signal: z.enum(["get-data-url", "download-trigger", "mime-type", "quality", "file-name", "anchor-click", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-img", "aria-label", "svg", "button", "overlay-alt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "value-context", "default-value", "pixel-size-default", "computed-encoded", "memo-encoded", "encode-uqr", "value-set-event", "download-trigger-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["encoded", "encoded-size", "encoded-data", "width-height", "path-list", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "download-qr-code", "get-data-url", "anchor-create", "anchor-download", "anchor-click", "anchor-remove", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "frame-id", "frame-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value", "set-value", "get-data-url", "root-props", "frame-props", "pattern-props", "overlay-props", "download-trigger-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "download-test", "data-url-test", "svg-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/qr-code", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "proxy-memoize", "uqr", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TimerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  timerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-timer", "native-timer", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    areaCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    timeCount: z.number().int().nonnegative(),
    tickCount: z.number().int().nonnegative(),
    progressCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-timer", "native-timer", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "area", "control", "item", "item-label", "item-value", "separator", "action-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "running", "paused", "running-temp", "auto-start", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timeSignals: z.array(z.object({
    signal: z.enum(["time-parts", "formatted-time", "progress-percent", "countdown", "start-ms", "target-ms", "interval", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlSignals: z.array(z.object({
    signal: z.enum(["start", "pause", "resume", "reset", "restart", "tick", "complete", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-timer", "aria-label", "aria-atomic", "aria-hidden", "hidden-actions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["validate-props", "positive-interval", "nonnegative-start", "nonnegative-target", "countdown-config", "stopwatch-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "validate-props", "idle-state", "running-state", "running-temp-state", "paused-state", "auto-start", "restart-event", "start-event", "pause-event", "resume-event", "reset-event", "tick-event", "continue-event", "current-ms-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["time", "formatted-time", "progress-percent", "memo-progress", "clamp-value", "ms-to-time", "format-time", "to-percent", "round-to-interval", "pad-start", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["keep-ticking", "wait-next-tick", "raf-interval", "raf-timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["update-time", "reset-time", "invoke-on-tick", "invoke-on-complete", "countdown-delta", "target-clamp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-reached-target", "countdown-target-default", "countdown-target", "stopwatch-target", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "area-id", "area-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["running", "paused", "time", "formatted-time", "progress-percent", "start", "pause", "resume", "reset", "restart", "root-props", "area-props", "control-props", "item-props", "item-label-props", "item-value-props", "separator-props", "action-trigger-props", "valid-actions", "hidden-actions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parseSignals: z.array(z.object({
    signal: z.enum(["parse-string", "parse-time-segment", "time-segments", "milliseconds", "invalid-date", "is-object", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "fake-timers", "click-test", "aria-test", "progress-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/timer", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StepsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  stepsSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-steps", "native-stepper", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    navCount: z.number().int().nonnegative(),
    progressCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-steps", "native-stepper", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "list", "item", "trigger", "indicator", "separator", "content", "next-trigger", "prev-trigger", "progress", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["step", "default-step", "current", "completed", "incomplete", "first-last", "has-next-prev", "is-completed", "percent", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["step-set", "step-next", "step-prev", "step-reset", "set-step", "next-step", "prev-step", "reset-step", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["linear", "is-step-valid", "is-step-skippable", "on-step-invalid", "range-check", "count", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["tablist", "tab", "tabpanel", "aria-current", "aria-selected", "aria-controls", "aria-owns", "aria-orientation", "disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-step", "count-default", "linear-default", "orientation-default", "bindable-step", "idle-state", "entry-validate-step", "step-set-event", "step-next-event", "step-prev-event", "step-reset-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["percent", "memo-percent", "has-next-step", "has-prev-step", "completed", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["current-step-valid", "valid-step-navigation", "skippable-bypass", "valid-callback", "range-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["go-to-next-step", "go-to-prev-step", "reset-step", "set-step", "validate-step-index", "invoke-step-invalid", "step-change-callback", "step-complete-callback", "min-bound", "max-bound", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "list-id", "trigger-id", "content-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value", "count", "percent", "has-next-step", "has-prev-step", "is-completed", "is-step-valid", "is-step-skippable", "go-to-next-step", "go-to-prev-step", "reset-step", "get-item-state", "set-step", "root-props", "list-props", "item-props", "trigger-props", "content-props", "next-trigger-props", "prev-trigger-props", "progress-props", "indicator-props", "separator-props", "item-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "aria-test", "linear-test", "progress-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/steps", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CarouselReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  carouselSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-carousel", "native-carousel", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    itemGroupCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    autoplayCount: z.number().int().nonnegative(),
    snapCount: z.number().int().nonnegative(),
    scrollCount: z.number().int().nonnegative(),
    dragCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-carousel", "native-carousel", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "item-group", "item", "control", "prev-trigger", "next-trigger", "indicator-group", "indicator", "autoplay-trigger", "progress-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["page", "page-snap-points", "slides-in-view", "can-scroll-next-prev", "is-playing", "is-dragging", "loop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  snapSignals: z.array(z.object({
    signal: z.enum(["scroll-snap", "snap-points", "slides-per-page", "slides-per-move", "auto-size", "spacing", "orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["scroll-next", "scroll-prev", "scroll-to", "scroll-to-index", "indicator-click", "keyboard", "wheel", "touch", "mouse-drag", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  autoplaySignals: z.array(z.object({
    signal: z.enum(["autoplay", "play", "pause", "tick", "interval", "visibility", "autoplay-status", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["region", "carousel-roledescription", "slide-roledescription", "aria-live", "aria-label", "aria-hidden", "aria-controls", "data-current", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "ensure-slide-count", "default-page", "orientation-default", "snap-type-default", "loop-autoplay-default", "slides-per-page", "slides-per-move", "autoplay-default", "allow-mouse-drag-default", "in-view-threshold", "auto-size-default", "idle-state", "focus-state", "dragging-state", "settling-state", "user-scroll-state", "autoplay-state", "page-next-event", "page-prev-event", "page-set-event", "index-set-event", "snap-refresh-event", "page-scroll-event", "dragging-events", "autoplay-events", "viewport-events", "scroll-end-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-rtl", "is-horizontal", "can-scroll-next", "can-scroll-prev", "autoplay-interval", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-slide-mutation", "track-slide-intersections", "track-slide-resize", "track-scroll", "track-settling-scroll", "track-document-visibility", "track-pointer-move", "track-keyboard-scroll", "auto-update-slide", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["clear-scroll-end-timer", "scroll-to-page", "scroll-if-drifted", "set-closest-page", "set-next-page", "set-prev-page", "set-matching-page", "set-page", "set-snap-points", "disable-scroll-snap", "scroll-slides", "end-dragging", "focus-indicator", "invoke-drag-start", "invoke-dragging", "invoke-dragging-end", "invoke-autoplay", "invoke-autoplay-start", "invoke-autoplay-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-focused", "can-scroll-next", "can-scroll-prev", "loop-mode", "drift-threshold", "clamp-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "item-id", "item-group-id", "next-trigger-id", "prev-trigger-id", "indicator-group-id", "indicator-id", "root-el", "item-group-el", "item-el", "item-els", "indicator-el", "sync-tab-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["is-playing", "is-dragging", "page", "page-snap-points", "can-scroll-next", "can-scroll-prev", "progress", "progress-text", "scroll-to-index", "scroll-to", "scroll-next", "scroll-prev", "play", "pause", "is-in-view", "refresh", "root-props", "item-group-props", "item-props", "control-props", "prev-trigger-props", "next-trigger-props", "indicator-group-props", "indicator-props", "autoplay-trigger-props", "progress-text-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "autoplay-test", "drag-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/carousel", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/scroll-snap", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TreeViewReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  treeViewSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-tree-view", "native-tree", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    treeCount: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    checkboxCount: z.number().int().nonnegative(),
    renameCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    expansionCount: z.number().int().nonnegative(),
    loadingCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-tree-view", "native-tree", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "tree", "branch", "branch-control", "branch-trigger", "branch-content", "branch-indicator", "item", "node-checkbox", "node-rename-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["expanded-value", "selected-value", "checked-value", "focused-value", "visible-nodes", "node-state", "loading-status", "renaming-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["arrow-down", "arrow-up", "arrow-left", "arrow-right", "home", "end", "typeahead", "select-parent", "expand-parent", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["single", "multiple", "select", "deselect", "select-all", "checked-toggle", "checked-map", "shift-selection", "ctrl-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadingSignals: z.array(z.object({
    signal: z.enum(["load-children", "loading-status", "abort-controller", "load-complete", "load-error", "scroll-to-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renameSignals: z.array(z.object({
    signal: z.enum(["start-renaming", "submit-renaming", "cancel-renaming", "can-rename", "before-rename", "rename-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["tree-role", "treeitem-role", "group-role", "checkbox-role", "aria-multiselectable", "aria-selected", "aria-expanded", "aria-level", "aria-checked", "aria-busy", "aria-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-selection-mode", "default-collection", "default-typeahead", "default-expand-on-click", "default-expanded-value", "default-selected-value", "translation-defaults", "idle-state", "renaming-state", "expanded-set-event", "expanded-clear-event", "expanded-all-event", "branch-expand-event", "branch-collapse-event", "selected-set-event", "selected-all-event", "selected-clear-event", "node-select-event", "node-deselect-event", "checked-toggle-event", "checked-set-event", "checked-clear-event", "node-focus-event", "keyboard-navigation-events", "branch-node-events", "branch-toggle-click-event", "tree-typeahead-event", "node-rename-event", "rename-submit-event", "rename-cancel-event", "clear-pending-aborts-exit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["expanded-value", "selected-value", "focused-value", "loading-status", "checked-value", "renaming-value", "typeahead-state", "pending-aborts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-multiple-selection", "is-typing-ahead", "visible-nodes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["select-node", "deselect-node", "set-focused-node", "toggle-branch-node", "expand-branch", "expand-branches", "collapse-branch", "collapse-branches", "set-expanded", "clear-expanded", "set-selected", "clear-selected", "focus-tree-first-node", "focus-tree-last-node", "focus-branch-first-node", "focus-tree-next-node", "focus-tree-prev-node", "focus-branch-node", "select-all-nodes", "focus-matched-node", "toggle-node-selection", "expand-all-branches", "expand-sibling-branches", "extend-selection-to-node", "extend-selection-to-next-node", "extend-selection-to-prev-node", "extend-selection-to-first-node", "extend-selection-to-last-node", "clear-pending-aborts", "toggle-checked", "set-checked", "clear-checked", "set-renaming-value", "submit-renaming", "cancel-renaming", "sync-rename-input", "focus-rename-input", "scroll-to-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-branch-focused", "is-branch-expanded", "is-shift-key", "is-ctrl-key", "has-selected-items", "is-multiple-selection", "move-focus", "expand-on-click", "is-rename-label-valid", "skip-collapsed-branch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  asyncSignals: z.array(z.object({
    signal: z.enum(["load-children", "loading-status", "loaded-status", "pending-aborts", "abort-controller", "promise-all-settled", "load-complete-callback", "load-error-callback", "collection-replace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "node-id", "tree-id", "tree-el", "focus-node", "rename-input-id", "rename-input-el", "ownedby-data", "path-data", "value-data", "depth-data", "state-data", "loading-data", "renaming-data", "checked-data", "indeterminate-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["collection", "expanded-value", "selected-value", "checked-value", "toggle-checked", "set-checked", "clear-checked", "checked-map", "expand", "collapse", "select", "deselect", "visible-nodes", "focus", "select-parent", "expand-parent", "set-expanded-value", "set-selected-value", "start-renaming", "submit-renaming", "cancel-renaming", "root-props", "label-props", "tree-props", "node-state", "item-props", "item-text-props", "item-indicator-props", "branch-props", "branch-indicator-props", "branch-trigger-props", "branch-control-props", "branch-content-props", "branch-text-props", "branch-indent-guide-props", "node-checkbox-props", "node-rename-input-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "typeahead-test", "rename-test", "loading-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/tree-view", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CollapsibleReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  collapsibleSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-collapsible", "radix-collapsible", "native-disclosure", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    sizeCount: z.number().int().nonnegative(),
    animationCount: z.number().int().nonnegative(),
    tabbableCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-collapsible", "radix-collapsible", "native-disclosure", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "trigger", "content", "indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "closing", "visible", "disabled", "controlled-open", "default-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sizeSignals: z.array(z.object({
    signal: z.enum(["measure-size", "collapsed-height", "collapsed-width", "css-vars", "hidden", "overflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  animationSignals: z.array(z.object({
    signal: z.enum(["enter-animation", "exit-animation", "animation-end", "exit-complete", "initial-state", "cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["tabbables", "inert", "observe-children", "restore-inert", "disabled-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-expanded", "aria-controls", "data-state", "data-disabled", "button-type", "hidden", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "initial-open", "initial-closed", "open-state", "closed-state", "closing-state", "controlled-open-event", "controlled-close-event", "open-event", "close-event", "size-measure-event", "animation-end-event", "watch-open", "exit-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["size-context", "initial-context", "cleanup-ref", "styles-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-enter-animation", "track-exit-animation", "track-tabbable-elements", "computed-style", "animationend-listener", "raf", "next-tick", "tabbables", "set-inert", "observe-children", "set-style", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-initial", "clear-initial", "cleanup-node", "measure-size", "compute-size", "invoke-on-open", "invoke-on-close", "invoke-on-exit-complete", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-open-controlled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "content-id", "trigger-id", "root-el", "content-el", "trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["disabled", "visible", "open", "measure-size", "set-open", "root-props", "content-props", "trigger-props", "indicator-props", "collapsed-size", "hidden-content", "css-vars", "aria-expanded", "aria-controls", "data-state", "data-disabled", "data-has-collapsed-size", "trigger-click-handler", "button-type", "dir-prop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "aria-test", "animation-test", "size-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/collapsible", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@radix-ui/react-collapsible", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const EditableReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  editableSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-editable", "native-contenteditable", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    areaCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    previewCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-editable", "native-contenteditable", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "area", "label", "preview", "input", "edit-trigger", "submit-trigger", "cancel-trigger", "control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["edit", "preview", "editing", "empty", "value", "previous-value", "controlled-edit", "default-edit", "disabled", "read-only", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["set-value", "clear-value", "value-change", "value-commit", "value-revert", "max-length", "placeholder", "auto-resize", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["activation-focus", "activation-click", "activation-dblclick", "submit-enter", "submit-blur", "cancel-escape", "interact-outside", "final-focus", "select-on-focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-invalid", "aria-readonly", "aria-disabled", "data-focus", "data-disabled", "data-readonly", "data-invalid", "required", "form-name", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "initial-edit", "initial-preview", "edit-state", "preview-state", "controlled-edit-event", "controlled-preview-event", "edit-event", "cancel-event", "submit-event", "value-set-event", "watch-value", "watch-edit", "entry-focus-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "previous-value-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["submit-on-enter", "submit-on-blur", "is-interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-interact-outside", "focus-outside", "pointer-down-outside", "interact-outside", "exclude-triggers", "contains", "submit-on-blur-routing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["restore-focus", "clear-value", "focus-input-if-needed", "focus-input", "invoke-on-cancel", "invoke-on-submit", "invoke-on-edit", "invoke-on-preview", "toggle-editing", "sync-input-value", "set-element-value", "set-value", "set-previous-value", "revert-value", "blur-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-edit-controlled", "is-submit-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "area-id", "label-id", "preview-id", "input-id", "control-id", "submit-trigger-id", "cancel-trigger-id", "edit-trigger-id", "input-el", "preview-el", "submit-trigger-el", "cancel-trigger-el", "edit-trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["editing", "empty", "value", "value-text", "set-value", "clear-value", "edit", "cancel", "submit", "root-props", "area-props", "label-props", "input-props", "preview-props", "edit-trigger-props", "control-props", "submit-trigger-props", "cancel-trigger-props", "hidden-edit", "auto-resize", "aria-label", "aria-invalid", "aria-readonly", "aria-disabled", "form-name", "button-type", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "blur-test", "commit-test", "cancel-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/editable", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/interact-outside", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PasswordInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  passwordInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-password-input", "native-password-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    visibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    passwordManagerCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-password-input", "native-password-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "input", "visibility-trigger", "indicator", "control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "visible", "hidden", "disabled", "invalid", "read-only", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  visibilitySignals: z.array(z.object({
    signal: z.enum(["default-visible", "set-visible", "toggle-visible", "visibility-change", "trigger-click", "focus-input", "type-switch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["form-reset", "form-submit", "name", "auto-complete", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  passwordManagerSignals: z.array(z.object({
    signal: z.enum(["ignore-password-managers", "one-password", "lastpass", "bitwarden", "dashlane", "proton-pass", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-controls", "aria-expanded", "aria-invalid", "aria-hidden", "data-state", "data-disabled", "data-invalid", "data-readonly", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-visible", "default-autocomplete", "ignore-password-managers-default", "translations", "idle-state", "visibility-set-event", "trigger-click-event", "track-form-events-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["visible-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-events", "form-reset-listener", "form-submit-listener", "abort-controller", "reset-hides", "submit-hides", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-visibility", "toggle-visibility", "focus-input-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "input-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["visible", "disabled", "invalid", "focus", "set-visible", "toggle-visible", "root-props", "label-props", "input-props", "visibility-trigger-props", "indicator-props", "control-props", "type-switch", "password-manager-props", "aria-controls", "aria-expanded", "aria-label", "aria-invalid", "aria-hidden", "data-state", "data-disabled", "data-invalid", "data-readonly", "button-type", "tab-index", "left-click", "read-only-api", "required-prop", "data-required", "auto-capitalize-off", "spell-check-false", "prevent-default", "interactive-guard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "reset-test", "submit-test", "visibility-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/password-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SignaturePadReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  signaturePadSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-signature-pad", "native-canvas", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    segmentCount: z.number().int().nonnegative(),
    segmentPathCount: z.number().int().nonnegative(),
    guideCount: z.number().int().nonnegative(),
    clearTriggerCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    drawingCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-signature-pad", "native-canvas", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "segment", "segment-path", "guide", "clear-trigger", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "drawing", "empty", "disabled", "read-only", "required", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  drawingSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "current-points", "current-path", "paths", "pressure", "perfect-freehand", "stroke-options", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["svg-path", "data-url", "png", "jpeg", "svg", "quality", "clear", "draw-callback", "draw-end-callback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "hidden-input", "required", "value", "readonly", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-roledescription", "aria-disabled", "data-disabled", "data-required", "role-application", "tab-index", "label-for", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-paths", "drawing-defaults", "translations", "idle-state", "drawing-state", "pointer-down-event", "pointer-move-event", "pointer-up-event", "clear-event", "track-pointer-move-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["paths-context", "current-points-context", "current-path-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-interactive", "is-empty", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "get-relative-point", "pointer-move-send", "pointer-up-send", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["add-point", "end-stroke", "clear-points", "focus-canvas-el", "invoke-on-draw", "invoke-on-draw-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "control-id", "label-id", "hidden-input-id", "control-el", "segment-el", "hidden-input-el", "data-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["empty", "drawing", "current-path", "paths", "clear", "get-data-url", "label-props", "root-props", "control-props", "segment-props", "segment-path-props", "guide-props", "clear-trigger-props", "hidden-input-props", "left-click", "modifier-key", "pointer-capture", "role-application", "aria-roledescription", "aria-label", "aria-disabled", "tab-index", "touch-action", "user-select", "button-type", "hidden", "read-only", "name", "value", "data-disabled", "data-required", "dir-prop", "default-prevented", "clear-trigger-target-guard", "pointer-events-none", "input-type-text", "required-prop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "clear-test", "data-url-test", "hidden-input-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/signature-pad", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "perfect-freehand", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AngleSliderReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  angleSliderSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-angle-slider", "native-angle-dial", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    thumbCount: z.number().int().nonnegative(),
    valueTextCount: z.number().int().nonnegative(),
    markerGroupCount: z.number().int().nonnegative(),
    markerCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    angleMathCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-angle-slider", "native-angle-dial", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "thumb", "value-text", "marker-group", "marker", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "dragging", "disabled", "read-only", "invalid", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "value-as-degree", "default-value", "step", "min-max", "set-value", "on-value-change", "on-value-change-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "thumb-focus", "thumb-blur", "arrow-inc", "arrow-dec", "home", "end", "track-pointer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  angleMathSignals: z.array(z.object({
    signal: z.enum(["pointer-value", "angle", "display-angle", "clamp-angle", "constrain-angle", "snap-angle-to-step", "rtl-mirror", "thumb-drag-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["hidden-input", "name", "form-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-slider", "aria-label", "aria-labelledby", "aria-valuemin", "aria-valuemax", "aria-valuenow", "data-disabled", "data-invalid", "data-readonly", "tab-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "step-default", "default-value", "idle-state", "focused-state", "dragging-state", "value-set-event", "control-pointer-down-event", "doc-pointer-move-event", "doc-pointer-up-event", "thumb-focus-event", "thumb-blur-event", "arrow-key-events", "home-end-events", "track-pointer-move-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "thumb-drag-offset-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["interactive", "value-as-degree", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "pointer-move-send", "pointer-up-send", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["sync-input-element", "invoke-on-change-end", "set-pointer-value", "set-value-to-min", "set-value-to-max", "set-value", "decrement-value", "increment-value", "focus-thumb", "set-thumb-drag-offset", "clear-thumb-drag-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "thumb-id", "hidden-input-id", "control-id", "value-text-id", "label-id", "hidden-input-el", "control-el", "thumb-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value", "value-as-degree", "dragging", "set-value", "root-props", "label-props", "hidden-input-props", "control-props", "thumb-props", "value-text-props", "marker-group-props", "marker-props", "data-state", "data-value", "pointer-down", "keyboard-map", "role-presentation", "role-slider", "aria-label", "aria-labelledby", "aria-valuemin", "aria-valuemax", "aria-valuenow", "tab-index", "touch-action", "user-select", "rotate-style", "data-disabled", "data-invalid", "data-readonly", "dir-prop", "hidden-input-type", "stop-propagation", "thumb-focus-handler", "thumb-blur-handler", "prevent-default", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "form-test", "aria-test", "marker-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/angle-slider", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const CascadeSelectReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  cascadeSelectSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-cascade-select", "native-cascader", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    clearTriggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    valueTextCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    collectionCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-cascade-select", "native-cascader", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "trigger", "indicator", "clear-trigger", "positioner", "content", "list", "item", "item-text", "item-indicator", "value-text", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "open", "closed", "disabled", "read-only", "invalid", "required", "multiple", "empty", "selected", "highlighted", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collectionSignals: z.array(z.object({
    signal: z.enum(["tree-collection", "root-node", "branch-node", "leaf-node", "index-path", "value-path", "depth", "disabled-node", "parent-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "selected-items", "has-selected-items", "clear-value", "select-value", "multiple", "close-on-select", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["trigger-click", "trigger-focus", "arrow-up", "arrow-down", "arrow-left", "arrow-right", "home", "end", "enter", "pointer-enter", "pointer-leave", "grace-area", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["positioning", "placement", "popper", "dismissable", "focus-visible", "scroll-into-view", "current-placement", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["hidden-input", "name", "form", "required", "read-only", "default-value", "reset", "input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["combobox", "listbox", "treeitem", "group", "aria-controls", "aria-expanded", "aria-haspopup", "aria-activedescendant", "aria-multiselectable", "aria-disabled", "aria-level", "aria-owns", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "idle-state", "focused-state", "open-state", "controlled-open-event", "controlled-close-event", "trigger-events", "content-key-events", "item-events", "value-events", "highlight-events", "positioning-event", "track-form-control-effect", "open-effects", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "highlighted-value-context", "value-index-path-context", "highlighted-index-path-context", "highlighted-items-context", "selected-items-context", "current-placement-context", "fieldset-disabled-context", "grace-area-context", "pointer-transit-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-interactive", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control-state", "track-focus-visible", "track-dismissable-element", "compute-placement", "scroll-to-highlighted-items", "observe-activedescendant", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "clear-value", "set-highlighted-value", "clear-highlighted-value", "reposition", "select-item", "clear-item", "select-highlighted-item", "highlight-first-item", "highlight-last-item", "highlight-next-item", "highlight-previous-item", "highlight-first-child", "highlight-parent", "set-initial-focus", "focus-trigger-el", "invoke-on-open", "invoke-on-close", "toggle-visibility", "highlight-first-selected-item", "create-grace-area", "clear-grace-area", "sync-input-value", "dispatch-change-event", "scroll-content-to-top", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["restore-focus", "multiple", "loop", "is-open-controlled", "trigger-event-guards", "has-highlighted-value", "highlight-boundary", "close-on-select", "can-select-item", "can-select-highlighted-item", "navigate-child-parent", "root-level", "hover-highlight", "grace-area", "pointer-not-in-item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "control-id", "trigger-id", "indicator-id", "clear-trigger-id", "positioner-id", "content-id", "hidden-input-id", "list-id", "item-id", "root-el", "label-el", "control-el", "trigger-el", "content-el", "hidden-input-el", "list-els", "item-el", "dispatch-input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["collection", "open", "focused", "multiple", "disabled", "value", "highlighted-value", "highlighted-items", "selected-items", "has-selected-items", "empty", "value-as-string", "reposition", "focus", "set-open", "set-highlight-value", "clear-highlight-value", "set-value", "select-value", "clear-value", "get-item-state", "root-props", "label-props", "control-props", "trigger-props", "clear-trigger-props", "positioner-props", "content-props", "list-props", "indicator-props", "item-props", "item-text-props", "item-indicator-props", "value-text-props", "hidden-input-props", "combobox-role", "listbox-role", "treeitem-role", "hidden-input", "aria-hidden", "data-disabled", "data-invalid", "data-readonly", "data-focus", "data-placement", "data-placeholder-shown", "data-depth", "data-selected", "data-type", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "hover-test", "form-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/cascade-select", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AsyncListReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  asyncListSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-async-list", "tanstack-query", "custom", "unknown"]),
    loadCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    cursorCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    sortCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    abortCount: z.number().int().nonnegative(),
    sequenceCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-async-list", "tanstack-query", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "loading", "sorting", "error", "empty", "has-more", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadSignals: z.array(z.object({
    signal: z.enum(["load", "initial-items", "auto-reload", "dependencies", "reload", "load-more", "success", "error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  paginationSignals: z.array(z.object({
    signal: z.enum(["cursor", "has-more", "append", "clear-cursor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filterSignals: z.array(z.object({
    signal: z.enum(["filter-text", "initial-filter-text", "set-filter-text", "clear-filter", "filter-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sortSignals: z.array(z.object({
    signal: z.enum(["sort-descriptor", "initial-sort-descriptor", "sort-function", "sort-event", "sorting-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cancellationSignals: z.array(z.object({
    signal: z.enum(["abort-controller", "abort-event", "cancel-fetch", "cancel-sort", "stale-sequence", "signal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["on-success", "on-error", "invoke-on-success", "invoke-on-error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "required-load-prop", "idle-state", "loading-state", "sorting-state", "reload-event", "load-more-event", "sort-event", "filter-event", "success-event", "error-event", "abort-event", "load-if-needed-entry", "perform-fetch-entry", "cancel-fetch-exit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["items-context", "cursor-context", "filter-text-context", "sort-descriptor-context", "error-context", "abort-ref", "sequence-ref", "dependency-watch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["load-if-needed", "perform-fetch", "perform-sort", "set-sort-descriptor", "set-filter-text", "invoke-on-success", "invoke-on-error", "clear-items", "set-items", "set-cursor", "set-error", "clear-error", "clear-cursor", "cancel-fetch", "cancel-sort", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-cursor", "has-sort-fn", "stale-sequence", "abort-error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  asyncSignals: z.array(z.object({
    signal: z.enum(["abort-controller", "load-signal", "cursor-forwarding", "filter-forwarding", "sort-forwarding", "sequence-increment", "stale-success-guard", "stale-error-guard", "append-results", "sort-promise", "abort-error-skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["items", "cursor", "loading", "sorting", "empty", "has-more", "error", "abort", "reload", "load-more", "sort", "set-filter-text", "clear-filter", "sort-descriptor", "filter-text", "abort-event-api", "reload-event-api", "load-more-event-api", "sort-event-api", "filter-event-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "load-test", "filter-test", "sort-test", "abort-test", "pagination-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/async-list", "@zag-js/react", "@zag-js/core", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ImageCropperReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  imageCropperSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-image-cropper", "native-cropper", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    imageCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    handleCount: z.number().int().nonnegative(),
    gridCount: z.number().int().nonnegative(),
    cropCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    resizeCount: z.number().int().nonnegative(),
    panCount: z.number().int().nonnegative(),
    zoomCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-image-cropper", "native-cropper", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "viewport", "image", "selection", "handle", "grid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "dragging", "panning", "measured", "image-ready", "fixed-crop-area", "rectangle", "circle", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cropSignals: z.array(z.object({
    signal: z.enum(["crop", "initial-crop", "default-crop", "min-size", "max-size", "aspect-ratio", "crop-shape", "crop-change", "source-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["zoom", "default-zoom", "min-max-zoom", "zoom-step", "rotation", "default-rotation", "flip", "offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "pan-pointer-down", "wheel", "pinch-start", "pinch-move", "pinch-end", "resize-crop", "reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-keys", "alt-resize", "shift-step", "ctrl-step", "zoom-in", "zoom-out", "nudge", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["get-crop-data", "get-cropped-image", "canvas", "blob", "data-url", "png", "jpeg", "quality", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["group-role", "slider-role", "aria-roledescription", "aria-label", "aria-description", "aria-live", "aria-controls", "aria-busy", "aria-valuemin-max", "aria-valuenow", "aria-valuetext", "data-dragging", "data-panning", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "translations", "idle-state", "dragging-state", "panning-state", "global-events", "pointer-events", "pinch-events", "transform-events", "viewport-events", "computed-state", "watch-props", "idle-effects", "track-pointer-move-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["natural-size-context", "crop-context", "pointer-start-context", "crop-start-context", "handle-position-context", "shift-lock-ratio-context", "pinch-distance-context", "pinch-midpoint-context", "zoom-context", "rotation-context", "flip-context", "offset-context", "offset-start-context", "viewport-rect-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-measured", "is-image-ready", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "track-viewport-resize", "track-wheel-event", "track-touch-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["check-image-status", "set-natural-size", "set-default-crop", "set-pointer-start", "set-offset-start", "set-crop-start", "update-crop", "update-pan-offset", "set-handle-position", "set-rotation", "set-flip", "resize-crop", "clear-pointer-start", "clear-crop-start", "clear-handle-position", "clear-offset-start", "clear-shift-ratio", "update-zoom", "set-pinch-distance", "handle-pinch-move", "clear-pinch-distance", "nudge-resize-crop", "nudge-move-crop", "resize-viewport", "reset-to-initial-state", "adjust-crop-aspect-ratio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-viewport-rect", "can-resize-crop", "can-pan", "can-drag-selection", "visible-rect", "fixed-crop-area", "aspect-ratio-equal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "viewport-id", "image-id", "selection-id", "handle-id", "root-el", "viewport-el", "image-el", "selection-el", "handle-el", "draw-cropped-image-canvas", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["zoom", "rotation", "flip", "crop", "offset", "natural-size", "viewport-rect", "dragging", "panning", "set-zoom", "zoom-by", "set-rotation", "rotate-by", "set-flip", "flip-horizontally", "flip-vertically", "resize", "reset", "get-crop-data", "get-cropped-image", "root-props", "viewport-props", "image-props", "selection-props", "handle-props", "grid-props", "group-role", "presentation-role", "slider-role", "keyboard-map", "pointer-handlers", "aria-live", "aria-busy", "aria-hidden", "data-pinch", "data-ownedby", "data-flip-horizontal", "data-flip-vertical", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "wheel-test", "keyboard-test", "pinch-test", "output-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/image-cropper", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ListboxReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  listboxSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-listbox", "headless-listbox", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    itemTextCount: z.number().int().nonnegative(),
    itemIndicatorCount: z.number().int().nonnegative(),
    itemGroupCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    collectionCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    highlightCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    typeaheadCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-listbox", "headless-listbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "input", "content", "item", "item-text", "item-indicator", "item-group", "item-group-label", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "focus-visible", "empty", "disabled", "highlighted", "selected", "multiple", "typing-ahead", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collectionSignals: z.array(z.object({
    signal: z.enum(["collection", "list-collection", "grid-collection", "items", "first-last", "next-prev", "stringify-items", "disabled-item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "selection-mode", "single", "multiple", "extended", "deselectable", "select-on-highlight", "select-all", "clear-value", "on-value-change", "on-select", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  highlightSignals: z.array(z.object({
    signal: z.enum(["highlighted-value", "default-highlighted-value", "highlight-first", "highlight-last", "highlight-next", "highlight-previous", "clear-highlight", "auto-highlight", "on-highlight-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["content-focus", "content-blur", "item-click", "pointer-move", "pointer-leave", "typeahead", "navigate", "input-focus", "input-blur", "input-keydown", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-up", "arrow-down", "arrow-left", "arrow-right", "home", "end", "enter", "space", "escape", "meta-a", "shift-selection", "loop-focus", "keyboard-priority", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-listbox", "role-option", "role-group", "aria-selected", "aria-disabled", "aria-activedescendant", "aria-multiselectable", "aria-labelledby", "aria-haspopup", "aria-controls", "aria-autocomplete", "tab-index", "data-highlighted", "data-selected", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "idle-state", "global-events", "selection-events", "highlight-events", "input-events", "content-events", "item-events", "navigate-event", "watch-value", "watch-highlighted-value", "watch-collection", "track-focus-visible-effect", "scroll-highlighted-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "highlighted-value-context", "highlighted-item-context", "selected-item-map-context", "focused-context", "typeahead-ref", "focus-visible-ref", "input-state-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["has-selected-items", "is-typing-ahead", "is-interactive", "selection", "multiple", "selected-items", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-focus-visible", "scroll-to-highlighted-item", "observe-active-descendant", "scroll-into-view", "interaction-modality", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["select-highlighted-item", "select-with-keyboard", "highlight-item", "highlight-matching-item", "set-highlighted-item", "highlight-first-value", "highlight-last-value", "highlight-next-value", "highlight-previous-value", "clear-highlighted-item", "select-item", "clear-item", "set-selected-items", "clear-selected-items", "sync-selected-items", "sync-highlighted-item", "sync-highlighted-value", "set-focused", "set-default-highlighted-value", "clear-focused", "set-input-state", "clear-input-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-selected-value", "has-highlighted-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "content-id", "label-id", "item-id", "item-group-id", "item-group-label-id", "content-el", "item-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["empty", "highlighted-item", "highlighted-value", "clear-highlighted-value", "selected-items", "has-selected-items", "value", "value-as-string", "collection", "disabled", "select-value", "set-value", "select-all", "highlight-value", "highlight-first", "highlight-last", "highlight-next", "highlight-previous", "clear-value", "get-item-state", "root-props", "input-props", "label-props", "value-text-props", "content-props", "item-props", "item-text-props", "item-indicator-props", "item-group-props", "item-group-label-props", "listbox-role", "option-role", "group-role", "presentation-role", "keyboard-map", "pointer-handlers", "dir-prop", "data-disabled", "data-orientation", "data-state", "data-layout", "data-empty", "data-activedescendant", "aria-hidden", "autocomplete-off", "spellcheck-false", "enter-key-hint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "typeahead-test", "selection-test", "multi-select-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/listbox", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DatePickerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  datePickerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-date-picker", "zag-date-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    tableCount: z.number().int().nonnegative(),
    cellCount: z.number().int().nonnegative(),
    segmentCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-date-picker", "zag-date-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "trigger", "content", "positioner", "table", "table-cell", "table-cell-trigger", "month-select", "year-select", "range-text", "segment-group", "segment", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "open", "focused", "closed", "disabled", "readonly", "invalid", "inline", "empty", "hovered", "unavailable", "selected", "today", "weekend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "focused-value", "default-focused-value", "input-value", "placeholder-value", "value-as-string", "value-as-date", "set-value", "clear-value", "set-time", "select-today", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["single", "multiple", "range", "max-selected-dates", "selecting-end-date", "selected-range", "hovered-range", "close-on-select", "outside-day-selectable", "preset-click", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewSignals: z.array(z.object({
    signal: z.enum(["day-view", "month-view", "year-view", "min-view", "max-view", "view-change", "set-view", "next-view", "previous-view", "decade", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["next-trigger", "prev-trigger", "goto-next", "goto-prev", "next-page", "previous-page", "next-year", "previous-year", "next-decade", "previous-decade", "month-grid", "year-grid", "week-days", "week-numbers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  segmentSignals: z.array(z.object({
    signal: z.enum(["segment-focus", "segment-blur", "segment-input", "segment-adjust", "segment-arrow-left", "segment-arrow-right", "segment-backspace", "segment-home", "segment-end", "segment-paste", "spinbutton", "contenteditable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-left", "arrow-right", "arrow-up", "arrow-down", "page-up", "page-down", "home", "end", "enter", "escape", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-application", "role-grid", "role-gridcell", "role-button", "role-spinbutton", "aria-roledescription", "aria-label", "aria-selected", "aria-disabled", "aria-invalid", "aria-current", "aria-multiselectable", "aria-readonly", "aria-labelledby", "hidden-input", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "refs", "bindable-context", "computed-state", "watch-props", "root-events", "open-state", "implementation-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["focused-value", "value", "input-value", "active-index", "hovered-value", "view", "start-value", "current-placement", "restore-focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-interactive", "visible-duration", "end-value", "visible-range", "visible-range-text", "prev-visible-range-valid", "next-visible-range-valid", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["setup-live-region", "track-positioning", "track-dismissable-element", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-above-min-view", "is-day-view", "is-month-view", "is-year-view", "is-range-picker", "has-selected-range", "is-multi-picker", "can-select-date", "should-restore-focus", "is-selecting-end-date", "close-on-select", "is-open-controlled", "interact-outside-event", "input-value-empty", "fix-on-blur", "day-pointer-outside-visible-month", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["view-actions", "restore-focus", "announce-actions", "text-selection", "sync-input", "focused-date", "date-value", "range-selection", "hovered-date", "keyboard-navigation", "active-index", "focus-elements", "select-sync", "parse-input", "visible-range", "open-close-callbacks", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["label-id", "root-id", "table-id", "table-header-id", "table-body-id", "table-row-id", "content-id", "cell-trigger-id", "prev-trigger-id", "next-trigger-id", "view-trigger-id", "clear-trigger-id", "control-id", "input-id", "trigger-id", "positioner-id", "month-select-id", "year-select-id", "focused-cell", "trigger-el", "content-el", "input-els", "year-select-el", "month-select-el", "clear-trigger-el", "positioner-el", "control-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focused", "open", "disabled", "invalid", "read-only", "inline", "num-of-months", "show-week-numbers", "selection-mode", "max-selected-dates", "is-max-selected", "view-api", "unavailable-api", "weeks-api", "week-days-api", "visible-range-text-api", "value-api", "value-as-date", "value-as-string-api", "focused-value-api", "focused-value-as-date", "focused-value-as-string", "visible-range-api", "range-preset-value", "week-number", "days-in-week", "offset-api", "month-weeks", "select-today-api", "set-value-api", "set-time-api", "clear-value-api", "set-focused-value-api", "set-open-api", "focus-month", "focus-year", "years-api", "months-api", "years-grid", "decade-api", "months-grid", "format-api", "set-view-api", "go-to-next", "go-to-prev", "root-props", "label-props", "control-props", "range-text-props", "content-props", "table-props", "table-head-props", "table-header-props", "table-body-props", "table-row-props", "week-number-header-cell-props", "week-number-cell-props", "day-table-cell-state", "day-table-cell-props", "day-table-cell-trigger-props", "month-table-cell-state", "month-table-cell-props", "month-table-cell-trigger-props", "year-table-cell-state", "year-table-cell-props", "year-table-cell-trigger-props", "next-trigger-props", "prev-trigger-props", "clear-trigger-props", "trigger-props", "view-props", "view-trigger-props", "view-control-props", "input-props", "month-select-props", "year-select-props", "positioner-props", "preset-trigger-props", "dir-prop", "data-disabled", "data-readonly", "data-empty", "data-placeholder-shown", "data-placement", "data-side", "data-inline", "data-view", "data-selectable", "autocomplete-off", "autocorrect-off", "spellcheck-false", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "range-test", "segment-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/date-picker", "@zag-js/date-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/live-region", "@zag-js/dismissable", "@zag-js/date-utils", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "@internationalized/date", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MarqueeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  marqueeSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-marquee", "css-marquee", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    edgeCount: z.number().int().nonnegative(),
    cloneCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    measurementCount: z.number().int().nonnegative(),
    motionCount: z.number().int().nonnegative(),
    pauseCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-marquee", "css-marquee", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "viewport", "content", "item", "edge", "clone", "css-variable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "paused", "resumed", "reverse", "horizontal", "vertical", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  motionSignals: z.array(z.object({
    signal: z.enum(["speed", "delay", "loop-count", "spacing", "duration", "translate", "keyframes", "animation-iteration", "animation-end", "restart", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  measurementSignals: z.array(z.object({
    signal: z.enum(["auto-fill", "multiplier", "content-count", "root-size", "content-size", "resize-observer", "request-animation-frame", "dimension-snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pause", "resume", "toggle-pause", "pause-on-interaction", "mouse-enter", "mouse-leave", "focus-capture", "blur-capture", "restart", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-region", "aria-roledescription", "aria-live-off", "aria-label", "presentation-clone", "aria-hidden-clone", "reduced-motion", "data-state", "data-orientation", "data-paused", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "refs", "bindable-context", "idle-state", "computed-state", "watch-props", "global-events", "track-dimensions-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["paused-context", "duration-context", "dimensions-ref", "initial-duration-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["orientation", "is-vertical", "multiplier", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-dimensions", "resize-observer", "request-animation-frame", "dimension-measurement", "observer-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-paused", "set-resumed", "toggle-paused", "restart-animation", "recalculate-duration", "calculate-duration", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "viewport-id", "content-id", "root-el", "viewport-el", "content-el", "edge-position-styles", "marquee-translate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["paused", "orientation", "side", "multiplier", "content-count", "pause", "resume", "toggle-pause", "restart", "root-props", "viewport-props", "content-props", "edge-props", "item-props", "region-role", "animation-events", "pause-interaction-handlers", "clone-accessibility", "css-variables", "dir-prop", "data-part", "data-index", "data-side", "data-reverse", "data-clone", "display-flex", "overflow-hidden", "contain-layout-style-paint", "pointer-events-none", "spacing-margin", "will-change-transform", "translate-z", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pause-test", "loop-test", "measurement-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/marquee", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TocReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tocSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-toc", "docs-toc", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    titleCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    linkCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    headingCount: z.number().int().nonnegative(),
    activeCount: z.number().int().nonnegative(),
    observerCount: z.number().int().nonnegative(),
    scrollCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-toc", "docs-toc", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "title", "list", "item", "link", "indicator", "heading", "css-indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "active-ids", "active-items", "default-active-ids", "active-item-state", "first-active", "last-active", "depth", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observerSignals: z.array(z.object({
    signal: z.enum(["intersection-observer", "root-margin", "threshold", "scroll-root", "visibility-map", "resize-observer", "indicator-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scrollSignals: z.array(z.object({
    signal: z.enum(["auto-scroll", "scroll-behavior", "scroll-to", "scroll-into-view", "same-page-hash", "push-hash", "hashchange", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  indicatorSignals: z.array(z.object({
    signal: z.enum(["indicator-rect", "rect-empty", "top-left-width-height", "active-range", "resize-border-box", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-labelledby", "aria-current-location", "data-active", "data-depth", "data-first", "data-last", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "bindable-context", "refs", "computed-state", "watch-active-ids", "entry-exit-actions", "active-ids-event", "idle-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["active-ids-context", "indicator-rect-context", "visibility-map-ref", "indicator-cleanup-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["active-items", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-heading-visibility", "intersection-observer", "observer-options", "scroll-root", "visibility-map", "observer-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-active-ids", "auto-scroll-toc", "cleanup-indicator-observer", "sync-indicator-rect", "resize-observer-border-box", "invoke-active-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "title-id", "list-id", "item-id", "link-id", "indicator-id", "root-el", "list-el", "item-el", "indicator-el", "heading-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["active-ids", "active-items", "items", "set-active-ids", "scroll-to", "item-state", "root-props", "title-props", "list-props", "item-props", "link-props", "indicator-props", "aria-labelledby", "aria-current-location", "data-active", "same-page-hash", "push-hash", "scroll-to-element", "css-variables", "hidden-indicator", "dir-prop", "data-value", "data-depth", "data-first", "data-last", "depth-css-var", "scroll-behavior", "scroll-into-view", "prevent-default", "download-guard", "new-tab-guard", "hashchange-event", "indicator-position-absolute", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "observer-test", "scroll-test", "active-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/toc", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FloatingPanelReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  floatingPanelSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-floating-panel", "custom-floating-panel", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    titleCount: z.number().int().nonnegative(),
    headerCount: z.number().int().nonnegative(),
    bodyCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    stageTriggerCount: z.number().int().nonnegative(),
    resizeTriggerCount: z.number().int().nonnegative(),
    dragTriggerCount: z.number().int().nonnegative(),
    stackCount: z.number().int().nonnegative(),
    boundaryCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-floating-panel", "custom-floating-panel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "header", "body", "title", "control", "stage-trigger", "resize-trigger", "drag-trigger", "close-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "idle", "dragging", "resizing", "minimized", "maximized", "default-stage", "topmost", "behind", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["size", "position", "css-vars", "strategy-fixed", "strategy-absolute", "fallback-size", "fallback-position", "anchor-position", "boundary-rect", "allow-overflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dragResizeSignals: z.array(z.object({
    signal: z.enum(["drag-start", "resize-start", "pointer-move", "pointer-capture", "grid-size", "clamp-point", "resize-axis", "lock-aspect-ratio", "keyboard-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stackSignals: z.array(z.object({
    signal: z.enum(["panel-stack", "bring-to-front", "z-index", "topmost", "stack-remove", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusAccessibilitySignals: z.array(z.object({
    signal: z.enum(["role-dialog", "aria-labelledby", "aria-controls", "initial-focus", "final-focus", "restore-focus", "escape-close", "data-state", "data-stage", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "computed-state", "watch-props", "top-level-effects", "root-events", "nested-states", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["size", "position", "stage", "last-event-position", "prev-position", "prev-size", "is-topmost", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-maximized", "is-minimized", "is-staged", "has-specified-position", "can-resize", "can-drag", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "track-boundary-rect", "track-panel-stack", "resize-observer-border-box", "stack-subscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-position", "set-size", "anchor-position", "prev-position", "drag-position", "resize-from-drag", "stage-actions", "keyboard-position", "stack-front", "open-close-callbacks", "focus-actions", "toggle-visibility", "style-actions", "reset-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "positioner-id", "content-id", "title-id", "header-id", "trigger-el", "positioner-el", "content-el", "header-el", "boundary-rect", "window-rect", "element-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "set-open", "dragging", "resizing", "position-api", "set-position", "size-api", "set-size", "minimize", "maximize", "restore", "resizable-api", "draggable-api", "trigger-props", "positioner-props", "content-props", "title-props", "header-props", "body-props", "close-trigger-props", "control-props", "stage-trigger-props", "resize-trigger-props", "drag-trigger-props", "dir-prop", "disabled-prop", "type-button", "data-state", "data-dragging", "aria-controls", "role-dialog", "tab-index", "hidden-content", "data-topmost", "data-behind", "data-minimized", "data-maximized", "data-staged", "data-axis", "css-position-vars", "escape-key", "arrow-key-move", "pointer-capture", "pointer-release", "stop-propagation", "left-click-guard", "no-drag-guard", "double-click-stage", "touch-action-none", "cursor-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "resize-test", "stage-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/floating-panel", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/store", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DrawerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  drawerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-drawer", "custom-drawer", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    titleCount: z.number().int().nonnegative(),
    descriptionCount: z.number().int().nonnegative(),
    backdropCount: z.number().int().nonnegative(),
    closeTriggerCount: z.number().int().nonnegative(),
    grabberCount: z.number().int().nonnegative(),
    grabberIndicatorCount: z.number().int().nonnegative(),
    swipeAreaCount: z.number().int().nonnegative(),
    snapPointCount: z.number().int().nonnegative(),
    swipeCount: z.number().int().nonnegative(),
    stackCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    scrollLockCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-drawer", "custom-drawer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "title", "description", "backdrop", "close-trigger", "grabber", "grabber-indicator", "swipe-area", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "closing", "swiping-open", "swipe-area-dragging", "dragging", "trigger-value", "expanded", "nested-open", "nested-swiping", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  snapSignals: z.array(z.object({
    signal: z.enum(["snap-points", "default-snap-point", "snap-point-change", "resolved-snap-points", "snap-index", "open-percentage", "content-size", "viewport-size", "root-font-size", "rem-snap-points", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  swipeSignals: z.array(z.object({
    signal: z.enum(["swipe-direction", "physical-direction", "pointer-down", "pointer-move", "pointer-up", "pointer-cancel", "swipe-area-start", "drag-offset", "swipe-progress", "velocity-threshold", "close-threshold", "prevent-drag-on-scroll", "no-drag", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stackSignals: z.array(z.object({
    signal: z.enum(["drawer-stack", "create-stack", "connect-stack", "register", "unregister", "open-count", "frontmost-height", "swipe-progress", "nested-metrics", "registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusAccessibilitySignals: z.array(z.object({
    signal: z.enum(["role-dialog", "aria-modal", "aria-labelledby", "aria-describedby", "trap-focus", "initial-focus", "final-focus", "restore-focus", "escape-close", "interact-outside", "prevent-scroll", "aria-hidden", "data-state", "data-swipe-direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "refs", "computed-state", "watch-props", "root-events", "open-state", "swipe-states", "implementation-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["trigger-value", "drag-offset", "snap-point", "resolved-active-snap-point", "content-size", "viewport-size", "root-font-size", "swipe-strength", "rendered", "nested-metrics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["drawer-id", "physical-swipe-direction", "resolved-snap-points", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-drawer-stack", "track-dismissable-element", "prevent-scroll", "trap-focus", "hide-content-below", "track-pointer-move", "track-size-measurements", "track-nested-drawer-metrics", "track-swipe-open-pointer-move", "track-exit-animation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-open-controlled", "is-dragging", "should-start-dragging", "should-close-on-swipe", "has-swipe-intent", "should-open-on-swipe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["initial-focus", "rendered-elements", "drag-offset-cleanup", "swipe-open-animation", "trigger-value", "open-close-callbacks", "snap-point", "pointer-start", "drag-offset", "swipe-open-drag-offset", "closest-snap-point", "clear-snap-and-size", "velocity-tracking", "swipe-strength", "snap-back", "registry-swiping", "toggle-visibility", "sync-drawer-stack", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["content-id", "positioner-id", "title-id", "description-id", "trigger-id", "trigger-els", "active-trigger-el", "backdrop-id", "header-id", "grabber-id", "grabber-indicator-id", "close-trigger-id", "swipe-area-id", "content-el", "positioner-el", "title-el", "description-el", "trigger-el", "backdrop-el", "header-el", "grabber-el", "grabber-indicator-el", "close-trigger-el", "swipe-area-el", "content-or-swipe-area-hit-test", "scroll-elements", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "dragging", "set-open", "snap-points", "swipe-direction", "snap-point", "set-snap-point", "open-percentage", "snap-point-index", "content-size-api", "trigger-value-api", "set-trigger-value", "positioner-props", "content-props", "title-props", "description-props", "trigger-props", "backdrop-props", "grabber-props", "grabber-indicator-props", "close-trigger-props", "swipe-area-props", "dir-prop", "hidden-prop", "data-state", "data-swipe-direction", "pointer-events-none", "tab-index", "role-prop", "aria-modal", "aria-labelledby", "aria-describedby", "data-expanded", "data-swiping", "data-dragging", "nested-open", "nested-swiping", "transform-translate3d", "drawer-css-vars", "will-change-transform", "data-ownedby", "data-value", "aria-haspopup-dialog", "aria-expanded", "aria-controls", "data-current", "aria-hidden", "data-disabled", "touch-action-pan", "touch-start", "prevent-default", "left-click-guard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "swipe-test", "snap-test", "stack-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/drawer", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/aria-hidden", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-trap", "@zag-js/remove-scroll", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const HoverCardReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  hoverCardSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-hover-card", "custom-hover-card", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    arrowTipCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    triggerValueCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-hover-card", "custom-hover-card", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "arrow", "arrow-tip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "opening", "closing", "disabled", "trigger-value", "current-placement", "is-pointer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  delaySignals: z.array(z.object({
    signal: z.enum(["open-delay", "close-delay", "wait-open-delay", "wait-close-delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["placement", "current-placement", "reposition", "popper-styles", "get-placement", "placement-side", "strategy", "listeners", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-enter", "pointer-leave", "focus", "blur", "dismissable", "interact-outside", "focus-outside", "touch-ignore", "controlled-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["data-state", "data-placement", "data-side", "data-ownedby", "data-current", "hidden", "tab-index", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "watch-props", "global-events", "state-chart", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["open-context", "current-placement", "is-pointer", "trigger-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["wait-open-delay", "wait-close-delay", "track-positioning", "track-dismissable-element", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["invoke-on-open", "invoke-on-close", "set-is-pointer", "clear-is-pointer", "reposition", "set-trigger-value", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "content-id", "positioner-id", "arrow-id", "trigger-el", "content-el", "positioner-el", "trigger-els", "active-trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "set-open", "trigger-value-api", "set-trigger-value", "reposition-api", "trigger-props", "arrow-props", "arrow-tip-props", "positioner-props", "content-props", "data-placement", "data-side", "data-ownedby", "data-value", "data-current", "data-state", "hidden", "tab-index", "dir-prop", "disabled-guard", "arrow-style", "arrow-tip-style", "positioner-floating-style", "pointer-enter-handler", "pointer-leave-handler", "touch-ignore", "focus-handler", "blur-handler", "trigger-value-switch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "focus-test", "delay-test", "positioning-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/hover-card", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const NavigationMenuReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  navigationMenuSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-navigation-menu", "custom-navigation-menu", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    motionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-navigation-menu", "custom-navigation-menu", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "list", "item", "trigger", "trigger-proxy", "viewport", "viewport-positioner", "viewport-proxy", "content", "link", "indicator", "item-indicator", "arrow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "previous-value", "open", "closed", "selected", "was-selected", "disabled", "viewport-rendered", "viewport-size", "viewport-position", "trigger-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  delaySignals: z.array(z.object({
    signal: z.enum(["open-delay", "close-delay", "open-timeout", "close-timeout", "skip-delay", "clear-timeouts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewportSignals: z.array(z.object({
    signal: z.enum(["viewport-size", "viewport-position", "trigger-rect", "css-vars", "resize-observer", "reposition", "align", "screen-offset", "motion-attr", "exitcomplete", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-enter", "pointer-leave", "trigger-click", "content-focus", "content-blur", "item-navigate", "item-close", "dismissable", "focus-outside", "pointer-down-outside", "close-on-click", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-keys", "home-end", "entry-key", "tab-order", "trigger-proxy", "focus-first", "focus-trigger", "navigate", "rtl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-controls", "aria-expanded", "aria-current", "aria-owns", "aria-labelledby", "aria-hidden", "hidden", "data-state", "data-orientation", "data-value", "data-ownedby", "data-motion", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["setup-machine", "default-props", "bindable-context", "computed-open", "watch-value", "refs", "entry-exit-effects", "root-events", "state-chart", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value", "previous-value", "viewport-size", "viewport-rendered", "viewport-position", "content-node", "trigger-rect", "trigger-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-document-resize", "track-resize-observer", "content-resize-observer", "dismissable-content", "exitcomplete-listener", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "timeout-actions", "select-deselect-value", "sync-content-node", "set-trigger-node", "sync-motion-attribute", "focus-actions", "tab-order-actions", "cleanup-observers", "viewport-position", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "trigger-id", "trigger-proxy-id", "content-id", "viewport-id", "list-id", "item-id", "root-el", "viewport-el", "trigger-el", "trigger-proxy-el", "list-el", "content-el", "content-els", "tabbable-els", "trigger-els", "link-els", "elements", "resize-observer", "motion-attr", "focus-first", "tab-order", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "value-api", "orientation", "viewport-rendered-api", "viewport-node-api", "set-value", "reposition-api", "root-props", "list-props", "item-props", "indicator-props", "item-indicator-props", "arrow-props", "trigger-props", "trigger-proxy-props", "viewport-proxy-props", "link-props", "content-props", "viewport-positioner-props", "viewport-props", "item-state-api", "dir-prop", "root-aria-label", "data-orientation", "layout-css-vars", "data-value", "data-state", "data-disabled", "aria-hidden", "hidden-prop", "indicator-position-absolute", "transition-none", "data-uid", "data-trigger-proxy-id", "aria-controls", "aria-expanded", "pointer-enter-handler", "pointer-leave-handler", "mouse-pointer-guard", "disable-hover-guard", "disable-click-guard", "key-navigation", "prevent-default", "stop-propagation", "trigger-proxy-focus", "visually-hidden-style", "aria-owns", "aria-current-page", "custom-link-select", "close-on-click", "meta-key-guard", "aria-labelledby", "viewport-pointer-events-none", "data-align", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "focus-test", "delay-test", "viewport-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/navigation-menu", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PresenceReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  presenceSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-presence", "headless-transition", "custom-presence", "unknown"]),
    presentCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    mountCount: z.number().int().nonnegative(),
    unmountCount: z.number().int().nonnegative(),
    animationCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    visibilityCount: z.number().int().nonnegative(),
    immediateCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    cleanupCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-presence", "headless-transition", "custom-presence", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["mounted", "unmount-suspended", "unmounted", "present", "initial", "skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["mount", "unmount", "presence-changed", "set-node", "cleanup-node", "exit-complete", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  animationSignals: z.array(z.object({
    signal: z.enum(["animation-start", "animation-end", "animation-cancel", "animation-name", "animation-duration", "animation-fill-mode", "prev-animation-name", "unmount-animation-name", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  visibilitySignals: z.array(z.object({
    signal: z.enum(["document-hidden", "visibility-state", "request-animation-frame", "immediate", "hidden-skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "initial-state", "refs", "bindable-context", "exit-cleanup", "watch-present", "node-presence-events", "state-transitions", "track-animation-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["unmount-animation-name", "prev-animation-name", "present-context", "initial-context", "node-ref", "styles-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-animation-events", "animation-start-listener", "animation-end-listener", "animation-cancel-listener", "animation-fill-mode", "cleanup-listeners", "next-tick-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-initial", "invoke-exit-complete", "setup-node", "cleanup-node", "sync-presence", "set-prev-animation-name", "clear-prev-animation-name", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["set-node", "unmount", "present-api", "skip-api", "on-exit-complete", "node-null-guard", "node-set-event", "unmount-event", "state-matches-present", "initial-skip", "props-create-props", "present-prop", "on-exit-complete-prop", "immediate-prop", "presence-api-interface", "skip-boolean", "present-boolean", "set-node-nullable", "unmount-void-api", "presence-service-type", "presence-machine-type", "present-coerce-boolean", "initial-state-present-prop", "exitcomplete-bubbles-false", "node-dispatch-event", "same-node-guard", "computed-style-cache", "visibility-hidden-unmount", "raf-presence-check", "animation-name-none", "display-none-unmount", "zero-duration-unmount", "unmount-suspend-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["transition-context", "nesting-context", "tree-states", "should-forward-ref", "register-unregister", "has-children", "render-strategy-unmount-hidden", "transition-chains", "wait-promises", "server-handoff", "skip-initial-transition", "immediate-appear", "use-transition-hook", "transition-data-attributes", "class-map-enter-leave", "open-closed-provider", "state-opening-closing", "show-from-open-closed", "missing-show-error", "initial-change-tracking", "before-enter-leave", "after-enter-leave", "internal-transition-child", "transition-object-assign", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "animation-test", "visibility-test", "exitcomplete-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/presence", "@zag-js/react", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@headlessui/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MenuReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  menuSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-menu", "custom-menu", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    contextTriggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    optionItemCount: z.number().int().nonnegative(),
    groupCount: z.number().int().nonnegative(),
    separatorCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    highlightCount: z.number().int().nonnegative(),
    typeaheadCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    submenuCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-menu", "custom-menu", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  anatomySignals: z.array(z.object({
    signal: z.enum(["trigger", "context-trigger", "positioner", "content", "item", "option-item", "item-group", "item-group-label", "separator", "indicator", "item-indicator", "item-text", "arrow", "arrow-tip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "open", "closed", "opening", "closing", "contextmenu", "trigger-value", "controlled-open", "default-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  highlightSignals: z.array(z.object({
    signal: z.enum(["highlighted-value", "last-highlighted", "highlighted-set", "highlighted-restore", "highlighted-suggest", "item-state", "option-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  typeaheadSignals: z.array(z.object({
    signal: z.enum(["typeahead", "typeahead-state", "matched-item", "printable-key", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["positioning", "current-placement", "placement-side", "popper-styles", "reposition", "anchor-point", "anchor-rect", "context-menu-position", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["trigger-click", "trigger-focus", "pointer-move", "pointer-leave", "item-click", "dismissable", "interact-outside", "focus-outside", "escape-key", "option-state", "submenu-routing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-keys", "home-end", "enter-space", "tab-escape", "navigate", "focus-menu", "focus-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-menu", "menuitem", "menuitemcheckbox", "aria-haspopup", "aria-controls", "aria-expanded", "aria-activedescendant", "aria-labelledby", "aria-checked", "data-state", "data-placement", "data-side", "data-ownedby", "data-value", "data-highlighted", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "refs", "computed-state", "watch-props", "root-events", "delayed-states", "open-state", "implementation-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["highlighted-value", "last-highlighted-value", "current-placement", "intent-polygon", "anchor-point", "is-submenu", "trigger-value", "pointer-routing-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-rtl", "is-typing-ahead", "highlighted-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["wait-open-delay", "wait-close-delay", "wait-long-press", "track-focus-visible", "track-positioning", "track-interact-outside", "track-pointer-move", "scroll-highlighted-item", "observe-attributes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["close-on-select", "is-trigger-item", "is-trigger-item-highlighted", "is-submenu", "is-pointer-routing-locked", "is-highlighted-item-editable", "is-open-controlled", "arrow-event", "open-autofocus-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-anchor-point", "set-submenu-placement", "reposition", "set-option-state", "click-highlighted-item", "intent-polygon", "parent-routing-lock", "highlight-navigation", "selection-callback", "focus-actions", "typeahead-match", "parent-child-menu", "submenu-actions", "open-close-callbacks", "toggle-visibility", "trigger-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "context-trigger-id", "content-id", "arrow-id", "positioner-id", "group-id", "item-id", "group-label-id", "content-el", "positioner-el", "trigger-el", "item-el", "arrow-el", "context-trigger-el", "trigger-els", "context-trigger-els", "elements-query", "typeahead-key", "selection-event", "menu-tree", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "highlighted-value", "trigger-value", "set-open", "set-trigger-value", "set-highlighted-value", "set-parent", "set-child", "reposition", "add-item-listener", "context-trigger-props", "trigger-item-props", "trigger-props", "indicator-props", "positioner-props", "arrow-props", "arrow-tip-props", "content-props", "separator-props", "item-state", "item-props", "option-item-state", "option-item-props", "item-indicator-props", "item-text-props", "item-group-label-props", "item-group-props", "dir-prop", "data-placement", "data-side", "type-button", "data-ownedby", "data-value", "data-current", "data-uid", "aria-haspopup-menu-dialog", "aria-controls", "data-controls", "aria-expanded", "pointer-move-handler", "pointer-leave-handler", "disabled-target-guard", "context-menu-guard", "prevent-default", "default-prevented-guard", "trigger-blur-handler", "trigger-focus-handler", "key-map-arrow", "positioner-floating-style", "arrow-style", "arrow-tip-style", "content-role", "content-tabindex", "aria-activedescendant", "aria-labelledby", "valid-tab-guard", "typeahead-printable-guard", "separator-role", "option-data-type", "aria-checked", "item-indicator-hidden", "item-group-role", "download-guard", "new-tab-guard", "drag-link-prevent-default", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "typeahead-test", "context-menu-test", "submenu-test", "option-test", "positioning-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/menu", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TooltipReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tooltipSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-tooltip", "custom-tooltip", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    storeCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-tooltip", "custom-tooltip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  anatomySignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "arrow", "arrow-tip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "opening", "closing", "controlled-open", "disabled", "trigger-value", "pointer-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  delaySignals: z.array(z.object({
    signal: z.enum(["open-delay", "close-delay", "instant-open", "wait-open-delay", "wait-close-delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["positioning", "placement", "current-placement", "placement-side", "popper-styles", "reposition", "anchor-trigger", "get-placement", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storeSignals: z.array(z.object({
    signal: z.enum(["tooltip-store", "global-id", "previous-id", "instant", "store-subscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["trigger-click", "trigger-focus", "trigger-blur", "pointer-move", "pointer-leave", "pointer-down", "content-pointer", "escape-key", "scroll-close", "pointerlock-close", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-tooltip", "aria-describedby", "aria-label", "data-state", "data-placement", "data-side", "data-ownedby", "data-value", "data-expanded", "data-current", "data-instant", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "initial-state", "default-props", "top-level-effects", "bindable-context", "watch-props", "global-events", "state-chart", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["current-placement", "pointer-move-opened", "trigger-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-focus-visible", "track-store", "track-scroll", "track-pointerlock-change", "track-positioning", "track-escape-key", "wait-open-delay", "wait-close-delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-global-id", "clear-global-id", "invoke-on-open", "invoke-on-close", "close-if-disabled", "reposition", "reposition-immediate", "toggle-visibility", "set-pointer-move-opened", "clear-pointer-move-opened", "set-trigger-value", "immediate-reopen", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "content-id", "arrow-id", "positioner-id", "trigger-el", "content-el", "positioner-el", "arrow-el", "trigger-els", "active-trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "set-open", "trigger-value-api", "set-trigger-value", "reposition-api", "trigger-props", "arrow-props", "arrow-tip-props", "positioner-props", "content-props", "aria-describedby", "role-tooltip", "data-state", "data-placement", "data-side", "pointer-events", "data-ownedby", "data-value", "data-current", "dir-prop", "data-expanded", "close-on-click-guard", "focus-visible-guard", "related-trigger-guard", "left-click-guard", "close-on-pointerdown-guard", "touch-pointer-ignore", "pointer-over-handler", "pointer-cancel-handler", "arrow-style", "arrow-tip-style", "positioner-floating-style", "hidden-prop", "data-instant", "aria-label-role-guard", "content-id-aria-label-guard", "content-pointer-enter", "content-pointer-leave", "interactive-pointer-events", "default-prevented-guard", "disabled-guard", "store-current-id", "store-prev-id", "current-placement-side", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "fake-timers", "pointer-test", "focus-test", "delay-test", "scroll-test", "escape-test", "positioning-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/tooltip", "@zag-js/react", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/dom-query", "@zag-js/anatomy", "@zag-js/core", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LlmReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  llmSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["langchain", "vercel-ai-sdk", "openai", "anthropic", "google-genai", "ollama", "llamaindex", "custom", "unknown"]),
    modelCount: z.number().int().nonnegative(),
    promptCount: z.number().int().nonnegative(),
    toolCount: z.number().int().nonnegative(),
    agentCount: z.number().int().nonnegative(),
    retrievalCount: z.number().int().nonnegative(),
    embeddingCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    streamingCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["chat-model", "completion-model", "embedding-model", "provider-config", "model-name", "temperature", "fallback", "init-chat-model", "model-provider-config", "model-provider-inference", "provider-prefix", "configurable-model", "configurable-fields", "config-prefix", "base-chat-model", "chat-model-call-options", "chat-model-stream-v2", "chat-model-generation", "chat-model-cache", "base-cache-interface", "in-memory-cache", "cache-key-encoder", "cache-generation-serialization", "cache-chat-generation-message", "global-cache-map", "chat-model-callbacks", "model-output-version", "model-token-usage-output", "llm-result-generations", "generation-info", "generation-chunk-concat", "chat-generation-chunk", "chat-result-output", "run-key-metadata", "model-profile", "model-context-window", "model-multimodal-inputs", "model-tool-message-inputs", "model-output-modalities", "model-reasoning-output", "model-tool-capabilities", "model-structured-output-profile", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  promptSignals: z.array(z.object({
    signal: z.enum(["prompt-template", "chat-prompt-template", "system-message", "human-message", "messages-placeholder", "few-shot", "few-shot-template", "example-selector", "length-based-example-selector", "semantic-similarity-example-selector", "example-prompt", "example-separator", "partial-variables", "template-format", "mustache-template", "f-string-template", "template-parser", "template-renderer", "template-validation", "invalid-prompt-input", "message-content-template", "message-content-block", "data-content-block", "provider-content-converter", "openai-data-block", "openai-response-block", "anthropic-content-block", "content-block-merge", "openrouter-reasoning-block", "groq-reasoning-block", "ollama-reasoning-block", "deepseek-reasoning-block", "xai-reasoning-block", "google-thinking-block", "bedrock-converse-block", "bedrock-citation-block", "message-prompt-template", "chat-message-prompt-template", "role-message-prompt-template", "image-prompt-template", "image-prompt-input", "image-prompt-value", "image-content-fields", "image-url-template", "image-prompt-partial", "placeholder-coercion", "message-constructor-coercion", "message-like-coercion", "message-buffer-string", "stored-message-v1-map", "stored-message-chat-map", "chat-message-storage-map", "chat-prompt-validation", "image-prompt-parsing", "chat-prompt-flattening", "pipeline-prompt-template", "pipeline-prompts", "pipeline-final-prompt", "pipeline-input-computation", "pipeline-format-prompts", "pipeline-partial", "structured-prompt", "structured-prompt-schema", "structured-prompt-method", "structured-prompt-pipe", "structured-prompt-factory", "dict-prompt-template", "dict-prompt-template-format", "dict-input-variables", "dict-template-render", "dict-nested-template", "base-prompt-template", "base-prompt-input", "base-string-prompt-template", "prompt-value-formatting", "prompt-serialization", "prompt-partial-merge", "dynamic-system-prompt", "summary-prompt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runnableSignals: z.array(z.object({
    signal: z.enum(["runnable-sequence", "runnable-lambda", "runnable-passthrough", "runnable-map", "pipe-chain", "invoke", "batch", "stream", "as-tool", "with-message-history", "message-history-store", "message-history-config", "message-history-keys", "message-history-insert", "message-history-persist", "message-history-input-coercion", "message-history-output-coercion", "message-history-enter-exit", "message-history-session-attach", "message-history-dedupe", "message-filter", "message-run-merge", "message-trim", "message-chunk-conversion", "response-metadata-merge", "usage-metadata-merge", "runnable-config", "config-ensure", "config-merge", "config-patch", "config-pick-keys", "runnable-callback-manager-config", "async-local-config", "recursion-limit", "config-timeout-signal", "configurable-runtime", "runnable-branch", "branch-condition", "branch-default", "runnable-binding", "config-factory", "runnable-each", "runnable-retry", "retry-attempt-handler", "runnable-with-fallbacks", "runnable-assign", "runnable-pick", "map-key-callback", "runnable-stream-log", "runnable-stream-events", "runnable-coercion", "with-retry", "with-fallbacks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["tool", "tool-schema", "tool-calling", "agent", "agent-executor", "agent-middleware", "middleware-state-schema", "middleware-context-schema", "wrap-model-call", "wrap-tool-call", "before-model", "after-model", "before-agent", "after-agent", "dynamic-tool", "hitl-interrupt", "hitl-review-config", "headless-tool", "headless-tool-overload", "headless-tool-implementation", "headless-tool-interrupt", "headless-tool-metadata", "summarization-middleware", "context-editing", "context-clear-tool-uses", "llm-tool-selector", "ai-message-tool-calls", "tool-call-parser", "tool-call-chunk", "tool-message-artifact", "tool-message-status", "tool-response-format", "tool-return-type", "tool-content-artifact-format", "direct-tool-output", "tool-output-formatting", "tool-runnable-config", "openai-function-conversion", "openai-tool-conversion", "tool-strict-schema", "tool-json-schema-conversion", "tool-json-schema-cache", "tool-schema-type-guards", "server-tool-call-block", "mcp-tool", "mcp-client", "mcp-load-tools", "mcp-list-tools-pagination", "mcp-json-schema-deref", "mcp-schema-simplify", "mcp-tool-hooks", "mcp-before-tool-call", "mcp-after-tool-call", "mcp-artifact-content", "mcp-structured-content", "mcp-meta-artifact", "mcp-command-result", "mcp-tool-message", "mcp-client-fork", "mcp-progress-callback", "mcp-tool-exception", "mcp-output-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  retrievalSignals: z.array(z.object({
    signal: z.enum(["vector-store", "retriever", "embeddings", "text-splitter", "document-loader", "rag-chain", "retriever-tool", "retriever-tool-schema", "retriever-callback-child", "retriever-document-format", "base-retriever", "retriever-run-config", "retriever-start-event", "retriever-end-event", "retriever-error-event", "fake-retriever", "document-transformer", "mapping-document-transformer", "transform-documents", "document-compressor", "compress-documents", "base-document-loader", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structuredOutputSignals: z.array(z.object({
    signal: z.enum(["output-parser", "zod-schema", "with-structured-output", "content-parser-factory", "function-calling-parser-factory", "structured-output-pipeline", "include-raw-output", "raw-parsed-output", "parser-fallback", "parser-assign", "json-schema", "function-calling", "response-format", "structured-response", "tool-strategy", "provider-strategy", "typed-tool-strategy", "transform-response-format", "response-format-undefined", "json-schema-support", "structured-output-errors", "tool-strategy-options", "base-output-parser", "transform-output-parser", "cumulative-output-parser", "json-output-parser", "string-output-parser", "bytes-output-parser", "list-output-parser", "xml-output-parser", "standard-schema-output-parser", "openai-functions-parser", "openai-tools-parser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  streamingSignals: z.array(z.object({
    signal: z.enum(["stream", "stream-events", "callbacks", "tracing", "langsmith", "token-usage", "agent-run-stream", "chat-model-stream", "text-content-stream", "tool-calls-substream", "reasoning-content-stream", "usage-metadata-stream", "replay-buffer", "content-delta-assembly", "stream-output-message", "tool-block-standardization", "stream-transformer", "stream-channel", "stream-mode", "tool-call-stream", "tool-call-stream-projection", "tool-call-output-normalization", "headless-tool-stream-interrupt", "tool-call-pending-map", "tool-call-stream-finalize", "content-block-stream", "legacy-chat-generation-bridge", "stream-event-conversion", "stream-active-blocks", "stream-image-tool-output", "stream-audio-payload", "stream-abort-signal", "stream-usage-start", "base-callback-handler", "callback-manager-config", "callback-run-manager", "custom-event-dispatch", "event-stream-callback", "log-stream-callback", "run-collector-tracer", "root-listener-tracer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["guardrail", "moderation", "refusal", "retry", "fallback", "rate-limit", "model-retry", "tool-retry", "human-in-the-loop", "pii-detection", "pii-redaction", "pii-mask", "pii-hash", "pii-block", "openai-moderation", "moderation-jump", "prompt-caching", "model-call-limit", "tool-call-limit", "serialized-load-trust-boundary", "serialized-constructor-load", "serialized-secret-map", "serialized-import-map", "serialized-escape-marker", "serialized-depth-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["langchain", "@langchain/core", "@langchain/openai", "@langchain/mcp-adapters", "@langchain/langgraph", "@modelcontextprotocol/sdk", "ai", "openai", "@anthropic-ai/sdk", "llamaindex", "ollama", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LlmEvalReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  evalSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["promptfoo", "openai-evals", "openevals", "langsmith", "custom", "unknown"]),
    promptCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    testCaseCount: z.number().int().nonnegative(),
    assertionCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    judgeCount: z.number().int().nonnegative(),
    redteamCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["promptfoo-config", "eval-registry", "eval-class", "samples-jsonl", "pyproject", "package-script", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  promptSignals: z.array(z.object({
    signal: z.enum(["prompt", "prompt-file", "prompt-template", "vars", "messages", "few-shot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["provider", "model-name", "grader-model", "completion-fn", "api-key-env", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testCaseSignals: z.array(z.object({
    signal: z.enum(["tests", "vars", "assert", "expected", "rubric", "threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  judgeSignals: z.array(z.object({
    signal: z.enum(["llm-rubric", "modelgraded-spec", "llm-as-judge", "correctness", "hallucination", "feedback-key", "score", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  datasetSignals: z.array(z.object({
    signal: z.enum(["samples-jsonl", "dataset", "csv", "jsonl", "reference-output", "ideal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  redteamSignals: z.array(z.object({
    signal: z.enum(["redteam", "plugins", "strategies", "jailbreak", "prompt-injection", "pii", "owasp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["promptfoo-eval", "promptfoo-redteam", "oaieval", "evaluate", "ci", "report-output", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["promptfoo", "openevals", "openai-evals", "langsmith", "deepeval", "ragas", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LlmObservabilityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  observabilitySetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["langfuse", "phoenix", "helicone", "langsmith", "openinference", "opentelemetry", "custom", "unknown"]),
    traceCount: z.number().int().nonnegative(),
    spanCount: z.number().int().nonnegative(),
    generationCount: z.number().int().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
    userCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    scoreCount: z.number().int().nonnegative(),
    tokenCount: z.number().int().nonnegative(),
    costCount: z.number().int().nonnegative(),
    promptCount: z.number().int().nonnegative(),
    feedbackCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  traceSignals: z.array(z.object({
    signal: z.enum(["trace", "span", "observation", "generation", "root-span", "nested-span", "trace-id", "span-id", "run-tree", "dotted-order", "stream-event", "run-log-patch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    signal: z.enum(["observe-decorator", "openai-wrapper", "callback-handler", "langchain-tracer", "run-collector", "log-stream-handler", "event-stream-handler", "root-listener", "openinference", "opentelemetry", "otel-exporter", "tracer-provider", "auto-instrumentation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["user-id", "session-id", "conversation-id", "release", "environment", "tags", "metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  llmMetricSignals: z.array(z.object({
    signal: z.enum(["prompt-tokens", "completion-tokens", "total-tokens", "cost", "latency", "model-name", "provider", "cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  feedbackSignals: z.array(z.object({
    signal: z.enum(["score", "feedback", "annotation", "label", "manual-review", "thumbs-up-down", "quality", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  datasetExperimentSignals: z.array(z.object({
    signal: z.enum(["dataset", "experiment", "run", "prompt-version", "playground", "benchmark", "eval-link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  gatewaySignals: z.array(z.object({
    signal: z.enum(["base-url", "helicone-auth", "request-header", "property-header", "rate-limit", "retry", "provider-routing", "fallback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["masking", "redaction", "pii", "prompt-filter", "telemetry-opt-out", "data-retention", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["export", "api-client", "dashboard", "self-host", "docker-compose", "helm", "ci", "run-tree-map", "stream-filter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["langfuse", "phoenix", "arize-phoenix-otel", "openinference", "opentelemetry", "helicone", "@langchain/core", "langsmith", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const VectorDbReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  vectorSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["qdrant", "weaviate", "chroma", "pinecone", "milvus", "pgvector", "faiss", "langchain", "custom", "unknown"]),
    collectionCount: z.number().int().nonnegative(),
    vectorConfigCount: z.number().int().nonnegative(),
    embeddingCount: z.number().int().nonnegative(),
    upsertCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    hybridCount: z.number().int().nonnegative(),
    rerankCount: z.number().int().nonnegative(),
    tenantCount: z.number().int().nonnegative(),
    replicationCount: z.number().int().nonnegative(),
    snapshotCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  collectionSignals: z.array(z.object({
    signal: z.enum(["collection", "class", "schema", "vector-config", "distance", "dimensions", "hnsw", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["qdrant-client", "weaviate-client", "chromadb-client", "http-client", "persistent-client", "api-key", "endpoint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ingestionSignals: z.array(z.object({
    signal: z.enum(["add", "upsert", "batch", "ids", "documents", "metadata", "payload", "delete", "add-vectors", "from-texts", "from-documents", "memory-vector-store", "memory-vector-ids", "indexing-record-manager", "hashed-document", "indexing-batch", "indexing-deduplicate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["search", "query", "nearest-neighbor", "similarity", "hybrid", "full-text", "filter", "limit", "score", "similarity-with-score", "mmr", "as-retriever", "memory-query-vectors", "mmr-index-selection", "similarity-sort", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  embeddingSignals: z.array(z.object({
    signal: z.enum(["embedding-function", "vectorizer", "model-provider", "precomputed-vector", "sparse-vector", "multimodal", "text-splitter", "embed-documents", "embed-query", "custom-similarity-function", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  indexSignals: z.array(z.object({
    signal: z.enum(["hnsw", "quantization", "payload-index", "vector-index", "distance-metric", "shard", "replication", "consistency", "indexing-hash", "source-id-key", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["snapshot", "backup", "restore", "health", "metrics", "migration", "multi-tenancy", "ttl", "saveable-vectorstore", "from-existing-index", "incremental-cleanup", "full-cleanup", "force-update", "record-manager-keys", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["qdrant-client", "weaviate-client", "chromadb", "pinecone", "pymilvus", "pgvector", "faiss", "@langchain/core", "langchain", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SearchServiceReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  searchSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["meilisearch", "typesense", "opensearch", "elasticsearch", "algolia", "lunr", "custom", "unknown"]),
    indexCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    documentCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    facetCount: z.number().int().nonnegative(),
    rankingCount: z.number().int().nonnegative(),
    typoCount: z.number().int().nonnegative(),
    synonymCount: z.number().int().nonnegative(),
    geoCount: z.number().int().nonnegative(),
    opsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  indexSignals: z.array(z.object({
    signal: z.enum(["index", "collection", "schema", "mapping", "fields", "primary-key", "settings", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ingestionSignals: z.array(z.object({
    signal: z.enum(["document", "add", "import", "bulk", "upsert", "batch", "delete", "refresh", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["search", "q", "query-by", "match", "bool", "filter", "sort", "facet", "pagination", "highlight", "score", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  relevanceSignals: z.array(z.object({
    signal: z.enum(["typo-tolerance", "ranking-rules", "searchable-attributes", "filterable-attributes", "sortable-attributes", "synonyms", "stop-words", "distinct", "geo", "semantic-hybrid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["meilisearch-client", "typesense-client", "opensearch-client", "host", "api-key", "nodes", "timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["tasks", "health", "dump", "snapshot", "alias", "replica", "cluster", "analytics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["meilisearch", "typesense", "opensearch", "elasticsearch", "algolia", "instantsearch", "search-ui", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ObjectStorageReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  storageSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["s3", "minio", "r2", "gcs", "azure-blob", "supabase-storage", "local", "unknown"]),
    bucketCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    uploadCount: z.number().int().nonnegative(),
    downloadCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    deleteCount: z.number().int().nonnegative(),
    presignCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    replicationCount: z.number().int().nonnegative(),
    encryptionCount: z.number().int().nonnegative(),
    opsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  bucketSignals: z.array(z.object({
    signal: z.enum(["bucket", "region", "endpoint", "path-style", "public-private", "namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["s3-client", "minio-client", "r2-client", "gcs-client", "azure-blob-client", "supabase-storage-client", "credentials", "timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  objectSignals: z.array(z.object({
    signal: z.enum(["put-object", "upload", "multipart", "get-object", "download", "list-objects", "delete-object", "copy-object", "metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["signed-url", "presigned-post", "public-url", "policy", "acl", "cors", "rbac", "rls", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["versioning", "lifecycle", "retention", "object-lock", "replication", "checksum", "etag", "retry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["sse", "kms", "encryption", "secret-key", "least-privilege", "scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["health", "metrics", "backup", "restore", "migration", "event-notification", "queue", "cdn-cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["aws-sdk-s3", "lib-storage", "minio", "supabase-storage", "gcs", "azure-blob", "r2", "s3-compatible", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const RealtimeCollaborationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  collaborationSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["yjs", "automerge", "liveblocks", "socket-provider", "custom", "unknown"]),
    docCount: z.number().int().nonnegative(),
    sharedTypeCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    presenceCount: z.number().int().nonnegative(),
    syncCount: z.number().int().nonnegative(),
    persistenceCount: z.number().int().nonnegative(),
    conflictCount: z.number().int().nonnegative(),
    historyCount: z.number().int().nonnegative(),
    authCount: z.number().int().nonnegative(),
    commentsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  crdtSignals: z.array(z.object({
    signal: z.enum(["y-doc", "shared-map", "shared-array", "shared-text", "automerge-doc", "change", "merge", "conflict", "transaction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["websocket-provider", "indexeddb-provider", "liveblocks-provider", "room-provider", "yjs-provider", "broadcast-channel", "network-agnostic", "custom-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  presenceSignals: z.array(z.object({
    signal: z.enum(["awareness", "presence", "cursor", "avatars", "others", "self", "broadcast-event", "user-info", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  syncSignals: z.array(z.object({
    signal: z.enum(["encode-state", "apply-update", "sync-state", "sync-message", "save-load", "incremental-save", "heads", "patches", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  persistenceSignals: z.array(z.object({
    signal: z.enum(["indexeddb", "local-storage", "doc-handle", "repo", "save", "load", "storage-root", "snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  historySignals: z.array(z.object({
    signal: z.enum(["undo-manager", "undo", "redo", "history", "version", "heads", "patch-listener", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["auth-endpoint", "public-api-key", "room-id", "permission", "initial-presence", "initial-storage", "user-id", "token", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["yjs", "y-websocket", "y-indexeddb", "@automerge/automerge", "@automerge/automerge-repo", "@liveblocks/client", "@liveblocks/react", "@liveblocks/yjs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const WorkflowOrchestrationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  workflowSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["temporal", "inngest", "triggerdotdev", "cloudflare-workflows", "langgraph", "custom", "unknown"]),
    workflowCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    stepCount: z.number().int().nonnegative(),
    activityCount: z.number().int().nonnegative(),
    queueCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    waitCount: z.number().int().nonnegative(),
    cancelCount: z.number().int().nonnegative(),
    concurrencyCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  triggerSignals: z.array(z.object({
    signal: z.enum(["event", "cron", "schedule", "webhook", "manual", "api-trigger", "child-trigger", "graph-start", "thread-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["task", "workflow", "activity", "step", "worker", "task-queue", "function-run", "handler", "state-graph", "graph-node", "tool-node", "compiled-graph", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  durabilitySignals: z.array(z.object({
    signal: z.enum(["retry", "timeout", "heartbeat", "checkpoint", "state-store", "resume", "history", "continue-as-new", "idempotency", "checkpointer", "memory-saver", "resume-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  flowSignals: z.array(z.object({
    signal: z.enum(["wait", "sleep", "wait-for-event", "cancel", "batch", "concurrency", "rate-limit", "throttle", "priority", "child-workflow", "graph-edge", "conditional-edge", "start-end", "tool-loop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["dev-server", "deploy", "worker-pool", "isolated-runtime", "machine", "environment", "serve", "dashboard", "graph-invoke", "stream-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["logger", "tracing", "metadata", "tags", "run-status", "dashboard", "alerts", "metrics", "graph-state", "stream-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@temporalio/workflow", "@temporalio/worker", "@temporalio/client", "inngest", "@trigger.dev/sdk", "@trigger.dev/react", "cloudflare-workflows", "@langchain/langgraph", "@langchain/langgraph-checkpoint", "langchain", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const OpenApiClientReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  clientSetups: z.array(z.object({
    filePath: z.string(),
    generator: z.enum(["openapi-typescript", "orval", "openapi-generator", "swagger-codegen", "custom", "unknown"]),
    specCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    typeCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    mockCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    scriptCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  specSignals: z.array(z.object({
    signal: z.enum(["openapi", "swagger", "input-spec", "remote-schema", "multi-spec", "redocly-config", "schema-validation", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  generatorSignals: z.array(z.object({
    signal: z.enum(["openapi-typescript", "openapi-fetch", "orval", "openapi-generator", "swagger-codegen", "generator-name", "config-file", "cli-command", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["types", "client-sdk", "hooks", "schemas", "mocks", "zod", "msw", "server-stub", "docs", "split-output", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["fetch", "axios", "react-query", "swr", "angular", "vue", "svelte", "hono", "mcp", "custom-mutator", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["validate-spec", "lint", "snapshots", "generated-diff", "typecheck", "ci", "ignore-file", "templates", "security-review", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["openapi-typescript", "openapi-fetch", "orval", "@openapitools/openapi-generator-cli", "openapi-generator-cli", "swagger-codegen", "@hey-api/openapi-ts", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const WebhookReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  webhookSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["svix", "standard-webhooks", "hookdeck", "stripe", "github", "custom", "unknown"]),
    endpointCount: z.number().int().nonnegative(),
    signatureCount: z.number().int().nonnegative(),
    replayCount: z.number().int().nonnegative(),
    idempotencyCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    deliveryCount: z.number().int().nonnegative(),
    eventTypeCount: z.number().int().nonnegative(),
    localDebugCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  endpointSignals: z.array(z.object({
    signal: z.enum(["endpoint", "route", "source", "destination", "connection", "fan-out", "event-filter", "https", "status-code", "timeout", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  signatureSignals: z.array(z.object({
    signal: z.enum(["webhook-id", "webhook-timestamp", "webhook-signature", "hmac", "ed25519", "secret-prefix", "constant-time", "raw-body", "rotation", "asymmetric", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["retry", "retry-schedule", "backoff", "jitter", "delivery-attempt", "manual-replay", "idempotency", "dedupe-store", "disable-endpoint", "dead-letter", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  operationsSignals: z.array(z.object({
    signal: z.enum(["dashboard", "event-history", "request-log", "attempt-log", "failure-rate", "metrics", "issues", "alerts", "mcp", "cli-listen", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["svix", "standardwebhooks", "hookdeck-cli", "stripe", "@octokit/webhooks", "express", "next-server", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const NotificationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  notificationSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["novu", "knock", "magicbell", "firebase", "onesignal", "custom", "unknown"]),
    workflowCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    subscriberCount: z.number().int().nonnegative(),
    topicCount: z.number().int().nonnegative(),
    preferenceCount: z.number().int().nonnegative(),
    channelCount: z.number().int().nonnegative(),
    inboxCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    credentialCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["workflow", "trigger", "step", "digest", "delay", "condition", "payload", "tenant", "conversation", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  audienceSignals: z.array(z.object({
    signal: z.enum(["subscriber", "subscriber-id", "topic", "subscription", "preferences", "segments", "user-profile", "tenant", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  channelSignals: z.array(z.object({
    signal: z.enum(["inbox", "email", "sms", "push", "chat", "slack", "teams", "telegram", "whatsapp", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["template", "subject", "body", "editor", "variables", "localization", "branding", "preview", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  operationsSignals: z.array(z.object({
    signal: z.enum(["api-key", "environment", "webhook", "delivery-log", "activity-feed", "rate-limit", "retry", "analytics", "dashboard", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@novu/node", "@novu/js", "@novu/react", "@knocklabs/node", "@magicbell/react", "firebase-admin", "onesignal-node", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ConsentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  consentSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["cookieconsent", "klaro", "iab-tcf", "custom", "unknown"]),
    bannerCount: z.number().int().nonnegative(),
    modalCount: z.number().int().nonnegative(),
    categoryCount: z.number().int().nonnegative(),
    serviceCount: z.number().int().nonnegative(),
    purposeCount: z.number().int().nonnegative(),
    vendorCount: z.number().int().nonnegative(),
    scriptBlockingCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    localizationCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  bannerSignals: z.array(z.object({
    signal: z.enum(["banner", "modal", "accept-all", "accept-selected", "reject-all", "settings-button", "revision", "hide-from-bots", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  categorySignals: z.array(z.object({
    signal: z.enum(["necessary", "analytics", "marketing", "preferences", "functional", "performance", "services", "purposes", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scriptSignals: z.array(z.object({
    signal: z.enum(["data-src", "text-plain", "data-type", "data-name", "autoclear", "page-script", "disable-page-interaction", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["privacy-policy", "withdraw", "opt-out", "consent-mode", "gpc", "do-not-track", "legitimate-interest", "proof", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tcfSignals: z.array(z.object({
    signal: z.enum(["__tcfapi", "tc-string", "cmp-id", "vendor-list", "purpose-consents", "vendor-consents", "legitimate-interests", "gvl", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vanilla-cookieconsent", "klaro", "@iabtcf/core", "@iabtcf/cmpapi", "@iabtcf/stub", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PrivacyReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  privacySetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["presidio", "opendp", "scrubadub", "pii-scanner", "gdpr", "ccpa", "custom", "unknown"]),
    detectorCount: z.number().int().nonnegative(),
    anonymizerCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    retentionCount: z.number().int().nonnegative(),
    consentCount: z.number().int().nonnegative(),
    dsarCount: z.number().int().nonnegative(),
    differentialPrivacyCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  piiDetectionSignals: z.array(z.object({
    signal: z.enum(["presidio-analyzer", "pattern-recognizer", "recognizer-result", "scrubadub-detector", "email-phone-name-address", "score-threshold", "custom-entity", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  redactionSignals: z.array(z.object({
    signal: z.enum(["anonymizer-engine", "operator-config", "replace-mask-redact", "encrypt-decrypt", "surrogate-token", "scrubadub-post-processor", "hash-tokenize", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["privacy-policy", "data-classification", "data-minimization", "retention-policy", "deletion-policy", "dsar-export-delete", "consent-purpose", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  differentialPrivacySignals: z.array(z.object({
    signal: z.enum(["opendp-measurement", "privacy-map", "epsilon-delta", "laplace-gaussian-noise", "clamp-bounds", "privacy-budget", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["allow-list", "deny-list", "score-threshold", "locale", "nlp-engine", "operator-defaults", "database-field-map", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "privacy-scan-command", "pii-test-fixture", "redaction-artifact", "policy-check", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["presidio", "opendp", "scrubadub", "faker", "zod", "yup", "pydantic", "gdpr", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ServerFrameworkReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  serverSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["fastify", "express", "koa", "hono", "nestjs", "hapi", "custom", "unknown"]),
    routeCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    decoratorCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    listenCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  routeSignals: z.array(z.object({
    signal: z.enum(["get", "post", "put", "patch", "delete", "route", "all", "params", "prefix", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["body", "querystring", "params", "headers", "response", "add-schema", "validator-compiler", "serializer-compiler", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["register", "fastify-plugin", "autoload", "encapsulation", "plugin-options", "ready", "after", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["on-request", "pre-parsing", "pre-validation", "pre-handler", "pre-serialization", "on-send", "on-response", "on-error", "on-close", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["listen", "host", "port", "logger", "trust-proxy", "body-limit", "content-type-parser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["set-error-handler", "set-not-found-handler", "framework-errors", "validation-error", "reply-code", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["inject", "light-my-request", "supertest", "tap", "vitest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["fastify", "@fastify/autoload", "fastify-plugin", "express", "koa", "hono", "@nestjs/core", "@hapi/hapi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const RpcReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  rpcSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["trpc", "grpc", "connect", "json-rpc", "custom", "unknown"]),
    routerCount: z.number().int().nonnegative(),
    procedureCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    mutationCount: z.number().int().nonnegative(),
    subscriptionCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    middlewareCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    adapterCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  routerSignals: z.array(z.object({
    signal: z.enum(["init-trpc", "router", "nested-router", "merge-routers", "app-router", "app-router-type", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  procedureSignals: z.array(z.object({
    signal: z.enum(["procedure", "public-procedure", "protected-procedure", "query", "mutation", "subscription", "streaming", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["input", "output", "zod", "valibot", "superstruct", "standard-schema", "transformer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["context", "create-context", "middleware", "auth-guard", "meta", "next-ctx", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["create-client", "react-query", "next-client", "tanstack-options", "http-link", "batch-link", "subscription-link", "ws-link", "logger-link", "retry-link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  adapterSignals: z.array(z.object({
    signal: z.enum(["standalone", "next-api", "app-router", "express", "fastify", "fetch", "node-http", "websocket", "mcp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["trpc-error", "unauthorized", "forbidden", "not-found", "bad-request", "error-formatter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callerSignals: z.array(z.object({
    signal: z.enum(["create-caller", "create-caller-factory", "router-create-caller", "infer-router", "type-import", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@trpc/server", "@trpc/client", "@trpc/react-query", "@trpc/next", "@trpc/tanstack-react-query", "superjson", "zod", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const WorkspaceGraphReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  workspaceFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["nx-json", "project-json", "package-json", "pnpm-workspace", "lerna", "rush", "turbo", "moon", "workspace", "unknown"]),
    projectCount: z.number().int().nonnegative(),
    targetCount: z.number().int().nonnegative(),
    tagCount: z.number().int().nonnegative(),
    implicitDependencyCount: z.number().int().nonnegative(),
    namedInputCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  projectSignals: z.array(z.object({
    signal: z.enum(["project-json", "package-workspace", "apps-dir", "libs-dir", "packages-dir", "project-name", "source-root", "project-type", "tags", "implicit-dependencies", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  graphSignals: z.array(z.object({
    signal: z.enum(["project-graph", "create-project-graph", "read-project-graph", "nx-graph", "graph-file", "dependency-edge", "affected-graph", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundarySignals: z.array(z.object({
    signal: z.enum(["enforce-module-boundaries", "dep-constraints", "tags", "scopes", "lint-rule", "tsconfig-paths", "implicit-dependencies", "circular", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  affectedSignals: z.array(z.object({
    signal: z.enum(["nx-affected", "base-head", "affected-projects", "affected-target", "print-affected", "ci-affected", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["targets", "target-defaults", "named-inputs", "depends-on", "inputs", "outputs", "executor", "cache", "continuous", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["nx-plugin", "plugins", "create-nodes", "generators", "executors", "migrations", "inferred-tasks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nx", "@nx/workspace", "@nx/js", "@nx/eslint-plugin", "turbo", "pnpm-workspace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ScaffoldingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  generatorFiles: z.array(z.object({
    filePath: z.string(),
    generatorType: z.enum(["plopfile", "hygen", "yeoman", "schematic", "nx-generator", "template-dir", "package-script", "codemod", "unknown"]),
    generatorCount: z.number().int().nonnegative(),
    promptCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    helperCount: z.number().int().nonnegative(),
    partialCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  promptSignals: z.array(z.object({
    signal: z.enum(["input", "confirm", "list", "checkbox", "choices", "validate", "default", "bypass", "custom-prompt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["add", "add-many", "modify", "append", "custom-action", "dynamic-actions", "transform", "run-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["template-file", "template-dir", "handlebars", "ejs", "mustache", "partials", "helpers", "variables", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["skip-if-exists", "force", "abort-on-fail", "dry-run", "idempotent", "validation", "conflict-check", "snapshots", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["plop", "node-plop", "hygen", "yeoman-generator", "@angular-devkit/schematics", "jscodeshift", "ts-morph", "recast", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SchedulerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schedulerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["node-cron", "cron", "bree", "agenda", "bullmq-repeatable", "github-actions", "vercel-cron", "custom", "unknown"]),
    scheduleCount: z.number().int().nonnegative(),
    cronExpressionCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    timezoneCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    overlapControlCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  scheduleSignals: z.array(z.object({
    signal: z.enum(["cron-expression", "seconds-field", "interval", "fixed-date", "timezone", "validated-expression", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["inline-task", "background-task", "async-task", "named-task", "task-context", "manual-execute", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["start", "stop", "destroy", "create-task", "scheduled-false", "run-on-init", "registry", "events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["no-overlap", "max-executions", "retry", "lock", "idempotency", "error-handler", "logging", "graceful-shutdown", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["node-cron", "cron", "bree", "agenda", "bullmq", "toad-scheduler", "github-actions-cron", "vercel-cron", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BuildToolReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  buildToolSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["vite", "webpack", "rollup", "esbuild", "parcel", "next", "nuxt", "astro", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    devServerCount: z.number().int().nonnegative(),
    buildCount: z.number().int().nonnegative(),
    previewCount: z.number().int().nonnegative(),
    envCount: z.number().int().nonnegative(),
    ssrCount: z.number().int().nonnegative(),
    depOptimizationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["config-file", "define-config", "config-function", "mode-aware", "root-base", "resolve-alias", "env-dir", "cache-dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["plugins-array", "official-plugin", "custom-plugin", "enforce-order", "apply-scope", "config-resolved", "transform-index-html", "hmr-hook", "rollup-hook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  devServerSignals: z.array(z.object({
    signal: z.enum(["dev-server", "server-port", "proxy", "cors", "https", "open", "middleware-mode", "hmr", "warmup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["build-command", "out-dir", "sourcemap", "minify", "target", "library-mode", "manifest", "rollup-options", "assets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["env-prefix", "load-env", "import-meta-env", "mode", "base-url", "ssr-env", "dotenv", "define", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ssrSignals: z.array(z.object({
    signal: z.enum(["ssr-entry", "ssr-external", "ssr-no-external", "ssr-target", "ssr-manifest", "middleware-mode", "module-runner", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencyOptimizationSignals: z.array(z.object({
    signal: z.enum(["optimize-deps", "include", "exclude", "entries", "force", "cache-dir", "rolldown-options", "esbuild-options", "linked-package", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vite", "@vitejs/plugin-react", "@vitejs/plugin-vue", "webpack", "rollup", "esbuild", "parcel", "rolldown", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StylingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  stylingSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["tailwind", "unocss", "bootstrap", "sass", "postcss", "css-modules", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    directiveCount: z.number().int().nonnegative(),
    utilityCount: z.number().int().nonnegative(),
    themeCount: z.number().int().nonnegative(),
    variantCount: z.number().int().nonnegative(),
    contentScanCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    buildIntegrationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["config-file", "tailwind-config", "content-globs", "safelist", "dark-mode", "prefix", "important", "presets", "core-plugins", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  directiveSignals: z.array(z.object({
    signal: z.enum(["import-tailwind", "tailwind-directive", "theme-directive", "utility-directive", "variant-directive", "source-directive", "config-directive", "plugin-directive", "apply-directive", "layer-directive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  classSignals: z.array(z.object({
    signal: z.enum(["utility-class", "arbitrary-value", "variant-prefix", "responsive-prefix", "state-prefix", "group-peer", "dark-class", "important-modifier", "prefix-usage", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  themeSignals: z.array(z.object({
    signal: z.enum(["css-theme-vars", "colors", "spacing", "typography", "breakpoints", "container", "custom-property", "theme-function", "design-token-bridge", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    signal: z.enum(["postcss-plugin", "vite-plugin", "webpack-loader", "cli-command", "watch-mode", "build-script", "css-entry", "import-css", "lightning-css", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tailwindcss", "@tailwindcss/postcss", "@tailwindcss/vite", "@tailwindcss/cli", "@tailwindcss/forms", "@tailwindcss/typography", "@tailwindcss/oxide", "unocss", "bootstrap", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const VisualRegressionReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  visualRegressionSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["reg-suit", "argos", "chromatic", "percy", "playwright", "cypress", "webdriverio", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    actualCount: z.number().int().nonnegative(),
    expectedCount: z.number().int().nonnegative(),
    diffCount: z.number().int().nonnegative(),
    thresholdCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["regconfig", "actual-dir", "working-dir", "expected-dir", "diff-dir", "config-file", "ci-config", "package-script", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  snapshotSignals: z.array(z.object({
    signal: z.enum(["actual-images", "expected-images", "diff-images", "screenshots", "baseline-key", "sync-expected", "compare-command", "publish-command", "run-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  thresholdSignals: z.array(z.object({
    signal: z.enum(["threshold-rate", "threshold-pixel", "matching-threshold", "antialias", "ximgdiff", "concurrency", "failure-threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportSignals: z.array(z.object({
    signal: z.enum(["html-report", "diff-report", "comparison-result", "json-result", "report-url", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["keygen-git-hash", "simple-keygen", "publish-s3", "publish-gcs", "notify-github", "notify-gitlab", "notify-slack", "notify-chatwork", "custom-plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "circleci", "travis", "gitlab-ci", "ci-command", "detached-head", "artifact-cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["reg-suit", "reg-suit-core", "reg-suit-interface", "reg-keygen-git-hash-plugin", "reg-publish-s3-plugin", "reg-publish-gcs-plugin", "reg-notify-github-plugin", "@percy/cli", "@argos-ci/cli", "chromatic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const InfrastructureReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  infrastructureSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["opentofu", "terraform", "terragrunt", "pulumi", "cdk", "cloudformation", "helm", "kustomize", "custom", "unknown"]),
    terraformBlockCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    dataSourceCount: z.number().int().nonnegative(),
    moduleCount: z.number().int().nonnegative(),
    variableCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    backendCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["tf-file", "terraform-block", "required-providers", "required-version", "provider-block", "resource-block", "data-source", "module-block", "variable-block", "output-block", "locals-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["backend", "remote-state", "state-lock", "workspace", "terraform-lock-hcl", "state-file-warning", "state-encryption", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["init-command", "plan-command", "apply-command", "destroy-command", "import-command", "validate-command", "fmt-command", "test-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  moduleSignals: z.array(z.object({
    signal: z.enum(["source-url", "local-module", "registry-module", "provider-alias", "for-each", "count", "depends-on", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  variableSignals: z.array(z.object({
    signal: z.enum(["tfvars", "auto-tfvars", "sensitive-var", "validation", "default-value", "environment-var", "input-variable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["tflint", "tfsec", "checkov", "opa", "conftest", "sentinel", "infracost", "terraform-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["opentofu", "terraform", "terragrunt", "tflint", "tfsec", "checkov", "cdktf", "pulumi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const IacDriftReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  driftSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "package-script", "workflow", "readme", "unknown"]),
    inventoryCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    refreshCount: z.number().int().nonnegative(),
    planCount: z.number().int().nonnegative(),
    driftCount: z.number().int().nonnegative(),
    ignoreCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    remediationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "cloud-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["tfstate", "remote-state", "backend", "workspace", "stack", "state-lock", "import", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inventorySignals: z.array(z.object({
    signal: z.enum(["provider", "account", "region", "resource-address", "asset-inventory", "cloud-control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  refreshSignals: z.array(z.object({
    signal: z.enum(["refresh-only", "refresh", "pulumi-refresh", "state-pull", "drift-scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  planSignals: z.array(z.object({
    signal: z.enum(["plan", "detailed-exitcode", "out-plan", "pulumi-preview", "terragrunt-plan", "cost-diff", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  driftSignals: z.array(z.object({
    signal: z.enum(["changed", "missing", "unmanaged", "drift", "ignore-rules", "exit-code", "summary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  remediationSignals: z.array(z.object({
    signal: z.enum(["import", "state-rm", "state-mv", "pulumi-import", "apply-gated", "manual-review", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "sarif", "markdown", "html", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "scheduled-run", "pull-request", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "infracost", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DeploymentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  deploymentSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["helm", "kustomize", "kubernetes", "argo-cd", "flux", "skaffold", "kubectl", "custom", "unknown"]),
    chartMetadataCount: z.number().int().nonnegative(),
    valuesCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    manifestCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    releaseWorkflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  chartSignals: z.array(z.object({
    signal: z.enum(["chart-yaml", "api-version", "chart-name", "chart-version", "app-version", "chart-type", "dependencies", "chart-lock", "helmignore", "values-yaml", "values-schema", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["deployment", "service", "ingress", "configmap", "secret", "serviceaccount", "hpa", "notes", "helpers", "crd", "hooks", "tests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["values-file", "values-override", "set-flag", "set-string-flag", "set-file-flag", "set-json-flag", "schema-validation", "global-values", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["lint-command", "template-command", "install-command", "upgrade-command", "rollback-command", "uninstall-command", "test-command", "status-command", "history-command", "dependency-command", "package-command", "repo-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["dry-run", "wait", "rollback-on-failure", "no-hooks", "skip-crds", "disable-openapi-validation", "namespace", "kube-context", "create-namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["helm", "kustomize", "kubectl", "argo-cd", "flux", "skaffold", "chart-releaser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ServerlessReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  serverlessSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["serverless-framework", "aws-sam", "sst", "vercel-functions", "netlify-functions", "cloudflare-workers", "custom", "unknown"]),
    serviceCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    functionCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    environmentCount: z.number().int().nonnegative(),
    iamCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["serverless-yml", "service", "framework-version", "provider", "runtime", "stage", "region", "custom", "params", "variables", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  functionSignals: z.array(z.object({
    signal: z.enum(["functions", "handler", "timeout", "memory-size", "layers", "url", "reserved-concurrency", "provisioned-concurrency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["http", "http-api", "schedule", "event-bridge", "sqs", "sns", "s3", "stream", "websocket", "alb", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["nodejs", "python", "go", "java", "dotnet", "ruby", "arm64", "x86-64", "ephemeral-storage", "vpc", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["deploy", "deploy-function", "package", "remove", "invoke", "invoke-local", "info", "logs", "doctor", "offline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["iam-role-statements", "least-privilege", "environment", "secrets", "deployment-bucket", "rollback", "prune", "log-retention", "tracing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["serverless", "serverless-offline", "serverless-esbuild", "serverless-webpack", "serverless-prune-plugin", "serverless-domain-manager", "aws-sam", "sst", "vercel", "netlify", "wrangler", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MobileReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mobileSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["expo", "react-native", "eas", "bare-native", "capacitor", "unknown"]),
    appConfigCount: z.number().int().nonnegative(),
    platformCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    buildProfileCount: z.number().int().nonnegative(),
    updateCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["app-json", "app-config", "name", "slug", "version", "scheme", "extra", "plugins", "experiments", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["ios", "bundle-identifier", "android", "android-package", "native-ios-dir", "native-android-dir", "web", "permissions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["expo-router", "app-directory", "typed-routes", "deep-linking", "react-navigation", "entry-point", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["eas-json", "eas-build", "development-client", "internal-distribution", "submit", "auto-increment", "prebuild", "run-ios", "run-android", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["expo-updates", "runtime-version", "updates-url", "eas-update", "update-branch", "channel", "check-for-update", "fetch-update", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["icon", "adaptive-icon", "splash-screen", "favicon", "assets-directory", "font-assets", "image-assets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["expo", "react-native", "expo-router", "expo-dev-client", "expo-updates", "eas-cli", "react-native-web", "metro-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DesktopReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  desktopSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["tauri", "electron", "wails", "neutralino", "desktop-webview", "unknown"]),
    configCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    bundleCount: z.number().int().nonnegative(),
    updaterCount: z.number().int().nonnegative(),
    signingCount: z.number().int().nonnegative(),
    platformCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["tauri", "electron", "wails", "neutralino", "webview", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["tauri-conf", "wails-json", "electron-builder", "forge-config", "package-main", "cargo-manifest", "frontend-dist", "dev-url", "identifier", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["window", "multi-window", "tray", "menu", "dialog", "deep-link", "file-association", "custom-protocol", "ipc", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  permissionSignals: z.array(z.object({
    signal: z.enum(["tauri-capabilities", "permissions", "csp", "allowlist", "entitlements", "sandbox", "shell-open", "fs-scope", "global-tauri", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  bundleSignals: z.array(z.object({
    signal: z.enum(["bundle-targets", "icons", "resources", "macos", "windows", "linux", "dmg", "nsis", "appimage", "msi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["updater", "updater-artifacts", "signing", "notarization", "hardened-runtime", "ci-build", "artifact-upload", "release-draft", "version-sync", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tauri-cli", "tauri-api", "tauri-plugin", "electron", "electron-builder", "electron-forge", "electron-notarize", "wails", "wails-cli", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const EdgeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  edgeSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["cloudflare-workers", "wrangler", "pages-functions", "miniflare", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    handlerCount: z.number().int().nonnegative(),
    bindingCount: z.number().int().nonnegative(),
    routingCount: z.number().int().nonnegative(),
    devWorkflowCount: z.number().int().nonnegative(),
    deploymentWorkflowCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    packageCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["wrangler-toml", "wrangler-json", "name", "main", "compatibility-date", "compatibility-flags", "env", "vars", "limits", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  handlerSignals: z.array(z.object({
    signal: z.enum(["module-worker", "fetch-handler", "scheduled", "queue-handler", "durable-object-class", "workflow-class", "email-handler", "assets-worker", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  bindingSignals: z.array(z.object({
    signal: z.enum(["kv", "r2", "d1", "durable-objects", "queues", "services", "workflows", "analytics-engine", "secrets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routingSignals: z.array(z.object({
    signal: z.enum(["workers-dev", "route", "routes", "custom-domain", "assets", "site", "durable-object-migrations", "placement", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  devSignals: z.array(z.object({
    signal: z.enum(["wrangler-dev", "local-mode", "remote-bindings", "dev-vars", "miniflare", "vitest-pool-workers", "typegen", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deploymentSignals: z.array(z.object({
    signal: z.enum(["wrangler-deploy", "wrangler-versions", "wrangler-tail", "wrangler-secret", "wrangler-kv", "wrangler-r2", "wrangler-d1", "ci-deploy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["tail", "logs", "console", "traces", "analytics-engine", "version-metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["wrangler", "cloudflare-workers-types", "miniflare", "vitest-pool-workers", "vite-plugin-cloudflare", "workers-tsconfig", "kv-asset-handler", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ComposeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  composeSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["compose-yaml", "docker-compose-yaml", "override", "env-file", "package-script", "unknown"]),
    serviceCount: z.number().int().nonnegative(),
    buildCount: z.number().int().nonnegative(),
    imageCount: z.number().int().nonnegative(),
    portCount: z.number().int().nonnegative(),
    volumeCount: z.number().int().nonnegative(),
    networkCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    healthcheckCount: z.number().int().nonnegative(),
    envCount: z.number().int().nonnegative(),
    secretConfigCount: z.number().int().nonnegative(),
    profileCount: z.number().int().nonnegative(),
    commandCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["compose-yaml", "docker-compose-yaml", "override-file", "services", "name", "include", "extends", "x-extension", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serviceSignals: z.array(z.object({
    signal: z.enum(["build", "image", "command", "entrypoint", "ports", "expose", "restart", "profiles", "scale-deploy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["depends-on", "service-healthy", "healthcheck", "links", "external-network", "aliases", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["volumes", "bind-mounts", "named-volumes", "networks", "secrets", "configs", "env-file", "environment", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["config", "up", "down", "build", "run", "exec", "logs", "ps", "pull", "watch", "wait", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["healthcheck", "restart-policy", "profiles", "resource-limits", "read-only", "cap-drop", "security-opt", "secrets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["docker-compose-plugin", "docker-compose-v1", "compose-spec", "compose-watch", "dockerfile", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DevContainerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  devContainerSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["devcontainer-json", "devcontainer-lock", "feature-json", "template-json", "dockerfile", "compose-file", "package-script", "workflow", "unknown"]),
    configCount: z.number().int().nonnegative(),
    imageBuildCount: z.number().int().nonnegative(),
    featureCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    environmentCount: z.number().int().nonnegative(),
    mountCount: z.number().int().nonnegative(),
    portCount: z.number().int().nonnegative(),
    userCount: z.number().int().nonnegative(),
    customizationCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    lockfileCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["devcontainer-json", "devcontainer-lock", "name", "image", "build", "dockerfile", "docker-compose-file", "service", "workspace-folder", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  featureSignals: z.array(z.object({
    signal: z.enum(["features", "feature-json", "template-json", "installs-after", "options", "override-feature-install-order", "lockfile", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["initialize-command", "on-create-command", "update-content-command", "post-create-command", "post-start-command", "post-attach-command", "wait-for", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["container-env", "remote-env", "user-env-probe", "secrets", "remote-user", "container-user", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workspaceSignals: z.array(z.object({
    signal: z.enum(["workspace-folder", "workspace-mount", "mounts", "forward-ports", "ports-attributes", "other-ports-attributes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  customizationSignals: z.array(z.object({
    signal: z.enum(["customizations", "vscode-extensions", "vscode-settings", "codespaces", "dotfiles", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["devcontainer-up", "devcontainer-build", "devcontainer-exec", "read-configuration", "run-user-commands", "features-test", "features-package", "outdated", "upgrade", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["lockfile", "frozen-lockfile", "non-root-user", "cap-add", "security-opt", "privileged", "host-requirements", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["devcontainers-cli", "devcontainer-cli", "devcontainer-feature", "devcontainer-template", "vscode-dev-containers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const AdmissionPolicyReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  admissionSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["kyverno", "gatekeeper", "kubernetes-native", "webhook", "package-script", "workflow", "readme", "unknown"]),
    policyCount: z.number().int().nonnegative(),
    constraintCount: z.number().int().nonnegative(),
    webhookCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    mutationCount: z.number().int().nonnegative(),
    exceptionCount: z.number().int().nonnegative(),
    enforcementCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  controllerSignals: z.array(z.object({
    signal: z.enum(["kyverno", "gatekeeper", "validating-admission-policy", "mutating-admission-policy", "admission-webhook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["cluster-policy", "policy", "constraint-template", "constraint", "validating-admission-policy", "policy-binding", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ruleSignals: z.array(z.object({
    signal: z.enum(["validate", "mutate", "generate", "verify-images", "cel-expression", "rego-violation", "match-conditions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  enforcementSignals: z.array(z.object({
    signal: z.enum(["enforce", "audit", "warn", "dryrun", "failure-policy-fail", "failure-policy-ignore", "validation-actions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exceptionSignals: z.array(z.object({
    signal: z.enum(["policy-exception", "namespace-selector", "object-selector", "match-exclude", "exemptions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["kyverno-test", "kyverno-apply", "gator-test", "gator-verify", "conftest", "kubectl-dry-run", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["policy-report", "cluster-policy-report", "violations", "audit-results", "metrics", "events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "artifact-upload", "kyverno-cli", "gator-cli", "kubectl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kyverno", "gatekeeper", "opa", "kubernetes-client", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ApiGatewayReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  apiGatewaySetups: z.array(z.object({
    filePath: z.string(),
    gateway: z.enum(["kong", "tyk", "krakend", "cloud-api-gateway", "package-script", "workflow", "readme", "unknown"]),
    routeCount: z.number().int().nonnegative(),
    upstreamCount: z.number().int().nonnegative(),
    authCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    trafficPolicyCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    deploymentCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  gatewaySignals: z.array(z.object({
    signal: z.enum(["kong", "tyk", "krakend", "cloud-api-gateway", "reverse-proxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routeSignals: z.array(z.object({
    signal: z.enum(["service", "route", "endpoint", "listen-path", "path-method", "host", "strip-path", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  upstreamSignals: z.array(z.object({
    signal: z.enum(["upstream", "target", "backend", "host", "load-balancing", "health-check", "timeout", "circuit-breaker", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  authSignals: z.array(z.object({
    signal: z.enum(["key-auth", "jwt", "oauth2", "openid-connect", "acl", "mtls", "auth-configs", "keyless", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["plugin", "custom-middleware", "request-transformer", "response-transformer", "cors", "cache", "cel", "lua", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trafficPolicySignals: z.array(z.object({
    signal: z.enum(["rate-limiting", "quota", "throttle", "retry", "timeout", "circuit-breaker", "proxy-cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["prometheus", "metrics", "analytics", "tracing", "logs", "health", "status", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["deck", "deck-sync", "tyk-sync", "krakend-check", "krakend-test-plugin", "gateway-tests", "openapi", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "artifact-upload", "docker-compose", "helm", "kubernetes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kong", "deck", "tyk", "krakend", "lura", "gateway-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const KubernetesReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  kubernetesSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["manifest-yaml", "kustomization", "package-script", "workflow", "readme", "unknown"]),
    manifestCount: z.number().int().nonnegative(),
    workloadCount: z.number().int().nonnegative(),
    serviceCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    probeCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    autoscalingCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  manifestSignals: z.array(z.object({
    signal: z.enum(["api-version", "kind", "metadata", "labels", "annotations", "namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workloadSignals: z.array(z.object({
    signal: z.enum(["deployment", "statefulset", "daemonset", "job", "cronjob", "pod", "replicas", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  networkSignals: z.array(z.object({
    signal: z.enum(["service", "ingress", "network-policy", "ports", "selectors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["configmap", "secret", "env", "env-from", "image-pull-secret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["persistent-volume", "persistent-volume-claim", "volume-mount", "volume", "storage-class", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["service-account", "role", "role-binding", "cluster-role", "cluster-role-binding", "security-context", "pod-security-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  healthSignals: z.array(z.object({
    signal: z.enum(["readiness-probe", "liveness-probe", "startup-probe", "resources", "limits", "requests", "hpa", "pdb", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  kustomizeSignals: z.array(z.object({
    signal: z.enum(["kustomization", "resources", "bases", "patches", "configmap-generator", "secret-generator", "images", "replacements", "components", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["kubectl-apply", "kubectl-diff", "kubectl-wait", "kubectl-rollout", "kubectl-logs", "kubectl-describe", "kubectl-port-forward", "kubectl-delete", "kustomize-build", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kubectl", "kustomize", "kubernetes-yaml", "kind", "minikube", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const GitOpsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  gitopsSetups: z.array(z.object({
    filePath: z.string(),
    controller: z.enum(["argo-cd", "flux", "hybrid", "package-script", "workflow", "readme", "unknown"]),
    applicationCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    destinationCount: z.number().int().nonnegative(),
    syncPolicyCount: z.number().int().nonnegative(),
    generatorCount: z.number().int().nonnegative(),
    fluxSourceCount: z.number().int().nonnegative(),
    fluxReconcileCount: z.number().int().nonnegative(),
    imageAutomationCount: z.number().int().nonnegative(),
    notificationCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  argoSignals: z.array(z.object({
    signal: z.enum(["application", "applicationset", "app-project", "repo-url", "target-revision", "path", "destination-server", "destination-namespace", "sync-policy", "automated-sync", "prune", "self-heal", "sync-options", "helm-source", "kustomize-source", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fluxSourceSignals: z.array(z.object({
    signal: z.enum(["git-repository", "helm-repository", "oci-repository", "bucket", "source-ref", "interval", "secret-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fluxReconcileSignals: z.array(z.object({
    signal: z.enum(["kustomization", "helm-release", "depends-on", "prune", "suspend", "health-checks", "timeout", "retry-interval", "target-namespace", "service-account", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  imageNotificationSignals: z.array(z.object({
    signal: z.enum(["image-repository", "image-policy", "image-update-automation", "receiver", "alert", "provider", "webhook", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["argocd-app-sync", "argocd-app-diff", "argocd-app-wait", "argocd-app-get", "argocd-repo-add", "argocd-cluster-add", "flux-bootstrap", "flux-reconcile", "flux-get", "flux-suspend", "flux-resume", "flux-trace", "flux-tree", "flux-logs", "flux-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["dry-run", "namespace", "project-boundary", "sync-window", "allow-list", "deny-list", "signed-commit", "health-check", "drift-detection", "manual-approval", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["argocd", "argo-cd", "flux", "fluxcd", "source-controller", "kustomize-controller", "helm-controller", "notification-controller", "image-automation-controller", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BackupReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  backupSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["velero", "litestream", "restic", "hybrid", "script", "workflow", "readme", "unknown"]),
    backupCount: z.number().int().nonnegative(),
    restoreCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    retentionCount: z.number().int().nonnegative(),
    verificationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  veleroSignals: z.array(z.object({
    signal: z.enum(["backup", "schedule", "restore", "backup-storage-location", "volume-snapshot-location", "included-namespaces", "excluded-namespaces", "ttl", "storage-location", "volume-snapshot", "fs-backup", "backup-describe", "backup-logs", "restore-describe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  litestreamSignals: z.array(z.object({
    signal: z.enum(["config", "db-path", "replica-url", "s3", "gcs", "azure", "snapshot-interval", "snapshot-retention", "replicate-command", "restore-command", "database-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resticSignals: z.array(z.object({
    signal: z.enum(["repository", "password-file", "init", "backup-command", "snapshots-command", "restore-command", "forget-prune", "check", "tags", "exclude", "read-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  restoreDrillSignals: z.array(z.object({
    signal: z.enum(["restore-runbook", "restore-command", "point-in-time", "wait", "describe", "logs", "integrity-check", "read-data", "target-path", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["retention-policy", "encrypted-secret", "namespace-scope", "storage-location", "snapshot-location", "verification-check", "prune-policy", "restore-drill", "external-repository", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["velero", "litestream", "restic", "backup-script", "cron", "workflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ComponentGraphReportSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(["root", "folder", "file", "term", "rebuild-step"]),
    label: z.string(),
    path: z.string().nullable(),
    summary: z.string(),
    href: z.string().nullable()
  })),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string()
  })),
  summary: z.object({
    totalNodes: z.number().int().nonnegative(),
    totalEdges: z.number().int().nonnegative(),
    nodeTypeCounts: z.record(z.string(), z.number().int().nonnegative()),
    edgeLabelCounts: z.record(z.string(), z.number().int().nonnegative()),
    topConnectedNodes: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.string(),
      degree: z.number().int().nonnegative()
    })),
    largeRepoAdvice: z.string()
  }),
  entryNodeIds: z.array(z.string()),
  mermaid: z.string(),
  beginnerExplanation: z.string()
});

export const SourceSnapshotReportSchema = z.object({
  createdAt: z.string(),
  totalFiles: z.number().int().nonnegative(),
  files: z.array(z.object({
    filePath: z.string(),
    size: z.number().int().nonnegative(),
    sha256: z.string(),
    tracked: z.boolean()
  }))
});

export const IncrementalReportSchema = z.object({
  baselineSessionId: z.string().nullable(),
  baselinePath: z.string().nullable(),
  addedFiles: z.array(z.string()),
  changedFiles: z.array(z.string()),
  removedFiles: z.array(z.string()),
  unchangedFiles: z.array(z.string()),
  coverageDelta: z.object({
    baselineCoverageRatio: z.number().min(0).max(1).nullable(),
    currentCoverageRatio: z.number().min(0).max(1),
    coverageRatioDelta: z.number().min(-1).max(1).nullable(),
    baselineCoveredImportantFiles: z.number().int().nonnegative().nullable(),
    currentCoveredImportantFiles: z.number().int().nonnegative(),
    coveredImportantFilesDelta: z.number().int().nullable(),
    baselineTotalScannedFiles: z.number().int().nonnegative().nullable(),
    currentTotalScannedFiles: z.number().int().nonnegative(),
    totalScannedFilesDelta: z.number().int().nullable(),
    summary: z.string()
  }),
  summary: z.string(),
  beginnerExplanation: z.string()
});

export const FlowReportSchema = z.object({
  startPoints: z.array(z.string()),
  cliFlow: z.array(z.string()),
  appFlow: z.array(z.string()),
  dataFlow: z.array(z.string()),
  mermaid: z.string()
});

export const GlossaryTermSchema = z.object({
  termKo: z.string(),
  termEn: z.string(),
  simpleDefinition: z.string(),
  projectSpecificMeaning: z.string(),
  exampleFromRepo: z.string(),
  relatedTerms: z.array(z.string()),
  difficulty: z.enum(["easy", "medium", "hard"]),
  reviewPriority: z.number().int().min(1).max(5)
});

export const RebuildRoadmapSchema = z.object({
  steps: z.array(z.object({
    order: z.number().int().positive(),
    title: z.string(),
    goal: z.string(),
    tasks: z.array(z.string()),
    whyNeeded: z.string(),
    relatedSourcePaths: z.array(z.string()),
    expectedMistakes: z.array(z.string()),
    completionCriteria: z.array(z.string())
  }))
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  section: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  question: z.string(),
  choices: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string()
  }),
  correctChoice: z.enum(["A", "B", "C", "D"]),
  explanation: z.string(),
  whyOtherChoicesAreWrong: z.record(z.enum(["A", "B", "C", "D"]), z.string()),
  relatedLessonPath: z.string(),
  relatedHtmlAnchor: z.string(),
  glossaryTerms: z.array(z.string()),
  reviewPriority: z.number().int().min(1).max(5)
});

export const QuizSchema = z.object({
  sessionId: z.string(),
  generatedAt: z.string(),
  totalQuestions: z.number().int().positive(),
  questions: z.array(QuizQuestionSchema)
});

export const QuizAttemptSchema = z.object({
  attemptId: z.string(),
  sessionId: z.string(),
  createdAt: z.string(),
  answers: z.record(z.string(), z.enum(["A", "B", "C", "D"])),
  totalQuestions: z.number().int().positive(),
  correctCount: z.number().int().nonnegative(),
  wrongCount: z.number().int().nonnegative(),
  score: z.number().min(0).max(100),
  wrongQuestionIds: z.array(z.string())
});

export const WrongNoteSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  selectedChoice: z.enum(["A", "B", "C", "D"]),
  correctChoice: z.enum(["A", "B", "C", "D"]),
  explanation: z.string(),
  mistakeReason: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
  relatedFolderOrFile: z.string(),
  relatedLessonPath: z.string(),
  reviewText: z.string(),
  miniLesson: z.string(),
  retryQuestion: QuizQuestionSchema,
  createdAt: z.string(),
  attemptNumber: z.number().int().positive(),
  resolved: z.boolean()
});

export const HtmlExportManifestSchema = z.object({
  sessionId: z.string(),
  generatedAt: z.string(),
  manifestPath: z.string(),
  readmePath: z.string(),
  entrypoints: z.array(z.object({
    label: z.string(),
    path: z.string(),
    description: z.string()
  })),
  pages: z.array(z.object({
    name: z.string(),
    path: z.string(),
    title: z.string(),
    bytes: z.number().int().nonnegative(),
    sha256: z.string()
  })),
  assets: z.array(z.object({
    path: z.string(),
    bytes: z.number().int().nonnegative(),
    sha256: z.string()
  })),
  integrity: z.object({
    algorithm: z.literal("sha256"),
    coveredFiles: z.number().int().nonnegative()
  })
});

export const CodexRunLogSchema = z.object({
  taskName: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  status: z.enum(["success", "failed", "skipped"]),
  promptPath: z.string().nullable(),
  outputPath: z.string().nullable(),
  validationErrors: z.array(z.string())
});

export type StudyMode = z.infer<typeof StudyModeSchema>;
export type LearnerLevel = z.infer<typeof LearnerLevelSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type SourceInput = z.infer<typeof SourceInputSchema>;
export type StudySession = z.infer<typeof StudySessionSchema>;
export type RepoMap = z.infer<typeof RepoMapSchema>;
export type LanguageReport = z.infer<typeof LanguageReportSchema>;
export type DependencyReport = z.infer<typeof DependencyReportSchema>;
export type PurposeReport = z.infer<typeof PurposeReportSchema>;
export type ArchitectureReport = z.infer<typeof ArchitectureReportSchema>;
export type FolderLesson = z.infer<typeof FolderLessonSchema>;
export type FileLesson = z.infer<typeof FileLessonSchema>;
export type CoverageReport = z.infer<typeof CoverageReportSchema>;
export type EvidenceIndexReport = z.infer<typeof EvidenceIndexReportSchema>;
export type SuggestedReadsReport = z.infer<typeof SuggestedReadsReportSchema>;
export type RuntimeEnvironmentReport = z.infer<typeof RuntimeEnvironmentReportSchema>;
export type InterfaceMapReport = z.infer<typeof InterfaceMapReportSchema>;
export type SymbolMapReport = z.infer<typeof SymbolMapReportSchema>;
export type ApiReferenceReport = z.infer<typeof ApiReferenceReportSchema>;
export type ContextPackReport = z.infer<typeof ContextPackReportSchema>;
export type McpHandoffReport = z.infer<typeof McpHandoffReportSchema>;
export type AgentMemoryReport = z.infer<typeof AgentMemoryReportSchema>;
export type GraphQueryReport = z.infer<typeof GraphQueryReportSchema>;
export type TutorialAbstractionReport = z.infer<typeof TutorialAbstractionReportSchema>;
export type DecisionRecordReport = z.infer<typeof DecisionRecordReportSchema>;
export type DependencyHealthReport = z.infer<typeof DependencyHealthReportSchema>;
export type SearchIndexReport = z.infer<typeof SearchIndexReportSchema>;
export type LearningJournalReport = z.infer<typeof LearningJournalReportSchema>;
export type ProjectActivityReport = z.infer<typeof ProjectActivityReportSchema>;
export type CodeMetricsReadinessReport = z.infer<typeof CodeMetricsReadinessReportSchema>;
export type CodeOwnershipReadinessReport = z.infer<typeof CodeOwnershipReadinessReportSchema>;
export type LargeAssetReadinessReport = z.infer<typeof LargeAssetReadinessReportSchema>;
export type LicenseRightsReport = z.infer<typeof LicenseRightsReportSchema>;
export type SbomReport = z.infer<typeof SbomReportSchema>;
export type SecurityReadinessReport = z.infer<typeof SecurityReadinessReportSchema>;
export type SastReadinessReport = z.infer<typeof SastReadinessReportSchema>;
export type DastReadinessReport = z.infer<typeof DastReadinessReportSchema>;
export type ThreatModelReadinessReport = z.infer<typeof ThreatModelReadinessReportSchema>;
export type ScorecardReport = z.infer<typeof ScorecardReportSchema>;
export type ProvenanceReport = z.infer<typeof ProvenanceReportSchema>;
export type AdvisoryReport = z.infer<typeof AdvisoryReportSchema>;
export type VexReport = z.infer<typeof VexReportSchema>;
export type PolicyGateReport = z.infer<typeof PolicyGateReportSchema>;
export type ApiContractReport = z.infer<typeof ApiContractReportSchema>;
export type ConsumerContractReadinessReport = z.infer<typeof ConsumerContractReadinessReportSchema>;
export type ObservabilityReport = z.infer<typeof ObservabilityReportSchema>;
export type PerformanceReport = z.infer<typeof PerformanceReportSchema>;
export type ProfilingReadinessReport = z.infer<typeof ProfilingReadinessReportSchema>;
export type TracingReadinessReport = z.infer<typeof TracingReadinessReportSchema>;
export type DebugReadinessReport = z.infer<typeof DebugReadinessReportSchema>;
export type CrashReportingReadinessReport = z.infer<typeof CrashReportingReadinessReportSchema>;
export type IncidentResponseReadinessReport = z.infer<typeof IncidentResponseReadinessReportSchema>;
export type SloReadinessReport = z.infer<typeof SloReadinessReportSchema>;
export type CostReadinessReport = z.infer<typeof CostReadinessReportSchema>;
export type ProgressiveDeliveryReadinessReport = z.infer<typeof ProgressiveDeliveryReadinessReportSchema>;
export type LoadTestingReadinessReport = z.infer<typeof LoadTestingReadinessReportSchema>;
export type BenchmarkReadinessReport = z.infer<typeof BenchmarkReadinessReportSchema>;
export type E2eReport = z.infer<typeof E2eReportSchema>;
export type FlakyTestReadinessReport = z.infer<typeof FlakyTestReadinessReportSchema>;
export type TestImpactReadinessReport = z.infer<typeof TestImpactReadinessReportSchema>;
export type TestReportingReadinessReport = z.infer<typeof TestReportingReadinessReportSchema>;
export type SnapshotReadinessReport = z.infer<typeof SnapshotReadinessReportSchema>;
export type PropertyBasedTestingReadinessReport = z.infer<typeof PropertyBasedTestingReadinessReportSchema>;
export type FuzzReadinessReport = z.infer<typeof FuzzReadinessReportSchema>;
export type TestDataReadinessReport = z.infer<typeof TestDataReadinessReportSchema>;
export type IntegrationTestEnvironmentReadinessReport = z.infer<typeof IntegrationTestEnvironmentReadinessReportSchema>;
export type ChaosEngineeringReadinessReport = z.infer<typeof ChaosEngineeringReadinessReportSchema>;
export type AccessibilityReport = z.infer<typeof AccessibilityReportSchema>;
export type StorybookReport = z.infer<typeof StorybookReportSchema>;
export type DesignTokensReport = z.infer<typeof DesignTokensReportSchema>;
export type I18nReport = z.infer<typeof I18nReportSchema>;
export type ReleaseReadinessReport = z.infer<typeof ReleaseReadinessReportSchema>;
export type SecretReadinessReport = z.infer<typeof SecretReadinessReportSchema>;
export type SecretManagementReadinessReport = z.infer<typeof SecretManagementReadinessReportSchema>;
export type ContainerReadinessReport = z.infer<typeof ContainerReadinessReportSchema>;
export type ContainerScanReadinessReport = z.infer<typeof ContainerScanReadinessReportSchema>;
export type CodeQualityReport = z.infer<typeof CodeQualityReportSchema>;
export type DocumentationReport = z.infer<typeof DocumentationReportSchema>;
export type DatabaseReadinessReport = z.infer<typeof DatabaseReadinessReportSchema>;
export type DatabaseMigrationReadinessReport = z.infer<typeof DatabaseMigrationReadinessReportSchema>;
export type DatabaseOrmReadinessReport = z.infer<typeof DatabaseOrmReadinessReportSchema>;
export type DataTransformationReadinessReport = z.infer<typeof DataTransformationReadinessReportSchema>;
export type DataQualityReadinessReport = z.infer<typeof DataQualityReadinessReportSchema>;
export type DataLineageReadinessReport = z.infer<typeof DataLineageReadinessReportSchema>;
export type DataCatalogReadinessReport = z.infer<typeof DataCatalogReadinessReportSchema>;
export type DataAnnotationReadinessReport = z.infer<typeof DataAnnotationReadinessReportSchema>;
export type LakehouseTableReadinessReport = z.infer<typeof LakehouseTableReadinessReportSchema>;
export type FeatureStoreReadinessReport = z.infer<typeof FeatureStoreReadinessReportSchema>;
export type ModelRegistryReadinessReport = z.infer<typeof ModelRegistryReadinessReportSchema>;
export type ExperimentTrackingReadinessReport = z.infer<typeof ExperimentTrackingReadinessReportSchema>;
export type ModelMonitoringReadinessReport = z.infer<typeof ModelMonitoringReadinessReportSchema>;
export type ModelServingReadinessReport = z.infer<typeof ModelServingReadinessReportSchema>;
export type ModelTrainingReadinessReport = z.infer<typeof ModelTrainingReadinessReportSchema>;
export type CiCdReport = z.infer<typeof CiCdReportSchema>;
export type UnitTestReport = z.infer<typeof UnitTestReportSchema>;
export type CoverageReadinessReport = z.infer<typeof CoverageReadinessReportSchema>;
export type MutationTestingReadinessReport = z.infer<typeof MutationTestingReadinessReportSchema>;
export type TypecheckReadinessReport = z.infer<typeof TypecheckReadinessReportSchema>;
export type PackageManagerReport = z.infer<typeof PackageManagerReportSchema>;
export type GitHooksReport = z.infer<typeof GitHooksReportSchema>;
export type TaskRunnerReport = z.infer<typeof TaskRunnerReportSchema>;
export type DependencyUpdateReport = z.infer<typeof DependencyUpdateReportSchema>;
export type DependencyReviewReadinessReport = z.infer<typeof DependencyReviewReadinessReportSchema>;
export type LintReadinessReport = z.infer<typeof LintReadinessReportSchema>;
export type FormatReadinessReport = z.infer<typeof FormatReadinessReportSchema>;
export type CommitConventionReport = z.infer<typeof CommitConventionReportSchema>;
export type ChangelogReadinessReport = z.infer<typeof ChangelogReadinessReportSchema>;
export type BundleAnalysisReport = z.infer<typeof BundleAnalysisReportSchema>;
export type MockingReadinessReport = z.infer<typeof MockingReadinessReportSchema>;
export type DataFetchingReadinessReport = z.infer<typeof DataFetchingReadinessReportSchema>;
export type RoutingReadinessReport = z.infer<typeof RoutingReadinessReportSchema>;
export type StateManagementReadinessReport = z.infer<typeof StateManagementReadinessReportSchema>;
export type FormReadinessReport = z.infer<typeof FormReadinessReportSchema>;
export type AuthReadinessReport = z.infer<typeof AuthReadinessReportSchema>;
export type AuthorizationReadinessReport = z.infer<typeof AuthorizationReadinessReportSchema>;
export type PaymentReadinessReport = z.infer<typeof PaymentReadinessReportSchema>;
export type EmailReadinessReport = z.infer<typeof EmailReadinessReportSchema>;
export type QueueReadinessReport = z.infer<typeof QueueReadinessReportSchema>;
export type EventStreamReadinessReport = z.infer<typeof EventStreamReadinessReportSchema>;
export type SchemaRegistryReadinessReport = z.infer<typeof SchemaRegistryReadinessReportSchema>;
export type DataConnectorReadinessReport = z.infer<typeof DataConnectorReadinessReportSchema>;
export type SemanticLayerReadinessReport = z.infer<typeof SemanticLayerReadinessReportSchema>;
export type BiDashboardReadinessReport = z.infer<typeof BiDashboardReadinessReportSchema>;
export type StreamProcessingReadinessReport = z.infer<typeof StreamProcessingReadinessReportSchema>;
export type PipelineOrchestrationReadinessReport = z.infer<typeof PipelineOrchestrationReadinessReportSchema>;
export type ServiceMeshReadinessReport = z.infer<typeof ServiceMeshReadinessReportSchema>;
export type IngressControllerReadinessReport = z.infer<typeof IngressControllerReadinessReportSchema>;
export type DnsReadinessReport = z.infer<typeof DnsReadinessReportSchema>;
export type CertificateReadinessReport = z.infer<typeof CertificateReadinessReportSchema>;
export type HelmReadinessReport = z.infer<typeof HelmReadinessReportSchema>;
export type AdmissionPolicyReadinessReport = z.infer<typeof AdmissionPolicyReadinessReportSchema>;
export type ApiGatewayReadinessReport = z.infer<typeof ApiGatewayReadinessReportSchema>;
export type CacheReadinessReport = z.infer<typeof CacheReadinessReportSchema>;
export type LoggingReadinessReport = z.infer<typeof LoggingReadinessReportSchema>;
export type FeatureFlagReadinessReport = z.infer<typeof FeatureFlagReadinessReportSchema>;
export type RateLimitReadinessReport = z.infer<typeof RateLimitReadinessReportSchema>;
export type ErrorTrackingReadinessReport = z.infer<typeof ErrorTrackingReadinessReportSchema>;
export type AnalyticsReadinessReport = z.infer<typeof AnalyticsReadinessReportSchema>;
export type HttpClientReadinessReport = z.infer<typeof HttpClientReadinessReportSchema>;
export type SchemaValidationReadinessReport = z.infer<typeof SchemaValidationReadinessReportSchema>;
export type DateTimeReadinessReport = z.infer<typeof DateTimeReadinessReportSchema>;
export type IdGenerationReadinessReport = z.infer<typeof IdGenerationReadinessReportSchema>;
export type ImageProcessingReadinessReport = z.infer<typeof ImageProcessingReadinessReportSchema>;
export type FileUploadReadinessReport = z.infer<typeof FileUploadReadinessReportSchema>;
export type WebSocketReadinessReport = z.infer<typeof WebSocketReadinessReportSchema>;
export type RealtimeMediaReadinessReport = z.infer<typeof RealtimeMediaReadinessReportSchema>;
export type PdfGenerationReadinessReport = z.infer<typeof PdfGenerationReadinessReportSchema>;
export type SpreadsheetReadinessReport = z.infer<typeof SpreadsheetReadinessReportSchema>;
export type ChartVisualizationReadinessReport = z.infer<typeof ChartVisualizationReadinessReportSchema>;
export type MarkdownCodeRenderingReadinessReport = z.infer<typeof MarkdownCodeRenderingReadinessReportSchema>;
export type NotebookReadinessReport = z.infer<typeof NotebookReadinessReportSchema>;
export type MapVisualizationReadinessReport = z.infer<typeof MapVisualizationReadinessReportSchema>;
export type DiagramRenderingReadinessReport = z.infer<typeof DiagramRenderingReadinessReportSchema>;
export type LinkIntegrityReadinessReport = z.infer<typeof LinkIntegrityReadinessReportSchema>;
export type SeoMetadataReadinessReport = z.infer<typeof SeoMetadataReadinessReportSchema>;
export type PwaReadinessReport = z.infer<typeof PwaReadinessReportSchema>;
export type BrowserCompatibilityReadinessReport = z.infer<typeof BrowserCompatibilityReadinessReportSchema>;
export type BrowserExtensionReadinessReport = z.infer<typeof BrowserExtensionReadinessReportSchema>;
export type EnvValidationReadinessReport = z.infer<typeof EnvValidationReadinessReportSchema>;
export type SecurityHeadersReadinessReport = z.infer<typeof SecurityHeadersReadinessReportSchema>;
export type GraphqlReadinessReport = z.infer<typeof GraphqlReadinessReportSchema>;
export type CliReadinessReport = z.infer<typeof CliReadinessReportSchema>;
export type TerminalUiReadinessReport = z.infer<typeof TerminalUiReadinessReportSchema>;
export type StateMachineReadinessReport = z.infer<typeof StateMachineReadinessReportSchema>;
export type AnimationReadinessReport = z.infer<typeof AnimationReadinessReportSchema>;
export type DragAndDropReadinessReport = z.infer<typeof DragAndDropReadinessReportSchema>;
export type RichTextEditorReadinessReport = z.infer<typeof RichTextEditorReadinessReportSchema>;
export type CommandPaletteReadinessReport = z.infer<typeof CommandPaletteReadinessReportSchema>;
export type GuidedTourReadinessReport = z.infer<typeof GuidedTourReadinessReportSchema>;
export type DataTableReadinessReport = z.infer<typeof DataTableReadinessReportSchema>;
export type CalendarReadinessReport = z.infer<typeof CalendarReadinessReportSchema>;
export type DialogReadinessReport = z.infer<typeof DialogReadinessReportSchema>;
export type PopoverTooltipReadinessReport = z.infer<typeof PopoverTooltipReadinessReportSchema>;
export type MenuDropdownReadinessReport = z.infer<typeof MenuDropdownReadinessReportSchema>;
export type ToastSnackbarReadinessReport = z.infer<typeof ToastSnackbarReadinessReportSchema>;
export type TabsAccordionReadinessReport = z.infer<typeof TabsAccordionReadinessReportSchema>;
export type CheckboxRadioSwitchReadinessReport = z.infer<typeof CheckboxRadioSwitchReadinessReportSchema>;
export type SliderProgressReadinessReport = z.infer<typeof SliderProgressReadinessReportSchema>;
export type SelectComboboxReadinessReport = z.infer<typeof SelectComboboxReadinessReportSchema>;
export type ToolbarToggleReadinessReport = z.infer<typeof ToolbarToggleReadinessReportSchema>;
export type ScrollAreaReadinessReport = z.infer<typeof ScrollAreaReadinessReportSchema>;
export type AvatarReadinessReport = z.infer<typeof AvatarReadinessReportSchema>;
export type PinInputReadinessReport = z.infer<typeof PinInputReadinessReportSchema>;
export type PaginationReadinessReport = z.infer<typeof PaginationReadinessReportSchema>;
export type NumberInputReadinessReport = z.infer<typeof NumberInputReadinessReportSchema>;
export type RatingGroupReadinessReport = z.infer<typeof RatingGroupReadinessReportSchema>;
export type ColorPickerReadinessReport = z.infer<typeof ColorPickerReadinessReportSchema>;
export type SplitterReadinessReport = z.infer<typeof SplitterReadinessReportSchema>;
export type TagsInputReadinessReport = z.infer<typeof TagsInputReadinessReportSchema>;
export type ClipboardReadinessReport = z.infer<typeof ClipboardReadinessReportSchema>;
export type QrCodeReadinessReport = z.infer<typeof QrCodeReadinessReportSchema>;
export type TimerReadinessReport = z.infer<typeof TimerReadinessReportSchema>;
export type StepsReadinessReport = z.infer<typeof StepsReadinessReportSchema>;
export type CarouselReadinessReport = z.infer<typeof CarouselReadinessReportSchema>;
export type TreeViewReadinessReport = z.infer<typeof TreeViewReadinessReportSchema>;
export type CollapsibleReadinessReport = z.infer<typeof CollapsibleReadinessReportSchema>;
export type EditableReadinessReport = z.infer<typeof EditableReadinessReportSchema>;
export type PasswordInputReadinessReport = z.infer<typeof PasswordInputReadinessReportSchema>;
export type SignaturePadReadinessReport = z.infer<typeof SignaturePadReadinessReportSchema>;
export type AngleSliderReadinessReport = z.infer<typeof AngleSliderReadinessReportSchema>;
export type CascadeSelectReadinessReport = z.infer<typeof CascadeSelectReadinessReportSchema>;
export type AsyncListReadinessReport = z.infer<typeof AsyncListReadinessReportSchema>;
export type ImageCropperReadinessReport = z.infer<typeof ImageCropperReadinessReportSchema>;
export type ListboxReadinessReport = z.infer<typeof ListboxReadinessReportSchema>;
export type DatePickerReadinessReport = z.infer<typeof DatePickerReadinessReportSchema>;
export type MarqueeReadinessReport = z.infer<typeof MarqueeReadinessReportSchema>;
export type TocReadinessReport = z.infer<typeof TocReadinessReportSchema>;
export type FloatingPanelReadinessReport = z.infer<typeof FloatingPanelReadinessReportSchema>;
export type DrawerReadinessReport = z.infer<typeof DrawerReadinessReportSchema>;
export type HoverCardReadinessReport = z.infer<typeof HoverCardReadinessReportSchema>;
export type NavigationMenuReadinessReport = z.infer<typeof NavigationMenuReadinessReportSchema>;
export type PresenceReadinessReport = z.infer<typeof PresenceReadinessReportSchema>;
export type MenuReadinessReport = z.infer<typeof MenuReadinessReportSchema>;
export type TooltipReadinessReport = z.infer<typeof TooltipReadinessReportSchema>;
export type LlmReadinessReport = z.infer<typeof LlmReadinessReportSchema>;
export type LlmEvalReadinessReport = z.infer<typeof LlmEvalReadinessReportSchema>;
export type LlmObservabilityReadinessReport = z.infer<typeof LlmObservabilityReadinessReportSchema>;
export type VectorDbReadinessReport = z.infer<typeof VectorDbReadinessReportSchema>;
export type SearchServiceReadinessReport = z.infer<typeof SearchServiceReadinessReportSchema>;
export type ObjectStorageReadinessReport = z.infer<typeof ObjectStorageReadinessReportSchema>;
export type RealtimeCollaborationReadinessReport = z.infer<typeof RealtimeCollaborationReadinessReportSchema>;
export type WorkflowOrchestrationReadinessReport = z.infer<typeof WorkflowOrchestrationReadinessReportSchema>;
export type OpenApiClientReadinessReport = z.infer<typeof OpenApiClientReadinessReportSchema>;
export type WebhookReadinessReport = z.infer<typeof WebhookReadinessReportSchema>;
export type NotificationReadinessReport = z.infer<typeof NotificationReadinessReportSchema>;
export type ConsentReadinessReport = z.infer<typeof ConsentReadinessReportSchema>;
export type PrivacyReadinessReport = z.infer<typeof PrivacyReadinessReportSchema>;
export type ServerFrameworkReadinessReport = z.infer<typeof ServerFrameworkReadinessReportSchema>;
export type RpcReadinessReport = z.infer<typeof RpcReadinessReportSchema>;
export type WorkspaceGraphReadinessReport = z.infer<typeof WorkspaceGraphReadinessReportSchema>;
export type ScaffoldingReadinessReport = z.infer<typeof ScaffoldingReadinessReportSchema>;
export type SchedulerReadinessReport = z.infer<typeof SchedulerReadinessReportSchema>;
export type BuildToolReadinessReport = z.infer<typeof BuildToolReadinessReportSchema>;
export type StylingReadinessReport = z.infer<typeof StylingReadinessReportSchema>;
export type VisualRegressionReadinessReport = z.infer<typeof VisualRegressionReadinessReportSchema>;
export type InfrastructureReadinessReport = z.infer<typeof InfrastructureReadinessReportSchema>;
export type IacDriftReadinessReport = z.infer<typeof IacDriftReadinessReportSchema>;
export type DeploymentReadinessReport = z.infer<typeof DeploymentReadinessReportSchema>;
export type ServerlessReadinessReport = z.infer<typeof ServerlessReadinessReportSchema>;
export type MobileReadinessReport = z.infer<typeof MobileReadinessReportSchema>;
export type DesktopReadinessReport = z.infer<typeof DesktopReadinessReportSchema>;
export type EdgeReadinessReport = z.infer<typeof EdgeReadinessReportSchema>;
export type ComposeReadinessReport = z.infer<typeof ComposeReadinessReportSchema>;
export type DevContainerReadinessReport = z.infer<typeof DevContainerReadinessReportSchema>;
export type KubernetesReadinessReport = z.infer<typeof KubernetesReadinessReportSchema>;
export type GitOpsReadinessReport = z.infer<typeof GitOpsReadinessReportSchema>;
export type BackupReadinessReport = z.infer<typeof BackupReadinessReportSchema>;
export type ComponentGraphReport = z.infer<typeof ComponentGraphReportSchema>;
export type SourceSnapshotReport = z.infer<typeof SourceSnapshotReportSchema>;
export type IncrementalReport = z.infer<typeof IncrementalReportSchema>;
export type FlowReport = z.infer<typeof FlowReportSchema>;
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
export type RebuildRoadmap = z.infer<typeof RebuildRoadmapSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;
export type WrongNote = z.infer<typeof WrongNoteSchema>;
export type HtmlExportManifest = z.infer<typeof HtmlExportManifestSchema>;
export type CodexRunLog = z.infer<typeof CodexRunLogSchema>;
