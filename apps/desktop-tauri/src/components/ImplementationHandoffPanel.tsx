import { Copy, Route } from "lucide-react";
import React from "react";
import { sourceSnapshotCodePathNode } from "../app-copy.js";

void React;

interface HandoffReadinessCheck {
  hint: string;
  label: string;
  ready: boolean;
}

interface ImplementationEvidenceCheck {
  hint: string;
  label: string;
  ready: boolean;
}

interface ImplementationReviewCheck {
  label: string;
  text: string;
}

interface ImplementationCheckpoint {
  description: string;
  label: string;
  tab: string;
  target: string;
}

interface ImplementationHandoffPanelProps {
  implementationHandoffCheckpoints: ReadonlyArray<ImplementationCheckpoint>;
  implementationHandoffPrompt: string;
  implementationHandoffReadinessChecks: HandoffReadinessCheck[];
  implementationHandoffReadinessSummary: string;
  implementationHandoffRepairPrompt: string;
  implementationResultAcceptGuardSummary: string;
  implementationResultEvidenceBlockerSummary: string;
  implementationResultEvidenceChecks: ImplementationEvidenceCheck[];
  implementationResultEvidenceNextStep: string;
  implementationResultEvidenceReady: boolean;
  implementationResultEvidenceRepairPrompt: string;
  implementationResultEvidenceSummary: string;
  implementationResultEvidenceText: string;
  implementationResultEvidenceWritingRules: string[];
  implementationResultNextActionPrompt: string;
  implementationResultReviewChecks: ImplementationReviewCheck[];
  implementationResultReviewDecision: string;
  implementationResultReviewDoneCount: number;
  implementationResultReviewNextAction: string;
  implementationResultReviewPrompt: string;
  implementationResultReviewRecordPrompt: string;
  implementationResultReviewState: Record<string, boolean>;
  implementationResultReviewSummary: string;
  implementationResultRevisionPrompt: string;
  onCopyImplementationHandoffPrompt: () => void;
  onCopyImplementationHandoffRepairPrompt: () => void;
  onCopyImplementationResultEvidenceRepairPrompt: () => void;
  onCopyImplementationResultNextActionPrompt: () => void;
  onCopyImplementationResultReviewPrompt: () => void;
  onCopyImplementationResultReviewRecordPrompt: () => void;
  onCopyImplementationResultRevisionPrompt: () => void;
  onEvidenceTextChange: (value: string) => void;
  onOpenReportTab: (tab: string, target: string) => void;
  onResetImplementationResultReview: () => void;
  onToggleImplementationResultReview: (label: string) => void;
}

export function ImplementationHandoffPanel({
  implementationHandoffCheckpoints,
  implementationHandoffPrompt,
  implementationHandoffReadinessChecks,
  implementationHandoffReadinessSummary,
  implementationHandoffRepairPrompt,
  implementationResultAcceptGuardSummary,
  implementationResultEvidenceBlockerSummary,
  implementationResultEvidenceChecks,
  implementationResultEvidenceNextStep,
  implementationResultEvidenceReady,
  implementationResultEvidenceRepairPrompt,
  implementationResultEvidenceSummary,
  implementationResultEvidenceText,
  implementationResultEvidenceWritingRules,
  implementationResultNextActionPrompt,
  implementationResultReviewChecks,
  implementationResultReviewDecision,
  implementationResultReviewDoneCount,
  implementationResultReviewNextAction,
  implementationResultReviewPrompt,
  implementationResultReviewRecordPrompt,
  implementationResultReviewState,
  implementationResultReviewSummary,
  implementationResultRevisionPrompt,
  onCopyImplementationHandoffPrompt,
  onCopyImplementationHandoffRepairPrompt,
  onCopyImplementationResultEvidenceRepairPrompt,
  onCopyImplementationResultNextActionPrompt,
  onCopyImplementationResultReviewPrompt,
  onCopyImplementationResultReviewRecordPrompt,
  onCopyImplementationResultRevisionPrompt,
  onEvidenceTextChange,
  onOpenReportTab,
  onResetImplementationResultReview,
  onToggleImplementationResultReview
}: ImplementationHandoffPanelProps) {
  return (
    <section className="implementation-handoff" aria-label="AI 구현 인계 프롬프트">
      <div>
        <h2>AI 구현 인계 프롬프트</h2>
        <p>세션 산출물을 AI에게 넘겨 첫 vertical slice, 역할 경계, 수락 기준, 검증 계획으로 바꿉니다.</p>
      </div>
      <button type="button" onClick={onCopyImplementationHandoffPrompt} title="전송 전 세션 근거, 목표, 수락 기준, 검증 기준을 검토할 구현 인계 프롬프트를 저장합니다.">
        <Copy size={15} />
        구현 인계 클립보드 저장
      </button>
      <div className="implementation-handoff-readiness">
        <span className="handoff-readiness-summary" aria-live="polite">{implementationHandoffReadinessSummary}</span>
        {implementationHandoffReadinessChecks.map((item) => (
          <span key={item.label} className={item.ready ? "ready" : "missing"}>
            {item.label}: {item.ready ? "준비됨" : "보강 필요"} · {sourceSnapshotCodePathNode(item.hint)}
          </span>
        ))}
      </div>
      <div className="implementation-handoff-repair">
        <div>
          <strong>맥락 보강 프롬프트</strong>
          <span>준비도에서 부족한 항목을 구현 전 질문과 브리프 보강문으로 바꿉니다.</span>
        </div>
        <button type="button" onClick={onCopyImplementationHandoffRepairPrompt} title="전송 전 부족한 인계 맥락을 질문 후보로 바꿀 보강 프롬프트를 저장합니다.">
          <Copy size={15} />
          맥락 보강 클립보드 저장
        </button>
        <pre>{implementationHandoffRepairPrompt}</pre>
      </div>
      <div className="implementation-result-review">
        <div>
          <strong>구현 결과 검토 프롬프트</strong>
          <span>AI가 만든 첫 구현 결과를 목적, 범위, 역할, 검증 기준으로 검토 상태 후보로 확인합니다.</span>
        </div>
        <button type="button" onClick={onCopyImplementationResultReviewPrompt} title="전송 전 변경 파일, 실행 명령, 실패/위험, 직접 확인 근거를 검토할 결과 검토 프롬프트를 저장합니다.">
          <Copy size={15} />
          결과 검토 클립보드 저장
        </button>
        <div className="implementation-result-evidence">
          <label htmlFor="implementation-result-evidence-textarea">
            <strong>구현 결과 근거 메모</strong>
            <span>AI가 바꾼 파일, 실행 명령, 실패 로그, 직접 본 화면을 적습니다.</span>
          </label>
          <ul className="implementation-result-evidence-rules" aria-label="AI 구현 결과 근거 작성 규칙">
            {implementationResultEvidenceWritingRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <textarea
            id="implementation-result-evidence-textarea"
            onChange={(event) => onEvidenceTextChange(event.target.value)}
            placeholder="예: 변경 파일 apps/..., 실행 명령 pnpm build PASS, 화면에서 클립보드 저장 확인, 남은 실패 로그 없음"
            rows={4}
            value={implementationResultEvidenceText}
          />
          <div className="implementation-result-evidence-readiness">
            <span className="evidence-readiness-summary" aria-live="polite">{implementationResultEvidenceSummary}</span>
            {implementationResultEvidenceChecks.map((item) => (
              <span key={item.label} className={item.ready ? "ready" : "missing"}>
                {item.label}: {item.ready ? "준비됨" : "보강 필요"} · {sourceSnapshotCodePathNode(item.hint)}
              </span>
            ))}
          </div>
          <div className="implementation-result-evidence-repair">
            <div>
              <strong>근거 보강 프롬프트</strong>
              <span>부족한 증거와 검증 기준을 검토 상태 후보 전에 AI에게 수집시키는 요청문으로 바꿉니다.</span>
            </div>
            <button type="button" onClick={onCopyImplementationResultEvidenceRepairPrompt} title="전송 전 부족한 증거와 검증 기준만 수집할 근거 보강 프롬프트를 저장합니다.">
              <Copy size={15} />
              근거 보강 클립보드 저장
            </button>
            <pre>{implementationResultEvidenceRepairPrompt}</pre>
          </div>
        </div>
        <div className="implementation-result-checklist">
          <span className="result-review-summary" aria-live="polite">{implementationResultReviewSummary}</span>
          {implementationResultReviewChecks.map((item) => (
            <label key={item.label} className={implementationResultReviewState[item.label] ? "checked" : ""}>
              <input
                checked={Boolean(implementationResultReviewState[item.label])}
                onChange={() => onToggleImplementationResultReview(item.label)}
                type="checkbox"
              />
              {item.label}: {item.text}
            </label>
          ))}
          <button type="button" disabled={implementationResultReviewDoneCount === 0} onClick={onResetImplementationResultReview}>결과 검토 초기화</button>
        </div>
        <fieldset className="implementation-result-decision">
          <legend className="sr-only">AI 구현 결과 검토 상태 요약</legend>
          <div className={implementationResultEvidenceReady ? "implementation-result-evidence-blocker ready" : "implementation-result-evidence-blocker blocked"}>
            <strong>{implementationResultEvidenceBlockerSummary}</strong>
            <span>{implementationResultEvidenceNextStep}</span>
          </div>
          <span>
            <strong>검토 상태</strong>
            {implementationResultReviewDecision}
          </span>
          <span>
            <strong>확인 기준</strong>
            {implementationResultReviewDoneCount}/{implementationResultReviewChecks.length}
          </span>
          <span>
            <strong>남은 기준</strong>
            {implementationResultReviewChecks.length - implementationResultReviewDoneCount}
          </span>
          <span>
            <strong>근거</strong>
            {implementationResultEvidenceReady ? "통과" : "차단"}
          </span>
          <span className={implementationResultReviewDecision === "ACCEPT_REVIEW 검토 후보" ? "accept-guard ready" : "accept-guard blocked"}>
            <strong>ACCEPT_REVIEW 가드</strong>
            {implementationResultAcceptGuardSummary}
          </span>
          <span>
            <strong>다음 행동</strong>
            {implementationResultReviewNextAction}
          </span>
        </fieldset>
        <div className="implementation-result-next-action">
          <div>
            <strong>결과 다음 행동 프롬프트</strong>
            <span>현재 검토 상태에 맞춰 멈춤, 재작업, 다음 작은 개선 중 하나를 AI 지시문으로 바꿉니다.</span>
          </div>
          <button type="button" onClick={onCopyImplementationResultNextActionPrompt} title="전송 전 현재 검토 상태 근거를 확인할 다음 행동 프롬프트를 저장합니다.">
            <Copy size={15} />
            다음 행동 클립보드 저장
          </button>
          <pre>{implementationResultNextActionPrompt}</pre>
        </div>
        <div className="implementation-result-revision">
          <div>
            <strong>결과 재작업 프롬프트</strong>
            <span>체크하지 못한 기준을 REVISE/BLOCK 수정 요청으로 바꿉니다.</span>
          </div>
          <button type="button" onClick={onCopyImplementationResultRevisionPrompt} title="전송 전 누락 검토 기준만 수정 요청으로 바꿀 재작업 프롬프트를 저장합니다.">
            <Copy size={15} />
            재작업 요청 클립보드 저장
          </button>
          <pre>{implementationResultRevisionPrompt}</pre>
        </div>
        <div className="implementation-result-record">
          <div>
            <strong>결과 검토 기록 프롬프트</strong>
            <span>현재 검토 상태와 남은 검토 기준을 다음 학습 기록으로 남깁니다.</span>
          </div>
          <button type="button" onClick={onCopyImplementationResultReviewRecordPrompt} title="전송 전 검토 상태 근거와 남은 검토 기준을 확인할 검토 기록 프롬프트를 저장합니다.">
            <Copy size={15} />
            결과 기록 클립보드 저장
          </button>
          <pre>{implementationResultReviewRecordPrompt}</pre>
        </div>
        <pre>{implementationResultReviewPrompt}</pre>
      </div>
      <pre>{implementationHandoffPrompt}</pre>
      <div className="implementation-handoff-links">
        {implementationHandoffCheckpoints.map((checkpoint) => (
          <button type="button" key={checkpoint.target} onClick={() => onOpenReportTab(checkpoint.tab, checkpoint.target)} title={checkpoint.description}>
            <Route size={15} />
            <span>{checkpoint.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
