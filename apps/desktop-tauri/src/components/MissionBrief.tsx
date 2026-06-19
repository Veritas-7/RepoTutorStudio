import { FileText, KeyRound, ShieldCheck, Workflow } from "lucide-react";
import React from "react";

void React;

interface MissionBriefProps {
  modeLabel: string;
  reportCount: number;
  sessionCount: number;
}

export function MissionBrief({ modeLabel, reportCount, sessionCount }: MissionBriefProps) {
  return (
    <section className="mission-brief">
      <div className="mission-copy">
        <p className="eyebrow">GitHub · 소스 폴더 · SKILL.md</p>
        <h1>소스를 AI 지시 전 검토 가능한 학습 설계도로 변환</h1>
        <p>소스는 영구 내장 지식이 아니라 프로젝트별 임시 근거입니다. RepoTutor는 목적, 아키텍처, 용어, 프롬프트, 검증 경계를 학습 자산으로 남깁니다.</p>
        <div className="mission-badges">
          <span><ShieldCheck size={14} /> 읽기 전용</span>
          <span><FileText size={14} /> 임시 소스 근거</span>
          <span><KeyRound size={14} /> SDK 필수 인증</span>
          <span><Workflow size={14} /> CLI/스킬 동일 엔진</span>
        </div>
      </div>
      <dl className="mission-metrics">
        <div><dt>리포트</dt><dd>{reportCount}</dd></div>
        <div><dt>세션</dt><dd>{sessionCount}</dd></div>
        <div><dt>모드</dt><dd>{modeLabel}</dd></div>
        <div><dt>Codex</dt><dd>필수</dd></div>
      </dl>
    </section>
  );
}
