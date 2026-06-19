import path from "node:path";
import type { InterfaceMapReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export async function buildInterfaceMapReport(walk: WalkResult): Promise<InterfaceMapReport> {
  const routeSignals = walk.files
    .map((file) => ({ filePath: file.relPath, kind: routeKindFor(file.relPath), signal: routeSignalFor(file.relPath), sourceHref: `source/${encodedPath(file.relPath)}` }))
    .filter((item) => item.kind !== null && item.signal !== null)
    .map((item) => ({ filePath: item.filePath, kind: item.kind as string, signal: item.signal as string, sourceHref: item.sourceHref }))
    .slice(0, 30);
  const apiSignals: InterfaceMapReport["apiSignals"] = [];
  const componentSignals: InterfaceMapReport["componentSignals"] = [];

  for (const file of walk.files.filter((candidate) => candidate.isTextCandidate).slice(0, 120)) {
    const text = await readTextIfSafe(file.absPath, 80_000);
    if (!text) continue;
    apiSignals.push(...extractApiSignals(file.relPath, text).slice(0, 8));
    componentSignals.push(...extractComponentSignals(file.relPath, text).slice(0, 4));
  }

  const limitedApiSignals = apiSignals.slice(0, 40);
  const limitedComponentSignals = componentSignals.slice(0, 40);
  return {
    summary: `repomap식 인터페이스 맵: route/page 신호 ${routeSignals.length}개, API 호출/핸들러 ${limitedApiSignals.length}개, 컴포넌트 ${limitedComponentSignals.length}개를 정적으로 확인했습니다.`,
    sourcePattern: "repomap page routes GraphQL REST data flow analysis",
    routeSignals,
    apiSignals: limitedApiSignals,
    componentSignals: limitedComponentSignals,
    dataFlowHints: buildDataFlowHints(routeSignals, limitedApiSignals, limitedComponentSignals),
    learnerNextSteps: [
      "route/page 파일에서 사용자가 들어오는 화면 또는 엔드포인트를 먼저 확인하세요.",
      "API 신호가 있는 파일을 열어 데이터가 어디서 들어오고 어디로 전달되는지 추적하세요.",
      "컴포넌트 신호와 route 신호를 연결해 화면과 데이터 흐름을 한 줄로 설명해 보세요."
    ]
  };
}

function routeKindFor(filePath: string): string | null {
  const normalized = filePath.toLowerCase();
  const base = path.basename(normalized);
  if (/^config\/routes\.rb$/.test(normalized)) return "rails-routes";
  if (normalized.includes("/controllers/") || base.endsWith("_controller.rb")) return "controller";
  if (normalized.includes("/routes/")) return "router";
  if (normalized.includes("/pages/")) return "page";
  if (normalized.includes("/app/") && ["page.tsx", "page.jsx", "layout.tsx", "layout.jsx", "route.ts", "route.js"].includes(base)) return "app-router";
  if (["app.tsx", "app.jsx", "main.tsx", "main.jsx"].includes(base)) return "spa-entry";
  return null;
}

function routeSignalFor(filePath: string): string | null {
  const kind = routeKindFor(filePath);
  if (!kind) return null;
  if (kind === "page") return "페이지 파일 경로로부터 사용자 진입 화면을 추정합니다.";
  if (kind === "app-router") return "App Router 파일명으로 화면, layout, route handler를 추정합니다.";
  if (kind === "controller") return "컨트롤러 파일로 서버 요청 처리 지점을 추정합니다.";
  if (kind === "router") return "routes 폴더 파일로 라우팅 정의 지점을 추정합니다.";
  if (kind === "rails-routes") return "Rails routes 설정 파일입니다.";
  return "SPA 진입점에서 클라이언트 라우팅 또는 화면 조립을 추정합니다.";
}

function extractApiSignals(filePath: string, text: string): InterfaceMapReport["apiSignals"] {
  const rows: InterfaceMapReport["apiSignals"] = [];
  const patterns: Array<{ regex: RegExp; method: (match: RegExpMatchArray) => string; pattern: (match: RegExpMatchArray) => string }> = [
    { regex: /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g, method: () => "FETCH", pattern: (match) => match[1] },
    { regex: /axios\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi, method: (match) => match[1].toUpperCase(), pattern: (match) => match[2] },
    { regex: /\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi, method: (match) => match[1].toUpperCase(), pattern: (match) => match[2] },
    { regex: /@app\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi, method: (match) => match[1].toUpperCase(), pattern: (match) => match[2] }
  ];
  for (const { regex, method, pattern } of patterns) {
    for (const match of text.matchAll(regex)) {
      rows.push({
        filePath,
        method: method(match),
        pattern: pattern(match).slice(0, 120),
        sourceHref: `source/${encodedPath(filePath)}`
      });
    }
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.filePath}:${row.method}:${row.pattern}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractComponentSignals(filePath: string, text: string): InterfaceMapReport["componentSignals"] {
  if (!/\.(tsx|jsx)$/.test(filePath)) return [];
  const rows: InterfaceMapReport["componentSignals"] = [];
  for (const match of text.matchAll(/(?:export\s+default\s+)?function\s+([A-Z][A-Za-z0-9_]*)|const\s+([A-Z][A-Za-z0-9_]*)\s*=/g)) {
    rows.push({
      filePath,
      componentName: match[1] ?? match[2],
      sourceHref: `source/${encodedPath(filePath)}`
    });
  }
  return rows;
}

function buildDataFlowHints(routeSignals: InterfaceMapReport["routeSignals"], apiSignals: InterfaceMapReport["apiSignals"], componentSignals: InterfaceMapReport["componentSignals"]): string[] {
  return [
    routeSignals.length > 0 ? `${routeSignals[0].filePath} 같은 route/page 파일에서 사용자 진입점을 시작하세요.` : "route/page 파일 신호가 없어 README와 main/app 파일을 먼저 확인하세요.",
    apiSignals.length > 0 ? `${apiSignals[0].filePath}에서 ${apiSignals[0].method} ${apiSignals[0].pattern} API 신호를 확인했습니다.` : "fetch/axios/router HTTP 신호가 없어 데이터 흐름은 import/export와 상태 관리 파일에서 추적해야 합니다.",
    componentSignals.length > 0 ? `${componentSignals[0].componentName} 컴포넌트를 화면 조립 단서로 사용할 수 있습니다.` : "명명된 React 컴포넌트 신호가 적어 파일명과 default export를 함께 확인하세요."
  ];
}
