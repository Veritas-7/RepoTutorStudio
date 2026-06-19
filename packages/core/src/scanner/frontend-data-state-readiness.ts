import type { DataFetchingReadinessReport, RoutingReadinessReport, StateManagementReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDataFetchingReadinessReport(walk: WalkResult): Promise<DataFetchingReadinessReport> {
  const sourceFiles = await dataFetchingSourceFiles(walk);
  const clientSetups = dataFetchingClientSetups(sourceFiles);
  const queryUsages = dataFetchingQueryUsages(sourceFiles);
  const cacheSignals = dataFetchingCacheSignals(sourceFiles);
  const dataFlowSignals = dataFetchingDataFlowSignals(sourceFiles);
  const tanstackQuerySignals = dataFetchingTanstackQuerySignals(sourceFiles);
  const packageSignals = dataFetchingPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasClient = clientSetups.some((item) => item.hasClient);
  const hasProvider = clientSetups.some((item) => item.hasProvider);
  const hasQueries = queryUsages.some((item) => item.queryCount > 0 || item.infiniteQueryCount > 0);
  const hasMutations = queryUsages.some((item) => item.mutationCount > 0);
  const hasInvalidation = dataFlowSignals.some((item) => item.signal === "invalidateQueries" && item.readiness === "ready");
  const hasCachePolicy = cacheSignals.some((item) => ["staleTime", "gcTime", "retry", "enabled"].includes(item.signal) && item.readiness === "ready");
  const hasHydration = tanstackQuerySignals.some((item) => ["hydration-boundary", "dehydrate-options"].includes(item.signal) && item.readiness === "ready");
  const hasPersistence = tanstackQuerySignals.some((item) => ["persist-query-client-provider", "create-persister", "broadcast-query-client"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: DataFetchingReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasClient && !hasQueries) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the data-fetching library before claiming server-state readiness.",
      why: "TanStack Query-style readiness starts with an explicit client/cache layer or hook usage surface.",
      relatedHref: "html/data-fetching-readiness.html"
    });
  }
  if (hasPackage && !hasProvider && !hasClient) {
    riskQueue.push({
      priority: "medium",
      action: "Create a QueryClient and provider boundary near the app root.",
      why: "Query hooks need a stable client/cache owner so learners can trace where server state is stored.",
      relatedHref: "html/data-fetching-readiness.html"
    });
  }
  if (hasQueries && !hasCachePolicy) {
    riskQueue.push({
      priority: "low",
      action: "Document cache timing and retry controls for important queries.",
      why: "staleTime, gcTime, retry, and enabled explain why data refetches or stays cached.",
      relatedHref: "html/data-fetching-readiness.html"
    });
  }
  if (hasMutations && !hasInvalidation) {
    riskQueue.push({
      priority: "medium",
      action: "Connect mutations to invalidateQueries or setQueryData where data changes.",
      why: "Mutation success paths should explain how stale cached data becomes fresh again.",
      relatedHref: "html/data-fetching-readiness.html"
    });
  }
  if ((hasHydration || hasPersistence) && !hasCachePolicy) {
    riskQueue.push({
      priority: "low",
      action: "Document cache timing when hydration, persistence, or broadcast cache flows are present.",
      why: "staleTime, gcTime, retryDelay, and refetch policies explain when restored server state becomes stale.",
      relatedHref: "html/data-fetching-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run data-fetching tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not fetch remote APIs, instantiate app providers, hydrate caches, or execute the analyzed project's tests.",
    relatedHref: "html/data-fetching-readiness.html"
  });

  return {
    summary: `TanStack Query식 data fetching readiness report: client setup ${clientSetups.length}개, query usage ${queryUsages.length}개, cache signal ${cacheSignals.length}개, TanStack Query signal ${tanstackQuerySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "TanStack Query QueryClient QueryClientProvider useQuery useMutation queryOptions infiniteQueryOptions mutationOptions useQueries useSuspenseQuery useSuspenseInfiniteQuery usePrefetchQuery queryKey queryFn invalidateQueries refetchQueries cancelQueries removeQueries setQueryData setQueriesData getQueryData getQueryState ensureQueryData staleTime gcTime retry retryDelay networkMode structuralSharing hydrate dehydrate HydrationBoundary persistQueryClient PersistQueryClientProvider createPersister broadcastQueryClient focusManager onlineManager notifyManager streamedQuery devtools",
    clientSetups,
    queryUsages,
    cacheSignals,
    dataFlowSignals,
    tanstackQuerySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"QueryClient|QueryClientProvider|useQuery|useMutation\" src app pages test", purpose: "Inventory query client setup and hook usage." },
      { command: "rg \"queryKey|queryFn|invalidateQueries|setQueryData\" src app pages test", purpose: "Check whether query keys, fetch functions, and cache update paths are explicit." },
      { command: "rg \"queryOptions|infiniteQueryOptions|mutationOptions|useQueries|useSuspenseQuery|usePrefetchQuery\" src app pages test", purpose: "Find typed query option factories and advanced TanStack Query hooks." },
      { command: "rg \"staleTime|gcTime|retry|enabled|refetchOnWindowFocus\" src app pages test", purpose: "Review cache timing and refetch policy controls." },
      { command: "rg \"dehydrate|HydrationBoundary|PersistQueryClientProvider|persistQueryClient|createPersister|broadcastQueryClient|ReactQueryDevtools\" src app pages test", purpose: "Find SSR hydration, persistence, broadcast sync, and devtools surfaces." },
      { command: "npx eslint . --rule '@tanstack/query/stable-query-client:error'", purpose: "Run TanStack Query lint checks when the plugin is installed." },
      { command: "npx vitest run", purpose: "Run local tests that exercise hooks, cache invalidation, or data-fetching boundaries." }
    ],
    learnerNextSteps: [
      "먼저 app root 근처에서 QueryClient와 Provider가 어디서 만들어지는지 확인하세요.",
      "각 useQuery는 queryKey와 queryFn을 함께 읽어 어떤 서버 데이터를 어떤 이름으로 캐시하는지 파악하세요.",
      "useMutation이 있다면 성공 후 invalidateQueries나 setQueryData로 캐시를 갱신하는지 확인하세요.",
      "queryOptions, suspense, hydration, persistence, manager 신호가 있다면 캐시 생명주기와 복구 흐름을 별도 학습 노드로 보세요.",
      "이 리포트는 실제 API 호출 결과가 아닙니다. 네트워크 동작은 원본 프로젝트 테스트나 브라우저에서 별도로 확인하세요."
    ]
  };
}

type DataFetchingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataFetchingSourceFiles(walk: WalkResult): Promise<DataFetchingSourceFile[]> {
  const files: DataFetchingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dataFetchingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!dataFetchingPathSignal(file.relPath) && !dataFetchingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function dataFetchingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dataFetchingPathSignal(filePath)
    || /^(package\.json|tsconfig\.json|vite\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|ya?ml)$/i.test(filePath);
}

function dataFetchingPathSignal(filePath: string): boolean {
  return /(query|queries|mutation|mutations|api|client|fetch|hooks?|loaders?|server[-_]?state|tanstack|react-query|swr|axios|ky)/i.test(filePath);
}

function dataFetchingContentSignal(text: string): boolean {
  return /\b(QueryClient|QueryClientProvider|useQuery|useSuspenseQuery|useSuspenseInfiniteQuery|useSuspenseQueries|useQueries|useMutation|useMutationState|useInfiniteQuery|usePrefetchQuery|usePrefetchInfiniteQuery|queryOptions|infiniteQueryOptions|mutationOptions|queryKey|queryFn|invalidateQueries|refetchQueries|cancelQueries|removeQueries|setQueryData|setQueriesData|getQueryData|getQueryState|ensureQueryData|fetchQuery|fetchInfiniteQuery|dehydrate|hydrate|HydrationBoundary|persistQueryClient|PersistQueryClientProvider|createPersister|broadcastQueryClient|ReactQueryDevtools|onlineManager|focusManager|notifyManager|streamedQuery|skipToken|useSWR|axios\.|ky\(|graphql-request)\b/i.test(text);
}

function dataFetchingClientSetups(sourceFiles: DataFetchingSourceFile[]): DataFetchingReadinessReport["clientSetups"] {
  const rows: DataFetchingReadinessReport["clientSetups"] = [];
  for (const source of sourceFiles) {
    const hasClient = /\bnew\s+QueryClient\b|\bQueryClient\(/i.test(source.text);
    const hasProvider = /\bQueryClientProvider\b|VueQueryPlugin|provideTanStackQuery|QueryClientProvider/i.test(source.text);
    const devtoolsSignal = /\bReactQueryDevtools|TanStackQueryDevtools|VueQueryDevtools|devtools/i.test(source.text);
    if (!hasClient && !hasProvider && !devtoolsSignal) continue;
    rows.push({
      filePath: source.filePath,
      framework: dataFetchingFramework(source),
      hasClient,
      hasProvider,
      devtoolsSignal,
      readiness: hasClient && hasProvider ? "ready" : "partial",
      evidence: `${source.filePath} contains QueryClient ${hasClient ? "yes" : "no"}, provider ${hasProvider ? "yes" : "no"}, devtools ${devtoolsSignal ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function dataFetchingFramework(source: DataFetchingSourceFile): DataFetchingReadinessReport["clientSetups"][number]["framework"] {
  if (/react-query|@tanstack\/react-query|ReactQuery/i.test(source.text) || /\.(tsx|jsx)$/i.test(source.filePath)) return "react";
  if (/vue-query|@tanstack\/vue-query|VueQuery/i.test(source.text) || /\.vue$/i.test(source.filePath)) return "vue";
  if (/svelte-query|@tanstack\/svelte-query/i.test(source.text) || /\.svelte$/i.test(source.filePath)) return "svelte";
  if (/solid-query|@tanstack\/solid-query/i.test(source.text)) return "solid";
  if (/angular-query|@tanstack\/angular-query/i.test(source.text)) return "angular";
  if (/query-core|@tanstack\/query-core/i.test(source.text)) return "core";
  return "unknown";
}

function dataFetchingQueryUsages(sourceFiles: DataFetchingSourceFile[]): DataFetchingReadinessReport["queryUsages"] {
  const rows: DataFetchingReadinessReport["queryUsages"] = [];
  for (const source of sourceFiles) {
    const queryCount = countMatches(source.text, /\b(useQuery|useSuspenseQuery|useQueries)\b/gi);
    const mutationCount = countMatches(source.text, /\b(useMutation|mutationFn|mutateAsync|mutate\()/gi);
    const infiniteQueryCount = countMatches(source.text, /\b(useInfiniteQuery|useSuspenseInfiniteQuery|fetchInfiniteQuery|prefetchInfiniteQuery)\b/gi);
    const queryKeySignals = countMatches(source.text, /\b(queryKey|mutationKey)\s*:/gi);
    const queryFnSignals = countMatches(source.text, /\b(queryFn|mutationFn)\s*:/gi);
    if (queryCount + mutationCount + infiniteQueryCount + queryKeySignals + queryFnSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      queryCount,
      mutationCount,
      infiniteQueryCount,
      queryKeySignals,
      queryFnSignals,
      readiness: (queryCount + infiniteQueryCount > 0 && queryKeySignals > 0 && queryFnSignals > 0) || (mutationCount > 0 && queryFnSignals > 0) ? "ready" : "partial",
      evidence: `${source.filePath} contains queries ${queryCount}, mutations ${mutationCount}, infinite queries ${infiniteQueryCount}, query keys ${queryKeySignals}, query functions ${queryFnSignals}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function dataFetchingCacheSignals(sourceFiles: DataFetchingSourceFile[]): DataFetchingReadinessReport["cacheSignals"] {
  const specs: Array<{ signal: DataFetchingReadinessReport["cacheSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "staleTime", pattern: /\bstaleTime\s*:/i, evidence: "staleTime cache freshness evidence was detected." },
    { signal: "gcTime", pattern: /\bgcTime\s*:/i, evidence: "gcTime cache retention evidence was detected." },
    { signal: "retry", pattern: /\bretry\s*:/i, evidence: "retry policy evidence was detected." },
    { signal: "enabled", pattern: /\benabled\s*:/i, evidence: "dependent query enabled flag evidence was detected." },
    { signal: "placeholderData", pattern: /\bplaceholderData\s*:/i, evidence: "placeholder data evidence was detected." },
    { signal: "initialData", pattern: /\binitialData\s*:/i, evidence: "initial data evidence was detected." },
    { signal: "select", pattern: /\bselect\s*:/i, evidence: "data selection evidence was detected." },
    { signal: "suspense", pattern: /\b(useSuspenseQuery|suspense\s*:)/i, evidence: "Suspense query evidence was detected." },
    { signal: "refetchOnWindowFocus", pattern: /\brefetchOnWindowFocus\s*:/i, evidence: "window focus refetch policy evidence was detected." },
    { signal: "refetchOnReconnect", pattern: /\brefetchOnReconnect\s*:/i, evidence: "reconnect refetch policy evidence was detected." }
  ];
  return dataFetchingSignalFromSpecs(sourceFiles, specs, "cache", "signal");
}

function dataFetchingDataFlowSignals(sourceFiles: DataFetchingSourceFile[]): DataFetchingReadinessReport["dataFlowSignals"] {
  const specs: Array<{ signal: DataFetchingReadinessReport["dataFlowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "invalidateQueries", pattern: /\binvalidateQueries\b/i, evidence: "cache invalidation evidence was detected." },
    { signal: "prefetchQuery", pattern: /\b(prefetchQuery|fetchQuery|ensureQueryData)\b/i, evidence: "prefetch/fetch query evidence was detected." },
    { signal: "setQueryData", pattern: /\bsetQueryData\b/i, evidence: "manual cache write evidence was detected." },
    { signal: "getQueryData", pattern: /\bgetQueryData\b/i, evidence: "manual cache read evidence was detected." },
    { signal: "dehydrate", pattern: /\bdehydrate\b/i, evidence: "SSR dehydrate evidence was detected." },
    { signal: "hydrate", pattern: /\b(hydrate|HydrationBoundary)\b/i, evidence: "SSR/client hydration evidence was detected." },
    { signal: "persistQueryClient", pattern: /\bpersistQueryClient\b|createSyncStoragePersister|createAsyncStoragePersister/i, evidence: "query persistence evidence was detected." },
    { signal: "onlineManager", pattern: /\bonlineManager\b/i, evidence: "online manager evidence was detected." },
    { signal: "focusManager", pattern: /\bfocusManager\b/i, evidence: "focus manager evidence was detected." },
    { signal: "devtools", pattern: /\bReactQueryDevtools|TanStackQueryDevtools|devtools/i, evidence: "query devtools evidence was detected." }
  ];
  return dataFetchingSignalFromSpecs(sourceFiles, specs, "data-flow", "signal");
}

function dataFetchingTanstackQuerySignals(sourceFiles: DataFetchingSourceFile[]): DataFetchingReadinessReport["tanstackQuerySignals"] {
  const specs: Array<{ signal: DataFetchingReadinessReport["tanstackQuerySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "query-options", pattern: /\bqueryOptions\s*(<[^>]+>)?\s*\(/i, evidence: "queryOptions factory evidence was detected." },
    { signal: "infinite-query-options", pattern: /\binfiniteQueryOptions\s*(<[^>]+>)?\s*\(/i, evidence: "infiniteQueryOptions factory evidence was detected." },
    { signal: "mutation-options", pattern: /\bmutationOptions\s*(<[^>]+>)?\s*\(/i, evidence: "mutationOptions factory evidence was detected." },
    { signal: "use-queries", pattern: /\buseQueries\s*(<[^>]+>)?\s*\(/i, evidence: "useQueries evidence was detected." },
    { signal: "use-suspense-query", pattern: /\buseSuspenseQuery\s*(<[^>]+>)?\s*\(/i, evidence: "useSuspenseQuery evidence was detected." },
    { signal: "use-suspense-infinite-query", pattern: /\buseSuspenseInfiniteQuery\s*(<[^>]+>)?\s*\(/i, evidence: "useSuspenseInfiniteQuery evidence was detected." },
    { signal: "use-suspense-queries", pattern: /\buseSuspenseQueries\s*(<[^>]+>)?\s*\(/i, evidence: "useSuspenseQueries evidence was detected." },
    { signal: "use-prefetch-query", pattern: /\busePrefetchQuery\s*(<[^>]+>)?\s*\(/i, evidence: "usePrefetchQuery evidence was detected." },
    { signal: "use-prefetch-infinite-query", pattern: /\busePrefetchInfiniteQuery\s*(<[^>]+>)?\s*\(/i, evidence: "usePrefetchInfiniteQuery evidence was detected." },
    { signal: "fetch-query", pattern: /\b(fetchQuery|prefetchQuery)\s*\(/i, evidence: "fetchQuery or prefetchQuery evidence was detected." },
    { signal: "fetch-infinite-query", pattern: /\b(fetchInfiniteQuery|prefetchInfiniteQuery)\s*\(/i, evidence: "fetchInfiniteQuery or prefetchInfiniteQuery evidence was detected." },
    { signal: "ensure-query-data", pattern: /\bensureQueryData\s*\(/i, evidence: "ensureQueryData evidence was detected." },
    { signal: "ensure-infinite-query-data", pattern: /\bensureInfiniteQueryData\s*\(/i, evidence: "ensureInfiniteQueryData evidence was detected." },
    { signal: "get-query-state", pattern: /\bgetQueryState\s*\(/i, evidence: "getQueryState evidence was detected." },
    { signal: "get-mutation-cache", pattern: /\bgetMutationCache\s*\(/i, evidence: "getMutationCache evidence was detected." },
    { signal: "query-cache", pattern: /\b(new\s+QueryCache|QueryCache\s*(<[^>]+>)?\s*\(|getQueryCache\s*\()/i, evidence: "QueryCache evidence was detected." },
    { signal: "mutation-cache", pattern: /\b(new\s+MutationCache|MutationCache\s*(<[^>]+>)?\s*\(|getMutationCache\s*\()/i, evidence: "MutationCache evidence was detected." },
    { signal: "set-queries-data", pattern: /\bsetQueriesData\s*\(/i, evidence: "setQueriesData evidence was detected." },
    { signal: "reset-queries", pattern: /\bresetQueries\s*\(/i, evidence: "resetQueries evidence was detected." },
    { signal: "cancel-queries", pattern: /\bcancelQueries\s*\(/i, evidence: "cancelQueries evidence was detected." },
    { signal: "remove-queries", pattern: /\bremoveQueries\s*\(/i, evidence: "removeQueries evidence was detected." },
    { signal: "refetch-queries", pattern: /\brefetchQueries\s*\(/i, evidence: "refetchQueries evidence was detected." },
    { signal: "is-fetching", pattern: /\bisFetching\s*\(/i, evidence: "isFetching evidence was detected." },
    { signal: "use-is-fetching", pattern: /\buseIsFetching\s*(<[^>]+>)?\s*\(/i, evidence: "useIsFetching evidence was detected." },
    { signal: "use-is-mutating", pattern: /\buseIsMutating\s*(<[^>]+>)?\s*\(/i, evidence: "useIsMutating evidence was detected." },
    { signal: "use-mutation-state", pattern: /\buseMutationState\s*(<[^>]+>)?\s*\(/i, evidence: "useMutationState evidence was detected." },
    { signal: "query-defaults", pattern: /\b(setQueryDefaults|getQueryDefaults|defaultOptions)\b/i, evidence: "query default options evidence was detected." },
    { signal: "network-mode", pattern: /\bnetworkMode\s*:/i, evidence: "networkMode option evidence was detected." },
    { signal: "retry-delay", pattern: /\bretryDelay\s*:/i, evidence: "retryDelay option evidence was detected." },
    { signal: "throw-on-error", pattern: /\bthrowOnError\s*:/i, evidence: "throwOnError option evidence was detected." },
    { signal: "structural-sharing", pattern: /\bstructuralSharing\s*:/i, evidence: "structuralSharing option evidence was detected." },
    { signal: "notify-on-change-props", pattern: /\bnotifyOnChangeProps\s*:/i, evidence: "notifyOnChangeProps option evidence was detected." },
    { signal: "subscribed", pattern: /\bsubscribed\s*:/i, evidence: "subscribed option evidence was detected." },
    { signal: "placeholder-keep-previous", pattern: /\b(placeholderData\s*:\s*keepPreviousData|keepPreviousData)\b/i, evidence: "keepPreviousData placeholder evidence was detected." },
    { signal: "skip-token", pattern: /\bskipToken\b/i, evidence: "skipToken evidence was detected." },
    { signal: "dehydrate-options", pattern: /\b(dehydrate\s*\(|shouldDehydrate(Query|Mutation)|DehydratedState|dehydrateOptions)\b/i, evidence: "dehydrate option evidence was detected." },
    { signal: "hydration-boundary", pattern: /\bHydrationBoundary\b/i, evidence: "HydrationBoundary evidence was detected." },
    { signal: "persist-query-client-provider", pattern: /\b(PersistQueryClientProvider|persistQueryClient)\b/i, evidence: "PersistQueryClientProvider or persistQueryClient evidence was detected." },
    { signal: "create-persister", pattern: /\b(createPersister|createSyncStoragePersister|createAsyncStoragePersister)\b/i, evidence: "query persister evidence was detected." },
    { signal: "broadcast-query-client", pattern: /\bbroadcastQueryClient\b/i, evidence: "broadcastQueryClient evidence was detected." },
    { signal: "focus-manager", pattern: /\bfocusManager\.(setEventListener|setFocused|isFocused|subscribe)\b/i, evidence: "focusManager lifecycle evidence was detected." },
    { signal: "online-manager", pattern: /\bonlineManager\.(setEventListener|setOnline|isOnline|subscribe)\b/i, evidence: "onlineManager lifecycle evidence was detected." },
    { signal: "notify-manager", pattern: /\bnotifyManager\.(batch|batchCalls|schedule|setNotifyFunction|setBatchNotifyFunction|setScheduler)\b/i, evidence: "notifyManager batching evidence was detected." },
    { signal: "timeout-manager", pattern: /\btimeoutManager\b/i, evidence: "timeoutManager evidence was detected." },
    { signal: "streamed-query", pattern: /\bstreamedQuery\s*(<[^>]+>)?\s*\(/i, evidence: "streamedQuery evidence was detected." }
  ];
  return dataFetchingSignalFromSpecs(sourceFiles, specs, "TanStack Query", "signal");
}

function dataFetchingPackageSignals(sourceFiles: DataFetchingSourceFile[]): DataFetchingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataFetchingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tanstack-react-query", pattern: /@tanstack\/react-query|react-query/i, evidence: "TanStack React Query package evidence was detected." },
    { signal: "tanstack-query-core", pattern: /@tanstack\/query-core/i, evidence: "TanStack Query core package evidence was detected." },
    { signal: "swr", pattern: /["']swr["']|\buseSWR\b/i, evidence: "SWR package evidence was detected." },
    { signal: "axios", pattern: /["']axios["']|\baxios\./i, evidence: "Axios package evidence was detected." },
    { signal: "ky", pattern: /["']ky["']|\bky\(/i, evidence: "Ky package evidence was detected." },
    { signal: "graphql-request", pattern: /graphql-request|GraphQLClient/i, evidence: "graphql-request package evidence was detected." },
    { signal: "apollo-client", pattern: /@apollo\/client|ApolloClient|useQuery\(/i, evidence: "Apollo Client package evidence was detected." }
  ];
  return dataFetchingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataFetchingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataFetchingSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/data-fetching-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildRoutingReadinessReport(walk: WalkResult): Promise<RoutingReadinessReport> {
  const sourceFiles = await routingSourceFiles(walk);
  const routingSetups = routingSetupsFromSources(sourceFiles);
  const routeDefinitions = routingRouteDefinitions(sourceFiles);
  const navigationSignals = routingNavigationSignals(sourceFiles);
  const dataRouteSignals = routingDataRouteSignals(sourceFiles);
  const fileRouteSignals = routingFileRouteSignals(sourceFiles);
  const tanstackSignals = routingTanstackSignals(sourceFiles);
  const packageSignals = routingPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = routingSetups.some((item) => item.hasRouter || item.hasProvider || item.hasConfig);
  const hasRoutes = routeDefinitions.some((item) => item.routeCount > 0 || item.indexSignal || item.layoutSignal);
  const hasNavigation = navigationSignals.some((item) => ["Link", "NavLink", "Navigate", "useNavigate"].includes(item.signal) && item.readiness === "ready");
  const hasDynamicRoutes = routeDefinitions.some((item) => item.dynamicSegmentCount > 0);
  const hasParamsRead = navigationSignals.some((item) => item.signal === "useParams" && item.readiness === "ready");
  const hasDataRoutes = dataRouteSignals.some((item) => ["loader", "action", "clientLoader", "clientAction", "useLoaderData", "useActionData"].includes(item.signal) && item.readiness === "ready");
  const hasErrorBoundary = dataRouteSignals.some((item) => ["ErrorBoundary", "useRouteError"].includes(item.signal) && item.readiness === "ready");
  const hasFileRoutes = fileRouteSignals.some((item) => ["routes-ts", "app-routes-directory", "flatRoutes"].includes(item.signal) && item.readiness === "ready");
  const hasRootRoute = fileRouteSignals.some((item) => item.signal === "root-route" && item.readiness === "ready");

  const riskQueue: RoutingReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasRoutes) {
    riskQueue.push({
      priority: "high",
      action: "Add or document the routing surface before claiming navigation readiness.",
      why: "React Router-style readiness starts with an explicit router mode, route definitions, or file-route convention.",
      relatedHref: "html/routing-readiness.html"
    });
  }
  if (hasRoutes && !hasNavigation) {
    riskQueue.push({
      priority: "medium",
      action: "Connect route definitions to visible navigation with Link, NavLink, Navigate, or useNavigate.",
      why: "Learners need to trace not only which URLs exist, but how users move between them.",
      relatedHref: "html/routing-readiness.html"
    });
  }
  if (hasDataRoutes && !hasErrorBoundary) {
    riskQueue.push({
      priority: "medium",
      action: "Add route-level ErrorBoundary or useRouteError handling around data routes.",
      why: "React Router data routes can throw from loaders/actions, so the nearest route boundary explains failure UI.",
      relatedHref: "html/routing-readiness.html"
    });
  }
  if (hasDynamicRoutes && !hasParamsRead) {
    riskQueue.push({
      priority: "low",
      action: "Document where dynamic route params are read with useParams or loader/action params.",
      why: "Dynamic segments are easier to learn when the URL token is tied to the component or data loader that consumes it.",
      relatedHref: "html/routing-readiness.html"
    });
  }
  if (hasFileRoutes && !hasRootRoute) {
    riskQueue.push({
      priority: "low",
      action: "Make the root route or app shell easy to find from the file-route map.",
      why: "Framework/file-route mode usually renders child routes through a root route and Outlet boundary.",
      relatedHref: "html/routing-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run routing tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not execute loaders, actions, navigation transitions, dev servers, or browser route flows.",
    relatedHref: "html/routing-readiness.html"
  });

  return {
    summary: `React Router/TanStack Router식 routing readiness report: setup ${routingSetups.length}개, route definition ${routeDefinitions.length}개, navigation signal ${navigationSignals.length}개, data-route signal ${dataRouteSignals.length}개, TanStack signal ${tanstackSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "React Router TanStack Router BrowserRouter createBrowserRouter RouterProvider routes.ts route index Link NavLink Outlet loader action ErrorBoundary useNavigate useParams useSearchParams createRouter routeTree routeTree.gen createFileRoute createRootRoute createRoute Route.useParams validateSearch beforeLoad SearchSchemaInput linkOptions createRouteMask preload notFound TanStackRouterVite TanStackRouterDevtools",
    routingSetups,
    routeDefinitions,
    navigationSignals,
    dataRouteSignals,
    fileRouteSignals,
    tanstackSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"BrowserRouter|createBrowserRouter|RouterProvider|routes.ts|flatRoutes\" src app pages", purpose: "Inventory top-level router mode and provider/config setup." },
      { command: "rg \"<Route|route\\\\(|index\\\\(|children:|Outlet\" src app pages", purpose: "Find explicit route definitions, nested routes, index routes, and outlet boundaries." },
      { command: "rg \"Link|NavLink|useNavigate|useParams|useSearchParams|useBlocker\" src app pages test", purpose: "Review visible navigation, dynamic params, search params, and blocking flows." },
      { command: "rg \"loader|action|clientLoader|ErrorBoundary|useRouteError|redirect\" src app pages", purpose: "Check data-route loading, mutation, redirect, and error-boundary surfaces." },
      { command: "rg \"createRouter|routeTree|routeTree.gen|createFileRoute|createRootRoute|createRoute|Route.useParams|Route.useSearch|validateSearch|beforeLoad|createRouteMask|TanStackRouterVite|TanStackRouterDevtools\" src app routes", purpose: "Map TanStack Router typed route tree, file/code routes, search validation, preload/masks, plugins, and devtools." },
      { command: "npx react-router typegen", purpose: "Generate React Router framework-mode route types when the dev package is installed." },
      { command: "npx vitest run", purpose: "Run local tests that exercise route rendering, navigation, loaders, and error boundaries." }
    ],
    learnerNextSteps: [
      "먼저 BrowserRouter, RouterProvider, routes.ts 중 어떤 라우팅 모드를 쓰는지 확인하세요.",
      "route/index/children/Outlet을 함께 읽으면 URL 구조와 화면 중첩 구조를 연결할 수 있습니다.",
      "동적 경로가 있다면 params를 어디서 읽는지 component와 loader/action 양쪽에서 확인하세요.",
      "TanStack Router 프로젝트라면 routeTree.gen, createFileRoute/createRootRoute, Route.use* hook, validateSearch, beforeLoad, linkOptions, route masks, preload, devtools/plugin 경계를 따로 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 navigation과 loader/action 동작은 원본 프로젝트 테스트나 브라우저에서 별도로 확인하세요."
    ]
  };
}

type RoutingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function routingSourceFiles(walk: WalkResult): Promise<RoutingSourceFile[]> {
  const files: RoutingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !routingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 200_000);
    if (!text) continue;
    if (!routingPathSignal(file.relPath) && !routingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function routingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return routingPathSignal(filePath)
    || /^(package\.json|react-router\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s|routes\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|ya?ml)$/i.test(filePath);
}

function routingPathSignal(filePath: string): boolean {
  return /(^|\/)(routes?|router|navigation|nav|pages?|app)(\/|\.|-|_|$)|react-router|tanstack-router|vue-router|next\.config|route\.[jt]sx?$|\[[^\]]+\]/i.test(filePath);
}

function routingContentSignal(text: string): boolean {
  return /\b(BrowserRouter|HashRouter|MemoryRouter|RouterProvider|createBrowserRouter|createHashRouter|createMemoryRouter|createRoutesFromElements|useRoutes|Routes|RouteObject|Link|NavLink|Navigate|Outlet|useNavigate|useLocation|useParams|useSearchParams|useMatches|useBlocker|useFetcher|loader|clientLoader|action|clientAction|useLoaderData|useActionData|useRouteError|ErrorBoundary|HydrateFallback|redirect|flatRoutes|@react-router\/dev|@react-router\/fs-routes|react-router-dom|@tanstack\/react-router|@tanstack\/router-plugin|@tanstack\/eslint-plugin-router|TanStackRouterVite|TanStackRouterDevtools|createRouter|routeTree|routeTree\.gen|createFileRoute|createRootRoute|createRootRouteWithContext|createRoute|RouteApi|getRouteApi|validateSearch|beforeLoad|SearchSchemaInput|linkOptions|createRouteMask|create-route-property-order|notFound|vue-router)\b/i.test(text);
}

function routingSetupsFromSources(sourceFiles: RoutingSourceFile[]): RoutingReadinessReport["routingSetups"] {
  const rows: RoutingReadinessReport["routingSetups"] = [];
  for (const source of sourceFiles) {
    const hasRouter = /\b(BrowserRouter|HashRouter|MemoryRouter|createBrowserRouter|createHashRouter|createMemoryRouter|createRoutesFromElements|createRouter|createFileRoute|createRootRoute)\b/i.test(source.text);
    const hasProvider = /\b(RouterProvider|BrowserRouter|HashRouter|MemoryRouter|RouterView|<Router\b)\b/i.test(source.text);
    const hasConfig = /routes\.[cm]?[jt]sx?$|react-router\.config|@react-router\/dev\/routes|flatRoutes|defineConfig|createFileRoute|createRootRoute|routeTree\.gen/i.test(source.filePath) || /@react-router\/dev\/routes|flatRoutes|route\s*\(|index\s*\(|createFileRoute|createRootRoute|createRootRouteWithContext|routeTree|routeTree\.gen/i.test(source.text);
    if (!hasRouter && !hasProvider && !hasConfig) continue;
    rows.push({
      filePath: source.filePath,
      mode: routingMode(source),
      hasRouter,
      hasProvider,
      hasConfig,
      readiness: (hasRouter || hasConfig) && (hasProvider || /routes\.[cm]?[jt]sx?$|app\/routes\//i.test(source.filePath)) ? "ready" : "partial",
      evidence: `${source.filePath} contains router ${hasRouter ? "yes" : "no"}, provider ${hasProvider ? "yes" : "no"}, config ${hasConfig ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function routingMode(source: RoutingSourceFile): RoutingReadinessReport["routingSetups"][number]["mode"] {
  if (/@tanstack\/react-router|@tanstack\/router-plugin|createRouter|routeTree|createFileRoute|createRootRoute|createRootRouteWithContext/i.test(source.text)) return "tanstack";
  if (/flatRoutes|@react-router\/fs-routes|app\/routes\//i.test(source.text) || /app\/routes\//i.test(source.filePath)) return "file-routes";
  if (/@react-router\/dev|react-router\.config|routes\.[cm]?[jt]sx?$/i.test(source.text) || /react-router\.config|routes\.[cm]?[jt]sx?$/i.test(source.filePath)) return "framework";
  if (/createBrowserRouter|RouterProvider|loader|action|useFetcher/i.test(source.text)) return "data";
  if (/BrowserRouter|HashRouter|MemoryRouter|<Routes|<Route|useRoutes/i.test(source.text)) return "declarative";
  if (/vue-router|createRouter|RouterView/i.test(source.text)) return "vue";
  if (/next\/link|next\/navigation|app\/.*page\.[jt]sx?$|pages\/.*\.[jt]sx?$/i.test(source.text) || /(^|\/)(app|pages)\/.*\.[jt]sx?$/i.test(source.filePath)) return "next";
  return "unknown";
}

function routingRouteDefinitions(sourceFiles: RoutingSourceFile[]): RoutingReadinessReport["routeDefinitions"] {
  const rows: RoutingReadinessReport["routeDefinitions"] = [];
  for (const source of sourceFiles) {
    const routeCount = countMatches(source.text, /(<Route\b|\broute\s*\(|\bindex\s*\(|\bpath\s*:|\bcreateFileRoute\s*\(|\bcreateRoute\s*\(|\bcreateRoutesFromElements\s*\()/gi);
    const dynamicSegmentCount = countMatches(source.text, /(:[A-Za-z_$][\w$-]*|\$[A-Za-z_$][\w$-]*|\[[A-Za-z_$][\w$.-]*\])/g) + countMatches(source.filePath, /(\$[A-Za-z_$][\w$-]*|\[[A-Za-z_$][\w$.-]*\])/g);
    const nestedSignal = /\bchildren\s*:|<Outlet\b|\bOutlet\b|route\s*\([^)]*,\s*[^)]*,\s*\[/i.test(source.text) || /\w+\.\w+\.[jt]sx?$/i.test(source.filePath);
    const indexSignal = /\bindex\s*\(|\bindex\s*:\s*true|_index\.[jt]sx?$|\/index\.[jt]sx?$/i.test(source.text) || /(^|\/)_?index\.[jt]sx?$/i.test(source.filePath);
    const layoutSignal = /\b(Outlet|Layout|root\.tsx|_layout|ErrorBoundary)\b/i.test(source.text) || /(^|\/)(root|layout|_layout)\.[jt]sx?$/i.test(source.filePath);
    if (routeCount + dynamicSegmentCount === 0 && !nestedSignal && !indexSignal && !layoutSignal) continue;
    rows.push({
      filePath: source.filePath,
      routeCount,
      dynamicSegmentCount,
      nestedSignal,
      indexSignal,
      layoutSignal,
      readiness: routeCount > 0 || indexSignal || layoutSignal ? "ready" : "partial",
      evidence: `${source.filePath} contains routes ${routeCount}, dynamic segments ${dynamicSegmentCount}, nested ${nestedSignal ? "yes" : "no"}, index ${indexSignal ? "yes" : "no"}, layout ${layoutSignal ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function routingNavigationSignals(sourceFiles: RoutingSourceFile[]): RoutingReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: RoutingReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "Link", pattern: /\bLink\b|<Link\b/i, evidence: "visible route link evidence was detected." },
    { signal: "NavLink", pattern: /\bNavLink\b|<NavLink\b/i, evidence: "active navigation link evidence was detected." },
    { signal: "Navigate", pattern: /\bNavigate\b|<Navigate\b/i, evidence: "declarative redirect/navigation evidence was detected." },
    { signal: "useNavigate", pattern: /\buseNavigate\b/i, evidence: "imperative navigation hook evidence was detected." },
    { signal: "useLocation", pattern: /\buseLocation\b/i, evidence: "current location hook evidence was detected." },
    { signal: "useParams", pattern: /\buseParams\b|\bparams\./i, evidence: "route params reading evidence was detected." },
    { signal: "useSearchParams", pattern: /\buseSearchParams\b|URLSearchParams|searchParams/i, evidence: "query-string/search params evidence was detected." },
    { signal: "useMatches", pattern: /\buseMatches\b|\bmatchRoutes\b|\buseMatch\b/i, evidence: "route matching hook/helper evidence was detected." },
    { signal: "useBlocker", pattern: /\buseBlocker\b|\buseBeforeUnload\b|navigation blocking/i, evidence: "navigation blocking evidence was detected." },
    { signal: "useFetcher", pattern: /\buseFetcher\b|fetcher\.Form/i, evidence: "fetcher/form navigation state evidence was detected." }
  ];
  return routingSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function routingDataRouteSignals(sourceFiles: RoutingSourceFile[]): RoutingReadinessReport["dataRouteSignals"] {
  const specs: Array<{ signal: RoutingReadinessReport["dataRouteSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "loader", pattern: /\bloader\s*:|export\s+(async\s+)?function\s+loader\b|Route\.LoaderArgs\b/i, evidence: "route loader evidence was detected." },
    { signal: "action", pattern: /\baction\s*:|export\s+(async\s+)?function\s+action\b|Route\.ActionArgs\b/i, evidence: "route action evidence was detected." },
    { signal: "clientLoader", pattern: /\bclientLoader\b|Route\.ClientLoaderArgs/i, evidence: "clientLoader evidence was detected." },
    { signal: "clientAction", pattern: /\bclientAction\b|Route\.ClientActionArgs/i, evidence: "clientAction evidence was detected." },
    { signal: "useLoaderData", pattern: /\buseLoaderData\b|\bloaderData\b/i, evidence: "loader data consumption evidence was detected." },
    { signal: "useActionData", pattern: /\buseActionData\b|\bactionData\b/i, evidence: "action data consumption evidence was detected." },
    { signal: "useRouteError", pattern: /\buseRouteError\b|\bisRouteErrorResponse\b/i, evidence: "route error hook/response evidence was detected." },
    { signal: "ErrorBoundary", pattern: /\bErrorBoundary\b|\berrorElement\b/i, evidence: "route error boundary evidence was detected." },
    { signal: "HydrateFallback", pattern: /\bHydrateFallback\b|clientLoader\.hydrate/i, evidence: "hydration fallback evidence was detected." },
    { signal: "redirect", pattern: /\bredirect(Document)?\s*\(|\breplace\s*\(/i, evidence: "route redirect evidence was detected." },
    { signal: "defer", pattern: /\bdefer\s*\(|\bAwait\b/i, evidence: "deferred data or Await evidence was detected." }
  ];
  return routingSignalFromSpecs(sourceFiles, specs, "data-route", "signal");
}

function routingFileRouteSignals(sourceFiles: RoutingSourceFile[]): RoutingReadinessReport["fileRouteSignals"] {
  const specs: Array<{ signal: RoutingReadinessReport["fileRouteSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "routes-ts", pattern: /(^|\/)routes\.[cm]?[jt]sx?$|@react-router\/dev\/routes/i, evidence: "React Router framework routes.ts config evidence was detected." },
    { signal: "app-routes-directory", pattern: /(^|\/)app\/routes\/|rootDirectory\s*:/i, evidence: "app/routes file-route directory evidence was detected." },
    { signal: "flatRoutes", pattern: /\bflatRoutes\b|@react-router\/fs-routes/i, evidence: "fs-routes flatRoutes evidence was detected." },
    { signal: "index-route", pattern: /_index\.[jt]sx?$|index\s*\(|index\s*:\s*true/i, evidence: "index route evidence was detected." },
    { signal: "dynamic-segment", pattern: /\$[A-Za-z_$][\w$-]*|\[[A-Za-z_$][\w$.-]*\]|:[A-Za-z_$][\w$-]*/i, evidence: "dynamic segment evidence was detected." },
    { signal: "nested-route", pattern: /\w+\.\w+\.[jt]sx?$|children\s*:|<Outlet\b|\bOutlet\b/i, evidence: "nested route or outlet evidence was detected." },
    { signal: "pathless-route", pattern: /(^|\/)_[A-Za-z][\w.-]*\.[jt]sx?$|pathless/i, evidence: "pathless layout route evidence was detected." },
    { signal: "ignoredRouteFiles", pattern: /\bignoredRouteFiles\b/i, evidence: "ignoredRouteFiles configuration evidence was detected." },
    { signal: "root-route", pattern: /(^|\/)(root|layout)\.[jt]sx?$|\broot\.tsx\b|<Outlet\b/i, evidence: "root route or app shell evidence was detected." }
  ];
  return routingSignalFromSpecs(sourceFiles, specs, "file-route", "signal");
}

function routingTanstackSignals(sourceFiles: RoutingSourceFile[]): RoutingReadinessReport["tanstackSignals"] {
  const specs: Array<{ signal: RoutingReadinessReport["tanstackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "router-provider", pattern: /RouterProvider|<RouterProvider\b/i, evidence: "TanStack RouterProvider evidence was detected." },
    { signal: "create-router", pattern: /createRouter\s*\(/i, evidence: "TanStack createRouter evidence was detected." },
    { signal: "route-tree", pattern: /\brouteTree\b|rootRoute\.addChildren/i, evidence: "TanStack route tree evidence was detected." },
    { signal: "generated-route-tree", pattern: /routeTree\.gen|FileRoutesByPath|routeTree = rootRouteImport/i, evidence: "TanStack generated routeTree evidence was detected." },
    { signal: "file-route", pattern: /createFileRoute\s*\(/i, evidence: "TanStack file route evidence was detected." },
    { signal: "root-route", pattern: /createRootRoute\s*\(|createRootRouteWithContext\s*\(|__root\.[jt]sx?|rootRoute/i, evidence: "TanStack root route evidence was detected." },
    { signal: "code-route", pattern: /createRoute\s*\(|addChildren\s*\(/i, evidence: "TanStack code route evidence was detected." },
    { signal: "typed-route-api", pattern: /getRouteApi|new\s+RouteApi|RouteApi\b/i, evidence: "TanStack typed route API evidence was detected." },
    { signal: "route-hooks", pattern: /Route\.use(Params|Search|LoaderData|RouteContext|Navigate)|\.useParams\s*\(|\.useSearch\s*\(|\.useLoaderData\s*\(/i, evidence: "TanStack route hook evidence was detected." },
    { signal: "loader", pattern: /loader\s*:|loaderDeps\s*:|Route\.useLoaderData/i, evidence: "TanStack loader evidence was detected." },
    { signal: "before-load", pattern: /beforeLoad\s*:/i, evidence: "TanStack beforeLoad evidence was detected." },
    { signal: "validate-search", pattern: /validateSearch\s*:/i, evidence: "TanStack validateSearch evidence was detected." },
    { signal: "search-schema", pattern: /SearchSchemaInput|search\.middlewares|retainSearchParams|stripSearchParams/i, evidence: "TanStack search schema/middleware evidence was detected." },
    { signal: "link-options", pattern: /linkOptions\s*\(|activeProps\s*:|activeOptions\s*:|<Link\b[^>]*(to|params|search)=/is, evidence: "TanStack link options evidence was detected." },
    { signal: "route-masking", pattern: /createRouteMask|routeMasks|mask\s*:/i, evidence: "TanStack route masking evidence was detected." },
    { signal: "preload", pattern: /preload\s*:|defaultPreload|preloadDelay|preloadStaleTime|intent/i, evidence: "TanStack preload evidence was detected." },
    { signal: "not-found", pattern: /notFound\s*\(|notFoundComponent|NotFoundRoute/i, evidence: "TanStack not-found evidence was detected." },
    { signal: "devtools", pattern: /TanStackRouterDevtools|@tanstack\/router-devtools/i, evidence: "TanStack Router devtools evidence was detected." },
    { signal: "vite-plugin", pattern: /TanStackRouterVite|@tanstack\/router-plugin|routerPlugin\s*\(/i, evidence: "TanStack Router Vite/plugin evidence was detected." },
    { signal: "eslint-plugin", pattern: /@tanstack\/eslint-plugin-router|create-route-property-order/i, evidence: "TanStack Router ESLint plugin evidence was detected." }
  ];
  return routingSignalFromSpecs(sourceFiles, specs, "TanStack Router", "signal");
}

function routingPackageSignals(sourceFiles: RoutingSourceFile[]): RoutingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: RoutingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "react-router", pattern: /["']react-router["']|from\s+["']react-router["']/i, evidence: "react-router package/import evidence was detected." },
    { signal: "react-router-dom", pattern: /["']react-router-dom["']|from\s+["']react-router-dom["']/i, evidence: "react-router-dom package/import evidence was detected." },
    { signal: "@react-router/dev", pattern: /@react-router\/dev/i, evidence: "@react-router/dev package/config evidence was detected." },
    { signal: "@react-router/fs-routes", pattern: /@react-router\/fs-routes|flatRoutes/i, evidence: "@react-router/fs-routes package evidence was detected." },
    { signal: "tanstack-router", pattern: /@tanstack\/react-router|createFileRoute|createRootRoute/i, evidence: "TanStack Router package/import evidence was detected." },
    { signal: "next", pattern: /["']next["']|next\/link|next\/navigation|app\/.*page\.[jt]sx?$|pages\/.*\.[jt]sx?$/i, evidence: "Next.js route package or file-route evidence was detected." },
    { signal: "vue-router", pattern: /["']vue-router["']|from\s+["']vue-router["']|RouterView/i, evidence: "Vue Router package/import evidence was detected." }
  ];
  return routingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function routingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RoutingSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/routing-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildStateManagementReadinessReport(walk: WalkResult): Promise<StateManagementReadinessReport> {
  const sourceFiles = await stateManagementSourceFiles(walk);
  const storeSetups = stateManagementStoreSetups(sourceFiles);
  const sliceDefinitions = stateManagementSliceDefinitions(sourceFiles);
  const selectorSignals = stateManagementSelectorSignals(sourceFiles);
  const sideEffectSignals = stateManagementSideEffectSignals(sourceFiles);
  const entitySignals = stateManagementEntitySignals(sourceFiles);
  const middlewareSignals = stateManagementMiddlewareSignals(sourceFiles);
  const rtkQuerySignals = stateManagementRtkQuerySignals(sourceFiles);
  const zustandSignals = stateManagementZustandSignals(sourceFiles);
  const jotaiSignals = stateManagementJotaiSignals(sourceFiles);
  const valtioSignals = stateManagementValtioSignals(sourceFiles);
  const mobxSignals = stateManagementMobxSignals(sourceFiles);
  const packageSignals = stateManagementPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasReduxToolkit = packageSignals.some((item) => item.signal === "redux-toolkit" && item.readiness === "ready");
  const hasZustand = packageSignals.some((item) => item.signal === "zustand" && item.readiness === "ready") || zustandSignals.some((item) => item.readiness === "ready");
  const hasJotai = packageSignals.some((item) => item.signal === "jotai" && item.readiness === "ready") || jotaiSignals.some((item) => item.readiness === "ready");
  const hasValtio = packageSignals.some((item) => item.signal === "valtio" && item.readiness === "ready") || valtioSignals.some((item) => item.readiness === "ready");
  const hasMobX = packageSignals.some((item) => item.signal === "mobx" && item.readiness === "ready") || mobxSignals.some((item) => item.readiness === "ready");
  const hasStore = storeSetups.some((item) => item.hasConfigureStore || item.storeType !== "unknown");
  const hasProvider = storeSetups.some((item) => item.hasProvider);
  const hasTypedHooks = storeSetups.some((item) => item.hasTypedHooks) || selectorSignals.some((item) => ["useAppSelector", "RootState"].includes(item.signal) && item.readiness === "ready");
  const hasSlices = sliceDefinitions.some((item) => item.sliceCount > 0);
  const hasSelectors = sliceDefinitions.some((item) => item.selectorCount > 0) || selectorSignals.some((item) => item.readiness === "ready");
  const hasZustandSelector = zustandSignals.some((item) => ["selector", "use-shallow", "shallow-equality", "equality-fn", "subscribe-with-selector"].includes(item.signal) && item.readiness === "ready");
  const hasZustandPersistence = zustandSignals.some((item) => ["persist-middleware", "create-json-storage", "persist-version", "persist-migrate", "on-rehydrate-storage"].includes(item.signal) && item.readiness === "ready");
  const hasJotaiStoreScope = jotaiSignals.some((item) => ["provider", "create-store", "get-default-store"].includes(item.signal) && item.readiness === "ready");
  const hasJotaiSelectorOrFamily = jotaiSignals.some((item) => ["select-atom", "split-atom", "focus-atom", "atom-family"].includes(item.signal) && item.readiness === "ready");
  const hasValtioReadSurface = valtioSignals.some((item) => ["use-snapshot", "snapshot", "use-proxy"].includes(item.signal) && item.readiness === "ready");
  const hasValtioSubscription = valtioSignals.some((item) => ["subscribe", "subscribe-key", "watch"].includes(item.signal) && item.readiness === "ready");
  const hasMobXObservableSetup = mobxSignals.some((item) => ["make-auto-observable", "make-observable", "observable", "extend-observable"].includes(item.signal) && item.readiness === "ready");
  const hasMobXReactionSurface = mobxSignals.some((item) => ["autorun", "reaction", "when", "observer", "observer-component", "use-observer"].includes(item.signal) && item.readiness === "ready");
  const hasMobXActionSurface = mobxSignals.some((item) => ["action", "action-bound", "run-in-action", "flow"].includes(item.signal) && item.readiness === "ready");
  const hasAsyncThunk = sideEffectSignals.some((item) => item.signal === "createAsyncThunk" && item.readiness === "ready");
  const hasExtraReducers = sideEffectSignals.some((item) => ["extraReducers", "builder-callback"].includes(item.signal) && item.readiness === "ready");
  const hasRtkQuery = rtkQuerySignals.some((item) => item.signal === "createApi" && item.readiness === "ready");
  const hasRtkQueryStoreWiring = rtkQuerySignals.some((item) => ["reducerPath", "api-middleware"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: StateManagementReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasStore && !hasSlices) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the client-state strategy before claiming state-management readiness.",
      why: "Redux Toolkit-style readiness starts with an explicit store, slice, selector, or alternative state package surface.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasReduxToolkit && !storeSetups.some((item) => item.hasConfigureStore)) {
    riskQueue.push({
      priority: "high",
      action: "Create or expose a configureStore setup that combines reducers and middleware.",
      why: "Redux Toolkit recommends configureStore as the standard store setup with middleware, DevTools, and reducer composition defaults.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasStore && !hasProvider) {
    riskQueue.push({
      priority: "medium",
      action: "Connect the store to the UI root with a Provider or document why the store is framework-agnostic.",
      why: "Learners need to trace where global state becomes available to components.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if ((hasStore || hasSlices) && !hasTypedHooks) {
    riskQueue.push({
      priority: "low",
      action: "Add typed useAppDispatch/useAppSelector hooks or document the RootState/AppDispatch access pattern.",
      why: "Typed hooks make Redux state reads and dispatches easier to follow in TypeScript projects.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasSlices && !hasSelectors) {
    riskQueue.push({
      priority: "low",
      action: "Expose selectors near slices or a selector module for important state reads.",
      why: "Selectors explain which state shape belongs to public UI or business logic reads.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasAsyncThunk && !hasExtraReducers) {
    riskQueue.push({
      priority: "medium",
      action: "Pair async thunks with extraReducers or builder.addCase lifecycle handling.",
      why: "createAsyncThunk emits pending, fulfilled, and rejected actions, but reducer logic must record loading/error/data state.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasRtkQuery && !hasRtkQueryStoreWiring) {
    riskQueue.push({
      priority: "medium",
      action: "Wire RTK Query reducerPath and api.middleware into the store before trusting cache behavior.",
      why: "RTK Query API slices need both reducer and middleware registration for subscriptions, invalidation, polling, and cache lifecycle behavior.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasZustand && !hasZustandSelector) {
    riskQueue.push({
      priority: "low",
      action: "Document Zustand selectors, shallow equality, or subscribeWithSelector usage for important state reads.",
      why: "Zustand stores are easy to create, but learners need selector boundaries to understand re-render and subscription behavior.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasZustandPersistence && !zustandSignals.some((item) => ["persist-version", "persist-migrate", "persist-merge"].includes(item.signal) && item.readiness === "ready")) {
    riskQueue.push({
      priority: "low",
      action: "Review Zustand persist versioning, migration, and merge behavior for restored state.",
      why: "Persisted Zustand state can outlive code changes, so version/migrate/merge options explain upgrade safety.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasJotai && !hasJotaiStoreScope) {
    riskQueue.push({
      priority: "low",
      action: "Document Jotai Provider or store scope when atom state crosses app boundaries.",
      why: "Jotai can use a default store implicitly, but learners need to know whether atoms are scoped by Provider, createStore, or getDefaultStore.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasJotai && !hasJotaiSelectorOrFamily) {
    riskQueue.push({
      priority: "low",
      action: "Review Jotai selectAtom, splitAtom, focusAtom, or atomFamily usage for derived state boundaries.",
      why: "Jotai atoms can be composed freely, so utility atoms make large state graphs easier to trace and explain.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasValtio && !hasValtioReadSurface) {
    riskQueue.push({
      priority: "low",
      action: "Document Valtio snapshot or useSnapshot read boundaries for proxied state.",
      why: "Valtio writes happen through mutable proxies, but learners need snapshot boundaries to understand render-safe immutable reads.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasValtio && !hasValtioSubscription) {
    riskQueue.push({
      priority: "low",
      action: "Review Valtio subscribe, subscribeKey, or watch surfaces for non-React state reactions.",
      why: "Valtio can be used outside React, so subscription and watch APIs explain how side effects observe proxy changes.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasMobX && !hasMobXObservableSetup) {
    riskQueue.push({
      priority: "low",
      action: "Document MobX observable setup through makeAutoObservable, makeObservable, observable, or extendObservable.",
      why: "MobX state is only explainable when learners can find where fields become observable.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasMobX && !hasMobXReactionSurface) {
    riskQueue.push({
      priority: "low",
      action: "Review MobX autorun, reaction, when, observer, or Observer boundaries for tracked reads.",
      why: "MobX updates are driven by tracked derivations, so learner maps need the reaction or observer boundary.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  if (hasMobX && !hasMobXActionSurface) {
    riskQueue.push({
      priority: "low",
      action: "Review MobX action, runInAction, or flow usage for write boundaries.",
      why: "MobX strict-action projects need explicit write boundaries to make mutations and async flows understandable.",
      relatedHref: "html/state-management-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run state-management tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not instantiate stores, dispatch actions, mount providers, or run the analyzed project's tests.",
    relatedHref: "html/state-management-readiness.html"
  });

  return {
    summary: `Redux Toolkit/Zustand/Jotai/Valtio/MobX식 state management readiness report: store setup ${storeSetups.length}개, slice definition ${sliceDefinitions.length}개, selector signal ${selectorSignals.length}개, Zustand signal ${zustandSignals.length}개, Jotai signal ${jotaiSignals.length}개, Valtio signal ${valtioSignals.length}개, MobX signal ${mobxSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Redux Toolkit configureStore createSlice reducers actions selectors Provider useSelector useDispatch createAsyncThunk createListenerMiddleware createEntityAdapter middleware devTools RTK Query Zustand create createStore useStore useShallow shallow subscribeWithSelector persist createJSONStorage devtools immer redux combine setState getState getInitialState subscribe StateCreator StoreApi Mutate StoreMutatorIdentifier Jotai atom primitive atom derived atom useAtom useAtomValue useSetAtom Provider createStore getDefaultStore store.get store.set store.sub onMount debugLabel atomWithStorage atomFamily selectAtom splitAtom focusAtom loadable unwrap useHydrateAtoms useAtomCallback devtools atomEffect atomWithImmer Valtio proxy useSnapshot snapshot subscribe subscribeKey watch ref devtools proxyMap proxySet useProxy derive deepClone unstable_deepProxy sync Snapshot MobX makeAutoObservable makeObservable observable computed action runInAction flow autorun reaction when configure observer useLocalObservable Provider inject spy trace toJS",
    storeSetups,
    sliceDefinitions,
    selectorSignals,
    sideEffectSignals,
    entitySignals,
    middlewareSignals,
    rtkQuerySignals,
    zustandSignals,
    jotaiSignals,
    valtioSignals,
    mobxSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"configureStore|Provider|useSelector|useDispatch|useAppSelector|useAppDispatch\" src app packages", purpose: "Inventory store setup, UI provider boundaries, and typed hook usage." },
      { command: "rg \"createSlice|reducers:|extraReducers|createAction|createReducer\" src app packages", purpose: "Find slices, reducers, generated actions, and extra reducer lifecycle handling." },
      { command: "rg \"createAsyncThunk|createListenerMiddleware|listenerMiddleware|rejectWithValue\" src app packages", purpose: "Review async thunk and listener side-effect surfaces." },
      { command: "rg \"createEntityAdapter|selectId|sortComparer|getSelectors\" src app packages", purpose: "Check normalized entity adapter setup and selector generation." },
      { command: "rg \"createApi|fetchBaseQuery|reducerPath|tagTypes|providesTags|invalidatesTags\" src app packages", purpose: "Trace optional RTK Query API slice and cache invalidation wiring." },
      { command: "rg \"zustand|createStore|useStore|useShallow|subscribeWithSelector|persist|createJSONStorage|devtools|immer|setState|getState\" src app packages", purpose: "Trace Zustand hook stores, vanilla stores, selectors, middleware, persistence, and imperative store API usage." },
      { command: "rg \"jotai|atom\\(|useAtom|useAtomValue|useSetAtom|Provider|createStore|atomWithStorage|atomFamily|selectAtom|splitAtom|loadable|unwrap\" src app packages", purpose: "Trace Jotai atoms, Provider/store scope, utility atoms, hydration, effects, devtools, and Immer integration." },
      { command: "rg \"valtio|proxy\\(|useSnapshot|snapshot\\(|subscribe\\(|subscribeKey|watch\\(|ref\\(|proxyMap|proxySet|useProxy|devtools|deepClone\" src app packages", purpose: "Trace Valtio proxies, snapshot read boundaries, subscriptions, refs, utilities, devtools, and deep clone/proxy helpers." },
      { command: "rg \"mobx|makeAutoObservable|makeObservable|observable|computed|action|runInAction|flow|autorun|reaction|when|observer|useLocalObservable|configure\" src app packages", purpose: "Trace MobX observable setup, derivations, write boundaries, reactions, React bindings, and strictness configuration." },
      { command: "npx vitest run", purpose: "Run local tests that exercise reducers, selectors, store setup, and async state transitions." }
    ],
    learnerNextSteps: [
      "먼저 configureStore나 대체 store 생성 함수가 어디 있는지 찾고 reducer/middleware 구성을 확인하세요.",
      "createSlice 파일에서는 initialState, reducers, actions export, selectors를 함께 읽어 상태 모양과 변경 규칙을 연결하세요.",
      "createAsyncThunk나 listener middleware가 있다면 pending/fulfilled/rejected 또는 effect 흐름이 어디서 처리되는지 확인하세요.",
      "RTK Query가 있으면 createApi 파일과 store의 reducerPath/middleware 연결을 함께 확인하세요.",
      "Zustand가 있으면 create/useStore, selector, shallow/equality, middleware, persist migration 흐름을 store 파일과 소비 컴포넌트 양쪽에서 확인하세요.",
      "Jotai가 있으면 primitive/derived/read-write atom, Provider/createStore scope, storage/reset/family/select 유틸, effect/devtools/Immer 확장을 함께 확인하세요.",
      "Valtio가 있으면 proxy mutation, useSnapshot/snapshot read boundary, subscribe/watch side effect, ref/proxyMap/proxySet utility 흐름을 함께 확인하세요.",
      "MobX가 있으면 makeAutoObservable/makeObservable/observable setup, computed/action/flow, autorun/reaction/when, observer/useLocalObservable, configure strictness를 함께 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 dispatch와 UI 반응은 원본 프로젝트 테스트나 브라우저에서 별도로 확인하세요."
    ]
  };
}

type StateManagementSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function stateManagementSourceFiles(walk: WalkResult): Promise<StateManagementSourceFile[]> {
  const files: StateManagementSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !stateManagementInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!stateManagementPathSignal(file.relPath) && !stateManagementContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function stateManagementInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return stateManagementPathSignal(filePath)
    || /^(package\.json|tsconfig\.json|vite\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|ya?ml)$/i.test(filePath);
}

function stateManagementPathSignal(filePath: string): boolean {
  return /(^|\/)(store|stores|state|redux|slices?|reducers?|selectors?|hooks?|features?|entities?|services?|api)(\/|\.|-|_|$)|redux-toolkit|rtk-query|zustand|jotai|mobx|valtio/i.test(filePath);
}

function stateManagementContentSignal(text: string): boolean {
  return /\b(configureStore|createStore|createSlice|createReducer|createAction|combineSlices|Provider|useSelector|useDispatch|useAppSelector|useAppDispatch|RootState|AppDispatch|createSelector|createAsyncThunk|createListenerMiddleware|listenerMiddleware|extraReducers|builder\.addCase|rejectWithValue|createEntityAdapter|createApi|fetchBaseQuery|reducerPath|tagTypes|providesTags|invalidatesTags|serializableCheck|immutableCheck|devTools|autoBatchEnhancer|dynamicMiddleware|zustand|useStore|useShallow|shallow|subscribeWithSelector|createJSONStorage|StateCreator|StoreApi|StoreMutatorIdentifier|jotai|atomWithStorage|atomFamily|selectAtom|splitAtom|focusAtom|loadable|unwrap|useAtom|useAtomValue|useSetAtom|useHydrateAtoms|atomEffect|atomWithImmer|makeAutoObservable|makeObservable|observable|computed|runInAction|autorun|reaction|mobx-react|useLocalObservable|valtio|useSnapshot|snapshot|subscribeKey|proxyMap|proxySet|useProxy|deepClone|unstable_deepProxy)\b/i.test(text);
}

function stateManagementStoreSetups(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["storeSetups"] {
  const rows: StateManagementReadinessReport["storeSetups"] = [];
  for (const source of sourceFiles) {
    const hasConfigureStore = /\bconfigureStore\s*\(/i.test(source.text);
    const hasProvider = /\bProvider\b|<Provider\b|ApiProvider|ReduxProvider/i.test(source.text);
    const hasTypedHooks = /\b(useAppDispatch|useAppSelector|AppDispatch|RootState|TypedUseSelectorHook|\.withTypes\s*<)/i.test(source.text);
    const hasStoreSignal = hasConfigureStore || /\b(createStore|create\s*<|create\s*\(|atom\s*\(|makeAutoObservable|observable\s*\(|proxy\s*(<[^>]+>)?\s*\()/i.test(source.text);
    if (!hasStoreSignal && !hasProvider && !hasTypedHooks) continue;
    rows.push({
      filePath: source.filePath,
      storeType: stateManagementStoreType(source),
      hasConfigureStore,
      hasProvider,
      hasTypedHooks,
      readiness: hasConfigureStore && (hasProvider || hasTypedHooks) ? "ready" : hasStoreSignal || hasProvider || hasTypedHooks ? "partial" : "missing",
      evidence: `${source.filePath} contains configureStore ${hasConfigureStore ? "yes" : "no"}, provider ${hasProvider ? "yes" : "no"}, typed hooks ${hasTypedHooks ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function stateManagementStoreType(source: StateManagementSourceFile): StateManagementReadinessReport["storeSetups"][number]["storeType"] {
  if (/@reduxjs\/toolkit|\bconfigureStore\b|\bcreateSlice\b/i.test(source.text)) return "redux-toolkit";
  if (/["']redux["']|react-redux|\bcreateStore\b|\bcombineReducers\b/i.test(source.text)) return "redux";
  if (/["']zustand["']|\bcreate\s*<|\bcreateStore\s*\(/i.test(source.text)) return "zustand";
  if (/["']jotai["']|\batom\s*\(|\buseAtom\b/i.test(source.text)) return "jotai";
  if (/["']valtio["']|\bproxy\s*\(|\buseSnapshot\b/i.test(source.text)) return "valtio";
  if (/["']mobx["']|mobx-react|\bmakeAutoObservable\b|\bobservable\s*\(/i.test(source.text)) return "mobx";
  return "unknown";
}

function stateManagementSliceDefinitions(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["sliceDefinitions"] {
  const rows: StateManagementReadinessReport["sliceDefinitions"] = [];
  for (const source of sourceFiles) {
    const sliceCount = countMatches(source.text, /\bcreateSlice\s*\(/gi);
    const reducerCount = countMatches(source.text, /\breducers\s*:|\bcreateReducer\s*\(|\baddCase\s*\(|\bcaseReducers\b/gi);
    const actionCount = countMatches(source.text, /\bcreateAction\s*\(|\.actions\b|create\.reducer\b|create\.preparedReducer\b|create\.asyncThunk\b/gi);
    const selectorCount = countMatches(source.text, /\bselectors\s*:|\bcreateSelector\s*\(|\.getSelectors\s*\(|\bselect[A-Z][A-Za-z0-9_$]*\b|\bselectFromResult\b/gi);
    const usesImmerStyle = sliceCount > 0 && /\bstate\.[A-Za-z_$][\w$]*(\s*(=|\+=|-=|\+\+|--)|\.push\s*\(|\.splice\s*\(|\.sort\s*\()/i.test(source.text);
    if (sliceCount + reducerCount + actionCount + selectorCount === 0 && !usesImmerStyle) continue;
    rows.push({
      filePath: source.filePath,
      sliceCount,
      reducerCount,
      actionCount,
      selectorCount,
      usesImmerStyle,
      readiness: sliceCount > 0 && reducerCount > 0 ? "ready" : reducerCount + actionCount + selectorCount > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains slices ${sliceCount}, reducer signals ${reducerCount}, action signals ${actionCount}, selector signals ${selectorCount}, Immer-style updates ${usesImmerStyle ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 120);
}

function stateManagementSelectorSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["selectorSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["selectorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "useSelector", pattern: /\buseSelector\b/i, evidence: "React-Redux useSelector evidence was detected." },
    { signal: "useAppSelector", pattern: /\buseAppSelector\b|useSelector\.withTypes/i, evidence: "typed app selector hook evidence was detected." },
    { signal: "createSelector", pattern: /\bcreateSelector\s*\(/i, evidence: "memoized selector evidence was detected." },
    { signal: "slice-selectors", pattern: /\bselectors\s*:|\.selectors\b/i, evidence: "createSlice selector evidence was detected." },
    { signal: "RootState", pattern: /\bRootState\b|getState\s*:\s*\(\)\s*=>/i, evidence: "RootState type evidence was detected." },
    { signal: "selectFromResult", pattern: /\bselectFromResult\b/i, evidence: "RTK Query selectFromResult evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "selector", "signal");
}

function stateManagementSideEffectSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["sideEffectSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["sideEffectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "createAsyncThunk", pattern: /\bcreateAsyncThunk\s*\(/i, evidence: "createAsyncThunk evidence was detected." },
    { signal: "createListenerMiddleware", pattern: /\bcreateListenerMiddleware\s*\(/i, evidence: "listener middleware factory evidence was detected." },
    { signal: "listenerMiddleware", pattern: /\blistenerMiddleware\b|startListening\s*\(/i, evidence: "listener middleware registration evidence was detected." },
    { signal: "thunkMiddleware", pattern: /\bthunk\b|redux-thunk|extraArgument|getDefaultMiddleware\s*\(/i, evidence: "thunk middleware evidence was detected." },
    { signal: "extraReducers", pattern: /\bextraReducers\s*:/i, evidence: "extraReducers lifecycle handling evidence was detected." },
    { signal: "builder-callback", pattern: /\bbuilder\s*=>|\bbuilder\.add(Case|Matcher|DefaultCase)\b/i, evidence: "builder callback reducer evidence was detected." },
    { signal: "rejectWithValue", pattern: /\brejectWithValue\b/i, evidence: "typed rejected payload evidence was detected." },
    { signal: "abort-signal", pattern: /\bAbortSignal\b|\bsignal\b.*abort|thunkAPI\.signal/i, evidence: "async cancellation evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "side-effect", "signal");
}

function stateManagementEntitySignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["entitySignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["entitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "createEntityAdapter", pattern: /\bcreateEntityAdapter\s*\(/i, evidence: "entity adapter evidence was detected." },
    { signal: "selectId", pattern: /\bselectId\s*:/i, evidence: "custom selectId evidence was detected." },
    { signal: "sortComparer", pattern: /\bsortComparer\s*:/i, evidence: "entity sort comparer evidence was detected." },
    { signal: "getSelectors", pattern: /\bgetSelectors\s*\(/i, evidence: "adapter selector generation evidence was detected." },
    { signal: "upsertMany", pattern: /\b(upsertMany|addMany|setAll|updateMany)\b/i, evidence: "adapter collection reducer evidence was detected." },
    { signal: "normalized-state", pattern: /\b(ids|entities)\s*:|EntityState\b/i, evidence: "normalized entity state evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "entity", "signal");
}

function stateManagementMiddlewareSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["middlewareSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["middlewareSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "getDefaultMiddleware", pattern: /\bgetDefaultMiddleware\s*\(/i, evidence: "default middleware customization evidence was detected." },
    { signal: "serializableCheck", pattern: /\bserializableCheck\b/i, evidence: "serializable check configuration evidence was detected." },
    { signal: "immutableCheck", pattern: /\bimmutableCheck\b/i, evidence: "immutable check configuration evidence was detected." },
    { signal: "devTools", pattern: /\bdevTools\s*:|\bDevTools\b|redux-devtools/i, evidence: "Redux DevTools evidence was detected." },
    { signal: "autoBatchEnhancer", pattern: /\bautoBatchEnhancer\b/i, evidence: "auto batch enhancer evidence was detected." },
    { signal: "dynamicMiddleware", pattern: /\bcreateDynamicMiddleware\b|\bdynamicMiddleware\b/i, evidence: "dynamic middleware evidence was detected." },
    { signal: "logger", pattern: /\bredux-logger\b|\blogger\b/i, evidence: "logger middleware evidence was detected." },
    { signal: "redux-thunk", pattern: /\bredux-thunk\b|\bthunk\b/i, evidence: "redux-thunk evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "middleware", "signal");
}

function stateManagementRtkQuerySignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["rtkQuerySignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["rtkQuerySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "createApi", pattern: /\bcreateApi\s*\(/i, evidence: "RTK Query createApi evidence was detected." },
    { signal: "fetchBaseQuery", pattern: /\bfetchBaseQuery\s*\(/i, evidence: "fetchBaseQuery evidence was detected." },
    { signal: "reducerPath", pattern: /\breducerPath\s*:|\[.*\.reducerPath\]\s*:/i, evidence: "RTK Query reducerPath evidence was detected." },
    { signal: "api-middleware", pattern: /\.middleware\b|getDefaultMiddleware\(\)\.concat\([^)]*\.middleware/i, evidence: "RTK Query middleware evidence was detected." },
    { signal: "tagTypes", pattern: /\btagTypes\s*:/i, evidence: "RTK Query tagTypes evidence was detected." },
    { signal: "providesTags", pattern: /\bprovidesTags\s*:/i, evidence: "RTK Query providesTags evidence was detected." },
    { signal: "invalidatesTags", pattern: /\binvalidatesTags\s*:/i, evidence: "RTK Query invalidatesTags evidence was detected." },
    { signal: "generated-hooks", pattern: /\buse[A-Z][A-Za-z0-9]+(Query|Mutation|InfiniteQuery)\b/i, evidence: "generated RTK Query hook evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "rtk-query", "signal");
}

function stateManagementZustandSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["zustandSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["zustandSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create", pattern: /from\s+["']zustand["']|import\s+\{\s*create\b|create\s*<[^>]+>\s*\(\s*\)\s*\(|\bcreate\s*\(\s*(\(?(set|get|state))/i, evidence: "Zustand create hook store evidence was detected." },
    { signal: "create-store", pattern: /\bcreateStore\s*(<[^>]+>)?\s*\(/i, evidence: "Zustand createStore evidence was detected." },
    { signal: "vanilla-store", pattern: /zustand\/vanilla|vanillaStore|\bcreateStore\s*(<[^>]+>)?\s*\(/i, evidence: "Zustand vanilla store evidence was detected." },
    { signal: "use-store", pattern: /\buseStore\s*(<[^>]+>)?\s*\(/i, evidence: "Zustand useStore evidence was detected." },
    { signal: "use-bound-store", pattern: /\buse[A-Z][A-Za-z0-9_$]*Store\s*\((state|useShallow|\()/i, evidence: "bound store hook selector evidence was detected." },
    { signal: "set-function", pattern: /\(\s*set\s*(,\s*get)?\s*\)\s*=>|\bset\s*\(\s*(\{|state\s*=>|\()/i, evidence: "Zustand set function evidence was detected." },
    { signal: "get-function", pattern: /\(\s*set\s*,\s*get\s*\)\s*=>|\bget\s*\(\s*\)/i, evidence: "Zustand get function evidence was detected." },
    { signal: "set-state", pattern: /\.setState\s*\(/i, evidence: "Zustand setState evidence was detected." },
    { signal: "get-state", pattern: /\.getState\s*\(/i, evidence: "Zustand getState evidence was detected." },
    { signal: "get-initial-state", pattern: /\.getInitialState\s*\(/i, evidence: "Zustand getInitialState evidence was detected." },
    { signal: "subscribe", pattern: /\.subscribe\s*\(/i, evidence: "Zustand subscribe evidence was detected." },
    { signal: "replace-state", pattern: /set(State)?\s*\([^)]*,\s*true\)|\.setState\s*\([^)]*,\s*true/i, evidence: "replace-state evidence was detected." },
    { signal: "selector", pattern: /\((state|s)\)\s*=>\s*(state|s)\.|useStore\s*\([^,]+,\s*(\w+|\()/i, evidence: "Zustand selector evidence was detected." },
    { signal: "use-shallow", pattern: /\buseShallow\s*\(/i, evidence: "useShallow evidence was detected." },
    { signal: "shallow-equality", pattern: /\bshallow\b|zustand\/shallow|zustand\/react\/shallow/i, evidence: "shallow equality evidence was detected." },
    { signal: "create-with-equality-fn", pattern: /\bcreateWithEqualityFn\s*(<[^>]+>)?\s*\(/i, evidence: "createWithEqualityFn evidence was detected." },
    { signal: "equality-fn", pattern: /\bequalityFn\s*:|useStoreWithEqualityFn|createWithEqualityFn/i, evidence: "custom equality function evidence was detected." },
    { signal: "subscribe-with-selector", pattern: /\bsubscribeWithSelector\s*\(/i, evidence: "subscribeWithSelector middleware evidence was detected." },
    { signal: "fire-immediately", pattern: /\bfireImmediately\s*:/i, evidence: "subscribeWithSelector fireImmediately option evidence was detected." },
    { signal: "persist-middleware", pattern: /\bpersist\s*\(/i, evidence: "persist middleware evidence was detected." },
    { signal: "create-json-storage", pattern: /\bcreateJSONStorage\s*\(/i, evidence: "createJSONStorage evidence was detected." },
    { signal: "persist-partialize", pattern: /\bpartialize\s*:/i, evidence: "persist partialize option evidence was detected." },
    { signal: "persist-version", pattern: /\bversion\s*:/i, evidence: "persist version option evidence was detected." },
    { signal: "persist-migrate", pattern: /\bmigrate\s*:/i, evidence: "persist migrate option evidence was detected." },
    { signal: "persist-merge", pattern: /\bmerge\s*:/i, evidence: "persist merge option evidence was detected." },
    { signal: "on-rehydrate-storage", pattern: /\bonRehydrateStorage\s*:/i, evidence: "onRehydrateStorage evidence was detected." },
    { signal: "skip-hydration", pattern: /\bskipHydration\s*:/i, evidence: "skipHydration evidence was detected." },
    { signal: "rehydrate", pattern: /\.persist\.rehydrate\s*\(|\brehydrate\s*\(/i, evidence: "manual rehydrate evidence was detected." },
    { signal: "devtools-middleware", pattern: /\bdevtools\s*\(/i, evidence: "Zustand devtools middleware evidence was detected." },
    { signal: "devtools-action-name", pattern: /set\s*\([^)]*,\s*false\s*,\s*["'`]|anonymousActionType\s*:/i, evidence: "devtools action naming evidence was detected." },
    { signal: "devtools-store-name", pattern: /\b(name|store)\s*:\s*["'`][^"'`]+["'`]/i, evidence: "devtools store naming evidence was detected." },
    { signal: "devtools-serialize", pattern: /\bserialize\s*:/i, evidence: "devtools serialize option evidence was detected." },
    { signal: "devtools-enabled", pattern: /\benabled\s*:/i, evidence: "devtools enabled option evidence was detected." },
    { signal: "immer-middleware", pattern: /\bimmer\s*\(/i, evidence: "Zustand immer middleware evidence was detected." },
    { signal: "redux-middleware", pattern: /\bredux\s*\(/i, evidence: "Zustand redux middleware evidence was detected." },
    { signal: "combine-middleware", pattern: /\bcombine\s*\(/i, evidence: "Zustand combine middleware evidence was detected." },
    { signal: "state-creator-type", pattern: /\bStateCreator\b/i, evidence: "StateCreator type evidence was detected." },
    { signal: "store-api-type", pattern: /\bStoreApi\b/i, evidence: "StoreApi type evidence was detected." },
    { signal: "mutate-type", pattern: /\bMutate\b/i, evidence: "Mutate type evidence was detected." },
    { signal: "store-mutator-identifier", pattern: /\bStoreMutatorIdentifier\b/i, evidence: "StoreMutatorIdentifier type evidence was detected." },
    { signal: "traditional-entry", pattern: /zustand\/traditional|createWithEqualityFn|useStoreWithEqualityFn/i, evidence: "Zustand traditional entrypoint evidence was detected." },
    { signal: "react-shallow-entry", pattern: /zustand\/react\/shallow|useShallow/i, evidence: "Zustand react shallow entrypoint evidence was detected." },
    { signal: "middleware-entry", pattern: /zustand\/middleware/i, evidence: "Zustand middleware entrypoint evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "Zustand", "signal");
}

function stateManagementJotaiSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["jotaiSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["jotaiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "atom", pattern: /\batom\s*\(/i, evidence: "Jotai atom evidence was detected." },
    { signal: "primitive-atom", pattern: /\batom\s*\(\s*({|\[|["'`]|-?\d|true|false|null|undefined)/i, evidence: "primitive atom evidence was detected." },
    { signal: "derived-atom", pattern: /\batom\s*\(\s*(async\s+)?\(?\s*(get|_get)\s*\)?\s*=>/i, evidence: "derived atom evidence was detected." },
    { signal: "read-write-atom", pattern: /\batom\s*\([\s\S]{0,2000},\s*\(?\s*(get|_get)\s*,\s*(set|_set)/i, evidence: "read-write atom evidence was detected." },
    { signal: "write-only-atom", pattern: /\batom\s*\(\s*(null|undefined)[\s\S]{0,1000},\s*\(?\s*(get|_get)\s*,\s*(set|_set)/i, evidence: "write-only atom evidence was detected." },
    { signal: "async-atom", pattern: /\batom\s*\(\s*async\b|\batom\s*\(\s*\(?\s*(async\s+)?(get|_get)\s*\)?\s*=>\s*(await|Promise\.)/i, evidence: "async atom evidence was detected." },
    { signal: "use-atom", pattern: /\buseAtom\s*\(/i, evidence: "useAtom hook evidence was detected." },
    { signal: "use-atom-value", pattern: /\buseAtomValue\s*\(/i, evidence: "useAtomValue hook evidence was detected." },
    { signal: "use-set-atom", pattern: /\buseSetAtom\s*\(/i, evidence: "useSetAtom hook evidence was detected." },
    { signal: "provider", pattern: /import\s+\{[^}]*\bProvider\b[^}]*\}\s+from\s+["']jotai["']|from\s+["']jotai["'][\s\S]*<Provider\b/i, evidence: "Jotai Provider scope evidence was detected." },
    { signal: "create-store", pattern: /import\s+\{[^}]*\bcreateStore\b[^}]*\}\s+from\s+["']jotai(?:\/vanilla)?["']|\bjotai\/vanilla\b[\s\S]*\bcreateStore\s*\(/i, evidence: "Jotai createStore evidence was detected." },
    { signal: "get-default-store", pattern: /\bgetDefaultStore\s*\(/i, evidence: "getDefaultStore evidence was detected." },
    { signal: "store-get", pattern: /\bstore\.(get)\s*\(|\bgetDefaultStore\s*\(\s*\)\.get\s*\(/i, evidence: "Jotai store.get evidence was detected." },
    { signal: "store-set", pattern: /\bstore\.(set)\s*\(|\bgetDefaultStore\s*\(\s*\)\.set\s*\(/i, evidence: "Jotai store.set evidence was detected." },
    { signal: "store-sub", pattern: /\bstore\.(sub)\s*\(|\bgetDefaultStore\s*\(\s*\)\.sub\s*\(/i, evidence: "Jotai store.sub evidence was detected." },
    { signal: "on-mount", pattern: /\.onMount\s*=/i, evidence: "atom onMount lifecycle evidence was detected." },
    { signal: "debug-label", pattern: /\.debugLabel\s*=/i, evidence: "atom debugLabel evidence was detected." },
    { signal: "atom-with-storage", pattern: /\batomWithStorage\s*\(/i, evidence: "atomWithStorage evidence was detected." },
    { signal: "create-json-storage", pattern: /import\s+\{[^}]*\bcreateJSONStorage\b[^}]*\}\s+from\s+["']jotai\/utils["']|from\s+["']jotai\/utils["'][\s\S]*\bcreateJSONStorage\s*\(/i, evidence: "createJSONStorage evidence was detected." },
    { signal: "reset", pattern: /\bRESET\b/i, evidence: "RESET symbol evidence was detected." },
    { signal: "atom-with-reset", pattern: /\batomWithReset\s*\(/i, evidence: "atomWithReset evidence was detected." },
    { signal: "atom-with-default", pattern: /\batomWithDefault\s*\(/i, evidence: "atomWithDefault evidence was detected." },
    { signal: "atom-with-reducer", pattern: /\batomWithReducer\s*\(/i, evidence: "atomWithReducer evidence was detected." },
    { signal: "atom-with-refresh", pattern: /\batomWithRefresh\s*\(/i, evidence: "atomWithRefresh evidence was detected." },
    { signal: "atom-with-observable", pattern: /\batomWithObservable\s*\(/i, evidence: "atomWithObservable evidence was detected." },
    { signal: "atom-with-hash", pattern: /\batomWithHash\s*\(/i, evidence: "atomWithHash evidence was detected." },
    { signal: "atom-with-location", pattern: /\batomWithLocation\s*\(/i, evidence: "atomWithLocation evidence was detected." },
    { signal: "atom-family", pattern: /\batomFamily\s*\(/i, evidence: "atomFamily evidence was detected." },
    { signal: "select-atom", pattern: /\bselectAtom\s*\(/i, evidence: "selectAtom evidence was detected." },
    { signal: "split-atom", pattern: /\bsplitAtom\s*\(/i, evidence: "splitAtom evidence was detected." },
    { signal: "focus-atom", pattern: /\bfocusAtom\s*\(/i, evidence: "focusAtom evidence was detected." },
    { signal: "freeze-atom", pattern: /\bfreezeAtom\s*\(/i, evidence: "freezeAtom evidence was detected." },
    { signal: "loadable", pattern: /\bloadable\s*\(/i, evidence: "loadable utility evidence was detected." },
    { signal: "unwrap", pattern: /\bunwrap\s*\(/i, evidence: "unwrap utility evidence was detected." },
    { signal: "use-hydrate-atoms", pattern: /\buseHydrateAtoms\s*\(/i, evidence: "useHydrateAtoms evidence was detected." },
    { signal: "use-atom-callback", pattern: /\buseAtomCallback\s*\(/i, evidence: "useAtomCallback evidence was detected." },
    { signal: "use-atoms-debug-value", pattern: /\buseAtomsDebugValue\s*\(/i, evidence: "useAtomsDebugValue evidence was detected." },
    { signal: "use-atoms-devtools", pattern: /\buseAtomsDevtools\s*\(/i, evidence: "useAtomsDevtools evidence was detected." },
    { signal: "use-atom-devtools", pattern: /\buseAtomDevtools\s*\(/i, evidence: "useAtomDevtools evidence was detected." },
    { signal: "use-atoms-snapshot", pattern: /\buseAtomsSnapshot\s*\(/i, evidence: "useAtomsSnapshot evidence was detected." },
    { signal: "use-goto-atoms-snapshot", pattern: /\buseGotoAtomsSnapshot\s*\(/i, evidence: "useGotoAtomsSnapshot evidence was detected." },
    { signal: "use-reducer-atom", pattern: /\buseReducerAtom\s*\(/i, evidence: "useReducerAtom evidence was detected." },
    { signal: "use-reset-atom", pattern: /\buseResetAtom\s*\(/i, evidence: "useResetAtom evidence was detected." },
    { signal: "use-select-atom", pattern: /\buseSelectAtom\s*\(/i, evidence: "useSelectAtom evidence was detected." },
    { signal: "use-atom-effect", pattern: /\buseAtomEffect\s*\(/i, evidence: "useAtomEffect evidence was detected." },
    { signal: "atom-effect", pattern: /\batomEffect\s*\(/i, evidence: "atomEffect evidence was detected." },
    { signal: "with-immer", pattern: /\bwithImmer\s*\(/i, evidence: "withImmer evidence was detected." },
    { signal: "atom-with-immer", pattern: /\batomWithImmer\s*\(/i, evidence: "atomWithImmer evidence was detected." },
    { signal: "use-immer-atom", pattern: /\buseImmerAtom\s*\(/i, evidence: "useImmerAtom evidence was detected." },
    { signal: "atom-type", pattern: /\bAtom\b|import\s+\{[^}]*\btype\s+Atom\b[^}]*\}\s+from\s+["']jotai/, evidence: "Atom type evidence was detected." },
    { signal: "writable-atom-type", pattern: /\bWritableAtom\b/, evidence: "WritableAtom type evidence was detected." },
    { signal: "primitive-atom-type", pattern: /\bPrimitiveAtom\b/, evidence: "PrimitiveAtom type evidence was detected." },
    { signal: "getter-type", pattern: /\bGetter\b/, evidence: "Getter type evidence was detected." },
    { signal: "setter-type", pattern: /\bSetter\b/, evidence: "Setter type evidence was detected." },
    { signal: "extract-atom-types", pattern: /\bExtractAtom(Value|Args|Result)\b/, evidence: "ExtractAtom helper type evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "Jotai", "signal");
}

function stateManagementValtioSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["valtioSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["valtioSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "proxy", pattern: /import\s+\{[^}]*\bproxy\b[^}]*\}\s+from\s+["']valtio(?:\/vanilla)?["']|from\s+["']valtio(?:\/vanilla)?["'][\s\S]*\bproxy\s*\(/i, evidence: "Valtio proxy evidence was detected." },
    { signal: "nested-proxy", pattern: /\bproxy\s*(<[^>]+>)?\s*\(\s*\{[\s\S]{0,1200}\bproxy\s*(<[^>]+>)?\s*\(/i, evidence: "nested proxy evidence was detected." },
    { signal: "direct-mutation", pattern: /\bproxy\s*\([\s\S]{0,2000}\b(state|store|proxyState)\.[A-Za-z_$][\w$]*(\s*(=|\+=|-=|\+\+|--)|\.push\s*\(|\.splice\s*\(|\.set\s*\()/i, evidence: "direct proxy mutation evidence was detected." },
    { signal: "use-snapshot", pattern: /\buseSnapshot\s*\(/i, evidence: "useSnapshot evidence was detected." },
    { signal: "snapshot", pattern: /import\s+\{[^}]*\bsnapshot\b[^}]*\}\s+from\s+["']valtio(?:\/vanilla)?["']|from\s+["']valtio(?:\/vanilla)?["'][\s\S]*\bsnapshot\s*\(/i, evidence: "snapshot evidence was detected." },
    { signal: "sync-option", pattern: /\bsync\s*:\s*true/i, evidence: "sync option evidence was detected." },
    { signal: "subscribe", pattern: /import\s+\{[^}]*\bsubscribe\b[^}]*\}\s+from\s+["']valtio(?:\/vanilla)?["']|from\s+["']valtio(?:\/vanilla)?["'][\s\S]*\bsubscribe\s*\(/i, evidence: "subscribe evidence was detected." },
    { signal: "subscribe-ops", pattern: /\bsubscribe\s*\([^,]+,\s*\(?\s*(unstable_)?ops\b|\bunstable_ops\b/i, evidence: "subscribe operation list evidence was detected." },
    { signal: "subscribe-key", pattern: /\bsubscribeKey\s*\(/i, evidence: "subscribeKey evidence was detected." },
    { signal: "watch", pattern: /\bwatch\s*\(/i, evidence: "watch utility evidence was detected." },
    { signal: "ref", pattern: /import\s+\{[^}]*\bref\b[^}]*\}\s+from\s+["']valtio(?:\/vanilla)?["']|from\s+["']valtio(?:\/vanilla)?["'][\s\S]*\bref\s*\(/i, evidence: "ref utility evidence was detected." },
    { signal: "promise-state", pattern: /\bproxy\s*\(\s*\{[\s\S]{0,1200}(fetch\s*\(|Promise\.)/i, evidence: "promise-in-proxy evidence was detected." },
    { signal: "devtools", pattern: /import\s+\{[^}]*\bdevtools\b[^}]*\}\s+from\s+["']valtio(?:\/vanilla)?\/utils["']|\bdevtools\s*\(\s*[^,]+,\s*\{[^}]*\b(name|enabled)\b/i, evidence: "Valtio devtools evidence was detected." },
    { signal: "devtools-name", pattern: /\bdevtools\s*\([^,]+,\s*\{[^}]*\bname\s*:/i, evidence: "devtools name option evidence was detected." },
    { signal: "devtools-enabled", pattern: /\bdevtools\s*\([^,]+,\s*\{[^}]*\benabled\s*:/i, evidence: "devtools enabled option evidence was detected." },
    { signal: "proxy-map", pattern: /\bproxyMap\s*\(/i, evidence: "proxyMap evidence was detected." },
    { signal: "is-proxy-map", pattern: /\bisProxyMap\s*\(/i, evidence: "isProxyMap evidence was detected." },
    { signal: "proxy-set", pattern: /\bproxySet\s*\(/i, evidence: "proxySet evidence was detected." },
    { signal: "is-proxy-set", pattern: /\bisProxySet\s*\(/i, evidence: "isProxySet evidence was detected." },
    { signal: "use-proxy", pattern: /\buseProxy\s*\(/i, evidence: "useProxy evidence was detected." },
    { signal: "derive", pattern: /\bderive\s*\(/i, evidence: "derive utility evidence was detected." },
    { signal: "underive", pattern: /\bunderive\s*\(/i, evidence: "underive utility evidence was detected." },
    { signal: "proxy-with-history", pattern: /\bproxyWithHistory\s*\(|valtio-history/i, evidence: "proxyWithHistory evidence was detected." },
    { signal: "deep-clone", pattern: /\bdeepClone\s*\(/i, evidence: "deepClone evidence was detected." },
    { signal: "unstable-deep-proxy", pattern: /\bunstable_deepProxy\s*\(|\bdeepProxy\s*\(/i, evidence: "unstable_deepProxy evidence was detected." },
    { signal: "vanilla-entry", pattern: /from\s+["']valtio\/vanilla["']/i, evidence: "valtio/vanilla entrypoint evidence was detected." },
    { signal: "react-entry", pattern: /from\s+["']valtio(?:\/react)?["']|\buseSnapshot\s*\(/i, evidence: "Valtio React entrypoint evidence was detected." },
    { signal: "utils-entry", pattern: /from\s+["']valtio(?:\/vanilla)?\/utils["']/i, evidence: "Valtio utils entrypoint evidence was detected." },
    { signal: "macro-entry", pattern: /from\s+["']valtio\/macro["']|valtio\/macro/i, evidence: "Valtio macro entrypoint evidence was detected." },
    { signal: "snapshot-type", pattern: /\bSnapshot\s*</, evidence: "Snapshot type evidence was detected." },
    { signal: "unstable-get-internal-states", pattern: /\bunstable_getInternalStates\s*\(/i, evidence: "unstable internal states evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "Valtio", "signal");
}

function stateManagementMobxSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["mobxSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["mobxSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "make-auto-observable", pattern: /\bmakeAutoObservable\s*\(/i, evidence: "makeAutoObservable evidence was detected." },
    { signal: "make-observable", pattern: /\bmakeObservable\s*\(/i, evidence: "makeObservable evidence was detected." },
    { signal: "observable", pattern: /\bobservable\s*\(/i, evidence: "observable factory evidence was detected." },
    { signal: "observable-object", pattern: /\bobservable\.object\s*\(/i, evidence: "observable.object evidence was detected." },
    { signal: "observable-box", pattern: /\bobservable\.box\s*\(/i, evidence: "observable.box evidence was detected." },
    { signal: "observable-array", pattern: /\bobservable\.array\s*(<[^>]+>)?\s*\(/i, evidence: "observable.array evidence was detected." },
    { signal: "observable-map", pattern: /\bobservable\.map\s*(<[^>]+>)?\s*\(/i, evidence: "observable.map evidence was detected." },
    { signal: "observable-set", pattern: /\bobservable\.set\s*(<[^>]+>)?\s*\(/i, evidence: "observable.set evidence was detected." },
    { signal: "observable-ref", pattern: /\bobservable\.ref\b|ref\s*:/i, evidence: "observable.ref evidence was detected." },
    { signal: "observable-shallow", pattern: /\bobservable\.shallow\b|shallow\s*:/i, evidence: "observable.shallow evidence was detected." },
    { signal: "observable-struct", pattern: /\bobservable\.struct\b|struct\s*:/i, evidence: "observable.struct evidence was detected." },
    { signal: "extend-observable", pattern: /\bextendObservable\s*\(/i, evidence: "extendObservable evidence was detected." },
    { signal: "computed", pattern: /\bcomputed\s*\(|@computed\b|\bget\s+[A-Za-z_$][\w$]*\s*\(\s*\)\s*\{/i, evidence: "computed evidence was detected." },
    { signal: "computed-struct", pattern: /\bcomputed\.struct\b/i, evidence: "computed.struct evidence was detected." },
    { signal: "computed-requires-reaction", pattern: /\brequiresReaction\s*:|\bcomputedRequiresReaction\s*:/i, evidence: "computed requiresReaction evidence was detected." },
    { signal: "action", pattern: /\baction\s*\(|@action\b|\baction\s*:/i, evidence: "action evidence was detected." },
    { signal: "action-bound", pattern: /\baction\.bound\b|\bautoBind\s*:\s*true/i, evidence: "bound action or autoBind evidence was detected." },
    { signal: "run-in-action", pattern: /\brunInAction\s*\(/i, evidence: "runInAction evidence was detected." },
    { signal: "flow", pattern: /\bflow\s*\(|\*\s*[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{/i, evidence: "MobX flow evidence was detected." },
    { signal: "flow-result", pattern: /\bflowResult\s*\(/i, evidence: "flowResult evidence was detected." },
    { signal: "auto-bind", pattern: /\bautoBind\s*:\s*true/i, evidence: "autoBind option evidence was detected." },
    { signal: "autorun", pattern: /\bautorun\s*\(/i, evidence: "autorun evidence was detected." },
    { signal: "reaction", pattern: /\breaction\s*\(/i, evidence: "reaction evidence was detected." },
    { signal: "when", pattern: /\bwhen\s*\(/i, evidence: "when evidence was detected." },
    { signal: "configure", pattern: /\bconfigure\s*\(/i, evidence: "configure evidence was detected." },
    { signal: "enforce-actions", pattern: /\benforceActions\s*:/i, evidence: "enforceActions configuration evidence was detected." },
    { signal: "reaction-requires-observable", pattern: /\breactionRequiresObservable\s*:/i, evidence: "reactionRequiresObservable configuration evidence was detected." },
    { signal: "observable-requires-reaction", pattern: /\bobservableRequiresReaction\s*:/i, evidence: "observableRequiresReaction configuration evidence was detected." },
    { signal: "disable-error-boundaries", pattern: /\bdisableErrorBoundaries\s*:/i, evidence: "disableErrorBoundaries configuration evidence was detected." },
    { signal: "isolate-global-state", pattern: /\bisolateGlobalState\s*:/i, evidence: "isolateGlobalState configuration evidence was detected." },
    { signal: "observer", pattern: /\bobserver\s*\(/i, evidence: "observer component wrapper evidence was detected." },
    { signal: "observer-component", pattern: /<Observer\b|\bObserver\s*\(/i, evidence: "Observer component evidence was detected." },
    { signal: "use-local-observable", pattern: /\buseLocalObservable\s*\(/i, evidence: "useLocalObservable evidence was detected." },
    { signal: "use-observer", pattern: /\buseObserver\s*\(/i, evidence: "useObserver evidence was detected." },
    { signal: "provider", pattern: /from\s+["']mobx-react["'][\s\S]*<Provider\b|import\s+\{[^}]*\bProvider\b[^}]*\}\s+from\s+["']mobx-react["']/i, evidence: "MobX Provider evidence was detected." },
    { signal: "inject", pattern: /\binject\s*\(/i, evidence: "inject evidence was detected." },
    { signal: "enable-static-rendering", pattern: /\benableStaticRendering\s*\(|\buseStaticRendering\s*\(/i, evidence: "static rendering configuration evidence was detected." },
    { signal: "intercept", pattern: /\bintercept\s*\(/i, evidence: "intercept evidence was detected." },
    { signal: "intercept-reads", pattern: /\binterceptReads\s*\(/i, evidence: "interceptReads evidence was detected." },
    { signal: "observe", pattern: /\bobserve\s*\(/i, evidence: "observe evidence was detected." },
    { signal: "on-become-observed", pattern: /\bonBecomeObserved\s*\(/i, evidence: "onBecomeObserved evidence was detected." },
    { signal: "on-become-unobserved", pattern: /\bonBecomeUnobserved\s*\(/i, evidence: "onBecomeUnobserved evidence was detected." },
    { signal: "spy", pattern: /\bspy\s*\(/i, evidence: "spy evidence was detected." },
    { signal: "trace", pattern: /\btrace\s*\(/i, evidence: "trace evidence was detected." },
    { signal: "to-js", pattern: /\btoJS\s*\(/i, evidence: "toJS evidence was detected." },
    { signal: "transaction", pattern: /\btransaction\s*\(/i, evidence: "transaction evidence was detected." },
    { signal: "is-observable", pattern: /\bisObservable\s*\(/i, evidence: "isObservable evidence was detected." },
    { signal: "is-observable-prop", pattern: /\bisObservableProp\s*\(/i, evidence: "isObservableProp evidence was detected." },
    { signal: "is-action", pattern: /\bisAction\s*\(/i, evidence: "isAction evidence was detected." },
    { signal: "is-computed", pattern: /\bisComputed\s*\(/i, evidence: "isComputed evidence was detected." },
    { signal: "is-computed-prop", pattern: /\bisComputedProp\s*\(/i, evidence: "isComputedProp evidence was detected." },
    { signal: "is-observable-object", pattern: /\bisObservableObject\s*\(/i, evidence: "isObservableObject evidence was detected." },
    { signal: "is-observable-array", pattern: /\bisObservableArray\s*\(/i, evidence: "isObservableArray evidence was detected." },
    { signal: "is-observable-map", pattern: /\bisObservableMap\s*\(/i, evidence: "isObservableMap evidence was detected." },
    { signal: "is-observable-set", pattern: /\bisObservableSet\s*\(/i, evidence: "isObservableSet evidence was detected." },
    { signal: "mobx-react-lite", pattern: /from\s+["']mobx-react-lite["']|["']mobx-react-lite["']/i, evidence: "mobx-react-lite package/import evidence was detected." },
    { signal: "mobx-react", pattern: /from\s+["']mobx-react["']|["']mobx-react["']/i, evidence: "mobx-react package/import evidence was detected." },
    { signal: "eslint-plugin-mobx", pattern: /eslint-plugin-mobx/i, evidence: "eslint-plugin-mobx evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "MobX", "signal");
}

function stateManagementPackageSignals(sourceFiles: StateManagementSourceFile[]): StateManagementReadinessReport["packageSignals"] {
  const specs: Array<{ signal: StateManagementReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "redux-toolkit", pattern: /@reduxjs\/toolkit|\bconfigureStore\b|\bcreateSlice\b/i, evidence: "Redux Toolkit package/import evidence was detected." },
    { signal: "react-redux", pattern: /["']react-redux["']|from\s+["']react-redux["']|\buseSelector\b|\bProvider\b/i, evidence: "React-Redux package/import evidence was detected." },
    { signal: "redux", pattern: /["']redux["']|\bcreateStore\b|\bcombineReducers\b/i, evidence: "Redux core package/import evidence was detected." },
    { signal: "zustand", pattern: /["']zustand["']|\bzustand\b/i, evidence: "Zustand package/import evidence was detected." },
    { signal: "jotai", pattern: /["']jotai["']|\batom\s*\(|\buseAtom\b/i, evidence: "Jotai package/import evidence was detected." },
    { signal: "mobx", pattern: /["']mobx["']|mobx-react|\bmakeAutoObservable\b|\bobservable\s*\(/i, evidence: "MobX package/import evidence was detected." },
    { signal: "valtio", pattern: /["']valtio["']|\bproxy\s*\(/i, evidence: "Valtio package/import evidence was detected." }
  ];
  return stateManagementSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function stateManagementSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: StateManagementSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/state-management-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
