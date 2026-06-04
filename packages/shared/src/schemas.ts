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
    signal: z.enum(["chat-model", "completion-model", "embedding-model", "provider-config", "model-name", "temperature", "fallback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  promptSignals: z.array(z.object({
    signal: z.enum(["prompt-template", "chat-prompt-template", "system-message", "human-message", "messages-placeholder", "few-shot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["tool", "tool-schema", "tool-calling", "agent", "agent-executor", "mcp-tool", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  retrievalSignals: z.array(z.object({
    signal: z.enum(["vector-store", "retriever", "embeddings", "text-splitter", "document-loader", "rag-chain", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structuredOutputSignals: z.array(z.object({
    signal: z.enum(["output-parser", "zod-schema", "with-structured-output", "json-schema", "function-calling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  streamingSignals: z.array(z.object({
    signal: z.enum(["stream", "stream-events", "callbacks", "tracing", "langsmith", "token-usage", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["guardrail", "moderation", "refusal", "retry", "fallback", "rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["langchain", "@langchain/core", "@langchain/openai", "ai", "openai", "@anthropic-ai/sdk", "llamaindex", "ollama", "unknown"]),
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
    platform: z.enum(["langfuse", "phoenix", "helicone", "openinference", "opentelemetry", "custom", "unknown"]),
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
    signal: z.enum(["trace", "span", "observation", "generation", "root-span", "nested-span", "trace-id", "span-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    signal: z.enum(["observe-decorator", "openai-wrapper", "callback-handler", "openinference", "opentelemetry", "otel-exporter", "tracer-provider", "auto-instrumentation", "unknown"]),
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
    signal: z.enum(["export", "api-client", "dashboard", "self-host", "docker-compose", "helm", "ci", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["langfuse", "phoenix", "arize-phoenix-otel", "openinference", "opentelemetry", "helicone", "unknown"]),
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
    platform: z.enum(["qdrant", "weaviate", "chroma", "pinecone", "milvus", "pgvector", "faiss", "custom", "unknown"]),
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
    signal: z.enum(["add", "upsert", "batch", "ids", "documents", "metadata", "payload", "delete", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["search", "query", "nearest-neighbor", "similarity", "hybrid", "full-text", "filter", "limit", "score", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  embeddingSignals: z.array(z.object({
    signal: z.enum(["embedding-function", "vectorizer", "model-provider", "precomputed-vector", "sparse-vector", "multimodal", "text-splitter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  indexSignals: z.array(z.object({
    signal: z.enum(["hnsw", "quantization", "payload-index", "vector-index", "distance-metric", "shard", "replication", "consistency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["snapshot", "backup", "restore", "health", "metrics", "migration", "multi-tenancy", "ttl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["qdrant-client", "weaviate-client", "chromadb", "pinecone", "pymilvus", "pgvector", "faiss", "unknown"]),
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
    platform: z.enum(["temporal", "inngest", "triggerdotdev", "cloudflare-workflows", "custom", "unknown"]),
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
    signal: z.enum(["event", "cron", "schedule", "webhook", "manual", "api-trigger", "child-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["task", "workflow", "activity", "step", "worker", "task-queue", "function-run", "handler", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  durabilitySignals: z.array(z.object({
    signal: z.enum(["retry", "timeout", "heartbeat", "checkpoint", "state-store", "resume", "history", "continue-as-new", "idempotency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  flowSignals: z.array(z.object({
    signal: z.enum(["wait", "sleep", "wait-for-event", "cancel", "batch", "concurrency", "rate-limit", "throttle", "priority", "child-workflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["dev-server", "deploy", "worker-pool", "isolated-runtime", "machine", "environment", "serve", "dashboard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["logger", "tracing", "metadata", "tags", "run-status", "dashboard", "alerts", "metrics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@temporalio/workflow", "@temporalio/worker", "@temporalio/client", "inngest", "@trigger.dev/sdk", "@trigger.dev/react", "cloudflare-workflows", "unknown"]),
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
export type CodeOwnershipReadinessReport = z.infer<typeof CodeOwnershipReadinessReportSchema>;
export type LicenseRightsReport = z.infer<typeof LicenseRightsReportSchema>;
export type SbomReport = z.infer<typeof SbomReportSchema>;
export type SecurityReadinessReport = z.infer<typeof SecurityReadinessReportSchema>;
export type ScorecardReport = z.infer<typeof ScorecardReportSchema>;
export type ProvenanceReport = z.infer<typeof ProvenanceReportSchema>;
export type AdvisoryReport = z.infer<typeof AdvisoryReportSchema>;
export type VexReport = z.infer<typeof VexReportSchema>;
export type PolicyGateReport = z.infer<typeof PolicyGateReportSchema>;
export type ApiContractReport = z.infer<typeof ApiContractReportSchema>;
export type ObservabilityReport = z.infer<typeof ObservabilityReportSchema>;
export type PerformanceReport = z.infer<typeof PerformanceReportSchema>;
export type E2eReport = z.infer<typeof E2eReportSchema>;
export type AccessibilityReport = z.infer<typeof AccessibilityReportSchema>;
export type StorybookReport = z.infer<typeof StorybookReportSchema>;
export type DesignTokensReport = z.infer<typeof DesignTokensReportSchema>;
export type I18nReport = z.infer<typeof I18nReportSchema>;
export type ReleaseReadinessReport = z.infer<typeof ReleaseReadinessReportSchema>;
export type SecretReadinessReport = z.infer<typeof SecretReadinessReportSchema>;
export type SecretManagementReadinessReport = z.infer<typeof SecretManagementReadinessReportSchema>;
export type ContainerReadinessReport = z.infer<typeof ContainerReadinessReportSchema>;
export type CodeQualityReport = z.infer<typeof CodeQualityReportSchema>;
export type DocumentationReport = z.infer<typeof DocumentationReportSchema>;
export type DatabaseReadinessReport = z.infer<typeof DatabaseReadinessReportSchema>;
export type CiCdReport = z.infer<typeof CiCdReportSchema>;
export type UnitTestReport = z.infer<typeof UnitTestReportSchema>;
export type MutationTestingReadinessReport = z.infer<typeof MutationTestingReadinessReportSchema>;
export type TypecheckReadinessReport = z.infer<typeof TypecheckReadinessReportSchema>;
export type PackageManagerReport = z.infer<typeof PackageManagerReportSchema>;
export type GitHooksReport = z.infer<typeof GitHooksReportSchema>;
export type TaskRunnerReport = z.infer<typeof TaskRunnerReportSchema>;
export type DependencyUpdateReport = z.infer<typeof DependencyUpdateReportSchema>;
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
export type PdfGenerationReadinessReport = z.infer<typeof PdfGenerationReadinessReportSchema>;
export type SpreadsheetReadinessReport = z.infer<typeof SpreadsheetReadinessReportSchema>;
export type ChartVisualizationReadinessReport = z.infer<typeof ChartVisualizationReadinessReportSchema>;
export type DiagramRenderingReadinessReport = z.infer<typeof DiagramRenderingReadinessReportSchema>;
export type LinkIntegrityReadinessReport = z.infer<typeof LinkIntegrityReadinessReportSchema>;
export type SeoMetadataReadinessReport = z.infer<typeof SeoMetadataReadinessReportSchema>;
export type PwaReadinessReport = z.infer<typeof PwaReadinessReportSchema>;
export type BrowserCompatibilityReadinessReport = z.infer<typeof BrowserCompatibilityReadinessReportSchema>;
export type EnvValidationReadinessReport = z.infer<typeof EnvValidationReadinessReportSchema>;
export type SecurityHeadersReadinessReport = z.infer<typeof SecurityHeadersReadinessReportSchema>;
export type GraphqlReadinessReport = z.infer<typeof GraphqlReadinessReportSchema>;
export type CliReadinessReport = z.infer<typeof CliReadinessReportSchema>;
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
export type ServerFrameworkReadinessReport = z.infer<typeof ServerFrameworkReadinessReportSchema>;
export type RpcReadinessReport = z.infer<typeof RpcReadinessReportSchema>;
export type WorkspaceGraphReadinessReport = z.infer<typeof WorkspaceGraphReadinessReportSchema>;
export type ScaffoldingReadinessReport = z.infer<typeof ScaffoldingReadinessReportSchema>;
export type SchedulerReadinessReport = z.infer<typeof SchedulerReadinessReportSchema>;
export type BuildToolReadinessReport = z.infer<typeof BuildToolReadinessReportSchema>;
export type StylingReadinessReport = z.infer<typeof StylingReadinessReportSchema>;
export type VisualRegressionReadinessReport = z.infer<typeof VisualRegressionReadinessReportSchema>;
export type InfrastructureReadinessReport = z.infer<typeof InfrastructureReadinessReportSchema>;
export type DeploymentReadinessReport = z.infer<typeof DeploymentReadinessReportSchema>;
export type ServerlessReadinessReport = z.infer<typeof ServerlessReadinessReportSchema>;
export type MobileReadinessReport = z.infer<typeof MobileReadinessReportSchema>;
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
