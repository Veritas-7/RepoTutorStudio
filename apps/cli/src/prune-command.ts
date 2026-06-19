import { applySourcePrunePlan, sourcePruneApplyMarkdown, sourcePrunePlanMarkdown, writeSourcePrunePlan } from "@repotutor/core";
import type { ParsedArgs } from "./args.js";
import { stringFlag } from "./flags.js";
import { resolveSessionRoot } from "./session-utils.js";

export async function pruneSource(parsed: ParsedArgs): Promise<void> {
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
