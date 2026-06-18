import fs from "node:fs/promises";
import path from "node:path";
import { isSourcePruned } from "./evidence.js";
import { verifyStudySessionArtifacts } from "./session-verifier.js";

export interface SourcePrunePlanArtifact {
  path: string;
  present: boolean;
  bytes: number;
}

export interface SourcePruneLearnerCleanupDecision {
  sourcePurpose: string;
  applyWhen: string[];
  holdWhen: string[];
  retainedEvidence: string[];
}

export interface SourcePrunePlan {
  schemaVersion: 1;
  generatedAt: string;
  sessionRoot: string;
  sourcePath: string;
  sourcePresent: boolean;
  sourcePruned: boolean;
  sourceFiles: number;
  sourceBytes: number;
  applyReady: boolean;
  blockers: string[];
  checks: {
    sessionVerificationOk: boolean;
    requiredArtifactsOk: boolean;
    htmlExportOk: boolean;
    evidenceIndexOk: boolean;
    preservedArtifactsOk: boolean;
    preservedEvidenceBundleOk: boolean;
  };
  preservedArtifacts: SourcePrunePlanArtifact[];
  preservedEvidenceBundle: SourcePrunePlanArtifact[];
  sourceKnowledgePolicy: string;
  learnerCleanupDecision: SourcePruneLearnerCleanupDecision;
  recommendedAction: string;
}

export interface SourcePruneApplyResult {
  schemaVersion: 1;
  appliedAt: string;
  sessionRoot: string;
  sourcePath: string;
  removedFiles: number;
  removedBytes: number;
  applyReportPath: string;
  tombstonePath: string;
  planReportPath: string;
  planMarkdownPath: string;
  sourceKnowledgePolicy: string;
  learnerCleanupDecision: SourcePruneLearnerCleanupDecision;
  retainedLearningArtifacts: SourcePrunePlanArtifact[];
  applied: true;
}

export const SOURCE_PRUNE_CONFIRMATION_TOKEN = "DELETE-SOURCE-SNAPSHOT";

export interface SourcePruneApplyOptions {
  confirm?: string;
}

const REQUIRED_PRESERVED_ARTIFACTS = [
  "reference/learner-role-contract.html",
  "reference/learner-role-contract.md",
  "reference/architecture-principle-playbook.html",
  "reference/architecture-principle-playbook.md",
  "reference/source-to-build-interview.html",
  "reference/source-to-build-interview.md",
  "reference/similar-app-transfer-map.html",
  "reference/similar-app-transfer-map.md",
  "reference/learner-goal-alignment.html",
  "reference/learner-goal-alignment.md",
  "reference/ai-implementation-loop.html",
  "reference/ai-implementation-loop.md",
  "reference/ai-output-review-rubric.html",
  "reference/ai-output-review-rubric.md",
  "reference/vibe-coding-mastery-checklist.html",
  "reference/vibe-coding-mastery-checklist.md",
  "reference/vibe-coding-implementation-brief.html",
  "reference/vibe-coding-implementation-brief.md",
  "reference/ai-prompt-readiness-checklist.html",
  "reference/ai-prompt-readiness-checklist.md",
  "reference/ai-prompt-ab-lab.html",
  "reference/ai-prompt-ab-lab.md",
  "reference/source-absorption-ledger.html",
  "reference/source-absorption-ledger.md",
  "reference/source-retention-guide.html",
  "html/daily-summary.html",
  "html/vibe-coding-prompt-pack.html",
  "html/session-verification.html",
  "markdown/session-verification.md",
  "analysis/session-verification-report.json",
  "analysis/source-snapshot-report.json"
];

const PRESERVED_EVIDENCE_BUNDLE_ARTIFACTS = [
  "reference/source-absorption-ledger.html",
  "analysis/daily-summary-report.json",
  "html/vibe-coding-prompt-pack.html",
  "reference/vibe-coding-implementation-brief.html",
  "html/session-verification.html",
  "reference/source-retention-guide.html"
];

const SOURCE_KNOWLEDGE_POLICY = "source/ was temporary project evidence, not embedded AI development knowledge.";

const LEARNER_CLEANUP_DECISION: SourcePruneLearnerCleanupDecision = {
  sourcePurpose: "Use source/ as project-specific evidence for purpose, architecture reasons, role terms, AI prompts, acceptance criteria, and verification boundaries.",
  applyWhen: [
    "The source absorption ledger explains what was absorbed from the project.",
    "The implementation brief and prompt pack let the learner ask AI to build a similar first vertical slice.",
    "Session verification, verification records, and the preserved evidence bundle all pass.",
    "The learner explicitly confirms that source links no longer need to open for this learning goal.",
    "The learner can explain architecture reasons, role boundaries, AI prompts, acceptance criteria, and verification criteria without opening source links."
  ],
  holdWhen: [
    "A new feature's architecture reason is still unclear.",
    "Role boundaries or file responsibilities cannot be explained.",
    "Verification commands, verification records, or human review criteria are missing.",
    "The learner has not explicitly confirmed that source links are no longer needed for the current learning goal.",
    "The retained reports cannot answer whether more source investigation is needed."
  ],
  retainedEvidence: PRESERVED_EVIDENCE_BUNDLE_ARTIFACTS
};

export async function createSourcePrunePlan(sessionRoot: string): Promise<SourcePrunePlan> {
  const resolvedRoot = path.resolve(sessionRoot);
  const sourcePath = path.join(resolvedRoot, "source");
  const source = await directoryStats(sourcePath);
  const sourcePruned = await isSourcePruned(resolvedRoot);
  const preservedArtifacts = await Promise.all(REQUIRED_PRESERVED_ARTIFACTS.map((artifactPath) => artifactStats(resolvedRoot, artifactPath)));
  const preservedEvidenceBundle = await Promise.all(PRESERVED_EVIDENCE_BUNDLE_ARTIFACTS.map((artifactPath) => artifactStats(resolvedRoot, artifactPath)));
  const sessionVerification = await verifyStudySessionArtifacts(resolvedRoot);
  const blockers: string[] = [];

  if (!source.present && !sourcePruned) blockers.push("source-snapshot-missing");
  if (!sessionVerification.ok) blockers.push("session-verification-not-passing");
  if (!sessionVerification.checks.requiredArtifacts) blockers.push("required-artifacts-not-passing");
  if (!sessionVerification.checks.htmlExport) blockers.push("html-export-not-passing");
  if (!sessionVerification.checks.evidenceIndex) blockers.push("evidence-index-not-passing");

  for (const artifact of preservedArtifacts) {
    if (!artifact.present) blockers.push(`missing-preserved-artifact:${artifact.path}`);
  }
  for (const artifact of preservedEvidenceBundle) {
    if (!artifact.present) blockers.push(`missing-preserved-evidence-bundle:${artifact.path}`);
  }

  const applyReady = blockers.length === 0 && source.present && !sourcePruned;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sessionRoot: resolvedRoot,
    sourcePath,
    sourcePresent: source.present,
    sourcePruned,
    sourceFiles: source.files,
    sourceBytes: source.bytes,
    applyReady,
    blockers,
    checks: {
      sessionVerificationOk: sessionVerification.ok,
      requiredArtifactsOk: sessionVerification.checks.requiredArtifacts,
      htmlExportOk: sessionVerification.checks.htmlExport,
      evidenceIndexOk: sessionVerification.checks.evidenceIndex,
      preservedArtifactsOk: preservedArtifacts.every((artifact) => artifact.present),
      preservedEvidenceBundleOk: preservedEvidenceBundle.every((artifact) => artifact.present)
    },
    preservedArtifacts,
    preservedEvidenceBundle,
    sourceKnowledgePolicy: SOURCE_KNOWLEDGE_POLICY,
    learnerCleanupDecision: cloneLearnerCleanupDecision(),
    recommendedAction: sourcePruned
      ? "Already cleaned up: the generated session `source/` snapshot has been cleaned up and the retained learning artifacts remain verifiable."
      : applyReady
        ? "Dry-run only: the generated session `source/` snapshot is a cleanup review candidate after session verification, verification records, the preserved evidence bundle, learner explicit confirmation that source links no longer need to open for this learning goal, and the explicit `DELETE-SOURCE-SNAPSHOT` confirmation token; READY_REVIEW alone is not final ACCEPT, deployment, or cleanup permission."
        : "Keep the generated session `source/` snapshot for now. Resolve blockers first so the learner keeps the role contract, architecture principle playbook, source-to-build interview, similar-app transfer map, learner goal alignment, AI implementation loop, AI output review rubric, mastery checklist, implementation brief, prompt readiness checklist, prompt A/B lab, absorbed guide, verification report, verification records, prompt pack, source retention decision, and preserved evidence bundle."
  };
}

function cloneLearnerCleanupDecision(): SourcePruneLearnerCleanupDecision {
  return {
    sourcePurpose: LEARNER_CLEANUP_DECISION.sourcePurpose,
    applyWhen: [...LEARNER_CLEANUP_DECISION.applyWhen],
    holdWhen: [...LEARNER_CLEANUP_DECISION.holdWhen],
    retainedEvidence: [...LEARNER_CLEANUP_DECISION.retainedEvidence]
  };
}

export async function writeSourcePrunePlan(sessionRoot: string): Promise<{ plan: SourcePrunePlan; reportPath: string; markdownPath: string }> {
  const resolvedRoot = path.resolve(sessionRoot);
  const plan = await createSourcePrunePlan(resolvedRoot);
  const reportPath = path.join(resolvedRoot, "analysis", "source-prune-plan.json");
  const markdownPath = path.join(resolvedRoot, "markdown", "source-prune-plan.md");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.mkdir(path.dirname(markdownPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(plan, null, 2)}\n`);
  await fs.writeFile(markdownPath, sourcePrunePlanMarkdown(plan));
  return { plan, reportPath, markdownPath };
}

export async function applySourcePrunePlan(sessionRoot: string, options: SourcePruneApplyOptions = {}): Promise<{ plan: SourcePrunePlan; apply: SourcePruneApplyResult }> {
  if (options.confirm !== SOURCE_PRUNE_CONFIRMATION_TOKEN) {
    throw new Error(`source prune apply requires confirm ${SOURCE_PRUNE_CONFIRMATION_TOKEN}.`);
  }
  const resolvedRoot = path.resolve(sessionRoot);
  const { plan, reportPath, markdownPath } = await writeSourcePrunePlan(resolvedRoot);
  if (!plan.applyReady) {
    throw new Error(`Source prune is blocked: ${plan.blockers.join(", ") || "unknown blocker"}`);
  }
  const relativeSource = path.relative(resolvedRoot, plan.sourcePath);
  if (relativeSource !== "source") {
    throw new Error("Refusing to prune a path that is not inside the generated session `source/` snapshot.");
  }
  const removedFiles = plan.sourceFiles;
  const removedBytes = plan.sourceBytes;
  await fs.rm(plan.sourcePath, { recursive: true, force: false });
  const applyReportPath = path.join(resolvedRoot, "analysis", "source-prune-applied.json");
  const tombstonePath = path.join(resolvedRoot, "SOURCE-PRUNED.md");
  const apply: SourcePruneApplyResult = {
    schemaVersion: 1,
    appliedAt: new Date().toISOString(),
    sessionRoot: resolvedRoot,
    sourcePath: plan.sourcePath,
    removedFiles,
    removedBytes,
    applyReportPath,
    tombstonePath,
    planReportPath: reportPath,
    planMarkdownPath: markdownPath,
    sourceKnowledgePolicy: SOURCE_KNOWLEDGE_POLICY,
    learnerCleanupDecision: cloneLearnerCleanupDecision(),
    retainedLearningArtifacts: plan.preservedEvidenceBundle,
    applied: true
  };
  await fs.mkdir(path.dirname(applyReportPath), { recursive: true });
  await fs.writeFile(applyReportPath, `${JSON.stringify(apply, null, 2)}\n`);
  await fs.writeFile(tombstonePath, sourcePruneApplyMarkdown(apply));
  return { plan, apply };
}

export function sourcePrunePlanMarkdown(plan: SourcePrunePlan): string {
  const status = plan.applyReady ? "READY_REVIEW" : "BLOCKED";
  const statusLabel = plan.applyReady ? "READY_REVIEW (review candidate, token-required before cleanup)" : status;
  const blockers = plan.blockers.length > 0 ? plan.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- none";
  const preservedArtifacts = plan.preservedArtifacts
    .map((artifact) => `- ${artifact.present ? "PASS" : "MISSING"} \`${artifact.path}\` (${formatBytes(artifact.bytes)})`)
    .join("\n");
  const preservedEvidenceBundle = plan.preservedEvidenceBundle
    .map((artifact) => `- ${artifact.present ? "PASS" : "MISSING"} \`${artifact.path}\` (${formatBytes(artifact.bytes)})`)
    .join("\n");
  return `# RepoTutor Source Prune Plan

- Status: ${statusLabel}
- Status meaning: READY_REVIEW is a learner cleanup review candidate, not final ACCEPT, deployment, or deletion permission.
- Session root: ${plan.sessionRoot}
- Source path: ${plan.sourcePath}
- Source present: ${plan.sourcePresent ? "yes" : "no"}
- Source pruned: ${plan.sourcePruned ? "yes" : "no"}
- Source files: ${plan.sourceFiles}
- Source bytes: ${plan.sourceBytes} (${formatBytes(plan.sourceBytes)})
- Generated: ${plan.generatedAt}

## Checks

- Session verification: ${plan.checks.sessionVerificationOk ? "PASS" : "FAIL"}
- Required artifacts: ${plan.checks.requiredArtifactsOk ? "PASS" : "FAIL"}
- HTML export: ${plan.checks.htmlExportOk ? "PASS" : "FAIL"}
- Evidence index: ${plan.checks.evidenceIndexOk ? "PASS" : "FAIL"}
- Preserved artifacts: ${plan.checks.preservedArtifactsOk ? "PASS" : "FAIL"}
- Preserved evidence bundle: ${plan.checks.preservedEvidenceBundleOk ? "PASS" : "FAIL"}

## Preserved Artifacts

${preservedArtifacts}

## Preserved Evidence Bundle

이 묶음은 생성된 세션 \`source/\` 스냅샷 정리 전 반드시 남아야 합니다. 사용자 원본
소스를 장기 앱 지식으로 보관하지 않아도 학습 목적, 아키텍처 이유, AI 프롬프트,
검증 경계, 정리 판단을 복습하고 AI에게 다시 지시할 수 있게 만드는 최소 증거입니다.

${preservedEvidenceBundle}

## 학습자 정리 판단

생성된 세션 \`source/\` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아닙니다. 이 세션에서는 특정 프로젝트의 목적, 아키텍처 이유, 역할 용어, AI 프롬프트, 검증 기준을 뽑는 임시 증거로만 사용합니다.

- 정리 전 확인: 학습 목적과 새 앱의 사용자 문제가 daily summary 또는 implementation brief에 남아 있나요?
- 정리 전 확인: AI에게 보낼 프롬프트가 source evidence와 acceptance criteria를 포함하나요?
- 정리 전 확인: 세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS인가요?
- 정리 전 확인: 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 학습자가 비슷한 앱을 지시하고 리뷰할 수 있나요?
- 정리 전 명시 확인: 학습자가 현재 학습 목표에서는 source 링크가 더 이상 열리지 않아도 된다고 직접 확인했나요?
- 정리 보류: 새 기능의 아키텍처 이유, 역할 경계, 검증 명령, 사람 판단 기준 중 하나라도 설명하지 못하면 source/ cleanup을 보류합니다.
- 정리 보류: 학습자의 명시 확인이 없으면 READY_REVIEW 상태여도 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.

## Blockers

${blockers}

## Recommended Action

${plan.recommendedAction}
`;
}

export function sourcePruneApplyMarkdown(apply: SourcePruneApplyResult): string {
  return `# Generated Session \`source/\` Snapshot Pruned

- Applied: ${apply.appliedAt}
- Session root: ${apply.sessionRoot}
- Removed source path: ${apply.sourcePath}
- Removed files: ${apply.removedFiles}
- Removed bytes: ${apply.removedBytes} (${formatBytes(apply.removedBytes)})
- Plan report: ${apply.planReportPath}
- Plan markdown: ${apply.planMarkdownPath}

The generated session \`source/\` snapshot for this study session was cleaned up
after the preserved learning artifacts passed the prune gate. RepoTutor retained
the generated lessons, reference pages, prompt guidance, verification summary,
and source absorption ledger. Source links in older evidence pages may no longer
open unless the source is imported again.

The core apply guard requires the explicit \`DELETE-SOURCE-SNAPSHOT\` token.
RepoTutor UI and CLI prompts should collect that token only after the learner
has checked the dry-run plan, confirmed the preserved evidence bundle, and
explicitly confirmed that source links no longer need to open for the current
learning goal.

## 정리 판단 조건

생성된 세션 \`source/\` 스냅샷은 특정 프로젝트 맥락을 뽑기 위한 임시 증거였고,
앱에 내장할 일반 개발 지식이 아닙니다. 정리 판단은 아래 조건을 기준으로 남깁니다.

### 정리 검토 조건

${apply.learnerCleanupDecision.applyWhen.map((item) => `- ${item}`).join("\n")}

### 정리 보류 조건

${apply.learnerCleanupDecision.holdWhen.map((item) => `- ${item}`).join("\n")}

## 남긴 학습 자산

생성된 세션 \`source/\` 스냅샷은 AI에게 개발 지식을 새로 가르치는 내장 데이터가 아니라,
특정 프로젝트의 목적, 아키텍처 이유, 역할 용어, AI 프롬프트, 검증 기준을
뽑기 위한 임시 증거였습니다. 정리 후 학습은 보존된 리포트와 프롬프트를
기준으로 이어갑니다.

- source-absorption-ledger: 어떤 기능과 판단을 앱에 흡수했는지 확인
- daily-summary-report: 오늘의 학습 목적과 source handling 판단 확인
- vibe-coding-prompt-pack: 비슷한 앱을 AI에게 지시할 프롬프트 확인
- vibe-coding-implementation-brief: 첫 구현 단위, 수락 기준, 검증 계획 확인
- session-verification: 보존 산출물과 검증 경계 확인
- source-retention-guide: 생성된 세션 \`source/\` 스냅샷 재확인 필요 여부 판단

## 다시 소스가 필요한 경우

새 기능의 아키텍처 이유, 역할 경계, 검증 명령, 사람 판단 기준을
보존 산출물만으로 설명하지 못하면 같은 원본 저장소나 폴더에서 새 세션
\`source/\` 스냅샷을 다시 생성해 분석합니다. 사용자 원본 소스 전체를 장기 앱
지식으로 보관하지 않습니다.
`;
}

async function artifactStats(root: string, relativePath: string): Promise<SourcePrunePlanArtifact> {
  try {
    const stat = await fs.stat(path.join(root, relativePath));
    return { path: relativePath, present: stat.isFile(), bytes: stat.isFile() ? stat.size : 0 };
  } catch {
    return { path: relativePath, present: false, bytes: 0 };
  }
}

async function directoryStats(directoryPath: string): Promise<{ present: boolean; files: number; bytes: number }> {
  try {
    const stat = await fs.lstat(directoryPath);
    if (!stat.isDirectory()) return { present: false, files: 0, bytes: 0 };
  } catch {
    return { present: false, files: 0, bytes: 0 };
  }

  let files = 0;
  let bytes = 0;
  const pending = [directoryPath];
  while (pending.length > 0) {
    const current = pending.pop() as string;
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      const stat = await fs.lstat(entryPath);
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        pending.push(entryPath);
      } else {
        files += 1;
        bytes += stat.size;
      }
    }
  }
  return { present: true, files, bytes };
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && size >= 1024; index += 1) {
    size /= 1024;
    unit = units[index];
  }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${unit}`;
}
