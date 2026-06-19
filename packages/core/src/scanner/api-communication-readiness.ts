import type { NotificationReadinessReport, OpenApiClientReadinessReport, WebhookReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildOpenApiClientReadinessReport(walk: WalkResult): Promise<OpenApiClientReadinessReport> {
  const sourceFiles = await openApiClientReadinessSourceFiles(walk);
  const clientSetups = openApiClientReadinessSetups(sourceFiles);
  const specSignals = openApiClientReadinessSpecSignals(sourceFiles);
  const generatorSignals = openApiClientReadinessGeneratorSignals(sourceFiles);
  const outputSignals = openApiClientReadinessOutputSignals(sourceFiles);
  const runtimeSignals = openApiClientReadinessRuntimeSignals(sourceFiles);
  const clientTargetSignals = openApiClientReadinessClientTargetSignals(sourceFiles);
  const generationWorkflowSignals = openApiClientReadinessGenerationWorkflowSignals(sourceFiles);
  const qualitySignals = openApiClientReadinessQualitySignals(sourceFiles);
  const packageSignals = openApiClientReadinessPackageSignals(sourceFiles);

  const hasGenerator = generatorSignals.some((item) => item.readiness === "ready") || clientSetups.some((item) => item.generator !== "unknown");
  const hasSpec = specSignals.some((item) => ["openapi", "swagger", "input-spec", "remote-schema"].includes(item.signal) && item.readiness === "ready") || clientSetups.some((item) => item.specCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || clientSetups.some((item) => item.outputCount + item.clientCount + item.typeCount > 0);
  const hasRuntime = runtimeSignals.some((item) => item.readiness === "ready") || clientSetups.some((item) => item.clientCount + item.hookCount > 0);
  const hasClientTarget = clientTargetSignals.some((item) => item.readiness === "ready") || clientSetups.some((item) => item.clientCount + item.hookCount + item.mockCount > 0);
  const hasQuality = qualitySignals.some((item) => ["validate-spec", "snapshots", "generated-diff", "typecheck", "ci"].includes(item.signal) && item.readiness === "ready") || clientSetups.some((item) => item.validationCount > 0);

  const riskQueue: OpenApiClientReadinessReport["riskQueue"] = [];
  if (!hasGenerator) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the OpenAPI client generator before claiming generated client readiness.",
      why: "OpenAPI client readiness starts from a generator such as openapi-typescript, Orval, or OpenAPI Generator that learners can trace.",
      relatedHref: "html/openapi-client-readiness.html"
    });
  }
  if (hasGenerator && !hasSpec) {
    riskQueue.push({
      priority: "high",
      action: "Point the generator to a local or reviewed OpenAPI/Swagger input spec.",
      why: "A generator command without an input spec cannot explain which API shape produced the generated client.",
      relatedHref: "html/openapi-client-readiness.html"
    });
  }
  if (hasGenerator && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Document generated output paths for types, client SDKs, hooks, schemas, mocks, or docs.",
      why: "Learners need to know which files are generated and where hand-written application code begins.",
      relatedHref: "html/openapi-client-readiness.html"
    });
  }
  if (hasOutput && !hasRuntime) {
    riskQueue.push({
      priority: "low",
      action: "Trace generated clients to a runtime fetcher, Axios instance, query hook, or custom mutator.",
      why: "Generated types alone do not show request execution, auth/header injection, retry policy, or framework integration.",
      relatedHref: "html/openapi-client-readiness.html"
    });
  }
  if (hasGenerator && !hasClientTarget) {
    riskQueue.push({
      priority: "low",
      action: "Name which generated targets are produced: models, requests, hooks, mocks, schemas, or framework clients.",
      why: "Learners understand OpenAPI generation faster when they can see whether the spec produced plain types, request functions, query hooks, mocks, validators, or MCP/server-style adapters.",
      relatedHref: "html/openapi-client-readiness.html"
    });
  }
  if (hasGenerator && !hasQuality) {
    riskQueue.push({
      priority: "medium",
      action: "Add validate/lint, snapshot, generated-diff, typecheck, or CI checks around generated output.",
      why: "Generated clients drift when specs change unless regeneration and diff review are visible.",
      relatedHref: "html/openapi-client-readiness.html"
    });
  }

  return {
    summary: `OpenAPI client readiness report: setup ${clientSetups.length}개, spec signal ${specSignals.length}개, generator signal ${generatorSignals.length}개, output signal ${outputSignals.length}개, client target signal ${clientTargetSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OpenAPI client readiness openapi-typescript openapi-fetch Hey API @hey-api/openapi-ts createClient plugins @hey-api/client-fetch @hey-api/client-axios @hey-api/client-ky @hey-api/client-next @hey-api/client-nuxt @hey-api/client-ofetch @hey-api/sdk @hey-api/schemas @hey-api/transformers Orval OpenAPI Generator input spec output schemas client hooks mocks MSW zod valibot arktype mutator interceptors auth axios fetch ky ofetch next nuxt react-query preact-query SWR Vue Query Svelte Query Solid Query Angular Query Pinia Colada Hono Fastify NestJS oRPC Effect native fetch MCP Vite plugin Nuxt module watch update-samples test:samples test:snapshots test:cli generatorName config validate lint generated diff typecheck templates",
    clientSetups,
    specSignals,
    generatorSignals,
    outputSignals,
    runtimeSignals,
    clientTargetSignals,
    generationWorkflowSignals,
    qualitySignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"openapi-typescript|openapi-fetch|@hey-api/openapi-ts|@hey-api/client|orval|openapi-generator|swagger-codegen\" package.json .", purpose: "Find OpenAPI client generation packages, scripts, and config references." },
      { command: "rg \"inputSpec|generatorName|orval.config|openapi-ts.config|createClient|plugins|output|target|schemas|client|mock|msw|mutator|interceptors\" .", purpose: "Trace generator inputs, outputs, clients, schemas, mocks, plugin arrays, custom mutators, and runtime interceptors." },
      { command: "rg \"react-query|preact-query|pinia|swr|vue-query|svelte-query|solid-query|angular-query|hono|fastify|nestjs|orpc|zod|valibot|arktype|transformers|effect|mcp|vite-plugin|nuxt|watch|update-samples|test:snapshots\" .", purpose: "Map Hey API/Orval generated targets and sample/snapshot validation loops." },
      { command: "rg \"redocly lint|validate|snapshot|generated|do not edit|typecheck|tsc --noEmit\" .", purpose: "Check spec validation and generated-output drift controls." }
    ],
    learnerNextSteps: [
      "먼저 generator config와 input spec을 연결해서 어떤 OpenAPI 문서가 타입/클라이언트를 만들었는지 확인하세요.",
      "Hey API/Orval-style output이면 fetch/axios/ky/ofetch/Next/Nuxt client, React/Preact/Vue/Svelte/Solid/Angular Query, Pinia Colada, Hono/Fastify/NestJS/oRPC, zod/valibot/arktype/transformers, Effect, MCP 중 무엇을 생성하는지 분리해서 보세요.",
      "generated output 폴더와 hand-written runtime wrapper를 분리해서 실제 요청 경계, interceptors, auth/header 주입 위치를 찾으세요.",
      "mock, schema, hook output이 있으면 테스트와 문서가 같은 spec에서 재생성되는지 확인하세요.",
      "이 리포트는 generator를 실행하지 않습니다. 실제 drift 여부는 원본 저장소에서 validate/generate/typecheck를 별도 실행해 확인하세요."
    ]
  };
}

type OpenApiClientSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function openApiClientReadinessSourceFiles(walk: WalkResult): Promise<OpenApiClientSourceFile[]> {
  const rows: OpenApiClientSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!openApiClientInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!openApiClientPathSignal(file.relPath) && !openApiClientContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 140);
}

function openApiClientInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|orval\.config\.[cm]?[jt]s|orval\.config\.json|openapi-generator-config\.(json|ya?ml)|redocly\.(ya?ml|json)|\.openapi-generator-ignore)$/i.test(base)
    || /(^|\/)(openapi|swagger|schemas?|specs?|contracts?|api|apis|clients?|generated|sdk|orval|openapi-generator)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(json|ya?ml|ts|tsx|js|jsx|mjs|cjs|md)$/i.test(filePath);
}

function openApiClientPathSignal(filePath: string): boolean {
  return /(^|\/)(openapi|swagger|orval|openapi-generator|generated|clients?|sdk|schemas?|specs?|contracts?)(\/|\.|-|_|$)|\.openapi-generator-ignore$/i.test(filePath)
    || /^(package\.json|redocly\.(ya?ml|json))$/i.test(path.basename(filePath));
}

function openApiClientContentSignal(text: string): boolean {
  return /(openapi-typescript|openapi-fetch|orval|openapi-generator|swagger-codegen|@hey-api\/openapi-ts|@hey-api\/client|createClient|plugins\s*:|inputSpec|generatorName|outputDir|openapi\s*[:=]|swagger\s*[:=]|\.openapi-generator-ignore|redocly lint)/i.test(text);
}

function openApiClientReadinessSetups(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["clientSetups"] {
  const rows: OpenApiClientReadinessReport["clientSetups"] = [];
  for (const source of sourceFiles) {
    const specCount = countMatches(source.text, /\b(openapi|swagger|inputSpec|input\s*:|schema\s*:|schemas\s*:|target\s*:|url\s*:)\b|https?:\/\/[^\s'"]+(?:openapi|swagger|api-docs)/gi);
    const outputCount = countMatches(source.text, /\b(output|outputDir|target|client|schemas|models|apiPackage|modelPackage|docs|documentation)\b\s*[:=]|generated|__generated__/gi);
    const clientCount = countMatches(source.text, /\b(openapi-fetch|createClient|client\s*:|fetcher|axios|fetch\s*\(|ky\b|ofetch|mutator|api-client|SDK|typescript-fetch|typescript-axios|interceptors|createInterceptors|@hey-api\/client-[a-z-]+)\b/gi);
    const typeCount = countMatches(source.text, /\b(types?|interface|paths|components|operations|schemas|models|enum|typegen|d\.ts)\b/gi);
    const hookCount = countMatches(source.text, /\b(useQuery|useMutation|react-query|preact-query|tanstack|pinia|pinia-colada|swr|useSWR|vue-query|svelte-query|solid-query|angular-query)\b/gi);
    const mockCount = countMatches(source.text, /\b(msw|mock|mocks|Mock Service Worker|handlers|faker|fixture)\b/gi);
    const validationCount = countMatches(source.text, /\b(validate|validateSpec|skipValidateSpec|redocly lint|lint|snapshot|typecheck|tsc --noEmit|generated diff|do not edit)\b/gi);
    const configCount = countMatches(source.text, /\b(orval\.config|openapi-ts\.config|defineConfig|createClient|plugins|inputSpec|generatorName|additionalProperties|globalProperties|templateDir|override|mode|split|tags|watch)\b/gi);
    const scriptCount = countMatches(source.text, /\b(openapi-typescript|openapi-generator(?:-cli)?|orval|swagger-codegen|@hey-api\/openapi-ts|redocly lint|generate\b|gen:|codegen)\b/gi);
    const packageCount = countMatches(source.text, /"?(openapi-typescript|openapi-fetch|orval|@openapitools\/openapi-generator-cli|openapi-generator-cli|swagger-codegen|@hey-api\/openapi-ts|@hey-api\/client-[a-z-]+|@hey-api\/sdk|@hey-api\/schemas|@hey-api\/transformers|@hey-api\/typescript)"?/gi);
    const totalSignals = specCount + outputCount + clientCount + typeCount + hookCount + mockCount + validationCount + configCount + scriptCount + packageCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      generator: openApiClientGenerator(source),
      specCount,
      outputCount,
      clientCount,
      typeCount,
      hookCount,
      mockCount,
      validationCount,
      configCount,
      scriptCount,
      packageCount,
      readiness: (specCount > 0 && (clientCount + typeCount + outputCount > 0) && (scriptCount + packageCount + configCount > 0)) ? "ready" : "partial",
      evidence: `${totalSignals} OpenAPI client generation signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.specCount + b.clientCount + b.typeCount + b.outputCount + b.configCount) - (a.specCount + a.clientCount + a.typeCount + a.outputCount + a.configCount))
    .slice(0, 40);
}

function openApiClientGenerator(source: OpenApiClientSourceFile): OpenApiClientReadinessReport["clientSetups"][number]["generator"] {
  if (/@hey-api\/openapi-ts|@hey-api\/client-|Hey API/i.test(source.filePath) || /@hey-api\/openapi-ts|@hey-api\/client-|@hey-api\/sdk|@hey-api\/schemas|@hey-api\/transformers|plugins\s*:/i.test(source.text)) return "hey-api";
  if (/openapi-typescript|openapi-fetch/i.test(source.filePath) || /openapi-typescript|openapi-fetch/i.test(source.text)) return "openapi-typescript";
  if (/orval/i.test(source.filePath) || /orval|defineConfig\(\s*\{|client\s*:\s*['"](react-query|swr|axios|fetch|angular|vue-query|svelte-query|hono)/i.test(source.text)) return "orval";
  if (/openapi-generator/i.test(source.filePath) || /openapi-generator|generatorName|inputSpec|outputDir|additionalProperties/i.test(source.text)) return "openapi-generator";
  if (/swagger-codegen/i.test(source.filePath) || /swagger-codegen/i.test(source.text)) return "swagger-codegen";
  if (/generated|api-client|sdk|openapi|swagger/i.test(source.filePath) || /generate|codegen|client|sdk/i.test(source.text)) return "custom";
  return "unknown";
}

function openApiClientReadinessSpecSignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["specSignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["specSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "openapi", pattern: /\bopenapi\b\s*[:=]|"openapi"\s*:|openapi\.(json|ya?ml)/i, evidence: "OpenAPI document evidence was detected." },
    { signal: "swagger", pattern: /\bswagger\b\s*[:=]|"swagger"\s*:|swagger\.(json|ya?ml)/i, evidence: "Swagger document evidence was detected." },
    { signal: "input-spec", pattern: /inputSpec|input\s*:|schema\s*:|schemas\s*:|target\s*:|-i\s+\S+|--input-spec/i, evidence: "generator input spec evidence was detected." },
    { signal: "remote-schema", pattern: /https?:\/\/[^\s'"]+(?:openapi|swagger|api-docs|schema)/i, evidence: "remote schema URL evidence was detected." },
    { signal: "multi-spec", pattern: /input\s*:\s*\{[\s\S]{0,800}(?:petstore|admin|public|internal|v1|v2)|projects\s*:|specs\s*:/i, evidence: "multi-spec generation evidence was detected." },
    { signal: "redocly-config", pattern: /redocly\.(ya?ml|json)|redocly lint|extends:\s*\[|apis\s*:/i, evidence: "Redocly config or lint evidence was detected." },
    { signal: "schema-validation", pattern: /validate(?:Spec)?|skipValidateSpec\s*:\s*false|openapi-generator validate|redocly lint|swagger-parser/i, evidence: "schema validation evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "spec", "signal");
}

function openApiClientReadinessGeneratorSignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["generatorSignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["generatorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "openapi-typescript", pattern: /openapi-typescript/i, evidence: "openapi-typescript evidence was detected." },
    { signal: "openapi-fetch", pattern: /openapi-fetch|createClient<|createClient\(/i, evidence: "openapi-fetch evidence was detected." },
    { signal: "hey-api", pattern: /@hey-api\/openapi-ts|@hey-api\/client-|@hey-api\/sdk|@hey-api\/schemas|@hey-api\/transformers|Hey API/i, evidence: "Hey API OpenAPI TS evidence was detected." },
    { signal: "orval", pattern: /orval|orval\.config|defineConfig\(/i, evidence: "Orval evidence was detected." },
    { signal: "openapi-generator", pattern: /openapi-generator|@openapitools\/openapi-generator-cli/i, evidence: "OpenAPI Generator evidence was detected." },
    { signal: "swagger-codegen", pattern: /swagger-codegen/i, evidence: "Swagger Codegen evidence was detected." },
    { signal: "generator-name", pattern: /generatorName|-g\s+(typescript|java|python|ruby|go|kotlin|swift)|generator-name/i, evidence: "generator name evidence was detected." },
    { signal: "config-file", pattern: /orval\.config|openapi-ts\.config|openapi-generator-config|defineConfig|createClient|additionalProperties|globalProperties|plugins\s*:/i, evidence: "generator config evidence was detected." },
    { signal: "cli-command", pattern: /\b(openapi-typescript|orval|openapi-generator(?:-cli)?|swagger-codegen|@hey-api\/openapi-ts)\b.+(?:generate|gen|-i|--input|--output)/i, evidence: "generator CLI command evidence was detected." },
    { signal: "vite-plugin", pattern: /@hey-api\/openapi-ts.*Vite|vite-plugin|heyApiPlugin|plugins:\s*\[heyApiPlugin/i, evidence: "Hey API Vite plugin evidence was detected." },
    { signal: "nuxt-module", pattern: /@hey-api\/openapi-ts.*Nuxt|@hey-api\/nuxt|defineNuxtModule|nuxt module/i, evidence: "Hey API Nuxt module evidence was detected." },
    { signal: "watch-mode", pattern: /\bwatch\s*:\s*(true|false)|--watch|tsc --build --watch/i, evidence: "generator watch-mode evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "generator", "signal");
}

function openApiClientReadinessOutputSignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["outputSignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "types", pattern: /\b(types?|d\.ts|interface|paths|components|operations)\b/i, evidence: "generated type evidence was detected." },
    { signal: "client-sdk", pattern: /client\s*:|api-client|SDK|typescript-fetch|typescript-axios|createClient|fetcher/i, evidence: "client SDK output evidence was detected." },
    { signal: "hooks", pattern: /react-query|tanstack|useQuery|useMutation|swr|useSWR|vue-query|svelte-query|angular-query/i, evidence: "generated hook evidence was detected." },
    { signal: "schemas", pattern: /schemas?\s*:|models?\s*:|modelPackage|schema output|schemaMode/i, evidence: "schema/model output evidence was detected." },
    { signal: "mocks", pattern: /mock|mocks|faker|fixture|handlers/i, evidence: "mock output evidence was detected." },
    { signal: "zod", pattern: /\bzod\b|zodios|zod schemas/i, evidence: "Zod output evidence was detected." },
    { signal: "valibot", pattern: /\bvalibot\b|Valibot/i, evidence: "Valibot output evidence was detected." },
    { signal: "arktype", pattern: /\barktype\b|Arktype/i, evidence: "Arktype output evidence was detected." },
    { signal: "transformers", pattern: /@hey-api\/transformers|ExpressionTransformer|TypeTransformer|transformers/i, evidence: "transformer output evidence was detected." },
    { signal: "msw", pattern: /\bmsw\b|Mock Service Worker|mock handlers/i, evidence: "MSW mock output evidence was detected." },
    { signal: "server-stub", pattern: /server stub|server\s*:|generatorName\s*:\s*['"][^'"]*server|typescript-nestjs|spring|fastapi/i, evidence: "server stub output evidence was detected." },
    { signal: "docs", pattern: /documentation|docs?|markdown|html2|asciidoc/i, evidence: "documentation output evidence was detected." },
    { signal: "split-output", pattern: /mode\s*:\s*['"](split|tags|tags-split)|split\s*:|tags\s*:/i, evidence: "split output evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function openApiClientReadinessRuntimeSignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "fetch", pattern: /native fetch|fetch\s*\(|openapi-fetch|typescript-fetch/i, evidence: "fetch runtime evidence was detected." },
    { signal: "axios", pattern: /axios|typescript-axios/i, evidence: "Axios runtime evidence was detected." },
    { signal: "ky", pattern: /@hey-api\/client-ky|\bky\b|KyClient/i, evidence: "Ky runtime evidence was detected." },
    { signal: "ofetch", pattern: /@hey-api\/client-ofetch|ofetch/i, evidence: "ofetch runtime evidence was detected." },
    { signal: "next", pattern: /@hey-api\/client-next|Next client|client-next/i, evidence: "Next client runtime evidence was detected." },
    { signal: "nuxt", pattern: /@hey-api\/client-nuxt|Nuxt module|client-nuxt/i, evidence: "Nuxt client runtime evidence was detected." },
    { signal: "react-query", pattern: /react-query|@tanstack\/react-query|useQuery|useMutation/i, evidence: "React Query evidence was detected." },
    { signal: "swr", pattern: /\bswr\b|useSWR/i, evidence: "SWR evidence was detected." },
    { signal: "angular", pattern: /angular|HttpClient|typescript-angular/i, evidence: "Angular client evidence was detected." },
    { signal: "vue", pattern: /vue-query|@tanstack\/vue-query|Vue/i, evidence: "Vue Query evidence was detected." },
    { signal: "svelte", pattern: /svelte-query|Svelte/i, evidence: "Svelte Query evidence was detected." },
    { signal: "hono", pattern: /\bhono\b|Hono/i, evidence: "Hono evidence was detected." },
    { signal: "mcp", pattern: /\bmcp\b|Model Context Protocol/i, evidence: "MCP output evidence was detected." },
    { signal: "interceptors", pattern: /interceptors|createInterceptors|request\.fns|response\.fns|error\.fns/i, evidence: "client interceptor evidence was detected." },
    { signal: "custom-client", pattern: /custom-client|packages\/custom-client|createClient\s*=\s*\(config|Auth\b|baseUrl/i, evidence: "custom client runtime evidence was detected." },
    { signal: "custom-mutator", pattern: /mutator|custom client|customClient|interceptor|headers|auth/i, evidence: "custom mutator/client evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function openApiClientReadinessClientTargetSignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["clientTargetSignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["clientTargetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "models", pattern: /\bmodels?\b|generate models|modelPackage/i, evidence: "model generation target evidence was detected." },
    { signal: "requests", pattern: /\brequests?\b|generate requests|operationId|request functions?/i, evidence: "request generation target evidence was detected." },
    { signal: "react", pattern: /\bReact\b|react app|client\s*:\s*['"]react['"]/i, evidence: "React client target evidence was detected." },
    { signal: "react-query", pattern: /react-query|@tanstack\/react-query|useQuery|useMutation/i, evidence: "React Query client target evidence was detected." },
    { signal: "preact-query", pattern: /preact[- ]query|@tanstack\/preact-query/i, evidence: "Preact Query client target evidence was detected." },
    { signal: "swr", pattern: /\bswr\b|useSWR/i, evidence: "SWR client target evidence was detected." },
    { signal: "pinia-colada", pattern: /pinia[- ]colada|@pinia\/colada/i, evidence: "Pinia Colada client target evidence was detected." },
    { signal: "vue-query", pattern: /vue[- ]query|@tanstack\/vue-query/i, evidence: "Vue Query client target evidence was detected." },
    { signal: "svelte-query", pattern: /svelte[- ]query|@tanstack\/svelte-query/i, evidence: "Svelte Query client target evidence was detected." },
    { signal: "solid-query", pattern: /solid[- ]query|@tanstack\/solid-query/i, evidence: "Solid Query client target evidence was detected." },
    { signal: "solid-start", pattern: /solidstart|solid start|solid-start/i, evidence: "SolidStart client target evidence was detected." },
    { signal: "angular", pattern: /\bAngular\b|HttpClient|typescript-angular/i, evidence: "Angular client target evidence was detected." },
    { signal: "angular-query", pattern: /angular[- ]query|@tanstack\/angular-query/i, evidence: "Angular Query client target evidence was detected." },
    { signal: "hono", pattern: /\bHono\b|\bhono\b/i, evidence: "Hono client target evidence was detected." },
    { signal: "fastify", pattern: /\bFastify\b|\bfastify\b/i, evidence: "Fastify client/server target evidence was detected." },
    { signal: "nestjs", pattern: /\bNestJS\b|\bnestjs\b|typescript-nestjs/i, evidence: "NestJS target evidence was detected." },
    { signal: "orpc", pattern: /\borpc\b|oRPC/i, evidence: "oRPC target evidence was detected." },
    { signal: "zod", pattern: /\bzod\b|zod schemas?|zodios/i, evidence: "Zod generation target evidence was detected." },
    { signal: "valibot", pattern: /\bvalibot\b|Valibot/i, evidence: "Valibot generation target evidence was detected." },
    { signal: "arktype", pattern: /\barktype\b|Arktype/i, evidence: "Arktype generation target evidence was detected." },
    { signal: "transformers", pattern: /@hey-api\/transformers|ExpressionTransformer|TypeTransformer|transformers/i, evidence: "transformer target evidence was detected." },
    { signal: "effect", pattern: /\bEffect\b|effect.website|effect client|client\s*:\s*['"]effect['"]/i, evidence: "Effect client target evidence was detected." },
    { signal: "native-fetch", pattern: /native fetch|client\s*:\s*['"]fetch['"]|fetch\s*\(/i, evidence: "native fetch target evidence was detected." },
    { signal: "mcp-server", pattern: /\bmcp\b|Model Context Protocol|mcp server/i, evidence: "MCP server target evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "client target", "signal");
}

function openApiClientReadinessGenerationWorkflowSignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["generationWorkflowSignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["generationWorkflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "update-samples", pattern: /update-samples|regenerate sample outputs?/i, evidence: "sample regeneration evidence was detected." },
    { signal: "test-samples", pattern: /test:samples|tests? in the samples directory/i, evidence: "sample test evidence was detected." },
    { signal: "snapshot-tests", pattern: /test:snapshots|snapshot tests?|committed snapshots/i, evidence: "snapshot test evidence was detected." },
    { signal: "snapshot-update", pattern: /test:snapshots:update|snapshots:update|update the snapshots/i, evidence: "snapshot update evidence was detected." },
    { signal: "cli-type-validation", pattern: /test:cli|valid TypeScript|typecheck|tsc --noEmit/i, evidence: "generated TypeScript validation workflow evidence was detected." },
    { signal: "generated-output", pattern: /generated output|generated files?|do not edit|regenerate|generated sample code/i, evidence: "generated output workflow evidence was detected." },
    { signal: "vite-plugin", pattern: /vite-plugin|heyApiPlugin|Vite plugin/i, evidence: "Vite-integrated generation evidence was detected." },
    { signal: "nuxt-module", pattern: /Nuxt module|defineNuxtModule|@hey-api\/nuxt/i, evidence: "Nuxt-integrated generation evidence was detected." },
    { signal: "watch-mode", pattern: /\bwatch\s*:\s*(true|false)|--watch|watch mode/i, evidence: "watch-mode generation evidence was detected." },
    { signal: "multi-output", pattern: /outputs?|Promise\.all\(|output\s*:\s*\[|config\.output instanceof Array/i, evidence: "multi-output generation evidence was detected." },
    { signal: "reviewed-ai-output", pattern: /AI-generated output|reviewing what AI produces|cannot explain in your own words/i, evidence: "reviewed AI output warning evidence was detected." },
    { signal: "valid-openapi-v3", pattern: /OpenAPI v3|openapi:\s*3\.\d|valid OpenAPI/i, evidence: "OpenAPI v3 input evidence was detected." },
    { signal: "swagger-v2", pattern: /Swagger v2|swagger:\s*['"]?2\.\d|valid Swagger/i, evidence: "Swagger v2 input evidence was detected." },
    { signal: "yaml-json-spec", pattern: /\byaml\b|\bjson\b|\.ya?ml\b|\.json\b/i, evidence: "YAML/JSON spec format evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "generation workflow", "signal");
}

function openApiClientReadinessQualitySignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["qualitySignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "validate-spec", pattern: /openapi-generator validate|validate(?:Spec)?|redocly lint|swagger-parser/i, evidence: "spec validation evidence was detected." },
    { signal: "lint", pattern: /redocly lint|openapi.*lint|vacuum|speccy/i, evidence: "OpenAPI lint evidence was detected." },
    { signal: "snapshots", pattern: /snapshot|test:snapshots|snapshots:update/i, evidence: "generated snapshot evidence was detected." },
    { signal: "generated-diff", pattern: /generated diff|git diff.*generated|do not edit|update-samples|regenerate/i, evidence: "generated output drift evidence was detected." },
    { signal: "typecheck", pattern: /tsc --noEmit|typecheck|test:cli|valid TypeScript/i, evidence: "generated TypeScript validation evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|CI|pull_request|workflow_dispatch/i, evidence: "CI evidence was detected." },
    { signal: "ignore-file", pattern: /\.openapi-generator-ignore|openapi-generator-ignore/i, evidence: "OpenAPI generator ignore evidence was detected." },
    { signal: "templates", pattern: /templateDir|custom template|mustache|handlebars/i, evidence: "custom template evidence was detected." },
    { signal: "plugin-config", pattern: /plugins\s*:|defaultPlugins|clientPluginHandler|plugin registry/i, evidence: "plugin configuration evidence was detected." },
    { signal: "input-error", pattern: /getInputError|input error|invalid input|inaccessible input/i, evidence: "input error handling evidence was detected." },
    { signal: "security-review", pattern: /untrusted source|code injection|review.*input|security issue|template.*review/i, evidence: "generator input/template security review evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "quality", "signal");
}

function openApiClientReadinessPackageSignals(sourceFiles: OpenApiClientSourceFile[]): OpenApiClientReadinessReport["packageSignals"] {
  const specs: Array<{ signal: OpenApiClientReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "openapi-typescript", pattern: /"openapi-typescript"|openapi-typescript/i, evidence: "openapi-typescript package evidence was detected." },
    { signal: "openapi-fetch", pattern: /"openapi-fetch"|openapi-fetch/i, evidence: "openapi-fetch package evidence was detected." },
    { signal: "orval", pattern: /"orval"|orval/i, evidence: "Orval package evidence was detected." },
    { signal: "@openapitools/openapi-generator-cli", pattern: /"@openapitools\/openapi-generator-cli"|@openapitools\/openapi-generator-cli/i, evidence: "OpenAPI Generator npm package evidence was detected." },
    { signal: "openapi-generator-cli", pattern: /"openapi-generator-cli"|openapi-generator-cli/i, evidence: "OpenAPI Generator CLI package evidence was detected." },
    { signal: "swagger-codegen", pattern: /"swagger-codegen"|swagger-codegen/i, evidence: "Swagger Codegen package evidence was detected." },
    { signal: "@hey-api/openapi-ts", pattern: /"@hey-api\/openapi-ts"|@hey-api\/openapi-ts/i, evidence: "Hey API OpenAPI TS package evidence was detected." },
    { signal: "@hey-api/client-fetch", pattern: /"@hey-api\/client-fetch"|@hey-api\/client-fetch/i, evidence: "Hey API fetch client package evidence was detected." },
    { signal: "@hey-api/client-axios", pattern: /"@hey-api\/client-axios"|@hey-api\/client-axios/i, evidence: "Hey API axios client package evidence was detected." },
    { signal: "@hey-api/client-ky", pattern: /"@hey-api\/client-ky"|@hey-api\/client-ky/i, evidence: "Hey API Ky client package evidence was detected." },
    { signal: "@hey-api/client-next", pattern: /"@hey-api\/client-next"|@hey-api\/client-next/i, evidence: "Hey API Next client package evidence was detected." },
    { signal: "@hey-api/client-nuxt", pattern: /"@hey-api\/client-nuxt"|@hey-api\/client-nuxt/i, evidence: "Hey API Nuxt client package evidence was detected." },
    { signal: "@hey-api/client-ofetch", pattern: /"@hey-api\/client-ofetch"|@hey-api\/client-ofetch/i, evidence: "Hey API ofetch client package evidence was detected." },
    { signal: "@hey-api/sdk", pattern: /"@hey-api\/sdk"|@hey-api\/sdk/i, evidence: "Hey API SDK plugin evidence was detected." },
    { signal: "@hey-api/schemas", pattern: /"@hey-api\/schemas"|@hey-api\/schemas/i, evidence: "Hey API schemas plugin evidence was detected." },
    { signal: "@hey-api/transformers", pattern: /"@hey-api\/transformers"|@hey-api\/transformers/i, evidence: "Hey API transformers package evidence was detected." },
    { signal: "@hey-api/typescript", pattern: /"@hey-api\/typescript"|@hey-api\/typescript/i, evidence: "Hey API TypeScript plugin evidence was detected." },
    { signal: "@tanstack/preact-query", pattern: /"@tanstack\/preact-query"|@tanstack\/preact-query/i, evidence: "TanStack Preact Query package evidence was detected." },
    { signal: "@pinia/colada", pattern: /"@pinia\/colada"|@pinia\/colada/i, evidence: "Pinia Colada package evidence was detected." },
    { signal: "valibot", pattern: /"valibot"|\bvalibot\b/i, evidence: "Valibot package evidence was detected." },
    { signal: "arktype", pattern: /"arktype"|\barktype\b/i, evidence: "Arktype package evidence was detected." }
  ];
  return openApiClientSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function openApiClientSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: OpenApiClientSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/openapi-client-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildWebhookReadinessReport(walk: WalkResult): Promise<WebhookReadinessReport> {
  const sourceFiles = await webhookReadinessSourceFiles(walk);
  const webhookSetups = webhookReadinessSetups(sourceFiles);
  const endpointSignals = webhookReadinessEndpointSignals(sourceFiles);
  const signatureSignals = webhookReadinessSignatureSignals(sourceFiles);
  const verificationSignals = webhookReadinessVerificationSignals(sourceFiles);
  const reliabilitySignals = webhookReadinessReliabilitySignals(sourceFiles);
  const operationsSignals = webhookReadinessOperationsSignals(sourceFiles);
  const packageSignals = webhookReadinessPackageSignals(sourceFiles);

  const hasEndpoint = endpointSignals.some((item) => item.readiness === "ready") || webhookSetups.some((item) => item.endpointCount > 0);
  const hasSignature = signatureSignals.some((item) => ["webhook-signature", "hmac", "ed25519", "raw-body"].includes(item.signal) && item.readiness === "ready") || webhookSetups.some((item) => item.signatureCount > 0);
  const hasVerificationContract = verificationSignals.some((item) => ["signed-content", "metadata-binding", "versioned-signature", "timestamp-tolerance", "required-headers"].includes(item.signal) && item.readiness === "ready");
  const hasReplayControl = signatureSignals.some((item) => ["webhook-timestamp", "webhook-id"].includes(item.signal) && item.readiness === "ready")
    || reliabilitySignals.some((item) => ["idempotency", "dedupe-store"].includes(item.signal) && item.readiness === "ready")
    || webhookSetups.some((item) => item.replayCount + item.idempotencyCount > 0);
  const hasReliability = reliabilitySignals.some((item) => ["retry", "delivery-attempt", "manual-replay"].includes(item.signal) && item.readiness === "ready") || webhookSetups.some((item) => item.retryCount + item.deliveryCount > 0);
  const hasOps = operationsSignals.some((item) => item.readiness === "ready") || webhookSetups.some((item) => item.localDebugCount + item.observabilityCount > 0);

  const riskQueue: WebhookReadinessReport["riskQueue"] = [];
  if (!hasEndpoint) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document webhook endpoint/source/destination routing before claiming webhook readiness.",
      why: "Webhook readiness starts from a concrete receiver or sender endpoint, plus source/destination routing and event filters.",
      relatedHref: "html/webhook-readiness.html"
    });
  }
  if (hasEndpoint && !hasSignature) {
    riskQueue.push({
      priority: "high",
      action: "Verify webhook signatures against the raw request body before parsing or mutating payload JSON.",
      why: "Webhook authenticity depends on signing the exact payload and metadata; parsing then reserializing JSON can break verification.",
      relatedHref: "html/webhook-readiness.html"
    });
  }
  if (hasSignature && !hasVerificationContract) {
    riskQueue.push({
      priority: "high",
      action: "Document the exact Standard Webhooks verification contract before accepting signed webhooks.",
      why: "Secure verification needs a stable signed content string, signed metadata binding, versioned signatures, required headers, and timestamp tolerance; detecting only a signature header is not enough.",
      relatedHref: "html/webhook-readiness.html"
    });
  }
  if (hasSignature && !hasReplayControl) {
    riskQueue.push({
      priority: "high",
      action: "Add timestamp tolerance and idempotency/dedupe storage for replay and duplicate delivery protection.",
      why: "Retries and malicious replays can deliver the same event more than once; webhook-id and timestamp metadata should gate processing.",
      relatedHref: "html/webhook-readiness.html"
    });
  }
  if (hasEndpoint && !hasReliability) {
    riskQueue.push({
      priority: "medium",
      action: "Document retry/backoff, delivery attempts, replay, or dead-letter behavior around webhook failures.",
      why: "Webhook delivery is unreliable by default; producers and buffers need visible retry and recovery controls.",
      relatedHref: "html/webhook-readiness.html"
    });
  }
  if (hasReliability && !hasOps) {
    riskQueue.push({
      priority: "low",
      action: "Add event history, request/attempt logs, dashboard links, metrics, alerts, or local listen tooling.",
      why: "Webhook failures are hard to debug unless requests, events, attempts, response codes, and replay controls are visible.",
      relatedHref: "html/webhook-readiness.html"
    });
  }

  return {
    summary: `Webhook readiness report: setup ${webhookSetups.length}개, endpoint signal ${endpointSignals.length}개, signature signal ${signatureSignals.length}개, verification signal ${verificationSignals.length}개, reliability signal ${reliabilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Webhook readiness Svix Standard Webhooks Hookdeck signature webhook-id webhook-timestamp webhook-signature HMAC ed25519 verification msg_id.timestamp.payload signed content versioned signature multiple signatures base64 secret required headers payload schema thin full payload payload size replay idempotency event types endpoints retry attempts delivery logs replay fan-out filtering source destination source auth destination auth transformations rate limit healthcheck localhost CLI Event Gateway MCP tools failures metrics SSRF proxy retry-after legacy migration telemetry opt-out bookmarks profiles",
    webhookSetups,
    endpointSignals,
    signatureSignals,
    verificationSignals,
    reliabilitySignals,
    operationsSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"webhook|svix|standardwebhooks|hookdeck|stripe.webhooks|@octokit/webhooks|hookdeck gateway|Event Gateway\" package.json src app docs", purpose: "Find webhook packages, receiver routes, sender integrations, local debug tooling, and gateway operations." },
      { command: "rg \"webhook-id|webhook-timestamp|webhook-signature|x-signature|timingSafeEqual|rawBody|constructEvent\" src app", purpose: "Trace raw-body signature verification, timestamp checks, and provider-specific headers." },
      { command: "rg \"msg_id.timestamp.payload|signed content|v1,|v1a,|space delimited|base64|missing.*header|invalid signature|JSON Schema|OpenAPI|AsyncAPI|thin payload|full payload|payload size|SSRF|retry-after|legacy\" src app docs", purpose: "Review Standard Webhooks verification inputs, versioned signatures, rotation, payload guidance, replay controls, and SSRF guidance." },
      { command: "rg \"idempotency|dedupe|retry|retry count|backoff|attempt|replay|dead.?letter|pause|queue depth|rate limit|dashboard|metrics|failure\" src app docs", purpose: "Check duplicate delivery protection, reliability controls, and failure visibility." },
      { command: "rg \"hookdeck gateway|MCP|hookdeck_connections|hookdeck_requests|hookdeck_attempts|profile|config.toml|bookmark|healthcheck|telemetry\" src app docs", purpose: "Map Hookdeck Event Gateway, MCP tools, local forwarding, config profiles, bookmarks, health checks, and telemetry controls." }
    ],
    learnerNextSteps: [
      "먼저 webhook endpoint/source/destination 경계를 찾고, 어떤 event type을 어떤 route가 받는지 확인하세요.",
      "Standard Webhooks 방식이면 msg_id.timestamp.payload signed content, required headers, versioned signatures, base64 key handling, timestamp tolerance를 한 흐름으로 추적하세요.",
      "Svix/Standard Webhooks 문맥에서는 symmetric/asymmetric key prefix, public-key trust list, raw body, payload size, retry-after, SSRF proxy/private subnet, legacy migration 신호를 함께 보세요.",
      "그 다음 raw body를 그대로 서명 검증에 쓰는지, timestamp tolerance와 webhook ID/idempotency 저장소가 있는지 확인하세요.",
      "retry/backoff, delivery attempts, replay, dead-letter, dashboard/log/metrics 경계를 찾아 장애 복구 흐름을 확인하세요.",
      "Hookdeck를 쓰는 경우 source, destination, connection, transformations, filters, Event Gateway, MCP tools, local forwarding, healthcheck, profile/config, telemetry opt-out을 분리해서 읽으세요.",
      "RepoTutor는 webhook을 수신하거나 전송하지 않습니다. 실제 검증은 신뢰된 환경에서 provider CLI나 local listener로 별도 실행하세요."
    ]
  };
}

type WebhookSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function webhookReadinessSourceFiles(walk: WalkResult): Promise<WebhookSourceFile[]> {
  const rows: WebhookSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!webhookInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!webhookPathSignal(file.relPath) && !webhookContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 160);
}

function webhookInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|hookdeck\.(json|ya?ml)|svix\.(json|ya?ml)|webhooks?\.(json|ya?ml|md))$/i.test(base)
    || /(^|\/)(webhooks?|events?|hookdeck|svix|stripe|github|receivers?|destinations?|sources?)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(json|ya?ml|ts|tsx|js|jsx|mjs|cjs|md|go|rs|py|rb|php)$/i.test(filePath);
}

function webhookPathSignal(filePath: string): boolean {
  return /(^|\/)(webhooks?|events?|hookdeck|svix|stripe|github|receivers?|destinations?|sources?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|hookdeck\.(json|ya?ml)|svix\.(json|ya?ml))$/i.test(path.basename(filePath));
}

function webhookContentSignal(text: string): boolean {
  return /(webhook|svix|standardwebhooks|hookdeck|stripe\.webhooks|@octokit\/webhooks|webhook-signature|webhook-timestamp|webhook-id|x-hub-signature|x-stripe-signature|msg_id\.timestamp\.payload|signed content|versioned signature|payload schema|thin payload|full payload|payload size|idempotency|delivery attempt|retry|replay|Event Gateway|hookdeck gateway|MCP|SSRF|retry-after|healthcheck|telemetry)/i.test(text);
}

function webhookReadinessSetups(sourceFiles: WebhookSourceFile[]): WebhookReadinessReport["webhookSetups"] {
  const rows: WebhookReadinessReport["webhookSetups"] = [];
  for (const source of sourceFiles) {
    const endpointCount = countMatches(source.text, /\b(webhook|endpoint|route|POST|app\.post|router\.post|NextRequest|source|destination|connection|fan.?out|event filter|source authentication|destination authentication|transformation|rate limit|healthcheck)\b/gi);
    const signatureCount = countMatches(source.text, /\b(webhook-signature|webhook-timestamp|webhook-id|x-stripe-signature|x-hub-signature|signature|HMAC|ed25519|timingSafeEqual|constructEvent|rawBody|raw body)\b/gi);
    const replayCount = countMatches(source.text, /\b(replay|timestamp tolerance|clock skew|webhook-timestamp|duplicate|same event|once)\b/gi);
    const idempotencyCount = countMatches(source.text, /\b(idempotency|idempotency-key|webhook-id|dedupe|dedup|setnx|Redis|processed_events|event_id)\b/gi);
    const retryCount = countMatches(source.text, /\b(retry|retries|retry schedule|backoff|exponential|jitter|rate limit|throttle|queue)\b/gi);
    const deliveryCount = countMatches(source.text, /\b(delivery|attempt|attempts|2xx|status code|timeout|request log|event log|dead.?letter|DLQ|retry-after|queue depth|exhausted|pause connection)\b/gi);
    const eventTypeCount = countMatches(source.text, /\b(event type|eventTypes|event_types|type:|invoice\.paid|user\.created|filter|subscription|webhooks|x-webhooks)\b/gi);
    const localDebugCount = countMatches(source.text, /\b(hookdeck listen|svix listen|listen localhost|localhost|forward|CLI|tunnel|ngrok|local development|local forwarding)\b/gi);
    const observabilityCount = countMatches(source.text, /\b(dashboard|event history|logs|metrics|failure rate|issues|alerts|inspect|MCP|Event Gateway|hookdeck gateway|attempt log|request log|bookmark|healthcheck|telemetry|profile)\b/gi);
    const securityCount = countMatches(source.text, /\b(SSRF|proxy|private subnet|https|allowlist|static IP|secret rotation|rotation|asymmetric|trust list|constant time|timing attack|raw body|untrusted)\b/gi);
    const totalSignals = endpointCount + signatureCount + replayCount + idempotencyCount + retryCount + deliveryCount + eventTypeCount + localDebugCount + observabilityCount + securityCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      provider: webhookProvider(source),
      endpointCount,
      signatureCount,
      replayCount,
      idempotencyCount,
      retryCount,
      deliveryCount,
      eventTypeCount,
      localDebugCount,
      observabilityCount,
      securityCount,
      readiness: endpointCount > 0 && signatureCount > 0 && (idempotencyCount + replayCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} webhook readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.endpointCount + b.signatureCount + b.retryCount + b.observabilityCount) - (a.endpointCount + a.signatureCount + a.retryCount + a.observabilityCount))
    .slice(0, 45);
}

function webhookProvider(source: WebhookSourceFile): WebhookReadinessReport["webhookSetups"][number]["provider"] {
  if (/hookdeck/i.test(source.filePath) || /hookdeck|Event Gateway|hookdeck_connections|hookdeck_requests|HOOKDECK_CONFIG_FILE/i.test(source.text)) return "hookdeck";
  if (/svix/i.test(source.filePath) || /svix|whsec_|whsk_|whpk_/i.test(source.text)) return "svix";
  if (/standardwebhooks|Standard Webhooks|webhook-id|webhook-timestamp|webhook-signature/i.test(source.text)) return "standard-webhooks";
  if (/stripe/i.test(source.filePath) || /stripe\.webhooks|x-stripe-signature/i.test(source.text)) return "stripe";
  if (/github/i.test(source.filePath) || /@octokit\/webhooks|x-hub-signature|X-GitHub-Delivery/i.test(source.text)) return "github";
  if (/webhook|event|endpoint/i.test(source.filePath) || /webhook|event|endpoint/i.test(source.text)) return "custom";
  return "unknown";
}

function webhookReadinessEndpointSignals(sourceFiles: WebhookSourceFile[]): WebhookReadinessReport["endpointSignals"] {
  const specs: Array<{ signal: WebhookReadinessReport["endpointSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "endpoint", pattern: /\bendpoint\b|webhook endpoint|endpoint_secret|endpointId/i, evidence: "webhook endpoint evidence was detected." },
    { signal: "route", pattern: /app\.post|router\.post|POST\s+\/|route\.ts|NextRequest|RequestHandler|webhooks?\/[A-Za-z0-9_-]+/i, evidence: "receiver route evidence was detected." },
    { signal: "source", pattern: /\bsource\b|source-alias|hookdeck gateway source|source-id/i, evidence: "webhook source evidence was detected." },
    { signal: "destination", pattern: /\bdestination\b|destination_id|hookdeck gateway destination|Forwards to/i, evidence: "webhook destination evidence was detected." },
    { signal: "connection", pattern: /\bconnection\b|hookdeck gateway connection|source.*destination/i, evidence: "source/destination connection evidence was detected." },
    { signal: "fan-out", pattern: /fan.?out|multiple destinations|multiple endpoints|2 connections|3 connections/i, evidence: "fan-out or multiple destination evidence was detected." },
    { signal: "event-filter", pattern: /eventTypes|event types|filter-body|filter-headers|filter-path|subscription|events? filter|invoice\.paid|user\.created/i, evidence: "event filtering evidence was detected." },
    { signal: "source-auth", pattern: /source authentication|source-webhook-secret|source auth|source secret|Verify webhooks from providers/i, evidence: "source authentication evidence was detected." },
    { signal: "destination-auth", pattern: /destination authentication|destination-bearer-token|destination-api-key|destination auth|basic authentication/i, evidence: "destination authentication evidence was detected." },
    { signal: "transformation", pattern: /transformation|transformations|addHandler\(["']transform|transform.*request/i, evidence: "webhook transformation evidence was detected." },
    { signal: "rate-limit", pattern: /rate limit|rate-limit|destination-rate-limit|Maximum messages per second/i, evidence: "webhook rate-limit evidence was detected." },
    { signal: "healthcheck", pattern: /healthcheck|health check|server health checks|--no-healthcheck/i, evidence: "local webhook healthcheck evidence was detected." },
    { signal: "https", pattern: /https:\/\/|HTTPS|ssl|tls|--insecure/i, evidence: "HTTPS/TLS endpoint evidence was detected." },
    { signal: "status-code", pattern: /2xx|200|4xx|5xx|status code|response code|410 Gone/i, evidence: "webhook response status handling evidence was detected." },
    { signal: "timeout", pattern: /timeout|15.*30s|request timeout|server health checks/i, evidence: "webhook timeout evidence was detected." }
  ];
  return webhookSignalFromSpecs(sourceFiles, specs, "endpoint", "signal");
}

function webhookReadinessSignatureSignals(sourceFiles: WebhookSourceFile[]): WebhookReadinessReport["signatureSignals"] {
  const specs: Array<{ signal: WebhookReadinessReport["signatureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "webhook-id", pattern: /webhook-id|X-GitHub-Delivery|message id|msg_id|event_id/i, evidence: "webhook ID evidence was detected." },
    { signal: "webhook-timestamp", pattern: /webhook-timestamp|timestamp tolerance|timestamp.*replay|attempt.*timestamp/i, evidence: "webhook timestamp evidence was detected." },
    { signal: "webhook-signature", pattern: /webhook-signature|x-stripe-signature|x-hub-signature|svix-signature|signature header/i, evidence: "webhook signature header evidence was detected." },
    { signal: "hmac", pattern: /HMAC|sha256|createHmac|hmac_sha256|v1,/i, evidence: "HMAC evidence was detected." },
    { signal: "ed25519", pattern: /ed25519|v1a|asymmetric signature/i, evidence: "ed25519/asymmetric signature evidence was detected." },
    { signal: "secret-prefix", pattern: /whsec_|whsk_|whpk_|endpoint secret|signing secret/i, evidence: "typed signing secret evidence was detected." },
    { signal: "public-key", pattern: /public key|whpk_|trust list/i, evidence: "public key evidence was detected." },
    { signal: "private-key", pattern: /private key|whsk_/i, evidence: "private key evidence was detected." },
    { signal: "trust-list", pattern: /trust list|trusted public keys|untrusted public keys|Do not blindly trust/i, evidence: "public-key trust-list evidence was detected." },
    { signal: "constant-time", pattern: /timingSafeEqual|constant time|timing attack/i, evidence: "constant-time comparison evidence was detected." },
    { signal: "raw-body", pattern: /rawBody|raw body|raw request body|text\(\)|arrayBuffer\(\)|bodyParser\.raw|parse.*json.*signature/i, evidence: "raw body verification evidence was detected." },
    { signal: "rotation", pattern: /rotation|old key|multiple keys|zero downtime secret rotation|secret rotation/i, evidence: "secret rotation evidence was detected." },
    { signal: "asymmetric", pattern: /asymmetric|public key|private key|whpk_|whsk_/i, evidence: "asymmetric verification evidence was detected." }
  ];
  return webhookSignalFromSpecs(sourceFiles, specs, "signature", "signal");
}

function webhookReadinessVerificationSignals(sourceFiles: WebhookSourceFile[]): WebhookReadinessReport["verificationSignals"] {
  const specs: Array<{ signal: WebhookReadinessReport["verificationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "signed-content", pattern: /msg_id\.timestamp\.payload|signed content|content to be signed|`\$\{id\}\.\$\{timestamp\}\.\$\{rawBody\}`|id\}\.\$\{timestamp\}\.\$\{rawBody/i, evidence: "Standard Webhooks signed content evidence was detected." },
    { signal: "metadata-binding", pattern: /sign both.*(body|payload).*metadata|metadata.*timestamp.*unique identifier|webhook-id.*webhook-timestamp.*webhook-signature|id.*timestamp.*body/i, evidence: "metadata binding evidence was detected." },
    { signal: "versioned-signature", pattern: /\bv1a?,|signature identifier|version identifier|versioned signature/i, evidence: "versioned signature evidence was detected." },
    { signal: "multi-signature", pattern: /space delimited|multiple signatures|multiple keys|try each signature|old key|zero downtime secret rotation|signed both using the current key/i, evidence: "multi-signature or rotation evidence was detected." },
    { signal: "base64-secret", pattern: /base64|Buffer\.from\([^)]*base64|whsec_|whsk_|whpk_/i, evidence: "base64 signing secret/key evidence was detected." },
    { signal: "timestamp-tolerance", pattern: /timestamp tolerance|allowable tolerance|recent enough|clock skew|current timestamp|Date\.now|save the IDs in redis for 5 minutes/i, evidence: "timestamp tolerance evidence was detected." },
    { signal: "required-headers", pattern: /webhook-id.*webhook-timestamp.*webhook-signature|missing.*header|required headers?|headers\[['"]webhook-id['"]|headers\.get\(['"]webhook-id['"]/i, evidence: "required webhook header evidence was detected." },
    { signal: "invalid-signature", pattern: /invalid signature|signature.*invalid|verification.*failed|WebhookVerificationError|throw new Error\([^)]*signature/i, evidence: "invalid signature handling evidence was detected." },
    { signal: "payload-schema", pattern: /JSON Schema|OpenAPI|AsyncAPI|payload schema|schema validation|event type.*schema/i, evidence: "payload schema guidance evidence was detected." },
    { signal: "thin-full-payload", pattern: /thin.*full payload|full payload|thin payload|thin vs full/i, evidence: "thin/full payload guidance evidence was detected." },
    { signal: "payload-size", pattern: /payload size|smaller than 20kb|20kb|keep the size of payloads small/i, evidence: "payload size guidance evidence was detected." },
    { signal: "retry-after", pattern: /retry-after|503 Service Unavailable/i, evidence: "retry-after handling evidence was detected." },
    { signal: "ssrf-protection", pattern: /SSRF|server-side request forgery|proxy.*internal IP|private subnet|smokescreen/i, evidence: "SSRF protection guidance evidence was detected." },
    { signal: "legacy-migration", pattern: /legacy webhook|migrate|migration|additional headers without removing existing headers/i, evidence: "legacy migration evidence was detected." },
    { signal: "api-gateway-verification", pattern: /API Gateway signature verification|signature verification.*API gateway/i, evidence: "API gateway verification evidence was detected." }
  ];
  return webhookSignalFromSpecs(sourceFiles, specs, "verification", "signal");
}

function webhookReadinessReliabilitySignals(sourceFiles: WebhookSourceFile[]): WebhookReadinessReport["reliabilitySignals"] {
  const specs: Array<{ signal: WebhookReadinessReport["reliabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "retry", pattern: /\bretry\b|retries|retry requests|retry events/i, evidence: "retry evidence was detected." },
    { signal: "retry-schedule", pattern: /retry schedule|spanning multiple days|retry_schedule/i, evidence: "retry schedule evidence was detected." },
    { signal: "retry-count", pattern: /retry count|rule-retry-count|svix-retry-count|retry-count/i, evidence: "retry count evidence was detected." },
    { signal: "backoff", pattern: /backoff|exponential/i, evidence: "backoff evidence was detected." },
    { signal: "jitter", pattern: /jitter|random/i, evidence: "retry jitter evidence was detected." },
    { signal: "delivery-attempt", pattern: /delivery attempt|attempts|attempt list|hookdeck gateway attempt|attempt log/i, evidence: "delivery attempt evidence was detected." },
    { signal: "manual-replay", pattern: /manual replay|replay specific|replayed|events can be replayed|replay requests/i, evidence: "manual replay evidence was detected." },
    { signal: "idempotency", pattern: /idempotency|idempotency-key|webhook-id.*idempotency/i, evidence: "idempotency evidence was detected." },
    { signal: "dedupe-store", pattern: /dedupe|dedup|Redis|setnx|processed_events|save the IDs/i, evidence: "dedupe store evidence was detected." },
    { signal: "disable-endpoint", pattern: /disable future delivery|disable.*endpoint|410 Gone|pause.*connection|disable.*connection/i, evidence: "endpoint disable/pause evidence was detected." },
    { signal: "pause-connection", pattern: /pause.*connection|unpause.*connection|hookdeck_connections.*pause/i, evidence: "connection pause evidence was detected." },
    { signal: "rate-limit", pattern: /rate limit|destination-rate-limit|rate-limited|throttle/i, evidence: "delivery rate-limit evidence was detected." },
    { signal: "retry-after", pattern: /retry-after|503 Service Unavailable/i, evidence: "retry-after retry evidence was detected." },
    { signal: "exhausted-event", pattern: /attempt\.exhausted|message\.attempt\.exhausted|all of the retry attempts have been exhausted/i, evidence: "exhausted delivery event evidence was detected." },
    { signal: "queue-depth", pattern: /queue depth|queued events|queues events|paused.*queues/i, evidence: "queue-depth/queued delivery evidence was detected." },
    { signal: "dead-letter", pattern: /dead.?letter|DLQ|failed queue|failure queue/i, evidence: "dead-letter/failure queue evidence was detected." }
  ];
  return webhookSignalFromSpecs(sourceFiles, specs, "reliability", "signal");
}

function webhookReadinessOperationsSignals(sourceFiles: WebhookSourceFile[]): WebhookReadinessReport["operationsSignals"] {
  const specs: Array<{ signal: WebhookReadinessReport["operationsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dashboard", pattern: /dashboard|Open dashboard|dashboard\.hookdeck|api\.svix/i, evidence: "dashboard evidence was detected." },
    { signal: "event-history", pattern: /event history|events can be replayed|history of all received events/i, evidence: "event history evidence was detected." },
    { signal: "request-log", pattern: /request log|request list|hookdeck_requests|raw inbound webhooks|Show data/i, evidence: "request log evidence was detected." },
    { signal: "attempt-log", pattern: /attempt log|hookdeck_attempts|delivery attempts|attempt details/i, evidence: "attempt log evidence was detected." },
    { signal: "failure-rate", pattern: /failure rate|error rate|failed_count|status FAILED/i, evidence: "failure-rate evidence was detected." },
    { signal: "metrics", pattern: /metrics|aggregate metrics|queue depth|counts/i, evidence: "webhook metrics evidence was detected." },
    { signal: "issues", pattern: /issues|open issues|delivery failures|transform errors|backpressure/i, evidence: "issue aggregation evidence was detected." },
    { signal: "alerts", pattern: /alerts|notify|email|outage|failure signals/i, evidence: "alert/notification evidence was detected." },
    { signal: "event-gateway", pattern: /Event Gateway|hookdeck gateway|gateway source|gateway destination|gateway connection/i, evidence: "Hookdeck Event Gateway evidence was detected." },
    { signal: "mcp", pattern: /\bMCP\b|Model Context Protocol|hookdeck gateway mcp/i, evidence: "MCP investigation evidence was detected." },
    { signal: "mcp-tools", pattern: /hookdeck_connections|hookdeck_sources|hookdeck_destinations|hookdeck_requests|hookdeck_events|hookdeck_attempts|hookdeck_metrics/i, evidence: "Hookdeck MCP tool evidence was detected." },
    { signal: "cli-listen", pattern: /hookdeck listen|svix listen|listen 3000|localhost|forward.*events/i, evidence: "local CLI listener evidence was detected." },
    { signal: "local-forward", pattern: /forward.*localhost|Forwards to|local forwarding|port-or-URL|http:\/\/localhost/i, evidence: "local forwarding evidence was detected." },
    { signal: "config-profile", pattern: /config\.toml|profile|HOOKDECK_CONFIG_FILE|XDG_CONFIG_HOME/i, evidence: "Hookdeck config/profile evidence was detected." },
    { signal: "bookmark", pattern: /bookmark|bookmarked|saved at any time/i, evidence: "event bookmark/save evidence was detected." },
    { signal: "healthcheck", pattern: /healthcheck|health checks|--no-healthcheck/i, evidence: "healthcheck evidence was detected." },
    { signal: "telemetry-opt-out", pattern: /telemetry|TELEMETRY_DISABLED|opt out/i, evidence: "telemetry opt-out evidence was detected." }
  ];
  return webhookSignalFromSpecs(sourceFiles, specs, "operations", "signal");
}

function webhookReadinessPackageSignals(sourceFiles: WebhookSourceFile[]): WebhookReadinessReport["packageSignals"] {
  const specs: Array<{ signal: WebhookReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "svix", pattern: /"svix"|svix-webhooks|svix\b/i, evidence: "Svix package evidence was detected." },
    { signal: "standardwebhooks", pattern: /"standardwebhooks"|standard-webhooks|standardwebhooks\b/i, evidence: "Standard Webhooks package evidence was detected." },
    { signal: "standard-webhooks-spec", pattern: /Standard Webhooks specification|standard-webhooks\.md|msg_id\.timestamp\.payload/i, evidence: "Standard Webhooks specification evidence was detected." },
    { signal: "hookdeck-cli", pattern: /"hookdeck-cli"|hookdeck-cli|hookdeck listen|hookdeck gateway/i, evidence: "Hookdeck CLI evidence was detected." },
    { signal: "hookdeck-gateway", pattern: /hookdeck gateway|Event Gateway|hookdeck_connections|hookdeck_requests/i, evidence: "Hookdeck Event Gateway evidence was detected." },
    { signal: "stripe", pattern: /"stripe"|stripe\.webhooks|constructEvent|x-stripe-signature/i, evidence: "Stripe webhook package evidence was detected." },
    { signal: "@octokit/webhooks", pattern: /"@octokit\/webhooks"|@octokit\/webhooks|X-GitHub-Delivery/i, evidence: "Octokit webhook package evidence was detected." },
    { signal: "express", pattern: /"express"|app\.post|express\.raw|bodyParser\.raw/i, evidence: "Express receiver evidence was detected." },
    { signal: "next-server", pattern: /NextRequest|next\/server|route\.ts|export async function POST/i, evidence: "Next.js route handler evidence was detected." }
  ];
  return webhookSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function webhookSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: WebhookSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/webhook-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildNotificationReadinessReport(walk: WalkResult): Promise<NotificationReadinessReport> {
  const sourceFiles = await notificationReadinessSourceFiles(walk);
  const notificationSetups = notificationReadinessSetups(sourceFiles);
  const workflowSignals = notificationReadinessWorkflowSignals(sourceFiles);
  const audienceSignals = notificationReadinessAudienceSignals(sourceFiles);
  const channelSignals = notificationReadinessChannelSignals(sourceFiles);
  const templateSignals = notificationReadinessTemplateSignals(sourceFiles);
  const operationsSignals = notificationReadinessOperationsSignals(sourceFiles);
  const packageSignals = notificationReadinessPackageSignals(sourceFiles);

  const hasWorkflow = workflowSignals.some((item) => ["workflow", "trigger"].includes(item.signal) && item.readiness === "ready") || notificationSetups.some((item) => item.workflowCount + item.triggerCount > 0);
  const hasAudience = audienceSignals.some((item) => ["subscriber", "subscriber-id", "topic", "subscription"].includes(item.signal) && item.readiness === "ready") || notificationSetups.some((item) => item.subscriberCount + item.topicCount > 0);
  const hasChannel = channelSignals.some((item) => item.readiness === "ready") || notificationSetups.some((item) => item.channelCount + item.inboxCount > 0);
  const hasPreferences = audienceSignals.some((item) => item.signal === "preferences" && item.readiness === "ready") || notificationSetups.some((item) => item.preferenceCount > 0);
  const hasOperations = operationsSignals.some((item) => ["api-key", "environment", "delivery-log", "retry", "dashboard"].includes(item.signal) && item.readiness === "ready") || notificationSetups.some((item) => item.credentialCount + item.observabilityCount > 0);

  const riskQueue: NotificationReadinessReport["riskQueue"] = [];
  if (!hasWorkflow) {
    riskQueue.push({
      priority: "high",
      action: "Add or document notification workflows and triggers before claiming notification readiness.",
      why: "Product notifications need a workflow contract that connects trigger payloads to channel delivery.",
      relatedHref: "html/notification-readiness.html"
    });
  }
  if (hasWorkflow && !hasAudience) {
    riskQueue.push({
      priority: "high",
      action: "Model subscribers, subscriber IDs, topics, or subscriptions for notification targeting.",
      why: "A workflow without an audience model cannot prove who receives the notification or how fan-out is controlled.",
      relatedHref: "html/notification-readiness.html"
    });
  }
  if (hasAudience && !hasChannel) {
    riskQueue.push({
      priority: "medium",
      action: "Connect notification workflows to explicit channels such as inbox, email, SMS, push, chat, Slack, or Teams.",
      why: "Novu-style readiness depends on a unified workflow that still maps to concrete delivery channels.",
      relatedHref: "html/notification-readiness.html"
    });
  }
  if (hasChannel && !hasPreferences) {
    riskQueue.push({
      priority: "medium",
      action: "Add user preferences, subscription controls, or per-channel opt-out documentation.",
      why: "Multi-channel notifications can become noisy or non-compliant when users cannot control them.",
      relatedHref: "html/notification-readiness.html"
    });
  }
  if (hasChannel && !hasOperations) {
    riskQueue.push({
      priority: "low",
      action: "Document notification API keys, environments, delivery logs, retries, analytics, and dashboard ownership.",
      why: "Delivery issues are hard to debug unless operators can trace attempts, failures, credentials, and provider state.",
      relatedHref: "html/notification-readiness.html"
    });
  }

  return {
    summary: `Notification readiness report: setup ${notificationSetups.length}개, workflow signal ${workflowSignals.length}개, audience signal ${audienceSignals.length}개, channel signal ${channelSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Notification readiness Novu workflows trigger subscriberId subscribers topics subscriptions preferences Inbox email SMS push chat Slack Teams Telegram WhatsApp digest delay conditions payload tenant templates variables API key delivery logs retries dashboard analytics",
    notificationSetups,
    workflowSignals,
    audienceSignals,
    channelSignals,
    templateSignals,
    operationsSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"@novu|Novu|workflow|trigger|subscriberId|topic|preferences|Inbox\" package.json src app docs", purpose: "Find notification SDKs, workflows, subscriber targeting, topics, preferences, and inbox integrations." },
      { command: "rg \"email|sms|push|chat|slack|teams|telegram|whatsapp|digest|delay|condition\" src app docs", purpose: "Trace delivery channels and workflow control steps." },
      { command: "rg \"NOVU|api.?key|delivery|activity|retry|dashboard|webhook|analytics|rate.?limit\" src app docs .env.example", purpose: "Check credentials, environment setup, delivery operations, retry visibility, and provider dashboards." }
    ],
    learnerNextSteps: [
      "먼저 notification workflow와 trigger payload가 어디서 정의되는지 찾으세요.",
      "subscriberId, subscriber profile, topic, subscription, preference가 workflow와 연결되는지 확인하세요.",
      "Inbox/email/SMS/push/chat 같은 채널과 template variable이 실제 사용자 경험까지 이어지는지 보세요.",
      "RepoTutor는 알림을 보내거나 provider API를 호출하지 않습니다. 실제 delivery는 원본 repo에서 provider sandbox나 staging 환경으로 검증하세요."
    ]
  };
}

type NotificationSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function notificationReadinessSourceFiles(walk: WalkResult): Promise<NotificationSourceFile[]> {
  const rows: NotificationSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!notificationInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!notificationPathSignal(file.relPath) && !notificationContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 160);
}

function notificationInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|novu\.(json|ya?ml)|notifications?\.(json|ya?ml|md)|preferences?\.(json|ya?ml|md))$/i.test(base)
    || /(^|\/)(notifications?|novu|inbox|subscribers?|topics?|preferences?|workflows?|messages?|push|sms|chat|slack|teams|telegram|whatsapp)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(json|ya?ml|ts|tsx|js|jsx|mjs|cjs|md|go|rs|py|rb|php)$/i.test(filePath);
}

function notificationPathSignal(filePath: string): boolean {
  return /(^|\/)(notifications?|novu|inbox|subscribers?|topics?|preferences?|workflows?|messages?|push|sms|chat|slack|teams|telegram|whatsapp)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|novu\.(json|ya?ml)|notifications?\.(json|ya?ml|md))$/i.test(path.basename(filePath));
}

function notificationContentSignal(text: string): boolean {
  return /(@novu\/|Novu|notification workflow|notification center|<Inbox|subscriberId|subscribers?\.|topics?\.|preferences?|digest|in-app|push notification|SMS|Slack|Microsoft Teams|Telegram|WhatsApp|delivery logs?)/i.test(text);
}

function notificationReadinessSetups(sourceFiles: NotificationSourceFile[]): NotificationReadinessReport["notificationSetups"] {
  const rows: NotificationReadinessReport["notificationSetups"] = [];
  for (const source of sourceFiles) {
    const workflowCount = countMatches(source.text, /\b(workflow|workflows|notification workflow|defineWorkflow|workflowId|step\.)\b/gi);
    const triggerCount = countMatches(source.text, /\b(trigger|triggers|novu\.trigger|events?\.trigger|send notification|sendNotification)\b/gi);
    const subscriberCount = countMatches(source.text, /\b(subscriber|subscribers|subscriberId|subscriber_id|identify|user profile|profile)\b/gi);
    const topicCount = countMatches(source.text, /\b(topic|topics|subscription|subscriptions|createSubscription|removeSubscription|fan.?out|broadcast|segment)\b/gi);
    const preferenceCount = countMatches(source.text, /\b(preference|preferences|PreferenceLevel|opt.?in|opt.?out|unsubscribe|subscription controls|digest preference)\b/gi);
    const channelCount = countMatches(source.text, /\b(email|sms|push|chat|slack|teams|microsoft teams|telegram|whatsapp|discord|channel|channels|provider integrations)\b/gi);
    const inboxCount = countMatches(source.text, /\b(inbox|in-app|notification center|<Inbox|NovuProvider|useNovu|notification feed)\b/gi);
    const templateCount = countMatches(source.text, /\b(template|templates|subject|body|content|editor|variables|payload|localization|branding|preview)\b/gi);
    const credentialCount = countMatches(source.text, /\b(NOVU|api.?key|secret|environment|endpoint|baseURL|applicationIdentifier|subscriberHash|tenant)\b/gi);
    const observabilityCount = countMatches(source.text, /\b(delivery|activity feed|delivery log|logs|retry|retries|analytics|dashboard|rate limit|webhook|status|failure)\b/gi);
    const totalSignals = workflowCount + triggerCount + subscriberCount + topicCount + preferenceCount + channelCount + inboxCount + templateCount + credentialCount + observabilityCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      provider: notificationProvider(source),
      workflowCount,
      triggerCount,
      subscriberCount,
      topicCount,
      preferenceCount,
      channelCount,
      inboxCount,
      templateCount,
      credentialCount,
      observabilityCount,
      readiness: workflowCount > 0 && triggerCount > 0 && subscriberCount > 0 && (channelCount + inboxCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} notification readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.workflowCount + b.triggerCount + b.subscriberCount + b.channelCount + b.inboxCount) - (a.workflowCount + a.triggerCount + a.subscriberCount + a.channelCount + a.inboxCount))
    .slice(0, 45);
}

function notificationProvider(source: NotificationSourceFile): NotificationReadinessReport["notificationSetups"][number]["provider"] {
  if (/novu/i.test(source.filePath) || /@novu\/|Novu|NOVU_/i.test(source.text)) return "novu";
  if (/knock/i.test(source.filePath) || /@knocklabs\/|Knock/i.test(source.text)) return "knock";
  if (/magicbell/i.test(source.filePath) || /@magicbell\/|MagicBell/i.test(source.text)) return "magicbell";
  if (/firebase/i.test(source.filePath) || /firebase-admin|fcm|messaging\(\)/i.test(source.text)) return "firebase";
  if (/onesignal/i.test(source.filePath) || /OneSignal|onesignal-node/i.test(source.text)) return "onesignal";
  if (/notification|inbox|subscriber|topic|preference/i.test(source.filePath) || /notification|inbox|subscriber|topic|preference/i.test(source.text)) return "custom";
  return "unknown";
}

function notificationReadinessWorkflowSignals(sourceFiles: NotificationSourceFile[]): NotificationReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: NotificationReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "workflow", pattern: /workflow|workflows|notification workflow|workflowId|defineWorkflow/i, evidence: "notification workflow evidence was detected." },
    { signal: "trigger", pattern: /trigger|novu\.trigger|sendNotification|send notification|events?\.trigger/i, evidence: "notification trigger evidence was detected." },
    { signal: "step", pattern: /step\.|steps|email step|sms step|inbox step|chat step/i, evidence: "workflow step evidence was detected." },
    { signal: "digest", pattern: /digest|batch|summary notification|group notifications/i, evidence: "digest/batching evidence was detected." },
    { signal: "delay", pattern: /delay|schedule|scheduled|wait|throttle/i, evidence: "delay/scheduling evidence was detected." },
    { signal: "condition", pattern: /condition|conditions|branch|if\s*\(|filter|rules/i, evidence: "workflow condition evidence was detected." },
    { signal: "payload", pattern: /payload|variables|template data|data payload|merge tags/i, evidence: "payload/template data evidence was detected." },
    { signal: "tenant", pattern: /tenant|tenantId|organization|workspace/i, evidence: "tenant/workspace scoping evidence was detected." },
    { signal: "conversation", pattern: /conversation|thread|reply|inbound message|agent communication/i, evidence: "conversation model evidence was detected." }
  ];
  return notificationSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function notificationReadinessAudienceSignals(sourceFiles: NotificationSourceFile[]): NotificationReadinessReport["audienceSignals"] {
  const specs: Array<{ signal: NotificationReadinessReport["audienceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "subscriber", pattern: /\bsubscriber\b|subscribers\.|Subscriber/i, evidence: "subscriber model evidence was detected." },
    { signal: "subscriber-id", pattern: /subscriberId|subscriber_id|to:\s*['"]|recipientId|userId/i, evidence: "subscriber ID evidence was detected." },
    { signal: "topic", pattern: /\btopic\b|topics\.|TopicSubscription/i, evidence: "topic evidence was detected." },
    { signal: "subscription", pattern: /subscription|subscriptions|createSubscription|removeSubscription|subscribe|unsubscribe/i, evidence: "subscription evidence was detected." },
    { signal: "preferences", pattern: /preferences?|PreferenceLevel|notification settings|opt.?in|opt.?out/i, evidence: "user preference evidence was detected." },
    { signal: "segments", pattern: /segment|segments|audience|cohort|group/i, evidence: "segment/audience evidence was detected." },
    { signal: "user-profile", pattern: /firstName|lastName|email|phone|avatar|profile|identify/i, evidence: "user profile evidence was detected." },
    { signal: "tenant", pattern: /tenant|tenantId|organizationId|workspaceId/i, evidence: "tenant audience evidence was detected." }
  ];
  return notificationSignalFromSpecs(sourceFiles, specs, "audience", "signal");
}

function notificationReadinessChannelSignals(sourceFiles: NotificationSourceFile[]): NotificationReadinessReport["channelSignals"] {
  const specs: Array<{ signal: NotificationReadinessReport["channelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "inbox", pattern: /Inbox|<Inbox|in-app|notification center|notification feed|NovuProvider/i, evidence: "inbox/in-app channel evidence was detected." },
    { signal: "email", pattern: /\bemail\b|mail|subject|from:|to:|EmailProvider/i, evidence: "email channel evidence was detected." },
    { signal: "sms", pattern: /\bsms\b|SMS|phone|twilio|SmsProvider/i, evidence: "SMS channel evidence was detected." },
    { signal: "push", pattern: /\bpush\b|push notification|FCM|APNS|expo|PushProvider/i, evidence: "push channel evidence was detected." },
    { signal: "chat", pattern: /\bchat\b|ChatProvider|discord|mattermost|rocket\.chat/i, evidence: "chat channel evidence was detected." },
    { signal: "slack", pattern: /Slack|slack/i, evidence: "Slack channel evidence was detected." },
    { signal: "teams", pattern: /Microsoft Teams|msTeams|teams/i, evidence: "Microsoft Teams channel evidence was detected." },
    { signal: "telegram", pattern: /Telegram|telegram/i, evidence: "Telegram channel evidence was detected." },
    { signal: "whatsapp", pattern: /WhatsApp|whatsapp/i, evidence: "WhatsApp channel evidence was detected." }
  ];
  return notificationSignalFromSpecs(sourceFiles, specs, "channel", "signal");
}

function notificationReadinessTemplateSignals(sourceFiles: NotificationSourceFile[]): NotificationReadinessReport["templateSignals"] {
  const specs: Array<{ signal: NotificationReadinessReport["templateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "template", pattern: /template|templates|message template|notification template/i, evidence: "template evidence was detected." },
    { signal: "subject", pattern: /subject|title|headline/i, evidence: "subject/title evidence was detected." },
    { signal: "body", pattern: /body|content|html|text|markdown/i, evidence: "body/content evidence was detected." },
    { signal: "editor", pattern: /editor|no-code email editor|drag.?and.?drop|visual editor/i, evidence: "template editor evidence was detected." },
    { signal: "variables", pattern: /variables|payload|merge tags|handlebars|liquid|template data/i, evidence: "template variable evidence was detected." },
    { signal: "localization", pattern: /locale|localization|i18n|translation|language/i, evidence: "template localization evidence was detected." },
    { signal: "branding", pattern: /brand|branding|theme|logo|appearance/i, evidence: "template branding evidence was detected." },
    { signal: "preview", pattern: /preview|test send|sandbox|dry.?run/i, evidence: "template preview evidence was detected." }
  ];
  return notificationSignalFromSpecs(sourceFiles, specs, "template", "signal");
}

function notificationReadinessOperationsSignals(sourceFiles: NotificationSourceFile[]): NotificationReadinessReport["operationsSignals"] {
  const specs: Array<{ signal: NotificationReadinessReport["operationsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "api-key", pattern: /NOVU.*KEY|api.?key|secret|token|applicationIdentifier|subscriberHash/i, evidence: "notification credential evidence was detected." },
    { signal: "environment", pattern: /environment|production|staging|sandbox|baseURL|apiUrl/i, evidence: "environment evidence was detected." },
    { signal: "webhook", pattern: /webhook|inbound message|callback|delivery hook/i, evidence: "notification webhook/inbound evidence was detected." },
    { signal: "delivery-log", pattern: /delivery log|activity feed|activity|message status|delivery status|logs/i, evidence: "delivery log evidence was detected." },
    { signal: "activity-feed", pattern: /activity feed|notifications list|feed|timeline/i, evidence: "activity feed evidence was detected." },
    { signal: "rate-limit", pattern: /rate.?limit|quota|throttle|429/i, evidence: "rate limit evidence was detected." },
    { signal: "retry", pattern: /retry|retries|backoff|failed delivery|failure/i, evidence: "retry/failure evidence was detected." },
    { signal: "analytics", pattern: /analytics|metrics|open rate|click rate|engagement/i, evidence: "analytics evidence was detected." },
    { signal: "dashboard", pattern: /dashboard|admin panel|console|portal/i, evidence: "dashboard evidence was detected." }
  ];
  return notificationSignalFromSpecs(sourceFiles, specs, "operations", "signal");
}

function notificationReadinessPackageSignals(sourceFiles: NotificationSourceFile[]): NotificationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: NotificationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@novu/node", pattern: /"@novu\/node"|@novu\/node/i, evidence: "Novu Node package evidence was detected." },
    { signal: "@novu/js", pattern: /"@novu\/js"|@novu\/js/i, evidence: "Novu JS package evidence was detected." },
    { signal: "@novu/react", pattern: /"@novu\/react"|@novu\/react/i, evidence: "Novu React package evidence was detected." },
    { signal: "@knocklabs/node", pattern: /"@knocklabs\/node"|@knocklabs\/node/i, evidence: "Knock Node package evidence was detected." },
    { signal: "@magicbell/react", pattern: /"@magicbell\/react"|@magicbell\/react/i, evidence: "MagicBell React package evidence was detected." },
    { signal: "firebase-admin", pattern: /"firebase-admin"|firebase-admin|admin\.messaging/i, evidence: "Firebase Admin messaging package evidence was detected." },
    { signal: "onesignal-node", pattern: /"onesignal-node"|OneSignal|onesignal-node/i, evidence: "OneSignal package evidence was detected." },
    { signal: "custom", pattern: /notification|subscriber|topic|inbox|push|sms|slack|teams/i, evidence: "custom notification implementation evidence was detected." }
  ];
  return notificationSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function notificationSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: NotificationSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/notification-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}
