import type { DrawerReadinessReport, FloatingPanelReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildFloatingPanelReadinessReport(walk: WalkResult): Promise<FloatingPanelReadinessReport> {
  const sourceFiles = await floatingPanelReadinessSourceFiles(walk);
  const floatingPanelSetups = floatingPanelReadinessSetups(sourceFiles);
  const frameworkSignals = floatingPanelFrameworkSignals(sourceFiles);
  const structureSignals = floatingPanelStructureSignals(sourceFiles);
  const stateSignals = floatingPanelStateSignals(sourceFiles);
  const layoutSignals = floatingPanelLayoutSignals(sourceFiles);
  const dragResizeSignals = floatingPanelDragResizeSignals(sourceFiles);
  const stackSignals = floatingPanelStackSignals(sourceFiles);
  const focusAccessibilitySignals = floatingPanelFocusAccessibilitySignals(sourceFiles);
  const machineSignals = floatingPanelMachineSignals(sourceFiles);
  const contextSignals = floatingPanelContextSignals(sourceFiles);
  const computedSignals = floatingPanelComputedSignals(sourceFiles);
  const effectSignals = floatingPanelEffectSignals(sourceFiles);
  const actionSignals = floatingPanelActionSignals(sourceFiles);
  const domSignals = floatingPanelDomSignals(sourceFiles);
  const apiSignals = floatingPanelApiSignals(sourceFiles);
  const testSignals = floatingPanelTestSignals(sourceFiles);
  const packageSignals = floatingPanelPackageSignals(sourceFiles);

  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || floatingPanelSetups.some((item) => item.triggerCount > 0 && item.contentCount > 0);
  const hasDragResize = dragResizeSignals.some((item) => item.readiness === "ready") || floatingPanelSetups.some((item) => item.dragTriggerCount + item.resizeTriggerCount > 0);
  const hasLayout = layoutSignals.some((item) => item.readiness === "ready") || floatingPanelSetups.some((item) => item.boundaryCount > 0);
  const hasStack = stackSignals.some((item) => item.readiness === "ready") || floatingPanelSetups.some((item) => item.stackCount > 0);
  const hasFocusA11y = focusAccessibilitySignals.some((item) => item.readiness === "ready") || floatingPanelSetups.some((item) => item.focusCount + item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || floatingPanelSetups.some((item) => item.testCount > 0);

  const riskQueue: FloatingPanelReadinessReport["riskQueue"] = [];
  if (!hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Trace trigger, positioner, content, header, body, controls, drag handles, and resize handles before claiming floating-panel readiness.",
      why: "Floating panels need explicit static structure so learners can see which element owns movement, size, focus, and controls.",
      relatedHref: "html/floating-panel-readiness.html"
    });
  }
  if (hasStructure && !hasDragResize) {
    riskQueue.push({
      priority: "high",
      action: "Add drag, resize, pointer capture, grid snapping, resize axis, aspect-ratio, and keyboard movement evidence.",
      why: "Panel movement and resizing are the highest-risk behaviors because they depend on pointer and keyboard events plus geometry math.",
      relatedHref: "html/floating-panel-readiness.html"
    });
  }
  if (hasStructure && !hasLayout) {
    riskQueue.push({
      priority: "high",
      action: "Document size, position, CSS variables, fallback rects, anchor position, boundary rect, and overflow behavior.",
      why: "Floating panels fail when boundary and rect constraints are implicit or only validated in a live browser.",
      relatedHref: "html/floating-panel-readiness.html"
    });
  }
  if (hasStructure && !hasStack) {
    riskQueue.push({
      priority: "medium",
      action: "Add panel stack, bring-to-front, z-index, topmost, and cleanup evidence.",
      why: "Multiple floating panels need predictable stack ordering and cleanup to avoid unreachable panels.",
      relatedHref: "html/floating-panel-readiness.html"
    });
  }
  if (hasStructure && !hasFocusA11y) {
    riskQueue.push({
      priority: "high",
      action: "Add dialog role, labeling, controls, initial/final focus, restore focus, Escape close, and direction evidence.",
      why: "Floating panel readiness needs keyboard/focus and accessibility contracts, not only draggable markup.",
      relatedHref: "html/floating-panel-readiness.html"
    });
  }
  if ((hasStructure || hasDragResize || hasLayout) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, keyboard, resize, stage, and artifact tests for floating-panel behavior.",
      why: "Static readiness is stronger when tests preserve the movement, resize, staging, and accessibility contracts.",
      relatedHref: "html/floating-panel-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live panel drag, resize, boundary measurement, z-index stacking, keyboard focus, pointer events, and analyzed-project tests outside RepoTutor.",
    why: "RepoTutor records floating panel readiness only; it does not drag real panels, resize real DOM, measure live boundaries, mutate z-index stacks, move keyboard focus, dispatch pointer or keyboard events, or run analyzed project tests.",
    relatedHref: "html/floating-panel-readiness.html"
  });

  return {
    summary: floatingPanelSetups.length > 0
      ? `Floating panel readiness report: setup ${floatingPanelSetups.length} files, drag/resize signal ${dragResizeSignals.length}, layout signal ${layoutSignals.length}, stack signal ${stackSignals.length}, focus/accessibility signal ${focusAccessibilitySignals.length}, machine signal ${machineSignals.length}, effect signal ${effectSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`
      : "No floating panel readiness source files were detected.",
    sourcePattern: "Floating panel readiness Zag floating-panel drag resize stage stack boundary focus accessibility tests",
    floatingPanelSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    layoutSignals,
    dragResizeSignals,
    stackSignals,
    focusAccessibilitySignals,
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
        command: "rg \"@zag-js/floating-panel|floatingPanel\\.machine|floatingPanel\\.connect|getPositionerProps|getContentProps|getDragTriggerProps|getResizeTriggerProps\" package.json src app packages",
        purpose: "Find Zag floating-panel package usage, machine/connect setup, positioner/content wiring, and drag/resize handles."
      },
      {
        command: "rg \"defaultSize|defaultPosition|minSize|maxSize|getAnchorPosition|getBoundaryEl|allowOverflow|--width|--height|--x|--y|panelStack|--z-index\" src app packages test",
        purpose: "Inspect static size, position, anchor, boundary, overflow, CSS variable, and stack ordering evidence."
      },
      {
        command: "rg \"DRAG_START|RESIZE_START|trackPointerMove|setPointerCapture|gridSize|ResizeTriggerAxis|lockAspectRatio|ArrowLeft|restoreFocus|floating-panel-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check drag, resize, keyboard movement, focus restoration, and artifact traces."
      }
    ],
    learnerNextSteps: [
      "Open floating panel setup links and identify the positioner/content boundary before reading drag logic.",
      "Trace size and position from defaults through CSS variables, boundary rect constraints, and anchor positioning.",
      "Review drag and resize handles separately, especially pointer capture, grid snapping, resize axis, and aspect-ratio behavior.",
      "Check stage controls, panel stack, focus restore, Escape close, and ARIA labeling before trusting the UX.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type FloatingPanelReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function floatingPanelReadinessSourceFiles(walk: WalkResult): Promise<FloatingPanelReadinessSourceFile[]> {
  const files: FloatingPanelReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !floatingPanelInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!floatingPanelPathSignal(file.relPath) && !floatingPanelContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 220) break;
  }
  return files;
}

function floatingPanelInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return floatingPanelPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function floatingPanelPathSignal(filePath: string): boolean {
  return /floating[-_ ]?panel|floatingpanel|panel|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function floatingPanelContentSignal(text: string): boolean {
  return /@zag-js\/floating-panel|getDragTriggerProps|getResizeTriggerProps|panelStack|ResizeTriggerAxis|floating-panel-traces|data-floating-panel/i.test(text);
}

function floatingPanelReadinessSetups(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["floatingPanelSetups"] {
  const rows: FloatingPanelReadinessReport["floatingPanelSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /getTriggerProps|data-part=['"]trigger|trigger/i);
    const positionerCount = countMatches(source.text, /getPositionerProps|data-part=['"]positioner|positioner/i);
    const contentCount = countMatches(source.text, /getContentProps|data-part=['"]content|role=['"]dialog|content/i);
    const titleCount = countMatches(source.text, /getTitleProps|data-part=['"]title|aria-labelledby|panel-title|title/i);
    const headerCount = countMatches(source.text, /getHeaderProps|data-part=['"]header|header/i);
    const bodyCount = countMatches(source.text, /getBodyProps|data-part=['"]body|panel-body|body/i);
    const controlCount = countMatches(source.text, /getControlProps|data-part=['"]control|control/i);
    const stageTriggerCount = countMatches(source.text, /getStageTriggerProps|data-part=['"]stage-trigger|stageTrigger|data-stage|minimize|maximize|restore/i);
    const resizeTriggerCount = countMatches(source.text, /getResizeTriggerProps|data-part=['"]resize-trigger|resizeTrigger|data-axis|ResizeTriggerAxis|resize-test/i);
    const dragTriggerCount = countMatches(source.text, /getDragTriggerProps|data-part=['"]drag-trigger|dragTrigger|DRAG_START|drag-start/i);
    const stackCount = countMatches(source.text, /panelStack|bringToFront|bring-to-front|--z-index|z-index|topmost|stack-remove|remove\(|isTopmost|indexOf/i);
    const boundaryCount = countMatches(source.text, /getBoundaryEl|boundaryRect|boundary-rect|getBoundaryRect|getWindowRect|getElementRect|allowOverflow|allow-overflow|clampPoint|clampSize/i);
    const focusCount = countMatches(source.text, /initialFocusEl|initial-focus|finalFocusEl|final-focus|restoreFocus|restore-focus|setInitialFocus|setFinalFocus|closeOnEscape|escape-close/i);
    const keyboardCount = countMatches(source.text, /MOVE|keyboard-move|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|getEventKey|getEventStep/i);
    const accessibilityCount = countMatches(source.text, /role=['"]dialog|role-dialog|aria-labelledby|aria-controls|data-state|data-stage|dir=|dir:/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|@testing-library\/react|userEvent|pointer-test|keyboard-test|resize-test|stage-test|upload-artifact|floating-panel-traces/i);
    const evidenceScore = triggerCount + positionerCount + contentCount + titleCount + headerCount + bodyCount + controlCount + stageTriggerCount + resizeTriggerCount + dragTriggerCount + stackCount + boundaryCount + focusCount + keyboardCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !floatingPanelPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: floatingPanelFramework(source),
      triggerCount,
      positionerCount,
      contentCount,
      titleCount,
      headerCount,
      bodyCount,
      controlCount,
      stageTriggerCount,
      resizeTriggerCount,
      dragTriggerCount,
      stackCount,
      boundaryCount,
      focusCount,
      keyboardCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 10 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static floating-panel readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.dragTriggerCount + b.resizeTriggerCount + b.boundaryCount + b.stackCount + b.focusCount + b.accessibilityCount + b.testCount;
    const aScore = a.dragTriggerCount + a.resizeTriggerCount + a.boundaryCount + a.stackCount + a.focusCount + a.accessibilityCount + a.testCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function floatingPanelFramework(source: FloatingPanelReadinessSourceFile): FloatingPanelReadinessReport["floatingPanelSetups"][number]["framework"] {
  if (/@zag-js\/floating-panel|floatingPanel\.machine|floatingPanel\.connect|floating-panel\.machine|floating-panel\.connect/i.test(source.text)) return "zag-floating-panel";
  if (/custom floating panel|data-floating-panel|floating-panel-traces|data-part=['"]drag-trigger/i.test(source.text)) return "custom-floating-panel";
  return "unknown";
}

function floatingPanelFrameworkSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-floating-panel", pattern: /@zag-js\/floating-panel|floatingPanel\.machine|floatingPanel\.connect|floating-panel\.machine|floating-panel\.connect/i, evidence: "Zag floating-panel evidence was detected." },
    { signal: "custom-floating-panel", pattern: /custom floating panel|data-floating-panel|floating-panel-traces|data-part=['"]drag-trigger/i, evidence: "custom floating-panel evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function floatingPanelStructureSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["structureSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger/i, evidence: "trigger evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|data-part=['"]positioner/i, evidence: "positioner evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|role=['"]dialog/i, evidence: "content evidence was detected." },
    { signal: "header", pattern: /getHeaderProps|data-part=['"]header/i, evidence: "header evidence was detected." },
    { signal: "body", pattern: /getBodyProps|data-part=['"]body|panel-body/i, evidence: "body evidence was detected." },
    { signal: "title", pattern: /getTitleProps|data-part=['"]title|panel-title|aria-labelledby/i, evidence: "title evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part=['"]control/i, evidence: "control evidence was detected." },
    { signal: "stage-trigger", pattern: /getStageTriggerProps|data-part=['"]stage-trigger|data-stage/i, evidence: "stage trigger evidence was detected." },
    { signal: "resize-trigger", pattern: /getResizeTriggerProps|data-part=['"]resize-trigger|data-axis/i, evidence: "resize trigger evidence was detected." },
    { signal: "drag-trigger", pattern: /getDragTriggerProps|data-part=['"]drag-trigger/i, evidence: "drag trigger evidence was detected." },
    { signal: "close-trigger", pattern: /getCloseTriggerProps|data-part=['"]close-trigger/i, evidence: "close trigger evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function floatingPanelStateSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["stateSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /\bopen\b|data-state=['"]open/i, evidence: "open state evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed/i, evidence: "closed state evidence was detected." },
    { signal: "idle", pattern: /\bidle\b|open\.idle/i, evidence: "idle state evidence was detected." },
    { signal: "dragging", pattern: /\bdragging\b|data-dragging/i, evidence: "dragging state evidence was detected." },
    { signal: "resizing", pattern: /\bresizing\b|open\.resizing/i, evidence: "resizing state evidence was detected." },
    { signal: "minimized", pattern: /\bminimized\b|data-minimized/i, evidence: "minimized stage evidence was detected." },
    { signal: "maximized", pattern: /\bmaximized\b|data-maximized/i, evidence: "maximized stage evidence was detected." },
    { signal: "default-stage", pattern: /default-stage|stage:\s*['"]default|data-stage=['"]default/i, evidence: "default stage evidence was detected." },
    { signal: "topmost", pattern: /topmost|data-topmost|isTopmost/i, evidence: "topmost evidence was detected." },
    { signal: "behind", pattern: /behind|data-behind/i, evidence: "behind evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function floatingPanelLayoutSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["layoutSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["layoutSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "size", pattern: /defaultSize|\bsize\b|setSize|minSize|maxSize/i, evidence: "size evidence was detected." },
    { signal: "position", pattern: /defaultPosition|\bposition\b|setPosition/i, evidence: "position evidence was detected." },
    { signal: "css-vars", pattern: /--width|--height|--x|--y/i, evidence: "CSS variable evidence was detected." },
    { signal: "strategy-fixed", pattern: /strategy:\s*['"]fixed|strategy fixed|position:\s*['"]fixed|position:\s*fixed/i, evidence: "fixed strategy evidence was detected." },
    { signal: "strategy-absolute", pattern: /strategy:\s*['"]absolute|strategy absolute|strategy-absolute|position:\s*['"]absolute|position:\s*absolute/i, evidence: "absolute strategy evidence was detected." },
    { signal: "fallback-size", pattern: /FALLBACK_SIZE|fallback size|fallback-size/i, evidence: "fallback size evidence was detected." },
    { signal: "fallback-position", pattern: /FALLBACK_POSITION|fallback position|fallback-position/i, evidence: "fallback position evidence was detected." },
    { signal: "anchor-position", pattern: /getAnchorPosition|anchor position|anchor-position/i, evidence: "anchor position evidence was detected." },
    { signal: "boundary-rect", pattern: /boundaryRect|boundary-rect|getBoundaryRect|getBoundaryEl|getWindowRect|getElementRect/i, evidence: "boundary rect evidence was detected." },
    { signal: "allow-overflow", pattern: /allowOverflow|allow-overflow/i, evidence: "allow overflow evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "layout", "signal");
}

function floatingPanelDragResizeSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["dragResizeSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["dragResizeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "drag-start", pattern: /DRAG_START|drag-start/i, evidence: "drag start evidence was detected." },
    { signal: "resize-start", pattern: /RESIZE_START|resize-start/i, evidence: "resize start evidence was detected." },
    { signal: "pointer-move", pattern: /trackPointerMove|pointerMove|pointer-move/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-capture", pattern: /setPointerCapture|releasePointerCapture|pointer-capture/i, evidence: "pointer capture evidence was detected." },
    { signal: "grid-size", pattern: /gridSize|grid-size/i, evidence: "grid size evidence was detected." },
    { signal: "clamp-point", pattern: /clampPoint|clamp-point|clampSize|resizeRect/i, evidence: "clamp point evidence was detected." },
    { signal: "resize-axis", pattern: /ResizeTriggerAxis|data-axis|resize-axis|['"]n['"]|['"]se['"]/i, evidence: "resize axis evidence was detected." },
    { signal: "lock-aspect-ratio", pattern: /lockAspectRatio|lock-aspect-ratio/i, evidence: "lock aspect ratio evidence was detected." },
    { signal: "keyboard-move", pattern: /MOVE|keyboard-move|ArrowLeft|ArrowRight|ArrowUp|ArrowDown/i, evidence: "keyboard movement evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "drag/resize", "signal");
}

function floatingPanelStackSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["stackSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["stackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "panel-stack", pattern: /panelStack|panel-stack/i, evidence: "panel stack evidence was detected." },
    { signal: "bring-to-front", pattern: /bringToFront|bring-to-front|CONTENT_FOCUS/i, evidence: "bring-to-front evidence was detected." },
    { signal: "z-index", pattern: /--z-index|zIndex|z-index/i, evidence: "z-index evidence was detected." },
    { signal: "topmost", pattern: /topmost|isTopmost|data-topmost/i, evidence: "topmost evidence was detected." },
    { signal: "stack-remove", pattern: /stack-remove|panelStack\.remove|remove\(panelId\)|remove\(id\)/i, evidence: "stack remove evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "stack", "signal");
}

function floatingPanelFocusAccessibilitySignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["focusAccessibilitySignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["focusAccessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-dialog", pattern: /role=['"]dialog|role-dialog/i, evidence: "dialog role evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "initial-focus", pattern: /initialFocusEl|setInitialFocus|initial-focus|data-initial-focus/i, evidence: "initial focus evidence was detected." },
    { signal: "final-focus", pattern: /finalFocusEl|setFinalFocus|final-focus|data-final-focus/i, evidence: "final focus evidence was detected." },
    { signal: "restore-focus", pattern: /restoreFocus|restore-focus/i, evidence: "restore focus evidence was detected." },
    { signal: "escape-close", pattern: /closeOnEscape|escape-close|ESCAPE|Escape/i, evidence: "Escape close evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-stage", pattern: /data-stage/i, evidence: "data-stage evidence was detected." },
    { signal: "direction", pattern: /\bdir\s*[:=]|\bdir\b|direction/i, evidence: "direction evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "focus/accessibility", "signal");
}

function floatingPanelMachineSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["machineSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<FloatingPanelSchema>|floatingPanel\.machine|floating-panel\.machine/i, evidence: "createMachine FloatingPanelSchema evidence was detected." },
    { signal: "create-guards", pattern: /createGuards<FloatingPanelSchema>|createGuards\s+FloatingPanelSchema/i, evidence: "createGuards FloatingPanelSchema evidence was detected." },
    { signal: "default-props", pattern: /ensureProps[\s\S]{0,180}floating-panel[\s\S]{0,180}strategy[\s\S]{0,160}gridSize[\s\S]{0,160}allowOverflow[\s\S]{0,160}resizable[\s\S]{0,160}draggable|strategy:\s*['"]fixed[\s\S]{0,180}gridSize[\s\S]{0,160}allowOverflow[\s\S]{0,160}resizable[\s\S]{0,160}draggable/i, evidence: "default props evidence was detected." },
    { signal: "initial-state", pattern: /initialState[\s\S]{0,120}open[\s\S]{0,120}defaultOpen[\s\S]{0,120}closed|defaultOpen:\s*true/i, evidence: "initial state evidence was detected." },
    { signal: "bindable-context", pattern: /context[\s\S]{0,260}size[\s\S]{0,160}bindable[\s\S]{0,160}position[\s\S]{0,160}bindable[\s\S]{0,160}stage[\s\S]{0,160}lastEventPosition|lastEventPosition[\s\S]{0,100}prevPosition[\s\S]{0,100}prevSize[\s\S]{0,100}isTopmost/i, evidence: "bindable context evidence was detected." },
    { signal: "computed-state", pattern: /computed[\s\S]{0,220}isMaximized[\s\S]{0,120}isMinimized[\s\S]{0,120}isStaged[\s\S]{0,120}canResize[\s\S]{0,120}canDrag|computed\s+isMaximized\s+isMinimized\s+isStaged\s+hasSpecifiedPosition\s+canResize\s+canDrag/i, evidence: "computed state evidence was detected." },
    { signal: "watch-props", pattern: /watch[\s\S]{0,180}position[\s\S]{0,120}setPositionStyle[\s\S]{0,120}size[\s\S]{0,120}setSizeStyle[\s\S]{0,120}open[\s\S]{0,120}toggleVisibility|watch\s+position\s+setPositionStyle\s+size\s+setSizeStyle\s+open\s+toggleVisibility/i, evidence: "watch prop evidence was detected." },
    { signal: "top-level-effects", pattern: /effects[\s\S]{0,100}trackPanelStack|effects\s+trackPanelStack/i, evidence: "top-level effect evidence was detected." },
    { signal: "root-events", pattern: /CONTENT_FOCUS|SET_POSITION|SET_SIZE|CONTROLLED\.OPEN|CONTROLLED\.CLOSE|DRAG_START|RESIZE_START|DRAG_END/i, evidence: "machine event evidence was detected." },
    { signal: "nested-states", pattern: /states[\s\S]{0,180}closed[\s\S]{0,180}open[\s\S]{0,180}idle[\s\S]{0,180}dragging[\s\S]{0,180}resizing|open\s+idle\s+dragging\s+resizing|open\.dragging|open\.resizing/i, evidence: "nested state evidence was detected." },
    { signal: "guard-logic", pattern: /guards[\s\S]{0,160}closeOnEsc[\s\S]{0,160}isOpenControlled|guards[\s\S]{0,160}isMaximized[\s\S]{0,160}isMinimized/i, evidence: "guard logic evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function floatingPanelContextSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["contextSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "size", pattern: /context[\s\S]{0,100}\bsize\b|defaultSize|\bsize\b[\s\S]{0,80}bindable/i, evidence: "size context evidence was detected." },
    { signal: "position", pattern: /context[\s\S]{0,140}\bposition\b|defaultPosition|\bposition\b[\s\S]{0,80}bindable/i, evidence: "position context evidence was detected." },
    { signal: "stage", pattern: /context[\s\S]{0,180}\bstage\b|stage[\s\S]{0,80}bindable|setMaximized|setMinimized|setRestored/i, evidence: "stage context evidence was detected." },
    { signal: "last-event-position", pattern: /lastEventPosition/i, evidence: "last event position evidence was detected." },
    { signal: "prev-position", pattern: /prevPosition|setPrevPosition|clearPrevPosition|restorePosition/i, evidence: "previous position evidence was detected." },
    { signal: "prev-size", pattern: /prevSize|setPrevSize|clearPrevSize|restoreSize/i, evidence: "previous size evidence was detected." },
    { signal: "is-topmost", pattern: /isTopmost|data-topmost/i, evidence: "isTopmost context evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function floatingPanelComputedSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["computedSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-maximized", pattern: /isMaximized|data-maximized/i, evidence: "isMaximized computed evidence was detected." },
    { signal: "is-minimized", pattern: /isMinimized|data-minimized/i, evidence: "isMinimized computed evidence was detected." },
    { signal: "is-staged", pattern: /isStaged|data-staged/i, evidence: "isStaged computed evidence was detected." },
    { signal: "has-specified-position", pattern: /hasSpecifiedPosition/i, evidence: "hasSpecifiedPosition computed evidence was detected." },
    { signal: "can-resize", pattern: /canResize|resizable/i, evidence: "canResize computed evidence was detected." },
    { signal: "can-drag", pattern: /canDrag|draggable/i, evidence: "canDrag computed evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function floatingPanelEffectSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["effectSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-pointer-move", pattern: /trackPointerMove/i, evidence: "trackPointerMove evidence was detected." },
    { signal: "track-boundary-rect", pattern: /trackBoundaryRect|getBoundaryRect/i, evidence: "trackBoundaryRect evidence was detected." },
    { signal: "track-panel-stack", pattern: /trackPanelStack|panelStack/i, evidence: "trackPanelStack evidence was detected." },
    { signal: "resize-observer-border-box", pattern: /resizeObserverBorderBox|ResizeObserver/i, evidence: "resizeObserverBorderBox evidence was detected." },
    { signal: "stack-subscribe", pattern: /subscribe[\s\S]{0,80}panelStack|panelStack[\s\S]{0,80}subscribe/i, evidence: "panel stack subscribe evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function floatingPanelActionSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["actionSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-position", pattern: /setPosition\b|SET_POSITION/i, evidence: "setPosition evidence was detected." },
    { signal: "set-size", pattern: /setSize\b|SET_SIZE/i, evidence: "setSize evidence was detected." },
    { signal: "anchor-position", pattern: /setAnchorPosition|getAnchorPosition/i, evidence: "anchor position action evidence was detected." },
    { signal: "prev-position", pattern: /setPrevPosition|clearPrevPosition|restorePosition/i, evidence: "previous position action evidence was detected." },
    { signal: "drag-position", pattern: /setPositionFromDrag|DRAG_START|DRAG_END/i, evidence: "drag position action evidence was detected." },
    { signal: "resize-from-drag", pattern: /setSizeFromDrag|resizeRect/i, evidence: "resize from drag action evidence was detected." },
    { signal: "stage-actions", pattern: /setMaximized|setMinimized|setRestored|minimize|maximize|restore/i, evidence: "stage action evidence was detected." },
    { signal: "keyboard-position", pattern: /setPositionFromKeyboard|MOVE|ArrowLeft|ArrowRight|ArrowUp|ArrowDown/i, evidence: "keyboard position action evidence was detected." },
    { signal: "stack-front", pattern: /bringToFrontOfPanelStack|bringToFront/i, evidence: "bring to front action evidence was detected." },
    { signal: "open-close-callbacks", pattern: /invokeOnOpen|invokeOnClose|onOpenChange|CONTROLLED\.OPEN|CONTROLLED\.CLOSE/i, evidence: "open and close callback evidence was detected." },
    { signal: "focus-actions", pattern: /setFinalFocus|setInitialFocus|finalFocusEl|initialFocusEl/i, evidence: "focus action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility/i, evidence: "toggle visibility action evidence was detected." },
    { signal: "style-actions", pattern: /setPositionStyle|setSizeStyle/i, evidence: "style action evidence was detected." },
    { signal: "reset-rect", pattern: /resetRect/i, evidence: "reset rect action evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function floatingPanelDomSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["domSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-id", pattern: /getTriggerId|ids:\s*{[\s\S]{0,120}\btrigger\b/i, evidence: "trigger ID evidence was detected." },
    { signal: "positioner-id", pattern: /getPositionerId|ids:\s*{[\s\S]{0,120}\bpositioner\b/i, evidence: "positioner ID evidence was detected." },
    { signal: "content-id", pattern: /getContentId|ids:\s*{[\s\S]{0,120}\bcontent\b/i, evidence: "content ID evidence was detected." },
    { signal: "title-id", pattern: /getTitleId|ids:\s*{[\s\S]{0,120}\btitle\b/i, evidence: "title ID evidence was detected." },
    { signal: "header-id", pattern: /getHeaderId|ids:\s*{[\s\S]{0,120}\bheader\b/i, evidence: "header ID evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl/i, evidence: "trigger element evidence was detected." },
    { signal: "positioner-el", pattern: /getPositionerEl/i, evidence: "positioner element evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element evidence was detected." },
    { signal: "header-el", pattern: /getHeaderEl/i, evidence: "header element evidence was detected." },
    { signal: "boundary-rect", pattern: /getBoundaryRect|boundaryRect/i, evidence: "boundary rect evidence was detected." },
    { signal: "window-rect", pattern: /getWindowRect/i, evidence: "window rect evidence was detected." },
    { signal: "element-rect", pattern: /getElementRect/i, evidence: "element rect evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function floatingPanelApiSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["apiSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /api\.open|\bopen\b/i, evidence: "open API evidence was detected." },
    { signal: "set-open", pattern: /setOpen|api\.setOpen/i, evidence: "setOpen API evidence was detected." },
    { signal: "dragging", pattern: /api\.dragging|\bdragging\b/i, evidence: "dragging API evidence was detected." },
    { signal: "resizing", pattern: /api\.resizing|\bresizing\b/i, evidence: "resizing API evidence was detected." },
    { signal: "position-api", pattern: /api\.position|\bposition\b/i, evidence: "position API evidence was detected." },
    { signal: "set-position", pattern: /api\.setPosition|setPosition\(/i, evidence: "setPosition API evidence was detected." },
    { signal: "size-api", pattern: /api\.size|\bsize\b/i, evidence: "size API evidence was detected." },
    { signal: "set-size", pattern: /api\.setSize|setSize\(/i, evidence: "setSize API evidence was detected." },
    { signal: "minimize", pattern: /api\.minimize|minimize\(/i, evidence: "minimize API evidence was detected." },
    { signal: "maximize", pattern: /api\.maximize|maximize\(/i, evidence: "maximize API evidence was detected." },
    { signal: "restore", pattern: /api\.restore|restore\(/i, evidence: "restore API evidence was detected." },
    { signal: "resizable-api", pattern: /api\.resizable|\bresizable\b/i, evidence: "resizable API evidence was detected." },
    { signal: "draggable-api", pattern: /api\.draggable|\bdraggable\b/i, evidence: "draggable API evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps/i, evidence: "trigger props API evidence was detected." },
    { signal: "positioner-props", pattern: /getPositionerProps/i, evidence: "positioner props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "title-props", pattern: /getTitleProps/i, evidence: "title props API evidence was detected." },
    { signal: "header-props", pattern: /getHeaderProps/i, evidence: "header props API evidence was detected." },
    { signal: "body-props", pattern: /getBodyProps/i, evidence: "body props API evidence was detected." },
    { signal: "close-trigger-props", pattern: /getCloseTriggerProps/i, evidence: "close trigger props API evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props API evidence was detected." },
    { signal: "stage-trigger-props", pattern: /getStageTriggerProps/i, evidence: "stage trigger props API evidence was detected." },
    { signal: "resize-trigger-props", pattern: /getResizeTriggerProps/i, evidence: "resize trigger props API evidence was detected." },
    { signal: "drag-trigger-props", pattern: /getDragTriggerProps/i, evidence: "drag trigger props API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir\s+prop|dir-prop/i, evidence: "dir prop API evidence was detected." },
    { signal: "disabled-prop", pattern: /disabled:\s*prop\(["']disabled["']\)|prop\(["']disabled["']\)|disabled-prop/i, evidence: "disabled prop API evidence was detected." },
    { signal: "type-button", pattern: /type:\s*["']button["']|type button|type-button/i, evidence: "button type API evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "data-dragging", pattern: /data-dragging/i, evidence: "data-dragging API evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls API evidence was detected." },
    { signal: "role-dialog", pattern: /role:\s*["']dialog["']|role dialog|role-dialog/i, evidence: "dialog role API evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tabIndex API evidence was detected." },
    { signal: "hidden-content", pattern: /hidden:\s*!open|hidden content|hidden-content/i, evidence: "hidden content API evidence was detected." },
    { signal: "data-topmost", pattern: /data-topmost/i, evidence: "data-topmost API evidence was detected." },
    { signal: "data-behind", pattern: /data-behind/i, evidence: "data-behind API evidence was detected." },
    { signal: "data-minimized", pattern: /data-minimized/i, evidence: "data-minimized API evidence was detected." },
    { signal: "data-maximized", pattern: /data-maximized/i, evidence: "data-maximized API evidence was detected." },
    { signal: "data-staged", pattern: /data-staged/i, evidence: "data-staged API evidence was detected." },
    { signal: "data-axis", pattern: /data-axis/i, evidence: "data-axis API evidence was detected." },
    { signal: "css-position-vars", pattern: /--width|--height|--x|--y|css-position-vars/i, evidence: "position CSS variable API evidence was detected." },
    { signal: "escape-key", pattern: /Escape|escape-key/i, evidence: "Escape key API evidence was detected." },
    { signal: "arrow-key-move", pattern: /ArrowLeft|ArrowRight|ArrowUp|ArrowDown|arrow-key-move/i, evidence: "arrow key movement API evidence was detected." },
    { signal: "pointer-capture", pattern: /setPointerCapture|pointer capture|pointer-capture/i, evidence: "pointer capture API evidence was detected." },
    { signal: "pointer-release", pattern: /releasePointerCapture|hasPointerCapture|pointer-release/i, evidence: "pointer release API evidence was detected." },
    { signal: "stop-propagation", pattern: /stopPropagation|stop-propagation/i, evidence: "stopPropagation API evidence was detected." },
    { signal: "left-click-guard", pattern: /isLeftClick|left-click-guard/i, evidence: "left-click guard API evidence was detected." },
    { signal: "no-drag-guard", pattern: /data-no-drag|no-drag-guard/i, evidence: "no-drag guard API evidence was detected." },
    { signal: "double-click-stage", pattern: /onDoubleClick|double-click-stage/i, evidence: "double-click stage API evidence was detected." },
    { signal: "touch-action-none", pattern: /touchAction:\s*["']none["']|touchAction none|touch-action-none/i, evidence: "touch-action none API evidence was detected." },
    { signal: "cursor-move", pattern: /cursor:\s*["']move["']|cursor move|cursor-move/i, evidence: "cursor move API evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function floatingPanelTestSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["testSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|setPointerCapture|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|ArrowLeft|ArrowRight|Escape/i, evidence: "keyboard test evidence was detected." },
    { signal: "resize-test", pattern: /resize-test|ResizeObserver|data-axis|resize/i, evidence: "resize test evidence was detected." },
    { signal: "stage-test", pattern: /stage-test|data-stage|Maximize|Minimize|Restore/i, evidence: "stage test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|floating-panel-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function floatingPanelPackageSignals(sourceFiles: FloatingPanelReadinessSourceFile[]): FloatingPanelReadinessReport["packageSignals"] {
  const specs: Array<{ signal: FloatingPanelReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/floating-panel", pattern: /@zag-js\/floating-panel/i, evidence: "@zag-js/floating-panel dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react|normalizeProps|useMachine/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy/i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|createGuards/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|trackPointerMove|getEventKey|getEventStep/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/popper", pattern: /@zag-js\/popper/i, evidence: "@zag-js/popper evidence was detected." },
    { signal: "@zag-js/rect-utils", pattern: /@zag-js\/rect-utils/i, evidence: "@zag-js/rect-utils evidence was detected." },
    { signal: "@zag-js/store", pattern: /@zag-js\/store/i, evidence: "@zag-js/store evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|NormalizeProps|PropTypes|createProps/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|ensureProps|match|pick|clampValue|createSplitProps/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return floatingPanelSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function floatingPanelSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: FloatingPanelReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/floating-panel-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDrawerReadinessReport(walk: WalkResult): Promise<DrawerReadinessReport> {
  const sourceFiles = await drawerReadinessSourceFiles(walk);
  const drawerSetups = drawerReadinessSetups(sourceFiles);
  const frameworkSignals = drawerFrameworkSignals(sourceFiles);
  const structureSignals = drawerStructureSignals(sourceFiles);
  const stateSignals = drawerStateSignals(sourceFiles);
  const snapSignals = drawerSnapSignals(sourceFiles);
  const swipeSignals = drawerSwipeSignals(sourceFiles);
  const stackSignals = drawerStackSignals(sourceFiles);
  const focusAccessibilitySignals = drawerFocusAccessibilitySignals(sourceFiles);
  const machineSignals = drawerMachineSignals(sourceFiles);
  const contextSignals = drawerContextSignals(sourceFiles);
  const computedSignals = drawerComputedSignals(sourceFiles);
  const effectSignals = drawerEffectSignals(sourceFiles);
  const guardSignals = drawerGuardSignals(sourceFiles);
  const actionSignals = drawerActionSignals(sourceFiles);
  const domSignals = drawerDomSignals(sourceFiles);
  const apiSignals = drawerApiSignals(sourceFiles);
  const testSignals = drawerTestSignals(sourceFiles);
  const packageSignals = drawerPackageSignals(sourceFiles);

  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || drawerSetups.some((item) => item.triggerCount > 0 && item.contentCount > 0);
  const hasSnap = snapSignals.some((item) => item.readiness === "ready") || drawerSetups.some((item) => item.snapPointCount > 0);
  const hasSwipe = swipeSignals.some((item) => item.readiness === "ready") || drawerSetups.some((item) => item.swipeCount > 0);
  const hasStack = stackSignals.some((item) => item.readiness === "ready") || drawerSetups.some((item) => item.stackCount > 0);
  const hasFocusA11y = focusAccessibilitySignals.some((item) => item.readiness === "ready") || drawerSetups.some((item) => item.focusCount + item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || drawerSetups.some((item) => item.testCount > 0);

  const riskQueue: DrawerReadinessReport["riskQueue"] = [];
  if (!hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Trace trigger, positioner, content, title, description, backdrop, close trigger, grabber, and swipe area before claiming drawer readiness.",
      why: "Drawer readiness needs explicit structural parts so learners can separate modal shell, swipe surface, and content semantics.",
      relatedHref: "html/drawer-readiness.html"
    });
  }
  if (hasStructure && !hasSnap) {
    riskQueue.push({
      priority: "high",
      action: "Add snap point, default snap point, snap change, content size, viewport size, and rem snap evidence.",
      why: "Drawer snap behavior depends on static configuration plus live size math that RepoTutor only records as readiness evidence.",
      relatedHref: "html/drawer-readiness.html"
    });
  }
  if (hasStructure && !hasSwipe) {
    riskQueue.push({
      priority: "high",
      action: "Add swipe direction, pointer lifecycle, drag offset, swipe progress, velocity threshold, close threshold, and no-drag evidence.",
      why: "Drawer swipe behavior is easy to overclaim unless pointer and scroll-competition contracts are visible.",
      relatedHref: "html/drawer-readiness.html"
    });
  }
  if (hasStructure && !hasStack) {
    riskQueue.push({
      priority: "medium",
      action: "Add stack, registry, open count, frontmost height, nested metrics, register, and unregister evidence.",
      why: "Nested drawers need visible stack coordination so one drawer cannot corrupt another drawer's height, swipe progress, or cleanup.",
      relatedHref: "html/drawer-readiness.html"
    });
  }
  if (hasStructure && !hasFocusA11y) {
    riskQueue.push({
      priority: "high",
      action: "Add dialog role, aria-modal, labels, focus trap, initial/final focus, restore focus, Escape, outside interaction, scroll lock, and aria-hidden evidence.",
      why: "Drawer readiness is modal and accessibility-sensitive; static markup without focus and scroll contracts is not enough.",
      relatedHref: "html/drawer-readiness.html"
    });
  }
  if ((hasStructure || hasSnap || hasSwipe || hasStack) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, keyboard, swipe, snap, stack, and artifact tests for drawer behavior.",
      why: "Static readiness is stronger when tests preserve drawer interaction, modal, and nested-stack contracts.",
      relatedHref: "html/drawer-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live drawer open/close, focus trap, body scroll lock, aria-hidden, pointer/touch swipe, snap math, nested stack behavior, and analyzed-project tests outside RepoTutor.",
    why: "RepoTutor records drawer readiness only; it does not open real drawers, trap real focus, lock body scroll, hide live DOM, dispatch pointer or keyboard events, calculate real snap points, mutate drawer stacks, or run analyzed project tests.",
    relatedHref: "html/drawer-readiness.html"
  });

  return {
    summary: drawerSetups.length > 0
      ? `Drawer readiness report: setup ${drawerSetups.length} files, snap signal ${snapSignals.length}, swipe signal ${swipeSignals.length}, stack signal ${stackSignals.length}, focus/accessibility signal ${focusAccessibilitySignals.length}, machine signal ${machineSignals.length}, effect signal ${effectSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`
      : "No drawer readiness source files were detected.",
    sourcePattern: "Drawer readiness Zag drawer swipe snap stack modal focus accessibility tests",
    drawerSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    snapSignals,
    swipeSignals,
    stackSignals,
    focusAccessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    guardSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      {
        command: "rg \"@zag-js/drawer|drawer\\.machine|drawer\\.connect|getPositionerProps|getContentProps|getSwipeAreaProps|getGrabberProps\" package.json src app packages",
        purpose: "Find Zag drawer package usage, machine/connect setup, modal shell parts, grabbers, and swipe areas."
      },
      {
        command: "rg \"snapPoints|defaultSnapPoint|onSnapPointChange|getSnapPointIndex|getOpenPercentage|contentSize|viewportSize|rootFontSize|rem-snap-points\" src app packages test",
        purpose: "Inspect static snap point, size measurement, and rem/px snap evidence."
      },
      {
        command: "rg \"swipeDirection|POINTER_DOWN|POINTER_MOVE|POINTER_UP|POINTER_CANCEL|SWIPE_AREA.START|preventDragOnScroll|data-no-drag|DrawerSwipeSession|drawerRegistry|createStack|connectStack|drawer-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check swipe lifecycle, scroll competition, nested drawer stack, registry cleanup, and artifact traces."
      }
    ],
    learnerNextSteps: [
      "Open drawer setup links and identify trigger, positioner, content, backdrop, grabber, and swipe area parts before reading interaction code.",
      "Trace snap points from defaults through content size, viewport size, root font size, and open percentage calculations.",
      "Review swipe handling separately from snap handling, especially pointer lifecycle, velocity threshold, close threshold, no-drag exclusions, and scroll competition.",
      "Check nested drawer stack and registry cleanup before trusting multiple drawer flows.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type DrawerReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function drawerReadinessSourceFiles(walk: WalkResult): Promise<DrawerReadinessSourceFile[]> {
  const files: DrawerReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !drawerInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!drawerPathSignal(file.relPath) && !drawerContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 220) break;
  }
  return files;
}

function drawerInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return drawerPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function drawerPathSignal(filePath: string): boolean {
  return /drawer|sheet|side[-_ ]?panel|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function drawerContentSignal(text: string): boolean {
  return /@zag-js\/drawer|getSwipeAreaProps|getGrabberProps|createStack|connectStack|drawer-traces|data-drawer|DrawerSwipeSession/i.test(text);
}

function drawerReadinessSetups(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["drawerSetups"] {
  const rows: DrawerReadinessReport["drawerSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /getTriggerProps|data-part=['"]trigger|trigger/i);
    const positionerCount = countMatches(source.text, /getPositionerProps|data-part=['"]positioner|positioner/i);
    const contentCount = countMatches(source.text, /getContentProps|data-part=['"]content|role=['"]dialog|content/i);
    const titleCount = countMatches(source.text, /getTitleProps|data-part=['"]title|aria-labelledby|drawer-title|title/i);
    const descriptionCount = countMatches(source.text, /getDescriptionProps|data-part=['"]description|aria-describedby|drawer-description|description/i);
    const backdropCount = countMatches(source.text, /getBackdropProps|data-part=['"]backdrop|backdrop/i);
    const closeTriggerCount = countMatches(source.text, /getCloseTriggerProps|data-part=['"]close-trigger|closeTrigger|close-trigger/i);
    const grabberCount = countMatches(source.text, /getGrabberProps|data-part=['"]grabber|grabber/i);
    const grabberIndicatorCount = countMatches(source.text, /getGrabberIndicatorProps|grabberIndicator|grabber-indicator|data-part=['"]grabber-indicator/i);
    const swipeAreaCount = countMatches(source.text, /getSwipeAreaProps|swipeArea|swipe-area|SWIPE_AREA\.START/i);
    const snapPointCount = countMatches(source.text, /snapPoints|snapPoint|defaultSnapPoint|resolvedSnapPoints|onSnapPointChange|getSnapPointIndex|getOpenPercentage|getContentSize|rem-snap-points|snap-test/i);
    const swipeCount = countMatches(source.text, /swipeDirection|physicalSwipeDirection|POINTER_DOWN|POINTER_MOVE|POINTER_UP|POINTER_CANCEL|dragOffset|swipeProgress|DrawerSwipeSession|velocity|preventDragOnScroll|data-no-drag|swipe-test/i);
    const stackCount = countMatches(source.text, /createStack|connectStack|drawerStack|DrawerStack|drawerRegistry|nestedMetrics|frontmostHeight|openCount|register|unregister|setSwipe|stack-test/i);
    const focusCount = countMatches(source.text, /trapFocus|initialFocusEl|finalFocusEl|restoreFocus|setInitialFocus|aria-hidden|ariaHidden|preventBodyScroll|preventScroll|closeOnEscape|escape-close|focus-trap/i);
    const dismissCount = countMatches(source.text, /trackDismissableElement|closeOnInteractOutside|onInteractOutside|onFocusOutside|onPointerDownOutside|onRequestDismiss|onEscapeKeyDown|dismissable|interact-outside/i);
    const scrollLockCount = countMatches(source.text, /preventBodyScroll|preventScroll|remove-scroll|ariaHidden|hideContentBelow|scroll-lock|body-scroll/i);
    const accessibilityCount = countMatches(source.text, /role=['"]dialog|role-dialog|aria-modal|aria-labelledby|aria-describedby|aria-haspopup|aria-expanded|aria-controls|data-state|data-swipe-direction|dir=|dir:/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|test\(|@testing-library\/react|userEvent|pointer-test|keyboard-test|swipe-test|snap-test|stack-test|upload-artifact|drawer-traces/i);
    const evidenceScore = triggerCount + positionerCount + contentCount + titleCount + descriptionCount + backdropCount + closeTriggerCount + grabberCount + grabberIndicatorCount + swipeAreaCount + snapPointCount + swipeCount + stackCount + focusCount + dismissCount + scrollLockCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !drawerPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: drawerFramework(source),
      triggerCount,
      positionerCount,
      contentCount,
      titleCount,
      descriptionCount,
      backdropCount,
      closeTriggerCount,
      grabberCount,
      grabberIndicatorCount,
      swipeAreaCount,
      snapPointCount,
      swipeCount,
      stackCount,
      focusCount,
      dismissCount,
      scrollLockCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 11 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static drawer readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.snapPointCount + b.swipeCount + b.stackCount + b.focusCount + b.dismissCount + b.scrollLockCount + b.accessibilityCount + b.testCount;
    const aScore = a.snapPointCount + a.swipeCount + a.stackCount + a.focusCount + a.dismissCount + a.scrollLockCount + a.accessibilityCount + a.testCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function drawerFramework(source: DrawerReadinessSourceFile): DrawerReadinessReport["drawerSetups"][number]["framework"] {
  if (/@zag-js\/drawer|drawer\.machine|drawer\.connect/i.test(source.text)) return "zag-drawer";
  if (/custom drawer|data-drawer|drawer-traces|data-part=['"]swipe-area/i.test(source.text)) return "custom-drawer";
  if (/createStack|connectStack/i.test(source.text)) return "zag-drawer";
  return "unknown";
}

function drawerFrameworkSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-drawer", pattern: /@zag-js\/drawer|drawer\.machine|drawer\.connect|createStack|connectStack/i, evidence: "Zag drawer evidence was detected." },
    { signal: "custom-drawer", pattern: /custom drawer|data-drawer|drawer-traces|data-part=['"]swipe-area/i, evidence: "custom drawer evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function drawerStructureSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["structureSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger/i, evidence: "trigger evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|data-part=['"]positioner/i, evidence: "positioner evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|role=['"]dialog/i, evidence: "content evidence was detected." },
    { signal: "title", pattern: /getTitleProps|data-part=['"]title|aria-labelledby|drawer-title/i, evidence: "title evidence was detected." },
    { signal: "description", pattern: /getDescriptionProps|data-part=['"]description|aria-describedby|drawer-description/i, evidence: "description evidence was detected." },
    { signal: "backdrop", pattern: /getBackdropProps|data-part=['"]backdrop/i, evidence: "backdrop evidence was detected." },
    { signal: "close-trigger", pattern: /getCloseTriggerProps|data-part=['"]close-trigger|close-trigger/i, evidence: "close trigger evidence was detected." },
    { signal: "grabber", pattern: /getGrabberProps|data-part=['"]grabber/i, evidence: "grabber evidence was detected." },
    { signal: "grabber-indicator", pattern: /getGrabberIndicatorProps|grabberIndicator|grabber-indicator|data-part=['"]grabber-indicator/i, evidence: "grabber indicator evidence was detected." },
    { signal: "swipe-area", pattern: /getSwipeAreaProps|swipeArea|swipe-area|SWIPE_AREA\.START/i, evidence: "swipe area evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function drawerStateSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["stateSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /\bopen\b|data-state=['"]open/i, evidence: "open state evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed/i, evidence: "closed state evidence was detected." },
    { signal: "closing", pattern: /\bclosing\b|state\.matches\(['"]closing|data-closing/i, evidence: "closing state evidence was detected." },
    { signal: "swiping-open", pattern: /swiping-open|swipingOpen/i, evidence: "swiping-open state evidence was detected." },
    { signal: "swipe-area-dragging", pattern: /swipe-area-dragging/i, evidence: "swipe-area dragging state evidence was detected." },
    { signal: "dragging", pattern: /\bdragging\b|data-dragging/i, evidence: "dragging state evidence was detected." },
    { signal: "trigger-value", pattern: /triggerValue|trigger-value|TRIGGER_VALUE\.SET/i, evidence: "trigger value evidence was detected." },
    { signal: "expanded", pattern: /data-expanded|expanded/i, evidence: "expanded evidence was detected." },
    { signal: "nested-open", pattern: /data-nested-drawer-open|nested-open|nestedMetrics\.open/i, evidence: "nested-open evidence was detected." },
    { signal: "nested-swiping", pattern: /data-nested-drawer-swiping|nested-swiping|nestedMetrics\.swiping/i, evidence: "nested-swiping evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function drawerSnapSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["snapSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["snapSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "snap-points", pattern: /snapPoints|snap-points/i, evidence: "snap points evidence was detected." },
    { signal: "default-snap-point", pattern: /defaultSnapPoint|default-snap-point/i, evidence: "default snap point evidence was detected." },
    { signal: "snap-point-change", pattern: /onSnapPointChange|SNAP_POINT\.SET|snap-point-change/i, evidence: "snap point change evidence was detected." },
    { signal: "resolved-snap-points", pattern: /resolvedSnapPoints|resolvedActiveSnapPoint|resolved-snap-points/i, evidence: "resolved snap points evidence was detected." },
    { signal: "snap-index", pattern: /getSnapPointIndex|snap-index/i, evidence: "snap index evidence was detected." },
    { signal: "open-percentage", pattern: /getOpenPercentage|open-percentage/i, evidence: "open percentage evidence was detected." },
    { signal: "content-size", pattern: /getContentSize|contentSize|content-size/i, evidence: "content size evidence was detected." },
    { signal: "viewport-size", pattern: /viewportSize|viewport-size/i, evidence: "viewport size evidence was detected." },
    { signal: "root-font-size", pattern: /rootFontSize|root-font-size|rem-snap-points/i, evidence: "root font size evidence was detected." },
    { signal: "rem-snap-points", pattern: /\.endsWith\(["']rem["']\)|rem-snap-points|24rem/i, evidence: "rem snap point evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "snap", "signal");
}

function drawerSwipeSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["swipeSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["swipeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "swipe-direction", pattern: /swipeDirection|data-swipe-direction|swipe-direction/i, evidence: "swipe direction evidence was detected." },
    { signal: "physical-direction", pattern: /physicalSwipeDirection|physical-direction|resolveSwipeDirection/i, evidence: "physical direction evidence was detected." },
    { signal: "pointer-down", pattern: /POINTER_DOWN|onPointerDown|pointer-down/i, evidence: "pointer down evidence was detected." },
    { signal: "pointer-move", pattern: /POINTER_MOVE|pointer-move|bindDragTracking|trackPointerMove/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-up", pattern: /POINTER_UP|pointer-up/i, evidence: "pointer up evidence was detected." },
    { signal: "pointer-cancel", pattern: /POINTER_CANCEL|pointer-cancel/i, evidence: "pointer cancel evidence was detected." },
    { signal: "swipe-area-start", pattern: /SWIPE_AREA\.START|swipe-area-start/i, evidence: "swipe area start evidence was detected." },
    { signal: "drag-offset", pattern: /dragOffset|drag-offset/i, evidence: "drag offset evidence was detected." },
    { signal: "swipe-progress", pattern: /swipeProgress|--drawer-swipe-progress|swipe-progress/i, evidence: "swipe progress evidence was detected." },
    { signal: "velocity-threshold", pattern: /swipeVelocityThreshold|SNAP_VELOCITY_THRESHOLD|velocity-threshold/i, evidence: "velocity threshold evidence was detected." },
    { signal: "close-threshold", pattern: /closeThreshold|close-threshold/i, evidence: "close threshold evidence was detected." },
    { signal: "prevent-drag-on-scroll", pattern: /preventDragOnScroll|prevent-drag-on-scroll/i, evidence: "prevent-drag-on-scroll evidence was detected." },
    { signal: "no-drag", pattern: /data-no-drag|NO_DRAG|no-drag/i, evidence: "no-drag evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "swipe", "signal");
}

function drawerStackSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["stackSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["stackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "drawer-stack", pattern: /DrawerStack|drawer-stack|prop\("stack"\)/i, evidence: "drawer stack evidence was detected." },
    { signal: "create-stack", pattern: /createStack|create-stack/i, evidence: "create stack evidence was detected." },
    { signal: "connect-stack", pattern: /connectStack|connect-stack/i, evidence: "connect stack evidence was detected." },
    { signal: "register", pattern: /\.register\(|register\(|\bregister\b|data-register/i, evidence: "register evidence was detected." },
    { signal: "unregister", pattern: /\.unregister\(|unregister\(|\bunregister\b|data-unregister/i, evidence: "unregister evidence was detected." },
    { signal: "open-count", pattern: /openCount|open-count/i, evidence: "open count evidence was detected." },
    { signal: "frontmost-height", pattern: /frontmostHeight|frontmost-height|--drawer-frontmost-height/i, evidence: "frontmost height evidence was detected." },
    { signal: "swipe-progress", pattern: /setSwipe|swipeProgress|--drawer-swipe-progress/i, evidence: "stack swipe progress evidence was detected." },
    { signal: "nested-metrics", pattern: /nestedMetrics|data-nested-drawer-open|nested-metrics/i, evidence: "nested metrics evidence was detected." },
    { signal: "registry", pattern: /drawerRegistry|registry/i, evidence: "registry evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "stack", "signal");
}

function drawerFocusAccessibilitySignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["focusAccessibilitySignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["focusAccessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-dialog", pattern: /role:\s*["']dialog|role=['"]dialog|aria-haspopup=['"]dialog|role-dialog/i, evidence: "dialog role evidence was detected." },
    { signal: "aria-modal", pattern: /aria-modal/i, evidence: "aria-modal evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby evidence was detected." },
    { signal: "trap-focus", pattern: /trapFocus|trap-focus|focus-trap/i, evidence: "trap focus evidence was detected." },
    { signal: "initial-focus", pattern: /initialFocusEl|initial-focus|data-initial-focus/i, evidence: "initial focus evidence was detected." },
    { signal: "final-focus", pattern: /finalFocusEl|final-focus|data-final-focus/i, evidence: "final focus evidence was detected." },
    { signal: "restore-focus", pattern: /restoreFocus|restore-focus/i, evidence: "restore focus evidence was detected." },
    { signal: "escape-close", pattern: /closeOnEscape|escape-close|onEscapeKeyDown|Escape/i, evidence: "Escape close evidence was detected." },
    { signal: "interact-outside", pattern: /closeOnInteractOutside|onInteractOutside|interact-outside|dismissable/i, evidence: "outside interaction evidence was detected." },
    { signal: "prevent-scroll", pattern: /preventScroll|preventBodyScroll|prevent-scroll|remove-scroll/i, evidence: "prevent scroll evidence was detected." },
    { signal: "aria-hidden", pattern: /ariaHidden|aria-hidden/i, evidence: "aria-hidden evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-swipe-direction", pattern: /data-swipe-direction/i, evidence: "data-swipe-direction evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "focus/accessibility", "signal");
}

function drawerMachineSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["machineSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<DrawerSchema>|drawer\.machine/i, evidence: "createMachine DrawerSchema evidence was detected." },
    { signal: "create-guards", pattern: /createGuards<DrawerSchema>|createGuards\s+DrawerSchema/i, evidence: "createGuards DrawerSchema evidence was detected." },
    { signal: "default-props", pattern: /swipeVelocityThreshold|closeThreshold|preventDragOnScroll|defaultSnapPoint/i, evidence: "default props evidence was detected." },
    { signal: "initial-state", pattern: /initialState[\s\S]{0,140}open[\s\S]{0,120}defaultOpen[\s\S]{0,120}closed|initialState\s+open\s+defaultOpen\s+closed/i, evidence: "initial state evidence was detected." },
    { signal: "bindable-context", pattern: /resolvedActiveSnapPoint|nestedMetrics|swipeStrength|rootFontSize/i, evidence: "bindable context evidence was detected." },
    { signal: "refs", pattern: /refs[\s\S]{0,160}swipeSession[\s\S]{0,120}snapBackFrame|DrawerSwipeSession[\s\S]{0,120}AnimationFrame/i, evidence: "refs evidence was detected." },
    { signal: "computed-state", pattern: /computed[\s\S]{0,180}drawerId[\s\S]{0,120}physicalSwipeDirection[\s\S]{0,120}resolvedSnapPoints|drawerId\s+physicalSwipeDirection\s+resolvedSnapPoints/i, evidence: "computed state evidence was detected." },
    { signal: "watch-props", pattern: /watch[\s\S]{0,220}snapPoint[\s\S]{0,120}contentSize[\s\S]{0,120}rootFontSize[\s\S]{0,120}snapPoints[\s\S]{0,120}toggleVisibility|watch\s+snapPoint\s+contentSize\s+rootFontSize\s+snapPoints\s+open\s+dragOffset/i, evidence: "watch prop evidence was detected." },
    { signal: "root-events", pattern: /SNAP_POINT\.SET|TRIGGER_VALUE\.SET|CONTROLLED\.OPEN|CONTROLLED\.CLOSE/i, evidence: "root event evidence was detected." },
    { signal: "open-state", pattern: /\bclosing\b|\bclosed\b|state\.hasTag\(["']open["']\)/i, evidence: "open state chart evidence was detected." },
    { signal: "swipe-states", pattern: /swipe-area-dragging|swiping-open|trackSwipeOpenPointerMove|SWIPE_AREA\.START/i, evidence: "swipe state evidence was detected." },
    { signal: "implementation-block", pattern: /implementations:|guards:|actions:|effects:/i, evidence: "implementation block evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function drawerContextSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["contextSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-value", pattern: /triggerValue/i, evidence: "trigger value context evidence was detected." },
    { signal: "drag-offset", pattern: /dragOffset/i, evidence: "drag offset context evidence was detected." },
    { signal: "snap-point", pattern: /\bsnapPoint\b/i, evidence: "snap point context evidence was detected." },
    { signal: "resolved-active-snap-point", pattern: /resolvedActiveSnapPoint/i, evidence: "resolved active snap point evidence was detected." },
    { signal: "content-size", pattern: /contentSize/i, evidence: "content size context evidence was detected." },
    { signal: "viewport-size", pattern: /viewportSize/i, evidence: "viewport size context evidence was detected." },
    { signal: "root-font-size", pattern: /rootFontSize/i, evidence: "root font size context evidence was detected." },
    { signal: "swipe-strength", pattern: /swipeStrength|--drawer-swipe-strength/i, evidence: "swipe strength context evidence was detected." },
    { signal: "rendered", pattern: /rendered[\s\S]{0,80}title[\s\S]{0,80}description/i, evidence: "rendered title/description context evidence was detected." },
    { signal: "nested-metrics", pattern: /nestedMetrics|NestedDrawerMetrics/i, evidence: "nested metrics context evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function drawerComputedSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["computedSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "drawer-id", pattern: /drawerId/i, evidence: "drawerId computed evidence was detected." },
    { signal: "physical-swipe-direction", pattern: /physicalSwipeDirection|resolveSwipeDirection/i, evidence: "physical swipe direction computed evidence was detected." },
    { signal: "resolved-snap-points", pattern: /resolvedSnapPoints|dedupeSnapPoints|resolveSnapPoint/i, evidence: "resolved snap points computed evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function drawerEffectSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["effectSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-drawer-stack", pattern: /trackDrawerStack/i, evidence: "drawer stack effect evidence was detected." },
    { signal: "track-dismissable-element", pattern: /trackDismissableElement/i, evidence: "dismissable element effect evidence was detected." },
    { signal: "prevent-scroll", pattern: /preventScroll|preventBodyScroll|remove-scroll/i, evidence: "prevent scroll effect evidence was detected." },
    { signal: "trap-focus", pattern: /trapFocus|focus-trap/i, evidence: "trap focus effect evidence was detected." },
    { signal: "hide-content-below", pattern: /hideContentBelow|ariaHidden|aria-hidden/i, evidence: "hide content below effect evidence was detected." },
    { signal: "track-pointer-move", pattern: /trackPointerMove|bindDragTracking/i, evidence: "pointer move effect evidence was detected." },
    { signal: "track-size-measurements", pattern: /trackSizeMeasurements|resizeObserverBorderBox|contentSize/i, evidence: "size measurement effect evidence was detected." },
    { signal: "track-nested-drawer-metrics", pattern: /trackNestedDrawerMetrics|drawerRegistry/i, evidence: "nested drawer metrics effect evidence was detected." },
    { signal: "track-swipe-open-pointer-move", pattern: /trackSwipeOpenPointerMove|bindSwipeOpenTracking/i, evidence: "swipe-open pointer move effect evidence was detected." },
    { signal: "track-exit-animation", pattern: /trackExitAnimation|exitcomplete|ANIMATION_END/i, evidence: "exit animation effect evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function drawerGuardSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["guardSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-open-controlled", pattern: /isOpenControlled|CONTROLLED\.OPEN|CONTROLLED\.CLOSE/i, evidence: "open controlled guard evidence was detected." },
    { signal: "is-dragging", pattern: /isDragging|dragOffset/i, evidence: "isDragging guard evidence was detected." },
    { signal: "should-start-dragging", pattern: /shouldStartDragging|canStartDrag/i, evidence: "start dragging guard evidence was detected." },
    { signal: "should-close-on-swipe", pattern: /shouldCloseOnSwipe|shouldDismissOnRelease/i, evidence: "close on swipe guard evidence was detected." },
    { signal: "has-swipe-intent", pattern: /hasSwipeIntent|hasOpeningSwipeIntent/i, evidence: "swipe intent guard evidence was detected." },
    { signal: "should-open-on-swipe", pattern: /shouldOpenOnSwipe|shouldOpenOnRelease/i, evidence: "open on swipe guard evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function drawerActionSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["actionSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "initial-focus", pattern: /setInitialFocus|initialFocusEl|getInitialFocus/i, evidence: "initial focus action evidence was detected." },
    { signal: "rendered-elements", pattern: /checkRenderedElements|rendered[\s\S]{0,80}title[\s\S]{0,80}description/i, evidence: "rendered elements action evidence was detected." },
    { signal: "drag-offset-cleanup", pattern: /deferClearDragOffset|clearDragOffset|resetDragOffset/i, evidence: "drag offset cleanup action evidence was detected." },
    { signal: "swipe-open-animation", pattern: /suppressBackdropAnimation|clearSwipeOpenAnimation/i, evidence: "swipe open animation action evidence was detected." },
    { signal: "trigger-value", pattern: /setTriggerValue|TRIGGER_VALUE\.SET|triggerValue/i, evidence: "trigger value action evidence was detected." },
    { signal: "open-close-callbacks", pattern: /invokeOnOpen|invokeOnClose|onOpenChange/i, evidence: "open/close callback action evidence was detected." },
    { signal: "snap-point", pattern: /setSnapPoint|SNAP_POINT\.SET/i, evidence: "snap point action evidence was detected." },
    { signal: "pointer-start", pattern: /setPointerStart|clearPointerStart|beginSwipe|clearSwipeStart/i, evidence: "pointer start action evidence was detected." },
    { signal: "drag-offset", pattern: /setDragOffset|dragOffset/i, evidence: "drag offset action evidence was detected." },
    { signal: "swipe-open-drag-offset", pattern: /setSwipeOpenDragOffset|setSwipeOpenOffset/i, evidence: "swipe open drag offset action evidence was detected." },
    { signal: "closest-snap-point", pattern: /setClosestSnapPoint|resolveSnapPointOnRelease|findClosestSnapPoint/i, evidence: "closest snap point action evidence was detected." },
    { signal: "clear-snap-and-size", pattern: /clearActiveSnapPoint|clearResolvedActiveSnapPoint|clearSizeMeasurements/i, evidence: "clear snap and size action evidence was detected." },
    { signal: "velocity-tracking", pattern: /clearVelocityTracking|resetVelocity/i, evidence: "velocity tracking action evidence was detected." },
    { signal: "swipe-strength", pattern: /setSnapSwipeStrength|setDismissSwipeStrength|resetSwipeStrength/i, evidence: "swipe strength action evidence was detected." },
    { signal: "snap-back", pattern: /scheduleSnapBack|cancelSnapBack|SNAP_BACK/i, evidence: "snap back action evidence was detected." },
    { signal: "registry-swiping", pattern: /setRegistrySwiping|clearRegistrySwiping|setSwiping/i, evidence: "registry swiping action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility/i, evidence: "toggle visibility action evidence was detected." },
    { signal: "sync-drawer-stack", pattern: /syncDrawerStack|setSwipeProgress|resolveSwipeProgress/i, evidence: "sync drawer stack action evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function drawerDomSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["domSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "content-id", pattern: /getContentId/i, evidence: "content ID evidence was detected." },
    { signal: "positioner-id", pattern: /getPositionerId/i, evidence: "positioner ID evidence was detected." },
    { signal: "title-id", pattern: /getTitleId/i, evidence: "title ID evidence was detected." },
    { signal: "description-id", pattern: /getDescriptionId/i, evidence: "description ID evidence was detected." },
    { signal: "trigger-id", pattern: /getTriggerId/i, evidence: "trigger ID evidence was detected." },
    { signal: "trigger-els", pattern: /getTriggerEls|queryAll[\s\S]{0,100}trigger/i, evidence: "trigger elements query evidence was detected." },
    { signal: "active-trigger-el", pattern: /getActiveTriggerEl/i, evidence: "active trigger element evidence was detected." },
    { signal: "backdrop-id", pattern: /getBackdropId/i, evidence: "backdrop ID evidence was detected." },
    { signal: "header-id", pattern: /getHeaderId/i, evidence: "header ID evidence was detected." },
    { signal: "grabber-id", pattern: /getGrabberId/i, evidence: "grabber ID evidence was detected." },
    { signal: "grabber-indicator-id", pattern: /getGrabberIndicatorId/i, evidence: "grabber indicator ID evidence was detected." },
    { signal: "close-trigger-id", pattern: /getCloseTriggerId/i, evidence: "close trigger ID evidence was detected." },
    { signal: "swipe-area-id", pattern: /getSwipeAreaId/i, evidence: "swipe area ID evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element evidence was detected." },
    { signal: "positioner-el", pattern: /getPositionerEl/i, evidence: "positioner element evidence was detected." },
    { signal: "title-el", pattern: /getTitleEl/i, evidence: "title element evidence was detected." },
    { signal: "description-el", pattern: /getDescriptionEl/i, evidence: "description element evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl/i, evidence: "trigger element evidence was detected." },
    { signal: "backdrop-el", pattern: /getBackdropEl/i, evidence: "backdrop element evidence was detected." },
    { signal: "header-el", pattern: /getHeaderEl/i, evidence: "header element evidence was detected." },
    { signal: "grabber-el", pattern: /getGrabberEl/i, evidence: "grabber element evidence was detected." },
    { signal: "grabber-indicator-el", pattern: /getGrabberIndicatorEl/i, evidence: "grabber indicator element evidence was detected." },
    { signal: "close-trigger-el", pattern: /getCloseTriggerEl/i, evidence: "close trigger element evidence was detected." },
    { signal: "swipe-area-el", pattern: /getSwipeAreaEl/i, evidence: "swipe area element evidence was detected." },
    { signal: "content-or-swipe-area-hit-test", pattern: /isPointerWithinContentOrSwipeArea|contains\(target\)/i, evidence: "content or swipe-area hit-test evidence was detected." },
    { signal: "scroll-elements", pattern: /getScrollEls|scrollHeight|scrollWidth/i, evidence: "scroll element query evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function drawerApiSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["apiSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /api\.open|\bopen\b/i, evidence: "open API evidence was detected." },
    { signal: "dragging", pattern: /api\.dragging|\bdragging\b/i, evidence: "dragging API evidence was detected." },
    { signal: "set-open", pattern: /setOpen|api\.setOpen/i, evidence: "setOpen API evidence was detected." },
    { signal: "snap-points", pattern: /api\.snapPoints|\bsnapPoints\b/i, evidence: "snapPoints API evidence was detected." },
    { signal: "swipe-direction", pattern: /api\.swipeDirection|swipeDirection/i, evidence: "swipe direction API evidence was detected." },
    { signal: "snap-point", pattern: /api\.snapPoint|\bsnapPoint\b/i, evidence: "snap point API evidence was detected." },
    { signal: "set-snap-point", pattern: /setSnapPoint|api\.setSnapPoint/i, evidence: "setSnapPoint API evidence was detected." },
    { signal: "open-percentage", pattern: /getOpenPercentage|api\.getOpenPercentage/i, evidence: "open percentage API evidence was detected." },
    { signal: "snap-point-index", pattern: /getSnapPointIndex|api\.getSnapPointIndex/i, evidence: "snap point index API evidence was detected." },
    { signal: "content-size-api", pattern: /getContentSize|api\.getContentSize/i, evidence: "content size API evidence was detected." },
    { signal: "trigger-value-api", pattern: /api\.triggerValue|triggerValue/i, evidence: "triggerValue API evidence was detected." },
    { signal: "set-trigger-value", pattern: /setTriggerValue|api\.setTriggerValue/i, evidence: "setTriggerValue API evidence was detected." },
    { signal: "positioner-props", pattern: /getPositionerProps/i, evidence: "positioner props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "title-props", pattern: /getTitleProps/i, evidence: "title props API evidence was detected." },
    { signal: "description-props", pattern: /getDescriptionProps/i, evidence: "description props API evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps/i, evidence: "trigger props API evidence was detected." },
    { signal: "backdrop-props", pattern: /getBackdropProps/i, evidence: "backdrop props API evidence was detected." },
    { signal: "grabber-props", pattern: /getGrabberProps/i, evidence: "grabber props API evidence was detected." },
    { signal: "grabber-indicator-props", pattern: /getGrabberIndicatorProps/i, evidence: "grabber indicator props API evidence was detected." },
    { signal: "close-trigger-props", pattern: /getCloseTriggerProps/i, evidence: "close trigger props API evidence was detected." },
    { signal: "swipe-area-props", pattern: /getSwipeAreaProps/i, evidence: "swipe area props API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir\s+prop|dir-prop/i, evidence: "dir prop API evidence was detected." },
    { signal: "hidden-prop", pattern: /hidden:|\bhidden\b|hidden-prop/i, evidence: "hidden API evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "data-swipe-direction", pattern: /data-swipe-direction/i, evidence: "data-swipe-direction API evidence was detected." },
    { signal: "pointer-events-none", pattern: /pointerEvents[\s\S]{0,80}none|pointerEvents none|pointer-events-none/i, evidence: "pointer-events none API evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tabIndex API evidence was detected." },
    { signal: "role-prop", pattern: /role:\s*prop\(["']role["']\)|role[\s\S]{0,40}aria-modal|role-prop/i, evidence: "role prop API evidence was detected." },
    { signal: "aria-modal", pattern: /aria-modal/i, evidence: "aria-modal API evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby API evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby API evidence was detected." },
    { signal: "data-expanded", pattern: /data-expanded/i, evidence: "data-expanded API evidence was detected." },
    { signal: "data-swiping", pattern: /data-swiping/i, evidence: "data-swiping API evidence was detected." },
    { signal: "data-dragging", pattern: /data-dragging/i, evidence: "data-dragging API evidence was detected." },
    { signal: "nested-open", pattern: /data-nested-drawer-open|nested-open/i, evidence: "nested drawer open API evidence was detected." },
    { signal: "nested-swiping", pattern: /data-nested-drawer-swiping|nested-swiping/i, evidence: "nested drawer swiping API evidence was detected." },
    { signal: "transform-translate3d", pattern: /translate3d|transform-translate3d/i, evidence: "translate3d transform API evidence was detected." },
    { signal: "drawer-css-vars", pattern: /--drawer-translate|--drawer-snap-point-offset|--drawer-swipe-movement|--drawer-swipe-strength|--nested-drawers|drawer-css-vars/i, evidence: "drawer CSS variable API evidence was detected." },
    { signal: "will-change-transform", pattern: /willChange[\s\S]{0,40}transform|will-change-transform/i, evidence: "will-change transform API evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby API evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value API evidence was detected." },
    { signal: "aria-haspopup-dialog", pattern: /aria-haspopup[\s\S]{0,40}dialog|aria-haspopup-dialog/i, evidence: "aria-haspopup dialog API evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded API evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls API evidence was detected." },
    { signal: "data-current", pattern: /data-current/i, evidence: "data-current API evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden/i, evidence: "aria-hidden API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled API evidence was detected." },
    { signal: "touch-action-pan", pattern: /touchAction[\s\S]{0,80}pan-[xy]|touchAction pan-x pan-y|touch-action-pan/i, evidence: "touch action pan API evidence was detected." },
    { signal: "touch-start", pattern: /onTouchStart|touch-start/i, evidence: "touch start API evidence was detected." },
    { signal: "prevent-default", pattern: /preventDefault|prevent-default/i, evidence: "preventDefault API evidence was detected." },
    { signal: "left-click-guard", pattern: /isLeftClick|left-click-guard/i, evidence: "left-click guard API evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function drawerTestSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["testSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(|test\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|render\(|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|Escape/i, evidence: "keyboard test evidence was detected." },
    { signal: "swipe-test", pattern: /swipe-test|swipe/i, evidence: "swipe test evidence was detected." },
    { signal: "snap-test", pattern: /snap-test|snapPoint|snap/i, evidence: "snap test evidence was detected." },
    { signal: "stack-test", pattern: /stack-test|createStack|frontmostHeight|openCount/i, evidence: "stack test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|drawer-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function drawerPackageSignals(sourceFiles: DrawerReadinessSourceFile[]): DrawerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DrawerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/drawer", pattern: /@zag-js\/drawer/i, evidence: "@zag-js/drawer dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react|normalizeProps|useMachine/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy/i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|createGuards/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/aria-hidden", pattern: /@zag-js\/aria-hidden|aria-hidden/i, evidence: "@zag-js/aria-hidden evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable|dismissable/i, evidence: "@zag-js/dismissable evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|getEventPoint|queryAll|resizeObserverBorderBox/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/focus-trap", pattern: /@zag-js\/focus-trap|focus-trap/i, evidence: "@zag-js/focus-trap evidence was detected." },
    { signal: "@zag-js/remove-scroll", pattern: /@zag-js\/remove-scroll|remove-scroll/i, evidence: "@zag-js/remove-scroll evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|NormalizeProps|PropTypes|createProps/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createSplitProps|clampValue|compact|toPx/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return drawerSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function drawerSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DrawerReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/drawer-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
