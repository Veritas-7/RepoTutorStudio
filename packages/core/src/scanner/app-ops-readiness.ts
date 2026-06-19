import type { CacheReadinessReport, ErrorTrackingReadinessReport, FeatureFlagReadinessReport, LoggingReadinessReport, RateLimitReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildCacheReadinessReport(walk: WalkResult): Promise<CacheReadinessReport> {
  const sourceFiles = await cacheReadinessSourceFiles(walk);
  const cacheSetups = cacheReadinessCacheSetups(sourceFiles);
  const operationSignals = cacheReadinessOperationSignals(sourceFiles);
  const policySignals = cacheReadinessPolicySignals(sourceFiles);
  const connectionSignals = cacheReadinessConnectionSignals(sourceFiles);
  const advancedSignals = cacheReadinessAdvancedSignals(sourceFiles);
  const packageSignals = cacheReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasRedisPackage = packageSignals.some((item) => ["redis", "@redis/client"].includes(item.signal) && item.readiness === "ready");
  const hasSetup = cacheSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = cacheSetups.some((item) => item.readiness === "ready");
  const hasRead = operationSignals.some((item) => ["get", "mget", "exists"].includes(item.signal) && item.readiness === "ready") || cacheSetups.some((item) => item.readCount > 0);
  const hasWrite = operationSignals.some((item) => ["set", "mset"].includes(item.signal) && item.readiness === "ready") || cacheSetups.some((item) => item.writeCount > 0);
  const hasConnection = connectionSignals.some((item) => ["REDIS_URL", "url", "socket", "tls"].includes(item.signal) && item.readiness === "ready");
  const hasTtl = operationSignals.some((item) => ["expire", "ttl"].includes(item.signal) && item.readiness === "ready") || policySignals.some((item) => ["ttl", "ex", "px"].includes(item.signal) && item.readiness === "ready") || cacheSetups.some((item) => item.ttlCount > 0);
  const hasInvalidation = operationSignals.some((item) => item.signal === "del" && item.readiness === "ready") || policySignals.some((item) => ["invalidation", "namespace"].includes(item.signal) && item.readiness === "ready");
  const hasReconnectHandling = connectionSignals.some((item) => ["reconnect", "is-ready"].includes(item.signal) && item.readiness === "ready");
  const hasPubSub = advancedSignals.some((item) => item.signal === "pubsub" && item.readiness === "ready");
  const hasTelemetry = advancedSignals.some((item) => item.signal === "telemetry" && item.readiness === "ready");

  const riskQueue: CacheReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasRead && !hasWrite) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the cache strategy before claiming cache readiness.",
      why: "Cache readiness starts with an explicit cache package, client setup, read/write operation, TTL policy, or invalidation surface.",
      relatedHref: "html/cache-readiness.html"
    });
  }
  if (hasRedisPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each Redis package signal with client setup, connection, and cache operations.",
      why: "Node Redis usage requires explicit client construction, connection handling, and command usage before runtime cache QA.",
      relatedHref: "html/cache-readiness.html"
    });
  }
  if ((hasRedisPackage || hasSetup || hasRead || hasWrite) && !hasConnection) {
    riskQueue.push({
      priority: "high",
      action: "Document Redis connection configuration before relying on cache reads or writes.",
      why: "Cache clients need auditable URL/socket/TLS/host configuration, especially across local, serverless, and production environments.",
      relatedHref: "html/cache-readiness.html"
    });
  }
  if (hasWrite && !hasTtl) {
    riskQueue.push({
      priority: "medium",
      action: "Attach TTL or expiration policy to cache writes.",
      why: "Caches without expiration can drift from source-of-truth data and create hard-to-debug stale state.",
      relatedHref: "html/cache-readiness.html"
    });
  }
  if ((hasRead || hasWrite) && !hasInvalidation) {
    riskQueue.push({
      priority: "medium",
      action: "Document invalidation, delete, namespace, or key-rotation behavior.",
      why: "Cache correctness depends on knowing when keys are deleted, expired, namespaced, or recomputed.",
      relatedHref: "html/cache-readiness.html"
    });
  }
  if ((hasSetup || hasConnection) && !hasReconnectHandling) {
    riskQueue.push({
      priority: "medium",
      action: "Check connection status and reconnect/error handling for cache clients.",
      why: "Redis clients can reconnect after network errors; cache code should distinguish ready/open states and handle errors explicitly.",
      relatedHref: "html/cache-readiness.html"
    });
  }
  if (hasPubSub && !hasTelemetry) {
    riskQueue.push({
      priority: "medium",
      action: "Add observability around Pub/Sub or cache event flows.",
      why: "Pub/Sub and cache invalidation events need logs, metrics, or telemetry so dropped messages are visible.",
      relatedHref: "html/cache-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run cache integration tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not start Redis, open cache sockets, read or write cache keys, subscribe to channels, flush data, or run the analyzed project's tests.",
    relatedHref: "html/cache-readiness.html"
  });

  return {
    summary: `Node Redis식 cache readiness report: setup ${cacheSetups.length}개, operation signal ${operationSignals.length}개, policy signal ${policySignals.length}개, connection signal ${connectionSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Node Redis createClient connect get set EX NX expire ttl del mGet mSet scanIterator multi watch clientSideCache RESP socket reconnect isReady",
    cacheSetups,
    operationSignals,
    policySignals,
    connectionSignals,
    advancedSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"createClient|createClientPool|Redis|ioredis|@upstash/redis|Keyv|memcached\" src app pages packages", purpose: "Inventory cache client setup and provider choice." },
      { command: "rg \"client\\.get|client\\.set|cache\\.get|cache\\.set|mGet|mSet|del\\(|exists\\(|expire\\(|ttl\\(|scanIterator\" src app pages packages", purpose: "Find cache reads, writes, deletes, TTL checks, and key iteration." },
      { command: "rg \"EX:|PX:|NX:|XX:|ttl|stale|invalidate|revalidate|namespace|serialize|JSON\\.stringify|JSON\\.parse\" src app pages packages", purpose: "Review expiration, write conditions, stale handling, key namespaces, and serialization policy." },
      { command: "rg \"REDIS_URL|REDIS_HOST|REDIS_PORT|REDIS_PASSWORD|url:|socket:|tls|isReady|isOpen|reconnecting|error\" src app pages packages docker-compose.yml", purpose: "Check Redis connection configuration, status checks, and reconnect/error handling." },
      { command: "rg \"multi\\(|watch\\(|subscribe\\(|publish\\(|clientSideCache|RESP|cluster|sentinel|diagnostics_channel|OpenTelemetry\" src app pages packages", purpose: "Trace advanced Redis usage such as transactions, Pub/Sub, client-side cache, cluster, sentinel, and telemetry." },
      { command: "npx vitest run", purpose: "Run local tests that exercise cache key construction, TTL policy, invalidation, provider mocks, and reconnect handling." }
    ],
    learnerNextSteps: [
      "먼저 cache client 생성 위치에서 createClient, createClientPool, Redis, ioredis, Upstash Redis, Keyv 중 어떤 provider를 쓰는지 확인하세요.",
      "cache get/set 흐름을 따라가며 key namespace, serialized value shape, TTL/EX/PX, NX/XX 조건을 함께 추적하세요.",
      "쓰기 경로가 있으면 del, expire, invalidation, revalidate 같은 stale-data 제거 경로가 있는지 확인하세요.",
      "Redis 연결은 REDIS_URL 또는 socket/TLS 설정과 isReady/isOpen/error/reconnecting 이벤트 처리가 일관되는지 비교하세요.",
      "이 리포트는 정적 readiness입니다. 실제 Redis 실행, cache read/write, Pub/Sub, flush, reconnect recovery는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type CacheReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function cacheReadinessSourceFiles(walk: WalkResult): Promise<CacheReadinessSourceFile[]> {
  const files: CacheReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !cacheReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!cacheReadinessPathSignal(file.relPath) && !cacheReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function cacheReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return cacheReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function cacheReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(caches?|redis|ioredis|upstash|keyv|memcached|stores?|sessions?|revalidate|invalidate)(\/|\.|-|_|$)|docker-compose|compose\.ya?ml/i.test(filePath);
}

function cacheReadinessContentSignal(text: string): boolean {
  return /\b(createClient|createClientPool|Redis|ioredis|@upstash\/redis|Keyv|memcached|cache\.get|cache\.set|client\.get|client\.set|mGet|mSet|scanIterator|expire|ttl|REDIS_URL|REDIS_HOST|REDIS_PORT|REDIS_PASSWORD|clientSideCache|isReady|isOpen|reconnecting|multi\(|watch\(|subscribe\(|publish\(|diagnostics_channel|OpenTelemetry)\b/i.test(text);
}

function cacheReadinessCacheSetups(sourceFiles: CacheReadinessSourceFile[]): CacheReadinessReport["cacheSetups"] {
  const rows: CacheReadinessReport["cacheSetups"] = [];
  for (const source of sourceFiles) {
    const clientSetupCount = countMatches(source.text, /\bcreateClient\s*\(|\bcreateClientPool\s*\(|\bnew\s+Redis\b|\bnew\s+IORedis\b|\bnew\s+Keyv\b|\bnew\s+Memcached\b/gi);
    const connectCount = countMatches(source.text, /\.connect\s*\(|\.on\s*\(\s*["'](error|connect|ready|reconnecting|end)["']|\bisReady\b|\bisOpen\b/gi);
    const readCount = countMatches(source.text, /\.get\s*\(|\.mGet\s*\(|\.hGet(All)?\s*\(|\.exists\s*\(|cache\.get\s*\(/gi);
    const writeCount = countMatches(source.text, /\.set\s*\(|\.mSet\s*\(|\.setEx\s*\(|\.hSet\s*\(|cache\.set\s*\(/gi);
    const ttlCount = countMatches(source.text, /\bEX\s*:|\bPX\s*:|\.expire\s*\(|\.ttl\s*\(|\.pTTL\s*\(|\.setEx\s*\(|ttl\s*:/gi);
    const hasSetupSignal = clientSetupCount + connectCount + readCount + writeCount + ttlCount > 0 || /\b(cache|redis)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: cacheReadinessProvider(source),
      clientSetupCount,
      connectCount,
      readCount,
      writeCount,
      ttlCount,
      readiness: clientSetupCount > 0 && connectCount > 0 && (readCount > 0 || writeCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains client setup ${clientSetupCount}, connect/status ${connectCount}, reads ${readCount}, writes ${writeCount}, TTL signals ${ttlCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function cacheReadinessProvider(source: CacheReadinessSourceFile): CacheReadinessReport["cacheSetups"][number]["provider"] {
  if (/["']redis["']|\bcreateClient\s*\(|\bcreateClientPool\s*\(|@redis\/client/i.test(source.text)) return "redis";
  if (/["']ioredis["']|\bnew\s+IORedis\b|\bnew\s+Redis\b/i.test(source.text)) return "ioredis";
  if (/@upstash\/redis|Upstash/i.test(source.text)) return "upstash-redis";
  if (/["']keyv["']|\bnew\s+Keyv\b/i.test(source.text)) return "keyv";
  if (/memcached/i.test(source.text)) return "memcached";
  if (/\b(cache|redis)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function cacheReadinessOperationSignals(sourceFiles: CacheReadinessSourceFile[]): CacheReadinessReport["operationSignals"] {
  const specs: Array<{ signal: CacheReadinessReport["operationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get", pattern: /\.get\s*\(|cache\.get\s*\(/i, evidence: "cache get/read evidence was detected." },
    { signal: "set", pattern: /\.set\s*\(|cache\.set\s*\(/i, evidence: "cache set/write evidence was detected." },
    { signal: "mget", pattern: /\.mGet\s*\(|\.MGET\s*\(/i, evidence: "multi-get evidence was detected." },
    { signal: "mset", pattern: /\.mSet\s*\(|\.MSET\s*\(|\.mSetEx\s*\(/i, evidence: "multi-set evidence was detected." },
    { signal: "del", pattern: /\.del\s*\(|\.unlink\s*\(|cache\.delete\s*\(|cache\.del\s*\(/i, evidence: "cache delete/invalidation evidence was detected." },
    { signal: "exists", pattern: /\.exists\s*\(|\.has\s*\(/i, evidence: "cache existence check evidence was detected." },
    { signal: "expire", pattern: /\.expire\s*\(|\.pExpire\s*\(|\.setEx\s*\(/i, evidence: "expiration command evidence was detected." },
    { signal: "ttl", pattern: /\.ttl\s*\(|\.pTTL\s*\(|\.expireTime\s*\(/i, evidence: "TTL read evidence was detected." },
    { signal: "scan", pattern: /\.scanIterator\s*\(|\.scan\s*\(|\.keys\s*\(/i, evidence: "key scan/iteration evidence was detected." }
  ];
  return cacheReadinessSignalFromSpecs(sourceFiles, specs, "operation", "signal");
}

function cacheReadinessPolicySignals(sourceFiles: CacheReadinessSourceFile[]): CacheReadinessReport["policySignals"] {
  const specs: Array<{ signal: CacheReadinessReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ttl", pattern: /\bttl\b|\bTTL\b|time[- ]?to[- ]?live/i, evidence: "TTL policy evidence was detected." },
    { signal: "nx", pattern: /\bNX\s*:|\bNX\b|setNX|mSetNX/i, evidence: "write-if-absent policy evidence was detected." },
    { signal: "xx", pattern: /\bXX\s*:|\bXX\b/i, evidence: "write-if-present policy evidence was detected." },
    { signal: "ex", pattern: /\bEX\s*:|\bEX\b|setEx/i, evidence: "seconds expiration policy evidence was detected." },
    { signal: "px", pattern: /\bPX\s*:|\bPX\b|pExpire/i, evidence: "milliseconds expiration policy evidence was detected." },
    { signal: "stale-while-revalidate", pattern: /stale[-_ ]?while[-_ ]?revalidate|SWR|revalidate/i, evidence: "stale-while-revalidate evidence was detected." },
    { signal: "invalidation", pattern: /invalidate|revalidate|purge|flush|delete cache|cache bust/i, evidence: "cache invalidation evidence was detected." },
    { signal: "namespace", pattern: /namespace|prefix|keyPrefix|cacheKey|keyPrefix/i, evidence: "key namespace evidence was detected." },
    { signal: "serialization", pattern: /JSON\.stringify|JSON\.parse|serialize|deserialize|Buffer\.from/i, evidence: "cache serialization evidence was detected." }
  ];
  return cacheReadinessSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function cacheReadinessConnectionSignals(sourceFiles: CacheReadinessSourceFile[]): CacheReadinessReport["connectionSignals"] {
  const specs: Array<{ signal: CacheReadinessReport["connectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "REDIS_URL", pattern: /\bREDIS_URL\b/i, evidence: "REDIS_URL evidence was detected." },
    { signal: "REDIS_HOST", pattern: /\bREDIS_HOST\b/i, evidence: "REDIS_HOST evidence was detected." },
    { signal: "REDIS_PORT", pattern: /\bREDIS_PORT\b/i, evidence: "REDIS_PORT evidence was detected." },
    { signal: "REDIS_PASSWORD", pattern: /\bREDIS_PASSWORD\b/i, evidence: "REDIS_PASSWORD evidence was detected." },
    { signal: "url", pattern: /\burl\s*:|redis:\/\//i, evidence: "Redis URL configuration evidence was detected." },
    { signal: "socket", pattern: /\bsocket\s*:|host\s*:|port\s*:|path\s*:/i, evidence: "socket/host/port configuration evidence was detected." },
    { signal: "tls", pattern: /\btls\b|rediss:\/\//i, evidence: "TLS Redis connection evidence was detected." },
    { signal: "reconnect", pattern: /reconnect|reconnecting|reconnectStrategy|retryStrategy/i, evidence: "reconnect handling evidence was detected." },
    { signal: "is-ready", pattern: /\bisReady\b|\bisOpen\b|ready\b/i, evidence: "client readiness/status evidence was detected." }
  ];
  return cacheReadinessSignalFromSpecs(sourceFiles, specs, "connection", "signal");
}

function cacheReadinessAdvancedSignals(sourceFiles: CacheReadinessSourceFile[]): CacheReadinessReport["advancedSignals"] {
  const specs: Array<{ signal: CacheReadinessReport["advancedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "transaction", pattern: /\.multi\s*\(|\.exec\s*\(|transaction/i, evidence: "transaction/multi evidence was detected." },
    { signal: "watch", pattern: /\.watch\s*\(|WatchError|optimistic/i, evidence: "WATCH/optimistic locking evidence was detected." },
    { signal: "pubsub", pattern: /\.subscribe\s*\(|\.publish\s*\(|Pub\/Sub|pubsub|pSubscribe|sSubscribe/i, evidence: "Pub/Sub evidence was detected." },
    { signal: "client-side-cache", pattern: /clientSideCache|client side caching|CLIENT TRACKING/i, evidence: "client-side caching evidence was detected." },
    { signal: "pipeline", pattern: /pipeline|Promise\.all|auto[- ]?pipelining/i, evidence: "pipeline or batched command evidence was detected." },
    { signal: "pool", pattern: /createClientPool|RedisClientPool|pool\s*=/i, evidence: "client pool evidence was detected." },
    { signal: "cluster", pattern: /createCluster|RedisCluster|cluster/i, evidence: "Redis Cluster evidence was detected." },
    { signal: "sentinel", pattern: /sentinel|RedisSentinel/i, evidence: "Redis Sentinel evidence was detected." },
    { signal: "telemetry", pattern: /diagnostics_channel|OpenTelemetry|trace|metrics|telemetry/i, evidence: "Redis telemetry evidence was detected." }
  ];
  return cacheReadinessSignalFromSpecs(sourceFiles, specs, "advanced", "signal");
}

function cacheReadinessPackageSignals(sourceFiles: CacheReadinessSourceFile[]): CacheReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CacheReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "redis", pattern: /["']redis["']|\bfrom\s+["']redis["']|\bcreateClient\s*\(/i, evidence: "redis package/import evidence was detected." },
    { signal: "@redis/client", pattern: /@redis\/client/i, evidence: "@redis/client package/import evidence was detected." },
    { signal: "ioredis", pattern: /["']ioredis["']|\bnew\s+IORedis\b|\bnew\s+Redis\b/i, evidence: "ioredis package/import evidence was detected." },
    { signal: "@upstash/redis", pattern: /@upstash\/redis|Upstash/i, evidence: "@upstash/redis package/import evidence was detected." },
    { signal: "keyv", pattern: /["']keyv["']|\bnew\s+Keyv\b/i, evidence: "keyv package/import evidence was detected." },
    { signal: "memcached", pattern: /memcached/i, evidence: "memcached package/import evidence was detected." },
    { signal: "lru-cache", pattern: /lru-cache|LRUCache/i, evidence: "lru-cache package/import evidence was detected." }
  ];
  return cacheReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function cacheReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CacheReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/cache-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildLoggingReadinessReport(walk: WalkResult): Promise<LoggingReadinessReport> {
  const sourceFiles = await loggingReadinessSourceFiles(walk);
  const loggingSetups = loggingReadinessSetups(sourceFiles);
  const levelSignals = loggingReadinessLevelSignals(sourceFiles);
  const contextSignals = loggingReadinessContextSignals(sourceFiles);
  const safetySignals = loggingReadinessSafetySignals(sourceFiles);
  const transportSignals = loggingReadinessTransportSignals(sourceFiles);
  const packageSignals = loggingReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasPinoPackage = packageSignals.some((item) => item.signal === "pino" && item.readiness === "ready");
  const hasZapPackage = packageSignals.some((item) => item.signal === "zap" && item.readiness === "ready");
  const hasZerologPackage = packageSignals.some((item) => item.signal === "zerolog" && item.readiness === "ready");
  const hasSetup = loggingSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = loggingSetups.some((item) => item.readiness === "ready");
  const hasLogCall = levelSignals.some((item) => item.readiness === "ready");
  const hasStructuredContext = contextSignals.some((item) => ["child-logger", "bindings", "request-id", "http-request", "mixin", "event-builder", "context-logger", "context-integration"].includes(item.signal) && item.readiness === "ready");
  const hasErrorLogs = levelSignals.some((item) => ["error", "fatal", "panic"].includes(item.signal) && item.readiness === "ready");
  const hasErrorSerializer = safetySignals.some((item) => ["error-serializer", "safe-stringify"].includes(item.signal) && item.readiness === "ready");
  const hasRedaction = safetySignals.some((item) => ["redact", "redact-paths", "secret-fields"].includes(item.signal) && item.readiness === "ready");
  const hasTransport = transportSignals.some((item) => ["transport", "destination", "multistream", "file-output", "log-processor"].includes(item.signal) && item.readiness === "ready");
  const hasFlushHandling = safetySignals.some((item) => item.signal === "flush-on-exit" && item.readiness === "ready");
  const hasConsoleOnly = loggingSetups.some((item) => item.provider === "console") && !hasPackage;

  const riskQueue: LoggingReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasLogCall) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the application logging strategy before claiming logging readiness.",
      why: "Logging readiness starts with an explicit logger package, setup module, level policy, context binding, redaction, or transport surface.",
      relatedHref: "html/logging-readiness.html"
    });
  }
  if ((hasPinoPackage || hasZapPackage || hasZerologPackage) && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each Pino, Zap, or Zerolog package signal with logger construction, level policy, and log calls.",
      why: "Structured logging readiness requires an instantiated logger and evidence that application paths emit structured records.",
      relatedHref: "html/logging-readiness.html"
    });
  }
  if ((hasPackage || hasSetup || hasLogCall) && !hasStructuredContext) {
    riskQueue.push({
      priority: "medium",
      action: "Bind request, user, job, or module context to structured logs.",
      why: "Logs without stable context are hard to correlate across HTTP handlers, workers, and background tasks.",
      relatedHref: "html/logging-readiness.html"
    });
  }
  if (hasErrorLogs && !hasErrorSerializer) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm error serialization preserves message, type, stack, and cause safely.",
      why: "Plain error objects can lose useful fields or expose sensitive data unless serializers and safe stringification are explicit.",
      relatedHref: "html/logging-readiness.html"
    });
  }
  if ((hasPinoPackage || hasZapPackage || hasZerologPackage || hasReadySetup || hasStructuredContext) && !hasRedaction) {
    riskQueue.push({
      priority: "medium",
      action: "Add redaction for tokens, passwords, cookies, authorization headers, and secret fields.",
      why: "Structured logs frequently include request and payload context; redaction keeps sensitive fields out of durable log streams.",
      relatedHref: "html/logging-readiness.html"
    });
  }
  if (hasTransport && !hasFlushHandling) {
    riskQueue.push({
      priority: "medium",
      action: "Review async transport readiness and flush behavior before process exit.",
      why: "Pino transports can run asynchronously in worker threads; early process exit can drop records unless readiness and flush behavior are handled.",
      relatedHref: "html/logging-readiness.html"
    });
  }
  if (hasConsoleOnly) {
    riskQueue.push({
      priority: "medium",
      action: "Replace console-only logging with a structured logger or document why console output is sufficient.",
      why: "Console-only logs usually lack level policy, redaction, request bindings, serializers, and transport controls.",
      relatedHref: "html/logging-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run logging integration checks only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not execute logger calls, emit logs, start transports, flush worker threads, call log processors, or run the analyzed project's tests.",
    relatedHref: "html/logging-readiness.html"
  });

  return {
    summary: `Pino/Zap/Zerolog식 logging readiness report: setup ${loggingSetups.length}개, level signal ${levelSignals.length}개, context signal ${contextSignals.length}개, safety signal ${safetySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Pino Zap Zerolog pino logger.info logger.error child logger level transport destination redact serializers pino-pretty multistream timestamp formatters mixin bindings go.uber.org/zap zap.NewProduction zap.NewDevelopment zap.Config zap.AtomicLevel zap.Logger zap.SugaredLogger zap.String zap.Error zap.Any zapcore.NewCore EncoderConfig WriteSyncer Sync AddCaller AddStacktrace Sampling github.com/rs/zerolog zerolog.New log.Info Msg Msgf With Timestamp SetGlobalLevel ConsoleWriter MultiLevelWriter hlog diode journald syslog",
    loggingSetups,
    levelSignals,
    contextSignals,
    safetySignals,
    transportSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"pino\\(|go\\.uber\\.org/zap|github\\.com/rs/zerolog|zerolog\\.New|log\\.(Info|Error|Debug)\\(\\)|zap\\.NewProduction|zap\\.NewDevelopment|zap\\.Config|createLogger|winston|bunyan|loglevel|logger\\.|console\\.\" src app pages packages cmd internal pkg go.mod package.json", purpose: "Inventory logger setup and log-call sites." },
      { command: "rg \"trace|debug|info|warn|error|fatal|panic|level|customLevels|SetGlobalLevel|Disabled|silent\" src app pages packages cmd internal pkg", purpose: "Review level policy, custom levels, and noisy or disabled logging paths." },
      { command: "rg \"child\\(|bindings\\(|requestId|req\\.id|correlation|serializer|stdSerializers|mixin|timestamp|formatters|zap\\.(String|Int|Error|Any)|\\.With\\(|\\.Named\\(|\\.Sugar\\(|\\.(Str|Int|Err|Dict|Array|Object|Interface|Any)\\(|\\.Msgf?\\(\" src app pages packages cmd internal pkg", purpose: "Trace structured context, request IDs, serializers, typed fields, mixins, timestamps, and formatters." },
      { command: "rg \"redact|redaction|password|token|authorization|cookie|secret|safe-stable-stringify\" src app pages packages", purpose: "Check sensitive-field redaction and safe stringification policy." },
      { command: "rg \"transport|destination|pino-pretty|multistream|worker thread|flush|onTerminated|log processor|zapcore\\.NewCore|NewJSONEncoder|WriteSyncer|RegisterSink|\\.Sync\\(|ConsoleWriter|MultiLevelWriter|SyncWriter|diode\\.NewWriter|journald|syslog\" src app pages packages cmd internal pkg", purpose: "Inspect transports, destinations, pretty printing, zapcore sinks/encoders, zerolog writers, async worker handling, and flush behavior." },
      { command: "npx vitest run", purpose: "Run local tests that exercise logging context, serializers, redaction, transport configuration, and error paths." }
    ],
    learnerNextSteps: [
      "먼저 logger setup 파일에서 pino(), zap.NewProduction/NewDevelopment, zap.Config.Build, zerolog.New, log.Logger, createLogger, logger factory, level, base bindings가 어디서 정의되는지 확인하세요.",
      "logger.info/error/fatal 호출을 따라가며 requestId, userId, jobId, module 같은 correlation context가 함께 기록되는지 확인하세요.",
      "error 로그가 있으면 Error object serializer, stack/cause 보존, safe-stable-stringify 같은 안전한 직렬화 경로를 확인하세요.",
      "redact 설정은 token, password, authorization, cookie, secret 같은 필드를 실제 경로명으로 막는지 검토하세요.",
      "Go/Zap 코드라면 zap.String, zap.Error, zap.Any 같은 typed field와 Sugar/Desugar 경계가 hot path와 느슨한 key-value 로그 사이에서 어떻게 쓰이는지 확인하세요.",
      "Go/Zerolog 코드라면 chained event가 Msg/Msgf/Send로 끝나는지, Context logger와 hlog request middleware가 올바르게 연결되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 로그 출력, transport readiness, Sync/flush-on-exit, log processor 연동은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type LoggingReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function loggingReadinessSourceFiles(walk: WalkResult): Promise<LoggingReadinessSourceFile[]> {
  const files: LoggingReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !loggingReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!loggingReadinessPathSignal(file.relPath) && !loggingReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function loggingReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return loggingReadinessPathSignal(filePath)
    || /^(package\.json|go\.mod|go\.sum|\.env\.example|\.env\.sample|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(go|js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function loggingReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(logs?|logger|logging|observability|telemetry|pino|zap|zapcore|winston|bunyan|loglevel|transport|serializers?|redaction?)(\/|\.|-|_|$)/i.test(filePath);
}

function loggingReadinessContentSignal(text: string): boolean {
  return /\b(pino\(|from\s+["']pino["']|require\(["']pino["']|createLogger|winston|bunyan|loglevel|logger\.(trace|debug|info|warn|error|fatal)|logger\.child|stdSerializers|serializers\s*:|redact\s*:|pino-pretty|multistream|transport\s*:|destination\s*:|safe-stable-stringify|go\.uber\.org\/zap|zap\.New(Production|Development|Example|Nop)|zap\.Config|zap\.Logger|zap\.SugaredLogger|zap\.AtomicLevel|zap\.(String|Error|Any|Fields)|zapcore\.(NewCore|EncoderConfig|WriteSyncer)|github\.com\/rs\/zerolog|zerolog\.New|zerolog\.Logger|zerolog\.Event|zerolog\.ConsoleWriter|zerolog\.SetGlobalLevel|log\.(Trace|Debug|Info|Warn|Error|Fatal|Panic)\s*\(\s*\)\.|\.(Msg|Msgf|Send)\s*\()\b/i.test(text);
}

function loggingReadinessSetups(sourceFiles: LoggingReadinessSourceFile[]): LoggingReadinessReport["loggingSetups"] {
  const rows: LoggingReadinessReport["loggingSetups"] = [];
  for (const source of sourceFiles) {
    const loggerSetupCount = countMatches(source.text, /\bpino\s*\(|\bcreateLogger\s*\(|\bnew\s+Logger\b|\bgetLogger\s*\(|\blogger\s*=\s*|\bcreatePinoLogger\b|zap\.New(Production|Development|Example|Nop)\s*\(|zap\.Config\s*\{|New(Production|Development)Config\s*\(|\.Build\s*\(|zapcore\.NewCore\s*\(|zerolog\.New\s*\(|zerolog\.Nop\s*\(|log\.Logger\s*=|\.With\s*\(\s*\)\.[\s\S]{0,120}\.Logger\s*\(/gi);
    const levelCount = countMatches(source.text, /\b(trace|debug|info|warn|error|fatal|silent)\b|\blevel\s*:/gi);
    const callCount = countMatches(source.text, /\b(?:logger|log)\.(?:trace|debug|info|warn|error|fatal|Trace|Debug|Info|Warn|Error|Fatal|Panic|DPanic|Infow|Warnw|Errorw|Fatalw|Infof|Warnf|Errorf|Fatalf)\s*\(|\bconsole\.(?:debug|info|warn|error|log)\s*\(|\.(Msg|Msgf|Send)\s*\(/g);
    const childLoggerCount = countMatches(source.text, /\.child\s*\(|\.bindings\s*\(|\bbindings\s*:|\.With\s*\(|\.Named\s*\(|zap\.Fields\s*\(|\.UpdateContext\s*\(|WithContext\s*\(/g);
    const transportCount = countMatches(source.text, /\btransport\s*:|\bpino\.transport\s*\(|\bdestination\s*:|\bpino\.destination\s*\(|\bmultistream\s*\(|pino-pretty|OutputPaths|ErrorOutputPaths|zapcore\.NewCore\s*\(|zapcore\.AddSync\s*\(|RegisterSink|Open\s*\(|ConsoleWriter|MultiLevelWriter|SyncWriter|diode\.NewWriter|journald|syslog/g);
    const hasSetupSignal = loggerSetupCount + levelCount + callCount + childLoggerCount + transportCount > 0 || /\b(logger|logging|pino|winston|bunyan|loglevel)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: loggingReadinessProvider(source),
      loggerSetupCount,
      levelCount,
      callCount,
      childLoggerCount,
      transportCount,
      readiness: loggerSetupCount > 0 && callCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains logger setup ${loggerSetupCount}, level signals ${levelCount}, log calls ${callCount}, child/bindings ${childLoggerCount}, transports ${transportCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function loggingReadinessProvider(source: LoggingReadinessSourceFile): LoggingReadinessReport["loggingSetups"][number]["provider"] {
  if (/["']pino["']|\bpino\s*\(|pino-pretty|pino\.transport|stdSerializers/i.test(source.text)) return "pino";
  if (/go\.uber\.org\/zap|zap\.New(Production|Development|Example|Nop)|zap\.Config|zapcore\.NewCore|zap\.Logger|zap\.SugaredLogger/i.test(source.text)) return "zap";
  if (/github\.com\/rs\/zerolog|zerolog\.New|zerolog\.Logger|zerolog\.Event|zerolog\.ConsoleWriter|log\.(Trace|Debug|Info|Warn|Error|Fatal|Panic)\s*\(\s*\)\./i.test(source.text)) return "zerolog";
  if (/["']winston["']|\bwinston\b|createLogger\s*\(/i.test(source.text)) return "winston";
  if (/["']bunyan["']|\bbunyan\b/i.test(source.text)) return "bunyan";
  if (/["']loglevel["']|\bloglevel\b/i.test(source.text)) return "loglevel";
  if (/\bconsole\.(log|debug|info|warn|error)\b/i.test(source.text)) return "console";
  if (/\b(logger|logging|log\.)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function loggingReadinessLevelSignals(sourceFiles: LoggingReadinessSourceFile[]): LoggingReadinessReport["levelSignals"] {
  const specs: Array<{ signal: LoggingReadinessReport["levelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trace", pattern: /\.trace\s*\(|\btrace\b/i, evidence: "trace-level evidence was detected." },
    { signal: "debug", pattern: /\.debug\s*\(|\bdebug\b/i, evidence: "debug-level evidence was detected." },
    { signal: "info", pattern: /\.info\s*\(|\binfo\b/i, evidence: "info-level evidence was detected." },
    { signal: "warn", pattern: /\.warn\s*\(|\bwarn\b|\bwarning\b/i, evidence: "warn-level evidence was detected." },
    { signal: "error", pattern: /\.error\s*\(|\berror\b/i, evidence: "error-level evidence was detected." },
    { signal: "fatal", pattern: /\.fatal\s*\(|\bfatal\b/i, evidence: "fatal-level evidence was detected." },
    { signal: "panic", pattern: /\.panic\s*\(|\bPanicLevel\b|\bpanic\b/i, evidence: "panic-level evidence was detected." },
    { signal: "silent", pattern: /\bsilent\b|level\s*:\s*["']silent["']|Disabled|SetGlobalLevel\s*\(\s*zerolog\.Disabled/i, evidence: "silent/disabled level evidence was detected." },
    { signal: "custom-level", pattern: /customLevels|levelVal|levelComparison|useOnlyCustomLevels|SetGlobalLevel|ParseLevel|WithLevel|Level\s*\(/i, evidence: "custom/global level evidence was detected." }
  ];
  return loggingReadinessSignalFromSpecs(sourceFiles, specs, "level", "signal");
}

function loggingReadinessContextSignals(sourceFiles: LoggingReadinessSourceFile[]): LoggingReadinessReport["contextSignals"] {
  const specs: Array<{ signal: LoggingReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "child-logger", pattern: /\.child\s*\(|\.With\s*\(|zap\.Fields\s*\(/i, evidence: "child logger evidence was detected." },
    { signal: "bindings", pattern: /\.bindings\s*\(|\bbindings\s*:|\bbase\s*:|InitialFields|zap\.Fields\s*\(|\.With\s*\(/i, evidence: "logger bindings evidence was detected." },
    { signal: "request-id", pattern: /request[-_ ]?id|requestId|req\.id|correlation[-_ ]?id|traceId/i, evidence: "request/correlation ID evidence was detected." },
    { signal: "http-request", pattern: /pino-http|req\s*:|res\s*:|stdSerializers\.(req|res)|mapHttpRequest|mapHttpResponse|\*http\.Request|http\.Request|zap\.(Any|String)\s*\(\s*["'](req|request|method|path|url)["']/i, evidence: "HTTP request/response logging evidence was detected." },
    { signal: "error-object", pattern: /new\s+Error|Error\(|err\s*:|error\s*:|stdSerializers\.err|zap\.(Named)?Error\s*\(|zap\.Errors\s*\(|\.Err\s*\(/i, evidence: "Error object logging evidence was detected." },
    { signal: "serializer", pattern: /serializers\s*:|stdSerializers|wrapErrorSerializer|wrapRequestSerializer|wrapResponseSerializer|ObjectMarshaler|ArrayMarshaler|LogObjectMarshaler|LogArrayMarshaler|zap\.(Object|Any|Reflect|Array)\s*\(|\.(Object|Array|Dict|Interface|Any|RawJSON)\s*\(/i, evidence: "serializer evidence was detected." },
    { signal: "mixin", pattern: /\bmixin\s*\(|\bmixin\s*:/i, evidence: "Pino mixin evidence was detected." },
    { signal: "timestamp", pattern: /\btimestamp\s*:|stdTimeFunctions|time\s*:|formatters\s*:|TimeKey|EncodeTime|New(Production|Development)EncoderConfig|\.Timestamp\s*\(|TimeFieldFormat/i, evidence: "timestamp or formatter evidence was detected." },
    { signal: "sugared-logger", pattern: /\.Sugar\s*\(|\.Desugar\s*\(|SugaredLogger|\.Info(w|f)?\s*\(|\.Error(w|f)?\s*\(/, evidence: "Zap SugaredLogger evidence was detected." },
    { signal: "typed-fields", pattern: /zap\.(String|Int|Int64|Bool|Duration|Time|Any|Error|Object|Array|Reflect|Fields)\s*\(|\.(Str|Int|Int64|Bool|Dur|Time|Err|AnErr|Any|Interface|Object|Array|Dict|RawJSON)\s*\(/, evidence: "typed structured field evidence was detected." },
    { signal: "named-logger", pattern: /\.Named\s*\(|LoggerName|NameKey|\.Str\s*\(\s*["'](logger|component|module|name)["']/i, evidence: "named logger evidence was detected." },
    { signal: "event-builder", pattern: /\.(Trace|Debug|Info|Warn|Error|Fatal|Panic|Log)\s*\(\s*\)[\s\S]{0,240}\.(Msg|Msgf|Send)\s*\(|zerolog\.Event|\*zerolog\.Event/i, evidence: "Zerolog event builder evidence was detected." },
    { signal: "context-logger", pattern: /\.With\s*\(\s*\)[\s\S]{0,180}\.Logger\s*\(|UpdateContext|WithContext|zerolog\.Ctx\s*\(|log\.Ctx\s*\(/i, evidence: "Zerolog context logger evidence was detected." },
    { signal: "context-integration", pattern: /WithContext|zerolog\.Ctx\s*\(|log\.Ctx\s*\(|hlog\.|RequestIDHandler|AccessHandler|NewHandler/i, evidence: "context/http logging integration evidence was detected." }
  ];
  return loggingReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function loggingReadinessSafetySignals(sourceFiles: LoggingReadinessSourceFile[]): LoggingReadinessReport["safetySignals"] {
  const specs: Array<{ signal: LoggingReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "redact", pattern: /\bredact\s*:|redaction|@pinojs\/redact/i, evidence: "redaction configuration evidence was detected." },
    { signal: "redact-paths", pattern: /paths\s*:\s*\[|censor\s*:|remove\s*:/i, evidence: "redaction path/censor evidence was detected." },
    { signal: "secret-fields", pattern: /password|passwd|token|authorization|cookie|secret|api[-_ ]?key|session/i, evidence: "sensitive field evidence was detected." },
    { signal: "safe-stringify", pattern: /safe-stable-stringify|fast-safe-stringify|safeStringify|JSON\.stringify/i, evidence: "safe stringification evidence was detected." },
    { signal: "error-serializer", pattern: /stdSerializers\.err|errWithCause|wrapErrorSerializer|errorLikeObjectKeys|zap\.(Named)?Error\s*\(|zap\.Errors\s*\(|ErrorStackMarshaler|pkgerrors\.MarshalStack|\.Err\s*\(/i, evidence: "error serializer evidence was detected." },
    { signal: "stdout-stderr", pattern: /process\.(stdout|stderr)|destination\s*:\s*[12]\b|pino\.destination\s*\(|OutputPaths|ErrorOutputPaths|stderr|stdout/i, evidence: "stdout/stderr destination evidence was detected." },
    { signal: "flush-on-exit", pattern: /\.flush\s*\(|flushSync|onTerminated|transport\.on\s*\(\s*["']ready["']|process\.on\s*\(\s*["'](beforeExit|exit|SIGTERM|SIGINT)["']|\.Sync\s*\(|defer\s+logger\.Sync\s*\(/i, evidence: "flush-on-exit evidence was detected." },
    { signal: "caller", pattern: /AddCaller|WithCaller|AddCallerSkip|CallerKey|EncodeCaller|\.Caller\s*\(|CallerMarshalFunc/i, evidence: "caller annotation evidence was detected." },
    { signal: "stacktrace", pattern: /AddStacktrace|StacktraceKey|Stacktrace|Stack|Development\s*\(|\.Stack\s*\(|ErrorStackMarshaler|pkgerrors\.MarshalStack/i, evidence: "stacktrace evidence was detected." },
    { signal: "sampling", pattern: /SamplingConfig|Sampling\s*:|zapcore\.NewSampler|NewSamplerWithOptions|SamplerHook|BasicSampler|BurstSampler|LevelSampler|RandomSampler|\.Sample\s*\(/i, evidence: "log sampling evidence was detected." }
  ];
  return loggingReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function loggingReadinessTransportSignals(sourceFiles: LoggingReadinessSourceFile[]): LoggingReadinessReport["transportSignals"] {
  const specs: Array<{ signal: LoggingReadinessReport["transportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "transport", pattern: /\btransport\s*:|\bpino\.transport\s*\(/i, evidence: "transport setup evidence was detected." },
    { signal: "destination", pattern: /\bdestination\s*:|\bpino\.destination\s*\(|pino\/file|OutputPaths|ErrorOutputPaths/i, evidence: "destination evidence was detected." },
    { signal: "pino-pretty", pattern: /pino-pretty|prettyPrint/i, evidence: "pino-pretty development formatting evidence was detected." },
    { signal: "multistream", pattern: /\bmultistream\s*\(|targets\s*:\s*\[/i, evidence: "multistream or multi-target transport evidence was detected." },
    { signal: "worker-thread", pattern: /worker[-_ ]?thread|Worker Thread|thread-stream|worker_threads/i, evidence: "worker-thread transport evidence was detected." },
    { signal: "async-logging", pattern: /sync\s*:\s*false|asynchronous|async logging|thread-stream|minLength/i, evidence: "async logging evidence was detected." },
    { signal: "file-output", pattern: /pino\/file|destination\s*:\s*["'`].+\.log|append\s*:|mkdir\s*:|file:\/\/|\.log\b/i, evidence: "file output evidence was detected." },
    { signal: "log-processor", pattern: /log processor|logtail|datadog|cloudwatch|axiom|sentry|opentelemetry|seq|airbrake/i, evidence: "external log processor evidence was detected." },
    { signal: "zapcore", pattern: /zapcore\.|go\.uber\.org\/zap\/zapcore/i, evidence: "zapcore evidence was detected." },
    { signal: "encoder", pattern: /EncoderConfig|New(JSON|Console)Encoder|Encode(Level|Time|Duration|Caller)|Encoding\s*:/i, evidence: "logger encoder evidence was detected." },
    { signal: "write-syncer", pattern: /WriteSyncer|AddSync|Lock\s*\(|CombineWriteSyncers|NewMultiWriteSyncer/i, evidence: "write syncer evidence was detected." },
    { signal: "sink", pattern: /RegisterSink|Open\s*\(|Sink|OutputPaths|ErrorOutputPaths/i, evidence: "logger sink evidence was detected." },
    { signal: "console-writer", pattern: /ConsoleWriter|NewConsoleWriter/i, evidence: "Zerolog ConsoleWriter evidence was detected." },
    { signal: "multi-writer", pattern: /MultiLevelWriter|io\.MultiWriter/i, evidence: "multi-writer evidence was detected." },
    { signal: "level-writer", pattern: /LevelWriter|FilteredLevelWriter|WriteLevel/i, evidence: "level writer evidence was detected." },
    { signal: "diode-writer", pattern: /diode\.NewWriter|zerolog\/diode|diode.Writer/i, evidence: "diode writer evidence was detected." },
    { signal: "slog-handler", pattern: /NewSlogHandler|slog\.New|log\/slog/i, evidence: "slog handler evidence was detected." },
    { signal: "journald", pattern: /zerolog\/journald|journald\./i, evidence: "journald writer evidence was detected." },
    { signal: "syslog", pattern: /zerolog\/syslog|SyslogLevelWriter|syslog\./i, evidence: "syslog writer evidence was detected." }
  ];
  return loggingReadinessSignalFromSpecs(sourceFiles, specs, "transport", "signal");
}

function loggingReadinessPackageSignals(sourceFiles: LoggingReadinessSourceFile[]): LoggingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LoggingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pino", pattern: /["']pino["']|\bfrom\s+["']pino["']|\bpino\s*\(/i, evidence: "pino package/import evidence was detected." },
    { signal: "pino-pretty", pattern: /pino-pretty/i, evidence: "pino-pretty package/import evidence was detected." },
    { signal: "pino-http", pattern: /pino-http/i, evidence: "pino-http package/import evidence was detected." },
    { signal: "zap", pattern: /go\.uber\.org\/zap|zap\.New(Production|Development|Example|Nop)|zap\.Config|zap\.Logger|zap\.SugaredLogger/i, evidence: "Zap package/import evidence was detected." },
    { signal: "zapcore", pattern: /go\.uber\.org\/zap\/zapcore|zapcore\./i, evidence: "zapcore package/import evidence was detected." },
    { signal: "zapgrpc", pattern: /go\.uber\.org\/zap\/zapgrpc|zapgrpc\./i, evidence: "zapgrpc package/import evidence was detected." },
    { signal: "zapio", pattern: /go\.uber\.org\/zap\/zapio|zapio\./i, evidence: "zapio package/import evidence was detected." },
    { signal: "zaptest", pattern: /go\.uber\.org\/zap\/zaptest|zaptest\./i, evidence: "zaptest package/import evidence was detected." },
    { signal: "zerolog", pattern: /github\.com\/rs\/zerolog["']?|zerolog\.New|zerolog\.Logger|zerolog\.Event/i, evidence: "Zerolog package/import evidence was detected." },
    { signal: "zerolog-log", pattern: /github\.com\/rs\/zerolog\/log|log\.(Trace|Debug|Info|Warn|Error|Fatal|Panic)\s*\(\s*\)\./i, evidence: "zerolog/log package/import evidence was detected." },
    { signal: "zerolog-hlog", pattern: /github\.com\/rs\/zerolog\/hlog|hlog\./i, evidence: "zerolog hlog package/import evidence was detected." },
    { signal: "zerolog-diode", pattern: /github\.com\/rs\/zerolog\/diode|diode\.NewWriter/i, evidence: "zerolog diode package/import evidence was detected." },
    { signal: "zerolog-journald", pattern: /github\.com\/rs\/zerolog\/journald|journald\./i, evidence: "zerolog journald package/import evidence was detected." },
    { signal: "zerolog-syslog", pattern: /github\.com\/rs\/zerolog\/syslog|SyslogLevelWriter|syslog\./i, evidence: "zerolog syslog package/import evidence was detected." },
    { signal: "zerolog-pkgerrors", pattern: /github\.com\/rs\/zerolog\/pkgerrors|pkgerrors\.MarshalStack/i, evidence: "zerolog pkgerrors package/import evidence was detected." },
    { signal: "winston", pattern: /["']winston["']|\bwinston\b/i, evidence: "winston package/import evidence was detected." },
    { signal: "bunyan", pattern: /["']bunyan["']|\bbunyan\b/i, evidence: "bunyan package/import evidence was detected." },
    { signal: "loglevel", pattern: /["']loglevel["']|\bloglevel\b/i, evidence: "loglevel package/import evidence was detected." },
    { signal: "@pinojs/redact", pattern: /@pinojs\/redact/i, evidence: "@pinojs/redact package/import evidence was detected." }
  ];
  return loggingReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function loggingReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LoggingReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/logging-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildFeatureFlagReadinessReport(walk: WalkResult): Promise<FeatureFlagReadinessReport> {
  const sourceFiles = await featureFlagReadinessSourceFiles(walk);
  const featureFlagSetups = featureFlagReadinessSetups(sourceFiles);
  const evaluationSignals = featureFlagReadinessEvaluationSignals(sourceFiles);
  const contextSignals = featureFlagReadinessContextSignals(sourceFiles);
  const lifecycleSignals = featureFlagReadinessLifecycleSignals(sourceFiles);
  const packageSignals = featureFlagReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasOpenFeaturePackage = packageSignals.some((item) => item.signal.startsWith("@openfeature/") && item.readiness === "ready");
  const hasSetup = featureFlagSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = featureFlagSetups.some((item) => item.readiness === "ready");
  const hasEvaluation = evaluationSignals.some((item) => ["boolean", "string", "number", "object", "details", "on-off", "feature-value", "experiment-run"].includes(item.signal) && item.readiness === "ready");
  const hasDefaultValue = evaluationSignals.some((item) => item.signal === "default-value" && item.readiness === "ready");
  const hasContext = contextSignals.some((item) => ["evaluation-context", "targeting-key", "user-attributes", "request-context", "transaction-context", "attributes", "sticky-bucket", "segments", "environment", "project"].includes(item.signal) && item.readiness === "ready");
  const hasProviderReadySignal = lifecycleSignals.some((item) => ["set-provider-and-wait", "ready-event", "sse-stream", "auto-refresh", "bootstrap"].includes(item.signal) && item.readiness === "ready");
  const hasHooks = lifecycleSignals.some((item) => item.signal === "hooks" && item.readiness === "ready");
  const hasTracking = lifecycleSignals.some((item) => ["tracking", "metrics", "impression-data"].includes(item.signal) && item.readiness === "ready");
  const hasShutdown = lifecycleSignals.some((item) => item.signal === "shutdown" && item.readiness === "ready");
  const hasMultiProvider = lifecycleSignals.some((item) => item.signal === "multi-provider" && item.readiness === "ready");
  const hasRolloutControl = evaluationSignals.some((item) => ["variant", "forced-variation", "safe-rollout"].includes(item.signal) && item.readiness === "ready")
    || contextSignals.some((item) => ["segments", "sticky-bucket", "hash-attribute"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: FeatureFlagReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasEvaluation) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the feature-flag strategy before claiming feature-flag readiness.",
      why: "Feature-flag readiness starts with an explicit provider, client, flag evaluation, targeting context, lifecycle hook, or package dependency.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  if (hasOpenFeaturePackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each OpenFeature package signal with provider setup, client access, and flag evaluations.",
      why: "OpenFeature readiness requires a registered provider and client calls that resolve flags through the provider abstraction.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  if ((hasOpenFeaturePackage || hasSetup || hasEvaluation) && !hasProviderReadySignal) {
    riskQueue.push({
      priority: "medium",
      action: "Wait for provider readiness or handle READY/ERROR events before evaluating flags.",
      why: "Flags can default while providers initialize unless setProviderAndWait or provider events guard evaluation flow.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  if (hasEvaluation && !hasDefaultValue) {
    riskQueue.push({
      priority: "medium",
      action: "Check that every flag evaluation has a safe default value.",
      why: "Feature flags must remain deterministic when a provider is down, a flag is missing, or targeting data is incomplete.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  if (hasEvaluation && !hasContext) {
    riskQueue.push({
      priority: "medium",
      action: "Bind evaluation context such as targetingKey, user attributes, request data, or transaction context.",
      why: "Targeted rollouts and experiments need stable context so users receive consistent variants.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  if ((hasEvaluation || hasHooks) && !hasTracking) {
    riskQueue.push({
      priority: "low",
      action: "Add tracking for experiments or conversion-sensitive flags.",
      why: "OpenFeature tracking connects user actions to flag evaluations for A/B tests and rollout analysis.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  if (hasEvaluation && !hasRolloutControl) {
    riskQueue.push({
      priority: "low",
      action: "Document rollout controls such as variants, segments, sticky buckets, or safe rollout ramps.",
      why: "Feature-flag experiments need stable assignment and rollout controls so learners can distinguish toggles from production experiment infrastructure.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  if ((hasSetup || hasMultiProvider) && !hasShutdown) {
    riskQueue.push({
      priority: "low",
      action: "Document provider shutdown and cleanup behavior.",
      why: "Server-side providers may hold sockets, streams, polling loops, or caches that should close cleanly.",
      relatedHref: "html/feature-flag-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run feature-flag integration tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not initialize providers, fetch remote flags, evaluate live targeting rules, emit tracking events, close providers, or run the analyzed project's tests.",
    relatedHref: "html/feature-flag-readiness.html"
  });

  return {
    summary: `OpenFeature/Unleash/GrowthBook식 feature-flag readiness report: setup ${featureFlagSetups.length}개, evaluation signal ${evaluationSignals.length}개, context signal ${contextSignals.length}개, lifecycle signal ${lifecycleSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OpenFeature setProviderAndWait setProvider getClient getBooleanValue getStringValue getNumberValue getObjectValue getBooleanDetails EvaluationContext targetingKey hooks events tracking shutdown MultiProvider Unleash flexibleRollout constraints segments variants impressionData stickiness stale archived GrowthBook isOn isOff getFeatureValue trackingCallback stickyBucket remoteEval subscribeToChanges EventSource encryptedFeatures safe rollout",
    featureFlagSetups,
    evaluationSignals,
    contextSignals,
    lifecycleSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"OpenFeature|setProvider|setProviderAndWait|getClient|MultiProvider|FeatureFlag\" src app pages packages", purpose: "Inventory OpenFeature provider registration, clients, domains, multi-provider setup, and declarative flag components." },
      { command: "rg \"getBooleanValue|getStringValue|getNumberValue|getObjectValue|getBooleanDetails|getStringDetails|getNumberDetails|getObjectDetails|GrowthBook|isOn\\(|isOff\\(|getFeatureValue|UnleashClient|isEnabled|getVariant|useFlag|useBooleanFlag\" src app pages packages", purpose: "Find flag evaluations, detailed evaluations, React hooks, GrowthBook/Unleash SDK checks, variants, and default values." },
      { command: "rg \"EvaluationContext|targetingKey|userId|attributes|setAttributes|updateAttributes|stickyBucket|stickiness|segments|hashAttribute|contextFactory|request\" src app pages packages", purpose: "Review targeting context, request context, user attributes, sticky assignment, segments, and transaction-context propagation." },
      { command: "rg \"addHooks|before|after|error|finally|addHandler|READY|ERROR|PROVIDER|track\\(|trackingCallback|impressionData|metrics|EventSource|subscribeToChanges|autoRefresh|remoteEval|shutdown|close\\(\" src app pages packages", purpose: "Inspect hooks, provider events, metrics, SSE refresh, remote evaluation, tracking, shutdown, and close behavior." },
      { command: "rg \"@openfeature|launchdarkly|unleash|@unleash|growthbook|@growthbook|flagsmith|splitio\" package.json pnpm-lock.yaml yarn.lock package-lock.json", purpose: "Check feature-flag SDK packages and provider dependencies." },
      { command: "npx vitest run", purpose: "Run local tests that exercise default values, targeting context, provider readiness, hooks, sticky assignment, metrics, and rollout branches." }
    ],
    learnerNextSteps: [
      "먼저 provider setup 파일에서 OpenFeature.setProviderAndWait, setProvider, domain provider, MultiProvider, Unleash client, GrowthBook 초기화가 어디서 등록되는지 확인하세요.",
      "getBooleanValue/getStringValue/getNumberValue/getObjectValue, Details 호출, isOn/isOff/getFeatureValue/isEnabled/getVariant를 따라가며 flag key와 default value가 안전한지 확인하세요.",
      "EvaluationContext, targetingKey, user attributes, request context, sticky bucket, segments, environment/project context가 일관되게 전달되는지 비교하세요.",
      "hooks, provider READY/ERROR events, metrics, impressionData, trackingCallback, SSE/autoRefresh/remoteEval, shutdown/close 흐름이 있으면 rollout 관측과 cleanup 책임을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 provider 초기화, 원격 flag fetch, targeting rule 평가, tracking event 전송, sticky assignment 저장은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type FeatureFlagReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function featureFlagReadinessSourceFiles(walk: WalkResult): Promise<FeatureFlagReadinessSourceFile[]> {
  const files: FeatureFlagReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !featureFlagReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!featureFlagReadinessPathSignal(file.relPath) && !featureFlagReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function featureFlagReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return featureFlagReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function featureFlagReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(feature[-_ ]?flags?|flags?|toggles?|rollouts?|experiments?|openfeature|launchdarkly|unleash|growthbook|flagsmith)(\/|\.|-|_|$)/i.test(filePath);
}

function featureFlagReadinessContentSignal(text: string): boolean {
  return /\b(OpenFeature|setProviderAndWait|setProvider|getClient|getBooleanValue|getStringValue|getNumberValue|getObjectValue|getBooleanDetails|getStringDetails|getNumberDetails|getObjectDetails|EvaluationContext|targetingKey|FeatureFlag|useFlag|useBooleanFlag|MultiProvider|launchdarkly|unleash|UnleashClient|flexibleRollout|impressionData|stickiness|growthbook|GrowthBook|isOn|isOff|getFeatureValue|trackingCallback|stickyBucket|remoteEval|subscribeToChanges|EventSource|flagsmith)\b/i.test(text);
}

function featureFlagReadinessSetups(sourceFiles: FeatureFlagReadinessSourceFile[]): FeatureFlagReadinessReport["featureFlagSetups"] {
  const rows: FeatureFlagReadinessReport["featureFlagSetups"] = [];
  for (const source of sourceFiles) {
    const providerSetupCount = countMatches(source.text, /OpenFeature\.setProvider(?:AndWait)?\s*\(|setProvider(?:AndWait)?\s*\(|new\s+.*Provider\b|MultiProvider\s*\(|new\s+GrowthBook\b|new\s+GrowthBookClient\b|new\s+UnleashClient\b|startUnleash\s*\(|initialize\s*\(/gi);
    const clientCount = countMatches(source.text, /OpenFeature\.getClient\s*\(|getClient\s*\(|OpenFeatureProvider\b|OpenFeatureClient\b|GrowthBookClient\b|new\s+GrowthBook\b|UnleashClient\b|getFrontendApi\s*\(/gi);
    const evaluationCount = countMatches(source.text, /get(Boolean|String|Number|Object)(Value|Details)\s*\(|use(Boolean|String|Number|Object)?Flag(Value|Details)?\s*\(|<FeatureFlag\b|isOn\s*\(|isOff\s*\(|getFeatureValue\s*\(|getFeature\s*\(|\.run\s*\(|isEnabled\s*\(|getVariant\s*\(/gi);
    const contextCount = countMatches(source.text, /EvaluationContext|targetingKey|setContext\s*\(|setTransactionContext\s*\(|contextFactory|userId|attributes|setAttributes\s*\(|updateAttributes\s*\(|stickyBucket|stickiness|segments?|environment|project/i);
    const hookCount = countMatches(source.text, /addHooks?\s*\(|hooks\s*:|before\s*:|after\s*:|error\s*:|finally\s*:|addHandler\s*\(|track\s*\(|trackingCallback|impressionData|metrics|EventSource|subscribeToChanges|autoRefresh|remoteEval/gi);
    const hasSetupSignal = providerSetupCount + clientCount + evaluationCount + contextCount + hookCount > 0 || /\b(OpenFeature|Unleash|GrowthBook|feature flag|flag evaluation|rollout|experiment)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: featureFlagReadinessProvider(source),
      providerSetupCount,
      clientCount,
      evaluationCount,
      contextCount,
      hookCount,
      readiness: providerSetupCount > 0 && clientCount > 0 && evaluationCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains provider setup ${providerSetupCount}, clients ${clientCount}, evaluations ${evaluationCount}, contexts ${contextCount}, hooks/events ${hookCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function featureFlagReadinessProvider(source: FeatureFlagReadinessSourceFile): FeatureFlagReadinessReport["featureFlagSetups"][number]["provider"] {
  if (/@growthbook|GrowthBook|growthbook/i.test(source.text)) return "growthbook";
  if (/unleash|UnleashClient/i.test(source.text)) return "unleash";
  if (/@openfeature|OpenFeature|setProviderAndWait|EvaluationContext/i.test(source.text)) return "openfeature";
  if (/launchdarkly|LDClient|LDProvider/i.test(source.text)) return "launchdarkly";
  if (/flagsmith/i.test(source.text)) return "flagsmith";
  if (/\b(feature flag|flag evaluation|toggle|rollout|experiment)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function featureFlagReadinessEvaluationSignals(sourceFiles: FeatureFlagReadinessSourceFile[]): FeatureFlagReadinessReport["evaluationSignals"] {
  const specs: Array<{ signal: FeatureFlagReadinessReport["evaluationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "boolean", pattern: /getBoolean(Value|Details)\s*\(|useBooleanFlag(Value|Details)?\s*\(|BooleanFeatureFlag/i, evidence: "boolean flag evaluation evidence was detected." },
    { signal: "string", pattern: /getString(Value|Details)\s*\(|useStringFlag(Value|Details)?\s*\(|StringFeatureFlag/i, evidence: "string flag evaluation evidence was detected." },
    { signal: "number", pattern: /getNumber(Value|Details)\s*\(|useNumberFlag(Value|Details)?\s*\(|NumberFeatureFlag/i, evidence: "number flag evaluation evidence was detected." },
    { signal: "object", pattern: /getObject(Value|Details)\s*\(|useObjectFlag(Value|Details)?\s*\(|ObjectFeatureFlag/i, evidence: "object flag evaluation evidence was detected." },
    { signal: "details", pattern: /get(Boolean|String|Number|Object)Details\s*\(|use(Boolean|String|Number|Object)FlagDetails\s*\(|EvaluationDetails/i, evidence: "detailed evaluation evidence was detected." },
    { signal: "default-value", pattern: /get(Boolean|String|Number|Object)(Value|Details)\s*\([^,]+,\s*[^,)]+|defaultValue\s*=/i, evidence: "default value evidence was detected." },
    { signal: "variant", pattern: /variant|defaultVariant|matchValue|reason|flagMetadata/i, evidence: "variant/reason metadata evidence was detected." },
    { signal: "flag-key", pattern: /flagKey|flag[-_ ]?key|["'`][A-Za-z0-9_.:-]+["'`]\s*,\s*(true|false|["'`]|\\d|{)/i, evidence: "flag key evidence was detected." },
    { signal: "on-off", pattern: /\b(isOn|isOff|isEnabled)\s*\(/i, evidence: "SDK on/off evaluation evidence was detected." },
    { signal: "feature-value", pattern: /\b(getFeatureValue|getFeature)\s*\(/i, evidence: "feature value lookup evidence was detected." },
    { signal: "experiment-run", pattern: /\brun\s*\(\s*(experiment|\{)|Experiment\b/i, evidence: "experiment run evidence was detected." },
    { signal: "forced-variation", pattern: /forcedVariations?|forceVariation|setForcedVariations/i, evidence: "forced variation evidence was detected." },
    { signal: "prerequisite", pattern: /prerequisites?|requiresFlag/i, evidence: "flag prerequisite evidence was detected." },
    { signal: "safe-rollout", pattern: /safe[-_ ]?rollout|saferollout|rampPresets|10%\s*(?:->|to)\s*50%\s*(?:->|to)\s*100%|progressive rollout/i, evidence: "safe rollout ramp evidence was detected." }
  ];
  return featureFlagReadinessSignalFromSpecs(sourceFiles, specs, "evaluation", "signal");
}

function featureFlagReadinessContextSignals(sourceFiles: FeatureFlagReadinessSourceFile[]): FeatureFlagReadinessReport["contextSignals"] {
  const specs: Array<{ signal: FeatureFlagReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "evaluation-context", pattern: /EvaluationContext|setContext\s*\(|context\s*:/i, evidence: "evaluation context evidence was detected." },
    { signal: "targeting-key", pattern: /targetingKey|targeting[-_ ]?key/i, evidence: "targeting key evidence was detected." },
    { signal: "user-attributes", pattern: /userId|user_id|email|locale|country|attributes|traits|segment/i, evidence: "user attribute targeting evidence was detected." },
    { signal: "request-context", pattern: /request|headers|req\.|ExecutionContext|contextFactory/i, evidence: "request-derived context evidence was detected." },
    { signal: "transaction-context", pattern: /setTransactionContext|TransactionContext|TransactionContextPropagator|AsyncLocalStorage/i, evidence: "transaction context evidence was detected." },
    { signal: "domain", pattern: /getClient\s*\(\s*["'`][^"'`]+["'`]|domain\s*:/i, evidence: "domain-scoped client evidence was detected." },
    { signal: "react-provider", pattern: /OpenFeatureProvider|FeatureFlag\b|useFlag|useBooleanFlag/i, evidence: "React provider/hook evidence was detected." },
    { signal: "nest-context-factory", pattern: /ContextFactory|EvaluationContextInterceptor|OpenFeatureModule|RequireFlagsEnabled|BooleanFeatureFlag/i, evidence: "NestJS context factory evidence was detected." },
    { signal: "attributes", pattern: /setAttributes\s*\(|updateAttributes\s*\(|attributesJson|globalAttributes/i, evidence: "attribute mutation evidence was detected." },
    { signal: "sticky-bucket", pattern: /stickyBucket|StickyBucket|sticky bucket|stickiness/i, evidence: "sticky assignment evidence was detected." },
    { signal: "hash-attribute", pattern: /hashAttribute|hash attribute/i, evidence: "hash attribute evidence was detected." },
    { signal: "segments", pattern: /segments?|constraints/i, evidence: "segment or constraint targeting evidence was detected." },
    { signal: "environment", pattern: /environment/i, evidence: "environment-scoped targeting evidence was detected." },
    { signal: "project", pattern: /project/i, evidence: "project-scoped targeting evidence was detected." },
    { signal: "qa-mode", pattern: /qaMode|QA mode/i, evidence: "QA mode evidence was detected." }
  ];
  return featureFlagReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function featureFlagReadinessLifecycleSignals(sourceFiles: FeatureFlagReadinessSourceFile[]): FeatureFlagReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: FeatureFlagReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-provider", pattern: /setProvider\s*\(/i, evidence: "synchronous provider setup evidence was detected." },
    { signal: "set-provider-and-wait", pattern: /setProviderAndWait\s*\(|await\s+OpenFeature\.setProvider/i, evidence: "awaitable provider setup evidence was detected." },
    { signal: "ready-event", pattern: /READY|ProviderEvents\.Ready|PROVIDER_READY|addHandler\s*\(/i, evidence: "provider ready event evidence was detected." },
    { signal: "error-event", pattern: /ERROR|ProviderEvents\.Error|PROVIDER_ERROR|error\s*=>|catch\s*\(/i, evidence: "provider error event evidence was detected." },
    { signal: "hooks", pattern: /addHooks?\s*\(|hooks\s*:|before\s*:|after\s*:|finally\s*:|HookContext/i, evidence: "hook lifecycle evidence was detected." },
    { signal: "tracking", pattern: /\.track\s*\(|TrackingEventDetails|tracking/i, evidence: "tracking event evidence was detected." },
    { signal: "shutdown", pattern: /OpenFeature\.close\s*\(|\.close\s*\(|shutdown|onClose|onApplicationShutdown/i, evidence: "shutdown/close evidence was detected." },
    { signal: "multi-provider", pattern: /MultiProvider|FirstMatchStrategy|FirstSuccessfulStrategy|ComparisonStrategy/i, evidence: "multi-provider strategy evidence was detected." },
    { signal: "sse-stream", pattern: /EventSource|SSE|subscribeToChanges/i, evidence: "SSE streaming feature refresh evidence was detected." },
    { signal: "auto-refresh", pattern: /autoRefresh|refreshFeatures/i, evidence: "automatic feature refresh evidence was detected." },
    { signal: "bootstrap", pattern: /bootstrap|initSync|featuresJson/i, evidence: "bootstrap or synchronous init evidence was detected." },
    { signal: "metrics", pattern: /metrics|impact metrics|trackingCallback/i, evidence: "rollout metric evidence was detected." },
    { signal: "impression-data", pattern: /impressionData|impression data/i, evidence: "impression data evidence was detected." },
    { signal: "encrypted-payload", pattern: /encryptedFeatures|encryptedExperiments|encryptionKey/i, evidence: "encrypted feature payload evidence was detected." },
    { signal: "remote-eval", pattern: /remoteEval|remote evaluation/i, evidence: "remote evaluation evidence was detected." }
  ];
  return featureFlagReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function featureFlagReadinessPackageSignals(sourceFiles: FeatureFlagReadinessSourceFile[]): FeatureFlagReadinessReport["packageSignals"] {
  const specs: Array<{ signal: FeatureFlagReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@openfeature/server-sdk", pattern: /@openfeature\/server-sdk/i, evidence: "@openfeature/server-sdk package/import evidence was detected." },
    { signal: "@openfeature/web-sdk", pattern: /@openfeature\/web-sdk/i, evidence: "@openfeature/web-sdk package/import evidence was detected." },
    { signal: "@openfeature/react-sdk", pattern: /@openfeature\/react-sdk/i, evidence: "@openfeature/react-sdk package/import evidence was detected." },
    { signal: "@openfeature/nestjs-sdk", pattern: /@openfeature\/nestjs-sdk|@openfeature\/nest/i, evidence: "@openfeature/nestjs-sdk package/import evidence was detected." },
    { signal: "launchdarkly", pattern: /launchdarkly|launchdarkly-js-client-sdk|@launchdarkly/i, evidence: "LaunchDarkly package/import evidence was detected." },
    { signal: "unleash", pattern: /unleash-client|@unleash|unleash/i, evidence: "Unleash package/import evidence was detected." },
    { signal: "unleash-client", pattern: /unleash-client/i, evidence: "unleash-client package/import evidence was detected." },
    { signal: "@unleash/proxy-client-react", pattern: /@unleash\/proxy-client-react/i, evidence: "@unleash/proxy-client-react package/import evidence was detected." },
    { signal: "growthbook", pattern: /@growthbook|growthbook/i, evidence: "GrowthBook package/import evidence was detected." },
    { signal: "@growthbook/growthbook", pattern: /@growthbook\/growthbook/i, evidence: "@growthbook/growthbook package/import evidence was detected." },
    { signal: "@growthbook/growthbook-react", pattern: /@growthbook\/growthbook-react/i, evidence: "@growthbook/growthbook-react package/import evidence was detected." },
    { signal: "flagsmith", pattern: /flagsmith/i, evidence: "Flagsmith package/import evidence was detected." }
  ];
  return featureFlagReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function featureFlagReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: FeatureFlagReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/feature-flag-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildRateLimitReadinessReport(walk: WalkResult): Promise<RateLimitReadinessReport> {
  const sourceFiles = await rateLimitReadinessSourceFiles(walk);
  const rateLimitSetups = rateLimitReadinessSetups(sourceFiles);
  const quotaSignals = rateLimitReadinessQuotaSignals(sourceFiles);
  const identitySignals = rateLimitReadinessIdentitySignals(sourceFiles);
  const storeSignals = rateLimitReadinessStoreSignals(sourceFiles);
  const responseSignals = rateLimitReadinessResponseSignals(sourceFiles);
  const resilienceSignals = rateLimitReadinessResilienceSignals(sourceFiles);
  const packageSignals = rateLimitReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasFlexiblePackage = packageSignals.some((item) => item.signal === "rate-limiter-flexible" && item.readiness === "ready");
  const hasSetup = rateLimitSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = rateLimitSetups.some((item) => item.readiness === "ready");
  const hasConsume = rateLimitSetups.some((item) => item.consumeCount > 0) || resilienceSignals.some((item) => item.signal === "penalty" && item.readiness === "ready");
  const hasQuota = quotaSignals.some((item) => ["points", "duration", "limit", "window"].includes(item.signal) && item.readiness === "ready");
  const hasIdentity = identitySignals.some((item) => ["ip", "user-id", "authorization-token", "api-route", "key-prefix", "get-key"].includes(item.signal) && item.readiness === "ready");
  const hasStore = storeSignals.some((item) => item.readiness === "ready");
  const hasDistributedStore = storeSignals.some((item) => item.readiness === "ready" && item.signal !== "memory");
  const hasRetryResponse = responseSignals.some((item) => ["retry-after", "x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset", "too-many-requests"].includes(item.signal) && item.readiness === "ready");
  const hasResilience = resilienceSignals.some((item) => ["insurance-limiter", "reject-if-not-ready", "atomic-increment", "store-client"].includes(item.signal) && item.readiness === "ready");
  const hasBlocking = quotaSignals.some((item) => ["block-duration", "in-memory-block"].includes(item.signal) && item.readiness === "ready") || resilienceSignals.some((item) => item.signal === "block" && item.readiness === "ready");

  const riskQueue: RateLimitReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasConsume) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the rate-limit strategy before claiming rate-limit readiness.",
      why: "Rate-limit readiness starts with an explicit limiter package, limiter construction, quota/window policy, identity key, store, consume path, or response headers.",
      relatedHref: "html/rate-limit-readiness.html"
    });
  }
  if (hasFlexiblePackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each rate-limiter-flexible package signal with limiter construction, quota options, and consume calls.",
      why: "rate-limiter-flexible readiness requires an instantiated limiter and a guarded code path that consumes points for a stable key.",
      relatedHref: "html/rate-limit-readiness.html"
    });
  }
  if ((hasPackage || hasSetup || hasConsume) && !hasQuota) {
    riskQueue.push({
      priority: "high",
      action: "Define quota and window policy with points, duration, limit, or window settings.",
      why: "A limiter without an explicit quota/window is hard to reason about and may silently allow or deny too much traffic.",
      relatedHref: "html/rate-limit-readiness.html"
    });
  }
  if ((hasPackage || hasReadySetup || hasConsume) && !hasIdentity) {
    riskQueue.push({
      priority: "medium",
      action: "Bind every limiter to a stable identity key such as IP, user ID, token, API route, or keyPrefix/getKey.",
      why: "Rate limits are only useful when the key matches the abuse boundary being protected.",
      relatedHref: "html/rate-limit-readiness.html"
    });
  }
  if (hasReadySetup && !hasStore) {
    riskQueue.push({
      priority: "medium",
      action: "Document whether rate limiting is in-memory only or backed by a shared store.",
      why: "In-memory limiters reset on restart and do not coordinate across multiple instances unless a shared store or cluster wrapper is present.",
      relatedHref: "html/rate-limit-readiness.html"
    });
  }
  if (hasDistributedStore && !hasResilience) {
    riskQueue.push({
      priority: "medium",
      action: "Review store readiness, atomic increment behavior, not-ready rejection, and insurance fallback.",
      why: "Distributed rate limits depend on the backing store staying available and updating counters atomically.",
      relatedHref: "html/rate-limit-readiness.html"
    });
  }
  if ((hasSetup || hasConsume || hasBlocking) && !hasRetryResponse) {
    riskQueue.push({
      priority: "medium",
      action: "Return Retry-After, X-RateLimit headers, or a clear 429 response for limited requests.",
      why: "Clients need deterministic feedback when a limiter blocks or delays requests.",
      relatedHref: "html/rate-limit-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run rate-limit integration checks only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not initialize limiters, consume points, mutate Redis or other stores, sleep for windows, emit responses, or run the analyzed project's tests.",
    relatedHref: "html/rate-limit-readiness.html"
  });

  return {
    summary: `rate-limiter-flexible식 rate-limit readiness report: setup ${rateLimitSetups.length}개, quota signal ${quotaSignals.length}개, identity signal ${identitySignals.length}개, store signal ${storeSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "rate-limiter-flexible RateLimiterMemory RateLimiterRedis points duration blockDuration keyPrefix storeClient consume penalty reward insuranceLimiter msBeforeNext remainingPoints Retry-After X-RateLimit",
    rateLimitSetups,
    quotaSignals,
    identitySignals,
    storeSignals,
    responseSignals,
    resilienceSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"rate-limiter-flexible|RateLimiterMemory|RateLimiterRedis|RateLimiterQueue|express-rate-limit|@fastify/rate-limit|@upstash/ratelimit\" src app pages packages", purpose: "Inventory limiter packages, constructors, framework middleware, and queue wrappers." },
      { command: "rg \"points|duration|blockDuration|windowMs|max|limit|execEvenly|inMemoryBlock\" src app pages packages", purpose: "Review quota, time window, blocking, smoothing, and in-memory block policy." },
      { command: "rg \"consume\\(|penalty\\(|reward\\(|remainingPoints|msBeforeNext|Retry-After|X-RateLimit|429|Too Many Requests\" src app pages packages", purpose: "Trace consume paths, response shaping, retry timing, headers, and blocked-request handling." },
      { command: "rg \"keyPrefix|getKey|req\\.ip|remoteAddress|userId|authorization|apiKey|skip|black|white\" src app pages packages", purpose: "Check limiter identity keys, skip rules, API route scoping, and allow/deny lists." },
      { command: "rg \"storeClient|insuranceLimiter|redis|valkey|mongo|postgres|mysql|sqlite|dynamodb|memcached|prisma|rejectIfRedisNotReady\" src app pages packages package.json", purpose: "Inspect backing stores, store readiness, failover, and not-ready behavior." },
      { command: "npx vitest run", purpose: "Run local tests that exercise quota exhaustion, identity scoping, response headers, store fallback, and recovery behavior." }
    ],
    learnerNextSteps: [
      "먼저 limiter setup 파일에서 RateLimiterMemory/Redis, express-rate-limit, @fastify/rate-limit, @upstash/ratelimit가 어디서 생성되는지 확인하세요.",
      "points, duration, blockDuration, windowMs, max, limit 같은 quota/window 값을 찾아 실제 보호하려는 요청량과 맞는지 비교하세요.",
      "consume, penalty, reward, block 호출을 따라가며 IP, userId, token, route, keyPrefix/getKey가 올바른 abuse boundary를 나타내는지 확인하세요.",
      "Redis, Valkey, Mongo, Postgres, MySQL, SQLite, DynamoDB, Memcached, Prisma 같은 store가 있으면 atomic increment, not-ready reject, insuranceLimiter를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 point 소비, store mutation, window sleep, 429/Retry-After 응답은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type RateLimitReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function rateLimitReadinessSourceFiles(walk: WalkResult): Promise<RateLimitReadinessSourceFile[]> {
  const files: RateLimitReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !rateLimitReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!rateLimitReadinessPathSignal(file.relPath) && !rateLimitReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function rateLimitReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return rateLimitReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function rateLimitReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(rate[-_ ]?limits?|ratelimits?|throttle|throttling|quota|abuse|bruteforce|rate-limiter-flexible|limiters?)(\/|\.|-|_|$)/i.test(filePath);
}

function rateLimitReadinessContentSignal(text: string): boolean {
  return /\b(rate-limiter-flexible|RateLimiter(Memory|Redis|Cluster|Queue|Union)|BurstyRateLimiter|express-rate-limit|@fastify\/rate-limit|@upstash\/ratelimit|points\s*:|duration\s*:|blockDuration|keyPrefix|storeClient|consume\s*\(|penalty\s*\(|reward\s*\(|insuranceLimiter|msBeforeNext|remainingPoints|Retry-After|X-RateLimit)\b/i.test(text);
}

function rateLimitReadinessSetups(sourceFiles: RateLimitReadinessSourceFile[]): RateLimitReadinessReport["rateLimitSetups"] {
  const rows: RateLimitReadinessReport["rateLimitSetups"] = [];
  for (const source of sourceFiles) {
    const limiterSetupCount = countMatches(source.text, /\bnew\s+RateLimiter\w+\b|\bRateLimiter(Memory|Redis|Cluster|Queue|Union)\s*\(|rateLimit\s*\(|new\s+Ratelimit\b|Ratelimit\s*\(/gi);
    const windowCount = countMatches(source.text, /\bpoints\s*:|\bduration\s*:|\bblockDuration\s*:|\bwindowMs\s*:|\bmax\s*:|\blimit\s*:|\bslidingWindow\s*\(|\bfixedWindow\s*\(/gi);
    const storeCount = countMatches(source.text, /\bstoreClient\s*:|\bRedis\b|\bValkey\b|\bMongo\b|\bPostgres\b|\bMySQL\b|\bSQLite\b|\bDynamoDB\b|\bMemcached\b|\bPrisma\b|\bstore\s*:/gi);
    const consumeCount = countMatches(source.text, /\.consume\s*\(|\bconsume\s*\(|\.penalty\s*\(|\.reward\s*\(|\.block\s*\(/gi);
    const headerCount = countMatches(source.text, /Retry-After|X-RateLimit-(Limit|Remaining|Reset)|remainingPoints|msBeforeNext|Too Many Requests|\b429\b/gi);
    const hasSetupSignal = limiterSetupCount + windowCount + storeCount + consumeCount + headerCount > 0 || /\b(rate limit|rate-limit|ratelimit|throttle|quota|bruteforce)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: rateLimitReadinessProvider(source),
      limiterSetupCount,
      windowCount,
      storeCount,
      consumeCount,
      headerCount,
      readiness: limiterSetupCount > 0 && windowCount > 0 && consumeCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains limiter setup ${limiterSetupCount}, quota/window signals ${windowCount}, store signals ${storeCount}, consume paths ${consumeCount}, response headers ${headerCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function rateLimitReadinessProvider(source: RateLimitReadinessSourceFile): RateLimitReadinessReport["rateLimitSetups"][number]["provider"] {
  if (/rate-limiter-flexible|RateLimiter(Memory|Redis|Cluster|Queue|Union)|BurstyRateLimiter/i.test(source.text)) return "rate-limiter-flexible";
  if (/express-rate-limit|\brateLimit\s*\(/i.test(source.text)) return "express-rate-limit";
  if (/@fastify\/rate-limit|fastify-rate-limit/i.test(source.text)) return "fastify-rate-limit";
  if (/@upstash\/ratelimit|new\s+Ratelimit\b|Ratelimit\s*\(/i.test(source.text)) return "upstash-ratelimit";
  if (/\b(rate limit|rate-limit|ratelimit|throttle|quota|bruteforce)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function rateLimitReadinessQuotaSignals(sourceFiles: RateLimitReadinessSourceFile[]): RateLimitReadinessReport["quotaSignals"] {
  const specs: Array<{ signal: RateLimitReadinessReport["quotaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "points", pattern: /\bpoints\s*:|consumedPoints|remainingPoints/i, evidence: "points/remaining-points quota evidence was detected." },
    { signal: "duration", pattern: /\bduration\s*:|msBeforeNext|resetTime|durationMs/i, evidence: "duration/window timing evidence was detected." },
    { signal: "limit", pattern: /\blimit\s*:|\bmax\s*:|RateLimit-Limit|X-RateLimit-Limit/i, evidence: "limit/max evidence was detected." },
    { signal: "window", pattern: /\bwindowMs\s*:|slidingWindow|fixedWindow|window\s*:/i, evidence: "window policy evidence was detected." },
    { signal: "block-duration", pattern: /\bblockDuration\s*:|\.block\s*\(|blocked|blocklist/i, evidence: "block duration evidence was detected." },
    { signal: "exec-evenly", pattern: /\bexecEvenly\b|execEvenlyMinDelayMs|evenly/i, evidence: "even execution/delay smoothing evidence was detected." },
    { signal: "in-memory-block", pattern: /inMemoryBlockOnConsumed|inMemoryBlockDuration|deleteInMemoryBlockedAll/i, evidence: "in-memory block evidence was detected." },
    { signal: "queue", pattern: /RateLimiterQueue|limiterQueue|queueLimiter/i, evidence: "rate-limit queue evidence was detected." }
  ];
  return rateLimitReadinessSignalFromSpecs(sourceFiles, specs, "quota", "signal");
}

function rateLimitReadinessIdentitySignals(sourceFiles: RateLimitReadinessSourceFile[]): RateLimitReadinessReport["identitySignals"] {
  const specs: Array<{ signal: RateLimitReadinessReport["identitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ip", pattern: /req\.ip|request\.ip|remoteAddress|ipAddress|x-forwarded-for/i, evidence: "IP-based limiter identity evidence was detected." },
    { signal: "user-id", pattern: /userId|user_id|accountId|tenantId|session\.user|principal/i, evidence: "user/account limiter identity evidence was detected." },
    { signal: "authorization-token", pattern: /authorization|bearer|api[-_ ]?key|token|jwt/i, evidence: "authorization token identity evidence was detected." },
    { signal: "api-route", pattern: /route|pathname|path\s*:|req\.path|req\.route|endpoint|method/i, evidence: "API route scoped limiter evidence was detected." },
    { signal: "key-prefix", pattern: /\bkeyPrefix\s*:|prefix\s*:|namespace/i, evidence: "keyPrefix/namespace evidence was detected." },
    { signal: "get-key", pattern: /\bgetKey\s*\(|keyGenerator\s*:|identifier\s*:/i, evidence: "custom key generator evidence was detected." },
    { signal: "black-white-list", pattern: /RLWrapperBlackAndWhite|blacklist|whitelist|allowlist|denylist/i, evidence: "allow/deny list wrapper evidence was detected." },
    { signal: "skip", pattern: /\bskip\s*:|skipFailedRequests|skipSuccessfulRequests|skipIf/i, evidence: "skip rule evidence was detected." }
  ];
  return rateLimitReadinessSignalFromSpecs(sourceFiles, specs, "identity", "signal");
}

function rateLimitReadinessStoreSignals(sourceFiles: RateLimitReadinessSourceFile[]): RateLimitReadinessReport["storeSignals"] {
  const specs: Array<{ signal: RateLimitReadinessReport["storeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "memory", pattern: /RateLimiterMemory|MemoryStorage|memory store|inMemoryBlock/i, evidence: "memory limiter/store evidence was detected." },
    { signal: "redis", pattern: /RateLimiterRedis|ioredis|redis|IORedis/i, evidence: "Redis limiter/store evidence was detected." },
    { signal: "valkey", pattern: /valkey/i, evidence: "Valkey limiter/store evidence was detected." },
    { signal: "mongo", pattern: /RateLimiterMongo|mongodb|mongoose|mongo/i, evidence: "Mongo limiter/store evidence was detected." },
    { signal: "postgres", pattern: /RateLimiterPostgres|postgres|pg\b|postgresql/i, evidence: "Postgres limiter/store evidence was detected." },
    { signal: "mysql", pattern: /RateLimiterMySQL|mysql|mariadb/i, evidence: "MySQL limiter/store evidence was detected." },
    { signal: "sqlite", pattern: /RateLimiterSQLite|sqlite/i, evidence: "SQLite limiter/store evidence was detected." },
    { signal: "dynamodb", pattern: /RateLimiterDynamo|dynamodb|DynamoDB/i, evidence: "DynamoDB limiter/store evidence was detected." },
    { signal: "memcached", pattern: /RateLimiterMemcache|memcached|memcache/i, evidence: "Memcached limiter/store evidence was detected." },
    { signal: "prisma", pattern: /RateLimiterPrisma|prisma/i, evidence: "Prisma limiter/store evidence was detected." }
  ];
  return rateLimitReadinessSignalFromSpecs(sourceFiles, specs, "store", "signal");
}

function rateLimitReadinessResponseSignals(sourceFiles: RateLimitReadinessSourceFile[]): RateLimitReadinessReport["responseSignals"] {
  const specs: Array<{ signal: RateLimitReadinessReport["responseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ms-before-next", pattern: /msBeforeNext/i, evidence: "msBeforeNext response timing evidence was detected." },
    { signal: "remaining-points", pattern: /remainingPoints|RateLimit-Remaining|X-RateLimit-Remaining/i, evidence: "remaining points/header evidence was detected." },
    { signal: "consumed-points", pattern: /consumedPoints/i, evidence: "consumed points evidence was detected." },
    { signal: "retry-after", pattern: /Retry-After|retryAfter/i, evidence: "Retry-After evidence was detected." },
    { signal: "x-ratelimit-limit", pattern: /X-RateLimit-Limit|RateLimit-Limit/i, evidence: "X-RateLimit-Limit evidence was detected." },
    { signal: "x-ratelimit-remaining", pattern: /X-RateLimit-Remaining|RateLimit-Remaining/i, evidence: "X-RateLimit-Remaining evidence was detected." },
    { signal: "x-ratelimit-reset", pattern: /X-RateLimit-Reset|RateLimit-Reset/i, evidence: "X-RateLimit-Reset evidence was detected." },
    { signal: "too-many-requests", pattern: /Too Many Requests|\b429\b|status\s*\(\s*429|statusCode\s*=\s*429/i, evidence: "HTTP 429 response evidence was detected." }
  ];
  return rateLimitReadinessSignalFromSpecs(sourceFiles, specs, "response", "signal");
}

function rateLimitReadinessResilienceSignals(sourceFiles: RateLimitReadinessSourceFile[]): RateLimitReadinessReport["resilienceSignals"] {
  const specs: Array<{ signal: RateLimitReadinessReport["resilienceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "insurance-limiter", pattern: /\binsuranceLimiter\b|insurance limiter/i, evidence: "insurance limiter fallback evidence was detected." },
    { signal: "store-client", pattern: /\bstoreClient\s*:|store client|StoreClient/i, evidence: "store client evidence was detected." },
    { signal: "reject-if-not-ready", pattern: /rejectIfRedisNotReady|not ready|isReady|ready check/i, evidence: "not-ready rejection evidence was detected." },
    { signal: "atomic-increment", pattern: /atomic|incrby|INCRBY|evalsha|lua|upsert/i, evidence: "atomic increment evidence was detected." },
    { signal: "penalty", pattern: /\.penalty\s*\(|\bpenalty\s*\(/i, evidence: "penalty operation evidence was detected." },
    { signal: "reward", pattern: /\.reward\s*\(|\breward\s*\(/i, evidence: "reward operation evidence was detected." },
    { signal: "delete", pattern: /\.delete\s*\(|deleteInMemoryBlockedAll|resetKey/i, evidence: "delete/reset operation evidence was detected." },
    { signal: "block", pattern: /\.block\s*\(|\bblock\s*\(|blockDuration/i, evidence: "block operation evidence was detected." }
  ];
  return rateLimitReadinessSignalFromSpecs(sourceFiles, specs, "resilience", "signal");
}

function rateLimitReadinessPackageSignals(sourceFiles: RateLimitReadinessSourceFile[]): RateLimitReadinessReport["packageSignals"] {
  const specs: Array<{ signal: RateLimitReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rate-limiter-flexible", pattern: /rate-limiter-flexible|RateLimiter(Memory|Redis|Cluster|Queue|Union)/i, evidence: "rate-limiter-flexible package/import evidence was detected." },
    { signal: "express-rate-limit", pattern: /express-rate-limit/i, evidence: "express-rate-limit package/import evidence was detected." },
    { signal: "@fastify/rate-limit", pattern: /@fastify\/rate-limit|fastify-rate-limit/i, evidence: "@fastify/rate-limit package/import evidence was detected." },
    { signal: "@upstash/ratelimit", pattern: /@upstash\/ratelimit/i, evidence: "@upstash/ratelimit package/import evidence was detected." },
    { signal: "bottleneck", pattern: /["']bottleneck["']|\bBottleneck\b/i, evidence: "Bottleneck package/import evidence was detected." },
    { signal: "limiter", pattern: /["']limiter["']|\bRateLimiter\b/i, evidence: "limiter package/import evidence was detected." }
  ];
  return rateLimitReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function rateLimitReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RateLimitReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/rate-limit-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildErrorTrackingReadinessReport(walk: WalkResult): Promise<ErrorTrackingReadinessReport> {
  const sourceFiles = await errorTrackingReadinessSourceFiles(walk);
  const errorTrackingSetups = errorTrackingReadinessSetups(sourceFiles);
  const captureSignals = errorTrackingReadinessCaptureSignals(sourceFiles);
  const contextSignals = errorTrackingReadinessContextSignals(sourceFiles);
  const filteringSignals = errorTrackingReadinessFilteringSignals(sourceFiles);
  const observabilitySignals = errorTrackingReadinessObservabilitySignals(sourceFiles);
  const packageSignals = errorTrackingReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSentryPackage = packageSignals.some((item) => item.signal.startsWith("@sentry/") && item.readiness === "ready");
  const hasSetup = errorTrackingSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = errorTrackingSetups.some((item) => item.readiness === "ready");
  const hasCapture = captureSignals.some((item) => ["capture-exception", "capture-message", "capture-event", "error-boundary", "react-error-handler"].includes(item.signal) && item.readiness === "ready");
  const hasDsn = errorTrackingSetups.some((item) => item.dsnCount > 0);
  const hasContext = contextSignals.some((item) => ["set-user", "set-tag", "set-context", "set-extra", "with-scope", "release-environment"].includes(item.signal) && item.readiness === "ready");
  const hasFiltering = filteringSignals.some((item) => ["before-send", "before-breadcrumb", "ignore-errors", "allow-deny-urls", "scrubbers", "sample-rate"].includes(item.signal) && item.readiness === "ready");
  const sendsPii = filteringSignals.some((item) => item.signal === "send-default-pii" && item.readiness === "ready");
  const hasTracing = observabilitySignals.some((item) => ["traces-sample-rate", "traces-sampler", "trace-propagation-targets", "browser-tracing"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: ErrorTrackingReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasCapture) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the error-tracking strategy before claiming error-tracking readiness.",
      why: "Error-tracking readiness starts with an explicit SDK package, init file, DSN, capture path, scope/context, filtering hook, or framework boundary.",
      relatedHref: "html/error-tracking-readiness.html"
    });
  }
  if (hasSentryPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each Sentry package signal with early Sentry.init configuration and capture coverage.",
      why: "Sentry SDK packages do not capture useful events until the app initializes them before relevant framework or runtime code executes.",
      relatedHref: "html/error-tracking-readiness.html"
    });
  }
  if ((hasPackage || hasSetup || hasCapture) && !hasDsn) {
    riskQueue.push({
      priority: "high",
      action: "Confirm DSN and environment-specific routing are configured outside source secrets.",
      why: "Error events cannot reach the intended project without a DSN, and source-embedded DSNs or secrets should be reviewed carefully.",
      relatedHref: "html/error-tracking-readiness.html"
    });
  }
  if ((hasReadySetup || hasCapture) && !hasContext) {
    riskQueue.push({
      priority: "medium",
      action: "Attach release, environment, user-safe tags, and request/component context to error events.",
      why: "Error tracking is much less actionable without release/environment and stable context for grouping and triage.",
      relatedHref: "html/error-tracking-readiness.html"
    });
  }
  if ((hasReadySetup || hasCapture || hasTracing) && !hasFiltering) {
    riskQueue.push({
      priority: "medium",
      action: "Review beforeSend, beforeBreadcrumb, ignoreErrors, URL filters, scrubbers, and sample rates.",
      why: "Error trackers can collect noisy events or sensitive data unless filtering and sampling policies are explicit.",
      relatedHref: "html/error-tracking-readiness.html"
    });
  }
  if (sendsPii) {
    riskQueue.push({
      priority: "high",
      action: "Review sendDefaultPii and related user/request payload collection before enabling production traffic.",
      why: "PII collection changes the privacy profile of error events, breadcrumbs, replay, and request context.",
      relatedHref: "html/error-tracking-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run error-tracking integration checks only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not initialize SDKs, send events to Sentry or other vendors, upload source maps, start tracing/replay, collect PII, or run the analyzed project's tests.",
    relatedHref: "html/error-tracking-readiness.html"
  });

  return {
    summary: `Sentry식 error-tracking readiness report: setup ${errorTrackingSetups.length}개, capture signal ${captureSignals.length}개, context signal ${contextSignals.length}개, filtering signal ${filteringSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Sentry.init dsn captureException captureMessage captureEvent withScope setUser setContext setTag beforeSend ignoreErrors tracesSampleRate tracePropagationTargets replayIntegration ErrorBoundary",
    errorTrackingSetups,
    captureSignals,
    contextSignals,
    filteringSignals,
    observabilitySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"Sentry\\.init|@sentry/(browser|node|react|nextjs|vue)|dsn|instrument\\.(js|ts|mjs)\" src app pages packages", purpose: "Inventory SDK packages, early init files, DSN setup, and runtime instrumentation entrypoints." },
      { command: "rg \"captureException|captureMessage|captureEvent|ErrorBoundary|reactErrorHandler|onUncaughtError|onRecoverableError|addBreadcrumb\" src app pages packages", purpose: "Find manual captures, framework boundaries, React root error hooks, and breadcrumbs." },
      { command: "rg \"setUser|setTag|setTags|setContext|setExtra|withScope|release|environment|componentStack\" src app pages packages", purpose: "Review event context, scope enrichment, release/environment tagging, and component stack capture." },
      { command: "rg \"beforeSend|beforeBreadcrumb|ignoreErrors|denyUrls|allowUrls|sendDefaultPii|sampleRate|normalizeDepth|scrub\" src app pages packages", purpose: "Check event filtering, privacy, noise control, and sampling policy." },
      { command: "rg \"tracesSampleRate|tracesSampler|tracePropagationTargets|browserTracingIntegration|profilesSampleRate|replayIntegration|feedbackIntegration\" src app pages packages", purpose: "Inspect tracing, profiling, replay, feedback, and trace propagation readiness." },
      { command: "npx vitest run", purpose: "Run local tests that exercise error boundaries, capture calls, filtering hooks, privacy controls, and tracing setup." }
    ],
    learnerNextSteps: [
      "먼저 Sentry.init 또는 다른 error tracker init 파일이 앱 진입점보다 먼저 실행되는지 확인하세요.",
      "captureException, captureMessage, captureEvent, ErrorBoundary, reactErrorHandler 호출을 따라가며 실제 에러 경로가 잡히는지 확인하세요.",
      "release, environment, setUser, setTag, setContext, withScope가 이벤트 triage에 필요한 맥락을 충분히 제공하는지 검토하세요.",
      "beforeSend, beforeBreadcrumb, ignoreErrors, allowUrls/denyUrls, sendDefaultPii, sampleRate 설정으로 노이즈와 개인정보 위험을 줄이는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 이벤트 전송, source map upload, tracing/replay 시작, PII 수집은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type ErrorTrackingReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function errorTrackingReadinessSourceFiles(walk: WalkResult): Promise<ErrorTrackingReadinessSourceFile[]> {
  const files: ErrorTrackingReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !errorTrackingReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!errorTrackingReadinessPathSignal(file.relPath) && !errorTrackingReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function errorTrackingReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return errorTrackingReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|instrument\.[cm]?[jt]s|sentry\.[cm]?[jt]s|sentry\.client\.config\.[cm]?[jt]s|sentry\.server\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function errorTrackingReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(sentry|rollbar|bugsnag|airbrake|errors?|exceptions?|error[-_ ]?tracking|monitoring|observability|instrument)(\/|\.|-|_|$)/i.test(filePath);
}

function errorTrackingReadinessContentSignal(text: string): boolean {
  return /\b(Sentry\.init|@sentry\/(browser|node|react|nextjs|vue)|captureException|captureMessage|captureEvent|ErrorBoundary|reactErrorHandler|setUser|setContext|setTag|withScope|beforeSend|ignoreErrors|tracesSampleRate|tracePropagationTargets|replayIntegration|Rollbar|Bugsnag)\b/i.test(text);
}

function errorTrackingReadinessSetups(sourceFiles: ErrorTrackingReadinessSourceFile[]): ErrorTrackingReadinessReport["errorTrackingSetups"] {
  const rows: ErrorTrackingReadinessReport["errorTrackingSetups"] = [];
  for (const source of sourceFiles) {
    const initCount = countMatches(source.text, /Sentry\.init\s*\(|\binit\s*\(\s*{[^}]*dsn|new\s+Rollbar\s*\(|Bugsnag\.start\s*\(|Airbrake\.Notifier/gi);
    const dsnCount = countMatches(source.text, /\bdsn\s*:|SENTRY_DSN|ROLLBAR_ACCESS_TOKEN|BUGSNAG_API_KEY|AIRBRAKE_PROJECT_KEY/gi);
    const captureCount = countMatches(source.text, /captureException\s*\(|captureMessage\s*\(|captureEvent\s*\(|notify\s*\(|Bugsnag\.notify\s*\(|Rollbar\.(error|warning|info)\s*\(/gi);
    const scopeCount = countMatches(source.text, /withScope\s*\(|setUser\s*\(|setTag[s]?\s*\(|setContext\s*\(|setExtra\s*\(|configureScope\s*\(/gi);
    const integrationCount = countMatches(source.text, /integrations\s*:|browserTracingIntegration|replayIntegration|feedbackIntegration|ErrorBoundary|reactErrorHandler|httpIntegration|nodeProfilingIntegration/gi);
    const hasSetupSignal = initCount + dsnCount + captureCount + scopeCount + integrationCount > 0 || /\b(Sentry|error tracking|Rollbar|Bugsnag|Airbrake)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: errorTrackingReadinessProvider(source),
      initCount,
      dsnCount,
      captureCount,
      scopeCount,
      integrationCount,
      readiness: initCount > 0 && dsnCount > 0 && captureCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains init ${initCount}, DSN signals ${dsnCount}, captures ${captureCount}, scopes/context ${scopeCount}, integrations ${integrationCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function errorTrackingReadinessProvider(source: ErrorTrackingReadinessSourceFile): ErrorTrackingReadinessReport["errorTrackingSetups"][number]["provider"] {
  if (/@sentry\/|Sentry\.|sentry/i.test(source.text)) return "sentry";
  if (/Rollbar|rollbar/i.test(source.text)) return "rollbar";
  if (/Bugsnag|bugsnag/i.test(source.text)) return "bugsnag";
  if (/Airbrake|airbrake/i.test(source.text)) return "airbrake";
  if (/\b(error tracking|captureException|exception monitor|error monitor)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function errorTrackingReadinessCaptureSignals(sourceFiles: ErrorTrackingReadinessSourceFile[]): ErrorTrackingReadinessReport["captureSignals"] {
  const specs: Array<{ signal: ErrorTrackingReadinessReport["captureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "capture-exception", pattern: /captureException\s*\(|Bugsnag\.notify\s*\(|Rollbar\.error\s*\(/i, evidence: "exception capture evidence was detected." },
    { signal: "capture-message", pattern: /captureMessage\s*\(|Rollbar\.(info|warning|log)\s*\(/i, evidence: "message capture evidence was detected." },
    { signal: "capture-event", pattern: /captureEvent\s*\(|EventHint|event_id/i, evidence: "manual event capture evidence was detected." },
    { signal: "error-boundary", pattern: /ErrorBoundary|withErrorBoundary/i, evidence: "framework error boundary evidence was detected." },
    { signal: "react-error-handler", pattern: /reactErrorHandler|onUncaughtError|onCaughtError|onRecoverableError/i, evidence: "React root error hook evidence was detected." },
    { signal: "unhandled-errors", pattern: /unhandledrejection|uncaughtException|unhandledRejection|onerror|GlobalHandlers/i, evidence: "unhandled error capture evidence was detected." },
    { signal: "breadcrumbs", pattern: /addBreadcrumb|Breadcrumb|beforeBreadcrumb/i, evidence: "breadcrumb capture evidence was detected." }
  ];
  return errorTrackingReadinessSignalFromSpecs(sourceFiles, specs, "capture", "signal");
}

function errorTrackingReadinessContextSignals(sourceFiles: ErrorTrackingReadinessSourceFile[]): ErrorTrackingReadinessReport["contextSignals"] {
  const specs: Array<{ signal: ErrorTrackingReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-user", pattern: /setUser\s*\(|user\s*:/i, evidence: "user context evidence was detected." },
    { signal: "set-tag", pattern: /setTag[s]?\s*\(|tags\s*:/i, evidence: "tag context evidence was detected." },
    { signal: "set-context", pattern: /setContext\s*\(|contexts\s*:/i, evidence: "structured context evidence was detected." },
    { signal: "set-extra", pattern: /setExtra[s]?\s*\(|extra\s*:/i, evidence: "extra context evidence was detected." },
    { signal: "with-scope", pattern: /withScope\s*\(|configureScope\s*\(|scope\s*=>/i, evidence: "scoped event enrichment evidence was detected." },
    { signal: "component-stack", pattern: /componentStack|errorInfo|React ErrorBoundary/i, evidence: "component stack evidence was detected." },
    { signal: "release-environment", pattern: /\brelease\s*:|\benvironment\s*:|SENTRY_RELEASE|SENTRY_ENVIRONMENT|dist\s*:/i, evidence: "release/environment evidence was detected." }
  ];
  return errorTrackingReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function errorTrackingReadinessFilteringSignals(sourceFiles: ErrorTrackingReadinessSourceFile[]): ErrorTrackingReadinessReport["filteringSignals"] {
  const specs: Array<{ signal: ErrorTrackingReadinessReport["filteringSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "before-send", pattern: /beforeSend\s*:|beforeSend\s*\(/i, evidence: "beforeSend event filtering evidence was detected." },
    { signal: "before-breadcrumb", pattern: /beforeBreadcrumb\s*:|beforeBreadcrumb\s*\(/i, evidence: "beforeBreadcrumb filtering evidence was detected." },
    { signal: "ignore-errors", pattern: /ignoreErrors|ignoredErrors|ignoreError/i, evidence: "ignored error evidence was detected." },
    { signal: "allow-deny-urls", pattern: /denyUrls|allowUrls|tracePropagationTargets|urlFilter/i, evidence: "URL allow/deny filtering evidence was detected." },
    { signal: "send-default-pii", pattern: /sendDefaultPii\s*:\s*true|sendDefaultPii/i, evidence: "sendDefaultPii evidence was detected." },
    { signal: "scrubbers", pattern: /scrub|redact|sanitize|normalizeDepth|normalizeMaxBreadth|password|token|authorization|cookie/i, evidence: "scrubbing or sensitive-field evidence was detected." },
    { signal: "sample-rate", pattern: /\bsampleRate\s*:|tracesSampleRate|profilesSampleRate|replaysSessionSampleRate|replaysOnErrorSampleRate/i, evidence: "event or telemetry sample-rate evidence was detected." }
  ];
  return errorTrackingReadinessSignalFromSpecs(sourceFiles, specs, "filtering", "signal");
}

function errorTrackingReadinessObservabilitySignals(sourceFiles: ErrorTrackingReadinessSourceFile[]): ErrorTrackingReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: ErrorTrackingReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "traces-sample-rate", pattern: /tracesSampleRate/i, evidence: "tracing sample-rate evidence was detected." },
    { signal: "traces-sampler", pattern: /tracesSampler/i, evidence: "custom traces sampler evidence was detected." },
    { signal: "trace-propagation-targets", pattern: /tracePropagationTargets/i, evidence: "trace propagation target evidence was detected." },
    { signal: "browser-tracing", pattern: /browserTracingIntegration|BrowserTracing|startBrowserTracing/i, evidence: "browser tracing integration evidence was detected." },
    { signal: "profiles-sample-rate", pattern: /profilesSampleRate|nodeProfilingIntegration|profileLifecycle/i, evidence: "profiling evidence was detected." },
    { signal: "replay", pattern: /replayIntegration|replaysSessionSampleRate|replaysOnErrorSampleRate|Replay/i, evidence: "session replay evidence was detected." },
    { signal: "feedback", pattern: /feedbackIntegration|feedbackAsyncIntegration|showReportDialog|userFeedback/i, evidence: "feedback/report dialog evidence was detected." }
  ];
  return errorTrackingReadinessSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function errorTrackingReadinessPackageSignals(sourceFiles: ErrorTrackingReadinessSourceFile[]): ErrorTrackingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ErrorTrackingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@sentry/browser", pattern: /@sentry\/browser/i, evidence: "@sentry/browser package/import evidence was detected." },
    { signal: "@sentry/node", pattern: /@sentry\/node/i, evidence: "@sentry/node package/import evidence was detected." },
    { signal: "@sentry/react", pattern: /@sentry\/react/i, evidence: "@sentry/react package/import evidence was detected." },
    { signal: "@sentry/nextjs", pattern: /@sentry\/nextjs/i, evidence: "@sentry/nextjs package/import evidence was detected." },
    { signal: "@sentry/vue", pattern: /@sentry\/vue/i, evidence: "@sentry/vue package/import evidence was detected." },
    { signal: "rollbar", pattern: /rollbar/i, evidence: "Rollbar package/import evidence was detected." },
    { signal: "@bugsnag/js", pattern: /@bugsnag\/js|bugsnag-js|Bugsnag/i, evidence: "Bugsnag package/import evidence was detected." }
  ];
  return errorTrackingReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function errorTrackingReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ErrorTrackingReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/error-tracking-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
