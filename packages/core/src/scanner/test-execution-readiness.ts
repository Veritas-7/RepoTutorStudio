import path from "node:path";
import type { E2eReport, FlakyTestReadinessReport, RuntimeEnvironmentReport, SnapshotReadinessReport, TestImpactReadinessReport, TestReportingReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildE2eReport(
  walk: WalkResult,
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): Promise<E2eReport> {
  const sourceFiles = await e2eSourceFiles(walk);
  const testSuites = e2eTestSuites(sourceFiles);
  const browserProjects = e2eBrowserProjects(sourceFiles);
  const locatorSignals = e2eLocatorSignals(sourceFiles);
  const assertions = e2eAssertions(sourceFiles);
  const artifacts = e2eArtifacts(sourceFiles);
  const runtimeTargets = e2eRuntimeTargets(sourceFiles, runtimeEnvironmentReport);
  const playwrightSignals = e2ePlaywrightSignals(sourceFiles);
  const hasSuite = testSuites.some((item) => item.readiness === "ready");
  const hasLocator = locatorSignals.length > 0;
  const hasAssertion = assertions.some((item) => item.readiness === "ready");
  const hasArtifact = artifacts.some((item) => item.artifact !== "none" && item.readiness !== "missing");
  const hasRuntime = runtimeTargets.some((item) => item.target === "web-server" && item.readiness === "ready")
    || runtimeTargets.some((item) => item.target === "base-url" && item.readiness === "ready");

  const riskQueue: E2eReport["riskQueue"] = [];
  if (!hasSuite) {
    riskQueue.push({
      priority: "high",
      action: "Add a Playwright test suite or equivalent browser E2E tests before claiming user-flow coverage.",
      why: "Browser readiness requires executable tests that drive real pages or API contexts.",
      relatedHref: "html/e2e.html"
    });
  }
  if (hasSuite && !hasRuntime) {
    riskQueue.push({
      priority: "high",
      action: "Configure webServer or baseURL so E2E tests can start and target the app deterministically.",
      why: "Tests that depend on an already-running local server are harder to reproduce in CI.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (hasSuite && !hasLocator) {
    riskQueue.push({
      priority: "medium",
      action: "Prefer user-facing locators such as getByRole, getByLabel, getByText, or getByTestId.",
      why: "Playwright's resilient locator model reduces brittle CSS/XPath coupling.",
      relatedHref: "html/e2e.html"
    });
  }
  if (hasSuite && !hasAssertion) {
    riskQueue.push({
      priority: "medium",
      action: "Add web-first assertions for URL, visibility, title, text, network, or snapshots.",
      why: "Navigation without assertions only proves automation can click, not that the flow works.",
      relatedHref: "html/e2e.html"
    });
  }
  if (hasSuite && !hasArtifact) {
    riskQueue.push({
      priority: "medium",
      action: "Enable trace, screenshot, video, HTML, JUnit, or JSON artifacts for failed tests.",
      why: "E2E failures are expensive to triage without retained browser evidence.",
      relatedHref: "html/e2e.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Playwright against the original app before treating this report as an E2E pass.",
    why: "RepoTutor only performs static readiness analysis and never launches a browser.",
    relatedHref: "html/e2e.html"
  });

  return {
    summary: `Playwright식 E2E readiness report: test suite ${testSuites.length}개, browser project ${browserProjects.length}개, locator signal ${locatorSignals.length}개, Playwright signal ${playwrightSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Playwright browser E2E tests defineConfig fixtures projects devices locators assertions poll toPass traces screenshots video reporters CI webServer storageState APIRequestContext",
    testSuites,
    browserProjects,
    locatorSignals,
    assertions,
    artifacts,
    runtimeTargets,
    playwrightSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm init playwright@latest", purpose: "Scaffold Playwright Test configuration and starter browser tests." },
      { command: "npx playwright install --with-deps", purpose: "Install browser binaries and system dependencies for CI-like runs." },
      { command: "npx playwright test", purpose: "Run the configured E2E test suite." },
      { command: "npx playwright test --project=chromium --reporter=html,junit", purpose: "Run one browser project while producing local HTML and CI-readable JUnit output." },
      { command: "npx playwright show-trace trace.zip", purpose: "Open a retained trace artifact for failed-test triage." }
    ],
    learnerNextSteps: [
      "먼저 Playwright config와 test suite가 있는지 확인하세요.",
      "webServer 또는 baseURL이 없으면 로컬/CI 재현성이 약합니다.",
      "getByRole/getByLabel/getByText 같은 사용자 중심 locator와 web-first assertion을 함께 보세요.",
      "이 리포트는 브라우저 실행 결과가 아닙니다. 실제 pass/fail은 원본 앱에서 별도 실행하세요."
    ]
  };
}

type E2eSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function e2eSourceFiles(walk: WalkResult): Promise<E2eSourceFile[]> {
  const files: E2eSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !e2eInspectablePath(file.relPath)) continue;
    const pathCandidate = e2ePathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !e2eContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 140) break;
  }
  return files;
}

function e2eInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s|wdio\.conf\.[cm]?[jt]s|selenium.*\.(json|ya?ml)|docker-compose\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md|feature)$/i.test(filePath);
}

function e2ePathSignal(filePath: string): boolean {
  return /(playwright|cypress|selenium|webdriverio|wdio|e2e|end-to-end|browser|ui-test|trace|screenshots?|videos?|test-results?)/i.test(filePath);
}

function e2eContentSignal(text: string): boolean {
  return /(@playwright\/test|playwright\.config|defineConfig|npx playwright|test\(|expect\(page|expect\.poll|toPass\(|test\.step|test\.use|APIRequestContext|page\.goto|getByRole|getByText|getByLabel|getByTestId|page\.locator|toBeVisible|toHaveURL|toHaveTitle|trace:|screenshot:|video:|webServer|baseURL|storageState|cypress|cy\.|selenium|webdriverio|browser\.url)/i.test(text);
}

function e2eTestSuites(sourceFiles: E2eSourceFile[]): E2eReport["testSuites"] {
  const rows: E2eReport["testSuites"] = [];
  for (const source of sourceFiles) {
    const framework = e2eFrameworkFor(source.filePath, source.text);
    if (framework === "unknown" && !/\b(test|it)\s*\(|describe\s*\(/i.test(source.text)) continue;
    rows.push({
      filePath: source.filePath,
      framework,
      readiness: framework === "unknown" ? "partial" : "ready",
      evidence: e2eSuiteEvidence(source.filePath, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function e2eFrameworkFor(filePath: string, text: string): E2eReport["testSuites"][number]["framework"] {
  if (/@playwright\/test|playwright\.config|npx playwright|from ["']playwright|from ["']@playwright/i.test(text) || /playwright/i.test(filePath)) return "playwright";
  if (/cypress|cy\./i.test(text) || /cypress/i.test(filePath)) return "cypress";
  if (/selenium|webdriver\.|By\./i.test(text) || /selenium/i.test(filePath)) return "selenium";
  if (/webdriverio|browser\.url|\$\(.*\)\.click|wdio/i.test(text) || /wdio|webdriverio/i.test(filePath)) return "webdriverio";
  return "unknown";
}

function e2eSuiteEvidence(filePath: string, text: string): string {
  if (/playwright\.config|defineConfig/i.test(text)) return `${filePath} configures Playwright Test.`;
  if (/@playwright\/test/i.test(text)) return `${filePath} imports Playwright Test fixtures and assertions.`;
  if (/cypress|cy\./i.test(text)) return `${filePath} contains Cypress browser test evidence.`;
  if (/selenium/i.test(text)) return `${filePath} contains Selenium browser automation evidence.`;
  if (/webdriverio|browser\.url/i.test(text)) return `${filePath} contains WebdriverIO browser automation evidence.`;
  return `${filePath} has browser/E2E test-shaped evidence.`;
}

function e2eBrowserProjects(sourceFiles: E2eSourceFile[]): E2eReport["browserProjects"] {
  const specs: Array<{ browser: E2eReport["browserProjects"][number]["browser"]; pattern: RegExp; evidence: string }> = [
    { browser: "chromium", pattern: /chromium|Desktop Chrome|Google Chrome/i, evidence: "Chromium browser project is configured or referenced." },
    { browser: "firefox", pattern: /firefox|Desktop Firefox/i, evidence: "Firefox browser project is configured or referenced." },
    { browser: "webkit", pattern: /webkit|Desktop Safari|Safari/i, evidence: "WebKit/Safari browser project is configured or referenced." },
    { browser: "mobile", pattern: /Pixel 5|iPhone|iPad|devices\[/i, evidence: "Mobile device project or device descriptor is configured." },
    { browser: "api", pattern: /request\.newContext|APIRequestContext|api testing|playwright\/test.*request/i, evidence: "Playwright API testing context is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      browser: spec.browser,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.browser} project evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/e2e.html"
    };
  });
}

function e2eLocatorSignals(sourceFiles: E2eSourceFile[]): E2eReport["locatorSignals"] {
  const specs: Array<{ locatorType: E2eReport["locatorSignals"][number]["locatorType"]; pattern: RegExp; evidence: string }> = [
    { locatorType: "role", pattern: /getByRole\s*\(/i, evidence: "uses role-based user-facing locators." },
    { locatorType: "text", pattern: /getByText\s*\(|locator\(\s*["']text=/i, evidence: "uses visible text locators." },
    { locatorType: "label", pattern: /getByLabel\s*\(|getByPlaceholder\s*\(/i, evidence: "uses form label or placeholder locators." },
    { locatorType: "testid", pattern: /getByTestId\s*\(|data-testid|data-test-id/i, evidence: "uses stable test id locators." },
    { locatorType: "css", pattern: /page\.locator\s*\(\s*["'][#.A-Za-z[]|locator\(\s*["']css=/i, evidence: "uses CSS locator selectors." },
    { locatorType: "xpath", pattern: /locator\(\s*["']xpath=|\/\/[A-Za-z]/i, evidence: "uses XPath locator selectors." },
    { locatorType: "page-object", pattern: /class\s+\w*(Page|Pom|Object)|Page Object|POM/i, evidence: "uses a page object model or page wrapper." }
  ];
  const rows: E2eReport["locatorSignals"] = [];
  for (const source of sourceFiles) {
    for (const spec of specs) {
      if (!spec.pattern.test(source.text) && !spec.pattern.test(source.filePath)) continue;
      rows.push({
        filePath: source.filePath,
        locatorType: spec.locatorType,
        readiness: "ready",
        evidence: `${source.filePath} ${spec.evidence}`,
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 80);
}

function e2eAssertions(sourceFiles: E2eSourceFile[]): E2eReport["assertions"] {
  const specs: Array<{ assertion: E2eReport["assertions"][number]["assertion"]; pattern: RegExp; evidence: string }> = [
    { assertion: "url", pattern: /toHaveURL|url\(\)|expect\(.*url/i, evidence: "URL assertion evidence was detected." },
    { assertion: "visible", pattern: /toBeVisible|toBeHidden|isVisible/i, evidence: "Visibility assertion evidence was detected." },
    { assertion: "text", pattern: /toHaveText|toContainText|textContent/i, evidence: "Text assertion evidence was detected." },
    { assertion: "title", pattern: /toHaveTitle|title\(\)/i, evidence: "Title assertion evidence was detected." },
    { assertion: "network", pattern: /waitForResponse|route\(|request\.|response\.|toHaveStatus/i, evidence: "Network/API assertion or routing evidence was detected." },
    { assertion: "snapshot", pattern: /toHaveScreenshot|toMatchSnapshot|snapshot/i, evidence: "Snapshot assertion evidence was detected." },
    { assertion: "accessibility", pattern: /aria|accessibility|axe|toHaveAccessibleName|toHaveAccessibleDescription/i, evidence: "Accessibility assertion evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      assertion: spec.assertion,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.assertion} assertion evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/e2e.html"
    };
  });
}

function e2eArtifacts(sourceFiles: E2eSourceFile[]): E2eReport["artifacts"] {
  const specs: Array<{ artifact: Exclude<E2eReport["artifacts"][number]["artifact"], "none">; pattern: RegExp; evidence: string }> = [
    { artifact: "trace", pattern: /trace\s*:|show-trace|trace\.zip|trace viewer/i, evidence: "trace artifact capture is configured or documented." },
    { artifact: "screenshot", pattern: /screenshot\s*:|toHaveScreenshot|page\.screenshot|screenshots?/i, evidence: "screenshot artifact capture is configured or documented." },
    { artifact: "video", pattern: /video\s*:|recordVideo|videos?/i, evidence: "video artifact capture is configured or documented." },
    { artifact: "html-report", pattern: /reporter\s*:.*html|html reporter|show-report|playwright-report/i, evidence: "HTML reporter output is configured or documented." },
    { artifact: "junit", pattern: /reporter\s*:.*junit|\bjunit\b/i, evidence: "JUnit reporter output is configured or documented." },
    { artifact: "json", pattern: /reporter\s*:.*json|\bjson reporter\b|test-results\.json/i, evidence: "JSON reporter output is configured or documented." }
  ];
  const rows: E2eReport["artifacts"] = [];
  for (const spec of specs) {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (!match) continue;
    rows.push({ artifact: spec.artifact, readiness: "ready", evidence: `${match.filePath} ${spec.evidence}`, relatedHref: match.sourceHref });
  }
  if (rows.length === 0) {
    rows.push({ artifact: "none", readiness: "missing", evidence: "No trace, screenshot, video, HTML, JUnit, or JSON E2E artifact signal was detected.", relatedHref: "html/e2e.html" });
  }
  return rows;
}

function e2eRuntimeTargets(
  sourceFiles: E2eSourceFile[],
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): E2eReport["runtimeTargets"] {
  const specs: Array<{ target: E2eReport["runtimeTargets"][number]["target"]; pattern: RegExp; evidence: string }> = [
    { target: "web-server", pattern: /webServer\s*:|reuseExistingServer|npm run dev|pnpm dev|yarn dev/i, evidence: "webServer or dev-server startup is configured." },
    { target: "base-url", pattern: /baseURL\s*:|PLAYWRIGHT_BASE_URL|process\.env\.\w*BASE_URL/i, evidence: "baseURL target is configured." },
    { target: "env-vars", pattern: /process\.env|dotenv|PLAYWRIGHT_|CI\b/i, evidence: "environment variable controls are referenced." },
    { target: "parallel-workers", pattern: /workers\s*:|fullyParallel|parallel/i, evidence: "parallel worker controls are configured." },
    { target: "retries", pattern: /retries\s*:|--retries/i, evidence: "retry controls are configured." },
    { target: "ci-artifacts", pattern: /upload-artifact|actions\/upload-artifact|test-results|playwright-report/i, evidence: "CI artifact upload or retained test output is configured." },
    { target: "storage-state", pattern: /storageState|auth\.json|context\(\)\.storageState/i, evidence: "authenticated storage state reuse is configured." }
  ];
  const runtimeSignals = runtimeEnvironmentReport.setupSignals.length + runtimeEnvironmentReport.containerSignals.length;
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (match) return { target: spec.target, readiness: "ready", evidence: `${match.filePath} ${spec.evidence}`, relatedHref: match.sourceHref };
    return {
      target: spec.target,
      readiness: runtimeSignals > 0 && ["web-server", "base-url", "env-vars"].includes(spec.target) ? "external" : "missing",
      evidence: `${spec.target} runtime target was not detected in E2E files.`,
      relatedHref: "html/runtime-environment.html"
    };
  });
}

function e2ePlaywrightSignals(sourceFiles: E2eSourceFile[]): E2eReport["playwrightSignals"] {
  const specs: Array<{ signal: E2eReport["playwrightSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "define-config", pattern: /defineConfig\s*\(|playwright\.config\.[cm]?[jt]s/i, evidence: "Playwright defineConfig or config file evidence was detected." },
    { signal: "test-fixtures", pattern: /test\.extend\s*\(|\(\s*\{\s*(page|browser|context|request)\b|async\s*\(\s*\{\s*(page|browser|context|request)\b/i, evidence: "Playwright test fixture usage was detected." },
    { signal: "test-describe", pattern: /test\.describe\s*\(/i, evidence: "test.describe suite grouping evidence was detected." },
    { signal: "test-step", pattern: /test\.step\s*\(/i, evidence: "test.step trace grouping evidence was detected." },
    { signal: "test-use", pattern: /test\.use\s*\(/i, evidence: "test.use scoped option evidence was detected." },
    { signal: "projects", pattern: /\bprojects\s*:/i, evidence: "Playwright projects configuration evidence was detected." },
    { signal: "devices", pattern: /\bdevices\s*\[|import\s+\{\s*[^}]*devices[^}]*\}\s+from\s+['"]@playwright\/test['"]/i, evidence: "Playwright device descriptor evidence was detected." },
    { signal: "web-server", pattern: /\bwebServer\s*:|reuseExistingServer|config\.webServer/i, evidence: "Playwright webServer startup evidence was detected." },
    { signal: "storage-state", pattern: /storageState|auth\.json|\.storageState\s*\(/i, evidence: "Playwright storageState authentication evidence was detected." },
    { signal: "api-request", pattern: /APIRequestContext|\bpage\.request\.|\brequest\.(get|post|put|delete|patch|newContext|fetch)\s*\(/i, evidence: "Playwright API request context evidence was detected." },
    { signal: "role-locator", pattern: /getByRole\s*\(/i, evidence: "User-facing role locator evidence was detected." },
    { signal: "testid-locator", pattern: /getByTestId\s*\(|data-testid|data-test-id/i, evidence: "Stable test id locator evidence was detected." },
    { signal: "expect-poll", pattern: /expect(?:\.soft)?\.poll\s*\(/i, evidence: "expect.poll asynchronous assertion evidence was detected." },
    { signal: "expect-to-pass", pattern: /\.toPass\s*\(/i, evidence: "expect.toPass retry block evidence was detected." },
    { signal: "trace", pattern: /\btrace\s*:|--trace|show-trace|trace\.zip|Trace Viewer/i, evidence: "Trace capture or trace viewer evidence was detected." },
    { signal: "screenshot", pattern: /screenshot\s*:|--screenshot|toHaveScreenshot|page\.screenshot|screenshots?/i, evidence: "Screenshot artifact evidence was detected." },
    { signal: "video", pattern: /\bvideo\s*:|recordVideo|videos?/i, evidence: "Video artifact evidence was detected." },
    { signal: "reporter", pattern: /\breporter\s*:|--reporter|html reporter|junit|blob-report|playwright-report/i, evidence: "Playwright reporter evidence was detected." },
    { signal: "retries", pattern: /\bretries\s*:|--retries|on-first-retry/i, evidence: "Playwright retry control evidence was detected." },
    { signal: "workers", pattern: /\bworkers\s*:|--workers/i, evidence: "Playwright worker count control evidence was detected." },
    { signal: "timeout", pattern: /\btimeout\s*:|globalTimeout|expect\.configure\s*\([^)]*timeout|--timeout/i, evidence: "Playwright timeout control evidence was detected." },
    { signal: "fully-parallel", pattern: /fullyParallel|test\.describe\.configure\s*\(\s*\{[^}]*mode\s*:\s*['"]parallel/i, evidence: "Playwright full parallelism control evidence was detected." },
    { signal: "shard", pattern: /--shard|\bshard\s*:|\bsharding\b|matrix:[\s\S]{0,120}\bshard\b/i, evidence: "Playwright sharding evidence was detected." },
    { signal: "ui-mode", pattern: /--ui\b|UI Mode|npx playwright test --ui/i, evidence: "Playwright UI mode evidence was detected." },
    { signal: "codegen", pattern: /playwright codegen|npx playwright codegen|\bcodegen\b/i, evidence: "Playwright codegen evidence was detected." },
    { signal: "debug-mode", pattern: /PWDEBUG|--debug|Playwright Inspector|debug mode/i, evidence: "Playwright debug mode evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/e2e.html"
    };
  });
}

export async function buildFlakyTestReadinessReport(walk: WalkResult): Promise<FlakyTestReadinessReport> {
  const sourceFiles = await flakyTestSourceFiles(walk);
  const flakyTestSetups = flakyTestSetupRows(sourceFiles);
  const frameworkSignals = flakyFrameworkSignals(sourceFiles);
  const retrySignals = flakyRetrySignals(sourceFiles);
  const quarantineSignals = flakyQuarantineSignals(sourceFiles);
  const isolationSignals = flakyIsolationSignals(sourceFiles);
  const artifactSignals = flakyArtifactSignals(sourceFiles);
  const ciSignals = flakyCiSignals(sourceFiles);
  const packageSignals = flakyPackageSignals(sourceFiles);
  const hasRetry = retrySignals.some((item) => ["retries", "reruns", "retry-times"].includes(item.signal) && item.readiness === "ready");
  const hasQuarantine = quarantineSignals.some((item) => item.readiness === "ready");
  const hasArtifact = artifactSignals.some((item) => item.readiness === "ready");
  const hasFailOnFlaky = retrySignals.some((item) => item.signal === "fail-on-flaky" && item.readiness === "ready");

  const riskQueue: FlakyTestReadinessReport["riskQueue"] = [];
  if (!hasRetry) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit retry or rerun policy before treating intermittent failures as managed flakes.",
      why: "Flaky-test readiness starts with visible retry budgets such as Playwright retries, pytest-rerunfailures, or jest.retryTimes.",
      relatedHref: "html/flaky-test-readiness.html"
    });
  }
  if (hasRetry && !hasQuarantine) {
    riskQueue.push({
      priority: "high",
      action: "Add a quarantine or ownership path for repeated flakes.",
      why: "Retries reduce transient failure noise, but unowned flakes can hide regressions indefinitely.",
      relatedHref: "html/flaky-test-readiness.html"
    });
  }
  if (hasRetry && !hasArtifact) {
    riskQueue.push({
      priority: "medium",
      action: "Retain trace, screenshot, video, report, or CI artifact evidence for retry attempts.",
      why: "Flake triage needs retry-specific artifacts to distinguish environment noise from product bugs.",
      relatedHref: "html/flaky-test-readiness.html"
    });
  }
  if (hasRetry && !hasFailOnFlaky) {
    riskQueue.push({
      priority: "medium",
      action: "Consider fail-on-flaky gates in CI once retry evidence is stable.",
      why: "Fail-on-flaky prevents retry masking from becoming a silent quality regression.",
      relatedHref: "html/flaky-test-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original test toolchain before claiming a flaky-test policy pass.",
    why: "RepoTutor only performs static readiness analysis and never reruns tests or opens retained traces.",
    relatedHref: "html/flaky-test-readiness.html"
  });

  return {
    summary: `Flaky test readiness report: setup ${flakyTestSetups.length}개, retry signal ${retrySignals.filter((item) => item.readiness === "ready").length}개, quarantine signal ${quarantineSignals.filter((item) => item.readiness === "ready").length}개, artifact signal ${artifactSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Flaky test readiness Playwright retries failOnFlakyTests trace on-first-retry pytest-rerunfailures --reruns --fail-on-flaky jest.retryTimes quarantine skip fixme xfail artifacts",
    flakyTestSetups,
    frameworkSignals,
    retrySignals,
    quarantineSignals,
    isolationSignals,
    artifactSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx playwright test --retries=2 --trace=on-first-retry", purpose: "Run Playwright with bounded retries and retry trace evidence." },
      { command: "pytest --reruns 3 --reruns-delay 2 --fail-on-flaky -r aR", purpose: "Run pytest-rerunfailures with delay, RERUN reporting, and fail-on-flaky behavior." },
      { command: "npx jest --runInBand --detectOpenHandles", purpose: "Reduce Jest concurrency noise while checking open handles during flake triage." },
      { command: "rg \"retries|retryTimes|--reruns|flaky|fixme|xfail|trace: 'on-first-retry'|failOnFlakyTests\" .", purpose: "Locate static retry, quarantine, and flaky-test policy signals." },
      { command: "rg \"upload-artifact|playwright-report|test-results|junit|blob-report|GITHUB_STEP_SUMMARY\" .github tests", purpose: "Locate retained CI artifacts for retry triage." }
    ],
    learnerNextSteps: [
      "retry/rerun 설정이 있는지 먼저 확인하세요.",
      "반복 실패를 격리할 quarantine, skip/fixme, xfail, owner, issue 링크가 있는지 보세요.",
      "trace, screenshot, video, JUnit, HTML report 같은 retry evidence가 남는지 확인하세요.",
      "이 리포트는 테스트를 재실행하지 않습니다. 실제 flaky 여부는 원본 test runner에서 확인해야 합니다."
    ]
  };
}

type FlakyTestSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function flakyTestSourceFiles(walk: WalkResult): Promise<FlakyTestSourceFile[]> {
  const files: FlakyTestSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !flakyTestInspectablePath(file.relPath)) continue;
    const pathCandidate = flakyTestPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !flakyTestContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 160) break;
  }
  return files;
}

function flakyTestInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|pytest\.ini|tox\.ini|jest\.config\.[cm]?[jt]s|playwright\.config\.[cm]?[jt]s|vitest\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|ini|md|py)$/i.test(filePath);
}

function flakyTestPathSignal(filePath: string): boolean {
  return /(^|\/)(tests?|e2e|specs?|playwright|pytest|jest|vitest|cypress|flaky|quarantine)(\/|\.|-|_|$)/i.test(filePath);
}

function flakyTestContentSignal(text: string): boolean {
  return /(failOnFlakyTests|on-first-retry|testInfo\.retry|retries\s*:|--retries|jest\.retryTimes|retryImmediately|waitBeforeRetry|--reruns|pytest-rerunfailures|pytest\.mark\.flaky|--fail-on-flaky|reruns-delay|only-rerun|rerun-except|test\.fixme|test\.skip|xfail|quarantine|flaky test|upload-artifact|playwright-report|detectOpenHandles|runInBand)/i.test(text);
}

function flakyTestSetupRows(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["flakyTestSetups"] {
  const rows: FlakyTestReadinessReport["flakyTestSetups"] = [];
  for (const source of sourceFiles) {
    const retryCount = countMatches(source.text, /retries\s*:|--retries|retryTimes|retryImmediately|retry\s*:|testInfo\.retry/gi);
    const rerunCount = countMatches(source.text, /--reruns|reruns\s*=|reruns-delay|rerun|RERUN|pytest-rerunfailures/gi);
    const quarantineCount = countMatches(source.text, /flaky|quarantine|test\.fixme|test\.skip|describe\.skip|it\.skip|xfail|skipif|@pytest\.mark\.flaky|issue\s*#|owner\s*:/gi);
    const failOnFlakyCount = countMatches(source.text, /failOnFlakyTests|--fail-on-flaky|fail-on-flaky|fail.*flaky/gi);
    const filterCount = countMatches(source.text, /only-rerun|rerun-except|grep-invert|--grep-invert|test-list|grep\s*:|tag\s*:/gi);
    const delayCount = countMatches(source.text, /reruns-delay|waitBeforeRetry|retry.*delay|backoff|sleep\(/gi);
    const artifactCount = countMatches(source.text, /trace:\s*['"]on-first-retry|on-first-retry|screenshot|video|playwright-report|blob-report|junit|test-results|trace\.zip|upload-artifact|GITHUB_STEP_SUMMARY/gi);
    const isolationCount = countMatches(source.text, /workers\s*:|--workers|runInBand|fullyParallel|serial|mode:\s*['"]serial|storageState|randomize|--seed|shard|matrix/gi);
    const timeoutCount = countMatches(source.text, /timeout\s*:|testTimeout|globalTimeout|expect\.setTimeout|slowTestThreshold|detectOpenHandles/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|CI|pull_request|schedule|workflow|actions\/|upload-artifact|GITHUB_STEP_SUMMARY/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = retryCount + rerunCount + quarantineCount + failOnFlakyCount + filterCount + delayCount + artifactCount + isolationCount + timeoutCount + ciCount;
    if (totalSignals === 0 && !flakyTestPathSignal(source.filePath)) continue;
    const readiness = (retryCount > 0 || rerunCount > 0) && quarantineCount > 0 && (artifactCount > 0 || failOnFlakyCount > 0)
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      framework: flakyFramework(source.filePath, source.text),
      retryCount,
      rerunCount,
      quarantineCount,
      failOnFlakyCount,
      filterCount,
      delayCount,
      artifactCount,
      isolationCount,
      timeoutCount,
      ciCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} flaky-test readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows
    .sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath))
    .slice(0, 90);
}

function flakyFramework(filePath: string, text: string): FlakyTestReadinessReport["flakyTestSetups"][number]["framework"] {
  if (/pytest|pytest-rerunfailures|@pytest\.mark|def test_/i.test(text) || /pytest|\.py$/i.test(filePath)) return "pytest";
  if (/@playwright\/test|playwright\.config|failOnFlakyTests|testInfo\.retry/i.test(text) || /playwright/i.test(filePath)) return "playwright";
  if (/jest\.retryTimes|jest\.config|detectOpenHandles/i.test(text) || /jest/i.test(filePath)) return "jest";
  if (/vitest|vi\.|describe\.concurrent/i.test(text) || /vitest/i.test(filePath)) return "vitest";
  if (/cypress|cy\.|cypress\.config/i.test(text) || /cypress/i.test(filePath)) return "cypress";
  if (/mocha|describe\s*\(|it\s*\(/i.test(text) || /mocha/i.test(filePath)) return "mocha";
  return flakyTestContentSignal(text) ? "custom" : "unknown";
}

function flakyFrameworkSignals(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: FlakyTestReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "playwright", pattern: /@playwright\/test|playwright\.config|npx playwright|failOnFlakyTests/i, evidence: "Playwright flaky-test evidence was detected." },
    { signal: "pytest-rerunfailures", pattern: /pytest-rerunfailures|--reruns|@pytest\.mark\.flaky|fail-on-flaky/i, evidence: "pytest-rerunfailures evidence was detected." },
    { signal: "jest", pattern: /jest\.retryTimes|jest\.config|detectOpenHandles|runInBand/i, evidence: "Jest retry/isolation evidence was detected." },
    { signal: "vitest", pattern: /vitest|vi\.|describe\.concurrent/i, evidence: "Vitest package or test evidence was detected." },
    { signal: "cypress", pattern: /cypress|cy\.|cypress\.config/i, evidence: "Cypress package or test evidence was detected." },
    { signal: "mocha", pattern: /mocha|describe\s*\(|it\s*\(/i, evidence: "Mocha-style test evidence was detected." }
  ];
  return flakySignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function flakyRetrySignals(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["retrySignals"] {
  const specs: Array<{ signal: FlakyTestReadinessReport["retrySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "retries", pattern: /retries\s*:|--retries|\bretries\b/i, evidence: "retry budget evidence was detected." },
    { signal: "reruns", pattern: /--reruns|\breruns\s*=|pytest-rerunfailures|\bRERUN\b/i, evidence: "pytest rerun evidence was detected." },
    { signal: "retry-times", pattern: /jest\.retryTimes|retryTimes\s*\(/i, evidence: "Jest retryTimes evidence was detected." },
    { signal: "retry-immediately", pattern: /retryImmediately/i, evidence: "immediate retry evidence was detected." },
    { signal: "wait-before-retry", pattern: /waitBeforeRetry/i, evidence: "wait-before-retry evidence was detected." },
    { signal: "reruns-delay", pattern: /reruns-delay|reruns_delay/i, evidence: "rerun delay evidence was detected." },
    { signal: "repeat-each", pattern: /repeat-each|repeatEach/i, evidence: "repeat-each stress evidence was detected." },
    { signal: "only-rerun", pattern: /only-rerun|only_rerun/i, evidence: "only-rerun filter evidence was detected." },
    { signal: "rerun-except", pattern: /rerun-except|rerun_except/i, evidence: "rerun-except filter evidence was detected." },
    { signal: "fail-on-flaky", pattern: /failOnFlakyTests|--fail-on-flaky|fail-on-flaky/i, evidence: "fail-on-flaky gate evidence was detected." }
  ];
  return flakySignalFromSpecs(sourceFiles, specs, "retry", "signal");
}

function flakyQuarantineSignals(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["quarantineSignals"] {
  const specs: Array<{ signal: FlakyTestReadinessReport["quarantineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flaky-marker", pattern: /@pytest\.mark\.flaky|pytest\.mark\.flaky|\bflaky\b/i, evidence: "flaky marker or label evidence was detected." },
    { signal: "skip-fixme", pattern: /test\.fixme|test\.skip|describe\.skip|it\.skip|\bskipif\b/i, evidence: "skip/fixme quarantine evidence was detected." },
    { signal: "xfail", pattern: /\bxfail\b|pytest\.mark\.xfail/i, evidence: "xfail evidence was detected." },
    { signal: "quarantine-tag", pattern: /quarantine|@flaky|flaky-tests?/i, evidence: "quarantine tag evidence was detected." },
    { signal: "grep-invert", pattern: /grep-invert|--grep-invert/i, evidence: "grep-invert exclusion evidence was detected." },
    { signal: "test-list", pattern: /test-list|flaky-tests\.txt|quarantine-list/i, evidence: "test-list quarantine evidence was detected." },
    { signal: "issue-link", pattern: /issue\s*#\d+|BUG-\d+|https:\/\/github\.com\/.+\/issues\/\d+/i, evidence: "issue link evidence was detected." },
    { signal: "owner", pattern: /owner\s*:|@owner|CODEOWNER|qa-team/i, evidence: "owner evidence was detected." }
  ];
  return flakySignalFromSpecs(sourceFiles, specs, "quarantine", "signal");
}

function flakyIsolationSignals(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["isolationSignals"] {
  const specs: Array<{ signal: FlakyTestReadinessReport["isolationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "workers-one", pattern: /workers\s*:\s*1|--workers[= ]1/i, evidence: "single-worker isolation evidence was detected." },
    { signal: "run-in-band", pattern: /runInBand|--runInBand/i, evidence: "Jest runInBand isolation evidence was detected." },
    { signal: "fully-parallel-control", pattern: /fullyParallel\s*:|fully-parallel/i, evidence: "Playwright fullyParallel control evidence was detected." },
    { signal: "serial-mode", pattern: /mode:\s*['"]serial|describe\.serial|test\.describe\.serial/i, evidence: "serial mode evidence was detected." },
    { signal: "test-timeout", pattern: /testTimeout|timeout\s*:|--timeout/i, evidence: "test timeout control evidence was detected." },
    { signal: "global-timeout", pattern: /globalTimeout|global-timeout/i, evidence: "global timeout control evidence was detected." },
    { signal: "detect-open-handles", pattern: /detectOpenHandles|--detectOpenHandles/i, evidence: "open-handle detection evidence was detected." },
    { signal: "storage-state", pattern: /storageState|state\.json|auth\.json/i, evidence: "storage state isolation evidence was detected." },
    { signal: "random-seed", pattern: /\bseed\b|--seed|random seed/i, evidence: "random seed evidence was detected." },
    { signal: "order-randomization", pattern: /randomize|order randomization|random order|shuffle/i, evidence: "order randomization evidence was detected." }
  ];
  return flakySignalFromSpecs(sourceFiles, specs, "isolation", "signal");
}

function flakyArtifactSignals(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["artifactSignals"] {
  const specs: Array<{ signal: FlakyTestReadinessReport["artifactSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trace-on-first-retry", pattern: /trace:\s*['"]on-first-retry|on-first-retry|show-trace/i, evidence: "retry trace evidence was detected." },
    { signal: "screenshot-on-failure", pattern: /screenshot:\s*['"]only-on-failure|only-on-failure|screenshot/i, evidence: "failure screenshot evidence was detected." },
    { signal: "video-on-retry", pattern: /video:\s*['"]on-first-retry|video-on-retry|video/i, evidence: "retry video evidence was detected." },
    { signal: "html-report", pattern: /reporter.*html|html reporter|playwright-report|show-report/i, evidence: "HTML test report evidence was detected." },
    { signal: "junit-report", pattern: /\bjunit\b|jest-junit|outputFile.*junit/i, evidence: "JUnit report evidence was detected." },
    { signal: "blob-report", pattern: /blob-report|\bblob\b/i, evidence: "Playwright blob report evidence was detected." },
    { signal: "retry-trace-upload", pattern: /trace\.zip|upload-artifact.*trace|trace.*upload-artifact/i, evidence: "retry trace upload evidence was detected." },
    { signal: "test-results", pattern: /test-results|results\/|junit\.xml/i, evidence: "test-results retention evidence was detected." },
    { signal: "step-summary", pattern: /GITHUB_STEP_SUMMARY|\$GITHUB_STEP_SUMMARY/i, evidence: "GitHub step summary evidence was detected." }
  ];
  return flakySignalFromSpecs(sourceFiles, specs, "artifact", "signal");
}

function flakyCiSignals(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["ciSignals"] {
  const specs: Array<{ signal: FlakyTestReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout/i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|pull-request/i, evidence: "pull request trigger evidence was detected." },
    { signal: "scheduled", pattern: /schedule:|cron:/i, evidence: "scheduled flaky-test trigger evidence was detected." },
    { signal: "shard", pattern: /\bshard\b|--shard/i, evidence: "test sharding evidence was detected." },
    { signal: "matrix", pattern: /\bmatrix\b|strategy:/i, evidence: "CI matrix evidence was detected." },
    { signal: "upload-artifact", pattern: /upload-artifact|actions\/upload-artifact/i, evidence: "artifact upload evidence was detected." },
    { signal: "flaky-dashboard", pattern: /flaky dashboard|flaky-dashboard|flake dashboard/i, evidence: "flaky dashboard evidence was detected." },
    { signal: "rerun-job", pattern: /rerun job|rerun-job|workflow_dispatch|gh run rerun|retry job/i, evidence: "CI rerun job evidence was detected." }
  ];
  return flakySignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function flakyPackageSignals(sourceFiles: FlakyTestSourceFile[]): FlakyTestReadinessReport["packageSignals"] {
  const specs: Array<{ signal: FlakyTestReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@playwright/test", pattern: /"@playwright\/test"|from ["']@playwright\/test|@playwright\/test/i, evidence: "@playwright/test package/API evidence was detected." },
    { signal: "pytest-rerunfailures", pattern: /pytest-rerunfailures/i, evidence: "pytest-rerunfailures package evidence was detected." },
    { signal: "jest", pattern: /"jest"|jest\.retryTimes|jest-junit/i, evidence: "Jest package/API evidence was detected." },
    { signal: "vitest", pattern: /"vitest"|from ["']vitest["']|vitest\s+/i, evidence: "Vitest package/API evidence was detected." },
    { signal: "cypress", pattern: /"cypress"|cypress\.config|cy\./i, evidence: "Cypress package/API evidence was detected." },
    { signal: "mocha", pattern: /"mocha"|\bmocha\b/i, evidence: "Mocha package/API evidence was detected." },
    { signal: "flaky", pattern: /"flaky"|\bflaky\b/i, evidence: "flaky package or marker evidence was detected." }
  ];
  return flakySignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function flakySignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: FlakyTestSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/flaky-test-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildTestImpactReadinessReport(walk: WalkResult): Promise<TestImpactReadinessReport> {
  const sourceFiles = await testImpactSourceFiles(walk);
  const impactSetups = testImpactSetupRows(sourceFiles);
  const toolSignals = testImpactToolSignals(sourceFiles);
  const changeDetectionSignals = testImpactChangeDetectionSignals(sourceFiles);
  const selectionSignals = testImpactSelectionSignals(sourceFiles);
  const cacheSignals = testImpactCacheSignals(sourceFiles);
  const ciSignals = testImpactCiSignals(sourceFiles);
  const packageSignals = testImpactPackageSignals(sourceFiles);
  const hasTool = toolSignals.some((item) => item.readiness === "ready");
  const hasChangeInput = changeDetectionSignals.some((item) => item.readiness === "ready");
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => item.readiness === "ready");

  const riskQueue: TestImpactReadinessReport["riskQueue"] = [];
  if (!hasTool) {
    riskQueue.push({
      priority: "high",
      action: "Add a concrete test-impact tool or command before claiming affected-test selection.",
      why: "Affected testing requires a known selector such as Nx affected, Jest findRelatedTests/onlyChanged, pytest-testmon, Turbo, Bazel, or Gradle inputs.",
      relatedHref: "html/test-impact-readiness.html"
    });
  }
  if (hasTool && !hasChangeInput) {
    riskQueue.push({
      priority: "high",
      action: "Declare how changed files, base/head commits, or uncommitted/untracked files are supplied.",
      why: "Impact selection is not reproducible if CI and local runs cannot explain the diff boundary.",
      relatedHref: "html/test-impact-readiness.html"
    });
  }
  if (hasTool && !hasSelection) {
    riskQueue.push({
      priority: "medium",
      action: "Pair change detection with an explicit project/test selection command.",
      why: "Changed files alone do not prove only affected projects or related tests are selected.",
      relatedHref: "html/test-impact-readiness.html"
    });
  }
  if (hasTool && !hasCi) {
    riskQueue.push({
      priority: "medium",
      action: "Add CI evidence for affected-only runs and fallbacks.",
      why: "Test impact analysis is most valuable when pull requests run the selected target set deterministically.",
      relatedHref: "html/test-impact-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original project test toolchain before treating this as a runtime pass.",
    why: "RepoTutor records static readiness only; it does not compute an actual affected graph or run selected tests.",
    relatedHref: "html/test-impact-readiness.html"
  });

  return {
    summary: `Test impact readiness report: setup ${impactSetups.length}개, tool signal ${toolSignals.filter((item) => item.readiness === "ready").length}개, change-detection signal ${changeDetectionSignals.filter((item) => item.readiness === "ready").length}개, selection signal ${selectionSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Test impact readiness Nx affected Jest findRelatedTests onlyChanged changedSince pytest-testmon --testmon dependency graph base head changed files CI cache",
    impactSetups,
    toolSignals,
    changeDetectionSignals,
    selectionSignals,
    cacheSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx nx affected -t test --base=origin/main --head=HEAD", purpose: "Run tests for projects affected by the current branch." },
      { command: "npx jest --findRelatedTests $(git diff --name-only origin/main...HEAD)", purpose: "Run Jest tests related to changed source files." },
      { command: "pytest --testmon", purpose: "Use pytest-testmon's dependency database to select tests affected by recent changes." },
      { command: "npx turbo run test --filter=...[origin/main]", purpose: "Run Turbo tasks affected by changes since the base ref." },
      { command: "rg \"affected|findRelatedTests|onlyChanged|changedSince|--testmon|git diff --name-only|NX_BASE|NX_HEAD\" .", purpose: "Locate static test-impact selection evidence." }
    ],
    learnerNextSteps: [
      "먼저 affected/related/changed-only command가 실제로 있는지 확인하세요.",
      "base/head, changed files, uncommitted/untracked 입력이 CI와 로컬에서 어떻게 주입되는지 보세요.",
      "선택된 테스트를 설명할 dependency graph, project graph, coverage dependency, cache evidence를 확인하세요.",
      "이 리포트는 영향도 그래프를 계산하지 않습니다. 실제 selected tests는 원본 도구에서 확인해야 합니다."
    ]
  };
}

type TestImpactSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function testImpactSourceFiles(walk: WalkResult): Promise<TestImpactSourceFile[]> {
  const files: TestImpactSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !testImpactInspectablePath(file.relPath)) continue;
    const pathCandidate = testImpactPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !testImpactContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 160) break;
  }
  return files;
}

function testImpactInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|nx\.json|turbo\.json|workspace\.json|project\.json|jest\.config\.[cm]?[jt]s|pyproject\.toml|pytest\.ini|bazelrc|BUILD|BUILD\.bazel|settings\.gradle|build\.gradle|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|ini|md|py|bzl|gradle|sh)$/i.test(filePath);
}

function testImpactPathSignal(filePath: string): boolean {
  return /(^|\/)(nx|jest|testmon|turbo|bazel|gradle|tests?|ci|workflows|affected|impact)(\/|\.|-|_|$)/i.test(filePath);
}

function testImpactContentSignal(text: string): boolean {
  return /(nx affected|nx show projects --affected|findRelatedTests|onlyChanged|changedSince|lastCommit|--testmon|testmon-noselect|testmon-forceselect|git diff --name-only|NX_BASE|NX_HEAD|affected-only|remote cache|dependency graph|project graph|turbo run.*--filter|bazel test|gradle.*--tests)/i.test(text);
}

function testImpactSetupRows(sourceFiles: TestImpactSourceFile[]): TestImpactReadinessReport["impactSetups"] {
  const rows: TestImpactReadinessReport["impactSetups"] = [];
  for (const source of sourceFiles) {
    const affectedCommandCount = countMatches(source.text, /nx\s+affected|nx\s+show\s+projects\s+--affected|findRelatedTests|onlyChanged|changedSince|--testmon|testmon-forceselect|turbo\s+run.+--filter|bazel\s+test|gradle.+--tests/gi);
    const changedFileInputCount = countMatches(source.text, /git\s+diff\s+--name-only|changed files?|--files=|files-of-interest|changedSince|onlyChanged|lastCommit|--uncommitted|--untracked/gi);
    const baseHeadCount = countMatches(source.text, /--base|--head|NX_BASE|NX_HEAD|base=|head=|origin\/main|merge-base|GITHUB_BASE_REF|GITHUB_SHA/gi);
    const graphCount = countMatches(source.text, /project graph|dependency graph|reverse dependency|affected projects|dependsOn|implicitDependencies|coverage dependency|haste map|jest-haste-map/gi);
    const cacheCount = countMatches(source.text, /cache|remote cache|task cache|\.testmondata|coverage data|nx-cache|turbo cache|watchman/gi);
    const watchCount = countMatches(source.text, /--watch|\bwatch\b|watch mode|pytest-watch|watchman|changed files and repos/gi);
    const selectionCount = countMatches(source.text, /selects? tests?|affected-only|related tests?|only run|deselect|selected target|test splitting|--shard|matrix/gi);
    const reportCount = countMatches(source.text, /--listTests|print-affected|show projects|json|junit|html|GITHUB_STEP_SUMMARY|upload-artifact|report/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|CI|pull_request|workflow|actions\/|matrix|shard|upload-artifact|NX_BASE|NX_HEAD/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const fallbackCount = countMatches(source.text, /run all|watchAll|fallback|no affected|all tests|--all|run-many|testmon-noselect|--no-testmon/gi);
    const totalSignals = affectedCommandCount + changedFileInputCount + baseHeadCount + graphCount + cacheCount + watchCount + selectionCount + reportCount + ciCount + fallbackCount;
    if (totalSignals === 0 && !testImpactPathSignal(source.filePath)) continue;
    const readiness = affectedCommandCount > 0 && changedFileInputCount > 0 && (baseHeadCount > 0 || graphCount > 0)
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      tool: testImpactTool(source.filePath, source.text),
      affectedCommandCount,
      changedFileInputCount,
      baseHeadCount,
      graphCount,
      cacheCount,
      watchCount,
      selectionCount,
      reportCount,
      ciCount,
      fallbackCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} test-impact readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath)).slice(0, 90);
}

function testImpactTool(filePath: string, text: string): TestImpactReadinessReport["impactSetups"][number]["tool"] {
  if (/\bnx\s+affected|nx\s+show\s+projects\s+--affected|"nx"|nx\.json|NX_BASE|NX_HEAD/i.test(text) || /nx\.json|project\.json/i.test(filePath)) return "nx";
  if (/findRelatedTests|onlyChanged|changedSince|lastCommit|jest-haste-map|jest-changed-files|"jest"/i.test(text) || /jest/i.test(filePath)) return "jest";
  if (/pytest-testmon|--testmon|testmon_noselect|testmon-forceselect|\.testmondata/i.test(text) || /testmon/i.test(filePath)) return "pytest-testmon";
  if (/turbo\s+run|turbo\.json|--filter=.*\[/i.test(text) || /turbo\.json/i.test(filePath)) return "turbo";
  if (/bazel\s+test|bazelrc|BUILD\.bazel|bazel query/i.test(text) || /BUILD(\.bazel)?|\.bzl/i.test(filePath)) return "bazel";
  if (/gradle|--tests|settings\.gradle|build\.gradle/i.test(text) || /\.gradle/i.test(filePath)) return "gradle";
  return testImpactContentSignal(text) ? "custom" : "unknown";
}

function testImpactToolSignals(sourceFiles: TestImpactSourceFile[]): TestImpactReadinessReport["toolSignals"] {
  const specs: Array<{ signal: TestImpactReadinessReport["toolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nx", pattern: /\bnx\s+affected|nx\s+show\s+projects\s+--affected|"nx"|nx\.json|NX_BASE|NX_HEAD/i, evidence: "Nx affected evidence was detected." },
    { signal: "jest", pattern: /findRelatedTests|onlyChanged|changedSince|jest-changed-files|jest-haste-map|"jest"/i, evidence: "Jest related/changed tests evidence was detected." },
    { signal: "pytest-testmon", pattern: /pytest-testmon|--testmon|testmon-noselect|testmon-forceselect|\.testmondata/i, evidence: "pytest-testmon evidence was detected." },
    { signal: "turbo", pattern: /turbo\s+run|turbo\.json|--filter=.*\[/i, evidence: "Turbo affected filter evidence was detected." },
    { signal: "bazel", pattern: /bazel\s+test|bazel query|bazelrc|BUILD\.bazel/i, evidence: "Bazel test/query evidence was detected." },
    { signal: "gradle", pattern: /gradle|--tests|settings\.gradle|build\.gradle/i, evidence: "Gradle selective test evidence was detected." },
    { signal: "custom", pattern: /affected tests?|test impact|related tests?|changed files?.*tests?/i, evidence: "custom test-impact evidence was detected." }
  ];
  return testImpactSignalFromSpecs(sourceFiles, specs, "tool", "signal");
}

function testImpactChangeDetectionSignals(sourceFiles: TestImpactSourceFile[]): TestImpactReadinessReport["changeDetectionSignals"] {
  const specs: Array<{ signal: TestImpactReadinessReport["changeDetectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "base-head", pattern: /--base|--head|NX_BASE|NX_HEAD|GITHUB_BASE_REF|GITHUB_SHA|merge-base/i, evidence: "base/head boundary evidence was detected." },
    { signal: "changed-since", pattern: /changedSince|--changedSince|since=|origin\/main\.\.\.HEAD/i, evidence: "changed-since evidence was detected." },
    { signal: "changed-files", pattern: /changed files?|getChangedFilesForRoots|jest-changed-files/i, evidence: "changed files evidence was detected." },
    { signal: "git-diff", pattern: /git\s+diff\s+--name-only|git diff/i, evidence: "git diff changed-file evidence was detected." },
    { signal: "uncommitted", pattern: /--uncommitted|uncommitted/i, evidence: "uncommitted-change input evidence was detected." },
    { signal: "untracked", pattern: /--untracked|untracked/i, evidence: "untracked-file input evidence was detected." },
    { signal: "last-commit", pattern: /lastCommit|--lastCommit|HEAD~1/i, evidence: "last-commit input evidence was detected." },
    { signal: "files-input", pattern: /--files=|files-of-interest|findRelatedTests\s+\$|xargs.*findRelatedTests/i, evidence: "explicit files input evidence was detected." }
  ];
  return testImpactSignalFromSpecs(sourceFiles, specs, "change detection", "signal");
}

function testImpactSelectionSignals(sourceFiles: TestImpactSourceFile[]): TestImpactReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: TestImpactReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "affected-projects", pattern: /nx\s+affected|nx\s+show\s+projects\s+--affected|affected projects/i, evidence: "affected project selection evidence was detected." },
    { signal: "find-related-tests", pattern: /findRelatedTests/i, evidence: "Jest findRelatedTests evidence was detected." },
    { signal: "only-changed", pattern: /onlyChanged|--onlyChanged|jest\s+-o\b/i, evidence: "Jest onlyChanged evidence was detected." },
    { signal: "testmon-select", pattern: /--testmon|testmon: selecting|select tests affected/i, evidence: "pytest-testmon selection evidence was detected." },
    { signal: "testmon-forceselect", pattern: /testmon-forceselect|--testmon-forceselect/i, evidence: "pytest-testmon force select evidence was detected." },
    { signal: "related-tests-list", pattern: /--listTests|related tests?|test files related/i, evidence: "related test list evidence was detected." },
    { signal: "dependency-graph", pattern: /dependency graph|reverse dependency|dependsOn|implicitDependencies/i, evidence: "dependency graph evidence was detected." },
    { signal: "project-graph", pattern: /project graph|nx graph|show projects/i, evidence: "project graph evidence was detected." },
    { signal: "test-splitting", pattern: /test splitting|split tests|--shard|matrix.*shard/i, evidence: "test splitting evidence was detected." }
  ];
  return testImpactSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function testImpactCacheSignals(sourceFiles: TestImpactSourceFile[]): TestImpactReadinessReport["cacheSignals"] {
  const specs: Array<{ signal: TestImpactReadinessReport["cacheSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nx-cache", pattern: /nx cache|cacheableOperations|targetDefaults|outputs|inputs/i, evidence: "Nx cache/input evidence was detected." },
    { signal: "remote-cache", pattern: /remote cache|Nx Cloud|TURBO_TOKEN|remote caching/i, evidence: "remote cache evidence was detected." },
    { signal: "task-cache", pattern: /task cache|cache hit|cache miss|turbo cache|cache what didn't change/i, evidence: "task cache evidence was detected." },
    { signal: "testmon-data", pattern: /\.testmondata|testmon data|testmon database/i, evidence: "pytest-testmon data evidence was detected." },
    { signal: "coverage-deps", pattern: /coverage dependency|coverage data|coverage\.py|collect.*coverage/i, evidence: "coverage dependency evidence was detected." },
    { signal: "jest-haste-map", pattern: /jest-haste-map|haste map|HasteMap/i, evidence: "Jest Haste map evidence was detected." },
    { signal: "watchman", pattern: /watchman/i, evidence: "Watchman file watcher evidence was detected." }
  ];
  return testImpactSignalFromSpecs(sourceFiles, specs, "cache", "signal");
}

function testImpactCiSignals(sourceFiles: TestImpactSourceFile[]): TestImpactReadinessReport["ciSignals"] {
  const specs: Array<{ signal: TestImpactReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|pull-request/i, evidence: "pull request trigger evidence was detected." },
    { signal: "base-head-env", pattern: /NX_BASE|NX_HEAD|GITHUB_BASE_REF|GITHUB_SHA/i, evidence: "base/head CI env evidence was detected." },
    { signal: "matrix", pattern: /\bmatrix\b|strategy:/i, evidence: "CI matrix evidence was detected." },
    { signal: "shard", pattern: /\bshard\b|--shard/i, evidence: "test shard evidence was detected." },
    { signal: "affected-only", pattern: /affected-only|nx affected|findRelatedTests|--testmon/i, evidence: "affected-only CI command evidence was detected." },
    { signal: "upload-artifact", pattern: /upload-artifact|actions\/upload-artifact/i, evidence: "artifact upload evidence was detected." }
  ];
  return testImpactSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function testImpactPackageSignals(sourceFiles: TestImpactSourceFile[]): TestImpactReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TestImpactReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nx", pattern: /"nx"|"@nx\/|nx\.json|npx nx/i, evidence: "Nx package/config evidence was detected." },
    { signal: "jest", pattern: /"jest"|jest\.config|findRelatedTests|jest-changed-files/i, evidence: "Jest package/config evidence was detected." },
    { signal: "pytest-testmon", pattern: /pytest-testmon|--testmon/i, evidence: "pytest-testmon package/config evidence was detected." },
    { signal: "turbo", pattern: /"turbo"|turbo\.json|npx turbo/i, evidence: "Turbo package/config evidence was detected." },
    { signal: "bazel", pattern: /bazel|BUILD\.bazel|bazelrc/i, evidence: "Bazel package/config evidence was detected." },
    { signal: "gradle", pattern: /gradle|settings\.gradle|build\.gradle/i, evidence: "Gradle package/config evidence was detected." }
  ];
  return testImpactSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function testImpactSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TestImpactSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/test-impact-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildTestReportingReadinessReport(walk: WalkResult): Promise<TestReportingReadinessReport> {
  const sourceFiles = await testReportingSourceFiles(walk);
  const reportSetups = testReportingSetupRows(sourceFiles);
  const formatSignals = testReportingFormatSignals(sourceFiles);
  const adapterSignals = testReportingAdapterSignals(sourceFiles);
  const ciSignals = testReportingCiSignals(sourceFiles);
  const outputSignals = testReportingOutputSignals(sourceFiles);
  const qualitySignals = testReportingQualitySignals(sourceFiles);
  const packageSignals = testReportingPackageSignals(sourceFiles);
  const hasFormat = formatSignals.some((item) => item.readiness === "ready");
  const hasAdapter = adapterSignals.some((item) => item.readiness === "ready");
  const hasOutput = outputSignals.some((item) => item.readiness === "ready");
  const hasCiSurface = ciSignals.some((item) => item.readiness === "ready");

  const riskQueue: TestReportingReadinessReport["riskQueue"] = [];
  if (!hasFormat && !hasAdapter) {
    riskQueue.push({
      priority: "high",
      action: "Add a machine-readable test report format before relying on CI test reporting.",
      why: "JUnit XML, CTRF JSON, Allure results, TRX, xUnit, or Mocha JSON is needed before tools can parse failures consistently.",
      relatedHref: "html/test-reporting-readiness.html"
    });
  }
  if ((hasFormat || hasAdapter) && !hasOutput) {
    riskQueue.push({
      priority: "high",
      action: "Declare report output paths, result directories, or glob patterns.",
      why: "A reporter is not actionable unless CI and humans can find the generated report files.",
      relatedHref: "html/test-reporting-readiness.html"
    });
  }
  if ((hasFormat || hasAdapter) && !hasCiSurface) {
    riskQueue.push({
      priority: "medium",
      action: "Publish reports through CI summaries, annotations, checks, or artifacts.",
      why: "Static report files are easy to miss unless the workflow exposes them to pull-request reviewers.",
      relatedHref: "html/test-reporting-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original project test commands before treating this as report quality evidence.",
    why: "RepoTutor records static readiness only; it does not execute tests, parse generated reports, or validate annotations.",
    relatedHref: "html/test-reporting-readiness.html"
  });

  return {
    summary: `Test reporting readiness report: setup ${reportSetups.length}개, format signal ${formatSignals.filter((item) => item.readiness === "ready").length}개, adapter signal ${adapterSignals.filter((item) => item.readiness === "ready").length}개, CI signal ${ciSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Test reporting readiness CTRF JSON Allure results JUnit XML GitHub annotations checks summaries artifacts history",
    reportSetups,
    formatSignals,
    adapterSignals,
    ciSignals,
    outputSignals,
    qualitySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx jest --ci --reporters=default --reporters=jest-junit", purpose: "Generate JUnit XML from Jest for CI parsing." },
      { command: "pytest --junitxml=reports/pytest.xml", purpose: "Generate xUnit/JUnit-style XML from pytest." },
      { command: "npx playwright test --reporter=list,junit,html", purpose: "Generate list, JUnit, and HTML reports from Playwright." },
      { command: "npx allure generate ./allure-results -o ./allure-report", purpose: "Render Allure result files into an HTML report." },
      { command: "rg \"junit|ctrf|allure-results|test-reporter|GITHUB_STEP_SUMMARY|upload-artifact\" .", purpose: "Locate static test-reporting evidence." }
    ],
    learnerNextSteps: [
      "먼저 test runner가 JUnit XML, CTRF JSON, Allure results 같은 machine-readable report를 생성하는지 확인하세요.",
      "report path, result directory, glob, output file이 CI에서 같은 위치를 가리키는지 보세요.",
      "GitHub annotations, checks, job summary, artifact upload가 PR 리뷰 표면에 연결되는지 확인하세요.",
      "이 리포트는 정적 readiness만 기록합니다. 실제 report parse와 annotation 품질은 원본 CI에서 검증해야 합니다."
    ]
  };
}

type TestReportingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function testReportingSourceFiles(walk: WalkResult): Promise<TestReportingSourceFile[]> {
  const files: TestReportingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !testReportingInspectablePath(file.relPath)) continue;
    const pathCandidate = testReportingPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !testReportingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 170) break;
  }
  return files;
}

function testReportingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|allurerc\.[cm]?[jt]s|allure\.properties|jest\.config\.[cm]?[jt]s|vitest\.config\.[cm]?[jt]s|playwright\.config\.[cm]?[jt]s|pyproject\.toml|pytest\.ini|README\.md|action\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|ini|md|xml|properties|sh)$/i.test(filePath);
}

function testReportingPathSignal(filePath: string): boolean {
  return /(^|\/)(reports?|test-results|allure-results|allure-report|ctrf|junit|xunit|trx|test-reporter|coverage)(\/|\.|-|_|$)/i.test(filePath);
}

function testReportingContentSignal(text: string): boolean {
  return /(junit|xunit|trx|ctrf|ctrf-report|allure-results|allure-report|allurerc|jest-junit|test-reporter|publish-unit-test-result|github-test-reporter|GITHUB_STEP_SUMMARY|checks:\s*write|upload-artifact|download-artifact|max-annotations|fail-on-empty|summary_file|annotations)/i.test(text);
}

function testReportingSetupRows(sourceFiles: TestReportingSourceFile[]): TestReportingReadinessReport["reportSetups"] {
  const rows: TestReportingReadinessReport["reportSetups"] = [];
  for (const source of sourceFiles) {
    const junitCount = countMatches(source.text, /junit|xunit|--junitxml|jest-junit|vitest.*junit|reporter:\s*java-junit|reporter:\s*python-xunit/gi);
    const ctrfCount = countMatches(source.text, /ctrf|ctrf-report\.json|github-test-reporter|common test report format/gi);
    const allureCount = countMatches(source.text, /allure-results|allure-report|allurerc|allure generate|allure open|allure watch|allure run/gi);
    const reporterCount = countMatches(source.text, /reporters?|testReporter|test-reporter|publish-unit-test-result|github-test-reporter|jest-junit|mocha-json|dotnet-trx|java-junit|python-xunit/gi);
    const outputCount = countMatches(source.text, /output(File|Name|Directory)?|report[-_ ]?path|resultsDir|results-dir|path:|glob|reports\/|test-results\/|allure-results|allure-report|ctrf-report\.json/gi);
    const summaryCount = countMatches(source.text, /GITHUB_STEP_SUMMARY|job summary|Actions Summary|summary_file|summary file|Markdown summary|summary:/gi);
    const annotationCount = countMatches(source.text, /annotations?|max-annotations|checks?:\s*write|Check Run|check run|pull request annotations?/gi);
    const artifactCount = countMatches(source.text, /upload-artifact|download-artifact|artifact:|artifacts?|report artifact/gi);
    const historyCount = countMatches(source.text, /history|trend|rerun|flaky analysis|retries|previous runs?|categories/gi);
    const metadataCount = countMatches(source.text, /environment|executor|build(Name|Number)?|appName|owner|labels?|attachments?|screenshots?|logs?|traces?/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|GitHub Actions|workflow_run|pull_request|always\(\)|!cancelled\(\)|matrix|runs-on|permissions:|checks:\s*write/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const failPolicyCount = countMatches(source.text, /fail-on-error|fail-on-empty|failOnError|failOnEmpty|max-annotations|threshold|continue-on-error|if:\s*\$\{\{\s*!cancelled\(\)\s*\}\}/gi);
    const totalSignals = junitCount + ctrfCount + allureCount + reporterCount + outputCount + summaryCount + annotationCount + artifactCount + historyCount + metadataCount + ciCount + failPolicyCount;
    if (totalSignals === 0 && !testReportingPathSignal(source.filePath)) continue;
    const readiness = (junitCount + ctrfCount + allureCount + reporterCount) > 0 && outputCount > 0 && (ciCount > 0 || summaryCount > 0 || artifactCount > 0)
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      format: testReportingFormat(source.filePath, source.text),
      junitCount,
      ctrfCount,
      allureCount,
      reporterCount,
      outputCount,
      summaryCount,
      annotationCount,
      artifactCount,
      historyCount,
      metadataCount,
      ciCount,
      failPolicyCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} test-reporting readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath)).slice(0, 90);
}

function testReportingFormat(filePath: string, text: string): TestReportingReadinessReport["reportSetups"][number]["format"] {
  if (/allure-results|allure-report|allurerc|allure generate|allure open/i.test(text) || /allure/i.test(filePath)) return "allure";
  if (/ctrf|ctrf-report\.json|github-test-reporter/i.test(text) || /ctrf/i.test(filePath)) return "ctrf";
  if (/dotnet-trx|\.trx\b|trx;/i.test(text) || /\.trx$/i.test(filePath)) return "trx";
  if (/python-xunit|xunit|--junitxml/i.test(text)) return "xunit";
  if (/mocha-json/i.test(text)) return "mocha-json";
  if (/junit|jest-junit|java-junit|junit\.xml/i.test(text) || /junit/i.test(filePath)) return "junit";
  if (/dorny\/test-reporter|publish-unit-test-result|github-test-reporter|checks:\s*write|GITHUB_STEP_SUMMARY/i.test(text)) return "github-action";
  return testReportingContentSignal(text) ? "custom" : "unknown";
}

function testReportingFormatSignals(sourceFiles: TestReportingSourceFile[]): TestReportingReadinessReport["formatSignals"] {
  const specs: Array<{ signal: TestReportingReadinessReport["formatSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "junit-xml", pattern: /junit|jest-junit|--junitxml|junit\.xml|java-junit/i, evidence: "JUnit XML evidence was detected." },
    { signal: "ctrf-json", pattern: /ctrf|ctrf-report\.json|common test report format/i, evidence: "CTRF JSON evidence was detected." },
    { signal: "allure-results", pattern: /allure-results|resultsDir.*allure/i, evidence: "Allure results evidence was detected." },
    { signal: "allure-report", pattern: /allure-report|allure generate|allure open|allure watch/i, evidence: "Allure report evidence was detected." },
    { signal: "trx", pattern: /dotnet-trx|\.trx\b|trx;/i, evidence: "TRX report evidence was detected." },
    { signal: "xunit", pattern: /xunit|python-xunit|--junitxml/i, evidence: "xUnit report evidence was detected." },
    { signal: "mocha-json", pattern: /mocha-json|mocha.*json/i, evidence: "Mocha JSON report evidence was detected." },
    { signal: "json", pattern: /json report|report\.json|ctrf-report\.json|--json/i, evidence: "JSON report evidence was detected." },
    { signal: "html", pattern: /html report|allure-report|playwright-report|reporter:\s*html/i, evidence: "HTML report evidence was detected." },
    { signal: "markdown", pattern: /markdown|summary_file|GITHUB_STEP_SUMMARY/i, evidence: "Markdown summary evidence was detected." }
  ];
  return testReportingSignalFromSpecs(sourceFiles, specs, "format", "signal");
}

function testReportingAdapterSignals(sourceFiles: TestReportingSourceFile[]): TestReportingReadinessReport["adapterSignals"] {
  const specs: Array<{ signal: TestReportingReadinessReport["adapterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "jest-junit", pattern: /jest-junit/i, evidence: "jest-junit adapter evidence was detected." },
    { signal: "vitest-junit", pattern: /vitest.*junit|junit.*vitest/i, evidence: "Vitest JUnit adapter evidence was detected." },
    { signal: "pytest-junitxml", pattern: /--junitxml|junit_family|pytest.*junit/i, evidence: "pytest JUnit XML evidence was detected." },
    { signal: "playwright-reporters", pattern: /playwright.*reporter|reporter:\s*\[\[?['"]?(junit|html|json|list)/i, evidence: "Playwright reporter evidence was detected." },
    { signal: "allure-js", pattern: /allure-(jest|vitest|mocha|playwright|cucumberjs)|allure-js-commons|allure generate|allure-results/i, evidence: "Allure JS evidence was detected." },
    { signal: "allure-pytest", pattern: /allure-pytest|pytest.*allure/i, evidence: "Allure pytest evidence was detected." },
    { signal: "ctrf-reporter", pattern: /ctrf|github-test-reporter|ctrf-report\.json/i, evidence: "CTRF reporter evidence was detected." },
    { signal: "dorny-test-reporter", pattern: /dorny\/test-reporter|test-reporter@v/i, evidence: "dorny/test-reporter evidence was detected." },
    { signal: "github-test-reporter", pattern: /github-test-reporter@|ctrf-io\/github-test-reporter/i, evidence: "GitHub test reporter evidence was detected." },
    { signal: "publish-unit-test-result", pattern: /publish-unit-test-result|publish-test-results/i, evidence: "publish unit test result evidence was detected." }
  ];
  return testReportingSignalFromSpecs(sourceFiles, specs, "adapter", "signal");
}

function testReportingCiSignals(sourceFiles: TestReportingSourceFile[]): TestReportingReadinessReport["ciSignals"] {
  const specs: Array<{ signal: TestReportingReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "workflow-run", pattern: /workflow_run/i, evidence: "workflow_run reporting evidence was detected." },
    { signal: "checks-write", pattern: /checks:\s*write|Check Run|check run/i, evidence: "checks write evidence was detected." },
    { signal: "job-summary", pattern: /GITHUB_STEP_SUMMARY|job summary|Actions Summary/i, evidence: "job summary evidence was detected." },
    { signal: "annotations", pattern: /annotations?|max-annotations/i, evidence: "annotation evidence was detected." },
    { signal: "upload-artifact", pattern: /upload-artifact|actions\/upload-artifact/i, evidence: "upload artifact evidence was detected." },
    { signal: "download-artifact", pattern: /download-artifact|actions\/download-artifact/i, evidence: "download artifact evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|pull request|PR comment/i, evidence: "pull request reporting evidence was detected." },
    { signal: "always-run", pattern: /always\(\)|!cancelled\(\)|if:\s*\$\{\{\s*!cancelled\(\)\s*\}\}/i, evidence: "always-run report publication evidence was detected." },
    { signal: "matrix", pattern: /\bmatrix\b|strategy:/i, evidence: "matrix report evidence was detected." }
  ];
  return testReportingSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function testReportingOutputSignals(sourceFiles: TestReportingSourceFile[]): TestReportingReadinessReport["outputSignals"] {
  const specs: Array<{ signal: TestReportingReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "report-path", pattern: /report[-_ ]?path|path:\s*['"]?[^'"]*(reports|test-results|ctrf|allure)/i, evidence: "report path evidence was detected." },
    { signal: "glob-path", pattern: /\*\*\/\*|\*\.xml|\*\.json|fast-glob|glob/i, evidence: "glob path evidence was detected." },
    { signal: "results-dir", pattern: /resultsDir|results-dir|allure-results|test-results/i, evidence: "result directory evidence was detected." },
    { signal: "output-file", pattern: /outputFile|outputName|LogFileName|--output|junit\.xml|ctrf-report\.json/i, evidence: "output file evidence was detected." },
    { signal: "summary-file", pattern: /summary_file|summary file|GITHUB_STEP_SUMMARY/i, evidence: "summary file evidence was detected." },
    { signal: "html-report", pattern: /html report|allure-report|playwright-report|reporter:\s*html/i, evidence: "HTML report output evidence was detected." },
    { signal: "history-trend", pattern: /history|trend|previous runs?|rerun/i, evidence: "history/trend evidence was detected." },
    { signal: "attachments", pattern: /attachments?|screenshots?|logs?|traces?|API payloads?/i, evidence: "attachment evidence was detected." },
    { signal: "environment-metadata", pattern: /environment|environmentInfo|appName|buildName|buildNumber/i, evidence: "environment metadata evidence was detected." },
    { signal: "executor-metadata", pattern: /executor|buildUrl|reportUrl|jobName|buildOrder/i, evidence: "executor metadata evidence was detected." }
  ];
  return testReportingSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function testReportingQualitySignals(sourceFiles: TestReportingSourceFile[]): TestReportingReadinessReport["qualitySignals"] {
  const specs: Array<{ signal: TestReportingReadinessReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "fail-on-error", pattern: /fail-on-error|failOnError/i, evidence: "fail-on-error evidence was detected." },
    { signal: "fail-on-empty", pattern: /fail-on-empty|failOnEmpty/i, evidence: "fail-on-empty evidence was detected." },
    { signal: "max-annotations", pattern: /max-annotations|maxAnnotations/i, evidence: "max annotation evidence was detected." },
    { signal: "threshold-summary", pattern: /threshold|summary.*failed|failed.*summary|pass rate|failure rate/i, evidence: "threshold or summary evidence was detected." },
    { signal: "rerun-history", pattern: /rerun|history|previous runs?/i, evidence: "rerun/history evidence was detected." },
    { signal: "flaky-analysis", pattern: /flaky analysis|flaky|retries/i, evidence: "flaky analysis evidence was detected." },
    { signal: "categories", pattern: /categories|category/i, evidence: "category evidence was detected." },
    { signal: "owner-labels", pattern: /owner|labels?|tag|suite|feature|story/i, evidence: "owner/label evidence was detected." },
    { signal: "duration", pattern: /duration|time \[ms\]|start|stop|elapsed/i, evidence: "duration evidence was detected." }
  ];
  return testReportingSignalFromSpecs(sourceFiles, specs, "quality", "signal");
}

function testReportingPackageSignals(sourceFiles: TestReportingSourceFile[]): TestReportingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TestReportingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "jest-junit", pattern: /"jest-junit"|jest-junit/i, evidence: "jest-junit package evidence was detected." },
    { signal: "allure", pattern: /"allure"|npx allure|allure generate/i, evidence: "Allure package/CLI evidence was detected." },
    { signal: "allure-js", pattern: /allure-(jest|vitest|mocha|playwright|cucumberjs)|allure-js-commons/i, evidence: "Allure JS package evidence was detected." },
    { signal: "allure-pytest", pattern: /allure-pytest/i, evidence: "Allure pytest package evidence was detected." },
    { signal: "ctrf", pattern: /ctrf|github-test-reporter/i, evidence: "CTRF package evidence was detected." },
    { signal: "test-reporter", pattern: /dorny\/test-reporter|test-reporter@v/i, evidence: "test-reporter action evidence was detected." },
    { signal: "publish-unit-test-result", pattern: /publish-unit-test-result|publish-test-results/i, evidence: "publish unit test result action evidence was detected." },
    { signal: "junit", pattern: /junit|java-junit|python-xunit/i, evidence: "JUnit package/report evidence was detected." }
  ];
  return testReportingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function testReportingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TestReportingSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/test-reporting-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSnapshotReadinessReport(walk: WalkResult): Promise<SnapshotReadinessReport> {
  const sourceFiles = await snapshotSourceFiles(walk);
  const snapshotSetups = snapshotSetupRows(sourceFiles);
  const assertionSignals = snapshotAssertionSignals(sourceFiles);
  const storageSignals = snapshotStorageSignals(sourceFiles);
  const updateSignals = snapshotUpdateSignals(sourceFiles);
  const serializerSignals = snapshotSerializerSignals(sourceFiles);
  const visualSignals = snapshotVisualSignals(sourceFiles);
  const ciSignals = snapshotCiSignals(sourceFiles);
  const packageSignals = snapshotPackageSignals(sourceFiles);
  const hasAssertion = assertionSignals.some((item) => item.readiness === "ready");
  const hasStorage = storageSignals.some((item) => item.readiness === "ready");
  const hasUpdatePolicy = updateSignals.some((item) => item.readiness === "ready");
  const hasVisual = visualSignals.some((item) => item.readiness === "ready");

  const riskQueue: SnapshotReadinessReport["riskQueue"] = [];
  if (!hasAssertion) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit snapshot assertions before relying on snapshot review signals.",
      why: "Snapshot baselines are only useful when tests call text, inline, file, visual, or ARIA snapshot matchers.",
      relatedHref: "html/snapshot-readiness.html"
    });
  }
  if (hasAssertion && !hasStorage) {
    riskQueue.push({
      priority: "high",
      action: "Make snapshot baseline locations explicit and commit the expected baselines.",
      why: "Untracked or implicit baselines make CI behavior hard to audit and reproduce.",
      relatedHref: "html/snapshot-readiness.html"
    });
  }
  if (hasAssertion && !hasUpdatePolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Document snapshot update policy for local review and CI.",
      why: "Teams need a clear path for updateSnapshot/update-snapshots while CI should fail on unexpected new snapshots.",
      relatedHref: "html/snapshot-readiness.html"
    });
  }
  if (hasVisual && !ciSignals.some((item) => item.signal === "os-matrix" && item.readiness === "ready")) {
    riskQueue.push({
      priority: "medium",
      action: "Pin OS/browser/runtime matrix for visual snapshots.",
      why: "Screenshot baselines can drift by platform, browser, font, scale, or rendering settings.",
      relatedHref: "html/snapshot-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the project's original snapshot commands before treating this report as quality evidence.",
    why: "RepoTutor records static snapshot readiness only; it does not update, diff, or approve snapshots.",
    relatedHref: "html/snapshot-readiness.html"
  });

  return {
    summary: `Snapshot readiness report: setup ${snapshotSetups.length}개, assertion signal ${assertionSignals.filter((item) => item.readiness === "ready").length}개, update signal ${updateSignals.filter((item) => item.readiness === "ready").length}개, visual signal ${visualSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Snapshot testing readiness Jest Vitest Playwright toMatchSnapshot inline file visual ARIA snapshots update policy serializers baselines CI",
    snapshotSetups,
    assertionSignals,
    storageSignals,
    updateSignals,
    serializerSignals,
    visualSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx jest --ci", purpose: "Verify Jest snapshots in CI mode without auto-writing new snapshots." },
      { command: "npx jest --updateSnapshot", purpose: "Update reviewed Jest snapshots locally." },
      { command: "npx vitest run --update", purpose: "Update reviewed Vitest snapshots locally." },
      { command: "npx playwright test --update-snapshots=changed", purpose: "Update reviewed Playwright visual/text/ARIA snapshots." },
      { command: "rg \"toMatchSnapshot|toMatchInlineSnapshot|toMatchFileSnapshot|toHaveScreenshot|toMatchAriaSnapshot|snapshotPathTemplate\" .", purpose: "Locate static snapshot readiness evidence." }
    ],
    learnerNextSteps: [
      "먼저 snapshot assertion이 무엇을 고정하는지 확인하고, volatile field는 property matcher나 serializer로 제거하세요.",
      "`.snap`, file snapshot, screenshot baseline, ARIA YAML baseline이 버전 관리되는 위치에 있는지 확인하세요.",
      "로컬 update command와 CI fail policy가 분리되어 있는지 확인하세요.",
      "visual snapshot은 OS, browser, font, scale, mask, threshold 설정이 재현 가능한지 원본 CI에서 검증해야 합니다."
    ]
  };
}

type SnapshotSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function snapshotSourceFiles(walk: WalkResult): Promise<SnapshotSourceFile[]> {
  const files: SnapshotSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !snapshotInspectablePath(file.relPath)) continue;
    const pathCandidate = snapshotPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !snapshotContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 180) break;
  }
  return files;
}

function snapshotInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|jest\.config\.[cm]?[jt]s|vitest\.config\.[cm]?[jt]s|playwright\.config\.[cm]?[jt]s|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(__snapshots__|snapshots?|__screenshots__|screenshots?|visual-baselines?|fixtures?)(\/|$)/i.test(filePath)
    || /\.(snap|aria\.ya?ml|test\.[cm]?[jt]sx?|spec\.[cm]?[jt]sx?|ya?ml|md|json|ts|tsx|js|jsx)$/i.test(filePath);
}

function snapshotPathSignal(filePath: string): boolean {
  return /(^|\/)(__snapshots__|snapshots?|__screenshots__|screenshots?|visual-baselines?)(\/|$)|\.(snap|aria\.ya?ml|png)$/i.test(filePath);
}

function snapshotContentSignal(text: string): boolean {
  return /(toMatchSnapshot|toMatchInlineSnapshot|toMatchFileSnapshot|toThrowErrorMatchingInlineSnapshot|toHaveScreenshot|toMatchAriaSnapshot|snapshotPathTemplate|snapshotSerializers|addSnapshotSerializer|snapshotFormat|updateSnapshot|update-snapshots|__snapshots__|maxDiffPixels|maxDiffPixelRatio|maskColor|stylePath)/i.test(text);
}

function snapshotSetupRows(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["snapshotSetups"] {
  const rows: SnapshotReadinessReport["snapshotSetups"] = [];
  for (const source of sourceFiles) {
    const textSnapshotCount = countMatches(source.text, /toMatchSnapshot|matchSnapshot|jest-snapshot|snapshot test/gi);
    const inlineSnapshotCount = countMatches(source.text, /toMatchInlineSnapshot|toThrowErrorMatchingInlineSnapshot|inline snapshot/gi);
    const fileSnapshotCount = countMatches(source.text, /toMatchFileSnapshot|file snapshot|\.snap\b|__snapshots__/gi);
    const visualSnapshotCount = countMatches(source.text, /toHaveScreenshot|screenshot baseline|visual snapshot|visual comparison|__screenshots__/gi);
    const ariaSnapshotCount = countMatches(source.text, /toMatchAriaSnapshot|aria snapshot|\.aria\.ya?ml/gi);
    const updatePolicyCount = countMatches(source.text, /updateSnapshot|--updateSnapshot|--update-snapshots|update snapshots?|missing|changed|all|none|watch mode|\bu key\b/gi);
    const serializerCount = countMatches(source.text, /snapshotSerializers|addSnapshotSerializer|snapshotFormat|pretty-format|serializer/gi);
    const pathTemplateCount = countMatches(source.text, /snapshotPathTemplate|snapshotResolver|snapshotDir|snapshot path|__snapshots__|__screenshots__/gi);
    const thresholdCount = countMatches(source.text, /maxDiffPixels|maxDiffPixelRatio|threshold|pixelmatch|diff pixel/gi);
    const maskingCount = countMatches(source.text, /maskColor|mask:|stylePath|animations|caret|scale|dynamic data|volatile/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|GitHub Actions|pull_request|CI\s*[:=]|--ci|update-forbidden|update snapshots forbidden|runs-on|matrix|browserName|os:/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const baselineCount = countMatches(source.text, /__snapshots__|\.snap\b|baseline|expected screenshot|expected.*actual|version control|commit.*snapshot|snapshots?\/|__screenshots__/gi) + (snapshotPathSignal(source.filePath) ? 1 : 0);
    const reviewCount = countMatches(source.text, /review|approve|snapshot diff|expected|actual|artifact|upload-artifact|HTML report|trace|pull request/gi);
    const totalSignals = textSnapshotCount + inlineSnapshotCount + fileSnapshotCount + visualSnapshotCount + ariaSnapshotCount + updatePolicyCount + serializerCount + pathTemplateCount + thresholdCount + maskingCount + ciCount + baselineCount + reviewCount;
    if (totalSignals === 0 && !snapshotPathSignal(source.filePath)) continue;
    const readiness = (textSnapshotCount + inlineSnapshotCount + fileSnapshotCount + visualSnapshotCount + ariaSnapshotCount) > 0 && baselineCount > 0 && updatePolicyCount > 0
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      framework: snapshotFramework(source.filePath, source.text),
      textSnapshotCount,
      inlineSnapshotCount,
      fileSnapshotCount,
      visualSnapshotCount,
      ariaSnapshotCount,
      updatePolicyCount,
      serializerCount,
      pathTemplateCount,
      thresholdCount,
      maskingCount,
      ciCount,
      baselineCount,
      reviewCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} snapshot readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath)).slice(0, 90);
}

function snapshotFramework(filePath: string, text: string): SnapshotReadinessReport["snapshotSetups"][number]["framework"] {
  if (/playwright|toHaveScreenshot|toMatchAriaSnapshot|snapshotPathTemplate/i.test(text) || /playwright/i.test(filePath)) return "playwright";
  if (/vitest|vi\.|toMatchFileSnapshot/i.test(text) || /vitest/i.test(filePath)) return "vitest";
  if (/jest|jest-snapshot|toMatchInlineSnapshot|snapshotSerializers/i.test(text) || /jest/i.test(filePath)) return "jest";
  if (/storybook|stories\./i.test(text) || /storybook/i.test(filePath)) return "storybook";
  return snapshotContentSignal(text) ? "custom" : "unknown";
}

function snapshotAssertionSignals(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["assertionSignals"] {
  const specs: Array<{ signal: SnapshotReadinessReport["assertionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "to-match-snapshot", pattern: /toMatchSnapshot|matchSnapshot/i, evidence: "toMatchSnapshot evidence was detected." },
    { signal: "inline-snapshot", pattern: /toMatchInlineSnapshot|inline snapshot/i, evidence: "inline snapshot evidence was detected." },
    { signal: "file-snapshot", pattern: /toMatchFileSnapshot|file snapshot/i, evidence: "file snapshot evidence was detected." },
    { signal: "throw-error-inline", pattern: /toThrowErrorMatchingInlineSnapshot/i, evidence: "throw-error inline snapshot evidence was detected." },
    { signal: "to-have-screenshot", pattern: /toHaveScreenshot/i, evidence: "toHaveScreenshot evidence was detected." },
    { signal: "to-match-aria-snapshot", pattern: /toMatchAriaSnapshot|aria snapshot/i, evidence: "ARIA snapshot evidence was detected." },
    { signal: "property-matchers", pattern: /propertyMatchers|expect\.any|expect\.stringMatching|asymmetric matchers?|volatile fields?/i, evidence: "property matcher evidence was detected." },
    { signal: "custom-matchers", pattern: /Snapshots\.toMatch|jest-snapshot|custom snapshot matchers?|expect\.extend/i, evidence: "custom snapshot matcher evidence was detected." }
  ];
  return snapshotSignalFromSpecs(sourceFiles, specs, "assertion", "signal");
}

function snapshotStorageSignals(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["storageSignals"] {
  const specs: Array<{ signal: SnapshotReadinessReport["storageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "__snapshots__", pattern: /__snapshots__/i, evidence: "__snapshots__ storage evidence was detected." },
    { signal: "snap-files", pattern: /\.snap\b|snap file/i, evidence: ".snap file evidence was detected." },
    { signal: "file-snapshot", pattern: /toMatchFileSnapshot|file snapshot|fixtures?\//i, evidence: "file snapshot storage evidence was detected." },
    { signal: "snapshot-path-template", pattern: /snapshotPathTemplate|snapshotResolver|snapshot path/i, evidence: "snapshot path template evidence was detected." },
    { signal: "screenshot-baseline", pattern: /__screenshots__|screenshots?\/|baseline screenshot|expected screenshot/i, evidence: "screenshot baseline evidence was detected." },
    { signal: "aria-yaml", pattern: /\.aria\.ya?ml|ARIA snapshot|aria snapshot/i, evidence: "ARIA YAML evidence was detected." },
    { signal: "version-controlled-baseline", pattern: /commit.*snapshot|version control|checked in|part of the code|baseline.*repo/i, evidence: "version-controlled baseline evidence was detected." }
  ];
  return snapshotSignalFromSpecs(sourceFiles, specs, "storage", "signal");
}

function snapshotUpdateSignals(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["updateSignals"] {
  const specs: Array<{ signal: SnapshotReadinessReport["updateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "update-snapshot", pattern: /--updateSnapshot|updateSnapshot\b/i, evidence: "Jest updateSnapshot evidence was detected." },
    { signal: "update-snapshots", pattern: /--update-snapshots|update snapshots/i, evidence: "Playwright update-snapshots evidence was detected." },
    { signal: "watch-update", pattern: /watch mode|\bu key\b|interactive update/i, evidence: "watch update evidence was detected." },
    { signal: "ci-new-snapshot-fail", pattern: /--ci|CI.*new snapshot.*fail|new snapshots?.*CI.*fail|not automatically written.*CI/i, evidence: "CI new-snapshot fail evidence was detected." },
    { signal: "missing-only", pattern: /missing-only|missing snapshots?|update-snapshots[ =:]+missing|updateSnapshots:\s*['"]missing/i, evidence: "missing-only update policy evidence was detected." },
    { signal: "changed-only", pattern: /changed-only|changed snapshots?|update-snapshots[ =:]+changed|updateSnapshots:\s*['"]changed/i, evidence: "changed-only update policy evidence was detected." },
    { signal: "all-update", pattern: /updateSnapshots:\s*['"]all|--update-snapshots[ =:]+all|updateSnapshot:\s*['"]all/i, evidence: "all update policy evidence was detected." },
    { signal: "none-update", pattern: /updateSnapshots:\s*['"]none|--update-snapshots[ =:]+none|updateSnapshot:\s*['"]none/i, evidence: "none update policy evidence was detected." }
  ];
  return snapshotSignalFromSpecs(sourceFiles, specs, "update", "signal");
}

function snapshotSerializerSignals(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["serializerSignals"] {
  const specs: Array<{ signal: SnapshotReadinessReport["serializerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "snapshot-serializers", pattern: /snapshotSerializers/i, evidence: "snapshotSerializers evidence was detected." },
    { signal: "add-snapshot-serializer", pattern: /addSnapshotSerializer/i, evidence: "expect.addSnapshotSerializer evidence was detected." },
    { signal: "snapshot-format", pattern: /snapshotFormat/i, evidence: "snapshotFormat evidence was detected." },
    { signal: "pretty-format", pattern: /pretty-format|prettyFormat/i, evidence: "pretty-format evidence was detected." },
    { signal: "custom-serializer", pattern: /serializer|test:\s*\(|print:\s*\(|serialize/i, evidence: "custom serializer evidence was detected." }
  ];
  return snapshotSignalFromSpecs(sourceFiles, specs, "serializer", "signal");
}

function snapshotVisualSignals(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["visualSignals"] {
  const specs: Array<{ signal: SnapshotReadinessReport["visualSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "to-have-screenshot", pattern: /toHaveScreenshot/i, evidence: "toHaveScreenshot visual evidence was detected." },
    { signal: "max-diff-pixels", pattern: /maxDiffPixels/i, evidence: "maxDiffPixels evidence was detected." },
    { signal: "max-diff-pixel-ratio", pattern: /maxDiffPixelRatio/i, evidence: "maxDiffPixelRatio evidence was detected." },
    { signal: "threshold", pattern: /threshold/i, evidence: "visual threshold evidence was detected." },
    { signal: "mask", pattern: /mask:\s*\[|mask:|masked elements?/i, evidence: "mask evidence was detected." },
    { signal: "mask-color", pattern: /maskColor/i, evidence: "maskColor evidence was detected." },
    { signal: "style-path", pattern: /stylePath/i, evidence: "stylePath evidence was detected." },
    { signal: "animations", pattern: /animations:\s*['"]disabled|animations/i, evidence: "animations control evidence was detected." },
    { signal: "caret", pattern: /caret:\s*['"]hide|caret/i, evidence: "caret control evidence was detected." },
    { signal: "scale", pattern: /scale:\s*['"]css|scale:\s*['"]device|scale/i, evidence: "scale evidence was detected." }
  ];
  return snapshotSignalFromSpecs(sourceFiles, specs, "visual", "signal");
}

function snapshotCiSignals(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["ciSignals"] {
  const specs: Array<{ signal: SnapshotReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|pull request/i, evidence: "pull request CI evidence was detected." },
    { signal: "update-forbidden", pattern: /--ci|update-forbidden|update snapshots forbidden|updateSnapshot.*none|update-snapshots=none/i, evidence: "forbidden snapshot update evidence was detected." },
    { signal: "snapshot-artifact", pattern: /upload-artifact|snapshot.*artifact|playwright-report|test-results/i, evidence: "snapshot artifact evidence was detected." },
    { signal: "os-matrix", pattern: /matrix:|runs-on:|ubuntu|macos|windows|os:/i, evidence: "OS matrix evidence was detected." },
    { signal: "browser-matrix", pattern: /browserName|chromium|firefox|webkit|project.*browser/i, evidence: "browser matrix evidence was detected." },
    { signal: "snapshot-report", pattern: /HTML report|snapshot diff|playwright-report|jest-html|summary/i, evidence: "snapshot report evidence was detected." }
  ];
  return snapshotSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function snapshotPackageSignals(sourceFiles: SnapshotSourceFile[]): SnapshotReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SnapshotReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "jest", pattern: /"jest"|jest\.config|npx jest/i, evidence: "Jest package/config evidence was detected." },
    { signal: "vitest", pattern: /"vitest"|vitest\.config|npx vitest/i, evidence: "Vitest package/config evidence was detected." },
    { signal: "playwright", pattern: /"@playwright\/test"|playwright\.config|npx playwright/i, evidence: "Playwright package/config evidence was detected." },
    { signal: "jest-snapshot", pattern: /jest-snapshot/i, evidence: "jest-snapshot package evidence was detected." },
    { signal: "pretty-format", pattern: /pretty-format|prettyFormat/i, evidence: "pretty-format package evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library|react-test-renderer/i, evidence: "Testing Library or renderer evidence was detected." }
  ];
  return snapshotSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function snapshotSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SnapshotSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/snapshot-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
