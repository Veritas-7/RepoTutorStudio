import path from "node:path";
import type { AsyncListReadinessReport, ImageCropperReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildAsyncListReadinessReport(walk: WalkResult): Promise<AsyncListReadinessReport> {
  const sourceFiles = await asyncListReadinessSourceFiles(walk);
  const asyncListSetups = asyncListReadinessSetups(sourceFiles);
  const frameworkSignals = asyncListReadinessFrameworkSignals(sourceFiles);
  const stateSignals = asyncListReadinessStateSignals(sourceFiles);
  const loadSignals = asyncListReadinessLoadSignals(sourceFiles);
  const paginationSignals = asyncListReadinessPaginationSignals(sourceFiles);
  const filterSignals = asyncListReadinessFilterSignals(sourceFiles);
  const sortSignals = asyncListReadinessSortSignals(sourceFiles);
  const cancellationSignals = asyncListReadinessCancellationSignals(sourceFiles);
  const callbackSignals = asyncListReadinessCallbackSignals(sourceFiles);
  const machineSignals = asyncListReadinessMachineSignals(sourceFiles);
  const contextSignals = asyncListReadinessContextSignals(sourceFiles);
  const actionSignals = asyncListReadinessActionSignals(sourceFiles);
  const guardSignals = asyncListReadinessGuardSignals(sourceFiles);
  const asyncSignals = asyncListReadinessAsyncSignals(sourceFiles);
  const apiSignals = asyncListReadinessApiSignals(sourceFiles);
  const testSignals = asyncListReadinessTestSignals(sourceFiles);
  const packageSignals = asyncListReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasLoad = loadSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.loadCount > 0);
  const hasPagination = paginationSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.cursorCount > 0);
  const hasFilter = filterSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.filterCount > 0);
  const hasSort = sortSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.sortCount > 0);
  const hasCancellation = cancellationSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.abortCount > 0 && item.sequenceCount > 0);
  const hasCallbacks = callbackSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.callbackCount > 0);
  const hasApi = apiSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.apiCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || asyncListSetups.some((item) => item.testCount > 0);

  const riskQueue: AsyncListReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasLoad) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document an async list boundary with a load function, items, loading state, and error state.",
      why: "Async list readiness starts with a traceable loader and state machine or hook boundary that owns network state.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  if ((hasFramework || hasLoad) && !hasPagination) {
    riskQueue.push({
      priority: "medium",
      action: "Trace cursor, has-more, append, and clear-cursor behavior for load-more flows.",
      why: "Async lists frequently fail at pagination boundaries where old data, cursors, and appended results mix.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  if ((hasFramework || hasLoad) && !hasFilter) {
    riskQueue.push({
      priority: "medium",
      action: "Trace filter text, initial filter text, set/clear filter, and filter-triggered reload behavior.",
      why: "Filtering changes the query identity and should reset stale cursors before fetching new items.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  if ((hasFramework || hasLoad) && !hasSort) {
    riskQueue.push({
      priority: "medium",
      action: "Trace sort descriptor, initial sort descriptor, sort function, sort event, and sorting state.",
      why: "Sorting can either run client-side or trigger a reload; learners need to see which path owns item ordering.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  if ((hasFramework || hasLoad) && !hasCancellation) {
    riskQueue.push({
      priority: "high",
      action: "Trace AbortController, abort events, cancel fetch/sort, stale sequence checks, and AbortSignal forwarding.",
      why: "Async list correctness depends on aborting obsolete requests and ignoring stale promise resolution.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  if ((hasFramework || hasLoad) && !hasCallbacks) {
    riskQueue.push({
      priority: "low",
      action: "Trace success and error callbacks or equivalent telemetry hooks.",
      why: "onSuccess/onError boundaries are where consumers observe loaded data and failed requests.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  if ((hasFramework || hasLoad) && !hasApi) {
    riskQueue.push({
      priority: "medium",
      action: "Expose readable API state and actions for items, cursor, loading, sorting, empty, has-more, error, abort, reload, load-more, sort, and filters.",
      why: "Async list consumers need a stable API to render state and wire user actions without reaching into internals.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  if ((hasFramework || hasLoad) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add load, filter, sort, abort, pagination, and artifact tests for async list traces.",
      why: "Static async list evidence does not prove request cancellation, stale result guards, cursor appends, or UI state transitions.",
      relatedHref: "html/async-list-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real loading, filtering, sorting, aborting, stale request handling, pagination, callbacks, and tests outside RepoTutor.",
    why: "RepoTutor records async list readiness only; it does not fetch remote data, start network clients, abort live requests, resolve promises, mutate item arrays, or run analyzed project tests.",
    relatedHref: "html/async-list-readiness.html"
  });

  return {
    summary: `Async list readiness report: setup ${asyncListSetups.length} files, load signal ${loadSignals.length}, cancellation signal ${cancellationSignals.length}, machine signal ${machineSignals.length}, async signal ${asyncSignals.length}, API signal ${apiSignals.length}, test signal ${testSignals.length} were summarized from static analysis.`,
    sourcePattern: "Async list readiness Zag async-list load cursor filter sort abort stale sequence callbacks tests",
    asyncListSetups,
    frameworkSignals,
    stateSignals,
    loadSignals,
    paginationSignals,
    filterSignals,
    sortSignals,
    cancellationSignals,
    callbackSignals,
    machineSignals,
    contextSignals,
    actionSignals,
    guardSignals,
    asyncSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/async-list|asyncList\\.machine|asyncList\\.connect|loadMore|setFilterText|clearFilter\" package.json src app packages", purpose: "Find Zag async-list machine usage and consumer API calls." },
      { command: "rg \"load\\s*:|initialItems|autoReload|dependencies|cursor|hasMore|append|clearCursor|LOAD_MORE|RELOAD\" src app packages test tests", purpose: "Trace load, reload, dependency, cursor, and load-more behavior." },
      { command: "rg \"filterText|initialFilterText|setFilterText|clearFilter|sortDescriptor|initialSortDescriptor|sort\\s*:|SORT|FILTER\" src app packages test tests", purpose: "Check filter and sort ownership before trusting item ordering." },
      { command: "rg \"AbortController|AbortSignal|signal|ABORT|cancelFetch|cancelSort|seq|stale|onSuccess|onError|async-list-traces|upload-artifact\" src app packages test tests .github", purpose: "Check cancellation, stale promise guards, callbacks, and archived test traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag async-list, TanStack Query-style list state, or custom async list hooks.",
      "Trace load, initial items, auto reload, dependencies, reload, load-more, success, and error handling first.",
      "Then inspect cursor, has-more, append, clear cursor, filter text, sort descriptor, and sorting state so query identity is clear.",
      "Check AbortController, signal forwarding, abort events, cancel fetch/sort, stale sequence guards, success/error callbacks, public API state, and tests.",
      "This report is static readiness. Real fetches, promise resolution, abort behavior, item mutation, pagination, and project tests need trusted QA."
    ]
  };
}

type AsyncListReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function asyncListReadinessSourceFiles(walk: WalkResult): Promise<AsyncListReadinessSourceFile[]> {
  const files: AsyncListReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !asyncListReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!asyncListReadinessPathSignal(file.relPath) && !asyncListReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function asyncListReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return asyncListReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function asyncListReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(async-list|async|list|data-list|issues?|tickets?|infinite|pagination|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function asyncListReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/async-list|asyncList\.machine|asyncList\.connect|loadMore|setFilterText|clearFilter|sortDescriptor|AbortController|hasMore|filterText)/i.test(text);
}

function asyncListReadinessSetups(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["asyncListSetups"] {
  const rows: AsyncListReadinessReport["asyncListSetups"] = [];
  for (const source of sourceFiles) {
    const loadCount = countMatches(source.text, /(load\s*:|load:\s*|load\(|performFetch|loadIfNeeded|reload\(|RELOAD|LOAD_MORE|load-test)/gi);
    const itemCount = countMatches(source.text, /(items|initialItems|setItems|currentItems|sortedItems)/gi);
    const cursorCount = countMatches(source.text, /(cursor|hasMore|has-more|setCursor|clearCursor|clear-cursor|append)/gi);
    const filterCount = countMatches(source.text, /(filterText|filter-text|initialFilterText|initial-filter-text|setFilterText|set-filter-text|clearFilter|clear-filter|FILTER|filter-test)/gi);
    const sortCount = countMatches(source.text, /(sortDescriptor|sort-descriptor|initialSortDescriptor|initial-sort-descriptor|sort\s*:|sort\(|SORT|sorting|sorting-state|sort-test)/gi);
    const stateCount = countMatches(source.text, /\b(idle|loading|sorting|error|empty|hasMore|has-more)\b/gi);
    const eventCount = countMatches(source.text, /(RELOAD|LOAD_MORE|SORT|FILTER|SUCCESS|ERROR|ABORT)/g);
    const abortCount = countMatches(source.text, /(AbortController|AbortSignal|signal|ABORT|abort\(|cancelFetch|cancelSort|abort-test)/gi);
    const sequenceCount = countMatches(source.text, /(\bseq\b|seqRef|stale|sequence)/gi);
    const callbackCount = countMatches(source.text, /(onSuccess|on-success|onError|on-error|invokeOnSuccess|invoke-on-success|invokeOnError|invoke-on-error)/gi);
    const apiCount = countMatches(source.text, /(items|cursor|loading|sorting|empty|hasMore|has-more|error|abort\(|reload\(|loadMore|load-more|sort\(|setFilterText|set-filter-text|clearFilter|clear-filter)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|user\.keyboard|load-test|filter-test|sort-test|abort-test|pagination-test|async-list-traces|upload-artifact)/gi);
    const total = loadCount + itemCount + cursorCount + filterCount + sortCount + stateCount + eventCount + abortCount + sequenceCount + callbackCount + apiCount + testCount;
    if (total === 0) continue;
    const readiness = loadCount > 0 && itemCount > 0 && cursorCount > 0 && filterCount > 0 && sortCount > 0 && stateCount > 0 && abortCount > 0 && sequenceCount > 0 && apiCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: asyncListReadinessFramework(source),
      loadCount,
      itemCount,
      cursorCount,
      filterCount,
      sortCount,
      stateCount,
      eventCount,
      abortCount,
      sequenceCount,
      callbackCount,
      apiCount,
      testCount,
      readiness,
      evidence: `load ${loadCount}, item ${itemCount}, cursor ${cursorCount}, filter ${filterCount}, sort ${sortCount}, state ${stateCount}, event ${eventCount}, abort ${abortCount}, sequence ${sequenceCount}, callback ${callbackCount}, API ${apiCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.loadCount + b.abortCount + b.sequenceCount + b.apiCount - (a.loadCount + a.abortCount + a.sequenceCount + a.apiCount));
}

function asyncListReadinessFramework(source: AsyncListReadinessSourceFile): AsyncListReadinessReport["asyncListSetups"][number]["framework"] {
  if (/@zag-js\/async-list|asyncList\.machine|asyncList\.connect/i.test(source.text)) return "zag-async-list";
  if (/tanstack\/react-query|useQuery|useInfiniteQuery|queryClient/i.test(source.text)) return "tanstack-query";
  if (/async list|loadMore|AbortController|filterText|sortDescriptor|hasMore/i.test(source.text)) return "custom";
  return "unknown";
}

function asyncListReadinessFrameworkSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-async-list", pattern: /@zag-js\/async-list|asyncList\.machine|asyncList\.connect/i, evidence: "Zag async-list evidence was detected." },
    { signal: "tanstack-query", pattern: /tanstack\/react-query|useQuery|useInfiniteQuery|queryClient/i, evidence: "TanStack Query-style list evidence was detected." },
    { signal: "custom", pattern: /async list|loadMore|AbortController|filterText|sortDescriptor|hasMore/i, evidence: "custom async list evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function asyncListReadinessStateSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["stateSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "loading", pattern: /\bloading\b|performFetch/i, evidence: "loading state evidence was detected." },
    { signal: "sorting", pattern: /\bsorting\b|performSort/i, evidence: "sorting state evidence was detected." },
    { signal: "error", pattern: /\berror\b|setError|onError/i, evidence: "error state evidence was detected." },
    { signal: "empty", pattern: /\bempty\b|items\.length === 0/i, evidence: "empty state evidence was detected." },
    { signal: "has-more", pattern: /hasMore|has-more|cursor != null/i, evidence: "has-more state evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function asyncListReadinessLoadSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["loadSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["loadSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "load", pattern: /load\s*:|load:\s*|performFetch|loadIfNeeded/i, evidence: "load function evidence was detected." },
    { signal: "initial-items", pattern: /initialItems|initial-items/i, evidence: "initial items evidence was detected." },
    { signal: "auto-reload", pattern: /autoReload|auto-reload|loadIfNeeded/i, evidence: "auto reload evidence was detected." },
    { signal: "dependencies", pattern: /dependencies|hashDeps/i, evidence: "dependency tracking evidence was detected." },
    { signal: "reload", pattern: /RELOAD|reload\(/i, evidence: "reload evidence was detected." },
    { signal: "load-more", pattern: /LOAD_MORE|loadMore|load-more/i, evidence: "load more evidence was detected." },
    { signal: "success", pattern: /SUCCESS|onSuccess|invokeOnSuccess/i, evidence: "success evidence was detected." },
    { signal: "error", pattern: /ERROR|onError|invokeOnError|setError/i, evidence: "error evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "load", "signal");
}

function asyncListReadinessPaginationSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["paginationSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["paginationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cursor", pattern: /\bcursor\b|setCursor/i, evidence: "cursor evidence was detected." },
    { signal: "has-more", pattern: /hasMore|has-more|cursor != null/i, evidence: "has-more evidence was detected." },
    { signal: "append", pattern: /\bappend\b|\[\.\.\.prev|\[\.\.\.value/i, evidence: "append evidence was detected." },
    { signal: "clear-cursor", pattern: /clearCursor|clear-cursor|setCursor\(undefined\)|setCursor\(null\)/i, evidence: "clear cursor evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "pagination", "signal");
}

function asyncListReadinessFilterSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["filterSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["filterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "filter-text", pattern: /filterText|filter-text/i, evidence: "filter text evidence was detected." },
    { signal: "initial-filter-text", pattern: /initialFilterText|initial-filter-text/i, evidence: "initial filter text evidence was detected." },
    { signal: "set-filter-text", pattern: /setFilterText|set-filter-text/i, evidence: "set filter text evidence was detected." },
    { signal: "clear-filter", pattern: /clearFilter|clear-filter/i, evidence: "clear filter evidence was detected." },
    { signal: "filter-event", pattern: /\bFILTER\b|filter-event/i, evidence: "filter event evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "filter", "signal");
}

function asyncListReadinessSortSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["sortSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["sortSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sort-descriptor", pattern: /sortDescriptor|sort-descriptor/i, evidence: "sort descriptor evidence was detected." },
    { signal: "initial-sort-descriptor", pattern: /initialSortDescriptor|initial-sort-descriptor/i, evidence: "initial sort descriptor evidence was detected." },
    { signal: "sort-function", pattern: /sort\s*:|sort:\s*|performSort|sort-function/i, evidence: "sort function evidence was detected." },
    { signal: "sort-event", pattern: /\bSORT\b|sort-event/i, evidence: "sort event evidence was detected." },
    { signal: "sorting-state", pattern: /\bsorting\b|sorting-state/i, evidence: "sorting state evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "sort", "signal");
}

function asyncListReadinessCancellationSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["cancellationSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["cancellationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "abort-controller", pattern: /AbortController/i, evidence: "AbortController evidence was detected." },
    { signal: "abort-event", pattern: /\bABORT\b|abort-event|abort\(/i, evidence: "abort event evidence was detected." },
    { signal: "cancel-fetch", pattern: /cancelFetch|cancel-fetch/i, evidence: "cancel fetch evidence was detected." },
    { signal: "cancel-sort", pattern: /cancelSort|cancel-sort/i, evidence: "cancel sort evidence was detected." },
    { signal: "stale-sequence", pattern: /\bseq\b|seqRef|stale|stale-sequence/i, evidence: "stale sequence evidence was detected." },
    { signal: "signal", pattern: /AbortSignal|\bsignal\b/i, evidence: "AbortSignal forwarding evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "cancellation", "signal");
}

function asyncListReadinessCallbackSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["callbackSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["callbackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "on-success", pattern: /onSuccess|on-success/i, evidence: "onSuccess evidence was detected." },
    { signal: "on-error", pattern: /onError|on-error/i, evidence: "onError evidence was detected." },
    { signal: "invoke-on-success", pattern: /invokeOnSuccess|invoke-on-success/i, evidence: "invokeOnSuccess evidence was detected." },
    { signal: "invoke-on-error", pattern: /invokeOnError|invoke-on-error/i, evidence: "invokeOnError evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "callback", "signal");
}

function asyncListReadinessMachineSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["machineSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<AsyncListSchema|createMachine\s+AsyncListSchema/i, evidence: "Zag async-list createMachine evidence was detected." },
    { signal: "required-load-prop", pattern: /ensureProps[\s\S]{0,120}load|load is required|required-load-prop/i, evidence: "required load prop evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,80}idle|states[\s\S]{0,120}idle|initialState idle/i, evidence: "idle state evidence was detected." },
    { signal: "loading-state", pattern: /states[\s\S]{0,200}loading|states idle loading|performFetch/i, evidence: "loading state evidence was detected." },
    { signal: "sorting-state", pattern: /states[\s\S]{0,260}sorting|states idle loading sorting|performSort/i, evidence: "sorting state evidence was detected." },
    { signal: "reload-event", pattern: /\bRELOAD\b/i, evidence: "RELOAD event evidence was detected." },
    { signal: "load-more-event", pattern: /LOAD_MORE|load-more-event/i, evidence: "LOAD_MORE event evidence was detected." },
    { signal: "sort-event", pattern: /\bSORT\b|sort-event/i, evidence: "SORT event evidence was detected." },
    { signal: "filter-event", pattern: /\bFILTER\b|filter-event/i, evidence: "FILTER event evidence was detected." },
    { signal: "success-event", pattern: /\bSUCCESS\b|success-event/i, evidence: "SUCCESS event evidence was detected." },
    { signal: "error-event", pattern: /\bERROR\b|error-event/i, evidence: "ERROR event evidence was detected." },
    { signal: "abort-event", pattern: /\bABORT\b|abort-event/i, evidence: "ABORT event evidence was detected." },
    { signal: "load-if-needed-entry", pattern: /entry[\s\S]{0,120}loadIfNeeded|entry loadIfNeeded|loadIfNeeded/i, evidence: "loadIfNeeded entry evidence was detected." },
    { signal: "perform-fetch-entry", pattern: /entry[\s\S]{0,120}performFetch|performFetch/i, evidence: "performFetch entry evidence was detected." },
    { signal: "cancel-fetch-exit", pattern: /exit[\s\S]{0,120}cancelFetch|cancelFetch/i, evidence: "cancelFetch exit evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function asyncListReadinessContextSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["contextSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "items-context", pattern: /items:\s*bindable|items bindable|initialItems/i, evidence: "items context evidence was detected." },
    { signal: "cursor-context", pattern: /cursor:\s*bindable|cursor bindable|defaultValue:\s*null/i, evidence: "cursor context evidence was detected." },
    { signal: "filter-text-context", pattern: /filterText:\s*bindable|filterText bindable|initialFilterText/i, evidence: "filter text context evidence was detected." },
    { signal: "sort-descriptor-context", pattern: /sortDescriptor:\s*bindable|sortDescriptor bindable|initialSortDescriptor/i, evidence: "sort descriptor context evidence was detected." },
    { signal: "error-context", pattern: /error:\s*bindable|error bindable|defaultValue:\s*undefined/i, evidence: "error context evidence was detected." },
    { signal: "abort-ref", pattern: /abort:\s*null|abort ref|AbortController/i, evidence: "abort ref evidence was detected." },
    { signal: "sequence-ref", pattern: /\bseq:\s*0\b|seq ref|\bseq\b/i, evidence: "sequence ref evidence was detected." },
    { signal: "dependency-watch", pattern: /watch[\s\S]{0,160}hashDeps|dependencies[\s\S]{0,120}hashDeps|dependency watch/i, evidence: "dependency watch evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function asyncListReadinessActionSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["actionSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "load-if-needed", pattern: /loadIfNeeded/i, evidence: "loadIfNeeded action evidence was detected." },
    { signal: "perform-fetch", pattern: /performFetch/i, evidence: "performFetch action evidence was detected." },
    { signal: "perform-sort", pattern: /performSort/i, evidence: "performSort action evidence was detected." },
    { signal: "set-sort-descriptor", pattern: /setSortDescriptor/i, evidence: "setSortDescriptor action evidence was detected." },
    { signal: "set-filter-text", pattern: /setFilterText/i, evidence: "setFilterText action evidence was detected." },
    { signal: "invoke-on-success", pattern: /invokeOnSuccess/i, evidence: "invokeOnSuccess action evidence was detected." },
    { signal: "invoke-on-error", pattern: /invokeOnError/i, evidence: "invokeOnError action evidence was detected." },
    { signal: "clear-items", pattern: /clearItems/i, evidence: "clearItems action evidence was detected." },
    { signal: "set-items", pattern: /setItems/i, evidence: "setItems action evidence was detected." },
    { signal: "set-cursor", pattern: /setCursor/i, evidence: "setCursor action evidence was detected." },
    { signal: "set-error", pattern: /setError/i, evidence: "setError action evidence was detected." },
    { signal: "clear-error", pattern: /clearError/i, evidence: "clearError action evidence was detected." },
    { signal: "clear-cursor", pattern: /clearCursor/i, evidence: "clearCursor action evidence was detected." },
    { signal: "cancel-fetch", pattern: /cancelFetch/i, evidence: "cancelFetch action evidence was detected." },
    { signal: "cancel-sort", pattern: /cancelSort/i, evidence: "cancelSort action evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function asyncListReadinessGuardSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["guardSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "has-cursor", pattern: /hasCursor|has-cursor|cursor\)\s*!=\s*null/i, evidence: "hasCursor guard evidence was detected." },
    { signal: "has-sort-fn", pattern: /hasSortFn|has-sort-fn|prop\(["']sort["']\)/i, evidence: "hasSortFn guard evidence was detected." },
    { signal: "stale-sequence", pattern: /seq !== refs\.get\(["']seq["']\)|seq stale|stale/i, evidence: "stale sequence guard evidence was detected." },
    { signal: "abort-error", pattern: /isAbortError|AbortError|abort error/i, evidence: "abort error guard evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function asyncListReadinessAsyncSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["asyncSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["asyncSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "abort-controller", pattern: /AbortController/i, evidence: "AbortController async evidence was detected." },
    { signal: "load-signal", pattern: /\bsignal:\s*abort\?\.signal\b|load signal|\bsignal\b|AbortSignal/i, evidence: "load signal forwarding evidence was detected." },
    { signal: "cursor-forwarding", pattern: /cursor:\s*isLoadMore|cursor forwarding|\bcursor\b/i, evidence: "cursor forwarding evidence was detected." },
    { signal: "filter-forwarding", pattern: /filterText:\s*event\.filterText|filter forwarding|filterText/i, evidence: "filter forwarding evidence was detected." },
    { signal: "sort-forwarding", pattern: /sortDescriptor:\s*event\.sortDescriptor|sort forwarding|sortDescriptor/i, evidence: "sort descriptor forwarding evidence was detected." },
    { signal: "sequence-increment", pattern: /refs\.get\(["']seq["']\)\s*\+\s*1|sequence increment/i, evidence: "sequence increment evidence was detected." },
    { signal: "stale-success-guard", pattern: /seq !== refs\.get\(["']seq["']\)[\s\S]{0,120}SUCCESS|stale success guard/i, evidence: "stale success guard evidence was detected." },
    { signal: "stale-error-guard", pattern: /seq !== refs\.get\(["']seq["']\)[\s\S]{0,160}ERROR|stale error guard/i, evidence: "stale error guard evidence was detected." },
    { signal: "append-results", pattern: /event\.append|\[\.\.\.prev,\s*\.\.\.event\.items\]|append results/i, evidence: "append result evidence was detected." },
    { signal: "sort-promise", pattern: /Promise\.resolve[\s\S]{0,140}sortFn|Promise resolve|sort promise/i, evidence: "sort promise evidence was detected." },
    { signal: "abort-error-skip", pattern: /isAbortError\(error\)|abort error skip/i, evidence: "abort error skip evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "async", "signal");
}

function asyncListReadinessApiSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["apiSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "items", pattern: /\bitems\b/i, evidence: "items API evidence was detected." },
    { signal: "cursor", pattern: /\bcursor\b/i, evidence: "cursor API evidence was detected." },
    { signal: "loading", pattern: /\bloading\b/i, evidence: "loading API evidence was detected." },
    { signal: "sorting", pattern: /\bsorting\b/i, evidence: "sorting API evidence was detected." },
    { signal: "empty", pattern: /\bempty\b/i, evidence: "empty API evidence was detected." },
    { signal: "has-more", pattern: /hasMore|has-more/i, evidence: "has-more API evidence was detected." },
    { signal: "error", pattern: /\berror\b/i, evidence: "error API evidence was detected." },
    { signal: "abort", pattern: /abort\(/i, evidence: "abort API evidence was detected." },
    { signal: "reload", pattern: /reload\(/i, evidence: "reload API evidence was detected." },
    { signal: "load-more", pattern: /loadMore|load-more/i, evidence: "load-more API evidence was detected." },
    { signal: "sort", pattern: /sort\(/i, evidence: "sort API evidence was detected." },
    { signal: "set-filter-text", pattern: /setFilterText|set-filter-text/i, evidence: "set filter text API evidence was detected." },
    { signal: "clear-filter", pattern: /clearFilter|clear-filter/i, evidence: "clear filter API evidence was detected." },
    { signal: "sort-descriptor", pattern: /sortDescriptor|sort-descriptor/i, evidence: "sort descriptor API evidence was detected." },
    { signal: "filter-text", pattern: /filterText|filter-text/i, evidence: "filter text API evidence was detected." },
    { signal: "abort-event-api", pattern: /send[\s\S]{0,80}ABORT/i, evidence: "abort event API evidence was detected." },
    { signal: "reload-event-api", pattern: /send[\s\S]{0,80}RELOAD/i, evidence: "reload event API evidence was detected." },
    { signal: "load-more-event-api", pattern: /send[\s\S]{0,80}LOAD_MORE/i, evidence: "load more event API evidence was detected." },
    { signal: "sort-event-api", pattern: /send[\s\S]{0,80}SORT/i, evidence: "sort event API evidence was detected." },
    { signal: "filter-event-api", pattern: /send[\s\S]{0,80}FILTER/i, evidence: "filter event API evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function asyncListReadinessTestSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["testSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "load-test", pattern: /load-test|reload\(|loadMore|load more/i, evidence: "load test evidence was detected." },
    { signal: "filter-test", pattern: /filter-test|setFilterText|filterText/i, evidence: "filter test evidence was detected." },
    { signal: "sort-test", pattern: /sort-test|sort\(|sortDescriptor/i, evidence: "sort test evidence was detected." },
    { signal: "abort-test", pattern: /abort-test|AbortController|abort\(/i, evidence: "abort test evidence was detected." },
    { signal: "pagination-test", pattern: /pagination-test|loadMore|hasMore|cursor/i, evidence: "pagination test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|async-list-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function asyncListReadinessPackageSignals(sourceFiles: AsyncListReadinessSourceFile[]): AsyncListReadinessReport["packageSignals"] {
  const specs: Array<{ signal: AsyncListReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/async-list", pattern: /@zag-js\/async-list/i, evidence: "@zag-js/async-list dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return asyncListReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function asyncListReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: AsyncListReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/async-list-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildImageCropperReadinessReport(walk: WalkResult): Promise<ImageCropperReadinessReport> {
  const sourceFiles = await imageCropperReadinessSourceFiles(walk);
  const imageCropperSetups = imageCropperReadinessSetups(sourceFiles);
  const frameworkSignals = imageCropperReadinessFrameworkSignals(sourceFiles);
  const structureSignals = imageCropperReadinessStructureSignals(sourceFiles);
  const stateSignals = imageCropperReadinessStateSignals(sourceFiles);
  const cropSignals = imageCropperReadinessCropSignals(sourceFiles);
  const transformSignals = imageCropperReadinessTransformSignals(sourceFiles);
  const interactionSignals = imageCropperReadinessInteractionSignals(sourceFiles);
  const keyboardSignals = imageCropperReadinessKeyboardSignals(sourceFiles);
  const outputSignals = imageCropperReadinessOutputSignals(sourceFiles);
  const accessibilitySignals = imageCropperReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = imageCropperReadinessMachineSignals(sourceFiles);
  const contextSignals = imageCropperReadinessContextSignals(sourceFiles);
  const computedSignals = imageCropperReadinessComputedSignals(sourceFiles);
  const effectSignals = imageCropperReadinessEffectSignals(sourceFiles);
  const actionSignals = imageCropperReadinessActionSignals(sourceFiles);
  const guardSignals = imageCropperReadinessGuardSignals(sourceFiles);
  const domSignals = imageCropperReadinessDomSignals(sourceFiles);
  const apiSignals = imageCropperReadinessApiSignals(sourceFiles);
  const testSignals = imageCropperReadinessTestSignals(sourceFiles);
  const packageSignals = imageCropperReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.viewportCount > 0 && item.selectionCount > 0);
  const hasCrop = cropSignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.cropCount > 0);
  const hasTransform = transformSignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.transformCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.resizeCount > 0 || item.panCount > 0 || item.zoomCount > 0);
  const hasKeyboard = keyboardSignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.keyboardCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.outputCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || imageCropperSetups.some((item) => item.testCount > 0);

  const riskQueue: ImageCropperReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document an image cropper boundary with viewport, image, selection, handles, and grid parts.",
      why: "Image cropper readiness starts with a traceable crop surface before zoom, pan, resize, and output behavior can be reviewed.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasCrop) {
    riskQueue.push({
      priority: "high",
      action: "Trace crop rectangle, default crop, size limits, aspect ratio, shape, crop-change callback, and source-rect mapping.",
      why: "Crop correctness depends on mapping viewport coordinates back to the natural image without losing bounds or aspect-ratio constraints.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasTransform) {
    riskQueue.push({
      priority: "medium",
      action: "Trace zoom, zoom step, min/max zoom, rotation, flip, and offset ownership.",
      why: "Cropping output must account for transform state, not just the visible crop box.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Trace pointer drag, resize handles, panning, wheel zoom, pinch zoom, viewport resize, and reset behavior.",
      why: "Image cropper regressions usually appear in mixed pointer, touch, wheel, and resize paths.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasKeyboard) {
    riskQueue.push({
      priority: "medium",
      action: "Trace arrow-key movement, Alt resize, Shift/Ctrl step modifiers, and plus/minus zoom behavior.",
      why: "Keyboard crop adjustment is part of the accessibility contract, especially for 2d slider-style selections.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasOutput) {
    riskQueue.push({
      priority: "high",
      action: "Trace getCropData, canvas drawing, Blob/data URL output, MIME type, and quality settings.",
      why: "Visual cropper state is not enough; exported crop data and image output must preserve zoom, rotation, flip, and source rect.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Trace group/slider roles, roledescription, labels, descriptions, live/busy state, value text, and data dragging/panning state.",
      why: "Image croppers need accessible instructions and state text because the selection behaves like a 2d slider.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, wheel, keyboard, pinch, output, ARIA, and artifact tests for image cropper traces.",
      why: "Static image cropper evidence does not prove pointer math, touch gestures, canvas export, or accessibility state at runtime.",
      relatedHref: "html/image-cropper-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real crop dragging, resizing, panning, zooming, pinching, canvas export, and tests outside RepoTutor.",
    why: "RepoTutor records image cropper readiness only; it does not load real image pixels, draw to canvas, create blobs, compute live geometry, dispatch pointer/touch/wheel events, or run analyzed project tests.",
    relatedHref: "html/image-cropper-readiness.html"
  });

  return {
    summary: `Image cropper readiness report: setup ${imageCropperSetups.length} files, crop signal ${cropSignals.length}, transform signal ${transformSignals.length}, output signal ${outputSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`,
    sourcePattern: "Image cropper readiness Zag image-cropper crop resize pan zoom rotate flip canvas accessibility tests",
    imageCropperSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    cropSignals,
    transformSignals,
    interactionSignals,
    keyboardSignals,
    outputSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    guardSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/image-cropper|imageCropper\\.machine|imageCropper\\.connect|getViewportProps|getSelectionProps|getHandleProps\" package.json src app packages", purpose: "Find Zag image-cropper machine usage and rendered cropper parts." },
      { command: "rg \"initialCrop|minWidth|minHeight|maxWidth|maxHeight|aspectRatio|cropShape|onCropChange|getCropSourceRect|computeResizeCrop\" src app packages test tests", purpose: "Trace crop bounds, aspect ratio, shape, callbacks, and source-rect mapping." },
      { command: "rg \"setZoom|zoomBy|setRotation|rotateBy|setFlip|flipHorizontally|flipVertically|offset|wheel|PINCH_START|PINCH_MOVE|pinch\" src app packages test tests", purpose: "Check zoom, rotation, flip, pan, wheel, and pinch transform ownership." },
      { command: "rg \"getCropData|getCroppedImage|drawCroppedImageToCanvas|toBlob|toDataURL|image/png|image/jpeg|image-cropper-traces|upload-artifact\" src app packages test tests .github", purpose: "Check crop output, canvas export, MIME/quality settings, and archived cropper traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag image-cropper, a native/custom cropper, or canvas-only crop logic.",
      "Trace root, viewport, image, selection, handles, and grid parts before inspecting state transitions.",
      "Then inspect crop rectangle, initial/default crop, size limits, aspect ratio, crop shape, crop change, source rect, zoom, rotation, flip, and offset.",
      "Check pointer drag, resize handles, panning, wheel zoom, pinch zoom, keyboard nudge/resize, output data, ARIA value text, and tests.",
      "This report is static readiness. Real pixel loading, pointer/touch/wheel events, canvas drawing, blob/data URL export, and project tests need trusted QA."
    ]
  };
}

type ImageCropperReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function imageCropperReadinessSourceFiles(walk: WalkResult): Promise<ImageCropperReadinessSourceFile[]> {
  const files: ImageCropperReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !imageCropperReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!imageCropperReadinessPathSignal(file.relPath) && !imageCropperReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function imageCropperReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return imageCropperReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function imageCropperReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(image-cropper|cropper|crop|cropping|avatar|photo|image|canvas|media|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function imageCropperReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/image-cropper|imageCropper\.machine|imageCropper\.connect|getCroppedImage|getCropData|getSelectionProps|getHandleProps|cropShape|initialCrop|drawCroppedImageToCanvas)/i.test(text);
}

function imageCropperReadinessSetups(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["imageCropperSetups"] {
  const rows: ImageCropperReadinessReport["imageCropperSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(getRootProps|data-part=['"]root|role=['"]group|role:\s*['"]group|image cropper|image-cropper)/gi);
    const viewportCount = countMatches(source.text, /(getViewportProps|data-part=['"]viewport|viewport|crop-viewport)/gi);
    const imageCount = countMatches(source.text, /(getImageProps|<img\b|HTMLImageElement|naturalSize|naturalWidth|naturalHeight|image-ready|image cropper image)/gi);
    const selectionCount = countMatches(source.text, /(getSelectionProps|data-part=['"]selection|crop selection|selection|role=['"]slider)/gi);
    const handleCount = countMatches(source.text, /(getHandleProps|data-part=['"]handle|handlePosition|handle-position|data-position|nw|ne|se|sw)/gi);
    const gridCount = countMatches(source.text, /(getGridProps|data-part=['"]grid|grid|horizontal|vertical)/gi);
    const cropCount = countMatches(source.text, /(crop\b|initialCrop|initial-crop|defaultCrop|default-crop|SET_DEFAULT_CROP|minWidth|minHeight|maxWidth|maxHeight|min-size|max-size|aspectRatio|aspect-ratio|cropShape|crop-shape|onCropChange|crop-change|getCropSourceRect|source-rect)/gi);
    const transformCount = countMatches(source.text, /(zoom|defaultZoom|default-zoom|minZoom|maxZoom|min-max-zoom|zoomStep|zoom-step|rotation|defaultRotation|default-rotation|rotateBy|flip|defaultFlip|offset|setFlip|flipHorizontally|flipVertically)/gi);
    const resizeCount = countMatches(source.text, /(resizeCrop|RESIZE_CROP|computeResizeCrop|resize-crop|handlePosition|alt-resize|fixedCropArea)/gi);
    const panCount = countMatches(source.text, /(PAN_POINTER_DOWN|pan-pointer-down|panning|updatePanOffset|offsetStart|clampOffset|panDelta)/gi);
    const zoomCount = countMatches(source.text, /(setZoom|zoomBy|SET_ZOOM|ZOOM|wheel|trackWheelEvent|PINCH_START|PINCH_MOVE|pinch|zoom-in|zoom-out)/gi);
    const keyboardCount = countMatches(source.text, /(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|arrow-keys|NUDGE_MOVE_CROP|NUDGE_RESIZE_CROP|nudge|altKey|shiftKey|ctrlKey|metaKey|nudgeStep|keyboard-test|\+|zoom-in|zoom-out)/gi);
    const outputCount = countMatches(source.text, /(getCropData|get-crop-data|getCroppedImage|get-cropped-image|drawCroppedImageToCanvas|canvas|toBlob|Blob|toDataURL|dataUrl|data-url|image\/png|image\/jpeg|png|jpeg|quality|output-test)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]group|role:\s*['"]group|role=['"]slider|role:\s*['"]slider|aria-roledescription|aria-label|aria-description|aria-live|aria-controls|aria-busy|aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext|data-dragging|data-panning|data-fixed|data-shape|aria-test)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|user\.keyboard|pointer-test|wheel-test|keyboard-test|pinch-test|output-test|aria-test|image-cropper-traces|upload-artifact)/gi);
    const total = rootCount + viewportCount + imageCount + selectionCount + handleCount + gridCount + cropCount + transformCount + resizeCount + panCount + zoomCount + keyboardCount + outputCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && viewportCount > 0 && imageCount > 0 && selectionCount > 0 && cropCount > 0 && transformCount > 0 && outputCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: imageCropperReadinessFramework(source),
      rootCount,
      viewportCount,
      imageCount,
      selectionCount,
      handleCount,
      gridCount,
      cropCount,
      transformCount,
      resizeCount,
      panCount,
      zoomCount,
      keyboardCount,
      outputCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, viewport ${viewportCount}, image ${imageCount}, selection ${selectionCount}, handle ${handleCount}, grid ${gridCount}, crop ${cropCount}, transform ${transformCount}, resize ${resizeCount}, pan ${panCount}, zoom ${zoomCount}, keyboard ${keyboardCount}, output ${outputCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.cropCount + b.transformCount + b.outputCount + b.accessibilityCount - (a.cropCount + a.transformCount + a.outputCount + a.accessibilityCount));
}

function imageCropperReadinessFramework(source: ImageCropperReadinessSourceFile): ImageCropperReadinessReport["imageCropperSetups"][number]["framework"] {
  if (/@zag-js\/image-cropper|imageCropper\.machine|imageCropper\.connect/i.test(source.text)) return "zag-image-cropper";
  if (/custom image cropper|image cropper|cropShape|initialCrop|getCroppedImage|getCropData/i.test(source.text)) return "custom";
  if (/native cropper|react-easy-crop|Cropper|cropperjs|canvas\.toDataURL|drawImage/i.test(source.text)) return "native-cropper";
  return "unknown";
}

function imageCropperReadinessFrameworkSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-image-cropper", pattern: /@zag-js\/image-cropper|imageCropper\.machine|imageCropper\.connect/i, evidence: "Zag image-cropper evidence was detected." },
    { signal: "native-cropper", pattern: /native cropper|react-easy-crop|cropperjs|Cropper|canvas\.toDataURL|drawImage/i, evidence: "native/custom cropper library evidence was detected." },
    { signal: "custom", pattern: /custom image cropper|image cropper|getCropData|getCroppedImage|cropShape|initialCrop/i, evidence: "custom image cropper evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function imageCropperReadinessStructureSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["structureSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|role=['"]group|role:\s*['"]group|image-cropper/i, evidence: "root evidence was detected." },
    { signal: "viewport", pattern: /getViewportProps|data-part=['"]viewport|viewport|crop-viewport/i, evidence: "viewport evidence was detected." },
    { signal: "image", pattern: /getImageProps|<img\b|HTMLImageElement|naturalSize|image-ready/i, evidence: "image evidence was detected." },
    { signal: "selection", pattern: /getSelectionProps|data-part=['"]selection|crop selection|role=['"]slider|selection/i, evidence: "selection evidence was detected." },
    { signal: "handle", pattern: /getHandleProps|data-part=['"]handle|handlePosition|data-position/i, evidence: "resize handle evidence was detected." },
    { signal: "grid", pattern: /getGridProps|data-part=['"]grid|grid|data-axis/i, evidence: "grid evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function imageCropperReadinessStateSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["stateSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "dragging", pattern: /\bdragging\b|data-dragging/i, evidence: "dragging state evidence was detected." },
    { signal: "panning", pattern: /\bpanning\b|data-panning/i, evidence: "panning state evidence was detected." },
    { signal: "measured", pattern: /isMeasured|measured|data-measured/i, evidence: "measured state evidence was detected." },
    { signal: "image-ready", pattern: /isImageReady|image-ready|data-ready|naturalSize/i, evidence: "image-ready state evidence was detected." },
    { signal: "fixed-crop-area", pattern: /fixedCropArea|fixed-crop-area|data-fixed/i, evidence: "fixed crop area evidence was detected." },
    { signal: "rectangle", pattern: /\brectangle\b/i, evidence: "rectangle crop shape evidence was detected." },
    { signal: "circle", pattern: /\bcircle\b/i, evidence: "circle crop shape evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function imageCropperReadinessCropSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["cropSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["cropSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "crop", pattern: /\bcrop\b|crop:/i, evidence: "crop rectangle evidence was detected." },
    { signal: "initial-crop", pattern: /initialCrop|initial-crop/i, evidence: "initial crop evidence was detected." },
    { signal: "default-crop", pattern: /SET_DEFAULT_CROP|setDefaultCrop|default-crop/i, evidence: "default crop evidence was detected." },
    { signal: "min-size", pattern: /minWidth|minHeight|min-size|getCropSizeLimits/i, evidence: "minimum crop size evidence was detected." },
    { signal: "max-size", pattern: /maxWidth|maxHeight|max-size|getCropSizeLimits/i, evidence: "maximum crop size evidence was detected." },
    { signal: "aspect-ratio", pattern: /aspectRatio|aspect-ratio|resolveCropAspectRatio|ADJUST_ASPECT_RATIO/i, evidence: "aspect ratio evidence was detected." },
    { signal: "crop-shape", pattern: /cropShape|crop-shape|data-shape/i, evidence: "crop shape evidence was detected." },
    { signal: "crop-change", pattern: /onCropChange|crop-change|setCrop|context\.set\(["']crop/i, evidence: "crop change evidence was detected." },
    { signal: "source-rect", pattern: /getCropSourceRect|source-rect|sourceRect|natural image/i, evidence: "source rect mapping evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "crop", "signal");
}

function imageCropperReadinessTransformSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["transformSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["transformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zoom", pattern: /\bzoom\b|setZoom|zoomBy/i, evidence: "zoom evidence was detected." },
    { signal: "default-zoom", pattern: /defaultZoom|default-zoom/i, evidence: "default zoom evidence was detected." },
    { signal: "min-max-zoom", pattern: /minZoom|maxZoom|min-max-zoom/i, evidence: "min/max zoom evidence was detected." },
    { signal: "zoom-step", pattern: /zoomStep|zoom-step/i, evidence: "zoom step evidence was detected." },
    { signal: "rotation", pattern: /\brotation\b|setRotation|rotateBy/i, evidence: "rotation evidence was detected." },
    { signal: "default-rotation", pattern: /defaultRotation|default-rotation/i, evidence: "default rotation evidence was detected." },
    { signal: "flip", pattern: /\bflip\b|setFlip|flipHorizontally|flipVertically/i, evidence: "flip evidence was detected." },
    { signal: "offset", pattern: /\boffset\b|offsetStart|clampOffset|panDelta/i, evidence: "offset/pan transform evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "transform", "signal");
}

function imageCropperReadinessInteractionSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-down", pattern: /POINTER_DOWN|pointer-down|onPointerDown/i, evidence: "pointer down evidence was detected." },
    { signal: "pointer-move", pattern: /POINTER_MOVE|pointermove|pointer-move|onPointerMove/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-up", pattern: /POINTER_UP|pointerup|pointer-up/i, evidence: "pointer up evidence was detected." },
    { signal: "pan-pointer-down", pattern: /PAN_POINTER_DOWN|pan-pointer-down/i, evidence: "pan pointer down evidence was detected." },
    { signal: "wheel", pattern: /trackWheelEvent|wheel|onWheel/i, evidence: "wheel zoom evidence was detected." },
    { signal: "pinch-start", pattern: /PINCH_START|pinch-start|touchstart/i, evidence: "pinch start evidence was detected." },
    { signal: "pinch-move", pattern: /PINCH_MOVE|pinch-move|touchmove/i, evidence: "pinch move evidence was detected." },
    { signal: "pinch-end", pattern: /PINCH_END|pinch-end|touchend/i, evidence: "pinch end evidence was detected." },
    { signal: "resize-crop", pattern: /RESIZE_CROP|resizeCrop|resize-crop|computeResizeCrop/i, evidence: "resize crop evidence was detected." },
    { signal: "reset", pattern: /\bRESET\b|resetToInitialState|reset\(/i, evidence: "reset evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function imageCropperReadinessKeyboardSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["keyboardSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["keyboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-keys", pattern: /ArrowUp|ArrowDown|ArrowLeft|ArrowRight|arrow-keys/i, evidence: "arrow key evidence was detected." },
    { signal: "alt-resize", pattern: /altKey|Alt with arrow|alt-resize/i, evidence: "Alt resize evidence was detected." },
    { signal: "shift-step", pattern: /shiftKey|nudgeStepShift|shift-step/i, evidence: "Shift step evidence was detected." },
    { signal: "ctrl-step", pattern: /ctrlKey|metaKey|nudgeStepCtrl|ctrl-step/i, evidence: "Ctrl/Cmd step evidence was detected." },
    { signal: "zoom-in", pattern: /zoom-in|\+|isZoomInKey|key === ["']\+["']|key === ["']=["']/i, evidence: "keyboard zoom-in evidence was detected." },
    { signal: "zoom-out", pattern: /zoom-out|isZoomOutKey|key === ["']-["']|key === ["']_["']/i, evidence: "keyboard zoom-out evidence was detected." },
    { signal: "nudge", pattern: /NUDGE_MOVE_CROP|NUDGE_RESIZE_CROP|nudge|computeKeyboardCrop|getNudgeStep/i, evidence: "keyboard nudge evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "keyboard", "signal");
}

function imageCropperReadinessOutputSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["outputSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get-crop-data", pattern: /getCropData|get-crop-data/i, evidence: "getCropData evidence was detected." },
    { signal: "get-cropped-image", pattern: /getCroppedImage|get-cropped-image/i, evidence: "getCroppedImage evidence was detected." },
    { signal: "canvas", pattern: /canvas|drawCroppedImageToCanvas|getContext\(["']2d["']\)|drawImage/i, evidence: "canvas evidence was detected." },
    { signal: "blob", pattern: /\bBlob\b|toBlob|output\s*=\s*["']blob["']/i, evidence: "Blob output evidence was detected." },
    { signal: "data-url", pattern: /dataUrl|data-url|toDataURL/i, evidence: "data URL output evidence was detected." },
    { signal: "png", pattern: /image\/png|\bpng\b/i, evidence: "PNG output evidence was detected." },
    { signal: "jpeg", pattern: /image\/jpeg|\bjpeg\b|\bjpg\b/i, evidence: "JPEG output evidence was detected." },
    { signal: "quality", pattern: /quality|0\.\d+|lossy/i, evidence: "quality setting evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function imageCropperReadinessAccessibilitySignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "group-role", pattern: /role=['"]group|role:\s*['"]group/i, evidence: "group role evidence was detected." },
    { signal: "slider-role", pattern: /role=['"]slider|role:\s*['"]slider|slider-role/i, evidence: "slider role evidence was detected." },
    { signal: "aria-roledescription", pattern: /aria-roledescription/i, evidence: "aria-roledescription evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-description", pattern: /aria-description/i, evidence: "aria-description evidence was detected." },
    { signal: "aria-live", pattern: /aria-live/i, evidence: "aria-live evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-busy", pattern: /aria-busy/i, evidence: "aria-busy evidence was detected." },
    { signal: "aria-valuemin-max", pattern: /aria-valuemin|aria-valuemax|aria-valuemin-max/i, evidence: "aria value min/max evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow/i, evidence: "aria-valuenow evidence was detected." },
    { signal: "aria-valuetext", pattern: /aria-valuetext/i, evidence: "aria-valuetext evidence was detected." },
    { signal: "data-dragging", pattern: /data-dragging/i, evidence: "data-dragging evidence was detected." },
    { signal: "data-panning", pattern: /data-panning/i, evidence: "data-panning evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function imageCropperReadinessMachineSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["machineSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<ImageCropperSchema>|createMachine\s+ImageCropperSchema/i, evidence: "Zag image-cropper createMachine evidence was detected." },
    { signal: "default-props", pattern: /minWidth[\s\S]{0,260}nudgeStepCtrl|defaultZoom 1|zoomStep 0\.1/i, evidence: "image cropper default prop evidence was detected." },
    { signal: "translations", pattern: /translations[\s\S]{0,220}(rootLabel|previewDescription|selectionLabel)|translations rootLabel/i, evidence: "translation evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,80}idle|states[\s\S]{0,120}idle|initialState idle/i, evidence: "idle state evidence was detected." },
    { signal: "dragging-state", pattern: /states[\s\S]{0,220}dragging|states idle dragging/i, evidence: "dragging state evidence was detected." },
    { signal: "panning-state", pattern: /states[\s\S]{0,280}panning|states idle dragging panning/i, evidence: "panning state evidence was detected." },
    { signal: "global-events", pattern: /PINCH_START[\s\S]{0,300}ADJUST_ASPECT_RATIO|SET_ZOOM[\s\S]{0,200}RESET/i, evidence: "global machine event evidence was detected." },
    { signal: "pointer-events", pattern: /POINTER_DOWN|POINTER_MOVE|POINTER_UP|PAN_POINTER_DOWN/i, evidence: "pointer event evidence was detected." },
    { signal: "pinch-events", pattern: /PINCH_START|PINCH_MOVE|PINCH_END/i, evidence: "pinch event evidence was detected." },
    { signal: "transform-events", pattern: /SET_ZOOM|SET_ROTATION|SET_FLIP|ZOOM/i, evidence: "transform event evidence was detected." },
    { signal: "viewport-events", pattern: /VIEWPORT_RESIZE|SET_NATURAL_SIZE|SET_DEFAULT_CROP/i, evidence: "viewport event evidence was detected." },
    { signal: "computed-state", pattern: /computed[\s\S]{0,160}isMeasured[\s\S]{0,160}isImageReady|computed isMeasured isImageReady/i, evidence: "computed state evidence was detected." },
    { signal: "watch-props", pattern: /watch[\s\S]{0,200}(zoom|aspectRatio|cropShape)|watch zoom aspectRatio cropShape/i, evidence: "watch prop evidence was detected." },
    { signal: "idle-effects", pattern: /effects[\s\S]{0,180}trackViewportResize[\s\S]{0,180}trackTouchEvents|effects trackViewportResize trackWheelEvent trackTouchEvents/i, evidence: "idle effect evidence was detected." },
    { signal: "track-pointer-move-effect", pattern: /trackPointerMove/i, evidence: "trackPointerMove machine effect evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function imageCropperReadinessContextSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["contextSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "natural-size-context", pattern: /naturalSize/i, evidence: "natural size context evidence was detected." },
    { signal: "crop-context", pattern: /\bcrop\b/i, evidence: "crop context evidence was detected." },
    { signal: "pointer-start-context", pattern: /pointerStart/i, evidence: "pointer start context evidence was detected." },
    { signal: "crop-start-context", pattern: /cropStart/i, evidence: "crop start context evidence was detected." },
    { signal: "handle-position-context", pattern: /handlePosition/i, evidence: "handle position context evidence was detected." },
    { signal: "shift-lock-ratio-context", pattern: /shiftLockRatio/i, evidence: "shift lock ratio context evidence was detected." },
    { signal: "pinch-distance-context", pattern: /pinchDistance/i, evidence: "pinch distance context evidence was detected." },
    { signal: "pinch-midpoint-context", pattern: /pinchMidpoint/i, evidence: "pinch midpoint context evidence was detected." },
    { signal: "zoom-context", pattern: /\bzoom\b/i, evidence: "zoom context evidence was detected." },
    { signal: "rotation-context", pattern: /\brotation\b/i, evidence: "rotation context evidence was detected." },
    { signal: "flip-context", pattern: /\bflip\b/i, evidence: "flip context evidence was detected." },
    { signal: "offset-context", pattern: /\boffset\b/i, evidence: "offset context evidence was detected." },
    { signal: "offset-start-context", pattern: /offsetStart/i, evidence: "offset start context evidence was detected." },
    { signal: "viewport-rect-context", pattern: /viewportRect/i, evidence: "viewport rect context evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function imageCropperReadinessComputedSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["computedSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-measured", pattern: /isMeasured/i, evidence: "isMeasured evidence was detected." },
    { signal: "is-image-ready", pattern: /isImageReady/i, evidence: "isImageReady evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function imageCropperReadinessEffectSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["effectSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-pointer-move", pattern: /trackPointerMove[\s\S]{0,160}(pointermove|pointerup)|trackPointerMove/i, evidence: "track pointer move effect evidence was detected." },
    { signal: "track-viewport-resize", pattern: /trackViewportResize[\s\S]{0,160}(resizeObserverBorderBox|VIEWPORT_RESIZE)|trackViewportResize/i, evidence: "track viewport resize effect evidence was detected." },
    { signal: "track-wheel-event", pattern: /trackWheelEvent[\s\S]{0,160}(wheel|passive)|trackWheelEvent/i, evidence: "track wheel event evidence was detected." },
    { signal: "track-touch-events", pattern: /trackTouchEvents[\s\S]{0,200}(touchstart|touchmove|touchend)|trackTouchEvents/i, evidence: "track touch events evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function imageCropperReadinessActionSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["actionSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "check-image-status", pattern: /checkImageStatus/i, evidence: "check image status action evidence was detected." },
    { signal: "set-natural-size", pattern: /setNaturalSize/i, evidence: "set natural size action evidence was detected." },
    { signal: "set-default-crop", pattern: /setDefaultCrop/i, evidence: "set default crop action evidence was detected." },
    { signal: "set-pointer-start", pattern: /setPointerStart/i, evidence: "set pointer start action evidence was detected." },
    { signal: "set-offset-start", pattern: /setOffsetStart/i, evidence: "set offset start action evidence was detected." },
    { signal: "set-crop-start", pattern: /setCropStart/i, evidence: "set crop start action evidence was detected." },
    { signal: "update-crop", pattern: /updateCrop/i, evidence: "update crop action evidence was detected." },
    { signal: "update-pan-offset", pattern: /updatePanOffset/i, evidence: "update pan offset action evidence was detected." },
    { signal: "set-handle-position", pattern: /setHandlePosition/i, evidence: "set handle position action evidence was detected." },
    { signal: "set-rotation", pattern: /setRotation/i, evidence: "set rotation action evidence was detected." },
    { signal: "set-flip", pattern: /setFlip/i, evidence: "set flip action evidence was detected." },
    { signal: "resize-crop", pattern: /resizeCrop/i, evidence: "resize crop action evidence was detected." },
    { signal: "clear-pointer-start", pattern: /clearPointerStart/i, evidence: "clear pointer start action evidence was detected." },
    { signal: "clear-crop-start", pattern: /clearCropStart/i, evidence: "clear crop start action evidence was detected." },
    { signal: "clear-handle-position", pattern: /clearHandlePosition/i, evidence: "clear handle position action evidence was detected." },
    { signal: "clear-offset-start", pattern: /clearOffsetStart/i, evidence: "clear offset start action evidence was detected." },
    { signal: "clear-shift-ratio", pattern: /clearShiftRatio/i, evidence: "clear shift ratio action evidence was detected." },
    { signal: "update-zoom", pattern: /updateZoom/i, evidence: "update zoom action evidence was detected." },
    { signal: "set-pinch-distance", pattern: /setPinchDistance/i, evidence: "set pinch distance action evidence was detected." },
    { signal: "handle-pinch-move", pattern: /handlePinchMove/i, evidence: "handle pinch move action evidence was detected." },
    { signal: "clear-pinch-distance", pattern: /clearPinchDistance/i, evidence: "clear pinch distance action evidence was detected." },
    { signal: "nudge-resize-crop", pattern: /nudgeResizeCrop/i, evidence: "nudge resize crop action evidence was detected." },
    { signal: "nudge-move-crop", pattern: /nudgeMoveCrop/i, evidence: "nudge move crop action evidence was detected." },
    { signal: "resize-viewport", pattern: /resizeViewport/i, evidence: "resize viewport action evidence was detected." },
    { signal: "reset-to-initial-state", pattern: /resetToInitialState/i, evidence: "reset to initial state action evidence was detected." },
    { signal: "adjust-crop-aspect-ratio", pattern: /adjustCropAspectRatio/i, evidence: "adjust crop aspect ratio action evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function imageCropperReadinessGuardSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["guardSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "has-viewport-rect", pattern: /hasViewportRect/i, evidence: "has viewport rect guard evidence was detected." },
    { signal: "can-resize-crop", pattern: /canResizeCrop/i, evidence: "can resize crop guard evidence was detected." },
    { signal: "can-pan", pattern: /canPan/i, evidence: "can pan guard evidence was detected." },
    { signal: "can-drag-selection", pattern: /canDragSelection/i, evidence: "can drag selection guard evidence was detected." },
    { signal: "visible-rect", pattern: /isVisibleRect/i, evidence: "visible rect helper evidence was detected." },
    { signal: "fixed-crop-area", pattern: /fixedCropArea/i, evidence: "fixed crop area guard evidence was detected." },
    { signal: "aspect-ratio-equal", pattern: /isAspectRatioEqual/i, evidence: "aspect ratio equal guard evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function imageCropperReadinessDomSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["domSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id DOM evidence was detected." },
    { signal: "viewport-id", pattern: /getViewportId/i, evidence: "viewport id DOM evidence was detected." },
    { signal: "image-id", pattern: /getImageId/i, evidence: "image id DOM evidence was detected." },
    { signal: "selection-id", pattern: /getSelectionId/i, evidence: "selection id DOM evidence was detected." },
    { signal: "handle-id", pattern: /getHandleId/i, evidence: "handle id DOM evidence was detected." },
    { signal: "root-el", pattern: /getRootEl/i, evidence: "root element DOM evidence was detected." },
    { signal: "viewport-el", pattern: /getViewportEl/i, evidence: "viewport element DOM evidence was detected." },
    { signal: "image-el", pattern: /getImageEl/i, evidence: "image element DOM evidence was detected." },
    { signal: "selection-el", pattern: /getSelectionEl/i, evidence: "selection element DOM evidence was detected." },
    { signal: "handle-el", pattern: /getHandleEl/i, evidence: "handle element DOM evidence was detected." },
    { signal: "draw-cropped-image-canvas", pattern: /drawCroppedImageToCanvas[\s\S]{0,240}(canvas|getContext|drawImage|toBlob|toDataURL)|drawCroppedImageToCanvas/i, evidence: "draw cropped image canvas evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function imageCropperReadinessApiSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["apiSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zoom", pattern: /\bzoom\b/i, evidence: "zoom API evidence was detected." },
    { signal: "rotation", pattern: /\brotation\b/i, evidence: "rotation API evidence was detected." },
    { signal: "flip", pattern: /\bflip\b/i, evidence: "flip API evidence was detected." },
    { signal: "crop", pattern: /\bcrop\b/i, evidence: "crop API evidence was detected." },
    { signal: "offset", pattern: /\boffset\b/i, evidence: "offset API evidence was detected." },
    { signal: "natural-size", pattern: /naturalSize/i, evidence: "natural size API evidence was detected." },
    { signal: "viewport-rect", pattern: /viewportRect/i, evidence: "viewport rect API evidence was detected." },
    { signal: "dragging", pattern: /\bdragging\b/i, evidence: "dragging API evidence was detected." },
    { signal: "panning", pattern: /\bpanning\b/i, evidence: "panning API evidence was detected." },
    { signal: "set-zoom", pattern: /setZoom/i, evidence: "set zoom API evidence was detected." },
    { signal: "zoom-by", pattern: /zoomBy/i, evidence: "zoom by API evidence was detected." },
    { signal: "set-rotation", pattern: /setRotation/i, evidence: "set rotation API evidence was detected." },
    { signal: "rotate-by", pattern: /rotateBy/i, evidence: "rotate by API evidence was detected." },
    { signal: "set-flip", pattern: /setFlip/i, evidence: "set flip API evidence was detected." },
    { signal: "flip-horizontally", pattern: /flipHorizontally/i, evidence: "flip horizontally API evidence was detected." },
    { signal: "flip-vertically", pattern: /flipVertically/i, evidence: "flip vertically API evidence was detected." },
    { signal: "resize", pattern: /\bresize\b|resize\(/i, evidence: "resize API evidence was detected." },
    { signal: "reset", pattern: /\breset\b|reset\(/i, evidence: "reset API evidence was detected." },
    { signal: "get-crop-data", pattern: /getCropData/i, evidence: "get crop data API evidence was detected." },
    { signal: "get-cropped-image", pattern: /getCroppedImage/i, evidence: "get cropped image API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "viewport-props", pattern: /getViewportProps/i, evidence: "viewport props API evidence was detected." },
    { signal: "image-props", pattern: /getImageProps/i, evidence: "image props API evidence was detected." },
    { signal: "selection-props", pattern: /getSelectionProps/i, evidence: "selection props API evidence was detected." },
    { signal: "handle-props", pattern: /getHandleProps/i, evidence: "handle props API evidence was detected." },
    { signal: "grid-props", pattern: /getGridProps/i, evidence: "grid props API evidence was detected." },
    { signal: "group-role", pattern: /role\s+group|role:\s*["']group|role=['"]group/i, evidence: "group role API evidence was detected." },
    { signal: "presentation-role", pattern: /role\s+presentation|role:\s*["']presentation|role=['"]presentation/i, evidence: "presentation role API evidence was detected." },
    { signal: "slider-role", pattern: /role\s+slider|role:\s*["']slider|role=['"]slider/i, evidence: "slider role API evidence was detected." },
    { signal: "keyboard-map", pattern: /keyMap|onKeyDown|ArrowUp|ArrowDown|zoom-in|zoom-out/i, evidence: "keyboard map API evidence was detected." },
    { signal: "pointer-handlers", pattern: /onPointerDown|POINTER_DOWN|pointerdown/i, evidence: "pointer handler API evidence was detected." },
    { signal: "aria-live", pattern: /aria-live|ariaLive/i, evidence: "ARIA live API evidence was detected." },
    { signal: "aria-busy", pattern: /aria-busy|ariaBusy/i, evidence: "ARIA busy API evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden|ariaHidden/i, evidence: "ARIA hidden API evidence was detected." },
    { signal: "data-pinch", pattern: /data-pinch|pinchDistance/i, evidence: "data pinch API evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby|dataOwnedby/i, evidence: "data owned-by API evidence was detected." },
    { signal: "data-flip-horizontal", pattern: /data-flip-horizontal|flipHorizontal/i, evidence: "data flip horizontal API evidence was detected." },
    { signal: "data-flip-vertical", pattern: /data-flip-vertical|flipVertical/i, evidence: "data flip vertical API evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function imageCropperReadinessTestSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["testSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "wheel-test", pattern: /wheel-test|wheel/i, evidence: "wheel test evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|Arrow/i, evidence: "keyboard test evidence was detected." },
    { signal: "pinch-test", pattern: /pinch-test|pinch|touch/i, evidence: "pinch test evidence was detected." },
    { signal: "output-test", pattern: /output-test|getCroppedImage|getCropData|toDataURL|toBlob/i, evidence: "output test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|getByRole|aria-/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|image-cropper-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function imageCropperReadinessPackageSignals(sourceFiles: ImageCropperReadinessSourceFile[]): ImageCropperReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ImageCropperReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/image-cropper", pattern: /@zag-js\/image-cropper/i, evidence: "@zag-js/image-cropper dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return imageCropperReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function imageCropperReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ImageCropperReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/image-cropper-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
