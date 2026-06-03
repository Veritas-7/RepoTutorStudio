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
