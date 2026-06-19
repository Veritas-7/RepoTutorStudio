import path from "node:path";
import type { DastReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDastReadinessReport(walk: WalkResult): Promise<DastReadinessReport> {
  const sourceFiles = await dastSourceFiles(walk);
  const dastSetups = dastSetupsFromSources(sourceFiles);
  const targetSignals = dastTargetSignals(sourceFiles);
  const scannerSignals = dastScannerSignals(sourceFiles);
  const crawlSignals = dastCrawlSignals(sourceFiles);
  const activeScanSignals = dastActiveScanSignals(sourceFiles);
  const authSignals = dastAuthSignals(sourceFiles);
  const templateSignals = dastTemplateSignals(sourceFiles);
  const safetySignals = dastSafetySignals(sourceFiles);
  const outputSignals = dastOutputSignals(sourceFiles);
  const ciSignals = dastCiSignals(sourceFiles);
  const packageSignals = dastPackageSignals(sourceFiles);

  const hasTarget = targetSignals.some((item) => item.readiness === "ready") || dastSetups.some((item) => item.targetCount > 0);
  const hasScanner = scannerSignals.some((item) => item.readiness === "ready") || dastSetups.length > 0;
  const hasCrawl = crawlSignals.some((item) => item.readiness === "ready") || dastSetups.some((item) => item.crawlerCount > 0);
  const hasActive = activeScanSignals.some((item) => item.readiness === "ready") || dastSetups.some((item) => item.activeScanCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || dastSetups.some((item) => item.safetyCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || dastSetups.some((item) => item.outputCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || dastSetups.some((item) => item.ciCount > 0);

  const riskQueue: DastReadinessReport["riskQueue"] = [];
  if (!hasScanner) {
    riskQueue.push({
      priority: "high",
      action: "Choose a DAST scanner before advertising dynamic security coverage.",
      why: "DAST readiness needs a concrete tool such as OWASP ZAP, nuclei, secureCodeBox, or a browser-driven scanner.",
      relatedHref: "html/dast-readiness.html"
    });
  }
  if (hasScanner && !hasTarget) {
    riskQueue.push({
      priority: "high",
      action: "Document safe scan targets, base URLs, API specs, or URL lists.",
      why: "Dynamic scanners can hit live systems; target ownership and environment boundaries must be explicit.",
      relatedHref: "html/dast-readiness.html"
    });
  }
  if (hasScanner && !hasCrawl && !hasActive) {
    riskQueue.push({
      priority: "medium",
      action: "Add crawl, baseline, active scan, fuzzing, or nuclei DAST template evidence.",
      why: "A scanner reference without scan mode does not prove how runtime attack surface is explored.",
      relatedHref: "html/dast-readiness.html"
    });
  }
  if ((hasCrawl || hasActive) && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Record scope, rate limits, timeouts, concurrency, allowlists, and safe-method controls.",
      why: "DAST can be disruptive without explicit safety controls around traffic and scope.",
      relatedHref: "html/dast-readiness.html"
    });
  }
  if ((hasCrawl || hasActive) && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Persist DAST output as JSON, SARIF, JUnit, HTML, Markdown, or CI artifacts.",
      why: "Dynamic findings need retained evidence for triage and comparison.",
      relatedHref: "html/dast-readiness.html"
    });
  }
  if (hasScanner && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Attach safe DAST checks to scheduled or pull-request workflows.",
      why: "Runtime security checks are most useful when tied to reviewable, repeatable environments.",
      relatedHref: "html/dast-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run OWASP ZAP, nuclei, secureCodeBox, browser, HTTP, spider, active scan, fuzzing, auth, and webhook commands only against authorized test targets.",
    why: "RepoTutor records static readiness metadata only and never sends traffic to applications or networks.",
    relatedHref: "html/dast-readiness.html"
  });

  return {
    summary: `DAST readiness report: setup ${dastSetups.length}개, scanner signal ${scannerSignals.length}개, crawl signal ${crawlSignals.length}개, active scan signal ${activeScanSignals.length}개, output signal ${outputSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "DAST readiness OWASP ZAP zap-baseline-scan zap-full-scan zap-api-scan spider ajaxSpider active scan context auth policy report nuclei -dast templates workflows severity rate-limit headless interactsh secureCodeBox ScanType parser hooks findings SARIF JUnit HTML",
    dastSetups,
    targetSignals,
    scannerSignals,
    crawlSignals,
    activeScanSignals,
    authSignals,
    templateSignals,
    safetySignals,
    outputSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"zap-baseline-scan|zap-full-scan|zap-api-scan|ZAP_AUTH|ajaxSpider|active scan|scan-policy\" .", purpose: "Find OWASP ZAP scan mode, auth, crawler, active scan, and policy evidence." },
      { command: "rg \"nuclei .* -dast|-dast|nuclei-templates|-severity|-tags|-exclude-tags|-rate-limit|-sarif-export|-json-export\" .", purpose: "Find nuclei DAST templates, filtering, rate limits, and retained output." },
      { command: "rg \"secureCodeBox|ScanType|parser|hook|finding|DefectDojo|lurker|scheduledScan\" .", purpose: "Find secureCodeBox scan orchestration, parser, hook, and finding persistence evidence." },
      { command: "rg \"BASE_URL|TARGET_URL|URL_LIST|OPENAPI|swagger|sitemap|pull_request|schedule|upload-artifact\" .github .", purpose: "Find target ownership, API specs, CI triggers, and artifact retention." }
    ],
    learnerNextSteps: [
      "Open DAST Readiness and verify the scanner is tied to an authorized target.",
      "Separate passive baseline checks from active scans or fuzzing before trusting safety posture.",
      "Review auth, scope, rate-limit, timeout, and allowlist signals before enabling CI traffic.",
      "Treat all DAST commands as external test-environment actions; RepoTutor only records static readiness."
    ]
  };
}

type DastSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dastSourceFiles(walk: WalkResult): Promise<DastSourceFile[]> {
  const files: DastSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dastInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!dastPathSignal(file.relPath) && !dastContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function dastInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dastPathSignal(filePath)
    || /(^|\/)(README|docs?|security|dast|zap|nuclei|securecodebox|scanner|scans?|ci|workflows?|scripts?|tests?|e2e)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|Dockerfile|docker-compose\.ya?ml|playwright\.config\.[cm]?[jt]s)$/i.test(base);
}

function dastPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)\.github\/workflows\//i.test(filePath)
    || /(zap|nuclei|securecodebox|dast|dynamic-security|security-scan)/i.test(filePath)
    || /^(zap\.ya?ml|nuclei\.ya?ml|\.nuclei-config\.ya?ml|scan\.ya?ml|scheduledscan\.ya?ml)$/i.test(base);
}

function dastContentSignal(text: string): boolean {
  return /(zap-baseline-scan|zap-full-scan|zap-api-scan|OWASP ZAP|ajaxSpider|active scan|nuclei\b|nuclei-templates|-dast|secureCodeBox|ScanType|DefectDojo|BASE_URL|TARGET_URL|OPENAPI|sitemap|SARIF|JUnit|upload-artifact)/i.test(text);
}

function dastSetupsFromSources(sourceFiles: DastSourceFile[]): DastReadinessReport["dastSetups"] {
  const rows: DastReadinessReport["dastSetups"] = [];
  for (const source of sourceFiles) {
    const targetCount = countMatches(source.text, /(BASE_URL|TARGET_URL|URL_LIST|target:|urls?:|openapi|swagger|graphql|sitemap|https?:\/\/)/gi);
    const crawlerCount = countMatches(source.text, /(spider|ajaxSpider|headless|follow-redirects|sitemap|crawl)/gi);
    const activeScanCount = countMatches(source.text, /(active scan|ascan|zap-full-scan|zap-api-scan|zap-baseline-scan|-dast|fuzz|attack policy|scan-policy|baseline|full scan)/gi);
    const authCount = countMatches(source.text, /(context|login|headers?|cookies?|token|Authorization|ZAP_AUTH|user:|username|password)/gi);
    const templateCount = countMatches(source.text, /(nuclei-templates|templates?:|-t\s+|-w\s+|workflow|severity|tags|exclude-tags|signature|disable-unsigned)/gi);
    const safetyCount = countMatches(source.text, /(rate-limit|rl:|timeout|concurrency|bulk-size|scope|allowlist|include|exclude|safe method|GET only|max-duration)/gi);
    const outputCount = countMatches(source.text, /(json|sarif|junit|html|markdown|md-report|xml-report|artifact|upload-artifact|report)/gi);
    const ciCount = countMatches(source.text, /(github actions|\.github\/workflows|schedule:|cron:|pull_request|upload-artifact)/gi);
    const findingCount = countMatches(source.text, /(finding|findings|alert|alerts|risk|severity|DefectDojo|SARIF|vulnerability)/gi);
    const totalSignals = targetCount + crawlerCount + activeScanCount + authCount + templateCount + safetyCount + outputCount + ciCount + findingCount;
    if (totalSignals === 0 && !dastPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: dastTool(source),
      targetCount,
      crawlerCount,
      activeScanCount,
      authCount,
      templateCount,
      safetyCount,
      outputCount,
      ciCount,
      findingCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} DAST readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.activeScanCount + b.crawlerCount + b.outputCount + b.safetyCount + b.ciCount;
    const aScore = a.activeScanCount + a.crawlerCount + a.outputCount + a.safetyCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function dastTool(source: DastSourceFile): DastReadinessReport["dastSetups"][number]["tool"] {
  if (/\.github\/workflows/i.test(source.filePath)) return "workflow";
  if (/package\.json$/i.test(source.filePath)) return "package-script";
  if (/README|docs?/i.test(source.filePath)) return "readme";
  if (/securecodebox|ScanType|scheduledscan/i.test(source.filePath) || /secureCodeBox|ScanType|scheduledScan|DefectDojo|lurker/i.test(source.text)) return "securecodebox";
  if (/nuclei/i.test(source.filePath) || /\bnuclei\b|nuclei-templates|-dast/i.test(source.text)) return "nuclei";
  if (/playwright/i.test(source.filePath) || /@playwright\/test|playwright/i.test(source.text)) return "playwright";
  if (/zap/i.test(source.filePath) || /OWASP ZAP|zap-baseline-scan|zap-full-scan|zap-api-scan|ajaxSpider/i.test(source.text)) return "zap";
  if (/github actions|pull_request|schedule:/i.test(source.text)) return "workflow";
  return "unknown";
}

function dastTargetSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["targetSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "base-url", pattern: /BASE_URL|TARGET_URL|base-url|target-url|https?:\/\//i, evidence: "Base URL target evidence was detected." },
    { signal: "url-list", pattern: /URL_LIST|urls?:\s*\[|targets?\.txt|input-file|-l\s+/i, evidence: "URL list evidence was detected." },
    { signal: "openapi", pattern: /openapi|openapi\.ya?ml|openapi\.json/i, evidence: "OpenAPI target evidence was detected." },
    { signal: "graphql", pattern: /graphql|gql/i, evidence: "GraphQL target evidence was detected." },
    { signal: "swagger", pattern: /swagger|api-docs/i, evidence: "Swagger target evidence was detected." },
    { signal: "sitemap", pattern: /sitemap\.xml|sitemap/i, evidence: "Sitemap target evidence was detected." },
    { signal: "environment", pattern: /staging|preview|review app|test environment|non-production/i, evidence: "Test environment evidence was detected." }
  ], "target");
}

function dastScannerSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["scannerSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "zap", pattern: /OWASP ZAP|zaproxy|zap-baseline-scan|zap-full-scan|zap-api-scan/i, evidence: "OWASP ZAP evidence was detected." },
    { signal: "nuclei", pattern: /\bnuclei\b|nuclei-templates|-dast/i, evidence: "nuclei evidence was detected." },
    { signal: "securecodebox", pattern: /secureCodeBox|ScanType|scheduledScan|lurker/i, evidence: "secureCodeBox evidence was detected." },
    { signal: "playwright", pattern: /@playwright\/test|playwright\.config|page\.goto|request\.newContext/i, evidence: "Playwright runtime test evidence was detected." }
  ], "scanner");
}

function dastCrawlSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["crawlSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "spider", pattern: /\bspider\b|zap-spider|spider.scan/i, evidence: "Spider crawl evidence was detected." },
    { signal: "ajax-spider", pattern: /ajaxSpider|ajax spider/i, evidence: "Ajax spider evidence was detected." },
    { signal: "headless", pattern: /headless|chromium|browser/i, evidence: "Headless browser evidence was detected." },
    { signal: "follow-redirects", pattern: /follow-redirects|follow redirects|max-redirects/i, evidence: "Redirect following evidence was detected." },
    { signal: "sitemap", pattern: /sitemap/i, evidence: "Sitemap crawl evidence was detected." }
  ], "crawl");
}

function dastActiveScanSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["activeScanSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "zap-active-scan", pattern: /active scan|ascan|zap-full-scan|zap-api-scan/i, evidence: "ZAP active scan evidence was detected." },
    { signal: "nuclei-dast", pattern: /\bnuclei\b[\s\S]{0,80}-dast|-dast[\s\S]{0,80}\bnuclei\b/i, evidence: "nuclei DAST mode evidence was detected." },
    { signal: "fuzzing", pattern: /fuzz|fuzzing|payload|attack/i, evidence: "Fuzzing evidence was detected." },
    { signal: "attack-policy", pattern: /attack policy|scan-policy|policy\.conf|ascan policy/i, evidence: "Attack policy evidence was detected." },
    { signal: "baseline", pattern: /zap-baseline-scan|baseline scan|baseline/i, evidence: "Baseline scan evidence was detected." },
    { signal: "full-scan", pattern: /zap-full-scan|full scan/i, evidence: "Full scan evidence was detected." }
  ], "active scan");
}

function dastAuthSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["authSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "context", pattern: /context|ZAP_CONTEXT|context_file/i, evidence: "Auth context evidence was detected." },
    { signal: "login", pattern: /login|sign in|signin|auth-url/i, evidence: "Login flow evidence was detected." },
    { signal: "headers", pattern: /headers?:|Authorization:|custom header|-H\s+/i, evidence: "Header auth evidence was detected." },
    { signal: "cookies", pattern: /cookie|cookies/i, evidence: "Cookie auth evidence was detected." },
    { signal: "token", pattern: /token|bearer|jwt|api[_-]?key/i, evidence: "Token auth evidence was detected." },
    { signal: "user", pattern: /user:|username|password|ZAP_AUTH/i, evidence: "User credential workflow evidence was detected." }
  ], "auth");
}

function dastTemplateSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["templateSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "nuclei-template", pattern: /nuclei-templates|templates?:|-t\s+|template-id/i, evidence: "nuclei template evidence was detected." },
    { signal: "workflow", pattern: /workflows?:|-w\s+|workflow-url/i, evidence: "nuclei workflow evidence was detected." },
    { signal: "severity", pattern: /severity|-severity|-s\s+|critical|high|medium|low/i, evidence: "Severity filter evidence was detected." },
    { signal: "tags", pattern: /tags|-tags|-etags|exclude-tags/i, evidence: "Tag filter evidence was detected." },
    { signal: "exclude", pattern: /exclude|exclude-templates|exclude-id|exclude-severity/i, evidence: "Template exclusion evidence was detected." },
    { signal: "signature", pattern: /signature|signed templates|disable-unsigned|sign templates/i, evidence: "Template signature evidence was detected." }
  ], "template");
}

function dastSafetySignals(sourceFiles: DastSourceFile[]): DastReadinessReport["safetySignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "rate-limit", pattern: /rate-limit|rl:|-rl\s+|requests per second/i, evidence: "Rate-limit evidence was detected." },
    { signal: "scope", pattern: /scope|in-scope|out-of-scope|include|exclude/i, evidence: "Scope control evidence was detected." },
    { signal: "timeout", pattern: /timeout|max-duration|scan timeout/i, evidence: "Timeout evidence was detected." },
    { signal: "concurrency", pattern: /concurrency|bulk-size|threads|parallel/i, evidence: "Concurrency control evidence was detected." },
    { signal: "safe-methods", pattern: /safe methods|GET only|passive|baseline|disable destructive/i, evidence: "Safe method evidence was detected." },
    { signal: "allowlist", pattern: /allowlist|allow-list|allowed hosts|target allow/i, evidence: "Allowlist evidence was detected." }
  ], "safety");
}

function dastOutputSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["outputSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "json", pattern: /json-report|-json-export|json output|\.json\b/i, evidence: "JSON output evidence was detected." },
    { signal: "sarif", pattern: /sarif|sarif-export|\.sarif\b/i, evidence: "SARIF output evidence was detected." },
    { signal: "junit", pattern: /junit|xml-report|\.xml\b/i, evidence: "JUnit/XML output evidence was detected." },
    { signal: "html", pattern: /html-report|\.html\b|HTML/i, evidence: "HTML output evidence was detected." },
    { signal: "markdown", pattern: /markdown|md-report|\.md\b/i, evidence: "Markdown output evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact upload|actions\/upload-artifact/i, evidence: "Artifact upload evidence was detected." }
  ], "output");
}

function dastCiSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["ciSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "scheduled-run", pattern: /schedule:|cron:|scheduled/i, evidence: "Scheduled DAST run evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|merge_request|pull request|pr comment/i, evidence: "Pull request evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact upload|actions\/upload-artifact/i, evidence: "Artifact upload evidence was detected." }
  ], "CI");
}

function dastPackageSignals(sourceFiles: DastSourceFile[]): DastReadinessReport["packageSignals"] {
  return dastSignalFromSpecs(sourceFiles, [
    { signal: "zap", pattern: /zaproxy|zap-baseline-scan|zap-full-scan|zap-api-scan|owasp\/zap/i, evidence: "ZAP package/tool evidence was detected." },
    { signal: "nuclei", pattern: /"nuclei"|\bnuclei\b|projectdiscovery\/nuclei/i, evidence: "nuclei package/tool evidence was detected." },
    { signal: "securecodebox", pattern: /secureCodeBox|securecodebox|ScanType/i, evidence: "secureCodeBox package/tool evidence was detected." },
    { signal: "playwright", pattern: /@playwright\/test|playwright/i, evidence: "Playwright package/tool evidence was detected." }
  ], "package");
}

function dastSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: DastSourceFile[],
  specs: T,
  label: string
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/dast-readiness.html"
    };
  });
}
