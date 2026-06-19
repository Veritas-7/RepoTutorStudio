import { z } from "zod";

export const FloatingPanelReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  floatingPanelSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-floating-panel", "custom-floating-panel", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    titleCount: z.number().int().nonnegative(),
    headerCount: z.number().int().nonnegative(),
    bodyCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    stageTriggerCount: z.number().int().nonnegative(),
    resizeTriggerCount: z.number().int().nonnegative(),
    dragTriggerCount: z.number().int().nonnegative(),
    stackCount: z.number().int().nonnegative(),
    boundaryCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-floating-panel", "custom-floating-panel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "header", "body", "title", "control", "stage-trigger", "resize-trigger", "drag-trigger", "close-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "idle", "dragging", "resizing", "minimized", "maximized", "default-stage", "topmost", "behind", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["size", "position", "css-vars", "strategy-fixed", "strategy-absolute", "fallback-size", "fallback-position", "anchor-position", "boundary-rect", "allow-overflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dragResizeSignals: z.array(z.object({
    signal: z.enum(["drag-start", "resize-start", "pointer-move", "pointer-capture", "grid-size", "clamp-point", "resize-axis", "lock-aspect-ratio", "keyboard-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stackSignals: z.array(z.object({
    signal: z.enum(["panel-stack", "bring-to-front", "z-index", "topmost", "stack-remove", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusAccessibilitySignals: z.array(z.object({
    signal: z.enum(["role-dialog", "aria-labelledby", "aria-controls", "initial-focus", "final-focus", "restore-focus", "escape-close", "data-state", "data-stage", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "computed-state", "watch-props", "top-level-effects", "root-events", "nested-states", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["size", "position", "stage", "last-event-position", "prev-position", "prev-size", "is-topmost", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-maximized", "is-minimized", "is-staged", "has-specified-position", "can-resize", "can-drag", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "track-boundary-rect", "track-panel-stack", "resize-observer-border-box", "stack-subscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-position", "set-size", "anchor-position", "prev-position", "drag-position", "resize-from-drag", "stage-actions", "keyboard-position", "stack-front", "open-close-callbacks", "focus-actions", "toggle-visibility", "style-actions", "reset-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "positioner-id", "content-id", "title-id", "header-id", "trigger-el", "positioner-el", "content-el", "header-el", "boundary-rect", "window-rect", "element-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "set-open", "dragging", "resizing", "position-api", "set-position", "size-api", "set-size", "minimize", "maximize", "restore", "resizable-api", "draggable-api", "trigger-props", "positioner-props", "content-props", "title-props", "header-props", "body-props", "close-trigger-props", "control-props", "stage-trigger-props", "resize-trigger-props", "drag-trigger-props", "dir-prop", "disabled-prop", "type-button", "data-state", "data-dragging", "aria-controls", "role-dialog", "tab-index", "hidden-content", "data-topmost", "data-behind", "data-minimized", "data-maximized", "data-staged", "data-axis", "css-position-vars", "escape-key", "arrow-key-move", "pointer-capture", "pointer-release", "stop-propagation", "left-click-guard", "no-drag-guard", "double-click-stage", "touch-action-none", "cursor-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "resize-test", "stage-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/floating-panel", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/store", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DrawerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  drawerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-drawer", "custom-drawer", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    titleCount: z.number().int().nonnegative(),
    descriptionCount: z.number().int().nonnegative(),
    backdropCount: z.number().int().nonnegative(),
    closeTriggerCount: z.number().int().nonnegative(),
    grabberCount: z.number().int().nonnegative(),
    grabberIndicatorCount: z.number().int().nonnegative(),
    swipeAreaCount: z.number().int().nonnegative(),
    snapPointCount: z.number().int().nonnegative(),
    swipeCount: z.number().int().nonnegative(),
    stackCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    scrollLockCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-drawer", "custom-drawer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "title", "description", "backdrop", "close-trigger", "grabber", "grabber-indicator", "swipe-area", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "closing", "swiping-open", "swipe-area-dragging", "dragging", "trigger-value", "expanded", "nested-open", "nested-swiping", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  snapSignals: z.array(z.object({
    signal: z.enum(["snap-points", "default-snap-point", "snap-point-change", "resolved-snap-points", "snap-index", "open-percentage", "content-size", "viewport-size", "root-font-size", "rem-snap-points", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  swipeSignals: z.array(z.object({
    signal: z.enum(["swipe-direction", "physical-direction", "pointer-down", "pointer-move", "pointer-up", "pointer-cancel", "swipe-area-start", "drag-offset", "swipe-progress", "velocity-threshold", "close-threshold", "prevent-drag-on-scroll", "no-drag", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stackSignals: z.array(z.object({
    signal: z.enum(["drawer-stack", "create-stack", "connect-stack", "register", "unregister", "open-count", "frontmost-height", "swipe-progress", "nested-metrics", "registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusAccessibilitySignals: z.array(z.object({
    signal: z.enum(["role-dialog", "aria-modal", "aria-labelledby", "aria-describedby", "trap-focus", "initial-focus", "final-focus", "restore-focus", "escape-close", "interact-outside", "prevent-scroll", "aria-hidden", "data-state", "data-swipe-direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "refs", "computed-state", "watch-props", "root-events", "open-state", "swipe-states", "implementation-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["trigger-value", "drag-offset", "snap-point", "resolved-active-snap-point", "content-size", "viewport-size", "root-font-size", "swipe-strength", "rendered", "nested-metrics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["drawer-id", "physical-swipe-direction", "resolved-snap-points", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-drawer-stack", "track-dismissable-element", "prevent-scroll", "trap-focus", "hide-content-below", "track-pointer-move", "track-size-measurements", "track-nested-drawer-metrics", "track-swipe-open-pointer-move", "track-exit-animation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-open-controlled", "is-dragging", "should-start-dragging", "should-close-on-swipe", "has-swipe-intent", "should-open-on-swipe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["initial-focus", "rendered-elements", "drag-offset-cleanup", "swipe-open-animation", "trigger-value", "open-close-callbacks", "snap-point", "pointer-start", "drag-offset", "swipe-open-drag-offset", "closest-snap-point", "clear-snap-and-size", "velocity-tracking", "swipe-strength", "snap-back", "registry-swiping", "toggle-visibility", "sync-drawer-stack", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["content-id", "positioner-id", "title-id", "description-id", "trigger-id", "trigger-els", "active-trigger-el", "backdrop-id", "header-id", "grabber-id", "grabber-indicator-id", "close-trigger-id", "swipe-area-id", "content-el", "positioner-el", "title-el", "description-el", "trigger-el", "backdrop-el", "header-el", "grabber-el", "grabber-indicator-el", "close-trigger-el", "swipe-area-el", "content-or-swipe-area-hit-test", "scroll-elements", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "dragging", "set-open", "snap-points", "swipe-direction", "snap-point", "set-snap-point", "open-percentage", "snap-point-index", "content-size-api", "trigger-value-api", "set-trigger-value", "positioner-props", "content-props", "title-props", "description-props", "trigger-props", "backdrop-props", "grabber-props", "grabber-indicator-props", "close-trigger-props", "swipe-area-props", "dir-prop", "hidden-prop", "data-state", "data-swipe-direction", "pointer-events-none", "tab-index", "role-prop", "aria-modal", "aria-labelledby", "aria-describedby", "data-expanded", "data-swiping", "data-dragging", "nested-open", "nested-swiping", "transform-translate3d", "drawer-css-vars", "will-change-transform", "data-ownedby", "data-value", "aria-haspopup-dialog", "aria-expanded", "aria-controls", "data-current", "aria-hidden", "data-disabled", "touch-action-pan", "touch-start", "prevent-default", "left-click-guard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "swipe-test", "snap-test", "stack-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/drawer", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/aria-hidden", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-trap", "@zag-js/remove-scroll", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const HoverCardReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  hoverCardSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-hover-card", "custom-hover-card", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    arrowTipCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    triggerValueCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-hover-card", "custom-hover-card", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "arrow", "arrow-tip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "opening", "closing", "disabled", "trigger-value", "current-placement", "is-pointer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  delaySignals: z.array(z.object({
    signal: z.enum(["open-delay", "close-delay", "wait-open-delay", "wait-close-delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["placement", "current-placement", "reposition", "popper-styles", "get-placement", "placement-side", "strategy", "listeners", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-enter", "pointer-leave", "focus", "blur", "dismissable", "interact-outside", "focus-outside", "touch-ignore", "controlled-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["data-state", "data-placement", "data-side", "data-ownedby", "data-current", "hidden", "tab-index", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "watch-props", "global-events", "state-chart", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["open-context", "current-placement", "is-pointer", "trigger-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["wait-open-delay", "wait-close-delay", "track-positioning", "track-dismissable-element", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["invoke-on-open", "invoke-on-close", "set-is-pointer", "clear-is-pointer", "reposition", "set-trigger-value", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "content-id", "positioner-id", "arrow-id", "trigger-el", "content-el", "positioner-el", "trigger-els", "active-trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "set-open", "trigger-value-api", "set-trigger-value", "reposition-api", "trigger-props", "arrow-props", "arrow-tip-props", "positioner-props", "content-props", "data-placement", "data-side", "data-ownedby", "data-value", "data-current", "data-state", "hidden", "tab-index", "dir-prop", "disabled-guard", "arrow-style", "arrow-tip-style", "positioner-floating-style", "pointer-enter-handler", "pointer-leave-handler", "touch-ignore", "focus-handler", "blur-handler", "trigger-value-switch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "focus-test", "delay-test", "positioning-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/hover-card", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const NavigationMenuReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  navigationMenuSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-navigation-menu", "custom-navigation-menu", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    motionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-navigation-menu", "custom-navigation-menu", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "list", "item", "trigger", "trigger-proxy", "viewport", "viewport-positioner", "viewport-proxy", "content", "link", "indicator", "item-indicator", "arrow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "previous-value", "open", "closed", "selected", "was-selected", "disabled", "viewport-rendered", "viewport-size", "viewport-position", "trigger-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  delaySignals: z.array(z.object({
    signal: z.enum(["open-delay", "close-delay", "open-timeout", "close-timeout", "skip-delay", "clear-timeouts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewportSignals: z.array(z.object({
    signal: z.enum(["viewport-size", "viewport-position", "trigger-rect", "css-vars", "resize-observer", "reposition", "align", "screen-offset", "motion-attr", "exitcomplete", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-enter", "pointer-leave", "trigger-click", "content-focus", "content-blur", "item-navigate", "item-close", "dismissable", "focus-outside", "pointer-down-outside", "close-on-click", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-keys", "home-end", "entry-key", "tab-order", "trigger-proxy", "focus-first", "focus-trigger", "navigate", "rtl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-controls", "aria-expanded", "aria-current", "aria-owns", "aria-labelledby", "aria-hidden", "hidden", "data-state", "data-orientation", "data-value", "data-ownedby", "data-motion", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["setup-machine", "default-props", "bindable-context", "computed-open", "watch-value", "refs", "entry-exit-effects", "root-events", "state-chart", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value", "previous-value", "viewport-size", "viewport-rendered", "viewport-position", "content-node", "trigger-rect", "trigger-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-document-resize", "track-resize-observer", "content-resize-observer", "dismissable-content", "exitcomplete-listener", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "timeout-actions", "select-deselect-value", "sync-content-node", "set-trigger-node", "sync-motion-attribute", "focus-actions", "tab-order-actions", "cleanup-observers", "viewport-position", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "trigger-id", "trigger-proxy-id", "content-id", "viewport-id", "list-id", "item-id", "root-el", "viewport-el", "trigger-el", "trigger-proxy-el", "list-el", "content-el", "content-els", "tabbable-els", "trigger-els", "link-els", "elements", "resize-observer", "motion-attr", "focus-first", "tab-order", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "value-api", "orientation", "viewport-rendered-api", "viewport-node-api", "set-value", "reposition-api", "root-props", "list-props", "item-props", "indicator-props", "item-indicator-props", "arrow-props", "trigger-props", "trigger-proxy-props", "viewport-proxy-props", "link-props", "content-props", "viewport-positioner-props", "viewport-props", "item-state-api", "dir-prop", "root-aria-label", "data-orientation", "layout-css-vars", "data-value", "data-state", "data-disabled", "aria-hidden", "hidden-prop", "indicator-position-absolute", "transition-none", "data-uid", "data-trigger-proxy-id", "aria-controls", "aria-expanded", "pointer-enter-handler", "pointer-leave-handler", "mouse-pointer-guard", "disable-hover-guard", "disable-click-guard", "key-navigation", "prevent-default", "stop-propagation", "trigger-proxy-focus", "visually-hidden-style", "aria-owns", "aria-current-page", "custom-link-select", "close-on-click", "meta-key-guard", "aria-labelledby", "viewport-pointer-events-none", "data-align", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "focus-test", "delay-test", "viewport-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/navigation-menu", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PresenceReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  presenceSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-presence", "headless-transition", "custom-presence", "unknown"]),
    presentCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    mountCount: z.number().int().nonnegative(),
    unmountCount: z.number().int().nonnegative(),
    animationCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    visibilityCount: z.number().int().nonnegative(),
    immediateCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    cleanupCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-presence", "headless-transition", "custom-presence", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["mounted", "unmount-suspended", "unmounted", "present", "initial", "skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["mount", "unmount", "presence-changed", "set-node", "cleanup-node", "exit-complete", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  animationSignals: z.array(z.object({
    signal: z.enum(["animation-start", "animation-end", "animation-cancel", "animation-name", "animation-duration", "animation-fill-mode", "prev-animation-name", "unmount-animation-name", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  visibilitySignals: z.array(z.object({
    signal: z.enum(["document-hidden", "visibility-state", "request-animation-frame", "immediate", "hidden-skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "initial-state", "refs", "bindable-context", "exit-cleanup", "watch-present", "node-presence-events", "state-transitions", "track-animation-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["unmount-animation-name", "prev-animation-name", "present-context", "initial-context", "node-ref", "styles-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-animation-events", "animation-start-listener", "animation-end-listener", "animation-cancel-listener", "animation-fill-mode", "cleanup-listeners", "next-tick-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-initial", "invoke-exit-complete", "setup-node", "cleanup-node", "sync-presence", "set-prev-animation-name", "clear-prev-animation-name", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["set-node", "unmount", "present-api", "skip-api", "on-exit-complete", "node-null-guard", "node-set-event", "unmount-event", "state-matches-present", "initial-skip", "props-create-props", "present-prop", "on-exit-complete-prop", "immediate-prop", "presence-api-interface", "skip-boolean", "present-boolean", "set-node-nullable", "unmount-void-api", "presence-service-type", "presence-machine-type", "present-coerce-boolean", "initial-state-present-prop", "exitcomplete-bubbles-false", "node-dispatch-event", "same-node-guard", "computed-style-cache", "visibility-hidden-unmount", "raf-presence-check", "animation-name-none", "display-none-unmount", "zero-duration-unmount", "unmount-suspend-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["transition-context", "nesting-context", "tree-states", "should-forward-ref", "register-unregister", "has-children", "render-strategy-unmount-hidden", "transition-chains", "wait-promises", "server-handoff", "skip-initial-transition", "immediate-appear", "use-transition-hook", "transition-data-attributes", "class-map-enter-leave", "open-closed-provider", "state-opening-closing", "show-from-open-closed", "missing-show-error", "initial-change-tracking", "before-enter-leave", "after-enter-leave", "internal-transition-child", "transition-object-assign", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "animation-test", "visibility-test", "exitcomplete-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/presence", "@zag-js/react", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@headlessui/react", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MenuReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  menuSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-menu", "custom-menu", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    contextTriggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    optionItemCount: z.number().int().nonnegative(),
    groupCount: z.number().int().nonnegative(),
    separatorCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    highlightCount: z.number().int().nonnegative(),
    typeaheadCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    submenuCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-menu", "custom-menu", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  anatomySignals: z.array(z.object({
    signal: z.enum(["trigger", "context-trigger", "positioner", "content", "item", "option-item", "item-group", "item-group-label", "separator", "indicator", "item-indicator", "item-text", "arrow", "arrow-tip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "open", "closed", "opening", "closing", "contextmenu", "trigger-value", "controlled-open", "default-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  highlightSignals: z.array(z.object({
    signal: z.enum(["highlighted-value", "last-highlighted", "highlighted-set", "highlighted-restore", "highlighted-suggest", "item-state", "option-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  typeaheadSignals: z.array(z.object({
    signal: z.enum(["typeahead", "typeahead-state", "matched-item", "printable-key", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["positioning", "current-placement", "placement-side", "popper-styles", "reposition", "anchor-point", "anchor-rect", "context-menu-position", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["trigger-click", "trigger-focus", "pointer-move", "pointer-leave", "item-click", "dismissable", "interact-outside", "focus-outside", "escape-key", "option-state", "submenu-routing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-keys", "home-end", "enter-space", "tab-escape", "navigate", "focus-menu", "focus-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-menu", "menuitem", "menuitemcheckbox", "aria-haspopup", "aria-controls", "aria-expanded", "aria-activedescendant", "aria-labelledby", "aria-checked", "data-state", "data-placement", "data-side", "data-ownedby", "data-value", "data-highlighted", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "refs", "computed-state", "watch-props", "root-events", "delayed-states", "open-state", "implementation-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["highlighted-value", "last-highlighted-value", "current-placement", "intent-polygon", "anchor-point", "is-submenu", "trigger-value", "pointer-routing-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-rtl", "is-typing-ahead", "highlighted-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["wait-open-delay", "wait-close-delay", "wait-long-press", "track-focus-visible", "track-positioning", "track-interact-outside", "track-pointer-move", "scroll-highlighted-item", "observe-attributes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["close-on-select", "is-trigger-item", "is-trigger-item-highlighted", "is-submenu", "is-pointer-routing-locked", "is-highlighted-item-editable", "is-open-controlled", "arrow-event", "open-autofocus-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-anchor-point", "set-submenu-placement", "reposition", "set-option-state", "click-highlighted-item", "intent-polygon", "parent-routing-lock", "highlight-navigation", "selection-callback", "focus-actions", "typeahead-match", "parent-child-menu", "submenu-actions", "open-close-callbacks", "toggle-visibility", "trigger-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "context-trigger-id", "content-id", "arrow-id", "positioner-id", "group-id", "item-id", "group-label-id", "content-el", "positioner-el", "trigger-el", "item-el", "arrow-el", "context-trigger-el", "trigger-els", "context-trigger-els", "elements-query", "typeahead-key", "selection-event", "menu-tree", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "highlighted-value", "trigger-value", "set-open", "set-trigger-value", "set-highlighted-value", "set-parent", "set-child", "reposition", "add-item-listener", "context-trigger-props", "trigger-item-props", "trigger-props", "indicator-props", "positioner-props", "arrow-props", "arrow-tip-props", "content-props", "separator-props", "item-state", "item-props", "option-item-state", "option-item-props", "item-indicator-props", "item-text-props", "item-group-label-props", "item-group-props", "dir-prop", "data-placement", "data-side", "type-button", "data-ownedby", "data-value", "data-current", "data-uid", "aria-haspopup-menu-dialog", "aria-controls", "data-controls", "aria-expanded", "pointer-move-handler", "pointer-leave-handler", "disabled-target-guard", "context-menu-guard", "prevent-default", "default-prevented-guard", "trigger-blur-handler", "trigger-focus-handler", "key-map-arrow", "positioner-floating-style", "arrow-style", "arrow-tip-style", "content-role", "content-tabindex", "aria-activedescendant", "aria-labelledby", "valid-tab-guard", "typeahead-printable-guard", "separator-role", "option-data-type", "aria-checked", "item-indicator-hidden", "item-group-role", "download-guard", "new-tab-guard", "drag-link-prevent-default", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "typeahead-test", "context-menu-test", "submenu-test", "option-test", "positioning-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/menu", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const TooltipReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tooltipSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-tooltip", "custom-tooltip", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    arrowCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    storeCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-tooltip", "custom-tooltip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  anatomySignals: z.array(z.object({
    signal: z.enum(["trigger", "positioner", "content", "arrow", "arrow-tip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "opening", "closing", "controlled-open", "disabled", "trigger-value", "pointer-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  delaySignals: z.array(z.object({
    signal: z.enum(["open-delay", "close-delay", "instant-open", "wait-open-delay", "wait-close-delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["positioning", "placement", "current-placement", "placement-side", "popper-styles", "reposition", "anchor-trigger", "get-placement", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storeSignals: z.array(z.object({
    signal: z.enum(["tooltip-store", "global-id", "previous-id", "instant", "store-subscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["trigger-click", "trigger-focus", "trigger-blur", "pointer-move", "pointer-leave", "pointer-down", "content-pointer", "escape-key", "scroll-close", "pointerlock-close", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-tooltip", "aria-describedby", "aria-label", "data-state", "data-placement", "data-side", "data-ownedby", "data-value", "data-expanded", "data-current", "data-instant", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "initial-state", "default-props", "top-level-effects", "bindable-context", "watch-props", "global-events", "state-chart", "guard-logic", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["current-placement", "pointer-move-opened", "trigger-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-focus-visible", "track-store", "track-scroll", "track-pointerlock-change", "track-positioning", "track-escape-key", "wait-open-delay", "wait-close-delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-global-id", "clear-global-id", "invoke-on-open", "invoke-on-close", "close-if-disabled", "reposition", "reposition-immediate", "toggle-visibility", "set-pointer-move-opened", "clear-pointer-move-opened", "set-trigger-value", "immediate-reopen", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["trigger-id", "content-id", "arrow-id", "positioner-id", "trigger-el", "content-el", "positioner-el", "arrow-el", "trigger-els", "active-trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["open", "set-open", "trigger-value-api", "set-trigger-value", "reposition-api", "trigger-props", "arrow-props", "arrow-tip-props", "positioner-props", "content-props", "aria-describedby", "role-tooltip", "data-state", "data-placement", "data-side", "pointer-events", "data-ownedby", "data-value", "data-current", "dir-prop", "data-expanded", "close-on-click-guard", "focus-visible-guard", "related-trigger-guard", "left-click-guard", "close-on-pointerdown-guard", "touch-pointer-ignore", "pointer-over-handler", "pointer-cancel-handler", "arrow-style", "arrow-tip-style", "positioner-floating-style", "hidden-prop", "data-instant", "aria-label-role-guard", "content-id-aria-label-guard", "content-pointer-enter", "content-pointer-leave", "interactive-pointer-events", "default-prevented-guard", "disabled-guard", "store-current-id", "store-prev-id", "current-placement-side", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "fake-timers", "pointer-test", "focus-test", "delay-test", "scroll-test", "escape-test", "positioning-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/tooltip", "@zag-js/react", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/dom-query", "@zag-js/anatomy", "@zag-js/core", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export type FloatingPanelReadinessReport = z.infer<typeof FloatingPanelReadinessReportSchema>;
export type DrawerReadinessReport = z.infer<typeof DrawerReadinessReportSchema>;
export type HoverCardReadinessReport = z.infer<typeof HoverCardReadinessReportSchema>;
export type NavigationMenuReadinessReport = z.infer<typeof NavigationMenuReadinessReportSchema>;
export type PresenceReadinessReport = z.infer<typeof PresenceReadinessReportSchema>;
export type MenuReadinessReport = z.infer<typeof MenuReadinessReportSchema>;
export type TooltipReadinessReport = z.infer<typeof TooltipReadinessReportSchema>;
