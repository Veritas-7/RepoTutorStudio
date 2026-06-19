import path from "node:path";
import type { MenuDropdownReadinessReport, PopoverTooltipReadinessReport, ToastSnackbarReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildPopoverTooltipReadinessReport(walk: WalkResult): Promise<PopoverTooltipReadinessReport> {
  const sourceFiles = await popoverTooltipReadinessSourceFiles(walk);
  const popoverTooltipSetups = popoverTooltipReadinessSetups(sourceFiles);
  const frameworkSignals = popoverTooltipReadinessFrameworkSignals(sourceFiles);
  const structureSignals = popoverTooltipReadinessStructureSignals(sourceFiles);
  const positioningSignals = popoverTooltipReadinessPositioningSignals(sourceFiles);
  const interactionSignals = popoverTooltipReadinessInteractionSignals(sourceFiles);
  const dismissalSignals = popoverTooltipReadinessDismissalSignals(sourceFiles);
  const focusSignals = popoverTooltipReadinessFocusSignals(sourceFiles);
  const accessibilitySignals = popoverTooltipReadinessAccessibilitySignals(sourceFiles);
  const portalSignals = popoverTooltipReadinessPortalSignals(sourceFiles);
  const implementationSignals = popoverTooltipReadinessImplementationSignals(sourceFiles);
  const testSignals = popoverTooltipReadinessTestSignals(sourceFiles);
  const packageSignals = popoverTooltipReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || popoverTooltipSetups.some((item) => item.contentCount + item.triggerCount + item.anchorCount > 0);
  const hasPositioning = positioningSignals.some((item) => item.readiness === "ready") || popoverTooltipSetups.some((item) => item.positionCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || popoverTooltipSetups.some((item) => item.interactionCount > 0);
  const hasDismissal = dismissalSignals.some((item) => item.readiness === "ready") || popoverTooltipSetups.some((item) => item.dismissCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || popoverTooltipSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || popoverTooltipSetups.some((item) => item.testCount > 0);

  const riskQueue: PopoverTooltipReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document popover, tooltip, hovercard, or Floating UI surface boundaries before claiming overlay readiness.",
      why: "Popover/tooltip readiness starts with explicit trigger, anchor/reference, content, and portal evidence.",
      relatedHref: "html/popover-tooltip-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasPositioning) {
    riskQueue.push({
      priority: "high",
      action: "Document positioning middleware or props such as side, align, placement, offset, flip, shift, arrow, autoUpdate, and collision boundary.",
      why: "Floating surfaces fail when collision, scroll, resize, and arrow positioning are not traceable.",
      relatedHref: "html/popover-tooltip-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasInteraction) {
    riskQueue.push({
      priority: "high",
      action: "Trace click, hover, focus, safe-polygon, delay, open state, and controlled onOpenChange behavior.",
      why: "Popover and tooltip behavior depends on exact trigger modality and state ownership.",
      relatedHref: "html/popover-tooltip-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasDismissal) {
    riskQueue.push({
      priority: "medium",
      action: "Record Escape, outside press, dismiss components, close controls, and hide-on-interact-outside behavior.",
      why: "Floating surfaces need predictable exit paths that work for pointer and keyboard users.",
      relatedHref: "html/popover-tooltip-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Add role, aria-describedby, aria-labelledby, aria-label, aria-expanded, aria-controls, and keyboard navigation evidence.",
      why: "Tooltips and popovers often sit on accessibility boundaries between description, dialog, and disclosure patterns.",
      relatedHref: "html/popover-tooltip-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for hover/focus/click triggers, role discovery, labels, Escape, Tab flow, focus return, and portal artifacts.",
      why: "Popover and tooltip regressions often hide in trigger modality, focus, portal, and positioning edge cases.",
      relatedHref: "html/popover-tooltip-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live popover and tooltip behavior in a trusted browser or original project tests outside RepoTutor.",
    why: "RepoTutor records popover/tooltip readiness only; it does not open floating surfaces, measure DOM geometry, move focus, calculate collision, dispatch hover/click/Escape/outside press, lock scroll, animate portals, or run analyzed project tests.",
    relatedHref: "html/popover-tooltip-readiness.html"
  });

  return {
    summary: `Radix Popover/Tooltip, Headless UI Popover, Floating UI, and Ariakit-style popover/tooltip readiness report: setup ${popoverTooltipSetups.length}개, framework signal ${frameworkSignals.length}개, implementation signal ${implementationSignals.length}개, positioning signal ${positioningSignals.length}개, accessibility signal ${accessibilitySignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Popover/tooltip readiness Radix Popover Radix Tooltip Headless UI Popover machine sentinels portalled focus Floating UI Ariakit Popover Tooltip portal positioning hover focus dismissal accessibility tests",
    popoverTooltipSetups,
    frameworkSignals,
    structureSignals,
    positioningSignals,
    interactionSignals,
    dismissalSignals,
    focusSignals,
    accessibilitySignals,
    portalSignals,
    implementationSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-popover|Popover.Root|Popover.Trigger|Popover.Anchor|Popover.Portal|Popover.Content|Popover.Arrow|Popover.Close\" src app packages test", purpose: "Find Radix Popover roots, triggers, anchors, portals, positioned content, arrows, and close controls." },
      { command: "rg \"@radix-ui/react-tooltip|Tooltip.Provider|Tooltip.Root|Tooltip.Trigger|Tooltip.Content|delayDuration|aria-describedby\" src app packages test", purpose: "Find Radix Tooltip providers, trigger/content pairs, delay policy, and description wiring." },
      { command: "rg \"@radix-ui/react-hover-card|HoverCard.Root|HoverCard.Trigger|HoverCard.Content|openDelay|closeDelay|onPointerDownOutside\" src app packages test", purpose: "Find hovercard trigger/content, delay, pointer-outside, and portal behavior." },
      { command: "rg \"@headlessui/react|<Popover|PopoverButton|PopoverPanel|PopoverBackdrop|usePopoverMachine|PopoverMachine|PopoverContext|useNestedPortals|useRootContainers|data-headlessui-focus-guard|refocusableClose|isPortalled\" src app packages test", purpose: "Find Headless UI Popover roots, buttons, panels, backdrop, machine, portal, focus guard, and refocus behavior." },
      { command: "rg \"@floating-ui/react|useFloating|FloatingPortal|FloatingFocusManager|useInteractions|useClick|useHover|useFocus|useDismiss|useRole|offset\\(|flip\\(|shift\\(|arrow\\(|autoUpdate|safePolygon\" src app packages test", purpose: "Find Floating UI reference/floating refs, middleware, portal, focus manager, interaction hooks, and safe hover polygon." },
      { command: "rg \"@ariakit/react|PopoverProvider|usePopoverStore|PopoverDisclosure|PopoverDismiss|TooltipProvider|useTooltipStore|HovercardProvider|useHovercardStore|gutter|placement|hideOnEscape|hideOnInteractOutside\" src app packages test", purpose: "Find Ariakit popover/tooltip/hovercard store, provider, placement, dismissal, and disclosure wiring." },
      { command: "rg \"getByRole\\(['\\\"]tooltip|getByRole\\(['\\\"]dialog|getByLabelText|userEvent\\.hover|userEvent\\.keyboard|Escape|document\\.activeElement|aria-expanded|aria-controls|aria-describedby\" src app packages test", purpose: "Review popover/tooltip role, label, hover, keyboard, focus, and accessibility tests." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover popover/tooltip triggers, labels, focus, dismissal, portal, and positioning behavior." }
    ],
    learnerNextSteps: [
      "먼저 Radix Popover/Tooltip/HoverCard, Floating UI, Ariakit Popover/Tooltip/Hovercard, custom overlay 중 어떤 boundary가 있는지 찾으세요.",
      "root/provider, trigger/reference, anchor, portal, content, arrow, dismiss, heading, description 신호로 floating surface structure를 확인하세요.",
      "useFloating, Popper, sideOffset, align, placement, offset, flip, shift, arrow middleware, autoUpdate, collision boundary 신호로 positioning contract를 추적하세요.",
      "click, hover, focus, safePolygon, delayDuration, open, onOpenChange, controlled state 신호로 interaction ownership을 분리하세요.",
      "DismissableLayer, useDismiss, Escape, outside click/press, PopoverDismiss, hideOnEscape, hideOnInteractOutside 신호로 dismissal policy를 확인하세요.",
      "FocusScope, FloatingFocusManager, initialFocus, returnFocus, modal focus, tabIndex 신호로 keyboard/focus 위험을 점검하세요.",
      "role tooltip/dialog, aria-describedby, aria-labelledby, aria-label, aria-expanded, aria-controls, keyboard navigation 신호로 accessibility contract를 확인하세요.",
      "Headless UI Popover는 machine, refocusable close, portalled selector, root containers, nested portals, focus guard sentinels, scroll lock, transition, and panel unlink behavior를 구현 신호로 따로 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 floating surface open, DOM geometry, collision, hover/click/Escape/outside press, focus movement, scroll locking은 안전한 테스트 환경에서 별도로 검증하세요."
    ]
  };
}

type PopoverTooltipReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function popoverTooltipReadinessSourceFiles(walk: WalkResult): Promise<PopoverTooltipReadinessSourceFile[]> {
  const files: PopoverTooltipReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !popoverTooltipReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!popoverTooltipReadinessPathSignal(file.relPath) && !popoverTooltipReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function popoverTooltipReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return popoverTooltipReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function popoverTooltipReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(popover|popovers|tooltip|tooltips|hover[-_ ]?card|hovercard|floating[-_ ]?ui|floating|overlay|overlays|portal|portals|dropdown|menu|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function popoverTooltipReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-popover|@radix-ui\/react-tooltip|@radix-ui\/react-hover-card|Popover\.Root|Popover\.Trigger|Popover\.Content|Tooltip\.Provider|Tooltip\.Root|Tooltip\.Content|HoverCard\.Root|HoverCard\.Content|@headlessui\/react|PopoverButton|PopoverPanel|usePopoverMachine|PopoverMachine|PopoverStates|data-headlessui-focus-guard|@floating-ui\/react|useFloating|FloatingPortal|FloatingFocusManager|useInteractions|useDismiss|@ariakit\/react|PopoverProvider|usePopoverStore|TooltipProvider|useTooltipStore|HovercardProvider|useHovercardStore|role\s*=\s*["']tooltip|aria-describedby|aria-expanded|aria-controls)/i.test(text);
}

function popoverTooltipReadinessSetups(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["popoverTooltipSetups"] {
  const rows: PopoverTooltipReadinessReport["popoverTooltipSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /(Popover\.Trigger|Tooltip\.Trigger|HoverCard\.Trigger|PopoverTrigger|TooltipTrigger|HoverCardTrigger|PopoverDisclosure|TooltipAnchor|HovercardAnchor|HovercardDisclosure|refs\.setReference|aria-expanded)/gi);
    const anchorCount = countMatches(source.text, /(Popover\.Anchor|PopoverAnchor|TooltipAnchor|HovercardAnchor|refs\.setReference|reference|anchor)/gi);
    const portalCount = countMatches(source.text, /(Popover\.Portal|Tooltip\.Portal|HoverCard\.Portal|FloatingPortal|portal\s*=|portal:|Portal)/gi);
    const contentCount = countMatches(source.text, /(Popover\.Content|Tooltip\.Content|HoverCard\.Content|FloatingFocusManager|FloatingOverlay|refs\.setFloating|floatingStyles|<Popover\b|<Tooltip\b|<Hovercard\b|<HoverCard\b)/gi);
    const positionCount = countMatches(source.text, /(useFloating|Popper|sideOffset|align\s*=|align:|placement|offset\(|flip\(|shift\(|arrow\(|FloatingArrow|Popover\.Arrow|Tooltip\.Arrow|HoverCard\.Arrow|PopoverArrow|TooltipArrow|HovercardArrow|autoUpdate|collisionBoundary|avoidCollisions|gutter)/gi);
    const interactionCount = countMatches(source.text, /(useClick|useHover|useFocus|useInteractions|safePolygon|delayDuration|openDelay|closeDelay|timeout|open\s*=|defaultOpen|onOpenChange|setOpen|controlled|userEvent\.hover)/gi);
    const dismissCount = countMatches(source.text, /(DismissableLayer|useDismiss|escapeKey|outsidePress|onEscapeKeyDown|onPointerDownOutside|onInteractOutside|Popover\.Close|PopoverClose|PopoverDismiss|HovercardDismiss|hideOnEscape|hideOnInteractOutside|setOpen\(false\)|Escape)/gi);
    const focusCount = countMatches(source.text, /(FocusScope|FloatingFocusManager|onOpenAutoFocus|onCloseAutoFocus|initialFocus|returnFocus|autoFocusOnShow|autoFocusOnHide|modal\s*=|modal:|tabIndex|initialFocus=\{-?1\}|document\.activeElement)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']tooltip|role:\s*["']tooltip|role\s*=\s*["']dialog|aria-describedby|aria-labelledby|aria-label|aria-expanded|aria-controls|getByRole|getByLabelText|keyboard|userEvent\.keyboard)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.hover|userEvent\.keyboard|getByRole|getByLabelText|popover-tooltip-traces|upload-artifact)/gi);
    const total = triggerCount + anchorCount + portalCount + contentCount + positionCount + interactionCount + dismissCount + focusCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = contentCount > 0 && (triggerCount > 0 || anchorCount > 0) && positionCount > 0 && interactionCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: popoverTooltipReadinessFramework(source),
      triggerCount,
      anchorCount,
      portalCount,
      contentCount,
      positionCount,
      interactionCount,
      dismissCount,
      focusCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `trigger ${triggerCount}, anchor ${anchorCount}, portal ${portalCount}, content ${contentCount}, positioning ${positionCount}, interaction ${interactionCount}, dismissal ${dismissCount}, focus ${focusCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.triggerCount + b.contentCount + b.positionCount + b.interactionCount + b.accessibilityCount - (a.triggerCount + a.contentCount + a.positionCount + a.interactionCount + a.accessibilityCount));
}

function popoverTooltipReadinessFramework(source: PopoverTooltipReadinessSourceFile): PopoverTooltipReadinessReport["popoverTooltipSetups"][number]["framework"] {
  if (/@radix-ui\/react-popover|Popover\.Root|Popover\.Trigger|Popover\.Content/i.test(source.text)) return "radix-popover";
  if (/@radix-ui\/react-tooltip|Tooltip\.Provider|Tooltip\.Root|Tooltip\.Content/i.test(source.text)) return "radix-tooltip";
  if (/@radix-ui\/react-hover-card|HoverCard\.Root|HoverCard\.Content/i.test(source.text)) return "radix-hover-card";
  if (/@headlessui\/react|PopoverButton|PopoverPanel|PopoverBackdrop|usePopoverMachine|PopoverMachine|PopoverContext/i.test(source.text)) return "headless-popover";
  if (/@floating-ui\/react|useFloating|FloatingPortal|FloatingFocusManager/i.test(source.text)) return "floating-ui";
  if (/PopoverProvider|usePopoverStore|PopoverDisclosure|PopoverDismiss/i.test(source.text)) return "ariakit-popover";
  if (/TooltipProvider|useTooltipStore|TooltipAnchor|TooltipArrow/i.test(source.text)) return "ariakit-tooltip";
  if (/HovercardProvider|useHovercardStore|HovercardAnchor|HovercardDisclosure/i.test(source.text)) return "ariakit-hovercard";
  if (/popover|tooltip|hovercard|floating/i.test(source.filePath) || /role\s*=\s*["']tooltip/i.test(source.text)) return "custom";
  return "unknown";
}

function popoverTooltipReadinessFrameworkSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-popover", pattern: /@radix-ui\/react-popover|Popover\.Root|Popover\.Trigger|Popover\.Content/i, evidence: "Radix Popover evidence was detected." },
    { signal: "radix-tooltip", pattern: /@radix-ui\/react-tooltip|Tooltip\.Provider|Tooltip\.Root|Tooltip\.Content/i, evidence: "Radix Tooltip evidence was detected." },
    { signal: "radix-hover-card", pattern: /@radix-ui\/react-hover-card|HoverCard\.Root|HoverCard\.Trigger|HoverCard\.Content/i, evidence: "Radix HoverCard evidence was detected." },
    { signal: "headless-popover", pattern: /@headlessui\/react|PopoverButton|PopoverPanel|PopoverBackdrop|usePopoverMachine|PopoverMachine|PopoverContext/i, evidence: "Headless UI Popover evidence was detected." },
    { signal: "floating-ui", pattern: /@floating-ui\/react|@floating-ui\/react-dom|useFloating|FloatingPortal|FloatingFocusManager/i, evidence: "Floating UI evidence was detected." },
    { signal: "ariakit-popover", pattern: /PopoverProvider|usePopoverStore|PopoverDisclosure|PopoverDismiss|PopoverArrow/i, evidence: "Ariakit Popover evidence was detected." },
    { signal: "ariakit-tooltip", pattern: /TooltipProvider|useTooltipStore|TooltipAnchor|TooltipArrow/i, evidence: "Ariakit Tooltip evidence was detected." },
    { signal: "ariakit-hovercard", pattern: /HovercardProvider|useHovercardStore|HovercardAnchor|HovercardDisclosure|HovercardDismiss/i, evidence: "Ariakit Hovercard evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']tooltip|aria-describedby|aria-expanded/i, evidence: "custom popover/tooltip evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function popoverTooltipReadinessStructureSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["structureSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /Popover\.Root|Tooltip\.Root|HoverCard\.Root|useFloating|usePopoverStore|useTooltipStore|useHovercardStore/i, evidence: "root/store evidence was detected." },
    { signal: "provider", pattern: /Tooltip\.Provider|PopoverProvider|TooltipProvider|HovercardProvider/i, evidence: "provider evidence was detected." },
    { signal: "trigger", pattern: /Popover\.Trigger|Tooltip\.Trigger|HoverCard\.Trigger|PopoverDisclosure|HovercardDisclosure|refs\.setReference|aria-expanded/i, evidence: "trigger/reference evidence was detected." },
    { signal: "anchor", pattern: /Popover\.Anchor|PopoverAnchor|TooltipAnchor|HovercardAnchor|refs\.setReference|anchor/i, evidence: "anchor evidence was detected." },
    { signal: "portal", pattern: /Popover\.Portal|Tooltip\.Portal|HoverCard\.Portal|FloatingPortal|portal\s*=|Portal/i, evidence: "portal evidence was detected." },
    { signal: "content", pattern: /Popover\.Content|Tooltip\.Content|HoverCard\.Content|FloatingFocusManager|refs\.setFloating|<Popover\b|<Tooltip\b|<Hovercard\b/i, evidence: "content evidence was detected." },
    { signal: "arrow", pattern: /Popover\.Arrow|Tooltip\.Arrow|HoverCard\.Arrow|FloatingArrow|PopoverArrow|TooltipArrow|HovercardArrow|arrow\(/i, evidence: "arrow evidence was detected." },
    { signal: "dismiss", pattern: /Popover\.Close|PopoverDismiss|HovercardDismiss|useDismiss|onEscapeKeyDown|onPointerDownOutside/i, evidence: "dismiss control evidence was detected." },
    { signal: "heading", pattern: /PopoverHeading|HovercardHeading|aria-labelledby/i, evidence: "heading evidence was detected." },
    { signal: "description", pattern: /PopoverDescription|HovercardDescription|aria-describedby|role\s*=\s*["']tooltip/i, evidence: "description evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function popoverTooltipReadinessPositioningSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["positioningSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["positioningSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "use-floating", pattern: /useFloating/i, evidence: "useFloating evidence was detected." },
    { signal: "popper", pattern: /Popper|@radix-ui\/react-popper|Popover\.Content|Tooltip\.Content|HoverCard\.Content/i, evidence: "Popper/component positioning evidence was detected." },
    { signal: "side-offset", pattern: /sideOffset|gutter/i, evidence: "sideOffset/gutter evidence was detected." },
    { signal: "align", pattern: /align\s*=|align:|alignmentAxis/i, evidence: "align evidence was detected." },
    { signal: "placement", pattern: /placement\s*=|placement:|currentPlacement|side\s*=/i, evidence: "placement/side evidence was detected." },
    { signal: "offset", pattern: /offset\(|sideOffset|gutter/i, evidence: "offset evidence was detected." },
    { signal: "flip", pattern: /flip\(|flip\b/i, evidence: "flip evidence was detected." },
    { signal: "shift", pattern: /shift\(|shift\s*=|shift:|avoidCollisions/i, evidence: "shift/collision evidence was detected." },
    { signal: "arrow-middleware", pattern: /arrow\(|FloatingArrow|Popover\.Arrow|Tooltip\.Arrow|HoverCard\.Arrow|PopoverArrow|TooltipArrow|HovercardArrow/i, evidence: "arrow middleware/component evidence was detected." },
    { signal: "auto-update", pattern: /autoUpdate|whileElementsMounted/i, evidence: "autoUpdate evidence was detected." },
    { signal: "collision-boundary", pattern: /collisionBoundary|avoidCollisions|overflowPadding|detectOverflow|boundary/i, evidence: "collision boundary evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "positioning", "signal");
}

function popoverTooltipReadinessInteractionSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "click", pattern: /useClick|onClick|click|Popover\.Trigger|PopoverDisclosure/i, evidence: "click trigger evidence was detected." },
    { signal: "hover", pattern: /useHover|userEvent\.hover|hover|HoverCard|Hovercard|Tooltip/i, evidence: "hover evidence was detected." },
    { signal: "focus", pattern: /useFocus|focus|onOpenAutoFocus|onCloseAutoFocus|autoFocus/i, evidence: "focus interaction evidence was detected." },
    { signal: "safe-polygon", pattern: /safePolygon/i, evidence: "safePolygon evidence was detected." },
    { signal: "delay-duration", pattern: /delayDuration|openDelay|closeDelay|timeout|delay\s*:/i, evidence: "delay duration evidence was detected." },
    { signal: "open-prop", pattern: /open\s*=|open:/i, evidence: "open prop evidence was detected." },
    { signal: "on-open-change", pattern: /onOpenChange|onOpenChange:/i, evidence: "onOpenChange evidence was detected." },
    { signal: "controlled-state", pattern: /useState|setOpen|controlled|open\s*=|onOpenChange/i, evidence: "controlled state evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function popoverTooltipReadinessDismissalSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["dismissalSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["dismissalSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dismissable-layer", pattern: /DismissableLayer|Popover\.Content|Tooltip\.Content|HoverCard\.Content/i, evidence: "DismissableLayer/component dismissal evidence was detected." },
    { signal: "use-dismiss", pattern: /useDismiss/i, evidence: "useDismiss evidence was detected." },
    { signal: "escape-key", pattern: /escapeKey|Escape|\{Escape\}|onEscapeKeyDown|hideOnEscape/i, evidence: "Escape key evidence was detected." },
    { signal: "outside-click", pattern: /outsidePress|outside click|onPointerDownOutside|onInteractOutside|hideOnInteractOutside/i, evidence: "outside press/click evidence was detected." },
    { signal: "popover-dismiss", pattern: /Popover\.Close|PopoverClose|PopoverDismiss|HovercardDismiss/i, evidence: "popover dismiss evidence was detected." },
    { signal: "hide-on-escape", pattern: /hideOnEscape/i, evidence: "hideOnEscape evidence was detected." },
    { signal: "hide-on-interact-outside", pattern: /hideOnInteractOutside/i, evidence: "hideOnInteractOutside evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "dismissal", "signal");
}

function popoverTooltipReadinessFocusSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["focusSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["focusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focus-scope", pattern: /FocusScope|Popover\.Content|onOpenAutoFocus|onCloseAutoFocus/i, evidence: "FocusScope/component focus evidence was detected." },
    { signal: "floating-focus-manager", pattern: /FloatingFocusManager/i, evidence: "FloatingFocusManager evidence was detected." },
    { signal: "initial-focus", pattern: /initialFocus|onOpenAutoFocus|autoFocusOnShow/i, evidence: "initial focus evidence was detected." },
    { signal: "return-focus", pattern: /returnFocus|onCloseAutoFocus|autoFocusOnHide|finalFocus/i, evidence: "return/final focus evidence was detected." },
    { signal: "modal-focus", pattern: /modal\s*=|modal:|modal=\{false\}|modal=\{true\}/i, evidence: "modal focus evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tabindex|initialFocus=\{-?1\}|userEvent\.keyboard\(["']\{Tab\}/i, evidence: "tab index/tab flow evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "focus", "signal");
}

function popoverTooltipReadinessAccessibilitySignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-tooltip", pattern: /role\s*=\s*["']tooltip|role:\s*["']tooltip|getByRole\(["']tooltip/i, evidence: "tooltip role evidence was detected." },
    { signal: "role-dialog", pattern: /role\s*=\s*["']dialog|role:\s*["']dialog|getByRole\(["']dialog|Popover\.Content/i, evidence: "dialog role evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby|PopoverDescription|HovercardDescription/i, evidence: "aria-describedby evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby|PopoverHeading|HovercardHeading/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|getByLabelText/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "keyboard-navigation", pattern: /userEvent\.keyboard|fireEvent\.keyDown|Escape|\{Tab\}|keyboard/i, evidence: "keyboard navigation evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function popoverTooltipReadinessPortalSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["portalSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["portalSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "portal", pattern: /Popover\.Portal|Tooltip\.Portal|HoverCard\.Portal|Portal|portal\s*=|portal:/i, evidence: "portal evidence was detected." },
    { signal: "floating-portal", pattern: /FloatingPortal/i, evidence: "FloatingPortal evidence was detected." },
    { signal: "force-mount", pattern: /forceMount|force-mount/i, evidence: "forceMount evidence was detected." },
    { signal: "mounted-state", pattern: /mounted|forceMount|unmount|open &&|Presence/i, evidence: "mounted/open state evidence was detected." },
    { signal: "overlay", pattern: /FloatingOverlay|Overlay|overlay|lockScroll/i, evidence: "overlay evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "portal", "signal");
}

function popoverTooltipReadinessImplementationSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["implementationSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["implementationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "popover-machine", pattern: /usePopoverMachine|PopoverMachine|ActionTypes\.OpenPopover/i, evidence: "Headless UI Popover machine evidence was detected." },
    { signal: "machine-context", pattern: /PopoverContext|usePopoverMachineContext/i, evidence: "machine context evidence was detected." },
    { signal: "demo-mode-open", pattern: /__demoMode[\s\S]{0,220}PopoverStates\.Open|PopoverStates\.Open[\s\S]{0,220}__demoMode|__demoMode:\s*true/i, evidence: "demo mode open evidence was detected." },
    { signal: "stack-machine", pattern: /stackMachines|stackMachine\.actions|stack\.actions/i, evidence: "stack machine evidence was detected." },
    { signal: "action-open-close", pattern: /ActionTypes\.OpenPopover|ActionTypes\.ClosePopover|actions\.open|actions\.close/i, evidence: "open/close action evidence was detected." },
    { signal: "refocusable-close", pattern: /refocusableClose/i, evidence: "refocusable close evidence was detected." },
    { signal: "portalled-selector", pattern: /isPortalled|selectors\.isPortalled/i, evidence: "portalled selector evidence was detected." },
    { signal: "owner-document-focusables", pattern: /getOwnerDocument|getFocusableElements\(ownerDocument\)|ownerDocument\.querySelectorAll/i, evidence: "owner-document focusable heuristic evidence was detected." },
    { signal: "root-document", pattern: /useRootDocument|rootDocument/i, evidence: "root document evidence was detected." },
    { signal: "group-context", pattern: /PopoverGroupContext|usePopoverGroupContext|registerPopover|unregisterPopover/i, evidence: "popover group context evidence was detected." },
    { signal: "group-close-others", pattern: /closeOthers/i, evidence: "group close-others evidence was detected." },
    { signal: "nested-portals", pattern: /useNestedPortals|PortalWrapper/i, evidence: "nested portal evidence was detected." },
    { signal: "root-containers", pattern: /useRootContainers|root\.resolveContainers|root\.contains/i, evidence: "root container evidence was detected." },
    { signal: "main-tree-provider", pattern: /MainTreeProvider|useMainTreeNode/i, evidence: "main tree provider evidence was detected." },
    { signal: "close-provider", pattern: /CloseProvider/i, evidence: "close provider evidence was detected." },
    { signal: "open-closed-provider", pattern: /OpenClosedProvider|State\.Open|State\.Closed/i, evidence: "open/closed provider evidence was detected." },
    { signal: "focus-out-close", pattern: /focus[\s\S]{0,200}machine\.actions\.close|focus[\s\S]{0,200}ActionTypes\.ClosePopover/i, evidence: "focus-out close evidence was detected." },
    { signal: "outside-click-close", pattern: /useOutsideClick[\s\S]{0,240}actions\.close|outsideClickEnabled|outside click/i, evidence: "outside click close evidence was detected." },
    { signal: "outside-click-refocus", pattern: /isFocusableElement[\s\S]{0,180}button\?\.focus|button\?\.focus\(\)[\s\S]{0,180}isFocusableElement/i, evidence: "outside click refocus evidence was detected." },
    { signal: "floating-provider", pattern: /FloatingProvider/i, evidence: "floating provider evidence was detected." },
    { signal: "floating-reference", pattern: /useFloatingReference|buttonRef/i, evidence: "floating reference evidence was detected." },
    { signal: "button-unique-identifier", pattern: /uniqueIdentifier|Symbol\(\)/i, evidence: "button unique identifier evidence was detected." },
    { signal: "single-button-warning", pattern: /only 1 <Popover\.Button|console\.warn[\s\S]{0,120}Popover\.Button/i, evidence: "single button warning evidence was detected." },
    { signal: "within-panel-close-button", pattern: /isWithinPanel[\s\S]{0,200}actions\.close|PopoverPanelContext[\s\S]{0,200}Popover\.Button/i, evidence: "within-panel close button evidence was detected." },
    { signal: "keyboard-toggle", pattern: /Keys\.Space[\s\S]{0,240}actions\.open|Keys\.Enter[\s\S]{0,240}actions\.open|actions\.open[\s\S]{0,240}actions\.close/i, evidence: "keyboard toggle evidence was detected." },
    { signal: "keyboard-escape-close", pattern: /Keys\.Escape[\s\S]{0,220}actions\.close|Escape[\s\S]{0,220}ActionTypes\.ClosePopover/i, evidence: "keyboard Escape close evidence was detected." },
    { signal: "space-keyup-prevent-default", pattern: /Keys\.Space[\s\S]{0,140}preventDefault|preventDefault[\s\S]{0,140}Keys\.Space/i, evidence: "Space keyup preventDefault evidence was detected." },
    { signal: "active-press", pattern: /useActivePress/i, evidence: "active press evidence was detected." },
    { signal: "focus-ring", pattern: /useFocusRing|isFocusVisible/i, evidence: "focus ring evidence was detected." },
    { signal: "hover-state", pattern: /useHover|isHovered/i, evidence: "hover state evidence was detected." },
    { signal: "focus-guard-sentinels", pattern: /beforePanelSentinel|afterPanelSentinel|afterButtonSentinel/i, evidence: "focus guard sentinel evidence was detected." },
    { signal: "hidden-focus-sentinel", pattern: /HiddenFeatures\.Focusable|data-headlessui-focus-guard/i, evidence: "hidden focus sentinel evidence was detected." },
    { signal: "tab-direction", pattern: /useTabDirection|TabDirection/i, evidence: "tab direction evidence was detected." },
    { signal: "focus-in-panel", pattern: /focusIn\(.*Focus\.First|Focus\.First[\s\S]{0,160}focusIn/i, evidence: "focus-in panel evidence was detected." },
    { signal: "microtask-focus", pattern: /microTask/i, evidence: "microtask focus evidence was detected." },
    { signal: "backdrop-transition", pattern: /PopoverBackdrop|BackdropFn|useTransition[\s\S]{0,200}backdrop|backdropTransition/i, evidence: "backdrop transition evidence was detected." },
    { signal: "backdrop-aria-hidden", pattern: /aria-hidden["']?\s*[:=]\s*true|aria-hidden=["']true/i, evidence: "backdrop aria-hidden evidence was detected." },
    { signal: "panel-anchor", pattern: /useResolvedAnchor|anchor:\s*rawAnchor|anchor=/i, evidence: "panel anchor evidence was detected." },
    { signal: "floating-panel", pattern: /useFloatingPanel|useFloatingPanelProps|getFloatingPanelProps/i, evidence: "floating panel evidence was detected." },
    { signal: "portal-owner-document", pattern: /portalOwnerDocument|ownerDocument/i, evidence: "portal owner document evidence was detected." },
    { signal: "transition-data", pattern: /transitionDataAttributes|useTransition|data-enter|data-leave/i, evidence: "transition data evidence was detected." },
    { signal: "disappear-close", pattern: /useOnDisappear/i, evidence: "disappear close evidence was detected." },
    { signal: "scroll-lock-modal", pattern: /useScrollLock|scrollLockEnabled|modal && visible/i, evidence: "modal scroll lock evidence was detected." },
    { signal: "panel-unlink-on-unmount", pattern: /setPanel\(null\)|props\.unmount|props\.static/i, evidence: "panel unlink on unmount evidence was detected." },
    { signal: "panel-blur-close", pattern: /onBlur[\s\S]{0,220}actions\.close|relatedTarget[\s\S]{0,220}actions\.close/i, evidence: "panel blur close evidence was detected." },
    { signal: "reset-open-closed-provider", pattern: /ResetOpenClosedProvider/i, evidence: "reset open/closed provider evidence was detected." },
    { signal: "portal-enabled-visible-static", pattern: /enabled=\{portal \? props\.static \|\| visible : false\}|Portal[\s\S]{0,160}enabled=\{panelVisible\}|props\.static \|\| visible/i, evidence: "portal enabled visible/static evidence was detected." },
    { signal: "button-width-css-var", pattern: /--button-width|useElementSize/i, evidence: "button width CSS variable evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "implementation", "signal");
}

function popoverTooltipReadinessTestSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["testSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|@testing-library\/react|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "hover-test", pattern: /userEvent\.hover|hover\(/i, evidence: "hover test evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|fireEvent\.keyDown|Escape|\{Escape\}|\{Tab\}/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole\(["']tooltip|getByRole\(["']dialog|getByRole/i, evidence: "role test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|popover-tooltip-traces|trace|screenshot/i, evidence: "artifact upload evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function popoverTooltipReadinessPackageSignals(sourceFiles: PopoverTooltipReadinessSourceFile[]): PopoverTooltipReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PopoverTooltipReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-popover", pattern: /["@']@radix-ui\/react-popover["@']|from ["']@radix-ui\/react-popover["']/i, evidence: "@radix-ui/react-popover package evidence was detected." },
    { signal: "@radix-ui/react-tooltip", pattern: /["@']@radix-ui\/react-tooltip["@']|from ["']@radix-ui\/react-tooltip["']/i, evidence: "@radix-ui/react-tooltip package evidence was detected." },
    { signal: "@radix-ui/react-hover-card", pattern: /["@']@radix-ui\/react-hover-card["@']|from ["']@radix-ui\/react-hover-card["']/i, evidence: "@radix-ui/react-hover-card package evidence was detected." },
    { signal: "@headlessui/react", pattern: /["@']@headlessui\/react["@']|from ["']@headlessui\/react["']/i, evidence: "@headlessui/react package evidence was detected." },
    { signal: "@floating-ui/react", pattern: /["@']@floating-ui\/react["@']|from ["']@floating-ui\/react["']/i, evidence: "@floating-ui/react package evidence was detected." },
    { signal: "@floating-ui/react-dom", pattern: /["@']@floating-ui\/react-dom["@']|from ["']@floating-ui\/react-dom["']/i, evidence: "@floating-ui/react-dom package evidence was detected." },
    { signal: "@ariakit/react", pattern: /["@']@ariakit\/react["@']|from ["']@ariakit\/react["']/i, evidence: "@ariakit/react package evidence was detected." },
    { signal: "react", pattern: /["@']react["@']|from ["']react["']/i, evidence: "React package evidence was detected." }
  ];
  return popoverTooltipReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function popoverTooltipReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PopoverTooltipReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/popover-tooltip-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildMenuDropdownReadinessReport(walk: WalkResult): Promise<MenuDropdownReadinessReport> {
  const sourceFiles = await menuDropdownReadinessSourceFiles(walk);
  const menuDropdownSetups = menuDropdownReadinessSetups(sourceFiles);
  const frameworkSignals = menuDropdownReadinessFrameworkSignals(sourceFiles);
  const structureSignals = menuDropdownReadinessStructureSignals(sourceFiles);
  const selectionSignals = menuDropdownReadinessSelectionSignals(sourceFiles);
  const positioningSignals = menuDropdownReadinessPositioningSignals(sourceFiles);
  const interactionSignals = menuDropdownReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = menuDropdownReadinessAccessibilitySignals(sourceFiles);
  const stateSignals = menuDropdownReadinessStateSignals(sourceFiles);
  const implementationSignals = menuDropdownReadinessImplementationSignals(sourceFiles);
  const testSignals = menuDropdownReadinessTestSignals(sourceFiles);
  const packageSignals = menuDropdownReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || menuDropdownSetups.some((item) => item.triggerCount + item.contentCount + item.itemCount > 0);
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready") || menuDropdownSetups.some((item) => item.selectionCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || menuDropdownSetups.some((item) => item.interactionCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || menuDropdownSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || menuDropdownSetups.some((item) => item.testCount > 0);

  const riskQueue: MenuDropdownReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document menu, dropdown menu, context menu, menubar, listbox, combobox, or select boundaries before claiming menu readiness.",
      why: "Menu/dropdown readiness starts with concrete trigger, content, item, and selection evidence.",
      relatedHref: "html/menu-dropdown-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasSelection) {
    riskQueue.push({
      priority: "high",
      action: "Trace value, checked state, radio groups, selected options, multi-select, and on-change handlers.",
      why: "Menu and dropdown regressions often hide in selection ownership and mixed checkbox/radio/listbox semantics.",
      relatedHref: "html/menu-dropdown-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasInteraction) {
    riskQueue.push({
      priority: "high",
      action: "Record click, context-menu, hover, typeahead, roving focus, keyboard navigation, Escape, outside click, and Tab close behavior.",
      why: "Menu surfaces are keyboard-first interaction components, and pointer-only evidence is not enough.",
      relatedHref: "html/menu-dropdown-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Add roles and ARIA wiring for menu/menuitem/listbox/option, haspopup, expanded, controls, active descendant, labelledby, selected, and checked states.",
      why: "Menu/dropdown components commonly cross menu, disclosure, listbox, and combobox accessibility patterns.",
      relatedHref: "html/menu-dropdown-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for role discovery, pointer/context-menu open, keyboard navigation, typeahead, selection, Escape, Tab, and artifact capture.",
      why: "Menu/dropdown regressions often appear only across keyboard, pointer, and assistive role checks.",
      relatedHref: "html/menu-dropdown-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live menu and dropdown behavior in a trusted browser or original project tests outside RepoTutor.",
    why: "RepoTutor records menu/dropdown readiness only; it does not open menus, move roving focus, dispatch pointer/contextmenu/keyboard events, calculate floating position, select items, mutate form values, or run analyzed project tests.",
    relatedHref: "html/menu-dropdown-readiness.html"
  });

  return {
    summary: `Radix DropdownMenu/ContextMenu/Menubar/NavigationMenu, Headless UI Menu/Listbox/Combobox, and Ariakit Menu/Select/Combobox readiness report: setup ${menuDropdownSetups.length}개, framework signal ${frameworkSignals.length}개, implementation signal ${implementationSignals.length}개, selection signal ${selectionSignals.length}개, accessibility signal ${accessibilitySignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Menu/dropdown readiness Radix DropdownMenu ContextMenu Menubar NavigationMenu Headless UI Menu machine stack top layer floating typeahead Listbox Combobox Ariakit Menu Select Combobox keyboard selection accessibility tests",
    menuDropdownSetups,
    frameworkSignals,
    structureSignals,
    selectionSignals,
    positioningSignals,
    interactionSignals,
    accessibilitySignals,
    stateSignals,
    implementationSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-dropdown-menu|DropdownMenu.Root|DropdownMenu.Trigger|DropdownMenu.Content|DropdownMenu.Item|DropdownMenu.CheckboxItem|DropdownMenu.RadioGroup|DropdownMenu.Sub\" src app packages test", purpose: "Find Radix DropdownMenu roots, triggers, portal content, items, selection, and submenu surfaces." },
      { command: "rg \"@radix-ui/react-context-menu|ContextMenu.Root|ContextMenu.Trigger|onContextMenu|ContextMenu.Content|ContextMenu.Item\" src app packages test", purpose: "Find context menu trigger, virtual anchor, content, and contextmenu event evidence." },
      { command: "rg \"@radix-ui/react-menubar|Menubar.Root|Menubar.Menu|Menubar.Trigger|Menubar.Content|Menubar.Item|Menubar.RadioGroup\" src app packages test", purpose: "Find menubar root/menu/trigger/content/item/selection patterns." },
      { command: "rg \"@radix-ui/react-navigation-menu|NavigationMenu.Root|NavigationMenu.List|NavigationMenu.Trigger|NavigationMenu.Content|NavigationMenu.Viewport|NavigationMenu.Indicator\" src app packages test", purpose: "Find navigation menu list, trigger, content, viewport, and indicator wiring." },
      { command: "rg \"@headlessui/react|<Menu|MenuButton|MenuItems|MenuItem|useMenuMachine|MenuMachine|stackMachines|useOutsideClick|useQuickRelease|useInertOthers|useScrollLock|<Listbox|Listbox.Button|Listbox.Options|Listbox.Option|<Combobox|Combobox.Input|Combobox.Options|data-headlessui-state|aria-activedescendant\" src app packages test", purpose: "Find Headless UI menu, listbox, combobox, implementation internals, state, and active-descendant surfaces." },
      { command: "rg \"@ariakit/react|MenuProvider|useMenuStore|MenuButton|MenuItem|MenuItemCheckbox|MenuItemRadio|SelectProvider|SelectItem|ComboboxProvider|ComboboxItem|hideOnEscape|hideOnInteractOutside\" src app packages test", purpose: "Find Ariakit menu/select/combobox stores, buttons, items, selection, and dismissal wiring." },
      { command: "rg \"getByRole\\(['\\\"]menu|getByRole\\(['\\\"]menuitem|getByRole\\(['\\\"]listbox|getByRole\\(['\\\"]option|userEvent\\.keyboard|userEvent\\.pointer|onContextMenu|ArrowDown|Escape|Tab|aria-expanded|aria-selected|aria-checked\" src app packages test", purpose: "Review role, pointer, context-menu, keyboard, selection, and ARIA tests." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover menu/dropdown roles, keyboard navigation, pointer/context-menu opening, and selection behavior." }
    ],
    learnerNextSteps: [
      "먼저 Radix DropdownMenu/ContextMenu/Menubar/NavigationMenu, Headless UI Menu/Listbox/Combobox, Ariakit Menu/Select/Combobox, custom menu 중 어떤 boundary가 있는지 찾으세요.",
      "root, trigger button, portal, content, item, group, label, separator, checkbox/radio item, indicator, submenu, arrow, viewport 신호로 structure를 확인하세요.",
      "value, onValueChange, checked, onCheckedChange, radio group, selected, multiple 신호로 selection ownership을 분리하세요.",
      "side, align, sideOffset, collision boundary, Popper, anchor, viewport, floating panel 신호로 positioning contract를 추적하세요.",
      "click, context-menu, hover, typeahead, roving focus, keyboard navigation, Escape, outside click, Tab close 신호로 interaction policy를 확인하세요.",
      "role menu/menuitem/listbox/option, aria-haspopup, aria-expanded, aria-controls, aria-activedescendant, aria-labelledby, aria-selected, aria-checked 신호로 accessibility contract를 확인하세요.",
      "open/defaultOpen/onOpenChange, disabled, data-state, data-highlighted, data-disabled 신호로 state styling과 disabled path를 확인하세요.",
      "Headless UI Menu는 machine, stack top layer, outside click/refocus, floating/portal, scroll lock/inert, typeahead, item registration 같은 구현 신호를 따로 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 menu open, roving focus movement, pointer/contextmenu/keyboard dispatch, selection mutation, positioning은 안전한 테스트 환경에서 별도로 검증하세요."
    ]
  };
}

type MenuDropdownReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function menuDropdownReadinessSourceFiles(walk: WalkResult): Promise<MenuDropdownReadinessSourceFile[]> {
  const files: MenuDropdownReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !menuDropdownReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!menuDropdownReadinessPathSignal(file.relPath) && !menuDropdownReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function menuDropdownReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return menuDropdownReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function menuDropdownReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(menu|menus|dropdown|dropdowns|context[-_ ]?menu|menubar|navigation[-_ ]?menu|listbox|combobox|select|command|palette|overlay|portal|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function menuDropdownReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-dropdown-menu|@radix-ui\/react-context-menu|@radix-ui\/react-menubar|@radix-ui\/react-navigation-menu|DropdownMenu\.Root|DropdownMenu\.Trigger|ContextMenu\.Root|ContextMenu\.Trigger|Menubar\.Root|NavigationMenu\.Root|@headlessui\/react|MenuButton|MenuItems|MenuItem|useMenuMachine|MenuMachine|ActionTypes\.OpenMenu|stackMachines|useQuickRelease|useInertOthers|useScrollLock|Listbox\.Button|Combobox\.Input|@ariakit\/react|MenuProvider|useMenuStore|SelectProvider|ComboboxProvider|role\s*=\s*["']menu|role\s*=\s*["']listbox|aria-haspopup|aria-activedescendant)/i.test(text);
}

function menuDropdownReadinessSetups(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["menuDropdownSetups"] {
  const rows: MenuDropdownReadinessReport["menuDropdownSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /(DropdownMenu\.Trigger|ContextMenu\.Trigger|Menubar\.Trigger|NavigationMenu\.Trigger|MenuButton|Menu\.Button|Listbox\.Button|Combobox\.Button|MenuButtonArrow|MenuButton|refs\.setReference|aria-haspopup|aria-expanded|onContextMenu)/gi);
    const contentCount = countMatches(source.text, /(DropdownMenu\.Content|ContextMenu\.Content|Menubar\.Content|NavigationMenu\.Content|MenuItems|Menu\.Items|Listbox\.Options|Combobox\.Options|Menu\b|Select\b|MenuProvider|SelectProvider|ComboboxProvider|portal|Portal|Viewport|floating|anchor=)/gi);
    const itemCount = countMatches(source.text, /(DropdownMenu\.Item|ContextMenu\.Item|Menubar\.Item|NavigationMenu\.Link|MenuItem|Menu\.Item|Listbox\.Option|Combobox\.Option|MenuItemCheckbox|MenuItemRadio|SelectItem|ComboboxItem|role\s*=\s*["']menuitem|role\s*=\s*["']option)/gi);
    const selectionCount = countMatches(source.text, /(value\s*=|defaultValue|onValueChange|onChange|checked\s*=|defaultChecked|onCheckedChange|RadioGroup|RadioItem|CheckboxItem|ItemIndicator|selected|aria-selected|aria-checked|multiple|SelectItemCheck)/gi);
    const positioningCount = countMatches(source.text, /(side\s*=|side:|align\s*=|align:|sideOffset|collisionBoundary|avoidCollisions|Popper|Anchor|anchor\s*=|placement|gutter|shift|flip|Viewport|Floating|floating-panel|MenuArrow|DropdownMenu\.Arrow|ContextMenu\.Arrow)/gi);
    const interactionCount = countMatches(source.text, /(onClick|userEvent\.click|onContextMenu|contextmenu|userEvent\.pointer|onPointer|onMouse|hover|typeahead|RovingFocusGroup|roving|ArrowDown|ArrowUp|Home|End|keyboard|userEvent\.keyboard|Escape|outside|hideOnEscape|hideOnInteractOutside|Tab|close\(\))/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']menu|role\s*=\s*["']menuitem|role\s*=\s*["']listbox|role\s*=\s*["']option|aria-haspopup|aria-expanded|aria-controls|aria-activedescendant|aria-labelledby|aria-selected|aria-checked|getByRole)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.keyboard|userEvent\.pointer|getByRole|menu-dropdown-traces|upload-artifact)/gi);
    const total = triggerCount + contentCount + itemCount + selectionCount + positioningCount + interactionCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = triggerCount > 0 && contentCount > 0 && itemCount > 0 && selectionCount > 0 && interactionCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: menuDropdownReadinessFramework(source),
      triggerCount,
      contentCount,
      itemCount,
      selectionCount,
      positioningCount,
      interactionCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `trigger ${triggerCount}, content ${contentCount}, item ${itemCount}, selection ${selectionCount}, positioning ${positioningCount}, interaction ${interactionCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.triggerCount + b.contentCount + b.itemCount + b.selectionCount + b.accessibilityCount - (a.triggerCount + a.contentCount + a.itemCount + a.selectionCount + a.accessibilityCount));
}

function menuDropdownReadinessFramework(source: MenuDropdownReadinessSourceFile): MenuDropdownReadinessReport["menuDropdownSetups"][number]["framework"] {
  if (/@radix-ui\/react-dropdown-menu|DropdownMenu\.Root|DropdownMenu\.Trigger|DropdownMenu\.Content/i.test(source.text)) return "radix-dropdown-menu";
  if (/@radix-ui\/react-context-menu|ContextMenu\.Root|ContextMenu\.Trigger|ContextMenu\.Content/i.test(source.text)) return "radix-context-menu";
  if (/@radix-ui\/react-menubar|Menubar\.Root|Menubar\.Menu|Menubar\.Trigger/i.test(source.text)) return "radix-menubar";
  if (/@radix-ui\/react-navigation-menu|NavigationMenu\.Root|NavigationMenu\.List|NavigationMenu\.Trigger/i.test(source.text)) return "radix-navigation-menu";
  if (/@ariakit\/react|MenuProvider|useMenuStore|MenuItemCheckbox|MenuItemRadio/i.test(source.text)) return "ariakit-menu";
  if (/SelectProvider|useSelectStore|SelectItem|SelectItemCheck/i.test(source.text)) return "ariakit-select";
  if (/ComboboxProvider|useComboboxStore|ComboboxItem/i.test(source.text)) return "ariakit-combobox";
  if (/@headlessui\/react|<Menu\b|MenuButton|MenuItems|MenuItem/i.test(source.text)) return "headless-menu";
  if (/Listbox\.Button|Listbox\.Options|Listbox\.Option|<Listbox\b/i.test(source.text)) return "headless-listbox";
  if (/Combobox\.Input|Combobox\.Options|Combobox\.Option|<Combobox\b/i.test(source.text)) return "headless-combobox";
  if (/menu|dropdown|listbox|combobox|aria-haspopup/i.test(source.filePath) || /role\s*=\s*["']menu/i.test(source.text)) return "custom";
  return "unknown";
}

function menuDropdownReadinessFrameworkSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-dropdown-menu", pattern: /@radix-ui\/react-dropdown-menu|DropdownMenu\.Root|DropdownMenu\.Trigger|DropdownMenu\.Content/i, evidence: "Radix DropdownMenu evidence was detected." },
    { signal: "radix-context-menu", pattern: /@radix-ui\/react-context-menu|ContextMenu\.Root|ContextMenu\.Trigger|ContextMenu\.Content|onContextMenu/i, evidence: "Radix ContextMenu evidence was detected." },
    { signal: "radix-menubar", pattern: /@radix-ui\/react-menubar|Menubar\.Root|Menubar\.Menu|Menubar\.Trigger|Menubar\.Content/i, evidence: "Radix Menubar evidence was detected." },
    { signal: "radix-navigation-menu", pattern: /@radix-ui\/react-navigation-menu|NavigationMenu\.Root|NavigationMenu\.List|NavigationMenu\.Trigger|NavigationMenu\.Viewport/i, evidence: "Radix NavigationMenu evidence was detected." },
    { signal: "headless-menu", pattern: /@headlessui\/react|<Menu\b|MenuButton|MenuItems|MenuItem/i, evidence: "Headless UI Menu evidence was detected." },
    { signal: "headless-listbox", pattern: /Listbox\.Button|Listbox\.Options|Listbox\.Option|<Listbox\b/i, evidence: "Headless UI Listbox evidence was detected." },
    { signal: "headless-combobox", pattern: /Combobox\.Input|Combobox\.Options|Combobox\.Option|<Combobox\b/i, evidence: "Headless UI Combobox evidence was detected." },
    { signal: "ariakit-menu", pattern: /MenuProvider|useMenuStore|MenuButton|MenuItemCheckbox|MenuItemRadio/i, evidence: "Ariakit Menu evidence was detected." },
    { signal: "ariakit-select", pattern: /SelectProvider|useSelectStore|SelectItem|SelectItemCheck/i, evidence: "Ariakit Select evidence was detected." },
    { signal: "ariakit-combobox", pattern: /ComboboxProvider|useComboboxStore|ComboboxItem/i, evidence: "Ariakit Combobox evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']menu|role\s*=\s*["']listbox|aria-haspopup/i, evidence: "custom menu/dropdown evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function menuDropdownReadinessStructureSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["structureSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /DropdownMenu\.Root|ContextMenu\.Root|Menubar\.Root|NavigationMenu\.Root|<Menu\b|<Listbox\b|<Combobox\b|MenuProvider|SelectProvider|ComboboxProvider/i, evidence: "root/provider evidence was detected." },
    { signal: "trigger-button", pattern: /Trigger|MenuButton|Listbox\.Button|Combobox\.Button|MenuButtonArrow|aria-haspopup/i, evidence: "trigger/button evidence was detected." },
    { signal: "portal", pattern: /Portal|portal\s*=|forceMount/i, evidence: "portal evidence was detected." },
    { signal: "content", pattern: /Content|MenuItems|Listbox\.Options|Combobox\.Options|Menu\b|Select\b/i, evidence: "content/options evidence was detected." },
    { signal: "item", pattern: /Item|Option|NavigationMenu\.Link|role\s*=\s*["']menuitem|role\s*=\s*["']option/i, evidence: "item/option evidence was detected." },
    { signal: "group", pattern: /Group|RadioGroup/i, evidence: "group evidence was detected." },
    { signal: "label", pattern: /Label|Heading|aria-labelledby/i, evidence: "label/heading evidence was detected." },
    { signal: "separator", pattern: /Separator/i, evidence: "separator evidence was detected." },
    { signal: "checkbox-item", pattern: /CheckboxItem|MenuItemCheckbox/i, evidence: "checkbox item evidence was detected." },
    { signal: "radio-item", pattern: /RadioItem|MenuItemRadio|RadioGroup/i, evidence: "radio item evidence was detected." },
    { signal: "indicator", pattern: /ItemIndicator|Indicator|SelectItemCheck/i, evidence: "indicator evidence was detected." },
    { signal: "submenu", pattern: /SubTrigger|SubContent|Sub\b/i, evidence: "submenu evidence was detected." },
    { signal: "arrow", pattern: /Arrow|MenuArrow/i, evidence: "arrow evidence was detected." },
    { signal: "viewport", pattern: /Viewport|viewport/i, evidence: "viewport evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function menuDropdownReadinessSelectionSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-prop", pattern: /value\s*=|defaultValue|value:/i, evidence: "value prop evidence was detected." },
    { signal: "on-value-change", pattern: /onValueChange|onChange|setValue/i, evidence: "value change evidence was detected." },
    { signal: "checked-state", pattern: /checked\s*=|defaultChecked|checked:/i, evidence: "checked state evidence was detected." },
    { signal: "on-checked-change", pattern: /onCheckedChange|setChecked/i, evidence: "checked change evidence was detected." },
    { signal: "radio-group", pattern: /RadioGroup|RadioItem|MenuItemRadio/i, evidence: "radio group evidence was detected." },
    { signal: "selected-state", pattern: /selected|aria-selected|activeOption|displayValue/i, evidence: "selected state evidence was detected." },
    { signal: "multiple-selection", pattern: /multiple|aria-multiselectable/i, evidence: "multiple selection evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function menuDropdownReadinessPositioningSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["positioningSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["positioningSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "side", pattern: /side\s*=|side:/i, evidence: "side evidence was detected." },
    { signal: "align", pattern: /align\s*=|align:/i, evidence: "align evidence was detected." },
    { signal: "side-offset", pattern: /sideOffset|gutter/i, evidence: "side offset/gutter evidence was detected." },
    { signal: "collision-boundary", pattern: /collisionBoundary|avoidCollisions|collisionPadding/i, evidence: "collision boundary evidence was detected." },
    { signal: "popper", pattern: /Popper|@radix-ui\/react-popper|@radix-ui\/react-dropdown-menu|@radix-ui\/react-context-menu|@radix-ui\/react-menubar|sideOffset/i, evidence: "Popper-style positioning evidence was detected." },
    { signal: "anchor", pattern: /Anchor|anchor\s*=|virtualRef/i, evidence: "anchor evidence was detected." },
    { signal: "viewport", pattern: /Viewport|viewport/i, evidence: "viewport evidence was detected." },
    { signal: "floating-panel", pattern: /anchor=["']bottom|anchor=["']top|placement|shift|flip|Floating|floating/i, evidence: "floating panel evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "positioning", "signal");
}

function menuDropdownReadinessInteractionSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "click", pattern: /onClick|userEvent\.click|click\(/i, evidence: "click evidence was detected." },
    { signal: "context-menu", pattern: /onContextMenu|contextmenu|ContextMenu|MouseRight/i, evidence: "context menu evidence was detected." },
    { signal: "hover", pattern: /hover|onMouseEnter|onPointerMove|Menubar\.Trigger|NavigationMenu\.Trigger|SubTrigger/i, evidence: "hover/open-on-pointer evidence was detected." },
    { signal: "typeahead", pattern: /typeahead|Typeahead|search|displayValue|activeOption/i, evidence: "typeahead/search evidence was detected." },
    { signal: "roving-focus", pattern: /RovingFocusGroup|roving|Composite|aria-activedescendant/i, evidence: "roving focus evidence was detected." },
    { signal: "keyboard-navigation", pattern: /ArrowDown|ArrowUp|ArrowLeft|ArrowRight|Home|End|userEvent\.keyboard|keyboard/i, evidence: "keyboard navigation evidence was detected." },
    { signal: "escape-key", pattern: /Escape|hideOnEscape|escapeKey/i, evidence: "Escape evidence was detected." },
    { signal: "outside-click", pattern: /outside|InteractOutside|hideOnInteractOutside|onPointerDownOutside/i, evidence: "outside click evidence was detected." },
    { signal: "tab-close", pattern: /Tab|tab key|shift\+tab/i, evidence: "Tab close evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function menuDropdownReadinessAccessibilitySignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-menu", pattern: /role\s*=\s*["']menu["']|getByRole\(["']menu/i, evidence: "menu role evidence was detected." },
    { signal: "role-menuitem", pattern: /role\s*=\s*["']menuitem|menuitemcheckbox|menuitemradio|getByRole\(["']menuitem/i, evidence: "menuitem role evidence was detected." },
    { signal: "role-listbox", pattern: /role\s*=\s*["']listbox|getByRole\(["']listbox/i, evidence: "listbox role evidence was detected." },
    { signal: "role-option", pattern: /role\s*=\s*["']option|getByRole\(["']option/i, evidence: "option role evidence was detected." },
    { signal: "aria-haspopup", pattern: /aria-haspopup/i, evidence: "aria-haspopup evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-activedescendant", pattern: /aria-activedescendant/i, evidence: "aria-activedescendant evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected/i, evidence: "aria-selected evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked/i, evidence: "aria-checked evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function menuDropdownReadinessStateSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["stateSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-prop", pattern: /open\s*=|open:/i, evidence: "open prop evidence was detected." },
    { signal: "default-open", pattern: /defaultOpen/i, evidence: "default open evidence was detected." },
    { signal: "on-open-change", pattern: /onOpenChange|setOpen/i, evidence: "open change evidence was detected." },
    { signal: "disabled", pattern: /disabled\s*=|disabled:|disabled\b/i, evidence: "disabled evidence was detected." },
    { signal: "data-state", pattern: /data-state|data-headlessui-state/i, evidence: "data state evidence was detected." },
    { signal: "data-highlighted", pattern: /data-highlighted|active/i, evidence: "data highlighted/active evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled|disabled/i, evidence: "data disabled evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function menuDropdownReadinessImplementationSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["implementationSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["implementationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "menu-machine", pattern: /useMenuMachine|MenuMachine|ActionTypes\.OpenMenu/i, evidence: "Headless UI Menu machine evidence was detected." },
    { signal: "machine-context", pattern: /MenuContext|useMenuMachineContext/i, evidence: "machine context evidence was detected." },
    { signal: "stack-machine", pattern: /stackMachines|StackActionTypes\.Push|stackMachine\.actions/i, evidence: "stack machine evidence was detected." },
    { signal: "top-layer", pattern: /selectors\.isTop|isTop\(/i, evidence: "top-layer guard evidence was detected." },
    { signal: "outside-click-close", pattern: /useOutsideClick|outside click|OutsideClick|InteractOutside/i, evidence: "outside click close evidence was detected." },
    { signal: "button-refocus", pattern: /buttonElement\?\.focus|buttonElement\.focus|focusElement\(.*button|restoreFocusIfNecessary\(.*buttonElement|focusFrom/i, evidence: "button refocus evidence was detected." },
    { signal: "floating-provider", pattern: /FloatingProvider|useFloatingProvider|useFloatingReference/i, evidence: "floating provider evidence was detected." },
    { signal: "open-closed-provider", pattern: /OpenClosedProvider|State\.Open|State\.Closed/i, evidence: "open/closed provider evidence was detected." },
    { signal: "button-floating-reference", pattern: /useFloatingReference|useFloatingReferenceProps|refs\.setReference/i, evidence: "button floating reference evidence was detected." },
    { signal: "button-keyboard-open", pattern: /Keys\.Space|Keys\.Enter|Keys\.ArrowDown|Keys\.ArrowUp/i, evidence: "button keyboard open evidence was detected." },
    { signal: "space-keyup-prevent-default", pattern: /Keys\.Space[\s\S]{0,140}preventDefault|preventDefault[\s\S]{0,140}Keys\.Space/i, evidence: "Space key preventDefault evidence was detected." },
    { signal: "quick-release", pattern: /useQuickRelease/i, evidence: "quick release evidence was detected." },
    { signal: "handle-toggle", pattern: /useHandleToggle/i, evidence: "handle toggle evidence was detected." },
    { signal: "pointer-open-trigger", pattern: /ActivationTrigger\.Pointer|trigger:\s*ActivationTrigger\.Pointer/i, evidence: "pointer activation trigger evidence was detected." },
    { signal: "active-press", pattern: /useActivePress/i, evidence: "active press evidence was detected." },
    { signal: "button-aria-haspopup-menu", pattern: /aria-haspopup["']?\s*[:=]\s*["']menu|aria-haspopup[\s\S]{0,80}menu/i, evidence: "button aria-haspopup menu evidence was detected." },
    { signal: "button-aria-controls", pattern: /aria-controls/i, evidence: "button aria-controls evidence was detected." },
    { signal: "button-aria-expanded", pattern: /aria-expanded/i, evidence: "button aria-expanded evidence was detected." },
    { signal: "items-anchor", pattern: /anchor\s*=|anchor\??:|anchor;/i, evidence: "items anchor evidence was detected." },
    { signal: "items-floating-panel", pattern: /useFloatingPanel|useFloatingPanelProps|FloatingPanel/i, evidence: "items floating panel evidence was detected." },
    { signal: "portal-owner-document", pattern: /portalOwnerDocument|ownerDocument/i, evidence: "portal owner document evidence was detected." },
    { signal: "transition-data", pattern: /transitionDataAttributes|useTransition|data-enter|data-leave/i, evidence: "transition data evidence was detected." },
    { signal: "disappear-close", pattern: /useOnDisappear/i, evidence: "disappear close evidence was detected." },
    { signal: "scroll-lock", pattern: /useScrollLock/i, evidence: "scroll lock evidence was detected." },
    { signal: "inert-others", pattern: /useInertOthers/i, evidence: "inert others evidence was detected." },
    { signal: "button-movement-cancel-transition", pattern: /didButtonMove|MarkButtonAsMoved|detectMovement/i, evidence: "button movement cancel transition evidence was detected." },
    { signal: "items-focus-on-open", pattern: /itemsElement\?\.focus|itemsElement\.focus|focusElement\(.*itemsElement|Focus\.First/i, evidence: "items focus-on-open evidence was detected." },
    { signal: "items-tree-walker-role-none", pattern: /useTreeWalker|role["']?\s*[:=]\s*["']none|tree walker/i, evidence: "tree walker role none evidence was detected." },
    { signal: "items-role-menu", pattern: /role["']?\s*[:=]\s*["']menu|role\s*=\s*["']menu/i, evidence: "items role menu evidence was detected." },
    { signal: "items-open-tab-index", pattern: /tabIndex["']?\s*[:=]\s*0|tabIndex[\s\S]{0,140}State\.Open|tabIndex[\s\S]{0,140}MenuState\.Open/i, evidence: "open menu tab index evidence was detected." },
    { signal: "items-active-descendant", pattern: /activeDescendantId|aria-activedescendant/i, evidence: "active descendant evidence was detected." },
    { signal: "typeahead-search", pattern: /ActionTypes\.Search|searchQuery|typeahead/i, evidence: "typeahead search evidence was detected." },
    { signal: "search-timeout", pattern: /ClearSearch|setTimeout[\s\S]{0,80}350|350[\s\S]{0,80}ClearSearch/i, evidence: "search timeout evidence was detected." },
    { signal: "enter-click-active", pattern: /Keys\.Enter[\s\S]{0,240}click\(|click\(\)[\s\S]{0,240}ActionTypes\.CloseMenu/i, evidence: "Enter click active item evidence was detected." },
    { signal: "restore-focus", pattern: /restoreFocusIfNecessary|focusFrom|focusElement/i, evidence: "restore focus evidence was detected." },
    { signal: "focus-next-prev", pattern: /Focus\.Next|Focus\.Previous/i, evidence: "next/previous focus evidence was detected." },
    { signal: "focus-first-last", pattern: /Focus\.First|Focus\.Last/i, evidence: "first/last focus evidence was detected." },
    { signal: "escape-close", pattern: /Keys\.Escape[\s\S]{0,180}CloseMenu|Escape[\s\S]{0,180}CloseMenu/i, evidence: "Escape close evidence was detected." },
    { signal: "tab-close-focus-next", pattern: /Keys\.Tab[\s\S]{0,220}CloseMenu|Tab[\s\S]{0,220}focusFrom/i, evidence: "Tab close/focus next evidence was detected." },
    { signal: "register-items", pattern: /registerItem|ActionTypes\.RegisterItems/i, evidence: "item registration evidence was detected." },
    { signal: "unregister-items", pattern: /unregisterItem|ActionTypes\.UnregisterItems/i, evidence: "item unregistration evidence was detected." },
    { signal: "sort-items", pattern: /SortItems|sortByDomNode|sort.*items/i, evidence: "item sorting evidence was detected." },
    { signal: "scroll-into-view", pattern: /scrollIntoView/i, evidence: "scroll into view evidence was detected." },
    { signal: "text-value", pattern: /useTextValue|textValue/i, evidence: "text value evidence was detected." },
    { signal: "pointer-tracking", pattern: /useTrackedPointer|pointer\.wasMoved|pointer\.update/i, evidence: "pointer tracking evidence was detected." },
    { signal: "disabled-focus-nothing", pattern: /disabled[\s\S]{0,120}Focus\.Nothing|Focus\.Nothing[\s\S]{0,120}disabled/i, evidence: "disabled focus nothing evidence was detected." },
    { signal: "item-role-menuitem", pattern: /role["']?\s*[:=]\s*["']menuitem|role\s*=\s*["']menuitem/i, evidence: "item role menuitem evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria-disabled evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "implementation", "signal");
}

function menuDropdownReadinessTestSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["testSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|@testing-library\/react|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|fireEvent\.keyDown|ArrowDown|Escape|\{Escape\}|\{Tab\}/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole\(["']menu|getByRole\(["']menuitem|getByRole\(["']listbox|getByRole\(["']option|getByRole/i, evidence: "role test evidence was detected." },
    { signal: "pointer-test", pattern: /userEvent\.pointer|MouseRight|contextmenu|userEvent\.click/i, evidence: "pointer/contextmenu test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|menu-dropdown-traces|trace|screenshot/i, evidence: "artifact upload evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function menuDropdownReadinessPackageSignals(sourceFiles: MenuDropdownReadinessSourceFile[]): MenuDropdownReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MenuDropdownReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-dropdown-menu", pattern: /["@']@radix-ui\/react-dropdown-menu["@']|from ["']@radix-ui\/react-dropdown-menu["']/i, evidence: "@radix-ui/react-dropdown-menu package evidence was detected." },
    { signal: "@radix-ui/react-context-menu", pattern: /["@']@radix-ui\/react-context-menu["@']|from ["']@radix-ui\/react-context-menu["']/i, evidence: "@radix-ui/react-context-menu package evidence was detected." },
    { signal: "@radix-ui/react-menubar", pattern: /["@']@radix-ui\/react-menubar["@']|from ["']@radix-ui\/react-menubar["']/i, evidence: "@radix-ui/react-menubar package evidence was detected." },
    { signal: "@radix-ui/react-navigation-menu", pattern: /["@']@radix-ui\/react-navigation-menu["@']|from ["']@radix-ui\/react-navigation-menu["']/i, evidence: "@radix-ui/react-navigation-menu package evidence was detected." },
    { signal: "@headlessui/react", pattern: /["@']@headlessui\/react["@']|from ["']@headlessui\/react["']/i, evidence: "@headlessui/react package evidence was detected." },
    { signal: "@ariakit/react", pattern: /["@']@ariakit\/react["@']|from ["']@ariakit\/react["']/i, evidence: "@ariakit/react package evidence was detected." },
    { signal: "react", pattern: /["@']react["@']|from ["']react["']/i, evidence: "React package evidence was detected." }
  ];
  return menuDropdownReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function menuDropdownReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: MenuDropdownReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/menu-dropdown-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildToastSnackbarReadinessReport(walk: WalkResult): Promise<ToastSnackbarReadinessReport> {
  const sourceFiles = await toastSnackbarReadinessSourceFiles(walk);
  const toastSnackbarSetups = toastSnackbarReadinessSetups(sourceFiles);
  const frameworkSignals = toastSnackbarReadinessFrameworkSignals(sourceFiles);
  const structureSignals = toastSnackbarReadinessStructureSignals(sourceFiles);
  const variantSignals = toastSnackbarReadinessVariantSignals(sourceFiles);
  const lifecycleSignals = toastSnackbarReadinessLifecycleSignals(sourceFiles);
  const interactionSignals = toastSnackbarReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = toastSnackbarReadinessAccessibilitySignals(sourceFiles);
  const stylingSignals = toastSnackbarReadinessStylingSignals(sourceFiles);
  const machineSignals = toastSnackbarReadinessMachineSignals(sourceFiles);
  const storeSignals = toastSnackbarReadinessStoreSignals(sourceFiles);
  const groupSignals = toastSnackbarReadinessGroupSignals(sourceFiles);
  const apiSignals = toastSnackbarReadinessApiSignals(sourceFiles);
  const testSignals = toastSnackbarReadinessTestSignals(sourceFiles);
  const packageSignals = toastSnackbarReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || toastSnackbarSetups.some((item) => item.providerCount + item.toastCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready") || toastSnackbarSetups.some((item) => item.lifecycleCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || toastSnackbarSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || toastSnackbarSetups.some((item) => item.testCount > 0);

  const riskQueue: ToastSnackbarReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a toast/snackbar provider, toaster, viewport, root, or enqueue boundary before claiming transient feedback readiness.",
      why: "Toast/snackbar readiness starts with concrete provider and transient item evidence.",
      relatedHref: "html/toast-snackbar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasLifecycle) {
    riskQueue.push({
      priority: "high",
      action: "Trace open state, duration, auto-dismiss, dismiss/remove, pause/resume, queue limits, duplicate prevention, and persistent snackbar behavior.",
      why: "Toast and snackbar regressions often hide in timer ownership, queue eviction, and programmatic dismissal.",
      relatedHref: "html/toast-snackbar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Add role/status, aria-live, aria-atomic, viewport labels, action alt text, close labels, and focus-visible evidence.",
      why: "Transient feedback must be announced without stealing focus or hiding action controls from assistive technology.",
      relatedHref: "html/toast-snackbar-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for timers, role announcements, close/action controls, swipe or click-away behavior, and trace artifacts.",
      why: "Toast/snackbar regressions require fake timers and interaction tests because messages are intentionally transient.",
      relatedHref: "html/toast-snackbar-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live toast/snackbar behavior in the trusted app or original project tests outside RepoTutor.",
    why: "RepoTutor records toast/snackbar readiness only; it does not display notifications, advance real timers, dispatch swipe/click-away/keyboard events, announce live regions, mutate queues, or run analyzed project tests.",
    relatedHref: "html/toast-snackbar-readiness.html"
  });

  return {
    summary: `Radix Toast, Sonner, React Hot Toast, Notistack, MUI Snackbar, and Zag Toast readiness report: setup ${toastSnackbarSetups.length}개, framework signal ${frameworkSignals.length}개, lifecycle signal ${lifecycleSignals.length}개, machine signal ${machineSignals.length}개, store signal ${storeSignals.length}개, accessibility signal ${accessibilitySignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Toast/snackbar readiness Radix Toast Sonner React Hot Toast Notistack Zag toast provider viewport lifecycle action close accessibility timer swipe queue live region machine store group API tests",
    toastSnackbarSetups,
    frameworkSignals,
    structureSignals,
    variantSignals,
    lifecycleSignals,
    interactionSignals,
    accessibilitySignals,
    stylingSignals,
    machineSignals,
    storeSignals,
    groupSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-toast|Toast.Provider|Toast.Viewport|Toast.Root|Toast.Title|Toast.Description|Toast.Action|Toast.Close|onSwipe|duration|hotkey\" src app packages test", purpose: "Find Radix Toast provider, viewport, root, content, action, close, timer, keyboard, and swipe wiring." },
      { command: "rg \"sonner|<Toaster|toast.success|toast.error|toast.loading|toast.promise|toast.custom|toast.dismiss|richColors|closeButton|visibleToasts\" src app packages test", purpose: "Find Sonner toaster, variants, promise, action, close, visible count, rich color, and dismissal evidence." },
      { command: "rg \"react-hot-toast|<Toaster|ToastBar|toast.success|toast.error|toast.loading|toast.promise|toast.dismiss|toast.remove|ariaProps|reverseOrder|gutter\" src app packages test", purpose: "Find React Hot Toast toaster, toast bar, promise lifecycle, dismissal, ARIA props, and stack layout evidence." },
      { command: "rg \"notistack|SnackbarProvider|enqueueSnackbar|closeSnackbar|SnackbarContent|maxSnack|preventDuplicate|autoHideDuration|anchorOrigin|persist|variant|action\" src app packages test", purpose: "Find Notistack provider, enqueue/close calls, queue limit, duplicate prevention, auto-hide, anchor, persistence, variants, and actions." },
      { command: "rg \"@zag-js/toast|createToastStore|groupMachine|groupConnect|setRafTimeout|MutationObserver|trackDismissableBranch|REGION\\.POINTER|DOC\\.HOTKEY|getRootProps|getGroupProps\" src app packages test", purpose: "Find Zag toast store, group machine, timer, height measurement, dismissable branch, region, hotkey, and API prop evidence." },
      { command: "rg \"vi\\.useFakeTimers|advanceTimersByTime|getByRole\\(['\\\"]status|getByRole\\(['\\\"]region|getByLabelText|userEvent\\.click|userEvent\\.keyboard|swipe|upload-artifact\" src app packages test .github", purpose: "Review timer, role, close/action, keyboard/swipe, and artifact tests for transient notifications." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover toast/snackbar timers, live-region announcements, close/action controls, queue behavior, and trace artifacts." }
    ],
    learnerNextSteps: [
      "먼저 Radix Toast, Sonner, React Hot Toast, Notistack, MUI Snackbar, custom toast 중 어떤 boundary가 있는지 찾으세요.",
      "provider, toaster, viewport, root, title, description, action, close, icon, portal/container 신호로 structure를 확인하세요.",
      "success, error, warning, info, loading, promise, custom, rich-colors 신호로 variant와 async feedback contract를 분리하세요.",
      "open state, duration, auto-dismiss, dismiss/remove, pause/resume, queue limit, prevent duplicate, persist 신호로 lifecycle ownership을 확인하세요.",
      "swipe, keyboard shortcut, Escape, click-away, action button, close button, hover pause 신호로 interaction policy를 확인하세요.",
      "role status, aria-live, aria-atomic, region label, alt text, close label, focus-visible 신호로 accessibility contract를 확인하세요.",
      "position, offset/gutter, transition, swipe direction, theme, unstyled, class names, data-state 신호로 styling and motion contract를 확인하세요.",
      "Zag toast라면 machine, store, group, API 신호로 timer, queue priority, promise unwrap, hotkey focus, dismissable branch, live-region, and data attribute contract를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 toast display, timer advance, swipe/click-away dispatch, live-region announcement, queue mutation은 안전한 테스트 환경에서 별도로 검증하세요."
    ]
  };
}

type ToastSnackbarReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function toastSnackbarReadinessSourceFiles(walk: WalkResult): Promise<ToastSnackbarReadinessSourceFile[]> {
  const files: ToastSnackbarReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !toastSnackbarReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!toastSnackbarReadinessPathSignal(file.relPath) && !toastSnackbarReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function toastSnackbarReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return toastSnackbarReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function toastSnackbarReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(toast|toasts|toaster|snackbar|snackbars|notification|notifications|feedback|alert|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function toastSnackbarReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-toast|Toast\.Provider|Toast\.Viewport|Toast\.Root|Toast\.Action|Toast\.Close|sonner|react-hot-toast|notistack|SnackbarProvider|enqueueSnackbar|closeSnackbar|SnackbarContent|Toaster|toast\.success|toast\.promise|@zag-js\/toast|createToastStore|groupMachine|groupConnect|aria-live|role\s*=\s*["']status)/i.test(text);
}

function toastSnackbarReadinessSetups(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["toastSnackbarSetups"] {
  const rows: ToastSnackbarReadinessReport["toastSnackbarSetups"] = [];
  for (const source of sourceFiles) {
    const providerCount = countMatches(source.text, /(Toast\.Provider|ToastProvider|SnackbarProvider|<Toaster\b|<HotToaster\b|ToasterProps|SnackbarProviderProps|createToastStore|groupMachine)/gi);
    const viewportCount = countMatches(source.text, /(Toast\.Viewport|ToastViewport|viewport|hotkey|label\s*=|anchorOrigin|position\s*=|gutter|offset|getGroupProps|placement)/gi);
    const toastCount = countMatches(source.text, /(Toast\.Root|ToastRoot|toast\(|toast\.success|toast\.error|toast\.loading|toast\.promise|toast\.custom|hotToast\.|enqueueSnackbar|SnackbarContent|data-sonner-toast|ToastBar|@zag-js\/toast|createToastStore|machineProof|getRootProps)/gi);
    const titleDescriptionCount = countMatches(source.text, /(Toast\.Title|ToastTitle|Toast\.Description|ToastDescription|title|description|message|SnackbarMessage)/gi);
    const actionCount = countMatches(source.text, /(Toast\.Action|ToastAction|action\s*=|action:|actionButton|Undo|SnackbarAction|button)/gi);
    const closeCount = countMatches(source.text, /(Toast\.Close|ToastClose|closeButton|closeSnackbar|toast\.dismiss|hotToast\.dismiss|toast\.remove|hotToast\.remove|aria-label\s*=\s*["'][^"']*(close|dismiss)[^"']*)/gi);
    const variantCount = countMatches(source.text, /(success|error|warning|info|loading|promise|custom|richColors|variant\s*=|variant:|ToastTypes|VariantType)/gi);
    const lifecycleCount = countMatches(source.text, /(open\s*=|defaultOpen|onOpenChange|duration|autoHideDuration|dismiss|remove|onDismiss|onAutoClose|persist|preventDuplicate|maxSnack|visibleToasts|toastLimit|queue|pause|resume|useFakeTimers|advanceTimersByTime|setRafTimeout|remainingTime|removeDelay|onStatusChange)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']status|role\s*=\s*["']region|aria-live|aria-atomic|ariaProps|altText|label\s*=|aria-label|focus-visible|hotkey|getByRole|getByLabelText)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.click|userEvent\.keyboard|vi\.useFakeTimers|advanceTimersByTime|getByRole|getByLabelText|toast-snackbar-traces|upload-artifact)/gi);
    const total = providerCount + viewportCount + toastCount + titleDescriptionCount + actionCount + closeCount + variantCount + lifecycleCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = providerCount > 0 && toastCount > 0 && lifecycleCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: toastSnackbarReadinessFramework(source),
      providerCount,
      viewportCount,
      toastCount,
      titleDescriptionCount,
      actionCount,
      closeCount,
      variantCount,
      lifecycleCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `provider ${providerCount}, viewport ${viewportCount}, toast ${toastCount}, title/description ${titleDescriptionCount}, action ${actionCount}, close ${closeCount}, variant ${variantCount}, lifecycle ${lifecycleCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.providerCount + b.toastCount + b.lifecycleCount + b.accessibilityCount - (a.providerCount + a.toastCount + a.lifecycleCount + a.accessibilityCount));
}

function toastSnackbarReadinessFramework(source: ToastSnackbarReadinessSourceFile): ToastSnackbarReadinessReport["toastSnackbarSetups"][number]["framework"] {
  if (/@radix-ui\/react-toast|Toast\.Provider|Toast\.Viewport|Toast\.Root/i.test(source.text)) return "radix-toast";
  if (/sonner|from\s+["']sonner["']|data-sonner-toast|richColors/i.test(source.text)) return "sonner";
  if (/react-hot-toast|hotToast\.|ToastBar|ariaProps/i.test(source.text)) return "react-hot-toast";
  if (/notistack|SnackbarProvider|enqueueSnackbar|closeSnackbar|SnackbarContent/i.test(source.text)) return "notistack";
  if (/@mui\/material|<Snackbar\b|MuiSnackbar|ClickAwayListener/i.test(source.text)) return "mui-snackbar";
  if (/@zag-js\/toast|createToastStore|groupMachine|groupConnect|getRootProps|toast\.machine/i.test(source.text)) return "zag-toast";
  if (/toast|snackbar|aria-live|role\s*=\s*["']status/i.test(source.filePath) || /toast|snackbar|aria-live|role\s*=\s*["']status/i.test(source.text)) return "custom";
  return "unknown";
}

function toastSnackbarReadinessFrameworkSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-toast", pattern: /@radix-ui\/react-toast|Toast\.Provider|Toast\.Viewport|Toast\.Root/i, evidence: "Radix Toast evidence was detected." },
    { signal: "sonner", pattern: /sonner|from\s+["']sonner["']|data-sonner-toast|richColors/i, evidence: "Sonner evidence was detected." },
    { signal: "react-hot-toast", pattern: /react-hot-toast|hotToast\.|ToastBar|ariaProps/i, evidence: "React Hot Toast evidence was detected." },
    { signal: "notistack", pattern: /notistack|SnackbarProvider|enqueueSnackbar|closeSnackbar|SnackbarContent/i, evidence: "Notistack evidence was detected." },
    { signal: "mui-snackbar", pattern: /@mui\/material|<Snackbar\b|MuiSnackbar|ClickAwayListener/i, evidence: "MUI Snackbar evidence was detected." },
    { signal: "zag-toast", pattern: /@zag-js\/toast|createToastStore|groupMachine|groupConnect|getRootProps|toast\.machine/i, evidence: "Zag Toast evidence was detected." },
    { signal: "custom", pattern: /toast|snackbar|aria-live|role\s*=\s*["']status/i, evidence: "custom toast/snackbar evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function toastSnackbarReadinessStructureSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["structureSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "provider", pattern: /Toast\.Provider|ToastProvider|SnackbarProvider|ToasterProps/i, evidence: "provider evidence was detected." },
    { signal: "toaster", pattern: /<Toaster\b|<HotToaster\b|Toaster|useToaster/i, evidence: "toaster evidence was detected." },
    { signal: "viewport", pattern: /Toast\.Viewport|ToastViewport|viewport|anchorOrigin|position\s*=/i, evidence: "viewport/anchor evidence was detected." },
    { signal: "root", pattern: /Toast\.Root|ToastRoot|SnackbarContent|ToastBar|data-sonner-toast/i, evidence: "root/content evidence was detected." },
    { signal: "title", pattern: /Toast\.Title|ToastTitle|title/i, evidence: "title evidence was detected." },
    { signal: "description", pattern: /Toast\.Description|ToastDescription|description|message/i, evidence: "description/message evidence was detected." },
    { signal: "action", pattern: /Toast\.Action|ToastAction|action\s*=|action:|actionButton|SnackbarAction|Undo/i, evidence: "action evidence was detected." },
    { signal: "close", pattern: /Toast\.Close|ToastClose|closeButton|closeSnackbar|toast\.dismiss|hotToast\.dismiss|Dismiss|Close/i, evidence: "close evidence was detected." },
    { signal: "icon", pattern: /icon|ToastIcon|iconVariant|success:\s*\{|error:\s*\{|loading:/i, evidence: "icon evidence was detected." },
    { signal: "portal-container", pattern: /Portal|container|viewport|SnackbarProvider|Toaster|Toast\.Viewport/i, evidence: "portal/container evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function toastSnackbarReadinessVariantSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["variantSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["variantSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "success", pattern: /success|toast\.success|hotToast\.success|variant:\s*["']success/i, evidence: "success variant evidence was detected." },
    { signal: "error", pattern: /error|toast\.error|hotToast\.error|variant:\s*["']error/i, evidence: "error variant evidence was detected." },
    { signal: "warning", pattern: /warning|variant:\s*["']warning/i, evidence: "warning variant evidence was detected." },
    { signal: "info", pattern: /info|variant=\s*["']info|variant:\s*["']info/i, evidence: "info variant evidence was detected." },
    { signal: "loading", pattern: /loading|toast\.loading|hotToast\.loading/i, evidence: "loading variant evidence was detected." },
    { signal: "promise", pattern: /promise|toast\.promise|hotToast\.promise/i, evidence: "promise variant evidence was detected." },
    { signal: "custom", pattern: /custom|toast\.custom|content:\s*\(|Components=\{\{/i, evidence: "custom toast/snackbar evidence was detected." },
    { signal: "rich-colors", pattern: /richColors|rich-colors|data-rich-colors/i, evidence: "rich color evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "variant", "signal");
}

function toastSnackbarReadinessLifecycleSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-state", pattern: /open\s*=|defaultOpen|onOpenChange|visible|data-visible|data-state/i, evidence: "open/visible state evidence was detected." },
    { signal: "duration", pattern: /duration|autoHideDuration/i, evidence: "duration evidence was detected." },
    { signal: "auto-dismiss", pattern: /autoHideDuration|setTimeout|advanceTimersByTime|onAutoClose|duration/i, evidence: "auto-dismiss evidence was detected." },
    { signal: "dismiss", pattern: /dismiss|closeSnackbar|toast\.dismiss|hotToast\.dismiss|onDismiss/i, evidence: "dismiss evidence was detected." },
    { signal: "remove", pattern: /remove|toast\.remove|hotToast\.remove|removeDelay/i, evidence: "remove evidence was detected." },
    { signal: "pause-resume", pattern: /pause|resume|pausedAt|onPause|onResume|hover|windowBlur/i, evidence: "pause/resume evidence was detected." },
    { signal: "queue-limit", pattern: /maxSnack|visibleToasts|toastLimit|TOAST_LIMIT|limit|queue/i, evidence: "queue limit evidence was detected." },
    { signal: "prevent-duplicate", pattern: /preventDuplicate|duplicate/i, evidence: "duplicate prevention evidence was detected." },
    { signal: "persist", pattern: /persist|Infinity|duration\s*:\s*Infinity/i, evidence: "persistent toast/snackbar evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function toastSnackbarReadinessInteractionSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "swipe", pattern: /swipe|onSwipeStart|onSwipeMove|onSwipeCancel|onSwipeEnd|swipeDirection/i, evidence: "swipe evidence was detected." },
    { signal: "keyboard-shortcut", pattern: /hotkey|userEvent\.keyboard|Keyboard|Escape|KeyT/i, evidence: "keyboard shortcut evidence was detected." },
    { signal: "escape-key", pattern: /Escape|onEscapeKeyDown|escape/i, evidence: "Escape evidence was detected." },
    { signal: "click-away", pattern: /ClickAway|clickaway|outside|closeSnackbar|notistack|SnackbarProvider/i, evidence: "click-away evidence was detected." },
    { signal: "action-button", pattern: /action\s*=|action:|Toast\.Action|SnackbarAction|actionButton|Undo|button/i, evidence: "action button evidence was detected." },
    { signal: "close-button", pattern: /closeButton|Toast\.Close|closeSnackbar|aria-label\s*=\s*["'][^"']*(close|dismiss)|getByLabelText/i, evidence: "close button evidence was detected." },
    { signal: "hover-pause", pattern: /hover|pause|resume|onPause|onResume|pausedAt/i, evidence: "hover pause evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function toastSnackbarReadinessAccessibilitySignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-status", pattern: /role\s*=\s*["']status|role:\s*["']status|getByRole\(["']status/i, evidence: "role status evidence was detected." },
    { signal: "aria-live", pattern: /aria-live|ariaProps/i, evidence: "aria-live evidence was detected." },
    { signal: "aria-atomic", pattern: /aria-atomic/i, evidence: "aria-atomic evidence was detected." },
    { signal: "region-label", pattern: /role\s*=\s*["']region|label\s*=|Notifications|getByRole\(["']region/i, evidence: "region label evidence was detected." },
    { signal: "alt-text", pattern: /altText|aria-label|Undo save/i, evidence: "alt text/action description evidence was detected." },
    { signal: "close-label", pattern: /aria-label\s*=\s*["'][^"']*(close|dismiss)|closeButtonAriaLabel|getByLabelText/i, evidence: "close label evidence was detected." },
    { signal: "focus-visible", pattern: /focus-visible|hotkey|tabIndex|keyboard/i, evidence: "focus-visible/keyboard focus evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function toastSnackbarReadinessStylingSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["stylingSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["stylingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "position", pattern: /position|anchorOrigin|top-right|bottom-center|bottom-left|data-x-position|data-y-position/i, evidence: "position evidence was detected." },
    { signal: "offset", pattern: /offset|gutter|margin|gap/i, evidence: "offset/gutter evidence was detected." },
    { signal: "transition", pattern: /TransitionComponent|Transition|animation|animate|data-mounted|data-removed/i, evidence: "transition evidence was detected." },
    { signal: "swipe-direction", pattern: /swipeDirection|swipeDirections|data-swipe-direction/i, evidence: "swipe direction evidence was detected." },
    { signal: "theme", pattern: /theme|richColors|data-sonner-theme|invert|dark|light/i, evidence: "theme evidence was detected." },
    { signal: "unstyled", pattern: /unstyled|unstyled:\s*false|unstyled\s*=|classNames/i, evidence: "unstyled/custom class evidence was detected." },
    { signal: "class-names", pattern: /className|classNames|classes|sx=|style=/i, evidence: "class/style evidence was detected." },
    { signal: "data-state", pattern: /data-state|data-visible|data-sonner-toast|data-mounted|data-removed|data-type/i, evidence: "data-state evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "styling", "signal");
}

function toastSnackbarReadinessMachineSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["machineSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "toast-machine", pattern: /createMachine|@zag-js\/toast|machineProof|toast\.machine/i, evidence: "Zag toast machine evidence was detected." },
    { signal: "group-machine", pattern: /groupMachine|ToastGroupSchema|createMachine\(\{[\s\S]{0,220}overlap/i, evidence: "Zag toast group machine evidence was detected." },
    { signal: "visible-state", pattern: /visible["']?\s*:|state\.hasTag\(["']visible["']\)|tags:\s*\[[^\]]*["']visible["']/i, evidence: "visible state evidence was detected." },
    { signal: "visible-persist-state", pattern: /visible:persist|shouldPersist|duration\)\s*===\s*Infinity/i, evidence: "visible:persist state evidence was detected." },
    { signal: "visible-updating-state", pattern: /visible:updating|waitForNextTick|SHOW[\s\S]{0,80}visible/i, evidence: "visible:updating state evidence was detected." },
    { signal: "dismissing-state", pattern: /dismissing|invokeOnDismiss|DISMISS/i, evidence: "dismissing state evidence was detected." },
    { signal: "unmounted-state", pattern: /unmounted|invokeOnUnmount/i, evidence: "unmounted state evidence was detected." },
    { signal: "computed-z-index", pattern: /zIndex|computed[\s\S]{0,160}zIndex/i, evidence: "computed z-index evidence was detected." },
    { signal: "computed-height", pattern: /heightIndex|heightBefore|computed[\s\S]{0,200}height/i, evidence: "computed height evidence was detected." },
    { signal: "computed-frontmost", pattern: /frontmost|data-first/i, evidence: "frontmost computed evidence was detected." },
    { signal: "computed-should-persist", pattern: /shouldPersist|type\)\s*===\s*["']loading["']|duration\)\s*===\s*Infinity/i, evidence: "shouldPersist computed evidence was detected." },
    { signal: "wait-for-duration", pattern: /waitForDuration|setRafTimeout[\s\S]{0,160}DISMISS|remainingTime/i, evidence: "duration timer effect evidence was detected." },
    { signal: "wait-for-remove-delay", pattern: /waitForRemoveDelay|setRafTimeout[\s\S]{0,160}REMOVE|removeDelay/i, evidence: "remove-delay timer effect evidence was detected." },
    { signal: "wait-for-next-tick", pattern: /waitForNextTick|setRafTimeout[\s\S]{0,160}SHOW|,\s*0\)/i, evidence: "next-tick timer effect evidence was detected." },
    { signal: "track-height", pattern: /trackHeight|syncHeight|getBoundingClientRect\(\)\.height/i, evidence: "height tracking evidence was detected." },
    { signal: "mutation-observer", pattern: /MutationObserver|observer\.observe[\s\S]{0,160}childList/i, evidence: "MutationObserver evidence was detected." },
    { signal: "queue-microtask-measure", pattern: /queueMicrotask[\s\S]{0,220}(measureHeight|initialHeight|getBoundingClientRect)/i, evidence: "microtask height measurement evidence was detected." },
    { signal: "status-change-callback", pattern: /onStatusChange|status:\s*["']visible["']|status:\s*["']dismissing["']|status:\s*["']unmounted["']/i, evidence: "status-change callback evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function toastSnackbarReadinessStoreSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["storeSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["storeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-toast-store", pattern: /createToastStore|ToastStoreProps|withDefaults/i, evidence: "createToastStore evidence was detected." },
    { signal: "priority-sorting", pattern: /sortToastsByPriority|priorities|priorityA|priorityB|getPriorityForType/i, evidence: "priority sorting evidence was detected." },
    { signal: "queue-max", pattern: /attrs\.max|max:\s*24|toastQueue|toasts\.length\s*>=\s*attrs\.max/i, evidence: "queue max evidence was detected." },
    { signal: "toast-create-update", pattern: /create\(|store\.create|update\(|store\.update|publish\(/i, evidence: "create/update toast evidence was detected." },
    { signal: "dismissed-set", pattern: /dismissedToasts|new Set<string>|isDismissed/i, evidence: "dismissed toast set evidence was detected." },
    { signal: "visible-toasts", pattern: /getVisibleToasts|isVisible|visibleToasts/i, evidence: "visible toasts evidence was detected." },
    { signal: "promise-unwrap", pattern: /promise\(|toaster\.promise|promiseToast|unwrap\(|PromiseOptions/i, evidence: "promise toast unwrap evidence was detected." },
    { signal: "http-response-error", pattern: /isHttpResponse|response\.ok|HTTP Error|status:/i, evidence: "HTTP response promise error evidence was detected." },
    { signal: "pause-resume-messages", pattern: /message:\s*["']PAUSE["']|message:\s*["']RESUME["']|pause\(|resume\(/i, evidence: "pause/resume message evidence was detected." },
    { signal: "expand-collapse", pattern: /expand\(|collapse\(|stacked:\s*(true|false)|overlap/i, evidence: "expand/collapse stack evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "store", "signal");
}

function toastSnackbarReadinessGroupSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["groupSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["groupSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "subscribe-to-store", pattern: /subscribeToStore|store\.subscribe|context\.set\(["']toasts["']/i, evidence: "store subscription evidence was detected." },
    { signal: "document-visibility", pattern: /trackDocumentVisibility|visibilitychange|pauseOnPageIdle|visibilityState/i, evidence: "document visibility pause evidence was detected." },
    { signal: "hotkey-focus-region", pattern: /trackHotKeyPress|DOC\.HOTKEY|focusRegionEl|hotkey|KeyT/i, evidence: "hotkey focus region evidence was detected." },
    { signal: "dismissable-branch", pattern: /trackDismissableBranch|dismissableCleanup|clearDismissableBranch/i, evidence: "dismissable branch evidence was detected." },
    { signal: "stack-overlap-states", pattern: /states:\s*\{[\s\S]{0,200}stack[\s\S]{0,260}overlap|REGION\.OVERLAP|REGION\.STACK/i, evidence: "stack/overlap group state evidence was detected." },
    { signal: "pointer-enter-leave", pattern: /REGION\.POINTER_ENTER|REGION\.POINTER_LEAVE|onMouseEnter|onMouseLeave/i, evidence: "pointer enter/leave evidence was detected." },
    { signal: "focus-blur-region", pattern: /REGION\.FOCUS|REGION\.BLUR|onFocus|onBlur|isFocusWithin/i, evidence: "focus/blur region evidence was detected." },
    { signal: "ignore-mouse-timer", pattern: /ignoreMouseTimer|AnimationFrame\.create|ignoreMouseEventsTemporarily/i, evidence: "ignore mouse timer evidence was detected." },
    { signal: "restore-last-focus", pattern: /lastFocusedEl|restoreFocusIfPointerOut|preventScroll:\s*true/i, evidence: "restore last focus evidence was detected." },
    { signal: "region-live-props", pattern: /role:\s*["']region["']|aria-live[\s\S]{0,80}polite|aria-relevant|Notifications/i, evidence: "region live props evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "group", "signal");
}

function toastSnackbarReadinessApiSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["apiSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-props", pattern: /getRootProps|parts\.root\.attrs|dom\.getRootId/i, evidence: "root props API evidence was detected." },
    { signal: "ghost-before-after", pattern: /getGhostBeforeProps|getGhostAfterProps|getGhostBeforeStyle|getGhostAfterStyle/i, evidence: "ghost before/after API evidence was detected." },
    { signal: "title-description-props", pattern: /getTitleProps|getDescriptionProps|dom\.getTitleId|dom\.getDescriptionId/i, evidence: "title/description props API evidence was detected." },
    { signal: "action-trigger", pattern: /getActionTriggerProps|parts\.actionTrigger|action\?\.onClick/i, evidence: "action trigger props evidence was detected." },
    { signal: "close-trigger", pattern: /getCloseTriggerProps|closeTriggerLabel|DISMISS[\s\S]{0,80}user/i, evidence: "close trigger props evidence was detected." },
    { signal: "placement-style", pattern: /getPlacementStyle|getGroupPlacementStyle|data-placement|placement\.split/i, evidence: "placement style evidence was detected." },
    { signal: "toast-data-attrs", pattern: /data-state|data-type|data-mounted|data-paused|data-first|data-sibling|data-stack|data-overlap/i, evidence: "toast data attribute evidence was detected." },
    { signal: "keyboard-dismiss", pattern: /onKeyDown[\s\S]{0,180}Escape[\s\S]{0,180}DISMISS|event\.key\s*==\s*["']Escape["']/i, evidence: "keyboard dismiss evidence was detected." },
    { signal: "group-props", pattern: /getGroupProps|parts\.group\.attrs|dom\.getRegionId|aria-relevant/i, evidence: "group props API evidence was detected." },
    { signal: "group-subscribe", pattern: /groupApi\.subscribe|subscribe\(fn\)|store\.subscribe\(\(\)\s*=>\s*fn/i, evidence: "group subscribe API evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "API", "signal");
}

function toastSnackbarReadinessTestSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["testSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|vi\.useFakeTimers|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|pnpm playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress|pnpm cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "timer-test", pattern: /vi\.useFakeTimers|advanceTimersByTime|fake timers|setTimeout/i, evidence: "timer test evidence was detected." },
    { signal: "role-test", pattern: /getByRole|role\s*=\s*["']status|role\s*=\s*["']region/i, evidence: "role test evidence was detected." },
    { signal: "interaction-test", pattern: /userEvent\.click|userEvent\.keyboard|onClick|onSwipe|closeSnackbar|toast\.dismiss/i, evidence: "interaction test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|toast-snackbar-traces|reports\/toast-snackbar/i, evidence: "artifact upload evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function toastSnackbarReadinessPackageSignals(sourceFiles: ToastSnackbarReadinessSourceFile[]): ToastSnackbarReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ToastSnackbarReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-toast", pattern: /@radix-ui\/react-toast/i, evidence: "@radix-ui/react-toast dependency evidence was detected." },
    { signal: "sonner", pattern: /"sonner"|from\s+["']sonner["']/i, evidence: "sonner dependency evidence was detected." },
    { signal: "react-hot-toast", pattern: /react-hot-toast/i, evidence: "react-hot-toast dependency evidence was detected." },
    { signal: "notistack", pattern: /notistack/i, evidence: "notistack dependency evidence was detected." },
    { signal: "@mui/material", pattern: /@mui\/material|<Snackbar\b/i, evidence: "@mui/material/MUI Snackbar evidence was detected." },
    { signal: "@zag-js/toast", pattern: /@zag-js\/toast/i, evidence: "@zag-js/toast dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable/i, evidence: "@zag-js/dismissable dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']/i, evidence: "React dependency evidence was detected." }
  ];
  return toastSnackbarReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function toastSnackbarReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ToastSnackbarReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/toast-snackbar-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
