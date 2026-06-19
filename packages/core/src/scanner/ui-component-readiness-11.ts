import path from "node:path";
import type { CarouselReadinessReport, TreeViewReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildCarouselReadinessReport(walk: WalkResult): Promise<CarouselReadinessReport> {
  const sourceFiles = await carouselReadinessSourceFiles(walk);
  const carouselSetups = carouselReadinessSetups(sourceFiles);
  const frameworkSignals = carouselReadinessFrameworkSignals(sourceFiles);
  const structureSignals = carouselReadinessStructureSignals(sourceFiles);
  const stateSignals = carouselReadinessStateSignals(sourceFiles);
  const snapSignals = carouselReadinessSnapSignals(sourceFiles);
  const interactionSignals = carouselReadinessInteractionSignals(sourceFiles);
  const autoplaySignals = carouselReadinessAutoplaySignals(sourceFiles);
  const accessibilitySignals = carouselReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = carouselReadinessMachineSignals(sourceFiles);
  const computedSignals = carouselReadinessComputedSignals(sourceFiles);
  const effectSignals = carouselReadinessEffectSignals(sourceFiles);
  const actionSignals = carouselReadinessActionSignals(sourceFiles);
  const guardSignals = carouselReadinessGuardSignals(sourceFiles);
  const domSignals = carouselReadinessDomSignals(sourceFiles);
  const apiSignals = carouselReadinessApiSignals(sourceFiles);
  const testSignals = carouselReadinessTestSignals(sourceFiles);
  const packageSignals = carouselReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || carouselSetups.some((item) => item.rootCount > 0 && item.itemGroupCount > 0 && item.itemCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || carouselSetups.some((item) => item.scrollCount > 0);
  const hasSnap = snapSignals.some((item) => item.readiness === "ready") || carouselSetups.some((item) => item.snapCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || carouselSetups.some((item) => item.scrollCount > 0 || item.dragCount > 0);
  const hasAutoplay = autoplaySignals.some((item) => item.readiness === "ready") || carouselSetups.some((item) => item.autoplayCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || carouselSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || carouselSetups.some((item) => item.testCount > 0);

  const riskQueue: CarouselReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document carousel root, item group, slides, controls, indicators, autoplay trigger, and progress text before claiming carousel readiness.",
      why: "Carousel readiness starts with traceable carousel anatomy and ownership of slide controls.",
      relatedHref: "html/carousel-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace page, pageSnapPoints, isInView, canScrollNext, canScrollPrev, isPlaying, isDragging, and loop state.",
      why: "Carousel UI can render while current-page and scrollability state drift from visible slide state.",
      relatedHref: "html/carousel-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasSnap) {
    riskQueue.push({
      priority: "high",
      action: "Trace scroll-snap, snap points, slidesPerPage, slidesPerMove, autoSize, spacing, and orientation configuration.",
      why: "Carousel correctness depends on predictable snap points and slide sizing across viewport changes.",
      relatedHref: "html/carousel-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Trace scrollNext, scrollPrev, scrollTo, scrollToIndex, indicator clicks, keyboard, wheel, touch, and mouse drag paths.",
      why: "Carousel users need equivalent pointer, keyboard, and programmatic navigation paths.",
      relatedHref: "html/carousel-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasAutoplay) {
    riskQueue.push({
      priority: "medium",
      action: "Trace autoplay, play, pause, tick, interval, visibility pause, and autoplay-status callbacks.",
      why: "Autoplay should be explicit, pausable, and observable instead of hidden in timers.",
      relatedHref: "html/carousel-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify region, carousel/slide roledescription, aria-live, aria-label, aria-hidden, aria-controls, and current indicator semantics.",
      why: "Carousel slides and controls should be keyboard/screen-reader discoverable without noisy announcements.",
      relatedHref: "html/carousel-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, keyboard, autoplay, drag, and artifact tests for carousel navigation traces.",
      why: "Static carousel evidence does not prove snap behavior, autoplay timing, drag boundaries, or accessibility assertions.",
      relatedHref: "html/carousel-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual snap positions, drag gestures, autoplay timers, intersection/resize observers, and keyboard behavior with trusted tests outside RepoTutor.",
    why: "RepoTutor records carousel readiness only; it does not scroll real DOM, drag pointers, observe intersections/resizes, advance autoplay intervals, focus indicators, or run analyzed project tests.",
    relatedHref: "html/carousel-readiness.html"
  });

  return {
    summary: `Carousel readiness report: setup ${carouselSetups.length} files, structure signal ${structureSignals.length}, snap signal ${snapSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Carousel readiness Zag carousel slides snap autoplay drag scroll indicators accessibility tests",
    carouselSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    snapSignals,
    interactionSignals,
    autoplaySignals,
    accessibilitySignals,
    machineSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    guardSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/carousel|carousel\\.machine|carousel\\.connect|getRootProps|getItemGroupProps|getItemProps\" package.json src app packages", purpose: "Find Zag carousel machine, connect API, root, item group, and slide props." },
      { command: "rg \"scrollNext|scrollPrev|scrollToIndex|PAGE\\.NEXT|PAGE\\.PREV|PAGE\\.SET|SNAP\\.REFRESH|pageSnapPoints\" src app packages", purpose: "Trace page navigation events, snap refresh, and scroll APIs." },
      { command: "rg \"autoplay|play\\(|pause\\(|AUTOPLAY\\.TICK|visibilitychange|allowMouseDrag|drag|wheel|touch\" src app packages", purpose: "Check autoplay controls, visibility pause, pointer drag, wheel, and touch paths." },
      { command: "rg \"aria-roledescription|aria-live|aria-hidden|aria-controls|data-current|carousel-traces|upload-artifact\" src app packages test tests .github", purpose: "Check carousel accessibility semantics, test traces, and artifact uploads." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag carousel, native scroll-snap carousel markup, or a custom slide controller.",
      "Trace root, item group, slides, controls, prev/next triggers, indicators, autoplay trigger, and progress text structure before reviewing behavior.",
      "Map page, pageSnapPoints, slides in view, canScrollNext/canScrollPrev, playing/dragging state, loop, snap sizing, and orientation.",
      "Check scrollNext/scrollPrev/scrollTo/scrollToIndex, indicator click, keyboard, wheel, touch, mouse drag, autoplay play/pause/tick, visibility, ARIA, and tests.",
      "This report is static readiness. Actual snap positions, drag gestures, observer updates, autoplay timers, and project tests need trusted QA."
    ]
  };
}

type CarouselReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function carouselReadinessSourceFiles(walk: WalkResult): Promise<CarouselReadinessSourceFile[]> {
  const files: CarouselReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !carouselReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!carouselReadinessPathSignal(file.relPath) && !carouselReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function carouselReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return carouselReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css|scss)$/i.test(filePath);
}

function carouselReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(carousel|slider|slideshow|gallery|rotator|hero-slider)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function carouselReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/carousel|carousel\.machine|carousel\.connect|getItemGroupProps|getAutoplayTriggerProps|data-carousel-root|aria-roledescription=['"]carousel|scroll-snap-type|carousel-traces|PAGE\.NEXT)/i.test(text);
}

function carouselReadinessSetups(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["carouselSetups"] {
  const rows: CarouselReadinessReport["carouselSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(carousel\.machine|carousel\.connect|getRootProps|data-carousel-root|aria-roledescription=['"]carousel|carousel root)/gi);
    const itemGroupCount = countMatches(source.text, /(getItemGroupProps|data-carousel-item-group|aria-live|item group|itemGroup)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|data-carousel-item|role=['"]group|aria-roledescription=['"]slide|Slide\s+\{?|data-inview|isInView)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|data-carousel-control|control props|carousel-control)/gi);
    const triggerCount = countMatches(source.text, /(getPrevTriggerProps|getNextTriggerProps|getAutoplayTriggerProps|data-prev-trigger|data-next-trigger|data-autoplay-trigger|Previous slide|Next slide|Autoplay)/gi);
    const indicatorCount = countMatches(source.text, /(getIndicatorGroupProps|getIndicatorProps|data-indicator-group|data-indicator|indicator|Go to slide|data-current)/gi);
    const autoplayCount = countMatches(source.text, /(autoplay|AUTOPLAY\.START|AUTOPLAY\.PAUSE|AUTOPLAY\.TICK|play\(|pause\(|interval|visibilitychange|onAutoplayStatusChange|data-pressed)/gi);
    const snapCount = countMatches(source.text, /(scroll-snap-type|scrollSnapType|scrollSnapAlign|snapType|SNAP\.REFRESH|pageSnapPoints|snap points|getScrollSnapPositions|slidesPerPage|slidesPerMove|autoSize|spacing|orientation|mandatory)/gi);
    const scrollCount = countMatches(source.text, /(scrollNext|scrollPrev|scrollToIndex|scrollTo\(|PAGE\.NEXT|PAGE\.PREV|PAGE\.SET|PAGE\.SCROLL|SCROLL\.END|canScrollNext|canScrollPrev|scrollSlides|trackScroll|scrollToPage)/gi);
    const dragCount = countMatches(source.text, /(allowMouseDrag|DRAGGING\.START|DRAGGING\.END|DRAGGING|drag|mouse|pointer|touch|trackPointerMove|invokeDragging)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]region|aria-roledescription=['"]carousel|aria-roledescription=['"]slide|aria-live|aria-label|aria-hidden|aria-controls|data-current|getByRole)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|user\.keyboard|click-test|keyboard-test|autoplay-test|drag-test|carousel-traces|upload-artifact)/gi);
    const total = rootCount + itemGroupCount + itemCount + controlCount + triggerCount + indicatorCount + autoplayCount + snapCount + scrollCount + dragCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && itemGroupCount > 0 && itemCount > 0 && controlCount > 0 && triggerCount > 0 && indicatorCount > 0 && autoplayCount > 0 && snapCount > 0 && scrollCount > 0 && dragCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: carouselReadinessFramework(source),
      rootCount,
      itemGroupCount,
      itemCount,
      controlCount,
      triggerCount,
      indicatorCount,
      autoplayCount,
      snapCount,
      scrollCount,
      dragCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, item group ${itemGroupCount}, item ${itemCount}, control ${controlCount}, trigger ${triggerCount}, indicator ${indicatorCount}, autoplay ${autoplayCount}, snap ${snapCount}, scroll ${scrollCount}, drag ${dragCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.snapCount + b.scrollCount + b.autoplayCount + b.accessibilityCount - (a.snapCount + a.scrollCount + a.autoplayCount + a.accessibilityCount));
}

function carouselReadinessFramework(source: CarouselReadinessSourceFile): CarouselReadinessReport["carouselSetups"][number]["framework"] {
  if (/@zag-js\/carousel|carousel\.machine|carousel\.connect|getItemGroupProps|getAutoplayTriggerProps/i.test(source.text)) return "zag-carousel";
  if (/data-carousel-root|aria-roledescription=['"]carousel|scroll-snap-type|scrollSnapType|data-indicator/i.test(source.text)) return "native-carousel";
  if (/carousel|slider|slideshow|gallery|rotator/i.test(source.text)) return "custom";
  return "unknown";
}

function carouselReadinessFrameworkSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-carousel", pattern: /@zag-js\/carousel|carousel\.machine|carousel\.connect|getItemGroupProps|getAutoplayTriggerProps/i, evidence: "Zag carousel evidence was detected." },
    { signal: "native-carousel", pattern: /data-carousel-root|aria-roledescription=['"]carousel|scroll-snap-type|scrollSnapType|data-indicator/i, evidence: "native carousel evidence was detected." },
    { signal: "custom", pattern: /carousel|slider|slideshow|gallery|rotator/i, evidence: "custom carousel evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function carouselReadinessStructureSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["structureSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-carousel-root|carousel\.machine|aria-roledescription=['"]carousel/i, evidence: "root evidence was detected." },
    { signal: "item-group", pattern: /getItemGroupProps|data-carousel-item-group|aria-live|itemGroup/i, evidence: "item group evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-carousel-item|role=['"]group|aria-roledescription=['"]slide/i, evidence: "item evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-carousel-control/i, evidence: "control evidence was detected." },
    { signal: "prev-trigger", pattern: /getPrevTriggerProps|data-prev-trigger|PAGE\.PREV|Previous/i, evidence: "previous trigger evidence was detected." },
    { signal: "next-trigger", pattern: /getNextTriggerProps|data-next-trigger|PAGE\.NEXT|Next/i, evidence: "next trigger evidence was detected." },
    { signal: "indicator-group", pattern: /getIndicatorGroupProps|data-indicator-group/i, evidence: "indicator group evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|data-indicator|Go to slide|data-current/i, evidence: "indicator evidence was detected." },
    { signal: "autoplay-trigger", pattern: /getAutoplayTriggerProps|data-autoplay-trigger|Autoplay|data-pressed/i, evidence: "autoplay trigger evidence was detected." },
    { signal: "progress-text", pattern: /getProgressTextProps|getProgressText|data-progress-text|progress text/i, evidence: "progress text evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function carouselReadinessStateSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["stateSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "page", pattern: /\bpage\b|defaultPage|PAGE\.SET|api\.page/i, evidence: "page evidence was detected." },
    { signal: "page-snap-points", pattern: /pageSnapPoints|snap points|findSnapPoint|getScrollSnapPositions/i, evidence: "page snap points evidence was detected." },
    { signal: "slides-in-view", pattern: /isInView|data-inview|trackSlideIntersections|inViewThreshold/i, evidence: "slides-in-view evidence was detected." },
    { signal: "can-scroll-next-prev", pattern: /canScrollNext|canScrollPrev/i, evidence: "canScroll next/previous evidence was detected." },
    { signal: "is-playing", pattern: /isPlaying|data-pressed|autoplay status/i, evidence: "isPlaying evidence was detected." },
    { signal: "is-dragging", pattern: /isDragging|DRAGGING|drag status/i, evidence: "isDragging evidence was detected." },
    { signal: "loop", pattern: /\bloop\b/i, evidence: "loop evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function carouselReadinessSnapSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["snapSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["snapSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "scroll-snap", pattern: /scroll-snap-type|scrollSnapType|scrollSnapAlign|snapType/i, evidence: "scroll snap evidence was detected." },
    { signal: "snap-points", pattern: /SNAP\.REFRESH|pageSnapPoints|snap points|setSnapPoints|getScrollSnapPositions|findSnapPoint/i, evidence: "snap points evidence was detected." },
    { signal: "slides-per-page", pattern: /slidesPerPage/i, evidence: "slidesPerPage evidence was detected." },
    { signal: "slides-per-move", pattern: /slidesPerMove/i, evidence: "slidesPerMove evidence was detected." },
    { signal: "auto-size", pattern: /autoSize|trackSlideResize|autoUpdateSlide/i, evidence: "autoSize evidence was detected." },
    { signal: "spacing", pattern: /spacing|scrollPadding|padding/i, evidence: "spacing evidence was detected." },
    { signal: "orientation", pattern: /orientation|horizontal|vertical/i, evidence: "orientation evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "snap", "signal");
}

function carouselReadinessInteractionSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "scroll-next", pattern: /scrollNext|PAGE\.NEXT|getNextTriggerProps|Next slide/i, evidence: "scrollNext evidence was detected." },
    { signal: "scroll-prev", pattern: /scrollPrev|PAGE\.PREV|getPrevTriggerProps|Previous slide/i, evidence: "scrollPrev evidence was detected." },
    { signal: "scroll-to", pattern: /scrollTo\(|PAGE\.SET|scrollToPage/i, evidence: "scrollTo evidence was detected." },
    { signal: "scroll-to-index", pattern: /scrollToIndex|INDEX\.SET/i, evidence: "scrollToIndex evidence was detected." },
    { signal: "indicator-click", pattern: /getIndicatorProps|data-indicator|indicator click|Go to slide|user\.click|click-test/i, evidence: "indicator click evidence was detected." },
    { signal: "keyboard", pattern: /trackKeyboardScroll|onKeyDown|ArrowRight|ArrowLeft|Home|End|user\.keyboard|keyboard-test/i, evidence: "keyboard evidence was detected." },
    { signal: "wheel", pattern: /\bwheel\b|wheel event/i, evidence: "wheel evidence was detected." },
    { signal: "touch", pattern: /\btouch\b|touchstart|touchmove|pointer/i, evidence: "touch evidence was detected." },
    { signal: "mouse-drag", pattern: /allowMouseDrag|mouse|drag|DRAGGING|trackPointerMove|drag-test/i, evidence: "mouse drag evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function carouselReadinessAutoplaySignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["autoplaySignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["autoplaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "autoplay", pattern: /autoplay|AUTOPLAY\.START|getAutoplayTriggerProps/i, evidence: "autoplay evidence was detected." },
    { signal: "play", pattern: /\.play\(|\bplay\b|AUTOPLAY\.START/i, evidence: "play evidence was detected." },
    { signal: "pause", pattern: /\.pause\(|\bpause\b|AUTOPLAY\.PAUSE/i, evidence: "pause evidence was detected." },
    { signal: "tick", pattern: /AUTOPLAY\.TICK|\btick\b|advanceTimersByTime/i, evidence: "tick evidence was detected." },
    { signal: "interval", pattern: /\binterval\b|delay|setInterval|advanceTimersByTime/i, evidence: "interval evidence was detected." },
    { signal: "visibility", pattern: /visibilitychange|trackDocumentVisibility|visibility/i, evidence: "visibility evidence was detected." },
    { signal: "autoplay-status", pattern: /onAutoplayStatusChange|autoplay status|isPlaying|data-pressed/i, evidence: "autoplay status evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "autoplay", "signal");
}

function carouselReadinessAccessibilitySignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "region", pattern: /role=['"]region|getByRole\(['"]region/i, evidence: "region evidence was detected." },
    { signal: "carousel-roledescription", pattern: /aria-roledescription=['"]carousel|roledescription.+carousel/i, evidence: "carousel roledescription evidence was detected." },
    { signal: "slide-roledescription", pattern: /aria-roledescription=['"]slide|roledescription.+slide/i, evidence: "slide roledescription evidence was detected." },
    { signal: "aria-live", pattern: /aria-live/i, evidence: "aria-live evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden/i, evidence: "aria-hidden evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "data-current", pattern: /data-current|aria-current/i, evidence: "current indicator evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function carouselReadinessMachineSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["machineSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<CarouselSchema>|createMachine|carousel\.machine/i, evidence: "createMachine evidence was detected." },
    { signal: "ensure-slide-count", pattern: /ensureProps[\s\S]{0,100}slideCount|slideCount/i, evidence: "slideCount requirement evidence was detected." },
    { signal: "default-page", pattern: /defaultPage/i, evidence: "defaultPage evidence was detected." },
    { signal: "orientation-default", pattern: /orientation:\s*["']horizontal|orientation/i, evidence: "orientation default evidence was detected." },
    { signal: "snap-type-default", pattern: /snapType:\s*["']mandatory|snapType|mandatory/i, evidence: "snap type default evidence was detected." },
    { signal: "loop-autoplay-default", pattern: /loop:\s*!!props\.autoplay|loop[\s\S]{0,120}autoplay/i, evidence: "loop autoplay default evidence was detected." },
    { signal: "slides-per-page", pattern: /slidesPerPage/i, evidence: "slidesPerPage evidence was detected." },
    { signal: "slides-per-move", pattern: /slidesPerMove/i, evidence: "slidesPerMove evidence was detected." },
    { signal: "autoplay-default", pattern: /autoplay:\s*false|autoplay/i, evidence: "autoplay default evidence was detected." },
    { signal: "allow-mouse-drag-default", pattern: /allowMouseDrag/i, evidence: "allowMouseDrag evidence was detected." },
    { signal: "in-view-threshold", pattern: /inViewThreshold/i, evidence: "inViewThreshold evidence was detected." },
    { signal: "auto-size-default", pattern: /autoSize/i, evidence: "autoSize evidence was detected." },
    { signal: "idle-state", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "focus-state", pattern: /\bfocus\b|VIEWPORT\.FOCUS/i, evidence: "focus state evidence was detected." },
    { signal: "dragging-state", pattern: /\bdragging\b|DRAGGING/i, evidence: "dragging state evidence was detected." },
    { signal: "settling-state", pattern: /\bsettling\b/i, evidence: "settling state evidence was detected." },
    { signal: "user-scroll-state", pattern: /userScroll|USER\.SCROLL/i, evidence: "userScroll state evidence was detected." },
    { signal: "autoplay-state", pattern: /\bautoplay\b|AUTOPLAY\.START/i, evidence: "autoplay state evidence was detected." },
    { signal: "page-next-event", pattern: /PAGE\.NEXT/i, evidence: "PAGE.NEXT evidence was detected." },
    { signal: "page-prev-event", pattern: /PAGE\.PREV/i, evidence: "PAGE.PREV evidence was detected." },
    { signal: "page-set-event", pattern: /PAGE\.SET/i, evidence: "PAGE.SET evidence was detected." },
    { signal: "index-set-event", pattern: /INDEX\.SET/i, evidence: "INDEX.SET evidence was detected." },
    { signal: "snap-refresh-event", pattern: /SNAP\.REFRESH/i, evidence: "SNAP.REFRESH evidence was detected." },
    { signal: "page-scroll-event", pattern: /PAGE\.SCROLL/i, evidence: "PAGE.SCROLL evidence was detected." },
    { signal: "dragging-events", pattern: /DRAGGING\.START|DRAGGING\.END|\bDRAGGING\b/i, evidence: "dragging event evidence was detected." },
    { signal: "autoplay-events", pattern: /AUTOPLAY\.START|AUTOPLAY\.PAUSE|AUTOPLAY\.TICK/i, evidence: "autoplay event evidence was detected." },
    { signal: "viewport-events", pattern: /VIEWPORT\.FOCUS|VIEWPORT\.BLUR/i, evidence: "viewport event evidence was detected." },
    { signal: "scroll-end-event", pattern: /SCROLL\.END/i, evidence: "SCROLL.END evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function carouselReadinessComputedSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["computedSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-rtl", pattern: /isRtl/i, evidence: "isRtl computed evidence was detected." },
    { signal: "is-horizontal", pattern: /isHorizontal/i, evidence: "isHorizontal computed evidence was detected." },
    { signal: "can-scroll-next", pattern: /canScrollNext/i, evidence: "canScrollNext computed evidence was detected." },
    { signal: "can-scroll-prev", pattern: /canScrollPrev/i, evidence: "canScrollPrev computed evidence was detected." },
    { signal: "autoplay-interval", pattern: /autoplayInterval|delay|4000/i, evidence: "autoplayInterval computed evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function carouselReadinessEffectSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["effectSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-slide-mutation", pattern: /trackSlideMutation|MutationObserver/i, evidence: "trackSlideMutation effect evidence was detected." },
    { signal: "track-slide-intersections", pattern: /trackSlideIntersections|IntersectionObserver/i, evidence: "trackSlideIntersections effect evidence was detected." },
    { signal: "track-slide-resize", pattern: /trackSlideResize|resizeObserverBorderBox/i, evidence: "trackSlideResize effect evidence was detected." },
    { signal: "track-scroll", pattern: /trackScroll|addDomEvent[\s\S]{0,80}scroll/i, evidence: "trackScroll effect evidence was detected." },
    { signal: "track-settling-scroll", pattern: /trackSettlingScroll/i, evidence: "trackSettlingScroll effect evidence was detected." },
    { signal: "track-document-visibility", pattern: /trackDocumentVisibility|visibilitychange/i, evidence: "trackDocumentVisibility effect evidence was detected." },
    { signal: "track-pointer-move", pattern: /trackPointerMove/i, evidence: "trackPointerMove effect evidence was detected." },
    { signal: "track-keyboard-scroll", pattern: /trackKeyboardScroll|keydown/i, evidence: "trackKeyboardScroll effect evidence was detected." },
    { signal: "auto-update-slide", pattern: /autoUpdateSlide|setInterval|clearInterval/i, evidence: "autoUpdateSlide effect evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function carouselReadinessActionSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["actionSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "clear-scroll-end-timer", pattern: /clearScrollEndTimer/i, evidence: "clearScrollEndTimer action evidence was detected." },
    { signal: "scroll-to-page", pattern: /scrollToPage\b/i, evidence: "scrollToPage action evidence was detected." },
    { signal: "scroll-if-drifted", pattern: /scrollToPageIfDrifted|DRIFT_THRESHOLD/i, evidence: "scroll drift action evidence was detected." },
    { signal: "set-closest-page", pattern: /setClosestPage/i, evidence: "setClosestPage action evidence was detected." },
    { signal: "set-next-page", pattern: /setNextPage/i, evidence: "setNextPage action evidence was detected." },
    { signal: "set-prev-page", pattern: /setPrevPage/i, evidence: "setPrevPage action evidence was detected." },
    { signal: "set-matching-page", pattern: /setMatchingPage|findSnapPoint/i, evidence: "setMatchingPage action evidence was detected." },
    { signal: "set-page", pattern: /\bsetPage\b|context\.set\(["']page/i, evidence: "setPage action evidence was detected." },
    { signal: "set-snap-points", pattern: /setSnapPoints|getScrollSnapPositions/i, evidence: "setSnapPoints action evidence was detected." },
    { signal: "disable-scroll-snap", pattern: /disableScrollSnap|scroll-snap-type/i, evidence: "disableScrollSnap action evidence was detected." },
    { signal: "scroll-slides", pattern: /scrollSlides|scrollBy/i, evidence: "scrollSlides action evidence was detected." },
    { signal: "end-dragging", pattern: /endDragging/i, evidence: "endDragging action evidence was detected." },
    { signal: "focus-indicator", pattern: /focusIndicatorEl|getIndicatorEl/i, evidence: "focusIndicatorEl action evidence was detected." },
    { signal: "invoke-drag-start", pattern: /invokeDragStart/i, evidence: "invokeDragStart action evidence was detected." },
    { signal: "invoke-dragging", pattern: /invokeDragging\b/i, evidence: "invokeDragging action evidence was detected." },
    { signal: "invoke-dragging-end", pattern: /invokeDraggingEnd/i, evidence: "invokeDraggingEnd action evidence was detected." },
    { signal: "invoke-autoplay", pattern: /invokeAutoplay\b/i, evidence: "invokeAutoplay action evidence was detected." },
    { signal: "invoke-autoplay-start", pattern: /invokeAutoplayStart/i, evidence: "invokeAutoplayStart action evidence was detected." },
    { signal: "invoke-autoplay-end", pattern: /invokeAutoplayEnd/i, evidence: "invokeAutoplayEnd action evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function carouselReadinessGuardSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["guardSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-focused", pattern: /isFocused|isActiveElement/i, evidence: "isFocused guard evidence was detected." },
    { signal: "can-scroll-next", pattern: /canScrollNext/i, evidence: "canScrollNext guard evidence was detected." },
    { signal: "can-scroll-prev", pattern: /canScrollPrev/i, evidence: "canScrollPrev guard evidence was detected." },
    { signal: "loop-mode", pattern: /\bloop\b|state\.matches\(["']autoplay/i, evidence: "loop mode evidence was detected." },
    { signal: "drift-threshold", pattern: /DRIFT_THRESHOLD|Math\.abs/i, evidence: "drift threshold evidence was detected." },
    { signal: "clamp-page", pattern: /clampValue|pageSnapPoints/i, evidence: "clamp page evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function carouselReadinessDomSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["domSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|carousel-root|getRootProps/i, evidence: "root id evidence was detected." },
    { signal: "item-id", pattern: /getItemId|carousel-item|getItemProps/i, evidence: "item id evidence was detected." },
    { signal: "item-group-id", pattern: /getItemGroupId|carousel-item-group|getItemGroupProps/i, evidence: "item group id evidence was detected." },
    { signal: "next-trigger-id", pattern: /getNextTriggerId|carousel-next|getNextTriggerProps/i, evidence: "next trigger id evidence was detected." },
    { signal: "prev-trigger-id", pattern: /getPrevTriggerId|carousel-prev|getPrevTriggerProps/i, evidence: "previous trigger id evidence was detected." },
    { signal: "indicator-group-id", pattern: /getIndicatorGroupId|carousel-indicators|getIndicatorGroupProps/i, evidence: "indicator group id evidence was detected." },
    { signal: "indicator-id", pattern: /getIndicatorId|carousel-indicator|getIndicatorProps/i, evidence: "indicator id evidence was detected." },
    { signal: "root-el", pattern: /getRootEl/i, evidence: "root element evidence was detected." },
    { signal: "item-group-el", pattern: /getItemGroupEl/i, evidence: "item group element evidence was detected." },
    { signal: "item-el", pattern: /getItemEl\b/i, evidence: "item element evidence was detected." },
    { signal: "item-els", pattern: /getItemEls|queryAll/i, evidence: "item elements evidence was detected." },
    { signal: "indicator-el", pattern: /getIndicatorEl/i, evidence: "indicator element evidence was detected." },
    { signal: "sync-tab-index", pattern: /syncTabIndex|getTabbables|tabindex/i, evidence: "syncTabIndex evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function carouselReadinessApiSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["apiSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-playing", pattern: /api\.isPlaying|isPlaying/i, evidence: "isPlaying API evidence was detected." },
    { signal: "is-dragging", pattern: /api\.isDragging|isDragging/i, evidence: "isDragging API evidence was detected." },
    { signal: "page", pattern: /api\.page|\bpage\b/i, evidence: "page API evidence was detected." },
    { signal: "page-snap-points", pattern: /api\.pageSnapPoints|pageSnapPoints/i, evidence: "pageSnapPoints API evidence was detected." },
    { signal: "can-scroll-next", pattern: /api\.canScrollNext|canScrollNext/i, evidence: "canScrollNext API evidence was detected." },
    { signal: "can-scroll-prev", pattern: /api\.canScrollPrev|canScrollPrev/i, evidence: "canScrollPrev API evidence was detected." },
    { signal: "progress", pattern: /getProgress\(\)|api\.getProgress|progress/i, evidence: "progress API evidence was detected." },
    { signal: "progress-text", pattern: /getProgressText|progressText/i, evidence: "progress text API evidence was detected." },
    { signal: "scroll-to-index", pattern: /scrollToIndex/i, evidence: "scrollToIndex API evidence was detected." },
    { signal: "scroll-to", pattern: /scrollTo\(/i, evidence: "scrollTo API evidence was detected." },
    { signal: "scroll-next", pattern: /scrollNext/i, evidence: "scrollNext API evidence was detected." },
    { signal: "scroll-prev", pattern: /scrollPrev/i, evidence: "scrollPrev API evidence was detected." },
    { signal: "play", pattern: /api\.play|play\(\)/i, evidence: "play API evidence was detected." },
    { signal: "pause", pattern: /api\.pause|pause\(\)/i, evidence: "pause API evidence was detected." },
    { signal: "is-in-view", pattern: /isInView/i, evidence: "isInView API evidence was detected." },
    { signal: "refresh", pattern: /refresh\(\)|SNAP\.REFRESH/i, evidence: "refresh API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props evidence was detected." },
    { signal: "item-group-props", pattern: /getItemGroupProps/i, evidence: "item group props evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props evidence was detected." },
    { signal: "prev-trigger-props", pattern: /getPrevTriggerProps/i, evidence: "previous trigger props evidence was detected." },
    { signal: "next-trigger-props", pattern: /getNextTriggerProps/i, evidence: "next trigger props evidence was detected." },
    { signal: "indicator-group-props", pattern: /getIndicatorGroupProps/i, evidence: "indicator group props evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps/i, evidence: "indicator props evidence was detected." },
    { signal: "autoplay-trigger-props", pattern: /getAutoplayTriggerProps/i, evidence: "autoplay trigger props evidence was detected." },
    { signal: "progress-text-props", pattern: /getProgressTextProps/i, evidence: "progress text props evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function carouselReadinessTestSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["testSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /user\.click|click-test|Next slide|Previous slide/i, evidence: "click test evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|keyboard-test|ArrowRight|ArrowLeft|Home|End/i, evidence: "keyboard test evidence was detected." },
    { signal: "autoplay-test", pattern: /autoplay-test|advanceTimersByTime|fake timers|vi\.useFakeTimers/i, evidence: "autoplay test evidence was detected." },
    { signal: "drag-test", pattern: /drag-test|DRAGGING|allowMouseDrag|pointer|mouse/i, evidence: "drag test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|carousel-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function carouselReadinessPackageSignals(sourceFiles: CarouselReadinessSourceFile[]): CarouselReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CarouselReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/carousel", pattern: /@zag-js\/carousel/i, evidence: "@zag-js/carousel dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/scroll-snap", pattern: /@zag-js\/scroll-snap/i, evidence: "@zag-js/scroll-snap dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return carouselReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function carouselReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CarouselReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/carousel-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildTreeViewReadinessReport(walk: WalkResult): Promise<TreeViewReadinessReport> {
  const sourceFiles = await treeViewReadinessSourceFiles(walk);
  const treeViewSetups = treeViewReadinessSetups(sourceFiles);
  const frameworkSignals = treeViewReadinessFrameworkSignals(sourceFiles);
  const structureSignals = treeViewReadinessStructureSignals(sourceFiles);
  const stateSignals = treeViewReadinessStateSignals(sourceFiles);
  const navigationSignals = treeViewReadinessNavigationSignals(sourceFiles);
  const selectionSignals = treeViewReadinessSelectionSignals(sourceFiles);
  const loadingSignals = treeViewReadinessLoadingSignals(sourceFiles);
  const renameSignals = treeViewReadinessRenameSignals(sourceFiles);
  const accessibilitySignals = treeViewReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = treeViewReadinessMachineSignals(sourceFiles);
  const contextSignals = treeViewReadinessContextSignals(sourceFiles);
  const computedSignals = treeViewReadinessComputedSignals(sourceFiles);
  const actionSignals = treeViewReadinessActionSignals(sourceFiles);
  const guardSignals = treeViewReadinessGuardSignals(sourceFiles);
  const asyncSignals = treeViewReadinessAsyncSignals(sourceFiles);
  const domSignals = treeViewReadinessDomSignals(sourceFiles);
  const apiSignals = treeViewReadinessApiSignals(sourceFiles);
  const testSignals = treeViewReadinessTestSignals(sourceFiles);
  const packageSignals = treeViewReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || treeViewSetups.some((item) => item.rootCount > 0 && item.treeCount > 0 && item.itemCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || treeViewSetups.some((item) => item.selectionCount > 0 || item.expansionCount > 0);
  const hasNavigation = navigationSignals.some((item) => item.readiness === "ready");
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready") || treeViewSetups.some((item) => item.selectionCount > 0);
  const hasLoading = loadingSignals.some((item) => item.readiness === "ready") || treeViewSetups.some((item) => item.loadingCount > 0);
  const hasRename = renameSignals.some((item) => item.readiness === "ready") || treeViewSetups.some((item) => item.renameCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || treeViewSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || treeViewSetups.some((item) => item.testCount > 0);

  const riskQueue: TreeViewReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document tree root, label, tree role, branch, branch control, branch content, item, checkbox, and rename input structure before claiming tree-view readiness.",
      why: "Tree-view readiness starts with traceable hierarchical anatomy and ownership of node rendering.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace expandedValue, selectedValue, checkedValue, focusedValue, visibleNodes, nodeState, loadingStatus, and renamingValue.",
      why: "A tree can render while expansion, selection, check, focus, loading, and rename state diverge.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasNavigation) {
    riskQueue.push({
      priority: "high",
      action: "Trace ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Home, End, typeahead, selectParent, and expandParent navigation paths.",
      why: "Tree-view correctness depends on keyboard traversal and parent/branch navigation.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasSelection) {
    riskQueue.push({
      priority: "medium",
      action: "Trace single/multiple selection, select, deselect, select all, checked toggles, checked maps, shift selection, and ctrl/meta selection.",
      why: "Selection and checking semantics are separate in tree views and must be inspectable.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasLoading) {
    riskQueue.push({
      priority: "medium",
      action: "Trace loadChildren, loadingStatus, AbortController cancellation, load complete/error callbacks, and scrollToIndex virtualization.",
      why: "Lazy tree loading and virtualization need explicit loading and cancellation evidence.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasRename) {
    riskQueue.push({
      priority: "medium",
      action: "Trace startRenaming, submitRenaming, cancelRenaming, canRename, onBeforeRename, and rename input semantics.",
      why: "Tree item rename flows are opt-in and easy to miss in static hierarchy checks.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify tree, treeitem, group, checkbox roles plus aria-multiselectable, aria-selected, aria-expanded, aria-level, aria-checked, aria-busy, and labels.",
      why: "Hierarchical tree semantics must be screen-reader and keyboard discoverable.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, keyboard, typeahead, rename, loading, and artifact tests for tree-view traces.",
      why: "Static tree-view evidence does not prove keyboard focus, typeahead, lazy loading, rename submission, or selection behavior.",
      relatedHref: "html/tree-view-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real expansion, focus, selection, checking, lazy loading, rename submission, keyboard traversal, and virtualization with trusted tests outside RepoTutor.",
    why: "RepoTutor records tree view readiness only; it does not expand real DOM nodes, focus tree items, mutate collections, load remote children, submit rename inputs, dispatch keyboard or pointer events, or run analyzed project tests.",
    relatedHref: "html/tree-view-readiness.html"
  });

  return {
    summary: `Tree view readiness report: setup ${treeViewSetups.length} files, structure signal ${structureSignals.length}, navigation signal ${navigationSignals.length}, machine signal ${machineSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`,
    sourcePattern: "Tree view readiness Zag tree-view collection expansion selection checking rename lazy loading keyboard accessibility tests",
    treeViewSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    navigationSignals,
    selectionSignals,
    loadingSignals,
    renameSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    actionSignals,
    guardSignals,
    asyncSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/tree-view|treeView\\.machine|treeView\\.connect|getTreeProps|getBranchProps|getItemProps\" package.json src app packages", purpose: "Find Zag tree-view machine, connect API, tree, branch, and item props." },
      { command: "rg \"EXPANDED\\.SET|BRANCH\\.EXPAND|SELECTED\\.SET|CHECKED\\.TOGGLE|NODE\\.ARROW|TREE\\.TYPEAHEAD|selectParent|expandParent\" src app packages", purpose: "Trace expansion, selection, checking, keyboard, typeahead, and parent navigation paths." },
      { command: "rg \"loadChildren|loadingStatus|AbortController|onLoadChildrenComplete|onLoadChildrenError|scrollToIndexFn|startRenaming|submitRenaming|canRename|onBeforeRename\" src app packages", purpose: "Check lazy loading, cancellation, virtualization, and rename flows." },
      { command: "rg \"role=['\\\"]tree|role=['\\\"]treeitem|role=['\\\"]group|role=['\\\"]checkbox|aria-multiselectable|aria-expanded|aria-checked|tree-view-traces|upload-artifact\" src app packages test tests .github", purpose: "Check tree accessibility semantics, tests, and artifact traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag tree-view, native ARIA tree markup, or a custom hierarchical browser.",
      "Trace root, label, tree, branch, branch control, branch trigger, branch content, branch indicator, items, checkbox, and rename input structure before reviewing behavior.",
      "Map expanded, selected, checked, focused, visible node, node state, loading, renaming, keyboard, typeahead, selection, checking, lazy loading, and rename flows.",
      "Check tree/treeitem/group/checkbox roles, aria-multiselectable, selected, expanded, level, checked, busy, labels, and tests.",
      "This report is static readiness. Real expansion, focus, lazy loading, collection mutation, rename submission, keyboard traversal, virtualization, and project tests need trusted QA."
    ]
  };
}

type TreeViewReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function treeViewReadinessSourceFiles(walk: WalkResult): Promise<TreeViewReadinessSourceFile[]> {
  const files: TreeViewReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !treeViewReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!treeViewReadinessPathSignal(file.relPath) && !treeViewReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function treeViewReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return treeViewReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function treeViewReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(tree-view|treeview|tree|file-browser|outline|navigation-tree)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function treeViewReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/tree-view|treeView\.machine|treeView\.connect|getTreeProps|getBranchProps|getNodeCheckboxProps|role=['"]tree|tree-view-traces|NODE\.ARROW_DOWN)/i.test(text);
}

function treeViewReadinessSetups(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["treeViewSetups"] {
  const rows: TreeViewReadinessReport["treeViewSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(treeView\.machine|treeView\.connect|getRootProps|data-tree-view-root|tree view root)/gi);
    const treeCount = countMatches(source.text, /(getTreeProps|role=['"]tree|aria-multiselectable|treeLabel)/gi);
    const branchCount = countMatches(source.text, /(getBranchProps|getBranchContentProps|getBranchIndicatorProps|getBranchTextProps|getBranchIndentGuideProps|data-part=['"]branch|branch-control|branch-content|branch-indicator|BRANCH\.EXPAND|BRANCH\.COLLAPSE)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|getItemTextProps|getItemIndicatorProps|role=['"]treeitem|data-part=['"]item|NODE\.CLICK|treeitem)/gi);
    const controlCount = countMatches(source.text, /(getBranchControlProps|getBranchTriggerProps|BRANCH_TOGGLE\.CLICK|branch-control|branch-trigger|Toggle branch)/gi);
    const checkboxCount = countMatches(source.text, /(getNodeCheckboxProps|role=['"]checkbox|CHECKED\.TOGGLE|CHECKED\.SET|CHECKED\.CLEAR|aria-checked|checkedValue|data-indeterminate)/gi);
    const renameCount = countMatches(source.text, /(getNodeRenameInputProps|node-rename-input|startRenaming|submitRenaming|cancelRenaming|NODE\.RENAME|RENAME\.SUBMIT|RENAME\.CANCEL|canRename|onBeforeRename|onRenameComplete|rename input)/gi);
    const selectionCount = countMatches(source.text, /(selectionMode|selectedValue|SELECTED\.SET|SELECTED\.ALL|SELECTED\.CLEAR|NODE\.SELECT|NODE\.DESELECT|selectParent|select\(|deselect\(|shiftKey|ctrlKey|metaKey)/gi);
    const expansionCount = countMatches(source.text, /(expandedValue|EXPANDED\.SET|EXPANDED\.CLEAR|EXPANDED\.ALL|BRANCH\.EXPAND|BRANCH\.COLLAPSE|expandParent|expand\(|collapse\(|aria-expanded|data-state)/gi);
    const loadingCount = countMatches(source.text, /(loadChildren|loadingStatus|pendingAborts|AbortController|onLoadChildrenComplete|onLoadChildrenError|scrollToIndexFn|aria-busy|data-loading|loading-test)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]tree|role=['"]treeitem|role=['"]group|role=['"]checkbox|aria-multiselectable|aria-selected|aria-expanded|aria-level|aria-checked|aria-busy|aria-label|aria-disabled|getByRole)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|user\.keyboard|click-test|keyboard-test|typeahead-test|rename-test|loading-test|tree-view-traces|upload-artifact)/gi);
    const total = rootCount + treeCount + branchCount + itemCount + controlCount + checkboxCount + renameCount + selectionCount + expansionCount + loadingCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && treeCount > 0 && branchCount > 0 && itemCount > 0 && controlCount > 0 && checkboxCount > 0 && renameCount > 0 && selectionCount > 0 && expansionCount > 0 && loadingCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: treeViewReadinessFramework(source),
      rootCount,
      treeCount,
      branchCount,
      itemCount,
      controlCount,
      checkboxCount,
      renameCount,
      selectionCount,
      expansionCount,
      loadingCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, tree ${treeCount}, branch ${branchCount}, item ${itemCount}, control ${controlCount}, checkbox ${checkboxCount}, rename ${renameCount}, selection ${selectionCount}, expansion ${expansionCount}, loading ${loadingCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.selectionCount + b.expansionCount + b.loadingCount + b.accessibilityCount - (a.selectionCount + a.expansionCount + a.loadingCount + a.accessibilityCount));
}

function treeViewReadinessFramework(source: TreeViewReadinessSourceFile): TreeViewReadinessReport["treeViewSetups"][number]["framework"] {
  if (/@zag-js\/tree-view|treeView\.machine|treeView\.connect|getTreeProps|getBranchProps|getNodeCheckboxProps/i.test(source.text)) return "zag-tree-view";
  if (/role=['"]tree|role=['"]treeitem|aria-multiselectable|aria-expanded|aria-level/i.test(source.text)) return "native-tree";
  if (/tree-view|treeview|tree|file browser|outline/i.test(source.text)) return "custom";
  return "unknown";
}

function treeViewReadinessFrameworkSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-tree-view", pattern: /@zag-js\/tree-view|treeView\.machine|treeView\.connect|getTreeProps|getBranchProps|getNodeCheckboxProps/i, evidence: "Zag tree-view evidence was detected." },
    { signal: "native-tree", pattern: /role=['"]tree|role=['"]treeitem|aria-multiselectable|aria-expanded|aria-level/i, evidence: "native ARIA tree evidence was detected." },
    { signal: "custom", pattern: /tree-view|treeview|tree|file browser|outline/i, evidence: "custom tree evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function treeViewReadinessStructureSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["structureSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-tree-view-root|treeView\.machine/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|aria-labelledby|treeLabel|Repository tree/i, evidence: "label evidence was detected." },
    { signal: "tree", pattern: /getTreeProps|role=['"]tree/i, evidence: "tree evidence was detected." },
    { signal: "branch", pattern: /getBranchProps|data-part=['"]branch|BRANCH\.EXPAND|aria-expanded/i, evidence: "branch evidence was detected." },
    { signal: "branch-control", pattern: /getBranchControlProps|branch-control|BRANCH_NODE\.CLICK/i, evidence: "branch control evidence was detected." },
    { signal: "branch-trigger", pattern: /getBranchTriggerProps|branch-trigger|BRANCH_TOGGLE\.CLICK/i, evidence: "branch trigger evidence was detected." },
    { signal: "branch-content", pattern: /getBranchContentProps|branch-content|role=['"]group/i, evidence: "branch content evidence was detected." },
    { signal: "branch-indicator", pattern: /getBranchIndicatorProps|branch-indicator/i, evidence: "branch indicator evidence was detected." },
    { signal: "item", pattern: /getItemProps|getItemTextProps|getItemIndicatorProps|role=['"]treeitem|data-part=['"]item/i, evidence: "item evidence was detected." },
    { signal: "node-checkbox", pattern: /getNodeCheckboxProps|role=['"]checkbox|aria-checked|CHECKED\.TOGGLE/i, evidence: "node checkbox evidence was detected." },
    { signal: "node-rename-input", pattern: /getNodeRenameInputProps|node-rename-input|rename input|RENAME\.SUBMIT/i, evidence: "node rename input evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function treeViewReadinessStateSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["stateSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "expanded-value", pattern: /expandedValue|defaultExpandedValue|EXPANDED\.SET/i, evidence: "expanded value evidence was detected." },
    { signal: "selected-value", pattern: /selectedValue|defaultSelectedValue|SELECTED\.SET/i, evidence: "selected value evidence was detected." },
    { signal: "checked-value", pattern: /checkedValue|defaultCheckedValue|CHECKED\.SET/i, evidence: "checked value evidence was detected." },
    { signal: "focused-value", pattern: /focusedValue|defaultFocusedValue|NODE\.FOCUS/i, evidence: "focused value evidence was detected." },
    { signal: "visible-nodes", pattern: /visibleNodes|getVisibleNodes|computed\(["']visibleNodes/i, evidence: "visible nodes evidence was detected." },
    { signal: "node-state", pattern: /getNodeState|NodeState|data-depth|data-focus/i, evidence: "node state evidence was detected." },
    { signal: "loading-status", pattern: /loadingStatus|TreeLoadingStatus|data-loading|aria-busy/i, evidence: "loading status evidence was detected." },
    { signal: "renaming-value", pattern: /renamingValue|data-renaming|NODE\.RENAME/i, evidence: "renaming value evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function treeViewReadinessNavigationSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-down", pattern: /ArrowDown|NODE\.ARROW_DOWN|focusTreeNextNode/i, evidence: "ArrowDown evidence was detected." },
    { signal: "arrow-up", pattern: /ArrowUp|NODE\.ARROW_UP|focusTreePrevNode/i, evidence: "ArrowUp evidence was detected." },
    { signal: "arrow-left", pattern: /ArrowLeft|NODE\.ARROW_LEFT|BRANCH_NODE\.ARROW_LEFT/i, evidence: "ArrowLeft evidence was detected." },
    { signal: "arrow-right", pattern: /ArrowRight|BRANCH_NODE\.ARROW_RIGHT/i, evidence: "ArrowRight evidence was detected." },
    { signal: "home", pattern: /Home|NODE\.HOME|focusTreeFirstNode/i, evidence: "Home evidence was detected." },
    { signal: "end", pattern: /End|NODE\.END|focusTreeLastNode/i, evidence: "End evidence was detected." },
    { signal: "typeahead", pattern: /TREE\.TYPEAHEAD|getByTypeahead|typeahead|typeahead-test/i, evidence: "typeahead evidence was detected." },
    { signal: "select-parent", pattern: /selectParent|select parent/i, evidence: "select parent evidence was detected." },
    { signal: "expand-parent", pattern: /expandParent|expand parent/i, evidence: "expand parent evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function treeViewReadinessSelectionSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "single", pattern: /selectionMode.+single|single/i, evidence: "single selection evidence was detected." },
    { signal: "multiple", pattern: /selectionMode.+multiple|aria-multiselectable|multiple/i, evidence: "multiple selection evidence was detected." },
    { signal: "select", pattern: /select\(|NODE\.SELECT|SELECTED\.SET/i, evidence: "select evidence was detected." },
    { signal: "deselect", pattern: /deselect\(|NODE\.DESELECT|SELECTED\.CLEAR/i, evidence: "deselect evidence was detected." },
    { signal: "select-all", pattern: /SELECTED\.ALL|selectAllNodes/i, evidence: "select all evidence was detected." },
    { signal: "checked-toggle", pattern: /toggleChecked|CHECKED\.TOGGLE|getNodeCheckboxProps/i, evidence: "checked toggle evidence was detected." },
    { signal: "checked-map", pattern: /getCheckedMap|getCheckedValueMap|checked map/i, evidence: "checked map evidence was detected." },
    { signal: "shift-selection", pattern: /shiftKey|extendSelectionToNextNode|extendSelectionToPrevNode|shift-selection/i, evidence: "shift selection evidence was detected." },
    { signal: "ctrl-selection", pattern: /ctrlKey|metaKey|isCtrlKey|ctrl-selection|\bctrl\b|\bmeta\b/i, evidence: "ctrl/meta selection evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function treeViewReadinessLoadingSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["loadingSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["loadingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "load-children", pattern: /loadChildren/i, evidence: "loadChildren evidence was detected." },
    { signal: "loading-status", pattern: /loadingStatus|data-loading|aria-busy/i, evidence: "loading status evidence was detected." },
    { signal: "abort-controller", pattern: /AbortController|pendingAborts|signal\.aborted/i, evidence: "AbortController evidence was detected." },
    { signal: "load-complete", pattern: /onLoadChildrenComplete|LoadChildrenComplete/i, evidence: "load complete evidence was detected." },
    { signal: "load-error", pattern: /onLoadChildrenError|LoadChildrenError/i, evidence: "load error evidence was detected." },
    { signal: "scroll-to-index", pattern: /scrollToIndexFn|ScrollToIndex|getVisibleNodes/i, evidence: "scroll-to-index evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "loading", "signal");
}

function treeViewReadinessRenameSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["renameSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["renameSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "start-renaming", pattern: /startRenaming|NODE\.RENAME|onRenameStart/i, evidence: "start renaming evidence was detected." },
    { signal: "submit-renaming", pattern: /submitRenaming|RENAME\.SUBMIT|onRenameComplete/i, evidence: "submit renaming evidence was detected." },
    { signal: "cancel-renaming", pattern: /cancelRenaming|RENAME\.CANCEL/i, evidence: "cancel renaming evidence was detected." },
    { signal: "can-rename", pattern: /canRename/i, evidence: "canRename evidence was detected." },
    { signal: "before-rename", pattern: /onBeforeRename|before rename/i, evidence: "before rename evidence was detected." },
    { signal: "rename-input", pattern: /getNodeRenameInputProps|node-rename-input|renameInputLabel|Rename tree item/i, evidence: "rename input evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "rename", "signal");
}

function treeViewReadinessAccessibilitySignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tree-role", pattern: /role=['"]tree|getByRole\(['"]tree/i, evidence: "tree role evidence was detected." },
    { signal: "treeitem-role", pattern: /role=['"]treeitem|getByRole\(['"]treeitem/i, evidence: "treeitem role evidence was detected." },
    { signal: "group-role", pattern: /role=['"]group/i, evidence: "group role evidence was detected." },
    { signal: "checkbox-role", pattern: /role=['"]checkbox|aria-checked/i, evidence: "checkbox role evidence was detected." },
    { signal: "aria-multiselectable", pattern: /aria-multiselectable/i, evidence: "aria-multiselectable evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected|data-selected/i, evidence: "aria-selected evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded|data-state/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-level", pattern: /aria-level|data-depth/i, evidence: "aria-level evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked|data-indeterminate/i, evidence: "aria-checked evidence was detected." },
    { signal: "aria-busy", pattern: /aria-busy|data-loading/i, evidence: "aria-busy evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|aria-labelledby|getLabelProps/i, evidence: "aria-label evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function treeViewReadinessMachineSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["machineSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine|treeView\.machine/i, evidence: "tree-view machine creation evidence was detected." },
    { signal: "default-selection-mode", pattern: /selectionMode:\s*["']single["']|selectionMode single/i, evidence: "default single selection evidence was detected." },
    { signal: "default-collection", pattern: /collection\.empty|collection:\s*tree|default collection/i, evidence: "default tree collection evidence was detected." },
    { signal: "default-typeahead", pattern: /typeahead:\s*true|typeahead true/i, evidence: "default typeahead evidence was detected." },
    { signal: "default-expand-on-click", pattern: /expandOnClick:\s*true|expandOnClick true/i, evidence: "default expand-on-click evidence was detected." },
    { signal: "default-expanded-value", pattern: /defaultExpandedValue/i, evidence: "default expanded value evidence was detected." },
    { signal: "default-selected-value", pattern: /defaultSelectedValue/i, evidence: "default selected value evidence was detected." },
    { signal: "translation-defaults", pattern: /treeLabel|renameInputLabel|translations/i, evidence: "tree-view translation defaults evidence was detected." },
    { signal: "idle-state", pattern: /initialState\(\)[\s\S]{0,80}idle|idle/i, evidence: "idle state evidence was detected." },
    { signal: "renaming-state", pattern: /states:[\s\S]{0,400}renaming|renaming/i, evidence: "renaming state evidence was detected." },
    { signal: "expanded-set-event", pattern: /EXPANDED\.SET/i, evidence: "EXPANDED.SET evidence was detected." },
    { signal: "expanded-clear-event", pattern: /EXPANDED\.CLEAR/i, evidence: "EXPANDED.CLEAR evidence was detected." },
    { signal: "expanded-all-event", pattern: /EXPANDED\.ALL/i, evidence: "EXPANDED.ALL evidence was detected." },
    { signal: "branch-expand-event", pattern: /BRANCH\.EXPAND/i, evidence: "BRANCH.EXPAND evidence was detected." },
    { signal: "branch-collapse-event", pattern: /BRANCH\.COLLAPSE/i, evidence: "BRANCH.COLLAPSE evidence was detected." },
    { signal: "selected-set-event", pattern: /SELECTED\.SET/i, evidence: "SELECTED.SET evidence was detected." },
    { signal: "selected-all-event", pattern: /SELECTED\.ALL/i, evidence: "SELECTED.ALL evidence was detected." },
    { signal: "selected-clear-event", pattern: /SELECTED\.CLEAR/i, evidence: "SELECTED.CLEAR evidence was detected." },
    { signal: "node-select-event", pattern: /NODE\.SELECT/i, evidence: "NODE.SELECT evidence was detected." },
    { signal: "node-deselect-event", pattern: /NODE\.DESELECT/i, evidence: "NODE.DESELECT evidence was detected." },
    { signal: "checked-toggle-event", pattern: /CHECKED\.TOGGLE/i, evidence: "CHECKED.TOGGLE evidence was detected." },
    { signal: "checked-set-event", pattern: /CHECKED\.SET/i, evidence: "CHECKED.SET evidence was detected." },
    { signal: "checked-clear-event", pattern: /CHECKED\.CLEAR/i, evidence: "CHECKED.CLEAR evidence was detected." },
    { signal: "node-focus-event", pattern: /NODE\.FOCUS/i, evidence: "NODE.FOCUS evidence was detected." },
    { signal: "keyboard-navigation-events", pattern: /NODE\.ARROW_DOWN|NODE\.ARROW_UP|NODE\.HOME|NODE\.END|ArrowDown|ArrowUp|Home|End/i, evidence: "keyboard navigation event evidence was detected." },
    { signal: "branch-node-events", pattern: /BRANCH_NODE\.ARROW_LEFT|BRANCH_NODE\.ARROW_RIGHT|BRANCH_NODE\.CLICK/i, evidence: "branch node event evidence was detected." },
    { signal: "branch-toggle-click-event", pattern: /BRANCH_TOGGLE\.CLICK/i, evidence: "branch toggle click evidence was detected." },
    { signal: "tree-typeahead-event", pattern: /TREE\.TYPEAHEAD/i, evidence: "tree typeahead event evidence was detected." },
    { signal: "node-rename-event", pattern: /NODE\.RENAME/i, evidence: "node rename event evidence was detected." },
    { signal: "rename-submit-event", pattern: /RENAME\.SUBMIT/i, evidence: "rename submit event evidence was detected." },
    { signal: "rename-cancel-event", pattern: /RENAME\.CANCEL/i, evidence: "rename cancel event evidence was detected." },
    { signal: "clear-pending-aborts-exit", pattern: /exit:\s*\[\s*["']clearPendingAborts|clearPendingAborts/i, evidence: "pending abort cleanup evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function treeViewReadinessContextSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["contextSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "expanded-value", pattern: /expandedValue/i, evidence: "expanded value context evidence was detected." },
    { signal: "selected-value", pattern: /selectedValue/i, evidence: "selected value context evidence was detected." },
    { signal: "focused-value", pattern: /focusedValue/i, evidence: "focused value context evidence was detected." },
    { signal: "loading-status", pattern: /loadingStatus/i, evidence: "loading status context evidence was detected." },
    { signal: "checked-value", pattern: /checkedValue/i, evidence: "checked value context evidence was detected." },
    { signal: "renaming-value", pattern: /renamingValue/i, evidence: "renaming value context evidence was detected." },
    { signal: "typeahead-state", pattern: /typeaheadState|getByTypeahead\.defaultOptions|keysSoFar/i, evidence: "typeahead ref evidence was detected." },
    { signal: "pending-aborts", pattern: /pendingAborts|AbortController/i, evidence: "pending abort ref evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function treeViewReadinessComputedSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["computedSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-multiple-selection", pattern: /isMultipleSelection|selectionMode.+multiple/i, evidence: "multiple-selection computed evidence was detected." },
    { signal: "is-typing-ahead", pattern: /isTypingAhead|keysSoFar/i, evidence: "typing-ahead computed evidence was detected." },
    { signal: "visible-nodes", pattern: /visibleNodes|collection\.visit|getVisibleNodes/i, evidence: "visible nodes computed evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function treeViewReadinessActionSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["actionSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "select-node", pattern: /selectNode/i, evidence: "selectNode action evidence was detected." },
    { signal: "deselect-node", pattern: /deselectNode/i, evidence: "deselectNode action evidence was detected." },
    { signal: "set-focused-node", pattern: /setFocusedNode/i, evidence: "setFocusedNode action evidence was detected." },
    { signal: "toggle-branch-node", pattern: /toggleBranchNode/i, evidence: "toggleBranchNode action evidence was detected." },
    { signal: "expand-branch", pattern: /expandBranch/i, evidence: "expandBranch action evidence was detected." },
    { signal: "expand-branches", pattern: /expandBranches/i, evidence: "expandBranches action evidence was detected." },
    { signal: "collapse-branch", pattern: /collapseBranch/i, evidence: "collapseBranch action evidence was detected." },
    { signal: "collapse-branches", pattern: /collapseBranches/i, evidence: "collapseBranches action evidence was detected." },
    { signal: "set-expanded", pattern: /setExpanded/i, evidence: "setExpanded action evidence was detected." },
    { signal: "clear-expanded", pattern: /clearExpanded/i, evidence: "clearExpanded action evidence was detected." },
    { signal: "set-selected", pattern: /setSelected/i, evidence: "setSelected action evidence was detected." },
    { signal: "clear-selected", pattern: /clearSelected/i, evidence: "clearSelected action evidence was detected." },
    { signal: "focus-tree-first-node", pattern: /focusTreeFirstNode/i, evidence: "focusTreeFirstNode action evidence was detected." },
    { signal: "focus-tree-last-node", pattern: /focusTreeLastNode/i, evidence: "focusTreeLastNode action evidence was detected." },
    { signal: "focus-branch-first-node", pattern: /focusBranchFirstNode/i, evidence: "focusBranchFirstNode action evidence was detected." },
    { signal: "focus-tree-next-node", pattern: /focusTreeNextNode/i, evidence: "focusTreeNextNode action evidence was detected." },
    { signal: "focus-tree-prev-node", pattern: /focusTreePrevNode/i, evidence: "focusTreePrevNode action evidence was detected." },
    { signal: "focus-branch-node", pattern: /focusBranchNode/i, evidence: "focusBranchNode action evidence was detected." },
    { signal: "select-all-nodes", pattern: /selectAllNodes/i, evidence: "selectAllNodes action evidence was detected." },
    { signal: "focus-matched-node", pattern: /focusMatchedNode|getByTypeahead/i, evidence: "focusMatchedNode action evidence was detected." },
    { signal: "toggle-node-selection", pattern: /toggleNodeSelection/i, evidence: "toggleNodeSelection action evidence was detected." },
    { signal: "expand-all-branches", pattern: /expandAllBranches/i, evidence: "expandAllBranches action evidence was detected." },
    { signal: "expand-sibling-branches", pattern: /expandSiblingBranches/i, evidence: "expandSiblingBranches action evidence was detected." },
    { signal: "extend-selection-to-node", pattern: /extendSelectionToNode/i, evidence: "extendSelectionToNode action evidence was detected." },
    { signal: "extend-selection-to-next-node", pattern: /extendSelectionToNextNode/i, evidence: "extendSelectionToNextNode action evidence was detected." },
    { signal: "extend-selection-to-prev-node", pattern: /extendSelectionToPrevNode/i, evidence: "extendSelectionToPrevNode action evidence was detected." },
    { signal: "extend-selection-to-first-node", pattern: /extendSelectionToFirstNode/i, evidence: "extendSelectionToFirstNode action evidence was detected." },
    { signal: "extend-selection-to-last-node", pattern: /extendSelectionToLastNode/i, evidence: "extendSelectionToLastNode action evidence was detected." },
    { signal: "clear-pending-aborts", pattern: /clearPendingAborts/i, evidence: "clearPendingAborts action evidence was detected." },
    { signal: "toggle-checked", pattern: /toggleChecked|toggleBranchChecked/i, evidence: "toggle checked action evidence was detected." },
    { signal: "set-checked", pattern: /setChecked/i, evidence: "set checked action evidence was detected." },
    { signal: "clear-checked", pattern: /clearChecked/i, evidence: "clear checked action evidence was detected." },
    { signal: "set-renaming-value", pattern: /setRenamingValue/i, evidence: "setRenamingValue action evidence was detected." },
    { signal: "submit-renaming", pattern: /submitRenaming/i, evidence: "submitRenaming action evidence was detected." },
    { signal: "cancel-renaming", pattern: /cancelRenaming/i, evidence: "cancelRenaming action evidence was detected." },
    { signal: "sync-rename-input", pattern: /syncRenameInput|setElementValue/i, evidence: "syncRenameInput action evidence was detected." },
    { signal: "focus-rename-input", pattern: /focusRenameInput|getRenameInputEl/i, evidence: "focusRenameInput action evidence was detected." },
    { signal: "scroll-to-node", pattern: /scrollToNode|scrollToIndexFn/i, evidence: "scrollToNode evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function treeViewReadinessGuardSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["guardSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-branch-focused", pattern: /isBranchFocused/i, evidence: "isBranchFocused guard evidence was detected." },
    { signal: "is-branch-expanded", pattern: /isBranchExpanded/i, evidence: "isBranchExpanded guard evidence was detected." },
    { signal: "is-shift-key", pattern: /isShiftKey|shiftKey/i, evidence: "shift-key guard evidence was detected." },
    { signal: "is-ctrl-key", pattern: /isCtrlKey|ctrlKey|metaKey/i, evidence: "ctrl/meta-key guard evidence was detected." },
    { signal: "has-selected-items", pattern: /hasSelectedItems|selectedValue.+length/i, evidence: "has selected items guard evidence was detected." },
    { signal: "is-multiple-selection", pattern: /isMultipleSelection|selectionMode.+multiple/i, evidence: "multiple selection guard evidence was detected." },
    { signal: "move-focus", pattern: /moveFocus/i, evidence: "moveFocus guard evidence was detected." },
    { signal: "expand-on-click", pattern: /expandOnClick/i, evidence: "expandOnClick guard evidence was detected." },
    { signal: "is-rename-label-valid", pattern: /isRenameLabelValid|label\.trim/i, evidence: "rename label validity guard evidence was detected." },
    { signal: "skip-collapsed-branch", pattern: /skipFn|paths\.some|expandedValue\.includes/i, evidence: "collapsed branch skip guard evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function treeViewReadinessAsyncSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["asyncSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["asyncSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "load-children", pattern: /loadChildren/i, evidence: "loadChildren evidence was detected." },
    { signal: "loading-status", pattern: /loadingStatus|data-loading|aria-busy/i, evidence: "loading status evidence was detected." },
    { signal: "loaded-status", pattern: /\bloaded\b|TreeLoadingStatus/i, evidence: "loaded status evidence was detected." },
    { signal: "pending-aborts", pattern: /pendingAborts/i, evidence: "pending aborts evidence was detected." },
    { signal: "abort-controller", pattern: /AbortController|signal\.aborted/i, evidence: "AbortController evidence was detected." },
    { signal: "promise-all-settled", pattern: /Promise\.allSettled/i, evidence: "Promise.allSettled evidence was detected." },
    { signal: "load-complete-callback", pattern: /onLoadChildrenComplete|LoadChildrenComplete/i, evidence: "load complete callback evidence was detected." },
    { signal: "load-error-callback", pattern: /onLoadChildrenError|LoadChildrenError|NodeWithError/i, evidence: "load error callback evidence was detected." },
    { signal: "collection-replace", pattern: /collection\.replace/i, evidence: "collection replacement evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "async", "signal");
}

function treeViewReadinessDomSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["domSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id helper evidence was detected." },
    { signal: "label-id", pattern: /getLabelId/i, evidence: "label id helper evidence was detected." },
    { signal: "node-id", pattern: /getNodeId/i, evidence: "node id helper evidence was detected." },
    { signal: "tree-id", pattern: /getTreeId/i, evidence: "tree id helper evidence was detected." },
    { signal: "tree-el", pattern: /getTreeEl/i, evidence: "tree element helper evidence was detected." },
    { signal: "focus-node", pattern: /focusNode/i, evidence: "focus node helper evidence was detected." },
    { signal: "rename-input-id", pattern: /getRenameInputId/i, evidence: "rename input id helper evidence was detected." },
    { signal: "rename-input-el", pattern: /getRenameInputEl/i, evidence: "rename input element helper evidence was detected." },
    { signal: "ownedby-data", pattern: /data-ownedby/i, evidence: "data-ownedby evidence was detected." },
    { signal: "path-data", pattern: /data-path/i, evidence: "data-path evidence was detected." },
    { signal: "value-data", pattern: /data-value/i, evidence: "data-value evidence was detected." },
    { signal: "depth-data", pattern: /data-depth/i, evidence: "data-depth evidence was detected." },
    { signal: "state-data", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "loading-data", pattern: /data-loading/i, evidence: "data-loading evidence was detected." },
    { signal: "renaming-data", pattern: /data-renaming/i, evidence: "data-renaming evidence was detected." },
    { signal: "checked-data", pattern: /data-checked/i, evidence: "data-checked evidence was detected." },
    { signal: "indeterminate-data", pattern: /data-indeterminate/i, evidence: "data-indeterminate evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function treeViewReadinessApiSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["apiSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "collection", pattern: /\bcollection\b|api\.collection/i, evidence: "collection API evidence was detected." },
    { signal: "expanded-value", pattern: /api\.expandedValue|expandedValue/i, evidence: "expanded value API evidence was detected." },
    { signal: "selected-value", pattern: /api\.selectedValue|selectedValue/i, evidence: "selected value API evidence was detected." },
    { signal: "checked-value", pattern: /api\.checkedValue|checkedValue/i, evidence: "checked value API evidence was detected." },
    { signal: "toggle-checked", pattern: /api\.toggleChecked|toggleChecked/i, evidence: "toggle checked API evidence was detected." },
    { signal: "set-checked", pattern: /api\.setChecked|setChecked/i, evidence: "set checked API evidence was detected." },
    { signal: "clear-checked", pattern: /api\.clearChecked|clearChecked/i, evidence: "clear checked API evidence was detected." },
    { signal: "checked-map", pattern: /api\.getCheckedMap|getCheckedMap|getCheckedValueMap/i, evidence: "checked map API evidence was detected." },
    { signal: "expand", pattern: /api\.expand\(|\bexpand\(/i, evidence: "expand API evidence was detected." },
    { signal: "collapse", pattern: /api\.collapse\(|\bcollapse\(/i, evidence: "collapse API evidence was detected." },
    { signal: "select", pattern: /api\.select\(|\bselect\(/i, evidence: "select API evidence was detected." },
    { signal: "deselect", pattern: /api\.deselect|\bdeselect\(/i, evidence: "deselect API evidence was detected." },
    { signal: "visible-nodes", pattern: /api\.getVisibleNodes|getVisibleNodes/i, evidence: "visible nodes API evidence was detected." },
    { signal: "focus", pattern: /api\.focus|focus\(/i, evidence: "focus API evidence was detected." },
    { signal: "select-parent", pattern: /api\.selectParent|selectParent/i, evidence: "select parent API evidence was detected." },
    { signal: "expand-parent", pattern: /api\.expandParent|expandParent/i, evidence: "expand parent API evidence was detected." },
    { signal: "set-expanded-value", pattern: /api\.setExpandedValue|setExpandedValue/i, evidence: "set expanded value API evidence was detected." },
    { signal: "set-selected-value", pattern: /api\.setSelectedValue|setSelectedValue/i, evidence: "set selected value API evidence was detected." },
    { signal: "start-renaming", pattern: /api\.startRenaming|startRenaming/i, evidence: "start renaming API evidence was detected." },
    { signal: "submit-renaming", pattern: /api\.submitRenaming|submitRenaming/i, evidence: "submit renaming API evidence was detected." },
    { signal: "cancel-renaming", pattern: /api\.cancelRenaming|cancelRenaming/i, evidence: "cancel renaming API evidence was detected." },
    { signal: "root-props", pattern: /api\.getRootProps|getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: /api\.getLabelProps|getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "tree-props", pattern: /api\.getTreeProps|getTreeProps/i, evidence: "tree props API evidence was detected." },
    { signal: "node-state", pattern: /api\.getNodeState|getNodeState/i, evidence: "node state API evidence was detected." },
    { signal: "item-props", pattern: /api\.getItemProps|getItemProps/i, evidence: "item props API evidence was detected." },
    { signal: "item-text-props", pattern: /api\.getItemTextProps|getItemTextProps/i, evidence: "item text props API evidence was detected." },
    { signal: "item-indicator-props", pattern: /api\.getItemIndicatorProps|getItemIndicatorProps/i, evidence: "item indicator props API evidence was detected." },
    { signal: "branch-props", pattern: /api\.getBranchProps|getBranchProps/i, evidence: "branch props API evidence was detected." },
    { signal: "branch-indicator-props", pattern: /api\.getBranchIndicatorProps|getBranchIndicatorProps/i, evidence: "branch indicator props API evidence was detected." },
    { signal: "branch-trigger-props", pattern: /api\.getBranchTriggerProps|getBranchTriggerProps/i, evidence: "branch trigger props API evidence was detected." },
    { signal: "branch-control-props", pattern: /api\.getBranchControlProps|getBranchControlProps/i, evidence: "branch control props API evidence was detected." },
    { signal: "branch-content-props", pattern: /api\.getBranchContentProps|getBranchContentProps/i, evidence: "branch content props API evidence was detected." },
    { signal: "branch-text-props", pattern: /api\.getBranchTextProps|getBranchTextProps/i, evidence: "branch text props API evidence was detected." },
    { signal: "branch-indent-guide-props", pattern: /api\.getBranchIndentGuideProps|getBranchIndentGuideProps/i, evidence: "branch indent guide props API evidence was detected." },
    { signal: "node-checkbox-props", pattern: /api\.getNodeCheckboxProps|getNodeCheckboxProps/i, evidence: "node checkbox props API evidence was detected." },
    { signal: "node-rename-input-props", pattern: /api\.getNodeRenameInputProps|getNodeRenameInputProps/i, evidence: "node rename input props API evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function treeViewReadinessTestSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["testSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /user\.click|click-test/i, evidence: "click test evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|keyboard-test|ArrowDown|ArrowUp|ArrowLeft|ArrowRight|Home|End/i, evidence: "keyboard test evidence was detected." },
    { signal: "typeahead-test", pattern: /typeahead-test|TREE\.TYPEAHEAD|getByTypeahead/i, evidence: "typeahead test evidence was detected." },
    { signal: "rename-test", pattern: /rename-test|F2|NODE\.RENAME|RENAME\.SUBMIT/i, evidence: "rename test evidence was detected." },
    { signal: "loading-test", pattern: /loading-test|loadChildren|AbortController/i, evidence: "loading test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|tree-view-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function treeViewReadinessPackageSignals(sourceFiles: TreeViewReadinessSourceFile[]): TreeViewReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TreeViewReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/tree-view", pattern: /@zag-js\/tree-view/i, evidence: "@zag-js/tree-view dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/collection", pattern: /@zag-js\/collection/i, evidence: "@zag-js/collection dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return treeViewReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function treeViewReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TreeViewReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/tree-view-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
