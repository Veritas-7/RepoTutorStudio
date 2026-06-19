import path from "node:path";
import { htmlAnchor } from "@repotutor/shared";
import type { ApiReferenceReport, DependencyHealthReport, FileLesson, FolderLesson, GlossaryTerm, GraphQueryReport, InterfaceMapReport, LearningJournalReport, RuntimeEnvironmentReport, SearchIndexReport, SuggestedReadsReport, SymbolMapReport, TutorialAbstractionReport } from "@repotutor/shared";
export function buildSearchIndexReport(
  fileLessons: FileLesson[],
  folderLessons: FolderLesson[],
  suggestedReadsReport: SuggestedReadsReport,
  runtimeEnvironmentReport: RuntimeEnvironmentReport,
  interfaceMapReport: InterfaceMapReport,
  symbolMapReport: SymbolMapReport,
  apiReferenceReport: ApiReferenceReport,
  dependencyHealthReport: DependencyHealthReport
): SearchIndexReport {
  const seeds: Array<{
    id: string;
    title: string;
    href: string;
    section: string;
    sourcePath: string | null;
    text: string;
    filters: Record<string, string[]>;
    meta: Record<string, string>;
    anchors: SearchIndexReport["documents"][number]["anchors"];
  }> = [
    searchSeed({
      id: "report-suggested-reads",
      title: "추천 읽기",
      href: "html/suggested-reads.html",
      section: "report",
      sourcePath: null,
      text: [suggestedReadsReport.summary, suggestedReadsReport.sourcePattern, ...suggestedReadsReport.items.map((item) => `${item.filePath} ${item.reason}`)].join("\n"),
      sourcePattern: "Repo Baby",
      kind: "recommended-reading"
    }),
    searchSeed({
      id: "report-runtime-environment",
      title: "실행 환경",
      href: "html/runtime-environment.html",
      section: "report",
      sourcePath: null,
      text: [runtimeEnvironmentReport.summary, runtimeEnvironmentReport.sourcePattern, ...runtimeEnvironmentReport.detectedManifests.map((item) => `${item.filePath} ${item.ecosystem} ${item.signal}`), ...runtimeEnvironmentReport.missingSignals].join("\n"),
      sourcePattern: "docSmith",
      kind: "runtime"
    }),
    searchSeed({
      id: "report-interface-map",
      title: "인터페이스 맵",
      href: "html/interface-map.html",
      section: "report",
      sourcePath: null,
      text: [interfaceMapReport.summary, interfaceMapReport.sourcePattern, ...interfaceMapReport.routeSignals.map((item) => `${item.filePath} ${item.kind} ${item.signal}`), ...interfaceMapReport.apiSignals.map((item) => `${item.filePath} ${item.method} ${item.pattern}`)].join("\n"),
      sourcePattern: "repomap",
      kind: "interface"
    }),
    searchSeed({
      id: "report-symbol-map",
      title: "심볼 맵",
      href: "html/symbol-map.html",
      section: "report",
      sourcePath: null,
      text: [symbolMapReport.summary, symbolMapReport.sourcePattern, ...symbolMapReport.symbols.map((item) => `${item.name} ${item.kind} ${item.filePath}`)].join("\n"),
      sourcePattern: "codebase-map",
      kind: "symbols"
    }),
    searchSeed({
      id: "report-api-reference",
      title: "API Reference",
      href: "html/api-reference.html",
      section: "report",
      sourcePath: null,
      text: [apiReferenceReport.summary, apiReferenceReport.sourcePattern, ...apiReferenceReport.publicSymbols.map((item) => `${item.name} ${item.kind} ${item.category} ${item.signature}`)].join("\n"),
      sourcePattern: "TypeDoc",
      kind: "api-reference"
    }),
    searchSeed({
      id: "report-dependency-health",
      title: "Dependency Health",
      href: "html/dependency-health.html",
      section: "report",
      sourcePath: null,
      text: [dependencyHealthReport.summary, dependencyHealthReport.sourcePattern, ...dependencyHealthReport.ruleViolations.map((item) => `${item.ruleName} ${item.fromFile} ${item.toFile ?? ""} ${item.message}`)].join("\n"),
      sourcePattern: "dependency-cruiser",
      kind: "dependency-health"
    }),
    ...folderLessons.slice(0, 25).map((lesson) => searchSeed({
      id: `folder-${htmlAnchor(lesson.folderPath)}`,
      title: lesson.folderPath,
      href: `html/folders.html#${htmlAnchor(lesson.folderPath)}`,
      section: "folder",
      sourcePath: lesson.folderPath,
      text: [lesson.role, lesson.beginnerExplanation, lesson.whyItExists, lesson.designReasoning, lesson.rebuildAdvice, ...lesson.importantFiles].join("\n"),
      sourcePattern: "RepoTutor folder lesson",
      kind: "folder"
    })),
    ...fileLessons.slice(0, 50).map((lesson) => searchSeed({
      id: `file-${htmlAnchor(lesson.filePath)}`,
      title: lesson.filePath,
      href: `html/files.html#${htmlAnchor(lesson.filePath)}`,
      section: "file",
      sourcePath: lesson.filePath,
      text: [
        lesson.role,
        lesson.beginnerExplanation,
        lesson.whyItExists,
        lesson.executionFlowPosition,
        lesson.rebuildAdvice,
        ...lesson.keyExports,
        ...lesson.keyImports,
        ...lesson.glossaryTerms,
        ...lesson.sourceEvidence.map((item) => `${item.kind} ${item.snippet}`)
      ].join("\n"),
      sourcePattern: "RepoTutor file lesson",
      kind: "file"
    }))
  ];

  const documents = seeds.map((seed) => {
    const terms = tokenizeSearchText(`${seed.title}\n${seed.text}\n${Object.values(seed.meta).join("\n")}`);
    const topTerms = rankSearchTerms(terms).slice(0, 8).map(([term]) => term);
    return {
      id: seed.id,
      title: seed.title,
      href: seed.href,
      section: seed.section,
      sourcePath: seed.sourcePath,
      wordCount: terms.length,
      filters: seed.filters,
      meta: seed.meta,
      anchors: seed.anchors,
      topTerms
    };
  });
  const termIndex = buildSearchTermIndex(seeds);
  const metadataFields = [...new Set(documents.flatMap((document) => Object.keys(document.meta)))].sort();
  const fileDocuments = documents.filter((document) => document.section === "file");
  const codeFileDocument = fileDocuments.find((document) => {
    const language = document.sourcePath ? searchLanguageFromPath(document.sourcePath) : "text";
    return !["json", "markdown", "text", "yaml"].includes(language);
  });
  const topFileDocument = codeFileDocument ?? fileDocuments[0] ?? documents.find((document) => document.section === "report") ?? documents[0];
  const topFilePath = topFileDocument?.sourcePath ?? "README.md";
  const topLanguage = searchLanguageFromPath(topFilePath);
  const topSymbol = symbolMapReport.symbols.find((symbol) => symbol.exported)?.name ?? symbolMapReport.symbols[0]?.name ?? "main";
  const ragChunkingSignals: SearchIndexReport["ragChunkingSignals"] = [
    {
      signal: "repository-load",
      readiness: "ready",
      evidence: `${documents.length} generated learning documents can be treated as loaded repository context before any chat layer is attached.`,
      relatedHref: "html/search-index.html"
    },
    {
      signal: "file-filtering",
      readiness: "ready",
      evidence: "RepoTutor already separates generated report, folder, and file documents with filters so retrieval can exclude low-value or noisy groups.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "notebook-support",
      readiness: "suggested",
      evidence: "RepoChat includes NotebookLoader for .ipynb sources; RepoTutor records this as a future loader hint and keeps current indexing static.",
      relatedHref: "html/notebook-readiness.html"
    },
    {
      signal: "chunk-size",
      readiness: "suggested",
      evidence: "RepoChat uses RecursiveCharacterTextSplitter with chunk_size=2000; RepoTutor documents the target chunk budget without running a vectorizer.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "chunk-overlap",
      readiness: "suggested",
      evidence: "RepoChat uses chunk_overlap=200 so cross-boundary code explanations keep context; RepoTutor can use this as a static export hint.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "local-vector-store",
      readiness: "static-only",
      evidence: "RepoChat persists ChromaDB locally; RepoTutor currently emits JSON/HTML assets only and does not create embeddings or vector databases.",
      relatedHref: "html/vector-db-readiness.html"
    },
    {
      signal: "top-k-retrieval",
      readiness: "suggested",
      evidence: "RepoChat retrieves k=3 documents with cosine distance; RepoTutor exposes topTerms and document ids so a later chat layer can show retrieved citations.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "conversation-memory",
      readiness: "suggested",
      evidence: "RepoChat keeps ConversationBufferMemory; RepoTutor can pair this with learning-journal session logs before adding any live chat runtime.",
      relatedHref: "html/learning-journal.html"
    },
    {
      signal: "standalone-question",
      readiness: "suggested",
      evidence: "RepoChat condenses follow-up questions into standalone questions; RepoTutor now provides starter prompts with retrieval hints.",
      relatedHref: "html/search-index.html"
    }
  ];
  const codeSearchQuerySignals: SearchIndexReport["codeSearchQuerySignals"] = [
    {
      signal: "substring-search",
      readiness: "ready",
      evidence: "RepoTutor termIndex and topTerms already support substring-style lookup across generated learning documents.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "regexp-search",
      readiness: "suggested",
      evidence: "Zoekt supports regexp queries; RepoTutor records regex drill prompts but does not execute regular expressions against target code.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "boolean-operators",
      readiness: "suggested",
      evidence: "Zoekt query language combines expressions with implicit AND, explicit OR, grouping, and negation; RepoTutor exposes drill prompts for those shapes.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "repo-filter",
      readiness: "suggested",
      evidence: "Zoekt supports repo: and r: filters; a single RepoTutor session can translate this into session/repo scoping before multi-repo search exists.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "file-filter",
      readiness: "ready",
      evidence: `RepoTutor file documents retain sourcePath values such as ${topFilePath}, which can be used to teach file: scoped code searches.`,
      relatedHref: topFileDocument?.href ?? "html/files.html"
    },
    {
      signal: "language-filter",
      readiness: "ready",
      evidence: `RepoTutor document filters include language facets; the leading language drill uses lang:${topLanguage}.`,
      relatedHref: "html/search-index.html"
    },
    {
      signal: "branch-filter",
      readiness: "suggested",
      evidence: "Zoekt supports branch: filters; RepoTutor sessions know the analyzed source revision but do not index multiple branches.",
      relatedHref: "html/project-activity.html"
    },
    {
      signal: "case-sensitivity",
      readiness: "suggested",
      evidence: "Zoekt supports case:yes/no/auto; RepoTutor records exact-case drills for symbol and filename searches.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "result-type-filter",
      readiness: "suggested",
      evidence: "Zoekt supports type:filematch, type:filename, and type:repo; RepoTutor records result-type drills for narrowing learning searches.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "symbol-search",
      readiness: symbolMapReport.symbols.length > 0 ? "ready" : "suggested",
      evidence: symbolMapReport.symbols.length > 0
        ? `RepoTutor symbol map found ${symbolMapReport.symbols.length} symbols, so sym:${topSymbol} can be used as a code-search learning drill.`
        : "Zoekt supports sym: queries, but no RepoTutor symbols were extracted from this static snapshot.",
      relatedHref: symbolMapReport.symbols.length > 0 ? "html/symbol-map.html" : "html/search-index.html"
    },
    {
      signal: "trigram-index",
      readiness: "static-only",
      evidence: "Zoekt uses trigram indexing for fast code search; RepoTutor only records this design pattern and does not build search shards.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "ctags-ranking",
      readiness: "static-only",
      evidence: "Zoekt can use ctags symbol information for ranking; RepoTutor keeps ranking hints static and never runs ctags.",
      relatedHref: "html/symbol-map.html"
    },
    {
      signal: "index-shards",
      readiness: "static-only",
      evidence: "Zoekt stores repository indexes as shards with branch masks and metadata; RepoTutor emits JSON/HTML assets only.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "json-api",
      readiness: "static-only",
      evidence: "Zoekt webserver can expose a JSON search API; RepoTutor does not start webservers or expose live search APIs during static analysis.",
      relatedHref: "html/search-service-readiness.html"
    }
  ];
  const conversationStarterPrompts: SearchIndexReport["conversationStarterPrompts"] = [
    {
      questionType: "overview",
      question: "What is this repository trying to teach me first, and which generated report should I open before reading code?",
      retrievalHint: "Retrieve report-suggested-reads, report-runtime-environment, and report-interface-map before answering.",
      relatedHref: "html/suggested-reads.html"
    },
    {
      questionType: "trace",
      question: "Trace one user-facing flow through the indexed documents and name the evidence link for each step.",
      retrievalHint: "Retrieve report-interface-map, report-dependency-health, and the highest-priority file document.",
      relatedHref: "html/graph-query.html"
    },
    {
      questionType: "file",
      question: topFileDocument
        ? `Explain ${topFileDocument.title} as if I will edit it next.`
        : "Explain the first indexed file as if I will edit it next.",
      retrievalHint: topFileDocument
        ? `Retrieve ${topFileDocument.id} plus linked evidence anchors before answering.`
        : "Retrieve the highest-ranked file lesson and its evidence anchors before answering.",
      relatedHref: topFileDocument?.href ?? "html/files.html"
    },
    {
      questionType: "debug",
      question: "If my explanation is wrong, which indexed document would falsify it fastest?",
      retrievalHint: "Retrieve source evidence and dependency-health documents before suggesting a correction.",
      relatedHref: "html/evidence.html"
    },
    {
      questionType: "follow-up",
      question: "Earlier I asked about the main flow. Turn this follow-up into a standalone question: why does the next file matter?",
      retrievalHint: "Rewrite the follow-up with explicit file/report names, then retrieve the matching file and graph documents.",
      relatedHref: "html/search-index.html"
    },
    {
      questionType: "evidence",
      question: "Which three citations should a chat answer show so I can trust it?",
      retrievalHint: "Prefer generated report hrefs, file lesson anchors, and source evidence snippets over uncited summaries.",
      relatedHref: "html/evidence.html"
    }
  ];
  const codeSearchDrillPrompts: SearchIndexReport["codeSearchDrillPrompts"] = [
    {
      queryType: "scope",
      query: `lang:${topLanguage} file:"${topFilePath.split("/").pop() ?? topFilePath}"`,
      learningGoal: "Start by scoping search to one language and one filename before reading broader generated reports.",
      relatedHref: topFileDocument?.href ?? "html/files.html"
    },
    {
      queryType: "symbol",
      query: `sym:"${topSymbol}" case:auto`,
      learningGoal: "Practice moving from a symbol name to the file lesson and source evidence that explain it.",
      relatedHref: symbolMapReport.symbols.length > 0 ? "html/symbol-map.html" : "html/search-index.html"
    },
    {
      queryType: "regex",
      query: `content:/(${topSymbol}|${topLanguage})/ file:/\\.(ts|tsx|js|py|go|rs)$/`,
      learningGoal: "Use regexp-style matching only after simple scoped searches fail to find the concept.",
      relatedHref: "html/search-index.html"
    },
    {
      queryType: "exclude",
      query: `content:"TODO" -file:/test|spec|dist|build/`,
      learningGoal: "Learn to exclude generated, build, and test paths before treating a match as implementation evidence.",
      relatedHref: "html/evidence.html"
    },
    {
      queryType: "branch",
      query: `branch:main content:"${topSymbol}"`,
      learningGoal: "Use branch scoping as a mental model even though RepoTutor currently analyzes one source revision at a time.",
      relatedHref: "html/project-activity.html"
    },
    {
      queryType: "result-type",
      query: `type:filename file:"${topFilePath.split("/").pop() ?? topFilePath}" or type:repo content:"${topSymbol}"`,
      learningGoal: "Distinguish filename discovery, repository discovery, and file-content evidence before answering a learning question.",
      relatedHref: "html/search-index.html"
    }
  ];
  return {
    summary: `Pagefind/Zoekt식 search index report: ${documents.length}개 학습 문서를 PageFragmentData처럼 href, filters, meta, anchors로 나누고 ${termIndex.length}개 검색어 색인, ${ragChunkingSignals.length}개 RepoChat식 RAG 준비 신호, ${codeSearchQuerySignals.length}개 code-search query 신호를 만들었습니다.`,
    sourcePattern: "Pagefind PageFragmentData MetaIndex filters meta_fields static low-bandwidth search index; Repochat GitHub Repository Interactive Chatbot local-first RAG ChromaDB RecursiveCharacterTextSplitter chunk_size chunk_overlap k=3 ConversationBufferMemory standalone question; Zoekt fast code search substring regexp boolean operators repo file lang branch case type sym trigram index ctags ranking shards JSON API",
    totalDocuments: documents.length,
    totalTerms: termIndex.length,
    documents,
    termIndex,
    filterIndex: buildSearchFilterIndex(documents),
    metadataFields,
    ragChunkingSignals,
    codeSearchQuerySignals,
    conversationStarterPrompts,
    codeSearchDrillPrompts,
    learnerNextSteps: [
      "search-index.html에서 보고서, 폴더, 파일 문서가 어떤 filter와 metadata로 묶였는지 확인하세요.",
      "termIndex의 상위 문서를 따라가면 generated HTML 전체를 가로지르는 학습 검색 출발점을 잡을 수 있습니다.",
      "metadataFields와 filters를 보면 Pagefind식 정적 검색 UI를 붙일 때 어떤 facet을 노출할지 결정할 수 있습니다.",
      "conversationStarterPrompts를 사용하면 live chat 없이도 저장소 근거가 붙은 첫 질문과 follow-up 질문을 연습할 수 있습니다.",
      "codeSearchDrillPrompts를 사용해 repo/file/lang/sym/regex/type 필터를 조합하는 검색 질문 훈련을 진행하세요."
    ]
  };
}

function searchSeed(input: {
  id: string;
  title: string;
  href: string;
  section: string;
  sourcePath: string | null;
  text: string;
  sourcePattern: string;
  kind: string;
}): {
  id: string;
  title: string;
  href: string;
  section: string;
  sourcePath: string | null;
  text: string;
  filters: Record<string, string[]>;
  meta: Record<string, string>;
  anchors: SearchIndexReport["documents"][number]["anchors"];
} {
  return {
    ...input,
    filters: {
      section: [input.section],
      kind: [input.kind],
      sourcePattern: [input.sourcePattern]
    },
    meta: {
      title: input.title,
      section: input.section,
      kind: input.kind,
      sourcePath: input.sourcePath ?? "",
      sourcePattern: input.sourcePattern
    },
    anchors: [{
      id: htmlAnchor(input.title),
      text: input.title,
      href: input.href
    }]
  };
}

function searchLanguageFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".py": "python",
    ".go": "go",
    ".rs": "rust",
    ".rb": "ruby",
    ".java": "java",
    ".kt": "kotlin",
    ".scala": "scala",
    ".cc": "cpp",
    ".cpp": "cpp",
    ".c": "c",
    ".cs": "csharp",
    ".md": "markdown",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml"
  };
  return map[ext] ?? "text";
}

function tokenizeSearchText(text: string): string[] {
  const stopWords = new Set(["the", "and", "for", "with", "this", "that", "from", "html", "source", "report"]);
  return [...text.toLowerCase().matchAll(/[a-z0-9가-힣_/-]{2,}/g)]
    .map((match) => match[0])
    .filter((term) => !stopWords.has(term))
    .slice(0, 4_000);
}

function rankSearchTerms(terms: string[]): Array<[string, number]> {
  return Object.entries(countBy(terms)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function buildSearchTermIndex(seeds: Array<{ id: string; title: string; text: string; meta: Record<string, string> }>): SearchIndexReport["termIndex"] {
  const termDocuments = new Map<string, Set<string>>();
  for (const seed of seeds) {
    const uniqueTerms = new Set(tokenizeSearchText(`${seed.title}\n${seed.text}\n${Object.values(seed.meta).join("\n")}`));
    for (const term of uniqueTerms) {
      const documents = termDocuments.get(term) ?? new Set<string>();
      documents.add(seed.id);
      termDocuments.set(term, documents);
    }
  }
  return [...termDocuments.entries()]
    .map(([term, documents]) => ({
      term,
      documentCount: documents.size,
      documents: [...documents].sort().slice(0, 12)
    }))
    .sort((a, b) => b.documentCount - a.documentCount || a.term.localeCompare(b.term))
    .slice(0, 80);
}

function buildSearchFilterIndex(documents: SearchIndexReport["documents"]): SearchIndexReport["filterIndex"] {
  const filters = new Map<string, Map<string, Set<string>>>();
  for (const document of documents) {
    for (const [filter, values] of Object.entries(document.filters)) {
      const valueMap = filters.get(filter) ?? new Map<string, Set<string>>();
      for (const value of values) {
        const documentSet = valueMap.get(value) ?? new Set<string>();
        documentSet.add(document.id);
        valueMap.set(value, documentSet);
      }
      filters.set(filter, valueMap);
    }
  }
  return [...filters.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([filter, values]) => ({
      filter,
      values: [...values.entries()]
        .map(([value, documents]) => ({ value, documentCount: documents.size }))
        .sort((a, b) => b.documentCount - a.documentCount || a.value.localeCompare(b.value))
    }));
}

export function buildLearningJournalReport(
  fileLessons: FileLesson[],
  glossary: GlossaryTerm[],
  graphQueryReport: GraphQueryReport,
  tutorialAbstractionReport: TutorialAbstractionReport,
  searchIndexReport: SearchIndexReport
): LearningJournalReport {
  const priorityFiles = fileLessons.slice(0, 5);
  const primaryFile = priorityFiles[0];
  const secondaryFile = priorityFiles[1];
  const glossaryConcepts = glossary.slice(0, 4);
  const abstractionConcepts = tutorialAbstractionReport.abstractions.slice(0, 3);
  const sourcePattern = "learn-codebase Socratic tutor active recall prediction before revelation persistent learning journal; Hephaestus process-aware mentoring self-regulated learning repo-grounded guidance issues commits reviews pull requests standup leaderboard recognition; AI-native vibe-coding build brief repo map context curation planning agent spec writer task breakdown reviewer debugger verification prompt pack";
  const focusGoals: LearningJournalReport["focusGoals"] = [
    {
      label: "Primary goal",
      value: "낯선 저장소를 설명 가능한 mental model로 바꾸기",
      evidenceHref: "html/index.html"
    },
    {
      label: "Learning style",
      value: "예측 질문, 소스 근거 대조, active recall, spaced review 순서로 학습",
      evidenceHref: "html/evidence.html"
    },
    {
      label: "Current focus",
      value: primaryFile ? `${primaryFile.filePath}부터 실제 진입점을 추적` : "먼저 overview와 파일 수업으로 진입점 확인",
      evidenceHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/files.html"
    }
  ];

  const masteryLevels: LearningJournalReport["masteryLevels"] = [
    {
      level: "need-to-explore",
      label: "Need to Explore",
      concepts: priorityFiles.slice(0, 3).map((lesson) => ({
        concept: lesson.filePath,
        status: "아직 예측과 trace가 필요한 핵심 파일",
        reason: `${lesson.role} 역할이지만 학습자가 직접 설명해보기 전까지는 확신하지 않습니다.`,
        reviewPrompt: `파일명 ${lesson.filePath}만 보고 어떤 입력과 출력이 있을지 먼저 예측하세요.`,
        relatedHref: `html/files.html#${htmlAnchor(lesson.filePath)}`
      }))
    },
    {
      level: "learning",
      label: "Learning",
      concepts: glossaryConcepts.map((term) => ({
        concept: `${term.termKo} (${term.termEn})`,
        status: "부분 이해 상태로 active recall 복습 필요",
        reason: term.projectSpecificMeaning,
        reviewPrompt: `${term.termEn}를 이 저장소의 실제 파일 예시와 연결해 한 문장으로 설명하세요.`,
        relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
      }))
    },
    {
      level: "confident",
      label: "Confident",
      concepts: abstractionConcepts.map((item) => ({
        concept: item.name,
        status: "튜토리얼 장으로 설명 가능한 개념 후보",
        reason: item.chapterGoal,
        reviewPrompt: `${item.name} 장을 읽지 않은 사람에게 왜 이 순서로 배워야 하는지 설명하세요.`,
        relatedHref: `html/tutorial-abstractions.html#${htmlAnchor(item.id)}`
      }))
    }
  ];

  const tracePrompt = graphQueryReport.pathPrompts[0];
  const promptSeeds = [
    {
      promptType: "prediction" as const,
      question: primaryFile
        ? `Looking at just ${primaryFile.filePath}, what do you expect it to coordinate before reading the lesson?`
        : "Looking at the repository name and folders, what do you expect this project to do?",
      relatedHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/index.html"
    },
    {
      promptType: "trace" as const,
      question: tracePrompt
        ? `Trace the path from ${tracePrompt.from} to ${tracePrompt.to}. What happens first, and what evidence would prove it?`
        : "Trace one user input from intake to generated HTML. What happens first?",
      relatedHref: "html/graph-query.html"
    },
    {
      promptType: "design-reasoning" as const,
      question: tutorialAbstractionReport.relationships[0]
        ? `Why does ${tutorialAbstractionReport.relationships[0].fromId} connect to ${tutorialAbstractionReport.relationships[0].toId}?`
        : "Why are these responsibilities split across folders instead of one file?",
      relatedHref: "html/tutorial-abstractions.html"
    },
    {
      promptType: "comparison" as const,
      question: priorityFiles[1]
        ? `How is ${priorityFiles[0]?.filePath ?? "the entry file"} different from ${priorityFiles[1].filePath}?`
        : "How is the architecture page different from the file lessons page?",
      relatedHref: "html/files.html"
    },
    {
      promptType: "error-prediction" as const,
      question: "Which generated report would fail first if a generated session `source/` file disappeared?",
      relatedHref: "html/session-verification.html"
    },
    {
      promptType: "meta" as const,
      question: "What would you need to explain back before you should edit this codebase?",
      relatedHref: "html/learning-journal.html"
    }
  ];

  const openQuestions = promptSeeds.map((seed, index) => ({
    id: `journal-question-${index + 1}`,
    question: seed.question,
    promptType: seed.promptType,
    relatedHref: seed.relatedHref,
    sourcePattern
  }));

  const spacedReviewQueue = [
    ...glossaryConcepts.map((term, index) => ({
      concept: `${term.termKo} (${term.termEn})`,
      reviewBy: index === 0 ? "next-session" : `after-${index + 1}-days`,
      reviewNumber: index + 1,
      prompt: `${term.termEn}를 원본 파일 하나와 연결해 다시 설명하세요.`,
      relatedHref: `html/glossary.html#${htmlAnchor(term.termEn)}`
    })),
    ...priorityFiles.slice(0, 3).map((lesson, index) => ({
      concept: lesson.filePath,
      reviewBy: `after-${index + 1}-days`,
      reviewNumber: index + 1,
      prompt: `${lesson.filePath}의 역할과 제거 시 깨질 흐름을 설명하세요.`,
      relatedHref: `html/files.html#${htmlAnchor(lesson.filePath)}`
    }))
  ].slice(0, 8);

  const ahaMoments = [
    {
      title: "Prediction before revelation",
      insight: "파일 수업을 열기 전에 역할을 먼저 예측하면, 설명을 읽을 때 맞은 부분과 빈틈이 분리됩니다.",
      relatedHref: "html/files.html"
    },
    {
      title: "Evidence-backed confidence",
      insight: "이해했다고 느끼는 것보다 source evidence와 lesson link로 다시 말할 수 있는지가 더 중요합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      title: "Searchable review surface",
      insight: `Pagefind식 색인 ${searchIndexReport.totalDocuments}개 문서를 복습 출발점으로 쓰면 모르는 개념을 빠르게 되찾을 수 있습니다.`,
      relatedHref: "html/search-index.html"
    }
  ];

  const mentorReflectionLoops: LearningJournalReport["mentorReflectionLoops"] = [
    {
      loop: "goal-strategy-reflection",
      title: "Goal -> Strategy -> Reflection",
      prompt: "이번 세션의 목표 하나를 정하고, 읽을 순서와 검증 전략을 적은 뒤, 마지막에 어떤 근거로 이해가 바뀌었는지 회고하세요.",
      evidence: "Hephaestus의 self-regulated learning mentor pattern을 정적 학습 저널에 맞춘 루프입니다.",
      relatedHref: "html/learning-journal.html"
    },
    {
      loop: "repo-grounded-context",
      title: "Repo-Grounded Mentor Context",
      prompt: primaryFile
        ? `${primaryFile.filePath} 설명을 읽기 전에 관련 파일, evidence, graph query를 연결해 멘토에게 줄 맥락을 직접 구성하세요.`
        : "overview, evidence, graph query를 연결해 멘토에게 줄 저장소 맥락을 직접 구성하세요.",
      evidence: "Hephaestus의 repo-grounded guidance 아이디어를 파일 수업, evidence index, graph query 링크로 제한해 재현합니다.",
      relatedHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/evidence.html"
    },
    {
      loop: "standup-summary",
      title: "Standup Learning Summary",
      prompt: "어제 이해한 것, 오늘 추적할 파일, 막힌 질문을 세 줄 standup으로 남기세요.",
      evidence: "Hephaestus의 automated standup mentor 흐름을 개인 학습 세션 로그로 바꾼 신호입니다.",
      relatedHref: "html/project-activity.html"
    },
    {
      loop: "review-feedback",
      title: "Practice Review Feedback",
      prompt: "이 저장소를 수정한다면 리뷰어가 먼저 물어볼 위험, 테스트, 근거 링크를 하나씩 적으세요.",
      evidence: "Hephaestus의 practice-aware PR review 패턴을 실행 없는 정적 review rehearsal 질문으로 옮겼습니다.",
      relatedHref: "html/evidence.html"
    },
    {
      loop: "team-ritual",
      title: "Team Ritual Recognition",
      prompt: "팀 학습 회고에서 공유할 만한 insight와 인정할 기여를 하나 고르고 관련 리포트 링크를 붙이세요.",
      evidence: "Hephaestus의 leaderboard, team competition, recognition 흐름을 개인/팀 학습 ritual prompt로 축소했습니다.",
      relatedHref: "html/suggested-reads.html"
    }
  ];

  const repoGroundedFeedbackPrompts: LearningJournalReport["repoGroundedFeedbackPrompts"] = [
    {
      signal: "issues",
      question: "이 파일 또는 개념은 어떤 사용자 문제나 issue를 해결하기 위해 존재한다고 추정할 수 있나요?",
      evidence: "issue context를 직접 조회하지 않고, purpose와 file lesson 근거로 문제 가설을 세우게 합니다.",
      relatedHref: "html/overview.html"
    },
    {
      signal: "commits",
      question: "최근 변경 설명을 모른다고 가정할 때, 이 코드의 어떤 부분을 standup에서 먼저 설명하겠습니까?",
      evidence: "commit context를 project activity 학습 질문으로 바꿔 변경 설명 능력을 점검합니다.",
      relatedHref: "html/project-activity.html"
    },
    {
      signal: "pull-requests",
      question: "이 아키텍처 경로를 PR로 올린다면 reviewer가 묻기 전에 어떤 데이터 흐름을 증명해야 하나요?",
      evidence: "pull request mentor 신호를 graph query와 component graph의 사전 설명 과제로 변환합니다.",
      relatedHref: "html/graph-query.html"
    },
    {
      signal: "reviews",
      question: "리뷰 코멘트를 남긴다면 어떤 source evidence 링크를 함께 붙여야 설득력이 생기나요?",
      evidence: "review feedback을 evidence-backed confidence 훈련으로 연결합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      signal: "leaderboard",
      question: "이번 주 학습 leaderboard가 있다면 어떤 설명/검증 행동에 점수를 주겠습니까?",
      evidence: "leaderboard를 경쟁 자체가 아니라 좋은 학습 행동을 보이게 만드는 기준으로 사용합니다.",
      relatedHref: "html/learning-journal.html"
    },
    {
      signal: "recognition",
      question: "누군가의 온보딩을 도왔다고 인정하려면 어떤 설명 링크와 확인 질문을 공유해야 하나요?",
      evidence: "recognition을 team learning artifact 공유로 바꿔 학습 전이를 유도합니다.",
      relatedHref: "html/suggested-reads.html"
    },
    {
      signal: "prompt-scheduler",
      question: "다음 세션 시작 때 자동으로 다시 물어볼 질문 하나를 고른다면 무엇이어야 하나요?",
      evidence: "mentor prompt scheduler를 spaced review queue와 연결한 반복 질문입니다.",
      relatedHref: "html/learning-journal.html"
    }
  ];

  const primaryEvidence = primaryFile?.sourceEvidence[0]?.snippet ?? primaryFile?.role ?? "overview, file lessons, evidence index";
  const coreTerms = glossaryConcepts.map((term) => `${term.termKo}(${term.termEn})`).join(", ") || "architecture, data flow, verification";
  const vibeCodingBuildBriefs: LearningJournalReport["vibeCodingBuildBriefs"] = [
    {
      role: "context-curator",
      title: "AI에게 줄 맥락 선별",
      whyItMatters: "바이브코딩 학습자는 모든 코드를 외우는 대신, AI가 헷갈리지 않도록 어떤 파일, 용어, 흐름을 함께 줘야 하는지 알아야 합니다.",
      sourceEvidence: primaryFile
        ? `${primaryFile.filePath}: ${primaryEvidence}`
        : "RepoTutor overview, files, evidence index를 묶어 맥락을 구성합니다.",
      learnerAction: primaryFile
        ? `${primaryFile.filePath}, evidence link, 관련 glossary term을 한 묶음으로 AI에게 전달할 준비를 합니다.`
        : "overview, files, glossary에서 AI에게 줄 최소 맥락을 고릅니다.",
      prompt: primaryFile
        ? `이 저장소에서 ${primaryFile.filePath}가 맡은 역할, 관련 용어, 검증해야 할 흐름을 초보자가 AI에게 지시할 수 있는 build brief로 정리해줘.`
        : "이 저장소의 목적, 핵심 폴더, 검증할 흐름을 AI에게 줄 build brief로 정리해줘.",
      relatedHref: primaryFile ? `html/files.html#${htmlAnchor(primaryFile.filePath)}` : "html/index.html"
    },
    {
      role: "architect",
      title: "구조와 책임을 말로 설명",
      whyItMatters: "전통적인 구현 문법보다 어떤 책임을 어떤 모듈에 맡기는지가 AI 산출물의 품질을 좌우합니다.",
      sourceEvidence: abstractionConcepts[0]
        ? `${abstractionConcepts[0].name}: ${abstractionConcepts[0].chapterGoal}`
        : "architecture, component graph, tutorial abstractions를 연결합니다.",
      learnerAction: "아키텍처를 입력, 처리, 출력, 검증 책임으로 나누어 AI에게 말할 수 있게 준비합니다.",
      prompt: "이 저장소를 비슷하게 만들려면 어떤 역할의 모듈들이 필요하고, 왜 분리되어야 하는지 product owner가 이해할 말로 설명해줘.",
      relatedHref: "html/tutorial-abstractions.html"
    },
    {
      role: "product-owner",
      title: "만들려는 앱의 목적 고정",
      whyItMatters: "AI에게 코딩을 맡겨도 제품 목적, 학습자 수준, 성공 기준은 사람이 명확히 잡아야 합니다.",
      sourceEvidence: `주요 학습 용어: ${coreTerms}`,
      learnerAction: "비슷한 앱을 만들 때 반드시 보존할 사용자 가치와 제외할 전통 개발 학습 범위를 적습니다.",
      prompt: "나는 전문 개발자가 아니라 바이브코딩 개발자야. 이 소스를 참고해 같은 목적의 앱을 만들 때 제품 목표, 사용자 여정, 제외할 기능을 먼저 정리해줘.",
      relatedHref: "html/overview.html"
    },
    {
      role: "implementer",
      title: "작게 나눈 작업으로 AI에게 맡기기",
      whyItMatters: "큰 요구를 한 번에 던지면 AI도 검증하기 어렵습니다. 파일 역할과 리포트 산출물을 기준으로 작은 작업 단위가 필요합니다.",
      sourceEvidence: secondaryFile
        ? `${secondaryFile.filePath}: ${secondaryFile.role}`
        : "file lessons와 rebuild roadmap의 단계 단위를 사용합니다.",
      learnerAction: "AI에게 줄 구현 요청을 한 번에 하나의 책임, 하나의 산출물, 하나의 검증 기준으로 쪼갭니다.",
      prompt: secondaryFile
        ? `${secondaryFile.filePath}와 연결된 기능을 비슷하게 구현하려면 작업을 3단계로 쪼개고, 각 단계마다 확인할 산출물을 적어줘.`
        : "이 앱을 비슷하게 만들기 위한 첫 구현 작업을 3단계로 쪼개고, 각 단계마다 확인할 산출물을 적어줘.",
      relatedHref: "html/rebuild.html"
    },
    {
      role: "reviewer",
      title: "AI 산출물을 근거로 검토",
      whyItMatters: "바이브코딩에서도 '잘 돌아갈 것 같다'는 느낌만으로 끝내면 안 됩니다. 소스 근거, 테스트, 실행 확인의 경계를 구분해야 합니다.",
      sourceEvidence: "evidence index, session verification, graph query가 검토 질문의 기준입니다.",
      learnerAction: "AI가 만든 결과가 어떤 원본 근거와 어떤 검증 명령으로 확인되어야 하는지 먼저 질문합니다.",
      prompt: "방금 만든 구현을 리뷰어 관점에서 봐줘. 원본 소스 근거와 비교해 확인된 것, 테스트가 필요한 것, 사람이 판단해야 할 것을 나눠줘.",
      relatedHref: "html/session-verification.html"
    }
  ];

  const aiBuildPromptPacks: LearningJournalReport["aiBuildPromptPacks"] = [
    {
      phase: "understand",
      prompt: `이 저장소를 한 줄씩 가르치지 말고, 바이브코딩 개발자가 AI에게 지시하려면 알아야 할 목적, 핵심 용어(${coreTerms}), 모듈 역할을 설명해줘.`,
      why: "학습 목표를 전통 문법 암기가 아니라 AI 지시를 위한 mental model로 고정합니다.",
      inputEvidence: "overview, architecture, glossary, file lessons",
      expectedOutput: "목적, 역할, 용어, 흐름, 모르는 상태에서 물어볼 질문 목록",
      relatedHref: "html/index.html"
    },
    {
      phase: "specify",
      prompt: "이 앱을 비슷하게 만들기 위한 제품 명세를 써줘. 사용자, 핵심 기능, 제외할 범위, 성공 기준, 필요한 입력 자료를 분리해줘.",
      why: "AI 개발 도구의 spec writer 흐름처럼 구현 전에 요구사항의 빈틈을 드러냅니다.",
      inputEvidence: "purpose report, learning path, user goal",
      expectedOutput: "AI에게 넘길 수 있는 product spec과 확인 질문",
      relatedHref: "html/learning-path.html"
    },
    {
      phase: "plan",
      prompt: "코드는 아직 만들지 말고 계획만 세워줘. 어떤 모듈을 어떤 순서로 만들고, 각 단계에서 어떤 산출물로 검증할지 PLAN 형태로 정리해줘.",
      why: "planning agent와 code agent 역할을 분리해, 설계가 흐려진 상태에서 바로 구현으로 뛰어드는 위험을 줄입니다.",
      inputEvidence: "architecture, component graph, rebuild roadmap",
      expectedOutput: "실행 가능한 작업 순서, 의존관계, 검증 기준",
      relatedHref: "html/rebuild.html"
    },
    {
      phase: "implement",
      prompt: "한 번에 전체를 만들지 말고 첫 번째 작은 기능만 구현해줘. 변경 파일, 이유, 다음 검증 명령을 함께 보고해줘.",
      why: "작은 task breakdown은 AI와 사람이 모두 버그 원인을 추적하기 쉽게 만듭니다.",
      inputEvidence: "file lessons, graph query, rebuild roadmap",
      expectedOutput: "작은 구현 결과, 변경 요약, 다음 검증 항목",
      relatedHref: "html/files.html"
    },
    {
      phase: "review",
      prompt: "이 변경을 리뷰해줘. 원본 소스와 달라진 의도, 깨질 수 있는 흐름, 테스트로 증명할 항목을 우선순위로 정리해줘.",
      why: "리뷰어 역할을 별도로 세우면 AI가 만든 코드도 근거 중심으로 점검할 수 있습니다.",
      inputEvidence: "evidence index, graph query, session verification",
      expectedOutput: "위험 목록, 누락 검증, 다음 수정 요청",
      relatedHref: "html/evidence.html"
    },
    {
      phase: "debug",
      prompt: "실패 로그를 보고 바로 고치기 전에 원인을 추정해줘. 어떤 입력, 모듈, 검증 경로를 확인해야 하는지 단계별로 말해줘.",
      why: "실행 로그를 AI에게 주되, 추측과 증거를 구분하게 만드는 디버깅 습관을 만듭니다.",
      inputEvidence: "test output, runtime error, related file lesson",
      expectedOutput: "원인 가설, 확인 순서, 최소 수정 범위",
      relatedHref: "html/session-verification.html"
    },
    {
      phase: "document",
      prompt: "현재 산출물을 학습자 문서 초안으로 바꿔줘. 내가 알아야 할 용어, 왜 필요한지, AI에게 다시 시킬 때 쓸 프롬프트를 포함해줘.",
      why: "코드 작성 자체보다 다음에 비슷한 시스템을 만들 수 있는 설명 자산을 남깁니다.",
      inputEvidence: "glossary, learning journal, suggested reads",
      expectedOutput: "용어 해설, 아키텍처 설명, 재사용 프롬프트",
      relatedHref: "html/glossary.html"
    }
  ];

  const verificationBoundaries: LearningJournalReport["verificationBoundaries"] = [
    {
      boundary: "static-evidence",
      claim: "RepoTutor가 원본 소스에서 파일 역할, 용어, 구조 신호를 추출했다.",
      whatRepoTutorKnows: "복사된 원본 파일, evidence line, generated lesson, graph/query report에 근거한 정적 사실입니다.",
      whatAiMustNotAssume: "이 정보만으로 실제 런타임 동작, 최신 원격 상태, 운영 환경 성공을 확정하면 안 됩니다.",
      nextVerification: "evidence.html과 source 링크를 열어 같은 근거가 있는지 확인합니다.",
      relatedHref: "html/evidence.html"
    },
    {
      boundary: "needs-test-run",
      claim: "AI가 비슷한 기능을 구현하면 테스트로 통과 여부를 확인해야 한다.",
      whatRepoTutorKnows: "이 저장소가 어떤 검증 산출물을 요구하는지 session verification으로 안내할 수 있습니다.",
      whatAiMustNotAssume: "테스트를 실행하지 않고 기능이 완성됐다고 말하면 안 됩니다.",
      nextVerification: "AI에게 변경 후 실행할 테스트 명령과 실패 시 보고 형식을 요구합니다.",
      relatedHref: "html/session-verification.html"
    },
    {
      boundary: "needs-runtime-run",
      claim: "UI, CLI, 서버, 브라우저 동작은 실제 실행 확인이 필요하다.",
      whatRepoTutorKnows: "정적 분석으로 실행 후보와 인터페이스 신호를 보여줄 수 있습니다.",
      whatAiMustNotAssume: "정적 코드만 보고 사용자가 실제로 클릭하거나 실행할 수 있다고 단정하면 안 됩니다.",
      nextVerification: "runtime environment와 interface map을 보고 어떤 실행 확인이 필요한지 고릅니다.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      boundary: "needs-human-review",
      claim: "제품 목적, 학습 난이도, 제외 범위는 사람이 판단해야 한다.",
      whatRepoTutorKnows: "목적과 학습 경로를 제안할 수 있지만 사용자 맥락의 최종 우선순위는 알 수 없습니다.",
      whatAiMustNotAssume: "사용자가 전통 개발자가 되려 한다고 가정하거나 불필요한 문법 학습을 강요하면 안 됩니다.",
      nextVerification: "학습자가 원하는 build brief와 제외할 학습 범위를 직접 확인합니다.",
      relatedHref: "html/learning-journal.html"
    },
    {
      boundary: "needs-source-owner",
      claim: "외부 GitHub 프로젝트의 최신 의도와 라이선스 판단은 소유자/문서 확인이 필요하다.",
      whatRepoTutorKnows: "정적 소스와 공개 메타데이터에서 패턴을 흡수할 수 있습니다.",
      whatAiMustNotAssume: "외부 코드를 앱 안에 내장하거나 라이선스/운영 의도를 임의로 확정하면 안 됩니다.",
      nextVerification: "외부 소스는 분석 후 문서화하고 임시 캐시는 삭제합니다.",
      relatedHref: "html/license-rights.html"
    }
  ];

  return {
    summary: `learn-codebase식 learning journal report: ${openQuestions.length}개 Socratic 질문, ${spacedReviewQueue.length}개 spaced review 항목, ${masteryLevels.reduce((sum, level) => sum + level.concepts.length, 0)}개 mastery concept, ${mentorReflectionLoops.length}개 mentor loop, ${vibeCodingBuildBriefs.length}개 vibe-coding build brief, ${aiBuildPromptPacks.length}개 AI prompt pack, ${verificationBoundaries.length}개 verification boundary를 생성했습니다. 이 리포트는 전통 문법 암기가 아니라 AI에게 비슷한 앱을 만들도록 지시하는 데 필요한 구조, 용어, 원리, 검증 경계를 학습하게 합니다.`,
    sourcePattern,
    focusGoals,
    masteryLevels,
    openQuestions,
    spacedReviewQueue,
    ahaMoments,
    mentorReflectionLoops,
    repoGroundedFeedbackPrompts,
    vibeCodingBuildBriefs,
    aiBuildPromptPacks,
    verificationBoundaries,
    sessionLog: [{
      explored: "RepoTutor generated overview, file lessons, graph query, tutorial abstractions, search index",
      learned: [
        "예측 질문으로 파일 역할을 먼저 가정한다.",
        "소스 근거 링크로 설명의 신뢰도를 확인한다.",
        "spaced review queue로 다음 세션의 복습 대상을 남긴다.",
        "Hephaestus식 process-aware mentoring 루프로 목표, 전략, 리뷰, standup reflection을 연결한다.",
        "바이브코딩에서는 코드를 외우는 대신 AI에게 줄 맥락, 역할, 용어, 검증 경계를 설명할 수 있어야 한다."
      ],
      struggledWith: priorityFiles.slice(0, 3).map((lesson) => lesson.filePath),
      next: [
        "Need to Explore 항목 하나를 골라 예측을 적는다.",
        "관련 파일 수업과 원본 소스를 대조한다.",
        "정답을 본 뒤 review prompt에 다시 답한다."
      ]
    }],
    socraticPrompts: [
      {
        category: "Prediction",
        question: openQuestions[0]?.question ?? "What do you expect this module to do?",
        useWhen: "파일이나 함수 설명을 열기 전",
        relatedHref: openQuestions[0]?.relatedHref ?? "html/files.html",
        hintLevels: [
          "폴더명과 파일명에서 책임을 추론하세요.",
          "입력, 처리, 출력 중 어느 쪽에 가까운지 고르세요.",
          "파일 수업의 role 문장을 빈칸으로 두고 채워보세요."
        ]
      },
      {
        category: "Trace",
        question: "한 입력이 analysis JSON, Markdown, HTML까지 이동하는 순서를 말해보세요.",
        useWhen: "실행 흐름과 데이터 흐름을 학습할 때",
        relatedHref: "html/flow.html",
        hintLevels: [
          "처음에는 intake 또는 source copy에서 시작합니다.",
          "scanner와 renderer 사이의 산출물을 찾으세요.",
          "source files -> analysis JSON -> Markdown -> HTML 순서로 채워보세요."
        ]
      },
      {
        category: "Evidence",
        question: "그 설명을 뒷받침하는 실제 소스 근거 링크는 어디에 있나요?",
        useWhen: "이해했다고 느끼지만 근거를 아직 못 댈 때",
        relatedHref: "html/evidence.html",
        hintLevels: [
          "파일 수업의 소스 근거 섹션을 보세요.",
          "evidence kind와 line snippet을 연결하세요.",
          "원본 열기 링크를 따라가 같은 줄을 찾으세요."
        ]
      }
    ],
    journalTemplateMarkdown: learningJournalTemplateMarkdown(
      focusGoals,
      masteryLevels,
      openQuestions,
      spacedReviewQueue,
      ahaMoments,
      mentorReflectionLoops,
      repoGroundedFeedbackPrompts,
      vibeCodingBuildBriefs,
      aiBuildPromptPacks,
      verificationBoundaries
    ),
    learnerNextSteps: [
      "learning-journal.html에서 Vibe-Coding Build Brief 하나를 고르고 그대로 AI에게 줄 수 있는 말로 다시 써보세요.",
      "AI Prompt Pack 중 specify 또는 plan 프롬프트를 골라 자신의 앱 아이디어에 맞게 바꿔보세요.",
      "Verification Boundaries를 보고 AI가 단정하면 안 되는 항목을 먼저 표시하세요."
    ]
  };
}

function learningJournalTemplateMarkdown(
  focusGoals: LearningJournalReport["focusGoals"],
  masteryLevels: LearningJournalReport["masteryLevels"],
  openQuestions: LearningJournalReport["openQuestions"],
  spacedReviewQueue: LearningJournalReport["spacedReviewQueue"],
  ahaMoments: LearningJournalReport["ahaMoments"],
  mentorReflectionLoops: LearningJournalReport["mentorReflectionLoops"],
  repoGroundedFeedbackPrompts: LearningJournalReport["repoGroundedFeedbackPrompts"],
  vibeCodingBuildBriefs: LearningJournalReport["vibeCodingBuildBriefs"],
  aiBuildPromptPacks: LearningJournalReport["aiBuildPromptPacks"],
  verificationBoundaries: LearningJournalReport["verificationBoundaries"]
): string {
  return [
    "# Codebase Learning Journal",
    "",
    "> 나는 코드를 한 줄씩 외우는 사람이 아니라, 소스를 이해해 AI에게 비슷한 앱을 만들도록 정확히 지시하는 바이브코딩 개발자다.",
    "",
    "## Focus & Goals",
    ...focusGoals.map((item) => `- **${item.label}**: ${item.value} (${item.evidenceHref})`),
    "",
    "## Concept Mastery Map",
    ...masteryLevels.map((level) => [
      `### ${level.label}`,
      ...level.concepts.map((concept) => `- ${concept.concept}: ${concept.status} - ${concept.reviewPrompt}`)
    ].join("\n")),
    "",
    "## Open Questions",
    ...openQuestions.map((item) => `- [ ] ${item.question} (${item.promptType}, ${item.relatedHref})`),
    "",
    "## Spaced Review Queue",
    ...spacedReviewQueue.map((item) => `- [ ] ${item.concept} (review by: ${item.reviewBy}) - ${item.reviewNumber} review - ${item.prompt}`),
    "",
    "## Aha Moments",
    ...ahaMoments.map((item) => `### ${item.title}\n${item.insight}`),
    "",
    "## Mentor Reflection Loops",
    ...mentorReflectionLoops.map((item) => `- **${item.title}** (${item.loop}): ${item.prompt} Evidence: ${item.evidence} (${item.relatedHref})`),
    "",
    "## Repo-Grounded Feedback Prompts",
    ...repoGroundedFeedbackPrompts.map((item) => `- [ ] ${item.question} (${item.signal}) - ${item.evidence} (${item.relatedHref})`),
    "",
    "## Vibe-Coding Build Brief",
    ...vibeCodingBuildBriefs.map((item) => [
      `### ${item.title}`,
      `- Role: ${item.role}`,
      `- Why it matters: ${item.whyItMatters}`,
      `- Source evidence: ${item.sourceEvidence}`,
      `- Learner action: ${item.learnerAction}`,
      `- Prompt: ${item.prompt}`,
      `- Related: ${item.relatedHref}`
    ].join("\n")),
    "",
    "## AI Build Prompt Packs",
    ...aiBuildPromptPacks.map((item) => [
      `### ${item.phase}`,
      `- Prompt: ${item.prompt}`,
      `- Why: ${item.why}`,
      `- Input evidence: ${item.inputEvidence}`,
      `- Expected output: ${item.expectedOutput}`,
      `- Related: ${item.relatedHref}`
    ].join("\n")),
    "",
    "## Verification Boundaries",
    ...verificationBoundaries.map((item) => [
      `### ${item.boundary}`,
      `- Claim: ${item.claim}`,
      `- RepoTutor knows: ${item.whatRepoTutorKnows}`,
      `- AI must not assume: ${item.whatAiMustNotAssume}`,
      `- Next verification: ${item.nextVerification}`,
      `- Related: ${item.relatedHref}`
    ].join("\n")),
    "",
    "## Session Log",
    "- **Explored**: generated RepoTutor reports",
    "- **Next**: answer one open question before reading the linked report",
    ""
  ].join("\n");
}
