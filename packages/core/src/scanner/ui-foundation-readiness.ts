import type { AccessibilityReport, DesignTokensReport, E2eReport, I18nReport, StorybookReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export async function buildAccessibilityReport(
  walk: WalkResult,
  e2eReport: E2eReport
): Promise<AccessibilityReport> {
  const sourceFiles = await accessibilitySourceFiles(walk);
  const scanTargets = accessibilityScanTargets(sourceFiles);
  const ruleTags = accessibilityRuleTags(sourceFiles);
  const resultBuckets = accessibilityResultBuckets(sourceFiles);
  const impactLevels = accessibilityImpactLevels(sourceFiles);
  const integrationSignals = accessibilityIntegrationSignals(sourceFiles);
  const contextControls = accessibilityContextControls(sourceFiles, e2eReport);
  const hasScanTarget = scanTargets.some((item) => item.readiness === "ready");
  const hasIntegration = integrationSignals.some((item) => item.readiness === "ready");
  const hasResultModel = resultBuckets.some((item) => item.bucket === "violations" && item.readiness === "ready");
  const hasWcagTag = ruleTags.some((item) => item.tag.startsWith("wcag") && item.readiness === "ready");
  const hasManualReview = resultBuckets.some((item) => item.bucket === "incomplete" && item.readiness === "ready")
    || integrationSignals.some((item) => item.integration === "manual-review" && item.readiness === "ready");

  const riskQueue: AccessibilityReport["riskQueue"] = [];
  if (!hasScanTarget) {
    riskQueue.push({
      priority: "high",
      action: "Add an accessibility scan target for at least one rendered page, component, or browser test flow.",
      why: "axe-core needs rendered HTML or a browser/test harness context before results can represent user-facing UI.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasScanTarget && !hasIntegration) {
    riskQueue.push({
      priority: "high",
      action: "Wire axe-core, jest-axe, Playwright axe injection, Cypress axe, Pa11y, or Lighthouse into the test workflow.",
      why: "Static markup hints are useful, but automated accessibility readiness needs an executable scan integration.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasIntegration && !hasResultModel) {
    riskQueue.push({
      priority: "medium",
      action: "Persist or assert the axe result buckets: violations, passes, incomplete, and inapplicable.",
      why: "The incomplete bucket is where axe-core asks for manual review; dropping it can hide important uncertainty.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasIntegration && !hasWcagTag) {
    riskQueue.push({
      priority: "medium",
      action: "Record WCAG/category tags or runOnly configuration so failures map back to standards and remediation queues.",
      why: "Axe rules are more actionable when grouped by WCAG level, best-practice, and content category.",
      relatedHref: "html/accessibility.html"
    });
  }
  if (hasIntegration && !hasManualReview) {
    riskQueue.push({
      priority: "medium",
      action: "Add a manual-review path for incomplete results and hidden or newly revealed UI states.",
      why: "axe-core explicitly returns incomplete results when it cannot be certain.",
      relatedHref: "html/accessibility.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the accessibility scanner against the original app before treating this report as an accessibility pass.",
    why: "RepoTutor only performs static readiness analysis and never executes axe-core or a browser.",
    relatedHref: "html/accessibility.html"
  });

  return {
    summary: `axe-core식 accessibility readiness report: scan target ${scanTargets.length}개, integration signal ${integrationSignals.length}개, rule tag ${ruleTags.length}개, context control ${contextControls.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "axe-core accessibility engine WCAG tags violations passes incomplete inapplicable impact selectors context configure reporter iframes",
    scanTargets,
    ruleTags,
    resultBuckets,
    impactLevels,
    integrationSignals,
    contextControls,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm install axe-core --save-dev", purpose: "Install the axe-core accessibility engine for browser or fixture tests." },
      { command: "await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })", purpose: "Run axe against rendered UI and scope the result to WCAG A/AA tags." },
      { command: "expect(results.violations).toHaveLength(0)", purpose: "Fail CI when automated violations are returned." },
      { command: "review results.incomplete", purpose: "Route uncertain axe checks to manual accessibility review." },
      { command: "npx lighthouse <url> --only-categories=accessibility --output=json", purpose: "Optionally collect a browser-level accessibility audit artifact." }
    ],
    learnerNextSteps: [
      "먼저 rendered page/component/test flow 중 어디에서 accessibility scan을 실행할지 정하세요.",
      "`violations`만 보지 말고 `incomplete`를 manual review queue로 남기세요.",
      "WCAG tag와 axe category를 저장하면 remediation 우선순위를 잡기 쉽습니다.",
      "이 리포트는 정적 readiness입니다. 실제 접근성 pass/fail은 원본 앱에서 axe-core나 브라우저 audit로 확인하세요."
    ]
  };
}

type AccessibilitySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function accessibilitySourceFiles(walk: WalkResult): Promise<AccessibilitySourceFile[]> {
  const files: AccessibilitySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !accessibilityInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!accessibilityPathSignal(file.relPath) && !accessibilityContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 140) break;
  }
  return files;
}

function accessibilityInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s|lighthouserc\.(json|js|cjs|mjs)|pa11y\.(json|js|cjs|mjs)|axe\.(json|js|cjs|mjs))$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(html|tsx|jsx|vue|svelte|astro|ts|js|mjs|cjs|json|ya?ml|md)$/i.test(filePath);
}

function accessibilityPathSignal(filePath: string): boolean {
  return /(accessibility|a11y|axe|pa11y|lighthouse|wcag|aria|screenreader|screen-reader|keyboard|contrast|semantic|landmark|alt-text)/i.test(filePath);
}

function accessibilityContentSignal(text: string): boolean {
  return /(axe-core|axe\.run|axe\.configure|axe\.getRules|jest-axe|toHaveNoViolations|injectAxe|checkA11y|cy\.checkA11y|pa11y|lighthouse|violations|incomplete|inapplicable|wcag2a|wcag2aa|wcag21aa|wcag22aa|best-practice|aria-|role=|alt=|tabindex|skip link|color-contrast|accessible name|screen reader)/i.test(text);
}

function accessibilityScanTargets(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["scanTargets"] {
  return sourceFiles
    .filter((source) => /\.(html|tsx|jsx|vue|svelte|astro|ts|js|mjs|cjs|json|ya?ml)$/i.test(source.filePath))
    .map((source) => ({
      filePath: source.filePath,
      kind: accessibilityTargetKind(source.filePath, source.text),
      readiness: accessibilityContentSignal(source.text) ? "ready" as const : "partial" as const,
      evidence: accessibilityTargetEvidence(source.filePath, source.text),
      sourceHref: source.sourceHref
    }))
    .slice(0, 80);
}

function accessibilityTargetKind(filePath: string, text: string): AccessibilityReport["scanTargets"][number]["kind"] {
  if (/package\.json|lighthouserc|pa11y|axe\.(json|js|cjs|mjs)/i.test(filePath)) return "config";
  if (/\.(test|spec|cy|e2e)\.[cm]?[jt]sx?$/i.test(filePath) || /axe\.run|checkA11y|toHaveNoViolations|pa11y|lighthouse/i.test(text)) return "test";
  if (/\.(tsx|jsx|vue|svelte|astro)$/i.test(filePath)) return "component";
  if (/\.html$/i.test(filePath)) return "page";
  if (/template|handlebars|mustache|njk|ejs/i.test(filePath)) return "template";
  return "unknown";
}

function accessibilityTargetEvidence(filePath: string, text: string): string {
  if (/axe\.run|checkA11y|toHaveNoViolations/i.test(text)) return `${filePath} includes an executable axe-style accessibility check.`;
  if (/axe-core|jest-axe|pa11y|lighthouse/i.test(text)) return `${filePath} references an accessibility audit dependency or command.`;
  if (/aria-|role=|alt=|tabindex|skip link|color-contrast|accessible name/i.test(text)) return `${filePath} contains accessibility-relevant markup or guidance.`;
  return `${filePath} is an accessibility-shaped target candidate.`;
}

function accessibilityRuleTags(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["ruleTags"] {
  const specs: Array<{ tag: AccessibilityReport["ruleTags"][number]["tag"]; pattern: RegExp; evidence: string }> = [
    { tag: "wcag2a", pattern: /wcag2a|wcag 2(?:\.0)? level a|\bA\/AA\b/i, evidence: "WCAG 2 A tag evidence was detected." },
    { tag: "wcag2aa", pattern: /wcag2aa|wcag 2(?:\.0)? level aa|\bA\/AA\b/i, evidence: "WCAG 2 AA tag evidence was detected." },
    { tag: "wcag21a", pattern: /wcag21a|wcag 2\.1 level a/i, evidence: "WCAG 2.1 A tag evidence was detected." },
    { tag: "wcag21aa", pattern: /wcag21aa|wcag 2\.1 level aa/i, evidence: "WCAG 2.1 AA tag evidence was detected." },
    { tag: "wcag22aa", pattern: /wcag22aa|wcag 2\.2 level aa/i, evidence: "WCAG 2.2 AA tag evidence was detected." },
    { tag: "best-practice", pattern: /best-practice|best practice/i, evidence: "axe best-practice tag evidence was detected." },
    { tag: "section508", pattern: /section508|section 508/i, evidence: "Section 508 tag evidence was detected." },
    { tag: "cat.aria", pattern: /cat\.aria|aria-/i, evidence: "ARIA category evidence was detected." },
    { tag: "cat.color", pattern: /cat\.color|color-contrast|contrast ratio/i, evidence: "Color/contrast category evidence was detected." },
    { tag: "cat.forms", pattern: /cat\.forms|label|form|input|select|textarea/i, evidence: "Forms category evidence was detected." },
    { tag: "cat.keyboard", pattern: /cat\.keyboard|keyboard|tabindex|focus|skip link/i, evidence: "Keyboard category evidence was detected." },
    { tag: "cat.language", pattern: /cat\.language|html lang|language/i, evidence: "Language category evidence was detected." },
    { tag: "cat.name-role-value", pattern: /cat\.name-role-value|accessible name|role=|aria-label/i, evidence: "Name/role/value category evidence was detected." },
    { tag: "cat.parsing", pattern: /cat\.parsing|duplicate id|valid html|parser/i, evidence: "Parsing category evidence was detected." },
    { tag: "cat.semantics", pattern: /cat\.semantics|heading|landmark|main|nav|footer|header/i, evidence: "Semantics category evidence was detected." },
    { tag: "cat.structure", pattern: /cat\.structure|iframe|frame|region|document title/i, evidence: "Structure category evidence was detected." },
    { tag: "cat.tables", pattern: /cat\.tables|table|th|td|caption|scope/i, evidence: "Tables category evidence was detected." },
    { tag: "cat.text-alternatives", pattern: /cat\.text-alternatives|alt=|alternative text|image alt/i, evidence: "Text alternatives category evidence was detected." },
    { tag: "cat.time-and-media", pattern: /cat\.time-and-media|video|audio|caption|autoplay/i, evidence: "Time/media category evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      tag: spec.tag,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.tag} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/accessibility.html"
    };
  });
}

function accessibilityResultBuckets(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["resultBuckets"] {
  const specs: Array<{ bucket: AccessibilityReport["resultBuckets"][number]["bucket"]; pattern: RegExp; evidence: string }> = [
    { bucket: "violations", pattern: /violations|results\.violations|violation/i, evidence: "violations result bucket is read, asserted, or persisted." },
    { bucket: "passes", pattern: /passes|results\.passes/i, evidence: "passes result bucket is read or persisted." },
    { bucket: "incomplete", pattern: /incomplete|needs review|manual review/i, evidence: "incomplete/manual-review bucket is read or persisted." },
    { bucket: "inapplicable", pattern: /inapplicable|not applicable/i, evidence: "inapplicable result bucket is read or persisted." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      bucket: spec.bucket,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.bucket} result bucket evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/accessibility.html"
    };
  });
}

function accessibilityImpactLevels(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["impactLevels"] {
  const specs: Array<{ impact: AccessibilityReport["impactLevels"][number]["impact"]; pattern: RegExp; evidence: string }> = [
    { impact: "critical", pattern: /critical/i, evidence: "critical impact handling is referenced." },
    { impact: "serious", pattern: /serious/i, evidence: "serious impact handling is referenced." },
    { impact: "moderate", pattern: /moderate/i, evidence: "moderate impact handling is referenced." },
    { impact: "minor", pattern: /minor/i, evidence: "minor impact handling is referenced." },
    { impact: "unknown", pattern: /impact|severity|priority/i, evidence: "generic impact/severity handling is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      impact: spec.impact,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.impact} impact evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/accessibility.html"
    };
  });
}

function accessibilityIntegrationSignals(sourceFiles: AccessibilitySourceFile[]): AccessibilityReport["integrationSignals"] {
  const specs: Array<{ integration: AccessibilityReport["integrationSignals"][number]["integration"]; pattern: RegExp; evidence: string }> = [
    { integration: "axe-run", pattern: /axe\.run|axe\.runPartial|axe\.finishRun/i, evidence: "runs axe directly against a rendered context." },
    { integration: "axe-core-package", pattern: /["']axe-core["']|axe-core/i, evidence: "declares or imports axe-core." },
    { integration: "jest-axe", pattern: /jest-axe|toHaveNoViolations/i, evidence: "uses jest-axe matchers." },
    { integration: "playwright-axe", pattern: /@axe-core\/playwright|injectAxe|playwright.*axe|axe.*playwright/i, evidence: "uses Playwright accessibility scan integration." },
    { integration: "cypress-axe", pattern: /cypress-axe|cy\.injectAxe|cy\.checkA11y/i, evidence: "uses Cypress accessibility scan integration." },
    { integration: "pa11y", pattern: /pa11y/i, evidence: "uses Pa11y accessibility scan integration." },
    { integration: "lighthouse", pattern: /lighthouse|only-categories=accessibility/i, evidence: "uses Lighthouse accessibility category." },
    { integration: "manual-review", pattern: /manual review|needs review|incomplete/i, evidence: "keeps a manual review path for uncertain checks." }
  ];
  const rows: AccessibilityReport["integrationSignals"] = [];
  for (const source of sourceFiles) {
    for (const spec of specs) {
      if (!spec.pattern.test(source.text) && !spec.pattern.test(source.filePath)) continue;
      rows.push({
        filePath: source.filePath,
        integration: spec.integration,
        readiness: "ready",
        evidence: `${source.filePath} ${spec.evidence}`,
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 80);
}

function accessibilityContextControls(
  sourceFiles: AccessibilitySourceFile[],
  e2eReport: E2eReport
): AccessibilityReport["contextControls"] {
  const specs: Array<{ control: AccessibilityReport["contextControls"][number]["control"]; pattern: RegExp; evidence: string }> = [
    { control: "include-exclude", pattern: /include|exclude|context\s*:|axe\.run\([^)]*\{/i, evidence: "include/exclude context scoping is configured." },
    { control: "run-only-tags", pattern: /runOnly|wcag2a|wcag2aa|best-practice|tags/i, evidence: "runOnly tag or rule filtering is configured." },
    { control: "disable-rules", pattern: /enabled\s*:\s*false|disableOtherRules|rules\s*:/i, evidence: "rule disabling or custom rule configuration is present." },
    { control: "iframes", pattern: /iframe|frameMessenger|runPartial|finishRun|allowedOrigins/i, evidence: "iframe or frame communication control is referenced." },
    { control: "shadow-dom", pattern: /shadow dom|shadowSelect|shadow/i, evidence: "Shadow DOM scanning constraints are referenced." },
    { control: "locale", pattern: /locale|axe\.configure|resetLocale/i, evidence: "locale configuration is referenced." },
    { control: "reporter", pattern: /reporter|json|html report|junit/i, evidence: "reporter/output configuration is referenced." },
    { control: "jsdom", pattern: /jsdom/i, evidence: "JSDOM compatibility constraints are referenced." },
    { control: "timeouts", pattern: /timeout|elementInternals|wait/i, evidence: "timeout or async scan controls are referenced." }
  ];
  const hasE2eRuntime = e2eReport.runtimeTargets.some((item) => item.readiness === "ready" || item.readiness === "external");
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      control: spec.control,
      readiness: match ? "ready" : hasE2eRuntime && ["include-exclude", "reporter", "timeouts"].includes(spec.control) ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.control} control evidence was not detected.`,
      relatedHref: match?.sourceHref ?? (hasE2eRuntime ? "html/e2e.html" : "html/accessibility.html")
    };
  });
}

export async function buildStorybookReport(walk: WalkResult): Promise<StorybookReport> {
  const sourceFiles = await storybookSourceFiles(walk);
  const storyFiles = storybookStoryFiles(sourceFiles);
  const configFiles = storybookConfigFiles(sourceFiles);
  const storyAnnotations = storybookAnnotations(sourceFiles);
  const addonSignals = storybookAddonSignals(sourceFiles);
  const testSignals = storybookTestSignals(sourceFiles);
  const publishSignals = storybookPublishSignals(sourceFiles);
  const storybookSignals = storybookDetailedSignals(sourceFiles);
  const hasStory = storyFiles.some((item) => item.readiness === "ready");
  const hasConfig = configFiles.some((item) => item.configType === "main" && item.readiness === "ready");
  const hasArgs = storyAnnotations.some((item) => item.annotation === "args" && item.readiness === "ready");
  const hasDocs = addonSignals.some((item) => item.addon === "docs" && item.readiness === "ready")
    || storyAnnotations.some((item) => item.annotation === "tags" && item.readiness === "ready");
  const hasInteraction = storyAnnotations.some((item) => item.annotation === "play" && item.readiness === "ready")
    || testSignals.some((item) => item.signal === "interaction-tests" && item.readiness === "ready");
  const hasPublish = publishSignals.some((item) => item.signal === "build-storybook" && item.readiness === "ready")
    || publishSignals.some((item) => item.signal === "chromatic" && item.readiness === "ready");

  const riskQueue: StorybookReport["riskQueue"] = [];
  if (!hasStory) {
    riskQueue.push({
      priority: "high",
      action: "Add colocated CSF or MDX story files before claiming component-state coverage.",
      why: "Storybook's learning value starts with executable component examples such as Button.stories.tsx.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add `.storybook/main.*` with story globs, framework, addons, and build settings.",
      why: "Story files without a main config are hard to discover, build, or run consistently.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasArgs) {
    riskQueue.push({
      priority: "medium",
      action: "Use args and argTypes so learners can inspect component states through Controls.",
      why: "Storybook's Controls and Autodocs are most useful when stories expose state as args.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasDocs) {
    riskQueue.push({
      priority: "medium",
      action: "Enable docs/autodocs tags or MDX pages for living component documentation.",
      why: "Stories double as documentation when metadata, tags, and doc blocks are present.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add play functions or Storybook Test coverage for interactive component states.",
      why: "Render-only stories smoke-test appearance, but play functions capture user behavior.",
      relatedHref: "html/storybook.html"
    });
  }
  if (hasStory && !hasPublish) {
    riskQueue.push({
      priority: "low",
      action: "Add build-storybook, Chromatic, or composition signals before treating stories as shareable docs.",
      why: "Published Storybooks are easier to review, compare visually, and link from learning material.",
      relatedHref: "html/storybook.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Storybook or Storybook Test against the original app before treating this report as a UI test pass.",
    why: "RepoTutor only performs static readiness analysis and never starts the Storybook dev server.",
    relatedHref: "html/storybook.html"
  });

  return {
    summary: `Storybook식 component workshop readiness report: story file ${storyFiles.length}개, config ${configFiles.length}개, annotation ${storyAnnotations.length}개, Storybook signal ${storybookSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Storybook Component Story Format stories Meta StoryObj satisfies Meta args argTypes decorators loaders play functions beforeEach autodocs MDX addons test-runner Vitest Chromatic portable stories composition MSW component workshop",
    storyFiles,
    configFiles,
    storyAnnotations,
    addonSignals,
    testSignals,
    publishSignals,
    storybookSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx storybook@latest init", purpose: "Scaffold Storybook config, framework integration, and starter stories." },
      { command: "npm run storybook", purpose: "Start the component workshop locally for manual story review." },
      { command: "npm run build-storybook", purpose: "Build static Storybook documentation for review or hosting." },
      { command: "npm run test-storybook", purpose: "Run Storybook Test or test-runner checks for render and play-function coverage." },
      { command: "npx chromatic --project-token=<token>", purpose: "Optionally publish visual regression snapshots and review diffs." }
    ],
    learnerNextSteps: [
      "먼저 `.stories.*` 또는 MDX story가 컴포넌트 옆에 있는지 확인하세요.",
      "args/argTypes/parameters/decorators를 보면 어떤 상태를 학습자가 조작할 수 있는지 알 수 있습니다.",
      "play function은 story가 실제 사용자 행동까지 설명하는지 판단하는 핵심 신호입니다.",
      "이 리포트는 정적 readiness입니다. 실제 pass/fail은 원본 앱에서 Storybook과 Storybook Test로 확인하세요."
    ]
  };
}

type StorybookSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function storybookSourceFiles(walk: WalkResult): Promise<StorybookSourceFile[]> {
  const files: StorybookSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !storybookInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!storybookPathSignal(file.relPath) && !storybookContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 160) break;
  }
  return files;
}

function storybookInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|vitest\.config\.storybook\.[cm]?[jt]s|test-runner-jest\.config\.[cm]?[jt]s|chromatic\.(config\.)?(json|ya?ml|js|cjs|mjs))$/i.test(base)
    || /^\.storybook\/.+\.[cm]?[jt]sx?$/i.test(filePath)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(stories|story)\.(ts|tsx|js|jsx|mjs|cjs|mdx|svelte|vue)$/i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md|mdx)$/i.test(filePath);
}

function storybookPathSignal(filePath: string): boolean {
  return /(^|\/)\.storybook\/|storybook|\.stories\.|\.story\.|chromatic|test-storybook|stories\.json/i.test(filePath);
}

function storybookContentSignal(text: string): boolean {
  return /(@storybook\/|storybook|StoryObj|Meta<|satisfies\s+Meta|defineMeta|<Story\b|args\s*:|argTypes\s*:|decorators\s*:|parameters\s*:|loaders\s*:|beforeEach\s*:|tags\s*:|play\s*:|build-storybook|test-storybook|chromatic|composeStor(?:y|ies)|setProjectAnnotations|msw-storybook-addon)/i.test(text);
}

function storybookStoryFiles(sourceFiles: StorybookSourceFile[]): StorybookReport["storyFiles"] {
  return sourceFiles
    .filter((source) => /\.(stories|story)\.(ts|tsx|js|jsx|mjs|cjs|mdx|svelte|vue)$/i.test(source.filePath) || storybookStoryContent(source.text))
    .map((source) => ({
      filePath: source.filePath,
      format: storybookStoryFormat(source.filePath, source.text),
      readiness: storybookStoryContent(source.text) ? "ready" as const : "partial" as const,
      evidence: storybookStoryEvidence(source.filePath, source.text),
      sourceHref: source.sourceHref
    }))
    .slice(0, 100);
}

function storybookStoryContent(text: string): boolean {
  return /export\s+default|defineMeta|<Meta\b|export\s+const\s+[A-Z]\w+|StoryObj|satisfies\s+Meta|args\s*:|play\s*:/i.test(text)
    && /(@storybook\/|StoryObj|Meta<|defineMeta|<Story\b|\.stories\.|args\s*:|render\s*:|play\s*:)/i.test(text);
}

function storybookStoryFormat(filePath: string, text: string): StorybookReport["storyFiles"][number]["format"] {
  if (/\.mdx$/i.test(filePath) || /<Meta\b|<Story\b/i.test(text)) return "mdx";
  if (/defineMeta|@storybook\/addon-svelte-csf/i.test(text) || /\.stories\.svelte$/i.test(filePath)) return "svelte-csf";
  if (/StoryObj|satisfies\s+Meta|export\s+const\s+\w+\s*:\s*Story|export\s+const\s+\w+\s*=\s*\{/i.test(text)) return "csf3";
  if (/\.bind\(\{\}\)|Template\.bind|StoryFn|ComponentStory/i.test(text)) return "csf2";
  if (/storiesOf\s*\(/i.test(text)) return "legacy";
  return "unknown";
}

function storybookStoryEvidence(filePath: string, text: string): string {
  if (/StoryObj|satisfies\s+Meta/i.test(text)) return `${filePath} uses typed CSF story objects.`;
  if (/defineMeta|@storybook\/addon-svelte-csf/i.test(text)) return `${filePath} uses Svelte CSF metadata.`;
  if (/<Meta\b|<Story\b/i.test(text)) return `${filePath} uses MDX story/doc blocks.`;
  if (/play\s*:/i.test(text)) return `${filePath} includes play function evidence.`;
  if (/args\s*:/i.test(text)) return `${filePath} exposes args for interactive story states.`;
  return `${filePath} is a Storybook-shaped story file.`;
}

function storybookConfigFiles(sourceFiles: StorybookSourceFile[]): StorybookReport["configFiles"] {
  const rows: StorybookReport["configFiles"] = [];
  for (const source of sourceFiles) {
    const configType = storybookConfigType(source.filePath, source.text);
    if (configType === "unknown") continue;
    rows.push({
      filePath: source.filePath,
      configType,
      readiness: storybookConfigReadiness(configType, source.text),
      evidence: storybookConfigEvidence(source.filePath, configType, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function storybookConfigType(filePath: string, text: string): StorybookReport["configFiles"][number]["configType"] {
  const base = path.basename(filePath);
  if (/^main\.[cm]?[jt]sx?$/i.test(base) && filePath.includes(".storybook/")) return "main";
  if (/^preview\.[cm]?[jt]sx?$/i.test(base) && filePath.includes(".storybook/")) return "preview";
  if (/^manager\.[cm]?[jt]sx?$/i.test(base) && filePath.includes(".storybook/")) return "manager";
  if (/test-runner-jest\.config/i.test(base) || /test-storybook|@storybook\/test-runner/i.test(text)) return "test-runner";
  if (/vitest\.config\.storybook/i.test(base) || /storybook\/experimental-addon-test|@storybook\/addon-vitest/i.test(text)) return "vitest";
  if (/^package\.json$/i.test(base) && /storybook|build-storybook|test-storybook|chromatic/i.test(text)) return "package-script";
  return "unknown";
}

function storybookConfigReadiness(configType: StorybookReport["configFiles"][number]["configType"], text: string): StorybookReport["configFiles"][number]["readiness"] {
  if (configType === "main" && /stories\s*:|framework\s*:|addons\s*:/i.test(text)) return "ready";
  if (configType === "preview" && /decorators|parameters|globalTypes|tags/i.test(text)) return "ready";
  if (configType === "package-script" && /storybook|build-storybook|test-storybook/i.test(text)) return "ready";
  if (configType === "test-runner" || configType === "vitest" || configType === "manager") return "ready";
  return "partial";
}

function storybookConfigEvidence(filePath: string, configType: StorybookReport["configFiles"][number]["configType"], text: string): string {
  if (configType === "main") return `${filePath} configures stories, framework, addons, or build features.`;
  if (configType === "preview") return `${filePath} configures global decorators, parameters, tags, or toolbar globals.`;
  if (configType === "manager") return `${filePath} customizes the Storybook manager UI.`;
  if (configType === "test-runner") return `${filePath} configures or invokes Storybook test-runner.`;
  if (configType === "vitest") return `${filePath} configures Storybook Test or Vitest browser mode.`;
  if (/build-storybook/i.test(text)) return `${filePath} exposes a static Storybook build command.`;
  return `${filePath} contains Storybook package script evidence.`;
}

function storybookAnnotations(sourceFiles: StorybookSourceFile[]): StorybookReport["storyAnnotations"] {
  const specs: Array<{ annotation: StorybookReport["storyAnnotations"][number]["annotation"]; pattern: RegExp; evidence: string }> = [
    { annotation: "component", pattern: /component\s*:/i, evidence: "component metadata is present for docs and prop inference." },
    { annotation: "title", pattern: /title\s*:/i, evidence: "static title metadata is present for story hierarchy." },
    { annotation: "args", pattern: /args\s*:/i, evidence: "args are used to model component states." },
    { annotation: "argTypes", pattern: /argTypes\s*:/i, evidence: "argTypes customize Controls and docs metadata." },
    { annotation: "parameters", pattern: /parameters\s*:/i, evidence: "parameters configure addons or story rendering." },
    { annotation: "decorators", pattern: /decorators\s*:/i, evidence: "decorators wrap stories with layout, providers, or mocks." },
    { annotation: "loaders", pattern: /loaders\s*:/i, evidence: "loaders prepare data before stories render." },
    { annotation: "tags", pattern: /tags\s*:|autodocs/i, evidence: "tags or autodocs annotations are present." },
    { annotation: "render", pattern: /render\s*:/i, evidence: "custom render functions are present." },
    { annotation: "play", pattern: /play\s*:|async\s+\(\s*\{\s*canvas/i, evidence: "play functions capture post-render interaction steps." },
    { annotation: "name", pattern: /name\s*:/i, evidence: "story display name overrides are present." },
    { annotation: "subcomponents", pattern: /subcomponents\s*:/i, evidence: "subcomponent documentation metadata is present." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      annotation: spec.annotation,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.annotation} annotation evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

function storybookAddonSignals(sourceFiles: StorybookSourceFile[]): StorybookReport["addonSignals"] {
  const specs: Array<{ addon: StorybookReport["addonSignals"][number]["addon"]; pattern: RegExp; evidence: string }> = [
    { addon: "docs", pattern: /@storybook\/addon-docs|autodocs|docs\s*:/i, evidence: "Docs or Autodocs addon evidence was detected." },
    { addon: "controls", pattern: /@storybook\/addon-controls|controls\s*:|argTypes\s*:/i, evidence: "Controls addon or argTypes evidence was detected." },
    { addon: "actions", pattern: /@storybook\/addon-actions|actions\s*:|fn\(\)|argTypesRegex/i, evidence: "Actions or spy function evidence was detected." },
    { addon: "interactions", pattern: /@storybook\/addon-interactions|play\s*:|storybook\/test/i, evidence: "Interactions panel or play-function testing evidence was detected." },
    { addon: "a11y", pattern: /@storybook\/addon-a11y|a11y\s*:|accessibility/i, evidence: "A11y addon evidence was detected." },
    { addon: "viewport", pattern: /@storybook\/addon-viewport|viewport\s*:|globalTypes/i, evidence: "Viewport or globals toolbar evidence was detected." },
    { addon: "backgrounds", pattern: /@storybook\/addon-backgrounds|backgrounds\s*:/i, evidence: "Backgrounds addon evidence was detected." },
    { addon: "measure", pattern: /@storybook\/addon-measure|measure/i, evidence: "Measure addon evidence was detected." },
    { addon: "outline", pattern: /@storybook\/addon-outline|outline/i, evidence: "Outline addon evidence was detected." },
    { addon: "coverage", pattern: /@storybook\/addon-coverage|coverage/i, evidence: "Coverage addon evidence was detected." },
    { addon: "vitest", pattern: /@storybook\/addon-vitest|storybook\/experimental-addon-test|vitest/i, evidence: "Storybook Test or Vitest addon evidence was detected." },
    { addon: "test-runner", pattern: /@storybook\/test-runner|test-storybook/i, evidence: "Storybook test-runner evidence was detected." },
    { addon: "chromatic", pattern: /chromatic|@chromatic-com\/storybook/i, evidence: "Chromatic visual testing or publish evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      addon: spec.addon,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.addon} addon evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

function storybookTestSignals(sourceFiles: StorybookSourceFile[]): StorybookReport["testSignals"] {
  const specs: Array<{ signal: StorybookReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "render-tests", pattern: /\.stories\.|render test|stories are tests/i, evidence: "stories can act as browser render tests." },
    { signal: "interaction-tests", pattern: /play\s*:|userEvent|within\(|canvas\.|expect\(/i, evidence: "interaction testing evidence was detected." },
    { signal: "accessibility-tests", pattern: /@storybook\/addon-a11y|a11y|axe|accessibility/i, evidence: "accessibility testing evidence was detected." },
    { signal: "visual-tests", pattern: /chromatic|visual test|toHaveScreenshot|snapshot/i, evidence: "visual testing evidence was detected." },
    { signal: "snapshot-tests", pattern: /toMatchSnapshot|snapshot test|__snapshots__|serializer/i, evidence: "snapshot testing evidence was detected." },
    { signal: "coverage", pattern: /coverage|@storybook\/addon-coverage|--coverage/i, evidence: "coverage reporting evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|CI\b|upload-artifact|pull_request|storybook.*test/i, evidence: "CI workflow evidence was detected." },
    { signal: "storybook-test", pattern: /vitest --project=storybook|@storybook\/addon-vitest|storybook\/experimental-addon-test/i, evidence: "Storybook Test with Vitest evidence was detected." },
    { signal: "portable-stories", pattern: /composeStor(?:y|ies)|setProjectAnnotations|@storybook\/.*\/testing|portable stories/i, evidence: "portable stories reuse evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

function storybookPublishSignals(sourceFiles: StorybookSourceFile[]): StorybookReport["publishSignals"] {
  const specs: Array<{ signal: StorybookReport["publishSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "build-storybook", pattern: /build-storybook|storybook build|--output-dir/i, evidence: "static Storybook build command is configured." },
    { signal: "storybook-static", pattern: /storybook-static|static storybook|dist-storybook/i, evidence: "static Storybook output path is referenced." },
    { signal: "chromatic", pattern: /chromatic|@chromatic-com\/storybook/i, evidence: "Chromatic publish or visual review is configured." },
    { signal: "composition", pattern: /storybook composition|refs\s*:|storybook composition/i, evidence: "Storybook composition evidence was detected." },
    { signal: "refs", pattern: /refs\s*:/i, evidence: "refs are configured for composed Storybooks." },
    { signal: "static-dirs", pattern: /staticDirs\s*:/i, evidence: "static asset directories are configured." },
    { signal: "docs-mode", pattern: /docsMode\s*:|--docs/i, evidence: "docs-only mode evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

function storybookDetailedSignals(sourceFiles: StorybookSourceFile[]): StorybookReport["storybookSignals"] {
  const specs: Array<{ signal: StorybookReport["storybookSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "meta-type", pattern: /import\s+type\s+\{[^}]*\bMeta\b[^}]*\}\s+from\s+['"]@storybook\/|Meta<[^>]+>/i, evidence: "Storybook Meta typing evidence was detected." },
    { signal: "storyobj-type", pattern: /import\s+type\s+\{[^}]*\bStoryObj\b[^}]*\}\s+from\s+['"]@storybook\/|StoryObj<|StoryObj\s*=/i, evidence: "StoryObj typing evidence was detected." },
    { signal: "satisfies-meta", pattern: /satisfies\s+Meta(?:<|\b)/i, evidence: "TypeScript satisfies Meta evidence was detected." },
    { signal: "csf3-object", pattern: /export\s+const\s+[A-Z]\w+\s*(?::\s*Story\w*)?\s*=\s*\{[\s\S]{0,800}\bargs\s*:/i, evidence: "CSF3 object story evidence was detected." },
    { signal: "stories-glob", pattern: /\bstories\s*:\s*\[|\.stories\.\{|\*\*\/\*\.stories/i, evidence: ".storybook main stories glob evidence was detected." },
    { signal: "main-framework", pattern: /\bframework\s*:\s*(?:\{|['"])|@storybook\/(react|nextjs|vue3|svelte|web-components|html|angular|preact)(?:-|\/)/i, evidence: "Storybook framework integration evidence was detected." },
    { signal: "addons-array", pattern: /\baddons\s*:\s*\[|@storybook\/addon-/i, evidence: "Storybook addons array or addon package evidence was detected." },
    { signal: "static-dirs", pattern: /\bstaticDirs\s*:/i, evidence: "staticDirs asset publishing evidence was detected." },
    { signal: "preview-parameters", pattern: /\.storybook\/preview\.[cm]?[jt]sx?[\s\S]*parameters\s*:|export\s+const\s+parameters\s*=/i, evidence: "preview parameters evidence was detected." },
    { signal: "preview-decorators", pattern: /\.storybook\/preview\.[cm]?[jt]sx?[\s\S]*decorators\s*:|export\s+const\s+decorators\s*=/i, evidence: "preview decorators evidence was detected." },
    { signal: "global-types", pattern: /\bglobalTypes\s*[:=]/i, evidence: "toolbar/globalTypes evidence was detected." },
    { signal: "args", pattern: /\bargs\s*:/i, evidence: "story args evidence was detected." },
    { signal: "arg-types", pattern: /\bargTypes\s*:/i, evidence: "argTypes controls metadata evidence was detected." },
    { signal: "parameters", pattern: /\bparameters\s*:/i, evidence: "story/component/project parameters evidence was detected." },
    { signal: "loaders", pattern: /\bloaders\s*:/i, evidence: "Storybook loaders evidence was detected." },
    { signal: "before-each", pattern: /\bbeforeEach\s*:/i, evidence: "Storybook beforeEach setup/cleanup evidence was detected." },
    { signal: "play-function", pattern: /\bplay\s*:\s*async|\bplay\s*:\s*\(|async\s+\(\s*\{\s*canvas/i, evidence: "play function interaction evidence was detected." },
    { signal: "tags-autodocs", pattern: /\btags\s*:\s*\[[^\]]*['"]autodocs['"]|autodocs/i, evidence: "autodocs tag evidence was detected." },
    { signal: "mdx-docs", pattern: /<Meta\b|<Story\b|@storybook\/blocks|\.mdx$/i, evidence: "MDX docs/story block evidence was detected." },
    { signal: "storybook-test-import", pattern: /from\s+['"]storybook\/test['"]|from\s+['"]@storybook\/test['"]|storybook\/test/i, evidence: "storybook/test interaction utility evidence was detected." },
    { signal: "portable-stories", pattern: /composeStor(?:y|ies)|setProjectAnnotations|portable stories|@storybook\/.*\/testing/i, evidence: "portable stories reuse evidence was detected." },
    { signal: "vitest-addon", pattern: /@storybook\/addon-vitest|storybook\/experimental-addon-test|vitest\.config\.storybook/i, evidence: "Storybook Vitest addon evidence was detected." },
    { signal: "test-runner", pattern: /@storybook\/test-runner|test-storybook|test-runner-jest\.config/i, evidence: "Storybook test-runner evidence was detected." },
    { signal: "chromatic", pattern: /chromatic|@chromatic-com\/storybook/i, evidence: "Chromatic publish/visual review evidence was detected." },
    { signal: "composition-refs", pattern: /\brefs\s*:|storybook composition|composed Storybooks?/i, evidence: "Storybook composition refs evidence was detected." },
    { signal: "msw-addon", pattern: /msw-storybook-addon|parameters\s*:[\s\S]{0,400}\bmsw\b|initialize\s*\(\s*\{[^}]*onUnhandledRequest/i, evidence: "MSW Storybook addon or request mocking evidence was detected." },
    { signal: "svelte-csf", pattern: /@storybook\/addon-svelte-csf|defineMeta\s*\(|<Story\s+name=/i, evidence: "Svelte CSF addon evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/storybook.html"
    };
  });
}

export async function buildDesignTokensReport(
  walk: WalkResult,
  storybookReport: StorybookReport
): Promise<DesignTokensReport> {
  const sourceFiles = await designTokenSourceFiles(walk);
  const tokenSources = designTokenSources(sourceFiles);
  const tokenCategories = designTokenCategories(sourceFiles);
  const platformTargets = designTokenPlatformTargets(sourceFiles);
  const transformSignals = designTokenTransformSignals(sourceFiles);
  const usageSignals = designTokenUsageSignals(sourceFiles, storybookReport);
  const governanceSignals = designTokenGovernanceSignals(sourceFiles);
  const hasTokenSource = tokenSources.some((item) => item.readiness === "ready");
  const hasPlatform = platformTargets.some((item) => item.readiness === "ready");
  const hasTransform = transformSignals.some((item) => ["transform-group", "transforms", "formats"].includes(item.signal) && item.readiness === "ready");
  const hasUsage = usageSignals.some((item) => item.readiness === "ready");
  const hasGovernance = governanceSignals.some((item) => ["aliases", "comments", "deprecation", "multi-brand", "themes"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: DesignTokensReport["riskQueue"] = [];
  if (!hasTokenSource) {
    riskQueue.push({
      priority: "high",
      action: "Add a canonical design token source such as tokens/**/*.json or a Style Dictionary config.",
      why: "Generated styles are only trustworthy when design values have a single source of truth.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasPlatform) {
    riskQueue.push({
      priority: "high",
      action: "Define Style Dictionary platforms with buildPath, files, destination, and format outputs.",
      why: "Tokens need explicit platform targets before they can reach CSS, Android, iOS, JS, or docs.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasTransform) {
    riskQueue.push({
      priority: "medium",
      action: "Choose transformGroup or transforms and output formats for each target platform.",
      why: "Raw token values often need naming, unit, color, or platform transforms before use.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasUsage) {
    riskQueue.push({
      priority: "medium",
      action: "Connect generated tokens to CSS variables, theme providers, Tailwind config, components, or Storybook docs.",
      why: "A token build that is never consumed will drift from the real UI.",
      relatedHref: "html/design-tokens.html"
    });
  }
  if (hasTokenSource && !hasGovernance) {
    riskQueue.push({
      priority: "low",
      action: "Add naming, alias, comment, theme, deprecation, or release governance for tokens.",
      why: "Design tokens become shared API; governance prevents breaking style changes.",
      relatedHref: "html/design-tokens.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the token build in the original repository before treating this report as design-system parity.",
    why: "RepoTutor only performs static readiness analysis and never executes Style Dictionary.",
    relatedHref: "html/design-tokens.html"
  });

  return {
    summary: `Style Dictionary식 design token readiness report: token source ${tokenSources.length}개, platform target ${platformTargets.length}개, transform signal ${transformSignals.length}개, usage signal ${usageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Style Dictionary design tokens source include platforms transformGroup transforms buildPath files formats CTI aliases multi-platform CSS Android iOS",
    tokenSources,
    tokenCategories,
    platformTargets,
    transformSignals,
    usageSignals,
    governanceSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm install -D style-dictionary", purpose: "Install Style Dictionary as the design token build tool." },
      { command: "style-dictionary init basic", purpose: "Create a starter token source and multi-platform config." },
      { command: "style-dictionary build --config config.json", purpose: "Build all configured token platforms." },
      { command: "style-dictionary build --platform css", purpose: "Build one target platform while iterating on transforms or formats." },
      { command: "git diff -- build/", purpose: "Review generated token artifacts before publishing them." }
    ],
    learnerNextSteps: [
      "먼저 canonical token source와 Style Dictionary config가 분리되어 있는지 확인하세요.",
      "source/include, platforms, transformGroup, buildPath, files, format이 한 흐름으로 이어지는지 보세요.",
      "color/size/font 같은 token category와 alias reference가 실제 UI 사용처까지 연결되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 token output은 원본 repo에서 Style Dictionary build로 확인하세요."
    ]
  };
}

type DesignTokenSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function designTokenSourceFiles(walk: WalkResult): Promise<DesignTokenSourceFile[]> {
  const files: DesignTokenSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !designTokenInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!designTokenPathSignal(file.relPath) && !designTokenContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 160) break;
  }
  return files;
}

function designTokenInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|config\.(json|js|cjs|mjs|ts)|style-dictionary\.(config\.)?(json|js|cjs|mjs|ts)|tokens\.(json|js|cjs|mjs|ts)|tailwind\.config\.[cm]?[jt]s)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(tokens?|design-tokens?|style-dictionary|theme|themes|styles|css|scss|sass)\//i.test(filePath)
    || /\.(json|ya?ml|ts|tsx|js|jsx|mjs|cjs|css|scss|sass|md|mdx)$/i.test(filePath);
}

function designTokenPathSignal(filePath: string): boolean {
  return /(style-dictionary|design-tokens?|tokens?\/|\/tokens?|theme|themes|variables|primitives|semantic|css\/variables|tailwind\.config|colors?|typography|spacing|radius|shadow)/i.test(filePath);
}

function designTokenContentSignal(text: string): boolean {
  return /(style-dictionary|source\s*:|include\s*:|platforms\s*:|transformGroup|transforms\s*:|buildPath|destination\s*:|format\s*:|css\/variables|scss\/variables|android\/|ios-|ios\/|compose\/|registerTransform|registerFormat|registerParser|outputReferences|usesDtcg|DTCG|\$type|["']value["']|--[a-z0-9-]+:\s*|theme\s*:|colors\s*:|spacing\s*:|fontSize\s*:)/i.test(text);
}

function designTokenSources(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["tokenSources"] {
  const rows: DesignTokensReport["tokenSources"] = [];
  for (const source of sourceFiles) {
    const format = designTokenSourceFormat(source.filePath, source.text);
    if (format === "unknown" && !/["']value["']|\$type|--[a-z0-9-]+:\s*/i.test(source.text)) continue;
    rows.push({
      filePath: source.filePath,
      format,
      readiness: format === "unknown" ? "partial" : "ready",
      evidence: designTokenSourceEvidence(source.filePath, format, source.text),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function designTokenSourceFormat(filePath: string, text: string): DesignTokensReport["tokenSources"][number]["format"] {
  if (/style-dictionary|platforms\s*:|transformGroup|buildPath|source\s*:/i.test(text) || /style-dictionary|config\.(json|js|cjs|mjs|ts)$/i.test(filePath)) return "style-dictionary-config";
  if (/usesDtcg|DTCG|\$type|\$value/i.test(text)) return "dtcg-json";
  if (/tokens?\.(js|cjs|mjs|ts)$/i.test(filePath)) return "tokens-js";
  if (/tokens?.*\.json|design-tokens?.*\.json/i.test(filePath) || /["']value["']\s*:/i.test(text)) return "tokens-json";
  if (/--[a-z0-9-]+:\s*[^;]+;/i.test(text) || /\.css$/i.test(filePath)) return "css-custom-properties";
  if (/tailwind\.config/i.test(filePath) || /theme\s*:|colors\s*:|spacing\s*:|fontSize\s*:/i.test(text)) return "tailwind-theme";
  if (/\$[a-z0-9_-]+:\s*[^;]+;/i.test(text) || /\.(scss|sass)$/i.test(filePath)) return "sass-variables";
  return "unknown";
}

function designTokenSourceEvidence(filePath: string, format: DesignTokensReport["tokenSources"][number]["format"], text: string): string {
  if (format === "style-dictionary-config") return `${filePath} configures Style Dictionary source/platform/build output.`;
  if (format === "dtcg-json") return `${filePath} contains DTCG-style token metadata.`;
  if (format === "tokens-json" || format === "tokens-js") return `${filePath} contains token value objects.`;
  if (format === "css-custom-properties") return `${filePath} exposes CSS custom property tokens.`;
  if (format === "tailwind-theme") return `${filePath} exposes Tailwind theme tokens.`;
  if (format === "sass-variables") return `${filePath} exposes Sass variable tokens.`;
  if (/["']value["']|\$type/i.test(text)) return `${filePath} contains token-shaped value metadata.`;
  return `${filePath} is a design-token-shaped source candidate.`;
}

function designTokenCategories(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["tokenCategories"] {
  const specs: Array<{ category: DesignTokensReport["tokenCategories"][number]["category"]; pattern: RegExp; evidence: string }> = [
    { category: "color", pattern: /color|colors|#[0-9a-f]{3,8}|rgb\(|hsl\(|\$type["']?\s*:\s*["']color/i, evidence: "color token evidence was detected." },
    { category: "size", pattern: /\bsize\b|sizing|dimension|\d+(px|rem|em|dp|sp)/i, evidence: "size/dimension token evidence was detected." },
    { category: "dimension", pattern: /dimension|\$type["']?\s*:\s*["']dimension/i, evidence: "DTCG dimension token evidence was detected." },
    { category: "typography", pattern: /typography|fontFamily|fontWeight|lineHeight|letterSpacing/i, evidence: "typography token evidence was detected." },
    { category: "font", pattern: /\bfont\b|fontSize|font-size|font-weight/i, evidence: "font token evidence was detected." },
    { category: "spacing", pattern: /spacing|space|gap|padding|margin/i, evidence: "spacing token evidence was detected." },
    { category: "border", pattern: /border|stroke/i, evidence: "border token evidence was detected." },
    { category: "radius", pattern: /radius|borderRadius|rounded/i, evidence: "radius token evidence was detected." },
    { category: "shadow", pattern: /shadow|boxShadow|elevation/i, evidence: "shadow/elevation token evidence was detected." },
    { category: "motion", pattern: /motion|duration|easing|transition|animation/i, evidence: "motion token evidence was detected." },
    { category: "opacity", pattern: /opacity|alpha/i, evidence: "opacity token evidence was detected." },
    { category: "breakpoint", pattern: /breakpoint|screen|media/i, evidence: "breakpoint token evidence was detected." },
    { category: "asset", pattern: /asset|icon|image|font-face|base64/i, evidence: "asset token evidence was detected." },
    { category: "z-index", pattern: /zIndex|z-index|layer/i, evidence: "z-index token evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      category: spec.category,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.category} token evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

function designTokenPlatformTargets(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["platformTargets"] {
  const specs: Array<{ target: DesignTokensReport["platformTargets"][number]["target"]; pattern: RegExp; evidence: string }> = [
    { target: "css", pattern: /css\/variables|build\/css|\.css|platforms\s*:[\s\S]*css/i, evidence: "CSS token output target is configured or referenced." },
    { target: "scss", pattern: /scss\/variables|sass\/|scss|\.scss/i, evidence: "SCSS/Sass token output target is configured or referenced." },
    { target: "javascript", pattern: /javascript|js\/|\.js|format["']?\s*:\s*["']javascript/i, evidence: "JavaScript token output target is configured or referenced." },
    { target: "typescript", pattern: /typescript|\.d\.ts|\.ts|ts\/definitions/i, evidence: "TypeScript token output target is configured or referenced." },
    { target: "android", pattern: /android\/|build\/android|fontDimens|colors\.xml/i, evidence: "Android token output target is configured." },
    { target: "compose", pattern: /compose\/|StyleDictionary.*\.kt|Kotlin/i, evidence: "Jetpack Compose token output target is configured." },
    { target: "ios", pattern: /ios\/|build\/ios|\.h"|\.m"|UIColor/i, evidence: "iOS Objective-C token output target is configured." },
    { target: "ios-swift", pattern: /ios-swift|SwiftUI|\.swift|enum\.swift|class\.swift/i, evidence: "iOS Swift token output target is configured." },
    { target: "flutter", pattern: /flutter|\.dart/i, evidence: "Flutter token output target is referenced." },
    { target: "react-native", pattern: /react-native|React Native/i, evidence: "React Native token output target is referenced." },
    { target: "docs", pattern: /style documentation|docs|html\/|markdown/i, evidence: "Token documentation output target is referenced." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      target: spec.target,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.target} platform target evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

function designTokenTransformSignals(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["transformSignals"] {
  const specs: Array<{ signal: DesignTokensReport["transformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "transform-group", pattern: /transformGroup/i, evidence: "transformGroup is configured." },
    { signal: "transforms", pattern: /transforms\s*:/i, evidence: "explicit transform list is configured." },
    { signal: "formats", pattern: /format\s*:|formats\./i, evidence: "output formats are configured." },
    { signal: "build-path", pattern: /buildPath/i, evidence: "buildPath output directory is configured." },
    { signal: "files", pattern: /files\s*:|destination\s*:/i, evidence: "generated output files are configured." },
    { signal: "filters", pattern: /filter\s*:|\$type/i, evidence: "file/token filters are configured." },
    { signal: "custom-transform", pattern: /registerTransform|transformTypes|custom transform/i, evidence: "custom transform evidence was detected." },
    { signal: "custom-format", pattern: /registerFormat|custom format/i, evidence: "custom format evidence was detected." },
    { signal: "custom-parser", pattern: /registerParser|custom parser|yaml tokens/i, evidence: "custom parser evidence was detected." },
    { signal: "output-references", pattern: /outputReferences|references|aliasing|\{[a-z0-9_.-]+\}/i, evidence: "alias/reference output evidence was detected." },
    { signal: "expand", pattern: /expand\s*:|expanded tokens/i, evidence: "token expansion evidence was detected." },
    { signal: "dtcg", pattern: /DTCG|usesDtcg|\$value|\$type/i, evidence: "DTCG token compatibility evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} transform evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

function designTokenUsageSignals(
  sourceFiles: DesignTokenSourceFile[],
  storybookReport: StorybookReport
): DesignTokensReport["usageSignals"] {
  const specs: Array<{ signal: DesignTokensReport["usageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "css-variables", pattern: /var\(--|css\/variables|--[a-z0-9-]+:/i, evidence: "CSS variable token consumption is referenced." },
    { signal: "theme-provider", pattern: /ThemeProvider|theme provider|createTheme|ConfigProvider/i, evidence: "theme provider token consumption is referenced." },
    { signal: "tailwind-config", pattern: /tailwind\.config|theme\s*:|colors\s*:|spacing\s*:/i, evidence: "Tailwind theme token consumption is referenced." },
    { signal: "component-style", pattern: /styled\.|className|style=|\.module\.css|emotion|styled-components/i, evidence: "component style consumption evidence was detected." },
    { signal: "storybook", pattern: /storybook|\.stories\.|autodocs/i, evidence: "Storybook documentation or preview consumption is referenced." },
    { signal: "docs", pattern: /style documentation|design token docs|mdx|docs/i, evidence: "token documentation consumption is referenced." },
    { signal: "package-script", pattern: /style-dictionary build|build:tokens|tokens:build/i, evidence: "package script invokes token build." },
    { signal: "build-output", pattern: /build\/|dist\/|generated|do not edit/i, evidence: "generated token output path is referenced." }
  ];
  const hasStorybook = storybookReport.storyFiles.length > 0 || storybookReport.configFiles.length > 0;
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : hasStorybook && ["storybook", "docs", "component-style"].includes(spec.signal) ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} usage evidence was not detected.`,
      relatedHref: match?.sourceHref ?? (hasStorybook ? "html/storybook.html" : "html/design-tokens.html")
    };
  });
}

function designTokenGovernanceSignals(sourceFiles: DesignTokenSourceFile[]): DesignTokensReport["governanceSignals"] {
  const specs: Array<{ signal: DesignTokensReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cti-structure", pattern: /category\/type\/item|attribute\/cti|cti|color[\\s\\S]{0,80}background|size[\\s\\S]{0,80}font/i, evidence: "CTI naming/category structure evidence was detected." },
    { signal: "aliases", pattern: /\{[a-z0-9_.-]+\}|alias|references?/i, evidence: "alias/reference governance evidence was detected." },
    { signal: "comments", pattern: /comment\s*:|description\s*:|\$description/i, evidence: "token comments or descriptions are present." },
    { signal: "themes", pattern: /theme|themes|dark|light|mode/i, evidence: "theme/mode token evidence was detected." },
    { signal: "multi-brand", pattern: /multi-brand|brand|brands/i, evidence: "multi-brand token evidence was detected." },
    { signal: "deprecation", pattern: /deprecated|deprecation/i, evidence: "token deprecation evidence was detected." },
    { signal: "npm-module", pattern: /npm module|publishConfig|package\.json|npm publish/i, evidence: "token package publish evidence was detected." },
    { signal: "ci-build", pattern: /\.github\/workflows|style-dictionary build|build:tokens|tokens:build/i, evidence: "CI or scripted token build evidence was detected." },
    { signal: "s3-publish", pattern: /s3|aws/i, evidence: "remote token artifact publish evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} governance evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/design-tokens.html"
    };
  });
}

export async function buildI18nReport(walk: WalkResult): Promise<I18nReport> {
  const sourceFiles = await i18nSourceFiles(walk);
  const messageSources = i18nMessageSources(sourceFiles);
  const localeAssets = i18nLocaleAssets(sourceFiles);
  const runtimeSignals = i18nRuntimeSignals(sourceFiles);
  const extractionSignals = i18nExtractionSignals(sourceFiles);
  const icuSignals = i18nIcuSignals(sourceFiles);
  const qaSignals = i18nQaSignals(sourceFiles);
  const hasMessageSource = messageSources.some((item) => item.readiness === "ready");
  const hasLocaleAsset = localeAssets.some((item) => item.readiness === "ready");
  const hasRuntime = runtimeSignals.some((item) => ["IntlProvider", "next-intl-provider", "server-translations", "i18next-init", "lingui-provider", "locale-prop", "messages-prop"].includes(item.signal) && item.readiness === "ready");
  const hasExtraction = extractionSignals.some((item) => ["formatjs-extract", "formatjs-compile", "lingui-extract", "lingui-compile", "lingui-config", "next-intl-plugin"].includes(item.signal) && item.readiness === "ready");
  const hasVerification = extractionSignals.some((item) => item.signal === "formatjs-verify" && item.readiness === "ready")
    || qaSignals.some((item) => ["missing-keys", "structural-equality", "no-invalid-icu", "catalog-compile", "selector-types", "namespace-types"].includes(item.signal) && item.readiness === "ready");
  const hasTranslatorContext = icuSignals.some((item) => item.signal === "description" && item.readiness === "ready")
    || qaSignals.some((item) => item.signal === "enforce-description" && item.readiness === "ready");

  const riskQueue: I18nReport["riskQueue"] = [];
  if (!hasMessageSource) {
    riskQueue.push({
      priority: "high",
      action: "Declare translatable strings with defineMessages, FormattedMessage, or intl.formatMessage before claiming i18n coverage.",
      why: "FormatJS extraction can only find messages that are declared through supported message descriptor patterns.",
      relatedHref: "html/i18n.html"
    });
  }
  if (hasMessageSource && !hasLocaleAsset) {
    riskQueue.push({
      priority: "high",
      action: "Add source and target locale catalogs such as lang/en.json and lang/fr.json.",
      why: "Runtime locale switching and translation review need committed message catalogs.",
      relatedHref: "html/i18n.html"
    });
  }
  if (hasMessageSource && !hasRuntime) {
    riskQueue.push({
      priority: "medium",
      action: "Wire locale and messages into IntlProvider or an equivalent runtime boundary.",
      why: "Extracted messages do not affect the UI until the app passes locale and messages into runtime formatting.",
      relatedHref: "html/i18n.html"
    });
  }
  if (hasMessageSource && !hasExtraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add formatjs extract and compile scripts for repeatable catalog generation.",
      why: "Manual catalogs drift quickly without a deterministic extraction and compilation step.",
      relatedHref: "html/i18n.html"
    });
  }
  if (hasLocaleAsset && !hasVerification) {
    riskQueue.push({
      priority: "medium",
      action: "Add formatjs verify or eslint-plugin-formatjs checks for missing keys, structural equality, and invalid ICU.",
      why: "Locale files can compile but still miss placeholders, plural arms, or obsolete keys.",
      relatedHref: "html/i18n.html"
    });
  }
  if (hasMessageSource && !hasTranslatorContext) {
    riskQueue.push({
      priority: "low",
      action: "Require message descriptions for translator context.",
      why: "FormatJS descriptions and linter rules reduce ambiguity before strings enter a TMS.",
      relatedHref: "html/i18n.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run FormatJS extract, compile, and verify in the original repository before treating this report as localization readiness.",
    why: "RepoTutor only performs static readiness analysis and does not parse or validate ICU catalogs.",
    relatedHref: "html/i18n.html"
  });

  return {
    summary: `i18n readiness report: message source ${messageSources.length}개, locale asset ${localeAssets.length}개, runtime signal ${runtimeSignals.length}개, extraction signal ${extractionSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "I18n readiness FormatJS React Intl next-intl useTranslations getTranslations NextIntlClientProvider createMiddleware defineRouting localePrefix pathnames requestLocale i18next init useTranslation I18nextProvider resources fallbackLng backend loadPath language detector saveMissing keyPrefix Lingui Trans useLingui I18nProvider lingui extract compile config vite plugin ESLint ICU messages extract compile verify IntlProvider polyfills locale data PO catalogs TMS",
    messageSources,
    localeAssets,
    runtimeSignals,
    extractionSignals,
    icuSignals,
    qaSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"react-intl|next-intl|i18next|react-i18next|@lingui\" package.json src app messages locales lingui.config.*", purpose: "Find the i18n ecosystem, runtime boundaries, catalogs, and scripts used by this repository." },
      { command: "formatjs extract \"src/**/*.{ts,tsx}\" --out-file lang/en.json --extract-source-location", purpose: "Extract FormatJS default messages and source locations into a source-locale catalog." },
      { command: "lingui extract && lingui compile", purpose: "Extract and compile Lingui catalogs when Lingui is the chosen ecosystem." },
      { command: "formatjs verify \"lang/*.json\" --source-locale en --missing-keys --structural-equality --extra-keys", purpose: "Check target locale catalogs against the source locale." },
      { command: "rg \"createMiddleware|defineRouting|localePrefix|pathnames|fallbackLng|defaultNS|resources|loadPath|saveMissing|catalogs|sourceLocale|fallbackLocales\" .", purpose: "Trace routing, fallback, namespace, backend, missing-key, and catalog topology." },
      { command: "npx eslint . --rule 'formatjs/no-invalid-icu:error'", purpose: "Run message-level ICU linting where i18n ESLint rules are configured." }
    ],
    learnerNextSteps: [
      "먼저 translatable message declaration과 runtime provider/server translation 경계를 구분해서 확인하세요.",
      "next-intl은 routing/middleware/pathnames/requestLocale, i18next는 resources/defaultNS/fallbackLng/backend/loadPath, Lingui는 catalogs/sourceLocale/compile 흐름을 따로 보세요.",
      "source locale catalog와 target locale catalog가 같은 key/placeholder/plural/context 구조를 유지하는지 확인하세요.",
      "plural, select, selectordinal, rich text placeholder, i18next context suffix, Lingui PO catalog는 번역자가 깨뜨리기 쉬운 부분입니다.",
      "이 리포트는 i18n toolchain 실행 결과가 아닙니다. 실제 locale readiness는 원본 repo에서 extract/compile/verify/typecheck로 확인하세요."
    ]
  };
}

type I18nSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function i18nSourceFiles(walk: WalkResult): Promise<I18nSourceFile[]> {
  const files: I18nSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !i18nInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!i18nPathSignal(file.relPath) && !i18nContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 180) break;
  }
  return files;
}

function i18nInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|tsconfig\.json|vite\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s|middleware\.[cm]?[jt]s|proxy\.[cm]?[jt]s|lingui\.config\.[cm]?[jt]s|eslint\.config\.[cm]?[jt]s|\.eslintrc(\.json|\.js|\.cjs|\.yml|\.yaml)?)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(i18n|intl|locale|locales|lang|messages|translations|formatjs|lingui)\//i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md|mdx|vue|svelte|po|pot)$/i.test(filePath);
}

function i18nPathSignal(filePath: string): boolean {
  return /(i18n|intl|locale|locales|lang|messages|translations|formatjs|react-intl|next-intl|i18next|lingui|polyfill|\.messages\.|\.locale\.|\.po$|\.pot$)/i.test(filePath);
}

function i18nContentSignal(text: string): boolean {
  return /(react-intl|@formatjs|formatjs\s+(extract|compile|verify)|IntlProvider|FormattedMessage|defineMessages|defineMessage|intl\.formatMessage|formatMessage\s*\(\s*\{|next-intl|NextIntlClientProvider|useTranslations|getTranslations|createMiddleware|defineRouting|requestLocale|i18next|react-i18next|useTranslation|I18nextProvider|fallbackLng|defaultNS|loadPath|saveMissing|LanguageDetector|@lingui|LinguiProvider|I18nProvider|useLingui|lingui\s+(extract|compile)|lingui\.config|IntlMessageFormat|eslint-plugin-formatjs|formatjs\/|defaultMessage|source-locale|missing-keys|structural-equality|Intl\.PluralRules|Intl\.DateTimeFormat|Intl\.NumberFormat|navigator\.language|locale\s*:|messages\s*:)/i.test(text);
}

function i18nMessageSources(sourceFiles: I18nSourceFile[]): I18nReport["messageSources"] {
  const rows: I18nReport["messageSources"] = [];
  for (const source of sourceFiles) {
    const mechanisms = i18nMessageMechanisms(source.filePath, source.text);
    for (const mechanism of mechanisms) {
      rows.push({
        filePath: source.filePath,
        mechanism,
        readiness: mechanism === "unknown" ? "partial" : "ready",
        evidence: i18nMessageEvidence(source.filePath, mechanism),
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 120);
}

function i18nMessageMechanisms(filePath: string, text: string): I18nReport["messageSources"][number]["mechanism"][] {
  const mechanisms: I18nReport["messageSources"][number]["mechanism"][] = [];
  if (/defineMessages\s*\(/.test(text)) mechanisms.push("defineMessages");
  if (/defineMessage\s*\(/.test(text)) mechanisms.push("defineMessage");
  if (/<FormattedMessage\b/.test(text)) mechanisms.push("FormattedMessage");
  if (/\bintl\.formatMessage\s*\(|\bformatMessage\s*\(\s*\{/.test(text)) mechanisms.push("formatMessage");
  if (/<IntlProvider\b|IntlProvider\s*\(/.test(text)) mechanisms.push("IntlProvider");
  if (/\buseTranslations\s*\(/.test(text)) mechanisms.push("next-intl-useTranslations");
  if (/\bgetTranslations\s*\(/.test(text)) mechanisms.push("next-intl-getTranslations");
  if (/<NextIntlClientProvider\b|NextIntlClientProvider\s*\(/.test(text)) mechanisms.push("next-intl-provider");
  if (/\bi18next\.t\s*\(|\bi18n\.t\s*\(|\bt\s*\(\s*["'`][\w.:-]+/.test(text) && /i18next|react-i18next/.test(text)) mechanisms.push("i18next-t");
  if (/\bresources\s*:|CustomTypeOptions\[['"]resources['"]\]|TypeOptions\[['"]resources['"]\]/.test(text) && /i18next|defaultNS|fallbackLng/.test(text)) mechanisms.push("i18next-resources");
  if (/\buseTranslation\s*\(|<I18nextProvider\b|initReactI18next/.test(text)) mechanisms.push("react-i18next-useTranslation");
  if (/<Trans\b/.test(text) && /@lingui/.test(text)) mechanisms.push("lingui-trans");
  if (/@lingui\/(?:core|react|macro)[\w/-]*|@lingui\/core\/macro|@lingui\/react\/macro/.test(text) && /\b(t|msg|plural|defineMessage|defineMessages)\s*\(/.test(text)) mechanisms.push("lingui-macro");
  if (/<I18nProvider\b|<LinguiProvider\b|\bI18nProvider\s*\(/.test(text) && /@lingui/.test(text)) mechanisms.push("lingui-provider");
  if (i18nLooksLikeLocaleAsset(filePath, text)) mechanisms.push(i18nLocaleAssetLooksExtracted(text) ? "message-catalog" : "locale-json");
  return [...new Set(mechanisms)];
}

function i18nMessageEvidence(filePath: string, mechanism: I18nReport["messageSources"][number]["mechanism"]): string {
  if (mechanism === "defineMessages") return `${filePath} declares grouped React Intl message descriptors.`;
  if (mechanism === "defineMessage") return `${filePath} declares a single React Intl message descriptor.`;
  if (mechanism === "FormattedMessage") return `${filePath} renders a FormattedMessage component.`;
  if (mechanism === "formatMessage") return `${filePath} calls an imperative formatMessage API.`;
  if (mechanism === "IntlProvider") return `${filePath} contains a runtime IntlProvider boundary.`;
  if (mechanism === "next-intl-useTranslations") return `${filePath} calls next-intl useTranslations.`;
  if (mechanism === "next-intl-getTranslations") return `${filePath} calls next-intl server getTranslations.`;
  if (mechanism === "next-intl-provider") return `${filePath} contains a NextIntlClientProvider boundary.`;
  if (mechanism === "i18next-t") return `${filePath} calls an i18next translation function.`;
  if (mechanism === "i18next-resources") return `${filePath} declares i18next resources or typed resource options.`;
  if (mechanism === "react-i18next-useTranslation") return `${filePath} uses react-i18next runtime hooks or provider.`;
  if (mechanism === "lingui-trans") return `${filePath} renders Lingui Trans message components.`;
  if (mechanism === "lingui-macro") return `${filePath} uses Lingui compile-time message macros.`;
  if (mechanism === "lingui-provider") return `${filePath} contains a Lingui provider boundary.`;
  if (mechanism === "message-catalog") return `${filePath} contains extracted message descriptors.`;
  if (mechanism === "locale-json") return `${filePath} contains locale JSON message values.`;
  return `${filePath} contains i18n-shaped message evidence.`;
}

function i18nLocaleAssets(sourceFiles: I18nSourceFile[]): I18nReport["localeAssets"] {
  const rows: I18nReport["localeAssets"] = [];
  for (const source of sourceFiles) {
    if (!i18nLooksLikeLocaleAsset(source.filePath, source.text)) continue;
    const locale = i18nLocaleFromPath(source.filePath) ?? i18nLocaleFromContent(source.text);
    const assetType = i18nLocaleAssetType(source.filePath, source.text, locale);
    rows.push({
      filePath: source.filePath,
      locale,
      assetType,
      readiness: assetType === "unknown" ? "partial" : "ready",
      evidence: i18nLocaleAssetEvidence(source.filePath, assetType, locale),
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 120);
}

function i18nLooksLikeLocaleAsset(filePath: string, text: string): boolean {
  return /\.(json|ya?ml|ts|js|mjs|cjs|po|pot)$/i.test(filePath)
    && (/(^|\/)(lang|locales?|i18n|messages|translations)\//i.test(filePath)
      || /\b(defaultMessage|description|messages\s*:|locale\s*:|translations|compiled|IntlMessageFormat|react-intl|resources\s*:|fallbackLng|defaultNS|defineRouting|localePrefix|pathnames|catalogs\s*:|sourceLocale|msgid|msgstr)\b/i.test(text)
      || /["'][a-z]{2}(?:[-_][A-Z]{2})?["']\s*:/i.test(text));
}

function i18nLocaleAssetLooksExtracted(text: string): boolean {
  return /\bdefaultMessage\b|\bdescription\b|\bmessageDescriptors?\b|\bmessage\s*:|\borigins\s*:|\bsourceLocale\b/i.test(text);
}

function i18nLocaleFromPath(filePath: string): string | null {
  const match = filePath.match(/(?:^|\/)([a-z]{2,3}(?:[-_][A-Z0-9]{2,4})?)\.(?:json|ya?ml|ts|js|mjs|cjs|po|pot)$/)
    ?? filePath.match(/(?:^|\/)(?:lang|locales?|i18n|messages|translations)\/([a-z]{2,3}(?:[-_][A-Z0-9]{2,4})?)(?:\/|\.|$)/i);
  return match ? match[1].replace("_", "-") : null;
}

function i18nLocaleFromContent(text: string): string | null {
  const match = text.match(/\blocale\s*[:=]\s*["']([a-z]{2,3}(?:[-_][A-Z0-9]{2,4})?)["']/i);
  return match ? match[1].replace("_", "-") : null;
}

function i18nLocaleAssetType(filePath: string, text: string, locale: string | null): I18nReport["localeAssets"][number]["assetType"] {
  if (/\.(po|pot)$/i.test(filePath) || /\bmsgid\b[\s\S]{0,160}\bmsgstr\b/i.test(text)) return "po-catalog";
  if (/defineRouting|localePrefix|pathnames|createMiddleware|locales\s*:|defaultLocale/i.test(text)) return "route-locale-config";
  if (/resources\s*:|defaultNS|fallbackLng|nsSeparator|keySeparator|CustomTypeOptions|TypeOptions\[['"]resources['"]\]/i.test(text)) return "namespaced-resources";
  if (/compiled|dist|build|\.compiled\./i.test(filePath) || /"ast"\s*:|\[\s*\{\s*"type"/i.test(text)) return "compiled-messages";
  if (i18nLocaleAssetLooksExtracted(text)) return "extracted-messages";
  if (/locale-data|polyfill|@formatjs\/intl-|Intl\.(PluralRules|NumberFormat|DateTimeFormat)/i.test(text)) return "runtime-locale-data";
  if (locale && /^en(?:-|$)/i.test(locale)) return "source-locale";
  if (locale) return "target-locale";
  return "unknown";
}

function i18nLocaleAssetEvidence(filePath: string, assetType: I18nReport["localeAssets"][number]["assetType"], locale: string | null): string {
  const suffix = locale ? ` for ${locale}` : "";
  if (assetType === "source-locale") return `${filePath} looks like a source locale catalog${suffix}.`;
  if (assetType === "target-locale") return `${filePath} looks like a target locale catalog${suffix}.`;
  if (assetType === "compiled-messages") return `${filePath} contains compiled or build-output message evidence${suffix}.`;
  if (assetType === "extracted-messages") return `${filePath} contains extracted defaultMessage/description descriptors${suffix}.`;
  if (assetType === "runtime-locale-data") return `${filePath} contains runtime locale data or polyfill evidence${suffix}.`;
  if (assetType === "po-catalog") return `${filePath} contains PO/POT catalog evidence${suffix}.`;
  if (assetType === "namespaced-resources") return `${filePath} contains namespaced i18next-style resource evidence${suffix}.`;
  if (assetType === "route-locale-config") return `${filePath} contains localized routing config evidence${suffix}.`;
  return `${filePath} is an i18n locale asset candidate${suffix}.`;
}

function i18nRuntimeSignals(sourceFiles: I18nSourceFile[]): I18nReport["runtimeSignals"] {
  const specs: Array<{ signal: I18nReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "IntlProvider", pattern: /<IntlProvider\b|IntlProvider\s*\(/i, evidence: "React Intl provider boundary is configured." },
    { signal: "next-intl-provider", pattern: /<NextIntlClientProvider\b|NextIntlClientProvider\s*\(/i, evidence: "next-intl client provider boundary is configured." },
    { signal: "server-translations", pattern: /\bgetTranslations\s*\(|\bgetMessages\s*\(|\bgetLocale\s*\(|next-intl\/server/i, evidence: "server-side next-intl translation evidence was detected." },
    { signal: "request-locale", pattern: /requestLocale|setRequestLocale|hasLocale\s*\(/i, evidence: "request locale validation or static rendering evidence was detected." },
    { signal: "localized-routing", pattern: /defineRouting|pathnames\s*:|localePrefix|createNavigation/i, evidence: "localized routing configuration evidence was detected." },
    { signal: "middleware-locale", pattern: /createMiddleware|next-intl\/middleware|middleware\.[cm]?[jt]s|proxy\.[cm]?[jt]s/i, evidence: "locale middleware evidence was detected." },
    { signal: "locale-prop", pattern: /\blocale\s*=\s*\{|locale\s*:|currentLocale|activeLocale/i, evidence: "runtime locale value is passed or configured." },
    { signal: "messages-prop", pattern: /\bmessages\s*=\s*\{|messages\s*:|translationsFor|loadMessages/i, evidence: "runtime message catalog is passed or loaded." },
    { signal: "navigator-language", pattern: /navigator\.language|navigator\.languages|Accept-Language/i, evidence: "browser or request language negotiation is referenced." },
    { signal: "fallback-locale", pattern: /defaultLocale|fallbackLocale|fallbackLng|source-locale|en-US|en_/i, evidence: "fallback/source locale evidence was detected." },
    { signal: "i18next-init", pattern: /\bi18next\.init\s*\(|\.use\s*\(\s*initReactI18next|createInstance\s*\(/i, evidence: "i18next initialization evidence was detected." },
    { signal: "language-detector", pattern: /LanguageDetector|i18next-browser-languagedetector|navigator\.languages|Accept-Language/i, evidence: "language detector evidence was detected." },
    { signal: "backend-loader", pattern: /i18next-http-backend|BackendConnector|loadPath|partialBundledLanguages|loadNamespace|reloadResources/i, evidence: "i18next backend or namespace loading evidence was detected." },
    { signal: "change-language", pattern: /changeLanguage\s*\(|getFixedT\s*\(|keyPrefix/i, evidence: "language switch or fixed translator evidence was detected." },
    { signal: "lingui-provider", pattern: /<I18nProvider\b|<LinguiProvider\b|I18nProvider\s*\(|@lingui\/react/i, evidence: "Lingui provider evidence was detected." },
    { signal: "load-activate", pattern: /loadAndActivate|i18n\.load\s*\(|i18n\.activate\s*\(|setupI18n\s*\(/i, evidence: "Lingui catalog loading and activation evidence was detected." },
    { signal: "polyfill", pattern: /@formatjs\/intl-|polyfill|polyfill-fastly|Intl\.(PluralRules|NumberFormat|DateTimeFormat|RelativeTimeFormat|DisplayNames|ListFormat)/i, evidence: "Intl polyfill evidence was detected." },
    { signal: "locale-data", pattern: /locale-data|addLocaleData|__addLocaleData|CLDR|full-icu/i, evidence: "locale data loading evidence was detected." },
    { signal: "resolved-options", pattern: /resolvedOptions\s*\(/i, evidence: "Intl resolvedOptions locale check evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} runtime evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/i18n.html"
    };
  });
}

function i18nExtractionSignals(sourceFiles: I18nSourceFile[]): I18nReport["extractionSignals"] {
  const specs: Array<{ signal: I18nReport["extractionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "formatjs-extract", pattern: /formatjs\s+extract|@formatjs\/cli|extract\s+["'][^"']*formatjs/i, evidence: "FormatJS extract command or package is configured." },
    { signal: "formatjs-compile", pattern: /formatjs\s+compile\b|formatjs\s+compile-folder|compile\s+["'][^"']*formatjs/i, evidence: "FormatJS compile command is configured." },
    { signal: "formatjs-verify", pattern: /formatjs\s+verify|--missing-keys|--structural-equality|--extra-keys/i, evidence: "FormatJS verify command or flags are configured." },
    { signal: "compile-folder", pattern: /compile-folder/i, evidence: "Folder compilation is referenced." },
    { signal: "lingui-extract", pattern: /lingui\s+extract|@lingui\/cli/i, evidence: "Lingui extract command or CLI package is configured." },
    { signal: "lingui-compile", pattern: /lingui\s+compile|compileNamespace|@lingui\/loader/i, evidence: "Lingui compile command or compile namespace is configured." },
    { signal: "lingui-config", pattern: /lingui\.config\.[cm]?[jt]s|sourceLocale|fallbackLocales|catalogs\s*:|@lingui\/conf/i, evidence: "Lingui config evidence was detected." },
    { signal: "lingui-vite-plugin", pattern: /@lingui\/vite-plugin|\blingui\s*\(/i, evidence: "Lingui Vite plugin evidence was detected." },
    { signal: "lingui-clean", pattern: /lingui\s+extract\s+--clean|--clean/i, evidence: "Lingui obsolete-message cleanup evidence was detected." },
    { signal: "next-intl-plugin", pattern: /next-intl\/plugin|createNextIntlPlugin|withNextIntl/i, evidence: "next-intl Next.js plugin evidence was detected." },
    { signal: "swc-plugin-extractor", pattern: /swc-plugin-extractor|@lingui\/swc-plugin|@lingui\/babel-plugin|babel-plugin-lingui-macro/i, evidence: "compile-time i18n extractor plugin evidence was detected." },
    { signal: "id-interpolation", pattern: /id-interpolation-pattern|contenthash|sha512/i, evidence: "automatic message ID interpolation is configured." },
    { signal: "extract-source-location", pattern: /extract-source-location/i, evidence: "source location metadata extraction is configured." },
    { signal: "additional-names", pattern: /additional-(component|function)-names|additionalComponentNames|additionalFunctionNames/i, evidence: "wrapper component/function extraction is configured." },
    { signal: "ignore-globs", pattern: /--ignore|ignore\s*:/i, evidence: "extraction ignore globs are configured." },
    { signal: "flatten", pattern: /--flatten|\bflatten\s*:/i, evidence: "selector flattening is configured for translator-friendly sentences." },
    { signal: "pseudo-locale", pattern: /pseudo-locale|en-XA|en-XB|xx-LS|xx-AC|xx-HA/i, evidence: "pseudo-locale compilation evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} extraction evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/i18n.html"
    };
  });
}

function i18nIcuSignals(sourceFiles: I18nSourceFile[]): I18nReport["icuSignals"] {
  const specs: Array<{ signal: I18nReport["icuSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "plural", pattern: /\{\s*[A-Za-z0-9_]+\s*,\s*plural\b/i, evidence: "ICU plural message evidence was detected." },
    { signal: "select", pattern: /\{\s*[A-Za-z0-9_]+\s*,\s*select\b/i, evidence: "ICU select message evidence was detected." },
    { signal: "selectordinal", pattern: /selectordinal/i, evidence: "ICU selectordinal message evidence was detected." },
    { signal: "number", pattern: /\{\s*[A-Za-z0-9_]+\s*,\s*number\b|Intl\.NumberFormat/i, evidence: "number formatting evidence was detected." },
    { signal: "date", pattern: /\{\s*[A-Za-z0-9_]+\s*,\s*date\b|Intl\.DateTimeFormat/i, evidence: "date formatting evidence was detected." },
    { signal: "time", pattern: /\{\s*[A-Za-z0-9_]+\s*,\s*time\b|FormattedTime/i, evidence: "time formatting evidence was detected." },
    { signal: "rich-text", pattern: /<FormattedMessage[\s\S]{0,500}values\s*=|<\w+>[^<{}]*\{|\brich text\b|ignoreTag/i, evidence: "rich text placeholder evidence was detected." },
    { signal: "description", pattern: /["']?description["']?\s*:/i, evidence: "translator description evidence was detected." },
    { signal: "placeholder", pattern: /\{[A-Za-z0-9_]+\}/i, evidence: "ICU placeholder evidence was detected." },
    { signal: "ast", pattern: /--ast|\bAST\b|pre-parsed|parse\(/i, evidence: "compiled AST or parser evidence was detected." },
    { signal: "i18next-plural-suffix", pattern: /pluralSeparator|_one|_other|_zero|saveMissingPlurals|count\s*:/i, evidence: "i18next plural suffix evidence was detected." },
    { signal: "i18next-context", pattern: /contextSeparator|context\s*:|_[a-z]+_(one|other)|context \+ plural/i, evidence: "i18next context evidence was detected." },
    { signal: "lingui-plural", pattern: /<Plural\b|\bplural\s*\(|@lingui\/core\/macro/i, evidence: "Lingui plural macro evidence was detected." },
    { signal: "message-id", pattern: /generateMessageId|id\s*:|msgid|custom\.id|messageId/i, evidence: "explicit or generated message ID evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} ICU evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/i18n.html"
    };
  });
}

function i18nQaSignals(sourceFiles: I18nSourceFile[]): I18nReport["qaSignals"] {
  const specs: Array<{ signal: I18nReport["qaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "eslint-plugin-formatjs", pattern: /eslint-plugin-formatjs|formatjs\/[a-z-]+|formatjs\.configs\.(recommended|strict)/i, evidence: "eslint-plugin-formatjs is configured or referenced." },
    { signal: "enforce-description", pattern: /formatjs\/enforce-description|enforce-description/i, evidence: "description enforcement is configured." },
    { signal: "enforce-id", pattern: /formatjs\/enforce-id|enforce-id/i, evidence: "message ID enforcement is configured." },
    { signal: "no-invalid-icu", pattern: /formatjs\/no-invalid-icu|no-invalid-icu/i, evidence: "invalid ICU linting is configured." },
    { signal: "missing-keys", pattern: /--missing-keys|missing keys/i, evidence: "missing translation key verification is configured." },
    { signal: "structural-equality", pattern: /--structural-equality|structural equality/i, evidence: "source/target structural equality verification is configured." },
    { signal: "extra-keys", pattern: /--extra-keys|extra keys/i, evidence: "obsolete/extra translation key verification is configured." },
    { signal: "lingui-eslint", pattern: /@lingui\/eslint-plugin|eslint-plugin-lingui|lingui\/[a-z-]+/i, evidence: "Lingui ESLint evidence was detected." },
    { signal: "catalog-compile", pattern: /lingui\s+compile|formatjs\s+compile|compile catalogs|compiled catalog/i, evidence: "catalog compilation validation evidence was detected." },
    { signal: "selector-types", pattern: /enableSelector|keyFromSelector|selector function|strictKeyChecks|TypeOptions\[['"]resources['"]\]|CustomTypeOptions[\s\S]{0,240}\bresources\s*:/i, evidence: "typed translation selector evidence was detected." },
    { signal: "save-missing", pattern: /saveMissing|missingKeyHandler|saveMissingPlurals|missing key/i, evidence: "missing-key capture evidence was detected." },
    { signal: "namespace-types", pattern: /defaultNS|fallbackNS|CustomTypeOptions|namespace|keyPrefix/i, evidence: "namespace typing or key-prefix evidence was detected." },
    { signal: "pseudo-locale", pattern: /pseudoLocale|pseudo-locale|en-XA|en-XB|xx-LS|pseudo-LOCALE/i, evidence: "pseudo-locale evidence was detected." },
    { signal: "route-localization", pattern: /localized pathnames|pathnames\s*:|localePrefix|alternate links|hreflang/i, evidence: "localized routing QA evidence was detected." },
    { signal: "tms-format", pattern: /transifex|smartling|lokalise|crowdin|TMS|translation vendor/i, evidence: "translation management system formatter evidence was detected." },
    { signal: "ci-workflow", pattern: /^\.github\/workflows\//i, evidence: "CI workflow can host i18n extraction or verification." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} QA evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/i18n.html"
    };
  });
}
