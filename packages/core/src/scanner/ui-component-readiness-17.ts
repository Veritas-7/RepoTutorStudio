import type { MarqueeReadinessReport, TocReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildMarqueeReadinessReport(walk: WalkResult): Promise<MarqueeReadinessReport> {
  const sourceFiles = await marqueeReadinessSourceFiles(walk);
  const marqueeSetups = marqueeReadinessSetups(sourceFiles);
  const frameworkSignals = marqueeReadinessFrameworkSignals(sourceFiles);
  const structureSignals = marqueeReadinessStructureSignals(sourceFiles);
  const stateSignals = marqueeReadinessStateSignals(sourceFiles);
  const motionSignals = marqueeReadinessMotionSignals(sourceFiles);
  const measurementSignals = marqueeReadinessMeasurementSignals(sourceFiles);
  const interactionSignals = marqueeReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = marqueeReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = marqueeReadinessMachineSignals(sourceFiles);
  const contextSignals = marqueeReadinessContextSignals(sourceFiles);
  const computedSignals = marqueeReadinessComputedSignals(sourceFiles);
  const effectSignals = marqueeReadinessEffectSignals(sourceFiles);
  const actionSignals = marqueeReadinessActionSignals(sourceFiles);
  const domSignals = marqueeReadinessDomSignals(sourceFiles);
  const apiSignals = marqueeReadinessApiSignals(sourceFiles);
  const testSignals = marqueeReadinessTestSignals(sourceFiles);
  const packageSignals = marqueeReadinessPackageSignals(sourceFiles);

  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || marqueeSetups.some((item) => item.rootCount > 0 && item.contentCount > 0);
  const hasMotion = motionSignals.some((item) => item.readiness === "ready") || marqueeSetups.some((item) => item.motionCount > 0);
  const hasMeasurement = measurementSignals.some((item) => item.readiness === "ready") || marqueeSetups.some((item) => item.measurementCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || marqueeSetups.some((item) => item.pauseCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || marqueeSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || marqueeSetups.some((item) => item.testCount > 0);

  const riskQueue: MarqueeReadinessReport["riskQueue"] = [];
  if (!hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Trace marquee root, viewport, content, item, edge, and clone structure before claiming marquee readiness.",
      why: "Marquee UIs need explicit clipping, repeated content, item spacing, and source structure so learners can reason about motion without running it.",
      relatedHref: "html/marquee-readiness.html"
    });
  }
  if (hasStructure && !hasMotion) {
    riskQueue.push({
      priority: "high",
      action: "Document speed, delay, loop count, spacing, duration, translate, keyframes, and animation lifecycle events.",
      why: "A marquee without traceable motion timing can be visually distracting, unpredictable, or impossible to test deterministically.",
      relatedHref: "html/marquee-readiness.html"
    });
  }
  if (hasStructure && !hasMeasurement) {
    riskQueue.push({
      priority: "medium",
      action: "Document auto-fill measurement, content count, ResizeObserver, and requestAnimationFrame behavior.",
      why: "Auto-filled marquees depend on live dimensions; static readiness should show how root/content sizes and clone counts are derived.",
      relatedHref: "html/marquee-readiness.html"
    });
  }
  if (hasMotion && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add pause, resume, toggle, restart, hover, and focus pause interaction evidence.",
      why: "Moving content should be controllable, especially when pointer or keyboard focus reaches interactive marquee children.",
      relatedHref: "html/marquee-readiness.html"
    });
  }
  if (hasMotion && !hasA11y) {
    riskQueue.push({
      priority: "high",
      action: "Add region labeling, marquee role description, aria-live off, clone hiding, and reduced-motion evidence.",
      why: "Marquee content can be disorienting for assistive tech and motion-sensitive users unless the static accessibility contract is explicit.",
      relatedHref: "html/marquee-readiness.html"
    });
  }
  if ((hasStructure || hasMotion || hasInteraction) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add tests for pause interaction, loop lifecycle, measurement behavior, ARIA labels, and artifact traces.",
      why: "Marquee readiness is stronger when tests assert controllability and accessibility instead of only rendering animated markup.",
      relatedHref: "html/marquee-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real animation timing, layout measurement, resize observation, hover/focus pause, clone hiding, and reduced-motion behavior outside RepoTutor.",
    why: "RepoTutor records marquee readiness only; it does not run real animations, measure live layout, observe real resize events, dispatch hover/focus events, clone DOM content, mutate animation styles, or run analyzed project tests.",
    relatedHref: "html/marquee-readiness.html"
  });

  return {
    summary: marqueeSetups.length > 0
      ? `Marquee readiness report: setup ${marqueeSetups.length} files, motion signal ${motionSignals.length}, measurement signal ${measurementSignals.length}, machine signal ${machineSignals.length}, API signal ${apiSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`
      : "No marquee readiness source files were detected.",
    sourcePattern: "Marquee readiness Zag marquee motion autofill pause interaction accessibility tests",
    marqueeSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    motionSignals,
    measurementSignals,
    interactionSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      {
        command: "rg \"@zag-js/marquee|marquee\\.machine|marquee\\.connect|getRootProps|getViewportProps|getContentProps\" package.json src app packages",
        purpose: "Find Zag marquee package usage, machine/connect setup, root, viewport, and content wiring."
      },
      {
        command: "rg \"autoFill|multiplier|contentCount|ResizeObserver|requestAnimationFrame|--marquee-duration|--marquee-translate\" src app packages test",
        purpose: "Inspect auto-fill measurement, clone count, CSS animation variables, and resize throttling evidence."
      },
      {
        command: "rg \"pauseOnInteraction|onMouseEnter|onMouseLeave|onFocusCapture|aria-roledescription=['\\\"]marquee|aria-live=['\\\"]off|prefers-reduced-motion|marquee-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check pause controls, motion accessibility, reduced-motion handling, and trace artifacts."
      }
    ],
    learnerNextSteps: [
      "Open marquee setup source links and separate static structure from motion timing evidence.",
      "Check whether auto-fill clone counts are derived from measured root/content dimensions.",
      "Confirm moving content pauses for pointer/focus interaction and has an accessible label with clones hidden.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type MarqueeReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function marqueeReadinessSourceFiles(walk: WalkResult): Promise<MarqueeReadinessSourceFile[]> {
  const files: MarqueeReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !marqueeReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!marqueeReadinessPathSignal(file.relPath) && !marqueeReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 220) break;
  }
  return files;
}

function marqueeReadinessInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return marqueeReadinessPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function marqueeReadinessPathSignal(filePath: string): boolean {
  return /marquee|ticker|auto[-_]?scroll|scrolling|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function marqueeReadinessContentSignal(text: string): boolean {
  return /@zag-js\/marquee|marquee\.machine|marquee\.connect|getViewportProps|getContentProps|aria-roledescription=['"]marquee|--marquee-duration|ResizeObserver|pauseOnInteraction|marquee-traces/i.test(text);
}

function marqueeReadinessSetups(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["marqueeSetups"] {
  const rows: MarqueeReadinessReport["marqueeSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /getRootProps|data-part=['"]root|role=['"]region|marquee-root/i);
    const viewportCount = countMatches(source.text, /getViewportProps|data-part=['"]viewport|marquee-viewport/i);
    const contentCount = countMatches(source.text, /getContentProps|data-part=['"]content|marquee-content|contentCount/i);
    const itemCount = countMatches(source.text, /getItemProps|data-part=['"]item|marquee-item/i);
    const edgeCount = countMatches(source.text, /getEdgeProps|data-part=['"]edge|marquee-edge/i);
    const cloneCount = countMatches(source.text, /data-clone|aria-hidden|role=['"]presentation|clone|contentCount|multiplier/i);
    const controlCount = countMatches(source.text, /api\.pause|api\.resume|togglePause|restart|PAUSE|RESUME|TOGGLE_PAUSE|RESTART|data-action=['"](pause|resume|toggle-pause|restart)/i);
    const measurementCount = countMatches(source.text, /autoFill|multiplier|contentCount|rootSize|contentSize|DimensionSnapshot|ResizeObserver|requestAnimationFrame|dimensions/i);
    const motionCount = countMatches(source.text, /speed|delay|loopCount|spacing|duration|--marquee-duration|--marquee-spacing|--marquee-delay|--marquee-loop-count|--marquee-translate|translate|keyframes|animationIteration|animationEnd|onAnimationIteration|onAnimationEnd/i);
    const pauseCount = countMatches(source.text, /paused|defaultPaused|pauseOnInteraction|onPauseChange|PAUSE|RESUME|TOGGLE_PAUSE|onMouseEnter|onMouseLeave|onFocusCapture|onBlurCapture|pause-test/i);
    const accessibilityCount = countMatches(source.text, /role=['"]region|aria-roledescription|aria-live=['"]off|aria-label|aria-hidden|role=['"]presentation|prefers-reduced-motion|data-state|data-orientation|data-paused/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|@testing-library\/react|userEvent|user\.hover|user\.click|ResizeObserver|requestAnimationFrame|pause-test|loop-test|measurement-test|aria-test|upload-artifact|marquee-traces/i);
    const evidenceScore = rootCount + viewportCount + contentCount + itemCount + edgeCount + cloneCount + controlCount + measurementCount + motionCount + pauseCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !marqueeReadinessPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: marqueeReadinessFramework(source),
      rootCount,
      viewportCount,
      contentCount,
      itemCount,
      edgeCount,
      cloneCount,
      controlCount,
      measurementCount,
      motionCount,
      pauseCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 8 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static marquee readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.motionCount + b.measurementCount + b.pauseCount + b.accessibilityCount) - (a.motionCount + a.measurementCount + a.pauseCount + a.accessibilityCount) || a.filePath.localeCompare(b.filePath)).slice(0, 80);
}

function marqueeReadinessFramework(source: MarqueeReadinessSourceFile): MarqueeReadinessReport["marqueeSetups"][number]["framework"] {
  if (/@zag-js\/marquee|marquee\.machine|marquee\.connect/i.test(source.text)) return "zag-marquee";
  if (/custom marquee|aria-roledescription=['"]marquee|marquee-traces|auto[-_]?scroll|ticker/i.test(source.text)) return "custom";
  if (/@keyframes\s+marquee|--marquee-duration|animation:\s*['"]?marquee/i.test(source.text)) return "css-marquee";
  return "unknown";
}

function marqueeReadinessFrameworkSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-marquee", pattern: /@zag-js\/marquee|marquee\.machine|marquee\.connect/i, evidence: "Zag marquee evidence was detected." },
    { signal: "css-marquee", pattern: /@keyframes\s+marquee|--marquee-duration|animation:\s*['"]?marquee/i, evidence: "CSS marquee evidence was detected." },
    { signal: "custom", pattern: /custom marquee|aria-roledescription=['"]marquee|marquee-traces|auto[-_]?scroll|ticker/i, evidence: "custom marquee evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function marqueeReadinessStructureSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["structureSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|role=['"]region/i, evidence: "root evidence was detected." },
    { signal: "viewport", pattern: /getViewportProps|data-part=['"]viewport/i, evidence: "viewport evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|contentCount/i, evidence: "content evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-part=['"]item/i, evidence: "item evidence was detected." },
    { signal: "edge", pattern: /getEdgeProps|data-part=['"]edge/i, evidence: "edge evidence was detected." },
    { signal: "clone", pattern: /data-clone|aria-hidden|role=['"]presentation|clone|contentCount|multiplier/i, evidence: "clone evidence was detected." },
    { signal: "css-variable", pattern: /--marquee-duration|--marquee-spacing|--marquee-delay|--marquee-loop-count|--marquee-translate/i, evidence: "CSS variable evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function marqueeReadinessStateSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["stateSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b|data-state=['"]idle/i, evidence: "idle state evidence was detected." },
    { signal: "paused", pattern: /\bpaused\b|data-state=['"]paused|data-paused/i, evidence: "paused state evidence was detected." },
    { signal: "resumed", pattern: /\bresumed\b|setResumed|RESUME/i, evidence: "resumed state evidence was detected." },
    { signal: "reverse", pattern: /\breverse\b|data-reverse/i, evidence: "reverse evidence was detected." },
    { signal: "horizontal", pattern: /\bhorizontal\b|row-reverse|data-orientation=['"]horizontal/i, evidence: "horizontal orientation evidence was detected." },
    { signal: "vertical", pattern: /\bvertical\b|column-reverse|data-orientation=['"]vertical/i, evidence: "vertical orientation evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function marqueeReadinessMotionSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["motionSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["motionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "speed", pattern: /\bspeed\b/i, evidence: "speed evidence was detected." },
    { signal: "delay", pattern: /\bdelay\b|--marquee-delay/i, evidence: "delay evidence was detected." },
    { signal: "loop-count", pattern: /loopCount|loop-count|--marquee-loop-count/i, evidence: "loop count evidence was detected." },
    { signal: "spacing", pattern: /\bspacing\b|--marquee-spacing|marginInline|marginBlock/i, evidence: "spacing evidence was detected." },
    { signal: "duration", pattern: /\bduration\b|--marquee-duration|calculateDuration/i, evidence: "duration evidence was detected." },
    { signal: "translate", pattern: /translate|--marquee-translate|getMarqueeTranslate/i, evidence: "translate evidence was detected." },
    { signal: "keyframes", pattern: /@keyframes|keyframes/i, evidence: "keyframes evidence was detected." },
    { signal: "animation-iteration", pattern: /onAnimationIteration|animationiteration|animation-iteration/i, evidence: "animation iteration evidence was detected." },
    { signal: "animation-end", pattern: /onAnimationEnd|animationend|animation-end/i, evidence: "animation end evidence was detected." },
    { signal: "restart", pattern: /restartAnimation|restart|RESTART|animation\s*=\s*["']none/i, evidence: "restart evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "motion", "signal");
}

function marqueeReadinessMeasurementSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["measurementSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["measurementSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "auto-fill", pattern: /autoFill|auto-fill/i, evidence: "auto-fill evidence was detected." },
    { signal: "multiplier", pattern: /\bmultiplier\b/i, evidence: "multiplier evidence was detected." },
    { signal: "content-count", pattern: /contentCount|content-count/i, evidence: "content count evidence was detected." },
    { signal: "root-size", pattern: /rootSize|root-size|clientWidth|clientHeight/i, evidence: "root size evidence was detected." },
    { signal: "content-size", pattern: /contentSize|content-size|clientWidth|clientHeight/i, evidence: "content size evidence was detected." },
    { signal: "resize-observer", pattern: /ResizeObserver|resize-observer/i, evidence: "ResizeObserver evidence was detected." },
    { signal: "request-animation-frame", pattern: /requestAnimationFrame|cancelAnimationFrame|request-animation-frame/i, evidence: "requestAnimationFrame evidence was detected." },
    { signal: "dimension-snapshot", pattern: /DimensionSnapshot|dimensions|dimension-snapshot/i, evidence: "dimension snapshot evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "measurement", "signal");
}

function marqueeReadinessInteractionSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pause", pattern: /\bpause\b|PAUSE|api\.pause|setPaused/i, evidence: "pause evidence was detected." },
    { signal: "resume", pattern: /\bresume\b|RESUME|api\.resume|setResumed/i, evidence: "resume evidence was detected." },
    { signal: "toggle-pause", pattern: /togglePause|TOGGLE_PAUSE|toggle-pause/i, evidence: "toggle pause evidence was detected." },
    { signal: "pause-on-interaction", pattern: /pauseOnInteraction|pause-on-interaction/i, evidence: "pause on interaction evidence was detected." },
    { signal: "mouse-enter", pattern: /onMouseEnter|mouseenter|mouse-enter/i, evidence: "mouse enter evidence was detected." },
    { signal: "mouse-leave", pattern: /onMouseLeave|mouseleave|mouse-leave/i, evidence: "mouse leave evidence was detected." },
    { signal: "focus-capture", pattern: /onFocusCapture|focus capture|focus-capture/i, evidence: "focus capture evidence was detected." },
    { signal: "blur-capture", pattern: /onBlurCapture|blur capture|blur-capture/i, evidence: "blur capture evidence was detected." },
    { signal: "restart", pattern: /restartAnimation|restart|RESTART/i, evidence: "restart interaction evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function marqueeReadinessAccessibilitySignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-region", pattern: /role=['"]region|role="region"/i, evidence: "region role evidence was detected." },
    { signal: "aria-roledescription", pattern: /aria-roledescription=['"]marquee|aria-roledescription/i, evidence: "aria-roledescription evidence was detected." },
    { signal: "aria-live-off", pattern: /aria-live=['"]off|aria-live-off/i, evidence: "aria-live off evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|translations:\s*\{\s*root/i, evidence: "aria label evidence was detected." },
    { signal: "presentation-clone", pattern: /role=['"]presentation|role="presentation"|presentation-clone/i, evidence: "presentation clone evidence was detected." },
    { signal: "aria-hidden-clone", pattern: /aria-hidden|aria-hidden-clone/i, evidence: "aria-hidden clone evidence was detected." },
    { signal: "reduced-motion", pattern: /prefers-reduced-motion|reduced-motion/i, evidence: "reduced motion evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation evidence was detected." },
    { signal: "data-paused", pattern: /data-paused/i, evidence: "data-paused evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function marqueeReadinessMachineSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["machineSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<MarqueeSchema>|createMachine\s+MarqueeSchema/i, evidence: "createMachine MarqueeSchema evidence was detected." },
    { signal: "default-props", pattern: /dir\s+ltr[\s\S]{0,300}side\s+start[\s\S]{0,300}speed\s+50[\s\S]{0,300}spacing\s+1rem|defaultPaused\s+false|translations\s+root\s+Marquee\s+content/i, evidence: "default prop evidence was detected." },
    { signal: "refs", pattern: /refs[\s\S]{0,120}dimensions[\s\S]{0,120}initialDurationSet|refs\s+dimensions\s+initialDurationSet/i, evidence: "machine refs evidence was detected." },
    { signal: "bindable-context", pattern: /paused[\s\S]{0,120}bindable[\s\S]{0,180}duration[\s\S]{0,120}bindable|context\s+paused\s+bindable\s+duration\s+bindable/i, evidence: "bindable context evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,80}idle|initialState\s+idle/i, evidence: "idle initial state evidence was detected." },
    { signal: "computed-state", pattern: /computed[\s\S]{0,180}orientation[\s\S]{0,180}multiplier|computed\s+orientation\s+isVertical\s+multiplier/i, evidence: "computed state evidence was detected." },
    { signal: "watch-props", pattern: /watch[\s\S]{0,240}(speed|spacing|side)|watch\s+speed\s+spacing\s+side/i, evidence: "watch prop evidence was detected." },
    { signal: "global-events", pattern: /PAUSE[\s\S]{0,140}RESUME[\s\S]{0,140}TOGGLE_PAUSE[\s\S]{0,140}RESTART/i, evidence: "global event evidence was detected." },
    { signal: "track-dimensions-effect", pattern: /effects[\s\S]{0,100}trackDimensions|effects\s+trackDimensions/i, evidence: "trackDimensions effect registration evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function marqueeReadinessContextSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["contextSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "paused-context", pattern: /paused[\s\S]{0,120}bindable[\s\S]{0,180}(defaultPaused|onPauseChange)|paused\s+bindable\s+value\s+prop\s+paused\s+defaultPaused\s+onPauseChange/i, evidence: "paused bindable context evidence was detected." },
    { signal: "duration-context", pattern: /duration[\s\S]{0,120}bindable[\s\S]{0,160}2000|duration\s+bindable\s+2000\s+Math\.max\s+speed/i, evidence: "duration bindable context evidence was detected." },
    { signal: "dimensions-ref", pattern: /dimensions\s+ref|refs[\s\S]{0,100}dimensions|refs\s+set\s+dimensions/i, evidence: "dimensions ref evidence was detected." },
    { signal: "initial-duration-ref", pattern: /initialDurationSet\s+ref|refs[\s\S]{0,100}initialDurationSet/i, evidence: "initial duration ref evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function marqueeReadinessComputedSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["computedSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "orientation", pattern: /\borientation\b/i, evidence: "orientation computed evidence was detected." },
    { signal: "is-vertical", pattern: /isVertical|is-vertical/i, evidence: "isVertical computed evidence was detected." },
    { signal: "multiplier", pattern: /\bmultiplier\b/i, evidence: "multiplier computed evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function marqueeReadinessEffectSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["effectSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-dimensions", pattern: /trackDimensions/i, evidence: "trackDimensions effect evidence was detected." },
    { signal: "resize-observer", pattern: /ResizeObserver|resize-observer/i, evidence: "ResizeObserver evidence was detected." },
    { signal: "request-animation-frame", pattern: /requestAnimationFrame|cancelAnimationFrame|request-animation-frame/i, evidence: "requestAnimationFrame evidence was detected." },
    { signal: "dimension-measurement", pattern: /measureDimensions|rootSize[\s\S]{0,120}contentSize|refs\s+set\s+dimensions/i, evidence: "dimension measurement evidence was detected." },
    { signal: "observer-cleanup", pattern: /observer[\s\S]{0,120}observe[\s\S]{0,120}disconnect|disconnect\(\)|observer\s+observe\s+disconnect/i, evidence: "observer cleanup evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function marqueeReadinessActionSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["actionSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-paused", pattern: /setPaused/i, evidence: "setPaused action evidence was detected." },
    { signal: "set-resumed", pattern: /setResumed/i, evidence: "setResumed action evidence was detected." },
    { signal: "toggle-paused", pattern: /togglePaused|togglePause|TOGGLE_PAUSE/i, evidence: "togglePaused action evidence was detected." },
    { signal: "restart-animation", pattern: /restartAnimation|querySelectorAll[\s\S]{0,120}data-part[\s\S]{0,120}content[\s\S]{0,180}animation[\s\S]{0,80}none|offsetHeight/i, evidence: "restartAnimation action evidence was detected." },
    { signal: "recalculate-duration", pattern: /recalculateDuration/i, evidence: "recalculateDuration action evidence was detected." },
    { signal: "calculate-duration", pattern: /calculateDuration/i, evidence: "calculateDuration helper evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function marqueeReadinessDomSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["domSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id DOM evidence was detected." },
    { signal: "viewport-id", pattern: /getViewportId/i, evidence: "viewport id DOM evidence was detected." },
    { signal: "content-id", pattern: /getContentId/i, evidence: "content id DOM evidence was detected." },
    { signal: "root-el", pattern: /getRootEl/i, evidence: "root element DOM evidence was detected." },
    { signal: "viewport-el", pattern: /getViewportEl/i, evidence: "viewport element DOM evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element DOM evidence was detected." },
    { signal: "edge-position-styles", pattern: /getEdgePositionStyles/i, evidence: "edge position styles utility evidence was detected." },
    { signal: "marquee-translate", pattern: /getMarqueeTranslate|--marquee-translate/i, evidence: "marquee translate utility evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function marqueeReadinessApiSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["apiSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "paused", pattern: /api\.paused|\bpaused\b/i, evidence: "paused API evidence was detected." },
    { signal: "orientation", pattern: /api\.orientation|\borientation\b/i, evidence: "orientation API evidence was detected." },
    { signal: "side", pattern: /api\.side|\bside\b/i, evidence: "side API evidence was detected." },
    { signal: "multiplier", pattern: /api\.multiplier|\bmultiplier\b/i, evidence: "multiplier API evidence was detected." },
    { signal: "content-count", pattern: /api\.contentCount|contentCount|content-count/i, evidence: "content count API evidence was detected." },
    { signal: "pause", pattern: /api\.pause\(|\bpause\b/i, evidence: "pause API evidence was detected." },
    { signal: "resume", pattern: /api\.resume\(|\bresume\b/i, evidence: "resume API evidence was detected." },
    { signal: "toggle-pause", pattern: /api\.togglePause\(|togglePause|toggle-pause/i, evidence: "togglePause API evidence was detected." },
    { signal: "restart", pattern: /api\.restart\(|\brestart\b/i, evidence: "restart API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "viewport-props", pattern: /getViewportProps/i, evidence: "viewport props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "edge-props", pattern: /getEdgeProps/i, evidence: "edge props API evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props API evidence was detected." },
    { signal: "region-role", pattern: /role\s+region|role=['"]region|aria-roledescription\s+marquee|aria-roledescription=['"]marquee/i, evidence: "region role API evidence was detected." },
    { signal: "animation-events", pattern: /onAnimationIteration|onAnimationEnd|animationIteration|animationEnd/i, evidence: "animation event API evidence was detected." },
    { signal: "pause-interaction-handlers", pattern: /onMouseEnter[\s\S]{0,160}onMouseLeave[\s\S]{0,160}onFocusCapture[\s\S]{0,160}onBlurCapture|pauseOnInteraction/i, evidence: "pause interaction handler API evidence was detected." },
    { signal: "clone-accessibility", pattern: /data-clone[\s\S]{0,160}(role\s+presentation|role=['"]presentation)[\s\S]{0,160}aria-hidden|role\s+presentation[\s\S]{0,160}aria-hidden/i, evidence: "clone accessibility API evidence was detected." },
    { signal: "css-variables", pattern: /--marquee-duration|--marquee-spacing|--marquee-delay|--marquee-loop-count|--marquee-translate/i, evidence: "CSS variable API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|\bdir prop\b/i, evidence: "dir prop API evidence was detected." },
    { signal: "data-part", pattern: /data-part|dataPart/i, evidence: "data part API evidence was detected." },
    { signal: "data-index", pattern: /data-index|dataIndex/i, evidence: "data index API evidence was detected." },
    { signal: "data-side", pattern: /data-side|dataSide/i, evidence: "data side API evidence was detected." },
    { signal: "data-reverse", pattern: /data-reverse|dataReverse/i, evidence: "data reverse API evidence was detected." },
    { signal: "data-clone", pattern: /data-clone|dataClone/i, evidence: "data clone API evidence was detected." },
    { signal: "display-flex", pattern: /display:\s*["']flex["']|display flex/i, evidence: "display flex API evidence was detected." },
    { signal: "overflow-hidden", pattern: /overflow:\s*["']hidden["']|overflow hidden/i, evidence: "overflow hidden API evidence was detected." },
    { signal: "contain-layout-style-paint", pattern: /contain:\s*["']layout style paint["']|contain layout style paint/i, evidence: "contain layout style paint API evidence was detected." },
    { signal: "pointer-events-none", pattern: /pointerEvents:\s*["']none["']|pointerEvents none/i, evidence: "pointer events none API evidence was detected." },
    { signal: "spacing-margin", pattern: /marginBlock|marginInline|spacing-margin/i, evidence: "spacing margin API evidence was detected." },
    { signal: "will-change-transform", pattern: /willChange[\s\S]{0,80}transform|willChange transform/i, evidence: "will change transform API evidence was detected." },
    { signal: "translate-z", pattern: /translateZ\(0\)|translateZ/i, evidence: "translateZ API evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function marqueeReadinessTestSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["testSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pause-test", pattern: /pause-test|user\.hover|user\.click|\bPause\b/i, evidence: "pause test evidence was detected." },
    { signal: "loop-test", pattern: /loop-test|animationiteration|animationend|onAnimationIteration|onAnimationEnd/i, evidence: "loop test evidence was detected." },
    { signal: "measurement-test", pattern: /measurement-test|ResizeObserver|requestAnimationFrame/i, evidence: "measurement test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|getByRole|aria-/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|marquee-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function marqueeReadinessPackageSignals(sourceFiles: MarqueeReadinessSourceFile[]): MarqueeReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MarqueeReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/marquee", pattern: /@zag-js\/marquee/i, evidence: "@zag-js/marquee dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return marqueeReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function marqueeReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: MarqueeReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/marquee-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildTocReadinessReport(walk: WalkResult): Promise<TocReadinessReport> {
  const sourceFiles = await tocReadinessSourceFiles(walk);
  const tocSetups = tocReadinessSetups(sourceFiles);
  const frameworkSignals = tocReadinessFrameworkSignals(sourceFiles);
  const structureSignals = tocReadinessStructureSignals(sourceFiles);
  const stateSignals = tocReadinessStateSignals(sourceFiles);
  const observerSignals = tocReadinessObserverSignals(sourceFiles);
  const scrollSignals = tocReadinessScrollSignals(sourceFiles);
  const indicatorSignals = tocReadinessIndicatorSignals(sourceFiles);
  const accessibilitySignals = tocReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = tocReadinessMachineSignals(sourceFiles);
  const contextSignals = tocReadinessContextSignals(sourceFiles);
  const computedSignals = tocReadinessComputedSignals(sourceFiles);
  const effectSignals = tocReadinessEffectSignals(sourceFiles);
  const actionSignals = tocReadinessActionSignals(sourceFiles);
  const domSignals = tocReadinessDomSignals(sourceFiles);
  const apiSignals = tocReadinessApiSignals(sourceFiles);
  const testSignals = tocReadinessTestSignals(sourceFiles);
  const packageSignals = tocReadinessPackageSignals(sourceFiles);

  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || tocSetups.some((item) => item.rootCount > 0 && item.listCount > 0 && item.linkCount > 0);
  const hasActiveState = stateSignals.some((item) => item.readiness === "ready") || tocSetups.some((item) => item.activeCount > 0);
  const hasObserver = observerSignals.some((item) => item.readiness === "ready") || tocSetups.some((item) => item.observerCount > 0);
  const hasScroll = scrollSignals.some((item) => item.readiness === "ready") || tocSetups.some((item) => item.scrollCount > 0);
  const hasIndicator = indicatorSignals.some((item) => item.readiness === "ready") || tocSetups.some((item) => item.indicatorCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || tocSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || tocSetups.some((item) => item.testCount > 0);

  const riskQueue: TocReadinessReport["riskQueue"] = [];
  if (!hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Trace TOC root, title, list, item, link, heading, and indicator structure before claiming TOC readiness.",
      why: "A TOC readiness report needs static structure evidence so learners can connect heading sources to navigation output without running the page.",
      relatedHref: "html/toc-readiness.html"
    });
  }
  if (hasStructure && !hasActiveState) {
    riskQueue.push({
      priority: "high",
      action: "Document active heading ids, active items, item state, first/last active range, and depth metadata.",
      why: "TOC navigation is useful only when current section state is traceable and reviewable from static evidence.",
      relatedHref: "html/toc-readiness.html"
    });
  }
  if (hasStructure && !hasObserver) {
    riskQueue.push({
      priority: "high",
      action: "Add IntersectionObserver, rootMargin, threshold, scroll root, visibility map, and cleanup evidence.",
      why: "Active heading state normally depends on scroll observation; static readiness should show the observation boundaries.",
      relatedHref: "html/toc-readiness.html"
    });
  }
  if (hasStructure && !hasScroll) {
    riskQueue.push({
      priority: "medium",
      action: "Add scrollTo, scrollIntoView, same-page hash, pushHash, and hashchange behavior evidence.",
      why: "TOC click behavior should reveal whether it scrolls real containers and updates URL state intentionally.",
      relatedHref: "html/toc-readiness.html"
    });
  }
  if (hasStructure && !hasIndicator) {
    riskQueue.push({
      priority: "medium",
      action: "Document indicator rect, top/left/width/height variables, active item range, and resize-border-box updates.",
      why: "Indicator placement depends on live geometry; RepoTutor should expose the static geometry contract before live QA.",
      relatedHref: "html/toc-readiness.html"
    });
  }
  if (hasStructure && !hasA11y) {
    riskQueue.push({
      priority: "high",
      action: "Add aria-labelledby, aria-current location, data-active/depth/range, and direction evidence.",
      why: "TOC readiness needs accessible current-location and heading hierarchy signals, not only clickable anchors.",
      relatedHref: "html/toc-readiness.html"
    });
  }
  if ((hasStructure || hasObserver || hasScroll) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add observer, scroll, active-state, ARIA, and artifact tests for TOC behavior.",
      why: "Tests make static TOC readiness stronger by preserving the intended active-heading and link behavior contract.",
      relatedHref: "html/toc-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live heading observation, indicator geometry, scroll/hash behavior, link clicks, and tests outside RepoTutor.",
    why: "RepoTutor records TOC readiness only; it does not observe real headings, measure live indicator geometry, scroll real containers, update browser history, dispatch hashchange events, click real links, or run analyzed project tests.",
    relatedHref: "html/toc-readiness.html"
  });

  return {
    summary: tocSetups.length > 0
      ? `TOC readiness report: setup ${tocSetups.length} files, observer signal ${observerSignals.length}, scroll signal ${scrollSignals.length}, machine signal ${machineSignals.length}, API signal ${apiSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`
      : "No TOC readiness source files were detected.",
    sourcePattern: "TOC readiness Zag toc active headings observer indicator scroll accessibility tests",
    tocSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    observerSignals,
    scrollSignals,
    indicatorSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      {
        command: "rg \"@zag-js/toc|toc\\.machine|toc\\.connect|getRootProps|getItemProps|getLinkProps|getIndicatorProps\" package.json src app packages",
        purpose: "Find Zag TOC package usage, machine/connect setup, root, item, link, and indicator wiring."
      },
      {
        command: "rg \"IntersectionObserver|rootMargin|threshold|scrollEl|visibilityMap|resizeObserverBorderBox|indicatorRect|--top|--height\" src app packages test",
        purpose: "Inspect active heading observation, scroll root, visibility maps, indicator geometry, and resize tracking."
      },
      {
        command: "rg \"scrollTo\\(|scrollIntoView|scrollToElement|getSamePageHash|pushHash|hashchange|aria-current=['\\\"]location|toc-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check scroll/hash behavior, current-location accessibility, and trace artifact coverage."
      }
    ],
    learnerNextSteps: [
      "Open TOC setup links and separate heading source structure from active heading state.",
      "Check whether active ids come from IntersectionObserver boundaries with rootMargin, threshold, and scroll root evidence.",
      "Review indicator geometry evidence before trusting any highlighted range or animated marker.",
      "Confirm link clicks intentionally handle same-page hash, browser history, hashchange, and scroll behavior.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type TocReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function tocReadinessSourceFiles(walk: WalkResult): Promise<TocReadinessSourceFile[]> {
  const files: TocReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !tocReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!tocReadinessPathSignal(file.relPath) && !tocReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 220) break;
  }
  return files;
}

function tocReadinessInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return tocReadinessPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function tocReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(toc|table[-_ ]?of[-_ ]?contents|scroll[-_ ]?spy|headings?|\.github\/workflows|package\.json|test|spec)(\/|\.|-|_|$)/i.test(filePath)
    || /\.github\/workflows/i.test(filePath)
    || /package\.json$/i.test(filePath);
}

function tocReadinessContentSignal(text: string): boolean {
  return /@zag-js\/toc|toc\.machine|toc\.connect|getItemState|getIndicatorProps|IntersectionObserver|resizeObserverBorderBox|aria-current=['"]location|toc-traces|table-of-contents|scroll-spy/i.test(text);
}

function tocReadinessSetups(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["tocSetups"] {
  const rows: TocReadinessReport["tocSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /getRootProps|data-part=['"]root|<nav|aria-labelledby|toc-root/i);
    const titleCount = countMatches(source.text, /getTitleProps|data-part=['"]title|<h2|toc-title/i);
    const listCount = countMatches(source.text, /getListProps|data-part=['"]list|<ol|<ul|\blist\b/i);
    const itemCount = countMatches(source.text, /getItemProps|data-part=['"]item|data-depth|data-active/i);
    const linkCount = countMatches(source.text, /getLinkProps|data-part=['"]link|href=|aria-current/i);
    const indicatorCount = countMatches(source.text, /getIndicatorProps|data-part=['"]indicator|indicatorRect|indicator-rect|--top|--left|--width|--height|data-indicator-rect/i);
    const headingCount = countMatches(source.text, /getHeadingEl|document\.getElementById|<h2|<h3|#intro|\bheading\b|headings/i);
    const activeCount = countMatches(source.text, /activeIds|active-ids|activeItems|active-items|defaultActiveIds|default-active-ids|ACTIVE_IDS\.SET|getItemState|active item state|active-item-state|data-active|data-first|data-last|first-active|last-active|\bdepth\b/i);
    const observerCount = countMatches(source.text, /IntersectionObserver|intersection-observer|rootMargin|root-margin|threshold|scrollEl|scroll-root|visibilityMap|visibility-map|resizeObserverBorderBox|resize-observer|indicatorCleanup|indicator-cleanup/i);
    const scrollCount = countMatches(source.text, /autoScroll|auto-scroll|scrollBehavior|scroll-behavior|scrollTo|scroll-to|scrollIntoView|scroll-into-view|scrollToElement|getSamePageHash|same-page-hash|pushHash|push-hash|hashchange|HashChangeEvent/i);
    const accessibilityCount = countMatches(source.text, /aria-labelledby|aria-current|aria-current-location|data-active|data-depth|data-first|data-last|dir=|dir:/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|@testing-library\/react|userEvent|observer-test|scroll-test|active-test|aria-test|upload-artifact|toc-traces|IntersectionObserver|ResizeObserver/i);
    const evidenceScore = rootCount + titleCount + listCount + itemCount + linkCount + indicatorCount + headingCount + activeCount + observerCount + scrollCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !tocReadinessPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: tocReadinessFramework(source),
      rootCount,
      titleCount,
      listCount,
      itemCount,
      linkCount,
      indicatorCount,
      headingCount,
      activeCount,
      observerCount,
      scrollCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 8 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static TOC readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.activeCount + b.observerCount + b.scrollCount + b.indicatorCount + b.accessibilityCount + b.testCount;
    const aScore = a.activeCount + a.observerCount + a.scrollCount + a.indicatorCount + a.accessibilityCount + a.testCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function tocReadinessFramework(source: TocReadinessSourceFile): TocReadinessReport["tocSetups"][number]["framework"] {
  if (/@zag-js\/toc|toc\.machine|toc\.connect/i.test(source.text)) return "zag-toc";
  if (/custom toc|scroll-spy|toc-traces|aria-current(?:=['"]location|-location)|HashChangeEvent/i.test(source.text)) return "custom";
  if (/table-of-contents|toc:\s*true|docs toc|mdx toc|remark-toc/i.test(source.text)) return "docs-toc";
  return "unknown";
}

function tocReadinessFrameworkSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: TocReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-toc", pattern: /@zag-js\/toc|toc\.machine|toc\.connect/i, evidence: "Zag TOC evidence was detected." },
    { signal: "docs-toc", pattern: /table-of-contents|toc:\s*true|docs toc|mdx toc|remark-toc/i, evidence: "docs TOC evidence was detected." },
    { signal: "custom", pattern: /custom toc|scroll-spy|toc-traces|aria-current(?:=['"]location|-location)|HashChangeEvent/i, evidence: "custom TOC evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function tocReadinessStructureSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["structureSignals"] {
  const specs: Array<{ signal: TocReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|<nav|toc-root/i, evidence: "root evidence was detected." },
    { signal: "title", pattern: /getTitleProps|data-part=['"]title|toc-title|<h2/i, evidence: "title evidence was detected." },
    { signal: "list", pattern: /getListProps|data-part=['"]list|<ol|<ul|\blist\b/i, evidence: "list evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-part=['"]item|data-depth|data-active/i, evidence: "item evidence was detected." },
    { signal: "link", pattern: /getLinkProps|data-part=['"]link|href=|aria-current/i, evidence: "link evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|data-part=['"]indicator|indicatorRect|indicator-rect|data-indicator-rect/i, evidence: "indicator evidence was detected." },
    { signal: "heading", pattern: /getHeadingEl|document\.getElementById|<h2|<h3|#intro|\bheading\b|headings/i, evidence: "heading evidence was detected." },
    { signal: "css-indicator", pattern: /--top|--left|--width|--height|top-left-width-height/i, evidence: "CSS indicator evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function tocReadinessStateSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["stateSignals"] {
  const specs: Array<{ signal: TocReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "active-ids", pattern: /activeIds|active-ids|ACTIVE_IDS\.SET/i, evidence: "active ids evidence was detected." },
    { signal: "active-items", pattern: /activeItems|active-items/i, evidence: "active items evidence was detected." },
    { signal: "default-active-ids", pattern: /defaultActiveIds|default-active-ids/i, evidence: "default active ids evidence was detected." },
    { signal: "active-item-state", pattern: /getItemState|active item state|active-item-state/i, evidence: "active item state evidence was detected." },
    { signal: "first-active", pattern: /data-first|first-active|\bfirst\b/i, evidence: "first active evidence was detected." },
    { signal: "last-active", pattern: /data-last|last-active|\blast\b/i, evidence: "last active evidence was detected." },
    { signal: "depth", pattern: /data-depth|\bdepth\b|--depth/i, evidence: "depth evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function tocReadinessObserverSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["observerSignals"] {
  const specs: Array<{ signal: TocReadinessReport["observerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "intersection-observer", pattern: /IntersectionObserver|intersection-observer/i, evidence: "IntersectionObserver evidence was detected." },
    { signal: "root-margin", pattern: /rootMargin|root-margin/i, evidence: "rootMargin evidence was detected." },
    { signal: "threshold", pattern: /\bthreshold\b/i, evidence: "threshold evidence was detected." },
    { signal: "scroll-root", pattern: /scrollEl|scroll-root|data-scroll-root/i, evidence: "scroll root evidence was detected." },
    { signal: "visibility-map", pattern: /visibilityMap|visibility-map/i, evidence: "visibility map evidence was detected." },
    { signal: "resize-observer", pattern: /ResizeObserver|resizeObserverBorderBox|resize-observer/i, evidence: "resize observer evidence was detected." },
    { signal: "indicator-cleanup", pattern: /indicatorCleanup|indicator-cleanup/i, evidence: "indicator cleanup evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "observer", "signal");
}

function tocReadinessScrollSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["scrollSignals"] {
  const specs: Array<{ signal: TocReadinessReport["scrollSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "auto-scroll", pattern: /autoScroll|auto-scroll/i, evidence: "auto scroll evidence was detected." },
    { signal: "scroll-behavior", pattern: /scrollBehavior|scroll-behavior/i, evidence: "scroll behavior evidence was detected." },
    { signal: "scroll-to", pattern: /scrollTo|scroll-to/i, evidence: "scrollTo evidence was detected." },
    { signal: "scroll-into-view", pattern: /scrollIntoView|scroll-into-view/i, evidence: "scrollIntoView evidence was detected." },
    { signal: "same-page-hash", pattern: /getSamePageHash|same-page-hash/i, evidence: "same-page hash evidence was detected." },
    { signal: "push-hash", pattern: /pushHash|push-hash|history\.pushState/i, evidence: "push hash evidence was detected." },
    { signal: "hashchange", pattern: /hashchange|HashChangeEvent/i, evidence: "hashchange evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "scroll", "signal");
}

function tocReadinessIndicatorSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["indicatorSignals"] {
  const specs: Array<{ signal: TocReadinessReport["indicatorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "indicator-rect", pattern: /indicatorRect|indicator-rect|data-indicator-rect/i, evidence: "indicator rect evidence was detected." },
    { signal: "rect-empty", pattern: /isRectEmpty|rect-empty/i, evidence: "rect-empty evidence was detected." },
    { signal: "top-left-width-height", pattern: /--top|--left|--width|--height|top-left-width-height/i, evidence: "top/left/width/height evidence was detected." },
    { signal: "active-range", pattern: /active range|active-range|data-first|data-last|first-active|last-active/i, evidence: "active range evidence was detected." },
    { signal: "resize-border-box", pattern: /resizeObserverBorderBox|resize-border-box/i, evidence: "resize border-box evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "indicator", "signal");
}

function tocReadinessAccessibilitySignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: TocReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-current-location", pattern: /aria-current=['"]location|aria-current-location/i, evidence: "aria-current location evidence was detected." },
    { signal: "data-active", pattern: /data-active/i, evidence: "data-active evidence was detected." },
    { signal: "data-depth", pattern: /data-depth/i, evidence: "data-depth evidence was detected." },
    { signal: "data-first", pattern: /data-first/i, evidence: "data-first evidence was detected." },
    { signal: "data-last", pattern: /data-last/i, evidence: "data-last evidence was detected." },
    { signal: "direction", pattern: /\bdir\s*[:=]|direction|\bdir\b/i, evidence: "direction evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function tocReadinessMachineSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["machineSignals"] {
  const specs: Array<{ signal: TocReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine\s+TocSchema|setup<TocSchema>|createMachine\(/i, evidence: "createMachine TocSchema evidence was detected." },
    { signal: "default-props", pattern: /dir\s+ltr[\s\S]{0,260}rootMargin[\s\S]{0,260}threshold\s+0[\s\S]{0,260}autoScroll\s+true[\s\S]{0,260}scrollBehavior\s+smooth/i, evidence: "default prop evidence was detected." },
    { signal: "bindable-context", pattern: /activeIds[\s\S]{0,140}bindable[\s\S]{0,180}indicatorRect[\s\S]{0,140}bindable|context\s+activeIds\s+bindable[\s\S]{0,120}indicatorRect\s+bindable/i, evidence: "bindable context evidence was detected." },
    { signal: "refs", pattern: /refs[\s\S]{0,120}visibilityMap[\s\S]{0,120}indicatorCleanup|refs\s+visibilityMap\s+indicatorCleanup/i, evidence: "machine refs evidence was detected." },
    { signal: "computed-state", pattern: /computed[\s\S]{0,160}activeItems|computed\s+activeItems/i, evidence: "computed state evidence was detected." },
    { signal: "watch-active-ids", pattern: /watch[\s\S]{0,180}activeIds[\s\S]{0,180}autoScrollToc[\s\S]{0,120}syncIndicatorRect|watch\s+activeIds\s+autoScrollToc\s+syncIndicatorRect/i, evidence: "active ids watch evidence was detected." },
    { signal: "entry-exit-actions", pattern: /entry[\s\S]{0,80}syncIndicatorRect[\s\S]{0,120}exit[\s\S]{0,80}cleanupIndicatorObserver|entry\s+syncIndicatorRect\s+exit\s+cleanupIndicatorObserver/i, evidence: "entry and exit action evidence was detected." },
    { signal: "active-ids-event", pattern: /ACTIVE_IDS\.SET/i, evidence: "ACTIVE_IDS.SET event evidence was detected." },
    { signal: "idle-effect", pattern: /idle[\s\S]{0,120}effects[\s\S]{0,80}trackHeadingVisibility|effects\s+trackHeadingVisibility/i, evidence: "idle trackHeadingVisibility effect evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function tocReadinessContextSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["contextSignals"] {
  const specs: Array<{ signal: TocReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "active-ids-context", pattern: /activeIds[\s\S]{0,120}bindable[\s\S]{0,160}(defaultActiveIds|activeIds)|activeIds\s+bindable\s+defaultActiveIds\s+activeIds/i, evidence: "activeIds bindable context evidence was detected." },
    { signal: "indicator-rect-context", pattern: /indicatorRect[\s\S]{0,120}bindable[\s\S]{0,120}(defaultValue|null)|indicatorRect\s+bindable\s+null/i, evidence: "indicatorRect bindable context evidence was detected." },
    { signal: "visibility-map-ref", pattern: /visibilityMap[\s\S]{0,80}(new\s+Map|Map)|visibilityMap\s+Map/i, evidence: "visibilityMap ref evidence was detected." },
    { signal: "indicator-cleanup-ref", pattern: /indicatorCleanup[\s\S]{0,80}(null|ref)|indicatorCleanup\s+ref/i, evidence: "indicatorCleanup ref evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function tocReadinessComputedSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["computedSignals"] {
  const specs: Array<{ signal: TocReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "active-items", pattern: /activeItems[\s\S]{0,160}(filter|includes|item\s+value)|activeItems\s+prop\s+items\s+filter\s+ids\s+includes\s+item\s+value/i, evidence: "activeItems computed evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function tocReadinessEffectSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["effectSignals"] {
  const specs: Array<{ signal: TocReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-heading-visibility", pattern: /trackHeadingVisibility/i, evidence: "trackHeadingVisibility effect evidence was detected." },
    { signal: "intersection-observer", pattern: /IntersectionObserver|intersection-observer/i, evidence: "IntersectionObserver effect evidence was detected." },
    { signal: "observer-options", pattern: /observerOptions[\s\S]{0,160}rootMargin[\s\S]{0,120}threshold|rootMargin[\s\S]{0,120}threshold/i, evidence: "observer options evidence was detected." },
    { signal: "scroll-root", pattern: /scrollEl|scroll-root|observerOptions[\s\S]{0,80}root/i, evidence: "scroll root evidence was detected." },
    { signal: "visibility-map", pattern: /visibilityMap[\s\S]{0,180}isIntersecting|visibilityMap\s+isIntersecting/i, evidence: "visibility map effect evidence was detected." },
    { signal: "observer-cleanup", pattern: /observer[\s\S]{0,120}observe[\s\S]{0,160}disconnect[\s\S]{0,120}visibilityMap[\s\S]{0,80}clear|observer\s+observe\s+disconnect\s+visibilityMap\s+clear/i, evidence: "observer cleanup evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function tocReadinessActionSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["actionSignals"] {
  const specs: Array<{ signal: TocReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-active-ids", pattern: /setActiveIds/i, evidence: "setActiveIds action evidence was detected." },
    { signal: "auto-scroll-toc", pattern: /autoScrollToc[\s\S]{0,140}scrollIntoView|autoScrollToc\s+scrollIntoView/i, evidence: "autoScrollToc action evidence was detected." },
    { signal: "cleanup-indicator-observer", pattern: /cleanupIndicatorObserver/i, evidence: "cleanupIndicatorObserver action evidence was detected." },
    { signal: "sync-indicator-rect", pattern: /syncIndicatorRect[\s\S]{0,180}(indicatorRect|getBoundingClientRect)|syncIndicatorRect\s+getIndicatorEl\s+indicatorRect/i, evidence: "syncIndicatorRect action evidence was detected." },
    { signal: "resize-observer-border-box", pattern: /resizeObserverBorderBox[\s\S]{0,120}observe|resizeObserverBorderBox\s+observe/i, evidence: "resizeObserverBorderBox action evidence was detected." },
    { signal: "invoke-active-change", pattern: /invokeOnActiveChange/i, evidence: "invokeOnActiveChange evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function tocReadinessDomSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["domSignals"] {
  const specs: Array<{ signal: TocReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id DOM evidence was detected." },
    { signal: "title-id", pattern: /getTitleId/i, evidence: "title id DOM evidence was detected." },
    { signal: "list-id", pattern: /getListId/i, evidence: "list id DOM evidence was detected." },
    { signal: "item-id", pattern: /getItemId/i, evidence: "item id DOM evidence was detected." },
    { signal: "link-id", pattern: /getLinkId/i, evidence: "link id DOM evidence was detected." },
    { signal: "indicator-id", pattern: /getIndicatorId/i, evidence: "indicator id DOM evidence was detected." },
    { signal: "root-el", pattern: /getRootEl/i, evidence: "root element DOM evidence was detected." },
    { signal: "list-el", pattern: /getListEl/i, evidence: "list element DOM evidence was detected." },
    { signal: "item-el", pattern: /getItemEl/i, evidence: "item element DOM evidence was detected." },
    { signal: "indicator-el", pattern: /getIndicatorEl/i, evidence: "indicator element DOM evidence was detected." },
    { signal: "heading-el", pattern: /getHeadingEl[\s\S]{0,120}(getDoc|getElementById)|getHeadingEl\s+getDoc\s+getElementById/i, evidence: "heading element DOM evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function tocReadinessApiSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["apiSignals"] {
  const specs: Array<{ signal: TocReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "active-ids", pattern: /api\.activeIds|activeIds/i, evidence: "activeIds API evidence was detected." },
    { signal: "active-items", pattern: /api\.activeItems|activeItems/i, evidence: "activeItems API evidence was detected." },
    { signal: "items", pattern: /api\.items|\bitems\b/i, evidence: "items API evidence was detected." },
    { signal: "set-active-ids", pattern: /api\.setActiveIds|setActiveIds/i, evidence: "setActiveIds API evidence was detected." },
    { signal: "scroll-to", pattern: /api\.scrollTo|scrollTo\(|scroll-to/i, evidence: "scrollTo API evidence was detected." },
    { signal: "item-state", pattern: /api\.getItemState|getItemState/i, evidence: "item state API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "title-props", pattern: /getTitleProps/i, evidence: "title props API evidence was detected." },
    { signal: "list-props", pattern: /getListProps/i, evidence: "list props API evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props API evidence was detected." },
    { signal: "link-props", pattern: /getLinkProps/i, evidence: "link props API evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps/i, evidence: "indicator props API evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby API evidence was detected." },
    { signal: "aria-current-location", pattern: /aria-current[\s\S]{0,40}location|aria-current-location/i, evidence: "aria-current location API evidence was detected." },
    { signal: "data-active", pattern: /data-active/i, evidence: "data-active API evidence was detected." },
    { signal: "same-page-hash", pattern: /getSamePageHash|same-page-hash/i, evidence: "same-page hash API evidence was detected." },
    { signal: "push-hash", pattern: /pushHash|HashChangeEvent|push-hash/i, evidence: "push hash API evidence was detected." },
    { signal: "scroll-to-element", pattern: /scrollToElement/i, evidence: "scrollToElement API evidence was detected." },
    { signal: "css-variables", pattern: /--top|--left|--width|--height/i, evidence: "indicator CSS variable API evidence was detected." },
    { signal: "hidden-indicator", pattern: /hidden[\s\S]{0,80}isRectEmpty|hidden\s+isRectEmpty/i, evidence: "hidden indicator API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir\s+prop|dir-prop/i, evidence: "dir prop API evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value API evidence was detected." },
    { signal: "data-depth", pattern: /data-depth/i, evidence: "data-depth API evidence was detected." },
    { signal: "data-first", pattern: /data-first/i, evidence: "data-first API evidence was detected." },
    { signal: "data-last", pattern: /data-last/i, evidence: "data-last API evidence was detected." },
    { signal: "depth-css-var", pattern: /--depth|depth-css-var/i, evidence: "depth CSS variable API evidence was detected." },
    { signal: "scroll-behavior", pattern: /scrollBehavior|scroll-behavior/i, evidence: "scroll behavior API evidence was detected." },
    { signal: "scroll-into-view", pattern: /scrollIntoView|scroll-into-view/i, evidence: "scrollIntoView API evidence was detected." },
    { signal: "prevent-default", pattern: /preventDefault|prevent-default/i, evidence: "preventDefault API evidence was detected." },
    { signal: "download-guard", pattern: /isDownloadingEvent|download-guard/i, evidence: "download guard API evidence was detected." },
    { signal: "new-tab-guard", pattern: /isOpeningInNewTab|new-tab-guard/i, evidence: "new tab guard API evidence was detected." },
    { signal: "hashchange-event", pattern: /HashChangeEvent|hashchange-event/i, evidence: "HashChangeEvent API evidence was detected." },
    { signal: "indicator-position-absolute", pattern: /position\s*:\s*["']absolute["']|position absolute|indicator-position-absolute/i, evidence: "indicator absolute positioning API evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function tocReadinessTestSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["testSignals"] {
  const specs: Array<{ signal: TocReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "observer-test", pattern: /observer-test|IntersectionObserver|ResizeObserver/i, evidence: "observer test evidence was detected." },
    { signal: "scroll-test", pattern: /scroll-test|scrollIntoView|scrollToElement|scrollTo/i, evidence: "scroll test evidence was detected." },
    { signal: "active-test", pattern: /active-test|data-active|activeIds|active-ids/i, evidence: "active test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|getByRole|aria-current|aria-labelledby/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|toc-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function tocReadinessPackageSignals(sourceFiles: TocReadinessSourceFile[]): TocReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TocReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/toc", pattern: /@zag-js\/toc/i, evidence: "@zag-js/toc dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return tocReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function tocReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TocReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/toc-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
