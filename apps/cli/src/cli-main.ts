#!/usr/bin/env node
import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { applySourcePrunePlan, findQuizLearningRecord, listSessions, loadStudyHtmlInput, runStudy, scoreQuizAttempt, sourcePruneApplyMarkdown, sourcePrunePlanMarkdown, writeSourcePrunePlan } from "@repotutor/core";
import type { LearnerLevel, StudyMode } from "@repotutor/shared";
import { CLI_COMMANDS, parseArgs, type ParsedArgs } from "./args.js";
import { flagEnum, numberFlag, stringFlag } from "./flags.js";
import { LIST_FIELDS, LIST_FIELD_PRESET_NAMES, type DoctorPayload } from "./list-types.js";
import { list, verifyListOutput } from "./list-command.js";
import { openTargetEntries, openTargetFile, openTargetPaths, openTargetPathsMarkdown, openTargetsMarkdown } from "./open-targets.js";
import { assertReadableFile, htmlTargetStatus, sessionVerificationSummary } from "./session-utils.js";
import {
  doctorMarkdown,
  evidenceMarkdown,
  evidenceVerificationMarkdown,
  exportSummaryMarkdown,
  exportVerificationMarkdown,
  quizAttemptMarkdown,
  resumeMarkdown,
  sessionVerificationMarkdown,
  studyMarkdown
} from "./cli-formatters.js";
async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  try {
    if (parsed.command === "study") await study(parsed);
    else if (parsed.command === "quiz") await quiz(parsed);
    else if (parsed.command === "resume") await resume(parsed);
    else if (parsed.command === "evidence") await evidence(parsed);
    else if (parsed.command === "export") await exportSession(parsed);
    else if (parsed.command === "verify-export") await verifyExport(parsed);
    else if (parsed.command === "verify-evidence") await verifyEvidence(parsed);
    else if (parsed.command === "verify-session") await verifySession(parsed);
    else if (parsed.command === "verify-list-output") await verifyListOutput(parsed);
    else if (parsed.command === "list") await list(parsed, studiesRoot(parsed.flags));
    else if (parsed.command === "open") await openSession(parsed);
    else if (parsed.command === "prune-source") await pruneSource(parsed);
    else if (parsed.command === "doctor") await doctor(parsed);
    else help();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`ERROR: ${message}`);
    process.exitCode = 1;
  }
}

async function study(parsed: ParsedArgs): Promise<void> {
  const source = parsed.rest[0];
  if (!source) throw new Error("study requires a GitHub URL or local path.");
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("study supports --format json or markdown.");
  const result = await runStudy({
    source,
    mode: flagEnum(parsed.flags.mode, ["quick", "standard", "deep"], "standard") as StudyMode,
    level: flagEnum(parsed.flags.level, ["beginner", "junior", "senior"], "beginner") as LearnerLevel,
    studiesRoot: studiesRoot(parsed.flags),
    sourceBaseDir: commandBaseDir(),
    enableCodex: parsed.flags["no-codex"] !== true,
    learnerBriefPath: stringFlag(parsed.flags["learner-brief"])
  });
  const verificationReport = path.join(result.session.outputPaths.analysis, "session-verification-report.json");
  const verification = JSON.parse(await fs.readFile(verificationReport, "utf8")) as {
    ok: boolean;
    checkedRequiredArtifacts: number;
    checks: Record<string, boolean>;
  };
  const payload = {
    sessionId: result.session.sessionId,
    status: result.session.status,
    path: result.session.outputPaths.root,
    html: path.join(result.session.outputPaths.html, "index.html"),
    dailySummaryHtml: path.join(result.session.outputPaths.html, "daily-summary.html"),
    teachingWorkspaceHtml: path.join(result.session.outputPaths.html, "teaching-workspace.html"),
    learnerGoalAlignmentHtml: path.join(result.session.outputPaths.root, "reference", "learner-goal-alignment.html"),
    verificationOk: verification.ok,
    verificationReport,
    verificationMarkdown: path.join(result.session.outputPaths.markdown, "session-verification.md"),
    verificationHtml: path.join(result.session.outputPaths.html, "session-verification.html"),
    verificationCheckedRequiredArtifacts: verification.checkedRequiredArtifacts,
    verificationChecks: verification.checks,
    quizQuestions: result.session.quizSummary.totalQuestions
  };
  console.log(format === "markdown" ? studyMarkdown(payload) : JSON.stringify(payload, null, 2));
}

async function quiz(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("quiz supports --format json or markdown.");
  let answers: Record<string, "A" | "B" | "C" | "D">;
  const answersFile = stringFlag(parsed.flags.answers);
  if (answersFile) {
    answers = JSON.parse(await fs.readFile(path.resolve(answersFile), "utf8")) as Record<string, "A" | "B" | "C" | "D">;
  } else if (parsed.flags.interactive) {
    answers = await askAnswers(htmlInput.quiz.questions);
  } else {
    throw new Error("quiz requires --interactive or --answers answers.json");
  }
  const attempt = await scoreQuizAttempt(sessionRoot, answers, htmlInput);
  const learningRecord = await findQuizLearningRecord(sessionRoot, attempt.attemptId);
  const payload = {
    attemptId: attempt.attemptId,
    score: attempt.score,
    correct: attempt.correctCount,
    wrong: attempt.wrongCount,
    wrongNotes: path.join(sessionRoot, "html", "wrong-notes.html"),
    wrongNotesHtml: path.join(sessionRoot, "html", "wrong-notes.html"),
    wrongNotesMarkdown: path.join(sessionRoot, "markdown", "wrong-notes.md"),
    learningRecord,
    reviewGuidance: attempt.wrongCount > 0
      ? "오답노트의 선택지 복습과 learning-record를 열어 부족한 개념을 AI repair prompt로 다시 설명하세요."
      : "learning-record를 열어 이번 퀴즈가 어떤 AI 구현 맥락 준비도를 증명했는지 확인하세요."
  };
  console.log(format === "markdown" ? quizAttemptMarkdown(payload) : JSON.stringify(payload, null, 2));
}

async function resume(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const session = JSON.parse(await fs.readFile(path.join(sessionRoot, "session.json"), "utf8")) as {
    sessionId: string;
    repo: string;
    studyMode: string;
    learnerLevel: string;
    outputPaths: { html: string };
  };
  const verification = await sessionVerificationSummary(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("resume supports --format json or markdown.");
  const htmlTargets = openTargetPaths(session.outputPaths.html);
  const payload = {
    sessionId: session.sessionId,
    repo: session.repo,
    mode: session.studyMode,
    level: session.learnerLevel,
    root: sessionRoot,
    html: path.join(session.outputPaths.html, "index.html"),
    dailySummaryHtml: path.join(session.outputPaths.html, "daily-summary.html"),
    teachingWorkspaceHtml: path.join(session.outputPaths.html, "teaching-workspace.html"),
    htmlTargets,
    htmlTargetStatus: await htmlTargetStatus(htmlTargets),
    verificationStatus: verification.status,
    verificationOk: verification.ok,
    verificationReport: verification.reportPath,
    verificationMarkdown: verification.markdownPath,
    verificationHtml: verification.htmlPath,
    verificationCheckedRequiredArtifacts: verification.checkedRequiredArtifacts,
    verificationChecks: verification.checks
  };
  if (format === "markdown") {
    console.log(resumeMarkdown(payload));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

async function evidence(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const report = JSON.parse(await fs.readFile(path.join(sessionRoot, "analysis", "evidence-index-report.json"), "utf8")) as {
    totalEvidenceItems: number;
    evidenceByKind: Record<string, number>;
    evidenceByFile: Record<string, number>;
    items: Array<{
      filePath: string;
      line: number;
      kind: string;
      snippet: string;
      lessonHref: string;
      sourcePath: string;
      sourceHref: string;
    }>;
  };
  const kind = stringFlag(parsed.flags.kind);
  const file = stringFlag(parsed.flags.file);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("evidence supports --format json or markdown.");
  const limit = numberFlag(parsed.flags.limit, 20);
  const items = report.items
    .filter((item) => !kind || item.kind === kind)
    .filter((item) => !file || item.filePath === file)
    .slice(0, limit);
  const payload = {
    sessionRoot,
    totalEvidenceItems: report.totalEvidenceItems,
    evidenceByKind: report.evidenceByKind,
    evidenceByFile: report.evidenceByFile,
    filteredKind: kind ?? null,
    filteredFile: file ?? null,
    returnedItems: items.length,
    items
  };
  if (format === "markdown") {
    console.log(evidenceMarkdown(payload));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

async function exportSession(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const format = stringFlag(parsed.flags.format) ?? "html";
  if (!["html", "zip"].includes(format)) throw new Error("export supports --format html or --format zip.");
  const summaryFormat = stringFlag(parsed.flags["summary-format"]) ?? "json";
  if (!["json", "markdown"].includes(summaryFormat)) throw new Error("export supports --summary-format json or markdown.");
  const htmlInput = await loadStudyHtmlInput(sessionRoot);
  const { renderStudyHtml } = await import("@repotutor/html");
  const { verifyHtmlExportManifest, writeHtmlZipBundle, writeRenderedHtml } = await import("@repotutor/core");
  const rendered = renderStudyHtml(htmlInput);
  await writeRenderedHtml(sessionRoot, rendered);
  const verification = await verifyHtmlExportManifest(sessionRoot);
  if (!verification.ok) throw new Error("HTML export integrity verification failed.");
  const zip = format === "zip" ? await writeHtmlZipBundle(sessionRoot) : null;
  const payload = {
    exported: format,
    path: zip?.zipPath ?? path.join(sessionRoot, "html", "index.html"),
    html: path.join(sessionRoot, "html", "index.html"),
    readme: path.join(sessionRoot, "html", "EXPORT-README.md"),
    manifest: path.join(sessionRoot, "html", "manifest.json"),
    pages: rendered.manifest.pages.length,
    assets: rendered.manifest.assets.length,
    integrityOk: verification.ok,
    integrityCheckedFiles: verification.checkedFiles,
    zipBytes: zip?.bytes ?? null,
    zipFiles: zip?.fileCount ?? null,
    entrypoints: rendered.manifest.entrypoints.map((entry) => ({
      label: entry.label,
      path: path.join(sessionRoot, entry.path)
    }))
  };
  console.log(summaryFormat === "markdown" ? exportSummaryMarkdown(payload) : JSON.stringify(payload, null, 2));
}

async function verifyExport(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyHtmlExportManifest } = await import("@repotutor/core");
  const result = await verifyHtmlExportManifest(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-export supports --format json or markdown.");
  console.log(format === "markdown" ? exportVerificationMarkdown(result) : JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

async function verifyEvidence(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyEvidenceIndexReport } = await import("@repotutor/core");
  const result = await verifyEvidenceIndexReport(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-evidence supports --format json or markdown.");
  console.log(format === "markdown" ? evidenceVerificationMarkdown(result) : JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

async function verifySession(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const { verifyStudySessionArtifacts } = await import("@repotutor/core");
  const result = await verifyStudySessionArtifacts(sessionRoot);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-session supports --format json or markdown.");
  if (format === "markdown") {
    console.log(sessionVerificationMarkdown(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  if (!result.ok) process.exitCode = 1;
}

async function openSession(parsed: ParsedArgs): Promise<void> {
  if (parsed.flags["list-targets"] === true) {
    const format = stringFlag(parsed.flags.format) ?? "json";
    if (!["json", "markdown"].includes(format)) throw new Error("open --list-targets supports --format json or markdown.");
    const entries = openTargetEntries();
    console.log(format === "markdown" ? openTargetsMarkdown(entries) : JSON.stringify(entries, null, 2));
    return;
  }
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const target = stringFlag(parsed.flags.target) ?? "index";
  if (target === "all") {
    const format = stringFlag(parsed.flags.format) ?? "json";
    if (!["json", "markdown"].includes(format)) throw new Error("open --target all supports --format json or markdown.");
    const targetPaths = openTargetPaths(path.join(sessionRoot, "html"));
    for (const [targetName, filePath] of Object.entries(targetPaths)) {
      await assertReadableFile(filePath, `Open target file not found for ${targetName}: ${filePath}`);
    }
    console.log(format === "markdown" ? openTargetPathsMarkdown(targetPaths) : JSON.stringify(targetPaths, null, 2));
    return;
  }
  const fileName = openTargetFile(target);
  const htmlPath = path.join(sessionRoot, "html", fileName);
  await assertReadableFile(htmlPath, `Open target file not found: ${htmlPath}`);
  console.log(htmlPath);
}

async function pruneSource(parsed: ParsedArgs): Promise<void> {
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("prune-source supports --format json or markdown.");
  if (parsed.flags.apply === true) {
    const confirm = stringFlag(parsed.flags.confirm);
    if (confirm !== "DELETE-SOURCE-SNAPSHOT") throw new Error("prune-source --apply requires --confirm DELETE-SOURCE-SNAPSHOT.");
    const result = await applySourcePrunePlan(sessionRoot, { confirm });
    const payload = {
      ...result.plan,
      apply: result.apply,
      applied: true
    };
    if (format === "markdown") {
      console.log([
        sourcePrunePlanMarkdown(result.plan).trimEnd(),
        "",
        sourcePruneApplyMarkdown(result.apply).trimEnd(),
        "",
        sourcePruneCliCleanupDecision(sessionRoot, true).trimEnd()
      ].join("\n"));
    } else {
      console.log(JSON.stringify(payload, null, 2));
    }
    return;
  }
  const result = await writeSourcePrunePlan(sessionRoot);
  const payload = {
    ...result.plan,
    reportPath: result.reportPath,
    markdownPath: result.markdownPath,
    applied: false
  };
  if (format === "markdown") {
    console.log([
      sourcePrunePlanMarkdown(result.plan).trimEnd(),
      "",
      "## Written Reports",
      "",
      `- JSON: ${result.reportPath}`,
      `- Markdown: ${result.markdownPath}`,
      "",
      "This command is dry-run only and does not delete the generated session `source/` snapshot.",
      "",
      sourcePruneCliCleanupDecision(sessionRoot, false).trimEnd()
    ].join("\n"));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
  if (!result.plan.applyReady) process.exitCode = 1;
}

function sourcePruneCliCleanupDecision(sessionRoot: string, applied: boolean): string {
  const applyCommand = `repo-tutor prune-source ${sessionRoot} --apply --confirm DELETE-SOURCE-SNAPSHOT`;
  return `## CLI 정리 판단(토큰 전 보존)

- 생성된 세션 \`source/\` 스냅샷은 AI 개발지식 내장 데이터가 아니라 이 세션의 프로젝트별 임시 근거입니다.
- 사용자 원본 소스는 CLI 정리 대상이 아니며, 같은 원본 저장소나 폴더에서 새 세션을 만들 수 있습니다.
- 흡수 확인: \`reference/source-absorption-ledger.html\`에서 어떤 기능, 판단, 프롬프트 맥락이 남았는지 확인합니다.
- 현재 목표 조사 확인: \`reference/source-retention-guide.html\`와 \`markdown/source-prune-plan.md\`가 현재 학습 목표에서 남은 조사 필요 여부와 정리 보류 조건을 설명해야 합니다.
- 보존 확인: \`reference/source-absorption-ledger.html\`, \`analysis/daily-summary-report.json\`, \`html/vibe-coding-prompt-pack.html\`, \`reference/vibe-coding-implementation-brief.html\`, \`html/session-verification.html\`, \`markdown/session-verification.md\`, 검증 기록, \`reference/source-retention-guide.html\`이 남아 있어야 합니다.
- READY_REVIEW 경계: dry-run plan의 READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다. 실제 적용은 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, \`DELETE-SOURCE-SNAPSHOT\` 확인 토큰이 모두 있을 때만 검토하세요.
- 적용 상태: ${applied ? "정리 적용됨. 정리된 것은 생성된 세션 `source/` 스냅샷입니다. `SOURCE-PRUNED.md`와 `analysis/source-prune-applied.json`으로 남긴 학습 자산을 복습하세요." : "아직 dry-run입니다. 생성된 세션 `source/` 스냅샷은 토큰 전 보존 상태입니다. 학습자가 아키텍처 이유, 역할 경계, AI 프롬프트, acceptance criteria, verification 기준, 검증 기록을 설명하고 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다고 명시 확인했을 때만 적용 검토 후보로 보세요. READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다."}
- 검토 후보 명령(토큰 전 보존): \`${applyCommand}\`
`;
}

async function doctor(parsed: ParsedArgs): Promise<void> {
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("doctor supports --format json or markdown.");
  const runtimeStudiesRoot = studiesRoot(parsed.flags);
  const payload: DoctorPayload = {
    ok: true,
    product: "RepoTutor Studio",
    commands: [...CLI_COMMANDS],
    defaultStudyCommand: true,
    formats: {
      study: ["json", "markdown"],
      quiz: ["json", "markdown"],
      resume: ["json", "markdown"],
      evidence: ["json", "markdown"],
      verifyExport: ["json", "markdown"],
      verifyEvidence: ["json", "markdown"],
      verifySession: ["json", "markdown"],
      verifyListOutput: ["json", "markdown"],
      list: ["json", "markdown", "jsonl", "csv"],
      openTargets: ["json", "markdown"],
      openAll: ["json", "markdown"],
      pruneSource: ["json", "markdown"],
      export: ["html", "zip"],
      exportSummary: ["json", "markdown"]
    },
    runtime: {
      cwd: process.cwd(),
      studiesRoot: runtimeStudiesRoot,
      initCwd: process.env.INIT_CWD ?? null,
      envStudiesRoot: process.env.REPOTUTOR_STUDIES_ROOT ?? null
    },
    runtimeOptions: {
      studiesRootFlag: true,
      envStudiesRoot: true,
      initCwdFallback: true,
      codexSdkDefault: true,
      noCodexFlag: true,
      sourcePruneDryRun: true
    },
    runtimeHealth: await doctorRuntimeHealth(runtimeStudiesRoot),
    listFilters: {
      level: ["beginner", "junior", "senior", "all"],
      mode: ["quick", "standard", "deep", "all"],
      status: ["passed", "failed", "missing", "all"],
      htmlTargets: ["complete", "missing", "all"],
      sort: ["newest", "oldest", "score-desc", "score-asc"],
      fields: [...LIST_FIELDS],
      fieldPresets: LIST_FIELD_PRESET_NAMES,
      summary: true,
      output: true,
      outputManifest: true,
      repo: true,
      createdFrom: true,
      createdTo: true,
      createdRangeValidation: true,
      verifiedOnly: true,
      wrongOnly: true,
      unattemptedOnly: true,
      scoredOnly: true,
      minScore: true,
      maxScore: true,
      filterConflictValidation: true,
      limit: true
    },
    openTargets: [...openTargetEntries().map((entry) => entry.target), "all"],
    modes: ["cli", "codex-skill", "tauri-sidecar"],
    security: {
      codexSdkDefault: true,
      staticAnalysisFallback: true,
      codexAuthDelegated: true,
      arbitraryCommandExecution: false,
      secretExclusion: true
    }
  };
  if (format === "markdown") {
    console.log(doctorMarkdown(payload));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

async function doctorRuntimeHealth(studiesRootPath: string): Promise<Record<string, boolean>> {
  const studiesRootExists = await pathAccess(studiesRootPath, fsConstants.F_OK);
  return {
    studiesRootExists,
    studiesRootReadable: studiesRootExists && await pathAccess(studiesRootPath, fsConstants.R_OK),
    studiesRootWritable: studiesRootExists && await pathAccess(studiesRootPath, fsConstants.W_OK),
    studiesRootParentWritable: await pathAccess(path.dirname(studiesRootPath), fsConstants.W_OK)
  };
}

async function pathAccess(targetPath: string, mode: number): Promise<boolean> {
  try {
    await fs.access(targetPath, mode);
    return true;
  } catch {
    return false;
  }
}

async function resolveSessionRoot(value: string | undefined, flags: Record<string, string | boolean>): Promise<string> {
  if (value?.includes(path.sep)) return path.resolve(value);
  const sessions = await listSessions(studiesRoot(flags));
  const match = sessions.find((session) => session.sessionId === value || session.repo === value);
  if (!match) throw new Error(`Session not found: ${value ?? "(missing)"}`);
  return match.outputPaths.root;
}

async function askAnswers(questions: Array<{ id: string; question: string; choices: Record<string, string> }>): Promise<Record<string, "A" | "B" | "C" | "D">> {
  const rl = readline.createInterface({ input, output });
  const answers: Record<string, "A" | "B" | "C" | "D"> = {};
  try {
    for (const question of questions) {
      console.log(`\n${question.question}`);
      for (const [key, value] of Object.entries(question.choices)) console.log(`${key}. ${value}`);
      let answer = "";
      while (!["A", "B", "C", "D"].includes(answer)) {
        answer = (await rl.question("Answer (A/B/C/D): ")).trim().toUpperCase();
      }
      answers[question.id] = answer as "A" | "B" | "C" | "D";
    }
  } finally {
    rl.close();
  }
  return answers;
}

function studiesRoot(flags: Record<string, string | boolean>): string {
  return path.resolve(
    stringFlag(flags["studies-root"])
      ?? process.env.REPOTUTOR_STUDIES_ROOT
      ?? path.join(process.env.INIT_CWD ?? process.cwd(), "studies")
  );
}

function commandBaseDir(): string {
  return path.resolve(process.env.INIT_CWD ?? process.cwd());
}

function help(): void {
  console.log(`repo-tutor commands:
  <github-url-or-path> --mode quick|standard|deep --level beginner|junior|senior --format json|markdown [--no-codex] [--learner-brief brief.md]
  study <github-url-or-path> --mode quick|standard|deep --level beginner|junior|senior --format json|markdown [--no-codex] [--learner-brief brief.md]
  quiz <session-id-or-path> --interactive --format json|markdown
  quiz <session-id-or-path> --answers answers.json --format json|markdown
  resume <session-id-or-path> --format json|markdown
  evidence <session-id-or-path> --kind import --file src/main.ts --limit 20 --format json|markdown
  export <session-id-or-path> --format html|zip --summary-format json|markdown
  verify-export <session-id-or-path> --format json|markdown
  verify-evidence <session-id-or-path> --format json|markdown
  verify-session <session-id-or-path> --format json|markdown
  verify-list-output <output-file> --manifest output.manifest.json --report [verification.json] --format json|markdown
  list --repo owner/name --summary --fields sessionId,repo,score,path --field-preset compact|scores|handoff|verification|paths --output reports/list.json --output-manifest [manifest.json] --created-from YYYY-MM-DD --created-to YYYY-MM-DD --mode quick|standard|deep|all --level beginner|junior|senior|all --status passed|failed|missing|all --html-targets complete|missing|all --sort newest|oldest|score-desc|score-asc --verified-only --wrong-only --unattempted-only --scored-only --min-score 80 --max-score 100 --limit 10 --format json|markdown|jsonl|csv
open <session-id-or-path> --target verification|evidence|suggested-reads|runtime-environment|interface-map|symbol-map|api-reference|search-index|learning-journal|daily-summary|architecture-principle-playbook|source-to-build-interview|similar-app-transfer-map|learner-goal-alignment|ai-implementation-loop|learner-role-contract|ai-output-review-rubric|vibe-coding-mastery-checklist|vibe-coding-implementation-brief|ai-prompt-readiness-checklist|ai-prompt-ab-lab|source-retention-guide|source-absorption-ledger|teaching-workspace|vibe-coding-prompt-pack|improvement-backlog|project-activity|code-metrics-readiness|code-ownership-readiness|large-asset-readiness|license-rights|sbom|security-readiness|sast-readiness|dast-readiness|threat-model-readiness|scorecard|provenance|advisories|vex|policy-gates|api-contracts|consumer-contract-readiness|observability|performance|profiling-readiness|tracing-readiness|debug-readiness|crash-reporting-readiness|incident-response-readiness|slo-readiness|cost-readiness|progressive-delivery-readiness|load-testing-readiness|benchmark-readiness|e2e|flaky-test-readiness|test-impact-readiness|test-reporting-readiness|snapshot-readiness|property-based-testing-readiness|fuzz-readiness|test-data-readiness|integration-test-environment-readiness|chaos-engineering-readiness|accessibility|storybook|design-tokens|i18n|release-readiness|secret-readiness|secret-management-readiness|container-readiness|container-scan-readiness|code-quality|documentation|database-readiness|database-migration-readiness|database-orm-readiness|data-transformation-readiness|data-quality-readiness|data-lineage-readiness|data-catalog-readiness|data-annotation-readiness|lakehouse-table-readiness|feature-store-readiness|model-registry-readiness|experiment-tracking-readiness|model-monitoring-readiness|model-serving-readiness|model-training-readiness|ci-cd|unit-tests|coverage-readiness|mutation-testing-readiness|typecheck-readiness|package-manager|git-hooks|task-runner|dependency-updates|dependency-review-readiness|lint-readiness|format-readiness|commit-conventions|changelog-readiness|bundle-analysis|mocking-readiness|data-fetching-readiness|routing-readiness|state-management-readiness|form-readiness|auth-readiness|authorization-readiness|payment-readiness|email-readiness|queue-readiness|event-stream-readiness|data-connector-readiness|semantic-layer-readiness|bi-dashboard-readiness|schema-registry-readiness|stream-processing-readiness|pipeline-orchestration-readiness|service-mesh-readiness|ingress-controller-readiness|dns-readiness|certificate-readiness|helm-readiness|admission-policy-readiness|api-gateway-readiness|cache-readiness|logging-readiness|feature-flag-readiness|rate-limit-readiness|error-tracking-readiness|analytics-readiness|http-client-readiness|schema-validation-readiness|datetime-readiness|id-generation-readiness|image-processing-readiness|file-upload-readiness|websocket-readiness|realtime-media-readiness|pdf-generation-readiness|spreadsheet-readiness|chart-visualization-readiness|markdown-code-rendering-readiness|notebook-readiness|map-visualization-readiness|diagram-rendering-readiness|link-integrity-readiness|seo-metadata-readiness|pwa-readiness|browser-compat-readiness|browser-extension-readiness|env-validation-readiness|security-headers-readiness|graphql-readiness|cli-readiness|terminal-ui-readiness|state-machine-readiness|animation-readiness|drag-and-drop-readiness|rich-text-editor-readiness|command-palette-readiness|guided-tour-readiness|data-table-readiness|calendar-readiness|dialog-readiness|popover-tooltip-readiness|menu-dropdown-readiness|toast-snackbar-readiness|tabs-accordion-readiness|checkbox-radio-switch-readiness|slider-progress-readiness|select-combobox-readiness|toolbar-toggle-readiness|scroll-area-readiness|avatar-readiness|pin-input-readiness|pagination-readiness|number-input-readiness|rating-group-readiness|color-picker-readiness|splitter-readiness|tags-input-readiness|clipboard-readiness|qr-code-readiness|timer-readiness|steps-readiness|carousel-readiness|tree-view-readiness|collapsible-readiness|editable-readiness|password-input-readiness|signature-pad-readiness|angle-slider-readiness|cascade-select-readiness|async-list-readiness|image-cropper-readiness|listbox-readiness|date-picker-readiness|marquee-readiness|toc-readiness|floating-panel-readiness|drawer-readiness|hover-card-readiness|navigation-menu-readiness|presence-readiness|menu-readiness|tooltip-readiness|llm-readiness|llm-eval-readiness|llm-observability-readiness|vector-db-readiness|search-service-readiness|object-storage-readiness|realtime-collaboration-readiness|workflow-orchestration-readiness|openapi-client-readiness|webhook-readiness|notification-readiness|consent-readiness|privacy-readiness|server-framework-readiness|rpc-readiness|workspace-graph-readiness|scaffolding-readiness|scheduler-readiness|build-tool-readiness|styling-readiness|visual-regression-readiness|infrastructure-readiness|iac-drift-readiness|deployment-readiness|serverless-readiness|mobile-readiness|desktop-readiness|edge-readiness|compose-readiness|devcontainer-readiness|kubernetes-readiness|gitops-readiness|backup-readiness|context-pack|mcp-handoff|agent-memory|graph-query|tutorial-abstractions|decision-records|dependency-health|vibe-coding-start|learning-path|quiz|quiz-print|all --format json|markdown
  open --list-targets --format json|markdown
  prune-source <session-id-or-path> --format json|markdown [--apply --confirm DELETE-SOURCE-SNAPSHOT]
  doctor --format json|markdown
  prune-source option: dry-run writes source-prune-plan reports first. --apply is a reviewed command candidate only after the prune gate passes, the preserved evidence bundle remains available, session verification and verification records pass, the learner explicitly confirms source links no longer need to open for the current learning goal, and --confirm DELETE-SOURCE-SNAPSHOT is supplied. READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission.
  study option: --learner-brief <file> imports a PRD, issue, or current AI prompt for source-grounded goal alignment.
  study option: Codex SDK is enabled by default through local Codex CLI authentication; use --no-codex only for offline deterministic verification.
  study/list/doctor option: --studies-root <dir>`);
}

await main();
