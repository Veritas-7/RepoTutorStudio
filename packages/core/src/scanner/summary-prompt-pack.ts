import { htmlAnchor, todayIsoDate } from "@repotutor/shared";
import type { ArchitectureReport, DailySummaryReport, DependencyReport, FileLesson, FolderLesson, GlossaryTerm, LanguageReport, LearningJournalReport, PurposeReport, RebuildRoadmap, RepoMap, VibeCodingPromptPackReport } from "@repotutor/shared";
export function buildGlossary(languageReport: LanguageReport, dependencyReport: DependencyReport, fileLessons: FileLesson[]): GlossaryTerm[] {
  const base: GlossaryTerm[] = [
    term("진입점", "entry point", "프로그램이 처음 시작되는 파일이나 함수입니다.", "startPoints와 main/index 파일 후보에서 찾습니다.", fileLessons[0]?.filePath ?? "source root", ["CLI", "runtime"], "easy", 5),
    term("의존성", "dependency", "프로젝트가 직접 만들지 않고 가져다 쓰는 외부 코드입니다.", "package.json, Cargo.toml 같은 파일에서 확인합니다.", dependencyReport.manifests[0]?.filePath ?? "manifest file", ["package manager"], "easy", 5),
    term("정적 분석", "static analysis", "코드를 실행하지 않고 파일과 구조를 읽어 이해하는 방식입니다.", "RepoTutor의 기본 분석 모드입니다.", "scanner", ["security", "read-only"], "medium", 5),
    term("AI 작업 지시", "AI build prompt", "AI에게 바로 코딩을 시키기 전에 목적, 맥락, 산출물, 검증 기준을 함께 주는 요청입니다.", "Learning Journal과 Rebuild Roadmap이 단계별 prompt pack으로 생성합니다.", "html/rebuild.html", ["context pack", "verification boundary"], "easy", 5),
    term("제품 요구사항 문서", "PRD", "무엇을, 누구를 위해, 왜 만들고, 수락/검증 기준이 무엇인지 구현 전에 정리한 문서입니다.", "RepoTutor는 소스의 목적, 사용자, 주요 기능, 제외 범위를 PRD 초안으로 바꾸어 AI가 추측으로 코딩하지 않게 합니다.", "html/vibe-coding-prompt-pack.html", ["AI build prompt", "acceptance criteria"], "medium", 5),
    term("명세 주도 개발", "SDD", "코드를 먼저 만들지 않고 명세, 계획, 작업 목록이 구현을 이끌게 하는 방식입니다.", "RepoTutor는 GitHub Spec Kit의 Spec -> Plan -> Tasks -> Implement 흐름을 참고해 소스 분석 결과를 명세, 아키텍처 계획, 작업 단위, 검증 질문으로 나눕니다.", "html/rebuild.html", ["PRD", "TDD", "spec-first"], "medium", 5),
    term("테스트 주도 요청", "TDD", "구현 전에 실패해야 할 테스트나 검증 조건을 먼저 정하고, 그 기준을 통과하도록 AI에게 작업을 맡기는 방식입니다.", "Rebuild Roadmap은 구현 단계마다 확인 명령과 verification prompt를 요구해 AI 산출물을 검증 가능한 단위로 만듭니다.", "html/rebuild.html", ["verification boundary", "vertical slice"], "medium", 5),
    term("수용 기준", "acceptance criteria", "기능을 수락할 수 있는 관찰 가능한 조건입니다.", "Prompt Pack은 PRD와 TDD 흐름에서 산출물, 확인 명령, 사람 판단 항목을 분리하게 합니다.", "html/vibe-coding-prompt-pack.html", ["PRD", "TDD"], "easy", 5),
    term("오답노트", "wrong note", "틀린 문제를 복습 가능한 작은 수업으로 바꾼 기록입니다.", "quiz attempt 이후 HTML과 Markdown에 반영됩니다.", "analysis/wrong-notes.json", ["quiz"], "easy", 4),
    term("맥락 꾸러미", "context pack", "AI가 길을 잃지 않도록 관련 파일, 역할, 용어, 근거를 한 묶음으로 정리한 자료입니다.", "RepoTutor는 파일 수업, evidence, graph query, rebuild prompt를 묶어 AI 지시 맥락으로 바꿉니다.", "html/context-pack.html", ["source evidence", "repo map"], "easy", 5),
    term("아키텍처 책임", "architecture responsibility", "폴더나 파일이 맡는 역할과 경계를 말합니다. 어떤 책임이 어디에 있어야 하는지 설명하는 능력입니다.", "Folder lessons와 Rebuild Roadmap의 sourceRoleFocus가 이 책임을 보여줍니다.", "html/folders.html", ["module", "vertical slice"], "medium", 5),
    term("수직 슬라이스", "vertical slice", "전체 앱을 한 번에 만들지 않고, 입력부터 출력과 검증까지 이어지는 작은 기능 하나를 먼저 만드는 방식입니다.", "Rebuild Roadmap은 AI에게 한 번에 하나의 책임과 검증 기준을 맡기도록 안내합니다.", "html/rebuild.html", ["verification-first", "task breakdown"], "medium", 5),
    term("검증 경계", "verification boundary", "정적 분석으로 아는 것, 테스트가 필요한 것, 실제 실행이 필요한 것, 사람이 판단해야 할 것을 나누는 기준입니다.", "Learning Journal은 AI가 단정하면 안 되는 항목을 verification boundary로 보여줍니다.", "html/learning-journal.html", ["static analysis", "source evidence"], "medium", 5),
    term("소스 근거", "source evidence", "설명이 실제 원본 파일의 줄, import/export, 설정, 테스트 신호에 연결되어 있다는 뜻입니다.", "Evidence Index와 파일 수업의 sourceEvidence가 학습자의 설명을 근거 기반으로 만듭니다.", "html/evidence.html", ["static analysis", "review loop"], "easy", 5),
    term("리뷰 루프", "review loop", "AI가 만든 결과를 바로 믿지 않고 목적, 변경, 위험, 테스트, 문서 기준으로 다시 검토하는 반복입니다.", "Rebuild Roadmap과 Learning Journal은 reviewer/debugger 역할 프롬프트로 이 루프를 훈련합니다.", "html/learning-journal.html", ["verification boundary", "AI build prompt"], "medium", 4)
  ];
  for (const role of languageReport.languageRoles.slice(0, 6)) {
    base.push(term(`${role.language} 언어`, role.language, `${role.language}는 ${role.role}에 쓰입니다.`, role.beginnerExplanation, role.language, ["language"], "easy", 3));
  }
  return dedupeTerms(base);
}

export function buildRebuildRoadmap(repoMap: RepoMap, fileLessons: FileLesson[]): RebuildRoadmap {
  const titles = ["개념 이해", "PRD/SDD 명세 초안 작성", "폴더 구조 설계", "핵심 기능 1개 구현", "설정 파일 작성", "실행 흐름 연결", "TDD 검증 루프 추가", "문서화", "확장 기능 추가", "원본 repo와 비교"];
  const methods: RebuildRoadmap["steps"][number]["vibeCodingMethod"][] = [
    "context-first",
    "sdd-first",
    "architecture-first",
    "vertical-slice",
    "context-first",
    "vertical-slice",
    "test-driven",
    "review-loop",
    "vertical-slice",
    "review-loop"
  ];
  const focusFolders = repoMap.folders.slice(0, 3);
  const focusFiles = fileLessons.slice(0, 3);
  const fallbackRoleFocus = [{
    path: "repo root",
    role: "프로젝트 전체 구조",
    whyItExists: "AI에게 목적, 폴더, 진입점, 검증 기준을 한 번에 설명하기 위한 기준점입니다.",
    promptHint: "이 저장소의 숲을 먼저 설명하고, 구현 전에 확인해야 할 질문을 뽑아줘."
  }];
  return {
    steps: titles.map((title, index) => {
      const useFolders = index < 3;
      const roleFocus = useFolders
        ? focusFolders.map((folder) => ({
          path: folder.folderPath,
          role: folder.inferredRole,
          whyItExists: `${folder.fileCount}개 파일을 ${folder.inferredRole} 책임으로 묶어 AI와 사람이 같은 지도를 보게 합니다.`,
          promptHint: `${folder.folderPath} 폴더가 어떤 책임을 맡고, 비슷한 앱에서 이 책임을 어디에 둘지 설명해줘.`
        }))
        : focusFiles.map((file) => ({
          path: file.filePath,
          role: file.role,
          whyItExists: file.whyItExists,
          promptHint: `${file.filePath}의 입력, 처리, 출력, 검증 기준을 비슷한 앱 구현 지시문으로 바꿔줘.`
        }));
      const sourceRoleFocus = roleFocus.length > 0 ? roleFocus : fallbackRoleFocus;
      const relatedSourcePaths = sourceRoleFocus.map((item) => item.path);
      const method = methods[index] ?? "vertical-slice";
      return {
        order: index + 1,
        title,
        goal: `${title} 단계에서 코드를 외우기보다 AI에게 줄 맥락, 역할, 검증 기준을 작은 단위로 정리합니다.`,
        tasks: sourceRoleFocus.map((item) => `${item.path} 역할을 ${item.role} 관점에서 설명`),
        vibeCodingMethod: method,
        aiPrompt: rebuildAiPrompt(title, method, sourceRoleFocus),
        architectureRationale: useFolders
          ? "폴더 구조는 AI에게 책임 경계를 알려주는 지도입니다. 같은 종류의 파일을 한곳에 묶으면 프롬프트에서 맥락을 적게 줘도 AI가 수정 범위를 좁힐 수 있습니다."
          : "핵심 파일 단위의 vertical slice는 AI가 한 번에 하나의 책임만 구현하고 사람이 산출물과 검증 기준을 확인하게 만듭니다.",
        sourceRoleFocus,
        whyNeeded: "순서를 나누면 전통 문법을 모두 배우지 않아도 소스의 숲, 역할, 검증 경계를 이해한 뒤 AI에게 정확히 지시할 수 있습니다.",
        relatedSourcePaths,
        expectedMistakes: [
          "파일 이름만 보고 역할을 단정하기",
          "PRD/SDD 없이 AI에게 바로 전체 구현을 맡기기",
          "TDD나 acceptance criteria 없이 AI 산출물을 수락하기",
          "설정 파일과 실행 파일의 차이를 놓치기",
          "AI에게 전체 구현을 한 번에 맡기고 검증 기준을 말하지 않기",
          "정적 분석으로 안 것과 실제 실행으로 확인해야 할 것을 섞기"
        ],
        verificationPrompts: [
          "이 단계에서 소스 근거로 확인된 사실과 아직 테스트가 필요한 가정을 나눠줘.",
          "AI가 만든 결과가 이 단계의 source role focus와 다르면 어떤 질문으로 수정시켜야 해?",
          "다음 단계로 넘어가기 전에 사람이 확인해야 할 산출물과 명령을 체크리스트로 써줘.",
          "이 단계에 PRD, SDD, TDD, acceptance criteria 중 어떤 용어를 써야 하는지와 쓰지 않아도 되는 이유를 구분해줘."
        ],
        completionCriteria: [
          "한 문장으로 이 단계의 목적을 설명할 수 있다.",
          "관련 파일 또는 폴더를 직접 가리킬 수 있다.",
          "필요한 경우 PRD/SDD/TDD/acceptance criteria를 AI 지시문에 넣을 수 있다.",
          "source evidence와 내 목표에 맞게 다듬은 AI 구현 지시서를 하나 작성했다.",
          "확인된 사실, 테스트 필요 항목, 사람 판단 항목을 구분했다."
        ]
      };
    })
  };
}

function rebuildAiPrompt(
  title: string,
  method: RebuildRoadmap["steps"][number]["vibeCodingMethod"],
  sourceRoleFocus: RebuildRoadmap["steps"][number]["sourceRoleFocus"]
): string {
  const paths = sourceRoleFocus.map((item) => `${item.path}=${item.role}`).join(", ");
  const processHint = method === "prd-first"
    ? "PRD 초안에는 사용자, 문제, 범위, 제외 범위, acceptance criteria를 포함해줘."
    : method === "sdd-first"
      ? "SDD 흐름으로 Spec, Plan, Tasks, Implement 단계와 각 단계의 산출물을 먼저 분리해줘."
    : method === "test-driven"
      ? "TDD 흐름으로 먼저 실패해야 할 테스트나 검증 명령, 통과 기준, 사람이 확인할 항목을 적어줘."
      : "PRD, SDD, TDD, acceptance criteria 같은 프로세스 용어가 필요한지 판단하고 필요한 경우에만 써줘.";
  return `나는 전통 개발자가 아니라 바이브코딩 개발자야. ${title} 단계에서 ${paths}를 근거로, ${method} 방식으로 비슷한 앱을 만들기 위한 작업 지시문을 작성해줘. 코드를 바로 쓰기 전에 목적, 아키텍처 이유, 필요한 용어, 작은 구현 단위, 검증 기준을 분리해줘. ${processHint}`;
}

export function buildDailySummaryReport(
  purposeReport: PurposeReport,
  architectureReport: ArchitectureReport,
  folderLessons: FolderLesson[],
  fileLessons: FileLesson[],
  glossary: GlossaryTerm[],
  rebuildRoadmap: RebuildRoadmap,
  learningJournalReport: LearningJournalReport
): DailySummaryReport {
  const topFolders = folderLessons.slice(0, 3);
  const topFiles = fileLessons.slice(0, 3);
  const coreTerms = glossary.slice(0, 5);
  const firstStep = rebuildRoadmap.steps[0];
  const secondStep = rebuildRoadmap.steps[1];
  const firstPromptPack = learningJournalReport.aiBuildPromptPacks[0];
  const firstBoundary = learningJournalReport.verificationBoundaries[0];
  return {
    summary: "오늘의 학습 요약: 코딩 문법 암기가 아니라, 이 소스를 근거로 비슷한 앱을 바이브코딩하기 위해 필요한 목적, 구조, 용어, 프롬프트, 검증 경계를 정리했습니다.",
    sourcePattern: "CodeTour-style source walkthrough; self-contained semantic HTML daily recap; source-as-evidence not source-as-product-knowledge",
    date: todayIsoDate(),
    learningGoal: "깃허브나 소스 폴더를 받았을 때 AI에게 같은 계열의 앱을 만들도록 지시할 수 있는 mental model을 만든다.",
    sourceHandling: {
      policy: "원본 소스 전체를 앱 지식으로 내장하지 않고, 세션 산출물 안에 필요한 근거와 해석만 남긴다.",
      why: "AI는 일반 개발 지식은 이미 충분히 갖고 있습니다. 학습자에게 필요한 것은 이 저장소에서 확인된 목적, 책임 경계, 용어, 검증 기준을 AI에게 정확히 말하는 능력입니다.",
      retainedArtifacts: [
        { label: "소스 근거", href: "html/evidence.html", purpose: "설명이 실제 파일과 연결되는지 확인합니다." },
        { label: "학습 저널", href: "html/learning-journal.html", purpose: "이해한 것과 다음 복습 질문을 남깁니다." },
        { label: "프롬프트 팩", href: "html/vibe-coding-prompt-pack.html", purpose: "AI에게 다시 지시할 문장으로 압축합니다." },
        { label: "아키텍처 원리", href: "reference/architecture-principle-playbook.html", purpose: "문법 암기 대신 구조 판단과 AI 지시용 원리 카드를 남깁니다." },
        { label: "소스-빌드 인터뷰", href: "reference/source-to-build-interview.html", purpose: "비슷한 앱을 만들기 전 자기 설명 질문과 AI 확인 질문을 남깁니다." },
        { label: "비슷한 앱 전이 지도", href: "reference/similar-app-transfer-map.html", purpose: "원본에서 가져갈 원리와 새 앱에 맞게 바꿀 결정을 남깁니다." },
        { label: "학습자 목표 정렬", href: "reference/learner-goal-alignment.html", purpose: "내 PRD, 이슈, 프롬프트를 소스 기반 목적, 아키텍처, 검증 기준과 맞춥니다." },
        { label: "AI 구현 대화 루프", href: "reference/ai-implementation-loop.html", purpose: "AI 구현 결과를 다음 질문, 수정, 검증 루프로 관리합니다." },
        { label: "구현 브리프", href: "reference/vibe-coding-implementation-brief.html", purpose: "AI에게 넘길 첫 vertical slice, 수락 기준, 검증 계획을 한 장으로 남깁니다." },
        { label: "프롬프트 준비도", href: "reference/ai-prompt-readiness-checklist.html", purpose: "AI에게 보내기 전 맥락, source evidence, acceptance criteria, 검증 assertion을 점검합니다." },
        { label: "프롬프트 A/B 랩", href: "reference/ai-prompt-ab-lab.html", purpose: "막연한 요청과 source-grounded 구현 프롬프트를 비교합니다." },
        { label: "세션 검증", href: "html/session-verification.html", purpose: "생성된 산출물과 링크가 깨지지 않았는지 확인합니다." }
      ],
      cleanupGuidance: [
        "외부 조사 원본은 리포트에 흡수된 뒤 필수 캐시로 남기지 않습니다.",
        "삭제 판단은 원본 소스가 아니라 임시 조사/중간 산출물에만 적용합니다.",
        "소스는 근거이고, 남길 것은 해석과 프롬프트입니다.",
        "보존해야 할 것은 전체 소스 복사본이 아니라 evidence link, 요약, 프롬프트, 검증 결과입니다."
      ]
    },
    takeaways: [
      {
        title: "무엇을 만드는 소스인지 먼저 고정",
        explanation: purposeReport.oneLineSummary,
        relatedHref: "html/overview.html"
      },
      {
        title: "아키텍처는 AI에게 주는 책임 지도",
        explanation: architectureReport.vibeCodingLens,
        relatedHref: "html/architecture.html"
      },
      {
        title: "폴더와 파일은 외울 대상이 아니라 역할 카드",
        explanation: topFiles.map((file) => `${file.filePath}: ${file.role}`).join("; ") || "핵심 파일 역할을 파일 수업에서 확인합니다.",
        relatedHref: "html/files.html"
      },
      {
        title: "검증 경계가 품질을 만든다",
        explanation: firstBoundary
          ? `${firstBoundary.claim} / 다음 확인: ${firstBoundary.nextVerification}`
          : "정적 분석으로 아는 것과 실행/테스트가 필요한 것을 분리합니다.",
        relatedHref: "html/session-verification.html"
      }
    ],
    architectureLens: [
      {
        topic: architectureReport.architectureStyle,
        whyItMatters: architectureReport.architectureRationale,
        promptCue: architectureReport.aiPromptBrief,
        relatedHref: "html/architecture.html"
      },
      ...topFolders.map((folder) => ({
        topic: folder.folderPath,
        whyItMatters: folder.whyItExists,
        promptCue: folder.aiImplementationBrief,
        relatedHref: `html/folders.html#${htmlAnchor(folder.folderPath)}`
      })),
      ...topFiles.map((file) => ({
        topic: file.filePath,
        whyItMatters: file.architectureResponsibility,
        promptCue: file.aiPromptBrief,
        relatedHref: `html/files.html#${htmlAnchor(file.filePath)}`
      }))
    ].slice(0, 7),
    termsToKnow: coreTerms.map((term) => ({
      term: `${term.termKo} (${term.termEn})`,
      simpleMeaning: term.simpleDefinition,
      whyNeeded: term.projectSpecificMeaning,
      promptUse: `AI 설명 요청 후보: "${term.termEn}"를 이 프로젝트의 ${term.projectSpecificMeaning} 맥락으로 설명하고, 내 구현 프롬프트의 책임/수락 기준에 어떻게 써야 할지 알려줘. 보내기 전 소스 근거와 내 목표에 맞게 다듬으세요.`,
      relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
    })),
    promptsToReuse: [
      {
        title: "오늘 배운 소스를 바이브코딩 계획으로 바꾸기",
        prompt: "나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스에서 확인된 목적, 아키텍처 이유, 폴더/파일 책임, 필요한 용어, 검증 경계를 바탕으로 비슷한 앱을 만들기 위한 작업 순서를 먼저 설계해줘. 코드는 아직 쓰지 말고 PRD/SDD/TDD/acceptance criteria가 필요한 지점만 골라서 설명해줘.",
        expectedUse: "새 프로젝트를 시작하기 전 AI에게 방향을 고정시킬 때 사용합니다.",
        relatedHref: "html/vibe-coding-prompt-pack.html"
      },
      {
        title: firstPromptPack ? "학습 저널의 첫 AI 빌드 프롬프트" : "소스 근거 기반 구현 요청",
        prompt: firstPromptPack?.prompt ?? "핵심 파일 하나만 골라 입력, 처리, 출력, 검증 기준을 설명하고 첫 vertical slice 구현 지시문으로 바꿔줘.",
        expectedUse: firstPromptPack?.expectedOutput ?? "작은 구현 단위를 만들기 전에 맥락을 압축합니다.",
        relatedHref: firstPromptPack?.relatedHref ?? "html/learning-journal.html"
      },
      {
        title: firstStep ? `${firstStep.title} 단계 프롬프트` : "첫 단계 프롬프트",
        prompt: firstStep?.aiPrompt ?? "목적과 역할을 먼저 설명하고 첫 작업 단위를 제안해줘.",
        expectedUse: "다음 학습/구현 세션을 시작할 때 사용합니다.",
        relatedHref: "html/rebuild.html"
      }
    ],
    nextSession: [
      {
        task: secondStep?.title ?? "학습 저널 질문 하나에 답하기",
        reason: secondStep?.whyNeeded ?? "오늘 요약을 다음 세션의 시작점으로 연결합니다.",
        relatedHref: "html/rebuild.html"
      },
      {
        task: "프롬프트 팩에서 orient, architect, plan 단계만 먼저 실행",
        reason: "전통 개발 문법 학습으로 빠지지 않고 목적과 구조부터 고정합니다.",
        relatedHref: "html/vibe-coding-prompt-pack.html"
      },
      {
        task: "세션 검증 리포트 확인",
        reason: "정적 분석으로 확인된 사실과 실제 실행이 필요한 가정을 분리합니다.",
        relatedHref: "html/session-verification.html"
      }
    ],
    verificationBoundaries: learningJournalReport.verificationBoundaries.slice(0, 4).map((item) => ({
      claim: item.claim,
      boundary: item.boundary,
      nextCheck: item.nextVerification,
      relatedHref: item.relatedHref
    })),
    learnerNextSteps: [
      "daily-summary.html을 먼저 읽고 오늘 배운 목적, 구조, 용어를 한 문장씩 말해보세요.",
      "vibe-coding-prompt-pack.html의 첫 프롬프트를 내 목표에 맞게 다듬어 AI에게 계획과 검증 기준만 요청하세요.",
      "AI가 코드를 쓰기 전에 source evidence와 verification boundary를 함께 요구하세요.",
      "원본 소스 전체를 외우려 하지 말고, 역할과 검증 기준만 다음 세션으로 가져가세요."
    ]
  };
}

export function buildVibeCodingPromptPackReport(
  purposeReport: PurposeReport,
  architectureReport: ArchitectureReport,
  folderLessons: FolderLesson[],
  fileLessons: FileLesson[],
  glossary: GlossaryTerm[],
  rebuildRoadmap: RebuildRoadmap,
  learningJournalReport: LearningJournalReport
): VibeCodingPromptPackReport {
  const topFolders = folderLessons.slice(0, 4);
  const topFiles = fileLessons.slice(0, 4);
  const coreTerms = glossary.slice(0, 6).map((term) => `${term.termKo}(${term.termEn})`).join(", ") || "architecture responsibility, source evidence, verification boundary";
  const firstStep = rebuildRoadmap.steps[0];
  const finalStep = rebuildRoadmap.steps.at(-1);
  const contextBundle: VibeCodingPromptPackReport["contextBundle"] = [
    { label: "Product Mission", evidence: purposeReport.oneLineSummary, relatedHref: "html/index.html" },
    { label: "Architecture Lens", evidence: architectureReport.vibeCodingLens, relatedHref: "html/architecture.html" },
    { label: "Folder Responsibility Map", evidence: topFolders.map((folder) => `${folder.folderPath}: ${folder.role}`).join("; ") || "No folder lessons generated.", relatedHref: "html/folders.html" },
    { label: "Source Role Cards", evidence: topFiles.map((file) => `${file.filePath}: ${file.role}`).join("; ") || "No file lessons generated.", relatedHref: "html/files.html" },
    { label: "Core Terms", evidence: coreTerms, relatedHref: "html/glossary.html" },
    { label: "Verification Boundaries", evidence: learningJournalReport.verificationBoundaries.map((item) => item.boundary).join(", "), relatedHref: "html/learning-journal.html" }
  ];
  const promptSequence: VibeCodingPromptPackReport["promptSequence"] = [
    {
      phase: "orient",
      title: "목적과 제외 범위 고정",
      prompt: `나는 전통 개발자가 아니라 바이브코딩 개발자야. 이 저장소의 목적을 ${purposeReport.oneLineSummary} 기준으로 설명하고, 비슷한 앱을 만들 때 코딩 문법보다 먼저 알아야 할 용어와 제외할 학습 범위를 정리해줘. PRD, SDD, TDD, acceptance criteria 같은 프로세스 용어는 언제 써야 하는지도 같이 구분해줘.`,
      why: "AI에게 코딩을 맡기더라도 제품 목적과 학습 목표는 사람이 고정해야 합니다.",
      inputEvidence: "overview, glossary, learning journal",
      expectedArtifact: "제품 목적, 사용자, 핵심 용어, 제외 범위",
      relatedHref: "html/index.html"
    },
    {
      phase: "architect",
      title: "전체 숲과 책임 경계 설명",
      prompt: `${architectureReport.architectureStyle} 구조를 유지해서 비슷한 앱을 설계해줘. 왜 이 아키텍처가 필요한지, 폴더 책임을 어떻게 나눠야 하는지, AI가 잘못 섞기 쉬운 책임 경계를 먼저 설명해줘.`,
      why: "전체 숲을 이해해야 AI가 파일을 잘못 배치하거나 한 번에 너무 큰 기능을 만들지 않습니다.",
      inputEvidence: "architecture report, folder lessons",
      expectedArtifact: "아키텍처 이유, 폴더 책임표, 경계 위반 위험",
      relatedHref: "html/architecture.html"
    },
    {
      phase: "plan",
      title: "바이브코딩 작업 순서 만들기",
      prompt: firstStep
        ? `${firstStep.title}부터 시작해서 ${rebuildRoadmap.steps.length}단계 작업 계획을 만들어줘. 각 단계마다 목적, 사용할 소스 근거, AI에게 줄 지시문, PRD/SDD 산출물, acceptance criteria, TDD 검증 질문을 분리해줘.`
        : "비슷한 앱을 만들기 위한 작업 계획을 목적, 소스 근거, AI 지시문, PRD/SDD 산출물, acceptance criteria, TDD 검증 질문으로 나눠줘.",
      why: "계획과 구현을 분리하면 AI가 추측으로 바로 코드를 만들 위험을 줄입니다.",
      inputEvidence: "rebuild roadmap, folder lessons, file lessons",
      expectedArtifact: "단계별 구현 계획과 검증 기준",
      relatedHref: "html/rebuild.html"
    },
    {
      phase: "implement",
      title: "첫 vertical slice만 구현",
      prompt: topFiles[0]
        ? `${topFiles[0].filePath}의 역할을 참고해서 첫 번째 작은 기능만 구현해줘. TDD 방식으로 먼저 실패해야 할 테스트나 확인 조건을 쓰고, 변경할 파일, 각 파일의 책임, 변경 뒤 확인할 명령을 함께 보고해줘.`
        : "첫 번째 작은 기능만 구현해줘. TDD 방식으로 먼저 실패해야 할 테스트나 확인 조건을 쓰고, 변경할 파일, 각 파일의 책임, 변경 뒤 확인할 명령을 함께 보고해줘.",
      why: "바이브코딩에서도 작은 단위로 구현해야 사람이 방향과 품질을 검토할 수 있습니다.",
      inputEvidence: "file lessons, source evidence, rebuild roadmap",
      expectedArtifact: "작은 구현 결과, 변경 파일 목록, 확인 명령",
      relatedHref: "html/files.html"
    },
    {
      phase: "verify",
      title: "근거와 실행 검증 분리",
      prompt: "방금 만든 결과를 검증해줘. 정적 소스 근거로 확인된 사실, 테스트 실행이 필요한 항목, 사람이 판단해야 할 제품 결정을 분리하고 다음 확인 명령을 제안해줘.",
      why: "AI 산출물을 믿기 전에 확인된 사실과 가정을 분리해야 합니다.",
      inputEvidence: "evidence index, session verification, learning journal verification boundaries",
      expectedArtifact: "검증 체크리스트, 테스트 필요 항목, 사람 판단 항목",
      relatedHref: "html/session-verification.html"
    },
    {
      phase: "review",
      title: "바이브코딩 리뷰 요청",
      prompt: finalStep
        ? `${finalStep.title}까지 구현됐다고 가정하고 리뷰해줘. 원본 구조와 비교해 빠진 책임, 과한 구현, 잘못된 폴더 배치, 추가 검증이 필요한 부분을 우선순위로 정리해줘.`
        : "현재 산출물을 리뷰해줘. 원본 구조와 비교해 빠진 책임, 과한 구현, 잘못된 폴더 배치, 추가 검증이 필요한 부분을 우선순위로 정리해줘.",
      why: "코딩 자체는 AI가 해도, 방향과 품질을 묻는 리뷰 능력은 학습자가 가져야 합니다.",
      inputEvidence: "architecture, folders, files, rebuild roadmap, verification report",
      expectedArtifact: "리뷰 findings, 수정 프롬프트, 남은 검증",
      relatedHref: "html/rebuild.html"
    }
  ];
  const aiGuardrails: VibeCodingPromptPackReport["aiGuardrails"] = [
    {
      rule: "전체 소스를 앱 지식으로 내장하지 말고 분석 근거로만 사용한다.",
      reason: "AI는 일반 개발지식은 이미 알고 있고, 필요한 것은 해당 저장소의 구조와 책임 근거입니다.",
      verification: "external source cache가 남아 있지 않고 generated report에 흡수 내용만 남는지 확인합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      rule: "코드를 바로 쓰기 전에 목적, 아키텍처, 폴더/파일 책임을 먼저 말하게 한다.",
      reason: "전통 개발자 교육이 아니라 AI에게 올바른 방향을 주는 훈련이 목표입니다.",
      verification: "promptSequence의 orient, architect, plan 단계를 먼저 사용합니다.",
      relatedHref: "html/vibe-coding-prompt-pack.html"
    },
    {
      rule: "정적 분석으로 아는 것과 실행/테스트가 필요한 것을 분리한다.",
      reason: "RepoTutor의 분석은 source-backed이지만 런타임 성공을 자동 보장하지 않습니다.",
      verification: "Verification Questions와 session-verification report를 함께 확인합니다.",
      relatedHref: "html/session-verification.html"
    },
    {
      rule: "PRD, SDD, TDD, acceptance criteria는 장식 용어가 아니라 AI 지시 품질을 높일 때만 사용한다.",
      reason: "바이브코더는 모든 전통 개발 절차를 외우는 것이 아니라, 필요한 프로세스 언어를 골라 AI에게 명확한 산출물과 검증 기준을 요구해야 합니다.",
      verification: "Prompt Pack과 Rebuild Roadmap이 요구사항, 작은 구현 단위, 테스트 기준을 분리하는지 확인합니다.",
      relatedHref: "html/rebuild.html"
    }
  ];
  const learnerChecklist = [
    "목적을 한 문장으로 설명했다.",
    "핵심 용어를 AI에게 설명할 수 있다.",
    "왜 이 아키텍처와 폴더 구조가 필요한지 말할 수 있다.",
    "PRD, SDD, TDD, acceptance criteria를 언제 AI 프롬프트에 넣어야 하는지 구분했다.",
    "핵심 파일의 역할과 연결 관계를 프롬프트에 넣었다.",
    "첫 구현 요청을 작은 vertical slice로 줄였다.",
    "검증 질문과 실행 확인 명령을 AI에게 요구했다."
  ];
  const copyPastePrompt = [
    "나는 전문 개발자가 아니라 바이브코딩 개발자야.",
    `목표: ${purposeReport.oneLineSummary}`,
    `아키텍처 기준: ${architectureReport.architectureStyle}`,
    `핵심 용어: ${coreTerms}`,
    "필요한 프로세스 용어: PRD, SDD, TDD, acceptance criteria, vertical slice, review loop",
    `핵심 폴더: ${topFolders.map((folder) => `${folder.folderPath}=${folder.role}`).join(", ") || "none"}`,
    `핵심 파일: ${topFiles.map((file) => `${file.filePath}=${file.role}`).join(", ") || "none"}`,
    "이 정보를 바탕으로 비슷한 품질의 앱을 만들기 위한 목적, 아키텍처 이유, 폴더/파일 책임, 작은 구현 순서, 검증 질문을 먼저 정리해줘.",
    "코드를 바로 쓰지 말고, 계획과 확인 기준을 먼저 제시해줘."
  ].join("\n");
  return {
    summary: `Vibe-coding prompt pack: ${promptSequence.length}개 단계, ${contextBundle.length}개 context bundle, ${aiGuardrails.length}개 AI guardrail을 생성했습니다.`,
    sourcePattern: "AI-native vibe-coding prompt pack",
    mission: "깃허브 링크나 소스 폴더를 분석한 뒤, 바이브코더가 AI에게 같은 품질의 프로젝트를 만들게 지시할 수 있도록 목적, 구조, 용어, 책임, 검증 기준을 하나의 프롬프트 패키지로 묶습니다.",
    contextBundle,
    promptSequence,
    aiGuardrails,
    learnerChecklist,
    copyPastePrompt
  };
}

function term(termKo: string, termEn: string, simpleDefinition: string, projectSpecificMeaning: string, exampleFromRepo: string, relatedTerms: string[], difficulty: "easy" | "medium" | "hard", reviewPriority: number): GlossaryTerm {
  return {
    termKo,
    termEn,
    simpleDefinition,
    projectSpecificMeaning,
    exampleFromRepo,
    promptUse: `"${termEn}"를 ${projectSpecificMeaning} 맥락에서 설명하고, 비슷한 앱 구현 프롬프트의 책임/수락 기준으로 바꿔줘.`,
    reviewQuestion: `AI 결과가 ${termEn}의 책임을 ${exampleFromRepo} 근거와 맞게 구현했는지, 검증 기준까지 포함했는지 확인하세요.`,
    memorizationWarning: `${termKo}를 문법 세부사항으로 외우지 말고, 언제 AI에게 이 용어를 써야 하는지와 어떤 검증 질문으로 이어지는지만 남기세요.`,
    relatedTerms,
    difficulty,
    reviewPriority
  };
}

function dedupeTerms(terms: GlossaryTerm[]): GlossaryTerm[] {
  const seen = new Set<string>();
  return terms.filter((termValue) => {
    const key = termValue.termEn.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
