import type { AnalyticsReadinessReport, HttpClientReadinessReport, SchemaValidationReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildAnalyticsReadinessReport(walk: WalkResult): Promise<AnalyticsReadinessReport> {
  const sourceFiles = await analyticsReadinessSourceFiles(walk);
  const analyticsSetups = analyticsReadinessSetups(sourceFiles);
  const eventSignals = analyticsReadinessEventSignals(sourceFiles);
  const identitySignals = analyticsReadinessIdentitySignals(sourceFiles);
  const privacySignals = analyticsReadinessPrivacySignals(sourceFiles);
  const productSignals = analyticsReadinessProductSignals(sourceFiles);
  const packageSignals = analyticsReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasPostHogPackage = packageSignals.some((item) => ["posthog-js", "posthog-js-lite", "posthog-node", "@posthog/react", "@posthog/nextjs-config"].includes(item.signal) && item.readiness === "ready");
  const hasSetup = analyticsSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = analyticsSetups.some((item) => item.readiness === "ready");
  const hasCapture = eventSignals.some((item) => ["capture", "track", "custom-event"].includes(item.signal) && item.readiness === "ready") || analyticsSetups.some((item) => item.captureCount > 0);
  const hasIdentity = identitySignals.some((item) => ["identify", "alias", "group", "reset", "distinct-id"].includes(item.signal) && item.readiness === "ready") || analyticsSetups.some((item) => item.identityCount > 0);
  const hasPageview = eventSignals.some((item) => ["pageview", "autocapture"].includes(item.signal) && item.readiness === "ready") || analyticsSetups.some((item) => item.pageviewCount > 0);
  const hasPrivacy = privacySignals.some((item) => ["opt-in", "opt-out", "before-send", "property-filter", "disable-session-recording"].includes(item.signal) && item.readiness === "ready") || analyticsSetups.some((item) => item.privacyCount > 0);
  const hasProductTelemetry = productSignals.some((item) => ["feature-flags", "flag-payload", "session-recording", "surveys", "web-vitals"].includes(item.signal) && item.readiness === "ready");
  const hasSessionRecording = productSignals.some((item) => item.signal === "session-recording" && item.readiness === "ready");
  const disablesSessionRecording = privacySignals.some((item) => item.signal === "disable-session-recording" && item.readiness === "ready");

  const riskQueue: AnalyticsReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasCapture) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the analytics strategy before claiming analytics readiness.",
      why: "Analytics readiness starts with an explicit SDK package, init file, capture path, identity policy, pageview/autocapture behavior, or privacy control.",
      relatedHref: "html/analytics-readiness.html"
    });
  }
  if (hasPostHogPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each PostHog package signal with posthog.init or PostHogProvider setup and a capture path.",
      why: "PostHog packages do not produce useful product analytics until an app initializes the client and records events with stable options.",
      relatedHref: "html/analytics-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasCapture) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit capture, track, pageview, or custom-event calls for the learner-visible product events.",
      why: "An analytics SDK without event capture cannot explain which user behaviors are measured or why.",
      relatedHref: "html/analytics-readiness.html"
    });
  }
  if ((hasPackage || hasSetup || hasCapture) && !hasIdentity) {
    riskQueue.push({
      priority: "medium",
      action: "Document identify, alias, group, reset, or distinct-id behavior before using analytics for user journeys.",
      why: "Product analytics needs a clear identity boundary to avoid merging unrelated users or leaking account context.",
      relatedHref: "html/analytics-readiness.html"
    });
  }
  if ((hasReadySetup || hasCapture || hasPageview || hasProductTelemetry) && !hasPrivacy) {
    riskQueue.push({
      priority: "medium",
      action: "Review consent, opt-out, before_send, property filtering, and session-recording controls.",
      why: "Analytics can collect behavioral and identifying data unless privacy and event filtering policy is explicit.",
      relatedHref: "html/analytics-readiness.html"
    });
  }
  if (hasSessionRecording && !disablesSessionRecording) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm session recording is intentionally enabled and paired with privacy masking or disable controls.",
      why: "Session replay changes the privacy profile of product analytics and should be reviewed before production traffic.",
      relatedHref: "html/analytics-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run analytics integration checks only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not initialize analytics SDKs, send events to vendors, collect identities, start replay/heatmaps, mutate cookies or local storage, or run the analyzed project's tests.",
    relatedHref: "html/analytics-readiness.html"
  });

  return {
    summary: `PostHog식 analytics readiness report: setup ${analyticsSetups.length}개, event signal ${eventSignals.length}개, identity signal ${identitySignals.length}개, privacy signal ${privacySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "posthog.init posthog.capture posthog.identify posthog.alias posthog.group posthog.reset autocapture capture_pageview opt_in_capturing opt_out_capturing before_send getFeatureFlag onFeatureFlags session_recording",
    analyticsSetups,
    eventSignals,
    identitySignals,
    privacySignals,
    productSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"posthog\\.init|PostHogProvider|analytics\\.load|init\\(|new PostHog|mixpanel\\.init|amplitude\\.init\" src app pages packages", purpose: "Inventory analytics SDK packages, browser/server init files, provider setup, and API host options." },
      { command: "rg \"posthog\\.capture|analytics\\.track|track\\(|capture_pageview|pageview|autocapture|\\$feature_interaction|custom event\" src app pages packages", purpose: "Trace custom events, pageview behavior, autocapture, feature interactions, and event naming." },
      { command: "rg \"identify\\(|alias\\(|group\\(|reset\\(|distinctId|distinct_id|setPersonPropertiesForFlags|setGroupPropertiesForFlags\" src app pages packages", purpose: "Review user identity, account/group identity, reset-on-logout, and flag property enrichment." },
      { command: "rg \"opt_in_capturing|opt_out_capturing|has_opted|before_send|disable_session_recording|property_blacklist|mask|consent\" src app pages packages", purpose: "Check consent, opt-out, event filtering, property filtering, and session recording privacy controls." },
      { command: "rg \"getFeatureFlag|getFeatureFlagPayload|onFeatureFlags|useFeatureFlag|session_recording|startSessionRecording|survey|web-vitals\" src app pages packages", purpose: "Inspect product analytics integrations such as feature flags, payloads, replay, surveys, and web vitals." },
      { command: "npx vitest run", purpose: "Run local tests that exercise analytics init, event capture, identity reset, consent gates, and feature flag behavior." }
    ],
    learnerNextSteps: [
      "먼저 posthog.init, PostHogProvider, analytics.load, amplitude.init, mixpanel.init 같은 analytics client 초기화 위치를 확인하세요.",
      "capture, track, pageview, autocapture, $feature_interaction 호출을 따라가며 어떤 product event가 실제로 측정되는지 확인하세요.",
      "identify, alias, group, reset, distinctId가 로그인/로그아웃/조직 전환 흐름과 맞는지 검토하세요.",
      "opt_in_capturing, opt_out_capturing, before_send, property filter, disable_session_recording으로 개인정보와 consent 위험을 줄이는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 이벤트 전송, cookie/localStorage 변경, session replay 시작, vendor dashboard 수신은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type AnalyticsReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function analyticsReadinessSourceFiles(walk: WalkResult): Promise<AnalyticsReadinessSourceFile[]> {
  const files: AnalyticsReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !analyticsReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!analyticsReadinessPathSignal(file.relPath) && !analyticsReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function analyticsReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return analyticsReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|posthog\.[cm]?[jt]sx?|analytics\.[cm]?[jt]sx?|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function analyticsReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(analytics?|posthog|segment|amplitude|mixpanel|telemetry|tracking|events?|feature[-_ ]?flags?|session[-_ ]?recording|consent)(\/|\.|-|_|$)/i.test(filePath);
}

function analyticsReadinessContentSignal(text: string): boolean {
  return /\b(posthog\.init|posthog\.capture|posthog\.identify|PostHogProvider|PostHogFeature|@posthog\/react|posthog-js|analytics\.track|@segment\/analytics-next|amplitude\.track|@amplitude\/analytics-browser|mixpanel\.track|mixpanel-browser|capture_pageview|autocapture|opt_in_capturing|opt_out_capturing|before_send|getFeatureFlag|onFeatureFlags|session_recording)\b/i.test(text);
}

function analyticsReadinessSetups(sourceFiles: AnalyticsReadinessSourceFile[]): AnalyticsReadinessReport["analyticsSetups"] {
  const rows: AnalyticsReadinessReport["analyticsSetups"] = [];
  for (const source of sourceFiles) {
    const initCount = countMatches(source.text, /posthog\.init\s*\(|<PostHogProvider\b|new\s+PostHog\s*\(|analytics\.load\s*\(|createAnalytics\s*\(|amplitude\.init\s*\(|mixpanel\.init\s*\(/gi);
    const captureCount = countMatches(source.text, /posthog\.capture\s*\(|\.capture\s*\(|analytics\.track\s*\(|\.track\s*\(|captureException\s*\(|\$feature_interaction|\$feature_view/gi);
    const identityCount = countMatches(source.text, /\.identify\s*\(|posthog\.identify\s*\(|\.alias\s*\(|\.group\s*\(|\.reset\s*\(|distinctId|distinct_id|setPersonPropertiesForFlags|setGroupPropertiesForFlags/gi);
    const pageviewCount = countMatches(source.text, /capture_pageview|pageview|PageView|autocapture|history_change|\$pageview/gi);
    const privacyCount = countMatches(source.text, /opt_in_capturing|opt_out_capturing|has_opted_in_capturing|has_opted_out_capturing|before_send|disable_session_recording|property_blacklist|property_denylist|mask|consent/gi);
    const hasSetupSignal = initCount + captureCount + identityCount + pageviewCount + privacyCount > 0 || /\b(PostHog|analytics|product analytics|Segment|Amplitude|Mixpanel)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: analyticsReadinessProvider(source),
      initCount,
      captureCount,
      identityCount,
      pageviewCount,
      privacyCount,
      readiness: initCount > 0 && captureCount > 0 && (identityCount > 0 || pageviewCount > 0 || privacyCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains init ${initCount}, capture ${captureCount}, identity ${identityCount}, pageview/autocapture ${pageviewCount}, privacy controls ${privacyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function analyticsReadinessProvider(source: AnalyticsReadinessSourceFile): AnalyticsReadinessReport["analyticsSetups"][number]["provider"] {
  if (/posthog|@posthog\/|PostHog/i.test(source.text)) return "posthog";
  if (/@segment\/analytics-next|analytics\.track|analytics\.load|Segment/i.test(source.text)) return "segment";
  if (/@amplitude\/analytics-browser|amplitude\./i.test(source.text)) return "amplitude";
  if (/mixpanel-browser|mixpanel\./i.test(source.text)) return "mixpanel";
  if (/\b(analytics|telemetry|tracking|product event)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function analyticsReadinessEventSignals(sourceFiles: AnalyticsReadinessSourceFile[]): AnalyticsReadinessReport["eventSignals"] {
  const specs: Array<{ signal: AnalyticsReadinessReport["eventSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "capture", pattern: /posthog\.capture\s*\(|\.capture\s*\(/i, evidence: "PostHog-style capture evidence was detected." },
    { signal: "track", pattern: /analytics\.track\s*\(|amplitude\.track\s*\(|mixpanel\.track\s*\(|\.track\s*\(/i, evidence: "track event evidence was detected." },
    { signal: "pageview", pattern: /capture_pageview|pageview|PageView|\$pageview/i, evidence: "pageview evidence was detected." },
    { signal: "autocapture", pattern: /autocapture/i, evidence: "autocapture evidence was detected." },
    { signal: "feature-interaction", pattern: /\$feature_interaction|\$feature_view|PostHogFeature/i, evidence: "feature interaction/view analytics evidence was detected." },
    { signal: "error-capture", pattern: /captureException|captureExceptionImmediate|\$exception|PostHogErrorBoundary/i, evidence: "analytics-backed error capture evidence was detected." },
    { signal: "custom-event", pattern: /event\s*:|eventName|button_clicked|custom event|user did action/i, evidence: "custom event naming evidence was detected." }
  ];
  return analyticsReadinessSignalFromSpecs(sourceFiles, specs, "event", "signal");
}

function analyticsReadinessIdentitySignals(sourceFiles: AnalyticsReadinessSourceFile[]): AnalyticsReadinessReport["identitySignals"] {
  const specs: Array<{ signal: AnalyticsReadinessReport["identitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "identify", pattern: /\.identify\s*\(|posthog\.identify\s*\(/i, evidence: "identify evidence was detected." },
    { signal: "alias", pattern: /\.alias\s*\(|posthog\.alias\s*\(/i, evidence: "alias evidence was detected." },
    { signal: "group", pattern: /\.group\s*\(|posthog\.group\s*\(|groupProperties/i, evidence: "group identity evidence was detected." },
    { signal: "reset", pattern: /\.reset\s*\(|posthog\.reset\s*\(/i, evidence: "identity reset evidence was detected." },
    { signal: "distinct-id", pattern: /distinctId|distinct_id|get_distinct_id|getDistinctId/i, evidence: "distinct ID evidence was detected." },
    { signal: "person-properties", pattern: /setPersonPropertiesForFlags|personProperties|person_properties|\$set/i, evidence: "person property evidence was detected." },
    { signal: "group-properties", pattern: /setGroupPropertiesForFlags|groupProperties|group_properties|\$groups/i, evidence: "group property evidence was detected." }
  ];
  return analyticsReadinessSignalFromSpecs(sourceFiles, specs, "identity", "signal");
}

function analyticsReadinessPrivacySignals(sourceFiles: AnalyticsReadinessSourceFile[]): AnalyticsReadinessReport["privacySignals"] {
  const specs: Array<{ signal: AnalyticsReadinessReport["privacySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "opt-in", pattern: /opt_in_capturing|optIn|consent\s*:\s*true/i, evidence: "opt-in capture evidence was detected." },
    { signal: "opt-out", pattern: /opt_out_capturing|optOut|consent\s*:\s*false/i, evidence: "opt-out capture evidence was detected." },
    { signal: "has-opted-in", pattern: /has_opted_in_capturing|hasOptedIn/i, evidence: "has-opted-in check evidence was detected." },
    { signal: "has-opted-out", pattern: /has_opted_out_capturing|hasOptedOut/i, evidence: "has-opted-out check evidence was detected." },
    { signal: "disable-session-recording", pattern: /disable_session_recording|disableSessionRecording|session_recording\s*:\s*false/i, evidence: "session recording disable evidence was detected." },
    { signal: "before-send", pattern: /before_send|beforeSend/i, evidence: "before_send event filtering evidence was detected." },
    { signal: "property-filter", pattern: /property_blacklist|property_denylist|mask|redact|sanitize|ip_address|person_profiles/i, evidence: "property filtering or masking evidence was detected." }
  ];
  return analyticsReadinessSignalFromSpecs(sourceFiles, specs, "privacy", "signal");
}

function analyticsReadinessProductSignals(sourceFiles: AnalyticsReadinessSourceFile[]): AnalyticsReadinessReport["productSignals"] {
  const specs: Array<{ signal: AnalyticsReadinessReport["productSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "feature-flags", pattern: /getFeatureFlag|useFeatureFlag|onFeatureFlags|reloadFeatureFlags|activeFeatureFlags/i, evidence: "feature flag analytics evidence was detected." },
    { signal: "flag-payload", pattern: /getFeatureFlagPayload|useFeatureFlagPayload|featureFlagPayloads|flag payload/i, evidence: "feature flag payload evidence was detected." },
    { signal: "flag-bootstrap", pattern: /bootstrapFlags|bootstrap\.featureFlags|bootstrap:\s*{|featureFlagPayloads/i, evidence: "flag bootstrap evidence was detected." },
    { signal: "session-recording", pattern: /session_recording|startSessionRecording|disable_session_recording|recording/i, evidence: "session recording evidence was detected." },
    { signal: "heatmaps", pattern: /heatmap|rageclick|deadclick/i, evidence: "heatmap interaction evidence was detected." },
    { signal: "surveys", pattern: /survey|useSurvey|SurveyEventName/i, evidence: "survey analytics evidence was detected." },
    { signal: "web-vitals", pattern: /web[-_ ]?vitals|reportWebVitals|CLS|LCP|INP|FID/i, evidence: "web vitals evidence was detected." }
  ];
  return analyticsReadinessSignalFromSpecs(sourceFiles, specs, "product", "signal");
}

function analyticsReadinessPackageSignals(sourceFiles: AnalyticsReadinessSourceFile[]): AnalyticsReadinessReport["packageSignals"] {
  const specs: Array<{ signal: AnalyticsReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "posthog-js", pattern: /posthog-js(?!-lite)|from ['"]posthog-js['"]|posthog-js\/react/i, evidence: "posthog-js package/import evidence was detected." },
    { signal: "posthog-js-lite", pattern: /posthog-js-lite/i, evidence: "posthog-js-lite package/import evidence was detected." },
    { signal: "posthog-node", pattern: /posthog-node/i, evidence: "posthog-node package/import evidence was detected." },
    { signal: "@posthog/react", pattern: /@posthog\/react/i, evidence: "@posthog/react package/import evidence was detected." },
    { signal: "@posthog/nextjs-config", pattern: /@posthog\/nextjs-config|@posthog\/next/i, evidence: "PostHog Next.js package/import evidence was detected." },
    { signal: "@segment/analytics-next", pattern: /@segment\/analytics-next/i, evidence: "Segment analytics package/import evidence was detected." },
    { signal: "@amplitude/analytics-browser", pattern: /@amplitude\/analytics-browser/i, evidence: "Amplitude browser analytics package/import evidence was detected." },
    { signal: "mixpanel-browser", pattern: /mixpanel-browser/i, evidence: "Mixpanel browser package/import evidence was detected." }
  ];
  return analyticsReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function analyticsReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: AnalyticsReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/analytics-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildHttpClientReadinessReport(walk: WalkResult): Promise<HttpClientReadinessReport> {
  const sourceFiles = await httpClientReadinessSourceFiles(walk);
  const httpClientSetups = httpClientReadinessSetups(sourceFiles);
  const requestSignals = httpClientReadinessRequestSignals(sourceFiles);
  const resilienceSignals = httpClientReadinessResilienceSignals(sourceFiles);
  const configurationSignals = httpClientReadinessConfigurationSignals(sourceFiles);
  const transportSignals = httpClientReadinessTransportSignals(sourceFiles);
  const errorSignals = httpClientReadinessErrorSignals(sourceFiles);
  const packageSignals = httpClientReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasGotPackage = packageSignals.some((item) => item.signal === "got" && item.readiness === "ready");
  const hasSetup = httpClientSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = httpClientSetups.some((item) => item.readiness === "ready");
  const hasRequest = requestSignals.some((item) => ["get", "post", "put-patch-delete"].includes(item.signal) && item.readiness === "ready") || httpClientSetups.some((item) => item.requestCount > 0);
  const hasTimeout = resilienceSignals.some((item) => item.signal === "timeout" && item.readiness === "ready") || httpClientSetups.some((item) => item.timeoutCount > 0);
  const hasRetry = resilienceSignals.some((item) => ["retry-limit", "retry-methods", "retry-status-codes", "retry-after"].includes(item.signal) && item.readiness === "ready") || httpClientSetups.some((item) => item.retryCount > 0);
  const hasHooks = configurationSignals.some((item) => item.signal === "hooks" && item.readiness === "ready") || httpClientSetups.some((item) => item.hookCount > 0);
  const hasErrors = errorSignals.some((item) => ["http-error", "request-error", "timeout-error", "validate-status", "catch-handling"].includes(item.signal) && item.readiness === "ready") || httpClientSetups.some((item) => item.errorCount > 0);
  const hasTransport = transportSignals.some((item) => ["agent", "http2", "proxy", "cache", "cookie-jar"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: HttpClientReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasRequest) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the HTTP client strategy before claiming HTTP client readiness.",
      why: "HTTP client readiness starts with an explicit client package, request call, base URL, timeout, retry policy, error handling, or transport configuration.",
      relatedHref: "html/http-client-readiness.html"
    });
  }
  if (hasGotPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each Got package signal with got, got.extend, request options, timeout/retry, and error handling evidence.",
      why: "Got defaults can help, but production readiness still depends on explicit request construction, bounded timeouts, retry limits, hooks, and typed response handling.",
      relatedHref: "html/http-client-readiness.html"
    });
  }
  if ((hasPackage || hasSetup || hasRequest) && !hasTimeout) {
    riskQueue.push({
      priority: "high",
      action: "Add bounded timeout options for request, connect, response, or socket phases.",
      why: "Unbounded outbound HTTP calls can hang workers, queues, routes, and UI actions under partial network failure.",
      relatedHref: "html/http-client-readiness.html"
    });
  }
  if ((hasPackage || hasSetup || hasRequest) && !hasRetry) {
    riskQueue.push({
      priority: "medium",
      action: "Document retry limits, retryable methods/status codes, backoff, and Retry-After handling.",
      why: "Retry behavior should be bounded and aligned to idempotency instead of silently multiplying side effects.",
      relatedHref: "html/http-client-readiness.html"
    });
  }
  if ((hasReadySetup || hasRequest || hasHooks || hasTransport) && !hasErrors) {
    riskQueue.push({
      priority: "medium",
      action: "Review HTTPError, RequestError, TimeoutError, validateStatus/throwHttpErrors, and catch handling.",
      why: "HTTP client failures need structured metadata so callers can distinguish remote 4xx/5xx, network failure, cancellation, and timeout.",
      relatedHref: "html/http-client-readiness.html"
    });
  }
  if (hasTransport && !hasTimeout) {
    riskQueue.push({
      priority: "medium",
      action: "Pair custom agents, proxies, caches, cookies, or HTTP/2 transport with explicit timeout policy.",
      why: "Advanced transport configuration changes connection reuse and failure behavior, so bounded timeouts become more important.",
      relatedHref: "html/http-client-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run HTTP client integration checks only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not make outbound requests, open sockets, mutate caches/cookies, follow redirects, call hooks, or run the analyzed project's tests.",
    relatedHref: "html/http-client-readiness.html"
  });

  return {
    summary: `Got식 HTTP client readiness report: setup ${httpClientSetups.length}개, request signal ${requestSignals.length}개, resilience signal ${resilienceSignals.length}개, error signal ${errorSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "got timeout retry limit methods statusCodes hooks beforeRequest afterResponse beforeRetry beforeError prefixUrl searchParams responseType throwHttpErrors HTTPError RequestError agent cache http2 pagination",
    httpClientSetups,
    requestSignals,
    resilienceSignals,
    configurationSignals,
    transportSignals,
    errorSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"got\\(|got\\.extend|axios\\.|fetch\\(|ky\\.|ofetch\\(|superagent\" src app pages packages", purpose: "Inventory outbound HTTP client packages, instances, and request call sites." },
      { command: "rg \"timeout|AbortController|AbortSignal|signal:|cancelToken|requestTimeout|connect|socket|response\" src app pages packages", purpose: "Review bounded timeout, abort, cancellation, and network phase controls." },
      { command: "rg \"retry|retry\\.limit|methods|statusCodes|maxRetryAfter|Retry-After|backoff|beforeRetry\" src app pages packages", purpose: "Check retry limits, retryable methods/statuses, backoff, and Retry-After handling." },
      { command: "rg \"hooks|beforeRequest|afterResponse|beforeError|prefixUrl|baseURL|searchParams|params|responseType|resolveBodyOnly\" src app pages packages", purpose: "Inspect client defaults, hooks, base URLs, query params, and response parsing." },
      { command: "rg \"HTTPError|RequestError|TimeoutError|throwHttpErrors|validateStatus|catch\\(|try \\{\" src app pages packages", purpose: "Inspect structured error handling and caller behavior for HTTP, request, timeout, and validation failures." },
      { command: "npx vitest run", purpose: "Run local tests that exercise request options, timeout/retry policy, error handling, and mocked HTTP clients." }
    ],
    learnerNextSteps: [
      "먼저 got, got.extend, axios, fetch, ky, ofetch, superagent 호출 위치를 찾아 어떤 외부 API가 있는지 확인하세요.",
      "timeout, AbortController, signal, cancelToken 같은 bounded wait 정책이 모든 중요한 요청에 있는지 검토하세요.",
      "retry limit, retry methods, statusCodes, maxRetryAfter, beforeRetry를 보며 idempotent 요청만 재시도되는지 확인하세요.",
      "prefixUrl/baseURL, searchParams/params, responseType, resolveBodyOnly, hooks가 API client 기본값을 안전하게 고정하는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 outbound request, socket open, redirect, cache/cookie mutation, hook execution은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type HttpClientReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function httpClientReadinessSourceFiles(walk: WalkResult): Promise<HttpClientReadinessSourceFile[]> {
  const files: HttpClientReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !httpClientReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!httpClientReadinessPathSignal(file.relPath) && !httpClientReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function httpClientReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return httpClientReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|api\.[cm]?[jt]sx?|client\.[cm]?[jt]sx?|http\.[cm]?[jt]sx?|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function httpClientReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(api|apis|client|clients|http|https|request|requests|fetch|axios|got|ky|ofetch|superagent|network|transport)(\/|\.|-|_|$)/i.test(filePath);
}

function httpClientReadinessContentSignal(text: string): boolean {
  return /(got\.extend|got\s*\(|axios\.|axios\s*\(|fetch\s*\(|ky\.|ky\s*\(|ofetch\s*\(|\$fetch\s*\(|superagent|timeout\s*:|retry\s*:|beforeRequest|afterResponse|beforeRetry|beforeError|throwHttpErrors|HTTPError|RequestError|prefixUrl|baseURL|searchParams|responseType|AbortController|AbortSignal)/i.test(text);
}

function httpClientReadinessSetups(sourceFiles: HttpClientReadinessSourceFile[]): HttpClientReadinessReport["httpClientSetups"] {
  const rows: HttpClientReadinessReport["httpClientSetups"] = [];
  for (const source of sourceFiles) {
    const requestCount = countMatches(source.text, /\bgot\s*\(|got\.(get|post|put|patch|delete|head)\s*\(|axios\s*\(|axios\.(get|post|put|patch|delete|head)\s*\(|\bfetch\s*\(|\bky\s*\(|ky\.(get|post|put|patch|delete|head)\s*\(|ofetch\s*\(|\$fetch\s*\(|superagent\.(get|post|put|patch|delete|head)\s*\(/gi);
    const timeoutCount = countMatches(source.text, /\btimeout\s*:|AbortController|AbortSignal|signal\s*:|cancelToken|requestTimeout|connect\s*:|socket\s*:|response\s*:/gi);
    const retryCount = countMatches(source.text, /\bretry\s*:|retry\.limit|statusCodes|errorCodes|maxRetryAfter|Retry-After|beforeRetry|backoff|attempts/gi);
    const hookCount = countMatches(source.text, /\bhooks\s*:|beforeRequest|afterResponse|beforeRetry|beforeError|initHooks|interceptors\.(request|response)|onRequest|onResponse/gi);
    const errorCount = countMatches(source.text, /HTTPError|RequestError|TimeoutError|CancelError|throwHttpErrors|validateStatus|catch\s*\(|try\s*{/gi);
    const hasSetupSignal = requestCount + timeoutCount + retryCount + hookCount + errorCount > 0 || /\b(Got|Axios|fetch API|HTTP client|outbound request)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: httpClientReadinessProvider(source),
      requestCount,
      timeoutCount,
      retryCount,
      hookCount,
      errorCount,
      readiness: requestCount > 0 && timeoutCount > 0 && (retryCount > 0 || errorCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains requests ${requestCount}, timeouts ${timeoutCount}, retries ${retryCount}, hooks/interceptors ${hookCount}, error handling ${errorCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function httpClientReadinessProvider(source: HttpClientReadinessSourceFile): HttpClientReadinessReport["httpClientSetups"][number]["provider"] {
  if (/\bgot\b|got\.extend|from ['"]got['"]/i.test(source.text)) return "got";
  if (/\baxios\b|axios\./i.test(source.text)) return "axios";
  if (/\bky\b|ky\./i.test(source.text)) return "ky";
  if (/\bofetch\b|\$fetch\s*\(/i.test(source.text)) return "ofetch";
  if (/superagent/i.test(source.text)) return "superagent";
  if (/\bfetch\s*\(|AbortController|AbortSignal/i.test(source.text)) return "fetch";
  if (/\b(http client|outbound request|api client)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function httpClientReadinessRequestSignals(sourceFiles: HttpClientReadinessSourceFile[]): HttpClientReadinessReport["requestSignals"] {
  const specs: Array<{ signal: HttpClientReadinessReport["requestSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get", pattern: /\.(get|head)\s*\(|method\s*:\s*['"](GET|HEAD)['"]|\bfetch\s*\(/i, evidence: "GET/HEAD request evidence was detected." },
    { signal: "post", pattern: /\.post\s*\(|method\s*:\s*['"]POST['"]|got\.post|axios\.post/i, evidence: "POST request evidence was detected." },
    { signal: "put-patch-delete", pattern: /\.(put|patch|delete)\s*\(|method\s*:\s*['"](PUT|PATCH|DELETE)['"]/i, evidence: "PUT/PATCH/DELETE request evidence was detected." },
    { signal: "json-body", pattern: /\bjson\s*:|\.json<|\.json\s*\(|JSON\.stringify|Content-Type['"]?\s*:\s*['"]application\/json/i, evidence: "JSON request or response evidence was detected." },
    { signal: "form-body", pattern: /\bform\s*:|formData|FormData|multipart|urlencoded|body-parser/i, evidence: "form or multipart body evidence was detected." },
    { signal: "query-params", pattern: /searchParams|params\s*:|URLSearchParams|query\s*:/i, evidence: "query/search parameter evidence was detected." },
    { signal: "base-url", pattern: /prefixUrl|baseURL|baseUrl|new URL\(|API_BASE|PUBLIC_API|api_host/i, evidence: "base URL evidence was detected." }
  ];
  return httpClientReadinessSignalFromSpecs(sourceFiles, specs, "request", "signal");
}

function httpClientReadinessResilienceSignals(sourceFiles: HttpClientReadinessSourceFile[]): HttpClientReadinessReport["resilienceSignals"] {
  const specs: Array<{ signal: HttpClientReadinessReport["resilienceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "timeout", pattern: /\btimeout\s*:|requestTimeout|connect\s*:|socket\s*:|response\s*:|read\s*:/i, evidence: "timeout evidence was detected." },
    { signal: "retry-limit", pattern: /\bretry\s*:|retry\.limit|limit\s*:|attempts|retries/i, evidence: "retry limit evidence was detected." },
    { signal: "retry-methods", pattern: /methods\s*:|retryMethods|allowedMethods|idempotent/i, evidence: "retry method policy evidence was detected." },
    { signal: "retry-status-codes", pattern: /statusCodes|statusCode|retryStatusCodes|429|500|502|503|504/i, evidence: "retry status code evidence was detected." },
    { signal: "retry-after", pattern: /maxRetryAfter|Retry-After|retryAfter/i, evidence: "Retry-After evidence was detected." },
    { signal: "abort-signal", pattern: /AbortController|AbortSignal|signal\s*:|cancelToken|CancelToken/i, evidence: "abort/cancel signal evidence was detected." },
    { signal: "throw-http-errors", pattern: /throwHttpErrors|validateStatus|ok\s*=>|response\.ok/i, evidence: "HTTP status validation evidence was detected." }
  ];
  return httpClientReadinessSignalFromSpecs(sourceFiles, specs, "resilience", "signal");
}

function httpClientReadinessConfigurationSignals(sourceFiles: HttpClientReadinessSourceFile[]): HttpClientReadinessReport["configurationSignals"] {
  const specs: Array<{ signal: HttpClientReadinessReport["configurationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prefix-url", pattern: /prefixUrl|baseURL|baseUrl/i, evidence: "base/prefix URL configuration evidence was detected." },
    { signal: "headers", pattern: /headers\s*:|Authorization|user-agent|User-Agent|Content-Type/i, evidence: "header configuration evidence was detected." },
    { signal: "search-params", pattern: /searchParams|params\s*:|URLSearchParams/i, evidence: "search/query parameter configuration evidence was detected." },
    { signal: "response-type", pattern: /responseType|parseJson|arrayBuffer|blob|buffer|text\(\)/i, evidence: "response type/parsing evidence was detected." },
    { signal: "resolve-body-only", pattern: /resolveBodyOnly|\.json<|\.json\s*\(/i, evidence: "body-only response evidence was detected." },
    { signal: "hooks", pattern: /\bhooks\s*:|beforeRequest|afterResponse|beforeRetry|beforeError|interceptors\.(request|response)|onRequest|onResponse/i, evidence: "hooks or interceptor evidence was detected." },
    { signal: "extend-instance", pattern: /got\.extend|axios\.create|ky\.create|ofetch\.create|superagent\.agent/i, evidence: "client instance/defaults evidence was detected." }
  ];
  return httpClientReadinessSignalFromSpecs(sourceFiles, specs, "configuration", "signal");
}

function httpClientReadinessTransportSignals(sourceFiles: HttpClientReadinessSourceFile[]): HttpClientReadinessReport["transportSignals"] {
  const specs: Array<{ signal: HttpClientReadinessReport["transportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "agent", pattern: /\bagent\s*:|httpAgent|httpsAgent|keepAlive|Agent\(/i, evidence: "HTTP agent evidence was detected." },
    { signal: "http2", pattern: /http2|HTTP\/2|h2c|http2-wrapper/i, evidence: "HTTP/2 evidence was detected." },
    { signal: "proxy", pattern: /proxy|ProxyAgent|HTTPS?_PROXY|NO_PROXY/i, evidence: "proxy evidence was detected." },
    { signal: "cache", pattern: /\bcache\s*:|cacheable-request|Keyv|cacheOptions/i, evidence: "HTTP cache evidence was detected." },
    { signal: "cookie-jar", pattern: /cookieJar|tough-cookie|CookieJar|withCredentials|credentials\s*:/i, evidence: "cookie or credentials evidence was detected." },
    { signal: "decompress", pattern: /decompress|gzip|brotli|zstd|deflate/i, evidence: "decompression evidence was detected." },
    { signal: "unix-socket", pattern: /enableUnixSockets|unixSocket|socketPath/i, evidence: "Unix socket evidence was detected." }
  ];
  return httpClientReadinessSignalFromSpecs(sourceFiles, specs, "transport", "signal");
}

function httpClientReadinessErrorSignals(sourceFiles: HttpClientReadinessSourceFile[]): HttpClientReadinessReport["errorSignals"] {
  const specs: Array<{ signal: HttpClientReadinessReport["errorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "http-error", pattern: /HTTPError|AxiosError|response\.status|statusCode|throwHttpErrors/i, evidence: "HTTP status error evidence was detected." },
    { signal: "request-error", pattern: /RequestError|ECONNRESET|ENOTFOUND|EAI_AGAIN|network error/i, evidence: "request/network error evidence was detected." },
    { signal: "timeout-error", pattern: /TimeoutError|ETIMEDOUT|timeout/i, evidence: "timeout error evidence was detected." },
    { signal: "cancel-error", pattern: /CancelError|AbortError|ERR_CANCELED|cancelToken|aborted/i, evidence: "cancel/abort error evidence was detected." },
    { signal: "metadata", pattern: /timings|requestUrl|options|retryCount|response\.headers|error\.response/i, evidence: "error metadata evidence was detected." },
    { signal: "validate-status", pattern: /validateStatus|throwHttpErrors|response\.ok|ok\s*=>/i, evidence: "status validation evidence was detected." },
    { signal: "catch-handling", pattern: /catch\s*\(|try\s*{|finally\s*\(/i, evidence: "caller error handling evidence was detected." }
  ];
  return httpClientReadinessSignalFromSpecs(sourceFiles, specs, "error", "signal");
}

function httpClientReadinessPackageSignals(sourceFiles: HttpClientReadinessSourceFile[]): HttpClientReadinessReport["packageSignals"] {
  const specs: Array<{ signal: HttpClientReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "got", pattern: /"got"|from ['"]got['"]|got\.extend/i, evidence: "got package/import evidence was detected." },
    { signal: "axios", pattern: /"axios"|from ['"]axios['"]|axios\./i, evidence: "axios package/import evidence was detected." },
    { signal: "ky", pattern: /"ky"|from ['"]ky['"]|ky\./i, evidence: "ky package/import evidence was detected." },
    { signal: "ofetch", pattern: /"ofetch"|from ['"]ofetch['"]|\$fetch\s*\(/i, evidence: "ofetch package/import evidence was detected." },
    { signal: "node-fetch", pattern: /"node-fetch"|from ['"]node-fetch['"]/i, evidence: "node-fetch package/import evidence was detected." },
    { signal: "undici", pattern: /"undici"|from ['"]undici['"]|undici\./i, evidence: "undici package/import evidence was detected." },
    { signal: "superagent", pattern: /"superagent"|from ['"]superagent['"]|superagent\./i, evidence: "superagent package/import evidence was detected." }
  ];
  return httpClientReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function httpClientReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: HttpClientReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/http-client-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSchemaValidationReadinessReport(walk: WalkResult): Promise<SchemaValidationReadinessReport> {
  const sourceFiles = await schemaValidationReadinessSourceFiles(walk);
  const schemaSetups = schemaValidationReadinessSetups(sourceFiles);
  const shapeSignals = schemaValidationReadinessShapeSignals(sourceFiles);
  const parserSignals = schemaValidationReadinessParserSignals(sourceFiles);
  const typeSignals = schemaValidationReadinessTypeSignals(sourceFiles);
  const refinementSignals = schemaValidationReadinessRefinementSignals(sourceFiles);
  const errorSignals = schemaValidationReadinessErrorSignals(sourceFiles);
  const integrationSignals = schemaValidationReadinessIntegrationSignals(sourceFiles);
  const zodSignals = schemaValidationReadinessZodSignals(sourceFiles);
  const valibotSignals = schemaValidationReadinessValibotSignals(sourceFiles);
  const packageSignals = schemaValidationReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasZodPackage = packageSignals.some((item) => item.signal === "zod" && item.readiness === "ready");
  const hasValibotPackage = packageSignals.some((item) => item.signal === "valibot" && item.readiness === "ready");
  const hasSetup = schemaSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = schemaSetups.some((item) => item.readiness === "ready");
  const hasSchema = schemaSetups.some((item) => item.schemaCount > 0) || shapeSignals.some((item) => item.readiness === "ready");
  const hasParser = parserSignals.some((item) => ["parse", "safe-parse", "parse-async", "safe-parse-async", "decode", "validate"].includes(item.signal) && item.readiness === "ready");
  const hasSafeParser = parserSignals.some((item) => ["safe-parse", "safe-parse-async"].includes(item.signal) && item.readiness === "ready");
  const hasTypes = typeSignals.some((item) => ["infer", "input-output", "standard-schema", "json-schema"].includes(item.signal) && item.readiness === "ready");
  const hasRefinements = refinementSignals.some((item) => item.readiness === "ready");
  const hasErrors = errorSignals.some((item) => ["zod-error", "issues", "format", "flatten", "treeify", "prettify", "custom-error-map"].includes(item.signal) && item.readiness === "ready") || schemaSetups.some((item) => item.errorCount > 0);
  const hasIntegration = integrationSignals.some((item) => item.readiness === "ready");

  const riskQueue: SchemaValidationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasSchema) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the runtime schema validation strategy before claiming validation readiness.",
      why: "Schema validation readiness starts with explicit schemas, parser calls, input boundaries, error handling, or validation package evidence.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  if (hasZodPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Zod package evidence with concrete schemas, parser calls, error handling, and boundary usage.",
      why: "A schema package in dependencies does not prove that untrusted input is parsed before use or that validation failures are handled.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  if (hasValibotPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Valibot package evidence with concrete v.object/v.pipe schemas, parser calls, issue handling, and boundary usage.",
      why: "A Valibot package in dependencies does not prove that untrusted input is parsed before use or that validation issues are handled.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup || hasSchema) && !hasParser) {
    riskQueue.push({
      priority: "high",
      action: "Add parse, safeParse, parseAsync, decode, validate, or assert call-site evidence at input boundaries.",
      why: "Schemas that are only declared do not protect route params, env values, forms, API payloads, or external data unless the boundary invokes them.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  if (hasParser && !hasSafeParser && !hasErrors) {
    riskQueue.push({
      priority: "medium",
      action: "Review thrown parse errors, safeParse branches, ZodError issues, and formatted error responses.",
      why: "Validation failures need deterministic user/API feedback instead of uncaught exceptions or opaque 500 responses.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  if (hasRefinements && !hasErrors) {
    riskQueue.push({
      priority: "medium",
      action: "Pair custom refinements and transforms with explicit error messages and tests.",
      why: "Custom validation logic is where business rules and coercion drift usually appear, so errors need names, paths, and coverage.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  if (hasReadySetup && !hasTypes) {
    riskQueue.push({
      priority: "low",
      action: "Link runtime schemas to static types with z.infer, v.InferInput/v.InferOutput, Standard Schema, JSON Schema, or OpenAPI exports.",
      why: "Runtime validation is easier to maintain when inferred types and generated contracts stay close to the schema definition.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  if (hasSetup && !hasIntegration) {
    riskQueue.push({
      priority: "low",
      action: "Check whether schemas are wired to env, API, form, tRPC, database, or JSON Schema/OpenAPI boundaries.",
      why: "Schema libraries deliver the most value when they guard real ingress and contract surfaces instead of isolated helper files.",
      relatedHref: "html/schema-validation-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run validator behavior tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not execute schemas, parsers, async refinements, transforms, coercions, user-supplied validation logic, or the analyzed project's tests.",
    relatedHref: "html/schema-validation-readiness.html"
  });

  return {
    summary: `Zod/Valibot식 schema validation readiness report: setup ${schemaSetups.length}개, shape signal ${shapeSignals.length}개, parser signal ${parserSignals.length}개, Zod signal ${zodSignals.filter((item) => item.readiness === "ready").length}개, Valibot signal ${valibotSignals.length}개, error signal ${errorSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "z.object z.array z.union z.discriminatedUnion parse safeParse parseAsync safeParseAsync z.infer z.input z.output refine superRefine transform preprocess coerce ZodError flatten treeifyError toJSONSchema zod/v4 zod/mini globalRegistry register meta describe codec decode encode prefault readonly templateLiteral stringbool; Valibot v.object v.pipe v.variant v.picklist parse safeParse parser safeParser InferInput InferOutput InferIssue ValiError issues flatten forward partialCheck rawCheck metadata @valibot/to-json-schema zod-to-valibot Standard Schema",
    schemaSetups,
    shapeSignals,
    parserSignals,
    typeSignals,
    refinementSignals,
    errorSignals,
    integrationSignals,
    zodSignals,
    valibotSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"z\\.object|z\\.array|z\\.union|z\\.discriminatedUnion|z\\.enum|z\\.literal|z\\.record\" src app packages", purpose: "Inventory schema definitions and shape composition." },
      { command: "rg \"from ['\\\"]valibot['\\\"]|v\\.object|v\\.pipe|v\\.variant|v\\.picklist|v\\.parse|v\\.safeParse|v\\.InferOutput\" src app packages", purpose: "Inventory Valibot schemas, parser calls, discriminated variants, and inferred output types." },
      { command: "rg \"\\.parse\\(|\\.safeParse\\(|\\.parseAsync\\(|\\.safeParseAsync\\(|decode\\(|validate\\(\" src app packages", purpose: "Find input-boundary parser and validator call sites." },
      { command: "rg \"z\\.infer|z\\.input|z\\.output|InferInput|InferOutput|InferIssue|StandardSchema|toJSONSchema|to-json-schema|openapi\" src app packages", purpose: "Check runtime-to-static type and contract generation links." },
      { command: "rg \"refine|superRefine|transform|preprocess|coerce|partialCheck|rawCheck|forward|metadata|\\.default\\(|\\.catch\\(|\\.pipe\\(|codec\" src app packages", purpose: "Review custom rules, coercion, transforms, defaults, and pipeline behavior." },
      { command: "rg \"ZodError|ValiError|issues|format\\(|flatten\\(|treeifyError|prettifyError|errorMap\" src app packages", purpose: "Inspect validation failure reporting and user/API error shaping." },
      { command: "rg \"zod/v4|zod/mini|globalRegistry|\\.register\\(|\\.meta\\(|\\.describe\\(|toJSONSchema|z\\.codec|z\\.decode|z\\.encode|\\.prefault\\(|\\.readonly\\(|z\\.templateLiteral|z\\.stringbool\" src app packages", purpose: "Map Zod 4 imports, metadata registries, native JSON Schema, codecs, prefaults, readonly schemas, template literals, and stringbool parsing." },
      { command: "npx vitest run", purpose: "Run local tests that exercise schema parsing, invalid inputs, error output, and integration boundaries." }
    ],
    learnerNextSteps: [
      "먼저 z.object/z.array/z.union 또는 Valibot v.object/v.pipe/v.variant 같은 schema shape가 어디에 모여 있는지 확인하세요.",
      "parse와 safeParse 호출 위치를 찾아 env, API payload, route params, form input, external data 같은 ingress boundary를 실제로 막는지 확인하세요.",
      "Zod 4를 쓰면 zod/v4 또는 zod/mini import, registry/meta/describe metadata, native toJSONSchema, codec decode/encode, prefault, readonly, templateLiteral, stringbool 신호를 별도로 확인하세요.",
      "Valibot을 쓰면 v.InferInput/v.InferOutput, v.flatten, v.forward, v.partialCheck, v.rawCheck, metadata, @valibot/to-json-schema 연결을 같이 보세요.",
      "refine, superRefine, transform, preprocess, coerce, partialCheck, rawCheck, default, catch는 비즈니스 규칙과 타입 변환이 숨어 있으므로 오류 메시지와 테스트를 같이 확인하세요.",
      "ZodError 또는 ValiError issues, format, flatten, treeifyError, prettifyError가 사용자/API 응답으로 어떻게 바뀌는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 validator 실행, async refinement, transform, coercion, 프로젝트 테스트는 안전한 로컬 환경에서 별도로 확인하세요."
    ]
  };
}

type SchemaValidationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function schemaValidationReadinessSourceFiles(walk: WalkResult): Promise<SchemaValidationReadinessSourceFile[]> {
  const files: SchemaValidationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !schemaValidationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!schemaValidationReadinessPathSignal(file.relPath) && !schemaValidationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function schemaValidationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return schemaValidationReadinessPathSignal(filePath)
    || /^(package\.json|schema\.[cm]?[jt]sx?|schemas\.[cm]?[jt]sx?|validation\.[cm]?[jt]sx?|validator\.[cm]?[jt]sx?|env\.[cm]?[jt]sx?|api\.[cm]?[jt]sx?|form\.[cm]?[jt]sx?|route\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function schemaValidationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(schema|schemas|validation|validations|validator|validators|zod|yup|ajv|joi|valibot|arktype|io-ts|contract|contracts|dto|dtos|env|forms?|api|routes?)(\/|\.|-|_|$)/i.test(filePath);
}

function schemaValidationReadinessContentSignal(text: string): boolean {
  return /(from ['"]zod['"]|require\(['"]zod['"]\)|\bz\.(object|array|string|number|boolean|enum|union|discriminatedUnion|literal|record|tuple|intersection|lazy|strictObject|looseObject|coerce)|from ['"]valibot['"]|require\(['"]valibot['"]\)|from ['"]@valibot\/to-json-schema['"]|@valibot\/to-json-schema|\bv\.(object|array|string|number|boolean|pipe|variant|picklist|parse|safeParse|parser|safeParser|InferInput|InferOutput|InferIssue|flatten|forward|partialCheck|rawCheck|metadata)|\.parse\s*\(|\.safeParse\s*\(|\.parseAsync\s*\(|\.safeParseAsync\s*\(|z\.infer|z\.input|z\.output|ZodError|ValiError|treeifyError|prettifyError|toJSONSchema|to-json-schema|StandardSchema|standard-schema|superRefine|refine\s*\(|preprocess|zodResolver|drizzle-zod|zod-to-json-schema|zod-to-valibot|new Ajv|ajv\.compile|yup\.)/i.test(text);
}

function schemaValidationReadinessSetups(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["schemaSetups"] {
  const rows: SchemaValidationReadinessReport["schemaSetups"] = [];
  for (const source of sourceFiles) {
    const schemaCount = countMatches(source.text, /\bz\.(object|array|string|number|boolean|bigint|date|enum|nativeEnum|union|discriminatedUnion|literal|record|map|set|tuple|intersection|lazy|strictObject|looseObject|custom|instanceof)\s*\(|\byup\.(object|string|number|array|boolean|date)\s*\(|new Ajv\s*\(|ajv\.compile\s*\(|Joi\.(object|string|number|array|boolean)\s*\(|\bv\.(object|strictObject|looseObject|string|number|boolean|array|union|variant|literal|record|tuple|picklist)\s*\(/gi);
    const parseCount = countMatches(source.text, /\.(parse|parseAsync)\s*\(|\bz\.parse\s*\(|\bv\.(parse|parseAsync|parser|parserAsync)\s*\(|\bdecode\s*\(|\bvalidate\s*\(|\bassert\s*\(/gi);
    const safeParseCount = countMatches(source.text, /\.safeParse(Async)?\s*\(|safeParseAsync\s*\(|\bv\.(safeParse|safeParseAsync|safeParser|safeParserAsync)\s*\(/gi);
    const refinementCount = countMatches(source.text, /\.refine\s*\(|\.superRefine\s*\(|\.check\s*\(|\bv\.(check|partialCheck|rawCheck|email|minLength|maxLength|regex|uuid|url|nonEmpty)\s*\(|\.min\s*\(|\.max\s*\(|\.email\s*\(|\.url\s*\(|\.regex\s*\(/gi);
    const transformCount = countMatches(source.text, /\.transform\s*\(|\.preprocess\s*\(|\bz\.coerce\.|\.pipe\s*\(|\.codec\s*\(|\.default\s*\(|\.catch\s*\(/gi);
    const errorCount = countMatches(source.text, /ZodError|ValiError|\.issues\b|result\.issues|\.format\s*\(|\.flatten\s*\(|\bv\.flatten\s*\(|treeifyError|prettifyError|errorMap|invalid_type_error|required_error|catch\s*\(/gi);
    const hasSetupSignal = schemaCount + parseCount + safeParseCount + refinementCount + transformCount + errorCount > 0 || /\b(schema validation|runtime validation|validator|validated input)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: schemaValidationReadinessProvider(source),
      schemaCount,
      parseCount,
      safeParseCount,
      refinementCount,
      transformCount,
      errorCount,
      readiness: schemaCount > 0 && (parseCount > 0 || safeParseCount > 0) && errorCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains schemas ${schemaCount}, parse calls ${parseCount}, safeParse calls ${safeParseCount}, refinements ${refinementCount}, transforms/coercions ${transformCount}, error handling ${errorCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function schemaValidationReadinessProvider(source: SchemaValidationReadinessSourceFile): SchemaValidationReadinessReport["schemaSetups"][number]["provider"] {
  if (/from ['"]zod['"]|require\(['"]zod['"]\)|\bz\.(object|array|string|number|enum|union|coerce)|ZodError/i.test(source.text)) return "zod";
  if (/\byup\.|from ['"]yup['"]|require\(['"]yup['"]\)/i.test(source.text)) return "yup";
  if (/new Ajv|ajv\.compile|from ['"]ajv['"]|require\(['"]ajv['"]\)/i.test(source.text)) return "ajv";
  if (/\bJoi\.|from ['"]joi['"]|require\(['"]joi['"]\)/i.test(source.text)) return "joi";
  if (/\bv\.(object|string|number|array|pipe|variant|parse|safeParse)|from ['"]valibot['"]|require\(['"]valibot['"]\)|@valibot\/to-json-schema|ValiError/i.test(source.text)) return "valibot";
  if (/type\s*\(|from ['"]arktype['"]|require\(['"]arktype['"]\)/i.test(source.text)) return "arktype";
  if (/from ['"]io-ts['"]|require\(['"]io-ts['"]\)|\bt\.type\s*\(|\bt\.exact\s*\(/i.test(source.text)) return "io-ts";
  if (/\b(schema validation|runtime validation|validator|validated input)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function schemaValidationReadinessShapeSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["shapeSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["shapeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "object", pattern: /\bz\.(object|strictObject|looseObject)\s*\(|\byup\.object\s*\(|Joi\.object\s*\(|\bv\.(object|strictObject|looseObject|objectWithRest)\s*\(/i, evidence: "object schema evidence was detected." },
    { signal: "array", pattern: /\bz\.array\s*\(|\.array\s*\(|\bv\.array\s*\(|array\(/i, evidence: "array schema evidence was detected." },
    { signal: "union", pattern: /\bz\.union\s*\(|\.or\s*\(|\.union\s*\(|\bv\.union\s*\(/i, evidence: "union schema evidence was detected." },
    { signal: "discriminated-union", pattern: /discriminatedUnion|discriminator|taggedUnion|\bv\.variant\s*\(/i, evidence: "discriminated union evidence was detected." },
    { signal: "enum", pattern: /\bz\.(enum|nativeEnum)\s*\(|\.oneOf\s*\(|Joi\.valid\s*\(|\bv\.(enum|enum_|picklist)\s*\(/i, evidence: "enum/oneOf evidence was detected." },
    { signal: "literal", pattern: /\bz\.literal\s*\(|\bv\.literal\s*\(|literal\s*\(/i, evidence: "literal schema evidence was detected." },
    { signal: "record", pattern: /\bz\.record\s*\(|\.record\s*\(|\bv\.record\s*\(|record\(/i, evidence: "record/map schema evidence was detected." },
    { signal: "optional-nullable", pattern: /\.optional\s*\(|\.nullable\s*\(|\.nullish\s*\(|\.required\s*\(|\bv\.(optional|nullable|nullish|nonOptional)\s*\(/i, evidence: "optional/nullable/required evidence was detected." },
    { signal: "strict-passthrough", pattern: /\.strict\s*\(|\.passthrough\s*\(|\.strip\s*\(|\.catchall\s*\(|unknownKeys|\bv\.(strictObject|looseObject|objectWithRest)\s*\(/i, evidence: "strict/passthrough/unknown-key policy evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "shape", "signal");
}

function schemaValidationReadinessParserSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["parserSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["parserSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "parse", pattern: /\.parse\s*\(|\bz\.parse\s*\(|\bv\.parse\s*\(|\bv\.parser\s*\(/i, evidence: "parse call evidence was detected." },
    { signal: "safe-parse", pattern: /\.safeParse\s*\(|\bv\.safeParse\s*\(|\bv\.safeParser\s*\(/i, evidence: "safeParse call evidence was detected." },
    { signal: "parse-async", pattern: /\.parseAsync\s*\(|\bv\.parseAsync\s*\(|\bv\.parserAsync\s*\(/i, evidence: "parseAsync call evidence was detected." },
    { signal: "safe-parse-async", pattern: /\.safeParseAsync\s*\(|\.spa\s*\(|\bv\.safeParseAsync\s*\(|\bv\.safeParserAsync\s*\(/i, evidence: "safeParseAsync call evidence was detected." },
    { signal: "decode", pattern: /\.decode\s*\(|decodeUnknown|decodeSync/i, evidence: "decode call evidence was detected." },
    { signal: "validate", pattern: /\.validate\s*\(|validateSync|ajv\.validate|validator\.validate/i, evidence: "validate call evidence was detected." },
    { signal: "assert", pattern: /\.assert\s*\(|asserts\s+|assertSchema|assertValid/i, evidence: "assertion validation evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "parser", "signal");
}

function schemaValidationReadinessTypeSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["typeSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["typeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "infer", pattern: /z\.infer\s*<|InferType|TypeOf|Static<typeof|Infer(Input|Output|Issue)\s*</i, evidence: "schema-to-type inference evidence was detected." },
    { signal: "input-output", pattern: /z\.(input|output)\s*<|_input|_output|InputOf|OutputOf|Infer(Input|Output)\s*</i, evidence: "separate input/output type evidence was detected." },
    { signal: "branded", pattern: /\.brand\s*<|brand\s*\(|Branded|opaque/i, evidence: "branded/opaque type evidence was detected." },
    { signal: "standard-schema", pattern: /StandardSchema|Standard Schema|~standard|standard-schema/i, evidence: "Standard Schema evidence was detected." },
    { signal: "json-schema", pattern: /toJSONSchema|to-json-schema|from-json-schema|jsonSchema|JSON Schema|zod-to-json-schema|@valibot\/to-json-schema/i, evidence: "JSON Schema conversion evidence was detected." },
    { signal: "openapi", pattern: /openapi|OpenAPI|swagger|zod-openapi|zod-to-openapi/i, evidence: "OpenAPI export evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "type", "signal");
}

function schemaValidationReadinessRefinementSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["refinementSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["refinementSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "refine", pattern: /\.refine\s*\(|\.check\s*\(|\bv\.(check|partialCheck|rawCheck)\s*\(/i, evidence: "refine/check evidence was detected." },
    { signal: "super-refine", pattern: /\.superRefine\s*\(|ctx\.addIssue/i, evidence: "superRefine/addIssue evidence was detected." },
    { signal: "transform", pattern: /\.transform\s*\(|\.overwrite\s*\(|\bv\.(transform|rawTransform)\s*\(/i, evidence: "transform evidence was detected." },
    { signal: "preprocess", pattern: /\.preprocess\s*\(|z\.preprocess\s*\(/i, evidence: "preprocess evidence was detected." },
    { signal: "coerce", pattern: /z\.coerce\.|coerce\s*:/i, evidence: "coercion evidence was detected." },
    { signal: "default-catch", pattern: /\.default\s*\(|\.catch\s*\(|\.prefault\s*\(/i, evidence: "default/catch fallback evidence was detected." },
    { signal: "pipe-codec", pattern: /\.pipe\s*\(|\.codec\s*\(|z\.codec\s*\(|\bv\.(pipe|parser|safeParser)\s*\(/i, evidence: "pipe/codec evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "refinement", "signal");
}

function schemaValidationReadinessErrorSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["errorSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["errorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zod-error", pattern: /ZodError|ValiError|ValidationError|AjvError/i, evidence: "validation error class evidence was detected." },
    { signal: "issues", pattern: /\.issues\b|result\.issues|issue\.path|issue\.message|ctx\.addIssue/i, evidence: "issue list evidence was detected." },
    { signal: "format", pattern: /\.format\s*\(|formatError|formattedError/i, evidence: "formatted error evidence was detected." },
    { signal: "flatten", pattern: /\.flatten\s*\(|\bv\.flatten\s*\(|flattenError|fieldErrors|formErrors/i, evidence: "flattened error evidence was detected." },
    { signal: "treeify", pattern: /treeifyError|treeify|nestedErrors/i, evidence: "treeified error evidence was detected." },
    { signal: "prettify", pattern: /prettifyError|prettify|prettyError/i, evidence: "pretty error evidence was detected." },
    { signal: "custom-error-map", pattern: /errorMap|setErrorMap|invalid_type_error|required_error|message\s*:/i, evidence: "custom validation message evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "error", "signal");
}

function schemaValidationReadinessIntegrationSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["integrationSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["integrationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "env-validation", pattern: /process\.env|import\.meta\.env|envSchema|createEnv|envalid|dotenv|PUBLIC_/i, evidence: "environment validation evidence was detected." },
    { signal: "api-validation", pattern: /Request|Response|req\.body|request\.json|params|searchParams|route|router|endpoint|middleware/i, evidence: "API/request boundary evidence was detected." },
    { signal: "form-validation", pattern: /zodResolver|react-hook-form|useForm|FormData|formSchema|fieldErrors/i, evidence: "form validation evidence was detected." },
    { signal: "trpc", pattern: /\btrpc\b|t\.procedure|publicProcedure|input\s*\(/i, evidence: "tRPC validation evidence was detected." },
    { signal: "react-hook-form", pattern: /@hookform\/resolvers|zodResolver|yupResolver|react-hook-form/i, evidence: "React Hook Form resolver evidence was detected." },
    { signal: "drizzle-zod", pattern: /drizzle-zod|createInsertSchema|createSelectSchema/i, evidence: "drizzle-zod schema bridge evidence was detected." },
    { signal: "json-schema-export", pattern: /toJSONSchema|to-json-schema|@valibot\/to-json-schema|zod-to-json-schema|openapi|OpenAPI|swagger/i, evidence: "JSON Schema/OpenAPI export evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "integration", "signal");
}

function schemaValidationReadinessZodSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["zodSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["zodSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zod-v4-import", pattern: /from ['"]zod\/v4['"]|require\(['"]zod\/v4['"]\)|from ['"]zod['"]|require\(['"]zod['"]\)/i, evidence: "Zod 4/root import evidence was detected." },
    { signal: "zod-mini-import", pattern: /from ['"]zod\/(v4-)?mini['"]|from ['"]zod\/v4\/mini['"]|require\(['"]zod\/(v4-)?mini['"]\)|require\(['"]zod\/v4\/mini['"]\)/i, evidence: "Zod Mini import evidence was detected." },
    { signal: "strict-object", pattern: /z\.strictObject\s*\(|\.strict\s*\(/i, evidence: "strict object evidence was detected." },
    { signal: "loose-object", pattern: /z\.looseObject\s*\(|\.passthrough\s*\(/i, evidence: "loose/passthrough object evidence was detected." },
    { signal: "catchall", pattern: /\.catchall\s*\(/i, evidence: "catchall object key policy evidence was detected." },
    { signal: "template-literal", pattern: /z\.templateLiteral\s*\(/i, evidence: "template literal schema evidence was detected." },
    { signal: "stringbool", pattern: /z\.stringbool\s*\(/i, evidence: "stringbool parsing evidence was detected." },
    { signal: "codec", pattern: /z\.codec\s*\(|\.codec\s*\(/i, evidence: "codec schema evidence was detected." },
    { signal: "decode", pattern: /z\.decode(Async)?\s*\(|\.decode(Async)?\s*\(/i, evidence: "decode evidence was detected." },
    { signal: "encode", pattern: /z\.encode(Async)?\s*\(|\.encode(Async)?\s*\(/i, evidence: "encode evidence was detected." },
    { signal: "prefault", pattern: /\.prefault\s*\(/i, evidence: "prefault input default evidence was detected." },
    { signal: "readonly", pattern: /\.readonly\s*\(|z\.readonly\s*\(/i, evidence: "readonly schema evidence was detected." },
    { signal: "registry", pattern: /new\s+z\.\$?ZodRegistry|z\.registry\s*\(|\.register\s*\(/i, evidence: "Zod registry evidence was detected." },
    { signal: "global-registry", pattern: /z\.globalRegistry|globalRegistry/i, evidence: "global registry evidence was detected." },
    { signal: "meta", pattern: /\.meta\s*\(|z\.meta\s*\(/i, evidence: "metadata evidence was detected." },
    { signal: "describe", pattern: /\.describe\s*\(/i, evidence: "description metadata evidence was detected." },
    { signal: "native-json-schema", pattern: /z\.toJSONSchema\s*\(|\.toJSONSchema\s*\(|toJSONSchema/i, evidence: "native JSON Schema conversion evidence was detected." },
    { signal: "json-schema-io", pattern: /io\s*:\s*["'](?:input|output)["']|target\s*:\s*["']draft-7["']|draft-2020-12/i, evidence: "JSON Schema input/output or target option evidence was detected." },
    { signal: "json-schema-registry", pattern: /registry\s*:\s*[^,}]+|reused\s*:\s*["']ref["']|cycles\s*:\s*["'](?:ref|throw)["']/i, evidence: "JSON Schema registry/ref/cycle option evidence was detected." },
    { signal: "error-param", pattern: /error\s*:\s*(?:["'({]|[a-zA-Z_$])|errorMap|setErrorMap/i, evidence: "unified error customization evidence was detected." },
    { signal: "treeify-error", pattern: /z\.treeifyError\s*\(|treeifyError/i, evidence: "treeifyError evidence was detected." },
    { signal: "flatten-error", pattern: /z\.flattenError\s*\(|flattenError|\.flatten\s*\(/i, evidence: "flattenError evidence was detected." },
    { signal: "prettify-error", pattern: /z\.prettifyError\s*\(|prettifyError/i, evidence: "prettifyError evidence was detected." },
    { signal: "pipe", pattern: /\.pipe\s*\(|z\.pipe\s*\(/i, evidence: "pipe composition evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "zod", "signal");
}

function schemaValidationReadinessValibotSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["valibotSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["valibotSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "v-object", pattern: /\bv\.(object|strictObject|looseObject|objectWithRest)\s*\(/i, evidence: "Valibot object schema evidence was detected." },
    { signal: "v-pipe", pattern: /\bv\.pipe\s*\(/i, evidence: "Valibot pipe composition evidence was detected." },
    { signal: "v-variant", pattern: /\bv\.variant\s*\(/i, evidence: "Valibot variant discriminator evidence was detected." },
    { signal: "v-picklist", pattern: /\bv\.(picklist|enum|enum_)\s*\(/i, evidence: "Valibot picklist/enum evidence was detected." },
    { signal: "v-parser", pattern: /\bv\.(parse|parseAsync|parser|parserAsync)\s*\(/i, evidence: "Valibot parser evidence was detected." },
    { signal: "v-safe-parser", pattern: /\bv\.(safeParse|safeParseAsync|safeParser|safeParserAsync)\s*\(/i, evidence: "Valibot safe parser evidence was detected." },
    { signal: "v-infer-output", pattern: /\bInfer(Input|Output|Issue)\s*<|v\.Infer(Input|Output|Issue)\s*</i, evidence: "Valibot InferInput/InferOutput/InferIssue evidence was detected." },
    { signal: "v-issues", pattern: /ValiError|\.issues\b|result\.issues|Issue\b/i, evidence: "Valibot issue evidence was detected." },
    { signal: "v-flatten", pattern: /\bv\.flatten\s*\(|flatten\s*\([^)]*issues/i, evidence: "Valibot flatten evidence was detected." },
    { signal: "v-forward", pattern: /\bv\.forward\s*\(/i, evidence: "Valibot forward issue-path evidence was detected." },
    { signal: "v-partial-check", pattern: /\bv\.partialCheck(Async)?\s*\(/i, evidence: "Valibot partialCheck evidence was detected." },
    { signal: "v-raw-check", pattern: /\bv\.rawCheck(Async)?\s*\(/i, evidence: "Valibot rawCheck evidence was detected." },
    { signal: "v-metadata", pattern: /\bv\.(metadata|description|title|examples?)\s*\(|getMetadata|getExamples/i, evidence: "Valibot metadata/example evidence was detected." },
    { signal: "v-json-schema", pattern: /@valibot\/to-json-schema|toJsonSchema|toJSONSchema|to-json-schema/i, evidence: "Valibot JSON Schema export evidence was detected." },
    { signal: "zod-codemod", pattern: /zod-to-valibot|migrate-from-zod|why-migrate-to-valibot/i, evidence: "Zod-to-Valibot migration evidence was detected." },
    { signal: "standard-schema", pattern: /StandardSchema|Standard Schema|standard-schema|~standard/i, evidence: "Standard Schema evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "valibot", "signal");
}

function schemaValidationReadinessPackageSignals(sourceFiles: SchemaValidationReadinessSourceFile[]): SchemaValidationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SchemaValidationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zod", pattern: /"zod"|from ['"]zod['"]|require\(['"]zod['"]\)|\bz\.(object|array|string|number|enum|union)/i, evidence: "zod package/import evidence was detected." },
    { signal: "@hookform/resolvers", pattern: /@hookform\/resolvers|zodResolver|yupResolver/i, evidence: "React Hook Form resolver package/import evidence was detected." },
    { signal: "drizzle-zod", pattern: /"drizzle-zod"|from ['"]drizzle-zod['"]|createInsertSchema|createSelectSchema/i, evidence: "drizzle-zod package/import evidence was detected." },
    { signal: "zod-to-json-schema", pattern: /"zod-to-json-schema"|from ['"]zod-to-json-schema['"]|zodToJsonSchema/i, evidence: "zod-to-json-schema package/import evidence was detected." },
    { signal: "ajv", pattern: /"ajv"|from ['"]ajv['"]|new Ajv|ajv\.compile/i, evidence: "Ajv package/import evidence was detected." },
    { signal: "yup", pattern: /"yup"|from ['"]yup['"]|\byup\./i, evidence: "Yup package/import evidence was detected." },
    { signal: "valibot", pattern: /"valibot"|from ['"]valibot['"]|\bv\.(object|string|number|array)/i, evidence: "Valibot package/import evidence was detected." },
    { signal: "@valibot/to-json-schema", pattern: /"@valibot\/to-json-schema"|from ['"]@valibot\/to-json-schema['"]|toJsonSchema|to-json-schema/i, evidence: "@valibot/to-json-schema package/import evidence was detected." },
    { signal: "io-ts", pattern: /"io-ts"|from ['"]io-ts['"]|\bt\.(type|exact|union)/i, evidence: "io-ts package/import evidence was detected." }
  ];
  return schemaValidationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function schemaValidationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SchemaValidationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/schema-validation-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
