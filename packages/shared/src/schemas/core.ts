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
  vibeCodingLens: z.string(),
  architectureRationale: z.string(),
  aiPromptBrief: z.string(),
  sourceBoundaries: z.array(z.string()),
  verificationQuestions: z.array(z.string()),
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
  rebuildAdvice: z.string(),
  forestViewSummary: z.string(),
  architectureRationale: z.string(),
  aiImplementationBrief: z.string(),
  vibeCodingPrompts: z.array(z.string()),
  verificationQuestions: z.array(z.string())
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
  sourceRoleSummary: z.string(),
  architectureResponsibility: z.string(),
  aiPromptBrief: z.string(),
  vibeCodingPrompts: z.array(z.string()),
  verificationQuestions: z.array(z.string()),
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
  toolVersionSignals: z.array(z.object({
    signal: z.enum(["mise-config", "mise-tools", "tool-versions", "idiomatic-version-file", "mise-lock", "mise-install-command", "mise-exec-command", "mise-action", "mise-doctor", "mise-trust"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentConfigSignals: z.array(z.object({
    signal: z.enum(["env-section", "env-file-directive", "env-source-directive", "mise-env", "mise-env-config", "mise-config-hierarchy", "mise-settings", "mise-path", "direnv"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  taskRunnerSignals: z.array(z.object({
    signal: z.enum(["toml-task", "file-task", "task-depends", "task-description", "task-run-command", "task-config-includes", "mise-run-command", "mise-watch-command", "monorepo-task-context"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
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
  codeIntelligenceSignals: z.array(z.object({
    signal: z.enum(["scip-index", "scip-cli", "definition-navigation", "reference-navigation", "implementation-navigation", "occurrence-ranges", "symbol-information", "relationships", "hover-signature", "diagnostics", "snapshot-testing", "stats-command", "language-indexers"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  syntaxParserSignals: z.array(z.object({
    signal: z.enum(["tree-sitter-grammar", "incremental-parser", "concrete-syntax-tree", "node-types", "query-captures", "highlight-query", "locals-query", "injections-query", "tags-query", "parse-command", "query-command", "grammar-tests", "error-node-query"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  symbolNavigationPrompts: z.array(z.object({
    title: z.string(),
    question: z.string(),
    relatedHref: z.string()
  })),
  syntaxQueryPrompts: z.array(z.object({
    title: z.string(),
    question: z.string(),
    relatedHref: z.string()
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
  typedocConfigSignals: z.array(z.object({
    signal: z.enum(["typedoc-config", "package-script", "options-file", "tsconfig", "typedoc-options", "entry-points", "entry-point-strategy", "packages-strategy", "plugin", "tsdoc-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    filePath: z.string().nullable(),
    sourceHref: z.string().nullable()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["out", "html", "json", "outputs-array", "emit-docs", "emit-none", "theme", "router", "navigation", "search", "markdown-plugin", "external-documents", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    filePath: z.string().nullable(),
    sourceHref: z.string().nullable()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["validation-object", "not-exported", "invalid-link", "invalid-path", "rewritten-link", "not-documented", "treat-warnings-as-errors", "treat-validation-warnings-as-errors", "required-to-be-documented", "intentionally-not-documented", "intentionally-not-exported", "packages-requiring-documentation", "validation-warning-count", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    filePath: z.string().nullable(),
    sourceHref: z.string().nullable()
  })),
  learnerNextSteps: z.array(z.string())
});
