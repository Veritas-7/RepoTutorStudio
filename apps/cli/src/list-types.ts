export interface DoctorPayload {
  ok: boolean;
  product: string;
  commands: string[];
  defaultStudyCommand: boolean;
  formats: Record<string, string[]>;
  runtime: {
    cwd: string;
    studiesRoot: string;
    initCwd: string | null;
    envStudiesRoot: string | null;
  };
  runtimeOptions: Record<string, boolean>;
  runtimeHealth: Record<string, boolean>;
  listFilters: Record<string, string[] | boolean>;
  openTargets: string[];
  modes: string[];
  security: Record<string, boolean>;
}

export interface ListRow {
  sessionId: string;
  repo: string;
  createdAt: string;
  mode: string;
  level: string;
  score: number | null;
  wrong: number;
  path: string;
  html: string;
  htmlTargetsComplete: boolean;
  missingHtmlTargets: string[];
  verificationStatus: string;
  verificationOk: boolean | null;
  verificationReport: string;
  verificationMarkdown: string;
  verificationHtml: string;
  verificationCheckedRequiredArtifacts: number | null;
  verificationChecks: Record<string, boolean> | null;
}

export interface ListSummary {
  total: number;
  verificationStatus: Record<string, number>;
  modes: Record<string, number>;
  levels: Record<string, number>;
  htmlTargets: {
    complete: number;
    missing: number;
  };
  quiz: {
    scored: number;
    unattempted: number;
    wrong: number;
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
  };
  repos: Record<string, number>;
}

export interface ListOutputContext {
  format: string;
  summary: boolean;
  rows: number;
  fields: string[] | null;
  fieldPreset: string | null;
  filters: ListFilterManifest;
}

export interface ListOutputManifest {
  schemaVersion: number;
  outputPath: string;
  manifestPath: string;
  format: string;
  summary: boolean;
  rows: number;
  fields: string[] | null;
  fieldPreset: string | null;
  filters: ListFilterManifest;
  bytes: number;
  sha256: string;
  createdAt: string;
}

export interface ListFilterManifest {
  repo: string | null;
  createdFrom: string | null;
  createdTo: string | null;
  mode: string;
  level: string;
  status: string;
  htmlTargets: string;
  sort: string | null;
  limit: number | null;
  verifiedOnly: boolean;
  wrongOnly: boolean;
  unattemptedOnly: boolean;
  scoredOnly: boolean;
  minScore: number | null;
  maxScore: number | null;
}

export interface ListOutputVerification {
  ok: boolean;
  outputPath: string;
  manifestPath: string;
  schemaVersion: number | null;
  supportedSchemaVersion: boolean;
  format: string | null;
  summary: boolean | null;
  rows: number | null;
  actualRows: number | null;
  fields: string[] | null;
  actualFields: string[] | null;
  expectedBytes: number | null;
  actualBytes: number | null;
  expectedSha256: string | null;
  actualSha256: string | null;
  failures: Array<{
    reason: string;
    path: string;
    expected: string | number | boolean | null;
    actual: string | number | boolean | null;
  }>;
}

export const LIST_FIELDS = [
  "sessionId",
  "repo",
  "createdAt",
  "mode",
  "level",
  "score",
  "wrong",
  "path",
  "html",
  "htmlTargetsComplete",
  "missingHtmlTargets",
  "verificationStatus",
  "verificationOk",
  "verificationReport",
  "verificationMarkdown",
  "verificationHtml",
  "verificationCheckedRequiredArtifacts",
  "verificationChecks"
] as const satisfies readonly (keyof ListRow)[];

export type ListField = typeof LIST_FIELDS[number];

export const LIST_FIELD_SET = new Set<string>(LIST_FIELDS);

export const DEFAULT_LIST_CSV_FIELDS = [
  "sessionId",
  "repo",
  "createdAt",
  "mode",
  "level",
  "score",
  "wrong",
  "verificationStatus",
  "htmlTargetsComplete",
  "missingHtmlTargets",
  "path",
  "html"
] as const satisfies readonly ListField[];

export const LIST_FIELD_PRESETS = {
  compact: ["sessionId", "repo", "createdAt", "verificationStatus"],
  scores: ["sessionId", "repo", "score", "wrong", "path"],
  handoff: ["sessionId", "repo", "mode", "level", "verificationStatus", "path", "html"],
  verification: ["sessionId", "repo", "verificationStatus", "verificationOk", "verificationReport", "verificationHtml"],
  paths: ["sessionId", "repo", "path", "html"]
} as const satisfies Record<string, readonly ListField[]>;

export const LIST_FIELD_PRESET_NAMES = Object.keys(LIST_FIELD_PRESETS) as Array<keyof typeof LIST_FIELD_PRESETS>;

export const LIST_OUTPUT_MANIFEST_SCHEMA_VERSION = 1;
