import { Copy, FileText, RotateCcw, Route, Trash2 } from "lucide-react";
import React from "react";
import { formatBytes, sourceSnapshotCodePathNode } from "../app-copy.js";
import type { SourcePruneResponse } from "../types.js";

void React;

interface RetainedLearningArtifact {
  bytes: number;
  path: string;
  present: boolean;
}

interface SourceRetentionActionTarget {
  label: string;
  tab: string;
  target: string;
}

interface SourceCleanupCheckpoint {
  description: string;
  label: string;
  tab: string;
  target: string;
}

interface SourceRetentionPanelProps {
  learnerCleanupApplyWhenDisplay: string[];
  learnerCleanupHoldWhenDisplay: string[];
  onApplySourceRetentionCleanup: () => void;
  onCopySourceRetentionDecisionPrompt: () => void;
  onOpenReportTab: (tab: string, target: string) => void;
  onRefreshSourceRetention: () => void;
  preservedArtifactCount: number;
  preservedArtifactTotal: number;
  pruneRunning: boolean;
  retainedLearningArtifactPreview: RetainedLearningArtifact[];
  retainedLearningArtifactSummary: string;
  sourceAbsorptionActionTarget: SourceRetentionActionTarget;
  sourceAbsorptionEvidence: string;
  sourceAbsorptionNextAction: string;
  sourceAbsorptionVerdict: string;
  sourceCleanupCheckpoints: ReadonlyArray<SourceCleanupCheckpoint>;
  sourceKnowledgePolicy: string | undefined;
  sourceKnowledgePolicyLabel: string;
  sourcePrune: SourcePruneResponse | null;
  sourceRetentionDecisionPrompt: string;
  sourceRetentionRecommendation: string;
  sourceRetentionStatusLabel: string;
}

export function SourceRetentionPanel({
  learnerCleanupApplyWhenDisplay,
  learnerCleanupHoldWhenDisplay,
  onApplySourceRetentionCleanup,
  onCopySourceRetentionDecisionPrompt,
  onOpenReportTab,
  onRefreshSourceRetention,
  preservedArtifactCount,
  preservedArtifactTotal,
  pruneRunning,
  retainedLearningArtifactPreview,
  retainedLearningArtifactSummary,
  sourceAbsorptionActionTarget,
  sourceAbsorptionEvidence,
  sourceAbsorptionNextAction,
  sourceAbsorptionVerdict,
  sourceCleanupCheckpoints,
  sourceKnowledgePolicy,
  sourceKnowledgePolicyLabel,
  sourcePrune,
  sourceRetentionDecisionPrompt,
  sourceRetentionRecommendation,
  sourceRetentionStatusLabel
}: SourceRetentionPanelProps) {
  return (
    <section className="retention-panel" aria-label="소스 보존 상태">
      <div>
        <h2>소스 보존 상태</h2>
        <p>{sourceSnapshotCodePathNode(sourceRetentionRecommendation)}</p>
        <p className="retention-purpose">AI는 일반 개발지식을 이미 가지고 있습니다. 생성된 세션 <code>source/</code> 스냅샷은 영구 내장 지식이 아니라 목적, 아키텍처, 용어, 프롬프트, 검증 기준을 추출하기 위한 임시 근거입니다.</p>
      </div>
      <dl>
        <div><dt>상태</dt><dd>{sourceRetentionStatusLabel}</dd></div>
        <div><dt>세션 스냅샷</dt><dd>{sourcePrune?.sourcePresent ? "있음" : sourcePrune?.sourcePruned ? "정리됨" : "없음"}</dd></div>
        <div><dt>크기</dt><dd>{formatBytes(sourcePrune?.sourceBytes ?? 0)}</dd></div>
        <div><dt>차단</dt><dd>{sourcePrune?.blockers.length ? sourcePrune.blockers.join(", ") : "없음"}</dd></div>
      </dl>
      <div className="retention-actions">
        <button type="button" onClick={onRefreshSourceRetention} disabled={pruneRunning} title="생성된 세션 source/ 스냅샷 보존 상태를 다시 확인합니다.">
          <RotateCcw size={15} />
          상태 확인
        </button>
        <button type="button" onClick={onApplySourceRetentionCleanup} disabled={pruneRunning || !sourcePrune?.applyReady} title="dry-run plan, 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인 후 DELETE-SOURCE-SNAPSHOT 확인 토큰으로 생성된 세션 source/ 스냅샷만 정리합니다. READY_REVIEW는 정리 검토 후보이지 최종 ACCEPT, 배포, 삭제 허가가 아닙니다.">
          <Trash2 size={15} />
          토큰 확인 후 세션 스냅샷만 정리
        </button>
        <button type="button" onClick={onCopySourceRetentionDecisionPrompt} disabled={pruneRunning} title="전송 전 보존 증거 묶음, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰 조건을 검토할 보존/정리 판단 프롬프트를 저장합니다.">
          <Copy size={15} />
          정리 판단 클립보드 저장
        </button>
      </div>
      <section className="absorption-summary" aria-label="소스 흡수 요약">
        <div>
          <h3>소스 흡수 요약</h3>
          <p>{sourceSnapshotCodePathNode(sourceAbsorptionEvidence)}</p>
        </div>
        <dl>
          <div><dt>흡수 산출물</dt><dd>{preservedArtifactTotal > 0 ? `${preservedArtifactCount}/${preservedArtifactTotal}` : "확인 전"}</dd></div>
          <div><dt>현재 목표 조사</dt><dd>{sourceAbsorptionVerdict}</dd></div>
          <div><dt>검증 기준</dt><dd>{sourcePrune?.checks?.sessionVerificationOk ? "세션 검증 PASS · 검증 기록 확인" : "세션 검증/검증 기록 확인 필요"}</dd></div>
          <div><dt>다음 행동</dt><dd>{sourceSnapshotCodePathNode(sourceAbsorptionNextAction)}</dd></div>
        </dl>
        <button type="button" onClick={() => sourcePrune ? onOpenReportTab(sourceAbsorptionActionTarget.tab, sourceAbsorptionActionTarget.target) : onRefreshSourceRetention()} title={sourceAbsorptionNextAction}>
          <Route size={15} />
          {sourceAbsorptionActionTarget.label}
        </button>
      </section>
      <section className="retained-learning-assets" aria-label="보존 학습 자산">
        <div>
          <h3>보존 학습 자산</h3>
          <p>{sourceSnapshotCodePathNode(sourceKnowledgePolicyLabel)}</p>
        </div>
        <dl>
          <div><dt>증거 묶음</dt><dd>{retainedLearningArtifactSummary}</dd></div>
          <div><dt>정책</dt><dd>{sourceKnowledgePolicy ? "정리 정책 기록됨" : sourcePrune?.checks?.preservedEvidenceBundleOk ? "정리 전 증거 확인됨" : "확인 필요"}</dd></div>
        </dl>
        {retainedLearningArtifactPreview.length > 0 ? (
          <ul>
            {retainedLearningArtifactPreview.map((artifact) => (
              <li key={artifact.path}>
                <span>{artifact.present ? "PASS" : "MISSING"}</span>
                <code>{artifact.path}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="retained-learning-empty">상태 확인을 실행하면 생성된 세션 <code>source/</code> 스냅샷 대신 남겨야 할 핵심 학습 자산이 표시됩니다.</p>
        )}
      </section>
      <section className="cleanup-decision-conditions" aria-label="정리 판단 조건">
        <div>
          <h3>정리 검토 조건</h3>
          <ul>
            {learnerCleanupApplyWhenDisplay.map((condition) => (
              <li key={condition}>{sourceSnapshotCodePathNode(condition)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>정리 보류 조건</h3>
          <ul>
            {learnerCleanupHoldWhenDisplay.map((condition) => (
              <li key={condition}>{sourceSnapshotCodePathNode(condition)}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="retention-prompt-preview" aria-label="소스 정리 판단 프롬프트 미리보기">
        <div>
          <h3>소스 정리 판단 프롬프트 미리보기</h3>
          <p>클립보드 저장 전에 AI에게 전달될 보존/정리 판단 맥락을 확인합니다.</p>
        </div>
        <pre>{sourceRetentionDecisionPrompt}</pre>
      </section>
      <div className="retention-checkpoints">
        <p>정리 전 확인: 생성된 세션 <code>source/</code> 스냅샷을 보관하는 목적이 아니라, 비슷한 앱을 AI와 만들기 위한 설명과 검증 기준이 남았는지 확인합니다.</p>
        {sourceCleanupCheckpoints.map((checkpoint) => (
          <button type="button" key={checkpoint.target} onClick={() => onOpenReportTab(checkpoint.tab, checkpoint.target)} title={checkpoint.description}>
            <FileText size={15} />
            <span>{checkpoint.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
