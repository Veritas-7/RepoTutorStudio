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
export type ContainerReadinessReport = z.infer<typeof ContainerReadinessReportSchema>;
export type CodeQualityReport = z.infer<typeof CodeQualityReportSchema>;
export type DocumentationReport = z.infer<typeof DocumentationReportSchema>;
export type DatabaseReadinessReport = z.infer<typeof DatabaseReadinessReportSchema>;
export type CiCdReport = z.infer<typeof CiCdReportSchema>;
export type UnitTestReport = z.infer<typeof UnitTestReportSchema>;
export type TypecheckReadinessReport = z.infer<typeof TypecheckReadinessReportSchema>;
export type PackageManagerReport = z.infer<typeof PackageManagerReportSchema>;
export type GitHooksReport = z.infer<typeof GitHooksReportSchema>;
export type TaskRunnerReport = z.infer<typeof TaskRunnerReportSchema>;
export type DependencyUpdateReport = z.infer<typeof DependencyUpdateReportSchema>;
export type LintReadinessReport = z.infer<typeof LintReadinessReportSchema>;
export type FormatReadinessReport = z.infer<typeof FormatReadinessReportSchema>;
export type CommitConventionReport = z.infer<typeof CommitConventionReportSchema>;
export type ChangelogReadinessReport = z.infer<typeof ChangelogReadinessReportSchema>;
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
