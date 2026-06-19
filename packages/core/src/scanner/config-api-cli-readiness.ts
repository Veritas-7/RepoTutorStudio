import type { CliReadinessReport, EnvValidationReadinessReport, GraphqlReadinessReport, SecurityHeadersReadinessReport, TerminalUiReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildEnvValidationReadinessReport(walk: WalkResult): Promise<EnvValidationReadinessReport> {
  const sourceFiles = await envValidationReadinessSourceFiles(walk);
  const envSetups = envValidationReadinessSetups(sourceFiles);
  const schemaSignals = envValidationReadinessSchemaSignals(sourceFiles);
  const runtimeSignals = envValidationReadinessRuntimeSignals(sourceFiles);
  const boundarySignals = envValidationReadinessBoundarySignals(sourceFiles);
  const frameworkSignals = envValidationReadinessFrameworkSignals(sourceFiles);
  const validationSignals = envValidationReadinessValidationSignals(sourceFiles);
  const documentationSignals = envValidationReadinessDocumentationSignals(sourceFiles);
  const packageSignals = envValidationReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = envSetups.some((item) => item.readiness !== "missing");
  const hasSchema = schemaSignals.some((item) => item.readiness === "ready") || envSetups.some((item) => item.schemaCount > 0);
  const hasRuntimeEnv = runtimeSignals.some((item) => item.readiness === "ready") || envSetups.some((item) => item.runtimeEnvCount > 0);
  const hasBoundary = boundarySignals.some((item) => item.readiness === "ready") || envSetups.some((item) => item.serverCount + item.clientCount + item.prefixCount > 0);
  const hasFrameworkMode = frameworkSignals.some((item) => item.readiness === "ready");
  const hasValidationHandling = validationSignals.some((item) => item.readiness === "ready") || envSetups.some((item) => item.validationHookCount > 0);
  const hasDocs = documentationSignals.some((item) => item.readiness === "ready");

  const riskQueue: EnvValidationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document an environment-variable validation contract before relying on undeclared process.env reads.",
      why: "t3-env-style readiness starts with explicit env schemas, runtimeEnv wiring, or package evidence rather than scattered string lookups.",
      relatedHref: "html/env-validation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && (!hasSchema || !hasRuntimeEnv)) {
    riskQueue.push({
      priority: "high",
      action: "Pair env validation packages with explicit schema definitions and runtimeEnv/process.env/import.meta.env wiring.",
      why: "A validation dependency alone does not prove that required variables are parsed before app startup or build output.",
      relatedHref: "html/env-validation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasBoundary) {
    riskQueue.push({
      priority: "medium",
      action: "Separate server-only and client-exposed variables with prefixes and access guards.",
      why: "Client/server boundary mistakes can leak server secrets or omit public variables from bundled runtimes.",
      relatedHref: "html/env-validation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasFrameworkMode) {
    riskQueue.push({
      priority: "medium",
      action: "Document which t3-env package or framework preset owns runtime env wiring.",
      why: "t3-env core, Next.js, Nuxt, Astro, and Vite modes wire runtime variables and client prefixes differently.",
      relatedHref: "html/env-validation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasValidationHandling) {
    riskQueue.push({
      priority: "medium",
      action: "Document validation failure handling, skip-validation escapes, and empty-string/default behavior.",
      why: "Env validators often fail at startup or build time, so teams need clear behavior for invalid, empty, transformed, and defaulted variables.",
      relatedHref: "html/env-validation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasDocs) {
    riskQueue.push({
      priority: "low",
      action: "Keep .env.example or deployment variable documentation close to the schema.",
      why: "A typed schema helps developers, but deploy operators still need a visible required-variable checklist.",
      relatedHref: "html/env-validation-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the real app build/start command in the target environment before treating env validation as complete.",
    why: "RepoTutor records env validation readiness only; it does not load .env files, execute validators, evaluate transforms, contact secret stores, or run the analyzed project's tests.",
    relatedHref: "html/env-validation-readiness.html"
  });

  return {
    summary: `t3-env-style env validation readiness report: setup ${envSetups.length}개, schema signal ${schemaSignals.length}개, runtime signal ${runtimeSignals.length}개, boundary signal ${boundarySignals.length}개, framework signal ${frameworkSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "t3-env createEnv server client shared runtimeEnv runtimeEnvStrict clientPrefix Standard Schema process.env import.meta.env emptyStringAsUndefined skipValidation @t3-oss/env-core @t3-oss/env-nextjs @t3-oss/env-nuxt Astro Vite extends isServer",
    envSetups,
    schemaSignals,
    runtimeSignals,
    boundarySignals,
    frameworkSignals,
    validationSignals,
    documentationSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"createEnv|@t3-oss/env|cleanEnv|envsafe|env-var|dotenvx|dotenv\" package.json src app packages", purpose: "Inventory env validation packages and setup files." },
      { command: "rg \"server:|client:|shared:|clientPrefix|NEXT_PUBLIC_|NUXT_PUBLIC_|PUBLIC_|VITE_\" src app packages", purpose: "Check server/client/shared env boundary definitions." },
      { command: "rg \"@t3-oss/env-core|@t3-oss/env-nextjs|@t3-oss/env-nuxt|astro|vite|extends\\s*:|isServer|clientPrefix|NEXT_PUBLIC_|NUXT_PUBLIC_|PUBLIC_|VITE_\" package.json src app packages examples", purpose: "Identify the t3-env package, framework preset, and client-prefix mode." },
      { command: "rg \"runtimeEnv|runtimeEnvStrict|experimental__runtimeEnv|process\\.env|import\\.meta\\.env\" src app packages", purpose: "Review runtime environment object wiring." },
      { command: "rg \"skipValidation|emptyStringAsUndefined|onValidationError|onInvalidAccess|transform|default\" src app packages", purpose: "Inspect validation behavior, defaults, transforms, and escape hatches." },
      { command: "find . -maxdepth 3 \\( -name '.env.example' -o -name '.env.sample' -o -name '.env.template' \\) -print", purpose: "Find documented env variable examples without reading private .env secrets." },
      { command: "pnpm build", purpose: "Run the real build/start gate after static review to prove env validation executes as expected." }
    ],
    learnerNextSteps: [
      "먼저 @t3-oss/env, envalid, env-var, dotenv/dotenvx, Zod/Valibot/ArkType 패키지와 env setup 파일을 찾으세요.",
      "server, client, shared schema가 분리되어 있고 clientPrefix/NEXT_PUBLIC_/NUXT_PUBLIC_/VITE_ 같은 공개 변수 경계가 맞는지 확인하세요.",
      "@t3-oss/env-core, @t3-oss/env-nextjs, @t3-oss/env-nuxt, Astro/Vite 중 어떤 통합 모드가 runtimeEnv와 clientPrefix를 소유하는지 확인하세요.",
      "runtimeEnv, runtimeEnvStrict, experimental__runtimeEnv, process.env, import.meta.env 연결이 schema key와 맞는지 확인하세요.",
      "skipValidation, emptyStringAsUndefined, onValidationError, onInvalidAccess, transform/default 신호로 실패 동작과 예외 경로를 검토하세요.",
      ".env.example, deployment variables, README 문서가 schema와 맞는지 비교하세요.",
      "이 리포트는 정적 readiness입니다. 실제 env 값 검증은 안전한 로컬/CI 환경에서 build 또는 start command로 별도 확인하세요."
    ]
  };
}

type EnvValidationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function envValidationReadinessSourceFiles(walk: WalkResult): Promise<EnvValidationReadinessSourceFile[]> {
  const files: EnvValidationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !envValidationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!envValidationReadinessPathSignal(file.relPath) && !envValidationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function envValidationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return envValidationReadinessPathSignal(filePath)
    || /^(package\.json|README\.md|\.env\.example|\.env\.sample|\.env\.template|env\.(js|mjs|cjs|ts|tsx)|environment\.(js|mjs|cjs|ts)|config\.(js|mjs|cjs|ts|json)|next\.config\.(js|mjs|cjs|ts)|nuxt\.config\.(js|mjs|ts)|vite\.config\.(js|mjs|ts))$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml|env)$/i.test(filePath);
}

function envValidationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(env|environment|config|schema|schemas|validation|validator|validators|zod|valibot|arktype|dotenv|secrets?|src|app|server|client|packages|examples|docs|test|tests)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.env\.(example|sample|template)$/i.test(filePath);
}

function envValidationReadinessContentSignal(text: string): boolean {
  return /(@t3-oss\/env|createEnv|cleanEnv|envsafe|env-var|dotenvx|dotenv|runtimeEnv|runtimeEnvStrict|experimental__runtimeEnv|clientPrefix|NEXT_PUBLIC_|NUXT_PUBLIC_|VITE_|PUBLIC_|process\.env|import\.meta\.env|emptyStringAsUndefined|skipValidation|onValidationError|onInvalidAccess|Standard Schema|extends\s*:|isServer|Astro|Vite)/i.test(text);
}

function envValidationReadinessSetups(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["envSetups"] {
  const rows: EnvValidationReadinessReport["envSetups"] = [];
  for (const source of sourceFiles) {
    const schemaCount = countMatches(source.text, /createEnv|cleanEnv|envsafe|z\.object|z\.(string|url|number|boolean|enum)|v\.(object|string|number|boolean)|type\(|schema|StandardSchema/gi);
    const serverCount = countMatches(source.text, /server\s*:|serverOnly|server-side|SERVER_|DATABASE_URL|SECRET|API_KEY|TOKEN/gi);
    const clientCount = countMatches(source.text, /client\s*:|clientPrefix|NEXT_PUBLIC_|NUXT_PUBLIC_|VITE_|PUBLIC_/gi);
    const runtimeEnvCount = countMatches(source.text, /runtimeEnvStrict|runtimeEnv|experimental__runtimeEnv|process\.env|import\.meta\.env/gi);
    const prefixCount = countMatches(source.text, /clientPrefix|NEXT_PUBLIC_|NUXT_PUBLIC_|VITE_|PUBLIC_|CLIENT_/gi);
    const validationHookCount = countMatches(source.text, /onValidationError|onInvalidAccess|skipValidation|safeParse|parse\(|validate\(|ensureSynchronous/gi);
    const transformCount = countMatches(source.text, /emptyStringAsUndefined|transform\(|default\(|coerce|preprocess|port\(|num\(|bool\(/gi);
    const hasSetupSignal = schemaCount + serverCount + clientCount + runtimeEnvCount + prefixCount + validationHookCount + transformCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: envValidationReadinessProvider(source),
      schemaCount,
      serverCount,
      clientCount,
      runtimeEnvCount,
      prefixCount,
      validationHookCount,
      transformCount,
      readiness: schemaCount > 0 && runtimeEnvCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains schema ${schemaCount}, server ${serverCount}, client ${clientCount}, runtimeEnv ${runtimeEnvCount}, prefix ${prefixCount}, validation hook ${validationHookCount}, transform/default ${transformCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function envValidationReadinessProvider(source: EnvValidationReadinessSourceFile): EnvValidationReadinessReport["envSetups"][number]["provider"] {
  if (/@t3-oss\/env|createEnv/i.test(source.text)) return "t3-env";
  if (/envalid|cleanEnv|makeValidator|str\(|num\(|bool\(/i.test(source.text)) return "envalid";
  if (/dotenvx/i.test(source.text)) return "dotenvx";
  if (/\bdotenv\b|dotenv\/config|dotenv\.config/i.test(source.text)) return "dotenv";
  if (/env-var|get\(|required\(\)|asString|asPortNumber/i.test(source.text)) return "env-var";
  if (/\bzod\b|z\.object|z\.string/i.test(source.text)) return "zod";
  if (/\bvalibot\b|v\.object|v\.string/i.test(source.text)) return "valibot";
  if (/\barktype\b|type\(/i.test(source.text)) return "arktype";
  if (/process\.env|import\.meta\.env|schema|validate/i.test(source.text)) return "custom";
  return "unknown";
}

function envValidationReadinessSchemaSignals(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["schemaSignals"] {
  const specs: Array<{ signal: EnvValidationReadinessReport["schemaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-env", pattern: /createEnv|cleanEnv|envsafe/i, evidence: "env schema factory evidence was detected." },
    { signal: "server-schema", pattern: /server\s*:|server-side Environment variables|serverOnly|DATABASE_URL|API_KEY|SECRET/i, evidence: "server env schema evidence was detected." },
    { signal: "client-schema", pattern: /client\s*:|clientPrefix|NEXT_PUBLIC_|NUXT_PUBLIC_|VITE_|PUBLIC_/i, evidence: "client env schema evidence was detected." },
    { signal: "shared-schema", pattern: /shared\s*:|NODE_ENV|VERCEL_URL|PUBLIC_URL/i, evidence: "shared env schema evidence was detected." },
    { signal: "standard-schema", pattern: /Standard Schema|standardschema|~standard|StandardSchemaV1/i, evidence: "Standard Schema evidence was detected." },
    { signal: "zod", pattern: /\bzod\b|z\.object|z\.string|z\.url|z\.enum/i, evidence: "Zod schema evidence was detected." },
    { signal: "valibot", pattern: /\bvalibot\b|v\.object|v\.string|v\.pipe/i, evidence: "Valibot schema evidence was detected." },
    { signal: "arktype", pattern: /\barktype\b|type\(/i, evidence: "ArkType schema evidence was detected." }
  ];
  return envValidationReadinessSignalFromSpecs(sourceFiles, specs, "schema", "signal");
}

function envValidationReadinessRuntimeSignals(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: EnvValidationReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "process-env", pattern: /process\.env/i, evidence: "process.env evidence was detected." },
    { signal: "import-meta-env", pattern: /import\.meta\.env/i, evidence: "import.meta.env evidence was detected." },
    { signal: "runtime-env", pattern: /runtimeEnv\s*:/i, evidence: "runtimeEnv wiring evidence was detected." },
    { signal: "runtime-env-strict", pattern: /runtimeEnvStrict/i, evidence: "runtimeEnvStrict evidence was detected." },
    { signal: "experimental-runtime-env", pattern: /experimental__runtimeEnv/i, evidence: "experimental runtime env evidence was detected." },
    { signal: "dotenv-file", pattern: /\.env\.example|\.env\.sample|\.env\.template|dotenv|dotenvx/i, evidence: "dotenv/env example evidence was detected." }
  ];
  return envValidationReadinessSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function envValidationReadinessBoundarySignals(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["boundarySignals"] {
  const specs: Array<{ signal: EnvValidationReadinessReport["boundarySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "client-prefix", pattern: /clientPrefix|client-side variables must have|prefixed with/i, evidence: "client prefix evidence was detected." },
    { signal: "next-public", pattern: /NEXT_PUBLIC_/i, evidence: "Next.js public env prefix evidence was detected." },
    { signal: "nuxt-public", pattern: /NUXT_PUBLIC_/i, evidence: "Nuxt public env prefix evidence was detected." },
    { signal: "vite-public", pattern: /VITE_|PUBLIC_/i, evidence: "Vite/Astro public env prefix evidence was detected." },
    { signal: "server-only", pattern: /server\s*:|server-side|server-only|serverOnly|DATABASE_URL|SECRET|PRIVATE_/i, evidence: "server-only env evidence was detected." },
    { signal: "invalid-access-guard", pattern: /onInvalidAccess|Attempted to access a server-side environment variable|isServer|typeof window/i, evidence: "invalid client access guard evidence was detected." }
  ];
  return envValidationReadinessSignalFromSpecs(sourceFiles, specs, "boundary", "signal");
}

function envValidationReadinessFrameworkSignals(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: EnvValidationReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "core-package", pattern: /@t3-oss\/env-core|createEnv\b/i, evidence: "t3-env core package/factory evidence was detected." },
    { signal: "nextjs-preset", pattern: /@t3-oss\/env-nextjs|NEXT_PUBLIC_|next\.config|nextjs|Next\.js/i, evidence: "t3-env Next.js preset evidence was detected." },
    { signal: "nuxt-preset", pattern: /@t3-oss\/env-nuxt|NUXT_PUBLIC_|nuxt\.config|nuxt/i, evidence: "t3-env Nuxt preset evidence was detected." },
    { signal: "astro-vite", pattern: /astro|vite|import\.meta\.env|PUBLIC_|VITE_/i, evidence: "Astro/Vite env runtime evidence was detected." },
    { signal: "extends-env", pattern: /\bextends\s*:|extends\(/i, evidence: "env contract extension evidence was detected." },
    { signal: "is-server-override", pattern: /\bisServer\s*:|typeof\s+window|server boundary/i, evidence: "isServer/runtime boundary override evidence was detected." },
    { signal: "standard-schema-adapter", pattern: /Standard Schema|standardschema|~standard|StandardSchemaV1|valibot|arktype|zod/i, evidence: "Standard Schema compatible validator evidence was detected." }
  ];
  return envValidationReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function envValidationReadinessValidationSignals(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["validationSignals"] {
  const specs: Array<{ signal: EnvValidationReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "parse", pattern: /\.parse\(|parseWithDictionary|validate\(/i, evidence: "parse/validate evidence was detected." },
    { signal: "safe-parse", pattern: /safeParse/i, evidence: "safeParse evidence was detected." },
    { signal: "on-validation-error", pattern: /onValidationError|Invalid environment variables|ValidationError/i, evidence: "validation failure hook evidence was detected." },
    { signal: "skip-validation", pattern: /skipValidation|SKIP_ENV_VALIDATION/i, evidence: "skip-validation escape evidence was detected." },
    { signal: "empty-string-as-undefined", pattern: /emptyStringAsUndefined|empty string/i, evidence: "empty-string normalization evidence was detected." },
    { signal: "transform-default", pattern: /transform\(|default\(|coerce|preprocess|pipe\(/i, evidence: "transform/default evidence was detected." },
    { signal: "synchronous-validation", pattern: /ensureSynchronous|Validation must be synchronous|Promise/i, evidence: "synchronous validation guard evidence was detected." }
  ];
  return envValidationReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function envValidationReadinessDocumentationSignals(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["documentationSignals"] {
  const specs: Array<{ signal: EnvValidationReadinessReport["documentationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "env-example", pattern: /\.env\.example|\.env\.sample|\.env\.template/i, evidence: "env example file evidence was detected." },
    { signal: "required-vars-doc", pattern: /required environment variables|required env|environment variables.*required|DATABASE_URL|API_KEY/i, evidence: "required variable documentation evidence was detected." },
    { signal: "deployment-vars", pattern: /deploy|deployment|Vercel|Netlify|Cloudflare|Docker|Kubernetes|CI/i, evidence: "deployment variable documentation evidence was detected." },
    { signal: "build-time-validation", pattern: /build.*env|validate.*build|invalid environment variables|startup/i, evidence: "build/startup validation documentation evidence was detected." },
    { signal: "secret-warning", pattern: /secret|private|server-side|not available on the client|do not expose/i, evidence: "secret/public boundary documentation evidence was detected." }
  ];
  return envValidationReadinessSignalFromSpecs(sourceFiles, specs, "documentation", "signal");
}

function envValidationReadinessPackageSignals(sourceFiles: EnvValidationReadinessSourceFile[]): EnvValidationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: EnvValidationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@t3-oss/env-core", pattern: /@t3-oss\/env-core/i, evidence: "@t3-oss/env-core evidence was detected." },
    { signal: "@t3-oss/env-nextjs", pattern: /@t3-oss\/env-nextjs/i, evidence: "@t3-oss/env-nextjs evidence was detected." },
    { signal: "@t3-oss/env-nuxt", pattern: /@t3-oss\/env-nuxt/i, evidence: "@t3-oss/env-nuxt evidence was detected." },
    { signal: "envalid", pattern: /envalid|cleanEnv/i, evidence: "envalid evidence was detected." },
    { signal: "env-var", pattern: /env-var|asPortNumber|asString/i, evidence: "env-var evidence was detected." },
    { signal: "dotenv", pattern: /"dotenv"|dotenv\/config|dotenv\.config/i, evidence: "dotenv evidence was detected." },
    { signal: "dotenvx", pattern: /dotenvx|@dotenvx\/dotenvx/i, evidence: "dotenvx evidence was detected." },
    { signal: "zod", pattern: /"zod"|\bzod\b|z\.object/i, evidence: "Zod evidence was detected." },
    { signal: "valibot", pattern: /"valibot"|\bvalibot\b|v\.object/i, evidence: "Valibot evidence was detected." },
    { signal: "arktype", pattern: /"arktype"|\barktype\b|type\(/i, evidence: "ArkType evidence was detected." }
  ];
  return envValidationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function envValidationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: EnvValidationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/env-validation-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSecurityHeadersReadinessReport(walk: WalkResult): Promise<SecurityHeadersReadinessReport> {
  const sourceFiles = await securityHeadersReadinessSourceFiles(walk);
  const headerSetups = securityHeadersReadinessSetups(sourceFiles);
  const cspSignals = securityHeadersReadinessCspSignals(sourceFiles);
  const transportSignals = securityHeadersReadinessTransportSignals(sourceFiles);
  const crossOriginSignals = securityHeadersReadinessCrossOriginSignals(sourceFiles);
  const legacyHeaderSignals = securityHeadersReadinessLegacySignals(sourceFiles);
  const middlewareSignals = securityHeadersReadinessMiddlewareSignals(sourceFiles);
  const packageSignals = securityHeadersReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = headerSetups.some((item) => item.readiness !== "missing");
  const hasCsp = cspSignals.some((item) => item.readiness === "ready") || headerSetups.some((item) => item.cspCount > 0);
  const hasTransport = transportSignals.some((item) => item.readiness === "ready") || headerSetups.some((item) => item.hstsCount > 0);
  const hasCrossOrigin = crossOriginSignals.some((item) => item.readiness === "ready") || headerSetups.some((item) => item.crossOriginCount > 0);
  const hasLegacyHardening = legacyHeaderSignals.some((item) => item.readiness === "ready") || headerSetups.some((item) => item.frameCount + item.referrerCount + item.hardeningCount > 0);
  const hasMiddleware = middlewareSignals.some((item) => item.readiness === "ready");

  const riskQueue: SecurityHeadersReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document HTTP security header ownership before claiming web hardening readiness.",
      why: "Helmet-style readiness starts with middleware, framework headers, or reverse-proxy header configuration evidence.",
      relatedHref: "html/security-headers-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasCsp) {
    riskQueue.push({
      priority: "high",
      action: "Define a Content-Security-Policy with default-src and application-specific script/style/frame directives.",
      why: "CSP is powerful but needs app-specific directives, nonce/hash strategy, and report-only rollout evidence.",
      relatedHref: "html/security-headers-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasTransport) {
    riskQueue.push({
      priority: "medium",
      action: "Review HSTS, max-age, includeSubDomains, preload, and HTTPS redirect behavior.",
      why: "Transport security headers only protect users after HTTPS is working and can create rollback risk if preload/subdomain scope is wrong.",
      relatedHref: "html/security-headers-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && (!hasCrossOrigin || !hasLegacyHardening)) {
    riskQueue.push({
      priority: "medium",
      action: "Check cross-origin isolation/resource policy and legacy hardening headers together.",
      why: "COOP/COEP/CORP, X-Frame-Options, nosniff, Referrer-Policy, and X-Powered-By removal cover different browser attack surfaces.",
      relatedHref: "html/security-headers-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasMiddleware) {
    riskQueue.push({
      priority: "low",
      action: "Document where headers are applied: app middleware, framework config, edge worker, CDN, or reverse proxy.",
      why: "Duplicate or split ownership can silently disable headers, override CSP, or create environment drift.",
      relatedHref: "html/security-headers-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify final response headers with a real deployed or preview URL.",
    why: "RepoTutor records security header readiness only; it does not start servers, send HTTP requests, evaluate CSP, follow redirects, or inspect CDN/proxy behavior.",
    relatedHref: "html/security-headers-readiness.html"
  });

  return {
    summary: `Helmet-style security headers readiness report: setup ${headerSetups.length}개, CSP signal ${cspSignals.length}개, transport signal ${transportSignals.length}개, cross-origin signal ${crossOriginSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Helmet Content-Security-Policy Strict-Transport-Security Cross-Origin-Opener-Policy Cross-Origin-Resource-Policy X-Frame-Options Referrer-Policy X-Content-Type-Options X-Powered-By",
    headerSetups,
    cspSignals,
    transportSignals,
    crossOriginSignals,
    legacyHeaderSignals,
    middlewareSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"helmet|contentSecurityPolicy|Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|Referrer-Policy\" package.json src app server middleware next.config.* nginx.conf", purpose: "Inventory app, framework, and proxy security header ownership." },
      { command: "rg \"default-src|script-src|style-src|frame-ancestors|object-src|nonce-|sha256-|reportOnly|Report-Only\" src app server middleware config", purpose: "Review CSP directives, nonce/hash strategy, and report-only rollout." },
      { command: "rg \"max-age|includeSubDomains|preload|upgrade-insecure-requests|https redirect|force ssl\" src app server middleware config", purpose: "Check HSTS and HTTPS transport assumptions." },
      { command: "rg \"Cross-Origin-Embedder-Policy|Cross-Origin-Opener-Policy|Cross-Origin-Resource-Policy|Origin-Agent-Cluster|cors\" src app server middleware config", purpose: "Check cross-origin isolation and resource policy." },
      { command: "rg \"X-Content-Type-Options|nosniff|X-Powered-By|removeHeader|X-XSS-Protection|X-DNS-Prefetch-Control\" src app server middleware config", purpose: "Review legacy hardening and information disclosure headers." },
      { command: "curl -I <preview-url>", purpose: "Verify final response headers after CDN/proxy/app layers are composed." }
    ],
    learnerNextSteps: [
      "먼저 Helmet, Express/Fastify/Koa middleware, Next headers, nginx/CDN config 중 어디가 header owner인지 찾으세요.",
      "Content-Security-Policy의 default-src, script-src, style-src, frame-ancestors, object-src, nonce/hash, report-only 신호를 확인하세요.",
      "Strict-Transport-Security의 max-age, includeSubDomains, preload와 개발 환경의 upgrade-insecure-requests 예외를 검토하세요.",
      "COEP, COOP, CORP, Origin-Agent-Cluster가 실제 cross-origin resource 정책과 충돌하지 않는지 확인하세요.",
      "X-Frame-Options, X-Content-Type-Options nosniff, Referrer-Policy, X-Powered-By 제거, X-XSS-Protection 0 같은 legacy hardening을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 응답 header는 배포/preview URL에서 curl -I 또는 브라우저 devtools로 별도 확인하세요."
    ]
  };
}

type SecurityHeadersReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function securityHeadersReadinessSourceFiles(walk: WalkResult): Promise<SecurityHeadersReadinessSourceFile[]> {
  const files: SecurityHeadersReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !securityHeadersReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!securityHeadersReadinessPathSignal(file.relPath) && !securityHeadersReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function securityHeadersReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return securityHeadersReadinessPathSignal(filePath)
    || /^(package\.json|README\.md|helmet\.(js|mjs|cjs|ts)|security\.(js|mjs|cjs|ts)|middleware\.(js|mjs|cjs|ts)|server\.(js|mjs|cjs|ts)|next\.config\.(js|mjs|cjs|ts)|nginx\.conf|_headers|headers)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml|conf)$/i.test(filePath);
}

function securityHeadersReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(helmet|security|headers?|middleware|server|app|api|routes?|next|nginx|cloudflare|workers?|edge|proxy|config|test|tests)(\/|\.|-|_|$)/i.test(filePath);
}

function securityHeadersReadinessContentSignal(text: string): boolean {
  return /(helmet|Content-Security-Policy|contentSecurityPolicy|Strict-Transport-Security|Cross-Origin-(Embedder|Opener|Resource)-Policy|Origin-Agent-Cluster|X-Frame-Options|X-Content-Type-Options|Referrer-Policy|X-DNS-Prefetch-Control|X-Download-Options|X-Permitted-Cross-Domain-Policies|X-Powered-By|X-XSS-Protection|default-src|script-src|frame-ancestors|upgrade-insecure-requests)/i.test(text);
}

function securityHeadersReadinessSetups(sourceFiles: SecurityHeadersReadinessSourceFile[]): SecurityHeadersReadinessReport["headerSetups"] {
  const rows: SecurityHeadersReadinessReport["headerSetups"] = [];
  for (const source of sourceFiles) {
    const cspCount = countMatches(source.text, /Content-Security-Policy|contentSecurityPolicy|default-src|script-src|style-src|frame-ancestors|object-src|reportOnly|Report-Only/gi);
    const hstsCount = countMatches(source.text, /Strict-Transport-Security|strictTransportSecurity|hsts|max-age|includeSubDomains|preload/gi);
    const crossOriginCount = countMatches(source.text, /Cross-Origin-(Embedder|Opener|Resource)-Policy|crossOrigin(Embedder|Opener|Resource)Policy|Origin-Agent-Cluster|cors/gi);
    const frameCount = countMatches(source.text, /X-Frame-Options|xFrameOptions|frameguard|frame-ancestors|DENY|SAMEORIGIN/gi);
    const referrerCount = countMatches(source.text, /Referrer-Policy|referrerPolicy|no-referrer|same-origin|strict-origin/gi);
    const hardeningCount = countMatches(source.text, /X-Content-Type-Options|nosniff|X-DNS-Prefetch-Control|X-Download-Options|X-Permitted-Cross-Domain-Policies|X-Powered-By|X-XSS-Protection|removeHeader/gi);
    const disableCount = countMatches(source.text, /false|null|dangerouslyDisableDefaultSrc|disable|disabled|reportOnly|development|isDevelopment/gi);
    const hasSetupSignal = cspCount + hstsCount + crossOriginCount + frameCount + referrerCount + hardeningCount + disableCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: securityHeadersReadinessProvider(source),
      cspCount,
      hstsCount,
      crossOriginCount,
      frameCount,
      referrerCount,
      hardeningCount,
      disableCount,
      readiness: cspCount > 0 && (hstsCount > 0 || hardeningCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains CSP ${cspCount}, HSTS ${hstsCount}, cross-origin ${crossOriginCount}, frame ${frameCount}, referrer ${referrerCount}, hardening ${hardeningCount}, disable/report ${disableCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function securityHeadersReadinessProvider(source: SecurityHeadersReadinessSourceFile): SecurityHeadersReadinessReport["headerSetups"][number]["provider"] {
  if (/helmet|contentSecurityPolicy|strictTransportSecurity/i.test(source.text)) return "helmet";
  if (/express|app\.use|res\.setHeader|removeHeader/i.test(source.text)) return "express";
  if (/next\.config|headers\(\)|NextResponse|middleware/i.test(source.text) || /next\.config/i.test(source.filePath)) return "next-headers";
  if (/nginx|add_header|proxy_set_header/i.test(source.text) || /nginx/i.test(source.filePath)) return "nginx";
  if (/cloudflare|workers?|_headers/i.test(source.text) || /(^|\/)_headers$/i.test(source.filePath)) return "cloudflare";
  if (/Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|setHeader/i.test(source.text)) return "custom";
  return "unknown";
}

function securityHeadersReadinessCspSignals(sourceFiles: SecurityHeadersReadinessSourceFile[]): SecurityHeadersReadinessReport["cspSignals"] {
  const specs: Array<{ signal: SecurityHeadersReadinessReport["cspSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "content-security-policy", pattern: /Content-Security-Policy|contentSecurityPolicy/i, evidence: "Content-Security-Policy evidence was detected." },
    { signal: "default-src", pattern: /default-src|defaultSrc/i, evidence: "default-src evidence was detected." },
    { signal: "script-src", pattern: /script-src|scriptSrc|nonce-|sha(256|384|512)-|strict-dynamic/i, evidence: "script-src/nonce/hash evidence was detected." },
    { signal: "style-src", pattern: /style-src|styleSrc|unsafe-inline/i, evidence: "style-src evidence was detected." },
    { signal: "frame-ancestors", pattern: /frame-ancestors|frameAncestors/i, evidence: "frame-ancestors evidence was detected." },
    { signal: "object-src", pattern: /object-src|objectSrc/i, evidence: "object-src evidence was detected." },
    { signal: "nonce", pattern: /nonce-|cspNonce|randomBytes|sha(256|384|512)-/i, evidence: "nonce/hash source evidence was detected." },
    { signal: "report-only", pattern: /Content-Security-Policy-Report-Only|reportOnly|report-uri|report-to/i, evidence: "CSP report-only/reporting evidence was detected." },
    { signal: "upgrade-insecure-requests", pattern: /upgrade-insecure-requests|upgradeInsecureRequests/i, evidence: "upgrade-insecure-requests evidence was detected." }
  ];
  return securityHeadersReadinessSignalFromSpecs(sourceFiles, specs, "csp", "signal");
}

function securityHeadersReadinessTransportSignals(sourceFiles: SecurityHeadersReadinessSourceFile[]): SecurityHeadersReadinessReport["transportSignals"] {
  const specs: Array<{ signal: SecurityHeadersReadinessReport["transportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "strict-transport-security", pattern: /Strict-Transport-Security|strictTransportSecurity|hsts/i, evidence: "HSTS evidence was detected." },
    { signal: "max-age", pattern: /max-age|maxAge/i, evidence: "HSTS max-age evidence was detected." },
    { signal: "include-subdomains", pattern: /includeSubDomains|includeSubdomains|include-subdomains/i, evidence: "includeSubDomains evidence was detected." },
    { signal: "preload", pattern: /\bpreload\b/i, evidence: "HSTS preload evidence was detected." },
    { signal: "https-redirect", pattern: /https redirect|force ssl|enforce ssl|redirect.*https|upgrade-insecure-requests/i, evidence: "HTTPS redirect/upgrade evidence was detected." },
    { signal: "development-exception", pattern: /development|isDevelopment|NODE_ENV|localhost|upgrade-insecure-requests.*null/i, evidence: "development exception evidence was detected." }
  ];
  return securityHeadersReadinessSignalFromSpecs(sourceFiles, specs, "transport", "signal");
}

function securityHeadersReadinessCrossOriginSignals(sourceFiles: SecurityHeadersReadinessSourceFile[]): SecurityHeadersReadinessReport["crossOriginSignals"] {
  const specs: Array<{ signal: SecurityHeadersReadinessReport["crossOriginSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cross-origin-embedder-policy", pattern: /Cross-Origin-Embedder-Policy|crossOriginEmbedderPolicy|require-corp|credentialless/i, evidence: "COEP evidence was detected." },
    { signal: "cross-origin-opener-policy", pattern: /Cross-Origin-Opener-Policy|crossOriginOpenerPolicy|same-origin-allow-popups/i, evidence: "COOP evidence was detected." },
    { signal: "cross-origin-resource-policy", pattern: /Cross-Origin-Resource-Policy|crossOriginResourcePolicy|same-site|same-origin/i, evidence: "CORP evidence was detected." },
    { signal: "origin-agent-cluster", pattern: /Origin-Agent-Cluster|originAgentCluster/i, evidence: "Origin-Agent-Cluster evidence was detected." },
    { signal: "cors-boundary", pattern: /\bcors\b|Access-Control-Allow-Origin|allowedOrigins?|credentials/i, evidence: "CORS boundary evidence was detected." }
  ];
  return securityHeadersReadinessSignalFromSpecs(sourceFiles, specs, "cross-origin", "signal");
}

function securityHeadersReadinessLegacySignals(sourceFiles: SecurityHeadersReadinessSourceFile[]): SecurityHeadersReadinessReport["legacyHeaderSignals"] {
  const specs: Array<{ signal: SecurityHeadersReadinessReport["legacyHeaderSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "x-frame-options", pattern: /X-Frame-Options|xFrameOptions|frameguard|SAMEORIGIN|DENY/i, evidence: "X-Frame-Options evidence was detected." },
    { signal: "x-content-type-options", pattern: /X-Content-Type-Options|xContentTypeOptions|noSniff|nosniff/i, evidence: "X-Content-Type-Options evidence was detected." },
    { signal: "referrer-policy", pattern: /Referrer-Policy|referrerPolicy|no-referrer|strict-origin/i, evidence: "Referrer-Policy evidence was detected." },
    { signal: "x-dns-prefetch-control", pattern: /X-DNS-Prefetch-Control|xDnsPrefetchControl|dnsPrefetchControl/i, evidence: "X-DNS-Prefetch-Control evidence was detected." },
    { signal: "x-download-options", pattern: /X-Download-Options|xDownloadOptions|ieNoOpen|noopen/i, evidence: "X-Download-Options evidence was detected." },
    { signal: "x-permitted-cross-domain-policies", pattern: /X-Permitted-Cross-Domain-Policies|xPermittedCrossDomainPolicies|permittedCrossDomainPolicies/i, evidence: "X-Permitted-Cross-Domain-Policies evidence was detected." },
    { signal: "x-powered-by", pattern: /X-Powered-By|xPoweredBy|hidePoweredBy|removeHeader/i, evidence: "X-Powered-By removal evidence was detected." },
    { signal: "x-xss-protection", pattern: /X-XSS-Protection|xXssProtection|xssFilter/i, evidence: "X-XSS-Protection evidence was detected." }
  ];
  return securityHeadersReadinessSignalFromSpecs(sourceFiles, specs, "legacy", "signal");
}

function securityHeadersReadinessMiddlewareSignals(sourceFiles: SecurityHeadersReadinessSourceFile[]): SecurityHeadersReadinessReport["middlewareSignals"] {
  const specs: Array<{ signal: SecurityHeadersReadinessReport["middlewareSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "helmet", pattern: /helmet\(|from ["']helmet["']|require\(["']helmet["']\)/i, evidence: "Helmet middleware evidence was detected." },
    { signal: "app-use", pattern: /app\.use|server\.use|fastify\.register|router\.use/i, evidence: "middleware registration evidence was detected." },
    { signal: "disable-header", pattern: /contentSecurityPolicy:\s*false|xFrameOptions:\s*false|strictTransportSecurity:\s*false|false|null|disable/i, evidence: "header disable/override evidence was detected." },
    { signal: "standalone-middleware", pattern: /helmet\.(contentSecurityPolicy|strictTransportSecurity|xFrameOptions|referrerPolicy)|contentSecurityPolicy\(/i, evidence: "standalone header middleware evidence was detected." },
    { signal: "next-headers", pattern: /headers\(\)|NextResponse|next\.config|middleware\.(ts|js)/i, evidence: "Next/framework header config evidence was detected." },
    { signal: "reverse-proxy-headers", pattern: /add_header|proxy_set_header|_headers|cloudflare|nginx/i, evidence: "reverse proxy/CDN header evidence was detected." }
  ];
  return securityHeadersReadinessSignalFromSpecs(sourceFiles, specs, "middleware", "signal");
}

function securityHeadersReadinessPackageSignals(sourceFiles: SecurityHeadersReadinessSourceFile[]): SecurityHeadersReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SecurityHeadersReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "helmet", pattern: /"helmet"|from ["']helmet["']|helmet\(/i, evidence: "Helmet package evidence was detected." },
    { signal: "express", pattern: /"express"|from ["']express["']|express\(/i, evidence: "Express evidence was detected." },
    { signal: "fastify-helmet", pattern: /fastify-helmet|@fastify\/helmet/i, evidence: "Fastify Helmet evidence was detected." },
    { signal: "koa-helmet", pattern: /koa-helmet/i, evidence: "Koa Helmet evidence was detected." },
    { signal: "next", pattern: /"next"|next\.config|NextResponse/i, evidence: "Next.js header config evidence was detected." },
    { signal: "csp-evaluator", pattern: /csp-evaluator|CSP Evaluator/i, evidence: "CSP evaluator evidence was detected." }
  ];
  return securityHeadersReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function securityHeadersReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SecurityHeadersReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/security-headers-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildGraphqlReadinessReport(walk: WalkResult): Promise<GraphqlReadinessReport> {
  const sourceFiles = await graphqlReadinessSourceFiles(walk);
  const graphqlSetups = graphqlReadinessSetups(sourceFiles);
  const schemaSignals = graphqlReadinessSchemaSignals(sourceFiles);
  const operationSignals = graphqlReadinessOperationSignals(sourceFiles);
  const resolverSignals = graphqlReadinessResolverSignals(sourceFiles);
  const validationSignals = graphqlReadinessValidationSignals(sourceFiles);
  const documentSignals = graphqlReadinessDocumentSignals(sourceFiles);
  const executionSignals = graphqlReadinessExecutionSignals(sourceFiles);
  const clientSignals = graphqlReadinessClientSignals(sourceFiles);
  const codegenSignals = graphqlReadinessCodegenSignals(sourceFiles);

  const hasSchema = schemaSignals.some((item) => item.readiness === "ready") || graphqlSetups.some((item) => item.schemaCount > 0);
  const hasOperation = operationSignals.some((item) => item.readiness === "ready") || graphqlSetups.some((item) => item.operationCount > 0);
  const hasResolver = resolverSignals.some((item) => item.readiness === "ready") || graphqlSetups.some((item) => item.resolverCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || graphqlSetups.some((item) => item.validationCount > 0);
  const hasDocumentUtility = documentSignals.some((item) => item.readiness === "ready");
  const hasExecution = executionSignals.some((item) => item.readiness === "ready") || graphqlSetups.some((item) => item.executionCount > 0);
  const hasClient = clientSignals.some((item) => item.readiness === "ready") || graphqlSetups.some((item) => item.clientCount > 0);
  const hasCodegen = codegenSignals.some((item) => item.readiness === "ready") || graphqlSetups.some((item) => item.codegenCount > 0);

  const riskQueue: GraphqlReadinessReport["riskQueue"] = [];
  if (!hasSchema && !hasOperation && !hasClient) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the GraphQL schema, operations, or client boundary before claiming GraphQL readiness.",
      why: "GraphQL.js-style readiness starts with a type schema, SDL, operation documents, or a client/codegen surface learners can trace.",
      relatedHref: "html/graphql-readiness.html"
    });
  }
  if ((hasOperation || hasClient || hasResolver) && !hasSchema) {
    riskQueue.push({
      priority: "high",
      action: "Expose the GraphQLSchema, SDL, schema.graphql, or generated introspection artifact used by operations.",
      why: "GraphQL operations and resolvers need a schema contract for parsing, validation, execution, and learner rebuild guidance.",
      relatedHref: "html/graphql-readiness.html"
    });
  }
  if (hasSchema && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Document parse/validate rules, custom rules, maxErrors, and introspection-depth policy.",
      why: "GraphQL.js validates syntactic and semantic correctness before execution; missing validation evidence hides request-safety assumptions.",
      relatedHref: "html/graphql-readiness.html"
    });
  }
  if (hasSchema && !hasResolver && !hasClient) {
    riskQueue.push({
      priority: "medium",
      action: "Trace resolver, rootValue/contextValue, or client operation ownership next to the schema.",
      why: "A schema alone does not show where data is resolved, authorized, cached, or requested by the UI.",
      relatedHref: "html/graphql-readiness.html"
    });
  }
  if ((hasSchema || hasOperation) && !hasExecution && !hasClient) {
    riskQueue.push({
      priority: "low",
      action: "Record the execution or transport layer that runs queries, mutations, and subscriptions.",
      why: "Learners need to connect GraphQL documents to graphql(), execute(), subscribe(), HTTP handlers, or client transports.",
      relatedHref: "html/graphql-readiness.html"
    });
  }
  if ((hasOperation || hasValidation || hasCodegen) && !hasDocumentUtility) {
    riskQueue.push({
      priority: "low",
      action: "Document GraphQL AST visitor, TypeInfo, operation separation, or schema utility boundaries.",
      why: "GraphQL.js exposes document-analysis utilities between parse/validate and execute; without them learners miss how operations are inspected, transformed, printed, or split.",
      relatedHref: "html/graphql-readiness.html"
    });
  }
  if ((hasSchema || hasOperation || hasClient) && !hasCodegen) {
    riskQueue.push({
      priority: "low",
      action: "Consider generated types or TypedDocumentNode evidence for TypeScript projects.",
      why: "Codegen and schema introspection artifacts make operation variables/results easier to rebuild safely.",
      relatedHref: "html/graphql-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify GraphQL behavior with trusted local tests or a reviewed endpoint outside RepoTutor.",
    why: "RepoTutor records GraphQL readiness only; it does not execute operations, start servers, introspect remote schemas, validate authorization, or benchmark resolver performance.",
    relatedHref: "html/graphql-readiness.html"
  });

  return {
    summary: `GraphQL.js-style GraphQL readiness report: setup ${graphqlSetups.length}개, schema signal ${schemaSignals.length}개, operation signal ${operationSignals.length}개, validation signal ${validationSignals.length}개, document utility signal ${documentSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "GraphQL.js GraphQLSchema GraphQLObjectType buildSchema parse validate visit TypeInfo visitWithTypeInfo separateOperations concatAST stripIgnoredCharacters extendSchema lexicographicSortSchema typeFromAST valueFromAST coerceInputValue execute subscribe introspection typed documents resolvers",
    graphqlSetups,
    schemaSignals,
    operationSignals,
    resolverSignals,
    validationSignals,
    documentSignals,
    executionSignals,
    clientSignals,
    codegenSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"GraphQLSchema|buildSchema|typeDefs|schema.graphql|\\\\.graphql\" package.json src app server packages", purpose: "Inventory schema construction, SDL files, and GraphQL package ownership." },
      { command: "rg \"query |mutation |subscription |gql`|graphql\\\\(|execute\\\\(|subscribe\\\\(\" src app server packages", purpose: "Find GraphQL operation documents and execution entry points." },
      { command: "rg \"resolve\\\\(|fieldResolver|typeResolver|rootValue|contextValue|DataLoader|GraphQLError\" src app server packages", purpose: "Trace resolver ownership, context boundaries, batching, and error handling." },
      { command: "rg \"validate\\\\(|specifiedRules|NoSchemaIntrospection|MaxIntrospectionDepth|maxErrors|depthLimit|cost\" src app server packages", purpose: "Review operation validation and introspection/depth safety policy." },
      { command: "rg \"visitWithTypeInfo|TypeInfo|visit\\\\(|separateOperations|concatAST|stripIgnoredCharacters|extendSchema|typeFromAST|valueFromAST|coerceInputValue\" src app server packages", purpose: "Map GraphQL document analysis, AST transforms, operation splitting, schema extension, and input coercion utilities." },
      { command: "rg \"graphql-codegen|TypedDocumentNode|introspectionFromSchema|buildClientSchema|printSchema\" package.json codegen.* src app packages", purpose: "Check generated types, client schema, and schema artifact workflows." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover schema, resolver, client, and operation behavior." }
    ],
    learnerNextSteps: [
      "먼저 GraphQLSchema, buildSchema, typeDefs, schema.graphql 중 schema contract가 어디 있는지 찾으세요.",
      "query, mutation, subscription 문서와 operationName, variables, fragments를 함께 읽어 API 사용 흐름을 파악하세요.",
      "resolve, fieldResolver, typeResolver, rootValue, contextValue, DataLoader, GraphQLError 신호로 데이터 해결과 에러 경계를 확인하세요.",
      "parse/validate/specifiedRules/custom rules/maxErrors/introspection depth 정책이 실행 전에 연결되는지 확인하세요.",
      "visitWithTypeInfo, TypeInfo, separateOperations, concatAST, stripIgnoredCharacters, extendSchema 같은 문서 유틸리티가 있으면 AST 분석/변환 단계와 실행 단계를 분리해서 읽으세요.",
      "Apollo, urql, Relay, graphql-request, graphql-codegen, TypedDocumentNode가 있으면 client cache와 generated type 흐름을 같이 보세요.",
      "이 리포트는 정적 readiness입니다. 실제 GraphQL operation, auth, resolver 성능은 원본 프로젝트 테스트나 리뷰된 endpoint에서 별도 확인하세요."
    ]
  };
}

type GraphqlReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function graphqlReadinessSourceFiles(walk: WalkResult): Promise<GraphqlReadinessSourceFile[]> {
  const files: GraphqlReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !graphqlReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!graphqlReadinessPathSignal(file.relPath) && !graphqlReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function graphqlReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return graphqlReadinessPathSignal(filePath)
    || /^(package\.json|codegen\.(json|ya?ml|js|mjs|cjs|ts)|graphql\.config\.(json|ya?ml|js|mjs|cjs|ts)|apollo\.config\.(js|mjs|cjs|ts)|schema\.graphql|schema\.gql)$/i.test(base)
    || /\.(graphql|gql|js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml)$/i.test(filePath);
}

function graphqlReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(graphql|gql|schema|schemas|resolver|resolvers|operations?|queries|mutations|subscriptions|apollo|urql|relay|codegen|generated|api|server|client)(\/|\.|-|_|$)|\.graphql$|\.gql$/i.test(filePath);
}

function graphqlReadinessContentSignal(text: string): boolean {
  return /\b(GraphQLSchema|GraphQLObjectType|GraphQLInputObjectType|GraphQLScalarType|GraphQLEnumType|GraphQLUnionType|GraphQLInterfaceType|buildSchema|buildASTSchema|buildClientSchema|introspectionFromSchema|printSchema|parse\s*\(|validate\s*\(|specifiedRules|MaxIntrospectionDepth|NoSchemaIntrospection|visitWithTypeInfo|TypeInfo|separateOperations|concatAST|stripIgnoredCharacters|extendSchema|lexicographicSortSchema|typeFromAST|valueFromAST|coerceInputValue|schemaCoordinate|resolveSchemaCoordinate|graphql\s*\(|graphqlSync\s*\(|execute\s*\(|subscribe\s*\(|fieldResolver|typeResolver|rootValue|contextValue|DataLoader|GraphQLError|TypedDocumentNode|graphql-codegen|GraphQLClient|ApolloClient|urql|RelayEnvironment)\b|(^|\s)(query|mutation|subscription)\s+[A-Za-z_{]/im.test(text);
}

function graphqlReadinessSetups(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["graphqlSetups"] {
  const rows: GraphqlReadinessReport["graphqlSetups"] = [];
  for (const source of sourceFiles) {
    const schemaCount = countMatches(source.text, /GraphQLSchema|GraphQLObjectType|GraphQLInputObjectType|GraphQLScalarType|GraphQLEnumType|GraphQLUnionType|GraphQLInterfaceType|buildSchema|buildASTSchema|typeDefs|schema\.graphql|type\s+Query|type\s+Mutation|type\s+Subscription/gi);
    const operationCount = countMatches(source.text, /(^|\s)(query|mutation|subscription)\s+[A-Za-z_{]|\bgql\s*`|\bgraphql\s*\(/gim);
    const resolverCount = countMatches(source.text, /\b(resolve\s*\(|resolve\s*:|fieldResolver|typeResolver|rootValue|contextValue|DataLoader|GraphQLError)\b/gi);
    const validationCount = countMatches(source.text, /\b(parse\s*\(|validate\s*\(|specifiedRules|recommendedRules|customRules|ValidationRule|maxErrors|MaxIntrospectionDepth|NoSchemaIntrospection|assertValidSchema|validateSchema)\b/gi);
    const executionCount = countMatches(source.text, /\b(graphql\s*\(|graphqlSync\s*\(|execute\s*\(|subscribe\s*\(|experimentalExecuteIncrementally|getOperationAST|variableValues)\b/gi);
    const clientCount = countMatches(source.text, /\b(ApolloClient|InMemoryCache|urql|createClient|RelayEnvironment|graphql-request|GraphQLClient|fetchExchange|cacheExchange|useQuery|useMutation|useSubscription)\b/gi);
    const codegenCount = countMatches(source.text, /\b(graphql-codegen|TypedDocumentNode|CodegenConfig|generated-types|introspectionFromSchema|buildClientSchema|printSchema)\b/gi);
    const hasSetupSignal = schemaCount + operationCount + resolverCount + validationCount + executionCount + clientCount + codegenCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: graphqlReadinessProvider(source),
      schemaCount,
      operationCount,
      resolverCount,
      validationCount,
      executionCount,
      clientCount,
      codegenCount,
      readiness: schemaCount > 0 && (operationCount > 0 || resolverCount > 0 || executionCount > 0 || clientCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains schema ${schemaCount}, operations ${operationCount}, resolvers ${resolverCount}, validation ${validationCount}, execution ${executionCount}, client ${clientCount}, codegen ${codegenCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function graphqlReadinessProvider(source: GraphqlReadinessSourceFile): GraphqlReadinessReport["graphqlSetups"][number]["provider"] {
  if (/\b(graphql-js|GraphQLSchema|GraphQLObjectType|buildSchema|buildASTSchema|graphql\s*\(|execute\s*\(|subscribe\s*\()\b/i.test(source.text)) return "graphql-js";
  if (/apollo-server|@apollo\/server|ApolloClient|InMemoryCache|gql\s*`/i.test(source.text)) return "apollo";
  if (/graphql-yoga|createYoga/i.test(source.text)) return "graphql-yoga";
  if (/\burql\b|createClient|fetchExchange|cacheExchange/i.test(source.text)) return "urql";
  if (/relay-runtime|RelayEnvironment|graphql\s*`/i.test(source.text)) return "relay";
  if (/graphql-codegen|CodegenConfig|TypedDocumentNode/i.test(source.text) || /codegen\./i.test(source.filePath)) return "graphql-codegen";
  if (/graphql-request|GraphQLClient/i.test(source.text)) return "graphql-request";
  if (/type\s+Query|schema\.graphql|\.graphql$/i.test(source.text) || /\.graphql$|\.gql$/i.test(source.filePath)) return "custom";
  return "unknown";
}

function graphqlReadinessSchemaSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["schemaSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["schemaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "graphql-schema", pattern: /GraphQLSchema|new\s+GraphQLSchema|schema\.graphql/i, evidence: "GraphQLSchema evidence was detected." },
    { signal: "build-schema", pattern: /\bbuildSchema\s*\(|\bbuildASTSchema\s*\(/i, evidence: "buildSchema/buildASTSchema evidence was detected." },
    { signal: "sdl", pattern: /(^|\n)\s*(type|interface|union|enum|input|scalar|directive)\s+[A-Za-z_][\w]*/i, evidence: "GraphQL SDL evidence was detected." },
    { signal: "object-type", pattern: /GraphQLObjectType|type\s+Query|type\s+Mutation|type\s+Subscription/i, evidence: "object/root type evidence was detected." },
    { signal: "input-type", pattern: /GraphQLInputObjectType|input\s+[A-Za-z_][\w]*/i, evidence: "input type evidence was detected." },
    { signal: "scalar-type", pattern: /GraphQLScalarType|scalar\s+[A-Za-z_][\w]*/i, evidence: "custom scalar evidence was detected." },
    { signal: "enum-type", pattern: /GraphQLEnumType|enum\s+[A-Za-z_][\w]*/i, evidence: "enum type evidence was detected." },
    { signal: "directive", pattern: /GraphQLDirective|directive\s+@[A-Za-z_][\w]*|@[A-Za-z_][\w]*/i, evidence: "directive evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "schema", "signal");
}

function graphqlReadinessOperationSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["operationSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["operationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "query", pattern: /(^|\s)query\s+[A-Za-z_{]/im, evidence: "query operation evidence was detected." },
    { signal: "mutation", pattern: /(^|\s)mutation\s+[A-Za-z_{]/im, evidence: "mutation operation evidence was detected." },
    { signal: "subscription", pattern: /(^|\s)subscription\s+[A-Za-z_{]|type\s+Subscription|subscribe\s*\(/im, evidence: "subscription evidence was detected." },
    { signal: "operation-name", pattern: /(query|mutation|subscription)\s+[A-Za-z_][\w]*|\boperationName\b/i, evidence: "operation name evidence was detected." },
    { signal: "variables", pattern: /\$[A-Za-z_][\w]*\s*:|\bvariableValues\b|\bvariables\s*:/i, evidence: "operation variables evidence was detected." },
    { signal: "fragments", pattern: /\bfragment\s+[A-Za-z_][\w]*\s+on\b|\.\.\.[A-Za-z_][\w]*/i, evidence: "fragment evidence was detected." },
    { signal: "typed-document-node", pattern: /TypedDocumentNode|DocumentNode<|TypedQueryDocumentNode/i, evidence: "typed document node evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "operation", "signal");
}

function graphqlReadinessResolverSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["resolverSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["resolverSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "resolve", pattern: /\bresolve\s*[:(]/i, evidence: "resolver function evidence was detected." },
    { signal: "field-resolver", pattern: /\bfieldResolver\b|defaultFieldResolver/i, evidence: "field resolver evidence was detected." },
    { signal: "type-resolver", pattern: /\btypeResolver\b|resolveType|isTypeOf/i, evidence: "type resolver evidence was detected." },
    { signal: "root-value", pattern: /\brootValue\b|\broot\s*:/i, evidence: "rootValue evidence was detected." },
    { signal: "context-value", pattern: /\bcontextValue\b|\bcontext\s*:/i, evidence: "contextValue evidence was detected." },
    { signal: "dataloader", pattern: /DataLoader|\bloadMany\s*\(|\bload\s*\(/i, evidence: "DataLoader/batching evidence was detected." },
    { signal: "error-handling", pattern: /GraphQLError|locatedError|formatError|extensions\s*:/i, evidence: "GraphQL error handling evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "resolver", "signal");
}

function graphqlReadinessValidationSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["validationSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "parse", pattern: /\bparse\s*\(|Source\(/i, evidence: "parse evidence was detected." },
    { signal: "validate", pattern: /\bvalidate\s*\(/i, evidence: "validate evidence was detected." },
    { signal: "specified-rules", pattern: /specifiedRules|recommendedRules|ValidationRule/i, evidence: "specified/recommended validation rules evidence was detected." },
    { signal: "custom-rules", pattern: /customRules|NoSchemaIntrospectionCustomRule|depthLimit|costAnalysis|validationRules\s*:/i, evidence: "custom validation rule evidence was detected." },
    { signal: "max-errors", pattern: /maxErrors|too many validation errors/i, evidence: "maxErrors validation guard evidence was detected." },
    { signal: "introspection-limit", pattern: /MaxIntrospectionDepth|NoSchemaIntrospection|__schema|__type/i, evidence: "introspection policy evidence was detected." },
    { signal: "schema-validation", pattern: /assertValidSchema|validateSchema|assertValidSDL|assumeValid/i, evidence: "schema validation evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function graphqlReadinessDocumentSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["documentSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["documentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "source-object", pattern: /\bnew\s+Source\s*\(|\bSource\s*\(/i, evidence: "GraphQL Source object evidence was detected." },
    { signal: "lexer-token-kind", pattern: /\blex\s*\(|\bLexer\b|\bTokenKind\b/i, evidence: "lexer or token kind evidence was detected." },
    { signal: "ast-kind", pattern: /\bKind\.[A-Z_]+|\bkind\s*:\s*Kind\./i, evidence: "GraphQL AST Kind evidence was detected." },
    { signal: "visit", pattern: /\bvisit\s*\(/i, evidence: "GraphQL AST visitor evidence was detected." },
    { signal: "type-info", pattern: /\bnew\s+TypeInfo\b|\bTypeInfo\b/i, evidence: "TypeInfo evidence was detected." },
    { signal: "visit-with-type-info", pattern: /\bvisitWithTypeInfo\s*\(/i, evidence: "visitWithTypeInfo evidence was detected." },
    { signal: "separate-operations", pattern: /\bseparateOperations\s*\(/i, evidence: "separateOperations evidence was detected." },
    { signal: "concat-ast", pattern: /\bconcatAST\s*\(/i, evidence: "concatAST evidence was detected." },
    { signal: "strip-ignored-characters", pattern: /\bstripIgnoredCharacters\s*\(/i, evidence: "stripIgnoredCharacters evidence was detected." },
    { signal: "extend-schema", pattern: /\bextendSchema\s*\(/i, evidence: "extendSchema evidence was detected." },
    { signal: "lexicographic-sort-schema", pattern: /\blexicographicSortSchema\s*\(/i, evidence: "lexicographicSortSchema evidence was detected." },
    { signal: "type-from-ast", pattern: /\btypeFromAST\s*\(/i, evidence: "typeFromAST evidence was detected." },
    { signal: "value-from-ast", pattern: /\bvalueFromAST(?:Untyped)?\s*\(/i, evidence: "valueFromAST evidence was detected." },
    { signal: "coerce-input-value", pattern: /\bcoerceInputValue\s*\(/i, evidence: "coerceInputValue evidence was detected." },
    { signal: "schema-coordinate", pattern: /\bresolveSchemaCoordinate\b|\bschemaCoordinate\b|TypeCoordinate|MemberCoordinate|DirectiveCoordinate/i, evidence: "schema coordinate evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "document", "signal");
}

function graphqlReadinessExecutionSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["executionSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["executionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "graphql", pattern: /\bgraphql\s*\(/i, evidence: "graphql() execution evidence was detected." },
    { signal: "graphql-sync", pattern: /\bgraphqlSync\s*\(/i, evidence: "graphqlSync evidence was detected." },
    { signal: "execute", pattern: /\bexecute\s*\(|executeImpl|executeSync/i, evidence: "execute evidence was detected." },
    { signal: "subscribe", pattern: /\bsubscribe\s*\(|createSourceEventStream|AsyncIterable/i, evidence: "subscription execution evidence was detected." },
    { signal: "defer-stream", pattern: /experimentalExecuteIncrementally|@defer|@stream|defer-stream/i, evidence: "incremental defer/stream evidence was detected." },
    { signal: "operation-ast", pattern: /getOperationAST|OperationDefinitionNode|operationName/i, evidence: "operation AST selection evidence was detected." },
    { signal: "variable-values", pattern: /variableValues|getVariableValues|rawVariableValues/i, evidence: "variable coercion evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "execution", "signal");
}

function graphqlReadinessClientSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["clientSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["clientSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "graphql-client", pattern: /GraphQLClient|graphql-request|\bfetch\s*\([^)]*graphql/i, evidence: "generic GraphQL client evidence was detected." },
    { signal: "urql", pattern: /\burql\b|createClient|Provider.*urql/i, evidence: "urql client evidence was detected." },
    { signal: "apollo-client", pattern: /ApolloClient|InMemoryCache|useQuery|useMutation|useSubscription/i, evidence: "Apollo Client evidence was detected." },
    { signal: "relay", pattern: /RelayEnvironment|relay-runtime|useFragment|useLazyLoadQuery/i, evidence: "Relay evidence was detected." },
    { signal: "graphql-request", pattern: /graphql-request|GraphQLClient/i, evidence: "graphql-request evidence was detected." },
    { signal: "cache", pattern: /InMemoryCache|cacheExchange|normalizedCache|cachePolicy/i, evidence: "client cache evidence was detected." },
    { signal: "fetch-exchange", pattern: /fetchExchange|httpLink|createHttpLink|GraphQLWsLink/i, evidence: "client transport/link evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "client", "signal");
}

function graphqlReadinessCodegenSignals(sourceFiles: GraphqlReadinessSourceFile[]): GraphqlReadinessReport["codegenSignals"] {
  const specs: Array<{ signal: GraphqlReadinessReport["codegenSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "graphql-codegen", pattern: /graphql-codegen|@graphql-codegen|CodegenConfig/i, evidence: "GraphQL Code Generator evidence was detected." },
    { signal: "typed-query-document-node", pattern: /TypedDocumentNode|TypedQueryDocumentNode|typed-document-node/i, evidence: "TypedDocumentNode evidence was detected." },
    { signal: "generated-types", pattern: /generated\/graphql|__generated__|\.generated\.|generated-types|ResolversTypes|Scalars\[/i, evidence: "generated GraphQL type evidence was detected." },
    { signal: "schema-introspection", pattern: /introspectionFromSchema|buildClientSchema|getIntrospectionQuery|introspection\.json/i, evidence: "schema introspection artifact evidence was detected." },
    { signal: "print-schema", pattern: /printSchema|printIntrospectionSchema|schema\.graphql/i, evidence: "printSchema/schema artifact evidence was detected." }
  ];
  return graphqlReadinessSignalFromSpecs(sourceFiles, specs, "codegen", "signal");
}

function graphqlReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: GraphqlReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/graphql-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildCliReadinessReport(walk: WalkResult): Promise<CliReadinessReport> {
  const sourceFiles = await cliReadinessSourceFiles(walk);
  const cliSetups = cliReadinessSetups(sourceFiles);
  const commandSignals = cliReadinessCommandSignals(sourceFiles);
  const optionSignals = cliReadinessOptionSignals(sourceFiles);
  const parseSignals = cliReadinessParseSignals(sourceFiles);
  const actionSignals = cliReadinessActionSignals(sourceFiles);
  const helpSignals = cliReadinessHelpSignals(sourceFiles);
  const errorSignals = cliReadinessErrorSignals(sourceFiles);
  const packageSignals = cliReadinessPackageSignals(sourceFiles);

  const hasCommand = commandSignals.some((item) => item.readiness === "ready") || cliSetups.some((item) => item.commandCount > 0);
  const hasOption = optionSignals.some((item) => item.readiness === "ready") || cliSetups.some((item) => item.optionCount > 0);
  const hasArgument = commandSignals.some((item) => item.signal === "argument" && item.readiness === "ready") || cliSetups.some((item) => item.argumentCount > 0);
  const hasParse = parseSignals.some((item) => item.readiness === "ready") || cliSetups.some((item) => item.parseCount > 0);
  const hasAction = actionSignals.some((item) => item.readiness === "ready") || cliSetups.some((item) => item.actionCount > 0);
  const hasHelp = helpSignals.some((item) => item.readiness === "ready") || cliSetups.some((item) => item.helpCount > 0);
  const hasError = errorSignals.some((item) => item.readiness === "ready") || cliSetups.some((item) => item.errorCount > 0);

  const riskQueue: CliReadinessReport["riskQueue"] = [];
  if (!hasCommand && !hasOption && !hasParse) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the CLI command entry, option parser, or package.json bin surface before claiming CLI readiness.",
      why: "Commander.js-style readiness starts with a command object, declared arguments/options, and a parse boundary learners can trace.",
      relatedHref: "html/cli-readiness.html"
    });
  }
  if ((hasCommand || hasOption || hasAction) && !hasParse) {
    riskQueue.push({
      priority: "high",
      action: "Trace the parse(), parseAsync(), argv, or executable handoff that actually enters the CLI.",
      why: "Command, option, and action declarations are incomplete unless users can see how argv reaches the parser.",
      relatedHref: "html/cli-readiness.html"
    });
  }
  if (hasCommand && !hasAction) {
    riskQueue.push({
      priority: "medium",
      action: "Connect each user-facing command to an action handler, executable subcommand, or documented dispatch path.",
      why: "Learners need to know which code runs after a command is parsed.",
      relatedHref: "html/cli-readiness.html"
    });
  }
  if ((hasCommand || hasOption || hasArgument) && !hasHelp) {
    riskQueue.push({
      priority: "medium",
      action: "Document usage/help output, descriptions, help options, or show-help-after-error behavior.",
      why: "CLI readiness includes discoverability; Commander.js treats automated help as part of the command contract.",
      relatedHref: "html/cli-readiness.html"
    });
  }
  if ((hasCommand || hasOption || hasParse) && !hasError) {
    riskQueue.push({
      priority: "low",
      action: "Record error and exit-code behavior for missing arguments, invalid options, and unknown commands.",
      why: "A CLI should make failure modes visible through stderr, exit codes, or parser exceptions.",
      relatedHref: "html/cli-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify CLI behavior with trusted local tests or reviewed manual runs outside RepoTutor.",
    why: "RepoTutor records CLI readiness only; it does not invoke CLI binaries, parse real argv, spawn subcommands, inspect completions, or verify terminal TTY behavior.",
    relatedHref: "html/cli-readiness.html"
  });

  return {
    summary: `Commander.js-style CLI readiness report: setup ${cliSetups.length}개, command signal ${commandSignals.length}개, option signal ${optionSignals.length}개, help signal ${helpSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Commander.js Command option requiredOption argument action parseAsync help usage exitOverride showHelpAfterError",
    cliSetups,
    commandSignals,
    optionSignals,
    parseSignals,
    actionSignals,
    helpSignals,
    errorSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"new Command|program\\.command|\\.command\\(|addCommand|package.json.*bin\" package.json src app packages bin scripts", purpose: "Inventory CLI entry points, root commands, subcommands, and package bin ownership." },
      { command: "rg \"\\.option\\(|requiredOption|addOption|new Option|choices\\(|conflicts\\(|implies\\(|\\.env\\(\" src app packages bin scripts", purpose: "Find options, required flags, choices, conflicts, implied values, and environment-backed options." },
      { command: "rg \"\\.argument\\(|new Argument|arguments\\(|<[^>]+>|\\[[^\\]]+\\]\" src app packages bin scripts", purpose: "Trace positional arguments and variadic argument contracts." },
      { command: "rg \"\\.action\\(|\\.hook\\(|preAction|postAction|parseAsync|parse\\(\" src app packages bin scripts", purpose: "Connect parsed commands to actions, lifecycle hooks, and async parse boundaries." },
      { command: "rg \"\\.help\\(|\\.usage\\(|helpOption|addHelpText|showHelpAfterError|configureOutput|exitOverride|CommanderError\" src app packages bin scripts", purpose: "Review help, output, error, and exit-code behavior." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover CLI parsing, help text, and failure modes." }
    ],
    learnerNextSteps: [
      "먼저 package.json bin, bin/ 폴더, new Command, program.command, addCommand 중 CLI entry가 어디인지 찾으세요.",
      "command/subcommand와 argument/option/requiredOption/choices/default/env 신호를 함께 읽어 사용자가 입력할 수 있는 표면을 정리하세요.",
      "parse 또는 parseAsync가 process.argv나 전달된 argv를 어디에서 받는지 확인하세요.",
      "action, hook, preAction, postAction, executable subcommand를 따라 실제 실행되는 코드를 연결하세요.",
      "help, usage, helpOption, addHelpText, showHelpAfterError, configureOutput, exitOverride로 사용자 안내와 실패 모드를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 argv 파싱, exit code, TTY 색상/폭, shell completion은 원본 프로젝트 테스트나 수동 검증에서 별도 확인하세요."
    ]
  };
}

type CliReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function cliReadinessSourceFiles(walk: WalkResult): Promise<CliReadinessSourceFile[]> {
  const files: CliReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !cliReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!cliReadinessPathSignal(file.relPath) && !cliReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function cliReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return cliReadinessPathSignal(filePath)
    || /^(package\.json|commander\.(js|mjs|cjs|ts)|yargs\.(js|mjs|cjs|ts)|oclif\.(manifest\.)?json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function cliReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(cli|bin|cmd|command|commands|commander|yargs|oclif|cac|meow|clipanion|scripts?)(\/|\.|-|_|$)|package\.json$/i.test(filePath);
}

function cliReadinessContentSignal(text: string): boolean {
  return /\b(new\s+Command|program\.command|\.command\s*\(|addCommand|\.option\s*\(|requiredOption|addOption|new\s+Option|\.argument\s*\(|new\s+Argument|\.action\s*\(|\.hook\s*\(|parseAsync\s*\(|\.parse\s*\(|exitOverride|showHelpAfterError|configureOutput|CommanderError|InvalidArgumentError|yargs\s*\(|@oclif\/core|runCommand|cac\s*\(|meow\s*\(|clipanion)\b|"(commander|yargs|@oclif\/core|cac|meow|clipanion)"|"\s*bin\s*"\s*:/i.test(text);
}

function cliReadinessSetups(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["cliSetups"] {
  const rows: CliReadinessReport["cliSetups"] = [];
  for (const source of sourceFiles) {
    const commandCount = countMatches(source.text, /\b(new\s+Command|program\.command|\.command\s*\(|addCommand|createCommand|subcommand|runCommand|commands?\s*:|"bin"\s*:)/gi);
    const optionCount = countMatches(source.text, /\b(\.option\s*\(|requiredOption|addOption|new\s+Option|\.options\s*\(|flags?\s*:|choices\s*\(|conflicts\s*\(|implies\s*\(|\.env\s*\()/gi);
    const argumentCount = countMatches(source.text, /\b(\.argument\s*\(|arguments\s*\(|new\s+Argument|args?\s*:|variadic|positional)\b|<[^>\n]+>|\[[^\]\n]+\]/gi);
    const actionCount = countMatches(source.text, /\b(\.action\s*\(|\.hook\s*\(|preAction|postAction|async\s+function|executableHandler|executableFile|passThroughOptions)\b/gi);
    const parseCount = countMatches(source.text, /\b(parseAsync\s*\(|\.parse\s*\(|parseOptions|parseArg|process\.argv|argv\b|allowUnknownOption|exitOverride)\b/gi);
    const helpCount = countMatches(source.text, /\b(\.help\s*\(|\.usage\s*\(|helpOption|helpCommand|addHelpText|showHelpAfterError|configureHelp|createHelp|formatHelp|completion)\b/gi);
    const errorCount = countMatches(source.text, /\b(CommanderError|InvalidArgumentError|unknown option|unknown command|missing argument|exitCode|process\.exit|writeErr|stderr|error\s*:)/gi);
    const outputCount = countMatches(source.text, /\b(configureOutput|writeOut|writeErr|stdout|stderr|console\.log|console\.error|outputError|getOutHelpWidth|getErrHelpWidth)\b/gi);
    const hasSetupSignal = commandCount + optionCount + argumentCount + actionCount + parseCount + helpCount + errorCount + outputCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: cliReadinessProvider(source),
      commandCount,
      optionCount,
      argumentCount,
      actionCount,
      parseCount,
      helpCount,
      errorCount,
      outputCount,
      readiness: (commandCount > 0 || optionCount > 0) && parseCount > 0 && (actionCount > 0 || helpCount > 0 || errorCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains commands ${commandCount}, options ${optionCount}, arguments ${argumentCount}, actions ${actionCount}, parse ${parseCount}, help ${helpCount}, errors ${errorCount}, output ${outputCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function cliReadinessProvider(source: CliReadinessSourceFile): CliReadinessReport["cliSetups"][number]["provider"] {
  if (/\b(commander|new\s+Command|program\.command|CommanderError|requiredOption|showHelpAfterError)\b/i.test(source.text)) return "commander";
  if (/\byargs\b|from ["']yargs["']|require\(["']yargs["']\)|hideBin|\.argv\b/i.test(source.text)) return "yargs";
  if (/@oclif\/core|runCommand|Flags\.|Command\.run/i.test(source.text)) return "oclif";
  if (/\bcac\s*\(|from ["']cac["']|require\(["']cac["']\)/i.test(source.text)) return "cac";
  if (/\bmeow\s*\(|from ["']meow["']|require\(["']meow["']\)/i.test(source.text)) return "meow";
  if (/clipanion|Cli\.from|Command\.Usage/i.test(source.text)) return "clipanion";
  if (/(^|\/)(cli|bin|command|commands)(\/|\.|-|_|$)|"bin"\s*:/i.test(source.filePath) || /process\.argv|#!\/usr\/bin\/env\s+node/i.test(source.text)) return "custom";
  return "unknown";
}

function cliReadinessCommandSignals(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["commandSignals"] {
  const specs: Array<{ signal: CliReadinessReport["commandSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "command", pattern: /new\s+Command|program\.command|\.command\s*\(|createCommand|runCommand/i, evidence: "command declaration evidence was detected." },
    { signal: "subcommand", pattern: /addCommand|\.command\s*\([^)]*,\s*["'`]|executableSubcommand|subcommand|commands\s*:/i, evidence: "subcommand evidence was detected." },
    { signal: "argument", pattern: /\.argument\s*\(|new\s+Argument|arguments\s*\(|<[^>\n]+>|\[[^\]\n]+\]/i, evidence: "positional argument evidence was detected." },
    { signal: "description", pattern: /\.description\s*\(|\.summary\s*\(|description\s*:/i, evidence: "command description evidence was detected." },
    { signal: "alias", pattern: /\.alias\s*\(|aliases?\s*:|\.aliases\s*\(/i, evidence: "alias evidence was detected." },
    { signal: "version", pattern: /\.version\s*\(|versionOption|--version|"version"\s*:/i, evidence: "version flag evidence was detected." }
  ];
  return cliReadinessSignalFromSpecs(sourceFiles, specs, "command", "signal");
}

function cliReadinessOptionSignals(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["optionSignals"] {
  const specs: Array<{ signal: CliReadinessReport["optionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "option", pattern: /\.option\s*\(|addOption|new\s+Option|flags?\s*:/i, evidence: "option declaration evidence was detected." },
    { signal: "required-option", pattern: /requiredOption|makeOptionMandatory|mandatory\s*[:=]\s*true/i, evidence: "required option evidence was detected." },
    { signal: "variadic-option", pattern: /<[^>\n]*\.\.\.[^>\n]*>|\[[^\]\n]*\.\.\.[^\]\n]*\]|variadic/i, evidence: "variadic option/argument evidence was detected." },
    { signal: "default-value", pattern: /\.default\s*\(|defaultValue|default\s*:/i, evidence: "default value evidence was detected." },
    { signal: "choices", pattern: /\.choices\s*\(|choices\s*:/i, evidence: "choice validation evidence was detected." },
    { signal: "env", pattern: /\.env\s*\(|envVar|process\.env/i, evidence: "environment-backed option evidence was detected." },
    { signal: "conflicts", pattern: /\.conflicts\s*\(|conflictsWith|conflicts\s*:/i, evidence: "option conflict evidence was detected." },
    { signal: "implies", pattern: /\.implies\s*\(|impliedOptionValues|implies\s*:/i, evidence: "implied option evidence was detected." }
  ];
  return cliReadinessSignalFromSpecs(sourceFiles, specs, "option", "signal");
}

function cliReadinessParseSignals(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["parseSignals"] {
  const specs: Array<{ signal: CliReadinessReport["parseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "parse", pattern: /\.parse\s*\(|parseOptions|parseArg|parseCommand/i, evidence: "parse evidence was detected." },
    { signal: "parse-async", pattern: /parseAsync\s*\(|async\s+action|await\s+program\.parse/i, evidence: "parseAsync evidence was detected." },
    { signal: "program-name", pattern: /\.name\s*\(|programName|scriptPath|_name|bin\s*:/i, evidence: "program name/bin evidence was detected." },
    { signal: "executable", pattern: /executableFile|executableDir|stand-?alone executable|childProcess|spawn\s*\(|execFile/i, evidence: "executable subcommand evidence was detected." },
    { signal: "exit-override", pattern: /exitOverride|_exitCallback|CommanderError|process\.exit/i, evidence: "exit override/exit evidence was detected." },
    { signal: "allow-unknown-option", pattern: /allowUnknownOption|allowExcessArguments|enablePositionalOptions|passThroughOptions/i, evidence: "parse option policy evidence was detected." }
  ];
  return cliReadinessSignalFromSpecs(sourceFiles, specs, "parse", "signal");
}

function cliReadinessActionSignals(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["actionSignals"] {
  const specs: Array<{ signal: CliReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "action", pattern: /\.action\s*\(|actionHandler|_actionHandler|handler\s*:/i, evidence: "action handler evidence was detected." },
    { signal: "hook", pattern: /\.hook\s*\(|lifeCycleHooks|hook\s*:/i, evidence: "lifecycle hook evidence was detected." },
    { signal: "pre-action", pattern: /preAction/i, evidence: "preAction hook evidence was detected." },
    { signal: "post-action", pattern: /postAction/i, evidence: "postAction hook evidence was detected." },
    { signal: "async-action", pattern: /async\s+function|async\s*\(|parseAsync|await\s+/i, evidence: "async action evidence was detected." },
    { signal: "pass-through-options", pattern: /passThroughOptions|enablePositionalOptions|--/i, evidence: "pass-through/positional option evidence was detected." }
  ];
  return cliReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function cliReadinessHelpSignals(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["helpSignals"] {
  const specs: Array<{ signal: CliReadinessReport["helpSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "help", pattern: /\.help\s*\(|helpCommand|createHelp|formatHelp|Help\b/i, evidence: "help system evidence was detected." },
    { signal: "usage", pattern: /\.usage\s*\(|Usage:|usage\s*:/i, evidence: "usage text evidence was detected." },
    { signal: "help-option", pattern: /helpOption|--help|-h,\s*--help/i, evidence: "help option evidence was detected." },
    { signal: "add-help-text", pattern: /addHelpText|afterAll|beforeAll|before\s+help|after\s+help/i, evidence: "custom help text evidence was detected." },
    { signal: "show-help-after-error", pattern: /showHelpAfterError/i, evidence: "show-help-after-error evidence was detected." },
    { signal: "completion", pattern: /completion|compgen|autocomplete|shell\s+completion/i, evidence: "completion evidence was detected." }
  ];
  return cliReadinessSignalFromSpecs(sourceFiles, specs, "help", "signal");
}

function cliReadinessErrorSignals(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["errorSignals"] {
  const specs: Array<{ signal: CliReadinessReport["errorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "command-error", pattern: /CommanderError|CliError|CommandError|program\.error|\.error\s*\(/i, evidence: "command error evidence was detected." },
    { signal: "missing-argument", pattern: /missing argument|required argument|missingMandatoryOptionValue|optionMissingArgument/i, evidence: "missing argument/option evidence was detected." },
    { signal: "unknown-option", pattern: /unknown option|unknownOption|allowUnknownOption|unknown option/i, evidence: "unknown option evidence was detected." },
    { signal: "invalid-option", pattern: /InvalidArgumentError|invalid option|invalidArgument|choices|argParser/i, evidence: "invalid option/argument evidence was detected." },
    { signal: "exit-code", pattern: /exitCode|process\.exit|CommanderError\(\s*\d|exitOverride/i, evidence: "exit code evidence was detected." },
    { signal: "stderr", pattern: /stderr|writeErr|console\.error|outputError|getErrHelpWidth/i, evidence: "stderr/error output evidence was detected." }
  ];
  return cliReadinessSignalFromSpecs(sourceFiles, specs, "error", "signal");
}

function cliReadinessPackageSignals(sourceFiles: CliReadinessSourceFile[]): CliReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CliReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "commander", pattern: /"commander"|from ["']commander["']|require\(["']commander["']\)|new\s+Command/i, evidence: "Commander package evidence was detected." },
    { signal: "yargs", pattern: /"yargs"|from ["']yargs["']|require\(["']yargs["']\)|hideBin/i, evidence: "yargs package evidence was detected." },
    { signal: "@oclif/core", pattern: /"@oclif\/core"|from ["']@oclif\/core["']|require\(["']@oclif\/core["']\)|runCommand/i, evidence: "oclif package evidence was detected." },
    { signal: "cac", pattern: /"cac"|from ["']cac["']|require\(["']cac["']\)|\bcac\s*\(/i, evidence: "cac package evidence was detected." },
    { signal: "meow", pattern: /"meow"|from ["']meow["']|require\(["']meow["']\)|\bmeow\s*\(/i, evidence: "meow package evidence was detected." },
    { signal: "clipanion", pattern: /"clipanion"|from ["']clipanion["']|require\(["']clipanion["']\)|Clipanion|Cli\.from/i, evidence: "clipanion package evidence was detected." }
  ];
  return cliReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function cliReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CliReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/cli-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildTerminalUiReadinessReport(walk: WalkResult): Promise<TerminalUiReadinessReport> {
  const sourceFiles = await terminalUiReadinessSourceFiles(walk);
  const terminalSetups = terminalUiReadinessSetups(sourceFiles);
  const frameworkSignals = terminalUiReadinessFrameworkSignals(sourceFiles);
  const screenSignals = terminalUiReadinessScreenSignals(sourceFiles);
  const layoutSignals = terminalUiReadinessLayoutSignals(sourceFiles);
  const inputSignals = terminalUiReadinessInputSignals(sourceFiles);
  const focusSignals = terminalUiReadinessFocusSignals(sourceFiles);
  const mouseSignals = terminalUiReadinessMouseSignals(sourceFiles);
  const renderSignals = terminalUiReadinessRenderSignals(sourceFiles);
  const lifecycleSignals = terminalUiReadinessLifecycleSignals(sourceFiles);
  const testSignals = terminalUiReadinessTestSignals(sourceFiles);
  const packageSignals = terminalUiReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasScreen = screenSignals.some((item) => item.readiness === "ready") || terminalSetups.some((item) => item.screenCount > 0 || item.rawModeCount > 0 || item.altScreenCount > 0);
  const hasLayout = layoutSignals.some((item) => item.readiness === "ready") || terminalSetups.some((item) => item.layoutCount > 0 || item.componentCount > 0 || item.widgetCount > 0);
  const hasInput = inputSignals.some((item) => item.readiness === "ready") || terminalSetups.some((item) => item.inputCount > 0);
  const hasRender = renderSignals.some((item) => item.readiness === "ready") || terminalSetups.some((item) => item.renderCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || terminalSetups.some((item) => item.testCount > 0);

  const riskQueue: TerminalUiReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasScreen && !hasLayout) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the terminal UI framework, screen/program object, or component layout before claiming TUI readiness.",
      why: "Ink/Bubble Tea/Blessed-style readiness starts with a terminal renderer plus a screen or component tree learners can trace.",
      relatedHref: "html/terminal-ui-readiness.html"
    });
  }
  if ((hasLayout || hasInput || hasRender) && !hasScreen) {
    riskQueue.push({
      priority: "high",
      action: "Trace the terminal screen, program, raw-mode, alternate-screen, or TTY boundary.",
      why: "Terminal widgets and key handlers can behave differently when raw mode, alternate screen, stdout, stdin, or terminal dimensions are absent.",
      relatedHref: "html/terminal-ui-readiness.html"
    });
  }
  if ((hasFramework || hasLayout || hasScreen) && !hasInput) {
    riskQueue.push({
      priority: "medium",
      action: "Record keyboard input, stdin handling, key message dispatch, paste handling, or quit shortcuts.",
      why: "A TUI is incomplete unless learners can see how user input flows into state updates.",
      relatedHref: "html/terminal-ui-readiness.html"
    });
  }
  if ((hasFramework || hasLayout || hasInput) && !hasRender) {
    riskQueue.push({
      priority: "medium",
      action: "Identify the render(), View(), screen.render(), snapshot, or ANSI output boundary.",
      why: "Learners need to connect state changes to terminal output and repaint behavior.",
      relatedHref: "html/terminal-ui-readiness.html"
    });
  }
  if ((hasFramework || hasScreen || hasInput || hasRender) && !hasTests) {
    riskQueue.push({
      priority: "low",
      action: "Add snapshot, render-to-string, PTY, or framework-supported tests for terminal UI output.",
      why: "TUI regressions often appear in key handling, screen size, ANSI output, or alternate-screen behavior that unit tests should make visible.",
      relatedHref: "html/terminal-ui-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify terminal UI behavior with trusted local tests or manual review outside RepoTutor.",
    why: "RepoTutor records terminal UI readiness only; it does not start TUI programs, enter raw mode, switch alternate screens, capture keyboard or mouse input, resize terminals, spawn pseudo-terminals, write ANSI control sequences, or run the analyzed project's tests.",
    relatedHref: "html/terminal-ui-readiness.html"
  });

  return {
    summary: `Ink/Bubble Tea/Blessed-style terminal UI readiness report: setup ${terminalSetups.length}개, framework signal ${frameworkSignals.length}개, input signal ${inputSignals.length}개, render signal ${renderSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Terminal UI readiness Ink Box Text useInput Bubble Tea Model Init Update View tea.NewProgram Blessed screen box key mouse render",
    terminalSetups,
    frameworkSignals,
    screenSignals,
    layoutSignals,
    inputSignals,
    focusSignals,
    mouseSignals,
    renderSignals,
    lifecycleSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"render\\(|<Box|<Text|useInput|useStdin|useStdout|useFocus|ink-testing-library\" src app packages test", purpose: "Find Ink component trees, input hooks, stream hooks, focus hooks, and render/test boundaries." },
      { command: "rg \"tea\\.NewProgram|Init\\(|Update\\(|View\\(|tea\\.KeyMsg|tea\\.MouseMsg|tea\\.WindowSizeMsg|WithAltScreen|WithMouse\" .", purpose: "Trace Bubble Tea program startup, model lifecycle, keyboard/mouse/resize handling, and alternate-screen use." },
      { command: "rg \"blessed\\.screen|blessed\\.box|screen\\.key|\\.key\\(|\\.on\\('click|\\.on\\('mouse|screen\\.render|setContent\" src app packages test", purpose: "Inventory Blessed screens, widgets, input handlers, mouse handlers, and repaint boundaries." },
      { command: "rg \"setRawMode|isTTY|stdin|stdout|alternateBuffer|normalBuffer|ansi|screenshot|lastFrame|renderToString\" .", purpose: "Review raw-mode, TTY, stream, ANSI, screenshot, and snapshot assumptions." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover terminal rendering, snapshots, and key handling." }
    ],
    learnerNextSteps: [
      "먼저 Ink, Bubble Tea, Blessed, curses, ratatui 같은 TUI framework entry를 찾으세요.",
      "screen/program/render/View 경계와 stdin/stdout/raw-mode/alternate-screen/TTY 조건을 분리해 읽으세요.",
      "Box/Text/list/form/table/viewport/style/border 같은 layout/widget 신호를 따라 화면 구조를 요약하세요.",
      "useInput, KeyMsg, keypress, stdin, paste, quit shortcut 등 입력이 상태 업데이트로 이어지는 흐름을 확인하세요.",
      "focus, cursor, selection, mouse, click, hover, resize, tick, batch/sequence 같은 상호작용과 lifecycle 신호를 표시하세요.",
      "이 리포트는 정적 readiness입니다. 실제 raw mode, alternate screen, terminal size, keyboard/mouse behavior는 원본 프로젝트 테스트나 수동 검증에서 별도 확인하세요."
    ]
  };
}

type TerminalUiReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function terminalUiReadinessSourceFiles(walk: WalkResult): Promise<TerminalUiReadinessSourceFile[]> {
  const files: TerminalUiReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !terminalUiReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!terminalUiReadinessPathSignal(file.relPath) && !terminalUiReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function terminalUiReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return terminalUiReadinessPathSignal(filePath)
    || /^(package\.json|go\.mod|Cargo\.toml)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|go|rs|py|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function terminalUiReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(tui|terminal|term|screen|console|cli|cmd|ui|widgets?|views?|components?|ink|bubbletea|blessed|ratatui|curses|tests?)(\/|\.|-|_|$)|package\.json$|go\.mod$|Cargo\.toml$/i.test(filePath);
}

function terminalUiReadinessContentSignal(text: string): boolean {
  return /\b(render\s*\(|<Box|<Text|useInput|useStdin|useStdout|useFocus|useFocusManager|ink-testing-library|tea\.NewProgram|func\s*\([^)]*\)\s*(Init|Update|View)\s*\(|tea\.(KeyMsg|MouseMsg|WindowSizeMsg|Batch|Sequence|Tick)|WithAltScreen|WithMouse|lipgloss|blessed\.screen|blessed\.(box|list|form|table)|screen\.render|setContent|setRawMode|isTTY|alternateBuffer|normalBuffer|screenshot)\b|"(ink|blessed|ink-testing-library)"|github\.com\/charmbracelet\/(bubbletea|bubbles|lipgloss)|ratatui|ncurses/i.test(text);
}

function terminalUiReadinessSetups(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["terminalSetups"] {
  const rows: TerminalUiReadinessReport["terminalSetups"] = [];
  for (const source of sourceFiles) {
    const componentCount = countMatches(source.text, /<\s*(Box|Text|Static|Transform|Spacer|Newline)\b|blessed\.(box|list|form|table|textarea|textbox|button|terminal)\s*\(|bubbles\/(list|spinner|textarea|textinput|viewport|table)|ratatui::widgets|Widget\b/gi);
    const screenCount = countMatches(source.text, /\b(blessed\.screen|screen\s*=|tea\.NewProgram|Program\{|render\s*\(|process\.(stdin|stdout)|useStdin|useStdout|TTY|terminal|screen\.program)\b/gi);
    const renderCount = countMatches(source.text, /(render\s*\(|screen\.render|View\s*\(|tea\.NewView|lastFrame|renderToString|screenshot|stdout\.write|program\.write)/gi);
    const layoutCount = countMatches(source.text, /\b(Box|Text|Static|Transform|flexDirection|borderStyle|width\s*[:=]|height\s*[:=]|blessed\.(box|list|form|table)|lipgloss\.NewStyle|Border|JoinVertical|JoinHorizontal|viewport|table)\b/gi);
    const inputCount = countMatches(source.text, /\b(useInput|usePaste|stdin|setRawMode|KeyMsg|keypress|screen\.key|\.key\s*\(|keys\s*:|key\.|tea\.MouseMsg|on\(['"`](keypress|key|mouse|click)|input\.on\(['"`]data)\b/gi);
    const focusCount = countMatches(source.text, /\b(useFocus|useFocusManager|focusNext|focusPrevious|focus\s*\(|blur|cursor|selected|selection|isFocused|showCursor|hideCursor)\b/gi);
    const mouseCount = countMatches(source.text, /\b(mouse|click|hover|mouseover|mouseout|mousemove|mousedown|mouseup|drag|wheel|WithMouse|enableMouse|setMouse)\b/gi);
    const rawModeCount = countMatches(source.text, /\b(setRawMode|isRawModeSupported|raw mode|raw-mode|TTY|isTTY|enterRawMode|rawMode)\b/gi);
    const altScreenCount = countMatches(source.text, /\b(WithAltScreen|alternateBuffer|normalBuffer|altscreen|alt-screen|EnterAlternateScreen|LeaveAlternateScreen)\b/gi);
    const resizeCount = countMatches(source.text, /\b(WindowSizeMsg|resize|terminal-size|columns|rows|width|height|SIGWINCH)\b/gi);
    const styleCount = countMatches(source.text, /\b(color=|backgroundColor|bold|italic|underline|border|style|lipgloss|chalk|ansi|SGR|Foreground|Background|Render)\b/gi);
    const widgetCount = countMatches(source.text, /\b(list|spinner|textarea|textinput|viewport|table|form|button|checkbox|radio|progress|box|terminal)\b/gi);
    const testCount = countMatches(source.text, /\b(ink-testing-library|lastFrame|snapshot|renderToString|go test|vitest|mocha|pty|screenshot|upload-artifact|expect\s*\()\b/gi);
    const hasSetupSignal = componentCount + screenCount + renderCount + layoutCount + inputCount + focusCount + mouseCount + rawModeCount + altScreenCount + resizeCount + styleCount + widgetCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: terminalUiReadinessPlatform(source),
      componentCount,
      screenCount,
      renderCount,
      layoutCount,
      inputCount,
      focusCount,
      mouseCount,
      rawModeCount,
      altScreenCount,
      resizeCount,
      styleCount,
      widgetCount,
      testCount,
      readiness: (screenCount > 0 || componentCount > 0) && renderCount > 0 && inputCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains components ${componentCount}, screens ${screenCount}, renders ${renderCount}, layouts ${layoutCount}, inputs ${inputCount}, focus ${focusCount}, mouse ${mouseCount}, raw ${rawModeCount}, alt-screen ${altScreenCount}, resize ${resizeCount}, style ${styleCount}, widgets ${widgetCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function terminalUiReadinessPlatform(source: TerminalUiReadinessSourceFile): TerminalUiReadinessReport["terminalSetups"][number]["platform"] {
  if (/\b(from ["']ink["']|require\(["']ink["']\)|<Box|<Text|useInput|ink-testing-library)\b/i.test(source.text)) return "ink";
  if (/github\.com\/charmbracelet\/bubbletea|tea\.NewProgram|tea\.(Model|Msg|Cmd|KeyMsg|MouseMsg|WindowSizeMsg)|func\s*\([^)]*\)\s*(Init|Update|View)\s*\(/i.test(source.text)) return "bubbletea";
  if (/blessed\.screen|require\(["']blessed["']\)|from ["']blessed["']|blessed\.(box|list|form|table|program)/i.test(source.text)) return "blessed";
  if (/\b(curses|ncurses|urwid|blessed\.Terminal)\b/i.test(source.text)) return "curses";
  if (/\b(ratatui|tui-rs|crossterm|termion|Terminal<CrosstermBackend)\b/i.test(source.text)) return "ratatui";
  if (/terminal|TTY|stdin|stdout|ansi|keypress|screen\.render|setRawMode/i.test(source.text) || terminalUiReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function terminalUiReadinessFrameworkSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ink", pattern: /"ink"|from ["']ink["']|require\(["']ink["']\)|<Box|<Text|useInput/i, evidence: "Ink evidence was detected." },
    { signal: "bubbletea", pattern: /github\.com\/charmbracelet\/bubbletea|tea\.NewProgram|tea\.(Model|Msg|Cmd|KeyMsg|MouseMsg)/i, evidence: "Bubble Tea evidence was detected." },
    { signal: "blessed", pattern: /"blessed"|blessed\.screen|blessed\.(box|list|form|table|program)/i, evidence: "Blessed evidence was detected." },
    { signal: "curses", pattern: /\b(curses|ncurses|urwid)\b/i, evidence: "curses-style evidence was detected." },
    { signal: "ratatui", pattern: /\b(ratatui|tui-rs|crossterm|termion)\b/i, evidence: "Ratatui/crossterm evidence was detected." },
    { signal: "custom", pattern: /process\.(stdin|stdout)|setRawMode|readline|ansi-escapes|keypress|terminal-size/i, evidence: "custom terminal IO evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function terminalUiReadinessScreenSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["screenSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["screenSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "screen", pattern: /blessed\.screen|screen\s*=|Screen\.|new\s+Screen|screen\.render/i, evidence: "screen object evidence was detected." },
    { signal: "program", pattern: /tea\.NewProgram|Program\{|blessed\.program|screen\.program|new\s+Program/i, evidence: "program lifecycle evidence was detected." },
    { signal: "alt-screen", pattern: /WithAltScreen|alternateBuffer|normalBuffer|altscreen|alt-screen|EnterAlternateScreen|LeaveAlternateScreen/i, evidence: "alternate-screen evidence was detected." },
    { signal: "raw-mode", pattern: /setRawMode|raw mode|raw-mode|isRawModeSupported|enterRawMode|rawMode/i, evidence: "raw-mode evidence was detected." },
    { signal: "tty", pattern: /\bTTY\b|isTTY|OpenTTY|stdin|stdout|process\.(stdin|stdout)/i, evidence: "TTY/stdin/stdout evidence was detected." },
    { signal: "terminal-size", pattern: /WindowSizeMsg|terminal-size|stdout\.columns|stdout\.rows|program\.cols|program\.rows|SIGWINCH/i, evidence: "terminal size evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "screen", "signal");
}

function terminalUiReadinessLayoutSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["layoutSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["layoutSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "box", pattern: /<Box|blessed\.box|box\s*=|Box::|widgets::Block/i, evidence: "box/container evidence was detected." },
    { signal: "text", pattern: /<Text|setContent|setText|Text::|Paragraph::|tea\.NewView/i, evidence: "text content evidence was detected." },
    { signal: "list", pattern: /blessed\.list|bubbles\/list|list\.Model|List::|selectable list/i, evidence: "list widget evidence was detected." },
    { signal: "form", pattern: /blessed\.form|textinput|textarea|form\s*=|Input::|TextArea/i, evidence: "form/input widget evidence was detected." },
    { signal: "style", pattern: /lipgloss\.NewStyle|style\s*[:=]|chalk|color=|backgroundColor|Foreground|Background|ansi/i, evidence: "terminal styling evidence was detected." },
    { signal: "border", pattern: /borderStyle|border\s*[:=]|Border|RoundedBorder|NormalBorder|line.*border/i, evidence: "border/frame evidence was detected." },
    { signal: "table", pattern: /blessed\.table|bubbles\/table|table\.Model|Table::|DataTable/i, evidence: "table widget evidence was detected." },
    { signal: "viewport", pattern: /viewport|scrollable|Scrollable|blessed\.scrollablebox|Scroll/i, evidence: "viewport/scroll evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "layout", "signal");
}

function terminalUiReadinessInputSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["inputSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["inputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "keyboard", pattern: /key\.|key\s*\(|screen\.key|keys\s*:|KeyMsg|keyboard|ctrl\+c|escape|enter/i, evidence: "keyboard input evidence was detected." },
    { signal: "use-input", pattern: /useInput\s*\(/i, evidence: "Ink useInput evidence was detected." },
    { signal: "key-msg", pattern: /tea\.KeyMsg|KeyMsg|msg\.String\(\)|key\.String/i, evidence: "Bubble Tea key message evidence was detected." },
    { signal: "keypress", pattern: /keypress|on\(['"`]key|on\(['"`]keypress|\.key\s*\(/i, evidence: "keypress event evidence was detected." },
    { signal: "stdin", pattern: /useStdin|process\.stdin|stdin|input\.on\(['"`]data|WithInput/i, evidence: "stdin/input stream evidence was detected." },
    { signal: "paste", pattern: /usePaste|bracketed paste|paste/i, evidence: "paste-mode evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "input", "signal");
}

function terminalUiReadinessFocusSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["focusSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["focusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focus", pattern: /useFocus|\.focus\s*\(|focus\s*:|isFocused|on\(['"`]focus/i, evidence: "focus evidence was detected." },
    { signal: "focus-manager", pattern: /useFocusManager|focusNext|focusPrevious|focusManager/i, evidence: "focus manager evidence was detected." },
    { signal: "cursor", pattern: /cursor|showCursor|hideCursor|Cursor|setCursor|cursorStyle/i, evidence: "cursor evidence was detected." },
    { signal: "selection", pattern: /selected|selection|selectedIndex|activeTab|choice|highlight/i, evidence: "selection evidence was detected." },
    { signal: "blur", pattern: /blur|on\(['"`]blur|FocusBlur|focus\/blur/i, evidence: "blur evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "focus", "signal");
}

function terminalUiReadinessMouseSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["mouseSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["mouseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mouse", pattern: /mouse|MouseMsg|WithMouse|enableMouse|setMouse/i, evidence: "mouse support evidence was detected." },
    { signal: "click", pattern: /click|on\(['"`]click|mousedown|mouseup/i, evidence: "click evidence was detected." },
    { signal: "hover", pattern: /hover|mouseover|mouseout|mousemove|onMouse|OnMouse/i, evidence: "hover/move evidence was detected." },
    { signal: "drag", pattern: /drag|draggable|dragOffset/i, evidence: "drag evidence was detected." },
    { signal: "wheel", pattern: /wheel|mousewheel|scroll/i, evidence: "wheel/scroll evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "mouse", "signal");
}

function terminalUiReadinessRenderSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["renderSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["renderSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "render", pattern: /\brender\s*\(|screen\.render|renderer\.render|Render\(/i, evidence: "render evidence was detected." },
    { signal: "view", pattern: /\bView\s*\(|tea\.NewView|\.View\(\)|view\s*\(/i, evidence: "view function evidence was detected." },
    { signal: "static-output", pattern: /<Static|Static\s*\(|static output|completed tasks/i, evidence: "static output evidence was detected." },
    { signal: "transform", pattern: /<Transform|transform\s*[:=]|Transform\s*\(/i, evidence: "output transform evidence was detected." },
    { signal: "ansi", pattern: /ansi|SGR|chalk|escape|ansi-escapes|Foreground|Background|color=/i, evidence: "ANSI/color evidence was detected." },
    { signal: "snapshot", pattern: /snapshot|lastFrame|renderToString|screenshot|golden|expect\s*\(/i, evidence: "snapshot/render assertion evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "render", "signal");
}

function terminalUiReadinessLifecycleSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "init", pattern: /\bInit\s*\(|initialModel|newModel|useEffect|componentDidMount/i, evidence: "init evidence was detected." },
    { signal: "update", pattern: /\bUpdate\s*\(|setState|useState|dispatch|update\s*\(/i, evidence: "update/state evidence was detected." },
    { signal: "exit", pattern: /useApp|exit\s*\(|tea\.Quit|process\.exit|Ctrl\+C|C-c|escape/i, evidence: "exit evidence was detected." },
    { signal: "resize", pattern: /WindowSizeMsg|resize|SIGWINCH|terminal-size|columns|rows/i, evidence: "resize evidence was detected." },
    { signal: "tick", pattern: /tea\.Tick|time\.Tick|setInterval|setTimeout|spinner\.Tick|frame/i, evidence: "tick/timer evidence was detected." },
    { signal: "batch-sequence", pattern: /tea\.Batch|tea\.Sequence|Batch\(|Sequence\(|cmds\s*\.\.\./i, evidence: "batch/sequence command evidence was detected." },
    { signal: "suspend", pattern: /suspend|SIGTSTP|ctrl-z|Suspend/i, evidence: "suspend/resume evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function terminalUiReadinessTestSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["testSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ink-testing-library", pattern: /ink-testing-library|lastFrame|stdin\.write/i, evidence: "Ink testing evidence was detected." },
    { signal: "go-test", pattern: /go test|_test\.go|testing\.T|go\s+test/i, evidence: "Go test evidence was detected." },
    { signal: "snapshot", pattern: /snapshot|lastFrame|renderToString|screenshot|golden|expect\s*\(/i, evidence: "snapshot assertion evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifacts?|terminal-ui-snapshots|screenshots/i, evidence: "artifact upload evidence was detected." },
    { signal: "pty-test", pattern: /node-pty|pty|expect|vttest|pseudoterminal|pseudo terminal/i, evidence: "PTY test evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function terminalUiReadinessPackageSignals(sourceFiles: TerminalUiReadinessSourceFile[]): TerminalUiReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TerminalUiReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ink", pattern: /"ink"|from ["']ink["']|require\(["']ink["']\)|<Box|<Text/i, evidence: "Ink package evidence was detected." },
    { signal: "blessed", pattern: /"blessed"|require\(["']blessed["']\)|blessed\.screen/i, evidence: "Blessed package evidence was detected." },
    { signal: "bubbletea", pattern: /github\.com\/charmbracelet\/bubbletea|charm\.land\/bubbletea|tea\.NewProgram/i, evidence: "Bubble Tea package evidence was detected." },
    { signal: "bubbles", pattern: /github\.com\/charmbracelet\/bubbles|charm\.land\/bubbles|bubbles\/(list|spinner|textarea|textinput|viewport|table)/i, evidence: "Bubbles package evidence was detected." },
    { signal: "lipgloss", pattern: /github\.com\/charmbracelet\/lipgloss|charm\.land\/lipgloss|lipgloss\.NewStyle/i, evidence: "Lip Gloss package evidence was detected." },
    { signal: "ratatui", pattern: /\bratatui\b|tui-rs|crossterm|termion/i, evidence: "Ratatui/crossterm package evidence was detected." },
    { signal: "ncurses", pattern: /\bncurses\b|\bcurses\b|urwid/i, evidence: "ncurses/curses package evidence was detected." }
  ];
  return terminalUiReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function terminalUiReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TerminalUiReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/terminal-ui-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
