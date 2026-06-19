import type { RpcReadinessReport, ScaffoldingReadinessReport, SchedulerReadinessReport, WorkspaceGraphReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";


export async function buildRpcReadinessReport(walk: WalkResult): Promise<RpcReadinessReport> {
  const sourceFiles = await rpcReadinessSourceFiles(walk);
  const rpcSetups = rpcReadinessSetups(sourceFiles);
  const routerSignals = rpcReadinessRouterSignals(sourceFiles);
  const procedureSignals = rpcReadinessProcedureSignals(sourceFiles);
  const validationSignals = rpcReadinessValidationSignals(sourceFiles);
  const contextSignals = rpcReadinessContextSignals(sourceFiles);
  const clientSignals = rpcReadinessClientSignals(sourceFiles);
  const adapterSignals = rpcReadinessAdapterSignals(sourceFiles);
  const errorSignals = rpcReadinessErrorSignals(sourceFiles);
  const callerSignals = rpcReadinessCallerSignals(sourceFiles);
  const packageSignals = rpcReadinessPackageSignals(sourceFiles);

  const hasRpc = rpcSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasRouter = routerSignals.some((item) => item.readiness === "ready") || rpcSetups.some((item) => item.routerCount > 0);
  const hasProcedure = procedureSignals.some((item) => item.readiness === "ready") || rpcSetups.some((item) => item.procedureCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || rpcSetups.some((item) => item.validationCount > 0);
  const hasContext = contextSignals.some((item) => item.readiness === "ready") || rpcSetups.some((item) => item.middlewareCount > 0);
  const hasClient = clientSignals.some((item) => item.readiness === "ready") || rpcSetups.some((item) => item.clientCount > 0);
  const hasAdapter = adapterSignals.some((item) => item.readiness === "ready") || rpcSetups.some((item) => item.adapterCount > 0);
  const hasErrors = errorSignals.some((item) => item.readiness === "ready") || rpcSetups.some((item) => item.errorCount > 0);

  const riskQueue: RpcReadinessReport["riskQueue"] = [];
  if (!hasRpc) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the RPC entry point before claiming type-safe API readiness.",
      why: "tRPC-style readiness starts with router/procedure setup, client link setup, adapter setup, or package evidence learners can trace.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  if (hasRpc && !hasRouter) {
    riskQueue.push({
      priority: "high",
      action: "Trace the root router and nested router ownership.",
      why: "RPC clients infer callable paths from router structure, so learners need a clear AppRouter or mergeRouters boundary.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  if (hasRouter && !hasProcedure) {
    riskQueue.push({
      priority: "high",
      action: "Map query, mutation, and subscription procedure declarations.",
      why: "Routers without procedure evidence do not show the callable API surface or operation semantics.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  if (hasProcedure && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document input/output validation for important procedures.",
      why: "tRPC relies on runtime parsers such as Zod and transformer boundaries to keep inferred types honest at runtime.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  if (hasProcedure && !hasContext) {
    riskQueue.push({
      priority: "medium",
      action: "Document context, middleware, auth guards, and meta ownership.",
      why: "Procedure behavior often depends on ctx narrowing, middleware next() calls, and auth-specific protected procedures.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  if (hasRouter && !hasClient) {
    riskQueue.push({
      priority: "medium",
      action: "Trace typed client creation and link selection.",
      why: "End-to-end RPC readiness needs the client side that imports the router type and chooses HTTP, batch, subscription, or websocket links.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  if (hasRouter && !hasAdapter) {
    riskQueue.push({
      priority: "low",
      action: "Record the server adapter that exposes the router.",
      why: "Adapters explain whether the router is mounted through standalone HTTP, Next, Express, Fastify, fetch, node-http, websocket, or MCP surfaces.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  if (hasProcedure && !hasErrors) {
    riskQueue.push({
      priority: "low",
      action: "Document TRPCError, error formatter, and known auth/error codes.",
      why: "Typed API callers need structured error behavior for UNAUTHORIZED, FORBIDDEN, NOT_FOUND, BAD_REQUEST, and formatter boundaries.",
      relatedHref: "html/rpc-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify RPC behavior with trusted server/client tests outside RepoTutor.",
    why: "RepoTutor records RPC readiness only; it does not start adapters, invoke procedures, open websocket/subscription links, serialize transformers, call clients, or run analyzed project tests.",
    relatedHref: "html/rpc-readiness.html"
  });

  return {
    summary: `tRPC-style RPC readiness report: setup ${rpcSetups.length}개, router signal ${routerSignals.length}개, procedure signal ${procedureSignals.length}개, client signal ${clientSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "tRPC initTRPC router procedure query mutation subscription input output middleware context createTRPCClient links adapters TRPCError createCaller",
    rpcSetups,
    routerSignals,
    procedureSignals,
    validationSignals,
    contextSignals,
    clientSignals,
    adapterSignals,
    errorSignals,
    callerSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"initTRPC|createTRPC|router\\(|mergeRouters|AppRouter|inferRouter\" src app server packages", purpose: "Find RPC initialization, root routers, nested routers, and exported router types." },
      { command: "rg \"publicProcedure|protectedProcedure|\\.procedure|\\.query\\(|\\.mutation\\(|\\.subscription\\(\" src app server packages", purpose: "Trace procedure declarations and operation semantics." },
      { command: "rg \"\\.input\\(|\\.output\\(|z\\.object|valibot|superstruct|standard-schema|transformer|superjson\" src app server packages", purpose: "Review runtime input/output validation and transformer boundaries." },
      { command: "rg \"context<|createContext|\\.use\\(|middleware\\(|TRPCError|UNAUTHORIZED|FORBIDDEN|errorFormatter|meta<\" src app server packages", purpose: "Inspect context creation, middleware, auth guards, metadata, and structured errors." },
      { command: "rg \"createTRPCClient|createTRPCReact|createTRPCNext|createTRPCContext|httpBatchLink|httpLink|wsLink|splitLink|loggerLink|retryLink\" src app client packages", purpose: "Map typed clients, React/Next/TanStack bindings, and transport links." },
      { command: "rg \"createHTTPServer|createNextApiHandler|fetchRequestHandler|express|fastifyTRPCPlugin|applyWSSHandler|experimental_createMCPHandler|createCaller\" src app server packages test tests", purpose: "Check adapters, websocket/subscription exposure, local callers, and test helpers." }
    ],
    learnerNextSteps: [
      "먼저 initTRPC.create(), t.router/router(), mergeRouters, AppRouter export 지점으로 RPC root boundary를 찾으세요.",
      "publicProcedure, protectedProcedure, procedure.query/mutation/subscription 신호로 callable API surface를 분류하세요.",
      "input(), output(), Zod/Valibot/Superstruct/Standard Schema와 transformer/superjson 신호로 runtime contract를 확인하세요.",
      "context, createContext, middleware use(), opts.next(), TRPCError, errorFormatter 신호로 auth와 error behavior를 분리하세요.",
      "createTRPCClient, createTRPCReact, createTRPCNext, createTRPCContext, httpBatchLink, wsLink, splitLink 신호로 client transport와 type import 경계를 확인하세요.",
      "createHTTPServer, createNextApiHandler, fetchRequestHandler, express, fastifyTRPCPlugin, applyWSSHandler 신호가 있으면 server adapter ownership을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 procedure 호출, adapter 실행, websocket/subscription 연결, transformer serialization, client request behavior는 원본 프로젝트 테스트나 안전한 dev server에서 별도 확인하세요."
    ]
  };
}

type RpcReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function rpcReadinessSourceFiles(walk: WalkResult): Promise<RpcReadinessSourceFile[]> {
  const files: RpcReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !rpcReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!rpcReadinessPathSignal(file.relPath) && !rpcReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function rpcReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return rpcReadinessPathSignal(filePath)
    || /^(package\.json|trpc\.[cm]?[jt]sx?|router\.[cm]?[jt]sx?|client\.[cm]?[jt]sx?|server\.[cm]?[jt]sx?|context\.[cm]?[jt]sx?|api\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml|proto)$/i.test(filePath);
}

function rpcReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(trpc|rpc|routers?|procedures?|server|client|api|apis|context|middleware|middlewares|adapters?|subscriptions?|websocket|grpc|connect)(\/|\.|-|_|$)|package\.json$/i.test(filePath);
}

function rpcReadinessContentSignal(text: string): boolean {
  return /(initTRPC|createTRPC|@trpc\/server|@trpc\/client|@trpc\/react-query|@trpc\/next|t\.router|router\s*\(|mergeRouters|publicProcedure|protectedProcedure|\.procedure|\.query\s*\(|\.mutation\s*\(|\.subscription\s*\(|\.input\s*\(|\.output\s*\(|createTRPCClient|httpBatchLink|httpLink|wsLink|splitLink|TRPCError|createCaller|createHTTPServer|createNextApiHandler|fetchRequestHandler|fastifyTRPCPlugin|applyWSSHandler|experimental_createMCPHandler|service\s+[A-Za-z_][\w]*\s*\{)/i.test(text);
}

function rpcReadinessSetups(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["rpcSetups"] {
  const rows: RpcReadinessReport["rpcSetups"] = [];
  for (const source of sourceFiles) {
    const routerCount = countMatches(source.text, /initTRPC|createTRPC|t\.router|router\s*\(|mergeRouters|AppRouter|inferRouter|service\s+[A-Za-z_][\w]*\s*\{/gi);
    const procedureCount = countMatches(source.text, /publicProcedure|protectedProcedure|\.procedure|t\.procedure|procedure\s*\(|rpc\s+[A-Za-z_][\w]*\s*\(/gi);
    const queryCount = countMatches(source.text, /\.query\s*\(|type\s*:\s*['"]query|query\s*\(/gi);
    const mutationCount = countMatches(source.text, /\.mutation\s*\(|type\s*:\s*['"]mutation|mutation\s*\(/gi);
    const subscriptionCount = countMatches(source.text, /\.subscription\s*\(|httpSubscriptionLink|wsLink|applyWSSHandler|subscription\s*\(|async\s+function\*/gi);
    const validationCount = countMatches(source.text, /\.input\s*\(|\.output\s*\(|z\.object|z\.string|valibot|superstruct|standard-schema|transformer|superjson/gi);
    const middlewareCount = countMatches(source.text, /context<|createContext|\.use\s*\(|middleware\s*\(|opts\.next|ctx\.|meta<|auth|UNAUTHORIZED|FORBIDDEN/gi);
    const clientCount = countMatches(source.text, /createTRPCClient|createTRPCReact|createTRPCNext|createTRPCContext|createTRPCOptionsProxy|httpBatchLink|httpBatchStreamLink|httpLink|wsLink|splitLink|loggerLink|retryLink|useQuery|useMutation|useSubscription/gi);
    const adapterCount = countMatches(source.text, /createHTTPServer|createHTTPHandler|createNextApiHandler|fetchRequestHandler|expressMiddleware|fastifyTRPCPlugin|applyWSSHandler|nodeHTTPRequestHandler|experimental_createMCPHandler/gi);
    const errorCount = countMatches(source.text, /TRPCError|getTRPCErrorFromUnknown|errorFormatter|UNAUTHORIZED|FORBIDDEN|NOT_FOUND|BAD_REQUEST|PAYLOAD_TOO_LARGE|INTERNAL_SERVER_ERROR/gi);
    const hasSetupSignal = routerCount + procedureCount + queryCount + mutationCount + subscriptionCount + validationCount + middlewareCount + clientCount + adapterCount + errorCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      framework: rpcReadinessFramework(source),
      routerCount,
      procedureCount,
      queryCount,
      mutationCount,
      subscriptionCount,
      validationCount,
      middlewareCount,
      clientCount,
      adapterCount,
      errorCount,
      readiness: routerCount > 0 && procedureCount > 0 && (validationCount > 0 || clientCount > 0 || adapterCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains routers ${routerCount}, procedures ${procedureCount}, queries ${queryCount}, mutations ${mutationCount}, subscriptions ${subscriptionCount}, validation ${validationCount}, middleware/context ${middlewareCount}, clients ${clientCount}, adapters ${adapterCount}, errors ${errorCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function rpcReadinessFramework(source: RpcReadinessSourceFile): RpcReadinessReport["rpcSetups"][number]["framework"] {
  if (/@trpc\/|initTRPC|createTRPC|TRPCError|publicProcedure|protectedProcedure/i.test(source.text)) return "trpc";
  if (/grpc|@grpc\/grpc-js|proto-loader|service\s+[A-Za-z_][\w]*\s*\{/i.test(source.text)) return "grpc";
  if (/connectrpc|@connectrpc|ConnectRouter|createConnectTransport/i.test(source.text)) return "connect";
  if (/jsonrpc|JSON-RPC|rpc\./i.test(source.text)) return "json-rpc";
  if (/rpc|procedure|router/i.test(source.filePath) || /remote procedure|typed API/i.test(source.text)) return "custom";
  return "unknown";
}

function rpcReadinessRouterSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["routerSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["routerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "init-trpc", pattern: /initTRPC|createTRPC/i, evidence: "tRPC initialization evidence was detected." },
    { signal: "router", pattern: /t\.router|router\s*\(/i, evidence: "router creation evidence was detected." },
    { signal: "nested-router", pattern: /router\s*\(\s*\{[\s\S]{0,200}\w+\s*:\s*(t\.)?router\s*\(/i, evidence: "nested router evidence was detected." },
    { signal: "merge-routers", pattern: /mergeRouters|\.merge\s*\(/i, evidence: "router merge evidence was detected." },
    { signal: "app-router", pattern: /appRouter|rootRouter|createRouter/i, evidence: "root AppRouter evidence was detected." },
    { signal: "app-router-type", pattern: /export\s+type\s+\w*AppRouter|typeof\s+\w*appRouter|inferRouter/i, evidence: "exported router type evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "router", "signal");
}

function rpcReadinessProcedureSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["procedureSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["procedureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "procedure", pattern: /t\.procedure|\.procedure|procedure\s*\(/i, evidence: "procedure builder evidence was detected." },
    { signal: "public-procedure", pattern: /publicProcedure/i, evidence: "public procedure helper evidence was detected." },
    { signal: "protected-procedure", pattern: /protectedProcedure|authedProcedure|authorizedProcedure|privateProcedure/i, evidence: "protected/authed procedure helper evidence was detected." },
    { signal: "query", pattern: /\.query\s*\(/i, evidence: "query procedure evidence was detected." },
    { signal: "mutation", pattern: /\.mutation\s*\(/i, evidence: "mutation procedure evidence was detected." },
    { signal: "subscription", pattern: /\.subscription\s*\(|httpSubscriptionLink|wsLink|applyWSSHandler/i, evidence: "subscription procedure or transport evidence was detected." },
    { signal: "streaming", pattern: /async\s+function\*|yield\s+|httpBatchStreamLink|stream/i, evidence: "streaming procedure evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "procedure", "signal");
}

function rpcReadinessValidationSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["validationSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "input", pattern: /\.input\s*\(/i, evidence: "input parser evidence was detected." },
    { signal: "output", pattern: /\.output\s*\(/i, evidence: "output parser evidence was detected." },
    { signal: "zod", pattern: /from ['"]zod|require\(['"]zod|z\.object|z\.string|zod/i, evidence: "Zod validation evidence was detected." },
    { signal: "valibot", pattern: /valibot/i, evidence: "Valibot validation evidence was detected." },
    { signal: "superstruct", pattern: /superstruct/i, evidence: "Superstruct validation evidence was detected." },
    { signal: "standard-schema", pattern: /standard-schema|StandardSchema/i, evidence: "Standard Schema evidence was detected." },
    { signal: "transformer", pattern: /transformer|superjson|devalue|serialize|deserialize/i, evidence: "data transformer evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function rpcReadinessContextSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["contextSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "context", pattern: /\.context<|context<|ctx\./i, evidence: "typed context evidence was detected." },
    { signal: "create-context", pattern: /createContext|createTRPCContext|CreateNextContextOptions/i, evidence: "context factory evidence was detected." },
    { signal: "middleware", pattern: /\.use\s*\(|middleware\s*\(|opts\.next|next\s*\(/i, evidence: "procedure middleware evidence was detected." },
    { signal: "auth-guard", pattern: /UNAUTHORIZED|FORBIDDEN|protectedProcedure|authedProcedure|auth|session|user/i, evidence: "auth guard evidence was detected." },
    { signal: "meta", pattern: /\.meta\s*\(|meta<|routerMeta/i, evidence: "router/procedure metadata evidence was detected." },
    { signal: "next-ctx", pattern: /CreateNextContextOptions|NextApiRequest|NextRequest|headers\(\)|cookies\(\)/i, evidence: "Next.js context evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function rpcReadinessClientSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["clientSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["clientSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-client", pattern: /createTRPCClient|createTRPCProxyClient|createTRPCUntypedClient/i, evidence: "typed client creation evidence was detected." },
    { signal: "react-query", pattern: /createTRPCReact|@trpc\/react-query|useQuery|useMutation|useSubscription/i, evidence: "React Query binding evidence was detected." },
    { signal: "next-client", pattern: /createTRPCNext|@trpc\/next|withTRPC|ssrPrepass/i, evidence: "Next client binding evidence was detected." },
    { signal: "tanstack-options", pattern: /createTRPCContext|createTRPCOptionsProxy|queryOptions|mutationOptions|subscriptionOptions/i, evidence: "TanStack options proxy evidence was detected." },
    { signal: "http-link", pattern: /httpLink\s*\(/i, evidence: "HTTP link evidence was detected." },
    { signal: "batch-link", pattern: /httpBatchLink|httpBatchStreamLink/i, evidence: "batch or streaming link evidence was detected." },
    { signal: "subscription-link", pattern: /httpSubscriptionLink|subscriptionOptions|useSubscription/i, evidence: "subscription client evidence was detected." },
    { signal: "ws-link", pattern: /wsLink|createWSClient|websocket/i, evidence: "websocket link evidence was detected." },
    { signal: "logger-link", pattern: /loggerLink/i, evidence: "logger link evidence was detected." },
    { signal: "retry-link", pattern: /retryLink/i, evidence: "retry link evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "client", "signal");
}

function rpcReadinessAdapterSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["adapterSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["adapterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "standalone", pattern: /createHTTPServer|createHTTPHandler|adapters\/standalone/i, evidence: "standalone HTTP adapter evidence was detected." },
    { signal: "next-api", pattern: /createNextApiHandler|adapters\/next|pages\/api\/trpc|app\/api\/trpc/i, evidence: "Next API adapter evidence was detected." },
    { signal: "app-router", pattern: /next-app-dir|experimental_createTRPCNextAppDir|appDir|route\.ts/i, evidence: "Next app-router adapter evidence was detected." },
    { signal: "express", pattern: /trpcExpress|expressMiddleware|adapters\/express/i, evidence: "Express adapter evidence was detected." },
    { signal: "fastify", pattern: /fastifyTRPCPlugin|adapters\/fastify/i, evidence: "Fastify adapter evidence was detected." },
    { signal: "fetch", pattern: /fetchRequestHandler|adapters\/fetch/i, evidence: "Fetch adapter evidence was detected." },
    { signal: "node-http", pattern: /nodeHTTPRequestHandler|adapters\/node-http|IncomingMessage/i, evidence: "Node HTTP adapter evidence was detected." },
    { signal: "websocket", pattern: /applyWSSHandler|adapters\/ws|wsLink|websocket/i, evidence: "websocket adapter evidence was detected." },
    { signal: "mcp", pattern: /experimental_createMCPHandler|MCP/i, evidence: "MCP adapter evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "adapter", "signal");
}

function rpcReadinessErrorSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["errorSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["errorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trpc-error", pattern: /TRPCError|getTRPCErrorFromUnknown|TRPCClientError/i, evidence: "TRPCError evidence was detected." },
    { signal: "unauthorized", pattern: /UNAUTHORIZED/i, evidence: "UNAUTHORIZED error code evidence was detected." },
    { signal: "forbidden", pattern: /FORBIDDEN/i, evidence: "FORBIDDEN error code evidence was detected." },
    { signal: "not-found", pattern: /NOT_FOUND|notFound/i, evidence: "not-found error evidence was detected." },
    { signal: "bad-request", pattern: /BAD_REQUEST|PAYLOAD_TOO_LARGE|PARSE_ERROR/i, evidence: "bad-request/payload error evidence was detected." },
    { signal: "error-formatter", pattern: /errorFormatter|getErrorShape|errorShape|formatError/i, evidence: "error formatter evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "error", "signal");
}

function rpcReadinessCallerSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["callerSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["callerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-caller", pattern: /createCaller\s*\(/i, evidence: "createCaller evidence was detected." },
    { signal: "create-caller-factory", pattern: /createCallerFactory/i, evidence: "createCallerFactory evidence was detected." },
    { signal: "router-create-caller", pattern: /router\.createCaller|appRouter\.createCaller/i, evidence: "router.createCaller evidence was detected." },
    { signal: "infer-router", pattern: /inferRouter|inferProcedure|inferReactQueryProcedureOptions|inferRouterInputs|inferRouterOutputs/i, evidence: "router inference evidence was detected." },
    { signal: "type-import", pattern: /import\s+type\s+\{\s*\w*AppRouter|import\s+type\s+\w*AppRouter|typeof\s+\w*appRouter/i, evidence: "type-only router import/export evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "caller", "signal");
}

function rpcReadinessPackageSignals(sourceFiles: RpcReadinessSourceFile[]): RpcReadinessReport["packageSignals"] {
  const specs: Array<{ signal: RpcReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@trpc/server", pattern: /"@trpc\/server"|from ['"]@trpc\/server|require\(['"]@trpc\/server/i, evidence: "@trpc/server evidence was detected." },
    { signal: "@trpc/client", pattern: /"@trpc\/client"|from ['"]@trpc\/client|require\(['"]@trpc\/client/i, evidence: "@trpc/client evidence was detected." },
    { signal: "@trpc/react-query", pattern: /"@trpc\/react-query"|from ['"]@trpc\/react-query/i, evidence: "@trpc/react-query evidence was detected." },
    { signal: "@trpc/next", pattern: /"@trpc\/next"|from ['"]@trpc\/next/i, evidence: "@trpc/next evidence was detected." },
    { signal: "@trpc/tanstack-react-query", pattern: /"@trpc\/tanstack-react-query"|from ['"]@trpc\/tanstack-react-query/i, evidence: "@trpc/tanstack-react-query evidence was detected." },
    { signal: "superjson", pattern: /"superjson"|from ['"]superjson|superjson/i, evidence: "superjson evidence was detected." },
    { signal: "zod", pattern: /"zod"|from ['"]zod|require\(['"]zod|z\.object/i, evidence: "Zod evidence was detected." }
  ];
  return rpcReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function rpcReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RpcReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/rpc-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildWorkspaceGraphReadinessReport(walk: WalkResult): Promise<WorkspaceGraphReadinessReport> {
  const sourceFiles = await workspaceGraphSourceFiles(walk);
  const workspaceFiles = workspaceGraphFiles(sourceFiles);
  const projectSignals = workspaceGraphProjectSignals(sourceFiles);
  const graphSignals = workspaceGraphGraphSignals(sourceFiles);
  const boundarySignals = workspaceGraphBoundarySignals(sourceFiles);
  const affectedSignals = workspaceGraphAffectedSignals(sourceFiles);
  const targetSignals = workspaceGraphTargetSignals(sourceFiles);
  const pluginSignals = workspaceGraphPluginSignals(sourceFiles);
  const packageSignals = workspaceGraphPackageSignals(sourceFiles);

  const hasWorkspace = workspaceFiles.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasProjects = projectSignals.some((item) => item.readiness === "ready") || workspaceFiles.some((item) => item.projectCount > 0);
  const hasTargets = targetSignals.some((item) => item.readiness === "ready") || workspaceFiles.some((item) => item.targetCount > 0);
  const hasGraph = graphSignals.some((item) => item.readiness === "ready");
  const hasBoundaries = boundarySignals.some((item) => item.readiness === "ready");
  const hasAffected = affectedSignals.some((item) => item.readiness === "ready");
  const hasPlugins = pluginSignals.some((item) => item.readiness === "ready") || workspaceFiles.some((item) => item.pluginCount > 0);

  const riskQueue: WorkspaceGraphReadinessReport["riskQueue"] = [];
  if (!hasWorkspace) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document workspace graph configuration before claiming monorepo readiness.",
      why: "Nx-style readiness starts with a workspace manifest, project files, target defaults, package workspaces, or graph tooling evidence learners can trace.",
      relatedHref: "html/workspace-graph-readiness.html"
    });
  }
  if (hasWorkspace && !hasProjects) {
    riskQueue.push({
      priority: "high",
      action: "Trace project ownership through project.json, package workspaces, sourceRoot, tags, or app/lib folders.",
      why: "A workspace graph is only useful when learners can see the project nodes and ownership boundaries it will reason over.",
      relatedHref: "html/workspace-graph-readiness.html"
    });
  }
  if (hasProjects && !hasTargets) {
    riskQueue.push({
      priority: "high",
      action: "Map targets, targetDefaults, namedInputs, dependsOn, inputs, outputs, executors, and cache policy.",
      why: "Nx project graph analysis becomes operational when project nodes expose repeatable build/test/lint targets and inputs.",
      relatedHref: "html/workspace-graph-readiness.html"
    });
  }
  if (hasProjects && !hasGraph) {
    riskQueue.push({
      priority: "medium",
      action: "Add a graph inspection path such as nx graph, createProjectGraphAsync, readCachedProjectGraph, or graph output.",
      why: "Graph inspection lets learners verify dependency edges instead of inferring them from folders alone.",
      relatedHref: "html/workspace-graph-readiness.html"
    });
  }
  if (hasProjects && !hasBoundaries) {
    riskQueue.push({
      priority: "medium",
      action: "Document module-boundary rules, tag scopes, depConstraints, tsconfig paths, and implicit dependencies.",
      why: "Large workspaces need explicit boundary policy so feature, scope, platform, and shared-library dependencies do not drift.",
      relatedHref: "html/workspace-graph-readiness.html"
    });
  }
  if (hasTargets && !hasAffected) {
    riskQueue.push({
      priority: "low",
      action: "Record affected-only commands and base/head CI inputs.",
      why: "Nx-style CI depends on running only impacted projects, so learners need a base/head and affected target strategy.",
      relatedHref: "html/workspace-graph-readiness.html"
    });
  }
  if (hasWorkspace && !hasPlugins) {
    riskQueue.push({
      priority: "low",
      action: "Document plugin discovery, createNodes, generators, executors, migrations, or inferred task ownership.",
      why: "Nx plugins explain how project nodes and targets are inferred beyond handwritten project.json files.",
      relatedHref: "html/workspace-graph-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify project graph and affected output on the original source tree before treating this report as CI approval.",
    why: "RepoTutor records workspace graph readiness only; it does not execute Nx, compute affected projects, run generators, enforce lint boundaries, or contact remote cache services.",
    relatedHref: "html/workspace-graph-readiness.html"
  });

  return {
    summary: `Nx-style workspace graph readiness report: workspace file ${workspaceFiles.length}개, project signal ${projectSignals.length}개, graph signal ${graphSignals.length}개, target signal ${targetSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Nx project graph nx.json project.json targets targetDefaults namedInputs plugins createNodes affected tags implicitDependencies enforce-module-boundaries depConstraints",
    workspaceFiles,
    projectSignals,
    graphSignals,
    boundarySignals,
    affectedSignals,
    targetSignals,
    pluginSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"nx.json|project.json|targetDefaults|namedInputs|plugins|implicitDependencies|tags\" .", purpose: "Find workspace graph configuration, project metadata, target defaults, and boundary tags." },
      { command: "npx nx graph --file=project-graph.html", purpose: "Export the Nx project graph for manual dependency-edge inspection." },
      { command: "npx nx show projects --affected --base=main --head=HEAD", purpose: "List projects affected by the current diff using explicit base/head inputs." },
      { command: "npx nx affected -t build,test,lint --dry-run", purpose: "Preview affected build/test/lint target selection before running work." },
      { command: "rg \"enforce-module-boundaries|depConstraints|@nx/enforce-module-boundaries|sourceTag|onlyDependOnLibsWithTags\" .", purpose: "Review module boundary rules and tag-based dependency constraints." },
      { command: "rg \"createNodes|createProjectGraphAsync|readCachedProjectGraph|generators|executors|migrations\" .", purpose: "Trace plugins, graph API usage, generators, executors, migrations, and inferred task ownership." }
    ],
    learnerNextSteps: [
      "먼저 nx.json, project.json, package workspaces, apps/libs/packages 폴더를 찾아 project node ownership을 확인하세요.",
      "targetDefaults, namedInputs, targets, dependsOn, inputs, outputs, executor, cache 설정으로 반복 실행과 캐시 경계를 분리하세요.",
      "nx graph, createProjectGraphAsync, readCachedProjectGraph, graph output 신호로 dependency edge를 검증할 수 있는 경로를 찾으세요.",
      "tags, implicitDependencies, enforce-module-boundaries, depConstraints, tsconfig paths로 workspace boundary policy를 확인하세요.",
      "nx affected, base/head, affected target, CI affected-only 명령이 있으면 변경 영향 분석 전략을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 graph 계산, affected 프로젝트 산출, lint boundary enforcement, generator/executor 실행은 원본 프로젝트에서 별도 확인하세요."
    ]
  };
}

type WorkspaceGraphSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function workspaceGraphSourceFiles(walk: WalkResult): Promise<WorkspaceGraphSourceFile[]> {
  const files: WorkspaceGraphSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !workspaceGraphInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!workspaceGraphPathSignal(file.relPath) && !workspaceGraphContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function workspaceGraphInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return workspaceGraphPathSignal(filePath)
    || /^(nx\.json|project\.json|workspace\.json|package\.json|pnpm-workspace\.yaml|lerna\.json|rush\.json|turbo\.json|moon\.ya?ml|tsconfig\.json|eslint\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(json|ya?ml|toml|md|mdx|js|cjs|mjs|ts|tsx|jsx)$/i.test(filePath);
}

function workspaceGraphPathSignal(filePath: string): boolean {
  return /(^|\/)(nx\.json|project\.json|workspace\.json|pnpm-workspace\.ya?ml|lerna\.json|rush\.json|turbo\.json|moon\.ya?ml|package\.json|apps?|libs?|packages?|tools?|plugins?|generators?|executors?|migrations?|graph|workspace)(\/|$)|eslint\.config\.[cm]?[jt]s$/i.test(filePath);
}

function workspaceGraphContentSignal(text: string): boolean {
  return /(nx\.json|project\.json|ProjectGraph|createProjectGraphAsync|readCachedProjectGraph|nx\s+graph|nx\s+affected|targetDefaults|namedInputs|implicitDependencies|enforce-module-boundaries|depConstraints|createNodes|generators|executors|@nx\/|@nrwl\/|pnpm-workspace|workspaces|turbo\.json|moonrepo|rush\.json)/i.test(text);
}

function workspaceGraphFiles(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["workspaceFiles"] {
  const rows: WorkspaceGraphReadinessReport["workspaceFiles"] = [];
  for (const source of sourceFiles) {
    const configType = workspaceGraphConfigType(source);
    const projectCount = workspaceGraphProjectCount(source);
    const targetCount = packageManagerJsonObjectCount(source.text, "targets") + packageManagerJsonObjectCount(source.text, "scripts") + countMatches(source.text, /"targetDefaults"\s*:|executor\s*:|"executor"\s*:|dependsOn\s*:/gi);
    const tagCount = countMatches(source.text, /"tags"\s*:|\btags\s*:|scope:|type:/gi);
    const implicitDependencyCount = countMatches(source.text, /implicitDependencies|dependsOn|dependencies\s*:/gi);
    const namedInputCount = packageManagerJsonObjectCount(source.text, "namedInputs") + countMatches(source.text, /namedInputs|"{projectRoot}|\{workspaceRoot\}/gi);
    const pluginCount = countMatches(source.text, /"plugins"\s*:|@nx\/|@nrwl\/|createNodes|generators|executors|migrations/gi);
    const hasSignal = configType !== "unknown" || projectCount + targetCount + tagCount + implicitDependencyCount + namedInputCount + pluginCount > 0;
    if (!hasSignal) continue;
    rows.push({
      filePath: source.filePath,
      configType,
      projectCount,
      targetCount,
      tagCount,
      implicitDependencyCount,
      namedInputCount,
      pluginCount,
      readiness: projectCount > 0 && targetCount > 0 ? "ready" : hasSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains projects ${projectCount}, targets ${targetCount}, tags ${tagCount}, implicit dependencies ${implicitDependencyCount}, named inputs ${namedInputCount}, plugins ${pluginCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function workspaceGraphConfigType(source: WorkspaceGraphSourceFile): WorkspaceGraphReadinessReport["workspaceFiles"][number]["configType"] {
  const base = path.basename(source.filePath).toLowerCase();
  if (base === "nx.json") return "nx-json";
  if (base === "project.json") return "project-json";
  if (base === "package.json") return "package-json";
  if (base === "pnpm-workspace.yaml" || base === "pnpm-workspace.yml") return "pnpm-workspace";
  if (base === "lerna.json") return "lerna";
  if (base === "rush.json") return "rush";
  if (base === "turbo.json") return "turbo";
  if (base === "moon.yml" || base === "moon.yaml") return "moon";
  if (/workspace|project graph|monorepo/i.test(source.text)) return "workspace";
  return "unknown";
}

function workspaceGraphProjectCount(source: WorkspaceGraphSourceFile): number {
  const base = path.basename(source.filePath).toLowerCase();
  if (base === "project.json") return 1;
  if (base === "package.json") {
    try {
      const json = JSON.parse(source.text) as Record<string, unknown>;
      return typeof json.name === "string" ? 1 : packageManagerJsonObjectCount(source.text, "workspaces");
    } catch {
      return 0;
    }
  }
  return packageManagerJsonObjectCount(source.text, "projects")
    + countMatches(source.text, /"projectType"\s*:|"sourceRoot"\s*:|projectRoot|packages:\s*\n\s*-/gi);
}

function workspaceGraphProjectSignals(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["projectSignals"] {
  const specs: Array<{ signal: WorkspaceGraphReadinessReport["projectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "project-json", pattern: /(^|\/)project\.json$|"projectType"\s*:|"sourceRoot"\s*:/i, evidence: "project.json or project metadata evidence was detected." },
    { signal: "package-workspace", pattern: /"workspaces"\s*:|pnpm-workspace\.ya?ml|packages:\s*\n\s*-/i, evidence: "package workspace evidence was detected." },
    { signal: "apps-dir", pattern: /(^|\/)apps?\//i, evidence: "apps directory evidence was detected." },
    { signal: "libs-dir", pattern: /(^|\/)libs?\//i, evidence: "libs directory evidence was detected." },
    { signal: "packages-dir", pattern: /(^|\/)packages\//i, evidence: "packages directory evidence was detected." },
    { signal: "project-name", pattern: /"name"\s*:|\bname\s*:/i, evidence: "project name evidence was detected." },
    { signal: "source-root", pattern: /"sourceRoot"\s*:|sourceRoot\s*:/i, evidence: "sourceRoot evidence was detected." },
    { signal: "project-type", pattern: /"projectType"\s*:|projectType\s*:/i, evidence: "projectType evidence was detected." },
    { signal: "tags", pattern: /"tags"\s*:|\btags\s*:/i, evidence: "project tags evidence was detected." },
    { signal: "implicit-dependencies", pattern: /implicitDependencies/i, evidence: "implicit dependency evidence was detected." }
  ];
  return workspaceGraphSignalFromSpecs(sourceFiles, specs, "project", "signal");
}

function workspaceGraphGraphSignals(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["graphSignals"] {
  const specs: Array<{ signal: WorkspaceGraphReadinessReport["graphSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "project-graph", pattern: /ProjectGraph|project graph/i, evidence: "ProjectGraph evidence was detected." },
    { signal: "create-project-graph", pattern: /createProjectGraphAsync|createProjectGraph/i, evidence: "createProjectGraph evidence was detected." },
    { signal: "read-project-graph", pattern: /readCachedProjectGraph|readProjectsConfigurationFromProjectGraph/i, evidence: "read project graph evidence was detected." },
    { signal: "nx-graph", pattern: /\bnx\s+graph\b|graph --file|nx graph/i, evidence: "nx graph command evidence was detected." },
    { signal: "graph-file", pattern: /project-graph\.(json|html)|graph\.json|graph\/client/i, evidence: "graph output file evidence was detected." },
    { signal: "dependency-edge", pattern: /dependencies|dependency edge|sourceRoot|implicitDependencies/i, evidence: "dependency edge evidence was detected." },
    { signal: "affected-graph", pattern: /affected graph|affectedProjects|calculateFileChanges|TouchedProjectLocator/i, evidence: "affected graph evidence was detected." }
  ];
  return workspaceGraphSignalFromSpecs(sourceFiles, specs, "graph", "signal");
}

function workspaceGraphBoundarySignals(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["boundarySignals"] {
  const specs: Array<{ signal: WorkspaceGraphReadinessReport["boundarySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "enforce-module-boundaries", pattern: /enforce-module-boundaries|@nx\/enforce-module-boundaries|@nrwl\/nx\/enforce-module-boundaries/i, evidence: "module boundary lint rule evidence was detected." },
    { signal: "dep-constraints", pattern: /depConstraints|onlyDependOnLibsWithTags|notDependOnLibsWithTags|sourceTag|allSourceTags/i, evidence: "dependency constraints evidence was detected." },
    { signal: "tags", pattern: /"tags"\s*:|\btags\s*:|scope:|type:/i, evidence: "tag boundary evidence was detected." },
    { signal: "scopes", pattern: /scope:|domain:|layer:|platform:/i, evidence: "scope tag evidence was detected." },
    { signal: "lint-rule", pattern: /eslint|lint|rules/i, evidence: "lint boundary policy evidence was detected." },
    { signal: "tsconfig-paths", pattern: /"paths"\s*:|tsconfig\.base\.json|tsconfig\.json/i, evidence: "TypeScript path alias evidence was detected." },
    { signal: "implicit-dependencies", pattern: /implicitDependencies/i, evidence: "implicit boundary dependency evidence was detected." },
    { signal: "circular", pattern: /circular|no-circular|cycle/i, evidence: "circular dependency policy evidence was detected." }
  ];
  return workspaceGraphSignalFromSpecs(sourceFiles, specs, "boundary", "signal");
}

function workspaceGraphAffectedSignals(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["affectedSignals"] {
  const specs: Array<{ signal: WorkspaceGraphReadinessReport["affectedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nx-affected", pattern: /\bnx\s+affected\b|nx affected/i, evidence: "nx affected command evidence was detected." },
    { signal: "base-head", pattern: /--base|--head|NX_BASE|NX_HEAD|baseSha|headSha/i, evidence: "base/head input evidence was detected." },
    { signal: "affected-projects", pattern: /affectedProjects|show projects --affected|printAffected|affected projects/i, evidence: "affected projects evidence was detected." },
    { signal: "affected-target", pattern: /affected\s+-t|affected --target|affected:|affected-target/i, evidence: "affected target evidence was detected." },
    { signal: "print-affected", pattern: /print-affected|printAffected/i, evidence: "print affected evidence was detected." },
    { signal: "ci-affected", pattern: /CI|GitHub Actions|gitlab|azure|affected-only|nx-cloud/i, evidence: "CI affected-run evidence was detected." }
  ];
  return workspaceGraphSignalFromSpecs(sourceFiles, specs, "affected", "signal");
}

function workspaceGraphTargetSignals(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["targetSignals"] {
  const specs: Array<{ signal: WorkspaceGraphReadinessReport["targetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "targets", pattern: /"targets"\s*:|\btargets\s*:|architect\s*:/i, evidence: "project targets evidence was detected." },
    { signal: "target-defaults", pattern: /targetDefaults/i, evidence: "targetDefaults evidence was detected." },
    { signal: "named-inputs", pattern: /namedInputs/i, evidence: "namedInputs evidence was detected." },
    { signal: "depends-on", pattern: /dependsOn|\^build|\^test/i, evidence: "target dependency evidence was detected." },
    { signal: "inputs", pattern: /"inputs"\s*:|\binputs\s*:/i, evidence: "target inputs evidence was detected." },
    { signal: "outputs", pattern: /"outputs"\s*:|\boutputs\s*:/i, evidence: "target outputs evidence was detected." },
    { signal: "executor", pattern: /"executor"\s*:|\bexecutor\s*:|command\s*:/i, evidence: "executor or command evidence was detected." },
    { signal: "cache", pattern: /"cache"\s*:|cacheableOperations|remoteCache|nx-cloud/i, evidence: "cache policy evidence was detected." },
    { signal: "continuous", pattern: /continuous|persistent|dependsOn.*serve/i, evidence: "continuous/persistent target evidence was detected." }
  ];
  return workspaceGraphSignalFromSpecs(sourceFiles, specs, "target", "signal");
}

function workspaceGraphPluginSignals(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["pluginSignals"] {
  const specs: Array<{ signal: WorkspaceGraphReadinessReport["pluginSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nx-plugin", pattern: /@nx\/plugin|nx-plugin|NxPlugin/i, evidence: "Nx plugin evidence was detected." },
    { signal: "plugins", pattern: /"plugins"\s*:|\bplugins\s*:/i, evidence: "plugins array evidence was detected." },
    { signal: "create-nodes", pattern: /createNodes|createNodesV2|createNodesFromFiles/i, evidence: "createNodes plugin evidence was detected." },
    { signal: "generators", pattern: /generators\.json|\/generators\/|GeneratorCallback|Tree\b/i, evidence: "generator evidence was detected." },
    { signal: "executors", pattern: /executors\.json|\/executors\/|ExecutorContext|runExecutor/i, evidence: "executor evidence was detected." },
    { signal: "migrations", pattern: /migrations\.json|\/migrations\/|Migration/i, evidence: "migration evidence was detected." },
    { signal: "inferred-tasks", pattern: /inferred|createNodes|targetDefaults|plugin options/i, evidence: "inferred task evidence was detected." }
  ];
  return workspaceGraphSignalFromSpecs(sourceFiles, specs, "plugin", "signal");
}

function workspaceGraphPackageSignals(sourceFiles: WorkspaceGraphSourceFile[]): WorkspaceGraphReadinessReport["packageSignals"] {
  const specs: Array<{ signal: WorkspaceGraphReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nx", pattern: /"nx"\s*:|from ['"]nx|require\(['"]nx|npx nx|\bnx\s+(graph|affected|run|show)/i, evidence: "nx package or command evidence was detected." },
    { signal: "@nx/workspace", pattern: /"@nx\/workspace"|@nx\/workspace/i, evidence: "@nx/workspace evidence was detected." },
    { signal: "@nx/js", pattern: /"@nx\/js"|@nx\/js/i, evidence: "@nx/js evidence was detected." },
    { signal: "@nx/eslint-plugin", pattern: /"@nx\/eslint-plugin"|@nx\/eslint-plugin|enforce-module-boundaries/i, evidence: "@nx/eslint-plugin evidence was detected." },
    { signal: "turbo", pattern: /"turbo"|turbo\.json|turborepo/i, evidence: "Turborepo package/config evidence was detected." },
    { signal: "pnpm-workspace", pattern: /pnpm-workspace\.ya?ml|packages:\s*\n\s*-/i, evidence: "pnpm workspace evidence was detected." }
  ];
  return workspaceGraphSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function workspaceGraphSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: WorkspaceGraphSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/workspace-graph-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildScaffoldingReadinessReport(walk: WalkResult): Promise<ScaffoldingReadinessReport> {
  const sourceFiles = await scaffoldingSourceFiles(walk);
  const generatorFiles = scaffoldingGeneratorFiles(sourceFiles);
  const promptSignals = scaffoldingPromptSignals(sourceFiles);
  const actionSignals = scaffoldingActionSignals(sourceFiles);
  const templateSignals = scaffoldingTemplateSignals(sourceFiles);
  const safetySignals = scaffoldingSafetySignals(sourceFiles);
  const packageSignals = scaffoldingPackageSignals(sourceFiles);

  const hasGenerator = generatorFiles.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasPrompt = promptSignals.some((item) => item.readiness === "ready") || generatorFiles.some((item) => item.promptCount > 0);
  const hasAction = actionSignals.some((item) => item.readiness === "ready") || generatorFiles.some((item) => item.actionCount > 0);
  const hasTemplate = templateSignals.some((item) => item.readiness === "ready") || generatorFiles.some((item) => item.templateCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || generatorFiles.some((item) => item.safetyCount > 0);

  const riskQueue: ScaffoldingReadinessReport["riskQueue"] = [];
  if (!hasGenerator) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a scaffolding entrypoint before claiming repeatable code-generation workflows.",
      why: "Plop-style readiness starts with a plopfile, generator folder, package script, or equivalent template automation learners can locate.",
      relatedHref: "html/scaffolding-readiness.html"
    });
  }
  if (hasGenerator && !hasPrompt) {
    riskQueue.push({
      priority: "medium",
      action: "Map generator inputs through prompts, choices, defaults, validation, or bypass arguments.",
      why: "Scaffolding is reproducible only when learners can see which answers drive generated paths and file contents.",
      relatedHref: "html/scaffolding-readiness.html"
    });
  }
  if (hasGenerator && !hasAction) {
    riskQueue.push({
      priority: "high",
      action: "Document actions such as add, addMany, modify, append, custom action functions, or command hooks.",
      why: "Generator definitions need visible mutation steps so users understand which files are created or changed.",
      relatedHref: "html/scaffolding-readiness.html"
    });
  }
  if (hasAction && !hasTemplate) {
    riskQueue.push({
      priority: "high",
      action: "Trace template files, template directories, helpers, partials, and variable placeholders.",
      why: "Actions without templates do not explain the reusable source of generated file contents.",
      relatedHref: "html/scaffolding-readiness.html"
    });
  }
  if (hasAction && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Record overwrite, skip-if-exists, abort-on-fail, validation, dry-run, or snapshot safety controls.",
      why: "Generation tools mutate source trees, so learners need conflict and idempotency signals before running them.",
      relatedHref: "html/scaffolding-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run generators only in a disposable copy of the original project before treating scaffolding readiness as approved.",
    why: "RepoTutor records scaffolding readiness only; it does not invoke prompts, write generated files, run codemods, execute shell actions, or validate generated output.",
    relatedHref: "html/scaffolding-readiness.html"
  });

  return {
    summary: `Plop-style scaffolding readiness report: generator file ${generatorFiles.length}개, prompt signal ${promptSignals.length}개, action signal ${actionSignals.length}개, template signal ${templateSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Plop setGenerator prompts actions add addMany modify append templateFile helpers partials load skipIfExists force abortOnFail",
    generatorFiles,
    promptSignals,
    actionSignals,
    templateSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"setGenerator|plopfile|hygen|generator|schematics|jscodeshift\" .", purpose: "Find scaffolding entrypoints, generator folders, schematics, and codemod tooling." },
      { command: "rg \"prompts|type: ['\\\"](input|confirm|list|checkbox)|choices|validate|default|bypass\" .", purpose: "Map generator inputs, defaults, choices, validation, and bypass arguments." },
      { command: "rg \"type: ['\\\"](add|addMany|modify|append)|setActionType|actions\\s*:\\s*function|transform\" .", purpose: "Trace creation, modification, custom action, dynamic action, and transform steps." },
      { command: "rg \"templateFile|templateFiles|\\.hbs|\\.ejs|\\.mustache|setHelper|setPartial|{{\" .", purpose: "Review template sources, partials, helpers, variables, and rendered file paths." },
      { command: "rg \"skipIfExists|force|abortOnFail|dry-run|validate|existsSync|snapshot\" .", purpose: "Check overwrite, conflict, validation, dry-run, and snapshot safety controls." }
    ],
    learnerNextSteps: [
      "먼저 plopfile, generator folders, package scripts, schematics, hygen templates, codemod entrypoints를 찾아 generation entrypoint를 확인하세요.",
      "prompts, choices, defaults, validate, bypass argument 신호로 사용자가 입력해야 하는 값을 분리하세요.",
      "add, addMany, modify, append, custom action, dynamic actions, transform 신호로 source tree mutation 단계를 추적하세요.",
      "templateFile, templateFiles, .hbs/.ejs/.mustache, setHelper, setPartial 신호로 generated content의 원본 템플릿을 찾으세요.",
      "skipIfExists, force, abortOnFail, dry-run, validation, snapshot 신호로 overwrite와 conflict safety를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 generator 실행, codemod 적용, shell action, generated output 검증은 원본 프로젝트의 disposable copy에서 별도 확인하세요."
    ]
  };
}

type ScaffoldingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function scaffoldingSourceFiles(walk: WalkResult): Promise<ScaffoldingSourceFile[]> {
  const files: ScaffoldingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !scaffoldingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!scaffoldingPathSignal(file.relPath) && !scaffoldingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function scaffoldingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return scaffoldingPathSignal(filePath)
    || /^(plopfile\.[cm]?[jt]s|package\.json|generators\.json|collection\.json|schema\.json|hygen\.js|generator\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|ya?ml|toml|md|mdx|hbs|handlebars|ejs|mustache|stub|tmpl)$/i.test(filePath);
}

function scaffoldingPathSignal(filePath: string): boolean {
  return /(^|\/)(plopfile\.[cm]?[jt]s|plop-templates|_templates|templates?|generators?|generator|schematics?|blueprints?|codemods?|transforms?|migrations?|scaffold|scaffolding|hygen|package\.json)(\/|$|\.|-|_)/i.test(filePath);
}

function scaffoldingContentSignal(text: string): boolean {
  return /(setGenerator|NodePlopAPI|PlopGenerator|prompts\s*:|actions\s*:|templateFile|templateFiles|addMany|skipIfExists|setHelper|setPartial|setActionType|plop\.load|hygen|yeoman-generator|@angular-devkit\/schematics|jscodeshift|ts-morph|recast|codemod)/i.test(text);
}

function scaffoldingGeneratorFiles(sourceFiles: ScaffoldingSourceFile[]): ScaffoldingReadinessReport["generatorFiles"] {
  const rows: ScaffoldingReadinessReport["generatorFiles"] = [];
  for (const source of sourceFiles) {
    const generatorCount = countMatches(source.text, /setGenerator|getGenerator|GeneratorConfig|generator\s*:/gi) + (scaffoldingGeneratorType(source) !== "unknown" ? 1 : 0);
    const promptCount = countMatches(source.text, /prompts\s*:|setPrompt|type\s*:\s*['"](input|confirm|list|checkbox|password|editor)|choices\s*:|validate\s*:|default\s*:/gi);
    const actionCount = countMatches(source.text, /actions\s*:|type\s*:\s*['"](add|addMany|modify|append)|setActionType|custom action|actions\s*:\s*function|transform\s*:/gi);
    const templateCount = countMatches(source.text, /templateFile|templateFiles|template\s*:|\.hbs|\.handlebars|\.ejs|\.mustache|{{\s*[\w@#/>]/gi) + (/\.(hbs|handlebars|ejs|mustache|stub|tmpl)$/i.test(source.filePath) ? 1 : 0);
    const helperCount = countMatches(source.text, /setHelper|registerHelper|helpers?\s*:|dashCase|camelCase|pascalCase|properCase/gi);
    const partialCount = countMatches(source.text, /setPartial|registerPartial|partials?\s*:|{{>\s*[\w-]+/gi);
    const safetyCount = countMatches(source.text, /skipIfExists|force|abortOnFail|dry-run|dryRun|validate|existsSync|overwrite|snapshot|idempotent/gi);
    const hasSignal = generatorCount + promptCount + actionCount + templateCount + helperCount + partialCount + safetyCount > 0;
    if (!hasSignal) continue;
    rows.push({
      filePath: source.filePath,
      generatorType: scaffoldingGeneratorType(source),
      generatorCount,
      promptCount,
      actionCount,
      templateCount,
      helperCount,
      partialCount,
      safetyCount,
      readiness: generatorCount > 0 && actionCount > 0 && templateCount > 0 ? "ready" : hasSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains generators ${generatorCount}, prompts ${promptCount}, actions ${actionCount}, templates ${templateCount}, helpers ${helperCount}, partials ${partialCount}, safety controls ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function scaffoldingGeneratorType(source: ScaffoldingSourceFile): ScaffoldingReadinessReport["generatorFiles"][number]["generatorType"] {
  const filePath = source.filePath.toLowerCase();
  if (/plopfile\.[cm]?[jt]s$/.test(filePath) || /setGenerator|NodePlopAPI|node-plop|plopfile/i.test(source.text)) return "plopfile";
  if (/(^|\/)_templates\//.test(filePath) || /hygen/i.test(source.text)) return "hygen";
  if (/yeoman-generator|class .* extends Generator|this\.fs\.copyTpl/i.test(source.text)) return "yeoman";
  if (/collection\.json|@angular-devkit\/schematics|Rule\b|Tree\b|schematics?\//i.test(source.text) || /schematics?\//.test(filePath)) return "schematic";
  if (/generators\.json|@nx\/plugin|GeneratorCallback|Tree\b/i.test(source.text) || /(^|\/)generators?\//.test(filePath)) return "nx-generator";
  if (/(^|\/)(templates?|plop-templates)\//.test(filePath) || /\.(hbs|handlebars|ejs|mustache|stub|tmpl)$/.test(filePath)) return "template-dir";
  if (path.basename(filePath) === "package.json" && /"plop"|"hygen"|"generate"|"scaffold"/i.test(source.text)) return "package-script";
  if (/jscodeshift|ts-morph|recast|codemod|transform/i.test(source.text) || /codemods?|transforms?/.test(filePath)) return "codemod";
  return "unknown";
}

function scaffoldingPromptSignals(sourceFiles: ScaffoldingSourceFile[]): ScaffoldingReadinessReport["promptSignals"] {
  const specs: Array<{ signal: ScaffoldingReadinessReport["promptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "input", pattern: /type\s*:\s*['"]input|input prompt/i, evidence: "input prompt evidence was detected." },
    { signal: "confirm", pattern: /type\s*:\s*['"]confirm|confirm prompt/i, evidence: "confirm prompt evidence was detected." },
    { signal: "list", pattern: /type\s*:\s*['"]list|list prompt/i, evidence: "list prompt evidence was detected." },
    { signal: "checkbox", pattern: /type\s*:\s*['"]checkbox|checkbox prompt/i, evidence: "checkbox prompt evidence was detected." },
    { signal: "choices", pattern: /choices\s*:/i, evidence: "prompt choices evidence was detected." },
    { signal: "validate", pattern: /validate\s*:/i, evidence: "prompt validation evidence was detected." },
    { signal: "default", pattern: /default\s*:/i, evidence: "prompt default evidence was detected." },
    { signal: "bypass", pattern: /bypass|argv|--\s+|plop\s+\w+\s+["'<]/i, evidence: "prompt bypass evidence was detected." },
    { signal: "custom-prompt", pattern: /setPrompt|registerPrompt|inquirer-[\w-]+-prompt/i, evidence: "custom prompt evidence was detected." }
  ];
  return scaffoldingSignalFromSpecs(sourceFiles, specs, "prompt", "signal");
}

function scaffoldingActionSignals(sourceFiles: ScaffoldingSourceFile[]): ScaffoldingReadinessReport["actionSignals"] {
  const specs: Array<{ signal: ScaffoldingReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "add", pattern: /type\s*:\s*['"]add['"]|\bAdd action\b/i, evidence: "add action evidence was detected." },
    { signal: "add-many", pattern: /type\s*:\s*['"]addMany['"]|addMany/i, evidence: "addMany action evidence was detected." },
    { signal: "modify", pattern: /type\s*:\s*['"]modify['"]|\bModify action\b/i, evidence: "modify action evidence was detected." },
    { signal: "append", pattern: /type\s*:\s*['"]append['"]|\bappend\b/i, evidence: "append action evidence was detected." },
    { signal: "custom-action", pattern: /setActionType|custom action function|actions\s*:\s*\[[\s\S]{0,200}\([^)]*\)\s*=>|function\s*\([^)]*\)\s*\{/i, evidence: "custom action evidence was detected." },
    { signal: "dynamic-actions", pattern: /actions\s*:\s*function|actions\s*:\s*\([^)]*\)\s*=>|return\s+actions/i, evidence: "dynamic actions evidence was detected." },
    { signal: "transform", pattern: /transform\s*:/i, evidence: "transform action evidence was detected." },
    { signal: "run-command", pattern: /execa|child_process|spawn\(|exec\(|git init|npm install|pnpm install|yarn install/i, evidence: "command-running action evidence was detected." }
  ];
  return scaffoldingSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function scaffoldingTemplateSignals(sourceFiles: ScaffoldingSourceFile[]): ScaffoldingReadinessReport["templateSignals"] {
  const specs: Array<{ signal: ScaffoldingReadinessReport["templateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "template-file", pattern: /templateFile\s*:|\.hbs|\.handlebars|\.ejs|\.mustache/i, evidence: "template file evidence was detected." },
    { signal: "template-dir", pattern: /templateFiles\s*:|plop-templates|_templates|\/templates?\//i, evidence: "template directory evidence was detected." },
    { signal: "handlebars", pattern: /Handlebars|handlebars|\.hbs|{{\s*[#/>]?\w+/i, evidence: "Handlebars template evidence was detected." },
    { signal: "ejs", pattern: /\.ejs|<%[=-]?/i, evidence: "EJS template evidence was detected." },
    { signal: "mustache", pattern: /\.mustache|Mustache/i, evidence: "Mustache template evidence was detected." },
    { signal: "partials", pattern: /setPartial|registerPartial|partials?\s*:|{{>\s*[\w-]+/i, evidence: "template partial evidence was detected." },
    { signal: "helpers", pattern: /setHelper|registerHelper|helpers?\s*:|dashCase|camelCase|pascalCase|properCase/i, evidence: "template helper evidence was detected." },
    { signal: "variables", pattern: /{{\s*[\w.]+|<%=\s*[\w.]+|\$\{[\w.]+\}/i, evidence: "template variable evidence was detected." }
  ];
  return scaffoldingSignalFromSpecs(sourceFiles, specs, "template", "signal");
}

function scaffoldingSafetySignals(sourceFiles: ScaffoldingSourceFile[]): ScaffoldingReadinessReport["safetySignals"] {
  const specs: Array<{ signal: ScaffoldingReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "skip-if-exists", pattern: /skipIfExists/i, evidence: "skip-if-exists evidence was detected." },
    { signal: "force", pattern: /\bforce\b|--force/i, evidence: "force/overwrite control evidence was detected." },
    { signal: "abort-on-fail", pattern: /abortOnFail/i, evidence: "abort-on-fail evidence was detected." },
    { signal: "dry-run", pattern: /dry-run|dryRun|--dry/i, evidence: "dry-run evidence was detected." },
    { signal: "idempotent", pattern: /idempotent|repeatable|safe to re-run/i, evidence: "idempotency evidence was detected." },
    { signal: "validation", pattern: /validate\s*:|validation|assert|throw new Error/i, evidence: "validation evidence was detected." },
    { signal: "conflict-check", pattern: /existsSync|pathExists|already exists|overwrite|conflict/i, evidence: "conflict check evidence was detected." },
    { signal: "snapshots", pattern: /snapshot|toMatchSnapshot|fixtures?|golden/i, evidence: "snapshot/fixture evidence was detected." }
  ];
  return scaffoldingSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function scaffoldingPackageSignals(sourceFiles: ScaffoldingSourceFile[]): ScaffoldingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ScaffoldingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "plop", pattern: /"plop"|from ['"]plop|require\(['"]plop|npx plop|\bplop\b/i, evidence: "plop package or command evidence was detected." },
    { signal: "node-plop", pattern: /"node-plop"|from ['"]node-plop|require\(['"]node-plop|nodePlop/i, evidence: "node-plop evidence was detected." },
    { signal: "hygen", pattern: /"hygen"|npx hygen|\bhygen\b/i, evidence: "hygen evidence was detected." },
    { signal: "yeoman-generator", pattern: /"yeoman-generator"|from ['"]yeoman-generator|require\(['"]yeoman-generator/i, evidence: "yeoman-generator evidence was detected." },
    { signal: "@angular-devkit/schematics", pattern: /@angular-devkit\/schematics|schematics/i, evidence: "schematics evidence was detected." },
    { signal: "jscodeshift", pattern: /"jscodeshift"|from ['"]jscodeshift|require\(['"]jscodeshift|jscodeshift/i, evidence: "jscodeshift evidence was detected." },
    { signal: "ts-morph", pattern: /"ts-morph"|from ['"]ts-morph|require\(['"]ts-morph|Project\s*\(/i, evidence: "ts-morph evidence was detected." },
    { signal: "recast", pattern: /"recast"|from ['"]recast|require\(['"]recast|recast/i, evidence: "recast evidence was detected." }
  ];
  return scaffoldingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function scaffoldingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ScaffoldingSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/scaffolding-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSchedulerReadinessReport(walk: WalkResult): Promise<SchedulerReadinessReport> {
  const sourceFiles = await schedulerSourceFiles(walk);
  const schedulerSetups = schedulerSetupFiles(sourceFiles);
  const scheduleSignals = schedulerScheduleSignals(sourceFiles);
  const taskSignals = schedulerTaskSignals(sourceFiles);
  const lifecycleSignals = schedulerLifecycleSignals(sourceFiles);
  const reliabilitySignals = schedulerReliabilitySignals(sourceFiles);
  const packageSignals = schedulerPackageSignals(sourceFiles);

  const hasScheduler = schedulerSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasSchedule = scheduleSignals.some((item) => item.readiness === "ready") || schedulerSetups.some((item) => item.scheduleCount > 0 || item.cronExpressionCount > 0);
  const hasTask = taskSignals.some((item) => item.readiness === "ready") || schedulerSetups.some((item) => item.taskCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready") || schedulerSetups.some((item) => item.lifecycleCount > 0);
  const hasReliability = reliabilitySignals.some((item) => item.readiness === "ready") || schedulerSetups.some((item) => item.overlapControlCount + item.retryCount + item.errorCount > 0);

  const riskQueue: SchedulerReadinessReport["riskQueue"] = [];
  if (!hasScheduler) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document scheduled task tooling before claiming cron readiness.",
      why: "Scheduler readiness starts with a discoverable cron package, scheduled workflow, platform cron config, or custom scheduler entrypoint.",
      relatedHref: "html/scheduler-readiness.html"
    });
  }
  if (hasScheduler && !hasSchedule) {
    riskQueue.push({
      priority: "high",
      action: "Record cron expressions, intervals, fixed-date triggers, timezone, and validation strategy.",
      why: "Learners need to know when jobs run and whether the schedule expression is validated before deployment.",
      relatedHref: "html/scheduler-readiness.html"
    });
  }
  if (hasSchedule && !hasTask) {
    riskQueue.push({
      priority: "high",
      action: "Trace inline callbacks, background task files, async work, task context, and manual execution paths.",
      why: "A schedule without a task body does not explain the side effect, runtime boundary, or rebuild order.",
      relatedHref: "html/scheduler-readiness.html"
    });
  }
  if (hasTask && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Document start, stop, destroy, createTask, registry, events, and shutdown behavior.",
      why: "Scheduled tasks need lifecycle ownership so dev servers, workers, tests, and shutdown paths do not leak timers.",
      relatedHref: "html/scheduler-readiness.html"
    });
  }
  if (hasTask && !hasReliability) {
    riskQueue.push({
      priority: "medium",
      action: "Add overlap, max execution, retry, lock, idempotency, logging, or error handling controls.",
      why: "Cron jobs often fail through duplicate execution, long-running tasks, missing retries, or silent errors.",
      relatedHref: "html/scheduler-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify schedules in the original runtime before treating this report as operational approval.",
    why: "RepoTutor records scheduler readiness only; it does not start timers, wait for cron ticks, execute jobs, acquire locks, retry failures, or validate platform cron delivery.",
    relatedHref: "html/scheduler-readiness.html"
  });

  return {
    summary: `node-cron-style scheduler readiness report: setup ${schedulerSetups.length}개, schedule signal ${scheduleSignals.length}개, task signal ${taskSignals.length}개, reliability signal ${reliabilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "node-cron schedule createTask cron expression timezone noOverlap maxExecutions start stop destroy execute validate ScheduledTask",
    schedulerSetups,
    scheduleSignals,
    taskSignals,
    lifecycleSignals,
    reliabilitySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"node-cron|cron\\.schedule|schedule\\(|createTask|CronJob|Bree|Agenda|repeatable|cron:\" .", purpose: "Find scheduler packages, cron entrypoints, platform cron configs, and repeatable jobs." },
      { command: "rg \"['\\\"](\\\\*|[0-9/,*-]+) [0-9/,*-]+ [0-9/,*-]+ [0-9/,*-]+ [0-9/,*-]+|timezone|timeZone|validate\\(\" .", purpose: "Trace cron expressions, timezone settings, and validation calls." },
      { command: "rg \"start\\(|stop\\(|destroy\\(|execute\\(|createTask|scheduled:\\s*false|runOnInit|registry|on\\(\" .", purpose: "Review task lifecycle, manual execution, event hooks, and registry ownership." },
      { command: "rg \"noOverlap|maxExecutions|retry|backoff|lock|mutex|idempotent|catch\\(|logger|shutdown|SIGTERM\" .", purpose: "Check overlap, retry, lock, idempotency, error, logging, and shutdown controls." }
    ],
    learnerNextSteps: [
      "먼저 node-cron, cron, Bree, Agenda, BullMQ repeatable job, GitHub Actions schedule, Vercel cron 신호를 찾아 scheduler entrypoint를 확인하세요.",
      "cron expression, seconds field, interval/fixed-date trigger, timezone, validate() 신호로 실행 시간을 분리하세요.",
      "inline callback, background task file, async task, task context, manual execute 신호로 실제 side effect가 어디 있는지 찾으세요.",
      "start, stop, destroy, createTask, scheduled:false, runOnInit, registry, events 신호로 lifecycle ownership을 확인하세요.",
      "noOverlap, maxExecutions, retry/backoff, lock, idempotency, catch/logger, graceful shutdown 신호로 운영 안정성을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 timer tick, task execution, lock acquisition, retry behavior, platform cron delivery는 원본 런타임에서 별도 검증하세요."
    ]
  };
}

type SchedulerSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function schedulerSourceFiles(walk: WalkResult): Promise<SchedulerSourceFile[]> {
  const files: SchedulerSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !schedulerInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!schedulerPathSignal(file.relPath) && !schedulerContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function schedulerInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return schedulerPathSignal(filePath)
    || /^(package\.json|cron\.[cm]?[jt]s|scheduler\.[cm]?[jt]s|schedule\.[cm]?[jt]s|jobs?\.[cm]?[jt]s|worker\.[cm]?[jt]s|vercel\.json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|ya?ml|toml|md|mdx)$/i.test(filePath);
}

function schedulerPathSignal(filePath: string): boolean {
  return /(^|\/)(cron|crons|scheduler|schedulers|schedule|schedules|scheduled|jobs?|workers?|tasks?|background|agenda|bree|vercel\.json|package\.json|\.github\/workflows)(\/|$|\.|-|_)/i.test(filePath);
}

function schedulerContentSignal(text: string): boolean {
  return /(node-cron|cron\.schedule|schedule\s*\(|createTask\s*\(|CronJob|cronTime|Bree|Agenda|repeatable|repeatStrategy|noOverlap|maxExecutions|timezone|timeZone|ScheduledTask|TaskContext|runOnInit|scheduled\s*:\s*false|on:\s*\[\s*cron|cron:\s*['"])/i.test(text);
}

function schedulerSetupFiles(sourceFiles: SchedulerSourceFile[]): SchedulerReadinessReport["schedulerSetups"] {
  const rows: SchedulerReadinessReport["schedulerSetups"] = [];
  for (const source of sourceFiles) {
    const scheduleCount = countMatches(source.text, /cron\.schedule|schedule\s*\(|createTask\s*\(|new\s+CronJob|new\s+Bree|new\s+Agenda|repeatable|cron:\s*['"]|on:\s*\[\s*cron/gi);
    const cronExpressionCount = countMatches(source.text, /['"](?:\*|[0-9/,*-]+)\s+[0-9/,*-]+\s+[0-9/,*-]+\s+[0-9/,*-]+\s+[0-9/,*-]+(?:\s+[0-9/,*-]+)?['"]/gi);
    const taskCount = countMatches(source.text, /=>\s*\{|function\s*\(|async\s*\(|TaskFn|TaskContext|background task|taskPath|execute\s*\(|process\.env|worker/gi);
    const timezoneCount = countMatches(source.text, /timezone|timeZone|LocalizedTime|Intl\.DateTimeFormat|America\/|Europe\/|Asia\//gi);
    const lifecycleCount = countMatches(source.text, /start\s*\(|stop\s*\(|destroy\s*\(|createTask\s*\(|scheduled\s*:\s*false|runOnInit|registry|on\s*\(|off\s*\(|once\s*\(/gi);
    const overlapControlCount = countMatches(source.text, /noOverlap|lock|mutex|maxExecutions|skip.*overlap|prevent.*overlap/gi);
    const retryCount = countMatches(source.text, /retry|retries|backoff|attempts|repeatStrategy/gi);
    const errorCount = countMatches(source.text, /catch\s*\(|onFail|error|logger|throw new Error|failed|SIGTERM|shutdown/gi);
    const hasSignal = scheduleCount + cronExpressionCount + taskCount + timezoneCount + lifecycleCount + overlapControlCount + retryCount + errorCount > 0;
    if (!hasSignal) continue;
    rows.push({
      filePath: source.filePath,
      framework: schedulerFramework(source),
      scheduleCount,
      cronExpressionCount,
      taskCount,
      timezoneCount,
      lifecycleCount,
      overlapControlCount,
      retryCount,
      errorCount,
      readiness: scheduleCount > 0 && taskCount > 0 && (lifecycleCount > 0 || overlapControlCount > 0 || errorCount > 0) ? "ready" : hasSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains schedules ${scheduleCount}, cron expressions ${cronExpressionCount}, tasks ${taskCount}, timezones ${timezoneCount}, lifecycle ${lifecycleCount}, overlap controls ${overlapControlCount}, retries ${retryCount}, errors ${errorCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function schedulerFramework(source: SchedulerSourceFile): SchedulerReadinessReport["schedulerSetups"][number]["framework"] {
  if (/node-cron|cron\.schedule|createTask|ScheduledTask|noOverlap|maxExecutions/i.test(source.text)) return "node-cron";
  if (/from ['"]cron|require\(['"]cron|new\s+CronJob|CronTime/i.test(source.text)) return "cron";
  if (/new\s+Bree|from ['"]bree|require\(['"]bree/i.test(source.text)) return "bree";
  if (/new\s+Agenda|from ['"]agenda|require\(['"]agenda/i.test(source.text)) return "agenda";
  if (/repeatable|repeatStrategy|Queue\b|BullMQ/i.test(source.text)) return "bullmq-repeatable";
  if (/on:\s*\[\s*cron|schedule:/i.test(source.text) && /\.github\/workflows/.test(source.filePath)) return "github-actions";
  if (/vercel\.json|crons\s*:|path\s*:|schedule\s*:/i.test(source.text) && /vercel\.json$/i.test(source.filePath)) return "vercel-cron";
  if (/cron|schedule|scheduler|job/i.test(source.filePath) || /cron expression|scheduled task/i.test(source.text)) return "custom";
  return "unknown";
}

function schedulerScheduleSignals(sourceFiles: SchedulerSourceFile[]): SchedulerReadinessReport["scheduleSignals"] {
  const specs: Array<{ signal: SchedulerReadinessReport["scheduleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cron-expression", pattern: /['"](?:\*|[0-9/,*-]+)\s+[0-9/,*-]+\s+[0-9/,*-]+\s+[0-9/,*-]+\s+[0-9/,*-]+(?:\s+[0-9/,*-]+)?['"]|cron expression/i, evidence: "cron expression evidence was detected." },
    { signal: "seconds-field", pattern: /['"][0-9*,/-]+\s+[0-9*,/-]+\s+[0-9*,/-]+\s+[0-9*,/-]+\s+[0-9*,/-]+\s+[0-9*,/-]+['"]|validate-second/i, evidence: "six-field cron or seconds validation evidence was detected." },
    { signal: "interval", pattern: /setInterval|every\s*:|interval|repeat\.every|later\.parse\.text/i, evidence: "interval schedule evidence was detected." },
    { signal: "fixed-date", pattern: /runAt|Date\s*\(|at\s*:|fixed date|once/i, evidence: "fixed-date schedule evidence was detected." },
    { signal: "timezone", pattern: /timezone|timeZone|LocalizedTime|America\/|Europe\/|Asia\//i, evidence: "timezone evidence was detected." },
    { signal: "validated-expression", pattern: /validate\s*\(|validateCron|cron-parser|pattern-validation/i, evidence: "schedule validation evidence was detected." }
  ];
  return schedulerSignalFromSpecs(sourceFiles, specs, "schedule", "signal");
}

function schedulerTaskSignals(sourceFiles: SchedulerSourceFile[]): SchedulerReadinessReport["taskSignals"] {
  const specs: Array<{ signal: SchedulerReadinessReport["taskSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "inline-task", pattern: /schedule\s*\([^,]+,\s*(async\s*)?(\([^)]*\)|function)|createTask\s*\([^,]+,\s*(async\s*)?(\([^)]*\)|function)/i, evidence: "inline task callback evidence was detected." },
    { signal: "background-task", pattern: /BackgroundScheduledTask|taskPath|background task|['"][./][^'"]+\.(js|mjs|cjs|ts)['"]/i, evidence: "background task file evidence was detected." },
    { signal: "async-task", pattern: /async\s*\(|Promise|await\s+/i, evidence: "async task evidence was detected." },
    { signal: "named-task", pattern: /name\s*:|jobName|taskId|id\s*:/i, evidence: "named task evidence was detected." },
    { signal: "task-context", pattern: /TaskContext|context|execution|triggeredAt|dateLocalIso/i, evidence: "task context evidence was detected." },
    { signal: "manual-execute", pattern: /\.execute\s*\(|execute\s*\(\)/i, evidence: "manual execute evidence was detected." }
  ];
  return schedulerSignalFromSpecs(sourceFiles, specs, "task", "signal");
}

function schedulerLifecycleSignals(sourceFiles: SchedulerSourceFile[]): SchedulerReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: SchedulerReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "start", pattern: /\.start\s*\(|start\s*\(\)/i, evidence: "start lifecycle evidence was detected." },
    { signal: "stop", pattern: /\.stop\s*\(|stop\s*\(\)/i, evidence: "stop lifecycle evidence was detected." },
    { signal: "destroy", pattern: /\.destroy\s*\(|destroy\s*\(\)/i, evidence: "destroy lifecycle evidence was detected." },
    { signal: "create-task", pattern: /createTask\s*\(/i, evidence: "createTask evidence was detected." },
    { signal: "scheduled-false", pattern: /scheduled\s*:\s*false/i, evidence: "manual start scheduled:false evidence was detected." },
    { signal: "run-on-init", pattern: /runOnInit|runOnStartup|immediate/i, evidence: "run-on-init evidence was detected." },
    { signal: "registry", pattern: /registry|taskRegistry|Map<string,\s*ScheduledTask>|getTasks/i, evidence: "task registry evidence was detected." },
    { signal: "events", pattern: /\.on\s*\(|\.off\s*\(|\.once\s*\(|TaskEvent|onFail|onFinished/i, evidence: "task event evidence was detected." }
  ];
  return schedulerSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function schedulerReliabilitySignals(sourceFiles: SchedulerSourceFile[]): SchedulerReadinessReport["reliabilitySignals"] {
  const specs: Array<{ signal: SchedulerReadinessReport["reliabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "no-overlap", pattern: /noOverlap|overlap/i, evidence: "no-overlap evidence was detected." },
    { signal: "max-executions", pattern: /maxExecutions|runCount/i, evidence: "max executions evidence was detected." },
    { signal: "retry", pattern: /retry|retries|backoff|attempts|repeatStrategy/i, evidence: "retry/backoff evidence was detected." },
    { signal: "lock", pattern: /lock|mutex|semaphore|advisory lock|redis.*setnx/i, evidence: "lock evidence was detected." },
    { signal: "idempotency", pattern: /idempotent|dedupe|deduplicate|once/i, evidence: "idempotency evidence was detected." },
    { signal: "error-handler", pattern: /catch\s*\(|onFail|error|failed|uncaughtException/i, evidence: "error handling evidence was detected." },
    { signal: "logging", pattern: /logger|log\.|console\.(log|error|warn)/i, evidence: "logging evidence was detected." },
    { signal: "graceful-shutdown", pattern: /SIGTERM|SIGINT|shutdown|beforeExit|process\.on/i, evidence: "graceful shutdown evidence was detected." }
  ];
  return schedulerSignalFromSpecs(sourceFiles, specs, "reliability", "signal");
}

function schedulerPackageSignals(sourceFiles: SchedulerSourceFile[]): SchedulerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SchedulerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "node-cron", pattern: /"node-cron"|from ['"]node-cron|require\(['"]node-cron|cron\.schedule/i, evidence: "node-cron evidence was detected." },
    { signal: "cron", pattern: /"cron"|from ['"]cron|require\(['"]cron|CronJob/i, evidence: "cron package evidence was detected." },
    { signal: "bree", pattern: /"bree"|from ['"]bree|require\(['"]bree|new\s+Bree/i, evidence: "Bree evidence was detected." },
    { signal: "agenda", pattern: /"agenda"|from ['"]agenda|require\(['"]agenda|new\s+Agenda/i, evidence: "Agenda evidence was detected." },
    { signal: "bullmq", pattern: /"bullmq"|from ['"]bullmq|repeatable|repeatStrategy/i, evidence: "BullMQ repeatable job evidence was detected." },
    { signal: "toad-scheduler", pattern: /toad-scheduler|SimpleIntervalJob|AsyncTask/i, evidence: "toad-scheduler evidence was detected." },
    { signal: "github-actions-cron", pattern: /on:\s*\[\s*cron|schedule:\s*\n\s*-\s*cron/i, evidence: "GitHub Actions cron evidence was detected." },
    { signal: "vercel-cron", pattern: /"crons"\s*:|vercel\.json|schedule\s*:/i, evidence: "Vercel cron evidence was detected." }
  ];
  return schedulerSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function schedulerSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SchedulerSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/scheduler-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

function packageManagerJsonObjectCount(text: string, field: string): number {
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const value = json[field];
    return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).length : 0;
  } catch {
    return 0;
  }
}

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}
