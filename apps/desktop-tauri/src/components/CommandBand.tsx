import { Copy, KeyRound, Play, Square } from "lucide-react";
import React from "react";
import { levelLabels, modeLabels, sourceSnapshotCodePathNode } from "../app-copy.js";
import type { LearnerLevel, StudyMode } from "../types.js";

void React;

interface LearnerBriefReadinessCheck {
  hint: string;
  label: string;
  ready: boolean;
}

interface AiResponseReviewCheck {
  label: string;
  text: string;
}

interface CommandBandProps {
  aiResponseReviewDoneCount: number;
  aiResponseReviewState: Record<string, boolean>;
  aiResponseReviewSummary: string;
  aiResponseRevisionPrompt: string;
  learnerAiResponseReviewChecks: AiResponseReviewCheck[];
  learnerBriefReadinessChecks: LearnerBriefReadinessCheck[];
  learnerBriefReadinessSummary: string;
  learnerBriefText: string;
  learnerBriefNextStep: string;
  learnerPromptDraft: string;
  level: LearnerLevel;
  mode: StudyMode;
  onAddLearnerBriefScaffold: () => void;
  onCopyAiResponseRevisionPrompt: () => void;
  onCopyLearnerPromptDraft: () => void;
  onLearnerBriefTextChange: (value: string) => void;
  onLevelChange: (value: LearnerLevel) => void;
  onModeChange: (value: StudyMode) => void;
  onResetAiResponseReview: () => void;
  onSourceChange: (value: string) => void;
  onStartStudy: () => void;
  onToggleAiResponseReview: (label: string) => void;
  running: boolean;
  source: string;
}

export function CommandBand({
  aiResponseReviewDoneCount,
  aiResponseReviewState,
  aiResponseReviewSummary,
  aiResponseRevisionPrompt,
  learnerAiResponseReviewChecks,
  learnerBriefReadinessChecks,
  learnerBriefReadinessSummary,
  learnerBriefText,
  learnerBriefNextStep,
  learnerPromptDraft,
  level,
  mode,
  onAddLearnerBriefScaffold,
  onCopyAiResponseRevisionPrompt,
  onCopyLearnerPromptDraft,
  onLearnerBriefTextChange,
  onLevelChange,
  onModeChange,
  onResetAiResponseReview,
  onSourceChange,
  onStartStudy,
  onToggleAiResponseReview,
  running,
  source
}: CommandBandProps) {
  return (
    <section className="command-band">
      <div className="source-input">
        <label htmlFor="source-target-input">GitHub URL / 로컬 폴더 / ZIP / SKILL.md</label>
        <input id="source-target-input" value={source} onChange={(event) => onSourceChange(event.target.value)} />
      </div>
      <div className="learner-brief-input">
        <label htmlFor="learner-brief-textarea">내 목표 / PRD / 이슈 / AI 프롬프트</label>
        <textarea
          id="learner-brief-textarea"
          value={learnerBriefText}
          onChange={(event) => onLearnerBriefTextChange(event.target.value)}
          placeholder="예: 이 소스처럼 학습 앱을 만들고 싶다. 첫 기능은 GitHub 소스를 분석해서 아키텍처, 용어, 프롬프트, 검증 기준을 보여주는 것이다."
        />
        <fieldset className="brief-readiness">
          <legend className="sr-only">바이브코딩 브리프 준비도</legend>
          <span className="brief-readiness-note">문법 암기보다 AI에게 줄 맥락</span>
          <span className="brief-readiness-summary" aria-live="polite">{learnerBriefReadinessSummary}</span>
          <span className="brief-readiness-next" aria-live="polite">{learnerBriefNextStep}</span>
          {learnerBriefReadinessChecks.map((item) => (
            <span key={item.label} className={item.ready ? "ready" : "missing"}>
              {item.label}: {item.ready ? "준비됨" : "보강 필요"} · {sourceSnapshotCodePathNode(item.hint)}
            </span>
          ))}
          <button type="button" className="brief-scaffold-button" onClick={onAddLearnerBriefScaffold}>브리프 예시 추가</button>
        </fieldset>
        <div className="brief-prompt-draft">
          <div className="prompt-draft-header">
            <strong>AI 구현 지시문 초안</strong>
            <button type="button" className="prompt-copy-button" onClick={onCopyLearnerPromptDraft} title="전송 전 목표, 소스 근거, 수락 기준, 검증 기준을 검토할 AI 구현 지시문 초안을 저장합니다.">
              <Copy size={14} />
              AI 지시문 클립보드 저장
            </button>
          </div>
          <pre>{learnerPromptDraft}</pre>
        </div>
        <div className="ai-response-review">
          <strong>AI 응답 검토 기준</strong>
          <span className="ai-response-review-summary" aria-live="polite">{aiResponseReviewSummary}</span>
          {learnerAiResponseReviewChecks.map((item) => (
            <label key={item.label} className={aiResponseReviewState[item.label] ? "checked" : ""}>
              <input
                checked={Boolean(aiResponseReviewState[item.label])}
                onChange={() => onToggleAiResponseReview(item.label)}
                type="checkbox"
              />
              {item.label}: {item.text}
            </label>
          ))}
          <button type="button" className="ai-response-review-reset" disabled={aiResponseReviewDoneCount === 0} onClick={onResetAiResponseReview}>검토 초기화</button>
        </div>
        <div className="ai-response-revision">
          <div className="revision-prompt-header">
            <strong>AI 응답 보강 프롬프트 초안</strong>
            <button type="button" className="revision-copy-button" onClick={onCopyAiResponseRevisionPrompt} title="전송 전 미체크 기준과 검증 기준을 검토할 AI 응답 보강 프롬프트를 저장합니다.">
              <Copy size={14} />
              AI 보강문 클립보드 저장
            </button>
          </div>
          <pre>{aiResponseRevisionPrompt}</pre>
        </div>
      </div>
      <label>
        분석 모드
        <select value={mode} onChange={(event) => onModeChange(event.target.value as StudyMode)}>
          <option value="quick">{modeLabels.quick}</option>
          <option value="standard">{modeLabels.standard}</option>
          <option value="deep">{modeLabels.deep}</option>
        </select>
      </label>
      <label>
        학습자
        <select value={level} onChange={(event) => onLevelChange(event.target.value as LearnerLevel)}>
          <option value="beginner">{levelLabels.beginner}</option>
          <option value="junior">{levelLabels.junior}</option>
          <option value="senior">{levelLabels.senior}</option>
        </select>
      </label>
      <div className="ai-required-field">
        <span><KeyRound size={15} /> Codex SDK 필수 AI 엔진</span>
      </div>
      <button type="button" className="primary" onClick={onStartStudy} disabled={running} title="학습 분석 시작">
        {running ? <Square size={16} /> : <Play size={16} />}
        {running ? "진행 중" : "학습 시작"}
      </button>
    </section>
  );
}
