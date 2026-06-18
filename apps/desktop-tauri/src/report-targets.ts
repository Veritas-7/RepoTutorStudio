import { CORE_LEARNING_REPORT_TARGETS } from "@repotutor/shared/report-targets";

const reportTabLabels: Record<string, string> = {
  overview: "목적",
  "vibe-coding-start": "시작",
  language: "기술 스택",
  architecture: "아키텍처",
  folders: "폴더 역할",
  files: "파일 역할",
  flow: "작동 원리",
  glossary: "필수 용어",
  rebuild: "재구현 로드맵",
  verification: "검증",
  "architecture-principle-playbook": "아키텍처 원리",
  "source-to-build-interview": "소스-빌드 인터뷰",
  "similar-app-transfer-map": "전이 지도",
  "learner-goal-alignment": "목표 정렬",
  "ai-implementation-loop": "구현 루프",
  "learner-role-contract": "역할 계약",
  "ai-output-review-rubric": "AI 검토",
  "vibe-coding-mastery-checklist": "숙련도 체크",
  "vibe-coding-implementation-brief": "구현 브리프",
  "ai-prompt-readiness-checklist": "프롬프트 준비도",
  "ai-prompt-ab-lab": "프롬프트 A/B 랩",
  "source-retention-guide": "소스 보존",
  "source-absorption-ledger": "소스 흡수",
  "teaching-workspace": "학습 워크스페이스",
  "vibe-coding-prompt-pack": "프롬프트 팩",
  "improvement-backlog": "개선 백로그",
  quiz: "퀴즈",
  "wrong-notes": "오답노트"
};

export const reportTabEntries = CORE_LEARNING_REPORT_TARGETS
  .filter((target) => target.target in reportTabLabels)
  .map((target) => ({ tab: reportTabLabels[target.target], target: target.target }));

export const vibeCodingStartTab = "시작";
export const vibeCodingStartTarget = "vibe-coding-start";
export const tabs = ["학습 타깃", ...reportTabEntries.map((entry) => entry.tab), "HTML 미리보기", "실행 로그"];
export const tabTargetMap = Object.fromEntries(reportTabEntries.map((entry) => [entry.tab, entry.target])) as Record<string, string>;

export const sourceCleanupCheckpoints = [
  {
    label: "소스 흡수 기록",
    tab: "소스 흡수",
    target: "source-absorption-ledger",
    description: "무엇을 학습 자산으로 남겼고 현재 목표에서 추가 조사가 필요한지 확인"
  },
  {
    label: "세션 검증",
    tab: "검증",
    target: "verification",
    description: "보존된 리포트와 링크 검증 상태 확인"
  },
  {
    label: "소스 보존 판단",
    tab: "소스 보존",
    target: "source-retention-guide",
    description: "정리 검토 조건과 보류 사유 확인"
  }
] as const;

export const implementationHandoffCheckpoints = [
  {
    label: "구현 브리프",
    tab: "구현 브리프",
    target: "vibe-coding-implementation-brief",
    description: "AI에게 맡길 첫 vertical slice, source focus, 수락 기준 확인"
  },
  {
    label: "프롬프트 준비도",
    tab: "프롬프트 준비도",
    target: "ai-prompt-readiness-checklist",
    description: "AI에게 보내기 전 맥락, 근거, 검증 기준 누락 확인"
  },
  {
    label: "프롬프트 팩",
    tab: "프롬프트 팩",
    target: "vibe-coding-prompt-pack",
    description: "source-grounded 구현 프롬프트 묶음 확인"
  },
  {
    label: "검증",
    tab: "검증",
    target: "verification",
    description: "정적 분석 근거와 실제 실행/테스트 필요 항목 확인"
  }
] as const;

export const sourcePurposeContractItems = [
  {
    title: "소스는 지식 내장이 아님",
    body: "AI에게 개발을 새로 가르치는 데이터가 아니라, 이 프로젝트의 목적, 책임, 검증 맥락을 뽑는 임시 근거입니다."
  },
  {
    title: "학습자는 AI 지휘자",
    body: "문법 암기보다 아키텍처 이유, 역할 경계, 필수 용어, 수락 기준을 배워 AI에게 정확히 지시합니다."
  },
  {
    title: "흡수 후 정리 판단",
    body: "학습 산출물, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰이 남아야 생성된 세션 source/ 스냅샷은 소스 보존 게이트로 정리 검토 여부를 판단합니다."
  }
] as const;
