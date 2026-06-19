import path from "node:path";
import type { AvatarReadinessReport, ScrollAreaReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildScrollAreaReadinessReport(walk: WalkResult): Promise<ScrollAreaReadinessReport> {
  const sourceFiles = await scrollAreaReadinessSourceFiles(walk);
  const scrollAreaSetups = scrollAreaReadinessSetups(sourceFiles);
  const frameworkSignals = scrollAreaReadinessFrameworkSignals(sourceFiles);
  const structureSignals = scrollAreaReadinessStructureSignals(sourceFiles);
  const stateSignals = scrollAreaReadinessStateSignals(sourceFiles);
  const measurementSignals = scrollAreaReadinessMeasurementSignals(sourceFiles);
  const orientationSignals = scrollAreaReadinessOrientationSignals(sourceFiles);
  const interactionSignals = scrollAreaReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = scrollAreaReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = scrollAreaReadinessMachineSignals(sourceFiles);
  const contextSignals = scrollAreaReadinessContextSignals(sourceFiles);
  const refSignals = scrollAreaReadinessRefSignals(sourceFiles);
  const effectSignals = scrollAreaReadinessEffectSignals(sourceFiles);
  const actionSignals = scrollAreaReadinessActionSignals(sourceFiles);
  const domSignals = scrollAreaReadinessDomSignals(sourceFiles);
  const utilitySignals = scrollAreaReadinessUtilitySignals(sourceFiles);
  const apiSignals = scrollAreaReadinessApiSignals(sourceFiles);
  const testSignals = scrollAreaReadinessTestSignals(sourceFiles);
  const packageSignals = scrollAreaReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || scrollAreaSetups.some((item) => item.viewportCount + item.scrollbarCount + item.thumbCount > 0);
  const hasOverflow = stateSignals.some((item) => item.signal === "overflow-x" && item.readiness === "ready") || stateSignals.some((item) => item.signal === "overflow-y" && item.readiness === "ready") || scrollAreaSetups.some((item) => item.overflowCount > 0);
  const hasMeasurement = measurementSignals.some((item) => item.readiness === "ready") || scrollAreaSetups.some((item) => item.measurementCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || scrollAreaSetups.some((item) => item.interactionCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || scrollAreaSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || scrollAreaSetups.some((item) => item.testCount > 0);

  const riskQueue: ScrollAreaReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document scroll area, viewport, content, scrollbar, thumb, or corner boundaries before claiming scroll area readiness.",
      why: "Scroll area readiness starts with concrete root, viewport, content, scrollbar, thumb, and corner evidence learners can trace.",
      relatedHref: "html/scroll-area-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasOverflow) {
    riskQueue.push({
      priority: "high",
      action: "Trace overflow-x, overflow-y, data-overflow, visible/hidden scrollbar state, and scroll progress state.",
      why: "Scroll areas fail when visual scrollbars, overflow state, and actual scrollable content dimensions disagree.",
      relatedHref: "html/scroll-area-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasOverflow) && !hasMeasurement) {
    riskQueue.push({
      priority: "medium",
      action: "Document viewport/content measurement paths such as ResizeObserver, scrollHeight, scrollWidth, clientHeight, clientWidth, thumb size, thumb offset, corner size, and ratios.",
      why: "Custom scrollbars depend on measured content and viewport geometry; static component names alone do not prove sizing readiness.",
      relatedHref: "html/scroll-area-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasOverflow) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add tests or code evidence for scroll events, wheel handling, pointer/drag thumb behavior, scrollTo, and scrollToEdge controls.",
      why: "Scroll area usability depends on viewport scrolling, thumb dragging, wheel behavior, and imperative scroll controls staying synchronized.",
      relatedHref: "html/scroll-area-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasOverflow) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify presentation roles, tabIndex, labels, data-overflow, and owned-by relationships for custom scroll controls.",
      why: "Scroll containers and custom scrollbars should expose stable focusability, labels, and non-conflicting presentation semantics.",
      relatedHref: "html/scroll-area-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasOverflow) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add viewport, overflow, orientation, scroll event, wheel, pointer/drag, and attribute tests for scroll areas.",
      why: "Static scroll-area evidence does not prove viewport dimensions, scroll offset updates, wheel behavior, or thumb synchronization.",
      relatedHref: "html/scroll-area-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual scroll area behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records scroll area readiness only; it does not scroll viewports, drag thumbs, dispatch wheel or pointer events, mutate scroll positions, measure live layout, or run analyzed project tests.",
    relatedHref: "html/scroll-area-readiness.html"
  });

  return {
    summary: `Scroll area readiness report: setup ${scrollAreaSetups.length}개, framework signal ${frameworkSignals.length}개, measurement signal ${measurementSignals.length}개, interaction signal ${interactionSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Scroll area readiness Radix ScrollArea Zag scroll-area viewport scrollbar thumb corner overflow scrollTop scrollLeft ResizeObserver pointer wheel tests",
    scrollAreaSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    measurementSignals,
    orientationSignals,
    interactionSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    refSignals,
    effectSignals,
    actionSignals,
    domSignals,
    utilitySignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-scroll-area|ScrollArea\\.Root|ScrollArea\\.Viewport|ScrollArea\\.Scrollbar|ScrollArea\\.Thumb|ScrollArea\\.Corner\" package.json src app packages", purpose: "Find Radix ScrollArea root, viewport, scrollbar, thumb, and corner wiring." },
      { command: "rg \"@zag-js/scroll-area|scrollArea\\.machine|scrollArea\\.connect|getViewportProps|getScrollbarProps|getThumbProps|getCornerProps\" package.json src app packages", purpose: "Find Zag scroll-area machine, connect API, and anatomy prop boundaries." },
      { command: "rg \"overflowX|overflowY|data-overflow|scrollHeight|scrollWidth|clientHeight|clientWidth|ResizeObserver|thumbSize|thumbOffset|cornerSize|scrollProgress\" src app packages", purpose: "Check overflow state and viewport/content measurement evidence." },
      { command: "rg \"fireEvent\\.scroll|wheel|pointer|drag|scrollTo|scrollToEdge|data-orientation|role=.*presentation|tabIndex|scroll-area-traces\" test tests src app packages .github", purpose: "Check interaction, orientation, accessibility, and test artifact coverage." }
    ],
    learnerNextSteps: [
      "먼저 Radix ScrollArea, Zag scroll-area, native overflow, custom scrollbar 중 어떤 family를 쓰는지 확인하세요.",
      "root, viewport, content, scrollbar, thumb, corner 구조가 어떤 파일에 있고 vertical/horizontal orientation이 모두 필요한지 정리하세요.",
      "overflow-x/y, scrollHideDelay, forceMount, hidden scrollbar state, scroll progress, data-state가 실제 scrollable content와 일치하는지 확인하세요.",
      "ResizeObserver, scrollHeight/scrollWidth, clientHeight/clientWidth, thumb size/offset, corner size, ratio 계산 경로가 테스트 가능한지 확인하세요.",
      "wheel, pointer drag, scroll event, scrollTo, scrollToEdge, RTL direction, data-orientation 동작을 원본 프로젝트의 component/browser tests에서 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 viewport scroll, thumb drag, wheel dispatch, live measurement, scroll position mutation은 원본 프로젝트의 tests/browser QA에서 별도 확인하세요."
    ]
  };
}

type ScrollAreaReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function scrollAreaReadinessSourceFiles(walk: WalkResult): Promise<ScrollAreaReadinessSourceFile[]> {
  const files: ScrollAreaReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !scrollAreaReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!scrollAreaReadinessPathSignal(file.relPath) && !scrollAreaReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function scrollAreaReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return scrollAreaReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function scrollAreaReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(scroll-area|scroll_area|scrollarea|scrollbar|scrollbars|viewport|overflow|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function scrollAreaReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-scroll-area|@zag-js\/scroll-area|ScrollArea\.Root|ScrollArea\.Viewport|ScrollArea\.Scrollbar|ScrollArea\.Thumb|scrollArea\.machine|scrollArea\.connect|getViewportProps|getScrollbarProps|getThumbProps|overflowX|overflowY|scrollTop|scrollLeft)/i.test(text);
}

function scrollAreaReadinessSetups(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["scrollAreaSetups"] {
  const rows: ScrollAreaReadinessReport["scrollAreaSetups"] = [];
  for (const source of sourceFiles) {
    const scrollAreaCount = countMatches(source.text, /(ScrollArea\.Root|ScrollArea\b|scrollArea\.machine|scrollArea\.connect|@zag-js\/scroll-area|@radix-ui\/react-scroll-area|scroll-area|scroll area)/gi);
    const viewportCount = countMatches(source.text, /(ScrollArea\.Viewport|getViewportProps|viewport\b|Viewport\b|data-testid\s*=\s*["']scroll-viewport)/gi);
    const contentCount = countMatches(source.text, /(getContentProps|ScrollArea\.Content|content\b|Content\b|children|scrollable content|Large scrollable content)/gi);
    const scrollbarCount = countMatches(source.text, /(ScrollArea\.Scrollbar|getScrollbarProps|scrollbar\b|Scrollbar\b|data-orientation)/gi);
    const thumbCount = countMatches(source.text, /(ScrollArea\.Thumb|getThumbProps|thumb\b|Thumb\b|thumbSize|thumbOffset)/gi);
    const cornerCount = countMatches(source.text, /(ScrollArea\.Corner|getCornerProps|corner\b|Corner\b|cornerSize)/gi);
    const orientationCount = countMatches(source.text, /(orientation\s*=|data-orientation|vertical|horizontal|dir\s*=|rtl|ltr)/gi);
    const overflowCount = countMatches(source.text, /(overflowX|overflowY|overflow-x|overflow-y|data-overflow|hasOverflow|scrollbarVisible|scrollbarHidden|scrollbar[A-Z]Hidden)/gi);
    const measurementCount = countMatches(source.text, /(ResizeObserver|scrollHeight|scrollWidth|clientHeight|clientWidth|thumbSize|thumbOffset|cornerSize|ratio|scrollProgress|measure)/gi);
    const interactionCount = countMatches(source.text, /(pointer|wheel|drag|fireEvent\.scroll|onScroll|scrollTo|scrollToEdge|scrollTop|scrollLeft|userEvent\.pointer|deltaY)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']presentation|tabIndex|aria-label|aria-labelledby|aria-describedby|data-overflow|data-ownedby|getByRole|presentation\b)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.pointer|fireEvent\.scroll|fireEvent\.wheel|getByRole|toHaveAttribute|toHaveStyle|scroll-area-traces|upload-artifact)/gi);
    const total = scrollAreaCount + viewportCount + contentCount + scrollbarCount + thumbCount + cornerCount + orientationCount + overflowCount + measurementCount + interactionCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = (scrollAreaCount + viewportCount > 0) && scrollbarCount > 0 && thumbCount > 0 && overflowCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: scrollAreaReadinessFramework(source),
      scrollAreaCount,
      viewportCount,
      contentCount,
      scrollbarCount,
      thumbCount,
      cornerCount,
      orientationCount,
      overflowCount,
      measurementCount,
      interactionCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `scroll area ${scrollAreaCount}, viewport ${viewportCount}, content ${contentCount}, scrollbar ${scrollbarCount}, thumb ${thumbCount}, corner ${cornerCount}, orientation ${orientationCount}, overflow ${overflowCount}, measurement ${measurementCount}, interaction ${interactionCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.scrollAreaCount + b.viewportCount + b.scrollbarCount + b.thumbCount + b.overflowCount - (a.scrollAreaCount + a.viewportCount + a.scrollbarCount + a.thumbCount + a.overflowCount));
}

function scrollAreaReadinessFramework(source: ScrollAreaReadinessSourceFile): ScrollAreaReadinessReport["scrollAreaSetups"][number]["framework"] {
  if (/@radix-ui\/react-scroll-area|ScrollArea\.Root|ScrollArea\.Viewport|ScrollArea\.Scrollbar|ScrollArea\.Thumb/i.test(source.text)) return "radix-scroll-area";
  if (/@zag-js\/scroll-area|scrollArea\.machine|scrollArea\.connect|getViewportProps|getScrollbarProps|getThumbProps/i.test(source.text)) return "zag-scroll-area";
  if (/overflowX|overflowY|overflow-x|overflow-y|scrollTop|scrollLeft|onScroll|fireEvent\.scroll/i.test(source.text)) return "native-scroll";
  if (/role\s*=\s*["']presentation|scrollbar\b|viewport\b/i.test(source.text)) return "custom";
  return "unknown";
}

function scrollAreaReadinessFrameworkSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-scroll-area", pattern: /@radix-ui\/react-scroll-area|ScrollArea\.Root|ScrollArea\.Viewport|ScrollArea\.Scrollbar|ScrollArea\.Thumb|ScrollArea\.Corner/i, evidence: "Radix ScrollArea evidence was detected." },
    { signal: "zag-scroll-area", pattern: /@zag-js\/scroll-area|scrollArea\.machine|scrollArea\.connect|getViewportProps|getScrollbarProps|getThumbProps|getCornerProps/i, evidence: "Zag scroll-area evidence was detected." },
    { signal: "native-scroll", pattern: /overflowX|overflowY|overflow-x|overflow-y|scrollTop|scrollLeft|onScroll|fireEvent\.scroll/i, evidence: "native scroll/overflow evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']presentation|scrollbar\b|viewport\b|thumb\b/i, evidence: "custom scroll area evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function scrollAreaReadinessStructureSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["structureSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /ScrollArea\.Root|getRootProps|root\b|data-scope\s*=\s*["']scroll-area/i, evidence: "root evidence was detected." },
    { signal: "viewport", pattern: /ScrollArea\.Viewport|getViewportProps|viewport\b|data-testid\s*=\s*["']scroll-viewport/i, evidence: "viewport evidence was detected." },
    { signal: "content", pattern: /getContentProps|content\b|Content\b|children|scrollable content/i, evidence: "content evidence was detected." },
    { signal: "scrollbar", pattern: /ScrollArea\.Scrollbar|getScrollbarProps|scrollbar\b|Scrollbar\b/i, evidence: "scrollbar evidence was detected." },
    { signal: "thumb", pattern: /ScrollArea\.Thumb|getThumbProps|thumb\b|Thumb\b/i, evidence: "thumb evidence was detected." },
    { signal: "corner", pattern: /ScrollArea\.Corner|getCornerProps|corner\b|Corner\b/i, evidence: "corner evidence was detected." },
    { signal: "provider-context", pattern: /createContext|context\b|Provider|useMachine|scrollArea\.machine|scrollArea\.connect/i, evidence: "provider/context evidence was detected." },
    { signal: "anatomy-parts", pattern: /anatomy|parts|part\(|getRootProps|getViewportProps|getContentProps|getScrollbarProps|getThumbProps|getCornerProps/i, evidence: "anatomy parts evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function scrollAreaReadinessStateSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["stateSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "type", pattern: /type\s*=|type:\s*["']|type\b|hover|scroll|always|auto/i, evidence: "scrollbar type evidence was detected." },
    { signal: "scroll-hide-delay", pattern: /scrollHideDelay|scroll-hide-delay|hideDelay|scroll hide delay/i, evidence: "scroll hide delay evidence was detected." },
    { signal: "force-mount", pattern: /forceMount|force-mount/i, evidence: "forceMount evidence was detected." },
    { signal: "overflow-x", pattern: /overflowX|overflow-x|data-overflow-x|hasOverflowX|overflow x/i, evidence: "overflow-x evidence was detected." },
    { signal: "overflow-y", pattern: /overflowY|overflow-y|data-overflow-y|hasOverflowY|overflow y/i, evidence: "overflow-y evidence was detected." },
    { signal: "scrollbar-hidden", pattern: /scrollbarHidden|scrollbarXHidden|scrollbarYHidden|hiddenState|scrollHideDelay|data-state\s*=\s*["']hidden/i, evidence: "scrollbar hidden state evidence was detected." },
    { signal: "scroll-progress", pattern: /scrollProgress|scroll-progress|progress\b/i, evidence: "scroll progress evidence was detected." },
    { signal: "data-state", pattern: /data-state|state\s*=|hiddenState|scrollingX|scrollingY/i, evidence: "data-state evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function scrollAreaReadinessMeasurementSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["measurementSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["measurementSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "resize-observer", pattern: /ResizeObserver|resize observer|observeResize/i, evidence: "ResizeObserver evidence was detected." },
    { signal: "scroll-height", pattern: /scrollHeight|scroll-height/i, evidence: "scrollHeight evidence was detected." },
    { signal: "scroll-width", pattern: /scrollWidth|scroll-width/i, evidence: "scrollWidth evidence was detected." },
    { signal: "client-height", pattern: /clientHeight|client-height/i, evidence: "clientHeight evidence was detected." },
    { signal: "client-width", pattern: /clientWidth|client-width/i, evidence: "clientWidth evidence was detected." },
    { signal: "thumb-size", pattern: /thumbSize|thumb-size|thumb size/i, evidence: "thumb size evidence was detected." },
    { signal: "thumb-offset", pattern: /thumbOffset|thumb-offset|thumb offset/i, evidence: "thumb offset evidence was detected." },
    { signal: "corner-size", pattern: /cornerSize|corner-size|corner size/i, evidence: "corner size evidence was detected." },
    { signal: "ratio", pattern: /ratio|scrollRatio|sizeRatio/i, evidence: "ratio evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "measurement", "signal");
}

function scrollAreaReadinessOrientationSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["orientationSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["orientationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vertical", pattern: /vertical|orientation\s*=\s*["']vertical/i, evidence: "vertical orientation evidence was detected." },
    { signal: "horizontal", pattern: /horizontal|orientation\s*=\s*["']horizontal/i, evidence: "horizontal orientation evidence was detected." },
    { signal: "dir", pattern: /dir\s*=|direction|rtl|ltr/i, evidence: "direction evidence was detected." },
    { signal: "rtl", pattern: /dir\s*=\s*["']rtl|rtl\b/i, evidence: "RTL evidence was detected." },
    { signal: "ltr", pattern: /dir\s*=\s*["']ltr|ltr\b/i, evidence: "LTR evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation|toHaveAttribute\(["']data-orientation/i, evidence: "data-orientation evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "orientation", "signal");
}

function scrollAreaReadinessInteractionSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer", pattern: /pointer|userEvent\.pointer|pointerdown|pointermove|pointerup/i, evidence: "pointer evidence was detected." },
    { signal: "wheel", pattern: /wheel|fireEvent\.wheel|onWheel|deltaY|deltaX/i, evidence: "wheel evidence was detected." },
    { signal: "drag", pattern: /drag|thumb\b|pointermove|userEvent\.pointer/i, evidence: "drag/thumb evidence was detected." },
    { signal: "scroll-event", pattern: /fireEvent\.scroll|onScroll|scroll event|viewport\.scroll|scrollTop|scrollLeft/i, evidence: "scroll event evidence was detected." },
    { signal: "scroll-to", pattern: /scrollTo\(|scrollTo\s*[:=]|api\.scrollTo/i, evidence: "scrollTo evidence was detected." },
    { signal: "scroll-to-edge", pattern: /scrollToEdge|scroll-to-edge|edge\s*:\s*["']/i, evidence: "scrollToEdge evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|ArrowUp|ArrowDown|PageUp|PageDown|Home|End|tabIndex/i, evidence: "keyboard/focus test evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function scrollAreaReadinessAccessibilitySignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-presentation", pattern: /role\s*=\s*["']presentation|getByRole\(["']presentation|presentation\b/i, evidence: "role presentation evidence was detected." },
    { signal: "tabindex", pattern: /tabIndex|tabindex/i, evidence: "tabIndex evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|aria-labelledby|aria-describedby|label\b/i, evidence: "ARIA label evidence was detected." },
    { signal: "data-overflow", pattern: /data-overflow|data-overflow-x|data-overflow-y|hasOverflowX|hasOverflowY/i, evidence: "data-overflow evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby|ownedby|aria-owns/i, evidence: "owned-by evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function scrollAreaReadinessMachineSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["machineSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine|scrollArea\.machine|machine\s*=/i, evidence: "Zag scroll-area createMachine evidence was detected." },
    { signal: "props-ensure-id", pattern: /ensureProps|props\s*:\s*\(\)|props\(\{ props \}\)|\bid\b/i, evidence: "props/id guard evidence was detected." },
    { signal: "bindable-context", pattern: /bindable|scrollingX|scrollingY|hiddenState|thumbSize|cornerSize/i, evidence: "bindable context evidence was detected." },
    { signal: "refs", pattern: /refs\(|scrollPosition|scrollYTimeout|scrollXTimeout|programmaticScroll/i, evidence: "machine refs evidence was detected." },
    { signal: "initial-idle", pattern: /initialState\(\)|initialState|idle/i, evidence: "initial idle state evidence was detected." },
    { signal: "watch-hidden-state", pattern: /watch\(|hiddenState|thumb\.measure/i, evidence: "watch hidden state evidence was detected." },
    { signal: "top-level-effects", pattern: /effects:\s*\[|trackContentResize|trackViewportVisibility|trackWheelEvent/i, evidence: "top-level effects evidence was detected." },
    { signal: "entry-check-hovering", pattern: /entry:\s*\[|checkHovering/i, evidence: "entry checkHovering evidence was detected." },
    { signal: "exit-clear-timeouts", pattern: /exit:\s*\[|clearTimeouts/i, evidence: "exit clearTimeouts evidence was detected." },
    { signal: "thumb-measure-event", pattern: /thumb\.measure|setThumbSize/i, evidence: "thumb.measure event evidence was detected." },
    { signal: "viewport-scroll-event", pattern: /viewport\.scroll|setScrolling|setProgrammaticScroll/i, evidence: "viewport.scroll event evidence was detected." },
    { signal: "root-pointer-events", pattern: /root\.pointerenter|root\.pointerdown|root\.pointerleave/i, evidence: "root pointer event evidence was detected." },
    { signal: "idle-state", pattern: /idle:\s*\{|idle/i, evidence: "idle state evidence was detected." },
    { signal: "dragging-state", pattern: /dragging:\s*\{|dragging/i, evidence: "dragging state evidence was detected." },
    { signal: "scrollbar-pointerdown-event", pattern: /scrollbar\.pointerdown|scrollToPointer|startDragging/i, evidence: "scrollbar pointerdown event evidence was detected." },
    { signal: "thumb-pointerdown-event", pattern: /thumb\.pointerdown|startDragging/i, evidence: "thumb pointerdown event evidence was detected." },
    { signal: "thumb-pointermove-event", pattern: /thumb\.pointermove|setDraggingScroll/i, evidence: "thumb pointermove event evidence was detected." },
    { signal: "pointerup-events", pattern: /scrollbar\.pointerup|thumb\.pointerup|stopDragging|clearScrolling/i, evidence: "pointerup transition evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function scrollAreaReadinessContextSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["contextSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "scrolling-x", pattern: /scrollingX|scrolling-x/i, evidence: "scrollingX context evidence was detected." },
    { signal: "scrolling-y", pattern: /scrollingY|scrolling-y/i, evidence: "scrollingY context evidence was detected." },
    { signal: "hovering", pattern: /hovering|data-hover/i, evidence: "hovering context evidence was detected." },
    { signal: "dragging", pattern: /dragging|data-dragging/i, evidence: "dragging context evidence was detected." },
    { signal: "touch-modality", pattern: /touchModality|touch-modality|pointerType.*touch/i, evidence: "touch modality context evidence was detected." },
    { signal: "at-sides", pattern: /atSides|isAtTop|isAtBottom|isAtLeft|isAtRight/i, evidence: "atSides context evidence was detected." },
    { signal: "corner-size", pattern: /cornerSize|--corner-width|--corner-height/i, evidence: "corner size context evidence was detected." },
    { signal: "thumb-size", pattern: /thumbSize|--thumb-width|--thumb-height/i, evidence: "thumb size context evidence was detected." },
    { signal: "hidden-state", pattern: /hiddenState|scrollbarYHidden|scrollbarXHidden|cornerHidden/i, evidence: "hidden state context evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function scrollAreaReadinessRefSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["refSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["refSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "orientation-ref", pattern: /orientation:\s*["']vertical|refs.*orientation|\borientation\b/i, evidence: "orientation ref evidence was detected." },
    { signal: "scroll-position-ref", pattern: /scrollPosition|scroll-position/i, evidence: "scroll position ref evidence was detected." },
    { signal: "scroll-y-timeout", pattern: /scrollYTimeout|scroll-y-timeout/i, evidence: "scrollY timeout evidence was detected." },
    { signal: "scroll-x-timeout", pattern: /scrollXTimeout|scroll-x-timeout/i, evidence: "scrollX timeout evidence was detected." },
    { signal: "scroll-end-timeout", pattern: /scrollEndTimeout|scroll-end-timeout/i, evidence: "scroll end timeout evidence was detected." },
    { signal: "start-x", pattern: /startX|start-x/i, evidence: "startX ref evidence was detected." },
    { signal: "start-y", pattern: /startY|start-y/i, evidence: "startY ref evidence was detected." },
    { signal: "start-scroll-top", pattern: /startScrollTop|start-scroll-top/i, evidence: "start scroll top ref evidence was detected." },
    { signal: "start-scroll-left", pattern: /startScrollLeft|start-scroll-left/i, evidence: "start scroll left ref evidence was detected." },
    { signal: "programmatic-scroll", pattern: /programmaticScroll|programmatic-scroll/i, evidence: "programmatic scroll ref evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "ref", "signal");
}

function scrollAreaReadinessEffectSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["effectSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-content-resize", pattern: /trackContentResize/i, evidence: "trackContentResize effect evidence was detected." },
    { signal: "resize-observer", pattern: /ResizeObserver|obs\.observe|observe\(contentEl/i, evidence: "ResizeObserver effect evidence was detected." },
    { signal: "track-viewport-visibility", pattern: /trackViewportVisibility/i, evidence: "trackViewportVisibility effect evidence was detected." },
    { signal: "intersection-observer", pattern: /IntersectionObserver|intersectionRatio/i, evidence: "IntersectionObserver evidence was detected." },
    { signal: "track-wheel-event", pattern: /trackWheelEvent|onWheel|wheel/i, evidence: "wheel effect evidence was detected." },
    { signal: "add-dom-event", pattern: /addDomEvent|passive:\s*false/i, evidence: "addDomEvent evidence was detected." },
    { signal: "track-pointer-move", pattern: /trackPointerMove|onPointerMove|onPointerUp/i, evidence: "trackPointerMove effect evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function scrollAreaReadinessActionSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["actionSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-touch-modality", pattern: /setTouchModality|touchModality/i, evidence: "setTouchModality action evidence was detected." },
    { signal: "set-hovering", pattern: /setHovering|context\.set\(["']hovering["'],\s*true/i, evidence: "setHovering action evidence was detected." },
    { signal: "clear-hovering", pattern: /clearHovering|context\.set\(["']hovering["'],\s*false/i, evidence: "clearHovering action evidence was detected." },
    { signal: "set-programmatic-scroll", pattern: /setProgrammaticScroll|programmaticScroll/i, evidence: "programmatic scroll action evidence was detected." },
    { signal: "clear-scrolling", pattern: /clearScrolling|scrollingY|scrollingX/i, evidence: "clear scrolling action evidence was detected." },
    { signal: "set-thumb-size", pattern: /setThumbSize|thumbSize|clampedNext/i, evidence: "set thumb size action evidence was detected." },
    { signal: "set-overflow-css-vars", pattern: /--scroll-area-overflow-x-start|--scroll-area-overflow-x-end|--scroll-area-overflow-y-start|--scroll-area-overflow-y-end|setStyleProperty/i, evidence: "overflow CSS variable action evidence was detected." },
    { signal: "set-at-sides", pattern: /getScrollSides|atSides/i, evidence: "set atSides action evidence was detected." },
    { signal: "scroll-to-pointer", pattern: /scrollToPointer|scrollbar\.pointerdown/i, evidence: "scrollToPointer action evidence was detected." },
    { signal: "start-dragging", pattern: /startDragging|startScrollTop|startScrollLeft/i, evidence: "start dragging action evidence was detected." },
    { signal: "set-dragging-scroll", pattern: /setDraggingScroll|deltaY|deltaX/i, evidence: "dragging scroll action evidence was detected." },
    { signal: "stop-dragging", pattern: /stopDragging|orientation.*null/i, evidence: "stop dragging action evidence was detected." },
    { signal: "clear-timeouts", pattern: /clearTimeouts|scrollYTimeout.*clear|scrollXTimeout.*clear|scrollEndTimeout.*clear/i, evidence: "clear timeouts action evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function scrollAreaReadinessDomSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["domSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|root-id/i, evidence: "root ID DOM evidence was detected." },
    { signal: "viewport-id", pattern: /getViewportId|viewport-id/i, evidence: "viewport ID DOM evidence was detected." },
    { signal: "content-id", pattern: /getContentId|content-id/i, evidence: "content ID DOM evidence was detected." },
    { signal: "root-el", pattern: /getRootEl|root-el/i, evidence: "root element DOM evidence was detected." },
    { signal: "viewport-el", pattern: /getViewportEl|viewport-el/i, evidence: "viewport element DOM evidence was detected." },
    { signal: "content-el", pattern: /getContentEl|content-el/i, evidence: "content element DOM evidence was detected." },
    { signal: "scrollbar-x-el", pattern: /getScrollbarXEl|scrollbar-x-el/i, evidence: "horizontal scrollbar DOM evidence was detected." },
    { signal: "scrollbar-y-el", pattern: /getScrollbarYEl|scrollbar-y-el/i, evidence: "vertical scrollbar DOM evidence was detected." },
    { signal: "thumb-x-el", pattern: /getThumbXEl|thumb-x-el/i, evidence: "horizontal thumb DOM evidence was detected." },
    { signal: "thumb-y-el", pattern: /getThumbYEl|thumb-y-el/i, evidence: "vertical thumb DOM evidence was detected." },
    { signal: "corner-el", pattern: /getCornerEl|corner-el/i, evidence: "corner element DOM evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function scrollAreaReadinessUtilitySignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["utilitySignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["utilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "scroll-offset", pattern: /getScrollOffset|scroll-offset|marginInlineStart|paddingInlineStart/i, evidence: "scroll offset utility evidence was detected." },
    { signal: "scroll-sides", pattern: /getScrollSides|scroll-sides|atTop|atBottom|atLeft|atRight/i, evidence: "scroll sides utility evidence was detected." },
    { signal: "timeout", pattern: /class Timeout|new Timeout|setTimeout|clearTimeout/i, evidence: "timeout utility evidence was detected." },
    { signal: "scroll-to", pattern: /function scrollTo|scrollTo\(|node\.scrollTo/i, evidence: "scrollTo utility evidence was detected." },
    { signal: "smooth-scroll", pattern: /smoothScroll|EASE_OUT_QUAD|easedProgress/i, evidence: "smooth scroll utility evidence was detected." },
    { signal: "scroll-progress", pattern: /getScrollProgress|progressX|progressY/i, evidence: "scroll progress utility evidence was detected." },
    { signal: "scroll-to-edge", pattern: /scrollToEdge|targetScrollTop|targetScrollLeft/i, evidence: "scrollToEdge utility evidence was detected." },
    { signal: "rtl-scroll", pattern: /dir.*rtl|isRtl|scrollLeft.*negative|RTL/i, evidence: "RTL scroll utility evidence was detected." },
    { signal: "compact-scroll-options", pattern: /compact\(|scrollOptions|ScrollToOptions/i, evidence: "compact scroll options evidence was detected." },
    { signal: "request-animation-frame", pattern: /requestAnimationFrame|cancelAnimationFrame|rafId/i, evidence: "requestAnimationFrame evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "utility", "signal");
}

function scrollAreaReadinessApiSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["apiSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-at-top", pattern: /isAtTop|atSides\.top/i, evidence: "isAtTop API evidence was detected." },
    { signal: "is-at-bottom", pattern: /isAtBottom|atSides\.bottom/i, evidence: "isAtBottom API evidence was detected." },
    { signal: "is-at-left", pattern: /isAtLeft|atSides\.left/i, evidence: "isAtLeft API evidence was detected." },
    { signal: "is-at-right", pattern: /isAtRight|atSides\.right/i, evidence: "isAtRight API evidence was detected." },
    { signal: "has-overflow-x", pattern: /hasOverflowX|scrollbarXHidden|data-overflow-x/i, evidence: "hasOverflowX API evidence was detected." },
    { signal: "has-overflow-y", pattern: /hasOverflowY|scrollbarYHidden|data-overflow-y/i, evidence: "hasOverflowY API evidence was detected." },
    { signal: "get-scroll-progress", pattern: /getScrollProgress/i, evidence: "getScrollProgress API evidence was detected." },
    { signal: "scroll-to-edge", pattern: /scrollToEdge/i, evidence: "scrollToEdge API evidence was detected." },
    { signal: "scroll-to", pattern: /scrollTo\(/i, evidence: "scrollTo API evidence was detected." },
    { signal: "get-scrollbar-state", pattern: /getScrollbarState/i, evidence: "getScrollbarState API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "viewport-props", pattern: /getViewportProps/i, evidence: "viewport props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "scrollbar-props", pattern: /getScrollbarProps/i, evidence: "scrollbar props API evidence was detected." },
    { signal: "thumb-props", pattern: /getThumbProps/i, evidence: "thumb props API evidence was detected." },
    { signal: "corner-props", pattern: /getCornerProps/i, evidence: "corner props API evidence was detected." },
    { signal: "root-pointer-handlers", pattern: /onPointerEnter|onPointerMove|onPointerDown|onPointerLeave|root\.pointer/i, evidence: "root pointer handler API evidence was detected." },
    { signal: "viewport-scroll-handler", pattern: /onScroll|viewport\.scroll/i, evidence: "viewport scroll handler API evidence was detected." },
    { signal: "viewport-user-interaction", pattern: /onWheel|onTouchMove|onPointerMove|onPointerEnter|onKeyDown|user\.scroll/i, evidence: "viewport user interaction API evidence was detected." },
    { signal: "scrollbar-pointer-handlers", pattern: /scrollbar\.pointerdown|scrollbar\.pointerup|onPointerDown|onPointerUp/i, evidence: "scrollbar pointer handler API evidence was detected." },
    { signal: "thumb-pointer-handler", pattern: /thumb\.pointerdown|onPointerDown/i, evidence: "thumb pointer handler API evidence was detected." },
    { signal: "data-overflow", pattern: /data-overflow-x|data-overflow-y/i, evidence: "data overflow API evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby API evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation API evidence was detected." },
    { signal: "data-scrolling", pattern: /data-scrolling/i, evidence: "data-scrolling API evidence was detected." },
    { signal: "data-hover", pattern: /data-hover/i, evidence: "data-hover API evidence was detected." },
    { signal: "data-dragging", pattern: /data-dragging/i, evidence: "data-dragging API evidence was detected." },
    { signal: "corner-state", pattern: /data-state.*hidden|cornerHidden|visible/i, evidence: "corner state API evidence was detected." },
    { signal: "css-vars", pattern: /--corner-width|--corner-height|--thumb-width|--thumb-height|toPx/i, evidence: "CSS variable API evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function scrollAreaReadinessTestSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["testSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent\./i, evidence: "user-event evidence was detected." },
    { signal: "scroll-event-test", pattern: /fireEvent\.scroll|scrollTop|scrollLeft|onScroll/i, evidence: "scroll event test evidence was detected." },
    { signal: "wheel-test", pattern: /fireEvent\.wheel|wheel|deltaY|deltaX/i, evidence: "wheel test evidence was detected." },
    { signal: "attribute-test", pattern: /toHaveAttribute|toHaveStyle|data-orientation|data-overflow|data-state|tabIndex/i, evidence: "attribute/style test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|scroll-area-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function scrollAreaReadinessPackageSignals(sourceFiles: ScrollAreaReadinessSourceFile[]): ScrollAreaReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ScrollAreaReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-scroll-area", pattern: /@radix-ui\/react-scroll-area/i, evidence: "@radix-ui/react-scroll-area dependency evidence was detected." },
    { signal: "@zag-js/scroll-area", pattern: /@zag-js\/scroll-area/i, evidence: "@zag-js/scroll-area dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\./i, evidence: "React evidence was detected." }
  ];
  return scrollAreaReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function scrollAreaReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ScrollAreaReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/scroll-area-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildAvatarReadinessReport(walk: WalkResult): Promise<AvatarReadinessReport> {
  const sourceFiles = await avatarReadinessSourceFiles(walk);
  const avatarSetups = avatarReadinessSetups(sourceFiles);
  const frameworkSignals = avatarReadinessFrameworkSignals(sourceFiles);
  const structureSignals = avatarReadinessStructureSignals(sourceFiles);
  const stateSignals = avatarReadinessStateSignals(sourceFiles);
  const imageSignals = avatarReadinessImageSignals(sourceFiles);
  const eventSignals = avatarReadinessEventSignals(sourceFiles);
  const ssrSignals = avatarReadinessSsrSignals(sourceFiles);
  const accessibilitySignals = avatarReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = avatarReadinessMachineSignals(sourceFiles);
  const effectSignals = avatarReadinessEffectSignals(sourceFiles);
  const domSignals = avatarReadinessDomSignals(sourceFiles);
  const apiSignals = avatarReadinessApiSignals(sourceFiles);
  const testSignals = avatarReadinessTestSignals(sourceFiles);
  const packageSignals = avatarReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || avatarSetups.some((item) => item.imageCount + item.fallbackCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || avatarSetups.some((item) => item.loadingStatusCount > 0);
  const hasImage = imageSignals.some((item) => item.readiness === "ready") || avatarSetups.some((item) => item.srcCount > 0 && item.altCount > 0);
  const hasEvents = eventSignals.some((item) => item.readiness === "ready") || avatarSetups.some((item) => item.eventCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || avatarSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || avatarSetups.some((item) => item.testCount > 0);

  const riskQueue: AvatarReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document avatar root, image, and fallback boundaries before claiming avatar readiness.",
      why: "Avatar readiness starts with traceable root, image, and fallback evidence learners can inspect.",
      relatedHref: "html/avatar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Trace loading, loaded, error, hidden/data-state, delay, and status change state.",
      why: "Avatar behavior depends on fallback visibility matching image load/error state without flashing or hiding accessible content.",
      relatedHref: "html/avatar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasImage) {
    riskQueue.push({
      priority: "high",
      action: "Trace src, srcset, alt text, referrerPolicy, crossOrigin, complete, and natural size handling.",
      why: "Avatar images need robust source attributes and accessibility text while load status is resolved.",
      relatedHref: "html/avatar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasEvents) {
    riskQueue.push({
      priority: "medium",
      action: "Add load/error/src-change/removal/status-change evidence and setLoaded/setError controls where applicable.",
      why: "Avatar readiness should show how image events and source changes update fallback state and callbacks.",
      relatedHref: "html/avatar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify alt text, image role queries, labels, fallback text, and axe or equivalent accessibility checks.",
      why: "Fallback initials and image alt text must stay meaningful while the visual image loads or fails.",
      relatedHref: "html/avatar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add fallback, image role/alt, load/error, status callback, SSR/hydration, and accessibility tests.",
      why: "Static avatar component evidence does not prove delayed fallback, image events, hydration, or accessibility behavior.",
      relatedHref: "html/avatar-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual avatar behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records avatar readiness only; it does not load images, dispatch load/error events, mutate src, hydrate DOM, measure natural size, or run analyzed project tests.",
    relatedHref: "html/avatar-readiness.html"
  });

  return {
    summary: `Avatar readiness report: setup ${avatarSetups.length}개, framework signal ${frameworkSignals.length}개, image signal ${imageSignals.length}개, event signal ${eventSignals.length}개, machine signal ${machineSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Avatar readiness Radix Avatar Zag avatar image fallback loading loaded error delayMs alt src srcset SSR axe tests",
    avatarSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    imageSignals,
    eventSignals,
    ssrSignals,
    accessibilitySignals,
    machineSignals,
    effectSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-avatar|Avatar\\.Root|Avatar\\.Image|Avatar\\.Fallback|onLoadingStatusChange|delayMs\" package.json src app packages", purpose: "Find Radix Avatar root, image, fallback, loading callback, and delayed fallback wiring." },
      { command: "rg \"@zag-js/avatar|avatar\\.machine|avatar\\.connect|getImageProps|getFallbackProps|setSrc|setLoaded|setError|onStatusChange\" package.json src app packages", purpose: "Find Zag avatar machine, connect API, status callback, and imperative status controls." },
      { command: "rg \"srcSet|srcset|alt=|referrerPolicy|crossOrigin|complete|naturalWidth|naturalHeight|load|error|src.change|img.unmount\" src app packages", purpose: "Check image attributes, natural-size checks, and load/error/source-change event evidence." },
      { command: "rg \"axe|toHaveNoViolations|getByRole\\(['\\\"]img|findByAltText|queryByText|waitFor|renderToString|hydrate|avatar-traces\" test tests src app packages .github", purpose: "Check avatar accessibility, fallback, role/alt, SSR/hydration, and artifact coverage." }
    ],
    learnerNextSteps: [
      "먼저 Radix Avatar, Zag avatar, native img, custom avatar 중 어떤 family를 쓰는지 확인하세요.",
      "root, image, fallback 구조와 provider/context 또는 anatomy props가 어떤 파일에 있는지 정리하세요.",
      "loading, loaded, error, idle, data-state, hidden, delayMs가 fallback 표시와 image 표시를 어떻게 바꾸는지 확인하세요.",
      "src, srcset, alt, referrerPolicy, crossOrigin, complete, naturalWidth/naturalHeight 처리가 이미지 실패와 캐시 상태를 어떻게 다루는지 확인하세요.",
      "load/error/src-change/image-removal/status-change, setSrc/setLoaded/setError, SSR/hydration, axe/role/alt/fallback tests를 원본 프로젝트에서 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 image load/error dispatch, src mutation, hydration, natural size measurement는 원본 프로젝트의 component/browser tests에서 별도 확인하세요."
    ]
  };
}

type AvatarReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function avatarReadinessSourceFiles(walk: WalkResult): Promise<AvatarReadinessSourceFile[]> {
  const files: AvatarReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !avatarReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!avatarReadinessPathSignal(file.relPath) && !avatarReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function avatarReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return avatarReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function avatarReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(avatar|avatars|profile-image|profile_image|fallback|image|img|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function avatarReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-avatar|@zag-js\/avatar|Avatar\.Root|Avatar\.Image|Avatar\.Fallback|avatar\.machine|avatar\.connect|getImageProps|getFallbackProps|onLoadingStatusChange|onStatusChange|delayMs|naturalWidth|renderToString|vitest-axe)/i.test(text);
}

function avatarReadinessSetups(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["avatarSetups"] {
  const rows: AvatarReadinessReport["avatarSetups"] = [];
  for (const source of sourceFiles) {
    const avatarCount = countMatches(source.text, /(Avatar\.Root|Avatar\b|avatar\.machine|avatar\.connect|@radix-ui\/react-avatar|@zag-js\/avatar|data-scope\s*=\s*["']avatar)/gi);
    const imageCount = countMatches(source.text, /(Avatar\.Image|getImageProps|<img\b|Primitive\.img|image\b|img\b)/gi);
    const fallbackCount = countMatches(source.text, /(Avatar\.Fallback|getFallbackProps|fallback\b|Fallback\b|queryByText|fallback-text)/gi);
    const loadingStatusCount = countMatches(source.text, /(imageLoadingStatus|loadingStatus|onLoadingStatusChange|onStatusChange|loaded|loading|error|idle|api\.loaded)/gi);
    const delayCount = countMatches(source.text, /(delayMs|setTimeout|clearTimeout|DELAY|delay\b)/gi);
    const srcCount = countMatches(source.text, /(src\s*=|srcSet|srcset|setSrc|src\.change|referrerPolicy|crossOrigin)/gi);
    const altCount = countMatches(source.text, /(alt\s*=|findByAltText|queryByAltText|alt text|IMAGE_ALT_TEXT)/gi);
    const eventCount = countMatches(source.text, /(onLoad|onError|addEventListener\(['"]load|addEventListener\(['"]error|fireEvent\.load|fireEvent\.error|img\.loaded|img\.error|img\.unmount|src\.change|setLoaded|setError|onStatusChange)/gi);
    const ssrCount = countMatches(source.text, /(renderToString|hydrate|hydration|SSR|useIsHydrated|server render|react-dom\/server)/gi);
    const accessibilityCount = countMatches(source.text, /(axe|toHaveNoViolations|aria-label|aria-labelledby|role\s*=\s*["']img|getByRole\(["']img|findByAltText|alt\s*=|fallback text|queryByText)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|vitest-axe|axe|waitFor|getByRole|findByAltText|queryByText|renderToString|avatar-traces|upload-artifact)/gi);
    const total = avatarCount + imageCount + fallbackCount + loadingStatusCount + delayCount + srcCount + altCount + eventCount + ssrCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = avatarCount > 0 && imageCount > 0 && fallbackCount > 0 && loadingStatusCount > 0 && srcCount > 0 && altCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: avatarReadinessFramework(source),
      avatarCount,
      imageCount,
      fallbackCount,
      loadingStatusCount,
      delayCount,
      srcCount,
      altCount,
      eventCount,
      ssrCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `avatar ${avatarCount}, image ${imageCount}, fallback ${fallbackCount}, loading status ${loadingStatusCount}, delay ${delayCount}, src ${srcCount}, alt ${altCount}, event ${eventCount}, ssr ${ssrCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.avatarCount + b.imageCount + b.fallbackCount + b.loadingStatusCount + b.altCount - (a.avatarCount + a.imageCount + a.fallbackCount + a.loadingStatusCount + a.altCount));
}

function avatarReadinessFramework(source: AvatarReadinessSourceFile): AvatarReadinessReport["avatarSetups"][number]["framework"] {
  if (/@radix-ui\/react-avatar|Avatar\.Root|Avatar\.Image|Avatar\.Fallback|onLoadingStatusChange|delayMs/i.test(source.text)) return "radix-avatar";
  if (/@zag-js\/avatar|avatar\.machine|avatar\.connect|getImageProps|getFallbackProps|onStatusChange/i.test(source.text)) return "zag-avatar";
  if (/<img\b|HTMLImageElement|naturalWidth|naturalHeight|srcSet|srcset/i.test(source.text)) return "native-img";
  if (/avatar\b|fallback\b|role\s*=\s*["']img/i.test(source.text)) return "custom";
  return "unknown";
}

function avatarReadinessFrameworkSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-avatar", pattern: /@radix-ui\/react-avatar|Avatar\.Root|Avatar\.Image|Avatar\.Fallback|onLoadingStatusChange|delayMs/i, evidence: "Radix Avatar evidence was detected." },
    { signal: "zag-avatar", pattern: /@zag-js\/avatar|avatar\.machine|avatar\.connect|getImageProps|getFallbackProps|onStatusChange/i, evidence: "Zag avatar evidence was detected." },
    { signal: "native-img", pattern: /<img\b|HTMLImageElement|naturalWidth|naturalHeight|srcSet|srcset|fireEvent\.load|fireEvent\.error/i, evidence: "native img evidence was detected." },
    { signal: "custom", pattern: /avatar\b|fallback\b|role\s*=\s*["']img/i, evidence: "custom avatar evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function avatarReadinessStructureSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["structureSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /Avatar\.Root|getRootProps|root\b|data-part\s*=\s*["']root|data-testid\s*=\s*["']avatar-root/i, evidence: "root evidence was detected." },
    { signal: "image", pattern: /Avatar\.Image|getImageProps|<img\b|Primitive\.img|data-part\s*=\s*["']image/i, evidence: "image evidence was detected." },
    { signal: "fallback", pattern: /Avatar\.Fallback|getFallbackProps|fallback\b|Fallback\b|data-part\s*=\s*["']fallback/i, evidence: "fallback evidence was detected." },
    { signal: "provider-context", pattern: /AvatarProvider|createAvatarContext|useAvatarContext|Provider|useMachine|avatar\.machine|avatar\.connect/i, evidence: "provider/context evidence was detected." },
    { signal: "anatomy-parts", pattern: /anatomy|parts|data-scope\s*=\s*["']avatar|getRootProps|getImageProps|getFallbackProps/i, evidence: "anatomy parts evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function avatarReadinessStateSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["stateSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /idle|imageLoadingStatus.*idle/i, evidence: "idle state evidence was detected." },
    { signal: "loading", pattern: /loading|initialState\(\).*loading/i, evidence: "loading state evidence was detected." },
    { signal: "loaded", pattern: /loaded|img\.loaded|setLoaded|data-state.*visible/i, evidence: "loaded state evidence was detected." },
    { signal: "error", pattern: /error|img\.error|setError/i, evidence: "error state evidence was detected." },
    { signal: "data-state", pattern: /data-state|state\.matches|api\.loaded/i, evidence: "data-state evidence was detected." },
    { signal: "hidden", pattern: /hidden|queryByRole\(['"]img|not\.toBeInTheDocument/i, evidence: "hidden visibility evidence was detected." },
    { signal: "delay", pattern: /delayMs|setTimeout|clearTimeout|DELAY|delay\b/i, evidence: "delay evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function avatarReadinessImageSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["imageSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["imageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "src", pattern: /src\s*=|setSrc|src\.change/i, evidence: "src evidence was detected." },
    { signal: "srcset", pattern: /srcSet|srcset/i, evidence: "srcset evidence was detected." },
    { signal: "alt", pattern: /alt\s*=|findByAltText|queryByAltText|alt text|IMAGE_ALT_TEXT/i, evidence: "alt evidence was detected." },
    { signal: "referrer-policy", pattern: /referrerPolicy|referrer-policy|no-referrer/i, evidence: "referrerPolicy evidence was detected." },
    { signal: "crossorigin", pattern: /crossOrigin|crossorigin|anonymous/i, evidence: "crossOrigin evidence was detected." },
    { signal: "complete", pattern: /complete\b|image\.complete/i, evidence: "complete evidence was detected." },
    { signal: "natural-size", pattern: /naturalWidth|naturalHeight|natural size/i, evidence: "natural size evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "image", "signal");
}

function avatarReadinessEventSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["eventSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["eventSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "load-event", pattern: /onLoad|addEventListener\(['"]load|fireEvent\.load|img\.loaded/i, evidence: "load event evidence was detected." },
    { signal: "error-event", pattern: /onError|addEventListener\(['"]error|fireEvent\.error|img\.error/i, evidence: "error event evidence was detected." },
    { signal: "src-change", pattern: /src\.change|trackSrcChange|setSrc|observeAttributes|srcset/i, evidence: "src change evidence was detected." },
    { signal: "image-removal", pattern: /img\.unmount|trackImageRemoval|observeChildren|removedNodes|unmount/i, evidence: "image removal evidence was detected." },
    { signal: "status-change", pattern: /onLoadingStatusChange|onStatusChange|invokeOnLoad|invokeOnError|StatusChange/i, evidence: "status change evidence was detected." },
    { signal: "set-loaded-error", pattern: /setLoaded|setError|img\.loaded|img\.error/i, evidence: "set loaded/error evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "event", "signal");
}

function avatarReadinessSsrSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["ssrSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["ssrSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hydration", pattern: /hydrate|hydration/i, evidence: "hydration evidence was detected." },
    { signal: "render-to-string", pattern: /renderToString|react-dom\/server/i, evidence: "renderToString evidence was detected." },
    { signal: "use-is-hydrated", pattern: /useIsHydrated|isHydrated/i, evidence: "useIsHydrated evidence was detected." },
    { signal: "server-render", pattern: /SSR|server render|server-render|renderToString/i, evidence: "server render evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "ssr", "signal");
}

function avatarReadinessAccessibilitySignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "alt-text", pattern: /alt\s*=|findByAltText|queryByAltText|alt text|IMAGE_ALT_TEXT/i, evidence: "alt text evidence was detected." },
    { signal: "role-img", pattern: /getByRole\(["']img|findByRole\(["']img|queryByRole\(["']img|role\s*=\s*["']img/i, evidence: "image role evidence was detected." },
    { signal: "axe", pattern: /vitest-axe|axe\(|toHaveNoViolations/i, evidence: "axe accessibility evidence was detected." },
    { signal: "label", pattern: /aria-label|aria-labelledby|label\b/i, evidence: "label evidence was detected." },
    { signal: "fallback-text", pattern: /fallback text|FALLBACK_TEXT|queryByText|toHaveTextContent|>AL<|>PA</i, evidence: "fallback text evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function avatarReadinessZagAvatarUsagePattern(sourceFiles: AvatarReadinessSourceFile[]): string {
  const hasZagAvatarUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/avatar|avatar\.machine|avatar\.connect|getRootProps|getImageProps|getFallbackProps|useMachine/i.test(source.text));
  return hasZagAvatarUsage ? "@zag-js\\/avatar|avatar\\.machine|avatar\\.connect|getRootProps|getImageProps|getFallbackProps|useMachine" : "(?!)";
}

function avatarReadinessMachineSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["machineSignals"] {
  const zagAvatar = avatarReadinessZagAvatarUsagePattern(sourceFiles);
  const specs: Array<{ signal: AvatarReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagAvatar}|createMachine`, "i"), evidence: "Zag createMachine/avatar.machine evidence was detected." },
    { signal: "loading-state", pattern: new RegExp(`${zagAvatar}|initialState\\(\\)[\\s\\S]{0,80}loading|state:\\s*["']loading["']|\\bloading\\b`, "i"), evidence: "loading state evidence was detected." },
    { signal: "loaded-state", pattern: new RegExp(`${zagAvatar}|state:\\s*["']loaded["']|\\bloaded\\b|img\\.loaded|setLoaded`, "i"), evidence: "loaded state evidence was detected." },
    { signal: "error-state", pattern: new RegExp(`${zagAvatar}|state:\\s*["']error["']|\\berror\\b|img\\.error|setError`, "i"), evidence: "error state evidence was detected." },
    { signal: "src-change-event", pattern: new RegExp(`${zagAvatar}|src\\.change|trackSrcChange|setSrc`, "i"), evidence: "src.change event evidence was detected." },
    { signal: "image-unmount-event", pattern: new RegExp(`${zagAvatar}|img\\.unmount|trackImageRemoval`, "i"), evidence: "img.unmount event evidence was detected." },
    { signal: "image-loaded-event", pattern: new RegExp(`${zagAvatar}|img\\.loaded|setLoaded|onLoad`, "i"), evidence: "img.loaded event evidence was detected." },
    { signal: "image-error-event", pattern: new RegExp(`${zagAvatar}|img\\.error|setError|onError`, "i"), evidence: "img.error event evidence was detected." },
    { signal: "check-image-status", pattern: new RegExp(`${zagAvatar}|checkImageStatus|image\\.complete|naturalWidth|naturalHeight`, "i"), evidence: "checkImageStatus evidence was detected." },
    { signal: "status-callback", pattern: new RegExp(`${zagAvatar}|onStatusChange|invokeOnLoad|invokeOnError|StatusChange`, "i"), evidence: "status callback evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function avatarReadinessEffectSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["effectSignals"] {
  const zagAvatar = avatarReadinessZagAvatarUsagePattern(sourceFiles);
  const specs: Array<{ signal: AvatarReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-image-removal", pattern: new RegExp(`${zagAvatar}|trackImageRemoval|img\\.unmount`, "i"), evidence: "trackImageRemoval evidence was detected." },
    { signal: "track-src-change", pattern: new RegExp(`${zagAvatar}|trackSrcChange|src\\.change`, "i"), evidence: "trackSrcChange evidence was detected." },
    { signal: "observe-children", pattern: new RegExp(`${zagAvatar}|observeChildren`, "i"), evidence: "observeChildren evidence was detected." },
    { signal: "observe-attributes", pattern: new RegExp(`${zagAvatar}|observeAttributes`, "i"), evidence: "observeAttributes evidence was detected." },
    { signal: "removed-nodes", pattern: new RegExp(`${zagAvatar}|removedNodes|nodeType|Node\\.ELEMENT_NODE`, "i"), evidence: "removedNodes evidence was detected." },
    { signal: "src-srcset-watch", pattern: new RegExp(`${zagAvatar}|attributes:\\s*\\[[^\\]]*src[^\\]]*srcset|srcset|srcSet`, "i"), evidence: "src/srcset watch evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function avatarReadinessDomSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["domSignals"] {
  const zagAvatar = avatarReadinessZagAvatarUsagePattern(sourceFiles);
  const specs: Array<{ signal: AvatarReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagAvatar}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "image-id", pattern: new RegExp(`${zagAvatar}|getImageId|ids\\?\\.image|getImageProps`, "i"), evidence: "image id evidence was detected." },
    { signal: "fallback-id", pattern: new RegExp(`${zagAvatar}|getFallbackId|ids\\?\\.fallback|getFallbackProps`, "i"), evidence: "fallback id evidence was detected." },
    { signal: "root-el", pattern: new RegExp(`${zagAvatar}|getRootEl|rootEl`, "i"), evidence: "root element evidence was detected." },
    { signal: "image-el", pattern: new RegExp(`${zagAvatar}|getImageEl|imageEl|HTMLImageElement`, "i"), evidence: "image element evidence was detected." },
    { signal: "data-scope-part", pattern: new RegExp(`${zagAvatar}|data-scope\\s*=\\s*["']avatar|data-part\\s*=\\s*["'](?:root|image|fallback)|\\[data-scope=avatar\\]\\[data-part=image\\]`, "i"), evidence: "data scope/part evidence was detected." },
    { signal: "data-state", pattern: new RegExp(`${zagAvatar}|data-state|state\\.matches`, "i"), evidence: "data-state evidence was detected." },
    { signal: "hidden", pattern: new RegExp(`${zagAvatar}|hidden\\b|api\\.loaded`, "i"), evidence: "hidden visibility evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function avatarReadinessApiSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["apiSignals"] {
  const zagAvatar = avatarReadinessZagAvatarUsagePattern(sourceFiles);
  const specs: Array<{ signal: AvatarReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "loaded", pattern: new RegExp(`${zagAvatar}|api\\.loaded|loaded\\b|state\\.matches\\(["']loaded["']\\)`, "i"), evidence: "loaded API evidence was detected." },
    { signal: "set-src", pattern: new RegExp(`${zagAvatar}|setSrc`, "i"), evidence: "setSrc API evidence was detected." },
    { signal: "set-loaded", pattern: new RegExp(`${zagAvatar}|setLoaded`, "i"), evidence: "setLoaded API evidence was detected." },
    { signal: "set-error", pattern: new RegExp(`${zagAvatar}|setError`, "i"), evidence: "setError API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagAvatar}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "image-props", pattern: new RegExp(`${zagAvatar}|getImageProps`, "i"), evidence: "image props API evidence was detected." },
    { signal: "fallback-props", pattern: new RegExp(`${zagAvatar}|getFallbackProps`, "i"), evidence: "fallback props API evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function avatarReadinessTestSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["testSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "axe", pattern: /vitest-axe|axe\(|toHaveNoViolations/i, evidence: "axe test evidence was detected." },
    { signal: "wait-for", pattern: /waitFor|findByRole|findByAltText/i, evidence: "waitFor/find evidence was detected." },
    { signal: "role-test", pattern: /getByRole\(["']img|findByRole\(["']img|queryByRole\(["']img/i, evidence: "role test evidence was detected." },
    { signal: "fallback-test", pattern: /Fallback|fallback|queryByText|toHaveTextContent|delayMs/i, evidence: "fallback test evidence was detected." },
    { signal: "ssr-test", pattern: /renderToString|hydrate|SSR|react-dom\/server/i, evidence: "SSR test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|avatar-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function avatarReadinessPackageSignals(sourceFiles: AvatarReadinessSourceFile[]): AvatarReadinessReport["packageSignals"] {
  const specs: Array<{ signal: AvatarReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-avatar", pattern: /@radix-ui\/react-avatar/i, evidence: "@radix-ui/react-avatar dependency evidence was detected." },
    { signal: "@zag-js/avatar", pattern: /@zag-js\/avatar/i, evidence: "@zag-js/avatar dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|observeAttributes|observeChildren/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|DirectionProperty/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createSplitProps/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return avatarReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function avatarReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: AvatarReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/avatar-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
