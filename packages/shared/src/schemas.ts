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
