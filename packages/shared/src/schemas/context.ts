import { z } from "zod";

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
  contextPackSignals: z.array(z.object({
    signal: z.enum(["text-candidate-filter", "token-estimate", "budget-profiles", "directory-token-tree", "top-files", "split-output-plan", "security-exclusions", "repomix-config", "repomix-ignore", "include-patterns", "ignore-patterns", "gitignore-aware", "default-ignore-patterns", "max-file-size", "output-style", "xml-output", "markdown-output", "json-output", "plain-output", "stdout-output", "stdin-input", "copy-clipboard", "line-numbers", "file-summary", "directory-structure", "remove-comments", "remove-empty-lines", "truncate-base64", "compress", "token-count-tree", "token-budget", "git-diffs", "git-logs", "remote-repository", "remote-branch", "remote-trust-config", "security-check", "mcp-server", "skill-generation"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
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
  ragChunkingSignals: z.array(z.object({
    signal: z.enum(["repository-load", "file-filtering", "notebook-support", "chunk-size", "chunk-overlap", "local-vector-store", "top-k-retrieval", "conversation-memory", "standalone-question"]),
    readiness: z.enum(["ready", "suggested", "static-only"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  codeSearchQuerySignals: z.array(z.object({
    signal: z.enum(["substring-search", "regexp-search", "boolean-operators", "repo-filter", "file-filter", "language-filter", "branch-filter", "case-sensitivity", "result-type-filter", "symbol-search", "trigram-index", "ctags-ranking", "index-shards", "json-api"]),
    readiness: z.enum(["ready", "suggested", "static-only"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  conversationStarterPrompts: z.array(z.object({
    questionType: z.enum(["overview", "trace", "file", "debug", "follow-up", "evidence"]),
    question: z.string(),
    retrievalHint: z.string(),
    relatedHref: z.string()
  })),
  codeSearchDrillPrompts: z.array(z.object({
    queryType: z.enum(["scope", "symbol", "regex", "exclude", "branch", "result-type"]),
    query: z.string(),
    learningGoal: z.string(),
    relatedHref: z.string()
  })),
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
  mentorReflectionLoops: z.array(z.object({
    loop: z.enum(["goal-strategy-reflection", "repo-grounded-context", "standup-summary", "review-feedback", "team-ritual"]),
    title: z.string(),
    prompt: z.string(),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  repoGroundedFeedbackPrompts: z.array(z.object({
    signal: z.enum(["issues", "commits", "pull-requests", "reviews", "leaderboard", "recognition", "prompt-scheduler"]),
    question: z.string(),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  vibeCodingBuildBriefs: z.array(z.object({
    role: z.enum(["context-curator", "product-owner", "architect", "implementer", "reviewer", "debugger", "technical-writer"]),
    title: z.string(),
    whyItMatters: z.string(),
    sourceEvidence: z.string(),
    learnerAction: z.string(),
    prompt: z.string(),
    relatedHref: z.string()
  })),
  aiBuildPromptPacks: z.array(z.object({
    phase: z.enum(["understand", "specify", "plan", "implement", "review", "debug", "document"]),
    prompt: z.string(),
    why: z.string(),
    inputEvidence: z.string(),
    expectedOutput: z.string(),
    relatedHref: z.string()
  })),
  verificationBoundaries: z.array(z.object({
    boundary: z.enum(["static-evidence", "needs-test-run", "needs-runtime-run", "needs-human-review", "needs-source-owner"]),
    claim: z.string(),
    whatRepoTutorKnows: z.string(),
    whatAiMustNotAssume: z.string(),
    nextVerification: z.string(),
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

export const DailySummaryReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  date: z.string(),
  learningGoal: z.string(),
  sourceHandling: z.object({
    policy: z.string(),
    why: z.string(),
    retainedArtifacts: z.array(z.object({
      label: z.string(),
      href: z.string(),
      purpose: z.string()
    })),
    cleanupGuidance: z.array(z.string())
  }),
  takeaways: z.array(z.object({
    title: z.string(),
    explanation: z.string(),
    relatedHref: z.string()
  })),
  architectureLens: z.array(z.object({
    topic: z.string(),
    whyItMatters: z.string(),
    promptCue: z.string(),
    relatedHref: z.string()
  })),
  termsToKnow: z.array(z.object({
    term: z.string(),
    simpleMeaning: z.string(),
    whyNeeded: z.string(),
    promptUse: z.string(),
    relatedHref: z.string()
  })),
  promptsToReuse: z.array(z.object({
    title: z.string(),
    prompt: z.string(),
    expectedUse: z.string(),
    relatedHref: z.string()
  })),
  nextSession: z.array(z.object({
    task: z.string(),
    reason: z.string(),
    relatedHref: z.string()
  })),
  verificationBoundaries: z.array(z.object({
    claim: z.string(),
    boundary: z.string(),
    nextCheck: z.string(),
    relatedHref: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const VibeCodingPromptPackReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mission: z.string(),
  contextBundle: z.array(z.object({
    label: z.string(),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  promptSequence: z.array(z.object({
    phase: z.enum(["orient", "architect", "plan", "implement", "verify", "review"]),
    title: z.string(),
    prompt: z.string(),
    why: z.string(),
    inputEvidence: z.string(),
    expectedArtifact: z.string(),
    relatedHref: z.string()
  })),
  aiGuardrails: z.array(z.object({
    rule: z.string(),
    reason: z.string(),
    verification: z.string(),
    relatedHref: z.string()
  })),
  learnerChecklist: z.array(z.string()),
  copyPastePrompt: z.string()
});

export type ContextPackReport = z.infer<typeof ContextPackReportSchema>;
export type McpHandoffReport = z.infer<typeof McpHandoffReportSchema>;
export type AgentMemoryReport = z.infer<typeof AgentMemoryReportSchema>;
export type GraphQueryReport = z.infer<typeof GraphQueryReportSchema>;
export type TutorialAbstractionReport = z.infer<typeof TutorialAbstractionReportSchema>;
export type DecisionRecordReport = z.infer<typeof DecisionRecordReportSchema>;
export type DependencyHealthReport = z.infer<typeof DependencyHealthReportSchema>;
export type SearchIndexReport = z.infer<typeof SearchIndexReportSchema>;
export type LearningJournalReport = z.infer<typeof LearningJournalReportSchema>;
export type DailySummaryReport = z.infer<typeof DailySummaryReportSchema>;
export type VibeCodingPromptPackReport = z.infer<typeof VibeCodingPromptPackReportSchema>;
