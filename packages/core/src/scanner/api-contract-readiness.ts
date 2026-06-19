import type { ApiContractReport, ConsumerContractReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildApiContractReport(walk: WalkResult): Promise<ApiContractReport> {
  const detected = await apiContractSchemaEvidence(walk);
  const schemaDocuments = detected.map((item) => item.document);
  const operationTargets = detected.flatMap((item) => item.operations).slice(0, 80);
  const primarySchema = schemaDocuments[0]?.filePath ?? "<schema>";
  const primarySchemaHref = schemaDocuments[0]?.sourceHref ?? "html/api-contracts.html";
  const hasSchema = schemaDocuments.length > 0;
  const hasOperation = operationTargets.length > 0 || schemaDocuments.some((doc) => doc.operationCount > 0);
  const hasExamples = detected.some((item) => item.hasExamples);
  const hasServers = detected.some((item) => item.hasServers);
  const hasAuth = detected.some((item) => item.hasAuth);
  const hasResponses = detected.some((item) => item.hasResponses);
  const hasHeaders = detected.some((item) => item.hasHeaders);
  const hasContentTypes = detected.some((item) => item.hasContentTypes);
  const hasLinks = detected.some((item) => item.hasLinks);
  const repoSignals = await apiContractRepoSignals(walk);

  const testPhases: ApiContractReport["testPhases"] = [
    {
      phase: "examples",
      readiness: hasExamples ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasExamples ? "Schema example/example(s) fields can seed Schemathesis examples phase." : hasSchema ? "Schema files exist, but no explicit examples were detected." : "No API schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "coverage",
      readiness: hasOperation ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasOperation ? `${operationTargets.length || schemaDocuments.reduce((sum, doc) => sum + doc.operationCount, 0)} operation target(s) can be exercised by the coverage phase.` : hasSchema ? "A schema exists, but no operation target could be counted." : "Coverage phase needs an OpenAPI or GraphQL schema.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "fuzzing",
      readiness: hasSchema ? "external" : "missing",
      evidence: hasSchema ? "Schemathesis can generate property-based inputs, but RepoTutor does not execute the API." : "No schema was detected for generated test cases.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "stateful",
      readiness: hasLinks ? "ready" : hasOperation ? "external" : hasSchema ? "partial" : "missing",
      evidence: hasLinks ? "Schema link/relationship signals exist for stateful workflows." : hasOperation ? "Operations exist; stateful execution still needs discoverable links or runtime responses." : hasSchema ? "Schema exists but operation links were not detected." : "Stateful workflows need schema operations.",
      relatedHref: primarySchemaHref
    },
    {
      phase: "negative",
      readiness: hasSchema ? "external" : "missing",
      evidence: hasSchema ? "Negative cases require executing generated invalid inputs against a running target." : "No schema was detected for negative contract tests.",
      relatedHref: primarySchemaHref
    }
  ];

  const checkMatrix: ApiContractReport["checkMatrix"] = [
    {
      check: "not-a-server-error",
      readiness: hasSchema ? "external" : "missing",
      evidence: hasSchema ? "Schemathesis can flag 5xx responses once a target URL or app adapter is available." : "No schema target exists for server-error checks.",
      relatedHref: "html/api-contracts.html"
    },
    {
      check: "schema-conformance",
      readiness: hasResponses ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasResponses ? "Response schema/status definitions were detected." : hasSchema ? "Schema exists, but response definitions were not obvious in the static scan." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "status-code-conformance",
      readiness: hasResponses ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasResponses ? "Response status definitions can be checked against observed responses." : hasSchema ? "Status-code checking needs response definitions and a live target." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "content-type-conformance",
      readiness: hasContentTypes ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasContentTypes ? "Content/media type definitions were detected." : hasSchema ? "No explicit content/media type definitions were detected." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "response-headers",
      readiness: hasHeaders ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasHeaders ? "Response/header definitions were detected." : hasSchema ? "No response header contract was detected." : "No schema was detected.",
      relatedHref: primarySchemaHref
    },
    {
      check: "auth-required",
      readiness: hasAuth ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasAuth ? "Security/auth scheme definitions or authorization hints were detected." : hasSchema ? "No explicit auth scheme was detected; protected APIs need configured headers or hooks." : "No schema was detected.",
      relatedHref: primarySchemaHref
    }
  ];

  const runtimeTargets: ApiContractReport["runtimeTargets"] = [
    {
      target: "base-url",
      readiness: hasServers ? "ready" : hasSchema ? "partial" : "missing",
      evidence: hasServers ? "OpenAPI server/base URL signal exists in the schema." : hasSchema ? "A static schema exists; provide --url or serve the schema from a running API." : "No schema or base URL was detected.",
      relatedHref: primarySchemaHref
    },
    {
      target: "asgi-wsgi",
      readiness: repoSignals.pythonAppFiles.length > 0 ? "partial" : "missing",
      evidence: repoSignals.pythonAppFiles.length > 0 ? `Python app adapter candidate(s): ${repoSignals.pythonAppFiles.slice(0, 6).join(", ")}.` : "No ASGI/WSGI framework signal was detected.",
      relatedHref: repoSignals.pythonAppFiles[0] ? `source/${encodedPath(repoSignals.pythonAppFiles[0])}` : "html/runtime-environment.html"
    },
    {
      target: "pytest",
      readiness: repoSignals.schemathesisMentions.length > 0 && repoSignals.testFiles.length > 0 ? "ready" : repoSignals.testFiles.length > 0 ? "partial" : "missing",
      evidence: repoSignals.testFiles.length > 0 ? `${repoSignals.testFiles.length} test file(s) exist; Schemathesis pytest integration ${repoSignals.schemathesisMentions.length > 0 ? "is mentioned" : "was not detected"}.` : "No pytest/test file signal was detected.",
      relatedHref: repoSignals.testFiles[0] ? `source/${encodedPath(repoSignals.testFiles[0])}` : "html/files.html"
    },
    {
      target: "ci-action",
      readiness: repoSignals.schemathesisWorkflowFiles.length > 0 ? "ready" : repoSignals.workflowFiles.length > 0 ? "partial" : "missing",
      evidence: repoSignals.schemathesisWorkflowFiles.length > 0 ? `Schemathesis CI workflow signal(s): ${repoSignals.schemathesisWorkflowFiles.join(", ")}.` : repoSignals.workflowFiles.length > 0 ? `${repoSignals.workflowFiles.length} workflow file(s) exist, but Schemathesis action/command was not detected.` : "No CI workflow was detected.",
      relatedHref: repoSignals.workflowFiles[0] ? `source/${encodedPath(repoSignals.workflowFiles[0])}` : "html/security-readiness.html"
    },
    {
      target: "mock-server",
      readiness: repoSignals.mockServerFiles.length > 0 ? "ready" : hasSchema ? "external" : "missing",
      evidence: repoSignals.mockServerFiles.length > 0 ? `Mock server signal(s): ${repoSignals.mockServerFiles.join(", ")}.` : hasSchema ? "A schema exists, but no Prism/WireMock/MSW-style mock server config was detected." : "No schema exists to back a mock server.",
      relatedHref: repoSignals.mockServerFiles[0] ? `source/${encodedPath(repoSignals.mockServerFiles[0])}` : "html/api-contracts.html"
    }
  ];

  const reportingOutputs: ApiContractReport["reportingOutputs"] = [
    {
      output: "junit-xml",
      readiness: repoSignals.junitMentions.length > 0 ? "ready" : repoSignals.workflowFiles.length > 0 ? "partial" : "external",
      evidence: repoSignals.junitMentions.length > 0 ? `JUnit report signal(s): ${repoSignals.junitMentions.join(", ")}.` : "Schemathesis can emit --report junit; no committed JUnit setup was detected.",
      relatedHref: repoSignals.junitMentions[0] ? `source/${encodedPath(repoSignals.junitMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "allure",
      readiness: repoSignals.allureMentions.length > 0 ? "ready" : "external",
      evidence: repoSignals.allureMentions.length > 0 ? `Allure signal(s): ${repoSignals.allureMentions.join(", ")}.` : "Allure output requires schemathesis[allure] and --report-allure-path.",
      relatedHref: repoSignals.allureMentions[0] ? `source/${encodedPath(repoSignals.allureMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "cassette",
      readiness: repoSignals.vcrMentions.length > 0 ? "ready" : hasSchema ? "external" : "external",
      evidence: repoSignals.vcrMentions.length > 0 ? `VCR/cassette signal(s): ${repoSignals.vcrMentions.join(", ")}.` : "Schemathesis can emit --report vcr with --report-vcr-path for replayable HTTP evidence.",
      relatedHref: repoSignals.vcrMentions[0] ? `source/${encodedPath(repoSignals.vcrMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "replay",
      readiness: repoSignals.replayMentions.length > 0 ? "ready" : "external",
      evidence: repoSignals.replayMentions.length > 0 ? `Replay signal(s): ${repoSignals.replayMentions.join(", ")}.` : "Replay/triage is external until failing cases or cassette/HAR output exists.",
      relatedHref: repoSignals.replayMentions[0] ? `source/${encodedPath(repoSignals.replayMentions[0])}` : "html/api-contracts.html"
    },
    {
      output: "curl-repro",
      readiness: hasSchema ? "external" : "external",
      evidence: hasSchema ? "Schemathesis reports curl reproduction commands for failures after a real run." : "Curl reproduction commands require an executed contract test.",
      relatedHref: "html/api-contracts.html"
    },
    {
      output: "coverage",
      readiness: repoSignals.coverageMentions.length > 0 ? "ready" : hasSchema ? "partial" : "external",
      evidence: repoSignals.coverageMentions.length > 0 ? `Coverage/TraceCov signal(s): ${repoSignals.coverageMentions.join(", ")}.` : hasSchema ? "Schemathesis coverage phase can target schema constraints; TraceCov setup was not detected." : "Coverage output requires schema execution.",
      relatedHref: repoSignals.coverageMentions[0] ? `source/${encodedPath(repoSignals.coverageMentions[0])}` : "html/api-contracts.html"
    }
  ];

  const riskQueue: ApiContractReport["riskQueue"] = [];
  if (!hasSchema) {
    riskQueue.push({
      priority: "high",
      action: "Add an OpenAPI, Swagger, GraphQL, Postman, or AsyncAPI contract before advertising contract tests.",
      why: "Schemathesis-style generated tests need a machine-readable API schema.",
      relatedHref: "html/api-contracts.html"
    });
  }
  if (hasSchema && !hasOperation) {
    riskQueue.push({
      priority: "high",
      action: "Define at least one operation target in the API schema.",
      why: "Contract testing cannot generate request cases without operations, paths, or GraphQL fields.",
      relatedHref: primarySchemaHref
    });
  }
  if (hasSchema && !hasServers && repoSignals.pythonAppFiles.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Declare a runnable target with --url, a served schema URL, or a pytest app adapter.",
      why: "Generated requests need a live base URL or in-process application target.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasSchema && repoSignals.schemathesisWorkflowFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Add Schemathesis to CI with JUnit or artifact upload before enforcing API contracts.",
      why: "Contract failures should be reproducible and visible in pull request checks.",
      relatedHref: "html/security-readiness.html"
    });
  }
  if (hasSchema && !hasExamples) {
    riskQueue.push({
      priority: "medium",
      action: "Add example/example(s) values for important request bodies and parameters.",
      why: "Examples improve deterministic coverage before fuzzing explores edge cases.",
      relatedHref: primarySchemaHref
    });
  }
  if (hasSchema && !hasAuth && /auth|login|token|session|user/i.test(schemaDocuments.map((doc) => doc.filePath).join(" "))) {
    riskQueue.push({
      priority: "medium",
      action: "Document authentication headers or hooks for protected API paths.",
      why: "Schemathesis needs configured credentials for endpoints that reject anonymous requests.",
      relatedHref: primarySchemaHref
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Schemathesis against the original API before treating this as a pass/fail contract result.",
    why: "RepoTutor only reports static readiness and never sends generated requests.",
    relatedHref: "html/api-contracts.html"
  });

  return {
    summary: `Schemathesis식 API contract readiness report: schema document ${schemaDocuments.length}개, operation target ${operationTargets.length}개, test phase ${testPhases.length}개, check ${checkMatrix.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Schemathesis OpenAPI GraphQL schema generated cases Hypothesis checks stateful workflows JUnit Allure contract testing",
    schemaDocuments,
    operationTargets,
    testPhases,
    checkMatrix,
    runtimeTargets,
    reportingOutputs,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: `schemathesis run ${primarySchema} --url <base-url>`,
        purpose: "Run generated API checks against a local or deployed target when the schema is stored in the repository."
      },
      {
        command: `schemathesis run ${primarySchema} --checks all --report junit --report-junit-path reports/schemathesis-junit.xml`,
        purpose: "Capture CI-readable JUnit XML while keeping all response checks enabled."
      },
      {
        command: `schemathesis run ${primarySchema} --report vcr --report-vcr-path reports/schemathesis-vcr.yaml`,
        purpose: "Record replayable HTTP cassette evidence for triage."
      },
      {
        command: `schemathesis run ${primarySchema} --report-allure-path allure-results`,
        purpose: "Write Allure result files for operation-level failure review."
      },
      {
        command: `SCHEMATHESIS_HOOKS=hooks schemathesis run ${primarySchema}`,
        purpose: "Enable custom hooks or TraceCov schema coverage instrumentation."
      },
      {
        command: `schemathesis run ${primarySchema} --phases=stateful`,
        purpose: "Focus on linked/stateful API workflows after links or producer responses are available."
      }
    ],
    learnerNextSteps: [
      "먼저 schema document와 operation target이 있는지 확인하고, missing이면 OpenAPI/GraphQL contract부터 추가하세요.",
      "base URL, app adapter, auth header 중 하나를 명시해야 generated request가 실제 API에 도달합니다.",
      "response schema, status code, content type, header check는 schema 정의와 실제 응답을 함께 봐야 합니다.",
      "이 리포트는 Schemathesis 실행 결과가 아닙니다. 실제 버그 여부는 원본 API에서 별도 실행해 확인하세요."
    ]
  };
}

type ApiContractDetectedSchema = {
  document: ApiContractReport["schemaDocuments"][number];
  operations: ApiContractReport["operationTargets"];
  hasExamples: boolean;
  hasServers: boolean;
  hasAuth: boolean;
  hasResponses: boolean;
  hasHeaders: boolean;
  hasContentTypes: boolean;
  hasLinks: boolean;
};

async function apiContractSchemaEvidence(walk: WalkResult): Promise<ApiContractDetectedSchema[]> {
  const detected: ApiContractDetectedSchema[] = [];
  const seen = new Set<string>();
  for (const file of walk.files) {
    const pathCandidate = apiContractCandidatePath(file.relPath);
    const canInspect = /\.(json|ya?ml|graphql|gql|toml|md)$/i.test(file.relPath);
    if (!pathCandidate && !canInspect) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!pathCandidate && !apiContractContentSignal(text ?? "")) continue;
    const schemaType = apiContractSchemaType(file.relPath, text ?? "");
    if (!schemaType || seen.has(file.relPath)) continue;
    seen.add(file.relPath);
    const operations = apiContractOperationsFor(file.relPath, text ?? "", schemaType);
    const operationCount = operations.length || apiContractOperationCount(text ?? "", schemaType);
    const version = apiContractVersion(text ?? "", schemaType);
    const evidence = apiContractDocumentEvidence(file.relPath, schemaType, operationCount, Boolean(text));
    const sourceHref = `source/${encodedPath(file.relPath)}`;
    detected.push({
      document: {
        filePath: file.relPath,
        schemaType,
        version,
        operationCount,
        readiness: operationCount > 0 ? "ready" : text ? "partial" : "missing",
        evidence,
        sourceHref
      },
      operations: operations.map((operation) => ({
        ...operation,
        source: file.relPath,
        readiness: operation.method || operation.path || operation.operationId ? "ready" as const : "partial" as const,
        relatedHref: sourceHref
      })),
      hasExamples: /\bexamples?\b\s*[:=]/i.test(text ?? ""),
      hasServers: /\bservers?\b\s*[:=]|https?:\/\/|localhost:\d+/i.test(text ?? ""),
      hasAuth: /\b(securitySchemes|securityDefinitions|authorization|bearerAuth|apiKey|oauth2|cookieAuth)\b/i.test(text ?? ""),
      hasResponses: /\bresponses?\b\s*[:=]|"responses"\s*:/i.test(text ?? ""),
      hasHeaders: /\bheaders?\b\s*[:=]|"headers"\s*:/i.test(text ?? ""),
      hasContentTypes: /\b(application\/json|text\/plain|multipart\/form-data|content)\b/i.test(text ?? ""),
      hasLinks: /\blinks?\b\s*[:=]|operationRef|operationId/i.test(text ?? "")
    });
  }
  return detected.slice(0, 60);
}

function apiContractCandidatePath(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return /(^|\/)(openapi|swagger|asyncapi)(\.|[-_])/i.test(filePath)
    || /(^|\/)(schema|schemas|api|contract|contracts|spec|specs)\//i.test(filePath)
    || /\.(graphql|gql)$/i.test(filePath)
    || base === "schemathesis.toml"
    || base.endsWith(".postman_collection.json");
}

function apiContractContentSignal(text: string): boolean {
  return /\b(openapi|swagger|asyncapi)\b\s*[:=]/i.test(text)
    || /"info"\s*:\s*\{[\s\S]{0,800}"title"\s*:/i.test(text)
    || /\b(type\s+(Query|Mutation|Subscription)|schema\s*\{)\b/i.test(text)
    || /"item"\s*:\s*\[[\s\S]{0,1200}"request"\s*:/i.test(text);
}

function apiContractSchemaType(filePath: string, text: string): ApiContractReport["schemaDocuments"][number]["schemaType"] | null {
  const lower = filePath.toLowerCase();
  if (/\.(graphql|gql)$/i.test(filePath) || /\btype\s+(Query|Mutation|Subscription)\b|schema\s*\{/i.test(text)) return "graphql";
  if (/postman_collection\.json$/i.test(filePath) || /"item"\s*:\s*\[[\s\S]{0,1200}"request"\s*:/i.test(text)) return "postman";
  if (/\basyncapi\b\s*[:=]|"asyncapi"\s*:/i.test(text) || /(^|\/)asyncapi[._-]/i.test(lower)) return "asyncapi";
  if (/\bswagger\b\s*[:=]|"swagger"\s*:/i.test(text) || /(^|\/)swagger[._-]/i.test(lower)) return "swagger";
  if (/\bopenapi\b\s*[:=]|"openapi"\s*:/i.test(text) || /(^|\/)openapi[._-]/i.test(lower)) return "openapi";
  if (apiContractCandidatePath(filePath)) return "unknown";
  return null;
}

function apiContractVersion(text: string, schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"]): string | null {
  const field = schemaType === "swagger" ? "swagger" : schemaType === "asyncapi" ? "asyncapi" : schemaType === "openapi" ? "openapi" : null;
  if (!field) return null;
  const match = text.match(new RegExp(`["']?${field}["']?\\s*[:=]\\s*["']?([^"',\\n\\r\\s]+)`, "i"));
  return match?.[1] ?? null;
}

function apiContractOperationsFor(
  filePath: string,
  text: string,
  schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"]
): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  if (!text) return [];
  if (schemaType === "openapi" || schemaType === "swagger") return openApiOperationTargets(text);
  if (schemaType === "graphql") return graphqlOperationTargets(text);
  if (schemaType === "postman") return postmanOperationTargets(text);
  if (schemaType === "asyncapi") {
    const channels = [...text.matchAll(/^\s{0,8}([A-Za-z0-9_./{}-]+)\s*:\s*$/gm)]
      .map((match) => match[1])
      .filter((value) => value.includes("/") || value.includes("{"))
      .slice(0, 40);
    return channels.map((channel) => ({
      operationId: null,
      method: null,
      path: channel,
      evidence: `${filePath} declares AsyncAPI channel ${channel}.`
    }));
  }
  return [];
}

function openApiOperationTargets(text: string): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  const methods = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
  const parsed = parseJsonObject(text);
  if (parsed && typeof parsed === "object" && "paths" in parsed) {
    const paths = (parsed as { paths?: unknown }).paths;
    if (paths && typeof paths === "object") {
      const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
      for (const [route, value] of Object.entries(paths as Record<string, unknown>)) {
        if (!value || typeof value !== "object") continue;
        for (const [method, operation] of Object.entries(value as Record<string, unknown>)) {
          if (!methods.has(method.toLowerCase())) continue;
          const operationId = operation && typeof operation === "object" && "operationId" in operation
            ? String((operation as { operationId?: unknown }).operationId ?? "") || null
            : null;
          rows.push({ operationId, method: method.toUpperCase(), path: route, evidence: `${method.toUpperCase()} ${route} is declared in the API schema.` });
        }
      }
      return rows.slice(0, 80);
    }
  }
  const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
  const lines = text.split(/\r?\n/);
  let currentPath: string | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const pathMatch = lines[index].match(/^\s{0,8}(['"]?\/[^:'"]+['"]?)\s*:\s*(?:#.*)?$/);
    if (pathMatch) currentPath = pathMatch[1].replace(/^['"]|['"]$/g, "");
    const methodMatch = lines[index].match(/^\s{2,12}(get|put|post|delete|options|head|patch|trace)\s*:\s*(?:#.*)?$/i);
    if (!methodMatch || !currentPath) continue;
    const lookahead = lines.slice(index, Math.min(index + 10, lines.length)).join("\n");
    const operationId = lookahead.match(/^\s*operationId\s*:\s*["']?([^"'\n\r#]+)/m)?.[1]?.trim() ?? null;
    rows.push({
      operationId,
      method: methodMatch[1].toUpperCase(),
      path: currentPath,
      evidence: `${methodMatch[1].toUpperCase()} ${currentPath} is declared in the API schema.`
    });
  }
  return rows.slice(0, 80);
}

function graphqlOperationTargets(text: string): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
  for (const match of text.matchAll(/type\s+(Query|Mutation|Subscription)\s*\{([\s\S]*?)\}/g)) {
    const group = match[1];
    const body = match[2];
    for (const field of body.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(|:)/gm)) {
      rows.push({
        operationId: `${group}.${field[1]}`,
        method: group.toUpperCase(),
        path: field[1],
        evidence: `GraphQL ${group}.${field[1]} field is declared.`
      });
    }
  }
  return rows.slice(0, 80);
}

function postmanOperationTargets(text: string): Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> {
  const rows: Array<Omit<ApiContractReport["operationTargets"][number], "source" | "readiness" | "relatedHref">> = [];
  const parsed = parseJsonObject(text);
  const visit = (value: unknown): void => {
    if (rows.length >= 80 || !value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (record.request && typeof record.request === "object") {
      const request = record.request as Record<string, unknown>;
      const method = typeof request.method === "string" ? request.method.toUpperCase() : null;
      const urlValue = request.url;
      const url = typeof urlValue === "string"
        ? urlValue
        : urlValue && typeof urlValue === "object" && "raw" in urlValue
          ? String((urlValue as { raw?: unknown }).raw ?? "")
          : null;
      rows.push({
        operationId: typeof record.name === "string" ? record.name : null,
        method,
        path: url,
        evidence: `${method ?? "REQUEST"} ${url ?? "Postman request"} is declared in the collection.`
      });
    }
    for (const child of Object.values(record)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === "object") visit(child);
    }
  };
  if (parsed) visit(parsed);
  return rows;
}

function apiContractOperationCount(text: string, schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"]): number {
  if (!text) return 0;
  if (schemaType === "openapi" || schemaType === "swagger") return openApiOperationTargets(text).length;
  if (schemaType === "graphql") return graphqlOperationTargets(text).length;
  if (schemaType === "postman") return postmanOperationTargets(text).length;
  if (schemaType === "asyncapi") return (text.match(/^\s{0,8}([A-Za-z0-9_./{}-]+)\s*:\s*$/gm) ?? []).length;
  return 0;
}

function apiContractDocumentEvidence(
  filePath: string,
  schemaType: ApiContractReport["schemaDocuments"][number]["schemaType"],
  operationCount: number,
  readable: boolean
): string {
  if (!readable) return `${filePath} is a ${schemaType} path candidate but was too large or unsafe to inspect.`;
  if (operationCount > 0) return `${filePath} exposes ${operationCount} ${schemaType} operation target(s) for generated contract checks.`;
  return `${filePath} looks like a ${schemaType} contract document, but no operation target was counted.`;
}

type ApiContractRepoSignals = {
  workflowFiles: string[];
  schemathesisWorkflowFiles: string[];
  schemathesisMentions: string[];
  junitMentions: string[];
  allureMentions: string[];
  vcrMentions: string[];
  replayMentions: string[];
  coverageMentions: string[];
  pythonAppFiles: string[];
  testFiles: string[];
  mockServerFiles: string[];
};

async function apiContractRepoSignals(walk: WalkResult): Promise<ApiContractRepoSignals> {
  const workflowFiles = walk.files.filter((file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file.relPath)).map((file) => file.relPath);
  const testFiles = walk.files.filter((file) => /(^|\/)(__tests__|tests?|spec)\/|(\.test|\.spec)\.[cm]?[jt]sx?$|test_.*\.py$/i.test(file.relPath)).map((file) => file.relPath);
  const mockServerFiles = walk.files.filter((file) => /(^|\/)(mocks?|mock-server|wiremock|prism|msw)\b|prism\.ya?ml|wiremock\.json/i.test(file.relPath)).map((file) => file.relPath);
  const signals: ApiContractRepoSignals = {
    workflowFiles,
    schemathesisWorkflowFiles: [],
    schemathesisMentions: [],
    junitMentions: [],
    allureMentions: [],
    vcrMentions: [],
    replayMentions: [],
    coverageMentions: [],
    pythonAppFiles: [],
    testFiles,
    mockServerFiles
  };
  const candidates = walk.files.filter((file) => {
    if (!file.isTextCandidate) return false;
    if (/^\.github\/workflows\/.+\.ya?ml$/i.test(file.relPath)) return true;
    if (/(schemathesis|openapi|swagger|graphql|pytest|tox|nox|Dockerfile|docker-compose|package\.json|pyproject\.toml)/i.test(file.relPath)) return true;
    if (/\.(py|toml|json|ya?ml|md)$/i.test(file.relPath) && /(api|contract|test|spec|coverage|allure|junit|vcr|replay|mock)/i.test(file.relPath)) return true;
    return false;
  });
  for (const file of candidates.slice(0, 300)) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    if (/schemathesis|st\s+run|schemathesis\/action/i.test(text)) {
      signals.schemathesisMentions.push(file.relPath);
      if (/^\.github\/workflows\//i.test(file.relPath)) signals.schemathesisWorkflowFiles.push(file.relPath);
    }
    if (/junit|report-junit|--report\s+junit/i.test(text)) signals.junitMentions.push(file.relPath);
    if (/allure|report-allure/i.test(text)) signals.allureMentions.push(file.relPath);
    if (/\bvcr\b|cassette|report-vcr/i.test(text)) signals.vcrMentions.push(file.relPath);
    if (/replay|har|ndjson|curl\s+-X/i.test(text)) signals.replayMentions.push(file.relPath);
    if (/tracecov|schema-coverage|SCHEMATHESIS_COVERAGE|coverage/i.test(text)) signals.coverageMentions.push(file.relPath);
    if (/\.py$/i.test(file.relPath) && /\b(FastAPI|Flask|Django|Sanic|Starlette|ASGI|WSGI)\b/.test(text)) signals.pythonAppFiles.push(file.relPath);
  }
  return {
    workflowFiles: [...new Set(signals.workflowFiles)].slice(0, 40),
    schemathesisWorkflowFiles: [...new Set(signals.schemathesisWorkflowFiles)].slice(0, 40),
    schemathesisMentions: [...new Set(signals.schemathesisMentions)].slice(0, 40),
    junitMentions: [...new Set(signals.junitMentions)].slice(0, 40),
    allureMentions: [...new Set(signals.allureMentions)].slice(0, 40),
    vcrMentions: [...new Set(signals.vcrMentions)].slice(0, 40),
    replayMentions: [...new Set(signals.replayMentions)].slice(0, 40),
    coverageMentions: [...new Set(signals.coverageMentions)].slice(0, 40),
    pythonAppFiles: [...new Set(signals.pythonAppFiles)].slice(0, 40),
    testFiles: [...new Set(signals.testFiles)].slice(0, 80),
    mockServerFiles: [...new Set(signals.mockServerFiles)].slice(0, 40)
  };
}

export async function buildConsumerContractReadinessReport(walk: WalkResult): Promise<ConsumerContractReadinessReport> {
  const sourceFiles = await consumerContractReadinessSourceFiles(walk);
  const contractSetups = consumerContractReadinessSetups(sourceFiles);
  const interactionSignals = consumerContractReadinessInteractionSignals(sourceFiles);
  const providerSignals = consumerContractReadinessProviderSignals(sourceFiles);
  const brokerSignals = consumerContractReadinessBrokerSignals(sourceFiles);
  const matcherSignals = consumerContractReadinessMatcherSignals(sourceFiles);
  const ciSignals = consumerContractReadinessCiSignals(sourceFiles);
  const packageSignals = consumerContractReadinessPackageSignals(sourceFiles);
  const riskQueue: ConsumerContractReadinessReport["riskQueue"] = [];
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || contractSetups.some((item) => item.interactionCount > 0);
  const hasProviderState = providerSignals.some((item) => item.signal === "provider-state" && item.readiness === "ready") || contractSetups.some((item) => item.providerStateCount > 0);
  const hasVerifier = providerSignals.some((item) => item.signal === "verifier" && item.readiness === "ready") || contractSetups.some((item) => item.verifierCount > 0);
  const hasBroker = brokerSignals.some((item) => ["pact-broker", "pactflow"].includes(item.signal) && item.readiness === "ready") || contractSetups.some((item) => item.brokerCount > 0);
  const hasCanIDeploy = brokerSignals.some((item) => item.signal === "can-i-deploy" && item.readiness === "ready");
  const hasPublishMetadata = providerSignals.some((item) => ["publish-results", "provider-version", "provider-branch"].includes(item.signal) && item.readiness === "ready");
  const hasMatchers = matcherSignals.some((item) => item.readiness === "ready") || contractSetups.some((item) => item.matcherCount > 0);

  if (sourceFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Document whether this project intentionally has no consumer-driven contract testing strategy.",
      why: "No Pact interaction, provider verifier, provider state, broker, PactFlow, can-i-deploy, matcher, or contract CI signals were detected.",
      relatedHref: "html/consumer-contract-readiness.html"
    });
  }
  if (hasInteraction && !hasProviderState) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit provider states for consumer contract interactions.",
      why: "Pact examples use provider states to make each consumer interaction replayable against a provider with known setup data.",
      relatedHref: interactionSignals.find((item) => item.readiness === "ready")?.relatedHref ?? "html/consumer-contract-readiness.html"
    });
  }
  if (hasInteraction && !hasMatchers) {
    riskQueue.push({
      priority: "medium",
      action: "Use matchers for bodies, headers, IDs, and provider-state-derived values instead of only exact example values.",
      why: "Consumer contracts stay maintainable when they describe the shape and variability of the interaction, not only one literal response.",
      relatedHref: "html/consumer-contract-readiness.html"
    });
  }
  if (hasInteraction && !hasVerifier) {
    riskQueue.push({
      priority: "medium",
      action: "Wire provider verification so generated pacts are replayed against the real provider.",
      why: "Consumer tests alone can write pact files, but provider verification is what proves the provider still satisfies those contracts.",
      relatedHref: "html/consumer-contract-readiness.html"
    });
  }
  if (hasVerifier && !hasBroker) {
    riskQueue.push({
      priority: "medium",
      action: "Add Pact Broker or PactFlow evidence when provider verification is meant to gate releases across services.",
      why: "Broker-backed verification coordinates which consumer pacts a provider must satisfy and keeps verification results queryable.",
      relatedHref: providerSignals.find((item) => item.signal === "verifier" && item.readiness === "ready")?.relatedHref ?? "html/consumer-contract-readiness.html"
    });
  }
  if (hasBroker && !hasCanIDeploy) {
    riskQueue.push({
      priority: "medium",
      action: "Add can-i-deploy to CI or release checks before relying on broker state for deployment decisions.",
      why: "A broker stores contracts and verification results; can-i-deploy is the explicit compatibility gate before promotion.",
      relatedHref: brokerSignals.find((item) => item.readiness === "ready")?.relatedHref ?? "html/consumer-contract-readiness.html"
    });
  }
  if (hasVerifier && !hasPublishMetadata) {
    riskQueue.push({
      priority: "medium",
      action: "Publish verification results with provider version, branch, and selector metadata.",
      why: "Provider verification is easier to trust when results are attached to an immutable provider version and release line.",
      relatedHref: "html/consumer-contract-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Pact consumer tests, provider verification, and broker can-i-deploy on the original source tree before treating this report as approval.",
    why: "RepoTutor records static consumer contract readiness only; it does not start mock servers, write pact files, verify providers, publish results, or contact brokers.",
    relatedHref: "html/consumer-contract-readiness.html"
  });

  return {
    summary: `Pact consumer contract readiness report: setup ${contractSetups.length}개, interaction signal ${interactionSignals.filter((item) => item.readiness === "ready").length}개, provider signal ${providerSignals.filter((item) => item.readiness === "ready").length}개, broker signal ${brokerSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Pact consumer driven contracts interactions provider states verifier broker can-i-deploy matchers publish verification",
    contractSetups,
    interactionSignals,
    providerSignals,
    brokerSignals,
    matcherSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"PactV3|PactV4|PactDslWithProvider|Pact.service_consumer|given|uponReceiving\" .", purpose: "Inventory consumer interaction DSLs, provider states, and pact-writing tests." },
      { command: "rg \"Verifier|verifyProvider|PactVerificationContext|@Provider|@State|stateHandlers\" .", purpose: "Find provider verification, state handler, and live provider replay wiring." },
      { command: "rg \"pactBrokerUrl|pactflow|can-i-deploy|publishVerificationResult|consumerVersionSelectors\" .", purpose: "Trace broker, PactFlow, deployment gate, selector, and verification publishing evidence." },
      { command: "pact-broker can-i-deploy --pacticipant <service> --version <version> --to-environment <env>", purpose: "Check service compatibility through Pact Broker or PactFlow after real verification results exist." },
      { command: "npm test -- --runInBand", purpose: "Run Pact JS consumer/provider tests in a deterministic local test process when this is a Node project." }
    ],
    learnerNextSteps: [
      "먼저 consumer interaction이 mock server와 pact file을 만드는지 확인하세요.",
      "각 interaction에는 provider state와 matcher가 붙어 있어야 replay가 의미 있습니다.",
      "Provider verifier가 broker 또는 local pact file을 읽고 실제 provider에 대해 검증하는지 확인하세요.",
      "Pact Broker/PactFlow를 쓰는 경우 publishVerificationResult, provider version, branch, selector, can-i-deploy를 같이 보세요.",
      "이 리포트는 정적 readiness입니다. 실제 contract pass/fail은 원본 프로젝트에서 Pact 도구를 실행해 확인하세요."
    ]
  };
}

type ConsumerContractReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function consumerContractReadinessSourceFiles(walk: WalkResult): Promise<ConsumerContractReadinessSourceFile[]> {
  const files: ConsumerContractReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !consumerContractReadinessInspectablePath(file.relPath)) continue;
    const pathCandidate = consumerContractReadinessPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!pathCandidate && !consumerContractReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function consumerContractReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|pom\.xml|build\.gradle(\.kts)?|settings\.gradle(\.kts)?|Gemfile|.*\.gemspec|go\.mod|pyproject\.toml|requirements.*\.txt|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(pacts?|contract|contracts|consumer|provider|broker|pactflow|tests?|spec|docs?|ci)(\/|$)/i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|java|kt|groovy|rb|go|py|json|toml|ya?ml|md|sh)$/i.test(filePath);
}

function consumerContractReadinessPathSignal(filePath: string): boolean {
  return /(pact|pactflow|contract|consumer|provider|broker|can-i-deploy|verify-provider|provider[-_ ]?state)/i.test(filePath);
}

function consumerContractReadinessContentSignal(text: string): boolean {
  return /\b(@pact-foundation\/pact|PactV3|PactV4|PactDslWithProvider|PactVerificationContext|PactVerification|Pact\.service_consumer|Pact\.service_provider|MatchersV3|Matchers|uponReceiving|withRequest|willRespondWith|executeTest|stateHandlers|providerStatesSetupUrl|verifyProvider|pactBrokerUrl|Pact Broker|PactBroker|pactflow|can-i-deploy|publishVerificationResult|consumerVersionSelectors|generate_from_provider_state|pathFromProviderState|valueFromProviderState|PACT_BROKER|PACT_PROVIDER_VERSION)\b/i.test(text);
}

function consumerContractReadinessSetups(sourceFiles: ConsumerContractReadinessSourceFile[]): ConsumerContractReadinessReport["contractSetups"] {
  const rows: ConsumerContractReadinessReport["contractSetups"] = [];
  for (const source of sourceFiles) {
    const interactionCount = countMatches(source.text, /\b(PactV3|PactV4|new\s+Pact|PactDslWithProvider|Pact\.service_consumer|addInteraction|interaction|given|uponReceiving|withRequest|willRespondWith|executeTest)\b/gi);
    const providerStateCount = countMatches(source.text, /\b(given|provider state|provider states|stateHandlers|providerStatesSetupUrl|@State|generate_from_provider_state|pathFromProviderState|valueFromProviderState)\b/gi);
    const verifierCount = countMatches(source.text, /\b(Verifier|verifyProvider|PactVerificationContext|@Provider|PactVerification|pactVerify|Pact\.service_provider|providerBaseUrl)\b/gi);
    const brokerCount = countMatches(source.text, /\b(pactBrokerUrl|Pact Broker|PactBroker|pactflow|can-i-deploy|PACT_BROKER|consumerVersionSelectors|publishVerificationResult|enablePending|includeWipPactsSince)\b/gi);
    const matcherCount = countMatches(source.text, /\b(MatchersV3|Matchers|like|eachLike|each_like|regex|term|matchingRules|fromProviderState|pathFromProviderState|valueFromProviderState|headers|body)\b/gi);
    const messageCount = countMatches(source.text, /\b(message|MessagePact|PactMessage|GraphQLInteraction|Kafka|plugin|asynchronous|synchronous)\b/gi);
    const totalSignals = interactionCount + providerStateCount + verifierCount + brokerCount + matcherCount + messageCount;
    if (totalSignals === 0 && !consumerContractReadinessPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      role: consumerContractReadinessRole(source, { interactionCount, verifierCount, brokerCount }),
      framework: consumerContractReadinessFramework(source),
      interactionCount,
      providerStateCount,
      verifierCount,
      brokerCount,
      matcherCount,
      messageCount,
      readiness: (interactionCount > 0 && providerStateCount > 0 && matcherCount > 0) || (verifierCount > 0 && providerStateCount > 0) || (brokerCount > 0 && /can-i-deploy|publishVerificationResult/i.test(source.text)) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains interactions ${interactionCount}, provider states ${providerStateCount}, verifiers ${verifierCount}, broker signals ${brokerCount}, matchers ${matcherCount}, messages ${messageCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.interactionCount + b.verifierCount + b.brokerCount + b.matcherCount) - (a.interactionCount + a.verifierCount + a.brokerCount + a.matcherCount))
    .slice(0, 140);
}

function consumerContractReadinessRole(
  source: ConsumerContractReadinessSourceFile,
  counts: { interactionCount: number; verifierCount: number; brokerCount: number }
): ConsumerContractReadinessReport["contractSetups"][number]["role"] {
  const haystack = `${source.filePath}\n${source.text}`;
  const hasConsumer = counts.interactionCount > 0 || /consumer|Pact\.service_consumer|uponReceiving|withRequest|willRespondWith/i.test(haystack);
  const hasProvider = counts.verifierCount > 0 || /provider|verifyProvider|PactVerificationContext|@Provider|@State|stateHandlers/i.test(haystack);
  const hasBroker = counts.brokerCount > 0 || /broker|pactflow|can-i-deploy/i.test(haystack);
  if ([hasConsumer, hasProvider, hasBroker].filter(Boolean).length > 1) return "mixed";
  if (hasBroker) return "broker";
  if (hasProvider) return "provider";
  if (hasConsumer) return "consumer";
  if (/^\.github\/workflows\//i.test(source.filePath)) return "ci";
  return "unknown";
}

function consumerContractReadinessFramework(source: ConsumerContractReadinessSourceFile): ConsumerContractReadinessReport["contractSetups"][number]["framework"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/@pact-foundation\/pact|PactV3|PactV4|MatchersV3|verifyProvider/i.test(haystack) && /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md)$/i.test(source.filePath)) return "pact-js";
  if (/au\.com\.dius\.pact|pact-jvm|PactDslWithProvider|PactVerificationContext|@Provider|@State|build\.gradle|pom\.xml/i.test(haystack)) return "pact-jvm";
  if (/pact-ruby|Pact\.service_consumer|Pact\.service_provider|generate_from_provider_state|Gemfile|gemspec|rake/i.test(haystack)) return "pact-ruby";
  if (/github\.com\/pact-foundation\/pact-go|pact-go/i.test(haystack)) return "pact-go";
  if (/pact-python|pact-python-ffi|python.*pact/i.test(haystack)) return "pact-python";
  if (/pact|contract/i.test(haystack)) return "custom";
  return "unknown";
}

function consumerContractReadinessInteractionSignals(sourceFiles: ConsumerContractReadinessSourceFile[]): ConsumerContractReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: ConsumerContractReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pact-v3", pattern: /PactV3|pact.*v3/i, evidence: "Pact V3 consumer DSL evidence was detected." },
    { signal: "pact-v4", pattern: /PactV4|pact.*v4/i, evidence: "Pact V4 consumer DSL evidence was detected." },
    { signal: "interaction", pattern: /addInteraction|\binteraction\b|PactDslWithProvider/i, evidence: "interaction construction evidence was detected." },
    { signal: "given", pattern: /\.given\b|\bgiven\(|provider state/i, evidence: "provider-state given clause evidence was detected." },
    { signal: "upon-receiving", pattern: /uponReceiving|upon_receiving/i, evidence: "consumer interaction description evidence was detected." },
    { signal: "with-request", pattern: /withRequest|with_request/i, evidence: "request contract evidence was detected." },
    { signal: "will-respond-with", pattern: /willRespondWith|will_respond_with/i, evidence: "response contract evidence was detected." },
    { signal: "execute-test", pattern: /executeTest|execute_test/i, evidence: "Pact mock-server execution evidence was detected." },
    { signal: "message", pattern: /MessagePact|message provider|asynchronous message|PactMessage/i, evidence: "message pact evidence was detected." },
    { signal: "graphql", pattern: /GraphQLInteraction|graphql/i, evidence: "GraphQL interaction evidence was detected." },
    { signal: "plugin", pattern: /plugin|pact-plugin/i, evidence: "Pact plugin interaction evidence was detected." }
  ];
  return consumerContractReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function consumerContractReadinessProviderSignals(sourceFiles: ConsumerContractReadinessSourceFile[]): ConsumerContractReadinessReport["providerSignals"] {
  const specs: Array<{ signal: ConsumerContractReadinessReport["providerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "verifier", pattern: /\bVerifier\b|verifyProvider|PactVerification|pactVerify|Pact\.service_provider/i, evidence: "provider verifier evidence was detected." },
    { signal: "provider-state", pattern: /provider state|provider states|@State|\bgiven\(|generate_from_provider_state|pathFromProviderState|valueFromProviderState/i, evidence: "provider state evidence was detected." },
    { signal: "state-handlers", pattern: /stateHandlers|providerStatesSetupUrl|state handler/i, evidence: "state handler evidence was detected." },
    { signal: "provider-base-url", pattern: /providerBaseUrl|provider base url|provider_base_url|provider.baseUrl/i, evidence: "provider base URL evidence was detected." },
    { signal: "verification-context", pattern: /PactVerificationContext|VerificationContext/i, evidence: "provider verification context evidence was detected." },
    { signal: "publish-results", pattern: /publishVerificationResult|publish.*verification|PACT_BROKER_PUBLISH_VERIFICATION_RESULTS/i, evidence: "verification result publishing evidence was detected." },
    { signal: "provider-version", pattern: /providerVersion|PACT_PROVIDER_VERSION|provider version/i, evidence: "provider version metadata evidence was detected." },
    { signal: "provider-branch", pattern: /providerVersionBranch|PACT_PROVIDER_BRANCH|provider branch|branch:/i, evidence: "provider branch metadata evidence was detected." }
  ];
  return consumerContractReadinessSignalFromSpecs(sourceFiles, specs, "provider", "signal");
}

function consumerContractReadinessBrokerSignals(sourceFiles: ConsumerContractReadinessSourceFile[]): ConsumerContractReadinessReport["brokerSignals"] {
  const specs: Array<{ signal: ConsumerContractReadinessReport["brokerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pact-broker", pattern: /pactBrokerUrl|Pact Broker|PactBroker|PACT_BROKER_BASE_URL|pact-broker/i, evidence: "Pact Broker evidence was detected." },
    { signal: "pactflow", pattern: /pactflow|PactFlow/i, evidence: "PactFlow evidence was detected." },
    { signal: "can-i-deploy", pattern: /can-i-deploy|canIDeploy|can_i_deploy/i, evidence: "can-i-deploy gate evidence was detected." },
    { signal: "consumer-version-selector", pattern: /consumerVersionSelectors|consumer version selector|consumer_version_selectors|matchingBranch|deployedOrReleased/i, evidence: "consumer version selector evidence was detected." },
    { signal: "pending-pacts", pattern: /enablePending|pending pacts?|pendingPacts/i, evidence: "pending pacts evidence was detected." },
    { signal: "wip-pacts", pattern: /includeWipPactsSince|WIP pacts?|wipPacts/i, evidence: "WIP pacts evidence was detected." },
    { signal: "webhook", pattern: /webhook|pact.*webhook/i, evidence: "broker webhook evidence was detected." },
    { signal: "token-auth", pattern: /pactBrokerToken|PACT_BROKER_TOKEN|broker.*token|PactBroker.*token/i, evidence: "broker token auth evidence was detected." }
  ];
  return consumerContractReadinessSignalFromSpecs(sourceFiles, specs, "broker", "signal");
}

function consumerContractReadinessMatcherSignals(sourceFiles: ConsumerContractReadinessSourceFile[]): ConsumerContractReadinessReport["matcherSignals"] {
  const specs: Array<{ signal: ConsumerContractReadinessReport["matcherSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "like", pattern: /MatchersV3\.like|\blike\(|\beach_like\(/i, evidence: "like matcher evidence was detected." },
    { signal: "each-like", pattern: /eachLike|each_like/i, evidence: "each-like matcher evidence was detected." },
    { signal: "regex", pattern: /regex|regexp|term\(|matchingRegex/i, evidence: "regex matcher evidence was detected." },
    { signal: "term", pattern: /\bterm\(|Term\(/i, evidence: "term matcher evidence was detected." },
    { signal: "from-provider-state", pattern: /fromProviderState|from_provider_state|pathFromProviderState|valueFromProviderState|generate_from_provider_state/i, evidence: "provider-state value generator evidence was detected." },
    { signal: "matching-rules", pattern: /matchingRules|matching rules/i, evidence: "matching rules evidence was detected." },
    { signal: "headers", pattern: /headers|withHeaders|matchHeader/i, evidence: "header contract evidence was detected." },
    { signal: "body", pattern: /\bbody\b|withBody|response body|request body/i, evidence: "body contract evidence was detected." }
  ];
  return consumerContractReadinessSignalFromSpecs(sourceFiles, specs, "matcher", "signal");
}

function consumerContractReadinessCiSignals(sourceFiles: ConsumerContractReadinessSourceFile[]): ConsumerContractReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ConsumerContractReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "publish-pact", pattern: /pact-broker\s+publish|publish.*pact|PACT_BROKER_BASE_URL/i, evidence: "pact publish evidence was detected." },
    { signal: "verify-provider", pattern: /verifyProvider|provider verification|pactVerify|mvn.*pact|gradle.*pact/i, evidence: "provider verification CI evidence was detected." },
    { signal: "junit", pattern: /junit|surefire|reports?/i, evidence: "JUnit/report evidence was detected." },
    { signal: "github-actions", pattern: /^\.github\/workflows\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "gradle", pattern: /gradle|build\.gradle|gradlew/i, evidence: "Gradle Pact workflow evidence was detected." },
    { signal: "maven", pattern: /maven|pom\.xml|mvn\s/i, evidence: "Maven Pact workflow evidence was detected." },
    { signal: "npm-script", pattern: /"[^"]*pact[^"]*"\s*:|"test:pact"|npm run .*pact|pnpm .*pact|yarn .*pact/i, evidence: "npm Pact script evidence was detected." },
    { signal: "rake-task", pattern: /rake.*pact|Pact::VerificationTask|pact:verify/i, evidence: "Rake Pact task evidence was detected." }
  ];
  return consumerContractReadinessSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function consumerContractReadinessPackageSignals(sourceFiles: ConsumerContractReadinessSourceFile[]): ConsumerContractReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ConsumerContractReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@pact-foundation/pact", pattern: /@pact-foundation\/pact/i, evidence: "Pact JS package evidence was detected." },
    { signal: "pact-jvm", pattern: /au\.com\.dius\.pact|pact-jvm|pact-jvm-provider|pact-jvm-consumer/i, evidence: "Pact JVM package evidence was detected." },
    { signal: "pact-ruby", pattern: /pact-ruby|\bgem ['"]pact['"]|Pact\.service_consumer/i, evidence: "Pact Ruby package evidence was detected." },
    { signal: "pact-broker-client", pattern: /pact-broker-client|pact_broker-client|pact-broker\s+(publish|can-i-deploy)/i, evidence: "Pact Broker client evidence was detected." },
    { signal: "pactflow", pattern: /pactflow|PactFlow/i, evidence: "PactFlow package or service evidence was detected." }
  ];
  return consumerContractReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function consumerContractReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ConsumerContractReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/consumer-contract-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

function parseJsonObject(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
