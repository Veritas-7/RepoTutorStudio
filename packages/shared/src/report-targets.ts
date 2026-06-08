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
    target: "vibe-coding-prompt-pack",
    fileName: "vibe-coding-prompt-pack.html",
    title: "프롬프트 팩",
    description: "목적, 구조, 용어, 검증 기준을 AI 구현 지시문으로 묶습니다.",
    terminalCommand: "repo-tutor open <session> --target vibe-coding-prompt-pack"
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
    description: "폴더, 파일, 용어 이해를 active recall 방식으로 확인합니다.",
    terminalCommand: "repo-tutor open <session> --target quiz"
  },
  {
    target: "wrong-notes",
    fileName: "wrong-notes.html",
    title: "오답노트",
    description: "틀린 개념을 다시 AI에게 물어볼 수 있는 복습 항목으로 바꿉니다.",
    terminalCommand: "repo-tutor open <session> --target wrong-notes"
  }
];
