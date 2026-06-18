export interface LearningReportTarget {
  target: string;
  fileName: string;
  title: string;
  description: string;
  terminalCommand: string;
}

export const CORE_LEARNING_REPORT_TARGETS: LearningReportTarget[] = [
  {
    target: "overview",
    fileName: "overview.html",
    title: "프로젝트 목적",
    description: "이 소스가 누구를 위해 무엇을 해결하는지와 비슷한 앱의 제품 범위를 먼저 고정합니다.",
    terminalCommand: "repo-tutor open <session> --target overview"
  },
  {
    target: "vibe-coding-start",
    fileName: "vibe-coding-start.html",
    title: "바이브코딩 시작",
    description: "많은 리포트 중 처음 15분에 볼 목적, 아키텍처, 용어, 프롬프트, 검증, 보존 판단만 압축합니다.",
    terminalCommand: "repo-tutor open <session> --target vibe-coding-start"
  },
  {
    target: "learning-path",
    fileName: "learning-path.html",
    title: "학습 경로",
    description: "소스 분석 후 어떤 순서로 목적, 구조, 용어, 검증을 볼지 안내합니다.",
    terminalCommand: "repo-tutor open <session> --target learning-path"
  },
  {
    target: "language",
    fileName: "language.html",
    title: "기술 스택",
    description: "문법 암기가 아니라 AI에게 알려줘야 할 런타임, 프레임워크, 빌드 도구 단서를 정리합니다.",
    terminalCommand: "repo-tutor open <session> --target language"
  },
  {
    target: "architecture",
    fileName: "architecture.html",
    title: "아키텍처",
    description: "왜 이런 구조가 필요한지와 AI에게 책임 경계를 어떻게 설명할지 정리합니다.",
    terminalCommand: "repo-tutor open <session> --target architecture"
  },
  {
    target: "folders",
    fileName: "folders.html",
    title: "폴더 역할",
    description: "각 폴더가 맡는 책임과 비슷한 앱에서 어디에 둘지 설명합니다.",
    terminalCommand: "repo-tutor open <session> --target folders"
  },
  {
    target: "files",
    fileName: "files.html",
    title: "파일 역할",
    description: "핵심 파일의 입력, 처리, 출력, 검증 관점을 프롬프트 재료로 바꿉니다.",
    terminalCommand: "repo-tutor open <session> --target files"
  },
  {
    target: "flow",
    fileName: "flow.html",
    title: "작동 원리",
    description: "CLI, 앱, 데이터 흐름이 어떻게 이어지는지 숲의 관점에서 보여줍니다.",
    terminalCommand: "repo-tutor open <session> --target flow"
  },
  {
    target: "glossary",
    fileName: "glossary.html",
    title: "필수 용어",
    description: "PRD, SDD, TDD, 수직 슬라이스처럼 AI 지시에 필요한 말만 선별합니다.",
    terminalCommand: "repo-tutor open <session> --target glossary"
  },
  {
    target: "rebuild",
    fileName: "rebuild.html",
    title: "재구현 로드맵",
    description: "비슷한 앱을 만들기 위한 단계별 바이브코딩 작업 순서를 제공합니다.",
    terminalCommand: "repo-tutor open <session> --target rebuild"
  },
  {
    target: "learning-journal",
    fileName: "learning-journal.html",
    title: "학습 저널",
    description: "내가 무엇을 이해했고 무엇을 다시 확인해야 하는지 복습 루프로 관리합니다.",
    terminalCommand: "repo-tutor open <session> --target learning-journal"
  },
  {
    target: "daily-summary",
    fileName: "daily-summary.html",
    title: "오늘의 학습 요약",
    description: "학습이 끝난 뒤 목적, 구조, 용어, 프롬프트, 검증 경계를 하루 복습 HTML로 저장합니다.",
    terminalCommand: "repo-tutor open <session> --target daily-summary"
  },
  {
    target: "architecture-principle-playbook",
    fileName: "../reference/architecture-principle-playbook.html",
    title: "아키텍처 원리",
    description: "문법 암기 대신 목적, 책임 경계, 핵심 파일 역할, 용어, 검증 질문을 AI 지시용 원리 카드로 정리합니다.",
    terminalCommand: "repo-tutor open <session> --target architecture-principle-playbook"
  },
  {
    target: "source-to-build-interview",
    fileName: "../reference/source-to-build-interview.html",
    title: "소스-빌드 인터뷰",
    description: "비슷한 앱을 만들기 전에 목적, 구조, 책임, 용어, 첫 slice, 검증을 자기 말로 답하고 AI에게 확인시킬 질문으로 바꿉니다.",
    terminalCommand: "repo-tutor open <session> --target source-to-build-interview"
  },
  {
    target: "similar-app-transfer-map",
    fileName: "../reference/similar-app-transfer-map.html",
    title: "비슷한 앱 전이 지도",
    description: "원본에서 가져갈 원리와 새 앱에 맞게 바꿀 결정을 분리해 AI 구현 지시로 바꿉니다.",
    terminalCommand: "repo-tutor open <session> --target similar-app-transfer-map"
  },
  {
    target: "learner-goal-alignment",
    fileName: "../reference/learner-goal-alignment.html",
    title: "학습자 목표 정렬",
    description: "학습자가 가져온 PRD, 이슈, 프롬프트를 소스 기반 목적, 아키텍처, 검증 기준과 비교합니다.",
    terminalCommand: "repo-tutor open <session> --target learner-goal-alignment"
  },
  {
    target: "ai-implementation-loop",
    fileName: "../reference/ai-implementation-loop.html",
    title: "AI 구현 대화 루프",
    description: "AI가 만든 결과를 계획, 관찰, 근거 확인, 수정, 검증, 다음 질문으로 반복 관리합니다.",
    terminalCommand: "repo-tutor open <session> --target ai-implementation-loop"
  },
  {
    target: "learner-role-contract",
    fileName: "../reference/learner-role-contract.html",
    title: "학습자 역할 계약",
    description: "전문 개발자가 아닌 바이브코딩 학습자가 직접 이해할 것과 AI에게 맡길 것을 분리합니다.",
    terminalCommand: "repo-tutor open <session> --target learner-role-contract"
  },
  {
    target: "ai-output-review-rubric",
    fileName: "../reference/ai-output-review-rubric.html",
    title: "AI 산출물 검토",
    description: "AI가 만든 결과를 목적, 아키텍처, 근거, 검증 기준으로 PASS_REVIEW/REVISE/BLOCK 검토 후보로 확인합니다. PASS_REVIEW도 최종 ACCEPT, 배포, 삭제 허가가 아니라 근거와 검증 기록 확인 후보입니다.",
    terminalCommand: "repo-tutor open <session> --target ai-output-review-rubric"
  },
  {
    target: "vibe-coding-mastery-checklist",
    fileName: "../reference/vibe-coding-mastery-checklist.html",
    title: "바이브코딩 숙련도",
    description: "비슷한 앱을 AI와 만들 준비가 됐는지 목적, 아키텍처, 용어, 프롬프트, 검증, 소스 정리 판단으로 확인합니다.",
    terminalCommand: "repo-tutor open <session> --target vibe-coding-mastery-checklist"
  },
  {
    target: "vibe-coding-implementation-brief",
    fileName: "../reference/vibe-coding-implementation-brief.html",
    title: "구현 브리프",
    description: "AI에게 맡길 첫 vertical slice, source focus, 수락 기준, 검증 계획을 한 장짜리 지시서로 압축합니다.",
    terminalCommand: "repo-tutor open <session> --target vibe-coding-implementation-brief"
  },
  {
    target: "ai-prompt-readiness-checklist",
    fileName: "../reference/ai-prompt-readiness-checklist.html",
    title: "프롬프트 준비도",
    description: "AI에게 보내기 전 프롬프트가 맥락, source evidence, acceptance criteria, 검증 assertion을 갖췄는지 확인합니다.",
    terminalCommand: "repo-tutor open <session> --target ai-prompt-readiness-checklist"
  },
  {
    target: "ai-prompt-ab-lab",
    fileName: "../reference/ai-prompt-ab-lab.html",
    title: "프롬프트 A/B 랩",
    description: "막연한 한 줄 요청과 source-grounded 구현 프롬프트를 비교해 AI에게 어떤 맥락을 줘야 하는지 확인합니다.",
    terminalCommand: "repo-tutor open <session> --target ai-prompt-ab-lab"
  },
  {
    target: "source-retention-guide",
    fileName: "../reference/source-retention-guide.html",
    title: "소스 보존 판단",
    description: "원본 소스를 앱 지식으로 내장하지 않고 보존 증거, 세션 검증, 검증 기록, 학습자가 현재 학습 목표에서 source 링크가 더 이상 열리지 않아도 된다는 명시 확인, DELETE-SOURCE-SNAPSHOT 확인 토큰을 남긴 뒤 생성된 세션 source/ 스냅샷 정리 검토 후보로 둘지 판단합니다.",
    terminalCommand: "repo-tutor open <session> --target source-retention-guide"
  },
  {
    target: "source-absorption-ledger",
    fileName: "../reference/source-absorption-ledger.html",
    title: "소스 흡수 기록",
    description: "이 소스에서 앱이 흡수한 학습 기능, 추가 조사 불필요 항목, 남은 조사 gap을 분리합니다.",
    terminalCommand: "repo-tutor open <session> --target source-absorption-ledger"
  },
  {
    target: "teaching-workspace",
    fileName: "teaching-workspace.html",
    title: "학습 워크스페이스",
    description: "MISSION, RESOURCES, lessons, reference, learning-records를 묶어 다음 세션이 이어받을 상태 저장 학습 계약을 보여줍니다.",
    terminalCommand: "repo-tutor open <session> --target teaching-workspace"
  },
  {
    target: "vibe-coding-prompt-pack",
    fileName: "vibe-coding-prompt-pack.html",
    title: "프롬프트 팩",
    description: "목적, 구조, 용어, 검증 기준을 AI 구현 지시문으로 묶습니다.",
    terminalCommand: "repo-tutor open <session> --target vibe-coding-prompt-pack"
  },
  {
    target: "improvement-backlog",
    fileName: "improvement-backlog.html",
    title: "개선 백로그",
    description: "정적 분석 결과에서 추가하면 좋은 기능, 리팩토링 후보, 검증 과제를 우선순위로 묶어 보여줍니다.",
    terminalCommand: "repo-tutor open <session> --target improvement-backlog"
  },
  {
    target: "evidence",
    fileName: "evidence.html",
    title: "소스 근거",
    description: "설명이 실제 파일과 줄 근거에 연결되는지 확인합니다.",
    terminalCommand: "repo-tutor open <session> --target evidence"
  },
  {
    target: "verification",
    fileName: "session-verification.html",
    title: "검증 경계",
    description: "정적 분석으로 확인된 사실과 실행/테스트가 필요한 부분을 분리합니다.",
    terminalCommand: "repo-tutor open <session> --target verification"
  },
  {
    target: "quiz",
    fileName: "quiz.html",
    title: "퀴즈",
    description: "소스 역할을 AI에게 줄 목적, 책임, 검증 기준으로 바꿀 수 있는지 확인합니다.",
    terminalCommand: "repo-tutor open <session> --target quiz"
  },
  {
    target: "wrong-notes",
    fileName: "wrong-notes.html",
    title: "오답노트",
    description: "틀린 개념을 AI에게 다시 설명할 목적, 책임, 검증 기준으로 바꿉니다.",
    terminalCommand: "repo-tutor open <session> --target wrong-notes"
  }
];
