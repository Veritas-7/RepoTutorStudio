import { MonitorCheck } from "lucide-react";
import React from "react";

void React;

interface TutorPaneProps {
  hasCurrentSession: boolean;
  onLoadQuiz: () => void;
  onSelectTab: (tab: string) => void;
}

const tutorTabs = [
  ["시작", "바이브코딩 시작"],
  ["필수 용어", "필수 용어 보기"],
  ["폴더 역할", "폴더 역할 보기"],
  ["파일 역할", "파일 역할 보기"],
  ["재구현 로드맵", "단계별 구축 지도"],
  ["역할 계약", "학습자 역할 보기"],
  ["프롬프트 준비도", "프롬프트 준비도"],
  ["프롬프트 팩", "프롬프트 팩 보기"],
  ["소스 흡수", "소스 흡수 기록"],
  ["소스 보존", "소스 보존 판단"],
  ["개선 백로그", "개선점 보기"],
  ["학습 타깃", "CLI와 같은 타깃 보기"]
] as const;

export function TutorPane({ hasCurrentSession, onLoadQuiz, onSelectTab }: TutorPaneProps) {
  return (
    <aside className="tutor-pane">
      <h2><MonitorCheck size={18} /> 튜터 패널</h2>
      {tutorTabs.map(([tab, label]) => (
        <button key={tab} type="button" onClick={() => onSelectTab(tab)}>{label}</button>
      ))}
      <button type="button" onClick={onLoadQuiz} disabled={!hasCurrentSession}>퀴즈 풀기</button>
    </aside>
  );
}
