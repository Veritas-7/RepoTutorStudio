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
  uncoveredImportantFiles: z.array(z.string()),
  highPriorityFolders: z.array(z.object({
    folderPath: z.string(),
    reason: z.string()
  })),
  beginnerExplanation: z.string()
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
  entryNodeIds: z.array(z.string()),
  mermaid: z.string(),
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
  pages: z.array(z.object({
    name: z.string(),
    path: z.string(),
    title: z.string()
  })),
  assets: z.array(z.string())
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
export type ComponentGraphReport = z.infer<typeof ComponentGraphReportSchema>;
export type FlowReport = z.infer<typeof FlowReportSchema>;
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
export type RebuildRoadmap = z.infer<typeof RebuildRoadmapSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;
export type WrongNote = z.infer<typeof WrongNoteSchema>;
export type HtmlExportManifest = z.infer<typeof HtmlExportManifestSchema>;
export type CodexRunLog = z.infer<typeof CodexRunLogSchema>;
