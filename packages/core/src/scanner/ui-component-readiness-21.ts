import type { TooltipReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildTooltipReadinessReport(walk: WalkResult): Promise<TooltipReadinessReport> {
  const sourceFiles = await tooltipReadinessSourceFiles(walk);
  const tooltipSetups = tooltipReadinessSetups(sourceFiles);
  const frameworkSignals = tooltipFrameworkSignals(sourceFiles);
  const anatomySignals = tooltipAnatomySignals(sourceFiles);
  const stateSignals = tooltipStateSignals(sourceFiles);
  const delaySignals = tooltipDelaySignals(sourceFiles);
  const positioningSignals = tooltipPositioningSignals(sourceFiles);
  const storeSignals = tooltipStoreSignals(sourceFiles);
  const interactionSignals = tooltipInteractionSignals(sourceFiles);
  const accessibilitySignals = tooltipAccessibilitySignals(sourceFiles);
  const machineSignals = tooltipMachineSignals(sourceFiles);
  const contextSignals = tooltipContextSignals(sourceFiles);
  const effectSignals = tooltipEffectSignals(sourceFiles);
  const actionSignals = tooltipActionSignals(sourceFiles);
  const domSignals = tooltipDomSignals(sourceFiles);
  const apiSignals = tooltipApiSignals(sourceFiles);
  const testSignals = tooltipTestSignals(sourceFiles);
  const packageSignals = tooltipPackageSignals(sourceFiles);

  const hasAnatomy = anatomySignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.triggerCount + item.contentCount + item.arrowCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.stateCount > 0);
  const hasDelay = delaySignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.delayCount > 0);
  const hasPositioning = positioningSignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.positioningCount > 0);
  const hasStore = storeSignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.storeCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.interactionCount > 0 || item.pointerCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || tooltipSetups.some((item) => item.testCount > 0);

  const riskQueue: TooltipReadinessReport["riskQueue"] = [];
  if (!hasAnatomy) {
    riskQueue.push({
      priority: "medium",
      action: "Trace trigger, positioner, content, arrow, and arrow-tip parts before claiming tooltip readiness.",
      why: "Tooltip readiness starts from the static anatomy that connects triggers to positioned content.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  if (hasAnatomy && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Add open, closed, opening, closing, controlled-open, disabled, trigger-value, and pointer-open evidence.",
      why: "Zag tooltip behavior is state-machine driven and separates controlled state, pointer-open state, and trigger identity.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  if (hasAnatomy && !hasDelay) {
    riskQueue.push({
      priority: "medium",
      action: "Add openDelay, closeDelay, instant-open, waitForOpenDelay, and waitForCloseDelay evidence.",
      why: "Tooltip readiness depends on delayed pointer/focus transitions and instant switching between visible tooltips.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  if (hasAnatomy && !hasPositioning) {
    riskQueue.push({
      priority: "high",
      action: "Add positioning, placement, current placement, placement side, popper styles, reposition, active trigger, and getPlacement evidence.",
      why: "Tooltip positioning depends on the active trigger and current popper placement, not just the presence of content.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  if (hasAnatomy && !hasStore) {
    riskQueue.push({
      priority: "medium",
      action: "Add global tooltip store, id, prevId, instant, and store subscribe evidence.",
      why: "Zag tooltip uses a global store to coordinate visible tooltips and instant switching between triggers.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  if (hasAnatomy && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add trigger click/focus/blur, pointer move/leave/down, content pointer, Escape, scroll, pointerlock, and interactive evidence.",
      why: "Tooltip readiness needs pointer, focus, keyboard, scroll, pointerlock, and interactive-content behavior.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  if (hasAnatomy && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Add role tooltip, aria-describedby, aria-label, data-state, data-placement, data-side, data-ownedby, data-value, data-expanded, data-current, data-instant, and direction evidence.",
      why: "The DOM contract is how learners verify tooltip ownership, state, and accessible description without running the widget.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  if ((hasAnatomy || hasState || hasDelay || hasPositioning || hasStore || hasInteraction) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add fake timer, pointer, focus, delay, scroll, Escape, positioning, and artifact tests.",
      why: "Static readiness is stronger when tests preserve delayed open/close, visible-tooltip coordination, and artifact traces.",
      relatedHref: "html/tooltip-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live tooltip open/close, delayed timers, popper placement, scroll and pointerlock observers, pointer/focus/keyboard events, global store mutation, and analyzed-project tests outside RepoTutor.",
    why: "RepoTutor records tooltip readiness only; it does not open real tooltips, wait real delays, calculate live popper placement, observe real scroll or pointerlock events, dispatch pointer/focus/keyboard events, mutate the global tooltip store, or run analyzed project tests.",
    relatedHref: "html/tooltip-readiness.html"
  });

  return {
    summary: tooltipSetups.length > 0
      ? `Tooltip readiness report: setup ${tooltipSetups.length} files, anatomy signal ${anatomySignals.length}, state signal ${stateSignals.length}, delay signal ${delaySignals.length}, positioning signal ${positioningSignals.length}, machine signal ${machineSignals.length}, effect signal ${effectSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`
      : "No tooltip readiness source files were detected.",
    sourcePattern: "Tooltip readiness Zag tooltip trigger content arrow delay positioning store pointer scroll escape accessibility tests",
    tooltipSetups,
    frameworkSignals,
    anatomySignals,
    stateSignals,
    delaySignals,
    positioningSignals,
    storeSignals,
    interactionSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    effectSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      {
        command: "rg \"@zag-js/tooltip|tooltip\\.machine|tooltip\\.connect|getTriggerProps|getContentProps|getPositionerProps|getArrowProps|getArrowTipProps\" package.json src app packages",
        purpose: "Find Zag tooltip package usage, machine/connect setup, anatomy parts, and trigger/content wiring."
      },
      {
        command: "rg \"openDelay|closeDelay|triggerValue|currentPlacement|hasPointerMoveOpened|trackStore|setGlobalId|store.subscribe|trackScroll|trackPointerlockChange|trackEscapeKey\" src app packages test",
        purpose: "Inspect delay, trigger identity, placement, global store, scroll, pointerlock, and Escape evidence."
      },
      {
        command: "rg \"fake-timers|pointer-test|focus-test|delay-test|scroll-test|escape-test|positioning-test|tooltip-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check fake timer, pointer, focus, delay, scroll, Escape, positioning tests, and artifact traces."
      }
    ],
    learnerNextSteps: [
      "Open tooltip setup links and identify trigger, positioner, content, arrow, and arrow-tip parts.",
      "Trace triggerValue and currentPlacement separately; one selects the active trigger while the other records popper placement.",
      "Review openDelay, closeDelay, and instant store evidence before assuming tooltip switching behavior works.",
      "Check scroll, pointerlock, Escape, pointer, focus, blur, and interactive content evidence separately.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type TooltipReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function tooltipReadinessSourceFiles(walk: WalkResult): Promise<TooltipReadinessSourceFile[]> {
  const files: TooltipReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !tooltipInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!tooltipPathSignal(file.relPath) && !tooltipContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 200) break;
  }
  return files;
}

function tooltipInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return tooltipPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function tooltipPathSignal(filePath: string): boolean {
  return /tooltip|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function tooltipContentSignal(text: string): boolean {
  return /@zag-js\/tooltip|tooltip\.machine|tooltip\.connect|getTriggerProps|getContentProps|tooltip-traces|data-scope=['"]tooltip/i.test(text);
}

function tooltipReadinessSetups(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["tooltipSetups"] {
  const rows: TooltipReadinessReport["tooltipSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /getTriggerProps|data-part=['"]trigger|trigger\.click|trigger\.focus|triggerValue|aria-describedby|data-ownedby/i);
    const contentCount = countMatches(source.text, /getContentProps|data-part=['"]content|role=['"]tooltip|data-instant|content\.pointer/i);
    const arrowCount = countMatches(source.text, /getArrowProps|getArrowTipProps|arrowTip|arrow-tip|data-part=['"]arrow/i);
    const stateCount = countMatches(source.text, /\bopen\b|\bclosed\b|\bopening\b|\bclosing\b|controlled\.open|controlled\.close|controlled-open|disabled|triggerValue|trigger-value|hasPointerMoveOpened|pointer-open/i);
    const delayCount = countMatches(source.text, /openDelay|closeDelay|after\.openDelay|after\.closeDelay|waitForOpenDelay|waitForCloseDelay|instant-open|wait-open-delay|wait-close-delay/i);
    const positioningCount = countMatches(source.text, /positioning|placement|currentPlacement|getPlacement|getPlacementStyles|getPlacementSide|popperStyles|reposition|repositionImmediate|active-trigger|anchor-trigger|positioning-test/i);
    const storeCount = countMatches(source.text, /tooltip\.store|createStore|trackStore|store\.get|store\.update|store\.subscribe|setGlobalId|clearGlobalId|prevId|instant|global-id|previous-id|store-subscribe/i);
    const pointerCount = countMatches(source.text, /pointer\.move|pointer\.leave|pointer\.down|pointerdown|pointerover|pointercancel|content\.pointer|hasPointerMoveOpened|pointer-test|pointerlock/i);
    const interactionCount = countMatches(source.text, /trigger\.click|trigger\.focus|trigger\.blur|pointer\.move|pointer\.leave|trigger\.pointerdown|content\.pointer\.move|content\.pointer\.leave|keydown\.escape|trackEscapeKey|trackScroll|trackPointerlockChange|interactive|scroll-close|escape-test|focus-test/i);
    const accessibilityCount = countMatches(source.text, /role=['"]tooltip|aria-describedby|aria-label|data-state|data-placement|data-side|data-ownedby|data-value|data-expanded|data-current|data-instant|dir=|dir:|direction/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|test\(|@testing-library\/react|userEvent|vi\.useFakeTimers|fake-timers|pointer-test|focus-test|delay-test|scroll-test|escape-test|positioning-test|upload-artifact|tooltip-traces/i);
    const evidenceScore = triggerCount + contentCount + arrowCount + stateCount + delayCount + positioningCount + storeCount + pointerCount + interactionCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !tooltipPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: tooltipFramework(source),
      triggerCount,
      contentCount,
      arrowCount,
      stateCount,
      delayCount,
      positioningCount,
      storeCount,
      pointerCount,
      interactionCount,
      accessibilityCount,
      testCount,
      readiness: triggerCount > 0 && contentCount > 0 && stateCount > 0 && delayCount > 0 && positioningCount > 0 && storeCount > 0 && interactionCount > 0 && accessibilityCount > 0 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `trigger/content/arrow/state/delay/positioning/store/pointer/interaction/accessibility/test evidence ${triggerCount}/${contentCount}/${arrowCount}/${stateCount}/${delayCount}/${positioningCount}/${storeCount}/${pointerCount}/${interactionCount}/${accessibilityCount}/${testCount}`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.triggerCount + b.contentCount + b.stateCount + b.delayCount + b.positioningCount + b.storeCount + b.interactionCount + b.accessibilityCount + b.testCount - (a.triggerCount + a.contentCount + a.stateCount + a.delayCount + a.positioningCount + a.storeCount + a.interactionCount + a.accessibilityCount + a.testCount)).slice(0, 80);
}

function tooltipFramework(source: TooltipReadinessSourceFile): TooltipReadinessReport["tooltipSetups"][number]["framework"] {
  if (/@zag-js\/tooltip|tooltip\.machine|tooltip\.connect/i.test(source.text)) return "zag-tooltip";
  if (/custom tooltip|data-scope=['"]tooltip|tooltip-traces/i.test(source.text)) return "custom-tooltip";
  return "unknown";
}

function tooltipFrameworkSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-tooltip", pattern: /@zag-js\/tooltip|tooltip\.machine|tooltip\.connect/i, evidence: "Zag tooltip evidence was detected." },
    { signal: "custom-tooltip", pattern: /custom tooltip|data-scope=['"]tooltip|tooltip-traces/i, evidence: "custom tooltip evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function tooltipAnatomySignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["anatomySignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["anatomySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger/i, evidence: "trigger anatomy evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|data-part=['"]positioner|positioner/i, evidence: "positioner anatomy evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|role=['"]tooltip/i, evidence: "content anatomy evidence was detected." },
    { signal: "arrow", pattern: /getArrowProps|data-part=['"]arrow/i, evidence: "arrow anatomy evidence was detected." },
    { signal: "arrow-tip", pattern: /getArrowTipProps|arrowTip|arrow-tip/i, evidence: "arrow tip anatomy evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "anatomy", "signal");
}

function tooltipStateSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["stateSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /\bopen\b|data-state=['"]open/i, evidence: "open state evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed/i, evidence: "closed state evidence was detected." },
    { signal: "opening", pattern: /\bopening\b/i, evidence: "opening state evidence was detected." },
    { signal: "closing", pattern: /\bclosing\b/i, evidence: "closing state evidence was detected." },
    { signal: "controlled-open", pattern: /controlled\.open|controlled\.close|controlled-open|controlled-close|prop\("open"\)/i, evidence: "controlled open evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|closeIfDisabled|data-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "trigger-value", pattern: /triggerValue|trigger-value|defaultTriggerValue|setTriggerValue/i, evidence: "trigger value evidence was detected." },
    { signal: "pointer-open", pattern: /hasPointerMoveOpened|setPointerMoveOpened|pointer-open/i, evidence: "pointer-open evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function tooltipDelaySignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["delaySignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["delaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-delay", pattern: /openDelay|after\.openDelay|open-delay/i, evidence: "open delay evidence was detected." },
    { signal: "close-delay", pattern: /closeDelay|after\.closeDelay|close-delay/i, evidence: "close delay evidence was detected." },
    { signal: "instant-open", pattern: /\binstant\b|isInstant|instant-open/i, evidence: "instant open evidence was detected." },
    { signal: "wait-open-delay", pattern: /waitForOpenDelay|wait-open-delay/i, evidence: "wait for open delay evidence was detected." },
    { signal: "wait-close-delay", pattern: /waitForCloseDelay|wait-close-delay/i, evidence: "wait for close delay evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "delay", "signal");
}

function tooltipPositioningSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["positioningSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["positioningSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "positioning", pattern: /\bpositioning\b/i, evidence: "positioning evidence was detected." },
    { signal: "placement", pattern: /\bplacement\b|data-placement/i, evidence: "placement evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement|current-placement/i, evidence: "current placement evidence was detected." },
    { signal: "placement-side", pattern: /getPlacementSide|currentPlacementSide|placement-side|data-side/i, evidence: "placement side evidence was detected." },
    { signal: "popper-styles", pattern: /getPlacementStyles|popperStyles|popper-styles/i, evidence: "popper styles evidence was detected." },
    { signal: "reposition", pattern: /reposition\(|repositionImmediate|POSITIONING\.SET|positioning\.set|reposition/i, evidence: "reposition evidence was detected." },
    { signal: "anchor-trigger", pattern: /getActiveTriggerEl|active-trigger|anchor-trigger|getTriggerEl/i, evidence: "active trigger anchor evidence was detected." },
    { signal: "get-placement", pattern: /getPlacement\(|get-placement/i, evidence: "getPlacement evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "positioning", "signal");
}

function tooltipStoreSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["storeSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["storeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tooltip-store", pattern: /tooltip\.store|createStore|store\.get|tooltip-store/i, evidence: "tooltip store evidence was detected." },
    { signal: "global-id", pattern: /setGlobalId|clearGlobalId|global-id/i, evidence: "global id evidence was detected." },
    { signal: "previous-id", pattern: /prevId|previous-id/i, evidence: "previous id evidence was detected." },
    { signal: "instant", pattern: /\binstant\b|isInstant|data-instant/i, evidence: "instant evidence was detected." },
    { signal: "store-subscribe", pattern: /store\.subscribe|trackStore|store-subscribe/i, evidence: "store subscribe evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "store", "signal");
}

function tooltipInteractionSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-click", pattern: /trigger\.click|onClick|closeOnClick|trigger-click/i, evidence: "trigger click evidence was detected." },
    { signal: "trigger-focus", pattern: /trigger\.focus|onFocus|trigger-focus|focus-test/i, evidence: "trigger focus evidence was detected." },
    { signal: "trigger-blur", pattern: /trigger\.blur|onBlur|trigger-blur/i, evidence: "trigger blur evidence was detected." },
    { signal: "pointer-move", pattern: /pointer\.move|onPointerMove|onPointerOver|pointer-move/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-leave", pattern: /pointer\.leave|onPointerLeave|onPointerCancel|pointer-leave/i, evidence: "pointer leave evidence was detected." },
    { signal: "pointer-down", pattern: /pointerdown|pointer\.down|onPointerDown|pointer-down/i, evidence: "pointer down evidence was detected." },
    { signal: "content-pointer", pattern: /content\.pointer\.move|content\.pointer\.leave|onPointerEnter|content-pointer/i, evidence: "content pointer evidence was detected." },
    { signal: "escape-key", pattern: /trackEscapeKey|keydown\.escape|Escape|escape-key|escape-test/i, evidence: "Escape key evidence was detected." },
    { signal: "scroll-close", pattern: /trackScroll|closeOnScroll|getOverflowAncestors|scroll-close|scroll-test/i, evidence: "scroll close evidence was detected." },
    { signal: "pointerlock-close", pattern: /trackPointerlockChange|pointerlockchange|pointerlock-close/i, evidence: "pointerlock close evidence was detected." },
    { signal: "interactive", pattern: /\binteractive\b|pointerEvents|content\.pointer/i, evidence: "interactive tooltip evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function tooltipAccessibilitySignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-tooltip", pattern: /role=['"]tooltip|role-tooltip/i, evidence: "role tooltip evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-placement", pattern: /data-placement/i, evidence: "data-placement evidence was detected." },
    { signal: "data-side", pattern: /data-side/i, evidence: "data-side evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value evidence was detected." },
    { signal: "data-expanded", pattern: /data-expanded/i, evidence: "data-expanded evidence was detected." },
    { signal: "data-current", pattern: /data-current/i, evidence: "data-current evidence was detected." },
    { signal: "data-instant", pattern: /data-instant/i, evidence: "data-instant evidence was detected." },
    { signal: "direction", pattern: /\bdir\b|dir=|direction/i, evidence: "direction evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function tooltipMachineSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["machineSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<TooltipSchema>|tooltip\.machine|createMachine\s+TooltipSchema/i, evidence: "createMachine TooltipSchema evidence was detected." },
    { signal: "create-guards", pattern: /createGuards<TooltipSchema>|createGuards\s+TooltipSchema/i, evidence: "createGuards TooltipSchema evidence was detected." },
    { signal: "initial-state", pattern: /initialState[\s\S]{0,120}open[\s\S]{0,120}closed|initialState\s+open\s+closed/i, evidence: "initial state evidence was detected." },
    { signal: "default-props", pattern: /props[\s\S]{0,180}ensureProps[\s\S]{0,160}openDelay[\s\S]{0,160}closeDelay|ensureProps\s+id\s+openDelay\s+closeDelay/i, evidence: "default props evidence was detected." },
    { signal: "top-level-effects", pattern: /effects[\s\S]{0,100}trackFocusVisible[\s\S]{0,100}trackStore|effects\s+trackFocusVisible\s+trackStore/i, evidence: "top-level effects evidence was detected." },
    { signal: "bindable-context", pattern: /context[\s\S]{0,180}currentPlacement[\s\S]{0,180}hasPointerMoveOpened[\s\S]{0,180}triggerValue[\s\S]{0,120}bindable|context\s+currentPlacement\s+bindable\s+hasPointerMoveOpened\s+bindable\s+triggerValue\s+bindable/i, evidence: "bindable context evidence was detected." },
    { signal: "watch-props", pattern: /watch[\s\S]{0,140}disabled[\s\S]{0,140}open[\s\S]{0,140}triggerValue|watch\s+disabled\s+closeIfDisabled\s+open\s+toggleVisibility\s+triggerValue\s+repositionImmediate/i, evidence: "watch prop evidence was detected." },
    { signal: "global-events", pattern: /triggerValue\.set|controlled\.open|controlled\.close|global[\s\S]{0,120}triggerValue/i, evidence: "global event evidence was detected." },
    { signal: "state-chart", pattern: /states[\s\S]{0,160}closed[\s\S]{0,160}opening[\s\S]{0,160}open[\s\S]{0,160}closing|states\s+closed\s+opening\s+open\s+closing/i, evidence: "state chart evidence was detected." },
    { signal: "guard-logic", pattern: /noVisibleTooltip[\s\S]{0,120}isVisible[\s\S]{0,120}isInteractive[\s\S]{0,120}hasPointerMoveOpened[\s\S]{0,120}isOpenControlled|noVisibleTooltip\s+isVisible\s+isInteractive\s+hasPointerMoveOpened\s+isOpenControlled/i, evidence: "guard logic evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function tooltipContextSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["contextSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "current-placement", pattern: /currentPlacement|current-placement/i, evidence: "currentPlacement context evidence was detected." },
    { signal: "pointer-move-opened", pattern: /hasPointerMoveOpened|pointer-move-opened/i, evidence: "pointer move opened context evidence was detected." },
    { signal: "trigger-value", pattern: /triggerValue|defaultTriggerValue|trigger-value/i, evidence: "trigger value context evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function tooltipEffectSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["effectSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-focus-visible", pattern: /trackFocusVisible|track-focus-visible/i, evidence: "trackFocusVisible effect evidence was detected." },
    { signal: "track-store", pattern: /trackStore|store\.subscribe|track-store/i, evidence: "trackStore effect evidence was detected." },
    { signal: "track-scroll", pattern: /trackScroll|getOverflowAncestors|track-scroll/i, evidence: "trackScroll effect evidence was detected." },
    { signal: "track-pointerlock-change", pattern: /trackPointerlockChange|pointerlockchange|track-pointerlock-change/i, evidence: "trackPointerlockChange effect evidence was detected." },
    { signal: "track-positioning", pattern: /trackPositioning|getPlacement|track-positioning/i, evidence: "trackPositioning effect evidence was detected." },
    { signal: "track-escape-key", pattern: /trackEscapeKey|keydown\.escape|Escape|track-escape-key/i, evidence: "trackEscapeKey effect evidence was detected." },
    { signal: "wait-open-delay", pattern: /waitForOpenDelay|after\.openDelay|wait-open-delay/i, evidence: "waitForOpenDelay effect evidence was detected." },
    { signal: "wait-close-delay", pattern: /waitForCloseDelay|after\.closeDelay|wait-close-delay/i, evidence: "waitForCloseDelay effect evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function tooltipActionSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["actionSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-global-id", pattern: /setGlobalId|set-global-id/i, evidence: "setGlobalId action evidence was detected." },
    { signal: "clear-global-id", pattern: /clearGlobalId|clear-global-id/i, evidence: "clearGlobalId action evidence was detected." },
    { signal: "invoke-on-open", pattern: /invokeOnOpen|invoke-on-open/i, evidence: "invokeOnOpen action evidence was detected." },
    { signal: "invoke-on-close", pattern: /invokeOnClose|invoke-on-close/i, evidence: "invokeOnClose action evidence was detected." },
    { signal: "close-if-disabled", pattern: /closeIfDisabled|close-if-disabled/i, evidence: "closeIfDisabled action evidence was detected." },
    { signal: "reposition", pattern: /\breposition\b|getPlacement/i, evidence: "reposition action evidence was detected." },
    { signal: "reposition-immediate", pattern: /repositionImmediate|reposition-immediate/i, evidence: "repositionImmediate action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility|toggle-visibility/i, evidence: "toggleVisibility action evidence was detected." },
    { signal: "set-pointer-move-opened", pattern: /setPointerMoveOpened|set-pointer-move-opened/i, evidence: "setPointerMoveOpened action evidence was detected." },
    { signal: "clear-pointer-move-opened", pattern: /clearPointerMoveOpened|clear-pointer-move-opened/i, evidence: "clearPointerMoveOpened action evidence was detected." },
    { signal: "set-trigger-value", pattern: /setTriggerValue|set-trigger-value/i, evidence: "setTriggerValue action evidence was detected." },
    { signal: "immediate-reopen", pattern: /immediateReopen|immediate-reopen/i, evidence: "immediateReopen action evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function tooltipDomSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["domSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-id", pattern: /getTriggerId|trigger-id/i, evidence: "trigger id evidence was detected." },
    { signal: "content-id", pattern: /getContentId|content-id/i, evidence: "content id evidence was detected." },
    { signal: "arrow-id", pattern: /getArrowId|arrow-id/i, evidence: "arrow id evidence was detected." },
    { signal: "positioner-id", pattern: /getPositionerId|positioner-id/i, evidence: "positioner id evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl|trigger-el/i, evidence: "trigger element evidence was detected." },
    { signal: "content-el", pattern: /getContentEl|content-el/i, evidence: "content element evidence was detected." },
    { signal: "positioner-el", pattern: /getPositionerEl|positioner-el/i, evidence: "positioner element evidence was detected." },
    { signal: "arrow-el", pattern: /getArrowEl|arrow-el/i, evidence: "arrow element evidence was detected." },
    { signal: "trigger-els", pattern: /getTriggerEls|trigger-els|queryAll/i, evidence: "trigger elements evidence was detected." },
    { signal: "active-trigger-el", pattern: /getActiveTriggerEl|active-trigger-el/i, evidence: "active trigger element evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function tooltipApiSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["apiSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /api\.open|\bopen\b/i, evidence: "open API evidence was detected." },
    { signal: "set-open", pattern: /setOpen|set-open/i, evidence: "setOpen API evidence was detected." },
    { signal: "trigger-value-api", pattern: /api\.triggerValue|triggerValue|trigger-value-api/i, evidence: "triggerValue API evidence was detected." },
    { signal: "set-trigger-value", pattern: /setTriggerValue|set-trigger-value/i, evidence: "setTriggerValue API evidence was detected." },
    { signal: "reposition-api", pattern: /api\.reposition|reposition\(|reposition-api/i, evidence: "reposition API evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps|trigger-props/i, evidence: "trigger props API evidence was detected." },
    { signal: "arrow-props", pattern: /getArrowProps|arrow-props/i, evidence: "arrow props API evidence was detected." },
    { signal: "arrow-tip-props", pattern: /getArrowTipProps|arrow-tip-props/i, evidence: "arrow tip props API evidence was detected." },
    { signal: "positioner-props", pattern: /getPositionerProps|positioner-props/i, evidence: "positioner props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps|content-props/i, evidence: "content props API evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby API evidence was detected." },
    { signal: "role-tooltip", pattern: /role=['"]tooltip|role tooltip|role-tooltip/i, evidence: "role tooltip API evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "data-placement", pattern: /data-placement/i, evidence: "data-placement API evidence was detected." },
    { signal: "data-side", pattern: /data-side/i, evidence: "data-side API evidence was detected." },
    { signal: "pointer-events", pattern: /pointerEvents|pointer-events/i, evidence: "pointer events API evidence was detected." },
    { signal: "data-ownedby", pattern: /["']data-ownedby["']|data-ownedby/i, evidence: "data-ownedby API evidence was detected." },
    { signal: "data-value", pattern: /["']data-value["']|data-value/i, evidence: "data-value API evidence was detected." },
    { signal: "data-current", pattern: /["']data-current["']|data-current/i, evidence: "data-current API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir-prop/i, evidence: "dir prop API evidence was detected." },
    { signal: "data-expanded", pattern: /["']data-expanded["']|data-expanded/i, evidence: "data-expanded API evidence was detected." },
    { signal: "close-on-click-guard", pattern: /closeOnClick|close-on-click-guard/i, evidence: "closeOnClick guard API evidence was detected." },
    { signal: "focus-visible-guard", pattern: /isFocusVisible|focus-visible-guard/i, evidence: "focus-visible guard API evidence was detected." },
    { signal: "related-trigger-guard", pattern: /relatedTarget|focusedAnotherTrigger|related-trigger-guard/i, evidence: "related trigger guard API evidence was detected." },
    { signal: "left-click-guard", pattern: /isLeftClick|left-click-guard/i, evidence: "left click guard API evidence was detected." },
    { signal: "close-on-pointerdown-guard", pattern: /closeOnPointerDown|close-on-pointerdown-guard/i, evidence: "closeOnPointerDown guard API evidence was detected." },
    { signal: "touch-pointer-ignore", pattern: /pointerType\s*===\s*["']touch["']|touch-pointer-ignore/i, evidence: "touch pointer ignore API evidence was detected." },
    { signal: "pointer-over-handler", pattern: /onPointerOver\b|pointer-over-handler/i, evidence: "pointer over handler API evidence was detected." },
    { signal: "pointer-cancel-handler", pattern: /onPointerCancel\b|pointer-cancel-handler/i, evidence: "pointer cancel handler API evidence was detected." },
    { signal: "arrow-style", pattern: /popperStyles\.arrow|arrow-style/i, evidence: "arrow style API evidence was detected." },
    { signal: "arrow-tip-style", pattern: /popperStyles\.arrowTip|arrow-tip-style/i, evidence: "arrow tip style API evidence was detected." },
    { signal: "positioner-floating-style", pattern: /popperStyles\.floating|positioner-floating-style/i, evidence: "positioner floating style API evidence was detected." },
    { signal: "hidden-prop", pattern: /hidden:\s*!open|hidden-prop/i, evidence: "hidden prop API evidence was detected." },
    { signal: "data-instant", pattern: /["']data-instant["']|data-instant/i, evidence: "data-instant API evidence was detected." },
    { signal: "aria-label-role-guard", pattern: /role:\s*hasAriaLabel\s*\?\s*undefined\s*:\s*["']tooltip["']|aria-label-role-guard/i, evidence: "aria-label role guard API evidence was detected." },
    { signal: "content-id-aria-label-guard", pattern: /id:\s*hasAriaLabel\s*\?\s*undefined\s*:\s*contentId|content-id-aria-label-guard/i, evidence: "content id aria-label guard API evidence was detected." },
    { signal: "content-pointer-enter", pattern: /content\.pointer\.move|content-pointer-enter/i, evidence: "content pointer enter API evidence was detected." },
    { signal: "content-pointer-leave", pattern: /content\.pointer\.leave|content-pointer-leave/i, evidence: "content pointer leave API evidence was detected." },
    { signal: "interactive-pointer-events", pattern: /pointerEvents:\s*prop\(["']interactive["']\)\s*\?\s*["']auto["']\s*:\s*["']none["']|interactive-pointer-events/i, evidence: "interactive pointer-events API evidence was detected." },
    { signal: "default-prevented-guard", pattern: /event\.defaultPrevented|default-prevented-guard/i, evidence: "defaultPrevented guard API evidence was detected." },
    { signal: "disabled-guard", pattern: /if\s*\(disabled\)\s*return|disabled-guard/i, evidence: "disabled guard API evidence was detected." },
    { signal: "store-current-id", pattern: /store\.get\(["']id["']\)|store-current-id/i, evidence: "store current id API evidence was detected." },
    { signal: "store-prev-id", pattern: /store\.get\(["']prevId["']\)|store-prev-id/i, evidence: "store previous id API evidence was detected." },
    { signal: "current-placement-side", pattern: /getPlacementSide|current-placement-side/i, evidence: "current placement side API evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function tooltipTestSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["testSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent/i, evidence: "user-event evidence was detected." },
    { signal: "fake-timers", pattern: /vi\.useFakeTimers|advanceTimers|fake-timers/i, evidence: "fake timers evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|hover\(|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "focus-test", pattern: /focus-test|focus|blur/i, evidence: "focus test evidence was detected." },
    { signal: "delay-test", pattern: /delay-test|advanceTimersByTime|openDelay|closeDelay/i, evidence: "delay test evidence was detected." },
    { signal: "scroll-test", pattern: /scroll-test|trackScroll|closeOnScroll/i, evidence: "scroll test evidence was detected." },
    { signal: "escape-test", pattern: /escape-test|Escape|keydown\.escape/i, evidence: "Escape test evidence was detected." },
    { signal: "positioning-test", pattern: /positioning-test|getPlacement|reposition/i, evidence: "positioning test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|tooltip-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function tooltipPackageSignals(sourceFiles: TooltipReadinessSourceFile[]): TooltipReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TooltipReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/tooltip", pattern: /@zag-js\/tooltip/i, evidence: "@zag-js/tooltip dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/focus-visible", pattern: /@zag-js\/focus-visible|trackFocusVisible|isFocusVisible/i, evidence: "@zag-js/focus-visible evidence was detected." },
    { signal: "@zag-js/popper", pattern: /@zag-js\/popper|getPlacement|getPlacementStyles|getPlacementSide/i, evidence: "@zag-js/popper evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|addDomEvent|getOverflowAncestors|isComposingEvent|isLeftClick/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy/i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|setup\(/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|createProps|TooltipSchema/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createStore|ensureProps|createSplitProps/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return tooltipSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function tooltipSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TooltipReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/tooltip-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
