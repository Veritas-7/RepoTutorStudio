export type StudyMode = "quick" | "standard" | "deep";
export type LearnerLevel = "beginner" | "junior" | "senior";

export interface SessionRow {
  sessionId: string;
  repo: string;
  createdAt: string;
  mode: StudyMode;
  score: number | null;
  wrong: number;
  path: string;
}

export interface StudyResponse {
  sessionId: string;
  status: string;
  path: string;
  html: string;
  dailySummaryHtml?: string;
  teachingWorkspaceHtml?: string;
  learnerGoalAlignmentHtml?: string;
  verificationOk?: boolean;
  verificationReport?: string;
  verificationMarkdown?: string;
  verificationHtml?: string;
  verificationCheckedRequiredArtifacts?: number;
  verificationChecks?: Record<string, boolean>;
  quizQuestions: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: Record<"A" | "B" | "C" | "D", string>;
}

export interface QuizPayload {
  sessionId: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

export interface AttemptResponse {
  attemptId: string;
  score: number;
  correct: number;
  wrong: number;
  wrongNotes: string;
  wrongNotesHtml?: string;
  wrongNotesMarkdown?: string;
  learningRecord?: string | null;
  reviewGuidance?: string;
}

export interface SourcePruneResponse {
  sourcePresent: boolean;
  sourcePruned: boolean;
  sourceFiles: number;
  sourceBytes: number;
  applyReady: boolean;
  blockers: string[];
  checks?: {
    sessionVerificationOk: boolean;
    requiredArtifactsOk: boolean;
    htmlExportOk: boolean;
    evidenceIndexOk: boolean;
    preservedArtifactsOk: boolean;
    preservedEvidenceBundleOk: boolean;
  };
  preservedArtifacts?: Array<{
    path: string;
    present: boolean;
    bytes: number;
  }>;
  preservedEvidenceBundle?: Array<{
    path: string;
    present: boolean;
    bytes: number;
  }>;
  sourceKnowledgePolicy?: string;
  learnerCleanupDecision?: {
    sourcePurpose: string;
    applyWhen: string[];
    holdWhen: string[];
    retainedEvidence: string[];
  };
  recommendedAction: string;
  reportPath?: string;
  markdownPath?: string;
  applied?: boolean;
  apply?: {
    removedFiles: number;
    removedBytes: number;
    applyReportPath: string;
    tombstonePath: string;
    sourceKnowledgePolicy: string;
    learnerCleanupDecision?: {
      sourcePurpose: string;
      applyWhen: string[];
      holdWhen: string[];
      retainedEvidence: string[];
    };
    retainedLearningArtifacts: Array<{
      path: string;
      present: boolean;
      bytes: number;
    }>;
  };
}
