#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const iterations = Number(readFlag("--iterations") ?? "13");
const auditDir = path.join(root, "docs", "audits");
fs.mkdirSync(auditDir, { recursive: true });

const checks = [
  check("project setup", [
    "DEVELOPMENT_BRIEF.txt",
    "working.md",
    "package.json",
    "pnpm-workspace.yaml",
    "AGENTS.md"
  ]),
  check("shared core engine", [
    "packages/core/src/pipeline.ts",
    "packages/core/src/evidence.ts",
    "packages/core/src/session-verifier.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/storage.ts",
    "packages/shared/src/schemas.ts"
  ], ["packages/core/src/pipeline.ts:runStudy", "packages/shared/src/schemas.ts:StudySessionSchema"]),
  check("headless cli commands", [
    "apps/cli/src/index.ts",
    "packages/core/src/session-verifier.ts"
  ], ["study", "quiz", "resume", "resumeMarkdown", "RepoTutor Resume", "Study mode", "Learner level", "evidence", "export", "verify-export", "verify-evidence", "verify-session", "verifyEvidenceIndexReport", "verifyStudySessionArtifacts", "verificationOk", "verificationStatus", "verificationReport", "verificationMarkdown", "verificationHtml", "verificationCheckedRequiredArtifacts", "checkedRequiredArtifacts", "htmlTargets", "openTargetPaths", "html-export-failed", "evidence-index-failed", "sessionVerificationSummary", "sessionVerificationMarkdown", "RepoTutor Session Verification", "process.exitCode", "list", "listMarkdown", "RepoTutor Sessions", "learnerLevel", "Level", "--verified-only", "--limit", "optionalPositiveIntegerFlag", "positive integer", "--level beginner|junior|senior|all", "learnerLevelFlag", "list supports --level", "--status passed|failed|missing|all", "verificationStatusFlag", "list supports --status", "--repo", "optionalStringFlag", "repoMatches", "non-empty string", "--sort newest|oldest", "listSortFlag", "sortSessionRows", "list supports --sort", "open", "--target verification|evidence|quiz", "--list-targets", "openTargetEntries", "openTargetFile", "assertReadableFile", "Open target file not found", "Unsupported open target", "doctor", "filteredKind", "filteredFile", "--file", "--format json|markdown", "evidenceMarkdown", "returnedItems"]),
  check("codex skill mode", [
    "skills/repo-tutor/SKILL.md",
    ".agents/skills/repo-tutor/SKILL.md",
    "skills/repo-tutor/scripts/repo-tutor-study.sh"
  ], ["repo-tutor study", "repo-tutor quiz", "Do not execute arbitrary project commands"]),
  check("tauri standalone mode", [
    "apps/desktop-tauri/src/App.tsx",
    "apps/desktop-tauri/src-tauri/src/lib.rs",
    "apps/desktop-tauri/sidecar/bridge.ts",
    "apps/desktop-tauri/src-tauri/tauri.conf.json"
  ], ["study_source", "REPOTUTOR_SIDECAR", "Node sidecar"]),
  check("date session storage", [
    "packages/core/src/storage.ts",
    "packages/core/src/pipeline.ts",
    "packages/shared/src/path-utils.ts"
  ], ["studiesRoot", "sessionFolderName", "todayIsoDate", "session.json"]),
  check("static analyzer and safe intake", [
    "packages/core/src/intake.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/fs-utils.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/storage.ts"
  ], ["git", "clone", "--depth", "isSecretLikePath", "readTextIfSafe", "sourceBaseDir"]),
  check("lesson generation outputs", [
    "packages/core/src/pipeline.ts",
    "packages/core/src/evidence.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts",
    "packages/shared/src/schemas.ts"
  ], ["PurposeReport", "FolderLesson", "FileLesson", "FlowReport", "RebuildRoadmap", "EvidenceIndexReport", "evidence-index-report.json", "session-verification-report.json", "session-verification.md", "session-verification.html", "renderSessionVerificationMarkdown", "verifyEvidenceIndexReport", "checkedLessonLinks", "missing-lesson-anchor", "sourceEvidence", "source-evidence", "source-link", "../source/", "원본 열기", "evidence.md", "evidence.html", "evidence-index-cards", "evidence-kind-toolbar", "data-evidence-kind-filter", "소스 근거", "evidenceBackedFiles", "evidenceCoverageRatio", "evidenceKindCounts", "filesWithoutEvidence", "소스 근거 종류"]),
  check("quiz engine", [
    "packages/core/src/quiz.ts",
    "packages/shared/src/constants.ts"
  ], ["calculateQuizCount", "quick", "standard", "deep", "choices"]),
  check("wrong notes persistence", [
    "packages/core/src/quiz.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts"
  ], ["wrong-notes.json", "wrong-notes.md", "wrong-notes.html", "mistakeReason"]),
  check("offline html export", [
    "packages/html/src/templates.ts",
    "packages/core/src/quiz.ts",
    "packages/core/src/exporter.ts",
    "packages/core/src/session-verifier.ts",
    "apps/cli/src/index.ts",
    "packages/shared/src/schemas.ts"
  ], ["index.html", "quiz.html", "wrong-notes.html", "evidence.html", "session-verification.html", "assets/style.css", "assets/app.js", "manifest.json", "EXPORT-README.md", "entrypoints", "writeHtmlZipBundle", "verifyHtmlExportManifest", "verifyStudySessionArtifacts", "integrityOk", "integrityCheckedFiles", "--format html|zip", "html-report.zip", "file-nav-toolbar", "data-file-ext-filter", "data-file-dir-filter", "data-source-evidence-filter", "data-source-evidence", "data-evidence-kind-filter", "integrity", "sha256", "bytes"]),
  check("source-backed component graph", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts"
  ], ["ComponentGraphReportSchema", "component-graph-report.json", "component-graph.md", "component-graph.html", "mermaid", "data-graph-filter", "data-node-type", "nodeTypeCounts", "topConnectedNodes"]),
  check("incremental re-analysis", [
    "packages/shared/src/schemas.ts",
    "packages/core/src/scanner.ts",
    "packages/core/src/incremental.ts",
    "packages/core/src/sessions.ts",
    "packages/core/src/pipeline.ts",
    "packages/core/src/markdown.ts",
    "packages/html/src/templates.ts"
  ], ["SourceSnapshotReportSchema", "IncrementalReportSchema", "source-snapshot-report.json", "incremental-report.json", "incremental.md", "incremental.html", "baselineSessionId", "coverageDelta"]),
  check("codex sdk boundary", [
    "packages/codex/src/index.ts",
    "apps/desktop-tauri/src/App.tsx"
  ], ["@openai/codex-sdk", "StructuredRunner", "run("], { forbidden: ["apps/desktop-tauri/src/App.tsx:@openai/codex-sdk"] }),
  check("security sqlite and cli-anything", [
    "AGENTS.md",
    "docs/security/SECURITY_POLICY.md",
    "adapters/cli-anything/src/index.ts",
    "packages/core/src/storage.ts",
    ".gitignore"
  ], ["arbitrary", "secret", "DatabaseSync", "CLI-Anything is optional", ".env"])
];

const results = [];
for (let i = 1; i <= iterations; i += 1) {
  const run = {
    iteration: i,
    createdAt: new Date().toISOString(),
    checks: checks.map((fn) => fn()),
  };
  run.ok = run.checks.every((item) => item.ok);
  results.push(run);
  const base = `compliance-audit-${String(i).padStart(2, "0")}`;
  fs.writeFileSync(path.join(auditDir, `${base}.json`), `${JSON.stringify(run, null, 2)}\n`);
  fs.writeFileSync(path.join(auditDir, `${base}.md`), renderMarkdown(run));
}

const summary = {
  createdAt: new Date().toISOString(),
  iterations,
  allPassed: results.every((run) => run.ok),
  reports: results.map((run) => `docs/audits/compliance-audit-${String(run.iteration).padStart(2, "0")}.md`)
};
fs.writeFileSync(path.join(auditDir, "compliance-audit-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.allPassed ? 0 : 1);

function check(name, files, requiredStrings = [], options = {}) {
  return () => {
    const missingFiles = files.filter((file) => !fs.existsSync(path.join(root, file)));
    const missingStrings = [];
    for (const token of requiredStrings) {
      const [maybeFile, maybeNeedle] = token.includes(":") ? token.split(/:(.*)/s).filter(Boolean) : [null, token];
      const targets = maybeFile ? [maybeFile] : files;
      const found = targets.some((file) => {
        const filePath = path.join(root, file);
        return fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").includes(maybeNeedle);
      });
      if (!found) missingStrings.push(token);
    }
    const forbiddenHits = [];
    for (const token of options.forbidden ?? []) {
      const [file, needle] = token.split(/:(.*)/s).filter(Boolean);
      const filePath = path.join(root, file);
      if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").includes(needle)) forbiddenHits.push(token);
    }
    return {
      name,
      ok: missingFiles.length === 0 && missingStrings.length === 0 && forbiddenHits.length === 0,
      missingFiles,
      missingStrings,
      forbiddenHits
    };
  };
}

function renderMarkdown(run) {
  return `# Compliance Audit ${run.iteration}\n\nCreated: ${run.createdAt}\n\nStatus: ${run.ok ? "PASS" : "FAIL"}\n\n${run.checks.map((item) => `## ${item.ok ? "PASS" : "FAIL"} - ${item.name}\n\n- missing files: ${item.missingFiles.join(", ") || "none"}\n- missing strings: ${item.missingStrings.join(", ") || "none"}\n- forbidden hits: ${item.forbiddenHits.join(", ") || "none"}\n`).join("\n")}`;
}

function readFlag(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}
