import { FileText, ListChecks, ShieldCheck, StickyNote } from "lucide-react";
import React from "react";
import { learningBoundaryItems, sourceSnapshotCodePathNode } from "../app-copy.js";
import { sourcePurposeContractItems } from "../report-targets.js";

void React;

export function LearningContractStrips() {
  return (
    <>
      <section className="status-strip">
        <div><ShieldCheck size={17} /> 읽기 전용 정적 분석</div>
        <div><FileText size={17} /> 소스는 임시 근거</div>
        <div><FileText size={17} /> JSON · Markdown · HTML</div>
        <div><ListChecks size={17} /> 퀴즈 · 오답노트</div>
        <div><StickyNote size={17} /> Codex SDK 필수 AI 학습</div>
      </section>

      <section className="source-purpose-contract" aria-label="소스 입력 목적 계약">
        {sourcePurposeContractItems.map((item) => (
          <article key={item.title}>
            <strong>{item.title}</strong>
            <span>{sourceSnapshotCodePathNode(item.body)}</span>
          </article>
        ))}
      </section>

      <section className="learning-boundary-strip" aria-label="바이브코딩 학습 경계">
        {learningBoundaryItems.map((item) => (
          <article key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </article>
        ))}
      </section>

      <section className="ai-contract-strip" aria-label="Codex SDK 인증 및 학습 계약">
        <article>
          <strong>공식 인증 경로</strong>
          <span>ChatGPT 구독 로그인 또는 API key는 로컬 Codex CLI/SDK가 처리합니다.</span>
        </article>
        <article>
          <strong>앱 보안 경계</strong>
          <span>RepoTutor는 ChatGPT 비밀번호, 토큰, API key를 입력받거나 저장하지 않습니다.</span>
        </article>
        <article>
          <strong>학습 지속성</strong>
          <span>사용량 제한이 생기면 실패 로그를 남기고 정적 리포트와 퀴즈는 계속 생성합니다.</span>
        </article>
      </section>
    </>
  );
}
