import path from "node:path";
import type { CollapsibleReadinessReport, EditableReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildCollapsibleReadinessReport(walk: WalkResult): Promise<CollapsibleReadinessReport> {
  const sourceFiles = await collapsibleReadinessSourceFiles(walk);
  const collapsibleSetups = collapsibleReadinessSetups(sourceFiles);
  const frameworkSignals = collapsibleReadinessFrameworkSignals(sourceFiles);
  const structureSignals = collapsibleReadinessStructureSignals(sourceFiles);
  const stateSignals = collapsibleReadinessStateSignals(sourceFiles);
  const sizeSignals = collapsibleReadinessSizeSignals(sourceFiles);
  const animationSignals = collapsibleReadinessAnimationSignals(sourceFiles);
  const focusSignals = collapsibleReadinessFocusSignals(sourceFiles);
  const accessibilitySignals = collapsibleReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = collapsibleReadinessMachineSignals(sourceFiles);
  const contextSignals = collapsibleReadinessContextSignals(sourceFiles);
  const effectSignals = collapsibleReadinessEffectSignals(sourceFiles);
  const actionSignals = collapsibleReadinessActionSignals(sourceFiles);
  const guardSignals = collapsibleReadinessGuardSignals(sourceFiles);
  const domSignals = collapsibleReadinessDomSignals(sourceFiles);
  const apiSignals = collapsibleReadinessApiSignals(sourceFiles);
  const testSignals = collapsibleReadinessTestSignals(sourceFiles);
  const packageSignals = collapsibleReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || collapsibleSetups.some((item) => item.rootCount > 0 && item.triggerCount > 0 && item.contentCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || collapsibleSetups.some((item) => item.stateCount > 0);
  const hasSize = sizeSignals.some((item) => item.readiness === "ready") || collapsibleSetups.some((item) => item.sizeCount > 0);
  const hasAnimation = animationSignals.some((item) => item.readiness === "ready") || collapsibleSetups.some((item) => item.animationCount > 0);
  const hasFocus = focusSignals.some((item) => item.readiness === "ready") || collapsibleSetups.some((item) => item.tabbableCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || collapsibleSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || collapsibleSetups.some((item) => item.testCount > 0);

  const riskQueue: CollapsibleReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document collapsible root, trigger, content, and indicator structure before claiming collapsible readiness.",
      why: "Collapsible readiness starts with traceable disclosure anatomy and ownership of the toggle boundary.",
      relatedHref: "html/collapsible-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace open, closed, closing, visible, disabled, controlled open, and default open state.",
      why: "Collapsible UI can render while controlled state and exit lifecycle diverge.",
      relatedHref: "html/collapsible-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasSize) {
    riskQueue.push({
      priority: "medium",
      action: "Trace size.measure, collapsedHeight, collapsedWidth, CSS variables, hidden state, and overflow constraints.",
      why: "Collapsed-size behavior depends on measured content dimensions and explicit collapsed bounds.",
      relatedHref: "html/collapsible-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasAnimation) {
    riskQueue.push({
      priority: "medium",
      action: "Trace enter animation, exit animation, animation.end, onExitComplete, initial state, and cleanup.",
      why: "Closing state and exit completion are animation lifecycle concerns that static markup alone cannot prove.",
      relatedHref: "html/collapsible-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasFocus) {
    riskQueue.push({
      priority: "medium",
      action: "Trace tabbable discovery, inert handling, child observation, restore-inert cleanup, and disabled trigger behavior.",
      why: "Collapsed-size content needs focus containment so hidden children do not stay tabbable.",
      relatedHref: "html/collapsible-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify trigger button type, aria-expanded, aria-controls, data-state, data-disabled, and hidden content semantics.",
      why: "Disclosure semantics must remain screen-reader and keyboard discoverable.",
      relatedHref: "html/collapsible-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, ARIA, animation, size, and artifact tests for collapsible traces.",
      why: "Static collapsible evidence does not prove trigger interaction, size transitions, inert cleanup, or exit completion behavior.",
      relatedHref: "html/collapsible-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real toggle behavior, layout measurement, animations, tabbable inert handling, and project tests outside RepoTutor.",
    why: "RepoTutor records collapsible readiness only; it does not toggle real DOM visibility, measure layout, run animations, mutate tabbables, set inert attributes, dispatch clicks, or run analyzed project tests.",
    relatedHref: "html/collapsible-readiness.html"
  });

  return {
    summary: `Collapsible readiness report: setup ${collapsibleSetups.length} files, structure signal ${structureSignals.length}, size signal ${sizeSignals.length}, machine signal ${machineSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`,
    sourcePattern: "Collapsible readiness Zag collapsible open closed closing collapsed size animation inert aria tests",
    collapsibleSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    sizeSignals,
    animationSignals,
    focusSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    effectSignals,
    actionSignals,
    guardSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/collapsible|collapsible\\.machine|collapsible\\.connect|getRootProps|getTriggerProps|getContentProps|getIndicatorProps\" package.json src app packages", purpose: "Find Zag collapsible machine, connect API, and anatomy props." },
      { command: "rg \"open|defaultOpen|onOpenChange|onExitComplete|controlled\\.open|controlled\\.close|animation\\.end|setOpen|measureSize\" src app packages", purpose: "Trace state, controlled callbacks, animation lifecycle, and size measurement." },
      { command: "rg \"collapsedHeight|collapsedWidth|--collapsed-height|--collapsed-width|data-has-collapsed-size|trackTabbableElements|inert|observe\" src app packages", purpose: "Check collapsed-size CSS variables, tabbable inert handling, and child observation." },
      { command: "rg \"aria-expanded|aria-controls|type=['\\\"]button|hidden|click-test|aria-test|animation-test|size-test|upload-artifact\" src app packages test tests .github", purpose: "Check disclosure accessibility semantics, tests, and artifact traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag collapsible, Radix collapsible, native disclosure markup, or custom toggle logic.",
      "Trace root, trigger, content, and indicator anatomy before reviewing behavior.",
      "Map open, closed, closing, visible, disabled, controlled-open, default-open, measured size, collapsed size, animation, and inert focus flows.",
      "Check aria-expanded, aria-controls, data-state, data-disabled, button type, hidden content, and tests.",
      "This report is static readiness. Real visibility toggles, layout measurement, animations, inert mutation, click behavior, and project tests need trusted QA."
    ]
  };
}

type CollapsibleReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function collapsibleReadinessSourceFiles(walk: WalkResult): Promise<CollapsibleReadinessSourceFile[]> {
  const files: CollapsibleReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !collapsibleReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!collapsibleReadinessPathSignal(file.relPath) && !collapsibleReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function collapsibleReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return collapsibleReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function collapsibleReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(collapsible|disclosure|accordion|details|expandable)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function collapsibleReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/collapsible|@radix-ui\/react-collapsible|collapsible\.machine|collapsible\.connect|getTriggerProps|getContentProps|aria-expanded|data-collapsible|collapsible-traces)/i.test(text);
}

function collapsibleReadinessSetups(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["collapsibleSetups"] {
  const rows: CollapsibleReadinessReport["collapsibleSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(collapsible\.machine|collapsible\.connect|getRootProps|data-collapsible-root|Collapsible\.Root|collapsible root|disclosure root)/gi);
    const triggerCount = countMatches(source.text, /(getTriggerProps|Collapsible\.Trigger|aria-expanded|aria-controls|type=['"]button|Toggle details|disabled-trigger)/gi);
    const contentCount = countMatches(source.text, /(getContentProps|Collapsible\.Content|data-collapsible|data-has-collapsed-size|hidden|faq-panel|release-notes-content)/gi);
    const indicatorCount = countMatches(source.text, /(getIndicatorProps|data-part=['"]indicator|collapsible indicator|<span[^>]+indicator|indicator)/gi);
    const stateCount = countMatches(source.text, /(open|closed|closing|visible|disabled|controlled\.open|controlled\.close|controlled-open|defaultOpen|default-open|setOpen|onOpenChange|toggleVisibility)/gi);
    const sizeCount = countMatches(source.text, /(measureSize|size\.measure|collapsedHeight|collapsedWidth|collapsed-height|collapsed-width|--height|--width|--collapsed-height|--collapsed-width|data-has-collapsed-size|overflow|minHeight|maxHeight|hidden)/gi);
    const animationCount = countMatches(source.text, /(trackEnterAnimation|trackExitAnimation|enter-animation|exit-animation|animation\.end|animation-end|onExitComplete|exit-complete|initial-state|setInitial|clearInitial|cleanupNode|cleanup)/gi);
    const tabbableCount = countMatches(source.text, /(trackTabbableElements|tabbables|inert|observe|MutationObserver|observe-children|restore-inert|disabled-trigger)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-expanded|aria-controls|data-state|data-disabled|type=['"]button|hidden|getByRole|button type)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|vi\.useFakeTimers|click-test|aria-test|animation-test|size-test|collapsible-traces|upload-artifact)/gi);
    const total = rootCount + triggerCount + contentCount + indicatorCount + stateCount + sizeCount + animationCount + tabbableCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && triggerCount > 0 && contentCount > 0 && indicatorCount > 0 && stateCount > 0 && sizeCount > 0 && animationCount > 0 && tabbableCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: collapsibleReadinessFramework(source),
      rootCount,
      triggerCount,
      contentCount,
      indicatorCount,
      stateCount,
      sizeCount,
      animationCount,
      tabbableCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, trigger ${triggerCount}, content ${contentCount}, indicator ${indicatorCount}, state ${stateCount}, size ${sizeCount}, animation ${animationCount}, tabbable ${tabbableCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.stateCount + b.sizeCount + b.animationCount + b.accessibilityCount - (a.stateCount + a.sizeCount + a.animationCount + a.accessibilityCount));
}

function collapsibleReadinessFramework(source: CollapsibleReadinessSourceFile): CollapsibleReadinessReport["collapsibleSetups"][number]["framework"] {
  if (/@zag-js\/collapsible|collapsible\.machine|collapsible\.connect|getTriggerProps|getContentProps/i.test(source.text)) return "zag-collapsible";
  if (/@radix-ui\/react-collapsible|Collapsible\.Root|Collapsible\.Trigger|Collapsible\.Content/i.test(source.text)) return "radix-collapsible";
  if (/aria-expanded|aria-controls|data-collapsible|hidden|<details|<summary/i.test(source.text)) return "native-disclosure";
  if (/collapsible|disclosure|expandable|accordion/i.test(source.text)) return "custom";
  return "unknown";
}

function collapsibleReadinessFrameworkSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-collapsible", pattern: /@zag-js\/collapsible|collapsible\.machine|collapsible\.connect|getTriggerProps|getContentProps/i, evidence: "Zag collapsible evidence was detected." },
    { signal: "radix-collapsible", pattern: /@radix-ui\/react-collapsible|Collapsible\.Root|Collapsible\.Trigger|Collapsible\.Content/i, evidence: "Radix collapsible evidence was detected." },
    { signal: "native-disclosure", pattern: /aria-expanded|aria-controls|data-collapsible|hidden|<details|<summary/i, evidence: "native disclosure evidence was detected." },
    { signal: "custom", pattern: /collapsible|disclosure|expandable|accordion/i, evidence: "custom collapsible evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function collapsibleReadinessStructureSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["structureSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-collapsible-root|Collapsible\.Root|collapsible\.machine/i, evidence: "root evidence was detected." },
    { signal: "trigger", pattern: /getTriggerProps|Collapsible\.Trigger|aria-expanded|aria-controls|Toggle details/i, evidence: "trigger evidence was detected." },
    { signal: "content", pattern: /getContentProps|Collapsible\.Content|data-collapsible|hidden|release-notes-content|faq-panel/i, evidence: "content evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|data-part=['"]indicator|indicator/i, evidence: "indicator evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function collapsibleReadinessStateSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["stateSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /\bopen\b|setOpen|onOpenChange/i, evidence: "open state evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed/i, evidence: "closed state evidence was detected." },
    { signal: "closing", pattern: /\bclosing\b|state:\s*["']closing/i, evidence: "closing state evidence was detected." },
    { signal: "visible", pattern: /\bvisible\b|api\.visible/i, evidence: "visible state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled|api\.disabled/i, evidence: "disabled state evidence was detected." },
    { signal: "controlled-open", pattern: /controlled\.open|controlled-open|open:\s*true|setOpen/i, evidence: "controlled open evidence was detected." },
    { signal: "default-open", pattern: /defaultOpen|default-open/i, evidence: "default open evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function collapsibleReadinessSizeSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["sizeSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["sizeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "measure-size", pattern: /measureSize|size\.measure|computeSize/i, evidence: "size measurement evidence was detected." },
    { signal: "collapsed-height", pattern: /collapsedHeight|collapsed-height|--collapsed-height/i, evidence: "collapsed height evidence was detected." },
    { signal: "collapsed-width", pattern: /collapsedWidth|collapsed-width|--collapsed-width/i, evidence: "collapsed width evidence was detected." },
    { signal: "css-vars", pattern: /--height|--width|--collapsed-height|--collapsed-width/i, evidence: "CSS variable evidence was detected." },
    { signal: "hidden", pattern: /\bhidden\b|hidden=/i, evidence: "hidden content evidence was detected." },
    { signal: "overflow", pattern: /overflow|minHeight|maxHeight|minWidth|maxWidth/i, evidence: "overflow constraint evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "size", "signal");
}

function collapsibleReadinessAnimationSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["animationSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["animationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "enter-animation", pattern: /trackEnterAnimation|enter-animation/i, evidence: "enter animation evidence was detected." },
    { signal: "exit-animation", pattern: /trackExitAnimation|exit-animation/i, evidence: "exit animation evidence was detected." },
    { signal: "animation-end", pattern: /animation\.end|animation-end/i, evidence: "animation end evidence was detected." },
    { signal: "exit-complete", pattern: /onExitComplete|invokeOnExitComplete|exit-complete/i, evidence: "exit complete evidence was detected." },
    { signal: "initial-state", pattern: /setInitial|clearInitial|initial-state|\binitial\b/i, evidence: "initial state evidence was detected." },
    { signal: "cleanup", pattern: /cleanupNode|cleanup|restore-inert/i, evidence: "cleanup evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "animation", "signal");
}

function collapsibleReadinessFocusSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["focusSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["focusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tabbables", pattern: /trackTabbableElements|tabbables|tabbable/i, evidence: "tabbable element evidence was detected." },
    { signal: "inert", pattern: /\binert\b/i, evidence: "inert evidence was detected." },
    { signal: "observe-children", pattern: /observe-children|observe child|MutationObserver|childList|observe/i, evidence: "child observation evidence was detected." },
    { signal: "restore-inert", pattern: /restore-inert|cleanupNode|cleanup/i, evidence: "restore inert evidence was detected." },
    { signal: "disabled-trigger", pattern: /disabled-trigger|data-disabled|disabled/i, evidence: "disabled trigger evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "focus", "signal");
}

function collapsibleReadinessAccessibilitySignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-expanded", pattern: /aria-expanded|getByRole\(['"]button/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "button-type", pattern: /type=['"]button|button type|getTriggerProps/i, evidence: "button type evidence was detected." },
    { signal: "hidden", pattern: /\bhidden\b|hidden=/i, evidence: "hidden accessibility evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function collapsibleReadinessMachineSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["machineSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine|collapsible\.machine/i, evidence: "collapsible machine creation evidence was detected." },
    { signal: "initial-open", pattern: /initialState[\s\S]{0,160}open|defaultOpen|initialState open/i, evidence: "initial open evidence was detected." },
    { signal: "initial-closed", pattern: /initialState[\s\S]{0,180}closed|initialState closed/i, evidence: "initial closed evidence was detected." },
    { signal: "open-state", pattern: /states:[\s\S]{0,800}\bopen\b|state:\s*["']open|data-state.+open|\bopen\b/i, evidence: "open state evidence was detected." },
    { signal: "closed-state", pattern: /states:[\s\S]{0,800}\bclosed\b|state:\s*["']closed|data-state.+closed|\bclosed\b/i, evidence: "closed state evidence was detected." },
    { signal: "closing-state", pattern: /states:[\s\S]{0,800}\bclosing\b|state:\s*["']closing|\bclosing\b/i, evidence: "closing state evidence was detected." },
    { signal: "controlled-open-event", pattern: /controlled\.open/i, evidence: "controlled open event evidence was detected." },
    { signal: "controlled-close-event", pattern: /controlled\.close/i, evidence: "controlled close event evidence was detected." },
    { signal: "open-event", pattern: /["']open["']|\bopen\b/i, evidence: "open event evidence was detected." },
    { signal: "close-event", pattern: /["']close["']|\bclose\b/i, evidence: "close event evidence was detected." },
    { signal: "size-measure-event", pattern: /size\.measure/i, evidence: "size.measure event evidence was detected." },
    { signal: "animation-end-event", pattern: /animation\.end/i, evidence: "animation.end event evidence was detected." },
    { signal: "watch-open", pattern: /watch\(|track\(\[\(\)\s*=>\s*prop\(["']open["']\)\]|toggleVisibility/i, evidence: "open watcher evidence was detected." },
    { signal: "exit-cleanup", pattern: /exit:\s*\[\s*["']cleanupNode|cleanupNode/i, evidence: "exit cleanup evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function collapsibleReadinessContextSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["contextSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "size-context", pattern: /size:\s*bindable|defaultValue:\s*\{\s*height|height.+width|size context/i, evidence: "size context evidence was detected." },
    { signal: "initial-context", pattern: /initial:\s*bindable|\binitial\b/i, evidence: "initial context evidence was detected." },
    { signal: "cleanup-ref", pattern: /cleanup:\s*undefined|refs.+cleanup|\bcleanup\b/i, evidence: "cleanup ref evidence was detected." },
    { signal: "styles-ref", pattern: /stylesRef/i, evidence: "stylesRef evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function collapsibleReadinessEffectSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["effectSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-enter-animation", pattern: /trackEnterAnimation/i, evidence: "trackEnterAnimation effect evidence was detected." },
    { signal: "track-exit-animation", pattern: /trackExitAnimation/i, evidence: "trackExitAnimation effect evidence was detected." },
    { signal: "track-tabbable-elements", pattern: /trackTabbableElements/i, evidence: "trackTabbableElements effect evidence was detected." },
    { signal: "computed-style", pattern: /getComputedStyle|animationName/i, evidence: "computed style evidence was detected." },
    { signal: "animationend-listener", pattern: /animationend|addEventListener|removeEventListener/i, evidence: "animationend listener evidence was detected." },
    { signal: "raf", pattern: /\braf\b|rafCleanup/i, evidence: "requestAnimationFrame helper evidence was detected." },
    { signal: "next-tick", pattern: /nextTick/i, evidence: "nextTick evidence was detected." },
    { signal: "tabbables", pattern: /getTabbables|tabbables/i, evidence: "tabbable lookup evidence was detected." },
    { signal: "set-inert", pattern: /setAttribute.+inert|\binert\b/i, evidence: "inert mutation evidence was detected." },
    { signal: "observe-children", pattern: /observeChildren|observe-children/i, evidence: "child observation evidence was detected." },
    { signal: "set-style", pattern: /setStyle|animationFillMode/i, evidence: "style restore evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function collapsibleReadinessActionSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["actionSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-initial", pattern: /setInitial/i, evidence: "setInitial action evidence was detected." },
    { signal: "clear-initial", pattern: /clearInitial/i, evidence: "clearInitial action evidence was detected." },
    { signal: "cleanup-node", pattern: /cleanupNode/i, evidence: "cleanupNode action evidence was detected." },
    { signal: "measure-size", pattern: /measureSize|getBoundingClientRect/i, evidence: "measureSize action evidence was detected." },
    { signal: "compute-size", pattern: /computeSize/i, evidence: "computeSize action evidence was detected." },
    { signal: "invoke-on-open", pattern: /invokeOnOpen|onOpenChange.+open:\s*true/i, evidence: "invokeOnOpen action evidence was detected." },
    { signal: "invoke-on-close", pattern: /invokeOnClose|onOpenChange.+open:\s*false/i, evidence: "invokeOnClose action evidence was detected." },
    { signal: "invoke-on-exit-complete", pattern: /invokeOnExitComplete|onExitComplete/i, evidence: "invokeOnExitComplete action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility|controlled\.open|controlled\.close/i, evidence: "toggleVisibility action evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function collapsibleReadinessGuardSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["guardSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-open-controlled", pattern: /isOpenControlled|prop\(["']open["']\)\s*!=\s*undefined/i, evidence: "isOpenControlled guard evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function collapsibleReadinessDomSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["domSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id helper evidence was detected." },
    { signal: "content-id", pattern: /getContentId/i, evidence: "content id helper evidence was detected." },
    { signal: "trigger-id", pattern: /getTriggerId/i, evidence: "trigger id helper evidence was detected." },
    { signal: "root-el", pattern: /getRootEl/i, evidence: "root element helper evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element helper evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl/i, evidence: "trigger element helper evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function collapsibleReadinessApiSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["apiSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "disabled", pattern: /api\.disabled|\bdisabled\b/i, evidence: "disabled API evidence was detected." },
    { signal: "visible", pattern: /api\.visible|\bvisible\b/i, evidence: "visible API evidence was detected." },
    { signal: "open", pattern: /api\.open|\bopen\b/i, evidence: "open API evidence was detected." },
    { signal: "measure-size", pattern: /api\.measureSize|measureSize/i, evidence: "measureSize API evidence was detected." },
    { signal: "set-open", pattern: /api\.setOpen|setOpen/i, evidence: "setOpen API evidence was detected." },
    { signal: "root-props", pattern: /api\.getRootProps|getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "content-props", pattern: /api\.getContentProps|getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "trigger-props", pattern: /api\.getTriggerProps|getTriggerProps/i, evidence: "trigger props API evidence was detected." },
    { signal: "indicator-props", pattern: /api\.getIndicatorProps|getIndicatorProps/i, evidence: "indicator props API evidence was detected." },
    { signal: "collapsed-size", pattern: /collapsedHeight|collapsedWidth|data-has-collapsed-size/i, evidence: "collapsed size API evidence was detected." },
    { signal: "hidden-content", pattern: /\bhidden\b/i, evidence: "hidden content API evidence was detected." },
    { signal: "css-vars", pattern: /--height|--width|--collapsed-height|--collapsed-width/i, evidence: "CSS variable API evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded API evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls API evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled API evidence was detected." },
    { signal: "data-has-collapsed-size", pattern: /data-has-collapsed-size/i, evidence: "collapsed-size data attribute API evidence was detected." },
    { signal: "trigger-click-handler", pattern: /onClick|send\(\{\s*type:\s*open\s*\?\s*["']close["']\s*:\s*["']open["']\s*\}\)/i, evidence: "trigger click handler API evidence was detected." },
    { signal: "button-type", pattern: /type:\s*["']button["']|type=['"]button|button type/i, evidence: "button type API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir prop|dir\s*=/i, evidence: "direction prop API evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function collapsibleReadinessTestSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["testSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /user\.click|click-test/i, evidence: "click test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|aria-expanded|aria-controls|toHaveAttribute/i, evidence: "ARIA test evidence was detected." },
    { signal: "animation-test", pattern: /animation-test|vi\.useFakeTimers|advanceTimersByTime|animation\.end/i, evidence: "animation test evidence was detected." },
    { signal: "size-test", pattern: /size-test|collapsedHeight|collapsedWidth|measureSize/i, evidence: "size test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|collapsible-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function collapsibleReadinessPackageSignals(sourceFiles: CollapsibleReadinessSourceFile[]): CollapsibleReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CollapsibleReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/collapsible", pattern: /@zag-js\/collapsible/i, evidence: "@zag-js/collapsible dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "@radix-ui/react-collapsible", pattern: /@radix-ui\/react-collapsible/i, evidence: "@radix-ui/react-collapsible dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return collapsibleReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function collapsibleReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CollapsibleReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/collapsible-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildEditableReadinessReport(walk: WalkResult): Promise<EditableReadinessReport> {
  const sourceFiles = await editableReadinessSourceFiles(walk);
  const editableSetups = editableReadinessSetups(sourceFiles);
  const frameworkSignals = editableReadinessFrameworkSignals(sourceFiles);
  const structureSignals = editableReadinessStructureSignals(sourceFiles);
  const stateSignals = editableReadinessStateSignals(sourceFiles);
  const valueSignals = editableReadinessValueSignals(sourceFiles);
  const interactionSignals = editableReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = editableReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = editableReadinessMachineSignals(sourceFiles);
  const contextSignals = editableReadinessContextSignals(sourceFiles);
  const computedSignals = editableReadinessComputedSignals(sourceFiles);
  const effectSignals = editableReadinessEffectSignals(sourceFiles);
  const actionSignals = editableReadinessActionSignals(sourceFiles);
  const guardSignals = editableReadinessGuardSignals(sourceFiles);
  const domSignals = editableReadinessDomSignals(sourceFiles);
  const apiSignals = editableReadinessApiSignals(sourceFiles);
  const testSignals = editableReadinessTestSignals(sourceFiles);
  const packageSignals = editableReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || editableSetups.some((item) => item.rootCount > 0 && item.previewCount > 0 && item.inputCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || editableSetups.some((item) => item.valueCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || editableSetups.some((item) => item.valueCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || editableSetups.some((item) => item.interactionCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || editableSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || editableSetups.some((item) => item.testCount > 0);

  const riskQueue: EditableReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document editable root, area, label, preview, input, control, and edit/submit/cancel trigger structure before claiming editable readiness.",
      why: "Editable readiness starts with traceable preview and edit anatomy plus explicit trigger ownership.",
      relatedHref: "html/editable-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace edit, preview, editing, empty, value, previousValue, controlled edit, default edit, disabled, and read-only state.",
      why: "Inline editing can render while controlled edit state, previous value, and interactivity constraints diverge.",
      relatedHref: "html/editable-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasValue) {
    riskQueue.push({
      priority: "medium",
      action: "Trace value set/clear/change/commit/revert, maxLength, placeholder, and auto-resize behavior.",
      why: "Editable data loss usually happens around commit/revert and length/placeholder/autoresize boundaries.",
      relatedHref: "html/editable-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasInteraction) {
    riskQueue.push({
      priority: "high",
      action: "Trace focus/click/dblclick activation, Enter/blur submit, Escape cancel, interact outside, final focus, and select-on-focus behavior.",
      why: "Editable readiness depends on keyboard, blur, outside interaction, and focus restoration paths.",
      relatedHref: "html/editable-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify aria-label, aria-invalid, aria-readonly, aria-disabled, data focus/disabled/readonly/invalid, required, and form/name semantics.",
      why: "Inline editing controls must expose state, validation, and form association to assistive tech and forms.",
      relatedHref: "html/editable-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, keyboard, blur, commit, cancel, and artifact tests for editable traces.",
      why: "Static editable evidence does not prove edit entry, commit, cancel, blur submit, outside interaction, or focus restoration.",
      relatedHref: "html/editable-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real edit entry, input selection, value mutation, submit/cancel, blur/outside behavior, focus restoration, and project tests outside RepoTutor.",
    why: "RepoTutor records editable readiness only; it does not enter real edit mode, change input values, submit forms, restore focus, dispatch keyboard or pointer events, or run analyzed project tests.",
    relatedHref: "html/editable-readiness.html"
  });

  return {
    summary: `Editable readiness report: setup ${editableSetups.length} files, machine signal ${machineSignals.length}, structure signal ${structureSignals.length}, API signal ${apiSignals.length}, interaction signal ${interactionSignals.length} were summarized from static analysis.`,
    sourcePattern: "Editable readiness Zag editable preview edit value commit cancel focus outside keyboard accessibility tests",
    editableSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    valueSignals,
    interactionSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
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
      { command: "rg \"@zag-js/editable|editable\\.machine|editable\\.connect|getPreviewProps|getInputProps|getEditTriggerProps|getSubmitTriggerProps|getCancelTriggerProps\" package.json src app packages", purpose: "Find Zag editable machine, connect API, preview, input, and trigger props." },
      { command: "rg \"VALUE\\.SET|CONTROLLED\\.EDIT|CONTROLLED\\.PREVIEW|onValueChange|onValueCommit|onValueRevert|previousValue|maxLength|placeholder|autoResize\" src app packages", purpose: "Trace value lifecycle, commit/revert, previous value, max length, placeholder, and auto-resize behavior." },
      { command: "rg \"activationMode|submitMode|selectOnFocus|trackInteractOutside|onFocusOutside|onInteractOutside|finalFocusEl|Escape|keydown.enter\" src app packages", purpose: "Check activation, submit/cancel, outside interaction, and focus restoration paths." },
      { command: "rg \"aria-label|aria-invalid|aria-readonly|aria-disabled|data-focus|data-disabled|data-readonly|data-invalid|click-test|keyboard-test|blur-test|commit-test|cancel-test|upload-artifact\" src app packages test tests .github", purpose: "Check accessibility semantics, tests, and artifact traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag editable, native contenteditable/input markup, or custom inline editing.",
      "Trace root, area, label, preview, input, control, edit trigger, submit trigger, and cancel trigger anatomy before reviewing behavior.",
      "Map edit/preview state, controlled/default edit, value, previous value, change/commit/revert, max length, placeholder, and auto-resize flows.",
      "Check activation, Enter/blur submit, Escape cancel, outside interaction, final focus, select-on-focus, ARIA/data state, and tests.",
      "This report is static readiness. Real edit entry, value mutation, selection, submit/cancel, focus restoration, outside events, and project tests need trusted QA."
    ]
  };
}

type EditableReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function editableReadinessSourceFiles(walk: WalkResult): Promise<EditableReadinessSourceFile[]> {
  const files: EditableReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !editableReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!editableReadinessPathSignal(file.relPath) && !editableReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function editableReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return editableReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function editableReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(editable|inline-edit|contenteditable|title-editor|field-editor)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function editableReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/editable|editable\.machine|editable\.connect|getPreviewProps|getInputProps|getEditTriggerProps|contentEditable|VALUE\.SET|editable-traces)/i.test(text);
}

function editableReadinessSetups(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["editableSetups"] {
  const rows: EditableReadinessReport["editableSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(editable\.machine|editable\.connect|getRootProps|data-editable-root|editable root)/gi);
    const areaCount = countMatches(source.text, /(getAreaProps|data-part=['"]area|data-focus|inline-grid|area)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|<label|htmlFor|aria-labelledby|label)/gi);
    const previewCount = countMatches(source.text, /(getPreviewProps|data-part=['"]preview|contentEditable|title-preview|preview)/gi);
    const inputCount = countMatches(source.text, /(getInputProps|<input|editable input|input\.change|setElementValue|title-input)/gi);
    const triggerCount = countMatches(source.text, /(getEditTriggerProps|getSubmitTriggerProps|getCancelTriggerProps|editTrigger|submitTrigger|cancelTrigger|edit\.click|submit\.click|cancel\.click|aria-label=['"](edit|submit|cancel))/gi);
    const valueCount = countMatches(source.text, /(VALUE\.SET|setValue|clearValue|value-change|value-commit|value-revert|onValueChange|onValueCommit|onValueRevert|previousValue|maxLength|placeholder|autoResize|defaultValue|valueText)/gi);
    const interactionCount = countMatches(source.text, /(activationMode|activation-focus|activation-click|activation-dblclick|submitMode|submit-enter|submit-blur|cancel-escape|Escape|keydown\.enter|trackInteractOutside|onFocusOutside|onPointerDownOutside|onInteractOutside|finalFocusEl|restoreFocus|selectOnFocus|user\.click|user\.keyboard|user\.tab)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-label|aria-invalid|aria-readonly|aria-disabled|data-focus|data-disabled|data-readonly|data-invalid|required|name=|form=|data-placeholder-shown|data-autoresize)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|user\.keyboard|user\.tab|click-test|keyboard-test|blur-test|commit-test|cancel-test|editable-traces|upload-artifact)/gi);
    const total = rootCount + areaCount + labelCount + previewCount + inputCount + triggerCount + valueCount + interactionCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && areaCount > 0 && labelCount > 0 && previewCount > 0 && inputCount > 0 && triggerCount > 0 && valueCount > 0 && interactionCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: editableReadinessFramework(source),
      rootCount,
      areaCount,
      labelCount,
      previewCount,
      inputCount,
      triggerCount,
      valueCount,
      interactionCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, area ${areaCount}, label ${labelCount}, preview ${previewCount}, input ${inputCount}, trigger ${triggerCount}, value ${valueCount}, interaction ${interactionCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.valueCount + b.interactionCount + b.accessibilityCount - (a.valueCount + a.interactionCount + a.accessibilityCount));
}

function editableReadinessFramework(source: EditableReadinessSourceFile): EditableReadinessReport["editableSetups"][number]["framework"] {
  if (/@zag-js\/editable|editable\.machine|editable\.connect|getPreviewProps|getInputProps/i.test(source.text)) return "zag-editable";
  if (/contentEditable|role=['"]textbox|aria-readonly|<input|<textarea/i.test(source.text)) return "native-contenteditable";
  if (/editable|inline edit|field editor|title editor/i.test(source.text)) return "custom";
  return "unknown";
}

function editableReadinessFrameworkSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-editable", pattern: /@zag-js\/editable|editable\.machine|editable\.connect|getPreviewProps|getInputProps/i, evidence: "Zag editable evidence was detected." },
    { signal: "native-contenteditable", pattern: /contentEditable|role=['"]textbox|aria-readonly|<input|<textarea/i, evidence: "native contenteditable/input evidence was detected." },
    { signal: "custom", pattern: /editable|inline edit|field editor|title editor/i, evidence: "custom editable evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function editableReadinessStructureSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["structureSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-editable-root|editable\.machine/i, evidence: "root evidence was detected." },
    { signal: "area", pattern: /getAreaProps|data-part=['"]area|data-focus/i, evidence: "area evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label|htmlFor/i, evidence: "label evidence was detected." },
    { signal: "preview", pattern: /getPreviewProps|data-part=['"]preview|contentEditable|title-preview/i, evidence: "preview evidence was detected." },
    { signal: "input", pattern: /getInputProps|<input|editable input|title-input/i, evidence: "input evidence was detected." },
    { signal: "edit-trigger", pattern: /getEditTriggerProps|editTrigger|aria-label=['"]edit|Edit</i, evidence: "edit trigger evidence was detected." },
    { signal: "submit-trigger", pattern: /getSubmitTriggerProps|submitTrigger|aria-label=['"]submit|Save</i, evidence: "submit trigger evidence was detected." },
    { signal: "cancel-trigger", pattern: /getCancelTriggerProps|cancelTrigger|aria-label=['"]cancel|Cancel</i, evidence: "cancel trigger evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part=['"]control|<div data-part=['"]control/i, evidence: "control evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function editableReadinessStateSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["stateSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "edit", pattern: /\bedit\b|EDIT|edit mode/i, evidence: "edit state evidence was detected." },
    { signal: "preview", pattern: /\bpreview\b|CONTROLLED\.PREVIEW/i, evidence: "preview state evidence was detected." },
    { signal: "editing", pattern: /editing|state\.matches\(["']edit/i, evidence: "editing evidence was detected." },
    { signal: "empty", pattern: /\bempty\b|data-placeholder-shown/i, evidence: "empty state evidence was detected." },
    { signal: "value", pattern: /\bvalue\b|valueText|defaultValue/i, evidence: "value state evidence was detected." },
    { signal: "previous-value", pattern: /previousValue|previous-value/i, evidence: "previous value evidence was detected." },
    { signal: "controlled-edit", pattern: /CONTROLLED\.EDIT|controlled-edit|edit:\s*true/i, evidence: "controlled edit evidence was detected." },
    { signal: "default-edit", pattern: /defaultEdit|default-edit/i, evidence: "default edit evidence was detected." },
    { signal: "disabled", pattern: /disabled|data-disabled|aria-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only|readonly|aria-readonly|data-readonly/i, evidence: "read-only evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function editableReadinessValueSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["valueSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-value", pattern: /setValue|VALUE\.SET|set-value/i, evidence: "set value evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|clear-value/i, evidence: "clear value evidence was detected." },
    { signal: "value-change", pattern: /onValueChange|value-change|input\.change/i, evidence: "value change evidence was detected." },
    { signal: "value-commit", pattern: /onValueCommit|value-commit|invokeOnSubmit/i, evidence: "value commit evidence was detected." },
    { signal: "value-revert", pattern: /onValueRevert|value-revert|revertValue|invokeOnCancel/i, evidence: "value revert evidence was detected." },
    { signal: "max-length", pattern: /maxLength|max-length/i, evidence: "max length evidence was detected." },
    { signal: "placeholder", pattern: /placeholder|data-placeholder-shown/i, evidence: "placeholder evidence was detected." },
    { signal: "auto-resize", pattern: /autoResize|auto-resize|data-autoresize|inline-grid/i, evidence: "auto-resize evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function editableReadinessInteractionSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "activation-focus", pattern: /activationMode.+focus|activation-focus|src:\s*["']focus/i, evidence: "focus activation evidence was detected." },
    { signal: "activation-click", pattern: /activationMode.+click|activation-click|src:\s*["']click|edit\.click/i, evidence: "click activation evidence was detected." },
    { signal: "activation-dblclick", pattern: /activationMode.+dblclick|activation-dblclick|onDoubleClick|dblclick/i, evidence: "double-click activation evidence was detected." },
    { signal: "submit-enter", pattern: /submitOnEnter|submit-enter|keydown\.enter|Enter/i, evidence: "Enter submit evidence was detected." },
    { signal: "submit-blur", pattern: /submitOnBlur|submit-blur|blur/i, evidence: "blur submit evidence was detected." },
    { signal: "cancel-escape", pattern: /cancel-escape|Escape|CANCEL/i, evidence: "Escape cancel evidence was detected." },
    { signal: "interact-outside", pattern: /trackInteractOutside|onInteractOutside|onFocusOutside|onPointerDownOutside|interact-outside/i, evidence: "interact outside evidence was detected." },
    { signal: "final-focus", pattern: /finalFocusEl|restoreFocus|final-focus/i, evidence: "final focus evidence was detected." },
    { signal: "select-on-focus", pattern: /selectOnFocus|select-on-focus|inputEl\.select/i, evidence: "select-on-focus evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function editableReadinessAccessibilitySignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: EditableReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-label", pattern: /aria-label|getByLabelText/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-invalid", pattern: /aria-invalid/i, evidence: "aria-invalid evidence was detected." },
    { signal: "aria-readonly", pattern: /aria-readonly/i, evidence: "aria-readonly evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria-disabled evidence was detected." },
    { signal: "data-focus", pattern: /data-focus/i, evidence: "data-focus evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly/i, evidence: "data-readonly evidence was detected." },
    { signal: "data-invalid", pattern: /data-invalid/i, evidence: "data-invalid evidence was detected." },
    { signal: "required", pattern: /\brequired\b|data-required/i, evidence: "required evidence was detected." },
    { signal: "form-name", pattern: /\bname=|name:\s*|form=|form:\s*/i, evidence: "form/name evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function editableReadinessMachineSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["machineSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<EditableSchema>|createMachine\s+EditableSchema/i, evidence: "Zag editable createMachine evidence was detected." },
    { signal: "initial-edit", pattern: /initialState[\s\S]{0,180}(edit|defaultEdit)|initialState edit defaultEdit/i, evidence: "initial edit/defaultEdit evidence was detected." },
    { signal: "initial-preview", pattern: /initialState[\s\S]{0,180}preview|initialState edit defaultEdit preview/i, evidence: "initial preview state evidence was detected." },
    { signal: "edit-state", pattern: /states[\s\S]{0,220}\bedit\b|states preview edit/i, evidence: "edit state evidence was detected." },
    { signal: "preview-state", pattern: /states[\s\S]{0,220}\bpreview\b|states preview edit/i, evidence: "preview state evidence was detected." },
    { signal: "controlled-edit-event", pattern: /CONTROLLED\.EDIT/i, evidence: "controlled edit event evidence was detected." },
    { signal: "controlled-preview-event", pattern: /CONTROLLED\.PREVIEW/i, evidence: "controlled preview event evidence was detected." },
    { signal: "edit-event", pattern: /\bEDIT\b/i, evidence: "edit event evidence was detected." },
    { signal: "cancel-event", pattern: /\bCANCEL\b/i, evidence: "cancel event evidence was detected." },
    { signal: "submit-event", pattern: /\bSUBMIT\b/i, evidence: "submit event evidence was detected." },
    { signal: "value-set-event", pattern: /VALUE\.SET/i, evidence: "VALUE.SET event evidence was detected." },
    { signal: "watch-value", pattern: /watch[\s\S]{0,220}value|watch track value/i, evidence: "value watcher evidence was detected." },
    { signal: "watch-edit", pattern: /watch[\s\S]{0,220}edit|watch track value[\s\S]{0,120}toggleEditing/i, evidence: "edit watcher evidence was detected." },
    { signal: "entry-focus-input", pattern: /entry[\s\S]{0,120}focusInputIfNeeded|entry focusInputIfNeeded/i, evidence: "entry focus input evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function editableReadinessContextSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["contextSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-context", pattern: /value\s*:\s*bindable|value bindable|context[\s\S]{0,180}\bvalue\b/i, evidence: "value bindable context evidence was detected." },
    { signal: "previous-value-context", pattern: /previousValue\s*:\s*bindable|previousValue bindable|context[\s\S]{0,260}previousValue/i, evidence: "previous value context evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function editableReadinessComputedSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["computedSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "submit-on-enter", pattern: /submitOnEnter/i, evidence: "submitOnEnter computed evidence was detected." },
    { signal: "submit-on-blur", pattern: /submitOnBlur/i, evidence: "submitOnBlur computed evidence was detected." },
    { signal: "is-interactive", pattern: /isInteractive/i, evidence: "isInteractive computed evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function editableReadinessEffectSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["effectSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-interact-outside", pattern: /trackInteractOutside/i, evidence: "trackInteractOutside effect evidence was detected." },
    { signal: "focus-outside", pattern: /onFocusOutside/i, evidence: "focus outside handler evidence was detected." },
    { signal: "pointer-down-outside", pattern: /onPointerDownOutside/i, evidence: "pointer down outside handler evidence was detected." },
    { signal: "interact-outside", pattern: /onInteractOutside|interact-outside/i, evidence: "interact outside handler evidence was detected." },
    { signal: "exclude-triggers", pattern: /exclude[\s\S]{0,160}(getCancelTriggerEl|getSubmitTriggerEl)|exclude[\s\S]{0,120}trigger/i, evidence: "outside interaction trigger exclusion evidence was detected." },
    { signal: "contains", pattern: /\bcontains\b/i, evidence: "DOM contains exclusion evidence was detected." },
    { signal: "submit-on-blur-routing", pattern: /submitOnBlur[\s\S]{0,160}(SUBMIT|CANCEL)|submit-on-blur-routing/i, evidence: "submit-on-blur outside routing evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function editableReadinessActionSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["actionSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "restore-focus", pattern: /restoreFocus/i, evidence: "restore focus action evidence was detected." },
    { signal: "clear-value", pattern: /clearValue/i, evidence: "clear value action evidence was detected." },
    { signal: "focus-input-if-needed", pattern: /focusInputIfNeeded/i, evidence: "focus input if needed action evidence was detected." },
    { signal: "focus-input", pattern: /focusInput/i, evidence: "focus input action evidence was detected." },
    { signal: "invoke-on-cancel", pattern: /invokeOnCancel/i, evidence: "invoke on cancel action evidence was detected." },
    { signal: "invoke-on-submit", pattern: /invokeOnSubmit/i, evidence: "invoke on submit action evidence was detected." },
    { signal: "invoke-on-edit", pattern: /invokeOnEdit/i, evidence: "invoke on edit action evidence was detected." },
    { signal: "invoke-on-preview", pattern: /invokeOnPreview/i, evidence: "invoke on preview action evidence was detected." },
    { signal: "toggle-editing", pattern: /toggleEditing/i, evidence: "toggle editing action evidence was detected." },
    { signal: "sync-input-value", pattern: /syncInputValue/i, evidence: "sync input value action evidence was detected." },
    { signal: "set-element-value", pattern: /setElementValue/i, evidence: "setElementValue action evidence was detected." },
    { signal: "set-value", pattern: /setValue/i, evidence: "set value action evidence was detected." },
    { signal: "set-previous-value", pattern: /setPreviousValue/i, evidence: "set previous value action evidence was detected." },
    { signal: "revert-value", pattern: /revertValue/i, evidence: "revert value action evidence was detected." },
    { signal: "blur-input", pattern: /blurInput/i, evidence: "blur input action evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function editableReadinessGuardSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["guardSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-edit-controlled", pattern: /isEditControlled/i, evidence: "isEditControlled guard evidence was detected." },
    { signal: "is-submit-event", pattern: /isSubmitEvent/i, evidence: "isSubmitEvent guard evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function editableReadinessDomSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["domSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id helper evidence was detected." },
    { signal: "area-id", pattern: /getAreaId/i, evidence: "area id helper evidence was detected." },
    { signal: "label-id", pattern: /getLabelId/i, evidence: "label id helper evidence was detected." },
    { signal: "preview-id", pattern: /getPreviewId/i, evidence: "preview id helper evidence was detected." },
    { signal: "input-id", pattern: /getInputId/i, evidence: "input id helper evidence was detected." },
    { signal: "control-id", pattern: /getControlId/i, evidence: "control id helper evidence was detected." },
    { signal: "submit-trigger-id", pattern: /getSubmitTriggerId/i, evidence: "submit trigger id helper evidence was detected." },
    { signal: "cancel-trigger-id", pattern: /getCancelTriggerId/i, evidence: "cancel trigger id helper evidence was detected." },
    { signal: "edit-trigger-id", pattern: /getEditTriggerId/i, evidence: "edit trigger id helper evidence was detected." },
    { signal: "input-el", pattern: /getInputEl/i, evidence: "input element helper evidence was detected." },
    { signal: "preview-el", pattern: /getPreviewEl/i, evidence: "preview element helper evidence was detected." },
    { signal: "submit-trigger-el", pattern: /getSubmitTriggerEl/i, evidence: "submit trigger element helper evidence was detected." },
    { signal: "cancel-trigger-el", pattern: /getCancelTriggerEl/i, evidence: "cancel trigger element helper evidence was detected." },
    { signal: "edit-trigger-el", pattern: /getEditTriggerEl/i, evidence: "edit trigger element helper evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function editableReadinessApiSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["apiSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "editing", pattern: /\bediting\b/i, evidence: "editing API evidence was detected." },
    { signal: "empty", pattern: /\bempty\b/i, evidence: "empty API evidence was detected." },
    { signal: "value", pattern: /\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "value-text", pattern: /valueText/i, evidence: "valueText API evidence was detected." },
    { signal: "set-value", pattern: /setValue/i, evidence: "setValue API evidence was detected." },
    { signal: "clear-value", pattern: /clearValue/i, evidence: "clearValue API evidence was detected." },
    { signal: "edit", pattern: /\bedit\(\)|api\.edit|\bedit\b/i, evidence: "edit API evidence was detected." },
    { signal: "cancel", pattern: /\bcancel\(\)|api\.cancel|\bcancel\b/i, evidence: "cancel API evidence was detected." },
    { signal: "submit", pattern: /\bsubmit\(\)|api\.submit|\bsubmit\b/i, evidence: "submit API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "area-props", pattern: /getAreaProps/i, evidence: "area props API evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "input-props", pattern: /getInputProps/i, evidence: "input props API evidence was detected." },
    { signal: "preview-props", pattern: /getPreviewProps/i, evidence: "preview props API evidence was detected." },
    { signal: "edit-trigger-props", pattern: /getEditTriggerProps/i, evidence: "edit trigger props API evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props API evidence was detected." },
    { signal: "submit-trigger-props", pattern: /getSubmitTriggerProps/i, evidence: "submit trigger props API evidence was detected." },
    { signal: "cancel-trigger-props", pattern: /getCancelTriggerProps/i, evidence: "cancel trigger props API evidence was detected." },
    { signal: "hidden-edit", pattern: /hidden[\s\S]{0,120}editing|hidden edit/i, evidence: "hidden edit/preview API evidence was detected." },
    { signal: "auto-resize", pattern: /autoResize|data-autoresize|inline-grid/i, evidence: "auto-resize API evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label API evidence was detected." },
    { signal: "aria-invalid", pattern: /aria-invalid/i, evidence: "aria-invalid API evidence was detected." },
    { signal: "aria-readonly", pattern: /aria-readonly/i, evidence: "aria-readonly API evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria-disabled API evidence was detected." },
    { signal: "form-name", pattern: /\bname\b|\bform\b|form-name/i, evidence: "form/name API evidence was detected." },
    { signal: "button-type", pattern: /type:\s*["']button|button type/i, evidence: "button type API evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function editableReadinessTestSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["testSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /user\.click|click-test/i, evidence: "click test evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|keyboard-test|Enter|Escape/i, evidence: "keyboard test evidence was detected." },
    { signal: "blur-test", pattern: /user\.tab|blur-test|submit-blur/i, evidence: "blur test evidence was detected." },
    { signal: "commit-test", pattern: /commit-test|onValueCommit|SUBMIT/i, evidence: "commit test evidence was detected." },
    { signal: "cancel-test", pattern: /cancel-test|onValueRevert|CANCEL|Escape/i, evidence: "cancel test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|editable-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function editableReadinessPackageSignals(sourceFiles: EditableReadinessSourceFile[]): EditableReadinessReport["packageSignals"] {
  const specs: Array<{ signal: EditableReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/editable", pattern: /@zag-js\/editable/i, evidence: "@zag-js/editable dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react adapter evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/interact-outside", pattern: /@zag-js\/interact-outside/i, evidence: "@zag-js/interact-outside dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return editableReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function editableReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: EditableReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/editable-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
