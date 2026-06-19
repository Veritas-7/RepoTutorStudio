import type { HoverCardReadinessReport, NavigationMenuReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildHoverCardReadinessReport(walk: WalkResult): Promise<HoverCardReadinessReport> {
  const sourceFiles = await hoverCardReadinessSourceFiles(walk);
  const hoverCardSetups = hoverCardReadinessSetups(sourceFiles);
  const frameworkSignals = hoverCardFrameworkSignals(sourceFiles);
  const structureSignals = hoverCardStructureSignals(sourceFiles);
  const stateSignals = hoverCardStateSignals(sourceFiles);
  const delaySignals = hoverCardDelaySignals(sourceFiles);
  const positioningSignals = hoverCardPositioningSignals(sourceFiles);
  const interactionSignals = hoverCardInteractionSignals(sourceFiles);
  const accessibilitySignals = hoverCardAccessibilitySignals(sourceFiles);
  const machineSignals = hoverCardMachineSignals(sourceFiles);
  const contextSignals = hoverCardContextSignals(sourceFiles);
  const effectSignals = hoverCardEffectSignals(sourceFiles);
  const actionSignals = hoverCardActionSignals(sourceFiles);
  const domSignals = hoverCardDomSignals(sourceFiles);
  const apiSignals = hoverCardApiSignals(sourceFiles);
  const testSignals = hoverCardTestSignals(sourceFiles);
  const packageSignals = hoverCardPackageSignals(sourceFiles);

  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || hoverCardSetups.some((item) => item.triggerCount > 0 && item.contentCount > 0);
  const hasDelay = delaySignals.some((item) => item.readiness === "ready") || hoverCardSetups.some((item) => item.delayCount > 0);
  const hasPositioning = positioningSignals.some((item) => item.readiness === "ready") || hoverCardSetups.some((item) => item.positioningCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || hoverCardSetups.some((item) => item.pointerCount + item.focusCount + item.dismissCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || hoverCardSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || hoverCardSetups.some((item) => item.testCount > 0);

  const riskQueue: HoverCardReadinessReport["riskQueue"] = [];
  if (!hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Trace trigger, positioner, content, arrow, and arrow-tip parts before claiming hover-card readiness.",
      why: "Hover-card readiness starts from the small overlay anatomy; without static parts learners cannot separate trigger, popper shell, and rendered content.",
      relatedHref: "html/hover-card-readiness.html"
    });
  }
  if (hasStructure && !hasDelay) {
    riskQueue.push({
      priority: "high",
      action: "Add openDelay, closeDelay, wait-for-open-delay, and wait-for-close-delay evidence.",
      why: "Hover-card behavior depends on delayed open and close timers, and static readiness should not imply instant hover behavior.",
      relatedHref: "html/hover-card-readiness.html"
    });
  }
  if (hasStructure && !hasPositioning) {
    riskQueue.push({
      priority: "medium",
      action: "Add placement, current placement, reposition, popper style, placement-side, strategy, and listener evidence.",
      why: "Hover cards are positioned overlays; static markup without positioning contracts misses the most likely integration boundary.",
      relatedHref: "html/hover-card-readiness.html"
    });
  }
  if (hasStructure && !hasInteraction) {
    riskQueue.push({
      priority: "high",
      action: "Add pointer enter/leave, focus/blur, touch-ignore, controlled open, dismissable, outside-interaction, and focus-outside evidence.",
      why: "Hover cards are pointer and focus driven; missing interaction evidence makes delayed overlay behavior hard to trust.",
      relatedHref: "html/hover-card-readiness.html"
    });
  }
  if (hasStructure && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Add data-state, placement, side, owner/current, hidden, tabIndex, and direction evidence.",
      why: "The static DOM contract carries most of the inspectable hover-card accessibility and state evidence.",
      relatedHref: "html/hover-card-readiness.html"
    });
  }
  if ((hasStructure || hasDelay || hasPositioning || hasInteraction) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, focus, timer, positioning, and artifact tests for hover-card behavior.",
      why: "Static readiness is stronger when tests preserve delayed hover/focus behavior and positioning regressions.",
      relatedHref: "html/hover-card-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live hover-card open/close, delayed timers, pointer/focus/outside handling, popper placement, trigger switching, and analyzed-project tests outside RepoTutor.",
    why: "RepoTutor records hover-card readiness only; it does not open real hover cards, wait real timers, calculate live popper placement, dispatch pointer/focus/outside events, mutate trigger value, or run analyzed project tests.",
    relatedHref: "html/hover-card-readiness.html"
  });

  return {
    summary: hoverCardSetups.length > 0
      ? `Hover-card readiness report: setup ${hoverCardSetups.length} files, delay signal ${delaySignals.length}, positioning signal ${positioningSignals.length}, interaction signal ${interactionSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length}, effect signal ${effectSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`
      : "No hover-card readiness source files were detected.",
    sourcePattern: "Hover card readiness Zag hover-card delayed hover focus positioning dismissable accessibility tests",
    hoverCardSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    delaySignals,
    positioningSignals,
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
        command: "rg \"@zag-js/hover-card|hoverCard\\.machine|hoverCard\\.connect|getTriggerProps|getPositionerProps|getContentProps|getArrowProps\" package.json src app packages",
        purpose: "Find Zag hover-card package usage, machine/connect setup, and overlay anatomy parts."
      },
      {
        command: "rg \"openDelay|closeDelay|waitForOpenDelay|waitForCloseDelay|OPEN_DELAY|CLOSE_DELAY|triggerValue|TRIGGER_VALUE.SET\" src app packages test",
        purpose: "Inspect delayed open/close timer evidence and trigger-value switching."
      },
      {
        command: "rg \"getPlacement|getPlacementStyles|getPlacementSide|reposition|trackDismissableElement|onInteractOutside|onFocusOutside|POINTER_ENTER|POINTER_LEAVE|TRIGGER_FOCUS|TRIGGER_BLUR|hover-card-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check popper positioning, dismissable outside handling, pointer/focus lifecycle, and artifact traces."
      }
    ],
    learnerNextSteps: [
      "Open hover-card setup links and identify trigger, positioner, content, arrow, and arrow-tip before reading interaction code.",
      "Trace openDelay and closeDelay separately from open/closed state so delayed hover behavior is not mistaken for instant visibility.",
      "Review positioning evidence around placement, current placement, reposition, popper styles, and listener settings.",
      "Separate pointer enter/leave from focus/blur and outside-dismiss behavior, especially touch-ignore and trigger-value switching.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type HoverCardReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function hoverCardReadinessSourceFiles(walk: WalkResult): Promise<HoverCardReadinessSourceFile[]> {
  const files: HoverCardReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !hoverCardInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!hoverCardPathSignal(file.relPath) && !hoverCardContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 200) break;
  }
  return files;
}

function hoverCardInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return hoverCardPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function hoverCardPathSignal(filePath: string): boolean {
  return /hover[-_ ]?card|popover|tooltip|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function hoverCardContentSignal(text: string): boolean {
  return /@zag-js\/hover-card|hoverCard\.machine|hoverCard\.connect|getArrowTipProps|hover-card-traces|data-scope=['"]hover-card/i.test(text);
}

function hoverCardReadinessSetups(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["hoverCardSetups"] {
  const rows: HoverCardReadinessReport["hoverCardSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /getTriggerProps|data-part=['"]trigger|trigger/i);
    const positionerCount = countMatches(source.text, /getPositionerProps|data-part=['"]positioner|positioner/i);
    const contentCount = countMatches(source.text, /getContentProps|data-part=['"]content|content/i);
    const arrowCount = countMatches(source.text, /getArrowProps|data-part=['"]arrow['"]|arrow/i);
    const arrowTipCount = countMatches(source.text, /getArrowTipProps|arrowTip|arrow-tip|data-part=['"]arrow-tip/i);
    const delayCount = countMatches(source.text, /openDelay|closeDelay|waitForOpenDelay|waitForCloseDelay|OPEN_DELAY|CLOSE_DELAY|delay-test|open-delay|close-delay|wait-open|wait-close/i);
    const positioningCount = countMatches(source.text, /positioning|placement|currentPlacement|getPlacement|getPlacementStyles|getPlacementSide|popperStyles|currentPlacementSide|reposition|POSITIONING\.SET|strategy|listeners|positioning-test/i);
    const pointerCount = countMatches(source.text, /POINTER_ENTER|POINTER_LEAVE|onPointerEnter|onPointerLeave|pointer-enter|pointer-leave|pointer-test|hover/i);
    const focusCount = countMatches(source.text, /TRIGGER_FOCUS|TRIGGER_BLUR|onFocus|onBlur|focus-outside|focus-test|focus|blur/i);
    const dismissCount = countMatches(source.text, /trackDismissableElement|dismissable|onDismiss|onInteractOutside|onPointerDownOutside|onFocusOutside|interact-outside|focus-outside/i);
    const triggerValueCount = countMatches(source.text, /triggerValue|defaultTriggerValue|onTriggerValueChange|TRIGGER_VALUE\.SET|setTriggerValue|data-value|trigger-value/i);
    const accessibilityCount = countMatches(source.text, /data-state|data-placement|data-side|data-ownedby|data-current|hidden|tabIndex|tab-index|dir=|dir:|aria-describedby/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|test\(|@testing-library\/react|userEvent|pointer-test|focus-test|delay-test|positioning-test|upload-artifact|hover-card-traces/i);
    const evidenceScore = triggerCount + positionerCount + contentCount + arrowCount + arrowTipCount + delayCount + positioningCount + pointerCount + focusCount + dismissCount + triggerValueCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !hoverCardPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: hoverCardFramework(source),
      triggerCount,
      positionerCount,
      contentCount,
      arrowCount,
      arrowTipCount,
      delayCount,
      positioningCount,
      pointerCount,
      focusCount,
      dismissCount,
      triggerValueCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 9 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static hover-card readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.delayCount + b.positioningCount + b.pointerCount + b.focusCount + b.dismissCount + b.triggerValueCount + b.accessibilityCount + b.testCount;
    const aScore = a.delayCount + a.positioningCount + a.pointerCount + a.focusCount + a.dismissCount + a.triggerValueCount + a.accessibilityCount + a.testCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function hoverCardFramework(source: HoverCardReadinessSourceFile): HoverCardReadinessReport["hoverCardSetups"][number]["framework"] {
  if (/@zag-js\/hover-card|hoverCard\.machine|hoverCard\.connect/i.test(source.text)) return "zag-hover-card";
  if (/custom hover-card|data-scope=['"]hover-card|hover-card-traces/i.test(source.text)) return "custom-hover-card";
  return "unknown";
}

function hoverCardFrameworkSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-hover-card", pattern: /@zag-js\/hover-card|hoverCard\.machine|hoverCard\.connect/i, evidence: "Zag hover-card evidence was detected." },
    { signal: "custom-hover-card", pattern: /custom hover-card|data-scope=['"]hover-card|hover-card-traces/i, evidence: "custom hover-card evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function hoverCardStructureSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["structureSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger/i, evidence: "trigger evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|data-part=['"]positioner/i, evidence: "positioner evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content/i, evidence: "content evidence was detected." },
    { signal: "arrow", pattern: /getArrowProps|data-part=['"]arrow['"]/i, evidence: "arrow evidence was detected." },
    { signal: "arrow-tip", pattern: /getArrowTipProps|arrowTip|arrow-tip|data-part=['"]arrow-tip/i, evidence: "arrow-tip evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function hoverCardStateSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["stateSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /\bopen\b|data-state=['"]open/i, evidence: "open state evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed/i, evidence: "closed state evidence was detected." },
    { signal: "opening", pattern: /\bopening\b/i, evidence: "opening state evidence was detected." },
    { signal: "closing", pattern: /\bclosing\b/i, evidence: "closing state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b/i, evidence: "disabled evidence was detected." },
    { signal: "trigger-value", pattern: /triggerValue|trigger-value|TRIGGER_VALUE\.SET/i, evidence: "trigger value evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement|current-placement/i, evidence: "current placement evidence was detected." },
    { signal: "is-pointer", pattern: /isPointer|is-pointer/i, evidence: "isPointer evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function hoverCardDelaySignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["delaySignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["delaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-delay", pattern: /openDelay|open-delay|OPEN_DELAY/i, evidence: "open delay evidence was detected." },
    { signal: "close-delay", pattern: /closeDelay|close-delay|CLOSE_DELAY/i, evidence: "close delay evidence was detected." },
    { signal: "wait-open-delay", pattern: /waitForOpenDelay|wait-open|OPEN_DELAY/i, evidence: "wait-for-open-delay evidence was detected." },
    { signal: "wait-close-delay", pattern: /waitForCloseDelay|wait-close|CLOSE_DELAY/i, evidence: "wait-for-close-delay evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "delay", "signal");
}

function hoverCardPositioningSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["positioningSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["positioningSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "placement", pattern: /placement|data-placement/i, evidence: "placement evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement|current-placement/i, evidence: "current placement evidence was detected." },
    { signal: "reposition", pattern: /reposition|POSITIONING\.SET/i, evidence: "reposition evidence was detected." },
    { signal: "popper-styles", pattern: /popperStyles|getPlacementStyles|popper-styles/i, evidence: "popper style evidence was detected." },
    { signal: "get-placement", pattern: /getPlacement\(|get-placement/i, evidence: "getPlacement evidence was detected." },
    { signal: "placement-side", pattern: /getPlacementSide|currentPlacementSide|placement-side|data-side/i, evidence: "placement-side evidence was detected." },
    { signal: "strategy", pattern: /strategy\s*[:=]|strategy fixed|strategy/i, evidence: "strategy evidence was detected." },
    { signal: "listeners", pattern: /listeners:\s*false|listeners false|listeners/i, evidence: "listener option evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "positioning", "signal");
}

function hoverCardInteractionSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-enter", pattern: /POINTER_ENTER|onPointerEnter|pointer-enter/i, evidence: "pointer enter evidence was detected." },
    { signal: "pointer-leave", pattern: /POINTER_LEAVE|onPointerLeave|pointer-leave/i, evidence: "pointer leave evidence was detected." },
    { signal: "focus", pattern: /TRIGGER_FOCUS|onFocus\(|focus-test|\bfocus\b/i, evidence: "focus evidence was detected." },
    { signal: "blur", pattern: /TRIGGER_BLUR|onBlur\(|\bblur\b/i, evidence: "blur evidence was detected." },
    { signal: "dismissable", pattern: /trackDismissableElement|dismissable|onDismiss/i, evidence: "dismissable evidence was detected." },
    { signal: "interact-outside", pattern: /onInteractOutside|interact-outside/i, evidence: "outside interaction evidence was detected." },
    { signal: "focus-outside", pattern: /onFocusOutside|focus-outside/i, evidence: "focus outside evidence was detected." },
    { signal: "touch-ignore", pattern: /pointerType\s*===\s*["']touch["']|touch ignore|touch-ignore/i, evidence: "touch ignore evidence was detected." },
    { signal: "controlled-open", pattern: /CONTROLLED\.OPEN|CONTROLLED\.CLOSE|controlled-open|prop\(["']open["']\)/i, evidence: "controlled open evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function hoverCardAccessibilitySignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-placement", pattern: /data-placement/i, evidence: "data-placement evidence was detected." },
    { signal: "data-side", pattern: /data-side/i, evidence: "data-side evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby evidence was detected." },
    { signal: "data-current", pattern: /data-current/i, evidence: "data-current evidence was detected." },
    { signal: "hidden", pattern: /\bhidden\b/i, evidence: "hidden evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tabIndex evidence was detected." },
    { signal: "direction", pattern: /\bdir\s*[:=]|\bdir\b|direction/i, evidence: "direction evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function hoverCardMachineSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["machineSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<HoverCardSchema>|hoverCard\.machine|createMachine\s+HoverCardSchema/i, evidence: "createMachine HoverCardSchema evidence was detected." },
    { signal: "create-guards", pattern: /createGuards<HoverCardSchema>|createGuards\s+HoverCardSchema/i, evidence: "createGuards HoverCardSchema evidence was detected." },
    { signal: "default-props", pattern: /props[\s\S]{0,220}disabled[\s\S]{0,180}openDelay[\s\S]{0,180}closeDelay[\s\S]{0,180}positioning|props\s+disabled\s+openDelay\s+closeDelay\s+positioning/i, evidence: "default props evidence was detected." },
    { signal: "initial-state", pattern: /initialState[\s\S]{0,120}open[\s\S]{0,120}defaultOpen[\s\S]{0,120}closed|initialState\s+open\s+defaultOpen\s+closed/i, evidence: "initial state evidence was detected." },
    { signal: "bindable-context", pattern: /context[\s\S]{0,240}open[\s\S]{0,160}bindable[\s\S]{0,160}currentPlacement[\s\S]{0,160}bindable[\s\S]{0,160}isPointer[\s\S]{0,160}triggerValue|context\s+open\s+bindable\s+currentPlacement\s+bindable\s+isPointer\s+bindable\s+triggerValue\s+bindable/i, evidence: "bindable context evidence was detected." },
    { signal: "watch-props", pattern: /watch[\s\S]{0,160}disabled[\s\S]{0,160}open[\s\S]{0,160}toggleVisibility|watch\s+disabled\s+close\s+open\s+toggleVisibility/i, evidence: "watch prop evidence was detected." },
    { signal: "global-events", pattern: /TRIGGER_VALUE\.SET|POSITIONING\.SET|CONTROLLED\.OPEN|CONTROLLED\.CLOSE/i, evidence: "machine event evidence was detected." },
    { signal: "state-chart", pattern: /states[\s\S]{0,160}closed[\s\S]{0,160}opening[\s\S]{0,160}open[\s\S]{0,160}closing|states\s+closed\s+opening\s+open\s+closing/i, evidence: "state chart evidence was detected." },
    { signal: "guard-logic", pattern: /guards[\s\S]{0,140}isPointer[\s\S]{0,140}isOpenControlled|guards\s+isPointer\s+isOpenControlled/i, evidence: "guard logic evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function hoverCardContextSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["contextSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-context", pattern: /open[\s\S]{0,80}bindable|open-context/i, evidence: "open bindable context evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement|current-placement/i, evidence: "currentPlacement context evidence was detected." },
    { signal: "is-pointer", pattern: /isPointer|is-pointer/i, evidence: "isPointer context evidence was detected." },
    { signal: "trigger-value", pattern: /triggerValue|defaultTriggerValue|trigger-value/i, evidence: "trigger value context evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function hoverCardEffectSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["effectSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wait-open-delay", pattern: /waitForOpenDelay|OPEN_DELAY|wait-open-delay/i, evidence: "waitForOpenDelay effect evidence was detected." },
    { signal: "wait-close-delay", pattern: /waitForCloseDelay|CLOSE_DELAY|wait-close-delay/i, evidence: "waitForCloseDelay effect evidence was detected." },
    { signal: "track-positioning", pattern: /trackPositioning|getPlacement|track-positioning/i, evidence: "trackPositioning effect evidence was detected." },
    { signal: "track-dismissable-element", pattern: /trackDismissableElement|onInteractOutside|onPointerDownOutside|onFocusOutside|track-dismissable-element/i, evidence: "trackDismissableElement effect evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function hoverCardActionSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["actionSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "invoke-on-open", pattern: /invokeOnOpen|invoke-on-open/i, evidence: "invokeOnOpen action evidence was detected." },
    { signal: "invoke-on-close", pattern: /invokeOnClose|invoke-on-close/i, evidence: "invokeOnClose action evidence was detected." },
    { signal: "set-is-pointer", pattern: /setIsPointer|set-is-pointer/i, evidence: "setIsPointer action evidence was detected." },
    { signal: "clear-is-pointer", pattern: /clearIsPointer|clear-is-pointer/i, evidence: "clearIsPointer action evidence was detected." },
    { signal: "reposition", pattern: /\breposition\b|getPlacement/i, evidence: "reposition action evidence was detected." },
    { signal: "set-trigger-value", pattern: /setTriggerValue|set-trigger-value/i, evidence: "setTriggerValue action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility|toggle-visibility/i, evidence: "toggleVisibility action evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function hoverCardDomSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["domSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-id", pattern: /getTriggerId|trigger-id/i, evidence: "trigger id evidence was detected." },
    { signal: "content-id", pattern: /getContentId|content-id/i, evidence: "content id evidence was detected." },
    { signal: "positioner-id", pattern: /getPositionerId|positioner-id/i, evidence: "positioner id evidence was detected." },
    { signal: "arrow-id", pattern: /getArrowId|arrow-id/i, evidence: "arrow id evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl|trigger-el/i, evidence: "trigger element evidence was detected." },
    { signal: "content-el", pattern: /getContentEl|content-el/i, evidence: "content element evidence was detected." },
    { signal: "positioner-el", pattern: /getPositionerEl|positioner-el/i, evidence: "positioner element evidence was detected." },
    { signal: "trigger-els", pattern: /getTriggerEls|trigger-els|queryAll/i, evidence: "trigger elements evidence was detected." },
    { signal: "active-trigger-el", pattern: /getActiveTriggerEl|active-trigger-el/i, evidence: "active trigger element evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function hoverCardApiSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["apiSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
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
    { signal: "data-placement", pattern: /data-placement/i, evidence: "data-placement API evidence was detected." },
    { signal: "data-side", pattern: /data-side/i, evidence: "data-side API evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby API evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value API evidence was detected." },
    { signal: "data-current", pattern: /data-current/i, evidence: "data-current API evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "hidden", pattern: /\bhidden\b/i, evidence: "hidden API evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tabIndex API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir\s+prop|dir-prop/i, evidence: "dir prop API evidence was detected." },
    { signal: "disabled-guard", pattern: /prop\(["']disabled["']\)|disabled guard|disabled-guard/i, evidence: "disabled guard API evidence was detected." },
    { signal: "arrow-style", pattern: /popperStyles\.arrow|popperStyles[\s\S]{0,80}arrow|arrow-style/i, evidence: "arrow style API evidence was detected." },
    { signal: "arrow-tip-style", pattern: /popperStyles\.arrowTip|popperStyles[\s\S]{0,100}arrowTip|arrow-tip-style/i, evidence: "arrow tip style API evidence was detected." },
    { signal: "positioner-floating-style", pattern: /popperStyles\.floating|\bfloating\b|floating style|positioner-floating-style/i, evidence: "positioner floating style API evidence was detected." },
    { signal: "pointer-enter-handler", pattern: /onPointerEnter|pointer-enter-handler/i, evidence: "pointer enter handler API evidence was detected." },
    { signal: "pointer-leave-handler", pattern: /onPointerLeave|pointer-leave-handler/i, evidence: "pointer leave handler API evidence was detected." },
    { signal: "touch-ignore", pattern: /pointerType[\s\S]{0,40}touch|touch-ignore/i, evidence: "touch ignore API evidence was detected." },
    { signal: "focus-handler", pattern: /onFocus\b|focus-handler/i, evidence: "focus handler API evidence was detected." },
    { signal: "blur-handler", pattern: /onBlur\b|blur-handler/i, evidence: "blur handler API evidence was detected." },
    { signal: "trigger-value-switch", pattern: /shouldSwitch|TRIGGER_VALUE\.SET|trigger-value-switch/i, evidence: "trigger value switch API evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function hoverCardTestSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["testSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(|test\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|render\(|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|user\.hover|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "focus-test", pattern: /focus-test|user\.tab|focus/i, evidence: "focus test evidence was detected." },
    { signal: "delay-test", pattern: /delay-test|useFakeTimers|openDelay|closeDelay/i, evidence: "delay test evidence was detected." },
    { signal: "positioning-test", pattern: /positioning-test|getPlacement|reposition|placement/i, evidence: "positioning test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|hover-card-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function hoverCardPackageSignals(sourceFiles: HoverCardReadinessSourceFile[]): HoverCardReadinessReport["packageSignals"] {
  const specs: Array<{ signal: HoverCardReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/hover-card", pattern: /@zag-js\/hover-card/i, evidence: "@zag-js/hover-card dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react|normalizeProps|useMachine/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy/i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|createGuards/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable|dismissable/i, evidence: "@zag-js/dismissable evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|dataAttr/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/popper", pattern: /@zag-js\/popper|getPlacement|getPlacementStyles|getPlacementSide/i, evidence: "@zag-js/popper evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|NormalizeProps|PropTypes|createProps/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createSplitProps|isFunction/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return hoverCardSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function hoverCardSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: HoverCardReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/hover-card-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildNavigationMenuReadinessReport(walk: WalkResult): Promise<NavigationMenuReadinessReport> {
  const sourceFiles = await navigationMenuReadinessSourceFiles(walk);
  const navigationMenuSetups = navigationMenuReadinessSetups(sourceFiles);
  const frameworkSignals = navigationMenuFrameworkSignals(sourceFiles);
  const structureSignals = navigationMenuStructureSignals(sourceFiles);
  const stateSignals = navigationMenuStateSignals(sourceFiles);
  const delaySignals = navigationMenuDelaySignals(sourceFiles);
  const viewportSignals = navigationMenuViewportSignals(sourceFiles);
  const interactionSignals = navigationMenuInteractionSignals(sourceFiles);
  const keyboardSignals = navigationMenuKeyboardSignals(sourceFiles);
  const accessibilitySignals = navigationMenuAccessibilitySignals(sourceFiles);
  const machineSignals = navigationMenuMachineSignals(sourceFiles);
  const contextSignals = navigationMenuContextSignals(sourceFiles);
  const effectSignals = navigationMenuEffectSignals(sourceFiles);
  const actionSignals = navigationMenuActionSignals(sourceFiles);
  const domSignals = navigationMenuDomSignals(sourceFiles);
  const apiSignals = navigationMenuApiSignals(sourceFiles);
  const testSignals = navigationMenuTestSignals(sourceFiles);
  const packageSignals = navigationMenuPackageSignals(sourceFiles);

  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.rootCount > 0 && item.listCount > 0 && item.triggerCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.valueCount > 0);
  const hasDelay = delaySignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.delayCount > 0);
  const hasViewport = viewportSignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.viewportCount > 0 || item.motionCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.pointerCount + item.dismissCount > 0);
  const hasKeyboard = keyboardSignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.keyboardCount + item.focusCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || navigationMenuSetups.some((item) => item.testCount > 0);

  const riskQueue: NavigationMenuReadinessReport["riskQueue"] = [];
  if (!hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Trace root, list, item, trigger, content, viewport, indicator, link, and arrow parts before claiming navigation-menu readiness.",
      why: "Navigation-menu readiness starts from the static anatomy that separates top-level navigation from flyout content and viewport rendering.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  if (hasStructure && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Add value, defaultValue, previousValue, selected, disabled, viewport-rendered, and trigger-rect evidence.",
      why: "Zag navigation-menu behavior is value driven; static readiness should make selected and previous item state visible.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  if (hasStructure && !hasDelay) {
    riskQueue.push({
      priority: "medium",
      action: "Add openDelay, closeDelay, open/close timeout, skip-delay, and timeout cleanup evidence.",
      why: "Navigation menus often switch between hover-open and click-open paths; delay evidence keeps static reports from implying instant transitions.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  if (hasStructure && !hasViewport) {
    riskQueue.push({
      priority: "high",
      action: "Add viewport size/position, trigger rect, CSS variable, resize observer, align, motion, and exitcomplete evidence.",
      why: "The viewport and motion layer is the distinct Zag navigation-menu boundary compared with generic menu/dropdown reports.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  if (hasStructure && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer enter/leave, trigger click, content focus/blur, item close, dismissable, focus-outside, and pointer-down-outside evidence.",
      why: "Navigation-menu flyouts need both pointer lifecycle and dismissable outside-interaction evidence to be reviewable.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  if (hasStructure && !hasKeyboard) {
    riskQueue.push({
      priority: "medium",
      action: "Add arrow, Home/End, entry key, tab-order, trigger-proxy, focus-first, focus-trigger, navigate, and RTL evidence.",
      why: "Keyboard traversal is a primary accessibility path for navigation menus and should be visible before claiming readiness.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  if (hasStructure && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Add ARIA, hidden, data-state, data-orientation, data-ownedby, data-motion, and direction evidence.",
      why: "The DOM contract is how learners verify navigation-menu state and ownership without executing the component.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  if ((hasStructure || hasState || hasViewport || hasInteraction || hasKeyboard) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, keyboard, focus, delay, viewport, and artifact tests for navigation-menu behavior.",
      why: "Static readiness is stronger when tests preserve the delayed flyout, viewport positioning, proxy focus, and keyboard behavior.",
      relatedHref: "html/navigation-menu-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live navigation-menu open/close, delayed timers, viewport resizing, focus proxies, keyboard traversal, outside dismissal, and analyzed-project tests outside RepoTutor.",
    why: "RepoTutor records navigation-menu readiness only; it does not open real navigation menus, wait real timers, resize real viewports, move real focus, dispatch pointer/keyboard/outside events, mutate browser navigation, or run analyzed project tests.",
    relatedHref: "html/navigation-menu-readiness.html"
  });

  return {
    summary: navigationMenuSetups.length > 0
      ? `Navigation-menu readiness report: setup ${navigationMenuSetups.length} files, state signal ${stateSignals.length}, viewport signal ${viewportSignals.length}, interaction signal ${interactionSignals.length}, keyboard signal ${keyboardSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length}, effect signal ${effectSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`
      : "No navigation-menu readiness source files were detected.",
    sourcePattern: "Navigation menu readiness Zag navigation-menu value viewport proxy motion dismissable keyboard accessibility tests",
    navigationMenuSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    delaySignals,
    viewportSignals,
    interactionSignals,
    keyboardSignals,
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
        command: "rg \"@zag-js/navigation-menu|navigationMenu\\.machine|navigationMenu\\.connect|getRootProps|getListProps|getTriggerProps|getContentProps|getViewportProps\" package.json src app packages",
        purpose: "Find Zag navigation-menu package usage, machine/connect setup, and anatomy parts."
      },
      {
        command: "rg \"value|defaultValue|previousValue|openDelay|closeDelay|setOpenTimeout|setCloseTimeout|clearAllOpenTimeouts|triggerRect|viewportSize|viewportPosition|setMotionAttr\" src app packages test",
        purpose: "Inspect value state, delayed open/close behavior, viewport geometry, and motion tracking."
      },
      {
        command: "rg \"TRIGGER\\.POINTERENTER|TRIGGER\\.POINTERLEAVE|CONTENT\\.FOCUS|ITEM\\.NAVIGATE|trackDismissableElement|onFocusOutside|onPointerDownOutside|trigger-proxy|aria-owns|navigation-menu-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check pointer, focus, keyboard, outside-dismissal, proxy focus, ARIA ownership, and artifact traces."
      }
    ],
    learnerNextSteps: [
      "Open navigation-menu setup links and identify root, list, item, trigger, content, viewport, indicator, link, and arrow parts before reading behavior.",
      "Trace value, defaultValue, previousValue, and selected/was-selected state separately from the visual open/closed attributes.",
      "Review viewport evidence around size, position, trigger rect, CSS variables, resize observer, align, motion, and exitcomplete.",
      "Separate pointer and dismissable behavior from keyboard and focus-proxy behavior, especially Tab order and RTL navigation.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type NavigationMenuReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function navigationMenuReadinessSourceFiles(walk: WalkResult): Promise<NavigationMenuReadinessSourceFile[]> {
  const files: NavigationMenuReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !navigationMenuInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!navigationMenuPathSignal(file.relPath) && !navigationMenuContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 200) break;
  }
  return files;
}

function navigationMenuInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return navigationMenuPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function navigationMenuPathSignal(filePath: string): boolean {
  return /navigation[-_ ]?menu|nav[-_ ]?menu|menu|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function navigationMenuContentSignal(text: string): boolean {
  return /@zag-js\/navigation-menu|navigationMenu\.machine|navigationMenu\.connect|getViewportProxyProps|getTriggerProxyProps|navigation-menu-traces|data-scope=['"]navigation-menu/i.test(text);
}

function navigationMenuReadinessSetups(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["navigationMenuSetups"] {
  const rows: NavigationMenuReadinessReport["navigationMenuSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /getRootProps|data-part=['"]root|data-scope=['"]navigation-menu|aria-label|rootLabel/i);
    const listCount = countMatches(source.text, /getListProps|data-part=['"]list|nav-menu.*list/i);
    const itemCount = countMatches(source.text, /getItemProps|getItemState|data-part=['"]item|itemState|itemId/i);
    const triggerCount = countMatches(source.text, /getTriggerProps|getTriggerEl|getTriggerEls|data-part=['"]trigger|TRIGGER\./i);
    const contentCount = countMatches(source.text, /getContentProps|getContentEl|getContentEls|data-part=['"]content|CONTENT\./i);
    const viewportCount = countMatches(source.text, /getViewportProps|getViewportNode|getViewportEl|getViewportProxyProps|getViewportPositionerProps|data-part=['"]viewport|viewportPositioner|viewport-proxy/i);
    const indicatorCount = countMatches(source.text, /getIndicatorProps|getItemIndicatorProps|data-part=['"]indicator|data-part=['"]item-indicator|itemIndicator/i);
    const arrowCount = countMatches(source.text, /getArrowProps|data-part=['"]arrow|arrow/i);
    const valueCount = countMatches(source.text, /\bvalue\b|defaultValue|previousValue|onValueChange|VALUE\.SET|setValue|selected|wasSelected/i);
    const delayCount = countMatches(source.text, /openDelay|closeDelay|setOpenTimeout|setCloseTimeout|clearOpenTimeout|clearCloseTimeout|clearAllOpenTimeouts|shouldSkipDelay|open-timeout|close-timeout|skip-delay|clear-timeouts|delay-test/i);
    const pointerCount = countMatches(source.text, /TRIGGER\.POINTERENTER|TRIGGER\.POINTERLEAVE|CONTENT\.POINTERENTER|CONTENT\.POINTERLEAVE|onPointerEnter|onPointerLeave|pointer-enter|pointer-leave|pointer-test/i);
    const keyboardCount = countMatches(source.text, /ArrowDown|ArrowUp|ArrowLeft|ArrowRight|Home|End|Tab|ITEM\.NAVIGATE|entryKey|navigate|keyboard-test|home-end|arrow-keys/i);
    const focusCount = countMatches(source.text, /CONTENT\.FOCUS|CONTENT\.BLUR|focusFirstTabbableEl|focusNextLink|focusTrigger|focusTriggerIfNeeded|focusFirst|removeFromTabOrder|restoreTabOrder|focus-test|tab-order/i);
    const dismissCount = countMatches(source.text, /trackDismissableElement|dismissable|onFocusOutside|onPointerDownOutside|onDismiss|focus-outside|pointer-down-outside|closeOnClick|close-on-click/i);
    const motionCount = countMatches(source.text, /setMotionAttr|data-motion|exitcomplete|from-end|from-start|to-start|to-end|motion-attr/i);
    const accessibilityCount = countMatches(source.text, /aria-label|aria-controls|aria-expanded|aria-current|aria-owns|aria-labelledby|aria-hidden|hidden|data-state|data-orientation|data-value|data-ownedby|dir=|dir:|direction|data-motion/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|test\(|@testing-library\/react|userEvent|pointer-test|keyboard-test|focus-test|delay-test|viewport-test|upload-artifact|navigation-menu-traces/i);
    const evidenceScore = rootCount + listCount + itemCount + triggerCount + contentCount + viewportCount + indicatorCount + arrowCount + valueCount + delayCount + pointerCount + keyboardCount + focusCount + dismissCount + motionCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !navigationMenuPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: navigationMenuFramework(source),
      rootCount,
      listCount,
      itemCount,
      triggerCount,
      contentCount,
      viewportCount,
      indicatorCount,
      arrowCount,
      valueCount,
      delayCount,
      pointerCount,
      keyboardCount,
      focusCount,
      dismissCount,
      motionCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 12 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static navigation-menu readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.valueCount + b.delayCount + b.viewportCount + b.pointerCount + b.keyboardCount + b.focusCount + b.dismissCount + b.motionCount + b.accessibilityCount + b.testCount;
    const aScore = a.valueCount + a.delayCount + a.viewportCount + a.pointerCount + a.keyboardCount + a.focusCount + a.dismissCount + a.motionCount + a.accessibilityCount + a.testCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function navigationMenuFramework(source: NavigationMenuReadinessSourceFile): NavigationMenuReadinessReport["navigationMenuSetups"][number]["framework"] {
  if (/@zag-js\/navigation-menu|navigationMenu\.machine|navigationMenu\.connect/i.test(source.text)) return "zag-navigation-menu";
  if (/custom navigation-menu|data-scope=['"]navigation-menu|navigation-menu-traces/i.test(source.text)) return "custom-navigation-menu";
  return "unknown";
}

function navigationMenuFrameworkSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-navigation-menu", pattern: /@zag-js\/navigation-menu|navigationMenu\.machine|navigationMenu\.connect/i, evidence: "Zag navigation-menu evidence was detected." },
    { signal: "custom-navigation-menu", pattern: /custom navigation-menu|data-scope=['"]navigation-menu|navigation-menu-traces/i, evidence: "custom navigation-menu evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function navigationMenuStructureSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["structureSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|data-scope=['"]navigation-menu/i, evidence: "root evidence was detected." },
    { signal: "list", pattern: /getListProps|data-part=['"]list/i, evidence: "list evidence was detected." },
    { signal: "item", pattern: /getItemProps|getItemState|data-part=['"]item/i, evidence: "item evidence was detected." },
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger/i, evidence: "trigger evidence was detected." },
    { signal: "trigger-proxy", pattern: /getTriggerProxyProps|data-trigger-proxy|trigger-proxy/i, evidence: "trigger-proxy evidence was detected." },
    { signal: "viewport", pattern: /getViewportProps|data-part=['"]viewport['"]/i, evidence: "viewport evidence was detected." },
    { signal: "viewport-positioner", pattern: /getViewportPositionerProps|viewportPositioner|viewport-positioner/i, evidence: "viewport-positioner evidence was detected." },
    { signal: "viewport-proxy", pattern: /getViewportProxyProps|viewport-proxy|aria-owns/i, evidence: "viewport-proxy evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content/i, evidence: "content evidence was detected." },
    { signal: "link", pattern: /getLinkProps|data-part=['"]link|aria-current/i, evidence: "link evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|data-part=['"]indicator['"]/i, evidence: "indicator evidence was detected." },
    { signal: "item-indicator", pattern: /getItemIndicatorProps|itemIndicator|item-indicator|data-part=['"]item-indicator/i, evidence: "item-indicator evidence was detected." },
    { signal: "arrow", pattern: /getArrowProps|data-part=['"]arrow/i, evidence: "arrow evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function navigationMenuStateSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["stateSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|VALUE\.SET|setValue/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default-value/i, evidence: "default value evidence was detected." },
    { signal: "previous-value", pattern: /previousValue|previous-value/i, evidence: "previous value evidence was detected." },
    { signal: "open", pattern: /\bopen\b|data-state=['"]open/i, evidence: "open evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed/i, evidence: "closed evidence was detected." },
    { signal: "selected", pattern: /\bselected\b/i, evidence: "selected evidence was detected." },
    { signal: "was-selected", pattern: /wasSelected|was-selected/i, evidence: "was-selected evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "viewport-rendered", pattern: /isViewportRendered|viewport-rendered/i, evidence: "viewport rendered evidence was detected." },
    { signal: "viewport-size", pattern: /viewportSize|viewport-size|--viewport-width|--viewport-height/i, evidence: "viewport size evidence was detected." },
    { signal: "viewport-position", pattern: /viewportPosition|viewport-position|--viewport-x|--viewport-y/i, evidence: "viewport position evidence was detected." },
    { signal: "trigger-rect", pattern: /triggerRect|trigger-rect|--trigger-width|--trigger-height|--trigger-x|--trigger-y/i, evidence: "trigger rect evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function navigationMenuDelaySignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["delaySignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["delaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-delay", pattern: /openDelay|open-delay/i, evidence: "open delay evidence was detected." },
    { signal: "close-delay", pattern: /closeDelay|close-delay/i, evidence: "close delay evidence was detected." },
    { signal: "open-timeout", pattern: /setOpenTimeout|openTimeoutIds|open-timeout/i, evidence: "open timeout evidence was detected." },
    { signal: "close-timeout", pattern: /setCloseTimeout|closeTimeoutId|close-timeout/i, evidence: "close timeout evidence was detected." },
    { signal: "skip-delay", pattern: /shouldSkipDelay|skip-delay/i, evidence: "skip delay evidence was detected." },
    { signal: "clear-timeouts", pattern: /clearOpenTimeout|clearCloseTimeout|clearAllOpenTimeouts|clear-timeouts/i, evidence: "timeout cleanup evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "delay", "signal");
}

function navigationMenuViewportSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["viewportSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["viewportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "viewport-size", pattern: /viewportSize|--viewport-width|--viewport-height/i, evidence: "viewport size evidence was detected." },
    { signal: "viewport-position", pattern: /viewportPosition|--viewport-x|--viewport-y/i, evidence: "viewport position evidence was detected." },
    { signal: "trigger-rect", pattern: /triggerRect|--trigger-width|--trigger-height|--trigger-x|--trigger-y/i, evidence: "trigger rect evidence was detected." },
    { signal: "css-vars", pattern: /--viewport-width|--viewport-height|--viewport-x|--viewport-y|--trigger-width|--trigger-height|css-vars/i, evidence: "CSS variable evidence was detected." },
    { signal: "resize-observer", pattern: /ResizeObserver|trackResizeObserver|resize-observer/i, evidence: "resize observer evidence was detected." },
    { signal: "reposition", pattern: /reposition\(|VIEWPORT\.POSITION|setViewportPosition/i, evidence: "reposition evidence was detected." },
    { signal: "align", pattern: /align\s*=\s*["']|data-align|align:/i, evidence: "align evidence was detected." },
    { signal: "screen-offset", pattern: /screenOffset|screen-offset/i, evidence: "screen offset evidence was detected." },
    { signal: "motion-attr", pattern: /setMotionAttr|data-motion|motion-attr/i, evidence: "motion attribute evidence was detected." },
    { signal: "exitcomplete", pattern: /exitcomplete/i, evidence: "exitcomplete evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "viewport", "signal");
}

function navigationMenuInteractionSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-enter", pattern: /TRIGGER\.POINTERENTER|CONTENT\.POINTERENTER|onPointerEnter|pointer-enter/i, evidence: "pointer enter evidence was detected." },
    { signal: "pointer-leave", pattern: /TRIGGER\.POINTERLEAVE|CONTENT\.POINTERLEAVE|onPointerLeave|pointer-leave/i, evidence: "pointer leave evidence was detected." },
    { signal: "trigger-click", pattern: /TRIGGER\.CLICK|onClick\(|trigger-click/i, evidence: "trigger click evidence was detected." },
    { signal: "content-focus", pattern: /CONTENT\.FOCUS|content-focus/i, evidence: "content focus evidence was detected." },
    { signal: "content-blur", pattern: /CONTENT\.BLUR|content-blur/i, evidence: "content blur evidence was detected." },
    { signal: "item-navigate", pattern: /ITEM\.NAVIGATE|item-navigate/i, evidence: "item navigate evidence was detected." },
    { signal: "item-close", pattern: /ITEM\.CLOSE|item-close/i, evidence: "item close evidence was detected." },
    { signal: "dismissable", pattern: /trackDismissableElement|dismissable|onDismiss/i, evidence: "dismissable evidence was detected." },
    { signal: "focus-outside", pattern: /onFocusOutside|focus-outside/i, evidence: "focus outside evidence was detected." },
    { signal: "pointer-down-outside", pattern: /onPointerDownOutside|pointer-down-outside/i, evidence: "pointer-down-outside evidence was detected." },
    { signal: "close-on-click", pattern: /closeOnClick|close-on-click/i, evidence: "close-on-click evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function navigationMenuKeyboardSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["keyboardSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["keyboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-keys", pattern: /ArrowDown|ArrowUp|ArrowLeft|ArrowRight|arrow-keys/i, evidence: "arrow key evidence was detected." },
    { signal: "home-end", pattern: /\bHome\b|\bEnd\b|home-end/i, evidence: "Home/End evidence was detected." },
    { signal: "entry-key", pattern: /entryKey|entry-key|verticalEntryKey/i, evidence: "entry key evidence was detected." },
    { signal: "tab-order", pattern: /Tab|removeFromTabOrder|restoreTabOrder|tab-order/i, evidence: "tab order evidence was detected." },
    { signal: "trigger-proxy", pattern: /getTriggerProxyProps|getTriggerProxyEl|data-trigger-proxy|trigger-proxy/i, evidence: "trigger proxy evidence was detected." },
    { signal: "focus-first", pattern: /focusFirstTabbableEl|focusFirst\(|focus-first/i, evidence: "focus-first evidence was detected." },
    { signal: "focus-trigger", pattern: /focusTrigger|focusTriggerIfNeeded|focus-trigger/i, evidence: "focus-trigger evidence was detected." },
    { signal: "navigate", pattern: /navigate\(|ITEM\.NAVIGATE|\bnavigate\b/i, evidence: "navigate evidence was detected." },
    { signal: "rtl", pattern: /rtl|dir\s*===\s*["']rtl["']/i, evidence: "RTL evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "keyboard", "signal");
}

function navigationMenuAccessibilitySignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-label", pattern: /aria-label|rootLabel/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-current", pattern: /aria-current/i, evidence: "aria-current evidence was detected." },
    { signal: "aria-owns", pattern: /aria-owns/i, evidence: "aria-owns evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden/i, evidence: "aria-hidden evidence was detected." },
    { signal: "hidden", pattern: /\bhidden\b/i, evidence: "hidden evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby evidence was detected." },
    { signal: "data-motion", pattern: /data-motion/i, evidence: "data-motion evidence was detected." },
    { signal: "direction", pattern: /\bdir\s*[:=]|\bdir\b|direction/i, evidence: "direction evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function navigationMenuMachineSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["machineSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "setup-machine", pattern: /setup<NavigationMenuSchema>|navigationMenu\.machine|createMachine/i, evidence: "setup/createMachine evidence was detected." },
    { signal: "default-props", pattern: /ensureProps[\s\S]{0,160}id[\s\S]{0,160}openDelay[\s\S]{0,160}closeDelay[\s\S]{0,160}orientation|props\s+ensureProps\s+id\s+dir\s+openDelay\s+closeDelay\s+orientation/i, evidence: "default props evidence was detected." },
    { signal: "bindable-context", pattern: /context[\s\S]{0,220}value[\s\S]{0,160}bindable[\s\S]{0,160}previousValue[\s\S]{0,160}viewportSize[\s\S]{0,160}isViewportRendered|context\s+value\s+bindable\s+previousValue\s+bindable\s+viewportSize\s+bindable/i, evidence: "bindable context evidence was detected." },
    { signal: "computed-open", pattern: /computed[\s\S]{0,100}open[\s\S]{0,100}context\.get\(["']value["']\)|computed\s+open/i, evidence: "computed open evidence was detected." },
    { signal: "watch-value", pattern: /watch[\s\S]{0,140}value[\s\S]{0,140}restoreTabOrder[\s\S]{0,140}setTriggerNode[\s\S]{0,140}syncContentNode|watch\s+value\s+restoreTabOrder\s+setTriggerNode\s+syncContentNode\s+syncMotionAttribute/i, evidence: "value watch evidence was detected." },
    { signal: "refs", pattern: /refs[\s\S]{0,220}restoreContentTabOrder[\s\S]{0,180}contentResizeObserverCleanup[\s\S]{0,180}closeTimeoutId[\s\S]{0,180}openTimeoutIds|refs\s+restoreContentTabOrder\s+contentResizeObserverCleanup\s+contentDismissableCleanup\s+contentExitCompleteCleanup\s+triggerResizeObserverCleanup\s+closeTimeoutId\s+openTimeoutIds/i, evidence: "refs evidence was detected." },
    { signal: "entry-exit-effects", pattern: /entry[\s\S]{0,80}checkViewportNode[\s\S]{0,120}exit[\s\S]{0,80}cleanupObservers[\s\S]{0,120}effects[\s\S]{0,80}trackDocumentResize|entry\s+checkViewportNode\s+exit\s+cleanupObservers\s+effects\s+trackDocumentResize/i, evidence: "entry/exit/effects evidence was detected." },
    { signal: "root-events", pattern: /VALUE\.SET|VIEWPORT\.POSITION|TRIGGER\.POINTERENTER|TRIGGER\.POINTERLEAVE|TRIGGER\.CLICK|CONTENT\.FOCUS|ITEM\.NAVIGATE|ITEM\.CLOSE/i, evidence: "root event evidence was detected." },
    { signal: "state-chart", pattern: /states[\s\S]{0,100}idle|initialState[\s\S]{0,80}idle|states\s+idle/i, evidence: "state chart evidence was detected." },
    { signal: "guard-logic", pattern: /guards[\s\S]{0,120}isItemOpen|isItemOpen/i, evidence: "guard logic evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function navigationMenuContextSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["contextSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|VALUE\.SET/i, evidence: "value context evidence was detected." },
    { signal: "previous-value", pattern: /previousValue|previous-value/i, evidence: "previousValue context evidence was detected." },
    { signal: "viewport-size", pattern: /viewportSize|viewport-size/i, evidence: "viewportSize context evidence was detected." },
    { signal: "viewport-rendered", pattern: /isViewportRendered|viewport-rendered/i, evidence: "isViewportRendered context evidence was detected." },
    { signal: "viewport-position", pattern: /viewportPosition|viewport-position/i, evidence: "viewportPosition context evidence was detected." },
    { signal: "content-node", pattern: /contentNode|content-node/i, evidence: "contentNode context evidence was detected." },
    { signal: "trigger-rect", pattern: /triggerRect|trigger-rect/i, evidence: "triggerRect context evidence was detected." },
    { signal: "trigger-node", pattern: /triggerNode|trigger-node/i, evidence: "triggerNode context evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function navigationMenuEffectSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["effectSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-document-resize", pattern: /trackDocumentResize|track-document-resize/i, evidence: "trackDocumentResize effect evidence was detected." },
    { signal: "track-resize-observer", pattern: /trackResizeObserver|ResizeObserver|track-resize-observer/i, evidence: "trackResizeObserver evidence was detected." },
    { signal: "content-resize-observer", pattern: /contentResizeObserverCleanup|contentResizeObserver|content-resize-observer/i, evidence: "content resize observer evidence was detected." },
    { signal: "dismissable-content", pattern: /trackDismissableElement|contentDismissableCleanup|onFocusOutside|onPointerDownOutside|dismissable-content/i, evidence: "dismissable content evidence was detected." },
    { signal: "exitcomplete-listener", pattern: /exitcomplete|contentExitCompleteCleanup|exitcomplete-listener/i, evidence: "exitcomplete listener evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function navigationMenuActionSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["actionSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-value", pattern: /setValue|VALUE\.SET|set-value/i, evidence: "setValue action evidence was detected." },
    { signal: "timeout-actions", pattern: /setOpenTimeout|setCloseTimeout|clearOpenTimeout|clearCloseTimeout|clearAllOpenTimeouts|timeout-actions/i, evidence: "timeout action evidence was detected." },
    { signal: "select-deselect-value", pattern: /selectValue|deselectValue|select-deselect-value/i, evidence: "select/deselect value evidence was detected." },
    { signal: "sync-content-node", pattern: /syncContentNode|contentNode|sync-content-node/i, evidence: "syncContentNode evidence was detected." },
    { signal: "set-trigger-node", pattern: /setTriggerNode|triggerNode|triggerRect|set-trigger-node/i, evidence: "setTriggerNode evidence was detected." },
    { signal: "sync-motion-attribute", pattern: /syncMotionAttribute|setMotionAttr|sync-motion-attribute/i, evidence: "syncMotionAttribute evidence was detected." },
    { signal: "focus-actions", pattern: /focusFirstTabbableEl|focusNextLink|focusTrigger|focusTriggerIfNeeded|focus-actions/i, evidence: "focus action evidence was detected." },
    { signal: "tab-order-actions", pattern: /removeFromTabOrder|restoreTabOrder|tab-order-actions/i, evidence: "tab order action evidence was detected." },
    { signal: "cleanup-observers", pattern: /cleanupObservers|contentResizeObserverCleanup|triggerResizeObserverCleanup|cleanup-observers/i, evidence: "cleanup observer evidence was detected." },
    { signal: "viewport-position", pattern: /setViewportPosition|screenOffset|viewport-position/i, evidence: "viewport position action evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function navigationMenuDomSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["domSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|root-id/i, evidence: "root id evidence was detected." },
    { signal: "trigger-id", pattern: /getTriggerId|trigger-id/i, evidence: "trigger id evidence was detected." },
    { signal: "trigger-proxy-id", pattern: /getTriggerProxyId|trigger-proxy-id/i, evidence: "trigger proxy id evidence was detected." },
    { signal: "content-id", pattern: /getContentId|content-id/i, evidence: "content id evidence was detected." },
    { signal: "viewport-id", pattern: /getViewportId|viewport-id/i, evidence: "viewport id evidence was detected." },
    { signal: "list-id", pattern: /getListId|list-id/i, evidence: "list id evidence was detected." },
    { signal: "item-id", pattern: /getItemId|item-id/i, evidence: "item id evidence was detected." },
    { signal: "root-el", pattern: /getRootEl|root-el/i, evidence: "root element evidence was detected." },
    { signal: "viewport-el", pattern: /getViewportEl|viewport-el/i, evidence: "viewport element evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl|trigger-el/i, evidence: "trigger element evidence was detected." },
    { signal: "trigger-proxy-el", pattern: /getTriggerProxyEl|trigger-proxy-el/i, evidence: "trigger proxy element evidence was detected." },
    { signal: "list-el", pattern: /getListEl|list-el/i, evidence: "list element evidence was detected." },
    { signal: "content-el", pattern: /getContentEl|content-el/i, evidence: "content element evidence was detected." },
    { signal: "content-els", pattern: /getContentEls|content-els|queryAll/i, evidence: "content elements evidence was detected." },
    { signal: "tabbable-els", pattern: /getTabbableEls|getTabbables|tabbable-els/i, evidence: "tabbable elements evidence was detected." },
    { signal: "trigger-els", pattern: /getTriggerEls|trigger-els/i, evidence: "trigger elements evidence was detected." },
    { signal: "link-els", pattern: /getLinkEls|link-els/i, evidence: "link elements evidence was detected." },
    { signal: "elements", pattern: /getElements|topLevelTriggerSelector|topLevelLinkSelector/i, evidence: "composite elements evidence was detected." },
    { signal: "resize-observer", pattern: /trackResizeObserver|ResizeObserver|resize-observer/i, evidence: "resize observer DOM evidence was detected." },
    { signal: "motion-attr", pattern: /setMotionAttr|data-motion|motion-attr/i, evidence: "motion attribute DOM evidence was detected." },
    { signal: "focus-first", pattern: /focusFirst|focus-first/i, evidence: "focusFirst DOM evidence was detected." },
    { signal: "tab-order", pattern: /removeFromTabOrder|tab-order/i, evidence: "tab order DOM evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function navigationMenuApiSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["apiSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /api\.open|\bopen\b/i, evidence: "open API evidence was detected." },
    { signal: "value-api", pattern: /api\.value|\bvalue\b|value-api/i, evidence: "value API evidence was detected." },
    { signal: "orientation", pattern: /api\.orientation|\borientation\b/i, evidence: "orientation API evidence was detected." },
    { signal: "viewport-rendered-api", pattern: /api\.isViewportRendered|isViewportRendered|viewport-rendered-api/i, evidence: "viewport rendered API evidence was detected." },
    { signal: "viewport-node-api", pattern: /getViewportNode|viewport-node-api/i, evidence: "viewport node API evidence was detected." },
    { signal: "set-value", pattern: /setValue|set-value/i, evidence: "setValue API evidence was detected." },
    { signal: "reposition-api", pattern: /api\.reposition|reposition\(|reposition-api/i, evidence: "reposition API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps|root-props/i, evidence: "root props API evidence was detected." },
    { signal: "list-props", pattern: /getListProps|list-props/i, evidence: "list props API evidence was detected." },
    { signal: "item-props", pattern: /getItemProps|item-props/i, evidence: "item props API evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps|indicator-props/i, evidence: "indicator props API evidence was detected." },
    { signal: "item-indicator-props", pattern: /getItemIndicatorProps|item-indicator-props/i, evidence: "item indicator props API evidence was detected." },
    { signal: "arrow-props", pattern: /getArrowProps|arrow-props/i, evidence: "arrow props API evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps|trigger-props/i, evidence: "trigger props API evidence was detected." },
    { signal: "trigger-proxy-props", pattern: /getTriggerProxyProps|trigger-proxy-props/i, evidence: "trigger proxy props API evidence was detected." },
    { signal: "viewport-proxy-props", pattern: /getViewportProxyProps|viewport-proxy-props/i, evidence: "viewport proxy props API evidence was detected." },
    { signal: "link-props", pattern: /getLinkProps|link-props/i, evidence: "link props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps|content-props/i, evidence: "content props API evidence was detected." },
    { signal: "viewport-positioner-props", pattern: /getViewportPositionerProps|viewport-positioner-props/i, evidence: "viewport positioner props API evidence was detected." },
    { signal: "viewport-props", pattern: /getViewportProps|viewport-props/i, evidence: "viewport props API evidence was detected." },
    { signal: "item-state-api", pattern: /getItemState|item-state-api/i, evidence: "item state API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir-prop/i, evidence: "dir prop API evidence was detected." },
    { signal: "root-aria-label", pattern: /["']aria-label["']:\s*prop\(["']translations["']\)\.rootLabel|root-aria-label/i, evidence: "root aria-label API evidence was detected." },
    { signal: "data-orientation", pattern: /["']data-orientation["']|data-orientation/i, evidence: "data-orientation API evidence was detected." },
    { signal: "layout-css-vars", pattern: /--trigger-width|--trigger-height|--viewport-width|--viewport-height|layout-css-vars/i, evidence: "layout CSS variable API evidence was detected." },
    { signal: "data-value", pattern: /["']data-value["']|data-value/i, evidence: "data-value API evidence was detected." },
    { signal: "data-state", pattern: /["']data-state["']|data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "data-disabled", pattern: /["']data-disabled["']|data-disabled/i, evidence: "data-disabled API evidence was detected." },
    { signal: "aria-hidden", pattern: /["']aria-hidden["']|aria-hidden/i, evidence: "aria-hidden API evidence was detected." },
    { signal: "hidden-prop", pattern: /\bhidden:\s*!|hidden-prop/i, evidence: "hidden prop API evidence was detected." },
    { signal: "indicator-position-absolute", pattern: /position:\s*["']absolute["']|indicator-position-absolute/i, evidence: "indicator absolute positioning API evidence was detected." },
    { signal: "transition-none", pattern: /transition:\s*preventTransition\s*\?\s*["']none["']|transition-none/i, evidence: "transition none API evidence was detected." },
    { signal: "data-uid", pattern: /["']data-uid["']|data-uid/i, evidence: "data-uid API evidence was detected." },
    { signal: "data-trigger-proxy-id", pattern: /["']data-trigger-proxy-id["']|data-trigger-proxy-id/i, evidence: "data trigger proxy id API evidence was detected." },
    { signal: "aria-controls", pattern: /["']aria-controls["']|aria-controls/i, evidence: "aria-controls API evidence was detected." },
    { signal: "aria-expanded", pattern: /["']aria-expanded["']|aria-expanded/i, evidence: "aria-expanded API evidence was detected." },
    { signal: "pointer-enter-handler", pattern: /onPointerEnter\b|pointer-enter-handler/i, evidence: "pointer enter handler API evidence was detected." },
    { signal: "pointer-leave-handler", pattern: /onPointerLeave\b|pointer-leave-handler/i, evidence: "pointer leave handler API evidence was detected." },
    { signal: "mouse-pointer-guard", pattern: /pointerType\s*!==\s*["']mouse["']|mouse-pointer-guard/i, evidence: "mouse pointer guard API evidence was detected." },
    { signal: "disable-hover-guard", pattern: /disableHoverTrigger|disable-hover-guard/i, evidence: "disable hover guard API evidence was detected." },
    { signal: "disable-click-guard", pattern: /disableClickTrigger|disable-click-guard/i, evidence: "disable click guard API evidence was detected." },
    { signal: "key-navigation", pattern: /onKeyDown\b|navigate\(|key-navigation/i, evidence: "key navigation API evidence was detected." },
    { signal: "prevent-default", pattern: /preventDefault\(|prevent-default/i, evidence: "preventDefault API evidence was detected." },
    { signal: "stop-propagation", pattern: /stopPropagation\(|stop-propagation/i, evidence: "stopPropagation API evidence was detected." },
    { signal: "trigger-proxy-focus", pattern: /getTriggerProxyEl\(scope,\s*props\.value\)\?\.focus\(\)|trigger-proxy-focus/i, evidence: "trigger proxy focus API evidence was detected." },
    { signal: "visually-hidden-style", pattern: /visuallyHiddenStyle|visually-hidden-style/i, evidence: "visually hidden style API evidence was detected." },
    { signal: "aria-owns", pattern: /["']aria-owns["']|aria-owns/i, evidence: "aria-owns API evidence was detected." },
    { signal: "aria-current-page", pattern: /["']aria-current["']:\s*props\.current\s*\?\s*["']page["']|aria-current-page/i, evidence: "aria-current page API evidence was detected." },
    { signal: "custom-link-select", pattern: /CustomEvent\(["']link\.select["']|custom-link-select/i, evidence: "custom link.select API evidence was detected." },
    { signal: "close-on-click", pattern: /closeOnClick|close-on-click/i, evidence: "closeOnClick API evidence was detected." },
    { signal: "meta-key-guard", pattern: /event\.metaKey|meta-key-guard/i, evidence: "meta key guard API evidence was detected." },
    { signal: "aria-labelledby", pattern: /["']aria-labelledby["']|aria-labelledby/i, evidence: "aria-labelledby API evidence was detected." },
    { signal: "viewport-pointer-events-none", pattern: /pointerEvents:\s*!open\s*\?\s*["']none["']|viewport-pointer-events-none/i, evidence: "viewport pointerEvents none API evidence was detected." },
    { signal: "data-align", pattern: /["']data-align["']|data-align/i, evidence: "data-align API evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function navigationMenuTestSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["testSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(|test\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|render\(|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|user\.hover|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|ArrowDown|Home|End/i, evidence: "keyboard test evidence was detected." },
    { signal: "focus-test", pattern: /focus-test|user\.tab|focus/i, evidence: "focus test evidence was detected." },
    { signal: "delay-test", pattern: /delay-test|useFakeTimers|openDelay|closeDelay/i, evidence: "delay test evidence was detected." },
    { signal: "viewport-test", pattern: /viewport-test|viewportSize|viewportPosition|ResizeObserver/i, evidence: "viewport test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|navigation-menu-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function navigationMenuPackageSignals(sourceFiles: NavigationMenuReadinessSourceFile[]): NavigationMenuReadinessReport["packageSignals"] {
  const specs: Array<{ signal: NavigationMenuReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/navigation-menu", pattern: /@zag-js\/navigation-menu/i, evidence: "@zag-js/navigation-menu dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react|normalizeProps|useMachine/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy/i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|setup\(/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable|dismissable/i, evidence: "@zag-js/dismissable evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|navigate|dataAttr|getTabbables/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|NormalizeProps|PropTypes|createProps/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|ensureProps|callAll|createSplitProps|toPx/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return navigationMenuSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function navigationMenuSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: NavigationMenuReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/navigation-menu-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
