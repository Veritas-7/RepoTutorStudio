import React from "react";
import { convertFileSrc } from "./tauri-api.js";
import type { LearnerLevel, SessionRow, StudyMode, StudyResponse } from "./types.js";

export const learningBoundaryItems = [
  {
    title: "배우지 않는 것",
    body: "언어 문법 암기, 라인별 코딩, 프레임워크 API를 전통 수업처럼 외우는 과정이 아닙니다."
  },
  {
    title: "반드시 배우는 것",
    body: "목적, 아키텍처 이유, 역할 경계, 핵심 용어, AI 프롬프트, 수락 기준, 검증 습관을 배웁니다."
  },
  {
    title: "AI에게 맡기는 것",
    body: "실제 코딩은 AI가 담당하고, 학습자는 무엇을 만들지와 왜 그렇게 검증할지를 지휘합니다."
  }
] as const;

export const modeLabels: Record<StudyMode, string> = {
  quick: "빠른 분석",
  standard: "표준 학습",
  deep: "심층 분석"
};

export const levelLabels: Record<LearnerLevel, string> = {
  beginner: "바이브코딩 입문",
  junior: "구조 이해",
  senior: "전문가 리뷰"
};

export const statusLabels: Record<string, string> = {
  complete: "산출물 생성됨",
  running: "진행 중",
  failed: "실패"
};

export const learnerBriefScaffold = [
  "내 목표: 이 소스를 참고해서 비슷한 앱이나 기능을 AI와 만들고 싶습니다.",
  "학습 방식: 문법 암기나 라인별 구현보다 AI에게 줄 맥락, 원리, 검증 기준을 배우고 싶습니다.",
  "배울 구조: 제품 목적, 아키텍처 흐름, 폴더/파일 역할, 책임 경계를 알고 싶습니다.",
  "AI 지시: 첫 vertical slice를 구현하게 할 프롬프트와 수락 기준을 만들어 주세요.",
  "검증 기준: 정적 분석으로 확인된 근거와 실제 실행/테스트가 필요한 항목을 분리해 주세요."
].join("\n");

export function previewSrc(filePath: string): string {
  try {
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      return convertFileSrc(filePath);
    }
  } catch {
    // Browser dev fallback below.
  }
  return `file://${encodeURI(filePath)}`;
}

export function quizSummaryText(current: StudyResponse, selectedSession?: SessionRow): string {
  if (current.quizQuestions > 0) return `${current.quizQuestions}문제`;
  if (!selectedSession) return "생성됨";
  return selectedSession.score === null ? "미응시" : `최근 ${scoreSummaryText(selectedSession)}`;
}

export function scoreSummaryText(session: SessionRow): string {
  return session.score === null ? "미응시" : `${session.score}점`;
}

export function readableReportPath(reportPath: string): string {
  return reportPath.replace("/html/../", "/");
}

export function evidenceLineHasDetail(lines: string[], markerPattern: RegExp, detailPattern: RegExp): boolean {
  return lines.some((line) => markerPattern.test(line) && detailPattern.test(line));
}

export function cleanupDecisionText(text: string): string {
  if (text.includes("source absorption ledger")) return "소스 흡수 기록이 프로젝트에서 어떤 판단을 가져왔는지 설명합니다.";
  if (text.includes("implementation brief and prompt pack")) return "구현 브리프와 프롬프트 팩으로 첫 vertical slice 요청 후보를 검토 후 다듬을 수 있습니다.";
  if (text.includes("Session verification, verification records, and the preserved evidence bundle")) return "세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS입니다.";
  if (text.includes("Session verification and the preserved evidence bundle")) return "세션 검증, 검증 기록, 보존 증거 묶음이 모두 PASS입니다.";
  if (text.includes("without opening source links")) return "학습자가 source 링크 없이 아키텍처 이유, 역할 경계, AI 프롬프트, 수락 기준, 검증 기준을 설명할 수 있습니다.";
  if (text.includes("architecture reason")) return "새 기능의 아키텍처 이유가 아직 불명확합니다.";
  if (text.includes("Role boundaries or file responsibilities")) return "역할 경계나 파일 책임을 설명할 수 없습니다.";
  if (text.includes("Verification commands, verification records, or human review criteria")) return "검증 명령, 검증 기록, 사람의 리뷰 기준 중 하나가 빠져 있습니다.";
  if (text.includes("Verification commands or human review criteria")) return "검증 명령, 검증 기록, 사람의 리뷰 기준 중 하나가 빠져 있습니다.";
  if (text.includes("retained reports cannot answer")) return "보존 리포트만으로 추가 소스 조사가 필요한지 판단할 수 없습니다.";
  return text;
}

export function reportTargetDescriptionNode(description: string): React.ReactNode {
  return sourceSnapshotCodePathNode(description);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sourceSnapshotCodePathNode(text: string): React.ReactNode {
  const normalizedText = text.replaceAll("`source/`", "source/");
  if (!normalizedText.includes("source/")) return text;
  const segments = normalizedText.split("source/");
  const seen = new Map<string, number>();
  let isFirstSegment = true;
  const keyedSegments = segments.map((segment) => {
    const count = (seen.get(segment) ?? 0) + 1;
    seen.set(segment, count);
    const includeSourcePrefix = !isFirstSegment;
    isFirstSegment = false;
    return { segment, includeSourcePrefix, key: `${segment}-${count}` };
  });
  return (
    <>
      {keyedSegments.map(({ segment, includeSourcePrefix, key }) => (
        <React.Fragment key={key}>
          {includeSourcePrefix ? <code>source/</code> : null}
          {segment}
        </React.Fragment>
      ))}
    </>
  );
}
