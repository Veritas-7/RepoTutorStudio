import type { DoctorPayload } from "./list-types.js";

export function studyMarkdown(payload: {
  sessionId: string;
  status: string;
  path: string;
  html: string;
  dailySummaryHtml: string;
  teachingWorkspaceHtml: string;
  learnerGoalAlignmentHtml: string;
  verificationOk: boolean;
  verificationReport: string;
  verificationMarkdown: string;
  verificationHtml: string;
  verificationCheckedRequiredArtifacts: number;
  verificationChecks: Record<string, boolean>;
  quizQuestions: number;
}): string {
  const checks = Object.entries(payload.verificationChecks)
    .map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`)
    .join("\n");
  return [
    "# RepoTutor Study",
    "",
    `- Session ID: ${payload.sessionId}`,
    `- Status: ${payload.status}`,
    `- Root: ${payload.path}`,
    `- Main HTML: ${payload.html}`,
    `- Daily Summary HTML: ${payload.dailySummaryHtml}`,
    `- Teaching Workspace HTML: ${payload.teachingWorkspaceHtml}`,
    `- Learner Goal Alignment HTML: ${payload.learnerGoalAlignmentHtml}`,
    `- Verification OK: ${payload.verificationOk}`,
    `- Verification report: ${payload.verificationReport}`,
    `- Verification markdown: ${payload.verificationMarkdown}`,
    `- Verification HTML: ${payload.verificationHtml}`,
    `- Required artifacts checked: ${payload.verificationCheckedRequiredArtifacts}`,
    `- Quiz questions: ${payload.quizQuestions}`,
    "",
    "## Verification Checks",
    "",
    checks
  ].join("\n");
}

export function exportSummaryMarkdown(payload: {
  exported: string;
  path: string;
  html: string;
  readme: string;
  manifest: string;
  pages: number;
  assets: number;
  integrityOk: boolean;
  integrityCheckedFiles: number;
  zipBytes: number | null;
  zipFiles: number | null;
  entrypoints: Array<{ label: string; path: string }>;
}): string {
  const entrypoints = payload.entrypoints
    .map((entry) => `- ${entry.label}: ${entry.path}`)
    .join("\n");
  return [
    "# RepoTutor Export",
    "",
    `- Exported: ${payload.exported}`,
    `- Path: ${payload.path}`,
    `- Main HTML: ${payload.html}`,
    `- README: ${payload.readme}`,
    `- Manifest: ${payload.manifest}`,
    `- Pages: ${payload.pages}`,
    `- Assets: ${payload.assets}`,
    `- Integrity OK: ${payload.integrityOk}`,
    `- Integrity checked files: ${payload.integrityCheckedFiles}`,
    `- ZIP bytes: ${payload.zipBytes ?? "none"}`,
    `- ZIP files: ${payload.zipFiles ?? "none"}`,
    "",
    "## Entry Points",
    "",
    entrypoints || "- none"
  ].join("\n");
}

export function evidenceMarkdown(payload: {
  sessionRoot: string;
  totalEvidenceItems: number;
  evidenceByKind: Record<string, number>;
  filteredKind: string | null;
  filteredFile: string | null;
  returnedItems: number;
  items: Array<{ filePath: string; line: number; kind: string; snippet: string; sourceHref: string; lessonHref: string }>;
}): string {
  const filters = [
    payload.filteredKind ? `kind=${payload.filteredKind}` : null,
    payload.filteredFile ? `file=${payload.filteredFile}` : null
  ].filter(Boolean).join(", ") || "none";
  return [
    "# RepoTutor Evidence",
    "",
    `- Session: ${payload.sessionRoot}`,
    `- Total evidence items: ${payload.totalEvidenceItems}`,
    `- Returned items: ${payload.returnedItems}`,
    `- Filters: ${filters}`,
    `- Kinds: ${Object.entries(payload.evidenceByKind).map(([kind, count]) => `${kind} ${count}`).join(", ") || "none"}`,
    "",
    ...payload.items.map((item) => `## ${item.filePath}:L${item.line}\n\n- Kind: ${item.kind}\n- Lesson: ${item.lessonHref}\n- Source: ${item.sourceHref}\n\n\`${item.snippet.replaceAll("`", "'")}\`\n`)
  ].join("\n");
}

export function quizAttemptMarkdown(payload: {
  attemptId: string;
  score: number;
  correct: number;
  wrong: number;
  wrongNotes: string;
  wrongNotesHtml: string;
  wrongNotesMarkdown: string;
  learningRecord: string | null;
  reviewGuidance: string;
}): string {
  const learningRecord = payload.learningRecord ? `\`${payload.learningRecord}\`` : "none";
  return [
    "# RepoTutor Quiz Attempt",
    "",
    `- Attempt ID: ${payload.attemptId}`,
    `- Score: ${payload.score}`,
    `- Correct: ${payload.correct}`,
    `- Wrong: ${payload.wrong}`,
    `- Wrong notes HTML: \`${payload.wrongNotesHtml}\``,
    `- Wrong notes Markdown: \`${payload.wrongNotesMarkdown}\``,
    `- Learning record: ${learningRecord}`,
    `- Review guidance: ${payload.reviewGuidance}`
  ].join("\n");
}

export function resumeMarkdown(payload: {
  sessionId: string;
  repo: string;
  mode: string;
  level: string;
  root: string;
  html: string;
  dailySummaryHtml: string;
  teachingWorkspaceHtml: string;
  htmlTargets: Record<string, string>;
  htmlTargetStatus: Record<string, boolean>;
  verificationStatus: string;
  verificationOk: boolean | null;
  verificationReport: string;
  verificationMarkdown: string;
  verificationHtml: string;
  verificationCheckedRequiredArtifacts: number | null;
  verificationChecks: Record<string, boolean> | null;
}): string {
  const verificationChecks = payload.verificationChecks
    ? Object.entries(payload.verificationChecks).map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`).join("\n")
    : "- none";
  const targets = Object.entries(payload.htmlTargets)
    .map(([target, filePath]) => `- ${target}: ${filePath}`)
    .join("\n");
  const targetStatus = Object.entries(payload.htmlTargetStatus)
    .map(([target, exists]) => `- ${target}: ${exists ? "present" : "missing"}`)
    .join("\n");
  return [
    "# RepoTutor Resume",
    "",
    `- Session ID: ${payload.sessionId}`,
    `- Repo: ${payload.repo}`,
    `- Study mode: ${payload.mode}`,
    `- Learner level: ${payload.level}`,
    `- Root: ${payload.root}`,
    `- Main HTML: ${payload.html}`,
    `- Daily Summary HTML: ${payload.dailySummaryHtml}`,
    `- Teaching Workspace HTML: ${payload.teachingWorkspaceHtml}`,
    `- Verification status: ${payload.verificationStatus}`,
    `- Verification OK: ${payload.verificationOk === null ? "unknown" : String(payload.verificationOk)}`,
    `- Required artifacts checked: ${payload.verificationCheckedRequiredArtifacts ?? "unknown"}`,
    `- Verification report: ${payload.verificationReport}`,
    `- Verification markdown: ${payload.verificationMarkdown}`,
    `- Verification HTML: ${payload.verificationHtml}`,
    "",
    "## HTML Targets",
    "",
    targets,
    "",
    "## HTML Target Status",
    "",
    targetStatus,
    "",
    "## Verification Checks",
    "",
    verificationChecks
  ].join("\n");
}

export function doctorMarkdown(payload: DoctorPayload): string {
  const formats = Object.entries(payload.formats)
    .map(([command, values]) => `- ${command}: ${values.join(", ")}`)
    .join("\n");
  const runtime = [
    `- cwd: ${payload.runtime.cwd}`,
    `- studiesRoot: ${payload.runtime.studiesRoot}`,
    `- initCwd: ${payload.runtime.initCwd ?? "none"}`,
    `- envStudiesRoot: ${payload.runtime.envStudiesRoot ?? "none"}`
  ].join("\n");
  const filters = Object.entries(payload.listFilters)
    .map(([name, value]) => `- ${name}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join("\n");
  const runtimeOptions = Object.entries(payload.runtimeOptions)
    .map(([name, ok]) => `- ${name}: ${ok ? "true" : "false"}`)
    .join("\n");
  const runtimeHealth = Object.entries(payload.runtimeHealth)
    .map(([name, ok]) => `- ${name}: ${ok ? "true" : "false"}`)
    .join("\n");
  const security = Object.entries(payload.security)
    .map(([name, ok]) => `- ${name}: ${ok ? "true" : "false"}`)
    .join("\n");
  return [
    "# RepoTutor Doctor",
    "",
    `- Product: ${payload.product}`,
    `- OK: ${String(payload.ok)}`,
    `- Modes: ${payload.modes.join(", ")}`,
    `- Commands: ${payload.commands.join(", ")}`,
    `- Default study command: ${payload.defaultStudyCommand ? "enabled" : "disabled"}`,
    `- Open targets: ${payload.openTargets.join(", ")}`,
    "",
    "## Formats",
    "",
    formats,
    "",
    "## Runtime",
    "",
    runtime,
    "",
    "## Runtime Options",
    "",
    runtimeOptions,
    "",
    "## Runtime Health",
    "",
    runtimeHealth,
    "",
    "## List Filters",
    "",
    filters,
    "",
    "## Security",
    "",
    security
  ].join("\n");
}

export function exportVerificationMarkdown(payload: {
  ok: boolean;
  manifestPath: string;
  checkedFiles: number;
  failures: Array<{
    path: string;
    expectedBytes: number;
    actualBytes: number | null;
    expectedSha256: string;
    actualSha256: string | null;
  }>;
}): string {
  const failures = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => [
      `- ${failure.path}`,
      `  - Expected bytes: ${failure.expectedBytes}`,
      `  - Actual bytes: ${failure.actualBytes ?? "missing"}`,
      `  - Expected sha256: ${failure.expectedSha256}`,
      `  - Actual sha256: ${failure.actualSha256 ?? "missing"}`
    ].join("\n")).join("\n");
  return [
    "# RepoTutor Export Verification",
    "",
    `- OK: ${payload.ok ? "PASS" : "FAIL"}`,
    `- Manifest: ${payload.manifestPath}`,
    `- Checked files: ${payload.checkedFiles}`,
    "",
    "## Failures",
    "",
    failures
  ].join("\n");
}

export function evidenceVerificationMarkdown(payload: {
  ok: boolean;
  reportPath: string;
  checkedItems: number;
  checkedSourceFiles: number;
  checkedSourceLinks: number;
  checkedLessonLinks: number;
  failures: Array<{
    reason: string;
    path: string;
    filePath?: string;
    line?: number;
    detail?: string;
  }>;
}): string {
  const failures = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => [
      `- ${failure.reason}: ${failure.path}`,
      failure.filePath ? `  - File: ${failure.filePath}` : null,
      failure.line === undefined ? null : `  - Line: ${failure.line}`,
      failure.detail ? `  - Detail: ${failure.detail}` : null
    ].filter(Boolean).join("\n")).join("\n");
  return [
    "# RepoTutor Evidence Verification",
    "",
    `- OK: ${payload.ok ? "PASS" : "FAIL"}`,
    `- Report: ${payload.reportPath}`,
    `- Checked items: ${payload.checkedItems}`,
    `- Checked source files: ${payload.checkedSourceFiles}`,
    `- Checked source links: ${payload.checkedSourceLinks}`,
    `- Checked lesson links: ${payload.checkedLessonLinks}`,
    "",
    "## Failures",
    "",
    failures
  ].join("\n");
}

export function sessionVerificationMarkdown(payload: {
  ok: boolean;
  sessionRoot: string;
  sessionId: string | null;
  checkedRequiredArtifacts: number;
  checks: Record<string, boolean>;
  htmlExport: { ok: boolean; checkedFiles: number; failures: Array<{ path: string }> } | null;
  evidenceIndex: { ok: boolean; checkedItems: number; checkedSourceFiles: number; checkedSourceLinks: number; checkedLessonLinks: number; failures: Array<{ path: string; reason: string }> } | null;
  failures: Array<{ check: string; reason: string; path: string; detail?: string }>;
}): string {
  const status = payload.ok ? "PASS" : "FAIL";
  const checks = Object.entries(payload.checks)
    .map(([name, ok]) => `- ${name}: ${ok ? "PASS" : "FAIL"}`)
    .join("\n");
  const failureLines = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => `- ${failure.check}: ${failure.reason} at ${failure.path}${failure.detail ? ` (${failure.detail})` : ""}`).join("\n");
  return [
    "# RepoTutor Session Verification",
    "",
    `- Status: ${status}`,
    `- Session ID: ${payload.sessionId ?? "unknown"}`,
    `- Session root: ${payload.sessionRoot}`,
    `- Required artifacts checked: ${payload.checkedRequiredArtifacts}`,
    `- HTML files checked: ${payload.htmlExport?.checkedFiles ?? 0}`,
    `- Evidence items checked: ${payload.evidenceIndex?.checkedItems ?? 0}`,
    `- Evidence source files checked: ${payload.evidenceIndex?.checkedSourceFiles ?? 0}`,
    `- Evidence source links checked: ${payload.evidenceIndex?.checkedSourceLinks ?? 0}`,
    `- Evidence lesson links checked: ${payload.evidenceIndex?.checkedLessonLinks ?? 0}`,
    "",
    "## Checks",
    "",
    checks,
    "",
    "## Failures",
    "",
    failureLines
  ].join("\n");
}
